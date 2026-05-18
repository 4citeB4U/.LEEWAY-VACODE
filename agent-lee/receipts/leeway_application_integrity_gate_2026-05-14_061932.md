# LeeWay Application Integrity Gate Receipt

- Generated: 2026-05-14T06:20:14.8882797-05:00
- Gate: LEEWAY_APPLICATION_INTEGRITY_GATE
- Extension: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension
- Result: FAIL
- Total checks: 11
- Failed checks: 1
- Evidence JSON: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\test-evidence\leeway-application-integrity-result.json
- VSIX: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix
- Doctor report: C:\Users\Leona\.leeway-vscode\reports\Doctor\doctor-20260514-061954\agent-lee-doctor.json

- [PASS] npm run compile: Exit code: 0
- [PASS] runtime-smoke-voice-provider-harness: Exit code: 0
- [PASS] lavr-host-router-dynamic-harness: Exit code: 0
- [PASS] lavr-playback-gate-dynamic-harness: Exit code: 0
- [PASS] npx vsce package --allow-star-activation: Exit code: 0
- [PASS] VSIX exists after packaging: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix
- [PASS] VSIX stale artifact and cloud-provider leakage scan: Hits: 0; Files: 374
- [PASS] command emitted-vs-handled audit: Missing handlers: 0
- [FAIL] application identity graph gate: Failed checks: 2; Registered nodes: 21; Registered files: 13
- [PASS] doctor baseline: Exit code: 0
- [PASS] LeeWay compliance scan: Failed checks: 0; LeeWay score: 97.76; Blocking files: 0
