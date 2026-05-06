param(
  [string]$WorkspaceDir = (Join-Path $PSScriptRoot ".."),
  [string]$CodeCmdPath = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
  [string]$UserDataDir = (Join-Path $env:TEMP "agent-lee-vscode-profile"),
  [string]$ExtensionsDir = (Join-Path $env:TEMP "agent-lee-vscode-extensions"),
  [switch]$Wait
)

$ErrorActionPreference = "Stop"

$resolvedWorkspace = (Resolve-Path $WorkspaceDir).Path
$arguments = @(
  $resolvedWorkspace,
  "--new-window",
  "--user-data-dir", $UserDataDir,
  "--extensions-dir", $ExtensionsDir,
  "--log", "trace"
)

if ($Wait) {
  & $CodeCmdPath @arguments
  exit $LASTEXITCODE
}

$proc = Start-Process -FilePath $CodeCmdPath -ArgumentList $arguments -PassThru
Write-Host "Launched VS Code PID $($proc.Id)" -ForegroundColor Green
$proc.Id
