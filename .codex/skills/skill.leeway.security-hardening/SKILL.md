---
name: skill.leeway.security-hardening
description: Harden application security by enforcing data classification, zero trust, least privilege, upload validation, and audit export.
---

# LeeWay Security Hardening

## Purpose
Harden app security and privacy for LeeWay applications.
This security model is required for paired AdminOS applications and must be visible in AdminOS controls.

## Must enforce
- data classification for all data fields
- deny-by-default database rules
- role-based policies for sensitive state
- no frontend secrets
- upload validation for files and assets
- payment data boundary enforcement
- MCP least privilege and explicit capability permissions
- incident lockdown controls
- tamper-evident audit export
- a security center or dashboard surface for owner visibility
- AdminOS must show security configuration status and mark unconfigured items clearly

## Audit category
- `security.hardening`
