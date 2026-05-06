/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.MEMORY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
const FILE = process.env.USERPROFILE + "/.leeway-vscode/memory/agent-lee/memory.jsonl";

export function store(text:string){
  fs.appendFileSync(FILE, JSON.stringify({ts:Date.now(),text})+"\n");
}

