<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy Maskottchen" width="180" />

# Arroxy — Kostenloser Open-Source YouTube (+ 2000 Seiten) Downloader für Windows, macOS & Linux

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Sprache:** [Afaan Oromoo](README.om.md) · **Deutsch** · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Release](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Webseite](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![License](https://img.shields.io/badge/license-MIT-green) ![Platforms](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Languages](https://img.shields.io/badge/i18n-21_languages-blue)

Lade Videos, Shorts, Musik, Kanäle, Podcasts oder Audiotracks von **YouTube und 2000+ unterstützten Seiten** herunter — bis zu 4K HDR mit 60 fps, oder als MP3 / AAC / Opus. Läuft lokal auf Windows, macOS und Linux. **Keine Werbung, kein Bloat, kein Upselling.**

[**↓ Neueste Version herunterladen**](#install) &nbsp;·&nbsp; [**Webseite**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#install) · [macOS](#install) · [Linux](#install)

<img src="build/demo.gif" alt="Arroxy Demo" width="720" />

Wenn Arroxy dir Zeit spart, hilft ein ⭐ anderen, es zu finden.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

> 🌐 Dies ist eine KI-gestützte Übersetzung. Die [englische README](README.md) ist die maßgebliche Quelle. Fehler entdeckt? [PRs sind willkommen](../../pulls).

---

## Inhalt

- [Download](#install)
- [Warum Arroxy](#why)
- [Funktionen](#features)
- [Datenschutz](#privacy)
- [Häufig gestellte Fragen](#faq)
- [Roadmap](#roadmap)
- [Gebaut mit](#tech)

---

## <a id="install"></a>Download

| Plattform | Format |
| ------------------- | ----------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Neuesten Release holen →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="why-warning"></a>Warum du möglicherweise eine Warnung siehst

Arroxy ist Open Source und MIT-lizenziert. Die Windows- und macOS-Builds sind **nicht code-signiert** — Apple Developer ID und Windows EV Code-Signing-Zertifikate kosten jeweils mehrere Hundert Dollar im Jahr, die ein Indie-Projekt aus eigener Tasche zahlt. Ohne diese Signaturen warnen Windows SmartScreen und macOS Gatekeeper beim ersten Start. Die Warnungen bedeuten *dein Betriebssystem erkennt den Herausgeber nicht* — sie bedeuten nicht, dass Arroxy Malware ist.

Drei Wege, Arroxy selbst zu überprüfen, in aufsteigender Genauigkeit:

- **Quellcode lesen.** Jede Zeile steht auf [GitHub](https://github.com/antonio-orionus/Arroxy) und du kannst [es aus dem Quellcode bauen](#tech).
- **SHA256 prüfen.** Vergleiche deine Datei mit der veröffentlichten [`SHA256SUMS`](../../releases/latest) — siehe [Download verifizieren](#verify) unten.
- **Drittanbieter-Scan.** Lade die Datei bei [VirusTotal](https://www.virustotal.com) hoch.

### <a id="windows-first-launch"></a>Windows-Erststart

Beim ersten Start kann **"Windows protected your PC"** oder **"Unknown publisher"** erscheinen. Das gilt sowohl für `Arroxy-win-x64-Setup.exe` als auch für `Arroxy-win-x64-Portable.exe`. Arroxy ist kostenlos und Open Source, und die Windows-Builds sind nicht mit einem kostenpflichtigen Zertifikat signiert, weshalb SmartScreen sie markiert. Das bedeutet **nicht** automatisch, dass Arroxy unsicher ist. So geht es weiter:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Klicke auf **More info**.
2. Klicke auf **Run anyway**.

#### Wenn Windows Defender die Datei markiert oder entfernt

Defender-Heuristiken markieren unsignierte NSIS-Installer und Electron-Portables manchmal als verdächtig. Wenn Defender `Arroxy-win-x64-Setup.exe` oder `Arroxy-win-x64-Portable.exe` in Quarantäne stellt, stelle sie aus **Windows Security → Virus & threat protection → Protection history** wieder her und füge die Arroxy-Executable als erlaubtes Element unter **Manage settings → Add or remove exclusions** hinzu. Wie bei SmartScreen ist der Auslöser die fehlende Herausgebersignatur, nicht erkannte Malware.

> Lade Arroxy nur von der offiziellen GitHub Releases-Seite herunter. Wenn du die Datei von einer anderen Website bekommen hast oder jemand sie dir geschickt hat, lösche sie und lade eine frische Kopie von der offiziellen Quelle herunter. Der Quellcode ist öffentlich, du kannst ihn also selbst prüfen oder Arroxy selbst kompilieren.

### <a id="macos-first-launch"></a>macOS-Erststart

Arroxy ist noch nicht code-signiert für macOS, daher blockiert Gatekeeper den ersten Start. Der genaue Weg, um es zu erlauben, hängt von deiner macOS-Version ab — Sequoia 15 hat die alte Rechtsklick → Öffnen-Umgehung verschärft.

#### macOS Sequoia 15 und neuer (aktuell)

Ab Sequoia 15 umgeht Rechtsklick → Öffnen Gatekeeper für viele unter Quarantäne stehende Apps nicht mehr. Nutze stattdessen die Systemeinstellungen:

1. Ziehe `Arroxy.app` aus dem eingehängten DMG nach `/Applications`.
2. Doppelklicke auf Arroxy. Der Blockierdialog erscheint — klicke auf **Done** (klicke nicht auf *Move to Trash*).
3. Öffne **System Settings → Privacy & Security** und scrolle zum Abschnitt **Security**. Du siehst *"Arroxy was blocked to protect your Mac"* (oder eine nahezu identische Meldung).
4. Klicke auf **Open Anyway**, bestätige mit deinem Passwort oder Touch ID, und starte Arroxy dann aus `/Applications` neu.

#### macOS Sonoma 14 und älter

1. Ziehe `Arroxy.app` aus dem eingehängten DMG nach `/Applications`.
2. Rechtsklick (oder Control-Klick) auf `Arroxy.app` in `/Applications` und wähle **Open**.
3. Der Warndialog hat nun einen **Open**-Button — klicke ihn und bestätige. Arroxy öffnet sich normal und die Warnung erscheint nie wieder.

#### "App is damaged" oder anhaltende Gatekeeper-Blockierung — Terminal-Fix

Wenn macOS sagt *"Arroxy is damaged and can't be opened"*, oder keiner der obigen Schritte die Blockierung aufhebt, ist das Quarantäne-Attribut auf dem DMG die Ursache (manche Browser und macOS's eigenes Translocation-Verhalten setzen es). Entferne es von der installierten App:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel:** auf einem Mac der M-Serie (M1 / M2 / M3 / M4) lade das `arm64`-DMG herunter. Auf Intel-Macs lade das `x64`-DMG. Der falsche Build funktioniert auch über Rosetta, ist aber spürbar langsamer.

> macOS-Builds werden per CI auf Apple Silicon- und Intel-Runnern erstellt. Falls Probleme auftreten, bitte [ein Issue öffnen](../../issues) — Feedback von macOS-Nutzern beeinflusst aktiv den macOS-Testzyklus.

### <a id="linux-first-launch"></a>Linux-Erststart

AppImages werden direkt ausgeführt — keine Installation nötig. Du musst die Datei nur als ausführbar markieren.

**Dateimanager:** Rechtsklick auf die `.AppImage` → **Eigenschaften** → **Berechtigungen** → **Datei als Programm ausführen erlauben** aktivieren, dann doppelklicken.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
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

**Optionale Desktop-Integration:** installiere [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) einmalig, und jede AppImage, auf die du doppelklickst, wird automatisch in deinem Launcher-Menü registriert — keine manuelle `.desktop`-Datei nötig.

**Flatpak (sandboxed Alternative):** Lade `Arroxy-*.flatpak` von derselben Release-Seite herunter.

```bash
flatpak install --user Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>Download verifizieren (SHA256)</strong></summary>

Jedes Release veröffentlicht eine `SHA256SUMS`-Datei zusammen mit den Binärdateien. Um zu prüfen, dass dein Download nicht beschädigt oder unterwegs manipuliert wurde, hashe deine Datei lokal und gleiche die Zeile in `SHA256SUMS` ab. Öffne die neueste Release-Seite → **Assets** → lade `SHA256SUMS` herunter.

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

Möchtest du einen Drittanbieter-Malware-Scan? Lade die Datei bei [VirusTotal](https://www.virustotal.com) hoch. Eine Handvoll generischer Heuristik-Flags von kleineren Engines ist bei unsignierten Electron-Apps normal; weit verbreitete Erkennungen durch große Engines wären ein echter Anlass zur Sorge.

</details>

<details>
<summary><strong>Per Paketmanager installieren</strong></summary>

Verwendest du bereits einen Paketmanager? Du kannst den manuellen Download-Weg überspringen.

| Kanal | Befehl                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-linux-x64.flatpak`                                                 |

</details>

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

## <a id="features"></a>Funktionen

### Qualität & Formate

- Bis zu **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Hohe Bildrate** unverändert erhalten — 60 fps, 120 fps, HDR
- **Nur Audio** als MP3, M4A/AAC, Opus oder WAV exportieren
- Schnell-Presets: *Beste Qualität* · *Ausgewogen* · *Kleine Datei*

### Datenschutz & Kontrolle

- 100 % lokale Verarbeitung — Downloads gehen direkt von YouTube auf deine Festplatte
- Kein Login, keine Cookies, kein verknüpftes Google-Konto
- Dateien direkt in den von dir gewählten Ordner gespeichert

### Workflow

- **Flexible Startmodi** — wähle einen geführten Einzel-Download, eine Playlist-/Kanal-Auswahl, Bulk-URL-Eingabe oder Quick Download mit gespeicherten Standardwerten
- **Zentrale Download-Warteschlange** — jeder Einzel-, Playlist-, Bulk- oder Quick-Job landet an einem Ort für Fortschritt, Pausieren, Fortsetzen, Abbrechen, Wiederholen und Priorität
- **Zwischenablage-Überwachung** — kopiere einen YouTube-Link und Arroxy füllt die URL automatisch aus, wenn du die App wieder fokussierst (in den erweiterten Einstellungen umschaltbar)
- **URLs automatisch bereinigen** — entfernt Tracking-Parameter (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) und löst `youtube.com/redirect`-Links auf
- **Tray-Modus** — das Schließen des Fensters lässt Downloads im Hintergrund weiterlaufen
- **21 Sprachen** — erkennt automatisch die Systemsprache, jederzeit umschaltbar
- **Playlist-Sync** — scannt eine Playlist erneut gegen einen lokalen Ordner, um bereits heruntergeladene Videos zu überspringen; erzeugt eine `.m3u`-Playlistdatei, die nach jedem Video aktualisiert wird
- **Geschwindigkeits- und Pacing-Kontrollen** — begrenze die Download-Bandbreite, füge Anfragepausen hinzu und passe Fragment-Threads mit Presets an (*Aus · Ausgewogen · Vorsichtig · Benutzerdefiniert*)

### Untertitel & Nachbearbeitung

- **Untertitel** in SRT, VTT oder ASS — manuell oder automatisch generiert, in jeder verfügbaren Sprache
- Neben dem Video speichern, in `.mkv` einbetten oder in einem `Subtitles/`-Unterordner organisieren
- **SponsorBlock** — Sponsoren, Intros, Outros, Eigenwerbung überspringen oder als Kapitel markieren
- **Eingebettete Metadaten** — Titel, Upload-Datum, Kanal, Beschreibung, Thumbnail und Kapitelmarkierungen in die Datei geschrieben

### YouTube + 2000 Seiten

- **YouTube, vollständig** — Videos, Shorts, Kanäle, Playlists, YouTube Music und Podcasts werden als erstklassige Quellen behandelt
- **2000+ weitere Seiten** via yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org und viele mehr
- **Nur Audio und Untertitel** funktionieren auf jeder unterstützten Seite, nicht nur auf YouTube
- Ändert sich eine Seite, liefert yt-dlp wöchentlich Fixes und Arroxy aktualisiert das Binary beim Start automatisch

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

## <a id="privacy"></a>Datenschutz

Downloads werden direkt über [yt-dlp](https://github.com/yt-dlp/yt-dlp) von YouTube in den von dir gewählten Ordner geholt — nichts wird über einen Drittanbieter-Server geleitet. Verlauf, Download-Historie, URLs und Dateiinhalte bleiben auf deinem Gerät.

Arroxy sendet anonyme, aggregierte Telemetrie über [OpenPanel](https://openpanel.dev) — gerade genug, um Starts, OS, App-Versionen und Abstürze zu verstehen. Keine URLs, Video-Titel, Dateipfade, Kontodaten, Fingerprinting oder personenbezogenen Daten. Die ID pro Installation ist zufällig und nicht mit deiner Identität verknüpft. Du kannst das in den Einstellungen deaktivieren.

---

## <a id="faq"></a>Häufig gestellte Fragen

**Ist es wirklich kostenlos?**
Ja — MIT-Lizenz, keine Premium-Stufe, keine Funktionsbarrieren.

**Welche Videoqualitäten kann ich herunterladen?**
Alles, was YouTube anbietet: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus nur Audio. Hochbildraten-Streams mit 60 fps und 120 fps sowie HDR-Inhalte werden unverändert übernommen.

**Kann ich nur den Audio-Track als MP3 extrahieren?**
Ja. Wähle im Formatmenü *nur Audio* und dann MP3, M4A/AAC, Opus oder WAV.

**Brauche ich ein YouTube-Konto oder Cookies?**
Standardmäßig nein — Arroxy funktioniert ohne YouTube-Konto, Login oder Cookie-Export. Optionale Cookie-Unterstützung steht in den erweiterten Einstellungen zur Verfügung (Cookies source: file or browser) für Inhalte, die eine Authentifizierung erfordern, etwa altersbeschränkte oder Mitglieder-only-Videos. Sie ist standardmäßig deaktiviert. Wenn du sie aktivierst, weist das yt-dlp-Wiki darauf hin, dass [Cookie-basierte Automatisierung ein Google-Konto markieren kann](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); ein Wegwerf-Konto ist in dem Fall die sicherere Wahl.

**Funktioniert es weiter, wenn YouTube etwas ändert?**
yt-dlp wird beim Start automatisch aktualisiert, und Arroxy liefert zügig Fixes, sobald YouTube etwas ändert. Falls du doch einmal auf ein Problem stößt, steht in den erweiterten Einstellungen optionale Cookie-Unterstützung als Fallback bereit.

**In welchen Sprachen ist Arroxy verfügbar?**
Einundzwanzig, direkt out of the box: English, Español (Spanisch), Deutsch, Français (Französisch), 日本語 (Japanisch), 中文 (Chinesisch), Русский (Russisch), Українська (Ukrainisch), हिन्दी (Hindi), Afaan Oromoo, Kiswahili, O'zbekcha (Usbekisch), Tiếng Việt (Vietnamesisch), አማርኛ (Amharisch), العربية (Arabisch), اردو (Urdu), پښتو (Paschto), বাংলা (Bengalisch), မြန်မာဘာသာ (Birmanisch), Ελληνικά (Griechisch) und Српски (Serbisch). Arroxy erkennt deine Betriebssystem-Sprache beim ersten Start und du kannst jederzeit über die Sprachauswahl in der Symbolleiste wechseln. Die Runtime-Locale-JSON-Dateien liegen in src/shared/i18n/locales/, und die PO-Kataloge für Übersetzer liegen in i18n/locales/ — öffne einen PR auf GitHub, um beizutragen.

**Muss ich etwas zusätzlich installieren?**
Nein. yt-dlp wird beim ersten Start automatisch heruntergeladen und auf deinem Rechner gecacht; ffmpeg und ffprobe werden mit der App geliefert. Danach ist keine weitere Einrichtung nötig.

**Kann ich Playlists oder ganze Kanäle herunterladen?**
Ja — beides. Füge eine Playlist-URL oder Kanal-URL ein (z. B. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); wähle, wie viele Einträge gescannt werden sollen, und stelle dann die ganze Liste in die Warteschlange oder wähle einzelne Videos aus. Datumsfilter kommen bald.

**macOS sagt „die App ist beschädigt" — was tun?**
Das ist macOS Gatekeeper, der eine unsignierte App blockiert — kein echter Schaden. Siehe ["App is damaged" — Terminal-Fix](#macos-first-launch) für den einzeiligen `xattr`-Befehl, der das behebt.

**Ist das Herunterladen von YouTube-Videos legal?**
Für den persönlichen, privaten Gebrauch ist es in den meisten Rechtsordnungen allgemein akzeptiert. Du bist selbst dafür verantwortlich, die [Nutzungsbedingungen](https://www.youtube.com/t/terms) von YouTube und die Urheberrechtsgesetze deines Landes einzuhalten.

---

## <a id="roadmap"></a>Roadmap

Weiter geplant — grob nach Priorität sortiert:

| Funktion    | Beschreibung    |
| ---------------- | ---------------- |
| **Playlist- & Kanal-Filter** | Datumsfilter beim Einlesen einer Playlist oder eines Kanals |
| **Eigene Dateinamen-Vorlagen** | Dateien nach Titel, Hochlader, Datum, Auflösung benennen — mit Live-Vorschau |
| **Geplante Downloads** | Warteschlange zu einer bestimmten Zeit starten (Nacht-Runs) |
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
- **yt-dlp** + **ffmpeg** — Download- und Mux-Engine (yt-dlp wird zur Laufzeit geholt; ffmpeg/ffprobe sind beim Build gebündelt)
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

> yt-dlp wird beim ersten Start von GitHub geholt und im App-Datenordner gecacht. ffmpeg und ffprobe sind in jedem Arroxy-Release enthalten.

</details>

---

## <a id="troubleshooting"></a>Troubleshooting

### App won't open / no window appears

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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## Nutzungsbedingungen

Arroxy ist ein Werkzeug ausschließlich für den persönlichen, privaten Gebrauch. Du bist allein dafür verantwortlich, dass deine Downloads den [YouTube-AGB](https://www.youtube.com/t/terms) und dem Urheberrecht deines Landes entsprechen. Verwende Arroxy nicht, um Inhalte herunterzuladen, zu vervielfältigen oder zu verbreiten, an denen du keine Rechte hast. Die Entwickler haften nicht für Missbrauch.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT-Lizenz · Mit Sorgfalt gemacht von <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
