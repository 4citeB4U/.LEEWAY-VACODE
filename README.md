<!--
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.REPOSITORY.README.MAIN
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Agent Lee LeeWay Coding System

<p align="center">
  <img src="./agent-lee/vscode-extension/media/LeeWayStandardslogo.png" alt="LeeWay Standards logo" width="160" />
</p>

**Agent Lee** is a governance-first VS Code engineering assistant for front-end builds, application repair, codebase inspection, browser validation, local model routing, voice I/O, and proof-first delivery.

<p align="center">
  <img src="./agent-lee/vscode-extension/media/readme-header.png" alt="Agent Lee LeeWay autonomous engineering system in VS Code" width="100%" />
</p>

This repository contains the Agent Lee VS Code extension, local runtime scripts, LeeWay standards material, voice wiring, MCP/agent registries, safety helpers, and verification reports.

## Current Feature Surface

| Feature | What It Does |
| :--- | :--- |
| Activity Bar chat | Adds the Agent Lee sidebar in VS Code with a dedicated chat webview. |
| Status Bar launcher | Adds a bottom status bar button for opening Agent Lee quickly. |
| Command Palette actions | Provides open chat, open sidebar, open README, new chat, stop voice, and PyCharm tooling commands. |
| Workspace intelligence | Reads the open VS Code workspace and samples real project files before answering. |
| External folder approval | Detects local paths in prompts and asks before inspecting folders outside the current workspace. |
| Remote URL context | Pulls context from URLs when a prompt includes a remote target. |
| Three-model hive | Routes Builder, Designer/UX, and Verifier work to separate Ollama models. |
| Runtime model selection | Populates model dropdowns from `http://localhost:11434/api/tags`. |
| Approval modes | Supports `SAFE`, `BALANCED`, and `FULL AUTO` runtime behavior. |
| Web mode | Uses DuckDuckGo instant-answer lookup when enabled or when the prompt asks for web/latest/search context. |
| Voice output | Speaks Agent Lee responses through the configured local voice adapter. |
| Mic input | Uses VS Code webview speech recognition when available. |
| Chat history | Persists conversations and lets you switch or start a new chat. |
| Memory logs | Writes local memory/log artifacts under `.leeway-vscode/memory` and `.leeway-vscode/logs`. |
| Law engine | Blocks unsafe requests such as force-push, direct main push, bulk delete, and core overwrite actions. |
| Scheduler and drift watch | Serializes execution and tracks repeated runtime errors as drift. |
| Capability catalog | Builds a live capability inventory from local MCP, agent, and registry sources. |
| Browser validator | Runs Playwright-based inspection for front-end and visual tasks. |
| Visual evidence | Produces screenshots, baseline images, visual diffs, browser reports, and flow reports. |
| Accessibility checks | Uses `axe-core` during browser inspection. |
| Performance and network checks | Captures load timing, requests, failed requests, missing images, broken links, console errors, and warnings. |
| Flow testing | Can execute planned browser actions and assertions for interactive UI review. |
| PyCharm tooling | Installs Agent Lee helper wiring into detected PyCharm configuration folders. |

<p align="center">
  <img src="./agent-lee/vscode-extension/media/readme-system-flow.png" alt="Agent Lee system flow with VS Code, model hive, law engine, browser validator, voice, memory, reports, and LeeWay standards" width="100%" />
</p>

## Main Paths

| Path | Purpose |
| :--- | :--- |
| `agent-lee/vscode-extension` | Current VS Code extension source, package metadata, README, and media. |
| `agent-lee/scripts` | Build, install, doctor, UI clickthrough, and validation scripts. |
| `agent-lee/voice` | Voice runtime configuration and local speech scripts. |
| `agent-lee/mcp` | MCP and capability registry data. |
| `agent-lee/safety` | Local governance and safety helpers. |
| `LeeWay-Standards` | Standards, runtime, governance, and supporting system material. |
| `reports` | Extension install, doctor, browser, repair, and validation artifacts. |
| `memory` | Local conversation and memory data. |

## Interface Controls

