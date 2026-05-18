<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.BRANDING_ASSET_REPORT
PURPOSE: Records the LeeWay extension branding asset map, verification checkpoints, and truthful live-runtime completion status.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay Extension Branding Asset Report

## Asset map

- Activity Bar icon: `agent-lee/vscode-extension/media/leeway-activity.svg`
- Activity Bar source archive: `agent-lee/vscode-extension/media/agent-lee-activitybar-icon.svg`
- Full LeeWay logo: `agent-lee/vscode-extension/media/leeway-logo.svg`
- Package logo: `agent-lee/vscode-extension/media/leeway-standards-logo.png`
- Sidebar top-right button: `agent-lee/vscode-extension/media/top-right-button-new.png`
- Sidebar bottom Agent Lee button: `agent-lee/vscode-extension/media/bottom-button-for-agent-lee.png`
- Sidebar LeeWay Standards button: `agent-lee/vscode-extension/media/leeway-standards-button.png`
- README header: `agent-lee/vscode-extension/media/readme-header.png`
- README system flow: `agent-lee/vscode-extension/media/readme-system-flow.png`
- Brand source archive: `agent-lee/vscode-extension/media/brand-sources/README.md`

## Live visual checklist

1. Activity Bar icon appears and is not blank.
2. Activity Bar icon is recognizable at small size.
3. Agent Lee sidebar opens.
4. Top-right LeeWay button displays.
5. Bottom Agent Lee button displays.
6. LeeWay Standards button displays.
7. README header image displays.
8. README system flow image displays.
9. Extension details page is updated.
10. Status bar still shows Agent Lee state.
11. Runtime Health reports current source/version.

## Status rule

- `PASS`: live VS Code or Extension Development Host is visually verified with the current branded assets.
- `PARTIAL`: source/package assets are fixed, but the installed extension is stale or live visual verification is not yet proven.
- `FAIL`: required branding assets are missing, excluded, or still not present in the packaged/installable runtime.

## Current evidence snapshot

- Source/package status: `PASS`
- VSIX packaging status: `PASS`
- Installed-on-disk status: `PARTIAL` for `1.2.11`
- Live visual runtime status: `FAIL`
- Evidence consistency status: `FAIL`

This receipt is no longer authoritative as a final PASS record.

Later LeeWay runtime evidence shows split-brain conditions remain between current source, packaged VSIX, installed bytes, and the live VS Code runtime. Treat this report as a historical branding receipt only and defer to:

- `agent-lee/receipts/INC-LEEWAY-EXT-2026-05-17-RUNTIME-TRUTH.md`
- `agent-lee/receipts/leeway_vscode_full_runtime_verification_report.md`
- `agent-lee/vscode-extension/test-evidence/leeway-active-runtime-attestation-result.json`
- `agent-lee/vscode-extension/test-evidence/leeway-evidence-consistency-result.json`
- `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json`

## Live installed-runtime proof

- Validation mode: `INSTALLED_EXTENSION`
- Runtime source mode: `UPDATE_CHANNEL_MANUAL_LOCAL_VSIX`
- Installed extension version observed in live asset paths: `1.2.11`
- Evidence JSON: `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json`
- Screenshots:
  - `agent-lee/vscode-extension/test-evidence/vscode-live-activitybar-icon.png`
  - `agent-lee/vscode-extension/test-evidence/vscode-sidebar-open.png`
  - `agent-lee/vscode-extension/test-evidence/vscode-readme-open.png`

This receipt must not be interpreted as final live-runtime closure proof.

## Live checklist result

1. Activity Bar icon appears and is not blank. `SOURCE/PACKAGE PASS`
2. Activity Bar icon is recognizable at small size. `SOURCE/PACKAGE PASS`
3. Agent Lee sidebar opens. `LIVE RUNTIME FAIL OR UNPROVEN`
4. Top-right LeeWay button displays. `LIVE RUNTIME FAIL OR UNPROVEN`
5. Bottom Agent Lee button displays. `LIVE RUNTIME FAIL OR UNPROVEN`
6. LeeWay Standards button displays. `LIVE RUNTIME FAIL OR UNPROVEN`
7. README header image displays. `SOURCE/PACKAGE PASS, LIVE FAIL`
8. README system flow image displays. `SOURCE/PACKAGE PASS, LIVE FAIL`
9. Extension details/README branding is updated in live preview. `LIVE FAIL`
10. Status bar still shows Agent Lee state. `LIVE FAIL OR UNPROVEN`
11. Runtime Health reports current install channel and runtime status. `PARTIAL`
