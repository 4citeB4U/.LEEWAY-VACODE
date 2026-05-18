<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.INCIDENT_CLOSURE_GATE
PURPOSE: Runs the LeeWay runtime incident closure sequence and returns PASS, PARTIAL, or FAIL only when critical runtime surfaces agree.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot ".."),
  [string]$EvidencePath
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Name,
    [string]$ScriptPath,
    [string]$ExtensionDir,
    [switch]$NoExtensionDir
  )

  if ($NoExtensionDir) {
    $null = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ScriptPath
  } else {
    $null = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ScriptPath -ExtensionDir $ExtensionDir
  }
  $exitCode = if ($null -ne $LASTEXITCODE) { [int]$LASTEXITCODE } else { 0 }
  [pscustomobject]@{
    name = $Name
    script = $ScriptPath
    exitCode = $exitCode
    pass = ($exitCode -eq 0)
  }
}

$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$evidenceDir = Join-Path $resolvedExtensionDir "test-evidence"
$resultPath = if ($EvidencePath) { $EvidencePath } else { Join-Path $evidenceDir "leeway-runtime-incident-closure-result.json" }

$steps = @(
  @{ name = "active runtime attestation"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayActiveRuntimeAttestation.ps1") },
  @{ name = "evidence consistency check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayEvidenceConsistencyCheck.ps1") },
  @{ name = "installed extension check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayInstalledExtensionCheck.ps1") },
  @{ name = "identity graph gate"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayApplicationIdentityGraphGate.ps1") },
  @{ name = "asset registry check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayAssetRegistryCheck.ps1") },
  @{ name = "live visual check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayExtensionLiveVisualValidation.ps1") },
  @{ name = "README live proof"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayReadmeLiveProof.ps1") },
  @{ name = "command runtime health check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayExtensionRuntimeCheck.ps1") },
  @{ name = "simple prompt fast-lane check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWaySimplePromptFastLaneCheck.ps1") },
  @{ name = "voice route check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayApplicationIntegrityGate.ps1") },
  @{ name = "transcript bridge check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayVoiceBridgeCheck.ps1"); noExtensionDir = $true },
  @{ name = "human-audible voice proof check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayVoiceLiveValidation.ps1") },
  @{ name = "update channel truth check"; script = (Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayUpdateChannelTruthCheck.ps1") }
)

$results = foreach ($step in $steps) {
  Invoke-Step -Name $step.name -ScriptPath $step.script -ExtensionDir $resolvedExtensionDir -NoExtensionDir:([bool]$step.noExtensionDir)
}

$activeRuntime = Get-Content -LiteralPath (Join-Path $evidenceDir "leeway-active-runtime-attestation-result.json") -Raw | ConvertFrom-Json
$evidenceConsistency = Get-Content -LiteralPath (Join-Path $evidenceDir "leeway-evidence-consistency-result.json") -Raw | ConvertFrom-Json
$readmeProof = Get-Content -LiteralPath (Join-Path $evidenceDir "leeway-readme-live-proof-result.json") -Raw | ConvertFrom-Json
$voiceLiveValidation = if (Test-Path -LiteralPath (Join-Path $evidenceDir "leeway-voice-live-validation-result.json")) {
  Get-Content -LiteralPath (Join-Path $evidenceDir "leeway-voice-live-validation-result.json") -Raw | ConvertFrom-Json
} else { $null }

$failedCritical = @($results | Where-Object { -not $_.pass -and $_.name -notin @("README live proof", "human-audible voice proof check") })
$partialAllowed = @()
if ($readmeProof -and [string]$readmeProof.finalVerdict -eq "PARTIAL") { $partialAllowed += "README live proof" }
if ($voiceLiveValidation -and [string]$voiceLiveValidation.humanAudibleTruth -eq "PARTIAL") { $partialAllowed += "human-audible voice proof check" }

$finalVerdict = if ($failedCritical.Count -gt 0 -or [bool]$activeRuntime.splitBrainDetected -or [string]$evidenceConsistency.status -eq "FAIL") {
  "FAIL"
} elseif ($partialAllowed.Count -gt 0) {
  "PARTIAL"
} else {
  "PASS"
}

$result = [pscustomobject]@{
  gate = "LEEWAY_RUNTIME_INCIDENT_CLOSURE"
  generatedAt = (Get-Date).ToString("o")
  finalVerdict = $finalVerdict
  steps = $results
  splitBrainDetected = [bool]$activeRuntime.splitBrainDetected
  staleRuntimeDetected = [bool]$activeRuntime.staleRuntimeDetected
  evidenceConsistencyStatus = [string]$evidenceConsistency.status
  partialAllowed = $partialAllowed
  failedCritical = @($failedCritical.name)
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $resultPath) | Out-Null
$result | ConvertTo-Json -Depth 8 | Out-File -LiteralPath $resultPath -Encoding utf8
Write-Host "Runtime incident closure result written to $resultPath" -ForegroundColor Green

if ($finalVerdict -eq "FAIL") { exit 1 }
