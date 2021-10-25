const github = require("@actions/github");
const core = require("@actions/core");
const Axios = require("axios");
const path = require("path");
const ejs = require("ejs");

const user = core.getInput("username");
const pass = core.getInput("password");
const pat = core.getInput("pat");

try {
  if (!user || !pass) throw new Error("Username or password missing");
  if (!pat) throw new Error("Github PAT missing");

  const kit = github.getOctokit(pat);

  fetchToken(user, pass).then(async (token) => {
    const data = await fetchData(token);

    const rawPoops = data.poops;
    const poops = {
      max: 0,
    };

    for (let i = 0; i < rawPoops.length; i++) {
      const poop = rawPoops[i];
      const hour = new Date(poop.created_at).getHours();
      if (!poops[hour]) poops[hour] = 1;
      else poops[hour] += 1;

      if (!poops.max || poops[hour] > poops.max) {
        poops.max = poops[hour];
      }
    }

    const html = await ejs.renderFile(path.join(__dirname, "template.ejs"), { poops });

    const original = await kit.rest.repos
      .getContent({
        ...github.context.repo,
        path: "poop-metrics.svg",
      })
      .catch(() => {});

    await kit.rest.repos.createOrUpdateFileContents({
      ...github.context.repo,
      path: "poop-metrics.svg",
      sha: original ? original.data.sha : undefined,
      message: "Update Poop Metrics",
      committer: {
        name: "github-actions",
        email: "actions@github.com",
      },
      content: Buffer.from(html).toString("base64"),
    });
  });
} catch (err) {
  core.setFailed(err);
}

async function fetchToken(username, password) {
  const {
    data: { device },
  } = await Axios.post("https://api.poopmap.net/api/v1/devices");

  await Axios.post(
    "https://api.poopmap.net/api/v1/sessions",
    {
      user: { username, password },
    },
    {
      headers: { Authorization: `Token token=${device.token}` },
    }
  );

  const {
    data: { url },
  } = await Axios.post(
    "https://api.poopmap.net/api/v1/public_links",
    {},
    {
      headers: { Authorization: `Token token=${device.token}` },
    }
  );

  const token = url.split("=").pop();
  return token;
}

async function fetchData(token) {
  const { data } = await Axios.get(`https://api.poopmap.net/api/v1/public_links/${token}`);

  return data;
}
