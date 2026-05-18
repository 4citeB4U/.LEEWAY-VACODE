/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.RUNTIME.SETTINGS.MAIN
PURPOSE: LeeWay / Agent Lee persisted runtime configuration. Includes LeeWayVoiceRuntimeKind for local-only voice runtime selection.
DISCOVERY_PIPELINE:
  Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
import * as path from "path";
import { describeFileError, writeTextWithRetries } from "./file-ops";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const SETTINGS_FILE = path.join(ROOT, "agent-lee", "config", "runtime-state.json");
export const LEEWAY_RUNTIME_SETTINGS_NODE_ID = "LEEWAY_APP::CONFIG::RUNTIME_SETTINGS::HYDRATION";
export const LEEWAY_RUNTIME_SETTINGS_FILE_ID = "LEEWAY_FILE::CORE::RUNTIME_SETTINGS_TS";
export const LEEWAY_RUNTIME_SETTINGS_LEGACY_QUARANTINE_ID = "LEEWAY_APP::GOVERNANCE::IDENTITY_PULSE::UNKNOWN_OBJECT_QUARANTINE";

export type ApprovalMode = "safe" | "balanced" | "full";
export type WorkMode = "execute" | "plan" | "ask";
export type VoiceStyle = "neutral" | "grounded" | "highFlow" | "storyMode";
export type LeeWayVoiceRuntimeKind = "leeway-agent-voice-local" | "leeway-agent-voice-browser-fallback";
/** @deprecated Use LeeWayVoiceRuntimeKind */
export type VoiceProviderKind = LeeWayVoiceRuntimeKind;
export type AgentEnvironment = "windows-native";
export type AppLanguage = "auto";
export type InferenceSpeed = "standard" | "fast";
export type FollowupBehavior = "queue" | "steer";
export type CodeReviewBehavior = "inline" | "detached";

export type RuntimeState = {
  onboardingComplete: boolean;
  agentEnvironment: AgentEnvironment;
  appLanguage: AppLanguage;
  autoUpdateEnabled: boolean;
  preferRightSideSurface: boolean;
  lastAppliedVsixSignature: string;
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
  enabledWorkers: string[];
  customWorkers: string[];
  workerConfigs: Record<string, string>;
  approval: ApprovalMode;
  autoRunStagedPlans: boolean;
  workMode: WorkMode;
  web: boolean;
  voice: boolean;
  voiceEnabled: boolean;
  voiceMuted: boolean;
  voiceAutoSpeak: boolean;
  voiceAutoSendFinalTranscript: boolean;
  voiceStyle: VoiceStyle;
  leewayVoiceRuntimeKind: LeeWayVoiceRuntimeKind;
  liveMicAlwaysOn: boolean;
  voiceInterruptOnUserSpeech: boolean;
  voiceRate: number;
  voiceVolume: number;
  voicePitch: number;
  voiceTone: number;
  voiceLastError: string;
  voiceCurrentStatus: string;
  primaryModel: string;
  builderModel: string;
  designerModel: string;
  verifierModel: string;
  browserVisualMode: boolean;
  browserShowCursor: boolean;
  browserSlowMoMs: number;
};

function sanitizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function sanitizeRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, string>;
  }

  const sanitized: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) continue;
    sanitized[normalizedKey] = typeof raw === "string" ? raw : JSON.stringify(raw ?? "");
  }
  return sanitized;
}

