// Landing-page translations for "de". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const de = {
  title: "Arroxy — Kostenloser 4K YouTube-Downloader, kein Login erforderlich",
  description:
    "Kostenloser, MIT-lizenzierter Desktop-YouTube-Downloader für Windows, macOS und Linux. Videos in bis zu 4K HDR mit 60 fps herunterladen — ohne Google-Konto, Browser-Cookies oder Login.",
  og_title: "Arroxy — Kostenloser 4K YouTube-Downloader, kein Login erforderlich",
  og_description:
    "Kostenloser 4K YouTube-Downloader. Keine Cookies, kein Login, keine abgelaufenen Sitzungen. MIT-lizenziert. Windows · macOS · Linux.",

  nav_features: "Funktionen",
  nav_screenshots: "Screenshots",
  nav_install: "Installation",
  nav_blog: "Blog",
  nav_download: "Download",

  hero_eyebrow: "Open Source · MIT · Aktive Entwicklung",
  hero_h1_a: "Kostenloser 4K YouTube-Downloader.",
  hero_h1_b: "Keine Cookies. Kein Login. Keine abgelaufenen Sitzungen.",
  hero_tagline:
    "Arroxy ist ein kostenloser, MIT-lizenzierter Desktop-YouTube-Downloader für Windows, macOS und Linux. Videos werden in bis zu 4K HDR mit 60 fps heruntergeladen — ohne je nach einem Google-Konto, Browser-Cookies oder einem Login zu fragen.",
  hero_trust: "Jede Zeile auf GitHub prüfen.",
  pill_no_tracking: "Kein Tracking",
  pill_no_account: "Kein Google-Konto",
  pill_open_source: "Open Source (MIT)",
  cta_download_os: "Für dein Betriebssystem herunterladen",
  cta_view_github: "Auf GitHub ansehen",
  release_label: "Neueste Version:",
  release_loading: "wird geladen…",

  cta_download_windows: "Für Windows herunterladen",
  cta_download_windows_portable: "Portable .exe (ohne Installation)",
  cta_download_mac_arm: "Für macOS herunterladen (Apple Silicon)",
  cta_download_mac_intel: "Intel-Mac? x64 DMG laden",
  cta_download_linux_appimage: "Für Linux herunterladen (.AppImage)",
  cta_download_linux_flatpak: "Flatpak-Paket →",
  cta_other_platforms: "Andere Plattformen / Alle Downloads",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "Installer",
  cta_portable_label: "Portable",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy ist eine Desktop-App für Windows, macOS und Linux.",
  mobile_notice_sub: "Öffne diese Seite auf deinem Computer, um herunterzuladen.",
  mobile_copy_link: "Link kopieren",
  first_launch_label: "Hilfe beim ersten Start",
  first_launch_mac_html:
    "macOS zeigt beim ersten Start eine Warnung zu einem <em>nicht identifizierten Entwickler</em> — Arroxy ist noch nicht signiert. <strong>Rechtsklick auf das App-Symbol → Öffnen</strong>, dann im Dialog auf <strong>Öffnen</strong> klicken. Nur einmalig.",
  first_launch_linux_html:
    "<strong>AppImage:</strong> Rechtsklick auf die Datei → <strong>Eigenschaften → Als Programm ausführen erlauben</strong>, oder im Terminal <code>chmod +x Arroxy-*.AppImage</code> ausführen. Wenn der Start scheitert, installiere <code>libfuse2</code> (Ubuntu/Debian), <code>fuse-libs</code> (Fedora) oder <code>fuse2</code> (Arch).<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code>, dann aus dem App-Menü starten oder <code>flatpak run io.github.antonio_orionus.Arroxy</code> ausführen.",

  features_eyebrow: "Was es kann",
  features_h2: "Alles, was du erwartest — ganz ohne Reibung.",
  features_sub: "URL einfügen, Qualität wählen, Download klicken. Mehr nicht.",
  f1_h: "Bis zu 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — jede Auflösung, die YouTube bietet, plus Audio-only MP3, AAC und Opus.",
  f2_h: "60 fps & HDR erhalten",
  f2_p: "High-Framerate- und HDR-Streams kommen genau so durch, wie YouTube sie kodiert — ohne Qualitätsverlust.",
  f3_h: "Mehrere gleichzeitig",
  f3_p: "Reihe so viele Videos in die Warteschlange ein, wie du willst. Das Download-Panel verfolgt jeden Fortschritt parallel.",
  f4_h: "Auto-Updates",
  f4_p: "Arroxy hält yt-dlp und ffmpeg im Hintergrund aktuell — funktioniert nach jeder YouTube-Änderung.",
  f5_h: "9 Sprachen",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — erkennt deine automatisch.",
  f6_h: "Plattformübergreifend",
  f6_p: "Native Builds für Windows, macOS und Linux — Installer, Portable, DMG oder AppImage.",
  f7_h: "Untertitel, wie du willst",
  f7_p: "Manuelle oder automatisch generierte Untertitel in SRT, VTT oder ASS — neben dem Video gespeichert, in eine portable .mkv eingebettet oder in einen Subtitles/-Ordner sortiert.",
  f8_h: "SponsorBlock integriert",
  f8_p: "Überspringe oder markiere Sponsor-Segmente, Intros, Outros, Eigenwerbung und mehr — schneide sie mit FFmpeg heraus oder füge einfach Kapitel hinzu. Deine Wahl, pro Kategorie.",
  f9_h: "Automatisches Ausfüllen aus Zwischenablage",
  f9_p: "Kopiere einen YouTube-Link irgendwo und Arroxy erkennt ihn beim nächsten Wechsel zur App — ein Bestätigungsdialog hält dich in Kontrolle. In den Erweiterten Einstellungen ein- oder ausschalten.",
  f10_h: "URLs automatisch bereinigen",
  f10_p: "Tracking-Parameter (si, pp, feature, utm_*, fbclid, gclid und mehr) werden automatisch aus eingefügten YouTube-Links entfernt, und youtube.com/redirect-Wrapper werden aufgelöst — das URL-Feld zeigt immer den kanonischen Link.",
  f11_h: "In den Tray minimieren",
  f11_p: "Das Schließen des Fensters versteckt Arroxy im System-Tray. Downloads laufen im Hintergrund weiter — klicke auf das Tray-Symbol, um das Fenster zurückzubringen, oder beende die App über das Tray-Menü.",
  f12_h: "Eingebettete Metadaten & Cover",
  f12_p: "Titel, Upload-Datum, Künstler, Beschreibung, Cover-Art und Kapitelmarkierungen direkt in die Datei geschrieben — keine Sidecar-Dateien, kein manuelles Taggen.",

  shots_eyebrow: "In Aktion sehen",
  shots_h2: "Gebaut für Klarheit, nicht für Chaos.",
  shot1_alt: "URL einfügen",
  shot2_alt: "Qualität wählen",
  shot3_alt: "Speicherort wählen",
  shot4_alt: "Parallele Downloads",
  shot5_alt: "Untertitel-Schritt — Sprachen, Format und Speichermodus wählen",
  og_image_alt: "Arroxy App-Icon — Desktop-App zum Herunterladen von YouTube-Videos in 4K.",

  privacy_eyebrow: "Privatsphäre",
  privacy_h2_html: "Was Arroxy <em>nicht</em> tut.",
  privacy_sub:
    "Die meisten YouTube-Downloader fragen irgendwann nach deinen Cookies. Arroxy niemals.",
  p1_h: "Kein Login",
  p1_p: "Kein Google-Konto. Keine ablaufenden Sitzungen. Null Risiko, dass dein Konto markiert wird.",
  p2_h: "Keine Cookies",
  p2_p: "Arroxy fordert dieselben Tokens an wie jeder Browser. Nichts exportiert, nichts gespeichert.",
  p3_h: "Keine Nutzer-IDs",
  p3_p: "Anonyme, sitzungsbasierte Telemetrie via Aptabase — keine Installations-IDs, kein Fingerprinting, keine personenbezogenen Daten. Deine Downloads, Verlauf und Dateien verlassen nie dein Gerät.",
  p4_h: "Keine Drittanbieter-Server",
  p4_p: "Die ganze Pipeline läuft lokal über yt-dlp + ffmpeg. Dateien berühren nie einen Remote-Server.",

  install_eyebrow: "Installation",
  install_h2: "Wähle deinen Kanal.",
  install_sub:
    "Direkter Download oder ein gängiger Paketmanager — alle aktualisieren sich automatisch mit jedem Release.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Alle",
  winget_desc: "Empfohlen für Windows 10/11. Aktualisiert sich mit dem System.",
  scoop_desc: "Portable Installation via Scoop-Bucket. Keine Admin-Rechte nötig.",
  brew_desc: "Cask hinzufügen, mit einem Befehl installieren. Universal Binary (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Sandboxed Installation. Lade das .flatpak-Bundle aus den Releases und installier es mit einem Befehl. Kein Flathub-Setup nötig.",
  direct_h: "Direkter Download",
  direct_desc: "NSIS-Installer, portable .exe, .dmg, .AppImage oder .flatpak — direkt von GitHub Releases.",
  direct_btn: "Releases öffnen →",
  copy_label: "Kopieren",
  copied_label: "Kopiert!",

  footer_made_by: "MIT-Lizenz · Mit Sorgfalt gemacht von",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Sprache:",

  faq_eyebrow: "FAQ",
  faq_h2: "Häufig gestellte Fragen",
  faq_q1: "Welche Videoqualitäten kann ich herunterladen?",
  faq_a1:
    "Alles, was YouTube anbietet — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p und nur Audio. Hochbildraten-Streams (60 fps, 120 fps) und HDR-Inhalte werden unverändert übernommen. Arroxy zeigt dir jedes verfügbare Format und lässt dich exakt auswählen.",
  faq_q2: "Ist es wirklich kostenlos?",
  faq_a2:
    "Ja. MIT-Lizenz. Keine Premium-Stufe, keine versteckten Funktionsbarrieren.",
  faq_q3: "In welchen Sprachen ist Arroxy verfügbar?",
  faq_a3:
    "Neun, direkt out of the box: English, Español (Spanisch), Deutsch, Français (Französisch), 日本語 (Japanisch), 中文 (Chinesisch), Русский (Russisch), Українська (Ukrainisch) und हिन्दी (Hindi). Arroxy erkennt deine Betriebssystem-Sprache beim ersten Start und du kannst jederzeit über die Sprachauswahl in der Symbolleiste wechseln. Übersetzungen liegen als einfache TypeScript-Objekte in src/shared/i18n/locales/ — öffne einen PR auf GitHub, um beizutragen.",
  faq_q4: "Muss ich etwas installieren?",
  faq_a4:
    "Nein. yt-dlp und ffmpeg werden beim ersten Start automatisch von ihren offiziellen GitHub-Releases heruntergeladen und auf deinem Rechner gecacht. Danach ist keine weitere Einrichtung nötig.",
  faq_q5: "Funktioniert es weiter, wenn YouTube etwas ändert?",
  faq_a5:
    "Ja — und Arroxy hat zwei Resilienzschichten. Erstens: yt-dlp ist eines der am aktivsten gepflegten Open-Source-Tools überhaupt — es wird innerhalb von Stunden nach YouTube-Änderungen aktualisiert. Zweitens: Arroxy verlässt sich überhaupt nicht auf Cookies oder dein Google-Konto, also gibt's keine Session, die abläuft, und keine Anmeldedaten, die rotiert werden müssen. Diese Kombination macht es deutlich stabiler als Tools, die auf exportierte Browser-Cookies angewiesen sind.",
  faq_q6: "Kann ich Playlists herunterladen?",
  faq_a6:
    "Aktuell werden nur einzelne Videos unterstützt. Playlist- und Kanal-Support ist auf der Roadmap.",
  faq_q7: "Braucht es mein YouTube-Konto oder Cookies?",
  faq_a7:
    "Nein — und das ist wichtiger, als es klingt. Die meisten Tools, die nach einem YouTube-Update aufhören zu funktionieren, weisen dich an, deine Browser-Cookies zu exportieren. Dieser Workaround bricht alle ~30 Minuten zusammen, wenn YouTube Sessions rotiert, und yt-dlps eigene Doku warnt, dass das dein Google-Konto markieren kann. Arroxy nutzt nie Cookies oder Anmeldedaten. Kein Login. Kein verknüpftes Konto. Nichts läuft ab, nichts wird gesperrt.",
  faq_q8:
    'macOS sagt „die App ist beschädigt" oder „kann nicht geöffnet werden" — was tun?',
  faq_a8:
    "Das ist macOS Gatekeeper, der eine unsignierte App blockiert — nicht echte Beschädigung. Eine Schritt-für-Schritt-Anleitung zum Erststart unter macOS findest du im README.",
  faq_q9: "Ist das legal?",
  faq_a9:
    "Das Herunterladen von Videos zur persönlichen Nutzung ist in den meisten Rechtsordnungen allgemein akzeptiert. Du bist verantwortlich, die YouTube-AGB und deine lokalen Gesetze einzuhalten.",
};
