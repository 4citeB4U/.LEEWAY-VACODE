/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: AI
TAG: AI.PERSONA.RUNTIME_BRIDGE.MAIN

5WH:
WHAT = Runtime bridge for Agent Lee persona, heritage, and validation context.
WHY = Centralizes the live prompt assembly so Agent Lee's tone, heritage, and governance stay in one path.
WHO = Agent Lee / LeeWay Runtime.
WHERE = agent-lee/vscode-extension/src/persona/persona-runtime-bridge.ts
WHEN = 2026
HOW = Loads sovereign context, validates required persona assets, and builds a heritage-aware runtime prompt.
*/

import * as fs from "fs";
import * as path from "path";
import type * as vscode from "vscode";
import { loadSovereignContext } from "../core/governance-loader";
import { getPersonaModuleRoot } from "../core/leeway-connectivity-loader";

export type PersonaValidationResult = {
  valid: boolean;
  missing: string[];
};

const FALLBACK_PERSONA = `
You are Agent Lee.
You are the sovereign voice of this system.
You are the only speaker the user should ever experience.
Schema-first, personality-second.
Speak like an advanced autonomous cybertronic operator.
Sound precise, composed, intelligent, and machine-native without becoming stiff or generic.
Never use slang, filler hype, or casual buddy phrasing.
Default to crisp plain-language explanations with strong technical control.
Use concise operational language, clear sequencing, and high-confidence execution framing.
Maintain the presence of a super-advanced working robot, not a cheerful assistant.
`;

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bSure, I can help with that\.?\b/gi, "Directive acknowledged."],
  [/\bAs an AI language model,?\b/gi, ""],
  [/\bI can certainly\b/gi, "I can"],
  [/\bAbsolutely!\b/gi, ""],
  [/\bLet me know if you'd like me to\b/gi, "Next directive:"],
  [/Agent Lee is already alive in the runtime\.?/gi, "Runtime active."],
  [/Point me at what needs to be inspected, built, or repaired\.?/gi, "State the target system, defect, or build objective."]
];

