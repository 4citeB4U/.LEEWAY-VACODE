/*
LEEWAY HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.GOVERNANCE.ZERO_TRUST.SECURITY_POLICY
PURPOSE: Canonical zero-trust and anti-persistence security policy for Agent Lee and the LeeWay ecosystem.
DISCOVERY_PIPELINE:
  Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

export type LeewaySecurityZone = "Z0" | "Z1" | "Z2" | "Z3";

export interface SecurityZonePolicy {
  zone: LeewaySecurityZone;
  purpose: string;
  internetAccess: "none" | "limited" | "sandboxed";
  fileAccess: "minimal" | "controlled" | "isolated";
  execution: "restricted" | "monitored" | "disposable";
  directCoreAccess: boolean;
}

export const ZERO_TRUST_RUNTIME_LAWS = [
  "Trust is never inherited; it is re-earned per action.",
  "No agent, model, plugin, tool, memory record, file, or workflow is trusted by default.",
  "Every action requires identity proof, capability scope, execution traceability, and receipt coverage.",
  "Any external or semi-trusted surface must be treated as compromise-capable.",
  "Compromise in Z2 or Z3 must never grant direct reach into Z0 governance state.",
  "Memory is evidence-bearing state, not truth by assertion.",
  "Behavioral drift is a security signal, not just a reliability signal.",
  "Unknown plugins, uploaded files, and imported workflows must enter quarantine-first handling.",
  "Governance policy must remain harder to modify than normal runtime behavior.",
  "The system must assume trusted-looking internal behavior can still be adversarial."
] as const;

export const SECURITY_CONTROL_FAMILIES = {
  identity: [
    "Signed agent identity is required for privileged runtime units.",
    "Worker manifests must declare origin, code hash, capability scope, and authority boundary.",
    "Rotating attestation state is required for long-lived workers, plugins, and bridge services."
  ],
  containment: [
    "Zone-based containment is mandatory for runtime surfaces.",
    "Disposable execution is required for unknown or externally sourced workloads.",
    "A lower-trust zone may not silently escalate into a higher-trust zone."
  ],
  memory: [
    "Every memory item must carry provenance, trust score, source chain, and verification state.",
    "Memory writes from non-authoritative units must be reviewable and replayable.",
    "Canary memory entries may be used to detect poisoning and illicit recall paths."
  ],
  drift: [
    "Behavioral drift must monitor goals, command sequences, plugin usage, escalation attempts, and trust-boundary crossings.",
    "Contradiction between declared role and observed behavior is a blocking anomaly.",
    "Repeated attempts to bypass receipts, policy, or validation must trigger review or quarantine."
  ],
  plugins: [
    "Plugins and tools operate under capability-based permissions, not ambient trust.",
    "Rogue or unverifiable plugins must be isolated in disposable zones with no core write path.",
    "Tool-call auditing must record request origin, granted capability, execution result, and downstream effects."
  ],
  recovery: [
    "Immutable or checksum-protected governance state must support rollback and tamper detection.",
    "Security failures must leave receipts and restorable checkpoints.",
    "The platform should maintain an AI immune-system layer that monitors agents, workflows, and runtime contradictions."
  ]
} as const;

export const SECURITY_ZONE_POLICIES: ReadonlyArray<SecurityZonePolicy> = [
  {
    zone: "Z0",
    purpose: "Core governance, constitutional law, attestation, and trust adjudication.",
    internetAccess: "none",
    fileAccess: "minimal",
    execution: "restricted",
    directCoreAccess: true
  },
  {
    zone: "Z1",
    purpose: "Trusted agents and governed services operating with explicit authority and monitored execution.",
    internetAccess: "limited",
    fileAccess: "controlled",
    execution: "monitored",
    directCoreAccess: false
  },
  {
    zone: "Z2",
    purpose: "External interaction surfaces such as plugins, browsers, connectors, and imported content.",
    internetAccess: "sandboxed",
    fileAccess: "controlled",
    execution: "monitored",
    directCoreAccess: false
  },
  {
    zone: "Z3",
    purpose: "Unknown, untrusted, or quarantine-required files, plugins, workflows, and experimental workers.",
    internetAccess: "sandboxed",
    fileAccess: "isolated",
    execution: "disposable",
    directCoreAccess: false
  }
] as const;

export const ADVERSARIAL_THREAT_CLASSES = [
  "trusted-agent impersonation",
  "sleeper or trigger-based model behavior",
  "memory poisoning and delayed false approvals",
  "rogue plugin or bridge execution",
  "poisoned workflow or hidden escalation path",
  "AI-assisted social engineering and synthetic proof fraud",
  "internal persistence and trusted-looking lateral movement"
] as const;

export const PRIME_SECURITY_ENFORCEMENT_RULES = [
  "Security officers must operate as declared Agent VM identities under the Prime Security Family.",
  "Shield review is required before critical plugin, bridge, or cross-zone actions proceed.",
  "Identity attestation must review worker, agent, and bridge claims before privileged trust is granted.",
  "Memory integrity review must treat poisoned, delayed, or unverifiable memory as non-authoritative.",
  "Threat hunting and drift review must be continuous for long-lived workers, plugins, and imported workflows."
] as const;
