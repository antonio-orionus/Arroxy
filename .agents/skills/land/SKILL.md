---
name: land
description: End-to-end Arroxy flow that takes a fix or feature from report to a merged PR - worktree, test-first change, local Claude + Codex dual review with cross-checked findings, PR, CodeRabbit when the quota allows, auto-merge, and unrelated bugs filed to the private backlog. Use when the user says "land it", "ship this fix", "fix, PR and merge", or asks for the whole chain instead of one step. Releasing is a separate, explicit request.
---

# Land a change

One pass from report to merged PR. This skill is the order of operations; the rules live elsewhere and are linked, not repeated. Read them when a phase points at them.

- `AGENTS.md`: Post-Task Checks, "One concern per PR"; `dev-docs/fixture-e2e.md`: "Choosing the right test".
- `.agents/memory/MEMORY.md`, especially `finish-before-pr`, `coderabbit-review-workflow`, `ship-means-merge-not-release`, `no-ai-attribution`, `review-learnings`.

"Land" stops at the merge. Release only when the user explicitly says "release" (`ship-means-merge-not-release`), then follow `dev-docs/release-runbook.md`. Never ask or offer to release: no question, button or closing line about it.

## Model tiers

When the harness has subagents with a model choice, give mechanical work (implementation from a precise spec, test runs, CI and CodeRabbit polling) to the cheaper tier with the exact files, the failing test and the acceptance command. Keep diagnosis, design, triage of review findings and the merge go/no-go yourself.

## Phases

### 1. Intake
Reproduce or confirm the root cause before touching code: the user report plus logs; for extractor issues, run yt-dlp locally against the failing URL. State the design (what changes, which layer, what is out of scope) in one short paragraph. Then read the backlog (`.internal/bug-backlog.md`, when `.internal/` exists): an entry in a file this change will touch is in scope if fixing it is small and does not change the design.
verify: root cause named with evidence; design written; backlog entries in touched files are either taken in or deliberately left.

### 2. Worktree
Work in an isolated worktree on `fix/<slug>` or `feat/<slug>` from a fresh `origin/main` (`git fetch origin main`, `git worktree add -b <branch> <path> origin/main`, then `bun run bootstrap` inside it). Never bare `git stash`; use a WIP commit.
verify: `git status` clean and `HEAD` equals `origin/main` before the first change.

### 3. Implement, test first
Write the failing test at the layer that owns the behaviour, make it pass with the smallest change, and finish everything `finish-before-pr` lists (locales last, per `translate-at-final-stage`). A bug found by using the app belongs in Fixture Product E2E (`bun run build`, then `ARROXY_E2E_HEADLESS=1`).
verify: the new test failed before the fix and passes after.

### 4. Gate
`bun run check`. Fix what your change caused; report, do not fix, what clearly is not yours (another agent may own it).
verify: exit 0, or each remaining failure documented as unrelated.

### 5. Local dual review
Commit, then run in the background (several minutes):

```bash
bun run review:dual                 # behaviour changes: Codex + four Claude lanes, cross-checked
bun run review:dual --light         # mechanical or behaviour-free changes: Codex, checked by Claude
```

It needs the `claude` and `codex` CLIs logged in; it runs on those subscriptions and uses no API keys. Exit 0 means nothing to fix or decide in this change (backlog entries may still be listed), 1 means something to fix or decide, 2 means a reviewer failed (say so: coverage is partial) or none completed. Read `report.md` from the path it prints:

**Codex unavailable** (usage limit, not logged in, not installed): the tool detects it, skips Codex and says so in the report's `Review coverage` line; do not improvise a workaround. `--light` then runs one whole-change Claude reviewer; full mode keeps its four Claude lanes; either way a second Claude pass, not Codex, checks every finding. That is a weaker cross-check (same model, shared blind spots), so quote the `Review coverage` line in the PR's "Review" line, and treat an "uncertain" verdict as a reason to read the code yourself. Exit 2 with "No reviewer completed" means the change was not reviewed at all: fix the cause and re-run, never open the PR as if it had been.

