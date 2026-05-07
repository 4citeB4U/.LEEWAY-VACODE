export function classifyTask(input: string) {
  const q = input.toLowerCase();

  if (q.includes("force push")) return "force-push";
  if (q.includes("delete branch")) return "delete-branch";
  if (q.includes("overwrite core")) return "overwrite-core";
  if (q.includes("push main") || q.includes("push master")) return "direct-main-push";
  if (q.includes("delete all") || q.includes("remove all")) return "bulk-delete";

  if (q.includes("search") || q.includes("look up") || q.includes("latest docs")) return "web-search";
  if (q.includes("image") || q.includes("screenshot") || q.includes("picture")) return "image";
  if (q.includes("scan") || q.includes("audit") || q.includes("compliance")) return "scan";
  if (q.includes("fix") || q.includes("repair")) return "fix";
  if (q.includes("verify") || q.includes("test") || q.includes("check")) return "verify";

  return "answer";
}

export function selectModel(task: string) {
  if (task === "fix") return "qwen2.5-coder:14b";
  if (task === "verify") return "deepseek-coder-v2:16b";
  if (task === "web-search") return "llama3.1:8b";
  if (task === "image") return "llava:7b";
  return "qwen2.5-coder:7b";
}
