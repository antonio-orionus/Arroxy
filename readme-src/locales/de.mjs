const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — plattformübergreifende Desktop-Shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — Styling
- **Zustand** — State Management
- **yt-dlp** + **ffmpeg** — Download- und Mux-Engine (beide werden zur Laufzeit geholt: yt-dlp wird aktuell gehalten, ffmpeg/ffprobe werden einmal installiert und bleiben über Updates hinweg erhalten)
- **Vite** + **electron-vite** — Build-Tooling
- **Vitest** + **Playwright** — Unit- und End-to-End-Tests

</details>

<details>
<summary><strong>Aus dem Quellcode bauen</strong></summary>

### Voraussetzungen — alle Plattformen

| Tool    | Version | Install |
| ------- | ------- | ------- |
| Git     | any     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` oder \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` oder \`package.json\` \`packageManager\` |

Empfohlen: \`mise\` installieren und dann im Checkout \`mise install\` ausführen. Ohne mise Node.js aus \`.node-version\` und Bun aus \`package.json\` manuell aktivieren, bevor \`bun run bootstrap\` läuft.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools und Python können für native Rebuilds erforderlich sein.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Führe nach dem Klonen \`mise trust && mise install\` im Checkout aus. Wenn deine Shell bereits \`fnm\`, \`nvm\` oder ein Homebrew-Bun nutzt, aktiviere mise in \`~/.zshrc\`, damit Arroxy Node.js 24.21.0 und Bun 1.4.2 verwendet:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build- und Electron-Runtime-Abhängigkeiten
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Klonen & starten

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # empfohlen; überspringen, wenn die gepinnten Tools manuell aktiv sind
bun run bootstrap
bun run doctor
bun run dev            # Electron-App gegen den Vite-Renderer
\`\`\`

### Distributables bauen

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # für aktuelles OS paketieren
bun run dist:win     # Windows-Ziele auf unterstütztem Host paketieren
\`\`\`

> \`bun run bootstrap\` installiert Abhängigkeiten, baut Electron-App-Abhängigkeiten neu, prüft Electron, bereitet eingebettete ffmpeg/ffprobe für die Entwicklung vor und installiert Playwright Chromium. Release-Builds verwalten yt-dlp, ffmpeg und ffprobe zur Laufzeit im App-Datenordner; keines davon wird mit dem Installer ausgeliefert.

</details>`;

