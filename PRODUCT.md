# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Electron desktop app (Windows, macOS, Linux) whose UI is a web renderer with its own title bar. Minimum window 720×680, default 900×760; widths below 640px exist only in browser-mock and tests.

## Users

People who want video, audio, music, playlists, channels, podcasts, or subtitles from YouTube and 2000+ other sites saved as local files. The range runs from casual users (one song as MP3, one video for offline viewing) to power users (4K HDR, surround/Dolby tracks, multi-language audio, SponsorBlock, subtitle modes, channel archives, playlist sync). Most are non-technical and would never run `yt-dlp` in a terminal; Arroxy is why they don't have to. They use it on their own desktop, with no account and no usage limits. The job: copy or paste a link (or a messy list of them), get the right file in the right folder, without ads, bloat, or guesswork.

## Product Purpose

Arroxy is a free, MIT-licensed desktop GUI around `yt-dlp` + `ffmpeg`. It makes the most capable downloader available usable by people who would never touch a shell, without dumbing it down for those who would. Success: a first-time user pastes a link and gets a correct file with zero configuration; a returning user pulls with their saved profile in one action, or from any app via the global hotkey; a power user reaches every format, audio, subtitle, and playlist control without fighting the UI. Everything runs on the user's machine. The marketing site lives in a separate repo (`arroxy-web`); this product is the app.

## Positioning

The one free, open-source, local-only downloader that is friendly enough for a non-technical user and deep enough for an archivist: yt-dlp's full capability behind a calm UI, with no premium tier, no usage caps, no ads, and no account required. Downloads go straight from the source to the user's disk; nothing is routed through a third-party server. The yt-dlp binary updates itself on launch, so site breakages get fixed without waiting for an app release.

## Operating Context

- **Quick Download is the home and the primary path.** Paste a URL and pull it immediately with the active download profile. Design decisions optimize this path first.
- **Background capture.** The global hotkey (`Ctrl+Shift+D` / `Cmd+Shift+D`, rebindable, on by default) queues the copied link with the active profile without opening the window; a system notification confirms it. Tray mode keeps downloads running after the window closes. Clipboard watch can fill the URL when the app regains focus.
- **Depth paths.** Guided single download (the wizard: probe → choose format → choose destination → confirm), playlist/channel picker with per-item profiles, bulk URL paste with auto-dedupe, and subtitles-only batches.
- **One queue.** Every entry point lands in a single queue with progress, pause/resume, cancel, retry, priority, parallel downloads, and automatic retry. The queue persists across restarts.
- **Reusable download profiles** carry format, quality, output, and filename-template choices.
- Distribution: Winget, Scoop, Homebrew Cask, Flatpak, AppImage, tar.gz, and direct download (NSIS installer, portable `.exe`, DMGs). Unsigned macOS and Windows builds mean first-launch OS warnings are part of the real onboarding.

## Capabilities and Constraints

- Video up to 2160p, high frame rate and HDR preserved; audio-only as MP3, M4A/AAC, Opus, or WAV; surround/Dolby and multi-language audio track selection; quick presets (Best quality, Balanced, Small file).
- Subtitles in SRT, VTT, or ASS (manual or auto-generated) as sidecar files, embedded in `.mkv`, or in a `Subtitles/` subfolder. Subtitle failure is soft: the video is kept and the job completes.
- SponsorBlock skip or chapter-mark; embedded metadata, thumbnail, and chapters; playlist sync against a local folder with an `.m3u` file; bandwidth caps, request pacing presets, filename templates; URL cleaning that strips tracking parameters.
- ffmpeg/ffprobe are bundled; yt-dlp is fetched and updated at runtime.
- Interface languages: the list in `SUPPORTED_LANGS` (`src/shared/schemas.ts`), including RTL scripts. Localized strings run 1.5–2× longer than English. Never hardcode the count.
- **Telemetry:** anonymous, aggregate telemetry via OpenPanel is **on by default and can be turned off in Settings**. It covers failures, crashes, feedback, OS, and app version only: no URLs, titles, file paths, account data, or fingerprinting, and the per-install ID is random. The UI must describe this honestly and make opting out easy to find.
- **Share prompts** (dialog, title-bar and footer entry points, a passive banner after high-value downloads) are allowed but must stay passive and dismissible, never nagging or blocking.
- **Planned: Explore (in-app browser).** A draft spec (`dev-docs/in-app-browser-spec.md`) adds an in-app browser whose signed-in session supplies cookies to yt-dlp. Signing in stays optional and local: using Arroxy without logging in remains the default promise. Not shipped yet.
- Known gap, deliberately left: Linux tar.gz installs never see the in-app update banner.

