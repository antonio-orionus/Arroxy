---
name: ship-means-merge-not-release
description: "Ship the fix" means fix → PR → merge; never cut a release unless Antonio explicitly says "release". Releases here are immutable and fan out to five channels.
metadata:
  type: feedback
---

When Antonio says "ship", "ship the fix", or invokes the ship-fix flow, stop
after the squash-merge. Cut a release (version bump, tag, `release:stable`)
only when he explicitly says "release" or names a version.

**Why:** on 2026-10-15 "ship the multi-language embed fix" was read as the full
ship-fix chain and v0.4.26 went out to GitHub, Scoop, Homebrew, Winget and the
Flatpak repo. He only wanted the merge. Undoing it cost far more than the
release: GitHub immutable releases burn the tag name forever once deleted (the
next version had to skip 0.4.26), Scoop/Homebrew needed reverts, the Winget PR
had to be closed, and the Flatpak repo on Pages could not be rolled back at all
(the old Pages artifact expires, signing needs the CI secret, and release.yml
has no manual trigger) — it kept serving the pulled version until the next
release.

**How to apply:** treat phase 9 (Release) of ship-fix as opt-in. After merging,
report the PR and ask whether to release. Also see [[finish-before-pr]] and
[[coderabbit-review-workflow]].
