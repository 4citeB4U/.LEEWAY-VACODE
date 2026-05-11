/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 💾 DATA
TAG: DATA.VISUAL.RUNTIME.RECEIPTS
PURPOSE: JSON receipt helpers for LVIS workflow runs.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

import * as fs from "fs";
import * as path from "path";
import type { LvisReceipt } from "../system/LVIS.schemas";
export { writeLvisReceipt } from "../visualReceipts";

export function writeLvisJsonReceipt(outputRoot: string, receipt: LvisReceipt) {
  const target = path.join(outputRoot, "asset-output", "agent-receipt.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(receipt, null, 2), "utf8");
  return target;
}
