<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascotte di Arroxy" width="180" />

# Arroxy — downloader gratuito e open source per YouTube (+ 2000 siti) con browser integrato su Windows, macOS e Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Leggi in:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · **Italiano** · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Versione](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Sito web](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Licenza](https://img.shields.io/badge/license-MIT-green) ![Piattaforme](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Lingue](https://img.shields.io/badge/i18n-31_languages-blue)

Scarica video, Shorts, musica, canali, podcast o tracce audio da **YouTube e oltre 2000 siti supportati** — fino a 8K HDR a 60 fps, in MP3 / AAC / Opus oppure solo la parte che ti serve. **Naviga su YouTube o su qualsiasi altro sito dentro Arroxy** nella scheda Explore e scarica il video, la playlist o il canale che stai guardando; accedi lì per scaricare i video privati, riservati ai membri e con limiti di età che il tuo account può vedere. Funziona localmente su Windows, macOS e Linux. **Niente pubblicità, niente software superfluo, niente upselling.**

[**↓ Installa l'ultima versione**](#install) &nbsp;·&nbsp; [**Sito web**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Primo avvio su Windows](#windows-first-launch) · [Primo avvio su macOS](#macos-first-launch) · [Primo avvio su Linux](#linux-first-launch)

[![Unisciti alla community Discord](https://img.shields.io/badge/Unisciti%20alla%20community%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Se Arroxy ti fa risparmiare tempo, una ⭐ aiuta altre persone a scoprirlo.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Questa traduzione è stata realizzata con assistenza IA. Il [README in inglese](README.md) è la fonte autorevole. Hai trovato un errore? [Apri una PR](../../pulls).

---

## Indice

- [✨ Funzionalità](#features)
- [📥 Installazione e primo avvio](#install)
  - [Primo avvio su Windows](#windows-first-launch)
  - [Primo avvio su macOS](#macos-first-launch)
  - [Perché potresti vedere un avviso](#why-warning)
  - [Primo avvio su Linux](#linux-first-launch)
  - [Verifica il download (SHA256)](#verify)
- [⚖️ Perché Arroxy](#why)
- [🔒 Privacy](#privacy)
- [❓ Domande frequenti](#faq)
- [🗺️ Roadmap](#roadmap)
- [💖 Sostieni Arroxy](#support)
- [🛠️ Tecnologie](#tech)

---

## <a id="features"></a>✨ Funzionalità

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Naviga su YouTube o su qualsiasi altro sito dentro Arroxy e scarica la pagina in cui ti trovi con il profilo attivo</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>La prima schermata di Explore</b><br/>Uno sguardo rapido a Explore e perché un account secondario è l'accesso più sicuro</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Download ti mostra cosa richiede il tuo intervento</b><br/>I link si preparano in background; uno fallito propone la soluzione, una playlist lunga attende la tua scelta</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Scarica solo una parte del video</b><br/>Scegli inizio e fine, oppure un capitolo — Arroxy salva solo quell’intervallo</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editor dei profili</b><br/>Regola un profilo: tipo di file, risoluzione, sottotitoli, destinazione, modello del nome file e altro</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Scuro o chiaro, vetro o tinta unita</b><br/>Quattro look tra cui scegliere: pannelli di vetro su un cielo in movimento o superfici piene e tranquille, ciascuno in scuro e chiaro</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Scorciatoia globale di download di Arroxy — Ctrl+Shift+D su Windows e Linux, Cmd+Shift+D su macOS, per inviare il link copiato direttamente alla coda" width="760" /></picture><br/><sub><b>Scorciatoia globale per i download</b><br/>Copia un link ovunque e premi una volta: entra nella coda e parte il download</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profili per singolo elemento della playlist</b><br/>Dai a ogni video il suo profilo: archivia alcuni in 4K e scarica gli altri in MP3</sub></td>
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

<details open>
<summary><strong>🧭 Explore: naviga sul web dentro Arroxy</strong></summary>

- **Scheda Explore** — naviga su YouTube o su qualsiasi altro sito dentro Arroxy e scarica ciò che trovi senza copiare i link. **Scarica · *il tuo profilo*** mette in coda il video, la playlist o il canale che stai guardando; la freccia accanto cambia profilo e la bacchetta apre il download passo passo per scegliere formati, sottotitoli e altro
- **Clic destro per scaricare** — fai clic destro su qualsiasi link di video, playlist o canale in Explore per scaricarlo con il tuo profilo, scegliere un altro profilo da **Scarica con**, aprire il download passo passo o copiare il link. Non serve aprire prima ogni video
- **Layout compatto** — un clic nella barra degli strumenti di Explore sposta le schede di Arroxy al suo interno e dà più spazio alla pagina
- **Barra degli indirizzi** — scrivi per cercare su YouTube oppure inserisci qualsiasi indirizzo web per aprire quel sito
- **Download che richiedono un account** — accedi una volta in Explore e Arroxy potrà scaricare i video privati e riservati ai membri che il tuo account può vedere, i video con limiti di età se l'età dell'account è verificata, e le tue liste Guarda più tardi e Piaciuti. Accedi lì anche agli altri siti: i loro download usano quell'accesso quando serve. Arroxy scarica sempre prima senza accesso e usa il tuo accesso a Explore solo quando un download fallisce in un modo che un account può risolvere. Quando YouTube chiede di confermare che non sei un bot, Arroxy prova anche il tuo accesso a Explore
- **Usa un account secondario** — la prima schermata di Explore ne spiega il motivo: scaricare con un account comporta un certo rischio che quell'account venga limitato. Esci da Explore dalle Impostazioni quando vuoi cancellare i tuoi accessi
- **Blocco annunci** — disattivato per impostazione predefinita. Un clic sullo scudo nella barra degli strumenti di Explore blocca annunci e tracker nelle sue pagine, senza influire sui download. YouTube può ostacolare i blocchi annunci per gli account con accesso effettuato

</details>

<details>
<summary><strong>🎞️ Qualità e formati</strong></summary>

- Fino a **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p e 360p
- **Frame rate elevato e HDR** mantenuti invariati — 60 fps, HDR10
- **Audio** — esporta solo l'audio in MP3, M4A/AAC, Opus o WAV. Nei download interattivi puoi scegliere, se disponibili, le tracce surround/Dolby native della sorgente (AC-3, E-AC-3, 5.1, DRC), oppure impostare **Preferisci surround / Dolby** come predefinito globale
- **Profili con un obiettivo** — *Migliore immagine* (AV1 · VP9) o *Smart TV* (MP4 · H.264), salvati come Automatico, MP4, MKV o WebM senza ricodifica. L'HDR è *Automatico* (solo quando il tuo schermo può mostrarlo), *SDR* o *HDR*
- **Ogni codec a ogni risoluzione** — il download passo passo elenca AV1, VP9 e H.264 affiancati per ciascuna risoluzione, così puoi scegliere quello che la tua TV o il tuo editor riproduce
- **Scopri cos'è davvero uno stream** — vengono segnalati le risoluzioni che YouTube ha ingrandito con IA, le lingue audio doppiate con IA, gli stream con bitrate migliorato, i video a 360° e le copie danneggiate o con filigrana. I profili saltano gli stream ingranditi con IA, a meno che tu non li consenta

</details>

<details>
<summary><strong>🛡️ Privacy e controllo</strong></summary>

- Elaborazione locale al 100% — i download passano direttamente da YouTube al tuo disco
- **Open source** — ogni riga è verificabile, licenza MIT
- I file vengono salvati direttamente nella cartella scelta

</details>

<details>
<summary><strong>⚡ Flusso di lavoro</strong></summary>

- **Scorciatoia globale per i download** — copia un link in qualsiasi app e premi `Ctrl+Shift+D` (`Cmd+Shift+D` su macOS); Arroxy lo mette in coda con il profilo attivo senza aprire la finestra e una notifica lo conferma. Attiva per impostazione predefinita e riconfigurabile
- **Modalità di avvio flessibili** — scegli un download singolo guidato, il selettore di playlist/canali, l'incolla massivo di URL, Download rapido con i valori predefiniti salvati oppure sfoglia e scarica da Explore
- **Coda di download centrale** — ogni attività singola, playlist, massiva o rapida confluisce nello stesso punto per controllare avanzamento, pausa, ripresa, annullamento, nuovo tentativo e priorità
- **Monitoraggio degli appunti** — copia un link video e il campo URL si compila quando torni su Arroxy, con **Annulla** se non volevi. Se Arroxy è occupato, il link aspetta che tu torni nella scheda URL (disattivabile nelle Impostazioni)
- **Pulizia automatica degli URL** — rimuove i parametri di tracciamento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ed estrae i link da `youtube.com/redirect`
- **Modalità area di notifica** — chiudendo la finestra i download continuano in background
- **31 lingue** — rileva automaticamente la lingua di sistema, modificabile in qualsiasi momento
- **Sincronizzazione playlist** — confronta di nuovo una playlist con una cartella locale per saltare i video già scaricati; genera un file playlist `.m3u` aggiornato dopo ogni download
- **Controlli di velocità e ritmo** — limita la banda, stabilisci quante parti di un video scaricare contemporaneamente e aggiungi ritardi alle richieste con i preset (*Disattivato · Bilanciato · Prudente · Personalizzato*)
- **Modelli per i nomi file** — assegna i nomi con `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` e `{playlist_index}`, globalmente o per profilo di download
- **Download simultanei e nuovi tentativi automatici** — scegli quanti download in coda eseguire insieme e lascia che Arroxy ritenti quelli interrotti da problemi di rete o del server, aumentando l'attesa a ogni tentativo
- **Profili per singolo elemento della playlist** — assegna a ogni video un profilo diverso invece di un'unica impostazione per l'intero elenco, così puoi archiviare alcuni video alla massima qualità e scaricare gli altri in MP3 in un solo passaggio
- **Il Download rapido funziona in background** — il link compare subito in Download e viene preparato lì, una nota con **Visualizza** lo conferma e il campo URL si svuota per il link successivo. Avviane quanti vuoi mentre i precedenti si preparano
- **Download ti mostra cosa richiede il tuo intervento** — se Arroxy non riesce a leggere un link, la sua riga ne spiega il motivo e propone la soluzione: Riprova, attivare i cookie o accedere in Explore. Con i cookie disattivati, **Accedi con Explore** riprova per te una volta effettuato l'accesso. Una playlist più lunga del tuo limite di caricamento attende sulla sua riga che tu scelga tutta, i primi video o una revisione. La scheda Download conta le righe che aspettano te
- **Scarica solo una parte di un video** — scegli un inizio e una fine, o un capitolo, nella schermata Formato e Arroxy salva solo quell'intervallo, nominato con l'intervallo dopo l'id del video. I tagli cadono sul keyframe più vicino; attiva il taglio preciso per ricodificare invece
- **Rimuovi automaticamente i download completati** — facoltativo: un download completato esce dall'elenco dopo 5 secondi. I suoi file restano sul disco e i download falliti restano nell'elenco
- **Dimensione e Mancante in Download** — una colonna **Dimensione** ordinabile mostra quanto spazio occupa ogni download, e **Mancante** segnala i file spostati o eliminati fuori da Arroxy
- **Aurora o Minimale, scuro o chiaro** — pannelli di vetro su un cielo in movimento, oppure superfici piene e sobrie; cambia dal piè di pagina. I computer senza accelerazione grafica ricevono automaticamente Minimale
- **Barra dei menu del Mac** — su macOS, apri le Impostazioni (`Cmd+,`), imposta il limite di velocità di download, cambia stile e tema, e apri i log o salva un file di diagnostica dalla barra dei menu
- **Modifica un profilo da qualsiasi download** — regola un download, poi aggiorna il profilo da cui è partito (con un'anteprima di cosa cambia) o salva le impostazioni come nuovo profilo. Quando cambi profilo, Arroxy ti chiede se mantenere le tue modifiche

</details>

<details>
<summary><strong>📝 Sottotitoli e post-elaborazione</strong></summary>

- **Sottotitoli** in SRT, VTT o ASS — manuali o generati automaticamente, in qualsiasi lingua disponibile
- Salvali accanto al video, incorporali in `.mkv` oppure organizzali nella sottocartella `Subtitles/`
- **Batch solo sottotitoli** — incolla un elenco di URL o apri una playlist, scegli Sottotitoli e ottieni solo i file dei sottotitoli di ogni video
- **SponsorBlock** — salta sponsor, introduzioni, finali e autopromozioni oppure contrassegnali come capitoli
- **Metadati incorporati** — titolo, data di caricamento, canale, descrizione, miniatura e indicatori dei capitoli scritti nel file

</details>

<details>
<summary><strong>🌐 YouTube + 2000 siti</strong></summary>

- **YouTube completo** — video, Shorts, canali, playlist, YouTube Music e podcast sono gestiti come sorgenti di prima classe
- **Oltre 2000 altri siti** tramite yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable e molti altri
- **Solo audio e sottotitoli** funzionano su ogni sito supportato, non soltanto su YouTube
- Se un sito cambia, yt-dlp distribuisce correzioni ogni settimana e Arroxy aggiorna automaticamente il binario all'avvio

</details>

---

## <a id="install"></a>📥 Installazione e primo avvio

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

Le build sono disponibili solo per x86_64. Non hai `curl`? Sostituisci `curl -fsSL` con `wget -qO-`.

| Piattaforma | Download diretto |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Tutti i file della versione →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Primo avvio su Windows</strong></summary>

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

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Primo avvio su macOS</strong></summary>

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

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Perché potresti vedere un avviso</strong></summary>

Arroxy è open source e distribuito con licenza MIT. Le build Windows e macOS **non sono firmate digitalmente**: i certificati Apple Developer ID ed EV per Windows costano ciascuno centinaia di euro all'anno, a carico di un progetto indipendente. Senza tali firme, Windows SmartScreen e macOS Gatekeeper mostrano un avviso al primo avvio. Gli avvisi indicano che *il sistema operativo non riconosce l'autore*, non che Arroxy sia malware.

Tre modi per verificare personalmente Arroxy, in ordine di rigore:

- **Leggi il sorgente.** Ogni riga si trova su [GitHub](https://github.com/antonio-orionus/Arroxy) e puoi [compilarlo dal sorgente](#tech).
- **Controlla SHA256.** Confronta il file con [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) pubblicato; consulta [Verifica il download](#verify) più avanti.
- **Esegui una scansione esterna.** Carica il file su [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Primo avvio su Linux</strong></summary>

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

**I download Linux nella pagina della versione sono disponibili solo per x86_64.** Sui sistemi ARM64 (Raspberry Pi, Asahi Linux) Flatpak si installa comunque, ma poi non parte e mostra `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verifica il download (SHA256)</strong></summary>

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
<summary><strong>📦 Windows: programma di installazione o portatile</strong></summary>

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

## <a id="why"></a>⚖️ Perché Arroxy

Confronto diretto con le alternative più comuni:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Browser integrato (naviga, accedi, scarica) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Video privati, riservati ai membri e con limiti di età senza esportare cookie |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratuito, senza piano premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Elaborazione solo locale |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Nessun limite di utilizzo |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| App desktop multipiattaforma |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Sottotitoli + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = in parte, o solo in un piano a pagamento. In 4K Video Downloader l'accesso dall'app per i video privati è una funzione a pagamento; la maggior parte delle GUI gratuite di yt-dlp accetta solo un file di cookie o legge i cookie del tuo browser web.

Arroxy è pensato per una sola cosa: un file locale pulito, sia che incolli un URL sia che trovi il video in Explore. Nessun upselling o raccolta di dati.

### <a id="why-explore"></a>🧭 Cosa non sa fare un semplice wrapper di yt-dlp: la scheda Explore

La maggior parte dei downloader gratuiti per YouTube è una casella per l'URL sopra yt-dlp. Anche Arroxy usa yt-dlp, ma ha in più **Explore**, un browser integrato nell'app che apre YouTube o qualsiasi altro sito. Explore supera limiti che una casella per l'URL non può superare:

- **Video che richiedono un account, senza esportare cookie** — video privati, riservati ai membri e con limiti di età (con un account con età verificata), oltre alle tue liste Guarda più tardi e Piaciuti e ai video protetti da un accesso su altri siti. Un semplice wrapper ha bisogno di un cookies.txt esportato o deve leggere i cookie del tuo browser web, cosa che Chrome su Windows ora blocca. In Arroxy accedi una volta in Explore e al resto pensa lui
- **"Accedi per confermare che non sei un bot"** — quando YouTube lo chiede, Arroxy riprova il download con il tuo accesso a Explore invece di fallire
- **Il token di download di YouTube** — il browser integrato di Arroxy ottiene il token che YouTube si aspetta prima di un download. Senza di esso, YouTube può fornire meno formati e una qualità inferiore a quella richiesta
- **Niente link da copiare** — trova un video, una playlist o un canale in Explore e scaricalo con un clic, oppure fai clic destro su qualsiasi link della pagina
- **Blocco annunci quando vuoi** — un clic sullo scudo e Explore blocca annunci e tracker nelle proprie pagine

---

## <a id="privacy"></a>🔒 Privacy

I download vengono trasferiti direttamente da YouTube alla cartella scelta tramite [yt-dlp](https://github.com/yt-dlp/yt-dlp), senza passare per server di terzi. Cronologia di visualizzazione e download, URL e contenuto dei file restano sul tuo dispositivo.

Nessuna telemetria: solo un segnale anonimo al giorno con versione dell'app, sistema operativo, lingua, canale di installazione e paese, per contare gli utenti attivi. Nessun ID, URL, titolo video, percorso di file o dato dell'account. Puoi disattivarlo nelle Impostazioni.

Explore mantiene un proprio accesso, separato dal tuo browser, e Arroxy non legge né compila mai il modulo di accesso: scrivi direttamente nella pagina di Google. I download avvengono senza accesso; solo quando uno fallisce in un modo che un account può risolvere, Arroxy rilegge l'accesso in quel momento, lo conserva in un file temporaneo per quel download e poi elimina il file. Uscire da Explore nelle Impostazioni lo cancella.

---

## <a id="faq"></a>❓ Domande frequenti

<details>
<summary><strong>È davvero gratuito?</strong></summary>

Sì: licenza MIT, nessun piano premium e nessuna funzione bloccata.

</details>

<details>
<summary><strong>In cosa Arroxy è diverso dalle altre GUI di yt-dlp?</strong></summary>

La maggior parte delle GUI gratuite di yt-dlp sono wrapper che accettano solo un link. Arroxy aggiunge **Explore**, un browser YouTube integrato nell'app: navighi e scarichi senza copiare link, e accedi lì una volta per scaricare video privati, riservati ai membri e con limiti di età e le tue liste Guarda più tardi e Piaciuti, senza esportare cookie. Arroxy usa quell'accesso quando YouTube ti chiede di confermare che non sei un bot, e il suo browser integrato ottiene il token di download di YouTube, così i download non ripiegano su meno formati. Vedi [Perché Arroxy](#why).

</details>

<details>
<summary><strong>Quali qualità video posso scaricare?</strong></summary>

Tutto ciò che YouTube offre: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p e solo audio. I flussi a 60 fps e HDR vengono mantenuti invariati, e il download passo passo ti permette di scegliere AV1, VP9 o H.264 a ogni risoluzione.

</details>

<details>
<summary><strong>Posso estrarre soltanto l'audio in MP3?</strong></summary>

Sì. Scegli *solo audio* nel menu del formato e seleziona MP3, M4A/AAC, Opus o WAV.

</details>

<details>
<summary><strong>Come scarico i video che richiedono un account YouTube?</strong></summary>

Accedi una volta nella scheda Explore. Arroxy potrà allora scaricare i video privati e riservati ai membri che il tuo account può vedere, i video con limiti di età se l'età dell'account è verificata, e le tue liste Guarda più tardi e Piaciuti. Usa l'accesso solo quando un download fallisce in un modo che un account può risolvere; tutto il resto si scarica come prima. È la scelta **Accesso a Explore**, elencata per prima e contrassegnata come Consigliata nelle impostazioni dei cookie, e Arroxy la seleziona per te la prima volta che apri Explore. Il wiki di yt-dlp avverte che [l'automazione con un account connesso può far segnalare un account Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), quindi un account secondario è la scelta più sicura.

</details>

<details>
<summary><strong>Continuerà a funzionare quando YouTube cambierà qualcosa?</strong></summary>

yt-dlp si aggiorna automaticamente all'avvio e Arroxy distribuisce rapidamente le correzioni quando YouTube cambia. Quando YouTube chiede di confermare che non sei un bot, Arroxy prova anche il tuo accesso a Explore, se l'hai effettuato, e i cookie da file o dal tuo browser sono disponibili nelle impostazioni dei cookie.

</details>

<details>
<summary><strong>In quali lingue è disponibile Arroxy?</strong></summary>

31 lingue pronte all'uso: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy rileva automaticamente la lingua del sistema operativo al primo avvio e puoi cambiarla in qualsiasi momento dal selettore nella barra degli strumenti. I file JSON delle lingue usati in fase di esecuzione si trovano in src/shared/i18n/locales/, mentre i cataloghi PO per i traduttori sono in i18n/locales/: apri una PR su GitHub per contribuire.

</details>

<details>
<summary><strong>Devo installare qualcos'altro?</strong></summary>

No. yt-dlp, ffmpeg e ffprobe vengono scaricati automaticamente al primo avvio e memorizzati nella cache del computer. In seguito non serve alcuna configurazione aggiuntiva.

</details>

<details>
<summary><strong>Posso scaricare playlist o interi canali?</strong></summary>

Sì, entrambi. Incolla l'URL di una playlist o di un canale (per esempio `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`), scegli quante voci esaminare, quindi metti in coda l'intero elenco o seleziona singoli video. I filtri per intervallo di date arriveranno presto.

</details>

<details>
<summary><strong>macOS dice che "l'app è danneggiata": cosa devo fare?</strong></summary>

È macOS Gatekeeper che blocca un'app non firmata, non un danno effettivo. Consulta [Primo avvio su macOS](#macos-first-launch) per i comandi del Terminale che rimuovono la quarantena e avviano Arroxy.

</details>

<details>
<summary><strong>Scaricare video da YouTube è legale?</strong></summary>

Per uso personale e privato è generalmente accettato nella maggior parte delle giurisdizioni. Sei responsabile del rispetto dei [Termini di servizio](https://www.youtube.com/t/terms) di YouTube e delle leggi locali sul diritto d'autore.

</details>

---

## <a id="roadmap"></a>🗺️ Roadmap

Funzionalità ancora previste, grosso modo in ordine di priorità:

| Funzionalità    | Descrizione    |
| ---------------- | ---------------- |
| **Filtri per playlist e canali** | Filtri per intervallo di date durante l'elenco di una playlist o di un canale |
| **Preferenze delle tracce audio di YouTube** | Imposta una preferenza globale per la lingua parlata, con eccezioni per profilo quando YouTube offre più tracce audio |
| **Ripristino più robusto dei tentativi** | Un nuovo percorso di ripetizione per i download interrotti da connessioni Internet instabili o problematiche |
| **Pannello completo di gestione download** | Trasforma il pannello della coda in un gestore più completo, inclusa la modifica delle cartelle di destinazione degli elementi in attesa |
| **Download pianificati** | Avvia una coda a un orario stabilito, per esempio durante la notte |
| **Pacchetto AUR** | Installazione su Arch Linux e Omarchy con `yay -S arroxy-bin` |

Hai in mente una funzionalità? [Apri una richiesta](../../issues): il contributo della community orienta le priorità.

---

## <a id="support"></a>💖 Sostieni Arroxy

Arroxy è gratuito e distribuito con licenza MIT: niente pubblicità, niente telemetria e nessun piano a pagamento. Se ti fa risparmiare tempo, puoi sostenere lo sviluppo con Bitcoin, Tron o Ethereum; gli indirizzi si trovano in [DONATE.md](DONATE.md), l'unica fonte ufficiale. Arroxy non invierà mai un indirizzo tramite e-mail o messaggio diretto. Mettere una stella al repository, segnalare errori e migliorare le traduzioni è altrettanto utile.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Tecnologie

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop multipiattaforma
- **React 19** + **TypeScript** — interfaccia utente
- **Tailwind CSS v4** — stile
- **Zustand** — gestione dello stato
- **yt-dlp** + **ffmpeg** — motore di download e mux (entrambi vengono scaricati in fase di esecuzione: yt-dlp viene tenuto aggiornato, ffmpeg/ffprobe vengono installati una sola volta e mantenuti tra gli aggiornamenti)
- **Vite** + **electron-vite** — strumenti di compilazione
- **Vitest** + **Playwright** — test unitari ed end-to-end

</details>

<details>
<summary><strong>Compilazione dal sorgente</strong></summary>

### Prerequisiti — tutte le piattaforme

| Strumento | Versione | Installazione |
| --------- | -------- | ------------- |
| Git       | qualsiasi | [git-scm.com](https://git-scm.com) |
| Node.js   | 24.21.0 | `mise install` o `.node-version` |
| Bun       | 1.4.2  | `mise install` o `package.json` `packageManager` |

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

Dopo la clonazione, esegui `mise trust && mise install` nel checkout. Se la shell usa già `fnm`, `nvm` o Bun tramite Homebrew, attiva mise in `~/.zshrc` affinché Arroxy usi Node.js 24.21.0 e Bun 1.4.2:

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

> `bun run bootstrap` installa le dipendenze, ricompila quelle dell'app Electron, verifica Electron, prepara ffmpeg/ffprobe integrati per lo sviluppo e installa Playwright Chromium. Le build di release gestiscono yt-dlp, ffmpeg e ffprobe in fase di esecuzione nella cartella dati dell'app; nessuno dei tre è incluso nell'installer.

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

## 📜 Condizioni d'uso

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
