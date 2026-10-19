<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy Maskottchen" width="180" />

# Arroxy — Kostenloser Open-Source YouTube (+ 2000 Seiten) Downloader mit eingebautem Browser für Windows, macOS & Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Sprache:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · **Deutsch** · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Release](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Webseite](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![License](https://img.shields.io/badge/license-MIT-green) ![Platforms](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Languages](https://img.shields.io/badge/i18n-31_languages-blue)

Lade Videos, Shorts, Musik, Kanäle, Podcasts oder Audiotracks von **YouTube und 2000+ unterstützten Seiten** herunter — bis zu 8K HDR mit 60 fps, als MP3 / AAC / Opus oder nur den Teil, den du brauchst. **Durchstöbere YouTube oder jede andere Seite direkt in Arroxy** im Explore-Tab und lade das Video, die Playlist oder den Kanal herunter, den du gerade ansiehst; melde dich dort an, um private, Mitglieder- und altersbeschränkte Videos zu laden, die dein Konto ansehen darf. Läuft lokal auf Windows, macOS und Linux. **Keine Werbung, kein Bloat, kein Upselling.**

[**↓ Neueste Version herunterladen**](#install) &nbsp;·&nbsp; [**Webseite**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows-Erststart](#windows-first-launch) · [macOS-Erststart](#macos-first-launch) · [Linux-Erststart](#linux-first-launch)

[![Discord-Community beitreten](https://img.shields.io/badge/Discord%2DCommunity%20beitreten-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Wenn Arroxy dir Zeit spart, hilft ein ⭐ anderen, es zu finden.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Dies ist eine KI-gestützte Übersetzung. Die [englische README](README.md) ist die maßgebliche Quelle. Fehler entdeckt? [PRs sind willkommen](../../pulls).

---

## Inhalt

- [✨ Funktionen](#features)
- [📥 Installieren und erster Start](#install)
  - [Windows-Erststart](#windows-first-launch)
  - [macOS-Erststart](#macos-first-launch)
  - [Warum du möglicherweise eine Warnung siehst](#why-warning)
  - [Linux-Erststart](#linux-first-launch)
  - [Download verifizieren (SHA256)](#verify)
- [⚖️ Warum Arroxy](#why)
- [🔒 Datenschutz](#privacy)
- [❓ Häufig gestellte Fragen](#faq)
- [🗺️ Roadmap](#roadmap)
- [💖 Arroxy unterstützen](#support)
- [🛠️ Gebaut mit](#tech)

---

## <a id="features"></a>✨ Funktionen

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Durchstöbere YouTube oder jede andere Seite direkt in Arroxy und lade die aktuelle Seite mit deinem aktiven Profil herunter</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Der erste Bildschirm von Explore</b><br/>Ein kurzer Blick auf Explore – und warum ein Zweitkonto die sicherere Anmeldung ist</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Downloads zeigt, was dich braucht</b><br/>Links werden im Hintergrund vorbereitet; ein fehlgeschlagener bietet seine Lösung an, eine lange Playlist wartet auf deine Wahl</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Nur einen Teil eines Videos laden</b><br/>Wähle Start und Ende oder ein Kapitel — Arroxy speichert nur diesen Abschnitt</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profil-Editor</b><br/>Ein Profil feinjustieren: Dateityp, Auflösung, Untertitel, Zielordner, Dateinamenvorlage und mehr</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Dunkel oder hell, Glas oder schlicht</b><br/>Vier Looks zur Wahl: Glasflächen über einem bewegten Himmel oder ruhige, einfarbige Flächen – jeweils dunkel und hell</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Globaler Download-Hotkey von Arroxy — Ctrl+Shift+D unter Windows und Linux, Cmd+Shift+D unter macOS, schickt den kopierten Link direkt in die Download-Warteschlange" width="760" /></picture><br/><sub><b>Globaler Download-Hotkey</b><br/>Link irgendwo kopieren, einmal drücken — er landet in der Warteschlange und der Download startet</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profile pro Playlist-Eintrag</b><br/>Jedem Video ein eigenes Profil geben – manche in 4K archivieren, den Rest als MP3 holen</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Quick-Download-Startseite</b><br/>URL einfügen und sofort mit deinem aktiven Profil herunterladen</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Wiederverwendbare Download-Profile</b><br/>Format, Qualität und Ausgabe als Voreinstellung speichern – pro Download wiederverwenden</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Mehrsprachige Audiospuren</b><br/>Genau die Audiosprache wählen, die ein Video mitbringt</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround-/Dolby-Audio</b><br/>5.1- und Dolby-Spuren erkannt und erhalten</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Massen-URL-Modus</b><br/>Liste einfügen, automatisch entdoppeln, alle auf einmal einreihen</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Paralleler Download-Verlauf</b><br/>Mehrere Downloads gleichzeitig mit Live-Fortschritt</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: das Web direkt in Arroxy durchstöbern</strong></summary>

- **Explore-Tab** — durchstöbere YouTube oder jede andere Seite direkt in Arroxy und lade herunter, was du findest, ohne Links zu kopieren. **Download · *dein Profil*** stellt das Video, die Playlist oder den Kanal, den du gerade ansiehst, in die Warteschlange; mit dem Pfeil daneben wechselst du das Profil, und der Zauberstab öffnet den Schritt-für-Schritt-Download für Formate, Untertitel und mehr
- **Per Rechtsklick herunterladen** — klicke in Explore mit der rechten Maustaste auf einen Video-, Playlist- oder Kanal-Link, um ihn mit deinem Profil herunterzuladen, unter **Download mit** ein anderes Profil zu wählen, den Schritt-für-Schritt-Download zu öffnen oder den Link zu kopieren. Du musst nicht erst jedes Video öffnen
- **Kompaktes Layout** — ein Klick in der Symbolleiste von Explore verschiebt die Tabs von Arroxy dorthin und gibt der Seite mehr Platz
- **Adressleiste** — tippe, um YouTube zu durchsuchen, oder gib eine beliebige Webadresse ein, um diese Seite zu öffnen
- **Downloads, die ein Konto brauchen** — melde dich einmal in Explore an, und Arroxy kann private und Mitglieder-Videos laden, die dein Konto ansehen darf, altersbeschränkte Videos, wenn das Konto altersverifiziert ist, sowie deine Listen „Später ansehen“ und „Gefällt mir“. Melde dich dort auch bei anderen Seiten an, und deren Downloads nutzen diese Anmeldung, wenn sie sie brauchen. Arroxy lädt weiterhin zuerst abgemeldet und nutzt deine Explore-Anmeldung nur, wenn ein Download auf eine Weise scheitert, die ein Konto beheben kann. Wenn YouTube verlangt zu bestätigen, dass du kein Bot bist, probiert Arroxy ebenfalls deine Explore-Anmeldung
- **Nutze ein Zweitkonto** — der erste Bildschirm von Explore erklärt, warum: Das Herunterladen mit einem Konto birgt ein gewisses Risiko, dass dieses Konto eingeschränkt wird. Melde dich in den Einstellungen von Explore ab, wann immer du deine Anmeldungen vergessen lassen willst
- **Werbeblocker** — standardmäßig aus. Ein Klick auf das Schild in der Explore-Symbolleiste blockiert Werbung und Tracker auf seinen Seiten, ohne Downloads zu beeinflussen. YouTube kann bei angemeldeten Konten gegen Werbeblocker vorgehen

</details>

<details>
<summary><strong>🎞️ Qualität & Formate</strong></summary>

- Bis zu **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Hohe Bildrate und HDR** unverändert erhalten — 60 fps, HDR10
- **Audio** — Audio-only als MP3, M4A/AAC, Opus oder WAV exportieren. In interaktiven Downloads die nativen Surround-/Dolby-Spuren der Quelle (AC-3, E-AC-3, 5.1, DRC) auswählen, sofern verfügbar, oder einen globalen Standard **Surround / Dolby bevorzugen** setzen
- **Profile mit Ziel** — *Bestes Bild* (AV1 · VP9) oder *Smart-TV* (MP4 · H.264), gespeichert als Auto, MP4, MKV oder WebM ohne Neukodierung. HDR ist *Auto* (nur wenn dein Bildschirm es anzeigen kann), *SDR* oder *HDR*
- **Jeder Codec in jeder Auflösung** — der Schritt-für-Schritt-Download listet AV1, VP9 und H.264 in jeder Auflösung nebeneinander auf, damit du den wählen kannst, den dein Fernseher oder dein Schnittprogramm abspielt
- **Erkenne, was ein Stream wirklich ist** — Auflösungen, die YouTube per KI hochskaliert hat, KI-synchronisierte Audiosprachen, Streams mit erhöhter Bitrate, 360°-Videos sowie beschädigte Kopien oder Kopien mit Wasserzeichen werden markiert. Profile überspringen KI-hochskalierte Streams, außer du erlaubst sie

</details>

<details>
<summary><strong>🛡️ Datenschutz & Kontrolle</strong></summary>

- 100 % lokale Verarbeitung — Downloads gehen direkt von YouTube auf deine Festplatte
- Kein Login, keine Cookies, kein verknüpftes Google-Konto
- Dateien direkt in den von dir gewählten Ordner gespeichert

</details>

<details>
<summary><strong>⚡ Workflow</strong></summary>

- **Globaler Download-Hotkey** — kopiere einen Link in einer beliebigen App und drücke `Ctrl+Shift+D` (`Cmd+Shift+D` unter macOS); Arroxy stellt ihn mit deinem aktiven Profil in die Warteschlange, ohne das Fenster zu öffnen, und eine Benachrichtigung bestätigt es. Standardmäßig aktiv, frei belegbar
- **Flexible Startmodi** — wähle einen geführten Einzel-Download, eine Playlist-/Kanal-Auswahl, Bulk-URL-Eingabe, Quick Download mit gespeicherten Standardwerten oder stöbere und lade direkt in Explore
- **Zentrale Download-Warteschlange** — jeder Einzel-, Playlist-, Bulk- oder Quick-Job landet an einem Ort für Fortschritt, Pausieren, Fortsetzen, Abbrechen, Wiederholen und Priorität
- **Zwischenablage-Überwachung** — kopiere einen Videolink, und er landet im URL-Feld, sobald du zu Arroxy zurückkehrst, mit **Rückgängig**, falls das nicht gewollt war. Ist Arroxy gerade beschäftigt, wartet der Link, bis du wieder im Tab „URL“ bist (in den Einstellungen abschaltbar)
- **URLs automatisch bereinigen** — entfernt Tracking-Parameter (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) und löst `youtube.com/redirect`-Links auf
- **Tray-Modus** — das Schließen des Fensters lässt Downloads im Hintergrund weiterlaufen
- **31 Sprachen** – erkennt automatisch das Systemgebietsschema und kann jederzeit umgeschaltet werden
- **Playlist-Sync** — scannt eine Playlist erneut gegen einen lokalen Ordner, um bereits heruntergeladene Videos zu überspringen; erzeugt eine `.m3u`-Playlistdatei, die nach jedem Video aktualisiert wird
- **Geschwindigkeits- und Pacing-Kontrollen** — begrenze die Download-Bandbreite, lege fest, wie viele Teile eines Videos gleichzeitig geladen werden, und füge Anfragepausen mit Presets hinzu (*Aus · Ausgewogen · Vorsichtig · Benutzerdefiniert*)
- **Dateinamenvorlagen** — benenne Downloads nach deinen Regeln mit `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` und `{playlist_index}`, global oder pro Download-Profil
- **Gleichzeitige Downloads und automatische Wiederholung** — wähle, wie viele Einträge der Warteschlange gleichzeitig laufen, und lass Arroxy einen Download nach einem Netzwerk- oder Serverproblem erneut versuchen, mit längerer Wartezeit vor jedem Versuch
- **Profile pro Playlist-Eintrag** — weisen Sie jedem Video in einer Playlist ein eigenes Download-Profil zu statt einer Einstellung für die ganze Liste, sodass ein Durchlauf manche in voller Qualität archivieren und den Rest als MP3 holen kann
- **Quick Download läuft im Hintergrund** — der Link erscheint sofort in Downloads und wird dort vorbereitet, ein Hinweis mit **Ansehen** bestätigt es, und das URL-Feld leert sich für den nächsten Link. Starte beliebig viele, während frühere noch vorbereitet werden
- **Downloads zeigt, was dich braucht** — wenn Arroxy einen Link nicht lesen kann, nennt seine Zeile den Grund und bietet die Lösung an: Erneut versuchen, Cookies einschalten oder in Explore anmelden. Bei ausgeschalteten Cookies versucht **Mit Explore anmelden** es für dich erneut, sobald du angemeldet bist. Eine Playlist, die länger als dein Ladelimit ist, wartet in ihrer Zeile darauf, dass du alles, die ersten Videos oder eine Prüfung wählst. Der Downloads-Tab zählt die Zeilen, die auf dich warten
- **Nur einen Teil eines Videos herunterladen** — wähle auf dem Format-Bildschirm Start und Ende oder ein Kapitel, und Arroxy speichert nur diesen Bereich, benannt mit dem Bereich nach der Video-ID. Schnitte landen am nächstgelegenen Keyframe; aktiviere stattdessen den exakten Schnitt, um neu zu kodieren
- **Fertige Downloads automatisch entfernen** — optional: Ein fertiger Download verschwindet 5 Sekunden später aus der Liste. Seine Dateien bleiben auf der Festplatte, und fehlgeschlagene Downloads bleiben gelistet
- **Größe und Fehlt in Downloads** — eine sortierbare Spalte **Größe** zeigt, wie viel Platz jeder Download belegt, und **Fehlt** markiert Dateien, die außerhalb von Arroxy verschoben oder gelöscht wurden
- **Aurora oder Minimal, dunkel oder hell** — Glasflächen über einem bewegten Himmel oder ruhige, einfarbige Flächen; wechsle in der Fußzeile. Computer ohne Grafikbeschleunigung bekommen automatisch Minimal
- **Mac-Menüleiste** — öffne unter macOS die Einstellungen (`Cmd+,`), lege das Download-Geschwindigkeitslimit fest, wechsle Stil und Farbschema und öffne Protokolle oder speichere eine Diagnosedatei direkt in der Menüleiste
- **Profil aus jedem Download heraus ändern** — passe einen Download an und aktualisiere dann das Profil, mit dem er begonnen hat (mit einer Vorschau der Änderungen), oder speichere die Einstellungen als neues Profil. Beim Wechsel des Profils fragt Arroxy, ob deine Änderungen erhalten bleiben sollen

</details>

<details>
<summary><strong>📝 Untertitel & Nachbearbeitung</strong></summary>

- **Untertitel** in SRT, VTT oder ASS — manuell oder automatisch generiert, in jeder verfügbaren Sprache
- Neben dem Video speichern, in `.mkv` einbetten oder in einem `Subtitles/`-Unterordner organisieren
- **Nur-Untertitel-Stapel** — eine Liste von URLs einfügen oder eine Playlist öffnen, Untertitel wählen und für jedes Video nur die Untertiteldateien erhalten
- **SponsorBlock** — Sponsoren, Intros, Outros, Eigenwerbung überspringen oder als Kapitel markieren
- **Eingebettete Metadaten** — Titel, Upload-Datum, Kanal, Beschreibung, Thumbnail und Kapitelmarkierungen in die Datei geschrieben

</details>

<details>
<summary><strong>🌐 YouTube + 2000 Seiten</strong></summary>

- **YouTube, vollständig** — Videos, Shorts, Kanäle, Playlists, YouTube Music und Podcasts werden als erstklassige Quellen behandelt
- **2000+ weitere Seiten** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable und viele mehr
- **Nur Audio und Untertitel** funktionieren auf jeder unterstützten Seite, nicht nur auf YouTube
- Ändert sich eine Seite, liefert yt-dlp wöchentlich Fixes und Arroxy aktualisiert das Binary beim Start automatisch

</details>

---

## <a id="install"></a>📥 Installieren und erster Start

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

AppImage:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

Builds gibt es nur für x86_64. Kein `curl`? Ersetze `curl -fsSL` durch `wget -qO-`.

| Plattform | Format |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Neuesten Release holen →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows-Erststart</strong></summary>

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

Lieber Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS-Erststart</strong></summary>

Arroxy ist noch nicht für macOS code-signiert, daher kann Gatekeeper nach der Installation aus dem DMG den erschreckenden Dialog *"Arroxy.app is damaged and can't be opened"* anzeigen. Diese Meldung bedeutet, dass macOS eine unsignierte App unter Quarantäne gestellt hat; sie bedeutet nicht, dass die App-Dateien wirklich beschädigt sind. Auf aktuellen macOS-Versionen ist Terminal der zuverlässige Weg:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Ziehe `Arroxy.app` aus dem eingehängten DMG nach `/Applications`.
2. Öffne Terminal und führe diese zwei Befehle aus:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Der erste Befehl entfernt das Quarantäne-Attribut von deiner installierten Arroxy-Kopie. Der zweite startet die App. `sudo` kann nach deinem Mac-Passwort fragen; Terminal zeigt beim Tippen keine Zeichen an.

**Apple Silicon vs Intel:** auf einem Mac der M-Serie (M1 / M2 / M3 / M4) lade das `arm64`-DMG herunter. Auf Intel-Macs lade das `x64`-DMG. Der falsche Build funktioniert auch über Rosetta, ist aber spürbar langsamer.

> macOS-Builds werden per CI auf Apple Silicon- und Intel-Runnern erstellt. Falls Probleme auftreten, bitte [ein Issue öffnen](../../issues) — Feedback von macOS-Nutzern beeinflusst aktiv den macOS-Testzyklus.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Warum du möglicherweise eine Warnung siehst</strong></summary>

Arroxy ist Open Source und MIT-lizenziert. Die Windows- und macOS-Builds sind **nicht code-signiert** — Apple Developer ID und Windows EV Code-Signing-Zertifikate kosten jeweils mehrere Hundert Dollar im Jahr, die ein Indie-Projekt aus eigener Tasche zahlt. Ohne diese Signaturen warnen Windows SmartScreen und macOS Gatekeeper beim ersten Start. Die Warnungen bedeuten *dein Betriebssystem erkennt den Herausgeber nicht* — sie bedeuten nicht, dass Arroxy Malware ist.

Drei Wege, Arroxy selbst zu überprüfen, in aufsteigender Genauigkeit:

- **Quellcode lesen.** Jede Zeile steht auf [GitHub](https://github.com/antonio-orionus/Arroxy) und du kannst [es aus dem Quellcode bauen](#tech).
- **SHA256 prüfen.** Vergleiche deine Datei mit der veröffentlichten [`SHA256SUMS`](../../releases/latest) — siehe [Download verifizieren](#verify) unten.
- **Drittanbieter-Scan.** Lade die Datei bei [VirusTotal](https://www.virustotal.com) hoch.

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux-Erststart</strong></summary>

AppImages werden direkt ausgeführt — keine Installation nötig. Du musst die Datei nur als ausführbar markieren.

**Dateimanager:** Rechtsklick auf die `.AppImage` → **Eigenschaften** → **Berechtigungen** → **Datei als Programm ausführen erlauben** aktivieren, dann doppelklicken.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Falls der Start trotzdem fehlschlägt, starte es ohne Mounten — dafür ist kein FUSE-Paket nötig:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Optionale Desktop-Integration:** installiere [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) einmalig, und jede AppImage, auf die du doppelklickst, wird automatisch in deinem Launcher-Menü registriert — keine manuelle `.desktop`-Datei nötig.

**Einfaches Tarball (kein FUSE, keine Installation):**

Der `.tar.gz`-Build ist dieselbe App ohne AppImage-Hülle — entpacke sie irgendwohin und starte sie. Kein Installer und kein FUSE-Paket nötig.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Die Linux-Downloads auf der Release-Seite gibt es nur für x86_64.** Auf ARM64-Geräten (Raspberry Pi, Asahi Linux) lässt sich das Flatpak zwar installieren, scheitert aber beim Start mit `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Download verifizieren (SHA256)</strong></summary>

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
<summary><strong>📦 Windows: Installer vs. Portable</strong></summary>

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

## <a id="why"></a>⚖️ Warum Arroxy

Ein direkter Vergleich mit den gängigsten Alternativen:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Integrierter Browser (stöbern, anmelden, herunterladen) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Private, Mitglieder- und altersbeschränkte Videos ohne Cookie-Export |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Kostenlos, keine Premium-Stufe |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open Source |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Nur lokale Verarbeitung |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Keine Nutzungsbeschränkungen |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Plattformübergreifende Desktop-App |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Untertitel + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = teilweise oder nur in einer kostenpflichtigen Stufe. Bei 4K Video Downloader ist die In-App-Anmeldung für private Videos eine kostenpflichtige Funktion; die meisten kostenlosen yt-dlp-GUIs akzeptieren nur eine Cookie-Datei oder lesen die Cookies deines Webbrowsers aus.

Arroxy ist für eine Sache gebaut: eine saubere lokale Datei, egal ob du eine URL einfügst oder das Video in Explore findest. Kein Upselling, keine Datensammlung.

### <a id="why-explore"></a>🧭 Was ein einfacher yt-dlp-Wrapper nicht kann: der Explore-Tab

Die meisten kostenlosen YouTube-Downloader sind ein URL-Feld über yt-dlp. Arroxy nutzt ebenfalls yt-dlp, hat aber zusätzlich **Explore**, einen in die App integrierten Browser, der YouTube oder jede andere Seite öffnet. Explore überwindet Hürden, an denen ein URL-Feld scheitert:

- **Videos, die ein Konto brauchen, ohne Cookie-Export** — private, Mitglieder- und altersbeschränkte Videos (mit einem altersverifizierten Konto) sowie deine Listen „Später ansehen“ und „Gefällt mir“ sowie Videos hinter einer Anmeldung auf anderen Seiten. Ein einfacher Wrapper braucht einen cookies.txt-Export oder muss die Cookies deines Webbrowsers auslesen, was Chrome unter Windows inzwischen blockiert. In Arroxy meldest du dich einmal in Explore an, den Rest erledigt die App
- **„Melde dich an, um zu bestätigen, dass du kein Bot bist“** — wenn YouTube das verlangt, startet Arroxy den Download mit deiner Explore-Anmeldung erneut, statt abzubrechen
- **Das Download-Token von YouTube** — der integrierte Browser von Arroxy holt das Token, das YouTube vor einem Download erwartet. Ohne es kann YouTube weniger Formate und eine geringere Qualität liefern als gewünscht
- **Kein Kopieren von Links** — finde in Explore ein Video, eine Playlist oder einen Kanal und starte den Download mit einem Klick, oder klicke mit der rechten Maustaste auf einen beliebigen Link auf der Seite
- **Werbeblocker auf Wunsch** — ein Klick auf das Schild blockiert Werbung und Tracker auf den Seiten von Explore

---

## <a id="privacy"></a>🔒 Datenschutz

Downloads werden direkt über [yt-dlp](https://github.com/yt-dlp/yt-dlp) von YouTube in den von dir gewählten Ordner geholt — nichts wird über einen Drittanbieter-Server geleitet. Verlauf, Download-Historie, URLs und Dateiinhalte bleiben auf deinem Gerät.

Keine Telemetrie — nur ein anonymes Lebenszeichen pro Tag: App-Version, OS, Sprache, Installationskanal und Land, damit wir aktive Nutzer zählen können. Keine IDs, URLs, Videotitel, Dateipfade oder Kontodaten. Du kannst es in den Einstellungen abschalten.

Explore hat eigene Anmeldungen, getrennt von deinem Browser, und Arroxy liest oder füllt ein Anmeldeformular nie aus – du tippst auf der eigenen Seite der Website. Downloads laufen abgemeldet; nur wenn einer auf eine Weise scheitert, die ein Konto beheben kann, liest Arroxy die Anmeldung frisch aus, hält sie für diesen Download in einer temporären Datei und löscht die Datei danach. Wenn du dich in den Einstellungen von Explore abmeldest, werden sie vergessen.

---

## <a id="faq"></a>❓ Häufig gestellte Fragen

<details>
<summary><strong>Ist es wirklich kostenlos?</strong></summary>

Ja — MIT-Lizenz, keine Premium-Stufe, keine Funktionsbarrieren.

</details>

<details>
<summary><strong>Wie unterscheidet sich Arroxy von anderen yt-dlp-GUIs?</strong></summary>

Die meisten kostenlosen yt-dlp-GUIs sind Wrapper, die nur einen Link annehmen. Arroxy bringt zusätzlich **Explore** mit, einen in die App integrierten Browser, der YouTube oder jede andere Seite öffnet: Du stöberst und lädst herunter, ohne Links zu kopieren, und meldest dich dort einmal an, um private, Mitglieder- und altersbeschränkte Videos sowie deine Listen „Später ansehen“ und „Gefällt mir“ herunterzuladen – ganz ohne Cookie-Export. Arroxy nutzt diese Anmeldung, wenn YouTube dich bittet zu bestätigen, dass du kein Bot bist, und der integrierte Browser holt das Download-Token von YouTube, damit Downloads nicht auf weniger Formate zurückfallen. Siehe [Warum Arroxy](#why).

</details>

<details>
<summary><strong>Welche Videoqualitäten kann ich herunterladen?</strong></summary>

Alles, was YouTube anbietet: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus nur Audio. Streams mit 60 fps und HDR werden unverändert übernommen, und im Schritt-für-Schritt-Download wählst du in jeder Auflösung zwischen AV1, VP9 und H.264.

</details>

<details>
<summary><strong>Kann ich nur den Audio-Track als MP3 extrahieren?</strong></summary>

Ja. Wähle im Formatmenü *nur Audio* und dann MP3, M4A/AAC, Opus oder WAV.

</details>

<details>
<summary><strong>Wie lade ich Videos herunter, für die ein YouTube-Konto nötig ist?</strong></summary>

Melde dich einmal im Explore-Tab an. Arroxy kann dann private und Mitglieder-Videos laden, die dein Konto ansehen darf, altersbeschränkte Videos, wenn das Konto altersverifiziert ist, sowie deine Listen „Später ansehen“ und „Gefällt mir“. Die Anmeldung wird nur genutzt, wenn ein Download auf eine Weise scheitert, die ein Konto beheben kann; alles andere lädt wie bisher. Das ist die Option **Explore-Anmeldung**, die in den Cookie-Einstellungen als Erste steht und als Empfohlen markiert ist, und Arroxy wählt sie beim ersten Öffnen von Explore für dich. Das yt-dlp-Wiki weist darauf hin, dass [angemeldete Automatisierung ein Google-Konto markieren kann](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), daher ist ein Zweitkonto die sicherere Wahl.

</details>

<details>
<summary><strong>Funktioniert es weiter, wenn YouTube etwas ändert?</strong></summary>

yt-dlp wird beim Start automatisch aktualisiert, und Arroxy liefert zügig Fixes, sobald YouTube etwas ändert. Wenn YouTube verlangt zu bestätigen, dass du kein Bot bist, probiert Arroxy außerdem deine Explore-Anmeldung, falls du dich dort angemeldet hast; Cookies aus einer Datei oder deinem Browser stehen in den Cookie-Einstellungen bereit.

</details>

<details>
<summary><strong>In welchen Sprachen ist Arroxy verfügbar?</strong></summary>

31 Sprachen sind sofort verfügbar: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy erkennt beim ersten Start automatisch die Sprache deines Betriebssystems, und du kannst jederzeit über die Sprachauswahl in der Symbolleiste wechseln. Runtime-Locale-JSON liegt in src/shared/i18n/locales/, die PO-Kataloge für Übersetzer liegen in i18n/locales/ — öffne einen PR auf GitHub, um beizutragen.

</details>

<details>
<summary><strong>Muss ich etwas zusätzlich installieren?</strong></summary>

Nein. yt-dlp, ffmpeg und ffprobe werden beim ersten Start automatisch heruntergeladen und auf deinem Rechner gecacht. Danach ist keine weitere Einrichtung nötig.

</details>

<details>
<summary><strong>Kann ich Playlists oder ganze Kanäle herunterladen?</strong></summary>

Ja — beides. Füge eine Playlist-URL oder Kanal-URL ein (z. B. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); wähle, wie viele Einträge gescannt werden sollen, und stelle dann die ganze Liste in die Warteschlange oder wähle einzelne Videos aus. Datumsfilter kommen bald.

</details>

<details>
<summary><strong>macOS sagt „die App ist beschädigt" — was tun?</strong></summary>

Das ist macOS Gatekeeper, der eine unsignierte App blockiert — kein echter Schaden. Siehe [macOS first launch](#macos-first-launch) für die Terminal-Befehle, die die Quarantäne entfernen und Arroxy starten.

</details>

<details>
<summary><strong>Ist das Herunterladen von YouTube-Videos legal?</strong></summary>

Für den persönlichen, privaten Gebrauch ist es in den meisten Rechtsordnungen allgemein akzeptiert. Du bist selbst dafür verantwortlich, die [Nutzungsbedingungen](https://www.youtube.com/t/terms) von YouTube und die Urheberrechtsgesetze deines Landes einzuhalten.

</details>

---

## <a id="roadmap"></a>🗺️ Roadmap

Weiter geplant — grob nach Priorität sortiert:

| Funktion    | Beschreibung    |
| ---------------- | ---------------- |
| **Playlist- & Kanal-Filter** | Datumsfilter beim Einlesen einer Playlist oder eines Kanals |
| **YouTube-Audiospur-Präferenzen** | App-weite bevorzugte Sprachspur festlegen, mit Überschreibungen pro Profil, wenn YouTube mehrere Audiospuren anbietet |
| **Stärkere Wiederaufnahme nach Fehlern** | Ein neuer Retry-Pfad für Downloads, die durch unzuverlässige oder problematische Internetverbindungen unterbrochen werden |
| **Vollwertiger Download-Manager-Drawer** | Den Queue-Drawer zu einem volleren Manager ausbauen, inklusive Zielordner-Wechsel für eingereihte Elemente |
| **Geplante Downloads** | Warteschlange zu einer bestimmten Zeit starten (Nacht-Runs) |
| **AUR-Paket** | Installation unter Arch Linux und Omarchy mit `yay -S arroxy-bin` |

Eine Funktion im Sinn? [Anfrage öffnen](../../issues) — Community-Input bestimmt die Priorität.

---

## <a id="support"></a>💖 Arroxy unterstützen

Arroxy ist kostenlos und MIT-lizenziert — keine Werbung, keine Telemetrie, keine Bezahlversion. Wenn es dir Zeit spart, kannst du die Entwicklung mit Bitcoin, Tron oder Ethereum unterstützen: Die Adressen stehen in [DONATE.md](DONATE.md), der einzigen offiziellen Quelle dafür. Arroxy schickt dir niemals eine Adresse per E-Mail oder Direktnachricht. Ein Stern für das Repo, Fehlerberichte und bessere Übersetzungen helfen genauso viel.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Gebaut mit

<details>
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
| Node.js | 24.21.0 | `mise install` oder `.node-version` |
| Bun     | 1.4.2  | `mise install` oder `package.json` `packageManager` |

Empfohlen: `mise` installieren und dann im Checkout `mise install` ausführen. Ohne mise Node.js aus `.node-version` und Bun aus `package.json` manuell aktivieren, bevor `bun run bootstrap` läuft.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools und Python können für native Rebuilds erforderlich sein.

### macOS

```bash
brew install mise
xcode-select --install
```

Führe nach dem Klonen `mise trust && mise install` im Checkout aus. Wenn deine Shell bereits `fnm`, `nvm` oder ein Homebrew-Bun nutzt, aktiviere mise in `~/.zshrc`, damit Arroxy Node.js 24.21.0 und Bun 1.4.2 verwendet:

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Build- und Electron-Runtime-Abhängigkeiten
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Klonen & starten

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # empfohlen; überspringen, wenn die gepinnten Tools manuell aktiv sind
bun run bootstrap
bun run doctor
bun run dev            # Electron-App gegen den Vite-Renderer
```

### Distributables bauen

```bash
bun run build        # typecheck + compile
bun run dist         # für aktuelles OS paketieren
bun run dist:win     # Windows-Ziele auf unterstütztem Host paketieren
```

> `bun run bootstrap` installiert Abhängigkeiten, baut Electron-App-Abhängigkeiten neu, prüft Electron, bereitet eingebettete ffmpeg/ffprobe für die Entwicklung vor und installiert Playwright Chromium. Release-Builds verwalten yt-dlp, ffmpeg und ffprobe zur Laufzeit im App-Datenordner; keines davon wird mit dem Installer ausgeliefert.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

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

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

</details>

---

## 📜 Nutzungsbedingungen

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
