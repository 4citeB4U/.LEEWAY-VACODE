<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.TRACER_PACK
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Defines the LeeWay Tracer Pack law for reconstructing actions, rejections, quarantines, conversions, and inductions.
-->

# LeeWay Tracer Pack Law

No LeeWay action, rejection, quarantine, conversion, or agent induction is valid unless it can be reconstructed from a LeeWay Tracer Pack containing actor ID, prompt ID, intent ID, transaction ID, authority ID, policy ID, gate ID, evidence ID, and receipt ID.

A Tracer Pack must answer:

- Who entered?
- What did they ask?
- Who received it?
- What intent was extracted?
- What authority did they have?
- What node or pipeline did it touch?
- What gate accepted or rejected it?
- What evidence proves that?
- What receipt records it?
- What was returned or blocked?

## Public-Safe Reporting

The system must generate a public-safe disclosure report for corrupt or untrusted attempts. It must not automatically broadcast private details.

Public-safe reports may include trace ID, actor ID, prompt ID, transaction ID, violated policy, rejecting gate, classification, risk level, evidence hash, receipt path, and human review status.

Public-safe reports must exclude private user data, secrets, local filesystem details, private prompts unless approved, tokens, API keys, and sensitive business logic.
