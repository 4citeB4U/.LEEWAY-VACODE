<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: AI
TAG: CORE.AGENT_LEE.VOICE.SPEAK_AGENTLEEPIPER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$Text,

  [Parameter(Mandatory=$true)]
  [string]$ConfigPath
)

function Resolve-PiperSpeakerId {
  param(
    [pscustomobject]$Config,
    [string]$ModelConfigPath
  )

  $selectedSpeakerId = ""
  if ($null -ne $Config.selectedSpeakerId) {
    $selectedSpeakerId = [string]$Config.selectedSpeakerId
  }

  if ([string]::IsNullOrWhiteSpace($selectedSpeakerId)) {
    return $null
  }

  $trimmed = $selectedSpeakerId.Trim()
  $numeric = 0
  if ([int]::TryParse($trimmed, [ref]$numeric)) {
    return $numeric
  }

  if (-not (Test-Path $ModelConfigPath)) {
    return $null
  }

  try {
    $modelConfig = Get-Content -Raw $ModelConfigPath | ConvertFrom-Json
    if ($null -eq $modelConfig.speaker_id_map) {
      return $null
    }

    foreach ($property in $modelConfig.speaker_id_map.PSObject.Properties) {
      if ([string]::Equals($property.Name, $trimmed, [System.StringComparison]::OrdinalIgnoreCase)) {
        return [int]$property.Value
      }
    }
  } catch {
    return $null
  }

  return $null
}

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

  if ($clean.Length -gt 900) {
    $clean = $clean.Substring(0, 900) + "..."
  }

  return $clean
}

function New-WaveFileFromPcm {
  param(
    [byte[]]$PcmBytes,
    [int]$SampleRate,
    [string]$OutputPath
  )

  $channels = 1
  $bitsPerSample = 16
  $byteRate = $SampleRate * $channels * ($bitsPerSample / 8)
  $blockAlign = $channels * ($bitsPerSample / 8)
  $subchunk2Size = $PcmBytes.Length
  $chunkSize = 36 + $subchunk2Size

  $stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
  try {
    $writer = New-Object System.IO.BinaryWriter($stream)
    $writer.Write([System.Text.Encoding]::ASCII.GetBytes("RIFF"))
    $writer.Write([int]$chunkSize)
    $writer.Write([System.Text.Encoding]::ASCII.GetBytes("WAVE"))
    $writer.Write([System.Text.Encoding]::ASCII.GetBytes("fmt "))
    $writer.Write([int]16)
    $writer.Write([int16]1)
    $writer.Write([int16]$channels)
    $writer.Write([int]$SampleRate)
    $writer.Write([int]$byteRate)
    $writer.Write([int16]$blockAlign)
    $writer.Write([int16]$bitsPerSample)
    $writer.Write([System.Text.Encoding]::ASCII.GetBytes("data"))
    $writer.Write([int]$subchunk2Size)
    $writer.Write($PcmBytes)
    $writer.Flush()
  } finally {
    $stream.Dispose()
  }
}

function Play-WavFile {
  param([string]$Path)

  try {
    $player = New-Object System.Media.SoundPlayer $Path
    $player.Load()
    $player.PlaySync()
    return $true
  } catch {
    try {
      Add-Type -AssemblyName PresentationCore
      $mediaPlayer = New-Object System.Windows.Media.MediaPlayer
      $mediaPlayer.Open([Uri]$Path)
      Start-Sleep -Milliseconds 250
      $mediaPlayer.Play()
      while ($mediaPlayer.NaturalDuration.HasTimeSpan -eq $false) {
        Start-Sleep -Milliseconds 100
      }
      Start-Sleep -Milliseconds ([math]::Ceiling($mediaPlayer.NaturalDuration.TimeSpan.TotalMilliseconds))
      $mediaPlayer.Stop()
      return $true
    } catch {
      return $false
    }
  }
}

