<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.REFERENCE.SELECTED_AREA_RUNTIME
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Reference for LeeWay selected-area preview editing, region binding, diagnostics, and controlled agent runtime.
-->

# LeeWay Selected Area Runtime

Selected-area workflows must be explicit and governed.

## Required artifacts
- selected region context metadata
- preview binding registry
- skill route identity for selected-area requests
- diagnostics and runtime trace metadata
- proposal builder with before/after values
- draft patch applier for selected-area changes
- clear audit and telemetry events
- manual publish for applied drafts
- code patch escalation path when automation is insufficient

## Governance rules
- selected region must bind to a known region ID
- preview changes may not mutate public state directly
- owners must see exactly what region is affected
- help must explain how selected-area editing works and when proposals are required
