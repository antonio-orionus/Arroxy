---
name: ship-fix
description: End-to-end Arroxy flow for taking a bug fix (or small feature) from report to published release - worktree, test-first fix, PR, CodeRabbit, CI validation, squash-merge, version bump and tag. Use when the user says "ship this fix", "fix, PR, merge and release", "worktree -> PR -> CodeRabbit -> merge -> release", or asks for the whole chain instead of one step.
---

# Ship a fix

One pass from report to released version. This skill is the order of operations; the rules live elsewhere and are linked, not repeated. Read them when a phase points at them.

- `AGENTS.md`: Post-Task Checks, "Choosing the right test", Release Pipeline.
- `.agents/memory/MEMORY.md` index, especially `coderabbit-review-workflow.md`, `finish-before-pr.md`, `no-ai-attribution.md`.
- `scripts/release.sh`: what a release refuses to do.

## Model tiers

If your harness supports subagents with a model choice, delegate mechanical work to the cheaper/faster tier (for example Sonnet in Claude Code): implementation from a precise spec, test runs, CI and CodeRabbit polling, changelog drafting. Keep diagnosis, design decisions, review of subagent output, and the merge/release go/no-go with the main agent. Give a subagent the exact files, the failing test, and the acceptance command; never "figure out the bug". Without subagents, do everything inline in the same order.

## Phases

### 1. Intake
Reproduce or confirm the root cause before touching code: the user report plus logs; for YouTube or extractor issues, run yt-dlp locally against the failing URL. State the chosen fix design (what changes, which layer, what is deliberately out of scope) before coding.
verify: root cause is named with evidence, and the design is written down in one short paragraph.

### 2. Worktree
Create an isolated worktree on `fix/<slug>` (or `feat/<slug>`) from a fresh `origin/main`:

```bash
git fetch origin main
git worktree add -b fix/<slug> <path> origin/main
cd <path> && bun run bootstrap
```

Work only inside it. Never use bare `git stash` (the stash stack is shared across worktrees); use a WIP commit instead.
verify: `git status` is clean, `git rev-parse HEAD` equals `origin/main`, `bun run doctor` is healthy.

### 3. Implement, test first
Write the failing test at the layer that owns the behavior ("Choosing the right test" in `AGENTS.md`). A bug found by using the app belongs in Fixture Product E2E: `bun run build`, then run with `ARROXY_E2E_HEADLESS=1` so no window steals focus. Make it pass with the smallest change. Finish the whole change per `finish-before-pr.md`: locales and README sources are not follow-ups. When the release follows straight after the merge (this flow), the CHANGELOG entry is written in the release commit (phase 9) rather than in the PR. Delegate the implementation to a cheaper subagent with a precise spec; review its diff yourself.
verify: the new test failed before the fix and passes after; the diff contains only what the design called for.

### 4. Gate
```bash
bun run check
```
Fix failures your change caused. A failure that is clearly unrelated is reported, not fixed (parallel agents may own it).
verify: `bun run check` exits 0, or every remaining failure is documented as unrelated.

### 5. Commit and PR
Conventional commit message (`fix: ...`, `feat: ...`), body explains what and why. No AI attribution anywhere (`no-ai-attribution.md`). Before pushing:

```bash
git log origin/main..HEAD --format="%B" | grep -inE "claude|anthropic|co-authored|generated with"   # must print nothing
git log origin/main..HEAD --format="%an <%ae> | %cn <%ce>" | sort -u                               # only Antonio
gh auth status   # antonio-orionus must be the active account
```

If `antonio-orionus` is not active: `gh auth switch --user antonio-orionus`. The wrong account makes `gh` fail with misleading errors such as "must be a collaborator". Push, then `gh pr create` with a body of: problem, root cause, fix, tests.
verify: both greps are clean, the PR is open, and its body has the four parts.

### 6. CodeRabbit
Follow `.agents/memory/coderabbit-review-workflow.md` exactly. In short: auto reviews are off, so comment `@coderabbitai review` right after opening; poll `issues/<N>/comments` for all three terminal outcomes (findings, clean, refused); check each finding against the code before acting; fix valid ones, push back with evidence on wrong ones; reply in the inline thread. Re-trigger once only if the post-review commits are substantial, then confirm `coveredCommitId` equals the pushed head.
verify: every finding is fixed or answered, and the review covers the head commit.

### 7. Validate
Required checks must be green on the PR head: `gh pr checks <N> --watch`, or poll. A green CodeRabbit check alone proves nothing (it passes when the review was skipped).
verify: all required checks are `success` on the current head SHA.

### 8. Merge
Squash-merge. Confirm the repo's squash style first (`git log --oneline -10 origin/main` shows titles ending in `(#N)`):

```bash
gh pr merge <N> --squash --delete-branch
git fetch origin main
```

verify: `gh pr view <N> --json state` reports `MERGED`; `origin/main` contains the squash commit.

### 9. Release
Run from `main` (the primary checkout or a fresh worktree on `origin/main`), local `main` equal to `origin/main`:

1. Bump `package.json` version: patch for fixes, minor for features, beta suffix only if asked. Run this phase autonomously — do not hand the release script back to the user.
2. Add a `## <version>` section at the top of `CHANGELOG.md`, same shape and friendly user-facing tone as the latest entries (one-line summary, then `## Highlights` bullets in plain language). It is the release-notes source of truth; never edit GitHub release notes directly.
3. `bun run check`, then commit `release: <version>` and push `main`.
4. Wait for the required checks on that main commit to pass; `scripts/release.sh` refuses a stable tag otherwise (`bash scripts/release.sh stable --verify-only` previews the gate).
5. `bun run release:stable` (or `release:beta`). This creates the annotated tag and pushes it.
6. Watch the pipeline: `gh run list --workflow release.yml -L 1`, then `gh run watch <id>`.

verify: the Release workflow succeeded and `https://github.com/antonio-orionus/Arroxy/releases/tag/v<version>` shows a published release with the CHANGELOG notes.

### 10. Close out
Remove the worktree after the merge (`git worktree remove <path>`; delete the local branch if it lingers). Report the PR link, the release link, and anything deliberately left out. If the fix came from user feedback, offer to draft replies to those reports.

## Stop and ask

- The root cause is ambiguous or you cannot reproduce it.
- The fix needs a change in `packages/*`: those ship on their own tags (see "Repo Layout" in `AGENTS.md`), so releasing them is a separate decision.
- A CodeRabbit finding would change the design agreed in phase 1.
- A CI failure appears unrelated to the change.
- Any step would rewrite or delete published history (force push, tag deletion, amending a pushed commit).
