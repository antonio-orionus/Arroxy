# Pull requests change English only; translation is one sync at release

Every PR that touched copy used to translate it into every locale before
`bun run check` passed. A one-word change rewrote some sixty catalog files, and
the formatter packed whole string groups onto one line, so copy PRs conflicted
with each other in all of them. In two weeks of October 2026, 56 commits on
`main` rewrote the catalogs and 16 follow-up PRs repaired translations. Two
PRs that were each green combined into missing strings, and a 179-file diff
hid a dropped key until a later PR restored it.

A fix or feature PR now edits `en.json` and the README's `en.mjs` only. A new
or changed string shows in English in every other locale until the next sync,
through i18next's English fallback.

Translation happens once per release, as its first step: one sync PR runs
`i18n:sync`, translates every open entry, compiles, and lands before the
changelog, version bump and tag. Completeness (`check:i18n:complete`) is a
release gate, run by the release script before tagging and by the release
workflow, never by a PR. The per-PR gate checks only what an English change
can break: canonical English, valid existing translations, and an English
README that builds.

The key rule keeps the fallback honest. Keep the key when the meaning stays the
same: until the sync re-checks it, the locales show the old wording, which is
still correct. Use a new key when the meaning or a placeholder changes: the
locales then fall back to English rather than show the old meaning or a
`{{placeholder}}` the code no longer fills.

Rejected:

- **Translating in every PR.** That is the cost and the conflicts described
  above.
- **A scheduled sync.** It opens translation PRs nobody asked for, and a
  release can still go out between runs. With the sync as the first step of a
  release, no release goes out untranslated.
- **Generating runtime JSON at build time.** With English-only PRs the 49
  generated files change only in sync PRs, so dropping them buys little now.
  Deferred, not refused.

## Consequences

Between releases a non-English user can see English strings, and so can
readers of GitHub's non-English READMEs. A release takes one extra PR; a hotfix
release translates only its own few strings. Adding a locale is sync work too.
