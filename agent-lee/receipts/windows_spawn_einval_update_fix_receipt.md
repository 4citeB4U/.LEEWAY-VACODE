<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.WINDOWS.SPAWN.EINVAL.UPDATE_FIX
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Windows Spawn EINVAL Update Fix

## Status
Completed: diagnosed and patched the Agent Lee self-update path that was failing with `spawn EINVAL` on Windows.

## Findings
1. The update flow in `agent-lee/vscode-extension/src/extension.ts` calls `runCommandCapture()`.
2. `runCommandCapture()` used Node `execFile()` directly against `code.cmd`.
3. On Windows, launching `.cmd`/`.bat` files through `execFile()` can fail with `EINVAL`; they should be launched through `cmd.exe` or a shell.

## Edits
1. Updated `agent-lee/vscode-extension/src/extension.ts` to detect Windows batch-script targets.
2. Routed `.cmd` and `.bat` executions through `cmd.exe /d /s /c call ...` while leaving other command launches unchanged.

## Commands
1. `rg -n "Agent Lee update failed|execFile\\(|DEFAULT_VSCODE_CLI" agent-lee/vscode-extension/src/extension.ts -S`
2. `where.exe code`
3. `& "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd" --version`
4. `npm run compile`

## Verification
1. Confirmed the VS Code CLI exists at `C:\Users\Leona\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd`.
2. Confirmed the CLI responds normally when launched through the shell.
3. Compile passed after the patch.

## Notes
1. This fix targets the updater path that installs the local VSIX and reloads VS Code.
2. If the running window still has stale code loaded, one manual reload may still be needed after the next successful install.
