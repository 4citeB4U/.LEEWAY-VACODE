/*
LEEWAY HEADER — DO NOT REMOVE

REGION: CORE
TAG: CORE.SDK.LLMPROVIDER.MAIN

COLOR_ONION_HEX:
NEON=#39FF14
FLUO=#0DFF94
PASTEL=#C7FFD8

ICON_ASCII:
family=lucide
glyph=file

5WH:
WHAT = LLMProvider module
WHY = Part of CORE region
WHO = LEEWAY Align Agent
WHERE = core\LLMProvider.ts
WHEN = 2026
HOW = Auto-aligned by LEEWAY align-agent

AGENTS:
ASSESS
ALIGN
AUDIT

LICENSE:
MIT
*/

// Simple LLMProvider interface for optional LLM assistance
export const LLMProvider = {
  async generate(prompt: string, model: string = 'qwen2.5-coder:14b'): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false })
      });
      const data = await response.json();
      return data.response || 'No response from model';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  async getModels(): Promise<string[]> {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      return [];
    }
  }
};

// Attach to window for AgentManager fallback
if (typeof window !== 'undefined') {
  (window as any).LLMProvider = LLMProvider;
}
