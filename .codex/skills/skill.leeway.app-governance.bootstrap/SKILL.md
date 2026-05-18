---
name: skill.leeway.app-governance.bootstrap
description: Bootstrap a new LeeWay governed application with the core governance scaffold, registries, law references, and owner education surface.
---

# LeeWay App Governance Bootstrap

## Purpose
Create or verify the core governance scaffold for a new LeeWay application.

## Must generate or verify
- law set and enforcement path
- governance registry
- screen registry
- workflow registry
- action registry
- telemetry registry
- audit registry
- agent registry
- capability registry
- skill registry
- MCP registry
- data classification registry
- security policy registry
- owner manual registry
- onboarding registry
- troubleshooting registry
- paired AdminOS control plane registry and projection contract

## Required behavior
- Ensure the app includes the LeeWay governance law package.
- Create registry entries for all new runtime surfaces.
- Verify owner education content for any owner-visible workflow.
- Attach traceable LeeWay IDs to screens, workflows, actions, and runtime artifacts.
- Require paired AdminOS when the app includes a public or operational surface.
- Do not allow unmanaged public applications unless a governed static-only exception is documented.
- Block creation if the app surface lacks owner authority metadata, runtime classification, or missing manual/help bindings.

## Runtime contract
- skill ID: `skill.leeway.app-governance.bootstrap`
- output artifact: governance scaffold and registrations
- required laws: `CORE.GOVERNANCE.LAW.GOVERNANCE_MODEL`, `CORE.GOVERNANCE.LAW.APPLICATION_CONSTRUCTION`, `CORE.GOVERNANCE.LAW.AGENT_CODE_GENERATION`, `CORE.GOVERNANCE.LAW.PAIRED_ADMINOS_CONTROL_PLANE`
- audit category: `governance.bootstrap`
- report output: `leeway_compliance_report.md`
