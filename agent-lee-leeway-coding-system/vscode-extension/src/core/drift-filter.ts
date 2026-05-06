/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.DRIFT_FILTER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

export const IGNORED_PATHS = [
  "node_modules",
  ".git",
  "dist",
  "out",
  "build",
  ".next",
  ".vite",
  "coverage",
  ".cache",
  ".turbo"
];

export const IGNORED_EXTENSIONS = [
  ".log",
  ".tmp",
  ".cache",
  ".vsix"
];

export function isNoisePath(filePath: string): boolean {
  const p = filePath.replace(/\\/g, "/").toLowerCase();

  if (IGNORED_PATHS.some(x => p.includes(`/${x}/`) || p.endsWith(`/${x}`))) {
    return true;
  }

  if (IGNORED_EXTENSIONS.some(ext => p.endsWith(ext))) {
    return true;
  }

  return false;
}

export function classifyDrift(filePath: string, changeType: string) {
  if (isNoisePath(filePath)) {
    return {
      actionable: false,
      priority: "ignore",
      reason: "Ignored generated/dependency/cache artifact"
    };
  }

  if (filePath.includes("src/core") || filePath.includes("law-engine") || filePath.includes("scheduler")) {
    return {
      actionable: true,
      priority: "critical",
      reason: "Core governance file changed"
    };
  }

  return {
    actionable: true,
    priority: "normal",
    reason: "Relevant source change"
  };
}

