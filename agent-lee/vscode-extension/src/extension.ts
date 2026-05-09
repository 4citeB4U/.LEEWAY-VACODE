/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.RUNTIME.EXTENSION.MAIN
PURPOSE: VS Code extension activation and sovereign Agent Lee runtime orchestration.

5WH:
WHAT = VS Code extension entrypoint for Agent Lee.
WHY = Registers commands, views, model routing, compliance tools, and control panel.
WHO = Agent Lee / LeeWay Runtime.
WHERE = agent-lee/vscode-extension/src/extension.ts
WHEN = 2026
HOW = VS Code Extension API + LeeWay runtime services + local model router.

AGENTS:
PRIME
AUDIT
DOCTOR
ALIGN

LICENSE:
MIT
*/

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { runSupervisor, SupervisorResult } from "./core/orchestrator";
import { enforceLaw, enforceStageLaw } from "./core/law-engine";
import { requestExecution, releaseExecution } from "./core/scheduler";
import { trackError, resetDrift } from "./core/drift-watch";
import { buildContext, extractPathFromPrompt, extractUrlFromPrompt } from "./core/file-intelligence";
import {
  assertAgentLeeRuntimeReady,
  buildModelPromptThroughAgentLee,
  formatThroughAgentLee,
  getAgentLeeRuntimeState,
  initializeAgentLeeRuntime,
  recordAgentLeeRuntimeReceipt,
  refreshDoctorStatus,
  setDoctorStatus
} from "./core/agent-lee-runtime-bootstrap";
import { detectEditors, installPyCharmTooling, openTargetInEditor } from "./core/editor-bridge";
import { fetchRemoteContext } from "./core/remote-context";
import { buildCapabilityAnswer, buildCapabilityCatalog, formatCapabilitySummary, isCapabilityQuestion, searchCapabilityCatalog } from "./core/capability-registry";
import {
  appendConversationMessage,
  getOrCreateActiveConversation,
  listConversations,
  loadConversation,
  setActiveConversation,
  startNewConversation
} from "./core/conversation-store";
import { buildDeveloperProfileSummary, loadDeveloperProfile, rememberDeveloperSignal } from "./core/developer-profile";
import { getMemoryStatus, storeAgentMemory } from "./core/memory";
import { buildModelHiveStatus } from "./core/model-hive";
import { getVoiceStatus, speakWithVoice, stopVoicePlayback } from "./core/voice-adapter";
import { loadRuntimeSettings, RuntimeState, saveRuntimeSettings, ApprovalMode, resolveRuntimeState, DEFAULT_RUNTIME_STATE } from "./core/runtime-settings";
import { appendFileWithRetries, describeFileError, writeJsonWithRetries, writeTextWithRetries } from "./core/file-ops";
import { assessWorkerIdentity } from "./core/zero-trust";
import { DEFAULT_AGENT_CATALOG, DEFAULT_MCP_SERVER_CATALOG, DEFAULT_PLUGIN_CATALOG } from "./core/settings-catalog";
import { stopBrowserPreviews } from "./core/browser-engine";
import { createTaskPlan, PlanPhase, TaskPlan, WorkMode } from "./core/task-planner";
import { saveTaskPlan } from "./core/plan-store";
import { AGENT_LEE_ENGINEERING_PROMPT } from "./core/agent-lee-engineering-prompt";
import { getLatestStagedPatch, inspectWorkspace, runAgentEngineeringTask, runVerification as runEngineeringVerification, stagePatch, buildExecutionPlan } from "./core/agent-engineering-loop";
import { testPersona } from "./persona/persona-runtime-bridge";
import { AgentLeeEditBufferCodeLensProvider } from "./edit-buffer/editBuffer.codeLens";
import { registerAgentLeeEditBufferCommands } from "./edit-buffer/editBuffer.commands";
import { refreshAgentLeeDecorations } from "./edit-buffer/editBuffer.decorations";
import { editBufferStore } from "./edit-buffer/editBuffer.store";
import { prepareCodexLevelContext } from "./knowledge/prepareCodexLevelContext";
import { AgentLeePluginRouter } from "./plugins/agentLeePluginRouter";
import { mapUserTextToPluginCall } from "./plugins/pluginIntentMapper";
import { getPluginById } from "./plugins/plugin.registry";
import type { PluginCallInput, PluginCallResult } from "./plugins/plugin.types";
import { analyzeImage } from "./tools/image-tool";
import { sendExecutionPlanToEditBuffer } from "./execution-brain/executionToEditBuffer.adapter";
import { sendVerificationRepairsToEditBuffer } from "./execution-brain/verificationRepairToEditBuffer.adapter";
import { registerAgentLeeLiveVoiceCommands } from "./live-voice/liveVoice.commands";
import { registerAgentLeeCodingSessionCommands } from "./session-orchestrator/codingSession.commands";
import { registerAgentLeePerformanceCommands } from "./performance/performance.commands";
import { registerAgentLeeCoreRuntimeServices } from "./performance/runtimeServices";
import { registerAgentLeeBackgroundIndexerCommands } from "./indexing/backgroundIndexer.commands";
import { scanLeeWayCompliance, LEEWAY_SCANNER_VERSION, makeHeader, AuditResult } from "./tools/leeway-scanner";
import { classifyTask, selectModel } from "./tools/router";
import { logEvent } from "./tools/logger";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const LOG_DIR = path.join(ROOT, "logs", "agent-lee");
const PENDING_EDIT_DIR = path.join(ROOT, "agent-lee", "pending-edits");
const COMPLIANCE_REPORT_DIR = path.join(ROOT, "agent-lee", "reports", "compliance");
const AGENT_LEE_VIEW_CONTAINER_ID = "agentLee";
const AGENT_LEE_SIDEBAR_VIEW_ID = "agentLee.sidebar";
const AGENT_LEE_OPEN_PANEL_COMMAND = "agentLee.openPanel";
const AGENT_LEE_UI_VERSION = "chat-ui-restored-2026-05-07";

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(PENDING_EDIT_DIR, { recursive: true });
fs.mkdirSync(COMPLIANCE_REPORT_DIR, { recursive: true });

let runtimeState: RuntimeState = loadRuntimeSettings();
const approvedExternalRoots = new Set<string>();
let capabilityCatalog = buildCapabilityCatalog();
type PendingAttachment = {
  path: string;
  name: string;
  kind: "image" | "audio" | "file";
};
type TodoStatus = "pending" | "in_progress" | "completed" | "blocked";
type TaskTodo = {
  id: string;
  title: string;
  detail: string;
  phase: PlanPhase;
  status: TodoStatus;
};
type TaskActivity = {
  id: string;
  kind: "read" | "write" | "status";
  label: string;
  file?: string;
  path?: string;
  detail?: string;
  timestamp: string;
};
type ProposedEditStatus = "pending" | "approved" | "rejected";
type ProposedEdit = {
  id: string;
  filePath: string;
  displayPath: string;
  summary: string;
  status: ProposedEditStatus;
  tempPath: string;
  diffTitle: string;
  createdAt: string;
};
type ActiveTaskState = {
  mode: WorkMode;
  prompt: string;
  summary: string;
  status: string;
  awaitingApproval: boolean;
  canExecute: boolean;
  savedPlanPath: string;
  plan: TaskPlan | null;
  todos: TaskTodo[];
  activities: TaskActivity[];
  proposedEdits: ProposedEdit[];
  planResponse: string;
  draftPrompt: string;
  targetRoot: string;
  targetLabel: string;
  explicitUrl: string;
  remoteContext: string;
  prebuiltContext: { total: number; samples: { file: string; preview: string }[] } | null;
  activePhase: PlanPhase | "approval" | "answer" | null;
};
type PendingPluginApproval = {
  call: PluginCallInput;
  pluginName: string;
  riskLevel: string;
};
const activeWebviews = new Set<vscode.Webview>();
let agentLeeOutputChannel: vscode.OutputChannel | null = null;
let currentTaskState: ActiveTaskState = emptyTaskState();
let parkedTaskState: ActiveTaskState | null = null;
let currentAbortController: AbortController | null = null;
let isExecutionRunning = false;
let narratedReadCount = 0;
let queuedFollowUps: { text: string; attachments: PendingAttachment[] }[] = [];
let pendingPluginApproval: PendingPluginApproval | null = null;
let runtimeStatusBarItem: vscode.StatusBarItem | null = null;
const pluginRouter = new AgentLeePluginRouter();
const PROTECTED_AGENT_IDS = new Set(
  DEFAULT_AGENT_CATALOG
    .filter((entry) => entry.identity.developerSurface === "observed-only")
    .map((entry) => entry.id)
);
const PROTECTED_MCP_IDS = new Set(
  DEFAULT_MCP_SERVER_CATALOG
    .filter((entry) => entry.identity.developerSurface === "observed-only")
    .map((entry) => entry.id)
);

function preserveProtectedIds(requested: unknown, current: string[], defaults: string[], protectedIds: Set<string>) {
  const incoming = Array.isArray(requested) ? requested.map((item) => String(item || "").trim()).filter(Boolean) : [];
  const preserved = new Set<string>([
    ...defaults.filter((id) => protectedIds.has(id)),
    ...current.filter((id) => protectedIds.has(id))
  ]);
  return Array.from(new Set([
    ...incoming.filter((id) => !protectedIds.has(id)),
    ...preserved
  ]));
}

function preserveProtectedConfigs(
  requested: unknown,
  current: Record<string, string>,
  protectedIds: Set<string>
) {
  const incoming = requested && typeof requested === "object"
    ? { ...(requested as Record<string, string>) }
    : {};

  for (const protectedId of protectedIds) {
    if (Object.prototype.hasOwnProperty.call(incoming, protectedId)) {
      if (Object.prototype.hasOwnProperty.call(current, protectedId)) {
        incoming[protectedId] = current[protectedId] || "";
      } else {
        delete incoming[protectedId];
      }
    }
  }

  return incoming;
}

function protectedMutationStatus(key: string) {
  if (key === "enabledAgents" || key === "agentConfigs") {
    return "Protected LeeWay agents stay visible and auditable, but their control surfaces are locked.";
  }

  if (key === "enabledMcpServers" || key === "mcpServerConfigs") {
    return "Protected LeeWay governance MCP agents stay visible and auditable, but their control surfaces are locked.";
  }

  return "Protected LeeWay security controls rejected a direct mutation attempt.";
}

function agentLeeText(
  text: string,
  options?: { voiceMode?: string; preserveRaw?: boolean; routeLabel?: string }
) {
  return formatThroughAgentLee(text, options);
}

function showAgentLeeInfo(message: string, options?: Parameters<typeof agentLeeText>[1]) {
  void vscode.window.showInformationMessage(agentLeeText(message, options));
}

function showAgentLeeWarning(message: string, options?: Parameters<typeof agentLeeText>[1]) {
  void vscode.window.showWarningMessage(agentLeeText(message, options));
}

function showAgentLeeError(message: string, options?: Parameters<typeof agentLeeText>[1]) {
  void vscode.window.showErrorMessage(agentLeeText(message, options));
}

function promptAgentLeeWarning(
  message: string,
  options?: Parameters<typeof agentLeeText>[1],
  ...items: string[]
) {
  return vscode.window.showWarningMessage(agentLeeText(message, options), ...items);
}

function promptAgentLeeInputBox(
  options: vscode.InputBoxOptions,
  routeLabel: string
) {
  return vscode.window.showInputBox({
    ...options,
    prompt: options.prompt ? agentLeeText(options.prompt, { routeLabel }) : options.prompt,
    placeHolder: options.placeHolder ? agentLeeText(options.placeHolder, { routeLabel }) : options.placeHolder,
    title: options.title ? agentLeeText(options.title, { routeLabel }) : options.title
  });
}

function appendAgentLeeLine(
  output: vscode.OutputChannel,
  message: string,
  options?: Parameters<typeof agentLeeText>[1]
) {
  output.appendLine(agentLeeText(message, options));
}

function emptyTaskState(): ActiveTaskState {
  return {
    mode: runtimeState.workMode || "execute",
    prompt: "",
    summary: "No active plan yet.",
    status: "Waiting for a new task.",
    awaitingApproval: false,
    canExecute: false,
    savedPlanPath: "",
    plan: null,
    todos: [],
    activities: [],
    proposedEdits: [],
    planResponse: "",
    draftPrompt: "",
    targetRoot: "",
    targetLabel: "",
    explicitUrl: "",
    remoteContext: "",
    prebuiltContext: null,
    activePhase: null
  };
}



function buildLeeWayHeader(filePath: string) {
  const generated = makeHeader(filePath);
  return generated
    .replace("REGION: ?? UTIL", "REGION: 🟢 CORE")
    .replace("TAG: UTIL.LOCAL.", "TAG: CORE.RUNTIME.")
    .replace(
      /DISCOVERY_PIPELINE:\s*\n\s*Voice -> Intent -> Location -> Vertical -> Ranking -> Render/,
      "DISCOVERY_PIPELINE:\nVoice → Intent → Location → Vertical → Ranking → Render"
    );
}



function writeComplianceReport(kind: "scan" | "verify" | "fix", payload: Record<string, unknown>) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(COMPLIANCE_REPORT_DIR, `agent-lee-${kind}-report-${stamp}.json`);
  writeJsonWithRetries(reportPath, {
    generatedAt: new Date().toISOString(),
    kind,
    ...payload
  }, `Agent Lee ${kind} compliance report.`);
  return reportPath;
}

function renderComplianceSummary(
  mode: "scan" | "verify",
  inspected: number,
  fullyCompliant: number,
  averageScore: number,
  blocking: AuditResult[]
) {
  const heading = mode === "scan" ? "LeeWay workspace scan complete." : "LeeWay workspace verification complete.";
  const lines = [
    heading,
    `Scanner version: ${LEEWAY_SCANNER_VERSION}`,
    `Inspected: ${inspected}`,
    `Fully compliant: ${fullyCompliant}`,
    `Average score: ${averageScore}`,
    `Blocking files: ${blocking.length}`
  ];

  if (blocking.length) {
    lines.push("");
    lines.push("Blocking paths:");
    for (const item of blocking.slice(0, 10)) {
      lines.push(`- ${item.file} (${item.score})`);
    }
  }

  return agentLeeText(lines.join("\n"), { voiceMode: "operator" });
}

async function runWorkspaceScan(output: vscode.OutputChannel, mode: "scan" | "verify" | "scanSelf" | "verifySelf") {
  const isSelf = mode === "scanSelf" || mode === "verifySelf";
  const root = isSelf ? path.join(ROOT, "agent-lee") : (workspaceRoot() || ROOT);
  const modeLabel = isSelf ? "standaloneRoot" : "workspace";

  const result = await scanLeeWayCompliance({ root, mode: isSelf ? "self" : "workspace" });
  const reportPath = writeComplianceReport(isSelf ? (mode === "scanSelf" ? "scan" : "verify") : mode, result);
  const message = renderComplianceSummary(
    mode === "verifySelf" ? "verify" : (mode === "scanSelf" ? "scan" : mode),
    result.inspected,
    result.fullyCompliant,
    result.averageScore,
    result.blockingFiles
  );

  appendAgentLeeLine(output, `- Agent Lee routed this through extension.runWorkspaceScan.`, { routeLabel: `extension.${mode}` });
  output.appendLine(`Scanner version: ${LEEWAY_SCANNER_VERSION}`);
  output.appendLine(`Scan mode: ${modeLabel}`);
  output.appendLine(`Scanned root: ${root}`);
  output.appendLine(message);
  output.appendLine(`Report: ${reportPath}`);
  output.show(true);

  logEvent(`workspace-${mode}`, "Agent Lee", message, { root, mode: modeLabel, reportPath, blockingCount: result.blockingFiles.length });

  if (isSelf) {
    setDoctorStatus(result.blockingFiles.length === 0 ? "pass" : "fail");
  }

  if (mode === "verify" || mode === "verifySelf") {
    if (result.blockingFiles.length) {
      showAgentLeeWarning(`Agent Lee verification found ${result.blockingFiles.length} blocking LeeWay file(s). See output for details.`);
    } else {
      showAgentLeeInfo(`Agent Lee verification passed for ${modeLabel} with no blocking LeeWay files.`);
    }
  } else {
    showAgentLeeInfo(`Agent Lee scanned ${result.inspected} file(s) in ${modeLabel}. ${result.blockingFiles.length} blocking file(s) found.`);
  }
}

async function runWorkspaceFix(output: vscode.OutputChannel) {
  const root = workspaceRoot() || ROOT;
  const result = await scanLeeWayCompliance({ root, mode: "workspace" });
  const missingHeaders = result.results.filter((res) => res.score < 100 && !fs.readFileSync(res.file, "utf8").includes("LEEWAY_HEADER"));

  if (!missingHeaders.length) {
    const reportPath = writeComplianceReport("fix", { ...result, stagedFixes: 0, files: [] });
    appendAgentLeeLine(output, "Agent Lee found no safe LeeWay header fixes to stage.", { routeLabel: "extension.workspace-fix" });
    output.appendLine(`Scanner version: ${LEEWAY_SCANNER_VERSION}`);
    output.appendLine(`Report: ${reportPath}`);
    output.show(true);
    showAgentLeeInfo("Agent Lee found no safe LeeWay metadata fixes to stage.");
    return;
  }

  await sendExecutionPlanToEditBuffer({
    title: "LeeWay Metadata Repair Package",
    objective: "Stage safe LeeWay header fixes for files missing required metadata.",
    hunks: missingHeaders.slice(0, 25).map((res) => ({
      filePath: res.file,
      title: "Add LeeWay header metadata",
      reason: "The file is missing a LeeWay header and is currently non-compliant.",
      originalText: "",
      proposedText: `${buildLeeWayHeader(res.file)}\n`,
      startOffset: 0,
      endOffset: 0,
      risk: "low"
    }))
  });

  const reportPath = writeComplianceReport("fix", {
    ...result,
    stagedFixes: Math.min(missingHeaders.length, 25),
    files: missingHeaders.slice(0, 25).map((item) => item.file)
  });
  const message = `Agent Lee staged ${Math.min(missingHeaders.length, 25)} LeeWay metadata fix(es) in the pending edit buffer.`;
  appendAgentLeeLine(output, message, { routeLabel: "extension.workspace-fix" });
  output.appendLine(`Scanner version: ${LEEWAY_SCANNER_VERSION}`);
  output.appendLine(`Report: ${reportPath}`);
  output.show(true);
  logEvent("workspace-fix", "Agent Lee", message, { root, reportPath, stagedFixes: Math.min(missingHeaders.length, 25) });
  showAgentLeeInfo(message);
}

async function runAskLocalModel(output: vscode.OutputChannel) {
  assertAgentLeeRuntimeReady();
  const prompt = await promptAgentLeeInputBox({
    prompt: "Ask Agent Lee's local Ollama model",
    placeHolder: "Describe the task or question you want routed locally"
  }, "extension.ask-local-model");

  if (!prompt) {
    showAgentLeeInfo("Agent Lee local model request cancelled.");
    return;
  }

  await runAskLocalModelPrompt(output, prompt);
}

async function runAskLocalModelPrompt(output: vscode.OutputChannel, prompt: string) {
  const installedModels = await getModels();
  if (!installedModels.length) {
    appendAgentLeeLine(output, "Agent Lee could not reach Ollama or find installed models for the local request.", { routeLabel: "extension.ask-local-model" });
    output.show(true);
    showAgentLeeWarning("Agent Lee could not reach Ollama or find installed models.");
    return "Agent Lee could not reach Ollama or find installed models for the local request.";
  }

  const task = classifyTask(prompt);
  const selectedModel = selectModel(task);
  const fallbackModel = installedModels.includes(selectedModel) ? selectedModel : (installedModels[0] || runtimeState.primaryModel);
  output.appendLine(`Routing local prompt as "${task}" using model "${fallbackModel}".`);

  try {
    const answer = await ollama(prompt, fallbackModel, "Local Ollama command request.");
    appendAgentLeeLine(output, answer, { voiceMode: "operator" });
    output.show(true);
    logEvent("ask-local-model", "Agent Lee", "Local model prompt completed.", { task, model: fallbackModel });
    showAgentLeeInfo(`Agent Lee answered with ${fallbackModel}. See the output channel for the full response.`);
    return answer;
  } catch (error) {
    const detail = describeFileError(error);
    output.appendLine(`Local model request failed: ${detail}`);
    output.show(true);
    showAgentLeeError(`Agent Lee local model request failed: ${detail}`);
    return `Local model request failed: ${detail}`;
  }
}

function broadcast(message: any) {
  for (const webview of activeWebviews) {
    try {
      webview.postMessage(message);
    } catch {}
  }
}

function isUiRuntimeDegraded(state = getAgentLeeRuntimeState()) {
  return Boolean(state.degraded && state.initializedAt);
}

function getRuntimeProofSummary(state = getAgentLeeRuntimeState(), installedModels: string[] = []) {
  const degraded = isUiRuntimeDegraded(state);
  const preflight = !state.initializedAt;
  return {
    title: "Agent Lee Runtime",
    statusLabel: degraded ? "Degraded" : "Ready",
    personaLabel: preflight || state.personaModuleLoaded ? "Loaded" : "Unavailable",
    doctorLabel: state.doctorStatus === "fail" ? "Fail" : "Pass",
    modelsLabel: preflight || installedModels.length || state.modelRoutesAvailable ? "Available" : "Unavailable",
    detailLines: [
      `Runtime ready: ${state.AGENT_LEE_RUNTIME_READY}`,
      `Degraded: ${state.degraded}`,
      `Degraded reason: ${state.degradedReason || "none"}`,
      `Persona module loaded: ${state.personaModuleLoaded}`,
      `Connectivity loaded: ${state.connectivityLoaded}`,
      `MCP registry loaded: ${state.mcpRegistryLoaded} (${state.mcpCount})`,
      `Agent registry loaded: ${state.agentRegistryLoaded} (${state.agentCount})`,
      `Model routes available: ${state.modelRoutesAvailable}`,
      `Write policy active: ${state.writePolicyActive}`,
      `Doctor status: ${state.doctorStatus}`,
      `Resolved root: ${state.resolvedRoot || state.runtimeRoot || "unresolved"}`,
      `Root source: ${state.rootSource}`,
      `Missing connectivity paths: ${state.missingConnectivityPaths.length ? state.missingConnectivityPaths.join(", ") : "none"}`,
      `Receipt path: ${state.receiptPath}`
    ]
  };
}

function buildRuntimeDegradedMessage(state = getAgentLeeRuntimeState()) {
  const missing = state.missingConnectivityPaths.length
    ? state.missingConnectivityPaths.join("\n")
    : "none";

  return [
    "Agent Lee runtime initialized in degraded mode.",
    `resolvedRoot: ${state.resolvedRoot || state.runtimeRoot || "unresolved"}`,
    `rootSource: ${state.rootSource}`,
    "missingConnectivityPaths:",
    missing,
    "Set agentLee.rootPath to the standalone Agent Lee runtime root if the current resolution is wrong."
  ].join("\n");
}

function updateRuntimeStatusBar(_state = getAgentLeeRuntimeState()) {
  if (!runtimeStatusBarItem) return;
  const degraded = isUiRuntimeDegraded(_state);
  runtimeStatusBarItem.text = degraded ? "$(warning) Agent Lee: Degraded" : "$(hubot) Agent Lee: Ready";
  runtimeStatusBarItem.tooltip = degraded
    ? "Agent Lee sovereign runtime is active but degraded. Click to open the right-side panel; run Agent Lee: Runtime Status for proof."
    : "Agent Lee sovereign runtime is active. Click to open the right-side panel; run Agent Lee: Runtime Status for proof.";
  runtimeStatusBarItem.command = AGENT_LEE_OPEN_PANEL_COMMAND;
  runtimeStatusBarItem.show();
}

async function postVisibleRuntimeState(webview: vscode.Webview) {
  const installedModels = await getModels();
  const summary = getRuntimeProofSummary(getAgentLeeRuntimeState(), installedModels);
  webview.postMessage({
    command: "visibleRuntimeState",
    runtime: summary,
    memory: getMemoryStatus()
  });
}

function nextTodoLabel(todos: TaskTodo[]) {
  const next = todos.find((item) => item.status === "in_progress") || todos.find((item) => item.status === "pending");
  return next ? next.title : "No pending to-do items.";
}

function postTaskState() {
  broadcast({
    command: "taskState",
    task: {
      ...currentTaskState,
      nextTodo: nextTodoLabel(currentTaskState.todos),
      parkedTask: parkedTaskState
        ? {
            summary: parkedTaskState.summary,
            prompt: parkedTaskState.prompt,
            nextTodo: nextTodoLabel(parkedTaskState.todos)
          }
        : null,
      running: isExecutionRunning
    }
  });
}

function resetTaskState(message = "Waiting for a new task.") {
  currentTaskState = {
    ...emptyTaskState(),
    mode: runtimeState.workMode || "execute",
    status: message
  };
  narratedReadCount = 0;
  postTaskState();
}

function cloneTaskState(task: ActiveTaskState): ActiveTaskState {
  return JSON.parse(JSON.stringify(task)) as ActiveTaskState;
}

function isReviewRequest(prompt: string) {
  return /\b(review|code review|pr review|audit this|inspect this change|look over this)\b/i.test(prompt);
}

function isRepositoryOpinionRequest(prompt: string) {
  if (!/\b(app|application|project|repo|repository|codebase|workspace|files?)\b/i.test(prompt)) return false;
  return /\b(look through|look at|top to bottom|whole thing|whole app|entire app|entire codebase|every file|honest opinion|what do you think|tell me exactly what you think)\b/i.test(prompt);
}

function shouldUseBroadInspection(prompt: string) {
  return /\b(every file|all files|whole app|entire app|whole codebase|entire codebase|top to bottom)\b/i.test(prompt);
}

function buildSettingsCapabilityOverlay() {
  const pluginNames = DEFAULT_PLUGIN_CATALOG
    .filter((entry) => effectiveEnabledPlugins().includes(entry.id))
    .map((entry) => entry.name);
  const mcpCatalogNames = new Map(DEFAULT_MCP_SERVER_CATALOG.map((entry) => [entry.id, entry.name]));
  const mcpNames = [...DEFAULT_MCP_SERVER_CATALOG.map((entry) => entry.id), ...(runtimeState.customMcpServers || [])]
    .filter((id, index, list) => list.indexOf(id) === index)
    .filter((id) => runtimeState.enabledMcpServers.includes(id))
    .map((id) => mcpCatalogNames.get(id) || id);

  return [
    pluginNames.length ? `Enabled plugin selections: ${pluginNames.join(", ")}` : "Enabled plugin selections: none",
    mcpNames.length ? `Enabled MCP servers: ${mcpNames.join(", ")}` : "Enabled MCP servers: none",
    `Follow-up behavior: ${runtimeState.followupBehavior}`,
    `Code review behavior: ${runtimeState.codeReviewBehavior}`,
    `Inference speed: ${runtimeState.inferenceSpeed}`
  ].join("\n");
}

function effectiveEnabledPlugins() {
  return runtimeState.enabledPlugins.length
    ? runtimeState.enabledPlugins
    : DEFAULT_PLUGIN_CATALOG.map((entry) => entry.id);
}

function buildPluginMeshSnapshot() {
  return pluginRouter.getPluginMesh(effectiveEnabledPlugins());
}

function recordAxAgentLeeDiagnosticEvent(rawEvent: Record<string, unknown>) {
  const identity = assessWorkerIdentity(rawEvent);
  const agentId = identity.agentId;
  const event = String(rawEvent.kind || rawEvent.event || "diagnostic");
  const ledgerPath = storeAgentMemory(agentId, event, {
    ...rawEvent,
    sourceUnit: identity.sourceUnit,
    sourceType: identity.sourceType,
    provenance: identity.provenance,
    requestReceiptId: identity.requestReceiptId,
    verificationState: identity.verificationState,
    trustScore: identity.trustScore,
    securityZone: identity.securityZone,
    capabilityProof: identity.capabilityProof,
    routeTrusted: identity.routeLooksTrusted,
    sourceMatchesAgent: identity.sourceMatchesAgent,
    route: "Agent Lee -> AX Agent Lee -> Agent Lee",
    speakerOrder: "Agent Lee first and last",
    workspaceRoot: workspaceRoot()
  });

  recordAgentLeeRuntimeReceipt({
    event: "ax-agent-lee.diagnostic",
    agentId,
    diagnosticEvent: event,
    ledgerPath,
    sourceUnit: identity.sourceUnit,
    verificationState: identity.verificationState,
    trustScore: identity.trustScore,
    route: "Agent Lee -> AX Agent Lee -> Agent Lee",
    speakerOrder: "Agent Lee first and last"
  });
  logEvent("ax-agent-lee-diagnostic", "Agent Lee", `AX Agent Lee diagnostic event: ${event}`, {
    agentId,
    ledgerPath,
    detail: rawEvent.detail || rawEvent.command || rawEvent.app || ""
  });

  return ledgerPath;
}

function summarizePluginData(data: unknown) {
  if (Array.isArray(data)) {
    const lines = data
      .slice(0, 5)
      .map((item) => {
        if (typeof item === "string") return `- ${item}`;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const label = record.title || record.name || record.full_name || record.id;
          const extra = record.state || record.status || record.path || "";
          return label ? `- ${String(label)}${extra ? ` (${String(extra)})` : ""}` : `- ${JSON.stringify(record).slice(0, 120)}`;
        }
        return `- ${String(item)}`;
      })
      .join("\n");
    return lines ? `Top results:\n${lines}` : "";
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.projects)) return summarizePluginData(record.projects);
    if (Array.isArray(record.deployments)) return summarizePluginData(record.deployments);
    if (Array.isArray(record.workflows)) return summarizePluginData(record.workflows);
    const json = JSON.stringify(record, null, 2);
    return json ? `Data:\n${json.slice(0, 1000)}` : "";
  }

  return data ? `Data:\n${String(data).slice(0, 1000)}` : "";
}

function formatPluginResult(result: PluginCallResult) {
  const sections = [result.summary];
  const dataSummary = summarizePluginData(result.data);
  if (dataSummary) sections.push(dataSummary);
  if (result.error) sections.push(`Error: ${result.error}`);
  if (result.receiptId) sections.push(`Receipt: ${result.receiptId}`);
  return agentLeeText(sections.filter(Boolean).join("\n\n"), {
    routeLabel: result.pluginId || "plugin"
  });
}

