/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.FILE_INTELLIGENCE
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
import * as path from "path";

const IGNORE = new Set(["node_modules", ".git", "dist", "out", "build", ".next", ".vite", "coverage", ".cache", ".turbo"]);
const CODE_EXT = /\.(ts|tsx|js|jsx|json|html|css|md|mjs|cjs|py|ps1|yaml|yml|xml|sql)$/i;

export function extractPathFromPrompt(prompt: string): string {
  const win = prompt.match(/[A-Z]:\\[^\n\r"']+/i);
  if (win) return win[0].trim();
  const quoted = prompt.match(/["']([^"']+)["']/);
  if (quoted && quoted[1].includes("\\")) return quoted[1].trim();
  return "";
}

export function extractUrlFromPrompt(prompt: string): string {
  const url = prompt.match(/https?:\/\/[^\s"')\]]+/i);
  return url ? url[0].trim() : "";
}

export function walkFiles(root: string, out: string[] = [], max = 800) {
  if (!root || !fs.existsSync(root) || out.length >= max) return out;

  for (const item of fs.readdirSync(root)) {
    if (out.length >= max) break;
    if (IGNORE.has(item)) continue;

    const full = path.join(root, item);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walkFiles(full, out, max);
      else if (CODE_EXT.test(full) && stat.size < 800000) out.push(full);
    } catch {}
  }

  return out;
}

export function buildContext(root: string) {
  const files = walkFiles(root);
  const samples = files.slice(0, 50).map((file) => {
    try {
      return {
        file,
        preview: fs.readFileSync(file, "utf8").slice(0, 1800)
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as { file: string; preview: string }[];

  return { total: files.length, samples };
}

