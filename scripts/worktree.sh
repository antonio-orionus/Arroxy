#!/usr/bin/env bash
# Create a feature worktree and bootstrap the local runtime artifacts that Git
# intentionally does not track: node_modules, Electron's downloaded binary, and
# embedded ffmpeg/ffprobe.
#
# Usage:
#   bun run worktree codex/my-feature [../yt-download-ui-my-feature]
set -euo pipefail

BRANCH="${1:-}"
TARGET="${2:-}"

if [[ -z "$BRANCH" ]]; then
  echo "usage: bun run worktree <branch> [path]" >&2
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "ERR: bun is required." >&2
  exit 1
fi

SOURCE_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$SOURCE_ROOT")"
PARENT_DIR="$(dirname "$SOURCE_ROOT")"

if [[ -z "$TARGET" ]]; then
  SLUG="${BRANCH#codex/}"
  SLUG="${SLUG//\//-}"
  TARGET="$PARENT_DIR/$REPO_NAME-$SLUG"
fi

if [[ -e "$TARGET" ]]; then
  echo "ERR: target already exists: $TARGET" >&2
  exit 1
fi

echo "Creating worktree"
echo "  branch: $BRANCH"
echo "  path:   $TARGET"

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git worktree add "$TARGET" "$BRANCH"
else
  git worktree add -b "$BRANCH" "$TARGET"
fi

electron_dir_for() {
  local root="$1"
  (
    cd "$root"
    node -p "require('path').dirname(require.resolve('electron/package.json'))" 2>/dev/null
  )
}

electron_ok() {
  local root="$1"
  local dir
  if ! dir="$(electron_dir_for "$root")"; then
    return 1
  fi
  [[ -f "$dir/path.txt" ]] || return 1
  local rel
  rel="$(cat "$dir/path.txt")"
  [[ -n "$rel" && -x "$dir/dist/$rel" ]]
}

repair_electron() {
  local target_root="$1"
  local source_root="$2"
  local target_dir
  target_dir="$(electron_dir_for "$target_root")"

  echo "Verifying Electron binary"
  if electron_ok "$target_root"; then
    echo "  OK: Electron binary present"
    return 0
  fi

  echo "  Electron package is present but binary payload is missing; running installer"
  (
    cd "$target_root"
    node "$target_dir/install.js"
  ) || true

  if electron_ok "$target_root"; then
    echo "  OK: Electron installer repaired binary"
    return 0
  fi

  if electron_ok "$source_root"; then
    local source_dir
    source_dir="$(electron_dir_for "$source_root")"
    echo "  Installer did not repair Electron; copying verified payload from source checkout"
    rm -rf "$target_dir/dist" "$target_dir/path.txt"
    cp -a "$source_dir/dist" "$target_dir/dist"
    cp -a "$source_dir/path.txt" "$target_dir/path.txt"
  fi

  if ! electron_ok "$target_root"; then
    cat >&2 <<EOF
ERR: Electron binary is still missing.
     Try a clean dependency reinstall in the worktree:
       cd "$target_root"
       rm -rf node_modules
       bun install --force
EOF
    exit 1
  fi

  echo "  OK: Electron binary present"
}

echo
echo "Installing dependencies"
(
  cd "$TARGET"
  bun install
)

repair_electron "$TARGET" "$SOURCE_ROOT"

echo
echo "Fetching embedded host binaries"
(
  cd "$TARGET"
  bun run embed:fetch:host
)

echo
echo "Ready"
echo "  cd $TARGET"
echo "  bun run dev"
