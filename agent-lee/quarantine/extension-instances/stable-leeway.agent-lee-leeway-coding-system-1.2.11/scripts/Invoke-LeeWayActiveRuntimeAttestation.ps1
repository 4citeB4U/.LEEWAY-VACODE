<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.ACTIVE_RUNTIME_ATTESTATION
PURPOSE: Proves the active Agent Lee runtime across source, package, installed files, live host evidence, UI generation, runtime IDs, and split-brain conditions.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot ".."),
  [string]$EvidencePath
)

$ErrorActionPreference = "Stop"

function Read-JsonFile {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  try { return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json } catch { return $null }
}

function Read-TextFile {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  return Get-Content -LiteralPath $Path -Raw
}

function Get-HashSafe {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  try { return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash } catch { return "" }
}

function Get-LatestVersionedFile {
  param(
    [string]$Directory,
    [string]$Pattern
  )

  if (-not (Test-Path -LiteralPath $Directory)) { return $null }
  $matches = Get-ChildItem -LiteralPath $Directory -File -Filter $Pattern -ErrorAction SilentlyContinue
  if (-not $matches) { return $null }
  return $matches |
    ForEach-Object {
      $version = if ($_.BaseName -match '(\d+\.\d+\.\d+)$') { $Matches[1] } else { "0.0.0" }
      [pscustomobject]@{
        Path = $_.FullName
        Version = $version
        SortVersion = [version]$version
      }
    } |
    Sort-Object SortVersion -Descending |
    Select-Object -First 1
}

