# README pipeline

How the public READMEs are generated, translated, and illustrated. The landing site (`orionus.dev/arroxy/`; the old `arroxy.orionus.dev` 301s there) lives in [antonio-orionus/arroxy-web](https://github.com/antonio-orionus/arroxy-web): change landing copy there, not here.

| Source | Generates | Command |
| --- | --- | --- |
| `readme-src/locales/{lang}.mjs` + `readme-src/template.md` | `README.md` + `README.{lang}.md` | `node readme-src/build.mjs` |

- Each locale is its own file under `readme-src/locales/`. `readme-src/strings.mjs` only imports them and exports the ordered `LOCALES` array; edit the per-locale files, not the aggregator.
- `build.mjs` stamps `Last updated:`; never hand-edit it. A README keeps the date of the last build that changed its content (the build compares its render with the file on disk, ignoring the stamp), so rebuilding an unchanged README is a no-op and a single-locale edit bumps only that locale. The staged-file rule for `readme-src/**` rebuilds and re-stamps the READMEs into the same commit.
- The build enforces **key parity**: a locale missing a key that `en` has (or carrying an extra one) fails the build. Every new string goes into every locale.

## Adding a feature

1. Keys are grouped as `feat_<group>_<n>` (`feat_workflow_11`, `feat_quality_3`, `feat_privacy_2`). Add the next number in the matching group to `readme-src/locales/en.mjs`, then to every other locale, then add `- {{feat_<group>_<n>}}` to `readme-src/template.md` in the matching section.
2. Run `node readme-src/build.mjs` and confirm `✓` for every locale.
3. Commit the sources **and** the regenerated `README*.md` files together.

## Locales in scope

Never hardcode the locale list or count in code, docs or memory. Read the canonical lists:

| Surface | Canonical list | Type |
| --- | --- | --- |
| Renderer + main process (i18n) | `SUPPORTED_LANGS` in [`src/shared/schemas.ts`](../src/shared/schemas.ts) | `SupportedLang` (re-exported from [`src/shared/i18n/types.ts`](../src/shared/i18n/types.ts)) |
| README build | `LOCALES` in [`readme-src/strings.mjs`](../readme-src/strings.mjs) | — |

Both stay in lockstep with the landing site's locale list in `arroxy-web`. `en` is the reference: the build script and the `WidenStrings<EnTranslation>` type diff every other locale against it.

## Screenshots

The product screenshots in `build/` are generated, not hand-captured. `bun run screenshots:readme` renders the browser-mock renderer with showcase content (`?showcase=1`: neutral sample titles and generated artwork, never real video art) and the software WebGL backdrop (`?backdropSoftware=1`, so headless Chromium shows the GPU look rather than the no-GPU fallback), and overwrites each file; `bun run screenshots:readme -g "Bulk URLs"` retakes one. Recipes live in `tests/screenshots/readme-screenshots.spec.ts`.

After a UI change, rerun it and commit the updated PNGs with the change. For a new feature: add a Scenario Workbench scenario that shows it (if none does), add a recipe entry, run the command, and reference `build/<file>` from `readme-src/template.md`. The Global hotkey image is an illustration and is not generated.
