/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: AI
TAG: AI.LIVEVOICE.CONVERSATION.CONTROLLER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as vscode from "vscode";
import { agentLeeLiveTaskEvents } from "./liveTaskEvents";
import { voiceSessionStore } from "./liveVoiceSession.store";
import { detectInterrupt, handleInterrupt } from "./liveVoiceInterrupts";
import { writeTranscriptReceipt } from "./liveTranscript.receipts";
import { resolveContext, extractBlockedFilePath } from "./liveContextResolver";
import { voiceCommandContext } from "./liveVoiceCommandContext";

export type LiveIntent =
  | "chat"
  | "explain"
  | "create_pending_edit"
  | "open_diff"
  | "accept_hunk"
  | "reject_hunk"
  | "apply_accepted"
  | "apply_verify"
  | "cancel"
  | "approve"
  | "deny"
  | "start_session"
  | "pause_session"
  | "resume_session"
  | "stop_session"
  | "session_status"
  | "session_summary"
  | "export_session_receipt"
  | "quiet_mode"
  | "raspberry_mode"
  | "balanced_mode"
  | "performance_status"
  | "heavy_mcp_on"
  | "heavy_mcp_off"
  | "background_indexing_on"
  | "background_indexing_off"
  | "quiet_narration"
  | "verbose_narration"
  | "manual_verification_only"
  | "auto_verification_on"
  | "clear_performance_overrides"
  | "pause_services"
  | "resume_services"
  | "warm_core_services"
  | "dispose_idle_services"
  | "service_status"
  | "index_status"
  | "pause_indexing"
  | "resume_indexing"
  | "related_files"
  | "dependency_status"
  | "missing_headers"
  | "command_map"
  | "symbol_search";

export class AgentLeeLiveConversationController {
  private pendingApproval:
    | { label: string; command: string; args: unknown[] }
    | null = null;

  constructor(private readonly speak: (text: string) => void | Promise<void>) {}

