import * as fs from "fs";

export function backupFile(file: string) {
  const backupDir = process.env.USERPROFILE + "\\.leeway-vscode\\backups\\";
  const name = file.replace(/[:\\]/g, "_");
  const dest = backupDir + name;

  fs.copyFileSync(file, dest);
  return dest;
}