export const de = {
  icon_alt: "Arroxy Maskottchen",
  title:
    "Arroxy — Kostenloser Open-Source YouTube (+ 2000 Seiten) Downloader mit eingebautem Browser für Windows, macOS & Linux",
  read_in_label: "Sprache:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "License",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Languages",
  badge_website_alt: "Webseite",
  discord_badge_text: "Discord-Community beitreten",
  discord_badge_encoded: "Discord%2DCommunity%20beitreten",
  hero_desc:
    "Lade Videos, Shorts, Musik, Kanäle, Podcasts oder Audiotracks von **YouTube und 2000+ unterstützten Seiten** herunter — bis zu 8K HDR mit 60 fps, als MP3 / AAC / Opus oder nur den Teil, den du brauchst. **Durchstöbere YouTube oder jede andere Seite direkt in Arroxy** im Explore-Tab und lade das Video, die Playlist oder den Kanal herunter, den du gerade ansiehst; melde dich dort an, um private, Mitglieder- und altersbeschränkte Videos zu laden, die dein Konto ansehen darf. Läuft lokal auf Windows, macOS und Linux. **Keine Werbung, kein Bloat, kein Upselling.**",
  cta_latest: "↓ Neueste Version herunterladen",
  cta_website: "Webseite",
  star_cta: "Wenn Arroxy dir Zeit spart, hilft ein ⭐ anderen, es zu finden.",
  ai_notice:
    "> 🌐 Dies ist eine KI-gestützte Übersetzung. Die [englische README](README.md) ist die maßgebliche Quelle. Fehler entdeckt? [PRs sind willkommen](../../pulls).",
  toc_heading: "Inhalt",
  why_h2: "Warum Arroxy",
  features_h2: "Funktionen",
  dl_h2: "Installieren und erster Start",
  privacy_h2: "Datenschutz",
  faq_h2: "Häufig gestellte Fragen",
  roadmap_h2: "Roadmap",
  tech_h2: "Gebaut mit",
  why_intro: "Ein direkter Vergleich mit den gängigsten Alternativen:",
  why_r1: "Kostenlos, keine Premium-Stufe",
  why_r2: "Open Source",
  why_r3: "Nur lokale Verarbeitung",
  why_r5: "Keine Nutzungsbeschränkungen",
  why_r6: "Plattformübergreifende Desktop-App",
  why_r7: "Untertitel + SponsorBlock",
  why_r8: "Integrierter Browser (stöbern, anmelden, herunterladen)",
  why_r9:
    "Private, Mitglieder- und altersbeschränkte Videos ohne Cookie-Export",
  why_table_note:
    "⚠️ = teilweise oder nur in einer kostenpflichtigen Stufe. Bei 4K Video Downloader ist die In-App-Anmeldung für private Videos eine kostenpflichtige Funktion; die meisten kostenlosen yt-dlp-GUIs akzeptieren nur eine Cookie-Datei oder lesen die Cookies deines Webbrowsers aus.",
  why_summary:
    "Arroxy ist für eine Sache gebaut: eine saubere lokale Datei, egal ob du eine URL einfügst oder das Video in Explore findest. Kein Upselling, keine Datensammlung.",
  why_explore_h3:
    "Was ein einfacher yt-dlp-Wrapper nicht kann: der Explore-Tab",
  why_explore_intro:
    "Die meisten kostenlosen YouTube-Downloader sind ein URL-Feld über yt-dlp. Arroxy nutzt ebenfalls yt-dlp, hat aber zusätzlich **Explore**, einen in die App integrierten Browser, der YouTube oder jede andere Seite öffnet. Explore überwindet Hürden, an denen ein URL-Feld scheitert:",
  why_explore_1:
    "**Videos, die ein Konto brauchen, ohne Cookie-Export** — private, Mitglieder- und altersbeschränkte Videos (mit einem altersverifizierten Konto) sowie deine Listen „Später ansehen“ und „Gefällt mir“ sowie Videos hinter einer Anmeldung auf anderen Seiten. Ein einfacher Wrapper braucht einen cookies.txt-Export oder muss die Cookies deines Webbrowsers auslesen, was Chrome unter Windows inzwischen blockiert. In Arroxy meldest du dich einmal in Explore an, den Rest erledigt die App",
  why_explore_2:
    "**„Melde dich an, um zu bestätigen, dass du kein Bot bist“** — wenn YouTube das verlangt, startet Arroxy den Download mit deiner Explore-Anmeldung erneut, statt abzubrechen",
  why_explore_3:
    "**Das Download-Token von YouTube** — der integrierte Browser von Arroxy holt das Token, das YouTube vor einem Download erwartet. Ohne es kann YouTube weniger Formate und eine geringere Qualität liefern als gewünscht",
  why_explore_4:
    "**Kein Kopieren von Links** — finde in Explore ein Video, eine Playlist oder einen Kanal und starte den Download mit einem Klick, oder klicke mit der rechten Maustaste auf einen beliebigen Link auf der Seite",
  why_explore_5:
    "**Werbeblocker auf Wunsch** — ein Klick auf das Schild blockiert Werbung und Tracker auf den Seiten von Explore",
  feat_explore_h3: "Explore: das Web direkt in Arroxy durchstöbern",
  feat_explore_1: "**Explore-Tab** — durchstöbere YouTube oder jede andere Seite direkt in Arroxy und lade herunter, was du findest, ohne Links zu kopieren. **Download · *dein Profil*** stellt das Video, die Playlist oder den Kanal, den du gerade ansiehst, in die Warteschlange; mit dem Pfeil daneben wechselst du das Profil, und der Zauberstab öffnet den Schritt-für-Schritt-Download für Formate, Untertitel und mehr",
  feat_explore_6: "**Per Rechtsklick herunterladen** — klicke in Explore mit der rechten Maustaste auf einen Video-, Playlist- oder Kanal-Link, um ihn mit deinem Profil herunterzuladen, unter **Download mit** ein anderes Profil zu wählen, den Schritt-für-Schritt-Download zu öffnen oder den Link zu kopieren. Du musst nicht erst jedes Video öffnen",
  feat_explore_7: "**Kompaktes Layout** — ein Klick in der Symbolleiste von Explore verschiebt die Tabs von Arroxy dorthin und gibt der Seite mehr Platz",
  feat_explore_2: "**Adressleiste** — tippe, um YouTube zu durchsuchen, oder gib eine beliebige Webadresse ein, um diese Seite zu öffnen",
  feat_explore_3: "**Downloads, die ein Konto brauchen** — melde dich einmal in Explore an, und Arroxy kann private und Mitglieder-Videos laden, die dein Konto ansehen darf, altersbeschränkte Videos, wenn das Konto altersverifiziert ist, sowie deine Listen „Später ansehen“ und „Gefällt mir“. Melde dich dort auch bei anderen Seiten an, und deren Downloads nutzen diese Anmeldung, wenn sie sie brauchen. Arroxy lädt weiterhin zuerst abgemeldet und nutzt deine Explore-Anmeldung nur, wenn ein Download auf eine Weise scheitert, die ein Konto beheben kann. Wenn YouTube verlangt zu bestätigen, dass du kein Bot bist, probiert Arroxy ebenfalls deine Explore-Anmeldung",
  feat_explore_4: "**Nutze ein Zweitkonto** — der erste Bildschirm von Explore erklärt, warum: Das Herunterladen mit einem Konto birgt ein gewisses Risiko, dass dieses Konto eingeschränkt wird. Melde dich in den Einstellungen von Explore ab, wann immer du deine Anmeldungen vergessen lassen willst",
  feat_explore_5: "**Werbeblocker** — standardmäßig aus. Ein Klick auf das Schild in der Explore-Symbolleiste blockiert Werbung und Tracker auf seinen Seiten, ohne Downloads zu beeinflussen. YouTube kann bei angemeldeten Konten gegen Werbeblocker vorgehen",
  feat_quality_h3: "Qualität & Formate",
  feat_quality_1: "Bis zu **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2:
    "**Hohe Bildrate und HDR** unverändert erhalten — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — Audio-only als MP3, M4A/AAC, Opus oder WAV exportieren. In interaktiven Downloads die nativen Surround-/Dolby-Spuren der Quelle (AC-3, E-AC-3, 5.1, DRC) auswählen, sofern verfügbar, oder einen globalen Standard **Surround / Dolby bevorzugen** setzen",
  feat_quality_4:
    "**Profile mit Ziel** — *Bestes Bild* (AV1 · VP9) oder *Smart-TV* (MP4 · H.264), gespeichert als Auto, MP4, MKV oder WebM ohne Neukodierung. HDR ist *Auto* (nur wenn dein Bildschirm es anzeigen kann), *SDR* oder *HDR*",
  feat_quality_5:
    "**Jeder Codec in jeder Auflösung** — der Schritt-für-Schritt-Download listet AV1, VP9 und H.264 in jeder Auflösung nebeneinander auf, damit du den wählen kannst, den dein Fernseher oder dein Schnittprogramm abspielt",
  feat_quality_6:
    "**Erkenne, was ein Stream wirklich ist** — Auflösungen, die YouTube per KI hochskaliert hat, KI-synchronisierte Audiosprachen, Streams mit erhöhter Bitrate, 360°-Videos sowie beschädigte Kopien oder Kopien mit Wasserzeichen werden markiert. Profile überspringen KI-hochskalierte Streams, außer du erlaubst sie",
  feat_privacy_h3: "Datenschutz & Kontrolle",
  feat_privacy_1:
    "100 % lokale Verarbeitung — Downloads gehen direkt von YouTube auf deine Festplatte",
  feat_privacy_2: "Kein Login, keine Cookies, kein verknüpftes Google-Konto",
  feat_privacy_3: "Dateien direkt in den von dir gewählten Ordner gespeichert",
  feat_workflow_h3: "Workflow",
  feat_workflow_12: "**Globaler Download-Hotkey** — kopiere einen Link in einer beliebigen App und drücke `Ctrl+Shift+D` (`Cmd+Shift+D` unter macOS); Arroxy stellt ihn mit deinem aktiven Profil in die Warteschlange, ohne das Fenster zu öffnen, und eine Benachrichtigung bestätigt es. Standardmäßig aktiv, frei belegbar",
  feat_workflow_1: "**Flexible Startmodi** — wähle einen geführten Einzel-Download, eine Playlist-/Kanal-Auswahl, Bulk-URL-Eingabe, Quick Download mit gespeicherten Standardwerten oder stöbere und lade direkt in Explore",
  feat_workflow_2:
    "**Zentrale Download-Warteschlange** — jeder Einzel-, Playlist-, Bulk- oder Quick-Job landet an einem Ort für Fortschritt, Pausieren, Fortsetzen, Abbrechen, Wiederholen und Priorität",
  feat_workflow_3:
    "**Zwischenablage-Überwachung** — kopiere einen Videolink, und er landet im URL-Feld, sobald du zu Arroxy zurückkehrst, mit **Rückgängig**, falls das nicht gewollt war. Ist Arroxy gerade beschäftigt, wartet der Link, bis du wieder im Tab „URL“ bist (in den Einstellungen abschaltbar)",
  feat_workflow_4:
    "**URLs automatisch bereinigen** — entfernt Tracking-Parameter (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) und löst `youtube.com/redirect`-Links auf",
  feat_workflow_5:
    "**Tray-Modus** — das Schließen des Fensters lässt Downloads im Hintergrund weiterlaufen",
  feat_workflow_6:
    "**{{LANG_COUNT}} Sprachen** – erkennt automatisch das Systemgebietsschema und kann jederzeit umgeschaltet werden",
  feat_workflow_7:
    "**Playlist-Sync** — scannt eine Playlist erneut gegen einen lokalen Ordner, um bereits heruntergeladene Videos zu überspringen; erzeugt eine `.m3u`-Playlistdatei, die nach jedem Video aktualisiert wird",
  feat_workflow_8:
    "**Geschwindigkeits- und Pacing-Kontrollen** — begrenze die Download-Bandbreite, lege fest, wie viele Teile eines Videos gleichzeitig geladen werden, und füge Anfragepausen mit Presets hinzu (*Aus · Ausgewogen · Vorsichtig · Benutzerdefiniert*)",
  feat_workflow_9:
    "**Dateinamenvorlagen** — benenne Downloads nach deinen Regeln mit `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` und `{playlist_index}`, global oder pro Download-Profil",
  feat_workflow_10:
    "**Gleichzeitige Downloads und automatische Wiederholung** — wähle, wie viele Einträge der Warteschlange gleichzeitig laufen, und lass Arroxy einen Download nach einem Netzwerk- oder Serverproblem erneut versuchen, mit längerer Wartezeit vor jedem Versuch",
  feat_workflow_11:
    "**Profile pro Playlist-Eintrag** — weisen Sie jedem Video in einer Playlist ein eigenes Download-Profil zu statt einer Einstellung für die ganze Liste, sodass ein Durchlauf manche in voller Qualität archivieren und den Rest als MP3 holen kann",
  feat_workflow_13: "**Quick Download läuft im Hintergrund** — der Link erscheint sofort in Downloads und wird dort vorbereitet, ein Hinweis mit **Ansehen** bestätigt es, und das URL-Feld leert sich für den nächsten Link. Starte beliebig viele, während frühere noch vorbereitet werden",
  feat_workflow_14: "**Downloads zeigt, was dich braucht** — wenn Arroxy einen Link nicht lesen kann, nennt seine Zeile den Grund und bietet die Lösung an: Erneut versuchen, Cookies einschalten oder in Explore anmelden. Bei ausgeschalteten Cookies versucht **Mit Explore anmelden** es für dich erneut, sobald du angemeldet bist. Eine Playlist, die länger als dein Ladelimit ist, wartet in ihrer Zeile darauf, dass du alles, die ersten Videos oder eine Prüfung wählst. Der Downloads-Tab zählt die Zeilen, die auf dich warten",
  feat_workflow_15:
    "**Nur einen Teil eines Videos herunterladen** — wähle auf dem Format-Bildschirm Start und Ende oder ein Kapitel, und Arroxy speichert nur diesen Bereich, benannt mit dem Bereich nach der Video-ID. Schnitte landen am nächstgelegenen Keyframe; aktiviere stattdessen den exakten Schnitt, um neu zu kodieren",
  feat_workflow_16:
    "**Fertige Downloads automatisch entfernen** — optional: Ein fertiger Download verschwindet 5 Sekunden später aus der Liste. Seine Dateien bleiben auf der Festplatte, und fehlgeschlagene Downloads bleiben gelistet",
  feat_workflow_17:
    "**Größe und Fehlt in Downloads** — eine sortierbare Spalte **Größe** zeigt, wie viel Platz jeder Download belegt, und **Fehlt** markiert Dateien, die außerhalb von Arroxy verschoben oder gelöscht wurden",
  feat_workflow_18:
    "**Aurora oder Minimal, dunkel oder hell** — Glasflächen über einem bewegten Himmel oder ruhige, einfarbige Flächen; wechsle in der Fußzeile. Computer ohne Grafikbeschleunigung bekommen automatisch Minimal",
  feat_workflow_19:
    "**Mac-Menüleiste** — öffne unter macOS die Einstellungen (`Cmd+,`), lege das Download-Geschwindigkeitslimit fest, wechsle Stil und Farbschema und öffne Protokolle oder speichere eine Diagnosedatei direkt in der Menüleiste",
  feat_workflow_20:
    "**Profil aus jedem Download heraus ändern** — passe einen Download an und aktualisiere dann das Profil, mit dem er begonnen hat (mit einer Vorschau der Änderungen), oder speichere die Einstellungen als neues Profil. Beim Wechsel des Profils fragt Arroxy, ob deine Änderungen erhalten bleiben sollen",
  feat_post_h3: "Untertitel & Nachbearbeitung",
  feat_post_1:
    "**Untertitel** in SRT, VTT oder ASS — manuell oder automatisch generiert, in jeder verfügbaren Sprache",
  feat_post_2:
    "Neben dem Video speichern, in `.mkv` einbetten oder in einem `Subtitles/`-Unterordner organisieren",
  feat_post_3:
    "**SponsorBlock** — Sponsoren, Intros, Outros, Eigenwerbung überspringen oder als Kapitel markieren",
  feat_post_4:
    "**Eingebettete Metadaten** — Titel, Upload-Datum, Kanal, Beschreibung, Thumbnail und Kapitelmarkierungen in die Datei geschrieben",
  feat_post_5:
    "**Nur-Untertitel-Stapel** — eine Liste von URLs einfügen oder eine Playlist öffnen, Untertitel wählen und für jedes Video nur die Untertiteldateien erhalten",
  feat_sites_h3: "YouTube + 2000 Seiten",
  feat_sites_1:
    "**YouTube, vollständig** — Videos, Shorts, Kanäle, Playlists, YouTube Music und Podcasts werden als erstklassige Quellen behandelt",
  feat_sites_2:
    "**2000+ weitere Seiten** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable und viele mehr",
  feat_sites_3:
    "**Nur Audio und Untertitel** funktionieren auf jeder unterstützten Seite, nicht nur auf YouTube",
  feat_sites_4:
    "Ändert sich eine Seite, liefert yt-dlp wöchentlich Fixes und Arroxy aktualisiert das Binary beim Start automatisch",
  shot1_cap:
    "<b>Quick-Download-Startseite</b><br/>URL einfügen und sofort mit deinem aktiven Profil herunterladen",
  shot2_cap:
    "<b>Wiederverwendbare Download-Profile</b><br/>Format, Qualität und Ausgabe als Voreinstellung speichern – pro Download wiederverwenden",
  shot3_cap:
    "<b>Mehrsprachige Audiospuren</b><br/>Genau die Audiosprache wählen, die ein Video mitbringt",
  shot4_cap:
    "<b>Surround-/Dolby-Audio</b><br/>5.1- und Dolby-Spuren erkannt und erhalten",
  shot5_cap:
    "<b>Massen-URL-Modus</b><br/>Liste einfügen, automatisch entdoppeln, alle auf einmal einreihen",
  shot6_cap:
    "<b>Paralleler Download-Verlauf</b><br/>Mehrere Downloads gleichzeitig mit Live-Fortschritt",
  hotkey_fig_alt: "Globaler Download-Hotkey von Arroxy — Ctrl+Shift+D unter Windows und Linux, Cmd+Shift+D unter macOS, schickt den kopierten Link direkt in die Download-Warteschlange",
  hotkey_fig_cap: "<b>Globaler Download-Hotkey</b><br/>Link irgendwo kopieren, einmal drücken — er landet in der Warteschlange und der Download startet",
  shot7_cap: "<b>Profile pro Playlist-Eintrag</b><br/>Jedem Video ein eigenes Profil geben – manche in 4K archivieren, den Rest als MP3 holen",
  shot8_cap: "<b>Explore</b><br/>Durchstöbere YouTube oder jede andere Seite direkt in Arroxy und lade die aktuelle Seite mit deinem aktiven Profil herunter",
  shot9_cap: "<b>Der erste Bildschirm von Explore</b><br/>Ein kurzer Blick auf Explore – und warum ein Zweitkonto die sicherere Anmeldung ist",
  shot10_cap: "<b>Downloads zeigt, was dich braucht</b><br/>Links werden im Hintergrund vorbereitet; ein fehlgeschlagener bietet seine Lösung an, eine lange Playlist wartet auf deine Wahl",
  shot11_cap:
    "<b>Nur einen Teil eines Videos laden</b><br/>Wähle Start und Ende oder ein Kapitel — Arroxy speichert nur diesen Abschnitt",
  shot12_cap:
    "<b>Profil-Editor</b><br/>Ein Profil feinjustieren: Dateityp, Auflösung, Untertitel, Zielordner, Dateinamenvorlage und mehr",
  shot13_cap:
    "<b>Dunkel oder hell, Glas oder schlicht</b><br/>Vier Looks zur Wahl: Glasflächen über einem bewegten Himmel oder ruhige, einfarbige Flächen – jeweils dunkel und hell",
  dl_platform_col: "Plattform",
  dl_format_col: "Format",
  dl_oneline_note:
    "Builds gibt es nur für x86_64. Kein `curl`? Ersetze `curl -fsSL` durch `wget -qO-`.",
  dl_win_scoop:
    "Lieber Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
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
  dl_win_smartscreen_h4: "Windows SmartScreen-Warnung",
  dl_win_smartscreen_intro:
    'Beim ersten Start kann **"Windows protected your PC"** oder **"Unknown publisher"** erscheinen. Das gilt sowohl für `Arroxy-win-x64-Setup.exe` als auch für `Arroxy-win-x64-Portable.exe`. Arroxy ist kostenlos und Open Source, und die Windows-Builds sind nicht mit einem kostenpflichtigen Zertifikat signiert, weshalb SmartScreen sie markiert. Das bedeutet **nicht** automatisch, dass Arroxy unsicher ist. So geht es weiter:',
  dl_win_smartscreen_step1: "Klicke auf **More info**.",
  dl_win_smartscreen_step2: "Klicke auf **Run anyway**.",
  dl_win_smartscreen_official:
    "Lade Arroxy nur von der offiziellen GitHub Releases-Seite herunter. Wenn du die Datei von einer anderen Website bekommen hast oder jemand sie dir geschickt hat, lösche sie und lade eine frische Kopie von der offiziellen Quelle herunter. Der Quellcode ist öffentlich, du kannst ihn also selbst prüfen oder Arroxy selbst kompilieren.",
  dl_macos_h3: "Erststart unter macOS",
  dl_macos_warning:
    "Arroxy ist noch nicht code-signiert, daher kann macOS Gatekeeper beim ersten Start die beschädigte-App-Warnung anzeigen. Das ist erwartet — es bedeutet nicht, dass die Dateien wirklich beschädigt sind.",
  dl_macos_m1_h4: "Terminal-Methode:",
  dl_macos_step1:
    "Ziehe `Arroxy.app` aus dem gemounteten DMG nach `/Applications`.",
  dl_macos_step2:
    "Öffne Terminal und führe `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` aus.",
  dl_macos_step3: "Führe `open /Applications/Arroxy.app` aus.",
  dl_macos_step4:
    "Wenn der App-Pfad anders ist, ersetze `/Applications/Arroxy.app` durch deinen Installationspfad.",
  dl_macos_step5:
    "Gib dein Mac-Passwort ein, falls `sudo` danach fragt.",
  dl_macos_after:
    "Nachdem die Quarantäne entfernt wurde, öffnet Arroxy normal.",
  dl_macos_m2_h4: "Terminal-Methode:",
  dl_macos_note:
    "macOS-Builds werden per CI auf Apple Silicon- und Intel-Runnern erstellt. Falls Probleme auftreten, bitte [ein Issue öffnen](../../issues) — Feedback von macOS-Nutzern beeinflusst aktiv den macOS-Testzyklus.",
  dl_linux_h3: "Erststart unter Linux",
  dl_linux_intro:
    "AppImages werden direkt ausgeführt — keine Installation nötig. Du musst die Datei nur als ausführbar markieren.",
  dl_linux_m1_text:
    "**Dateimanager:** Rechtsklick auf die `.AppImage` → **Eigenschaften** → **Berechtigungen** → **Datei als Programm ausführen erlauben** aktivieren, dann doppelklicken.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Falls der Start trotzdem fehlschlägt, starte es ohne Mounten — dafür ist kein FUSE-Paket nötig:",
  dl_linux_targz_h4: "Einfaches Tarball (kein FUSE, keine Installation):",
  dl_linux_targz_text: "Der `.tar.gz`-Build ist dieselbe App ohne AppImage-Hülle — entpacke sie irgendwohin und starte sie. Kein Installer und kein FUSE-Paket nötig.",
  dl_linux_arch_note: "**Die Linux-Downloads auf der Release-Seite gibt es nur für x86_64.** Auf ARM64-Geräten (Raspberry Pi, Asahi Linux) lässt sich das Flatpak zwar installieren, scheitert aber beim Start mit `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Warum du möglicherweise eine Warnung siehst",
  dl_warning_p1:
    "Arroxy ist Open Source und MIT-lizenziert. Die Windows- und macOS-Builds sind **nicht code-signiert** — Apple Developer ID und Windows EV Code-Signing-Zertifikate kosten jeweils mehrere Hundert Dollar im Jahr, die ein Indie-Projekt aus eigener Tasche zahlt. Ohne diese Signaturen warnen Windows SmartScreen und macOS Gatekeeper beim ersten Start. Die Warnungen bedeuten *dein Betriebssystem erkennt den Herausgeber nicht* — sie bedeuten nicht, dass Arroxy Malware ist.",
  dl_warning_p2:
    "Drei Wege, Arroxy selbst zu überprüfen, in aufsteigender Genauigkeit:\n\n- **Quellcode lesen.** Jede Zeile steht auf [GitHub](https://github.com/antonio-orionus/Arroxy) und du kannst [es aus dem Quellcode bauen](#tech).\n- **SHA256 prüfen.** Vergleiche deine Datei mit der veröffentlichten [`SHA256SUMS`](../../releases/latest) — siehe [Download verifizieren](#verify) unten.\n- **Drittanbieter-Scan.** Lade die Datei bei [VirusTotal](https://www.virustotal.com) hoch.",

  dl_win_first_h3: "Windows-Erststart",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "Wenn Windows Defender die Datei markiert oder entfernt",
  dl_win_defender_p:
    "Defender-Heuristiken markieren unsignierte NSIS-Installer und Electron-Portables manchmal als verdächtig. Wenn Defender `Arroxy-win-x64-Setup.exe` oder `Arroxy-win-x64-Portable.exe` in Quarantäne stellt, stelle sie aus **Windows Security → Virus & threat protection → Protection history** wieder her und füge die Arroxy-Executable als erlaubtes Element unter **Manage settings → Add or remove exclusions** hinzu. Wie bei SmartScreen ist der Auslöser die fehlende Herausgebersignatur, nicht erkannte Malware.",

  dl_macos_first_h3: "macOS-Erststart",
  dl_macos_intro:
    "Arroxy ist noch nicht für macOS code-signiert, daher kann Gatekeeper nach der Installation aus dem DMG den erschreckenden Dialog *\"Arroxy.app is damaged and can't be opened\"* anzeigen. Diese Meldung bedeutet, dass macOS eine unsignierte App unter Quarantäne gestellt hat; sie bedeutet nicht, dass die App-Dateien wirklich beschädigt sind. Auf aktuellen macOS-Versionen ist Terminal der zuverlässige Weg:",
  dl_macos_sequoia_h4: "Terminal-Fix für aktuelles macOS",
  dl_macos_sequoia_intro:
    "Nutze Terminal, nachdem du Arroxy nach Applications kopiert hast:",
  dl_macos_sequoia_step1:
    "Ziehe `Arroxy.app` aus dem eingehängten DMG nach `/Applications`.",
  dl_macos_sequoia_step2:
    "Öffne Terminal und führe diese zwei Befehle aus:",
  dl_macos_sequoia_step3:
    "Führe `open /Applications/Arroxy.app` aus, um Arroxy zu starten.",
  dl_macos_sequoia_step4:
    "Wenn der App-Pfad anders ist, ersetze `/Applications/Arroxy.app` durch deinen Installationspfad.",
  dl_macos_sonoma_h4: "Terminal-Fix für ältere macOS-Versionen",
  dl_macos_sonoma_step1:
    "Ziehe `Arroxy.app` aus dem eingehängten DMG nach `/Applications`.",
  dl_macos_sonoma_step2:
    "Öffne Terminal und entferne die Quarantäne von `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Starte Arroxy über Terminal oder Finder, nachdem die Quarantäne entfernt wurde.",
  dl_macos_damaged_h4:
    "Gatekeeper-Quarantäne beheben",
  dl_macos_damaged_p:
    "Der erste Befehl entfernt das Quarantäne-Attribut von deiner installierten Arroxy-Kopie. Der zweite startet die App. `sudo` kann nach deinem Mac-Passwort fragen; Terminal zeigt beim Tippen keine Zeichen an.",
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** auf einem Mac der M-Serie (M1 / M2 / M3 / M4) lade das `arm64`-DMG herunter. Auf Intel-Macs lade das `x64`-DMG. Der falsche Build funktioniert auch über Rosetta, ist aber spürbar langsamer.",

  dl_linux_first_h3: "Linux-Erststart",
  dl_linux_appimagelauncher:
    "**Optionale Desktop-Integration:** installiere [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) einmalig, und jede AppImage, auf die du doppelklickst, wird automatisch in deinem Launcher-Menü registriert — keine manuelle `.desktop`-Datei nötig.",

  dl_verify_h3: "Download verifizieren (SHA256)",
  dl_verify_intro:
    "Jedes Release veröffentlicht eine `SHA256SUMS`-Datei zusammen mit den Binärdateien. Um zu prüfen, dass dein Download nicht beschädigt oder unterwegs manipuliert wurde, hashe deine Datei lokal und gleiche die Zeile in `SHA256SUMS` ab. Öffne die neueste Release-Seite → **Assets** → lade `SHA256SUMS` herunter.",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Möchtest du einen Drittanbieter-Malware-Scan? Lade die Datei bei [VirusTotal](https://www.virustotal.com) hoch. Eine Handvoll generischer Heuristik-Flags von kleineren Engines ist bei unsignierten Electron-Apps normal; weit verbreitete Erkennungen durch große Engines wären ein echter Anlass zur Sorge.",

  dl_pm_intro:
    "Verwendest du bereits einen Paketmanager? Du kannst den manuellen Download-Weg überspringen.",

  privacy_p1:
    "Downloads werden direkt über [yt-dlp](https://github.com/yt-dlp/yt-dlp) von YouTube in den von dir gewählten Ordner geholt — nichts wird über einen Drittanbieter-Server geleitet. Verlauf, Download-Historie, URLs und Dateiinhalte bleiben auf deinem Gerät.",
  privacy_p2:
    "Keine Telemetrie — nur ein anonymes Lebenszeichen pro Tag: App-Version, OS, Sprache, Installationskanal und Land, damit wir aktive Nutzer zählen können. Keine IDs, URLs, Videotitel, Dateipfade oder Kontodaten. Du kannst es in den Einstellungen abschalten.",
  privacy_p3: "Explore hat eine eigene Anmeldung, getrennt von deinem Browser, und Arroxy liest oder füllt das Anmeldeformular nie aus – du tippst auf Googles eigener Seite. Downloads laufen abgemeldet; nur wenn einer auf eine Weise scheitert, die ein Konto beheben kann, liest Arroxy die Anmeldung frisch aus, hält sie für diesen Download in einer temporären Datei und löscht die Datei danach. Wenn du dich in den Einstellungen von Explore abmeldest, wird sie vergessen.",
  faq_q1: "Ist es wirklich kostenlos?",
  faq_a1: "Ja — MIT-Lizenz, keine Premium-Stufe, keine Funktionsbarrieren.",
  faq_q11: "Wie unterscheidet sich Arroxy von anderen yt-dlp-GUIs?",
  faq_a11:
    "Die meisten kostenlosen yt-dlp-GUIs sind Wrapper, die nur einen Link annehmen. Arroxy bringt zusätzlich **Explore** mit, einen in die App integrierten YouTube-Browser: Du stöberst und lädst herunter, ohne Links zu kopieren, und meldest dich dort einmal an, um private, Mitglieder- und altersbeschränkte Videos sowie deine Listen „Später ansehen“ und „Gefällt mir“ herunterzuladen – ganz ohne Cookie-Export. Arroxy nutzt diese Anmeldung, wenn YouTube dich bittet zu bestätigen, dass du kein Bot bist, und der integrierte Browser holt das Download-Token von YouTube, damit Downloads nicht auf weniger Formate zurückfallen. Siehe [Warum Arroxy](#why).",
  faq_q2: "Welche Videoqualitäten kann ich herunterladen?",
  faq_a2:
    "Alles, was YouTube anbietet: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus nur Audio. Streams mit 60 fps und HDR werden unverändert übernommen, und im Schritt-für-Schritt-Download wählst du in jeder Auflösung zwischen AV1, VP9 und H.264.",
  faq_q3: "Kann ich nur den Audio-Track als MP3 extrahieren?",
  faq_a3:
    "Ja. Wähle im Formatmenü *nur Audio* und dann MP3, M4A/AAC, Opus oder WAV.",
  faq_q4: "Wie lade ich Videos herunter, für die ein YouTube-Konto nötig ist?",
  faq_a4: "Melde dich einmal im Explore-Tab an. Arroxy kann dann private und Mitglieder-Videos laden, die dein Konto ansehen darf, altersbeschränkte Videos, wenn das Konto altersverifiziert ist, sowie deine Listen „Später ansehen“ und „Gefällt mir“. Die Anmeldung wird nur genutzt, wenn ein Download auf eine Weise scheitert, die ein Konto beheben kann; alles andere lädt wie bisher. Das ist die Option **Explore-Anmeldung**, die in den Cookie-Einstellungen als Erste steht und als Empfohlen markiert ist, und Arroxy wählt sie beim ersten Öffnen von Explore für dich. Das yt-dlp-Wiki weist darauf hin, dass [angemeldete Automatisierung ein Google-Konto markieren kann](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), daher ist ein Zweitkonto die sicherere Wahl.",
  faq_q5: "Funktioniert es weiter, wenn YouTube etwas ändert?",
  faq_a5: "yt-dlp wird beim Start automatisch aktualisiert, und Arroxy liefert zügig Fixes, sobald YouTube etwas ändert. Wenn YouTube verlangt zu bestätigen, dass du kein Bot bist, probiert Arroxy außerdem deine Explore-Anmeldung, falls du dich dort angemeldet hast; Cookies aus einer Datei oder deinem Browser stehen in den Cookie-Einstellungen bereit.",
  faq_q6: "In welchen Sprachen ist Arroxy verfügbar?",
  faq_a6:
    "{{LANG_COUNT}} Sprachen sind sofort verfügbar: {{LANG_NAME_LIST}}. Arroxy erkennt beim ersten Start automatisch die Sprache deines Betriebssystems, und du kannst jederzeit über die Sprachauswahl in der Symbolleiste wechseln. Runtime-Locale-JSON liegt in src/shared/i18n/locales/, die PO-Kataloge für Übersetzer liegen in i18n/locales/ — öffne einen PR auf GitHub, um beizutragen.",
  faq_q7: "Muss ich etwas zusätzlich installieren?",
  faq_a7:
    "Nein. yt-dlp, ffmpeg und ffprobe werden beim ersten Start automatisch heruntergeladen und auf deinem Rechner gecacht. Danach ist keine weitere Einrichtung nötig.",
  faq_q8: "Kann ich Playlists oder ganze Kanäle herunterladen?",
  faq_a8:
    "Ja — beides. Füge eine Playlist-URL oder Kanal-URL ein (z. B. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); wähle, wie viele Einträge gescannt werden sollen, und stelle dann die ganze Liste in die Warteschlange oder wähle einzelne Videos aus. Datumsfilter kommen bald.",
  faq_q9: 'macOS sagt „die App ist beschädigt" — was tun?',
  faq_a9:
    "Das ist macOS Gatekeeper, der eine unsignierte App blockiert — kein echter Schaden. Siehe [macOS first launch](#macos-first-launch) für die Terminal-Befehle, die die Quarantäne entfernen und Arroxy starten.",
  faq_q10: "Ist das Herunterladen von YouTube-Videos legal?",
  faq_a10:
    "Für den persönlichen, privaten Gebrauch ist es in den meisten Rechtsordnungen allgemein akzeptiert. Du bist selbst dafür verantwortlich, die [Nutzungsbedingungen](https://www.youtube.com/t/terms) von YouTube und die Urheberrechtsgesetze deines Landes einzuhalten.",
  plan_intro: "Weiter geplant — grob nach Priorität sortiert:",
  plan_col1: "Funktion",
  plan_col2: "Beschreibung",
  plan_r1_name: "**Playlist- & Kanal-Filter**",
  plan_r1_desc: "Datumsfilter beim Einlesen einer Playlist oder eines Kanals",
  plan_r2_name: "**YouTube-Audiospur-Präferenzen**",
  plan_r2_desc:
    "App-weite bevorzugte Sprachspur festlegen, mit Überschreibungen pro Profil, wenn YouTube mehrere Audiospuren anbietet",
  plan_r3_name: "**Stärkere Wiederaufnahme nach Fehlern**",
  plan_r3_desc:
    "Ein neuer Retry-Pfad für Downloads, die durch unzuverlässige oder problematische Internetverbindungen unterbrochen werden",
  plan_r4_name: "**Vollwertiger Download-Manager-Drawer**",
  plan_r4_desc:
    "Den Queue-Drawer zu einem volleren Manager ausbauen, inklusive Zielordner-Wechsel für eingereihte Elemente",
  plan_r5_name: "**Geplante Downloads**",
  plan_r5_desc: "Warteschlange zu einer bestimmten Zeit starten (Nacht-Runs)",
  plan_r9_name: "**AUR-Paket**",
  plan_r9_desc: "Installation unter Arch Linux und Omarchy mit `yay -S arroxy-bin`",
  plan_cta:
    "Eine Funktion im Sinn? [Anfrage öffnen](../../issues) — Community-Input bestimmt die Priorität.",
  tech_content: TECH_CONTENT,
  support_h2: "Arroxy unterstützen",
  support_note: "Arroxy ist kostenlos und MIT-lizenziert — keine Werbung, keine Telemetrie, keine Bezahlversion. Wenn es dir Zeit spart, kannst du die Entwicklung mit Bitcoin, Tron oder Ethereum unterstützen: Die Adressen stehen in [DONATE.md](DONATE.md), der einzigen offiziellen Quelle dafür. Arroxy schickt dir niemals eine Adresse per E-Mail oder Direktnachricht. Ein Stern für das Repo, Fehlerberichte und bessere Übersetzungen helfen genauso viel.",
  tos_h2: "Nutzungsbedingungen",
  tos_note:
    "Arroxy ist ein Werkzeug ausschließlich für den persönlichen, privaten Gebrauch. Du bist allein dafür verantwortlich, dass deine Downloads den [YouTube-AGB](https://www.youtube.com/t/terms) und dem Urheberrecht deines Landes entsprechen. Verwende Arroxy nicht, um Inhalte herunterzuladen, zu vervielfältigen oder zu verbreiten, an denen du keine Rechte hast. Die Entwickler haften nicht für Missbrauch.",
  footer_credit:
    'MIT-Lizenz · Mit Sorgfalt gemacht von <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
