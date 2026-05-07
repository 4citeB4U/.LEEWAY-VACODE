import * as fs from "fs";

export function logEvent(type: string, agent: string, message: string, details: any = {}) {
  const root = process.env.USERPROFILE + "\\.leeway-vscode";
  const date = new Date().toISOString().slice(0,10);

  const entry = {
    timestamp: new Date().toISOString(),
    type,
    agent,
    message,
    details
  };

  const line = JSON.stringify(entry);

  fs.mkdirSync(`${root}\\logs\\daily`, { recursive: true });
  fs.mkdirSync(`${root}\\memory\\db`, { recursive: true });

  fs.appendFileSync(`${root}\\logs\\daily\\agent-lee-${date}.jsonl`, line + "\n");
  fs.appendFileSync(`${root}\\memory\\db\\agent-lee-memory.jsonl`, line + "\n");
}
