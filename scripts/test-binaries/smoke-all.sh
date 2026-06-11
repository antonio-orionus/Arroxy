#!/usr/bin/env bash
# Smoke test every third-party binary URL source Arroxy currently depends on:
#   - yt-dlp nightly + stable runtime downloads, including SourceForge fallback
#   - deno runtime downloads, including GitHub fallback
#   - build-time embedded ffmpeg/ffprobe sources used by fetch-embedded.sh
#
# The matrix mirrors src/main/services/BinaryManager.ts plus
# scripts/build/fetch-embedded.sh. BtbN asset resolution is shared with the
# production fetcher so the smoke harness catches resolver drift directly.
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/test-binaries"
mkdir -p "$OUT"

source "$(dirname "$0")/_lib.sh"

PAYLOAD_PLAN=0
PAYLOAD_PASS=0
declare -A PLANNED_PAYLOADS=()
declare -A PASSED_PAYLOADS=()

plan_payload() {
  local id="$1"
  if [[ -z "${PLANNED_PAYLOADS[$id]+x}" ]]; then
    PLANNED_PAYLOADS[$id]=1
    PAYLOAD_PLAN=$((PAYLOAD_PLAN+1))
  fi
}

pass_payload_if_clean() {
  local id="$1"
  local failures_before="$2"
  if (( FAIL != failures_before )); then
    return 0
  fi
  if [[ -z "${PLANNED_PAYLOADS[$id]+x}" ]]; then
    fail "payload passed without being planned: $id"
    return 0
  fi
  if [[ -z "${PASSED_PAYLOADS[$id]+x}" ]]; then
    PASSED_PAYLOADS[$id]=1
    PAYLOAD_PASS=$((PAYLOAD_PASS+1))
  fi
}

count_nonempty_lines() {
  awk 'NF {count++} END {print count+0}'
}

##########################################################################
# yt-dlp - nightly + stable runtime downloads
##########################################################################
declare -A YTDLP_ASSETS=(
  [win32-x64]=yt-dlp.exe
  [win32-arm64]=yt-dlp.exe
  [darwin-x64]=yt-dlp_macos
  [darwin-arm64]=yt-dlp_macos
  [linux-x64]=yt-dlp_linux
  [linux-arm64]=yt-dlp_linux_aarch64
)

unique_ytdlp_payload_count() {
  printf '%s\n' "${YTDLP_ASSETS[@]}" | sort -u | count_nonempty_lines
}

expected_payload_count() {
  local yt_dlp_count btbn_count deno_count martin_riedl_count
  yt_dlp_count=$(unique_ytdlp_payload_count)
  btbn_count=$(bun "$ROOT/scripts/build/btbnResolver.ts" --list-targets | count_nonempty_lines)
  deno_count=$(bun "$ROOT/scripts/build/denoResolver.ts" --list-targets | count_nonempty_lines)
  martin_riedl_count=4

  # yt-dlp: nightly GitHub + stable GitHub + stable SourceForge.
  # Deno: dl.deno.land + GitHub fallback.
  echo $(( yt_dlp_count * 3 + btbn_count + martin_riedl_count + deno_count * 2 ))
}

if [[ "${1:-}" == "--expected-payloads" ]]; then
  expected_payload_count
  exit 0
fi

echo
echo '########## yt-dlp ##########'

smoke_ytdlp_assets() {
  local channel="$1"
  local base="$2"
  local download_suffix="${3:-}"
  sums="$OUT/yt-dlp/$channel/SHA2-256SUMS"
  fetch "$base/SHA2-256SUMS${download_suffix}" "$sums" || return
  ok "fetched $channel SHA2-256SUMS"

  declare -A seen_assets=()
  for combo in "${!YTDLP_ASSETS[@]}"; do
    asset="${YTDLP_ASSETS[$combo]}"
    [[ -n "${seen_assets[$asset]:-}" ]] && continue
    seen_assets[$asset]=1

    target="$OUT/yt-dlp/$channel/$asset"
    payload_id="yt-dlp/$channel/$asset"
    plan_payload "$payload_id"
    failures_before=$FAIL
    note "fetching $channel/$asset"
    fetch "$base/$asset${download_suffix}" "$target" || continue

    expected=$(sha_for_asset "$sums" "$asset")
    if [[ -z "$expected" ]]; then
      fail "no SHA listed for $channel/$asset"
    else
      verify_sha "$target" "$expected" "$channel/$asset"
    fi

    case "$asset" in
      yt-dlp.exe)    check_magic "$target" 'PE32(\+)? executable.*Windows' "$channel/$asset" ;;
      yt-dlp_macos) check_magic "$target" 'Mach-O' "$channel/$asset" ;;
      yt-dlp_linux*) check_magic "$target" 'ELF.*executable' "$channel/$asset" ;;
    esac
    pass_payload_if_clean "$payload_id" "$failures_before"
  done
}

