/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.EXTENSION
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { runSupervisor, SupervisorResult } from "./core/orchestrator";
import { enforceLaw, enforceStageLaw } from "./core/law-engine";
import { requestExecution, releaseExecution } from "./core/scheduler";
import { trackError, resetDrift } from "./core/drift-watch";
import { extractPathFromPrompt, extractUrlFromPrompt } from "./core/file-intelligence";
import { detectEditors, installPyCharmTooling, openTargetInEditor } from "./core/editor-bridge";
import { fetchRemoteContext } from "./core/remote-context";
import { buildCapabilityCatalog, formatCapabilitySummary } from "./core/capability-registry";
import {
  appendConversationMessage,
  getOrCreateActiveConversation,
  listConversations,
  loadConversation,
  setActiveConversation,
  startNewConversation
} from "./core/conversation-store";
import { buildModelHiveStatus } from "./core/model-hive";
import { getVoiceStatus, speakWithVoice, stopVoicePlayback } from "./core/voice-adapter";
import { loadRuntimeSettings, RuntimeState, saveRuntimeSettings, ApprovalMode, resolveRuntimeState } from "./core/runtime-settings";
import { stopBrowserPreviews } from "./core/browser-engine";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const LOG_DIR = path.join(ROOT, "logs", "agent-lee");

fs.mkdirSync(LOG_DIR, { recursive: true });

let runtimeState: RuntimeState = loadRuntimeSettings();
const approvedExternalRoots = new Set<string>();
let capabilityCatalog = buildCapabilityCatalog();

function workspaceRoot() {
  const folders = vscode.workspace.workspaceFolders;
  return folders && folders.length > 0 ? folders[0].uri.fsPath : "";
}

function log(type: string, data: unknown) {
  const file = path.join(LOG_DIR, `agent-lee-${new Date().toISOString().slice(0, 10)}.jsonl`);
  fs.appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), type, data }) + "\n");
}

function stripCodeForSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, "Code block omitted.")
    .replace(/`[^`]+`/g, "code")
    .slice(0, 900);
}

function speak(text: string) {
  if (!runtimeState.voice) return;
  const stage = enforceStageLaw("voice", { speaker: "Agent Lee", directUserFacing: true });
  if (!stage.allowed) return;

  const speech = stripCodeForSpeech(text);
  if (!speech.trim()) return;

  const started = speakWithVoice(speech, (message) => log("voice-error", { message }));
  if (!started) {
    log("voice-error", { message: "Voice runtime failed to start." });
  }
}

async function checkOllama() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    return res.ok;
  } catch {
    return false;
  }
}

async function getModels() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    const data: any = await res.json();
    return (data.models || []).map((m: any) => m.name);
  } catch {
    return [];
  }
}

async function ollama(prompt: string, model: string) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: false, prompt })
  });

  const data: any = await res.json();
  return data.response || "Agent Lee returned no response.";
}

async function webLookup(query: string) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data: any = await res.json();
    return [
      data.Heading,
      data.AbstractText,
      ...(data.RelatedTopics || []).slice(0, 5).map((x: any) => x.Text).filter(Boolean)
    ].filter(Boolean).join("\n") || "No strong instant web result found.";
  } catch {
    return "Web lookup failed.";
  }
}

function persistRuntime() {
  saveRuntimeSettings(runtimeState);
}

function refreshRuntimeFromInstalled(installedModels: string[]) {
  runtimeState = resolveRuntimeState(runtimeState, installedModels);
  persistRuntime();
}

async function resolveTargetRoot(prompt: string) {
  const externalPath = extractPathFromPrompt(prompt);
  if (!externalPath) return workspaceRoot();
  if (!fs.existsSync(externalPath)) return workspaceRoot();
  if (approvedExternalRoots.has(externalPath)) return externalPath;

  const approval = await vscode.window.showWarningMessage(
    `Agent Lee wants to inspect external folder:\n${externalPath}`,
    "Approve",
    "Cancel"
  );

  if (approval === "Approve") {
    approvedExternalRoots.add(externalPath);
    return externalPath;
  }

  return workspaceRoot();
}

async function resolvePromptContext(prompt: string) {
  const remoteUrl = extractUrlFromPrompt(prompt);
  if (remoteUrl) {
    const remote = await fetchRemoteContext(remoteUrl);
    return {
      workspaceRoot: workspaceRoot(),
      targetLabel: remote.label,
      remoteContext: remote.summary,
      explicitUrl: remoteUrl
    };
  }

  const root = await resolveTargetRoot(prompt);
  return {
    workspaceRoot: root,
    targetLabel: root,
    remoteContext: "",
    explicitUrl: ""
  };
}

function decorateResponse(result: SupervisorResult) {
  const extra: string[] = [];
  if (result.previewInstructions) extra.push(`Preview/Run instructions:\n${result.previewInstructions}`);
  if (result.verificationSummary) extra.push(`Verification:\n${result.verificationSummary}`);
  if (result.screenshotPath) extra.push(`Browser screenshot:\n${result.screenshotPath}`);
  if (result.browserReportPath) extra.push(`Browser inspection report:\n${result.browserReportPath}`);
  if (result.flowReportPath) extra.push(`Browser flow report:\n${result.flowReportPath}`);
  if (result.reportPath) extra.push(`Repair report path:\n${result.reportPath}`);
  return [result.text, ...extra].filter(Boolean).join("\n\n");
}

async function guardedAsk(prompt: string, installedModels: string[]): Promise<SupervisorResult> {
  const lowered = prompt.toLowerCase();
  const action =
    lowered.includes("force push") || lowered.includes("push to main") || lowered.includes("overwrite core")
      ? "force-push"
      : "ask";

  const law = enforceLaw(action);
  if (!law.allowed) return { text: law.reason };

  const slot = requestExecution("agent-lee");
  if (!slot.allowed) return { text: slot.reason };

  try {
    const capabilitySummary = formatCapabilitySummary(capabilityCatalog);
    const hive = buildModelHiveStatus(installedModels, {
      builderModel: runtimeState.builderModel,
      designerModel: runtimeState.designerModel,
      verifierModel: runtimeState.verifierModel
    }, prompt);

    if (/^\s*(stop|silence|pause|cancel)\b/i.test(prompt)) {
      stopVoicePlayback();
      return { text: "Agent Lee voice paused." };
    }

    if (
      lowered.includes("capabilities") ||
      lowered.includes("workflow") ||
      lowered.includes("how many agents") ||
      lowered.includes("how many mcps") ||
      lowered.includes("connected agents") ||
      lowered.includes("connected to") ||
      lowered.includes("what models")
    ) {
      return {
        text: [
          "Agent Lee capability inventory is loaded from live sources.",
          capabilitySummary,
          "",
          "Current front-end hive status:",
          hive.roles
            .filter((role) => role.role === "builder_model" || role.role === "designer_ux_model" || role.role === "verifier_model")
            .map((role) => `- ${role.label}: ${role.selected} | available=${role.available} | preferred=${role.preferred}`)
            .join("\n")
        ].join("\n")
      };
    }

    const target = await resolvePromptContext(prompt);
    const result = await runSupervisor({
      prompt,
      model: runtimeState.builderModel,
      builderModel: runtimeState.builderModel,
      designerModel: runtimeState.designerModel,
      verifierModel: runtimeState.verifierModel,
      installedModels,
      workspaceRoot: target.workspaceRoot,
      targetLabel: target.targetLabel,
      explicitUrl: target.explicitUrl,
      remoteContext: target.remoteContext,
      capabilitySummary,
      approval: runtimeState.approval,
      web: runtimeState.web,
      browserVisualMode: runtimeState.browserVisualMode,
      browserShowCursor: runtimeState.browserShowCursor,
      browserSlowMoMs: runtimeState.browserSlowMoMs,
      ollama,
      webLookup
    });
    resetDrift();
    return result;
  } catch (err: any) {
    const drift = trackError(err.message);
    return { text: `Agent Lee runtime error: ${err.message}\nDrift: ${drift.action}` };
  } finally {
    releaseExecution();
  }
}

function formatConversationTitle(item: { title: string; updatedAt: string; recoveredFromLegacy?: boolean }) {
  const suffix = item.recoveredFromLegacy ? " (recovered)" : "";
  return `${item.title}${suffix}`;
}

function getHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body{margin:0;font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:linear-gradient(180deg,var(--vscode-sideBar-background),var(--vscode-editor-background));height:100vh;display:flex;flex-direction:column}
.header{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:12px 14px;border-bottom:1px solid var(--vscode-panel-border)}
.title{font-weight:800;font-size:15px}
.sub{font-size:11px;opacity:.82;line-height:1.4}
.stack{display:flex;flex-direction:column;gap:6px}
.header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
select,button,textarea{font-family:inherit}
select{background:var(--vscode-dropdown-background);color:var(--vscode-dropdown-foreground);border:1px solid var(--vscode-panel-border);border-radius:8px;padding:6px 8px}
button{border:0;border-radius:8px;padding:7px 10px;background:var(--vscode-button-background);color:var(--vscode-button-foreground);cursor:pointer}
button.secondary{background:transparent;border:1px solid var(--vscode-panel-border);color:var(--vscode-foreground)}
.shell{padding:12px 14px;border-bottom:1px solid var(--vscode-panel-border);display:flex;flex-direction:column;gap:10px}
.badges{display:flex;gap:8px;flex-wrap:wrap}
.badge{padding:4px 8px;border-radius:999px;border:1px solid var(--vscode-panel-border);font-size:11px}
.badge.ok{background:rgba(46,160,67,.18)}
.badge.warn{background:rgba(210,153,34,.18)}
.grid{display:grid;grid-template-columns:1fr;gap:10px}
.model-card{border:1px solid var(--vscode-panel-border);border-radius:12px;padding:10px;background:rgba(255,255,255,.02)}
.model-label{font-size:11px;opacity:.82;margin-bottom:6px}
.model-status{margin-top:6px;font-size:11px;opacity:.88}
.model-status.ok{color:var(--vscode-testing-iconPassed)}
.model-status.warn{color:var(--vscode-testing-iconQueued)}
.details{border-bottom:1px solid var(--vscode-panel-border);padding:0 14px 12px}
.settings{display:none;border:1px solid var(--vscode-panel-border);border-radius:12px;padding:12px;background:rgba(255,255,255,.02);margin-top:10px}
.settings.open{display:block}
.settings-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.settings-block{margin-top:10px}
.settings-title{font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.7;margin-bottom:8px}
.chat{flex:1;overflow-y:auto;padding:12px 14px}
.msg{border:1px solid var(--vscode-panel-border);border-radius:12px;padding:10px 11px;margin-bottom:10px;white-space:pre-wrap;line-height:1.5}
.user{background:var(--vscode-input-background)}
.agent{background:rgba(255,255,255,.03)}
.composer{border-top:1px solid var(--vscode-panel-border);padding:12px 14px}
textarea{width:100%;height:110px;box-sizing:border-box;padding:10px;border-radius:12px;border:1px solid var(--vscode-panel-border);background:var(--vscode-input-background);color:var(--vscode-input-foreground)}
.composer-actions{display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:8px}
.send{flex:1}
.meta{font-size:11px;opacity:.82}
.status-line{font-size:11px;opacity:.88}
</style>
</head>
<body>
<div class="header">
  <div class="stack">
    <div class="title">Agent Lee</div>
    <div class="sub">Front-end website and application master. Surgical edits, full page creation, three-model orchestration, and proof-first verification.</div>
    <div class="status-line" id="status">Checking runtime...</div>
  </div>
  <div class="header-actions">
    <select id="history" onchange="selectConversation()"><option value="">Chat history</option></select>
    <button class="secondary" onclick="newChat()">New Chat</button>
    <button class="secondary" onclick="toggleSettings()">Settings</button>
  </div>
</div>

<div class="shell">
  <div class="badges">
    <span class="badge ok" id="workspaceBadge">Workspace: checking...</span>
    <span class="badge" id="voiceStatus">Voice: checking...</span>
    <span class="badge" id="hiveStatus">Hive: checking...</span>
  </div>

  <div class="grid">
    <div class="model-card">
      <div class="model-label">Builder Model</div>
      <select id="builderModel" onchange="setRoleModel('builderModel', this.value)"></select>
      <div class="model-status" id="builderStatus">Waiting for Ollama...</div>
    </div>
    <div class="model-card">
      <div class="model-label">Designer/UX Model</div>
      <select id="designerModel" onchange="setRoleModel('designerModel', this.value)"></select>
      <div class="model-status" id="designerStatus">Waiting for Ollama...</div>
    </div>
    <div class="model-card">
      <div class="model-label">Verifier Model</div>
      <select id="verifierModel" onchange="setRoleModel('verifierModel', this.value)"></select>
      <div class="model-status" id="verifierStatus">Waiting for Ollama...</div>
    </div>
  </div>
</div>

<div class="details">
  <div class="settings" id="settingsPanel">
    <div class="settings-title">Runtime</div>
    <div class="settings-row">
      <select id="approval" onchange="setApproval(this.value)">
        <option value="safe">SAFE</option>
        <option value="balanced">BALANCED</option>
        <option value="full">FULL AUTO</option>
      </select>
      <button class="secondary" id="webBtn" onclick="toggleWeb()">Web Off</button>
      <button class="secondary" id="voiceBtn" onclick="toggleVoice()">Voice On</button>
      <button class="secondary" id="browserVisualBtn" onclick="toggleBrowserVisual()">Visual Browser On</button>
      <button class="secondary" id="browserCursorBtn" onclick="toggleBrowserCursor()">Show Cursor On</button>
      <button class="secondary" onclick="stopVoice()">Stop Voice</button>
      <button class="secondary" onclick="mic()">Mic</button>
    </div>
    <div class="settings-row">
      <label class="meta" for="browserSlowMo">Browser slow motion</label>
      <select id="browserSlowMo" onchange="setBrowserSlowMo(this.value)">
        <option value="100">100ms</option>
        <option value="250">250ms</option>
        <option value="400">400ms</option>
        <option value="700">700ms</option>
      </select>
    </div>

    <div class="settings-block">
      <div class="settings-title">Evidence</div>
      <div class="meta" id="evidenceStatus">Repair report path will appear here after front-end analysis or creation.</div>
    </div>
  </div>
</div>

<div class="chat" id="chat"></div>

<div class="composer">
  <textarea id="input" placeholder="Describe a front-end change or page you want. Agent Lee will inspect the real project first, use the Builder, Designer/UX, and Verifier models internally, and produce one governed response."></textarea>
  <div class="composer-actions">
    <div class="meta">Agent Lee reads the existing project before touching the page.</div>
    <button class="send" onclick="send()">Send</button>
  </div>
</div>

<script>
const vscode = acquireVsCodeApi();
const roleIds = {
  builder_model: ["builderModel", "builderStatus"],
  designer_ux_model: ["designerModel", "designerStatus"],
  verifier_model: ["verifierModel", "verifierStatus"]
};

function render(role,text){
  const div=document.createElement("div");
  div.className="msg "+(role==="user"?"user":"agent");
  div.textContent=(role==="user"?"You: ":"Agent Lee: ")+text;
  document.getElementById("chat").appendChild(div);
  div.scrollIntoView();
}

function setApproval(v){ vscode.postMessage({command:"setState", key:"approval", value:v}); }
function setRoleModel(key,value){ vscode.postMessage({command:"setState", key, value}); vscode.postMessage({command:"refreshRuntime"}); }

function toggleWeb(){
  const b=document.getElementById("webBtn");
  const on=b.textContent==="Web Off";
  b.textContent=on?"Web On":"Web Off";
  vscode.postMessage({command:"setState", key:"web", value:on});
}

function toggleVoice(){
  const b=document.getElementById("voiceBtn");
  const on=b.textContent==="Voice Off";
  b.textContent=on?"Voice On":"Voice Off";
  vscode.postMessage({command:"setState", key:"voice", value:on});
}

function toggleBrowserVisual(){
  const b=document.getElementById("browserVisualBtn");
  const on=b.textContent==="Visual Browser Off";
  b.textContent=on?"Visual Browser On":"Visual Browser Off";
  vscode.postMessage({command:"setState", key:"browserVisualMode", value:on});
}

function toggleBrowserCursor(){
  const b=document.getElementById("browserCursorBtn");
  const on=b.textContent==="Show Cursor Off";
  b.textContent=on?"Show Cursor On":"Show Cursor Off";
  vscode.postMessage({command:"setState", key:"browserShowCursor", value:on});
}

function setBrowserSlowMo(value){
  vscode.postMessage({command:"setState", key:"browserSlowMoMs", value:Number(value)});
}

function stopVoice(){ vscode.postMessage({command:"stopVoice"}); }
function toggleSettings(){ document.getElementById("settingsPanel").classList.toggle("open"); }

function send(){
  const input=document.getElementById("input");
  const text=input.value.trim();
  if(!text)return;
  render("user",text);
  input.value="";
  render("agent","Working...");
  vscode.postMessage({command:"ask", text});
}

function mic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ render("agent","Mic capture is not available in this VS Code webview."); return; }
  const rec=new SR();
  rec.lang="en-US";
  rec.onresult=e=>{document.getElementById("input").value=e.results[0][0].transcript};
  rec.start();
}

function selectConversation(){
  const id=document.getElementById("history").value;
  if(id)vscode.postMessage({command:"loadConversation",id});
}

function newChat(){ vscode.postMessage({command:"newConversation"}); }

function setModelOptions(selectId, models, selected){
  const s=document.getElementById(selectId);
  s.innerHTML="";
  models.forEach(m=>{
    const o=document.createElement("option");
    o.value=m;
    o.textContent=m;
    if(m===selected) o.selected=true;
    s.appendChild(o);
  });
  if(selected) s.value=selected;
}

window.addEventListener("message",e=>{
  const msg=e.data;

  if(msg.command==="modelOptions"){
    setModelOptions("builderModel", msg.models, msg.selection.builderModel);
    setModelOptions("designerModel", msg.models, msg.selection.designerModel);
    setModelOptions("verifierModel", msg.models, msg.selection.verifierModel);
    document.getElementById("approval").value = msg.state.approval;
    document.getElementById("webBtn").textContent = msg.state.web ? "Web On" : "Web Off";
    document.getElementById("voiceBtn").textContent = msg.state.voice ? "Voice On" : "Voice Off";
    document.getElementById("browserVisualBtn").textContent = msg.state.browserVisualMode ? "Visual Browser On" : "Visual Browser Off";
    document.getElementById("browserCursorBtn").textContent = msg.state.browserShowCursor ? "Show Cursor On" : "Show Cursor Off";
    document.getElementById("browserSlowMo").value = String(msg.state.browserSlowMoMs || 250);
  }

  if(msg.command==="history"){
    const s=document.getElementById("history");
    s.innerHTML='<option value="">Chat history</option>';
    msg.items.forEach(i=>{
      const o=document.createElement("option");
      o.value=i.id;
      o.textContent=i.title;
      if(i.active) o.selected=true;
      s.appendChild(o);
    });
  }

  if(msg.command==="loadedConversation"){
    document.getElementById("chat").innerHTML="";
    msg.messages.forEach(m=>render(m.role==="user"?"user":"agent",m.text));
  }

  if(msg.command==="response"){
    const chat=document.getElementById("chat");
    const last=chat.lastElementChild;
    if(last && last.textContent==="Agent Lee: Working...") last.remove();
    render("agent",msg.text);
    if(msg.reportPath){
      document.getElementById("evidenceStatus").textContent = "Repair report path: " + msg.reportPath;
    }
  }

  if(msg.command==="status"){
    document.getElementById("status").textContent=msg.text;
  }

  if(msg.command==="runtimeInfo"){
    document.getElementById("workspaceBadge").textContent = "Workspace: " + (msg.workspaceRoot || "not open");
    document.getElementById("voiceStatus").textContent = "Voice: " + msg.voice.engine + " | " + msg.voice.model + " | ready=" + msg.voice.ready;
    document.getElementById("hiveStatus").textContent = "Hive: " + msg.hive.taskType + " | degraded=" + msg.hive.degraded;

    msg.hive.roles.forEach(role=>{
      if(!roleIds[role.role]) return;
      const ids = roleIds[role.role];
      const label = document.getElementById(ids[1]);
      const statusText = role.available
        ? (role.degraded ? "Degraded fallback: " + role.selected : "Ready: " + role.selected)
        : "Unavailable: " + role.preferred;
      label.textContent = statusText;
      label.className = "model-status " + (role.available && !role.degraded ? "ok" : "warn");
    });

    if(msg.lastReportPath){
      document.getElementById("evidenceStatus").textContent = "Repair report path: " + msg.lastReportPath;
    }
  }
});

vscode.postMessage({command:"ready"});
</script>
</body>
</html>`;
}

