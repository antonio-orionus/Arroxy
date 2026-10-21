#!/usr/bin/env bash
# Tag + push a release. Refuses every common footgun:
#   - wrong branch (beta and stable both cut from main)
#   - dirty working tree
#   - stable release from a local main with commits not on origin/main
#   - stable release before required GitHub checks passed on the tagged commit
#     (it waits for checks still running, up to RELEASE_CHECKS_TIMEOUT_MINUTES)
#   - version/mode mismatch (beta tag w/o -, stable tag with -)
#   - duplicate tag (local or remote)
#   - stable release whose changelog fragments were not assembled into CHANGELOG.md
#   - a locale left untranslated (the release starts with the i18n sync PR)
#   - lightweight tag (always uses -a, annotated)
#   - stale local tags riding along (pushes only the branch and this tag)
#
# A stable release tags the release commit, the `release: X` commit on
# origin/main that carries the version bump, once its required checks passed,
# whatever merged after it. A beta tags HEAD.
#
# Usage:
#   scripts/release.sh beta     # for v*-beta.N tags from main
#   scripts/release.sh stable   # for v* tags from main
#   scripts/release.sh stable --verify-only
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MODE="${1:?usage: $0 beta|stable}"
VERIFY_ONLY=false
if [[ "${2:-}" == "--verify-only" ]]; then
  VERIFY_ONLY=true
elif [[ -n "${2:-}" ]]; then
  echo "usage: $0 beta|stable [--verify-only]" >&2
  exit 1
fi

case "$MODE" in
  beta|stable) EXPECTED_BRANCH=main ;;
  *) echo "mode must be 'beta' or 'stable' (got '$MODE')" >&2; exit 1 ;;
esac

# 1. branch check
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo '<detached>')
if [[ "$BRANCH" != "$EXPECTED_BRANCH" ]]; then
  echo "ERR: $MODE release must be cut from '$EXPECTED_BRANCH' (currently on '$BRANCH')" >&2
  exit 1
fi

# 2. working tree must be clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERR: working tree dirty. Commit or discard changes before tagging." >&2
  git status --short >&2
  exit 1
fi

# 3. branch sync policy
# A stable release looks for its release commit on origin/main, so a stale
# origin/main would hide it.
if ! git fetch --quiet origin "$BRANCH" 2>/dev/null && [[ "$MODE" == "stable" ]]; then
  echo "ERR: could not fetch origin/$BRANCH; a stable release needs it up to date." >&2
  exit 1
fi
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo '')
if [[ -n "$REMOTE" && "$LOCAL" != "$REMOTE" ]]; then
  AHEAD=$(git rev-list --count "origin/$BRANCH..HEAD")
  BEHIND=$(git rev-list --count "HEAD..origin/$BRANCH")
  if [[ "$MODE" == "stable" ]]; then
    # The tag goes on a commit already on origin/main, so local may lag behind
    # it, but must not hold the release commit unpushed.
    if (( AHEAD > 0 )); then
      echo "ERR: local main is $AHEAD commit(s) ahead of origin/main. Push the release commit to main first;" >&2
      echo "     a stable release pushes only its tag." >&2
      exit 1
    fi
  elif (( BEHIND > 0 )); then
    echo "ERR: local '$BRANCH' is $BEHIND commit(s) behind origin/$BRANCH. Pull first." >&2
    exit 1
  elif (( AHEAD > 0 )); then
    echo "Note: local '$BRANCH' is $AHEAD commit(s) ahead of origin/$BRANCH — they will be pushed with the tag."
  fi
elif [[ -z "$REMOTE" && "$MODE" == "stable" ]]; then
  echo "ERR: could not resolve origin/main; stable releases must be cut from remote-tracked main." >&2
  exit 1
fi

# 4. read package.json version + validate shape matches mode. A stable release
# reads origin/main's, since the checkout may lag behind the release commit.
if [[ "$MODE" == "stable" ]]; then
  VERSION=$(git show "origin/$BRANCH:package.json" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(0, 'utf8')).version)")
else
  VERSION=$(node -p "require('./package.json').version")