for channel in nightly stable; do
  if [[ "$channel" == nightly ]]; then
    base=https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download
  else
    base=https://github.com/yt-dlp/yt-dlp/releases/latest/download
  fi

  smoke_ytdlp_assets "$channel" "$base"
done

yt_dlp_sourceforge_rss=https://sourceforge.net/projects/yt-dlp.mirror/rss?path=/
yt_dlp_sourceforge_files=https://sourceforge.net/projects/yt-dlp.mirror/files
sourceforge_rss="$OUT/yt-dlp/sourceforge/rss.xml"
if fetch "$yt_dlp_sourceforge_rss" "$sourceforge_rss"; then
  sourceforge_version=$(grep -oE '/yt-dlp\.mirror/files/[0-9]{4}\.[0-9]{2}\.[0-9]{2}/' "$sourceforge_rss" | sed -E 's#.*files/([0-9]{4}\.[0-9]{2}\.[0-9]{2})/.*#\1#' | head -1)
  if [[ -z "$sourceforge_version" ]]; then
    fail "cannot parse SourceForge yt-dlp latest version from RSS"
  else
    ok "SourceForge yt-dlp latest version: $sourceforge_version"
    smoke_ytdlp_assets "sourceforge-stable" "$yt_dlp_sourceforge_files/$sourceforge_version" "/download"
  fi
fi

##########################################################################
# BtbN ffmpeg/ffprobe - build-time embedded Win/Linux shared archives
##########################################################################
echo
echo '########## BtbN ffmpeg + ffprobe shared archives ##########'

resolve_btbn_with_retry() {
  local combo="$1"
  local resolution="$2"
  local attempt
  for attempt in 1 2 3; do
    if bun "$ROOT/scripts/build/btbnResolver.ts" --target "$combo" > "$resolution"; then
      return 0
    fi
    rm -f "$resolution"
    if (( attempt < 3 )); then
      note "BtbN resolve failed for $combo; retrying in $((attempt * 5))s"
      sleep $((attempt * 5))
    fi
  done
  note "BtbN recent-release resolution failed for $combo; trying latest tag fallback"
  for attempt in 1 2; do
    if BTBN_RELEASE_TAG=latest bun "$ROOT/scripts/build/btbnResolver.ts" --target "$combo" > "$resolution"; then
      warn "BtbN recent-release API unavailable for $combo; smoked latest tag fallback"
      return 0
    fi
    rm -f "$resolution"
    if (( attempt < 2 )); then
      note "BtbN latest tag fallback failed for $combo; retrying in 5s"
      sleep 5
    fi
  done
  return 1
}

btbn_dir="$OUT/btbn"
targets_file="$btbn_dir/targets.txt"
mkdir -p "$btbn_dir"
if ! bun "$ROOT/scripts/build/btbnResolver.ts" --list-targets > "$targets_file"; then
  fail "list BtbN targets"
  exit 1
fi

