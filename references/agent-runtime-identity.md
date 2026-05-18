<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.REFERENCE.AGENT_RUNTIME_IDENTITY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Reference for LeeWay agent runtime identity and traceability metadata.
-->

# LeeWay Agent Runtime Identity

Every agent runtime artifact must carry a full LeeWay identity payload. This includes:

- `LeeWayAgentActionIdentity`
- `LeeWayAgentRuntimeState`
- `LeeWaySkillRouteIdentity`
- `LeeWayDiagnosticIdentity`
- `LeeWayProposalIdentity`
- `LeeWayDraftPatchIdentity`
- `LeeWayTelemetryEvent`
- `LeeWayAuditEvent`
- `LeeWayToolUsageRecord`

## Required properties
- actor identity
- intent identity
- transaction identity
- route identity
- capability contract
- affected LeeWay IDs
- law references
- owner approval state
- runtime mode classification

## Runtime artifact expectations
- every proposal must carry before/after values
- every draft patch must carry patch identity and target metadata
- every telemetry event must carry stream identity
- every audit event must carry proof identity and law references
- every runtime state event must be visible to owner or audit when it affects public or draft state