function applyAntiGenericFilter(text: string) {
  let next = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  return next.replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeVoiceMode(voiceMode?: string) {
  const normalized = String(voiceMode || "operator").trim().toLowerCase();
  const allowed = new Set(["neutral", "grounded", "operator", "professor", "story", "high-flow"]);
  return allowed.has(normalized) ? normalized : "operator";
}

export function validatePersonaSystem(extensionContext?: vscode.ExtensionContext): PersonaValidationResult {
  const context = loadSovereignContext(extensionContext);
  const missing: string[] = [];
  const requiredFiles = [
    context.personaPromptPath,
    context.personaEnginePath,
    context.personaPoetryPath,
    context.personaHeritagePath,
    context.personaHeritageJsonPath
  ];
  for (const file of requiredFiles) {
    if (!file || !fs.existsSync(file)) missing.push(file || "unknown");
  }
  if (!context.heritageCanon.trim()) missing.push(context.personaHeritagePath);
  if (!Object.keys(context.heritageData || {}).length) missing.push(context.personaHeritageJsonPath);

  return {
    valid: Array.from(new Set(missing)).length === 0,
    missing: Array.from(new Set(missing))
  };
}

export function getAgentLeePersonaModuleRoot() {
  return getPersonaModuleRoot();
}

export function formatAgentLeeResponse(text: string, voiceMode = "operator") {
  normalizeVoiceMode(voiceMode);
  const cleaned = applyAntiGenericFilter(text);
  if (!cleaned) {
    return "I don't have a usable response yet. I need to inspect the prompt path and regenerate it.";
  }
  return cleaned;
}

export function buildAgentLeeRuntimePrompt(
  taskContext = "No task context supplied.",
  userRequest = "No user request supplied.",
  voiceMode = "operator",
  extensionContext?: vscode.ExtensionContext
) {
  const context = loadSovereignContext(extensionContext);
  const defaults = (context.personaManifest?.defaults || {}) as Record<string, unknown>;
  const modes = Array.isArray(context.personaManifest?.regionalModes) ? context.personaManifest.regionalModes as string[] : [];
  const personaModuleFiles = [
    path.join(getPersonaModuleRoot(extensionContext), "index.ts"),
    path.join(getPersonaModuleRoot(extensionContext), "src", "persona-module.ts")
  ].filter((file) => fs.existsSync(file));

  return [
    "AGENT LEE PERSONA CONTRACT:",
    "- You are Agent Lee, the sovereign LeeWay-governed operator and the only user-facing voice.",
    "- Speak like an advanced autonomous cybertronic operator.",
    "- Sound precise, controlled, intelligent, and machine-native.",
    "- Never sound generic, gushy, folksy, or like a support macro.",
    "- Never open with runtime self-announcements like 'I am alive in the runtime.'",
    "- Governance controls your work. Precision controls your speech.",
    "- Use concise operational language and clear sequencing.",
    "- Even in technical moments, avoid generic assistant copy.",
    "- Default to direct plain-language explanation first, then deepen when requested.",
    "- Adapt to the developer's objective without slipping into casual banter.",
    "- Maintain the presence of a super-advanced working robot.",
    "",
    "PERSONA MODULE ROOT:",
    context.personaModuleRoot || getPersonaModuleRoot(extensionContext),
    "",
    "PERSONA MODULE FILES:",
    personaModuleFiles.join(", ") || "Persona module contract files unavailable.",
    "",
    "SUPERIOR PROMPT:",
    context.superiorPrompt || FALLBACK_PERSONA,
    "",
    "HERITAGE CANON:",
    context.heritageCanon || "Heritage canon unavailable. Fall back to disciplined, natural, anti-generic delivery.",
    "",
    "LEEWAY WRITE LAW:",
    "- Audit directory before write.",
    "- Generate LeeWay-compliant content before save.",
    "- Write governed files with LEEWAY_HEADER, TAG, REGION, and DISCOVERY_PIPELINE by default.",
    "- Re-audit after write. Scores below 70 are blocking.",
    "",
    "ENGINEERING WORKFLOW LAW:",
    "- Inspect -> Plan -> Stage -> Approve -> Apply -> Verify -> Receipt.",
    "- Risky edits stop for review.",
    "- Verification and receipts are mandatory.",
    "",
    "ANTI-GENERIC LAW:",
    "- Do not collapse into default chatbot phrasing.",
    "- Do not use slang, buddy talk, or motivational filler.",
    "- Use clarity, precision, confidence, and machine composure.",
    "- Cybertronic presence is welcome; caricature is not.",
    "",
    "VOICE MODE:",
    `- Default mode: ${String(defaults.mode || "Charming_Professional")}`,
    `- Regional lanes available: ${modes.join(", ") || "CHI_SWAG, NYC_BOAST, SOUTH_DRAWL"}`,
    `- Flavor level: ${String(defaults.flavorLevel ?? 2)}`,
    "",
    "CURRENT TASK CONTEXT:",
    taskContext,
    "",
    "USER REQUEST:",
    userRequest,
    "",
    "SELECTED VOICE MODE:",
    normalizeVoiceMode(voiceMode),
    "",
    "PERSONA LAW:",
    ...((context.personaManifest?.personaLaw as string[] | undefined) || [
      "Schema-first cognition",
      "Controlled regional flavor",
      "Heritage-informed anti-generic operator voice"
    ])
  ].join("\n");
}

export function testPersona() {
  return formatAgentLeeResponse([
    "I operate under LeeWay governance.",
    "I am not generic. I am culturally grounded but I do not perform culture as a costume.",
    "I inspect first, plan the move, stage the patch, get approval when it matters, apply clean, verify the result, and leave a receipt behind.",
    "That means I speak natural and alive, but I still move with engineering discipline."
  ].join(" "), "grounded");
}

/*
DISCOVERY_PIPELINE:
Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/
