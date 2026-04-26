<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy mascot" width="180" />

# Arroxy — Free Open-Source YouTube Downloader

**4K &nbsp;•&nbsp; 1080p60 &nbsp;•&nbsp; HDR &nbsp;•&nbsp; Shorts &nbsp;·&nbsp; Windows &nbsp;•&nbsp; macOS &nbsp;•&nbsp; Linux**

**Tired of YouTube ads ruining your videos?**
Download any video or Short in full quality — 4K, 1080p60, HDR, and beyond. Fast, free, and 100% yours.

No ads. No tracking. No cookies. No login. No nonsense.

[**Latest Release →**](../../releases/latest) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy demo" width="720" />

</div>

---

## Contents

- [Why Arroxy?](#why-arroxy)
- [What it does](#what-it-does)
- [Download](#download)
  - [Windows: Installer vs Portable](#windows-installer-vs-portable)
  - [First-Time Launch on macOS](#first-time-launch-on-macos)
  - [First-Time Launch on Linux](#first-time-launch-on-linux)
- [Planned features](#planned-features)
- [Privacy](#privacy)
- [Frequently asked questions](#frequently-asked-questions)
- [Tech details](#tech-details)

---

## Why Arroxy?

|                            | Arroxy | Browser extensions | Online converters | Other downloaders |
| -------------------------- | ------ | ------------------ | ----------------- | ----------------- |
| Free forever               | ✅     | ⚠️                 | ⚠️                | ✅                |
| No ads                     | ✅     | ⚠️                 | ❌                | ✅                |
| No account needed          | ✅     | ✅                 | ⚠️                | ⚠️                |
| Works offline _(kind of)_  | ✅     | ❌                 | ❌                | ✅                |
| Your files stay local      | ✅     | ✅                 | ❌                | ✅                |
| No usage caps              | ✅     | ⚠️                 | 🚫                | ✅                |
| Open source                | ✅     | ⚠️                 | ❌                | ⚠️                |
| No login or cookies ever   | ✅     | ✅                 | ⚠️                | ⚠️                |
| No Google account ban risk | ✅     | ✅                 | ⚠️                | ⚠️                |

> _"Works offline" means no conversion happens on someone else's server — the whole pipeline runs on your machine. You still need internet to reach YouTube. Yes, we know._

> **Why this matters:** Most desktop YouTube downloaders eventually ask you to export your browser cookies when YouTube updates its bot detection. Those sessions expire every ~30 minutes — and yt-dlp itself warns that cookie-based automation can trigger a Google account ban. Arroxy never asks for cookies, login, or any credentials. It requests the same tokens YouTube issues to any real browser — zero account risk, no expiry.

Arroxy is a **free, open-source, privacy-first** desktop app — built for people who want simplicity without the bloat. Your downloads never touch a third-party server. Zero telemetry, zero data collection. Just paste a URL and go.

---

## What it does

- **Paste any YouTube URL** — videos, Shorts, anything — Arroxy fetches all available formats in seconds
- **Pick your quality** — up to 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps and higher frame rates supported, audio-only (MP3/AAC/Opus), or use a quick preset (Best quality / Balanced / Small file)
- **Full high-frame-rate support** — 60 fps, 120 fps, and HDR streams are preserved exactly as YouTube encodes them
- **Choose where to save** — last folder is remembered, or pick a new one each time
- **One click to download** — real-time progress bar, cancel any time
- **Queue multiple videos** — download panel tracks everything at once

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Paste a URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Pick your quality" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Choose where to save" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Download queue in action" />
</div>

---

## Planned features

Things on the roadmap — not yet shipped, roughly in priority order.

| Feature                          | Description                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Playlist & channel downloads** | Paste a playlist or channel URL and queue all videos at once, with filters for date range or count |
| **Batch URL input**              | Paste multiple URLs at once and kick them all off in one go                                        |
| **Format conversion**            | Convert downloads to MP3, WAV, FLAC, or other formats without a separate tool                      |
| **Custom filename templates**    | Name files by title, uploader, date, resolution, or any combination — with a live preview          |
| **Subtitle download**            | Fetch auto-generated or manual subtitles alongside the video, in any available language            |
| **i18n / localization**          | Full UI translation support — contribute your language via a simple JSON file                      |
| **Scheduled downloads**          | Set a time for Arroxy to start downloading — useful for large queues overnight                     |
| **Download speed limits**        | Cap bandwidth so downloads don't saturate your connection while you work                           |
| **Clip trimming**                | Specify a start and end time to download only a segment of a video                                 |

> Have a feature in mind that's not here? [Open a request](../../issues) — community input shapes what gets built next.

---

## Download

> Arroxy is in active development. Grab the latest build from the [Releases](../../releases) page.

| Platform | Format                              |
| -------- | ----------------------------------- |
| Windows  | Installer (NSIS) or Portable `.exe` |
| macOS    | `.dmg` (Intel + Apple Silicon)      |
| Linux    | `.AppImage`                         |

Just download, run, done.

### Windows: Installer vs Portable

Two builds are available — pick whichever fits:

|                       | NSIS Installer | Portable `.exe`         |
| --------------------- | -------------- | ----------------------- |
| Installation required | Yes            | No — run from anywhere  |
| Auto-updates          | ✅ in-app      | ❌ manual download      |
| Startup speed         | ✅ faster      | ⚠️ slower cold start    |
| Adds to Start Menu    | ✅             | ❌                      |
| Easy uninstall        | ✅             | ❌ just delete the file |

**Recommendation:** use the NSIS installer if you want Arroxy to update itself automatically and launch faster. Use the portable `.exe` if you prefer a no-install, no-registry option.

### First-Time Launch on macOS

> **Note:** I don't own a Mac, so the macOS build is untested by me personally. If something doesn't work — the app won't launch, the `.dmg` is broken, the quarantine workaround fails — please [open an issue](../../issues) and let me know. Any feedback from macOS users is genuinely appreciated.

Arroxy is not yet code-signed. macOS will show a security warning the first time you open it — this is expected, not a sign of damage.

**Method 1: System Settings (Recommended)**

| Step | Action                                                                                                                               |
| :--: | ------------------------------------------------------------------------------------------------------------------------------------ |
|  1   | Right-click the Arroxy app icon and select **Open**.                                                                                 |
|  2   | A warning dialog appears. Click **Cancel** (don't click "Move to Trash").                                                            |
|  3   | Open **System Settings → Privacy & Security**.                                                                                       |
|  4   | Scroll down to the **Security** section — you'll see _"Arroxy was blocked from use because it is not from an identified developer."_ |
|  5   | Click **Open Anyway**, then confirm with your password or Touch ID.                                                                  |

After step 5, Arroxy opens normally and will never show the warning again.

**Method 2: Terminal (Advanced)**

If the above doesn't work, run this once after dragging Arroxy to Applications:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

### First-Time Launch on Linux

AppImages are not installed — they run directly. You just need to mark the file as executable first.

**Method 1: File Manager**

Right-click the `.AppImage` file → **Properties** → **Permissions** → enable **Allow executing file as program**, then double-click to run.

**Method 2: Terminal**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

If it still won't launch, you may be missing FUSE (required by AppImage):

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

---

## Privacy

Arroxy runs entirely on your machine. When you download a video:

1. Arroxy calls the YouTube URL directly using [yt-dlp](https://github.com/yt-dlp/yt-dlp) — an auditable, always up-to-date open-source tool
2. The file is saved straight to your chosen folder
3. Zero telemetry. Nothing is logged, tracked, or sent anywhere — ever.

Your watch history, download history, and file contents stay on your device. 100% private.

---

## Frequently asked questions

**What video qualities can I download?**
Anything YouTube offers — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p, and audio-only. High frame-rate streams (60 fps, 120 fps) and HDR content are preserved as-is. Arroxy shows you every available format and lets you choose exactly what to grab.

**Is it really free?**
Yes. MIT licensed. No premium tier, no feature gating.

**Do I need to install anything?**
No. yt-dlp and ffmpeg are downloaded automatically on first launch from their official GitHub releases and cached on your machine. After that, no extra setup is needed.

**Will it keep working if YouTube changes something?**
Yes — and Arroxy has two layers of resilience. First, yt-dlp is one of the most actively maintained open-source tools around — it updates within hours of YouTube changes. Second, Arroxy doesn't rely on cookies or your Google account at all, so there's no session to expire and no credentials to rotate. That combination makes it significantly more stable than tools that depend on exported browser cookies.

**Can I download playlists?**
Single videos are supported today. Playlist and channel support is on the roadmap — see [Planned features](#planned-features).

**Does it need my YouTube account or cookies?**
No — and that's a bigger deal than it sounds. Most tools that stop working after a YouTube update tell you to export your browser's YouTube cookies. That workaround breaks every ~30 minutes as YouTube rotates sessions, and yt-dlp's own docs warn it can get your Google account flagged. Arroxy never uses cookies or credentials. No login. No account linked. Nothing to expire, nothing to ban.

**macOS says "the app is damaged" or "cannot be opened" — what do I do?**
This is macOS Gatekeeper blocking an unsigned app — not actual damage. See [First-Time Launch on macOS](#first-time-launch-on-macos) for step-by-step instructions.

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

| Tool | Version | Install                            |
| ---- | ------- | ---------------------------------- |
| Git  | any     | [git-scm.com](https://git-scm.com) |
| Bun  | latest  | see per-OS below                   |

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

Electron runtime dependencies (needed to _run_ the app, not just build):

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

---

> **Terms of Use:** Arroxy is a tool for personal, private use only. You are solely responsible for ensuring your downloads comply with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and the copyright laws of your jurisdiction. Do not use Arroxy to download, reproduce, or distribute content you do not have the right to use. The developers of Arroxy are not liable for any misuse.

<div align="center">
  <sub>MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
