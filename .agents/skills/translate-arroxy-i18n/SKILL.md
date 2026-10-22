---
name: translate-arroxy-i18n
description: Arroxy app i18n workflow. Use when changing English app copy, when running the release translation sync (the first step of every release), when translating app or README locales, updating i18n PO/POT catalogs or generated locale JSON, checking stale/out-of-sync translation keys, or answering whether app i18n is correct.
---

# Arroxy App i18n

A fix or feature PR changes English only. All translation happens in one sync PR, the first step of a release (ADR 0017, `docs/adr/0017-prs-change-english-only.md`).

## Files

- English source: `src/shared/i18n/locales/en.json` (keys sorted, one per line)
- Runtime locale JSON: `src/shared/i18n/locales/*.json`, generated from the PO catalogs; never hand-edit the non-English ones
- Translator catalogs: `i18n/app.pot` and `i18n/locales/*.po` (`msgctxt` = i18next key, `msgid` = current English, `msgstr` = translation)
- Glossary: `i18n/glossary.md` (product terms and register per locale)
- README sources: `readme-src/locales/{lang}.mjs`; `readme-src/translated-from.json` records the English they were last translated from
- Catalog scripts: `scripts/i18n-catalog.ts` and `scripts/i18n-catalog-core.ts`

## Changing English copy (any PR)

1. Edit `src/shared/i18n/locales/en.json` and, for README copy, `readme-src/locales/en.mjs`. Nothing else: no `i18n/**`, no non-English JSON, no other README locale.
2. Keep the key when the meaning stays the same. Give the string a new key when its meaning or a placeholder changes, so the locales fall back to English instead of showing the old meaning or an unfilled `{{placeholder}}`. Delete the old key if nothing uses it.
3. Run `bun run i18n:format` to put new keys in place.
4. `bun run check` must pass. It reports the locales that are now behind; that is expected.

## Release sync (first step of every release)

Run it from a fresh `main` in its own worktree, as its own PR. It is the only PR that edits `i18n/**`, non-English runtime JSON and non-English README locales.

1. `bun run i18n:status` lists what is open per locale: new, changed, untranslated, fuzzy and removed entries, and missing README keys. Nothing open means no sync PR: go on with the release.
2. `bun run i18n:sync` updates `i18n/app.pot` and merges English changes into every `i18n/locales/*.po`. Changed English marks the old translation fuzzy; removed keys go away.
3. Read `i18n/glossary.md`. Add any product term this batch introduces, or a register note a translator needs.
4. Translate every untranslated and fuzzy PO entry, and every README key `i18n:status` counts in `readme-src/locales/{lang}.mjs`: keys a locale lacks, and keys whose English changed since `readme-src/translated-from.json` was recorded (`bun run check:readme` names them). Hand the translating to subagents on a Sonnet-class model, never Opus, a batch of locales each. Give each one:
   - the glossary section for its locales;
   - per entry, the key path, the English, and the neighbouring keys in the same group with their English and existing translation, so the string is translated in context;
   - the rules: edit only `msgstr` (and remove `fuzzy` only after checking the translation against the current `msgid`); keep placeholders, markup, shortcut text and product names; non-Latin-script locales write their own script.
5. Review the subagents' output yourself, then run `bun run i18n:compile` and `bun readme-src/build.mjs --record-translated`. The second records the English the README locales now match and rebuilds the READMEs.
6. `bun run check:i18n:complete` must pass: every entry translated, fresh POT, runtime JSON equal to the compiled PO, README key parity in every locale, and the `i18n-complete` tests. Then `bun run check`.
7. Open `i18n: sync translations` and land it with a light dual review (a translation diff, not logic) plus a native-script spot check of a few locales. No CodeRabbit trigger.

If `bun run i18n:sync` fails because `msgmerge` is missing, install GNU gettext or report that the sync is blocked. Never edit generated JSON by hand to get around it.

## Audit

When asked whether app i18n is correct:

```bash
bun run check:i18n            # what every PR must pass: valid English and valid existing translations
bun run i18n:status           # what the next sync has to translate
bun run check:i18n:complete   # the release gate: everything translated and compiled
```

## Sync semantics

English changes are detected through gettext's `msgid` model: a stable key lives in `msgctxt`, and when its English changes `msgmerge` marks the old translation fuzzy. `i18n:compile` writes only entries translated for the current English, so an open entry falls back to English at runtime; a plural message is written whole or not at all.
