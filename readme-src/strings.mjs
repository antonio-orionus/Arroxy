// Localized strings for README generation.
//
// Edit these — then run `node readme-src/build.mjs` to regenerate every
// README.{code}.md from readme-src/template.md.
//
// Add or rename a key in `en` first; build.mjs will fail loudly if any other
// locale is missing or has extra keys.

const TECH_CONTENT_EN = `<details>
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

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

No extra native build tools needed — the project has no native Node addons.

---

### macOS

Install Xcode Command Line Tools (required by electron-builder):

\`\`\`bash
xcode-select --install
\`\`\`

Install Bun:

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

---

### Linux (Ubuntu / Debian)

Install Bun:

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

Electron runtime dependencies (needed to _run_ the app, not just build):

\`\`\`bash
sudo apt install -y libgtk-3-0 libnss3 libasound2t64
\`\`\`

For end-to-end tests only (Electron needs a display):

\`\`\`bash
sudo apt install -y xvfb
\`\`\`

---

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

> **Note:** yt-dlp and ffmpeg are not bundled in the installer — they are downloaded automatically from GitHub on first launch and cached in your app data folder.

</details>`;

const techStub = (label) =>
  `For technical details, build-from-source instructions, per-platform prerequisites, and contribution notes, see the [English README](README.md#tech).`;

