# Workflow catalogue

These reusable workflows run from caller repositories owned by
`IndrajeetPatil`. See [usage](using-workflows.md) for the call pattern and
permissions.

## Python Packages

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`python-docs.yaml`](../.github/workflows/python-docs.yaml) | Build & deploy Python package documentation to GitHub Pages | — |
| [`python-qa.yaml`](../.github/workflows/python-qa.yaml) | Code Quality checks, including build and test coverage | — |
| [`python-test.yaml`](../.github/workflows/python-test.yaml) | Run Tests across multiple OS and Python versions | — |

The repository's internal zizmor audit enables ANSI color in captured CI logs
with job-level `FORCE_COLOR=1` and `CLICOLOR_FORCE=1`, while retaining its
GitHub annotation format. In the reusable Python and presentation workflows,
color is strictly enabled via command-line flags on `uv` and `pytest`
rather than job-level variables. This prevents ANSI escapes from bleeding into
caller-supplied content such as `prek` hooks, Make targets, or captured
presentation cells. `prek` itself remains colorized via the `prek-action` defaults.

## R Packages

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`check-docs.yaml`](../.github/workflows/check-docs.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) and spelling using [typos](https://github.com/crate-ci/typos) | — |
| [`check-formatting.yaml`](../.github/workflows/check-formatting.yaml) | Check and suggest code formatting using [air](https://github.com/posit-dev/air) | — |
| [`R-CMD-check.yaml`](../.github/workflows/R-CMD-check.yaml) | R CMD check across multiple operating systems plus current, devel, and previous R releases; use `hard: true` for a hard-deps-only CI check (PR-only) | `hard` |
| [`check-extra.yaml`](../.github/workflows/check-extra.yaml) | Parallel extra checks: no-warnings, random test order, README render | `extra-packages` |
| [`lint.yaml`](../.github/workflows/lint.yaml) | Package linting with `{lintr}` | — |
| [`pkgdown.yaml`](../.github/workflows/pkgdown.yaml) | Build & deploy a pkgdown site with verified canonical URLs; use `no-suggests: true` for a hard-deps-only CI check | `no-suggests` |
| [`pre-commit.yaml`](../.github/workflows/pre-commit.yaml) | Run pre-commit hooks; fails if hooks would modify files | — |
| [`seo-files.yaml`](../.github/workflows/seo-files.yaml) | Deploy SEO and AI-discovery files (`robots.txt`, `.well-known/llms.txt`) to `gh-pages` after pkgdown build | `package-name` |
| [`submit-cran.yaml`](../.github/workflows/submit-cran.yaml) | On a release branch, build and submit to CRAN without releasing; on the default branch after merge, rebuild and tag the submitted PR head and create a GitHub Release using the matching `NEWS.md` section without resubmitting | `extra-packages` |
| [`test-coverage.yaml`](../.github/workflows/test-coverage.yaml) | Two parallel coverage jobs: unit tests (enforces 100%) + examples/vignettes (enforces 100%) | — |

See [hard-dependency checks](r-packages.md#hard-dependency-checks) for checking
tools and isolated caches, and [CRAN releases](r-packages.md#cran-releases) for
the release boundary.

## Presentations

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`build-presentation-python.yaml`](../.github/workflows/build-presentation-python.yaml) | Build & deploy Python/UV Quarto RevealJS presentation to GitHub Pages | — |
| [`build-presentation-r.yaml`](../.github/workflows/build-presentation-r.yaml) | Build & deploy R Quarto RevealJS presentation to GitHub Pages | — |

## Frontends

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`frontend-qa.yaml`](../.github/workflows/frontend-qa.yaml) | Standardised quality gate for [Vite+](https://viteplus.dev) frontends: spelling, Markdown, workflow lint and audit, secret scan, prek hooks, format/lint/types, unit tests, production build, dependency audit and link check | `working-directory`, `test`, `python`, `extra-command`, `browser-command`, `timeout-minutes` |

See the [frontend QA guide](frontend-qa.md) for its gates, hooks, and optional commands.

## Generic

Generic workflows are language-agnostic and provide utility across diverse
types of projects, ensuring high code quality and robust documentation
regardless of the underlying tech stack.

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`check-link-rot.yaml`](../.github/workflows/check-link-rot.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) | — |
| [`conventional-commits.yaml`](../.github/workflows/conventional-commits.yaml) | Check every pull-request commit and the pull-request title (the default squash subject) against [Conventional Commits](https://www.conventionalcommits.org) | `extra-types`, `strict` |

Trigger `conventional-commits.yaml` on the `edited` pull-request activity as
well, so a corrected title is re-checked. Keep it in its own caller workflow:
an `edited` trigger on a heavier workflow would re-run all of it for a title
change.

```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, edited]

permissions:
  contents: read

concurrency:
  group: conventional-commits-${{ github.ref }}
  cancel-in-progress: true

jobs:
  conventional-commits:
    uses: IndrajeetPatil/workflows/.github/workflows/conventional-commits.yaml@main
```
