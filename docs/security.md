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
- Reusable workflows run with the caller's event, repository, policy, and
  token ceiling. The caller chooses when to invoke a workflow and which
  permissions and secrets to pass.
- Reusable workflow files use `workflow_call`. The only standalone workflow in
  this repository is the pull-request security gate. The owner's current
  repository callers also use `workflow_run` for the SEO-file deployment after
  a successful `pkgdown` run on `main`; that job checks out `gh-pages`, uses a
  validated package-name input, and does not consume artifacts from the
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
- Quarto extensions used by the presentation workflows are pinned to exact
  commit SHAs of their latest releases via GitHub archive URLs
  (`quarto add https://github.com/<owner>/<repo>/archive/<commit-sha>.zip --no-prompt`),
  with their release tags recorded in inline comments.
- Dependabot checks GitHub Actions dependencies weekly and groups its update
  pull requests. Action source and requested permissions still need review
  when updates are accepted.

## Permissions and credentials

- Workflow-level `GITHUB_TOKEN` permissions default to `contents: read`.
  Additional permissions are granted only to the job that needs them:
  `pages: write` and `id-token: write` for GitHub Pages deployment,
  `id-token: write` for CodSpeed uploads, and `contents: write` for publishing
  to `gh-pages` or creating a release.
- Checkout disables persisted credentials in build, test, and deploy jobs. The
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
- The frontend QA workflow also runs Gitleaks, actionlint, and zizmor for
  callers that use that gate. The repository's Python and R workflows run
  dependency and project checks appropriate to those toolchains.
- Callers with an allow-list for Actions must permit this repository's
  reusable workflows and every external action they use. Caller repositories
  must also grant the minimum permissions required by the selected workflow;
  Pages callers, for example, need to grant `pages: write` and `id-token: write`
  to the deployment job.
- Secret storage, environment reviewers, OIDC trust conditions, fork-workflow
  approval, code scanning, audit-log review, secret rotation, and repository
  alert settings are configured outside reusable workflow files. Each
  repository owner must review those settings in GitHub and manage credentials
  there; workflow source alone cannot confirm their state.

## Accepted risks

The controls above are sized for how the owner's repositories are run, not for
an open contribution model. The risks below are accepted only while the
conditions hold. If a condition stops holding, revisit the matching risks.

### Conditions

- Every caller repository belongs to `IndrajeetPatil`, and the owner is its
  only contributor. Nobody else opens pull requests or pushes branches.
- The settings that enforce this live in GitHub, outside these workflow files,
  so this repository cannot confirm their state. The owner checks them when
  creating or changing a repository.
- These workflows are first-party and are called only by the owner's
  repositories.

### Risks accepted under those conditions

- **Moving `@main` references.** Callers receive changes on merge instead of
  selecting a pinned commit. Accepted because only the owner can change
  `main`, and a ruleset requires a pull request with passing Gitleaks and
  zizmor checks. Residual risk: a malicious change that the owner merges, or
  that arrives through a compromised owner account, reaches every caller at
  once. Code scanner alerts about these references are dismissed as "won't fix"
  with this reasoning.
- **An owner guard that checks only the repository owner.** It does not verify
  who authored a pull request or triggered a run. Accepted because the owner is
  the only contributor, so there is no second identity to tell apart. The guard
  still stops other accounts from running the public workflows.
- **Caller-supplied commands in `frontend-qa.yaml`.** Optional inputs run as
  Bash with read-only repository permissions and no secrets. Accepted because
  the commands come from the caller's own workflow configuration, which only
  the owner edits.
- **Repository code running with `id-token: write`.** The Python and R
  benchmark workflows run the caller's code and dependencies in a job that can
  request a short-lived OIDC token for CodSpeed uploads. Accepted because the
  token grants no repository write access and the code is written by the owner.
  Residual risk: dependencies installed in that job run with the same access.
- **A persisted checkout credential in `seo-files.yaml`.** The job needs it to
  commit generated files to `gh-pages`. Accepted because it validates its
  package-name input and does not consume artifacts from the triggering run.

### Risks this reasoning does not cover

- Malicious or compromised third-party actions, tools and package
  dependencies. Commit pinning stops a retargeted tag but not a malicious
  release accepted through an update, so review action source and requested
  permissions before merging Dependabot pull requests.
- Compromise of the owner's account, credentials or tokens, including any
  bypass of the default-branch ruleset.
- Loss of the sole-contributor condition, such as adding a collaborator,
  accepting an outside pull request, or calling these workflows from a
  repository owned by another account. Each requires reassessing the risks
  above, starting with replacing `@main` with a reviewed commit reference.

For setup examples and the caller's permission and Actions-policy requirements,
see [Using reusable workflows](using-workflows.md). GitHub's reference covers
additional controls such as [script injection](https://docs.github.com/en/actions/reference/security/secure-use#good-practices-for-mitigating-script-injection-attacks),
[untrusted pull-request checkout](https://docs.github.com/en/actions/reference/security/secure-use#mitigating-the-risks-of-untrusted-code-checkout),
[third-party actions](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions),
and [OIDC](https://docs.github.com/en/actions/reference/security/secure-use#using-openid-connect-to-access-cloud-resources).
