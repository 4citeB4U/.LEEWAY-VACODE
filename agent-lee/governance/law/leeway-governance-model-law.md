<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.GOVERNANCE_MODEL
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Defines the core LeeWay governance law model, including human authority, traceability, runtime authority, agent law, owner education, security, and governed growth.
-->

# LeeWay Governance Model Law

This law encodes the Campbell & Co. governance model into the LeeWay Application Standards fabric.
It is the default governance law for any LeeWay VS Code app, runtime, agent, or MCP-managed workflow unless a governed exception is declared.

## A. Human Governance Laws
- Human owner remains final authority.
- Agents assist under law.
- Manual publish is required for exposed production state.
- Proposal-before-mutation is required for any agent-driven change.
- Owner must understand what can and cannot be done before approval.
- No public projection without explicit owner review.

## B. Traceability Laws
- No anonymous parts.
- Every UI node must carry LeeWay identity when practical.
- Every screen has a screen ID.
- Every workflow has a workflow ID.
- Every action has an action ID.
- Every agent action has runtime identity.
- Every telemetry event has stream identity.
- Every audit event has proof identity.
- Every runtime artifact is tagged, traceable, auditable, and recallable.

## C. Runtime Authority Laws
- No fallback simulation.
- Runtime modes must be classified.
- Database is not authority.
- Storage is state; policy decides authority.
- Missing configuration must be visible and blocking where needed.
- No runtime claim may be trusted without visible runtime validation.

## D. Agent Laws
- Agents require lawful capabilities.
- Agents need skill contracts and declared authority.
- Agents cannot publish directly unless explicitly approved.
- Agents cannot silently mutate production or draft state.
- Agents cannot fake tool/MCP/VM access.
- Agents must expose status, tool usage, skills, telemetry, audit, and blocked capabilities.
- Agents must declare affected LeeWay IDs and lane classification.

## E. Owner Education Laws
- The system must teach the owner how to govern it.
- Printable manual is required.
- Onboarding tour is required for owner-facing features.
- Contextual button help is required.
- Troubleshooting and escalation guidance are required.
- Help must be surfaced, not merely stored in registries.
- Owner readiness must be visible and traceable.

## F. Security Laws
- Zero trust runtime by default.
- Data classification is required for all sensitive fields.
- Least privilege is required for every capability.
- Secrets never ship in frontend or persisted state.
- Uploads must be validated before acceptance.
- Payment data boundary must be enforced.
- Tamper-evident audit is required for sensitive actions.
- Incident lockdown capability is required.
- Deception and trap systems must be isolated and telemetry-only.

## G. Governed Growth Laws
- LeeWay does not block growth.
- LeeWay blocks ungoverned growth.
- Green, Yellow, Red growth lanes are required.
- New capabilities must enter through registry, policy, audit, and owner visibility.
- Owner-facing runtime change must be classified and approved.

## H. Paired AdminOS Control Plane Law
- LAW-0019: Paired AdminOS Control Plane
- Every LeeWay-created application with a public or operational surface must include a governed AdminOS control plane unless explicitly exempted.
- AdminOS must allow the authorized owner to view the public app, edit controlled content, manage data/media/theme/settings, inspect agents, inspect MCP/tools, inspect runtime authority, inspect audit and telemetry, use guided onboarding, print/download the owner manual, ask agents for help, approve/reject agent proposals, publish manually, and freeze unsafe activity.
- The AdminOS must not be decorative. It must control the application through a governed draft/published projection model.
- Required metadata: law ID, title, owner agent: Lee Prime, enforcement method, affected systems, violation behavior, audit category, and trace path.
- Violation behavior: a public app created without AdminOS must be flagged by LeeWay audit unless a governed static-only exception is recorded.
- Public-facing application is incomplete on its own; paired AdminOS is required for completion.

## I. Extension Runtime Truth Law
- LAW-0020: Extension Runtime Truth
- The extension must prove whether it is running from source, a linked workspace, a packaged VSIX, or a stale installed VSIX.
- Runtime health must surface command registration, packaged asset presence, build-info presence, and runtime hash/version drift.
- A stale installed VSIX must be classified as stale and shown plainly in runtime status instead of being mistaken for the current source build.
- Source development must prefer Extension Development Host and reload workflows; VSIX packaging is release-only.

## References
- `references/law-set.md`
- `references/audit-checks.md`
- `references/agent-runtime-identity.md`
- `references/paired-adminos-standard.md`
- `agent-lee/governance/law/leeway-extension-runtime-truth-law.md`
