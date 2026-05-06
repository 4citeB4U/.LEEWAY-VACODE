import * as fs from "fs";
import * as path from "path";

export type CapabilityEntry = {
  id: string;
  kind: "mcp" | "agent" | "server";
  label: string;
  source: string;
  description?: string;
  location?: string;
  category?: string;
};

export type CapabilityCatalog = {
  generatedAt: string;
  sources: string[];
  entries: CapabilityEntry[];
  counts: {
    total: number;
    mcps: number;
    agents: number;
    servers: number;
  };
};

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const OUTPUT_FILE = path.join(ROOT, "agent-lee", "mcp", "generated-capability-catalog.json");
const ANTIGRAVITY_ROOT = "D:\\MCP-VS-code-Antigavity";
const LEEWAY_STANDARDS_ROOT = "D:\\LeeWay-Products-Files\\.Leeway-new-line-of-products\\LeeWay-Standards";
const WORKSPACE_AGENTS_ROOT = path.join(ROOT, "workspace", "agents");

function exists(target: string) {
  try {
    return fs.existsSync(target);
  } catch {
    return false;
  }
}

function safeReadJson(target: string) {
  try {
    return JSON.parse(fs.readFileSync(target, "utf8"));
  } catch {
    return null;
  }
}

function walkFiles(root: string, matcher: RegExp, out: string[] = []) {
  if (!exists(root)) return out;

  for (const item of fs.readdirSync(root)) {
    const full = path.join(root, item);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (item === "node_modules" || item === ".git" || item === "dist" || item === "out") continue;
      walkFiles(full, matcher, out);
      continue;
    }

    if (matcher.test(full)) out.push(full);
  }

  return out;
}

