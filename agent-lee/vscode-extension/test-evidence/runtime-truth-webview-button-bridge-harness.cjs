/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI_RUNTIME_TRUTH
TAG: CORE.AGENT_LEE.RUNTIME_TRUTH.WEBVIEW_BUTTON_BRIDGE.HARNESS
PURPOSE: Dynamic webview boot and host-bridge smoke harness for Agent Lee runtime truth verification.
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

function extractTemplateSource(sourceText) {
  const marker = "function getHtml(webview: vscode.Webview, context: vscode.ExtensionContext) {";
  const start = sourceText.indexOf(marker);
  if (start < 0) {
    throw new Error("Could not locate getHtml() in src/extension.ts.");
  }

  const returnIndex = sourceText.indexOf("return `", start);
  if (returnIndex < 0) {
    throw new Error("Could not locate HTML template return in getHtml().");
  }

  const templateStart = returnIndex + "return `".length;
  const templateEnd = sourceText.indexOf("`;\r\n}", templateStart) >= 0
    ? sourceText.indexOf("`;\r\n}", templateStart)
    : sourceText.indexOf("`;\n}", templateStart);

  if (templateEnd < 0) {
    throw new Error("Could not locate the end of the getHtml() template literal.");
  }

  return sourceText.slice(templateStart, templateEnd);
}

function extractHandledCommands(sourceText) {
  const handled = new Set();
  const patterns = [
    /msg\.command\s*===\s*"([^"]+)"/g,
    /case\s+"([^"]+)"/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(sourceText)) !== null) {
      handled.add(match[1]);
    }
  }

  return Array.from(handled).sort();
}

function renderHtml(templateSource) {
  const runtimeState = {
    primaryModel: "qwen2.5-coder:14b"
  };
  const webview = {
    cspSource: "vscode-webview://runtime-truth"
  };

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
    "chat-ui-runtime-truth-2026-05-15"
  );
}

function result(name, ok, details = {}) {
  return { name, ok, details };
}

async function main() {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
  const extensionSourcePath = path.resolve("src/extension.ts");
  const sourceText = fs.readFileSync(extensionSourcePath, "utf8");
  const templateSource = extractTemplateSource(sourceText);
  const html = renderHtml(templateSource);
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) {
    throw new Error("Generated HTML does not contain an inline script block.");
  }

  const inlineScript = scriptMatch[1];
  const postedMessages = [];
  const pageErrors = [];
  const consoleMessages = [];

  const virtualConsole = new VirtualConsole();
  virtualConsole.on("log", (...args) => consoleMessages.push(`log: ${args.join(" ")}`));
  virtualConsole.on("warn", (...args) => consoleMessages.push(`warn: ${args.join(" ")}`));
  virtualConsole.on("error", (...args) => consoleMessages.push(`error: ${args.join(" ")}`));
  virtualConsole.on("jsdomError", (error) => {
    pageErrors.push(String(error && error.stack || error));
  });

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    url: "https://leeway-runtime-truth.local/",
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

  await new Promise((resolve) => {
    setTimeout(resolve, 80);
  });

  const { document } = dom.window;
  const checks = [];
  const handledCommands = extractHandledCommands(sourceText);
  const hasUiReady = postedMessages.some((message) => message && message.command === "agentLeeUiReady");

  checks.push(result("webview HTML can be generated", html.includes("<!DOCTYPE html>") && html.includes('<textarea id="input"'), {
    htmlLength: html.length
  }));
  checks.push(result("inline script parses", inlineScript.includes("vscode.postMessage") && pageErrors.length === 0, {
    pageErrors
  }));
  checks.push(result("boot posts agentLeeUiReady", hasUiReady, {
    postedCommands: postedMessages.map((message) => message && message.command).filter(Boolean)
  }));

  const settingsBackdrop = document.getElementById("settingsBackdrop");
  document.getElementById("settingsBtn")?.click();
  checks.push(result("Settings button opens expected path", !!settingsBackdrop && settingsBackdrop.classList.contains("open"), {
    className: settingsBackdrop ? settingsBackdrop.className : "missing"
  }));

  const historyDrawer = document.getElementById("historyDrawer");
  document.getElementById("historyBtn")?.click();
  checks.push(result("History button opens expected path", !!historyDrawer && historyDrawer.classList.contains("open"), {
    className: historyDrawer ? historyDrawer.className : "missing"
  }));

  const preNewConversationCount = postedMessages.length;
  document.getElementById("newChatBtn")?.click();
  const newConversationMessage = postedMessages.slice(preNewConversationCount).find((message) => message && message.command === "newConversation");
  checks.push(result("New Chat emits expected command", !!newConversationMessage, {
    message: newConversationMessage || null
  }));

  const preAttachmentsCount = postedMessages.length;
  document.querySelector('button[aria-label="Attach files"]')?.click();
  const pickAttachmentsMessage = postedMessages.slice(preAttachmentsCount).find((message) => message && message.command === "pickAttachments");
  checks.push(result("Attachments emits expected command", !!pickAttachmentsMessage, {
    message: pickAttachmentsMessage || null
  }));

  const input = document.getElementById("input");
  if (input) {
    input.value = "Agent Lee, prove the Runtime Truth Layer send path is alive.";
  }
  const preSendCount = postedMessages.length;
  document.querySelector('button[aria-label="Send message"]')?.click();
  const sendMessage = postedMessages.slice(preSendCount).find((message) => message && message.command === "sendMessage");
  checks.push(result("Send emits sendMessage", !!sendMessage, {
    message: sendMessage || null
  }));

  checks.push(result("host has handler for sendMessage", handledCommands.includes("sendMessage"), {
    handled: handledCommands.includes("sendMessage")
  }));

  const coreUiCommands = ["sendMessage", "newConversation", "pickAttachments", "agentLeeUiReady"];
  const missingHostHandlers = coreUiCommands.filter((command) => command !== "agentLeeUiReady" && !handledCommands.includes(command));
  checks.push(result("no missing host handlers for core UI commands", missingHostHandlers.length === 0, {
    missingHostHandlers
  }));

  const bootException = pageErrors.find((entry) => /workflowShell|workflowChevron/.test(entry));
  checks.push(result("no script boot exception from missing workflowShell/workflowChevron", !bootException, {
    pageErrors
  }));

  const summary = {
    date: new Date().toISOString(),
    packageVersion: packageJson.version,
    sourcePath: extensionSourcePath,
    checks,
    postedMessages,
    handledCommands,
    pageErrors,
    consoleMessages,
    passed: checks.filter((check) => check.ok).length,
    failed: checks.filter((check) => !check.ok).length,
    limitation: "This harness executes the generated webview HTML and inline script dynamically in JSDOM with a simulated vscode.postMessage bridge. It does not launch a full VS Code GUI renderer."
  };

  const outPath = path.resolve("test-evidence/runtime-truth-webview-button-bridge-result.json");
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`RESULT_FILE=${outPath}`);
  process.exit(summary.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exit(1);
});
