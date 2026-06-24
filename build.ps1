# X-Split Build Script
# Run this from the project root: .\build.ps1
# Generates Firefox and Chrome ZIPs for store submission.

$ErrorActionPreference = 'Stop'

# Clean previous builds
if (Test-Path -LiteralPath 'dist') { Remove-Item -LiteralPath 'dist' -Recurse -Force }
New-Item -ItemType Directory -Path 'dist' -Force | Out-Null

# --- Firefox ---
Write-Host 'Building Firefox extension...'
$firefoxDir = 'extension'
$firefoxZip = "dist\x-split-firefox.zip"
if (Test-Path -LiteralPath $firefoxZip) { Remove-Item -LiteralPath $firefoxZip -Force }
Compress-Archive -Path "$firefoxDir\*" -DestinationPath $firefoxZip
Write-Host "  Created $firefoxZip"

# --- Chrome ---
Write-Host 'Building Chrome extension...'
$chromeDir = 'extension_chrome'
$chromeZip = "dist\x-split-chrome.zip"
if (Test-Path -LiteralPath $chromeZip) { Remove-Item -LiteralPath $chromeZip -Force }
Compress-Archive -Path "$chromeDir\*" -DestinationPath $chromeZip
Write-Host "  Created $chromeZip"

Write-Host ''
Write-Host 'Done. ZIPs in dist/:'
Get-ChildItem -LiteralPath dist | Select-Object Name, Length
