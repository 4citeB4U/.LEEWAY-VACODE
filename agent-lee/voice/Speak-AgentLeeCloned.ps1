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

$tokenFromConfig = if ($config.hfToken) { [string]$config.hfToken } else { "" }
$tokenFromUserEnv = [Environment]::GetEnvironmentVariable("HF_TOKEN", "User")
if (-not [string]::IsNullOrWhiteSpace($tokenFromConfig)) {
  $env:HF_TOKEN = $tokenFromConfig
  $env:HUGGING_FACE_HUB_TOKEN = $tokenFromConfig
} elseif (-not [string]::IsNullOrWhiteSpace($tokenFromUserEnv) -and [string]::IsNullOrWhiteSpace($env:HF_TOKEN)) {
  $env:HF_TOKEN = $tokenFromUserEnv
  $env:HUGGING_FACE_HUB_TOKEN = $tokenFromUserEnv
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

$serverUrl = if ($config.cloneServerUrl) { [string]$config.cloneServerUrl } else { "http://127.0.0.1:8766" }
$refAudio = [string]$config.cloneReferenceAudioPath
$refText = [string]$config.cloneReferenceText
$baseOutputPath = if ($config.cloneOutputPath) {
  [string]$config.cloneOutputPath
} else {
  Join-Path $env:TEMP "agent-lee-cloned-voice-last.wav"
}

$outputDir = Split-Path -Parent $baseOutputPath
if ([string]::IsNullOrWhiteSpace($outputDir) -or -not (Test-Path $outputDir)) {
  $outputDir = $env:TEMP
}
$outputName = "agent-lee-cloned-" + [Guid]::NewGuid().ToString("N") + ".wav"
$outputPath = Join-Path $outputDir $outputName
$speechSpeed = 1.0
if ($config.cloneSpeedRatio) {
  $speechSpeed = [double]$config.cloneSpeedRatio
} elseif ($config.tuning -and $config.tuning.playbackRateRatio) {
  $speechSpeed = [double]$config.tuning.playbackRateRatio
}
if ($speechSpeed -lt 0.6) { $speechSpeed = 0.6 }
if ($speechSpeed -gt 1.4) { $speechSpeed = 1.4 }

$pitchRatio = 1.0
if ($config.tuning -and $config.tuning.pitchRatio) {
  $pitchRatio = [double]$config.tuning.pitchRatio
}
if ($pitchRatio -lt 0.7) { $pitchRatio = 0.7 }
if ($pitchRatio -gt 1.3) { $pitchRatio = 1.3 }

$toneRatio = 1.0
if ($config.tuning -and $config.tuning.toneRatio) {
  $toneRatio = [double]$config.tuning.toneRatio
}
if ($toneRatio -lt 0.7) { $toneRatio = 0.7 }
if ($toneRatio -gt 1.3) { $toneRatio = 1.3 }

if ([string]::IsNullOrWhiteSpace($serverUrl)) {
  throw "Clone server URL is not configured."
}

function Invoke-DirectCloneSynthesis {
  param(
    [string]$ConfigPythonPath,
    [string]$ConfigScriptPath,
    [string]$ReferenceAudio,
    [string]$ReferenceText,
    [string]$SpeechText,
    [string]$WavOutputPath,
    [string]$Device,
    [double]$Speed
  )

  if ([string]::IsNullOrWhiteSpace($ConfigPythonPath) -or -not (Test-Path $ConfigPythonPath)) {
    throw "clonePythonPath is not configured or missing."
  }
  if ([string]::IsNullOrWhiteSpace($ConfigScriptPath) -or -not (Test-Path $ConfigScriptPath)) {
    throw "cloneScriptPath is not configured or missing."
  }

  function Invoke-PythonClone {
    param([string]$TargetOutputPath)
    $pythonArgs = @(
      $ConfigScriptPath,
      "--ref_audio", $ReferenceAudio,
      "--ref_text", $ReferenceText,
      "--text", $SpeechText,
      "--output", $TargetOutputPath,
      "--device", $(if ([string]::IsNullOrWhiteSpace($Device)) { "cpu" } else { $Device }),
      "--speed", ([string]$Speed)
    )

    & $ConfigPythonPath @pythonArgs | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Direct clone synthesis failed with exit code $LASTEXITCODE"
    }
    return $TargetOutputPath
  }

  try {
    return Invoke-PythonClone -TargetOutputPath $WavOutputPath
  } catch {
    $tempOutputPath = Join-Path $env:TEMP ("agent-lee-cloned-" + [Guid]::NewGuid().ToString("N") + ".wav")
    return Invoke-PythonClone -TargetOutputPath $tempOutputPath
  }
}

