#!/usr/bin/env bash
# Shared helpers for fetch-embedded.sh (build) and smoke-all.sh (CI smoke).
# Source from another script:  source "$(dirname "$0")/path/to/_lib.sh"

PASS=0
FAIL=0
WARN=0
declare -a ISSUES=()

note()  { echo "[ .. ] $*"; }
ok()    { echo "[ OK ] $*"; PASS=$((PASS+1)); }
fail()  { echo "[FAIL] $*"; FAIL=$((FAIL+1)); ISSUES+=("FAIL: $*"); }
warn()  { echo "[WARN] $*"; WARN=$((WARN+1)); ISSUES+=("WARN: $*"); }

# fetch URL into FILE. Follow redirects. Print failure on non-200.
#
# Caching: when EXPECTED_SHA is given, a file already on disk is reused only
# while it still hashes to that value; anything else is discarded and re-fetched.
# Callers that can name the hash up front should always pass it. Without it the
# only cache test possible is "exists and is non-empty", and an interrupted
# download that curl still exited 0 on leaves a truncated file that is reused
# forever — wedging every later build on a SHA mismatch it cannot recover from.
# usage: fetch URL FILE [EXPECTED_SHA]
fetch() {
  local url="$1" file="$2" expected="${3:-}"
  if [[ -f "$file" && -s "$file" ]]; then
    if [[ -z "$expected" ]]; then return 0; fi
    if [[ "$(sha256sum "$file" | awk '{print $1}')" == "$expected" ]]; then return 0; fi
    note "discarding stale cache: $file"
    rm -f "$file"
  fi
  mkdir -p "$(dirname "$file")"
  local code
  code=$(curl -fsSL --retry 3 --retry-delay 2 -o "$file" -w '%{http_code}' "$url" 2>/dev/null) || {
    fail "fetch $url (http=$code)"
    rm -f "$file"
    return 1
  }
  return 0
}

# verify file SHA matches expected hex
# usage: verify_sha FILE EXPECTED LABEL
verify_sha() {
  local file="$1" expected="$2" label="$3"
  local actual
  actual=$(sha256sum "$file" | awk '{print $1}')
  if [[ "$actual" == "$expected" ]]; then
    ok "sha256 match: $label"
  else
    # Purge, so a corrupt artifact cannot be reused by the next run. Callers
    # that pass the hash to `fetch` self-heal within a single run; this covers
    # the rest.
    rm -f "$file"
    fail "sha256 mismatch: $label (expected ${expected:0:8}.., got ${actual:0:8}..)"
    return 1
  fi
}

# Guard a checksum parsed out of a sidecar file. A truncated sidecar yields an
# empty or partial hash, which would fail verification on every future run too —
# so discard it and let the next run re-fetch.
# usage: require_sha EXPECTED SUMS_FILE LABEL
require_sha() {
  local expected="$1" sums="$2" label="$3"
  if [[ ! "$expected" =~ ^[0-9a-f]{64}$ ]]; then
    rm -f "$sums"
    fail "unusable checksum for $label (discarded $sums; re-run to re-fetch)"
    return 1
  fi
  return 0
}

# parse "<sha>  <name>" SHA2-256SUMS for a given asset
# usage: sha_for_asset SUMS_FILE ASSET_NAME
sha_for_asset() {
  local sums="$1" asset="$2"
  awk -v a="$asset" '$2==a {print $1; exit}' "$sums"
}

# extract zip into dir
# usage: extract_zip ZIP DIR
extract_zip() {
  local zip="$1" dir="$2"
  mkdir -p "$dir"
  unzip -q -o "$zip" -d "$dir" || return 1
}

# extract tar.xz into dir
# usage: extract_tarxz ARCHIVE DIR
extract_tarxz() {
  local arc="$1" dir="$2"
  mkdir -p "$dir"
  tar -xJf "$arc" -C "$dir" || return 1
}

# check inner-binary magic bytes match expected target
# usage: check_magic FILE EXPECTED_PATTERN LABEL
check_magic() {
  local file="$1" pattern="$2" label="$3"
  if [[ ! -f "$file" ]]; then fail "missing inner binary: $label ($file)"; return; fi
  local desc
  desc=$(file -b "$file")
  if [[ "$desc" =~ $pattern ]]; then
    ok "magic: $label — $desc"
  else
    fail "magic mismatch: $label — got '$desc', wanted /$pattern/"
  fi
}
