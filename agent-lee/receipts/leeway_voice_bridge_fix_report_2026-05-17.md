# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.VOICE_BRIDGE_FIX
# PURPOSE: Records LeeWay Voice truth, doctrine, dedupe, review flow, and live-runtime caveats for the voice bridge repair.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Root cause: combined status-as-chat injection, repeated bridge-start/status loop, and missing reviewed-send boundary for captured voice input.
- Source fix: PASS
- Live runtime verification: NOT YET VERIFIED
- Current verdict: PARTIAL

## LeeWay Voice Brand Purpose

LeeWay Voice is the owner's governed voice command channel into Agent Lee.

It is not generic browser speech, not a raw transcript pipe, not a hidden automation trigger, and not a fake assistant voice. The owner speaks, LeeWay classifies, agents assist, and law governs. Nothing mutates without approval.

## What Changed

- Added LeeWay Voice doctrine and LAW-0021 voice bridge message separation governance.
- Added explicit voice message separation for status, transcript, and error paths.
- Added dedupe and loop suppression for repeated bridge status and transcript events.
- Added voice review-before-send state with source, classification, risk, transcript ID, timestamp, and next action.
- Added owner-facing Voice Bridge Status and truthful fallback language.
- Added `voiceAutoSendFinalTranscript` with owner-safe default `false`.
- Removed the raw repeated bridge-ready chat injection path.

## Files Changed

- `agent-lee/vscode-extension/src/core/voice/leewayVoiceTruth.ts`
- `agent-lee/vscode-extension/src/live-voice/liveTranscriptBridge.ts`
- `agent-lee/vscode-extension/src/live-voice/liveVoice.commands.ts`
- `agent-lee/vscode-extension/src/live-voice/providers/browserSpeechRecognitionProvider.ts`
- `agent-lee/vscode-extension/src/live-voice/providers/stubRealtimeVoiceProvider.ts`
- `agent-lee/vscode-extension/src/core/runtime-settings.ts`
- `agent-lee/vscode-extension/src/extension.ts`
- `agent-lee/vscode-extension/scripts/Invoke-LeeWayVoiceBridgeCheck.ps1`
- `agent-lee/voice/leeway-voice-brand-doctrine.md`
- `agent-lee/governance/law/law-0021-voice-bridge-message-separation.md`

## Verification

- `npm.cmd run compile`
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-lee\vscode-extension\scripts\Invoke-LeeWayVoiceBridgeCheck.ps1`

## Remaining Caveats

- Source now separates status from chat and adds reviewed voice intake, but live VS Code verification is still required before claiming PASS.
- If the installed extension runtime is stale, voice truth can still be misrepresented by the old runtime until the current build is installed or run in Extension Development Host.
