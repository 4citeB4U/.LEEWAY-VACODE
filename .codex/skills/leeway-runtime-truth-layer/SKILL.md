---
name: leeway-runtime-truth-layer
description: Restore or harden a LeeWay-governed VS Code extension when compile/package gates pass but the real runtime is stale, dead, or misleading. Use when buttons do nothing, chat is unavailable, the webview appears unresponsive, the installed extension differs from the repo build, or LeeWay needs dynamic runtime truth checks, webview boot attestation, button/chat bridge verification, and repo/VSIX/installed hash attestation.
---

# LeeWay Runtime Truth Layer

Apply this skill when the visible app experience is broken even though compile, packaging, or governance gates appear green.

## Core mission

Prove the real runtime, not just the source tree.

## Required sequence

1. Identify the production start path.
2. Compare the installed runtime, repo `out/extension.js`, and packaged VSIX runtime.
3. Treat a repo/installed mismatch as a runtime incident, not a cosmetic version issue.
4. Execute the generated webview HTML and inline script dynamically.
5. Verify `agentLeeUiReady`, Settings, History, New Chat, Attachments, and Send.
6. Verify the host still handles the emitted core UI commands.
7. Add or refresh Runtime Truth Layer identity nodes and evidence.
8. Bump the extension version when the installed runtime could otherwise be mistaken for current.
9. Run the LeeWay construction, identity, and integrity gates.
10. Write evidence and a receipt that states any dynamic-test limitation truthfully.

## Runtime truth minimums

- Generate the real webview HTML from the active source path.
- Execute the inline script with a simulated `vscode.postMessage` bridge if full VS Code GUI automation is unavailable.
- Fail the runtime truth gate if boot throws before `agentLeeUiReady`.
- Fail the runtime truth gate if `sendMessage` emits without a matching host handler.
- Fail or hard-block integrity when the installed runtime hash differs from the freshly packaged VSIX hash and the installed path is inspectable.

## Required LeeWay nodes

- `LEEWAY_APP::UI::RUNTIME_SMOKE::WEBVIEW_BUTTON_BRIDGE`
- `LEEWAY_APP::UI::RUNTIME_TRUTH::WEBVIEW_BOOT`
- `LEEWAY_APP::UI::RUNTIME_TRUTH::CHAT_SEND_PATH`
- `LEEWAY_APP::PACKAGE::RUNTIME_ATTESTATION::VSIX_HASH`
- `LEEWAY_APP::PACKAGE::RUNTIME_ATTESTATION::INSTALLED_HASH`

## Evidence expectations

- Record package version.
- Record repo `out/extension.js` hash.
- Record VSIX `out/extension.js` hash.
- Record installed `out/extension.js` hash when the installed path exists.
- Record whether the installed runtime is `current`, `stale`, or `not_found`.

## Verification commands

- `npm run compile`
- `npm run LEEWAY_CONSTRUCTION_LAW_GATE`
- `powershell -File .\scripts\Invoke-LeeWayApplicationIdentityGraphGate.ps1`
- `npm run LEEWAY_APPLICATION_INTEGRITY_GATE`
- `npx vsce package --allow-star-activation`

## Truth rule

Do not report the runtime as fixed just because TypeScript compiles or a governance gate passes. Report it fixed only after the dynamic webview/button/chat path and runtime hash attestation both agree.