const en = {
  icon_alt: "Arroxy mascot",
  title: "Arroxy — Free Open-Source YouTube Downloader",
  read_in_label: "Read in:",
  badge_release_alt: "Release",
  badge_lastcommit_alt: "Last commit",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Languages",
  badge_license_alt: "License",
  hero_bold: "Tired of YouTube ads ruining your videos?",
  hero_tagline:
    "Download any video or Short in full quality — 4K, 1080p60, HDR, and beyond. Fast, free, and 100% yours.",
  hero_nopes: "No ads. No tracking. No cookies. No login. No nonsense.",
  cta_latest: "Latest Release →",
  demo_alt: "Arroxy demo",
  ai_notice: "",
  toc_heading: "Contents",
  why_h2: "Why Arroxy?",
  what_h2: "What it does",
  plan_h2: "Planned features",
  dl_h2: "Download",
  dl_win_h3: "Windows: Installer vs Portable",
  dl_macos_h3: "First-Time Launch on macOS",
  dl_linux_h3: "First-Time Launch on Linux",
  privacy_h2: "Privacy",
  faq_h2: "Frequently asked questions",
  tech_h2: "Tech details",
  why_col2: "Browser extensions",
  why_col3: "Online converters",
  why_col4: "Other downloaders",
  why_r1: "Free forever",
  why_r2: "No ads",
  why_r3: "No account needed",
  why_r4: "Works offline _(kind of)_",
  why_r5: "Your files stay local",
  why_r6: "No usage caps",
  why_r7: "Open source",
  why_r8: "No login or cookies ever",
  why_r9: "No Google account ban risk",
  why_offline_note:
    '_"Works offline" means no conversion happens on someone else\'s server — the whole pipeline runs on your machine. You still need internet to reach YouTube. Yes, we know._',
  why_cookies_note:
    "**Why this matters:** Most desktop YouTube downloaders eventually ask you to export your browser cookies when YouTube updates its bot detection. Those sessions expire every ~30 minutes — and yt-dlp itself warns that cookie-based automation can trigger a Google account ban. Arroxy never asks for cookies, login, or any credentials. It requests the same tokens YouTube issues to any real browser — zero account risk, no expiry.",
  why_summary:
    "Arroxy is a **free, open-source, privacy-first** desktop app — built for people who want simplicity without the bloat. Your downloads never touch a third-party server. Zero telemetry, zero data collection. Just paste a URL and go.",
  what_1:
    "**Paste any YouTube URL** — videos, Shorts, anything — Arroxy fetches all available formats in seconds",
  what_2:
    "**Pick your quality** — up to 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps and higher frame rates supported, audio-only (MP3/AAC/Opus), or use a quick preset (Best quality / Balanced / Small file)",
  what_3:
    "**Full high-frame-rate support** — 60 fps, 120 fps, and HDR streams are preserved exactly as YouTube encodes them",
  what_4:
    "**Choose where to save** — last folder is remembered, or pick a new one each time",
  what_5: "**One click to download** — real-time progress bar, cancel any time",
  what_6:
    "**Queue multiple videos** — download panel tracks everything at once",
  what_7:
    "**Download subtitles** — fetch manual or auto-generated captions in SRT, VTT, or ASS, in any available language. Save them next to the video, embed them into a portable `.mkv`, or organize them into a dedicated `Subtitles/` subfolder",
  what_8:
    "**SponsorBlock integration** — skip or mark sponsor segments, intros, outros, self-promos, and more. Mark segments as chapters (non-destructive) or cut them out entirely with FFmpeg — your choice, per category",
  what_9:
    "**Available in 9 languages** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — auto-detects your system language, switchable any time",
  what_10:
    "**Clipboard watch** — copy any YouTube link and Arroxy auto-fills the URL field the moment you refocus the app. A confirm dialog keeps you in control; disable it from Advanced settings any time",
  what_11:
    "**Auto-clean URLs** — pasted or clipboard-grabbed YouTube links are stripped of tracking junk (`si`, `pp`, `feature`, `utm_*`, `fbclid`, `gclid`, and more) and `youtube.com/redirect` wrappers are unwrapped — the URL field always shows the canonical link",
  what_12:
    "**Hides to tray** — closing the window tucks Arroxy into your system tray. Downloads keep running; click the tray icon to bring the window back, or quit from the tray menu",
  what_13:
    "**Embedded chapters, metadata & thumbnail** — title, upload date, artist, description, and cover art written right into the file; chapter markers let any modern player navigate by section",
  shot1_alt: "Paste a URL",
  shot2_alt: "Pick your quality",
  shot3_alt: "Choose where to save",
  shot4_alt: "Download queue in action",
  shot5_alt: "Pick subtitle languages, format, and save mode",
  plan_intro:
    "Things on the roadmap — not yet shipped, roughly in priority order.",
  plan_col1: "Feature",
  plan_col2: "Description",
  plan_r1_name: "**Playlist & channel downloads**",
  plan_r1_desc:
    "Paste a playlist or channel URL and queue all videos at once, with filters for date range or count",
  plan_r2_name: "**Batch URL input**",
  plan_r2_desc: "Paste multiple URLs at once and kick them all off in one go",
  plan_r3_name: "**Format conversion**",
  plan_r3_desc:
    "Convert downloads to MP3, WAV, FLAC, or other formats without a separate tool",
  plan_r4_name: "**Custom filename templates**",
  plan_r4_desc:
    "Name files by title, uploader, date, resolution, or any combination — with a live preview",
  plan_r5_name: "**Scheduled downloads**",
  plan_r5_desc:
    "Set a time for Arroxy to start downloading — useful for large queues overnight",
  plan_r6_name: "**Download speed limits**",
  plan_r6_desc:
    "Cap bandwidth so downloads don't saturate your connection while you work",
  plan_r7_name: "**Clip trimming**",
  plan_r7_desc:
    "Specify a start and end time to download only a segment of a video",
  plan_cta:
    "Have a feature in mind that's not here? [Open a request](../../issues) — community input shapes what gets built next.",
  dl_intro:
    "Arroxy is in active development. Grab the latest build from the [Releases](../../releases) page.",
  dl_platform_col: "Platform",
  dl_format_col: "Format",
  dl_win_format: "Installer (NSIS) or Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` or `.flatpak` (sandboxed)",
  dl_run: "Just download, run, done.",
  dl_pkg_h3: "Install via package manager",
  dl_channel_col: "Channel",
  dl_command_col: "Command",
  dl_winget_or: "or",
  dl_win_intro: "Two builds are available — pick whichever fits:",
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
  dl_win_r5_portable: "❌ just delete the file",
  dl_win_rec:
    "**Recommendation:** use the NSIS installer if you want Arroxy to update itself automatically and launch faster. Use the portable `.exe` if you prefer a no-install, no-registry option.",
  dl_macos_note:
    "**Note:** I don't own a Mac, so the macOS build is untested by me personally. If something doesn't work — the app won't launch, the `.dmg` is broken, the quarantine workaround fails — please [open an issue](../../issues) and let me know. Any feedback from macOS users is genuinely appreciated.",
  dl_macos_warning:
    "Arroxy is not yet code-signed. macOS will show a security warning the first time you open it — this is expected, not a sign of damage.",
  dl_macos_m1_h4: "Method 1: System Settings (Recommended)",
  dl_macos_step_col1: "Step",
  dl_macos_step_col2: "Action",
  dl_macos_step1: "Right-click the Arroxy app icon and select **Open**.",
  dl_macos_step2:
    'A warning dialog appears. Click **Cancel** (don\'t click "Move to Trash").',
  dl_macos_step3: "Open **System Settings → Privacy & Security**.",
  dl_macos_step4:
    'Scroll down to the **Security** section — you\'ll see _"Arroxy was blocked from use because it is not from an identified developer."_',
  dl_macos_step5:
    "Click **Open Anyway**, then confirm with your password or Touch ID.",
  dl_macos_after:
    "After step 5, Arroxy opens normally and will never show the warning again.",
  dl_macos_m2_h4: "Method 2: Terminal (Advanced)",
  dl_macos_m2_text:
    "If the above doesn't work, run this once after dragging Arroxy to Applications:",
  dl_linux_intro:
    "AppImages are not installed — they run directly. You just need to mark the file as executable first.",
  dl_linux_m1_h4: "Method 1: File Manager",
  dl_linux_m1_text:
    "Right-click the `.AppImage` file → **Properties** → **Permissions** → enable **Allow executing file as program**, then double-click to run.",
  dl_linux_m2_h4: "Method 2: Terminal",
  dl_linux_fuse_text:
    "If it still won't launch, you may be missing FUSE (required by AppImage):",
  dl_linux_flatpak_h4: "Flatpak (sandboxed alternative)",
  dl_linux_flatpak_intro:
    "Prefer a properly sandboxed install? Grab the `Arroxy-*.flatpak` bundle from the same release page and install it locally — no Flathub setup, no admin rights, no `libfuse2` shim required (Flatpak uses bubblewrap for sandboxing).",
  privacy_intro:
    "Arroxy runs entirely on your machine. When you download a video:",
  privacy_step1:
    "Arroxy calls the YouTube URL directly using [yt-dlp](https://github.com/yt-dlp/yt-dlp) — an auditable, always up-to-date open-source tool",
  privacy_step2: "The file is saved straight to your chosen folder",
  privacy_step3:
    "Zero telemetry. Nothing is logged, tracked, or sent anywhere — ever.",
  privacy_outro:
    "Your watch history, download history, and file contents stay on your device. 100% private.",
  faq_q1: "What video qualities can I download?",
  faq_a1:
    "Anything YouTube offers — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p, and audio-only. High frame-rate streams (60 fps, 120 fps) and HDR content are preserved as-is. Arroxy shows you every available format and lets you choose exactly what to grab.",
  faq_q2: "Is it really free?",
  faq_a2: "Yes. MIT licensed. No premium tier, no feature gating.",
  faq_q3: "What languages is Arroxy available in?",
  faq_a3:
    "Nine, out of the box: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), and हिन्दी (Hindi). Arroxy auto-detects your operating system's language on first launch and you can switch at any time from the language picker in the toolbar. Want to add or improve a translation? The locale files are plain TypeScript objects in `src/shared/i18n/locales/` — [open a PR](../../pulls).",
  faq_q4: "Do I need to install anything?",
  faq_a4:
    "No. yt-dlp and ffmpeg are downloaded automatically on first launch from their official GitHub releases and cached on your machine. After that, no extra setup is needed.",
  faq_q5: "Will it keep working if YouTube changes something?",
  faq_a5:
    "Yes — and Arroxy has two layers of resilience. First, yt-dlp is one of the most actively maintained open-source tools around — it updates within hours of YouTube changes. Second, Arroxy doesn't rely on cookies or your Google account at all, so there's no session to expire and no credentials to rotate. That combination makes it significantly more stable than tools that depend on exported browser cookies.",
  faq_q6: "Can I download playlists?",
  faq_a6:
    "Single videos are supported today. Playlist and channel support is on the roadmap — see [Planned features](#features).",
  faq_q7: "Does it need my YouTube account or cookies?",
  faq_a7:
    "No — and that's a bigger deal than it sounds. Most tools that stop working after a YouTube update tell you to export your browser's YouTube cookies. That workaround breaks every ~30 minutes as YouTube rotates sessions, and yt-dlp's own docs warn it can get your Google account flagged. Arroxy never uses cookies or credentials. No login. No account linked. Nothing to expire, nothing to ban.",
  faq_q8: 'macOS says "the app is damaged" or "cannot be opened" — what do I do?',
  faq_a8:
    "This is macOS Gatekeeper blocking an unsigned app — not actual damage. See [First-Time Launch on macOS](#macos) for step-by-step instructions.",
  faq_q9: "Is this legal?",
  faq_a9:
    "Downloading videos for personal use is generally accepted in most jurisdictions. You are responsible for complying with YouTube's Terms of Service and your local laws.",
  tech_content: TECH_CONTENT_EN,
  tos_note:
    "**Terms of Use:** Arroxy is a tool for personal, private use only. You are solely responsible for ensuring your downloads comply with YouTube's [Terms of Service](https://www.youtube.com/t/terms) and the copyright laws of your jurisdiction. Do not use Arroxy to download, reproduce, or distribute content you do not have the right to use. The developers of Arroxy are not liable for any misuse.",
  footer_credit:
    'MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};

const de = {
  icon_alt: "Arroxy Maskottchen",
  title: "Arroxy — Kostenloser Open-Source YouTube Downloader",
  read_in_label: "Sprache:",
  badge_release_alt: "Release",
  badge_lastcommit_alt: "Last commit",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Languages",
  badge_license_alt: "License",
  hero_bold: "Genervt von YouTube-Werbung, die deine Videos ruiniert?",
  hero_tagline:
    "Lade jedes Video oder Short in voller Qualität herunter — 4K, 1080p60, HDR und mehr. Schnell, kostenlos, zu 100 % deins.",
  hero_nopes: "Keine Werbung. Kein Tracking. Keine Cookies. Kein Login. Kein Quatsch.",
  cta_latest: "Neueste Version →",
  demo_alt: "Arroxy Demo",
  ai_notice:
    "> 🌐 Dies ist eine KI-gestützte Übersetzung. Die [englische README](README.md) ist die maßgebliche Quelle. Fehler entdeckt? [PRs sind willkommen](../../pulls).",
  toc_heading: "Inhalt",
  why_h2: "Warum Arroxy?",
  what_h2: "Was es kann",
  plan_h2: "Geplante Funktionen",
  dl_h2: "Download",
  dl_win_h3: "Windows: Installer vs. Portable",
  dl_macos_h3: "Erststart unter macOS",
  dl_linux_h3: "Erststart unter Linux",
  privacy_h2: "Datenschutz",
  faq_h2: "Häufig gestellte Fragen",
  tech_h2: "Tech-Details",
  why_col2: "Browser-Erweiterungen",
  why_col3: "Online-Konverter",
  why_col4: "Andere Downloader",
  why_r1: "Für immer kostenlos",
  why_r2: "Keine Werbung",
  why_r3: "Kein Konto erforderlich",
  why_r4: "Funktioniert offline _(quasi)_",
  why_r5: "Deine Dateien bleiben lokal",
  why_r6: "Keine Nutzungsbeschränkungen",
  why_r7: "Open Source",
  why_r8: "Nie Login oder Cookies nötig",
  why_r9: "Kein Risiko für Google-Konto-Sperre",
  why_offline_note:
    "_„Funktioniert offline\" heißt: Es passiert keine Konvertierung auf dem Server eines Fremden — die gesamte Pipeline läuft auf deinem Rechner. Internet brauchst du natürlich trotzdem, um YouTube zu erreichen. Schon klar._",
  why_cookies_note:
    "**Warum das wichtig ist:** Die meisten Desktop-YouTube-Downloader verlangen früher oder später, dass du deine Browser-Cookies exportierst, sobald YouTube seine Bot-Erkennung aktualisiert. Diese Sessions verfallen alle ~30 Minuten — und yt-dlp warnt selbst in der Doku, dass cookie-basierte Automatisierung dein Google-Konto sperren kann. Arroxy verlangt nie Cookies, Login oder Anmeldedaten. Es fordert dieselben Tokens an, die YouTube an jeden echten Browser ausgibt — null Konto-Risiko, keine Ablauffrist.",
  why_summary:
    "Arroxy ist eine **kostenlose, quelloffene und datenschutzorientierte** Desktop-App — gemacht für Leute, die Einfachheit ohne Ballast wollen. Deine Downloads laufen nie über einen Drittanbieter-Server. Null Telemetrie, null Datensammlung. URL einfügen, fertig.",
  what_1:
    "**Beliebige YouTube-URL einfügen** — Videos, Shorts, alles — Arroxy holt in Sekunden alle verfügbaren Formate",
  what_2:
    "**Qualität wählen** — bis 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps und höher, nur Audio (MP3/AAC/Opus), oder Schnell-Preset (Beste Qualität / Ausgewogen / Kleine Datei)",
  what_3:
    "**Volle High-Frame-Rate-Unterstützung** — 60 fps, 120 fps und HDR-Streams werden exakt so erhalten, wie YouTube sie kodiert",
  what_4:
    "**Speicherort wählen** — letzter Ordner wird gemerkt, oder jedes Mal neu wählen",
  what_5: "**Ein Klick zum Download** — Echtzeit-Fortschrittsanzeige, jederzeit abbrechbar",
  what_6:
    "**Mehrere Videos in der Warteschlange** — das Download-Panel verfolgt alles parallel",
  what_7:
    "**Untertitel herunterladen** — manuelle oder automatisch generierte Untertitel in SRT, VTT oder ASS, in jeder verfügbaren Sprache. Speichere sie neben dem Video, bette sie in eine portable `.mkv` ein, oder ordne sie in einem dedizierten `Subtitles/`-Unterordner",
  what_8:
    "**SponsorBlock-Integration** — überspringe oder markiere Sponsor-Segmente, Intros, Outros, Eigenwerbung und mehr. Markiere Segmente als Kapitel (nicht-destruktiv) oder schneide sie mit FFmpeg komplett heraus — deine Wahl, pro Kategorie",
  what_9:
    "**In 9 Sprachen verfügbar** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — erkennt deine Systemsprache automatisch, jederzeit umschaltbar",
  what_10:
    "**Zwischenablage überwachen** — kopiere einen YouTube-Link und Arroxy füllt das URL-Feld automatisch aus, sobald du wieder zur App wechselst. Ein Bestätigungsdialog hält dich in Kontrolle; jederzeit in den erweiterten Einstellungen deaktivierbar",
  what_11:
    "**URLs automatisch bereinigen** — eingefügte oder aus der Zwischenablage übernommene YouTube-Links werden von Tracking-Parametern (`si`, `pp`, `feature`, `utm_*`, `fbclid`, `gclid` und mehr) befreit, und `youtube.com/redirect`-Wrapper werden aufgelöst — das URL-Feld zeigt immer den kanonischen Link",
  what_12:
    "**In den Tray minimieren** — das Schließen des Fensters versteckt Arroxy im System-Tray. Downloads laufen weiter; klicke auf das Tray-Symbol, um das Fenster zurückzubringen, oder beende die App über das Tray-Menü",
  what_13:
    "**Eingebettete Kapitel, Metadaten & Thumbnail** — Titel, Upload-Datum, Künstler, Beschreibung und Cover-Art direkt in die Datei geschrieben; Kapitelmarkierungen ermöglichen Navigation in jedem modernen Player",
  shot1_alt: "URL einfügen",
  shot2_alt: "Qualität wählen",
  shot3_alt: "Speicherort wählen",
  shot4_alt: "Download-Warteschlange in Aktion",
  shot5_alt: "Untertitel-Sprachen, Format und Speichermodus wählen",
  plan_intro:
    "Was auf der Roadmap steht — noch nicht ausgeliefert, grob nach Priorität sortiert.",
  plan_col1: "Funktion",
  plan_col2: "Beschreibung",
  plan_r1_name: "**Playlist- & Kanal-Downloads**",
  plan_r1_desc:
    "Playlist- oder Kanal-URL einfügen und alle Videos auf einmal in die Warteschlange, mit Datums-/Anzahl-Filtern",
  plan_r2_name: "**Mehrere URLs gleichzeitig eingeben**",
  plan_r2_desc: "Mehrere URLs einfügen und alle in einem Rutsch starten",
  plan_r3_name: "**Format-Konvertierung**",
  plan_r3_desc:
    "Downloads in MP3, WAV, FLAC oder andere Formate umwandeln — ohne extra Tool",
  plan_r4_name: "**Eigene Dateinamen-Vorlagen**",
  plan_r4_desc:
    "Dateien nach Titel, Hochlader, Datum, Auflösung oder Kombination benennen — mit Live-Vorschau",
  plan_r5_name: "**Geplante Downloads**",
  plan_r5_desc:
    "Startzeit für Arroxy festlegen — praktisch für große Warteschlangen über Nacht",
  plan_r6_name: "**Download-Geschwindigkeitsbegrenzung**",
  plan_r6_desc:
    "Bandbreite limitieren, damit Downloads deine Verbindung beim Arbeiten nicht auslasten",
  plan_r7_name: "**Clip-Trimming**",
  plan_r7_desc:
    "Start- und Endzeit angeben, um nur einen Ausschnitt eines Videos herunterzuladen",
  plan_cta:
    "Eine Funktion, die hier fehlt? [Anfrage öffnen](../../issues) — Community-Feedback bestimmt, was als Nächstes gebaut wird.",
  dl_intro:
    "Arroxy ist in aktiver Entwicklung. Hol dir den neuesten Build von der [Releases](../../releases) Seite.",
  dl_platform_col: "Plattform",
  dl_format_col: "Format",
  dl_win_format: "Installer (NSIS) oder portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` oder `.flatpak` (sandboxed)",
  dl_run: "Einfach herunterladen, ausführen, fertig.",
  dl_pkg_h3: "Installation per Paketmanager",
  dl_channel_col: "Kanal",
  dl_command_col: "Befehl",
  dl_winget_or: "oder",
  dl_win_intro: "Es gibt zwei Builds — nimm, was besser passt:",
  dl_win_col_installer: "NSIS Installer",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "Installation nötig",
  dl_win_r1_installer: "Ja",
  dl_win_r1_portable: "Nein — von überall startbar",
  dl_win_r2: "Auto-Updates",
  dl_win_r2_installer: "✅ in der App",
  dl_win_r2_portable: "❌ manueller Download",
  dl_win_r3: "Startgeschwindigkeit",
  dl_win_r3_installer: "✅ schneller",
  dl_win_r3_portable: "⚠️ langsamer Kaltstart",
  dl_win_r4: "Eintrag im Startmenü",
  dl_win_r5: "Einfache Deinstallation",
  dl_win_r5_portable: "❌ einfach Datei löschen",
  dl_win_rec:
    "**Empfehlung:** Nimm den NSIS Installer, wenn Arroxy sich automatisch updaten und schneller starten soll. Nimm die portable `.exe`, wenn du keine Installation und keine Registry-Einträge möchtest.",
  dl_macos_note:
    "**Hinweis:** Ich besitze keinen Mac, der macOS-Build wurde von mir also nicht persönlich getestet. Wenn etwas nicht funktioniert — App startet nicht, `.dmg` defekt, Quarantäne-Workaround scheitert — bitte [ein Issue öffnen](../../issues) und Bescheid geben. Jedes Feedback von macOS-Nutzern ist sehr willkommen.",
  dl_macos_warning:
    "Arroxy ist noch nicht code-signiert. macOS zeigt beim ersten Öffnen eine Sicherheitswarnung — das ist erwartet, kein Hinweis auf Beschädigung.",
  dl_macos_m1_h4: "Methode 1: Systemeinstellungen (empfohlen)",
  dl_macos_step_col1: "Schritt",
  dl_macos_step_col2: "Aktion",
  dl_macos_step1: "Rechtsklick auf das Arroxy-Symbol und **Öffnen** wählen.",
  dl_macos_step2:
    'Es erscheint ein Warndialog. Klick auf **Abbrechen** (nicht „In den Papierkorb verschieben").',
  dl_macos_step3: "Öffne **Systemeinstellungen → Datenschutz & Sicherheit**.",
  dl_macos_step4:
    'Scroll runter zum Abschnitt **Sicherheit** — dort steht _„Arroxy wurde blockiert, weil es nicht von einem identifizierten Entwickler stammt."_',
  dl_macos_step5:
    "Klick auf **Trotzdem öffnen**, dann mit Passwort oder Touch ID bestätigen.",
  dl_macos_after:
    "Nach Schritt 5 öffnet sich Arroxy normal und die Warnung erscheint nie wieder.",
  dl_macos_m2_h4: "Methode 2: Terminal (fortgeschritten)",
  dl_macos_m2_text:
    "Wenn das Obige nicht klappt, einmal nach dem Verschieben in den Programme-Ordner:",
  dl_linux_intro:
    "AppImages werden nicht installiert — sie laufen direkt. Du musst die Datei nur als ausführbar markieren.",
  dl_linux_m1_h4: "Methode 1: Dateimanager",
  dl_linux_m1_text:
    "Rechtsklick auf die `.AppImage` → **Eigenschaften** → **Berechtigungen** → **Datei als Programm ausführen erlauben** aktivieren, dann doppelklicken.",
  dl_linux_m2_h4: "Methode 2: Terminal",
  dl_linux_fuse_text:
    "Wenn es immer noch nicht startet, fehlt vielleicht FUSE (für AppImage erforderlich):",
  dl_linux_flatpak_h4: "Flatpak (sandboxed Alternative)",
  dl_linux_flatpak_intro:
    "Lieber eine richtig sandboxed Installation? Hol dir das `Arroxy-*.flatpak` Bundle von derselben Release-Seite und installiere es lokal — kein Flathub-Setup, keine Admin-Rechte, kein `libfuse2`-Shim nötig (Flatpak nutzt bubblewrap für die Sandbox).",
  privacy_intro:
    "Arroxy läuft komplett auf deinem Rechner. Wenn du ein Video herunterlädst:",
  privacy_step1:
    "Arroxy ruft die YouTube-URL direkt auf, mit [yt-dlp](https://github.com/yt-dlp/yt-dlp) — einem auditierbaren, stets aktuellen Open-Source-Tool",
  privacy_step2: "Die Datei wird direkt in deinen gewählten Ordner gespeichert",
  privacy_step3:
    "Null Telemetrie. Nichts wird protokolliert, getrackt oder irgendwohin geschickt — nie.",
  privacy_outro:
    "Dein Verlauf, deine Download-Historie und die Dateiinhalte bleiben auf deinem Gerät. 100 % privat.",
  faq_q1: "Welche Videoqualitäten kann ich herunterladen?",
  faq_a1:
    "Alles, was YouTube anbietet — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p und nur Audio. Hochbildraten-Streams (60 fps, 120 fps) und HDR-Inhalte werden unverändert übernommen. Arroxy zeigt dir jedes verfügbare Format und lässt dich exakt auswählen.",
  faq_q2: "Ist es wirklich kostenlos?",
  faq_a2: "Ja. MIT-Lizenz. Keine Premium-Stufe, keine versteckten Funktionsbarrieren.",
  faq_q3: "In welchen Sprachen ist Arroxy verfügbar?",
  faq_a3:
    "Neun, direkt out of the box: English, Español (Spanisch), Deutsch, Français (Französisch), 日本語 (Japanisch), 中文 (Chinesisch), Русский (Russisch), Українська (Ukrainisch) und हिन्दी (Hindi). Arroxy erkennt deine Betriebssystem-Sprache beim ersten Start und du kannst jederzeit über die Sprachauswahl in der Symbolleiste wechseln. Übersetzung hinzufügen oder verbessern? Die Sprachdateien sind einfache TypeScript-Objekte in `src/shared/i18n/locales/` — [PR öffnen](../../pulls).",
  faq_q4: "Muss ich etwas installieren?",
  faq_a4:
    "Nein. yt-dlp und ffmpeg werden beim ersten Start automatisch von ihren offiziellen GitHub-Releases heruntergeladen und auf deinem Rechner gecacht. Danach ist keine weitere Einrichtung nötig.",
  faq_q5: "Funktioniert es weiter, wenn YouTube etwas ändert?",
  faq_a5:
    "Ja — und Arroxy hat zwei Resilienzschichten. Erstens: yt-dlp ist eines der am aktivsten gepflegten Open-Source-Tools überhaupt — es wird innerhalb von Stunden nach YouTube-Änderungen aktualisiert. Zweitens: Arroxy verlässt sich überhaupt nicht auf Cookies oder dein Google-Konto, also gibt's keine Session, die abläuft, und keine Anmeldedaten, die rotiert werden müssen. Diese Kombination macht es deutlich stabiler als Tools, die auf exportierte Browser-Cookies angewiesen sind.",
  faq_q6: "Kann ich Playlists herunterladen?",
  faq_a6:
    "Aktuell werden nur einzelne Videos unterstützt. Playlist- und Kanal-Support ist auf der Roadmap — siehe [Geplante Funktionen](#features).",
  faq_q7: "Braucht es mein YouTube-Konto oder Cookies?",
  faq_a7:
    "Nein — und das ist wichtiger, als es klingt. Die meisten Tools, die nach einem YouTube-Update aufhören zu funktionieren, weisen dich an, deine Browser-Cookies zu exportieren. Dieser Workaround bricht alle ~30 Minuten zusammen, wenn YouTube Sessions rotiert, und yt-dlps eigene Doku warnt, dass das dein Google-Konto markieren kann. Arroxy nutzt nie Cookies oder Anmeldedaten. Kein Login. Kein verknüpftes Konto. Nichts läuft ab, nichts wird gesperrt.",
  faq_q8: 'macOS sagt „die App ist beschädigt" oder „kann nicht geöffnet werden" — was tun?',
  faq_a8:
    "Das ist macOS Gatekeeper, der eine unsignierte App blockiert — nicht echte Beschädigung. Schritt-für-Schritt-Anleitung unter [Erststart unter macOS](#macos).",
  faq_q9: "Ist das legal?",
  faq_a9:
    "Das Herunterladen von Videos zur persönlichen Nutzung ist in den meisten Rechtsordnungen allgemein akzeptiert. Du bist verantwortlich, die YouTube-AGB und deine lokalen Gesetze einzuhalten.",
  tech_content:
    "Für technische Details, Build-Anleitung aus dem Quellcode, plattformspezifische Voraussetzungen und Beiträge: siehe [englische README](README.md#tech).",
  tos_note:
    "**Nutzungsbedingungen:** Arroxy ist ein Werkzeug ausschließlich für persönlichen, privaten Gebrauch. Du bist allein dafür verantwortlich, dass deine Downloads den [YouTube-AGB](https://www.youtube.com/t/terms) und dem Urheberrecht deines Landes entsprechen. Verwende Arroxy nicht, um Inhalte herunterzuladen, zu vervielfältigen oder zu verbreiten, an denen du keine Rechte hast. Die Entwickler von Arroxy haften nicht für Missbrauch.",
  footer_credit:
    'MIT-Lizenz · Mit Sorgfalt gemacht von <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};

const es = {
  icon_alt: "Mascota de Arroxy",
  title: "Arroxy — Descargador gratuito de YouTube de código abierto",
  read_in_label: "Leer en:",
  badge_release_alt: "Versión",
  badge_lastcommit_alt: "Último commit",
  badge_platforms_alt: "Plataformas",
  badge_i18n_alt: "Idiomas",
  badge_license_alt: "Licencia",
  hero_bold: "¿Cansado de los anuncios de YouTube que arruinan tus videos?",
  hero_tagline:
    "Descarga cualquier video o Short en máxima calidad — 4K, 1080p60, HDR y más. Rápido, gratis y 100% tuyo.",
  hero_nopes: "Sin anuncios. Sin rastreo. Sin cookies. Sin inicio de sesión. Sin tonterías.",
  cta_latest: "Última versión →",
  demo_alt: "Demo de Arroxy",
  ai_notice:
    "> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).",
  toc_heading: "Contenido",
  why_h2: "¿Por qué Arroxy?",
  what_h2: "Qué hace",
  plan_h2: "Funciones planeadas",
  dl_h2: "Descargar",
  dl_win_h3: "Windows: Instalador vs Portátil",
  dl_macos_h3: "Primer arranque en macOS",
  dl_linux_h3: "Primer arranque en Linux",
  privacy_h2: "Privacidad",
  faq_h2: "Preguntas frecuentes",
  tech_h2: "Detalles técnicos",
  why_col2: "Extensiones del navegador",
  why_col3: "Conversores en línea",
  why_col4: "Otros descargadores",
  why_r1: "Gratis para siempre",
  why_r2: "Sin anuncios",
  why_r3: "No requiere cuenta",
  why_r4: "Funciona sin conexión _(más o menos)_",
  why_r5: "Tus archivos se quedan en tu equipo",
  why_r6: "Sin límites de uso",
  why_r7: "Código abierto",
  why_r8: "Nunca pide login ni cookies",
  why_r9: "Cero riesgo de baneo de cuenta de Google",
  why_offline_note:
    '_"Funciona sin conexión" significa que ninguna conversión ocurre en el servidor de otra persona — toda la cadena se ejecuta en tu máquina. Aún necesitas internet para llegar a YouTube. Sí, lo sabemos._',
  why_cookies_note:
    "**Por qué importa:** La mayoría de los descargadores de escritorio para YouTube terminan pidiéndote que exportes las cookies de tu navegador cada vez que YouTube actualiza su detección de bots. Esas sesiones expiran cada ~30 minutos — y la propia documentación de yt-dlp advierte que la automatización basada en cookies puede provocar el baneo de tu cuenta de Google. Arroxy nunca te pide cookies, login ni credenciales. Solicita los mismos tokens que YouTube emite a cualquier navegador real — cero riesgo para tu cuenta, sin caducidad.",
  why_summary:
    "Arroxy es una aplicación de escritorio **gratuita, de código abierto y centrada en la privacidad** — pensada para quienes quieren simplicidad sin sobrecarga. Tus descargas nunca pasan por un servidor de terceros. Cero telemetría, cero recolección de datos. Solo pega una URL y listo.",
  what_1:
    "**Pega cualquier URL de YouTube** — videos, Shorts, lo que sea — Arroxy obtiene todos los formatos disponibles en segundos",
  what_2:
    "**Elige tu calidad** — hasta 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps y mayores tasas de fotogramas, solo audio (MP3/AAC/Opus), o usa un preset rápido (Mejor calidad / Equilibrado / Archivo pequeño)",
  what_3:
    "**Soporte completo de alto frame rate** — los streams de 60 fps, 120 fps y HDR se conservan exactamente como YouTube los codifica",
  what_4:
    "**Elige dónde guardar** — recuerda la última carpeta, o elige una nueva cada vez",
  what_5:
    "**Un clic para descargar** — barra de progreso en tiempo real, cancela cuando quieras",
  what_6:
    "**Cola de varios videos** — el panel de descargas lo lleva todo a la vez",
  what_7:
    "**Descargar subtítulos** — obtén subtítulos manuales o automáticos en SRT, VTT o ASS, en cualquier idioma disponible. Guárdalos junto al video, intégralos en un `.mkv` portátil, u organízalos en una subcarpeta `Subtitles/` dedicada",
  what_8:
    "**Integración con SponsorBlock** — omite o marca segmentos de patrocinadores, intros, outros, autopromociones y más. Márcalos como capítulos (no destructivo) o elimínalos por completo con FFmpeg — tú decides, por categoría",
  what_9:
    "**Disponible en 9 idiomas** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — detecta el idioma de tu sistema y se puede cambiar en cualquier momento",
  what_10:
    "**Monitoreo del portapapeles** — copia cualquier enlace de YouTube y Arroxy rellena el campo de URL automáticamente al volver a la app. Un diálogo de confirmación mantiene el control; desactívalo desde la Configuración avanzada cuando quieras",
  what_11:
    "**Limpieza automática de URLs** — los enlaces de YouTube pegados o tomados del portapapeles se limpian de parámetros de seguimiento (`si`, `pp`, `feature`, `utm_*`, `fbclid`, `gclid` y más), y los envoltorios `youtube.com/redirect` se desempaquetan — el campo de URL siempre muestra el enlace canónico",
  what_12:
    "**Se oculta en la bandeja** — cerrar la ventana lleva Arroxy a la bandeja del sistema. Las descargas siguen en curso; haz clic en el icono para recuperar la ventana, o sal desde el menú de la bandeja",
  what_13:
    "**Capítulos, metadatos y miniatura integrados** — título, fecha de subida, artista, descripción y portada escritos directamente en el archivo; los marcadores de capítulo permiten navegar por sección en cualquier reproductor moderno",
  shot1_alt: "Pega una URL",
  shot2_alt: "Elige la calidad",
  shot3_alt: "Elige dónde guardar",
  shot4_alt: "Cola de descargas en acción",
  shot5_alt: "Elige idiomas, formato y modo de guardado de subtítulos",
  plan_intro:
    "Cosas en la hoja de ruta — aún no lanzadas, aproximadamente por orden de prioridad.",
  plan_col1: "Función",
  plan_col2: "Descripción",
  plan_r1_name: "**Descarga de listas y canales**",
  plan_r1_desc:
    "Pega la URL de una lista o canal y encola todos los videos de una vez, con filtros por fecha o cantidad",
  plan_r2_name: "**Entrada de URLs por lotes**",
  plan_r2_desc: "Pega varias URLs a la vez y lánzalas todas juntas",
  plan_r3_name: "**Conversión de formato**",
  plan_r3_desc:
    "Convierte descargas a MP3, WAV, FLAC u otros formatos sin necesitar otra herramienta",
  plan_r4_name: "**Plantillas de nombre de archivo**",
  plan_r4_desc:
    "Nombra archivos por título, autor, fecha, resolución o cualquier combinación — con vista previa en vivo",
  plan_r5_name: "**Descargas programadas**",
  plan_r5_desc:
    "Define una hora para que Arroxy comience a descargar — útil para colas grandes durante la noche",
  plan_r6_name: "**Límites de velocidad de descarga**",
  plan_r6_desc:
    "Limita el ancho de banda para que las descargas no saturen tu conexión mientras trabajas",
  plan_r7_name: "**Recorte de clips**",
  plan_r7_desc:
    "Especifica un tiempo de inicio y fin para descargar solo un segmento de un video",
  plan_cta:
    "¿Tienes una idea que no está aquí? [Abre una solicitud](../../issues) — la opinión de la comunidad guía lo que se construye después.",
  dl_intro:
    "Arroxy está en desarrollo activo. Consigue la última versión en la página de [Releases](../../releases).",
  dl_platform_col: "Plataforma",
  dl_format_col: "Formato",
  dl_win_format: "Instalador (NSIS) o `.exe` portátil",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` o `.flatpak` (sandboxed)",
  dl_run: "Solo descarga, ejecuta, listo.",
  dl_pkg_h3: "Instalar mediante gestor de paquetes",
  dl_channel_col: "Canal",
  dl_command_col: "Comando",
  dl_winget_or: "o",
  dl_win_intro: "Hay dos compilaciones disponibles — elige la que mejor te sirva:",
  dl_win_col_installer: "Instalador NSIS",
  dl_win_col_portable: "`.exe` portátil",
  dl_win_r1: "Requiere instalación",
  dl_win_r1_installer: "Sí",
  dl_win_r1_portable: "No — ejecútalo desde donde quieras",
  dl_win_r2: "Auto-actualizaciones",
  dl_win_r2_installer: "✅ en la app",
  dl_win_r2_portable: "❌ descarga manual",
  dl_win_r3: "Velocidad de inicio",
  dl_win_r3_installer: "✅ más rápido",
  dl_win_r3_portable: "⚠️ inicio en frío más lento",
  dl_win_r4: "Aparece en el menú Inicio",
  dl_win_r5: "Desinstalación fácil",
  dl_win_r5_portable: "❌ solo borra el archivo",
  dl_win_rec:
    "**Recomendación:** usa el instalador NSIS si quieres que Arroxy se actualice solo y arranque más rápido. Usa el `.exe` portátil si prefieres no instalar y no tocar el registro.",
  dl_macos_note:
    "**Nota:** No tengo un Mac, así que la versión de macOS no la he probado personalmente. Si algo no funciona — la app no abre, el `.dmg` está roto, el bypass de cuarentena falla — por favor [abre un issue](../../issues) y avísame. Cualquier comentario de usuarios de macOS se agradece de verdad.",
  dl_macos_warning:
    "Arroxy aún no está firmado con código. macOS mostrará una advertencia de seguridad la primera vez que lo abras — esto es esperado, no significa que esté dañado.",
  dl_macos_m1_h4: "Método 1: Configuración del Sistema (recomendado)",
  dl_macos_step_col1: "Paso",
  dl_macos_step_col2: "Acción",
  dl_macos_step1: "Haz clic derecho en el ícono de Arroxy y elige **Abrir**.",
  dl_macos_step2:
    'Aparecerá un cuadro de advertencia. Haz clic en **Cancelar** (no en "Mover a la papelera").',
  dl_macos_step3: "Abre **Configuración del Sistema → Privacidad y seguridad**.",
  dl_macos_step4:
    'Baja hasta la sección **Seguridad** — verás _"Arroxy fue bloqueado porque no es de un desarrollador identificado."_',
  dl_macos_step5:
    "Haz clic en **Abrir igualmente**, luego confirma con tu contraseña o Touch ID.",
  dl_macos_after:
    "Después del paso 5, Arroxy abre normalmente y nunca volverá a mostrar la advertencia.",
  dl_macos_m2_h4: "Método 2: Terminal (avanzado)",
  dl_macos_m2_text:
    "Si lo anterior no funciona, ejecuta esto una sola vez después de arrastrar Arroxy a Aplicaciones:",
  dl_linux_intro:
    "Los AppImages no se instalan — se ejecutan directamente. Solo necesitas marcar el archivo como ejecutable primero.",
  dl_linux_m1_h4: "Método 1: Gestor de archivos",
  dl_linux_m1_text:
    "Clic derecho en el `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir ejecutar el archivo como programa**, luego doble clic para ejecutarlo.",
  dl_linux_m2_h4: "Método 2: Terminal",
  dl_linux_fuse_text:
    "Si aún no arranca, puede que te falte FUSE (lo necesita AppImage):",
  dl_linux_flatpak_h4: "Flatpak (alternativa con sandbox)",
  dl_linux_flatpak_intro:
    "¿Prefieres una instalación con sandbox real? Coge el bundle `Arroxy-*.flatpak` de la misma página de release e instálalo localmente — sin configurar Flathub, sin permisos de admin, sin shim `libfuse2` (Flatpak usa bubblewrap para el sandbox).",
  privacy_intro:
    "Arroxy se ejecuta enteramente en tu máquina. Cuando descargas un video:",
  privacy_step1:
    "Arroxy llama directamente a la URL de YouTube usando [yt-dlp](https://github.com/yt-dlp/yt-dlp) — una herramienta de código abierto auditable y siempre actualizada",
  privacy_step2:
    "El archivo se guarda directamente en la carpeta que elegiste",
  privacy_step3:
    "Cero telemetría. Nada se registra, rastrea ni envía a ningún sitio — nunca.",
  privacy_outro:
    "Tu historial de visualización, tu historial de descargas y el contenido de los archivos se quedan en tu dispositivo. 100% privado.",
  faq_q1: "¿Qué calidades de video puedo descargar?",
  faq_a1:
    "Cualquiera que ofrezca YouTube — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p y solo audio. Los streams de alto frame rate (60 fps, 120 fps) y HDR se conservan tal cual. Arroxy te muestra todos los formatos disponibles y te deja elegir exactamente cuál bajar.",
  faq_q2: "¿De verdad es gratis?",
  faq_a2: "Sí. Licencia MIT. Sin nivel premium, sin funciones bloqueadas.",
  faq_q3: "¿En qué idiomas está disponible Arroxy?",
  faq_a3:
    "En nueve, listos para usar: English, Español, Deutsch (alemán), Français (francés), 日本語 (japonés), 中文 (chino), Русский (ruso), Українська (ucraniano) y हिन्दी (hindi). Arroxy detecta el idioma de tu sistema operativo en el primer arranque y puedes cambiarlo en cualquier momento desde el selector de idioma en la barra de herramientas. ¿Quieres añadir o mejorar una traducción? Los archivos de idioma son objetos TypeScript planos en `src/shared/i18n/locales/` — [abre un PR](../../pulls).",
  faq_q4: "¿Necesito instalar algo?",
  faq_a4:
    "No. yt-dlp y ffmpeg se descargan automáticamente en el primer arranque desde sus releases oficiales en GitHub y se guardan en caché en tu máquina. Después de eso, no se necesita configuración adicional.",
  faq_q5: "¿Seguirá funcionando si YouTube cambia algo?",
  faq_a5:
    "Sí — y Arroxy tiene dos capas de resiliencia. Primero, yt-dlp es una de las herramientas open-source más mantenidas activamente — se actualiza en horas tras cualquier cambio de YouTube. Segundo, Arroxy no depende de cookies ni de tu cuenta de Google, así que no hay sesión que caduque ni credenciales que rotar. Esa combinación lo hace mucho más estable que las herramientas que dependen de cookies exportadas del navegador.",
  faq_q6: "¿Puedo descargar listas de reproducción?",
  faq_a6:
    "Hoy se admiten videos individuales. El soporte de listas y canales está en la hoja de ruta — ver [Funciones planeadas](#features).",
  faq_q7: "¿Necesita mi cuenta de YouTube o cookies?",
  faq_a7:
    "No — y es un tema más importante de lo que parece. La mayoría de las herramientas que dejan de funcionar tras una actualización de YouTube te piden exportar las cookies de YouTube de tu navegador. Esa solución se rompe cada ~30 minutos cuando YouTube rota las sesiones, y la propia documentación de yt-dlp advierte que puede provocar el baneo de tu cuenta de Google. Arroxy nunca usa cookies ni credenciales. Sin login. Sin cuenta vinculada. Nada que caduque, nada que banear.",
  faq_q8: 'macOS dice "la aplicación está dañada" o "no se puede abrir" — ¿qué hago?',
  faq_a8:
    "Es Gatekeeper de macOS bloqueando una app sin firmar — no es un daño real. Mira [Primer arranque en macOS](#macos) para instrucciones paso a paso.",
  faq_q9: "¿Es legal?",
  faq_a9:
    "Descargar videos para uso personal generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los Términos de Servicio de YouTube y las leyes de tu país.",
  tech_content:
    "Para detalles técnicos, instrucciones de compilación desde el código fuente, prerequisitos por plataforma y cómo contribuir, consulta el [README en inglés](README.md#tech).",
  tos_note:
    "**Términos de uso:** Arroxy es una herramienta para uso personal y privado. Eres el único responsable de garantizar que tus descargas cumplan con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción. No uses Arroxy para descargar, reproducir o distribuir contenido sobre el que no tengas derechos. Los desarrolladores de Arroxy no se hacen responsables del mal uso.",
  footer_credit:
    'Licencia MIT · Hecho con cariño por <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};

const fr = {
  icon_alt: "Mascotte Arroxy",
  title: "Arroxy — Téléchargeur YouTube gratuit et open source",
  read_in_label: "Lire en :",
  badge_release_alt: "Version",
  badge_lastcommit_alt: "Dernier commit",
  badge_platforms_alt: "Plateformes",
  badge_i18n_alt: "Langues",
  badge_license_alt: "Licence",
  hero_bold: "Marre des publicités YouTube qui gâchent tes vidéos ?",
  hero_tagline:
    "Télécharge n'importe quelle vidéo ou Short en pleine qualité — 4K, 1080p60, HDR et au-delà. Rapide, gratuit, 100 % à toi.",
  hero_nopes: "Pas de pub. Pas de tracking. Pas de cookies. Pas de connexion. Pas de blabla.",
  cta_latest: "Dernière version →",
  demo_alt: "Démo Arroxy",
  ai_notice:
    "> 🌐 Traduction assistée par IA. Le [README en anglais](README.md) fait foi. Tu vois une erreur ? [Les PRs sont les bienvenues](../../pulls).",
  toc_heading: "Sommaire",
  why_h2: "Pourquoi Arroxy ?",
  what_h2: "Ce qu'il fait",
  plan_h2: "Fonctions prévues",
  dl_h2: "Téléchargement",
  dl_win_h3: "Windows : Installeur vs Portable",
  dl_macos_h3: "Premier lancement sur macOS",
  dl_linux_h3: "Premier lancement sur Linux",
  privacy_h2: "Confidentialité",
  faq_h2: "Questions fréquentes",
  tech_h2: "Détails techniques",
  why_col2: "Extensions navigateur",
  why_col3: "Convertisseurs en ligne",
  why_col4: "Autres téléchargeurs",
  why_r1: "Gratuit pour toujours",
  why_r2: "Sans publicité",
  why_r3: "Sans compte",
  why_r4: "Marche hors ligne _(plus ou moins)_",
  why_r5: "Tes fichiers restent en local",
  why_r6: "Aucune limite d'usage",
  why_r7: "Open source",
  why_r8: "Jamais de login ni cookies",
  why_r9: "Aucun risque de bannissement Google",
  why_offline_note:
    "_« Marche hors ligne » signifie qu'aucune conversion ne se fait sur le serveur de quelqu'un d'autre — toute la chaîne tourne sur ta machine. Tu as quand même besoin d'Internet pour atteindre YouTube. Oui, on sait._",
  why_cookies_note:
    "**Pourquoi c'est important :** La plupart des téléchargeurs YouTube de bureau finissent par te demander d'exporter les cookies de ton navigateur dès que YouTube met à jour sa détection de bots. Ces sessions expirent toutes les ~30 minutes — et la doc de yt-dlp prévient elle-même que l'automatisation à base de cookies peut faire bannir ton compte Google. Arroxy ne demande jamais de cookies, ni de login, ni d'identifiants. Il demande les mêmes tokens que YouTube envoie à n'importe quel vrai navigateur — zéro risque pour ton compte, aucune expiration.",
  why_summary:
    "Arroxy est une application desktop **gratuite, open source et soucieuse de la vie privée** — pensée pour les gens qui veulent de la simplicité sans superflu. Tes téléchargements ne passent jamais par un serveur tiers. Zéro télémétrie, zéro collecte de données. Colle une URL, c'est parti.",
  what_1:
    "**Colle n'importe quelle URL YouTube** — vidéos, Shorts, peu importe — Arroxy récupère tous les formats disponibles en quelques secondes",
  what_2:
    "**Choisis la qualité** — jusqu'à 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps et plus, audio seul (MP3/AAC/Opus), ou un préréglage rapide (Meilleure qualité / Équilibré / Petit fichier)",
  what_3:
    "**Support complet du haut framerate** — les flux 60 fps, 120 fps et HDR sont préservés exactement comme YouTube les encode",
  what_4:
    "**Choisis où enregistrer** — le dernier dossier est mémorisé, ou choisis-en un nouveau à chaque fois",
  what_5:
    "**Un clic pour télécharger** — barre de progression en temps réel, annulable à tout moment",
  what_6:
    "**File d'attente multi-vidéos** — le panneau de téléchargement suit tout en parallèle",
  what_7:
    "**Télécharger les sous-titres** — récupère les sous-titres manuels ou auto-générés en SRT, VTT ou ASS, dans toute langue disponible. Enregistre-les à côté de la vidéo, intègre-les dans un `.mkv` portable, ou range-les dans un sous-dossier `Subtitles/` dédié",
  what_8:
    "**Intégration SponsorBlock** — passe ou marque les segments sponsors, intros, outros, autopromos et plus encore. Marque-les comme chapitres (non destructif) ou coupe-les avec FFmpeg — ton choix, par catégorie",
  what_9:
    "**Disponible en 9 langues** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — détecte la langue de ton système, modifiable à tout moment",
  what_10:
    "**Surveillance du presse-papiers** — copiez n'importe quel lien YouTube et Arroxy remplit le champ URL dès que vous revenez à l'app. Un dialogue de confirmation garde le contrôle ; désactivez-le depuis les Paramètres avancés à tout moment",
  what_11:
    "**Nettoyage auto des URLs** — les liens YouTube collés ou récupérés du presse-papiers sont débarrassés des paramètres de tracking (`si`, `pp`, `feature`, `utm_*`, `fbclid`, `gclid` et plus), et les enveloppes `youtube.com/redirect` sont déballées — le champ URL affiche toujours le lien canonique",
  what_12:
    "**Se réduit dans le tray** — fermer la fenêtre loge Arroxy dans la barre système. Les téléchargements continuent ; cliquez sur l'icône pour rouvrir la fenêtre, ou quittez depuis le menu de la barre",
  what_13:
    "**Chapitres, métadonnées et miniature intégrés** — titre, date de mise en ligne, artiste, description et pochette écrits directement dans le fichier ; les marqueurs de chapitres permettent la navigation par section dans tout lecteur moderne",
  shot1_alt: "Coller une URL",
  shot2_alt: "Choisir la qualité",
  shot3_alt: "Choisir où enregistrer",
  shot4_alt: "File de téléchargement en action",
  shot5_alt: "Choisir les langues, le format et le mode d'enregistrement des sous-titres",
  plan_intro:
    "Sur la feuille de route — pas encore livré, par ordre de priorité approximatif.",
  plan_col1: "Fonction",
  plan_col2: "Description",
  plan_r1_name: "**Téléchargement de playlists et chaînes**",
  plan_r1_desc:
    "Colle l'URL d'une playlist ou d'une chaîne pour mettre toutes les vidéos en file, avec filtres date/nombre",
  plan_r2_name: "**Saisie d'URLs en lot**",
  plan_r2_desc: "Colle plusieurs URLs d'un coup et lance tout ensemble",
  plan_r3_name: "**Conversion de format**",
  plan_r3_desc:
    "Convertis les téléchargements en MP3, WAV, FLAC ou autres sans outil supplémentaire",
  plan_r4_name: "**Modèles de noms de fichier**",
  plan_r4_desc:
    "Nomme par titre, auteur, date, résolution ou combinaison — avec aperçu en direct",
  plan_r5_name: "**Téléchargements programmés**",
  plan_r5_desc:
    "Définis une heure pour qu'Arroxy démarre — pratique pour les grosses files la nuit",
  plan_r6_name: "**Limites de vitesse de téléchargement**",
  plan_r6_desc:
    "Plafonne la bande passante pour ne pas saturer ta connexion pendant que tu travailles",
  plan_r7_name: "**Découpe de clips**",
  plan_r7_desc:
    "Spécifie un début et une fin pour ne télécharger qu'un segment d'une vidéo",
  plan_cta:
    "Une fonctionnalité en tête qui n'est pas ici ? [Ouvre une demande](../../issues) — la voix de la communauté oriente la suite.",
  dl_intro:
    "Arroxy est en développement actif. Récupère le dernier build sur la page [Releases](../../releases).",
  dl_platform_col: "Plateforme",
  dl_format_col: "Format",
  dl_win_format: "Installeur (NSIS) ou `.exe` portable",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ou `.flatpak` (sandboxed)",
  dl_run: "Télécharge, lance, terminé.",
  dl_pkg_h3: "Installation via gestionnaire de paquets",
  dl_channel_col: "Canal",
  dl_command_col: "Commande",
  dl_winget_or: "ou",
  dl_win_intro: "Deux builds disponibles — choisis celui qui te convient :",
  dl_win_col_installer: "Installeur NSIS",
  dl_win_col_portable: "`.exe` portable",
  dl_win_r1: "Installation requise",
  dl_win_r1_installer: "Oui",
  dl_win_r1_portable: "Non — exécutable de partout",
  dl_win_r2: "Mises à jour automatiques",
  dl_win_r2_installer: "✅ dans l'app",
  dl_win_r2_portable: "❌ téléchargement manuel",
  dl_win_r3: "Vitesse de démarrage",
  dl_win_r3_installer: "✅ plus rapide",
  dl_win_r3_portable: "⚠️ démarrage à froid plus lent",
  dl_win_r4: "Ajouté au menu Démarrer",
  dl_win_r5: "Désinstallation simple",
  dl_win_r5_portable: "❌ supprime juste le fichier",
  dl_win_rec:
    "**Recommandation :** prends l'installeur NSIS si tu veux qu'Arroxy se mette à jour tout seul et démarre plus vite. Prends le `.exe` portable si tu préfères ne rien installer ni toucher au registre.",
  dl_macos_note:
    "**Note :** Je n'ai pas de Mac, donc le build macOS n'est pas testé par moi-même. Si quelque chose ne marche pas — l'app ne se lance pas, le `.dmg` est cassé, le contournement de quarantaine échoue — merci d'[ouvrir un issue](../../issues) pour me prévenir. Tout retour des utilisateurs macOS est franchement apprécié.",
  dl_macos_warning:
    "Arroxy n'est pas encore signé. macOS affichera un avertissement de sécurité au premier lancement — c'est normal, ça ne veut pas dire que le fichier est endommagé.",
  dl_macos_m1_h4: "Méthode 1 : Réglages Système (recommandé)",
  dl_macos_step_col1: "Étape",
  dl_macos_step_col2: "Action",
  dl_macos_step1: "Clic droit sur l'icône d'Arroxy et choisis **Ouvrir**.",
  dl_macos_step2:
    'Une boîte de dialogue d\'avertissement apparaît. Clique sur **Annuler** (pas sur « Mettre à la corbeille »).',
  dl_macos_step3:
    "Ouvre **Réglages Système → Confidentialité et sécurité**.",
  dl_macos_step4:
    'Descends jusqu\'à la section **Sécurité** — tu verras _« Arroxy a été bloqué car il ne provient pas d\'un développeur identifié. »_',
  dl_macos_step5:
    "Clique sur **Ouvrir quand même**, puis confirme avec ton mot de passe ou Touch ID.",
  dl_macos_after:
    "Après l'étape 5, Arroxy s'ouvre normalement et l'avertissement ne reviendra plus.",
  dl_macos_m2_h4: "Méthode 2 : Terminal (avancé)",
  dl_macos_m2_text:
    "Si ce qui précède ne marche pas, exécute ceci une fois après avoir glissé Arroxy dans Applications :",
  dl_linux_intro:
    "Les AppImages ne s'installent pas — elles s'exécutent directement. Tu dois juste marquer le fichier comme exécutable d'abord.",
  dl_linux_m1_h4: "Méthode 1 : Gestionnaire de fichiers",
  dl_linux_m1_text:
    "Clic droit sur le fichier `.AppImage` → **Propriétés** → **Permissions** → active **Autoriser l'exécution du fichier comme programme**, puis double-clique pour lancer.",
  dl_linux_m2_h4: "Méthode 2 : Terminal",
  dl_linux_fuse_text:
    "S'il refuse encore de se lancer, il te manque peut-être FUSE (requis par AppImage) :",
  dl_linux_flatpak_h4: "Flatpak (alternative en sandbox)",
  dl_linux_flatpak_intro:
    "Tu préfères une installation correctement isolée ? Récupère le bundle `Arroxy-*.flatpak` depuis la même page de release et installe-le localement — pas de configuration Flathub, pas de droits admin, pas besoin du shim `libfuse2` (Flatpak utilise bubblewrap pour la sandbox).",
  privacy_intro:
    "Arroxy tourne entièrement sur ta machine. Quand tu télécharges une vidéo :",
  privacy_step1:
    "Arroxy appelle l'URL YouTube directement avec [yt-dlp](https://github.com/yt-dlp/yt-dlp) — un outil open source auditable et toujours à jour",
  privacy_step2:
    "Le fichier est sauvegardé directement dans le dossier que tu as choisi",
  privacy_step3:
    "Zéro télémétrie. Rien n'est journalisé, tracé ou envoyé où que ce soit — jamais.",
  privacy_outro:
    "Ton historique de visionnage, ton historique de téléchargement et le contenu des fichiers restent sur ton appareil. 100 % privé.",
  faq_q1: "Quelles qualités de vidéo puis-je télécharger ?",
  faq_a1:
    "Tout ce que YouTube propose — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p et audio seul. Les flux haut framerate (60 fps, 120 fps) et HDR sont préservés tels quels. Arroxy te montre tous les formats disponibles et te laisse choisir précisément ce que tu veux récupérer.",
  faq_q2: "C'est vraiment gratuit ?",
  faq_a2: "Oui. Licence MIT. Pas de version premium, pas de fonctions verrouillées.",
  faq_q3: "Dans quelles langues Arroxy est-il disponible ?",
  faq_a3:
    "Neuf, prêtes à l'emploi : English, Español (espagnol), Deutsch (allemand), Français, 日本語 (japonais), 中文 (chinois), Русский (russe), Українська (ukrainien) et हिन्दी (hindi). Arroxy détecte la langue de ton système d'exploitation au premier lancement et tu peux changer à tout moment depuis le sélecteur de langue dans la barre d'outils. Envie d'ajouter ou d'améliorer une traduction ? Les fichiers de langue sont de simples objets TypeScript dans `src/shared/i18n/locales/` — [ouvre une PR](../../pulls).",
  faq_q4: "Faut-il installer quelque chose ?",
  faq_a4:
    "Non. yt-dlp et ffmpeg sont téléchargés automatiquement au premier lancement depuis leurs releases officielles GitHub et mis en cache sur ta machine. Après ça, aucune configuration supplémentaire.",
  faq_q5: "Est-ce que ça continuera de marcher si YouTube change quelque chose ?",
  faq_a5:
    "Oui — et Arroxy a deux couches de résilience. Premièrement, yt-dlp est l'un des outils open source les plus activement maintenus — il est mis à jour dans les heures qui suivent les changements YouTube. Deuxièmement, Arroxy ne dépend pas du tout des cookies ni de ton compte Google, donc aucune session n'expire et aucun identifiant à renouveler. Cette combinaison le rend bien plus stable que les outils dépendant de cookies de navigateur exportés.",
  faq_q6: "Puis-je télécharger des playlists ?",
  faq_a6:
    "Aujourd'hui, seules les vidéos individuelles sont supportées. Le support des playlists et des chaînes est sur la feuille de route — voir [Fonctions prévues](#features).",
  faq_q7: "A-t-il besoin de mon compte YouTube ou de cookies ?",
  faq_a7:
    "Non — et c'est plus important qu'il n'y paraît. La plupart des outils qui cessent de fonctionner après une mise à jour de YouTube te disent d'exporter les cookies YouTube de ton navigateur. Ce contournement casse toutes les ~30 minutes quand YouTube renouvelle les sessions, et la doc de yt-dlp prévient que ça peut faire signaler ton compte Google. Arroxy n'utilise jamais de cookies ni d'identifiants. Pas de login. Pas de compte lié. Rien à expirer, rien à bannir.",
  faq_q8: 'macOS dit « l\'application est endommagée » ou « ne peut pas être ouverte » — que faire ?',
  faq_a8:
    "C'est Gatekeeper de macOS qui bloque une app non signée — pas un vrai dommage. Voir [Premier lancement sur macOS](#macos) pour la marche à suivre.",
  faq_q9: "C'est légal ?",
  faq_a9:
    "Télécharger des vidéos pour un usage personnel est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les Conditions d'Utilisation de YouTube et les lois de ton pays.",
  tech_content:
    "Pour les détails techniques, les instructions de compilation depuis les sources, les prérequis par plateforme et la contribution, voir le [README en anglais](README.md#tech).",
  tos_note:
    "**Conditions d'utilisation :** Arroxy est un outil destiné à un usage personnel et privé. Tu es seul responsable du fait que tes téléchargements respectent les [Conditions d'utilisation](https://www.youtube.com/t/terms) de YouTube et le droit d'auteur de ta juridiction. N'utilise pas Arroxy pour télécharger, reproduire ou distribuer du contenu sur lequel tu n'as pas de droits. Les développeurs d'Arroxy ne sont pas responsables de tout usage abusif.",
  footer_credit:
    'Licence MIT · Fait avec soin par <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};

const ja = {
  icon_alt: "Arroxy マスコット",
  title: "Arroxy — 無料・オープンソースの YouTube ダウンローダー",
  read_in_label: "言語：",
  badge_release_alt: "リリース",
  badge_lastcommit_alt: "最終コミット",
  badge_platforms_alt: "プラットフォーム",
  badge_i18n_alt: "対応言語",
  badge_license_alt: "ライセンス",
  hero_bold: "YouTube の広告で動画を台無しにされていませんか？",
  hero_tagline:
    "動画も Shorts も最高画質で保存 — 4K、1080p60、HDR、それ以上にも対応。速くて、無料で、100% あなたのもの。",
  hero_nopes: "広告なし。トラッキングなし。Cookie なし。ログインなし。余計なものなし。",
  cta_latest: "最新リリース →",
  demo_alt: "Arroxy デモ",
  ai_notice:
    "> 🌐 これは AI 翻訳です。[英語版 README](README.md) が情報のソースです。誤りを見つけたら [PR を歓迎します](../../pulls)。",
  toc_heading: "目次",
  why_h2: "なぜ Arroxy？",
  what_h2: "できること",
  plan_h2: "計画中の機能",
  dl_h2: "ダウンロード",
  dl_win_h3: "Windows：インストーラ vs ポータブル",
  dl_macos_h3: "macOS の初回起動",
  dl_linux_h3: "Linux の初回起動",
  privacy_h2: "プライバシー",
  faq_h2: "よくある質問",
  tech_h2: "技術詳細",
  why_col2: "ブラウザ拡張",
  why_col3: "オンライン変換サイト",
  why_col4: "その他のダウンローダー",
  why_r1: "ずっと無料",
  why_r2: "広告なし",
  why_r3: "アカウント不要",
  why_r4: "オフライン動作 _(ある程度)_",
  why_r5: "ファイルはローカルに保存",
  why_r6: "利用回数制限なし",
  why_r7: "オープンソース",
  why_r8: "ログイン・Cookie 一切不要",
  why_r9: "Google アカウント BAN リスクなし",
  why_offline_note:
    "_「オフライン動作」とは、変換処理が他人のサーバーで行われない、という意味です — 全工程があなたのマシン上で完結します。ただし YouTube に到達するためのインターネット接続は必要です。承知しています。_",
  why_cookies_note:
    "**これがなぜ重要か：** デスクトップ向けの YouTube ダウンローダーの多くは、YouTube が bot 検出を更新するたびにブラウザの Cookie のエクスポートを求めてきます。これらのセッションは約 30 分ごとに失効し、yt-dlp 公式ドキュメントも Cookie ベースの自動化が Google アカウントの BAN を引き起こす可能性があると警告しています。Arroxy は Cookie もログインも資格情報も一切要求しません。実際のブラウザに対して YouTube が発行するのと同じトークンを取得します — アカウントへのリスクはゼロ、有効期限もありません。",
  why_summary:
    "Arroxy は **無料・オープンソース・プライバシー優先** のデスクトップアプリです — 余計な機能なしのシンプルさを求める人のために作りました。あなたのダウンロードはサードパーティのサーバーを一切経由しません。テレメトリゼロ、データ収集ゼロ。URL を貼って、終わり。",
  what_1:
    "**YouTube の URL を貼り付け** — 動画でも Shorts でも何でも — Arroxy が数秒で利用可能なすべてのフォーマットを取得",
  what_2:
    "**画質を選ぶ** — 最大 4K UHD（2160p）、1440p、1080p、720p、60 fps 以上のフレームレート、音声のみ（MP3/AAC/Opus）、または簡単プリセット（最高画質 / バランス / 小さいファイル）",
  what_3:
    "**ハイフレームレート完全対応** — 60 fps、120 fps、HDR ストリームを YouTube のエンコードそのままに保存",
  what_4:
    "**保存先を選ぶ** — 前回のフォルダを記憶、または毎回選び直し",
  what_5: "**ワンクリックでダウンロード** — リアルタイム進捗バー、いつでもキャンセル可能",
  what_6: "**複数動画のキュー** — ダウンロードパネルですべてを同時に追跡",
  what_7:
    "**字幕をダウンロード** — 手動または自動生成の字幕を SRT、VTT、ASS で取得、利用可能なあらゆる言語に対応。動画の隣に保存、ポータブルな `.mkv` に埋め込み、または専用の `Subtitles/` サブフォルダに整理",
  what_8:
    "**SponsorBlock 連携** — スポンサー、イントロ、アウトロ、自己宣伝などのセグメントをスキップまたはマーク。非破壊的にチャプターとしてマークするか、FFmpeg で完全にカットするか — カテゴリごとに選択可能",
  what_9:
    "**9 言語対応** — English、Español、Deutsch、Français、日本語、中文、Русский、Українська、हिन्दी — システム言語を自動検出、いつでも切替可能",
  what_10:
    "**クリップボード監視** — YouTube リンクをコピーすると、アプリに戻った瞬間 Arroxy が URL フィールドを自動入力。確認ダイアログで常に制御を維持；詳細設定でいつでも無効化できます",
  what_11:
    "**URL 自動クリーンアップ** — 貼り付けたりクリップボードから取得した YouTube リンクからトラッキングパラメータ（`si`、`pp`、`feature`、`utm_*`、`fbclid`、`gclid` など）を除去し、`youtube.com/redirect` ラッパーを展開 — URL フィールドには常にクリーンな正規リンクが表示されます",
  what_12:
    "**トレイに格納** — ウィンドウを閉じると Arroxy はシステムトレイに格納されます。ダウンロードは継続し、トレイアイコンをクリックするとウィンドウが戻ります。トレイメニューから終了も可能です",
  what_13:
    "**チャプター・メタデータ・サムネイルを埋め込み** — タイトル、アップロード日、アーティスト、説明、カバーアートをファイルに直接書き込み。チャプターマーカーで現代のプレーヤーからセクション移動が可能",
  shot1_alt: "URL を貼る",
  shot2_alt: "画質を選ぶ",
  shot3_alt: "保存先を選ぶ",
  shot4_alt: "ダウンロードキューが稼働中",
  shot5_alt: "字幕の言語・フォーマット・保存モードを選ぶ",
  plan_intro: "ロードマップ上の項目 — まだリリースされていません。優先順位順に並んでいます。",
  plan_col1: "機能",
  plan_col2: "説明",
  plan_r1_name: "**プレイリスト・チャンネル DL**",
  plan_r1_desc:
    "プレイリストやチャンネルの URL を貼ると全動画をキューに追加。日付や件数のフィルタも対応",
  plan_r2_name: "**複数 URL の一括入力**",
  plan_r2_desc: "複数の URL を一度に貼り付けて一気に開始",
  plan_r3_name: "**フォーマット変換**",
  plan_r3_desc: "ダウンロードを MP3、WAV、FLAC などへ変換 — 別のツール不要",
  plan_r4_name: "**ファイル名テンプレート**",
  plan_r4_desc:
    "タイトル、投稿者、日付、解像度などを組み合わせて命名 — リアルタイムプレビュー付き",
  plan_r5_name: "**スケジュールダウンロード**",
  plan_r5_desc: "Arroxy の開始時刻を設定 — 大量キューを夜間に回すのに便利",
  plan_r6_name: "**ダウンロード速度制限**",
  plan_r6_desc:
    "帯域を制限して、作業中にダウンロードが回線を埋め尽くさないように",
  plan_r7_name: "**クリップトリミング**",
  plan_r7_desc: "開始・終了時刻を指定して動画の一部分だけをダウンロード",
  plan_cta:
    "ここに無い機能のアイデアは？[リクエストを開いてください](../../issues) — コミュニティの声が次に作るものを決めます。",
  dl_intro:
    "Arroxy は活発に開発中です。最新ビルドは [Releases](../../releases) ページから取得してください。",
  dl_platform_col: "プラットフォーム",
  dl_format_col: "フォーマット",
  dl_win_format: "インストーラ（NSIS）またはポータブル `.exe`",
  dl_mac_format: "`.dmg`（Intel + Apple Silicon）",
  dl_linux_format: "`.AppImage` または `.flatpak`（サンドボックス）",
  dl_run: "ダウンロード、起動、完了。",
  dl_pkg_h3: "パッケージマネージャー経由",
  dl_channel_col: "チャンネル",
  dl_command_col: "コマンド",
  dl_winget_or: "または",
  dl_win_intro: "2 つのビルドが用意されています — お好みのものを：",
  dl_win_col_installer: "NSIS インストーラ",
  dl_win_col_portable: "ポータブル `.exe`",
  dl_win_r1: "インストール必要",
  dl_win_r1_installer: "はい",
  dl_win_r1_portable: "いいえ — どこからでも実行可能",
  dl_win_r2: "アプリ内自動アップデート",
  dl_win_r2_installer: "✅",
  dl_win_r2_portable: "❌ 手動ダウンロード",
  dl_win_r3: "起動速度",
  dl_win_r3_installer: "✅ 速い",
  dl_win_r3_portable: "⚠️ コールドスタートが遅め",
  dl_win_r4: "スタートメニューに追加",
  dl_win_r5: "簡単アンインストール",
  dl_win_r5_portable: "❌ ファイルを削除するだけ",
  dl_win_rec:
    "**おすすめ：** Arroxy を自動更新させ、起動を速くしたいなら NSIS インストーラ。インストール不要・レジストリ非変更を好むならポータブル `.exe`。",
  dl_macos_note:
    "**注意：** Mac を持っていないため、macOS ビルドは私自身ではテストしていません。動かない・`.dmg` が壊れている・隔離回避が失敗する、などあれば [issue を開いて](../../issues) 教えてください。macOS ユーザーからのフィードバックは本当にありがたいです。",
  dl_macos_warning:
    "Arroxy はまだコード署名されていません。初回起動時に macOS がセキュリティ警告を出します — これは想定内で、ファイルが壊れているわけではありません。",
  dl_macos_m1_h4: "方法 1：システム設定（推奨）",
  dl_macos_step_col1: "手順",
  dl_macos_step_col2: "操作",
  dl_macos_step1: "Arroxy のアイコンを右クリックして **開く** を選択。",
  dl_macos_step2:
    '警告ダイアログが出たら **キャンセル** をクリック（"ゴミ箱に入れる" は押さない）。',
  dl_macos_step3: "**システム設定 → プライバシーとセキュリティ** を開く。",
  dl_macos_step4:
    '**セキュリティ** セクションまでスクロール — _"Arroxy は確認済みの開発元のものではないためブロックされました"_ と表示されています。',
  dl_macos_step5:
    "**このまま開く** をクリックし、パスワードまたは Touch ID で確認。",
  dl_macos_after: "手順 5 のあとは Arroxy が普通に開き、警告は二度と表示されません。",
  dl_macos_m2_h4: "方法 2：ターミナル（上級者向け）",
  dl_macos_m2_text:
    "上記がうまくいかない場合は、Arroxy をアプリケーションフォルダに移動した後、一度だけこれを実行：",
  dl_linux_intro:
    "AppImage はインストール不要 — 直接実行できます。最初に実行可能フラグを立てるだけです。",
  dl_linux_m1_h4: "方法 1：ファイルマネージャ",
  dl_linux_m1_text:
    "`.AppImage` を右クリック → **プロパティ** → **権限** → **プログラムとして実行を許可** を有効化、ダブルクリックで起動。",
  dl_linux_m2_h4: "方法 2：ターミナル",
  dl_linux_fuse_text:
    "それでも起動しないなら、FUSE が無いかもしれません（AppImage に必要）：",
  dl_linux_flatpak_h4: "Flatpak（サンドボックス版）",
  dl_linux_flatpak_intro:
    "ちゃんとサンドボックス化された方がいい？ 同じリリースページから `Arroxy-*.flatpak` バンドルを取得し、ローカルにインストールできます — Flathub のセットアップ不要、管理者権限不要、`libfuse2` シムも不要（Flatpak はサンドボックスに bubblewrap を使用）。",
  privacy_intro:
    "Arroxy はあなたのマシン上で完結します。動画をダウンロードする際：",
  privacy_step1:
    "Arroxy は [yt-dlp](https://github.com/yt-dlp/yt-dlp) を使って YouTube の URL を直接呼び出します — 監査可能で常に最新のオープンソースツール",
  privacy_step2: "ファイルはあなたが選んだフォルダに直接保存",
  privacy_step3:
    "テレメトリゼロ。記録・追跡・送信は一切ありません — どこにも、いつでも。",
  privacy_outro:
    "視聴履歴、ダウンロード履歴、ファイルの中身はあなたのデバイスに留まります。100% プライベート。",
  faq_q1: "どの画質でダウンロードできますか？",
  faq_a1:
    "YouTube が提供するすべて — 4K UHD（2160p）、1440p QHD、1080p Full HD、720p、480p、360p、音声のみ。ハイフレームレート（60 fps、120 fps）と HDR コンテンツはそのまま保存されます。Arroxy は利用可能な全フォーマットを表示し、ピンポイントで選ばせてくれます。",
  faq_q2: "本当に無料ですか？",
  faq_a2: "はい。MIT ライセンス。プレミアム版や機能ロックはありません。",
  faq_q3: "Arroxy は何カ国語に対応していますか？",
  faq_a3:
    "9 言語に標準対応：English、Español（スペイン語）、Deutsch（ドイツ語）、Français（フランス語）、日本語、中文（中国語）、Русский（ロシア語）、Українська（ウクライナ語）、हिन्दी（ヒンディー語）。Arroxy は初回起動時に OS の言語を自動検出し、ツールバーの言語選択でいつでも切り替え可能です。翻訳の追加・改善をしたい？言語ファイルは `src/shared/i18n/locales/` の素の TypeScript オブジェクトです — [PR を開いてください](../../pulls)。",
  faq_q4: "何かインストールが必要ですか？",
  faq_a4:
    "いいえ。yt-dlp と ffmpeg は初回起動時に公式 GitHub releases から自動ダウンロードされ、マシンにキャッシュされます。それ以降は追加のセットアップ不要。",
  faq_q5: "YouTube が変更したら使えなくなりますか？",
  faq_a5:
    "いいえ — Arroxy には 2 段階の耐性があります。第一に、yt-dlp はオープンソースで最も活発に保守されているツールの 1 つで、YouTube の変更から数時間以内に更新されます。第二に、Arroxy は Cookie や Google アカウントに一切依存しないため、失効するセッションも、ローテートする資格情報もありません。この組み合わせにより、ブラウザの Cookie に依存するツールよりも遥かに安定しています。",
  faq_q6: "プレイリストはダウンロードできますか？",
  faq_a6:
    "現在は単一動画のみサポート。プレイリストとチャンネルのサポートはロードマップ上 — [計画中の機能](#features) を参照。",
  faq_q7: "YouTube アカウントや Cookie が必要ですか？",
  faq_a7:
    "いいえ — そしてこれは思っているより重要なポイントです。YouTube の更新後に動かなくなるツールの大半は、ブラウザの YouTube Cookie のエクスポートを指示してきます。その回避策は YouTube がセッションをローテーションする約 30 分ごとに壊れますし、yt-dlp の公式ドキュメントもそれが Google アカウントのフラグ立てにつながると警告しています。Arroxy は Cookie も資格情報も一切使いません。ログインなし、アカウント連携なし、失効するものも、BAN されるものもありません。",
  faq_q8: 'macOS で「アプリが壊れている」「開けません」と表示される — どうすれば？',
  faq_a8:
    "これは macOS Gatekeeper が未署名アプリをブロックしているもので、実際に壊れているわけではありません。ステップごとの手順は [macOS の初回起動](#macos) を参照。",
  faq_q9: "これは合法ですか？",
  faq_a9:
    "個人使用のための動画ダウンロードは、ほとんどの法域で一般的に容認されています。YouTube の利用規約および所在地の法律の遵守はあなたの責任です。",
  tech_content:
    "技術詳細、ソースからのビルド手順、プラットフォーム別の前提条件、貢献方法については、[英語版 README](README.md#tech) を参照してください。",
  tos_note:
    "**利用規約：** Arroxy は個人的・私的利用のためのツールです。ダウンロードが YouTube の [利用規約](https://www.youtube.com/t/terms) およびあなたの法域の著作権法に準拠することは、あなた自身の責任です。権利を持たないコンテンツのダウンロード・複製・配布に Arroxy を使用しないでください。Arroxy の開発者は誤用について一切の責任を負いません。",
  footer_credit:
    'MIT ライセンス · <a href="https://x.com/OrionusAI">@OrionusAI</a> が心を込めて制作',
};

const zh = {
  icon_alt: "Arroxy 吉祥物",
  title: "Arroxy — 免费开源 YouTube 下载器（油管下载器）",
  read_in_label: "阅读语言：",
  badge_release_alt: "发布",
  badge_lastcommit_alt: "最近提交",
  badge_platforms_alt: "平台",
  badge_i18n_alt: "语言",
  badge_license_alt: "许可证",
  hero_bold: "受够了 YouTube 广告毁掉视频体验？",
  hero_tagline:
    "任意视频或 Shorts 一键下载，画质拉满 — 4K、1080p60、HDR，应有尽有。快速、免费、完全属于你。",
  hero_nopes: "无广告。无追踪。无 Cookie。无需登录。零废话。",
  cta_latest: "最新版本 →",
  demo_alt: "Arroxy 演示",
  ai_notice:
    "> 🌐 这是 AI 辅助翻译。[英文 README](README.md) 是真实来源。发现错误？欢迎 [提交 PR](../../pulls)。",
  toc_heading: "目录",
  why_h2: "为什么选 Arroxy？",
  what_h2: "它能做什么",
  plan_h2: "计划中的功能",
  dl_h2: "下载",
  dl_win_h3: "Windows：安装版 vs 便携版",
  dl_macos_h3: "macOS 首次启动",
  dl_linux_h3: "Linux 首次启动",
  privacy_h2: "隐私",
  faq_h2: "常见问题",
  tech_h2: "技术细节",
  why_col2: "浏览器扩展",
  why_col3: "在线转换器",
  why_col4: "其他下载器",
  why_r1: "永久免费",
  why_r2: "无广告",
  why_r3: "无需账号",
  why_r4: "离线可用 _(差不多算)_",
  why_r5: "文件保留在本地",
  why_r6: "无使用上限",
  why_r7: "开源",
  why_r8: "永远不需要登录或 Cookie",
  why_r9: "不会有 Google 账号被封风险",
  why_offline_note:
    '_"离线可用" 指的是没有任何转换发生在别人的服务器上 — 整个流程都在你的机器上跑。但你仍需联网访问 YouTube。是的，我们知道。_',
  why_cookies_note:
    "**为什么这点很重要：** 大多数桌面 YouTube 下载器在 YouTube 更新机器人检测后，最终都会要求你导出浏览器 Cookie。这些会话每 30 分钟左右就会过期 — 而 yt-dlp 自己的文档警告基于 Cookie 的自动化可能会导致你的 Google 账号被封。Arroxy 永远不会要求 Cookie、登录或任何凭据。它请求的是 YouTube 给任何真实浏览器都会发的同样的 token — 账号零风险，无过期。",
  why_summary:
    "Arroxy 是一款 **免费、开源、隐私优先** 的桌面应用 — 为追求简单、不要臃肿的人打造。你的下载从不经过第三方服务器。零遥测、零数据收集。粘贴 URL，一键搞定。",
  what_1:
    "**粘贴任意 YouTube 链接** — 视频、Shorts、什么都行 — Arroxy 几秒内拉取所有可用格式",
  what_2:
    "**挑选画质** — 最高 4K UHD（2160p）、1440p、1080p、720p、60 fps 及更高帧率，纯音频（MP3/AAC/Opus），或者用快速预设（最佳画质 / 平衡 / 小文件）",
  what_3:
    "**完整高帧率支持** — 60 fps、120 fps 和 HDR 流完整保留 YouTube 原始编码",
  what_4: "**选择保存位置** — 记住上次的文件夹，或者每次都重新选",
  what_5: "**一键下载** — 实时进度条，随时取消",
  what_6: "**多视频队列** — 下载面板同时跟踪所有任务",
  what_7:
    "**下载字幕** — 以 SRT、VTT 或 ASS 获取手动或自动生成的字幕，支持任何可用语言。保存到视频旁边、嵌入便携的 `.mkv`，或整理到专门的 `Subtitles/` 子文件夹中",
  what_8:
    "**SponsorBlock 集成** — 跳过或标记赞助商、片头、片尾、自我推广等片段。非破坏性地标记为章节，或使用 FFmpeg 直接剪除 — 按类别自由选择",
  what_9:
    "**9 种语言可用** — English、Español、Deutsch、Français、日本語、中文、Русский、Українська、हिन्दी — 自动检测系统语言，随时切换",
  what_10:
    "**剪贴板监控** — 复制任意 YouTube 链接，切换回应用时 Arroxy 自动填写 URL 字段。确认对话框让你保持控制；随时可从高级设置中停用",
  what_11:
    "**自动清理 URL** — 粘贴或从剪贴板获取的 YouTube 链接会自动剥除跟踪参数（`si`、`pp`、`feature`、`utm_*`、`fbclid`、`gclid` 等），并解包 `youtube.com/redirect` 跳转链接 — URL 字段始终显示规范链接",
  what_12:
    "**最小化到托盘** — 关闭窗口后 Arroxy 将缩入系统托盘，下载持续运行。单击托盘图标可恢复窗口，或通过托盘菜单退出应用",
  what_13:
    "**嵌入章节、元数据与封面** — 标题、上传日期、艺术家、描述和封面图直接写入文件；章节标记让任何现代播放器都能按节导航",
  shot1_alt: "粘贴 URL",
  shot2_alt: "选择画质",
  shot3_alt: "选择保存位置",
  shot4_alt: "下载队列运行中",
  shot5_alt: "选择字幕语言、格式与保存方式",
  plan_intro: "路线图上的内容 — 尚未发布，按优先级大致排序。",
  plan_col1: "功能",
  plan_col2: "描述",
  plan_r1_name: "**播放列表与频道下载**",
  plan_r1_desc:
    "粘贴播放列表或频道链接，一次性把所有视频加入队列，支持按日期或数量过滤",
  plan_r2_name: "**批量 URL 输入**",
  plan_r2_desc: "一次粘贴多个链接，全部一起开跑",
  plan_r3_name: "**格式转换**",
  plan_r3_desc: "把下载内容转成 MP3、WAV、FLAC 等格式，无需额外工具",
  plan_r4_name: "**自定义文件名模板**",
  plan_r4_desc: "按标题、上传者、日期、分辨率或任意组合命名 — 带实时预览",
  plan_r5_name: "**定时下载**",
  plan_r5_desc: "设定时间让 Arroxy 自动开始下载 — 适合大队列连夜跑",
  plan_r6_name: "**下载速度限制**",
  plan_r6_desc: "限制带宽，避免下载占满你的网线",
  plan_r7_name: "**片段裁剪**",
  plan_r7_desc: "指定起止时间，只下载视频的某一段",
  plan_cta:
    "想到了这里没有的功能？[发起一个请求](../../issues) — 社区意见决定下一步开发什么。",
  dl_intro:
    "Arroxy 处于活跃开发中。从 [Releases](../../releases) 页面获取最新构建。",
  dl_platform_col: "平台",
  dl_format_col: "格式",
  dl_win_format: "安装版（NSIS）或便携版 `.exe`",
  dl_mac_format: "`.dmg`（Intel + Apple Silicon）",
  dl_linux_format: "`.AppImage` 或 `.flatpak`（沙箱）",
  dl_run: "下载、运行，搞定。",
  dl_pkg_h3: "通过包管理器安装",
  dl_channel_col: "渠道",
  dl_command_col: "命令",
  dl_winget_or: "或",
  dl_win_intro: "提供两种构建 — 看你需要哪种：",
  dl_win_col_installer: "NSIS 安装版",
  dl_win_col_portable: "便携版 `.exe`",
  dl_win_r1: "需要安装",
  dl_win_r1_installer: "是",
  dl_win_r1_portable: "否 — 任意位置直接运行",
  dl_win_r2: "应用内自动更新",
  dl_win_r2_installer: "✅",
  dl_win_r2_portable: "❌ 需手动下载",
  dl_win_r3: "启动速度",
  dl_win_r3_installer: "✅ 更快",
  dl_win_r3_portable: "⚠️ 冷启动较慢",
  dl_win_r4: "加入开始菜单",
  dl_win_r5: "卸载方便",
  dl_win_r5_portable: "❌ 删文件即可",
  dl_win_rec:
    "**建议：** 想让 Arroxy 自动更新且启动更快，用 NSIS 安装版。想要免安装、不写注册表，用便携版 `.exe`。",
  dl_macos_note:
    "**注意：** 我没有 Mac，所以 macOS 版本我没有亲自测过。如果有什么不工作 — app 打不开、`.dmg` 损坏、隔离绕过失败 — 请 [开个 issue](../../issues) 告诉我。Mac 用户的任何反馈我都非常感谢。",
  dl_macos_warning:
    "Arroxy 还没做代码签名。第一次打开时 macOS 会显示安全警告 — 这是正常的，并不是文件损坏。",
  dl_macos_m1_h4: "方法 1：系统设置（推荐）",
  dl_macos_step_col1: "步骤",
  dl_macos_step_col2: "操作",
  dl_macos_step1: "在 Arroxy 图标上右键，选择 **打开**。",
  dl_macos_step2: '出现警告对话框。点 **取消**（不要点 "移到废纸篓"）。',
  dl_macos_step3: "打开 **系统设置 → 隐私与安全性**。",
  dl_macos_step4:
    '滚动到 **安全性** 部分 — 你会看到 _"Arroxy 已被阻止使用，因为它不是由可识别的开发者提供的。"_',
  dl_macos_step5: "点 **仍然打开**，然后用密码或 Touch ID 确认。",
  dl_macos_after: "第 5 步之后，Arroxy 正常打开，以后再也不会显示警告。",
  dl_macos_m2_h4: "方法 2：终端（高级）",
  dl_macos_m2_text: "如果上面不管用，把 Arroxy 拖到应用程序后跑一次这个：",
  dl_linux_intro:
    "AppImage 不需要安装 — 直接运行。只需要先把文件标记为可执行。",
  dl_linux_m1_h4: "方法 1：文件管理器",
  dl_linux_m1_text:
    "右键 `.AppImage` 文件 → **属性** → **权限** → 启用 **允许作为程序执行**，然后双击运行。",
  dl_linux_m2_h4: "方法 2：终端",
  dl_linux_fuse_text: "如果还是启动不了，可能缺 FUSE（AppImage 需要）：",
  dl_linux_flatpak_h4: "Flatpak（沙箱版）",
  dl_linux_flatpak_intro:
    "想要真正沙箱化的安装？从同一发布页获取 `Arroxy-*.flatpak` 包并本地安装 — 无需配置 Flathub、无需管理员权限、无需 `libfuse2` 垫片（Flatpak 用 bubblewrap 做沙箱）。",
  privacy_intro: "Arroxy 完全在你的机器上运行。下载视频时：",
  privacy_step1:
    "Arroxy 用 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 直接调用 YouTube 链接 — 一个可审计、始终保持最新的开源工具",
  privacy_step2: "文件直接保存到你选的文件夹",
  privacy_step3:
    "零遥测。任何东西都不会被记录、追踪或发送到任何地方 — 永远不会。",
  privacy_outro:
    "你的观看历史、下载历史和文件内容都留在你的设备上。100% 私密。",
  faq_q1: "能下载哪些画质？",
  faq_a1:
    "YouTube 提供的都行 — 4K UHD（2160p）、1440p QHD、1080p Full HD、720p、480p、360p 以及纯音频。高帧率（60 fps、120 fps）和 HDR 内容原样保留。Arroxy 列出所有可用格式，让你精准挑选。",
  faq_q2: "真的免费吗？",
  faq_a2: "真的。MIT 许可证。没有付费版、没有功能门槛。",
  faq_q3: "Arroxy 支持哪些语言？",
  faq_a3:
    "开箱即用支持九种：English、Español（西班牙语）、Deutsch（德语）、Français（法语）、日本語（日语）、中文、Русский（俄语）、Українська（乌克兰语）、हिन्दी（印地语）。Arroxy 在首次启动时自动检测系统语言，随时可在工具栏的语言选择器中切换。想添加或改进翻译？语言文件是 `src/shared/i18n/locales/` 中的纯 TypeScript 对象 — [发个 PR](../../pulls)。",
  faq_q4: "需要装别的东西吗？",
  faq_a4:
    "不需要。yt-dlp 和 ffmpeg 在首次启动时从它们的官方 GitHub releases 自动下载并缓存到本地。之后无需任何额外配置。",
  faq_q5: "如果 YouTube 改了什么，还能用吗？",
  faq_a5:
    "能 — Arroxy 有两层保障。第一，yt-dlp 是社区里最活跃维护的开源工具之一 — YouTube 一变，几小时内就更新。第二，Arroxy 完全不依赖 Cookie 或你的 Google 账号，所以没有会话过期，没有凭据要轮换。这两点结合让它比依赖浏览器导出 Cookie 的工具稳定得多。",
  faq_q6: "能下播放列表吗？",
  faq_a6: "目前支持单个视频。播放列表和频道支持在路线图里 — 见 [计划中的功能](#features)。",
  faq_q7: "需要我的 YouTube 账号或 Cookie 吗？",
  faq_a7:
    "不需要 — 这事比听起来更重要。大多数在 YouTube 更新后就罢工的工具会让你导出浏览器的 YouTube Cookie。这种方案每 30 分钟左右就坏一次（YouTube 会轮换会话），而 yt-dlp 自己的文档警告这可能让你的 Google 账号被标记。Arroxy 从不使用 Cookie 或凭据。无登录、无账号绑定，没东西过期，没东西被封。",
  faq_q8: 'macOS 提示 "应用已损坏" 或 "无法打开" — 怎么办？',
  faq_a8:
    "这是 macOS Gatekeeper 在拦截未签名应用 — 并不是真的损坏。看 [macOS 首次启动](#macos) 的分步指引。",
  faq_q9: "这合法吗？",
  faq_a9:
    "为个人使用下载视频，在大多数地区一般是被接受的。你需要自己负责遵守 YouTube 的服务条款和当地法律。",
  tech_content:
    "技术细节、从源码构建说明、各平台先决条件以及如何贡献，请参见 [英文 README](README.md#tech)。",
  tos_note:
    "**使用条款：** Arroxy 是供个人私人使用的工具。你需要自行确保你的下载行为符合 YouTube 的 [服务条款](https://www.youtube.com/t/terms) 和你所在地区的版权法律。请勿使用 Arroxy 下载、复制或分发你不享有权利的内容。Arroxy 的开发者对任何滥用行为不承担责任。",
  footer_credit:
    'MIT 许可证 · 由 <a href="https://x.com/OrionusAI">@OrionusAI</a> 用心打造',
};

const ru = {
  icon_alt: "Маскот Arroxy",
  title: "Arroxy — бесплатный загрузчик YouTube с открытым исходным кодом",
  read_in_label: "Язык:",
  badge_release_alt: "Релиз",
  badge_lastcommit_alt: "Последний коммит",
  badge_platforms_alt: "Платформы",
  badge_i18n_alt: "Языки",
  badge_license_alt: "Лицензия",
  hero_bold: "Устали от рекламы YouTube, которая портит видео?",
  hero_tagline:
    "Скачивайте любое видео или Shorts в полном качестве — 4K, 1080p60, HDR и выше. Быстро, бесплатно и на 100 % ваше.",
  hero_nopes: "Без рекламы. Без слежки. Без кук. Без логина. Без ерунды.",
  cta_latest: "Последний релиз →",
  demo_alt: "Демо Arroxy",
  ai_notice:
    "> 🌐 Это перевод с помощью ИИ. [README на английском](README.md) — основной источник истины. Заметили ошибку? [Pull request приветствуется](../../pulls).",
  toc_heading: "Содержание",
  why_h2: "Почему Arroxy?",
  what_h2: "Что умеет",
  plan_h2: "Запланированные функции",
  dl_h2: "Скачать",
  dl_win_h3: "Windows: Установщик vs Портативная версия",
  dl_macos_h3: "Первый запуск на macOS",
  dl_linux_h3: "Первый запуск на Linux",
  privacy_h2: "Конфиденциальность",
  faq_h2: "Часто задаваемые вопросы",
  tech_h2: "Технические детали",
  why_col2: "Браузерные расширения",
  why_col3: "Онлайн-конвертеры",
  why_col4: "Другие загрузчики",
  why_r1: "Бесплатно навсегда",
  why_r2: "Без рекламы",
  why_r3: "Без аккаунта",
  why_r4: "Работает офлайн _(почти)_",
  why_r5: "Файлы остаются у вас",
  why_r6: "Без лимитов использования",
  why_r7: "Открытый исходный код",
  why_r8: "Никогда не нужны логин и куки",
  why_r9: "Нет риска бана аккаунта Google",
  why_offline_note:
    "_«Работает офлайн» означает, что никакая конвертация не происходит на чужом сервере — весь конвейер работает на вашей машине. Интернет всё равно нужен, чтобы достучаться до YouTube. Да, мы знаем._",
  why_cookies_note:
    "**Почему это важно:** Большинство десктопных загрузчиков YouTube рано или поздно просят экспортировать куки браузера, как только YouTube обновляет защиту от ботов. Эти сессии истекают каждые ~30 минут — и в документации yt-dlp прямо сказано, что автоматизация на куках может привести к бану аккаунта Google. Arroxy никогда не просит ни кук, ни логина, ни учётных данных. Он запрашивает те же токены, что YouTube выдаёт любому реальному браузеру — нулевой риск для аккаунта, без срока годности.",
  why_summary:
    "Arroxy — это **бесплатное, открытое, ориентированное на приватность** настольное приложение, созданное для тех, кто ценит простоту без раздутости. Ваши загрузки никогда не проходят через сторонний сервер. Ноль телеметрии, ноль сбора данных. Просто вставьте URL — и вперёд.",
  what_1:
    "**Вставьте любую ссылку YouTube** — видео, Shorts, что угодно — Arroxy за секунды получает все доступные форматы",
  what_2:
    "**Выберите качество** — до 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps и выше, только аудио (MP3/AAC/Opus), или быстрые пресеты (Лучшее качество / Сбалансированно / Маленький файл)",
  what_3:
    "**Полная поддержка высокого фреймрейта** — потоки 60 fps, 120 fps и HDR сохраняются ровно так, как их кодирует YouTube",
  what_4:
    "**Выберите, куда сохранять** — последняя папка запоминается, или выбирайте новую каждый раз",
  what_5:
    "**Скачивание в один клик** — индикатор прогресса в реальном времени, отмена в любой момент",
  what_6:
    "**Очередь из нескольких видео** — панель загрузок отслеживает всё одновременно",
  what_7:
    "**Загрузка субтитров** — берите ручные или авто-сгенерированные субтитры в SRT, VTT или ASS, на любом доступном языке. Сохраняйте рядом с видео, встраивайте в портативный `.mkv` или раскладывайте в отдельную подпапку `Subtitles/`",
  what_8:
    "**Интеграция SponsorBlock** — пропускайте или отмечайте сегменты с рекламой спонсоров, вступлениями, концовками, самопиаром и прочим. Помечайте как главы (неразрушающий режим) или вырезайте целиком через FFmpeg — ваш выбор, отдельно по каждой категории",
  what_9:
    "**Доступно на 9 языках** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — автоматически определяет язык системы, переключается в любой момент",
  what_10:
    "**Мониторинг буфера обмена** — скопируйте любую YouTube-ссылку, и Arroxy автоматически заполнит URL-поле при следующем переключении на приложение. Диалог подтверждения сохраняет контроль; отключается в расширенных настройках в любой момент",
  what_11:
    "**Автоочистка URL** — вставленные или взятые из буфера обмена YouTube-ссылки очищаются от трекинговых параметров (`si`, `pp`, `feature`, `utm_*`, `fbclid`, `gclid` и других), а обёртки `youtube.com/redirect` разворачиваются — в поле URL всегда отображается канонический адрес",
  what_12:
    "**Сворачивание в трей** — закрытие окна прячет Arroxy в системный трей. Загрузки продолжаются; кликните на значок трея, чтобы открыть окно снова, или выйдите через меню трея",
  what_13:
    "**Встроенные главы, метаданные и обложка** — название, дата загрузки, исполнитель, описание и обложка записываются прямо в файл; маркеры глав позволяют навигировать по разделам в любом современном плеере",
  shot1_alt: "Вставьте URL",
  shot2_alt: "Выберите качество",
  shot3_alt: "Выберите, куда сохранять",
  shot4_alt: "Очередь загрузок в работе",
  shot5_alt: "Выбор языков, формата и режима сохранения субтитров",
  plan_intro:
    "Что в дорожной карте — пока не выпущено, примерно в порядке приоритета.",
  plan_col1: "Функция",
  plan_col2: "Описание",
  plan_r1_name: "**Загрузка плейлистов и каналов**",
  plan_r1_desc:
    "Вставьте URL плейлиста или канала — все видео встанут в очередь, с фильтрами по дате и количеству",
  plan_r2_name: "**Пакетный ввод URL**",
  plan_r2_desc: "Вставьте сразу несколько ссылок и запустите всё одним махом",
  plan_r3_name: "**Конвертация форматов**",
  plan_r3_desc:
    "Конвертация загрузок в MP3, WAV, FLAC и другие форматы без сторонних утилит",
  plan_r4_name: "**Шаблоны имён файлов**",
  plan_r4_desc:
    "Имена по названию, автору, дате, разрешению или их комбинации — с живым предпросмотром",
  plan_r5_name: "**Запланированные загрузки**",
  plan_r5_desc:
    "Задайте время, когда Arroxy начнёт загрузку — удобно для больших очередей на ночь",
  plan_r6_name: "**Лимит скорости загрузки**",
  plan_r6_desc:
    "Ограничивайте полосу, чтобы загрузки не забивали канал во время работы",
  plan_r7_name: "**Обрезка клипов**",
  plan_r7_desc: "Укажите начало и конец, чтобы скачать только отрезок видео",
  plan_cta:
    "Есть идея, которой здесь нет? [Откройте запрос](../../issues) — мнение сообщества определяет, что появится дальше.",
  dl_intro:
    "Arroxy активно развивается. Берите свежий билд со страницы [Releases](../../releases).",
  dl_platform_col: "Платформа",
  dl_format_col: "Формат",
  dl_win_format: "Установщик (NSIS) или портативный `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` или `.flatpak` (sandbox)",
  dl_run: "Скачали — запустили — готово.",
  dl_pkg_h3: "Установка через пакетный менеджер",
  dl_channel_col: "Канал",
  dl_command_col: "Команда",
  dl_winget_or: "или",
  dl_win_intro: "Доступны две сборки — выбирайте, что подходит:",
  dl_win_col_installer: "Установщик NSIS",
  dl_win_col_portable: "Портативный `.exe`",
  dl_win_r1: "Требует установки",
  dl_win_r1_installer: "Да",
  dl_win_r1_portable: "Нет — запускается откуда угодно",
  dl_win_r2: "Авто-обновления",
  dl_win_r2_installer: "✅ в приложении",
  dl_win_r2_portable: "❌ ручное скачивание",
  dl_win_r3: "Скорость запуска",
  dl_win_r3_installer: "✅ быстрее",
  dl_win_r3_portable: "⚠️ долгий холодный старт",
  dl_win_r4: "Добавляется в меню «Пуск»",
  dl_win_r5: "Удобное удаление",
  dl_win_r5_portable: "❌ просто удалите файл",
  dl_win_rec:
    "**Рекомендация:** установщик NSIS, если хотите авто-обновления и быстрый запуск. Портативный `.exe`, если предпочитаете без установки и без правок реестра.",
  dl_macos_note:
    "**Примечание:** У меня нет Mac, поэтому сборку macOS я лично не тестировал. Если что-то не работает — приложение не запускается, `.dmg` сломан, обход карантина не срабатывает — пожалуйста, [откройте issue](../../issues) и сообщите. Любой фидбэк от пользователей macOS будет искренне ценен.",
  dl_macos_warning:
    "Arroxy пока не подписан кодом. macOS покажет предупреждение безопасности при первом запуске — это ожидаемо, файл не повреждён.",
  dl_macos_m1_h4: "Способ 1: Системные настройки (рекомендуется)",
  dl_macos_step_col1: "Шаг",
  dl_macos_step_col2: "Действие",
  dl_macos_step1:
    "Кликните правой кнопкой по иконке Arroxy и выберите **Открыть**.",
  dl_macos_step2:
    "Появится окно предупреждения. Нажмите **Отмена** (не «Переместить в корзину»).",
  dl_macos_step3:
    "Откройте **Системные настройки → Конфиденциальность и безопасность**.",
  dl_macos_step4:
    "Прокрутите до раздела **Безопасность** — увидите _«Arroxy заблокирован, так как разработчик не идентифицирован»_.",
  dl_macos_step5:
    "Нажмите **Открыть всё равно** и подтвердите паролем или Touch ID.",
  dl_macos_after:
    "После шага 5 Arroxy открывается как обычно, и предупреждение больше не появится.",
  dl_macos_m2_h4: "Способ 2: Терминал (продвинутый)",
  dl_macos_m2_text:
    "Если способ выше не сработал, после перетаскивания Arroxy в Программы выполните один раз:",
  dl_linux_intro:
    "AppImage не устанавливаются — они запускаются напрямую. Нужно только пометить файл как исполняемый.",
  dl_linux_m1_h4: "Способ 1: Файловый менеджер",
  dl_linux_m1_text:
    "ПКМ по файлу `.AppImage` → **Свойства** → **Права** → включите **Разрешить выполнение файла как программы**, затем дважды кликните, чтобы запустить.",
  dl_linux_m2_h4: "Способ 2: Терминал",
  dl_linux_fuse_text:
    "Если всё равно не запускается — возможно, отсутствует FUSE (нужен AppImage):",
  dl_linux_flatpak_h4: "Flatpak (изолированная альтернатива)",
  dl_linux_flatpak_intro:
    "Хотите по-настоящему изолированную установку? Скачайте бандл `Arroxy-*.flatpak` с той же страницы релиза и установите его локально — без настройки Flathub, без прав администратора, без шима `libfuse2` (Flatpak использует bubblewrap для песочницы).",
  privacy_intro:
    "Arroxy полностью работает на вашей машине. Когда вы скачиваете видео:",
  privacy_step1:
    "Arroxy напрямую обращается к URL YouTube через [yt-dlp](https://github.com/yt-dlp/yt-dlp) — открытый, проверяемый и всегда актуальный инструмент",
  privacy_step2: "Файл сохраняется прямо в выбранную вами папку",
  privacy_step3:
    "Ноль телеметрии. Ничего не логируется, не отслеживается и никуда не отправляется — никогда.",
  privacy_outro:
    "Ваша история просмотров, история загрузок и содержимое файлов остаются на вашем устройстве. 100 % приватно.",
  faq_q1: "Какие качества видео можно скачивать?",
  faq_a1:
    "Всё, что предлагает YouTube — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p и только аудио. Потоки с высокой частотой кадров (60 fps, 120 fps) и HDR сохраняются как есть. Arroxy показывает все доступные форматы и даёт точно выбрать нужный.",
  faq_q2: "Это правда бесплатно?",
  faq_a2: "Да. Лицензия MIT. Никаких премиум-уровней, никаких заблокированных функций.",
  faq_q3: "На каких языках доступен Arroxy?",
  faq_a3:
    "На девяти, прямо из коробки: English, Español (испанский), Deutsch (немецкий), Français (французский), 日本語 (японский), 中文 (китайский), Русский, Українська (украинский) и हिन्दी (хинди). Arroxy автоматически определяет язык системы при первом запуске, и вы можете переключиться в любой момент через выбор языка в панели инструментов. Хотите добавить или улучшить перевод? Файлы локализации — это простые TypeScript-объекты в `src/shared/i18n/locales/` — [откройте PR](../../pulls).",
  faq_q4: "Нужно что-то устанавливать?",
  faq_a4:
    "Нет. yt-dlp и ffmpeg автоматически скачиваются при первом запуске с официальных GitHub releases и кешируются на вашей машине. После этого никакой настройки не требуется.",
  faq_q5: "Будет ли работать, если YouTube что-то изменит?",
  faq_a5:
    "Да — у Arroxy два уровня устойчивости. Во-первых, yt-dlp — один из самых активно поддерживаемых open-source инструментов, обновления выходят в течение часов после изменений YouTube. Во-вторых, Arroxy вообще не зависит от кук или вашего аккаунта Google, так что нет сессий, которые истекают, и нет учётных данных, которые надо менять. Эта комбинация делает его значительно стабильнее инструментов, использующих экспорт кук из браузера.",
  faq_q6: "Можно ли скачивать плейлисты?",
  faq_a6:
    "Сейчас поддерживаются только отдельные видео. Поддержка плейлистов и каналов — в дорожной карте, см. [Запланированные функции](#features).",
  faq_q7: "Нужен ли мой YouTube-аккаунт или куки?",
  faq_a7:
    "Нет — и это важнее, чем кажется. Большинство инструментов, которые перестают работать после обновления YouTube, советуют экспортировать куки YouTube из браузера. Этот обходной путь ломается каждые ~30 минут, когда YouTube меняет сессии, а в документации yt-dlp прямо предупреждают, что это может привести к флагу аккаунта Google. Arroxy никогда не использует ни куки, ни учётные данные. Никакого логина. Никакого привязанного аккаунта. Нечему истекать, нечему банить.",
  faq_q8: 'macOS говорит «приложение повреждено» или «не может быть открыто» — что делать?',
  faq_a8:
    "Это macOS Gatekeeper блокирует неподписанное приложение — реального повреждения нет. Пошаговая инструкция в разделе [Первый запуск на macOS](#macos).",
  faq_q9: "Это законно?",
  faq_a9:
    "Скачивание видео для личного использования в большинстве юрисдикций обычно допустимо. Вы сами отвечаете за соблюдение Условий использования YouTube и местных законов.",
  tech_content:
    "Технические детали, инструкции по сборке из исходников, требования по платформам и инструкции для контрибьюторов — см. в [README на английском](README.md#tech).",
  tos_note:
    "**Условия использования:** Arroxy — инструмент для личного, частного использования. Вы единолично отвечаете за то, чтобы ваши загрузки соответствовали [Условиям использования](https://www.youtube.com/t/terms) YouTube и законам об авторском праве вашей юрисдикции. Не используйте Arroxy для скачивания, воспроизведения или распространения контента, на который у вас нет прав. Разработчики Arroxy не несут ответственности за злоупотребления.",
  footer_credit:
    'Лицензия MIT · Сделано с заботой <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};

const uk = {
  icon_alt: "Маскот Arroxy",
  title: "Arroxy — безкоштовний завантажувач YouTube із відкритим кодом",
  read_in_label: "Мова:",
  badge_release_alt: "Реліз",
  badge_lastcommit_alt: "Останній коміт",
  badge_platforms_alt: "Платформи",
  badge_i18n_alt: "Мови",
  badge_license_alt: "Ліцензія",
  hero_bold: "Набридла реклама YouTube, яка псує ваші відео?",
  hero_tagline:
    "Завантажуйте будь-яке відео або Shorts у повній якості — 4K, 1080p60, HDR і вище. Швидко, безкоштовно і на 100 % ваше.",
  hero_nopes: "Без реклами. Без стеження. Без кук. Без логіну. Без зайвого.",
  cta_latest: "Останній випуск →",
  demo_alt: "Демо Arroxy",
  ai_notice:
    "> 🌐 Це переклад за допомогою ШІ. [README англійською](README.md) — основне джерело істини. Помітили помилку? [PR вітаються](../../pulls).",
  toc_heading: "Зміст",
  why_h2: "Чому Arroxy?",
  what_h2: "Що вміє",
  plan_h2: "Заплановані функції",
  dl_h2: "Завантажити",
  dl_win_h3: "Windows: Інсталятор vs Портативна версія",
  dl_macos_h3: "Перший запуск на macOS",
  dl_linux_h3: "Перший запуск на Linux",
  privacy_h2: "Конфіденційність",
  faq_h2: "Часті запитання",
  tech_h2: "Технічні деталі",
  why_col2: "Розширення браузера",
  why_col3: "Онлайн-конвертери",
  why_col4: "Інші завантажувачі",
  why_r1: "Безкоштовно назавжди",
  why_r2: "Без реклами",
  why_r3: "Без облікового запису",
  why_r4: "Працює офлайн _(майже)_",
  why_r5: "Файли залишаються у вас",
  why_r6: "Без обмежень використання",
  why_r7: "Відкритий код",
  why_r8: "Ніколи не потрібні логін чи куки",
  why_r9: "Без ризику бану акаунта Google",
  why_offline_note:
    "_«Працює офлайн» означає, що жодна конвертація не відбувається на чужому сервері — увесь конвеєр працює на вашій машині. Інтернет усе ж потрібен, щоб дістатися YouTube. Так, ми це знаємо._",
  why_cookies_note:
    "**Чому це важливо:** Більшість десктопних завантажувачів YouTube врешті-решт просять експортувати куки браузера, щойно YouTube оновлює виявлення ботів. Ці сесії спливають кожні ~30 хвилин — і документація yt-dlp прямо попереджає, що автоматизація на куках може призвести до бану акаунта Google. Arroxy ніколи не просить ані кук, ані логіну, ані облікових даних. Він запитує ті ж токени, які YouTube видає будь-якому реальному браузеру — нульовий ризик для акаунта, без терміну дії.",
  why_summary:
    "Arroxy — це **безкоштовний, відкритий, орієнтований на приватність** настільний застосунок для тих, хто цінує простоту без зайвого. Ваші завантаження ніколи не проходять через сторонній сервер. Нуль телеметрії, нуль збору даних. Просто вставте URL — і готово.",
  what_1:
    "**Вставте будь-яке посилання YouTube** — відео, Shorts, що завгодно — Arroxy за секунди отримує всі доступні формати",
  what_2:
    "**Оберіть якість** — до 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps і вище, лише аудіо (MP3/AAC/Opus), або швидкий пресет (Найкраща якість / Збалансовано / Малий файл)",
  what_3:
    "**Повна підтримка високого фреймрейту** — потоки 60 fps, 120 fps та HDR зберігаються рівно так, як їх кодує YouTube",
  what_4:
    "**Оберіть, куди зберігати** — остання тека запам'ятовується, або обирайте нову щоразу",
  what_5:
    "**Завантаження в один клік** — індикатор прогресу в реальному часі, скасування будь-якої миті",
  what_6:
    "**Черга з кількох відео** — панель завантажень відстежує все одночасно",
  what_7:
    "**Завантаження субтитрів** — забирайте ручні або авто-згенеровані субтитри у SRT, VTT чи ASS, будь-якою доступною мовою. Зберігайте поруч із відео, вбудовуйте в портативний `.mkv` або складайте в окрему підпапку `Subtitles/`",
  what_8:
    "**Інтеграція SponsorBlock** — пропускайте або позначайте сегменти зі спонсорами, вступами, кінцівками, самопіаром тощо. Позначайте як розділи (без руйнування) або вирізайте повністю через FFmpeg — ваш вибір, окремо для кожної категорії",
  what_9:
    "**Доступно 9 мовами** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — автоматично визначає мову системи, перемикання будь-якої миті",
  what_10:
    "**Моніторинг буфера обміну** — скопіюйте будь-яке посилання YouTube, і Arroxy автоматично заповнить поле URL при наступному переключенні на застосунок. Діалог підтвердження зберігає контроль; вимикається в розширених налаштуваннях будь-якої миті",
  what_11:
    "**Автоочищення URL** — вставлені або взяті з буфера обміну YouTube-посилання очищаються від трекінгових параметрів (`si`, `pp`, `feature`, `utm_*`, `fbclid`, `gclid` тощо), а обгортки `youtube.com/redirect` розгортаються — у полі URL завжди відображається канонічна адреса",
  what_12:
    "**Згортання в трей** — закриття вікна ховає Arroxy в системний трей. Завантаження тривають; натисніть значок трею, щоб повернути вікно, або виходьте через меню трею",
  what_13:
    "**Вбудовані розділи, метадані й обкладинка** — назва, дата завантаження, виконавець, опис і обкладинка записуються безпосередньо у файл; маркери розділів дозволяють навігацію по секціях у будь-якому сучасному плеєрі",
  shot1_alt: "Вставте URL",
  shot2_alt: "Оберіть якість",
  shot3_alt: "Оберіть, куди зберігати",
  shot4_alt: "Черга завантажень у дії",
  shot5_alt: "Вибір мов, формату та режиму збереження субтитрів",
  plan_intro:
    "Що в дорожній карті — ще не випущено, приблизно за пріоритетом.",
  plan_col1: "Функція",
  plan_col2: "Опис",
  plan_r1_name: "**Завантаження плейлистів і каналів**",
  plan_r1_desc:
    "Вставте URL плейлиста чи каналу — усі відео потраплять у чергу, з фільтрами за датою чи кількістю",
  plan_r2_name: "**Пакетне введення URL**",
  plan_r2_desc: "Вставте кілька посилань одразу й запустіть усе разом",
  plan_r3_name: "**Конвертація форматів**",
  plan_r3_desc:
    "Конвертуйте завантаження в MP3, WAV, FLAC та інші формати без сторонніх інструментів",
  plan_r4_name: "**Шаблони імен файлів**",
  plan_r4_desc:
    "Імена за назвою, автором, датою, роздільністю чи їх комбінацією — з живим попереднім переглядом",
  plan_r5_name: "**Заплановані завантаження**",
  plan_r5_desc:
    "Задайте час, коли Arroxy має почати — зручно для великих черг на ніч",
  plan_r6_name: "**Ліміт швидкості завантаження**",
  plan_r6_desc:
    "Обмежуйте смугу, щоб завантаження не забивали з'єднання під час роботи",
  plan_r7_name: "**Обрізання кліпів**",
  plan_r7_desc:
    "Вкажіть початок і кінець, щоб завантажити лише фрагмент відео",
  plan_cta:
    "Маєте ідею, якої тут немає? [Відкрийте запит](../../issues) — голос спільноти визначає, що з'явиться далі.",
  dl_intro:
    "Arroxy активно розвивається. Беріть свіжий білд зі сторінки [Releases](../../releases).",
  dl_platform_col: "Платформа",
  dl_format_col: "Формат",
  dl_win_format: "Інсталятор (NSIS) або портативний `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` або `.flatpak` (sandbox)",
  dl_run: "Завантажили — запустили — готово.",
  dl_pkg_h3: "Установлення через менеджер пакетів",
  dl_channel_col: "Канал",
  dl_command_col: "Команда",
  dl_winget_or: "або",
  dl_win_intro: "Доступні дві збірки — оберіть, що пасує:",
  dl_win_col_installer: "Інсталятор NSIS",
  dl_win_col_portable: "Портативний `.exe`",
  dl_win_r1: "Потрібне встановлення",
  dl_win_r1_installer: "Так",
  dl_win_r1_portable: "Ні — запускається будь-звідки",
  dl_win_r2: "Авто-оновлення",
  dl_win_r2_installer: "✅ у застосунку",
  dl_win_r2_portable: "❌ ручне завантаження",
  dl_win_r3: "Швидкість запуску",
  dl_win_r3_installer: "✅ швидше",
  dl_win_r3_portable: "⚠️ повільніший холодний старт",
  dl_win_r4: "Додається до меню «Пуск»",
  dl_win_r5: "Зручне видалення",
  dl_win_r5_portable: "❌ просто видаліть файл",
  dl_win_rec:
    "**Рекомендація:** інсталятор NSIS, якщо хочете авто-оновлення та швидкий запуск. Портативний `.exe`, якщо віддаєте перевагу безінсталяційному варіанту без правок реєстру.",
  dl_macos_note:
    "**Примітка:** Я не маю Mac, тому збірку macOS особисто не тестував. Якщо щось не працює — застосунок не запускається, `.dmg` зламаний, обхід карантину не спрацьовує — будь ласка, [відкрийте issue](../../issues) і повідомте. Будь-який фідбек від користувачів macOS щиро вітається.",
  dl_macos_warning:
    "Arroxy ще не підписаний кодом. macOS покаже попередження безпеки під час першого запуску — це очікувано, файл не пошкоджений.",
  dl_macos_m1_h4: "Спосіб 1: Системні параметри (рекомендовано)",
  dl_macos_step_col1: "Крок",
  dl_macos_step_col2: "Дія",
  dl_macos_step1:
    "Клацніть правою кнопкою по іконці Arroxy і виберіть **Відкрити**.",
  dl_macos_step2:
    "З'явиться вікно попередження. Натисніть **Скасувати** (не «Перемістити в смітник»).",
  dl_macos_step3:
    "Відкрийте **Системні параметри → Конфіденційність та безпека**.",
  dl_macos_step4:
    "Прокрутіть до розділу **Безпека** — побачите _«Arroxy заблоковано, бо він не від ідентифікованого розробника»_.",
  dl_macos_step5:
    "Натисніть **Усе одно відкрити** і підтвердіть паролем або Touch ID.",
  dl_macos_after:
    "Після кроку 5 Arroxy відкривається нормально, і попередження більше не з'являється.",
  dl_macos_m2_h4: "Спосіб 2: Термінал (для досвідчених)",
  dl_macos_m2_text:
    "Якщо вище не спрацювало, після перетягування Arroxy у Програми виконайте один раз:",
  dl_linux_intro:
    "AppImage не встановлюються — вони запускаються напряму. Потрібно лише позначити файл як виконуваний.",
  dl_linux_m1_h4: "Спосіб 1: Файловий менеджер",
  dl_linux_m1_text:
    "ПКМ на файлі `.AppImage` → **Властивості** → **Права** → увімкніть **Дозволити виконання файлу як програми**, потім подвійний клік для запуску.",
  dl_linux_m2_h4: "Спосіб 2: Термінал",
  dl_linux_fuse_text:
    "Якщо все одно не запускається — можливо, відсутній FUSE (потрібен AppImage):",
  dl_linux_flatpak_h4: "Flatpak (ізольована альтернатива)",
  dl_linux_flatpak_intro:
    "Хочете справжню ізольовану установку? Скачайте бандл `Arroxy-*.flatpak` з тієї ж сторінки релізу та встановіть його локально — без налаштування Flathub, без прав адміністратора, без шиму `libfuse2` (Flatpak використовує bubblewrap для пісочниці).",
  privacy_intro:
    "Arroxy працює повністю на вашій машині. Коли ви завантажуєте відео:",
  privacy_step1:
    "Arroxy напряму звертається до URL YouTube через [yt-dlp](https://github.com/yt-dlp/yt-dlp) — відкритий, перевірюваний, завжди актуальний інструмент",
  privacy_step2: "Файл зберігається безпосередньо у вибрану вами теку",
  privacy_step3:
    "Нуль телеметрії. Нічого не логується, не відстежується й нікуди не надсилається — ніколи.",
  privacy_outro:
    "Ваша історія перегляду, історія завантажень і вміст файлів залишаються на вашому пристрої. 100 % приватно.",
  faq_q1: "Які якості відео можна завантажувати?",
  faq_a1:
    "Будь-які, що пропонує YouTube — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p та лише аудіо. Потоки з високою частотою кадрів (60 fps, 120 fps) і HDR зберігаються як є. Arroxy показує всі доступні формати і дає точно обрати потрібний.",
  faq_q2: "Це справді безкоштовно?",
  faq_a2: "Так. Ліцензія MIT. Без преміум-рівнів, без заблокованих функцій.",
  faq_q3: "Якими мовами доступний Arroxy?",
  faq_a3:
    "Дев'ятьма, з коробки: English, Español (іспанська), Deutsch (німецька), Français (французька), 日本語 (японська), 中文 (китайська), Русский (російська), Українська і हिन्दी (хінді). Arroxy автоматично визначає мову операційної системи при першому запуску, і ви можете перемикнутися будь-коли через вибір мови в панелі інструментів. Хочете додати чи покращити переклад? Файли локалізації — прості TypeScript-об'єкти у `src/shared/i18n/locales/` — [відкрийте PR](../../pulls).",
  faq_q4: "Чи треба щось встановлювати?",
  faq_a4:
    "Ні. yt-dlp і ffmpeg автоматично завантажуються при першому запуску з офіційних GitHub releases і кешуються на вашій машині. Після цього жодних додаткових налаштувань.",
  faq_q5: "Чи працюватиме, якщо YouTube щось змінить?",
  faq_a5:
    "Так — Arroxy має два рівні стійкості. По-перше, yt-dlp — один із найактивніше підтримуваних відкритих інструментів, оновлення виходять упродовж годин після змін YouTube. По-друге, Arroxy зовсім не залежить від кук чи вашого акаунта Google, тож немає сесій, що спливають, і немає облікових даних, які треба міняти. Це поєднання робить його значно стабільнішим за інструменти, що використовують експорт кук із браузера.",
  faq_q6: "Чи можна завантажувати плейлисти?",
  faq_a6:
    "Зараз підтримуються лише окремі відео. Підтримка плейлистів і каналів — у дорожній карті, див. [Заплановані функції](#features).",
  faq_q7: "Чи потрібен мій YouTube-акаунт або куки?",
  faq_a7:
    "Ні — і це важливіше, ніж може здатися. Більшість інструментів, які перестають працювати після оновлення YouTube, радять експортувати куки YouTube із браузера. Це обхід ламається кожні ~30 хвилин, коли YouTube змінює сесії, а в документації yt-dlp прямо попереджають, що це може призвести до прапорця на акаунті Google. Arroxy ніколи не використовує куки чи облікові дані. Ні логіну. Ні прив'язаного акаунта. Нічого не спливає, нічого не банять.",
  faq_q8: 'macOS каже «застосунок пошкоджено» або «не вдається відкрити» — що робити?',
  faq_a8:
    "Це macOS Gatekeeper блокує непідписаний застосунок — реального пошкодження немає. Покрокова інструкція в розділі [Перший запуск на macOS](#macos).",
  faq_q9: "Чи це законно?",
  faq_a9:
    "Завантаження відео для особистого використання в більшості юрисдикцій загалом допустиме. Ви самі відповідаєте за дотримання Умов використання YouTube і місцевого законодавства.",
  tech_content:
    "Технічні деталі, інструкції зі збирання з вихідного коду, вимоги до платформ та інструкції для контриб'юторів — див. у [README англійською](README.md#tech).",
  tos_note:
    "**Умови використання:** Arroxy — інструмент виключно для особистого, приватного використання. Ви одноосібно відповідаєте за те, щоб ваші завантаження відповідали [Умовам використання](https://www.youtube.com/t/terms) YouTube та авторському праву вашої юрисдикції. Не використовуйте Arroxy для завантаження, відтворення чи розповсюдження контенту, на який ви не маєте прав. Розробники Arroxy не несуть відповідальності за зловживання.",
  footer_credit:
    'Ліцензія MIT · Зроблено з турботою <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};

const hi = {
  icon_alt: "Arroxy मस्कट",
  title: "Arroxy — मुफ़्त ओपन-सोर्स YouTube डाउनलोडर",
  read_in_label: "भाषा:",
  badge_release_alt: "रिलीज़",
  badge_lastcommit_alt: "अंतिम कमिट",
  badge_platforms_alt: "प्लेटफ़ॉर्म",
  badge_i18n_alt: "भाषाएँ",
  badge_license_alt: "लाइसेंस",
  hero_bold: "YouTube के विज्ञापनों से वीडियो ख़राब होते-होते थक गए?",
  hero_tagline:
    "कोई भी वीडियो या Short पूरी क्वालिटी में डाउनलोड करें — 4K, 1080p60, HDR और उससे आगे। तेज़, मुफ़्त और 100% आपका।",
  hero_nopes:
    "कोई विज्ञापन नहीं। कोई ट्रैकिंग नहीं। कोई कुकीज़ नहीं। कोई लॉगिन नहीं। कोई बकवास नहीं।",
  cta_latest: "नवीनतम रिलीज़ →",
  demo_alt: "Arroxy डेमो",
  ai_notice:
    "> 🌐 यह AI-सहायता प्राप्त अनुवाद है। [अंग्रेज़ी README](README.md) सत्य का स्रोत है। कोई गलती दिखी? [PR का स्वागत है](../../pulls)।",
  toc_heading: "विषय-सूची",
  why_h2: "Arroxy क्यों?",
  what_h2: "क्या करता है",
  plan_h2: "आने वाले फ़ीचर",
  dl_h2: "डाउनलोड",
  dl_win_h3: "Windows: इंस्टॉलर बनाम पोर्टेबल",
  dl_macos_h3: "macOS पर पहली बार लॉन्च",
  dl_linux_h3: "Linux पर पहली बार लॉन्च",
  privacy_h2: "प्राइवेसी",
  faq_h2: "अक्सर पूछे जाने वाले प्रश्न",
  tech_h2: "तकनीकी विवरण",
  why_col2: "ब्राउज़र एक्सटेंशन",
  why_col3: "ऑनलाइन कन्वर्टर",
  why_col4: "अन्य डाउनलोडर",
  why_r1: "हमेशा के लिए मुफ़्त",
  why_r2: "कोई विज्ञापन नहीं",
  why_r3: "अकाउंट ज़रूरी नहीं",
  why_r4: "ऑफ़लाइन काम करता है _(काफ़ी हद तक)_",
  why_r5: "आपकी फ़ाइलें लोकल ही रहती हैं",
  why_r6: "इस्तेमाल की कोई सीमा नहीं",
  why_r7: "ओपन सोर्स",
  why_r8: "कभी लॉगिन या कुकीज़ नहीं चाहिए",
  why_r9: "Google अकाउंट बैन का कोई जोखिम नहीं",
  why_offline_note:
    '_"ऑफ़लाइन काम करता है" का मतलब है कि कोई भी कन्वर्ज़न किसी और के सर्वर पर नहीं होता — पूरी पाइपलाइन आपकी ही मशीन पर चलती है। YouTube तक पहुँचने के लिए इंटरनेट तो चाहिए ही। हाँ, हमें पता है।_',
  why_cookies_note:
    "**यह क्यों मायने रखता है:** अधिकांश डेस्कटॉप YouTube डाउनलोडर अंततः आपसे ब्राउज़र की कुकीज़ एक्सपोर्ट करने को कहते हैं, जब भी YouTube अपना बॉट डिटेक्शन अपडेट करता है। ये सेशन हर ~30 मिनट में एक्सपायर होते हैं — और yt-dlp की अपनी डॉक्स चेतावनी देती है कि कुकी-आधारित ऑटोमेशन आपके Google अकाउंट का बैन ट्रिगर कर सकता है। Arroxy कभी भी कुकीज़, लॉगिन या क्रेडेंशियल नहीं माँगता। यह वही टोकन माँगता है जो YouTube किसी भी असली ब्राउज़र को देता है — अकाउंट पर शून्य जोखिम, कोई एक्सपायरी नहीं।",
  why_summary:
    "Arroxy एक **मुफ़्त, ओपन-सोर्स, प्राइवेसी-फ़र्स्ट** डेस्कटॉप ऐप है — उन लोगों के लिए जो बिना झंझट की सादगी चाहते हैं। आपके डाउनलोड कभी किसी थर्ड-पार्टी सर्वर से नहीं गुज़रते। शून्य टेलीमेट्री, शून्य डेटा कलेक्शन। बस एक URL पेस्ट करें और हो गया।",
  what_1:
    "**कोई भी YouTube URL पेस्ट करें** — वीडियो, Shorts, कुछ भी — Arroxy सेकंडों में सभी उपलब्ध फ़ॉर्मैट लाता है",
  what_2:
    "**क्वालिटी चुनें** — 4K UHD (2160p), 1440p, 1080p, 720p तक, 60 fps और उससे ज़्यादा फ़्रेम रेट, ऑडियो-only (MP3/AAC/Opus), या क्विक प्रीसेट (बेस्ट क्वालिटी / बैलेंस्ड / स्मॉल फ़ाइल)",
  what_3:
    "**पूरा हाई-फ़्रेम-रेट सपोर्ट** — 60 fps, 120 fps और HDR स्ट्रीम वैसे ही रहते हैं जैसे YouTube उन्हें एनकोड करता है",
  what_4:
    "**कहाँ सेव करना है चुनें** — पिछला फ़ोल्डर याद रहता है, या हर बार नया चुनें",
  what_5:
    "**एक क्लिक में डाउनलोड** — रियल-टाइम प्रोग्रेस बार, कभी भी कैंसल कर सकते हैं",
  what_6: "**कई वीडियो की क़तार** — डाउनलोड पैनल सब कुछ साथ-साथ ट्रैक करता है",
  what_7:
    "**सबटाइटल डाउनलोड करें** — SRT, VTT या ASS में मैनुअल या ऑटो-जेनरेटेड सबटाइटल पाएँ, किसी भी उपलब्ध भाषा में। वीडियो के बग़ल में सेव करें, पोर्टेबल `.mkv` में एम्बेड करें, या एक डेडिकेटेड `Subtitles/` सबफ़ोल्डर में व्यवस्थित करें",
  what_8:
    "**SponsorBlock इंटीग्रेशन** — स्पॉन्सर सेगमेंट, इंट्रो, आउट्रो, सेल्फ-प्रोमो और अन्य को स्किप या मार्क करें। उन्हें नॉन-डिस्ट्रक्टिव तरीके से चैप्टर के रूप में मार्क करें या FFmpeg से पूरी तरह काटें — हर कैटेगरी के लिए आपकी पसंद",
  what_9:
    "**9 भाषाओं में उपलब्ध** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — आपके सिस्टम की भाषा अपने आप पहचानता है, कभी भी बदला जा सकता है",
  what_10:
    "**क्लिपबोर्ड वॉच** — कोई भी YouTube लिंक कॉपी करें और ऐप पर वापस आते ही Arroxy URL फ़ील्ड स्वचालित रूप से भर देता है। एक पुष्टि संवाद नियंत्रण बनाए रखता है; उन्नत सेटिंग से कभी भी अक्षम करें",
  what_11:
    "**URL को अपने आप साफ़ करें** — पेस्ट किए गए या क्लिपबोर्ड से लिए गए YouTube लिंक से ट्रैकिंग पैरामीटर (`si`, `pp`, `feature`, `utm_*`, `fbclid`, `gclid` और अन्य) हटा दिए जाते हैं, और `youtube.com/redirect` रैपर खोल दिए जाते हैं — URL फ़ील्ड में हमेशा कैनोनिकल लिंक दिखता है",
  what_12:
    "**ट्रे में छुपाएं** — विंडो बंद करने पर Arroxy सिस्टम ट्रे में चला जाता है। डाउनलोड जारी रहते हैं; ट्रे आइकन पर क्लिक करके विंडो वापस लाएं, या ट्रे मेनू से बाहर निकलें",
  what_13:
    "**एम्बेडेड चैप्टर, मेटाडेटा और थंबनेल** — शीर्षक, अपलोड तिथि, कलाकार, विवरण और कवर आर्ट सीधे फ़ाइल में लिखे जाते हैं; चैप्टर मार्कर किसी भी आधुनिक प्लेयर में सेक्शन-नेविगेशन देते हैं",
  shot1_alt: "URL पेस्ट करें",
  shot2_alt: "क्वालिटी चुनें",
  shot3_alt: "सेव लोकेशन चुनें",
  shot4_alt: "डाउनलोड क़तार चलती हुई",
  shot5_alt: "सबटाइटल भाषा, फ़ॉर्मैट और सेव मोड चुनें",
  plan_intro: "रोडमैप पर — अभी रिलीज़ नहीं हुए, लगभग प्राथमिकता के क्रम में।",
  plan_col1: "फ़ीचर",
  plan_col2: "विवरण",
  plan_r1_name: "**प्लेलिस्ट और चैनल डाउनलोड**",
  plan_r1_desc:
    "प्लेलिस्ट या चैनल URL पेस्ट करके सभी वीडियो एक साथ क़तार में लगाएँ, तारीख़ या संख्या के फ़िल्टर के साथ",
  plan_r2_name: "**एक साथ कई URL डालना**",
  plan_r2_desc: "कई URL एक साथ पेस्ट करके सब एक झटके में शुरू करें",
  plan_r3_name: "**फ़ॉर्मैट कन्वर्ज़न**",
  plan_r3_desc:
    "डाउनलोड को MP3, WAV, FLAC या अन्य फ़ॉर्मैट में बदलें — किसी अलग टूल की ज़रूरत नहीं",
  plan_r4_name: "**कस्टम फ़ाइल नाम टेम्पलेट**",
  plan_r4_desc:
    "टाइटल, अपलोडर, तारीख़, रेज़ोल्यूशन या किसी कॉम्बिनेशन से नाम दें — लाइव प्रीव्यू के साथ",
  plan_r5_name: "**शेड्यूल्ड डाउनलोड**",
  plan_r5_desc:
    "Arroxy के डाउनलोड शुरू करने का समय तय करें — रात भर बड़ी क़तार के लिए उपयोगी",
  plan_r6_name: "**डाउनलोड स्पीड लिमिट**",
  plan_r6_desc:
    "बैंडविड्थ कैप करें ताकि काम के दौरान डाउनलोड आपका कनेक्शन न भर दे",
  plan_r7_name: "**क्लिप ट्रिमिंग**",
  plan_r7_desc:
    "शुरू और अंत का समय बताकर वीडियो का सिर्फ़ एक हिस्सा डाउनलोड करें",
  plan_cta:
    "कोई फ़ीचर सोचा है जो यहाँ नहीं है? [रिक्वेस्ट खोलें](../../issues) — कम्यूनिटी की राय तय करती है कि आगे क्या बनेगा।",
  dl_intro:
    "Arroxy सक्रिय रूप से बन रहा है। नवीनतम बिल्ड [Releases](../../releases) पेज से लें।",
  dl_platform_col: "प्लेटफ़ॉर्म",
  dl_format_col: "फ़ॉर्मैट",
  dl_win_format: "इंस्टॉलर (NSIS) या पोर्टेबल `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` या `.flatpak` (sandboxed)",
  dl_run: "बस डाउनलोड, रन, हो गया।",
  dl_pkg_h3: "पैकेज मैनेजर से इंस्टॉल",
  dl_channel_col: "चैनल",
  dl_command_col: "कमांड",
  dl_winget_or: "या",
  dl_win_intro: "दो बिल्ड उपलब्ध हैं — जो ज़रूरत हो वो चुनें:",
  dl_win_col_installer: "NSIS इंस्टॉलर",
  dl_win_col_portable: "पोर्टेबल `.exe`",
  dl_win_r1: "इंस्टॉलेशन ज़रूरी",
  dl_win_r1_installer: "हाँ",
  dl_win_r1_portable: "नहीं — कहीं से भी चलाएँ",
  dl_win_r2: "ऑटो-अपडेट",
  dl_win_r2_installer: "✅ ऐप में",
  dl_win_r2_portable: "❌ मैन्युअल डाउनलोड",
  dl_win_r3: "स्टार्टअप स्पीड",
  dl_win_r3_installer: "✅ तेज़",
  dl_win_r3_portable: "⚠️ कोल्ड स्टार्ट धीमा",
  dl_win_r4: "स्टार्ट मेन्यू में जुड़ता है",
  dl_win_r5: "आसान अनइंस्टॉल",
  dl_win_r5_portable: "❌ बस फ़ाइल डिलीट कर दें",
  dl_win_rec:
    "**सिफ़ारिश:** अगर आप चाहते हैं कि Arroxy ख़ुद अपडेट हो और तेज़ शुरू हो, तो NSIS इंस्टॉलर लें। बिना इंस्टॉल और बिना रजिस्ट्री छेड़े चाहिए तो पोर्टेबल `.exe` लें।",
  dl_macos_note:
    "**नोट:** मेरे पास Mac नहीं है, इसलिए macOS बिल्ड मैंने ख़ुद टेस्ट नहीं किया है। अगर कुछ काम नहीं करता — ऐप नहीं खुलता, `.dmg` टूटा हुआ है, क्वारंटीन वर्कअराउंड फ़ेल होता है — कृपया [issue खोलें](../../issues) और बताएँ। macOS यूज़र्स से कोई भी फ़ीडबैक सच में सराहनीय है।",
  dl_macos_warning:
    "Arroxy अभी कोड-साइन्ड नहीं है। पहली बार खोलने पर macOS एक सुरक्षा चेतावनी दिखाएगा — यह अपेक्षित है, फ़ाइल ख़राब नहीं है।",
  dl_macos_m1_h4: "तरीक़ा 1: सिस्टम सेटिंग्स (अनुशंसित)",
  dl_macos_step_col1: "क़दम",
  dl_macos_step_col2: "क्रिया",
  dl_macos_step1: "Arroxy आइकॉन पर राइट-क्लिक करें और **Open** चुनें।",
  dl_macos_step2:
    "चेतावनी डायलॉग आएगा। **Cancel** क्लिक करें (Move to Trash न क्लिक करें)।",
  dl_macos_step3: "**System Settings → Privacy & Security** खोलें।",
  dl_macos_step4:
    '**Security** सेक्शन तक स्क्रॉल करें — दिखेगा _"Arroxy was blocked from use because it is not from an identified developer."_',
  dl_macos_step5:
    "**Open Anyway** क्लिक करें, फिर पासवर्ड या Touch ID से कन्फ़र्म करें।",
  dl_macos_after:
    "क़दम 5 के बाद Arroxy सामान्य रूप से खुलेगा और चेतावनी फिर कभी नहीं आएगी।",
  dl_macos_m2_h4: "तरीक़ा 2: टर्मिनल (एडवांस्ड)",
  dl_macos_m2_text:
    "अगर ऊपर वाला काम नहीं करता, Arroxy को Applications में खींचने के बाद यह एक बार चलाएँ:",
  dl_linux_intro:
    "AppImage इंस्टॉल नहीं होते — ये सीधे चलते हैं। बस पहले फ़ाइल को एक्ज़ीक्यूटेबल मार्क करना होता है।",
  dl_linux_m1_h4: "तरीक़ा 1: फ़ाइल मैनेजर",
  dl_linux_m1_text:
    "`.AppImage` फ़ाइल पर राइट-क्लिक → **Properties** → **Permissions** → **Allow executing file as program** ऑन करें, फिर डबल-क्लिक से चलाएँ।",
  dl_linux_m2_h4: "तरीक़ा 2: टर्मिनल",
  dl_linux_fuse_text:
    "अगर फिर भी नहीं चलता, तो शायद FUSE नहीं है (AppImage के लिए ज़रूरी):",
  dl_linux_flatpak_h4: "Flatpak (सैंडबॉक्स विकल्प)",
  dl_linux_flatpak_intro:
    "सही मायनों में सैंडबॉक्स्ड इंस्टॉल चाहिए? उसी रिलीज़ पेज से `Arroxy-*.flatpak` बंडल लें और लोकल इंस्टॉल करें — Flathub सेटअप नहीं, एडमिन अधिकार नहीं, `libfuse2` शिम भी नहीं चाहिए (Flatpak सैंडबॉक्स के लिए bubblewrap इस्तेमाल करता है)।",
  privacy_intro:
    "Arroxy पूरी तरह आपकी मशीन पर चलता है। जब आप वीडियो डाउनलोड करते हैं:",
  privacy_step1:
    "Arroxy [yt-dlp](https://github.com/yt-dlp/yt-dlp) के ज़रिए सीधे YouTube URL को कॉल करता है — एक ऑडिटेबल, हमेशा अप-टू-डेट ओपन-सोर्स टूल",
  privacy_step2: "फ़ाइल सीधे आपके चुने हुए फ़ोल्डर में सेव होती है",
  privacy_step3:
    "शून्य टेलीमेट्री। कुछ भी लॉग, ट्रैक या कहीं नहीं भेजा जाता — कभी नहीं।",
  privacy_outro:
    "आपकी देखने की हिस्ट्री, डाउनलोड हिस्ट्री और फ़ाइल कंटेंट आपके डिवाइस पर रहते हैं। 100% प्राइवेट।",
  faq_q1: "मैं किन क्वालिटी में डाउनलोड कर सकता हूँ?",
  faq_a1:
    "जो भी YouTube देता है — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p और ऑडियो-only। हाई फ़्रेम-रेट (60 fps, 120 fps) और HDR कंटेंट जैसे हैं वैसे ही रहते हैं। Arroxy हर उपलब्ध फ़ॉर्मैट दिखाता है और आपको ठीक वही चुनने देता है जो लेना है।",
  faq_q2: "क्या यह सच में मुफ़्त है?",
  faq_a2: "हाँ। MIT लाइसेंस। कोई प्रीमियम टियर नहीं, कोई फ़ीचर लॉक नहीं।",
  faq_q3: "Arroxy किन भाषाओं में उपलब्ध है?",
  faq_a3:
    "नौ, बॉक्स से बाहर: English, Español (स्पेनिश), Deutsch (जर्मन), Français (फ़्रेंच), 日本語 (जापानी), 中文 (चीनी), Русский (रूसी), Українська (यूक्रेनी) और हिन्दी। Arroxy पहले लॉन्च पर आपके ऑपरेटिंग सिस्टम की भाषा अपने आप पहचानता है, और आप टूलबार में भाषा चुनने वाले से कभी भी बदल सकते हैं। अनुवाद जोड़ना या सुधारना है? लोकेल फ़ाइलें `src/shared/i18n/locales/` में सादे TypeScript ऑब्जेक्ट्स हैं — [PR खोलें](../../pulls)।",
  faq_q4: "क्या मुझे कुछ इंस्टॉल करना होगा?",
  faq_a4:
    "नहीं। yt-dlp और ffmpeg पहले लॉन्च पर अपने ऑफ़िशियल GitHub releases से अपने आप डाउनलोड हो जाते हैं और आपकी मशीन पर कैश हो जाते हैं। उसके बाद कोई एक्स्ट्रा सेटअप ज़रूरी नहीं।",
  faq_q5: "अगर YouTube कुछ बदले तो क्या यह काम करता रहेगा?",
  faq_a5:
    "हाँ — और Arroxy में दो लेयर रिज़िलियेंस है। पहला, yt-dlp सबसे एक्टिवली मेनटेन्ड ओपन-सोर्स टूल्स में से एक है — YouTube के बदलाव के घंटों के भीतर अपडेट होता है। दूसरा, Arroxy कुकीज़ या आपके Google अकाउंट पर बिल्कुल निर्भर नहीं है, इसलिए कोई सेशन एक्सपायर नहीं होता और कोई क्रेडेंशियल रोटेट नहीं करना। यह कॉम्बिनेशन इसे ब्राउज़र की कुकीज़ एक्सपोर्ट करने पर निर्भर टूल्स से कहीं ज़्यादा स्थिर बनाता है।",
  faq_q6: "क्या मैं प्लेलिस्ट डाउनलोड कर सकता हूँ?",
  faq_a6:
    "अभी सिंगल वीडियो सपोर्टेड हैं। प्लेलिस्ट और चैनल सपोर्ट रोडमैप पर है — देखें [आने वाले फ़ीचर](#features)।",
  faq_q7: "क्या इसे मेरे YouTube अकाउंट या कुकीज़ की ज़रूरत है?",
  faq_a7:
    "नहीं — और यह जितना लगता है उससे ज़्यादा अहम है। ज़्यादातर टूल्स जो YouTube के अपडेट के बाद बंद हो जाते हैं, आपको ब्राउज़र की YouTube कुकीज़ एक्सपोर्ट करने को कहते हैं। यह वर्कअराउंड हर ~30 मिनट में टूटता है क्योंकि YouTube सेशन रोटेट करता है, और yt-dlp की अपनी डॉक्स चेताती है कि इससे आपका Google अकाउंट फ़्लैग हो सकता है। Arroxy कभी कुकीज़ या क्रेडेंशियल इस्तेमाल नहीं करता। कोई लॉगिन नहीं। कोई अकाउंट लिंक नहीं। कुछ एक्सपायर नहीं होता, कुछ बैन नहीं होता।",
  faq_q8: 'macOS कहता है "ऐप ख़राब है" या "नहीं खुल सकती" — क्या करूँ?',
  faq_a8:
    "यह macOS Gatekeeper बिना साइन की हुई ऐप को ब्लॉक कर रहा है — असली नुक़सान नहीं है। क़दम-दर-क़दम के लिए देखें [macOS पर पहली बार लॉन्च](#macos)।",
  faq_q9: "क्या यह क़ानूनी है?",
  faq_a9:
    "ज़्यादातर अधिकार-क्षेत्रों में पर्सनल इस्तेमाल के लिए वीडियो डाउनलोड करना आम तौर पर स्वीकार्य है। YouTube की Terms of Service और अपने स्थानीय क़ानूनों का पालन करना आपकी ज़िम्मेदारी है।",
  tech_content:
    "तकनीकी विवरण, सोर्स से बिल्ड करने के निर्देश, प्लेटफ़ॉर्म-वार ज़रूरतें और योगदान कैसे करें, इसके लिए [अंग्रेज़ी README](README.md#tech) देखें।",
  tos_note:
    "**उपयोग की शर्तें:** Arroxy केवल पर्सनल, प्राइवेट इस्तेमाल के लिए एक टूल है। यह सुनिश्चित करना कि आपके डाउनलोड YouTube की [Terms of Service](https://www.youtube.com/t/terms) और आपके अधिकार-क्षेत्र के कॉपीराइट क़ानूनों का पालन करते हैं — यह पूरी तरह आपकी ज़िम्मेदारी है। ऐसी सामग्री डाउनलोड, पुनरुत्पादित या वितरित करने के लिए Arroxy का उपयोग न करें जिसका उपयोग करने का अधिकार आपके पास नहीं है। Arroxy के डेवलपर किसी भी दुरुपयोग के लिए ज़िम्मेदार नहीं हैं।",
  footer_credit:
    'MIT लाइसेंस · <a href="https://x.com/OrionusAI">@OrionusAI</a> द्वारा प्यार से बनाया गया',
};

export const LOCALES = [
  { code: "en", filename: "README.md", name: "English", strings: en },
  { code: "es", filename: "README.es.md", name: "Español", strings: es },
  { code: "de", filename: "README.de.md", name: "Deutsch", strings: de },
  { code: "fr", filename: "README.fr.md", name: "Français", strings: fr },
  { code: "ja", filename: "README.ja.md", name: "日本語", strings: ja },
  { code: "zh", filename: "README.zh.md", name: "中文", strings: zh },
  { code: "ru", filename: "README.ru.md", name: "Русский", strings: ru },
  { code: "uk", filename: "README.uk.md", name: "Українська", strings: uk },
  { code: "hi", filename: "README.hi.md", name: "हिन्दी", strings: hi },
];
