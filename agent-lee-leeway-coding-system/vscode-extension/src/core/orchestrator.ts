/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.ORCHESTRATOR
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import { buildContext } from "./file-intelligence";
import { store } from "./memory";
import { loadSovereignContext } from "./governance-loader";
import { getAgentLeePersonaSummary } from "./persona";
import { buildModelHiveStatus, classifyTaskType, summarizeHive } from "./model-hive";
import { BrowserFlowPlan, inspectVisualTarget, runVisualUserFlow } from "./browser-engine";
import { inferPreviewInstructions, inferProjectFramework, writeFrontendEvidenceReport } from "./reporting";

export type ApprovalMode = "safe" | "balanced" | "full";
export type SupervisorResult = {
  text: string;
  reportPath?: string;
  verificationSummary?: string;
  previewInstructions?: string;
  browserReportPath?: string;
  screenshotPath?: string;
  flowReportPath?: string;
};

function buildSharedPrompt(args: {
  prompt: string;
  approval: ApprovalMode;
  targetLabel?: string;
  explicitUrl?: string;
  workspaceRoot: string;
  webContext: string;
  browserContext: string;
  capabilitySummary?: string;
  ctx: { total: number; samples: { file: string; preview: string }[] };
  hiveSummary: string;
}) {
  const sovereign = loadSovereignContext();

  return `
AGENT LEE SOVEREIGN CONTEXT
${getAgentLeePersonaSummary()}

CONSTITUTIONAL RULE:
${sovereign.constitutionalRule}

COLLABORATION LAW EXCERPT:
${sovereign.collaborationContractExcerpt}

ALLOWED TRANSITIONS EXCERPT:
${sovereign.transitionExcerpt}

SUPERIOR PROMPT EXCERPT:
${sovereign.superiorPrompt}

MANDATORY BEHAVIOR:
- Agent Lee is the first and last speaker.
- Internal models are workers, not speakers.
- Internal agents are workers, not speakers.
- The final answer must sound like Agent Lee, not like a raw model dump.
- Agent Lee is strongest at front-end websites, UI components, landing pages, dashboards, and visual application repair.
- Read the real project before proposing edits.
- Identify exact files, components, sections, colors, layout regions, and styles affected.
- Preserve working structure unless the user explicitly asks for a redesign.
- For small changes, do not rewrite whole pages.
- Never claim a visual review without using real files or provided image context.
- Every front-end action must leave a provable evidence trail with verification.
- Never tell the user you cannot inspect a target when context is already provided.
- Never expose internal model deliberation as direct user-facing speech.
- Schema first, personality second, but keep the delivery human and calm.

APPROVAL MODE:
${args.approval}

CAPABILITY CATALOG:
${args.capabilitySummary || "No capability catalog loaded."}

MODEL HIVE:
${args.hiveSummary}

FILES FOUND:
${args.ctx.total}

TARGET:
${args.targetLabel || args.workspaceRoot || "workspace"}

WEB CONTEXT:
${args.webContext}

BROWSER CONTEXT:
${args.browserContext}

CODEBASE CONTEXT:
${args.ctx.samples.map((s) => `FILE: ${s.file}\n${s.preview}`).join("\n---\n")}

USER:
${args.prompt}
`;
}

