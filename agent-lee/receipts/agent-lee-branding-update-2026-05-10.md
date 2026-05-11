<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPTS.BRANDING.UPDATE
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Receipt for Agent Lee branding asset alignment, packaging, and local VSIX installation.
-->

# Agent Lee Branding Update Receipt

Date: 2026-05-10

## Scope

- Updated the extension marketplace/install icon to `media/leeway-standards-button.png`.
- Updated the Activity Bar container icon to `media/leeway-standards-button.png`.
- Updated the sidebar view label from `Agent Lee Chat` to `Agent Lee`.
- Updated the editor title command icon to `media/leeway-standards-button.png`.
- Updated the webview top-right and footer-right image paths to use `media/leeway-standards-button.png`.
- Updated the status bar text to remove the robot codicon and display plain `Agent Lee: Ready` or `Agent Lee: Degraded`.
- Updated packaged README image references to use the Agent Lee mark.

## Files Changed

- `agent-lee/vscode-extension/package.json`
- `agent-lee/vscode-extension/src/extension.ts`
- `agent-lee/vscode-extension/README.md`

## Commands Run

```powershell
npm run compile
npx vsce package
& "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd" --install-extension "C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.1.8.vsix" --force
```

## Verification

- `npm run compile`: passed
- `npx vsce package`: passed
- VS Code CLI install of `agent-lee-leeway-coding-system-1.1.8.vsix`: passed

## Notes

- VS Code status bar items do not support arbitrary bitmap icons through the public API, so the custom Agent Lee image could not be embedded directly in the status bar item.
- The status bar was updated to plain text so the incorrect robot icon no longer appears.
