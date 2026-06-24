# X-Split Build Script
# Run this from the project root: .\build.ps1
# Generates Firefox and Chrome ZIPs for store submission.

$ErrorActionPreference = 'Stop'

function New-ZipWithForwardSlashes {
    param([string]$SourceDir, [string]$DestPath)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    Add-Type -AssemblyName System.IO.Compression
    $resolved = (Resolve-Path -LiteralPath $SourceDir).Path
    Remove-Item -LiteralPath $DestPath -Force -ErrorAction SilentlyContinue
    $stream = [System.IO.File]::Create($DestPath)
    $zip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -Path $resolved -Recurse -File | ForEach-Object {
            $relative = $_.FullName.Substring($resolved.Length + 1) -replace '\\', '/'
            $entry = $zip.CreateEntry($relative)
            $entryStream = $entry.Open()
            $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
            $entryStream.Write($bytes, 0, $bytes.Length)
            $entryStream.Dispose()
        }
    } finally {
        $zip.Dispose()
        $stream.Dispose()
    }
}

# Clean previous builds
if (Test-Path -LiteralPath 'dist') { Remove-Item -LiteralPath 'dist' -Recurse -Force }
New-Item -ItemType Directory -Path 'dist' -Force | Out-Null

# --- Firefox ---
Write-Host 'Building Firefox extension...'
$firefoxZip = "dist\x-split-firefox.zip"
New-ZipWithForwardSlashes -SourceDir 'extension' -DestPath $firefoxZip
Write-Host "  Created $firefoxZip"

# --- Chrome ---
Write-Host 'Building Chrome extension...'
$chromeZip = "dist\x-split-chrome.zip"
New-ZipWithForwardSlashes -SourceDir 'extension_chrome' -DestPath $chromeZip
Write-Host "  Created $chromeZip"

Write-Host ''
Write-Host 'Done. ZIPs in dist/:'
Get-ChildItem -LiteralPath dist | Select-Object Name, Length
