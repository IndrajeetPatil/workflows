# GitHub Actions security

This guide describes the security controls implemented by these reusable
workflows and the responsibilities that remain with each calling repository.
It follows [GitHub's secure-use reference](https://docs.github.com/en/actions/reference/security/secure-use).

![Security by design: every job starts with the owner guard; actions are SHA-pinned, tokens are read-only by default, checkout credentials are disabled, untrusted inputs are validated, jobs have finite timeouts, and write credentials are isolated to release work. The separate pull-request security gate runs Gitleaks across full history and zizmor in pedantic mode.](figures/security-design.webp)

## Trust boundaries

- Every job checks that the calling repository belongs to `IndrajeetPatil`
  before checking out source or running caller code. This limits the workflows
  to repositories under the account; it does not verify who authored a pull
  request.
- Reusable workflows run with the caller's event, repository, policy and
  token ceiling. The caller chooses when to invoke a workflow and which
  permissions and secrets to pass.
- Reusable workflow files use `workflow_call`. The only standalone workflow in
  this repository is the pull-request security gate. The owner's current
  repository callers also use `workflow_run` for the SEO-file deployment after
  a successful `pkgdown` run on `main`; that job checks out `gh-pages`, uses a
  validated package-name input and does not consume artifacts from the
  triggering run. Do not add a privileged trigger that checks out or executes
  untrusted pull-request code or consumes its artifacts.
- Build and test jobs process caller-controlled source. They have read-only
  repository permissions and do not receive deployment credentials. Publishing
  is handled in separate jobs after a successful build or release validation.

## Actions and workflow dependencies

- External actions are pinned to full commit SHAs, with their release versions
  in inline comments. The generated
  [`actions.lock`](../.github/workflows/actions.lock) also records a verified
  commit and source repository identity for each direct and transitive action
  dependency. Standalone release-tool archives are pinned to versions and
  SHA-256 checksums, verified before extraction.
- [GitHub workflow dependency lockfiles](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles)
  are in public preview. This lockfile covers action dependencies in this
  repository's workflows; it does not lock reusable workflow calls made by
  callers or other build inputs. Review format and verifier changes when
  updating the official lockfile generator.
- Use `make actions-lock` to regenerate the lockfile while preserving full-SHA
  workflow refs, and `make actions-lock-verify` to check the result.
- The owner's repositories call these first-party reusable workflows using
  `@main`. This intentionally delivers reviewed fixes to callers without
  waiting for each caller to update a SHA. The default branch is protected by
  an active ruleset that requires a pull request and passing Gitleaks and
  zizmor checks. This moving reference gives up immutable version selection;
  repositories requiring a fixed workflow revision should use a reviewed
  commit reference and update it deliberately.
- Quarto extensions used by the presentation workflows are installed directly
  from their upstream repositories with `quarto add ... --no-prompt`, as
  documented in the repository policy.
- Dependabot checks GitHub Actions dependencies weekly and groups its update
  pull requests. Action source and requested permissions still need review
  when updates are accepted.

## Permissions and credentials

- Workflow-level `GITHUB_TOKEN` permissions default to `contents: read`.
  Additional permissions are granted only to the job that needs them:
  `pages: write` and `id-token: write` for GitHub Pages deployment,
  `id-token: write` for CodSpeed uploads, and `contents: write` for publishing
  to `gh-pages` or creating a release.
- Checkout disables persisted credentials in build, test and deploy jobs. The
  SEO-file workflow intentionally persists the checkout credential because it
  commits generated files to `gh-pages`; that job has `contents: write`.
- Pages deployments and CodSpeed uploads use OIDC instead of long-lived cloud
  upload credentials. The release job uses the scoped `GITHUB_TOKEN` to create
  the release and tag.
- The coverage workflow accepts a named `CODECOV_TOKEN` secret. Pass only that
  named secret when needed; do not use `secrets: inherit` for convenience.
- Every job has a finite timeout. Jobs run on GitHub-hosted runners, keeping
  persistent self-hosted runner state outside this workflow set.

## Inputs and untrusted data

- Expressions derived from event data are passed through environment variables
  before shell use, then quoted and validated where the input has a constrained
  format. For example, the SEO workflow validates its package name before
  writing generated files, and the release workflow validates submitted commit
  metadata before fetching it.
- The frontend QA workflow accepts optional project-specific Bash commands.
  These inputs are executable code from the calling repository and run after
  checkout with read-only repository permissions. Callers should define them
  only in trusted workflow configuration and must not pass secrets to them.
- Callers should avoid privileged triggers for workflows that check out or run
  pull-request code. In particular, do not combine `pull_request_target` or
  `workflow_run` with an untrusted checkout or artifact.

## Security checks and repository settings

- The standalone security workflow scans the complete Git history with
  Gitleaks and runs zizmor in pedantic mode against every workflow. An active
  default-branch ruleset requires both checks and requires changes to arrive
  through a pull request.
- The frontend QA workflow also runs Gitleaks, actionlint and zizmor for
  callers that use that gate. The repository's Python and R workflows run
  dependency and project checks appropriate to those toolchains.
- Callers with an allow-list for Actions must permit this repository's
  reusable workflows and every external action they use. Caller repositories
  must also grant the minimum permissions required by the selected workflow;
  Pages callers, for example, need to grant `pages: write` and `id-token: write`
  to the deployment job.
- Secret storage, environment reviewers, OIDC trust conditions, fork-workflow
  approval, code scanning, audit-log review, secret rotation and repository
  alert settings are configured outside reusable workflow files. Each
  repository owner must review those settings in GitHub and manage credentials
  there; workflow source alone cannot confirm their state.

For setup examples and the caller's permission and Actions-policy requirements,
see [Using reusable workflows](using-workflows.md). GitHub's reference covers
additional controls such as [script injection](https://docs.github.com/en/actions/reference/security/secure-use#good-practices-for-mitigating-script-injection-attacks),
[untrusted pull-request checkout](https://docs.github.com/en/actions/reference/security/secure-use#mitigating-the-risks-of-untrusted-code-checkout),
[third-party actions](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions),
and [OIDC](https://docs.github.com/en/actions/reference/security/secure-use#using-openid-connect-to-access-cloud-resources).
