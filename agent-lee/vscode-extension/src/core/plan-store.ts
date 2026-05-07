import * as fs from "fs";
import * as path from "path";
import { TaskPlan } from "./task-planner";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "plan";
}

function resolvePlanDir(workspaceRoot: string) {
  if (workspaceRoot && fs.existsSync(workspaceRoot)) {
    return path.join(workspaceRoot, ".agent-lee", "plans");
  }
  return path.join(ROOT, "agent-lee", "plans");
}

export function saveTaskPlan(plan: TaskPlan) {
  const dir = resolvePlanDir(plan.workspaceRoot);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${plan.createdAt.replace(/[:.]/g, "-")}-${slug(plan.prompt)}.md`);
  const lines = [
    `# Agent Lee Plan`,
    ``,
    `- Created: ${plan.createdAt}`,
    `- Workspace: ${plan.workspaceRoot || "not open"}`,
    `- Prompt: ${plan.prompt}`,
    ``,
    `## Summary`,
    ``,
    plan.summary,
    ``,
    `## Approval Prompt`,
    ``,
    plan.approvalPrompt,
    ``,
    `## Execution Hint`,
    ``,
    plan.executionHint,
    ``,
    `## Steps`,
    ``,
    ...plan.steps.map((step, index) => `${index + 1}. [ ] ${step.title} (${step.phase})\n   - ${step.detail}`)
  ];

  fs.writeFileSync(file, lines.join("\n"), "utf8");
  return file;
}
