<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.SIDEBAR.BOOT.FIX
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee sidebar webview boot fix

## Status
Verified locally on May 11, 2026.

## Root cause
The main sidebar webview generated invalid inline JavaScript inside the Voice of Agent Lee catalog buttons. The broken `onclick` string caused the webview script to fail at startup, which prevented the UI from loading.

## Edit applied
Updated the Voice of Agent Lee catalog button rendering in `agent-lee/vscode-extension/src/extension.ts` to use HTML-escaped apostrophes plus `escapeHtml(v.id)` so the generated inline script stays syntactically valid.

## Commands run
1. `npm run compile`
2. `npx vsce package`
3. Inline webview script parse check via Node + TypeScript transpile of `getHtml()`

## Verification
1. `npm run compile` passed.
2. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.1.8.vsix`.
3. The generated sidebar inline script parsed successfully with `SCRIPT_OK`.
4. The `jsdom/xhr-sync-worker.js` build warning still appears, but it did not block compile or packaging and was not the cause of this UI boot failure.