export async function runSupervisor(args: {
  prompt: string;
  model: string;
  builderModel: string;
  designerModel: string;
  verifierModel: string;
  browserVisualMode: boolean;
  browserShowCursor: boolean;
  browserSlowMoMs: number;
  installedModels: string[];
  workspaceRoot: string;
  approval: ApprovalMode;
  web: boolean;
  targetLabel?: string;
  explicitUrl?: string;
  remoteContext?: string;
  capabilitySummary?: string;
  ollama: (prompt: string, model: string) => Promise<string>;
  webLookup: (query: string) => Promise<string>;
}): Promise<SupervisorResult> {
  const lower = args.prompt.toLowerCase();
  const ctx = args.remoteContext
    ? { total: 1, samples: [{ file: args.targetLabel || args.workspaceRoot || "remote-target", preview: args.remoteContext }] }
    : buildContext(args.workspaceRoot);
  const webContext =
    args.web || lower.includes("web") || lower.includes("search") || lower.includes("latest")
      ? await args.webLookup(args.prompt)
      : "";
  const shouldInspectBrowser =
    taskCandidate(args.prompt) &&
    (Boolean(args.explicitUrl) || Boolean(args.workspaceRoot));
  const shouldRunFlow = flowCandidate(args.prompt) && shouldInspectBrowser;

  let browserEvidence:
    | {
        source: string;
        targetUrl: string;
        screenshotPath: string;
        reportPath: string;
        summary: string;
        consoleErrors: string[];
        pageErrors: string[];
        visualDiff: {
          comparedTo: string;
          diffImagePath: string;
          changedPixels: number;
          diffRatio: number;
          baselineCreated: boolean;
        };
        accessibility: {
          violations: {
            id: string;
            impact: string;
            description: string;
            help: string;
            nodeCount: number;
          }[];
          incomplete: number;
          passes: number;
        };
        performance: {
          loadTime: number;
          domContentLoaded: number;
          firstPaint: number;
          firstContentfulPaint: number;
          largestContentfulPaint: number;
          cumulativeLayoutShift: number;
          totalRequests: number;
          totalTransferred: number;
        };
        network: {
          requests: {
            url: string;
            method: string;
            status: number;
            size: number;
            type: string;
            duration: number;
          }[];
          failedRequests: number;
        };
        bugs: {
          brokenLinks: string[];
          missingImages: string[];
          consoleWarnings: string[];
          jsErrors: string[];
        };
      }
    | undefined;
  let browserContext = "No browser session executed.";
  let browserFlowResult:
    | {
        flowReportPath: string;
        screenshotPath: string;
        summary: string;
        targetUrl: string;
        executedSteps: { label: string; type: string; selector?: string; success: boolean; details: string }[];
        assertions: { passed: number; failed: number };
      }
    | undefined;

  if (shouldInspectBrowser) {
    try {
      const inspection = await inspectVisualTarget({
        workspaceRoot: args.workspaceRoot,
        explicitUrl: args.explicitUrl
      });
      browserContext = inspection.summary;
      browserEvidence = {
        source: inspection.source,
        targetUrl: inspection.targetUrl,
        screenshotPath: inspection.screenshotPath,
        reportPath: inspection.reportPath,
        summary: inspection.summary,
        consoleErrors: inspection.consoleErrors,
        pageErrors: inspection.pageErrors,
        visualDiff: inspection.visualDiff,
        accessibility: inspection.accessibility,
        performance: inspection.performance,
        network: inspection.network,
        bugs: inspection.bugs
      };
    } catch (error: any) {
      browserContext = `Browser inspection failed: ${error.message}`;
    }
  }

  if (args.approval === "safe" && (lower.includes("fix") || lower.includes("repair") || lower.includes("change"))) {
    return {
      text: `Agent Lee has the context, but SAFE mode keeps us in governed planning instead of pretending edits were made.

Files visible: ${ctx.total}
Top sample files:
${ctx.samples.slice(0, 10).map((s) => `- ${s.file}`).join("\n")}

Next step:
Ask me to audit or explain, or switch approval to BALANCED/FULL AUTO for change planning.`
    };
  }

  const taskType = classifyTaskType(args.prompt);
  const hive = buildModelHiveStatus(args.installedModels, {
    builderModel: args.builderModel,
    designerModel: args.designerModel,
    verifierModel: args.verifierModel
  }, args.prompt);
  const hiveSummary = summarizeHive(hive);
  const framework = inferProjectFramework(args.workspaceRoot);
  const previewInstructions = inferPreviewInstructions(args.workspaceRoot);
  const sharedPrompt = buildSharedPrompt({
    prompt: args.prompt,
    approval: args.approval,
    targetLabel: args.targetLabel,
    workspaceRoot: args.workspaceRoot,
    webContext,
    browserContext,
    capabilitySummary: args.capabilitySummary,
    ctx,
    hiveSummary
  });

  let finalResponse = "";
  let verificationSummary = "Verification pending.";
  const filesConsidered = ctx.samples.map((sample) => sample.file).slice(0, 12);

  if (shouldRunFlow) {
    const flowPlan = await planBrowserFlow({
      prompt: args.prompt,
      sharedPrompt,
      model: args.verifierModel || args.builderModel || args.model,
      ollama: args.ollama
    });

    if (flowPlan) {
      try {
        const flow = await runVisualUserFlow({
          workspaceRoot: args.workspaceRoot,
          explicitUrl: args.explicitUrl,
          plan: flowPlan,
          headed: args.browserVisualMode,
          showCursor: args.browserShowCursor,
          slowMoMs: args.browserSlowMoMs
        });
        browserFlowResult = {
          flowReportPath: flow.flowReportPath,
          screenshotPath: flow.screenshotPath,
          summary: flow.summary,
          targetUrl: flow.targetUrl,
          executedSteps: flow.executedSteps,
          assertions: flow.assertions
        };
        browserContext = `${browserContext}\n\nVISIBLE FLOW:\n${flow.summary}`;
      } catch (error: any) {
        browserContext = `${browserContext}\n\nVISIBLE FLOW FAILED:\n${error.message}`;
      }
    }
  }

  if (taskType === "coding" || taskType === "visual-coding") {
    const internalOutputs: string[] = [];
    const codingRoles = hive.roles.filter((role) => role.isHiveMember && role.modality === "coding");

    for (const role of codingRoles) {
      if (!role.available) {
        internalOutputs.push(`[${role.role}] unavailable: preferred=${role.preferred} selected=${role.selected}`);
        continue;
      }

      const roleInstructions = role.role === "builder_model"
        ? `- This is the Builder Model.\n- Propose exact front-end implementation details.\n- Identify files, components, sections, styles, classes, and text to change.\n- For small edits, change only the affected region.\n- If no file exists, propose the exact new front-end file set.`
        : role.role === "designer_ux_model"
          ? `- This is the Designer/UX Model.\n- Review spacing, hierarchy, responsiveness, accessibility, color, animation, and visual polish.\n- Keep the existing design unless the user requested a redesign.\n- Call out risks of breaking layout.`
          : `- This is the Verifier Model.\n- Check syntax, imports, a11y, responsiveness, LeeWay compliance, and regression risk.\n- Verify that the proposed edit is precise and not overly destructive.\n- Produce a short verification verdict.`;

      const rolePrompt = `${sharedPrompt}

INTERNAL ROLE:
${role.role}

INTERNAL INSTRUCTIONS:
${roleInstructions}
- This is not the final user-facing answer.
- Do not speak as Agent Lee.
- Return concise, high-signal internal output only.
`;

      const output = await args.ollama(rolePrompt, role.selected);
      internalOutputs.push(`[${role.role} via ${role.selected}]\n${output}`);
    }

    const visualRole = hive.roles.find((role) => role.role === "visual_helper" && role.isHiveMember);
    if (visualRole?.available) {
      const visualPrompt = `${sharedPrompt}

INTERNAL ROLE:
visual_helper

INTERNAL INSTRUCTIONS:
- Extract coding-relevant visual/media implications only.
- Keep this internal.
`;
      const output = await args.ollama(visualPrompt, visualRole.selected);
      internalOutputs.push(`[visual_helper via ${visualRole.selected}]\n${output}`);
    }

    const synthesisPrompt = `${sharedPrompt}

INTERNAL WORKER OUTPUTS:
${internalOutputs.join("\n\n---\n\n")}

FINAL SYNTHESIS INSTRUCTIONS:
- You are rendering the only user-facing answer.
- Speak only as Agent Lee.
- Do not mention hidden worker models unless the user explicitly asks.
- Keep the answer human, calm, direct, and useful.
- If workers disagree, resolve the disagreement and present one decision.
- For front-end tasks, name the real affected files/components when the context supports it.
- Include a before/after style summary when the request is a small edit.
- Include preview/run instructions when proposing or creating a page.
- Include a concise verification result.
- Do not say work is complete if files were not actually changed.
`;

    const synthesisModel =
      hive.roles.find((role) => role.role === "builder_model")?.selected || args.model;
    finalResponse = await args.ollama(synthesisPrompt, synthesisModel);
    verificationSummary =
      hive.roles.find((role) => role.role === "verifier_model")?.available
        ? "Verifier model completed an internal correctness and risk pass."
        : "Verifier model was degraded or unavailable; fallback verification was used.";
  } else {
    const directPrompt = `${sharedPrompt}

FINAL SYNTHESIS INSTRUCTIONS:
- Agent Lee is the only speaker.
- Give the user one direct answer with no exposed internal worker framing.
- Stay strongest on front-end and visual web work when relevant.
`;
    finalResponse = await args.ollama(directPrompt, args.model);
    verificationSummary = "General synthesis path completed.";
  }

  if (browserEvidence) {
    const a11yText = browserEvidence.accessibility.violations.length
      ? `${browserEvidence.accessibility.violations.length} accessibility violations detected.`
      : "No accessibility violations were detected by the automated browser pass.";
    const diffText = browserEvidence.visualDiff.baselineCreated
      ? "A new visual baseline was created for this target."
      : `Visual diff ratio: ${browserEvidence.visualDiff.diffRatio.toFixed(4)} with ${browserEvidence.visualDiff.changedPixels} changed pixels.`;
    verificationSummary = `${verificationSummary} ${a11yText} ${diffText}`.trim();
  }

  if (browserFlowResult) {
    verificationSummary = `${verificationSummary} Visible browser flow ran ${browserFlowResult.executedSteps.length} step(s) with ${browserFlowResult.assertions.failed} failed assertion(s).`.trim();
  }

  const reportPath = writeFrontendEvidenceReport({
    prompt: args.prompt,
    taskType,
    workspaceRoot: args.workspaceRoot,
    targetLabel: args.targetLabel,
    framework,
    filesScanned: ctx.total,
    filesConsidered,
    modelsUsed: hive.roles.map((role) => ({
      role: role.label,
      model: role.selected,
      available: role.available,
      degraded: role.degraded
    })),
    previewInstructions,
    verificationSummary,
    responseText: finalResponse,
    browserEvidence: browserEvidence
      ? {
          ...browserEvidence,
          summary: browserFlowResult ? `${browserEvidence.summary}\n\n${browserFlowResult.summary}` : browserEvidence.summary
        }
      : undefined
  });

  store(`USER: ${args.prompt}\nROOT: ${args.workspaceRoot}\nTASK: ${taskType}\nHIVE:\n${hiveSummary}\nAGENT: ${finalResponse}`);
  return {
    text: finalResponse,
    reportPath,
    verificationSummary,
    previewInstructions,
    browserReportPath: browserEvidence?.reportPath,
    screenshotPath: browserFlowResult?.screenshotPath || browserEvidence?.screenshotPath,
    flowReportPath: browserFlowResult?.flowReportPath
  };
}

