/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.BUILD_INFO
PURPOSE: Writes deterministic runtime build info so Agent Lee can prove whether the running extension matches the source workspace.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const outEntryPath = path.join(root, "out", "extension.js");
const buildDir = path.join(root, "build");
const buildInfoPath = path.join(buildDir, "runtime-build-info.json");

function fileHash(filePath) {
  const digest = crypto.createHash("sha256");
  digest.update(fs.readFileSync(filePath));
  return digest.digest("hex").toUpperCase();
}

function safeGitCommit() {
  try {
    const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return result.status === 0 ? String(result.stdout || "").trim() : "";
  } catch {
    return "";
  }
}

if (!fs.existsSync(outEntryPath)) {
  throw new Error(`Compiled entrypoint is missing: ${outEntryPath}`);
}

fs.mkdirSync(buildDir, { recursive: true });

const buildInfo = {
  schemaVersion: "1",
  packageName: String(packageJson.name || ""),
  packageVersion: String(packageJson.version || ""),
  builtAt: new Date().toISOString(),
  gitCommit: safeGitCommit(),
  extensionEntryRelativePath: "out/extension.js",
  extensionEntryHash: fileHash(outEntryPath),
  readmePath: "README.md",
  activityBarIconPath: "media/agent-lee-activitybar-icon.svg",
  assetPaths: [
    "README.md",
    "media/agent-lee-activitybar-icon.svg",
    "media/agent-lee-icon.png",
    "media/leeway-standards-button.png",
    "media/readme-header.png",
    "media/readme-system-flow.png"
  ],
  commandIds: [
    "agentLee.open",
    "agentLee.openPanel",
    "agentLee.openSidebar",
    "agentLee.runtimeStatus"
  ]
};

fs.writeFileSync(buildInfoPath, `${JSON.stringify(buildInfo, null, 2)}\n`, "utf8");
console.log(`Runtime build info written to ${buildInfoPath}`);
