param(
  [string]$WorkspaceDir = (Join-Path $PSScriptRoot "..\.."),
  [string]$ExtensionDir,
  [string]$CodeCmdPath = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
  [string]$UserDataDir = (Join-Path $env:TEMP "agent-lee-vscode-profile"),
  [string]$ExtensionsDir = (Join-Path $env:TEMP "agent-lee-vscode-extensions"),
  [string]$OutputDir = (Join-Path (Join-Path $PSScriptRoot "..\..\reports") ("doctor-" + (Get-Date -Format "yyyyMMdd-HHmmss"))),
  [switch]$SkipBuild,
  [switch]$SkipPackage,
  [switch]$Install,
  [switch]$CheckOllama
)

$ErrorActionPreference = "Stop"

function New-Check {
  param(
    [string]$Name,
    [bool]$Pass,
    [string]$Detail = ""
  )

  [pscustomobject]@{
    name = $Name
    pass = $Pass
    detail = $Detail
  }
}

function Test-LeeWayCompliance {
  param([string]$Root)

  $extensions = @(".ts", ".js", ".ps1", ".json", ".md", ".txt")
  $ignoredSegments = "\\(node_modules|\.git|\.venv|out|logs|memory|reports|backups|patches|sandbox)\\"
  $files = Get-ChildItem -Path $Root -Recurse -File |
    Where-Object { $_.FullName -notmatch $ignoredSegments -and $extensions -contains $_.Extension }

  $inspected = 0
  $withHeader = 0
  $missing = @()

  foreach ($file in $files) {
    $text = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $text) {
      continue
    }

    $inspected++
    $hasHeader = $text -match "LEEWAY_HEADER" -or $text -match "LEEWAY HEADER"
    $hasRegion = $text -match "REGION:"
    $hasTag = $text -match "TAG:"
    $hasPipeline = $text -match "DISCOVERY_PIPELINE"

    if ($hasHeader -and $hasRegion -and $hasTag -and $hasPipeline) {
      $withHeader++
    } else {
      $missing += [pscustomobject]@{
        path = Resolve-Path -Relative $file.FullName
        header = $hasHeader
        region = $hasRegion
        tag = $hasTag
        discoveryPipeline = $hasPipeline
      }
    }
  }

  $score = 0
  if ($inspected -gt 0) {
    $score = [math]::Round(($withHeader / $inspected) * 100, 2)
  }

  [pscustomobject]@{
    inspected = $inspected
    compliant = $withHeader
    score = $score
    blocking = ($score -lt 70)
    missing = $missing
  }
}

$resolvedWorkspace = (Resolve-Path $WorkspaceDir).Path
$resolvedExtensionDir = & (Join-Path $PSScriptRoot "Resolve-AgentLeeExtension.ps1") -ExtensionDir $ExtensionDir
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$checks = New-Object System.Collections.Generic.List[object]
$checks.Add((New-Check "Extension folder exists" (Test-Path $resolvedExtensionDir) $resolvedExtensionDir))

$packagePath = Join-Path $resolvedExtensionDir "package.json"
$packageExists = Test-Path $packagePath
$checks.Add((New-Check "package.json exists" $packageExists $packagePath))

$package = $null
if ($packageExists) {
  $package = Get-Content $packagePath -Raw | ConvertFrom-Json
  $checks.Add((New-Check "main points to out/extension.js" ($package.main -eq "./out/extension.js") $package.main))
  $activityIcon = $package.contributes.viewsContainers.activitybar[0].icon
  $iconPath = Join-Path $resolvedExtensionDir $activityIcon
  $checks.Add((New-Check "Activity Bar icon exists" (Test-Path $iconPath) $activityIcon))
  $commands = @($package.contributes.commands | ForEach-Object { $_.command })
  $requiredCommands = @("agentLee.open", "agentLee.openSidebar", "agentLee.newChat", "agentLee.stopVoice")
  foreach ($command in $requiredCommands) {
    $checks.Add((New-Check "Command registered: $command" ($commands -contains $command)))
  }
}

if (-not $SkipBuild) {
  Push-Location $resolvedExtensionDir
  try {
    if (-not (Test-Path "node_modules")) {
      if (Test-Path "package-lock.json") {
        & npm.cmd ci
      } else {
        & npm.cmd install
      }
      $checks.Add((New-Check "Dependencies installed" ($LASTEXITCODE -eq 0)))
      if ($LASTEXITCODE -ne 0) {
        throw "Dependency install failed."
      }
    } else {
      $checks.Add((New-Check "Dependencies installed" $true "node_modules already exists"))
    }

    & npm.cmd run compile
    $checks.Add((New-Check "TypeScript compile succeeds" ($LASTEXITCODE -eq 0)))
    if ($LASTEXITCODE -ne 0) {
      throw "TypeScript compile failed."
    }
  }
  finally {
    Pop-Location
  }
}

