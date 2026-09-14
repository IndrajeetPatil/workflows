# Reusable GitHub Actions Workflows

> [!WARNING]
> These workflows are intended solely for use by
> [@IndrajeetPatil](https://github.com/IndrajeetPatil) repositories. They are
> tuned to specific personal conventions and are not designed for general use.
> Workflows will explicitly fail if called from a repository not owned by
> `IndrajeetPatil`.

Reusable [GitHub Actions workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) for [IndrajeetPatil](https://github.com/IndrajeetPatil) repositories.

All external actions are **pinned to commit SHAs** to prevent supply chain
attacks. The workflows default to read-only token access, disable persisted
checkout credentials except for the one intentional push job, and bound every
job with a timeout. Write credentials are isolated in deployment and release
jobs rather than exposed while repository code and dependencies are built or
tested.

The repository's only standalone workflow is
[`security.yml`](.github/workflows/security.yml). It runs on pull requests to
`main`, scans the complete Git history with Gitleaks, and audits every workflow
with zizmor in pedantic mode so future changes cannot silently weaken these
controls.

Most R package workflows are **check-only** — they validate code but never
modify or auto-commit changes. Some workflows do perform deployment or release
actions, including [`pkgdown.yaml`](.github/workflows/pkgdown.yaml), which
deploys the pkgdown site to `gh-pages`, and
[`submit-cran.yaml`](.github/workflows/submit-cran.yaml), which builds and
submits a source tarball from a release branch and creates a GitHub Release only
when rerun from the default branch after merge, in a separate least-privilege
job. The post-merge run rebuilds and tags the original submitted pull-request
head so unrelated changes merged during CRAN review cannot enter the release.

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
    uses: IndrajeetPatil/workflows/.github/workflows/check-formatting.yaml@<full-commit-sha>
```

For workflows with inputs:

```yaml
jobs:
  R-CMD-check:
    uses: IndrajeetPatil/workflows/.github/workflows/R-CMD-check.yaml@<full-commit-sha>
    with:
      hard: true
```

Pin reusable workflows to a full commit SHA. A branch such as `@main` is
convenient but mutable; immutable references prevent an upstream change from
silently altering a caller's CI. Callers must also grant only the permissions
required by the selected workflow. GitHub can maintain or reduce permissions
through a reusable-workflow chain, but a called workflow cannot elevate scopes
that its caller did not grant.

Avoid `secrets: inherit` when a workflow needs only one named secret. Pass that
secret explicitly so unrelated repository or organization secrets are not made
available to the called workflow.

## Python Packages

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`python-docs.yaml`](.github/workflows/python-docs.yaml) | Build & deploy Python package documentation to GitHub Pages | — |
| [`python-qa.yaml`](.github/workflows/python-qa.yaml) | Code Quality checks, including build, test coverage, and README render | — |
| [`python-test.yaml`](.github/workflows/python-test.yaml) | Run Tests across multiple OS and Python versions | — |

## R Packages

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`check-docs.yaml`](.github/workflows/check-docs.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) and spelling using [typos](https://github.com/crate-ci/typos) | — |
| [`check-formatting.yaml`](.github/workflows/check-formatting.yaml) | Check and suggest code formatting using [air](https://github.com/posit-dev/air) | — |
| [`R-CMD-check.yaml`](.github/workflows/R-CMD-check.yaml) | R CMD check across multiple operating systems plus current, devel, and previous R releases; use `hard: true` for a hard-deps-only CI check (PR-only) | `extra-packages`, `hard` |
| [`check-extra.yaml`](.github/workflows/check-extra.yaml) | Parallel extra checks: no-warnings, random test order, README render | `extra-packages` |
| [`lint.yaml`](.github/workflows/lint.yaml) | Package linting with `{lintr}` | — |
| [`pkgdown.yaml`](.github/workflows/pkgdown.yaml) | Build & deploy a pkgdown site with verified canonical URLs; use `no-suggests: true` for a hard-deps-only CI check | `no-suggests` |
| [`pre-commit.yaml`](.github/workflows/pre-commit.yaml) | Run pre-commit hooks; fails if hooks would modify files | — |
| [`seo-files.yaml`](.github/workflows/seo-files.yaml) | Deploy SEO and AI-discovery files (`robots.txt`, `.well-known/llms.txt`) to `gh-pages` after pkgdown build | `package-name` |
| [`submit-cran.yaml`](.github/workflows/submit-cran.yaml) | On a release branch, build and submit to CRAN without releasing; on the default branch after merge, rebuild and tag the submitted PR head and create a GitHub Release using the matching `NEWS.md` section without resubmitting | `extra-packages` |
| [`test-coverage.yaml`](.github/workflows/test-coverage.yaml) | Two parallel coverage jobs: unit tests (enforces 100%) + examples/vignettes (enforces 100%) | — |

### Hard-dependency pkgdown checks

Setting `no-suggests: true` makes `pkgdown.yaml` validate that a package website
can be built with hard package dependencies plus the documentation tooling,
without installing the package's `Suggests`. The job uses a dedicated cache
namespace that includes a hash of the caller's `DESCRIPTION`. This matters
because `setup-r-dependencies` fallback cache keys do not include the generated
lockfile hash: sharing the normal pkgdown namespace, or reusing a hard-only
namespace after declared dependencies change, could restore packages that are
no longer hard dependencies and weaken the check.

The first run for each `DESCRIPTION` state is necessarily a cold install. Later
runs with the same dependency metadata can restore that isolated cache,
avoiding the much longer runtime caused by rebuilding the hard-dependency graph
on every pull request. Increment the static cache-generation prefix only when
all hard-only caches intentionally need to be invalidated.

## Presentations

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`build-presentation-python.yaml`](.github/workflows/build-presentation-python.yaml) | Build & deploy Python/UV Quarto RevealJS presentation to GitHub Pages | — |
| [`build-presentation-r.yaml`](.github/workflows/build-presentation-r.yaml) | Build & deploy R Quarto RevealJS presentation to GitHub Pages | — |

## Generic

Generic workflows are language-agnostic and provide utility across diverse
types of projects, ensuring high code quality and robust documentation
regardless of the underlying tech stack.

| Workflow | Description | Inputs |
|----------|-------------|--------|
| [`check-link-rot.yaml`](.github/workflows/check-link-rot.yaml) | Check for broken links using [lychee](https://github.com/lycheeverse/lychee) | — |

## License

[MIT](LICENSE)
