import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const SETTINGS_FILE = path.join(ROOT, "agent-lee", "config", "runtime-state.json");

export type ApprovalMode = "safe" | "balanced" | "full";
export type WorkMode = "execute" | "plan" | "ask";
export type VoiceStyle = "neutral" | "grounded" | "highFlow" | "storyMode";
export type AgentEnvironment = "windows-native";
export type AppLanguage = "auto";
export type InferenceSpeed = "standard" | "fast";
export type FollowupBehavior = "queue" | "steer";
export type CodeReviewBehavior = "inline" | "detached";

export type RuntimeState = {
  onboardingComplete: boolean;
  agentEnvironment: AgentEnvironment;
  appLanguage: AppLanguage;
  requireCtrlEnter: boolean;
  inferenceSpeed: InferenceSpeed;
  followupBehavior: FollowupBehavior;
  codeReviewBehavior: CodeReviewBehavior;
  enabledPlugins: string[];
  enabledMcpServers: string[];
  customMcpServers: string[];
  mcpServerConfigs: Record<string, string>;
  enabledAgents: string[];
  customAgents: string[];
  agentConfigs: Record<string, string>;
  approval: ApprovalMode;
  autoRunStagedPlans: boolean;
  workMode: WorkMode;
  web: boolean;
  voice: boolean;
  voiceStyle: VoiceStyle;
  primaryModel: string;
  builderModel: string;
  designerModel: string;
  verifierModel: string;
  browserVisualMode: boolean;
  browserShowCursor: boolean;
  browserSlowMoMs: number;
};

export const DEFAULT_RUNTIME_STATE: RuntimeState = {
  onboardingComplete: false,
  agentEnvironment: "windows-native",
  appLanguage: "auto",
  requireCtrlEnter: false,
  inferenceSpeed: "standard",
  followupBehavior: "steer",
  codeReviewBehavior: "inline",
  enabledPlugins: [],
  enabledMcpServers: [
    "leeway-agent-registry",
    "leeway-desktop-commander",
    "leeway-docs-rag",
    "leeway-health",
    "leeway-insforge",
    "leeway-memory",
    "leeway-planner",
    "leeway-playwright",
    "leeway-scheduling",
    "leeway-testsprite",
    "leeway-validation"
  ],
  customMcpServers: [],
  mcpServerConfigs: {},
  enabledAgents: [
    "agent-lee-prime",
    "leeway-agent-registry",
    "frontend-mcp",
    "backend-mcp",
    "design-system-mcp",
    "creative-mcp",
    "memory-mcp",
    "scheduler-mcp",
    "fs-nav-agent",
    "host-exec-agent",
    "ui-builder-mcp",
    "media-forge-agent",
    "leeway-build-auditor-mcp"
  ],
  customAgents: [],
  agentConfigs: {},
  approval: "balanced",
  autoRunStagedPlans: true,
  workMode: "execute",
  web: false,
  voice: true,
  voiceStyle: "grounded",
  primaryModel: "qwen2.5-coder:14b",
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
    primaryModel: pickFirstInstalled(
      installedModels,
      [state.primaryModel, state.builderModel, "qwen2.5-coder:14b", "llama3.1:8b"],
      /coder|qwen|deepseek|llama|code/i
    ),
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
