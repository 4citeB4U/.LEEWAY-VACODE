/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.GOVERNANCE.APPLICATION.IDENTITY_GRAPH
PURPOSE: Canonical LeeWay application identity graph for production runtime, fallback runtime, packaging, and governance ownership.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

export type LeeWayApplicationNodeClassification =
  | "PRODUCTION_START"
  | "PRODUCTION_RUNTIME"
  | "LOCAL_RUNTIME"
  | "BROWSER_FALLBACK"
  | "COMMAND_ROUTE"
  | "EVENT_ROUTE"
  | "TOOL_BUS"
  | "TURN_GATE"
  | "PLAYBACK_GATE"
  | "CONFIGURATION"
  | "PACKAGING"
  | "GOVERNANCE_GATE"
  | "TEST_HARNESS"
  | "EVIDENCE"
  | "RECEIPT"
  | "GENERATED_TRANSIENT"
  | "DEPRECATED_DELETE"
  | "QUARANTINE";

export type LeeWayApplicationNodeStatus =
  | "ACTIVE"
  | "FALLBACK"
  | "TEST_ONLY"
  | "GENERATED"
  | "DELETE_PENDING";

export interface LeeWayApplicationIdentityNode {
  id: string;
  name: string;
  classification: LeeWayApplicationNodeClassification;
  owner: "LEEWAY" | "AGENT_LEE" | "LAVR";
  domain: string;
  pipeline: string;
  file: string;
  runtimeRole: string;
  exports?: string[];
  registeredCommands?: string[];
  commandsEmitted?: string[];
  commandsHandled?: string[];
  eventsEmitted?: string[];
  eventsHandled?: string[];
  ownedPathPrefixes?: string[];
  inputs?: string[];
  outputs?: string[];
  verification: string[];
  evidence?: string[];
  status: LeeWayApplicationNodeStatus;
}

export const LEEWAY_APPLICATION_IDENTITY_GRAPH_VERSION = "2026-05-14.pass2";

const WEBVIEW_TO_HOST_COMMANDS = [
  "activateClonedVoice",
  "agentLeeUiReady",
  "agentVmDiagnosticEvent",
  "approveAllProposedEdits",
  "approvePluginCall",
  "approveProposedEdit",
  "cancelPluginCall",
  "leewayStartTranscriptBridge",
  "leewayVoiceEvent",
  "leewayVoiceTurnCommit",
  "loadConversation",
  "newConversation",
  "openReadme",
  "openTaskFile",
  "pickAttachments",
  "pickVoiceReference",
  "refreshRuntime",
  "rejectProposedEdit",
  "reviewProposedEdit",
  "saveVoiceCloneSettings",
  "sendMessage",
  "setPerformanceProfile",
  "setState",
  "stopVoice",
  "testClonedVoice",
  "transcribeVoiceReference",
  "updateAgentLeeNow",
  "useBundledReferenceVoice",
  "voiceAlActivateDefault",
  "voiceAlCloneAndPreview",
  "voiceAlDeleteVoice",
  "voiceAlPickAudio",
  "voiceAlRecordMic",
  "voiceAlSaveClone",
  "voiceAlSetActive",
  "voiceAlTestDefault",
  "voiceAlTestVoice"
] as const;

const HOST_TO_WEBVIEW_COMMANDS = [
  "agentLeeUiResponse",
  "agentVmDiagnosticRecorded",
  "attachmentsPicked",
  "history",
  "leewayVoiceToolCompleted",
  "loadedConversation",
  "modelOptions",
  "pluginConfirmation",
  "pluginConfirmationCleared",
  "response",
  "runtimeInfo",
  "status",
  "visibleRuntimeState",
  "voiceAlCatalogUpdate",
  "voiceCloneStatus",
  "voiceReferencePicked",
  "voiceReferenceTranscribed"
] as const;

const CORE_VSCODE_COMMANDS = [
  "agentLee.open",
  "agentLee.openPanel",
  "agentLee.openSidebar",
  "agentLee.scanSelf",
  "agentLee.verifySelf",
  "agentLee.scanWorkspace",
  "agentLee.verifyWorkspace",
  "agentLee.fixWorkspace",
  "agentLee.askLocalModel",
  "agentLee.engineerTask",
  "agentLee.inspectWorkspace",
  "agentLee.stagePatch",
  "agentLee.applyApprovedPatch",
  "agentLee.runVerification",
  "agentLee.showReceipts",
  "agentLee.runtimeStatus",
  "agentLee.testPersona",
  "agentLee.openReadme",
  "agentLee.installPyCharmTools",
  "agentLee.newChat",
  "agentLee.stopVoice",
  "agentLee.executionBrain.createPendingEdit",
  "agentLee.executionBrain.createRepairPackageDemo"
] as const;

const LEGACY_MANIFEST_COMMANDS = [
  "agentLee.recoverUi",
  "agentLee.repairInstallation"
] as const;

const VISUAL_VSCODE_COMMANDS = [
  "agentLee.visual.openPanel",
  "agentLee.visual.systemStatus",
  "agentLee.visual.revealWorkspace"
] as const;

const LIVE_VOICE_VSCODE_COMMANDS = [
  "agentLee.liveVoice.chat",
  "agentLee.liveVoice.explainActiveContext",
  "agentLee.liveVoice.createPendingEditFromSpeech",
  "agentLee.liveVoice.speakStatus",
  "agentLee.liveVoice.emitEvent",
  "agentLee.liveVoice.handleTranscript",
  "agentLee.liveVoice.startTranscriptBridge",
  "agentLee.liveVoice.stopTranscriptBridge",
  "agentLee.liveVoice.stopSpeaking",
  "agentLee.liveVoice.pauseTask",
  "agentLee.liveVoice.resumeTask",
  "agentLee.liveVoice.currentStatus",
  "agentLee.liveVoice.reopenActiveDiff",
  "agentLee.liveVoice.sessionSummary",
  "agentLee.liveVoice.blockFile",
  "agentLee.liveVoice.unblockFile"
] as const;

