# Reusable GitHub Actions Workflows

Reusable [GitHub Actions workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) for [IndrajeetPatil](https://github.com/IndrajeetPatil) repositories. Inspired by [easystats/workflows](https://github.com/easystats/workflows).

All external actions are **pinned to commit SHAs** to prevent supply chain attacks.

## Usage

Reference a reusable workflow from your repository:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  check-spelling:
    uses: IndrajeetPatil/workflows/.github/workflows/check-spelling.yaml@main
```

For workflows with inputs:

```yaml
jobs:
  R-CMD-check:
    uses: IndrajeetPatil/workflows/.github/workflows/R-CMD-check.yaml@main
    with:
      error-on: '"note"'
```

## Presentation Workflows

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`build-presentation-python.yaml`](.github/workflows/build-presentation-python.yaml) | Build & deploy Python/UV Quarto RevealJS presentation to GitHub Pages | `extra-render-args` |
| [`build-presentation-r.yaml`](.github/workflows/build-presentation-r.yaml) | Build & deploy R Quarto RevealJS presentation to GitHub Pages | `runner-os` |
| [`check-link-rot.yaml`](.github/workflows/check-link-rot.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) | — |
| [`update-extensions.yaml`](.github/workflows/update-extensions.yaml) | Auto-update Quarto extensions via PR | — |

## R Package Workflows

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`R-CMD-check.yaml`](.github/workflows/R-CMD-check.yaml) | R CMD check across multiple OS/R versions | `error-on`, `extra-packages` |
| [`R-CMD-check-hard.yaml`](.github/workflows/R-CMD-check-hard.yaml) | R CMD check with hard (Imports) dependencies only | `extra-packages` |
| [`check-no-warnings.yaml`](.github/workflows/check-no-warnings.yaml) | Run examples, tests, vignettes with warnings as errors | — |
| [`check-random-test-order.yaml`](.github/workflows/check-random-test-order.yaml) | Validate tests are self-contained by randomizing execution order | — |
| [`check-readme.yaml`](.github/workflows/check-readme.yaml) | Render and validate README.Rmd | `extra-packages`, `http-user-agent` |
| [`check-spelling.yaml`](.github/workflows/check-spelling.yaml) | Spelling validation with `{spelling}` package | — |
| [`check-styling.yaml`](.github/workflows/check-styling.yaml) | Code formatting check with [Air](https://posit-dev.github.io/air/) | — |
| [`html-5-check.yaml`](.github/workflows/html-5-check.yaml) | HTML5 validation of R documentation pages | — |
| [`lint.yaml`](.github/workflows/lint.yaml) | Full package linting with `{lintr}` | — |
| [`lint-changed-files.yaml`](.github/workflows/lint-changed-files.yaml) | Lint only files changed in a PR | — |
| [`pkgdown.yaml`](.github/workflows/pkgdown.yaml) | Build & deploy pkgdown documentation site | — |
| [`pkgdown-no-suggests.yaml`](.github/workflows/pkgdown-no-suggests.yaml) | Build pkgdown site without Suggests dependencies | `pkgdown-source` |
| [`pre-commit.yaml`](.github/workflows/pre-commit.yaml) | Run pre-commit hooks and auto-commit fixes | — |
| [`styler.yaml`](.github/workflows/styler.yaml) | Auto-format R code with `{styler}` and auto-commit | — |
| [`test-coverage.yaml`](.github/workflows/test-coverage.yaml) | Code coverage via unit tests with `{covr}` | `runner-os` |
| [`test-coverage-examples.yaml`](.github/workflows/test-coverage-examples.yaml) | Code coverage via examples and vignettes | `threshold` |

## License

[CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)
