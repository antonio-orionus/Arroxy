// Landing-page translations for "en". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const en = {
  title: "Arroxy — Free 4K YouTube Downloader, No Login Required",
  description:
    "Free, MIT-licensed desktop YouTube downloader for Windows, macOS, and Linux. Download videos in up to 4K HDR at 60 fps without a Google account, browser cookies, or any login.",
  og_title: "Arroxy — Free 4K YouTube Downloader, No Login Required",
  og_description:
    "Free 4K YouTube downloader. No cookies, no logins, no broken sessions. MIT-licensed. Windows · macOS · Linux.",

  nav_features: "Features",
  nav_screenshots: "Screenshots",
  nav_install: "Install",
  nav_blog: "Blog",
  nav_download: "Download",

  hero_eyebrow: "Open Source · MIT · Active development",
  hero_h1_a: "Free 4K YouTube downloader.",
  hero_h1_b: "No cookies. No logins. No broken sessions.",
  hero_tagline:
    "Arroxy is a free, MIT-licensed desktop YouTube downloader for Windows, macOS, and Linux. Downloads videos in up to 4K HDR at 60 fps — without ever asking for a Google account, browser cookies, or any login.",
  pill_no_account: "No Google account",
  pill_no_tracking: "No tracking",
  pill_open_source: "Open source (MIT)",
  hero_trust: "Audit every line on GitHub.",
  cta_download_os: "Download for your OS",
  cta_view_github: "View on GitHub",
  release_label: "Latest release:",
  release_loading: "loading…",

  cta_download_windows: "Download for Windows",
  cta_download_windows_portable: "Portable .exe (no install)",
  cta_download_mac_arm: "Download for macOS (Apple Silicon)",
  cta_download_mac_intel: "Intel Mac? Get x64 DMG",
  cta_download_linux_appimage: "Download for Linux (.AppImage)",
  cta_download_linux_flatpak: "Flatpak bundle →",
  cta_other_platforms: "Other platforms / All downloads",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "Installer",
  cta_portable_label: "Portable",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy is a desktop app for Windows, macOS, and Linux.",
  mobile_notice_sub: "Visit this page on your computer to download.",
  mobile_copy_link: "Copy page link",
  first_launch_label: "First-time launch help",
  first_launch_mac_html:
    "macOS shows an <em>unidentified developer</em> warning on first launch — Arroxy isn't yet code-signed. <strong>Right-click the app icon → Open</strong>, then click <strong>Open</strong> in the dialog. Only needed once.",
  first_launch_linux_html:
    "<strong>AppImage:</strong> right-click the file → <strong>Properties → Allow executing as program</strong>, or run <code>chmod +x Arroxy-*.AppImage</code> in a terminal. If launch still fails, install <code>libfuse2</code> (Ubuntu/Debian), <code>fuse-libs</code> (Fedora), or <code>fuse2</code> (Arch).<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code>, then launch from your app menu or run <code>flatpak run io.github.antonio_orionus.Arroxy</code>.",

  features_eyebrow: "What it does",
  features_h2: "Everything you'd expect, none of the friction.",
  features_sub: "Paste a URL, pick a quality, click download. That's it.",
  f1_h: "Up to 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — every resolution YouTube offers, plus audio-only MP3, AAC, and Opus.",
  f2_h: "60 fps & HDR preserved",
  f2_p: "High frame-rate and HDR streams come through exactly as YouTube encodes them — no quality loss.",
  f3_h: "Multiple at once",
  f3_p: "Queue as many videos as you want. The download panel tracks progress for each in parallel.",
  f4_h: "Auto-updates",
  f4_p: "Arroxy keeps yt-dlp and ffmpeg fresh under the hood — works through every YouTube change.",
  f5_h: "9 languages",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — auto-detects yours.",
  f6_h: "Cross-platform",
  f6_p: "Native builds for Windows, macOS, and Linux — installer, portable, DMG, or AppImage.",
  f7_h: "Subtitles, your way",
  f7_p: "Manual or auto-generated captions in SRT, VTT, or ASS — saved beside the video, embedded into a portable .mkv, or tucked into a Subtitles/ folder.",
  f8_h: "SponsorBlock built in",
  f8_p: "Skip or mark sponsor segments, intros, outros, self-promos, and more — cut them with FFmpeg or just add chapters. Your call, per category.",
  f9_h: "Clipboard auto-fill",
  f9_p: "Copy a YouTube link anywhere and Arroxy detects it the moment you switch back — a confirm prompt keeps you in control. Enable or disable in Advanced settings.",
  f10_h: "Auto-clean URLs",
  f10_p: "Tracking parameters (si, pp, feature, utm_*, fbclid, gclid, and more) get stripped from pasted YouTube links automatically, and youtube.com/redirect wrappers are unwrapped — the URL field always shows the canonical link.",
  f11_h: "Hides to tray",
  f11_p: "Closing the window tucks Arroxy into your system tray. Downloads keep running in the background — click the tray icon to bring the window back, or quit from the tray menu.",
  f12_h: "Embedded metadata & art",
  f12_p: "Title, upload date, artist, description, cover art, and chapter markers written right into the file — no sidecar files, no manual tagging.",

  shots_eyebrow: "See it in action",
  shots_h2: "Built for clarity, not clutter.",
  shot1_alt: "Paste a URL",
  shot2_alt: "Pick your quality",
  shot3_alt: "Choose where to save",
  shot4_alt: "Parallel downloads",
  shot5_alt: "Subtitles step — pick languages, format, and save mode",
  og_image_alt: "Arroxy app icon — desktop app for downloading YouTube videos in 4K.",

  privacy_eyebrow: "Privacy",
  privacy_h2_html: "What Arroxy <em>doesn't</em> do.",
  privacy_sub:
    "Most YouTube downloaders eventually ask for your cookies. Arroxy never will.",
  p1_h: "No login",
  p1_p: "No Google account. No sessions to expire. Zero risk of your account getting flagged.",
  p2_h: "No cookies",
  p2_p: "Arroxy requests the same tokens any browser does. Nothing exported, nothing stored.",
  p3_h: "No user IDs",
  p3_p: "Anonymous, session-only telemetry via Aptabase — no install IDs, no fingerprinting, no personal data. Your downloads, history, and files never leave your machine.",
  p4_h: "No third-party servers",
  p4_p: "The whole pipeline runs locally via yt-dlp + ffmpeg. Files never touch a remote server.",

  install_eyebrow: "Install",
  install_h2: "Pick your channel.",
  install_sub:
    "Direct download or any major package manager — all auto-updated each release.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "All",
  winget_desc: "Recommended for Windows 10/11. Auto-updates with the system.",
  scoop_desc: "Portable install via Scoop bucket. No admin rights needed.",
  brew_desc: "Tap the cask, install with one command. Universal binary (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Sandboxed install. Download the .flatpak bundle from Releases, install with one command. No Flathub setup needed.",
  direct_h: "Direct download",
  direct_desc: "NSIS installer, portable .exe, .dmg, .AppImage, or .flatpak — straight from GitHub Releases.",
  direct_btn: "Open Releases →",
  copy_label: "Copy",
  copied_label: "Copied!",

  footer_made_by: "MIT Licensed · Made with care by",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Language:",

  faq_eyebrow: "FAQ",
  faq_h2: "Frequently asked questions",
  faq_q1: "What video qualities can I download?",
  faq_a1:
    "Anything YouTube offers — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p, and audio-only. High frame-rate streams (60 fps, 120 fps) and HDR content are preserved as-is. Arroxy shows you every available format and lets you choose exactly what to grab.",
  faq_q2: "Is it really free?",
  faq_a2: "Yes. MIT licensed. No premium tier, no feature gating.",
  faq_q3: "What languages is Arroxy available in?",
  faq_a3:
    "Nine, out of the box: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), and हिन्दी (Hindi). Arroxy auto-detects your operating system's language on first launch and you can switch at any time from the language picker in the toolbar. Translations live as plain TypeScript objects in src/shared/i18n/locales/ — open a PR on GitHub to contribute.",
  faq_q4: "Do I need to install anything?",
  faq_a4:
    "No. yt-dlp and ffmpeg are downloaded automatically on first launch from their official GitHub releases and cached on your machine. After that, no extra setup is needed.",
  faq_q5: "Will it keep working if YouTube changes something?",
  faq_a5:
    "Yes — and Arroxy has two layers of resilience. First, yt-dlp is one of the most actively maintained open-source tools around — it updates within hours of YouTube changes. Second, Arroxy doesn't rely on cookies or your Google account at all, so there's no session to expire and no credentials to rotate. That combination makes it significantly more stable than tools that depend on exported browser cookies.",
  faq_q6: "Can I download playlists?",
  faq_a6:
    "Single videos are supported today. Playlist and channel support is on the roadmap.",
  faq_q7: "Does it need my YouTube account or cookies?",
  faq_a7:
    "No — and that's a bigger deal than it sounds. Most tools that stop working after a YouTube update tell you to export your browser's YouTube cookies. That workaround breaks every ~30 minutes as YouTube rotates sessions, and yt-dlp's own docs warn it can get your Google account flagged. Arroxy never uses cookies or credentials. No login. No account linked. Nothing to expire, nothing to ban.",
  faq_q8:
    'macOS says "the app is damaged" or "cannot be opened" — what do I do?',
  faq_a8:
    "This is macOS Gatekeeper blocking an unsigned app — not actual damage. The README has step-by-step instructions for the first-time launch on macOS.",
  faq_q9: "Is this legal?",
  faq_a9:
    "Downloading videos for personal use is generally accepted in most jurisdictions. You are responsible for complying with YouTube's Terms of Service and your local laws.",
};
