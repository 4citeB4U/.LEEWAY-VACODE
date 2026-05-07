<!--
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.EXTENSION_INSTALL_REPORT
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Agent Lee Extension Install Report

## Current Package

| Field | Value |
| :--- | :--- |
| Extension | Agent Lee LeeWay Coding System |
| Package name | `agent-lee-leeway-coding-system` |
| Version | `1.1.1` |
| Publisher | `leeway` |
| VS Code engine | `^1.90.0` |
| Main entry | `./out/extension.js` |
| Current source | `agent-lee/vscode-extension` |
| README | `agent-lee/vscode-extension/README.md` |
| README images | `agent-lee/vscode-extension/media/readme-header.png`, `agent-lee/vscode-extension/media/readme-system-flow.png` |

## Verified Surfaces

| Surface | Status |
| :--- | :--- |
| Activity Bar container | Present: `agentLee` |
| Sidebar webview | Present: `agentLee.sidebar` |
| Status Bar launcher | Present: `$(hubot) Agent Lee` |
| Packaged icon | Present: `media/leeway-standards-button.png` |
| README imagery | Present in extension media folder |
| Command Palette actions | Present |
| Ollama model selection | Present |
| Three-model hive | Present |
| Chat history | Present |
| Voice controls | Present |
| Web lookup | Present |
| Browser validation | Present |
| PyCharm tooling command | Present |

## Commands

| Command | Purpose |
| :--- | :--- |
| `Agent Lee: Open Chat` | Opens the chat panel. |
| `Agent Lee: Open Sidebar` | Opens the Activity Bar sidebar. |
| `Agent Lee: Open README` | Opens the packaged README. |
| `Agent Lee: Install PyCharm Tools` | Installs helper tooling into detected PyCharm config folders. |
| `Agent Lee: New Chat` | Starts a new local conversation. |
| `Agent Lee: Stop Voice` | Stops active voice playback. |

## Runtime Features Explained

Agent Lee now documents the real current feature set in both the repo README and packaged extension README:

- Workspace file inspection before answering.
- External local folder approval.
- Remote URL context extraction.
- Builder, Designer/UX, and Verifier Ollama model routing.
- `SAFE`, `BALANCED`, and `FULL AUTO` approval modes.
- Web lookup toggle.
- Voice output and mic input.
- Conversation history and memory logs.
- Law engine, scheduler, and drift tracking.
- Capability catalog from local agent/MCP registry sources.
- Browser screenshots, reports, visual diffs, accessibility checks, performance checks, network summaries, broken link checks, missing image checks, and flow reports.

## Build Command

```powershell
.\agent-lee\scripts\Build-AgentLeeVSIX.ps1
```

Default VSIX output:

```txt
agent-lee-1.1.1-sovereign-runtime.vsix
```

## Full Doctor Command

```powershell
.\test-extension.ps1 -Build -Package -CheckOllama
```

