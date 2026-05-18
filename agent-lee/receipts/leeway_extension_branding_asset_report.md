<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.BRANDING_ASSET_REPORT
PURPOSE: Records the LeeWay extension branding asset map, verification checkpoints, and truthful live-runtime completion status.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay Extension Branding Asset Report

## Asset map

- Activity Bar icon: `agent-lee/vscode-extension/media/leeway-activity.svg`
- Activity Bar source archive: `agent-lee/vscode-extension/media/agent-lee-activitybar-icon.svg`
- Full LeeWay logo: `agent-lee/vscode-extension/media/leeway-logo.svg`
- Package logo: `agent-lee/vscode-extension/media/leeway-standards-logo.png`
- Sidebar top-right button: `agent-lee/vscode-extension/media/top-right-button-new.png`
- Sidebar bottom Agent Lee button: `agent-lee/vscode-extension/media/bottom-button-for-agent-lee.png`
- Sidebar LeeWay Standards button: `agent-lee/vscode-extension/media/leeway-standards-button.png`
- README header: `agent-lee/vscode-extension/media/readme-header.png`
- README system flow: `agent-lee/vscode-extension/media/readme-system-flow.png`
- Brand source archive: `agent-lee/vscode-extension/media/brand-sources/README.md`

## Live visual checklist

1. Activity Bar icon appears and is not blank.
2. Activity Bar icon is recognizable at small size.
3. Agent Lee sidebar opens.
4. Top-right LeeWay button displays.
5. Bottom Agent Lee button displays.
6. LeeWay Standards button displays.
7. README header image displays.
8. README system flow image displays.
9. Extension details page is updated.
10. Status bar still shows Agent Lee state.
11. Runtime Health reports current source/version.

## Status rule

- `PASS`: live VS Code or Extension Development Host is visually verified with the current branded assets.
- `PARTIAL`: source/package assets are fixed, but the installed extension is stale or live visual verification is not yet proven.
- `FAIL`: required branding assets are missing, excluded, or still not present in the packaged/installable runtime.

## Current evidence snapshot

- Source/package status: `PASS`
- VSIX packaging status: `PASS`
- Installed-on-disk status: `PASS` for `1.2.11`
- Live visual runtime status: `FAIL`
- Evidence consistency status: `PASS`

This receipt is no longer authoritative as a final PASS record.

Later LeeWay runtime evidence shows source, package, installed bytes, and the live VS Code runtime agree on `1.2.11`, while the live visual lane still fails. Treat this report as a scoped branding receipt only and defer to:

- `agent-lee/receipts/INC-LEEWAY-EXT-2026-05-17-RUNTIME-TRUTH.md`
- `agent-lee/receipts/leeway_vscode_full_runtime_verification_report.md`
- `agent-lee/vscode-extension/test-evidence/leeway-active-runtime-attestation-result.json`
- `agent-lee/vscode-extension/test-evidence/leeway-evidence-consistency-result.json`
- `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json`

## Live installed-runtime proof

- Validation mode: `INSTALLED_EXTENSION`
- Runtime source mode: `UPDATE_CHANNEL_MANUAL_LOCAL_VSIX`
- Installed extension version observed in live asset paths: `1.2.11`
- Evidence JSON: `agent-lee/vscode-extension/test-evidence/leeway-extension-live-visual-validation-result.json`
- Screenshots:
  - `agent-lee/vscode-extension/test-evidence/vscode-live-activitybar-icon.png`
  - `agent-lee/vscode-extension/test-evidence/vscode-sidebar-open.png`
  - `agent-lee/vscode-extension/test-evidence/vscode-readme-open.png`

This receipt must not be interpreted as final live-runtime closure proof.

## Live checklist result

1. Activity Bar icon appears and is not blank. `SOURCE/PACKAGE PASS`
2. Activity Bar icon is recognizable at small size. `SOURCE/PACKAGE PASS`
3. Agent Lee sidebar opens. `LIVE RUNTIME PASS`
4. Top-right LeeWay button displays. `LIVE RUNTIME PASS`
5. Bottom Agent Lee button displays. `LIVE RUNTIME PASS`
6. LeeWay Standards button displays. `LIVE RUNTIME PASS`
7. README header image displays. `SOURCE/PACKAGE PASS, LIVE FAIL`
8. README system flow image displays. `SOURCE/PACKAGE PASS, LIVE FAIL`
9. Extension details/README branding is updated in live preview. `LIVE FAIL`
10. Status bar still shows Agent Lee state. `LIVE RUNTIME PASS`
11. Runtime Health reports current install channel and runtime status. `LIVE RUNTIME PASS`

