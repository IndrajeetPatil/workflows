# Repository guidelines

This repository contains reusable GitHub Actions workflows for repositories
owned by `IndrajeetPatil`.

## Scope

- Callers reference `@main`, so every change reaches them on merge. A ruleset
  requires a pull request with passing Gitleaks, zizmor, and prek checks.
- `@main` caller references are deliberate, not a pinning gap. These workflows
  are first-party, and the owner is the only person who can contribute to any
  of the owner's repositories, so there is no external-contributor risk. Code
  scanners in callers (CodeQL `actions/unpinned-tag`, zizmor `unpinned-uses`)
  flag them by design: do not report them or propose SHA pins, and dismiss such
  alerts as "won't fix" with this reason.
- Keep reusable workflow files limited to `workflow_call`. The repository-local
  `security.yml` and `prek.yml` workflows are the only intentional exceptions
  and run only for pull requests targeting `main`.
- Keep `submit-cran.yaml` two-stage: non-default release branches may submit to
  CRAN but must not create tags or GitHub Releases; the default branch may
  create the release after merge but must not resubmit to CRAN. The release tag,
  tarball, and NEWS must come from the original submitted pull-request head, not
  from unrelated changes later added to `main`. Release notes must copy the
  matching `NEWS.md` section rather than use generated notes.
- Preserve the owner guard as the first step in every job.
- Keep the `quarto call axe` accessibility check in both presentation
  workflows on every pull request. It is skipped on pushes because callers'
  default branches accept changes only through pull requests. Retry only
  incomplete scans (exit 2), never findings (exit 1).
- Before changing a reusable workflow interface or permissions, search the
  `IndrajeetPatil` account's repositories for callers and verify their granted
  scopes.
- Add a `workflow_call` input or secret only when a calling repository needs
  it, not in anticipation of future use. Every input is untrusted data that
  widens the attack surface, so remove any that no caller still passes.
- When a workflow starts using a new third-party action, add it to the Actions
  policy paragraph under "Call a workflow" in `docs/using-workflows.md`:
  callers that allow only selected actions must add it to their policy.

## Pull request delivery

- Publish pull requests ready for review; do not create drafts.
- After opening or updating a pull request, wait for hosted checks. Investigate
  failures and continue until all required checks pass; pending or skipped
  required checks are not success.
- Codex reviews every pull request automatically and decides itself whether
  later pushes need another review, so never comment `@codex review`. Address
  merited findings until Codex approves with no unresolved findings.
- If Codex review usage is exhausted, leave the pull request open. Once usage
  refreshes, comment `@codex review` once; only this case needs the comment.
- Squash-merge only after required checks pass and Codex has approved. Respect branch protections and verify the merge state afterward.

## Security requirements

- Pin every external action to a full commit SHA and retain the most specific
  release version available in an inline comment. Do not use sliding major-version
  tags (e.g. `v2`) if a more specific version tag exists (e.g. `v2.14.0`).
- Keep `.github/workflows/actions.lock` in sync with every workflow action
  dependency. Generate it with GitHub's `gh actions-lock` extension; it records
  transitive dependencies and source repository identity. Never edit it by hand.
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
- Install standalone release binaries only with a pinned version and a pinned
  SHA-256 checksum of the downloaded archive, verified before extraction.
  Cross-check the checksum against the release's published checksums when one
  exists, and update version and checksum together.
- Keep the pull-request security gate fail-closed: scan the complete Git history
  with Gitleaks and run zizmor in pedantic mode across every workflow.

The presentation workflows pin their Quarto extensions
(`mcanouil/quarto-revealjs-a11y` and `IndrajeetPatil/quarto-read-aloud`)
to exact commit SHAs of their latest releases via GitHub archive zip URLs
(`quarto add https://github.com/<owner>/<repo>/archive/<commit-sha>.zip --no-prompt`),
retaining release tags in inline comments. Do not add vendored archives or
custom checksum infrastructure for these extensions.

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

- Set `cache: always` on every `setup-r-dependencies` step so the package
  cache is saved right after installation. The default `true` saves only when
  the whole job succeeds, so a failing check reinstalls every dependency on
  each rerun.

## Validation

Install the Git hooks once with `prek install`. They run the hooks in
`prek.toml` on every commit and check commit messages against Conventional
Commits; `prek.yml` runs the same hooks on every pull request. Run them from
a feature branch: `no-commit-to-branch` fails on `main` by design.

Run these checks before publishing workflow changes:

```bash
prek run --all-files
actionlint
gitleaks git --log-opts="--all" --no-banner --redact .
uvx zizmor@1.32.0 --pedantic .github/workflows/
git diff --check
```

Also run `make actions-lock-verify` after dependency or workflow changes.

Also inspect the complete diff and confirm that no standalone workflow trigger
was introduced beyond the PR-only `security.yml` and `prek.yml` exceptions.
