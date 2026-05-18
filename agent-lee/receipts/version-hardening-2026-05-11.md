# LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RECEIPTS.VERSION_HARDENING.MAIN
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render

# Agent Lee Version Hardening Receipt

Date: 2026-05-11

## Scope

- Updated the VS Code extension release version from `1.2.2` to `1.2.3`.
- Aligned `package.json` and `package-lock.json` release metadata.
- Hardened local VSIX resolution so only the exact manifest-matching VSIX can be auto-installed.
- Updated packaging scripts to synchronize release metadata before compile/package.
- Archived stale VSIX artifacts and the old installed `1.2.2` extension folder.

## Files Edited

- `agent-lee/vscode-extension/package.json`
- `agent-lee/vscode-extension/package-lock.json`
- `agent-lee/vscode-extension/src/extension.ts`
- `agent-lee/vscode-extension/scripts/sync-release-metadata.mjs`
- `agent-lee/vscode-extension/scripts/package-release.mjs`
- `agent-lee/scripts/Build-AgentLeeVSIX.ps1`
- `agent-lee/scripts/Invoke-AgentLeeDoctor.ps1`
- `agent-lee/scripts/Invoke-AgentLeeQuarantineRecovery.ps1`

## Commands Run

1. `node.exe .\scripts\sync-release-metadata.mjs`
2. `.\agent-lee\scripts\Build-AgentLeeVSIX.ps1`
3. `.\agent-lee\scripts\Install-AgentLeeVSIX.ps1 -VsixPath .\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix -LiveProfile`
4. `code.cmd --list-extensions --show-versions`
5. `code.cmd --uninstall-extension leeway.agent-lee-leeway-coding-system`
6. `.\agent-lee\scripts\Install-AgentLeeVSIX.ps1 -VsixPath .\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix -LiveProfile`
7. PowerShell archive move for stale release artifacts into `_archive\version-cleanup-20260511-1225`

## Verification Results

- `sync-release-metadata.mjs`: passed, release metadata synchronized at `1.2.3`.
- Build script: passed, produced `agent-lee/vscode-extension/agent-lee-leeway-coding-system-1.2.3.vsix`.
- VS Code CLI install: passed.
- VS Code extension listing: confirmed `leeway.agent-lee-leeway-coding-system@1.2.3`.
- Extension build directory cleanup: confirmed only `agent-lee-leeway-coding-system-1.2.3.vsix` remains in `agent-lee/vscode-extension`.

## Archived Artifacts

- `agent-lee/vscode-extension/agent-lee-investigate.vsix`
- `agent-lee/vscode-extension/agent-lee-leeway-coding-system-1.2.2.vsix`
- `agent-lee/vscode-extension/_vsix_inspect`
- `agent-lee-leeway-coding-system-v1.1.8-ACTIVATION-FIXED.vsix`
- `agent-lee-leeway-coding-system-v1.1.8-AUTO-UPDATE-FIXED.vsix`
- `%USERPROFILE%\.vscode\extensions\leeway.agent-lee-leeway-coding-system-1.2.2`

## Notes

- `Invoke-AgentLeeDoctor.ps1` had unrelated pre-existing local edits in the worktree before this task. Those edits were preserved.