$outPath = Join-Path $resolvedExtensionDir "out\extension.js"
$checks.Add((New-Check "out/extension.js exists" (Test-Path $outPath) $outPath))

$vsixPath = Join-Path $resolvedExtensionDir "agent-lee-1.1.0-sovereign-runtime.vsix"
if (-not $SkipPackage) {
  Push-Location $resolvedExtensionDir
  try {
    & npx.cmd @vscode/vsce package -o (Split-Path -Leaf $vsixPath)
    $checks.Add((New-Check "VSIX package builds" ($LASTEXITCODE -eq 0) $vsixPath))
    if ($LASTEXITCODE -ne 0) {
      throw "VSIX packaging failed."
    }
  }
  finally {
    Pop-Location
  }
}
$checks.Add((New-Check "VSIX file exists" (Test-Path $vsixPath) $vsixPath))

if ($Install) {
  $canInstall = (Test-Path $CodeCmdPath) -and (Test-Path $vsixPath)
  $checks.Add((New-Check "VS Code CLI exists" (Test-Path $CodeCmdPath) $CodeCmdPath))
  if ($canInstall) {
    & (Join-Path $PSScriptRoot "Install-AgentLeeVSIX.ps1") `
      -VsixPath $vsixPath `
      -CodeCmdPath $CodeCmdPath `
      -UserDataDir $UserDataDir `
      -ExtensionsDir $ExtensionsDir | Out-Null
    $checks.Add((New-Check "VSIX installs into isolated profile" ($LASTEXITCODE -eq 0) $ExtensionsDir))

    $installed = & $CodeCmdPath --extensions-dir $ExtensionsDir --list-extensions --show-versions
    $installedPath = Join-Path $OutputDir "installed-extensions.txt"
    $installed | Out-File $installedPath -Encoding utf8
    $checks.Add((New-Check "Agent Lee listed in isolated profile" (($installed -join "`n") -match "leeway\.agent-lee-leeway-coding-system") $installedPath))
  }
}

if ($CheckOllama) {
  try {
    $ollamaTags = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3
    $count = @($ollamaTags.models).Count
    $checks.Add((New-Check "Ollama API reachable" $true "$count model(s) reported"))
  } catch {
    $checks.Add((New-Check "Ollama API reachable" $false $_.Exception.Message))
  }
}

$compliance = Test-LeeWayCompliance -Root $resolvedWorkspace
$checks.Add((New-Check "LeeWay compliance above 70" (-not $compliance.blocking) "Score: $($compliance.score)"))

$report = [pscustomobject]@{
  generatedAt = (Get-Date).ToString("o")
  workspaceDir = $resolvedWorkspace
  extensionDir = $resolvedExtensionDir
  vsixPath = $vsixPath
  checks = $checks
  leewayCompliance = $compliance
}

$jsonPath = Join-Path $OutputDir "agent-lee-doctor.json"
$mdPath = Join-Path $OutputDir "AGENT_LEE_DOCTOR.md"
$report | ConvertTo-Json -Depth 8 | Out-File $jsonPath -Encoding utf8

$failed = @($checks | Where-Object { -not $_.pass })
$lines = @(
  "# Agent Lee Doctor Report",
  "",
  "- Generated: $($report.generatedAt)",
  "- Extension: ``$resolvedExtensionDir``",
  "- VSIX: ``$vsixPath``",
  "- Failed checks: $($failed.Count)",
  "- LeeWay compliance: $($compliance.score)%",
  "",
  "## Checks"
)

foreach ($check in $checks) {
  $status = if ($check.pass) { "PASS" } else { "FAIL" }
  $lines += "- [$status] $($check.name) $($check.detail)"
}

$lines += @(
  "",
  "## Compliance",
  "",
  "Inspected $($compliance.inspected) files; $($compliance.compliant) are fully marked with header, region, tag, and discovery pipeline."
)

if ($failed.Count -gt 0) {
  $lines += ""
  $lines += "## Blocking Items"
  foreach ($item in $failed) {
    $lines += "- $($item.name): $($item.detail)"
  }
}

$lines | Out-File $mdPath -Encoding utf8

Write-Host "Doctor report written to $mdPath" -ForegroundColor Green
$report
