/*
LEEWAY HEADER - DO NOT REMOVE

REGION: DATA
TAG: DATA.EXECUTION_BRAIN.RECEIPT.LOGGER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(process.env.USERPROFILE || process.env.HOME || ".", ".leeway-vscode");
const RECEIPT_DIR = path.join(ROOT, "reports", "execution-brain");

fs.mkdirSync(RECEIPT_DIR, { recursive: true });

export function writeExecutionReceipt(input: Record<string, unknown>) {
  const file = path.join(RECEIPT_DIR, `execution-receipt-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, JSON.stringify(input, null, 2), "utf8");
  return file;
}
