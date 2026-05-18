<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.INCIDENT_REPORT
PURPOSE: Formal LeeWay incident report for Agent Lee VS Code extension runtime drift, branding failures, README asset failures, voice-runtime truth gaps, and evidence contradictions.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay Incident Report - Agent Lee VS Code Extension

## Incident identity

- Incident ID: `INC-LEEWAY-EXT-2026-05-17-RUNTIME-TRUTH`
- Owner: `Leonard Lee`
- Classification: `ACTIVE_INCIDENT`
- Authority lane: `LeeWay governed runtime investigation`
- Scope: `agent-lee/vscode-extension`
- Verification path:
  - `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json`
  - `agent-lee/vscode-extension/test-evidence/deep-ui-installed-no-browser-speech-result.json`
  - `agent-lee/vscode-extension/test-evidence/leeway-installed-extension-check-result.json`
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-live-voice-route-result.json`
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-live-voice-audible-output-result.json`
  - `agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json`

## Executive truth

This application has not been operating from one stable runtime truth.

The source tree, packaged VSIX, installed extension directory, and live VS Code window have not stayed aligned. That drift produced missing or wrong branding images, README image failures, inconsistent button appearance, and voice confidence problems that look random from the surface but are traceable in evidence.

The strongest root cause is not a single broken PNG or a single broken voice command. The strongest root cause is runtime split-brain: multiple UI/runtime generations and contradictory receipts have been allowed to coexist and present themselves as current.

## Incident status

- Source/package truth: `PARTIAL`
- Installed-runtime truth: `PARTIAL`
- Live visual truth: `FAIL`
- Voice route policy truth: `PASS`
- Human-audible voice proof: `PARTIAL`
- Identity graph governance truth: `FAIL`
- Evidence consistency truth: `FAIL`

## Timeline snapshot

1. Older installed UI evidence shows runtime `1.2.3` with `chat-ui-restored-2026-05-07` and blocked local image loads.
2. Source later moved to runtime-truth UI generations such as `chat-ui-runtime-truth-2026-05-15`.
3. Packaging and installed-directory evidence for `1.2.11` reports asset presence and matching hashes.
4. A later live visual validation on `2026-05-18T03:02:21.560Z` reports `staleRuntimeDetected: true` and `finalVerdict: FAIL`.
5. Existing branding receipt still declares live visual `PASS`, which conflicts with the later live validation evidence.

## Incident areas

### 1. `LEEWAY_APP::UI::RUNTIME_TRUTH::WEBVIEW_BOOT`

- Status: `PARTIAL`
- What is wrong:
  The current source is using `webview.asWebviewUri(...)` for sidebar assets, but older installed runtime evidence shows the UI was still attempting to load local file resources in a way the webview rejected.
- Evidence:
  - `agent-lee/vscode-extension/src/extension.ts:3136`
  - `agent-lee/vscode-extension/test-evidence/deep-ui-installed-no-browser-speech-result.json`
- Why it matters:
  This explains why images were not displayed where they should be even though the files existed in the repo.
- Root cause statement:
  A stale installed runtime or stale generated webview was still active after newer source fixes existed.

### 2. `LEEWAY_APP::DOCS::README_ASSETS::MEDIA`

- Status: `PARTIAL`
- What is wrong:
  The README currently points to valid relative media paths, but live evidence shows the README preview itself was not consistently available during live validation.
- Evidence:
  - `agent-lee/vscode-extension/README.md:12`
  - `agent-lee/vscode-extension/README.md:24`
  - `agent-lee/vscode-extension/README.md:57`
  - `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json`
- Why it matters:
  The issue is not only whether the README paths are correct on disk. The issue is whether the live extension window is actually rendering the current packaged README/runtime combination.
- Root cause statement:
  README media correctness in source has been confused with live README render truth in the active VS Code session.

### 3. `LEEWAY_APP::UI::RUNTIME_SMOKE::WEBVIEW_BUTTON_BRIDGE`

- Status: `PARTIAL`
- What is wrong:
  The current source maps the visible sidebar buttons to explicit image files, but live complaints about wrong button images are consistent with stale runtime presentation rather than current source wiring.
- Evidence:
  - `agent-lee/vscode-extension/src/extension.ts:3142`
  - `agent-lee/vscode-extension/src/extension.ts:3145`
  - `agent-lee/vscode-extension/src/extension.ts:3151`
