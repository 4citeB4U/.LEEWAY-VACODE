<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.INSTALL_VERIFICATION_REPORT
PURPOSE: Superseded installation verification report retained for audit with corrected runtime truth.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Superseded Install Verification Truth

This report is retained for audit only and no longer represents the current truth.

## Corrected status on 2026-05-17

- The prior `1.2.9 PASS` framing was incomplete.
- It proved only that a `1.2.9` extension folder existed on disk.
- It did **not** prove that the live VS Code window had reloaded onto that version.

## Current corrected truth

| Surface | State | Status |
| --- | --- | --- |
| Source workspace | 1.2.10 | PASS |
| Latest local VSIX | 1.2.10 | PASS |
| Installed extension folder | 1.2.9 | FAIL / STALE |
| Live VS Code runtime | 1.2.6 activation crash | FAIL |

At `2026-05-17 13:00:42`, the last observed live activation still loaded `1.2.6` and failed on `Cannot find module './adapters/gmail.adapter'`.

## Correction

Do not read the older `1.2.9` install evidence as “the extension is fixed.”

The installed extension is still not current, and the live VS Code runtime remains broken.

## Replacement evidence

- `agent-lee/vscode-extension/test-evidence/leeway-installed-extension-check-result.json`
- `agent-lee/vscode-extension/test-evidence/leeway-extension-release-package-result.json`
- `agent-lee/receipts/RUNTIME_STATUS_TRUTH_2026-05-17.md`

Final verdict: FAIL
