<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.ASSET_CHECK
PURPOSE: Verifies icon assets, README image paths, ignore rules, and packaged VSIX asset coverage for the Agent Lee extension.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot ".."),
  [string]$EvidencePath
)

$ErrorActionPreference = "Stop"

function New-AssetCheck {
  param(
    [string]$Name,
    [bool]$Pass,
    [string]$Detail
  )

  [pscustomobject]@{
    name = $Name
    pass = $Pass
    detail = $Detail
  }
}

function Get-ReadmeAssetPaths {
  param([string]$ReadmePath)

  $content = Get-Content -LiteralPath $ReadmePath -Raw
  return @([regex]::Matches($content, '\./media/([A-Za-z0-9._-]+)') | ForEach-Object { "media/" + $_.Groups[1].Value } | Sort-Object -Unique)
}

function Expand-Vsix {
  param(
    [string]$VsixPath,
    [string]$DestinationRoot
  )

  if (Test-Path -LiteralPath $DestinationRoot) {
    Remove-Item -LiteralPath $DestinationRoot -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
  $zipPath = Join-Path $DestinationRoot "package.zip"
  Copy-Item -LiteralPath $VsixPath -Destination $zipPath -Force
  Expand-Archive -LiteralPath $zipPath -DestinationPath $DestinationRoot -Force
  Remove-Item -LiteralPath $zipPath -Force
}

$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$packageJsonPath = Join-Path $resolvedExtensionDir "package.json"
$readmePath = Join-Path $resolvedExtensionDir "README.md"
$ignorePath = Join-Path $resolvedExtensionDir ".vscodeignore"
$buildInfoPath = Join-Path $resolvedExtensionDir "build\runtime-build-info.json"
$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
$readmeAssets = Get-ReadmeAssetPaths -ReadmePath $readmePath
$activityBarIconPath = Join-Path $resolvedExtensionDir $packageJson.contributes.viewsContainers.activitybar[0].icon
$extensionIconPath = Join-Path $resolvedExtensionDir $packageJson.icon
$vsixPath = Join-Path $resolvedExtensionDir ("{0}-{1}.vsix" -f $packageJson.name, $packageJson.version)
$resultPath = if ($EvidencePath) { $EvidencePath } else { Join-Path $resolvedExtensionDir "test-evidence\leeway-extension-asset-check-result.json" }
$checks = New-Object System.Collections.Generic.List[object]

$checks.Add((New-AssetCheck -Name "extension icon exists" -Pass (Test-Path -LiteralPath $extensionIconPath) -Detail $extensionIconPath))
$checks.Add((New-AssetCheck -Name "activity bar icon exists" -Pass (Test-Path -LiteralPath $activityBarIconPath) -Detail $activityBarIconPath))
$checks.Add((New-AssetCheck -Name "activity bar icon uses svg" -Pass ($packageJson.contributes.viewsContainers.activitybar[0].icon -match '\.svg$') -Detail $packageJson.contributes.viewsContainers.activitybar[0].icon))
$checks.Add((New-AssetCheck -Name "build info exists" -Pass (Test-Path -LiteralPath $buildInfoPath) -Detail $buildInfoPath))

$missingReadmeAssets = @($readmeAssets | Where-Object { -not (Test-Path -LiteralPath (Join-Path $resolvedExtensionDir $_)) })
$checks.Add((New-AssetCheck -Name "README image assets exist" -Pass ($missingReadmeAssets.Count -eq 0) -Detail ("Missing README assets: " + ($missingReadmeAssets -join ", "))))

$ignoreText = Get-Content -LiteralPath $ignorePath -Raw
$excludedAssets = @($readmeAssets + @("media/agent-lee-activitybar-icon.svg", "README.md") | Where-Object {
  $pattern = [regex]::Escape($_).Replace('/', '[\\/]')
  $ignoreText -match "(?m)^$pattern$"
})
$checks.Add((New-AssetCheck -Name ".vscodeignore keeps required assets" -Pass ($excludedAssets.Count -eq 0) -Detail ("Excluded assets: " + ($excludedAssets -join ", "))))

$vsixChecks = @()
if (Test-Path -LiteralPath $vsixPath) {
  $scanRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("leeway-asset-check-" + [guid]::NewGuid().ToString("N"))
  Expand-Vsix -VsixPath $vsixPath -DestinationRoot $scanRoot
  $vsixRoot = Join-Path $scanRoot "extension"
  $vsixMissing = @($readmeAssets + @("media/agent-lee-activitybar-icon.svg", "README.md", "build/runtime-build-info.json", "out/extension.js") | Where-Object {
    -not (Test-Path -LiteralPath (Join-Path $vsixRoot $_))
  })
  $vsixChecks = @(
    (New-AssetCheck -Name "VSIX contains required assets" -Pass ($vsixMissing.Count -eq 0) -Detail ("Missing VSIX paths: " + ($vsixMissing -join ", ")))
  )
  Remove-Item -LiteralPath $scanRoot -Recurse -Force -ErrorAction SilentlyContinue
} else {
  $vsixChecks = @(
    (New-AssetCheck -Name "VSIX exists for asset inspection" -Pass $false -Detail $vsixPath)
  )
}

foreach ($check in $vsixChecks) {
  $checks.Add($check)
}

$failed = @($checks | Where-Object { -not $_.pass })
$result = [pscustomobject]@{
  timestamp = (Get-Date).ToString("o")
  extensionDir = $resolvedExtensionDir
  packageVersion = $packageJson.version
  readmeAssets = $readmeAssets
  checks = $checks
  passed = ($failed.Count -eq 0)
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $resultPath) | Out-Null
$result | ConvertTo-Json -Depth 8 | Out-File -LiteralPath $resultPath -Encoding utf8
Write-Host "Asset check evidence written to $resultPath" -ForegroundColor Green

if ($failed.Count -gt 0) {
  exit 1
}
