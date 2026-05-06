/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.RUNTIME_SETTINGS
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const SETTINGS_FILE = path.join(ROOT, "agent-lee", "config", "runtime-state.json");

export type ApprovalMode = "safe" | "balanced" | "full";

export type RuntimeState = {
  approval: ApprovalMode;
  web: boolean;
  voice: boolean;
  builderModel: string;
  designerModel: string;
  verifierModel: string;
  browserVisualMode: boolean;
  browserShowCursor: boolean;
  browserSlowMoMs: number;
};

export const DEFAULT_RUNTIME_STATE: RuntimeState = {
  approval: "safe",
  web: false,
  voice: true,
  builderModel: "qwen2.5-coder:14b",
  designerModel: "qwen2.5-coder:7b",
  verifierModel: "deepseek-coder-v2:16b",
  browserVisualMode: true,
  browserShowCursor: true,
  browserSlowMoMs: 250
};

function ensureDir() {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
}

function pickFirstInstalled(installedModels: string[], candidates: string[], regex?: RegExp) {
  for (const candidate of candidates) {
    if (installedModels.includes(candidate)) return candidate;
  }

  if (regex) {
    const matched = installedModels.find((item) => regex.test(item));
    if (matched) return matched;
  }

  return candidates[0] || installedModels[0] || "";
}

export function resolveRuntimeState(current: Partial<RuntimeState> | null | undefined, installedModels: string[]) {
  const state: RuntimeState = {
    ...DEFAULT_RUNTIME_STATE,
    ...(current || {})
  };

  return {
    ...state,
    builderModel: pickFirstInstalled(
      installedModels,
      [state.builderModel, "qwen2.5-coder:14b", "qwen2.5-coder:7b"],
      /coder|qwen|deepseek|code/i
    ),
    designerModel: pickFirstInstalled(
      installedModels,
      [state.designerModel, "qwen2.5-coder:7b", "llama3.1:8b"],
      /qwen|llama|deepseek|coder/i
    ),
    verifierModel: pickFirstInstalled(
      installedModels,
      [state.verifierModel, "deepseek-coder-v2:16b", "qwen2.5-coder:3b"],
      /deepseek|coder|qwen|code/i
    )
  };
}

export function loadRuntimeSettings(installedModels: string[] = []) {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      const resolved = resolveRuntimeState(DEFAULT_RUNTIME_STATE, installedModels);
      saveRuntimeSettings(resolved);
      return resolved;
    }

    const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")) as Partial<RuntimeState>;
    return resolveRuntimeState(parsed, installedModels);
  } catch {
    const fallback = resolveRuntimeState(DEFAULT_RUNTIME_STATE, installedModels);
    saveRuntimeSettings(fallback);
    return fallback;
  }
}

export function saveRuntimeSettings(state: RuntimeState) {
  ensureDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(state, null, 2), "utf8");
}

