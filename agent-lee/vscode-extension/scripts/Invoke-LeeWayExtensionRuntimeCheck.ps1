<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.RUNTIME_CHECK
PURPOSE: Writes dedicated runtime-truth evidence for the latest installed Agent Lee extension and recent live VS Code activation state.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot "..")
)

$ErrorActionPreference = "Stop"

$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$installedCheckScript = Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayInstalledExtensionCheck.ps1"
$evidencePath = Join-Path $resolvedExtensionDir "test-evidence\leeway-extension-runtime-check-result.json"

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installedCheckScript -ExtensionDir $resolvedExtensionDir -EvidencePath $evidencePath
exit $LASTEXITCODE
