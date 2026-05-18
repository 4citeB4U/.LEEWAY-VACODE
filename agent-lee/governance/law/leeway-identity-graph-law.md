<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.IDENTITY_GRAPH
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Canonical repo law for LeeWay application identity graph ownership and registration.
-->

# LeeWay Identity Graph Law

Every meaningful application connector, pipeline, node, command, event, route, gate, artifact, and evidence path must be registered in the LeeWay application identity graph.

## ID rule

Use the canonical pattern:

`LEEWAY_APP::<DOMAIN>::<PIPELINE>::<NODE>`

## Required node fields

- `id`
- `name`
- `classification`
- `owner`
- `domain`
- `pipeline`
- `file`
- `inputs`
- `outputs`
- `commandsEmitted`
- `commandsHandled`
- `eventsEmitted`
- `eventsHandled`
- `verification`
- `evidence`
- `status`

## Enforcement

- No active file without registry coverage.
- No active command without a registered owner.
- No emitted event without a registered source and consumer.
- No duplicate source of truth without one active owner and one quarantine or delete-pending classification.
