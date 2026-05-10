#Requires -Version 5.1
<#
.SYNOPSIS
  Build Arroxy from source on a fresh Windows machine.

.DESCRIPTION
  End-to-end automation:
    1. Validates the host (Windows >= 10 1809, x64, ~5 GB free, winget present).
    2. Installs missing tooling via winget (user scope, no admin needed):
         Git, Node.js LTS, Bun (auto-picks AVX2 vs Baseline variant).
    3. Resolves PATH issues:
         - refreshes PATH from registry after install
         - prepends Git Bash so the build's `bash` hook does NOT pick WSL bash
           (WSL bash on Windows lacks `unzip` and breaks the ffmpeg fetch).
    4. Pre-populates the winCodeSign cache with the macOS dylib symlinks
       replaced by file copies. Without this, electron-builder fails on
       non-admin Windows because creating symlinks needs SeCreateSymbolicLink.
    5. Runs `bun install` and `bun run dist:win`.
    6. Copies the resulting installer + portable .exe to OutputDir.

  Re-runnable. Idempotent. Does not require admin.

.PARAMETER RepoPath
  Path to the Arroxy source. Default: current directory.

.PARAMETER CloneRef
  If set, ignores RepoPath and clones github.com/antonio-orionus/Arroxy
  at this tag/branch into ./Arroxy-src. Example: -CloneRef v0.3.1

.PARAMETER OutputDir
  Where to copy the final artifacts. Default: Desktop\Arroxy-build.

.PARAMETER Launch
  Launch the portable .exe after a successful build.

.PARAMETER OpenOutput
  Open the output folder in Explorer after a successful build.

.EXAMPLE
  pwsh -ExecutionPolicy Bypass -File scripts\build\build-windows.ps1
  Build from the repo root (current directory).

.EXAMPLE
  pwsh -ExecutionPolicy Bypass -File scripts\build\build-windows.ps1 -CloneRef v0.3.1 -Launch
  Clone v0.3.1 from GitHub, build, copy to Desktop\Arroxy-build, launch portable.
