/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.AGENT_LEE.RUNTIME_TRUTH.LIVE_VOICE_AUDIBLE_OUTPUT.HARNESS
PURPOSE: Dynamic LeeWay live voice audible output harness for governed UI controls, lifecycle proof, latency, and visible error surfacing.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");
const {
  DEFAULT_PLUGIN_CATALOG,
  DEFAULT_MCP_SERVER_CATALOG,
  DEFAULT_AGENT_CATALOG,
  DEFAULT_WORKER_CATALOG
} = require("../out/core/settings-catalog.js");
const { voiceProviderFactoryClientScript } = require("../out/live-voice/voiceProviderFactory.js");
const { planLeewayLiveVoiceSegments } = require("../out/core/leeway-live-voice-route-manager.js");

function extractTemplateSource(sourceText) {
  const marker = "function getHtml(webview: vscode.Webview, context: vscode.ExtensionContext) {";
  const start = sourceText.indexOf(marker);
  if (start < 0) throw new Error("Could not locate getHtml() in src/extension.ts.");
  const returnIndex = sourceText.indexOf("return `", start);
  if (returnIndex < 0) throw new Error("Could not locate HTML template return in getHtml().");
  const templateStart = returnIndex + "return `".length;
  const templateEnd = sourceText.indexOf("`;\r\n}", templateStart) >= 0
    ? sourceText.indexOf("`;\r\n}", templateStart)
    : sourceText.indexOf("`;\n}", templateStart);
  if (templateEnd < 0) throw new Error("Could not locate the end of the getHtml() template literal.");
  return sourceText.slice(templateStart, templateEnd);
}

function renderHtml(templateSource) {
  const runtimeState = {
    primaryModel: "qwen2.5-coder:14b"
  };
  const webview = { cspSource: "vscode-webview://runtime-truth-live-voice" };
  const factory = new Function(
    "webview",
    "standardsBtnUri",
    "bottomBtnUri",
    "brandingIconUri",
    "testExtensionUri",
    "DEFAULT_PLUGIN_CATALOG",
    "DEFAULT_MCP_SERVER_CATALOG",
    "DEFAULT_AGENT_CATALOG",
    "DEFAULT_WORKER_CATALOG",
    "voiceProviderFactoryClientScript",
    "runtimeState",
    "AGENT_LEE_UI_VERSION",
    `return \`${templateSource}\`;`
  );

  return factory(
    webview,
    "vscode-resource://media/leeway-standards-button.png",
    "vscode-resource://media/bottom-button-for-agent-lee.png",
    "vscode-resource://media/top-right-button-new.png",
    "vscode-resource://media/test-extension.ps1",
    DEFAULT_PLUGIN_CATALOG,
    DEFAULT_MCP_SERVER_CATALOG,
    DEFAULT_AGENT_CATALOG,
    DEFAULT_WORKER_CATALOG,
    voiceProviderFactoryClientScript,
    runtimeState,
    "chat-ui-runtime-truth-2026-05-16"
  );
}

function result(name, ok, details = {}) {
  return { name, ok, details };
}

function dispatchInput(window, element, value) {
  element.value = String(value);
  element.dispatchEvent(new window.Event("input", { bubbles: true }));
}

function dispatchChange(window, element, value) {
  if (typeof value === "boolean") {
    element.checked = value;
  } else {
    element.value = String(value);
  }
  element.dispatchEvent(new window.Event("change", { bubbles: true }));
}

