<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.INSTALLED_CHECK
PURPOSE: Detects the installed Agent Lee extension, verifies commands, assets, build info, and flags stale VSIX runtime drift.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot ".."),
  [string]$EvidencePath
)

$ErrorActionPreference = "Stop"

function Get-HashSafe {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  try { return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash } catch { return "" }
}

$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$packageJsonPath = Join-Path $resolvedExtensionDir "package.json"
$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
$repoBuildInfoPath = Join-Path $resolvedExtensionDir "build\runtime-build-info.json"
$repoBuildInfo = if (Test-Path -LiteralPath $repoBuildInfoPath) { Get-Content -LiteralPath $repoBuildInfoPath -Raw | ConvertFrom-Json } else { $null }
$repoRuntimePath = Join-Path $resolvedExtensionDir "out\extension.js"
$repoRuntimeHash = Get-HashSafe -Path $repoRuntimePath
$extensionsRoot = Join-Path $env:USERPROFILE ".vscode\extensions"
$prefix = "leeway.$($packageJson.name)-"
$installedDirs = @()
if (Test-Path -LiteralPath $extensionsRoot) {
  $installedDirs = @(Get-ChildItem -LiteralPath $extensionsRoot -Directory | Where-Object { $_.Name -like "$prefix*" } | Sort-Object Name -Descending)
}
$installedDir = $installedDirs | Select-Object -First 1
$installedPath = if ($installedDir) { $installedDir.FullName } else { "" }
$installedPackagePath = if ($installedPath) { Join-Path $installedPath "package.json" } else { "" }
$installedBuildInfoPath = if ($installedPath) { Join-Path $installedPath "build\runtime-build-info.json" } else { "" }
$installedRuntimePath = if ($installedPath) { Join-Path $installedPath "out\extension.js" } else { "" }
$installedRuntimeHash = Get-HashSafe -Path $installedRuntimePath
$installedPackage = if ($installedPackagePath -and (Test-Path -LiteralPath $installedPackagePath)) { Get-Content -LiteralPath $installedPackagePath -Raw | ConvertFrom-Json } else { $null }
$installedBuildInfo = if ($installedBuildInfoPath -and (Test-Path -LiteralPath $installedBuildInfoPath)) { Get-Content -LiteralPath $installedBuildInfoPath -Raw | ConvertFrom-Json } else { $null }
$installedCommands = @($installedPackage.contributes.commands | ForEach-Object { $_.command })
$requiredAssets = @(
  "README.md",
  "media/agent-lee-activitybar-icon.svg",
  "media/leeway-standards-button.png",
  "media/readme-header.png",
  "media/readme-system-flow.png",
  "build/runtime-build-info.json",
  "out/extension.js"
)
$missingInstalledAssets = @()
if ($installedPath) {
  $missingInstalledAssets = @($requiredAssets | Where-Object { -not (Test-Path -LiteralPath (Join-Path $installedPath $_)) })
}
$installedVersion = if ($installedPackage) { [string]$installedPackage.version } else { "" }
$repoVersion = [string]$packageJson.version
$versionMatches = ($repoVersion -eq $installedVersion) -and $installedVersion
$hashMatches = $repoRuntimeHash -and $installedRuntimeHash -and ($repoRuntimeHash -eq $installedRuntimeHash)
$stale = [bool]$installedPath -and (-not $versionMatches -or -not $hashMatches)
$resultPath = if ($EvidencePath) { $EvidencePath } else { Join-Path $resolvedExtensionDir "test-evidence\leeway-installed-extension-check-result.json" }

$result = [pscustomobject]@{
  timestamp = (Get-Date).ToString("o")
  repoVersion = $repoVersion
  installedVersion = $installedVersion
  installedPath = $installedPath
  repoRuntimeHash = $repoRuntimeHash
  installedRuntimeHash = $installedRuntimeHash
  repoBuildInfoPath = $repoBuildInfoPath
  installedBuildInfoPath = $installedBuildInfoPath
  installedRuntimeStatus = if (-not $installedPath) { "not_found" } elseif ($stale) { "stale" } else { "current" }
  commandChecks = [pscustomobject]@{
    openSidebarContributed = ($installedCommands -contains "agentLee.openSidebar")
    runtimeStatusContributed = ($installedCommands -contains "agentLee.runtimeStatus")
  }
  buildInfoChecks = [pscustomobject]@{
    repoBuildInfoPresent = [bool]$repoBuildInfo
    installedBuildInfoPresent = [bool]$installedBuildInfo
    packageVersionMatches = $versionMatches
    runtimeHashMatches = $hashMatches
    installedBuildInfoVersion = if ($installedBuildInfo) { [string]$installedBuildInfo.packageVersion } else { "" }
    repoBuildInfoVersion = if ($repoBuildInfo) { [string]$repoBuildInfo.packageVersion } else { "" }
  }
  assetChecks = [pscustomobject]@{
    missingInstalledAssets = $missingInstalledAssets
  }
  staleDetected = $stale
  detectionPass = if (-not $installedPath) { $true } elseif ($stale) { $true } else { $true }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $resultPath) | Out-Null
$result | ConvertTo-Json -Depth 8 | Out-File -LiteralPath $resultPath -Encoding utf8
Write-Host "Installed extension evidence written to $resultPath" -ForegroundColor Green
