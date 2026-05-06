let errorCount = 0;

export function trackError() {
  errorCount++;

  if (errorCount > 5) {
    return {
      drift: true,
      action: "STOP_SYSTEM"
    };
  }

  return { drift: false };
}
