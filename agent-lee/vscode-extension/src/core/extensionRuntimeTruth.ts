/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.RUNTIME_TRUTH
PURPOSE: Proves whether Agent Lee is running from source, a linked workspace, a current VSIX, or a stale installed VSIX.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  AUTO_UPDATE_NOT_AVAILABLE_FOR_LOCAL_VSIX,
  CHAT_WEBVIEW_RUNTIME_ID,
  README_RUNTIME_ID,
  STATUS_BAR_RUNTIME_ID,
  UPDATE_CHANNEL_PRIVATE_REGISTRY,
  VOICE_RUNTIME_ID
} from "./runtimeIdentity";
import { getLeewayAssetRelativePath } from "./branding/leewayAssetRegistry";

export type ExtensionRuntimeSourceMode =
  | "SOURCE_DEV_HOST"
  | "SOURCE_LINKED_WORKSPACE"
  | "SOURCE_PACKAGED_VSIX"
  | "SOURCE_STALE_VSIX"
  | "SOURCE_UNKNOWN";

export type ExtensionUpdateChannel =
  | "UPDATE_CHANNEL_MANUAL_LOCAL_VSIX"
  | "UPDATE_CHANNEL_MARKETPLACE"
  | "UPDATE_CHANNEL_OPEN_VSX"
  | "UPDATE_CHANNEL_PRIVATE_REGISTRY"
  | "UPDATE_CHANNEL_DEV_HOST"
  | "UPDATE_CHANNEL_UNKNOWN";

export type ExtensionBuildInfo = {
  schemaVersion: "1";
  packageName: string;
  packageVersion: string;
  builtAt: string;
  gitCommit: string;
  runtimeIdentityVersion?: string;
  uiGenerationId?: string;
  statusBarRuntimeId?: string;
  chatWebviewRuntimeId?: string;
  readmeRuntimeId?: string;
  voiceRuntimeId?: string;
  extensionEntryRelativePath: string;
  extensionEntryHash: string;
  readmePath: string;
  activityBarIconPath: string;
  packageIconPath?: string;
  assetRegistryIds?: string[];
  assetPaths: string[];
  commandIds: string[];
};

export type ExtensionRuntimeTruthState = {
  sourceMode: ExtensionRuntimeSourceMode;
  updateChannel: ExtensionUpdateChannel;
  packageVersion: string;
  repoPackageVersion: string;
  currentExtensionPath: string;
  repoExtensionPath: string;
  repoBuildInfoPath: string;
  currentBuildInfoPath: string;
  repoEntryHash: string;
  currentEntryHash: string;
  installedExtensionPath: string;
  installedEntryHash: string;
  installedVersion: string;
  installedRuntimeStatus: "current" | "stale" | "not_found" | "unknown";
  commandsRegistered: boolean;
  assetsPackaged: boolean;
  readmeAssetsPresent: boolean;
  buildInfoPresent: boolean;
  autoUpdateAvailable: boolean;
  autoUpdateExpectation: string;
  autoUpdateSetting: string;
  autoUpdateWorkspaceSetting: string;
  settingsSyncIgnored: boolean;
  settingsSyncIgnoredDetail: string;
  latestLocalVsixPath: string;
  latestLocalVsixVersion: string;
  activityBarIconPath: string;
  packageIconPath: string;
  installedFromGallery: boolean;
  installedPreRelease: boolean;
  packagePreview: boolean;
  adapterCrashRisk: boolean;
  adapterHealth: string[];
  hashesMatch: boolean;
  staleRuntimeDetected: boolean;
  splitBrainDetected: boolean;
  statusBarRuntimeId: string;
  chatWebviewRuntimeId: string;
  readmeRuntimeId: string;
  voiceRuntimeId: string;
  detailLines: string[];
};

