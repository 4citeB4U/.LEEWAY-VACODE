---
name: skill.leeway.code-patch-proposal
description: Create safe code patch proposals with human approval, law references, and validation commands before applying any mutations.
---

# LeeWay Code Patch Proposal

## Purpose
Allow code changes to be proposed safely and reviewed before application.
This code patch proposal process is the controlled authoring path for paired AdminOS applications.

## Must enforce
- clearly identified target files
- before/after patch plan
- law references for the proposed change
- affected LeeWay IDs
- human approval before mutation
- no direct production mutation unless approved
- validation commands for lint, build, audit, and compiled checks
- align proposals with AdminOS review workflows and runtime authority checks

## Additional rules
- proposals must include a concise summary of risk lane (Green, Yellow, Red)
- proposals must state whether approval is required
- proposals must enumerate any new runtime or public-facing artifacts
- generated patch output must be traceable and auditable

## Audit category
- `code.patch.proposal`