  async handleTranscript(text: string): Promise<void> {
    const clean = text.trim();
    if (!clean) return;

    // Record transcript and update session turn count
    voiceSessionStore.recordTranscript(clean);
    writeTranscriptReceipt({
      timestamp: new Date().toISOString(),
      turn: voiceSessionStore.get().turnCount,
      speaker: "user",
      text: clean,
      phase: voiceSessionStore.get().phase,
    });

    // Interrupt check runs before all other routing
    const interruptKind = detectInterrupt(clean);
    if (interruptKind !== "none") {
      const handled = await handleInterrupt(interruptKind, this.speak);
      if (handled) return;
    }

    // Context resolution: handle pronouns, anaphora, and block-file intents
    const { context, blockFileIntent, explainIntent, whatFailedIntent, repeatIntent } =
      resolveContext(clean);

    if (repeatIntent) {
      await this.speak(context.spokenSummary);
      return;
    }

    if (whatFailedIntent) {
      await this.speak(context.spokenSummary);
      return;
    }

    if (blockFileIntent) {
      const filePath = extractBlockedFilePath(clean);
      if (filePath) {
        await vscode.commands.executeCommand("agentLee.liveVoice.blockFile", filePath);
      } else {
        await this.speak("I am not sure which file to block. Please say the file name.");
      }
      return;
    }

    if (explainIntent && context.resolved) {
      await this.speak(context.spokenSummary);
      return;
    }

    const intent = this.detectIntent(clean);

    if (this.pendingApproval) {
      await this.handleApproval(clean);
      return;
    }

    if (intent === "cancel") {
      this.pendingApproval = null;
      agentLeeLiveTaskEvents.emit(
        "task.finished",
        "I stopped the active voice-controlled operation.",
        { severity: "warning", speak: true }
      );
      return;
    }

    switch (intent) {
      case "explain":
        await vscode.commands.executeCommand("agentLee.liveVoice.explainActiveContext", clean);
        return;

      case "create_pending_edit":
        await this.requestApproval(
          "create a pending edit",
          "agentLee.liveVoice.createPendingEditFromSpeech",
          [clean]
        );
        return;

      case "open_diff":
        await vscode.commands.executeCommand("agentLee.editBuffer.openActiveDiff");
        return;

      case "accept_hunk":
        await this.requestApproval(
          "accept the active hunk",
          "agentLee.editBuffer.acceptActiveHunk",
          []
        );
        return;

      case "reject_hunk":
        await this.requestApproval(
          "reject the active hunk",
          "agentLee.editBuffer.rejectActiveHunk",
          []
        );
        return;

      case "apply_accepted":
        await this.requestApproval(
          "apply accepted hunks",
          "agentLee.editBuffer.applyAccepted",
          []
        );
        return;

      case "apply_verify":
        await this.requestApproval(
          "apply accepted hunks and run verification",
          "agentLee.editBuffer.applyAcceptedAndVerify",
          []
        );
        return;

      case "start_session":
        await vscode.commands.executeCommand("agentLee.session.start", clean);
        return;

      case "pause_session":
        await vscode.commands.executeCommand("agentLee.session.pause");
        return;

      case "resume_session":
        await vscode.commands.executeCommand("agentLee.session.resume");
        return;

      case "stop_session":
        await vscode.commands.executeCommand("agentLee.session.stop");
        return;

      case "session_status":
        await vscode.commands.executeCommand("agentLee.session.status");
        return;

      case "session_summary":
        await vscode.commands.executeCommand("agentLee.session.summary");
        return;

      case "export_session_receipt":
        await vscode.commands.executeCommand("agentLee.session.exportReceipt");
        return;

      case "quiet_mode":
        await vscode.commands.executeCommand("agentLee.performance.quietMode");
        return;

      case "raspberry_mode":
        await vscode.commands.executeCommand("agentLee.performance.raspberryPiMode");
        return;

      case "balanced_mode":
        await vscode.commands.executeCommand("agentLee.performance.setProfile", "balanced");
        return;

      case "performance_status":
        await vscode.commands.executeCommand("agentLee.performance.status");
        return;

      case "heavy_mcp_on":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableHeavyMcpCalls",
          true
        );
        return;

      case "heavy_mcp_off":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableHeavyMcpCalls",
          false
        );
        return;

