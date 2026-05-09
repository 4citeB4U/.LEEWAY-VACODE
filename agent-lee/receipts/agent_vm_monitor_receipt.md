<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.AGENT_VM_MONITOR
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent VM Monitor And LeeWay MCP Agent Identity

## Status
Completed. The settings UI now treats MCP entries as LeeWay MCP Agents, keeps them in the MCP section, gives regular agents their own LeeWay identities, and opens a per-agent VM monitor from each row.

## Edits
1. Updated `agent-lee/vscode-extension/src/core/settings-catalog.ts`.
   - Added VM identity metadata: real name, family, lineage, duties, authorities, VM address, notepad path, database path, and heartbeat.
   - Expanded the MCP catalog so `*-mcp` workspace systems live in the MCP section as LeeWay MCP Agents.
   - Kept regular LeeWay agents in the Agents catalog.
2. Updated `agent-lee/vscode-extension/src/core/runtime-settings.ts`.
   - Added the new MCP agents to default MCP settings.
   - Removed MCP agents from default regular-agent settings.
   - Added migration logic so legacy enabled MCP agent IDs move from `enabledAgents` into `enabledMcpServers`.
3. Updated `agent-lee/vscode-extension/src/extension.ts`.
   - Added an Agent VM monitor button to MCP and Agent settings rows.
   - Added a webview-native VM modal with Desktop, Workspace, Web Search bridge, Notepad, Database, Diagnostics, Terminal, wake/stop controls, and a direct question lane.
   - Added status rendering for awake/sleeping agents and local VM session logs.
   - Updated the settings overlay capability names to show real MCP names instead of raw IDs.

## Commands And Verification
1. `Get-ChildItem -Force` scanned the repository root.
2. `rg --files` scanned repository files.
3. `git status --short` confirmed the worktree was already dirty before this change.
4. `rg -n "Settings|settings|tag|Tag|MCP|Agent|agent" agent-lee/vscode-extension/src -g "*.ts" -g "*.tsx"` found settings and catalog paths.
5. `rg -n "webview|Webview|createWebview|postMessage|settings" agent-lee/vscode-extension/src` found the generated webview UI.
6. `Get-ChildItem -Recurse -File agent-lee\receipts | Select-Object -First 20 FullName,Length,LastWriteTime` inspected existing receipt style.
7. `Get-Content agent-lee\vscode-extension\src\core\settings-catalog.ts` inspected the settings catalogs.
8. `Get-Content` slices of `agent-lee\vscode-extension\src\extension.ts` inspected settings HTML, row rendering, message handling, and boot code.
9. `Get-ChildItem -Recurse -Filter AGENTS.md | Select-Object FullName` confirmed the active repository instructions.
10. `Get-Content agent-lee\receipts\ui_click_handlers_right_panel_receipt.md` inspected prior receipt format.
11. `Get-Content agent-lee\vscode-extension\package.json` and `Get-Content agent-lee\vscode-extension\tsconfig.json` inspected build configuration.
12. `rg -n "DEFAULT_MCP_SERVER_CATALOG|DEFAULT_AGENT_CATALOG|enabledMcpServers|customMcpServers|agentConfigs|mcpServerConfigs" agent-lee/vscode-extension/src` found all catalog consumers.
13. `Get-Content agent-lee\vscode-extension\src\core\runtime-settings.ts` inspected runtime defaults and persistence.
14. `Get-ChildItem workspace\agents -Directory | Select-Object Name` found workspace agent folders.
15. `Get-Content workspace\agents\leeway-ci-blueprint-mcp\AGENT_INDEX.md`, `mutation-agent\AGENT_INDEX.md`, `perception-agent\AGENT_INDEX.md`, and `qa-mcp\AGENT_INDEX.md` inspected representative agent indexes.
16. `Get-Content agent-lee\mcp\mcp-registry.json` and `Get-Content agent-lee\mcp\generated-capability-catalog.json` inspected generated MCP capability context.
17. First `npm.cmd run compile` failed in the sandbox because npm/esbuild attempted registry or cache access and hit `EACCES`.
18. Escalated `npm.cmd run compile` passed.
19. First Node webview script check failed because PowerShell stripped quotes from the inline command.
20. Second Node webview script check exposed raw template escape parsing around generated `onclick` strings.
21. Corrected the checker to account for template-literal escaping; webview script syntax check passed with `webview script syntax ok`.
22. `git diff --check -- agent-lee/vscode-extension/src/core/settings-catalog.ts agent-lee/vscode-extension/src/core/runtime-settings.ts agent-lee/vscode-extension/src/extension.ts` first flagged two trailing whitespace lines in `extension.ts`.
23. Removed the trailing whitespace and reran `git diff --check`; it passed.
24. Final sandboxed `npm.cmd run compile` failed again with the same npm/esbuild `EACCES` sandbox restriction.
25. Final escalated `npm.cmd run compile` passed.
26. `& .\node_modules\.bin\vsce.cmd package --allow-missing-repository` passed and produced the VSIX.
27. Escalated VS Code install command passed: `code.cmd --install-extension agent-lee-leeway-coding-system-1.1.3.vsix --force`.
28. Final targeted `git status --short` showed the source files changed.
29. Final `Get-Item agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.1.3.vsix` confirmed the packaged artifact exists.

## Artifact
`C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.1.3.vsix`
