param(
  [string]$ExtensionDir
)

$ErrorActionPreference = "Stop"

function Test-AgentLeeExtensionDir {
  param([string]$Path)

  if (-not $Path) {
    return $false
  }

  $packagePath = Join-Path $Path "package.json"
  $srcPath = Join-Path $Path "src"
  return (Test-Path $packagePath) -and (Test-Path $srcPath)
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$agentLeeRoot = Resolve-Path (Join-Path $scriptRoot "..")
$workspaceRoot = Resolve-Path (Join-Path $scriptRoot "..\..")

$candidates = @()
if ($ExtensionDir) {
  $candidates += $ExtensionDir
}

$candidates += @(
  (Join-Path $workspaceRoot "agent-lee-leeway-coding-system\vscode-extension"),
  (Join-Path $agentLeeRoot "vscode-extension")
)

foreach ($candidate in $candidates) {
  if (Test-AgentLeeExtensionDir -Path $candidate) {
    return (Resolve-Path $candidate).Path
  }
}

throw "Could not find the Agent Lee VS Code extension folder. Checked: $($candidates -join ', ')"
