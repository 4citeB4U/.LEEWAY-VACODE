export function enforceLaw(action: string) {

  const blocked = ["force-push", "delete-branch", "overwrite-core"];

  if (blocked.includes(action)) {
    return { allowed: false, reason: "Violation of system law" };
  }

  return { allowed: true };
}