function Expand-VsixToTemp {
  param([string]$VsixPath)

  if (-not (Test-Path -LiteralPath $VsixPath)) { return $null }
  $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("leeway-active-runtime-" + [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
  $zipPath = Join-Path $tempRoot "package.zip"
  Copy-Item -LiteralPath $VsixPath -Destination $zipPath -Force
  Expand-Archive -LiteralPath $zipPath -DestinationPath $tempRoot -Force
  Remove-Item -LiteralPath $zipPath -Force
  return $tempRoot
}

function Get-ExtensionFolderEvidence {
  param(
    [string]$FolderPath,
    [string]$RootLabel,
    [string]$ActiveExtensionPath
  )

  $packageJsonPath = Join-Path $FolderPath "package.json"
  $package = Read-JsonFile -Path $packageJsonPath
  [pscustomobject]@{
    root = $RootLabel
    folderPath = $FolderPath
    version = [string]$package.version
    packageJsonPath = $packageJsonPath
    runtimeEntryHash = Get-HashSafe -Path (Join-Path $FolderPath "out\extension.js")
    mediaAssetHash = Get-HashSafe -Path (Join-Path $FolderPath "media\leeway-activity.svg")
    activeCandidate = ([string]$FolderPath -eq [string]$ActiveExtensionPath)
  }
}

function Get-RunningExtensionHostPids {
  try {
    return @(Get-CimInstance Win32_Process -Filter "Name = 'Code.exe'" |
      Where-Object { $_.CommandLine -like '*--type=utility*' -and $_.CommandLine -like '*node.mojom.NodeService*' } |
      Select-Object -ExpandProperty ProcessId)
  } catch {
    return @()
  }
}

function Get-LiveHostSelfAttestation {
  $candidatePaths = @(
    (Join-Path $env:APPDATA "Code\User\globalStorage\leeway.agent-lee-leeway-coding-system\live-host-attestation-current.json"),
    (Join-Path $env:APPDATA "Code - Insiders\User\globalStorage\leeway.agent-lee-leeway-coding-system\live-host-attestation-current.json"),
    (Join-Path $env:APPDATA "Antigravity\User\globalStorage\leeway.agent-lee-leeway-coding-system\live-host-attestation-current.json"),
    "C:\Users\Leona\.leeway-vscode\sandbox\runtime-host-userdata\User\globalStorage\leeway.agent-lee-leeway-coding-system\live-host-attestation-current.json"
  )

  foreach ($candidate in $candidatePaths) {
    if (-not (Test-Path -LiteralPath $candidate)) { continue }
    $json = Read-JsonFile -Path $candidate
    if ($json) {
      return [pscustomobject]@{
        path = $candidate
        data = $json
      }
    }
  }

  return $null
}

function Get-LiveExtensionHostLocator {
  param(
    [string]$ResolvedExtensionDir,
    [string]$EvidenceDir
  )

  $attestation = Get-LiveHostSelfAttestation
  $activeExtensionPath = if ($attestation) { [string]$attestation.data.extensionPath } else { "" }
  $runningPids = @(Get-RunningExtensionHostPids)
  $stableRoot = Join-Path $env:USERPROFILE ".vscode\extensions"
  $insidersRoot = Join-Path $env:USERPROFILE ".vscode-insiders\extensions"
  $antigravityRoot = Join-Path $env:USERPROFILE ".antigravity\extensions"
  $workspaceRoot = Join-Path (Split-Path (Split-Path $ResolvedExtensionDir -Parent) -Parent) ".vscode\extensions"

  $discovered = New-Object System.Collections.Generic.List[object]
  foreach ($rootInfo in @(
    @{ label = "stable-user"; path = $stableRoot },
    @{ label = "insiders-user"; path = $insidersRoot },
    @{ label = "antigravity"; path = $antigravityRoot },
    @{ label = "workspace"; path = $workspaceRoot }
  )) {
    if (-not (Test-Path -LiteralPath $rootInfo.path)) { continue }
    Get-ChildItem -LiteralPath $rootInfo.path -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -like "leeway.agent-lee-leeway-coding-system-*" } |
      ForEach-Object {
        $discovered.Add((Get-ExtensionFolderEvidence -FolderPath $_.FullName -RootLabel $rootInfo.label -ActiveExtensionPath $activeExtensionPath))
      }
  }
  $discovered.Add((Get-ExtensionFolderEvidence -FolderPath $ResolvedExtensionDir -RootLabel "repo-source" -ActiveExtensionPath $activeExtensionPath))

  $activationLogs = New-Object System.Collections.Generic.List[object]
  $logRoots = @(
    (Join-Path $env:APPDATA "Code\logs"),
    "C:\Users\Leona\.leeway-vscode\sandbox\runtime-host-userdata\logs"
  ) | Where-Object { Test-Path -LiteralPath $_ }
  foreach ($logRoot in $logRoots) {
    Get-ChildItem -LiteralPath $logRoot -Recurse -File -Filter "exthost.log" -ErrorAction SilentlyContinue | ForEach-Object {
      $content = Get-Content -LiteralPath $_.FullName -Raw
      if ($content -notmatch 'ExtensionService#_doActivateExtension leeway\.agent-lee-leeway-coding-system') { return }
      $pidMatch = [regex]::Match($content, 'Extension host with pid (\d+) started')
      $timeMatch = [regex]::Matches($content, '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+) \[info\] ExtensionService#_doActivateExtension leeway\.agent-lee-leeway-coding-system') | Select-Object -Last 1
      $pathMatch = [regex]::Matches($content, '([A-Za-z]:\\[^\r\n]*leeway\.agent-lee-leeway-coding-system-[0-9\.]+\\out\\extension\.js)') | Select-Object -Last 1
      $activationLogs.Add([pscustomobject]@{
        logPath = $_.FullName
        processId = if ($pidMatch.Success) { [int]$pidMatch.Groups[1].Value } else { 0 }
        running = if ($pidMatch.Success) { $runningPids -contains [int]$pidMatch.Groups[1].Value } else { $false }
        activatedAt = if ($timeMatch.Success) { $timeMatch.Groups[1].Value } else { "" }
        extensionPath = if ($pathMatch.Success) { Split-Path -Parent (Split-Path -Parent $pathMatch.Groups[1].Value) } else { "" }
      })
    }
  }

  $activeLog = $activationLogs |
    Sort-Object @{ Expression = { if ($_.running) { 0 } else { 1 } } }, @{ Expression = { $_.activatedAt }; Descending = $true } |
    Select-Object -First 1

  if (-not $activeExtensionPath -and $activeLog) {
    $activeExtensionPath = [string]$activeLog.extensionPath
  }

  $discoveredFolders = @($discovered.ToArray())
  $activationLogEntries = @($activationLogs.ToArray())
  $activeExtensionHostVersion = if ($attestation) { [string]$attestation.data.packageVersion } else { "" }
  $activeExtensionHostLogPath = if ($activeLog) { [string]$activeLog.logPath } else { "" }
  $liveHostAttestationPath = if ($attestation) { [string]$attestation.path } else { "" }
  $duplicateExtensionFoldersDetected = (@($discoveredFolders | Where-Object { $_.root -ne "repo-source" }).Count -gt 1)

  $locator = [pscustomobject]@{
    generatedAt = (Get-Date).ToString("o")
    allDiscoveredExtensionFolders = $discoveredFolders
    activationLogs = $activationLogEntries
    activeExtensionHostPath = $activeExtensionPath
    activeExtensionHostVersion = $activeExtensionHostVersion
    activeExtensionHostLogPath = $activeExtensionHostLogPath
    duplicateExtensionFoldersDetected = $duplicateExtensionFoldersDetected
    liveHostAttestationPath = $liveHostAttestationPath
    liveHostAttestationPresent = [bool]$attestation
    runningExtensionHostPids = @($runningPids)
    finalVerdict = if ($activeExtensionPath -and $attestation) { "PASS" } else { "FAIL" }
  }

  $locatorPath = Join-Path $EvidenceDir "leeway-live-extension-host-locator-result.json"
  $locator | ConvertTo-Json -Depth 10 | Out-File -LiteralPath $locatorPath -Encoding utf8
  return $locator
}

function Get-LiveHostActivationEvidence {
  $logsRoot = Join-Path $env:APPDATA "Code\logs"
  if (-not (Test-Path -LiteralPath $logsRoot)) {
    return [pscustomobject]@{
      version = ""
      path = ""
      status = "unknown"
      activatedAt = ""
      logPath = ""
      error = "VS Code logs root not found."
    }
  }

  $logFile = Get-ChildItem -LiteralPath $logsRoot -Recurse -Filter "exthost.log" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $logFile) {
    return [pscustomobject]@{
      version = ""
      path = ""
      status = "unknown"
      activatedAt = ""
      logPath = ""
      error = "No exthost.log file found."
    }
  }

  $content = Get-Content -LiteralPath $logFile.FullName -Raw
  $pathMatch = [regex]::Matches($content, '([A-Za-z]:\\Users\\Leona\\\.vscode\\extensions\\leeway\.agent-lee-leeway-coding-system-\d+\.\d+\.\d+\\out\\extension\.js)') | Select-Object -Last 1
  $versionMatch = [regex]::Matches($content, 'leeway\.agent-lee-leeway-coding-system-(\d+\.\d+\.\d+)\\out\\extension\.js') | Select-Object -Last 1
  $timestampMatch = [regex]::Matches($content, '(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z).+leeway\.agent-lee-leeway-coding-system-\d+\.\d+\.\d+\\out\\extension\.js') | Select-Object -Last 1
  $errorMatch = [regex]::Matches($content, 'Activating extension leeway\.agent-lee-leeway-coding-system failed due to an error:\s*[\r\n]+[^\r\n]+') | Select-Object -Last 1

  [pscustomobject]@{
    version = if ($versionMatch.Success) { $versionMatch.Groups[1].Value } else { "" }
    path = if ($pathMatch.Success) { $pathMatch.Groups[1].Value } else { "" }
    status = if ($errorMatch.Success) { "failed" } elseif ($versionMatch.Success) { "activated" } else { "unknown" }
    activatedAt = if ($timestampMatch.Success) { $timestampMatch.Groups[1].Value } else { "" }
    logPath = $logFile.FullName
    error = if ($errorMatch.Success) { $errorMatch.Value.Trim() } else { "" }
  }
}