- Expected sources:
  - Top-right button: `media/top-right-button-new.png`
  - Standards button: `media/leeway-standards-button.png`
  - Bottom Agent Lee button: `media/bottom-button-for-agent-lee.png`
- Root cause statement:
  The wrong-looking buttons are most likely being shown by an older installed or previously generated UI, not by the current source mapping.

### 4. `LEEWAY_APP::UI::ASSET::ACTIVITYBAR_ICON`

- Status: `PARTIAL`
- What is wrong:
  The evidence layer itself mixes up the Activity Bar icon and the package icon, which makes branding truth harder to read.
- Evidence:
  - `agent-lee/vscode-extension/package.json:7`
  - `agent-lee/vscode-extension/scripts/Invoke-LeeWayExtensionAssetCheck.ps1:78`
  - `agent-lee/vscode-extension/scripts/Invoke-LeeWayInstalledExtensionCheck.ps1:137`
- Root cause statement:
  Asset verification scripts name `packageJsonIconPath` from `contributes.viewsContainers.activitybar[0].icon`, while the actual extension package icon is `package.json.icon`. The evidence vocabulary is muddy.

### 5. `LEEWAY_APP::PACKAGE::RUNTIME_ATTESTATION::INSTALLED_HASH`

- Status: `PARTIAL`
- What is wrong:
  Some evidence shows repo/install parity for `1.2.11`, but the live visual validation later still reports stale runtime and failure to visually confirm the active UI.
- Evidence:
  - `agent-lee/vscode-extension/test-evidence/leeway-installed-extension-check-result.json`
  - `agent-lee/vscode-extension/test-evidence/leeway-extension-install-current-result.json`
  - `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json`
- Root cause statement:
  Installed files and hashes alone have been treated as sufficient truth, but they do not prove the currently running VS Code extension host switched to that runtime.

### 6. `LEEWAY_APP::VOICE::LAVR::LOCAL_RUNTIME`

- Status: `PASS`
- What is going well:
  The configured voice runtime is LeeWay-owned local clone, not an external default.
- Evidence:
  - `agent-lee/voice/voice-runtime.json`
  - `agent-lee/voice/leeway-live-voice-manifest.json`
- Truth:
  The policy layer is largely correct. The app is configured for `f5-clone-local` with `fallbackEngine` set to `none`.

### 7. `LEEWAY_APP::VOICE::LAVR::TRANSCRIPT_BRIDGE`

- Status: `PASS`
- What is going well:
  The local transcript bridge path is real and evidence shows it can accept governed transcripts.
- Evidence:
  - `agent-lee/vscode-extension/src/extension.ts:7228`
  - `agent-lee/vscode-extension/test-evidence/local-transcript-bridge-result.json`
- Truth:
  This lane is not the primary failure. It is one of the more stable parts of the voice system.

### 8. `LEEWAY_APP::VOICE::LIVE_ROUTE::AUDIBLE_OUTPUT_PROOF`

- Status: `PARTIAL`
- What is wrong:
  Voice route logic and simulated playback checks pass, but the evidence repeatedly states it does not prove that a human heard audio in a live VS Code session.
