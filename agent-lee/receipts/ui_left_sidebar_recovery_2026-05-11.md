<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.LEFT.SIDEBAR.RECOVERY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee left sidebar recovery

## Status
Verified locally on May 11, 2026.

## Root cause
Several Agent Lee entry points still opened the standalone webview panel in `ViewColumn.Beside`, which pushed the app to the right side instead of focusing the contributed left sidebar. The sidebar webview also posted `ready`, while the extension host only listened for `agentLeeUiReady`, so first-load hydration could be skipped.

## Edits applied
1. Changed the runtime status bar button to focus `agentLee.openSidebar` instead of the right-side panel command.
2. Changed `agentLee.openPanel` and `agentLee.open` to focus the contributed sidebar.
3. Updated UI recovery to reopen the sidebar without forcing the extra right-side panel.
4. Accepted both `ready` and `agentLeeUiReady` in the webview message handler.

## Commands run
1. `npm run compile`
2. `npx vsce package`

## Verification
1. `npm run compile` passed.
2. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.1.8.vsix`.
3. The startup/open/status-bar command paths now route to the left sidebar code path instead of `createWebviewPanel(..., ViewColumn.Beside, ...)`.
