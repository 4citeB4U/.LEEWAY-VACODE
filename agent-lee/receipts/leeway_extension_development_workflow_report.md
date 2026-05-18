# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.EXTENSION_DEVELOPMENT_WORKFLOW
# PURPOSE: Record the source-first Extension Development Host workflow for Agent Lee.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Result: PASS
- Evidence: `agent-lee/vscode-extension/test-evidence/leeway-extension-dev-reload-result.json`

## Workflow Surface

- Launch config: `.vscode/launch.json`
- Task config: `.vscode/tasks.json`
- Dev reload script: `agent-lee/vscode-extension/scripts/Invoke-LeeWayExtensionDevReload.ps1`

## Outcome

- `F5` / Extension Development Host is now the intended development loop.
- Dev reload compiles and writes fresh runtime build info before launch.
- VSIX packaging is no longer the default iteration path for source development in this workflow.
