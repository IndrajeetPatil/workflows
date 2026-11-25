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

# Installs the pinned extension, after checking the release binary against its
# pinned SHA-256, when it is missing or another version. Update the version
# and every checksum together.
ACTIONS_LOCK_SHA256_linux-amd64 := 94009f287cfcc046ff371824824c203a8a44c981ca2dac344052744897c29c3a
ACTIONS_LOCK_SHA256_linux-arm64 := b51f0ba96784950bf945272c7e0d3f9fb4c53d378b37070f8eb6cdbe71b190a8
ACTIONS_LOCK_SHA256_darwin-amd64 := daed4b624525ca04e088e1310dd80e06a410116ece41554b9f1d582b93a2c909
ACTIONS_LOCK_SHA256_darwin-arm64 := 223fa3e843a560a23964a5d0e037f500ad42b4e0c57b995f1ec99766355ae11e
ACTIONS_LOCK_PLATFORM := $(shell uname -s | tr A-Z a-z)-$(shell uname -m | sed -e s/x86_64/amd64/ -e s/aarch64/arm64/)
ACTIONS_LOCK_DIR := $(or $(XDG_CACHE_HOME),$(HOME)/.cache)/gh-actions-lock-$(ACTIONS_LOCK_VERSION)/gh-actions-lock

actions-lock-install:
	@if [[ "$$(gh actions-lock --version 2>/dev/null)" != "actions-lock version $(ACTIONS_LOCK_VERSION)" ]]; then \
		sha="$(ACTIONS_LOCK_SHA256_$(ACTIONS_LOCK_PLATFORM))"; \
		[[ -n "$$sha" ]] || { echo "No pinned checksum for $(ACTIONS_LOCK_PLATFORM)." >&2; exit 1; }; \
		mkdir -p "$(ACTIONS_LOCK_DIR)"; \
		gh release download $(ACTIONS_LOCK_VERSION) --repo github/gh-actions-lock \
			--pattern "$(ACTIONS_LOCK_PLATFORM)" --output "$(ACTIONS_LOCK_DIR)/gh-actions-lock" --clobber; \
		echo "$$sha  $(ACTIONS_LOCK_DIR)/gh-actions-lock" | shasum -a 256 --check --quiet; \
		chmod +x "$(ACTIONS_LOCK_DIR)/gh-actions-lock"; \
		gh extension remove actions-lock >/dev/null 2>&1 || true; \
		cd "$(ACTIONS_LOCK_DIR)" && gh extension install .; \
	fi

actions-lock: check-actions-lock-version
	gh actions-lock --no-interactive --no-narrow
	gh actions-lock --verify

actions-lock-verify: actions-lock-install
	gh actions-lock --verify
