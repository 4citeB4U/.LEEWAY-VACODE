import * as fs from "fs";
const FILE = process.env.USERPROFILE + "/.leeway-vscode/memory/agent-lee/memory.jsonl";

export function store(text:string){
  fs.appendFileSync(FILE, JSON.stringify({ts:Date.now(),text})+"\n");
}
