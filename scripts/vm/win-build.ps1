#Requires -Version 5.1
<#
.SYNOPSIS
  bun install + dist:win:dir in a synced checkout; prints the built Arroxy.exe.

.DESCRIPTION
  Commands run through cmd so their stderr is plain text: PowerShell 5.1 wraps
  native stderr in NativeCommandError records, which reads like failure even
  when the exit code is 0. Git's bash must be on PATH or dist:win:dir fails
  with `spawnSync bash ENOENT`.
#>
param([Parameter(Mandatory = $true)][string]$Dir)

$ErrorActionPreference = 'Stop'
Set-Location $Dir
$env:CI = 'true'
$env:PATH = "C:\Program Files\Git\bin;$env:USERPROFILE\.bun\bin;$env:PATH"

foreach ($step in @('bun install', 'bun run dist:win:dir')) {
  Write-Host "== $step"
  cmd /c "$step 2>&1"
  if ($LASTEXITCODE -ne 0) { throw "$step failed with exit $LASTEXITCODE" }
}

$exe = Get-ChildItem (Join-Path $Dir 'dist') -Directory -Filter 'win-*-unpacked' |
  Sort-Object LastWriteTime -Descending |
  ForEach-Object { Join-Path $_.FullName 'Arroxy.exe' } |
  Where-Object { Test-Path $_ } |
  Select-Object -First 1
if (-not $exe) { throw 'dist:win:dir produced no Arroxy.exe' }
"built: $exe ($((Get-Item $exe).VersionInfo.ProductVersion))"
