<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.APPLICATION_INTEGRITY_GATE
PURPOSE: Runs the reusable LeeWay application integrity gate and writes a consolidated evidence report.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot ".."),
  [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path,
  [switch]$SkipPlaybackGate
)

$ErrorActionPreference = "Stop"

function New-GateCheck {
  param(
    [string]$Name,
    [bool]$Pass,
    [string]$Detail = "",
    [string]$EvidencePath = ""
  )

  [pscustomobject]@{
    name = $Name
    pass = $Pass
    detail = $Detail
    evidencePath = $EvidencePath
  }
}

function Invoke-GateCommand {
  param(
    [string]$Name,
    [string]$FilePath,
    [string[]]$ArgumentList,
    [string]$WorkingDirectory,
    [string]$EvidencePath
  )

  $outputLines = New-Object System.Collections.Generic.List[string]
  $exitCode = 0
  $stdoutPath = [System.IO.Path]::GetTempFileName()
  $stderrPath = [System.IO.Path]::GetTempFileName()
  try {
    $process = Start-Process `
      -FilePath $FilePath `
      -ArgumentList $ArgumentList `
      -WorkingDirectory $WorkingDirectory `
      -RedirectStandardOutput $stdoutPath `
      -RedirectStandardError $stderrPath `
      -Wait `
      -PassThru `
      -NoNewWindow
    $exitCode = [int]$process.ExitCode
    foreach ($path in @($stdoutPath, $stderrPath)) {
      if (Test-Path -LiteralPath $path) {
        $captured = Get-Content -LiteralPath $path -ErrorAction SilentlyContinue
        if ($captured) {
          foreach ($line in @($captured)) {
            $outputLines.Add([string]$line)
          }
        }
      }
    }
  } catch {
    $exitCode = 1
    $outputLines.Add($_.Exception.Message)
  } finally {
    foreach ($path in @($stdoutPath, $stderrPath)) {
      if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
      }
    }
  }

  $evidenceDir = Split-Path -Parent $EvidencePath
  New-Item -ItemType Directory -Force -Path $evidenceDir | Out-Null
  $outputLines | Out-File -LiteralPath $EvidencePath -Encoding utf8

  [pscustomobject]@{
    check = New-GateCheck -Name $Name -Pass ($exitCode -eq 0) -Detail ("Exit code: " + $exitCode) -EvidencePath $EvidencePath
    output = $outputLines
    exitCode = $exitCode
  }
}

