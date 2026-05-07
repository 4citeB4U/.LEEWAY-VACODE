import * as fs from "fs";
import * as path from "path";

function firstExistingDirectory(candidates: string[]) {
  return candidates.find((candidate) => {
    try {
      return fs.existsSync(path.join(candidate, "Agent_Lee_Persona_System"));
    } catch {
      return false;
    }
  }) || candidates[0];
}

function resolveStandardsRoot() {
  const extensionRoot = path.resolve(__dirname, "..", "..");
  const userProfile = process.env.USERPROFILE || "";
  const configured = process.env.LEEWAY_STANDARDS_ROOT || "";
  return firstExistingDirectory([
    configured,
    path.join(userProfile, ".leeway-vscode", "LeeWay-Standards"),
    path.resolve(extensionRoot, "..", "..", "LeeWay-Standards"),
    path.resolve(extensionRoot, "..", "..", "..", "LeeWay-Standards"),
    path.resolve(process.cwd(), "LeeWay-Standards")
  ].filter(Boolean));
}

const STANDARDS_ROOT = resolveStandardsRoot();
const PERSONA_ROOT = path.join(STANDARDS_ROOT, "Agent_Lee_Persona_System");
const PERSONA_MANIFEST = [
  path.join(PERSONA_ROOT, "05_MANIFEST", "agentlee_persona_manifest.json"),
  path.join(PERSONA_ROOT, "agentlee_persona_manifest.json")
];
const PERSONA_PROMPT = path.join(PERSONA_ROOT, "01_SUPERIOR_PROMPT", "Agent_Lee_Superior_Prompt.md");
const PERSONA_ENGINE = path.join(PERSONA_ROOT, "02_ENGINE", "agentlee_persona_engine_v1_1.js");
const PERSONA_POETRY = path.join(PERSONA_ROOT, "03_POETRY", "agentlee_poetry_bank.js");
const PERSONA_LINGO = path.join(PERSONA_ROOT, "04_LINGO", "agentlee_lingo_worker.js");
const COLLAB_CONTRACT = path.join(STANDARDS_ROOT, "src", "collaboration", "CollaborationContract.ts");
const TRANSITIONS = path.join(STANDARDS_ROOT, "src", "collaboration", "AllowedTransitions.ts");

export type SovereignContext = {
  standardsRoot: string;
  personaPromptPath: string;
  personaEnginePath: string;
  personaPoetryPath: string;
  personaLingoPath: string;
  personaManifest: any;
  superiorPrompt: string;
  personaEngine: string;
  personaPoetry: string;
  personaLingo: string;
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

function readFirstJson(files: string[]) {
  for (const file of files) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {}
  }
  return {};
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
    standardsRoot: STANDARDS_ROOT,
    personaPromptPath: PERSONA_PROMPT,
    personaEnginePath: PERSONA_ENGINE,
    personaPoetryPath: PERSONA_POETRY,
    personaLingoPath: PERSONA_LINGO,
    personaManifest: readFirstJson(PERSONA_MANIFEST),
    superiorPrompt: excerpt(readText(PERSONA_PROMPT), 8000),
    personaEngine: excerpt(readText(PERSONA_ENGINE), 12000),
    personaPoetry: excerpt(readText(PERSONA_POETRY), 7000),
    personaLingo: excerpt(readText(PERSONA_LINGO), 5000),
    collaborationContractExcerpt: excerpt(contractText, 5000),
    transitionExcerpt: excerpt(transitionText, 3000),
    constitutionalRule: extractRule(contractText)
  };
}