const SESSION_VSCODE_COMMANDS = [
  "agentLee.session.start",
  "agentLee.session.pause",
  "agentLee.session.resume",
  "agentLee.session.stop",
  "agentLee.session.status",
  "agentLee.session.summary",
  "agentLee.session.exportReceipt"
] as const;

const PERFORMANCE_VSCODE_COMMANDS = [
  "agentLee.performance.setProfile",
  "agentLee.performance.quietMode",
  "agentLee.performance.raspberryPiMode",
  "agentLee.performance.status",
  "agentLee.performance.setOverride",
  "agentLee.performance.clearOverrides",
  "agentLee.performance.services",
  "agentLee.performance.pauseServices",
  "agentLee.performance.resumeServices",
  "agentLee.performance.disposeIdleServices",
  "agentLee.performance.warmCoreServices"
] as const;

const INDEXING_VSCODE_COMMANDS = [
  "agentLee.indexing.runBatch",
  "agentLee.indexing.status",
  "agentLee.indexing.pause",
  "agentLee.indexing.resume",
  "agentLee.indexing.relatedFiles",
  "agentLee.indexing.dependencyStatus",
  "agentLee.indexing.missingHeaders",
  "agentLee.indexing.commandMap",
  "agentLee.indexing.symbolSearch"
] as const;

const EDIT_BUFFER_VSCODE_COMMANDS = [
  "agentLee.editBuffer.acceptHunk",
  "agentLee.editBuffer.rejectHunk",
  "agentLee.editBuffer.explainHunk",
  "agentLee.editBuffer.openDiff",
  "agentLee.editBuffer.acceptFile",
  "agentLee.editBuffer.rejectFile",
  "agentLee.editBuffer.acceptAll",
  "agentLee.editBuffer.applyAccepted",
  "agentLee.editBuffer.applyAcceptedAndVerify",
  "agentLee.editBuffer.acceptActiveHunk",
  "agentLee.editBuffer.rejectActiveHunk",
  "agentLee.editBuffer.openActiveDiff"
] as const;

const EXTENSION_HANDLED_COMMANDS = [
  "activateClonedVoice",
  "activatePiperVoice",
  "agentLeeUiAction",
  "agentLeeUiError",
  "agentLeeUiReady",
  "agentLeeUiResponse",
  "agentVmDiagnosticEvent",
  "agentVmDiagnosticRecorded",
  "approveAllProposedEdits",
  "approvePlan",
  "approvePluginCall",
  "approveProposedEdit",
  "ask",
  "askLocalModel",
  "attachmentsPicked",
  "cancelPluginCall",
  "clearChat",
  "engineerTask",
  "executePlan",
  "history",
  "installPyCharmTools",
  "interruptTask",
  "leewayStartTranscriptBridge",
  "leewayVoiceEvent",
  "leewayVoiceInterruptRequested",
  "leewayVoiceToolCompleted",
  "leewayVoiceTurnCommit",
  "loadConversation",
  "loadedConversation",
  "modelOptions",
  "muteVoice",
  "newConversation",
  "openReadme",
  "openReceipts",
  "openReport",
  "openTaskFile",
  "pickAttachments",
  "pickVoiceReference",
  "pluginConfirmation",
  "pluginConfirmationCleared",
  "progress",
  "ready",
  "refreshCatalog",
  "refreshRuntime",
  "rejectPlan",
  "rejectProposedEdit",
  "response",
  "resumeParkedTask",
  "reviewProposedEdit",
  "runtimeInfo",
  "runtimeStatus",
  "savePlan",
  "saveVoiceCloneSettings",
  "scanSelf",
  "scanWorkspace",
  "sendMessage",
  "setPerformanceProfile",
  "setState",
  "status",
  "stopTask",
  "stopVoice",
  "talkOn",
  "taskState",
  "testClonedVoice",
  "transcribeVoiceReference",
  "updateAgentLeeNow",
  "updateTaskPrompt",
  "useBundledReferenceVoice",
  "verifySelf",
  "verifyWorkspace",
  "voiceAlActivateDefault",
  "voiceAlCatalogUpdate",
  "voiceAlCloneAndPreview",
  "voiceAlDeleteVoice",
  "voiceAlPickAudio",
  "voiceAlRecordMic",
  "voiceAlSaveClone",
  "voiceAlSetActive",
  "voiceAlTestDefault",
  "voiceAlTestVoice",
  "voiceCloneStatus",
  "voiceReferencePicked",
  "voiceReferenceTranscribed"
] as const;

const LAVR_RUNTIME_EVENTS = [
  "LAVR_SESSION_CONNECTED",
  "LAVR_SESSION_STARTED",
  "LAVR_SESSION_CLOSED",
  "LAVR_SESSION_DISCONNECTED",
  "LAVR_FALLBACK_BRIDGE_REQUESTED",
  "LAVR_USER_AUDIO_DELTA",
  "LAVR_USER_SPEECH_STARTED",
  "LAVR_USER_SPEECH_STOPPED",
  "LAVR_SPEECH_STARTED",
  "LAVR_SPEECH_PARTIAL",
  "LAVR_SPEECH_FINAL",
  "LAVR_TURN_STARTED",
  "LAVR_PARTIAL_UPDATED",
  "LAVR_FINAL_RECEIVED",
  "LAVR_SILENCE_TIMEOUT",
  "LAVR_COMMIT_SCHEDULED",
  "LAVR_TURN_COMMITTED",
  "LAVR_COMMIT_EMITTED",
  "LAVR_DUPLICATE_COMMIT_SUPPRESSED",
  "LAVR_TURN_CANCELLED",
  "LAVR_ASSISTANT_RESPONSE_STARTED",
  "LAVR_ASSISTANT_AUDIO_DELTA",
  "LAVR_ASSISTANT_TRANSCRIPT_DELTA",
  "LAVR_ASSISTANT_RESPONSE_DONE",
  "LAVR_INTERRUPT_REQUESTED",
  "LAVR_TOOL_REQUESTED",
  "LAVR_TOOL_COMPLETED",
  "LAVR_ERROR"
] as const;