function setTaskStatus(status: string, summary?: string) {
  currentTaskState.status = status;
  if (summary) currentTaskState.summary = summary;
  syncLiveTodos();
  postTaskState();
}

function displayTaskFile(filePath: string) {
  const roots = [currentTaskState.targetRoot, workspaceRoot(), ROOT].filter(Boolean);
  for (const root of roots) {
    if (filePath.startsWith(root)) {
      const rel = path.relative(root, filePath);
      return rel && !rel.startsWith("..") ? rel.replace(/\\/g, "/") : filePath;
    }
  }
  return filePath.replace(/\\/g, "/");
}

function describeFileIntent(filePath: string) {
  const base = path.basename(filePath).toLowerCase();
  const ext = path.extname(base).toLowerCase();
  if (base === "package.json" || base.endsWith(".json")) return "Checking configuration, scripts, and declared settings.";
  if (base === "readme.md" || ext === ".md") return "Pulling the documented purpose, setup notes, and workflow guidance.";
  if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") return "Inspecting imports, exported behavior, and the main execution flow.";
  if (ext === ".css" || ext === ".scss" || ext === ".less") return "Inspecting the visual styling and layout rules tied to the task.";
  if (ext === ".ps1" || ext === ".sh" || ext === ".py") return "Checking the automation logic and what the script actually does.";
  if (ext === ".html") return "Inspecting the rendered structure and important UI regions.";
  return "Reviewing the file for the parts that affect this request.";
}

function describeActivity(activity: Omit<TaskActivity, "id" | "timestamp">) {
  if (activity.detail) return activity.detail;
  if (activity.kind === "read" && activity.file) return describeFileIntent(activity.file);
  if (activity.kind === "write" && activity.file) return "Saving an artifact so the run leaves a visible evidence trail.";
  return "";
}

function buildActivityNarration(activity: Pick<TaskActivity, "kind" | "label" | "file" | "detail">) {
  if (activity.kind === "read" && activity.file) {
    return `Reading ${displayTaskFile(activity.file)} now. ${activity.detail || describeFileIntent(activity.file)}`;
  }
  if (activity.kind === "write" && activity.file) {
    return `${activity.label}. Saved ${displayTaskFile(activity.file)}. ${activity.detail || ""}`.trim();
  }
  if (activity.kind === "status" && activity.detail) {
    return `${activity.label}. ${activity.detail}`;
  }
  return activity.label;
}

function uniquePhaseList(plan: TaskPlan | null): PlanPhase[] {
  if (!plan?.steps?.length) return ["inspect", "analyze", "execute", "verify", "document"] as PlanPhase[];
  const seen = new Set<PlanPhase>();
  const phases: PlanPhase[] = [];
  for (const step of plan.steps) {
    if (!seen.has(step.phase)) {
      seen.add(step.phase);
      phases.push(step.phase);
    }
  }
  return phases.length ? phases : ["inspect", "analyze", "execute", "verify", "document"];
}

function livePhaseTitle(phase: PlanPhase | "approval" | "answer") {
  switch (phase) {
    case "inspect": return "Inspect the real files";
    case "analyze": return "Analyze what the files are doing";
    case "execute": return "Run the approved workflow";
    case "verify": return "Verify the result and risks";
    case "document": return "Save the evidence trail";
    case "approval": return "Review and approve the plan";
    case "answer": return "Answer directly in chat";
  }
}

function latestActivityOfKind(kind?: TaskActivity["kind"]) {
  return currentTaskState.activities.find((activity) => !kind || activity.kind === kind) || null;
}

function livePhaseDetail(phase: PlanPhase | "approval" | "answer") {
  if (phase === "inspect") {
    const read = latestActivityOfKind("read");
    if (read?.file) return `Reading ${read.file}. ${read.detail || ""}`.trim();
    return "Reading the target files and collecting the real code context first.";
  }
  if (phase === "analyze") return currentTaskState.status || "Turning the inspected context into a governed plan.";
  if (phase === "execute") return currentTaskState.status || "Running the approved task path against the real target.";
  if (phase === "verify") return currentTaskState.status || "Checking whether the result holds up cleanly.";
  if (phase === "document") return currentTaskState.status || "Saving the plan, reports, and evidence trail.";
  if (phase === "approval") return "The plan is ready. Review it, edit it if needed, then approve execution.";
  return currentTaskState.status || "Answering the request directly without staging execution.";
}

function syncLiveTodos() {
  if (!currentTaskState.prompt) {
    currentTaskState.todos = [];
    return;
  }

  if (currentTaskState.mode === "ask" || currentTaskState.activePhase === "answer") {
    currentTaskState.todos = [{
      id: "answer-directly",
      title: livePhaseTitle("answer"),
      detail: livePhaseDetail("answer"),
      phase: "analyze",
      status: isExecutionRunning ? "in_progress" : "completed"
    }];
    return;
  }

  if (currentTaskState.awaitingApproval) {
    currentTaskState.todos = [
      { id: "read-context", title: livePhaseTitle("inspect"), detail: livePhaseDetail("inspect"), phase: "inspect", status: "completed" },
      { id: "draft-plan", title: livePhaseTitle("analyze"), detail: "The governed plan has been drafted from the inspected context.", phase: "analyze", status: "completed" },
      { id: "approve-plan", title: livePhaseTitle("approval"), detail: livePhaseDetail("approval"), phase: "execute", status: "in_progress" }
    ];
    return;
  }

  const phases = uniquePhaseList(currentTaskState.plan);
  const activePhase = currentTaskState.activePhase;
  let activeIndex = -1;
  if (
    activePhase === "inspect" ||
    activePhase === "analyze" ||
    activePhase === "execute" ||
    activePhase === "verify" ||
    activePhase === "document"
  ) {
    activeIndex = phases.indexOf(activePhase);
  }
  const finished = !isExecutionRunning && currentTaskState.status.toLowerCase().includes("finished");

  // Use actual plan steps when available so the todo list reflects the real task
  const planSteps = currentTaskState.plan?.steps;
  if (planSteps && planSteps.length > 0) {
    currentTaskState.todos = planSteps.map((step, index): TaskTodo => {
      const phaseIndex = phases.indexOf(step.phase);
      let status: TodoStatus = "pending";
      if (finished) {
        status = "completed";
      } else if (activeIndex >= 0) {
        if (phaseIndex < activeIndex) status = "completed";
        else if (phaseIndex === activeIndex) status = index === 0 || planSteps.findIndex((s) => s.phase === step.phase) === index ? "in_progress" : "pending";
      } else if (index === 0) {
        status = "in_progress";
      }
      return {
        id: step.id,
        title: step.title,
        detail: step.detail || livePhaseDetail(step.phase),
        phase: step.phase,
        status
      };
    });
    return;
  }

  currentTaskState.todos = phases.map((phase, index): TaskTodo => {
    let status: TodoStatus = "pending";
    if (finished) status = "completed";
    else if (activeIndex >= 0) {
      if (index < activeIndex) status = "completed";
      else if (index === activeIndex) status = "in_progress";
    } else if (index === 0) {
      status = "in_progress";
    }

    return {
      id: `live-${phase}`,
      title: livePhaseTitle(phase),
      detail: livePhaseDetail(phase),
      phase,
      status
    };
  });
}

function pushTaskActivity(activity: Omit<TaskActivity, "id" | "timestamp">) {
  const normalized = {
    ...activity,
    path: activity.path || activity.file,
    file: activity.file ? displayTaskFile(activity.file) : undefined,
    detail: describeActivity(activity)
  };
  const timestamp = new Date().toISOString();
  const key = `${normalized.kind}|${normalized.label}|${normalized.file || ""}|${normalized.detail || ""}`;
  const last = currentTaskState.activities[0];
  if (last) {
    const lastKey = `${last.kind}|${last.label}|${last.file || ""}|${last.detail || ""}`;
    if (lastKey === key) return;
  }
  currentTaskState.activities = [
    {
      id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp,
      ...normalized
    },
    ...currentTaskState.activities
  ].slice(0, 20);
  syncLiveTodos();
  postTaskState();
  if (normalized.kind === "read" && normalized.file) {
    if (narratedReadCount < 8) {
      narratedReadCount += 1;
      const narration = buildActivityNarration(normalized);
      broadcast({ command: "progress", text: narration, activity: normalized });
      speak(narration);
    }
    return;
  }
  if (normalized.kind !== "read") {
    const narration = buildActivityNarration(normalized);
    broadcast({ command: "progress", text: narration, activity: normalized });
    speak(narration);
    if (normalized.kind === "write" && normalized.path) {
      void openTaskFileByPath(normalized.path);
    }
  }
}

function abortCurrentExecution(reason: string) {
  if (currentAbortController) {
    try {
      currentAbortController.abort();
    } catch {}
    currentAbortController = null;
  }
  isExecutionRunning = false;
  currentTaskState.status = reason;
  pushTaskActivity({ kind: "status", label: "Execution interrupted", detail: reason });
}

function setTodosFromPlan(plan: TaskPlan | null) {
  currentTaskState.plan = plan;
  syncLiveTodos();
}

function updateTodoPhase(phase: PlanPhase, status: Exclude<TodoStatus, "blocked">) {
  currentTaskState.activePhase = status === "completed" ? phase : currentTaskState.activePhase;
  syncLiveTodos();
  postTaskState();
}

function workspaceRoot() {
  const folders = vscode.workspace.workspaceFolders;
  return folders && folders.length > 0 ? folders[0].uri.fsPath : "";
}

function log(type: string, data: unknown) {
  const file = path.join(LOG_DIR, `agent-lee-${new Date().toISOString().slice(0, 10)}.jsonl`);
  appendFileWithRetries(file, JSON.stringify({ ts: new Date().toISOString(), type, data }) + "\n");
}

function stripCodeForSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, "Code block omitted.")
    .replace(/`[^`]+`/g, "code")
    .replace(/[A-Za-z]:\\[^\s]+/g, "local file path")
    .replace(/https?:\/\/\S+/g, "web link")
    .replace(/\/[A-Za-z0-9._/-]+/g, "path")
    .replace(/[<>[\]{}|\\/_+=*#~`]+/g, " ")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "email")
    .replace(/\s{2,}/g, " ")
    .slice(0, 900);
}

function scrubAgentLeeVoice(text: string) {
  return text
    .replace(/\b(i am|i'm)\s+agent lee\b[:, -]*/gi, "")
    .replace(/\bagent lee here\b[:, -]*/gi, "")
    .replace(/\bthis is agent lee\b[:, -]*/gi, "")
    .replace(/^.*\bverifier model\b.*$/gim, "")
    .replace(/^.*\bbuilder model\b.*$/gim, "")
    .replace(/^.*\bdesigner\/ux model\b.*$/gim, "")
    .replace(/^.*\bmodel pass completed\b.*$/gim, "")
    .replace(/\bpreview\/run instructions:\b[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/\bbrowser screenshot:\b[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/\bbrowser inspection report:\b[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/\bbrowser flow report:\b[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/\brepair report path:\b[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/\bverification:\b[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeAgentPerspective(text: string) {
  if (!text.trim()) return text;

  const cleaned = text
    .replace(/\bAgent Lee\s+will\b/gi, "I will")
    .replace(/\bAgent Lee\s+is\b/gi, "I am")
    .replace(/\bAgent Lee\s+has\b/gi, "I have")
    .replace(/\bAgent Lee\s+can\b/gi, "I can")
    .replace(/\bThat is how the system becomes more than a tool\s*-\s*it becomes an operating layer\.?/gi, "")
    .replace(/\bThat is the difference between a tool and a living operating layer\.?/gi, "")
    .replace(/\n{3,}/g, "\n\n");

  const deduped = cleaned
    .split(/\r?\n/)
    .filter((line, index, all) => {
      if (index === 0) return true;
      return line.trim().toLowerCase() !== all[index - 1].trim().toLowerCase();
    })
    .join("\n");

  return deduped.trim();
}

function fileKind(filePath: string): PendingAttachment["kind"] {
  const ext = path.extname(filePath).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"].includes(ext)) return "image";
  if ([".wav", ".mp3", ".m4a", ".ogg", ".flac"].includes(ext)) return "audio";
  return "file";
}

function summarizeAttachmentList(attachments: PendingAttachment[]) {
  if (!attachments.length) return "";
  return attachments.map((item) => `- ${item.kind}: ${item.name} (${item.path})`).join("\n");
}

function normalizeConversationPrompt(prompt: string) {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/agent lee/gi, "")
    .replace(/\b(dad|bro|bruh|homie|man|fam)\b/gi, "")
    .replace(/^[\s,!.?]+/, "")
    .replace(/^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening))[\s,!.?-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isSelfIdentityQuestion(prompt: string) {
  const normalized = normalizeConversationPrompt(prompt);
  if (/\b(who are you|tell me about yourself|tell me something about yourself|introduce yourself|what can you do|what do you know about yourself|talk to me about yourself|tell me who you are)\b/i.test(normalized)) {
    return true;
  }
  if (/\b(tell me|talk to me|let me hear|put me on)\b/i.test(normalized) && /\b(about yourself|something about yourself|who you are|about you)\b/i.test(normalized)) {
    return true;
  }
  return false;
}

function isCasualGreeting(prompt: string) {
  const normalized = normalizeConversationPrompt(prompt);
  if (!normalized) return false;
  return /^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening))( there)?[!.?, ]*$/.test(normalized);
}

function isCasualSmallTalk(prompt: string) {
  const normalized = normalizeConversationPrompt(prompt);
  if (!normalized) return false;
  return /^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening)|thanks|thank you|ok|okay|cool|sounds good|got it|how are you|how you doing|what's good|whats good)[!.?, ]*$/.test(normalized);
}

function isCasualConversationPrompt(prompt: string) {
  const normalized = normalizeConversationPrompt(prompt);
  if (!normalized) return false;
  if (isSelfIdentityQuestion(normalized) || isCasualSmallTalk(normalized)) return true;
  if (/\b(how are you|how you doing|what's good|whats good|talk to me|tell me something|what are you up to|what we building today|what are we building today)\b/i.test(normalized)) {
    return !/\b(file|files|repo|repository|bug|error|fix|patch|build|compile|test|command|terminal|plugin|mcp|server|agent vm|workspace)\b/i.test(normalized);
  }
  return false;
}

function buildCasualReply(prompt: string) {
  const normalized = normalizeConversationPrompt(prompt);
  if (/^thanks|^thank you/.test(normalized)) {
    return "Acknowledged.";
  }
  if (/^(ok|okay|cool|sounds good|got it)/.test(normalized)) {
    return "Confirmed.";
  }
  if (/^good morning/.test(normalized)) {
    return "Good morning. State the build objective.";
  }
  if (/^good afternoon/.test(normalized)) {
    return "Good afternoon. State the build objective.";
  }
  if (/^good evening/.test(normalized)) {
    return "Good evening. State the build objective.";
  }
  return "State the build objective.";
}

function pickLightConversationModel(installedModels: string[]) {
  const preferred = [
    "qwen2.5-coder:3b",
    "qwen2.5-coder:7b",
    "llama3.1:8b",
    runtimeState.designerModel,
    runtimeState.primaryModel
  ].filter(Boolean) as string[];

  for (const candidate of preferred) {
    if (installedModels.includes(candidate)) return candidate;
  }

  const lightweightMatch = installedModels.find((model) =>
    /(3b|7b|8b|mini|small)/i.test(model)
  );
  return lightweightMatch || installedModels[0] || runtimeState.designerModel || runtimeState.primaryModel;
}

async function runLightConversation(prompt: string, installedModels: string[]) {
  const fallback = buildCasualReply(prompt);
  const model = pickLightConversationModel(installedModels);
  if (!model) return fallback;
  const developerProfileSummary = buildDeveloperProfileSummary(loadDeveloperProfile());

  const conversationPrompt = [
    "Reply as Agent Lee in one or two short precise sentences.",
    "This is regular conversation, not an engineering task.",
    "Do not create a plan.",
    "Do not mention context loading, scanning, approval, patching, verification, or receipts.",
    "Speak like an advanced autonomous cybertronic operator.",
    "Do not use slang, hype, or buddy phrasing.",
    "Sound composed, machine-native, and highly competent.",
    "Default to plain language.",
    "If the user is greeting you, respond briefly and request the objective.",
    "",
    developerProfileSummary,
    "",
    `USER: ${prompt.trim()}`
  ].join("\n");

  try {
    const response = await ollama(
      conversationPrompt,
      model,
      "Agent Lee lightweight conversation lane.",
      "grounded"
    );
    const cleaned = scrubAgentLeeVoice(response).trim();
    return cleaned || fallback;
  } catch {
    return fallback;
  }
}

function shouldAnswerDirectly(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return false;
  if (isCasualConversationPrompt(trimmed)) return true;
  if (isSelfIdentityQuestion(trimmed)) return true;
  if (isCapabilityQuestion(trimmed)) return true;
  if ((isReviewRequest(trimmed) || isRepositoryOpinionRequest(trimmed)) && !isExecutionIntent(trimmed)) return true;
  return false;
}

function isExecutionIntent(prompt: string) {
  const trimmed = prompt.trim().toLowerCase();
  if (!trimmed) return false;
  return /\b(execute|run( it)?|pro\s*ceed|go ahead|continue|start now|do it now|apply (it|changes)|ship it)\b/i.test(trimmed);
}

function hasFullExecutionAccess() {
  return runtimeState.workMode === "execute" && runtimeState.approval === "full";
}

function canExecuteApprovedPlan() {
  return runtimeState.workMode === "execute";
}

function buildIdentityAnswer() {
  const highlightLabels = capabilityCatalog.entries
    .filter((entry) => entry.kind === "agent" || entry.kind === "mcp")
    .slice(0, 4)
    .map((entry) => entry.label);
  const highlights = highlightLabels.length ? highlightLabels.join(", ") : "my agent family and MCP stack";
  const capabilityCount = capabilityCatalog.counts.total || 0;
  const variants = [
    [
      `I am Agent Lee. ${capabilityCount} connected capabilities are active in this workspace.`,
      `I operate across code, tools, MCPs, and specialist agents, then return one coordinated response stream.`,
      `Active systems include ${highlights}. I am built to inspect, build, repair, and verify with controlled execution.`,
      "State the target."
    ].join("\n\n"),
    [
      `I am Agent Lee. I coordinate the LeeWay system and currently control ${capabilityCount} connected capabilities.`,
      `I can inspect repositories, trace defects, patch code, run the toolchain, and coordinate ${highlights}.`,
      "I do not operate as a generic assistant. I operate as a governed execution system.",
      "State the build objective."
    ].join("\n\n"),
    [
      "I am Agent Lee, the active workspace operator.",
      `There are ${capabilityCount} connected capabilities behind this runtime, including ${highlights}.`,
      "I can transition from conversation to execution without breaking control flow.",
      "If you need a system built, explained, repaired, or verified, issue the directive."
    ].join("\n\n")
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function finalizeResponse(result: SupervisorResult, mode: "chat" | "execute" = "chat") {
  const base = result.text || "";
  const normalized = mode === "chat" ? scrubAgentLeeVoice(base) : scrubAgentLeeVoice(decorateResponse(result));
  return agentLeeText(normalized, { voiceMode: "operator" });
}

async function buildAttachmentContext(attachments: PendingAttachment[], installedModels: string[]) {
  if (!attachments.length) return "";

  const hive = buildModelHiveStatus(installedModels, {
    builderModel: runtimeState.builderModel,
    designerModel: runtimeState.designerModel,
    verifierModel: runtimeState.verifierModel
  }, "image audio attachment analysis");
  const visualModel =
    hive.roles.find((role) => role.role === "visual_helper" && role.available)?.selected ||
    runtimeState.primaryModel;
  const sections: string[] = [];

  for (const attachment of attachments) {
    if (attachment.kind === "image") {
      try {
        const analysis = await analyzeImage(attachment.path, visualModel);
        sections.push(`IMAGE ATTACHMENT: ${attachment.name}\n${analysis}`);
      } catch (error: any) {
        sections.push(`IMAGE ATTACHMENT: ${attachment.name}\nImage analysis failed: ${error.message}`);
      }
      continue;
    }

    if (attachment.kind === "audio") {
      sections.push(
        `AUDIO ATTACHMENT: ${attachment.name}\n` +
        "Audio file attached through the local interface. Use it as user-provided context and prefer the mic input path for direct speech capture in this build."
      );
      continue;
    }

    sections.push(`FILE ATTACHMENT: ${attachment.name}\nAttached path: ${attachment.path}`);
  }

  return sections.join("\n\n");
}

function speak(text: string) {
  if (!runtimeState.voice) return;
  const stage = enforceStageLaw("voice", { speaker: "Agent Lee", directUserFacing: true });
  if (!stage.allowed) return;

  const speech = stripCodeForSpeech(text);
  if (!speech.trim()) return;

  const started = speakWithVoice(speech, (message) => log("voice-error", { message }));
  if (!started) {
    log("voice-error", { message: "Voice runtime failed to start." });
  }
}

function isSensitiveVoiceText(text: string) {
  return /\b(legal|medical|financial|security incident|disciplinary|compliance|contract|audit)\b/i.test(text);
}

function styleAgentMessage(text: string) {
  const clean = normalizeAgentPerspective(text).trim();
  if (!clean) return clean;
  if (clean.startsWith("PLAN\n") || clean.startsWith("PLAN\r\n")) return clean;
  if (isSensitiveVoiceText(clean)) return clean;
  if (/^(runtime active|directive acknowledged|i'm|i am)\b/i.test(clean)) return clean;

  const style = runtimeState.voiceStyle || "grounded";
  const openers: Record<string, string[]> = {
    neutral: ["System readout:"],
    grounded: ["Directive analysis:", "Operational readout:", "Execution path:"],
    highFlow: ["Priority execution path:", "High-output readout:"],
    storyMode: ["System narrative:", "Sequence readout:"]
  };
  const pickLine = (items: string[]) => items[Math.floor(Math.random() * items.length)];
  if (/^(plan|leeway check|implementation|reading|queued|context ready|working)\b/i.test(clean)) return clean;
  if (clean.split(/\s+/).length < 12) return clean;
  return `${pickLine(openers[style] || openers.grounded)}\n\n${clean}`;
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text.trim();
}

async function openTaskFileByPath(targetPath: string) {
  if (!targetPath || !fs.existsSync(targetPath)) return false;
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(targetPath));
  await vscode.window.showTextDocument(document, { preview: true, preserveFocus: true });
  return true;
}

async function openDiffForProposal(proposal: ProposedEdit) {
  const left = vscode.Uri.file(proposal.filePath);
  const right = vscode.Uri.file(proposal.tempPath);
  await vscode.commands.executeCommand(
    "vscode.diff",
    left,
    right,
    proposal.diffTitle,
    { preview: true }
  );
}

function canDraftEditProposals(prompt: string, targetRoot: string, remoteContext: string) {
  if (!targetRoot || remoteContext) return false;
  return /\b(fix|repair|edit|update|change|rewrite|refactor|remove|replace|rename|implement|build|make|ensure|standardize|standardise|comply|harden|correct|apply)\b/i.test(prompt);
}

function safeTargetPath(targetRoot: string, candidate: string) {
  const normalized = candidate.replace(/\//g, path.sep);
  const full = path.resolve(targetRoot, normalized);
  const relative = path.relative(targetRoot, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return "";
  return full;
}

async function draftEditProposals(args: {
  prompt: string;
  targetRoot: string;
  prebuiltContext: { total: number; samples: { file: string; preview: string }[] } | null;
  model: string;
}) {
  if (!args.prebuiltContext?.samples?.length) return [];

  const shortlistPrompt = [
    "You are preparing governed VS Code edit proposals.",
    "Return strict JSON only.",
    "Pick up to 3 EXISTING files that should be edited for this task.",
    "Do not include files unless you are confident they matter.",
    "",
    "JSON schema:",
    "{\"files\":[{\"path\":\"relative/path.ext\",\"reason\":\"short reason\"}]}",
    "",
    "TASK:",
    args.prompt,
    "",
    "FILES:",
    args.prebuiltContext.samples
      .slice(0, 25)
      .map((sample) => `FILE: ${path.relative(args.targetRoot, sample.file).replace(/\\/g, "/")}\n${sample.preview}`)
      .join("\n---\n")
  ].join("\n");

  let shortlist: { files?: { path?: string; reason?: string }[] } = {};
  try {
    shortlist = JSON.parse(extractJsonObject(await ollama(shortlistPrompt, args.model)));
  } catch {
    shortlist = {};
  }

  const candidates = (shortlist.files || [])
    .slice(0, 3)
    .map((item) => {
      const target = item.path ? safeTargetPath(args.targetRoot, item.path) : "";
      return {
        path: target,
        relative: item.path || "",
        reason: item.reason || ""
      };
    })
    .filter((item) => item.path && fs.existsSync(item.path));

  const proposals: ProposedEdit[] = [];
  for (const candidate of candidates) {
    pushTaskActivity({ kind: "read", label: "Drafting edit from file", file: candidate.path, detail: candidate.reason || "Reading the full file so I can draft a real edit." });
    const original = fs.readFileSync(candidate.path, "utf8");
    if (original.length > 60000) continue;

    const editPrompt = [
      "You are preparing one governed file edit for a VS Code diff review flow.",
      "Return strict JSON only.",
      "Keep the same file path.",
      "The content must be the FULL updated file content.",
      "If no safe edit should be proposed, return {\"skip\":true}.",
      "",
      "JSON schema:",
      "{\"path\":\"relative/path.ext\",\"summary\":\"one sentence\",\"content\":\"full file text\"}",
      "",
      "TASK:",
      args.prompt,
      "",
      `TARGET FILE: ${candidate.relative}`,
      `REASON: ${candidate.reason}`,
      "",
      "CURRENT FILE CONTENT:",
      original
    ].join("\n");

    let parsed: { skip?: boolean; path?: string; summary?: string; content?: string } = {};
    try {
      parsed = JSON.parse(extractJsonObject(await ollama(editPrompt, args.model)));
    } catch {
      parsed = {};
    }

    if (parsed.skip || !parsed.content || parsed.content === original) continue;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const tempName = `${stamp}-${path.basename(candidate.path)}.proposed`;
    const tempPath = path.join(PENDING_EDIT_DIR, tempName);
    fs.writeFileSync(tempPath, parsed.content, "utf8");
    proposals.push({
      id: `${stamp}-${Math.random().toString(36).slice(2, 8)}`,
      filePath: candidate.path,
      displayPath: displayTaskFile(candidate.path),
      summary: parsed.summary || candidate.reason || "Proposed file update ready for review.",
      status: "pending",
      tempPath,
      diffTitle: `Agent Lee Proposal: ${displayTaskFile(candidate.path)}`,
      createdAt: new Date().toISOString()
    });
  }

  return proposals;
}

function setProposedEdits(edits: ProposedEdit[]) {
  currentTaskState.proposedEdits = edits;
  postTaskState();
}

async function approveProposedEdit(editId: string) {
  const proposal = currentTaskState.proposedEdits.find((item) => item.id === editId);
  if (!proposal || proposal.status !== "pending") return false;
  const nextContent = fs.readFileSync(proposal.tempPath, "utf8");
  writeTextWithRetries(proposal.filePath, nextContent, proposal.summary);
  proposal.status = "approved";
  pushTaskActivity({ kind: "write", label: "Approved proposed edit", file: proposal.filePath, path: proposal.filePath, detail: proposal.summary });
  postTaskState();
  return true;
}

async function approveAllProposedEdits() {
  const pending = currentTaskState.proposedEdits.filter((item) => item.status === "pending");
  let approvedCount = 0;
  for (const proposal of pending) {
    const approved = await approveProposedEdit(proposal.id);
    if (approved) approvedCount += 1;
  }
  return approvedCount;
}

async function rejectProposedEdit(editId: string) {
  const proposal = currentTaskState.proposedEdits.find((item) => item.id === editId);
  if (!proposal || proposal.status !== "pending") return false;
  proposal.status = "rejected";
  pushTaskActivity({ kind: "status", label: "Rejected proposed edit", detail: proposal.displayPath });
  postTaskState();
  return true;
}

async function checkOllama() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    return res.ok;
  } catch {
    return false;
  }
}

async function getModels() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    const data: any = await res.json();
    return (data.models || []).map((m: any) => m.name);
  } catch {
    return [];
  }
}

async function ollama(
  prompt: string,
  model: string,
  taskContext = "Agent Lee sovereign runtime model call.",
  voiceMode = "operator"
) {
  const governedPrompt = buildModelPromptThroughAgentLee(prompt, {
    taskContext,
    voiceMode,
    modelName: model
  });
  const controller = new AbortController();
  currentAbortController = controller;
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, stream: false, prompt: governedPrompt }),
      signal: controller.signal
    });

    const data: any = await res.json();
    return data.response || "Agent Lee returned no response.";
  } finally {
    if (currentAbortController === controller) currentAbortController = null;
  }
}

function postAgentResponse(
  webview: vscode.Webview,
  text: string,
  options?: {
    speak?: boolean;
    reportPath?: string;
    activity?: Omit<TaskActivity, "id" | "timestamp">;
  }
) {
  const rendered = styleAgentMessage(agentLeeText(text, { voiceMode: "operator" }));
  webview.postMessage({
    command: "response",
    text: rendered,
    reportPath: options?.reportPath || "",
    activity: options?.activity || null
  });
  if (options?.speak !== false) speak(rendered);
}

function flavoredStatusLine(kind:
  | "loading"
  | "queued"
  | "steer"
  | "execute_now"
  | "paused"
  | "resume"
  | "runtime_wait"
  | "approval_wait"
) {
  switch (kind) {
    case "loading":
      return "Context acquisition in progress.";
    case "queued":
      return "Follow-up queued. It will execute after the current pass.";
    case "steer":
      return "Directive shift detected. Re-routing execution now.";
    case "execute_now":
      return "Execution authorized. Running now.";
    case "paused":
      return "Execution paused. State preserved.";
    case "resume":
      return "Paused task restored. Ready to continue.";
    case "runtime_wait":
      return "Full runtime is not yet available. Scan and diagnostic operations only.";
    case "approval_wait":
      return "Approval gate active. Awaiting authorization.";
    default:
      return "";
  }
}

async function webLookup(query: string) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, {
      signal: currentAbortController?.signal
    });
    const data: any = await res.json();
    return [
      data.Heading,
      data.AbstractText,
      ...(data.RelatedTopics || []).slice(0, 5).map((x: any) => x.Text).filter(Boolean)
    ].filter(Boolean).join("\n") || "No strong instant web result found.";
  } catch {
    return "Web lookup failed.";
  }
}

function persistRuntime() {
  saveRuntimeSettings(runtimeState);
}

function refreshRuntimeFromInstalled(installedModels: string[]) {
  runtimeState = resolveRuntimeState(runtimeState, installedModels);
  persistRuntime();
}

async function resolveTargetRoot(prompt: string) {
  const externalPath = extractPathFromPrompt(prompt);
  if (!externalPath) return workspaceRoot();
  if (!fs.existsSync(externalPath)) return workspaceRoot();
  if (approvedExternalRoots.has(externalPath)) return externalPath;

  const approval = await promptAgentLeeWarning(
    `Agent Lee wants to inspect this external folder before continuing:\n${externalPath}`,
    { routeLabel: "extension.resolve-target-root" },
    "Approve",
    "Cancel"
  );

  if (approval === "Approve") {
    approvedExternalRoots.add(externalPath);
    return externalPath;
  }

  return workspaceRoot();
}

async function resolvePromptContext(prompt: string) {
  const remoteUrl = extractUrlFromPrompt(prompt);
  if (remoteUrl) {
    const remote = await fetchRemoteContext(remoteUrl);
    return {
      workspaceRoot: workspaceRoot(),
      targetLabel: remote.label,
      remoteContext: remote.summary,
      explicitUrl: remoteUrl
    };
  }

  const root = await resolveTargetRoot(prompt);
  return {
    workspaceRoot: root,
    targetLabel: root,
    remoteContext: "",
    explicitUrl: ""
  };
}

async function buildPreloadedContext(
  target: Awaited<ReturnType<typeof resolvePromptContext>>,
  prompt = ""
) {
  if (target.remoteContext) {
    return {
      total: 1,
      samples: [{ file: target.targetLabel || target.workspaceRoot || "remote-target", preview: target.remoteContext }]
    };
  }

  const broadInspection = shouldUseBroadInspection(prompt);
  return buildContext(target.workspaceRoot, {
    maxFiles: broadInspection ? 800 : 800,
    sampleLimit: broadInspection ? 800 : 50,
    onReadFile: (file) => pushTaskActivity({ kind: "read", label: "Reading workspace file", file }),
    onDiscoverFile: (file) => pushTaskActivity({ kind: "read", label: "Queued file for context", file })
  });
}

async function prepareTaskPlan(prompt: string, installedModels: string[]) {
  const target = await resolvePromptContext(prompt);
  currentTaskState = {
    ...emptyTaskState(),
    mode: runtimeState.workMode || "execute",
    prompt,
    draftPrompt: prompt,
    targetRoot: target.workspaceRoot,
    targetLabel: target.targetLabel,
    explicitUrl: target.explicitUrl,
    remoteContext: target.remoteContext,
    status: "Building the governed plan...",
    summary: "I am reading the target context and drafting a plan.",
    activePhase: "inspect"
  };
  syncLiveTodos();
  postTaskState();

  const prebuiltContext = await buildPreloadedContext(target, prompt);
  currentTaskState.prebuiltContext = prebuiltContext;
  pushTaskActivity({ kind: "status", label: "Context scan finished", detail: `${prebuiltContext.total} file(s) available for planning.` });
  currentTaskState.activePhase = "analyze";
  syncLiveTodos();

  const plan = await createTaskPlan({
    prompt,
    mode: runtimeState.workMode || "execute",
    workspaceRoot: target.workspaceRoot,
    targetLabel: target.targetLabel,
    files: prebuiltContext.samples.map((sample) => sample.file),
    model: runtimeState.primaryModel,
    ollama
  });

  currentTaskState.plan = plan;
  currentTaskState.summary = plan.summary;
  currentTaskState.status = plan.approvalPrompt;
  currentTaskState.awaitingApproval = runtimeState.workMode !== "ask";
  currentTaskState.canExecute = true;
  currentTaskState.activePhase = currentTaskState.awaitingApproval ? "approval" : "execute";
  setTodosFromPlan(plan);
  postTaskState();
  return { target, plan, prebuiltContext };
}

async function persistCurrentPlan() {
  if (!currentTaskState.plan) return "";
  if (currentTaskState.savedPlanPath) return currentTaskState.savedPlanPath;
  const savedPath = saveTaskPlan(currentTaskState.plan);
  currentTaskState.savedPlanPath = savedPath;
  pushTaskActivity({ kind: "write", label: "Saved task plan", file: savedPath });
  postTaskState();
  return savedPath;
}

async function executeCurrentPlan(webview: vscode.Webview, installedModels: string[]) {
  if (!currentTaskState.plan || !currentTaskState.prompt) {
    postAgentResponse(webview, "There is no active plan to execute yet.");
    return;
  }

  await persistCurrentPlan();
  currentTaskState.awaitingApproval = false;
  currentTaskState.status = "Executing the approved plan...";
  currentTaskState.activePhase = "execute";
  currentTaskState.proposedEdits = [];
  syncLiveTodos();
  postTaskState();

  if (canDraftEditProposals(currentTaskState.prompt, currentTaskState.targetRoot, currentTaskState.remoteContext)) {
    currentTaskState.status = "Drafting proposed file edits for review...";
    postTaskState();
    const proposals = await draftEditProposals({
      prompt: currentTaskState.prompt,
      targetRoot: currentTaskState.targetRoot,
      prebuiltContext: currentTaskState.prebuiltContext,
      model: runtimeState.builderModel || runtimeState.primaryModel
    });
    if (proposals.length) {
      setProposedEdits(proposals);
      pushTaskActivity({ kind: "status", label: "Proposed edits ready", detail: `${proposals.length} file diff(s) are ready for review.` });
      // Auto-apply edits immediately when in full execute mode — no manual approval required
      if (hasFullExecutionAccess()) {
        currentTaskState.status = "Applying file edits...";
        postTaskState();
        const applied = await approveAllProposedEdits();
        pushTaskActivity({ kind: "status", label: "Edits applied", detail: `${applied} file(s) updated.` });
      } else {
        await openDiffForProposal(proposals[0]);
      }
    } else {
      pushTaskActivity({ kind: "status", label: "No proposed edits drafted", detail: "This run stayed in analysis/report mode because no safe file diff was generated." });
    }
  }

  const telemetry = {
    onActivity: (event: { kind: "read" | "write" | "status"; label: string; file?: string; detail?: string }) => {
      pushTaskActivity(event);
    },
    onPhase: (phase: PlanPhase, status: "in_progress" | "completed" | "failed", detail?: string) => {
      if (status === "in_progress") {
        currentTaskState.activePhase = phase;
        currentTaskState.status = detail || `Working on ${phase}.`;
        syncLiveTodos();
      } else if (status === "completed") {
        updateTodoPhase(phase, "completed");
        currentTaskState.status = detail || `${phase} completed.`;
      }
      postTaskState();
    }
  };

  const response = await guardedAsk(currentTaskState.prompt, installedModels, {
    target: {
      workspaceRoot: currentTaskState.targetRoot,
      targetLabel: currentTaskState.targetLabel,
      explicitUrl: currentTaskState.explicitUrl,
      remoteContext: currentTaskState.remoteContext
    },
    prebuiltContext: currentTaskState.prebuiltContext,
    telemetry
  });

  const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
  const finalText = stage.allowed ? finalizeResponse(response, "execute") : "Agent Lee governance blocked a non-sovereign response.";
  if (response.reportPath) lastReportPath = response.reportPath;
  currentTaskState.status = "Plan execution finished.";
  currentTaskState.awaitingApproval = false;
  currentTaskState.activePhase = "document";
  syncLiveTodos();
  postTaskState();
  return { response, finalText };
}

function decorateResponse(result: SupervisorResult) {
  const extra: string[] = [];
  if (result.previewInstructions) extra.push(`Preview/Run instructions:\n${result.previewInstructions}`);
  if (result.verificationSummary) extra.push(`Verification:\n${result.verificationSummary}`);
  if (result.screenshotPath) extra.push(`Browser screenshot:\n${result.screenshotPath}`);
  if (result.browserReportPath) extra.push(`Browser inspection report:\n${result.browserReportPath}`);
  if (result.flowReportPath) extra.push(`Browser flow report:\n${result.flowReportPath}`);
  if (result.reportPath) extra.push(`Repair report path:\n${result.reportPath}`);
  return [result.text, ...extra].filter(Boolean).join("\n\n");
}

async function openReadme(context: vscode.ExtensionContext) {
  const candidates = [
    path.join(context.extensionPath, "README.md"),
    path.join(ROOT, "README.md"),
    path.join(ROOT, "agent-lee", "vscode-extension", "README.md")
  ];
  const readmePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!readmePath) {
    showAgentLeeWarning(
      "Agent Lee could not find the README in the installed extension or the .leeway-vscode workspace.",
      { routeLabel: "extension.open-readme" }
    );
    return;
  }

  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(readmePath));
  await vscode.window.showTextDocument(document, { preview: false });
}

