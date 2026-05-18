# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.EXTENSION_INSTALLED_CHECK
# PURPOSE: Record installed Agent Lee extension attestation and stale-VSIX detection proof.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Result: PASS
- Evidence: `agent-lee/vscode-extension/test-evidence/leeway-installed-extension-check-result.json`

## Detection Result

- Repo/source version: `1.2.8`
- Installed version: `1.2.6`
- Installed runtime status: `stale`
- Missing installed assets on the stale build: `media/agent-lee-activitybar-icon.svg`, `build/runtime-build-info.json`

## Proven Capabilities

- Detect installed extension location
- Detect stale version drift
- Detect runtime hash mismatch
- Detect missing packaged assets/build info
- Verify `agentLee.openSidebar` and `agentLee.runtimeStatus` command contributions on the installed manifest
