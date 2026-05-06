param(
  [string]$ExtensionDir = (Join-Path $PSScriptRoot "..\vscode-extension"),
  [string]$OutputName = "agent-lee-1.1.0-sovereign-runtime.vsix"
)

$ErrorActionPreference = "Stop"

$resolvedExtensionDir = (Resolve-Path $ExtensionDir).Path
$outputPath = Join-Path $resolvedExtensionDir $OutputName

Write-Host "Compiling extension in $resolvedExtensionDir" -ForegroundColor Cyan
Push-Location $resolvedExtensionDir
try {
  npm run compile
  if ($LASTEXITCODE -ne 0) {
    throw "TypeScript compile failed."
  }

  npx @vscode/vsce package -o $OutputName
  if ($LASTEXITCODE -ne 0) {
    throw "VSIX packaging failed."
  }
}
finally {
  Pop-Location
}

Write-Host "Built VSIX: $outputPath" -ForegroundColor Green
$outputPath
