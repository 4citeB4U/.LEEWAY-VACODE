/*
LEEWAY HEADER — DO NOT REMOVE

REGION: 🟣 MCP
TAG: MCP.PLUGIN.HUGGINGFACE.ADAPTER

5WH:
WHAT = Hugging Face plugin adapter
WHY = Lets Agent Lee search models, datasets, and Spaces
WHO = Agent Lee Plugin Runtime
WHERE = src/plugins/adapters/huggingface.adapter.ts
WHEN = 2026
HOW = Hugging Face public/API requests

AGENTS:
PLUGIN_ROUTER
SHIELD
AUDIT

LICENSE:
MIT
*/

import type { PluginAdapter, PluginCallInput, PluginCallResult } from "../plugin.types";
import { createPluginError, createPluginResult, safeJsonFetch } from "./base.adapter";

const HF_API = "https://huggingface.co/api";

export const huggingFaceAdapter: PluginAdapter = {
  pluginId: "hugging-face",

  canHandle(input: PluginCallInput) {
    return input.pluginId === "hugging-face";
  },

  async execute(input: PluginCallInput): Promise<PluginCallResult> {
    try {
      const token = process.env.HUGGINGFACE_TOKEN;
      const headers: Record<string, string> = {
        Accept: "application/json"
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (input.action === "searchModels") {
        const query = encodeURIComponent(String(input.params?.query || ""));
        const data = await safeJsonFetch(`${HF_API}/models?search=${query}&limit=10`, { headers });
        return createPluginResult(input, "Fetched Hugging Face model search results.", data);
      }

      if (input.action === "searchDatasets") {
        const query = encodeURIComponent(String(input.params?.query || ""));
        const data = await safeJsonFetch(`${HF_API}/datasets?search=${query}&limit=10`, { headers });
        return createPluginResult(input, "Fetched Hugging Face dataset search results.", data);
      }

      if (input.action === "searchSpaces") {
        const query = encodeURIComponent(String(input.params?.query || ""));
        const data = await safeJsonFetch(`${HF_API}/spaces?search=${query}&limit=10`, { headers });
        return createPluginResult(input, "Fetched Hugging Face Spaces search results.", data);
      }

      throw new Error(`Unsupported Hugging Face action: ${input.action}`);
    } catch (error) {
      return createPluginError(input, error);
    }
  }
};

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/
