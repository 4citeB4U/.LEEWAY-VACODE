/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.RUNTIME.LEEWAY_WRITE_POLICY.MAIN

5WH:
WHAT = Centralized LeeWay write-governance policy for Agent Lee.
WHY = Forces governed files to be created and updated with LeeWay metadata by default.
WHO = Agent Lee / LeeWay Runtime.
WHERE = agent-lee/vscode-extension/src/core/leeway-write-policy.ts
WHEN = 2026
HOW = Path-based governance detection, TAG and REGION inference, metadata injection, and compliance auditing.
*/

import * as fs from "fs";
import * as path from "path";

const GOVERNED_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".html", ".css", ".json", ".md", ".yml", ".yaml", ".ps1", ".py"
]);

const IGNORED_SEGMENTS = [
  "node_modules", ".git", "out", "dist", "build", "coverage", ".next", ".vite",
  "logs", "memory", "reports", "backups", "patches", "sandbox", "vendor", "tooling"
];

const SELF_SCAN_EXCLUSIONS = [
  "mcp/adapters",
  "agent-lee/mcp/adapters",
  "vscode-mcp-tooling",
  "config/runtime-state.json",
  "runtime-receipts.ndjson",
  "Agent_Lee_Persona_System/00_README.md",
  "agent_lee_persona_system/00_readme.md",
  "agent-lee-leeway-coding-system-READY-STABLE.vsix",
  "sdk/leeway-sdk",
  "scratch_verify_scanner.ts"
];

const DISCOVERY_PIPELINE = "Voice → Intent → Location → Vertical → Ranking → Render";

export type LeewayAuditResult = {
  filePath: string;
  score: number;
  grade: "GOLD" | "SILVER" | "BRONZE" | "NON-COMPLIANT";
  blocking: boolean;
  hasHeader: boolean;
  hasTag: boolean;
  hasRegion: boolean;
  hasDiscoveryPipeline: boolean;
};

export type LeewayDirectoryAudit = {
  directoryPath: string;
  governedFiles: number;
  compliantFiles: number;
  blockingFiles: number;
  averageCompliance: number;
  blockingPaths: string[];
};

export function shouldBypassLeeway(userInstruction: string): boolean {
  return /\b(do not use leeway headers|write without leeway metadata|plain file only|no leeway standards for this file)\b/i.test(userInstruction);
}

export function isGovernedFile(filePath: string): boolean {
  return isGovernedLeeWayFile(filePath, process.cwd(), "workspace");
}

export function isGovernedLeeWayFile(filePath: string, root: string, mode: "self" | "workspace" | "currentFile"): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const normalizedRoot = root.replace(/\\/g, "/").toLowerCase();
  
  // Basic path sanitization for relative check
  let relative = normalized;
  if (normalized.startsWith(normalizedRoot)) {
    relative = normalized.slice(normalizedRoot.length).replace(/^\//, "");
  }

  // Basic exclusion for all modes (infrastructure folders)
  if (IGNORED_SEGMENTS.some((segment) => normalized.includes(`/${segment.toLowerCase()}/`))) {
    return false;
  }

  // Extension check
  const ext = path.extname(filePath).toLowerCase();
  if (!GOVERNED_EXTENSIONS.has(ext)) return false;

  // Mode specific exclusions
  if (mode === "self") {
    // Exclude common build/meta files
    if (relative.endsWith(".vsix") || relative.endsWith(".map") || relative.endsWith("package-lock.json") || relative.endsWith("scratch_verify_scanner.ts")) return false;
    
    // Exclude voice models metadata and schemas
    if (relative.startsWith("voice/models/") && relative.endsWith(".onnx.json")) return false;
    if (relative.startsWith("sdk/schemas/") && relative.endsWith(".json")) return false;

    // Explicit exclusions for Agent Lee standalone runtime
    if (SELF_SCAN_EXCLUSIONS.some(ex => relative === ex.toLowerCase() || relative.startsWith(ex.toLowerCase() + "/"))) {
      return false;
    }
  }

  return true;
}

export function inferLeewayRegion(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  if (/(^|\/)(components|pages|views|media)(\/|$)/.test(normalized)) return "🔵 UI";
  if (/(^|\/)(ai|agents|models|llm|voice)(\/|$)/.test(normalized)) return "🧠 AI";
  if (/(^|\/)(data|store|db|memory|receipts|reports)(\/|$)/.test(normalized)) return "💾 DATA";
  if (/(^|\/)(mcp|plugins)(\/|$)/.test(normalized)) return "🟣 MCP";
  if (/(^|\/)(seo|sitemap|schema)(\/|$)/.test(normalized)) return "🔴 SEO";
  if (/(^|\/)(tools|scripts)(\/|$)/.test(normalized)) return "🟠 UTIL";
  return "🟢 CORE";
}

