/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: VOICE_RUNTIME
TAG: CORE.AGENT_LEE.LEEWAY_AGENT_VOICE_RUNTIME.IDS
PURPOSE: LeeWay Agent Voice Runtime canonical IDs, characterization record, and event/command name registry.
         All voice runtime components must reference these IDs — never hard-coded strings.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

// ---------------------------------------------------------------------------
// Stable subsystem IDs
// ---------------------------------------------------------------------------

export const LEEWAY_AGENT_VOICE_RUNTIME_IDS = {
  subsystem:            "LEEWAY_AGENT_VOICE_RUNTIME",
  localRuntime:         "LEEWAY_AGENT_VOICE_RUNTIME_LOCAL",
  browserFallback:      "LEEWAY_AGENT_VOICE_RUNTIME_BROWSER_FALLBACK",
  turnBus:              "LEEWAY_AGENT_VOICE_TURN_BUS",
  toolBus:              "LEEWAY_AGENT_VOICE_TOOL_BUS",
  interruptGate:        "LEEWAY_AGENT_VOICE_INTERRUPT_GATE",
  transcriptBridge:     "LEEWAY_AGENT_VOICE_TRANSCRIPT_BRIDGE",
  sessionState:         "LEEWAY_AGENT_VOICE_SESSION_STATE",
  receipt:              "LEEWAY_AGENT_VOICE_RUNTIME_RECEIPT",
  smokeHarness:         "LEEWAY_AGENT_VOICE_RUNTIME_SMOKE",
} as const;

// ---------------------------------------------------------------------------
// Characterization record
// ---------------------------------------------------------------------------

export const LEEWAY_AGENT_VOICE_RUNTIME_CHARACTERIZATION = {
  owner:                      "LeeWay / Agent Lee",
  locality:                   "local-only",
  externalServiceDependency:  false,
  browserDependency:          "fallback-only",
  defaultRuntime:             LEEWAY_AGENT_VOICE_RUNTIME_IDS.localRuntime,
  fallbackRuntime:            LEEWAY_AGENT_VOICE_RUNTIME_IDS.browserFallback,
  securityBoundary:           "local runtime bus",
  evidenceRoot:               ".leeway-vscode/agent-lee/reports/voice-runtime",
  receiptRoot:                ".leeway-vscode/logs/agent-lee/voice-runtime",
} as const;

// ---------------------------------------------------------------------------
// Provider kind values (persisted in runtime state)
// ---------------------------------------------------------------------------

export type LeeWayVoiceRuntimeKind =
  | "leeway-agent-voice-local"
  | "leeway-agent-voice-browser-fallback";

export const LAVR_KIND_LOCAL:    LeeWayVoiceRuntimeKind = "leeway-agent-voice-local";
export const LAVR_KIND_BROWSER:  LeeWayVoiceRuntimeKind = "leeway-agent-voice-browser-fallback";

// ---------------------------------------------------------------------------
// Dispatcher event type strings  (LAVR_* = LeeWay Agent Voice Runtime event)
// ---------------------------------------------------------------------------

export const LAVR_SESSION_CONNECTED           = "LAVR_SESSION_CONNECTED"           as const;
export const LAVR_SESSION_STARTED             = "LAVR_SESSION_STARTED"             as const;
export const LAVR_SESSION_CLOSED              = "LAVR_SESSION_CLOSED"              as const;
export const LAVR_SESSION_DISCONNECTED        = "LAVR_SESSION_DISCONNECTED"        as const;
export const LAVR_FALLBACK_BRIDGE_REQUESTED   = "LAVR_FALLBACK_BRIDGE_REQUESTED"   as const;
export const LAVR_USER_AUDIO_DELTA            = "LAVR_USER_AUDIO_DELTA"            as const;
export const LAVR_USER_SPEECH_STARTED         = "LAVR_USER_SPEECH_STARTED"        as const;
export const LAVR_USER_SPEECH_STOPPED         = "LAVR_USER_SPEECH_STOPPED"        as const;
export const LAVR_TURN_COMMITTED              = "LAVR_TURN_COMMITTED"              as const;
export const LAVR_ASSISTANT_RESPONSE_STARTED  = "LAVR_ASSISTANT_RESPONSE_STARTED"  as const;
export const LAVR_ASSISTANT_AUDIO_DELTA       = "LAVR_ASSISTANT_AUDIO_DELTA"       as const;
export const LAVR_ASSISTANT_TRANSCRIPT_DELTA  = "LAVR_ASSISTANT_TRANSCRIPT_DELTA"  as const;
export const LAVR_ASSISTANT_RESPONSE_DONE     = "LAVR_ASSISTANT_RESPONSE_DONE"     as const;
export const LAVR_INTERRUPT_REQUESTED         = "LAVR_INTERRUPT_REQUESTED"         as const;
export const LAVR_TOOL_REQUESTED              = "LAVR_TOOL_REQUESTED"              as const;
export const LAVR_TOOL_COMPLETED              = "LAVR_TOOL_COMPLETED"              as const;
export const LAVR_ERROR                       = "LAVR_ERROR"                       as const;

// ---------------------------------------------------------------------------
// Webview ↔ Host message command strings
// ---------------------------------------------------------------------------

export const LAVR_CMD_EVENT           = "leewayVoiceEvent"              as const;
export const LAVR_CMD_TURN_COMMIT     = "leewayVoiceTurnCommit"         as const;
export const LAVR_CMD_INTERRUPT       = "leewayVoiceInterruptRequested" as const;
export const LAVR_CMD_TOOL_COMPLETED  = "leewayVoiceToolCompleted"      as const;
export const LAVR_CMD_START_BRIDGE    = "leewayStartTranscriptBridge"   as const;
