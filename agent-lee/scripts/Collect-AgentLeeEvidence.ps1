param(
  [string]$RootDir = (Join-Path $PSScriptRoot "..\.."),
  [string]$VsixPath,
  [string]$ExtensionDir,
  [string]$CodeCmdPath = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
  [string]$UserDataDir = (Join-Path $env:TEMP "agent-lee-vscode-profile"),
  [string]$ExtensionsDir = (Join-Path $env:TEMP "agent-lee-vscode-extensions"),
  [string]$OutputDir = (Join-Path (Join-Path $PSScriptRoot "..\..\reports") ("packaged-validation-" + (Get-Date -Format "yyyy-MM-ddTHH-mm-ss")))
)

$ErrorActionPreference = "Stop"

$resolvedExtensionDir = & (Join-Path $PSScriptRoot "Resolve-AgentLeeExtension.ps1") -ExtensionDir $ExtensionDir
if (-not $VsixPath) {
  $VsixPath = Join-Path $resolvedExtensionDir "agent-lee-1.1.0-sovereign-runtime.vsix"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$globalRoot = Join-Path $env:USERPROFILE ".leeway-vscode"
$logDir = Join-Path $globalRoot "logs\agent-lee"
$chatDir = Join-Path $globalRoot "memory\chats"

if (Test-Path $logDir) {
  Copy-Item $logDir (Join-Path $OutputDir "agent-lee-logs") -Recurse -Force
}

if (Test-Path $chatDir) {
  Copy-Item $chatDir (Join-Path $OutputDir "chat-memory") -Recurse -Force
}

$extensionsList = & $CodeCmdPath --extensions-dir $ExtensionsDir --list-extensions --show-versions
$extensionsList | Out-File (Join-Path $OutputDir "installed-extensions.txt") -Encoding utf8

$summary = [pscustomobject]@{
  collectedAt = (Get-Date).ToString("o")
  rootDir = (Resolve-Path $RootDir).Path
  extensionDir = $resolvedExtensionDir
  vsixPath = (Resolve-Path $VsixPath).Path
  userDataDir = $UserDataDir
  extensionsDir = $ExtensionsDir
  outputDir = $OutputDir
  globalLogDir = $logDir
  globalChatDir = $chatDir
}

$summary | ConvertTo-Json -Depth 5 | Out-File (Join-Path $OutputDir "summary.json") -Encoding utf8

Write-Host "Collected evidence in $OutputDir" -ForegroundColor Green
$summary