export const VALID_REGIONS = [
  "🔵 UI", "🧠 AI", "💾 DATA", "🟢 CORE", "🟣 MCP", "🔴 SEO", "🟠 UTIL",
  "?? UI", "?? AI", "?? DATA", "?? CORE", "?? MCP", "?? SEO", "?? UTIL"
];

export function inferLeewayTag(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const base = path.basename(filePath, path.extname(filePath)).replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase() || "MAIN";
  const lowered = normalized.toLowerCase();

  if (/(^|\/)components(\/|$)/.test(lowered)) return `UI.COMPONENT.${base}.MAIN`;
  if (/(^|\/)pages(\/|$)/.test(lowered)) return `UI.PUBLIC.PAGE.${base}`;
  if (/(^|\/)(ai|agents|models|llm)(\/|$)/.test(lowered)) return "AI.ORCHESTRATION.MODEL.LOADER";
  if (/(^|\/)(data|store|db)(\/|$)/.test(lowered)) return "DATA.LOCAL.STORE.MAIN";
  if (/(^|\/)mcp(\/|$)/.test(lowered)) return `MCP.TOOL.${base}.MAIN`;
  if (/(^|\/)(seo|sitemap|schema)(\/|$)/.test(lowered)) return `SEO.METADATA.${base}.MAIN`;
  if (/(^|\/)tools(\/|$)/.test(lowered)) {
    const type = path.dirname(normalized).split(/[\\/]/).pop()?.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase() || "LOCAL";
    return `TOOLS.${type}.${base}.MAIN`;
  }
  if (/(^|\/)core(\/|$)/.test(lowered)) return `CORE.RUNTIME.${base}.MAIN`;
  return `UTIL.LOCAL.${base}.MAIN`;
}

export function hasLeewayHeader(content: string): boolean {
  return /LEEWAY_HEADER/.test(content);
}

export function buildLeewayHeader(filePath: string, purpose?: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const region = inferLeewayRegion(filePath);
  const tag = inferLeewayTag(filePath);
  const summary = purpose || `Agent Lee governed file for ${path.basename(filePath)}.`;

  if (ext === ".json") {
    return JSON.stringify({
      leeway: {
        LEEWAY_HEADER: "DO NOT REMOVE",
        TAG: tag,
        REGION: region,
        PURPOSE: summary,
        DISCOVERY_PIPELINE: DISCOVERY_PIPELINE
      }
    }, null, 2);
  }

  if (ext === ".yml" || ext === ".yaml") {
    return [
      "# LEEWAY_HEADER - DO NOT REMOVE",
      `# TAG: ${tag}`,
      `# REGION: ${region}`,
      `# PURPOSE: ${summary}`,
      "# DISCOVERY_PIPELINE:",
      `#   ${DISCOVERY_PIPELINE}`
    ].join("\n");
  }

  if (ext === ".md" || ext === ".html") {
    return [
      "<!--",
      "LEEWAY_HEADER - DO NOT REMOVE",
      `TAG: ${tag}`,
      `REGION: ${region}`,
      `PURPOSE: ${summary}`,
      "DISCOVERY_PIPELINE:",
      `  ${DISCOVERY_PIPELINE}`,
      "-->"
    ].join("\n");
  }

  if (ext === ".py") {
    return [
      "# LEEWAY_HEADER - DO NOT REMOVE",
      `# TAG: ${tag}`,
      `# REGION: ${region}`,
      `# PURPOSE: ${summary}`,
      "# DISCOVERY_PIPELINE:",
      `#   ${DISCOVERY_PIPELINE}`
    ].join("\n");
  }

  if (ext === ".ps1") {
    return [
      "<#",
      "LEEWAY_HEADER - DO NOT REMOVE",
      `TAG: ${tag}`,
      `REGION: ${region}`,
      `PURPOSE: ${summary}`,
      "DISCOVERY_PIPELINE:",
      `  ${DISCOVERY_PIPELINE}`,
      "#>"
    ].join("\n");
  }

  return [
    "/*",
    "LEEWAY_HEADER - DO NOT REMOVE",
    "",
    `TAG: ${tag}`,
    `REGION: ${region}`,
    `PURPOSE: ${summary}`,
    "DISCOVERY_PIPELINE:",
    `  ${DISCOVERY_PIPELINE}`,
    "*/"
  ].join("\n");
}

export function ensureLeewayCompliantContent(filePath: string, content: string, purpose?: string): string {
  if (!isGovernedFile(filePath)) return content;

  const ext = path.extname(filePath).toLowerCase();
  const region = inferLeewayRegion(filePath);
  const tag = inferLeewayTag(filePath);
  const summary = purpose || `Agent Lee governed file for ${path.basename(filePath)}.`;

  if (ext === ".json") {
    try {
      const parsed = content.trim() ? JSON.parse(content) : {};
      const next: Record<string, unknown> = (parsed && typeof parsed === "object" && !Array.isArray(parsed))
        ? parsed as Record<string, unknown>
        : { value: parsed };
      next.leeway = {
        LEEWAY_HEADER: "DO NOT REMOVE",
        TAG: tag,
        REGION: region,
        PURPOSE: summary,
        DISCOVERY_PIPELINE: DISCOVERY_PIPELINE
      };
      return JSON.stringify(next, null, 2);
    } catch {
      return content;
    }
  }

  if (hasLeewayHeader(content)) {
    return ensureDiscoveryPipeline(content, ext, region, tag, summary);
  }

  return `${buildLeewayHeader(filePath, summary)}\n\n${content.replace(/^\s+/, "")}`;
}

