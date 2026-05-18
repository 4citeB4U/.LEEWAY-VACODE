# LeeWay Application Integrity Gate Receipt

- Generated: 2026-05-14T05:21:05.7911467-05:00
- Gate: LEEWAY_APPLICATION_INTEGRITY_GATE
- Extension: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension
- Result: FAIL
- Total checks: 10
- Failed checks: 4
- Evidence JSON: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\test-evidence\leeway-application-integrity-result.json
- VSIX: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix
- Doctor report: not found

- [PASS] npm run compile: Exit code: 0
- [PASS] runtime-smoke-voice-provider-harness: Exit code: 0
- [PASS] lavr-host-router-dynamic-harness: Exit code: 0
- [PASS] lavr-playback-gate-dynamic-harness: Exit code: 0
- [FAIL] npx vsce package --allow-star-activation: Exit code: -1
- [PASS] VSIX exists after packaging: C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.2.3.vsix
- [FAIL] VSIX stale artifact and cloud-provider leakage scan: Hits: 8; Files: 379
- [PASS] command emitted-vs-handled audit: Missing handlers: 0
- [FAIL] doctor baseline: Exit code: -1
- [FAIL] LeeWay compliance scan: Doctor report not found.
