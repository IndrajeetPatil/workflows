# Using reusable workflows

All external actions are **pinned to commit SHAs** to prevent supply chain
attacks. The workflows default to read-only token access, disable persisted
checkout credentials except for the one intentional push job, and bound every
job with a timeout. Write credentials are isolated in deployment and release
jobs rather than exposed while repository code and dependencies are built or
tested.

The repository's only standalone workflow is
[`security.yml`](../.github/workflows/security.yml). It runs on pull requests to
`main`, scans the complete Git history with Gitleaks, and audits every workflow
with zizmor in pedantic mode so future changes cannot silently weaken these
controls.

## Call a workflow

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
      hard: true
```

Reference these workflows by `@main`. They are maintained alongside their
callers, so a branch reference delivers fixes to every caller at once instead
of leaving SHA pins to go stale. The safeguard is on this side: `main` accepts
changes only through pull requests that pass the Gitleaks and zizmor checks.
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
allows only selected actions must allow `IndrajeetPatil/*` and every
third-party action the workflow uses; for the frontend workflows that is
`voidzero-dev/setup-vp`, `j178/prek-action` and `astral-sh/setup-uv`, plus
GitHub-owned actions.

Avoid `secrets: inherit` when a workflow needs only one named secret. Pass that
secret explicitly so unrelated repository or organisation secrets are not made
available to the called workflow.
