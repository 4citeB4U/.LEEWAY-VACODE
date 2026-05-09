<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.AX_AGENT_LEE_DIAGNOSTICS
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: AX Agent Lee Diagnostics And Memory Routing

## Status
Completed. Specialist agent surfaces now present as AX Agent Lee diagnostics rather than independent VM speakers, and diagnostic actions write through Agent Lee into durable per-agent memory ledgers.

## Edits
1. Updated `agent-lee/vscode-extension/src/core/agent-governance.ts`.
   - Added first-and-last speaker law.
   - Normalized routed agent output as `Agent Lee routed this through AX Agent Lee / {agentName}.`
   - Preserved developer-facing notepad, terminal, workspace, database, and diagnostics inspection surfaces.
2. Updated `agent-lee/vscode-extension/src/core/model-governance.ts`.
   - Added AX Agent Lee subordinate-agent law.
   - Required every AX subagent action to be visible in diagnostics.
   - Required every AX subagent to have a durable memory ledger.
3. Updated `agent-lee/vscode-extension/src/core/memory.ts`.
   - Added per-agent memory ledger paths under `memory/agents/{agentId}/events.jsonl`.
   - Added `storeAgentMemory` and `getMemoryStatus` helpers.
4. Updated `agent-lee/vscode-extension/src/extension.ts`.
   - Renamed the visible Agent VM surface to AX Agent Lee Monitor.
   - Changed wake/stop wording to Enable AX/Pause AX.
   - Changed direct agent asking into an Agent Lee routed ask path.
   - Added diagnostics event posting from monitor open, app open, terminal command, enable, pause, and governed ask actions.
   - Wrote those events to Agent Lee runtime receipts and per-agent memory ledgers.
   - Added diagnostics UI proof for speaker order, route, memory ledger, visible functionality, and recent events.

## Commands And Verification
1. Scanned relevant source with `rg` and `Get-Content` to locate VM, diagnostics, memory, and governance paths.
2. First `npm.cmd run compile` completed TypeScript but failed during bundle because sandboxed npm/esbuild registry/cache access returned `EACCES`.
3. Escalated `npm.cmd run compile` passed.
4. `git diff --check` passed for the changed source paths.
5. `vsce package --allow-missing-repository` passed and produced the VSIX.
6. Removed an unused import, reran `npm.cmd run compile`; sandboxed bundle failed again with the same `EACCES`.
7. Escalated final `npm.cmd run compile` passed.
8. Final `vsce package --allow-missing-repository` passed.
9. Final `git diff --check` passed.

## Artifact
`C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.1.3.vsix`

## Note
The VSIX was packaged but not installed. Extension installation is a protected action under the repository rules and should be explicitly confirmed before running the install command.