function Get-LatestUiGenerationEvidence {
  param([string]$EvidenceDir)

  $candidates = @(
    (Join-Path $EvidenceDir "ui-live-test-result.json"),
    (Join-Path $EvidenceDir "deep-ui-installed-no-browser-speech-result.json"),
    (Join-Path $EvidenceDir "runtime-truth-webview-button-bridge-result.json"),
    (Join-Path $EvidenceDir "runtime-truth-live-voice-audible-output-result.json")
  ) | Where-Object { Test-Path -LiteralPath $_ }

  foreach ($candidate in ($candidates | Sort-Object { (Get-Item $_).LastWriteTimeUtc } -Descending)) {
    $json = Read-JsonFile -Path $candidate
    if ($null -eq $json) { continue }
    foreach ($message in @($json.consoleMessages)) {
      if ([string]$message -match 'UI version:\s*(.+)$') {
        return [pscustomobject]@{
          uiGenerationId = $Matches[1].Trim()
          evidencePath = $candidate
        }
      }
    }
  }

  return [pscustomobject]@{
    uiGenerationId = ""
    evidencePath = ""
  }
}

$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$evidenceDir = Join-Path $resolvedExtensionDir "test-evidence"
$resultPath = if ($EvidencePath) { $EvidencePath } else { Join-Path $evidenceDir "leeway-active-runtime-attestation-result.json" }
$packageJson = Read-JsonFile -Path (Join-Path $resolvedExtensionDir "package.json")
$buildInfo = Read-JsonFile -Path (Join-Path $resolvedExtensionDir "build\runtime-build-info.json")
$installedCheck = Read-JsonFile -Path (Join-Path $evidenceDir "leeway-installed-extension-check-result.json")
$runtimeCheck = Read-JsonFile -Path (Join-Path $evidenceDir "leeway-extension-runtime-check-result.json")
$liveValidation = Read-JsonFile -Path (Join-Path $evidenceDir "leeway-extension-live-visual-validation-result.json")
$uiEvidence = Get-LatestUiGenerationEvidence -EvidenceDir $evidenceDir
$locator = Get-LiveExtensionHostLocator -ResolvedExtensionDir $resolvedExtensionDir -EvidenceDir $evidenceDir
$liveHostAttestation = Get-LiveHostSelfAttestation
$liveHost = if ($liveHostAttestation) {
  [pscustomobject]@{
    version = [string]$liveHostAttestation.data.packageVersion
    path = [string]$liveHostAttestation.data.extensionPath
    status = "activated"
    activatedAt = [string]$liveHostAttestation.data.activationTimestamp
    logPath = [string]$locator.activeExtensionHostLogPath
    error = ""
  }
} else {
  Get-LiveHostActivationEvidence
}
$latestVsix = Get-LatestVersionedFile -Directory $resolvedExtensionDir -Pattern "*.vsix"
$vsixExtractRoot = if ($latestVsix) { Expand-VsixToTemp -VsixPath $latestVsix.Path } else { $null }
$vsixBuildInfo = if ($vsixExtractRoot) { Read-JsonFile -Path (Join-Path $vsixExtractRoot "extension\build\runtime-build-info.json") } else { $null }
$vsixRuntimeHash = if ($vsixExtractRoot) { Get-HashSafe -Path (Join-Path $vsixExtractRoot "extension\out\extension.js") } else { "" }
$sourceVersion = [string]$buildInfo.packageVersion
$packageVersion = [string]$packageJson.version
$latestVsixVersion = if ($latestVsix) { [string]$latestVsix.Version } else { "" }
$installedVersion = [string]$installedCheck.installedVersion
$liveHostVersion = [string]$liveHost.version
$runtimeBuildHash = Get-HashSafe -Path (Join-Path $resolvedExtensionDir "out\extension.js")
$installedRuntimeHash = [string]$installedCheck.installedRuntimeHash
$liveBuildHash = if ($liveHostAttestation) { [string]$liveHostAttestation.data.buildHash } else { "" }
$liveUiGenerationId = if ($liveHostAttestation) { [string]$liveHostAttestation.data.uiGenerationId } else { [string]$uiEvidence.uiGenerationId }
$liveRuntimeSourceMode = if ($liveHostAttestation) { [string]$liveHostAttestation.data.runtimeSourceMode } else { "" }
$staleRuntimeDetected = [bool](
  [bool]$installedCheck.staleDetected -or
  [bool]$runtimeCheck.staleDetected -or
  [bool]$liveValidation.staleRuntimeDetected -or
  ($liveRuntimeSourceMode -eq "SOURCE_STALE_VSIX")
)
$splitBrainDetected = [bool](
  $staleRuntimeDetected -or
  ($sourceVersion -and $packageVersion -and $sourceVersion -ne $packageVersion) -or
  ($sourceVersion -and $latestVsixVersion -and $sourceVersion -ne $latestVsixVersion) -or
  ($sourceVersion -and $installedVersion -and $sourceVersion -ne $installedVersion) -or
  ($installedVersion -and $liveHostVersion -and $installedVersion -ne $liveHostVersion) -or
  ($runtimeBuildHash -and $installedRuntimeHash -and $runtimeBuildHash -ne $installedRuntimeHash) -or
  ($runtimeBuildHash -and $vsixRuntimeHash -and $runtimeBuildHash -ne $vsixRuntimeHash) -or
  ($runtimeBuildHash -and $liveBuildHash -and $runtimeBuildHash -ne $liveBuildHash)
)

