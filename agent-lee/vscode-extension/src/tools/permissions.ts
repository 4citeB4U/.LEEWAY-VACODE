export type PermissionMode = "ASK" | "ASSISTED" | "AUTONOMOUS";

export function getPermissionMode(): PermissionMode {
  return "ASK";
}

export function requiresApproval(action: string) {
  const risky = ["write", "delete", "terminal", "autofix", "mutation"];
  return risky.includes(action);
}
