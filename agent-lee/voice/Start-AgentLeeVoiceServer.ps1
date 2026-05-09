<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: AI
TAG: CORE.AGENT_LEE.VOICE.START_SERVER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Starts the archived Agent Lee expressive voice server as the active local voice backbone.
#>

param(
  [switch]$Foreground,
  [int]$Port = 8765
)

$logDir = Join-Path $PSScriptRoot "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Get-ArchivedVoiceServerRoot {
  $archiveRoot = Join-Path (Split-Path -Parent $PSScriptRoot) "..\_archive"
  $resolvedArchiveRoot = [System.IO.Path]::GetFullPath($archiveRoot)
  $candidates = Get-ChildItem -LiteralPath $resolvedArchiveRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "LeeWay-Standards-pre-standalone-*" } |
    Sort-Object LastWriteTime -Descending

  foreach ($candidate in $candidates) {
    $serverRoot = Join-Path $candidate.FullName "src\voice\server"
    if (Test-Path (Join-Path $serverRoot "main.py")) {
      return $serverRoot
    }
  }

  throw "No archived voice server root was found under $resolvedArchiveRoot."
}

function Test-VoiceServerListening {
  param([int]$CheckPort)
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $async = $tcp.BeginConnect("127.0.0.1", $CheckPort, $null, $null)
    $connected = $async.AsyncWaitHandle.WaitOne(600)
    if (-not $connected) {
      $tcp.Close()
      return $false
    }
    $tcp.EndConnect($async)
    $tcp.Close()
    return $true
  } catch {
    return $false
  }
}

$serverRoot = Get-ArchivedVoiceServerRoot
$pythonExe = Join-Path $serverRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
  throw "Archived voice server Python was not found at $pythonExe."
}

if (Test-VoiceServerListening -CheckPort $Port) {
  Write-Output "Agent Lee voice server already appears to be listening on port $Port."
  exit 0
}

$env:HOST = "127.0.0.1"
$env:PORT = [string]$Port
$env:LOG_LEVEL = "INFO"
$env:CORS_ORIGINS = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"
$env:OFFLINE_MODE = "1"
$env:PIPER_EXECUTABLE = (Join-Path $serverRoot "piper_bin\piper.exe")
$env:PIPER_MODEL_PATH = (Join-Path $serverRoot "piper_models\en_US-lessac-medium.onnx")
$env:MEMORY_DB_PATH = (Join-Path $serverRoot "data\memory.db")

if ($Foreground) {
  Push-Location $serverRoot
  try {
    & $pythonExe -m uvicorn main:app --host 127.0.0.1 --port $Port
    exit $LASTEXITCODE
  } finally {
    Pop-Location
  }
}

$stdoutLog = Join-Path $logDir "voice-server.stdout.log"
$stderrLog = Join-Path $logDir "voice-server.stderr.log"
$launcherPath = Join-Path $logDir "run-voice-server.cmd"
$launcherBody = @"
@echo off
set HOST=127.0.0.1
set PORT=$Port
set LOG_LEVEL=INFO
set CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
set OFFLINE_MODE=1
set PIPER_EXECUTABLE=$env:PIPER_EXECUTABLE
set PIPER_MODEL_PATH=$env:PIPER_MODEL_PATH
set MEMORY_DB_PATH=$env:MEMORY_DB_PATH
cd /d "$serverRoot"
"$pythonExe" -m uvicorn main:app --host 127.0.0.1 --port $Port 1>>"$stdoutLog" 2>>"$stderrLog"
"@
[System.IO.File]::WriteAllText($launcherPath, $launcherBody, [System.Text.UTF8Encoding]::new($false))

$process = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", $launcherPath) -WorkingDirectory $serverRoot -WindowStyle Hidden -PassThru

Start-Sleep -Seconds 5

if (Test-VoiceServerListening -CheckPort $Port) {
  Write-Output "Agent Lee voice server started on port $Port (PID $($process.Id))."
  exit 0
}

throw "Agent Lee voice server did not start successfully on port $Port. Check $stdoutLog and $stderrLog."