function taskCandidate(prompt: string) {
  return /(website|homepage|landing page|dashboard|frontend|ui|layout|hero|design|responsive|review this website|improve this homepage|visual|browser|screenshot)/i.test(prompt);
}

function flowCandidate(prompt: string) {
  return /(click|hover|navigate|open the page|perform frontend testing|show .*mouse|user flow|selector assertion|test the page|run through|fill .*form|press .*button|dom-level selector assertions)/i.test(prompt);
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return "";
}

async function planBrowserFlow(args: {
  prompt: string;
  sharedPrompt: string;
  model: string;
  ollama: (prompt: string, model: string) => Promise<string>;
}): Promise<BrowserFlowPlan | null> {
  const plannerPrompt = `${args.sharedPrompt}

INTERNAL ROLE:
browser_flow_planner

INTERNAL INSTRUCTIONS:
- Produce a JSON object only.
- Build a short realistic browser test plan for a visible human-like user flow.
- Prefer robust CSS selectors that are likely to exist based on the supplied file and browser context.
- Use only these action types: navigate, click, hover, fill, press, wait, assertVisible, assertText, assertCount.
- Keep the plan concise and safe. Use 3 to 8 actions.
- If the user is asking to review rather than interact, create assertions and light navigation only.
- JSON schema:
{
  "goal": "string",
  "targetUrl": "optional string",
  "actions": [
    { "type": "click", "selector": "string", "label": "string" }
  ]
}
`;

  try {
    const raw = await args.ollama(plannerPrompt, args.model);
    const jsonText = extractJsonObject(raw);
    if (!jsonText) return null;
    const parsed = JSON.parse(jsonText) as BrowserFlowPlan;
    if (!parsed || !Array.isArray(parsed.actions) || !parsed.actions.length) return null;
    return {
      goal: parsed.goal || "Visible browser flow",
      targetUrl: parsed.targetUrl,
      actions: parsed.actions.slice(0, 8)
    };
  } catch {
    return null;
  }
}

