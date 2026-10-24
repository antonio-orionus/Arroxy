const TECH_CONTENT = `<details>
<summary><strong>Teknikstack</strong></summary>

- **Electron** — plattformsoberoende skrivbordsskal
- **React 19** + **TypeScript** — gränssnitt
- **Tailwind CSS v4** — formgivning
- **Zustand** — tillståndshantering
- **yt-dlp** + **ffmpeg** — motor för hämtning och sammanfogning (båda hämtas vid körning: yt-dlp hålls uppdaterat, ffmpeg/ffprobe installeras en gång och finns kvar mellan uppdateringar)
- **Vite** + **electron-vite** — byggverktyg
- **Vitest** + **Playwright** — enhetstester och end-to-end-tester

</details>

<details>
<summary><strong>Bygg från källkod</strong></summary>

### Förutsättningar — alla plattformar

| Verktyg | Version | Installation |
| ------- | ------- | ------- |
| Git     | valfri  | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` eller \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` eller \`package.json\` \`packageManager\` |

Rekommenderas: installera \`mise\` och kör sedan \`mise install\` i utcheckningen. Utan mise aktiverar du Node.js från \`.node-version\` och Bun från \`package.json\` manuellt före \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools och Python kan behövas för inbyggda ombyggnader.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Efter kloningen kör du \`mise trust && mise install\` från utcheckningen. Om ditt skal redan använder \`fnm\`, \`nvm\` eller en Bun från Homebrew, aktivera mise i \`~/.zshrc\` så att Arroxy får Node.js 24.21.0 och Bun 1.4.2:

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

### Klona och kör

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Bygg en distribuerbar version

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` installerar beroenden, bygger om Electron-appens beroenden, verifierar Electron, förbereder inbäddat ffmpeg/ffprobe för utveckling och installerar Playwright Chromium. Utgivna versioner hanterar yt-dlp, ffmpeg och ffprobe vid körning i appens datamapp; ingen av dem levereras i installationsprogrammet.

