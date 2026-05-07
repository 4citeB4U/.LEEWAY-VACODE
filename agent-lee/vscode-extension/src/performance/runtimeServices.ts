/*
LEEWAY HEADER — DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.PERFORMANCE.RUNTIME.SERVICES

5WH:
WHAT = Agent Lee lazy runtime service registration and control
WHY = Ensures long-running or warmable services obey the runtime governor and only wake when needed
WHO = Agent Lee Runtime Performance Governor
WHERE = src/performance/runtimeServices.ts
WHEN = 2026
HOW = Registers real service instances and lightweight service wrappers into the lazy registry

AGENTS:
DOCTOR
PRIME
VOICE
AUDIT

LICENSE:
MIT
*/

import * as vscode from "vscode";
import type { AgentLeePluginRouter } from "../plugins/agentLeePluginRouter";
import { defaultVerificationCommands, runVerificationCommand } from "../execution-brain/terminalVerification.runner";
import { synthesizeRepairCandidates } from "../execution-brain/repairSynthesizer";
import type { AgentLeeTranscriptBridge } from "../live-voice/liveTranscriptBridge";
import type { AgentLeeLiveProcessNarrator } from "../live-voice/liveProcessNarrator";
import { getOrCreateBackgroundIndexerService } from "../indexing/backgroundIndexer.service";
import { lazyServiceRegistry } from "./lazyServiceRegistry";
import { performanceGovernor } from "./performanceGovernor";

let coreServicesRegistered = false;
let voiceServicesRegistered = false;

export function registerAgentLeeCoreRuntimeServices(
  context: vscode.ExtensionContext,
  deps: {
    pluginRouter: AgentLeePluginRouter;
  }
): void {
  if (coreServicesRegistered) {
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
  const backgroundIndexer = getOrCreateBackgroundIndexerService(workspaceRoot);

  lazyServiceRegistry.register(
    "mcp-router",
    async () => deps.pluginRouter,
    { core: true }
  );

  lazyServiceRegistry.register(
    "verification-runner",
    async () => ({
      defaultVerificationCommands,
      runVerificationCommand,
    }),
    { core: true }
  );

  lazyServiceRegistry.register(
    "repair-synthesizer",
    async () => ({
      synthesizeRepairCandidates,
    }),
    { core: true }
  );

  lazyServiceRegistry.register(
    "background-indexer",
    async () => backgroundIndexer,
    {
      pause: async (service) => {
        service.pause();
      },
      resume: async (service) => {
        service.resume();
      },
      dispose: async (service) => {
        service.dispose();
      },
    }
  );

  lazyServiceRegistry.register(
    "local-stt",
    async () => ({
      available: false,
      status: "not-configured",
    }),
    {
      pause: async () => undefined,
      resume: async () => undefined,
      dispose: async () => undefined,
    }
  );

  coreServicesRegistered = true;
  context.subscriptions.push({
    dispose() {
      coreServicesRegistered = false;
    },
  });
}

export function registerAgentLeeVoiceRuntimeServices(
  context: vscode.ExtensionContext,
  deps: {
    transcriptBridge: AgentLeeTranscriptBridge;
    narrator: AgentLeeLiveProcessNarrator;
  }
): void {
  if (!voiceServicesRegistered) {
    lazyServiceRegistry.register(
      "transcript-bridge",
      async () => deps.transcriptBridge,
      {
        core: true,
        warm: async (service) => {
          await service.start();
        },
        pause: async (service) => {
          await service.stop();
        },
        resume: async (service) => {
          await service.start();
        },
        dispose: async (service) => {
          await service.stop();
        },
      }
    );

    lazyServiceRegistry.register(
      "voice-narrator",
      async () => deps.narrator,
      {
        core: true,
      }
    );

    voiceServicesRegistered = true;
  }

  context.subscriptions.push({
    dispose() {
      voiceServicesRegistered = false;
    },
  });
}

export async function warmCoreRuntimeServices(): Promise<string[]> {
  const budget = performanceGovernor.getBudget();
  const coreIds = [
    "voice-narrator",
    "verification-runner",
    "repair-synthesizer",
    "mcp-router",
  ];

  if (budget.enableBackgroundIndexing && budget.profile !== "raspberry_pi") {
    coreIds.push("background-indexer");
  }

  if (budget.enableLiveVoiceNarration && budget.profile !== "raspberry_pi") {
    coreIds.push("transcript-bridge");
  }

  return lazyServiceRegistry.warmServices(coreIds);
}

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/