# LEEWAY_HEADER - DO NOT REMOVE
# REGION: CORE
# TAG: CORE.RECEIPTS.IDENTITY_PULSE.PASS1_2026_05_16
# PURPOSE: Records LeeWay Identity Pulse Law pass 1, the new identity pulse gate, registry, graph and mesh registration, and final verification state.
# DISCOVERY_PIPELINE:
#   Voice -> Intent -> Location -> Vertical -> Ranking -> Render

## Summary

- Date: 2026-05-16
- Scope: `LEEWAY IDENTITY PULSE LAW` pass 1
- Mode: `PASS1_AUDIT_WITH_STRICT_CORE`
- Result: PASS

## What became law

- Added repo law:
  - `agent-lee/governance/law/leeway-identity-pulse-law.md`
- Added pulse registry and taxonomy:
  - `agent-lee/governance/identity/leeway-identity-pulse.json`
  - `agent-lee/vscode-extension/src/leeway-application/leewayIdentityPulse.ts`
- Added pulse gate:
  - `agent-lee/vscode-extension/scripts/Invoke-LeeWayIdentityPulseGate.ps1`
- Added graph registration for:
  - `LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::ROOT`
  - `LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::ORIGIN_CLASSIFIER`
  - `LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::LEEWAY_BORN_WATERMARK`
  - `LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::FOREIGN_ENTITY_INDUCTION`
  - `LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::UNKNOWN_OBJECT_QUARANTINE`
  - `LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::HASH_ATTESTATION`
  - `LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::FIRST_SEEN_LEDGER`
  - `LEEWAY_APP::GATE::IDENTITY_PULSE`
- Extended identity mesh families:
  - `PULSE`
  - `OBJECT`
  - `ORIGIN`
  - `WATERMARK`
  - `INDUCTION`

## Strict now

- Active required identity-graph files receive pulse records with:
  - origin status
  - timestamps
  - hash
  - actor, prompt, intent, and transaction lineage
  - authority
  - allowed use
  - verification status
  - receipt ID
- Core runtime controls carry LeeWay control IDs:
  - `historyBtn`
  - `newChatBtn`
  - `settingsBtn`
  - `topStandardsBtn`
  - `closeHistoryBtn`
  - `attachFilesBtn`
  - `micBtn`
  - `voiceToggleBtn`
  - `sendBtn`
- Runtime command, event, and strict state-key surfaces receive pulse object IDs.
- README and primary README media assets receive identity pulse records.
- Repo runtime, VSIX runtime, and installed runtime are attested as pulse artifacts.

## Audit now

- Unknown audit files are recorded but not blocking in pass 1.
- Current audit count: `19`
- Audit examples include additional governance-law files and extra media assets not yet promoted into strict coverage.

## Skill boundary note

- The installed global `leeway-application-standards` skill lives outside the writable workspace.
- For this pass, a workspace-local governed overlay was added at:
  - `.codex/skills/leeway-application-standards/SKILL.md`
  - `.codex/skills/leeway-application-standards/references/leeway-identity-pulse-law.md`
- This overlay teaches Identity Pulse inside the repo without pretending the global skill package was edited from here.

## Verification

- `npm run compile` PASS
- `npm run LEEWAY_IDENTITY_PULSE_GATE` PASS
- `npm run LEEWAY_CONSTRUCTION_LAW_GATE` PASS
- `powershell -File .\scripts\Invoke-LeeWayApplicationIdentityGraphGate.ps1` PASS
- `npm run LEEWAY_IDENTITY_MESH_GATE` PASS
- `npm run LEEWAY_APPLICATION_INTEGRITY_GATE` PASS
- `npx vsce package --allow-star-activation` PASS

## Runtime attestation

- Package version: `1.2.4`
- Repo `out/extension.js` SHA256: `9DBF8DEA40F4424CB86B06380E9743BDC6AE518A6AE9C641AACB82CFA24E1FF6`
- VSIX `out/extension.js` SHA256: `9DBF8DEA40F4424CB86B06380E9743BDC6AE518A6AE9C641AACB82CFA24E1FF6`
- Installed `out/extension.js` SHA256: `9DBF8DEA40F4424CB86B06380E9743BDC6AE518A6AE9C641AACB82CFA24E1FF6`
- Repo/VSIX match: `true`
- Installed/VSIX match: `true`
- Installed runtime status: `current`

## Evidence

- Pulse result:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\test-evidence\leeway-identity-pulse-result.json`
- Pulse registry:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\governance\identity\leeway-identity-pulse.json`
- Integrity result:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\test-evidence\leeway-application-integrity-result.json`
- Integrity receipt:
  - `C:\Users\Leona\.leeway-vscode\agent-lee\receipts\leeway_application_integrity_gate_2026-05-16_035218.md`
