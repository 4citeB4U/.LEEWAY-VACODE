<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.FULL_VERIFICATION_REPORT
PURPOSE: Full LeeWay runtime verification report for the Agent Lee VS Code extension after the system alignment pass.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay VS Code Full Runtime Verification Report

## Verdict

- Incident closed: `No`
- Incident ID: `INC-LEEWAY-EXT-2026-05-17-RUNTIME-TRUTH`
- Exact active live runtime version: `1.2.11`
- Current source/package/installed version: `1.2.11`
- Split-brain remains: `No`
- Previous contradictory PASS receipts corrected: `Partially`
- Final verdict: `FAIL`

## Layer Report

| Layer | Status | Evidence | Remaining Gap | Closure Requirement |
| --- | --- | --- | --- | --- |
| 1. Source truth | `PASS` | `build/runtime-build-info.json`, `npm run compile` | none at source layer | keep compile green |
| 2. Package truth | `PASS` | `leeway-extension-release-package-result.json` | none at package layer | keep VSIX rebuilt from current source |
| 3. Installed truth | `PASS` | `leeway-installed-extension-check-result.json` | none at installed layer | keep installed hash aligned with current build |
| 4. Live host truth | `PASS` | `leeway-active-runtime-attestation-result.json`, `leeway-live-host-refresh-result.json` | none at live-host attestation layer | keep reload and diagnose path truthful |
| 5. Evidence consistency | `FAIL` | `leeway-evidence-consistency-result.json` | contradictions remain across README live proof and proof-label vocabulary | reconcile or supersede stale receipts and labels |
| 6. Identity graph | `PASS` | `leeway-application-identity-graph-result.json` | none at identity graph layer | keep ownership coverage complete |
| 7. Asset registry | `PASS` | `leeway-asset-registry-check-result.json` | live proof still separate | keep all surfaces routed through registry vocabulary |
| 8. Activity Bar icon | `PASS` | asset registry check + package metadata | live runtime still not fully current | prove current live host renders current install |
| 9. Chat header avatar | `PARTIAL` | asset registry + source wiring | live visual proof not cleanly current | prove live render from current runtime |
| 10. Sidebar buttons | `PARTIAL` | live visual evidence shows buttons rendered, but the overall live visual gate still fails | capture a full live visual pass |
| 11. README media | `FAIL` | `leeway-readme-live-proof-result.json` | live README render still fails | prove live preview from current runtime |
| 12. Right-side open behavior | `PARTIAL` | source receipts and command logic | best-effort truth coded, live placement not fully proven | capture live proof of actual opened surface |
| 13. Simple prompt fast lane | `PASS` | `leeway-simple-prompt-fastlane-result.json` | proof is source-only today | add live Hello validation if desired |
| 14. Voice route policy | `PASS` | `runtime-truth-live-voice-route-result.json` | none in route policy | keep LeeWay route ordering truthful |
| 15. Transcript bridge | `PASS` | `local-transcript-bridge-result.json`, `leeway-voice-bridge-check-result.json` | still source/live mixed proof | preserve governed bridge truth |
| 16. Human-audible voice | `PARTIAL` | `leeway-voice-live-validation-result.json` | no accepted heard-audio proof in live VS Code | capture or accept human-audible verification path |
| 17. Update channel truth | `PASS` | `leeway-update-channel-truth-result.json` | none | keep manual local VSIX truth visible |
| 18. Owner-facing runtime health | `PARTIAL` | runtime truth + incident receipts | owner still faces mixed runtime evidence | make runtime health reflect live truth only |

## Direct Answers

- Is the incident closed?
  `No.`
- What is the active runtime?
  Source/package/installed/live host are all `1.2.11`.
- Is split-brain gone?
  `Yes.`
- Are images aligned under the asset registry?
  `Yes at the asset registry gate and current install level, but the full live visual gate still fails.`
- Is README aligned?
  `Source/package/install yes; live render still fails, so overall no.`
- Are commands governed?
  `Yes. The identity graph gate passes.`
- Is voice truly working or still partial?
  `Still partial overall.`
- Does Agent Lee actually speak?
  `Route and bridge logic are working, but human-audible live proof is still partial.`
- Does Hello respond fast?
  `Yes in source-governed fast-lane logic; live proof is not yet captured.`
- Is Auto Update truthfully classified?
  `Yes. Manual local VSIX with AUTO_UPDATE_NOT_AVAILABLE_FOR_LOCAL_VSIX.`

## Next Actions For Non-PASS Layers

- Evidence consistency:
  retire or supersede stale PASS receipts and fix the remaining proof-label contradictions.
- Live visual validation:
  capture a clean current pass for command-open behavior and README preview availability.
- README media:
  re-prove live README render after live runtime alignment.
- Right-side open behavior:
  capture the live-opened surface and its truthful fallback state.
- Human-audible voice:
  capture owner-accepted heard-audio proof or retain PARTIAL honestly.
- Owner-facing runtime health:
  only surface live-current claims once attestation and live host truth agree.

