/*
LEEWAY HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.LIVEVOICE.POLICY.MAIN
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import type { AgentLeeLiveEvent } from "./liveVoice.types";
import { performanceGovernor } from "../performance/performanceGovernor";

export function shouldSpeakLiveEvent(event: AgentLeeLiveEvent): boolean {
  const budget = performanceGovernor.getBudget();

  if (!event.speak) return false;
  if (!budget.enableLiveVoiceNarration) return false;

  if (event.type === "receipt.written") return false;

  return true;
}

export function compressSpeech(text: string, max = 420): string {
  const budget = performanceGovernor.getBudget();
  const effectiveMax = budget.enableVerboseNarration ? max : Math.min(max, 220);

  return text
    .replace(/```[\s\S]*?```/g, "Code block omitted from speech.")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, effectiveMax);
}

export function eventToSpeech(event: AgentLeeLiveEvent): string {
  const verbose = performanceGovernor.getBudget().enableVerboseNarration;

  switch (event.type) {
    case "task.started":
      return verbose ? `Locked in. ${event.message}` : `${event.message}`;
    case "edit.pending.created":
      return verbose
        ? `I created pending edits. Nothing is applied yet. ${event.message}`
        : `Pending edits created. ${event.message}`;
    case "edit.hunk.accepted":
      return verbose
        ? "That hunk is accepted. I will hold it until you apply accepted changes."
        : "Hunk accepted.";
    case "edit.hunk.rejected":
      return verbose
        ? "That hunk is rejected. I will keep it out of the final apply."
        : "Hunk rejected.";
    case "edit.apply.started":
      return verbose
        ? "I am applying the accepted hunks now with conflict protection."
        : "Applying accepted hunks.";
    case "edit.apply.finished":
      return verbose ? `The accepted hunks were applied. ${event.message}` : event.message;
    case "edit.apply.blocked":
      return verbose
        ? `I blocked one or more hunks because the file changed. ${event.message}`
        : `Apply blocked. ${event.message}`;
    case "verify.started":
      return verbose ? `I am running verification now. ${event.message}` : "Running verification.";
    case "verify.finished":
      return verbose ? `Verification finished. ${event.message}` : event.message;
    case "repair.candidates.found":
      return event.message;
    case "repair.package.created":
      return verbose
        ? "I created the repair package. Review the new diff before applying anything."
        : "Repair package created.";
    case "approval.required":
      return verbose
        ? `I need approval before I continue. ${event.message}`
        : event.message;
    case "task.failed":
      return verbose ? `The task hit a problem. ${event.message}` : `Task failed. ${event.message}`;
    case "task.finished":
      return verbose ? `Task finished. ${event.message}` : event.message;
    default:
      return event.message;
  }
}
