<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy Maskottchen" width="180" />

# Arroxy — Kostenloser Open-Source YouTube Downloader für Windows, macOS & Linux

**4K · 1080p60 · HDR · MP3 · Shorts · Subtitles · SponsorBlock**

**Sprache:** [Afaan Oromoo](README.om.md) · **Deutsch** · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Release](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) ![License](https://img.shields.io/badge/license-MIT-green) ![Platforms](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Languages](https://img.shields.io/badge/i18n-19_languages-blue)

Lade jedes YouTube-Video, jeden Short oder jeden Audio-Track in Originalqualität herunter — bis zu 4K HDR mit 60 fps, oder als MP3 / AAC / Opus. Läuft lokal auf Windows, macOS und Linux. **Keine Werbung, kein Login, keine Browser-Cookies, kein verknüpftes Google-Konto.**

[**↓ Neueste Version herunterladen**](../../releases/latest) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy Demo" width="720" />

Wenn Arroxy dir Zeit spart, hilft ein ⭐ anderen, es zu finden.

</div>

> 🌐 Dies ist eine KI-gestützte Übersetzung. Die [englische README](README.md) ist die maßgebliche Quelle. Fehler entdeckt? [PRs sind willkommen](../../pulls).

---

## Inhalt

- [Warum Arroxy](#why)
- [Keine Cookies, kein Login, keine Kontoverknüpfung](#no-cookies)
- [Funktionen](#features)
- [Download](#download)
- [Datenschutz](#privacy)
- [Häufig gestellte Fragen](#faq)
- [Roadmap](#roadmap)
- [Gebaut mit](#tech)

---

## <a id="why"></a>Warum Arroxy

Ein direkter Vergleich mit den gängigsten Alternativen:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Kostenlos, keine Premium-Stufe |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open Source |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Nur lokale Verarbeitung |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Kein Login oder Cookie-Export |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Keine Nutzungsbeschränkungen |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Plattformübergreifende Desktop-App |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Untertitel + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy ist für eine Sache gebaut: URL einfügen, saubere lokale Datei erhalten. Keine Konten, kein Upselling, keine Datensammlung.

---

## <a id="no-cookies"></a>Keine Cookies, kein Login, keine Kontoverknüpfung

Das ist der häufigste Grund, warum Desktop-YouTube-Downloader kaputt gehen — und der Hauptgrund, warum Arroxy existiert.

Wenn YouTube seine Bot-Erkennung aktualisiert, sagen die meisten Tools, du sollst als Workaround deine Browser-YouTube-Cookies exportieren. Zwei Probleme damit:

1. Exportierte Sessions laufen typischerweise nach ~30 Minuten ab, sodass du sie ständig neu exportieren musst.
2. yt-dlps eigene Dokumentation [warnt, dass Cookie-basierte Automatisierung dein Google-Konto markieren kann](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).

**Arroxy fragt nie nach Cookies, Logins oder Anmeldedaten.** Es verwendet nur die öffentlichen Tokens, die YouTube an jeden Browser ausliefert. Nichts ist mit deiner Google-Identität verknüpft, nichts läuft ab, nichts muss rotiert werden.

---

## <a id="features"></a>Funktionen

### Qualität & Formate

- Bis zu **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Hohe Bildrate** unverändert erhalten — 60 fps, 120 fps, HDR
- **Nur Audio** als MP3, AAC oder Opus exportieren
- Schnell-Presets: *Beste Qualität* · *Ausgewogen* · *Kleine Datei*

### Datenschutz & Kontrolle

- 100 % lokale Verarbeitung — Downloads gehen direkt von YouTube auf deine Festplatte
- Kein Login, keine Cookies, kein verknüpftes Google-Konto
- Dateien direkt in den von dir gewählten Ordner gespeichert

### Workflow

- **Beliebige YouTube-URL einfügen** — Videos und Shorts werden beide unterstützt
- **Mehrfach-Download-Warteschlange** — mehrere Downloads parallel verfolgen
- **Zwischenablage-Überwachung** — kopiere einen YouTube-Link und Arroxy füllt die URL automatisch aus, wenn du die App wieder fokussierst (in den erweiterten Einstellungen umschaltbar)
- **URLs automatisch bereinigen** — entfernt Tracking-Parameter (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) und löst `youtube.com/redirect`-Links auf
- **Tray-Modus** — das Schließen des Fensters lässt Downloads im Hintergrund weiterlaufen
- **9 Sprachen** — erkennt automatisch die Systemsprache, jederzeit umschaltbar

### Untertitel & Nachbearbeitung

- **Untertitel** in SRT, VTT oder ASS — manuell oder automatisch generiert, in jeder verfügbaren Sprache
- Neben dem Video speichern, in `.mkv` einbetten oder in einem `Subtitles/`-Unterordner organisieren
- **SponsorBlock** — Sponsoren, Intros, Outros, Eigenwerbung überspringen oder als Kapitel markieren
- **Eingebettete Metadaten** — Titel, Upload-Datum, Kanal, Beschreibung, Thumbnail und Kapitelmarkierungen in die Datei geschrieben

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="URL einfügen" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Qualität wählen" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Speicherort wählen" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Download-Warteschlange in Aktion" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Untertitel-Sprachen und Format wählen" />
</div>

---

## <a id="download"></a>Download

| Plattform | Format   |
| ------------------- | ------------------- |
| Windows             | Installer (NSIS) oder Portable `.exe`   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` oder `.flatpak` (sandboxed) |

[**Neuesten Release holen →**](../../releases/latest)

### Per Paketmanager installieren

| Kanal | Befehl                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |

<details>
<summary><strong>Windows: Installer vs. Portable</strong></summary>

|               | NSIS Installer | Portable `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Installation erforderlich | Ja  | Nein — von überall startbar  |
| Auto-Updates | ✅ in der App  | ❌ manueller Download  |
| Startgeschwindigkeit | ✅ schneller  | ⚠️ langsamer Kaltstart  |
| Eintrag im Startmenü |            ✅            |           ❌            |
| Einfache Deinstallation |            ✅            | ❌ einfach Datei löschen  |

**Empfehlung:** Nimm den NSIS Installer für Auto-Updates und schnelleren Start. Nimm die portable `.exe` für eine Option ohne Installation und ohne Registry-Einträge.

</details>

<details>
<summary><strong>Erststart unter macOS</strong></summary>

Arroxy ist noch nicht code-signiert, daher warnt macOS Gatekeeper beim ersten Start. Das ist erwartet — kein Zeichen für eine Beschädigung.

**Methode über Systemeinstellungen (empfohlen):**

1. Rechtsklick auf das Arroxy-App-Symbol und **Öffnen** wählen.
2. Der Warndialog erscheint — klicke auf **Abbrechen** (nicht auf *In den Papierkorb*)).
3. Öffne **Systemeinstellungen → Datenschutz & Sicherheit**.
4. Scroll runter zum Abschnitt **Sicherheit**. Dort steht _„Arroxy wurde blockiert, weil es nicht von einem identifizierten Entwickler stammt."_
5. Klicke auf **Trotzdem öffnen** und bestätige mit deinem Passwort oder Touch ID.

Nach Schritt 5 öffnet sich Arroxy normal und die Warnung erscheint nie wieder.

**Terminal-Methode (fortgeschritten):**

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

> macOS-Builds werden per CI auf Apple Silicon- und Intel-Runnern erstellt. Falls Probleme auftreten, bitte [ein Issue öffnen](../../issues) — Feedback von macOS-Nutzern beeinflusst aktiv den macOS-Testzyklus.

</details>

<details>
<summary><strong>Erststart unter Linux</strong></summary>

AppImages werden direkt ausgeführt — keine Installation nötig. Du musst die Datei nur als ausführbar markieren.

**Dateimanager:** Rechtsklick auf die `.AppImage` → **Eigenschaften** → **Berechtigungen** → **Datei als Programm ausführen erlauben** aktivieren, dann doppelklicken.

**Terminal:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

Falls der Start trotzdem fehlschlägt, fehlt möglicherweise FUSE:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Flatpak (sandboxed Alternative):** Lade `Arroxy-*.flatpak` von derselben Release-Seite herunter.

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

</details>

---

## <a id="privacy"></a>Datenschutz

Downloads werden direkt über [yt-dlp](https://github.com/yt-dlp/yt-dlp) von YouTube in den von dir gewählten Ordner geholt — nichts wird über einen Drittanbieter-Server geleitet. Verlauf, Download-Historie, URLs und Dateiinhalte bleiben auf deinem Gerät.

Arroxy sendet anonyme, aggregierte Telemetrie über [Aptabase](https://aptabase.com) — gerade genug, damit ein Indie-Projekt sehen kann, ob es überhaupt genutzt wird (Starts, OS, App-Version, Abstürze). Keine URLs, keine Video-Titel, keine Dateipfade, keine IPs, keine Kontodaten — Aptabase ist Open Source und by Design GDPR-freundlich. Du kannst das in den Einstellungen deaktivieren.

---

## <a id="faq"></a>Häufig gestellte Fragen

**Ist es wirklich kostenlos?**
Ja — MIT-Lizenz, keine Premium-Stufe, keine Funktionsbarrieren.

**Welche Videoqualitäten kann ich herunterladen?**
Alles, was YouTube anbietet: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus nur Audio. Hochbildraten-Streams mit 60 fps und 120 fps sowie HDR-Inhalte werden unverändert übernommen.

**Kann ich nur den Audio-Track als MP3 extrahieren?**
Ja. Wähle im Format-Menü *nur Audio* und entscheide dich für MP3, AAC oder Opus.

**Brauche ich ein YouTube-Konto oder Cookies?**
Nein. Arroxy verwendet nur die öffentlichen Tokens, die YouTube an jeden Browser ausliefert. Keine Cookies, kein Login, keine gespeicherten Anmeldedaten. Siehe [Keine Cookies, kein Login, keine Kontoverknüpfung](#no-cookies) für den Hintergrund.

**Funktioniert es weiter, wenn YouTube etwas ändert?**
Zwei Resilienzschichten: yt-dlp wird innerhalb von Stunden nach YouTube-Änderungen aktualisiert, und Arroxy verlässt sich nicht auf Cookies, die alle ~30 Minuten ablaufen. Das macht es deutlich stabiler als Tools, die auf exportierte Browser-Sessions angewiesen sind.

**In welchen Sprachen ist Arroxy verfügbar?**
Neun: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Erkennt automatisch deine Systemsprache; jederzeit über die Symbolleiste umschaltbar. Sprachdateien sind einfache TypeScript-Objekte in `src/shared/i18n/locales/` — [PRs willkommen](../../pulls).

**Muss ich etwas zusätzlich installieren?**
Nein. yt-dlp und ffmpeg werden beim ersten Start automatisch von ihren offiziellen GitHub-Releases heruntergeladen und lokal gecacht.

**Kann ich Playlists oder ganze Kanäle herunterladen?**
Aktuell nur einzelne Videos und Shorts. Playlist- und Kanal-Support sind auf der [Roadmap](#roadmap).

**macOS sagt „die App ist beschädigt" — was tun?**
Das ist macOS Gatekeeper, der eine unsignierte App blockiert — keine echte Beschädigung. Schau dir den Abschnitt [Erststart unter macOS](#download) für die Lösung an.

**Ist das Herunterladen von YouTube-Videos legal?**
Für den persönlichen, privaten Gebrauch ist es in den meisten Rechtsordnungen allgemein akzeptiert. Du bist selbst dafür verantwortlich, die [Nutzungsbedingungen](https://www.youtube.com/t/terms) von YouTube und die Urheberrechtsgesetze deines Landes einzuhalten.

---

## <a id="roadmap"></a>Roadmap

Was kommt — grob nach Priorität sortiert:

| Funktion    | Beschreibung    |
| ---------------- | ---------------- |
| **Playlist- & Kanal-Downloads** | Playlist- oder Kanal-URL einfügen; alle Videos mit Datums- oder Anzahl-Filtern in die Warteschlange |
| **Mehrere URLs auf einmal eingeben** | Mehrere URLs einfügen und alle auf einmal starten |
| **Format-Konvertierung** | Downloads in MP3, WAV, FLAC konvertieren — ohne extra Tool |
| **Eigene Dateinamen-Vorlagen** | Dateien nach Titel, Hochlader, Datum, Auflösung benennen — mit Live-Vorschau |
| **Geplante Downloads** | Warteschlange zu einer bestimmten Zeit starten (Nacht-Runs) |
| **Geschwindigkeitsbegrenzung** | Bandbreite deckeln, damit Downloads deine Verbindung nicht auslasten |
| **Clip-Trimming** | Nur ein Segment per Start-/Endzeit herunterladen |

Eine Funktion im Sinn? [Anfrage öffnen](../../issues) — Community-Input bestimmt die Priorität.

---

## <a id="tech"></a>Gebaut mit

<details>
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

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Keine nativen Build-Tools erforderlich — das Projekt hat keine nativen Node-Addons.

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

### Klonen & starten

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
```

### Distributables bauen

```bash
bun run build        # typecheck + compile
bun run dist         # für aktuelles OS paketieren
bun run dist:win     # Windows Portable exe cross-kompilieren
```

> yt-dlp und ffmpeg sind nicht gebündelt — sie werden beim ersten Start von den offiziellen GitHub-Releases geholt und im App-Datenordner gecacht.

</details>

---

## Nutzungsbedingungen

Arroxy ist ein Werkzeug ausschließlich für den persönlichen, privaten Gebrauch. Du bist allein dafür verantwortlich, dass deine Downloads den [YouTube-AGB](https://www.youtube.com/t/terms) und dem Urheberrecht deines Landes entsprechen. Verwende Arroxy nicht, um Inhalte herunterzuladen, zu vervielfältigen oder zu verbreiten, an denen du keine Rechte hast. Die Entwickler haften nicht für Missbrauch.

<div align="center">
  <sub>MIT-Lizenz · Mit Sorgfalt gemacht von <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