const LAVR_PLAYBACK_EVENTS = [
  "LAVR_PLAYBACK_STARTED",
  "LAVR_PLAYBACK_SEGMENT_QUEUED",
  "LAVR_PLAYBACK_STOP_REQUESTED",
  "LAVR_PLAYBACK_STOPPED",
  "LAVR_PLAYBACK_CANCELLED",
  "LAVR_PLAYBACK_COMPLETED",
  "LAVR_PLAYBACK_STALE_SEGMENT_SUPPRESSED",
  "LAVR_PLAYBACK_DUPLICATE_STOP_SUPPRESSED"
] as const;

const RUNTIME_EVIDENCE = [
  "agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json",
  "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json",
  "agent-lee/vscode-extension/test-evidence/lavr-playback-gate-dynamic-result.json",
  "agent-lee/vscode-extension/test-evidence/leeway-application-integrity-result.json"
] as const;

export const LEEWAY_APPLICATION_REQUIRED_NODE_IDS = [
  "LEEWAY_APP::BOOT::EXTENSION_HOST::ENTRYPOINT",
  "LEEWAY_APP::BOOT::EXTENSION_HOST::ACTIVATION",
  "LEEWAY_APP::BOOT::MANIFEST::COMMAND_REGISTRATION",
  "LEEWAY_APP::WEBVIEW::PANEL::HTML_RUNTIME",
  "LEEWAY_APP::WEBVIEW::COMMAND_ROUTER::WEBVIEW_TO_HOST",
  "LEEWAY_APP::HOST::COMMAND_ROUTER::HOST_TO_WEBVIEW",
  "LEEWAY_APP::CONFIG::RUNTIME_SETTINGS::HYDRATION",
  "LEEWAY_APP::WORKSPACE::INTELLIGENCE::ROOT",
  "LEEWAY_APP::MODEL_HIVE::ROUTER::MODEL_SELECTION",
  "LEEWAY_APP::ENGINEERING_LOOP::ROOT",
  "LEEWAY_APP::GOVERNANCE::LAW_ENGINE::ROOT",
  "LEEWAY_APP::PERSONA::BRIDGE::RUNTIME_PROMPT",
  "LEEWAY_APP::CAPABILITY::CATALOG::BUILDER",
  "LEEWAY_APP::BROWSER::VALIDATOR::ROOT",
  "LEEWAY_APP::MEMORY::STORE::LOCAL_MEMORY",
  "LEEWAY_APP::VOICE::LAVR::LOCAL_RUNTIME",
  "LEEWAY_APP::VOICE::LAVR::BROWSER_FALLBACK",
  "LEEWAY_APP::VOICE::LAVR::TURN_GATE",
  "LEEWAY_APP::VOICE::LAVR::TOOL_BUS",
  "LEEWAY_APP::VOICE::LAVR::PLAYBACK_GATE",
  "LEEWAY_APP::VOICE::LAVR::TRANSCRIPT_BRIDGE",
  "LEEWAY_APP::VOICE::LAVR::INTERRUPT_GATE",
  "LEEWAY_APP::PACKAGE::VSIX::BUILD",
  "LEEWAY_APP::PACKAGE::VSIX::LEAKAGE_SCAN",
  "LEEWAY_APP::PACKAGE::QUARANTINE::DIST_EXTENSION_JS",
  "LEEWAY_APP::GOVERNANCE::INTEGRITY_GATE::ROOT",
  "LEEWAY_APP::GATE::APPLICATION_IDENTITY_GRAPH",
  "LEEWAY_APP::GOVERNANCE::DOCTOR::BASELINE",
  "LEEWAY_APP::GOVERNANCE::COMPLIANCE::LEEWAY_HEADER",
  "LEEWAY_APP::TEST::LAVR::RUNTIME_SMOKE",
  "LEEWAY_APP::TEST::LAVR::HOST_ROUTER_DYNAMIC",
  "LEEWAY_APP::TEST::LAVR::PLAYBACK_GATE_DYNAMIC"
] as const;

