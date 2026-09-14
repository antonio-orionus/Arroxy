const TECH_CONTENT = `<details>
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
| Node.js   | 24.16.0 | \`mise install\` o \`.node-version\` |
| Bun       | 1.2.23  | \`mise install\` o \`package.json\` \`packageManager\` |

Consigliato: installa \`mise\`, quindi esegui \`mise install\` nel checkout. Senza mise, attiva manualmente Node.js da \`.node-version\` e Bun da \`package.json\` prima di \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools e Python potrebbero essere necessari per ricompilare le dipendenze native.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Dopo la clonazione, esegui \`mise trust && mise install\` nel checkout. Se la shell usa già \`fnm\`, \`nvm\` o Bun tramite Homebrew, attiva mise in \`~/.zshrc\` affinché Arroxy usi Node.js 24.16.0 e Bun 1.2.23:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Dipendenze di compilazione e runtime di Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Solo test E2E (Electron richiede un display)
sudo apt install -y xvfb
\`\`\`

### Clona ed esegui

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # consigliato; salta se hai attivato manualmente le versioni fissate
bun run bootstrap
bun run doctor
bun run dev            # app Electron con renderer Vite
\`\`\`

### Crea un pacchetto distribuibile

\`\`\`bash
bun run build        # controllo dei tipi + compilazione
bun run dist         # pacchetto per il sistema operativo corrente
bun run dist:win     # pacchetti Windows se eseguito su un host supportato
\`\`\`

> \`bun run bootstrap\` installa le dipendenze, ricompila quelle dell'app Electron, verifica Electron, prepara ffmpeg/ffprobe integrati per lo sviluppo e installa Playwright Chromium. yt-dlp viene gestito in fase di esecuzione nella cartella dati dell'app; ffmpeg e ffprobe sono inclusi in ogni versione di Arroxy.

</details>`;

