---
name: skill.leeway.adminos.public-projection
description: Build AdminOS public projection systems with draft/published states, manual publish, and no direct public mutation from agents.
---

# LeeWay AdminOS Public Projection

## Purpose
Create an AdminOS projection system that separates draft state, published state, and public preview with owner-controlled publishing.

## Must enforce
- Admin draft state and approved published state
- explicit public projection surface consuming only published state
- manual publish controls with owner confirmation
- draft preview versus published preview
- runtime authority banner for public-facing projection
- no direct public mutation from agents or automated flows
- AdminOS must be a real control plane, not decorative
- AdminOS must expose dashboard, publish, security, audit, agent, onboarding, and owner manual surfaces
- AdminOS must control the application through governed draft/published projection
- public app without paired AdminOS must be treated as a violation unless a governed static-only exception exists

## Runtime contract
- proposal shape with `publishDirectly: false`
- `requiresHumanApproval: true` for public state updates
- telemetry event stream identity
- audit event proof identity
- required law: `CORE.GOVERNANCE.LAW.PAIRED_ADMINOS_CONTROL_PLANE`

## Report
- `leeway_agent_skill_runtime_report.md`