function Get-JsonFileSafely {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  try {
    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Get-WebviewCommandAudit {
  param([string]$ExtensionSourcePath)

  $content = Get-Content -LiteralPath $ExtensionSourcePath -Raw
  $emitRegex = 'vscode\.postMessage\(\s*\{[^{}]*command\s*:\s*"([^"]+)"'
  $handleRegexes = @(
    'msg\.command\s*===\s*"([^"]+)"',
    'case\s+"([^"]+)"'
  )

  $emitted = New-Object System.Collections.Generic.HashSet[string]
  foreach ($match in [regex]::Matches($content, $emitRegex, [System.Text.RegularExpressions.RegexOptions]::Singleline)) {
    [void]$emitted.Add($match.Groups[1].Value)
  }

  $handled = New-Object System.Collections.Generic.HashSet[string]
  foreach ($regexPattern in $handleRegexes) {
    foreach ($match in [regex]::Matches($content, $regexPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)) {
      [void]$handled.Add($match.Groups[1].Value)
    }
  }

  $ignoredCommands = @(
    "setState",
    "refreshRuntime",
    "agentVmDiagnosticEvent",
    "approvePluginCall",
    "cancelPluginCall",
    "agentLeeUiReady"
  )

  $missing = @(
    $emitted |
      Where-Object { $_ -and ($_ -notin $ignoredCommands) -and (-not $handled.Contains($_)) } |
      Sort-Object -Unique
  )

  [pscustomobject]@{
    emitted = @($emitted | Sort-Object)
    handled = @($handled | Sort-Object)
    missing = $missing
    pass = ($missing.Count -eq 0)
  }
}

function Expand-VsixForScan {
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

function Get-VsixIntegrityAudit {
  param(
    [string]$ExtractedRoot
  )

  $files = Get-ChildItem -LiteralPath $ExtractedRoot -Recurse -File | ForEach-Object {
    $_.FullName.Substring($ExtractedRoot.Length).TrimStart("\", "/").Replace("\", "/")
  }

  $blockedPatterns = @(
    '(^|/)test-evidence(/|$)',
    '(^|/)_vsix_inspect(/|$)',
    '(^|/)\.vscode(/|$)',
    '(^|/)extract_html\.js$',
    '(^|/)run_get_html\.js$',
    '(^|/)ui-debug\.png$',
    '(^|/)ui-live-test-proof\.png$',
    '(^|/)ui-live-test-result\.json$',
    '(^|/)out/plugins/adapters/gmail\.adapter\.js(\.map)?$',
    '(^|/)out/plugins/adapters/huggingface\.adapter\.js(\.map)?$',
    '(^|/)out/plugins/adapters/vercel\.adapter\.js(\.map)?$'
  )

  $hits = New-Object System.Collections.Generic.List[string]
  foreach ($relativePath in $files) {
    foreach ($pattern in $blockedPatterns) {
      if ($relativePath -match $pattern) {
        $hits.Add($relativePath)
        break
      }
    }
  }

  [pscustomobject]@{
    pass = ($hits.Count -eq 0)
    hits = @($hits | Sort-Object -Unique)
    fileCount = @($files).Count
  }
}

$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$packageJsonPath = Join-Path $resolvedExtensionDir "package.json"
$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
$extensionSourcePath = Join-Path $resolvedExtensionDir "src\extension.ts"
$testEvidenceDir = Join-Path $resolvedExtensionDir "test-evidence"
$reportPath = Join-Path $testEvidenceDir "leeway-application-integrity-result.json"
$receiptDir = Join-Path $WorkspaceRoot "agent-lee\receipts"
$receiptPath = Join-Path $receiptDir ("leeway_application_integrity_gate_" + (Get-Date -Format "yyyy-MM-dd_HHmmss") + ".md")
$doctorScriptPath = Join-Path $WorkspaceRoot "agent-lee\scripts\Invoke-AgentLeeDoctor.ps1"
$identityGraphScriptPath = Join-Path $resolvedExtensionDir "scripts\Invoke-LeeWayApplicationIdentityGraphGate.ps1"
$doctorOutputRoot = Join-Path $WorkspaceRoot "reports\Doctor"
$vsixPath = Join-Path $resolvedExtensionDir ("{0}-{1}.vsix" -f $packageJson.name, $packageJson.version)
$vsixScanRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("leeway-vsix-scan-" + [guid]::NewGuid().ToString("N"))

New-Item -ItemType Directory -Force -Path $testEvidenceDir | Out-Null
New-Item -ItemType Directory -Force -Path $receiptDir | Out-Null

$checks = New-Object System.Collections.Generic.List[object]
$commandEvidence = @{}

$compileRun = Invoke-GateCommand `
  -Name "npm run compile" `
  -FilePath "npm.cmd" `
  -ArgumentList @("run", "compile") `
  -WorkingDirectory $resolvedExtensionDir `
  -EvidencePath (Join-Path $testEvidenceDir "leeway-application-integrity-compile.log")
$checks.Add($compileRun.check)
$commandEvidence.compileLog = $compileRun.check.evidencePath
if (-not $compileRun.check.pass) {
  throw "Integrity gate stopped: compile failed."
}

$runtimeSmokeRun = Invoke-GateCommand `
  -Name "runtime-smoke-voice-provider-harness" `
  -FilePath "node.exe" `
  -ArgumentList @("test-evidence/runtime-smoke-voice-provider-harness.cjs") `
  -WorkingDirectory $resolvedExtensionDir `
  -EvidencePath (Join-Path $testEvidenceDir "leeway-application-integrity-runtime-smoke.log")
$checks.Add($runtimeSmokeRun.check)
$commandEvidence.runtimeSmokeLog = $runtimeSmokeRun.check.evidencePath

$hostRouterRun = Invoke-GateCommand `
  -Name "lavr-host-router-dynamic-harness" `
  -FilePath "node.exe" `
  -ArgumentList @("test-evidence/lavr-host-router-dynamic-harness.cjs") `
  -WorkingDirectory $resolvedExtensionDir `
  -EvidencePath (Join-Path $testEvidenceDir "leeway-application-integrity-host-router.log")
$checks.Add($hostRouterRun.check)
$commandEvidence.hostRouterLog = $hostRouterRun.check.evidencePath

if (-not $SkipPlaybackGate) {
  $playbackRun = Invoke-GateCommand `
    -Name "lavr-playback-gate-dynamic-harness" `
    -FilePath "node.exe" `
    -ArgumentList @("test-evidence/lavr-playback-gate-dynamic-harness.cjs") `
    -WorkingDirectory $resolvedExtensionDir `
    -EvidencePath (Join-Path $testEvidenceDir "leeway-application-integrity-playback.log")
  $checks.Add($playbackRun.check)
  $commandEvidence.playbackLog = $playbackRun.check.evidencePath
}

$packageRun = Invoke-GateCommand `
  -Name "npx vsce package --allow-star-activation" `
  -FilePath "npx.cmd" `
  -ArgumentList @("@vscode/vsce", "package", "--allow-star-activation", "-o", (Split-Path -Leaf $vsixPath)) `
  -WorkingDirectory $resolvedExtensionDir `
  -EvidencePath (Join-Path $testEvidenceDir "leeway-application-integrity-package.log")
$checks.Add($packageRun.check)
$commandEvidence.packageLog = $packageRun.check.evidencePath

$vsixExists = Test-Path -LiteralPath $vsixPath
$checks.Add((New-GateCheck -Name "VSIX exists after packaging" -Pass $vsixExists -Detail $vsixPath -EvidencePath $vsixPath))

if ($vsixExists) {
  $vsixAudit = $null
  $vsixAuditPath = Join-Path $testEvidenceDir "leeway-application-integrity-vsix-scan.json"
  try {
    New-Item -ItemType Directory -Force -Path $vsixScanRoot | Out-Null
    Expand-VsixForScan -VsixPath $vsixPath -DestinationRoot $vsixScanRoot
    $vsixAudit = Get-VsixIntegrityAudit -ExtractedRoot $vsixScanRoot
  } finally {
    if (Test-Path -LiteralPath $vsixScanRoot) {
      Remove-Item -LiteralPath $vsixScanRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
  $vsixAudit | ConvertTo-Json -Depth 6 | Out-File -LiteralPath $vsixAuditPath -Encoding utf8
  $checks.Add((New-GateCheck -Name "VSIX stale artifact and cloud-provider leakage scan" -Pass $vsixAudit.pass -Detail ("Hits: " + $vsixAudit.hits.Count + "; Files: " + $vsixAudit.fileCount) -EvidencePath $vsixAuditPath))
} else {
  $checks.Add((New-GateCheck -Name "VSIX stale artifact and cloud-provider leakage scan" -Pass $false -Detail "Skipped because VSIX was not produced."))
}

$commandAudit = Get-WebviewCommandAudit -ExtensionSourcePath $extensionSourcePath
$commandAuditPath = Join-Path $testEvidenceDir "leeway-application-integrity-command-audit.json"
$commandAudit | ConvertTo-Json -Depth 6 | Out-File -LiteralPath $commandAuditPath -Encoding utf8
$checks.Add((New-GateCheck -Name "command emitted-vs-handled audit" -Pass $commandAudit.pass -Detail ("Missing handlers: " + $commandAudit.missing.Count) -EvidencePath $commandAuditPath))

$identityGraphResultPath = Join-Path $testEvidenceDir "leeway-application-identity-graph-result.json"
$identityGraphRun = Invoke-GateCommand `
  -Name "identity graph gate" `
  -FilePath "powershell.exe" `
  -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $identityGraphScriptPath,
    "-ExtensionDir", $resolvedExtensionDir,
    "-WorkspaceRoot", $WorkspaceRoot,
    "-EvidencePath", $identityGraphResultPath
  ) `
  -WorkingDirectory $resolvedExtensionDir `
  -EvidencePath (Join-Path $testEvidenceDir "leeway-application-integrity-identity-graph.log")
$commandEvidence.identityGraphLog = $identityGraphRun.check.evidencePath
$identityGraphResult = Get-JsonFileSafely -Path $identityGraphResultPath
$identityGraphPass = $false
$identityGraphDetail = "Identity graph result not found."
if ($identityGraphResult) {
  $identityGraphPass = ($identityGraphRun.exitCode -eq 0) -and [bool]$identityGraphResult.passed
  $identityGraphDetail = "Failed checks: $($identityGraphResult.summary.failedChecks); Registered nodes: $($identityGraphResult.summary.registeredNodes); Registered files: $($identityGraphResult.summary.registeredFiles)"
} elseif ($identityGraphRun.output.Count -gt 0) {
  $identityGraphDetail = ($identityGraphRun.output -join [Environment]::NewLine)
}
$checks.Add((New-GateCheck -Name "application identity graph gate" -Pass $identityGraphPass -Detail $identityGraphDetail -EvidencePath $identityGraphResultPath))

$existingDoctorDirs = @()
if (Test-Path -LiteralPath $doctorOutputRoot) {
  $existingDoctorDirs = @(Get-ChildItem -LiteralPath $doctorOutputRoot -Directory | Select-Object -ExpandProperty FullName)
}

$doctorRun = Invoke-GateCommand `
  -Name "doctor baseline" `
  -FilePath "powershell.exe" `
  -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $doctorScriptPath,
    "-WorkspaceDir", $WorkspaceRoot,
    "-ExtensionDir", $resolvedExtensionDir
  ) `
  -WorkingDirectory $WorkspaceRoot `
  -EvidencePath (Join-Path $testEvidenceDir "leeway-application-integrity-doctor.log")
$checks.Add($doctorRun.check)
$commandEvidence.doctorLog = $doctorRun.check.evidencePath

$doctorReportJsonPath = $null
if (Test-Path -LiteralPath $doctorOutputRoot) {
  $latestDoctorDir = Get-ChildItem -LiteralPath $doctorOutputRoot -Directory |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($latestDoctorDir) {
    $candidate = Join-Path $latestDoctorDir.FullName "agent-lee-doctor.json"
    if (Test-Path -LiteralPath $candidate) {
      $doctorReportJsonPath = $candidate
    }
  }
}

$doctorReport = if ($doctorReportJsonPath) { Get-JsonFileSafely -Path $doctorReportJsonPath } else { $null }
$doctorPass = $false
$doctorDetail = "Doctor report not found."
if ($doctorReport) {
  $failedDoctorChecks = @($doctorReport.checks | Where-Object { -not $_.pass })
  $blockingCount = @($doctorReport.leewayCompliance.blockingFiles).Count
  $doctorPass = ($failedDoctorChecks.Count -eq 0) -and ($blockingCount -eq 0)
  $doctorDetail = "Failed checks: $($failedDoctorChecks.Count); LeeWay score: $($doctorReport.leewayCompliance.score); Blocking files: $blockingCount"
}
$checks.Add((New-GateCheck -Name "LeeWay compliance scan" -Pass ($doctorRun.check.pass -and $doctorPass) -Detail $doctorDetail -EvidencePath $doctorReportJsonPath))

$failedChecks = @($checks | Where-Object { -not $_.pass })
$runtimeSmokeResultPath = Join-Path $testEvidenceDir "runtime-smoke-voice-provider-result.json"
$hostRouterResultPath = Join-Path $testEvidenceDir "lavr-host-router-dynamic-result.json"
$playbackResultPath = Join-Path $testEvidenceDir "lavr-playback-gate-dynamic-result.json"
$runtimeSmokeResult = Get-JsonFileSafely -Path $runtimeSmokeResultPath
$hostRouterResult = Get-JsonFileSafely -Path $hostRouterResultPath
$playbackResult = if (-not $SkipPlaybackGate) { Get-JsonFileSafely -Path $playbackResultPath } else { $null }

$report = [pscustomobject]@{
  gate = "LEEWAY_APPLICATION_INTEGRITY_GATE"
  generatedAt = (Get-Date).ToString("o")
  extensionDir = $resolvedExtensionDir
  workspaceRoot = $WorkspaceRoot
  passed = ($failedChecks.Count -eq 0)
  summary = [pscustomobject]@{
    totalChecks = $checks.Count
    passedChecks = @($checks | Where-Object { $_.pass }).Count
    failedChecks = $failedChecks.Count
    concreteRegressionsDetected = if ($commandAudit.missing.Count -gt 0) { $commandAudit.missing.Count } else { 0 }
  }
  checks = $checks
  evidence = [pscustomobject]@{
    resultPath = $reportPath
    receiptPath = $receiptPath
    vsixPath = $vsixPath
    runtimeSmokeResult = $runtimeSmokeResultPath
    hostRouterResult = $hostRouterResultPath
    playbackResult = $playbackResultPath
    doctorReport = $doctorReportJsonPath
    commandAudit = $commandAuditPath
    identityGraph = $identityGraphResultPath
  }
  harnessResults = [pscustomobject]@{
    runtimeSmoke = $runtimeSmokeResult
    hostRouter = $hostRouterResult
    playback = $playbackResult
  }
  doctor = $doctorReport
  commandAudit = $commandAudit
  identityGraph = $identityGraphResult
}

$report | ConvertTo-Json -Depth 12 | Out-File -LiteralPath $reportPath -Encoding utf8

$receiptLines = @(
  "# LeeWay Application Integrity Gate Receipt",
  "",
  "- Generated: $($report.generatedAt)",
  "- Gate: LEEWAY_APPLICATION_INTEGRITY_GATE",
  "- Extension: $resolvedExtensionDir",
  "- Result: $(if ($report.passed) { 'PASS' } else { 'FAIL' })",
  "- Total checks: $($report.summary.totalChecks)",
  "- Failed checks: $($report.summary.failedChecks)",
  "- Evidence JSON: $reportPath",
  "- VSIX: $vsixPath",
  "- Doctor report: $(if ($doctorReportJsonPath) { $doctorReportJsonPath } else { 'not found' })",
  ""
)

foreach ($check in $checks) {
  $receiptLines += "- [$(if ($check.pass) { 'PASS' } else { 'FAIL' })] $($check.name): $($check.detail)"
}

$receiptLines | Out-File -LiteralPath $receiptPath -Encoding utf8

Write-Host "Integrity gate result written to $reportPath" -ForegroundColor Green
Write-Host "Integrity gate receipt written to $receiptPath" -ForegroundColor Green
$report
