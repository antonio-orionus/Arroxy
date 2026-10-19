#!/usr/bin/env bash
# Fetch ffmpeg + ffprobe for ONE (platform, arch), verify SHA256, extract,
# place at build/embedded/<platform>-<arch>/{ffmpeg, ffprobe}[.exe]
#
# Invoked by build/beforeBuild.cjs (electron-builder lifecycle hook) per
# (platform, arch) the build is targeting. Also runnable standalone:
#   bash scripts/build/fetch-embedded.sh linux x64
#   bash scripts/build/fetch-embedded.sh darwin arm64
#   bash scripts/build/fetch-embedded.sh win32 x64
#
# Sources:
#   - Win + Linux: BtbN/FFmpeg-Builds (gpl-shared variants), one archive
#     contains both ffmpeg + ffprobe + DLLs.
#   - macOS: ffmpeg.martin-riedl.de (GPL builds, two separate ZIPs),
#     pinned to one release build per arch (see fetch_martin_riedl).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
source "$ROOT/scripts/test-binaries/_lib.sh"

PLATFORM="${1:-}"
ARCH="${2:-}"
if [[ "$PLATFORM" == "host" ]]; then
  PLATFORM="$(node -p "process.platform")"
  ARCH="$(node -p "process.arch")"
fi
if [[ -z "$PLATFORM" || -z "$ARCH" ]]; then
  echo "usage: $0 <platform> <arch> | host" >&2
  echo "  platform: win32 | darwin | linux" >&2
  echo "  arch:     x64 | arm64" >&2
  exit 2
fi

case "$ARCH" in
  x64|arm64) ;;
  *) fail "unsupported host arch: $ARCH"; exit 1 ;;
esac

OUT="$ROOT/build/embedded/${PLATFORM}-${ARCH}"
mkdir -p "$OUT"

# If both binaries are already present, skip — fetch-embedded is idempotent.
exe_ext=""
[[ "$PLATFORM" == "win32" ]] && exe_ext=".exe"

has_ffmpeg_payload() {
  bun "$ROOT/scripts/build/embeddedPayload.ts" check "$PLATFORM" "$ARCH" "$OUT" >/dev/null 2>&1
}

has_required_payload() {
  has_ffmpeg_payload
}

if has_required_payload; then
  ok "embedded binaries already present at $OUT, skipping fetch"
  exit 0
fi

