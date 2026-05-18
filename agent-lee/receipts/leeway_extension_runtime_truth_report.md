# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.EXTENSION_RUNTIME_TRUTH
# PURPOSE: Record runtime truth law, source-mode detection, build-info generation, and runtime health proof for Agent Lee.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Result: PASS
- Law added: `LAW-0020: Extension Runtime Truth`
- Build info artifact: `agent-lee/vscode-extension/build/runtime-build-info.json`

## Evidence

- Runtime truth law: `agent-lee/governance/law/leeway-extension-runtime-truth-law.md`
- Governance model update: `agent-lee/governance/law/leeway-governance-model-law.md`
- Integrity gate: `agent-lee/vscode-extension/test-evidence/leeway-application-integrity-result.json`
- Runtime attestation: `agent-lee/vscode-extension/test-evidence/runtime-truth-attestation-result.json`
- Installed check: `agent-lee/vscode-extension/test-evidence/leeway-installed-extension-check-result.json`

## Runtime Health Proof

- Source modes implemented: `SOURCE_DEV_HOST`, `SOURCE_LINKED_WORKSPACE`, `SOURCE_PACKAGED_VSIX`, `SOURCE_STALE_VSIX`, `SOURCE_UNKNOWN`
- Runtime UI/status now has access to source mode, installed runtime status, command proof, asset proof, and build-info proof.
- Current machine state was truthfully detected as stale installed VSIX: installed `1.2.6`, source/release `1.2.8`.
