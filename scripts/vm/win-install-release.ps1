#Requires -Version 5.1
<#
.SYNOPSIS
  Download, verify, and silently install an Arroxy release from GitHub.
#>
param([string]$Tag = 'latest')

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$api = 'https://api.github.com/repos/antonio-orionus/Arroxy/releases'
$release = if ($Tag -eq 'latest') { Invoke-RestMethod "$api/latest" } else { Invoke-RestMethod "$api/tags/$Tag" }
$assetName = 'Arroxy-win-x64-Setup.exe'
$asset = $release.assets | Where-Object { $_.name -eq $assetName }
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' }
if (-not $asset -or -not $sums) { throw "$($release.tag_name) has no $assetName or SHA256SUMS" }

$installer = Join-Path $env:TEMP $assetName
Invoke-WebRequest $asset.browser_download_url -OutFile $installer -UseBasicParsing
# Saved to a file: PowerShell 5.1 hands back an octet-stream body as byte[].
$sumsFile = Join-Path $env:TEMP 'Arroxy-SHA256SUMS'
Invoke-WebRequest $sums.browser_download_url -OutFile $sumsFile -UseBasicParsing
$expected = (Get-Content $sumsFile | Where-Object { $_ -match "[ *]$([regex]::Escape($assetName))$" } | Select-Object -First 1) -replace '\s.*$', ''
Remove-Item $sumsFile -Force
$actual = (Get-FileHash $installer -Algorithm SHA256).Hash
if (-not $expected -or $actual -ne $expected.ToUpperInvariant()) { throw "checksum mismatch for $assetName (expected $expected, got $actual)" }

Get-Process Arroxy -ErrorAction SilentlyContinue | Stop-Process -Force
$p = Start-Process -FilePath $installer -ArgumentList '/S' -Wait -PassThru
Remove-Item $installer -Force
if ($p.ExitCode -ne 0) { throw "installer exited with $($p.ExitCode)" }

$exe = Join-Path $env:LOCALAPPDATA 'Programs\arroxy\Arroxy.exe'
if (-not (Test-Path $exe)) { throw "installed, but $exe is missing" }
"installed $($release.tag_name): $exe ($((Get-Item $exe).VersionInfo.ProductVersion))"
