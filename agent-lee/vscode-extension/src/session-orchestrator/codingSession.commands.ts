/*
LEEWAY HEADER — DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.SESSION.COMMANDS.MAIN

5WH:
WHAT = Agent Lee coding session command registration
WHY = Exposes session lifecycle commands to VS Code and live voice control
WHO = Agent Lee Session Orchestrator
WHERE = src/session-orchestrator/codingSession.commands.ts
WHEN = 2026
HOW = VS Code command registration wired to session orchestrator

AGENTS:
SESSION
PRIME
VOICE
AUDIT

LICENSE:
MIT
*/

import * as vscode from "vscode";
import { codingSessionOrchestrator } from "./codingSession.orchestrator";

export function registerAgentLeeCodingSessionCommands(
  context: vscode.ExtensionContext,
  speak: (text: string) => void | Promise<void>
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "agentLee.session.start",
      async (userRequest?: string) => {
        const editor = vscode.window.activeTextEditor;

        const session = codingSessionOrchestrator.start({
          title: "Agent Lee Coding Session",
          objective: userRequest ?? "Live guided coding session.",
          userRequest,
          activeEditorUri: editor?.document.uri.toString(),
          activeEditorLanguageId: editor?.document.languageId,
        });

        await speak(`Coding session started. Session ID ${session.id}.`);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("agentLee.session.pause", async () => {
      codingSessionOrchestrator.pause("Coding session paused.");
      await speak("Coding session paused.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("agentLee.session.resume", async () => {
      codingSessionOrchestrator.resume("Coding session resumed.");
      await speak("Coding session resumed.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("agentLee.session.stop", async () => {
      codingSessionOrchestrator.stop("Coding session stopped.");
      await speak("Coding session stopped.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("agentLee.session.status", async () => {
      const status = codingSessionOrchestrator.status();
      await speak(status);
      vscode.window.showInformationMessage(status);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("agentLee.session.summary", async () => {
      const summary = codingSessionOrchestrator.summary();
      await speak(summary);
      vscode.window.showInformationMessage(summary);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "agentLee.session.exportReceipt",
      async () => {
        const result = codingSessionOrchestrator.exportReceipt();
        await speak(result);
        vscode.window.showInformationMessage(result);
      }
    )
  );
}

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/
