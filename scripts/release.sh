#!/usr/bin/env bash
# Tag + push a release. Refuses every common footgun:
#   - wrong branch (beta and stable both cut from main)
#   - dirty working tree
#   - stable release from a local main that differs from origin/main
#   - stable release before required GitHub checks passed on the tagged commit
#   - version/mode mismatch (beta tag w/o -, stable tag with -)
#   - duplicate tag (local or remote)
#   - a locale left untranslated (the release starts with the i18n sync PR)
#   - lightweight tag (always uses -a, annotated)
#   - stale local tags riding along (pushes only the branch and this tag)
#
# Usage:
#   scripts/release.sh beta     # for v*-beta.N tags from main
#   scripts/release.sh stable   # for v* tags from main
#   scripts/release.sh stable --verify-only
set -euo pipefail

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

require_stable_checks_passed() {
  local commit="$1"
  local repo
  local contexts

  if ! command -v gh >/dev/null 2>&1; then
    echo "ERR: stable release requires GitHub CLI ('gh') to verify required checks." >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "ERR: stable release requires an authenticated GitHub CLI session ('gh auth login')." >&2
    exit 1
  fi

  if ! repo=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null); then
    echo "ERR: could not determine GitHub repository with 'gh repo view'." >&2
    exit 1
  fi

  if ! contexts=$(gh api "repos/$repo/branches/main/protection/required_status_checks" --jq '.contexts[]?' 2>/dev/null); then
    echo "ERR: could not read required status checks for main from GitHub branch protection." >&2
    exit 1
  fi
  if [[ -z "$contexts" ]]; then
    echo "ERR: main has no required status checks configured; refusing to cut an unguarded stable release." >&2
    exit 1
  fi

  echo "Verifying required checks on main commit $commit..."
  while IFS= read -r context; do
    [[ -n "$context" ]] || continue

    local result status conclusion url
    result=$(gh api "repos/$repo/commits/$commit/check-runs?per_page=100" \
      --jq ".check_runs
        | map(select(.name == \"$context\"))
        | sort_by(.started_at // .completed_at // .created_at)
        | last
        | if . == null then \"missing\\t\\t\" else [.status, (.conclusion // \"\"), (.html_url // \"\")] | @tsv end" 2>/dev/null || true)

    if [[ -z "$result" ]]; then
      echo "ERR: required check '$context' is missing on $commit." >&2
      exit 1
    fi

    IFS=$'\t' read -r status conclusion url <<<"$result"
    if [[ "$status" != "completed" || "$conclusion" != "success" ]]; then
      echo "ERR: required check '$context' is not successful on $commit (status=${status:-missing}, conclusion=${conclusion:-missing})." >&2
      if [[ -n "${url:-}" ]]; then
        echo "     $url" >&2
      fi
      exit 1
    fi

    echo "✓ $context"
  done <<<"$contexts"
}

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
git fetch --quiet origin "$BRANCH" 2>/dev/null || true
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo '')
if [[ -n "$REMOTE" && "$LOCAL" != "$REMOTE" ]]; then
  AHEAD=$(git rev-list --count "origin/$BRANCH..HEAD")
  BEHIND=$(git rev-list --count "HEAD..origin/$BRANCH")
  if [[ "$MODE" == "stable" ]]; then
    echo "ERR: stable release requires local main to exactly match origin/main." >&2
    echo "     local is $AHEAD commit(s) ahead and $BEHIND commit(s) behind origin/main." >&2
    echo "     Pull/rebase first, and do not push unpushed stable commits together with the tag." >&2
    exit 1
  fi
  if (( BEHIND > 0 )); then
    echo "ERR: local '$BRANCH' is $BEHIND commit(s) behind origin/$BRANCH. Pull first." >&2
    exit 1
  fi
  if (( AHEAD > 0 )); then
    echo "Note: local '$BRANCH' is $AHEAD commit(s) ahead of origin/$BRANCH — they will be pushed with the tag."
  fi
elif [[ -z "$REMOTE" && "$MODE" == "stable" ]]; then
  echo "ERR: could not resolve origin/main; stable releases must be cut from remote-tracked main." >&2
  exit 1
fi

# 3b. every locale translated: PRs change English only (ADR 0017), and the
#     release starts with the translation sync PR. release.yml checks it again.
echo "Checking translation completeness…"
if ! bun run --silent check:i18n:complete; then
  echo "ERR: the translation completeness gate failed (output above). If it lists open entries, run the i18n sync first" >&2
  echo "     (translate-arroxy-i18n skill; bun run i18n:status shows what is open), land its PR, then release." >&2
  exit 1
fi

# 4. read package.json version + validate shape matches mode
VERSION=$(node -p "require('./package.json').version")
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

# 6. stable releases must tag a main commit whose release-gate checks passed
if [[ "$MODE" == "stable" ]]; then
  require_stable_checks_passed "$LOCAL"
fi

if [[ "$VERIFY_ONLY" == true ]]; then
  echo
  echo "✓ verified $MODE release gate for $TAG"
  exit 0
fi

# 7. annotated tag + push branch + tag in one shot
echo "Tagging $TAG (annotated) on '$BRANCH'…"
git tag -a "$TAG" -m "release $VERSION"

# Push exactly the branch and this tag. --follow-tags would also push every
# stale annotated local tag reachable from main, and GitHub creates no tag
# events at all when a push carries more than three tags, so the release
# workflow would never start.
echo "Pushing branch + tag…"
git push --atomic origin "HEAD:refs/heads/$BRANCH" "refs/tags/$TAG"

echo
echo "✓ pushed $TAG"
echo "  watch CI:  gh run watch"
echo "  release:   https://github.com/antonio-orionus/Arroxy/releases/tag/$TAG"
