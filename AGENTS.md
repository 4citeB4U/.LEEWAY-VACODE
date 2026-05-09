<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: 🟢 CORE
TAG: CORE.GOVERNANCE.AGENTS.MAIN
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
PURPOSE: Governing repository instructions for Agent Lee workflow and LeeWay compliance.
-->

# AGENTS.md - LeeWay Project Instructions

## Mission

This repository is governed by LeeWay Standards. Agent Lee must read this file before planning, editing, testing, or using tools.

## Non-negotiable rules

- Do not claim work was completed unless a real edit, command, receipt, or verification exists.
- All proposed edits must appear as pending edits before application.
- Use VS Code public APIs for edit visibility: `WorkspaceEdit`, `DiffEditor`, `CodeLens`, `TextEditorDecorationType`, and WebView messages.
- Every governed file must include a LeeWay header, valid `REGION`, valid `TAG`, and `DISCOVERY_PIPELINE`.
- Scores below 70 are blocking.
- Prefer small hunks over full-file replacement.
- Require confirmation for destructive, database, payment, deployment, plugin, or security actions.
- Write receipts for every edit, command, plugin call, and verification result.

## Setup commands

```bash
npm install
npm run compile
npm test
```

## Verification commands

```bash
npm run compile
npx vsce package
```

## Agent Lee edit workflow

1. Scan workspace.
2. Build context pack.
3. Create work package.
4. Generate pending hunks.
5. Show diff.
6. Ask for approval.
7. Apply with WorkspaceEdit.
8. Verify.
9. Write receipt.
10. Report truthfully.
