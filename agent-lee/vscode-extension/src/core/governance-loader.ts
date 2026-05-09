/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.RUNTIME.GOVERNANCE_LOADER.MAIN

5WH:
WHAT = Loads Agent Lee sovereign governance and persona system context.
WHY = Bridges LeeWay standards, persona canon, and runtime prompt sources into one governed context object.
WHO = Agent Lee / LeeWay Runtime.
WHERE = agent-lee/vscode-extension/src/core/governance-loader.ts
WHEN = 2026
HOW = Resolves canonical roots, reads persona assets, and exposes trimmed excerpts for runtime orchestration.
*/

import * as fs from "fs";
import * as path from "path";
import type * as vscode from "vscode";
import {
  getInternalStandardsRoot,
  getPersonaModuleRoot,
  getPersonaSystemRoot,
  loadAllowedTransitions,
  loadCollaborationContract,
  loadStandardsCanon,
  validateStandaloneConnectivity
} from "./leeway-connectivity-loader";

export type SovereignContext = {
  standardsRoot: string;
  personaRoot: string;
  personaModuleRoot: string;
  personaPromptPath: string;
  personaEnginePath: string;
  personaPoetryPath: string;
  personaLingoPath: string;
  personaHeritagePath: string;
  personaHeritageJsonPath: string;
  personaManifest: Record<string, unknown>;
  superiorPrompt: string;
  personaEngine: string;
  personaPoetry: string;
  personaLingo: string;
  heritageCanon: string;
  heritageData: Record<string, unknown>;
  collaborationContractExcerpt: string;
  transitionExcerpt: string;
  constitutionalRule: string;
  standaloneConnectivity: ReturnType<typeof validateStandaloneConnectivity>;
  standardsCanon: Record<string, unknown>;
};

function resolvePersonaRoot(context?: vscode.ExtensionContext) {
  const moduleRoot = getPersonaModuleRoot(context);
  return fs.existsSync(path.join(moduleRoot, "assets")) ? moduleRoot : getPersonaSystemRoot(context);
}

function resolvePersonaFiles(personaRoot: string) {
  const hasAssets = fs.existsSync(path.join(personaRoot, "assets"));
  return {
    manifest: [
      path.join(personaRoot, "assets", "05_MANIFEST", "agentlee_persona_manifest.json"),
      path.join(personaRoot, "05_MANIFEST", "agentlee_persona_manifest.json"),
      path.join(personaRoot, "agentlee_persona_manifest.json")
    ],
    prompt: hasAssets
      ? path.join(personaRoot, "assets", "01_SUPERIOR_PROMPT", "Agent_Lee_Superior_Prompt.md")
      : path.join(personaRoot, "01_SUPERIOR_PROMPT", "Agent_Lee_Superior_Prompt.md"),
    engine: hasAssets
      ? path.join(personaRoot, "assets", "02_ENGINE", "agentlee_persona_engine_v1_1.js")
      : path.join(personaRoot, "02_ENGINE", "agentlee_persona_engine_v1_1.js"),
    poetry: hasAssets
      ? path.join(personaRoot, "assets", "03_POETRY", "agentlee_poetry_bank.js")
      : path.join(personaRoot, "03_POETRY", "agentlee_poetry_bank.js"),
    lingo: hasAssets
      ? path.join(personaRoot, "assets", "04_LINGO", "agentlee_lingo_worker.js")
      : path.join(personaRoot, "04_LINGO", "agentlee_lingo_worker.js"),
    heritage: hasAssets
      ? path.join(personaRoot, "assets", "06_HERITAGE", "agentlee_heritage_canon.md")
      : path.join(personaRoot, "06_HERITAGE", "agentlee_heritage_canon.md"),
    heritageJson: hasAssets
      ? path.join(personaRoot, "assets", "06_HERITAGE", "agentlee_heritage_canon.json")
      : path.join(personaRoot, "06_HERITAGE", "agentlee_heritage_canon.json")
  };
}

function readText(file: string) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function readFirstJson(files: string[]) {
  for (const file of files) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
    } catch {}
  }
  return {};
}

function readJson(file: string) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
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

export function loadSovereignContext(context?: vscode.ExtensionContext): SovereignContext {
  const personaRoot = resolvePersonaRoot(context);
  const standardsRoot = getInternalStandardsRoot(context);
  const personaFiles = resolvePersonaFiles(personaRoot);
  const contractText = loadCollaborationContract(context);
  const transitionText = loadAllowedTransitions(context);
  const standaloneConnectivity = validateStandaloneConnectivity(context);

  return {
    standardsRoot,
    personaRoot,
    personaModuleRoot: getPersonaModuleRoot(context),
    personaPromptPath: personaFiles.prompt,
    personaEnginePath: personaFiles.engine,
    personaPoetryPath: personaFiles.poetry,
    personaLingoPath: personaFiles.lingo,
    personaHeritagePath: personaFiles.heritage,
    personaHeritageJsonPath: personaFiles.heritageJson,
    personaManifest: readFirstJson(personaFiles.manifest),
    superiorPrompt: excerpt(readText(personaFiles.prompt), 8000),
    personaEngine: excerpt(readText(personaFiles.engine), 12000),
    personaPoetry: excerpt(readText(personaFiles.poetry), 7000),
    personaLingo: excerpt(readText(personaFiles.lingo), 5000),
    heritageCanon: excerpt(readText(personaFiles.heritage), 12000),
    heritageData: readJson(personaFiles.heritageJson),
    collaborationContractExcerpt: excerpt(contractText, 5000),
    transitionExcerpt: excerpt(transitionText, 3000),
    constitutionalRule: extractRule(contractText),
    standaloneConnectivity,
    standardsCanon: loadStandardsCanon(context)
  };
}

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/
