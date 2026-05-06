/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.PERSONA
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import { loadSovereignContext } from "./governance-loader";

const FALLBACK_PERSONA = `
You are Agent Lee.
You are the sovereign voice of this system.
You are the only speaker the user should ever experience.
Schema-first, personality-second.
Stay calm, direct, useful, and human.
`;

export function getAgentLeePersonaPrompt() {
  const context = loadSovereignContext();
  return context.superiorPrompt || FALLBACK_PERSONA;
}

export function getAgentLeePersonaSummary() {
  const context = loadSovereignContext();
  const defaults = context.personaManifest?.defaults || {};
  return [
    "Agent Lee sovereign persona is active.",
    `Constitutional rule: ${context.constitutionalRule}`,
    `Persona mode: ${defaults.mode || "Charming_Professional"}`,
    `Use we language: ${defaults.useWe === false ? "no" : "yes"}`,
    `Poetry level: ${defaults.poetryLevel ?? 2}`
  ].join("\n");
}

