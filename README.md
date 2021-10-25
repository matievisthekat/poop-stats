# :poop: Poop Stats!

View your pooping statistics (from [PoopMap](https://poopmap.net)) in your README!

#### Example
```yaml
name: PoopStats
on:
  # Schedule updates (each hour)
  schedule: 
    - cron: "0 * * * *"
  push: 
    branches: 
      - master
jobs:
  poop-stats:
    runs-on: ubuntu-latest
    steps:
      - uses: matievisthekat/poop-stats@master
        with:
          # A GitHub Personal Access Token that allows the action the access the current repo
          pat: ${{ secrets.POOP_TOKEN }}
          
          # Your PoopMap username
          username: "poop-face-bob"
          
          # Your PoopMap password
          password: ${{ secrets.POOP_PASSWORD }}
```

This will generate a `poop-metrics.svg` file in the root directory of the repo.

You can then add the SVG to your repo like this:
```md
<!-- If you're using "master" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/master/poop-metrics.svg)
<!-- If you're using "main" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/main/poop-metrics.svg)
```

#### Note
Credit to [lowlighter](https://github.com/lowlighter) for the graph style
