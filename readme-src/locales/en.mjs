const TECH_CONTENT = `<details>
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

> yt-dlp and ffmpeg are not bundled — they're fetched from GitHub on first launch and cached in your app data folder.

</details>`;

export const en = {
  icon_alt: "Arroxy mascot",
  title: "Arroxy — Free Open-Source YouTube Downloader for Windows, macOS & Linux",
  read_in_label: "Read in:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "License",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Languages",
  badge_website_alt: "Website",
  hero_desc:
    "Download any YouTube video, Short, or audio track in original quality — up to 4K HDR at 60 fps, or as MP3 / AAC / Opus. Runs locally on Windows, macOS, and Linux. **No ads, no login, no browser cookies, no Google account linked.**",
  cta_latest: "↓ Download Latest Release",
  cta_website: "Website",
  demo_alt: "Arroxy demo",
  star_cta: "If Arroxy saves you time, a ⭐ helps others find it.",
  ai_notice: "",
  toc_heading: "Contents",
  why_h2: "Why Arroxy",
  nocookies_h2: "No cookies, no logins, no account linking",
  features_h2: "Features",
  dl_h2: "Download",
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
  nocookies_intro:
    "This is the most common reason desktop YouTube downloaders break — and the main reason Arroxy exists.",
  nocookies_setup:
    "When YouTube updates its bot detection, most tools tell you to export your browser's YouTube cookies as a workaround. Two problems with that:",
  nocookies_p1:
    "Exported sessions typically expire within ~30 minutes, so you re-export constantly.",
  nocookies_p2:
    "yt-dlp's own documentation [warns that cookie-based automation can flag your Google account](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy never asks for cookies, logins, or any credential.** It uses only the public tokens YouTube serves to any browser. Nothing tied to your Google identity, nothing to expire, nothing to rotate.",
  feat_quality_h3: "Quality & formats",
  feat_quality_1: "Up to **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**High frame rate** preserved as-is — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Audio-only** export to MP3, AAC, or Opus",
  feat_quality_4: "Quick presets: *Best quality* · *Balanced* · *Small file*",
  feat_privacy_h3: "Privacy & control",
  feat_privacy_1:
    "100% local processing — downloads go straight from YouTube to your disk",
  feat_privacy_2: "No login, no cookies, no Google account linked",
  feat_privacy_3: "Files saved straight to the folder you choose",
  feat_workflow_h3: "Workflow",
  feat_workflow_1:
    "**Paste any YouTube URL** — videos and Shorts both supported",
  feat_workflow_2:
    "**Multi-download queue** — track several downloads in parallel",
  feat_workflow_3:
    "**Clipboard watch** — copy a YouTube link and Arroxy auto-fills the URL when you refocus the app (toggle in Advanced settings)",
  feat_workflow_4:
    "**Auto-clean URLs** — strips tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) and unwraps `youtube.com/redirect` links",
  feat_workflow_5:
    "**Tray mode** — closing the window keeps downloads running in the background",
  feat_workflow_6:
    "**9 languages** — auto-detects system locale, switchable any time",
  feat_post_h3: "Subtitles & post-processing",
  feat_post_1:
    "**Subtitles** in SRT, VTT, or ASS — manual or auto-generated, in any available language",
  feat_post_2:
    "Save next to the video, embed into `.mkv`, or organize into a `Subtitles/` subfolder",
  feat_post_3:
    "**SponsorBlock** — skip or chapter-mark sponsors, intros, outros, self-promos",
  feat_post_4:
    "**Embedded metadata** — title, upload date, channel, description, thumbnail, and chapter markers written into the file",
  shot1_alt: "Paste a URL",
  shot2_alt: "Pick your quality",
  shot3_alt: "Choose where to save",
  shot4_alt: "Download queue in action",
  shot5_alt: "Subtitle language and format picker",
  dl_platform_col: "Platform",
  dl_format_col: "Format",
  dl_win_format: "Installer (NSIS) or Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` or `.flatpak` (sandboxed)",
  dl_grab: "Grab the latest release →",
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
    "**Flatpak (sandboxed alternative):** download `Arroxy-*.flatpak` from the same release page.",
  privacy_p1:
    "Downloads are fetched directly via [yt-dlp](https://github.com/yt-dlp/yt-dlp) from YouTube to the folder you pick — nothing routed through a third-party server. Watch history, download history, URLs, and file contents stay on your device.",
  privacy_p2:
    "Arroxy sends anonymous, aggregate telemetry via [Aptabase](https://aptabase.com) — just enough for an indie project to see whether anyone is actually using it (launches, OS, app version, crashes). No URLs, no video titles, no file paths, no IPs, no account info — Aptabase is open-source and GDPR-friendly by design. You can opt out in Settings.",
  faq_q1: "Is it really free?",
  faq_a1: "Yes — MIT licensed, no premium tier, no feature gating.",
  faq_q2: "What video qualities can I download?",
  faq_a2:
    "Anything YouTube serves: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio-only. 60 fps, 120 fps, and HDR streams are preserved as-is.",
  faq_q3: "Can I extract just the audio as MP3?",
  faq_a3: "Yes. Pick *audio-only* in the format menu and choose MP3, AAC, or Opus.",
  faq_q4: "Do I need a YouTube account or cookies?",
  faq_a4:
    "No. Arroxy uses only the public tokens YouTube serves to any browser. No cookies, no login, no credentials stored. See [No cookies, no logins, no account linking](#no-cookies) for why this matters.",
  faq_q5: "Will it keep working when YouTube changes something?",
  faq_a5:
    "Two layers of resilience: yt-dlp updates within hours of YouTube changes, and Arroxy doesn't rely on cookies that expire every ~30 minutes. That makes it noticeably more stable than tools that depend on exported browser sessions.",
  faq_q6: "What languages is Arroxy available in?",
  faq_a6:
    "Nine: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Auto-detects your system language; switch any time from the toolbar. Locale files are plain TypeScript objects in `src/shared/i18n/locales/` — [PRs welcome](../../pulls).",
  faq_q7: "Do I need to install anything else?",
  faq_a7:
    "No. yt-dlp and ffmpeg are downloaded automatically on first launch from their official GitHub releases and cached locally.",
  faq_q8: "Can I download playlists or whole channels?",
  faq_a8:
    "Single videos and Shorts today. Playlist and channel support are on the [roadmap](#roadmap).",
  faq_q9: 'macOS says "the app is damaged" — what do I do?',
  faq_a9:
    "That's macOS Gatekeeper blocking an unsigned app, not actual damage. See the [first-time launch on macOS](#download) section for the fix.",
  faq_q10: "Is downloading YouTube videos legal?",
  faq_a10:
    "For personal, private use it is generally accepted in most jurisdictions. You are responsible for complying with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and your local copyright laws.",
  plan_intro: "Coming up — roughly in priority order:",
  plan_col1: "Feature",
  plan_col2: "Description",
  plan_r1_name: "**Playlist & channel downloads**",
  plan_r1_desc:
    "Paste a playlist or channel URL; queue all videos with date or count filters",
  plan_r2_name: "**Batch URL input**",
  plan_r2_desc: "Paste multiple URLs at once and run them in one go",
  plan_r3_name: "**Format conversion**",
  plan_r3_desc: "Convert downloads to MP3, WAV, FLAC without a separate tool",
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