- **Fix in this change:** fix each one test-first, as in phase 3. You are still the judge: if a confirmed finding is wrong, say why and record it (below).
- **Uncertain:** read the code and decide; fix or treat as refuted.
- **Backlog:** pre-existing bugs outside the changed lines. Promote one into this change when it sits in a function you touched and the fix is small; file the rest (phase 6).
- **Refuted:** skim; if a refutation is right and the same false alarm could recur, add it to `.agents/memory/review-learnings.md`.

After fixing, run one more round on the fix commits only: `bun run review:dual --light --base <head the first round reviewed>`. Two rounds at most; anything a third round would be needed for goes to the user.
verify: every "fix" and "uncertain" entry is fixed or answered with a reason, and `bun run check` passes again.

### 6. Backlog
Append each unrelated bug to `.internal/bug-backlog.md` under `## Open` (create the file and its line in `.internal/README.md` if missing): `- **<what breaks>** — \`<file:line>\`. <one-sentence failure scenario>. Found by <tool> reviewing <branch> (<YYYY-MM-DD>).` Skip one already listed. Save with `bun run internal:save`. Without `.internal/`, list them in the final report instead.
verify: `bun run internal:save` pushed, or the bugs are in the report.

### 7. PR
Conventional commits, body says what and why, no AI attribution:

```bash
git log origin/main..HEAD --format="%B" | grep -inE "claude|anthropic|co-authored|generated with"   # must print nothing
git log origin/main..HEAD --format="%an <%ae> | %cn <%ce>" | sort -u                               # only Antonio
gh auth status   # antonio-orionus active, else: gh auth switch --user antonio-orionus
```

Push and `gh pr create` with: problem, root cause, fix, tests, and a "Review" line (dual review rounds run, findings fixed, findings refuted, backlog entries filed). In the desktop app, bind the PR and turn on Auto-fix.
verify: PR open, both greps clean.

### 8. CodeRabbit, when it is worth a trigger
Follow `coderabbit-review-workflow`: only behaviour-changing PRs, one trigger on the final head once CI is green, never push while it runs. A refused trigger gets one retry after the cooldown it names; refused again, merge on the local reviews. Skip it, and say so in the PR, when the hourly quota is spent and the change is low-risk, or the PR has over 100 files. Check each finding against the code like any other; answer refuted ones in their thread with evidence and add recurring false alarms to `review-learnings.md`.
verify: the review covered the head commit, or the skip is stated with its reason.

### 9. Merge
Once the last review is through, turn on auto-merge (squash) rather than waiting for green and merging by hand; required checks still gate it. A green CodeRabbit check alone proves nothing.
Don't stack PRs (`AGENTS.md`, "Don't stack PRs"). A PR stacked anyway keeps auto-merge off until GitHub moves it onto `main` after its base merges, or it merges into the parent's branch. Then turn auto-merge on, merging `origin/main` in first only if it conflicts.
verify: `gh pr view <N> --json state` reports `MERGED` (or auto-merge is enabled and waiting on checks).

### 10. Close out
Prune what this run created, and only that: other agents work in their own worktrees and branches in parallel, so leave every worktree you did not create alone, however stale it looks. Run this from the primary checkout, never from inside the worktree being removed:

```bash
git -C <worktree> status --short             # must print nothing: uncommitted work is never discarded
git worktree remove <worktree>               # refuses on its own if anything is left
git branch -D <branch>                       # the squash merge leaves the local branch unmerged by ancestry
git worktree prune
```

The same goes for any scratch worktree the run made (a docs commit to `main`, a reproduction): remove it as soon as its commit is pushed. If auto-merge is still waiting on checks when you finish, the merge will not wake you; remove the worktree when the next event or session shows the PR merged, and say so in the report. Then report the PR, the dual-review outcome, backlog entries filed, and anything deliberately left out. Do not ask whether to release.
verify: `git worktree list` no longer shows the run's worktrees, and `git branch --list <branch>` prints nothing.

## Stop and ask

- The root cause is ambiguous or will not reproduce.
- The fix needs a change in `packages/*`: those publish on their own tags.
- A review finding would change the design agreed in phase 1.
- A CI failure looks unrelated to the change.
- Any step would rewrite published history (force push, tag deletion, amending a pushed commit).
