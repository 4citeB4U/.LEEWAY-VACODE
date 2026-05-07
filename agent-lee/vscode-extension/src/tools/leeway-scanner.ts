import * as fs from "fs";
import * as path from "path";

const REGIONS = ["?? UI","?? AI","?? DATA","?? CORE","?? MCP","?? SEO","?? UTIL"];

export function getFiles(dir: string, out: string[] = []) {
  const blocked = ["node_modules",".git","dist","out","build",".next",".vite","coverage"];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!blocked.includes(item)) getFiles(full, out);
    } else if (/\.(ts|tsx|js|jsx|html|css|json|md|mjs|cjs)$/i.test(full)) {
      out.push(full);
    }
  }
  return out;
}

export function auditFile(file: string) {
  const c = fs.readFileSync(file, "utf8");
  let score = 0;
  if (c.includes("LEEWAY_HEADER")) score += 25;
  if (/TAG:\s*[A-Z0-9]+\.[A-Z0-9]+\.[A-Z0-9_]+\.[A-Z0-9_]+/.test(c)) score += 25;
  if (REGIONS.some(r => c.includes(`REGION: ${r}`))) score += 25;
  if (c.includes("DISCOVERY_PIPELINE")) score += 25;

  let grade = "NON-COMPLIANT";
  if (score >= 95) grade = "GOLD";
  else if (score >= 85) grade = "SILVER";
  else if (score >= 70) grade = "BRONZE";

  return { file, score, grade };
}

export function makeHeader(file: string) {
  const base = path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
  return `/*
LEEWAY_HEADER
TAG: UTIL.LOCAL.${base}.MAIN
REGION: ?? UTIL
DISCOVERY_PIPELINE:
  Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Agent Lee governed LeeWay source file.
*/
`;
}
