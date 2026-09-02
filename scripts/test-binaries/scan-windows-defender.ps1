#Requires -Version 5.1
<#
.SYNOPSIS
  Fail the build if Windows Defender flags anything under a path.

.DESCRIPTION
  Gate for the embedded third-party binaries. Arroxy ships ffmpeg/ffprobe built
  by BtbN; on 2026-09-01 an upstream autobuild's ffprobe.exe tripped Defender's
  ML classifier as Trojan:Win32/Wacatac.B!ml (a known false positive, see
  BtbN/FFmpeg-Builds#646). Defender quarantines the file on install, which
  breaks probing for every user on that release. Nothing caught it before
  publish, so this scans the packed output while it is still an artifact.

  Definitions are refreshed first: a stale signature set makes the gate a no-op.
  A scan that cannot run is a failure, not a pass — a gate that silently skips
  is worse than no gate, because it reads green.

  -Require exists because the scan alone is not sufficient. Where real-time
  protection is on, Defender quarantines a flagged binary as it is written, so
  by the time the on-demand scan runs the file is already gone and the scan
  reports "found no threats" over a payload that is genuinely broken. Absence is
  the failure signal, so name the binaries that must survive.
#>
param(
  [Parameter(Mandatory = $true)][string]$Path,
  [string[]]$Require = @()
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Path)) { throw "scan target does not exist: $Path" }
$scanPath = (Resolve-Path -LiteralPath $Path).Path

$mpCmdRun = Join-Path $env:ProgramFiles 'Windows Defender\MpCmdRun.exe'
if (-not (Test-Path $mpCmdRun)) {
  $platform = Get-ChildItem "$env:ProgramData\Microsoft\Windows Defender\Platform" -Directory -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending | Select-Object -First 1
  if ($platform) { $mpCmdRun = Join-Path $platform.FullName 'MpCmdRun.exe' }
}
if (-not (Test-Path $mpCmdRun)) { throw "MpCmdRun.exe not found - cannot scan $Path" }

Write-Output "Defender: $mpCmdRun"
& $mpCmdRun -SignatureUpdate 2>&1 | Out-Null
try {
  $status = Get-MpComputerStatus
  Write-Output "signatures: $($status.AntivirusSignatureVersion) ($($status.AntivirusSignatureLastUpdated))"
} catch {
  Write-Output "signatures: version unavailable"
}

Write-Output "scanning: $scanPath"
$output = & $mpCmdRun -Scan -ScanType 3 -File $scanPath 2>&1
$exit = $LASTEXITCODE
$text = ($output | Out-String)
Write-Output $text

$missing = @($Require | Where-Object { -not (Test-Path -LiteralPath (Join-Path $scanPath $_)) })
if ($missing.Count -gt 0) {
  throw "required binaries missing from $scanPath (quarantined during build?): $($missing -join ', ')"
}

if ($exit -eq 0 -and $text -match 'found no threats') {
  if ($Require.Count -gt 0) { Write-Output "present: $($Require -join ', ')" }
  exit 0
}

$threats = (Get-MpThreat -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ThreatName) -join ', '
$detail = if ($threats) { ": $threats" } else { '' }
throw "Windows Defender flagged the packed output (exit $exit)$detail"
