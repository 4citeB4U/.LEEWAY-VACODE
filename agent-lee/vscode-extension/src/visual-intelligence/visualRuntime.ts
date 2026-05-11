/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.VISUAL.LVIS.RUNTIME
PURPOSE: Sovereign visual runtime for LVIS worker routing, deterministic reconstruction helpers, and local model mapping.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

import * as fs from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";
import { LLMProvider } from "../core/LLMProvider";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const VISUAL_ROOT = path.join(ROOT, "agent-lee", "visual-intelligence");
const MODEL_ROUTING_FILE = path.join(ROOT, "agent-lee", "models", "model-routing.json");

export type LvisWorkerId =
  | "leeway-visual-orchestrator-agent"
  | "leeway-vector-reconstruction-worker"
  | "leeway-voxel-reconstruction-worker"
  | "leeway-scene-reconstruction-worker"
  | "leeway-depth-synthesis-worker"
  | "leeway-structural-fidelity-worker"
  | "leeway-asset-repair-worker"
  | "leeway-manifest-export-worker"
  | "leeway-project-integration-worker"
  | "leeway-visual-memory-worker";

export type LvisWorkerDefinition = {
  id: LvisWorkerId;
  name: string;
  routeKey: "qwen" | "azr" | "phi3" | "llama" | "echo";
  specialty: string;
  responsibilities: string[];
};

export type LvisModelRoute = {
  role: "qwen" | "azr" | "phi3" | "llama" | "echo";
  configured: string;
  resolved: string;
  available: boolean;
};

export type LvisSystemStatus = {
  title: string;
  rootPath: string;
  geminiPresent: boolean;
  workers: LvisWorkerDefinition[];
  routes: LvisModelRoute[];
  integratedPanels: string[];
  deterministicCapabilities: string[];
  manifests: string[];
};

export type LvisWorkerInvocation = {
  worker: LvisWorkerId;
  task: string;
  payload?: Record<string, unknown>;
};

type RoutingConfig = Record<string, string>;

export const LVIS_WORKERS: LvisWorkerDefinition[] = [
  {
    id: "leeway-visual-orchestrator-agent",
    name: "Leeway Visual Orchestrator Agent",
    routeKey: "azr",
    specialty: "Routes LVIS tasks, assigns workers, blocks fake success, and enforces receipts.",
    responsibilities: ["Classify request type", "Route workflow", "Coordinate workers", "Enforce receipts", "Return governed reports"]
  },
  {
    id: "leeway-vector-reconstruction-worker",
    name: "Leeway Vector Reconstruction Worker",
    routeKey: "qwen",
    specialty: "Raster to SVG reconstruction and TSX export preparation.",
    responsibilities: ["Raster to SVG", "Contour extraction", "Edge preservation", "TSX conversion", "SVG optimization"]
  },
  {
    id: "leeway-voxel-reconstruction-worker",
    name: "Leeway Voxel Reconstruction Worker",
    routeKey: "azr",
    specialty: "Voxel assembly and geometry blockout from source visual assets.",
    responsibilities: ["Image to voxel", "Part segmentation", "Voxel anatomy", "Blockout reconstruction", "GLB planning"]
  },
  {
    id: "leeway-scene-reconstruction-worker",
    name: "Leeway Scene Reconstruction Worker",
    routeKey: "llama",
    specialty: "Environment assembly and scene-level 3D structure planning.",
    responsibilities: ["World generation", "Scene placement", "Architecture", "Lighting orchestration", "PBR material planning"]
  },
  {
    id: "leeway-depth-synthesis-worker",
    name: "Leeway Depth Synthesis Worker",
    routeKey: "phi3",
    specialty: "Depth heuristics, extrusion planning, and layer estimation.",
    responsibilities: ["Silhouette depth", "Extrusion depth", "Layer generation", "Surface estimation", "Depth repair cues"]
  },
  {
    id: "leeway-structural-fidelity-worker",
    name: "Leeway Structural Fidelity Worker",
    routeKey: "qwen",
    specialty: "Candidate scoring, contour comparison, and repair loop guidance.",
    responsibilities: ["Source comparison", "Contour validation", "Silhouette validation", "Candidate scoring", "Repair loops"]
  },
  {
    id: "leeway-asset-repair-worker",
    name: "Leeway Asset Repair Worker",
    routeKey: "echo",
    specialty: "Repair loops for failed visual candidates and retry planning.",
    responsibilities: ["Adjust tracing settings", "Repair invalid SVG", "Repair voxel distortion", "Retry workflow", "Repair masks and depth"]
  },
  {
    id: "leeway-manifest-export-worker",
    name: "Leeway Manifest Export Worker",
    routeKey: "phi3",
    specialty: "Manifest generation, artifact packaging, and export metadata.",
    responsibilities: ["Asset packages", "Project manifests", "TSX generation", "HTML generation", "Receipt packaging"]
  },
  {
    id: "leeway-project-integration-worker",
    name: "Leeway Project Integration Worker",
    routeKey: "azr",
    specialty: "Insertion into Agent Lee and governed project surfaces.",
    responsibilities: ["Folder creation", "Asset registration", "Pending edits", "Workspace linking", "Developer integration"]
  },
  {
    id: "leeway-visual-memory-worker",
    name: "Leeway Visual Memory Worker",
    routeKey: "echo",
    specialty: "Stores presets, failure patterns, run history, and successful strategies.",
    responsibilities: ["Remember best settings", "Remember repair strategies", "Track quality scores", "Track asset history", "Suggest presets"]
  }
];

