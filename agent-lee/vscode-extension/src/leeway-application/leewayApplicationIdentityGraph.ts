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
  commandsEmitted?: string[];
  commandsHandled?: string[];
  eventsEmitted?: string[];
  eventsHandled?: string[];
  inputs?: string[];
  outputs?: string[];
  verification: string[];
  evidence?: string[];
  status: LeeWayApplicationNodeStatus;
}

export const LEEWAY_APPLICATION_IDENTITY_GRAPH_VERSION = "2026-05-14.pass1";

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
  "LEEWAY_APP::WEBVIEW::PANEL::HTML_RUNTIME",
  "LEEWAY_APP::WEBVIEW::COMMAND_ROUTER::WEBVIEW_TO_HOST",
  "LEEWAY_APP::HOST::COMMAND_ROUTER::HOST_TO_WEBVIEW",
  "LEEWAY_APP::CONFIG::RUNTIME_SETTINGS::HYDRATION",
  "LEEWAY_APP::VOICE::LAVR::LOCAL_RUNTIME",
  "LEEWAY_APP::VOICE::LAVR::BROWSER_FALLBACK",
  "LEEWAY_APP::VOICE::LAVR::TURN_GATE",
  "LEEWAY_APP::VOICE::LAVR::TOOL_BUS",
  "LEEWAY_APP::VOICE::LAVR::PLAYBACK_GATE",
  "LEEWAY_APP::VOICE::LAVR::TRANSCRIPT_BRIDGE",
  "LEEWAY_APP::VOICE::LAVR::INTERRUPT_GATE",
  "LEEWAY_APP::PACKAGE::VSIX::BUILD",
  "LEEWAY_APP::PACKAGE::VSIX::LEAKAGE_SCAN",
  "LEEWAY_APP::GOVERNANCE::INTEGRITY_GATE::ROOT",
  "LEEWAY_APP::GOVERNANCE::DOCTOR::BASELINE",
  "LEEWAY_APP::GOVERNANCE::COMPLIANCE::LEEWAY_HEADER",
  "LEEWAY_APP::TEST::LAVR::RUNTIME_SMOKE",
  "LEEWAY_APP::TEST::LAVR::HOST_ROUTER_DYNAMIC",
  "LEEWAY_APP::TEST::LAVR::PLAYBACK_GATE_DYNAMIC"
] as const;

export const LEEWAY_APPLICATION_IDENTITY_GRAPH: LeeWayApplicationIdentityNode[] = [
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
