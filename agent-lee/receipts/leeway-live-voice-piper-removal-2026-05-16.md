# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.LIVE_VOICE.PIPER_REMOVAL_2026_05_16
# PURPOSE: Records the governed removal of Piper from Agent Lee runtime, packaging, identity, and attestation surfaces in version 1.2.6.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Date: 2026-05-16
- Version bump: `1.2.5 -> 1.2.6`
- Change intent: remove Piper entirely from Agent Lee runtime and eliminate non-LeeWay speech drift.

## Root Cause

- Piper was no longer the intended LeeWay voice direction, but it still persisted in active runtime/configuration contracts.
- Remaining Piper surfaces included host command handling, type contracts, manifest policy naming, identity graph nodes, identity gate expectations, standalone migration copy logic, and bundled voice artifacts.
- That meant the repo still carried a recoverable Piper path even after the LeeWay-owned live voice route manager had been introduced.

## Runtime Direction After Repair

- Active route ladder:
  - `leeway.voice.primary.clone.live`
  - `leeway.voice.compact.clone.live`
  - `leeway.voice.branded.live`
  - `leeway.voice.text.emergency`
- Normal runtime policy:
  - no foreign default voice engine
  - no external-provider fallback
  - no Piper runtime surface

## Files Changed

- `agent-lee/vscode-extension/package.json`
- `agent-lee/vscode-extension/package-lock.json`
- `agent-lee/vscode-extension/src/extension.ts`
- `agent-lee/vscode-extension/src/core/voice-adapter.ts`
- `agent-lee/vscode-extension/src/core/leeway-live-voice-route-manager.ts`
- `agent-lee/vscode-extension/src/leeway-application/leewayApplicationIdentityGraph.ts`
- `agent-lee/vscode-extension/scripts/Invoke-LeeWayApplicationIdentityGraphGate.ps1`
- `agent-lee/vscode-extension/test-evidence/runtime-truth-webview-button-bridge-harness.cjs`
- `.codex/skills/leeway-live-voice-runtime/SKILL.md`
- `agent-lee/voice/voice-runtime.json`
- `agent-lee/voice/leeway-live-voice-manifest.json`
- `agent-lee/voice/VOICE_LOCK.md`
- `agent-lee/docs/Agent-Lee-Packaged-Validation.md`
- `agent-lee/standards/LEEWAY_STANDARDS.md`
- `agent-lee/scripts/Convert-AgentLeeToStandalone.ps1`

## Files Removed

- `agent-lee/voice/Speak-AgentLeePiper.ps1`
- `agent-lee/voice/Invoke-AgentLeeVoiceAudition.ps1`
- `agent-lee/voice/voice-audition-catalog.json`
- `agent-lee/voice/piper_bin/`
- `agent-lee/voice/models-disabled/`
- `agent-lee/voice/models/en_US-hfc_male-medium.onnx`
- `agent-lee/voice/models/en_US-hfc_male-medium.onnx.json`

## Verification

- `npm run compile` PASS
- `npm run LEEWAY_CONSTRUCTION_LAW_GATE` PASS
- `powershell -ExecutionPolicy Bypass -File .\scripts\Invoke-LeeWayApplicationIdentityGraphGate.ps1` PASS
- `npm run LEEWAY_APPLICATION_INTEGRITY_GATE` PASS
- `npx vsce package --allow-star-activation` PASS
- VSIX install PASS

## Runtime Truth

- Webview runtime truth result:
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-webview-button-bridge-result.json`
- Live voice runtime truth result:
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-live-voice-route-result.json`
- Proven:
  - webview boot still emits `agentLeeUiReady`
  - Settings, History, New Chat, Attachments, and Send remain bridged
  - `sendMessage` remains handled
  - non-LeeWay default engine is rejected
  - primary/compact/branded/text route order is enforced
  - one-word speech collapse is detected
  - text-only emergency remains truthful when no LeeWay live route is healthy

## Runtime Hash Attestation

- Attestation file:
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-attestation-result.json`
- Package version: `1.2.6`
- Repo `out/extension.js` SHA256:
  - `83CFD1A7E1A7BEE61471CBF3F7591AD83A5A13892F38B6E22784C472FB663A5E`
- VSIX `out/extension.js` SHA256:
  - `83CFD1A7E1A7BEE61471CBF3F7591AD83A5A13892F38B6E22784C472FB663A5E`
- Installed `out/extension.js` SHA256:
  - `83CFD1A7E1A7BEE61471CBF3F7591AD83A5A13892F38B6E22784C472FB663A5E`
- Repo/VSIX match: `true`
- Installed/VSIX match: `true`
- Installed runtime status: `current`

## Install Result

- VSIX:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.6.vsix`
- Installed path:
  - `C:\Users\Leona\.vscode\extensions\leeway.agent-lee-leeway-coding-system-1.2.6`

## Notes

- The webview Runtime Truth Layer still uses JSDOM rather than a full VS Code renderer.
- The live voice route law is now LeeWay-owned-only at the active runtime surface; Piper no longer exists as a normal or recoverable runtime path in this repo pass.