- Evidence:
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-live-voice-route-result.json`
  - `agent-lee/vscode-extension/test-evidence/runtime-truth-live-voice-audible-output-result.json`
- Why it matters:
  This is why voice can look healthy in governed tests while still feeling unreliable to the owner.
- Root cause statement:
  The system proves route invocation and lifecycle state better than it proves real audible end-user output.

### 9. `LEEWAY_APP::VOICE::LAVR::BROWSER_FALLBACK`

- Status: `PARTIAL`
- What is wrong:
  Browser speech still exists as a labeled fallback lane in runtime behavior and UI messaging.
- Evidence:
  - `agent-lee/vscode-extension/src/extension.ts:7182`
  - `agent-lee/vscode-extension/src/core/voice/leewayVoiceTruth.ts`
- Root cause statement:
  Browser fallback is governed and labeled, but its presence still contributes to owner confusion when the local lane is not clearly or visibly dominant in live sessions.

### 10. `LEEWAY_APP::GATE::APPLICATION_IDENTITY_GRAPH`

- Status: `FAIL`
- What is wrong:
  The identity graph gate is not fully passing because `agentLee.diagnoseRuntime` is unowned in the manifest and registered command surfaces.
- Evidence:
  - `agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json`
  - `agent-lee/vscode-extension/src/extension.ts:8295`
- Why it matters:
  The runtime-diagnosis command itself lacks full identity ownership, which weakens governance exactly where runtime truth should be strongest.
- Root cause statement:
  Runtime truth work advanced faster than identity graph ownership updates.

### 11. `LEEWAY_APP::GOVERNANCE::TRACER_PACK::PUBLIC_SAFE_REPORT`

- Status: `FAIL`
- What is wrong:
  Existing receipts and reports contradict one another.
- Evidence conflict:
  - `agent-lee/receipts/leeway_extension_branding_asset_report.md` reports live visual `PASS`
  - `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json` reports live visual `FAIL`
- Root cause statement:
  Reports were written as completion evidence while later runtime proof contradicted them, and the contradiction was not reconciled.

## What has been going on

The application has been moving through multiple runtime states without one authoritative closure loop:

1. Source code was repaired.
2. Packaging evidence improved.
3. Installed-directory evidence improved.
4. Live VS Code session truth lagged behind or failed to visually confirm.
5. Some receipts declared success before the live runtime truth stayed stable.

That is why the symptoms felt broad:

- README images seemed missing.
- Button images looked wrong or inconsistent.
- Voice looked partly healthy and partly broken.
- Reports said `PASS` while later evidence said `FAIL`.

From the owner perspective, that feels like chaos.
From the evidence perspective, it is runtime drift plus incomplete governance reconciliation.

## Root cause summary

- Primary cause:
  Runtime split-brain between source, packaged VSIX, installed directory, and live extension host.
- Secondary cause:
  Evidence and receipts were allowed to overstate completion before live runtime proof remained stable.
- Tertiary cause:
  Identity graph ownership and evidence vocabulary were not kept fully aligned with runtime-truth tooling.

## Impact

- Owner trust in runtime truth was damaged.
- Branding and README quality appeared unreliable.
- Voice reliability became difficult to judge from UI behavior alone.
- Governance evidence became internally inconsistent.

## Current truthful conclusion

This application is not in a clean final branded-runtime state yet.

It has meaningful working parts:
- asset files exist
- current source uses webview-safe URI wiring
- install/package evidence for `1.2.11` is stronger than older evidence
- local LeeWay voice route policy is sound
- local transcript bridge path is functioning

But it is not cleanly closed because:
- live visual evidence later failed
- stale runtime was still detected
- runtime diagnosis ownership is incomplete
- receipts conflict with later truth evidence

## Required remediation order

1. Reconcile live runtime truth first.
   Confirm the actual running extension host version and UI generation, not just installed files.
2. Re-run live visual validation and replace stale contradictory receipt language.
3. Close identity graph ownership for `agentLee.diagnoseRuntime`.
4. Normalize branding evidence vocabulary so Activity Bar icon and package icon are never conflated.
5. Add a hard incident rule:
   no branding or voice `PASS` receipt may remain final if a later live runtime proof says `FAIL`.
6. Add live audible proof procedure for voice that is owner-visible, not just harness-visible.

## Recommended incident disposition

- Disposition: `OPEN`
- Severity: `HIGH`
- Closure rule:
  This incident closes only when source truth, packaged truth, installed truth, live visual truth, voice truth, and identity graph truth all agree without contradiction.

## Evidence references

- [README.md](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/README.md:12)
- [package.json](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/package.json:7)
- [extension.ts](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts:3136)
- [extension.ts](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts:7182)
- [extension.ts](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts:7228)
- [extension.ts](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/src/extension.ts:8295)
- [leeway_extension_branding_asset_report.md](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/receipts/leeway_extension_branding_asset_report.md:1)
- [leeway-extension-live-visual-validation-result.json](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json:1)
- [deep-ui-installed-no-browser-speech-result.json](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/test-evidence/deep-ui-installed-no-browser-speech-result.json:1)
- [leeway-installed-extension-check-result.json](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/test-evidence/leeway-installed-extension-check-result.json:1)
- [runtime-truth-live-voice-route-result.json](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/test-evidence/runtime-truth-live-voice-route-result.json:1)
- [runtime-truth-live-voice-audible-output-result.json](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/test-evidence/runtime-truth-live-voice-audible-output-result.json:1)
- [leeway-application-identity-graph-result.json](/abs/C:/Users/Leona/.leeway-vscode/agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json:1)
