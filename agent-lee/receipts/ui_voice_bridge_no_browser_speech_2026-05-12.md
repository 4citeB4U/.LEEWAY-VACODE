<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.VOICE_BRIDGE_NO_BROWSER_SPEECH
DISCOVERY_PIPELINE:
  Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: UI Voice Bridge Without Browser Speech

Date: 2026-05-12

## Edits Applied

- `agent-lee/vscode-extension/src/extension.ts`
- Replaced the webview mic path so `mic()` posts `startTranscriptBridge` instead of using `window.SpeechRecognition` or `window.webkitSpeechRecognition`.
- Added extension-side handling for `startTranscriptBridge`, which executes `agentLee.liveVoice.startTranscriptBridge` and reports the localhost transcript URL back to the webview.
- Updated the mic button label/title to "Start local transcript bridge".

- `agent-lee/vscode-extension/.vscodeignore`
- Excluded generated UI debug/test/evidence artifacts from the VSIX so stale harness HTML cannot ship as part of the extension package.

## Cleanup

- Removed stale generated debug/test HTML and temporary JS files that still contained the old browser speech-recognition code:
- `agent-lee/vscode-extension/ui-live-test.html`
- `agent-lee/vscode-extension/ui-debug.html`
- `agent-lee/vscode-extension/test.js`
- `agent-lee/vscode-extension/test_run.js`
- `agent-lee/vscode-extension/test-evidence/deep-ui-installed.html`
- `agent-lee/vscode-extension/test-evidence/deep-ui-installed-clean.html`
- `_vsix_inspect/current-1.2.3/extension/ui-debug.html`
- `_vsix_inspect/current-1.2.3/extension/ui-live-test.html`

## Verification

- `npm run compile`: passed.
- `npm run package`: passed. Final VSIX excluded debug HTML and `test-evidence/**`.
- `code.cmd --install-extension agent-lee/vscode-extension/agent-lee-leeway-coding-system-1.2.3.vsix --force`: passed.
- Installed extension check: only `leeway.agent-lee-leeway-coding-system@1.2.3` is installed.
- Hash check: workspace `out/extension.js` and installed `out/extension.js` both match SHA256 `D0A3D7BDEFD95665A9C6AA982B8F00EC1ECE56A4EF44D4EFED2C7683ED076206`.
- Final VSIX SHA256: `BAA51DF7D18565E51C5C1332D05C702B227D82D94169F15564D68E2B78416C63`.
- Source/out/installed active extension check: no `SpeechRecognition` or `webkitSpeechRecognition` matches in `src/extension.ts`, workspace `out/extension.js`, or installed `out/extension.js`.
- Installed extension cleanup check: no root `ui-*`, `test*.js`, `extract_html.js`, `run_get_html.js`, or `test-evidence` artifacts remain in the installed extension folder.
- Voice status check: `getVoiceStatus()` returned `engine=f5-clone-local`, `model=Agent Lee Default Voice`, `ready=true`, `fallback=piper-local`, `speaking=false`.
- Clone synthesis proof: generated `agent-lee/vscode-extension/test-evidence/agent-lee-clone-voice-proof.wav`, length `109100`, SHA256 `E59F91F348D241A7CE570CA463954907F39BB33FA669671019A1012D4C678451`.
- Installed UI click proof: `agent-lee/vscode-extension/test-evidence/deep-ui-installed-no-browser-speech-result.json`.
- UI click result: 20 checks passed, 0 failed, 0 page errors, `speechRecognitionAccessed=false`.
- UI posted commands included `agentLeeUiReady`, `pickAttachments`, `startTranscriptBridge`, `muteVoice`, `sendMessage`, `setState`, and `voiceAlTestDefault`.
- Catalog render proof: 25 MCP rows, 10 agent rows, 10 worker rows.
- Transcript bridge proof: `agent-lee/vscode-extension/test-evidence/local-transcript-bridge-result.json`.
- Transcript bridge result: `/health` returned 200, `/transcript` returned 200, and the posted transcript routed through `agentLee.liveVoice.handleTranscript` to `agentLee.liveVoice.chat`.

## Residual Notes

- `npm test` was attempted and failed because this package has no `test` script.
- The generated no-browser UI evidence HTML intentionally contains poisoned `SpeechRecognition` getters in the test harness only, to prove the app does not touch browser speech APIs.