while IFS= read -r combo; do
  [[ -z "$combo" ]] && continue
  combo_dir="$btbn_dir/$combo"
  mkdir -p "$combo_dir"
  resolution="$combo_dir/resolution.env"
  note "resolving BtbN $combo"
  if ! resolve_btbn_with_retry "$combo" "$resolution"; then
    fail "resolve BtbN $combo"
    continue
  fi
  if [[ ! -s "$resolution" ]] || ! grep -q '^BTBN_ARCH=' "$resolution" || ! grep -q '^BTBN_ASSET_URL=' "$resolution"; then
    fail "BtbN resolver returned empty/malformed output for $combo"
    continue
  fi

  # shellcheck source=/dev/null
  source "$resolution"
  btbn_arch="${BTBN_ARCH:?}"
  ext="${BTBN_ARCHIVE_EXT:?}"
  asset="${BTBN_ASSET_NAME:?}"
  asset_url="${BTBN_ASSET_URL:?}"
  checksums_url="${BTBN_CHECKSUMS_URL:?}"
  release_tag="${BTBN_RESOLVED_RELEASE_TAG:?}"
  btbn_sums="$combo_dir/checksums.sha256"
  target="$combo_dir/$asset"
  payload_id="btbn/$combo/$asset"
  plan_payload "$payload_id"
  failures_before=$FAIL
  note "fetching $asset from $release_tag"
  fetch "$checksums_url" "$btbn_sums" || continue
  fetch "$asset_url" "$target" || continue

  expected=""
  [[ -f "$btbn_sums" ]] && expected=$(sha_for_asset "$btbn_sums" "$asset")
  if [[ -z "$expected" ]]; then
    fail "no SHA for $asset in BtbN checksums.sha256 ($release_tag)"
  else
    verify_sha "$target" "$expected" "$asset"
  fi

  extract_dir="$combo_dir/extracted"
  rm -rf "$extract_dir"
  if [[ "$asset" == *.zip ]]; then
    extract_zip "$target" "$extract_dir" || { fail "extract failed: $asset"; continue; }
  else
    extract_tarxz "$target" "$extract_dir" || { fail "extract failed: $asset"; continue; }
  fi
  ok "extracted $asset"

  case "$combo" in
    win32-*)
      for exe in ffmpeg.exe ffprobe.exe; do
        inner=$(find "$extract_dir" -type f -name "$exe" | head -1)
        if [[ -n "$inner" ]]; then
          check_magic "$inner" 'PE32(\+)? executable.*Windows' "$asset/$exe"
        else
          fail "no $exe inside $asset"
        fi
      done
      dll_count=$(find "$extract_dir" -type f -name '*.dll' | wc -l | tr -d ' ')
      if (( dll_count > 0 )); then ok "Windows DLL siblings present: $dll_count"; else fail "no DLL siblings inside $asset"; fi
      ;;
    linux-*)
      for bin in ffmpeg ffprobe; do
        inner=$(find "$extract_dir" -type f -name "$bin" | head -1)
        if [[ -n "$inner" ]]; then
          check_magic "$inner" 'ELF.*executable' "$asset/$bin"
        else
          fail "no $bin inside $asset"
        fi
      done
      so_count=$(find "$extract_dir" -name 'lib*.so*' | wc -l | tr -d ' ')
      if (( so_count > 0 )); then ok "Linux shared-library siblings present: $so_count"; else fail "no lib*.so* siblings inside $asset"; fi
      ;;
  esac
  pass_payload_if_clean "$payload_id" "$failures_before"
done < "$targets_file"

##########################################################################
# Martin-Riedl ffmpeg/ffprobe - build-time embedded macOS ZIPs
##########################################################################
echo
echo '########## Martin-Riedl macOS ffmpeg + ffprobe ##########'

for arch in amd64 arm64; do
  index="$OUT/martin-riedl/$arch/index.html"
  note "fetching Martin-Riedl index for macos/$arch"
  fetch "https://ffmpeg.martin-riedl.de/" "$index" || continue

  prefix=$(grep -oE "/download/macos/${arch}/[0-9]+_N-[0-9a-zA-Z-]+/" "$index" | head -1)
  if [[ -z "$prefix" ]]; then
    fail "cannot parse Martin-Riedl index for macos/$arch"
    continue
  fi
  base="https://ffmpeg.martin-riedl.de${prefix}"
  ok "Martin-Riedl macos/$arch prefix: $prefix"

  for bin in ffmpeg ffprobe; do
    target="$OUT/martin-riedl/$arch/$bin.zip"
    shafile="$target.sha256"
    payload_id="martin-riedl/$arch/$bin.zip"
    plan_payload "$payload_id"
    failures_before=$FAIL
    note "fetching Martin-Riedl macos/$arch $bin.zip"
    fetch "$base$bin.zip" "$target" || continue
    fetch "$base$bin.zip.sha256" "$shafile" || continue

    expected=$(awk '{print $1; exit}' "$shafile")
    verify_sha "$target" "$expected" "martin-riedl/$arch/$bin.zip"

    extract_dir="$OUT/martin-riedl/$arch/${bin}-extracted"
    rm -rf "$extract_dir"
    if extract_zip "$target" "$extract_dir"; then
      ok "extracted martin-riedl/$arch/$bin.zip"
      inner=$(find "$extract_dir" -type f -name "$bin" -not -path '*/__MACOSX/*' | head -1)
      if [[ -n "$inner" ]]; then
        check_magic "$inner" 'Mach-O' "martin-riedl/$arch/$bin"
      else
        fail "no $bin inside martin-riedl/$arch/$bin.zip"
      fi
    else
      fail "extract failed: martin-riedl/$arch/$bin.zip"
    fi
    pass_payload_if_clean "$payload_id" "$failures_before"
  done
done

##########################################################################
# deno - runtime JS runtime downloads
##########################################################################
echo
echo '########## deno ##########'

