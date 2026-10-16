---
name: translate-at-final-stage
description: Translate locale catalogs (app PO and README locales) only at the final stage before the PR, never while the feature is still being built.
metadata:
  type: feedback
---

While a feature is under active development, add new copy to `en.json` (and
`readme-src/locales/en.mjs`) only. Run the `translate-arroxy-i18n` flow and the
README locale translations once, at the final stage: after the last review fix
that can change English copy, right before the PR.

**Why:** English copy keeps changing through reviews and fix rounds. Translating
mid-development pays the full 29-locale cost again for every wording change and
leaves fuzzy entries to re-check.

**How to apply:** during development, `bun run check` failing **only** on
`check:i18n` for untranslated new keys is expected and accepted. Every other gate
must still pass. When dispatching implementers, tell them not to touch `.po`
files or non-English locale JSON. Translation remains part of "done" per
[[finish-before-pr]], so it is the last step before the PR, not skipped.