fi
case "$MODE" in
  beta)
    if [[ "$VERSION" != *-* ]]; then
      echo "ERR: package.json version '$VERSION' has no '-' suffix — must be a pre-release semver (e.g. 0.4.0-beta.1) for beta mode" >&2
      exit 1
    fi
    ;;
  stable)
    if [[ "$VERSION" == *-* ]]; then
      echo "ERR: package.json version '$VERSION' contains '-' — strip the pre-release suffix for stable mode" >&2
      exit 1
    fi
    ;;
esac

TAG="v$VERSION"

# 5. tag must not already exist locally or on remote
if [[ "$VERIFY_ONLY" == false ]]; then
  if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "ERR: tag '$TAG' already exists locally. Bump package.json version or delete the tag." >&2
    exit 1
  fi
  if git ls-remote --exit-code --tags origin "$TAG" >/dev/null 2>&1; then
    echo "ERR: tag '$TAG' already on remote. Bump package.json version." >&2
    exit 1
  fi
fi

# 6. stable releases tag the release commit once its release-gate checks passed
TARGET="$LOCAL"
if [[ "$MODE" == "stable" ]]; then
  TARGET=$(bun "$SCRIPT_DIR/release-gate.ts" release-commit --version "$VERSION" --ref "origin/$BRANCH")
  AFTER=$(git rev-list --count "$TARGET..origin/$BRANCH")
  echo "Release commit: $(git log -1 --format='%h %s' "$TARGET") ($AFTER commit(s) merged after it)"
  # Release notes: the release commit assembled every changelog.d/ fragment
  # into this version's CHANGELOG.md section. Judged on that commit's tree,
  # not the checkout, which may be behind or carry later fragments.
  bun "$SCRIPT_DIR/changelog.ts" verify-release "$VERSION" "$TARGET"
  # --verify-only looks once; a real release waits for checks still running.
  TIMEOUT="${RELEASE_CHECKS_TIMEOUT_MINUTES:-60}"
  if [[ "$VERIFY_ONLY" == true ]]; then TIMEOUT=0; fi
  bun "$SCRIPT_DIR/release-gate.ts" checks --commit "$TARGET" --timeout-minutes "$TIMEOUT"
fi

# 6b. every locale translated in the commit being tagged: PRs change English
#     only (ADR 0017), and the release starts with the translation sync PR.
#     The checkout may differ from $TARGET, so a different tree is checked in
#     a temporary worktree. release.yml checks it again.
echo "Checking translation completeness on $(git rev-parse --short "$TARGET")…"
GATE_DIR="$PWD"
if ! git diff --quiet "$TARGET" HEAD --; then
  GATE_DIR=$(mktemp -d)
  trap 'git worktree remove --force "$GATE_DIR" >/dev/null 2>&1 || true' EXIT
  git worktree add --quiet --detach "$GATE_DIR" "$TARGET"
  ln -s "$PWD/node_modules" "$GATE_DIR/node_modules"
fi
if ! (cd "$GATE_DIR" && bun run --silent check:i18n:complete); then
  echo "ERR: the translation completeness gate failed (output above). If it lists open entries, run the i18n sync first" >&2
  echo "     (translate-arroxy-i18n skill; bun run i18n:status shows what is open), land its PR, then release." >&2
  exit 1
fi

if [[ "$VERIFY_ONLY" == true ]]; then
  echo
  echo "✓ verified $MODE release gate for $TAG"
  exit 0
fi

# 7. annotated tag + push
echo "Tagging $TAG (annotated) on $(git rev-parse --short "$TARGET")…"
git tag -a "$TAG" "$TARGET" -m "release $VERSION"

# Push exactly this tag (and, for a beta, the branch). --follow-tags would also
# push every stale annotated local tag reachable from main, and GitHub creates
# no tag events at all when a push carries more than three tags, so the release
# workflow would never start.
if [[ "$MODE" == "stable" ]]; then
  echo "Pushing tag…"
  git push origin "refs/tags/$TAG"
else
  echo "Pushing branch + tag…"
  git push --atomic origin "HEAD:refs/heads/$BRANCH" "refs/tags/$TAG"
fi

echo
echo "✓ pushed $TAG"
echo "  watch CI:  gh run watch"
echo "  release:   https://github.com/antonio-orionus/Arroxy/releases/tag/$TAG"
