/*
LEEWAY HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.EXECUTION.REPAIR.EDITBUFFER.ADAPTER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as path from "path";
import * as vscode from "vscode";
import { sendExecutionPlanToEditBuffer } from "./executionToEditBuffer.adapter";

export interface VerificationRepairCandidate {
  filePath: string;
  title: string;
  message: string;
  reason?: string;
  originalText?: string;
  proposedText?: string;
  startOffset?: number;
  endOffset?: number;
  line?: number;
  character?: number;
  risk?: "low" | "medium" | "high" | "critical";
  confidence?: number;
  repairKind?:
    | "unused_import"
    | "missing_module"
    | "missing_symbol"
    | "type_mismatch"
    | "review_marker"
    | "unknown";
  spokenSummary?: string;
  reviewRequired?: boolean;
  safeToAutoSuggest?: boolean;
}

export async function sendVerificationRepairsToEditBuffer(input: {
  title?: string;
  objective?: string;
  candidates: VerificationRepairCandidate[];
  workspaceRoot?: string;
}): Promise<string | null> {
  const safeCandidates = input.candidates.filter((candidate) => {
    return !!candidate.filePath;
  });

  if (safeCandidates.length === 0) {
    void vscode.window.showInformationMessage(
      "Agent Lee found verification issues, but no safe repair hunks were generated yet."
    );
    return null;
  }

  const hunks = [];

  for (const candidate of safeCandidates) {
    const resolved = await resolveCandidateHunk(candidate, input.workspaceRoot);
    if (!resolved) continue;
    hunks.push(resolved);
  }

  if (hunks.length === 0) {
    void vscode.window.showWarningMessage(
      "Agent Lee could not resolve repair candidates into safe pending hunks."
    );
    return null;
  }

  return sendExecutionPlanToEditBuffer(
    {
      title: input.title ?? "Agent Lee Verification Repair Package",
      objective:
        input.objective ??
        "Create pending repair hunks from verification and diagnostic output.",
      hunks
    },
    input.workspaceRoot
  );
}

async function resolveCandidateHunk(
  candidate: VerificationRepairCandidate,
  workspaceRoot?: string
) {
  const uri = resolveUri(candidate.filePath, workspaceRoot);
  const document = await vscode.workspace.openTextDocument(uri);
  const text = document.getText();

  if (
    typeof candidate.startOffset === "number" &&
    typeof candidate.endOffset === "number"
  ) {
    const originalText = text.slice(candidate.startOffset, candidate.endOffset);
    const proposedText = candidate.proposedText ?? originalText;

    return {
      filePath: candidate.filePath,
      title: candidate.title,
      reason: candidate.reason ?? candidate.message,
      originalText,
      proposedText,
      startOffset: candidate.startOffset,
      endOffset: candidate.endOffset,
      risk: candidate.risk ?? "medium"
    };
  }

  if (candidate.originalText) {
    const index = text.indexOf(candidate.originalText);

    if (index >= 0) {
      return {
        filePath: candidate.filePath,
        title: candidate.title,
        reason: candidate.reason ?? candidate.message,
        originalText: candidate.originalText,
        proposedText: candidate.proposedText ?? candidate.originalText,
        startOffset: index,
        endOffset: index + candidate.originalText.length,
        risk: candidate.risk ?? "medium"
      };
    }
  }

  if (typeof candidate.line === "number") {
    const line = Math.max(candidate.line, 0);
    if (line >= document.lineCount) return null;

    const lineText = document.lineAt(line).text;
    const startOffset = document.offsetAt(new vscode.Position(line, 0));
    const endOffset = document.offsetAt(new vscode.Position(line, lineText.length));

    return {
      filePath: candidate.filePath,
      title: candidate.title,
      reason: candidate.reason ?? candidate.message,
      originalText: lineText,
      proposedText: candidate.proposedText ?? lineText,
      startOffset,
      endOffset,
      risk: candidate.risk ?? "medium"
    };
  }

  return null;
}

function resolveUri(filePath: string, workspaceRoot?: string): vscode.Uri {
  if (/^[a-zA-Z]:[\\/]/.test(filePath)) {
    return vscode.Uri.file(filePath);
  }

  const root = workspaceRoot || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) {
    throw new Error("No workspace root found for repair candidate.");
  }

  return vscode.Uri.file(path.join(root, filePath));
}