class Provider implements vscode.WebviewViewProvider {
  resolveWebviewView(view: vscode.WebviewView) {
    view.webview.options = { enableScripts: true };
    view.webview.html = getHtml();
    view.webview.onDidReceiveMessage((msg) => handle(view.webview, msg));
  }
}

let lastReportPath = "";

async function postRuntimeInfo(webview: vscode.Webview, prompt = "front-end task") {
  const installedModels = await getModels();
  refreshRuntimeFromInstalled(installedModels);
  const hive = buildModelHiveStatus(installedModels, {
    builderModel: runtimeState.builderModel,
    designerModel: runtimeState.designerModel,
    verifierModel: runtimeState.verifierModel
  }, prompt);

  webview.postMessage({
    command: "runtimeInfo",
    voice: getVoiceStatus(),
    hive,
    workspaceRoot: workspaceRoot(),
    lastReportPath
  });
  if (installedModels.length) {
    webview.postMessage({
      command: "modelOptions",
      models: installedModels,
      selection: {
        builderModel: runtimeState.builderModel,
        designerModel: runtimeState.designerModel,
        verifierModel: runtimeState.verifierModel
      },
      state: runtimeState
    });
  }
}

function conversationItems() {
  return listConversations().map((item) => ({
    id: item.id,
    title: formatConversationTitle(item),
    active: item.active
  }));
}

