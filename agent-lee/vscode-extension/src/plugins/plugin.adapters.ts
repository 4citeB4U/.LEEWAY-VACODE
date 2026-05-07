/*
LEEWAY HEADER — DO NOT REMOVE

REGION: 🟣 MCP
TAG: MCP.PLUGIN.ADAPTER.REGISTRY

5WH:
WHAT = Runtime adapter registry for Agent Lee plugins
WHY = Maps plugin IDs to executable adapters
WHO = Agent Lee Plugin Runtime
WHERE = src/plugins/plugin.adapters.ts
WHEN = 2026
HOW = Adapter list with lookup helper

AGENTS:
PLUGIN_ROUTER
AUDIT
SHIELD

LICENSE:
MIT
*/

import type { PluginAdapter } from "./plugin.types";
import { bridgeAdapter } from "./adapters/bridge.adapter";
import { githubAdapter } from "./adapters/github.adapter";
import { gmailAdapter } from "./adapters/gmail.adapter";
import { huggingFaceAdapter } from "./adapters/huggingface.adapter";
import { vercelAdapter } from "./adapters/vercel.adapter";

const DIRECT_ADAPTERS: Record<string, PluginAdapter> = {
  github: githubAdapter,
  "hugging-face": huggingFaceAdapter,
  vercel: vercelAdapter,
  gmail: gmailAdapter
};

export const PLUGIN_ADAPTERS: PluginAdapter[] = [
  githubAdapter,
  huggingFaceAdapter,
  vercelAdapter,
  gmailAdapter,
  bridgeAdapter
];

export function getAdapterForPlugin(pluginId: string): PluginAdapter | undefined {
  return DIRECT_ADAPTERS[pluginId] || bridgeAdapter;
}

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/
