const TECH_CONTENT = `<details>
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
| Node.js | 24.21.0 | \`mise install\` or \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` or \`package.json\` \`packageManager\` |

Recommended: install \`mise\`, then run \`mise install\` in the checkout. Without mise, manually activate Node.js from \`.node-version\` and Bun from \`package.json\` before \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools and Python may be needed for native rebuilds.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

After cloning, run \`mise trust && mise install\` from the checkout. If your shell already uses \`fnm\`, \`nvm\`, or a Homebrew Bun, activate mise in \`~/.zshrc\` so Arroxy gets Node.js 24.21.0 and Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clone & run

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Build a distributable

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` installs dependencies, rebuilds Electron app dependencies, verifies Electron, prepares embedded ffmpeg/ffprobe for development, and installs Playwright Chromium. Release builds manage yt-dlp, ffmpeg and ffprobe at runtime in your app data folder; none of them ship inside the installer.

</details>`;

export const en = {
  icon_alt: "Arroxy mascot",
  title:
    "Arroxy — Free Open-Source YouTube (+ 2000 sites) Downloader with a Built-in Browser, for Windows, macOS & Linux",
  read_in_label: "Read in:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "License",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Languages",
  badge_website_alt: "Website",
  discord_badge_text: "Join the Discord Community",
  discord_badge_encoded: "Join%20the%20Discord%20Community",
  hero_desc:
    "Download videos, Shorts, music, channels, podcasts, or audio tracks from **YouTube and 2000+ supported sites** — up to 8K HDR at 60 fps, as MP3 / AAC / Opus, or just the part you need. **Browse YouTube or any other site inside Arroxy** in the Explore tab and download the video, playlist, or channel you're on; sign in there to download private, members-only, and age-restricted videos your account can watch. Runs locally on Windows, macOS, and Linux. **No ads, no bloat, no upsells.**",
  cta_latest: "↓ Install Latest Release",
  cta_website: "Website",
  star_cta: "If Arroxy saves you time, a ⭐ helps others find it.",
  ai_notice: "",
  toc_heading: "Contents",
  why_h2: "Why Arroxy",
  features_h2: "Features",
  dl_h2: "Install and first launch",
  privacy_h2: "Privacy",
  faq_h2: "FAQ",
  roadmap_h2: "Roadmap",
  tech_h2: "Built with",
  why_intro: "A side-by-side comparison with the most common alternatives:",
  why_r1: "Free, no premium tier",
  why_r2: "Open source",
  why_r3: "Local processing only",
  why_r5: "No usage caps",
  why_r6: "Cross-platform desktop app",
  why_r7: "Subtitles + SponsorBlock",
  why_r8: "Built-in browser (browse, sign in, download)",
  why_r9: "Private, members-only & age-restricted videos without exporting cookies",
  why_table_note:
    "⚠️ = partly, or only on a paid tier. 4K Video Downloader's in-app sign-in for private videos is a paid feature; most free yt-dlp GUIs only accept a cookies file or read your web browser's cookies.",
  why_summary:
    "Arroxy is built for one thing: a clean local file, whether you paste a URL or find the video in Explore. No upsells, no data collection.",
  why_explore_h3: "What a plain yt-dlp wrapper can't do: the Explore tab",
  why_explore_intro:
    "Most free YouTube downloaders are a URL box on top of yt-dlp. Arroxy uses yt-dlp too, but it also has **Explore**, a browser built into the app that opens YouTube or any other site. Explore gets past limits that a URL box can't:",
  why_explore_1:
    "**Videos that need an account, without exporting cookies** — private, members-only, and age-restricted videos (on an age-verified account), plus your Watch Later and Liked lists, and videos behind a sign-in on other sites. A plain wrapper needs a cookies.txt export or must read your web browser's cookies, which Chrome on Windows now blocks. In Arroxy you sign in once in Explore and it does the rest",
  why_explore_2:
    "**\"Sign in to confirm you're not a bot\"** — when YouTube asks this, Arroxy tries the download again with your Explore sign-in instead of failing",
  why_explore_3:
    "**YouTube's download token** — Arroxy's built-in browser gets the token YouTube expects before a download. Without it, YouTube can serve fewer formats and lower quality than you asked for",
  why_explore_4:
    "**No copying links** — find a video, playlist, or channel in Explore and download it with one click, or right-click any link on the page",
  why_explore_5:
    "**Ad blocker when you want it** — one click on the shield blocks ads and trackers on Explore's pages",
  feat_explore_h3: "Explore: browse the web inside Arroxy",
  feat_explore_1:
    "**Explore tab** — browse YouTube or any other site inside Arroxy and download what you find without copying links. **Download · *your profile*** queues the video, playlist, or channel you're looking at; the arrow next to it switches profiles, and the wand opens the step-by-step download for picking formats, subtitles, and more",
  feat_explore_6:
    "**Right-click to download** — right-click any video, playlist, or channel link in Explore to download it with your profile, pick another profile from **Download with**, open the step-by-step download, or copy the link. No need to open each video first",
  feat_explore_7:
    "**Compact layout** — one click in Explore's toolbar moves Arroxy's tabs into it and gives the page more room",
  feat_explore_2:
    "**Address bar** — type to search YouTube, or enter any web address to open that site",
  feat_explore_3:
    "**Downloads that need an account** — sign in once in Explore and Arroxy can download private and members-only videos your account can watch, age-restricted videos if the account is age-verified, and your Watch Later and Liked lists. Sign in to other sites there too, and their downloads use that sign-in when they need it. Arroxy still downloads signed out first and only uses your Explore sign-in when a download fails in a way an account can fix. When YouTube asks you to confirm you're not a bot, Arroxy also tries your Explore sign-in",
  feat_explore_4:
    "**Use a secondary account** — Explore's first screen explains why: downloading with an account carries some risk of that account being restricted. Sign out of Explore from Settings whenever you want to forget your sign-ins",
  feat_explore_5:
    "**Ad blocker** — off by default. One click on the shield in Explore's toolbar blocks ads and trackers on its pages, without affecting downloads. YouTube may push back on ad blockers for signed-in accounts",
  feat_quality_h3: "Quality & formats",
  feat_quality_1: "Up to **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**High frame rate and HDR** preserved as-is — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — export audio-only as MP3, M4A/AAC, Opus, or WAV. In interactive downloads, pick the source's native surround/Dolby tracks (AC-3, E-AC-3, 5.1, DRC) when available, or set a global **Prefer surround / Dolby** default",
  feat_quality_4:
    "**Profiles with a goal** — *Best picture* (AV1 · VP9) or *Smart TV* (MP4 · H.264), saved as Auto, MP4, MKV, or WebM without re-encoding. HDR is *Auto* (only when your screen can show it), *SDR*, or *HDR*",
  feat_quality_5:
    "**Every codec at every resolution** — the step-by-step download lists AV1, VP9 and H.264 side by side at each resolution, so you can pick the one your TV or editor plays",
  feat_quality_6:
    "**Know what a stream really is** — sizes YouTube upscaled with AI, AI-dubbed audio languages, enhanced-bitrate streams, 360° videos and damaged or watermarked copies are marked. Profiles skip AI-upscaled streams unless you allow them",
  feat_privacy_h3: "Privacy & control",
  feat_privacy_1:
    "100% local processing — downloads go straight from YouTube to your disk",
  feat_privacy_2: "**Open source** — every line auditable, MIT licensed",
  feat_privacy_3: "Files saved straight to the folder you choose",
  feat_workflow_h3: "Workflow",
  feat_workflow_12:
    "**Global download hotkey** — copy a link in any app and press `Ctrl+Shift+D` (`Cmd+Shift+D` on macOS); Arroxy queues it with your active profile without opening the window, and a notification confirms it. On by default, rebindable",
  feat_workflow_1:
    "**Flexible start modes** — choose a guided single download, playlist/channel picker, bulk URL paste, Quick Download with saved defaults, or browse and download from Explore",
  feat_workflow_2:
    "**Central download queue** — every single, playlist, bulk, or quick job lands in one place for progress, pause, resume, cancel, retry, and priority control",
  feat_workflow_3:
    "**Clipboard watch** — copy a video link and it fills the URL field when you come back to Arroxy, with **Undo** if you didn't mean it. While Arroxy is busy, the link waits until you are back on the URL tab (turn it off in Settings)",
  feat_workflow_4:
    "**Auto-clean URLs** — strips tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) and unwraps `youtube.com/redirect` links",
  feat_workflow_5:
    "**Tray mode** — closing the window keeps downloads running in the background",
  feat_workflow_6:
    "**{{LANG_COUNT}} languages** — auto-detects system locale, switchable any time",
  feat_workflow_7:
    "**Playlist sync** — re-scan a playlist against a local folder to skip already-downloaded videos; generates an `.m3u` playlist file updated as each video downloads",
  feat_workflow_8:
    "**Speed and pacing controls** — cap download bandwidth, set how many parts of a video download at once, and add request delays with presets (*Off · Balanced · Careful · Custom*)",
  feat_workflow_9:
    "**Filename templates** — name downloads your way with `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}`, and `{playlist_index}`, globally or per download profile",
  feat_workflow_10:
    "**Downloads at once and automatic retry** — choose how many queued downloads run at the same time, and let Arroxy retry a download that hit a network or server problem, waiting longer before each attempt",
  feat_workflow_11:
    "**Per-item playlist profiles** — assign each video in a playlist its own download profile instead of one setting for the whole list, so a single pass can archive some at full quality and grab the rest as MP3",
  feat_workflow_13:
    "**Quick Download works in the background** — the link shows up in Downloads right away and prepares there, a note with **View** confirms it, and the URL field clears for the next link. Start as many as you like while earlier ones prepare",
  feat_workflow_14:
    "**Downloads tells you what needs you** — if Arroxy can't read a link, its row says why and offers the fix: Retry, turn on cookies, or sign in in Explore. With cookies off, **Sign in with Explore** retries it for you once you're signed in. A playlist longer than your load limit waits on its row for you to pick all of it, the first ones, or a review. The Downloads tab counts the rows waiting for you",
  feat_workflow_15:
    "**Download just part of a video** — pick a start and end, or a chapter, on the Format screen and Arroxy saves only that range, named with the range after the video id. Cuts land on the nearest keyframe; turn on exact cut to re-encode instead",
  feat_workflow_16:
    "**Remove finished downloads** — optional: a finished download leaves the list 5 seconds later. Its files stay on disk, and failed downloads stay listed",
  feat_workflow_17:
    "**Size and Missing in Downloads** — a sortable **Size** column shows how much space each download takes, and **Missing** flags files moved or deleted outside Arroxy",
  feat_workflow_18:
    "**Aurora or Minimal, dark or light** — glass panels over a moving sky, or quiet solid surfaces; switch from the footer. Computers without graphics acceleration get Minimal automatically",
  feat_workflow_19:
    "**Mac menu bar** — on macOS, open Settings (`Cmd+,`), set the download speed limit, switch style and theme, and open logs or save a diagnostics file from the menu bar",
  feat_workflow_20:
    "**Change a profile from any download** — tweak a download, then update the profile it started from (with a preview of what changes) or save the settings as a new profile. Switching profile asks whether to keep your edits",
  feat_post_h3: "Subtitles & post-processing",
  feat_post_1:
    "**Subtitles** in SRT, VTT, or ASS — manual or auto-generated, in any available language",
  feat_post_2:
    "Save next to the video, embed into `.mkv`, or organize into a `Subtitles/` subfolder",
  feat_post_3:
    "**SponsorBlock** — skip or chapter-mark sponsors, intros, outros, self-promos",
  feat_post_4:
    "**Embedded metadata** — title, upload date, channel, description, thumbnail, and chapter markers written into the file",
  feat_post_5:
    "**Subtitles-only batches** — paste a list of URLs or open a playlist, pick Subtitles, and get only the caption files for every video",
  feat_sites_h3: "YouTube + 2000 sites",
  feat_sites_1:
    "**YouTube, in full** — Videos, Shorts, Channels, Playlists, YouTube Music, and Podcasts handled as first-class sources",
  feat_sites_2:
    "**2000+ other sites** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable, and many more",
  feat_sites_3:
    "**Audio-only and subtitles** work across every supported site, not just YouTube",
  feat_sites_4:
    "If a site changes, yt-dlp ships fixes weekly and Arroxy auto-updates the binary on launch",
  shot1_cap:
    "<b>Quick Download home</b><br/>Paste a URL and pull it instantly with your active profile",
  shot2_cap:
    "<b>Reusable download profiles</b><br/>Save format, quality, and output presets — reuse per download",
  shot3_cap:
    "<b>Multi-language audio tracks</b><br/>Pick the exact audio language a video ships",
  shot4_cap:
    "<b>Surround / Dolby audio</b><br/>5.1 and Dolby tracks detected and preserved",
  shot5_cap:
    "<b>Bulk URL mode</b><br/>Paste a list, auto-dedupe, queue them all at once",
  shot6_cap:
    "<b>Parallel download queue</b><br/>Several downloads at once with live progress",
  hotkey_fig_alt:
    "Arroxy global download hotkey — Ctrl+Shift+D on Windows and Linux, Cmd+Shift+D on macOS, sending the copied link straight into the download queue",
  hotkey_fig_cap:
    "<b>Global download hotkey</b><br/>Copy a link anywhere, press once — it lands in the queue and starts downloading",
  shot7_cap: "<b>Per-item playlist profiles</b><br/>Give each video its own profile — archive some in 4K, grab the rest as MP3",
  shot8_cap:
    "<b>Explore</b><br/>Browse YouTube or any other site inside Arroxy and download the page you're on with your active profile",
  shot9_cap:
    "<b>Explore's first screen</b><br/>A quick look at Explore, and why a secondary account is the safer sign-in",
  shot10_cap:
    "<b>Downloads tells you what needs you</b><br/>Links prepare in the background; a failed one offers its fix, a long playlist waits for your choice",
  shot11_cap:
    "<b>Download just part of a video</b><br/>Pick a start and end, or a chapter — Arroxy saves only that range",
  shot12_cap:
    "<b>Profile editor</b><br/>Tune a profile: file type, resolution, subtitles, destination, filename template and more",
  shot13_cap:
    "<b>Dark or light, glass or solid</b><br/>Four looks to choose from: glass panels over a moving sky or quiet solid surfaces, each in dark and light",
  dl_platform_col: "Platform",
  dl_format_col: "Direct download",
  dl_oneline_note:
    "Builds are x86_64 only. No `curl`? Swap `curl -fsSL` for `wget -qO-`.",
  dl_win_scoop:
    "Prefer Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
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
    'On first launch you may see **"Windows protected your PC"** or **"Unknown publisher."** This applies to both `Arroxy-win-x64-Setup.exe` and `Arroxy-win-x64-Portable.exe`. Arroxy is free and open-source and the Windows builds are not code-signed with a paid certificate, which is why SmartScreen flags them. It does **not** automatically mean Arroxy is unsafe. To continue:',
  dl_win_smartscreen_step1: "Click **More info**.",
  dl_win_smartscreen_step2: "Click **Run anyway**.",
  dl_win_smartscreen_official:
    "Only download Arroxy from the official GitHub Releases page. If you got the file from another website or someone sent it to you, delete it and download a fresh copy from the official source. The source code is public, so you can inspect it or build Arroxy yourself if you prefer.",
  dl_macos_h3: "First-time launch on macOS",
  dl_macos_warning:
    "Arroxy is not yet code-signed, so macOS Gatekeeper can show the damaged-app warning on first launch. This is expected — it's not a sign of actual file damage.",
  dl_macos_m1_h4: "Terminal method:",
  dl_macos_step1: "Drag `Arroxy.app` from the mounted DMG into `/Applications`.",
  dl_macos_step2:
    "Open Terminal and run `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Run `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "If the app path is different, replace `/Applications/Arroxy.app` with the path you installed.",
  dl_macos_step5:
    "Enter your Mac password if `sudo` asks for it.",
  dl_macos_after:
    "After quarantine is removed, Arroxy opens normally.",
  dl_macos_m2_h4: "Terminal method:",
  dl_macos_note:
    "macOS builds are produced via CI on Apple Silicon and Intel runners. If you hit issues, please [open an issue](../../issues) — feedback from macOS users actively shapes the macOS testing cycle.",
  dl_linux_h3: "First-time launch on Linux",
  dl_linux_intro:
    "AppImages run directly — no installation. You just need to mark the file as executable.",
  dl_linux_m1_text:
    "**File manager:** right-click the `.AppImage` → **Properties** → **Permissions** → enable **Allow executing file as program**, then double-click.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "If launch still fails, run it without mounting — no FUSE package needed:",
  dl_linux_targz_h4: "Plain tarball (no FUSE, no install):",
  dl_linux_targz_text: "The `.tar.gz` build is the same app without the AppImage wrapper — extract it anywhere and run it. No installer and no FUSE package needed.",
  dl_linux_arch_note: "**The Linux downloads on the release page are x86_64 only.** On ARM64 machines (Raspberry Pi, Asahi Linux) the Flatpak still installs, then fails at launch with `bwrap: execvp ldconfig: Exec format error`.",
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
    "Arroxy's macOS builds are ad-hoc signed but not notarized by Apple, so Gatekeeper blocks the first launch with *\"Arroxy.app\" Not Opened — Apple could not verify \"Arroxy.app\" is free of malware*. That means macOS cannot check the app with Apple, not that anything is wrong with the files. Installing with Homebrew avoids this dialog entirely. If you used the DMG, one Terminal command clears it:",
  dl_macos_sequoia_h4: "Terminal fix for current macOS",
  dl_macos_sequoia_intro:
    "Use Terminal after copying Arroxy to Applications:",
  dl_macos_sequoia_step1:
    "Drag `Arroxy.app` from the mounted DMG into `/Applications`.",
  dl_macos_sequoia_step2:
    "Open Terminal and run these two commands:",
  dl_macos_sequoia_step3:
    "Run `open /Applications/Arroxy.app` to launch Arroxy.",
  dl_macos_sequoia_step4:
    "If the app path is different, replace `/Applications/Arroxy.app` with the path you installed.",
  dl_macos_sonoma_h4: "Terminal fix for older macOS",
  dl_macos_sonoma_step1:
    "Drag `Arroxy.app` from the mounted DMG into `/Applications`.",
  dl_macos_sonoma_step2:
    "Open Terminal and remove quarantine from `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Launch Arroxy from Terminal or Finder after quarantine is removed.",
  dl_macos_damaged_h4:
    "Gatekeeper quarantine fix",
  dl_macos_damaged_p:
    "The first command removes the quarantine attribute macOS attached when the file was downloaded; the second launches the app. You normally do not need `sudo`, because the copy in `/Applications` belongs to you — add it only if you get a permissions error.",
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
    "Prefer a different channel? These work too, and they stay in step with every release.",

  privacy_p1:
    "Downloads are fetched directly via [yt-dlp](https://github.com/yt-dlp/yt-dlp) from YouTube to the folder you pick — nothing routed through a third-party server. Watch history, download history, URLs, and file contents stay on your device.",
  privacy_p2:
    "No telemetry — just one anonymous heartbeat a day: app version, OS, language, install channel and country, so we can count active users. No IDs, URLs, video titles, file paths or account info. You can turn it off in Settings.",
  privacy_p3:
    "Explore keeps its own sign-ins, separate from your browser, and Arroxy never reads or fills in a sign-in form — you type into the site's own page. Downloads run signed out; only when one fails in a way an account can fix does Arroxy read the sign-in fresh, keep it in a temporary file for that download, and delete the file afterwards. Signing out of Explore in Settings forgets them.",
  faq_q1: "Is it really free?",
  faq_a1: "Yes — MIT licensed, no premium tier, no feature gating.",
  faq_q11: "How is Arroxy different from other yt-dlp GUIs?",
  faq_a11:
    "Most free yt-dlp GUIs are wrappers that only take a link. Arroxy adds **Explore**, a browser built into the app that opens YouTube or any other site: you browse and download without copying links, and you sign in there once to download private, members-only, and age-restricted videos and your Watch Later and Liked lists, with no cookie export. Arroxy uses that sign-in when YouTube asks you to confirm you're not a bot, and its built-in browser gets YouTube's download token so downloads don't fall back to fewer formats. See [Why Arroxy](#why).",
  faq_q2: "What video qualities can I download?",
  faq_a2:
    "Anything YouTube serves: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio-only. 60 fps and HDR streams are preserved as-is, and the step-by-step download lets you pick AV1, VP9 or H.264 at each resolution.",
  faq_q3: "Can I extract just the audio as MP3?",
  faq_a3:
    "Yes. Pick *audio-only* in the format menu and choose MP3, M4A/AAC, Opus, or WAV.",
  faq_q4: "How do I download videos that need a YouTube account?",
  faq_a4:
    "Sign in once in the Explore tab. Arroxy can then download private and members-only videos your account can watch, age-restricted videos if the account is age-verified, and your Watch Later and Liked lists. It uses the sign-in only when a download fails in a way an account can fix; everything else downloads as before. This is the **Explore sign-in** choice, listed first and marked Recommended in the cookie settings, and Arroxy picks it for you the first time you open Explore. yt-dlp's wiki notes that [signed-in automation can flag a Google account](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), so a secondary account is the safer choice.",
  faq_q5: "Will it keep working when YouTube changes something?",
  faq_a5:
    "yt-dlp is updated automatically on launch, and Arroxy ships fixes promptly when YouTube changes something. When YouTube asks you to confirm you're not a bot, Arroxy also tries your Explore sign-in if you've signed in there, and cookies from a file or your browser are available in the cookie settings.",
  faq_q6: "What languages is Arroxy available in?",
  faq_a6:
    "{{LANG_COUNT}} languages, out of the box: {{LANG_NAME_LIST}}. Arroxy auto-detects your operating system's language on first launch and you can switch at any time from the language picker in the toolbar. Runtime locale JSON lives in src/shared/i18n/locales/, and translator-facing PO catalogs live in i18n/locales/ — open a PR on GitHub to contribute.",
  faq_q7: "Do I need to install anything else?",
  faq_a7:
    "No. yt-dlp, ffmpeg and ffprobe are downloaded automatically on first launch and cached on your machine. After that, no extra setup is needed.",
  faq_q8: "Can I download playlists or whole channels?",
  faq_a8:
    "Yes — both. Paste a playlist URL or a channel URL (e.g. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); choose how many entries to scan, then queue the whole list or pick specific videos. Date-range filters are coming soon.",
  faq_q9: 'macOS says "the app is damaged" — what do I do?',
  faq_a9:
    'That\'s macOS Gatekeeper blocking an unsigned app, not actual damage. See [macOS first launch](#macos-first-launch) for the Terminal commands that clear quarantine and launch Arroxy.',
  faq_q10: "Is downloading YouTube videos legal?",
  faq_a10:
    "For personal, private use it is generally accepted in most jurisdictions. You are responsible for complying with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and your local copyright laws.",
  plan_intro: "Still planned — roughly in priority order:",
  plan_col1: "Feature",
  plan_col2: "Description",
  plan_r1_name: "**Playlist & channel filters**",
  plan_r1_desc: "Date-range filters when enumerating a playlist or channel",
  plan_r2_name: "**YouTube audio track preferences**",
  plan_r2_desc:
    "Set an app-wide spoken-language track preference, with per-profile overrides when YouTube offers multiple audio tracks",
  plan_r3_name: "**Stronger retry recovery**",
  plan_r3_desc:
    "A new retry path for downloads interrupted by unreliable or problematic internet connections",
  plan_r4_name: "**Full download manager drawer**",
  plan_r4_desc:
    "Turn the queue drawer into a fuller manager, including changing destination folders for queued items",
  plan_r5_name: "**Scheduled downloads**",
  plan_r5_desc: "Start a queue at a set time (overnight runs)",
  plan_r9_name: "**AUR package**",
  plan_r9_desc: "Install on Arch Linux and Omarchy with `yay -S arroxy-bin`",
  plan_cta:
    "Have a feature in mind? [Open a request](../../issues) — community input shapes priority.",
  tech_content: TECH_CONTENT,
  support_h2: "Support Arroxy",
  support_note: "Arroxy is free and MIT-licensed — no ads, no telemetry, no paid tier. If it saves you time, you can support development with Bitcoin, Tron or Ethereum: the addresses are in [DONATE.md](DONATE.md), which is the only official source for them. Arroxy will never send you an address by email or direct message. Starring the repo, reporting bugs, and improving translations help just as much.",
  tos_h2: "Terms of use",
  tos_note:
    "Arroxy is a tool for personal, private use only. You are solely responsible for ensuring your downloads comply with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and the copyright laws of your jurisdiction. Do not use Arroxy to download, reproduce, or distribute content you do not have the right to use. The developers are not liable for any misuse.",
  footer_credit:
    'MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