function readRoutingConfig(): RoutingConfig {
  try {
    return JSON.parse(fs.readFileSync(MODEL_ROUTING_FILE, "utf8"));
  } catch {
    return {};
  }
}

function firstInstalled(installed: string[], preferred: string, regex: RegExp) {
  if (preferred && installed.includes(preferred)) return preferred;
  return installed.find((entry) => regex.test(entry)) || preferred;
}

export async function getInstalledModels() {
  try {
    return await LLMProvider.getModels();
  } catch {
    return [];
  }
}

export async function buildLvisRoutes(): Promise<LvisModelRoute[]> {
  const config = readRoutingConfig();
  const installed = await getInstalledModels();

  const declared = {
    qwen: config.lvisClassifier || config.codingHiveVerifier || "qwen2.5-coder:7b",
    azr: config.lvisOrchestrator || config.generalReasoner || "llama3.1:8b",
    phi3: config.lvisPlanner || "phi3:mini",
    llama: config.lvisSceneSynthesizer || config.generalReasoner || "llama3.1:8b",
    echo: config.lvisMemory || "echo"
  };

  return [
    {
      role: "qwen",
      configured: declared.qwen,
      resolved: firstInstalled(installed, declared.qwen, /qwen|coder|vision/i),
      available: installed.includes(firstInstalled(installed, declared.qwen, /qwen|coder|vision/i))
    },
    {
      role: "azr",
      configured: declared.azr,
      resolved: firstInstalled(installed, declared.azr, /azr|llama|deepseek|qwen/i),
      available: installed.includes(firstInstalled(installed, declared.azr, /azr|llama|deepseek|qwen/i))
    },
    {
      role: "phi3",
      configured: declared.phi3,
      resolved: firstInstalled(installed, declared.phi3, /phi|mini|qwen|llama/i),
      available: installed.includes(firstInstalled(installed, declared.phi3, /phi|mini|qwen|llama/i))
    },
    {
      role: "llama",
      configured: declared.llama,
      resolved: firstInstalled(installed, declared.llama, /llama|qwen|deepseek/i),
      available: installed.includes(firstInstalled(installed, declared.llama, /llama|qwen|deepseek/i))
    },
    {
      role: "echo",
      configured: declared.echo,
      resolved: firstInstalled(installed, declared.echo, /echo|llama|qwen|deepseek/i),
      available: installed.includes(firstInstalled(installed, declared.echo, /echo|llama|qwen|deepseek/i))
    }
  ];
}

export function extractHtmlFromText(text: string): string {
  if (!text) return "";
  const htmlMatch = text.match(/(<!DOCTYPE html>|<html)[\s\S]*?<\/html>/i);
  if (htmlMatch) return htmlMatch[0];
  const codeBlockMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  return text.trim();
}

export function hideBodyText(html: string): string {
  const cssToInject = `
    <style>
      #info, #loading, #ui, #instructions, .label, .overlay, #description {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }
      body { user-select: none !important; }
    </style>
  `;

  if (html.toLowerCase().includes("</head>")) return html.replace(/<\/head>/i, `${cssToInject}</head>`);
  if (html.toLowerCase().includes("</body>")) return html.replace(/<\/body>/i, `${cssToInject}</body>`);
  return html + cssToInject;
}

