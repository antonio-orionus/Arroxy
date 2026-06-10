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
#   - macOS: ffmpeg.martin-riedl.de (GPL builds, two separate ZIPs).
#     URL contains a snapshot timestamp+hash with no stable 'latest' alias,
#     so we scrape the index page for the current snapshot path.
set -euo pipefail

PLATFORM="${1:-}"
ARCH="${2:-}"
if [[ -z "$PLATFORM" || -z "$ARCH" ]]; then
  echo "usage: $0 <platform> <arch>" >&2
  echo "  platform: win32 | darwin | linux" >&2
  echo "  arch:     x64 | arm64" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/build/embedded/${PLATFORM}-${ARCH}"
mkdir -p "$OUT"

source "$ROOT/scripts/test-binaries/_lib.sh"

# If both binaries are already present, skip — fetch-embedded is idempotent.
exe_ext=""
[[ "$PLATFORM" == "win32" ]] && exe_ext=".exe"

has_required_payload() {
  [[ -f "$OUT/ffmpeg${exe_ext}" && -f "$OUT/ffprobe${exe_ext}" ]] || return 1
  case "$PLATFORM" in
    win32)
      compgen -G "$OUT/*.dll" >/dev/null
      ;;
    linux)
      compgen -G "$OUT/lib*.so*" >/dev/null
      ;;
    *)
      return 0
      ;;
  esac
}

if has_required_payload; then
  ok "embedded binaries already present at $OUT, skipping fetch"
  exit 0
fi

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
  fetch "$asset_url" "$out/$asset" || exit 1
  local expected
  expected=$(sha_for_asset "$sums" "$asset")
  if [[ -z "$expected" ]]; then
    fail "no SHA for $asset in BtbN checksums.sha256 ($release_tag)"
    exit 1
  fi
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
    find "$bin_dir" -maxdepth 1 -type f -name '*.dll' -exec cp -t "$out" {} +
  else
    # Linux: BtbN shared build keeps libav*.so* in <prefix>/lib/. Copy them
    # next to the binaries (preserve symlinks via cp -P) so we can resolve
    # via LD_LIBRARY_PATH=$resourcesPath at runtime.
    local lib_src_dir
    lib_src_dir=$(dirname "$bin_dir")/lib
    if [[ -d "$lib_src_dir" ]]; then
      find "$lib_src_dir" -maxdepth 1 -name 'lib*.so*' -exec cp -P -t "$out" {} +
    fi
  fi

  chmod +x "$out/ffmpeg${local_exe_ext}" "$out/ffprobe${local_exe_ext}" 2>/dev/null || true

  rm -rf "$out/_ext" "$out/$asset" "$sums" "$resolution"
  ok "BtbN ${btbn_arch} → $out"
}

# Martin-Riedl: scrape index for current snapshot path, fetch two ZIPs.
fetch_martin_riedl() {
  local arch="$1" out="$2"
  local mr_arch
  case "$arch" in
    arm64) mr_arch=arm64 ;;
    x64)   mr_arch=amd64 ;;
    *) fail "fetch_martin_riedl: unsupported arch $arch"; exit 1 ;;
  esac

  local index="$out/_index.html"
  note "fetching Martin-Riedl index for macos/${mr_arch}"
  fetch "https://ffmpeg.martin-riedl.de/" "$index" || exit 1

  # Index has many links per arch (snapshot + release). Take the first match,
  # which is the snapshot block (newer than release).
  local prefix
  prefix=$(grep -oE "/download/macos/${mr_arch}/[0-9]+_N-[0-9a-zA-Z-]+/" "$index" | head -1)
  if [[ -z "$prefix" ]]; then
    fail "fetch_martin_riedl: cannot parse index for /download/macos/${mr_arch}/"
    exit 1
  fi
  local base="https://ffmpeg.martin-riedl.de${prefix}"

  for bin in ffmpeg ffprobe; do
    note "fetching Martin-Riedl ${bin}.zip"
    fetch "${base}${bin}.zip" "$out/${bin}.zip" || exit 1
    fetch "${base}${bin}.zip.sha256" "$out/${bin}.zip.sha256" || exit 1
    local expected
    expected=$(awk '{print $1; exit}' "$out/${bin}.zip.sha256")
    verify_sha "$out/${bin}.zip" "$expected" "${bin}.zip" || exit 1

    extract_zip "$out/${bin}.zip" "$out/_ext_${bin}" || { fail "extract ${bin}.zip"; exit 1; }
    local inner
    inner=$(find "$out/_ext_${bin}" -type f -name "$bin" -not -path '*/__MACOSX/*' | head -1)
    if [[ -z "$inner" ]]; then fail "$bin not in ${bin}.zip"; exit 1; fi
    cp "$inner" "$out/$bin"
    chmod +x "$out/$bin"
    rm -rf "$out/_ext_${bin}" "$out/${bin}.zip" "$out/${bin}.zip.sha256"
  done

  rm -f "$index"
  ok "Martin-Riedl macos/${mr_arch} → $out"
}

case "${PLATFORM}-${ARCH}" in
  win32-x64|win32-arm64|linux-x64|linux-arm64)
    fetch_btbn "$PLATFORM" "$ARCH" "$OUT" ;;
  darwin-x64|darwin-arm64)
    fetch_martin_riedl "$ARCH" "$OUT" ;;
  *)
    fail "unsupported target: ${PLATFORM}-${ARCH}"
    exit 1 ;;
esac

# Sanity: confirm both binaries land + are executable.
for bin in ffmpeg ffprobe; do
  bin_path="$OUT/${bin}${exe_ext}"
  if [[ ! -f "$bin_path" ]]; then
    fail "missing $bin_path after fetch"
    exit 1
  fi
done

if (( FAIL > 0 )); then
  echo "FAIL: $FAIL"
  printf '  %s\n' "${ISSUES[@]}"
  exit 1
fi

echo "[done] embedded ffmpeg + ffprobe at $OUT"
