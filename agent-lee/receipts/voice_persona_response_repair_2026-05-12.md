<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.VOICE.PERSONA_RESPONSE_REPAIR
DISCOVERY_PIPELINE:
  Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Voice and persona response repair

## Date
2026-05-12

## Scope
Repair ordinary chat behavior so simple prompts stay conversational, remove the forced robotic directive suffix, and keep user-facing reply paths in first person without capability-dump drift.

## Edits applied
1. In [persona-runtime-bridge.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/persona/persona-runtime-bridge.ts), removed the forced `Next directive` suffix path and changed the empty-response fallback to first-person language.
2. In [capability-registry.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/core/capability-registry.ts), blocked casual prompts like `what's going on` from being treated as capability questions and rewrote the capability answer into a calmer first-person reply.
3. In [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts), scrubbed lingering `Next directive` and `Agent Lee` reply artifacts, expanded casual conversation detection for simple check-in prompts, and updated the short casual reply path.
4. In [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts), removed self-name wording from voice-test default phrases so the speech path stays aligned with the first-person rule.

## Commands run
1. `git diff -- agent-lee/vscode-extension/src/persona/persona-runtime-bridge.ts agent-lee/vscode-extension/src/core/capability-registry.ts agent-lee/vscode-extension/src/extension.ts`
2. `npm run compile`
3. `node -` voice-runtime readiness check against `agent-lee/voice/voice-runtime.json`
4. `npx vsce package`
5. `npm run compile`
6. `rg -n "Next directive: inspect, patch, verify|I'm Agent Lee|I am Agent Lee|State the target build" agent-lee/vscode-extension/src/persona/persona-runtime-bridge.ts agent-lee/vscode-extension/src/core/capability-registry.ts agent-lee/vscode-extension/src/extension.ts -S`

## Verification
1. `npm run compile` passed after the repair.
2. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.2.3.vsix`.
3. Voice runtime readiness check showed `engine=f5-clone-local`, `preferVoiceServer=true`, `fallbackEngine=piper-local`, and all required local clone and Piper paths present.
4. Source verification confirmed the targeted reply-path strings `Next directive: inspect, patch, verify`, `I'm Agent Lee`, and `State the target build` no longer remain in the patched user-facing paths.

## Notes
This workspace already contained unrelated in-progress changes, including pre-existing edits in [extension.ts](C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts). Those were left intact and this repair stayed scoped to the response and voice phrasing paths described above.
