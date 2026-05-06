/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.GOVERNANCE_LOADER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
import * as path from "path";

const STANDARDS_ROOT = "D:\\LeeWay-Products-Files\\.Leeway-new-line-of-products\\LeeWay-Standards";
const PERSONA_MANIFEST = path.join(STANDARDS_ROOT, "Agent_Lee_Persona_System", "agentlee_persona_manifest.json");
const PERSONA_PROMPT = path.join(STANDARDS_ROOT, "Agent_Lee_Persona_System", "01_SUPERIOR_PROMPT", "Agent_Lee_Superior_Prompt.md");
const COLLAB_CONTRACT = path.join(STANDARDS_ROOT, "src", "collaboration", "CollaborationContract.ts");
const TRANSITIONS = path.join(STANDARDS_ROOT, "src", "collaboration", "AllowedTransitions.ts");

export type SovereignContext = {
  personaManifest: any;
  superiorPrompt: string;
  collaborationContractExcerpt: string;
  transitionExcerpt: string;
  constitutionalRule: string;
};

function readText(file: string) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function readJson(file: string) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function extractRule(text: string) {
  const match = text.match(/CONSTITUTIONAL_RULE:\s*"([^"]+)"/);
  return match ? match[1] : "Agent Lee governs, LeeWay law constrains, and internal workers serve.";
}

function excerpt(text: string, max = 5000) {
  return text.slice(0, max).trim();
}

export function loadSovereignContext(): SovereignContext {
  const contractText = readText(COLLAB_CONTRACT);
  const transitionText = readText(TRANSITIONS);

  return {
    personaManifest: readJson(PERSONA_MANIFEST),
    superiorPrompt: excerpt(readText(PERSONA_PROMPT), 8000),
    collaborationContractExcerpt: excerpt(contractText, 5000),
    transitionExcerpt: excerpt(transitionText, 3000),
    constitutionalRule: extractRule(contractText)
  };
}

