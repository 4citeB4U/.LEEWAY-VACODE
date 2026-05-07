/*
LEEWAY HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.EDITBUFFER.APPLY.MAIN
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as vscode from "vscode";
import { editBufferStore } from "./editBuffer.store";
import { checkHunkConflict } from "./editBuffer.conflict";
import { writeEditBufferReceipt } from "./editBuffer.receipts";

export interface ApplyAcceptedResult {
  ok: boolean;
  applied: number;
  blocked: number;
  rebased: number;
  summary: string;
}

export async function applyAcceptedHunksConflictAware(
  packageId: string
): Promise<ApplyAcceptedResult> {
  const pkg = editBufferStore.getPackage(packageId);
  if (!pkg) {
    return { ok: false, applied: 0, blocked: 0, rebased: 0, summary: `Package not found: ${packageId}` };
  }

  const workspaceEdit = new vscode.WorkspaceEdit();
  let applied = 0;
  let blocked = 0;
  let rebased = 0;
  const appliedHunks: string[] = [];
  const blockedHunks: string[] = [];
  const touchedFiles: string[] = [];

  for (const file of pkg.files) {
    const acceptedHunks = file.hunks
      .filter((hunk) => hunk.status === "accepted")
      .sort((a, b) => {
        const lineDelta = b.range.start.line - a.range.start.line;
        if (lineDelta !== 0) return lineDelta;
        return b.range.start.character - a.range.start.character;
      });

    if (!acceptedHunks.length) continue;
    const document = await vscode.workspace.openTextDocument(file.uri);
    touchedFiles.push(file.path);

    for (const hunk of acceptedHunks) {
      const conflict = checkHunkConflict(document, hunk);
      if (conflict.status === "conflict" || conflict.status === "missing_original") {
        blocked += 1;
        blockedHunks.push(hunk.id);
        hunk.status = "failed";
        hunk.updatedAt = new Date().toISOString();
        continue;
      }

      if (conflict.status === "rebase_available") {
        rebased += 1;
        hunk.range = conflict.range;
        hunk.updatedAt = new Date().toISOString();
      }

      workspaceEdit.replace(file.uri, conflict.range, hunk.proposedText);
      applied += 1;
      appliedHunks.push(hunk.id);
    }
  }

  if (applied === 0) {
    writeEditBufferReceipt({
      packageId,
      action: "edit.applyAccepted",
      status: "blocked",
      summary: "No accepted Agent Lee hunks were safe to apply.",
      files: touchedFiles,
      hunks: blockedHunks,
      details: { blocked, rebased }
    });
    return { ok: false, applied, blocked, rebased, summary: "No accepted hunks were safe to apply." };
  }

  const ok = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Agent Lee applying accepted hunks...",
      cancellable: false
    },
    async () => vscode.workspace.applyEdit(workspaceEdit)
  );

  if (!ok) {
    writeEditBufferReceipt({
      packageId,
      action: "edit.applyAccepted",
      status: "failed",
      summary: "VS Code rejected the WorkspaceEdit.",
      files: touchedFiles,
      hunks: appliedHunks,
      details: { applied, blocked, rebased }
    });
    return { ok: false, applied: 0, blocked, rebased, summary: "WorkspaceEdit failed." };
  }

  for (const file of pkg.files) {
    for (const hunk of file.hunks) {
      if (appliedHunks.includes(hunk.id)) {
        hunk.status = "applied";
        hunk.updatedAt = new Date().toISOString();
      }
    }

    if (file.hunks.every((hunk) => hunk.status === "applied" || hunk.status === "rejected" || hunk.status === "failed")) {
      file.status = "applied";
      file.updatedAt = new Date().toISOString();
    }
  }

  pkg.status = blocked > 0 ? "failed" : "applied";
  pkg.updatedAt = new Date().toISOString();

  writeEditBufferReceipt({
    packageId,
    action: "edit.applyAccepted",
    status: blocked > 0 ? "blocked" : rebased > 0 ? "rebased" : "passed",
    summary: `Applied ${applied} accepted hunk(s). Blocked ${blocked}. Rebased ${rebased}.`,
    files: touchedFiles,
    hunks: appliedHunks,
    details: { applied, blocked, rebased }
  });

  return {
    ok: blocked === 0,
    applied,
    blocked,
    rebased,
    summary: `Applied ${applied} accepted hunk(s). Blocked ${blocked}. Rebased ${rebased}.`
  };
}
