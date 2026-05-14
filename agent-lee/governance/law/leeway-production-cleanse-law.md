<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.PRODUCTION_CLEANSE
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Governs production cleanse sequencing for duplicate paths, stale artifacts, and obsolete files.
-->

# LeeWay Production Cleanse Law

Production cleanup is a governed repair flow, not a bulk deletion exercise.

## Classification first

Every suspicious file must be classified before deletion:

- `ACTIVE`
- `FALLBACK`
- `EVIDENCE`
- `GENERATED`
- `QUARANTINE`
- `DELETE_PENDING`

## Deletion law

- Delete one category at a time.
- Do not mix unrelated cleanup groups in one commit.
- Run the identity graph gate and the application integrity gate after each deletion group.
- Revert or stop when a deletion group breaks the active application path.
- Prefer quarantine or explicit delete-pending marking before risky removal.