function humanizeId(id: string) {
  return id
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function scanAntigravityMcps(root: string) {
  const entries: CapabilityEntry[] = [];
  if (!exists(root)) return entries;

  for (const name of fs.readdirSync(root)) {
    const dir = path.join(root, name);
    if (!exists(dir) || !fs.statSync(dir).isDirectory()) continue;

    const pkg = safeReadJson(path.join(dir, "package.json"));
    const packageName = pkg?.name || name;
    const description = pkg?.description || "";

    if (!/mcp|stitch|banana|debugger/i.test(packageName) && !/mcp|stitch|banana|debugger/i.test(name)) {
      continue;
    }

    entries.push({
      id: name,
      kind: "mcp",
      label: packageName,
      source: "Antigravity",
      description,
      location: dir,
      category: "External MCP"
    });
  }

  return entries;
}

function scanLeeWayAgents(root: string) {
  const entries: CapabilityEntry[] = [];
  const agentsRoot = path.join(root, "src", "agents");
  const files = walkFiles(agentsRoot, /\.(ts|js)$/i);

  for (const file of files) {
    const relative = path.relative(root, file).replace(/\\/g, "/");
    const base = path.basename(file).replace(/\.(ts|js)$/i, "");
    const lower = base.toLowerCase();

    const isAgentFile =
      lower.includes("agent") ||
      /^(aria|atlas|echo|nexus|nova|pixel|sage|shield|vector|ward|bus|observer|governor|registry|repair|runtime|sentinel|scaler)$/i.test(base);

    if (!isAgentFile) continue;

    const group = relative.split("/")[2] || "agents";
    entries.push({
      id: relative.replace(/\//g, ":"),
      kind: "agent",
      label: base,
      source: "LeeWay-Standards",
      location: file,
      category: group
    });
  }

  return entries;
}

function scanLeeWayMcpAgents(root: string) {
  const entries: CapabilityEntry[] = [];
  const mcpRoot = path.join(root, "src", "agents", "mcp");
  const files = walkFiles(mcpRoot, /\.(ts|js)$/i);

  for (const file of files) {
    const base = path.basename(file).replace(/\.(ts|js)$/i, "");
    entries.push({
      id: base,
      kind: "mcp",
      label: base,
      source: "LeeWay-Standards",
      location: file,
      category: "MCP Agent"
    });
  }

  return entries;
}

function scanWorkspaceAgents(root: string) {
  const entries: CapabilityEntry[] = [];
  if (!exists(root)) return entries;

  for (const name of fs.readdirSync(root)) {
    const dir = path.join(root, name);
    if (!exists(dir) || !fs.statSync(dir).isDirectory()) continue;

    entries.push({
      id: name,
      kind: /mcp/i.test(name) ? "mcp" : "agent",
      label: humanizeId(name),
      source: "Workspace",
      location: dir,
      category: "Local Workspace"
    });
  }

  return entries;
}

function scanVsCodeMcpServers(root: string) {
  const entries: CapabilityEntry[] = [];
  const settingsFile = path.join(root, "adapters", "mcp", "vscode-mcp-tooling", "vscode-mcp-settings-snippet.json");
  const settings = safeReadJson(settingsFile);
  const servers = settings?.mcpServers || {};

  for (const [id, config] of Object.entries<any>(servers)) {
    entries.push({
      id,
      kind: "server",
      label: id,
      source: "LeeWay-Standards",
      description: Array.isArray(config?.args) ? config.args.join(" ") : "",
      location: settingsFile,
      category: "VS Code MCP Server"
    });
  }

  return entries;
}

function dedupe(entries: CapabilityEntry[]) {
  const seen = new Set<string>();
  const output: CapabilityEntry[] = [];

  for (const entry of entries) {
    const key = `${entry.kind}:${entry.id}:${entry.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(entry);
  }

  return output.sort((a, b) => a.label.localeCompare(b.label));
}

function summarizeCounts(entries: CapabilityEntry[]) {
  return {
    total: entries.length,
    mcps: entries.filter((entry) => entry.kind === "mcp").length,
    agents: entries.filter((entry) => entry.kind === "agent").length,
    servers: entries.filter((entry) => entry.kind === "server").length
  };
}

export function buildCapabilityCatalog() {
  const entries = dedupe([
    ...scanAntigravityMcps(ANTIGRAVITY_ROOT),
    ...scanLeeWayAgents(LEEWAY_STANDARDS_ROOT),
    ...scanLeeWayMcpAgents(LEEWAY_STANDARDS_ROOT),
    ...scanWorkspaceAgents(WORKSPACE_AGENTS_ROOT),
    ...scanVsCodeMcpServers(LEEWAY_STANDARDS_ROOT)
  ]);

  const catalog: CapabilityCatalog = {
    generatedAt: new Date().toISOString(),
    sources: [ANTIGRAVITY_ROOT, LEEWAY_STANDARDS_ROOT, WORKSPACE_AGENTS_ROOT].filter(exists),
    entries,
    counts: summarizeCounts(entries)
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2), "utf8");
  return catalog;
}

export function loadCapabilityCatalog() {
  if (exists(OUTPUT_FILE)) {
    const json = safeReadJson(OUTPUT_FILE);
    if (json?.entries) return json as CapabilityCatalog;
  }
  return buildCapabilityCatalog();
}

export function formatCapabilitySummary(catalog: CapabilityCatalog) {
  const bySource = new Map<string, CapabilityEntry[]>();
  for (const entry of catalog.entries) {
    const bucket = bySource.get(entry.source) || [];
    bucket.push(entry);
    bySource.set(entry.source, bucket);
  }

  const lines = [
    `Capability catalog generated: ${catalog.generatedAt}`,
    `Totals: ${catalog.counts.total} connected items | MCPs: ${catalog.counts.mcps} | Agents: ${catalog.counts.agents} | VS Code MCP servers: ${catalog.counts.servers}`
  ];

  for (const [source, entries] of bySource) {
    const mcps = entries.filter((entry) => entry.kind === "mcp").slice(0, 20).map((entry) => entry.label);
    const agents = entries.filter((entry) => entry.kind === "agent").slice(0, 20).map((entry) => entry.label);
    const servers = entries.filter((entry) => entry.kind === "server").slice(0, 20).map((entry) => entry.label);

    lines.push(`Source: ${source}`);
    if (mcps.length) lines.push(`- MCPs: ${mcps.join(", ")}`);
    if (agents.length) lines.push(`- Agents: ${agents.join(", ")}`);
    if (servers.length) lines.push(`- Servers: ${servers.join(", ")}`);
  }

  return lines.join("\n");
}
