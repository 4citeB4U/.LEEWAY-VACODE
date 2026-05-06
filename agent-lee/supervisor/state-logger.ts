import * as fs from "fs";

export function logEvent(event: string, data: any) {
  const path = process.env.USERPROFILE + "\\.leeway-vscode\\logs\\daily\\state-machine.jsonl";
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    data
  };
  fs.appendFileSync(path, JSON.stringify(entry) + "\n");
}