function Apply-WavTuning {
  param(
    [string]$Path,
    [pscustomobject]$Config
  )

  if (-not (Test-Path $Path)) {
    return $false
  }

  $tuning = $Config.tuning
  if ($null -eq $tuning) {
    return $true
  }

  $sampleTrimRatio = 1.0
  $playbackRateRatio = 1.0
  $pitchRatio = 1.0

  if ($null -ne $tuning.sampleTrimRatio) {
    $sampleTrimRatio = [double]$tuning.sampleTrimRatio
  }

  if ($null -ne $tuning.playbackRateRatio) {
    $playbackRateRatio = [double]$tuning.playbackRateRatio
  }

  if ($null -ne $tuning.pitchRatio) {
    $pitchRatio = [double]$tuning.pitchRatio
  }

  if (
    [math]::Abs($sampleTrimRatio - 1.0) -lt 0.0001 -and
    [math]::Abs($playbackRateRatio - 1.0) -lt 0.0001 -and
    [math]::Abs($pitchRatio - 1.0) -lt 0.0001
  ) {
    return $true
  }

  $pythonScript = @'
import sys
import wave
from pathlib import Path

wav_path = Path(sys.argv[1])
trim_ratio = float(sys.argv[2])
playback_ratio = float(sys.argv[3])
pitch_ratio = float(sys.argv[4])

with wave.open(str(wav_path), "rb") as reader:
    params = reader.getparams()
    frames = reader.readframes(reader.getnframes())

frame_width = params.sampwidth * params.nchannels
frame_count = len(frames) // frame_width if frame_width else 0

if trim_ratio <= 0:
    trim_ratio = 1.0
if playback_ratio <= 0:
    playback_ratio = 1.0
if pitch_ratio <= 0:
    pitch_ratio = 1.0

new_frame_count = max(1, int(frame_count * trim_ratio)) if frame_count else 0
trimmed = frames[:new_frame_count * frame_width] if new_frame_count else frames
new_rate = max(1, int(params.framerate * playback_ratio * pitch_ratio))

with wave.open(str(wav_path), "wb") as writer:
    writer.setnchannels(params.nchannels)
    writer.setsampwidth(params.sampwidth)
    writer.setframerate(new_rate)
    writer.writeframes(trimmed)
'@

  $tempPy = Join-Path $env:TEMP ("agent-lee-voice-tune-" + [guid]::NewGuid().ToString() + ".py")
  try {
    [System.IO.File]::WriteAllText($tempPy, $pythonScript, [System.Text.UTF8Encoding]::new($false))
    & python $tempPy $Path $sampleTrimRatio $playbackRateRatio $pitchRatio | Out-Null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  } finally {
    Remove-Item -LiteralPath $tempPy -Force -ErrorAction SilentlyContinue
  }
}

function Invoke-VoiceServerSynthesis {
  param(
    [string]$SpeechText,
    [pscustomobject]$Config,
    [string]$WavPath
  )

  if (-not $Config.preferVoiceServer) {
    return $false
  }

  $voiceWsUrl = $Config.voiceWsUrl
  if ([string]::IsNullOrWhiteSpace($voiceWsUrl)) {
    $voiceWsUrl = "ws://localhost:8765/ws"
  }

  $uri = [Uri]$voiceWsUrl
  $ws = [System.Net.WebSockets.ClientWebSocket]::new()
  $buffer = New-Object System.Collections.Generic.List[byte]
  $sampleRate = if ($Config.sampleRate) { [int]$Config.sampleRate } else { 22050 }

  try {
    $cts = [System.Threading.CancellationTokenSource]::new()
    $cts.CancelAfter(20000)
    $ws.ConnectAsync($uri, $cts.Token).GetAwaiter().GetResult()

    $hello = @{
      type = "hello"
      version = "1"
      capabilities = @("text")
      sample_rate = 16000
      channels = 1
    } | ConvertTo-Json -Compress

    $helloBytes = [System.Text.Encoding]::UTF8.GetBytes($hello)
    $ws.SendAsync(
      [System.ArraySegment[byte]]::new($helloBytes),
      [System.Net.WebSockets.WebSocketMessageType]::Text,
      $true,
      $cts.Token
    ).GetAwaiter().GetResult()

    $textEvent = @{
      type = "text"
      text = $SpeechText
    } | ConvertTo-Json -Compress

    $textBytes = [System.Text.Encoding]::UTF8.GetBytes($textEvent)
    $ws.SendAsync(
      [System.ArraySegment[byte]]::new($textBytes),
      [System.Net.WebSockets.WebSocketMessageType]::Text,
      $true,
      $cts.Token
    ).GetAwaiter().GetResult()

    $receiveBuffer = New-Object byte[] 8192
    $audioDone = $false

    while ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open -and -not $audioDone) {
      $segment = [System.ArraySegment[byte]]::new($receiveBuffer)
      $result = $ws.ReceiveAsync($segment, $cts.Token).GetAwaiter().GetResult()

      if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) {
        break
      }

      if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Binary) {
        for ($i = 0; $i -lt $result.Count; $i++) {
          [void]$buffer.Add($receiveBuffer[$i])
        }
        continue
      }

      if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Text) {
        $builder = New-Object System.Text.StringBuilder
        [void]$builder.Append([System.Text.Encoding]::UTF8.GetString($receiveBuffer, 0, $result.Count))
        while (-not $result.EndOfMessage) {
          $result = $ws.ReceiveAsync($segment, $cts.Token).GetAwaiter().GetResult()
          [void]$builder.Append([System.Text.Encoding]::UTF8.GetString($receiveBuffer, 0, $result.Count))
        }

        $json = $builder.ToString()
        if ([string]::IsNullOrWhiteSpace($json)) {
          continue
        }

        try {
          $message = $json | ConvertFrom-Json
        } catch {
          continue
        }

        if ($message.type -eq "audio_out" -and $message.sample_rate) {
          $sampleRate = [int]$message.sample_rate
        }

        if ($message.type -eq "audio_out" -and $message.is_last -eq $true) {
          $audioDone = $true
        }
      }
    }

    if ($buffer.Count -gt 0) {
      New-WaveFileFromPcm -PcmBytes $buffer.ToArray() -SampleRate $sampleRate -OutputPath $WavPath
      return (Test-Path $WavPath) -and ((Get-Item $WavPath).Length -gt 44)
    }

    return $false
  } catch {
    return $false
  } finally {
    try {
      if ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync(
          [System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure,
          "done",
          [System.Threading.CancellationToken]::None
        ).GetAwaiter().GetResult()
      }
    } catch {}
    $ws.Dispose()
  }
}

