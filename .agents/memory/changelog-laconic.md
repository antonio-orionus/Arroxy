---
name: changelog-laconic
description: Changelog entries (changelog.d/ fragments and CHANGELOG.md sections) are short and user-facing — one or two sentences on what the user sees, no internals, no exact sizes.
metadata:
  type: feedback
---

Write every changelog entry so a user actually reads it: each `changelog.d/` fragment a PR adds, and the `CHANGELOG.md` section a release assembles from them.

- One or two short sentences. A highlight is a bold lead-in plus one or two sentences, nothing more.
- Say what the user sees or gets, in the app's own UI words (**Try now**, **Set it up manually**). Leave out how it works: no internal names, error codes, flags, timeouts or step-by-step behaviour.
- No specific numbers for sizes ("smaller download", not "50 MB smaller"); they change with every package and nobody checks them.
- Skip refactors, tests, docs, log-only changes and polish of features new in the same release.

**Why:** The 0.7.0 draft (2026-10-19) grew to multi-sentence entries listing every rule and number; the user had the whole section, older entries included, cut to one or two sentences each: the more text, the less people read.

**How to apply:** Write each fragment in this style; a PR that changes a feature not released yet edits that feature's fragment instead of adding one. When assembling a release section (the "release X" flow in `AGENTS.md`), read the result over and shorten any entry that breaks it.
