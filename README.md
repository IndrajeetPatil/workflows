# Reusable GitHub Actions Workflows

Reusable [GitHub Actions workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) for [IndrajeetPatil](https://github.com/IndrajeetPatil) repositories.

All external actions are **pinned to commit SHAs** to prevent supply chain attacks. Most R package workflows are **check-only** — they validate code but never modify or auto-commit changes. Some workflows do perform deployment or release actions, including [`pkgdown.yaml`](.github/workflows/pkgdown.yaml), which deploys the pkgdown site to `gh-pages`, and [`submit-cran.yaml`](.github/workflows/submit-cran.yaml), which builds a source tarball, creates a GitHub Release, and submits the package to CRAN.

## Usage

Reference a reusable workflow from your repository:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  format:
    uses: IndrajeetPatil/workflows/.github/workflows/check-formatting.yaml@main
```

For workflows with inputs:

```yaml
jobs:
  R-CMD-check:
    uses: IndrajeetPatil/workflows/.github/workflows/R-CMD-check.yaml@main
    with:
      error-on: '"note"'
```

## Python Packages

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`python-docs.yaml`](.github/workflows/python-docs.yaml) | Build & deploy Python package documentation to GitHub Pages | — |
| [`python-qa.yaml`](.github/workflows/python-qa.yaml) | Code Quality checks, including build, test coverage, and README render | — |
| [`python-release.yaml`](.github/workflows/python-release.yaml) | Create GitHub Release and Publish to PyPI | — |
| [`python-test.yaml`](.github/workflows/python-test.yaml) | Run Tests across multiple OS and Python versions | — |

## R Packages

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`check-docs.yaml`](.github/workflows/check-docs.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) and spelling using [typos](https://github.com/crate-ci/typos) | — |
| [`check-formatting.yaml`](.github/workflows/check-formatting.yaml) | Check and suggest code formatting using [air](https://github.com/posit-dev/air) | — |
| [`R-CMD-check.yaml`](.github/workflows/R-CMD-check.yaml) | R CMD check across multiple OS/R versions | `error-on`, `extra-packages` |
| [`R-CMD-check-hard.yaml`](.github/workflows/R-CMD-check-hard.yaml) | R CMD check with hard (Imports) dependencies only | `extra-packages` |
| [`check-extra.yaml`](.github/workflows/check-extra.yaml) | Parallel extra checks: no-warnings, random test order, README render | `extra-packages` |
| [`lint.yaml`](.github/workflows/lint.yaml) | Package linting with `{lintr}` | — |
| [`pkgdown.yaml`](.github/workflows/pkgdown.yaml) | Build & deploy pkgdown site; use `no-suggests: true` for a hard-deps-only CI check | `no-suggests` |
| [`pre-commit.yaml`](.github/workflows/pre-commit.yaml) | Run pre-commit hooks; fails if hooks would modify files | — |
| [`submit-cran.yaml`](.github/workflows/submit-cran.yaml) | Build source tarball, create GitHub Release, and submit package to CRAN | `extra-packages` |
| [`test-coverage.yaml`](.github/workflows/test-coverage.yaml) | Two parallel coverage jobs: unit tests (enforces 100%) + examples/vignettes (enforces 100%) | — |

## Presentations

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`build-presentation-python.yaml`](.github/workflows/build-presentation-python.yaml) | Build & deploy Python/UV Quarto RevealJS presentation to GitHub Pages | — |
| [`build-presentation-r.yaml`](.github/workflows/build-presentation-r.yaml) | Build & deploy R Quarto RevealJS presentation to GitHub Pages | — |

## Generic

Generic workflows are language-agnostic and provide utility across diverse types of projects, ensuring high code quality and robust documentation regardless of the underlying tech stack.

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`check-link-rot.yaml`](.github/workflows/check-link-rot.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) | — |

## License

[MIT](LICENSE)