export type LiveHostSelfAttestation = {
  schemaVersion: "1";
  extensionId: string;
  extensionPath: string;
  packageVersion: string;
  buildHash: string;
  uiGenerationId: string;
  activationTimestamp: string;
  runtimeSourceMode: ExtensionRuntimeSourceMode;
  installedRuntimeStatus: ExtensionRuntimeTruthState["installedRuntimeStatus"];
  updateChannel: ExtensionUpdateChannel;
  vscodeAppName: string;
  vscodeVersion: string;
  extensionHostKind: string;
  processId: number;
  commandRegistrationStatus: Record<string, boolean>;
  mediaAssetHashSample: {
    relativePath: string;
    hash: string;
  };
  readmeHashSample: {
    relativePath: string;
    hash: string;
  };
  voiceRuntimeId: string;
  statusBarRuntimeId: string;
  chatUiRuntimeId: string;
  readmeRuntimeId: string;
  runtimeIdentityVersion: string;
  buildInfoPath: string;
  attestedAt: string;
};

const ROOT = path.join(process.env.USERPROFILE || "", ".leeway-vscode");
const REPO_EXTENSION_DIR = path.join(ROOT, "agent-lee", "vscode-extension");
const BUILD_INFO_RELATIVE_PATH = path.join("build", "runtime-build-info.json");
const ENTRY_RELATIVE_PATH = path.join("out", "extension.js");
const PACKAGE_NAME = "agent-lee-leeway-coding-system";
const PUBLISHER = "leeway";
const EXTENSION_ROOTS = [
  path.join(process.env.USERPROFILE || "", ".vscode", "extensions"),
  path.join(process.env.USERPROFILE || "", ".vscode-insiders", "extensions"),
  path.join(process.env.USERPROFILE || "", ".antigravity", "extensions")
];
const EXTENSIONS_METADATA_PATH = path.join(process.env.USERPROFILE || "", ".vscode", "extensions", "extensions.json");
const LIVE_HOST_ATTESTATION_FILE = "live-host-attestation-current.json";

type InstalledExtensionMetadata = {
  source?: string;
  isPreReleaseVersion?: boolean;
  preRelease?: boolean;
  publisherDisplayName?: string;
};

