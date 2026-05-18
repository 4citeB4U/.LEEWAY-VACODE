# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.EXTENSION_ASSET_FIX_2026_05_17
# PURPOSE: Record Agent Lee extension asset, icon, README, and package-surface verification.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Date: 2026-05-17
- Result: PASS
- Evidence: `agent-lee/vscode-extension/test-evidence/leeway-extension-asset-check-result.json`

## Changes Proven

- Activity Bar icon moved to packaged SVG asset: `agent-lee/vscode-extension/media/agent-lee-activitybar-icon.svg`
- Manifest points Activity Bar view container to the SVG asset.
- README image paths resolve from the packaged extension README.
- `.vscodeignore` does not exclude the required README/media/build-info assets.
- VSIX inspection confirmed the required assets ship in `agent-lee-leeway-coding-system-1.2.8.vsix`.
