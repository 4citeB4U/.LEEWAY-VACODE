/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: UI
TAG: CORE.AGENT_LEE_LEEWAY_CODING_SYSTEM.VSCODE_EXTENSION.SRC.CORE.VOICE_ADAPTER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as fs from "fs";
import * as path from "path";
import { execFile, ChildProcess } from "child_process";

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const CONFIG_FILE = path.join(ROOT, "agent-lee", "voice", "voice-runtime.json");
const PIPER_SCRIPT = path.join(ROOT, "agent-lee", "voice", "Speak-AgentLeePiper.ps1");

export type VoiceRuntimeConfig = {
  engine: "piper-local";
  fallbackEngine: "windows-sapi";
  personaSpeechMode: string;
  interruptionPolicy: string;
  piperExecutable: string;
  piperModelPath: string;
  piperConfigPath?: string;
  sampleRate: number;
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

export function loadVoiceRuntime() {
  try {
    return readConfig();
  } catch {
    return null;
  }
}

export function getVoiceStatus(): VoiceStatus {
  const config = loadVoiceRuntime();
  const ready = Boolean(
    config &&
    fs.existsSync(PIPER_SCRIPT) &&
    fs.existsSync(config.piperExecutable) &&
    fs.existsSync(config.piperModelPath)
  );

  return {
    engine: config?.engine || "windows-sapi",
    model: config?.piperModelPath ? path.basename(config.piperModelPath) : "system",
    ready,
    fallback: config?.fallbackEngine || "windows-sapi",
    speaking: Boolean(currentSpeech)
  };
}

export function stopVoicePlayback() {
  if (currentSpeech) {
    try {
      currentSpeech.kill();
    } catch {}
    currentSpeech = null;
  }
}

export function speakWithVoice(text: string, onError?: (message: string) => void) {
  stopVoicePlayback();
  const config = loadVoiceRuntime();
  if (!config || !fs.existsSync(PIPER_SCRIPT)) {
    onError?.("Voice runtime config or Piper script is missing.");
    return false;
  }

  currentSpeech = execFile(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      PIPER_SCRIPT,
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

