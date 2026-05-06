let errors = 0;

export function trackError(message: string) {
  errors++;
  return errors >= 5
    ? { drift: true, action: "STOP_AND_REVIEW", message }
    : { drift: false, action: "CONTINUE", message };
}

export function resetDrift() {
  errors = 0;
}
