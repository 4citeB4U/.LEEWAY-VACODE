<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.AGENT_LEE.SCRIPTS.BUILD_AGENTLEEVSIX
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [string]$ExtensionDir,
  [string]$OutputName = "agent-lee-1.1.0-sovereign-runtime.vsix"
)

$ErrorActionPreference = "Stop"

$resolvedExtensionDir = & (Join-Path $PSScriptRoot "Resolve-AgentLeeExtension.ps1") -ExtensionDir $ExtensionDir
$outputPath = Join-Path $resolvedExtensionDir $OutputName

Write-Host "Compiling extension in $resolvedExtensionDir" -ForegroundColor Cyan
Push-Location $resolvedExtensionDir
try {
  if (-not (Test-Path "node_modules")) {
    if (Test-Path "package-lock.json") {
      & npm.cmd ci
    } else {
      & npm.cmd install
    }
    if ($LASTEXITCODE -ne 0) {
      throw "Dependency install failed."
    }
  }

  & npm.cmd run compile
  if ($LASTEXITCODE -ne 0) {
    throw "TypeScript compile failed."
  }

  if (-not (Test-Path "out\extension.js")) {
    throw "Compile finished, but out\extension.js was not created."
  }

  & npx.cmd @vscode/vsce package -o $OutputName
  if ($LASTEXITCODE -ne 0) {
    throw "VSIX packaging failed."
  }
}
finally {
  Pop-Location
}

Write-Host "Built VSIX: $outputPath" -ForegroundColor Green
$outputPath

