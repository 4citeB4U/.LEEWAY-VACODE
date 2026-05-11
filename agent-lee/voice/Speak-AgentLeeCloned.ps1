<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.AGENT_LEE.VOICE.SPEAK_CLONED
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Speaks Agent Lee responses through the configured local F5-TTS cloned developer voice.
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$Text,
  [string]$ConfigPath = (Join-Path $PSScriptRoot "voice-runtime.json")
)

$ErrorActionPreference = "Continue"

if (-not (Test-Path $ConfigPath)) {
  throw "Voice runtime config not found at $ConfigPath"
}

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
if (-not $config.cloneReferenceAudioPath -or -not (Test-Path ([string]$config.cloneReferenceAudioPath))) {
  throw "Clone reference audio path is not configured or missing."
}
if (-not $config.cloneReferenceText) {
  throw "Clone reference transcript is not configured."
}

# Clean the text for speech
function Clean-SpeechText {
  param([string]$InputText)
  $clean = [regex]::Replace($InputText, '```[\s\S]*?```', '[code omitted]')
  $clean = [regex]::Replace($clean, '`[^`]+`', '[code omitted]')
  $clean = [regex]::Replace($clean, 'https?://\S+', '[link omitted]')
  $clean = $clean.Replace([string][char]0x2018, "'").Replace([string][char]0x2019, "'")
  $clean = $clean.Replace([string][char]0x201C, '"').Replace([string][char]0x201D, '"')
  $clean = $clean.Replace([string][char]0x2013, "-").Replace([string][char]0x2014, "-")
  $clean = $clean.Replace([string][char]0x2026, "...")
  $clean = [regex]::Replace($clean, '[^\u0009\u000A\u000D\u0020-\u007E]', ' ')
  $clean = [regex]::Replace($clean, '\s+', ' ')
  $clean = $clean.Trim()
  if ($clean.Length -gt 500) {
    $clean = $clean.Substring(0, 500) + "..."
  }
  return $clean
}

$cleanText = Clean-SpeechText -InputText $Text
if ([string]::IsNullOrWhiteSpace($cleanText)) {
  exit 0
}

$pythonExe = if ($config.clonePythonPath) {
  [string]$config.clonePythonPath
} else {
  Join-Path $PSScriptRoot "voice-cloning-env\Scripts\python.exe"
}

$cloneScript = if ($config.cloneScriptPath) {
  [string]$config.cloneScriptPath
} else {
  Join-Path $PSScriptRoot "clone_voice.py"
}

$device = if ($config.cloneDevice) { [string]$config.cloneDevice } else { "cpu" }
$refAudio = [string]$config.cloneReferenceAudioPath
$refText = [string]$config.cloneReferenceText

$outputPath = if ($config.cloneOutputPath) {
  [string]$config.cloneOutputPath
} else {
  Join-Path $env:TEMP "agent-lee-cloned-voice-last.wav"
}

if (-not (Test-Path $pythonExe)) {
  throw "Clone Python environment not found at $pythonExe"
}
if (-not (Test-Path $cloneScript)) {
  throw "Clone script not found at $cloneScript"
}

# Run the clone voice synthesis using Start-Process to isolate stderr
$stderrLog = Join-Path $env:TEMP "agent-lee-clone-stderr.log"
$cloneArgs = @(
  "`"$cloneScript`"",
  "--ref_audio", "`"$refAudio`"",
  "--ref_text", "`"$refText`"",
  "--text", "`"$cleanText`"",
  "--output", "`"$outputPath`"",
  "--device", $device
)
$proc = Start-Process -FilePath $pythonExe -ArgumentList $cloneArgs -NoNewWindow -Wait -PassThru -RedirectStandardError $stderrLog

if (-not (Test-Path $outputPath) -or ((Get-Item $outputPath).Length -lt 100)) {
  # Fallback to Windows SAPI
  try {
    Add-Type -AssemblyName System.Speech
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $synth.Rate = -1
    $synth.Volume = 95
    $synth.Speak($cleanText)
  } catch {}
  exit 1
}

# Play the generated WAV using MediaPlayer (handles 24kHz correctly)
try {
  Add-Type -AssemblyName PresentationCore
  $mediaPlayer = New-Object System.Windows.Media.MediaPlayer
  $mediaPlayer.Open([Uri]$outputPath)
  Start-Sleep -Milliseconds 300
  $mediaPlayer.Play()
  $timeout = 0
  while ($mediaPlayer.NaturalDuration.HasTimeSpan -eq $false -and $timeout -lt 50) {
    Start-Sleep -Milliseconds 100
    $timeout++
  }
  if ($mediaPlayer.NaturalDuration.HasTimeSpan) {
    Start-Sleep -Milliseconds ([math]::Ceiling($mediaPlayer.NaturalDuration.TimeSpan.TotalMilliseconds))
  } else {
    Start-Sleep -Milliseconds 3000
  }
  $mediaPlayer.Stop()
} catch {
  # Last-resort fallback to SoundPlayer
  try {
    $player = New-Object System.Media.SoundPlayer $outputPath
    $player.PlaySync()
  } catch {}
}
