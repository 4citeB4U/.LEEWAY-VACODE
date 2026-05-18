<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.LIVE.BROWSER.VERIFICATION
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: UI live browser verification

## Date
2026-05-12

## Scope
Physically exercise the Agent Lee webview in a real browser session after repair, instead of stopping at compile/package verification.

## Root cause discovered during live test
The webview initially still failed to boot. A real browser run reproduced a `SyntaxError: Unexpected string` in the generated inline script. The failure came from malformed quoting in the voice catalog button HTML inside [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts), where `\'` inside the template literal collapsed into invalid JavaScript in the final rendered webview.

## Edit applied during verification
Updated the three voice catalog button render lines in [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts) to use `\\'` so the final webview script emits valid escaped quotes.

## Commands run
1. `npm run compile`
2. Real browser harness run in Microsoft Edge via `playwright-core` against the generated webview HTML

## Live interaction evidence
Artifacts written in `agent-lee/vscode-extension`:
1. `ui-live-test-result.json`
2. `ui-live-test-proof.png`

## Verified results
1. The webview booted and posted `agentLeeUiReady`.
2. Clicking `Settings` opened the settings backdrop.
3. Clicking `History` opened the history drawer.
4. Clicking `New Chat` posted `newConversation`.
5. Changing the Configuration work mode dropdown posted `setState` with `key=workMode` and `value=ask`.
6. Toggling the General `requireCtrlEnter` checkbox posted `setState` with `key=requireCtrlEnter` and `value=true`.
7. Clicking the visible inline follow-up behavior button posted `setState` with `key=followupBehavior` and `value=queue`.
8. Filling the composer and clicking `Send` posted `sendMessage` with the typed text.
9. The top-right LeeWay and Agent Lee buttons both measured `44x44`.
10. The live page reported no browser `pageErrors`.
