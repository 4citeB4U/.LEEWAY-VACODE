#!/usr/bin/env pwsh
# Agent Lee Extension Test Script

$ExtensionPath = "$env:USERPROFILE\.vscode\extensions\leeway.agent-lee-leeway-coding-system-1.1.0"

Write-Host "Testing Agent Lee Extension Installation..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Extension folder exists
$folderExists = Test-Path $ExtensionPath
Write-Host "[$(if($folderExists) { 'PASS' } else { 'FAIL' })] Extension folder exists" -ForegroundColor $(if($folderExists) { 'Green' } else { 'Red' })

# Test 2: package.json exists
$packageJsonPath = Join-Path $ExtensionPath "package.json"
$packageJsonExists = Test-Path $packageJsonPath
Write-Host "[$(if($packageJsonExists) { 'PASS' } else { 'FAIL' })] package.json exists" -ForegroundColor $(if($packageJsonExists) { 'Green' } else { 'Red' })

# Test 3: out/extension.js exists
$extensionJsPath = Join-Path $ExtensionPath "out\extension.js"
$extensionJsExists = Test-Path $extensionJsPath
Write-Host "[$(if($extensionJsExists) { 'PASS' } else { 'FAIL' })] out/extension.js compiled" -ForegroundColor $(if($extensionJsExists) { 'Green' } else { 'Red' })

# Test 4: Media files exist
$mediaPath = Join-Path $ExtensionPath "media\leeway-standards-button.png"
$mediaExists = Test-Path $mediaPath
Write-Host "[$(if($mediaExists) { 'PASS' } else { 'FAIL' })] Media icon exists" -ForegroundColor $(if($mediaExists) { 'Green' } else { 'Red' })

# Test 5: Check manifest
if ($packageJsonExists) {
    $json = Get-Content $packageJsonPath | ConvertFrom-Json
    Write-Host "    Name: $($json.displayName)" -ForegroundColor Gray
    Write-Host "    Version: $($json.version)" -ForegroundColor Gray
    Write-Host "    Engine: $($json.engines.vscode)" -ForegroundColor Gray
}

Write-Host ""

if ($folderExists -and $packageJsonExists -and $extensionJsExists -and $mediaExists) {
    Write-Host "SUCCESS - Agent Lee Extension is installed!" -ForegroundColor Green
} else {
    Write-Host "FAILED - Extension installation incomplete" -ForegroundColor Red
}
