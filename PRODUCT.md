# Product

## Register

product

## Users

People who want to pull video, audio, music, playlists, channels, or subtitles off YouTube and 2000+ other sites and keep the files locally. They span casual users (grab one song as MP3, save a video to watch offline) and power users (4K HDR, format codes, SponsorBlock, subtitle languages, channel archives). Most arrive non-technical and intimidated by `yt-dlp` on the command line; the app is their reason for not touching a terminal. They use it on their own desktop (Windows / macOS / Linux), offline-capable, with no account and no usage limits. The job to be done: paste a URL (or a messy list of them), pick what and how, and end up with the right file in the right folder, without ads, bloat, or guesswork.

## Product Purpose

Arroxy is a free, open-source desktop GUI wrapper around `yt-dlp` + `ffmpeg`. It exists to make the most capable downloader on the internet usable by people who would never run it from a shell, while not dumbing it down for the people who would. Success looks like: a first-time user pastes a link and gets a correct download with zero config; a power user reaches 4K/HDR, audio-only conversion, SponsorBlock, embedded vs sidecar subtitles, and playlist controls without fighting the UI. It runs entirely on the user's machine, ships no telemetry-by-default dark patterns, and stays out of the way. The product *is* the wizard → queue → file pipeline; the marketing site lives elsewhere.

## Brand Personality

Friendly, playful, approachable. Voice is warm and plain-spoken, never corporate: action labels read like a person talking ("Pull it! ↓", "Fetch formats →"), not "Submit" / "Execute". Mascot-forward and a little fun, but the playfulness never costs the user clarity or trust. Underneath the friendly surface is quiet competence: the hard stuff (bot-protection cycles, format negotiation, codec coherence) is handled so well the user never sees it. Emotional goals: confidence ("this just works"), relief ("I didn't need the terminal"), and a small bit of delight.

## Anti-references

- **Sketchy downloader sites / freeware.** Ad-choked, fake-"Download" buttons, malware-adjacent, upsell-laden. Arroxy's entire positioning ("no ads, no bloat, no upsells") is the opposite. The UI must read as trustworthy and clean, never like the thing it replaces.
- **Raw CLI / yt-dlp flag soup.** Don't expose argument complexity directly or make the surface feel power-user-only. The capability is there; the intimidation is not.
- **Generic SaaS dashboard.** No cookie-cutter card grids, no hero-metric template, no AI-default app shell. This is a focused desktop tool, not a dashboard.
- **Bloated legacy media suites.** Not heavy, not modal-stacked, not cluttered converter/burner UIs from a decade ago.

## Design Principles

- **Friendly front, expert core.** The default path is a calm linear wizard a non-technical user can finish without thinking; depth (formats, SponsorBlock, subtitle modes, diagnostics) is reachable but never in the newcomer's face.
- **The workflow is the product.** Paste → probe → choose → queue → file is the spine. Every screen serves one clear step of it. Validate against real user actions (the Fixture Product E2E layer), not isolated component states.
- **Earn trust on every surface.** Honest progress, honest errors (localized, categorized, not raw stderr dumps), no dark patterns, no fake urgency. The UI is the proof that this is the safe, clean alternative.
- **Local-first and resilient.** Works offline, survives restarts (persisted queue, resumable paused jobs), degrades softly (subtitle failure keeps the video). Never lose a user's in-flight work.
- **Inclusive by default.** 21 languages including RTL, reduced-motion honored, AA contrast. Internationalization and accessibility are constraints on every change, not a later pass.

## Accessibility & Inclusion

Target WCAG 2.1 AA. Body text ≥4.5:1, large text ≥3:1, verified against both light and dark themes. Full RTL support (Arabic, Urdu, Pashto, and others among the 21 supported locales) — layout, wizard step animations, and queue card entrances all have RTL variants. `prefers-reduced-motion` must have a real alternative (crossfade / instant) for every animation. Status must never rely on color alone (the `done` / `paused` / `error` palette pairs with icons and text). i18n is enforced in CI (`i18n-contract.test.ts`); every error kind and status key has a string in every locale.
