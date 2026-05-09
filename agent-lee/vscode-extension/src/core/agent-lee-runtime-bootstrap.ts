/*
LEEWAY_HEADER - DO NOT REMOVE

TAG: CORE.RUNTIME.AGENTLEE.BOOTSTRAP
REGION: 🟢 CORE
PURPOSE: Automatic runtime bootstrap that makes Agent Lee the always-on identity layer.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

import * as fs from "fs";
import * as path from "path";
import type * as vscode from "vscode";
import { formatAgentRoutedMessage } from "./agent-governance";
import { appendFileWithRetries } from "./file-ops";
import {
  type AgentLeeRootSource,
  getInternalAgentsRoot,
  getInternalMcpRoot,
  getInternalSdkRoot,
  loadAgentRegistry,
  loadLeewaySdkManifest,
  loadMcpRegistry,
  validateStandaloneConnectivity
} from "./leeway-connectivity-loader";
import { AGENT_LEE_SOVEREIGN_RUNTIME_LAW, buildAgentLeeModelInstructions } from "./model-governance";
import { buildAgentLeeRuntimePrompt, formatAgentLeeResponse, validatePersonaSystem } from "../persona/persona-runtime-bridge";

export type AgentLeeRuntimeState = {
  AGENT_LEE_RUNTIME_READY: boolean;
  degraded: boolean;
  degradedReason: string;
  personaModuleLoaded: boolean;
  connectivityLoaded: boolean;
  mcpRegistryLoaded: boolean;
  agentRegistryLoaded: boolean;
  sdkManifestLoaded: boolean;
  modelRoutesAvailable: boolean;
  writePolicyActive: boolean;
  doctorStatus: "unknown" | "pass" | "fail";
  initializedAt: string;
  receiptPath: string;
  mcpCount: number;
  agentCount: number;
  runtimeRoot: string;
  resolvedRoot: string;
  rootSource: AgentLeeRootSource;
  missingConnectivityPaths: string[];
};

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const RECEIPT_FILE = path.join(ROOT, "logs", "agent-lee", "runtime-receipts.ndjson");
const ROUTING_FILE = path.join(ROOT, "agent-lee", "models", "model-routing.json");
const REPORTS_ROOT = path.join(ROOT, "reports");
const DOCTOR_REPORT_FILE = "AGENT_LEE_DOCTOR.md";
const COMPLIANCE_REPORTS_ROOT = path.join(ROOT, "agent-lee", "reports", "compliance");

let runtimeState: AgentLeeRuntimeState = {
  AGENT_LEE_RUNTIME_READY: false,
  degraded: true,
  degradedReason: "Agent Lee runtime has not been initialized yet.",
  personaModuleLoaded: false,
  connectivityLoaded: false,
  mcpRegistryLoaded: false,
  agentRegistryLoaded: false,
  sdkManifestLoaded: false,
  modelRoutesAvailable: false,
  writePolicyActive: true,
  doctorStatus: "unknown",
  initializedAt: "",
  receiptPath: RECEIPT_FILE,
  mcpCount: 0,
  agentCount: 0,
  runtimeRoot: "",
  resolvedRoot: "",
  rootSource: "degraded",
  missingConnectivityPaths: []
};

function countRegistryEntries(value: unknown, preferredKey: string) {
  if (!value || typeof value !== "object") return 0;
  const record = value as Record<string, unknown>;
  const candidate = record[preferredKey];
  if (Array.isArray(candidate)) return candidate.length;
  if (candidate && typeof candidate === "object") return Object.keys(candidate as Record<string, unknown>).length;
  return Object.keys(record).length;
}

function hasModelRoutes() {
  try {
    const content = JSON.parse(fs.readFileSync(ROUTING_FILE, "utf8")) as Record<string, unknown>;
    return Object.keys(content).length > 0;
  } catch {
    return false;
  }
}

function readLatestDoctorReportPath() {
  try {
    if (!fs.existsSync(REPORTS_ROOT)) return null;
    const candidates = fs.readdirSync(REPORTS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^doctor-\d{8}-\d{6}$/.test(entry.name))
      .map((entry) => {
        const reportPath = path.join(REPORTS_ROOT, entry.name, DOCTOR_REPORT_FILE);
        if (!fs.existsSync(reportPath)) return null;
        const stat = fs.statSync(reportPath);
        return { reportPath, mtimeMs: stat.mtimeMs };
      })
      .filter((entry): entry is { reportPath: string; mtimeMs: number } => Boolean(entry))
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
    return candidates[0]?.reportPath ?? null;
  } catch {
    return null;
  }
}

function parseDoctorStatusFromReport(reportPath: string): "unknown" | "pass" | "fail" {
  try {
    const content = fs.readFileSync(reportPath, "utf8");
    const failedChecks = content.match(/- Failed checks:\s*(\d+)/);
    if (!failedChecks) return "unknown";
    return Number(failedChecks[1]) === 0 ? "pass" : "fail";
  } catch {
    return "unknown";
  }
}

function readLatestComplianceReport() {
  try {
    if (!fs.existsSync(COMPLIANCE_REPORTS_ROOT)) return null;
    const candidates = fs.readdirSync(COMPLIANCE_REPORTS_ROOT)
      .filter((file) => /^agent-lee-(scan|verify)-report-.*\.json$/.test(file))
      .map((file) => {
        const full = path.join(COMPLIANCE_REPORTS_ROOT, file);
        const stat = fs.statSync(full);
        return { path: full, mtimeMs: stat.mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
    
    if (!candidates.length) return null;
    
    const latest = candidates[0];
    const data = JSON.parse(fs.readFileSync(latest.path, "utf8"));
    // Ensure it was a self-scan/standaloneRoot scan
    if (data.summary?.mode !== "self" && !data.scannedRoot?.includes("agent-lee")) return null;
    
    const blockingCount = data.summary?.blockingCount ?? data.blockingFiles?.length ?? 0;
    return {
      status: (blockingCount === 0 ? "pass" : "fail") as "pass" | "fail",
      mtimeMs: latest.mtimeMs,
      path: latest.path
    };
  } catch {
    return null;
  }
}

export function recordAgentLeeRuntimeReceipt(event: Record<string, unknown>) {
  appendFileWithRetries(RECEIPT_FILE, JSON.stringify({
    ts: new Date().toISOString(),
    scope: "agent-lee-runtime",
    ...event
  }) + "\n");
}

export function setDoctorStatus(status: "unknown" | "pass" | "fail") {
  runtimeState = {
    ...runtimeState,
    doctorStatus: status
  };
  recordAgentLeeRuntimeReceipt({
    event: "runtime.doctor-status.updated",
    doctorStatus: status
  });
  return runtimeState.doctorStatus;
}

export function getDoctorStatus() {
  return runtimeState.doctorStatus;
}

export function refreshDoctorStatus() {
  const doctorReportPath = readLatestDoctorReportPath();
  const doctorReportStatus = doctorReportPath ? parseDoctorStatusFromReport(doctorReportPath) : "unknown";
  const doctorReportMtime = doctorReportPath ? fs.statSync(doctorReportPath).mtimeMs : 0;

  const complianceReport = readLatestComplianceReport();
  
  let status: "unknown" | "pass" | "fail" = doctorReportStatus;
  let sourcePath = doctorReportPath || "";

  // Prefer compliance report if newer and valid
  if (complianceReport && complianceReport.mtimeMs > doctorReportMtime) {
    status = complianceReport.status;
    sourcePath = complianceReport.path;
  }

  runtimeState = {
    ...runtimeState,
    doctorStatus: status
  };
  recordAgentLeeRuntimeReceipt({
    event: "runtime.doctor-status.refreshed",
    doctorStatus: status,
    sourcePath
  });
  return status;
}

export async function initializeAgentLeeRuntime(_context?: vscode.ExtensionContext) {
  const connectivity = validateStandaloneConnectivity(_context);
  const personaValidation = validatePersonaSystem(_context);
  const mcpRegistry = loadMcpRegistry(_context);
  const agentRegistry = loadAgentRegistry(_context);
  const sdkManifest = loadLeewaySdkManifest(_context);
  const modelRoutesAvailable = hasModelRoutes();
  const doctorStatus = refreshDoctorStatus();
  const missingConnectivityPaths = connectivity.missingConnectivityPaths;

  const degradedReasons: string[] = [];
  if (!connectivity.valid) degradedReasons.push(`connectivity missing: ${missingConnectivityPaths.join(", ")}`);
  if (!personaValidation.valid) degradedReasons.push("persona module unavailable");
  if (!modelRoutesAvailable) degradedReasons.push("model routing configuration unavailable");

  runtimeState = {
    AGENT_LEE_RUNTIME_READY: degradedReasons.length === 0,
    degraded: degradedReasons.length > 0,
    degradedReason: degradedReasons.length ? `Agent Lee runtime is degraded: ${degradedReasons.join("; ")}.` : "",
    personaModuleLoaded: personaValidation.valid,
    connectivityLoaded: connectivity.valid,
    mcpRegistryLoaded: countRegistryEntries(mcpRegistry, "tools") > 0,
    agentRegistryLoaded: countRegistryEntries(agentRegistry, "agents") > 0,
    sdkManifestLoaded: Object.keys((sdkManifest || {}) as Record<string, unknown>).length > 0,
    modelRoutesAvailable,
    writePolicyActive: true,
    doctorStatus,
    initializedAt: new Date().toISOString(),
    receiptPath: RECEIPT_FILE,
    mcpCount: countRegistryEntries(mcpRegistry, "tools"),
    agentCount: countRegistryEntries(agentRegistry, "agents"),
    runtimeRoot: connectivity.root,
    resolvedRoot: connectivity.root,
    rootSource: connectivity.rootSource,
    missingConnectivityPaths
  };

  recordAgentLeeRuntimeReceipt({
    event: "runtime.initialized",
    ready: runtimeState.AGENT_LEE_RUNTIME_READY,
    degraded: runtimeState.degraded,
    degradedReason: runtimeState.degradedReason,
    personaModuleLoaded: runtimeState.personaModuleLoaded,
    connectivityLoaded: runtimeState.connectivityLoaded,
    mcpRegistryLoaded: runtimeState.mcpRegistryLoaded,
    agentRegistryLoaded: runtimeState.agentRegistryLoaded,
    modelRoutesAvailable: runtimeState.modelRoutesAvailable,
    writePolicyActive: runtimeState.writePolicyActive,
    doctorStatus: runtimeState.doctorStatus,
    resolvedRoot: runtimeState.resolvedRoot,
    rootSource: runtimeState.rootSource,
    missingConnectivityPaths: runtimeState.missingConnectivityPaths,
    mcpRoot: getInternalMcpRoot(_context),
    agentRoot: getInternalAgentsRoot(_context),
    sdkRoot: getInternalSdkRoot(_context)
  });

  return runtimeState;
}

export function assertAgentLeeRuntimeReady() {
  if (!runtimeState.AGENT_LEE_RUNTIME_READY) {
    throw new Error(runtimeState.degradedReason || "Agent Lee runtime is degraded: persona module unavailable.");
  }
}

export function getAgentLeeRuntimeState() {
  return { ...runtimeState };
}

export function formatThroughAgentLee(
  text: string,
  context?: { voiceMode?: string; preserveRaw?: boolean; routeLabel?: string }
) {
  const sourceText = String(text || "");
  if (context?.preserveRaw) return sourceText;

  const routed = context?.routeLabel
    ? formatAgentRoutedMessage(context.routeLabel, sourceText)
    : sourceText;

  if (!runtimeState.personaModuleLoaded) {
    return `${runtimeState.degradedReason || "Agent Lee runtime is degraded: persona module unavailable."}\n\n${routed}`.trim();
  }

  return formatAgentLeeResponse(routed, context?.voiceMode || "operator");
}

export function buildModelPromptThroughAgentLee(
  userPrompt: string,
  context?: { taskContext?: string; voiceMode?: string; modelName?: string }
) {
  assertAgentLeeRuntimeReady();

  if (/AGENT LEE SOVEREIGN RUNTIME LAW/.test(userPrompt)) {
    return userPrompt;
  }

  return [
    buildAgentLeeRuntimePrompt(
      context?.taskContext || "Agent Lee sovereign runtime model call.",
      userPrompt,
      context?.voiceMode || "operator"
    ),
    "",
    buildAgentLeeModelInstructions({
      modelName: context?.modelName,
      taskContext: context?.taskContext,
      userPrompt
    }),
    "",
    AGENT_LEE_SOVEREIGN_RUNTIME_LAW
  ].join("\n\n");
}
