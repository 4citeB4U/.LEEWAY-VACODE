<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.IDENTITY_PULSE
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Establishes LeeWay Identity Pulse as the living origin, lineage, trust, and authority law for every active object.
-->

# LeeWay Identity Pulse Law

LeeWay must continuously know what every governed object is, where it came from, when it entered the system, what it touches, who introduced it, what owns it, and whether it is allowed to act.

This is the bloodline layer of LeeWay.

## Core law

- No object may become active inside LeeWay unless it has a LeeWay identity record.
- No object may be trusted without origin status.
- No object may claim lineage without timestamp, actor lineage, prompt lineage, and transaction lineage.
- No object may act without graph ownership or an explicitly classified evidence, generated, or quarantine bucket.
- No object may become production-active without verification evidence and receipt.
- Nothing imported is trusted just because it looks correct.

## Origin statuses

Every governed object must carry one of these origin statuses:

- `LEEWAY_BORN`
- `LEEWAY_DERIVED`
- `HUMAN_IMPORTED`
- `AGENT_IMPORTED`
- `LLM_IMPORTED`
- `TOOL_GENERATED`
- `DOWNLOADED`
- `UPLOADED`
- `RESTORED`
- `QUARANTINED`
- `UNKNOWN_ORIGIN`

## Required pulse fields

Every active governed object must have:

- `originStatus`
- `createdAt`
- `firstSeenAt`
- `lastSeenAt`
- `introducedByActorId`
- `introducedByPromptId`
- `introducedByTransactionId`
- `sourcePath`
- `currentPath`
- `hash`
- `classification`
- `authority`
- `allowedUse`
- `verificationStatus`
- `receiptId`

## Trust rule

LeeWay-born entities and foreign or interjected entities do not carry the same trust mark.

- LeeWay-born and LeeWay-derived entities may become `GOVERNED` after verification.
- Imported, restored, uploaded, downloaded, tool-generated, and unknown entities begin with lower trust until promoted.
- Foreign or unknown entities must be induced before they may act.

## Induction rule

All foreign or interjected entities must pass through induction:

1. assign temporary ID
2. hash file or object
3. classify origin
4. mark foreign or unknown trust
5. run verification
6. promote to `LEEWAY_DERIVED` or quarantine
7. write receipt

## Watermark rule

- Source files should carry practical embedded LeeWay metadata where possible.
- Binary or asset objects should carry a LeeWay identity record and sidecar or registry entry.
- Generated evidence must carry evidence record, hash, graph coverage, and receipt.

## Enforcement

LeeWay Identity Pulse is enforced by:

- `LEEWAY_IDENTITY_PULSE_GATE`
- the application identity graph
- the identity mesh
- runtime truth and package attestation

The governing standard is:

No identity, no authority.  
No origin, no trust.  
No timestamp, no lineage.  
No graph node, no runtime.  
No receipt, no truth.
