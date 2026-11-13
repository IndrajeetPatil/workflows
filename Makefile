ACTIONS_LOCK_VERSION ?= v0.4.1

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

.PHONY: actions-lock actions-lock-verify check-actions-lock-version

check-actions-lock-version:
	@version=$$(gh actions-lock --version 2>/dev/null) || { \
		echo "Install github/gh-actions-lock $(ACTIONS_LOCK_VERSION)." >&2; \
		exit 1; \
	}; \
	if [[ "$$version" != "actions-lock version $(ACTIONS_LOCK_VERSION)" ]]; then \
		echo "Expected actions-lock $(ACTIONS_LOCK_VERSION), found $$version." >&2; \
		exit 1; \
	fi

actions-lock: check-actions-lock-version
	gh actions-lock --no-interactive --no-narrow
	gh actions-lock --verify

actions-lock-verify: check-actions-lock-version
	gh actions-lock --verify
