<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.INTERACTIVITY.REPAIR
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: UI interactivity repair

## Date
2026-05-12

## Scope
Repair the Agent Lee webview so native inline UI handlers execute normally again and the top-right LeeWay button matches the larger branded button styling.

## Edits applied
1. In [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts), removed the custom `registerCspSafeInlineHandlers()` shim and stopped registering it during UI boot.
2. In [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts), removed the now-unused nonce helper and nonce usage from the main webview script path.
3. In [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts), left the permissive CSP and plain `<script>` behavior in place so inline `onclick`, `onchange`, and `onkeydown` handlers run natively.
4. In [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts), removed inline image height overrides from `topStandardsBtn` and `topRightBrandingBtn` so the shared `topbar-brand-btn` styling controls both buttons consistently.

## Commands run
1. `npm run compile`
2. `npx vsce package`
3. `npm run compile`
4. `npx vsce package`

## Verification
1. `npm run compile` passed after the repair.
2. `npx vsce package` passed after the repair and produced `agent-lee-leeway-coding-system-1.2.3.vsix`.
3. The webview source no longer registers the CSP-safe inline handler shim, and the top-right buttons now rely on the shared `topbar-brand-btn` sizing.

## Notes
This repository already had unrelated in-progress changes in the worktree before this repair. Those were left intact.
