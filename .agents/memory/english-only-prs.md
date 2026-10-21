---
name: english-only-prs
description: Fix and feature PRs change English only (en.json, readme-src/locales/en.mjs); every translation happens in one sync PR as the first step of a release (ADR 0017).
metadata:
  type: feedback
---

A PR adds or changes copy in `src/shared/i18n/locales/en.json` and
`readme-src/locales/en.mjs` only. It never touches `i18n/**`, non-English
runtime JSON or non-English README locales, and it never runs `i18n:sync` or
`i18n:compile`. `bun run check` passes with the other locales behind; they show
English for the new strings until the sync.

Translation happens in one sync PR (the `translate-arroxy-i18n` skill), and
only as the first step of a release (Antonio, 2026-10-21: no scheduled job, no
releasing untranslated). `check:i18n:complete` gates the release, in
`scripts/release.sh` and in `release.yml`.

**Why:** translating in every PR made each copy change rewrite ~60 catalog files
and conflict with every other copy PR. 56 of 322 commits on main in two weeks
rewrote the catalogs, 16 PRs were translation repairs, and two green PRs
combined into missing strings (#431 + #432).

**How to apply:**
- Same meaning keeps the key; a meaning or placeholder change gets a new key,
  so locales fall back to English instead of showing the old meaning or an
  unfilled `{{placeholder}}`.
- When dispatching implementers, tell them to edit English only.
- "Release X" starts with the sync PR; land it, then changelog, bump and tag.

Related: [[finish-before-pr]], [[ship-means-merge-not-release]].
