const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — plattformübergreifende Desktop-Shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — Styling
- **Zustand** — State Management
- **yt-dlp** + **ffmpeg** — Download- und Mux-Engine (beim ersten Start von GitHub geholt, immer aktuell)
- **Vite** + **electron-vite** — Build-Tooling
- **Vitest** + **Playwright** — Unit- und End-to-End-Tests

</details>

<details>
<summary><strong>Aus dem Quellcode bauen</strong></summary>

### Voraussetzungen — alle Plattformen

| Tool | Version | Install |
| ---- | ------- | ------- |
| Git  | any     | [git-scm.com](https://git-scm.com) |
| Bun  | latest  | siehe unten je nach OS |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Keine nativen Build-Tools erforderlich — das Projekt hat keine nativen Node-Addons.

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

### Klonen & starten

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### Distributables bauen

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # für aktuelles OS paketieren
bun run dist:win     # Windows Portable exe cross-kompilieren
\`\`\`

> yt-dlp und ffmpeg sind nicht gebündelt — sie werden beim ersten Start von den offiziellen GitHub-Releases geholt und im App-Datenordner gecacht.

</details>`;

export const de = {
  icon_alt: "Arroxy Maskottchen",
  title: "Arroxy — Kostenloser Open-Source YouTube Downloader für Windows, macOS & Linux",
  read_in_label: "Sprache:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "License",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Languages",
  badge_website_alt: "Webseite",
  hero_desc:
    "Lade jedes YouTube-Video, jeden Short oder jeden Audio-Track in Originalqualität herunter — bis zu 4K HDR mit 60 fps, oder als MP3 / AAC / Opus. Läuft lokal auf Windows, macOS und Linux. **Keine Werbung, kein Login, keine Browser-Cookies, kein verknüpftes Google-Konto.**",
  cta_latest: "↓ Neueste Version herunterladen",
  cta_website: "Webseite",
  demo_alt: "Arroxy Demo",
  star_cta: "Wenn Arroxy dir Zeit spart, hilft ein ⭐ anderen, es zu finden.",
  ai_notice:
    "> 🌐 Dies ist eine KI-gestützte Übersetzung. Die [englische README](README.md) ist die maßgebliche Quelle. Fehler entdeckt? [PRs sind willkommen](../../pulls).",
  toc_heading: "Inhalt",
  why_h2: "Warum Arroxy",
  nocookies_h2: "Keine Cookies, kein Login, keine Kontoverknüpfung",
  features_h2: "Funktionen",
  dl_h2: "Download",
  privacy_h2: "Datenschutz",
  faq_h2: "Häufig gestellte Fragen",
  roadmap_h2: "Roadmap",
  tech_h2: "Gebaut mit",
  why_intro: "Ein direkter Vergleich mit den gängigsten Alternativen:",
  why_r1: "Kostenlos, keine Premium-Stufe",
  why_r2: "Open Source",
  why_r3: "Nur lokale Verarbeitung",
  why_r4: "Kein Login oder Cookie-Export",
  why_r5: "Keine Nutzungsbeschränkungen",
  why_r6: "Plattformübergreifende Desktop-App",
  why_r7: "Untertitel + SponsorBlock",
  why_summary:
    "Arroxy ist für eine Sache gebaut: URL einfügen, saubere lokale Datei erhalten. Keine Konten, kein Upselling, keine Datensammlung.",
  nocookies_intro:
    "Das ist der häufigste Grund, warum Desktop-YouTube-Downloader kaputt gehen — und der Hauptgrund, warum Arroxy existiert.",
  nocookies_setup:
    "Wenn YouTube seine Bot-Erkennung aktualisiert, sagen die meisten Tools, du sollst als Workaround deine Browser-YouTube-Cookies exportieren. Zwei Probleme damit:",
  nocookies_p1:
    "Exportierte Sessions laufen typischerweise nach ~30 Minuten ab, sodass du sie ständig neu exportieren musst.",
  nocookies_p2:
    "yt-dlps eigene Dokumentation [warnt, dass Cookie-basierte Automatisierung dein Google-Konto markieren kann](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy fragt nie nach Cookies, Logins oder Anmeldedaten.** Es verwendet nur die öffentlichen Tokens, die YouTube an jeden Browser ausliefert. Nichts ist mit deiner Google-Identität verknüpft, nichts läuft ab, nichts muss rotiert werden.",
  feat_quality_h3: "Qualität & Formate",
  feat_quality_1: "Bis zu **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Hohe Bildrate** unverändert erhalten — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Nur Audio** als MP3, AAC oder Opus exportieren",
  feat_quality_4: "Schnell-Presets: *Beste Qualität* · *Ausgewogen* · *Kleine Datei*",
  feat_privacy_h3: "Datenschutz & Kontrolle",
  feat_privacy_1:
    "100 % lokale Verarbeitung — Downloads gehen direkt von YouTube auf deine Festplatte",
  feat_privacy_2: "Kein Login, keine Cookies, kein verknüpftes Google-Konto",
  feat_privacy_3: "Dateien direkt in den von dir gewählten Ordner gespeichert",
  feat_workflow_h3: "Workflow",
  feat_workflow_1:
    "**Beliebige YouTube-URL einfügen** — Videos und Shorts werden beide unterstützt",
  feat_workflow_2:
    "**Mehrfach-Download-Warteschlange** — mehrere Downloads parallel verfolgen",
  feat_workflow_3:
    "**Zwischenablage-Überwachung** — kopiere einen YouTube-Link und Arroxy füllt die URL automatisch aus, wenn du die App wieder fokussierst (in den erweiterten Einstellungen umschaltbar)",
  feat_workflow_4:
    "**URLs automatisch bereinigen** — entfernt Tracking-Parameter (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) und löst `youtube.com/redirect`-Links auf",
  feat_workflow_5:
    "**Tray-Modus** — das Schließen des Fensters lässt Downloads im Hintergrund weiterlaufen",
  feat_workflow_6:
    "**9 Sprachen** — erkennt automatisch die Systemsprache, jederzeit umschaltbar",
  feat_post_h3: "Untertitel & Nachbearbeitung",
  feat_post_1:
    "**Untertitel** in SRT, VTT oder ASS — manuell oder automatisch generiert, in jeder verfügbaren Sprache",
  feat_post_2:
    "Neben dem Video speichern, in `.mkv` einbetten oder in einem `Subtitles/`-Unterordner organisieren",
  feat_post_3:
    "**SponsorBlock** — Sponsoren, Intros, Outros, Eigenwerbung überspringen oder als Kapitel markieren",
  feat_post_4:
    "**Eingebettete Metadaten** — Titel, Upload-Datum, Kanal, Beschreibung, Thumbnail und Kapitelmarkierungen in die Datei geschrieben",
  shot1_alt: "URL einfügen",
  shot2_alt: "Qualität wählen",
  shot3_alt: "Speicherort wählen",
  shot4_alt: "Download-Warteschlange in Aktion",
  shot5_alt: "Untertitel-Sprachen und Format wählen",
  dl_platform_col: "Plattform",
  dl_format_col: "Format",
  dl_win_format: "Installer (NSIS) oder Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` oder `.flatpak` (sandboxed)",
  dl_grab: "Neuesten Release holen →",
  dl_pkg_h3: "Per Paketmanager installieren",
  dl_channel_col: "Kanal",
  dl_command_col: "Befehl",
  dl_win_h3: "Windows: Installer vs. Portable",
  dl_win_col_installer: "NSIS Installer",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "Installation erforderlich",
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
    "**Empfehlung:** Nimm den NSIS Installer für Auto-Updates und schnelleren Start. Nimm die portable `.exe` für eine Option ohne Installation und ohne Registry-Einträge.",
  dl_macos_h3: "Erststart unter macOS",
  dl_macos_warning:
    "Arroxy ist noch nicht code-signiert, daher warnt macOS Gatekeeper beim ersten Start. Das ist erwartet — kein Zeichen für eine Beschädigung.",
  dl_macos_m1_h4: "Methode über Systemeinstellungen (empfohlen):",
  dl_macos_step1: "Rechtsklick auf das Arroxy-App-Symbol und **Öffnen** wählen.",
  dl_macos_step2:
    "Der Warndialog erscheint — klicke auf **Abbrechen** (nicht auf *In den Papierkorb*)).",
  dl_macos_step3: "Öffne **Systemeinstellungen → Datenschutz & Sicherheit**.",
  dl_macos_step4:
    'Scroll runter zum Abschnitt **Sicherheit**. Dort steht _„Arroxy wurde blockiert, weil es nicht von einem identifizierten Entwickler stammt."_',
  dl_macos_step5:
    "Klicke auf **Trotzdem öffnen** und bestätige mit deinem Passwort oder Touch ID.",
  dl_macos_after:
    "Nach Schritt 5 öffnet sich Arroxy normal und die Warnung erscheint nie wieder.",
  dl_macos_m2_h4: "Terminal-Methode (fortgeschritten):",
  dl_macos_note:
    "macOS-Builds werden per CI auf Apple Silicon- und Intel-Runnern erstellt. Falls Probleme auftreten, bitte [ein Issue öffnen](../../issues) — Feedback von macOS-Nutzern beeinflusst aktiv den macOS-Testzyklus.",
  dl_linux_h3: "Erststart unter Linux",
  dl_linux_intro:
    "AppImages werden direkt ausgeführt — keine Installation nötig. Du musst die Datei nur als ausführbar markieren.",
  dl_linux_m1_text:
    "**Dateimanager:** Rechtsklick auf die `.AppImage` → **Eigenschaften** → **Berechtigungen** → **Datei als Programm ausführen erlauben** aktivieren, dann doppelklicken.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Falls der Start trotzdem fehlschlägt, fehlt möglicherweise FUSE:",
  dl_linux_flatpak_intro:
    "**Flatpak (sandboxed Alternative):** Lade `Arroxy-*.flatpak` von derselben Release-Seite herunter.",
  privacy_p1:
    "Downloads werden direkt über [yt-dlp](https://github.com/yt-dlp/yt-dlp) von YouTube in den von dir gewählten Ordner geholt — nichts wird über einen Drittanbieter-Server geleitet. Verlauf, Download-Historie, URLs und Dateiinhalte bleiben auf deinem Gerät.",
  privacy_p2:
    "Arroxy sendet anonyme, aggregierte Telemetrie über [Aptabase](https://aptabase.com) — gerade genug, damit ein Indie-Projekt sehen kann, ob es überhaupt genutzt wird (Starts, OS, App-Version, Abstürze). Keine URLs, keine Video-Titel, keine Dateipfade, keine IPs, keine Kontodaten — Aptabase ist Open Source und by Design GDPR-freundlich. Du kannst das in den Einstellungen deaktivieren.",
  faq_q1: "Ist es wirklich kostenlos?",
  faq_a1: "Ja — MIT-Lizenz, keine Premium-Stufe, keine Funktionsbarrieren.",
  faq_q2: "Welche Videoqualitäten kann ich herunterladen?",
  faq_a2:
    "Alles, was YouTube anbietet: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus nur Audio. Hochbildraten-Streams mit 60 fps und 120 fps sowie HDR-Inhalte werden unverändert übernommen.",
  faq_q3: "Kann ich nur den Audio-Track als MP3 extrahieren?",
  faq_a3: "Ja. Wähle im Format-Menü *nur Audio* und entscheide dich für MP3, AAC oder Opus.",
  faq_q4: "Brauche ich ein YouTube-Konto oder Cookies?",
  faq_a4:
    "Nein. Arroxy verwendet nur die öffentlichen Tokens, die YouTube an jeden Browser ausliefert. Keine Cookies, kein Login, keine gespeicherten Anmeldedaten. Siehe [Keine Cookies, kein Login, keine Kontoverknüpfung](#no-cookies) für den Hintergrund.",
  faq_q5: "Funktioniert es weiter, wenn YouTube etwas ändert?",
  faq_a5:
    "Zwei Resilienzschichten: yt-dlp wird innerhalb von Stunden nach YouTube-Änderungen aktualisiert, und Arroxy verlässt sich nicht auf Cookies, die alle ~30 Minuten ablaufen. Das macht es deutlich stabiler als Tools, die auf exportierte Browser-Sessions angewiesen sind.",
  faq_q6: "In welchen Sprachen ist Arroxy verfügbar?",
  faq_a6:
    "Neun: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Erkennt automatisch deine Systemsprache; jederzeit über die Symbolleiste umschaltbar. Sprachdateien sind einfache TypeScript-Objekte in `src/shared/i18n/locales/` — [PRs willkommen](../../pulls).",
  faq_q7: "Muss ich etwas zusätzlich installieren?",
  faq_a7:
    "Nein. yt-dlp und ffmpeg werden beim ersten Start automatisch von ihren offiziellen GitHub-Releases heruntergeladen und lokal gecacht.",
  faq_q8: "Kann ich Playlists oder ganze Kanäle herunterladen?",
  faq_a8:
    "Aktuell nur einzelne Videos und Shorts. Playlist- und Kanal-Support sind auf der [Roadmap](#roadmap).",
  faq_q9: 'macOS sagt „die App ist beschädigt" — was tun?',
  faq_a9:
    "Das ist macOS Gatekeeper, der eine unsignierte App blockiert — keine echte Beschädigung. Schau dir den Abschnitt [Erststart unter macOS](#download) für die Lösung an.",
  faq_q10: "Ist das Herunterladen von YouTube-Videos legal?",
  faq_a10:
    "Für den persönlichen, privaten Gebrauch ist es in den meisten Rechtsordnungen allgemein akzeptiert. Du bist selbst dafür verantwortlich, die [Nutzungsbedingungen](https://www.youtube.com/t/terms) von YouTube und die Urheberrechtsgesetze deines Landes einzuhalten.",
  plan_intro: "Was kommt — grob nach Priorität sortiert:",
  plan_col1: "Funktion",
  plan_col2: "Beschreibung",
  plan_r1_name: "**Playlist- & Kanal-Downloads**",
  plan_r1_desc:
    "Playlist- oder Kanal-URL einfügen; alle Videos mit Datums- oder Anzahl-Filtern in die Warteschlange",
  plan_r2_name: "**Mehrere URLs auf einmal eingeben**",
  plan_r2_desc: "Mehrere URLs einfügen und alle auf einmal starten",
  plan_r3_name: "**Format-Konvertierung**",
  plan_r3_desc: "Downloads in MP3, WAV, FLAC konvertieren — ohne extra Tool",
  plan_r4_name: "**Eigene Dateinamen-Vorlagen**",
  plan_r4_desc:
    "Dateien nach Titel, Hochlader, Datum, Auflösung benennen — mit Live-Vorschau",
  plan_r5_name: "**Geplante Downloads**",
  plan_r5_desc: "Warteschlange zu einer bestimmten Zeit starten (Nacht-Runs)",
  plan_r6_name: "**Geschwindigkeitsbegrenzung**",
  plan_r6_desc:
    "Bandbreite deckeln, damit Downloads deine Verbindung nicht auslasten",
  plan_r7_name: "**Clip-Trimming**",
  plan_r7_desc: "Nur ein Segment per Start-/Endzeit herunterladen",
  plan_cta:
    "Eine Funktion im Sinn? [Anfrage öffnen](../../issues) — Community-Input bestimmt die Priorität.",
  tech_content: TECH_CONTENT,
  tos_h2: "Nutzungsbedingungen",
  tos_note:
    "Arroxy ist ein Werkzeug ausschließlich für den persönlichen, privaten Gebrauch. Du bist allein dafür verantwortlich, dass deine Downloads den [YouTube-AGB](https://www.youtube.com/t/terms) und dem Urheberrecht deines Landes entsprechen. Verwende Arroxy nicht, um Inhalte herunterzuladen, zu vervielfältigen oder zu verbreiten, an denen du keine Rechte hast. Die Entwickler haften nicht für Missbrauch.",
  footer_credit:
    'MIT-Lizenz · Mit Sorgfalt gemacht von <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