async function handle(webview: vscode.Webview, msg: any) {
  if (msg.command === "ready") {
    capabilityCatalog = buildCapabilityCatalog();
    const online = await checkOllama();
    const installedModels = await getModels();
    refreshRuntimeFromInstalled(installedModels);
    const activeConversation = getOrCreateActiveConversation(workspaceRoot());

    webview.postMessage({
      command: "status",
      text: online
        ? `ONLINE | front-end hive ready | workspace: ${workspaceRoot() || "not open"} | capabilities: ${capabilityCatalog.counts.total}`
        : "OFFLINE | Ollama not reachable"
    });
    webview.postMessage({ command: "history", items: conversationItems() });
    webview.postMessage({ command: "loadedConversation", messages: loadConversation(activeConversation.id) });
    await postRuntimeInfo(webview);

    if (!loadConversation(activeConversation.id).length) {
      const intro = "Agent Lee online. I am governing this conversation as a single thread, specializing in front-end work, routing Builder, Designer/UX, and Verifier models behind the scenes, and speaking only as Agent Lee.";
      const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
      if (stage.allowed) {
        const timestamp = new Date().toISOString();
        appendConversationMessage(workspaceRoot(), { role: "agent", text: intro, timestamp }, { conversationId: activeConversation.id });
        webview.postMessage({ command: "response", text: intro });
        webview.postMessage({ command: "history", items: conversationItems() });
        speak(intro);
      }
    }
  }

  if (msg.command === "setState") {
    (runtimeState as any)[msg.key] = msg.value;
    persistRuntime();
  }

  if (msg.command === "refreshRuntime") {
    await postRuntimeInfo(webview);
  }

  if (msg.command === "refreshCatalog") {
    capabilityCatalog = buildCapabilityCatalog();
    const message = `Capability catalog refreshed. Total: ${capabilityCatalog.counts.total} | MCPs: ${capabilityCatalog.counts.mcps} | Agents: ${capabilityCatalog.counts.agents} | Servers: ${capabilityCatalog.counts.servers}`;
    webview.postMessage({ command: "response", text: message });
    webview.postMessage({
      command: "status",
      text: `ONLINE | front-end hive ready | workspace: ${workspaceRoot() || "not open"} | capabilities: ${capabilityCatalog.counts.total}`
    });
    await postRuntimeInfo(webview);
  }

  if (msg.command === "installPyCharmTools") {
    try {
      const result = installPyCharmTooling();
      webview.postMessage({ command: "response", text: result });
      speak(result);
    } catch (err: any) {
      webview.postMessage({ command: "response", text: `PyCharm wiring failed: ${err.message}` });
    }
  }

  if (msg.command === "loadConversation") {
    setActiveConversation(msg.id);
    webview.postMessage({ command: "loadedConversation", messages: loadConversation(msg.id) });
    webview.postMessage({ command: "history", items: conversationItems() });
  }

  if (msg.command === "newConversation") {
    const meta = startNewConversation(workspaceRoot());
    webview.postMessage({ command: "loadedConversation", messages: loadConversation(meta.id) });
    webview.postMessage({ command: "history", items: conversationItems() });
  }

  if (msg.command === "stopVoice") {
    stopVoicePlayback();
    webview.postMessage({ command: "response", text: "Agent Lee voice stopped." });
    await postRuntimeInfo(webview);
  }

  if (msg.command === "ask") {
    const text = String(msg.text || "");
    const timestamp = new Date().toISOString();
    const active = getOrCreateActiveConversation(workspaceRoot());

    appendConversationMessage(workspaceRoot(), { role: "user", text, timestamp }, { conversationId: active.id, titleHint: "Agent Lee conversation" });
    log("ask", { text, runtimeState, workspaceRoot: workspaceRoot(), conversationId: active.id });

    const installedModels = await getModels();
    refreshRuntimeFromInstalled(installedModels);
    const response = await guardedAsk(text, installedModels);
    const stage = enforceStageLaw("synthesis", { speaker: "Agent Lee", directUserFacing: true });
    const finalText = stage.allowed ? decorateResponse(response) : "Agent Lee governance blocked a non-sovereign response.";

    if (response.reportPath) lastReportPath = response.reportPath;

    appendConversationMessage(workspaceRoot(), { role: "agent", text: finalText, timestamp: new Date().toISOString() }, { conversationId: active.id });

    webview.postMessage({ command: "response", text: finalText, reportPath: response.reportPath || "" });
    webview.postMessage({ command: "history", items: conversationItems() });
    await postRuntimeInfo(webview, text);
    speak(finalText);
  }
}

