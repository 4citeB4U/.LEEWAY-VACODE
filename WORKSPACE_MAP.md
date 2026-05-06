<!--
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.WORKSPACE_MAP
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Agent Lee Workspace Map

Root:
C:\Users\Leona\.leeway-vscode

## Main areas

- logs: operational events, crashes, drift, tool activity
- reports: formal verification and compliance reports
- workspace: active working area for agents
- memory: long-term lightweight memory
- LeeWay-Standards: source repo
- agent-lee: VS Code extension and runtime helpers

## Agent folders

Each agent has:
- notes
- tasks
- reports
- errors
- receipts

## Logging helper

Use:

powershell -ExecutionPolicy Bypass -File "C:\Users\Leona\.leeway-vscode\agent-lee\Log-AgentLeeEvent.ps1" -Type "info" -Agent "agent-lee" -Message "Agent Lee started"

