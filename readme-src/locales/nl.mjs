const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — platformonafhankelijke desktopschil
- **React 19** + **TypeScript** — gebruikersinterface
- **Tailwind CSS v4** — opmaak
- **Zustand** — statusbeheer
- **yt-dlp** + **ffmpeg** — download- en muxengine (beide tijdens runtime opgehaald: yt-dlp wordt actueel gehouden, ffmpeg/ffprobe worden eenmalig geïnstalleerd en blijven behouden bij updates)
- **Vite** + **electron-vite** — buildtools
- **Vitest** + **Playwright** — unit- en end-to-endtests

</details>

<details>
<summary><strong>Zelf bouwen uit de broncode</strong></summary>

### Vereisten — alle platforms

| Tool    | Versie | Installatie |
| ------- | ------- | ------- |
| Git     | elke     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` of \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` of \`package.json\` \`packageManager\` |

Aanbevolen: installeer \`mise\` en voer daarna \`mise install\` uit in de checkout. Zonder mise activeer je Node.js uit \`.node-version\` en Bun uit \`package.json\` handmatig vóór \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Voor native herbouwen zijn mogelijk Visual Studio Build Tools en Python nodig.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Voer na het klonen \`mise trust && mise install\` uit in de checkout. Als je shell al \`fnm\`, \`nvm\` of een Bun van Homebrew gebruikt, activeer mise dan in \`~/.zshrc\` zodat Arroxy Node.js 24.21.0 en Bun 1.4.2 krijgt:

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

### Klonen en uitvoeren

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Een distribueerbare versie bouwen

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` installeert afhankelijkheden, herbouwt de afhankelijkheden van de Electron-app, controleert Electron, bereidt ingebouwde ffmpeg/ffprobe voor op ontwikkeling en installeert Playwright Chromium. Releasebuilds beheren yt-dlp, ffmpeg en ffprobe tijdens runtime in de appgegevensmap; geen van die drie zit in het installatieprogramma.