export function zoomCamera(html: string, zoomFactor = 0.8): string {
  const regex = /camera\.position\.set\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)/g;
  return html.replace(regex, (_match, x, y, z) => {
    return `camera.position.set(${parseFloat(x) * zoomFactor}, ${parseFloat(y) * zoomFactor}, ${parseFloat(z) * zoomFactor})`;
  });
}

export function sanitizeSvgForExport(svg: string, width: number, height: number) {
  let processedSvg = String(svg || "").trim();
  processedSvg = processedSvg.replace(/stroke-\s+opacity/g, "stroke-opacity");
  processedSvg = processedSvg.replace(/fill-\s+opacity/g, "fill-opacity");
  processedSvg = processedSvg.replace(/stroke-\s+width/g, "stroke-width");
  processedSvg = processedSvg.replace(/<path[^>]*d=""[^>]*\/>/g, "");

  const paths: string[] = [];
  processedSvg = processedSvg.replace(/<path[^>]*d="([^"]*)"[^>]*\/>/g, (match, d) => {
    if (paths.includes(d)) return "";
    paths.push(d);
    return match;
  });

  processedSvg = processedSvg.replace(/<svg\b([^>]*)>/i, (match) => {
    let root = match;
    root = root.replace(/\swidth="[^"]*"/i, "");
    root = root.replace(/\sheight="[^"]*"/i, "");

    if (!/viewBox=/i.test(root)) root = root.replace(/<svg\b/i, `<svg viewBox="0 0 ${width} ${height}"`);
    if (!/\swidth=/i.test(root)) root = root.replace(/<svg\b/i, `<svg width="100%"`);
    if (!/\sheight=/i.test(root)) root = root.replace(/<svg\b/i, `<svg height="100%"`);
    if (!/preserveAspectRatio=/i.test(root)) root = root.replace(/<svg\b/i, `<svg preserveAspectRatio="xMidYMid meet"`);
    if (!/style=/i.test(root)) root = root.replace(/<svg\b/i, `<svg style="display:block; margin:auto;"`);

    return root;
  });

  return processedSvg;
}

export function validateSvgXml(svg: string) {
  const parser = new (new JSDOM("").window.DOMParser)();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    return { valid: false, error: parserError.textContent || "Unknown SVG parse error" };
  }
  return { valid: true, error: null };
}

export async function getLvisSystemStatus(): Promise<LvisSystemStatus> {
  const routes = await buildLvisRoutes();
  return {
    title: "LEEWAY SOVEREIGN VISUAL INTELLIGENCE SYSTEM",
    rootPath: VISUAL_ROOT,
    geminiPresent: false,
    workers: LVIS_WORKERS,
    routes,
    integratedPanels: ["LeewayVisualPanel", "SvgPanel", "VoxelPanel", "ScenePanel"],
    deterministicCapabilities: [
      "sanitizeSvgForExport",
      "validateSvgXml",
      "extractHtmlFromText",
      "hideBodyText",
      "zoomCamera"
    ],
    manifests: [
      path.join(VISUAL_ROOT, "system", "LVIS.config.json"),
      path.join(VISUAL_ROOT, "system", "LVIS.workflow.json"),
      path.join(VISUAL_ROOT, "system", "LVIS.manifest.json")
    ]
  };
}

export async function invokeLvisWorker(invocation: LvisWorkerInvocation) {
  if (invocation.worker === "leeway-vector-reconstruction-worker" && invocation.task === "validate-svg") {
    const svg = String(invocation.payload?.svg || "");
    return {
      worker: invocation.worker,
      task: invocation.task,
      result: validateSvgXml(svg)
    };
  }

  if (invocation.worker === "leeway-manifest-export-worker" && invocation.task === "prepare-scene-html") {
    const html = String(invocation.payload?.html || "");
    return {
      worker: invocation.worker,
      task: invocation.task,
      result: {
        html: zoomCamera(hideBodyText(extractHtmlFromText(html))),
        cleaned: true
      }
    };
  }

  const status = await getLvisSystemStatus();
  const worker = status.workers.find((entry) => entry.id === invocation.worker);
  return {
    worker: invocation.worker,
    task: invocation.task,
    result: {
      message: `${worker?.name || invocation.worker} is registered under LVIS.`,
      rootPath: status.rootPath,
      routes: status.routes
    }
  };
}
