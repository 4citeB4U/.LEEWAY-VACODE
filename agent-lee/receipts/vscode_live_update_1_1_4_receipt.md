<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.VSCODE.LIVE_UPDATE_1_1_4
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: VS Code Live Update 1.1.4

## Status
Completed: built, packaged, and installed Agent Lee `1.1.4` into the live VS Code profile.

## Edits
1. Updated `agent-lee/vscode-extension/src/core/runtime-settings.ts` to persist `autoUpdateEnabled` and `lastAppliedVsixSignature`.
2. Updated `agent-lee/vscode-extension/src/extension.ts` to add:
   - local VSIX discovery
   - `Update Now` handling
   - startup auto-update handling
   - settings UI for the auto-update toggle
3. Updated `agent-lee/vscode-extension/package.json` from `1.1.3` to `1.1.4`.
4. Updated `agent-lee/config/runtime-state.json` to enable auto-update and seed the applied VSIX signature for the freshly installed build.

## Commands
1. `npm.cmd run compile`
2. `npx.cmd @vscode/vsce package --no-rewrite-relative-links -o agent-lee-leeway-coding-system-1.1.4.vsix`
3. `code.cmd --install-extension C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.1.4.vsix --force`
4. `code.cmd --list-extensions --show-versions`

## Verification
1. Compile passed and produced `dist/extension.js`.
2. VSIX packaging passed and produced `agent-lee-leeway-coding-system-1.1.4.vsix`.
3. Live install reported: `Extension 'agent-lee-leeway-coding-system-1.1.4.vsix' was successfully installed.`
4. VS Code extension listing reported: `leeway.agent-lee-leeway-coding-system@1.1.4`.

## Notes
1. A currently open VS Code window may still need one reload to swap the running extension host over to the newly installed `1.1.4` code.
