<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.SELF_HEALING_REPAIR
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Governs LeeWay self-healing repair steps for drift, anonymous nodes, and stale routes.
-->

# LeeWay Self-Healing Repair Law

When drift is detected, Agent Lee must classify before patching.

## Required repair flow

1. Detect anonymous file, command, event, pipeline, or artifact drift.
2. Classify it as active, fallback, evidence, generated, quarantine, or delete-pending.
3. Assign or repair the LeeWay ID.
4. Verify source and consumer relationships.
5. Remove duplicate sources of truth.
6. Run the identity graph gate.
7. Run the application integrity gate.
8. Write or preserve the receipt and evidence.

## Prohibited repair patterns

- Patching around duplicate code without classification
- Hiding stale production paths with packaging ignores alone
- Declaring repair complete before gate evidence exists