      case "background_indexing_on":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableBackgroundIndexing",
          true
        );
        return;

      case "background_indexing_off":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableBackgroundIndexing",
          false
        );
        return;

      case "quiet_narration":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableVerboseNarration",
          false
        );
        return;

      case "verbose_narration":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableVerboseNarration",
          true
        );
        return;

      case "manual_verification_only":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableAutoVerification",
          false
        );
        return;

      case "auto_verification_on":
        await vscode.commands.executeCommand(
          "agentLee.performance.setOverride",
          "enableAutoVerification",
          true
        );
        return;

      case "clear_performance_overrides":
        await vscode.commands.executeCommand("agentLee.performance.clearOverrides");
        return;

      case "pause_services":
        await vscode.commands.executeCommand("agentLee.performance.pauseServices");
        return;

      case "resume_services":
        await vscode.commands.executeCommand("agentLee.performance.resumeServices");
        return;

      case "warm_core_services":
        await vscode.commands.executeCommand("agentLee.performance.warmCoreServices");
        return;

      case "dispose_idle_services":
        await vscode.commands.executeCommand("agentLee.performance.disposeIdleServices");
        return;

      case "service_status":
        await vscode.commands.executeCommand("agentLee.performance.services");
        return;

      case "index_status":
        await vscode.commands.executeCommand("agentLee.indexing.status");
        return;

      case "pause_indexing":
        await vscode.commands.executeCommand("agentLee.indexing.pause");
        return;

      case "resume_indexing":
        await vscode.commands.executeCommand("agentLee.indexing.resume");
        return;

      case "related_files":
        await vscode.commands.executeCommand("agentLee.indexing.relatedFiles");
        return;

      case "dependency_status":
        await vscode.commands.executeCommand("agentLee.indexing.dependencyStatus");
        return;

      case "missing_headers":
        await vscode.commands.executeCommand("agentLee.indexing.missingHeaders");
        return;

      case "command_map":
        await vscode.commands.executeCommand("agentLee.indexing.commandMap");
        return;

      case "symbol_search": {
        const symbol = this.extractSymbolQuery(clean);
        if (!symbol) {
          await this.speak("Tell me the symbol name you want me to search for.");
          return;
        }
        await vscode.commands.executeCommand("agentLee.indexing.symbolSearch", symbol);
        return;
      }

      case "chat":
      default:
        await vscode.commands.executeCommand("agentLee.liveVoice.chat", clean);
        return;
    }
  }

  private detectIntent(text: string): LiveIntent {
    const lower = text.toLowerCase();

    if (/\b(start|begin).*(session|coding session|bug session)\b/.test(lower)) return "start_session";
    if (/\bpause.*(session|this session)\b/.test(lower)) return "pause_session";
    if (/\b(resume|continue).*(session|this session)\b/.test(lower)) return "resume_session";
    if (/\b(stop|finish|end).*(session|this session)\b/.test(lower)) return "stop_session";
    if (/\b(what have we done|what did we do|session status|what is the status)\b/.test(lower)) return "session_status";
    if (/\b(finish and summarize|summarize this session|session summary)\b/.test(lower)) return "session_summary";
    if (/\b(export.*receipt|save.*receipt|write.*receipt)\b/.test(lower)) return "export_session_receipt";

    if (/\b(stop|cancel|pause|hold on|wait)\b/.test(lower)) return "cancel";
    if (/\b(yes|approve|go ahead|do it|continue)\b/.test(lower)) return "approve";
    if (/\b(no|deny|do not|don't|cancel that)\b/.test(lower)) return "deny";

    if (/\b(explain|walk me through|what is this|tell me about)\b/.test(lower)) {
      return "explain";
    }

    if (/\b(create|draft|prepare|propose|make).*(edit|change|fix|patch)\b/.test(lower)) {
      return "create_pending_edit";
    }

    if (/\b(open|show).*(diff|changes)\b/.test(lower)) return "open_diff";
    if (/\baccept.*hunk\b/.test(lower)) return "accept_hunk";
    if (/\breject.*hunk\b/.test(lower)) return "reject_hunk";
    if (/\bapply accepted\b/.test(lower)) return "apply_accepted";

    if (/\b(verify|compile|test it|run checks|apply and verify)\b/.test(lower)) {
      return "apply_verify";
    }

    if (/\b(go quiet|quiet mode|use quiet mode)\b/.test(lower)) return "quiet_mode";
    if (/\b(use )?raspberry pi mode\b/.test(lower)) return "raspberry_mode";
    if (/\b(run balanced|balanced mode|use balanced mode)\b/.test(lower)) return "balanced_mode";
    if (/\b(performance status|runtime status|governor status)\b/.test(lower)) return "performance_status";
    if (/\b(turn on heavy mcps|enable heavy mcps|allow heavy mcps)\b/.test(lower)) return "heavy_mcp_on";
    if (/\b(turn off heavy mcps|disable heavy mcps|no heavy mcps)\b/.test(lower)) return "heavy_mcp_off";
    if (/\b(resume background indexing|start background indexing|enable background indexing)\b/.test(lower)) return "background_indexing_on";
    if (/\b(stop background indexing|disable background indexing)\b/.test(lower)) return "background_indexing_off";
    if (/\b(quiet narration|concise narration|minimal narration)\b/.test(lower)) return "quiet_narration";
    if (/\b(verbose narration|detailed narration)\b/.test(lower)) return "verbose_narration";
    if (/\b(manual verification only|disable auto verification|turn auto verification off)\b/.test(lower)) return "manual_verification_only";
    if (/\b(turn auto verification back on|enable auto verification|resume auto verification)\b/.test(lower)) return "auto_verification_on";
    if (/\b(clear performance overrides|reset performance overrides)\b/.test(lower)) return "clear_performance_overrides";
    if (/\b(pause services|pause all services)\b/.test(lower)) return "pause_services";
    if (/\b(resume services|resume all services)\b/.test(lower)) return "resume_services";
    if (/\b(warm core services|warm services|prewarm services)\b/.test(lower)) return "warm_core_services";
    if (/\b(dispose idle services|dispose services|cleanup idle services)\b/.test(lower)) return "dispose_idle_services";
    if (/\b(what services are running|show service status|service status|services status)\b/.test(lower)) return "service_status";
    if (/\b(index status|show index status|indexer status)\b/.test(lower)) return "index_status";
    if (/\b(pause indexing|pause indexer)\b/.test(lower)) return "pause_indexing";
    if (/\b(resume indexing|resume indexer|start indexing)\b/.test(lower)) return "resume_indexing";
    if (/\b(what depends on this file|what files are connected to this|show related files|related files)\b/.test(lower)) return "related_files";
    if (/\b(dependency status|what will break if i edit this|impact status)\b/.test(lower)) return "dependency_status";
    if (/\b(what files are missing leeway headers|missing leeway headers)\b/.test(lower)) return "missing_headers";
    if (/\b(what commands are registered|show command map|command map)\b/.test(lower)) return "command_map";
    if (/\b(where is this symbol used|where is symbol|symbol search|find symbol)\b/.test(lower)) return "symbol_search";

    return "chat";
  }

  private extractSymbolQuery(text: string): string {
    const cleaned = text.trim();
    const match = /symbol\s+([A-Za-z0-9_$.-]+)/i.exec(cleaned);
    if (match?.[1]) return match[1];

    const whereMatch = /where is\s+([A-Za-z0-9_$.-]+)\s+used/i.exec(cleaned);
    if (whereMatch?.[1]) return whereMatch[1];

    return "";
  }

  private async requestApproval(
    label: string,
    command: string,
    args: unknown[]
  ): Promise<void> {
    this.pendingApproval = { label, command, args };
    voiceSessionStore.setPendingApproval(label);

    agentLeeLiveTaskEvents.emit(
      "approval.required",
      `You asked me to ${label}. Say yes to approve, or no to cancel.`,
      { severity: "warning", speak: true }
    );
  }

  private async handleApproval(text: string): Promise<void> {
    const lower = text.toLowerCase();

    if (/\b(yes|approve|go ahead|do it|continue)\b/.test(lower)) {
      const approval = this.pendingApproval;
      this.pendingApproval = null;
      voiceSessionStore.setPendingApproval(null);
      voiceSessionStore.setPhase("executing");

      if (!approval) return;

      voiceSessionStore.setActiveTask(approval.label, approval.command);
      agentLeeLiveTaskEvents.emit(
        "task.started",
        `Approved. I'm going to ${approval.label}.`,
        { severity: "info", speak: true }
      );

      await vscode.commands.executeCommand(approval.command, ...approval.args);
      voiceSessionStore.setPhase("listening");
      voiceSessionStore.setActiveTask(null, null);
      return;
    }

    if (/\b(no|deny|do not|don't|cancel)\b/.test(lower)) {
      const label = this.pendingApproval?.label ?? "that action";
      this.pendingApproval = null;
      voiceSessionStore.setPendingApproval(null);
      voiceSessionStore.setPhase("listening");

      agentLeeLiveTaskEvents.emit(
        "task.finished",
        `Cancelled. I will not ${label}.`,
        { severity: "info", speak: true }
      );

      return;
    }

    await this.speak("I need a clear yes or no before I continue.");
  }
}
