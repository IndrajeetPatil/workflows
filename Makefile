ACTIONS_LOCK_VERSION ?= v0.5.1

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

.PHONY: actions-lock actions-lock-install actions-lock-verify check-actions-lock-version

check-actions-lock-version:
	@version=$$(gh actions-lock --version 2>/dev/null) || { \
		echo "Install github/gh-actions-lock $(ACTIONS_LOCK_VERSION)." >&2; \
		exit 1; \
	}; \
	if [[ "$$version" != "actions-lock version $(ACTIONS_LOCK_VERSION)" ]]; then \
		echo "Expected actions-lock $(ACTIONS_LOCK_VERSION), found $$version." >&2; \
		exit 1; \
	fi

# Installs the pinned extension when it is missing or another version.
actions-lock-install:
	@if [[ "$$(gh actions-lock --version 2>/dev/null)" != "actions-lock version $(ACTIONS_LOCK_VERSION)" ]]; then \
		gh extension remove actions-lock >/dev/null 2>&1 || true; \
		gh extension install github/gh-actions-lock --pin $(ACTIONS_LOCK_VERSION); \
	fi

actions-lock: check-actions-lock-version
	gh actions-lock --no-interactive --no-narrow
	gh actions-lock --verify

actions-lock-verify: actions-lock-install
	gh actions-lock --verify