</details>`;

export const nl = {
  icon_alt: "Arroxy-mascotte",
  hero_image_alt: "Plak een link of surf gewoon rond. Het URL-scherm en de ingebouwde browser van Arroxy, met een download die bezig is.",
  hero_banner_line1: "Plak een link,",
  hero_banner_line2: "of surf gewoon rond.",
  title:
    "Arroxy — Gratis open-source downloader voor YouTube (+ 2000 sites) met ingebouwde browser, voor Windows, macOS & Linux",
  read_in_label: "Lees in:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "Licentie",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "Talen",
  badge_website_alt: "Website",
  discord_badge_text: "Word lid van de Discord-community",
  discord_badge_encoded: "Word%20lid%20van%20de%20Discord%2Dcommunity",
  hero_desc:
    "Download video’s, Shorts, kanalen, podcasts of audiotracks van **YouTube en 2000+ ondersteunde sites** — tot 8K HDR met 60 fps, als MP3 / AAC / Opus, of alleen het deel dat je nodig hebt. **Surf op YouTube of een andere site direct in Arroxy** op het tabblad Verkennen en download de video, afspeellijst of het kanaal waar je bent; meld je daar aan om video’s te downloaden die je eigen account al kan bekijken. Draait lokaal op Windows, macOS en Linux. **Geen advertenties, geen overbodige software, geen upsells.**",
  cta_latest: "↓ Nieuwste release installeren",
  cta_website: "Website",
  website_url: "https://arroxy.com/",
  star_cta: "Bespaart Arroxy je tijd? Met een ⭐ help je anderen het te vinden.",
  ai_notice: "> 🌐 Deze vertaling is tot stand gekomen met behulp van AI. De [Engelse README](README.md) is de leidende bron. Een fout gevonden? [Open een PR](../../pulls).",
  intro_what_is:
    "**Wat is Arroxy?** Arroxy is een gratis, opensource desktop-GUI die video’s, audio, afspeellijsten en ondertitels downloadt van YouTube en 2000+ andere sites die [yt-dlp](https://github.com/yt-dlp/yt-dlp) ondersteunt. Het draait op Windows 10/11, macOS 13+ (Intel + Apple Silicon) en Linux (AppImage, Flatpak, tar.gz). Onder GPLv3-licentie. Geen advertenties, geen gebruikslimieten. Verspreid via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage en directe download.",
  intro_key_difference:
    "**Het belangrijkste verschil: een ingebouwde browser.** De meeste gratis YouTube-downloaders zijn dunne yt-dlp-wrappers: een URL-vak en een formatmenu, zonder eigen browser. Arroxy heeft er een, het **tabblad Verkennen**. Je surft op YouTube of een andere site binnen de app en downloadt de video, afspeellijst of het kanaal waar je bent, of klikt met de rechtermuisknop op een willekeurige link. Meld je één keer aan in Verkennen, dan gebruiken downloads waarvoor een account nodig is die aanmelding: je privévideo’s, je lijsten Later bekijken en Leuk gevonden en andere video’s die je account al kan bekijken, zonder cookies te exporteren. Meld je daar ook aan op andere sites, dan gebruiken hun downloads die aanmelding als dat nodig is. Details: [Waarom Arroxy](#why-explore).",
  last_updated: "Laatst bijgewerkt: {{LAST_UPDATED}}.",
  toc_heading: "Inhoud",
  why_h2: "Waarom Arroxy",
  features_h2: "Functies",
  dl_h2: "Installatie en eerste start",
  privacy_h2: "Privacy",
  faq_h2: "Veelgestelde vragen",
  roadmap_h2: "Roadmap",
  tech_h2: "Gebouwd met",
  why_intro: "Een vergelijking naast elkaar met de meest voorkomende alternatieven:",
  why_r1: "Gratis, geen premiumabonnement",
  why_r2: "Open source",
  why_r3: "Alleen lokale verwerking",
  why_r5: "Geen gebruikslimieten",
  why_r6: "Platformonafhankelijke desktop-app",
  why_r7: "Ondertitels + SponsorBlock",
  why_r8: "Ingebouwde browser (surfen, aanmelden, downloaden)",
  why_r9:
    "Video’s die je eigen account kan bekijken, zonder cookies te exporteren",
  why_table_note:
    "⚠️ = gedeeltelijk, of alleen in een betaald abonnement. De aanmelding in de app voor privévideo’s van 4K Video Downloader is een betaalde functie; de meeste gratis yt-dlp-GUI’s accepteren alleen een cookiebestand of lezen de cookies van je webbrowser.",
  why_summary:
    "Arroxy is gebouwd voor één ding: een schoon lokaal bestand, of je nu een URL plakt of de video in Verkennen vindt. Geen upsells, geen gegevensverzameling.",
  why_explore_h3: "Wat een gewone yt-dlp-wrapper niet kan: het tabblad Verkennen",
  why_explore_intro:
    "De meeste gratis YouTube-downloaders zijn een URL-vak bovenop yt-dlp. Arroxy gebruikt ook yt-dlp, maar heeft daarnaast **Verkennen**, een in de app ingebouwde browser die YouTube of elke andere site opent. Verkennen voegt toe wat een URL-vak niet kan:",
  why_explore_1:
    "**Video’s die je account kan bekijken, zonder cookies te exporteren** — je privévideo’s, je lijsten Later bekijken en Leuk gevonden, video’s met leeftijdsbeperking op een leeftijdsgeverifieerd account en pagina’s op andere sites waarvoor je moet zijn aangemeld. Een gewone wrapper heeft een export van cookies.txt nodig of leest de cookies van je webbrowser. In Arroxy meld je je één keer aan in Verkennen en de rest gaat vanzelf",
  why_explore_4:
    "**Geen links kopiëren** — vind een video, afspeellijst of kanaal in Verkennen en download met één klik, of klik met rechts op een link op de pagina",
  why_explore_5:
    "**Advertentieblokkering wanneer je wilt** — met één klik op het schild worden advertenties en trackers op de pagina’s van Verkennen geblokkeerd",
  feat_explore_h3: "Verkennen: surf op het web in Arroxy",
  feat_explore_1:
    "**Tabblad Verkennen** — surf op YouTube of een andere site in Arroxy en download wat je vindt zonder links te kopiëren. **Downloaden · *je profiel*** zet de video, afspeellijst of het kanaal waar je naar kijkt in de wachtrij; met de pijl ernaast wissel je van profiel en de toverstaf opent de stapsgewijze download om formaten, ondertitels en meer te kiezen",
  feat_explore_6:
    "**Klik met rechts om te downloaden** — klik met rechts op een video-, afspeellijst- of kanaallink in Verkennen om te downloaden met je profiel, kies een ander profiel bij **Downloaden met**, open de stapsgewijze download of kopieer de link. Je hoeft niet eerst elke video te openen",
  feat_explore_7:
    "**Compacte weergave** — met één klik in de werkbalk van Verkennen verhuizen de tabbladen van Arroxy daarheen en krijgt de pagina meer ruimte",
  feat_explore_2:
    "**Adresbalk** — typ om op YouTube te zoeken, of voer een willekeurig webadres in om die site te openen",
  feat_explore_3:
    "**Downloads waarvoor een account nodig is** — meld je één keer aan in Verkennen en Arroxy kan video’s downloaden die je account kan bekijken: je privévideo’s, video’s met leeftijdsbeperking als het account leeftijdsgeverifieerd is, en je lijsten Later bekijken en Leuk gevonden. Meld je daar ook aan bij andere sites, dan gebruiken hun downloads die aanmelding wanneer dat nodig is. Arroxy downloadt eerst nog steeds afgemeld en gebruikt je aanmelding in Verkennen alleen wanneer een download mislukt op een manier die een account kan oplossen",
  feat_explore_4:
    "**Gebruik een tweede account** — het eerste scherm van Verkennen legt uit waarom: downloaden met een account brengt enig risico mee dat dat account wordt beperkt. Meld je wanneer je wilt af bij Verkennen via Instellingen om je aanmeldingen te vergeten",
  feat_explore_5:
    "**Advertentieblokkering** — standaard uit. Met één klik op het schild in de werkbalk van Verkennen worden advertenties en trackers op de pagina’s geblokkeerd, zonder gevolgen voor downloads. YouTube kan bij aangemelde accounts bezwaren hebben tegen advertentieblokkers",
  feat_quality_h3: "Kwaliteit en formaten",
  feat_quality_1: "Tot **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Hoge framerate en HDR** ongewijzigd behouden — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — exporteer alleen audio als MP3, M4A/AAC, Opus of WAV. Kies bij interactieve downloads de oorspronkelijke surround-/Dolby-tracks van de bron (AC-3, E-AC-3, 5.1, DRC) wanneer beschikbaar, of stel een algemene standaard **Surround / Dolby verkiezen** in",
  feat_quality_4:
    "**Profielen met een doel** — *Beste beeld* (AV1 · VP9) of *Smart-tv* (MP4 · H.264), opgeslagen als Automatisch, MP4, MKV of WebM zonder opnieuw te coderen. HDR is *Automatisch* (alleen wanneer je scherm het kan tonen), *SDR* of *HDR*",
  feat_quality_5:
    "**Elke codec bij elke resolutie** — de stapsgewijze download toont AV1, VP9 en H.264 naast elkaar bij elke resolutie, zodat je kunt kiezen wat je tv of editor afspeelt",
  feat_quality_6:
    "**Weet wat een stream echt is** — formaten die YouTube met AI heeft opgeschaald, met AI nagesynchroniseerde audiotalen, streams met verbeterde bitrate, 360°-video’s en beschadigde of van watermerk voorziene kopieën worden gemarkeerd. Profielen slaan met AI opgeschaalde streams over, tenzij je ze toestaat",
  feat_privacy_h3: "Privacy en controle",
  feat_privacy_1:
    "100% lokale verwerking — downloads gaan rechtstreeks van YouTube naar je schijf",
  feat_privacy_2: "**Open source** — elke regel controleerbaar, GPLv3-licentie",
  feat_privacy_3: "Bestanden worden direct opgeslagen in de map die je kiest",
  feat_workflow_h3: "Werkwijze",
  feat_workflow_12:
    "**Algemene downloadsneltoets** — kopieer een link in een willekeurige app en druk op `Ctrl+Shift+D` (`Cmd+Shift+D` op macOS); Arroxy zet hem met je actieve profiel in de wachtrij zonder het venster te openen, en een melding bevestigt dit. Standaard aan, aanpasbaar",
  feat_workflow_1:
    "**Flexibele startmodi** — kies een begeleide enkele download, een kiezer voor afspeellijsten/kanalen, meerdere URL’s plakken, Snel downloaden met opgeslagen standaarden, of surf en download vanuit Verkennen",
  feat_workflow_2:
    "**Centrale downloadwachtrij** — elke enkele, afspeellijst-, bulk- of snelle taak komt op één plek terecht voor voortgang, pauzeren, hervatten, annuleren, opnieuw proberen en prioriteitsbeheer",
  feat_workflow_3:
    "**Klembordbewaking** — kopieer een videolink en die vult het URL-veld in zodra je terugkomt in Arroxy, met **Ongedaan maken** als je het niet zo bedoelde. Terwijl Arroxy bezig is, wacht de link tot je terug bent op het tabblad met de URL (schakel het uit in Instellingen)",
  feat_workflow_4:
    "**URL’s automatisch opschonen** — verwijdert trackingparameters (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) en pakt `youtube.com/redirect`-links uit",
  feat_workflow_5:
    "**Systeemvakmodus** — als je het venster sluit, blijven downloads op de achtergrond doorlopen",
  feat_workflow_6:
    "**{{LANG_COUNT}} talen** — detecteert automatisch de systeemtaal, op elk moment te wisselen",
  feat_workflow_7:
    "**Synchronisatie van afspeellijsten** — scan een afspeellijst opnieuw ten opzichte van een lokale map om reeds gedownloade video’s over te slaan; genereert een `.m3u`-afspeellijstbestand dat wordt bijgewerkt terwijl elke video wordt gedownload",
  feat_workflow_8:
    "**Snelheids- en tempobesturing** — beperk de downloadbandbreedte, stel in hoeveel delen van een video tegelijk worden gedownload en voeg verzoekvertragingen toe met voorinstellingen (*Uit · Gebalanceerd · Voorzichtig · Aangepast*)",
  feat_workflow_9:
    "**Sjablonen voor bestandsnamen** — geef downloads een naam zoals jij wilt met `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` en `{playlist_index}`, algemeen of per downloadprofiel",
  feat_workflow_10:
    "**Downloads tegelijk en automatisch opnieuw proberen** — kies hoeveel downloads uit de wachtrij tegelijk lopen en laat Arroxy een download opnieuw proberen die een netwerk- of serverprobleem had, met steeds langere wachttijd voor elke poging",
  feat_workflow_11:
    "**Profielen per afspeellijstitem** — wijs elke video in een afspeellijst een eigen downloadprofiel toe in plaats van één instelling voor de hele lijst, zodat je in één keer sommige in volle kwaliteit kunt archiveren en de rest alleen als audio kunt opslaan",
  feat_workflow_13:
    "**Snel downloaden werkt op de achtergrond** — de link verschijnt meteen in Downloads en wordt daar voorbereid, een melding met **Bekijken** bevestigt dit en het URL-veld wordt leeggemaakt voor de volgende link. Start er zoveel als je wilt terwijl eerdere worden voorbereid",
  feat_workflow_14:
    "**Downloads laat zien wat jou nodig heeft** — als Arroxy een link niet kan lezen, legt de rij uit waarom en biedt de oplossing aan: Opnieuw proberen, cookies inschakelen of aanmelden in Verkennen. Met cookies uit probeert **Aanmelden via Verkennen** het voor je opnieuw zodra je bent aangemeld. Een afspeellijst die langer is dan je laadlimiet wacht op zijn rij tot je alles, de eerste of een controle kiest. Het tabblad Downloads telt de rijen die op jou wachten",
  feat_workflow_15:
    "**Download slechts een deel van een video** — kies een begin en einde, of een hoofdstuk, op het scherm Formaat en Arroxy slaat alleen dat bereik op, met het bereik achter de video-id in de naam. Knippen gebeurt op het dichtstbijzijnde keyframe; schakel exact knippen in om opnieuw te coderen",
  feat_workflow_16:
    "**Voltooide downloads verwijderen** — optioneel: een voltooide download verdwijnt 5 seconden later uit de lijst. De bestanden blijven op schijf staan en mislukte downloads blijven in de lijst",
  feat_workflow_17:
    "**Grootte en Ontbreekt in Downloads** — een sorteerbare kolom **Grootte** toont hoeveel ruimte elke download inneemt en **Ontbreekt** markeert bestanden die buiten Arroxy zijn verplaatst of verwijderd",
  feat_workflow_18:
    "**Aurora of Minimal, donker of licht** — glazen panelen boven een bewegende hemel, of rustige effen vlakken; wissel via de voettekst. Computers zonder grafische versnelling krijgen automatisch Minimal",
  feat_workflow_19:
    "**Mac-menubalk** — open op macOS Instellingen (`Cmd+,`), stel de downloadsnelheidslimiet in, wissel van stijl en thema, en open logboeken of sla een diagnosebestand op via de menubalk",
  feat_workflow_20:
    "**Wijzig een profiel vanuit elke download** — pas een download aan en werk daarna het profiel bij waarmee hij begon (met een voorbeeld van wat er verandert) of sla de instellingen op als nieuw profiel. Bij het wisselen van profiel wordt gevraagd of je je wijzigingen wilt behouden",
  feat_post_h3: "Ondertitels en nabewerking",
  feat_post_1:
    "**Ondertitels** in SRT, VTT of ASS — handmatig of automatisch gegenereerd, in elke beschikbare taal",
  feat_post_2:
    "Opslaan naast de video, insluiten in `.mkv` of ordenen in een submap `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — sponsors, intro’s, outro’s en eigen promoties overslaan of als hoofdstuk markeren",
  feat_post_4:
    "**Ingesloten metagegevens** — titel, uploaddatum, kanaal, beschrijving, miniatuur en hoofdstukmarkeringen worden in het bestand geschreven",
  feat_post_5:
    "**Batches met alleen ondertitels** — plak een lijst met URL’s of open een afspeellijst, kies Ondertitels en krijg alleen de ondertitelbestanden van elke video",
  feat_sites_h3: "YouTube + 2000 sites",
  feat_sites_1:
    "**YouTube, volledig** — Video’s, Shorts, kanalen, afspeellijsten, YouTube Music en podcasts worden als volwaardige bronnen behandeld",
  feat_sites_2:
    "**2000+ andere sites** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable en nog veel meer",
  feat_sites_3:
    "**Alleen audio en ondertitels** werken op elke ondersteunde site, niet alleen op YouTube",
  feat_sites_4:
    "Als een site verandert, brengt yt-dlp wekelijks oplossingen uit en werkt Arroxy het programma bij het opstarten automatisch bij",
  shot1_cap:
    "<b>Startscherm Snel downloaden</b><br/>Plak een URL en haal hem direct binnen met je actieve profiel",
  shot2_cap:
    "<b>Herbruikbare downloadprofielen</b><br/>Sla voorinstellingen voor formaat, kwaliteit en uitvoer op — hergebruik ze per download",
  shot3_cap:
    "<b>Audiotracks in meerdere talen</b><br/>Kies de exacte audiotaal die een video meelevert",
  shot4_cap:
    "<b>Surround- / Dolby-audio</b><br/>5.1- en Dolby-tracks worden gedetecteerd en behouden",
  shot5_cap:
    "<b>Modus Meerdere URL’s</b><br/>Plak een lijst, verwijder automatisch duplicaten en zet ze allemaal tegelijk in de wachtrij",
  shot6_cap:
    "<b>Parallelle downloadwachtrij</b><br/>Meerdere downloads tegelijk met live voortgang",
  hotkey_fig_alt:
    "Algemene downloadsneltoets van Arroxy — Ctrl+Shift+D op Windows en Linux, Cmd+Shift+D op macOS, die de gekopieerde link direct in de downloadwachtrij zet",
  hotkey_fig_cap:
    "<b>Algemene downloadsneltoets</b><br/>Kopieer overal een link, druk één keer — hij komt in de wachtrij en begint met downloaden",
  shot7_cap:
    "<b>Profielen per afspeellijstitem</b><br/>Geef elke video een eigen profiel — archiveer sommige in 4K, bewaar de rest alleen als audio",
  shot8_cap:
    "<b>Verkennen</b><br/>Surf op YouTube of een andere site in Arroxy en download de pagina waar je bent met je actieve profiel",
  shot9_cap:
    "<b>Eerste scherm van Verkennen</b><br/>Een kort overzicht van Verkennen, en waarom een tweede account de veiligere aanmelding is",
  shot10_cap:
    "<b>Downloads laat zien wat jou nodig heeft</b><br/>Links worden op de achtergrond voorbereid; een mislukte biedt zijn oplossing aan, een lange afspeellijst wacht op jouw keuze",
  shot11_cap:
    "<b>Download slechts een deel van een video</b><br/>Kies een begin en einde, of een hoofdstuk — Arroxy slaat alleen dat bereik op",
  shot12_cap:
    "<b>Profieleditor</b><br/>Stem een profiel af: bestandstype, resolutie, ondertitels, bestemming, sjabloon voor bestandsnaam en meer",
  shot13_cap:
    "<b>Donker of licht, glas of effen</b><br/>Vier uiterlijken om uit te kiezen: glazen panelen boven een bewegende hemel of rustige effen vlakken, elk in donker en licht",
  shot14_cap:
    "<b>8K HDR met 60 fps</b><br/>Elke resolutie, codec en HDR-stream die een video biedt, naast elkaar",
  dl_platform_col: "Platform",
  dl_format_col: "Directe download",
  dl_oneline_note:
    "Builds zijn alleen voor x86_64. Geen `curl`? Vervang `curl -fsSL` door `wget -qO-`.",
  dl_win_scoop:
    "Liever Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Installatieprogramma (NSIS) of draagbare `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` of `.flatpak` (in een sandbox)",
  dl_grab: "Alle releasebestanden →",
  dl_pkg_h3: "Installeren via een pakketbeheerder",
  dl_channel_col: "Kanaal",
  dl_command_col: "Opdracht",
  dl_win_h3: "Windows: installatieprogramma versus draagbaar",
  dl_win_col_installer: "NSIS-installatieprogramma",
  dl_win_col_portable: "Draagbare `.exe`",
  dl_win_r1: "Installatie vereist",
  dl_win_r1_installer: "Ja",
  dl_win_r1_portable: "Nee — overal uit te voeren",
  dl_win_r2: "Automatische updates",
  dl_win_r2_installer: "✅ in de app",
  dl_win_r2_portable: "❌ handmatig downloaden",
  dl_win_r3: "Opstartsnelheid",
  dl_win_r3_installer: "✅ sneller",
  dl_win_r3_portable: "⚠️ tragere koude start",
  dl_win_r4: "Voegt toe aan het Startmenu",
  dl_win_r5: "Eenvoudig te verwijderen",
  dl_win_r5_portable: "❌ verwijder het bestand",
  dl_win_rec:
    "**Aanbeveling:** gebruik het NSIS-installatieprogramma voor automatische updates en een snellere start. Gebruik de draagbare `.exe` voor een optie zonder installatie en zonder register.",
  dl_win_smartscreen_h4: "SmartScreen-waarschuwing van Windows",
  dl_win_smartscreen_intro:
    'Bij de eerste start zie je mogelijk **„Windows heeft uw pc beveiligd”** of **„Onbekende uitgever”**. Dit geldt voor zowel `Arroxy-win-x64-Setup.exe` als `Arroxy-win-x64-Portable.exe`. Arroxy is gratis en open source en de Windows-builds zijn niet ondertekend met een betaald certificaat, daarom markeert SmartScreen ze. Het betekent **niet** automatisch dat Arroxy onveilig is. Om door te gaan:',
  dl_win_smartscreen_step1: "Klik op **Meer info**.",
  dl_win_smartscreen_step2: "Klik op **Toch uitvoeren**.",
  dl_win_smartscreen_official:
    "Download Arroxy alleen van de officiële GitHub Releases-pagina. Als je het bestand van een andere website hebt of iemand het naar je heeft gestuurd, verwijder het dan en download een nieuwe kopie van de officiële bron. De broncode is openbaar, dus je kunt hem inspecteren of Arroxy desgewenst zelf bouwen.",
  dl_macos_h3: "Eerste start op macOS",
  dl_macos_warning:
    "Arroxy is nog niet ondertekend, dus macOS Gatekeeper kan bij de eerste start de waarschuwing voor een beschadigde app tonen. Dit is normaal — het wijst niet op echte bestandsschade.",
  dl_macos_m1_h4: "Terminalmethode:",
  dl_macos_step1: "Sleep `Arroxy.app` uit de gekoppelde DMG naar `/Applications`.",
  dl_macos_step2:
    "Open Terminal en voer `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` uit.",
  dl_macos_step3: "Voer `open /Applications/Arroxy.app` uit.",
  dl_macos_step4:
    "Als het pad van de app anders is, vervang dan `/Applications/Arroxy.app` door het pad waar je hem hebt geïnstalleerd.",
  dl_macos_step5:
    "Voer je Mac-wachtwoord in als `sudo` erom vraagt.",
  dl_macos_after:
    "Zodra de quarantaine is opgeheven, opent Arroxy normaal.",
  dl_macos_m2_h4: "Terminalmethode:",
  dl_macos_note:
    "macOS-builds worden via CI op Apple Silicon- en Intel-runners gemaakt. Loop je tegen problemen aan, [open dan een issue](../../issues) — feedback van macOS-gebruikers bepaalt actief de macOS-testcyclus.",
  dl_linux_h3: "Eerste start op Linux",
  dl_linux_intro:
    "AppImages draaien direct — geen installatie. Je hoeft het bestand alleen als uitvoerbaar te markeren.",
  dl_linux_m1_text:
    "**Bestandsbeheer:** klik met rechts op de `.AppImage` → **Eigenschappen** → **Rechten** → schakel **Bestand uitvoeren als programma toestaan** in en dubbelklik daarna.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Als starten nog steeds mislukt, voer het dan uit zonder te koppelen — geen FUSE-pakket nodig:",
  dl_linux_targz_h4: "Gewoon tarball (geen FUSE, geen installatie):",
  dl_linux_targz_text: "De `.tar.gz`-build is dezelfde app zonder de AppImage-verpakking — pak hem ergens uit en voer hem uit. Geen installatieprogramma en geen FUSE-pakket nodig.",
  dl_linux_arch_note: "**De Linux-downloads op de releasepagina zijn alleen voor x86_64.** Op ARM64-machines (Raspberry Pi, Asahi Linux) installeert de Flatpak nog wel, maar mislukt het starten met `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Waarom je een waarschuwing kunt zien",
  dl_warning_p1:
    "Arroxy is open source met een GPLv3-licentie. De Windows- en macOS-builds zijn **niet ondertekend** — een Apple Developer ID en Windows EV-codeondertekeningscertificaten kosten elk honderden dollars per jaar, wat een indieproject uit eigen zak betaalt. Zonder die handtekeningen waarschuwen Windows SmartScreen en macOS Gatekeeper je bij de eerste start. De waarschuwingen betekenen dat *je besturingssysteem de uitgever niet herkent* — ze betekenen niet dat Arroxy malware is.",
  dl_warning_p2:
    "Drie manieren om Arroxy zelf te controleren, in oplopende striktheid:\n\n- **Lees de broncode.** Elke regel staat op [GitHub](https://github.com/antonio-orionus/Arroxy) en je kunt [hem zelf bouwen](#tech).\n- **Controleer de SHA256.** Vergelijk je bestand met de gepubliceerde [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — zie hieronder [Controleer je download](#verify).\n- **Voer een scan door een derde partij uit.** Upload het bestand naar [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Eerste start op Windows",
  shot_smartscreen_more_alt:
    'SmartScreen-dialoog „Windows heeft uw pc beveiligd” met de link „Meer info” gemarkeerd',
  shot_smartscreen_run_alt:
    'SmartScreen-dialoog na het uitklappen van Meer info, met de knop „Toch uitvoeren”',
  dl_win_defender_h4: "Als Windows Defender het bestand markeert of verwijdert",
  dl_win_defender_p:
    "De heuristiek van Defender markeert niet-ondertekende NSIS-installatieprogramma’s en draagbare Electron-apps soms als verdacht. Als Defender `Arroxy-win-x64-Setup.exe` of `Arroxy-win-x64-Portable.exe` in quarantaine plaatst, herstel het dan via **Windows-beveiliging → Virus- en bedreigingsbeveiliging → Beveiligingsgeschiedenis** en voeg het uitvoerbare bestand van Arroxy daarna toe als toegestaan item onder **Instellingen beheren → Uitsluitingen toevoegen of verwijderen**. Net als bij SmartScreen is de oorzaak de ontbrekende uitgeversondertekening, niet gedetecteerde malware.",

  dl_macos_first_h3: "Eerste start op macOS",
  dl_macos_intro:
    "De macOS-builds van Arroxy zijn ad-hoc ondertekend maar niet door Apple genotariseerd, dus Gatekeeper blokkeert de eerste start met *„Arroxy.app” is niet geopend — Apple kan niet controleren of „Arroxy.app” vrij is van malware*. Dat betekent dat macOS de app niet bij Apple kan controleren, niet dat er iets mis is met de bestanden. Installeren met Homebrew voorkomt deze dialoog volledig. Als je de DMG hebt gebruikt, lost één Terminal-opdracht het op:",
  dl_macos_sequoia_h4: "Terminal-oplossing voor huidige macOS",
  dl_macos_sequoia_intro:
    "Gebruik Terminal nadat je Arroxy naar Programma’s hebt gekopieerd:",
  dl_macos_sequoia_step1:
    "Sleep `Arroxy.app` uit de gekoppelde DMG naar `/Applications`.",
  dl_macos_sequoia_step2:
    "Open Terminal en voer deze twee opdrachten uit:",
  dl_macos_sequoia_step3:
    "Voer `open /Applications/Arroxy.app` uit om Arroxy te starten.",
  dl_macos_sequoia_step4:
    "Als het pad van de app anders is, vervang dan `/Applications/Arroxy.app` door het pad waar je hem hebt geïnstalleerd.",
  dl_macos_sonoma_h4: "Terminal-oplossing voor oudere macOS",
  dl_macos_sonoma_step1:
    "Sleep `Arroxy.app` uit de gekoppelde DMG naar `/Applications`.",
  dl_macos_sonoma_step2:
    "Open Terminal en verwijder de quarantaine van `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Start Arroxy vanuit Terminal of Finder nadat de quarantaine is opgeheven.",
  dl_macos_damaged_h4:
    "Oplossing voor Gatekeeper-quarantaine",
  dl_macos_damaged_p:
    "De eerste opdracht verwijdert het quarantaineattribuut dat macOS bij het downloaden aan het bestand koppelde; de tweede start de app. Normaal heb je geen `sudo` nodig, omdat de kopie in `/Applications` van jou is — voeg het alleen toe als je een rechtenfout krijgt.",
  dl_macos_arch_note:
    "**Apple Silicon versus Intel:** download op een Mac uit de M-serie (M1 / M2 / M3 / M4) de `arm64`-DMG. Download op Intel-Macs de `x64`-DMG. De verkeerde build werkt nog via Rosetta, maar is merkbaar trager.",

  dl_linux_first_h3: "Eerste start op Linux",
  dl_linux_appimagelauncher:
    "**Optionele desktopintegratie:** installeer eenmalig [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), en elke AppImage waarop je dubbelklikt wordt automatisch in je startmenu geregistreerd — geen handmatig `.desktop`-bestand nodig.",

  dl_verify_h3: "Controleer je download (SHA256)",
  dl_verify_intro:
    "Elke release publiceert een `SHA256SUMS`-bestand naast de binaire bestanden. Om te controleren of je download onderweg niet is beschadigd of gemanipuleerd, bereken je lokaal de hash van je bestand en vergelijk je die met de regel in `SHA256SUMS`. Open de pagina van de nieuwste release → **Assets** → download `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell of Opdrachtprompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Wil je een malwarescan door een derde partij? Upload het bestand op [VirusTotal](https://www.virustotal.com). Een handvol meldingen op basis van algemene heuristiek van kleine engines is normaal voor niet-ondertekende Electron-apps; wijdverspreide detecties door grote engines zouden een echte reden tot zorg zijn.",

  dl_pm_intro:
    "Liever een ander kanaal? Die werken ook, en ze lopen mee met elke release.",

  privacy_p1:
    "Downloads worden rechtstreeks via [yt-dlp](https://github.com/yt-dlp/yt-dlp) van YouTube naar de map van je keuze opgehaald — niets loopt via een server van een derde partij. Kijkgeschiedenis, downloadgeschiedenis, URL’s en bestandsinhoud blijven op je apparaat.",
  privacy_reports:
    "Geen tracking — één anonieme heartbeat per dag (app-versie, besturingssysteem, taal, installatiekanaal, land en ongeveer hoe lang geleden Arroxy is geïnstalleerd), zodat we actieve en nieuwe gebruikers kunnen tellen, en wanneer Arroxy yt-dlp en FFmpeg downloadt of bijwerkt, een anonieme melding of dat is gelukt en ongeveer hoe lang het duurde. Geen ID’s, URL’s, videotitels, bestandspaden of accountgegevens. Je kunt beide uitschakelen in Instellingen.",
  privacy_p3:
    "Verkennen bewaart zijn eigen aanmeldingen, los van je browser, en Arroxy leest of vult nooit een aanmeldformulier in — je typt op de eigen pagina van de site. Downloads draaien afgemeld; alleen wanneer er een mislukt op een manier die een account kan oplossen, leest Arroxy de aanmelding vers uit, bewaart die voor die download in een tijdelijk bestand en verwijdert het bestand daarna. Afmelden bij Verkennen in Instellingen vergeet ze.",
  faq_q1: "Is het echt gratis?",
  faq_a1: "Ja — GPLv3-licentie, geen premiumabonnement, geen beperking van functies.",
  faq_q11: "Waarin verschilt Arroxy van andere yt-dlp-GUI’s?",
  faq_a11:
    "De meeste gratis yt-dlp-GUI’s zijn wrappers die alleen een link accepteren. Arroxy voegt **Verkennen** toe, een in de app ingebouwde browser die YouTube of elke andere site opent: je surft en downloadt zonder links te kopiëren, en je meldt je daar één keer aan om video’s te downloaden die je account kan bekijken, zoals je privévideo’s en je lijsten Later bekijken en Leuk gevonden, zonder cookie-export. Zie [Waarom Arroxy](#why).",
  faq_q2: "Welke videokwaliteiten kan ik downloaden?",
  faq_a2:
    "Alles wat YouTube aanbiedt: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus alleen audio. 60 fps- en HDR-streams blijven ongewijzigd behouden, en met de stapsgewijze download kies je AV1, VP9 of H.264 bij elke resolutie.",
  faq_q3: "Kan ik alleen de audio als MP3 extraheren?",
  faq_a3:
    "Ja. Kies *alleen audio* in het formaatmenu en kies MP3, M4A/AAC, Opus of WAV.",
  faq_q4: "Hoe download ik video’s waarvoor een YouTube-account nodig is?",
  faq_a4:
    "Meld je één keer aan op het tabblad Verkennen. Arroxy kan dan video’s downloaden die je account kan bekijken: je privévideo’s, video’s met leeftijdsbeperking als het account leeftijdsgeverifieerd is, en je lijsten Later bekijken en Leuk gevonden. Het gebruikt de aanmelding alleen wanneer een download mislukt op een manier die een account kan oplossen; al het andere downloadt zoals voorheen. Dit is de keuze **Aanmelding in Verkennen**, die in de cookie-instellingen als eerste staat en als Aanbevolen is gemarkeerd, en Arroxy kiest die voor je wanneer je Verkennen voor het eerst opent. De wiki van yt-dlp merkt op dat [geautomatiseerd aanmelden een Google-account kan markeren](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), dus een tweede account is de veiligere keuze.",
  faq_q5: "Blijft het werken als YouTube iets verandert?",
  faq_a5:
    "yt-dlp wordt bij het opstarten automatisch bijgewerkt en Arroxy brengt snel oplossingen uit als YouTube iets verandert. Wanneer een download een aanmelding nodig heeft, gebruikt Arroxy je aanmelding in Verkennen als je daar bent aangemeld, en cookies uit een bestand of je browser zijn beschikbaar in de cookie-instellingen.",
  faq_q6: "In welke talen is Arroxy beschikbaar?",
  faq_a6:
    "{{LANG_COUNT}} talen, kant-en-klaar: {{LANG_NAME_LIST}}. Arroxy detecteert bij de eerste start automatisch de taal van je besturingssysteem en je kunt op elk moment wisselen via de taalkiezer in de werkbalk. De JSON-bestanden voor de runtime-taal staan in src/shared/i18n/locales/ en de PO-catalogi voor vertalers staan in i18n/locales/ — open een PR op GitHub om bij te dragen.",
  faq_q7: "Moet ik nog iets anders installeren?",
  faq_a7:
    "Nee. yt-dlp, ffmpeg en ffprobe worden bij de eerste start automatisch gedownload en op je computer in de cache bewaard. Daarna is geen extra installatie nodig.",
  faq_q8: "Kan ik afspeellijsten of hele kanalen downloaden?",
  faq_a8:
    "Ja — allebei. Plak een URL van een afspeellijst of kanaal (bijv. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); kies hoeveel items er gescand worden en zet daarna de hele lijst in de wachtrij of kies specifieke video’s. Filters op datumbereik komen binnenkort.",
  faq_q9: 'macOS zegt „de app is beschadigd” — wat moet ik doen?',
  faq_a9:
    'Dat is macOS Gatekeeper die een niet-ondertekende app blokkeert, geen echte schade. Zie [Eerste start op macOS](#macos-first-launch) voor de Terminal-opdrachten die de quarantaine opheffen en Arroxy starten.',
  faq_q10: "Is het downloaden van YouTube-video’s legaal?",
  faq_a10:
    "Dat hangt af van je land en van wat je downloadt. Download alleen inhoud die van jou is, inhoud waarvoor een downloadlicentie bestaat of inhoud die je volgens de wet in jouw land mag kopiëren. Jij bent verantwoordelijk voor het naleven van de [Servicevoorwaarden](https://www.youtube.com/t/terms) van YouTube en de auteursrechtwetgeving in jouw land. Zie [Gebruiksvoorwaarden](#terms).",
  plan_intro: "Nog gepland — grofweg in volgorde van prioriteit:",
  plan_col1: "Functie",
  plan_col2: "Beschrijving",
  plan_r1_name: "**Filters voor afspeellijsten en kanalen**",
  plan_r1_desc: "Filters op datumbereik bij het opsommen van een afspeellijst of kanaal",
  plan_r2_name: "**Voorkeuren voor YouTube-audiotracks**",
  plan_r2_desc:
    "Stel een app-brede voorkeur voor de gesproken taal in, met overschrijvingen per profiel wanneer YouTube meerdere audiotracks aanbiedt",
  plan_r3_name: "**Sterker herstel bij opnieuw proberen**",
  plan_r3_desc:
    "Een nieuw herstelpad voor downloads die zijn onderbroken door onbetrouwbare of problematische internetverbindingen",
  plan_r4_name: "**Volledig downloadbeheerpaneel**",
  plan_r4_desc:
    "Maak van het wachtrijpaneel een completer beheer, inclusief het wijzigen van doelmappen voor items in de wachtrij",
  plan_r5_name: "**Geplande downloads**",
  plan_r5_desc: "Start een wachtrij op een ingesteld tijdstip (nachtelijke runs)",
  plan_r9_name: "**AUR-pakket**",
  plan_r9_desc: "Installeer op Arch Linux en Omarchy met `yay -S arroxy-bin`",
  plan_cta:
    "Een functie in gedachten? [Dien een verzoek in](../../issues) — input uit de community bepaalt de prioriteit.",
  tech_content: TECH_CONTENT,
  support_h2: "Steun Arroxy",
  support_line:
    "Arroxy is gratis en heeft een GPLv3-licentie — geen advertenties, geen tracking, geen betaald abonnement. Bespaart het je tijd, dan kun je de ontwikkeling steunen met Bitcoin, Tron of Ethereum: de adressen staan in [DONATE.md](DONATE.md), de enige officiële bron ervoor. Arroxy stuurt je nooit een adres per e-mail of direct bericht. Een ster geven aan de repo, bugs melden en vertalingen verbeteren helpen net zo goed.",
  tos_h2: "Gebruiksvoorwaarden",
  tos_note:
    "Arroxy is een hulpmiddel voor uitsluitend persoonlijk, privégebruik. Je bent zelf volledig verantwoordelijk voor ervoor te zorgen dat je downloads voldoen aan de [Servicevoorwaarden](https://www.youtube.com/t/terms) van YouTube en de auteursrechtwetten van jouw rechtsgebied. Gebruik Arroxy niet om content te downloaden, te reproduceren of te verspreiden waarvoor je geen gebruiksrecht hebt. De ontwikkelaars zijn niet aansprakelijk voor misbruik.",
  footer_credit:
    'GPLv3 · Met zorg gemaakt door <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
