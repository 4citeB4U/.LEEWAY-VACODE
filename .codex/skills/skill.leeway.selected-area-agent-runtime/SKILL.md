---
name: skill.leeway.selected-area-agent-runtime
description: Enable owner-selected public preview regions for agent modifications with preview binding, proposal creation, and traceable runtime events.
---

# LeeWay Selected Area Agent Runtime

## Purpose
Allow the owner to select a public preview region and ask agents to propose changes while preserving governance and runtime traceability.
This selected-area runtime is part of the paired AdminOS/Projection contract and must map public preview regions to AdminOS draft controls.

## Must implement
- selected region context and preview binding registry
- skill routing for region-specific requests
- diagnostics and runtime trace metadata
- proposal builder with before/after values
- draft patch applier for selected-area preview
- runtime trace logging and audit events
- telemetry events for selected-region workflows
- manual publish for applied drafts
- code patch escalation rules for complex changes

## Constraints
- Agent-originated changes become proposals, not direct edits.
- Selected-area preview must bind to explicit region IDs.
- No direct publish from preview agent.
- Help and onboarding must explain selected-region editing.

## Audit category
- `agent.runtime.selected_area`
