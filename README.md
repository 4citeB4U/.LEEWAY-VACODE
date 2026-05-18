<!--
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.REPOSITORY.README.MAIN
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Agent Lee LeeWay Coding System

<p align="center">
  <img src="./agent-lee/vscode-extension/media/leeway-standards-logo.png" alt="LeeWay Standards logo" width="170" />
</p>

<p align="center"><strong>Governed AI engineering inside VS Code with runtime truth, controlled installs, LVIS visual workflows, and receipts on every meaningful lane.</strong></p>

<p align="center">
  <img src="./agent-lee/vscode-extension/media/readme-header.png" alt="Agent Lee LeeWay autonomous engineering system in VS Code" width="100%" />
</p>

This repository is the authoritative workspace for the Agent Lee VS Code application, its governed runtime, its LeeWay laws and receipts, and the LVIS visual-intelligence subsystem.

The current packaged and installed extension version in this workspace is `1.2.11`. Source, VSIX, installed files, and the active live extension host are now aligned on that version. The remaining closure work is in live visual proof, README live proof, and evidence-consistency cleanup, not in install/runtime split-brain repair.

## What This Repository Contains

| Area | Purpose |
| :--- | :--- |
| `agent-lee/vscode-extension` | The shipped VS Code extension, packaging flow, runtime truth gates, and UI surfaces. |
| `agent-lee/governance` | LeeWay laws, identity coverage, integrity rules, and governing models. |
| `agent-lee/voice` | LeeWay live voice runtime, voice bridge, cloned voice assets, and doctrine. |
| `agent-lee/receipts` | Human-readable receipts for runtime truth, governance passes, repairs, and incidents. |
| `agent-lee/vscode-extension/test-evidence` | Machine-readable evidence for compile, install, runtime, visual, README, voice, and closure gates. |
| `agent-lee/vscode-extension/src/visual-intelligence` | LVIS worker routing, panels, schemas, quality gates, and governed asset workflows. |

## Current Platform Elevations

| Elevation | Current State |
| :--- | :--- |
| Runtime truth | Source, package, installed runtime, and live host are aligned at `1.2.11`. |
| Update-channel truth | Local VSIX installs are truthfully classified as `UPDATE_CHANNEL_MANUAL_LOCAL_VSIX`. |
| Install governance | Same-version stale installs are quarantined instead of trusted blindly. |
| Live-host attestation | Active host self-attestation now resolves to the current installed build hash. |
| Identity graph | Runtime, UI, bridge, and command ownership coverage passes. |
| Asset registry | Activity Bar icon, chat avatar, README assets, and branded buttons are registry-backed. |
| Right-side surface routing | Agent Lee can prefer a right-side surface when sidebar reveal is not the right UX path. |
| Runtime diagnosis | Runtime Status, Diagnose Runtime, Show Installed Version, and Show Update Channel are first-class commands. |
| Voice governance | LeeWay live voice routing, transcript bridge, and status separation are governed explicitly. |
| LVIS | A governed visual-intelligence subsystem is present for vector, voxel, scene, depth, repair, export, and integration workflows. |
| Receipt-first verification | Compile, install, runtime, voice, visual, README, and closure lanes all emit evidence artifacts. |

## Workflow Execution

Agent Lee operates via a strict governance and execution workflow:
1. **Scan workspace:** Analyze the local environment.
2. **Build context pack:** Accumulate necessary codebase knowledge.
3. **Create work package:** Structure the tasks based on user intent.
4. **Generate pending hunks:** Formulate local code edits.
5. **Show diff:** Present changes for review.
6. **Ask for approval:** Request explicit user permission.
7. **Apply with WorkspaceEdit:** Make physical changes.
8. **Verify:** Check compilation, tests, and formatting.
9. **Write receipt:** Produce audit logs.
10. **Report truthfully:** Provide a governed, sovereign response to the user.

---

## Extension Surfaces