$checks = @(
  [pscustomobject]@{ name = "source and package version agree"; pass = ($sourceVersion -and $packageVersion -and $sourceVersion -eq $packageVersion) },
  [pscustomobject]@{ name = "source and latest VSIX version agree"; pass = ($sourceVersion -and $latestVsixVersion -and $sourceVersion -eq $latestVsixVersion) },
  [pscustomobject]@{ name = "source and installed version agree"; pass = ($sourceVersion -and $installedVersion -and $sourceVersion -eq $installedVersion) },
  [pscustomobject]@{ name = "installed and live host version agree"; pass = ($installedVersion -and $liveHostVersion -and $installedVersion -eq $liveHostVersion) },
  [pscustomobject]@{ name = "source and VSIX build hashes agree"; pass = ($runtimeBuildHash -and $vsixRuntimeHash -and $runtimeBuildHash -eq $vsixRuntimeHash) },
  [pscustomobject]@{ name = "runtime hashes agree"; pass = ($runtimeBuildHash -and $installedRuntimeHash -and $runtimeBuildHash -eq $installedRuntimeHash) },
  [pscustomobject]@{ name = "live host build hash agrees"; pass = ($runtimeBuildHash -and $liveBuildHash -and $runtimeBuildHash -eq $liveBuildHash) },
  [pscustomobject]@{ name = "UI generation agrees across live host"; pass = ([string]$buildInfo.uiGenerationId -and $liveUiGenerationId -and [string]$buildInfo.uiGenerationId -eq $liveUiGenerationId) },
  [pscustomobject]@{ name = "live host path is known"; pass = [bool]([string]$liveHost.path) },
  [pscustomobject]@{ name = "live host attestation is present"; pass = [bool]$liveHostAttestation },
  [pscustomobject]@{ name = "duplicate extension folders are not active blockers"; pass = (-not [bool]$locator.duplicateExtensionFoldersDetected) -or [bool]$liveHostAttestation },
  [pscustomobject]@{ name = "stale runtime not detected"; pass = (-not $staleRuntimeDetected) },
  [pscustomobject]@{ name = "split-brain not detected"; pass = (-not $splitBrainDetected) }
)

