<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: AI
TAG: CORE.AGENT_LEE.VOICE.INVOKE_AUDITION
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Plays temporary local Agent Lee voice auditions without changing the locked runtime config.
#>

param(
  [string]$CandidateId = "arctic-fem",
  [string]$Text = "",
  [double]$PlaybackRateRatio = -1,
  [double]$SampleTrimRatio = -1,
  [double]$PitchRatio = -1,
  [switch]$ListOnly
)

$root = Split-Path -Parent $PSScriptRoot
$catalogPath = Join-Path $PSScriptRoot "voice-audition-catalog.json"
$speakScript = Join-Path $PSScriptRoot "Speak-AgentLeePiper.ps1"

if (-not (Test-Path $catalogPath)) {
  throw "Voice audition catalog not found: $catalogPath"
}

if (-not (Test-Path $speakScript)) {
  throw "Speak script not found: $speakScript"
}

$catalog = Get-Content -Raw $catalogPath | ConvertFrom-Json
$candidates = @($catalog.candidates)

if ($ListOnly) {
  $index = 0
  foreach ($candidate in $candidates) {
    $index += 1
    $speaker = if ($candidate.speakerId) { " speaker=$($candidate.speakerId)" } else { "" }
    Write-Output ("{0}. {1} ({2}{3})" -f $index, $candidate.label, $candidate.id, $speaker)
  }
  exit 0
}

$candidate = $candidates | Where-Object { $_.id -eq $CandidateId } | Select-Object -First 1
if ($null -eq $candidate) {
  throw "Candidate '$CandidateId' not found in $catalogPath"
}

$auditionText = if ([string]::IsNullOrWhiteSpace($Text)) {
  [string]$catalog.defaultText
} else {
  $Text
}

$effectivePlayback = if ($PlaybackRateRatio -gt 0) { $PlaybackRateRatio } else { [double]$candidate.playbackRateRatio }
$effectiveTrim = if ($SampleTrimRatio -gt 0) { $SampleTrimRatio } else { [double]$candidate.sampleTrimRatio }
$effectivePitch = if ($PitchRatio -gt 0) { $PitchRatio } else { if ($null -ne $candidate.pitchRatio) { [double]$candidate.pitchRatio } else { 1.0 } }

$tempConfig = Join-Path $env:TEMP ("agent-lee-voice-audition-" + [guid]::NewGuid().ToString() + ".json")
try {
  $config = [ordered]@{
    leeway = @{
      LEEWAY_HEADER = "DO NOT REMOVE"
      REGION = "AI"
      TAG = "CORE.AGENT_LEE.VOICE.AUDITION_RUNTIME"
      DISCOVERY_PIPELINE = "Voice -> Intent -> Location -> Vertical -> Ranking -> Render"
    }
    engine = "piper-local"
    preferVoiceServer = $false
    voiceWsUrl = "ws://localhost:8765/ws"
    fallbackEngine = "windows-sapi"
    personaSpeechMode = [string]$candidate.personaSpeechMode
    interruptionPolicy = "kill-current-and-replace"
    piperExecutable = "C:\\Users\\Leona\\.leeway-vscode\\agent-lee\\voice\\piper_bin\\piper.exe"
    piperModelPath = [string]$candidate.modelPath
    piperConfigPath = [string]$candidate.configPath
    sampleRate = 22050
    selectedVoiceId = [string]$candidate.id
    selectedVoiceLabel = [string]$candidate.label
    selectedSpeakerId = [string]$candidate.speakerId
    tuning = @{
      sampleTrimRatio = $effectiveTrim
      playbackRateRatio = $effectivePlayback
      pitchRatio = $effectivePitch
    }
  }

  $config | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $tempConfig -Encoding UTF8

  Write-Output ("Playing voice audition: {0} ({1})" -f $candidate.label, $candidate.id)
  Write-Output ("Speaker: {0}" -f ([string]$candidate.speakerId))
  Write-Output ("PlaybackRateRatio: {0}" -f $effectivePlayback)
  Write-Output ("SampleTrimRatio: {0}" -f $effectiveTrim)
  Write-Output ("PitchRatio: {0}" -f $effectivePitch)

  & powershell -ExecutionPolicy Bypass -File $speakScript -Text $auditionText -ConfigPath $tempConfig
  exit $LASTEXITCODE
} finally {
  Remove-Item -LiteralPath $tempConfig -Force -ErrorAction SilentlyContinue
}