export const DEFAULT_RUNTIME_STATE: RuntimeState = {
  onboardingComplete: false,
  agentEnvironment: "windows-native",
  appLanguage: "auto",
  autoUpdateEnabled: false,
  preferRightSideSurface: true,
  lastAppliedVsixSignature: "",
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
    "leeway-validation",
    "frontend-mcp",
    "backend-mcp",
    "design-system-mcp",
    "creative-mcp",
    "memory-mcp",
    "scheduler-mcp",
    "ui-builder-mcp",
    "leeway-build-auditor-mcp",
    "leeway-ci-blueprint-mcp",
    "leeway-edge-optimizer-mcp",
    "leeway-full-repo-checker-mcp",
    "leeway-responsive-ui-mcp",
    "qa-mcp",
    "react-native-mcp"
  ],
  customMcpServers: [],
  mcpServerConfigs: {},
  enabledAgents: [
    "agent-lee-prime",
    "fs-nav-agent",
    "host-exec-agent",
    "media-forge-agent",
    "mutation-agent",
    "perception-agent",
    "shield-governor-agent",
    "attestation-marshal-agent",
    "memory-warden-agent",
    "threat-sentinel-agent"
  ],
  customAgents: [],
  agentConfigs: {},
  enabledWorkers: [
    "leeway-visual-orchestrator-agent",
    "leeway-vector-reconstruction-worker",
    "leeway-voxel-reconstruction-worker",
    "leeway-scene-reconstruction-worker",
    "leeway-depth-synthesis-worker",
    "leeway-structural-fidelity-worker",
    "leeway-asset-repair-worker",
    "leeway-manifest-export-worker",
    "leeway-project-integration-worker",
    "leeway-visual-memory-worker"
  ],
  customWorkers: [],
  workerConfigs: {},
  approval: "balanced",
  autoRunStagedPlans: false,
  workMode: "execute",
  web: false,
  voice: true,
  voiceEnabled: true,
  voiceMuted: false,
  voiceAutoSpeak: true,
  voiceAutoSendFinalTranscript: false,
  voiceStyle: "grounded",
  leewayVoiceRuntimeKind: "leeway-agent-voice-local",
  liveMicAlwaysOn: true,
  voiceInterruptOnUserSpeech: true,
  voiceRate: 0.9,
  voiceVolume: 1.0,
  voicePitch: 1.0,
  voiceTone: 1.0,
  voiceLastError: "",
  voiceCurrentStatus: "LeeWay live voice route is standing by.",
  primaryModel: "qwen2.5-coder:14b",
  builderModel: "qwen2.5-coder:14b",
  designerModel: "qwen2.5-coder:7b",
  verifierModel: "deepseek-coder-v2:16b",
  browserVisualMode: true,
  browserShowCursor: true,
  browserSlowMoMs: 250
};

