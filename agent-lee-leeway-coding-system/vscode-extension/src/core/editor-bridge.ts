/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.EDITOR_BRIDGE
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
import * as path from "path";
import { execFile } from "child_process";

export type EditorBridge = {
  id: string;
  label: string;
  command: string;
  args?: string[];
  installed: boolean;
  source?: string;
};

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const PYCHARM_TOOLSET = path.join(ROOT, "LeeWay-Standards", "leeway-pycharm-tools.xml");

function exists(file: string) {
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
}

function pickExisting(candidates: string[]) {
  return candidates.find(exists) || "";
}

export function detectEditors(): EditorBridge[] {
  const localAppData = process.env.LOCALAPPDATA || "";
  const userProfile = process.env.USERPROFILE || "";
  const programFiles = process.env.ProgramFiles || "C:\\Program Files";

  const vscode = pickExisting([
    path.join(localAppData, "Programs", "Microsoft VS Code", "bin", "code.cmd"),
    "code.cmd"
  ]);

  const pycharm = pickExisting([
    path.join(programFiles, "JetBrains", "PyCharm 2026.1.1", "bin", "pycharm64.exe"),
    path.join(programFiles, "JetBrains", "PyCharm 2026.1", "bin", "pycharm64.exe"),
    path.join(programFiles, "JetBrains", "PyCharm 2025.3", "bin", "pycharm64.exe"),
    "pycharm64.exe"
  ]);

  const cursor = pickExisting([
    path.join(localAppData, "Programs", "cursor", "Cursor.exe"),
    path.join(userProfile, "AppData", "Local", "Programs", "Cursor", "Cursor.exe"),
    "cursor.exe"
  ]);

  return [
    { id: "vscode", label: "VS Code", command: vscode || "code.cmd", installed: Boolean(vscode), source: vscode || undefined },
    { id: "pycharm", label: "PyCharm", command: pycharm || "pycharm64.exe", installed: Boolean(pycharm), source: pycharm || undefined },
    { id: "cursor", label: "Cursor", command: cursor || "cursor.exe", installed: Boolean(cursor), source: cursor || undefined }
  ];
}

export function openTargetInEditor(editorId: string, target: string) {
  const editor = detectEditors().find((item) => item.id === editorId);
  if (!editor) {
    throw new Error(`Unknown editor: ${editorId}`);
  }
  if (!editor.installed) {
    throw new Error(`${editor.label} is not installed on this machine.`);
  }

  execFile(editor.command, [target], () => {});
  return `${editor.label} launched for ${target}`;
}

function findPyCharmToolsDirs() {
  const appData = process.env.APPDATA || "";
  if (!appData) return [];

  const jetbrainsRoot = path.join(appData, "JetBrains");
  if (!exists(jetbrainsRoot)) return [];

  const dirs = fs.readdirSync(jetbrainsRoot)
    .filter((name) => /^PyCharm/i.test(name))
    .map((name) => path.join(jetbrainsRoot, name, "tools"));

  return dirs;
}

export function installPyCharmTooling() {
  if (!exists(PYCHARM_TOOLSET)) {
    throw new Error(`PyCharm toolset file not found: ${PYCHARM_TOOLSET}`);
  }

  const targets = findPyCharmToolsDirs();
  if (!targets.length) {
    throw new Error("No PyCharm config directories were found under AppData\\Roaming\\JetBrains.");
  }

  for (const dir of targets) {
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(PYCHARM_TOOLSET, path.join(dir, "Agent-Lee-LeeWay.xml"));
  }

  return `Installed Agent Lee PyCharm tools into ${targets.length} PyCharm configuration folder(s).`;
}

