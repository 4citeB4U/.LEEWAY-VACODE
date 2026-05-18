---
name: skill.leeway.agent-runtime-identity
description: Ensure every agent action and runtime artifact carries full LeeWay identity metadata and traceability.
---

# LeeWay Agent Runtime Identity

## Purpose
Guarantee every agent action and runtime artifact has complete LeeWay identity.

## Must enforce
- LeeWayAgentActionIdentity
- LeeWayAgentRuntimeState
- LeeWaySkillRouteIdentity
- LeeWayDiagnosticIdentity
- LeeWayProposalIdentity
- LeeWayDraftPatchIdentity
- LeeWayTelemetryEvent
- LeeWayAuditEvent
- LeeWayToolUsageRecord

## Additional rules
- every runtime artifact must include source, actor, intent, transaction, and verification path
- every agent capability must declare the tool and MCP it uses
- every blocked capability must be visible in the runtime record
- no identity metadata may be removed by a skill during mutation

## Audit category
- `agent.runtime.identity`
