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

$config = Get-Content -Raw $ConfigPath | ConvertFrom-Json
$clean = [regex]::Replace($Text, '```[\s\S]*?```', '[code omitted]')
$clean = [regex]::Replace($clean, '`[^`]+`', '[code omitted]')
$clean = [regex]::Replace($clean, 'https?://\S+', '[link omitted]')
$clean = $clean.Trim()

if ([string]::IsNullOrWhiteSpace($clean)) {
  exit 0
}

if ($clean.Length -gt 900) {
  $clean = $clean.Substring(0, 900) + "..."
}

$tempDir = Join-Path $env:TEMP "agent-lee-voice"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$wavPath = Join-Path $tempDir ("agent-lee-" + [guid]::NewGuid().ToString() + ".wav")

$piperExe = $config.piperExecutable
$modelPath = $config.piperModelPath
$modelConfig = $config.piperConfigPath

if ((Test-Path $piperExe) -and (Test-Path $modelPath)) {
  $arguments = @(
    "--model", $modelPath,
    "--output_file", $wavPath
  )

  if ($modelConfig -and (Test-Path $modelConfig)) {
    $arguments += @("--config", $modelConfig)
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
  $process.StandardInput.WriteLine($clean)
  $process.StandardInput.Close()
  $process.WaitForExit()

  if ((Test-Path $wavPath) -and ((Get-Item $wavPath).Length -gt 0)) {
    try {
      $player = New-Object System.Media.SoundPlayer $wavPath
      $player.Load()
      $player.PlaySync()
      Remove-Item -LiteralPath $wavPath -Force -ErrorAction SilentlyContinue
      exit 0
    } catch {
      try {
        Add-Type -AssemblyName PresentationCore
        $mediaPlayer = New-Object System.Windows.Media.MediaPlayer
        $mediaPlayer.Open([Uri]$wavPath)
        Start-Sleep -Milliseconds 250
        $mediaPlayer.Play()
        while ($mediaPlayer.NaturalDuration.HasTimeSpan -eq $false) {
          Start-Sleep -Milliseconds 100
        }
        Start-Sleep -Milliseconds ([math]::Ceiling($mediaPlayer.NaturalDuration.TimeSpan.TotalMilliseconds))
        $mediaPlayer.Stop()
        Remove-Item -LiteralPath $wavPath -Force -ErrorAction SilentlyContinue
        exit 0
      } catch {
      }
    }
  }
}

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 90
$synth.Speak($clean)

