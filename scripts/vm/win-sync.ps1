#Requires -Version 5.1
<#
.SYNOPSIS
  Apply a checkout archive sent by win-sync.sh.

.DESCRIPTION
  Extracts the archive over the destination, then deletes files listed in the
  previous sync's manifest that are absent from the new one. Only paths the
  sync itself once wrote are ever deleted; build output and node_modules are
  never in a manifest, so they are left alone.

  The one exception is macOS AppleDouble files (`._*`). Archives made without
  COPYFILE_DISABLE carried them, tar on Windows extracts them as ordinary files
  that no manifest names, and their binary content breaks tools that read every
  source file as UTF-8. Every such file outside node_modules and .git is
  deleted unless the manifest itself lists it.
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
$destRoot = [IO.Path]::GetFullPath($Dest).TrimEnd('\')
& "$env:SystemRoot\System32\tar.exe" -xzf $archive -C $Dest
if ($LASTEXITCODE -ne 0) { throw "tar failed with exit $LASTEXITCODE" }

$current = Get-Content $newManifest -Encoding UTF8
# NTFS is case-insensitive, so a case-only rename must not delete the new file.
$keep = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($path in $current) { [void]$keep.Add($path) }
$removed = 0
if (Test-Path $savedManifest) {
  foreach ($path in (Get-Content $savedManifest -Encoding UTF8)) {
    if ($keep.Contains($path)) { continue }
    # Manifest entries are repo-relative. Anything rooted, climbing out, or
    # resolving outside the checkout is refused rather than deleted.
    if ([IO.Path]::IsPathRooted($path) -or ($path -split '[\\/]' -contains '..')) {
      Write-Warning "skipping unsafe manifest entry: $path"
      continue
    }
    $target = [IO.Path]::GetFullPath((Join-Path $destRoot ($path -replace '/', '\')))
    if (-not $target.StartsWith($destRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
      Write-Warning "skipping manifest entry outside ${destRoot}: $path"
      continue
    }
    if (Test-Path -LiteralPath $target -PathType Leaf) {
      Remove-Item -LiteralPath $target -Force
      $removed++
    }
  }
}

# Packages own whatever ships in node_modules. Reparse points are not followed,
# so a junction can never lead the sweep outside the checkout.
$appleDouble = 0
$pending = New-Object 'System.Collections.Generic.Stack[IO.DirectoryInfo]'
$pending.Push([IO.DirectoryInfo]$destRoot)
while ($pending.Count -gt 0) {
  $dir = $pending.Pop()
  foreach ($sub in $dir.EnumerateDirectories()) {
    if ($sub.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
    if ($sub.Name -eq 'node_modules' -or $sub.Name -eq '.git') { continue }
    $pending.Push($sub)
  }
  foreach ($file in $dir.EnumerateFiles('._*')) {
    if (-not $file.Name.StartsWith('._', [StringComparison]::Ordinal)) { continue }
    $relative = $file.FullName.Substring($destRoot.Length + 1) -replace '\\', '/'
    if ($keep.Contains($relative)) { continue }
    Remove-Item -LiteralPath $file.FullName -Force
    $appleDouble++
  }
}
Copy-Item $newManifest $savedManifest -Force
Remove-Item $archive, $newManifest -Force
"synced $($current.Count) files into $Dest, removed $removed stale and $appleDouble AppleDouble"
