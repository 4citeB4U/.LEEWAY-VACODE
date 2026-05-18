<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.STATUS_TRUTH
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Truth report for the Agent Lee source, package, installed-on-disk, and live VS Code runtime states.
-->

# Agent Lee Runtime Status Truth

Report time: 2026-05-17 13:46 America/Chicago

## Current real state

| Surface | Version / State | Status |
| --- | --- | --- |
| Source workspace | 1.2.10 | PASS |
| Latest verified local VSIX | 1.2.10 | PASS |
| Installed extension folder on disk | 1.2.9 | FAIL / STALE |
| Latest observed live VS Code activation | 1.2.6 | FAIL / BROKEN |

The installed extension is still not current, and the live VS Code runtime remains broken.

## Evidence

- `agent-lee/vscode-extension/test-evidence/leeway-extension-release-package-result.json` shows `1.2.10` packaged successfully with the new icon and README assets.
- `agent-lee/vscode-extension/test-evidence/leeway-installed-extension-check-result.json` shows:
  - `sourceVersion`: `1.2.10`
  - `installedVersion`: `1.2.9`
  - `installedRuntimeStatus`: `stale`
  - missing installed assets: `media/leeway-activity.svg`, `media/leeway-logo.svg`, `media/leeway-readme-hero.svg`
- `C:\Users\Leona\AppData\Roaming\Code\logs\20260517T130039\window1\exthost\exthost.log` shows the last live activation at `2026-05-17 13:00:42` still loaded `leeway.agent-lee-leeway-coding-system-1.2.6` and failed with:
  `Cannot find module './adapters/gmail.adapter'`

## What was broken

- The live extension host was still running stale `1.2.6`.
- That stale runtime crashed during activation before the sidebar and status bar came up.
- The stale install did not contain the new Activity Bar icon/README SVG assets.
- VS Code auto-update was being treated like a marketplace channel even though this install is a local VSIX lane.

## What is fixed in source and package

- Optional adapter loading is hardened so missing optional adapters degrade instead of bricking activation.
- `agentLee.diagnoseRuntime`, `agentLee.recoverUi`, and `agentLee.repairInstallation` are now registered in source.
- Runtime truth now reports update channel, installed/runtime drift, and local-VSIX auto-update limits.
- A new `1.2.10` VSIX was packaged with:
  - `media/leeway-activity.svg`
  - `media/leeway-logo.svg`
  - `media/leeway-readme-hero.svg`
  - updated README content and update-channel explanation

## What is not fixed in the live user-facing runtime yet

- The installed extension on disk is still `1.2.9`.
- The last observed live VS Code activation is still stale `1.2.6`.
- Therefore these user-facing checks remain failed until reinstall/reload happens:
  - Activity Bar icon visible
  - Sidebar opens
  - `agentLee.openSidebar` works live
  - `Agent Lee: Ready` appears
  - README images render from the installed extension

## Truth verdict

Source code fix: PASS
VSIX package 1.2.10 built: PASS
Installed VS Code runtime: FAIL / STALE
User-facing extension: FAIL until 1.2.10 is installed and running
Auto-update persistence: FAIL / root cause documented separately

Final verdict: FAIL