export function auditLeewayContent(filePath: string, content: string): LeewayAuditResult {
  const hasHeader = hasLeewayHeader(content);
  const hasTag = /TAG:|\"TAG\"\s*:/.test(content);
  const hasRegion = /REGION:|\"REGION\"\s*:/.test(content);
  const hasDiscoveryPipeline = /DISCOVERY_PIPELINE/.test(content) && /Voice\s*[→-]/.test(content);
  const score = (hasHeader ? 25 : 0) + (hasTag ? 25 : 0) + (hasRegion ? 25 : 0) + (hasDiscoveryPipeline ? 25 : 0);

  let grade: LeewayAuditResult["grade"] = "NON-COMPLIANT";
  if (score >= 95) grade = "GOLD";
  else if (score >= 85) grade = "SILVER";
  else if (score >= 70) grade = "BRONZE";

  return {
    filePath,
    score,
    grade,
    blocking: score < 70,
    hasHeader,
    hasTag,
    hasRegion,
    hasDiscoveryPipeline
  };
}

export function auditDirectoryBeforeWrite(directoryPath: string): LeewayDirectoryAudit {
  const files = walkGovernedFiles(directoryPath);
  const audits = files.map((filePath) => {
    try {
      return auditLeewayContent(filePath, fs.readFileSync(filePath, "utf8"));
    } catch {
      return {
        filePath,
        score: 0,
        grade: "NON-COMPLIANT" as const,
        blocking: true,
        hasHeader: false,
        hasTag: false,
        hasRegion: false,
        hasDiscoveryPipeline: false
      };
    }
  });

  const governedFiles = audits.length;
  const compliantFiles = audits.filter((audit) => audit.score === 100).length;
  const blocking = audits.filter((audit) => audit.blocking);
  const averageCompliance = governedFiles
    ? Number((audits.reduce((sum, audit) => sum + audit.score, 0) / governedFiles).toFixed(2))
    : 100;

  return {
    directoryPath,
    governedFiles,
    compliantFiles,
    blockingFiles: blocking.length,
    averageCompliance,
    blockingPaths: blocking.map((audit) => audit.filePath)
  };
}

function walkGovernedFiles(directoryPath: string, output: string[] = []) {
  if (!fs.existsSync(directoryPath)) return output;
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_SEGMENTS.includes(entry.name)) continue;
      walkGovernedFiles(fullPath, output);
      continue;
    }
    if (isGovernedFile(fullPath)) output.push(fullPath);
  }
  return output;
}

function ensureDiscoveryPipeline(content: string, ext: string, region: string, tag: string, purpose: string) {
  let next = content;
  if (!/TAG:|\"TAG\"\s*:/.test(next)) next = injectMetadataLine(next, ext, `TAG: ${tag}`);
  if (!/REGION:|\"REGION\"\s*:/.test(next)) next = injectMetadataLine(next, ext, `REGION: ${region}`);
  if (!/PURPOSE:|\"PURPOSE\"\s*:/.test(next)) next = injectMetadataLine(next, ext, `PURPOSE: ${purpose}`);
  if (!/DISCOVERY_PIPELINE/.test(next)) next = injectMetadataLine(next, ext, `DISCOVERY_PIPELINE:\n  ${DISCOVERY_PIPELINE}`);
  return next;
}

function injectMetadataLine(content: string, ext: string, line: string) {
  if (ext === ".md" || ext === ".html") {
    return content.replace("<!--\nLEEWAY_HEADER - DO NOT REMOVE", `<!--\nLEEWAY_HEADER - DO NOT REMOVE\n${line}`);
  }
  if (ext === ".py" || ext === ".yml" || ext === ".yaml") {
    const prefixed = line.split("\n").map((item) => `# ${item}`).join("\n");
    return content.replace(/# LEEWAY_HEADER - DO NOT REMOVE/, `# LEEWAY_HEADER - DO NOT REMOVE\n${prefixed}`);
  }
  if (ext === ".ps1") {
    return content.replace("<#\nLEEWAY_HEADER - DO NOT REMOVE", `<#\nLEEWAY_HEADER - DO NOT REMOVE\n${line}`);
  }
  return content.replace("/*\nLEEWAY_HEADER - DO NOT REMOVE\n", `/*\nLEEWAY_HEADER - DO NOT REMOVE\n${line}\n`);
}

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/
