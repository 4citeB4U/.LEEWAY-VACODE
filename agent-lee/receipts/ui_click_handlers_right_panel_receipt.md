<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.CLICK_HANDLERS_RIGHT_PANEL
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee Click Handlers And Right Panel Restore

## Status
Completed: the Agent Lee webview script parses again, chat controls can initialize, and the right-side launcher opens the panel route.

## Edits
1. Updated `agent-lee/vscode-extension/src/extension.ts` so the status bar launcher uses `agentLee.openPanel` and its tooltip describes the right-side panel behavior.
2. Updated `agentLee.open` to open the webview panel route instead of the left Activity Bar sidebar.
3. Corrected escaping in generated webview JavaScript for plugin, MCP, proposed edit, task, and voice action buttons.
4. Corrected escaped quotes in the plugin approval message so the embedded script remains valid.

## Commands And Verification
1. `npm run compile` failed through PowerShell because `npm.ps1` is blocked by local execution policy.
2. `npm.cmd run compile` failed in sandbox when `npx esbuild` attempted npm registry access.
3. Escalated `npm.cmd run compile` passed.
4. Generated webview script syntax check passed: `webview script syntax ok`.
5. `.\node_modules\.bin\vsce.cmd package --allow-missing-repository` passed and created `agent-lee-leeway-coding-system-1.1.3.vsix`.
6. Installed `agent-lee-leeway-coding-system-1.1.3.vsix` into VS Code successfully.
7. Re-ran compile, webview syntax check, package, and VSIX install after the final tooltip alignment.

## Artifact
`C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.1.3.vsix`
