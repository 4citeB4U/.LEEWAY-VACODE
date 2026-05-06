export async function executeStep(step: any, context: any) {
  return {
    success: true,
    output: `Executed step: ${step.action}`
  };
}