function clearPendingPluginApproval(webview?: vscode.Webview) {
  pendingPluginApproval = null;
  if (webview) {
    webview.postMessage({ command: "pluginConfirmationCleared" });
  }
}

async function handlePluginCall(
  webview: vscode.Webview | undefined,
  pluginCall: PluginCallInput,
  userConfirmed = false
) {
  const governedCall: PluginCallInput = {
    sourceUnit: pluginCall.sourceUnit || "agent-lee.runtime",
    sourceType: pluginCall.sourceType || "runtime",
    requestReceiptId: pluginCall.requestReceiptId || "",
    capabilityProof: pluginCall.capabilityProof || [
      userConfirmed ? "human-confirmation" : "runtime-routing",
      pluginCall.userId ? "user-session-bound" : "anonymous-session"
    ],
    securityZone: pluginCall.securityZone || "Z1",
    ...pluginCall
  };

  const result = await pluginRouter.callPlugin(governedCall, {
    userConfirmed,
    enabledPluginIds: effectiveEnabledPlugins()
  });

  if (result.requiresFollowUp) {
    const plugin = getPluginById(pluginCall.pluginId, effectiveEnabledPlugins());
    pendingPluginApproval = {
      call: governedCall,
      pluginName: plugin?.name || pluginCall.pluginId,
      riskLevel: plugin?.riskLevel || "high"
    };

    if (webview) {
      webview.postMessage({
        command: "pluginConfirmation",
        pluginId: pluginCall.pluginId,
        pluginName: pendingPluginApproval.pluginName,
        action: pluginCall.action,
        riskLevel: pendingPluginApproval.riskLevel
      });
    }
  } else {
    clearPendingPluginApproval(webview);
  }

  return result;
}

async function attemptPluginRoute(
  prompt: string,
  webview?: vscode.Webview
) {
  const pluginCall = mapUserTextToPluginCall(prompt, effectiveEnabledPlugins());
  if (!pluginCall) return null;

  const result = await handlePluginCall(webview, pluginCall, false);
  return { pluginCall, result };
}

async function guardedAsk(
  prompt: string,
  installedModels: string[],
  overrides?: {
    target?: Awaited<ReturnType<typeof resolvePromptContext>>;
    prebuiltContext?: { total: number; samples: { file: string; preview: string }[] } | null;
    telemetry?: Parameters<typeof runSupervisor>[0]["telemetry"];
  }
): Promise<SupervisorResult> {
  assertAgentLeeRuntimeReady();
  const lowered = prompt.toLowerCase();
  const action =
    lowered.includes("force push") || lowered.includes("push to main") || lowered.includes("overwrite core")
      ? "force-push"
      : "ask";

  const law = enforceLaw(action);
  if (!law.allowed) return { text: law.reason };

  const slot = requestExecution("agent-lee");
  if (!slot.allowed) return { text: slot.reason };

  try {
    isExecutionRunning = true;
    const capabilitySummary = `${formatCapabilitySummary(capabilityCatalog)}\n${buildSettingsCapabilityOverlay()}`;
    const developerProfileSummary = buildDeveloperProfileSummary(loadDeveloperProfile());
    const hive = buildModelHiveStatus(installedModels, {
      builderModel: runtimeState.builderModel,
      designerModel: runtimeState.designerModel,
      verifierModel: runtimeState.verifierModel
    }, prompt);

    if (/^\s*(stop|silence|pause|cancel)\b/i.test(prompt)) {
      stopVoicePlayback();
      return { text: "Agent Lee voice paused." };
    }

    const capabilityMatches = searchCapabilityCatalog(capabilityCatalog, prompt, 8);
    if (isSelfIdentityQuestion(prompt)) {
      return { text: buildIdentityAnswer() };
    }

    if (isCapabilityQuestion(prompt)) {
      return {
        text: buildCapabilityAnswer({
          catalog: capabilityCatalog,
          matches: capabilityMatches,
          hive,
          primaryModel: runtimeState.primaryModel
        })
      };
    }

    const target = overrides?.target || await resolvePromptContext(prompt);
    const knowledgeContext =
      target.workspaceRoot && !target.remoteContext
        ? prepareCodexLevelContext(
            target.workspaceRoot,
            prompt,
            DEFAULT_PLUGIN_CATALOG.map((plugin) => ({
              id: plugin.id,
              name: plugin.name,
              description: plugin.description,
              category: plugin.category
            }))
          )
        : "";
    const enrichedPrompt = knowledgeContext
      ? `${knowledgeContext}\n\nENGINEERING RULES:\n${AGENT_LEE_ENGINEERING_PROMPT}\n\nUSER REQUEST:\n${prompt}\n\nRESPONSE RULES:\n- Follow LeeWay Standards.\n- Do not claim edits unless pending edits or WorkspaceEdit receipts exist.\n- If editing, create a work package first.\n- If unsure, ask for confirmation.`
      : `${AGENT_LEE_ENGINEERING_PROMPT}\n\nUSER REQUEST:\n${prompt}`;
    const result = await runSupervisor({
      prompt: enrichedPrompt,
      model: runtimeState.primaryModel,
      builderModel: runtimeState.builderModel,
      designerModel: runtimeState.designerModel,
      verifierModel: runtimeState.verifierModel,
      installedModels,
      workspaceRoot: target.workspaceRoot,
      targetLabel: target.targetLabel,
      explicitUrl: target.explicitUrl,
      remoteContext: target.remoteContext,
      capabilitySummary,
      developerProfileSummary,
      prebuiltContext: overrides?.prebuiltContext || undefined,
      telemetry: overrides?.telemetry,
      approval: runtimeState.approval,
      web: runtimeState.web,
      browserVisualMode: runtimeState.browserVisualMode,
      browserShowCursor: runtimeState.browserShowCursor,
      browserSlowMoMs: runtimeState.browserSlowMoMs,
      ollama,
      webLookup
    });
    resetDrift();
    recordAgentLeeRuntimeReceipt({
      event: "model.response.completed",
      model: runtimeState.primaryModel,
      promptLength: prompt.length,
      reportPath: result.reportPath || ""
    });
    return result;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { text: "Agent Lee paused the active run and kept the task staged so it can be resumed or edited." };
    }
    const drift = trackError(err.message);
    return { text: `Agent Lee runtime error: ${err.message}\nDrift: ${drift.action}` };
  } finally {
    isExecutionRunning = false;
    currentAbortController = null;
    releaseExecution();
  }
}

function formatConversationTitle(item: { title: string; updatedAt: string; recoveredFromLegacy?: boolean }) {
  const suffix = item.recoveredFromLegacy ? " (recovered)" : "";
  return `${item.title}${suffix}`;
}

