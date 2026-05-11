<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.ACTIVATION.JSDOM_FIX
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee UI Activation jsdom Packaging Fix

## Status
Verified locally: compile and VSIX packaging passed.

## Edits applied
1. Pointed the VS Code extension entrypoint at `dist/extension.js` so the bundled runtime is used.
2. Made `npm run compile` produce both `out` and `dist`.
3. Excluded `out/**` from the VSIX to prevent the unbundled runtime from shipping again.
4. Removed the managed VSIX fallback scan so updates install only from the canonical versioned VSIX path declared by the local extension package.

## Root cause evidence
1. VS Code extension host log reported `Error: Cannot find module 'jsdom'` during activation of `leeway.agent-lee-leeway-coding-system@1.1.8`.
2. Installed extension folder under `%USERPROFILE%\.vscode\extensions\leeway.agent-lee-leeway-coding-system-1.1.8` contained only `axe-core`, `pixelmatch`, `playwright-core`, and `pngjs` under `node_modules`, with no `jsdom` package present.

## Commands run
1. `npm run compile`
2. `npx vsce package`
3. `code.cmd --list-extensions --show-versions | Select-String "leeway.agent-lee-leeway-coding-system"`

## Verification
1. `npm run compile` passed and produced the bundled runtime.
2. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.1.8.vsix`.
3. The packaged VSIX now contains `extension/dist/extension.js` and media assets, with no `extension/out/**` entries.
4. The managed installer now resolves a single canonical package path instead of choosing among multiple matching VSIX files by timestamp.
