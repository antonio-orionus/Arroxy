---
name: finish-before-pr
description: Close every related follow-up before proposing a PR — no dangling "worth its own issue" items.
metadata:
  type: feedback
---

Antonio wants one complete PR once everything related is done, not a PR that
lands with a trail of deferred follow-ups. Ending a summary with "X is still
open", "worth its own issue", or "want me to also do Y?" is the failure mode —
if Y is part of shipping the change properly, just do Y.

**Why:** deferred items in this repo do not get picked up later. The fixture E2E
suite is the cautionary case: it was never wired into CI, so a queue-UI rework
left four specs driving buttons that no longer existed and a silent
resume-after-restart bug shipped unnoticed. Small deferred gaps become invisible
permanent ones.

**How to apply:** for a user-facing feature, "done" includes the code, tests at
the owning layer, all locale catalogs, the README (`readme-src/`, all locales),
`CHANGELOG.md`, and any security or tooling gap the change directly touches.
Raise scope concerns while working, not as leftovers at the end. Splitting the
work across several commits on one branch is fine and preferred — that is not
what he means by fragmented.
