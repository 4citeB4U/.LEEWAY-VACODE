export function verify(result: any) {
  if (!result || !result.success) {
    return { pass: false, reason: "Execution failed" };
  }

  return { pass: true };
}
