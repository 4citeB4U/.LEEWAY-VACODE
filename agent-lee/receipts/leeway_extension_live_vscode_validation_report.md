<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.LIVE_VSCODE_VALIDATION
PURPOSE: Manual/live VS Code validation receipt for Agent Lee runtime repair.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay Extension Live VS Code Validation

Report time: 2026-05-17 13:46 America/Chicago

## Live validation state

- Reload after current install: not completed
- Live Activity Bar icon confirmed visible: no
- Live sidebar confirmed opening: no
- Live `Agent Lee: Open Sidebar` command confirmed: no
- Live status bar confirmed `Agent Lee: Ready`: no
- Installed README images confirmed in Extension Details: no

## Evidence

- Latest observed extension-host log:
  `C:\Users\Leona\AppData\Roaming\Code\logs\20260517T130039\window1\exthost\exthost.log`
- Last Agent Lee activation observed there:
  - runtime version: `1.2.6`
  - timestamp: `2026-05-17 13:00:42`
  - result: activation failed
  - failure: `Cannot find module './adapters/gmail.adapter'`

## Manual checklist still required

1. Install the newest local VSIX with `Invoke-LeeWayExtensionInstallCurrent.ps1`.
2. Reload VS Code.
3. Confirm the Activity Bar icon is visible and recognizable.
4. Click the Agent Lee icon.
5. Confirm the sidebar opens.
6. Run `Agent Lee: Open Sidebar`.
7. Confirm there is no `command 'agentLee.openSidebar' not found` error.
8. Confirm the status bar shows `Agent Lee: Ready`.
9. Open Extension Details and confirm README images render.
10. Confirm Runtime Health shows the update channel and manual-local-VSIX explanation.

## Final verdict

FAIL
