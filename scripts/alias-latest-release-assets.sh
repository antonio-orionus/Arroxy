#!/usr/bin/env bash
set -euo pipefail

# One-time migration helper for the stable release asset naming change.
# It uploads versionless aliases to the current latest release without
# modifying existing versioned assets or latest*.yml updater metadata.

repo="${REPO:-antonio-orionus/Arroxy}"
tag="${1:-}"

if [[ -z "$tag" ]]; then
  tag="$(gh release view --repo "$repo" --json tagName --jq .tagName)"
fi

version="${tag#v}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

assets="$(gh release view "$tag" --repo "$repo" --json assets --jq '.assets[].name')"

pairs=(
  "Arroxy-Setup-${version}.exe|Arroxy-win-x64-Setup.exe"
  "Arroxy-Setup-${version}.exe.blockmap|Arroxy-win-x64-Setup.exe.blockmap"
  "Arroxy-Portable-${version}.exe|Arroxy-win-x64-Portable.exe"
  "Arroxy-${version}-arm64.dmg|Arroxy-mac-arm64.dmg"
  "Arroxy-${version}-arm64.dmg.blockmap|Arroxy-mac-arm64.dmg.blockmap"
  "Arroxy-${version}-x64.dmg|Arroxy-mac-x64.dmg"
  "Arroxy-${version}-x64.dmg.blockmap|Arroxy-mac-x64.dmg.blockmap"
  "Arroxy-${version}.AppImage|Arroxy-linux-x64.AppImage"
  "Arroxy-${version}.tar.gz|Arroxy-linux-x64.tar.gz"
  "Arroxy-${version}.flatpak|Arroxy-linux-x64.flatpak"
)

uploaded=0

for pair in "${pairs[@]}"; do
  source_name="${pair%%|*}"
  alias_name="${pair##*|}"
  source_path="$tmp/$source_name"
  alias_path="$tmp/$alias_name"

  if grep -Fxq "$alias_name" <<<"$assets"; then
    echo "skip existing alias: $alias_name"
    continue
  fi

  if ! grep -Fxq "$source_name" <<<"$assets"; then
    echo "missing source asset: $source_name" >&2
    exit 1
  fi

  gh release download "$tag" \
    --repo "$repo" \
    --pattern "$source_name" \
    --dir "$tmp"

  mv "$source_path" "$alias_path"
  gh release upload "$tag" \
    --repo "$repo" \
    "$alias_path"
  rm -f "$alias_path"

  uploaded=$((uploaded + 1))
done

if (( uploaded == 0 )); then
  echo "all aliases already exist on $tag"
  exit 0
fi

echo "uploaded $uploaded alias asset(s) to $repo@$tag"
