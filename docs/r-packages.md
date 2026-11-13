# R package workflow details

See the [R package catalogue](workflow-catalogue.md#r-packages) for the
workflow list and inputs. Declare package-specific checking tools in
`Config/Needs/check` in the caller's `DESCRIPTION`; `R-CMD-check.yaml` installs
them in normal and hard-dependency modes.

## Hard-dependency checks

![Two separate dependency caches based on DESCRIPTION: the normal check can restore Imports, Suggests and tools, while the hard-only check restores Imports and checking tools without Suggests.](figures/cache-isolation.png)

Setting `no-suggests: true` makes `pkgdown.yaml` validate that a package website
can be built with hard package dependencies plus the documentation tooling,
without installing the package's `Suggests`. Likewise, `hard: true` makes
`R-CMD-check.yaml` run R CMD check with only hard dependencies and checking
tools. Each job uses its own dedicated cache namespace that includes a hash of
the caller's `DESCRIPTION`. This matters
because `setup-r-dependencies` fallback cache keys do not include the generated
lockfile hash: sharing the normal pkgdown namespace, or reusing a hard-only
namespace after declared dependencies change, could restore packages that are
no longer hard dependencies and weaken the check.

The first run for each `DESCRIPTION` state is necessarily a cold install. Later
runs with the same dependency metadata can restore that isolated cache,
avoiding the much longer runtime caused by rebuilding the hard-dependency graph
on every pull request. Increment the static cache-generation prefix only when
all hard-only caches intentionally need to be invalidated.

## CRAN releases

Most R workflows only check code. `pkgdown.yaml` and `seo-files.yaml` deploy to
`gh-pages`; `submit-cran.yaml` submits a release-branch tarball to CRAN and,
after that pull request merges, creates a GitHub Release from its original
head on a separate default-branch run. The release job uses only the write
permission it needs and does not resubmit to CRAN.

### Release lifecycle

The release branch submits its source tarball to CRAN while the release pull
request is open. After that pull request merges, rerun `submit-cran.yaml` from
the default branch to create the tag and GitHub Release from the original
submitted pull-request head. The second run rebuilds the tarball and reads the
matching `NEWS.md` section from that same commit.

![CRAN release lifecycle: a release-branch run submits the original pull-request head to CRAN, and a default-branch run after merge verifies that head before creating the tag and GitHub Release.](figures/cran-release.svg)

## Benchmarks

`r-benchmarks.yaml` runs the caller's `codspeed.yml` executable targets on
Ubuntu 24.04 with R 4.6.1. It installs hard dependencies and optional tools
from `Config/Needs/benchmark`, installs the checkout, records loaded package
versions with `sessionInfo()`, and runs the official CodSpeed action in CPU
simulation mode with subprocess tracking. BLAS and OpenMP use one thread.
Dependencies are resolved from the configured package repository, not locked.

Callers must grant `contents: read` and `id-token: write`. Keep pull-request,
default-branch push, and manual triggers so new targets gain baselines. Import
the caller into CodSpeed using its GitHub App before running uploads.

```yaml
permissions:
  contents: read
  id-token: write

jobs:
  benchmarks:
    uses: IndrajeetPatil/workflows/.github/workflows/r-benchmarks.yaml@main
```

### Coverage policy

- Benchmark the main statistical or plotting entry points, rather than every
  export. Cover representative workflows with fixed, small datasets.
- Exclude meta-analysis functions. Helper functions and grouped plot wrappers
  are outside the primary benchmark catalogue.
- Maintain an explicit function list and local run instructions in the caller's
  `benchmarks/README.md`. Keep target names, fixtures, and repetition counts
  stable; document measurement scope when changing them.
- Keep benchmarks outside package checks and exclude their tooling from CRAN
  source bundles. Check returned data or build plots so each command does useful
  work and fails when its workload breaks.
- Command measurements include R startup and dependency loading. CPU simulation
  excludes system calls; CodSpeed may flag these R workloads as dominated by
  them. Interpret reports as simulated CPU work, not complete elapsed runtime.
- Repeat the same source and environment when investigating stability. Matching
  rounded report values alone do not establish sub-percent variance.

Use feature-branch workflow references to validate coordinated workflow and
caller PRs; normal callers use `@main` after the shared workflow is merged.
