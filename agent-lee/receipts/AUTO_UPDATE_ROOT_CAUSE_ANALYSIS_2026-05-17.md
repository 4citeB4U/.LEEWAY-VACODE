<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.AUTO_UPDATE_DIAGNOSIS
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Root-cause report for Agent Lee auto-update persistence and update-channel behavior.
-->

# Auto Update Root Cause

Report time: 2026-05-17 13:46 America/Chicago

## Findings

- VS Code user setting override: not found in `C:\Users\Leona\AppData\Roaming\Code\User\settings.json`
- VS Code workspace setting override: not found in `.vscode/settings.json`
- Extension code overwriting VS Code marketplace auto-update: not found
- Installed source type: side-loaded local VSIX
- Installed channel: `UPDATE_CHANNEL_MANUAL_LOCAL_VSIX`
- Publisher / extension ID stability: stable as `leeway.agent-lee-leeway-coding-system`
- Preview / prerelease metadata blocking updates: not detected
- Workspace policy disabling updates: not detected
- Settings Sync overwriting `extensions.autoUpdate`: not proven from current evidence

## Root cause

The user-facing “Auto Update” expectation is failing because this extension is installed from a local VSIX, not from a registry-backed update channel.

VS Code can persist the general `extensions.autoUpdate` preference, but that does not create a real update feed for a side-loaded local VSIX. Without a marketplace or Open VSX publication channel, VS Code has nothing to poll for newer Agent Lee versions.

## Truth answers

- Is auto update a VS Code setting issue?
  No evidence of a user/workspace setting bug or override.
- Is this extension not receiving marketplace updates because it is side-loaded?
  Yes.
- Is the extension ID/publisher stable?
  Yes. `leeway.agent-lee-leeway-coding-system`.
- Is the installed copy stale because VSIX install must be done manually?
  Yes.
- Is there any extension code overwriting the setting?
  No evidence found.
- Is there any workspace setting overriding it?
  No evidence found.
- What is the reliable update path?
  Manual local release install of the newest VSIX, then reload VS Code.

## Reliable update strategy

### SOURCE_DEV_HOST

- Run from source with F5 / Extension Development Host
- No VSIX install
- Best for development

### LOCAL_RELEASE_VSIX

- Build the newest VSIX
- Install it manually or with `Invoke-LeeWayExtensionInstallCurrent.ps1`
- Reload VS Code
- Re-run installed/runtime checks

### PUBLISHED_UPDATE_CHANNEL

- Publish to VS Code Marketplace or Open VSX
- Only then does true automatic extension update make sense

## Required label

`AUTO_UPDATE_NOT_AVAILABLE_FOR_LOCAL_VSIX`

## Final verdict

Auto Update can not work as a real automatic upgrade path for the current install type.

Final verdict: PASS