## Brand Commitments

- **Name and mascot.** Arroxy, with the mascot as app icon (`src/renderer/src/assets/App-icon-HQ.png`).
- **Voice.** Friendly, playful, approachable, plain-spoken, never corporate. Action labels sound like a person talking ("Pull it! ↓", "Fetch formats →"), not "Submit" or "Execute". The playfulness never costs clarity or trust. Underneath is quiet competence: bot protection, format negotiation, and codec coherence are handled so well the user never sees them. Emotional goals: confidence ("this just works"), relief ("I didn't need the terminal"), and a little delight.
- **Promise.** "No ads, no bloat, no upsells." No account and no usage caps.
- **Anti-references.**
  - *Sketchy downloader sites and freeware:* ad-choked, fake "Download" buttons, malware-adjacent, upsell-laden. Arroxy must read as clean and trustworthy, never like the thing it replaces.
  - *Raw CLI / yt-dlp flag soup:* the capability is there, the intimidation is not.
  - *Generic SaaS dashboard:* this is a focused desktop tool, not a dashboard.
  - *Bloated legacy media suites:* not heavy, not stacked with modals, not a cluttered converter UI.

## Evidence on Hand

- Product screenshots and a demo GIF in `build/` (`Main-screenshot.png`, `Download-profiles-screenshot.png`, `Per-item-playlist-profiles-screenshot.png`, `Global-hotkey.png` / `Global-hotkey-dark.png`, `Bulk-urls-mode-screenshot.png`, `Downloading-in-parallel-screenshot.png`, `Subtitles-screenshot.png`, `Multi-lang-audio-support-screenshot.png`, `Dolby-audio-support-screenshot.png`, `demo.gif`, and others).
- The README's "Why Arroxy" comparison against 4K Video Downloader, JDownloader, online converters, and browser extensions (sourced from `readme-src/`).
- A public Discord community; MIT license; published `SHA256SUMS` and GitHub immutable releases.
- **Absent, do not fabricate:** testimonials, user counts, download counts, star counts, press quotes, or benchmarks.

## Product Principles

- **Fastest path first, depth on request.** Quick Download and the hotkey make the common case one action. The wizard, playlist picker, profiles, and advanced settings are close at hand but never in a newcomer's face.
- **The workflow is the product.** Link → probe → choose → queue → file. Every screen serves one clear step, and fixes are proven through real user actions (Fixture Product E2E), not isolated component states.
- **Earn trust on every surface.** Honest progress, localized and categorized errors instead of raw stderr, honest telemetry disclosure with an easy opt-out, no dark patterns, no fake urgency.
- **Local-first and resilient.** The persisted queue survives restarts, paused jobs resume, and failures degrade softly. Never lose a user's in-flight work.
- **Inclusive by default.** Every supported locale (including RTL) and accessibility are constraints on every change, not a later pass.

## Accessibility & Inclusion

Target WCAG 2.1 AA in both light and dark themes: body text ≥4.5:1, large text ≥3:1. Full RTL support: layout, wizard step transitions, and queue card entrances all have RTL variants. `prefers-reduced-motion` gets a real alternative (crossfade or instant) for every animation. Status never relies on color alone; done/paused/error states pair color with an icon and text. i18n completeness is enforced in CI: every error kind and status key has a string in every locale.
