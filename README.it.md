<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascotte di Arroxy" width="180" />

# Arroxy — downloader gratuito e open source per YouTube (+ 2000 siti) su Windows, macOS e Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Leggi in:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · **Italiano** · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Versione](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Sito web](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Licenza](https://img.shields.io/badge/license-MIT-green) ![Piattaforme](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Lingue](https://img.shields.io/badge/i18n-30_languages-blue)

Scarica video, Shorts, musica, canali, podcast o tracce audio da **YouTube e oltre 2000 siti supportati** — fino a 4K HDR a 60 fps oppure in MP3 / AAC / Opus. Funziona localmente su Windows, macOS e Linux. **Niente pubblicità, niente software superfluo, niente upselling.**

[**↓ Installa l'ultima versione**](#install) &nbsp;·&nbsp; [**Sito web**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Primo avvio su Windows](#windows-first-launch) · [Primo avvio su macOS](#macos-first-launch) · [Primo avvio su Linux](#linux-first-launch)

[![Unisciti alla community Discord](https://img.shields.io/badge/Unisciti%20alla%20community%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Demo di Arroxy" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

Se Arroxy ti fa risparmiare tempo, una ⭐ aiuta altre persone a scoprirlo.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-09-14._

> 🌐 Questa traduzione è stata realizzata con assistenza IA. Il [README in inglese](README.md) è la fonte autorevole. Hai trovato un errore? [Apri una PR](../../pulls).

---

## Indice

- [Installazione e primo avvio](#install)
  - [Primo avvio su Windows](#windows-first-launch)
  - [Primo avvio su macOS](#macos-first-launch)
  - [Perché potresti vedere un avviso](#why-warning)
  - [Primo avvio su Linux](#linux-first-launch)
  - [Verifica il download (SHA256)](#verify)
- [Perché Arroxy](#why)
- [Funzionalità](#features)
- [Privacy](#privacy)
- [Domande frequenti](#faq)
- [Roadmap](#roadmap)
- [Sostieni Arroxy](#support)
- [Tecnologie](#tech)

---

## <a id="install"></a>Installazione e primo avvio

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Lo script Linux verifica il download tramite il file `SHA256SUMS` pubblicato e aggiunge Arroxy al menu delle applicazioni. Le build sono disponibili solo per x86_64. Non hai `curl`? Sostituisci `curl -fsSL` con `wget -qO-`.

| Piattaforma | Download diretto |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Tutti i file della versione →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="windows-first-launch"></a>Primo avvio su Windows

Al primo avvio potresti vedere **"Windows ha protetto il PC"** o **"Autore sconosciuto"**. Vale sia per `Arroxy-win-x64-Setup.exe` sia per `Arroxy-win-x64-Portable.exe`. Arroxy è gratuito e open source, ma le build Windows non sono firmate con un certificato a pagamento: per questo SmartScreen le segnala. Ciò **non** significa automaticamente che Arroxy non sia sicuro. Per continuare:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="Finestra di SmartScreen "Windows ha protetto il PC" con il collegamento "Ulteriori informazioni" evidenziato" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="Finestra di SmartScreen dopo l'espansione delle informazioni, con il pulsante "Esegui comunque"" />
</div>

1. Fai clic su **Ulteriori informazioni**.
2. Fai clic su **Esegui comunque**.

#### Se Windows Defender segnala o rimuove il file

Le euristiche di Defender talvolta considerano sospetti i programmi di installazione NSIS e i pacchetti portatili Electron non firmati. Se Defender mette in quarantena `Arroxy-win-x64-Setup.exe` o `Arroxy-win-x64-Portable.exe`, ripristinalo da **Sicurezza di Windows → Protezione da virus e minacce → Cronologia della protezione**, quindi aggiungi l'eseguibile Arroxy agli elementi consentiti in **Gestisci impostazioni → Aggiungi o rimuovi esclusioni**. Come per SmartScreen, la causa è la firma dell'autore mancante, non il rilevamento di malware.

> Scarica Arroxy soltanto dalla pagina ufficiale delle versioni GitHub. Se il file proviene da un altro sito o ti è stato inviato da qualcuno, eliminalo e scaricane una copia nuova dalla fonte ufficiale. Il codice sorgente è pubblico: puoi esaminarlo o compilare Arroxy autonomamente.

Preferisci Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

### <a id="macos-first-launch"></a>Primo avvio su macOS

Le build macOS di Arroxy hanno una firma ad hoc ma non sono autenticate da Apple, quindi Gatekeeper blocca il primo avvio con *"Arroxy.app" non è stata aperta — Apple non può verificare che "Arroxy.app" sia priva di malware*. Significa che macOS non può verificare l'app con Apple, non che i file abbiano un problema. L'installazione con Homebrew evita completamente questa finestra. Se hai usato il DMG, basta un comando nel Terminale:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Trascina `Arroxy.app` dal DMG montato in `/Applications`.
2. Apri il Terminale ed esegui questi due comandi:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Il primo comando rimuove l'attributo di quarantena applicato da macOS al file scaricato; il secondo avvia l'app. Normalmente `sudo` non serve perché la copia in `/Applications` appartiene al tuo utente; aggiungilo solo in caso di errore di autorizzazione.

**Apple Silicon o Intel:** su un Mac serie M (M1 / M2 / M3 / M4), scarica il DMG `arm64`. Su un Mac Intel, scarica il DMG `x64`. La build errata funziona comunque tramite Rosetta, ma è sensibilmente più lenta.

> Le build macOS vengono prodotte in CI su runner Apple Silicon e Intel. In caso di problemi, [apri una segnalazione](../../issues): il riscontro degli utenti macOS orienta attivamente il ciclo di test.

### <a id="why-warning"></a>Perché potresti vedere un avviso

Arroxy è open source e distribuito con licenza MIT. Le build Windows e macOS **non sono firmate digitalmente**: i certificati Apple Developer ID ed EV per Windows costano ciascuno centinaia di euro all'anno, a carico di un progetto indipendente. Senza tali firme, Windows SmartScreen e macOS Gatekeeper mostrano un avviso al primo avvio. Gli avvisi indicano che *il sistema operativo non riconosce l'autore*, non che Arroxy sia malware.

Tre modi per verificare personalmente Arroxy, in ordine di rigore:

- **Leggi il sorgente.** Ogni riga si trova su [GitHub](https://github.com/antonio-orionus/Arroxy) e puoi [compilarlo dal sorgente](#tech).
- **Controlla SHA256.** Confronta il file con [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) pubblicato; consulta [Verifica il download](#verify) più avanti.
- **Esegui una scansione esterna.** Carica il file su [VirusTotal](https://www.virustotal.com).

### <a id="linux-first-launch"></a>Primo avvio su Linux

Le AppImage vengono eseguite direttamente, senza installazione. Devi soltanto contrassegnare il file come eseguibile.

**Gestore file:** fai clic destro sul file `.AppImage` → **Proprietà** → **Permessi** → abilita **Consentire l'esecuzione del file come programma**, quindi fai doppio clic.

**Terminale:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Se l'avvio non riesce ancora, eseguilo senza montarlo; non occorre alcun pacchetto FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Integrazione desktop facoltativa:** installa una volta [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher); ogni AppImage aperta con doppio clic verrà registrata automaticamente nel menu delle applicazioni, senza creare manualmente un file `.desktop`.

**Archivio tar semplice (senza FUSE né installazione):**

La build `.tar.gz` contiene la stessa app senza il wrapper AppImage: estraila ovunque ed eseguila. Non servono un programma di installazione né FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Flatpak (alternativa in sandbox):** scarica `Arroxy-linux-x64.flatpak` dalla stessa pagina della versione.

Ubuntu include Snap anziché Flatpak; installa quindi Flatpak e aggiungi prima Flathub, da cui il pacchetto scaricherà il proprio runtime:

```bash
# Ubuntu / Debian
sudo apt install -y flatpak

# Fedora
sudo dnf install -y flatpak

# Arch
sudo pacman -S flatpak
```

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user ./Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

**I download Linux nella pagina della versione sono disponibili solo per x86_64.** Sui sistemi ARM64 (Raspberry Pi, Asahi Linux) Flatpak si installa comunque, ma poi non parte e mostra `bwrap: execvp ldconfig: Exec format error`.

<details>
<summary><strong><a id="verify"></a>Verifica il download (SHA256)</strong></summary>

Ogni versione pubblica un file `SHA256SUMS` insieme ai binari. Per verificare che il download non sia stato danneggiato o alterato durante il trasferimento, calcola l'hash del file localmente e confrontalo con la riga corrispondente in `SHA256SUMS`. Apri la pagina dell'ultima versione → **Assets** → scarica `SHA256SUMS`.

**Windows (PowerShell o Prompt dei comandi):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminale):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminale):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Vuoi una scansione antimalware esterna? Carica il file su [VirusTotal](https://www.virustotal.com). Qualche segnalazione euristica generica da motori minori è normale per le app Electron non firmate; numerose segnalazioni da motori importanti sarebbero invece un vero motivo di preoccupazione.

</details>

<details>
<summary><strong>Windows: programma di installazione o portatile</strong></summary>

|               | Programma di installazione NSIS | `.exe` portatile |
| ------------- | :----------------------: | :---------------------: |
| Installazione necessaria | Sì  | No — eseguilo da qualsiasi posizione  |
| Aggiornamenti automatici | ✅ nell'app  | ❌ download manuale  |
| Velocità di avvio | ✅ più veloce  | ⚠️ primo avvio più lento  |
| Aggiunta al menu Start |            ✅            |           ❌            |
| Disinstallazione semplice |            ✅            | ❌ elimina il file  |

**Consiglio:** usa il programma di installazione NSIS per gli aggiornamenti automatici e un avvio più rapido. Usa il `.exe` portatile se non vuoi installazione né modifiche al registro.

</details>

---

## <a id="why"></a>Perché Arroxy

Confronto diretto con le alternative più comuni:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Gratuito, senza piano premium |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Elaborazione solo locale |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Nessun accesso o esportazione dei cookie |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Nessun limite di utilizzo |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| App desktop multipiattaforma |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Sottotitoli + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy è pensato per una sola cosa: incolla un URL e ottieni un file locale pulito. Nessun account, upselling o raccolta di dati.

---

## <a id="features"></a>Funzionalità

### Qualità e formati

- Fino a **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p e 360p
- **Frame rate elevato** mantenuto invariato — 60 fps, 120 fps, HDR
- **Audio** — esporta solo l'audio in MP3, M4A/AAC, Opus o WAV. Nei download interattivi puoi scegliere, se disponibili, le tracce surround/Dolby native della sorgente (AC-3, E-AC-3, 5.1, DRC), oppure impostare **Preferisci surround / Dolby** come predefinito globale
- Preset rapidi: *Qualità migliore* · *Bilanciato* · *File piccolo*

### Privacy e controllo

- Elaborazione locale al 100% — i download passano direttamente da YouTube al tuo disco
- **Open source** — ogni riga è verificabile, licenza MIT
- I file vengono salvati direttamente nella cartella scelta

### Flusso di lavoro

- **Scorciatoia globale per i download** — copia un link in qualsiasi app e premi `Ctrl+Shift+D` (`Cmd+Shift+D` su macOS); Arroxy lo mette in coda con il profilo attivo senza aprire la finestra e una notifica lo conferma. Attiva per impostazione predefinita e riconfigurabile
- **Modalità di avvio flessibili** — scegli un download singolo guidato, il selettore di playlist/canali, l'incolla massivo di URL o Download rapido con i valori predefiniti salvati
- **Coda di download centrale** — ogni attività singola, playlist, massiva o rapida confluisce nello stesso punto per controllare avanzamento, pausa, ripresa, annullamento, nuovo tentativo e priorità
- **Monitoraggio degli appunti** — copia un link YouTube e Arroxy compila automaticamente l'URL quando torni nell'app (opzione nelle impostazioni avanzate)
- **Pulizia automatica degli URL** — rimuove i parametri di tracciamento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ed estrae i link da `youtube.com/redirect`
- **Modalità area di notifica** — chiudendo la finestra i download continuano in background
- **30 lingue** — rileva automaticamente la lingua di sistema, modificabile in qualsiasi momento
- **Sincronizzazione playlist** — confronta di nuovo una playlist con una cartella locale per saltare i video già scaricati; genera un file playlist `.m3u` aggiornato dopo ogni download
- **Controlli di velocità e ritmo** — limita la banda, stabilisci quante parti di un video scaricare contemporaneamente e aggiungi ritardi alle richieste con i preset (*Disattivato · Bilanciato · Prudente · Personalizzato*)
- **Modelli per i nomi file** — assegna i nomi con `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` e `{playlist_index}`, globalmente o per profilo di download
- **Download simultanei e nuovi tentativi automatici** — scegli quanti download in coda eseguire insieme e lascia che Arroxy ritenti quelli interrotti da problemi di rete o del server, aumentando l'attesa a ogni tentativo
- **Profili per singolo elemento della playlist** — assegna a ogni video un profilo diverso invece di un'unica impostazione per l'intero elenco, così puoi archiviare alcuni video alla massima qualità e scaricare gli altri in MP3 in un solo passaggio

### Sottotitoli e post-elaborazione

- **Sottotitoli** in SRT, VTT o ASS — manuali o generati automaticamente, in qualsiasi lingua disponibile
- Salvali accanto al video, incorporali in `.mkv` oppure organizzali nella sottocartella `Subtitles/`
- **SponsorBlock** — salta sponsor, introduzioni, finali e autopromozioni oppure contrassegnali come capitoli
- **Metadati incorporati** — titolo, data di caricamento, canale, descrizione, miniatura e indicatori dei capitoli scritti nel file

### YouTube + 2000 siti

- **YouTube completo** — video, Shorts, canali, playlist, YouTube Music e podcast sono gestiti come sorgenti di prima classe
- **Oltre 2000 altri siti** tramite yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org e molti altri
- **Solo audio e sottotitoli** funzionano su ogni sito supportato, non soltanto su YouTube
- Se un sito cambia, yt-dlp distribuisce correzioni ogni settimana e Arroxy aggiorna automaticamente il binario all'avvio

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Scorciatoia globale di download di Arroxy — Ctrl+Shift+D su Windows e Linux, Cmd+Shift+D su macOS, per inviare il link copiato direttamente alla coda" width="760" /></picture><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Scorciatoia globale per i download</b><br/>Copia un link ovunque e premi una volta: entra nella coda e parte il download</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profili per singolo elemento della playlist</b><br/>Dai a ogni video il suo profilo: archivia alcuni in 4K e scarica gli altri in MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Home di Download rapido</b><br/>Incolla un URL e scaricalo subito con il profilo attivo</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Profili di download riutilizzabili</b><br/>Salva preset di formato, qualità e destinazione e riutilizzali per ogni download</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Tracce audio multilingue</b><br/>Scegli la lingua audio esatta fornita dal video</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Audio surround / Dolby</b><br/>Le tracce 5.1 e Dolby vengono rilevate e conservate</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Modalità URL massivi</b><br/>Incolla un elenco, rimuovi automaticamente i duplicati e metti tutto in coda</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Coda di download paralleli</b><br/>Più download contemporanei con avanzamento in tempo reale</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>Privacy

I download vengono trasferiti direttamente da YouTube alla cartella scelta tramite [yt-dlp](https://github.com/yt-dlp/yt-dlp), senza passare per server di terzi. Cronologia di visualizzazione e download, URL e contenuto dei file restano sul tuo dispositivo.

Arroxy invia telemetria anonima e aggregata tramite [OpenPanel](https://openpanel.dev), quanto basta a un progetto indipendente per comprendere errori, arresti anomali, feedback, sistema operativo e versioni dell'app. Non invia URL, titoli dei video, percorsi dei file, dati degli account, impronte digitali o informazioni personali. L'ID di installazione è casuale e non è collegato alla tua identità. Puoi disattivarlo nelle Impostazioni.

---

## <a id="faq"></a>Domande frequenti

**È davvero gratuito?**
Sì: licenza MIT, nessun piano premium e nessuna funzione bloccata.

**Quali qualità video posso scaricare?**
Tutto ciò che YouTube offre: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p e solo audio. I flussi a 60 fps, 120 fps e HDR vengono mantenuti invariati.

**Posso estrarre soltanto l'audio in MP3?**
Sì. Scegli *solo audio* nel menu del formato e seleziona MP3, M4A/AAC, Opus o WAV.

**Servono un account YouTube o i cookie?**
Per impostazione predefinita no: Arroxy funziona senza account YouTube, accesso o esportazione dei cookie. Il supporto facoltativo dei cookie è disponibile nelle impostazioni avanzate (origine dei cookie: file o browser) per contenuti che richiedono autenticazione, come video con limiti di età o riservati agli abbonati. È disattivato per impostazione predefinita. Se lo abiliti, il wiki di yt-dlp avverte che [l'automazione basata sui cookie può far segnalare un account Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); in tal caso è più sicuro usare un account secondario.

**Continuerà a funzionare quando YouTube cambierà qualcosa?**
yt-dlp si aggiorna automaticamente all'avvio e Arroxy distribuisce rapidamente le correzioni quando YouTube cambia. Se riscontri comunque un problema, nelle impostazioni avanzate è disponibile come ripiego il supporto facoltativo dei cookie.

**In quali lingue è disponibile Arroxy?**
30 lingue pronte all'uso: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy rileva automaticamente la lingua del sistema operativo al primo avvio e puoi cambiarla in qualsiasi momento dal selettore nella barra degli strumenti. I file JSON delle lingue usati in fase di esecuzione si trovano in src/shared/i18n/locales/, mentre i cataloghi PO per i traduttori sono in i18n/locales/: apri una PR su GitHub per contribuire.

**Devo installare qualcos'altro?**
No. yt-dlp viene scaricato automaticamente al primo avvio e memorizzato nella cache del computer; ffmpeg e ffprobe sono inclusi nell'app. In seguito non serve alcuna configurazione aggiuntiva.

**Posso scaricare playlist o interi canali?**
Sì, entrambi. Incolla l'URL di una playlist o di un canale (per esempio `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`), scegli quante voci esaminare, quindi metti in coda l'intero elenco o seleziona singoli video. I filtri per intervallo di date arriveranno presto.

**macOS dice che "l'app è danneggiata": cosa devo fare?**
È macOS Gatekeeper che blocca un'app non firmata, non un danno effettivo. Consulta [Primo avvio su macOS](#macos-first-launch) per i comandi del Terminale che rimuovono la quarantena e avviano Arroxy.

**Scaricare video da YouTube è legale?**
Per uso personale e privato è generalmente accettato nella maggior parte delle giurisdizioni. Sei responsabile del rispetto dei [Termini di servizio](https://www.youtube.com/t/terms) di YouTube e delle leggi locali sul diritto d'autore.

---

## <a id="roadmap"></a>Roadmap

Funzionalità ancora previste, grosso modo in ordine di priorità:

| Funzionalità    | Descrizione    |
| ---------------- | ---------------- |
| **Filtri per playlist e canali** | Filtri per intervallo di date durante l'elenco di una playlist o di un canale |
| **Preferenze delle tracce audio di YouTube** | Imposta una preferenza globale per la lingua parlata, con eccezioni per profilo quando YouTube offre più tracce audio |
| **Accesso dal browser interno** | Apri finestre del browser in Arroxy per accedere e utilizzare i cookie dei siti senza esportarli manualmente |
| **Download video con un clic** | Avvia con un clic il download di un URL rilevato o incollato usando il profilo attivo |
| **Ripristino più robusto dei tentativi** | Un nuovo percorso di ripetizione per i download interrotti da connessioni Internet instabili o problematiche |
| **Pannello completo di gestione download** | Trasforma il pannello della coda in un gestore più completo, inclusa la modifica delle cartelle di destinazione degli elementi in attesa |
| **Download pianificati** | Avvia una coda a un orario stabilito, per esempio durante la notte |
| **Ritaglio dei clip** | Scarica solo un segmento indicando il tempo iniziale e finale |

Hai in mente una funzionalità? [Apri una richiesta](../../issues): il contributo della community orienta le priorità.

---

## <a id="support"></a>Sostieni Arroxy

Arroxy è gratuito e distribuito con licenza MIT: niente pubblicità e nessun piano a pagamento. Se ti fa risparmiare tempo, puoi sostenere lo sviluppo con Bitcoin o Tron; gli indirizzi si trovano in [DONATE.md](DONATE.md), l'unica fonte ufficiale. Arroxy non invierà mai un indirizzo tramite e-mail o messaggio diretto. Mettere una stella al repository, segnalare errori e migliorare le traduzioni è altrettanto utile.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a>

---

## <a id="tech"></a>Tecnologie

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop multipiattaforma
- **React 19** + **TypeScript** — interfaccia utente
- **Tailwind CSS v4** — stile
- **Zustand** — gestione dello stato
- **yt-dlp** + **ffmpeg** — motore di download e mux (yt-dlp viene scaricato in fase di esecuzione; ffmpeg/ffprobe sono inclusi durante la compilazione)
- **Vite** + **electron-vite** — strumenti di compilazione
- **Vitest** + **Playwright** — test unitari ed end-to-end

</details>

<details>
<summary><strong>Compilazione dal sorgente</strong></summary>

### Prerequisiti — tutte le piattaforme

| Strumento | Versione | Installazione |
| --------- | -------- | ------------- |
| Git       | qualsiasi | [git-scm.com](https://git-scm.com) |
| Node.js   | 24.16.0 | `mise install` o `.node-version` |
| Bun       | 1.2.23  | `mise install` o `package.json` `packageManager` |

Consigliato: installa `mise`, quindi esegui `mise install` nel checkout. Senza mise, attiva manualmente Node.js da `.node-version` e Bun da `package.json` prima di `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools e Python potrebbero essere necessari per ricompilare le dipendenze native.

### macOS

```bash
brew install mise
xcode-select --install
```

Dopo la clonazione, esegui `mise trust && mise install` nel checkout. Se la shell usa già `fnm`, `nvm` o Bun tramite Homebrew, attiva mise in `~/.zshrc` affinché Arroxy usi Node.js 24.16.0 e Bun 1.2.23:

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

# Dipendenze di compilazione e runtime di Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Solo test E2E (Electron richiede un display)
sudo apt install -y xvfb
```

### Clona ed esegui

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # consigliato; salta se hai attivato manualmente le versioni fissate
bun run bootstrap
bun run doctor
bun run dev            # app Electron con renderer Vite
```

### Crea un pacchetto distribuibile

```bash
bun run build        # controllo dei tipi + compilazione
bun run dist         # pacchetto per il sistema operativo corrente
bun run dist:win     # pacchetti Windows se eseguito su un host supportato
```

> `bun run bootstrap` installa le dipendenze, ricompila quelle dell'app Electron, verifica Electron, prepara ffmpeg/ffprobe integrati per lo sviluppo e installa Playwright Chromium. yt-dlp viene gestito in fase di esecuzione nella cartella dati dell'app; ffmpeg e ffprobe sono inclusi in ogni versione di Arroxy.

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

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

---

## Condizioni d'uso

Arroxy è uno strumento destinato esclusivamente all'uso personale e privato. Sei l'unico responsabile di verificare che i download rispettino i [Termini di servizio](https://www.youtube.com/t/terms) di YouTube e le leggi sul diritto d'autore della tua giurisdizione. Non usare Arroxy per scaricare, riprodurre o distribuire contenuti che non hai il diritto di utilizzare. Gli sviluppatori non rispondono di eventuali usi impropri.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Licenza MIT · Realizzato con cura da <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
