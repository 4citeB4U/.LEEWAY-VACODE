<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: REPORT.ENGINEERING.REVIEW_ROUTING_FIX
DISCOVERY_PIPELINE:
  Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Receipt for Agent Lee review routing and broad inspection fix.
-->

# Agent Lee Review Routing Fix Receipt

- Date: 2026-05-09
- Scope: Fix Agent Lee so repository-review requests inspect and answer directly, and broaden preload coverage when the user explicitly asks for whole-app or every-file inspection.

## Pending edits applied

- Added direct-request classifiers in `agent-lee/vscode-extension/src/extension.ts` for repository opinion and broad inspection prompts.
- Updated direct-answer routing in `agent-lee/vscode-extension/src/extension.ts` so review-style prompts inspect workspace context without forcing the user through another approval-plan loop.
- Updated `agent-lee/vscode-extension/src/extension.ts` to preload richer workspace context for review-style direct answers.
- Extended `agent-lee/vscode-extension/src/core/file-intelligence.ts` so context building can vary file and sample limits instead of always previewing only the first 50 files.

## Verification commands

- `npm run compile`
  - Working directory: `agent-lee/vscode-extension`
  - Result: PASS
- `npx vsce package`
  - Working directory: `agent-lee/vscode-extension`
  - Result: PASS

## Notes

- The workspace root does not contain a top-level `package.json`, so verification was run from `agent-lee/vscode-extension`, which is the actual extension package.
- Existing unrelated edits were already present in the working tree before this run.
