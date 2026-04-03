# Reusable GitHub Actions Workflows

Reusable [GitHub Actions workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) for [IndrajeetPatil](https://github.com/IndrajeetPatil) repositories.

All external actions are **pinned to commit SHAs** to prevent supply chain attacks. R package workflows are **check-only** — they validate code but never modify or auto-commit changes.

## Usage

Reference a reusable workflow from your repository:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  style:
    uses: IndrajeetPatil/workflows/.github/workflows/style.yaml@main
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
| [`build-presentation-r.yaml`](.github/workflows/build-presentation-r.yaml) | Build & deploy R Quarto RevealJS presentation to GitHub Pages | — |
| [`check-link-rot.yaml`](.github/workflows/check-link-rot.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) | — |
| [`update-extensions.yaml`](.github/workflows/update-extensions.yaml) | Auto-update Quarto extensions via PR | — |

## R Package Workflows

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`R-CMD-check.yaml`](.github/workflows/R-CMD-check.yaml) | R CMD check across multiple OS/R versions | `error-on`, `extra-packages` |
| [`R-CMD-check-hard.yaml`](.github/workflows/R-CMD-check-hard.yaml) | R CMD check with hard (Imports) dependencies only | `extra-packages` |
| [`check-extra.yaml`](.github/workflows/check-extra.yaml) | Six parallel extra checks: no-warnings, random test order, spelling, link rot, HTML5, README render | `extra-packages`, `http-user-agent` |
| [`lint.yaml`](.github/workflows/lint.yaml) | Full package lint (always) + changed-files lint (PR only), both with `{lintr}` | — |
| [`pkgdown.yaml`](.github/workflows/pkgdown.yaml) | Build & deploy pkgdown site; use `no-suggests: true` for a hard-deps-only CI check | `no-suggests`, `pkgdown-source` |
| [`pre-commit.yaml`](.github/workflows/pre-commit.yaml) | Run pre-commit hooks; fails if hooks would modify files | — |
| [`style.yaml`](.github/workflows/style.yaml) | Check code style with `{styler}`; fails if any file needs reformatting | — |
| [`test-coverage.yaml`](.github/workflows/test-coverage.yaml) | Two parallel coverage jobs: unit tests (enforces 100%) + examples/vignettes (configurable threshold) | `runner-os`, `threshold` |

## License

[MIT](LICENSE)
