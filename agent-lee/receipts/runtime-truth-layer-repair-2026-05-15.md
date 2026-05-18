# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.RUNTIME_TRUTH_LAYER.REPAIR_2026_05_15
# PURPOSE: Records the Agent Lee VS Code extension runtime repair, Runtime Truth Layer implementation, and install/hash attestation for version 1.2.4.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Date: 2026-05-15
- Extension version repaired: `1.2.3 -> 1.2.4`
- Root cause: installed `1.2.3` runtime was stale relative to the repo build, and the stale installed webview script still contained unguarded boot code that could fail before UI handlers attached. The current repo source also contained a separate inline script parse defect in `createLeeWayVoiceEventBus()` that the new Runtime Truth harness exposed.
- Runtime truth limitation: the new UI smoke harness executes generated webview HTML and inline script dynamically in JSDOM with a simulated `vscode.postMessage` bridge; it does not launch a full VS Code GUI renderer.

## Runtime Truth Layer surfaces

- Identity nodes added:
  - `LEEWAY_APP::PACKAGE::RUNTIME_ATTESTATION::VSIX_HASH`
  - `LEEWAY_APP::PACKAGE::RUNTIME_ATTESTATION::INSTALLED_HASH`
  - `LEEWAY_APP::UI::RUNTIME_TRUTH::WEBVIEW_BOOT`
  - `LEEWAY_APP::UI::RUNTIME_TRUTH::CHAT_SEND_PATH`
  - `LEEWAY_APP::UI::RUNTIME_SMOKE::WEBVIEW_BUTTON_BRIDGE`
- Dynamic harness:
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-webview-button-bridge-harness.cjs`
- Skill created:
  - `.codex/skills/leeway-runtime-truth-layer/SKILL.md`
  - `.codex/skills/leeway-runtime-truth-layer/agents/openai.yaml`

## Files changed

- `agent-lee/vscode-extension/.vscodeignore`
- `agent-lee/vscode-extension/package.json`
- `agent-lee/vscode-extension/package-lock.json`
- `agent-lee/vscode-extension/scripts/Invoke-LeeWayApplicationIntegrityGate.ps1`
- `agent-lee/vscode-extension/src/extension.ts`
- `agent-lee/vscode-extension/src/leeway-application/leewayApplicationIdentityGraph.ts`
- `agent-lee/vscode-extension/test-evidence/runtime-truth-webview-button-bridge-harness.cjs`
- `.codex/skills/leeway-runtime-truth-layer/SKILL.md`
- `.codex/skills/leeway-runtime-truth-layer/agents/openai.yaml`

## Runtime proof

- UI smoke result: `agent-lee/vscode-extension/test-evidence/runtime-truth-webview-button-bridge-result.json`
- UI smoke outcome:
  - script parses
  - `agentLeeUiReady` emitted
  - Settings path opens
  - History path opens
  - New Chat emits `newConversation`
  - Attachments emits `pickAttachments`
  - Send emits `sendMessage`
  - host handler for `sendMessage` exists
  - no missing host handlers for core UI commands
  - no `workflowShell` / `workflowChevron` boot exception

## Runtime attestation

- Attestation file: `agent-lee/vscode-extension/test-evidence/runtime-truth-attestation-result.json`
- Package version: `1.2.4`
- Repo `out/extension.js` SHA256: `9276038BC01A9353529AC9C48E5BB403251EB0FE0C3622153A4B4FF36D3B7857`
- VSIX `out/extension.js` SHA256: `9276038BC01A9353529AC9C48E5BB403251EB0FE0C3622153A4B4FF36D3B7857`
- Installed `out/extension.js` SHA256: `9276038BC01A9353529AC9C48E5BB403251EB0FE0C3622153A4B4FF36D3B7857`
- Repo/VSIX match: `true`
- Installed/VSIX match: `true`
- Installed runtime status: `current`

## Verification

- `npm run compile` PASS
- `npm run LEEWAY_CONSTRUCTION_LAW_GATE` PASS
- `powershell -File .\scripts\Invoke-LeeWayApplicationIdentityGraphGate.ps1` PASS
- `npm run LEEWAY_APPLICATION_INTEGRITY_GATE` PASS
- `npx vsce package --allow-star-activation` PASS
- Installed VSIX:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.4.vsix`
  - installed into `C:\Users\Leona\.vscode\extensions\leeway.agent-lee-leeway-coding-system-1.2.4`

## Related receipts and evidence

- Integrity gate receipt:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\receipts\leeway_application_integrity_gate_2026-05-15_095135.md`
- Integrity result:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\test-evidence\leeway-application-integrity-result.json`
