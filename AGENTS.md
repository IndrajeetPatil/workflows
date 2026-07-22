# Repository guidelines

This repository contains reusable GitHub Actions workflows for repositories
owned by `IndrajeetPatil`.

## Scope

- Keep workflow files reusable through `workflow_call`. Do not add standalone
  push, pull request, schedule, or manual-dispatch workflows unless explicitly
  requested.
- Preserve the owner guard as the first step in every job.
- Before changing a reusable workflow interface or permissions, search the
  `IndrajeetPatil` organization for callers and verify their granted scopes.

## Security requirements

- Pin every external action to a full commit SHA and retain the release version
  in an inline comment.
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

## Validation

Run these checks before publishing workflow changes:

```bash
actionlint
uvx zizmor@1.28.0 --pedantic .github/workflows/
git diff --check
```

Also inspect the complete diff and confirm that no standalone workflow trigger
was introduced.
