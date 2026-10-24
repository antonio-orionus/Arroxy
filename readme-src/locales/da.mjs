const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — desktop-skal på tværs af platforme
- **React 19** + **TypeScript** — brugerflade
- **Tailwind CSS v4** — styling
- **Zustand** — tilstandshåndtering
- **yt-dlp** + **ffmpeg** — download- og mux-motor (begge hentes under kørsel: yt-dlp holdes opdateret, ffmpeg/ffprobe installeres én gang og bevares på tværs af opdateringer)
- **Vite** + **electron-vite** — byggeværktøjer
- **Vitest** + **Playwright** — enheds- og end-to-end-tests

</details>

<details>
<summary><strong>Byg fra kildekode</strong></summary>

### Forudsætninger — alle platforme

| Værktøj | Version | Installation |
| ------- | ------- | ------- |
| Git     | enhver  | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` eller \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` eller \`package.json\` \`packageManager\` |

Anbefalet: installer \`mise\`, og kør derefter \`mise install\` i checkouten. Uden mise skal du manuelt aktivere Node.js fra \`.node-version\` og Bun fra \`package.json\` før \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools og Python kan være nødvendige til native genopbygninger.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Når du har klonet, så kør \`mise trust && mise install\` fra checkouten. Hvis din shell allerede bruger \`fnm\`, \`nvm\` eller en Homebrew-Bun, så aktivér mise i \`~/.zshrc\`, så Arroxy får Node.js 24.21.0 og Bun 1.4.2:

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

### Klon og kør

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Byg en distribuerbar pakke

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` installerer afhængigheder, genopbygger Electron-appens afhængigheder, verificerer Electron, klargør indlejret ffmpeg/ffprobe til udvikling og installerer Playwright Chromium. Release-builds administrerer yt-dlp, ffmpeg og ffprobe under kørsel i din apps datamappe; ingen af dem følger med i installationsprogrammet.

