---
name: skill.leeway.mcp-bridge-governance
description: Govern MCP, VS Code bridge, file system, GitHub, browser, retrieval, telemetry, and audit tools with connection state and allowed workflows.
---

# LeeWay MCP Bridge Governance

## Purpose
Govern MCPs and bridge tools used by LeeWay applications.
MCP and tool registry state is part of the paired AdminOS control plane.

## Must enforce
- explicit connection state for every MCP and bridge
- heartbeat or health state for critical runtime bridges
- owner agent identity for bridge activation
- allowed agents and allowed workflows lists
- denied data classifications for untrusted surfaces
- blocked reason metadata for denied access
- no fake connected status or spoofed bridge claims
- AdminOS must expose MCP/tool registry and allowed/blocked capability state

## Additional rules
- every MCP declaration must include the supported toolset and permissions
- every bridge connection must be auditable
- runtime claims about MCP availability require actual connector state
- owner-facing MCC dashboards should show permitted and blocked agents

## Audit category
- `mcp.bridge.governance`
