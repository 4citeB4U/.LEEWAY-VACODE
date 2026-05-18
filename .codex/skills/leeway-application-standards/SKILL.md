---
name: leeway-application-standards
description: Workspace-local LeeWay standards overlay that extends governed application work with Identity Pulse law for origin, trust, lineage, and authority.
---

<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.SKILL.IDENTITY_PULSE_OVERLAY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Extends the repo-local LeeWay standards surface with Identity Pulse requirements when the global skill package is outside the writable workspace.
-->

# LeeWay Application Standards Overlay

This workspace-local overlay extends the installed LeeWay Application Standards skill with Identity Pulse law.

Before any LeeWay agent writes, imports, deletes, packages, or activates a file, it must establish the object's LeeWay identity, origin status, actor, transaction, classification, and verification path.

## Identity Pulse additions

1. Establish the object's origin status before it becomes active.
2. Record first-seen, created-at, and last-seen timestamps.
3. Record actor, prompt, intent, and transaction lineage.
4. Record file or object hash and trust status.
5. Map the object to a graph node or classified evidence, generated, or quarantine bucket.
6. Refuse anonymous runtime controls, commands, events, state keys, artifacts, and imported files.
7. Run the identity pulse gate during verification.

## References

- `references/leeway-identity-pulse-law.md`
- `agent-lee/governance/law/leeway-identity-pulse-law.md`
- `references/paired-adminos-standard.md`
- `agent-lee/governance/law/leeway-governance-model-law.md`
- `agent-lee/governance/law/leeway-governance-model-law.md`
- `references/law-set.md`
- `references/component-standards.md`
- `references/agent-runtime-identity.md`
- `references/proposal-before-mutation.md`
- `references/owner-education.md`
- `references/security-hardening.md`
- `references/selected-area-runtime.md`
- `references/report-templates.md`
- `references/audit-checks.md`
- skill folders: `skill.leeway.app-governance.bootstrap`, `skill.leeway.react-component.create`, `skill.leeway.adminos.public-projection`, `skill.leeway.selected-area-agent-runtime`, `skill.leeway.agent-proposal-workflow`, `skill.leeway.agent-runtime-identity`, `skill.leeway.owner-education-layer`, `skill.leeway.security-hardening`, `skill.leeway.mcp-bridge-governance`, `skill.leeway.code-patch-proposal`, `skill.leeway.owner-acceptance-qa`, `skill.leeway.runtime-truth-check`
