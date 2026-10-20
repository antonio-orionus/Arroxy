---
name: squash-onto-merge-base
description: Squash with `reset --soft $(git merge-base origin/main HEAD)`, never `reset --soft origin/main`; PR #430 reverted 168 merged files that way.
metadata:
  type: feedback
---

PR #430's squash commit `7ec85632` reverted 168 files of merged work on main; #433 restored them. The session squashed its two reviewed commits with `git reset --soft origin/main && git commit` after another session's fetch had moved `origin/main` (worktrees share refs). `--soft` keeps the index, which held the old base's tree plus the branch's edits, and re-parents it on the new main, so the commit reads as a revert of everything merged in between. The review and `bun run check` had run before the rewrite, so the pushed head was never reviewed. `git log HEAD..origin/main` came back empty and was read as "main has not moved", but it is empty by construction after that reset.

**Why:** with several lanes merging in parallel, `origin/main` moves while a branch is in flight, and a stale-tree squash then passes every check that compares commits rather than trees.

**How to apply:**
- Squash with `git reset --soft $(git merge-base origin/main HEAD)` or `git commit --amend`, and do it before `review:dual`, never after.
- Run `bun run review:check-head` before every push in the land flow. It prints `git diff --stat origin/main...HEAD` and refuses a head that undoes main's work or differs from the reviewed diff. Read that file list against what the task declared.
- To learn whether main moved, compare trees (`git diff --stat origin/main...HEAD`), not `git log HEAD..origin/main`.

Related: [[coderabbit-review-workflow]], [[review-learnings]].
