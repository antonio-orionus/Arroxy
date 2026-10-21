const TECH_CONTENT = `<details>
<summary><strong>Teknologi</strong></summary>

- **Electron** — plattformuavhengig skrivebordsskall
- **React 19** + **TypeScript** — brukergrensesnitt
- **Tailwind CSS v4** — stiling
- **Zustand** — tilstandshåndtering
- **yt-dlp** + **ffmpeg** — nedlastings- og muxing-motor (begge hentes under kjøring: yt-dlp holdes oppdatert, ffmpeg/ffprobe installeres én gang og beholdes på tvers av oppdateringer)
- **Vite** + **electron-vite** — byggeverktøy
- **Vitest** + **Playwright** — enhetstester og ende-til-ende-tester

</details>

<details>
<summary><strong>Bygg fra kildekode</strong></summary>

### Forutsetninger – alle plattformer

| Verktøy | Versjon | Installasjon |
| ------- | ------- | ------- |
| Git     | alle    | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` eller \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` eller \`package.json\` \`packageManager\` |

Anbefalt: installer \`mise\`, og kjør deretter \`mise install\` i det utsjekkede prosjektet. Uten mise må du aktivere Node.js fra \`.node-version\` og Bun fra \`package.json\` manuelt før \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools og Python kan være nødvendig for native ombygginger.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Etter kloning kjører du \`mise trust && mise install\` fra det utsjekkede prosjektet. Hvis skallet ditt allerede bruker \`fnm\`, \`nvm\` eller en Bun fra Homebrew, aktiverer du mise i \`~/.zshrc\` slik at Arroxy får Node.js 24.21.0 og Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Klon og kjør

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Bygg en distribuerbar pakke

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` installerer avhengigheter, bygger Electron-appens avhengigheter på nytt, verifiserer Electron, klargjør innebygd ffmpeg/ffprobe for utvikling og installerer Playwright Chromium. Utgivelsesbygg håndterer yt-dlp, ffmpeg og ffprobe under kjøring i appdatamappen din; ingen av dem følger med i installasjonsprogrammet.

