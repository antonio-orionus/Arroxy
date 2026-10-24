# README pipeline

How the public READMEs are generated, translated, and illustrated. The public site, arroxy.com, lives in the `arroxy-site` repo: change site copy there, not here. The old `arroxy-web` repo is archived.

| Source | Generates | Command |
| --- | --- | --- |
| `readme-src/locales/{lang}.mjs` + `readme-src/template.md` | `README.md` + `docs/readme/README.{lang}.md` | `node readme-src/build.mjs` |

- Each locale is its own file under `readme-src/locales/`. `readme-src/strings.mjs` only imports them and exports the ordered `LOCALES` array; edit the per-locale files, not the aggregator.
- `build.mjs` fills the date into the localized `last_updated` string (its `{{LAST_UPDATED}}`); never hand-edit it. A README keeps the date of the last build that changed its content (the build compares its render with the file on disk, ignoring the stamp), so rebuilding an unchanged README is a no-op and a single-locale edit bumps only that locale. The staged-file rule for `readme-src/**` rebuilds and re-stamps the READMEs into the same commit.
- A locale missing a key that `en` has renders the English string. A PR adds new strings to `en.mjs` only; the release sync translates them (ADR 0017), and `--strict` (`bun run check:readme`, part of `check:i18n:complete`) fails on any missing or extra key.
- `website_url` is each locale's link to the website: its own language page where arroxy.com has one, otherwise `https://arroxy.com/` (English).

## Adding a feature

1. Keys are grouped as `feat_<group>_<n>` (`feat_workflow_11`, `feat_quality_3`, `feat_privacy_2`). Add the next number in the matching group to `readme-src/locales/en.mjs` (the release sync adds it to every other locale), then add `- {{feat_<group>_<n>}}` to `readme-src/template.md` in the matching section.
2. Run `node readme-src/build.mjs` and confirm it builds; the other locales warn about the new key until the sync.
3. Commit the sources **and** the regenerated `README.md` and `docs/readme/` files together.

## Locales in scope

Never hardcode the locale list or count in code, docs or memory. Read the canonical lists:

| Surface | Canonical list | Type |
| --- | --- | --- |
| Renderer + main process (i18n) | `SUPPORTED_LANGS` in [`src/shared/schemas.ts`](../src/shared/schemas.ts) | `SupportedLang` (re-exported from [`src/shared/i18n/types.ts`](../src/shared/i18n/types.ts)) |
| README build | `LOCALES` in [`readme-src/strings.mjs`](../readme-src/strings.mjs) | — |

Both stay in lockstep with each other. The site (`arroxy-site`) has its own, shorter language list and does not constrain them. `en` is the reference: the build script and the `WidenStrings<EnTranslation>` type diff every other locale against it.

## Screenshots

### Shared README and site banners

`readme-src/banner.html` is the shared composition; `readme-src/banners.mjs` renders it from each locale's `hero_banner_line1` and `hero_banner_line2`, bundled script fonts, and localized app screenshots. Direction changes layout positions, never the pixels within screenshots. The website's live hero remains separate HTML text and screenshot layers, with its own responsive layout.

Run `bun run build:readme:banners` after changing a headline, composition, font or source screenshot, then `bun run build:readme`. The renderer fails on missing translations or screenshots and checks image loading and headline bounds. It writes content-addressed JPEGs and a source-digest manifest to `build/banners/`; commit both with the generated READMEs. `bun run build:readme` verifies those digests without launching a browser.

The parallel-download screenshot recipe also captures `Download-row.webp` from the actual first row in each locale. The banner uses that image instead of fixed crop coordinates, since translated toolbars can wrap. Regenerate it with `bun run screenshots:readme -g "Parallel downloads"`.

The site's `bun run assets` and `bun run og` import these published images and their headlines through `build/banners/manifest.json`. They accept `--ref` for a published app ref or `--working-tree` for local verification. The site never renders a second share-card template; its normal check still rejects a banner whose headline differs from the live hero.

The product screenshots are generated, not hand-captured, in every UI language, and each README shows its own language's. `bun run screenshots:readme` renders the browser-mock renderer with showcase content (`?showcase=1`: neutral sample titles and generated artwork, never real video art) and the software WebGL backdrop (`?backdropSoftware=1`, so headless Chromium shows the GPU look rather than the no-GPU fallback), and writes each shot as WebP to `build/screenshots/<locale>/`; `bun run screenshots:readme -g "Bulk URLs"` retakes one shot in every language, and `--locales de,fr` limits a run to those languages. Recipes live in `tests/screenshots/readme-screenshots.spec.ts`.

The template names the English shot (`build/screenshots/en/<file>.webp`); `build.mjs` points each README at its own language's copy, and keeps the English one where that language has none: it warns about each gap, and `bun run check:i18n:complete` (which builds with `--strict`) fails until every language has every shot. Shots are lossy WebP at 2x pixel density (about 90 KB each, against about 1.5 MB as PNG), so all of them in every language add about 70 MB to the repo per full retake: retake only the shots a change affects. The shots the Flatpak metainfo lists are also written in English as PNG to `build/`, since AppStream takes no WebP.

Shots run six at a time with reduced motion, so the backdrop draws one still frame instead of animating; every shot in every language takes about a quarter of an hour. On a busy machine, software WebGL can be too slow for the backdrop to start, and those shots fail; `bun run screenshots:readme --last-failed` retakes them. Recipe steps find elements by test id, never by visible text, so they work in every locale.

After a UI change, retake the affected shots and commit the updated files with the change. For a new feature: add a Scenario Workbench scenario that shows it (if none does), add a recipe entry, run the command, and reference `build/screenshots/en/<file>.webp` from `readme-src/template.md`. The Global hotkey image is an illustration and is not generated.