| Surface | Purpose |
| :--- | :--- |
| Activity Bar view | Opens the governed Agent Lee sidebar webview. |
| Status Bar launcher | Opens the preferred Agent Lee surface and exposes runtime health. |
| Sidebar chat | Hosts the main Agent Lee session, controls, history, and voice toggles. |
| Right-side surface | Preferred fallback when a true right-side sidebar reveal is not available. |
| Runtime diagnostics | Shows installed version, update channel, runtime health, and attestation status. |
| README surface | Opens the packaged extension README from the installed runtime. |
| LVIS panel | Opens the governed visual-intelligence panel and system status surface. |

## Key Commands

| Command | Purpose |
| :--- | :--- |
| `Agent Lee: Open Chat` | Opens Agent Lee in a panel. |
| `Agent Lee: Open LeeWay Control Panel` | Opens the governed main control surface. |
| `Agent Lee: Open Sidebar` | Focuses the Activity Bar sidebar view. |
| `Agent Lee: Open Right Surface` | Opens the preferred right-side Agent Lee surface. |
| `Agent Lee: Recover UI Surface` | Restores Agent Lee UI surfaces after stale or hidden state. |
| `Agent Lee: Runtime Status` | Shows current runtime readiness and proof state. |
| `Agent Lee: Show Installed Version` | Reports the installed extension version. |
| `Agent Lee: Show Update Channel` | Reports whether the runtime came from dev host, local VSIX, or a published lane. |
| `Agent Lee: Install Current Build` | Installs the current managed local VSIX. |
| `Agent Lee: Diagnose Runtime` | Writes fresh runtime-truth evidence and surfaces mismatches. |
| `Agent Lee: Open README` | Opens the packaged README surface. |
| `Agent Lee: Open LVIS Panel` | Opens the LVIS visual-intelligence panel. |
| `Agent Lee: LVIS System Status` | Shows LVIS worker and route status. |
| `Agent Lee: New Chat` | Starts a fresh conversation. |
| `Agent Lee: Stop Voice` | Stops active voice playback. |
| `Agent Lee: Speak Status` | Speaks the current voice/runtime status lane. |

## Canonical LeeWay VS Code Runtime Stack

### LLMs
| Model | Role |
| :--- | :--- |
| `qwen2.5-coder:1.5b` | Lightweight routing, classification |
| `qwen2.5-coder:7b` | Coding, tool orchestration |
| `qwen2.5-coder:14b` | Coding, routing, classification, tool orchestration |
| `deepseek-coder-v2:16b` | Heavy code synthesis, multi-file reasoning |
| `llama3.1:8b` | Scene generation, structural synthesis |
| `llava:7b` | Vision understanding, image interpretation |
| `phi3:mini` | Lightweight execution tasks |
| `nomic-embed-text`| Vector memory, retrieval |
| `azr` | Reasoning, repair-loop cognition |
| `echo` | Memory, diagnostics, receipts |

---

## Runtime Truth And Update Model

Agent Lee treats runtime proof as part of the application, not as an afterthought.

| Lane | What It Proves |
| :--- | :--- |
| Build truth | `npm run compile` and `build/runtime-build-info.json` match the source tree. |
| Package truth | The current VSIX was built from current source and carries the right assets. |
| Installed truth | The installed extension files match the current build hash. |
| Live-host truth | The active VS Code extension host self-attests the same build hash as source/install. |
| Incident closure | Runtime, evidence consistency, identity graph, live visual, README, voice, and update truth are checked together. |

For local side-loaded installs, VS Code marketplace auto-update is not available. The governed update path is:

1. Build and package the current VSIX.
2. Run `Agent Lee: Install Current Build` or `Invoke-LeeWayExtensionInstallCurrent.ps1`.
3. Reload VS Code and run `Agent Lee: Diagnose Runtime`.
4. Confirm active runtime attestation is current.

## Canonical Agent Lineup

