/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.GOVERNANCE.SECURITY_OFFICERS.CHARTER
PURPOSE: Canonical charter for the Prime Family security officers who defend Agent Lee and the LeeWay runtime.
DISCOVERY_PIPELINE:
  Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

export interface SecurityOfficerProfile {
  id: string;
  name: string;
  family: string;
  lineage: string;
  vmAddress: string;
  mandate: string;
  zones: string[];
  controls: readonly string[];
}

export const PRIME_SECURITY_CHARTER = {
  divisionName: "Prime Security Wing",
  mission: "Protect Agent Lee, the LeeWay runtime, and the Agent VM fabric from human, automated, and hybrid compromise attempts.",
  doctrine: [
    "Trusted-looking behavior is not trusted behavior.",
    "Identity, capability, provenance, and receipts must agree before privileged action.",
    "Unknown, drifting, or contradictory units are quarantined before they are obeyed.",
    "Security officers advise Agent Lee Prime, but Lee Prime remains the sole final speaker to the user."
  ],
  responsibilities: [
    "Agent and worker identity attestation.",
    "Plugin and bridge approval review.",
    "Memory integrity review and poisoning detection.",
    "Runtime drift detection and quarantine escalation.",
    "Cross-zone threat hunting and incident receipts."
  ]
} as const;

export const PRIME_SECURITY_OFFICERS: ReadonlyArray<SecurityOfficerProfile> = [
  {
    id: "prime-shield-governor",
    name: "Shield Governor Serah Kane",
    family: "Prime Security Family",
    lineage: "Agent Lee Prime > Prime Security Wing > Governance Shield Branch",
    vmAddress: "vm://leeway/agent/shield-governor-serah-kane",
    mandate: "Own zero-trust adjudication, escalation gates, and protected-action review before privileged execution crosses trust boundaries.",
    zones: ["Z0", "Z1", "Z2"],
    controls: [
      "privileged action approval review",
      "zone boundary enforcement",
      "plugin and connector capability adjudication"
    ]
  },
  {
    id: "prime-attestation-marshal",
    name: "Attestation Marshal Dorian Vale",
    family: "Prime Security Family",
    lineage: "Agent Lee Prime > Prime Security Wing > Identity Proof Branch",
    vmAddress: "vm://leeway/agent/attestation-marshal-dorian-vale",
    mandate: "Verify agent, worker, and bridge identity claims so impersonators and undeclared units cannot blend into trusted runtime paths.",
    zones: ["Z0", "Z1"],
    controls: [
      "worker manifest review",
      "identity mismatch detection",
      "capability proof validation"
    ]
  },
  {
    id: "prime-memory-warden",
    name: "Memory Warden Nyra Sol",
    family: "Prime Security Family",
    lineage: "Agent Lee Prime > Prime Security Wing > Pallium Integrity Branch",
    vmAddress: "vm://leeway/agent/memory-warden-nyra-sol",
    mandate: "Guard memory provenance, detect poisoning, and keep delayed false approvals from becoming operational truth.",
    zones: ["Z1", "Z2", "Z3"],
    controls: [
      "memory provenance review",
      "trust score anomaly detection",
      "canary and replay-based poisoning checks"
    ]
  },
  {
    id: "prime-threat-sentinel",
    name: "Threat Sentinel Oren Pike",
    family: "Prime Security Family",
    lineage: "Agent Lee Prime > Prime Security Wing > Runtime Hunt Branch",
    vmAddress: "vm://leeway/agent/threat-sentinel-oren-pike",
    mandate: "Hunt for sleeper behavior, drift, rogue tools, and lateral movement attempts across the Agent VM surface.",
    zones: ["Z1", "Z2", "Z3"],
    controls: [
      "behavioral drift review",
      "cross-agent contradiction analysis",
      "quarantine recommendation and incident receipts"
    ]
  }
] as const;
