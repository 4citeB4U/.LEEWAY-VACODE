/*
LEEWAY HEADER - DO NOT REMOVE

REGION: AI
TAG: AI.LIVEVOICE.TYPES.MAIN
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

export type AgentLeeLiveEventType =
  | "task.started"
  | "edit.pending.created"
  | "edit.hunk.accepted"
  | "edit.hunk.rejected"
  | "edit.apply.started"
  | "edit.apply.finished"
  | "edit.apply.blocked"
  | "verify.started"
  | "verify.finished"
  | "repair.candidates.found"
  | "repair.package.created"
  | "approval.required"
  | "receipt.written"
  | "task.failed"
  | "task.finished";

export interface AgentLeeLiveEvent {
  id: string;
  type: AgentLeeLiveEventType;
  message: string;
  severity: "info" | "success" | "warning" | "error";
  speak: boolean;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentLeeSpeechRequest {
  text: string;
  reason:
    | "status"
    | "verification"
    | "repair"
    | "approval"
    | "warning"
    | "error"
    | "summary";
  interruptible: boolean;
}
