param(
  [string]$VsixPath,
  [string]$ExtensionDir,
  [string]$CodeCmdPath = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
  [string]$UserDataDir = (Join-Path $env:TEMP "agent-lee-vscode-profile"),
  [string]$ExtensionsDir = (Join-Path $env:TEMP "agent-lee-vscode-extensions")
)

$ErrorActionPreference = "Stop"

if (-not $VsixPath) {
  $resolvedExtensionDir = & (Join-Path $PSScriptRoot "Resolve-AgentLeeExtension.ps1") -ExtensionDir $ExtensionDir
  $VsixPath = Join-Path $resolvedExtensionDir "agent-lee-1.1.0-sovereign-runtime.vsix"
}

if (-not (Test-Path $CodeCmdPath)) {
  throw "VS Code CLI was not found at $CodeCmdPath"
}

$resolvedVsix = (Resolve-Path $VsixPath).Path
New-Item -ItemType Directory -Force -Path $UserDataDir | Out-Null
New-Item -ItemType Directory -Force -Path $ExtensionsDir | Out-Null

Write-Host "Installing VSIX into isolated VS Code profile" -ForegroundColor Cyan
& $CodeCmdPath `
  --user-data-dir $UserDataDir `
  --extensions-dir $ExtensionsDir `
  --install-extension $resolvedVsix `
  --force

if ($LASTEXITCODE -ne 0) {
  throw "VSIX install failed."
}

Write-Host "Installed VSIX: $resolvedVsix" -ForegroundColor Green

[pscustomobject]@{
  VsixPath = $resolvedVsix
  UserDataDir = $UserDataDir
  ExtensionsDir = $ExtensionsDir
}
