# Using reusable workflows

This page documents how the owner's repositories call these workflows. They are
not a public template: calls from other accounts' repositories fail at the owner
guard.

External actions are pinned to full commit SHAs, with the release versions in
inline comments. The machine-generated [workflow dependency lockfile](../.github/workflows/actions.lock)
also records the verified commit and source repository identity for direct and
transitive action dependencies. The workflows default to read-only token
access, disable persisted checkout credentials except for the one intentional
push job, and bound every job with a timeout. Write credentials are isolated
in deployment and release jobs rather than exposed while repository code and
dependencies are built or tested.

The repository's only standalone workflow is
[`security.yml`](../.github/workflows/security.yml). It runs on pull requests to
`main`, scans the complete Git history with Gitleaks, and audits every workflow
with zizmor in pedantic mode so future changes cannot silently weaken these
controls.

![Security by design: every job starts with the owner guard; actions are SHA-pinned, tokens are read-only by default, checkout credentials are disabled, untrusted inputs are validated, jobs have finite timeouts, and write credentials are isolated to release work. The separate pull-request security gate runs Gitleaks across full history and zizmor in pedantic mode.](figures/security-design.webp)

## Account restriction

Every job begins with a guard that fails when `github.repository_owner` is not
`IndrajeetPatil`, before checking out or executing caller code. Diagnostic steps
that run after failure also require that owner. This restricts the caller
repository's owner; it does not require the PR author or triggering actor to be
the account owner. Because the workflows are public, another account can invoke
them, but its jobs fail at the guard before package or deployment work runs.

## Call a workflow

A repository owned by `IndrajeetPatil` references a reusable workflow like
this:

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
      hard: true
```

Reference these workflows by `@main`. They are maintained alongside their
callers, so a branch reference delivers fixes to every caller at once instead
of leaving SHA pins to go stale. They are first-party, and only the owner can
contribute to any of the owner's repositories, so there is no external
contributor who could change them. The safeguard is on this side: `main`
accepts changes only through pull requests that pass the Gitleaks and zizmor
checks. Code scanners such as CodeQL (`actions/unpinned-tag`) still flag the
branch reference; dismiss those alerts as "won't fix" with this reason.
Callers that run zizmor should allow this with a narrow policy and keep every
third-party action SHA-pinned:

```yaml
# .github/zizmor.yml
rules:
  unpinned-uses:
    config:
      policies:
        "IndrajeetPatil/*": ref-pin
        "*": hash-pin
```

Callers must also grant only the permissions required by the selected
workflow. GitHub can maintain or reduce permissions through a reusable-workflow
chain, but a called workflow cannot elevate scopes that its caller did not
grant.

A reusable workflow runs under the **caller's** Actions policy. A caller that
allows only selected actions must allow `IndrajeetPatil/*`, the actions in the
selected workflow's direct and transitive dependency graph, and GitHub-owned
actions. The generated [`actions.lock`](../.github/workflows/actions.lock) is
the complete dependency inventory. Direct third-party action publishers
currently include `astral-sh/setup-uv`, `CodSpeedHQ/action`,
`codecov/codecov-action`, `crate-ci/typos`,
`JamesIves/github-pages-deploy-action`, `j178/prek-action`,
`lycheeverse/lychee-action`, `posit-dev/setup-air`,
`quarto-dev/quarto-actions`, `r-lib/actions` and `voidzero-dev/setup-vp`.

Avoid `secrets: inherit` when a workflow needs only one named secret. Pass that
secret explicitly so unrelated repository or organisation secrets are not made
available to the called workflow.
