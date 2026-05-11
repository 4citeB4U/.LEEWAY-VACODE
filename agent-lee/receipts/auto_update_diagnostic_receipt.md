<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.AUTO_UPDATE.DIAGNOSTIC
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee Auto Update Diagnostic

## Status
Completed: diagnosed why VS Code auto update did not make the latest Agent Lee build appear immediately.

## Findings
1. The extension is installed from a local VSIX, not from a Marketplace/private gallery update feed.
2. The extension version is still `1.1.3`, so rebuilding and reinstalling another `1.1.3` package does not look like a new gallery update.
3. The installed extension folder does contain the latest right-side panel command wiring.
4. A running VS Code extension host can keep old extension code loaded until the window is reloaded.

## Commands
1. Read `agent-lee/vscode-extension/package.json`.
2. Searched repository update/install scripts and VSIX references.
3. Listed installed VS Code extension folders for `leeway.agent-lee-leeway-coding-system`.
4. Checked installed extension `package.json` and installed `dist/extension.js`.
5. Ran `code.cmd --list-extensions --show-versions` and confirmed `leeway.agent-lee-leeway-coding-system@1.1.3`.

## Conclusion
The new build is installed on disk, but VS Code will not hot-swap a side-loaded same-version extension into an already-running window. Reload the VS Code window to load the installed build.