$serverReady = $false
try {
  $health = Invoke-RestMethod -Uri ($serverUrl.TrimEnd("/") + "/health") -Method Get -TimeoutSec 3
  $serverReady = [bool]$health.ready
} catch {
  $startScript = Join-Path $PSScriptRoot "Start-AgentLeeCloneVoiceServer.ps1"
  if (Test-Path $startScript) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $startScript -ConfigPath $ConfigPath | Out-Null
    try {
      $health = Invoke-RestMethod -Uri ($serverUrl.TrimEnd("/") + "/health") -Method Get -TimeoutSec 10
      $serverReady = [bool]$health.ready
    } catch {
      $serverReady = $false
    }
  }
}

if ($serverReady) {
  try {
    $requestBody = @{
      text = $cleanText
      ref_audio = $refAudio
      ref_text = $refText
      output_path = $outputPath
      speed = $speechSpeed
    } | ConvertTo-Json -Depth 5

    $synthesis = Invoke-RestMethod `
      -Uri ($serverUrl.TrimEnd("/") + "/synthesize") `
      -Method Post `
      -ContentType "application/json" `
      -Body $requestBody `
      -TimeoutSec 180

    if ($synthesis.output_path) {
      $outputPath = [string]$synthesis.output_path
    }
  } catch {
    # If server synthesis fails (for example HTTP 500), immediately fallback to direct local synthesis.
    $outputPath = Invoke-DirectCloneSynthesis `
      -ConfigPythonPath ([string]$config.clonePythonPath) `
      -ConfigScriptPath ([string]$config.cloneScriptPath) `
      -ReferenceAudio $refAudio `
      -ReferenceText $refText `
      -SpeechText $cleanText `
      -WavOutputPath $outputPath `
      -Device ([string]$config.cloneDevice) `
      -Speed $speechSpeed
  }
} else {
  $outputPath = Invoke-DirectCloneSynthesis `
    -ConfigPythonPath ([string]$config.clonePythonPath) `
    -ConfigScriptPath ([string]$config.cloneScriptPath) `
    -ReferenceAudio $refAudio `
    -ReferenceText $refText `
    -SpeechText $cleanText `
    -WavOutputPath $outputPath `
    -Device ([string]$config.cloneDevice) `
    -Speed $speechSpeed
}

if (-not (Test-Path $outputPath) -or ((Get-Item $outputPath).Length -lt 100)) {
  throw "Clone voice synthesis did not produce a playable audio file."
  exit 1
}

function Resolve-FfmpegPath {
  param($RuntimeConfig)
  $candidate = ""
  if ($RuntimeConfig.ffmpegPath) {
    $candidate = [string]$RuntimeConfig.ffmpegPath
  }
  if ($candidate -and (Test-Path $candidate)) {
    return $candidate
  }
  try {
    $cmd = Get-Command ffmpeg -ErrorAction Stop
    if ($cmd -and $cmd.Source) {
      return [string]$cmd.Source
    }
  } catch {}
  return ""
}

function Try-ApplyVoiceToneAndPitch {
  param(
    [string]$InputPath,
    [double]$Pitch,
    [double]$Tone,
    $RuntimeConfig
  )

  if ([Math]::Abs($Pitch - 1.0) -lt 0.01 -and [Math]::Abs($Tone - 1.0) -lt 0.01) {
    return $InputPath
  }

  $ffmpeg = Resolve-FfmpegPath -RuntimeConfig $RuntimeConfig
  if ([string]::IsNullOrWhiteSpace($ffmpeg)) {
    return $InputPath
  }

  $target = Join-Path $env:TEMP ("agent-lee-cloned-processed-" + [Guid]::NewGuid().ToString("N") + ".wav")
  $toneDb = [Math]::Round((($Tone - 1.0) * 20.0), 2)
  if ($toneDb -lt -8) { $toneDb = -8 }
  if ($toneDb -gt 8) { $toneDb = 8 }
  $pitchFactor = [Math]::Round($Pitch, 4)
  $filter = "asetrate=24000*" + $pitchFactor + ",aresample=24000,equalizer=f=3200:t=q:w=1.0:g=" + $toneDb

  & $ffmpeg -y -i $InputPath -filter:a $filter -ar 24000 -ac 1 $target | Out-Null
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $target)) {
    return $InputPath
  }

  return $target
}

$playbackPath = Try-ApplyVoiceToneAndPitch -InputPath $outputPath -Pitch $pitchRatio -Tone $toneRatio -RuntimeConfig $config

try {
  $player = New-Object System.Media.SoundPlayer $playbackPath
  $player.PlaySync()
} catch {
  throw "Clone voice playback failed for $playbackPath"
}