clear_ffmpeg_payload() {
  rm -f "$OUT/ffmpeg${exe_ext}" "$OUT/ffprobe${exe_ext}" "$OUT"/*.dll "$OUT"/lib*.so* 2>/dev/null || true
  rm -rf "$OUT/_ext" "$OUT/_ext_ffmpeg" "$OUT/_ext_ffprobe"
}

# BtbN: single archive contains both ffmpeg + ffprobe (+ DLLs on Windows).
fetch_btbn() {
  local platform="$1" arch="$2" out="$3"
  local resolution="$out/_btbn_resolution.env"
  local sums="$out/_sums"

  note "resolving BtbN ${platform}-${arch}"
  if ! bun "$ROOT/scripts/build/btbnResolver.ts" --target "$platform" "$arch" > "$resolution"; then
    fail "resolve BtbN ${platform}-${arch}"
    exit 1
  fi
  if [[ ! -s "$resolution" ]] || ! grep -q '^BTBN_ARCH=' "$resolution" || ! grep -q '^BTBN_ASSET_URL=' "$resolution"; then
    fail "BtbN resolver returned empty/malformed output for ${platform}-${arch}"
    exit 1
  fi

  # shellcheck source=/dev/null
  source "$resolution"
  local btbn_arch="${BTBN_ARCH:?}"
  local ext="${BTBN_ARCHIVE_EXT:?}"
  local asset="${BTBN_ASSET_NAME:?}"
  local asset_url="${BTBN_ASSET_URL:?}"
  local checksums_url="${BTBN_CHECKSUMS_URL:?}"
  local release_tag="${BTBN_RESOLVED_RELEASE_TAG:?}"

  note "fetching BtbN $asset from $release_tag"
  fetch "$checksums_url" "$sums" || exit 1
  local expected
  expected=$(sha_for_asset "$sums" "$asset")
  if [[ -z "$expected" ]]; then
    fail "no SHA for $asset in BtbN checksums.sha256 ($release_tag)"
    exit 1
  fi
  require_sha "$expected" "$sums" "$asset" || exit 1
  # Pass the hash so a truncated cache from an interrupted run is discarded
  # rather than reused, which used to wedge the checkout permanently.
  fetch "$asset_url" "$out/$asset" "$expected" || exit 1
  verify_sha "$out/$asset" "$expected" "$asset" || exit 1

  if [[ "$ext" == "zip" ]]; then
    extract_zip "$out/$asset" "$out/_ext" || { fail "extract zip"; exit 1; }
  else
    extract_tarxz "$out/$asset" "$out/_ext" || { fail "extract tar.xz"; exit 1; }
  fi

  local local_exe_ext=""
  [[ "$platform" == "win32" ]] && local_exe_ext=".exe"

  local ffmpeg_src ffprobe_src bin_dir
  ffmpeg_src=$(find "$out/_ext" -type f -name "ffmpeg${local_exe_ext}" | head -1)
  ffprobe_src=$(find "$out/_ext" -type f -name "ffprobe${local_exe_ext}" | head -1)
  if [[ -z "$ffmpeg_src" ]]; then fail "ffmpeg not in $asset"; exit 1; fi
  if [[ -z "$ffprobe_src" ]]; then fail "ffprobe not in $asset"; exit 1; fi
  cp "$ffmpeg_src" "$out/ffmpeg${local_exe_ext}"
  cp "$ffprobe_src" "$out/ffprobe${local_exe_ext}"
  bin_dir=$(dirname "$ffmpeg_src")

  if [[ "$platform" == "win32" ]]; then
    # Win: bin/*.dll siblings ship next to the executables. Native DLL
    # search picks them up from the executable's own dir.
    # `cp -t` is GNU-only; BSD cp (macOS) has no target-directory flag, so use
    # the portable one-file-per-exec form. The DLL count is small.
    find "$bin_dir" -maxdepth 1 -type f -name '*.dll' -exec cp {} "$out" \;
  else
    # Linux: BtbN shared build keeps libav*.so* in <prefix>/lib/. Copy them
    # next to the binaries (preserve symlinks via cp -P) so we can resolve
    # via LD_LIBRARY_PATH=$resourcesPath at runtime.
    local lib_src_dir
    lib_src_dir=$(dirname "$bin_dir")/lib
    if [[ -d "$lib_src_dir" ]]; then
      find "$lib_src_dir" -maxdepth 1 -name 'lib*.so*' -exec cp -P {} "$out" \;
    fi
  fi

  chmod +x "$out/ffmpeg${local_exe_ext}" "$out/ffprobe${local_exe_ext}" 2>/dev/null || true

  rm -rf "$out/_ext" "$out/$asset" "$sums" "$resolution"
  ok "BtbN ${btbn_arch} → $out"
}

# Martin-Riedl: pinned release build, two ZIPs per arch. Scraping the index
# for the newest snapshot gave every build whatever upstream published that
# day (amd64 snapshots also stopped updating), so the approved build and its
# SHA-256s are pinned here. Bump together with the FFmpeg package pins.
MARTIN_RIEDL_ARM64_PATH="/download/macos/arm64/1789931890_9.0.2/"
MARTIN_RIEDL_ARM64_FFMPEG_SHA="c8ed4c4e6978a03c485edbfe4e0a5dc2380f8a30bba5150531b31b094492d924"
MARTIN_RIEDL_ARM64_FFPROBE_SHA="fcbe839537485eaee7a7a8bc5cbc0f90d53617e80943e8a5b2e31cb851197ea6"
MARTIN_RIEDL_AMD64_PATH="/download/macos/amd64/1789931006_9.0.2/"
MARTIN_RIEDL_AMD64_FFMPEG_SHA="7c6b4125b191cbf773832dc51f424cf2b6bb7da43007d1e066f95909e47cacd4"
MARTIN_RIEDL_AMD64_FFPROBE_SHA="2322438ed2f6319a691291b247d09c69dcaa3a982460d1f269a7e1af335cfdfd"

fetch_martin_riedl() {
  local arch="$1" out="$2"
  local prefix ffmpeg_sha ffprobe_sha
  case "$arch" in
    arm64) prefix=$MARTIN_RIEDL_ARM64_PATH; ffmpeg_sha=$MARTIN_RIEDL_ARM64_FFMPEG_SHA; ffprobe_sha=$MARTIN_RIEDL_ARM64_FFPROBE_SHA ;;
    x64)   prefix=$MARTIN_RIEDL_AMD64_PATH; ffmpeg_sha=$MARTIN_RIEDL_AMD64_FFMPEG_SHA; ffprobe_sha=$MARTIN_RIEDL_AMD64_FFPROBE_SHA ;;
    *) fail "fetch_martin_riedl: unsupported arch $arch"; exit 1 ;;
  esac
  local base="https://ffmpeg.martin-riedl.de${prefix}"

  for bin in ffmpeg ffprobe; do
    note "fetching Martin-Riedl ${bin}.zip"
    local expected=$ffmpeg_sha
    [[ "$bin" == "ffprobe" ]] && expected=$ffprobe_sha
    fetch "${base}${bin}.zip" "$out/${bin}.zip" "$expected" || exit 1
    verify_sha "$out/${bin}.zip" "$expected" "${bin}.zip" || exit 1

    extract_zip "$out/${bin}.zip" "$out/_ext_${bin}" || { fail "extract ${bin}.zip"; exit 1; }
    local inner
    inner=$(find "$out/_ext_${bin}" -type f -name "$bin" -not -path '*/__MACOSX/*' | head -1)
    if [[ -z "$inner" ]]; then fail "$bin not in ${bin}.zip"; exit 1; fi
    cp "$inner" "$out/$bin"
    chmod +x "$out/$bin"
    rm -rf "$out/_ext_${bin}" "$out/${bin}.zip"
  done

  ok "Martin-Riedl macos ${prefix} → $out"
}

if has_ffmpeg_payload; then
  ok "embedded ffmpeg/ffprobe already present at $OUT, skipping ffmpeg fetch"
else
  clear_ffmpeg_payload
  case "${PLATFORM}-${ARCH}" in
    win32-x64|win32-arm64|linux-x64|linux-arm64)
      fetch_btbn "$PLATFORM" "$ARCH" "$OUT" ;;
    darwin-x64|darwin-arm64)
      fetch_martin_riedl "$ARCH" "$OUT" ;;
    *)
      fail "unsupported target: ${PLATFORM}-${ARCH}"
      exit 1 ;;
  esac
fi

# Sanity: confirm binaries and required shared-library siblings land.
bun "$ROOT/scripts/build/embeddedPayload.ts" assert "$PLATFORM" "$ARCH" "$OUT"

if (( FAIL > 0 )); then
  echo "FAIL: $FAIL"
  printf '  %s\n' "${ISSUES[@]}"
  exit 1
fi

echo "[done] embedded ffmpeg + ffprobe at $OUT"
