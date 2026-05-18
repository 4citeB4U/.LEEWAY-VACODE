---
name: skill.leeway.owner-education-layer
description: Create owner manuals, onboarding, contextual help, troubleshooting, and escalation guidance for LeeWay applications.
---

# LeeWay Owner Education Layer

## Purpose
Build the owner education surface so owners can operate and govern the app without developer help.
This includes the Paired AdminOS control plane and its owner-facing workflows.

## Must enforce
- printable manual with table of contents
- Markdown export that includes TOC and troubleshooting
- troubleshooting section with escalation guidance
- contextual help triggers on owner-facing controls
- onboarding start/skip controls
- real onboarding target selectors for owner-facing features
- traceability metadata for manual and help content
- owner-readiness QA checkpoints
- owner education surfaced in AdminOS, not only stored in registries

## Additional rules
- registry-only success is not enough; help must be surfaced in UI and documented
- onboarding should map to real application controls and runtime flows
- if a feature is owner-facing, it must receive help and onboarding support
- all help content must carry LeeWay IDs and audit references

## Audit category
- `owner.education`