*** Add File: c:\Users\Leona\.leeway-vscode\agent-lee\receipts\leeway_github_publish_report.md
<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.GITHUB_PUBLISH_REPORT
PURPOSE: Records the published LeeWay branch health after the runtime truth and README refresh were pushed to GitHub.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay GitHub Publish Report

## Publish Health

- Branch: `codex-publish-leeway-system`
- Commit: `db38e4f0fd8d498d8893216ad8e2f8ad81bc5226`
- Remote: `https://github.com/4citeB4U/.LEEWAY-VACODE.git`
- Pushed: `Yes`
- Remote branch exists: `Yes`
- Remote branch commit matches local HEAD: `Yes`
- Working tree state: `Intentionally dirty after post-push compile and runtime evidence refresh.`

## LFS And Size Health

- Git LFS version: `3.7.1`
- LFS-tracked file: `knowledge/knowledge.jsonl`
- LFS status: `Clean`
- `.gitattributes` rule present: `Yes`
- `knowledge/knowledge.jsonl` stored in commit as LFS pointer: `Yes` (`git cat-file -s HEAD:knowledge/knowledge.jsonl` = `134` bytes)
- Tracked non-LFS files over 100 MB remaining: `No`

## Build Health

- Compile command: `npm.cmd run compile` from `agent-lee/vscode-extension`
- Compile status: `PASS`

## Remaining Runtime Closure Work

1. Live visual validation still fails.
2. README live proof still fails.
3. Human-audible voice remains truthful `PARTIAL`.
4. Runtime incident closure gate remains `FAIL` until the live visual lane is green.

## Verdict

- Final verdict: `PASS_PUBLISHED_BRANCH_HEALTHY`

*** Add File: c:\Users\Leona\.leeway-vscode\agent-lee\receipts\leeway_github_push_truth_report.md
<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.GITHUB_PUSH_TRUTH_REPORT
PURPOSE: Proves whether the LeeWay VS Code project was actually published to the expected GitHub remote and explains branch visibility truthfully.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay GitHub Push Truth Report

## Local State

- Local branch: `codex-publish-leeway-system`
- Local HEAD: `db38e4f0fd8d498d8893216ad8e2f8ad81bc5226`
- Commit `db38e4f` exists locally: `Yes`
- Working tree clean: `No`
- Working tree reason: `Post-push compile and runtime evidence refresh rewrote evidence artifacts.`

## Remote State

- Remote URL: `https://github.com/4citeB4U/.LEEWAY-VACODE.git`
- Remote branch exists: `Yes`
- Remote branch: `origin/codex-publish-leeway-system`
- Remote branch commit: `db38e4f0fd8d498d8893216ad8e2f8ad81bc5226`
- Local and remote branch match: `Yes`
- Remote `main` commit: `735442601bb6e79db47eec91a92cb087f7ea8809`
- Updates are on `main`: `No`
- PR required for `main` to show these updates: `Yes`

## LFS Truth

- Git LFS tracking active: `Yes`
- LFS-tracked file: `knowledge/knowledge.jsonl`
- LFS upload status: `Clean`
- Commit contains LFS pointer instead of full file: `Yes`

## Proof Commands

- `git push -u origin codex-publish-leeway-system`
  Output: `branch 'codex-publish-leeway-system' set up to track 'origin/codex-publish-leeway-system'. Everything up-to-date`
- `git ls-remote origin codex-publish-leeway-system`
  Output: `db38e4f0fd8d498d8893216ad8e2f8ad81bc5226 refs/heads/codex-publish-leeway-system`
- `git ls-remote origin main`
  Output: `735442601bb6e79db47eec91a92cb087f7ea8809 refs/heads/main`

## Why GitHub May Look Unchanged

1. The updates were pushed to `codex-publish-leeway-system`, not `main`.
2. GitHub defaults to `main`, so the website will still show the older `main` branch unless the branch selector is changed or a PR is opened.
3. The earlier 100 MB blocker was resolved by moving `knowledge/knowledge.jsonl` into Git LFS before the successful push.

## Next Step

- Compare URL: `https://github.com/4citeB4U/.LEEWAY-VACODE/compare/main...codex-publish-leeway-system`

## Verdict

- Final verdict: `PARTIAL_PUSHED_BRANCH_NOT_MAIN`