export const it = {
  icon_alt: "Mascotte di Arroxy",
  title: "Arroxy — downloader gratuito e open source per YouTube (+ 2000 siti) su Windows, macOS e Linux",
  read_in_label: "Leggi in:",
  badge_release_alt: "Versione",
  badge_build_alt: "Build",
  badge_license_alt: "Licenza",
  badge_platforms_alt: "Piattaforme",
  badge_i18n_alt: "Lingue",
  badge_website_alt: "Sito web",
  discord_badge_text: "Unisciti alla community Discord",
  discord_badge_encoded: "Unisciti%20alla%20community%20Discord",
  hero_desc: "Scarica video, Shorts, musica, canali, podcast o tracce audio da **YouTube e oltre 2000 siti supportati** — fino a 4K HDR a 60 fps oppure in MP3 / AAC / Opus. Funziona localmente su Windows, macOS e Linux. **Niente pubblicità, niente software superfluo, niente upselling.**",
  cta_latest: "↓ Installa l'ultima versione",
  cta_website: "Sito web",
  demo_alt: "Demo di Arroxy",
  star_cta: "Se Arroxy ti fa risparmiare tempo, una ⭐ aiuta altre persone a scoprirlo.",
  ai_notice: "> 🌐 Questa traduzione è stata realizzata con assistenza IA. Il [README in inglese](README.md) è la fonte autorevole. Hai trovato un errore? [Apri una PR](../../pulls).",
  toc_heading: "Indice",
  why_h2: "Perché Arroxy",
  features_h2: "Funzionalità",
  dl_h2: "Installazione e primo avvio",
  privacy_h2: "Privacy",
  faq_h2: "Domande frequenti",
  roadmap_h2: "Roadmap",
  tech_h2: "Tecnologie",
  why_intro: "Confronto diretto con le alternative più comuni:",
  why_r1: "Gratuito, senza piano premium",
  why_r2: "Open source",
  why_r3: "Elaborazione solo locale",
  why_r4: "Nessun accesso o esportazione dei cookie",
  why_r5: "Nessun limite di utilizzo",
  why_r6: "App desktop multipiattaforma",
  why_r7: "Sottotitoli + SponsorBlock",
  why_summary: "Arroxy è pensato per una sola cosa: incolla un URL e ottieni un file locale pulito. Nessun account, upselling o raccolta di dati.",
  feat_quality_h3: "Qualità e formati",
  feat_quality_1: "Fino a **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p e 360p",
  feat_quality_2: "**Frame rate elevato** mantenuto invariato — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Audio** — esporta solo l'audio in MP3, M4A/AAC, Opus o WAV. Nei download interattivi puoi scegliere, se disponibili, le tracce surround/Dolby native della sorgente (AC-3, E-AC-3, 5.1, DRC), oppure impostare **Preferisci surround / Dolby** come predefinito globale",
  feat_quality_4: "Preset rapidi: *Qualità migliore* · *Bilanciato* · *File piccolo*",
  feat_privacy_h3: "Privacy e controllo",
  feat_privacy_1: "Elaborazione locale al 100% — i download passano direttamente da YouTube al tuo disco",
  feat_privacy_2: "**Open source** — ogni riga è verificabile, licenza MIT",
  feat_privacy_3: "I file vengono salvati direttamente nella cartella scelta",
  feat_workflow_h3: "Flusso di lavoro",
  feat_workflow_12: "**Scorciatoia globale per i download** — copia un link in qualsiasi app e premi `Ctrl+Shift+D` (`Cmd+Shift+D` su macOS); Arroxy lo mette in coda con il profilo attivo senza aprire la finestra e una notifica lo conferma. Attiva per impostazione predefinita e riconfigurabile",
  feat_workflow_1: "**Modalità di avvio flessibili** — scegli un download singolo guidato, il selettore di playlist/canali, l'incolla massivo di URL o Download rapido con i valori predefiniti salvati",
  feat_workflow_2: "**Coda di download centrale** — ogni attività singola, playlist, massiva o rapida confluisce nello stesso punto per controllare avanzamento, pausa, ripresa, annullamento, nuovo tentativo e priorità",
  feat_workflow_3: "**Monitoraggio degli appunti** — copia un link YouTube e Arroxy compila automaticamente l'URL quando torni nell'app (opzione nelle impostazioni avanzate)",
  feat_workflow_4: "**Pulizia automatica degli URL** — rimuove i parametri di tracciamento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ed estrae i link da `youtube.com/redirect`",
  feat_workflow_5: "**Modalità area di notifica** — chiudendo la finestra i download continuano in background",
  feat_workflow_6: "**{{LANG_COUNT}} lingue** — rileva automaticamente la lingua di sistema, modificabile in qualsiasi momento",
  feat_workflow_7: "**Sincronizzazione playlist** — confronta di nuovo una playlist con una cartella locale per saltare i video già scaricati; genera un file playlist `.m3u` aggiornato dopo ogni download",
  feat_workflow_8: "**Controlli di velocità e ritmo** — limita la banda, stabilisci quante parti di un video scaricare contemporaneamente e aggiungi ritardi alle richieste con i preset (*Disattivato · Bilanciato · Prudente · Personalizzato*)",
  feat_workflow_9: "**Modelli per i nomi file** — assegna i nomi con `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` e `{playlist_index}`, globalmente o per profilo di download",
  feat_workflow_10: "**Download simultanei e nuovi tentativi automatici** — scegli quanti download in coda eseguire insieme e lascia che Arroxy ritenti quelli interrotti da problemi di rete o del server, aumentando l'attesa a ogni tentativo",
  feat_workflow_11: "**Profili per singolo elemento della playlist** — assegna a ogni video un profilo diverso invece di un'unica impostazione per l'intero elenco, così puoi archiviare alcuni video alla massima qualità e scaricare gli altri in MP3 in un solo passaggio",
  feat_post_h3: "Sottotitoli e post-elaborazione",
  feat_post_1: "**Sottotitoli** in SRT, VTT o ASS — manuali o generati automaticamente, in qualsiasi lingua disponibile",
  feat_post_2: "Salvali accanto al video, incorporali in `.mkv` oppure organizzali nella sottocartella `Subtitles/`",
  feat_post_3: "**SponsorBlock** — salta sponsor, introduzioni, finali e autopromozioni oppure contrassegnali come capitoli",
  feat_post_4: "**Metadati incorporati** — titolo, data di caricamento, canale, descrizione, miniatura e indicatori dei capitoli scritti nel file",
  feat_sites_h3: "YouTube + 2000 siti",
  feat_sites_1: "**YouTube completo** — video, Shorts, canali, playlist, YouTube Music e podcast sono gestiti come sorgenti di prima classe",
  feat_sites_2: "**Oltre 2000 altri siti** tramite yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org e molti altri",
  feat_sites_3: "**Solo audio e sottotitoli** funzionano su ogni sito supportato, non soltanto su YouTube",
  feat_sites_4: "Se un sito cambia, yt-dlp distribuisce correzioni ogni settimana e Arroxy aggiorna automaticamente il binario all'avvio",
  shot1_cap: "<b>Home di Download rapido</b><br/>Incolla un URL e scaricalo subito con il profilo attivo",
  shot2_cap: "<b>Profili di download riutilizzabili</b><br/>Salva preset di formato, qualità e destinazione e riutilizzali per ogni download",
  shot3_cap: "<b>Tracce audio multilingue</b><br/>Scegli la lingua audio esatta fornita dal video",
  shot4_cap: "<b>Audio surround / Dolby</b><br/>Le tracce 5.1 e Dolby vengono rilevate e conservate",
  shot5_cap: "<b>Modalità URL massivi</b><br/>Incolla un elenco, rimuovi automaticamente i duplicati e metti tutto in coda",
  shot6_cap: "<b>Coda di download paralleli</b><br/>Più download contemporanei con avanzamento in tempo reale",
  hotkey_fig_alt: "Scorciatoia globale di download di Arroxy — Ctrl+Shift+D su Windows e Linux, Cmd+Shift+D su macOS, per inviare il link copiato direttamente alla coda",
  hotkey_fig_cap: "<b>Scorciatoia globale per i download</b><br/>Copia un link ovunque e premi una volta: entra nella coda e parte il download",
  shot7_cap: "<b>Profili per singolo elemento della playlist</b><br/>Dai a ogni video il suo profilo: archivia alcuni in 4K e scarica gli altri in MP3",
  dl_platform_col: "Piattaforma",
  dl_format_col: "Download diretto",
  dl_oneline_note: "Lo script Linux verifica il download tramite il file `SHA256SUMS` pubblicato e aggiunge Arroxy al menu delle applicazioni. Le build sono disponibili solo per x86_64. Non hai `curl`? Sostituisci `curl -fsSL` con `wget -qO-`.",
  dl_win_scoop: "Preferisci Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_grab: "Tutti i file della versione →",
  dl_win_h3: "Windows: programma di installazione o portatile",
  dl_win_col_installer: "Programma di installazione NSIS",
  dl_win_col_portable: "`.exe` portatile",
  dl_win_r1: "Installazione necessaria",
  dl_win_r1_installer: "Sì",
  dl_win_r1_portable: "No — eseguilo da qualsiasi posizione",
  dl_win_r2: "Aggiornamenti automatici",
  dl_win_r2_installer: "✅ nell'app",
  dl_win_r2_portable: "❌ download manuale",
  dl_win_r3: "Velocità di avvio",
  dl_win_r3_installer: "✅ più veloce",
  dl_win_r3_portable: "⚠️ primo avvio più lento",
  dl_win_r4: "Aggiunta al menu Start",
  dl_win_r5: "Disinstallazione semplice",
  dl_win_r5_portable: "❌ elimina il file",
  dl_win_rec: "**Consiglio:** usa il programma di installazione NSIS per gli aggiornamenti automatici e un avvio più rapido. Usa il `.exe` portatile se non vuoi installazione né modifiche al registro.",
  dl_win_smartscreen_intro: "Al primo avvio potresti vedere **\"Windows ha protetto il PC\"** o **\"Autore sconosciuto\"**. Vale sia per `Arroxy-win-x64-Setup.exe` sia per `Arroxy-win-x64-Portable.exe`. Arroxy è gratuito e open source, ma le build Windows non sono firmate con un certificato a pagamento: per questo SmartScreen le segnala. Ciò **non** significa automaticamente che Arroxy non sia sicuro. Per continuare:",
  dl_win_smartscreen_step1: "Fai clic su **Ulteriori informazioni**.",
  dl_win_smartscreen_step2: "Fai clic su **Esegui comunque**.",
  dl_win_smartscreen_official: "Scarica Arroxy soltanto dalla pagina ufficiale delle versioni GitHub. Se il file proviene da un altro sito o ti è stato inviato da qualcuno, eliminalo e scaricane una copia nuova dalla fonte ufficiale. Il codice sorgente è pubblico: puoi esaminarlo o compilare Arroxy autonomamente.",
  dl_macos_note: "Le build macOS vengono prodotte in CI su runner Apple Silicon e Intel. In caso di problemi, [apri una segnalazione](../../issues): il riscontro degli utenti macOS orienta attivamente il ciclo di test.",
  dl_linux_intro: "Le AppImage vengono eseguite direttamente, senza installazione. Devi soltanto contrassegnare il file come eseguibile.",
  dl_linux_m1_text: "**Gestore file:** fai clic destro sul file `.AppImage` → **Proprietà** → **Permessi** → abilita **Consentire l'esecuzione del file come programma**, quindi fai doppio clic.",
  dl_linux_m2_h4: "Terminale:",
  dl_linux_fuse_text: "Se l'avvio non riesce ancora, eseguilo senza montarlo; non occorre alcun pacchetto FUSE:",
  dl_linux_targz_h4: "Archivio tar semplice (senza FUSE né installazione):",
  dl_linux_targz_text: "La build `.tar.gz` contiene la stessa app senza il wrapper AppImage: estraila ovunque ed eseguila. Non servono un programma di installazione né FUSE.",
  dl_linux_flatpak_prereq: "Ubuntu include Snap anziché Flatpak; installa quindi Flatpak e aggiungi prima Flathub, da cui il pacchetto scaricherà il proprio runtime:",
  dl_linux_arch_note: "**I download Linux nella pagina della versione sono disponibili solo per x86_64.** Sui sistemi ARM64 (Raspberry Pi, Asahi Linux) Flatpak si installa comunque, ma poi non parte e mostra `bwrap: execvp ldconfig: Exec format error`.",
  dl_linux_flatpak_intro: "**Flatpak (alternativa in sandbox):** scarica `Arroxy-linux-x64.flatpak` dalla stessa pagina della versione.",
  dl_warning_h3: "Perché potresti vedere un avviso",
  dl_warning_p1: "Arroxy è open source e distribuito con licenza MIT. Le build Windows e macOS **non sono firmate digitalmente**: i certificati Apple Developer ID ed EV per Windows costano ciascuno centinaia di euro all'anno, a carico di un progetto indipendente. Senza tali firme, Windows SmartScreen e macOS Gatekeeper mostrano un avviso al primo avvio. Gli avvisi indicano che *il sistema operativo non riconosce l'autore*, non che Arroxy sia malware.",
  dl_warning_p2: "Tre modi per verificare personalmente Arroxy, in ordine di rigore:\n\n- **Leggi il sorgente.** Ogni riga si trova su [GitHub](https://github.com/antonio-orionus/Arroxy) e puoi [compilarlo dal sorgente](#tech).\n- **Controlla SHA256.** Confronta il file con [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) pubblicato; consulta [Verifica il download](#verify) più avanti.\n- **Esegui una scansione esterna.** Carica il file su [VirusTotal](https://www.virustotal.com).",
  dl_win_first_h3: "Primo avvio su Windows",
  shot_smartscreen_more_alt: "Finestra di SmartScreen \"Windows ha protetto il PC\" con il collegamento \"Ulteriori informazioni\" evidenziato",
  shot_smartscreen_run_alt: "Finestra di SmartScreen dopo l'espansione delle informazioni, con il pulsante \"Esegui comunque\"",
  dl_win_defender_h4: "Se Windows Defender segnala o rimuove il file",
  dl_win_defender_p: "Le euristiche di Defender talvolta considerano sospetti i programmi di installazione NSIS e i pacchetti portatili Electron non firmati. Se Defender mette in quarantena `Arroxy-win-x64-Setup.exe` o `Arroxy-win-x64-Portable.exe`, ripristinalo da **Sicurezza di Windows → Protezione da virus e minacce → Cronologia della protezione**, quindi aggiungi l'eseguibile Arroxy agli elementi consentiti in **Gestisci impostazioni → Aggiungi o rimuovi esclusioni**. Come per SmartScreen, la causa è la firma dell'autore mancante, non il rilevamento di malware.",
  dl_macos_first_h3: "Primo avvio su macOS",
  dl_macos_intro: "Le build macOS di Arroxy hanno una firma ad hoc ma non sono autenticate da Apple, quindi Gatekeeper blocca il primo avvio con *\"Arroxy.app\" non è stata aperta — Apple non può verificare che \"Arroxy.app\" sia priva di malware*. Significa che macOS non può verificare l'app con Apple, non che i file abbiano un problema. L'installazione con Homebrew evita completamente questa finestra. Se hai usato il DMG, basta un comando nel Terminale:",
  dl_macos_sequoia_step1: "Trascina `Arroxy.app` dal DMG montato in `/Applications`.",
  dl_macos_sequoia_step2: "Apri il Terminale ed esegui questi due comandi:",
  dl_macos_damaged_p: "Il primo comando rimuove l'attributo di quarantena applicato da macOS al file scaricato; il secondo avvia l'app. Normalmente `sudo` non serve perché la copia in `/Applications` appartiene al tuo utente; aggiungilo solo in caso di errore di autorizzazione.",
  dl_macos_arch_note: "**Apple Silicon o Intel:** su un Mac serie M (M1 / M2 / M3 / M4), scarica il DMG `arm64`. Su un Mac Intel, scarica il DMG `x64`. La build errata funziona comunque tramite Rosetta, ma è sensibilmente più lenta.",
  dl_linux_first_h3: "Primo avvio su Linux",
  dl_linux_appimagelauncher: "**Integrazione desktop facoltativa:** installa una volta [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher); ogni AppImage aperta con doppio clic verrà registrata automaticamente nel menu delle applicazioni, senza creare manualmente un file `.desktop`.",
  dl_verify_h3: "Verifica il download (SHA256)",
  dl_verify_intro: "Ogni versione pubblica un file `SHA256SUMS` insieme ai binari. Per verificare che il download non sia stato danneggiato o alterato durante il trasferimento, calcola l'hash del file localmente e confrontalo con la riga corrispondente in `SHA256SUMS`. Apri la pagina dell'ultima versione → **Assets** → scarica `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell o Prompt dei comandi):",
  dl_verify_mac_label: "macOS (Terminale):",
  dl_verify_linux_label: "Linux (Terminale):",
  dl_verify_vt_text: "Vuoi una scansione antimalware esterna? Carica il file su [VirusTotal](https://www.virustotal.com). Qualche segnalazione euristica generica da motori minori è normale per le app Electron non firmate; numerose segnalazioni da motori importanti sarebbero invece un vero motivo di preoccupazione.",
  privacy_p1: "I download vengono trasferiti direttamente da YouTube alla cartella scelta tramite [yt-dlp](https://github.com/yt-dlp/yt-dlp), senza passare per server di terzi. Cronologia di visualizzazione e download, URL e contenuto dei file restano sul tuo dispositivo.",
  privacy_p2: "Arroxy invia telemetria anonima e aggregata tramite [OpenPanel](https://openpanel.dev), quanto basta a un progetto indipendente per comprendere errori, arresti anomali, feedback, sistema operativo e versioni dell'app. Non invia URL, titoli dei video, percorsi dei file, dati degli account, impronte digitali o informazioni personali. L'ID di installazione è casuale e non è collegato alla tua identità. Puoi disattivarlo nelle Impostazioni.",
  faq_q1: "È davvero gratuito?",
  faq_a1: "Sì: licenza MIT, nessun piano premium e nessuna funzione bloccata.",
  faq_q2: "Quali qualità video posso scaricare?",
  faq_a2: "Tutto ciò che YouTube offre: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p e solo audio. I flussi a 60 fps, 120 fps e HDR vengono mantenuti invariati.",
  faq_q3: "Posso estrarre soltanto l'audio in MP3?",
  faq_a3: "Sì. Scegli *solo audio* nel menu del formato e seleziona MP3, M4A/AAC, Opus o WAV.",
  faq_q4: "Servono un account YouTube o i cookie?",
  faq_a4: "Per impostazione predefinita no: Arroxy funziona senza account YouTube, accesso o esportazione dei cookie. Il supporto facoltativo dei cookie è disponibile nelle impostazioni avanzate (origine dei cookie: file o browser) per contenuti che richiedono autenticazione, come video con limiti di età o riservati agli abbonati. È disattivato per impostazione predefinita. Se lo abiliti, il wiki di yt-dlp avverte che [l'automazione basata sui cookie può far segnalare un account Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); in tal caso è più sicuro usare un account secondario.",
  faq_q5: "Continuerà a funzionare quando YouTube cambierà qualcosa?",
  faq_a5: "yt-dlp si aggiorna automaticamente all'avvio e Arroxy distribuisce rapidamente le correzioni quando YouTube cambia. Se riscontri comunque un problema, nelle impostazioni avanzate è disponibile come ripiego il supporto facoltativo dei cookie.",
  faq_q6: "In quali lingue è disponibile Arroxy?",
  faq_a6: "{{LANG_COUNT}} lingue pronte all'uso: {{LANG_NAME_LIST}}. Arroxy rileva automaticamente la lingua del sistema operativo al primo avvio e puoi cambiarla in qualsiasi momento dal selettore nella barra degli strumenti. I file JSON delle lingue usati in fase di esecuzione si trovano in src/shared/i18n/locales/, mentre i cataloghi PO per i traduttori sono in i18n/locales/: apri una PR su GitHub per contribuire.",
  faq_q7: "Devo installare qualcos'altro?",
  faq_a7: "No. yt-dlp viene scaricato automaticamente al primo avvio e memorizzato nella cache del computer; ffmpeg e ffprobe sono inclusi nell'app. In seguito non serve alcuna configurazione aggiuntiva.",
  faq_q8: "Posso scaricare playlist o interi canali?",
  faq_a8: "Sì, entrambi. Incolla l'URL di una playlist o di un canale (per esempio `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`), scegli quante voci esaminare, quindi metti in coda l'intero elenco o seleziona singoli video. I filtri per intervallo di date arriveranno presto.",
  faq_q9: "macOS dice che \"l'app è danneggiata\": cosa devo fare?",
  faq_a9: "È macOS Gatekeeper che blocca un'app non firmata, non un danno effettivo. Consulta [Primo avvio su macOS](#macos-first-launch) per i comandi del Terminale che rimuovono la quarantena e avviano Arroxy.",
  faq_q10: "Scaricare video da YouTube è legale?",
  faq_a10: "Per uso personale e privato è generalmente accettato nella maggior parte delle giurisdizioni. Sei responsabile del rispetto dei [Termini di servizio](https://www.youtube.com/t/terms) di YouTube e delle leggi locali sul diritto d'autore.",
  plan_intro: "Funzionalità ancora previste, grosso modo in ordine di priorità:",
  plan_col1: "Funzionalità",
  plan_col2: "Descrizione",
  plan_r1_name: "**Filtri per playlist e canali**",
  plan_r1_desc: "Filtri per intervallo di date durante l'elenco di una playlist o di un canale",
  plan_r2_name: "**Preferenze delle tracce audio di YouTube**",
  plan_r2_desc: "Imposta una preferenza globale per la lingua parlata, con eccezioni per profilo quando YouTube offre più tracce audio",
  plan_r6_name: "**Accesso dal browser interno**",
  plan_r6_desc: "Apri finestre del browser in Arroxy per accedere e utilizzare i cookie dei siti senza esportarli manualmente",
  plan_r8_name: "**Download video con un clic**",
  plan_r8_desc: "Avvia con un clic il download di un URL rilevato o incollato usando il profilo attivo",
  plan_r3_name: "**Ripristino più robusto dei tentativi**",
  plan_r3_desc: "Un nuovo percorso di ripetizione per i download interrotti da connessioni Internet instabili o problematiche",
  plan_r4_name: "**Pannello completo di gestione download**",
  plan_r4_desc: "Trasforma il pannello della coda in un gestore più completo, inclusa la modifica delle cartelle di destinazione degli elementi in attesa",
  plan_r5_name: "**Download pianificati**",
  plan_r5_desc: "Avvia una coda a un orario stabilito, per esempio durante la notte",
  plan_r7_name: "**Ritaglio dei clip**",
  plan_r7_desc: "Scarica solo un segmento indicando il tempo iniziale e finale",
  plan_cta: "Hai in mente una funzionalità? [Apri una richiesta](../../issues): il contributo della community orienta le priorità.",
  dl_win_format: "Programma di installazione (NSIS) o `.exe` portatile",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` o `.flatpak` (in sandbox)",
  dl_pkg_h3: "Installa con un gestore pacchetti",
  dl_channel_col: "Canale",
  dl_command_col: "Comando",
  dl_win_smartscreen_h4: "Avviso di Windows SmartScreen",
  dl_macos_h3: "Primo avvio su macOS",
  dl_macos_warning: "Arroxy non è ancora firmato digitalmente, quindi macOS Gatekeeper può mostrare l'avviso di app danneggiata al primo avvio. È previsto e non indica un danno reale al file.",
  dl_macos_m1_h4: "Metodo dal Terminale:",
  dl_macos_step1: "Trascina `Arroxy.app` dal DMG montato in `/Applications`.",
  dl_macos_step2: "Apri il Terminale ed esegui `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Esegui `open /Applications/Arroxy.app`.",
  dl_macos_step4: "Se il percorso dell'app è diverso, sostituisci `/Applications/Arroxy.app` con quello di installazione.",
  dl_macos_step5: "Inserisci la password del Mac se richiesta da `sudo`.",
  dl_macos_after: "Dopo la rimozione della quarantena, Arroxy si apre normalmente.",
  dl_macos_m2_h4: "Metodo dal Terminale:",
  dl_linux_h3: "Primo avvio su Linux",
  dl_macos_sequoia_h4: "Correzione dal Terminale per macOS attuale",
  dl_macos_sequoia_intro: "Usa il Terminale dopo aver copiato Arroxy in Applicazioni:",
  dl_macos_sequoia_step3: "Esegui `open /Applications/Arroxy.app` per avviare Arroxy.",
  dl_macos_sequoia_step4: "Se il percorso dell'app è diverso, sostituisci `/Applications/Arroxy.app` con quello di installazione.",
  dl_macos_sonoma_h4: "Correzione dal Terminale per versioni macOS precedenti",
  dl_macos_sonoma_step1: "Trascina `Arroxy.app` dal DMG montato in `/Applications`.",
  dl_macos_sonoma_step2: "Apri il Terminale e rimuovi la quarantena da `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3: "Dopo la rimozione della quarantena, avvia Arroxy dal Terminale o dal Finder.",
  dl_macos_damaged_h4: "Correzione della quarantena di Gatekeeper",
  dl_pm_intro: "Usi già un gestore pacchetti? Puoi saltare il download manuale.",
  tech_content: TECH_CONTENT,
  support_h2: "Sostieni Arroxy",
  support_note: "Arroxy è gratuito e distribuito con licenza MIT: niente pubblicità e nessun piano a pagamento. Se ti fa risparmiare tempo, puoi sostenere lo sviluppo con Bitcoin o Tron; gli indirizzi si trovano in [DONATE.md](DONATE.md), l'unica fonte ufficiale. Arroxy non invierà mai un indirizzo tramite e-mail o messaggio diretto. Mettere una stella al repository, segnalare errori e migliorare le traduzioni è altrettanto utile.",
  tos_h2: "Condizioni d'uso",
  tos_note: "Arroxy è uno strumento destinato esclusivamente all'uso personale e privato. Sei l'unico responsabile di verificare che i download rispettino i [Termini di servizio](https://www.youtube.com/t/terms) di YouTube e le leggi sul diritto d'autore della tua giurisdizione. Non usare Arroxy per scaricare, riprodurre o distribuire contenuti che non hai il diritto di utilizzare. Gli sviluppatori non rispondono di eventuali usi impropri.",
  footer_credit: 'Licenza MIT · Realizzato con cura da <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
