---
name: translate-arroxy-i18n
description: Arroxy app i18n workflow. Use when changing English app copy, translating app locales, updating src/shared/i18n/locales JSON, updating i18n PO/POT catalogs, checking stale/out-of-sync translation keys, or answering whether app i18n is correct.
---

# Arroxy App i18n

Use this skill for Arroxy application translations and i18n audits.

## Files

- English source: `src/shared/i18n/locales/en.json`
- Runtime locale JSON: `src/shared/i18n/locales/*.json`
- Translator catalogs: `i18n/app.pot` and `i18n/locales/*.po`
- Catalog scripts: `scripts/i18n-catalog.ts` and `scripts/i18n-catalog-core.ts`

Runtime non-English JSON is generated from PO catalogs. Do not hand-edit non-English runtime JSON.

PO field meaning:

- `msgctxt`: stable i18next key
- `msgid`: current English source string
- `msgstr`: localized string

## Change Workflow

1. Edit `src/shared/i18n/locales/en.json` only.
2. Stop and get explicit user approval for the English copy. Plan approval is not translation approval.
3. Run `bun run i18n:sync` to update `i18n/app.pot` and merge English changes into `i18n/locales/*.po`.
4. Translate only PO entries that are fuzzy, untranslated, or intentionally changed by the task.
5. Preserve `msgctxt` and `msgid`. Edit only `msgstr` and remove `fuzzy` only after reviewing the translation against the current `msgid`.
6. Preserve placeholders, interpolation, markup, shortcut text, product names, and punctuation semantics.
7. Run `bun run i18n:compile` to regenerate runtime locale JSON.
8. Run `bun run check:app` and fix every issue before reporting done.

## Audit Workflow

When asked whether app i18n is correct, run both commands manually:

```bash
bun run check:app
bun run check:app:unused --strict
```

`check:app` validates key drift, placeholders, PO catalog freshness, stale English source, fuzzy entries, untranslated entries, and runtime JSON freshness.

`check:app:unused --strict` catches English keys that stopped being referenced in UI code and often exposes hard-coded English copy.

## Sync Semantics

English changes are detected through gettext's `msgid` model. A stable i18next key lives in `msgctxt`; when the English string changes for the same key, `msgmerge` marks the old translation fuzzy so the catalog cannot pass until reviewed.

If `bun run i18n:sync` fails because `msgmerge` is missing, install GNU gettext in the environment or report that the sync step is blocked. Do not bypass this by editing generated JSON manually.

## README Translations

README files are generated from `readme-src/` and are separate from app i18n. If a task touches README copy, update `readme-src/` and run:

```bash
bun run build:readme
bun run check:readme
```