function Invoke-DirectPiperSynthesis {
  param(
    [string]$SpeechText,
    [pscustomobject]$Config,
    [string]$WavPath
  )

  $piperExe = $Config.piperExecutable
  $modelPath = $Config.piperModelPath
  $modelConfig = $Config.piperConfigPath

  if (-not ((Test-Path $piperExe) -and (Test-Path $modelPath))) {
    return $false
  }

  $arguments = @(
    "--model", $modelPath,
    "--output_file", $WavPath
  )

  if ($modelConfig -and (Test-Path $modelConfig)) {
    $arguments += @("--config", $modelConfig)
  }

  $speakerId = Resolve-PiperSpeakerId -Config $Config -ModelConfigPath $modelConfig
  if ($null -ne $speakerId) {
    $arguments += @("--speaker", [string]$speakerId)
  }

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $piperExe
  $psi.Arguments = ($arguments -join " ")
  $psi.RedirectStandardInput = $true
  $psi.RedirectStandardError = $true
  $psi.RedirectStandardOutput = $false
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $psi
  [void]$process.Start()
  $stdinBytes = [System.Text.UTF8Encoding]::new($false).GetBytes($SpeechText + "`n")
  $process.StandardInput.BaseStream.Write($stdinBytes, 0, $stdinBytes.Length)
  $process.StandardInput.BaseStream.Flush()
  $process.StandardInput.Close()
  $process.WaitForExit()

  return (Test-Path $WavPath) -and ((Get-Item $WavPath).Length -gt 0)
}

$config = Get-Content -Raw $ConfigPath | ConvertFrom-Json
$clean = Clean-SpeechText -InputText $Text

if ([string]::IsNullOrWhiteSpace($clean)) {
  exit 0
}

$tempDir = Join-Path $env:TEMP "agent-lee-voice"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$wavPath = Join-Path $tempDir ("agent-lee-" + [guid]::NewGuid().ToString() + ".wav")

$rendered = Invoke-VoiceServerSynthesis -SpeechText $clean -Config $config -WavPath $wavPath
if (-not $rendered) {
  $rendered = Invoke-DirectPiperSynthesis -SpeechText $clean -Config $config -WavPath $wavPath
}

if (-not $rendered) {
  Remove-Item -LiteralPath $wavPath -Force -ErrorAction SilentlyContinue
  throw "Piper synthesis failed. Refusing fallback to other TTS engines."
}

if ($rendered) {
  [void](Apply-WavTuning -Path $wavPath -Config $config)
}

if ($rendered -and (Play-WavFile -Path $wavPath)) {
  Remove-Item -LiteralPath $wavPath -Force -ErrorAction SilentlyContinue
  exit 0
}
Remove-Item -LiteralPath $wavPath -Force -ErrorAction SilentlyContinue
throw "Piper playback failed. Refusing fallback to other TTS engines."
