# LeeWay Application Integrity Gate Receipt

- Generated: 2026-05-16T03:50:47.2734703-05:00
- Gate: LEEWAY_APPLICATION_INTEGRITY_GATE
- Extension: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension
- Result: FAIL
- Total checks: 18
- Failed checks: 1
- Evidence JSON: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\test-evidence\leeway-application-integrity-result.json
- VSIX: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.4.vsix
- Doctor report: C:\Users\Leona\.leeway-vscode\reports\Doctor\doctor-20260516-035033\agent-lee-doctor.json

- [PASS] npm run compile: Exit code: 0
- [PASS] runtime-smoke-voice-provider-harness: Exit code: 0
- [PASS] runtime-truth-webview-button-bridge-harness: Exit code: 0
- [PASS] lavr-host-router-dynamic-harness: Exit code: 0
- [PASS] lavr-playback-gate-dynamic-harness: Exit code: 0
- [PASS] npx vsce package --allow-star-activation: Exit code: 0
- [PASS] VSIX exists after packaging: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.4.vsix
- [PASS] VSIX stale artifact and cloud-provider leakage scan: Hits: 0; Files: 383
- [PASS] runtime truth hash attestation: Package version: 1.2.4; Repo/VSIX hash match: True
- [FAIL] runtime truth installed hash attestation: Installed runtime status: stale
- [PASS] command emitted-vs-handled audit: Missing handlers: 0
- [PASS] application identity graph gate: Failed checks: 0; Registered nodes: 98; Registered files: 65
- [PASS] identity pulse gate: Failed checks: 0; Objects tracked: 315; Unknown audit files: 19
- [PASS] construction law gate: Failed checks: 0; Total checks: 12
- [PASS] identity mesh gate: Failed checks: 0; Registered records: 107; Sovereign layers: 8
- [PASS] tracer pack gate: Failed checks: 0; Tracer IDs: 10
- [PASS] doctor baseline: Exit code: 0
- [PASS] LeeWay compliance scan: Failed checks: 1; LeeWay score: 97.88; Blocking files: 0