| Name | Family | Skills | Purpose | Job |
| :--- | :--- | :--- | :--- | :--- |
| **agent-lee-prime** | Prime | Routing, Execution | Sovereign Coordinator | Primary Sovereign Agent |
| **fs-nav-agent** | Navigator | FS Inspection | Workspace discovery | File system navigation |
| **host-exec-agent** | Executor | Shell Commands | CLI interactions | Host execution operations |
| **media-forge-agent** | Forge | Media generation | Asset generation | Media synthesis |
| **mutation-agent** | Forge | Code diffing | Writing changes | File modification |
| **perception-agent** | Intelligence | Insight generation| Vision and analysis | Perception tasks |
| **leeway-visual-orchestrator-agent**| LVIS | Visual workflows | Coordinate graphics | Visual Governance Agent |
| **shield-governor-agent** | Security | Enforcement | Block risky ops | Review protected actions |
| **attestation-marshal-agent** | Security | Verification | Agent verification | Verify identity claims |
| **memory-warden-agent** | Security | Provenance | Ledger maintenance | Protect memory states |
| **threat-sentinel-agent** | Security | Monitoring | Threat hunting | Hunt rogue workflows |

---

## Canonical MCPs

The following MCP (Model Context Protocol) plugins form the Leeway governance structure:

| MCP | Function |
| :--- | :--- |
| **leeway-agent-registry** | Agent VM registration |
| **leeway-desktop-commander** | Desktop environment bridge |
| **leeway-docs-rag** | Documentation retrieval |
| **leeway-health** | System health monitoring |
| **leeway-insforge** | Instructions forging |
| **leeway-memory** | Persistent memory ledger |
| **leeway-planner** | Task breakdown and routing |
| **leeway-playwright** | Browser automation |
| **leeway-scheduling** | Task timing and cron |
| **leeway-testsprite** | Test orchestration |
| **leeway-validation** | Governance compliance checking |
| **frontend-mcp** | Frontend execution bridge |
| **backend-mcp** | Backend execution bridge |
| **design-system-mcp** | UI design tokens bridge |
| **creative-mcp** | Visual creative execution |
| **memory-mcp** | Standard memory integration |
| **scheduler-mcp** | Time-based scheduling |
| **ui-builder-mcp** | UI components builder |
| **leeway-build-auditor-mcp** | Build auditing |
| **leeway-ci-blueprint-mcp** | CI/CD operations |
| **leeway-edge-optimizer-mcp** | Performance optimizations |
| **leeway-full-repo-checker-mcp**| Complete repo review |
| **leeway-responsive-ui-mcp** | Responsive design tasks |
| **qa-mcp** | QA validation |
| **react-native-mcp** | Mobile ecosystem integration |
| **leeway-visual-intelligence-system**| Primary LVIS framework bridge |

---

## Canonical LVIS Subsystem

LVIS = **Leeway Visual Intelligence System**

**Purpose:**
- SVG reconstruction
- voxel reconstruction
- 3D scene reconstruction
- quality verification
- repair loops
- asset packaging
- project integration
- developer-ready exports

### LVIS Objective
Transform Leeway VS Code into a sovereign visual engineering platform capable of:
- `image` &rarr; `SVG`
- `image` &rarr; `voxel`
- `SVG` &rarr; `voxel`
- `image` &rarr; `3D scene`
- `3D asset` &rarr; `React component`
- `asset` &rarr; `validated project integration`

With:
*local models, local orchestration, Leeway workers, MCP governance, deterministic reconstruction, developer-safe workflows.*

### Canonical LVIS Workers

| Worker | Role |
| :--- | :--- |
| **leeway-visual-orchestrator-agent**| Primary orchestrator |
| **leeway-vector-reconstruction-worker**| SVG and 2D shapes |
| **leeway-voxel-reconstruction-worker**| Voxelized space synthesis |
| **leeway-scene-reconstruction-worker**| 3D composition |
| **leeway-depth-synthesis-worker** | Depth analysis |
| **leeway-structural-fidelity-worker**| Quality and shape matching |
| **leeway-asset-repair-worker** | Automated refinement |
| **leeway-manifest-export-worker** | Asset bundle generation |
| **leeway-project-integration-worker**| Integration code writing |
| **leeway-visual-memory-worker** | Image and state caching |