async function main() {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
  const sourceText = fs.readFileSync(path.resolve("src/extension.ts"), "utf8");
  const html = renderHtml(extractTemplateSource(sourceText));
  const postedMessages = [];
  const pageErrors = [];
  const consoleMessages = [];

  const virtualConsole = new VirtualConsole();
  virtualConsole.on("log", (...args) => consoleMessages.push(`log: ${args.join(" ")}`));
  virtualConsole.on("warn", (...args) => consoleMessages.push(`warn: ${args.join(" ")}`));
  virtualConsole.on("error", (...args) => consoleMessages.push(`error: ${args.join(" ")}`));
  virtualConsole.on("jsdomError", (error) => pageErrors.push(String(error && error.stack || error)));

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    url: "https://leeway-live-voice-truth.local/",
    virtualConsole,
    beforeParse(window) {
      window.acquireVsCodeApi = () => ({
        postMessage(message) {
          postedMessages.push(message);
        },
        getState() {
          return window.__agentLeeState || {};
        },
        setState(nextState) {
          window.__agentLeeState = nextState;
          return nextState;
        }
      });
      window.__agentLeeState = {};
      window.scrollTo = () => {};
      if (window.HTMLElement && window.HTMLElement.prototype) {
        window.HTMLElement.prototype.scrollIntoView = () => {};
      }
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 120));

  const { window } = dom;
  const { document } = window;
  const checks = [];

  function emitHostMessage(message) {
    window.dispatchEvent(new window.MessageEvent("message", { data: message }));
  }

  const state = {
    approval: "balanced",
    appLanguage: "auto",
    agentEnvironment: "windows-native",
    autoRunStagedPlans: false,
    autoUpdateEnabled: true,
    browserShowCursor: true,
    browserSlowMoMs: 250,
    browserVisualMode: true,
    codeReviewBehavior: "inline",
    customAgents: [],
    customMcpServers: [],
    customWorkers: [],
    enabledAgents: [],
    enabledMcpServers: [],
    enabledPlugins: [],
    enabledWorkers: [],
    followupBehavior: "steer",
    inferenceSpeed: "standard",
    leewayVoiceRuntimeKind: "leeway-agent-voice-local",
    liveMicAlwaysOn: true,
    mcpServerConfigs: {},
    onboardingComplete: true,
    primaryModel: "qwen2.5-coder:14b",
    requireCtrlEnter: false,
    voice: true,
    voiceAutoSpeak: true,
    voiceCurrentStatus: "LeeWay live voice route is standing by.",
    voiceEnabled: true,
    voiceInterruptOnUserSpeech: true,
    voiceLastError: "",
    voiceMuted: false,
    voicePitch: 1.0,
    voiceRate: 1.1,
    voiceStyle: "grounded",
    voiceTone: 1.0,
    voiceVolume: 0.75,
    web: false,
    workMode: "execute",
    workerConfigs: {}
  };

  emitHostMessage({
    command: "modelOptions",
    models: ["qwen2.5-coder:14b"],
    inventory: [{ id: "qwen2.5-coder:14b", available: true, role: "primary model" }],
    selection: {
      primaryModel: "qwen2.5-coder:14b",
      builderModel: "qwen2.5-coder:14b",
      designerModel: "qwen2.5-coder:14b",
      verifierModel: "qwen2.5-coder:14b"
    },
    state,
    sovereignRuntime: {}
  });
  emitHostMessage({
    command: "runtimeInfo",
    voice: {
      enabled: true,
      active: true,
      muted: false,
      autoSpeak: true,
      engine: "f5-clone-local",
      routeId: "leeway.voice.primary.clone.live",
      ready: true,
      speechRate: 1.1,
      volume: 0.75,
      firstAudioLatencyMs: null,
      multiSegmentPlayback: { plannedSegments: 0, playedSegments: 0, completed: false },
      audibleOutputProof: "LeeWay live voice proof is standing by.",
      currentStatus: "LeeWay live voice route is standing by.",
      lastError: ""
    },
    hive: { taskType: "engineering", degraded: false, roles: [] },
    pluginMesh: [],
    memory: {},
    workspaceRoot: "C:\\Users\\Leona\\.leeway-vscode",
    sovereignRuntime: {}
  });

  const requiredControls = [
    "LEEWAY_APP::UI::VOICE_CONTROL::VOICE_ENABLED",
    "LEEWAY_APP::UI::VOICE_CONTROL::MUTE_TOGGLE",
    "LEEWAY_APP::UI::VOICE_CONTROL::STOP_SPEAKING",
    "LEEWAY_APP::UI::VOICE_CONTROL::TEST_VOICE",
    "LEEWAY_APP::UI::VOICE_CONTROL::AUTO_SPEAK_RESPONSES",
    "LEEWAY_APP::UI::VOICE_CONTROL::SPEECH_RATE",
    "LEEWAY_APP::UI::VOICE_CONTROL::SPEECH_VOLUME"
  ];
  checks.push(result(
    "voice controls render with LeeWay IDs",
    requiredControls.every((id) => document.querySelector(`[data-leeway-id="${id}"]`)),
    { requiredControls }
  ));

  checks.push(result(
    "voice settings hydrate",
    document.getElementById("voiceEnabledBtn")?.textContent.includes("Enabled") &&
      document.getElementById("voiceAutoSpeakToggle")?.checked === true &&
      document.getElementById("voiceRate")?.value === "1.1" &&
      document.getElementById("voiceVolume")?.value === "0.75",
    {
      voiceEnabledText: document.getElementById("voiceEnabledBtn")?.textContent || "",
      voiceAutoSpeak: document.getElementById("voiceAutoSpeakToggle")?.checked,
      voiceRate: document.getElementById("voiceRate")?.value,
      voiceVolume: document.getElementById("voiceVolume")?.value
    }
  ));

  const beforeTest = postedMessages.length;
  document.getElementById("voiceTestBtn")?.click();
  checks.push(result(
    "Test Voice emits the correct command",
    postedMessages.slice(beforeTest).some((message) => message && message.command === "leewayVoiceTestRequested"),
    { messages: postedMessages.slice(beforeTest) }
  ));

  const beforeStop = postedMessages.length;
  document.getElementById("voiceStopBtn")?.click();
  checks.push(result(
    "Stop Speaking emits the correct command",
    postedMessages.slice(beforeStop).some((message) => message && message.command === "leewayVoiceStopRequested"),
    { messages: postedMessages.slice(beforeStop) }
  ));

  const beforeMute = postedMessages.length;
  document.getElementById("voiceMuteBtn")?.click();
  checks.push(result(
    "Mute toggle emits the correct command",
    postedMessages.slice(beforeMute).some((message) => message && message.command === "leewayVoiceMuteToggled"),
    { messages: postedMessages.slice(beforeMute) }
  ));

  const beforeAutoSpeak = postedMessages.length;
  dispatchChange(window, document.getElementById("voiceAutoSpeakToggle"), false);
  const beforeRate = postedMessages.length;
  dispatchInput(window, document.getElementById("voiceRate"), 1.25);
  const beforeVolume = postedMessages.length;
  dispatchInput(window, document.getElementById("voiceVolume"), 0.9);
  checks.push(result(
    "speech rate and volume controls emit state updates",
    postedMessages.slice(beforeAutoSpeak).some((message) => message && message.command === "leewayVoiceSettingsChanged" && message.key === "voiceAutoSpeak") &&
      postedMessages.slice(beforeRate).some((message) => message && message.command === "leewayVoiceSettingsChanged" && message.key === "voiceRate") &&
      postedMessages.slice(beforeVolume).some((message) => message && message.command === "leewayVoiceSettingsChanged" && message.key === "voiceVolume"),
    { messages: postedMessages.slice(beforeAutoSpeak) }
  ));

  const multiSegmentPlan = planLeewayLiveVoiceSegments(
    "Agent Lee is proving multi segment playback here. The response is intentionally long enough to require more than one live clone segment.",
    "leeway.voice.primary.clone.live",
    false
  );
  checks.push(result(
    "live voice route produces multi-segment plan proof",
    multiSegmentPlan.segments.length > 1,
    multiSegmentPlan
  ));

  emitHostMessage({
    command: "leewayVoiceStatusChanged",
    eventType: "LEEWAY_VOICE_PLAYBACK_STARTED",
    voiceState: {
      enabled: true,
      active: true,
      muted: false,
      autoSpeak: true,
      routeId: "leeway.voice.primary.clone.live",
      currentStatus: "LeeWay live voice playback started.",
      audibleOutputProof: "LeeWay live voice playback started.",
      lastError: "",
      firstAudioLatencyMs: null,
      multiSegmentPlayback: { plannedSegments: 2, playedSegments: 0, completed: false }
    }
  });
  emitHostMessage({
    command: "leewayVoiceStatusChanged",
    eventType: "LEEWAY_VOICE_FIRST_AUDIO",
    voiceState: {
      enabled: true,
      active: true,
      muted: false,
      autoSpeak: true,
      routeId: "leeway.voice.primary.clone.live",
      currentStatus: "First audio emitted.",
      audibleOutputProof: "LeeWay live voice emitted first audio in 187ms.",
      lastError: "",
      firstAudioLatencyMs: 187,
      multiSegmentPlayback: { plannedSegments: 2, playedSegments: 1, completed: false }
    }
  });
  emitHostMessage({
    command: "leewayVoiceStatusChanged",
    eventType: "LEEWAY_VOICE_PLAYBACK_COMPLETED",
    voiceState: {
      enabled: true,
      active: true,
      muted: false,
      autoSpeak: true,
      routeId: "leeway.voice.primary.clone.live",
      currentStatus: "Multi-segment playback completed.",
      audibleOutputProof: "LeeWay live voice completed 2/2 segments.",
      lastError: "",
      firstAudioLatencyMs: 187,
      multiSegmentPlayback: { plannedSegments: 2, playedSegments: 2, completed: true }
    }
  });

  const statusText = document.getElementById("voiceStatus")?.textContent || "";
  const proofText = document.getElementById("voiceControlStatus")?.textContent || "";
  checks.push(result(
    "live voice route produces an audio-ready lifecycle event",
    /first-audio=187ms/i.test(statusText) || /187ms/i.test(proofText),
    { statusText, proofText }
  ));
  checks.push(result(
    "first-audio latency is recorded",
    /187ms/i.test(statusText) || /187ms/i.test(proofText),
    { statusText, proofText }
  ));
  checks.push(result(
    "multi-segment playback state machine completes",
    /2\/2/i.test(statusText) || /2\/2/i.test(proofText),
    { statusText, proofText }
  ));

  emitHostMessage({
    command: "leewayVoiceStatusChanged",
    eventType: "LEEWAY_VOICE_PLAYBACK_FAILED",
    voiceState: {
      enabled: true,
      active: false,
      muted: false,
      autoSpeak: true,
      routeId: "leeway.voice.primary.clone.live",
      currentStatus: "LeeWay live voice playback failed.",
      audibleOutputProof: "LeeWay live voice playback failed visibly.",
      lastError: "Clone engine failed to produce a playable audio artifact.",
      firstAudioLatencyMs: 187,
      multiSegmentPlayback: { plannedSegments: 2, playedSegments: 1, completed: false }
    }
  });

  const errorText = document.getElementById("voiceControlError")?.textContent || "";
  checks.push(result(
    "failure path surfaces visible error",
    /Clone engine failed to produce a playable audio artifact\./i.test(errorText),
    { errorText }
  ));

  const summary = {
    gate: "LEEWAY_RUNTIME_TRUTH_LIVE_VOICE_AUDIBLE_OUTPUT",
    generatedAt: new Date().toISOString(),
    packageVersion: packageJson.version,
    checks,
    postedMessages,
    pageErrors,
    consoleMessages,
    passed: checks.filter((check) => check.ok).length,
    failed: checks.filter((check) => !check.ok).length,
    limitation: "This harness executes the generated webview HTML and inline script in JSDOM and simulates host lifecycle updates. It proves route invocation, governed controls, lifecycle hydration, and visible error surfacing, but it does not confirm that a human heard OS audio in a live VS Code renderer."
  };

  const outPath = path.resolve("test-evidence/runtime-truth-live-voice-audible-output-result.json");
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`RESULT_FILE=${outPath}`);
  process.exit(summary.failed > 0 || pageErrors.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exit(1);
});
