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
const CLONED_SCRIPT = path.join(ROOT, "agent-lee", "voice", "Speak-AgentLeeCloned.ps1");

export type VoiceEngine = "piper-local" | "f5-clone-local";

export type VoiceRuntimeConfig = {
  engine: VoiceEngine;
  preferVoiceServer?: boolean;
  voiceWsUrl?: string;
  fallbackEngine: "none" | "windows-sapi" | "piper-local";
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
  cloneSpeedRatio?: number;
  tuning?: {
    sampleTrimRatio?: number;
    playbackRateRatio?: number;
    pitchRatio?: number;
    toneRatio?: number;
  };
  ffmpegPath?: string;
};

export type VoiceStatus = {
  engine: string;
  model: string;
  ready: boolean;
  fallback: string;
  speaking: boolean;
};

export type VoicePlaybackCallbacks = {
  onSegmentStarted?: () => void;
  onSegmentCompleted?: () => void;
};

let currentSpeech: ChildProcess | null = null;
let voiceQueue: Promise<void> = Promise.resolve();
let activeVoiceGeneration = 0;

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

function assertClonedVoiceReady(config: VoiceRuntimeConfig | null) {
  if (!config) throw new Error("Cloned voice runtime is missing.");
  if (config.engine !== "f5-clone-local") {
    throw new Error("Cloned voice runtime is required. Refusing to use a non-cloned voice engine.");
  }
  if (!fs.existsSync(CLONED_SCRIPT)) {
    throw new Error(`Voice runtime script is missing: ${CLONED_SCRIPT}`);
  }
  if (!config.clonePythonPath || !fs.existsSync(config.clonePythonPath)) {
    throw new Error("Cloned voice Python runtime is missing.");
  }
  if (!config.cloneScriptPath || !fs.existsSync(config.cloneScriptPath)) {
    throw new Error("Cloned voice synthesis script is missing.");
  }
  if (!config.cloneReferenceAudioPath || !fs.existsSync(config.cloneReferenceAudioPath)) {
    throw new Error("Cloned voice reference audio is missing.");
  }
  if (!String(config.cloneReferenceText || "").trim()) {
    throw new Error("Cloned voice reference transcript is missing.");
  }
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

function enforceClonedVoice(config: VoiceRuntimeConfig | null): VoiceRuntimeConfig | null {
  if (!config) return null;
  return {
    ...config,
    engine: "f5-clone-local",
    preferVoiceServer: true,
    fallbackEngine: "none"
  };
}

function enqueueClonedVoice(
  text: string,
  onError?: (message: string) => void,
  callbacks?: VoicePlaybackCallbacks
) {
  const generation = activeVoiceGeneration;
  voiceQueue = voiceQueue.then(() => new Promise<void>((resolve) => {
    if (generation !== activeVoiceGeneration) {
      resolve();
      return;
    }

    callbacks?.onSegmentStarted?.();
    currentSpeech = execFile(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        CLONED_SCRIPT,
        "-Text",
        text,
        "-ConfigPath",
        CONFIG_FILE
      ],
      (error) => {
        currentSpeech = null;
        if (error) onError?.(error.message);
        callbacks?.onSegmentCompleted?.();
        resolve();
      }
    );
  }));
  return true;
}

export function loadVoiceRuntime() {
  try {
    return enforceClonedVoice(readConfig());
  } catch {
    return null;
  }
}

export function getVoiceStatus(): VoiceStatus {
  const config = loadVoiceRuntime();
  const ready = cloneVoiceReady(config);

  return {
    engine: config?.engine || "f5-clone-local",
    model: config?.selectedVoiceLabel || path.basename(config?.cloneReferenceAudioPath || "cloned-reference"),
    ready,
    fallback: config?.fallbackEngine || "none",
    speaking: Boolean(currentSpeech)
  };
}

export function stopVoicePlayback() {
  activeVoiceGeneration += 1;
  voiceQueue = Promise.resolve();
  if (currentSpeech) {
    const pid = currentSpeech.pid;
    try {
      if (pid && process.platform === "win32") {
        try { execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" }); } catch {}
      } else {
        currentSpeech.kill("SIGKILL");
      }
    } catch {}
    currentSpeech = null;
  }
}

export function speakWithVoice(
  text: string,
  onError?: (message: string) => void,
  callbacks?: VoicePlaybackCallbacks
) {
  try {
    const config = loadVoiceRuntime();
    assertClonedVoiceReady(config);
    return enqueueClonedVoice(text, onError, callbacks);
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    onError?.(message);
    return false;
  }
}

export function speakWithClonedVoice(
  text: string,
  onError?: (message: string) => void,
  callbacks?: VoicePlaybackCallbacks
) {
  try {
    const config = loadVoiceRuntime();
    assertClonedVoiceReady(config);
    return enqueueClonedVoice(text, onError, callbacks);
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    onError?.(message);
    return false;
  }
}

export function saveVoiceRuntime(config: VoiceRuntimeConfig) {
  try {
    const normalized = enforceClonedVoice(config);
    writeTextWithRetries(CONFIG_FILE, JSON.stringify(normalized, null, 2), "Agent Lee voice runtime update.");
    return true;
  } catch (error) {
    console.warn(`[Agent Lee] Voice runtime persistence failed: ${describeFileError(error)}`);
    return false;
  }
}
