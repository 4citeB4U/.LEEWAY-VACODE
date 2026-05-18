<#
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.UPDATE
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Legacy entrypoint preserved only to route all local VSIX installs through the governed install-current pipeline.
#>

param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot "..")
)

$ErrorActionPreference = "Stop"
$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$governedInstaller = Join-Path $PSScriptRoot "Invoke-LeeWayExtensionInstallCurrent.ps1"
$legacyUpdateNodeId = "LEEWAY_QUARANTINE::PACKAGE::LEGACY_UPDATE_LANE"
$governedInstallerNodeId = "LEEWAY_APP::PACKAGE::INSTALLED_CLEANUP::STALE_INSTANCE_QUARANTINE"

if (-not (Test-Path -LiteralPath $governedInstaller)) {
  throw "Governed installer not found: $governedInstaller"
}

Write-Warning "[$legacyUpdateNodeId] Invoke-LeeWayExtensionUpdate.ps1 is quarantined as a legacy wrapper. Agent Lee now uses [$governedInstallerNodeId] Invoke-LeeWayExtensionInstallCurrent.ps1 as the only supported local VSIX install lane."
& $governedInstaller -ExtensionDir $resolvedExtensionDir
exit $LASTEXITCODE
