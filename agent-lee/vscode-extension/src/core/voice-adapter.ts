/*
LEEWAY_HEADER - DO NOT REMOVE

TAG: CORE.VOICE.ADAPTER.MAIN
REGION: 🟢 CORE
PURPOSE: Voice adapter bridge for Agent Lee runtime speech and command interaction.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

import * as fs from "fs";
import * as path from "path";
import { execFile, execSync, ChildProcess } from "child_process";
import { describeFileError, writeTextWithRetries } from "./file-ops";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const CONFIG_FILE = path.join(ROOT, "agent-lee", "voice", "voice-runtime.json");
const PIPER_SCRIPT = path.join(ROOT, "agent-lee", "voice", "Speak-AgentLeePiper.ps1");
const CLONED_SCRIPT = path.join(ROOT, "agent-lee", "voice", "Speak-AgentLeeCloned.ps1");

export type VoiceEngine = "piper-local" | "f5-clone-local";

export type VoiceRuntimeConfig = {
  engine: VoiceEngine;
  preferVoiceServer?: boolean;
  voiceWsUrl?: string;
  fallbackEngine: "windows-sapi" | "piper-local";
  personaSpeechMode: string;
  interruptionPolicy: string;
  piperExecutable: string;
  piperModelPath: string;
  piperConfigPath?: string;
  selectedVoiceId?: string;
  selectedVoiceLabel?: string;
  selectedSpeakerId?: string | number;
  sampleRate: number;
  clonePythonPath?: string;
  cloneScriptPath?: string;
  cloneServerScriptPath?: string;
  cloneServerUrl?: string;
  cloneDevice?: "cpu" | "cuda";
  cloneReferenceAudioPath?: string;
  cloneReferenceText?: string;
  cloneOutputPath?: string;
  ffmpegPath?: string;
};

export type VoiceStatus = {
  engine: string;
  model: string;
  ready: boolean;
  fallback: string;
  speaking: boolean;
};

let currentSpeech: ChildProcess | null = null;

function readConfig(): VoiceRuntimeConfig {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")) as VoiceRuntimeConfig;
}

function cloneVoiceReady(config: VoiceRuntimeConfig | null) {
  return Boolean(
    config &&
    fs.existsSync(CLONED_SCRIPT) &&
    config.clonePythonPath &&
    fs.existsSync(config.clonePythonPath) &&
    config.cloneScriptPath &&
    fs.existsSync(config.cloneScriptPath) &&
    config.cloneReferenceAudioPath &&
    fs.existsSync(config.cloneReferenceAudioPath) &&
    String(config.cloneReferenceText || "").trim()
  );
}

function piperVoiceReady(config: VoiceRuntimeConfig | null) {
  return Boolean(
    config &&
    fs.existsSync(PIPER_SCRIPT) &&
    fs.existsSync(config.piperExecutable) &&
    fs.existsSync(config.piperModelPath)
  );
}

function runVoiceScript(targetScript: string, text: string, onError?: (message: string) => void) {
  currentSpeech = execFile(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      targetScript,
      "-Text",
      text,
      "-ConfigPath",
      CONFIG_FILE
    ],
    (error) => {
      currentSpeech = null;
      if (error) onError?.(error.message);
    }
  );

  return true;
}

export function loadVoiceRuntime() {
  try {
    return readConfig();
  } catch {
    return null;
  }
}

export function getVoiceStatus(): VoiceStatus {
  const config = loadVoiceRuntime();
  const ready = config?.engine === "f5-clone-local"
    ? cloneVoiceReady(config)
    : piperVoiceReady(config);

  return {
    engine: config?.engine || "windows-sapi",
    model: config?.engine === "f5-clone-local"
      ? (config?.selectedVoiceLabel || path.basename(config?.cloneReferenceAudioPath || "cloned-reference"))
      : config?.preferVoiceServer
      ? `${config?.personaSpeechMode || "voice"} via ${config?.voiceWsUrl || "voice-server"}`
      : config?.piperModelPath
        ? `${path.basename(config.piperModelPath)}${config?.selectedSpeakerId ? ` [speaker ${config.selectedSpeakerId}]` : ""}`
        : "system",
    ready,
    fallback: config?.fallbackEngine || "windows-sapi",
    speaking: Boolean(currentSpeech)
  };
}

export function stopVoicePlayback() {
  if (currentSpeech) {
    const pid = currentSpeech.pid;
    try {
      // Kill entire process tree on Windows so Piper/SAPI child processes also stop
      if (pid && process.platform === "win32") {
        try { execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" }); } catch {}
      } else {
        currentSpeech.kill("SIGKILL");
      }
    } catch {}
    currentSpeech = null;
  }
}

export function speakWithVoice(text: string, onError?: (message: string) => void) {
  stopVoicePlayback();
  const config = loadVoiceRuntime();
  if (!config) {
    onError?.("Voice runtime config or Piper script is missing.");
    return false;
  }

  const targetScript = config.engine === "f5-clone-local" ? CLONED_SCRIPT : PIPER_SCRIPT;
  if (!fs.existsSync(targetScript)) {
    onError?.(`Voice runtime script is missing: ${targetScript}`);
    return false;
  }

  return runVoiceScript(targetScript, text, onError);
}

export function speakWithClonedVoice(text: string, onError?: (message: string) => void) {
  stopVoicePlayback();
  const config = loadVoiceRuntime();
  if (!cloneVoiceReady(config)) {
    onError?.("Cloned voice runtime is not configured yet.");
    return false;
  }
  return runVoiceScript(CLONED_SCRIPT, text, onError);
}

export function saveVoiceRuntime(config: VoiceRuntimeConfig) {
  try {
    writeTextWithRetries(CONFIG_FILE, JSON.stringify(config, null, 2), "Agent Lee voice runtime update.");
    return true;
  } catch (error) {
    console.warn(`[Agent Lee] Voice runtime persistence failed: ${describeFileError(error)}`);
    return false;
  }
}