export const LEEWAY_APPLICATION_IDENTITY_GRAPH: LeeWayApplicationIdentityNode[] = [
  {
    id: "LEEWAY_APP::GOVERNANCE::IDENTITY_GRAPH::REGISTRY",
    name: "Application identity graph registry",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "GOVERNANCE",
    pipeline: "IDENTITY_GRAPH",
    file: "agent-lee/vscode-extension/src/leeway-application/leewayApplicationIdentityGraph.ts",
    runtimeRole: "Defines the canonical LeeWay application node graph, command ownership, and active-file coverage model.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/leeway-application/"
    ],
    verification: ["identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::BOOT::EXTENSION_HOST::ENTRYPOINT",
    name: "VS Code extension manifest entrypoint",
    classification: "PRODUCTION_START",
    owner: "AGENT_LEE",
    domain: "BOOT",
    pipeline: "EXTENSION_HOST",
    file: "agent-lee/vscode-extension/package.json",
    runtimeRole: "Declares the single production extension entrypoint and activation surface.",
    inputs: ["VS Code activation request"],
    outputs: ["./out/extension.js"],
    verification: ["npm run compile", "npx vsce package --allow-star-activation"],
    evidence: [...RUNTIME_EVIDENCE],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::BOOT::MANIFEST::COMMAND_REGISTRATION",
    name: "VS Code command registration manifest",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "BOOT",
    pipeline: "MANIFEST",
    file: "agent-lee/vscode-extension/package.json",
    runtimeRole: "Declares the command palette and surfaced extension command contract.",
    registeredCommands: [
      ...CORE_VSCODE_COMMANDS,
      ...VISUAL_VSCODE_COMMANDS,
      ...LIVE_VOICE_VSCODE_COMMANDS,
      ...SESSION_VSCODE_COMMANDS,
      ...PERFORMANCE_VSCODE_COMMANDS,
      ...INDEXING_VSCODE_COMMANDS,
      ...EDIT_BUFFER_VSCODE_COMMANDS,
      ...LEGACY_MANIFEST_COMMANDS
    ],
    verification: ["npm run compile", "application identity graph gate"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-package-json-current.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::BOOT::EXTENSION_HOST::ACTIVATION",
    name: "Extension activation host",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "BOOT",
    pipeline: "EXTENSION_HOST",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Activates the extension host and owns the production runtime pipeline.",
    exports: ["activate", "deactivate"],
    commandsHandled: [...EXTENSION_HANDLED_COMMANDS],
    eventsHandled: [...LAVR_RUNTIME_EVENTS, ...LAVR_PLAYBACK_EVENTS],
    inputs: ["VS Code activation", "webview messages", "runtime events"],
    outputs: ["webview panel", "runtime state", "verification receipts"],
    verification: ["npm run compile", "runtime-smoke-voice-provider-harness", "lavr-host-router-dynamic-harness"],
    evidence: [...RUNTIME_EVIDENCE],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::BOOT::PANEL::WEBVIEW_PANEL",
    name: "Agent Lee webview panel host",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "BOOT",
    pipeline: "PANEL",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Owns the primary webview panel lifecycle and boot logs.",
    verification: ["lavr-host-router-dynamic-harness", "application identity graph gate"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::WEBVIEW::PANEL::HTML_RUNTIME",
    name: "Agent Lee webview runtime",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "WEBVIEW",
    pipeline: "PANEL",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Renders the webview HTML runtime and binds UI controls to the runtime pipeline.",
    commandsHandled: [...HOST_TO_WEBVIEW_COMMANDS],
    eventsHandled: [...LAVR_RUNTIME_EVENTS, ...LAVR_PLAYBACK_EVENTS],
    inputs: ["host messages", "runtime hydration"],
    outputs: ["UI rendering", "user commands", "voice controls"],
    verification: ["lavr-host-router-dynamic-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::UI::WEBVIEW::MESSAGE_POSTER",
    name: "Webview message poster",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "UI",
    pipeline: "WEBVIEW",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Owns host-to-panel UI updates and webview-visible runtime state posting.",
    commandsEmitted: [...HOST_TO_WEBVIEW_COMMANDS],
    verification: ["lavr-host-router-dynamic-harness", "application identity graph gate"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::UI::WEBVIEW::MESSAGE_HANDLER",
    name: "Webview message handler",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "UI",
    pipeline: "WEBVIEW",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Owns panel-to-host message handling for buttons, settings, approvals, and conversation routes.",
    commandsHandled: [...EXTENSION_HANDLED_COMMANDS],
    verification: ["command emitted-vs-handled audit", "application identity graph gate"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-integrity-command-audit.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::WEBVIEW::COMMAND_ROUTER::WEBVIEW_TO_HOST",
    name: "Webview to host command router",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "WEBVIEW",
    pipeline: "COMMAND_ROUTER",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Owns commands emitted from the webview runtime into the extension host.",
    commandsEmitted: [...WEBVIEW_TO_HOST_COMMANDS],
    inputs: ["button clicks", "webview runtime events"],
    outputs: ["host commands"],
    verification: ["command emitted-vs-handled audit", "lavr-host-router-dynamic-harness"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-integrity-command-audit.json",
      "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::HOST::COMMAND_ROUTER::HOST_TO_WEBVIEW",
    name: "Host to webview command router",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "HOST",
    pipeline: "COMMAND_ROUTER",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Owns messages and UI state updates emitted from the extension host into the webview.",
    commandsEmitted: [...HOST_TO_WEBVIEW_COMMANDS],
    commandsHandled: [...EXTENSION_HANDLED_COMMANDS],
    inputs: ["runtime state", "voice runtime events", "conversation changes"],
    outputs: ["webview messages"],
    verification: ["command emitted-vs-handled audit", "lavr-host-router-dynamic-harness"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-integrity-command-audit.json",
      "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::CONFIG::RUNTIME_SETTINGS::HYDRATION",
    name: "Runtime settings hydration",
    classification: "CONFIGURATION",
    owner: "LEEWAY",
    domain: "CONFIG",
    pipeline: "RUNTIME_SETTINGS",
    file: "agent-lee/vscode-extension/src/core/runtime-settings.ts",
    runtimeRole: "Loads, normalizes, and persists runtime state for the active extension pipeline.",
    exports: ["DEFAULT_RUNTIME_STATE", "loadRuntimeSettings", "saveRuntimeSettings", "resolveRuntimeState"],
    inputs: ["runtime-state.json", "installed models"],
    outputs: ["normalized runtime settings"],
    verification: ["npm run compile", "runtime-smoke-voice-provider-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::WORKSPACE::INTELLIGENCE::ROOT",
    name: "Workspace intelligence root",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "WORKSPACE",
    pipeline: "INTELLIGENCE",
    file: "agent-lee/vscode-extension/src/core/file-intelligence.ts",
    runtimeRole: "Discovers workspace files, extracts local paths and URLs, and builds bounded context samples.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/core/",
      "agent-lee/vscode-extension/src/types/"
    ],
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-src-file-inventory.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::WORKSPACE::APPROVAL::WRITE_POLICY",
    name: "LeeWay write policy classifier",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "WORKSPACE",
    pipeline: "APPROVAL",
    file: "agent-lee/vscode-extension/src/core/leeway-write-policy.ts",
    runtimeRole: "Classifies governed files and excludes reports, knowledge, logs, and build output from live source treatment.",
    verification: ["doctor baseline", "application identity graph gate"],
    evidence: [
      "reports/Doctor/**/agent-lee-doctor.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::WORKSPACE::REMOTE_CONTEXT::URL_RESOLVER",
    name: "Remote context URL resolver",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "WORKSPACE",
    pipeline: "REMOTE_CONTEXT",
    file: "agent-lee/vscode-extension/src/core/remote-context.ts",
    runtimeRole: "Resolves remote URLs into controlled external context for Agent Lee tasks.",
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::WORKSPACE::INDEXING::BACKGROUND_INDEXER",
    name: "Background workspace indexer",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "WORKSPACE",
    pipeline: "INDEXING",
    file: "agent-lee/vscode-extension/src/indexing/backgroundIndexer.service.ts",
    runtimeRole: "Owns background indexing, dependency lookup, and command-map oriented workspace summaries.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/indexing/"
    ],
    verification: ["application identity graph gate"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-src-file-inventory.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::MODEL_HIVE::ROUTER::MODEL_SELECTION",
    name: "Model hive router",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "MODEL_HIVE",
    pipeline: "ROUTER",
    file: "agent-lee/vscode-extension/src/core/model-hive.ts",
    runtimeRole: "Classifies task type and routes Builder, Designer, Verifier, visual, and web helper roles.",
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "reports/Doctor/**/agent-lee-doctor.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::MODEL_HIVE::GOVERNANCE::MODEL_GOVERNANCE",
    name: "Model governance",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "MODEL_HIVE",
    pipeline: "GOVERNANCE",
    file: "agent-lee/vscode-extension/src/core/model-governance.ts",
    runtimeRole: "Applies governance rules to local model routing and usage.",
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::ENGINEERING_LOOP::ROOT",
    name: "Engineering loop root",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "ENGINEERING_LOOP",
    pipeline: "ROOT",
    file: "agent-lee/vscode-extension/src/core/agent-engineering-loop.ts",
    runtimeRole: "Owns inspect, plan, stage, approve, apply, verify, and receipt execution flow.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/execution-brain/",
      "agent-lee/vscode-extension/src/edit-buffer/",
      "agent-lee/vscode-extension/src/workqueue/"
    ],
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "reports/Doctor/**/agent-lee-doctor.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::ENGINEERING_LOOP::EDIT_BUFFER::COMMANDS",
    name: "Edit buffer command set",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "ENGINEERING_LOOP",
    pipeline: "EDIT_BUFFER",
    file: "agent-lee/vscode-extension/src/edit-buffer/editBuffer.commands.ts",
    runtimeRole: "Owns staged diff review, diff opening, accept/reject, and apply-and-verify command routes.",
    registeredCommands: [...EDIT_BUFFER_VSCODE_COMMANDS],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::GOVERNANCE::LAW_ENGINE::ROOT",
    name: "Law engine root",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "GOVERNANCE",
    pipeline: "LAW_ENGINE",
    file: "agent-lee/vscode-extension/src/core/law-engine.ts",
    runtimeRole: "Blocks force-push, overwrite-core, unsafe-terminal, direct-main-push, and bulk-delete actions.",
    verification: ["doctor baseline", "application identity graph gate"],
    evidence: [
      "reports/Doctor/**/agent-lee-doctor.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::GOVERNANCE::CONNECTIVITY::LOADER",
    name: "Standalone connectivity loader",
    classification: "CONFIGURATION",
    owner: "LEEWAY",
    domain: "GOVERNANCE",
    pipeline: "CONNECTIVITY",
    file: "agent-lee/vscode-extension/src/core/leeway-connectivity-loader.ts",
    runtimeRole: "Resolves canonical standalone roots for SDK, MCP, agents, governance, and persona assets.",
    verification: ["doctor baseline", "application identity graph gate"],
    evidence: [
      "reports/Doctor/**/agent-lee-doctor.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::PERSONA::BRIDGE::RUNTIME_PROMPT",
    name: "Persona runtime bridge",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "PERSONA",
    pipeline: "BRIDGE",
    file: "agent-lee/vscode-extension/src/persona/persona-runtime-bridge.ts",
    runtimeRole: "Builds the Agent Lee runtime prompt from sovereign persona, heritage canon, and anti-generic rules.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/persona/"
    ],
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "reports/Doctor/**/agent-lee-doctor.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::CAPABILITY::CATALOG::BUILDER",
    name: "Capability catalog builder",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "CAPABILITY",
    pipeline: "CATALOG",
    file: "agent-lee/vscode-extension/src/core/capability-registry.ts",
    runtimeRole: "Builds the live capability catalog from MCP, agent, and server sources.",
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/mcp/generated-capability-catalog.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::MCP::PLUGIN::ROUTER",
    name: "Plugin and MCP router",
    classification: "TOOL_BUS",
    owner: "AGENT_LEE",
    domain: "MCP",
    pipeline: "PLUGIN",
    file: "agent-lee/vscode-extension/src/plugins/agentLeePluginRouter.ts",
    runtimeRole: "Owns plugin routing, plugin guards, registry lookup, and adapter dispatch.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/plugins/"
    ],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::TOOLS::ROUTER::ROOT",
    name: "Internal tool router",
    classification: "TOOL_BUS",
    owner: "AGENT_LEE",
    domain: "TOOLS",
    pipeline: "ROUTER",
    file: "agent-lee/vscode-extension/src/tools/router.ts",
    runtimeRole: "Owns internal tool routing including scan, verify, web-search, image, and permission helpers.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/tools/"
    ],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::BROWSER::VALIDATOR::ROOT",
    name: "Browser validator root",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "BROWSER",
    pipeline: "VALIDATOR",
    file: "agent-lee/vscode-extension/src/core/browser-engine.ts",
    runtimeRole: "Owns Playwright session startup, visual evidence capture, flow execution, performance, and accessibility checks.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/visual-intelligence/"
    ],
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "reports/Doctor/**/agent-lee-doctor.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::MEMORY::STORE::LOCAL_MEMORY",
    name: "Local memory ledger",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "MEMORY",
    pipeline: "STORE",
    file: "agent-lee/vscode-extension/src/core/memory.ts",
    runtimeRole: "Writes runtime and agent-event memory ledgers for continuity and audit.",
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "reports/Doctor/**/agent-lee-doctor.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::KNOWLEDGE::INDEXER::REPO_INDEXER",
    name: "Knowledge repo indexer",
    classification: "PRODUCTION_RUNTIME",
    owner: "AGENT_LEE",
    domain: "KNOWLEDGE",
    pipeline: "INDEXER",
    file: "agent-lee/vscode-extension/src/knowledge/leewayRepoIndexer.ts",
    runtimeRole: "Indexes workspace source into the knowledge store while excluding reports, knowledge, memory, logs, and build output.",
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/knowledge/"
    ],
    verification: ["application identity graph gate"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-src-file-inventory.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::VOICE::LAVR::LOCAL_RUNTIME",
    name: "LeeWay Agent Voice local runtime",
    classification: "LOCAL_RUNTIME",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/src/live-voice/providers/stubRealtimeVoiceProvider.ts",
    runtimeRole: "Primary local-only voice runtime for transcript bridge driven voice turns.",
    eventsEmitted: [
      "LAVR_SESSION_CONNECTED",
      "LAVR_SESSION_STARTED",
      "LAVR_SESSION_DISCONNECTED",
      "LAVR_SESSION_CLOSED",
      "LAVR_SPEECH_FINAL",
      "LAVR_TURN_COMMITTED",
      "LAVR_INTERRUPT_REQUESTED",
      "LAVR_TOOL_COMPLETED",
      "LAVR_ERROR"
    ],
    outputs: ["local runtime events", "transcript bridge start command"],
    verification: ["runtime-smoke-voice-provider-harness", "lavr-host-router-dynamic-harness"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json",
      "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::VOICE::LAVR::BROWSER_FALLBACK",
    name: "LeeWay Agent Voice browser fallback",
    classification: "BROWSER_FALLBACK",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/src/live-voice/providers/browserSpeechRecognitionProvider.ts",
    runtimeRole: "Fallback browser speech runtime used only when local browser microphone capture is needed.",
    eventsEmitted: [
      "LAVR_SESSION_CONNECTED",
      "LAVR_SESSION_STARTED",
      "LAVR_USER_SPEECH_STARTED",
      "LAVR_SPEECH_STARTED",
      "LAVR_INTERRUPT_REQUESTED",
      "LAVR_SPEECH_PARTIAL",
      "LAVR_SPEECH_FINAL",
      "LAVR_USER_AUDIO_DELTA",
      "LAVR_USER_SPEECH_STOPPED",
      "LAVR_SESSION_CLOSED",
      "LAVR_SESSION_DISCONNECTED",
      "LAVR_ERROR",
      "LAVR_TURN_COMMITTED",
      "LAVR_TOOL_COMPLETED"
    ],
    verification: ["runtime-smoke-voice-provider-harness", "lavr-host-router-dynamic-harness"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json",
      "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"
    ],
    status: "FALLBACK"
  },
  {
    id: "LEEWAY_APP::VOICE::LAVR::TURN_GATE",
    name: "LAVR turn gate",
    classification: "TURN_GATE",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Owns utterance lifecycle, partial/final aggregation, commit scheduling, and turn commit emission.",
    eventsEmitted: [
      "LAVR_FALLBACK_BRIDGE_REQUESTED",
      "LAVR_TURN_STARTED",
      "LAVR_PARTIAL_UPDATED",
      "LAVR_FINAL_RECEIVED",
      "LAVR_COMMIT_SCHEDULED",
      "LAVR_SILENCE_TIMEOUT",
      "LAVR_USER_SPEECH_STOPPED",
      "LAVR_TURN_COMMITTED",
      "LAVR_COMMIT_EMITTED",
      "LAVR_DUPLICATE_COMMIT_SUPPRESSED",
      "LAVR_TURN_CANCELLED",
      "LAVR_ASSISTANT_RESPONSE_STARTED",
      "LAVR_ASSISTANT_RESPONSE_DONE"
    ],
    eventsHandled: [
      "LAVR_USER_SPEECH_STARTED",
      "LAVR_SPEECH_STARTED",
      "LAVR_SPEECH_PARTIAL",
      "LAVR_SPEECH_FINAL",
      "LAVR_INTERRUPT_REQUESTED",
      "LAVR_TURN_COMMITTED",
      "LAVR_TURN_STARTED",
      "LAVR_PARTIAL_UPDATED",
      "LAVR_FINAL_RECEIVED",
      "LAVR_COMMIT_SCHEDULED",
      "LAVR_COMMIT_EMITTED",
      "LAVR_DUPLICATE_COMMIT_SUPPRESSED",
      "LAVR_SILENCE_TIMEOUT",
      "LAVR_TURN_CANCELLED"
    ],
    verification: ["lavr-host-router-dynamic-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::VOICE::LAVR::TOOL_BUS",
    name: "LAVR tool bus",
    classification: "TOOL_BUS",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Owns tool request routing, tool completion propagation, and tool timeout/error handling.",
    commandsEmitted: ["leewayVoiceToolCompleted"],
    commandsHandled: ["leewayVoiceToolCompleted"],
    eventsEmitted: ["LAVR_TOOL_COMPLETED"],
    eventsHandled: ["LAVR_TOOL_REQUESTED", "LAVR_TOOL_COMPLETED", "LAVR_ERROR"],
    verification: ["lavr-host-router-dynamic-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::VOICE::LAVR::PLAYBACK_GATE",
    name: "LAVR playback gate",
    classification: "PLAYBACK_GATE",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/src/leeway-agent-voice-runtime/lavrPlaybackGate.ts",
    runtimeRole: "Owns assistant playback lifecycle, stale segment suppression, and stop/cancel deduplication.",
    exports: ["LavrPlaybackGate"],
    eventsEmitted: [...LAVR_PLAYBACK_EVENTS],
    eventsHandled: [
      "LAVR_INTERRUPT_REQUESTED",
      "LAVR_ASSISTANT_RESPONSE_STARTED",
      "LAVR_ASSISTANT_RESPONSE_DONE"
    ],
    verification: ["lavr-playback-gate-dynamic-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/lavr-playback-gate-dynamic-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::VOICE::LAVR::TRANSCRIPT_BRIDGE",
    name: "LAVR transcript bridge",
    classification: "EVENT_ROUTE",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/src/live-voice/liveTranscriptBridge.ts",
    runtimeRole: "Owns localhost transcript intake and forwards accepted text into the voice command path.",
    outputs: ["agentLee.liveVoice.handleTranscript"],
    verification: ["runtime-smoke-voice-provider-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::VOICE::LAVR::INTERRUPT_GATE",
    name: "LAVR interrupt gate",
    classification: "EVENT_ROUTE",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/src/live-voice/voiceProviderFactory.ts",
    runtimeRole: "Bridges runtime interrupt events from the provider layer into the host command router.",
    commandsEmitted: ["leewayVoiceInterruptRequested", "leewayStartTranscriptBridge"],
    eventsEmitted: ["LAVR_INTERRUPT_REQUESTED"],
    verification: ["lavr-host-router-dynamic-harness", "runtime-smoke-voice-provider-harness"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json",
      "agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::VOICE::COMMANDS::LIVE_VOICE",
    name: "Live voice command family",
    classification: "COMMAND_ROUTE",
    owner: "LAVR",
    domain: "VOICE",
    pipeline: "COMMANDS",
    file: "agent-lee/vscode-extension/src/live-voice/liveVoice.commands.ts",
    runtimeRole: "Registers the live voice command surface for transcript bridge, speech status, session controls, and file blocking.",
    registeredCommands: [...LIVE_VOICE_VSCODE_COMMANDS],
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/live-voice/"
    ],
    verification: ["application identity graph gate", "runtime-smoke-voice-provider-harness"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::PACKAGE::VSIX::BUILD",
    name: "VSIX package build",
    classification: "PACKAGING",
    owner: "LEEWAY",
    domain: "PACKAGE",
    pipeline: "VSIX",
    file: "agent-lee/vscode-extension/scripts/Invoke-LeeWayApplicationIntegrityGate.ps1",
    runtimeRole: "Builds the extension package that the integrity gate inspects.",
    outputs: ["agent-lee-leeway-coding-system-1.2.3.vsix"],
    verification: ["npx vsce package --allow-star-activation"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-integrity-package.log"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::PACKAGE::VSIX::LEAKAGE_SCAN",
    name: "VSIX package leakage scan",
    classification: "PACKAGING",
    owner: "LEEWAY",
    domain: "PACKAGE",
    pipeline: "VSIX",
    file: "agent-lee/vscode-extension/scripts/Invoke-LeeWayApplicationIntegrityGate.ps1",
    runtimeRole: "Scans the packaged VSIX surface for stale artifacts and excluded providers.",
    verification: ["VSIX stale artifact and cloud-provider leakage scan"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-integrity-vsix-scan.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::PACKAGE::IGNORE::VSCODEIGNORE",
    name: "Package surface ignore rules",
    classification: "PACKAGING",
    owner: "LEEWAY",
    domain: "PACKAGE",
    pipeline: "IGNORE",
    file: "agent-lee/vscode-extension/.vscodeignore",
    runtimeRole: "Defines the non-shipping package surface and excludes debug, test, and stale adapter artifacts.",
    verification: ["VSIX stale artifact and cloud-provider leakage scan"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-integrity-vsix-scan.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::PACKAGE::RELEASE::METADATA_SYNC",
    name: "Release metadata sync",
    classification: "PACKAGING",
    owner: "LEEWAY",
    domain: "PACKAGE",
    pipeline: "RELEASE",
    file: "agent-lee/vscode-extension/scripts/sync-release-metadata.mjs",
    runtimeRole: "Prevents package.json and package-lock.json drift before packaging.",
    verification: ["npx vsce package --allow-star-activation"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-integrity-package.log"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::PACKAGE::RELEASE::VSIX_WRITER",
    name: "Deterministic VSIX writer",
    classification: "PACKAGING",
    owner: "LEEWAY",
    domain: "PACKAGE",
    pipeline: "RELEASE",
    file: "agent-lee/vscode-extension/scripts/package-release.mjs",
    runtimeRole: "Writes the versioned VSIX package using the canonical package manifest.",
    verification: ["npx vsce package --allow-star-activation"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-integrity-package.log"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::PACKAGE::QUARANTINE::DIST_EXTENSION_JS",
    name: "Historical dist start-path quarantine",
    classification: "QUARANTINE",
    owner: "LEEWAY",
    domain: "PACKAGE",
    pipeline: "QUARANTINE",
    file: "agent-lee/vscode-extension/dist/extension.js",
    runtimeRole: "Historical dist output must never be treated as the active production start path while out/extension.js is canonical.",
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "DELETE_PENDING"
  },
  {
    id: "LEEWAY_APP::GOVERNANCE::INTEGRITY_GATE::ROOT",
    name: "LeeWay application integrity gate",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "GOVERNANCE",
    pipeline: "INTEGRITY_GATE",
    file: "agent-lee/vscode-extension/scripts/Invoke-LeeWayApplicationIntegrityGate.ps1",
    runtimeRole: "Verification-only application integrity gate for runtime, packaging, and governance checks.",
    verification: ["npm run LEEWAY_APPLICATION_INTEGRITY_GATE"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-integrity-result.json",
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "agent-lee/receipts/leeway_application_integrity_gate_*.md"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::GATE::APPLICATION_IDENTITY_GRAPH",
    name: "Application identity graph gate",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "GATE",
    pipeline: "APPLICATION_IDENTITY_GRAPH",
    file: "agent-lee/vscode-extension/scripts/Invoke-LeeWayApplicationIdentityGraphGate.ps1",
    runtimeRole: "Verifies node registration, command ownership, active-file coverage, quarantine paths, and identity evidence.",
    verification: ["identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::GOVERNANCE::DOCTOR::BASELINE",
    name: "Agent Lee doctor baseline",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "GOVERNANCE",
    pipeline: "DOCTOR",
    file: "agent-lee/scripts/Invoke-AgentLeeDoctor.ps1",
    runtimeRole: "Runs baseline doctor and LeeWay compliance checks for governed artifacts.",
    verification: ["doctor baseline", "LeeWay compliance scan"],
    evidence: ["reports/Doctor/**/agent-lee-doctor.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::GOVERNANCE::COMPLIANCE::LEEWAY_HEADER",
    name: "LeeWay header compliance",
    classification: "GOVERNANCE_GATE",
    owner: "LEEWAY",
    domain: "GOVERNANCE",
    pipeline: "COMPLIANCE",
    file: "agent-lee/scripts/Invoke-AgentLeeDoctor.ps1",
    runtimeRole: "Validates LeeWay header presence and governed file compliance.",
    verification: ["LeeWay compliance scan"],
    evidence: ["reports/Doctor/**/agent-lee-doctor.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::COMMAND::CORE::PRIMARY_SURFACE",
    name: "Primary extension command surface",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "COMMAND",
    pipeline: "CORE",
    file: "agent-lee/vscode-extension/src/extension.ts",
    runtimeRole: "Registers the core Agent Lee open, scan, verify, engineer, patch, receipt, and runtime commands.",
    registeredCommands: [...CORE_VSCODE_COMMANDS],
    verification: ["application identity graph gate", "doctor baseline"],
    evidence: [
      "agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json",
      "reports/Doctor/**/agent-lee-doctor.json"
    ],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::COMMAND::CORE::LEGACY_MANIFEST_SURFACE",
    name: "Legacy manifest command surface",
    classification: "DEPRECATED_DELETE",
    owner: "LEEWAY",
    domain: "COMMAND",
    pipeline: "CORE",
    file: "agent-lee/vscode-extension/package.json",
    runtimeRole: "Manifest-only commands kept visible for audit until they are either rewired or removed.",
    registeredCommands: [...LEGACY_MANIFEST_COMMANDS],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-package-json-current.json"],
    status: "DELETE_PENDING"
  },
  {
    id: "LEEWAY_APP::COMMAND::VISUAL::SURFACE",
    name: "Visual intelligence command surface",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "COMMAND",
    pipeline: "VISUAL",
    file: "agent-lee/vscode-extension/src/visual-intelligence/visualPanel.ts",
    runtimeRole: "Registers and owns the LVIS panel and visual-system command routes.",
    registeredCommands: [...VISUAL_VSCODE_COMMANDS],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::COMMAND::SESSION::SURFACE",
    name: "Coding session command surface",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "COMMAND",
    pipeline: "SESSION",
    file: "agent-lee/vscode-extension/src/session-orchestrator/codingSession.commands.ts",
    runtimeRole: "Registers and owns coding-session start, pause, resume, status, summary, and export receipt commands.",
    registeredCommands: [...SESSION_VSCODE_COMMANDS],
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/session-orchestrator/"
    ],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::COMMAND::PERFORMANCE::SURFACE",
    name: "Performance command surface",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "COMMAND",
    pipeline: "PERFORMANCE",
    file: "agent-lee/vscode-extension/src/performance/performance.commands.ts",
    runtimeRole: "Registers performance profile, override, service, and status command routes.",
    registeredCommands: [...PERFORMANCE_VSCODE_COMMANDS],
    ownedPathPrefixes: [
      "agent-lee/vscode-extension/src/performance/"
    ],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::COMMAND::INDEXING::SURFACE",
    name: "Indexing command surface",
    classification: "COMMAND_ROUTE",
    owner: "AGENT_LEE",
    domain: "COMMAND",
    pipeline: "INDEXING",
    file: "agent-lee/vscode-extension/src/indexing/backgroundIndexer.commands.ts",
    runtimeRole: "Registers background indexing, dependency, command-map, and symbol-search commands.",
    registeredCommands: [...INDEXING_VSCODE_COMMANDS],
    verification: ["application identity graph gate"],
    evidence: ["agent-lee/vscode-extension/test-evidence/leeway-application-identity-graph-result.json"],
    status: "ACTIVE"
  },
  {
    id: "LEEWAY_APP::TEST::LAVR::RUNTIME_SMOKE",
    name: "LAVR runtime smoke harness",
    classification: "TEST_HARNESS",
    owner: "LAVR",
    domain: "TEST",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-harness.cjs",
    runtimeRole: "Exercises runtime provider selection and local/fallback behavior.",
    verification: ["runtime-smoke-voice-provider-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/runtime-smoke-voice-provider-result.json"],
    status: "TEST_ONLY"
  },
  {
    id: "LEEWAY_APP::TEST::LAVR::HOST_ROUTER_DYNAMIC",
    name: "LAVR host router dynamic harness",
    classification: "TEST_HARNESS",
    owner: "LAVR",
    domain: "TEST",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-harness.cjs",
    runtimeRole: "Exercises emitted versus handled host router behavior for LAVR flows.",
    verification: ["lavr-host-router-dynamic-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/lavr-host-router-dynamic-result.json"],
    status: "TEST_ONLY"
  },
  {
    id: "LEEWAY_APP::TEST::LAVR::PLAYBACK_GATE_DYNAMIC",
    name: "LAVR playback gate dynamic harness",
    classification: "TEST_HARNESS",
    owner: "LAVR",
    domain: "TEST",
    pipeline: "LAVR",
    file: "agent-lee/vscode-extension/test-evidence/lavr-playback-gate-dynamic-harness.cjs",
    runtimeRole: "Exercises playback stop/cancel and stale segment suppression behavior.",
    verification: ["lavr-playback-gate-dynamic-harness"],
    evidence: ["agent-lee/vscode-extension/test-evidence/lavr-playback-gate-dynamic-result.json"],
    status: "TEST_ONLY"
  }
];

export const LEEWAY_APPLICATION_REQUIRED_FILES = Array.from(
  new Set(LEEWAY_APPLICATION_IDENTITY_GRAPH.map((node) => node.file))
).sort();
