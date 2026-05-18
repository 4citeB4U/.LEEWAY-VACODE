---
name: skill.leeway.agent-proposal-workflow
description: Convert agent tasks into a governance-first proposal workflow that prevents direct mutation and requires owner approval.
---

# LeeWay Agent Proposal Workflow

## Purpose
Transform any agent action into a proposal-before-mutation workflow as part of the paired AdminOS application standard.

## Must enforce
- no Run buttons for agent-driven write tasks
- Preview Proposal view before code or state changes
- before/after value display for proposed edits
- `requiresHumanApproval: true`
- `publishDirectly: false`
- Apply to Draft button
- Reject button
- audit event for proposal creation and decision
- telemetry event for proposal flow

## Runtime contract
- proposals must include target file or surface
- proposals must include affected LeeWay IDs
- proposals must include law references and lane classification
- no direct production change without explicit human approval

## Audit category
- `agent.proposal.workflow`
