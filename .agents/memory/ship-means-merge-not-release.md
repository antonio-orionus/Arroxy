---
name: ship-means-merge-not-release
description: "Ship" or "land" means fix → PR → merge; release only on an explicit "release", stable only, never a -beta.N. Releases are immutable and fan out to five channels.
metadata:
  type: feedback
---

When Antonio says "ship", "ship the fix" or "land it", stop after the
squash-merge. Cut a release (version bump, tag, `release:stable`) only when he
explicitly says "release" or names a version.

**No betas** ("no betas!", 2026-10-19). `bun run release:beta` and the
`-beta.N` tag path exist, but no plan may depend on them, and "one beta" is never
a rollout gate. De-risk a risky change before the merge instead: live smoke
comparisons, fixture E2E, or log-only shadow mode in a normal stable release.

**Why:** on 2026-10-15 "ship the multi-language embed fix" was read as the full
chain and v0.4.26 went out to GitHub, Scoop, Homebrew, Winget and the Flatpak
repo when he only wanted the merge. Undoing it cost far more than the release:
an immutable GitHub release burns its tag name forever once deleted (the next
version had to skip 0.4.26), Scoop and Homebrew needed reverts, the Winget PR had
to be closed, and the Flatpak repo on Pages could not be rolled back at all. The
beta rule came from a plan that gated the PO-token change on a beta.

**How to apply:** the `land` skill stops at the merge; releasing follows
`dev-docs/release-runbook.md` only on request.
After merging, report the PR and ask whether to release. Related:
[[finish-before-pr]], [[coderabbit-review-workflow]].
