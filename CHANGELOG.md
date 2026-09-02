# Changelog

All notable user-facing changes to Arroxy.

This file is the source of truth for release notes. The release workflow reads the section matching the pushed tag (e.g. `## 0.3.5-beta.1`) and posts it as the GitHub Release body. Auto-generated "What's Changed" PR list + Full Changelog link is appended automatically.

When cutting a release, add a new section at the top in the same shape as the most recent entry.

---

## 0.4.9-beta.2

The global Quick Download shortcut is now on from the first launch instead of waiting to be switched on.

## Highlights

### Quick Download Works Out Of The Box

- `Ctrl/Cmd + Shift + D` is live on a fresh install — copy a link anywhere and press it, no trip through Settings first. The previous beta shipped the shortcut turned off, so most people never found it.
- Existing installs keep whatever their settings already say. If you ran an earlier beta, the shortcut stays off until you switch it on under Settings → Global hotkey — the new default only applies to a profile that has never stored the setting.
- You can still switch it off, record a different combination, or reset to the default under Settings → Global hotkey. If another app already owns the chord, Arroxy tells you there instead of failing quietly.

## 0.4.9-beta.1

A global shortcut that downloads whatever link you have copied — from any app, without opening Arroxy — plus real titles for Vimeo OTT videos and a settings store that no longer loses preferences when two writes land at once.

## Highlights

### Quick Download From Anywhere

- Copy a video link in your browser, press one shortcut, and Arroxy queues it with your active download profile. No window switching, no pasting. Turn it on under Settings → Global hotkey; the default chord is `Ctrl/Cmd + Shift + D`, and you can record any other combination or reset back to the default.
- If the shortcut is already claimed by another app, Arroxy says so while you are picking it instead of failing silently later.
- Every press answers you where you are looking — a native notification when Arroxy is in the background, an in-app message when it is in front. It tells you what actually happened: queued, already in the queue, nothing on the clipboard, or a link that needs a quick look first.
- Copy several links at once and the shortcut points you at Bulk URLs rather than guessing which one you meant.
- The queue shows the item the moment you press the shortcut, so you get an immediate acknowledgment rather than waiting for the site to answer.
- The main screen shows a small hint for the shortcut once it is enabled, so it stays discoverable instead of being a setting you turn on and forget.

### Copying Several Links At Once

- Copying a list of links no longer pops the bulk sheet open on its own. Arroxy hints that a multi-link clipboard is waiting and lets you decide when to open Bulk URLs — the same clipboard watch, without a window taking over the screen while you are working elsewhere.

### Vimeo OTT Titles

- Videos hosted on Vimeo OTT (VHX) storefronts used to arrive in the queue as "Untitled". Arroxy now recovers the real title from the page, so those downloads are named like everything else.

### Settings That Stay Put

- Two settings changes arriving at the same moment could interleave and leave part of your preferences behind. Every write is now serialized and, if one fails, rolled back to the last known-good state — so a failed save can no longer strand settings halfway.
- Older profiles that predate the current filename defaults are migrated properly instead of quietly reverting to the built-in template, and a single unreadable profile no longer takes the rest of your profiles down with it.

### Under The Hood

- Six additional lint rules now run over the source and the findings they surfaced in production code are cleared. The codebase's rules on validating data at trust boundaries are written down as policy rather than convention, and the remaining type assertions in production paths are gone.
- Toolchain bumped to Bun 1.4.0 across the repo, CI, and the version pins.

---

## 0.4.8

Arroxy speaks Brazilian Portuguese now, starts noticeably faster, stops downloading yt-dlp three times over on a fresh install, and pausing the queue finally looks like what it is.

## Highlights

### Português (Brasil)

