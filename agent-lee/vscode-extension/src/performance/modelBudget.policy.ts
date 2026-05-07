/*
LEEWAY HEADER — DO NOT REMOVE

REGION: 🧠 AI
TAG: AI.PERFORMANCE.MODEL.BUDGET.POLICY

5WH:
WHAT = Agent Lee model budget policy
WHY = Routes tasks to smallest sufficient local model/tool before using heavier LLM paths
WHO = Agent Lee Runtime Performance Governor
WHERE = src/performance/modelBudget.policy.ts
WHEN = 2026
HOW = Profile-aware model selection and escalation rules

AGENTS:
PRIME
DOCTOR
MODEL_ROUTER
AUDIT

LICENSE:
MIT
*/

import type { PerformanceProfile } from "./performance.types";

export type ModelClass =
  | "none"
  | "rule_based"
  | "small_local"
  | "medium_local"
  | "large_local"
  | "remote_optional";

export interface ModelDecision {
  modelClass: ModelClass;
  reason: string;
  allowEscalation: boolean;
}

export function chooseModelClass(input: {
  profile: PerformanceProfile;
  task:
    | "voice_intent"
    | "repair_synthesis"
    | "code_generation"
    | "architecture"
    | "mcp_planning"
    | "summary"
    | "chat";
  complexity: "low" | "medium" | "high";
}): ModelDecision {
  const { profile, task, complexity } = input;

  if (task === "voice_intent") {
    return {
      modelClass: "rule_based",
      reason: "Voice intent routing should stay instant and local.",
      allowEscalation: false
    };
  }

  if (task === "repair_synthesis" && complexity === "low") {
    return {
      modelClass: "rule_based",
      reason: "Low-risk repair synthesis can use deterministic rules.",
      allowEscalation: false
    };
  }

  if (profile === "raspberry_pi" || profile === "quiet_laptop") {
    if (complexity === "high") {
      return {
        modelClass: "medium_local",
        reason: "Use medium local model only for high-complexity work in quiet mode.",
        allowEscalation: true
      };
    }

    return {
      modelClass: "small_local",
      reason: "Quiet profile prefers small local model.",
      allowEscalation: false
    };
  }

  if (profile === "balanced") {
    return {
      modelClass: complexity === "high" ? "medium_local" : "small_local",
      reason: "Balanced profile scales model size by complexity.",
      allowEscalation: complexity === "high"
    };
  }

  return {
    modelClass: complexity === "high" ? "large_local" : "medium_local",
    reason: "Performance/turbo profile allows heavier local reasoning.",
    allowEscalation: true
  };
}

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/