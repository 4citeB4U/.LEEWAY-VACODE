let active = 0;
const MAX = 2;

export function requestExecution(agent: string) {
  if (active >= MAX) return { allowed: false, reason: `SYSTEM LOAD PROTECTION ACTIVE: ${agent} queued.` };
  active++;
  return { allowed: true };
}

export function releaseExecution() {
  if (active > 0) active--;
}