- Arroxy is now translated into Brazilian Portuguese, bringing it to 24 languages. Pick it under Settings, or let it follow your system language. Translation contributed by [@tiagofreire-ia](https://github.com/tiagofreire-ia).

### A Quicker, Quieter Start

- The splash screen used to sit there for a full three seconds no matter how ready Arroxy actually was. It now clears as soon as the work is genuinely done, so a normal launch feels close to instant.
- Fetching the YouTube token no longer holds up the launch. It happens quietly in the background instead, which matters most when YouTube is slow or unreachable — that case was measured holding the splash for eleven seconds, and it no longer holds it at all. If the token isn't ready in time, the first download simply fetches one then, exactly as it always could.
- Startup now records what it spent its time on. If Arroxy ever feels slow to start, the log says which step was responsible, which makes a report something we can actually act on.
- Setting up a newly released yt-dlp involves a check your operating system runs over the download, and it is genuinely slow — around fifteen seconds on the Mac this was measured on. Faster hardware barely helps, because almost none of that time is Arroxy working. Arroxy no longer interrupts that with a warning five seconds in, and no longer offers to cancel a setup that is working perfectly. If a check does run far longer than it should, Arroxy says so then.
- The button that appears when setup is struggling used to read "Cancel setup", which rather undersold it — it leads to a panel that can install yt-dlp for you or point Arroxy at a copy you already have. It now says what it does.

### One yt-dlp Download, Not Three

- On a first launch Arroxy could fetch yt-dlp, stall, fetch a different build of it, stall, and fetch a third, before anything downloaded. Nothing was actually wrong with the first one. yt-dlp unpacks around a hundred files every time it runs, and the security scanner that inspects them — Gatekeeper on macOS, Defender on Windows — took longer than the 30 seconds Arroxy allowed before it gave up and assumed the component was broken. Each assumed failure bought another download that met the same scanner.
- Arroxy now separates a component that is genuinely unusable from one that is merely slow to clear your machine's security check, and stops paying for a new download in the second case. First launch on a clean install is quicker and a lot quieter.

### Pausing The Queue

- Pausing all downloads used to change nothing on screen — pending items kept their normal look, so a paused queue was indistinguishable from an idle one. The queue now shows a paused banner with a "Resume queue" button, and pausing or resuming the whole queue (Cancel all included) is reflected immediately.
- The paused state survives a restart: quit with the queue paused and it comes back paused.
- Cancelling everything at the same moment you paused the queue could leave the paused banner stuck on screen while downloads quietly carried on. The queue now remembers the pause state you actually asked for and restores it correctly once the cancel sweep finishes.
- Pausing and resuming the whole queue is handled through a single code path now, so edge cases where pause states overlap behave the same way every time.

### Under The Hood

- The checks that confirm Arroxy launches cleanly were rebuilt: a journey-based startup harness now runs real cold and warm starts against a previous release's profile on every pull request and nightly, replacing a cold-start test that had stopped working. No user-visible behavior change — this is what catches regressions before they reach you.
- The release checks now scan the app's source for hardcoded labels and titles that bypass the translation system — including text written in non-Latin scripts — so every screen stays fully translated across all 24 languages. A few labels that had slipped through were moved to proper translation keys.

---

## 0.4.8-beta.6

No user-facing changes — this beta re-cuts 0.4.8-beta.5 after fixing the release pipeline's own startup gate, which failed on Windows for two environmental reasons rather than any app defect: the update check against the not-yet-published draft reports a Windows-shaped file name (`latest.yml`, no platform suffix) that the existing waiver did not cover, and a transient Chromium sandbox-bundle bootstrap retry on a loaded runner was being logged as a renderer startup error.

## Highlights

### Under The Hood

- The release-tier startup gate now waives the draft-release metadata 404 on Windows too, where the updater's channel file carries no platform suffix (`latest.yml` instead of `latest-mac.yml`). A different updater failure still fails the gate.
- Renderer console messages coming from Chromium's own sandbox-bundle bootstrap retry are logged as info instead of errors — the window is recreated and startup completes normally, so they no longer trip the startup log oracle.

---

## 0.4.8-beta.5

A small beta fixing how pausing the queue behaves when it collides with other queue actions, plus a guard that keeps untranslated text from slipping into the app.

## Highlights

### Paused Stays Honest

- Cancelling everything at the same moment you paused the queue could leave the paused banner stuck on screen while downloads quietly carried on. The queue now remembers the pause state you actually asked for and restores it correctly once the cancel sweep finishes.
- Pausing and resuming the whole queue is handled through a single code path now, so edge cases where pause states overlap behave the same way every time.

### Under The Hood

- The release checks now scan the app's source for hardcoded labels and titles that bypass the translation system — including text written in non-Latin scripts — so every screen stays fully translated across all 24 languages. A few labels that had slipped through were moved to proper translation keys.

---

## 0.4.8-beta.4

No user-facing changes — again a re-cut after fixing the release pipeline's own startup gate, this time on how the gate launches the previous release to build an inherited profile: the Linux AppImage now extracts itself instead of requiring FUSE (missing on CI runners), and the Windows portable exe is unpacked with 7-Zip so the inner app is launched directly instead of through its NSIS wrapper.

---

## 0.4.8-beta.3

No user-facing changes — this beta re-cuts 0.4.8-beta.2 after a fix to the release pipeline's own startup gate, which had failed on its own environmental noise (the update check against the not-yet-published draft, and a stale Linux asset name) rather than on any app defect.

## Highlights

### Under The Hood

- The release-tier startup gate no longer fails because the app's soft update check cannot find update metadata for the release being built — the gate's own token makes that draft visible, and the metadata is only uploaded later. A different updater failure still fails the gate.
- The gate's "previous release" profile on Linux now downloads the AppImage by the name electron-builder actually publishes (`x64`, not `x86_64`).

---

## 0.4.8-beta.2

A small beta. The one user-facing change: pausing the whole queue is now something you can see.

## Highlights

### Paused Means Paused

- Pausing all downloads used to change nothing on screen — pending items kept their normal look, so a paused queue was indistinguishable from an idle one. The queue now shows a paused banner with a "Resume queue" button, and pausing or resuming the whole queue (Cancel all included) is reflected immediately.
- The paused state survives a restart: quit with the queue paused and it comes back paused.

### Under The Hood

- The checks that confirm Arroxy launches cleanly were rebuilt: a journey-based startup harness now runs real cold and warm starts against a previous release's profile on every pull request and nightly, replacing a cold-start test that had stopped working. No user-visible behavior change — this is what catches regressions before they reach you.

---

## 0.4.8-beta.1

Arroxy speaks Brazilian Portuguese now, starts noticeably faster, and a fresh install stops downloading yt-dlp three times over before it will start.

## Highlights

### Português (Brasil)

- Arroxy is now translated into Brazilian Portuguese, bringing it to 24 languages. Pick it under Settings, or let it follow your system language. Translation contributed by [@tiagofreire-ia](https://github.com/tiagofreire-ia).

### A Quicker, Quieter Start

- The splash screen used to sit there for a full three seconds no matter how ready Arroxy actually was. It now clears as soon as the work is genuinely done, so a normal launch feels close to instant.
- Fetching the YouTube token no longer holds up the launch. It happens quietly in the background instead, which matters most when YouTube is slow or unreachable — that case was measured holding the splash for eleven seconds, and it no longer holds it at all. If the token isn't ready in time, the first download simply fetches one then, exactly as it always could.
- Startup now records what it spent its time on. If Arroxy ever feels slow to start, the log says which step was responsible, which makes a report something we can actually act on.
- Setting up a newly released yt-dlp involves a check your operating system runs over the download, and it is genuinely slow — around fifteen seconds on the Mac this was measured on. Faster hardware barely helps, because almost none of that time is Arroxy working. Arroxy no longer interrupts that with a warning five seconds in, and no longer offers to cancel a setup that is working perfectly. If a check does run far longer than it should, Arroxy says so then.
- The button that appears when setup is struggling used to read "Cancel setup", which rather undersold it — it leads to a panel that can install yt-dlp for you or point Arroxy at a copy you already have. It now says what it does.

### One yt-dlp Download, Not Three

- On a first launch Arroxy could fetch yt-dlp, stall, fetch a different build of it, stall, and fetch a third, before anything downloaded. Nothing was actually wrong with the first one. yt-dlp unpacks around a hundred files every time it runs, and the security scanner that inspects them — Gatekeeper on macOS, Defender on Windows — took longer than the 30 seconds Arroxy allowed before it gave up and assumed the component was broken. Each assumed failure bought another download that met the same scanner.
- Arroxy now separates a component that is genuinely unusable from one that is merely slow to clear your machine's security check, and stops paying for a new download in the second case. First launch on a clean install is quicker and a lot quieter.

---

## 0.4.7

A fixes release. The big one: pasting a playlist link into the bulk list no longer names every file after the link instead of the track.

## Highlights

### Playlist Links In The Bulk List

- Pasting a playlist, channel or search link into the bulk list now expands it into its videos, one row each, the way the main URL box already did. Before, the whole link went in as a single item and the download ran against the entire set under one name — every file came out called something like `www.youtube.com_playlist [dQw4w9WgXcQ].mp3` instead of the track title.
- If your filename template had no `[id]` in it, this was worse than a naming problem: every video wrote to the same path, so the first one landed and the rest were quietly skipped as already downloaded. Worth checking any playlist you pulled that way against its real length.
- Some rows really are playlists rather than videos — a channel's Playlists tab, an album shelf in YouTube Music. Those now carry a "Playlist" tag, cannot be ticked, and the list tells you to paste that link on its own to download it.

### Cancelling A Download

- Cancelling while a required component was still downloading took about 45 seconds to actually stop. It now stops at once. The delay was worst in exactly the situation where you would want to cancel: a connection that stalls before the download properly begins.

### More YouTube Links Recognised

- Live, clip and embed links — `/live/`, `/clip/`, `/embed/`, and the older `/v/` and `/e/` players — are now understood as single videos instead of falling through as unrecognised. Links copied off an embedded player on `youtube-nocookie.com` work too.
- An embedded playlist player (`/embed/videoseries?list=...`) is correctly read as a playlist, since there is no single video behind it.

### Fixes

- Windows: folder names such as `COM0`, `LPT0`, `CONIN$` and `CONOUT$` were rejected as reserved device names that Windows does not actually reserve, turning ordinary names into a validation error you could not get past. The list now matches Microsoft's documented one exactly.
- Windows: a playlist titled `CON` or `NUL` produced a folder Windows refuses to create, leaving the download nowhere to go. Reserved names are now escaped on the name's stem — `NUL_.mp4` rather than `NUL.mp4_`, which was still the null device and mangled the extension for nothing.
- Long labels in segmented controls — quality tiers, formats, subtitle modes — could paint over the control beside them instead of wrapping, worst in languages whose words run longer than English. They now wrap and shrink to fit at any window size.

---

## 0.4.6

A small release with two changes you can see. If you have been putting off updating, the update popup now tells you what changed across every version you skipped instead of only the newest one.

## Highlights

### Catching Up On What Changed

- The What's New popup now shows every release you missed, not just the one you landed on. Update from 0.4.2 straight to 0.4.6 and you get all four sets of notes in one place, newest first, each under its own version heading.
- Previously the popup showed only the section for the version you just installed, so anything that changed in between went unmentioned — even though it was a single scroll away.
- If you update one release at a time, nothing changes: you see exactly one set of notes, as before.

### Fixes

- Fixed the Subtitles and SponsorBlock options overlapping each other when editing a download profile. "Mark as chapters" and "Remove segments" ran together into unreadable text, as did the subtitle delivery choices, and the problem got worse in languages with longer words. Each option now sits properly inside its own box at any window size.

---

## 0.4.5

This release hands you three things Arroxy used to decide for you: how downloaded files are named, how much of your connection a download uses, and whether every video in a playlist has to share one setting. Heads-up on the first — filenames may look different from previous versions, because templates that were previously refused now work and non-Latin titles keep much more of their length on macOS and Windows. Failures that used to happen silently now tell you.

## Highlights

### Filename Templates

- You can now decide how downloaded files are named. Build a template from `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}`, and `{playlist_index}` — for example `{uploader} - {title}` — and Arroxy names every download that way.
- Click a token to insert it, and see a live preview of the resulting filename before you save.
- Set one template globally, or override it for a single download profile, so an audio-only profile can name files differently from your video profiles.
- The file extension is always added for you, and long titles are still trimmed so paths stay valid on every platform.
- Tokens that don't apply simply disappear instead of leaving `NA` in the name — an audio download won't pick up a resolution, and a one-off video won't pick up a playlist number.
- Replaces the old "Add video ID to single filenames" switch, which is now just the `{id}` token.
- Heads-up: playlist "skip already downloaded" detection and `.m3u` playlist files both find your files by their video ID. If you remove `{id}` from your template, Arroxy tells you inline and turns those two features off rather than letting them quietly misbehave.
- Templates that used several tokens at once are no longer rejected. A template like `{title} {id} {uploader} {resolution} {playlist_title}` used to be refused as "too long" even though the names it produced were nowhere near any limit.
- Filenames are now measured the way your own system measures them. macOS and Windows count characters, Linux counts bytes — so a Japanese or Chinese title keeps roughly three times more of its length on macOS and Windows than it used to.
- Names that genuinely cannot fit are shortened instead of failing, and the video ID is never the part that gets cut, so playlist detection and `.m3u` files keep working.
- On Windows, Arroxy now accounts for the full path length when naming files, so downloading into a deeply nested folder no longer fails with an unhelpful error from the downloader.

### Download Connections

- Arroxy can now fetch several parts of a video at once, which noticeably speeds up large downloads on a fast connection. Type a number, or leave the field empty for a single connection.
- The field suggests 4 as a good starting point. Higher values raise the chance a site rate-limits you, so it is deliberately yours to choose rather than on by default.
- This control existed before but was only reachable by switching "Gentle downloads" to Custom and editing a grid of five fields — almost nobody found it. It is now a setting in its own right, and it applies whichever pacing preset you use.

### Downloads At Once

- You can now choose how many queued items download at the same time, instead of Arroxy always running one at a time. A long queue finishes considerably sooner.
- Changes apply immediately to a running queue — no restart, and nothing you have already started is interrupted. Lowering the limit simply stops new downloads from starting until there is room.
- "Pull it now" keeps working even when the queue is running at your full limit.

### Retry Failed Downloads

- Arroxy can now retry a failed download on its own, waiting a little longer before each attempt. Set how many times, or leave it empty to keep deciding by hand.
- When the failure happened after the transfer had started, a retry picks up from the partial file rather than starting over. A retry that was waiting when you quit is still waiting when you reopen Arroxy.
- Only failures worth retrying are retried — a dropped connection, a server hiccup, a rate limit. Downloads blocked by the site are never retried automatically, because repeatedly asking is what turns a soft block into a hard one. Videos that are unavailable, region-locked, or DRM-protected are left alone too, since another attempt cannot help.
- The queue row tells you a retry is coming, so a waiting download no longer looks like a dead one.

### Per-Item Download Profiles

- A playlist no longer has to download as one setting for everything. On the playlist step, "Assign profiles per item" opens a screen where you can give individual videos their own download profile — archive three talks at full quality and take the rest as MP3, in one pass.
- Because a profile already carries quality, subtitles, destination and the rest, this mode skips the Quality, SponsorBlock, Output and Save steps entirely rather than asking twice. Each video lands in its own profile's folder.
- Selecting is built for long playlists: click, Shift-click a range, ⌘/Ctrl-click to add one, or drag across rows. Filter by profile, select everything the filter shows, and pick a profile from the dropdown or right-click the selection.
- You can edit a profile without leaving the screen — change Podcast MP3 to 320k and every video already assigned to it updates.
- Videos can also be removed from the list outright instead of just unchecked, which matters when a playlist runs to hundreds of rows. Removal is undoable until you start the download.
- Nothing changes if you do not use it: a playlist you queue the usual way behaves exactly as before.

### Notifications

- Failures that used to happen silently now tell you. If your settings can't be saved, a folder can't be opened, or a chosen folder can't be used for a playlist, Arroxy shows a message instead of leaving you to guess.
- Messages appear in your language and follow your light or dark theme.

### Fixes

- Fixed resuming a paused download after restarting Arroxy. Previously, pausing a download, closing the app, reopening it, and pressing Resume did nothing at all — no error, no progress — and the only way forward was to cancel and add the link again.

---

## 0.4.4

This patch release adds Turkish across Arroxy's app and documentation, and keeps the localized README language metadata easier to maintain for future translations.

## Highlights

### Turkish Locale

- Added Turkish as a supported app locale, including system-language detection for `tr` and region tags like `tr-TR`.
- Added a full Turkish README generated from the localized docs source.
- Refreshed localized README navigation so Turkish appears consistently across every README language.

### README Language Metadata

- Derived the README language count and language-name list from the README locale registry so future locale additions do not leave stale numbers behind.
- Polished the Russian README language-count wording so dynamic counts avoid numeral-agreement errors.

---

## 0.4.3

This patch release adds Bahasa Indonesia across Arroxy's app and docs so more users can move through setup and downloads in their preferred language.

## Highlights

### Bahasa Indonesia Locale

- Added Bahasa Indonesia as a supported app locale, including runtime locale data, language detection wiring, and coverage for the supported-language registry.
- Added a full Bahasa Indonesia README generated from the localized docs source.
- Refreshed localized language lists across the README set so Bahasa Indonesia appears consistently wherever users choose documentation language.

---

## 0.4.2

This patch release smooths out macOS setup and installation, improves startup reliability on newer macOS versions, and keeps the release pipeline current.

## Highlights

### macOS Setup And Installer Polish

- Added a branded drag-to-Applications DMG layout so macOS installs feel clearer and more native.
- Expanded macOS setup docs around mise, pinned Node.js/Bun versions, shell activation, and first-run checkout commands.
- Added an installer preview command for checking the packaged macOS DMG before publishing.

### Startup Reliability

- Automatically applies the Chromium audio-service workaround on macOS 26 / Darwin 25+ to avoid Electron startup crash loops.
- Added an environment escape hatch for extra Chromium switches when diagnosing platform-specific Electron behavior.
- Let native macOS window controls own the traffic-light area while keeping the title centered.

### Release Reliability

- Updated GitHub Actions checkout usage across CI and release workflows.
- Added coverage for the DMG layout and macOS title-bar behavior so packaging polish stays guarded.

---

## 0.4.1

This patch release polishes the 0.4 line with a denser queue manager, clearer diagnostics, stronger checkout tooling, and refreshed user-facing docs.

## Highlights

### Queue Management

- Reworked the downloads drawer into a queue manager with table controls, artifact visibility, and clearer toolbar actions.
- Added selection-based queue actions and output-target move handling so completed files are easier to inspect and manage.
- Improved queue diagnostics, shutdown behavior, progress parsing, and resume lifecycle coverage.

### Workflow And Documentation Polish

- Refined playlist collection copy and the domain glossary so review and queue language stays consistent.
- Refreshed the README screenshots and localized feature copy for download profiles, bulk URLs, audio support, and advanced settings.
- Updated the in-app and browser-mock scenarios that exercise queue and release-note surfaces.

### Developer And Release Reliability

- Hardened checkout bootstrap, doctor, and dev-smoke workflows for fresh worktrees and CI validation.
- Tightened package publishing, dependency-audit scope, embedded-payload checks, and trusted publishing configuration.
- Added ADRs for pause/resume semantics, subtitle handling, and binary distribution decisions.

---

## 0.4.0

The 0.4.0 stable release brings together everything from the 0.4.0 beta line: a full download-profile system, smarter audio handling, a more reliable binary runtime, stronger download recovery, and a broad UI and localization pass.

## Highlights

### Faster Download Workflows

Arroxy now has a download-profile system that drives quick downloads, bulk runs, and playlist submissions from one place.

- The home screen ships with built-in profiles for best available, 4K, QHD, 1080p, 720p, 480p, Smart TV MP4 variants, and audio-only downloads.
- Profiles can carry media targets, subtitles, SponsorBlock settings, embed settings, output folder rules, and per-profile subfolders. Built-in profiles can be customized and your own profiles can be added.
- Quick Download shows probe/queue progress, supports cancellation and retry, can retry with configured cookies, and reports partial success for bulk runs.
- URL intent detection distinguishes single videos, playlists, channels, search URLs, and mixed links before choosing whether to probe, prompt, or open review, and playlist-cap handling opens review when the whole playlist cannot be queued safely.
- Bulk URL parsing cleans links, filters obvious non-media files, deduplicates entries, and previews accepted/rejected rows for large paste sessions.

### Smarter Audio Selection

Audio handling now favors the source's own tracks and surfaces clearer quality information.

- A new preference chooses between compatible audio and surround-first native audio, and it stays consistent from probing through presets, profiles, playlists, and quick downloads.
- Arroxy now prefers the source default or original audio track when available, and keeps Dolby/DRC tracks out of the default compatible path unless you opt into the surround preference.
- The audio format picker shows language, quality tier (high/medium/low badges with tooltips), and format details so multi-track videos are easier to choose from.

### Release Notes In The App

- A What's New dialog reads the current version's changelog after an update and remembers the last version it showed, so release details no longer live only on GitHub.

### Runtime And Binary Reliability

The app now relies on signed runtime metadata and Electron's bundled Node runtime instead of resolving "latest" binaries at runtime.

- yt-dlp JavaScript challenges run through Electron's bundled Node runtime, so Arroxy no longer needs Deno or a system Node install for extractor JavaScript.
- Runtime-managed binaries resolve from signed manifest entries verified with a bundled Ed25519 key, cached as last-known-good and backed by a bundled fallback index, served from a dedicated runtime-binaries release feed.
- Materialization verifies size and SHA-256, uses content-addressed cache directories, guards ZIP extraction, and probes only after a real executable exists.
- Packaged runtime smoke checks verify managed yt-dlp, Electron Node, and bundled extractor JS before normal startup, and dependency diagnostics carry clearer attempt/failure records for yt-dlp, ffmpeg, and ffprobe.

### Download Reliability And Recovery

- Media retries can preserve temp data for resumable network, rate-limit, chunk-transfer, disk-space, and postprocess failures when usable media evidence exists, and retry/restart paths validate or clean up preserved temp directories.
- Progress parsing and HLS normalization no longer show misleading completed progress before a queue item is actually done.
- yt-dlp errors flow through a published error taxonomy with localized guidance, including first-class DRM-protected, login-required, and missing-dependency failures.

### UI, Feedback, And Localization

- The home surface, profile picker, profile editor, queue drawer, review step, wizard navigation, warmup splash, and footer were refined for denser everyday use.
- An adaptive backdrop adds dark/light scenes with WebGL, Canvas2D, and CSS fallbacks, plus a theme-matched native startup background to reduce launch flash.
- Feedback opens through Tally with a hidden state snapshot and, after explicit submission, can upload a gzipped, redacted tail of the log to the feedback service. Discord community links were added to the README, footer, and About dialog.
- App copy now flows through a gettext-backed translation workflow with generated runtime locale JSON across all supported languages.

### Tooling And Tests

- Formatting and linting moved to Biome and Oxlint, and `bun run check` now gates formatting, linting, tooling contract, typecheck, dependency hygiene, dead-code, circular imports, and package publish checks.
- Fixture Product E2E now owns real Electron/IPC/yt-dlp workflows against deterministic fixture media, separating acceptance tests from cheaper unit/renderer checks.

---

## 0.4.0-beta.5

This beta adds user-facing release notes inside Arroxy, improves native audio selection, and tightens packaged smoke coverage before the 0.4.0 stable cut.

## Highlights

### Release Notes In The App

Arroxy now surfaces the relevant changelog after an update instead of leaving release details only on GitHub.

- Added a What's New dialog that reads the current version's changelog section and remembers the last version shown.
- Added release-note copy to the app locales and browser-mock scenarios so the update path is easier to review.

### Native Audio Controls

Audio selection now has a clearer app-level preference for native audio tracks.

- Added a setting for compatible audio versus surround-first native audio selection.
- Improved preset, profile, playlist, and quick-download paths so native audio choices stay consistent from probing through queue submission.
- Kept Dolby and DRC tracks out of the default compatible path unless the user chooses the surround preference.

### Release Smoke Reliability

The release and packaged smoke paths received another hardening pass.

- Packaged runtime smoke now exercises the live probe mode used by release validation.
- Live probe smoke tolerates known runner-side bot-wall responses while still catching real app/runtime regressions.
- Runtime binary smoke guidance was expanded for future release troubleshooting.

---

## 0.4.0-beta.4

This beta keeps the 0.4.0 startup presentation work but backs out the hidden-first window path after follow-up testing showed it could delay initial display.

## Highlights

### Startup Presentation Follow-Up

The main window still uses a theme-aware native background during launch, but it no longer delays the initial window show while waiting for `ready-to-show`.

- Removed the hidden-first BrowserWindow startup path introduced in `0.4.0-beta.3`.
- Kept the dark/light native background color match so startup no longer flashes default white before the renderer paints.

---

## 0.4.0-beta.3

This beta moves Arroxy's runtime manifest channel out of the app release feed and fixes startup/backdrop regressions found during the 0.4.0 beta line.

## Highlights

### Dedicated Runtime Manifest Releases

Runtime-managed binary metadata now comes from the dedicated `arroxy-runtime-binaries` release repo instead of the main app repo.

- New builds fetch `runtime-index-v1.json` and `runtime-index-v1.sig` through `antonio-orionus/arroxy-runtime-binaries/releases/latest/download`.
- The app still verifies the manifest offline with Arroxy's bundled Ed25519 public key before trusting it.
- The old main-repo runtime manifest publishing workflow is disabled; this repo now keeps only a generator/smoke validation job.
- The main Arroxy release page stays focused on installers, updater metadata, checksums, and app release notes.

### Startup And Backdrop Polish

The renderer startup surface and animated backdrop received targeted fixes.

- The native BrowserWindow background is matched to the selected or system theme before the renderer paints, reducing the launch-time white flash.
- The window is initially hidden and shown on `ready-to-show` in this beta so the first visible frame is less abrupt.
- The WebGL backdrop paints one initial frame even while the window is not focused, then starts the animation loop on focus.
- If the WebGL context is lost, the backdrop falls back to Canvas2D/static rendering instead of leaving the background blank or stuck in the wrong scene state.

---

## 0.4.0-beta.2

This beta hardens the release/runtime automation introduced in `0.4.0-beta.1`.

## Highlights

### Runtime Manifest Release Hardening

The runtime manifest path was tightened before publishing more 0.4.0 beta builds.

- The runtime manifest signing key was rotated and the app's bundled Ed25519 public key was updated.
- The manifest workflow recreates the fixed runtime manifest release through a draft-first publish flow instead of mutating release assets in place.
- Runtime manifest validation can smoke only entries for the current host platform while still using the same manifest generator.
- Stable release-asset checks now cover the runtime manifest release behavior so future release edits do not silently reintroduce clobbered mutable assets.

### Release Smoke Reliability

The release pipeline received small fixes for prerelease reliability.

- Linux release smoke installs FUSE so AppImage smoke checks can run in GitHub Actions.
- The live YouTube canary is skipped for prerelease tags, keeping beta releases from being blocked by external site drift.
- GitHub artifact actions used by release and runtime workflows were moved to Node 24-compatible pinned revisions.

---

## 0.4.0-beta.1

This beta release previews the next major Arroxy workflow, runtime, support, and test-architecture changes before the stable 0.4.0 release.

## Highlights

### Faster Download Workflows

Arroxy now has a broader download-profile system that drives quick downloads, bulk runs, and playlist submissions.

- The home screen now ships with built-in profiles for best available, 4K, QHD, 1080p, 720p, 480p, Smart TV MP4 variants, and audio-only downloads.
- Download profiles can carry media targets, subtitles, SponsorBlock settings, embed settings, output folder rules, and per-profile subfolders.
- Built-in profiles can be customized, custom profiles can be added, and the active profile is shared by home-screen quick actions and bulk quick downloads.
- Quick Download now shows probe/queue progress, supports cancellation and retry, can retry with configured cookies, and reports partial success for bulk runs.
- Playlist-cap handling now opens review when Arroxy cannot safely queue the whole playlist automatically.
- URL intent detection distinguishes obvious single videos, playlists, channels, search URLs, mixed video-plus-playlist URLs, and unknown URLs before choosing whether to probe, prompt, or open review.
- Bulk URL parsing now cleans links, filters obvious non-media files, deduplicates entries, previews accepted/rejected rows, and scales the preview for large paste sessions.
- Queue submission keeps playlist title, selected items, output folder, M3U manifest data, and filename templates aligned across manual wizard submissions and active-profile submissions.

### Runtime And Binary Reliability

The app now leans on signed runtime metadata, stronger dependency diagnostics, and Electron's bundled Node runtime instead of resolving "latest" binaries at runtime.

- yt-dlp JavaScript challenges run through Electron's bundled Node runtime with `ELECTRON_RUN_AS_NODE=1`, so Arroxy no longer depends on Deno or a system Node install for extractor JavaScript.
- Runtime-managed binaries are resolved from signed manifest entries, verified with bundled Ed25519 trust, cached as last-known-good, and backed by a bundled fallback index.
- Runtime binary materialization now verifies size/SHA-256, uses content-addressed cache directories, guards ZIP extraction, records install metadata, and probes only after a real executable path exists.
- Packaged runtime smoke checks verify managed yt-dlp, Electron Node, and bundled EJS before normal app startup; release and cold-start workflows run those checks against installed, portable, macOS, and Linux artifacts.
- Dependency diagnostics now carry clearer attempt/failure records and required-dependency policy for yt-dlp, ffmpeg, and ffprobe.
- Windows cold-start diagnostics and a Windows yt-dlp probe soak workflow were added to catch platform-specific binary failures earlier.

### Download Reliability And Recovery

Queue and yt-dlp error handling became more resilient during interrupted or degraded downloads.

- Media retries can preserve temp data for resumable network, rate-limit, chunk-transfer, disk-space, and postprocess failures when usable media evidence exists.
- Retry and restart paths validate preserved temp directories before reusing them and clean up stale temp data when preservation is not safe.
- Progress parsing and display normalization better handle bootstrap and HLS progress output without showing misleading completed progress before the queue item is actually done.
- yt-dlp stderr classification now uses the publishable `ytdlp-errors` taxonomy, including first-class DRM-protected, login-required, and missing-dependency failures.
- Probe and download errors now flow through localized `kind`/`raw` payloads, allowing cookies, bot-wall, dependency, and unsupported-URL guidance to be more specific.

### UI, Feedback, And Localization

The renderer received a broad polish pass and a more complete support/localization pipeline.

- The home surface, profile picker, profile editor, queue drawer, review step, wizard navigation, warmup splash, and footer controls were refined for denser everyday use.
- The adaptive backdrop added dark/light scenes with WebGL, Canvas2D, and CSS fallback paths, plus GPU/runtime switches for diagnosing launch and driver issues.
- The review step now projects user-facing summaries and conflict warnings from the same normalized media/subtitle/embed decisions used for queue submission.
- Feedback opens through Tally with a hidden state snapshot and, after explicit submission, can upload a gzipped, redacted tail of `main.log` to the feedback Worker.
- Discord community links were added to the README, footer, and About dialog.
- App copy now flows through a gettext-backed PO/POT workflow and generated runtime locale JSON instead of hand-maintained TypeScript locale modules.

### Tooling And Test Coverage

The project moved more of its quality gate into reproducible tooling and separated acceptance-test ownership from cheaper unit/renderer checks.

- Formatting and linting moved to Biome and Oxlint.
- `bun run check` now gates formatting, linting, tooling contract checks, typecheck, package metadata, dependency hygiene, dead-code checks, circular imports, and package publish checks.
- Fixture Product E2E now owns real Electron/IPC/yt-dlp workflows against deterministic fixture media, including clipboard intake, metadata probing, queueing, downloads, and failure recovery.
- Browser-mock scenario coverage was reorganized for faster UI-state review without pretending to prove real download workflows.
- Publishable `yt-dlp-bridge` and `ytdlp-errors` packages were added with package metadata, READMEs, tests, option catalogs, redaction, structured errors, and release workflows.
- The project now tracks agent skill recovery through `skills-lock.json` instead of committing large restored third-party skill sources.

---

## 0.3.13

This patch release switches Arroxy's release integrity model to GitHub immutable releases.

## Highlights

### Verified Release Assets

Arroxy now relies on GitHub's immutable release verification for published release assets.

- GitHub Release assets are locked after publish and get GitHub's release-integrity verification path.
- The release workflow still publishes stable binary filenames, updater metadata, package-manager inputs, and `SHA256SUMS`.
- The workflow no longer generates separate build-provenance attestations for release assets, because those are redundant for GitHub's release asset verification UI.

### Release Workflow Cleanup

The publish job is smaller and easier to reason about.

- Removed the extra `actions/attest` step and the follow-up `gh attestation verify` polling.
- Removed the attestation-specific workflow permissions from the release job.
- Kept draft-first publishing, so all asset mutation still happens before immutable release publication.

---

## 0.3.12

This patch release refreshes Arroxy's release packaging so download links can stay stable from one version to the next.

## Highlights

### Stable Download Links

Release assets now use predictable platform-prefixed filenames, so the website and README can link directly to the latest Windows, macOS, and Linux binaries without needing an update for every release.

- Windows builds publish `Arroxy-win-x64-Setup.exe` and `Arroxy-win-x64-Portable.exe`.
- macOS builds publish separate `Arroxy-mac-arm64.dmg` and `Arroxy-mac-x64.dmg` files.
- Linux builds publish `Arroxy-linux-x64.AppImage`, `Arroxy-linux-x64.flatpak`, and `Arroxy-linux-x64.tar.gz`.
- README and GitHub Release notes now use direct Shields download badges for the main binaries.

### Release Automation Compatibility

The release pipeline, package-manager updates, checksums, and artifact attestations now use the stable asset names end to end.

- Electron auto-update metadata still uses `latest.yml`, `latest-mac.yml`, and `latest-linux.yml`.
- Differential updates remain enabled.
- The release workflow normalizes electron-builder's AppImage `x86_64` output back to the public `x64` filename and rewrites `latest-linux.yml` before checksums.
- Scoop, Homebrew Cask, Winget, Flatpak validation, and Windows installer smoke tests all resolve the new asset names.

---

## 0.3.10

This release makes Arroxy faster for everyday grabbing, better for playlist triage, and more helpful when yt-dlp needs repair.

## Highlights

### Faster Ways To Start Downloads

Quick downloads are now easier to launch when you already know what you want.

- A new clipboard quick-download flow can pick up a copied URL and move it toward download without forcing you through the full wizard every time.
- Bulk URL downloads let you paste multiple links, hydrate their metadata, and send them into the queue together.
- Startup clipboard prompts are now gated more carefully, so Arroxy avoids interrupting launch unless there is a real action to confirm.

### Playlist Scope Filters

Large playlist and channel runs now have better controls for deciding what should be probed and queued.

- Playlist scope filters let you narrow work before the item list is built.
- The playlist picker keeps scope, limit, and retry state aligned when reloading results.
- Mock scenarios and regression coverage were expanded around playlist limits, scope changes, and bulk submission paths.

### yt-dlp Repair From Package Managers

When a local yt-dlp install is stale or broken, Arroxy can now guide repair through supported package-manager paths.

- The repair panel can surface package-manager repair actions for Homebrew and Winget installs.
- Binary diagnostics record the repair path more clearly, making dependency issues easier to understand.
- Startup repair and dependency checks have broader automated coverage.

### Release Pipeline Hardening

The release workflow now publishes with stronger provenance and safer automation.

- Release assets are covered by GitHub artifact attestations.
- GitHub Actions workflows were hardened and the release runbook was refreshed.
- The README feature roadmap was updated across localized copies.

---

## 0.3.9

This release fixes the Intel Mac packaging issue and makes SponsorBlock outages non-fatal during downloads.

## Highlights

### Intel Mac Builds Include FFmpeg Again

The previous Intel macOS DMG could open, but it did not include the embedded `ffmpeg` and `ffprobe` binaries. Arroxy would then show `ARX-004` and ask the user to pick working copies manually.

- Intel macOS packaging now resolves the requested build architecture correctly instead of falling back to the Apple Silicon runner architecture.
- The build now fails early if either embedded FFmpeg binary is missing, so a broken DMG cannot be published silently.
- The packaging logic has targeted test coverage for electron-builder's string and numeric architecture values.

### SponsorBlock Outages No Longer Stop Downloads

When SponsorBlock is enabled, a temporary SponsorBlock API outage should not make the whole download fail.

- Arroxy now treats SponsorBlock lookup failures as a skipped SponsorBlock step and continues the download.
- The queue still records the skip state, so the download status remains honest without blocking the file.

---

## 0.3.8

This is a small stability release for Intel Mac users.

## Highlights

### Intel Mac Builds Include FFmpeg Again

The previous Intel macOS DMG could open, but it did not include the embedded `ffmpeg` and `ffprobe` binaries. Arroxy would then show `ARX-004` and ask the user to pick working copies manually.

- Intel macOS packaging now resolves the requested build architecture correctly instead of falling back to the Apple Silicon runner architecture.
- The build now fails early if either embedded FFmpeg binary is missing, so a broken DMG cannot be published silently.
- The packaging logic has targeted test coverage for electron-builder's string and numeric architecture values.

---

## 0.3.7

This release turns playlist handling into a much more deliberate workflow: pick the right batch format, scan only as much as you need, skip files you already have, and keep the output folder organized as the playlist grows.

## Highlights

### Playlist Quality Is Now a Real Picker
Playlist downloads no longer ask you to choose from a short list of fixed presets. The batch quality step now lets you choose the media type, quality ceiling, codec preference, audio format, and bitrate.

- Video playlists can use best available codecs or prefer MP4 / H.264 for broader player compatibility.
- Audio playlists can stay native or convert to MP3, M4A, or Opus with selectable bitrates.
- Each playlist item resolves the chosen tier independently, so mixed-resolution playlists download cleanly instead of failing on one awkward entry.
- Mixed YouTube links (`video + playlist`) now explain the choice more clearly: download only the clicked video or open the playlist picker.

### Playlist Sync Keeps Folders Tidy
Arroxy can now compare a probed playlist against the local destination folder before queueing work.

- Playlist files use stable names with the video ID included, which makes repeat runs and title changes much less messy.
- The playlist picker scans the output folder automatically and marks videos that are already downloaded.
- "Apply sync" deselects already-downloaded videos so only new items get queued.
- You can change the playlist folder from the sync alert and Arroxy keeps the output settings aligned with that folder.
- Playlist downloads can generate an `.m3u` file in playlist order. The file is rebuilt as items finish, so partial or resumed playlist runs still leave a useful playlist behind.

### Scan Limits And Gentle Downloading
Large playlists, channels, and search results now have explicit controls instead of hidden limits.

- The URL step has a playlist scan limit picker with presets and custom values from 1 to 5000 items.
- If a playlist is capped by the current scan limit, Arroxy shows an alert right in the item picker and lets you raise the limit and re-scan.
- Network pacing presets now live in Advanced settings: Off, Balanced, Careful, and Custom.
- Balanced is the new default: it adds small request/media/subtitle waits and uses one fragment connection to reduce host pressure on heavy playlist runs.
- The queue's old fixed 3-second pause between jobs is now shorter, so normal queues feel less sluggish while pacing is handled inside yt-dlp where it matters.

### More Helpful Download Feedback
Several failure and progress cases should now be less confusing.

- DRM-protected videos and login-required videos now get clearer error messages.
- SponsorBlock lookup and retry states are shown in the queue instead of looking like a stalled download.
- HLS fragment bootstrap lines no longer jump running jobs to 100% before the file is actually done.
- Resuming a paused job whose temp folder disappeared now restarts cleanly instead of trying to reuse a missing path.
- Cancelling during the subtitle phase now exits as a cancellation instead of falling through as a subtitle failure.

### Smaller Workflow Improvements
- One-off downloads can include the video ID in the filename by default, with a toggle in Advanced settings.
- URL cleanup now uses the maintained `@url-sanitize` ClearURLs catalog and still strips pasted whitespace from wrapped links.
- Cookies setup links are easier to reach from Advanced settings.
- Output sidecar options now include `.m3u` playlist generation alongside description and thumbnail files.

### Maintenance
- Error classification now uses the shared `ytdlp-errors` package instead of a local classifier.
- Probe errors now flow through a discriminated union, which makes failure handling easier to reason about.
- The browser-mock dev mode gained a scenario gallery, test knobs, and browser coverage for playlist states.
- CI and dependency maintenance landed across Bun, Node, Vitest matcher types, setup-node, setup-bun, CodeRabbit, and release notifications.

---

## 0.3.7-beta.1

This beta makes playlist downloads feel more intentional: better presets, cleaner folders, and fewer surprises when Arroxy has to slow itself down for a host.

## Highlights

### Playlist Presets Are More Useful
Playlist preset downloads now do a better job matching the output you asked for.

- Presets apply during playlist probing without wiping out retry state.
- Mixed playlist flows keep format choices and output preferences lined up more reliably.
- Playlist item handling has been tightened so large queues behave more predictably from probe through submit.

### Cleaner Playlist Output
Playlist downloads now have better tools for keeping a folder organized.

- Stable playlist filenames make repeated runs less messy.
- Sync-with-folder can skip items that already exist locally.
- M3U playlist generation adds a lightweight way to preserve playlist order for external players.

### Network Pacing Controls
Arroxy now has configurable network pacing for playlist-heavy workflows.

- The default pacing preset is now balanced.
- Inter-job sleep is shorter, so safe pacing feels less sluggish.
- Playlist probe limits are configurable for users who need to trade speed against host pressure.

### Maintenance
- Error classification now uses the shared `ytdlp-errors` package instead of a local classifier.
- Probe errors now flow through a discriminated union, which makes failure handling easier to reason about.
- CI and dependency maintenance landed across Bun, Node, Vitest matcher types, and repository review tooling.

---

## 0.3.6

This release is all about big playlists. If you ever pasted a 290-video URL and watched Arroxy slowly chew through it while the UI lagged behind, this one is for you.

## Highlights

### Large playlists no longer drag the UI

Queueing hundreds of items used to push the renderer multiple seconds behind the actual download state. With a 290-video playlist, the drawer would still show "downloading Ep. 4" while yt-dlp was already on Ep. 7.

- Progress events from yt-dlp are now coalesced on the main side at 10 Hz per job. Transitions (started, completed, merging, failed) still fire immediately — only the lossy "downloading X.X%" stream is throttled.
- Queue updates arriving in the renderer are now batched per animation frame. Updates, additions, and removals coming in the same frame merge into a single state mutation and one React commit.
- The queue drawer is now virtualized. Only the rows in view (plus a small over-scroll buffer) mount in the DOM. Drawer scroll stays smooth at any queue size.

### "Cancel all" + "Clear" go from minutes to a blink

Cancelling and clearing a 290-item queue used to take **a full minute** in the worst case. Each item triggered its own disk write and its own re-render.

- Bulk cancel and bulk clear now persist the queue file once at the end of the sweep, not per item.
- The renderer applies all the removals in one pass per animation frame.

End-to-end, clearing a 290-item queue is now under a second.

### Full YouTube playlist enumeration

Probing a YouTube playlist now returns **all** entries (up to the configured cap), not the first 100.

- We were sending a `visitor_data` token alongside the YouTube tab extractor probe, which silently capped tab pagination at one innertube page (100 entries) regardless of `--playlist-end`. Symptom: "can't fetch more than 100 videos."
- Probes no longer need PoT/visitor_data — they only fetch metadata, not streaming URLs — so we skip that path entirely for probes. Non-web clients (android/ios) provide the format JSON without it.

### Smarter URL paste

URLs pasted from word-wrapped terminals, chat bubbles, or PDF viewers often arrive with a newline or stray space mid-link. Arroxy now cleans those up before parsing.

- A line break injected mid-playlist-ID no longer turns into `%20` and mangles the URL.
- Tabs, CRLFs, and literal spaces all get stripped at paste time.
- Already-encoded `%20` sequences (legitimately part of a path) are left alone.

### No more accidental double-submit

Submitting a 290-entry playlist takes a perceptible moment while Arroxy builds and ships the queue items. Mash the button twice and you used to end up with duplicates.

- The "Add to queue" and "Pull it" buttons are now disabled while the submission is in flight.
- A guard at the function level catches double-fires from keyboard shortcuts too.

### Smaller stuff
- Error messages in the queue drawer now stay on a single line and reveal the full text in a tooltip on hover. Keeps the queue density tight even when something blows up verbosely.

### Maintenance
- Internal IPC seam now has a single chokepoint for the bulk-write guard, so future bulk operations (think: future import-from-file) get the perf optimization for free.
- Dropped the shadcn `ScrollArea` wrapper specifically for the queue drawer — the virtualizer needed direct access to the scroll element. Other ScrollArea usages elsewhere in the app are unchanged.

---

## 0.3.5

This release tightens resume reliability for tricky sites and adds the speed-limit control a lot of you have asked for.

## Highlights

### Per-Job Speed Limits
You can now cap how fast Arroxy downloads, so background jobs do not steal your whole connection.

- New rate-limit picker in the wizard and in the queue drawer, with presets like `500K`, `2M`, `5M` plus a custom value.
- Limits are validated before they are sent to yt-dlp, so typos do not silently get ignored.
- A small inline hint explains that an in-flight download needs Pause + Resume to pick up a new limit.

### More Trustworthy Resume
Big or fiddly downloads now survive interruptions a lot better.

- Resumed downloads reuse cached metadata from the original spawn instead of re-extracting on every retry. Sites with short-lived signed URLs, shifting HLS/DASH format IDs, or session-bound cookies (PornHub being a notable one) no longer trip the "Requested format is not available" error on resume.
- The fix is invisible: Arroxy writes a small info file into the preserved temp folder on the first run, and the next spawn picks it up automatically.

### Smoother Queue
A big rewrite under the hood of the download queue makes state transitions cleaner and progress reporting more accurate.

- The ETA (estimated time left) shown on active downloads is finally honest — it now reflects current throughput instead of an averaged-since-start figure.
- Internal telemetry around the queue was tightened so error categories and lifecycle events line up consistently.
- Small visual polish on the queue drawer, queue items, and the confirm + URL-input wizard steps.

### Security
- Closed two high-severity advisories pulled in transitively through `ajv` by overriding `fast-uri` to a patched version. No user action needed.

### Maintenance
- Dependency refresh across the board: Electron, electron-builder, i18next, Tailwind Merge, Playwright, Vite, Vitest, plus a sweep of GitHub Actions versions.
- The marketing site moved to its own repository ([`antonio-orionus/arroxy-web`](https://github.com/antonio-orionus/arroxy-web)); the app repo is leaner now.

---

## 0.3.5-beta.1

This beta tightens resume reliability for tricky sites and adds the speed-limit control a lot of you have asked for.

## Highlights

### Per-Job Speed Limits
You can now cap how fast Arroxy downloads, so background jobs do not steal your whole connection.

- New rate-limit picker in the wizard and in the queue drawer, with presets like `500K`, `2M`, `5M` plus a custom value.
- Limits are validated before they are sent to yt-dlp, so typos do not silently get ignored.
- A small inline hint explains that an in-flight download needs Pause + Resume to pick up a new limit.

### More Trustworthy Resume
Big or fiddly downloads now survive interruptions a lot better.

- Resumed downloads reuse cached metadata from the original spawn instead of re-extracting on every retry. Sites with short-lived signed URLs, shifting HLS/DASH format IDs, or session-bound cookies (PornHub being a notable one) no longer trip the "Requested format is not available" error on resume.
- The fix is invisible: Arroxy writes a small info file into the preserved temp folder on the first run, and the next spawn picks it up automatically.

### Smoother Queue
A big rewrite under the hood of the download queue makes state transitions cleaner and progress reporting more accurate.

- The ETA (estimated time left) shown on active downloads is finally honest — it now reflects current throughput instead of an averaged-since-start figure.
- Internal telemetry around the queue was tightened so error categories and lifecycle events line up consistently.
- Small visual polish on the queue drawer, queue items, and the confirm + URL-input wizard steps.

### Security
- Closed two high-severity advisories pulled in transitively through `ajv` by overriding `fast-uri` to a patched version. No user action needed.

### Maintenance
- Dependency refresh across the board: Electron, electron-builder, i18next, Tailwind Merge, Playwright, Vite, Vitest, plus a sweep of GitHub Actions versions.
- The marketing site moved to its own repository ([`antonio-orionus/arroxy-web`](https://github.com/antonio-orionus/arroxy-web)); the app repo is leaner now.

---

## 0.3.4

Arroxy 0.3.4 is the release where Arroxy grows up from a YouTube-focused downloader into a much wider, smoother tool for everyday saves. Paste a link, pick what you want, and let the queue do the boring parts.

## Highlights

### YouTube + 2000+ Sites
Arroxy now works with the wider yt-dlp ecosystem, not just YouTube. That means links from Vimeo, Twitch, Reddit, SoundCloud, Bandcamp, and thousands of other supported sites can go through the same friendly wizard.

- Paste any supported video or audio link, including links picked up by clipboard watch.
- Music-first sites open in the right flow automatically, so you do not have to fight empty video options.
- Built-in-audio formats now default to "Keep as-is" instead of accidentally adding duplicate audio.
- YouTube channel links, playlists, Shorts, Music, and mixed video/playlist URLs are handled more deliberately.
- Tracker-heavy URLs are cleaned before probing, so shared links are less messy.

### Faster Wizard Flow
Getting to the download button takes fewer clicks now.

- New "Skip to confirm" button lets you jump straight from format selection to the final screen using your saved preferences.
- Subtitle selection is easier to skip when you just want the video.
- Saved YouTube preferences stay scoped to YouTube, so choices from one site do not leak into another.
- The app is clearer when a site requires cookies, sign-in, or a different link.

### Better Queue Control
The queue is easier to pause, resume, and trust.

- Pause all active downloads from the drawer header.
- Resume paused downloads directly from the drawer when you are ready.
- Quit dialog now offers "Pause Downloads & Quit," so closing the app does not have to mean throwing progress away.
- Paused downloads keep more resume context, making interrupted video downloads more dependable.
- Queue state now lives in the main process, which makes progress, pause, cancel, retry, and restart behavior steadier.

### More Reliable Downloads
A lot of this release is about making failure less mysterious.

- Large or unstable downloads get stronger retry behavior for broken chunks and interrupted streams.
- Low disk space is detected and explained before it turns into a confusing failure.
- Error messages are clearer for unsupported URLs, rate limits, geo blocks, network failures, sign-in/cookie problems, post-processing failures, and yt-dlp parser drift.
- Non-YouTube sites skip YouTube-only token work, which keeps probes lighter and less noisy.

### Platform Fixes
This release also tightens install and startup behavior across desktop platforms.

- macOS packaging was hardened, especially around Apple Silicon builds and bundled media tools.
- Windows startup and packaged-build behavior got more resilient, with extra checks for cold-start failures.
- Release automation now catches more broken builds before they reach users.

### Nice New Touches
- New About dialog with quick links and license details.
- New Share dialog, because Arroxy is free and open-source and a little easier to pass along now.
- Small UI polish across the drawer, wizard, update banner, dialogs, and startup flow.
