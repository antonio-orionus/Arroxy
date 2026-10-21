# README pipeline

How the public READMEs are generated, translated, and illustrated. The landing site (`orionus.dev/arroxy/`; the old `arroxy.orionus.dev` 301s there) lives in [antonio-orionus/arroxy-web](https://github.com/antonio-orionus/arroxy-web): change landing copy there, not here.

| Source | Generates | Command |
| --- | --- | --- |
| `readme-src/locales/{lang}.mjs` + `readme-src/template.md` | `README.md` + `docs/readme/README.{lang}.md` | `node readme-src/build.mjs` |

- Each locale is its own file under `readme-src/locales/`. `readme-src/strings.mjs` only imports them and exports the ordered `LOCALES` array; edit the per-locale files, not the aggregator.
- `build.mjs` stamps `Last updated:`; never hand-edit it. A README keeps the date of the last build that changed its content (the build compares its render with the file on disk, ignoring the stamp), so rebuilding an unchanged README is a no-op and a single-locale edit bumps only that locale. The staged-file rule for `readme-src/**` rebuilds and re-stamps the READMEs into the same commit.
- The build enforces **key parity**: a locale missing a key that `en` has (or carrying an extra one) fails the build. Every new string goes into every locale.
- `website_url` is each locale's link to the website: its own language page where arroxy.com has one, otherwise `https://arroxy.com/` (English).

## Adding a feature

1. Keys are grouped as `feat_<group>_<n>` (`feat_workflow_11`, `feat_quality_3`, `feat_privacy_2`). Add the next number in the matching group to `readme-src/locales/en.mjs`, then to every other locale, then add `- {{feat_<group>_<n>}}` to `readme-src/template.md` in the matching section.
2. Run `node readme-src/build.mjs` and confirm `✓` for every locale.
3. Commit the sources **and** the regenerated `README.md` and `docs/readme/` files together.

## Locales in scope

Never hardcode the locale list or count in code, docs or memory. Read the canonical lists:

| Surface | Canonical list | Type |
| --- | --- | --- |
| Renderer + main process (i18n) | `SUPPORTED_LANGS` in [`src/shared/schemas.ts`](../src/shared/schemas.ts) | `SupportedLang` (re-exported from [`src/shared/i18n/types.ts`](../src/shared/i18n/types.ts)) |
| README build | `LOCALES` in [`readme-src/strings.mjs`](../readme-src/strings.mjs) | — |

Both stay in lockstep with the landing site's locale list in `arroxy-web`. `en` is the reference: the build script and the `WidenStrings<EnTranslation>` type diff every other locale against it.

## Screenshots

The product screenshots are generated, not hand-captured, in every UI language, and each README shows its own language's. `bun run screenshots:readme` renders the browser-mock renderer with showcase content (`?showcase=1`: neutral sample titles and generated artwork, never real video art) and the software WebGL backdrop (`?backdropSoftware=1`, so headless Chromium shows the GPU look rather than the no-GPU fallback), and writes each shot as WebP to `build/screenshots/<locale>/`; `bun run screenshots:readme -g "Bulk URLs"` retakes one shot in every language, and `--locales de,fr` limits a run to those languages. Recipes live in `tests/screenshots/readme-screenshots.spec.ts`.

The template names the English shot (`build/screenshots/en/<file>.webp`); `build.mjs` points each README at its own language's copy, and keeps the English one where that language has none: it warns about each gap, and `bun run check` (which builds with `--strict`) fails until every language has every shot. Shots are lossy WebP at 2x pixel density (about 90 KB each, against about 1.5 MB as PNG), so all of them in every language add about 70 MB to the repo per full retake: retake only the shots a change affects. The shots the Flatpak metainfo lists are also written in English as PNG to `build/`, since AppStream takes no WebP.

Shots run six at a time with reduced motion, so the backdrop draws one still frame instead of animating; every shot in every language takes about a quarter of an hour. On a busy machine, software WebGL can be too slow for the backdrop to start, and those shots fail; `bun run screenshots:readme --last-failed` retakes them. Recipe steps find elements by test id, never by visible text, so they work in every locale.

After a UI change, retake the affected shots and commit the updated files with the change. For a new feature: add a Scenario Workbench scenario that shows it (if none does), add a recipe entry, run the command, and reference `build/screenshots/en/<file>.webp` from `readme-src/template.md`. The Global hotkey image is an illustration and is not generated.