---

## Voice And Runtime Governance

LeeWay Voice is a governed owner-facing control path, not a raw transcript dump. Runtime health, bridge heartbeat, and degraded-state messages are separated from normal chat so status noise cannot masquerade as conversation.

The live voice lane currently proves route policy and transcript bridge health. Human-audible proof remains a distinct lane and must be marked `PARTIAL` until it is actually heard and accepted in a live VS Code session.

## Canonical Governance Rules

**Leeway Standards:**
- schema-first
- local-first
- receipt-required
- deterministic-tools-first
- pending-edits workflow
- agent ownership
- auditability
- repair loops
- quality gates
- no blind edits
- governed proposal-first public projection, owner education, runtime authority, and traceable identity

---

## Canonical Runtime Identity

| Identity Component | Assigned |
| :--- | :--- |
| **Host** | Leeway VS Code |
| **Primary Sovereign Agent** | agent-lee-prime |
| **Visual Governance Agent** | leeway-visual-orchestrator-agent |
| **Visual Subsystem** | leeway-visual-intelligence-system |

---

## Canonical Visual Intelligence Routing

<p align="center">
  <img src="./agent-lee/vscode-extension/media/readme-system-flow.png" alt="Agent Lee system flow with VS Code, model hive, law engine, browser validator, voice, memory, reports, and LeeWay standards" width="100%" />
</p>

| Engine/Model | Execution Goal |
| :--- | :--- |
| **Qwen Models** | coding, routing, classification, tool orchestration |
| **DeepSeek Coder** | heavy code synthesis, multi-file reasoning |
| **LLaVA** | vision understanding, image interpretation |
| **Llama3.1** | scene generation, structural synthesis |
| **phi3:mini** | lightweight execution tasks |
| **AZR** | reasoning, repair-loop cognition |
| **echo** | memory, diagnostics, receipts |
| **nomic-embed-text**| vector memory, retrieval |

---

## Verification Snapshot

Current verified state in this workspace:

| Gate | Status |
| :--- | :--- |
| Source truth | `PASS` |
| Package truth | `PASS` |
| Installed truth | `PASS` |
| Live host truth | `PASS` |
| Identity graph | `PASS` |
| Asset registry | `PASS` |
| Update channel truth | `PASS` |
| Simple prompt fast lane | `PASS` |
| Voice route policy | `PASS` |
| Transcript bridge | `PASS` |
| Live visual validation | `FAIL` |
| README live proof | `FAIL` |
| Human-audible voice | `PARTIAL` |
| Incident closure | `FAIL` |

This is intentional truth-reporting. The install/runtime cleanup is complete; the remaining closure work is visual proof, README live render proof, and evidence-consistency cleanup.

## Control Surfaces

The UI is structured around governed panels inside VS Code. The correct buttons provide access to these runtime modes:

<p align="center">
   <img src="./agent-lee/vscode-extension/media/leeway-standards-button.png" alt="LeeWay standards button" width="72%" />
</p>

<p align="center">
   <img src="./agent-lee/vscode-extension/media/top-right-button-new.png" alt="Top-right button reference" width="48%" />
   <img src="./agent-lee/vscode-extension/media/bottom-button-for-agent-lee.png" alt="Bottom button reference" width="48%" />
</p>

## Local Development And Packaging

From the repository root:

```powershell
npm install
```

From `agent-lee/vscode-extension`:

```powershell
npm install
npm run compile
powershell -File .\scripts\Invoke-LeeWayExtensionDevReload.ps1
powershell -File .\scripts\Invoke-LeeWayExtensionReleasePackage.ps1
```

The release packaging lane is separate from the dev-host lane and is expected to write build, packaging, install, runtime, and closure evidence under `agent-lee/vscode-extension/test-evidence`.

## Repository Author

**Leonard Lee**  
Freelance Full-Stack Developer and AI Systems Architect  
GitHub: [4citeB4U](https://github.com/4citeB4U)
