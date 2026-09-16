#Requires -Version 5.1
<#
.SYNOPSIS
  Run the Arroxy download smoke for a grid of cases and print one row per case.

.DESCRIPTION
  Each case launches Arroxy headless with ARROXY_SMOKE_KIND=download and changes
  one input at a time (cookies, proxy, YouTube player clients). The app runs the
  production download request, stops once yt-dlp has chosen formats, and prints
  an ARROXY_DOWNLOAD_SMOKE_RESULT line that this script tabulates.

  Every case uses an isolated ELECTRON_USER_DATA under %TEMP%, so the real
  settings, queue, and logs of the Arroxy install are never read or changed.
  Browser cookies are still read from the real browser profile.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File download-smoke-matrix.ps1 `
    -Exe "$env:LOCALAPPDATA\Programs\arroxy\Arroxy.exe" `
    -Url https://www.youtube.com/watch?v=z1NNgSu8hTI -Browser firefox -Proxy http://127.0.0.1:10808
#>
param(
  [Parameter(Mandatory = $true)][string]$Exe,
  [Parameter(Mandatory = $true)][string]$Url,
  [string]$Browser = 'firefox',
  [string]$CookiesFile = '',
  [string]$Proxy = '',
  [string]$ProfileId = '',
  [int]$TimeoutMs = 180000
)

$ErrorActionPreference = 'Stop'
$resultPrefix = 'ARROXY_DOWNLOAD_SMOKE_RESULT '
$work = Join-Path $env:TEMP 'arroxy-download-smoke'
$userData = Join-Path $work 'userdata'
New-Item -ItemType Directory -Force -Path $userData | Out-Null

$proxyValue = if ($Proxy) { $Proxy } else { 'off' }
$cases = New-Object System.Collections.Generic.List[hashtable]
$cases.Add(@{Name = 'no-cookies'; Cookies = 'off'; Proxy = $proxyValue; Clients = $null })
$cases.Add(@{Name = "cookies-$Browser"; Cookies = "browser:$Browser"; Proxy = $proxyValue; Clients = $null })
$cases.Add(@{Name = "cookies-$Browser-ytdlp-default-clients"; Cookies = "browser:$Browser"; Proxy = $proxyValue; Clients = 'none' })
if ($CookiesFile) { $cases.Add(@{Name = 'cookies-file'; Cookies = "file:$CookiesFile"; Proxy = $proxyValue; Clients = $null }) }
if ($Proxy) {
  $cases.Add(@{Name = "cookies-$Browser-no-proxy"; Cookies = "browser:$Browser"; Proxy = 'off'; Clients = $null })
  $cases.Add(@{Name = 'no-cookies-no-proxy'; Cookies = 'off'; Proxy = 'off'; Clients = $null })
}

$smokeVars = 'ARROXY_SMOKE_KIND', 'ARROXY_SMOKE_URL', 'ARROXY_SMOKE_COOKIES', 'ARROXY_SMOKE_PROXY', 'ARROXY_SMOKE_PROFILE', 'ARROXY_SMOKE_PLAYER_CLIENTS', 'ARROXY_SMOKE_TIMEOUT_MS', 'ELECTRON_USER_DATA'
function Clear-SmokeEnv {
  foreach ($name in $smokeVars) { Remove-Item "Env:$name" -ErrorAction SilentlyContinue }
}

$rows = foreach ($case in $cases) {
  Clear-SmokeEnv
  $env:ELECTRON_USER_DATA = $userData
  $env:ARROXY_SMOKE_KIND = 'download'
  $env:ARROXY_SMOKE_URL = $Url
  $env:ARROXY_SMOKE_COOKIES = $case.Cookies
  $env:ARROXY_SMOKE_PROXY = $case.Proxy
  $env:ARROXY_SMOKE_TIMEOUT_MS = "$TimeoutMs"
  if ($ProfileId) { $env:ARROXY_SMOKE_PROFILE = $ProfileId }
  if ($case.Clients) { $env:ARROXY_SMOKE_PLAYER_CLIENTS = $case.Clients }

  $out = Join-Path $work "$($case.Name).out.txt"
  $err = Join-Path $work "$($case.Name).err.txt"
  Write-Host "running $($case.Name) ..."
  Start-Process -FilePath $Exe -Wait -NoNewWindow -RedirectStandardOutput $out -RedirectStandardError $err | Out-Null

  $line = Get-Content $out -Encoding UTF8 | Where-Object { $_.StartsWith($resultPrefix) } | Select-Object -Last 1
  if (-not $line) {
    [pscustomobject]@{ Case = $case.Name; Outcome = 'no-report'; Format = ''; MaxHeight = ''; Clients = ''; SabrSkipped = ''; Error = "see $out" }
    continue
  }
  $r = $line.Substring($resultPrefix.Length) | ConvertFrom-Json
  [pscustomobject]@{
    Case        = $case.Name
    Outcome     = $r.outcome
    Format      = $r.selection.selectedFormat
    MaxHeight   = $r.selection.maxHeight
    Clients     = ($r.observed.playerApiClients -join ',')
    SabrSkipped = ($r.observed.sabrSkippedClients -join ',')
    Error       = $r.error
  }
}
Clear-SmokeEnv

$rows | Format-Table -AutoSize | Out-String -Width 300
"Raw output: $work"