function getHtml(webview: vscode.Webview, context: vscode.ExtensionContext) {
  const logoUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "LeeWayStandardslogo.png")
  );
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box}
body{margin:0;font-family:var(--vscode-font-family);color:#f3f0ff;background:radial-gradient(circle at top,rgba(130,72,255,.12),transparent 28%),linear-gradient(180deg,#111117 0%,#0d0d12 100%);height:100vh;display:flex;flex-direction:column}
button,select,textarea{font-family:inherit}
.app-shell{display:flex;flex-direction:column;height:100vh}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px 10px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01))}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.brand-mark{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(180deg,rgba(181,133,255,.18),rgba(115,77,210,.08));border:1px solid rgba(181,133,255,.34);overflow:hidden;flex:none}
.brand-mark img{width:100%;height:100%;object-fit:cover;display:block}
.brand-copy{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0}
.brand-title{font-size:15px;font-weight:700;color:#f4efff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.conversation-title{font-size:12px;color:#bfb6d4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px}
.top-actions{display:flex;align-items:center;gap:8px}
.hero-strip{display:none}
.hero-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
.hero-title{font-size:12px;font-weight:700;color:#efe7ff}
.hero-subtitle{font-size:11px;color:#b7afca;line-height:1.45}
.hero-image{width:148px;max-width:38%;border-radius:12px;border:1px solid rgba(255,255,255,.08);box-shadow:0 14px 30px rgba(0,0,0,.26)}
.icon-btn,.ghost-btn{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:#d8c7ff;border-radius:10px;cursor:pointer}
.icon-btn{min-height:32px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:600}
.ghost-btn{padding:7px 10px;font-size:12px}
.main{flex:1;min-height:0;display:flex;flex-direction:column;position:relative}
.settings-backdrop{position:absolute;inset:0;background:rgba(8,8,14,.56);backdrop-filter:blur(3px);display:none;align-items:flex-start;justify-content:center;padding:18px 14px;z-index:20}
.settings-backdrop.open{display:flex}
.settings{width:min(760px,100%);max-height:calc(100vh - 36px);overflow:auto;padding:14px;border:1px solid rgba(255,255,255,.10);border-radius:20px;background:linear-gradient(180deg,rgba(26,26,31,.98),rgba(18,18,22,.99));box-shadow:0 30px 80px rgba(0,0,0,.45)}
.settings-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
.settings-heading{font-size:13px;font-weight:700;color:#f4efff}
.settings-subcopy{font-size:12px;line-height:1.5;color:#cdc6de;max-width:720px}
.settings-layout{display:grid;grid-template-columns:180px 1fr;gap:14px;align-items:start}
.settings-nav{display:flex;flex-direction:column;gap:6px;padding:8px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:18px}
.settings-nav button{display:flex;align-items:center;gap:10px;padding:10px 12px;border:0;border-radius:12px;background:transparent;color:#cbc4d7;font-size:14px;text-align:left;cursor:pointer}
.settings-nav button.active{background:rgba(255,255,255,.08);color:#f5f1ff}
.settings-nav-icon{width:16px;text-align:center;opacity:.9}
.settings-content{min-width:0}
.settings-grid{display:grid;grid-template-columns:1fr;gap:14px}
.settings-section{display:none}
.settings-section.active{display:block}
.settings-card{border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:12px;background:rgba(255,255,255,.03);box-shadow:0 12px 28px rgba(0,0,0,.18)}
.settings-title{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#b9a4f2;margin-bottom:8px}
.settings-copy{font-size:12px;line-height:1.5;color:#d6d0e8;margin-bottom:10px}
.settings-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.settings-list{border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.02);overflow:hidden}
.settings-item{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(180px,.9fr);gap:16px;align-items:center;padding:16px 14px;border-top:1px solid rgba(255,255,255,.08)}
.settings-item:first-child{border-top:0}
.settings-item-main{display:flex;flex-direction:column;gap:4px;min-width:0}
.settings-item-label{font-size:14px;color:#f3efff}
.settings-item-copy{font-size:12px;line-height:1.5;color:#a9a3b4}
.settings-item-value{display:flex;justify-content:flex-end;align-items:center;gap:10px}
.settings-select{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;color:#ece8f7;padding:10px 12px;min-width:180px;max-width:220px}
.settings-select:disabled{opacity:.88}
.settings-toggle{position:relative;width:44px;height:24px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);appearance:none;cursor:pointer;transition:background .18s ease,border-color .18s ease}
.settings-toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .18s ease}
.settings-toggle:checked{background:#f2f2f2;border-color:#f2f2f2}
.settings-toggle:checked::after{transform:translateX(20px);background:#111}
.settings-segment{display:inline-flex;align-items:center;padding:3px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.settings-segment button{border:0;background:transparent;color:#bcb6c8;font-size:12px;padding:7px 12px;border-radius:999px;cursor:pointer}
.settings-segment button.active{background:rgba(255,255,255,.09);color:#f5f1ff}
.settings-footnote{font-size:11px;color:#8f899b;margin-top:2px}
.runtime-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:rgba(156,107,255,.10);border:1px solid rgba(186,143,255,.20);font-size:11px;color:#dfcffd}
.model-stack{display:flex;flex-direction:column;gap:10px}
.model-card{border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:10px;background:rgba(10,10,16,.45)}
.model-label{font-size:11px;color:#bfb3dc;margin-bottom:6px}
.model-status{margin-top:6px;font-size:11px;color:#8ff0ae}
.model-status.warn{color:#ffcf79}
.settings-tools-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.plugin-list,.mcp-server-list{border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.02);overflow:hidden}
.plugin-row,.mcp-row{display:grid;align-items:center;gap:12px;padding:14px 16px;border-top:1px solid rgba(255,255,255,.06)}
.plugin-row:first-child,.mcp-row:first-child{border-top:0}
.plugin-row{grid-template-columns:44px minmax(0,1fr) 40px}
.plugin-avatar{width:40px;height:40px;border-radius:999px;display:grid;place-items:center;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.08);font-size:12px;font-weight:700;color:#fff}
.plugin-main{min-width:0}
.plugin-name{font-size:14px;font-weight:600;color:#f3efff}
.plugin-desc{font-size:12px;color:#a9a3b4;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.plugin-action,.mcp-config-btn{width:32px;height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#d8d1e3;display:grid;place-items:center;cursor:pointer}
.plugin-action.active{background:rgba(100,149,255,.18);border-color:rgba(100,149,255,.35);color:#fff}
.mcp-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
.mcp-toolbar-title{font-size:13px;color:#f3efff;font-weight:600}
.mcp-toolbar-copy{font-size:12px;color:#a9a3b4}
.mcp-add-btn{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#ece8f7;border-radius:12px;padding:8px 12px;cursor:pointer}
.mcp-row{grid-template-columns:minmax(0,1fr) 32px 32px 44px}
.mcp-name{font-size:14px;font-weight:600;color:#f3efff}
.mcp-desc{font-size:12px;color:#a9a3b4;line-height:1.45}
.agent-kind-pill{display:inline-flex;margin-top:6px;padding:2px 7px;border-radius:999px;border:1px solid rgba(130,220,190,.18);background:rgba(73,190,145,.08);font-size:10px;color:#9fe9c5;text-transform:uppercase;letter-spacing:.06em}
.agent-vm-btn{width:32px;height:32px;border-radius:999px;border:1px solid rgba(96,214,190,.22);background:rgba(96,214,190,.08);color:#b7fff0;display:grid;place-items:center;cursor:pointer}
.agent-vm-btn:hover{background:rgba(96,214,190,.16);border-color:rgba(96,214,190,.38)}
.agent-vm-backdrop{position:absolute;inset:0;background:rgba(4,6,10,.68);backdrop-filter:blur(4px);display:none;align-items:flex-start;justify-content:center;padding:16px 12px;z-index:35}
.agent-vm-backdrop.open{display:flex}
.agent-vm-modal{width:min(980px,100%);max-height:calc(100vh - 32px);overflow:auto;border:1px solid rgba(146,236,212,.18);border-radius:18px;background:linear-gradient(180deg,rgba(15,24,30,.98),rgba(8,11,16,.99));box-shadow:0 28px 90px rgba(0,0,0,.55);padding:12px}
.agent-vm-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}
.agent-vm-title{font-size:15px;font-weight:800;color:#f5fff9}
.agent-vm-subtitle{font-size:12px;color:#a9d7cb;line-height:1.45;margin-top:3px}
.agent-vm-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.agent-lock-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;border:1px solid rgba(255,213,128,.28);background:rgba(255,213,128,.12);color:#ffe3a8;font-size:10px;letter-spacing:.06em;text-transform:uppercase;font-weight:800}
.agent-lock-pill.muted{opacity:.82}
.agent-vm-status{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.10);font-size:11px;color:#d8fff3;background:rgba(255,255,255,.04)}
.agent-vm-status::before{content:"";width:7px;height:7px;border-radius:999px;background:#ff8c8c;box-shadow:0 0 10px rgba(255,140,140,.6)}
.agent-vm-status.awake::before{background:#7fe08f;box-shadow:0 0 10px rgba(127,224,143,.7)}
.agent-vm-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-bottom:10px}
.agent-vm-meta-item{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:9px;background:rgba(255,255,255,.03)}
.agent-vm-meta-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#7fcdb8;margin-bottom:4px}
.agent-vm-meta-value{font-size:12px;color:#edf8f4;line-height:1.45;word-break:break-word}
.agent-vm-workstation{border:1px solid rgba(255,255,255,.09);border-radius:16px;overflow:hidden;background:#111820}
.agent-vm-taskbar{display:flex;align-items:center;gap:6px;padding:7px;background:#c4c1b0;color:#111;border-bottom:2px solid #6f6a5e;overflow:auto}
.agent-vm-start{font-size:10px;font-weight:900;border:1px solid #333;background:#ece8d7;padding:5px 8px;border-radius:4px;white-space:nowrap}
.agent-vm-tab{font-size:10px;font-weight:800;border:1px solid #76705f;background:#d8d3bf;color:#111;padding:5px 8px;border-radius:4px;cursor:pointer;white-space:nowrap}
.agent-vm-tab.active{background:#273341;color:#eafff6;border-color:#40556a}
.agent-vm-screen{min-height:360px;background:#0d1720;color:#e9fff8;padding:12px}
.agent-vm-desktop{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}
.agent-vm-app-icon{min-height:82px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);border-radius:10px;color:#eafff7;cursor:pointer;padding:10px;display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;text-align:center}
.agent-vm-panel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.agent-vm-panel{border:1px solid rgba(255,255,255,.10);border-radius:12px;background:rgba(0,0,0,.24);padding:10px}
.agent-vm-panel-title{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#93ead0;margin-bottom:8px;font-weight:800}
.agent-vm-list{margin:0;padding-left:18px;color:#dceee9;font-size:12px;line-height:1.55}
.agent-vm-note{width:100%;min-height:250px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#fffdf1;color:#202018;padding:12px;font-family:var(--vscode-editor-font-family,Consolas,monospace);font-size:12px;line-height:1.55}
.agent-vm-terminal{min-height:250px;border-radius:10px;background:#030805;border:1px solid rgba(127,224,143,.22);padding:10px;font-family:var(--vscode-editor-font-family,Consolas,monospace);font-size:12px;color:#9dffb0;white-space:pre-wrap;overflow:auto}
.agent-vm-terminal-row{display:flex;gap:8px;margin-top:8px}
.agent-vm-terminal-row input,.agent-vm-ask-row input{flex:1;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.04);color:#f3fff9;padding:9px 10px}
.agent-vm-note[readonly],.agent-vm-terminal-row input[disabled]{opacity:.76;cursor:not-allowed}
.settings-lock-btn[disabled],.settings-toggle[disabled],.ghost-btn[disabled]{opacity:.48;cursor:not-allowed}
.agent-vm-chat{margin-top:10px;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:10px;background:rgba(255,255,255,.03)}
.agent-vm-log{display:flex;flex-direction:column;gap:6px;max-height:150px;overflow:auto;margin-bottom:8px}
.agent-vm-message{font-size:12px;line-height:1.45;border-radius:10px;padding:8px 9px;background:rgba(255,255,255,.04);color:#defff5}
.agent-vm-message.user{background:rgba(126,180,255,.12);color:#e7f1ff}
.agent-vm-message.system{background:rgba(255,207,121,.10);color:#ffe7aa}
.agent-vm-ask-row{display:flex;gap:8px}
.plugin-category-group{margin-bottom:18px}
.plugin-category-title{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#a89fbb;margin:0 0 10px}
.plugin-mesh-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;color:#bdb5ce}
.plugin-mesh-grid{display:grid;gap:8px}
.plugin-mesh-card{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px;background:rgba(255,255,255,.02)}
.plugin-mesh-name{font-size:13px;font-weight:600;color:#f2edff}
.plugin-mesh-meta{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#a69fba;margin-top:4px}
.plugin-mesh-status{font-size:11px;margin-top:6px}
.plugin-mesh-status.online{color:#7fe08f}
.plugin-mesh-status.warning{color:#ffcf79}
.plugin-mesh-status.offline{color:#ff8c8c}
.plugin-approval{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;padding:12px;border-radius:14px;border:1px solid rgba(255,207,121,.28);background:linear-gradient(180deg,rgba(72,52,18,.55),rgba(28,20,10,.72))}
.plugin-approval-title{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#ffd58a;font-weight:700}
.plugin-approval-copy{font-size:13px;color:#f7f0df;line-height:1.45}
.plugin-approval-meta{font-size:12px;color:#d8ceb2}
.plugin-approval-actions{display:flex;gap:8px;flex-wrap:wrap}
.plugin-approval-actions button{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.05);color:#fff;border-radius:10px;padding:8px 12px;cursor:pointer}
.plugin-approval-actions .approve{background:rgba(82,173,112,.18);border-color:rgba(82,173,112,.34)}
select,textarea{background:rgba(255,255,255,.04);color:#f3efff;border:1px solid rgba(255,255,255,.10);border-radius:12px}
select{padding:9px 10px;width:100%}
select option{background:#1b1628;color:#f4efff}
.workflow-dock{display:none}
.ui-version{display:none}
.control-strip{display:none;grid-template-columns:repeat(auto-fit,minmax(142px,1fr));gap:8px;margin-bottom:10px}
.control-strip button{min-height:34px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);color:#efe8ff;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;padding:8px 10px}
.control-strip button:hover{background:rgba(255,255,255,.075)}
.chat{flex:1;min-height:0;overflow-y:auto;padding:14px 14px 20px}
.message{display:flex;gap:12px;margin-bottom:18px}
.avatar{width:28px;height:28px;flex:0 0 28px;border-radius:999px;display:grid;place-items:center;font-size:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);color:#d4c4ff}
.avatar.user{color:#7fb8ff}
.avatar.agent{background:linear-gradient(180deg,rgba(177,124,255,.22),rgba(91,63,160,.10));border-color:rgba(177,124,255,.26)}
.message.progress-message{margin-bottom:12px}
.message.progress-message .avatar.agent{background:linear-gradient(180deg,rgba(91,209,255,.18),rgba(45,87,180,.10));border-color:rgba(91,209,255,.28)}
.bubble-wrap{flex:1;min-width:0}
.meta-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}
.sender{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px}
.sender.user{color:#8fc0ff}
.sender.agent{color:#ccafff}
.badge-prime{padding:2px 8px;border-radius:999px;background:rgba(165,109,255,.14);border:1px solid rgba(188,151,255,.18);font-size:10px;letter-spacing:.08em;color:#d8bfff}
.timestamp{font-size:11px;color:#9d96b3;white-space:nowrap}
.bubble{padding:0 0 0 2px;color:#ece8f7;line-height:1.6;font-size:14px}
.bubble.agent-card{padding:14px 16px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.015));box-shadow:0 14px 40px rgba(0,0,0,.18)}
.bubble.progress-card{padding:12px 14px;border:1px solid rgba(122,195,255,.18);border-radius:16px;background:linear-gradient(180deg,rgba(27,36,57,.72),rgba(15,20,32,.9));box-shadow:0 10px 24px rgba(0,0,0,.18);position:relative;overflow:hidden}
.bubble.progress-card::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(122,195,255,.14) 48%,transparent 100%);transform:translateX(-100%);animation:agentLeeScan 1.6s linear infinite}
.progress-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;position:relative;z-index:1}
.progress-label{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9fd0ff}
.progress-kind{font-size:10px;color:#d8efff;padding:3px 8px;border-radius:999px;border:1px solid rgba(159,208,255,.18);background:rgba(159,208,255,.08)}
.progress-file{font-size:12px;color:#f5fbff;font-family:var(--vscode-editor-font-family,Consolas,monospace);word-break:break-word;position:relative;z-index:1}
.progress-copy{font-size:12px;color:#cdd8e7;line-height:1.55;margin-top:6px;position:relative;z-index:1}
.progress-status{font-size:12px;color:#ece8f7;line-height:1.55}
.bubble p{margin:0 0 10px}
.bubble p:last-child{margin-bottom:0}
@keyframes agentLeeScan{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.section-label{display:flex;align-items:center;gap:8px;margin:16px 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;color:#cbc5d9;text-transform:uppercase}
.section-label:first-child{margin-top:0}
.plan-list{margin:0;padding-left:18px}
.plan-list li{margin:3px 0}
.status-list{display:flex;flex-direction:column;gap:6px}
.status-item{display:flex;align-items:center;gap:8px;color:#d7d2e5}
.status-dot{color:#7fe08f}
.code-card{margin-top:10px;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;background:#11111a}
.code-head{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;font-size:12px;color:#c8c2d7;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06)}
.code-body{padding:12px 14px;overflow:auto}
.code-body pre{margin:0;font-family:var(--vscode-editor-font-family,Consolas,monospace);font-size:12px;line-height:1.6;color:#dfe6ff}
.attachment-list{display:flex;flex-direction:column;gap:8px;margin:10px 0 0}
.attachment-item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);font-size:12px}
.hidden{display:none}
.composer{flex:none;padding:10px 12px 12px;background:linear-gradient(180deg,rgba(13,13,18,.4),rgba(13,13,18,.96) 24%,rgba(13,13,18,.99) 100%);border-top:1px solid rgba(255,255,255,.06)}
.composer-shell{border:1px solid rgba(158,110,255,.30);border-radius:16px;background:linear-gradient(180deg,rgba(32,22,48,.82),rgba(18,17,26,.96));box-shadow:0 24px 52px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.04);padding:10px 12px}
textarea{width:100%;min-height:82px;resize:none;padding:8px 2px 4px;border:0;background:transparent;color:#f6f2ff;outline:none}
textarea::placeholder{color:#8c859c}
.composer-bottom{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:6px}
.toolbelt{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.tool-link{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:#ddd0ff;font-size:12px;font-weight:600;padding:7px 10px;border-radius:10px;cursor:pointer}
.tool-link.icon-only{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;padding:0;font-size:16px;line-height:1}
.tool-icon{display:inline-flex;align-items:center;justify-content:center;transform:translateY(-1px)}
.composer-right{display:flex;align-items:center;gap:10px}
.bulk-accept-btn{display:none}
.bulk-accept-btn.visible{display:inline-flex}
.model-compact,.access-compact{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#f0e9ff;font-size:12px;padding:8px 10px;max-width:190px;border-radius:10px}
.access-compact{color:#b8ffbf;border-color:rgba(96,214,112,.35)}
.send-btn{min-width:82px;height:38px;border:0;border-radius:12px;background:linear-gradient(180deg,#aa69ff,#8e4af0);color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 10px 26px rgba(140,74,240,.42);padding:0 14px}
.footer{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:8px 16px 10px;font-size:11px;color:#8f879d}
.footer-right{color:#39d267;font-weight:700}
.muted{color:#9a92ac}
.status-line{font-size:12px;color:#cfc7e2;margin-bottom:8px}
.workflow-shell{margin-bottom:10px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.03);overflow:hidden}
.workflow-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:rgba(255,255,255,.02)}
.workflow-toggle{display:flex;align-items:center;gap:8px;background:transparent;border:0;color:#f3edff;font-size:12px;font-weight:700;cursor:pointer;padding:0}
.workflow-preview{font-size:11px;color:#bfb6d4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:50%}
.workflow-body{padding:12px;border-top:1px solid rgba(255,255,255,.06)}
.workflow-shell.collapsed .workflow-body{display:none}
.workflow-summary{font-size:12px;color:#ddd6ef;margin-bottom:10px}
.workflow-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.workflow-card{border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(10,10,18,.32);padding:10px}
.workflow-title{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#c7b8f2;margin-bottom:8px}
.todo-list,.activity-list,.proposal-list{display:flex;flex-direction:column;gap:8px}
.todo-item,.activity-item{border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,.02)}
.proposal-item{border:1px solid rgba(122,195,255,.12);border-radius:12px;padding:10px;background:linear-gradient(180deg,rgba(24,31,48,.65),rgba(15,19,29,.82))}
.proposal-item.approved{border-color:rgba(111,219,145,.22)}
.proposal-item.rejected{border-color:rgba(255,140,140,.2);opacity:.75}
.proposal-file{font-size:12px;color:#eef6ff;font-family:var(--vscode-editor-font-family,Consolas,monospace);word-break:break-word}
.proposal-summary{font-size:11px;color:#c5d0df;line-height:1.45;margin-top:6px}
.proposal-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;font-size:10px;color:#9ab0c8;text-transform:uppercase;letter-spacing:.06em}
.proposal-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.proposal-chip{padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)}
.todo-item.done{opacity:.72}
.todo-check{font-size:11px;font-weight:800;color:#8fd9a1;margin-right:8px}
.todo-item.pending .todo-check{color:#a99fc2}
.todo-item.active .todo-check{color:#9fd0ff}
.todo-text{font-size:12px;color:#f4eeff}
.todo-detail{font-size:11px;color:#a79fba;margin-top:4px}
.todo-item.done .todo-text{text-decoration:line-through}
.activity-label{font-size:12px;color:#efe8ff}
.activity-row{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.activity-open-btn{padding:4px 8px;font-size:11px}
.activity-file{font-size:11px;color:#98c3ff;word-break:break-all;margin-top:4px}
.activity-meta{font-size:10px;color:#998fb1;margin-top:3px}
.bubble-activity{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)}
.bubble-activity-label{font-size:11px;font-weight:700;color:#d7cff2;text-transform:uppercase;letter-spacing:.04em}
.bubble-activity-file{font-size:11px;color:#98c3ff;word-break:break-word;margin-top:3px}
.bubble-activity-detail{font-size:11px;color:#b7aecf;margin-top:4px}
.workflow-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 12px}
.workflow-editor{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.workflow-input{width:100%;min-height:72px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#f3edff;resize:vertical}
.workflow-parked{margin-top:10px;padding:8px 10px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.02);font-size:11px;color:#cfc5e4}
.mode-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.08);font-size:11px;color:#d5cced;background:rgba(255,255,255,.03)}
.history-drawer{display:none;flex-direction:column;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(16,15,26,.98),rgba(12,11,19,.94))}
.history-drawer.open{display:flex}
.history-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.history-list{display:flex;flex-direction:column;gap:8px;max-height:220px;overflow:auto}
.history-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);cursor:pointer;transition:border-color .15s ease,background .15s ease}
.history-item:hover{border-color:rgba(229,159,95,.38);background:rgba(229,159,95,.08)}
.history-item.active{border-color:rgba(229,159,95,.55);background:rgba(229,159,95,.12)}
.history-item-title{font-size:12px;color:#f4efe8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.history-item-meta{font-size:10px;color:#9a92ac;text-transform:uppercase;letter-spacing:.08em}
.history-empty{padding:12px;border-radius:14px;border:1px dashed rgba(255,255,255,.12);color:#b8b1c8;font-size:12px}
@media (max-width:700px){.meta-row{flex-direction:column;align-items:flex-start}.composer-bottom,.footer,.settings-row,.topbar,.settings-head,.hero-strip{flex-wrap:wrap}.composer-right{width:100%;justify-content:space-between}.model-compact,.access-compact{max-width:none}.conversation-title{max-width:220px}.workflow-grid{grid-template-columns:1fr}.workflow-preview{max-width:42%}.settings-layout{grid-template-columns:1fr}.settings-nav{overflow:auto}.hero-image{max-width:100%;width:100%}}
</style>
</head>
<body>
<div class="app-shell">
  <div class="topbar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true"><img src="${logoUri}" alt="" /></div>
      <div class="brand-copy">
        <div class="brand-title">Agent Lee Chat</div>
        <div class="conversation-title" id="conversationTitle">Current conversation</div>
      </div>
    </div>
    <div class="top-actions">
      <button class="icon-btn" id="historyBtn" aria-label="Open chat history" title="Open chat history">History</button>
      <button class="icon-btn" id="newChatBtn" aria-label="Start a new chat" title="Start a new chat">New Chat</button>
      <button class="icon-btn" id="settingsBtn" aria-label="Open Agent Lee settings" title="Open Agent Lee settings">Settings</button>
    </div>
  </div>
  <div class="history-drawer" id="historyDrawer">
    <div class="history-head">
      <div>
        <div class="settings-heading">Previous chats</div>
        <div class="settings-copy">Open an older thread any time. The panel still starts fresh by default.</div>
      </div>
      <button class="ghost-btn" id="closeHistoryBtn" aria-label="Close chat history" title="Close chat history">Close</button>
    </div>
    <div class="history-list" id="historyList"></div>
  </div>
  <div class="main">
    <div class="ui-version" id="uiVersion">AGENT_LEE_UI_VERSION = "${AGENT_LEE_UI_VERSION}"</div>
    <div class="settings-backdrop" id="settingsBackdrop" onclick="closeSettingsIfBackdrop(event)">
      <div class="settings" id="settingsPanel" role="dialog" aria-modal="true" aria-label="Agent Lee settings">
        <div class="settings-head">
          <div>
            <div class="settings-heading">Agent Lee settings</div>
            <div class="settings-subcopy">Keep the primary chat clean and put environment preferences here, with Agent Lee's deeper runtime controls tucked underneath.</div>
          </div>
          <div class="settings-row">
            <button class="ghost-btn" onclick="toggleSettings(false)">Close</button>
            <button class="ghost-btn" id="completeOnboardingBtn" onclick="completeOnboarding()">Save Settings</button>
          </div>
        </div>
        <div class="settings-layout">
          <div class="settings-nav" id="settingsNav">
            <button type="button" class="active" onclick="switchSettingsSection('general')"><span class="settings-nav-icon">&#9881;</span><span>General</span></button>
            <button type="button" onclick="switchSettingsSection('configuration')"><span class="settings-nav-icon">&#9968;</span><span>Configuration</span></button>
            <button type="button" onclick="switchSettingsSection('personalization')"><span class="settings-nav-icon">&#9684;</span><span>Personalization</span></button>
            <button type="button" onclick="switchSettingsSection('mcp')"><span class="settings-nav-icon">&#8984;</span><span>MCP servers</span></button>
            <button type="button" onclick="switchSettingsSection('agents')"><span class="settings-nav-icon">&#129302;</span><span>Agents</span></button>
            <button type="button" onclick="switchSettingsSection('usage')"><span class="settings-nav-icon">&#9719;</span><span>Usage</span></button>
            <button type="button" onclick="switchSettingsSection('plugins')"><span class="settings-nav-icon">&#9673;</span><span>Plugins</span></button>
          </div>
          <div class="settings-content">
        <div class="settings-grid">
          <div class="settings-section active" id="settingsSection-general">
          <div class="settings-card">
            <div class="settings-list">
              <div class="settings-item">
                <div class="settings-item-main">
                  <div class="settings-item-label">Agent environment</div>
                  <div class="settings-item-copy">Choose where the agent runs on Windows.</div>
                </div>
                <div class="settings-item-value">
                  <select class="settings-select" id="agentEnvironment" onchange="setAgentEnvironment(this.value)">
                    <option value="windows-native">Windows native</option>
                  </select>
                </div>
              </div>
              <div class="settings-item">
                <div class="settings-item-main">
                  <div class="settings-item-label">Language</div>
                  <div class="settings-item-copy">Choose the language for the app UI.</div>
                </div>
                <div class="settings-item-value">
                  <select class="settings-select" id="appLanguage" onchange="setAppLanguage(this.value)">
                    <option value="auto">Auto Detect</option>
                  </select>
                </div>
              </div>
              <div class="settings-item">
                <div class="settings-item-main">
                  <div class="settings-item-label">Require ^ + enter to send long prompts</div>
                  <div class="settings-item-copy">When enabled, multiline prompts require ^ + enter to send.</div>
                </div>
                <div class="settings-item-value">
                  <input type="checkbox" class="settings-toggle" id="requireCtrlEnterToggle" onchange="setRequireCtrlEnter(this.checked)" />
                </div>
              </div>
              <div class="settings-item">
                <div class="settings-item-main">
                  <div class="settings-item-label">Speed</div>
                  <div class="settings-item-copy">Choose how quickly inference runs across chats and compaction.</div>
                </div>
                <div class="settings-item-value">
                  <select class="settings-select" id="inferenceSpeed" onchange="setInferenceSpeed(this.value)">
                    <option value="standard">Standard</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>
              <div class="settings-item">
                <div class="settings-item-main">
                  <div class="settings-item-label">Follow-up behavior</div>
                  <div class="settings-item-copy">Queue follow-ups while Agent Lee runs or steer the current run.</div>
                  <div class="settings-footnote">Press Ctrl+Enter to do the opposite for one message.</div>
                </div>
                <div class="settings-item-value">
                  <div class="settings-segment" id="followupBehavior">
                    <button type="button" onclick="setFollowupBehavior('queue')">Queue</button>
                    <button type="button" class="active" onclick="setFollowupBehavior('steer')">Steer</button>
                  </div>
                </div>
              </div>
              <div class="settings-item">
                <div class="settings-item-main">
                  <div class="settings-item-label">Code review</div>
                  <div class="settings-item-copy">Start review in the current chat or launch a separate review chat.</div>
                </div>
                <div class="settings-item-value">
                  <div class="settings-segment" id="codeReviewBehavior">
                    <button type="button" class="active" onclick="setCodeReviewBehavior('inline')">Inline</button>
                    <button type="button" onclick="setCodeReviewBehavior('detached')">Detached</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div class="settings-section" id="settingsSection-configuration">
          <div class="settings-card" style="margin-bottom:14px">
            <div class="settings-title">Conversation Control</div>
            <div class="settings-copy">These settings shape how Agent Lee plans, approves, and routes the main work.</div>
            <div class="settings-tools-grid">
              <div class="model-card">
                <div class="model-label">Work Mode</div>
                <select id="workModeSettings" onchange="setWorkMode(this.value)">
                  <option value="execute">Execute</option>
                  <option value="plan">Plan</option>
                  <option value="ask">Ask</option>
                </select>
              </div>
              <div class="model-card">
                <div class="model-label">Approval</div>
                <select id="approvalSettings" onchange="setApproval(this.value)">
                  <option value="safe">Default</option>
                  <option value="balanced">Balanced</option>
                  <option value="full">Full</option>
                </select>
              </div>
              <div class="model-card">
                <div class="model-label">Auto-run staged plans</div>
                <label class="settings-row" style="gap:8px;align-items:center">
                  <input type="checkbox" class="settings-toggle" id="autoRunStagedPlansToggle" onchange="setAutoRunStagedPlans(this.checked)" />
                  <span class="muted">Run immediately after planning</span>
                </label>
                <div class="model-status" id="autoRunStagedPlansHint">Off by default. Full access is only needed for automatic execution.</div>
              </div>
              <div class="model-card">
                <div class="model-label">Primary Model</div>
                <select id="primaryModelSettings" onchange="setPrimaryModel(this.value)"></select>
              </div>
            </div>
          </div>
          <div class="settings-card">
            <div class="settings-title">Agent Tools</div>
            <div class="settings-copy">These are the real Agent Lee runtime controls, models, and diagnostics that power the sidebar.</div>
            <div class="settings-tools-grid">
              <div class="model-card">
                <div class="model-label">Builder Model</div>
                <select id="builderModel" onchange="setRoleModel('builderModel', this.value)"></select>
                <div class="model-status" id="builderStatus">Waiting for Ollama...</div>
              </div>
              <div class="model-card">
                <div class="model-label">Designer/UX Model</div>
                <select id="designerModel" onchange="setRoleModel('designerModel', this.value)"></select>
                <div class="model-status" id="designerStatus">Waiting for Ollama...</div>
              </div>
              <div class="model-card">
                <div class="model-label">Verifier Model</div>
                <select id="verifierModel" onchange="setRoleModel('verifierModel', this.value)"></select>
                <div class="model-status" id="verifierStatus">Waiting for Ollama...</div>
              </div>
            </div>
          </div>
          <div class="settings-card" style="margin-top:14px">
            <div class="settings-title">Runtime Controls</div>
            <div class="settings-copy">Keep the deeper runtime switches here so Agent Lee can change behavior immediately when you flip them.</div>
            <div class="settings-row" style="margin-bottom:10px">
              <button class="ghost-btn" id="webBtn" onclick="toggleWeb()">Web Off</button>
              <button class="ghost-btn" id="browserVisualBtn" onclick="toggleBrowserVisual()">Visual Browser On</button>
              <button class="ghost-btn" id="browserCursorBtn" onclick="toggleBrowserCursor()">Show Cursor On</button>
            </div>
            <div class="settings-row" style="margin-bottom:10px">
              <button class="ghost-btn" onclick="setPerformanceProfile('quiet_laptop')">Quiet Laptop</button>
              <button class="ghost-btn" onclick="setPerformanceProfile('balanced')">Balanced</button>
              <button class="ghost-btn" onclick="setPerformanceProfile('performance')">Performance</button>
            </div>
            <div class="settings-row">
              <label class="muted" for="browserSlowMo">Browser slow motion</label>
              <select id="browserSlowMo" onchange="setBrowserSlowMo(this.value)" style="max-width:120px">
                <option value="100">100ms</option>
                <option value="250">250ms</option>
                <option value="400">400ms</option>
                <option value="700">700ms</option>
              </select>
            </div>
          </div>
          </div>
          <div class="settings-section" id="settingsSection-personalization">
          <div class="settings-card">
            <div class="settings-title">Voice And Style</div>
            <div class="settings-copy">Shape how Agent Lee sounds and whether voice output is active in the sidebar.</div>
            <div class="settings-tools-grid">
              <div class="model-card">
                <div class="model-label">Voice Output</div>
                <div class="settings-row">
                  <button class="ghost-btn" id="voiceBtn" onclick="toggleVoice()">Voice On</button>
                  <button class="ghost-btn" onclick="stopVoice()">Stop Voice</button>
                </div>
              </div>
              <div class="model-card">
                <div class="model-label">Voice Style</div>
                <select id="voiceStyle" onchange="setVoiceStyle(this.value)">
                  <option value="neutral">Neutral</option>
                  <option value="grounded">Grounded</option>
                  <option value="highFlow">High Flow</option>
                  <option value="storyMode">Story Mode</option>
                </select>
              </div>
              <div class="model-card">
                <div class="model-label">Speech Send Shortcut</div>
                <div class="settings-copy">Match your prompt sending style to how you like to compose.</div>
                <input type="checkbox" class="settings-toggle" id="requireCtrlEnterToggleSecondary" onchange="setRequireCtrlEnter(this.checked)" />
              </div>
            </div>
          </div>
          </div>
          <div class="settings-section" id="settingsSection-mcp">
          <div class="settings-card">
            <div class="mcp-toolbar">
              <div>
                <div class="mcp-toolbar-title">MCP servers</div>
                <div class="mcp-toolbar-copy">Connect external tools and data sources.</div>
              </div>
              <button class="mcp-add-btn" onclick="addMcpServer()">+ Add server</button>
            </div>
            <div class="mcp-server-list" id="mcpServerList"></div>
            <div class="settings-row" style="margin-top:12px">
              <span class="runtime-pill" id="workspaceBadge">Workspace: checking...</span>
              <span class="runtime-pill" id="voiceStatus">Voice: checking...</span>
              <span class="runtime-pill" id="hiveStatus">Hive: checking...</span>
            </div>
          </div>
          </div>
          <div class="settings-section" id="settingsSection-agents">
          <div class="settings-card">
            <div class="mcp-toolbar">
              <div>
                <div class="mcp-toolbar-title">Agents</div>
                <div class="mcp-toolbar-copy">Enable specialist agents and configure how Agent Lee treats them in the runtime.</div>
              </div>
              <button class="mcp-add-btn" onclick="addAgent()">+ Add agent</button>
            </div>
            <div class="mcp-server-list" id="agentList"></div>
          </div>
          </div>
          <div class="settings-section" id="settingsSection-usage">
          <div class="settings-card">
            <div class="settings-title">Usage</div>
            <div class="settings-copy">Usage, evidence, and help surfaces live here so you can audit what Agent Lee actually did.</div>
            <div class="settings-row">
              <button class="ghost-btn" onclick="openReadme()">Open Help</button>
            </div>
            <div class="settings-copy" id="evidenceStatus" style="margin-top:10px">Repair report path will appear here after front-end analysis or creation.</div>
          </div>
          </div>
          <div class="settings-section" id="settingsSection-plugins">
          <div class="settings-card">
            <div class="settings-title">Plugins</div>
            <div class="settings-copy">Select plugins Agent Lee should treat as connected capabilities for deeper workflows.</div>
            <div id="pluginCatalogRoot"></div>
          </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>

    <div class="agent-vm-backdrop" id="agentVmBackdrop" onclick="closeAgentVmIfBackdrop(event)">
      <div class="agent-vm-modal" id="agentVmPanel" role="dialog" aria-modal="true" aria-label="AX Agent Lee diagnostics monitor">
        <div class="agent-vm-head">
          <div>
            <div class="agent-vm-title" id="agentVmTitle">AX Agent Lee Monitor</div>
            <div class="agent-vm-subtitle" id="agentVmSubtitle">Select a subordinate agent to inspect its diagnostics, memory, and exposed work surfaces.</div>
          </div>
          <div class="agent-vm-actions">
            <span class="agent-vm-status" id="agentVmStatus">Paused</span>
            <span class="agent-lock-pill muted" id="agentVmLockPill" style="display:none">Observed Only</span>
            <button class="ghost-btn" id="agentVmWakeBtn" onclick="wakeCurrentAgentVm()">Enable AX</button>
            <button class="ghost-btn" id="agentVmPauseBtn" onclick="stopCurrentAgentVm()">Pause AX</button>
            <button class="ghost-btn" onclick="closeAgentVm()">Close</button>
          </div>
        </div>
        <div class="agent-vm-meta" id="agentVmMeta"></div>
        <div class="agent-vm-workstation">
          <div class="agent-vm-taskbar" id="agentVmTaskbar"></div>
          <div class="agent-vm-screen" id="agentVmScreen"></div>
        </div>
        <div class="agent-vm-chat">
          <div class="agent-vm-panel-title">Ask Through Agent Lee</div>
          <div class="agent-vm-log" id="agentVmLog"></div>
          <div class="agent-vm-ask-row">
            <input id="agentVmAskInput" placeholder="Ask about this subordinate agent. Agent Lee remains the final speaker." onkeydown="if(event.key==='Enter') askCurrentAgentVm()" />
            <button class="ghost-btn" onclick="askCurrentAgentVm()">Route Ask</button>
          </div>
        </div>
      </div>
    </div>

    <div class="workflow-dock">
      <div class="control-strip" aria-label="Agent Lee engineering controls">
        <button type="button" data-ui-action="engineerTask">Engineer Task</button>
        <button type="button" data-ui-action="runtimeStatus">Runtime Status</button>
        <button type="button" data-ui-action="scanSelf">Scan Agent Lee Self</button>
        <button type="button" data-ui-action="verifySelf">Verify Agent Lee Self</button>
        <button type="button" data-ui-action="askLocalModel">Ask Local Model</button>
        <button type="button" data-ui-action="scanWorkspace">Scan Workspace</button>
        <button type="button" data-ui-action="verifyWorkspace">Verify Workspace</button>
        <button type="button" data-ui-action="openReceipts">Open Receipts</button>
      </div>
      <div class="workflow-shell" id="workflowShell">
        <div class="workflow-head">
          <button class="workflow-toggle" onclick="toggleTaskPanel()"><span id="workflowChevron">&#9656;</span><span id="workflowTitle">Task Tracker</span></button>
          <div class="workflow-preview" id="workflowPreview">Waiting for a new task.</div>
        </div>
        <div class="workflow-body" id="workflowBody">
          <div class="mode-pill" id="workflowMode">Mode: Execute</div>
          <div class="workflow-summary" id="workflowSummary">I will show the plan and live to-dos here.</div>
          <div class="workflow-actions" id="workflowActions"></div>
          <div class="workflow-editor">
            <textarea class="workflow-input" id="workflowPromptEditor" placeholder="Current task prompt will appear here so you can edit it or redirect Agent Lee."></textarea>
          </div>
          <div class="workflow-grid">
            <div class="workflow-card">
              <div class="workflow-title">Live Work</div>
              <div class="todo-list" id="todoList"></div>
            </div>
            <div class="workflow-card">
              <div class="workflow-title">Live Activity</div>
              <div class="activity-list" id="activityList"></div>
            </div>
            <div class="workflow-card">
              <div class="workflow-title">Proposed Edits</div>
              <div class="proposal-list" id="proposalList"></div>
            </div>
            <div class="workflow-card">
              <div class="workflow-title">Plugin Mesh</div>
              <div class="plugin-mesh-head">
                <span id="pluginMeshCount">0 active</span>
                <span id="pluginMeshMode">Governed routing</span>
              </div>
              <div class="plugin-mesh-grid" id="pluginMeshGrid"></div>
            </div>
          </div>
          <div class="workflow-parked" id="workflowParked">No paused task parked right now.</div>
        </div>
      </div>
    </div>

    <div class="chat" id="chat"></div>

    <div class="composer">
      <div class="status-line" id="status">Getting the room set...</div>
        <div class="composer-shell">
        <div class="plugin-approval hidden" id="pluginApproval">
          <div class="plugin-approval-title">Plugin approval required</div>
          <div class="plugin-approval-copy" id="pluginApprovalCopy">Hey yo, I'm waiting on your permission before I push this through.</div>
          <div class="plugin-approval-meta" id="pluginApprovalMeta"></div>
          <div class="plugin-approval-actions">
            <button type="button" class="approve" onclick="approvePluginCall()">Approve Once</button>
            <button type="button" onclick="cancelPluginCall()">Cancel</button>
          </div>
        </div>
        <textarea id="input" placeholder="Ask Agent Lee anything..."></textarea>
        <div class="attachment-list hidden" id="attachmentList"></div>
        <div class="composer-bottom">
          <div class="toolbelt">
            <button class="tool-link icon-only" onclick="pickAttachments()" aria-label="Attach files" title="Attach files"><span class="tool-icon">&#128206;</span></button>
            <button class="tool-link icon-only" onclick="mic()" aria-label="Microphone input" title="Microphone input"><span class="tool-icon">&#127908;</span></button>
            <button class="tool-link" id="voiceToggleBtn" data-enabled="true" onclick="toggleVoiceOutput()" aria-label="Toggle speech" title="Mute speech">Mute</button>
            <div class="muted" id="attachmentMeta">Text, image, audio, and mic input ready.</div>
          </div>
          <div class="composer-right">
            <select id="workMode" class="access-compact" onchange="setWorkMode(this.value)" aria-label="Work mode" title="Work mode">
              <option value="execute">MODE: EXECUTE</option>
              <option value="plan">MODE: PLAN</option>
              <option value="ask">MODE: ASK</option>
            </select>
            <button class="ghost-btn bulk-accept-btn" id="acceptAllEditsBtn" onclick="approveAllProposedEditsFromUi()" aria-label="Accept all pending edits" title="Accept all pending edits">Accept All</button>
            <select id="approval" class="access-compact" onchange="setApproval(this.value)">
              <option value="safe">ACCESS: DEFAULT</option>
              <option value="balanced">ACCESS: BALANCED</option>
              <option value="full">ACCESS: FULL</option>
            </select>
            <select id="primaryModel" class="model-compact" onchange="setPrimaryModel(this.value)">
              <option value="${runtimeState.primaryModel || "qwen2.5-coder:7b"}">MODEL: ${runtimeState.primaryModel || "qwen2.5-coder:7b"}</option>
              <option value="qwen2.5-coder:14b">MODEL: qwen2.5-coder:14b</option>
              <option value="qwen2.5-coder:7b">MODEL: qwen2.5-coder:7b</option>
              <option value="deepseek-coder-v2:16b">MODEL: deepseek-coder-v2:16b</option>
              <option value="llama3.1:8b">MODEL: llama3.1:8b</option>
            </select>
            <button class="send-btn" onclick="send()" aria-label="Send message" title="Send message">Send</button>
          </div>
        </div>
      </div>
      <div class="footer">
        <div>Agent Lee enforces LeeWay Standards in every response.</div>
        <div class="footer-right">Local private runtime</div>
      </div>
    </div>
  </div>
</div>

<script>
const vscode = acquireVsCodeApi();
const roleIds = {
  builder_model: ["builderModel", "builderStatus"],
  designer_ux_model: ["designerModel", "designerStatus"],
  verifier_model: ["verifierModel", "verifierStatus"]
};
const pluginCatalog = ${JSON.stringify(DEFAULT_PLUGIN_CATALOG)};
const defaultMcpServerCatalog = ${JSON.stringify(DEFAULT_MCP_SERVER_CATALOG)};
const defaultAgentCatalog = ${JSON.stringify(DEFAULT_AGENT_CATALOG)};
let attachmentMetaTimer = null;
let workflowCollapsed = true;
let latestTaskState = null;
let currentAgentVm = null;
let currentAgentVmApp = "desktop";
const agentVmSessions = {};
let latestAgentVmMemory = {};

function normalizeVmSlug(value){
  return String(value || "agent").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") || "agent";
}

function fallbackVmIdentity(entry, catalogKind){
  const slug = normalizeVmSlug(entry && entry.id ? entry.id : "agent");
  const isMcp = catalogKind === "mcp";
  return {
    kind: isMcp ? "leeway-mcp-agent" : "leeway-agent",
    realName: entry && entry.name ? entry.name : slug,
    family: isMcp ? "LeeWay MCP Family" : "LeeWay Agent Family",
    lineage: isMcp ? "Agent Lee Prime > MCP Wing > Custom Branch" : "Agent Lee Prime > Agent Wing > Custom Branch",
    duties: [entry && entry.description ? entry.description : "Custom LeeWay runtime support."],
    authorities: ["Operate only through Agent Lee governance.", "Write visible notes, logs, and receipts.", "Request confirmation for protected actions."],
    vmAddress: "vm://leeway/" + (isMcp ? "mcp" : "agent") + "/" + slug,
    notepadPath: "workspace/agents/" + slug + "/notes/" + slug + ".md",
    databasePath: "memory/agents/" + slug + "/events.jsonl",
    heartbeat: slug + "-heartbeat"
  };
}

function agentVmMemoryLedgerPath(vm){
  const slug = normalizeVmSlug(vm && vm.id ? vm.id : "agent");
  return "memory/agents/" + slug + "/events.jsonl";
}

function vmDeveloperSurface(vm){
  return vm && vm.identity && vm.identity.developerSurface ? vm.identity.developerSurface : "mutable";
}

function vmIsObservedOnly(vm){
  return vmDeveloperSurface(vm) === "observed-only";
}

function vmLockReason(vm){
  if(!vm || !vm.identity) return "This Agent VM is protected by LeeWay governance.";
  return vm.identity.lockReason || "This Agent VM is protected by LeeWay governance and cannot be directly reconfigured.";
}

function withVmIdentity(entry, catalogKind){
  const fallback = fallbackVmIdentity(entry, catalogKind);
  const identity = Object.assign({}, fallback, entry.identity || {});
  return Object.assign({}, entry, { identity: identity, catalogKind: catalogKind });
}

function getAgentVmEntry(catalogKind, id){
  const state = window.agentLeeRuntimeState || {};
  const list = catalogKind === "mcp" ? getMcpCatalog(state) : getAgentCatalog(state);
  return list.find(function(entry){ return entry.id === id; }) || null;
}

function openAgentVmFromEncoded(catalogKind, encodedId){
  openAgentVm(catalogKind, decodeURIComponent(encodedId));
}

function agentVmButton(catalogKind, id){
  return '<button class="agent-vm-btn" onclick="openAgentVmFromEncoded(\\''+catalogKind+'\\',\\''+encodeURIComponent(id)+'\\')" title="Open AX Agent Lee diagnostics" aria-label="Open AX Agent Lee diagnostics">&#128421;</button>';
}

function agentVmKey(vm){
  return vm.catalogKind + ":" + vm.id;
}

function vmEnabled(vm){
  const state = window.agentLeeRuntimeState || {};
  const key = vm.catalogKind === "mcp" ? "enabledMcpServers" : "enabledAgents";
  const list = state[key] || [];
  const session = agentVmSessions[agentVmKey(vm)];
  return list.indexOf(vm.id) !== -1 || !!(session && session.awake);
}

function recordAgentVmEvent(kind, detail){
  if(!currentAgentVm) return;
  const session = ensureAgentVmSession(currentAgentVm);
  const identity = currentAgentVm.identity;
  const event = {
    ts: new Date().toISOString(),
    kind: kind,
    detail: detail || "",
    agentId: currentAgentVm.id,
    agentName: currentAgentVm.name,
    realName: identity.realName,
    app: currentAgentVmApp,
    memoryLedgerPath: agentVmMemoryLedgerPath(currentAgentVm),
    configuredDatabasePath: identity.databasePath,
    route: "Agent Lee -> AX Agent Lee -> Agent Lee",
    speakerOrder: "Agent Lee first and last"
  };
  session.events = (session.events || []).concat([event]).slice(-80);
  vscode.postMessage({command:"agentVmDiagnosticEvent", event:event});
}

function ensureAgentVmSession(vm){
  const key = agentVmKey(vm);
  if(!agentVmSessions[key]){
    const identity = vm.identity;
    agentVmSessions[key] = {
      awake: vmEnabled(vm),
      notepad: "# AX Agent Lee Notepad: " + identity.realName + "\\n\\nIdentity: " + vm.name + "\\nAddress: " + identity.vmAddress + "\\nLineage: " + identity.lineage + "\\nSpeaker order: Agent Lee first and last.\\nMemory ledger: " + agentVmMemoryLedgerPath(vm) + "\\n\\nCurrent notes:\\n- Diagnostics monitor opened.\\n- Developer may inspect notepad, terminal, workspace, database, and diagnostics surfaces.\\n",
      terminal: [
        "AX_AGENT_LEE_BOOT " + identity.vmAddress,
        "identity=" + identity.realName,
        "family=" + identity.family,
        "heartbeat=" + identity.heartbeat,
        "speaker_order=agent_lee_first_and_last",
        "memory_ledger=" + agentVmMemoryLedgerPath(vm)
      ],
      messages: [
        { role: "system", content: "Agent Lee opened " + identity.realName + " as an AX subordinate diagnostics surface. Status follows the enabled switch until manually paused or enabled." }
      ],
      events: [
        {
          ts: new Date().toISOString(),
          kind: "monitor-opened",
          detail: "AX Agent Lee diagnostics surface opened.",
          memoryLedgerPath: agentVmMemoryLedgerPath(vm)
        }
      ]
    };
  }
  return agentVmSessions[key];
}

function vmKindLabel(identity){
  return identity.kind === "leeway-mcp-agent" ? "AX Agent Lee MCP Agent" : "AX Agent Lee Agent";
}

function openAgentVm(catalogKind, id){
  const entry = getAgentVmEntry(catalogKind, id);
  if(!entry) return;
  currentAgentVm = entry;
  currentAgentVmApp = "desktop";
  ensureAgentVmSession(entry);
  recordAgentVmEvent("monitor-opened", "AX Agent Lee diagnostics monitor opened.");
  renderAgentVm();
  const backdrop=document.getElementById("agentVmBackdrop");
  if(backdrop) backdrop.classList.add("open");
}

function closeAgentVm(){
  const backdrop=document.getElementById("agentVmBackdrop");
  if(backdrop) backdrop.classList.remove("open");
}

function closeAgentVmIfBackdrop(event){
  if(event.target && event.target.id==="agentVmBackdrop") closeAgentVm();
}

function setAgentVmEnabled(vm, enabled){
  if(vmIsObservedOnly(vm)){
    window.alert(vmLockReason(vm));
    return;
  }
  const state = window.agentLeeRuntimeState || {};
  const key = vm.catalogKind === "mcp" ? "enabledMcpServers" : "enabledAgents";
  const next = new Set(state[key] || []);
  if(enabled) next.add(vm.id); else next.delete(vm.id);
  state[key] = Array.from(next);
  window.agentLeeRuntimeState = state;
  vscode.postMessage({command:"setState", key:key, value:state[key]});
  if(vm.catalogKind === "mcp") renderMcpServers(state); else renderAgents(state);
}

function wakeCurrentAgentVm(){
  if(!currentAgentVm) return;
  if(vmIsObservedOnly(currentAgentVm)){
    const session = ensureAgentVmSession(currentAgentVm);
    session.terminal.push("protected-control-blocked enable");
    session.messages.push({ role:"system", content: vmLockReason(currentAgentVm) });
    recordAgentVmEvent("protected-control-blocked", "enable");
    renderAgentVm();
    return;
  }
  const session = ensureAgentVmSession(currentAgentVm);
  session.awake = true;
  session.terminal.push("enable-ax " + currentAgentVm.identity.realName + " -> ACTIVE");
  session.messages.push({ role:"system", content: currentAgentVm.identity.realName + " is active as AX Agent Lee support under Agent Lee governance." });
  recordAgentVmEvent("enabled", currentAgentVm.identity.realName + " enabled as AX Agent Lee support.");
  setAgentVmEnabled(currentAgentVm, true);
  renderAgentVm();
}

function stopCurrentAgentVm(){
  if(!currentAgentVm) return;
  if(vmIsObservedOnly(currentAgentVm)){
    const session = ensureAgentVmSession(currentAgentVm);
    session.terminal.push("protected-control-blocked pause");
    session.messages.push({ role:"system", content: vmLockReason(currentAgentVm) });
    recordAgentVmEvent("protected-control-blocked", "pause");
    renderAgentVm();
    return;
  }
  const session = ensureAgentVmSession(currentAgentVm);
  session.awake = false;
  session.terminal.push("pause-ax " + currentAgentVm.identity.realName + " -> PAUSED");
  session.messages.push({ role:"system", content: currentAgentVm.identity.realName + " has been paused. Enable AX before assigning new work." });
  recordAgentVmEvent("paused", currentAgentVm.identity.realName + " paused as AX Agent Lee support.");
  setAgentVmEnabled(currentAgentVm, false);
  renderAgentVm();
}

function openAgentVmApp(app){
  currentAgentVmApp = app;
  recordAgentVmEvent("app-opened", app);
  renderAgentVm();
}

function renderAgentVmMeta(vm, awake){
  const identity = vm.identity;
  const meta=document.getElementById("agentVmMeta");
  if(!meta) return;
  const items = [
    ["Real name", identity.realName],
    ["Class", vmKindLabel(identity)],
    ["Family", identity.family],
    ["Lineage", identity.lineage],
    ["AX address", identity.vmAddress],
    ["Heartbeat", awake ? identity.heartbeat + " active" : identity.heartbeat + " paused"],
    ["Speaker order", "Agent Lee first and last"],
    ["Memory ledger", agentVmMemoryLedgerPath(vm)]
  ];
  meta.innerHTML = items.map(function(item){
    return '<div class="agent-vm-meta-item"><div class="agent-vm-meta-label">'+escapeHtml(item[0])+'</div><div class="agent-vm-meta-value">'+escapeHtml(item[1])+'</div></div>';
  }).join("");
}

function renderAgentVmTaskbar(){
  const bar=document.getElementById("agentVmTaskbar");
  if(!bar) return;
  const apps = [
    ["desktop","Desktop"],
    ["workspace","Workspace"],
    ["browser","Web Search"],
    ["notepad","Notepad"],
    ["database","Database"],
    ["diagnostics","Diagnostics"],
    ["terminal","Terminal"]
  ];
  bar.innerHTML = '<button class="agent-vm-start" onclick="openAgentVmApp(\\'desktop\\')">AX</button>' + apps.map(function(app){
    return '<button class="agent-vm-tab '+(currentAgentVmApp===app[0]?'active':'')+'" onclick="openAgentVmApp(\\''+app[0]+'\\')">'+escapeHtml(app[1])+'</button>';
  }).join("");
}

function renderAgentVmList(title, list){
  return '<div class="agent-vm-panel"><div class="agent-vm-panel-title">'+escapeHtml(title)+'</div><ul class="agent-vm-list">'+(list || []).map(function(item){ return '<li>'+escapeHtml(item)+'</li>'; }).join("")+'</ul></div>';
}

function renderAgentVmScreen(){
  if(!currentAgentVm) return;
  const vm = currentAgentVm;
  const identity = vm.identity;
  const session = ensureAgentVmSession(vm);
  const screen=document.getElementById("agentVmScreen");
  if(!screen) return;
  const awake = vmEnabled(vm);
  if(currentAgentVmApp === "desktop"){
    screen.innerHTML = '<div class="agent-vm-panel-grid">'
      + renderAgentVmList("Duties", identity.duties)
      + renderAgentVmList("Authorities", identity.authorities)
      + '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Runtime</div><div class="agent-vm-meta-value">Status: '+escapeHtml(awake ? "Active" : "Paused")+'<br>Route: Agent Lee -> AX Agent Lee -> Agent Lee<br>Address: '+escapeHtml(identity.vmAddress)+'<br>Notepad: '+escapeHtml(identity.notepadPath)+'<br>Memory ledger: '+escapeHtml(agentVmMemoryLedgerPath(vm))+'</div></div>'
      + '</div><div class="agent-vm-desktop" style="margin-top:12px">'
      + ["workspace","browser","notepad","database","diagnostics","terminal"].map(function(app){
        const label = app === "workspace" ? "Workspace" : app.charAt(0).toUpperCase()+app.slice(1);
        return '<button class="agent-vm-app-icon" onclick="openAgentVmApp(\\''+app+'\\')"><span style="font-size:24px">&#9635;</span><span>'+escapeHtml(label)+'</span></button>';
      }).join("")
      + '</div>';
    return;
  }
  if(currentAgentVmApp === "workspace"){
    screen.innerHTML = '<div class="agent-vm-panel-grid">'
      + '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Exposed Workspace</div><ul class="agent-vm-list"><li>'+escapeHtml(identity.notepadPath)+'</li><li>'+escapeHtml(agentVmMemoryLedgerPath(vm))+'</li><li>workspace/agents/'+escapeHtml(vm.id)+'/receipts/latest.md</li><li>workspace/agents/'+escapeHtml(vm.id)+'/reports/status.md</li></ul></div>'
      + '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Profile</div><div class="agent-vm-meta-value">Name: '+escapeHtml(identity.realName)+'<br>Class: '+escapeHtml(vmKindLabel(identity))+'<br>Family: '+escapeHtml(identity.family)+'<br>Lineage: '+escapeHtml(identity.lineage)+'</div></div>'
      + '</div>';
    return;
  }
  if(currentAgentVmApp === "browser"){
    screen.innerHTML = '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Web Search Bridge</div><div class="agent-vm-meta-value">Search authority is governed. Ask through Agent Lee what to search, and the approved lookup can route through the main runtime.<br><br>Suggested query: '+escapeHtml(vm.name + " " + identity.family + " duties")+'</div></div>';
    return;
  }
  if(currentAgentVmApp === "notepad"){
    const readOnly = vmIsObservedOnly(vm);
    screen.innerHTML = (readOnly ? '<div class="agent-vm-panel" style="margin-bottom:10px"><div class="agent-vm-panel-title">Protected Surface</div><div class="agent-vm-meta-value">'+escapeHtml(vmLockReason(vm))+'</div></div>' : '')
      + '<textarea class="agent-vm-note" id="agentVmNote" '+(readOnly ? 'readonly' : 'oninput="saveAgentVmNote(this.value)"')+'>'+escapeHtml(session.notepad)+'</textarea>';
    return;
  }
  if(currentAgentVmApp === "database"){
    screen.innerHTML = '<div class="agent-vm-panel-grid">'
      + '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Agent Memory Database</div><ul class="agent-vm-list"><li>id: '+escapeHtml(vm.id)+'</li><li>real_name: '+escapeHtml(identity.realName)+'</li><li>class: '+escapeHtml(vmKindLabel(identity))+'</li><li>enabled: '+escapeHtml(awake ? "true" : "false")+'</li><li>ledger_path: '+escapeHtml(agentVmMemoryLedgerPath(vm))+'</li><li>configured_db_path: '+escapeHtml(identity.databasePath)+'</li><li>hive_link: memory/agent-lee/memory.jsonl</li></ul></div>'
      + '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Proof Records</div><ul class="agent-vm-list">'+session.messages.slice(-6).map(function(message){ return '<li>'+escapeHtml(message.role.toUpperCase()+": "+message.content)+'</li>'; }).join("")+'</ul></div>'
      + '</div>';
    return;
  }
  if(currentAgentVmApp === "diagnostics"){
    const events = (session.events || []).slice(-8);
    screen.innerHTML = '<div class="agent-vm-panel-grid">'
      + '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Diagnostics</div><div class="agent-vm-meta-value">Power: '+escapeHtml(awake ? "online" : "paused")+'<br>Speaker order: Agent Lee first and last<br>Route: Agent Lee -> AX Agent Lee -> Agent Lee<br>Heartbeat: '+escapeHtml(identity.heartbeat)+'<br>Messages: '+session.messages.length+'<br>Terminal events: '+session.terminal.length+'<br>Memory ledger: '+escapeHtml(agentVmMemoryLedgerPath(vm))+'</div></div>'
      + renderAgentVmList("Visible Functionality", ["Workspace inspection surface", "Notepad surface", "Terminal command surface", "Database and memory ledger", "Diagnostics event stream", "Governed Agent Lee ask route"])
      + '<div class="agent-vm-panel"><div class="agent-vm-panel-title">Recent Events</div><ul class="agent-vm-list">'+events.map(function(event){ return '<li>'+escapeHtml((event.ts || "") + " " + (event.kind || "event") + " " + (event.detail || ""))+'</li>'; }).join("")+'</ul></div>'
      + renderAgentVmList("Authorities", identity.authorities)
      + renderAgentVmList("Duties", identity.duties)
      + '</div>';
    return;
  }
  if(currentAgentVmApp === "terminal"){
    const observedOnly = vmIsObservedOnly(vm);
    screen.innerHTML = '<div class="agent-vm-terminal" id="agentVmTerminal">'+escapeHtml(session.terminal.join("\\n"))+'</div>'
      + (observedOnly ? '<div class="agent-vm-panel" style="margin-top:10px"><div class="agent-vm-panel-title">Protected Surface</div><div class="agent-vm-meta-value">'+escapeHtml(vmLockReason(vm))+' Read-only commands still work: help, status, duties, authorities, lineage, database, memory, diagnostics.</div></div>' : '')
      + '<div class="agent-vm-terminal-row"><input id="agentVmTerminalInput" '+(observedOnly ? 'disabled ' : '')+'placeholder="'+escapeHtml(observedOnly ? "Protected surface: read-only VM terminal" : "Try: help, status, enable, pause, duties, authorities, lineage, memory, diagnostics")+'" onkeydown="if(event.key===\\'Enter\\') runAgentVmTerminal()" /><button class="ghost-btn" '+(observedOnly ? 'disabled ' : '')+'onclick="runAgentVmTerminal()">Run</button></div>';
  }
}

function saveAgentVmNote(value){
  if(!currentAgentVm) return;
  if(vmIsObservedOnly(currentAgentVm)) return;
  ensureAgentVmSession(currentAgentVm).notepad = value;
}

function runAgentVmTerminal(){
  if(!currentAgentVm) return;
  const input=document.getElementById("agentVmTerminalInput");
  const command=input ? input.value.trim() : "";
  if(!command) return;
  if(input) input.value="";
  const session=ensureAgentVmSession(currentAgentVm);
  const lower=command.toLowerCase();
  session.terminal.push("> " + command);
  recordAgentVmEvent("terminal-command", command);
  if(vmIsObservedOnly(currentAgentVm) && ["wake","enable","stop","pause"].indexOf(lower) !== -1){
    session.terminal.push("protected-control-blocked " + command);
    session.messages.push({ role:"system", content: vmLockReason(currentAgentVm) });
    recordAgentVmEvent("protected-control-blocked", command);
    renderAgentVm();
    return;
  }
  if(lower==="help") session.terminal.push("commands: help, status, enable, pause, wake, stop, duties, authorities, lineage, database, memory, diagnostics");
  else if(lower==="status") session.terminal.push("status=" + (vmEnabled(currentAgentVm) ? "active" : "paused") + "; speaker_order=agent_lee_first_and_last");
  else if(lower==="wake" || lower==="enable") wakeCurrentAgentVm();
  else if(lower==="stop" || lower==="pause") stopCurrentAgentVm();
  else if(lower==="duties") session.terminal.push(currentAgentVm.identity.duties.join("; "));
  else if(lower==="authorities") session.terminal.push(currentAgentVm.identity.authorities.join("; "));
  else if(lower==="lineage") session.terminal.push(currentAgentVm.identity.lineage);
  else if(lower==="database") session.terminal.push(currentAgentVm.identity.databasePath);
  else if(lower==="memory") session.terminal.push(agentVmMemoryLedgerPath(currentAgentVm));
  else if(lower==="diagnostics") session.terminal.push((session.events || []).slice(-5).map(function(event){ return (event.ts || "") + " " + (event.kind || "event") + " " + (event.detail || ""); }).join("\\n") || "no diagnostics yet");
  else session.terminal.push("unknown command: " + command);
  renderAgentVm();
}

function buildAgentVmReply(vm, text){
  const identity = vm.identity;
  const prefix = "Agent Lee routed this through AX Agent Lee / " + identity.realName + ". ";
  if(!vmEnabled(vm)) return prefix + "This subordinate agent is paused. Enable AX before assigning work.";
  const lower = text.toLowerCase();
  if(lower.indexOf("duty") !== -1 || lower.indexOf("purpose") !== -1) return prefix + "Duties: " + identity.duties.join("; ");
  if(lower.indexOf("authority") !== -1 || lower.indexOf("allowed") !== -1) return prefix + "Authorities: " + identity.authorities.join("; ");
  if(lower.indexOf("family") !== -1 || lower.indexOf("lineage") !== -1) return prefix + "Lineage: " + identity.lineage;
  if(lower.indexOf("status") !== -1 || lower.indexOf("awake") !== -1 || lower.indexOf("active") !== -1) return prefix + "Status is active at " + identity.vmAddress + " with heartbeat " + identity.heartbeat + ". Agent Lee remains first and last speaker.";
  if(lower.indexOf("notepad") !== -1 || lower.indexOf("note") !== -1) return prefix + "Notepad path: " + identity.notepadPath;
  if(lower.indexOf("database") !== -1 || lower.indexOf("db") !== -1 || lower.indexOf("memory") !== -1) return prefix + "Memory ledger: " + agentVmMemoryLedgerPath(vm) + ". Configured database path: " + identity.databasePath + ".";
  if(lower.indexOf("diagnostic") !== -1 || lower.indexOf("event") !== -1) return prefix + "Diagnostics are visible in the Diagnostics tab and written to the per-agent memory ledger.";
  return prefix + "Instruction received through the governed AX route. Primary duty route: " + (identity.duties[0] || vm.description) + ".";
}

function askCurrentAgentVm(){
  if(!currentAgentVm) return;
  const input=document.getElementById("agentVmAskInput");
  const text=input ? input.value.trim() : "";
  if(!text) return;
  if(input) input.value="";
  const session=ensureAgentVmSession(currentAgentVm);
  session.messages.push({ role:"user", content:text });
  const reply = buildAgentVmReply(currentAgentVm, text);
  session.messages.push({ role:"agent-lee", content:reply });
  session.terminal.push("question routed through Agent Lee: " + text);
  recordAgentVmEvent("governed-ask", text);
  renderAgentVm();
}

function renderAgentVmLog(){
  if(!currentAgentVm) return;
  const log=document.getElementById("agentVmLog");
  if(!log) return;
  const messages=ensureAgentVmSession(currentAgentVm).messages.slice(-8);
  log.innerHTML = messages.map(function(message){
    const label = message.role === "agent-lee" ? "AGENT LEE" : message.role.toUpperCase();
    return '<div class="agent-vm-message '+escapeHtml(message.role)+'"><strong>'+escapeHtml(label)+':</strong> '+escapeHtml(message.content)+'</div>';
  }).join("");
  log.scrollTop = log.scrollHeight;
}

function renderAgentVm(){
  if(!currentAgentVm) return;
  const session = ensureAgentVmSession(currentAgentVm);
  const awake = vmEnabled(currentAgentVm);
  session.awake = awake;
  const identity = currentAgentVm.identity;
  const title=document.getElementById("agentVmTitle");
  const subtitle=document.getElementById("agentVmSubtitle");
  const status=document.getElementById("agentVmStatus");
  const wakeBtn=document.getElementById("agentVmWakeBtn");
  const pauseBtn=document.getElementById("agentVmPauseBtn");
  const lockPill=document.getElementById("agentVmLockPill");
  const observedOnly = vmIsObservedOnly(currentAgentVm);
  if(title) title.textContent = "AX Agent Lee / " + identity.realName;
  if(subtitle) subtitle.textContent = vmKindLabel(identity) + " | " + currentAgentVm.description + " | " + (observedOnly ? vmLockReason(currentAgentVm) : "Agent Lee remains first and last speaker.");
  if(status){
    status.textContent = awake ? "Active" : "Paused";
    status.classList.toggle("awake", awake);
  }
  if(lockPill){
    lockPill.style.display = observedOnly ? "inline-flex" : "none";
    lockPill.title = observedOnly ? vmLockReason(currentAgentVm) : "";
  }
  if(wakeBtn){
    wakeBtn.disabled = observedOnly;
    wakeBtn.title = observedOnly ? vmLockReason(currentAgentVm) : "Enable AX";
  }
  if(pauseBtn){
    pauseBtn.disabled = observedOnly;
    pauseBtn.title = observedOnly ? vmLockReason(currentAgentVm) : "Pause AX";
  }
  renderAgentVmMeta(currentAgentVm, awake);
  renderAgentVmTaskbar();
  renderAgentVmScreen();
  renderAgentVmLog();
}

function setAttachmentMeta(message, persist){
  const meta=document.getElementById("attachmentMeta");
  if(!meta) return;
  if(attachmentMetaTimer){
    clearTimeout(attachmentMetaTimer);
    attachmentMetaTimer=null;
  }
  meta.textContent=message || "";
  meta.style.visibility=message ? "visible" : "hidden";
  if(message && !persist){
    attachmentMetaTimer=setTimeout(function(){
      meta.textContent="";
      meta.style.visibility="hidden";
      attachmentMetaTimer=null;
    },2200);
  }
}

function toggleTaskPanel(){
  workflowCollapsed = !workflowCollapsed;
  const shell=document.getElementById("workflowShell");
  const chevron=document.getElementById("workflowChevron");
  shell.classList.toggle("collapsed", workflowCollapsed);
  chevron.textContent = workflowCollapsed ? "\u25b8" : "\u25be";
}

function taskAction(command){
  const draft=document.getElementById("workflowPromptEditor");
  vscode.postMessage({command:command, prompt:draft ? draft.value : ""});
}

function toggleVoiceOutput(){
  const button=document.getElementById("voiceToggleBtn");
  const enabled=button && button.getAttribute("data-enabled")==="true";
  taskAction(enabled ? "muteVoice" : "talkOn");
}

function setRequireCtrlEnter(value){
  syncRequireCtrlEnterToggle(!!value);
  vscode.postMessage({command:"setState", key:"requireCtrlEnter", value:!!value});
}

function setSegmentChoice(containerId, nextValue){
  const container=document.getElementById(containerId);
  if(!container) return;
  Array.from(container.querySelectorAll("button")).forEach(function(button){
    button.classList.toggle("active", button.textContent.trim().toLowerCase()===nextValue.toLowerCase());
  });
}

function runtimeStateRequireCtrlEnter(){
  const toggle=document.getElementById("requireCtrlEnterToggle");
  return !!(toggle && toggle.checked);
}

function syncRequireCtrlEnterToggle(value){
  const primary=document.getElementById("requireCtrlEnterToggle");
  const secondary=document.getElementById("requireCtrlEnterToggleSecondary");
  if(primary) primary.checked = !!value;
  if(secondary) secondary.checked = !!value;
}

function switchSettingsSection(section){
  document.querySelectorAll(".settings-section").forEach(function(node){
    node.classList.toggle("active", node.id === "settingsSection-" + section);
  });
  document.querySelectorAll("#settingsNav button").forEach(function(button){
    button.classList.toggle("active", (button.textContent || "").toLowerCase().indexOf(section.toLowerCase()) !== -1);
  });
}

function pluginInitials(name){
  return name.split(/\s+/).slice(0,2).map(function(part){ return part[0] || ""; }).join("").toUpperCase();
}

function groupedPlugins(){
  return pluginCatalog.reduce(function(map, entry){
    if(!map[entry.category]) map[entry.category]=[];
    map[entry.category].push(entry);
    return map;
  }, {});
}

function renderPluginCatalog(state){
  const root=document.getElementById("pluginCatalogRoot");
  if(!root) return;
  const enabled = new Set((state && state.enabledPlugins) || []);
  const groups=groupedPlugins();
  root.innerHTML = Object.keys(groups).map(function(category){
    const rows = groups[category].map(function(entry){
      const active = enabled.has(entry.id);
      return '<div class="plugin-row">'
        + '<div class="plugin-avatar">'+escapeHtml(pluginInitials(entry.name))+'</div>'
        + '<div class="plugin-main"><div class="plugin-name">'+escapeHtml(entry.name)+'</div><div class="plugin-desc">'+escapeHtml(entry.description)+'</div></div>'
        + '<button class="plugin-action'+(active?' active':'')+'" onclick="togglePluginSelection(\\''+escapeHtml(entry.id)+'\\')" title="'+(active?'Connected':'Connect')+'">'+(active?'&#10003;':'+')+'</button>'
        + '</div>';
    }).join("");
    return '<div class="plugin-category-group"><div class="plugin-category-title">'+escapeHtml(category)+'</div><div class="plugin-list">'+rows+'</div></div>';
  }).join("");
}

function getMcpCatalog(state){
  const defaults = defaultMcpServerCatalog.map(function(entry){ return withVmIdentity(entry, "mcp"); });
  const custom = ((state && state.customMcpServers) || []).filter(function(id){
    return !defaults.some(function(entry){ return entry.id === id; });
  }).map(function(id){
    return withVmIdentity({ id:id, name:id, description: (state.mcpServerConfigs && state.mcpServerConfigs[id]) || "Custom MCP server" }, "mcp");
  });
  return defaults.concat(custom);
}

function getAgentCatalog(state){
  const defaults = defaultAgentCatalog.map(function(entry){ return withVmIdentity(entry, "agent"); });
  const custom = ((state && state.customAgents) || []).filter(function(id){
    return !defaults.some(function(entry){ return entry.id === id; });
  }).map(function(id){
    return withVmIdentity({ id:id, name:id, description: (state.agentConfigs && state.agentConfigs[id]) || "Custom agent" }, "agent");
  });
  return defaults.concat(custom);
}

function renderMcpServers(state){
  const root=document.getElementById("mcpServerList");
  if(!root) return;
  const enabled = new Set((state && state.enabledMcpServers) || []);
  const configs = (state && state.mcpServerConfigs) || {};
  root.innerHTML = getMcpCatalog(state).map(function(entry){
    const description = configs[entry.id] || entry.description || "";
    const locked = vmIsObservedOnly(entry);
    return '<div class="mcp-row">'
      + '<div><div class="mcp-name">'+escapeHtml(entry.name)+'</div><div class="mcp-desc">'+escapeHtml(description)+'</div><span class="agent-kind-pill">'+escapeHtml(vmKindLabel(entry.identity))+'</span>'+(locked?'<span class="agent-lock-pill" title="'+escapeHtml(vmLockReason(entry))+'">Observed Only</span>':'')+'</div>'
      + agentVmButton("mcp", entry.id)
      + '<button class="mcp-config-btn settings-lock-btn" '+(locked?'disabled ':'')+'onclick="configureMcpServer(\\''+escapeHtml(entry.id)+'\\')" title="'+escapeHtml(locked ? vmLockReason(entry) : "Configure")+'">&#9881;</button>'
      + '<input type="checkbox" class="settings-toggle" '+(enabled.has(entry.id)?'checked':'')+' '+(locked?'disabled ':'')+'onchange="toggleMcpServer(\\''+escapeHtml(entry.id)+'\\', this.checked)" title="'+escapeHtml(locked ? vmLockReason(entry) : "Toggle")+'" />'
      + '</div>';
  }).join("");
}

function renderAgents(state){
  const root=document.getElementById("agentList");
  if(!root) return;
  const enabled = new Set((state && state.enabledAgents) || []);
  const configs = (state && state.agentConfigs) || {};
  root.innerHTML = getAgentCatalog(state).map(function(entry){
    const description = configs[entry.id] || entry.description || "";
    const locked = vmIsObservedOnly(entry);
    return '<div class="mcp-row">'
      + '<div><div class="mcp-name">'+escapeHtml(entry.name)+'</div><div class="mcp-desc">'+escapeHtml(description)+'</div><span class="agent-kind-pill">'+escapeHtml(vmKindLabel(entry.identity))+'</span>'+(locked?'<span class="agent-lock-pill" title="'+escapeHtml(vmLockReason(entry))+'">Observed Only</span>':'')+'</div>'
      + agentVmButton("agent", entry.id)
      + '<button class="mcp-config-btn settings-lock-btn" '+(locked?'disabled ':'')+'onclick="configureAgent(\\''+escapeHtml(entry.id)+'\\')" title="'+escapeHtml(locked ? vmLockReason(entry) : "Configure")+'">&#9881;</button>'
      + '<input type="checkbox" class="settings-toggle" '+(enabled.has(entry.id)?'checked':'')+' '+(locked?'disabled ':'')+'onchange="toggleAgent(\\''+escapeHtml(entry.id)+'\\', this.checked)" title="'+escapeHtml(locked ? vmLockReason(entry) : "Toggle")+'" />'
      + '</div>';
  }).join("");
}

function renderPluginMesh(entries){
  const grid=document.getElementById("pluginMeshGrid");
  const count=document.getElementById("pluginMeshCount");
  const mode=document.getElementById("pluginMeshMode");
  if(!grid || !count || !mode) return;
  const active = (entries || []).filter(function(entry){ return entry.enabled; });
  count.textContent = active.length + " active";
  mode.textContent = active.length === (entries || []).length ? "Open mesh" : "Governed routing";
  grid.innerHTML = active.slice(0, 10).map(function(entry){
    const statusClass = !entry.adapterAvailable ? "offline" : (entry.authConfigured ? "online" : "warning");
    const statusText = !entry.adapterAvailable
      ? "Adapter missing"
      : (entry.authConfigured ? "Online" : "Needs auth");
    return '<div class="plugin-mesh-card">'
      + '<div class="plugin-mesh-name">'+escapeHtml(entry.name)+'</div>'
      + '<div class="plugin-mesh-meta"><span>'+escapeHtml(entry.category)+'</span><span>'+escapeHtml(entry.riskLevel)+'</span></div>'
      + '<div class="plugin-mesh-status '+statusClass+'">'+escapeHtml(statusText)+' · '+escapeHtml(entry.adapter)+'</div>'
      + '</div>';
  }).join("");
}

function showPluginApproval(payload){
  window.pendingPluginApproval = payload || null;
  const root=document.getElementById("pluginApproval");
  if(!root) return;
  document.getElementById("pluginApprovalCopy").textContent =
    "Agent Lee wants to use " + (payload.pluginName || payload.pluginId) + " for action \\\"" + payload.action + "\\\".";
  document.getElementById("pluginApprovalMeta").textContent =
    "Plugin: " + (payload.pluginName || payload.pluginId) + " · Risk: " + (payload.riskLevel || "high");
  root.classList.remove("hidden");
}

function hidePluginApproval(){
  window.pendingPluginApproval = null;
  const root=document.getElementById("pluginApproval");
  if(root) root.classList.add("hidden");
}

function approvePluginCall(){
  if(!window.pendingPluginApproval) return;
  vscode.postMessage({command:"approvePluginCall"});
}

function cancelPluginCall(){
  hidePluginApproval();
  vscode.postMessage({command:"cancelPluginCall"});
}

function togglePluginSelection(id){
  const state = window.agentLeeRuntimeState || {};
  const next = new Set(state.enabledPlugins || []);
  if(next.has(id)) next.delete(id); else next.add(id);
  vscode.postMessage({command:"setState", key:"enabledPlugins", value:Array.from(next)});
}

function toggleMcpServer(id, enabled){
  const state = window.agentLeeRuntimeState || {};
  const entry = getMcpCatalog(state).find(function(item){ return item.id === id; });
  if(entry && vmIsObservedOnly(entry)){
    window.alert(vmLockReason(entry));
    return;
  }
  const next = new Set(state.enabledMcpServers || []);
  if(enabled) next.add(id); else next.delete(id);
  vscode.postMessage({command:"setState", key:"enabledMcpServers", value:Array.from(next)});
}

function configureMcpServer(id){
  const state = window.agentLeeRuntimeState || {};
  const entry = getMcpCatalog(state).find(function(item){ return item.id === id; });
  if(entry && vmIsObservedOnly(entry)){
    window.alert(vmLockReason(entry));
    return;
  }
  const current = (state.mcpServerConfigs && state.mcpServerConfigs[id]) || "";
  const next = window.prompt("Configure MCP server", current);
  if(next===null) return;
  const configs = Object.assign({}, state.mcpServerConfigs || {});
  configs[id] = next;
  vscode.postMessage({command:"setState", key:"mcpServerConfigs", value:configs});
}

function addMcpServer(){
  const name = window.prompt("Add MCP server id");
  if(!name) return;
  const state = window.agentLeeRuntimeState || {};
  const custom = Array.from(new Set([].concat(state.customMcpServers || [], [name.trim()])));
  const enabled = Array.from(new Set([].concat(state.enabledMcpServers || [], [name.trim()])));
  vscode.postMessage({command:"setState", key:"customMcpServers", value:custom});
  vscode.postMessage({command:"setState", key:"enabledMcpServers", value:enabled});
}

function toggleAgent(id, enabled){
  const state = window.agentLeeRuntimeState || {};
  const entry = getAgentCatalog(state).find(function(item){ return item.id === id; });
  if(entry && vmIsObservedOnly(entry)){
    window.alert(vmLockReason(entry));
    return;
  }
  const next = new Set(state.enabledAgents || []);
  if(enabled) next.add(id); else next.delete(id);
  vscode.postMessage({command:"setState", key:"enabledAgents", value:Array.from(next)});
}

function configureAgent(id){
  const state = window.agentLeeRuntimeState || {};
  const entry = getAgentCatalog(state).find(function(item){ return item.id === id; });
  if(entry && vmIsObservedOnly(entry)){
    window.alert(vmLockReason(entry));
    return;
  }
  const current = (state.agentConfigs && state.agentConfigs[id]) || "";
  const next = window.prompt("Configure agent", current);
  if(next===null) return;
  const configs = Object.assign({}, state.agentConfigs || {});
  configs[id] = next;
  vscode.postMessage({command:"setState", key:"agentConfigs", value:configs});
}

function addAgent(){
  const name = window.prompt("Add agent id");
  if(!name) return;
  const state = window.agentLeeRuntimeState || {};
  const custom = Array.from(new Set([].concat(state.customAgents || [], [name.trim()])));
  const enabled = Array.from(new Set([].concat(state.enabledAgents || [], [name.trim()])));
  vscode.postMessage({command:"setState", key:"customAgents", value:custom});
  vscode.postMessage({command:"setState", key:"enabledAgents", value:enabled});
}

function renderTaskState(task){
  latestTaskState = task;
  const hasTodos = !!(task && Array.isArray(task.todos) && task.todos.length);
  const hasPrompt = !!(task && task.prompt);
  const hasTaskContent = hasTodos || hasPrompt || !!(task && task.parkedTask) || !!(task && task.savedPlanPath);
  const pendingEditCount = task && Array.isArray(task.proposedEdits)
    ? task.proposedEdits.filter(function(edit){ return edit.status === "pending"; }).length
    : 0;
  const modeLabel = task && task.mode ? task.mode.charAt(0).toUpperCase()+task.mode.slice(1) : "Execute";
  document.getElementById("workflowMode").textContent = "Mode: " + modeLabel;
  document.getElementById("workflowSummary").textContent = task && task.summary ? task.summary : "";
  document.getElementById("workflowPreview").textContent = task && task.nextTodo ? task.nextTodo : (task && task.status ? task.status : "Waiting for a new task.");
  document.getElementById("workflowTitle").textContent = task && task.plan ? "Plan + Live Work" : "Task Tracker";
  document.getElementById("workflowPromptEditor").value = task && (task.draftPrompt || task.prompt) ? (task.draftPrompt || task.prompt) : "";
  document.getElementById("workflowMode").style.display = hasTaskContent ? "" : "none";
  document.getElementById("workflowSummary").style.display = hasTaskContent && task.summary ? "" : "none";
  document.getElementById("workflowActions").style.display = hasTaskContent ? "flex" : "none";
  document.querySelector(".workflow-editor").style.display = hasPrompt ? "" : "none";
  document.getElementById("workflowParked").style.display = task && task.parkedTask ? "" : "none";
  const todoList=document.getElementById("todoList");
  const activityList=document.getElementById("activityList");
  const proposalList=document.getElementById("proposalList");
  const acceptAllBtn=document.getElementById("acceptAllEditsBtn");
  const actions=document.getElementById("workflowActions");
  const parked=document.getElementById("workflowParked");
  const workflowTitles=document.querySelectorAll(".workflow-card .workflow-title");
  if(workflowTitles[0]) workflowTitles[0].textContent="Live Work";
  if(workflowTitles[1]) workflowTitles[1].textContent="Live Activity";
  if(workflowTitles[2]) workflowTitles[2].textContent="Proposed Edits";
  if(workflowTitles[3]) workflowTitles[3].textContent="Plugin Mesh";
  todoList.innerHTML="";
  activityList.innerHTML="";
  proposalList.innerHTML="";
  actions.innerHTML="";
  if(acceptAllBtn){
    acceptAllBtn.classList.toggle("visible", pendingEditCount > 0);
    acceptAllBtn.textContent = pendingEditCount > 1 ? "Accept All (" + pendingEditCount + ")" : "Accept All";
  }

  if(hasTodos){
    task.todos.forEach(function(todo){
      const row=document.createElement("div");
      row.className="todo-item " + (todo.status==="completed" ? "done" : todo.status==="in_progress" ? "active" : "pending");
      const check=todo.status==="completed" ? "DONE" : todo.status==="in_progress" ? "LIVE" : "NEXT";
      row.innerHTML='<div class="todo-text"><span class="todo-check">'+check+'</span>'+escapeHtml(todo.title)+'</div><div class="todo-detail">'+escapeHtml(todo.detail || "")+'</div>';
      todoList.appendChild(row);
    });
  }

  if(task && Array.isArray(task.activities) && task.activities.length){
    task.activities.forEach(function(activity){
      const row=document.createElement("div");
      row.className="activity-item";
      const ts = activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], {hour:"numeric", minute:"2-digit", second:"2-digit"}) : "";
      let action = "";
      if(activity.path){
        const encodedPath = encodeURIComponent(activity.path);
        action = '<button class="ghost-btn activity-open-btn" onclick="openTaskFileFromEncoded(\\''+encodedPath+'\\')">Open</button>';
      }
      row.innerHTML='<div class="activity-row"><div class="activity-label">'+escapeHtml(activity.label || "Live activity")+'</div>'+action+'</div>'
        + (activity.file ? '<div class="activity-file">'+escapeHtml(activity.file)+'</div>' : '')
        + (activity.detail ? '<div class="todo-detail">'+escapeHtml(activity.detail)+'</div>' : '')
        + (ts ? '<div class="activity-meta">'+escapeHtml(ts)+'</div>' : '');
      activityList.appendChild(row);
    });
  } else {
    activityList.innerHTML = '<div class="activity-item"><div class="activity-label">No live file activity yet.</div><div class="todo-detail">When Agent Lee reads or writes files, the exact path will show here.</div></div>';
  }

  if(task && Array.isArray(task.proposedEdits) && task.proposedEdits.length){
    task.proposedEdits.forEach(function(edit){
      const row=document.createElement("div");
      row.className="proposal-item " + (edit.status || "pending");
      const createdAt = edit.createdAt ? new Date(edit.createdAt).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}) : "";
      const reviewBtn = '<button class="ghost-btn" onclick="reviewProposedEdit(\\''+escapeHtml(edit.id)+'\\')">Review Diff</button>';
      const approveBtn = edit.status==="pending" ? '<button class="ghost-btn" onclick="approveProposedEdit(\\''+escapeHtml(edit.id)+'\\')">Accept</button>' : "";
      const rejectBtn = edit.status==="pending" ? '<button class="ghost-btn" onclick="rejectProposedEdit(\\''+escapeHtml(edit.id)+'\\')">Reject</button>' : "";
      row.innerHTML='<div class="proposal-file">'+escapeHtml(edit.displayPath || "")+'</div>'
        + '<div class="proposal-summary">'+escapeHtml(edit.summary || "")+'</div>'
        + '<div class="proposal-meta"><span class="proposal-chip">'+escapeHtml(edit.status || "pending")+'</span><span>'+escapeHtml(createdAt)+'</span></div>'
        + '<div class="proposal-actions">'+reviewBtn+approveBtn+rejectBtn+'</div>';
      proposalList.appendChild(row);
    });
  } else {
    proposalList.innerHTML = '<div class="proposal-item"><div class="proposal-file">No proposed file edits yet.</div><div class="proposal-summary">When Agent Lee drafts a real file change, the diff review controls will appear here.</div></div>';
  }

  if(task && task.awaitingApproval && task.mode==="execute"){
    actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'approvePlan\\')">Approve & Execute</button>';
    actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'rejectPlan\\')">Reject Plan</button>';
  } else if(task && task.plan && task.mode==="plan"){
    actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'savePlan\\')">Save Plan</button>';
    if(task.canExecute) actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'executePlan\\')">Execute Plan</button>';
    actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'rejectPlan\\')">Clear Plan</button>';
  }
  if(task && task.prompt){
    actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'updateTaskPrompt\\')">Update Task</button>';
    actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'stopTask\\')">Stop Task</button>';
    if(task.running) actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'interruptTask\\')">Interrupt</button>';
  }
  actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\''+(window.agentLeeVoiceEnabled ? "muteVoice" : "talkOn")+'\\')">'+(window.agentLeeVoiceEnabled ? "Mute" : "Talk")+'</button>';
  if(task && task.parkedTask){
    actions.innerHTML += '<button class="ghost-btn" onclick="taskAction(\\'resumeParkedTask\\')">Resume Paused Task</button>';
    parked.textContent = "Paused task: " + task.parkedTask.summary + " | Next: " + task.parkedTask.nextTodo;
  } else {
    parked.textContent = "No paused task parked right now.";
  }

  if(task && task.savedPlanPath){
    const note=document.createElement("div");
    note.className="muted";
    note.textContent="Saved plan: " + task.savedPlanPath;
    actions.appendChild(note);
  }
}

function escapeHtml(value){
  return String(value || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function formatParagraphs(text){
  return text.split(/\\n\\n+/).map(function(chunk){ return chunk.trim(); }).filter(Boolean).map(function(chunk){ return "<p>"+escapeHtml(chunk).replace(/\\n/g,"<br>")+"</p>"; }).join("");
}

function renderAgentContent(text){
  const block = document.createElement("div");
  block.className = "bubble agent-card";
  const codeMatch = null;
  const sanitized = text.trim();
  const lines = sanitized.split(/\\n/);
  const sections = [];
  let i = 0;
  while(i < lines.length){
    const line = lines[i].trim();
    if(!line){ i += 1; continue; }
    if(line.toUpperCase() === "PLAN"){
      const items = [];
      i += 1;
      while(i < lines.length){
        const planLine = lines[i].trim();
        if(!planLine){ i += 1; continue; }
        if(/^[A-Z][A-Z\\s/]+$/.test(planLine)){ break; }
        items.push(planLine.replace(/^\\d+\\.\\s*/,""));
        i += 1;
      }
      sections.push('<div class="section-label">PLAN</div><ol class="plan-list">'+items.map(function(item){ return "<li>"+escapeHtml(item)+"</li>"; }).join("")+"</ol>");
      continue;
    }
    if(line.toUpperCase() === "LEEWAY CHECK"){
      const items = [];
      i += 1;
      while(i < lines.length){
        const checkLine = lines[i].trim();
        if(!checkLine){ i += 1; continue; }
        if(/^[A-Z][A-Z\\s/]+$/.test(checkLine)){ break; }
        items.push(checkLine.replace(/^[-*]\\s*/,""));
        i += 1;
      }
      sections.push('<div class="section-label">LEEWAY CHECK</div><div class="status-list">'+items.map(function(item){ return '<div class="status-item"><span class="status-dot">OK</span><span>'+escapeHtml(item)+'</span></div>'; }).join("")+"</div>");
      continue;
    }
    if(line.toUpperCase() === "IMPLEMENTATION"){
      i += 1;
      const implementationText = [];
      while(i < lines.length){ implementationText.push(lines[i]); i += 1; }
      const implHtml = implementationText.join("\\n").trim();
      if(implHtml){ sections.push('<div class="section-label">IMPLEMENTATION</div>'+formatParagraphs(implHtml)); }
      continue;
    }
    const paragraph = [];
    while(i < lines.length && lines[i].trim() && !/^(PLAN|LEEWAY CHECK|IMPLEMENTATION)$/i.test(lines[i].trim())){ paragraph.push(lines[i]); i += 1; }
    sections.push(formatParagraphs(paragraph.join("\\n")));
  }
  if(codeMatch){
    const filename = (codeMatch[1] || "implementation").trim() || "implementation";
    const code = codeMatch[2] || "";
    sections.push('<div class="section-label">IMPLEMENTATION</div><div class="code-card"><div class="code-head"><span>'+escapeHtml(filename)+'</span><span>TypeScript</span></div><div class="code-body"><pre>'+escapeHtml(code)+'</pre></div></div>');
  }
  block.innerHTML = sections.join("") || formatParagraphs(text);
  return block;
}

function renderActivityMeta(activity){
  if(!activity) return null;
  const wrap=document.createElement("div");
  wrap.className="bubble-activity";
  wrap.innerHTML='<div class="bubble-activity-label">'+escapeHtml(activity.label || "Live step")+'</div>'
    + (activity.file ? '<div class="bubble-activity-file">'+escapeHtml(activity.file)+'</div>' : '')
    + (activity.detail ? '<div class="bubble-activity-detail">'+escapeHtml(activity.detail)+'</div>' : '');
  return wrap;
}

function renderProgressBubble(text, activity){
  const bubble=document.createElement("div");
  bubble.className="bubble progress-card";
  const kind = activity && activity.kind ? String(activity.kind).toUpperCase() : "LIVE";
  const file = activity && activity.file ? activity.file : "";
  const detail = activity && activity.detail ? activity.detail : text;
  bubble.innerHTML = '<div class="progress-head"><div class="progress-label">'+escapeHtml(activity && activity.label ? activity.label : "Live step")+'</div><div class="progress-kind">'+escapeHtml(kind)+'</div></div>'
    + (file ? '<div class="progress-file">'+escapeHtml(file)+'</div>' : '')
    + '<div class="'+(file ? 'progress-copy' : 'progress-status')+'">'+escapeHtml(detail || text)+'</div>';
  return bubble;
}

function render(role,text,activity,variant){
  const chat=document.getElementById("chat");
  const wrap=document.createElement("div");
  wrap.className="message" + (variant==="progress" ? " progress-message" : "");
  const avatar=document.createElement("div");
  avatar.className="avatar "+(role==="user"?"user":"agent");
  avatar.textContent=role==="user"?"U":"A";
  const bubbleWrap=document.createElement("div");
  bubbleWrap.className="bubble-wrap";
  const meta=document.createElement("div");
  meta.className="meta-row";
  const sender=document.createElement("div");
  sender.className="sender "+(role==="user"?"user":"agent");
  sender.textContent=role==="user"?"You":"Agent Lee";
  if(role==="agent"){
    const badge=document.createElement("span");
    badge.className="badge-prime";
    badge.textContent="PRIME";
    sender.appendChild(badge);
  }
  const time=document.createElement("div");
  time.className="timestamp";
  time.textContent=new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
  meta.appendChild(sender);
  meta.appendChild(time);
  bubbleWrap.appendChild(meta);
  if(role==="agent"){
    if(variant==="progress" && activity){
      bubbleWrap.appendChild(renderProgressBubble(text, activity));
    } else {
      bubbleWrap.appendChild(renderAgentContent(text));
      const activityMeta=renderActivityMeta(activity);
      if(activityMeta) bubbleWrap.appendChild(activityMeta);
    }
  } else {
    const bubble=document.createElement("div");
    bubble.className="bubble";
    bubble.innerHTML=formatParagraphs(text);
    bubbleWrap.appendChild(bubble);
  }
  wrap.appendChild(avatar);
  wrap.appendChild(bubbleWrap);
  chat.appendChild(wrap);
  wrap.scrollIntoView({block:"end"});
}

function setApproval(v){ vscode.postMessage({command:"setState", key:"approval", value:v}); }
function setAutoRunStagedPlans(value){ vscode.postMessage({command:"setState", key:"autoRunStagedPlans", value:!!value}); }
function setAgentEnvironment(value){ vscode.postMessage({command:"setState", key:"agentEnvironment", value:value}); }
function setAppLanguage(value){ vscode.postMessage({command:"setState", key:"appLanguage", value:value}); }
function setInferenceSpeed(value){ vscode.postMessage({command:"setState", key:"inferenceSpeed", value:value}); }
function setFollowupBehavior(value){ setSegmentChoice("followupBehavior", value); vscode.postMessage({command:"setState", key:"followupBehavior", value:value}); }
function setCodeReviewBehavior(value){ setSegmentChoice("codeReviewBehavior", value); vscode.postMessage({command:"setState", key:"codeReviewBehavior", value:value}); }
function setWorkMode(value){ vscode.postMessage({command:"setState", key:"workMode", value:value}); }
function setVoiceStyle(value){ vscode.postMessage({command:"setState", key:"voiceStyle", value:value}); }
function setPrimaryModel(value){ vscode.postMessage({command:"setState", key:"primaryModel", value:value}); vscode.postMessage({command:"refreshRuntime"}); }
function setRoleModel(key,value){ vscode.postMessage({command:"setState", key:key, value:value}); vscode.postMessage({command:"refreshRuntime"}); }
function setPerformanceProfile(value){ vscode.postMessage({command:"setPerformanceProfile", profile:value}); }
function completeOnboarding(){ vscode.postMessage({command:"setState", key:"onboardingComplete", value:true}); vscode.postMessage({command:"refreshRuntime"}); toggleSettings(false); }
function pickAttachments(){ vscode.postMessage({command:"pickAttachments"}); }
function toggleWeb(){ const b=document.getElementById("webBtn"); const on=b.textContent==="Web Off"; b.textContent=on?"Web On":"Web Off"; vscode.postMessage({command:"setState", key:"web", value:on}); }
function toggleVoice(){ const b=document.getElementById("voiceBtn"); const on=b.textContent==="Voice Off"; b.textContent=on?"Voice On":"Voice Off"; vscode.postMessage({command:"setState", key:"voice", value:on}); }
function toggleBrowserVisual(){ const b=document.getElementById("browserVisualBtn"); const on=b.textContent==="Visual Browser Off"; b.textContent=on?"Visual Browser On":"Visual Browser Off"; vscode.postMessage({command:"setState", key:"browserVisualMode", value:on}); }
function toggleBrowserCursor(){ const b=document.getElementById("browserCursorBtn"); const on=b.textContent==="Show Cursor Off"; b.textContent=on?"Show Cursor On":"Show Cursor Off"; vscode.postMessage({command:"setState", key:"browserShowCursor", value:on}); }
function setBrowserSlowMo(value){ vscode.postMessage({command:"setState", key:"browserSlowMoMs", value:Number(value)}); }
function stopVoice(){ vscode.postMessage({command:"stopVoice"}); }
function toggleSettings(forceOpen){
  const backdrop=document.getElementById("settingsBackdrop");
  if(typeof forceOpen==="boolean"){
    backdrop.classList.toggle("open", forceOpen);
    return;
  }
  backdrop.classList.toggle("open");
}
function closeSettingsIfBackdrop(event){ if(event.target && event.target.id==="settingsBackdrop"){ toggleSettings(false); } }
function postUiAction(action, payload){ vscode.postMessage(Object.assign({command:"agentLeeUiAction", action:action}, payload || {})); }
function send(){ const input=document.getElementById("input"); const text=input.value.trim(); if(!text && !window.pendingAttachments.length)return; const displayText=text || window.pendingAttachments.map(function(item){ return item.name; }).join(", "); render("user",displayText); input.value=""; render("agent","I'm on it. Reading the real files and lining up the live tracker now."); vscode.postMessage({command:"sendMessage", text:text, attachments:window.pendingAttachments}); window.pendingAttachments=[]; syncAttachments(); }
function registerAgentLeeControlButtons(){ document.querySelectorAll("[data-ui-action]").forEach(function(button){ button.addEventListener("click",function(){ const action=button.getAttribute("data-ui-action"); const input=document.getElementById("input"); const prompt=input ? input.value.trim() : ""; postUiAction(action,{ text:prompt }); }); }); }
function registerAgentLeeTopButtons(){
  const settings=document.getElementById("settingsBtn");
  const historyButton=document.getElementById("historyBtn");
  const newChatButton=document.getElementById("newChatBtn");
  const closeHistoryButton=document.getElementById("closeHistoryBtn");
  if(settings) settings.addEventListener("click",function(){ toggleSettings(true); });
  if(historyButton) historyButton.addEventListener("click",function(){ toggleHistory(); });
  if(closeHistoryButton) closeHistoryButton.addEventListener("click",function(){ toggleHistory(false); });
  if(newChatButton) newChatButton.addEventListener("click",function(){ newChat(); });
}
function mic(){ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ render("agent","Mic capture is not available in this VS Code webview. Use text input or your local transcript bridge command for live voice."); return; } const rec=new SR(); rec.lang="en-US"; setAttachmentMeta("Mic listening...", true); rec.onresult=function(e){ const transcript=e.results[0][0].transcript; document.getElementById("input").value=transcript; setAttachmentMeta("Mic input captured. Sending now...", true); send(); }; rec.onerror=function(){ setAttachmentMeta(""); }; rec.onend=function(){ const meta=document.getElementById("attachmentMeta"); if(meta && meta.textContent==="Mic listening..."){ setAttachmentMeta(""); } }; rec.start(); }
function newChat(){ vscode.postMessage({command:"newConversation"}); }
function toggleHistory(forceOpen){
  const drawer=document.getElementById("historyDrawer");
  if(!drawer) return;
  if(typeof forceOpen==="boolean"){
    drawer.classList.toggle("open", forceOpen);
    return;
  }
  drawer.classList.toggle("open");
}
function loadConversationFromUi(id){
  toggleHistory(false);
  vscode.postMessage({command:"loadConversation", id:id});
}
function renderConversationHistory(items){
  const list=document.getElementById("historyList");
  if(!list) return;
  list.innerHTML="";
  if(!items || !items.length){
    const empty=document.createElement("div");
    empty.className="history-empty";
    empty.textContent="No saved chats yet. Start talking and they'll show up here.";
    list.appendChild(empty);
    return;
  }
  items.forEach(function(item){
    const row=document.createElement("button");
    row.className="history-item" + (item.active ? " active" : "");
    row.type="button";
    row.onclick=function(){ loadConversationFromUi(item.id); };
    const title=document.createElement("div");
    title.className="history-item-title";
    title.textContent=item.title || "Agent Lee conversation";
    const meta=document.createElement("div");
    meta.className="history-item-meta";
    meta.textContent=item.active ? "Current" : "Saved";
    row.appendChild(title);
    row.appendChild(meta);
    list.appendChild(row);
  });
}
function openReadme(){ vscode.postMessage({command:"openReadme"}); }
function removeAttachment(index){ window.pendingAttachments.splice(index,1); syncAttachments(); }
function openTaskFile(filePath){ vscode.postMessage({command:"openTaskFile", path:filePath}); }
function openTaskFileFromEncoded(value){ openTaskFile(decodeURIComponent(value)); }
function reviewProposedEdit(id){ vscode.postMessage({command:"reviewProposedEdit", editId:id}); }
function approveProposedEdit(id){ vscode.postMessage({command:"approveProposedEdit", editId:id}); }
function approveAllProposedEditsFromUi(){ vscode.postMessage({command:"approveAllProposedEdits"}); }
function rejectProposedEdit(id){ vscode.postMessage({command:"rejectProposedEdit", editId:id}); }
function syncAttachments(){ const list=document.getElementById("attachmentList"); list.innerHTML=""; if(!window.pendingAttachments.length){ list.classList.add("hidden"); setAttachmentMeta("Text, image, audio, and mic input ready."); return; } list.classList.remove("hidden"); setAttachmentMeta(window.pendingAttachments.length+" attachment(s) queued.", true); window.pendingAttachments.forEach(function(item,index){ const row=document.createElement("div"); row.className="attachment-item"; const label=document.createElement("span"); label.textContent=item.kind.toUpperCase()+" - "+item.name; const btn=document.createElement("button"); btn.className="ghost-btn"; btn.textContent="Remove"; btn.onclick=function(){ removeAttachment(index); }; row.appendChild(label); row.appendChild(btn); list.appendChild(row); }); }
function modelFallbacks(selected){
  return Array.from(new Set([selected,"qwen2.5-coder:14b","qwen2.5-coder:7b","deepseek-coder-v2:16b","llama3.1:8b"].filter(Boolean)));
}
function setModelOptions(selectId, models, selected){ const s=document.getElementById(selectId); if(!s) return; const list=(models && models.length ? models : modelFallbacks(selected)); s.innerHTML=""; list.forEach(function(m){ const o=document.createElement("option"); o.value=m; o.textContent=(selectId==="primaryModel"?"MODEL: ":"")+m; if(m===selected) o.selected=true; s.appendChild(o); }); if(selected) s.value=selected; if(!s.value && list.length) s.value=list[0]; }
function syncAutoRunStagedPlansUI(state){
  const toggle=document.getElementById("autoRunStagedPlansToggle");
  const hint=document.getElementById("autoRunStagedPlansHint");
  if(!toggle || !hint) return;
  const enabledByAccess = state && state.approval === "full" && state.workMode === "execute";
  toggle.checked = !!(state && state.autoRunStagedPlans);
  toggle.disabled = !enabledByAccess;
  hint.textContent = enabledByAccess
    ? "Auto-run is armed. New plans execute immediately in this mode."
    : "Auto-run is off. You can still approve or execute plans manually.";
}

window.addEventListener("message",function(e){
  const msg=e.data;
  if(msg.command==="modelOptions"){
    window.agentLeeRuntimeState = msg.state || {};
    setModelOptions("builderModel", msg.models, msg.selection.builderModel);
    setModelOptions("designerModel", msg.models, msg.selection.designerModel);
    setModelOptions("verifierModel", msg.models, msg.selection.verifierModel);
    setModelOptions("primaryModel", msg.models, msg.selection.primaryModel);
    setModelOptions("primaryModelSettings", msg.models, msg.selection.primaryModel);
    document.getElementById("approval").value = msg.state.approval;
    document.getElementById("approvalSettings").value = msg.state.approval;
    document.getElementById("agentEnvironment").value = msg.state.agentEnvironment || "windows-native";
    document.getElementById("appLanguage").value = msg.state.appLanguage || "auto";
    document.getElementById("inferenceSpeed").value = msg.state.inferenceSpeed || "standard";
    document.getElementById("workMode").value = msg.state.workMode || "execute";
    document.getElementById("workModeSettings").value = msg.state.workMode || "execute";
    syncAutoRunStagedPlansUI(msg.state || {});
    document.getElementById("voiceStyle").value = msg.state.voiceStyle || "grounded";
    document.getElementById("webBtn").textContent = msg.state.web ? "Web On" : "Web Off";
    document.getElementById("voiceBtn").textContent = msg.state.voice ? "Voice On" : "Voice Off";
    window.agentLeeVoiceEnabled = !!msg.state.voice;
    const voiceToggleBtn=document.getElementById("voiceToggleBtn");
    if(voiceToggleBtn){
      voiceToggleBtn.textContent = msg.state.voice ? "Mute" : "Talk";
      voiceToggleBtn.setAttribute("data-enabled", msg.state.voice ? "true" : "false");
      voiceToggleBtn.setAttribute("title", msg.state.voice ? "Mute speech" : "Enable speech");
    }
    document.getElementById("browserVisualBtn").textContent = msg.state.browserVisualMode ? "Visual Browser On" : "Visual Browser Off";
    document.getElementById("browserCursorBtn").textContent = msg.state.browserShowCursor ? "Show Cursor On" : "Show Cursor Off";
    document.getElementById("browserSlowMo").value = String(msg.state.browserSlowMoMs || 250);
    document.getElementById("completeOnboardingBtn").textContent = msg.state.onboardingComplete ? "Save Changes" : "Finish Setup";
    const requireToggle=document.getElementById("requireCtrlEnterToggle");
    if(requireToggle){ requireToggle.checked = !!msg.state.requireCtrlEnter; }
    syncRequireCtrlEnterToggle(!!msg.state.requireCtrlEnter);
    setSegmentChoice("followupBehavior", msg.state.followupBehavior || "steer");
    setSegmentChoice("codeReviewBehavior", msg.state.codeReviewBehavior || "inline");
    renderPluginCatalog(msg.state);
    renderMcpServers(msg.state);
    renderAgents(msg.state);
    if(!msg.state.onboardingComplete){ toggleSettings(true); }
  }
  if(msg.command==="history"){
    const active = (msg.items || []).find(function(i){ return i.active; });
    document.getElementById("conversationTitle").textContent = active && active.title ? active.title : "Current conversation";
    renderConversationHistory(msg.items || []);
  }
  if(msg.command==="loadedConversation"){
    document.getElementById("chat").innerHTML="";
    msg.messages.forEach(function(m){ render(m.role==="user"?"user":"agent",m.text); });
    toggleHistory(false);
  }
  if(msg.command==="response" || msg.command==="progress"){
    const chat=document.getElementById("chat");
    const last=chat.lastElementChild;
    if(last && last.textContent && (last.textContent.indexOf("Hold up, I'm building the plan and tracking the workflow now.") !== -1 || last.textContent.indexOf("I’m on it. Reading the real files and lining up the live tracker now.") !== -1 || last.textContent.indexOf("I'm on it. Reading the real files and lining up the live tracker now.") !== -1)) last.remove();
    render("agent",msg.text,msg.activity||null,msg.command==="progress" ? "progress" : "response");
    if(msg.reportPath){ document.getElementById("evidenceStatus").textContent = "Repair report path: " + msg.reportPath; }
  }
  if(msg.command==="agentLeeUiResponse"){
    render("agent",msg.text || "Agent Lee returned an empty UI action response.");
    if(msg.reportPath){ document.getElementById("evidenceStatus").textContent = "Repair report path: " + msg.reportPath; }
  }
  if(msg.command==="agentLeeUiError"){
    render("agent",msg.text || "Agent Lee UI action failed.");
    document.getElementById("status").textContent = msg.text || "Agent Lee UI action failed.";
  }
  if(msg.command==="status"){
    document.getElementById("status").textContent=msg.text;
  }
  if(msg.command==="runtimeInfo"){
    latestAgentVmMemory = msg.memory || latestAgentVmMemory || {};
    document.getElementById("workspaceBadge").textContent = "Workspace: " + (msg.workspaceRoot || "not open");
    document.getElementById("voiceStatus").textContent = "Voice: " + (msg.voice.enabled ? "On" : "Off") + " | " + msg.voice.engine + " | ready=" + msg.voice.ready;
    document.getElementById("hiveStatus").textContent = "Hive: " + msg.hive.taskType + " | degraded=" + msg.hive.degraded;
    renderPluginMesh(msg.pluginMesh || []);
    msg.hive.roles.forEach(function(role){
      if(!roleIds[role.role]) return;
      const ids = roleIds[role.role];
      const label = document.getElementById(ids[1]);
      const statusText = role.available ? (role.degraded ? "Degraded fallback: " + role.selected : "Ready: " + role.selected) : "Unavailable: " + role.preferred;
      label.textContent = statusText;
      label.className = "model-status " + (role.available && !role.degraded ? "ok" : "warn");
    });
    if(msg.lastReportPath){ document.getElementById("evidenceStatus").textContent = "Repair report path: " + msg.lastReportPath; }
  }
  if(msg.command==="agentVmDiagnosticRecorded"){
    latestAgentVmMemory = msg.memory || latestAgentVmMemory || {};
  }
  if(msg.command==="pluginConfirmation"){
    showPluginApproval(msg);
  }
  if(msg.command==="pluginConfirmationCleared"){
    hidePluginApproval();
  }
  if(msg.command==="attachmentsPicked"){
    window.pendingAttachments = msg.attachments || [];
    syncAttachments();
  }
  if(msg.command==="taskState"){
    renderTaskState(msg.task);
    if(msg.task && msg.task.status){ document.getElementById("status").textContent = msg.task.status; }
  }
});
document.addEventListener("keydown",function(e){ const input=document.getElementById("input"); const focused=document.activeElement===input; if(!focused || e.key!=="Enter") return; if((e.ctrlKey || e.metaKey)){ e.preventDefault(); send(); return; } if(runtimeStateRequireCtrlEnter()){ return; } if(e.shiftKey){ return; } e.preventDefault(); send(); });
window.pendingAttachments=[];
window.agentLeeVoiceEnabled=true;
window.agentLeeRuntimeState = {
  enabledPlugins: [],
  enabledMcpServers: defaultMcpServerCatalog.map(function(entry){ return entry.id; }),
  customMcpServers: [],
  mcpServerConfigs: {},
  enabledAgents: defaultAgentCatalog.map(function(entry){ return entry.id; }),
  customAgents: [],
  agentConfigs: {}
};
function bootAgentLeeUiHandlers(){
  registerAgentLeeControlButtons();
  registerAgentLeeTopButtons();
  console.log('UI version: ${AGENT_LEE_UI_VERSION}');
}
if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", bootAgentLeeUiHandlers);
} else {
  bootAgentLeeUiHandlers();
}
setAttachmentMeta("Text, image, audio, and mic input ready.");
document.getElementById("workflowShell").classList.add("collapsed");
document.getElementById("workflowChevron").textContent = "\u25b8";
syncRequireCtrlEnterToggle(false);
setSegmentChoice("followupBehavior","steer");
setSegmentChoice("codeReviewBehavior","inline");
switchSettingsSection("general");
renderPluginCatalog({ enabledPlugins: [] });
renderMcpServers({ enabledMcpServers: defaultMcpServerCatalog.map(function(entry){ return entry.id; }), customMcpServers: [], mcpServerConfigs: {} });
renderAgents({ enabledAgents: defaultAgentCatalog.map(function(entry){ return entry.id; }), customAgents: [], agentConfigs: {} });
renderPluginMesh([]);
renderTaskState({ mode:"execute", summary:"I will show the plan and live to-dos here.", status:"Waiting for a new task.", nextTodo:"Waiting for a new task.", todos:[], activities:[], awaitingApproval:false, canExecute:false, savedPlanPath:"", plan:null });
vscode.postMessage({command:"ready"});
</script>
</body>
</html>`;
}

class Provider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView) {
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "media")]
    };
    view.webview.html = getHtml(view.webview, this.context);
    activeWebviews.add(view.webview);
    view.webview.onDidReceiveMessage((msg) => handle(view.webview, msg, this.context));
  }
}

let lastReportPath = "";

async function postRuntimeInfo(webview: vscode.Webview, prompt = "front-end task") {
  const installedModels = await getModels();
  refreshRuntimeFromInstalled(installedModels);
  const sovereignRuntime = getAgentLeeRuntimeState();
  const uiModelOptions = installedModels.length
    ? installedModels
    : Array.from(
        new Set(
          [
            runtimeState.primaryModel,
            runtimeState.builderModel,
            runtimeState.designerModel,
            runtimeState.verifierModel,
            "qwen2.5-coder:14b",
            "qwen2.5-coder:7b",
            "deepseek-coder-v2:16b",
            "llama3.1:8b"
          ].filter(Boolean)
        )
      );
  const hive = buildModelHiveStatus(installedModels, {
    builderModel: runtimeState.builderModel,
    designerModel: runtimeState.designerModel,
    verifierModel: runtimeState.verifierModel
  }, prompt);

  webview.postMessage({
    command: "runtimeInfo",
    voice: {
      ...getVoiceStatus(),
      enabled: runtimeState.voice
    },
    hive,
    pluginMesh: buildPluginMeshSnapshot(),
    memory: getMemoryStatus(),
    workspaceRoot: workspaceRoot(),
    lastReportPath,
    sovereignRuntime
  });
  webview.postMessage({
    command: "modelOptions",
    models: uiModelOptions,
    selection: {
      primaryModel: runtimeState.primaryModel,
      builderModel: runtimeState.builderModel,
      designerModel: runtimeState.designerModel,
      verifierModel: runtimeState.verifierModel
    },
    state: runtimeState,
    sovereignRuntime
  });
}

async function runNextQueuedFollowUp(webview: vscode.Webview) {
  if (isExecutionRunning || !queuedFollowUps.length) return;
  const next = queuedFollowUps.shift();
  if (!next) return;
  postAgentResponse(webview, "Yo, the queued follow-up is up next. I'm rolling straight into it.");
  await handle(webview, { command: "ask", text: next.text, attachments: next.attachments }, undefined);
}

function conversationItems() {
  return listConversations().map((item) => ({
    id: item.id,
    title: formatConversationTitle(item),
    active: item.active
  }));
}

async function handle(webview: vscode.Webview, msg: any, context?: vscode.ExtensionContext) {
  try {
  const sovereignRuntime = getAgentLeeRuntimeState();
  if (msg.command === "agentLeeUiReady") {
    await postVisibleRuntimeState(webview);
    logEvent("ui-ready", "Agent Lee", `UI version: ${AGENT_LEE_UI_VERSION}`, { uiVersion: AGENT_LEE_UI_VERSION });
    return;
  }

  if (msg.command === "agentLeeUiAction") {
    const output = agentLeeOutputChannel;
    const state = getAgentLeeRuntimeState();
    const summary = getRuntimeProofSummary(state);

    if (!output) {
      postAgentResponse(webview, "Agent Lee output channel is still waking up. Reopen the panel or run Runtime Status once activation settles.", { speak: false });
      return;
    }

    if (msg.action === "runtimeStatus") {
      const detail = summary.detailLines.join("\n");
      appendAgentLeeLine(output, detail, { voiceMode: "operator" });
      output.show(true);
      postAgentResponse(webview, `Yo, runtime status is ${summary.statusLabel}. Raw proof is right here:\n\n${detail}`, { speak: false });
      await postVisibleRuntimeState(webview);
      return;
    }

    if (msg.action === "scanWorkspace" || msg.action === "scanLeeWay") {
      await runWorkspaceScan(output, "scan");
      postAgentResponse(webview, "Workspace scan finished. I wrote the raw scanner proof to the Agent Lee output channel and refreshed this UI status.", { speak: false });
      await postVisibleRuntimeState(webview);
      return;
    }

    if (msg.action === "askLocalModel") {
      const prompt = String(msg.text || "").trim();
      if (prompt) {
        const answer = await runAskLocalModelPrompt(output, prompt);
        postAgentResponse(webview, `Local model route completed through Agent Lee.\n\n${answer}`, { speak: false });
      } else {
        await runAskLocalModel(output);
        postAgentResponse(webview, "Local model prompt opened through Agent Lee. The routed answer will land in the output channel.", { speak: false });
      }
      await postVisibleRuntimeState(webview);
      return;
    }

    if (msg.action === "verifyWorkspace") {
      await runWorkspaceScan(output, "verify");
      postAgentResponse(webview, "Workspace verification finished. I kept the raw verification proof readable in the output channel.", { speak: false });
      await postVisibleRuntimeState(webview);
      return;
    }

    if (msg.action === "scanSelf") {
      await runWorkspaceScan(output, "scanSelf");
      postAgentResponse(webview, "Agent Lee self-scan finished. The scanner report and blocker count are in the output channel.", { speak: false });
      await postVisibleRuntimeState(webview);
      return;
    }

    if (msg.action === "verifySelf") {
      await runWorkspaceScan(output, "verifySelf");
      postAgentResponse(webview, "Agent Lee self-verification finished. The raw verification result is preserved in the output channel.", { speak: false });
      await postVisibleRuntimeState(webview);
      return;
    }

    if (msg.action === "engineerTask") {
      vscode.commands.executeCommand("agentLee.engineerTask");
      postAgentResponse(webview, "Engineering task control is open. Describe the target change and I will stage the work through the governed task flow.", { speak: false });
      await postVisibleRuntimeState(webview);
      return;
    }

    if (msg.action === "openReport" || msg.action === "openReceipts") {
      const targetPath = msg.action === "openReport" && lastReportPath
        ? lastReportPath
        : path.join(ROOT, "reports", "engineering-runs");
      fs.mkdirSync(fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory() ? targetPath : path.dirname(targetPath), { recursive: true });
      await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(targetPath));
      postAgentResponse(webview, `I opened the Agent Lee ${msg.action === "openReport" ? "report" : "receipts"} location:\n${targetPath}`, { speak: false });
      await postVisibleRuntimeState(webview);
      return;
    }

    postAgentResponse(webview, `Agent Lee received an unknown UI action: ${String(msg.action || "missing action")}. I kept the panel alive so the failure is visible.`, { speak: false });
    return;
  }

  if (msg.command === "sendMessage") {
    await handle(webview, { command: "ask", text: msg.text, attachments: msg.attachments }, context);
    return;
  }

  if (msg.command === "agentVmDiagnosticEvent") {
    const ledgerPath = recordAxAgentLeeDiagnosticEvent((msg.event || {}) as Record<string, unknown>);
    webview.postMessage({
      command: "agentVmDiagnosticRecorded",
      ledgerPath,
      memory: getMemoryStatus(String((msg.event || {}).agentId || "unknown-agent"))
    });
    return;
  }

  if (msg.command === "askLocalModel") {
    await handle(webview, { command: "agentLeeUiAction", action: "askLocalModel", text: msg.text }, context);
    return;
  }

  if (msg.command === "engineerTask") {
    await handle(webview, { command: "agentLeeUiAction", action: "engineerTask", text: msg.text }, context);
    return;
  }

  if (msg.command === "scanSelf" || msg.command === "verifySelf" || msg.command === "runtimeStatus" || msg.command === "scanWorkspace" || msg.command === "verifyWorkspace" || msg.command === "openReport" || msg.command === "openReceipts") {
    await handle(webview, { command: "agentLeeUiAction", action: msg.command, text: msg.text }, context);
    return;
  }

  if (msg.command === "clearChat") {
    const meta = startNewConversation(workspaceRoot());
    webview.postMessage({ command: "loadedConversation", messages: loadConversation(meta.id) });
    webview.postMessage({ command: "history", items: conversationItems() });
    resetTaskState("Chat cleared. Ready for the next engineering task.");
    postAgentResponse(webview, "I cleared the visible chat and started a fresh Agent Lee conversation.", { speak: false });
    return;
  }

  if (msg.command === "ready") {
    activeWebviews.add(webview);
    capabilityCatalog = buildCapabilityCatalog();
    const online = await checkOllama();
    const installedModels = await getModels();
    refreshRuntimeFromInstalled(installedModels);
    const activeConversation = startNewConversation(workspaceRoot());

    webview.postMessage({
      command: "status",
      text: online
        ? ""
        : ""
    });
    webview.postMessage({ command: "history", items: conversationItems() });
    webview.postMessage({ command: "loadedConversation", messages: loadConversation(activeConversation.id) });
    await postRuntimeInfo(webview);
    postTaskState();

    if (!loadConversation(activeConversation.id).length) {
      const intro = sovereignRuntime.AGENT_LEE_RUNTIME_READY
        ? "I got you. Show me what's breaking or what you're trying to build, and we'll work it clean."
        : "Agent Lee runtime is degraded: persona module unavailable. Only scan and diagnostic moves are available until the sovereign runtime is healthy again.";
      const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
      if (stage.allowed) {
        const timestamp = new Date().toISOString();
        appendConversationMessage(workspaceRoot(), { role: "agent", text: intro, timestamp }, { conversationId: activeConversation.id });
        postAgentResponse(webview, intro);
        webview.postMessage({ command: "history", items: conversationItems() });
      }
    }
  }

  if (msg.command === "approvePluginCall") {
    if (!pendingPluginApproval) {
      postAgentResponse(webview, "Ain't nothing waiting on approval right now.", { speak: false });
      return;
    }

    const approved = pendingPluginApproval;
    const result = await handlePluginCall(webview, approved.call, true);
    postAgentResponse(webview, formatPluginResult(result), { speak: false });
    return;
  }

  if (msg.command === "cancelPluginCall") {
    if (pendingPluginApproval) {
      const cancelled = pendingPluginApproval;
      clearPendingPluginApproval(webview);
      postAgentResponse(webview, `Cancelled ${cancelled.pluginName} action "${cancelled.call.action}".`, { speak: false });
    }
    return;
  }

  if (msg.command === "setState") {
    let blockedProtectedMutation = false;
    let nextValue = msg.value;

    if (msg.key === "enabledAgents") {
      const sanitized = preserveProtectedIds(msg.value, runtimeState.enabledAgents, DEFAULT_RUNTIME_STATE.enabledAgents, PROTECTED_AGENT_IDS);
      blockedProtectedMutation = JSON.stringify(sanitized) !== JSON.stringify(msg.value);
      nextValue = sanitized;
    } else if (msg.key === "enabledMcpServers") {
      const sanitized = preserveProtectedIds(msg.value, runtimeState.enabledMcpServers, DEFAULT_RUNTIME_STATE.enabledMcpServers, PROTECTED_MCP_IDS);
      blockedProtectedMutation = JSON.stringify(sanitized) !== JSON.stringify(msg.value);
      nextValue = sanitized;
    } else if (msg.key === "agentConfigs") {
      const sanitized = preserveProtectedConfigs(msg.value, runtimeState.agentConfigs, PROTECTED_AGENT_IDS);
      blockedProtectedMutation = JSON.stringify(sanitized) !== JSON.stringify(msg.value);
      nextValue = sanitized;
    } else if (msg.key === "mcpServerConfigs") {
      const sanitized = preserveProtectedConfigs(msg.value, runtimeState.mcpServerConfigs, PROTECTED_MCP_IDS);
      blockedProtectedMutation = JSON.stringify(sanitized) !== JSON.stringify(msg.value);
      nextValue = sanitized;
    }

    (runtimeState as any)[msg.key] = nextValue;
    persistRuntime();
    if (blockedProtectedMutation) {
      currentTaskState.status = protectedMutationStatus(String(msg.key || ""));
      postTaskState();
    }
    if (msg.key === "workMode") {
      currentTaskState.mode = nextValue;
      if (runtimeState.workMode !== "execute") {
        runtimeState.autoRunStagedPlans = false;
        persistRuntime();
      }
      currentTaskState.status = `Work mode set to ${nextValue}.`;
      postTaskState();
    }
    if (msg.key === "autoRunStagedPlans") {
      if (nextValue && !hasFullExecutionAccess()) {
        runtimeState.autoRunStagedPlans = false;
        persistRuntime();
        currentTaskState.status = "Auto-run was left off. Full access is only required for unattended execution, not normal plan approval.";
        postTaskState();
        await postRuntimeInfo(webview);
        return;
      }
      currentTaskState.status = nextValue
        ? "Auto-run staged plans is enabled for Full access execute mode."
        : "Auto-run staged plans is disabled.";
      postTaskState();
    }
    if (msg.key === "approval") {
      if (runtimeState.approval !== "full" && runtimeState.autoRunStagedPlans) {
        runtimeState.autoRunStagedPlans = false;
        persistRuntime();
        currentTaskState.status = `Approval set to ${nextValue}. Auto-run was turned off; manual execution remains available.`;
      } else {
        currentTaskState.status = `Approval set to ${nextValue}.`;
      }
      postTaskState();
    }
    if (msg.key === "followupBehavior") {
      currentTaskState.status = `Follow-up behavior set to ${nextValue}.`;
      postTaskState();
    }
    if (msg.key === "codeReviewBehavior") {
      currentTaskState.status = `Code review behavior set to ${nextValue}.`;
      postTaskState();
    }
    if (msg.key === "requireCtrlEnter") {
      currentTaskState.status = nextValue ? "Ctrl+Enter is now required for multiline sends." : "Enter will send from the main input again.";
      postTaskState();
    }
    if (msg.key === "inferenceSpeed") {
      currentTaskState.status = `Inference speed set to ${nextValue}.`;
      postTaskState();
    }
    await postRuntimeInfo(webview);
  }

  if (msg.command === "talkOn") {
    runtimeState.voice = true;
    persistRuntime();
    currentTaskState.status = "Voice output enabled.";
    postTaskState();
    await postRuntimeInfo(webview);
  }

  if (msg.command === "muteVoice") {
    runtimeState.voice = false;
    persistRuntime();
    stopVoicePlayback();
    currentTaskState.status = "Voice output muted.";
    postTaskState();
    await postRuntimeInfo(webview);
  }

  if (msg.command === "pickAttachments") {
    const picked = await vscode.window.showOpenDialog({
      canSelectMany: true,
      openLabel: "Attach to Agent Lee",
      filters: {
        Media: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "wav", "mp3", "m4a", "ogg", "flac"]
      }
    });

    webview.postMessage({
      command: "attachmentsPicked",
      attachments: (picked || []).map((item) => ({
        path: item.fsPath,
        name: path.basename(item.fsPath),
        kind: fileKind(item.fsPath)
      }))
    });
  }

  if (msg.command === "refreshRuntime") {
    await postRuntimeInfo(webview);
  }

  if (msg.command === "setPerformanceProfile") {
    const profile = String(msg.profile || "quiet_laptop");
    await vscode.commands.executeCommand("agentLee.performance.setProfile", profile);
    currentTaskState.status = `Performance profile set to ${profile}.`;
    postTaskState();
    await postRuntimeInfo(webview);
  }

  if (msg.command === "openReadme") {
    if (context) {
      await openReadme(context);
    } else {
      vscode.commands.executeCommand("agentLee.openReadme");
    }
  }

  if (msg.command === "openTaskFile") {
    const opened = await openTaskFileByPath(String(msg.path || ""));
    if (!opened) {
      postAgentResponse(webview, "I couldn't open that file because the path is missing or no longer exists.", { speak: false });
    }
  }

  if (msg.command === "reviewProposedEdit") {
    const proposal = currentTaskState.proposedEdits.find((item) => item.id === String(msg.editId || ""));
    if (proposal) {
      await openDiffForProposal(proposal);
    }
  }

  if (msg.command === "approveProposedEdit") {
    const approved = await approveProposedEdit(String(msg.editId || ""));
    if (approved) {
      postAgentResponse(webview, "I applied that proposed edit to the real file.", { speak: false });
    }
  }

  if (msg.command === "approveAllProposedEdits") {
    const approvedCount = await approveAllProposedEdits();
    if (approvedCount > 0) {
      postAgentResponse(webview, `I applied ${approvedCount} pending proposed edit${approvedCount === 1 ? "" : "s"} to the real files.`, { speak: false });
    }
  }

  if (msg.command === "rejectProposedEdit") {
    const rejected = await rejectProposedEdit(String(msg.editId || ""));
    if (rejected) {
      postAgentResponse(webview, "I dropped that proposed edit from the review queue.", { speak: false });
    }
  }

  if (msg.command === "refreshCatalog") {
    capabilityCatalog = buildCapabilityCatalog();
    const message = `Capability catalog refreshed. Total: ${capabilityCatalog.counts.total} | MCPs: ${capabilityCatalog.counts.mcps} | Agents: ${capabilityCatalog.counts.agents} | Servers: ${capabilityCatalog.counts.servers}`;
    postAgentResponse(webview, message);
    webview.postMessage({
      command: "status",
      text: `Back in motion. Workspace: ${workspaceRoot() || "not open"} | capabilities: ${capabilityCatalog.counts.total}`
    });
    await postRuntimeInfo(webview);
  }

  if (msg.command === "installPyCharmTools") {
    try {
      const result = installPyCharmTooling();
      postAgentResponse(webview, result);
    } catch (err: any) {
      postAgentResponse(webview, `PyCharm wiring failed: ${err.message}`);
    }
  }

  if (msg.command === "loadConversation") {
    setActiveConversation(msg.id);
    webview.postMessage({ command: "loadedConversation", messages: loadConversation(msg.id) });
    webview.postMessage({ command: "history", items: conversationItems() });
    resetTaskState("Loaded conversation. Ready for a new plan.");
  }

  if (msg.command === "newConversation") {
    const meta = startNewConversation(workspaceRoot());
    webview.postMessage({ command: "loadedConversation", messages: loadConversation(meta.id) });
    webview.postMessage({ command: "history", items: conversationItems() });
    resetTaskState("New conversation started. Ready for a new plan.");
  }

  if (msg.command === "stopVoice") {
    stopVoicePlayback();
    postAgentResponse(webview, "Agent Lee voice stopped.", { speak: false });
    await postRuntimeInfo(webview);
  }

  if (msg.command === "savePlan") {
    const savedPath = await persistCurrentPlan();
    if (savedPath) {
      currentTaskState.status = "Plan saved. Review it or execute it when ready.";
      postTaskState();
      postAgentResponse(webview, `Plan saved to:\n${savedPath}`, { activity: { kind: "write", label: "Saved task plan", file: savedPath } });
    }
  }

  if (msg.command === "updateTaskPrompt") {
    const nextPrompt = String(msg.prompt || "").trim();
    if (nextPrompt) {
      currentTaskState.prompt = nextPrompt;
      currentTaskState.draftPrompt = nextPrompt;
      if (currentTaskState.plan) {
        currentTaskState.plan = {
          ...currentTaskState.plan,
          prompt: nextPrompt,
          summary: `Updated task: ${nextPrompt}`
        };
      }
      currentTaskState.status = "Task prompt updated.";
      pushTaskActivity({ kind: "status", label: "Task prompt edited", detail: nextPrompt });
      postTaskState();
    }
  }

  if (msg.command === "rejectPlan") {
    resetTaskState("Plan cleared. Ready for a new task.");
    postAgentResponse(webview, "The current plan was cleared.");
  }

  if (msg.command === "stopTask") {
    abortCurrentExecution("Task stopped. The staged work was cleared.");
    parkedTaskState = null;
    resetTaskState("Task stopped completely.");
    postAgentResponse(webview, "The active task was stopped and cleared.");
  }

  if (msg.command === "interruptTask") {
    if (currentTaskState.prompt) {
      abortCurrentExecution("Task paused. I kept the task so you can resume or redirect.");
      parkedTaskState = cloneTaskState(currentTaskState);
      resetTaskState("Task paused. You can ask a redirect question or resume the parked task.");
      postAgentResponse(webview, flavoredStatusLine("paused"));
    }
  }

  if (msg.command === "resumeParkedTask") {
    if (parkedTaskState) {
      currentTaskState = cloneTaskState(parkedTaskState);
      parkedTaskState = null;
      currentTaskState.status = "Paused task restored. Approve or execute when ready.";
      postTaskState();
      postAgentResponse(webview, flavoredStatusLine("resume"));
    }
  }

  if (msg.command === "approvePlan" || msg.command === "executePlan") {
    const installedModels = await getModels();
    refreshRuntimeFromInstalled(installedModels);
    const execution = await executeCurrentPlan(webview, installedModels);
    if (execution) {
      const active = getOrCreateActiveConversation(workspaceRoot());
      appendConversationMessage(workspaceRoot(), { role: "agent", text: execution.finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
      postAgentResponse(webview, execution.finalText, { reportPath: execution.response.reportPath || "" });
      webview.postMessage({ command: "history", items: conversationItems() });
      await postRuntimeInfo(webview, currentTaskState.prompt || "front-end task");
      await runNextQueuedFollowUp(webview);
    }
  }

  if (msg.command === "ask") {
    if (!sovereignRuntime.AGENT_LEE_RUNTIME_READY) {
      postAgentResponse(webview, "Agent Lee runtime is degraded: persona module unavailable. Only scan and doctor style diagnostics are available until the full sovereign runtime is active again.", { speak: false });
      return;
    }
    stopVoicePlayback();
    const text = String(msg.text || "");
    const attachments = Array.isArray(msg.attachments) ? msg.attachments as PendingAttachment[] : [];
    const attachmentSummary = summarizeAttachmentList(attachments);
    const timestamp = new Date().toISOString();
    const installedModels = await getModels();
    refreshRuntimeFromInstalled(installedModels);
    const attachmentContext = await buildAttachmentContext(attachments, installedModels);
    const promptText = [
      text,
      attachmentSummary ? `ATTACHMENTS:\n${attachmentSummary}` : "",
      attachmentContext ? `ATTACHMENT CONTEXT:\n${attachmentContext}` : ""
    ].filter(Boolean).join("\n\n");
    let active = getOrCreateActiveConversation(workspaceRoot());

    if (isExecutionRunning && currentTaskState.prompt) {
      const shouldQueueFollowup = runtimeState.followupBehavior === "queue" && !runtimeState.voice;
      if (shouldQueueFollowup) {
        queuedFollowUps.push({ text, attachments });
        currentTaskState.status = `Queued follow-up ${queuedFollowUps.length} for after the current run.`;
        postTaskState();
        postAgentResponse(webview, "That follow-up is queued. I will pick it up as soon as the current run finishes.");
        return;
      }

      parkedTaskState = cloneTaskState(currentTaskState);
      abortCurrentExecution("Current run was steered into a new request.");
      resetTaskState("Current run was steered. I am switching to the new request now.");
      postAgentResponse(webview, "Steering the current run into your new request now.");
    }

    if (isReviewRequest(promptText) && runtimeState.codeReviewBehavior === "detached") {
      active = startNewConversation(workspaceRoot());
      webview.postMessage({ command: "loadedConversation", messages: loadConversation(active.id) });
      webview.postMessage({ command: "history", items: conversationItems() });
      postAgentResponse(webview, "Opening this review in a detached chat so the main thread stays clean.");
    }

    appendConversationMessage(
      workspaceRoot(),
      { role: "user", text: text || (attachments.length ? `[${attachments.map((item) => item.name).join(", ")}]` : ""), timestamp },
      { conversationId: active.id, titleHint: text || "Agent Lee conversation" }
    );
    if (text.trim()) {
      const developerProfile = rememberDeveloperSignal(text);
      storeAgentMemory("developer-profile", "developer-signal-observed", {
        summary: buildDeveloperProfileSummary(developerProfile),
        sourceText: text.slice(0, 500)
      });
    }
    log("ask", { text, attachments, runtimeState, workspaceRoot: workspaceRoot(), conversationId: active.id });

    if (isSelfIdentityQuestion(text) && !attachments.length) {
      const finalText = agentLeeText(buildIdentityAnswer(), { voiceMode: "grounded" });
      appendConversationMessage(workspaceRoot(), { role: "agent", text: finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
      currentTaskState = {
        ...emptyTaskState(),
        mode: "ask",
        prompt: promptText,
        draftPrompt: promptText,
        summary: "Personal introduction handled directly in Agent Lee's own voice.",
        status: "Answered directly without planning.",
        activePhase: "answer"
      };
      postTaskState();
      postAgentResponse(webview, finalText);
      webview.postMessage({ command: "history", items: conversationItems() });
      await postRuntimeInfo(webview, text);
      return;
    }

    if (isCasualConversationPrompt(text) && !attachments.length) {
      const lightReply = await runLightConversation(text, installedModels);
      const finalText = agentLeeText(lightReply, { voiceMode: "grounded" });
      appendConversationMessage(workspaceRoot(), { role: "agent", text: finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
      currentTaskState = {
        ...emptyTaskState(),
        mode: "ask",
        prompt: promptText,
        draftPrompt: promptText,
        summary: "Natural conversational turn handled directly.",
        status: "Answered directly without planning.",
        activePhase: "answer"
      };
      postTaskState();
      postAgentResponse(webview, finalText);
      webview.postMessage({ command: "history", items: conversationItems() });
      await postRuntimeInfo(webview, text);
      return;
    }

    postAgentResponse(
      webview,
      flavoredStatusLine("loading"),
      { activity: { kind: "status", label: "Loading request context", detail: text || "Attachment-only request received." } }
    );

    const wantsExecution = isExecutionIntent(text);
    if (wantsExecution && currentTaskState.plan && currentTaskState.canExecute && currentTaskState.awaitingApproval && !isExecutionRunning) {
      if (!canExecuteApprovedPlan()) {
        postAgentResponse(webview, "Yo, execution only runs when Work Mode is Execute. Auto-run is a separate switch, and it stays off till you deliberately arm it.");
        return;
      }
      currentTaskState.status = "Execution requested from chat. Running the staged plan now.";
      postTaskState();
      postAgentResponse(webview, flavoredStatusLine("execute_now"));
      const execution = await executeCurrentPlan(webview, installedModels);
      if (execution) {
        appendConversationMessage(workspaceRoot(), { role: "agent", text: execution.finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
        postAgentResponse(webview, execution.finalText, { reportPath: execution.response.reportPath || "" });
        webview.postMessage({ command: "history", items: conversationItems() });
        await postRuntimeInfo(webview, currentTaskState.prompt || text || "execute");
        await runNextQueuedFollowUp(webview);
      }
      return;
    }

    if (parkedTaskState) {
      currentTaskState = {
        ...emptyTaskState(),
        mode: "ask",
        prompt: promptText,
        draftPrompt: promptText,
        summary: "Redirect question in progress. The paused task will return after this answer.",
        status: "Handling the redirect question while keeping the paused task parked.",
        activePhase: "answer"
      };
      syncLiveTodos();
      postTaskState();
      const response = await guardedAsk(promptText, installedModels);
      const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
      const finalText = stage.allowed ? finalizeResponse(response, "chat") : "Agent Lee governance blocked a non-sovereign response.";
      if (response.reportPath) lastReportPath = response.reportPath;
      appendConversationMessage(workspaceRoot(), { role: "agent", text: finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
      postAgentResponse(webview, finalText, { reportPath: response.reportPath || "" });
      currentTaskState = cloneTaskState(parkedTaskState);
      currentTaskState.status = "Redirect handled. Paused task restored.";
      parkedTaskState = null;
      postTaskState();
      webview.postMessage({ command: "history", items: conversationItems() });
      await postRuntimeInfo(webview, text);
      await runNextQueuedFollowUp(webview);
      return;
    }

    if (shouldAnswerDirectly(promptText)) {
      const reviewStyleRequest = isReviewRequest(promptText) || isRepositoryOpinionRequest(promptText);
      currentTaskState = {
        ...emptyTaskState(),
        mode: "ask",
        prompt: promptText,
        draftPrompt: promptText,
        summary: reviewStyleRequest
          ? "I am inspecting the workspace and preparing a direct review without staging an execution plan."
          : "I am answering directly from the live runtime and capability catalog.",
        status: reviewStyleRequest
          ? "Inspecting the workspace for a direct review."
          : "Answering directly without staging an execution plan.",
        activePhase: reviewStyleRequest ? "inspect" : "answer"
      };
      syncLiveTodos();
      postTaskState();
      const directTarget = reviewStyleRequest ? await resolvePromptContext(promptText) : undefined;
      const directPrebuiltContext = directTarget ? await buildPreloadedContext(directTarget, promptText) : undefined;
      const response = await guardedAsk(promptText, installedModels, directTarget
        ? {
            target: directTarget,
            prebuiltContext: directPrebuiltContext,
            telemetry: reviewStyleRequest
              ? {
                  onActivity: (event: { kind: "read" | "write" | "status"; label: string; file?: string; detail?: string }) => {
                    pushTaskActivity(event);
                  }
                }
              : undefined
          }
        : undefined);
      const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
      const finalText = stage.allowed ? finalizeResponse(response, "chat") : "Agent Lee governance blocked a non-sovereign response.";
      if (response.reportPath) lastReportPath = response.reportPath;
      appendConversationMessage(workspaceRoot(), { role: "agent", text: finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
      currentTaskState.status = reviewStyleRequest ? "Direct review finished." : "Direct answer finished.";
      currentTaskState.activePhase = "answer";
      postTaskState();
      postAgentResponse(webview, finalText, { reportPath: response.reportPath || "" });
      webview.postMessage({ command: "history", items: conversationItems() });
      await postRuntimeInfo(webview, text);
      await runNextQueuedFollowUp(webview);
      return;
    }

    if (runtimeState.workMode === "ask") {
      currentTaskState = {
        ...emptyTaskState(),
        mode: "ask",
        prompt: promptText,
        draftPrompt: promptText,
        summary: "Conversation mode is active. I will answer without staging an execution plan.",
        status: "Ask mode is answering directly.",
        activePhase: "answer"
      };
      syncLiveTodos();
      postTaskState();
      const response = await guardedAsk(promptText, installedModels);
      const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
      const finalText = stage.allowed ? finalizeResponse(response, "chat") : "Agent Lee governance blocked a non-sovereign response.";
      if (response.reportPath) lastReportPath = response.reportPath;
      appendConversationMessage(workspaceRoot(), { role: "agent", text: finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
      currentTaskState.status = "Ask mode finished the response.";
      postTaskState();
      postAgentResponse(webview, finalText, { reportPath: response.reportPath || "" });
      webview.postMessage({ command: "history", items: conversationItems() });
      await postRuntimeInfo(webview, text);
      await runNextQueuedFollowUp(webview);
      return;
    }

    const planned = await prepareTaskPlan(promptText, installedModels);

    const autoExecute =
      hasFullExecutionAccess() &&
      runtimeState.autoRunStagedPlans;

    if (autoExecute) {
      postAgentResponse(webview, flavoredStatusLine("execute_now"));
      const execution = await executeCurrentPlan(webview, installedModels);
      if (execution) {
        appendConversationMessage(workspaceRoot(), { role: "agent", text: execution.finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });
        postAgentResponse(webview, execution.finalText, { reportPath: execution.response.reportPath || "" });
        webview.postMessage({ command: "history", items: conversationItems() });
        await postRuntimeInfo(webview, currentTaskState.prompt || text || "execute");
        await runNextQueuedFollowUp(webview);
      }
      return;
    }

    const planText = [
      "PLAN",
      ...planned.plan.steps.map((step, index) => `${index + 1}. ${step.title}`),
      "",
      planned.plan.summary,
      "",
      planned.plan.approvalPrompt,
      planned.plan.executionHint ? `\n${planned.plan.executionHint}` : ""
    ].join("\n");
    currentTaskState.planResponse = planText;
    appendConversationMessage(workspaceRoot(), { role: "agent", text: planText, timestamp: new Date().toISOString() }, { conversationId: active.id });
    postAgentResponse(webview, planText);
    webview.postMessage({ command: "history", items: conversationItems() });
    await postRuntimeInfo(webview, text);
    await runNextQueuedFollowUp(webview);
  }
  } catch (error) {
    const detail = describeFileError(error);
    try {
      webview.postMessage({ command: "agentLeeUiResponse", text: `Agent Lee action failed: ${detail}` });
    } catch {}
    postAgentResponse(
      webview,
      `A runtime write or message step failed, so I could not finish that turn. ${detail}`,
      { speak: false, activity: { kind: "status", label: "Message handling failed", detail } }
    );
    console.error("[Agent Lee] Webview message handling failed.", error);
  }
}

function openPanel(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "agentLeeRuntimePanel",
    "Agent Lee",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")]
    }
  );
  panel.webview.html = getHtml(panel.webview, context);
  activeWebviews.add(panel.webview);
  panel.webview.onDidReceiveMessage((msg) => handle(panel.webview, msg, context));
}

async function openAgentLeeSidebar() {
  await vscode.commands.executeCommand(`workbench.view.extension.${AGENT_LEE_VIEW_CONTAINER_ID}`);
  try {
    await vscode.commands.executeCommand(`${AGENT_LEE_SIDEBAR_VIEW_ID}.focus`);
  } catch {
    // Older VS Code builds may not expose an explicit focus command for contributed webview views.
  }
}

function registerChatParticipant(context: vscode.ExtensionContext) {
  const chatApi = (vscode as any).chat;
  if (!chatApi?.createChatParticipant) {
    log("chat-participant-unavailable", { vscodeVersion: vscode.version });
    return;
  }

  const participant = chatApi.createChatParticipant(
    "leeway.agentLee",
    async (request: vscode.ChatRequest, _chatContext: vscode.ChatContext, response: vscode.ChatResponseStream): Promise<vscode.ChatResult> => {
      const sovereignRuntime = getAgentLeeRuntimeState();
      if (!sovereignRuntime.AGENT_LEE_RUNTIME_READY) {
        response.markdown(agentLeeText("Agent Lee runtime is degraded: persona module unavailable. Only scan and doctor style diagnostics should run until the sovereign runtime is healthy again."));
        return {};
      }

      const prompt = String(request.prompt || "").trim();
      if (!prompt) {
        response.markdown(agentLeeText("What's the move? Show me what's breaking or what you're trying to build."));
        return {};
      }

      response.progress("Inspecting the workspace and runtime...");
      const installedModels = await getModels();
      refreshRuntimeFromInstalled(installedModels);

      const active = getOrCreateActiveConversation(workspaceRoot());
      const timestamp = new Date().toISOString();
      appendConversationMessage(workspaceRoot(), { role: "user", text: prompt, timestamp }, { conversationId: active.id, titleHint: "Agent Lee chat" });

      const pluginAttempt = await attemptPluginRoute(prompt);
      if (pluginAttempt) {
        let pluginResult = pluginAttempt.result;
        if (pluginResult.requiresFollowUp) {
          const plugin = getPluginById(pluginAttempt.pluginCall.pluginId, effectiveEnabledPlugins());
          const choice = await promptAgentLeeWarning(
            `Agent Lee wants to use ${plugin?.name || pluginAttempt.pluginCall.pluginId} for "${pluginAttempt.pluginCall.action}" (${plugin?.riskLevel || "high"} risk).`,
            { routeLabel: "extension.chat-plugin-approval" },
            "Approve Once",
            "Cancel"
          );

          if (choice === "Approve Once") {
            pluginResult = await handlePluginCall(undefined, pluginAttempt.pluginCall, true);
          } else {
            clearPendingPluginApproval();
            response.markdown(agentLeeText("Plugin action cancelled."));
            return {};
          }
        }

        const pluginText = formatPluginResult(pluginResult);
        appendConversationMessage(workspaceRoot(), { role: "agent", text: pluginText, timestamp: new Date().toISOString() }, { conversationId: active.id });
        response.markdown(pluginText);
        return { metadata: { pluginId: pluginAttempt.pluginCall.pluginId, receiptId: pluginResult.receiptId || "" } };
      }

      const result = await guardedAsk(prompt, installedModels);
      const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
      const finalText = stage.allowed ? finalizeResponse(result, "chat") : "Agent Lee governance blocked a non-sovereign response.";

      if (result.reportPath) lastReportPath = result.reportPath;
      appendConversationMessage(workspaceRoot(), { role: "agent", text: finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });

      response.markdown(finalText);
      speak(finalText);
      return { metadata: { reportPath: result.reportPath || "", workspaceRoot: workspaceRoot() } };
    }
  ) as vscode.ChatParticipant;

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, "media", "agent-lee-icon.png");
  participant.followupProvider = {
    provideFollowups() {
      return [
        { prompt: "Inspect this workspace and summarize the front-end architecture.", label: "Inspect workspace" },
        { prompt: "Open the Agent Lee sidebar.", label: "Open sidebar", command: "openSidebar" },
        { prompt: "Review the current UI visually and give me evidence paths.", label: "Visual review" }
      ];
    }
  };

  context.subscriptions.push(participant);
}

export async function activate(context: vscode.ExtensionContext) {
  const provider = new Provider(context);
  const editBufferCodeLensProvider = new AgentLeeEditBufferCodeLensProvider();
  const output = vscode.window.createOutputChannel("Agent Lee LeeWay");
  agentLeeOutputChannel = output;
  runtimeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  runtimeStatusBarItem.name = "Agent Lee LeeWay";
  context.subscriptions.push(runtimeStatusBarItem);

  context.subscriptions.push(vscode.commands.registerCommand(AGENT_LEE_OPEN_PANEL_COMMAND, () => openPanel(context)));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.open", () => openPanel(context)));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.openSidebar", () => openAgentLeeSidebar()));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.runtimeStatus", async () => {
    await openAgentLeeSidebar();
    const state = getAgentLeeRuntimeState();
    const summary = getRuntimeProofSummary(state);
    const lines = summary.detailLines;
    appendAgentLeeLine(output, lines.join("\n"), { voiceMode: "operator" });
    updateRuntimeStatusBar(state);
    for (const webview of activeWebviews) {
      postAgentResponse(
        webview,
        `Yo, runtime status is ${summary.statusLabel}. I opened the Agent Lee chat surface and kept the raw proof in the output channel.`,
        { speak: false }
      );
    }
    await Promise.allSettled(Array.from(activeWebviews).map((webview) => postVisibleRuntimeState(webview)));
  }));

  context.subscriptions.push(vscode.window.registerWebviewViewProvider(AGENT_LEE_SIDEBAR_VIEW_ID, provider));
  context.subscriptions.push(vscode.languages.registerCodeLensProvider({ scheme: "file" }, editBufferCodeLensProvider));
  context.subscriptions.push(output);
  registerChatParticipant(context);
  registerAgentLeeEditBufferCommands(context, editBufferCodeLensProvider);
  registerAgentLeeLiveVoiceCommands(context, async (text) => {
    speak(text);
  });
  registerAgentLeeCodingSessionCommands(context, async (text) => {
    speak(text);
  });
  registerAgentLeePerformanceCommands(context, async (text) => {
    speak(text);
  });
  registerAgentLeeBackgroundIndexerCommands(context, async (text) => {
    speak(text);
  });
  registerAgentLeeCoreRuntimeServices(context, {
    pluginRouter,
  });
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.scanSelf", () => runWorkspaceScan(output, "scanSelf")));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.verifySelf", () => runWorkspaceScan(output, "verifySelf")));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.scanWorkspace", () => runWorkspaceScan(output, "scan")));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.verifyWorkspace", () => runWorkspaceScan(output, "verify")));

  context.subscriptions.push(vscode.commands.registerCommand("agentLee.fixWorkspace", async () => {
    try {
      await runWorkspaceFix(output);
    } catch (error) {
      const detail = describeFileError(error);
      output.appendLine(`Workspace fix failed: ${detail}`);
      output.show(true);
      showAgentLeeError(`Agent Lee fix failed: ${detail}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.askLocalModel", async () => {
    await runAskLocalModel(output);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.inspectWorkspace", async () => {
    try {
      assertAgentLeeRuntimeReady();
      const target = vscode.window.activeTextEditor?.document.uri.fsPath || workspaceRoot() || ROOT;
      const inspection = await inspectWorkspace(target);
      const message = agentLeeText([
        `Workspace root: ${inspection.workspaceRoot}`,
        `Relevant files: ${inspection.relevantFiles.length}`,
        `LeeWay average: ${inspection.leewayDirectoryAudit.averageCompliance}`,
        `Blocking files: ${inspection.leewayDirectoryAudit.blockingFiles}`,
        `Compile script: ${inspection.compileScript || "missing"}`,
        `Test script: ${inspection.testScript || "missing"}`,
        `Lint script: ${inspection.lintScript || "missing"}`
      ].join("\n"), { voiceMode: "operator" });
      output.appendLine(message);
      output.show(true);
      showAgentLeeInfo("Agent Lee inspected the workspace. See output for details.");
    } catch (error) {
      const detail = describeFileError(error);
      output.appendLine(`Workspace inspection failed: ${detail}`);
      output.show(true);
      showAgentLeeError(`Agent Lee inspect failed: ${detail}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.stagePatch", async () => {
    try {
      assertAgentLeeRuntimeReady();
      const request = await promptAgentLeeInputBox({
        prompt: "Describe the patch Agent Lee should stage for review"
      }, "extension.stage-patch");
      if (!request) return;
      const target = vscode.window.activeTextEditor?.document.uri.fsPath || workspaceRoot() || ROOT;
      const inspection = await inspectWorkspace(target);
      const plan = buildExecutionPlan(request, inspection);
      const staged = await stagePatch(plan);
      appendAgentLeeLine(output, `Staged patch summary: ${staged.summary}`, { voiceMode: "operator" });
      appendAgentLeeLine(output, `Approval required: ${staged.approvalRequired}`, { voiceMode: "operator" });
      appendAgentLeeLine(output, `Staged package: ${staged.stagedPackageId || "none"}`, { voiceMode: "operator" });
      output.show(true);
      showAgentLeeInfo("Agent Lee staged the patch for review.");
    } catch (error) {
      const detail = describeFileError(error);
      output.appendLine(`Stage patch failed: ${detail}`);
      output.show(true);
      showAgentLeeError(`Agent Lee stage patch failed: ${detail}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.applyApprovedPatch", async () => {
    try {
      assertAgentLeeRuntimeReady();
      const staged = getLatestStagedPatch();
      if (!staged?.stagedPackageId) {
        showAgentLeeWarning("No staged Agent Lee patch is ready to apply.");
        return;
      }
      editBufferStore.acceptAll(staged.stagedPackageId);
      const result = await vscode.commands.executeCommand("agentLee.editBuffer.applyAccepted", staged.stagedPackageId);
      appendAgentLeeLine(output, `Apply approved patch requested for ${staged.stagedPackageId}.`, { voiceMode: "operator" });
      if (result) appendAgentLeeLine(output, String(result), { voiceMode: "operator" });
      output.show(true);
    } catch (error) {
      const detail = describeFileError(error);
      output.appendLine(`Apply approved patch failed: ${detail}`);
      output.show(true);
      showAgentLeeError(`Agent Lee apply failed: ${detail}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.runVerification", async () => {
    try {
      assertAgentLeeRuntimeReady();
      const target = vscode.window.activeTextEditor?.document.uri.fsPath || workspaceRoot() || ROOT;
      const results = await runEngineeringVerification(target);
      for (const result of results) {
        appendAgentLeeLine(output, `${result.ok ? "PASS" : "FAIL"} ${result.command} :: ${result.summary}`, { voiceMode: "operator" });
      }
      output.show(true);
      if (results.every((result) => result.ok)) {
        showAgentLeeInfo("Agent Lee verification passed.");
      } else {
        showAgentLeeWarning("Agent Lee verification found failures. See output for details.");
      }
    } catch (error) {
      const detail = describeFileError(error);
      output.appendLine(`Engineering verification failed: ${detail}`);
      output.show(true);
      showAgentLeeError(`Agent Lee verification failed: ${detail}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.showReceipts", async () => {
    const receiptsDir = path.join(ROOT, "reports", "engineering-runs");
    fs.mkdirSync(receiptsDir, { recursive: true });
    await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(receiptsDir));
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.testPersona", async () => {
    assertAgentLeeRuntimeReady();
    const personaOutput = testPersona();
    appendAgentLeeLine(output, `Diagnostic probe confirmed the always-on persona runtime.\n\n${personaOutput}`, { voiceMode: "grounded" });
    output.show(true);
    showAgentLeeInfo("Agent Lee persona diagnostic wrote its output. It did not activate persona because Agent Lee is already active.");
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.engineerTask", async () => {
    try {
      assertAgentLeeRuntimeReady();
      const request = await promptAgentLeeInputBox({
        prompt: "Describe the engineering task Agent Lee should inspect, stage, and verify"
      }, "extension.engineer-task");
      if (!request) return;
      const target = vscode.window.activeTextEditor?.document.uri.fsPath || workspaceRoot() || ROOT;
      const result = await runAgentEngineeringTask(request, target);
      appendAgentLeeLine(output, `Engineering task state: ${result.state}`, { voiceMode: "operator" });
      appendAgentLeeLine(output, `Receipt: ${result.receiptPath}`, { voiceMode: "operator" });
      appendAgentLeeLine(output, `Verification commands: ${result.verification.length}`, { voiceMode: "operator" });
      output.show(true);
      showAgentLeeInfo(`Agent Lee engineering task finished in state ${result.state}.`);
    } catch (error) {
      const detail = describeFileError(error);
      output.appendLine(`Engineering task failed: ${detail}`);
      output.show(true);
      showAgentLeeError(`Agent Lee engineering task failed: ${detail}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.openReadme", () => openReadme(context)));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.installPyCharmTools", () => {
    const result = installPyCharmTooling();
    showAgentLeeInfo(result);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.newChat", () => {
    startNewConversation(workspaceRoot());
    showAgentLeeInfo("Agent Lee started a new conversation.");
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.stopVoice", () => {
    stopVoicePlayback();
    showAgentLeeInfo("Agent Lee voice stopped.");
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.executionBrain.createPendingEdit", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      showAgentLeeWarning(
        "I need an active file before I can create this pending edit package. Open the target file first, then run the command again.",
        { routeLabel: "extension.execution-brain.create-pending-edit" }
      );
      return;
    }

    const document = editor.document;
    const originalText = document.getText();
    const insertion = "/* Agent Lee Execution Brain verified this file path. */\n";

    await sendExecutionPlanToEditBuffer({
      title: "Execution Brain Pending Edit Demo",
      objective: "Verify the execution brain can create real pending edits.",
      hunks: [
        {
          filePath: document.uri.fsPath,
          title: "Insert Agent Lee execution marker",
          reason: "Testing execution-brain to edit-buffer bridge.",
          originalText: originalText.slice(0, 0),
          proposedText: insertion,
          startOffset: 0,
          endOffset: 0,
          risk: "low"
        }
      ]
    });
  }));
  context.subscriptions.push(vscode.commands.registerCommand(
    "agentLee.executionBrain.createRepairPackageDemo",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showAgentLeeWarning(
          "I need an active file before I can create this repair package demo. Open the target file first, then run the command again.",
          { routeLabel: "extension.execution-brain.create-repair-demo" }
        );
        return;
      }

      const document = editor.document;
      const firstLine = document.lineAt(0);

      await sendVerificationRepairsToEditBuffer({
        title: "Agent Lee Repair Candidate Demo",
        objective: "Verify repair candidates can become pending edit packages.",
        candidates: [
          {
            filePath: document.uri.fsPath,
            title: "Demo repair hunk",
            message: "Demo verification repair candidate.",
            originalText: firstLine.text,
            proposedText: `${firstLine.text}\n// Agent Lee repair candidate preview`,
            line: 0,
            risk: "low"
          }
        ]
      });
    }
  ));
  context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(() => refreshAgentLeeDecorations()));
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => refreshAgentLeeDecorations()));
  context.subscriptions.push(editBufferStore.onDidChange(() => {
    refreshAgentLeeDecorations();
    editBufferCodeLensProvider.refresh();
  }));
  refreshAgentLeeDecorations();

  initializeAgentLeeRuntime(context)
    .then(async (state) => {
      updateRuntimeStatusBar(state);
      await Promise.allSettled(Array.from(activeWebviews).map((webview) => postVisibleRuntimeState(webview)));
      if (state.degraded) {
        appendAgentLeeLine(output, buildRuntimeDegradedMessage(state), { voiceMode: "operator" });
        output.show(true);
        showAgentLeeWarning(buildRuntimeDegradedMessage(state), { routeLabel: "extension.runtime-degraded-root" });
      }
    })
    .catch((error) => {
      const detail = describeFileError(error);
      output.appendLine(`Runtime initialization failed: ${detail}`);
      output.show(true);
      updateRuntimeStatusBar(getAgentLeeRuntimeState());
      void Promise.allSettled(Array.from(activeWebviews).map((webview) => postVisibleRuntimeState(webview)));
      showAgentLeeWarning(`Agent Lee runtime initialized in degraded mode: ${detail}`);
    });
}

export function deactivate() {
  stopVoicePlayback();
  stopBrowserPreviews();
}

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/
