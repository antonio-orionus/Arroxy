#Requires -Version 5.1
<#
.SYNOPSIS
  Apply a checkout archive sent by win-sync.sh.

.DESCRIPTION
  Extracts the archive over the destination, then deletes files listed in the
  previous sync's manifest that are absent from the new one. Only paths the
  sync itself once wrote are ever deleted; build output and node_modules are
  never in a manifest, so they are left alone.
#>
param(
  [Parameter(Mandatory = $true)][string]$Dest,
  [Parameter(Mandatory = $true)][string]$Stage
)

$ErrorActionPreference = 'Stop'
$stageDir = Join-Path $HOME $Stage
$archive = Join-Path $stageDir 'arroxy-src.tgz'
$newManifest = Join-Path $stageDir 'manifest.txt'
$savedManifest = Join-Path $Dest '.vm-sync-manifest'

New-Item -ItemType Directory -Force -Path $Dest | Out-Null
& "$env:SystemRoot\System32\tar.exe" -xzf $archive -C $Dest
if ($LASTEXITCODE -ne 0) { throw "tar failed with exit $LASTEXITCODE" }

$current = Get-Content $newManifest -Encoding UTF8
$removed = 0
if (Test-Path $savedManifest) {
  $keep = New-Object 'System.Collections.Generic.HashSet[string]'
  foreach ($path in $current) { [void]$keep.Add($path) }
  foreach ($path in (Get-Content $savedManifest -Encoding UTF8)) {
    if ($keep.Contains($path)) { continue }
    $target = Join-Path $Dest ($path -replace '/', '\')
    if (Test-Path -LiteralPath $target -PathType Leaf) {
      Remove-Item -LiteralPath $target -Force
      $removed++
    }
  }
}
Copy-Item $newManifest $savedManifest -Force
Remove-Item $archive, $newManifest -Force
"synced $($current.Count) files into $Dest, removed $removed stale"