</details>`;

export const da = {
  icon_alt: "Arroxy-maskot",
  hero_image_alt: "Indsæt et link, eller gå bare på opdagelse. Arroxys URL-skærm og indbyggede browser med en igangværende download.",
  hero_banner_line1: "Indsæt et link,",
  hero_banner_line2: "eller gå på opdagelse.",
  title:
    "Arroxy — gratis open source-downloader til YouTube (+ 2000 websteder) med indbygget browser, til Windows, macOS og Linux",
  read_in_label: "Læs på:",
  badge_release_alt: "Udgivelse",
  badge_build_alt: "Build",
  badge_license_alt: "Licens",
  badge_platforms_alt: "Platforme",
  badge_i18n_alt: "Sprog",
  badge_website_alt: "Websted",
  discord_badge_text: "Deltag i Discord-fællesskabet",
  discord_badge_encoded: "Deltag%20i%20Discord--f%C3%A6llesskabet",
  hero_desc:
    "Download videoer, Shorts, kanaler, podcasts eller lydspor fra **YouTube og over 2000 understøttede websteder** — op til 8K HDR ved 60 fps, som MP3 / AAC / Opus eller bare den del, du har brug for. **Surf på YouTube eller et hvilket som helst andet websted direkte i Arroxy** under fanen Udforsk, og download den video, afspilningsliste eller kanal, du er på; log ind der for at downloade videoer, som din egen konto allerede kan se. Kører lokalt på Windows, macOS og Linux. **Ingen reklamer, ingen oppustet software, ingen mersalg.**",
  cta_latest: "↓ Installer seneste udgivelse",
  cta_website: "Websted",
  website_url: "https://arroxy.com/",
  star_cta: "Hvis Arroxy sparer dig tid, hjælper en ⭐ andre med at finde den.",
  ai_notice:
    "> 🌐 Denne oversættelse er lavet med hjælp fra AI. [Den engelske README](README.md) er den gældende kilde. Fundet en fejl? [Åbn en PR](../../pulls).",
  intro_what_is:
    "**Hvad er Arroxy?** Arroxy er en gratis open source-grænseflade til computeren, der downloader videoer, lyd, afspilningslister og undertekster fra YouTube og over 2000 andre websteder, som [yt-dlp](https://github.com/yt-dlp/yt-dlp) understøtter. Den kører på Windows 10/11, macOS 13+ (Intel + Apple Silicon) og Linux (AppImage, Flatpak, tar.gz). Licenseret under GPLv3. Ingen reklamer, ingen brugsgrænser. Distribueres via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage og direkte download.",
  intro_key_difference:
    "**Den afgørende forskel: en indbygget browser.** De fleste gratis YouTube-downloadere er tynde yt-dlp-indpakninger: et URL-felt og en formatmenu uden en browser af deres egen. Arroxy har en, **fanen Udforsk**. Du surfer på YouTube eller et hvilket som helst andet websted i appen og downloader den video, afspilningsliste eller kanal, du er på, eller højreklikker på et vilkårligt link. Hvis du logger ind én gang i Udforsk, bruger downloads, der kræver en konto, det login: dine private videoer, dine lister Se senere og Synes godt om og andre videoer, som din konto allerede kan se, uden cookie-eksport. Log også ind på andre websteder der, så bruger deres downloads det login, når de har brug for det. Se [Hvorfor Arroxy](#why-explore).",
  last_updated: "Sidst opdateret: {{LAST_UPDATED}}.",
  toc_heading: "Indhold",
  why_h2: "Hvorfor Arroxy",
  features_h2: "Funktioner",
  dl_h2: "Installation og første start",
  privacy_h2: "Privatliv",
  faq_h2: "Ofte stillede spørgsmål",
  roadmap_h2: "Køreplan",
  tech_h2: "Bygget med",
  why_intro: "En sammenligning side om side med de mest almindelige alternativer:",
  why_r1: "Gratis, intet premium-niveau",
  why_r2: "Open source",
  why_r3: "Kun lokal behandling",
  why_r5: "Ingen brugsgrænser",
  why_r6: "Desktop-app på tværs af platforme",
  why_r7: "Undertekster + SponsorBlock",
  why_r8: "Indbygget browser (surf, log ind, download)",
  why_r9: "Videoer, som din egen konto kan se, uden at eksportere cookies",
  why_table_note:
    "⚠️ = delvist eller kun på et betalt niveau. Indlogning i appen til private videoer i 4K Video Downloader er en betalt funktion; de fleste gratis yt-dlp-grænseflader accepterer kun en cookiefil eller læser din webbrowsers cookies.",
  why_summary:
    "Arroxy er bygget til én ting: en ren lokal fil, uanset om du indsætter en URL eller finder videoen i Udforsk. Intet mersalg, ingen dataindsamling.",
  why_explore_h3: "Det, en almindelig yt-dlp-indpakning ikke kan: fanen Udforsk",
  why_explore_intro:
    "De fleste gratis YouTube-downloadere er et URL-felt oven på yt-dlp. Arroxy bruger også yt-dlp, men har desuden **Udforsk**, en browser indbygget i appen, der åbner YouTube eller et hvilket som helst andet websted. Udforsk tilføjer det, som et URL-felt ikke kan:",
  why_explore_1:
    "**Videoer, som din konto kan se, uden at eksportere cookies** — dine private videoer, dine lister Se senere og Synes godt om, aldersbegrænsede videoer på en aldersverificeret konto og sider på andre websteder, der kræver dit login. En almindelig indpakning kræver en cookies.txt-eksport eller læser din webbrowsers cookies. I Arroxy logger du ind én gang i Udforsk, og resten klarer den selv",
  why_explore_4:
    "**Ingen kopiering af links** — find en video, afspilningsliste eller kanal i Udforsk, og download den med ét klik, eller højreklik på et vilkårligt link på siden",
  why_explore_5:
    "**Reklameblokering, når du vil have den** — ét klik på skjoldet blokerer reklamer og sporing på Udforsks sider",
  feat_explore_h3: "Udforsk: surf på nettet i Arroxy",
  feat_explore_1:
    "**Fanen Udforsk** — surf på YouTube eller et hvilket som helst andet websted i Arroxy, og download det, du finder, uden at kopiere links. **Download · *din profil*** sætter den video, afspilningsliste eller kanal, du kigger på, i kø; pilen ved siden af skifter profil, og tryllestaven åbner trin-for-trin-downloadet, hvor du kan vælge formater, undertekster og mere",
  feat_explore_6:
    "**Højreklik for at downloade** — højreklik på et video-, afspilningslisten- eller kanallink i Udforsk for at downloade det med din profil, vælge en anden profil under **Download med**, åbne trin-for-trin-downloadet eller kopiere linket. Du behøver ikke åbne hver video først",
  feat_explore_7:
    "**Kompakt layout** — ét klik på Udforsks værktøjslinje flytter Arroxys faner derind og giver siden mere plads",
  feat_explore_2:
    "**Adresselinje** — skriv for at søge på YouTube, eller indtast en vilkårlig webadresse for at åbne det websted",
  feat_explore_3:
    "**Downloads, der kræver en konto** — log ind én gang i Udforsk, og Arroxy kan downloade videoer, som din konto kan se: dine private videoer, aldersbegrænsede videoer, hvis kontoen er aldersverificeret, og dine lister Se senere og Synes godt om. Log også ind på andre websteder der, så bruger deres downloads det login, når de har brug for det. Arroxy downloader stadig først uden at være logget ind og bruger kun dit login i Udforsk, når et download fejler på en måde, som en konto kan rette",
  feat_explore_4:
    "**Brug en sekundær konto** — Udforsks første skærmbillede forklarer hvorfor: at downloade med en konto indebærer en vis risiko for, at kontoen bliver begrænset. Log ud af Udforsk under Indstillinger, når du vil glemme dine logins",
  feat_explore_5:
    "**Reklameblokering** — slået fra som standard. Ét klik på skjoldet på Udforsks værktøjslinje blokerer reklamer og sporing på dens sider uden at påvirke downloads. YouTube kan modarbejde reklameblokkere for konti, der er logget ind",
  feat_quality_h3: "Kvalitet og formater",
  feat_quality_1: "Op til **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Høj billedfrekvens og HDR** bevares uændret — 60 fps, HDR10",
  feat_quality_3:
    "**Lyd** — eksportér kun lyd som MP3, M4A/AAC, Opus eller WAV. I interaktive downloads kan du vælge kildens originale surround/Dolby-spor (AC-3, E-AC-3, 5.1, DRC), når de findes, eller angive en global standard med **Foretræk surround / Dolby**",
  feat_quality_4:
    "**Profiler med et mål** — *Bedste billede* (AV1 · VP9) eller *Smart TV* (MP4 · H.264), gemt som Auto, MP4, MKV eller WebM uden genkodning. HDR er *Auto* (kun når din skærm kan vise det), *SDR* eller *HDR*",
  feat_quality_5:
    "**Alle codecs ved alle opløsninger** — trin-for-trin-downloadet viser AV1, VP9 og H.264 side om side ved hver opløsning, så du kan vælge den, dit tv eller redigeringsprogram afspiller",
  feat_quality_6:
    "**Vid, hvad en stream egentlig er** — størrelser, YouTube har opskaleret med AI, AI-dubbede lydsprog, streams med forbedret bitrate, 360°-videoer og beskadigede kopier eller kopier med vandmærke er markeret. Profiler springer AI-opskalerede streams over, medmindre du tillader dem",
  feat_privacy_h3: "Privatliv og kontrol",
  feat_privacy_1:
    "100 % lokal behandling — downloads går direkte fra YouTube til din disk",
  feat_privacy_2: "**Open source** — hver eneste linje kan gennemses, GPLv3-licenseret",
  feat_privacy_3: "Filer gemmes direkte i den mappe, du vælger",
  feat_workflow_h3: "Arbejdsgang",
  feat_workflow_12:
    "**Global genvejstast til download** — kopiér et link i en hvilken som helst app, og tryk på `Ctrl+Shift+D` (`Cmd+Shift+D` på macOS); Arroxy sætter det i kø med din aktive profil uden at åbne vinduet, og en meddelelse bekræfter det. Slået til som standard, kan tilpasses",
  feat_workflow_1:
    "**Fleksible startmåder** — vælg et guidet enkelt download, udvælgelse af afspilningsliste/kanal, indsættelse af flere URL'er på én gang, Hurtig download med gemte standarder, eller surf og download fra Udforsk",
  feat_workflow_2:
    "**Central downloadkø** — hvert enkelt-, afspilningslistes-, bulk- eller hurtigjob havner ét sted med fremskridt samt styring af pause, genoptagelse, annullering, nyt forsøg og prioritet",
  feat_workflow_3:
    "**Overvågning af udklipsholder** — kopiér et videolink, så udfyldes URL-feltet, når du vender tilbage til Arroxy, med **Fortryd**, hvis du ikke mente det. Mens Arroxy er optaget, venter linket, til du er tilbage på URL-fanen (slå det fra under Indstillinger)",
  feat_workflow_4:
    "**Automatisk oprydning af URL'er** — fjerner sporingsparametre (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) og pakker `youtube.com/redirect`-links ud",
  feat_workflow_5:
    "**Systembakketilstand** — når du lukker vinduet, kører downloads videre i baggrunden",
  feat_workflow_6:
    "**{{LANG_COUNT}} sprog** — registrerer automatisk systemets sprog, kan skiftes når som helst",
  feat_workflow_7:
    "**Synkronisering af afspilningslister** — scan en afspilningsliste igen mod en lokal mappe for at springe allerede downloadede videoer over; opretter en `.m3u`-afspilningslistefil, der opdateres, efterhånden som hver video downloades",
  feat_workflow_8:
    "**Kontrol af hastighed og tempo** — begræns downloadbåndbredden, angiv hvor mange dele af en video der downloades samtidig, og tilføj forsinkelser mellem anmodninger med forudindstillinger (*Fra · Afbalanceret · Forsigtig · Tilpasset*)",
  feat_workflow_9:
    "**Skabeloner til filnavne** — navngiv downloads, som du vil, med `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` og `{playlist_index}`, globalt eller pr. downloadprofil",
  feat_workflow_10:
    "**Downloads ad gangen og automatisk nyt forsøg** — vælg, hvor mange downloads i køen der kører samtidig, og lad Arroxy prøve igen med et download, der ramte et netværks- eller serverproblem, med længere ventetid før hvert forsøg",
  feat_workflow_11:
    "**Profiler pr. element i afspilningslister** — giv hver video i en afspilningsliste sin egen downloadprofil i stedet for én indstilling til hele listen, så du i én omgang kan arkivere nogle i fuld kvalitet og gemme resten som kun lyd",
  feat_workflow_13:
    "**Hurtig download virker i baggrunden** — linket dukker straks op i Downloads og klargøres dér, en note med **Vis** bekræfter det, og URL-feltet ryddes til næste link. Start så mange, du vil, mens tidligere klargøres",
  feat_workflow_14:
    "**Downloads fortæller, hvad der har brug for dig** — hvis Arroxy ikke kan læse et link, fortæller rækken hvorfor og tilbyder løsningen: Prøv igen, slå cookies til, eller log ind i Udforsk. Med cookies slået fra prøver **Log ind i Udforsk** igen for dig, når du er logget ind. En afspilningsliste, der er længere end din indlæsningsgrænse, venter på sin række på, at du vælger hele listen, de første eller en gennemgang. Fanen Downloads tæller de rækker, der venter på dig",
  feat_workflow_15:
    "**Download kun en del af en video** — vælg en start og slut eller et kapitel på formatskærmen, så gemmer Arroxy kun det interval, navngivet med intervallet efter video-id'et. Klip lander på det nærmeste keyframe; slå præcist klip til for i stedet at genkode",
  feat_workflow_16:
    "**Fjern færdige downloads** — valgfrit: et færdigt download forlader listen 5 sekunder senere. Filerne bliver på disken, og mislykkede downloads bliver på listen",
  feat_workflow_17:
    "**Størrelse og Mangler i Downloads** — en kolonne **Størrelse**, der kan sorteres, viser, hvor meget plads hvert download fylder, og **Mangler** markerer filer, der er flyttet eller slettet uden for Arroxy",
  feat_workflow_18:
    "**Aurora eller Minimal, mørk eller lys** — glaspaneler over en bevægelig himmel eller rolige solide flader; skift fra sidefoden. Computere uden grafikacceleration får automatisk Minimal",
  feat_workflow_19:
    "**Menulinjen på Mac** — på macOS kan du åbne Indstillinger (`Cmd+,`), angive grænsen for downloadhastighed, skifte stil og tema og åbne logfiler eller gemme en diagnosticeringsfil fra menulinjen",
  feat_workflow_20:
    "**Skift en profil fra et hvilket som helst download** — justér et download, og opdater derefter den profil, det startede fra (med en forhåndsvisning af, hvad der ændres), eller gem indstillingerne som en ny profil. Når du skifter profil, bliver du spurgt, om du vil beholde dine ændringer",
  feat_post_h3: "Undertekster og efterbehandling",
  feat_post_1:
    "**Undertekster** i SRT, VTT eller ASS — manuelle eller automatisk genererede, på alle tilgængelige sprog",
  feat_post_2:
    "Gem ved siden af videoen, indlejr i `.mkv`, eller organisér i en undermappe `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — spring sponsorer, intros, outros og selvpromovering over, eller markér dem som kapitler",
  feat_post_4:
    "**Indlejret metadata** — titel, uploaddato, kanal, beskrivelse, miniature og kapitelmarkeringer skrives ind i filen",
  feat_post_5:
    "**Partier med kun undertekster** — indsæt en liste med URL'er, eller åbn en afspilningsliste, vælg Undertekster, og få kun undertekstfilerne til hver video",
  feat_sites_h3: "YouTube + 2000 websteder",
  feat_sites_1:
    "**YouTube i sin helhed** — Videoer, Shorts, kanaler, afspilningslister, YouTube Music og podcasts håndteres som førsteklasses kilder",
  feat_sites_2:
    "**Over 2000 andre websteder** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable og mange flere",
  feat_sites_3:
    "**Kun lyd og undertekster** virker på alle understøttede websteder, ikke kun YouTube",
  feat_sites_4:
    "Hvis et websted ændrer sig, udgiver yt-dlp rettelser hver uge, og Arroxy opdaterer automatisk binærfilen ved start",
  shot1_cap:
    "<b>Startsiden i Hurtig download</b><br/>Indsæt en URL, og hent den med det samme med din aktive profil",
  shot2_cap:
    "<b>Genbrugelige downloadprofiler</b><br/>Gem format, kvalitet og output som forudindstillinger — genbrug dem pr. download",
  shot3_cap:
    "<b>Flersprogede lydspor</b><br/>Vælg præcis det lydsprog, en video leveres med",
  shot4_cap:
    "<b>Surround- / Dolby-lyd</b><br/>5.1- og Dolby-spor registreres og bevares",
  shot5_cap:
    "<b>Bulk-URL-tilstand</b><br/>Indsæt en liste, fjern dubletter automatisk, og sæt alle i kø på én gang",
  shot6_cap:
    "<b>Parallel downloadkø</b><br/>Flere downloads på én gang med live fremskridt",
  hotkey_fig_alt:
    "Arroxys globale genvejstast til download — Ctrl+Shift+D på Windows og Linux, Cmd+Shift+D på macOS, sender det kopierede link direkte ind i downloadkøen",
  hotkey_fig_cap:
    "<b>Global genvejstast til download</b><br/>Kopiér et link et vilkårligt sted, tryk én gang — det havner i køen og begynder at downloade",
  shot7_cap:
    "<b>Profiler pr. element i afspilningslister</b><br/>Giv hver video sin egen profil — arkivér nogle i 4K, gem resten som kun lyd",
  shot8_cap:
    "<b>Udforsk</b><br/>Surf på YouTube eller et hvilket som helst andet websted i Arroxy, og download den side, du er på, med din aktive profil",
  shot9_cap:
    "<b>Udforsks første skærmbillede</b><br/>Et hurtigt kig på Udforsk og hvorfor en sekundær konto er det sikreste login",
  shot10_cap:
    "<b>Downloads fortæller, hvad der har brug for dig</b><br/>Links klargøres i baggrunden; et mislykket link tilbyder sin løsning, en lang afspilningsliste venter på dit valg",
  shot11_cap:
    "<b>Download kun en del af en video</b><br/>Vælg en start og slut eller et kapitel — Arroxy gemmer kun det interval",
  shot12_cap:
    "<b>Profileditor</b><br/>Justér en profil: filtype, opløsning, undertekster, mål, skabelon til filnavne og mere",
  shot13_cap:
    "<b>Mørk eller lys, glas eller solid</b><br/>Fire udseender at vælge imellem: glaspaneler over en bevægelig himmel eller rolige solide flader, hver i mørk og lys",
  shot14_cap:
    "<b>8K HDR ved 60 fps</b><br/>Alle opløsninger, codecs og HDR-streams, en video tilbyder, side om side",
  dl_platform_col: "Platform",
  dl_format_col: "Direkte download",
  dl_oneline_note:
    "Builds findes kun til x86_64. Ingen `curl`? Skift `curl -fsSL` ud med `wget -qO-`.",
  dl_win_scoop:
    "Foretrækker du Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Installationsprogram (NSIS) eller bærbar `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` eller `.flatpak` (i sandkasse)",
  dl_grab: "Alle udgivelsesfiler →",
  dl_pkg_h3: "Installer via pakkehåndtering",
  dl_channel_col: "Kanal",
  dl_command_col: "Kommando",
  dl_win_h3: "Windows: installationsprogram vs. bærbar",
  dl_win_col_installer: "NSIS-installationsprogram",
  dl_win_col_portable: "Bærbar `.exe`",
  dl_win_r1: "Kræver installation",
  dl_win_r1_installer: "Ja",
  dl_win_r1_portable: "Nej — kør hvor som helst",
  dl_win_r2: "Automatiske opdateringer",
  dl_win_r2_installer: "✅ i appen",
  dl_win_r2_portable: "❌ manuelt download",
  dl_win_r3: "Starthastighed",
  dl_win_r3_installer: "✅ hurtigere",
  dl_win_r3_portable: "⚠️ langsommere koldstart",
  dl_win_r4: "Føjes til Start-menuen",
  dl_win_r5: "Nem afinstallering",
  dl_win_r5_portable: "❌ slet filen",
  dl_win_rec:
    "**Anbefaling:** brug NSIS-installationsprogrammet for automatiske opdateringer og hurtigere start. Brug den bærbare `.exe` til en løsning uden installation og uden registreringsdatabase.",
  dl_win_smartscreen_h4: "Advarsel fra Windows SmartScreen",
  dl_win_smartscreen_intro:
    "Ved første start kan du se **»Windows har beskyttet din pc«** eller **»Ukendt udgiver«.** Det gælder både `Arroxy-win-x64-Setup.exe` og `Arroxy-win-x64-Portable.exe`. Arroxy er gratis og open source, og Windows-buildene er ikke kodesignerede med et betalt certifikat, hvilket er grunden til, at SmartScreen markerer dem. Det betyder **ikke** automatisk, at Arroxy er usikker. Sådan fortsætter du:",
  dl_win_smartscreen_step1: "Klik på **Flere oplysninger**.",
  dl_win_smartscreen_step2: "Klik på **Kør alligevel**.",
  dl_win_smartscreen_official:
    "Download kun Arroxy fra den officielle GitHub Releases-side. Hvis du har fået filen fra et andet websted, eller nogen har sendt den til dig, så slet den, og download en ny kopi fra den officielle kilde. Kildekoden er offentlig, så du kan gennemse den eller bygge Arroxy selv, hvis du foretrækker det.",
  dl_macos_h3: "Første start på macOS",
  dl_macos_warning:
    "Arroxy er endnu ikke kodesigneret, så macOS Gatekeeper kan vise advarslen om en beskadiget app ved første start. Det er forventet — det er ikke tegn på en egentlig filskade.",
  dl_macos_m1_h4: "Terminalmetode:",
  dl_macos_step1: "Træk `Arroxy.app` fra den monterede DMG ind i `/Applications`.",
  dl_macos_step2:
    "Åbn Terminal, og kør `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Kør `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Hvis appens sti er en anden, så erstat `/Applications/Arroxy.app` med den sti, du installerede til.",
  dl_macos_step5:
    "Indtast din Mac-adgangskode, hvis `sudo` beder om den.",
  dl_macos_after:
    "Når karantænen er fjernet, åbner Arroxy normalt.",
  dl_macos_m2_h4: "Terminalmetode:",
  dl_macos_note:
    "macOS-builds produceres via CI på Apple Silicon- og Intel-runners. Hvis du løber ind i problemer, så [opret et issue](../../issues) — feedback fra macOS-brugere former aktivt macOS-testforløbet.",
  dl_linux_h3: "Første start på Linux",
  dl_linux_intro:
    "AppImages kører direkte — ingen installation. Du skal blot markere filen som eksekverbar.",
  dl_linux_m1_text:
    "**Filhåndtering:** højreklik på `.AppImage` → **Egenskaber** → **Tilladelser** → slå **Tillad at udføre fil som program** til, og dobbeltklik derefter.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Hvis starten stadig fejler, så kør den uden at montere — ingen FUSE-pakke nødvendig:",
  dl_linux_targz_h4: "Almindelig tarball (ingen FUSE, ingen installation):",
  dl_linux_targz_text: "`.tar.gz`-buildet er den samme app uden AppImage-indpakningen — udpak det hvor som helst, og kør det. Intet installationsprogram og ingen FUSE-pakke nødvendig.",
  dl_linux_arch_note: "**Linux-downloads på udgivelsessiden findes kun til x86_64.** På ARM64-maskiner (Raspberry Pi, Asahi Linux) installeres Flatpak stadig, men fejler derefter ved start med `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Hvorfor du kan se en advarsel",
  dl_warning_p1:
    "Arroxy er open source og GPLv3-licenseret. Windows- og macOS-buildene er **ikke kodesignerede** — Apple Developer ID og Windows EV-kodesigneringscertifikater koster hver især hundredvis af dollars om året, som et indieprojekt betaler af egen lomme. Uden disse signaturer advarer Windows SmartScreen og macOS Gatekeeper dig ved første start. Advarslerne betyder, at *dit OS ikke genkender udgiveren* — de betyder ikke, at Arroxy er malware.",
  dl_warning_p2:
    "Tre måder at verificere Arroxy på selv, i stigende grad af grundighed:\n\n- **Læs kildekoden.** Hver eneste linje ligger på [GitHub](https://github.com/antonio-orionus/Arroxy), og du kan [bygge den fra kildekode](#tech).\n- **Kontrollér SHA256.** Sammenlign din fil med de offentliggjorte [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — se [Verificér dit download](#verify) nedenfor.\n- **Kør en scanning hos tredjepart.** Upload filen til [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Første start på Windows",
  shot_smartscreen_more_alt:
    "SmartScreen-dialogen »Windows har beskyttet din pc« med linket »Flere oplysninger« fremhævet",
  shot_smartscreen_run_alt:
    "SmartScreen-dialogen efter udvidelse af Flere oplysninger, med knappen »Kør alligevel«",
  dl_win_defender_h4: "Hvis Windows Defender markerer eller fjerner filen",
  dl_win_defender_p:
    "Heuristikker i Defender markerer nogle gange usignerede NSIS-installationsprogrammer og bærbare Electron-programmer som mistænkelige. Hvis Defender sætter `Arroxy-win-x64-Setup.exe` eller `Arroxy-win-x64-Portable.exe` i karantæne, så gendan den fra **Windows-sikkerhed → Beskyttelse mod virus og trusler → Beskyttelseshistorik**, og tilføj derefter Arroxys programfil som tilladt element under **Administrer indstillinger → Tilføj eller fjern udeladelser**. Ligesom med SmartScreen er udløseren den manglende udgiversignatur, ikke fundet malware.",

  dl_macos_first_h3: "Første start på macOS",
  dl_macos_intro:
    "Arroxys macOS-builds er ad hoc-signerede, men ikke notariseret af Apple, så Gatekeeper blokerer den første start med *»Arroxy.app« blev ikke åbnet — Apple kunne ikke bekræfte, at »Arroxy.app« er fri for skadelig software*. Det betyder, at macOS ikke kan kontrollere appen hos Apple, ikke at der er noget galt med filerne. Hvis du installerer med Homebrew, undgår du helt denne dialog. Hvis du brugte DMG'en, fjerner én Terminal-kommando den:",
  dl_macos_sequoia_h4: "Terminal-løsning til nuværende macOS",
  dl_macos_sequoia_intro:
    "Brug Terminal, når du har kopieret Arroxy til Programmer:",
  dl_macos_sequoia_step1:
    "Træk `Arroxy.app` fra den monterede DMG ind i `/Applications`.",
  dl_macos_sequoia_step2:
    "Åbn Terminal, og kør disse to kommandoer:",
  dl_macos_sequoia_step3:
    "Kør `open /Applications/Arroxy.app` for at starte Arroxy.",
  dl_macos_sequoia_step4:
    "Hvis appens sti er en anden, så erstat `/Applications/Arroxy.app` med den sti, du installerede til.",
  dl_macos_sonoma_h4: "Terminal-løsning til ældre macOS",
  dl_macos_sonoma_step1:
    "Træk `Arroxy.app` fra den monterede DMG ind i `/Applications`.",
  dl_macos_sonoma_step2:
    "Åbn Terminal, og fjern karantænen fra `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Start Arroxy fra Terminal eller Finder, når karantænen er fjernet.",
  dl_macos_damaged_h4:
    "Løsning på Gatekeeper-karantæne",
  dl_macos_damaged_p:
    "Den første kommando fjerner den karantæneattribut, som macOS tilføjede, da filen blev downloadet; den anden starter appen. Du behøver normalt ikke `sudo`, fordi kopien i `/Applications` tilhører dig — tilføj den kun, hvis du får en fejl om tilladelser.",
  dl_macos_arch_note:
    "**Apple Silicon vs. Intel:** på en Mac med M-serien (M1 / M2 / M3 / M4) skal du downloade `arm64`-DMG'en. På Intel-Mac'er skal du downloade `x64`-DMG'en. Hvis du kører den forkerte build, virker det stadig via Rosetta, men mærkbart langsommere.",

  dl_linux_first_h3: "Første start på Linux",
  dl_linux_appimagelauncher:
    "**Valgfri skrivebordsintegration:** installer [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) én gang, så bliver enhver AppImage, du dobbeltklikker på, automatisk registreret i din startmenu — ingen manuel `.desktop`-fil nødvendig.",

  dl_verify_h3: "Verificér dit download (SHA256)",
  dl_verify_intro:
    "Hver udgivelse offentliggør en `SHA256SUMS`-fil ved siden af binærfilerne. For at kontrollere, at dit download ikke blev beskadiget eller manipuleret undervejs, skal du beregne hashen af din fil lokalt og sammenligne den med linjen i `SHA256SUMS`. Åbn siden med den seneste udgivelse → **Assets** → download `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell eller Kommandoprompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Vil du have en malwarescanning hos tredjepart? Upload filen til [VirusTotal](https://www.virustotal.com). Et par generiske heuristiske markeringer fra mindre motorer er normalt for usignerede Electron-apps; udbredte registreringer fra store motorer ville være en reel bekymring.",

  dl_pm_intro:
    "Foretrækker du en anden kanal? Disse virker også, og de følger med hver udgivelse.",

  privacy_p1:
    "Downloads hentes direkte via [yt-dlp](https://github.com/yt-dlp/yt-dlp) fra YouTube til den mappe, du vælger — intet sendes via en tredjepartsserver. Visningshistorik, downloadhistorik, URL'er og filindhold bliver på din enhed.",
  privacy_reports:
    "Ingen sporing — ét anonymt livstegn om dagen (appversion, operativsystem, sprog, installationskanal, land og omtrent hvor længe siden Arroxy blev installeret), så vi kan tælle aktive og nye brugere, og når Arroxy downloader eller opdaterer yt-dlp og FFmpeg, en anonym besked om, hvorvidt det lykkedes, og omtrent hvor lang tid det tog. Ingen id'er, URL'er, videotitler, filstier eller kontooplysninger. Du kan slå begge fra i Indstillinger.",
  privacy_p3:
    "Udforsk har sine egne logins, adskilt fra din browser, og Arroxy læser eller udfylder aldrig en loginformular — du skriver på webstedets egen side. Downloads kører uden at være logget ind; kun når et fejler på en måde, som en konto kan rette, læser Arroxy loginet på ny, beholder det i en midlertidig fil under det pågældende download og sletter filen bagefter. Når du logger ud af Udforsk under Indstillinger, glemmes de.",
  faq_q1: "Er det virkelig gratis?",
  faq_a1: "Ja — GPLv3-licenseret, intet premium-niveau, ingen låste funktioner.",
  faq_q11: "Hvordan adskiller Arroxy sig fra andre yt-dlp-grænseflader?",
  faq_a11:
    "De fleste gratis yt-dlp-grænseflader er indpakninger, der kun tager et link. Arroxy tilføjer **Udforsk**, en browser indbygget i appen, der åbner YouTube eller et hvilket som helst andet websted: du surfer og downloader uden at kopiere links, og du logger ind der én gang for at downloade videoer, som din konto kan se, f.eks. dine private videoer og dine lister Se senere og Synes godt om, uden cookie-eksport. Se [Hvorfor Arroxy](#why).",
  faq_q2: "Hvilke videokvaliteter kan jeg downloade?",
  faq_a2:
    "Alt, hvad YouTube leverer: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p samt kun lyd. 60 fps- og HDR-streams bevares uændret, og trin-for-trin-downloadet lader dig vælge AV1, VP9 eller H.264 ved hver opløsning.",
  faq_q3: "Kan jeg udtrække kun lyden som MP3?",
  faq_a3:
    "Ja. Vælg *kun lyd* i formatmenuen, og vælg MP3, M4A/AAC, Opus eller WAV.",
  faq_q4: "Hvordan downloader jeg videoer, der kræver en YouTube-konto?",
  faq_a4:
    "Log ind én gang under fanen Udforsk. Arroxy kan derefter downloade videoer, som din konto kan se: dine private videoer, aldersbegrænsede videoer, hvis kontoen er aldersverificeret, og dine lister Se senere og Synes godt om. Den bruger kun loginet, når et download fejler på en måde, som en konto kan rette; alt andet downloades som før. Det er valget **Login i Udforsk**, som står først og er markeret Anbefalet i cookieindstillingerne, og Arroxy vælger det for dig, første gang du åbner Udforsk. yt-dlp's wiki bemærker, at [automatisering med login kan få en Google-konto markeret](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), så en sekundær konto er det sikreste valg.",
  faq_q5: "Vil det blive ved med at virke, når YouTube ændrer noget?",
  faq_a5:
    "yt-dlp opdateres automatisk ved start, og Arroxy udgiver hurtigt rettelser, når YouTube ændrer noget. Når et download kræver et login, bruger Arroxy dit login i Udforsk, hvis du har logget ind der, og cookies fra en fil eller din browser findes i cookieindstillingerne.",
  faq_q6: "Hvilke sprog findes Arroxy på?",
  faq_a6:
    "{{LANG_COUNT}} sprog, klar til brug: {{LANG_NAME_LIST}}. Arroxy registrerer automatisk dit operativsystems sprog ved første start, og du kan til enhver tid skifte i sprogvælgeren på værktøjslinjen. JSON-filerne med sprogene under kørsel ligger i src/shared/i18n/locales/, og PO-kataloger til oversættere ligger i i18n/locales/ — åbn en PR på GitHub for at bidrage.",
  faq_q7: "Skal jeg installere andet?",
  faq_a7:
    "Nej. yt-dlp, ffmpeg og ffprobe downloades automatisk ved første start og gemmes på din maskine. Derefter er ingen yderligere opsætning nødvendig.",
  faq_q8: "Kan jeg downloade afspilningslister eller hele kanaler?",
  faq_a8:
    "Ja — begge dele. Indsæt en URL til en afspilningsliste eller en kanal (f.eks. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); vælg, hvor mange elementer der skal scannes, og sæt derefter hele listen i kø, eller vælg bestemte videoer. Filtre efter datointerval kommer snart.",
  faq_q9: "macOS siger, at »appen er beskadiget« — hvad gør jeg?",
  faq_a9:
    "Det er macOS Gatekeeper, der blokerer en usigneret app, ikke en egentlig skade. Se [Første start på macOS](#macos-first-launch) for Terminal-kommandoerne, der fjerner karantænen og starter Arroxy.",
  faq_q10: "Er det lovligt at downloade YouTube-videoer?",
  faq_a10:
    "Det afhænger af dit land og af, hvad du downloader. Download kun indhold, du ejer, indhold, der er licenseret til download, eller indhold, som loven i dit land lader dig kopiere. Du er ansvarlig for at overholde YouTubes [servicevilkår](https://www.youtube.com/t/terms) og din lokale ophavsretslovgivning. Se [Brugsvilkår](#terms).",
  plan_intro: "Stadig planlagt — nogenlunde i prioriteret rækkefølge:",
  plan_col1: "Funktion",
  plan_col2: "Beskrivelse",
  plan_r1_name: "**Filtre til afspilningslister og kanaler**",
  plan_r1_desc: "Filtre efter datointerval, når en afspilningsliste eller kanal opregnes",
  plan_r2_name: "**Præferencer for YouTube-lydspor**",
  plan_r2_desc:
    "Angiv en præference for talt sprog i hele appen, med tilsidesættelser pr. profil, når YouTube tilbyder flere lydspor",
  plan_r3_name: "**Stærkere gendannelse ved nyt forsøg**",
  plan_r3_desc:
    "En ny sti til nyt forsøg for downloads, der afbrydes af upålidelige eller problematiske internetforbindelser",
  plan_r4_name: "**Fuld downloadstyring i skuffen**",
  plan_r4_desc:
    "Gør køskuffen til en mere komplet styring, herunder ændring af målmapper for elementer i køen",
  plan_r5_name: "**Planlagte downloads**",
  plan_r5_desc: "Start en kø på et bestemt tidspunkt (kørsler om natten)",
  plan_r9_name: "**AUR-pakke**",
  plan_r9_desc: "Installer på Arch Linux og Omarchy med `yay -S arroxy-bin`",
  plan_cta:
    "Har du en funktion i tankerne? [Opret en anmodning](../../issues) — input fra fællesskabet er med til at afgøre prioriteten.",
  tech_content: TECH_CONTENT,
  support_h2: "Støt Arroxy",
  support_line:
    "Arroxy er gratis og GPLv3-licenseret — ingen reklamer, ingen sporing, intet betalt niveau. Hvis den sparer dig tid, kan du støtte udviklingen med Bitcoin, Tron eller Ethereum: adresserne står i [DONATE.md](DONATE.md), som er den eneste officielle kilde til dem. Arroxy vil aldrig sende dig en adresse via e-mail eller direkte besked. At give repoet en stjerne, rapportere fejl og forbedre oversættelser hjælper lige så meget.",
  tos_h2: "Brugsvilkår",
  tos_note:
    "Arroxy er et værktøj udelukkende til personlig, privat brug. Du er alene ansvarlig for at sikre, at dine downloads overholder YouTubes [servicevilkår](https://www.youtube.com/t/terms) og ophavsretslovgivningen i dit retssystem. Brug ikke Arroxy til at downloade, gengive eller distribuere indhold, du ikke har ret til at bruge. Udviklerne er ikke ansvarlige for misbrug.",
  footer_credit:
    'GPLv3 · Lavet med omhu af <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