$status = if ($checks.Where({ -not $_.pass }).Count -eq 0) { "PASS" } else { "FAIL" }

$result = [pscustomobject]@{
  gate = "LEEWAY_ACTIVE_RUNTIME_ATTESTATION"
  generatedAt = (Get-Date).ToString("o")
  status = $status
  sourceVersion = $sourceVersion
  packageJsonVersion = $packageVersion
  latestVsixVersion = $latestVsixVersion
  latestVsixPath = if ($latestVsix) { $latestVsix.Path } else { "" }
  latestVsixBuildHash = $vsixRuntimeHash
  installedExtensionVersion = $installedVersion
  liveExtensionHostVersion = $liveHostVersion
  liveExtensionHostPath = [string]$liveHost.path
  liveExtensionHostStatus = [string]$liveHost.status
  liveUiGenerationId = $liveUiGenerationId
  liveUiGenerationEvidencePath = [string]$uiEvidence.evidencePath
  runtimeBuildHash = $runtimeBuildHash
  installedRuntimeHash = $installedRuntimeHash
  liveExtensionHostBuildHash = $liveBuildHash
  liveRuntimeSourceMode = $liveRuntimeSourceMode
  extensionActivationTimestamp = [string]$liveHost.activatedAt
  statusBarRuntimeId = [string]$buildInfo.statusBarRuntimeId
  chatWebviewRuntimeId = [string]$buildInfo.chatWebviewRuntimeId
  chatUiRuntimeId = if ($liveHostAttestation) { [string]$liveHostAttestation.data.chatUiRuntimeId } else { [string]$buildInfo.chatWebviewRuntimeId }
  readmeRuntimeId = [string]$buildInfo.readmeRuntimeId
  voiceRuntimeId = [string]$buildInfo.voiceRuntimeId
  staleRuntimeDetected = $staleRuntimeDetected
  splitBrainDetected = $splitBrainDetected
  liveHostSelfAttestationPath = if ($liveHostAttestation) { [string]$liveHostAttestation.path } else { "" }
  locatorEvidencePath = (Join-Path $evidenceDir "leeway-live-extension-host-locator-result.json")
  liveVisualVerdict = [string]$liveValidation.finalVerdict
  installedRuntimeVerdict = [string]$installedCheck.finalVerdict
  checks = $checks
  sources = [pscustomobject]@{
    buildInfo = (Join-Path $resolvedExtensionDir "build\runtime-build-info.json")
    installedCheck = (Join-Path $evidenceDir "leeway-installed-extension-check-result.json")
    runtimeCheck = (Join-Path $evidenceDir "leeway-extension-runtime-check-result.json")
    liveVisualValidation = (Join-Path $evidenceDir "leeway-extension-live-visual-validation-result.json")
    liveHostLog = [string]$liveHost.logPath
    liveHostSelfAttestation = if ($liveHostAttestation) { [string]$liveHostAttestation.path } else { "" }
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $resultPath) | Out-Null
$result | ConvertTo-Json -Depth 8 | Out-File -LiteralPath $resultPath -Encoding utf8
Write-Host "Active runtime attestation written to $resultPath" -ForegroundColor Green

if ($vsixExtractRoot -and (Test-Path -LiteralPath $vsixExtractRoot)) {
  Remove-Item -LiteralPath $vsixExtractRoot -Recurse -Force -ErrorAction SilentlyContinue
}

if ($status -eq "FAIL") { exit 1 }
