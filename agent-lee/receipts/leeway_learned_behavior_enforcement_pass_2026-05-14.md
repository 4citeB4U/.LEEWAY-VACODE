<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.RECEIPT.LEARNED_BEHAVIOR_ENFORCEMENT
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Records the LeeWay learned-behavior enforcement pass across skill, law, identity graph, and gate surfaces.
-->

# LeeWay Learned Behavior Enforcement Pass

- Date: 2026-05-14
- Scope: Skill, repo law, repo instructions, identity graph, construction law gate
- Node: `LEEWAY_APP::GOVERNANCE::CONSTRUCTION_LAW::LEARNED_BEHAVIOR_ENFORCEMENT`
- Classification: `GOVERNANCE_GATE`
- Status: `ACTIVE`

## Pending edits applied

- Updated the LeeWay application standards skill to require pre-code LeeWay enforcement and added the learned-behavior reference.
- Added the learned-behavior reference to the repo and mirrored the rule into `AGENTS.md`, `.codex/instructions.md`, and the code-generation law.
- Registered learned-behavior enforcement in the application identity graph and extended the construction law gate to check it.

## Verification plan

- `npm run compile`
- `npm run LEEWAY_CONSTRUCTION_LAW_GATE`
- `npm run LEEWAY_APPLICATION_IDENTITY_GRAPH_GATE`
- `npm run LEEWAY_APPLICATION_INTEGRITY_GATE`
