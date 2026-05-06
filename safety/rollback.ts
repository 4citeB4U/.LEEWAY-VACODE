import * as fs from "fs";

export function rollback(file: string, backup: string) {
  fs.copyFileSync(backup, file);
  return "Rollback complete";
}
