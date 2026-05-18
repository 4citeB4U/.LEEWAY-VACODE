<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.CSP.INLINE.HANDLERS.RECOVERY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee CSP inline handler recovery

## Status
Verified locally on May 11, 2026.

## Root cause
The sidebar webview CSP only allows the nonce-bearing `<script>` block, but the UI still depends on many inline `onclick` and `onkeydown` attributes. In VS Code webviews, those inline handlers are blocked by CSP, which leaves the Send button and many control buttons inert even when the script boot succeeds.

## Edit applied
Added a CSP-safe delegated event bridge in `agent-lee/vscode-extension/src/extension.ts` that listens for clicks and keydowns on elements carrying inline handler attributes, parses the existing handler strings, and invokes the corresponding webview functions from the trusted nonced script context.

## Commands run
1. `npm run compile`
2. Headless jsdom webview boot check for delegated handlers
3. `npx vsce package`

## Verification
1. `npm run compile` passed.
2. The jsdom webview harness completed without runtime errors and a real `Send` button click emitted `postMessage({"command":"sendMessage",...})`.
3. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.2.3.vsix`.
