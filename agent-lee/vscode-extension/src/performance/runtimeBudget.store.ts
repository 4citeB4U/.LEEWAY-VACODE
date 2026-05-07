/*
LEEWAY HEADER — DO NOT REMOVE

REGION: 💾 DATA
TAG: DATA.PERFORMANCE.BUDGET.STORE

5WH:
WHAT = Agent Lee runtime budget store
WHY = Stores active performance profile and current runtime load
WHO = Agent Lee Runtime Performance Governor
WHERE = src/performance/runtimeBudget.store.ts
WHEN = 2026
HOW = Singleton budget/load store with VS Code event emitter

AGENTS:
DOCTOR
PRIME
AUDIT

LICENSE:
MIT
*/

import * as vscode from "vscode";
import type {
  GovernedTask,
  PerformanceProfile,
  RuntimeBudget,
  RuntimeLoadSnapshot
} from "./performance.types";
import { getPerformanceBudget } from "./performanceProfile";

class RuntimeBudgetStore {
  private budget: RuntimeBudget = getPerformanceBudget("quiet_laptop");
  private tasks = new Map<string, GovernedTask>();
  private readonly _onDidChange = new vscode.EventEmitter<RuntimeBudget>();
  readonly onDidChange = this._onDidChange.event;

  setProfile(profile: PerformanceProfile): RuntimeBudget {
    this.budget = getPerformanceBudget(profile);
    this._onDidChange.fire(this.budget);
    return this.budget;
  }

  getBudget(): RuntimeBudget {
    return this.budget;
  }

  registerTask(task: GovernedTask): void {
    this.tasks.set(task.id, task);
  }

  startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.startedAt = new Date().toISOString();
  }

  finishTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.finishedAt = new Date().toISOString();

    setTimeout(() => {
      this.tasks.delete(taskId);
    }, 2000);
  }

  getSnapshot(): RuntimeLoadSnapshot {
    const all = Array.from(this.tasks.values());
    const active = all.filter((task) => task.startedAt && !task.finishedAt);
    const queued = all.filter((task) => !task.startedAt && !task.finishedAt);
    const memory = typeof process !== "undefined" && process.memoryUsage
      ? process.memoryUsage()
      : undefined;

    return {
      timestamp: new Date().toISOString(),
      activeAgents: active.length,
      activeModelCalls: active.filter((task) => task.domain === "model").length,
      activeMcpCalls: active.filter((task) => task.domain === "mcp").length,
      activeTerminalTasks: active.filter((task) => task.domain === "verify").length,
      queuedTasks: queued.length,
      heapUsedMb: memory ? Math.round(memory.heapUsed / 1024 / 1024) : undefined,
      heapTotalMb: memory ? Math.round(memory.heapTotal / 1024 / 1024) : undefined
    };
  }
}

export const runtimeBudgetStore = new RuntimeBudgetStore();

/*
DISCOVERY_PIPELINE:
Voice → Intent → Location → Vertical → Ranking → Render
*/