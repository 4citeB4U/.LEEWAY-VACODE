/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.DRIFT_WATCH
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

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

