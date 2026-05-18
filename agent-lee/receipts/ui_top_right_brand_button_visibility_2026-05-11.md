<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.TOPRIGHT.BRAND.VISIBILITY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee top-right brand button visibility

## Status
Verified locally on May 11, 2026.

## Root cause
The top-right Agent Lee branding button rendered at `24px` with no visual frame, which made it read like a tiny dot instead of a clear interactive control.

## Edit applied
In `agent-lee/vscode-extension/src/extension.ts`, increased the top-right branding button to a `44px` hit area with a bordered button shell and raised the icon size to `34px`.

## Commands run
1. `npm run compile`
2. `npx vsce package`

## Verification
1. `npm run compile` passed.
2. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.2.3.vsix`.
3. The top-right button now renders with a `44px` hit area and `34px` image size in `agent-lee/vscode-extension/src/extension.ts`.
