# yt-dlp message catalogue

Every message site in the yt-dlp build users run, labelled with what it means for Arroxy, rebuilt daily. It tells us which messages exist, which carry a known failure kind, and what changed with each yt-dlp pin, before a reworded upstream error quietly disables a recovery path.

## What it is

- **A message site** is one place in yt-dlp's source that raises, reports or prints a message (`GLOSSARY.md`). `scripts/ytdlp-catalogue/extract.py` lists them by reading the source with Python's `ast`: parsed as text, never imported or run.
- **Each site is labelled** (`label.ts`) with its category, a failure kind (today's yt-dlp error kinds plus `siteChanged`), whether an account helps, and the user's action. Each field records the rule that gave it: an override, the call, the text (ytdlp-errors patterns), or a call fallback. Whether an account helps a `siteChanged` failure is the app's own `escalationReason`; `tests/unit/ytdlp-catalogue-label.test.ts` holds the labels to it.
- **`relays`** marks a site whose text may be the site's own words (an API's error, a scraped page notice). Labels can't read those; only a run-time classifier can.

## Where it lives

| What | Where |
|---|---|
| Extractor, rules, overrides, report | `scripts/ytdlp-catalogue/` on `main` |
| The catalogue and one coverage report per pin | the `ytdlp-catalogue` branch (no shared history with `main`, written only by the workflow) |
| Daily run | `.github/workflows/ytdlp-catalogue.yml`, 14:00 UTC, an hour after the runtime manifest publishes |

The workflow resolves the pin from the signed runtime manifest (`pin.ts`: its first yt-dlp entry, the one the app tries first, and the commit that release was built from), rebuilds when the pin or the generator (extractor, label rules, report) changed (`daily.ts`), and pushes one commit to the data branch. A same-pin rebuild writes its report as `coverage/<version>+generator-<hash>.md`, so the pin's own report keeps its diff against the pin before. A previous catalogue the current schema can't read is rebuilt from scratch, and a run where yt-dlp files failed to parse still pushes, then fails. It never blocks a pin bump: the manifest is already out, and nothing on `main` reads the data branch.

## Commands

```bash
bun scripts/ytdlp-catalogue/pin.ts                      # the pinned yt-dlp, as JSON
bun run ytdlp:catalogue:extract --src <yt-dlp checkout> # raw sites
bun run ytdlp:catalogue --src <checkout> --commit <sha> --version <tag> --channel nightly --out-dir <dir> [--previous <catalogue.json>]
```

The extractor needs Python 3.10 or newer, found as the parity checks find it.

## Changing a label

Edit the rules (`label.ts`) or add an override to `scripts/ytdlp-catalogue/overrides.json` in a PR on `main`; the next daily run re-labels the same pin (any change to the generator triggers a rebuild); dispatch the workflow to run it at once. Never edit the data branch. The coverage report's **Drift** section lists overrides that matched nothing and sites whose text disagrees with their call rule; its **Unlabelled error sites** section is the triage list.

Design and decisions: `.internal/ytdlp-message-catalogue-design.md` (private).
