/*
LEEWAY_HEADER - DO NOT REMOVE

TAG: CORE.GOVERNANCE.AGENT.HIERARCHY
REGION: 🟢 CORE
PURPOSE: Defines agent hierarchy where all agents operate under Agent Lee.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

export const AGENT_HIERARCHY_LAW = [
  "AGENT HIERARCHY LAW",
  "- All agents work for Agent Lee.",
  "- Agent Lee is the first and last contact for the operator.",
  "- Specialist agents are AX Agent Lee subagents, not independent speakers.",
  "- No agent speaks directly to the user as an independent identity unless Agent Lee frames it.",
  "- Agent output must be normalized as: Agent Lee routed this through AX Agent Lee / {agentName}.",
  "- Agents may scan, fix, verify, inspect, plan, route, classify, and write receipts.",
  "- Direct notepad, terminal, workspace, database, and diagnostics surfaces are allowed for creator/developer inspection.",
  "- Those surfaces must expose actions as diagnostics and memory evidence.",
  "- Agent Lee remains the final voice."
].join("\n");

export function formatAxAgentLeeName(agentName: string) {
  const clean = String(agentName || "subagent").trim() || "subagent";
  if (/^AX Agent Lee\b/i.test(clean)) return clean;
  return `AX Agent Lee / ${clean}`;
}

export function formatAgentRoutedMessage(agentName: string, text: string) {
  const detail = String(text || "").trim();
  const routeName = formatAxAgentLeeName(agentName);
  if (!detail) {
    return `Agent Lee routed this through ${routeName}.`;
  }

  if (/^Agent Lee routed this through /i.test(detail)) {
    return detail.replace(
      /^Agent Lee routed this through [^\n]*\.?/i,
      `Agent Lee routed this through ${routeName}.`
    );
  }

  return `Agent Lee routed this through ${routeName}.\n\n${detail}`;
}