smoke_deno_assets() {
  local provider="$1"
  local use_github_fallback="${2:-0}"
  local targets_file="$OUT/deno/$provider-targets.txt"
  mkdir -p "$OUT/deno"
  if ! bun "$ROOT/scripts/build/denoResolver.ts" --list-targets > "$targets_file"; then
    fail "list Deno targets"
    return
  fi

  while IFS= read -r combo; do
    [[ -z "$combo" ]] && continue
    combo_dir="$OUT/deno/$provider/$combo"
    mkdir -p "$combo_dir"
    resolution="$combo_dir/resolution.env"
    if ! bun "$ROOT/scripts/build/denoResolver.ts" --target "$combo" > "$resolution"; then
      fail "resolve Deno $combo"
      continue
    fi
    if [[ ! -s "$resolution" ]] || ! grep -q '^DENO_TRIPLE=' "$resolution" || ! grep -q '^DENO_ASSET_URL=' "$resolution"; then
      fail "Deno resolver returned empty/malformed output for $combo"
      continue
    fi

    # shellcheck source=/dev/null
    source "$resolution"
    target_triple="${DENO_TRIPLE:?}"
    asset="${DENO_ASSET_NAME:?}"
    asset_url="${DENO_ASSET_URL:?}"
    checksum_url="${DENO_CHECKSUM_URL:?}"
    inner_name="${DENO_EXECUTABLE_NAME:?}"
    if [[ "$use_github_fallback" == "1" ]]; then
      asset_url="https://github.com/denoland/deno/releases/latest/download/$asset"
      checksum_url="$asset_url.sha256sum"
    fi

    target="$combo_dir/$asset"
    payload_id="deno/$provider/$combo/$asset"
    plan_payload "$payload_id"
    failures_before=$FAIL
    note "fetching $provider/$asset"
    fetch "$asset_url" "$target" || continue

    shafile="$target.sha256sum"
    if fetch "$checksum_url" "$shafile"; then
      expected=$(cd "$ROOT" && bun -e "import {readFileSync} from 'node:fs'; import {parseDenoSha256} from './src/main/services/binary/DenoBinarySource.ts'; const file = process.argv.at(-1); console.log(file ? (parseDenoSha256(readFileSync(file, 'utf8')) ?? '') : '')" "$shafile")
      if [[ -z "$expected" ]]; then
        fail "could not parse $provider/$asset.sha256sum"
      else
        verify_sha "$target" "$expected" "$provider/deno/$target_triple"
      fi
    else
      fail "no .sha256sum for $provider/$asset"
    fi

    extract_dir="$OUT/deno/$provider/$target_triple/extracted"
    rm -rf "$extract_dir"
    if extract_zip "$target" "$extract_dir"; then
      ok "extracted $provider/$asset"
      case "$target_triple" in
        *-windows-*) pattern='PE32(\+)? executable.*Windows' ;;
        *-apple-*) pattern='Mach-O' ;;
        *-linux-*) pattern='ELF.*executable' ;;
      esac
      inner=$(find "$extract_dir" -type f -name "$inner_name" | head -1)
      if [[ -n "$inner" ]]; then
        check_magic "$inner" "$pattern" "$provider/deno/$target_triple"
      else
        fail "no $inner_name inside $provider/$asset"
      fi
    else
      fail "extract failed: $provider/$asset"
    fi
    pass_payload_if_clean "$payload_id" "$failures_before"
  done < "$targets_file"
}

smoke_deno_assets deno-land
smoke_deno_assets github 1

EXPECTED_PAYLOADS=""
if EXPECTED_PAYLOADS=$(expected_payload_count); then
  if (( PAYLOAD_PLAN != EXPECTED_PAYLOADS )); then
    fail "payload plan count mismatch: planned $PAYLOAD_PLAN, expected $EXPECTED_PAYLOADS"
  fi
else
  warn "could not compute expected payload count"
fi

if (( PAYLOAD_PASS != PAYLOAD_PLAN )); then
  fail "payload smoke incomplete: passed $PAYLOAD_PASS of $PAYLOAD_PLAN planned payloads"
fi

echo
echo '########## SUMMARY ##########'
echo "PASS: $PASS"
if [[ -n "$EXPECTED_PAYLOADS" ]]; then
  echo "PAYLOADS: $PAYLOAD_PASS/$PAYLOAD_PLAN expected=$EXPECTED_PAYLOADS"
else
  echo "PAYLOADS: $PAYLOAD_PASS/$PAYLOAD_PLAN"
fi
echo "WARN: $WARN"
echo "FAIL: $FAIL"
if (( ${#ISSUES[@]} > 0 )); then
  echo
  echo 'Issues:'
  printf '  %s\n' "${ISSUES[@]}"
fi
exit $(( FAIL > 0 ? 1 : 0 ))
