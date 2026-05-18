<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.RUNTIME.VSIX.LIVE.UPDATE
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee live profile VSIX update

## Status
Verified locally on May 11, 2026.

## Intent
Install the freshly packaged `agent-lee-leeway-coding-system-1.2.3.vsix` into the live VS Code profile and reload the visible VS Code window so the active extension matches the repaired source.

## Commands run
1. `npx vsce package`
2. `powershell -File agent-lee/scripts/Install-AgentLeeVSIX.ps1 -VsixPath agent-lee/vscode-extension/agent-lee-leeway-coding-system-1.2.3.vsix -LiveProfile`
3. PowerShell window automation to run `Developer: Reload Window`

## Verification
1. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.2.3.vsix`.
2. The live-profile VSIX install succeeded with `Extension 'agent-lee-leeway-coding-system-1.2.3.vsix' was successfully installed.`
3. The installed extension directory under `%USERPROFILE%\\.vscode\\extensions` now shows `leeway.agent-lee-leeway-coding-system-1.2.3`.
4. The reload command was dispatched to the visible VS Code window via command-palette automation.
5. The governed runtime metadata file still reports stale `1.1.8` activation details, so activation-state refresh remains a separate issue from the successful VSIX install.
