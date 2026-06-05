const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — download and mux engine (yt-dlp fetched at runtime; ffmpeg/ffprobe bundled at build time)
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

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

No native build tools required — the project has no native Node addons.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clone & run

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### Build a distributable

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # cross-compile Windows portable exe
\`\`\`

> yt-dlp is fetched from GitHub on first launch and cached in your app data folder. ffmpeg and ffprobe are bundled with every Arroxy release.

</details>`;

export const en = {
  icon_alt: "Arroxy mascot",
  title: "Arroxy — Free Open-Source YouTube (+ 2000 sites) Downloader for Windows, macOS & Linux",
  read_in_label: "Read in:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "License",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Languages",
  badge_website_alt: "Website",
  hero_desc:
    "Download videos, Shorts, music, channels, podcasts, or audio tracks from **YouTube and 2000+ supported sites** — up to 4K HDR at 60 fps, or as MP3 / AAC / Opus. Runs locally on Windows, macOS, and Linux. **No ads, no bloat, no upsells.**",
  cta_latest: "↓ Install Latest Release",
  cta_website: "Website",
  demo_alt: "Arroxy demo",
  star_cta: "If Arroxy saves you time, a ⭐ helps others find it.",
  ai_notice: "",
  toc_heading: "Contents",
  why_h2: "Why Arroxy",
  features_h2: "Features",
  dl_h2: "Install",
  privacy_h2: "Privacy",
  faq_h2: "FAQ",
  roadmap_h2: "Roadmap",
  tech_h2: "Built with",
  why_intro: "A side-by-side comparison with the most common alternatives:",
  why_r1: "Free, no premium tier",
  why_r2: "Open source",
  why_r3: "Local processing only",
  why_r4: "No login or cookie export",
  why_r5: "No usage caps",
  why_r6: "Cross-platform desktop app",
  why_r7: "Subtitles + SponsorBlock",
  why_summary:
    "Arroxy is built for one thing: paste a URL, get a clean local file. No accounts, no upsells, no data collection.",
  feat_quality_h3: "Quality & formats",
  feat_quality_1: "Up to **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**High frame rate** preserved as-is — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Audio-only** export to MP3, M4A/AAC, Opus, or WAV",
  feat_quality_4: "Quick presets: *Best quality* · *Balanced* · *Small file*",
  feat_privacy_h3: "Privacy & control",
  feat_privacy_1:
    "100% local processing — downloads go straight from YouTube to your disk",
  feat_privacy_2: "**Open source** — every line auditable, MIT licensed",
  feat_privacy_3: "Files saved straight to the folder you choose",
  feat_workflow_h3: "Workflow",
  feat_workflow_1:
    "**Flexible start modes** — choose a guided single download, playlist/channel picker, bulk URL paste, or Quick Download with saved defaults",
  feat_workflow_2:
    "**Central download queue** — every single, playlist, bulk, or quick job lands in one place for progress, pause, resume, cancel, retry, and priority control",
  feat_workflow_3:
    "**Clipboard watch** — copy a YouTube link and Arroxy auto-fills the URL when you refocus the app (toggle in Advanced settings)",
  feat_workflow_4:
    "**Auto-clean URLs** — strips tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) and unwraps `youtube.com/redirect` links",
  feat_workflow_5:
    "**Tray mode** — closing the window keeps downloads running in the background",
  feat_workflow_6:
    "**21 languages** — auto-detects system locale, switchable any time",
  feat_workflow_7:
    "**Playlist sync** — re-scan a playlist against a local folder to skip already-downloaded videos; generates an `.m3u` playlist file updated as each video downloads",
  feat_workflow_8:
    "**Speed and pacing controls** — cap download bandwidth, add request delays, and tune fragment threads with presets (*Off · Balanced · Careful · Custom*)",
  feat_post_h3: "Subtitles & post-processing",
  feat_post_1:
    "**Subtitles** in SRT, VTT, or ASS — manual or auto-generated, in any available language",
  feat_post_2:
    "Save next to the video, embed into `.mkv`, or organize into a `Subtitles/` subfolder",
  feat_post_3:
    "**SponsorBlock** — skip or chapter-mark sponsors, intros, outros, self-promos",
  feat_post_4:
    "**Embedded metadata** — title, upload date, channel, description, thumbnail, and chapter markers written into the file",
  feat_sites_h3: "YouTube + 2000 sites",
  feat_sites_1:
    "**YouTube, in full** — Videos, Shorts, Channels, Playlists, YouTube Music, and Podcasts handled as first-class sources",
  feat_sites_2:
    "**2000+ other sites** via yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org, and many more",
  feat_sites_3:
    "**Audio-only and subtitles** work across every supported site, not just YouTube",
  feat_sites_4:
    "If a site changes, yt-dlp ships fixes weekly and Arroxy auto-updates the binary on launch",
  shot1_alt: "Paste a URL",
  shot2_alt: "Pick your quality",
  shot3_alt: "Choose where to save",
  shot4_alt: "Download queue in action",
  shot5_alt: "Subtitle language and format picker",
  dl_platform_col: "Platform",
  dl_format_col: "Direct download",
  dl_win_format: "Installer (NSIS) or Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` or `.flatpak` (sandboxed)",
  dl_grab: "All release assets →",
  dl_pkg_h3: "Install via package manager",
  dl_channel_col: "Channel",
  dl_command_col: "Command",
  dl_win_h3: "Windows: Installer vs Portable",
  dl_win_col_installer: "NSIS Installer",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "Installation required",
  dl_win_r1_installer: "Yes",
  dl_win_r1_portable: "No — run from anywhere",
  dl_win_r2: "Auto-updates",
  dl_win_r2_installer: "✅ in-app",
  dl_win_r2_portable: "❌ manual download",
  dl_win_r3: "Startup speed",
  dl_win_r3_installer: "✅ faster",
  dl_win_r3_portable: "⚠️ slower cold start",
  dl_win_r4: "Adds to Start Menu",
  dl_win_r5: "Easy uninstall",
  dl_win_r5_portable: "❌ delete the file",
  dl_win_rec:
    "**Recommendation:** use the NSIS installer for auto-updates and faster startup. Use the portable `.exe` for a no-install, no-registry option.",
  dl_win_smartscreen_h4: "Windows SmartScreen warning",
  dl_win_smartscreen_intro:
    "On first launch you may see **\"Windows protected your PC\"** or **\"Unknown publisher.\"** This applies to both `Arroxy-win-x64-Setup.exe` and `Arroxy-win-x64-Portable.exe`. Arroxy is free and open-source and the Windows builds are not code-signed with a paid certificate, which is why SmartScreen flags them. It does **not** automatically mean Arroxy is unsafe. To continue:",
  dl_win_smartscreen_step1: "Click **More info**.",
  dl_win_smartscreen_step2: "Click **Run anyway**.",
  dl_win_smartscreen_official:
    "Only download Arroxy from the official GitHub Releases page. If you got the file from another website or someone sent it to you, delete it and download a fresh copy from the official source. The source code is public, so you can inspect it or build Arroxy yourself if you prefer.",
  dl_macos_h3: "First-time launch on macOS",
  dl_macos_warning:
    "Arroxy is not yet code-signed, so macOS Gatekeeper will warn you on first launch. This is expected — it's not a sign of damage.",
  dl_macos_m1_h4: "System Settings method (recommended):",
  dl_macos_step1: "Right-click the Arroxy app icon and select **Open**.",
  dl_macos_step2:
    "The warning dialog appears — click **Cancel** (don't click *Move to Trash*).",
  dl_macos_step3: "Open **System Settings → Privacy & Security**.",
  dl_macos_step4:
    'Scroll to the **Security** section. You\'ll see *"Arroxy was blocked from use because it is not from an identified developer."*',
  dl_macos_step5:
    "Click **Open Anyway** and confirm with your password or Touch ID.",
  dl_macos_after:
    "After step 5, Arroxy opens normally and the warning never appears again.",
  dl_macos_m2_h4: "Terminal method (advanced):",
  dl_macos_note:
    "macOS builds are produced via CI on Apple Silicon and Intel runners. If you hit issues, please [open an issue](../../issues) — feedback from macOS users actively shapes the macOS testing cycle.",
  dl_linux_h3: "First-time launch on Linux",
  dl_linux_intro:
    "AppImages run directly — no installation. You just need to mark the file as executable.",
  dl_linux_m1_text:
    "**File manager:** right-click the `.AppImage` → **Properties** → **Permissions** → enable **Allow executing file as program**, then double-click.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "If launch still fails, you may be missing FUSE:",
  dl_linux_flatpak_intro:
    "**Flatpak (sandboxed alternative):** download `Arroxy-linux-x64.flatpak` from the same release page.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "Why you may see a warning",
  dl_warning_p1:
    "Arroxy is open-source and MIT-licensed. The Windows and macOS builds are **not code-signed** — Apple Developer ID and Windows EV code-signing certificates each cost hundreds of dollars per year, which an indie project pays out of pocket. Without those signatures, Windows SmartScreen and macOS Gatekeeper will warn you on first launch. The warnings mean *your OS doesn't recognize the publisher* — they don't mean Arroxy is malware.",
  dl_warning_p2:
    "Three ways to verify Arroxy yourself, in increasing rigor:\n\n- **Read the source.** Every line is on [GitHub](https://github.com/antonio-orionus/Arroxy) and you can [build it from source](#tech).\n- **Check the SHA256.** Match your file against the published [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — see [Verify your download](#verify) below.\n- **Run a third-party scan.** Upload the file to [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Windows first launch",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "If Windows Defender flags or removes the file",
  dl_win_defender_p:
    "Defender heuristics sometimes flag unsigned NSIS installers and Electron portables as suspicious. If Defender quarantines `Arroxy-win-x64-Setup.exe` or `Arroxy-win-x64-Portable.exe`, restore it from **Windows Security → Virus & threat protection → Protection history**, then add the Arroxy executable as an allowed item under **Manage settings → Add or remove exclusions**. As with SmartScreen, the trigger is the missing publisher signature, not detected malware.",

  dl_macos_first_h3: "macOS first launch",
  dl_macos_intro:
    "Arroxy is not yet code-signed for macOS, so Gatekeeper will block the first launch. The exact path to allow it depends on your macOS version — Sequoia 15 tightened the old right-click → Open bypass.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 and later (current)",
  dl_macos_sequoia_intro:
    "On Sequoia 15 and newer, right-click → Open no longer bypasses Gatekeeper for many quarantined apps. Use the System Settings panel instead:",
  dl_macos_sequoia_step1:
    "Drag `Arroxy.app` from the mounted DMG into `/Applications`.",
  dl_macos_sequoia_step2:
    "Double-click Arroxy. The block dialog appears — click **Done** (don't click *Move to Trash*).",
  dl_macos_sequoia_step3:
    'Open **System Settings → Privacy & Security** and scroll to the **Security** section. You\'ll see *"Arroxy was blocked to protect your Mac"* (or a near-identical message).',
  dl_macos_sequoia_step4:
    "Click **Open Anyway**, confirm with your password or Touch ID, then re-launch Arroxy from `/Applications`.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 and earlier",
  dl_macos_sonoma_step1:
    "Drag `Arroxy.app` from the mounted DMG into `/Applications`.",
  dl_macos_sonoma_step2:
    "Right-click (or Control-click) `Arroxy.app` in `/Applications` and choose **Open**.",
  dl_macos_sonoma_step3:
    "The warning dialog now has an **Open** button — click it and confirm. Arroxy opens normally and the warning never appears again.",
  dl_macos_damaged_h4:
    '"App is damaged" or persistent Gatekeeper block — Terminal fix',
  dl_macos_damaged_p:
    'If macOS says *"Arroxy is damaged and can\'t be opened"*, or none of the steps above clear the block, the quarantine attribute on the DMG is the cause (some browsers and macOS\'s own translocation behavior set it). Strip it from the installed app:',
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** on an M-series Mac (M1 / M2 / M3 / M4), download the `arm64` DMG. On Intel Macs, download the `x64` DMG. Running the wrong build still works via Rosetta but is noticeably slower.",

  dl_linux_first_h3: "Linux first launch",
  dl_linux_appimagelauncher:
    "**Optional desktop integration:** install [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) once, and any AppImage you double-click gets registered into your launcher menu automatically — no manual `.desktop` file needed.",

  dl_verify_h3: "Verify your download (SHA256)",
  dl_verify_intro:
    "Every release publishes a `SHA256SUMS` file alongside the binaries. To check that your download wasn't corrupted or tampered with in transit, hash your file locally and match the line in `SHA256SUMS`. Open the latest release page → **Assets** → download `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Want a third-party malware scan? Upload the file at [VirusTotal](https://www.virustotal.com). A handful of generic-heuristic flags from minor engines is normal for unsigned Electron apps; widespread detections from major engines would be a real concern.",

  dl_pm_intro:
    "Already use a package manager? You can skip the manual download path.",

  privacy_p1:
    "Downloads are fetched directly via [yt-dlp](https://github.com/yt-dlp/yt-dlp) from YouTube to the folder you pick — nothing routed through a third-party server. Watch history, download history, URLs, and file contents stay on your device.",
  privacy_p2:
    "Arroxy sends anonymous, aggregate telemetry via [OpenPanel](https://openpanel.dev) — just enough for an indie project to understand launches, OS, app versions, and crashes. No URLs, video titles, file paths, account info, fingerprinting, or personal data. The per-install ID is random and not tied to your identity. You can opt out in Settings.",
  faq_q1: "Is it really free?",
  faq_a1: "Yes — MIT licensed, no premium tier, no feature gating.",
  faq_q2: "What video qualities can I download?",
  faq_a2:
    "Anything YouTube serves: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio-only. 60 fps, 120 fps, and HDR streams are preserved as-is.",
  faq_q3: "Can I extract just the audio as MP3?",
  faq_a3: "Yes. Pick *audio-only* in the format menu and choose MP3, M4A/AAC, Opus, or WAV.",
  faq_q4: "Do I need a YouTube account or cookies?",
  faq_a4:
    "By default, no — Arroxy works without a YouTube account, login, or cookie export. Optional cookie support is available in Advanced settings (Cookies source: file or browser) for content that requires authentication, such as age-restricted or members-only videos. It is off by default. If you enable it, yt-dlp's wiki notes that [cookie-based automation can flag a Google account](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); a throwaway account is the safer choice in that case.",
  faq_q5: "Will it keep working when YouTube changes something?",
  faq_a5:
    "yt-dlp is updated automatically on launch, and Arroxy ships fixes promptly when YouTube changes something. If you ever do hit an issue, optional cookie support is available in Advanced settings as a fallback.",
  faq_q6: "What languages is Arroxy available in?",
  faq_a6:
    "Twenty-one, out of the box: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), हिन्दी (Hindi), Afaan Oromoo, Kiswahili, O'zbekcha (Uzbek), Tiếng Việt (Vietnamese), አማርኛ (Amharic), العربية (Arabic), اردو (Urdu), پښتو (Pashto), বাংলা (Bengali), မြန်မာဘာသာ (Burmese), Ελληνικά (Greek), and Српски (Serbian). Arroxy auto-detects your operating system's language on first launch and you can switch at any time from the language picker in the toolbar. Translations live as plain TypeScript objects in src/shared/i18n/locales/ — open a PR on GitHub to contribute.",
  faq_q7: "Do I need to install anything else?",
  faq_a7:
    "No. yt-dlp is downloaded automatically on first launch and cached on your machine; ffmpeg and ffprobe ship with the app. After that, no extra setup is needed.",
  faq_q8: "Can I download playlists or whole channels?",
  faq_a8:
    "Yes — both. Paste a playlist URL or a channel URL (e.g. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); choose how many entries to scan, then queue the whole list or pick specific videos. Date-range filters are coming soon.",
  faq_q9: 'macOS says "the app is damaged" — what do I do?',
  faq_a9:
    'That\'s macOS Gatekeeper blocking an unsigned app, not actual damage. See ["App is damaged" — Terminal fix](#macos-first-launch) for the one-line `xattr` command that clears it.',
  faq_q10: "Is downloading YouTube videos legal?",
  faq_a10:
    "For personal, private use it is generally accepted in most jurisdictions. You are responsible for complying with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and your local copyright laws.",
  plan_intro: "Still planned — roughly in priority order:",
  plan_col1: "Feature",
  plan_col2: "Description",
  plan_r1_name: "**Playlist & channel filters**",
  plan_r1_desc:
    "Date-range filters when enumerating a playlist or channel",
  plan_r2_name: "**Batch URL input**",
  plan_r2_desc: "Paste multiple URLs at once and run them in one go",
  plan_r4_name: "**Custom filename templates**",
  plan_r4_desc:
    "Name files by title, uploader, date, resolution — with live preview",
  plan_r5_name: "**Scheduled downloads**",
  plan_r5_desc: "Start a queue at a set time (overnight runs)",
  plan_r6_name: "**Speed limits**",
  plan_r6_desc: "Cap bandwidth so downloads don't saturate your connection",
  plan_r7_name: "**Clip trimming**",
  plan_r7_desc: "Download only a segment by start/end time",
  plan_cta:
    "Have a feature in mind? [Open a request](../../issues) — community input shapes priority.",
  tech_content: TECH_CONTENT,
  tos_h2: "Terms of use",
  tos_note:
    "Arroxy is a tool for personal, private use only. You are solely responsible for ensuring your downloads comply with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and the copyright laws of your jurisdiction. Do not use Arroxy to download, reproduce, or distribute content you do not have the right to use. The developers are not liable for any misuse.",
  footer_credit:
    'MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