#>
[CmdletBinding()]
param(
  [string]$RepoPath  = (Get-Location).Path,
  [string]$CloneRef  = '',
  [string]$OutputDir = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Arroxy-build'),
  [switch]$Launch,
  [switch]$OpenOutput
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'  # speeds up Invoke-WebRequest

# ---- helpers ---------------------------------------------------------------

function Write-Step    { param([string]$M) Write-Host "";   Write-Host "==> $M" -ForegroundColor Cyan }
function Write-Ok      { param([string]$M) Write-Host "    [OK] $M" -ForegroundColor Green }
function Write-Notice  { param([string]$M) Write-Host "    [!]  $M" -ForegroundColor Yellow }
function Write-Bad     { param([string]$M) Write-Host "    [X]  $M" -ForegroundColor Red }

function Update-EnvPath {
  $m = [Environment]::GetEnvironmentVariable('Path','Machine')
  $u = [Environment]::GetEnvironmentVariable('Path','User')
  $env:Path = "$m;$u"
}

function Test-CommandExists {
  param([Parameter(Mandatory)][string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-Avx2Support {
  if (-not ('Arroxy.CpuFeature' -as [type])) {
    Add-Type -Namespace 'Arroxy' -Name 'CpuFeature' -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("kernel32.dll")]
public static extern bool IsProcessorFeaturePresent(uint feature);
'@ | Out-Null
  }
  # 40 = PF_AVX2_INSTRUCTIONS_AVAILABLE
  return [Arroxy.CpuFeature]::IsProcessorFeaturePresent(40)
}

function Test-WingetAvailable {
  if (-not (Test-CommandExists 'winget')) { return $false }
  & winget --version *> $null
  return ($LASTEXITCODE -eq 0)
}

function Install-WingetPackage {
  param(
    [Parameter(Mandatory)][string]$Id,
    [string]$Label = $Id,
    [string]$Scope = 'user'
  )
  Write-Host "    installing $Label ..."
  $args = @('install','--id',$Id,'--silent','--accept-source-agreements','--accept-package-agreements')
  if ($Scope) { $args += @('--scope',$Scope) }
  $out = & winget @args 2>&1 | Out-String
  $rc = $LASTEXITCODE
  if ($rc -eq 0) { Write-Ok "$Label installed"; return }
  if ($out -match 'already installed' -or $out -match 'No newer package') {
    Write-Ok "$Label already installed"; return
  }
  # Some packages don't honor --scope user; retry without it once.
  if ($Scope -and $out -match 'scope') {
    Write-Notice "$Label has no user-scope variant; retrying machine-scope (may prompt UAC)"
    $out2 = & winget install --id $Id --silent --accept-source-agreements --accept-package-agreements 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) { Write-Ok "$Label installed"; return }
    throw "winget install $Id failed (rc=$LASTEXITCODE):`n$out2"
  }
  throw "winget install $Id failed (rc=$rc):`n$out"
}

function Get-GitBashBinDir {
  $candidates = @(
    'C:\Program Files\Git\bin',
    'C:\Program Files (x86)\Git\bin',
    "$env:LOCALAPPDATA\Programs\Git\bin"
  )
  foreach ($c in $candidates) {
    if (Test-Path (Join-Path $c 'bash.exe')) { return $c }
  }
  $gitCmd = Get-Command git -ErrorAction SilentlyContinue
  if ($gitCmd) {
    $maybe = Join-Path (Split-Path -Parent (Split-Path -Parent $gitCmd.Source)) 'bin'
    if (Test-Path (Join-Path $maybe 'bash.exe')) { return $maybe }
  }
  return $null
}

function Get-BunExe {
  $roots = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Oven-sh.Bun.Baseline_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64-baseline",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64",
    "$env:USERPROFILE\.bun\bin"
  )
  foreach ($r in $roots) {
    $p = Join-Path $r 'bun.exe'
    if (Test-Path $p) { return $p }
  }
  $cmd = Get-Command bun -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

function Test-BunRunnable {
  param([string]$BunPath)
  if (-not $BunPath -or -not (Test-Path $BunPath)) { return $false }
  & $BunPath --version *> $null
  return ($LASTEXITCODE -eq 0)
}

# ---- pre-flight ------------------------------------------------------------

Write-Step "preflight"

if (-not [Environment]::Is64BitOperatingSystem) {
  throw "32-bit Windows is not supported. Build target is x64 only."
}
$arch = $env:PROCESSOR_ARCHITECTURE
if ($arch -ne 'AMD64') {
  Write-Notice "PROCESSOR_ARCHITECTURE=$arch -- the upstream electron-builder target in this repo is x64. ARM64 builds are not configured."
}

$build = [int](Get-CimInstance Win32_OperatingSystem).BuildNumber
if ([Environment]::OSVersion.Version.Major -lt 10) {
  throw "Windows 10 or newer required (got $([Environment]::OSVersion.VersionString))."
}
if ($build -lt 17763) {
  Write-Notice "Windows build $build is older than 1809; winget may be missing."
}
Write-Ok "Windows build $build, $arch"
Write-Ok "PowerShell $($PSVersionTable.PSVersion)"

$drv = (Get-Item $env:TEMP).PSDrive
$freeGB = [math]::Round($drv.Free / 1GB, 1)
if ($freeGB -lt 5) {
  Write-Notice "Free space on $($drv.Name): is ${freeGB} GB; build needs ~5 GB for node_modules + Electron + dist."
} else {
  Write-Ok "Free disk on $($drv.Name): ${freeGB} GB"
}

if (-not (Test-WingetAvailable)) {
  throw @"
winget is not available on this system.
  - Windows 11: built-in.
  - Windows 10 1809+: install 'App Installer' from the Microsoft Store, then re-run this script.
  - Windows 10 < 1809 or Windows 8.1: not supported by this script.
"@
}
Write-Ok "winget present"

# ---- repo resolution -------------------------------------------------------

if ($CloneRef -ne '') {
  $RepoPath = Join-Path (Get-Location).Path 'Arroxy-src'
  Write-Step "fetching antonio-orionus/Arroxy@$CloneRef -> $RepoPath"
  if (-not (Test-CommandExists 'git')) {
    Install-WingetPackage -Id 'Git.Git' -Label 'Git for Windows'
    Update-EnvPath
  }
  if (Test-Path $RepoPath) {
    Write-Notice "$RepoPath already exists; reusing it as-is. Delete it manually for a clean clone."
  } else {
    git clone --depth 1 --branch $CloneRef https://github.com/antonio-orionus/Arroxy.git $RepoPath
    if ($LASTEXITCODE -ne 0) { throw "git clone failed (rc=$LASTEXITCODE)" }
  }
}

if (-not (Test-Path (Join-Path $RepoPath 'package.json'))) {
  throw "No package.json at '$RepoPath'. Pass -RepoPath <dir> or -CloneRef <tag>."
}
$pkg = Get-Content (Join-Path $RepoPath 'package.json') -Raw | ConvertFrom-Json
if ($pkg.name -ne 'arroxy') {
  throw "package.json at '$RepoPath' does not look like Arroxy (name='$($pkg.name)')."
}
$RepoPath = (Resolve-Path $RepoPath).Path
Write-Ok "repo: $RepoPath (arroxy@$($pkg.version))"

# ---- tooling ---------------------------------------------------------------

Write-Step "ensuring tooling: Git, Node.js, Bun"

if (-not (Test-CommandExists 'git')) {
  Install-WingetPackage -Id 'Git.Git' -Label 'Git for Windows'
  Update-EnvPath
}
Write-Ok "git: $(git --version)"

if (-not (Test-CommandExists 'node')) {
  Install-WingetPackage -Id 'OpenJS.NodeJS.LTS' -Label 'Node.js LTS'
  Update-EnvPath
}
Write-Ok "node: $(node --version)"

# Bun: AVX2-aware. If a Bun is already installed but doesn't run on this CPU,
# swap variants. This handles "previous user installed AVX2 build, current
# CPU is pre-Haswell" gracefully.
$avx2 = Test-Avx2Support
if ($avx2) {
  $bunIdPrimary  = 'Oven-sh.Bun';          $bunLabelPrimary  = 'Bun (AVX2)'
  $bunIdFallback = 'Oven-sh.Bun.Baseline'; $bunLabelFallback = 'Bun.Baseline'
} else {
  $bunIdPrimary  = 'Oven-sh.Bun.Baseline'; $bunLabelPrimary  = 'Bun.Baseline (no AVX2)'
  $bunIdFallback = 'Oven-sh.Bun';          $bunLabelFallback = 'Bun (AVX2)'
}

$bunPath = Get-BunExe
if (-not $bunPath -or -not (Test-BunRunnable $bunPath)) {
  if ($bunPath) {
    Write-Notice "existing Bun at $bunPath is not runnable on this CPU (likely AVX2 mismatch); reinstalling."
    & winget uninstall --id Oven-sh.Bun --silent *> $null
    & winget uninstall --id Oven-sh.Bun.Baseline --silent *> $null
  }
  Install-WingetPackage -Id $bunIdPrimary -Label $bunLabelPrimary
  Update-EnvPath
  $bunPath = Get-BunExe
  if (-not (Test-BunRunnable $bunPath)) {
    Write-Notice "$bunLabelPrimary cannot run; falling back to $bunLabelFallback"
    & winget uninstall --id $bunIdPrimary --silent *> $null
    Install-WingetPackage -Id $bunIdFallback -Label $bunLabelFallback
    Update-EnvPath
    $bunPath = Get-BunExe
    if (-not (Test-BunRunnable $bunPath)) {
      throw "Bun is not runnable on this machine. Aborting."
    }
  }
}
Write-Ok "bun: $(& $bunPath --version) at $bunPath"

# Git Bash (the build's beforeBuild.cjs spawns `bash` to fetch ffmpeg).
$gitBashBin = Get-GitBashBinDir
if (-not $gitBashBin) {
  throw "Git Bash binary not found. Reinstall 'Git for Windows' (which ships MSYS bash + curl + tar + unzip)."
}
Write-Ok "git bash: $gitBashBin"

# Prepend bun + Git Bash to PATH for this session. Order matters:
# Git Bash bin must come BEFORE C:\Windows\System32 so `bash` resolves to MSYS
# bash, not WSL bash (which lacks `unzip` and breaks fetch-embedded.sh).
$bunDir = Split-Path -Parent $bunPath
$env:Path = "$bunDir;$gitBashBin;$env:Path"
$resolvedBash = (Get-Command bash -ErrorAction SilentlyContinue).Source
if ($resolvedBash -notlike "$gitBashBin*") {
  Write-Notice "bash resolves to '$resolvedBash' instead of MSYS bash. The build may fail."
} else {
  Write-Ok "bash resolves to MSYS bash"
}

# ---- bun install + winCodeSign prep + build --------------------------------

Push-Location $RepoPath
try {
  Write-Step "bun install (~900 packages, 2-5 min on warm cache, longer on cold)"
  & $bunPath install
  if ($LASTEXITCODE -ne 0) { throw "bun install failed (rc=$LASTEXITCODE)" }
  Write-Ok "dependencies installed"

  # winCodeSign: the archive ships macOS dylib SYMLINKS. On non-admin Windows
  # 7za can't materialize them (SeCreateSymbolicLink missing). Pre-extract
  # ourselves and replace the 0-byte stubs with copies of the real .dylib.
  Write-Step "preparing winCodeSign cache (non-admin symlink workaround)"
  $cacheDir    = Join-Path $env:LOCALAPPDATA 'electron-builder\Cache\winCodeSign'
  $cacheTarget = Join-Path $cacheDir 'winCodeSign-2.6.0'
  $libDir      = Join-Path $cacheTarget 'darwin\10.12\lib'
  $libcrypto   = Join-Path $libDir 'libcrypto.dylib'
  $libssl      = Join-Path $libDir 'libssl.dylib'

  $needsRebuild = $true
  if ((Test-Path $libcrypto) -and (Test-Path $libssl)) {
    $sz1 = (Get-Item $libcrypto).Length
    $sz2 = (Get-Item $libssl).Length
    if ($sz1 -gt 0 -and $sz2 -gt 0) { $needsRebuild = $false }
  }

  if ($needsRebuild) {
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
    if (Test-Path $cacheTarget) { Remove-Item $cacheTarget -Recurse -Force }
    # Drop any half-extracted retry blobs from a prior failed run.
    Get-ChildItem $cacheDir -File -ErrorAction SilentlyContinue |
      Where-Object { $_.Extension -eq '.7z' } |
      Remove-Item -Force -ErrorAction SilentlyContinue

    $sevenZa = Join-Path $RepoPath 'node_modules\7zip-bin\win\x64\7za.exe'
    if (-not (Test-Path $sevenZa)) {
      throw "$sevenZa missing -- bun install did not populate node_modules\7zip-bin"
    }

    $archive = Join-Path $env:TEMP 'arroxy-winCodeSign-2.6.0.7z'
    if (-not (Test-Path $archive)) {
      Write-Host "    downloading winCodeSign-2.6.0.7z (5.5 MB)..."
      Invoke-WebRequest -UseBasicParsing `
        -Uri 'https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z' `
        -OutFile $archive
    }

    Write-Host "    extracting (symlink errors expected; we patch them after)"
    # Start-Process avoids tripping the PS error pipeline on 7za's non-zero
    # exit (which it returns purely because of the 2 symlinks it can't make).
    Start-Process -FilePath $sevenZa `
      -ArgumentList @('x','-aoa','-bb0','-bd',"-o$cacheTarget",$archive) `
      -Wait -NoNewWindow

    foreach ($pair in @(
      @{ link = 'libcrypto.dylib'; src = 'libcrypto.1.0.0.dylib' },
      @{ link = 'libssl.dylib';    src = 'libssl.1.0.0.dylib' }
    )) {
      $lp = Join-Path $libDir $pair.link
      $sp = Join-Path $libDir $pair.src
      $needs = $true
      if (Test-Path $lp) { if ((Get-Item $lp).Length -gt 0) { $needs = $false } }
      if ($needs -and (Test-Path $sp)) {
        Copy-Item $sp $lp -Force
      }
    }
    Remove-Item $archive -Force -ErrorAction SilentlyContinue
    Write-Ok "winCodeSign cache prepared"
  } else {
    Write-Ok "winCodeSign cache already valid"
  }

  Write-Step "bun run dist:win (5-15 min: typecheck, vite, ffmpeg fetch, electron-builder)"
  & $bunPath run dist:win
  if ($LASTEXITCODE -ne 0) { throw "build failed (rc=$LASTEXITCODE)" }
  Write-Ok "build succeeded"
}
finally {
  Pop-Location
}

# ---- ship artifacts --------------------------------------------------------

Write-Step "copying artifacts to $OutputDir"
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$distDir = Join-Path $RepoPath 'dist'
$artifacts = Get-ChildItem $distDir -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^Arroxy-(Setup|Portable)-.*\.exe$' }
if (-not $artifacts) {
  throw "no Arroxy installers found in $distDir (build said success -- check output above)"
}
$copied = @()
foreach ($a in $artifacts) {
  $dst = Join-Path $OutputDir $a.Name
  Copy-Item $a.FullName $dst -Force
  $copied += $dst
  Write-Ok "$($a.Name) ($([math]::Round($a.Length/1MB,1)) MB)"
}

Write-Step "done"
foreach ($p in $copied) { Write-Host "    $p" }

if ($OpenOutput) {
  Start-Process explorer.exe -ArgumentList $OutputDir
}
if ($Launch) {
  $portable = $copied | Where-Object { $_ -match 'Arroxy-Portable' } | Select-Object -First 1
  if ($portable) {
    Start-Process $portable
    Write-Ok "launched $portable"
  }
}