function openPanel(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "agentLeeChat",
    "Agent Lee Chat",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );
  panel.webview.html = getHtml();
  panel.webview.onDidReceiveMessage((msg) => handle(panel.webview, msg));
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new Provider();

  context.subscriptions.push(vscode.window.registerWebviewViewProvider("agentLee.sidebar", provider));

  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.text = "$(hubot) Agent Lee";
  item.tooltip = "Open Agent Lee Chat";
  item.command = "agentLee.open";
  item.show();
  context.subscriptions.push(item);

  context.subscriptions.push(vscode.commands.registerCommand("agentLee.open", () => openPanel(context)));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.openSidebar", () => vscode.commands.executeCommand("workbench.view.extension.agentLee")));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.installPyCharmTools", () => {
    const result = installPyCharmTooling();
    vscode.window.showInformationMessage(result);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.newChat", () => {
    startNewConversation(workspaceRoot());
    vscode.window.showInformationMessage("Agent Lee started a new conversation.");
  }));
  context.subscriptions.push(vscode.commands.registerCommand("agentLee.stopVoice", () => {
    stopVoicePlayback();
    vscode.window.showInformationMessage("Agent Lee voice stopped.");
  }));
}

export function deactivate() {
  stopVoicePlayback();
  stopBrowserPreviews();
}