</details>`;

export const sv = {
  icon_alt: "Arroxy-maskot",
  hero_image_alt: "Klistra in en länk eller surfa bara. Arroxys URL-vy och inbyggda webbläsare, med en pågående hämtning.",
  title:
    "Arroxy — gratis hämtare med öppen källkod för YouTube (+ 2 000 webbplatser) med inbyggd webbläsare, för Windows, macOS och Linux",
  read_in_label: "Läs på:",
  badge_release_alt: "Version",
  badge_build_alt: "Bygge",
  badge_license_alt: "Licens",
  badge_platforms_alt: "Plattformar",
  badge_i18n_alt: "Språk",
  badge_website_alt: "Webbplats",
  discord_badge_text: "Gå med i Discord-communityn",
  discord_badge_encoded: "G%C3%A5%20med%20i%20Discord%2Dcommunityn",
  hero_desc:
    "Hämta videor, Shorts, kanaler, poddar eller ljudspår från **YouTube och över 2 000 webbplatser som stöds** — upp till 8K HDR i 60 fps, som MP3 / AAC / Opus, eller bara den del du behöver. **Surfa på YouTube eller någon annan webbplats direkt i Arroxy** på fliken Utforska och hämta videon, spellistan eller kanalen du befinner dig på; logga in där för att hämta videor som ditt eget konto redan får se. Körs lokalt på Windows, macOS och Linux. **Ingen reklam, ingen onödig kod, ingen merförsäljning.**",
  cta_latest: "↓ Installera senaste versionen",
  cta_website: "Webbplats",
  website_url: "https://arroxy.com/",
  star_cta: "Om Arroxy sparar tid åt dig hjälper en ⭐ andra att hitta det.",
  ai_notice: "> 🌐 Den här översättningen har tagits fram med hjälp av AI. Den [engelska README-filen](README.md) är den överordnade källan. Hittat ett fel? [Öppna en PR](../../pulls).",
  intro_what_is:
    "**Vad är Arroxy?** Arroxy är ett gratis skrivbordsgränssnitt med öppen källkod som hämtar videor, ljud, spellistor och undertexter från YouTube och över 2000 andra webbplatser som stöds av [yt-dlp](https://github.com/yt-dlp/yt-dlp). Det körs på Windows 10/11, macOS 13+ (Intel + Apple Silicon) och Linux (AppImage, Flatpak, tar.gz). GPLv3-licens. Inga annonser, inga användningsgränser. Distribueras via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage och direkthämtning.",
  intro_key_difference:
    "**Viktig skillnad: en inbyggd webbläsare.** De flesta gratis YouTube-hämtare är tunna omslag kring yt-dlp: en webbadressruta och en formatmeny, utan egen webbläsare. Arroxy har en, **fliken Utforska**. Du surfar på YouTube eller någon annan webbplats i appen och hämtar videon, spellistan eller kanalen du är på, eller högerklickar på valfri länk. Om du loggar in en gång i Utforska använder hämtningar som kräver ett konto den inloggningen: dina privata videor, dina listor Titta senare och Gillade och andra videor som ditt konto redan får se, utan att exportera cookies. Logga in på andra webbplatser där också, så använder deras hämtningar den inloggningen när de behöver den. Detaljer: [Varför Arroxy](#why-explore).",
  last_updated: "Senast uppdaterad: {{LAST_UPDATED}}.",
  toc_heading: "Innehåll",
  why_h2: "Varför Arroxy",
  features_h2: "Funktioner",
  dl_h2: "Installation och första start",
  privacy_h2: "Integritet",
  faq_h2: "Vanliga frågor",
  roadmap_h2: "Färdplan",
  tech_h2: "Byggt med",
  why_intro: "En jämförelse sida vid sida med de vanligaste alternativen:",
  why_r1: "Gratis, ingen premiumnivå",
  why_r2: "Öppen källkod",
  why_r3: "Endast lokal bearbetning",
  why_r5: "Inga användningsgränser",
  why_r6: "Plattformsoberoende skrivbordsapp",
  why_r7: "Undertexter + SponsorBlock",
  why_r8: "Inbyggd webbläsare (surfa, logga in, hämta)",
  why_r9: "Videor som ditt eget konto får se, utan att exportera cookies",
  why_table_note:
    "⚠️ = delvis, eller bara på en betalnivå. 4K Video Downloaders inloggning i appen för privata videor är en betalfunktion; de flesta gratis gränssnitt för yt-dlp accepterar bara en cookiefil eller läser cookies från din webbläsare.",
  why_summary:
    "Arroxy är byggt för en enda sak: en ren lokal fil, oavsett om du klistrar in en webbadress eller hittar videon i Utforska. Ingen merförsäljning, ingen datainsamling.",
  why_explore_h3: "Vad ett enkelt yt-dlp-omslag inte kan: fliken Utforska",
  why_explore_intro:
    "De flesta gratis YouTube-hämtare är en webbadressruta ovanpå yt-dlp. Arroxy använder också yt-dlp, men har dessutom **Utforska**, en webbläsare inbyggd i appen som öppnar YouTube eller någon annan webbplats. Utforska lägger till det en webbadressruta inte klarar:",
  why_explore_1:
    "**Videor som ditt konto får se, utan att exportera cookies** — dina privata videor, dina listor Titta senare och Gillade, åldersbegränsade videor på ett åldersverifierat konto och sidor på andra webbplatser som kräver din inloggning. Ett enkelt omslag kräver en exporterad cookies.txt eller läser cookies från din webbläsare. I Arroxy loggar du in en gång i Utforska så sköter det resten",
  why_explore_4:
    "**Inget kopierande av länkar** — hitta en video, spellista eller kanal i Utforska och hämta den med ett klick, eller högerklicka på valfri länk på sidan",
  why_explore_5:
    "**Annonsblockerare när du vill ha den** — ett klick på skölden blockerar annonser och spårare på Utforskas sidor",
  feat_explore_h3: "Utforska: surfa på webben i Arroxy",
  feat_explore_1:
    "**Fliken Utforska** — surfa på YouTube eller någon annan webbplats i Arroxy och hämta det du hittar utan att kopiera länkar. **Hämta · *din profil*** köar videon, spellistan eller kanalen du tittar på; pilen intill byter profil, och trollspöet öppnar den stegvisa hämtningen där du väljer format, undertexter och mer",
  feat_explore_6:
    "**Högerklicka för att hämta** — högerklicka på valfri video-, spellist- eller kanallänk i Utforska för att hämta den med din profil, välja en annan profil under **Hämta med**, öppna den stegvisa hämtningen eller kopiera länken. Du behöver inte öppna varje video först",
  feat_explore_7:
    "**Kompakt layout** — ett klick i Utforskas verktygsfält flyttar Arroxys flikar dit och ger sidan mer utrymme",
  feat_explore_2:
    "**Adressfält** — skriv för att söka på YouTube, eller ange valfri webbadress för att öppna den webbplatsen",
  feat_explore_3:
    "**Hämtningar som kräver ett konto** — logga in en gång i Utforska så kan Arroxy hämta videor som ditt konto får se: dina privata videor, åldersbegränsade videor om kontot är åldersverifierat, samt dina listor Titta senare och Gillade. Logga in på andra webbplatser där också, så använder deras hämtningar den inloggningen när de behöver den. Arroxy hämtar fortfarande utloggat först och använder din inloggning i Utforska bara när en hämtning misslyckas på ett sätt som ett konto kan åtgärda",
  feat_explore_4:
    "**Använd ett sekundärt konto** — Utforskas första skärm förklarar varför: att hämta med ett konto innebär en viss risk att kontot begränsas. Logga ut från Utforska i Inställningar när du vill glömma dina inloggningar",
  feat_explore_5:
    "**Annonsblockerare** — av som standard. Ett klick på skölden i Utforskas verktygsfält blockerar annonser och spårare på dess sidor, utan att påverka hämtningar. YouTube kan göra motstånd mot annonsblockerare för inloggade konton",
  feat_quality_h3: "Kvalitet och format",
  feat_quality_1: "Upp till **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Hög bildfrekvens och HDR** bevaras som de är — 60 fps, HDR10",
  feat_quality_3:
    "**Ljud** — exportera endast ljud som MP3, M4A/AAC, Opus eller WAV. Vid interaktiva hämtningar kan du välja källans egna surround-/Dolby-spår (AC-3, E-AC-3, 5.1, DRC) när de finns, eller ange ett globalt standardval för **Föredra surround / Dolby**",
  feat_quality_4:
    "**Profiler med ett mål** — *Bästa bild* (AV1 · VP9) eller *Smart TV* (MP4 · H.264), sparade som Auto, MP4, MKV eller WebM utan omkodning. HDR är *Auto* (bara när din skärm kan visa det), *SDR* eller *HDR*",
  feat_quality_5:
    "**Alla codecs vid alla upplösningar** — den stegvisa hämtningen listar AV1, VP9 och H.264 sida vid sida vid varje upplösning, så att du kan välja den som din tv eller ditt redigeringsprogram spelar upp",
  feat_quality_6:
    "**Se vad en ström egentligen är** — storlekar som YouTube skalat upp med AI, AI-dubbade ljudspråk, strömmar med förbättrad bithastighet, 360°-videor samt skadade eller vattenstämplade kopior markeras. Profiler hoppar över AI-uppskalade strömmar om du inte tillåter dem",
  feat_privacy_h3: "Integritet och kontroll",
  feat_privacy_1:
    "100 % lokal bearbetning — hämtningar går direkt från YouTube till din disk",
  feat_privacy_2: "**Öppen källkod** — varje rad kan granskas, licensierad under GPLv3",
  feat_privacy_3: "Filer sparas direkt i mappen du väljer",
  feat_workflow_h3: "Arbetsflöde",
  feat_workflow_12:
    "**Globalt kortkommando för hämtning** — kopiera en länk i vilken app som helst och tryck på `Ctrl+Shift+D` (`Cmd+Shift+D` på macOS); Arroxy köar den med din aktiva profil utan att öppna fönstret, och en avisering bekräftar det. På som standard, kan ändras",
  feat_workflow_1:
    "**Flexibla startlägen** — välj en guidad enskild hämtning, spellistans/kanalens väljare, inklistring av flera webbadresser, snabbhämtning med sparade standardvärden, eller surfa och hämta från Utforska",
  feat_workflow_2:
    "**Central hämtningskö** — varje enskilt, spellists-, flerwebbadress- eller snabbjobb hamnar på ett ställe för förlopp, paus, återupptagning, avbrott, nytt försök och prioritetskontroll",
  feat_workflow_3:
    "**Bevakning av Urklipp** — kopiera en videolänk så fylls webbadressfältet i när du kommer tillbaka till Arroxy, med **Ångra** om du inte menade det. Medan Arroxy är upptaget väntar länken tills du är tillbaka på fliken för webbadresser (stäng av det i Inställningar)",
  feat_workflow_4:
    "**Automatisk rensning av webbadresser** — tar bort spårningsparametrar (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) och packar upp `youtube.com/redirect`-länkar",
  feat_workflow_5:
    "**Systemfältsläge** — om du stänger fönstret fortsätter hämtningarna i bakgrunden",
  feat_workflow_6:
    "**{{LANG_COUNT}} språk** — identifierar systemets språk automatiskt, kan bytas när som helst",
  feat_workflow_7:
    "**Spellistesynkronisering** — skanna en spellista mot en lokal mapp för att hoppa över redan hämtade videor; skapar en `.m3u`-spellistefil som uppdateras allteftersom varje video hämtas",
  feat_workflow_8:
    "**Kontroll av hastighet och tempo** — begränsa bandbredden, ange hur många delar av en video som hämtas samtidigt och lägg till fördröjningar mellan förfrågningar med förinställningar (*Av · Balanserad · Försiktig · Anpassad*)",
  feat_workflow_9:
    "**Filnamnsmallar** — namnge hämtningar på ditt sätt med `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` och `{playlist_index}`, globalt eller per hämtningsprofil",
  feat_workflow_10:
    "**Samtidiga hämtningar och automatiska nya försök** — välj hur många köade hämtningar som körs samtidigt, och låt Arroxy försöka igen med en hämtning som drabbats av ett nätverks- eller serverproblem, med längre väntetid före varje försök",
  feat_workflow_11:
    "**Profiler per spellisteobjekt** — tilldela varje video i en spellista en egen hämtningsprofil i stället för en inställning för hela listan, så att du i ett svep kan arkivera vissa i full kvalitet och spara resten som endast ljud",
  feat_workflow_13:
    "**Snabbhämtning fungerar i bakgrunden** — länken dyker upp i Hämtningar direkt och förbereds där, en notis med **Visa** bekräftar det och webbadressfältet töms för nästa länk. Starta så många du vill medan tidigare förbereds",
  feat_workflow_14:
    "**Hämtningar visar vad som behöver dig** — om Arroxy inte kan läsa en länk förklarar raden varför och erbjuder åtgärden: Försök igen, slå på cookies eller logga in i Utforska. Med cookies avstängda försöker **Logga in med Utforska** igen åt dig när du har loggat in. En spellista som är längre än din inläsningsgräns väntar på sin rad på att du väljer allt, de första eller en granskning. Fliken Hämtningar räknar raderna som väntar på dig",
  feat_workflow_15:
    "**Hämta bara en del av en video** — välj en start och ett slut, eller ett kapitel, på formatskärmen så sparar Arroxy bara det intervallet, med intervallet i filnamnet efter video-id:t. Klippen hamnar på närmaste nyckelbild; slå på exakt klipp för att koda om i stället",
  feat_workflow_16:
    "**Ta bort slutförda hämtningar** — valfritt: en slutförd hämtning försvinner från listan 5 sekunder senare. Dess filer finns kvar på disken, och misslyckade hämtningar förblir listade",
  feat_workflow_17:
    "**Storlek och Saknas i Hämtningar** — en sorterbar kolumn **Storlek** visar hur mycket utrymme varje hämtning tar, och **Saknas** flaggar filer som flyttats eller tagits bort utanför Arroxy",
  feat_workflow_18:
    "**Aurora eller Minimal, mörkt eller ljust** — glaspaneler över en rörlig himmel, eller lugna solida ytor; växla från sidfoten. Datorer utan grafikacceleration får automatiskt Minimal",
  feat_workflow_19:
    "**Menyrad på Mac** — på macOS öppnar du Inställningar (`Cmd+,`), anger hastighetsgräns för hämtning, byter stil och tema samt öppnar loggar eller sparar en diagnostikfil från menyraden",
  feat_workflow_20:
    "**Ändra en profil från valfri hämtning** — justera en hämtning och uppdatera sedan profilen den startade från (med en förhandsvisning av vad som ändras) eller spara inställningarna som en ny profil. När du byter profil frågar Arroxy om dina ändringar ska behållas",
  feat_post_h3: "Undertexter och efterbearbetning",
  feat_post_1:
    "**Undertexter** i SRT, VTT eller ASS — manuella eller automatiskt genererade, på alla tillgängliga språk",
  feat_post_2:
    "Spara bredvid videon, bädda in i `.mkv` eller organisera i en undermapp `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — hoppa över eller kapitelmarkera sponsorer, intron, outron och egenreklam",
  feat_post_4:
    "**Inbäddad metadata** — titel, uppladdningsdatum, kanal, beskrivning, miniatyr och kapitelmarkeringar skrivs in i filen",
  feat_post_5:
    "**Batchar med endast undertexter** — klistra in en lista med webbadresser eller öppna en spellista, välj Undertexter och få bara textfilerna för varje video",
  feat_sites_h3: "YouTube + 2 000 webbplatser",
  feat_sites_1:
    "**YouTube, fullt ut** — Videor, Shorts, kanaler, spellistor, YouTube Music och poddar hanteras som förstklassiga källor",
  feat_sites_2:
    "**Över 2 000 andra webbplatser** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable och många fler",
  feat_sites_3:
    "**Endast ljud och undertexter** fungerar på alla webbplatser som stöds, inte bara YouTube",
  feat_sites_4:
    "Om en webbplats ändras levererar yt-dlp korrigeringar varje vecka och Arroxy uppdaterar binärfilen automatiskt vid start",
  shot1_cap:
    "<b>Startsida för snabbhämtning</b><br/>Klistra in en webbadress och hämta direkt med din aktiva profil",
  shot2_cap:
    "<b>Återanvändbara hämtningsprofiler</b><br/>Spara förinställningar för format, kvalitet och utdata — återanvänd per hämtning",
  shot3_cap:
    "<b>Ljudspår på flera språk</b><br/>Välj exakt det ljudspråk som videon levereras med",
  shot4_cap:
    "<b>Surround-/Dolby-ljud</b><br/>5.1- och Dolby-spår identifieras och bevaras",
  shot5_cap:
    "<b>Läge för flera webbadresser</b><br/>Klistra in en lista, ta bort dubbletter automatiskt och köa alla på en gång",
  shot6_cap:
    "<b>Parallell hämtningskö</b><br/>Flera hämtningar samtidigt med förlopp i realtid",
  hotkey_fig_alt:
    "Arroxys globala kortkommando för hämtning — Ctrl+Shift+D i Windows och Linux, Cmd+Shift+D i macOS, skickar den kopierade länken direkt till hämtningskön",
  hotkey_fig_cap:
    "<b>Globalt kortkommando för hämtning</b><br/>Kopiera en länk var som helst, tryck en gång — den hamnar i kön och börjar hämtas",
  shot7_cap:
    "<b>Profiler per spellisteobjekt</b><br/>Ge varje video sin egen profil — arkivera vissa i 4K, spara resten som endast ljud",
  shot8_cap:
    "<b>Utforska</b><br/>Surfa på YouTube eller någon annan webbplats i Arroxy och hämta sidan du befinner dig på med din aktiva profil",
  shot9_cap:
    "<b>Utforskas första skärm</b><br/>En snabb titt på Utforska, och varför ett sekundärt konto är den säkrare inloggningen",
  shot10_cap:
    "<b>Hämtningar visar vad som behöver dig</b><br/>Länkar förbereds i bakgrunden; en som misslyckats erbjuder sin åtgärd, en lång spellista väntar på ditt val",
  shot11_cap:
    "<b>Hämta bara en del av en video</b><br/>Välj en start och ett slut, eller ett kapitel — Arroxy sparar bara det intervallet",
  shot12_cap:
    "<b>Profilredigerare</b><br/>Justera en profil: filtyp, upplösning, undertexter, mål, filnamnsmall och mer",
  shot13_cap:
    "<b>Mörkt eller ljust, glas eller solid</b><br/>Fyra utseenden att välja bland: glaspaneler över en rörlig himmel eller lugna solida ytor, vart och ett i mörkt och ljust",
  shot14_cap:
    "<b>8K HDR i 60 fps</b><br/>Varje upplösning, codec och HDR-ström som en video erbjuder, sida vid sida",
  dl_platform_col: "Plattform",
  dl_format_col: "Direkthämtning",
  dl_oneline_note:
    "Byggen finns bara för x86_64. Ingen `curl`? Byt `curl -fsSL` mot `wget -qO-`.",
  dl_win_scoop:
    "Föredrar du Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Installationsprogram (NSIS) eller portabel `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` eller `.flatpak` (i sandlåda)",
  dl_grab: "Alla filer i versionen →",
  dl_pkg_h3: "Installera via pakethanterare",
  dl_channel_col: "Kanal",
  dl_command_col: "Kommando",
  dl_win_h3: "Windows: installationsprogram eller portabel",
  dl_win_col_installer: "NSIS-installationsprogram",
  dl_win_col_portable: "Portabel `.exe`",
  dl_win_r1: "Installation krävs",
  dl_win_r1_installer: "Ja",
  dl_win_r1_portable: "Nej — kör var som helst",
  dl_win_r2: "Automatiska uppdateringar",
  dl_win_r2_installer: "✅ i appen",
  dl_win_r2_portable: "❌ manuell hämtning",
  dl_win_r3: "Starthastighet",
  dl_win_r3_installer: "✅ snabbare",
  dl_win_r3_portable: "⚠️ långsammare kallstart",
  dl_win_r4: "Läggs till i Start-menyn",
  dl_win_r5: "Enkel avinstallation",
  dl_win_r5_portable: "❌ ta bort filen",
  dl_win_rec:
    "**Rekommendation:** använd NSIS-installationsprogrammet för automatiska uppdateringar och snabbare start. Använd den portabla `.exe`-filen om du vill slippa installation och registerändringar.",
  dl_win_smartscreen_h4: "Varning från Windows SmartScreen",
  dl_win_smartscreen_intro:
    'Vid första start kan du se **”Windows skyddade datorn”** eller **”Okänd utgivare”.** Det gäller både `Arroxy-win-x64-Setup.exe` och `Arroxy-win-x64-Portable.exe`. Arroxy är gratis och har öppen källkod, och Windows-byggena är inte kodsignerade med ett betalt certifikat, vilket är därför SmartScreen flaggar dem. Det betyder **inte** automatiskt att Arroxy är osäkert. Så här fortsätter du:',
  dl_win_smartscreen_step1: "Klicka på **Mer information**.",
  dl_win_smartscreen_step2: "Klicka på **Kör ändå**.",
  dl_win_smartscreen_official:
    "Hämta bara Arroxy från den officiella sidan GitHub Releases. Om du fick filen från en annan webbplats eller någon skickade den till dig, ta bort den och hämta en ny kopia från den officiella källan. Källkoden är offentlig, så du kan granska den eller bygga Arroxy själv om du föredrar det.",
  dl_macos_h3: "Första start på macOS",
  dl_macos_warning:
    "Arroxy är ännu inte kodsignerat, så macOS Gatekeeper kan visa varningen om skadad app vid första start. Det är väntat — det är inte ett tecken på att filen faktiskt är skadad.",
  dl_macos_m1_h4: "Terminalmetod:",
  dl_macos_step1: "Dra `Arroxy.app` från den monterade DMG-filen till `/Applications`.",
  dl_macos_step2:
    "Öppna Terminal och kör `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Kör `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Om appens sökväg är en annan, ersätt `/Applications/Arroxy.app` med sökvägen du installerade till.",
  dl_macos_step5:
    "Ange ditt Mac-lösenord om `sudo` frågar efter det.",
  dl_macos_after:
    "När karantänen har tagits bort öppnas Arroxy som vanligt.",
  dl_macos_m2_h4: "Terminalmetod:",
  dl_macos_note:
    "macOS-byggen produceras via CI på Apple Silicon- och Intel-körare. Om du stöter på problem, [öppna ett ärende](../../issues) — synpunkter från macOS-användare formar aktivt macOS-testcykeln.",
  dl_linux_h3: "Första start på Linux",
  dl_linux_intro:
    "AppImage-filer körs direkt — ingen installation. Du behöver bara markera filen som körbar.",
  dl_linux_m1_text:
    "**Filhanterare:** högerklicka på `.AppImage` → **Egenskaper** → **Behörigheter** → aktivera **Tillåt körning av filen som program** och dubbelklicka sedan.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Om starten fortfarande misslyckas, kör den utan montering — inget FUSE-paket behövs:",
  dl_linux_targz_h4: "Vanligt tarball-arkiv (inget FUSE, ingen installation):",
  dl_linux_targz_text: "Bygget `.tar.gz` är samma app utan AppImage-omslaget — packa upp det var som helst och kör det. Inget installationsprogram och inget FUSE-paket behövs.",
  dl_linux_arch_note: "**Linux-filerna på versionssidan finns bara för x86_64.** På ARM64-datorer (Raspberry Pi, Asahi Linux) installeras Flatpak ändå, men misslyckas vid start med `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Varför du kan se en varning",
  dl_warning_p1:
    "Arroxy har öppen källkod och är licensierat under GPLv3. Windows- och macOS-byggena är **inte kodsignerade** — Apple Developer ID och Windows EV-kodsigneringscertifikat kostar vart och ett hundratals dollar om året, vilket ett indieprojekt betalar ur egen ficka. Utan de signaturerna varnar Windows SmartScreen och macOS Gatekeeper dig vid första start. Varningarna betyder att *ditt operativsystem inte känner igen utgivaren* — de betyder inte att Arroxy är skadlig kod.",
  dl_warning_p2:
    "Tre sätt att verifiera Arroxy själv, med stigande noggrannhet:\n\n- **Läs källkoden.** Varje rad finns på [GitHub](https://github.com/antonio-orionus/Arroxy) och du kan [bygga den från källkod](#tech).\n- **Kontrollera SHA256.** Jämför din fil med den publicerade [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — se [Verifiera din hämtning](#verify) nedan.\n- **Kör en tredjepartsskanning.** Ladda upp filen till [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Första start i Windows",
  shot_smartscreen_more_alt:
    'SmartScreen-dialogrutan ”Windows skyddade datorn” med länken ”Mer information” markerad',
  shot_smartscreen_run_alt:
    'SmartScreen-dialogrutan efter att Mer information har expanderats, med knappen ”Kör ändå”',
  dl_win_defender_h4: "Om Windows Defender flaggar eller tar bort filen",
  dl_win_defender_p:
    "Defenders heuristik flaggar ibland osignerade NSIS-installationsprogram och portabla Electron-appar som misstänkta. Om Defender sätter `Arroxy-win-x64-Setup.exe` eller `Arroxy-win-x64-Portable.exe` i karantän, återställ den från **Windows-säkerhet → Virus- och hotskydd → Skyddshistorik** och lägg sedan till Arroxys körbara fil som ett tillåtet objekt under **Hantera inställningar → Lägg till eller ta bort undantag**. Precis som med SmartScreen beror det på den saknade utgivarsignaturen, inte på upptäckt skadlig kod.",

  dl_macos_first_h3: "Första start på macOS",
  dl_macos_intro:
    "Arroxys macOS-byggen är ad hoc-signerade men inte notariserade av Apple, så Gatekeeper blockerar första starten med *”Arroxy.app” har inte öppnats — Apple kunde inte verifiera att ”Arroxy.app” är fri från skadlig kod*. Det betyder att macOS inte kan kontrollera appen hos Apple, inte att något är fel på filerna. Om du installerar med Homebrew slipper du den här dialogrutan helt. Om du använde DMG-filen löser ett Terminal-kommando det:",
  dl_macos_sequoia_h4: "Åtgärd i Terminal för aktuell macOS",
  dl_macos_sequoia_intro:
    "Använd Terminal efter att du kopierat Arroxy till Applications:",
  dl_macos_sequoia_step1:
    "Dra `Arroxy.app` från den monterade DMG-filen till `/Applications`.",
  dl_macos_sequoia_step2:
    "Öppna Terminal och kör de här två kommandona:",
  dl_macos_sequoia_step3:
    "Kör `open /Applications/Arroxy.app` för att starta Arroxy.",
  dl_macos_sequoia_step4:
    "Om appens sökväg är en annan, ersätt `/Applications/Arroxy.app` med sökvägen du installerade till.",
  dl_macos_sonoma_h4: "Åtgärd i Terminal för äldre macOS",
  dl_macos_sonoma_step1:
    "Dra `Arroxy.app` från den monterade DMG-filen till `/Applications`.",
  dl_macos_sonoma_step2:
    "Öppna Terminal och ta bort karantänen från `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Starta Arroxy från Terminal eller Finder efter att karantänen har tagits bort.",
  dl_macos_damaged_h4:
    "Åtgärd för Gatekeeper-karantän",
  dl_macos_damaged_p:
    "Det första kommandot tar bort karantänattributet som macOS satte när filen hämtades; det andra startar appen. Du behöver normalt inte `sudo`, eftersom kopian i `/Applications` tillhör dig — lägg bara till det om du får ett behörighetsfel.",
  dl_macos_arch_note:
    "**Apple Silicon eller Intel:** på en Mac med M-serien (M1 / M2 / M3 / M4) hämtar du DMG-filen `arm64`. På Intel-Mac hämtar du DMG-filen `x64`. Att köra fel bygge fungerar via Rosetta men är märkbart långsammare.",

  dl_linux_first_h3: "Första start på Linux",
  dl_linux_appimagelauncher:
    "**Valfri skrivbordsintegrering:** installera [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) en gång, så registreras varje AppImage du dubbelklickar på automatiskt i din startmeny — ingen manuell `.desktop`-fil behövs.",

  dl_verify_h3: "Verifiera din hämtning (SHA256)",
  dl_verify_intro:
    "Varje version publicerar en `SHA256SUMS`-fil tillsammans med binärfilerna. För att kontrollera att din hämtade fil inte skadades eller manipulerades under överföringen beräknar du en hash av filen lokalt och jämför med raden i `SHA256SUMS`. Öppna sidan för den senaste versionen → **Assets** → hämta `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell eller Kommandotolken):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Vill du ha en skanning efter skadlig kod från tredje part? Ladda upp filen på [VirusTotal](https://www.virustotal.com). Ett fåtal generiska heuristikflaggor från mindre motorer är normalt för osignerade Electron-appar; utbredda träffar från stora motorer vore ett verkligt orosmoment.",

  dl_pm_intro:
    "Föredrar du en annan kanal? De här fungerar också, och de hänger med i varje version.",

  privacy_p1:
    "Hämtningar görs direkt via [yt-dlp](https://github.com/yt-dlp/yt-dlp) från YouTube till mappen du väljer — inget dirigeras via en tredjepartsserver. Visningshistorik, hämtningshistorik, webbadresser och filinnehåll stannar på din enhet.",
  privacy_reports:
    "Ingen spårning — en anonym hjärtslagssignal per dag (appversion, operativsystem, språk, installationskanal, land och ungefär hur länge sedan Arroxy installerades) så att vi kan räkna aktiva och nya användare, och när Arroxy hämtar eller uppdaterar yt-dlp och FFmpeg en anonym notering om det lyckades och ungefär hur lång tid det tog. Inga ID:n, webbadresser, videotitlar, filsökvägar eller kontouppgifter. Du kan stänga av båda i Inställningar.",
  privacy_p3:
    "Utforska har sina egna inloggningar, skilda från din webbläsare, och Arroxy läser eller fyller aldrig i ett inloggningsformulär — du skriver på webbplatsens egen sida. Hämtningar körs utloggade; bara när en misslyckas på ett sätt som ett konto kan åtgärda läser Arroxy inloggningen på nytt, sparar den i en temporär fil för den hämtningen och tar bort filen efteråt. Om du loggar ut från Utforska i Inställningar glöms de.",
  faq_q1: "Är det verkligen gratis?",
  faq_a1: "Ja — licensierat under GPLv3, ingen premiumnivå, ingen funktionsspärr.",
  faq_q11: "Hur skiljer sig Arroxy från andra gränssnitt för yt-dlp?",
  faq_a11:
    "De flesta gratis gränssnitt för yt-dlp är omslag som bara tar en länk. Arroxy lägger till **Utforska**, en webbläsare inbyggd i appen som öppnar YouTube eller någon annan webbplats: du surfar och hämtar utan att kopiera länkar, och loggar in där en gång för att hämta videor som ditt konto får se, till exempel dina privata videor och dina listor Titta senare och Gillade, utan cookieexport. Se [Varför Arroxy](#why).",
  faq_q2: "Vilka videokvaliteter kan jag hämta?",
  faq_a2:
    "Allt YouTube erbjuder: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus endast ljud. Strömmar med 60 fps och HDR bevaras som de är, och den stegvisa hämtningen låter dig välja AV1, VP9 eller H.264 vid varje upplösning.",
  faq_q3: "Kan jag extrahera bara ljudet som MP3?",
  faq_a3:
    "Ja. Välj *endast ljud* i formatmenyn och välj MP3, M4A/AAC, Opus eller WAV.",
  faq_q4: "Hur hämtar jag videor som kräver ett YouTube-konto?",
  faq_a4:
    "Logga in en gång på fliken Utforska. Arroxy kan då hämta videor som ditt konto får se: dina privata videor, åldersbegränsade videor om kontot är åldersverifierat, samt dina listor Titta senare och Gillade. Den använder inloggningen bara när en hämtning misslyckas på ett sätt som ett konto kan åtgärda; allt annat hämtas som förut. Det här är valet **Inloggning i Utforska**, som står först och är markerat Rekommenderas i cookieinställningarna, och Arroxy väljer det åt dig första gången du öppnar Utforska. yt-dlp:s wiki noterar att [inloggad automatisering kan flagga ett Google-konto](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), så ett sekundärt konto är det säkrare valet.",
  faq_q5: "Fortsätter det att fungera när YouTube ändrar något?",
  faq_a5:
    "yt-dlp uppdateras automatiskt vid start, och Arroxy levererar korrigeringar snabbt när YouTube ändrar något. När en hämtning kräver en inloggning använder Arroxy din inloggning i Utforska om du har loggat in där, och cookies från en fil eller din webbläsare finns i cookieinställningarna.",
  faq_q6: "Vilka språk finns Arroxy på?",
  faq_a6:
    "{{LANG_COUNT}} språk, direkt ur lådan: {{LANG_NAME_LIST}}. Arroxy identifierar operativsystemets språk automatiskt vid första start och du kan byta när som helst i språkväljaren i verktygsfältet. JSON-filer för språk vid körning finns i src/shared/i18n/locales/, och PO-kataloger för översättare finns i i18n/locales/ — öppna en PR på GitHub för att bidra.",
  faq_q7: "Behöver jag installera något mer?",
  faq_a7:
    "Nej. yt-dlp, ffmpeg och ffprobe hämtas automatiskt vid första start och sparas på din dator. Därefter behövs ingen extra konfiguration.",
  faq_q8: "Kan jag hämta spellistor eller hela kanaler?",
  faq_a8:
    "Ja — båda. Klistra in en spellistas eller kanals webbadress (t.ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); välj hur många poster som ska skannas och köa sedan hela listan eller välj specifika videor. Datumintervallfilter kommer snart.",
  faq_q9: 'macOS säger att ”appen är skadad” — vad gör jag?',
  faq_a9:
    'Det är macOS Gatekeeper som blockerar en osignerad app, inte faktisk skada. Se [Första start på macOS](#macos-first-launch) för Terminal-kommandona som tar bort karantänen och startar Arroxy.',
  faq_q10: "Är det lagligt att hämta YouTube-videor?",
  faq_a10:
    "Det beror på ditt land och på vad du hämtar. Hämta bara innehåll som du äger, innehåll som är licensierat för hämtning eller innehåll som lagen i ditt land låter dig kopiera. Du ansvarar för att följa YouTubes [användarvillkor](https://www.youtube.com/t/terms) och dina lokala upphovsrättslagar. Se [Användarvillkor](#terms).",
  plan_intro: "Fortfarande planerat — ungefär i prioritetsordning:",
  plan_col1: "Funktion",
  plan_col2: "Beskrivning",
  plan_r1_name: "**Filter för spellistor och kanaler**",
  plan_r1_desc: "Datumintervallfilter vid uppräkning av en spellista eller kanal",
  plan_r2_name: "**Inställningar för YouTubes ljudspår**",
  plan_r2_desc:
    "Ange en appövergripande inställning för talat språk, med åsidosättningar per profil när YouTube erbjuder flera ljudspår",
  plan_r3_name: "**Starkare återhämtning vid nya försök**",
  plan_r3_desc:
    "En ny väg för nya försök för hämtningar som avbrutits av opålitliga eller problematiska internetanslutningar",
  plan_r4_name: "**Fullständig hanterare för hämtningar**",
  plan_r4_desc:
    "Gör köpanelen till en fylligare hanterare, inklusive möjlighet att ändra målmappar för köade objekt",
  plan_r5_name: "**Schemalagda hämtningar**",
  plan_r5_desc: "Starta en kö vid en angiven tid (nattkörningar)",
  plan_r9_name: "**AUR-paket**",
  plan_r9_desc: "Installera på Arch Linux och Omarchy med `yay -S arroxy-bin`",
  plan_cta:
    "Har du en funktion i åtanke? [Öppna en förfrågan](../../issues) — input från communityn styr prioriteringen.",
  tech_content: TECH_CONTENT,
  support_h2: "Stöd Arroxy",
  support_line:
    "Arroxy är gratis och licensierat under GPLv3 — ingen reklam, ingen spårning, ingen betalnivå. Om det sparar tid åt dig kan du stödja utvecklingen med Bitcoin, Tron eller Ethereum: adresserna finns i [DONATE.md](DONATE.md), som är den enda officiella källan till dem. Arroxy skickar aldrig en adress till dig via e-post eller direktmeddelande. Att stjärnmärka repot, rapportera buggar och förbättra översättningar hjälper lika mycket.",
  tos_h2: "Användarvillkor",
  tos_note:
    "Arroxy är ett verktyg endast för personligt, privat bruk. Du ansvarar själv för att dina hämtningar följer YouTubes [användarvillkor](https://www.youtube.com/t/terms) och upphovsrättslagarna i din jurisdiktion. Använd inte Arroxy för att hämta, kopiera eller distribuera innehåll som du inte har rätt att använda. Utvecklarna ansvarar inte för missbruk.",
  footer_credit:
    'GPLv3 · Gjort med omsorg av <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