</details>`;


export const nb = {
  icon_alt: "Arroxy-maskot",
  title:
    "Arroxy — gratis nedlaster med åpen kildekode for YouTube (+ 2000 nettsteder) med innebygd nettleser, for Windows, macOS og Linux",
  read_in_label: "Les på:",
  badge_release_alt: "Utgivelse",
  badge_build_alt: "Bygg",
  badge_license_alt: "Lisens",
  badge_platforms_alt: "Plattformer",
  badge_i18n_alt: "Språk",
  badge_website_alt: "Nettsted",
  discord_badge_text: "Bli med i Discord-fellesskapet",
  discord_badge_encoded: "Bli%20med%20i%20Discord--fellesskapet",
  hero_desc:
    "Last ned videoer, Shorts, musikk, kanaler, podkaster eller lydspor fra **YouTube og over 2000 støttede nettsteder** — opptil 8K HDR i 60 fps, som MP3 / AAC / Opus, eller bare den delen du trenger. **Surf på YouTube eller et hvilket som helst annet nettsted rett i Arroxy** i fanen Utforsk, og last ned videoen, spillelisten eller kanalen du er på; logg på der for å laste ned private videoer, videoer for medlemmer og videoer med aldersgrense som kontoen din kan se. Kjører lokalt på Windows, macOS og Linux. **Ingen reklame, ingen oppblåst programvare, ingen oppsalg.**",
  cta_latest: "↓ Installer siste utgivelse",
  cta_website: "Nettsted",
  website_url: "https://arroxy.com/",
  star_cta: "Hvis Arroxy sparer deg tid, hjelper en ⭐ andre med å finne det.",
  ai_notice:
    "> 🌐 Denne oversettelsen er laget med støtte fra KI. [Den engelske README-filen](README.md) er den overordnede kilden. Fant du en feil? [Åpne en PR](../../pulls).",
  toc_heading: "Innhold",
  why_h2: "Hvorfor Arroxy",
  features_h2: "Funksjoner",
  dl_h2: "Installasjon og første oppstart",
  privacy_h2: "Personvern",
  faq_h2: "Vanlige spørsmål",
  roadmap_h2: "Veikart",
  tech_h2: "Bygget med",
  why_intro: "En side-ved-side-sammenligning med de vanligste alternativene:",
  why_r1: "Gratis, uten betalt nivå",
  why_r2: "Åpen kildekode",
  why_r3: "Bare lokal behandling",
  why_r5: "Ingen bruksgrenser",
  why_r6: "Plattformuavhengig skrivebordsapp",
  why_r7: "Undertekster + SponsorBlock",
  why_r8: "Innebygd nettleser (surf, logg på, last ned)",
  why_r9: "Private videoer, videoer for medlemmer og videoer med aldersgrense uten å eksportere informasjonskapsler",
  why_table_note:
    "⚠️ = delvis, eller bare i et betalt nivå. Innloggingen i appen for private videoer i 4K Video Downloader er en betalt funksjon; de fleste gratis yt-dlp-grensesnitt godtar bare en informasjonskapselfil eller leser informasjonskapslene fra nettleseren din.",
  why_summary:
    "Arroxy er bygget for én ting: en ren lokal fil, enten du limer inn en nettadresse eller finner videoen i Utforsk. Ingen oppsalg, ingen datainnsamling.",
  why_explore_h3: "Det en enkel yt-dlp-innpakning ikke kan: fanen Utforsk",
  why_explore_intro:
    "De fleste gratis YouTube-nedlastere er et nettadressefelt oppå yt-dlp. Arroxy bruker også yt-dlp, men har i tillegg **Utforsk**, en nettleser bygget inn i appen som åpner YouTube eller et hvilket som helst annet nettsted. Utforsk kommer forbi begrensninger som et nettadressefelt ikke klarer:",
  why_explore_1:
    "**Videoer som krever en konto, uten å eksportere informasjonskapsler** — private videoer, videoer for medlemmer og videoer med aldersgrense (på en aldersverifisert konto), pluss listene Se senere og Likte videoer, og videoer bak en pålogging på andre nettsteder. En enkel innpakning trenger en cookies.txt-eksport eller må lese informasjonskapslene fra nettleseren din, noe Chrome i Windows nå blokkerer. I Arroxy logger du på én gang i Utforsk, så tar appen seg av resten",
  why_explore_2:
    "**«Logg på for å bekrefte at du ikke er en robot»** — når YouTube spør om dette, prøver Arroxy nedlastingen på nytt med Utforsk-påloggingen din i stedet for å feile",
  why_explore_3:
    "**YouTubes nedlastingstoken** — Arroxys innebygde nettleser henter tokenet YouTube forventer før en nedlasting. Uten det kan YouTube levere færre formater og lavere kvalitet enn du ba om",
  why_explore_4:
    "**Ingen kopiering av lenker** — finn en video, spilleliste eller kanal i Utforsk og last den ned med ett klikk, eller høyreklikk på en hvilken som helst lenke på siden",
  why_explore_5:
    "**Annonseblokkerer når du vil ha den** — ett klikk på skjoldet blokkerer annonser og sporere på sidene i Utforsk",
  feat_explore_h3: "Utforsk: surf på nettet rett i Arroxy",
  feat_explore_1:
    "**Fanen Utforsk** — surf på YouTube eller et hvilket som helst annet nettsted rett i Arroxy, og last ned det du finner uten å kopiere lenker. **Last ned · *profilen din*** legger videoen, spillelisten eller kanalen du ser på i køen; pilen ved siden av bytter profil, og tryllestaven åpner trinn-for-trinn-nedlastingen der du velger formater, undertekster og mer",
  feat_explore_6:
    "**Høyreklikk for å laste ned** — høyreklikk på en video-, spilleliste- eller kanallenke i Utforsk for å laste den ned med profilen din, velge en annen profil under **Last ned med**, åpne trinn-for-trinn-nedlastingen eller kopiere lenken. Du slipper å åpne hver video først",
  feat_explore_7:
    "**Kompakt oppsett** — ett klikk i verktøylinjen i Utforsk flytter fanene i Arroxy dit og gir siden mer plass",
  feat_explore_2:
    "**Adressefelt** — skriv for å søke på YouTube, eller skriv inn en hvilken som helst nettadresse for å åpne det nettstedet",
  feat_explore_3:
    "**Nedlastinger som krever en konto** — logg på én gang i Utforsk, så kan Arroxy laste ned private videoer og videoer for medlemmer som kontoen din kan se, videoer med aldersgrense hvis kontoen er aldersverifisert, og listene dine Se senere og Likte videoer. Logg på andre nettsteder der også, så bruker nedlastingene fra dem den påloggingen når de trenger den. Arroxy laster fortsatt ned avlogget først og bruker Utforsk-påloggingen din bare når en nedlasting feiler på en måte en konto kan rette opp. Når YouTube ber deg bekrefte at du ikke er en robot, prøver Arroxy også Utforsk-påloggingen din",
  feat_explore_4:
    "**Bruk en sekundær konto** — den første skjermen i Utforsk forklarer hvorfor: nedlasting med en konto innebærer en viss risiko for at kontoen blir begrenset. Logg av Utforsk fra innstillingene når du vil at påloggingene dine skal glemmes",
  feat_explore_5:
    "**Annonseblokkerer** — av som standard. Ett klikk på skjoldet i verktøylinjen i Utforsk blokkerer annonser og sporere på sidene der, uten å påvirke nedlastinger. YouTube kan motarbeide annonseblokkere for påloggede kontoer",
  feat_quality_h3: "Kvalitet og formater",
  feat_quality_1: "Opptil **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Høy bildefrekvens og HDR** bevart som de er — 60 fps, HDR10",
  feat_quality_3:
    "**Lyd** — eksporter bare lyd som MP3, M4A/AAC, Opus eller WAV. I interaktive nedlastinger kan du velge kildens opprinnelige surround-/Dolby-spor (AC-3, E-AC-3, 5.1, DRC) når de finnes, eller angi en global standard **Foretrekk surround / Dolby**",
  feat_quality_4:
    "**Profiler med et mål** — *Beste bilde* (AV1 · VP9) eller *Smart-TV* (MP4 · H.264), lagret som Auto, MP4, MKV eller WebM uten omkoding. HDR er *Auto* (bare når skjermen din kan vise det), *SDR* eller *HDR*",
  feat_quality_5:
    "**Hver kodek i hver oppløsning** — trinn-for-trinn-nedlastingen viser AV1, VP9 og H.264 side om side i hver oppløsning, slik at du kan velge den TV-en eller redigeringsprogrammet ditt spiller av",
  feat_quality_6:
    "**Vit hva en strøm egentlig er** — størrelser YouTube har oppskalert med KI, KI-dubbede lydspråk, strømmer med økt bitrate, 360°-videoer og skadede kopier eller kopier med vannmerke merkes. Profiler hopper over KI-oppskalerte strømmer med mindre du tillater dem",
  feat_privacy_h3: "Personvern og kontroll",
  feat_privacy_1:
    "100 % lokal behandling — nedlastinger går rett fra YouTube til disken din",
  feat_privacy_2: "**Åpen kildekode** — hver linje kan etterprøves, lisensiert under GPLv3",
  feat_privacy_3: "Filer lagres rett i mappen du velger",
  feat_workflow_h3: "Arbeidsflyt",
  feat_workflow_12:
    "**Global hurtigtast for nedlasting** — kopier en lenke i en hvilken som helst app og trykk `Ctrl+Shift+D` (`Cmd+Shift+D` på macOS); Arroxy legger den i køen med den aktive profilen din uten å åpne vinduet, og et varsel bekrefter det. På som standard, kan tilordnes på nytt",
  feat_workflow_1:
    "**Fleksible startmåter** — velg en veiledet enkeltnedlasting, spilleliste-/kanalvelger, innliming av flere nettadresser, Hurtignedlasting med lagrede standarder, eller surf og last ned fra Utforsk",
  feat_workflow_2:
    "**Sentral nedlastingskø** — hver enkeltnedlasting, spilleliste, gruppe eller hurtigjobb havner på ett sted for fremdrift, pause, fortsettelse, avbrytelse, nytt forsøk og prioritering",
  feat_workflow_3:
    "**Overvåking av utklippstavlen** — kopier en videolenke, så fyller den ut nettadressefeltet når du kommer tilbake til Arroxy, med **Angre** hvis du ikke mente det. Mens Arroxy er opptatt, venter lenken til du er tilbake i fanen for nettadresser (kan slås av i innstillingene)",
  feat_workflow_4:
    "**Automatisk opprydding av nettadresser** — fjerner sporingsparametere (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) og pakker ut `youtube.com/redirect`-lenker",
  feat_workflow_5:
    "**Systemstatusfelt-modus** — når du lukker vinduet, fortsetter nedlastingene i bakgrunnen",
  feat_workflow_6:
    "**{{LANG_COUNT}} språk** — oppdager systemspråket automatisk, kan byttes når som helst",
  feat_workflow_7:
    "**Spillelistesynkronisering** — skann en spilleliste på nytt mot en lokal mappe for å hoppe over videoer som allerede er lastet ned; lager en `.m3u`-spillelistefil som oppdateres etter hvert som hver video lastes ned",
  feat_workflow_8:
    "**Kontroller for hastighet og tempo** — begrens nedlastingsbåndbredden, angi hvor mange deler av en video som lastes ned samtidig, og legg til forsinkelser mellom forespørsler med forhåndsvalg (*Av · Balansert · Forsiktig · Egendefinert*)",
  feat_workflow_9:
    "**Filnavnmaler** — navngi nedlastinger på din måte med `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` og `{playlist_index}`, globalt eller per nedlastingsprofil",
  feat_workflow_10:
    "**Samtidige nedlastinger og automatisk nytt forsøk** — velg hvor mange nedlastinger i køen som kjører samtidig, og la Arroxy prøve en nedlasting på nytt som støtte på et nettverks- eller serverproblem, med lengre ventetid før hvert forsøk",
  feat_workflow_11:
    "**Profiler per spillelisteelement** — gi hver video i en spilleliste sin egen nedlastingsprofil i stedet for én innstilling for hele listen, slik at du i én omgang kan arkivere noen i full kvalitet og hente resten som MP3",
  feat_workflow_13:
    "**Hurtignedlasting jobber i bakgrunnen** — lenken dukker opp i Nedlastinger med en gang og klargjøres der, et varsel med **Vis** bekrefter det, og nettadressefeltet tømmes for neste lenke. Start så mange du vil mens tidligere klargjøres",
  feat_workflow_14:
    "**Nedlastinger sier fra om hva som trenger deg** — hvis Arroxy ikke kan lese en lenke, forklarer raden hvorfor og tilbyr løsningen: Prøv på nytt, slå på informasjonskapsler eller logg på i Utforsk. Med informasjonskapsler av prøver **Logg på med Utforsk** på nytt for deg når du er pålogget. En spilleliste som er lengre enn innlastingsgrensen din, venter på raden sin på at du velger hele, de første eller en gjennomgang. Fanen Nedlastinger teller radene som venter på deg",
  feat_workflow_15:
    "**Last ned bare en del av en video** — velg start og slutt, eller et kapittel, på Format-skjermen, så lagrer Arroxy bare det området, navngitt med området etter video-ID-en. Kutt havner på nærmeste nøkkelbilde; slå på nøyaktig kutt for å kode om i stedet",
  feat_workflow_16:
    "**Fjern fullførte nedlastinger** — valgfritt: en fullført nedlasting forsvinner fra listen 5 sekunder senere. Filene blir liggende på disken, og mislykkede nedlastinger blir stående i listen",
  feat_workflow_17:
    "**Størrelse og Mangler i Nedlastinger** — en sorterbar kolonne **Størrelse** viser hvor mye plass hver nedlasting tar, og **Mangler** flagger filer som er flyttet eller slettet utenfor Arroxy",
  feat_workflow_18:
    "**Aurora eller Minimal, mørk eller lys** — glasspaneler over en himmel i bevegelse, eller rolige solide flater; bytt fra bunnlinjen. Datamaskiner uten grafikkakselerasjon får Minimal automatisk",
  feat_workflow_19:
    "**Menylinjen på Mac** — på macOS kan du åpne innstillinger (`Cmd+,`), angi hastighetsgrensen for nedlasting, bytte stil og tema, og åpne logger eller lagre en diagnosefil fra menylinjen",
  feat_workflow_20:
    "**Endre en profil fra en hvilken som helst nedlasting** — juster en nedlasting, og oppdater deretter profilen den startet fra (med en forhåndsvisning av hva som endres) eller lagre innstillingene som en ny profil. Når du bytter profil, spør Arroxy om endringene dine skal beholdes",
  feat_post_h3: "Undertekster og etterbehandling",
  feat_post_1:
    "**Undertekster** i SRT, VTT eller ASS — manuelle eller automatisk genererte, på alle tilgjengelige språk",
  feat_post_2:
    "Lagre ved siden av videoen, bygg inn i `.mkv`, eller organiser i en undermappe `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — hopp over eller kapittelmarker sponsorer, introer, outroer og selvpromotering",
  feat_post_4:
    "**Innebygd metadata** — tittel, opplastingsdato, kanal, beskrivelse, miniatyrbilde og kapittelmarkører skrives inn i filen",
  feat_post_5:
    "**Grupper med bare undertekster** — lim inn en liste med nettadresser eller åpne en spilleliste, velg Undertekster, og få bare tekstfilene for hver video",
  feat_sites_h3: "YouTube + 2000 nettsteder",
  feat_sites_1:
    "**YouTube, fullt ut** — videoer, Shorts, kanaler, spillelister, YouTube Music og podkaster behandles som førsteklasses kilder",
  feat_sites_2:
    "**Over 2000 andre nettsteder** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable og mange flere",
  feat_sites_3:
    "**Bare lyd og undertekster** fungerer på alle støttede nettsteder, ikke bare YouTube",
  feat_sites_4:
    "Hvis et nettsted endrer seg, leverer yt-dlp rettelser hver uke, og Arroxy oppdaterer binærfilen automatisk ved oppstart",
  shot1_cap:
    "<b>Startsiden for Hurtignedlasting</b><br/>Lim inn en nettadresse og hent den umiddelbart med den aktive profilen din",
  shot2_cap:
    "<b>Gjenbrukbare nedlastingsprofiler</b><br/>Lagre format, kvalitet og utdata som forhåndsvalg — gjenbruk per nedlasting",
  shot3_cap:
    "<b>Flerspråklige lydspor</b><br/>Velg nøyaktig det lydspråket en video kommer med",
  shot4_cap:
    "<b>Surround-/Dolby-lyd</b><br/>5.1- og Dolby-spor oppdages og bevares",
  shot5_cap:
    "<b>Modus for flere nettadresser</b><br/>Lim inn en liste, fjern duplikater automatisk, legg alle i køen på én gang",
  shot6_cap:
    "<b>Parallell nedlastingskø</b><br/>Flere nedlastinger samtidig med fremdrift i sanntid",
  hotkey_fig_alt:
    "Arroxys globale hurtigtast for nedlasting — Ctrl+Shift+D på Windows og Linux, Cmd+Shift+D på macOS, sender den kopierte lenken rett inn i nedlastingskøen",
  hotkey_fig_cap:
    "<b>Global hurtigtast for nedlasting</b><br/>Kopier en lenke hvor som helst, trykk én gang — den havner i køen og begynner å laste ned",
  shot7_cap: "<b>Profiler per spillelisteelement</b><br/>Gi hver video sin egen profil — arkiver noen i 4K, hent resten som MP3",
  shot8_cap:
    "<b>Utforsk</b><br/>Surf på YouTube eller et hvilket som helst annet nettsted rett i Arroxy, og last ned siden du er på med den aktive profilen din",
  shot9_cap:
    "<b>Den første skjermen i Utforsk</b><br/>En rask titt på Utforsk, og hvorfor en sekundær konto er den tryggere påloggingen",
  shot10_cap:
    "<b>Nedlastinger sier fra om hva som trenger deg</b><br/>Lenker klargjøres i bakgrunnen; en som feiler, tilbyr løsningen sin, og en lang spilleliste venter på valget ditt",
  shot11_cap:
    "<b>Last ned bare en del av en video</b><br/>Velg start og slutt, eller et kapittel — Arroxy lagrer bare det området",
  shot12_cap:
    "<b>Profilredigering</b><br/>Juster en profil: filtype, oppløsning, undertekster, målmappe, filnavnmal og mer",
  shot13_cap:
    "<b>Mørk eller lys, glass eller solid</b><br/>Fire utseender å velge mellom: glasspaneler over en himmel i bevegelse eller rolige solide flater, hver i mørk og lys variant",
  shot14_cap:
    "<b>8K HDR i 60 fps</b><br/>Hver oppløsning, kodek og HDR-strøm en video tilbyr, side om side",
  dl_platform_col: "Plattform",
  dl_format_col: "Direkte nedlasting",
  dl_oneline_note:
    "Byggene er bare for x86_64. Mangler du `curl`? Bytt `curl -fsSL` med `wget -qO-`.",
  dl_win_scoop:
    "Foretrekker du Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Installasjonsprogram (NSIS) eller bærbar `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` eller `.flatpak` (i sandkasse)",
  dl_grab: "Alle utgivelsesfiler →",
  dl_pkg_h3: "Installer via pakkebehandler",
  dl_channel_col: "Kanal",
  dl_command_col: "Kommando",
  dl_win_h3: "Windows: installasjonsprogram eller bærbar",
  dl_win_col_installer: "NSIS-installasjonsprogram",
  dl_win_col_portable: "Bærbar `.exe`",
  dl_win_r1: "Installasjon kreves",
  dl_win_r1_installer: "Ja",
  dl_win_r1_portable: "Nei — kjør fra hvor som helst",
  dl_win_r2: "Automatiske oppdateringer",
  dl_win_r2_installer: "✅ i appen",
  dl_win_r2_portable: "❌ manuell nedlasting",
  dl_win_r3: "Oppstartshastighet",
  dl_win_r3_installer: "✅ raskere",
  dl_win_r3_portable: "⚠️ tregere kaldstart",
  dl_win_r4: "Legges til i Start-menyen",
  dl_win_r5: "Enkel avinstallering",
  dl_win_r5_portable: "❌ slett filen",
  dl_win_rec:
    "**Anbefaling:** bruk NSIS-installasjonsprogrammet for automatiske oppdateringer og raskere oppstart. Bruk den bærbare `.exe`-filen hvis du vil ha et alternativ uten installasjon og uten registeroppføringer.",
  dl_win_smartscreen_h4: "Advarsel fra Windows SmartScreen",
  dl_win_smartscreen_intro:
    "Ved første oppstart kan du se **«Windows har beskyttet PC-en»** eller **«Ukjent utgiver».** Dette gjelder både `Arroxy-win-x64-Setup.exe` og `Arroxy-win-x64-Portable.exe`. Arroxy er gratis og har åpen kildekode, og Windows-byggene er ikke kodesignert med et betalt sertifikat, og derfor flagger SmartScreen dem. Det betyr **ikke** automatisk at Arroxy er utrygt. Slik fortsetter du:",
  dl_win_smartscreen_step1: "Klikk på **Mer informasjon**.",
  dl_win_smartscreen_step2: "Klikk på **Kjør likevel**.",
  dl_win_smartscreen_official:
    "Last bare ned Arroxy fra den offisielle GitHub Releases-siden. Hvis du fikk filen fra et annet nettsted, eller noen sendte den til deg, sletter du den og laster ned en ny kopi fra den offisielle kilden. Kildekoden er offentlig, så du kan undersøke den eller bygge Arroxy selv hvis du foretrekker det.",
  dl_macos_h3: "Første oppstart på macOS",
  dl_macos_warning:
    "Arroxy er ikke kodesignert ennå, så macOS Gatekeeper kan vise advarselen om at appen er skadet ved første oppstart. Dette er forventet — det er ikke et tegn på faktisk filskade.",
  dl_macos_m1_h4: "Terminalmetode:",
  dl_macos_step1: "Dra `Arroxy.app` fra den monterte DMG-filen til `/Applications`.",
  dl_macos_step2:
    "Åpne Terminal og kjør `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Kjør `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Hvis appen ligger et annet sted, erstatter du `/Applications/Arroxy.app` med banen du installerte den til.",
  dl_macos_step5:
    "Skriv inn Mac-passordet ditt hvis `sudo` ber om det.",
  dl_macos_after:
    "Når karantenen er fjernet, åpnes Arroxy som vanlig.",
  dl_macos_m2_h4: "Terminalmetode:",
  dl_macos_note:
    "macOS-byggene lages via CI på Apple Silicon- og Intel-kjørere. Hvis du støter på problemer, [åpne en sak](../../issues) — tilbakemeldinger fra macOS-brukere former aktivt testsyklusen for macOS.",
  dl_linux_h3: "Første oppstart på Linux",
  dl_linux_intro:
    "AppImage-filer kjører direkte — ingen installasjon. Du må bare merke filen som kjørbar.",
  dl_linux_m1_text:
    "**Filbehandler:** høyreklikk på `.AppImage`-filen → **Egenskaper** → **Tillatelser** → slå på **Tillat kjøring av fil som program**, og dobbeltklikk deretter.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Hvis oppstarten fortsatt feiler, kjører du den uten å montere — ingen FUSE-pakke nødvendig:",
  dl_linux_targz_h4: "Vanlig tarball (ingen FUSE, ingen installasjon):",
  dl_linux_targz_text: "`.tar.gz`-bygget er den samme appen uten AppImage-innpakningen — pakk den ut hvor som helst og kjør den. Ingen installasjonsprogram og ingen FUSE-pakke nødvendig.",
  dl_linux_arch_note: "**Linux-nedlastingene på utgivelsessiden er bare for x86_64.** På ARM64-maskiner (Raspberry Pi, Asahi Linux) installeres Flatpak fortsatt, men feiler ved oppstart med `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Hvorfor du kan se en advarsel",
  dl_warning_p1:
    "Arroxy har åpen kildekode og er lisensiert under GPLv3. Windows- og macOS-byggene er **ikke kodesignert** — Apple Developer ID og Windows EV-kodesigneringssertifikater koster hver flere hundre dollar i året, noe et uavhengig prosjekt betaler av egen lomme. Uten disse signaturene advarer Windows SmartScreen og macOS Gatekeeper deg ved første oppstart. Advarslene betyr at *operativsystemet ditt ikke gjenkjenner utgiveren* — de betyr ikke at Arroxy er skadelig programvare.",
  dl_warning_p2:
    "Tre måter å verifisere Arroxy selv på, med økende grundighet:\n\n- **Les kildekoden.** Hver linje ligger på [GitHub](https://github.com/antonio-orionus/Arroxy), og du kan [bygge den fra kildekode](#tech).\n- **Kontroller SHA256.** Sammenlign filen din med den publiserte [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — se [Verifiser nedlastingen](#verify) nedenfor.\n- **Kjør en tredjepartsskanning.** Last opp filen til [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Første oppstart på Windows",
  shot_smartscreen_more_alt:
    "SmartScreen-dialogen «Windows har beskyttet PC-en» med lenken «Mer informasjon» uthevet",
  shot_smartscreen_run_alt:
    "SmartScreen-dialogen etter at Mer informasjon er utvidet, med knappen «Kjør likevel»",
  dl_win_defender_h4: "Hvis Windows Defender flagger eller fjerner filen",
  dl_win_defender_p:
    "Heuristikken i Defender flagger noen ganger usignerte NSIS-installasjonsprogrammer og bærbare Electron-apper som mistenkelige. Hvis Defender setter `Arroxy-win-x64-Setup.exe` eller `Arroxy-win-x64-Portable.exe` i karantene, gjenoppretter du den fra **Windows-sikkerhet → Virus- og trusselbeskyttelse → Beskyttelseshistorikk**, og legger deretter Arroxy-programfilen til som et tillatt element under **Administrer innstillinger → Legg til eller fjern ekskluderinger**. Som med SmartScreen er utløseren den manglende utgiversignaturen, ikke påvist skadelig programvare.",

  dl_macos_first_h3: "Første oppstart på macOS",
  dl_macos_intro:
    "Arroxys macOS-bygg er ad hoc-signert, men ikke notarisert av Apple, så Gatekeeper blokkerer den første oppstarten med *«Arroxy.app» ble ikke åpnet — Apple kunne ikke bekrefte at «Arroxy.app» er fri for skadelig programvare*. Det betyr at macOS ikke kan sjekke appen hos Apple, ikke at noe er galt med filene. Hvis du installerer med Homebrew, unngår du denne dialogen helt. Hvis du brukte DMG-filen, løser én Terminal-kommando det:",
  dl_macos_sequoia_h4: "Terminal-løsning for gjeldende macOS",
  dl_macos_sequoia_intro:
    "Bruk Terminal etter at du har kopiert Arroxy til Applications:",
  dl_macos_sequoia_step1:
    "Dra `Arroxy.app` fra den monterte DMG-filen til `/Applications`.",
  dl_macos_sequoia_step2:
    "Åpne Terminal og kjør disse to kommandoene:",
  dl_macos_sequoia_step3:
    "Kjør `open /Applications/Arroxy.app` for å starte Arroxy.",
  dl_macos_sequoia_step4:
    "Hvis appen ligger et annet sted, erstatter du `/Applications/Arroxy.app` med banen du installerte den til.",
  dl_macos_sonoma_h4: "Terminal-løsning for eldre macOS",
  dl_macos_sonoma_step1:
    "Dra `Arroxy.app` fra den monterte DMG-filen til `/Applications`.",
  dl_macos_sonoma_step2:
    "Åpne Terminal og fjern karantene fra `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Start Arroxy fra Terminal eller Finder etter at karantenen er fjernet.",
  dl_macos_damaged_h4:
    "Løsning for Gatekeeper-karantene",
  dl_macos_damaged_p:
    "Den første kommandoen fjerner karanteneattributtet macOS la på da filen ble lastet ned; den andre starter appen. Du trenger normalt ikke `sudo`, fordi kopien i `/Applications` tilhører deg — legg det bare til hvis du får en tilgangsfeil.",
  dl_macos_arch_note:
    "**Apple Silicon eller Intel:** på en Mac med M-serien (M1 / M2 / M3 / M4) laster du ned `arm64`-DMG-filen. På Intel-Mac-er laster du ned `x64`-DMG-filen. Feil bygg fungerer fortsatt via Rosetta, men er merkbart tregere.",

  dl_linux_first_h3: "Første oppstart på Linux",
  dl_linux_appimagelauncher:
    "**Valgfri skrivebordsintegrasjon:** installer [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) én gang, så blir hver AppImage du dobbeltklikker på registrert i oppstartsmenyen automatisk — ingen manuell `.desktop`-fil nødvendig.",

  dl_verify_h3: "Verifiser nedlastingen (SHA256)",
  dl_verify_intro:
    "Hver utgivelse publiserer en `SHA256SUMS`-fil ved siden av binærfilene. For å sjekke at nedlastingen din ikke ble ødelagt eller tuklet med underveis, beregner du hasjen til filen din lokalt og sammenligner den med linjen i `SHA256SUMS`. Åpne siden for siste utgivelse → **Assets** → last ned `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell eller ledetekst):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Vil du ha en skanning for skadelig programvare fra tredjepart? Last opp filen på [VirusTotal](https://www.virustotal.com). Noen få generiske heuristikkflagg fra mindre motorer er normalt for usignerte Electron-apper; utbredte funn fra store motorer ville vært en reell grunn til bekymring.",

  dl_pm_intro:
    "Foretrekker du en annen kanal? Disse fungerer også, og de holder følge med hver utgivelse.",

  privacy_p1:
    "Nedlastinger hentes direkte via [yt-dlp](https://github.com/yt-dlp/yt-dlp) fra YouTube til mappen du velger — ingenting rutes via en tredjepartsserver. Visningshistorikk, nedlastingshistorikk, nettadresser og filinnhold blir på enheten din.",
  privacy_p2:
    "Ingen telemetri — bare ett anonymt hjerteslag om dagen: appversjon, operativsystem, språk, installasjonskanal, land og omtrent hvor lenge siden Arroxy ble installert, slik at vi kan telle aktive og nye brukere. Ingen ID-er, nettadresser, videotitler, filbaner eller kontoinformasjon. Du kan slå det av i innstillingene.",
  privacy_p3:
    "Utforsk har sine egne pålogginger, atskilt fra nettleseren din, og Arroxy leser eller fyller aldri ut et påloggingsskjema — du skriver inn på nettstedets egen side. Nedlastinger kjører avlogget; bare når en feiler på en måte en konto kan rette opp, leser Arroxy påloggingen på nytt, beholder den i en midlertidig fil for den nedlastingen og sletter filen etterpå. Når du logger av Utforsk i innstillingene, glemmes de.",
  faq_q1: "Er det virkelig gratis?",
  faq_a1: "Ja — lisensiert under GPLv3, uten betalt nivå og uten funksjonsbegrensninger.",
  faq_q11: "Hvordan skiller Arroxy seg fra andre yt-dlp-grensesnitt?",
  faq_a11:
    "De fleste gratis yt-dlp-grensesnitt er innpakninger som bare tar imot en lenke. Arroxy legger til **Utforsk**, en nettleser bygget inn i appen som åpner YouTube eller et hvilket som helst annet nettsted: du surfer og laster ned uten å kopiere lenker, og du logger på der én gang for å laste ned private videoer, videoer for medlemmer og videoer med aldersgrense og listene dine Se senere og Likte videoer, uten eksport av informasjonskapsler. Arroxy bruker den påloggingen når YouTube ber deg bekrefte at du ikke er en robot, og den innebygde nettleseren henter YouTubes nedlastingstoken slik at nedlastinger ikke faller tilbake til færre formater. Se [Hvorfor Arroxy](#why).",
  faq_q2: "Hvilke videokvaliteter kan jeg laste ned?",
  faq_a2:
    "Alt YouTube leverer: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, pluss bare lyd. Strømmer med 60 fps og HDR bevares som de er, og trinn-for-trinn-nedlastingen lar deg velge AV1, VP9 eller H.264 i hver oppløsning.",
  faq_q3: "Kan jeg hente ut bare lyden som MP3?",
  faq_a3:
    "Ja. Velg *bare lyd* i formatmenyen og velg MP3, M4A/AAC, Opus eller WAV.",
  faq_q4: "Hvordan laster jeg ned videoer som krever en YouTube-konto?",
  faq_a4:
    "Logg på én gang i fanen Utforsk. Arroxy kan da laste ned private videoer og videoer for medlemmer som kontoen din kan se, videoer med aldersgrense hvis kontoen er aldersverifisert, og listene dine Se senere og Likte videoer. Den bruker påloggingen bare når en nedlasting feiler på en måte en konto kan rette opp; alt annet lastes ned som før. Dette er valget **Utforsk-pålogging**, oppført først og merket Anbefalt i innstillingene for informasjonskapsler, og Arroxy velger det for deg første gang du åpner Utforsk. Wikien til yt-dlp påpeker at [automatisering med pålogging kan føre til at en Google-konto flagges](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), så en sekundær konto er det tryggere valget.",
  faq_q5: "Vil det fortsette å fungere når YouTube endrer noe?",
  faq_a5:
    "yt-dlp oppdateres automatisk ved oppstart, og Arroxy leverer rettelser raskt når YouTube endrer noe. Når YouTube ber deg bekrefte at du ikke er en robot, prøver Arroxy også Utforsk-påloggingen din hvis du har logget på der, og informasjonskapsler fra en fil eller nettleseren din er tilgjengelige i innstillingene for informasjonskapsler.",
  faq_q6: "Hvilke språk er Arroxy tilgjengelig på?",
  faq_a6:
    "{{LANG_COUNT}} språk, rett ut av boksen: {{LANG_NAME_LIST}}. Arroxy oppdager språket i operativsystemet ditt automatisk ved første oppstart, og du kan bytte når som helst fra språkvelgeren i verktøylinjen. JSON-filene for språk under kjøring ligger i src/shared/i18n/locales/, og PO-katalogene for oversettere ligger i i18n/locales/ — åpne en PR på GitHub for å bidra.",
  faq_q7: "Må jeg installere noe annet?",
  faq_a7:
    "Nei. yt-dlp, ffmpeg og ffprobe lastes ned automatisk ved første oppstart og bufres på maskinen din. Etter det trengs ikke noe ekstra oppsett.",
  faq_q8: "Kan jeg laste ned spillelister eller hele kanaler?",
  faq_a8:
    "Ja — begge deler. Lim inn en spilleliste-URL eller en kanal-URL (f.eks. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); velg hvor mange oppføringer som skal skannes, og legg deretter hele listen i køen eller velg bestemte videoer. Filtre for datoområde kommer snart.",
  faq_q9: "macOS sier at «appen er skadet» — hva gjør jeg?",
  faq_a9:
    "Det er macOS Gatekeeper som blokkerer en usignert app, ikke faktisk skade. Se [første oppstart på macOS](#macos-first-launch) for Terminal-kommandoene som fjerner karantenen og starter Arroxy.",
  faq_q10: "Er det lovlig å laste ned YouTube-videoer?",
  faq_a10:
    "For personlig, privat bruk er det generelt akseptert i de fleste jurisdiksjoner. Du er selv ansvarlig for å overholde YouTubes [bruksvilkår](https://www.youtube.com/t/terms) og de lokale opphavsrettslovene.",
  plan_intro: "Fortsatt planlagt — omtrent i prioritert rekkefølge:",
  plan_col1: "Funksjon",
  plan_col2: "Beskrivelse",
  plan_r1_name: "**Spilleliste- og kanalfiltre**",
  plan_r1_desc: "Filtre for datoområde når en spilleliste eller kanal listes opp",
  plan_r2_name: "**Preferanser for YouTube-lydspor**",
  plan_r2_desc:
    "Angi en preferanse for talespråk i hele appen, med overstyringer per profil når YouTube tilbyr flere lydspor",
  plan_r3_name: "**Sterkere gjenoppretting ved nytt forsøk**",
  plan_r3_desc:
    "En ny gjenopprettingsløype for nedlastinger som avbrytes av upålitelige eller problematiske internettforbindelser",
  plan_r4_name: "**Full nedlastingsbehandler som panel**",
  plan_r4_desc:
    "Gjør køpanelet om til en fyldigere behandler, inkludert endring av målmapper for elementer i køen",
  plan_r5_name: "**Planlagte nedlastinger**",
  plan_r5_desc: "Start en kø til et bestemt tidspunkt (kjøringer over natten)",
  plan_r9_name: "**AUR-pakke**",
  plan_r9_desc: "Installer på Arch Linux og Omarchy med `yay -S arroxy-bin`",
  plan_cta:
    "Har du en funksjon i tankene? [Åpne en forespørsel](../../issues) — innspill fra fellesskapet former prioriteringen.",
  tech_content: TECH_CONTENT,
  support_h2: "Støtt Arroxy",
  support_note: "Arroxy er gratis og lisensiert under GPLv3 — ingen reklame, ingen telemetri, ingen betalt nivå. Hvis det sparer deg tid, kan du støtte utviklingen med Bitcoin, Tron eller Ethereum: adressene står i [DONATE.md](DONATE.md), som er den eneste offisielle kilden til dem. Arroxy vil aldri sende deg en adresse på e-post eller direktemelding. Å gi repoet en stjerne, rapportere feil og forbedre oversettelser hjelper like mye.",
  tos_h2: "Bruksvilkår",
  tos_note:
    "Arroxy er et verktøy kun for personlig, privat bruk. Du er alene ansvarlig for at nedlastingene dine overholder YouTubes [bruksvilkår](https://www.youtube.com/t/terms) og opphavsrettslovene i din jurisdiksjon. Ikke bruk Arroxy til å laste ned, gjengi eller distribuere innhold du ikke har rett til å bruke. Utviklerne er ikke ansvarlige for misbruk.",
  footer_credit:
    'GPLv3 · Laget med omtanke av <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