| Control | Purpose |
| :--- | :--- |
| Builder Model | Primary implementation and planning model. |
| Designer/UX Model | Layout, hierarchy, accessibility, and visual polish model. |
| Verifier Model | Syntax, regression, risk, and compliance review model. |
| Approval | Chooses `SAFE`, `BALANCED`, or `FULL AUTO`. |
| Web | Turns web lookup on or off. |
| Voice | Turns spoken responses on or off. |
| Visual Browser | Enables browser-backed visual inspection. |
| Show Cursor | Shows cursor movement during browser flow runs. |
| Browser slow motion | Controls browser action pacing for visible validation. |
| Mic | Dictates into the prompt field when the webview supports speech recognition. |
| History | Opens previous conversations. |
| README | Opens the packaged README. |

<p align="center">
  <img src="./agent-lee/vscode-extension/media/leeway-standards-button.png" alt="Agent Lee status bar launcher and LeeWay standards button" width="70%" />
</p>

## Commands

| Command | Purpose |
| :--- | :--- |
| `Agent Lee: Open Chat` | Opens Agent Lee in a panel. |
| `Agent Lee: Open Sidebar` | Focuses the Activity Bar sidebar view. |
| `Agent Lee: Open README` | Opens the packaged README. |
| `Agent Lee: Install PyCharm Tools` | Installs PyCharm helper tooling. |
| `Agent Lee: New Chat` | Starts a fresh conversation. |
| `Agent Lee: Stop Voice` | Stops current voice playback. |

## Local Runtime

Agent Lee expects Ollama to be available locally:

```powershell
ollama serve
ollama run qwen2.5-coder:14b
```

Default model preferences:

| Role | Default |
| :--- | :--- |
| Builder | `qwen2.5-coder:14b` |
| Designer/UX | `qwen2.5-coder:7b` |
| Verifier | `deepseek-coder-v2:16b` |

If those exact models are not installed, Agent Lee chooses installed coder/Qwen/DeepSeek/Llama alternatives from Ollama.

Runtime state is persisted at:

```txt
%USERPROFILE%\.leeway-vscode\agent-lee\config\runtime-state.json
```

## Scanner Governance

Agent Lee uses a unified LeeWay compliance scanner to ensure all code adheres to established standards.

- **Scanner Version**: `self-scan-unified-2026-05-07`
- **Governance Mode**: Standalone runtime (Self) vs. Workspace.
- **Reporting**: Live verification results are written to `%USERPROFILE%\.leeway-vscode\agent-lee\reports\compliance`.

## Browser Evidence

For front-end, dashboard, layout, visual, website, and UI review prompts, Agent Lee can launch or target a browser session and produce evidence under:

```txt
%USERPROFILE%\.leeway-vscode\agent-lee\reports\browser
```

Evidence can include screenshots, browser inspection reports, visual diffs, accessibility results, performance timings, network request summaries, console errors, broken link checks, missing image checks, and browser flow reports.

## Access And Safety

Agent Lee reads the open workspace by default. If you mention another local folder, VS Code asks for approval before that folder is inspected.

Approval modes:

| Mode | Behavior |
| :--- | :--- |
| `SAFE` | Read-first planning and explanation. Change/repair prompts stay gated. |
| `BALANCED` | Deeper analysis and implementation planning with safety checks active. |
| `FULL AUTO` | Most autonomous mode for aggressive assistance. Use intentionally. |

The law engine blocks dangerous operations such as force pushes, direct protected-branch pushes, unsafe terminal actions, bulk deletes, and core overwrite requests.

## Build And Package

```powershell
cd .\agent-lee\vscode-extension
npm install
npm run compile
npx @vscode/vsce package -o agent-lee-1.1.1-sovereign-runtime.vsix
code --install-extension .\agent-lee-1.1.1-sovereign-runtime.vsix --force
```

Or run the repo-level doctor:

```powershell
.\test-extension.ps1 -Build -Package -CheckOllama
```

## Useful Prompts

```txt
Look at this workspace and explain the architecture using real files you can see.
```

```txt
Review this homepage visually and give me the browser evidence paths.
```

```txt
Inspect C:\Path\To\AnotherProject and compare its structure to this workspace.
```

```txt
What capabilities, MCPs, agents, and model roles are currently connected?
```

## Author

**Leonard Lee**  
Freelance Full-Stack Developer and AI Systems Architect  
GitHub: [4citeB4U](https://github.com/4citeB4U)
