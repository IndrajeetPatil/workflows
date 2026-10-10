# Repository guidelines

This repository contains reusable GitHub Actions workflows for repositories
owned by `IndrajeetPatil`.

## Scope

- Never commit or push directly to the `main` branch. Always create a new branch and submit changes via a pull request.
- Keep reusable workflow files limited to `workflow_call`. The repository-local
  `security.yml` workflow is the sole intentional exception and runs only for
  pull requests targeting `main`.
- Keep `submit-cran.yaml` two-stage: non-default release branches may submit to
  CRAN but must not create tags or GitHub Releases; the default branch may
  create the release after merge but must not resubmit to CRAN. The release tag,
  tarball, and NEWS must come from the original submitted pull-request head, not
  from unrelated changes later added to `main`. Release notes must copy the
  matching `NEWS.md` section rather than use generated notes.
- Preserve the owner guard as the first step in every job.
- Before changing a reusable workflow interface or permissions, search the
  `IndrajeetPatil` organization for callers and verify their granted scopes.

## Security requirements

- Pin every external action to a full commit SHA and retain the most specific
  release version available in an inline comment. Do not use sliding major-version
  tags (e.g. `v2`) if a more specific version tag exists (e.g. `v2.14.0`).
- Default `GITHUB_TOKEN` to `contents: read`. Give a job only the additional
  write scopes it needs, and isolate deploy or release credentials from jobs
  that build or test repository code.
- Set `persist-credentials: false` on checkout unless the job intentionally
  pushes with the checkout credential. Document that exception.
- Treat inputs and event data as untrusted. Pass dynamic values through
  environment variables, quote them in scripts, and validate constrained
  values before use.
- Set a finite `timeout-minutes` on every job.
- Prefer runner-provided tools over additional third-party actions when the
  built-in tool provides the required behavior.
- Keep the pull-request security gate fail-closed: scan the complete Git history
  with Gitleaks and run zizmor in pedantic mode across every workflow.

The Quarto accessibility extension is intentionally installed directly from
upstream with `quarto add mcanouil/quarto-revealjs-a11y --no-prompt`. Do not add
version pins, vendored archives, or checksum infrastructure for this extension.

## Python toolchain and test matrix

- Omit the `version` input of `astral-sh/setup-uv`. Let the action install the
  newest uv version satisfying the caller's `required-version`, or the latest
  release when no requirement is declared. Keep the action itself pinned to a
  full commit SHA with its release version in the inline comment.
- Test every supported Python version on Ubuntu. Only the latest stable Python
  release also runs on macOS and Windows; older releases and prereleases run on
  Ubuntu only.
- When adopting a new stable Python release, replace the previous macOS and
  Windows matrix entries. Update consumers' required status checks to the new
  job names after validating them, rather than retaining obsolete platform jobs
  to satisfy stale branch-protection settings.

## Dependency cache isolation

- Preserve `dependencies: '"hard"'` for the `pkgdown.yaml` no-Suggests mode
  and the `R-CMD-check.yaml` hard mode.
- Keep their dependency caches enabled under namespaces distinct from each
  other and from the normal Suggests-enabled jobs, derived from the caller's
  `DESCRIPTION`.
  The action's fallback cache key omits the lockfile hash, so a shared or static
  namespace can restore packages that are no longer hard dependencies and
  invalidate the hard-only check.
- Do not routinely set the hard-only caches to `false`; that forces every run
  to rebuild the hard-dependency graph. Preserve the dependency-metadata hash
  in `cache-version`, and increment its static generation prefix only when all
  hard-only caches must be invalidated.

## Validation

Run these checks before publishing workflow changes:

```bash
actionlint
gitleaks git --log-opts="--all" --no-banner --redact .
uvx zizmor@1.28.0 --pedantic .github/workflows/
git diff --check
```

Also inspect the complete diff and confirm that no standalone workflow trigger
was introduced beyond the PR-only `security.yml` exception.
