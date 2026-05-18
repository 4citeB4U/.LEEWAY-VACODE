<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: 🟢 CORE
TAG: CORE.RECOVERY.STABILIZATION.MAIN
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
PURPOSE: Receipt for Agent Lee stabilization recovery, quarantine execution, doctor verification, and dual-IDE extension installation.
-->

# Stabilization Recovery Receipt

- Date: 2026-05-11
- Workspace: `C:\Users\Leona\.leeway-vscode`
- Extension: `leeway.agent-lee-leeway-coding-system`
- Version validated: `1.2.3`

## Edits

- Restored the exact doctor-expected `AGENT_LEE_UI_VERSION` constant in `agent-lee/vscode-extension/src/extension.ts`.
- Routed the remaining direct notification calls in `agent-lee/vscode-extension/src/extension.ts` through approved Agent Lee wrappers.
- Formalized self-scan exclusions in `agent-lee/vscode-extension/src/core/leeway-write-policy.ts` for non-governed metadata, schemas, receipts, and type declarations.
- Mirrored those exclusions in `agent-lee/scripts/Invoke-AgentLeeDoctor.ps1`.
- Hardened doctor file enumeration to skip tracked paths that have been quarantined or archived.

## Quarantine

- Executed: `agent-lee/scripts/Invoke-AgentLeeQuarantineRecovery.ps1`
- Mode: apply
- Receipt: `reports/engineering-runs/quarantine-recovery-20260511-122741.md`
- Result: backup and broken `extension.*` and `visualPanel.*` artifacts were moved out of live source and output trees into `_archive/quarantine-2026-05-11`.

## Verification

- `npm run compile`
  - Result: passed
- `npx vsce package`
  - Result: passed
  - VSIX: `agent-lee/vscode-extension/agent-lee-leeway-coding-system-1.2.3.vsix`
- `agent-lee/scripts/Invoke-AgentLeeDoctor.ps1`
  - Result: passed without blocking LeeWay failures
  - Report: `reports/Doctor/doctor-20260511-122809/AGENT_LEE_DOCTOR.md`
  - Compliance summary: `blocking=False`, `score=97.81`, `inspected=319`, `compliant=312`

## Install Validation

- VS Code CLI install:
  - Command: `code.cmd --install-extension C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix --force`
  - Result: success
- Antigravity CLI install:
  - Command: `antigravity.cmd --install-extension C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix --force`
  - Result: success
- VS Code list verification:
  - Result: `leeway.agent-lee-leeway-coding-system@1.2.3`
- Antigravity list verification:
  - Result: `leeway.agent-lee-leeway-coding-system@1.2.3`

## Known Residual

- Antigravity CLI still prints: `[createInstance] extensionManagementService depends on antigravityAnalytics which is NOT registered.`
- That message was emitted by Antigravity during extension management commands, not by the Agent Lee extension code path itself.