function normalizePath(filePath: string) {
  try {
    return fs.realpathSync.native(filePath);
  } catch {
    return path.resolve(filePath);
  }
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function readPackageVersion(extensionPath: string) {
  const packageJson = readJsonFile<{ version?: string }>(path.join(extensionPath, "package.json"));
  return String(packageJson?.version || "").trim();
}

function hashFile(filePath: string) {
  try {
    const digest = crypto.createHash("sha256");
    digest.update(fs.readFileSync(filePath));
    return digest.digest("hex").toUpperCase();
  } catch {
    return "";
  }
}

function getBuildInfo(extensionPath: string) {
  const buildInfoPath = path.join(extensionPath, BUILD_INFO_RELATIVE_PATH);
  return {
    path: buildInfoPath,
    info: readJsonFile<ExtensionBuildInfo>(buildInfoPath)
  };
}

function listInstalledExtensionDirs() {
  return EXTENSION_ROOTS
    .filter((extensionsRoot) => fs.existsSync(extensionsRoot))
    .flatMap((extensionsRoot) => fs.readdirSync(extensionsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith(`${PUBLISHER}.${PACKAGE_NAME}-`))
      .map((entry) => path.join(extensionsRoot, entry.name)));
}

function compareVersion(a: string, b: string) {
  const aParts = a.split(".").map((part) => Number(part || 0));
  const bParts = b.split(".").map((part) => Number(part || 0));
  const max = Math.max(aParts.length, bParts.length);
  for (let index = 0; index < max; index += 1) {
    const left = aParts[index] || 0;
    const right = bParts[index] || 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }
  return 0;
}

function getLatestInstalledExtensionDir() {
  const candidates = listInstalledExtensionDirs()
    .map((fullPath) => ({ fullPath, version: readPackageVersion(fullPath) }))
    .sort((left, right) => compareVersion(right.version, left.version));
  return candidates[0] || null;
}

function getLatestLocalVsix(extensionDir: string) {
  try {
    if (!fs.existsSync(extensionDir)) return null;
    const vsixFiles = fs.readdirSync(extensionDir)
      .filter((file) => /^agent-lee-leeway-coding-system-\d+\.\d+\.\d+\.vsix$/i.test(file))
      .map((file) => {
        const match = file.match(/-(\d+\.\d+\.\d+)\.vsix$/i);
        return {
          fullPath: path.join(extensionDir, file),
          version: match?.[1] || "",
          file
        };
      })
      .sort((left, right) => compareVersion(right.version, left.version));
    return vsixFiles[0] || null;
  } catch {
    return null;
  }
}

function readInstalledExtensionMetadata() {
  const extensionsJson = readJsonFile<Array<{
    identifier?: { id?: string };
    metadata?: InstalledExtensionMetadata;
  }>>(EXTENSIONS_METADATA_PATH);
  if (!extensionsJson) return null;
  return extensionsJson.find((entry) => entry.identifier?.id === `${PUBLISHER}.${PACKAGE_NAME}`)?.metadata || null;
}

function stringifySetting(value: unknown) {
  if (typeof value === "undefined") return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function assetsExist(extensionPath: string, assetPaths: string[]) {
  return assetPaths.every((relativePath) => fs.existsSync(path.join(extensionPath, relativePath)));
}

function commandExists(commandIds: string[], targetCommand: string) {
  return commandIds.includes(targetCommand);
}

export function getLiveHostAttestationPath(context: vscode.ExtensionContext) {
  return path.join(context.globalStorageUri.fsPath, LIVE_HOST_ATTESTATION_FILE);
}

export function buildLiveHostSelfAttestation(
  context: vscode.ExtensionContext,
  runtimeTruth: ExtensionRuntimeTruthState,
  activationTimestamp: string,
  commandRegistrationStatus: Record<string, boolean>
): LiveHostSelfAttestation {
  const currentExtensionPath = normalizePath(context.extensionPath);
  const buildInfoPath = path.join(currentExtensionPath, BUILD_INFO_RELATIVE_PATH);
  const buildInfo = readJsonFile<ExtensionBuildInfo>(buildInfoPath);
  const mediaAssetRelativePath = String(
    buildInfo?.activityBarIconPath || getLeewayAssetRelativePath("LEEWAY_ASSET::ACTIVITY_BAR_ICON")
  );
  const readmeRelativePath = String(buildInfo?.readmePath || "README.md");
  const extensionKind = context.extension.extensionKind === vscode.ExtensionKind.UI
    ? "ui"
    : context.extension.extensionKind === vscode.ExtensionKind.Workspace
      ? "workspace"
      : "unknown";

  return {
    schemaVersion: "1",
    extensionId: context.extension.id,
    extensionPath: currentExtensionPath,
    packageVersion: runtimeTruth.packageVersion,
    buildHash: runtimeTruth.currentEntryHash || buildInfo?.extensionEntryHash || "",
    uiGenerationId: String(buildInfo?.uiGenerationId || ""),
    activationTimestamp,
    runtimeSourceMode: runtimeTruth.sourceMode,
    installedRuntimeStatus: runtimeTruth.installedRuntimeStatus,
    updateChannel: runtimeTruth.updateChannel,
    vscodeAppName: vscode.env.appName,
    vscodeVersion: vscode.version,
    extensionHostKind: `${extensionKind}${vscode.env.remoteName ? `:${vscode.env.remoteName}` : ":local"}`,
    processId: process.pid,
    commandRegistrationStatus,
    mediaAssetHashSample: {
      relativePath: mediaAssetRelativePath,
      hash: hashFile(path.join(currentExtensionPath, mediaAssetRelativePath))
    },
    readmeHashSample: {
      relativePath: readmeRelativePath,
      hash: hashFile(path.join(currentExtensionPath, readmeRelativePath))
    },
    voiceRuntimeId: VOICE_RUNTIME_ID,
    statusBarRuntimeId: STATUS_BAR_RUNTIME_ID,
    chatUiRuntimeId: CHAT_WEBVIEW_RUNTIME_ID,
    readmeRuntimeId: README_RUNTIME_ID,
    runtimeIdentityVersion: String(buildInfo?.runtimeIdentityVersion || ""),
    buildInfoPath,
    attestedAt: new Date().toISOString()
  };
}

export function collectExtensionRuntimeTruth(context: vscode.ExtensionContext): ExtensionRuntimeTruthState {
  const currentExtensionPath = normalizePath(context.extensionPath);
  const repoExtensionPath = normalizePath(REPO_EXTENSION_DIR);
  const currentEntryPath = path.join(currentExtensionPath, ENTRY_RELATIVE_PATH);
  const repoEntryPath = path.join(repoExtensionPath, ENTRY_RELATIVE_PATH);
  const { path: currentBuildInfoPath, info: currentBuildInfo } = getBuildInfo(currentExtensionPath);
  const { path: repoBuildInfoPath, info: repoBuildInfo } = getBuildInfo(repoExtensionPath);
  const latestInstalled = getLatestInstalledExtensionDir();
  const installedMetadata = readInstalledExtensionMetadata();
  const latestLocalVsix = getLatestLocalVsix(repoExtensionPath);
  const installedExtensionPath = latestInstalled ? normalizePath(latestInstalled.fullPath) : "";
  const installedEntryPath = installedExtensionPath ? path.join(installedExtensionPath, ENTRY_RELATIVE_PATH) : "";
  const installedVersion = latestInstalled?.version || "";
  const installedCandidates = listInstalledExtensionDirs();
  const duplicateInstalledRootsDetected = installedCandidates.length > 1;
  const repoPackageVersion = repoBuildInfo?.packageVersion || readPackageVersion(repoExtensionPath) || "unknown";
  const currentEntryHash = hashFile(currentEntryPath);
  const repoEntryHash = hashFile(repoEntryPath);
  const installedEntryHash = hashFile(installedEntryPath);
  const currentCommandIds = currentBuildInfo?.commandIds || [];
  const currentAssetPaths = currentBuildInfo?.assetPaths || [];
  const currentVsRepoHashMatch = Boolean(currentEntryHash && repoEntryHash && currentEntryHash === repoEntryHash);
  const currentVsRepoVersionMatch = Boolean(
    currentBuildInfo?.packageVersion &&
    repoBuildInfo?.packageVersion &&
    currentBuildInfo.packageVersion === repoBuildInfo.packageVersion
  );
  const currentVsInstalledHashMatch = Boolean(
    currentEntryHash &&
    installedEntryHash &&
    currentEntryHash === installedEntryHash
  );
  const packageJson = readJsonFile<{
    icon?: string;
    contributes?: { viewsContainers?: { activitybar?: Array<{ icon?: string }> } };
  }>(path.join(currentExtensionPath, "package.json"));
  const buildInfoPresent = Boolean(currentBuildInfo && repoBuildInfo);
  const assetsPackaged = currentAssetPaths.length > 0 && assetsExist(currentExtensionPath, currentAssetPaths);
  const readmeAssetsPresent = assetsExist(currentExtensionPath, [
    "README.md",
    getLeewayAssetRelativePath("LEEWAY_ASSET::README_HEADER_IMAGE"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::README_PRIMARY_LOGO"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::CHAT_HEADER_AVATAR"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::PACKAGE_ICON"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::SIDEBAR_TOP_RIGHT_BUTTON"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::SIDEBAR_BOTTOM_BUTTON"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::LEEWAY_STANDARDS_BUTTON"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::README_SYSTEM_FLOW"),
    getLeewayAssetRelativePath("LEEWAY_ASSET::ACTIVITY_BAR_ICON")
  ]);
  const commandsRegistered = commandExists(currentCommandIds, "agentLee.openSidebar");
  const adapterAssetPaths = [
    path.join(currentExtensionPath, "out", "plugins", "adapters", "gmail.adapter.js"),
    path.join(currentExtensionPath, "out", "plugins", "adapters", "huggingface.adapter.js"),
    path.join(currentExtensionPath, "out", "plugins", "adapters", "vercel.adapter.js")
  ];
  const missingAdapterAssets = adapterAssetPaths.filter((entry) => !fs.existsSync(entry));
  const adapterCrashRisk = missingAdapterAssets.length > 0;

  const autoUpdateInspect = vscode.workspace.getConfiguration("extensions").inspect("autoUpdate");
  const autoUpdateSetting = stringifySetting(autoUpdateInspect?.globalValue ?? autoUpdateInspect?.defaultValue);
  const autoUpdateWorkspaceSetting = stringifySetting(autoUpdateInspect?.workspaceValue ?? autoUpdateInspect?.workspaceFolderValue);
  const ignoredSettings = vscode.workspace.getConfiguration("settingsSync").get<string[]>("ignoredSettings") || [];
  const settingsSyncIgnored = ignoredSettings.includes("extensions.autoUpdate");
  const packagePreview = Boolean((context.extension.packageJSON as { preview?: boolean }).preview);
  const installedFromGallery = Boolean(installedMetadata?.source === "gallery");
  const installedPreRelease = Boolean(installedMetadata?.isPreReleaseVersion || installedMetadata?.preRelease);

  let sourceMode: ExtensionRuntimeSourceMode = "SOURCE_UNKNOWN";
  let updateChannel: ExtensionUpdateChannel = "UPDATE_CHANNEL_UNKNOWN";
  let installedRuntimeStatus: ExtensionRuntimeTruthState["installedRuntimeStatus"] = "unknown";

  if (context.extensionMode === vscode.ExtensionMode.Development) {
    sourceMode = "SOURCE_DEV_HOST";
    updateChannel = "UPDATE_CHANNEL_DEV_HOST";
    installedRuntimeStatus = installedEntryHash ? (currentVsInstalledHashMatch ? "current" : "stale") : "not_found";
  } else if (currentExtensionPath === repoExtensionPath) {
    sourceMode = "SOURCE_LINKED_WORKSPACE";
    updateChannel = "UPDATE_CHANNEL_DEV_HOST";
    installedRuntimeStatus = installedEntryHash ? (currentVsInstalledHashMatch ? "current" : "stale") : "not_found";
  } else if (installedExtensionPath && currentExtensionPath === installedExtensionPath) {
    if (currentVsRepoHashMatch && currentVsRepoVersionMatch) {
      sourceMode = "SOURCE_PACKAGED_VSIX";
      installedRuntimeStatus = "current";
    } else {
      sourceMode = "SOURCE_STALE_VSIX";
      installedRuntimeStatus = "stale";
    }
    updateChannel = installedMetadata?.source === "private"
      ? UPDATE_CHANNEL_PRIVATE_REGISTRY
      : installedFromGallery
        ? "UPDATE_CHANNEL_MARKETPLACE"
        : "UPDATE_CHANNEL_MANUAL_LOCAL_VSIX";
  } else if (!installedExtensionPath) {
    installedRuntimeStatus = "not_found";
  }

  if (duplicateInstalledRootsDetected && installedRuntimeStatus !== "not_found") {
    installedRuntimeStatus = "stale";
  }

  let autoUpdateAvailable = false;
  let autoUpdateExpectation = "UNKNOWN_UPDATE_PATH";
  if (updateChannel === "UPDATE_CHANNEL_DEV_HOST") {
    autoUpdateExpectation = "SOURCE_DEV_HOST does not use extension auto-update. Use F5 / Extension Development Host.";
  } else if (installedFromGallery) {
    autoUpdateAvailable = true;
    autoUpdateExpectation = "Marketplace channel can auto-update when a newer published version exists.";
  } else if (updateChannel === "UPDATE_CHANNEL_MANUAL_LOCAL_VSIX") {
    autoUpdateExpectation = AUTO_UPDATE_NOT_AVAILABLE_FOR_LOCAL_VSIX;
  }

  const staleRuntimeDetected = installedRuntimeStatus === "stale";
  const splitBrainDetected = Boolean(
    staleRuntimeDetected ||
    (currentBuildInfo?.packageVersion && repoBuildInfo?.packageVersion && currentBuildInfo.packageVersion !== repoBuildInfo.packageVersion) ||
    (installedVersion && currentBuildInfo?.packageVersion && installedVersion !== currentBuildInfo.packageVersion) ||
    (latestLocalVsix?.version && currentBuildInfo?.packageVersion && latestLocalVsix.version !== currentBuildInfo.packageVersion) ||
    duplicateInstalledRootsDetected ||
    (!currentVsRepoHashMatch && Boolean(currentEntryHash && repoEntryHash))
  );

  const detailLines = [
    `Source mode: ${sourceMode}`,
    `Update channel: ${updateChannel}`,
    `Current extension path: ${currentExtensionPath}`,
    `Repo extension path: ${repoExtensionPath}`,
    `Current package version: ${currentBuildInfo?.packageVersion || readPackageVersion(currentExtensionPath) || "unknown"}`,
    `Repo package version: ${repoPackageVersion}`,
    `Installed package version: ${installedVersion || "not_found"}`,
    `Installed extension copies discovered: ${installedCandidates.length}`,
    `Latest local VSIX version: ${latestLocalVsix?.version || "not_found"}`,
    `Build info present: ${buildInfoPresent}`,
    `Current entry hash: ${currentEntryHash || "missing"}`,
    `Repo entry hash: ${repoEntryHash || "missing"}`,
    `Installed entry hash: ${installedEntryHash || "missing"}`,
    `Commands registered in build info: ${commandsRegistered}`,
    `Assets packaged: ${assetsPackaged}`,
    `README assets present: ${readmeAssetsPresent}`,
    `Installed runtime status: ${installedRuntimeStatus}`,
    `Duplicate installed roots detected: ${duplicateInstalledRootsDetected}`,
    `Stale runtime detected: ${staleRuntimeDetected}`,
    `Split-brain detected: ${splitBrainDetected}`,
    `Adapter crash risk: ${adapterCrashRisk}`,
    `Activity Bar icon path: ${String(packageJson?.contributes?.viewsContainers?.activitybar?.[0]?.icon || getLeewayAssetRelativePath("LEEWAY_ASSET::ACTIVITY_BAR_ICON"))}`,
    `Package icon path: ${String(packageJson?.icon || getLeewayAssetRelativePath("LEEWAY_ASSET::PACKAGE_ICON"))}`,
    `extensions.autoUpdate: ${autoUpdateSetting}`,
    `workspace extensions.autoUpdate: ${autoUpdateWorkspaceSetting}`,
    `Settings Sync ignores extensions.autoUpdate: ${settingsSyncIgnored}`,
    `Installed from gallery: ${installedFromGallery}`,
    `Installed prerelease: ${installedPreRelease}`,
    `Manifest preview flag: ${packagePreview}`,
    `Automatic updates expected: ${autoUpdateAvailable}`,
    `Automatic update explanation: ${autoUpdateExpectation}`
  ];

  return {
    sourceMode,
    updateChannel,
    packageVersion: currentBuildInfo?.packageVersion || readPackageVersion(currentExtensionPath) || "unknown",
    repoPackageVersion,
    currentExtensionPath,
    repoExtensionPath,
    repoBuildInfoPath,
    currentBuildInfoPath,
    repoEntryHash,
    currentEntryHash,
    installedExtensionPath,
    installedEntryHash,
    installedVersion,
    installedRuntimeStatus,
    commandsRegistered,
    assetsPackaged,
    readmeAssetsPresent,
    buildInfoPresent,
    autoUpdateAvailable,
    autoUpdateExpectation,
    autoUpdateSetting,
    autoUpdateWorkspaceSetting,
    settingsSyncIgnored,
    settingsSyncIgnoredDetail: settingsSyncIgnored ? "settingsSync.ignoredSettings includes extensions.autoUpdate." : "settingsSync.ignoredSettings does not include extensions.autoUpdate.",
    latestLocalVsixPath: latestLocalVsix?.fullPath || "",
    latestLocalVsixVersion: latestLocalVsix?.version || "",
    activityBarIconPath: String(packageJson?.contributes?.viewsContainers?.activitybar?.[0]?.icon || getLeewayAssetRelativePath("LEEWAY_ASSET::ACTIVITY_BAR_ICON")),
    packageIconPath: String(packageJson?.icon || getLeewayAssetRelativePath("LEEWAY_ASSET::PACKAGE_ICON")),
    installedFromGallery,
    installedPreRelease,
    packagePreview,
    adapterCrashRisk,
    adapterHealth: missingAdapterAssets.length
      ? missingAdapterAssets.map((entry) => `missing ${path.basename(entry)}`)
      : ["gmail adapter present", "huggingface adapter present", "vercel adapter present"],
    hashesMatch: currentVsRepoHashMatch,
    staleRuntimeDetected,
    splitBrainDetected,
    statusBarRuntimeId: STATUS_BAR_RUNTIME_ID,
    chatWebviewRuntimeId: CHAT_WEBVIEW_RUNTIME_ID,
    readmeRuntimeId: README_RUNTIME_ID,
    voiceRuntimeId: VOICE_RUNTIME_ID,
    detailLines
  };
}
