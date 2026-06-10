#!/usr/bin/env bash
# Smoke test every third-party binary source Arroxy currently depends on:
#   - yt-dlp nightly + stable runtime downloads
#   - deno runtime downloads
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

##########################################################################
# yt-dlp - nightly + stable runtime downloads
##########################################################################
echo
echo '########## yt-dlp ##########'

declare -A YTDLP_ASSETS=(
  [win32-x64]=yt-dlp.exe
  [win32-arm64]=yt-dlp.exe
  [darwin-x64]=yt-dlp_macos
  [darwin-arm64]=yt-dlp_macos
  [linux-x64]=yt-dlp_linux
  [linux-arm64]=yt-dlp_linux_aarch64
)

for channel in nightly stable; do
  if [[ "$channel" == nightly ]]; then
    base=https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download
  else
    base=https://github.com/yt-dlp/yt-dlp/releases/latest/download
  fi

  sums="$OUT/yt-dlp/$channel/SHA2-256SUMS"
  fetch "$base/SHA2-256SUMS" "$sums" || continue
  ok "fetched $channel SHA2-256SUMS"

  declare -A seen_assets=()
  for combo in "${!YTDLP_ASSETS[@]}"; do
    asset="${YTDLP_ASSETS[$combo]}"
    [[ -n "${seen_assets[$asset]:-}" ]] && continue
    seen_assets[$asset]=1

    target="$OUT/yt-dlp/$channel/$asset"
    note "fetching $channel/$asset"
    fetch "$base/$asset" "$target" || continue

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
  done
done

##########################################################################
# BtbN ffmpeg/ffprobe - build-time embedded Win/Linux shared archives
##########################################################################
echo
echo '########## BtbN ffmpeg + ffprobe shared archives ##########'

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
  if ! bun "$ROOT/scripts/build/btbnResolver.ts" --target "$combo" > "$resolution"; then
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
  done
done

##########################################################################
# deno - runtime JS runtime downloads
##########################################################################
echo
echo '########## deno ##########'

DENO_BASE=https://github.com/denoland/deno/releases/latest/download
for target_triple in \
  x86_64-pc-windows-msvc \
  x86_64-apple-darwin \
  aarch64-apple-darwin \
  x86_64-unknown-linux-gnu \
  aarch64-unknown-linux-gnu
do
  asset="deno-$target_triple.zip"
  target="$OUT/deno/$target_triple/$asset"
  note "fetching $asset"
  fetch "$DENO_BASE/$asset" "$target" || continue

  shafile="$target.sha256sum"
  if fetch "$DENO_BASE/$asset.sha256sum" "$shafile"; then
    # Linux/macOS .sha256sum is POSIX "<sha>  <name>"; Windows is PowerShell
    # Get-FileHash with "Hash      : <sha>" lines.
    expected=$(grep -oE '^Hash[[:space:]]*:[[:space:]]*[a-fA-F0-9]{64}' "$shafile" | awk '{print tolower($NF)}' | head -1)
    if [[ -z "$expected" ]]; then
      expected=$(awk 'NF>0 && $1 ~ /^[a-fA-F0-9]{64}$/ {print tolower($1); exit}' "$shafile")
    fi
    if [[ -z "$expected" ]]; then
      fail "could not parse $asset.sha256sum"
    else
      verify_sha "$target" "$expected" "deno/$target_triple"
    fi
  else
    fail "no .sha256sum for $asset"
  fi

  extract_dir="$OUT/deno/$target_triple/extracted"
  rm -rf "$extract_dir"
  if extract_zip "$target" "$extract_dir"; then
    ok "extracted $asset"
    case "$target_triple" in
      *-windows-*) inner_name=deno.exe; pattern='PE32(\+)? executable.*Windows' ;;
      *-apple-*) inner_name=deno; pattern='Mach-O' ;;
      *-linux-*) inner_name=deno; pattern='ELF.*executable' ;;
    esac
    inner=$(find "$extract_dir" -type f -name "$inner_name" | head -1)
    if [[ -n "$inner" ]]; then
      check_magic "$inner" "$pattern" "deno/$target_triple"
    else
      fail "no $inner_name inside $asset"
    fi
  else
    fail "extract failed: $asset"
  fi
done

echo
echo '########## SUMMARY ##########'
echo "PASS: $PASS"
echo "WARN: $WARN"
echo "FAIL: $FAIL"
if (( ${#ISSUES[@]} > 0 )); then
  echo
  echo 'Issues:'
  printf '  %s\n' "${ISSUES[@]}"
fi
exit $(( FAIL > 0 ? 1 : 0 ))
