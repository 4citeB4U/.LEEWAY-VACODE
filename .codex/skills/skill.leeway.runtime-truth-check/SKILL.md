---
name: skill.leeway.runtime-truth-check
description: Prevent false runtime claims by enforcing runtime validation, evidence, and honest report outputs.
---

# LeeWay Runtime Truth Check

## Purpose
Prevent false runtime and compliance claims by requiring runtime evidence, not just static or registry checks.
This includes proof that a public app has its paired AdminOS control plane and governed projection model.

## Must enforce
- build compliance is not runtime compliance
- static compliance is not owner readiness
- registry presence is not surfaced UI
- browser/runtime validation is required for runtime claims
- reports must say PASS / PARTIAL / FAIL honestly with evidence
- avoid any fallback simulation claim
- no fake AI/autonomy language in runtime summaries
- no direct draft mutation from preview AI
- no direct publish from agent without human approval
- do not declare runtime PASS for a public app without paired AdminOS and projection contract proof

## Verification commands
- run compile, package, and runtime smoke tests
- verify webview or UI runtime paths when applicable
- state the exact evidence used for the claim

## Audit category
- `runtime.truth.check`
