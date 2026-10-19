<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy mascot" width="180" />

# Arroxy — Free Open-Source YouTube (+ 2000 sites) Downloader with a Built-in Browser, for Windows, macOS & Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Read in:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · **English** · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Release](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Website](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![License](https://img.shields.io/badge/license-MIT-green) ![Platforms](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Languages](https://img.shields.io/badge/i18n-31_languages-blue)

Download videos, Shorts, music, channels, podcasts, or audio tracks from **YouTube and 2000+ supported sites** — up to 8K HDR at 60 fps, as MP3 / AAC / Opus, or just the part you need. **Browse YouTube or any other site inside Arroxy** in the Explore tab and download the video, playlist, or channel you're on; sign in there to download private, members-only, and age-restricted videos your account can watch. Runs locally on Windows, macOS, and Linux. **No ads, no bloat, no upsells.**

[**↓ Install Latest Release**](#install) &nbsp;·&nbsp; [**Website**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows first launch](#windows-first-launch) · [macOS first launch](#macos-first-launch) · [Linux first launch](#linux-first-launch)

[![Join the Discord Community](https://img.shields.io/badge/Join%20the%20Discord%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

If Arroxy saves you time, a ⭐ helps others find it.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## Contents

- [✨ Features](#features)
- [📥 Install and first launch](#install)
  - [Windows first launch](#windows-first-launch)
  - [macOS first launch](#macos-first-launch)
  - [Why you may see a warning](#why-warning)
  - [Linux first launch](#linux-first-launch)
  - [Verify your download (SHA256)](#verify)
- [⚖️ Why Arroxy](#why)
- [🔒 Privacy](#privacy)
- [❓ FAQ](#faq)
- [🗺️ Roadmap](#roadmap)
- [💖 Support Arroxy](#support)
- [🛠️ Built with](#tech)

---

## <a id="features"></a>✨ Features

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Browse YouTube or any other site inside Arroxy and download the page you're on with your active profile</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore's first screen</b><br/>A quick look at Explore, and why a secondary account is the safer sign-in</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Downloads tells you what needs you</b><br/>Links prepare in the background; a failed one offers its fix, a long playlist waits for your choice</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Download just part of a video</b><br/>Pick a start and end, or a chapter — Arroxy saves only that range</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profile editor</b><br/>Tune a profile: file type, resolution, subtitles, destination, filename template and more</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Dark or light, glass or solid</b><br/>Four looks to choose from: glass panels over a moving sky or quiet solid surfaces, each in dark and light</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy global download hotkey — Ctrl+Shift+D on Windows and Linux, Cmd+Shift+D on macOS, sending the copied link straight into the download queue" width="760" /></picture><br/><sub><b>Global download hotkey</b><br/>Copy a link anywhere, press once — it lands in the queue and starts downloading</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Per-item playlist profiles</b><br/>Give each video its own profile — archive some in 4K, grab the rest as MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Quick Download home</b><br/>Paste a URL and pull it instantly with your active profile</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Reusable download profiles</b><br/>Save format, quality, and output presets — reuse per download</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Multi-language audio tracks</b><br/>Pick the exact audio language a video ships</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround / Dolby audio</b><br/>5.1 and Dolby tracks detected and preserved</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Bulk URL mode</b><br/>Paste a list, auto-dedupe, queue them all at once</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Parallel download queue</b><br/>Several downloads at once with live progress</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: browse the web inside Arroxy</strong></summary>

- **Explore tab** — browse YouTube or any other site inside Arroxy and download what you find without copying links. **Download · *your profile*** queues the video, playlist, or channel you're looking at; the arrow next to it switches profiles, and the wand opens the step-by-step download for picking formats, subtitles, and more
- **Right-click to download** — right-click any video, playlist, or channel link in Explore to download it with your profile, pick another profile from **Download with**, open the step-by-step download, or copy the link. No need to open each video first
- **Compact layout** — one click in Explore's toolbar moves Arroxy's tabs into it and gives the page more room
- **Address bar** — type to search YouTube, or enter any web address to open that site
- **Downloads that need an account** — sign in once in Explore and Arroxy can download private and members-only videos your account can watch, age-restricted videos if the account is age-verified, and your Watch Later and Liked lists. Sign in to other sites there too, and their downloads use that sign-in when they need it. Arroxy still downloads signed out first and only uses your Explore sign-in when a download fails in a way an account can fix. When YouTube asks you to confirm you're not a bot, Arroxy also tries your Explore sign-in
- **Use a secondary account** — Explore's first screen explains why: downloading with an account carries some risk of that account being restricted. Sign out of Explore from Settings whenever you want to forget your sign-ins
- **Ad blocker** — off by default. One click on the shield in Explore's toolbar blocks ads and trackers on its pages, without affecting downloads. YouTube may push back on ad blockers for signed-in accounts

</details>

<details>
<summary><strong>🎞️ Quality & formats</strong></summary>

- Up to **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **High frame rate and HDR** preserved as-is — 60 fps, HDR10
- **Audio** — export audio-only as MP3, M4A/AAC, Opus, or WAV. In interactive downloads, pick the source's native surround/Dolby tracks (AC-3, E-AC-3, 5.1, DRC) when available, or set a global **Prefer surround / Dolby** default
- **Profiles with a goal** — *Best picture* (AV1 · VP9) or *Smart TV* (MP4 · H.264), saved as Auto, MP4, MKV, or WebM without re-encoding. HDR is *Auto* (only when your screen can show it), *SDR*, or *HDR*
- **Every codec at every resolution** — the step-by-step download lists AV1, VP9 and H.264 side by side at each resolution, so you can pick the one your TV or editor plays
- **Know what a stream really is** — sizes YouTube upscaled with AI, AI-dubbed audio languages, enhanced-bitrate streams, 360° videos and damaged or watermarked copies are marked. Profiles skip AI-upscaled streams unless you allow them

</details>

<details>
<summary><strong>🛡️ Privacy & control</strong></summary>

- 100% local processing — downloads go straight from YouTube to your disk
- **Open source** — every line auditable, MIT licensed
- Files saved straight to the folder you choose

</details>

<details>
<summary><strong>⚡ Workflow</strong></summary>

- **Global download hotkey** — copy a link in any app and press `Ctrl+Shift+D` (`Cmd+Shift+D` on macOS); Arroxy queues it with your active profile without opening the window, and a notification confirms it. On by default, rebindable
- **Flexible start modes** — choose a guided single download, playlist/channel picker, bulk URL paste, Quick Download with saved defaults, or browse and download from Explore
- **Central download queue** — every single, playlist, bulk, or quick job lands in one place for progress, pause, resume, cancel, retry, and priority control
- **Clipboard watch** — copy a video link and it fills the URL field when you come back to Arroxy, with **Undo** if you didn't mean it. While Arroxy is busy, the link waits until you are back on the URL tab (turn it off in Settings)
- **Auto-clean URLs** — strips tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) and unwraps `youtube.com/redirect` links
- **Tray mode** — closing the window keeps downloads running in the background
- **31 languages** — auto-detects system locale, switchable any time
- **Playlist sync** — re-scan a playlist against a local folder to skip already-downloaded videos; generates an `.m3u` playlist file updated as each video downloads
- **Speed and pacing controls** — cap download bandwidth, set how many parts of a video download at once, and add request delays with presets (*Off · Balanced · Careful · Custom*)
- **Filename templates** — name downloads your way with `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}`, and `{playlist_index}`, globally or per download profile
- **Downloads at once and automatic retry** — choose how many queued downloads run at the same time, and let Arroxy retry a download that hit a network or server problem, waiting longer before each attempt
- **Per-item playlist profiles** — assign each video in a playlist its own download profile instead of one setting for the whole list, so a single pass can archive some at full quality and grab the rest as MP3
- **Quick Download works in the background** — the link shows up in Downloads right away and prepares there, a note with **View** confirms it, and the URL field clears for the next link. Start as many as you like while earlier ones prepare
- **Downloads tells you what needs you** — if Arroxy can't read a link, its row says why and offers the fix: Retry, turn on cookies, or sign in in Explore. With cookies off, **Sign in with Explore** retries it for you once you're signed in. A playlist longer than your load limit waits on its row for you to pick all of it, the first ones, or a review. The Downloads tab counts the rows waiting for you
- **Download just part of a video** — pick a start and end, or a chapter, on the Format screen and Arroxy saves only that range, named with the range after the video id. Cuts land on the nearest keyframe; turn on exact cut to re-encode instead
- **Remove finished downloads** — optional: a finished download leaves the list 5 seconds later. Its files stay on disk, and failed downloads stay listed
- **Size and Missing in Downloads** — a sortable **Size** column shows how much space each download takes, and **Missing** flags files moved or deleted outside Arroxy
- **Aurora or Minimal, dark or light** — glass panels over a moving sky, or quiet solid surfaces; switch from the footer. Computers without graphics acceleration get Minimal automatically
- **Mac menu bar** — on macOS, open Settings (`Cmd+,`), set the download speed limit, switch style and theme, and open logs or save a diagnostics file from the menu bar
- **Change a profile from any download** — tweak a download, then update the profile it started from (with a preview of what changes) or save the settings as a new profile. Switching profile asks whether to keep your edits

</details>

<details>
<summary><strong>📝 Subtitles & post-processing</strong></summary>

- **Subtitles** in SRT, VTT, or ASS — manual or auto-generated, in any available language
- Save next to the video, embed into `.mkv`, or organize into a `Subtitles/` subfolder
- **Subtitles-only batches** — paste a list of URLs or open a playlist, pick Subtitles, and get only the caption files for every video
- **SponsorBlock** — skip or chapter-mark sponsors, intros, outros, self-promos
- **Embedded metadata** — title, upload date, channel, description, thumbnail, and chapter markers written into the file

</details>

<details>
<summary><strong>🌐 YouTube + 2000 sites</strong></summary>

- **YouTube, in full** — Videos, Shorts, Channels, Playlists, YouTube Music, and Podcasts handled as first-class sources
- **2000+ other sites** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable, and many more
- **Audio-only and subtitles** work across every supported site, not just YouTube
- If a site changes, yt-dlp ships fixes weekly and Arroxy auto-updates the binary on launch

</details>

---

## <a id="install"></a>📥 Install and first launch

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

AppImage:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

Builds are x86_64 only. No `curl`? Swap `curl -fsSL` for `wget -qO-`.

| Platform | Direct download |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**All release assets →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows first launch</strong></summary>

On first launch you may see **"Windows protected your PC"** or **"Unknown publisher."** This applies to both `Arroxy-win-x64-Setup.exe` and `Arroxy-win-x64-Portable.exe`. Arroxy is free and open-source and the Windows builds are not code-signed with a paid certificate, which is why SmartScreen flags them. It does **not** automatically mean Arroxy is unsafe. To continue:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Click **More info**.
2. Click **Run anyway**.

#### If Windows Defender flags or removes the file

Defender heuristics sometimes flag unsigned NSIS installers and Electron portables as suspicious. If Defender quarantines `Arroxy-win-x64-Setup.exe` or `Arroxy-win-x64-Portable.exe`, restore it from **Windows Security → Virus & threat protection → Protection history**, then add the Arroxy executable as an allowed item under **Manage settings → Add or remove exclusions**. As with SmartScreen, the trigger is the missing publisher signature, not detected malware.

> Only download Arroxy from the official GitHub Releases page. If you got the file from another website or someone sent it to you, delete it and download a fresh copy from the official source. The source code is public, so you can inspect it or build Arroxy yourself if you prefer.

Prefer Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS first launch</strong></summary>

Arroxy's macOS builds are ad-hoc signed but not notarized by Apple, so Gatekeeper blocks the first launch with *"Arroxy.app" Not Opened — Apple could not verify "Arroxy.app" is free of malware*. That means macOS cannot check the app with Apple, not that anything is wrong with the files. Installing with Homebrew avoids this dialog entirely. If you used the DMG, one Terminal command clears it:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Drag `Arroxy.app` from the mounted DMG into `/Applications`.
2. Open Terminal and run these two commands:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

The first command removes the quarantine attribute macOS attached when the file was downloaded; the second launches the app. You normally do not need `sudo`, because the copy in `/Applications` belongs to you — add it only if you get a permissions error.

**Apple Silicon vs Intel:** on an M-series Mac (M1 / M2 / M3 / M4), download the `arm64` DMG. On Intel Macs, download the `x64` DMG. Running the wrong build still works via Rosetta but is noticeably slower.

> macOS builds are produced via CI on Apple Silicon and Intel runners. If you hit issues, please [open an issue](../../issues) — feedback from macOS users actively shapes the macOS testing cycle.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Why you may see a warning</strong></summary>

Arroxy is open-source and MIT-licensed. The Windows and macOS builds are **not code-signed** — Apple Developer ID and Windows EV code-signing certificates each cost hundreds of dollars per year, which an indie project pays out of pocket. Without those signatures, Windows SmartScreen and macOS Gatekeeper will warn you on first launch. The warnings mean *your OS doesn't recognize the publisher* — they don't mean Arroxy is malware.

Three ways to verify Arroxy yourself, in increasing rigor:

- **Read the source.** Every line is on [GitHub](https://github.com/antonio-orionus/Arroxy) and you can [build it from source](#tech).
- **Check the SHA256.** Match your file against the published [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — see [Verify your download](#verify) below.
- **Run a third-party scan.** Upload the file to [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux first launch</strong></summary>

AppImages run directly — no installation. You just need to mark the file as executable.

**File manager:** right-click the `.AppImage` → **Properties** → **Permissions** → enable **Allow executing file as program**, then double-click.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

If launch still fails, run it without mounting — no FUSE package needed:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Optional desktop integration:** install [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) once, and any AppImage you double-click gets registered into your launcher menu automatically — no manual `.desktop` file needed.

**Plain tarball (no FUSE, no install):**

The `.tar.gz` build is the same app without the AppImage wrapper — extract it anywhere and run it. No installer and no FUSE package needed.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**The Linux downloads on the release page are x86_64 only.** On ARM64 machines (Raspberry Pi, Asahi Linux) the Flatpak still installs, then fails at launch with `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verify your download (SHA256)</strong></summary>

Every release publishes a `SHA256SUMS` file alongside the binaries. To check that your download wasn't corrupted or tampered with in transit, hash your file locally and match the line in `SHA256SUMS`. Open the latest release page → **Assets** → download `SHA256SUMS`.

**Windows (PowerShell or Command Prompt):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Want a third-party malware scan? Upload the file at [VirusTotal](https://www.virustotal.com). A handful of generic-heuristic flags from minor engines is normal for unsigned Electron apps; widespread detections from major engines would be a real concern.

</details>

<details>
<summary><strong>📦 Windows: Installer vs Portable</strong></summary>

|               | NSIS Installer | Portable `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Installation required | Yes  | No — run from anywhere  |
| Auto-updates | ✅ in-app  | ❌ manual download  |
| Startup speed | ✅ faster  | ⚠️ slower cold start  |
| Adds to Start Menu |            ✅            |           ❌            |
| Easy uninstall |            ✅            | ❌ delete the file  |

**Recommendation:** use the NSIS installer for auto-updates and faster startup. Use the portable `.exe` for a no-install, no-registry option.

</details>

---

## <a id="why"></a>⚖️ Why Arroxy

A side-by-side comparison with the most common alternatives:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Built-in browser (browse, sign in, download) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Private, members-only & age-restricted videos without exporting cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Free, no premium tier |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Local processing only |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| No usage caps |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Cross-platform desktop app |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitles + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = partly, or only on a paid tier. 4K Video Downloader's in-app sign-in for private videos is a paid feature; most free yt-dlp GUIs only accept a cookies file or read your web browser's cookies.

Arroxy is built for one thing: a clean local file, whether you paste a URL or find the video in Explore. No upsells, no data collection.

### <a id="why-explore"></a>🧭 What a plain yt-dlp wrapper can't do: the Explore tab

Most free YouTube downloaders are a URL box on top of yt-dlp. Arroxy uses yt-dlp too, but it also has **Explore**, a browser built into the app that opens YouTube or any other site. Explore gets past limits that a URL box can't:

- **Videos that need an account, without exporting cookies** — private, members-only, and age-restricted videos (on an age-verified account), plus your Watch Later and Liked lists, and videos behind a sign-in on other sites. A plain wrapper needs a cookies.txt export or must read your web browser's cookies, which Chrome on Windows now blocks. In Arroxy you sign in once in Explore and it does the rest
- **"Sign in to confirm you're not a bot"** — when YouTube asks this, Arroxy tries the download again with your Explore sign-in instead of failing
- **YouTube's download token** — Arroxy's built-in browser gets the token YouTube expects before a download. Without it, YouTube can serve fewer formats and lower quality than you asked for
- **No copying links** — find a video, playlist, or channel in Explore and download it with one click, or right-click any link on the page
- **Ad blocker when you want it** — one click on the shield blocks ads and trackers on Explore's pages

---

## <a id="privacy"></a>🔒 Privacy

Downloads are fetched directly via [yt-dlp](https://github.com/yt-dlp/yt-dlp) from YouTube to the folder you pick — nothing routed through a third-party server. Watch history, download history, URLs, and file contents stay on your device.

No telemetry — just one anonymous heartbeat a day: app version, OS, language, install channel and country, so we can count active users. No IDs, URLs, video titles, file paths or account info. You can turn it off in Settings.

Explore keeps its own sign-ins, separate from your browser, and Arroxy never reads or fills in a sign-in form — you type into the site's own page. Downloads run signed out; only when one fails in a way an account can fix does Arroxy read the sign-in fresh, keep it in a temporary file for that download, and delete the file afterwards. Signing out of Explore in Settings forgets them.

---

## <a id="faq"></a>❓ FAQ

<details>
<summary><strong>Is it really free?</strong></summary>

Yes — MIT licensed, no premium tier, no feature gating.

</details>

<details>
<summary><strong>How is Arroxy different from other yt-dlp GUIs?</strong></summary>

Most free yt-dlp GUIs are wrappers that only take a link. Arroxy adds **Explore**, a browser built into the app that opens YouTube or any other site: you browse and download without copying links, and you sign in there once to download private, members-only, and age-restricted videos and your Watch Later and Liked lists, with no cookie export. Arroxy uses that sign-in when YouTube asks you to confirm you're not a bot, and its built-in browser gets YouTube's download token so downloads don't fall back to fewer formats. See [Why Arroxy](#why).

</details>

<details>
<summary><strong>What video qualities can I download?</strong></summary>

Anything YouTube serves: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio-only. 60 fps and HDR streams are preserved as-is, and the step-by-step download lets you pick AV1, VP9 or H.264 at each resolution.

</details>

<details>
<summary><strong>Can I extract just the audio as MP3?</strong></summary>

Yes. Pick *audio-only* in the format menu and choose MP3, M4A/AAC, Opus, or WAV.

</details>

<details>
<summary><strong>How do I download videos that need a YouTube account?</strong></summary>

Sign in once in the Explore tab. Arroxy can then download private and members-only videos your account can watch, age-restricted videos if the account is age-verified, and your Watch Later and Liked lists. It uses the sign-in only when a download fails in a way an account can fix; everything else downloads as before. This is the **Explore sign-in** choice, listed first and marked Recommended in the cookie settings, and Arroxy picks it for you the first time you open Explore. yt-dlp's wiki notes that [signed-in automation can flag a Google account](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), so a secondary account is the safer choice.

</details>

<details>
<summary><strong>Will it keep working when YouTube changes something?</strong></summary>

yt-dlp is updated automatically on launch, and Arroxy ships fixes promptly when YouTube changes something. When YouTube asks you to confirm you're not a bot, Arroxy also tries your Explore sign-in if you've signed in there, and cookies from a file or your browser are available in the cookie settings.

</details>

<details>
<summary><strong>What languages is Arroxy available in?</strong></summary>

31 languages, out of the box: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy auto-detects your operating system's language on first launch and you can switch at any time from the language picker in the toolbar. Runtime locale JSON lives in src/shared/i18n/locales/, and translator-facing PO catalogs live in i18n/locales/ — open a PR on GitHub to contribute.

</details>

<details>
<summary><strong>Do I need to install anything else?</strong></summary>

No. yt-dlp, ffmpeg and ffprobe are downloaded automatically on first launch and cached on your machine. After that, no extra setup is needed.

</details>

<details>
<summary><strong>Can I download playlists or whole channels?</strong></summary>

Yes — both. Paste a playlist URL or a channel URL (e.g. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); choose how many entries to scan, then queue the whole list or pick specific videos. Date-range filters are coming soon.

</details>

<details>
<summary><strong>macOS says "the app is damaged" — what do I do?</strong></summary>

That's macOS Gatekeeper blocking an unsigned app, not actual damage. See [macOS first launch](#macos-first-launch) for the Terminal commands that clear quarantine and launch Arroxy.

</details>

<details>
<summary><strong>Is downloading YouTube videos legal?</strong></summary>

For personal, private use it is generally accepted in most jurisdictions. You are responsible for complying with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and your local copyright laws.

</details>

---

## <a id="roadmap"></a>🗺️ Roadmap

Still planned — roughly in priority order:

| Feature    | Description    |
| ---------------- | ---------------- |
| **Playlist & channel filters** | Date-range filters when enumerating a playlist or channel |
| **YouTube audio track preferences** | Set an app-wide spoken-language track preference, with per-profile overrides when YouTube offers multiple audio tracks |
| **Stronger retry recovery** | A new retry path for downloads interrupted by unreliable or problematic internet connections |
| **Full download manager drawer** | Turn the queue drawer into a fuller manager, including changing destination folders for queued items |
| **Scheduled downloads** | Start a queue at a set time (overnight runs) |
| **AUR package** | Install on Arch Linux and Omarchy with `yay -S arroxy-bin` |

Have a feature in mind? [Open a request](../../issues) — community input shapes priority.

---

## <a id="support"></a>💖 Support Arroxy

Arroxy is free and MIT-licensed — no ads, no telemetry, no paid tier. If it saves you time, you can support development with Bitcoin, Tron or Ethereum: the addresses are in [DONATE.md](DONATE.md), which is the only official source for them. Arroxy will never send you an address by email or direct message. Starring the repo, reporting bugs, and improving translations help just as much.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Built with

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — download and mux engine (both fetched at runtime: yt-dlp kept up to date, ffmpeg/ffprobe installed once and kept across updates)
- **Vite** + **electron-vite** — build tooling
- **Vitest** + **Playwright** — unit and end-to-end tests

</details>

<details>
<summary><strong>Build from source</strong></summary>

### Prerequisites — all platforms

| Tool    | Version | Install |
| ------- | ------- | ------- |
| Git     | any     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` or `.node-version` |
| Bun     | 1.4.2  | `mise install` or `package.json` `packageManager` |

Recommended: install `mise`, then run `mise install` in the checkout. Without mise, manually activate Node.js from `.node-version` and Bun from `package.json` before `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools and Python may be needed for native rebuilds.

### macOS

```bash
brew install mise
xcode-select --install
```

After cloning, run `mise trust && mise install` from the checkout. If your shell already uses `fnm`, `nvm`, or a Homebrew Bun, activate mise in `~/.zshrc` so Arroxy gets Node.js 24.21.0 and Bun 1.4.2:

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Clone & run

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Build a distributable

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` installs dependencies, rebuilds Electron app dependencies, verifies Electron, prepares embedded ffmpeg/ffprobe for development, and installs Playwright Chromium. Release builds manage yt-dlp, ffmpeg and ffprobe at runtime in your app data folder; none of them ship inside the installer.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\Arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/Arroxy/main.log` |
| Linux    | `~/.config/Arroxy/logs/main.log` |

**2. Launch with hardware acceleration disabled.** Open a terminal / Command Prompt and run the executable with a flag:

```bash
# Windows (Portable) — PowerShell, run from the folder containing the exe
.\Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-linux-x64.AppImage --disable-gpu
```

If that works, the GPU/driver is the cause. Make the change permanent (next step).

**3. Persist the flag via `argv.json`.** Create the file at:

| Platform | Path                                             |
| -------- | ------------------------------------------------ |
| Windows  | `%APPDATA%\Arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/Arroxy/argv.json` |
| Linux    | `~/.config/Arroxy/argv.json`                     |

With contents:

```json
{ "disable-hardware-acceleration": true }
```

Arroxy reads this before opening any window, so it works even when the window never appeared.

**4. Other flags worth trying** (combine if needed): `--disable-software-rasterizer`, `--disable-gpu-sandbox`, `--in-process-gpu`.

**5. Stale window position.** If the window may be opening off-screen (multi-monitor change since last run), delete `<userData>\window-state.json` and relaunch.

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

</details>

---

## 📜 Terms of use

Arroxy is a tool for personal, private use only. You are solely responsible for ensuring your downloads comply with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and the copyright laws of your jurisdiction. Do not use Arroxy to download, reproduce, or distribute content you do not have the right to use. The developers are not liable for any misuse.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
