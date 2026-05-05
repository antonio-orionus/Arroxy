<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy mascot" width="180" />

# Arroxy — Free Open-Source YouTube Downloader for Windows, macOS & Linux

**4K · 1080p60 · HDR · MP3 · Shorts · Subtitles · SponsorBlock**

**Read in:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · **English** · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Release](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) ![License](https://img.shields.io/badge/license-MIT-green) ![Platforms](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Languages](https://img.shields.io/badge/i18n-21_languages-blue)

Download any YouTube video, Short, or audio track in original quality — up to 4K HDR at 60 fps, or as MP3 / AAC / Opus. Runs locally on Windows, macOS, and Linux. **No ads, no login, no browser cookies, no Google account linked.**

[**↓ Download Latest Release**](../../releases/latest) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy demo" width="720" />

If Arroxy saves you time, a ⭐ helps others find it.

</div>

---

## Contents

- [Why Arroxy](#why)
- [No cookies, no logins, no account linking](#no-cookies)
- [Features](#features)
- [Download](#download)
- [Privacy](#privacy)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Built with](#tech)

---

## <a id="why"></a>Why Arroxy

A side-by-side comparison with the most common alternatives:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Free, no premium tier |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Local processing only |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| No login or cookie export |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| No usage caps |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Cross-platform desktop app |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitles + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy is built for one thing: paste a URL, get a clean local file. No accounts, no upsells, no data collection.

---

## <a id="no-cookies"></a>No cookies, no logins, no account linking

This is the most common reason desktop YouTube downloaders break — and the main reason Arroxy exists.

When YouTube updates its bot detection, most tools tell you to export your browser's YouTube cookies as a workaround. Two problems with that:

1. Exported sessions typically expire within ~30 minutes, so you re-export constantly.
2. yt-dlp's own documentation [warns that cookie-based automation can flag your Google account](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).

**Arroxy never asks for cookies, logins, or any credential.** It uses only the public tokens YouTube serves to any browser. Nothing tied to your Google identity, nothing to expire, nothing to rotate.

---

## <a id="features"></a>Features

### Quality & formats

- Up to **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **High frame rate** preserved as-is — 60 fps, 120 fps, HDR
- **Audio-only** export to MP3, AAC, or Opus
- Quick presets: *Best quality* · *Balanced* · *Small file*

### Privacy & control

- 100% local processing — downloads go straight from YouTube to your disk
- No login, no cookies, no Google account linked
- Files saved straight to the folder you choose

### Workflow

- **Paste any YouTube URL** — videos and Shorts both supported
- **Multi-download queue** — track several downloads in parallel
- **Clipboard watch** — copy a YouTube link and Arroxy auto-fills the URL when you refocus the app (toggle in Advanced settings)
- **Auto-clean URLs** — strips tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) and unwraps `youtube.com/redirect` links
- **Tray mode** — closing the window keeps downloads running in the background
- **9 languages** — auto-detects system locale, switchable any time

### Subtitles & post-processing

- **Subtitles** in SRT, VTT, or ASS — manual or auto-generated, in any available language
- Save next to the video, embed into `.mkv`, or organize into a `Subtitles/` subfolder
- **SponsorBlock** — skip or chapter-mark sponsors, intros, outros, self-promos
- **Embedded metadata** — title, upload date, channel, description, thumbnail, and chapter markers written into the file

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Paste a URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Pick your quality" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Choose where to save" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Download queue in action" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Subtitle language and format picker" />
</div>

---

## <a id="download"></a>Download

| Platform | Format   |
| ------------------- | ------------------- |
| Windows             | Installer (NSIS) or Portable `.exe`   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` or `.flatpak` (sandboxed) |

[**Grab the latest release →**](../../releases/latest)

### Install via package manager

| Channel | Command                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |

<details>
<summary><strong>Windows: Installer vs Portable</strong></summary>

|               | NSIS Installer | Portable `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Installation required | Yes  | No — run from anywhere  |
| Auto-updates | ✅ in-app  | ❌ manual download  |
| Startup speed | ✅ faster  | ⚠️ slower cold start  |
| Adds to Start Menu |            ✅            |           ❌            |
| Easy uninstall |            ✅            | ❌ delete the file  |

**Recommendation:** use the NSIS installer for auto-updates and faster startup. Use the portable `.exe` for a no-install, no-registry option.

</details>

<details>
<summary><strong>First-time launch on macOS</strong></summary>

Arroxy is not yet code-signed, so macOS Gatekeeper will warn you on first launch. This is expected — it's not a sign of damage.

**System Settings method (recommended):**

1. Right-click the Arroxy app icon and select **Open**.
2. The warning dialog appears — click **Cancel** (don't click *Move to Trash*).
3. Open **System Settings → Privacy & Security**.
4. Scroll to the **Security** section. You'll see *"Arroxy was blocked from use because it is not from an identified developer."*
5. Click **Open Anyway** and confirm with your password or Touch ID.

After step 5, Arroxy opens normally and the warning never appears again.

**Terminal method (advanced):**

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

> macOS builds are produced via CI on Apple Silicon and Intel runners. If you hit issues, please [open an issue](../../issues) — feedback from macOS users actively shapes the macOS testing cycle.

</details>

<details>
<summary><strong>First-time launch on Linux</strong></summary>

AppImages run directly — no installation. You just need to mark the file as executable.

**File manager:** right-click the `.AppImage` → **Properties** → **Permissions** → enable **Allow executing file as program**, then double-click.

**Terminal:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

If launch still fails, you may be missing FUSE:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Flatpak (sandboxed alternative):** download `Arroxy-*.flatpak` from the same release page.

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

</details>

---

## <a id="privacy"></a>Privacy

Downloads are fetched directly via [yt-dlp](https://github.com/yt-dlp/yt-dlp) from YouTube to the folder you pick — nothing routed through a third-party server. Watch history, download history, URLs, and file contents stay on your device.

Arroxy sends anonymous, aggregate telemetry via [Aptabase](https://aptabase.com) — just enough for an indie project to see whether anyone is actually using it (launches, OS, app version, crashes). No URLs, no video titles, no file paths, no IPs, no account info — Aptabase is open-source and GDPR-friendly by design. You can opt out in Settings.

---

## <a id="faq"></a>FAQ

**Is it really free?**
Yes — MIT licensed, no premium tier, no feature gating.

**What video qualities can I download?**
Anything YouTube serves: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio-only. 60 fps, 120 fps, and HDR streams are preserved as-is.

**Can I extract just the audio as MP3?**
Yes. Pick *audio-only* in the format menu and choose MP3, AAC, or Opus.

**Do I need a YouTube account or cookies?**
No. Arroxy uses only the public tokens YouTube serves to any browser. No cookies, no login, no credentials stored. See [No cookies, no logins, no account linking](#no-cookies) for why this matters.

**Will it keep working when YouTube changes something?**
Two layers of resilience: yt-dlp updates within hours of YouTube changes, and Arroxy doesn't rely on cookies that expire every ~30 minutes. That makes it noticeably more stable than tools that depend on exported browser sessions.

**What languages is Arroxy available in?**
Nine: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Auto-detects your system language; switch any time from the toolbar. Locale files are plain TypeScript objects in `src/shared/i18n/locales/` — [PRs welcome](../../pulls).

**Do I need to install anything else?**
No. yt-dlp and ffmpeg are downloaded automatically on first launch from their official GitHub releases and cached locally.

**Can I download playlists or whole channels?**
Single videos and Shorts today. Playlist and channel support are on the [roadmap](#roadmap).

**macOS says "the app is damaged" — what do I do?**
That's macOS Gatekeeper blocking an unsigned app, not actual damage. See the [first-time launch on macOS](#download) section for the fix.

**Is downloading YouTube videos legal?**
For personal, private use it is generally accepted in most jurisdictions. You are responsible for complying with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and your local copyright laws.

---

## <a id="roadmap"></a>Roadmap

Coming up — roughly in priority order:

| Feature    | Description    |
| ---------------- | ---------------- |
| **Playlist & channel downloads** | Paste a playlist or channel URL; queue all videos with date or count filters |
| **Batch URL input** | Paste multiple URLs at once and run them in one go |
| **Format conversion** | Convert downloads to MP3, WAV, FLAC without a separate tool |
| **Custom filename templates** | Name files by title, uploader, date, resolution — with live preview |
| **Scheduled downloads** | Start a queue at a set time (overnight runs) |
| **Speed limits** | Cap bandwidth so downloads don't saturate your connection |
| **Clip trimming** | Download only a segment by start/end time |

Have a feature in mind? [Open a request](../../issues) — community input shapes priority.

---

## <a id="tech"></a>Built with

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — download and mux engine (fetched from GitHub on first launch, always up-to-date)
- **Vite** + **electron-vite** — build tooling
- **Vitest** + **Playwright** — unit and end-to-end tests

</details>

<details>
<summary><strong>Build from source</strong></summary>

### Prerequisites — all platforms

| Tool | Version | Install |
| ---- | ------- | ------- |
| Git  | any     | [git-scm.com](https://git-scm.com) |
| Bun  | latest  | see per-OS below |

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

No native build tools required — the project has no native Node addons.

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

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

> yt-dlp and ffmpeg are not bundled — they're fetched from GitHub on first launch and cached in your app data folder.

</details>

---

## Terms of use

Arroxy is a tool for personal, private use only. You are solely responsible for ensuring your downloads comply with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and the copyright laws of your jurisdiction. Do not use Arroxy to download, reproduce, or distribute content you do not have the right to use. The developers are not liable for any misuse.

<div align="center">
  <sub>MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
