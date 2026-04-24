<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy mascot" width="180" />

  # Arroxy

  **Download YouTube videos and Shorts the way it should be — fast, free, and yours.**

  No ads. No tracking. No nonsense.

  [**Latest Release →**](../../releases/latest) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)
</div>

---

## Why Arroxy?

| | Arroxy | Browser extensions | Online converters |
|---|---|---|---|
| Free forever | ✅ | ⚠️ | ⚠️ |
| No ads | ✅ | ⚠️ | ❌ |
| No account needed | ✅ | ✅ | ⚠️ |
| Works offline *(kind of)* | ✅ | ❌ | ❌ |
| Your files stay local | ✅ | ✅ | ❌ |
| No usage caps | ✅ | ⚠️ | 🚫 |
| Open source | ✅ | ⚠️ | ❌ |

> *"Works offline" means no conversion happens on someone else's server — the whole pipeline runs on your machine. You still need internet to reach YouTube. Yes, we know.*

Arroxy is a **free, open-source, privacy-first** desktop app — built for people who want simplicity without the bloat. Your downloads never touch a third-party server. Zero telemetry, zero data collection. Just paste a URL and go.

---

## What it does

- **Paste any YouTube URL** — videos, Shorts, anything — Arroxy fetches all available formats in seconds
- **Pick your quality** — up to 4K, 1080p, 720p, audio-only, or use a quick preset (Best quality / Balanced / Small file)
- **Choose where to save** — last folder is remembered, or pick a new one each time
- **One click to download** — real-time progress bar, cancel any time
- **Queue multiple videos** — download panel tracks everything at once

---

## Screenshots

> *(coming soon — screenshots will go here once a release build is packaged)*

---

## Download

> Arroxy is in active development. Grab the latest build from the [Releases](../../releases) page.

| Platform | Format |
|---|---|
| Windows | Portable `.exe` (no install needed) |
| macOS | `.dmg` (Intel + Apple Silicon) |
| Linux | `.AppImage` |

Just download, run, done. No installer wizard, no admin rights needed on Windows.

---

## Privacy

Arroxy runs entirely on your machine. When you download a video:

1. Arroxy calls the YouTube URL directly using [yt-dlp](https://github.com/yt-dlp/yt-dlp) — an auditable, always up-to-date open-source tool
2. The file is saved straight to your chosen folder
3. Zero telemetry. Nothing is logged, tracked, or sent anywhere — ever.

Your watch history, download history, and file contents stay on your device. 100% private.

---

## Frequently asked questions

**Is it really free?**
Yes. MIT licensed. No premium tier, no feature gating.

**Do I need to install anything?**
No. yt-dlp and ffmpeg are downloaded automatically on first launch from their official GitHub releases and cached on your machine. After that, no extra setup is needed.

**Will it keep working if YouTube changes something?**
yt-dlp is one of the most actively maintained open-source tools around — it updates within hours of YouTube changes. Arroxy ships updates to pull in the latest yt-dlp automatically.

**Can I download playlists?**
Single videos are supported today. Playlist support is planned.

**Is this legal?**
Downloading videos for personal use is generally accepted in most jurisdictions. You are responsible for complying with YouTube's Terms of Service and your local laws.

---

## Tech details

<details>
<summary>Built with</summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — download and mux engine (fetched from GitHub on first launch, always up-to-date)
- **Vite** + **electron-vite** — build tooling
- **Vitest** + **Playwright** — unit and end-to-end tests

</details>

<details>
<summary>Build from source</summary>

### Prerequisites — all platforms

| Tool | Version | Install |
|------|---------|---------|
| Git | any | [git-scm.com](https://git-scm.com) |
| Bun | latest | see per-OS below |

---

### Windows

Install Bun (PowerShell):
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

No extra native build tools needed — the project has no native Node addons.

---

### macOS

Install Xcode Command Line Tools (required by electron-builder):
```bash
xcode-select --install
```

Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

---

### Linux (Ubuntu / Debian)

Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

Electron runtime dependencies (needed to *run* the app, not just build):
```bash
sudo apt install -y libgtk-3-0 libnss3 libasound2t64
```

For end-to-end tests only (Electron needs a display):
```bash
sudo apt install -y xvfb
```

---

### Clone & run

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install

bun run dev          # hot-reload dev build
```

### Build a distributable

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # cross-compile Windows portable exe
```

> **Note:** yt-dlp and ffmpeg are not bundled in the installer — they are downloaded automatically from GitHub on first launch and cached in your app data folder.

</details>

---

<div align="center">
  <sub>MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