function normalizeLeeWayVoiceRuntimeKind(value: unknown): LeeWayVoiceRuntimeKind {
  if (value === "leeway-agent-voice-browser-fallback") return "leeway-agent-voice-browser-fallback";
  // Legacy values from prior naming passes map to local runtime.
  if (value === "browser-speech-recognition") return "leeway-agent-voice-browser-fallback";
  if (
    value === "leeway-agent-voice-local" ||
    value === "local-realtime" ||
    value === "local-whisper"
  ) return "leeway-agent-voice-local";
  // Cloud values and anything unknown default to local-only.
  return "leeway-agent-voice-local";
}

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
  const autoRunStagedPlans = state.workMode === "execute" && state.approval === "full"
    ? state.autoRunStagedPlans
    : false;
  const defaultMcpIds = new Set(DEFAULT_RUNTIME_STATE.enabledMcpServers);
  const isMcpAgentId = (id: string) => defaultMcpIds.has(id) || id.endsWith("-mcp");
  const persistedMcpServers = Array.isArray(current?.enabledMcpServers)
    ? state.enabledMcpServers
    : DEFAULT_RUNTIME_STATE.enabledMcpServers;
  const persistedAgents = Array.isArray(current?.enabledAgents)
    ? state.enabledAgents
    : DEFAULT_RUNTIME_STATE.enabledAgents;
  const persistedWorkers = Array.isArray((current as Partial<RuntimeState>)?.enabledWorkers)
    ? state.enabledWorkers
    : DEFAULT_RUNTIME_STATE.enabledWorkers;
  const enabledMcpServers = Array.from(
    new Set([
      ...persistedMcpServers,
      ...persistedAgents.filter(isMcpAgentId)
    ])
  );
  const enabledAgents = Array.from(
    new Set([
      ...persistedAgents.filter((id) => !isMcpAgentId(id))
    ])
  );
  const enabledWorkers = Array.from(new Set(persistedWorkers));

  const resolved: RuntimeState = {
    onboardingComplete: Boolean(state.onboardingComplete),
    agentEnvironment: "windows-native" as AgentEnvironment,
    appLanguage: "auto" as AppLanguage,
    autoUpdateEnabled: Boolean(state.autoUpdateEnabled),
    preferRightSideSurface: typeof (current as any)?.preferRightSideSurface === "boolean"
      ? Boolean((current as any)?.preferRightSideSurface)
      : Boolean(state.preferRightSideSurface),
    lastAppliedVsixSignature: String(state.lastAppliedVsixSignature || ""),
    requireCtrlEnter: Boolean(state.requireCtrlEnter),
    inferenceSpeed: state.inferenceSpeed === "fast" ? "fast" : "standard",
    followupBehavior: state.followupBehavior === "queue" ? "queue" : "steer",
    codeReviewBehavior: state.codeReviewBehavior === "detached" ? "detached" : "inline",
    enabledPlugins: sanitizeStringArray(state.enabledPlugins),
    customMcpServers: sanitizeStringArray(state.customMcpServers),
    mcpServerConfigs: sanitizeRecord(state.mcpServerConfigs),
    customAgents: sanitizeStringArray(state.customAgents),
    agentConfigs: sanitizeRecord(state.agentConfigs),
    customWorkers: sanitizeStringArray(state.customWorkers),
    workerConfigs: sanitizeRecord(state.workerConfigs),
    approval: state.approval === "safe" || state.approval === "full" ? state.approval : "balanced",
    voiceEnabled: typeof (current as any)?.voiceEnabled === "boolean"
      ? Boolean((current as any)?.voiceEnabled)
      : Boolean((current as any)?.voice ?? state.voiceEnabled),
    voiceMuted: typeof (current as any)?.voiceMuted === "boolean"
      ? Boolean((current as any)?.voiceMuted)
      : Boolean(state.voiceMuted),
    voiceAutoSpeak: typeof (current as any)?.voiceAutoSpeak === "boolean"
      ? Boolean((current as any)?.voiceAutoSpeak)
      : Boolean((current as any)?.voice ?? state.voiceAutoSpeak),
    voiceAutoSendFinalTranscript: typeof (current as any)?.voiceAutoSendFinalTranscript === "boolean"
      ? Boolean((current as any)?.voiceAutoSendFinalTranscript)
      : Boolean(state.voiceAutoSendFinalTranscript),
    leewayVoiceRuntimeKind: normalizeLeeWayVoiceRuntimeKind((current as any)?.leewayVoiceRuntimeKind ?? (current as any)?.voiceProviderKind ?? state.leewayVoiceRuntimeKind),
    voiceInterruptOnUserSpeech: typeof (current as any)?.voiceInterruptOnUserSpeech === "boolean"
      ? Boolean((current as any)?.voiceInterruptOnUserSpeech)
      : Boolean(state.voiceInterruptOnUserSpeech),
    voiceVolume: Number.isFinite(Number((current as any)?.voiceVolume))
      ? Number((current as any)?.voiceVolume)
      : Number(state.voiceVolume),
    voiceLastError: String((current as any)?.voiceLastError || state.voiceLastError || ""),
    voiceCurrentStatus: String((current as any)?.voiceCurrentStatus || state.voiceCurrentStatus || ""),
    autoRunStagedPlans,
    workMode: state.workMode === "plan" || state.workMode === "ask" ? state.workMode : "execute",
    web: Boolean(state.web),
    enabledMcpServers,
    enabledAgents,
    enabledWorkers,
    voice: (typeof (current as any)?.voiceEnabled === "boolean"
      ? Boolean((current as any)?.voiceEnabled)
      : Boolean((current as any)?.voice ?? state.voiceEnabled)) &&
      !(typeof (current as any)?.voiceMuted === "boolean"
        ? Boolean((current as any)?.voiceMuted)
        : Boolean(state.voiceMuted)),
    voiceStyle: state.voiceStyle === "neutral" || state.voiceStyle === "highFlow" || state.voiceStyle === "storyMode"
      ? state.voiceStyle
      : "grounded",
    liveMicAlwaysOn: Boolean(state.liveMicAlwaysOn),
    voiceRate: Number.isFinite(Number(state.voiceRate)) ? Number(state.voiceRate) : DEFAULT_RUNTIME_STATE.voiceRate,
    voicePitch: Number.isFinite(Number(state.voicePitch)) ? Number(state.voicePitch) : DEFAULT_RUNTIME_STATE.voicePitch,
    voiceTone: Number.isFinite(Number(state.voiceTone)) ? Number(state.voiceTone) : DEFAULT_RUNTIME_STATE.voiceTone,
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
    ),
    browserVisualMode: Boolean(state.browserVisualMode),
    browserShowCursor: Boolean(state.browserShowCursor),
    browserSlowMoMs: Number.isFinite(Number(state.browserSlowMoMs))
      ? Number(state.browserSlowMoMs)
      : DEFAULT_RUNTIME_STATE.browserSlowMoMs
  };

  return resolved;
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
  try {
    writeTextWithRetries(SETTINGS_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.warn(`[Agent Lee] Runtime settings persistence failed: ${describeFileError(error)}`);
  }
}
