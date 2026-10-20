const TECH_CONTENT = `<details>
<summary><strong>Tehnoloģijas</strong></summary>

- **Electron** — starpplatformu darbvirsmas čaula
- **React 19** + **TypeScript** — lietotāja saskarne
- **Tailwind CSS v4** — stili
- **Zustand** — stāvokļa pārvaldība
- **yt-dlp** + **ffmpeg** — lejupielādes un apvienošanas dzinējs (abi tiek lejupielādēti darbības laikā: yt-dlp tiek atjaunināts, bet ffmpeg/ffprobe tiek instalēti vienreiz un saglabāti pēc atjauninājumiem)
- **Vite** + **electron-vite** — būvēšanas rīki
- **Vitest** + **Playwright** — vienību un pilnās ķēdes testi

</details>

<details>
<summary><strong>Būvēšana no pirmkoda</strong></summary>

### Priekšnosacījumi — visas platformas

| Rīks    | Versija | Instalēšana |
| ------- | ------- | ------- |
| Git     | jebkura | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` vai \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` vai \`package.json\` \`packageManager\` |

Ieteicams: instalējiet \`mise\`, pēc tam repozitorijā izpildiet \`mise install\`. Bez mise pirms \`bun run bootstrap\` manuāli aktivizējiet Node.js no \`.node-version\` un Bun no \`package.json\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Natīvajai pārbūvei var būt nepieciešami Visual Studio Build Tools un Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Pēc klonēšanas repozitorijā izpildiet \`mise trust && mise install\`. Ja jūsu čaula jau izmanto \`fnm\`, \`nvm\` vai Bun no Homebrew, aktivizējiet mise failā \`~/.zshrc\`, lai Arroxy izmantotu Node.js 24.21.0 un Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Būvēšanas un Electron izpildlaika atkarības
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tikai E2E testiem (Electron nepieciešams displejs)
sudo apt install -y xvfb
\`\`\`

### Klonēt un palaist

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # ieteicams; izlaidiet, ja piesietos rīkus aktivizējāt manuāli
bun run bootstrap
bun run doctor
bun run dev            # Electron lietotne ar Vite renderētāju
\`\`\`

### Izveidot izplatāmo pakotni

\`\`\`bash
bun run build        # tipu pārbaude + kompilēšana
bun run dist         # pakotne pašreizējai OS
bun run dist:win     # Windows mērķi, ja palaists atbalstītā resursdatorā
\`\`\`

> \`bun run bootstrap\` instalē atkarības, pārbūvē Electron lietotnes atkarības, pārbauda Electron, sagatavo iegulto ffmpeg/ffprobe izstrādei un instalē Playwright Chromium. Izlaiduma būvējumi pārvalda yt-dlp, ffmpeg un ffprobe darbības laikā jūsu lietotnes datu mapē; neviens no tiem netiek piegādāts instalētāja iekšpusē.

</details>`;

export const lv = {
  icon_alt: "Arroxy talismans",
  title:
    "Arroxy — bezmaksas atvērtā koda YouTube (+ 2000 vietņu) lejupielādētājs ar iebūvētu pārlūku operētājsistēmām Windows, macOS un Linux",
  read_in_label: "Lasīt valodā:",
  badge_release_alt: "Laidiens",
  badge_build_alt: "Būvējums",
  badge_license_alt: "Licence",
  badge_platforms_alt: "Platformas",
  badge_i18n_alt: "Valodas",
  badge_website_alt: "Vietne",
  discord_badge_text: "Pievienojieties Discord kopienai",
  discord_badge_encoded: "Pievienojieties%20Discord%20kopienai",
  hero_desc:
    "Lejupielādējiet videoklipus, Shorts, mūziku, kanālus, podkāstus vai audio celiņus no **YouTube un 2000+ atbalstītām vietnēm** — līdz pat 8K HDR ar 60 kadriem sekundē, kā MP3 / AAC / Opus vai tikai to daļu, kas jums nepieciešama. **Pārlūkojiet YouTube vai jebkuru citu vietni Arroxy iekšienē** cilnē Izpēte un lejupielādējiet video, atskaņošanas sarakstu vai kanālu, kurā atrodaties; pierakstieties tur, lai lejupielādētu privātus, tikai dalībniekiem paredzētus un vecuma ierobežotus videoklipus, ko jūsu konts var skatīties. Darbojas lokāli operētājsistēmās Windows, macOS un Linux. **Bez reklāmām, bez liekām funkcijām, bez uzmācīgas pārdošanas.**",
  cta_latest: "↓ Instalēt jaunāko laidienu",
  cta_website: "Vietne",
  website_url: "https://arroxy.com/",
  star_cta: "Ja Arroxy ietaupa jūsu laiku, ⭐ palīdz citiem to atrast.",
  ai_notice: "> 🌐 Šis tulkojums tapis ar mākslīgā intelekta atbalstu. [Angļu valodas README](README.md) ir primārais avots. Atradāt kļūdu? [Atveriet PR](../../pulls).",
  toc_heading: "Saturs",
  why_h2: "Kāpēc Arroxy",
  features_h2: "Iespējas",
  dl_h2: "Instalēšana un pirmā palaišana",
  privacy_h2: "Privātums",
  faq_h2: "BUJ",
  roadmap_h2: "Attīstības plāns",
  tech_h2: "Izveidots ar",
  why_intro: "Salīdzinājums ar visbiežāk sastopamajām alternatīvām:",
  why_r1: "Bezmaksas, bez maksas līmeņa",
  why_r2: "Atvērtais kods",
  why_r3: "Tikai lokāla apstrāde",
  why_r5: "Bez lietošanas ierobežojumiem",
  why_r6: "Starpplatformu darbvirsmas lietotne",
  why_r7: "Subtitri + SponsorBlock",
  why_r8: "Iebūvēts pārlūks (pārlūkošana, pierakstīšanās, lejupielāde)",
  why_r9: "Privāti, tikai dalībniekiem paredzēti un vecuma ierobežoti videoklipi bez sīkfailu eksportēšanas",
  why_table_note:
    "⚠️ = daļēji vai tikai maksas līmenī. 4K Video Downloader pierakstīšanās lietotnē privātiem videoklipiem ir maksas funkcija; lielākā daļa bezmaksas yt-dlp grafisko saskarņu pieņem tikai sīkfailu failu vai nolasa jūsu tīmekļa pārlūka sīkfailus.",
  why_summary:
    "Arroxy ir veidots vienam mērķim: tīram lokālam failam neatkarīgi no tā, vai ielīmējat URL vai atrodat video sadaļā Izpēte. Bez uzmācīgas pārdošanas, bez datu vākšanas.",
  why_explore_h3: "Ko vienkāršs yt-dlp apvalks nespēj: cilne Izpēte",
  why_explore_intro:
    "Lielākā daļa bezmaksas YouTube lejupielādētāju ir URL lodziņš virs yt-dlp. Arroxy arī izmanto yt-dlp, bet tam ir arī **Izpēte** — lietotnē iebūvēts pārlūks, kas atver YouTube vai jebkuru citu vietni. Izpēte pārvar ierobežojumus, ko URL lodziņš nespēj:",
  why_explore_1:
    "**Videoklipi, kuriem nepieciešams konts, bez sīkfailu eksportēšanas** — privāti, tikai dalībniekiem paredzēti un vecuma ierobežoti videoklipi (kontam ar apstiprinātu vecumu), kā arī jūsu saraksti Skatīties vēlāk un Patīk, un videoklipi aiz pierakstīšanās citās vietnēs. Vienkāršam apvalkam nepieciešams cookies.txt eksports vai tam jānolasa jūsu tīmekļa pārlūka sīkfaili, ko Chrome sistēmā Windows tagad bloķē. Arroxy jūs pierakstāties vienreiz sadaļā Izpēte, un viss pārējais notiek automātiski",
  why_explore_2:
    "**„Pierakstieties, lai apstiprinātu, ka neesat robots”** — kad YouTube to prasa, Arroxy mēģina lejupielādi vēlreiz ar jūsu pierakstīšanos sadaļā Izpēte, nevis neizdodas",
  why_explore_3:
    "**YouTube lejupielādes pilnvara** — Arroxy iebūvētais pārlūks iegūst pilnvaru, ko YouTube gaida pirms lejupielādes. Bez tās YouTube var piedāvāt mazāk formātu un zemāku kvalitāti, nekā pieprasījāt",
  why_explore_4:
    "**Nav jākopē saites** — atrodiet video, atskaņošanas sarakstu vai kanālu sadaļā Izpēte un lejupielādējiet ar vienu klikšķi vai ar peles labo pogu noklikšķiniet uz jebkuras saites lapā",
  why_explore_5:
    "**Reklāmu bloķētājs, kad vēlaties** — viens klikšķis uz vairoga bloķē reklāmas un izsekotājus sadaļas Izpēte lapās",
  feat_explore_h3: "Izpēte: pārlūkojiet tīmekli Arroxy iekšienē",
  feat_explore_1:
    "**Cilne Izpēte** — pārlūkojiet YouTube vai jebkuru citu vietni Arroxy iekšienē un lejupielādējiet atrasto, nekopējot saites. **Lejupielādēt · *jūsu profils*** pievieno rindai video, atskaņošanas sarakstu vai kanālu, ko skatāties; bulta blakus pārslēdz profilus, bet burvju nūjiņa atver soli pa solim lejupielādi formātu, subtitru un citu opciju izvēlei",
  feat_explore_6:
    "**Lejupielāde ar peles labo pogu** — ar peles labo pogu noklikšķiniet uz jebkuras video, atskaņošanas saraksta vai kanāla saites sadaļā Izpēte, lai to lejupielādētu ar savu profilu, izvēlētos citu profilu sadaļā **Lejupielādēt ar**, atvērtu soli pa solim lejupielādi vai nokopētu saiti. Nav jāatver katrs video atsevišķi",
  feat_explore_7:
    "**Kompakts izkārtojums** — viens klikšķis sadaļas Izpēte rīkjoslā pārvieto Arroxy cilnes tajā un dod lapai vairāk vietas",
  feat_explore_2:
    "**Adreses josla** — rakstiet, lai meklētu YouTube, vai ievadiet jebkuru tīmekļa adresi, lai atvērtu šo vietni",
  feat_explore_3:
    "**Lejupielādes, kurām nepieciešams konts** — pierakstieties vienreiz sadaļā Izpēte, un Arroxy varēs lejupielādēt privātus un tikai dalībniekiem paredzētus videoklipus, ko jūsu konts var skatīties, vecuma ierobežotus videoklipus, ja konts ir ar apstiprinātu vecumu, kā arī jūsu sarakstus Skatīties vēlāk un Patīk. Tur varat pierakstīties arī citās vietnēs, un to lejupielādēs šī pierakstīšanās tiks izmantota, kad tā būs nepieciešama. Arroxy vispirms joprojām lejupielādē bez pierakstīšanās un izmanto jūsu pierakstīšanos sadaļā Izpēte tikai tad, ja lejupielāde neizdodas tādā veidā, ko konts var novērst. Kad YouTube prasa apstiprināt, ka neesat robots, Arroxy arī mēģina izmantot jūsu pierakstīšanos sadaļā Izpēte",
  feat_explore_4:
    "**Izmantojiet papildu kontu** — sadaļas Izpēte pirmais ekrāns paskaidro, kāpēc: lejupielāde ar kontu rada zināmu risku, ka šis konts tiks ierobežots. Izrakstieties no sadaļas Izpēte iestatījumos, kad vien vēlaties aizmirst savas pierakstīšanās",
  feat_explore_5:
    "**Reklāmu bloķētājs** — pēc noklusējuma izslēgts. Viens klikšķis uz vairoga sadaļas Izpēte rīkjoslā bloķē reklāmas un izsekotājus tās lapās, neietekmējot lejupielādes. YouTube var pretoties reklāmu bloķētājiem pierakstītiem kontiem",
  feat_quality_h3: "Kvalitāte un formāti",
  feat_quality_1: "Līdz **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Augsts kadru ātrums un HDR** saglabāti nemainīti — 60 kadri/s, HDR10",
  feat_quality_3:
    "**Audio** — eksportējiet tikai audio kā MP3, M4A/AAC, Opus vai WAV. Interaktīvajās lejupielādēs izvēlieties avota oriģinālos telpiskā/Dolby skaņas celiņus (AC-3, E-AC-3, 5.1, DRC), kad tie ir pieejami, vai iestatiet globālu noklusējumu **Dot priekšroku telpiskajam / Dolby**",
  feat_quality_4:
    "**Profili ar mērķi** — *Labākais attēls* (AV1 · VP9) vai *Smart TV* (MP4 · H.264), saglabāti kā Automātiski, MP4, MKV vai WebM bez pārkodēšanas. HDR ir *Automātiski* (tikai tad, ja jūsu ekrāns to var attēlot), *SDR* vai *HDR*",
  feat_quality_5:
    "**Katrs kodeks katrā izšķirtspējā** — soli pa solim lejupielāde uzskaita AV1, VP9 un H.264 blakus katrā izšķirtspējā, lai varētu izvēlēties to, ko atskaņo jūsu televizors vai redaktors",
  feat_quality_6:
    "**Zini, kas straume patiesībā ir** — izmēri, ko YouTube uzlabojis ar MI, ar MI dublētas audio valodas, straumes ar uzlabotu bitrati, 360° video un bojātas vai ar ūdenszīmi marķētas kopijas ir atzīmētas. Profili izlaiž ar MI uzlabotas straumes, ja vien tās neatļaujat",
  feat_privacy_h3: "Privātums un kontrole",
  feat_privacy_1:
    "100% lokāla apstrāde — lejupielādes iet tieši no YouTube uz jūsu disku",
  feat_privacy_2: "**Atvērtais kods** — katra rindiņa pārbaudāma, licencēts ar GPLv3",
  feat_privacy_3: "Faili tiek saglabāti tieši jūsu izvēlētajā mapē",
  feat_workflow_h3: "Darbplūsma",
  feat_workflow_12:
    "**Globālais lejupielādes īsinājumtaustiņš** — nokopējiet saiti jebkurā lietotnē un nospiediet `Ctrl+Shift+D` (`Cmd+Shift+D` sistēmā macOS); Arroxy pievieno to rindai ar jūsu aktīvo profilu, neatverot logu, un paziņojums to apstiprina. Pēc noklusējuma ieslēgts, pārpiešķirams",
  feat_workflow_1:
    "**Elastīgi sākšanas režīmi** — izvēlieties vadītu atsevišķu lejupielādi, atskaņošanas saraksta/kanāla izvēli, vairāku URL ielīmēšanu, ātro lejupielādi ar saglabātiem noklusējumiem vai pārlūkojiet un lejupielādējiet sadaļā Izpēte",
  feat_workflow_2:
    "**Centrāla lejupielāžu rinda** — katrs atsevišķs, atskaņošanas saraksta, vairāku URL vai ātrais uzdevums nonāk vienuviet progresa, pauzes, atsākšanas, atcelšanas, atkārtošanas un prioritātes kontrolei",
  feat_workflow_3:
    "**Starpliktuves vērošana** — nokopējiet video saiti, un tā aizpilda URL lauku, kad atgriežaties Arroxy, ar **Atsaukt**, ja to nevēlējāties. Kamēr Arroxy ir aizņemts, saite gaida, līdz atgriežaties URL cilnē (izslēdzams iestatījumos)",
  feat_workflow_4:
    "**Automātiska URL tīrīšana** — noņem izsekošanas parametrus (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) un atver `youtube.com/redirect` saites",
  feat_workflow_5:
    "**Teknes režīms** — loga aizvēršana ļauj lejupielādēm turpināties fonā",
  feat_workflow_6:
    "**Valodu skaits: {{LANG_COUNT}}** — automātiski nosaka sistēmas valodu, pārslēdzams jebkurā laikā",
  feat_workflow_7:
    "**Atskaņošanas saraksta sinhronizēšana** — atkārtoti pārbaudiet atskaņošanas sarakstu pret lokālu mapi, lai izlaistu jau lejupielādētos video; izveido `.m3u` atskaņošanas saraksta failu, kas tiek atjaunināts, katram video lejupielādējoties",
  feat_workflow_8:
    "**Ātruma un tempa vadība** — ierobežojiet lejupielādes joslas platumu, iestatiet, cik video daļu lejupielādējas vienlaikus, un pievienojiet pieprasījumu aizkaves ar sagatavēm (*Izslēgts · Līdzsvarots · Piesardzīgs · Pielāgots*)",
  feat_workflow_9:
    "**Failu nosaukumu veidnes** — nosauciet lejupielādes pēc savas izvēles ar `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` un `{playlist_index}`, globāli vai katram lejupielādes profilam",
  feat_workflow_10:
    "**Vienlaicīgas lejupielādes un automātiska atkārtošana** — izvēlieties, cik rindā esošo lejupielāžu darbojas vienlaikus, un ļaujiet Arroxy atkārtot lejupielādi, kas saskārās ar tīkla vai servera problēmu, katru reizi gaidot ilgāk",
  feat_workflow_11:
    "**Atskaņošanas saraksta profili katram vienumam** — piešķiriet katram atskaņošanas saraksta video savu lejupielādes profilu, nevis vienu iestatījumu visam sarakstam, lai vienā piegājienā daļu arhivētu pilnā kvalitātē, bet pārējo paņemtu kā MP3",
  feat_workflow_13:
    "**Ātrā lejupielāde darbojas fonā** — saite uzreiz parādās sadaļā Lejupielādes un tiek sagatavota tur, paziņojums ar **Skatīt** to apstiprina, un URL lauks tiek notīrīts nākamajai saitei. Sāciet cik vēlaties, kamēr iepriekšējās tiek sagatavotas",
  feat_workflow_14:
    "**Lejupielādes parāda, kam vajadzīga jūsu uzmanība** — ja Arroxy nevar nolasīt saiti, tās rinda norāda iemeslu un piedāvā risinājumu: Mēģināt vēlreiz, ieslēgt sīkfailus vai pierakstīties sadaļā Izpēte. Ja sīkfaili ir izslēgti, **Pierakstīties sadaļā Izpēte** mēģina vēlreiz jūsu vietā, tiklīdz esat pierakstījies. Atskaņošanas saraksts, kas garāks par jūsu ielādes limitu, gaida savā rindā, lai izvēlētos visu, pirmos vai pārskatu. Cilne Lejupielādes saskaita rindas, kas gaida jūs",
  feat_workflow_15:
    "**Lejupielādējiet tikai video daļu** — ekrānā Formāts izvēlieties sākumu un beigas vai nodaļu, un Arroxy saglabā tikai šo diapazonu, nosaucot to ar diapazonu pēc video id. Griezumi nonāk uz tuvāko atslēgkadru; ieslēdziet precīzu griezumu, lai tā vietā pārkodētu",
  feat_workflow_16:
    "**Noņemt pabeigtās lejupielādes** — pēc izvēles: pabeigta lejupielāde pazūd no saraksta pēc 5 sekundēm. Tās faili paliek diskā, un neizdevušās lejupielādes paliek sarakstā",
  feat_workflow_17:
    "**Izmērs un Trūkst sadaļā Lejupielādes** — kārtojama kolonna **Izmērs** parāda, cik vietas aizņem katra lejupielāde, un **Trūkst** atzīmē failus, kas pārvietoti vai dzēsti ārpus Arroxy",
  feat_workflow_18:
    "**Aurora vai Minimal, tumšs vai gaišs** — stikla paneļi virs kustīgām debesīm vai mierīgas vienlaidu virsmas; pārslēdzieties kājenē. Datori bez grafikas paātrinājuma automātiski saņem Minimal",
  feat_workflow_19:
    "**Mac izvēlņu josla** — sistēmā macOS atveriet iestatījumus (`Cmd+,`), iestatiet lejupielādes ātruma ierobežojumu, pārslēdziet stilu un motīvu un atveriet žurnālus vai saglabājiet diagnostikas failu no izvēlņu joslas",
  feat_workflow_20:
    "**Mainiet profilu no jebkuras lejupielādes** — pielāgojiet lejupielādi, pēc tam atjauniniet profilu, no kura tā sākās (ar izmaiņu priekšskatījumu), vai saglabājiet iestatījumus kā jaunu profilu. Pārslēdzot profilu, tiek jautāts, vai paturēt jūsu labojumus",
  feat_post_h3: "Subtitri un pēcapstrāde",
  feat_post_1:
    "**Subtitri** formātā SRT, VTT vai ASS — manuāli vai automātiski ģenerēti, jebkurā pieejamā valodā",
  feat_post_2:
    "Saglabājiet līdzās video, iegulstiet `.mkv` failā vai sakārtojiet apakšmapē `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — izlaidiet vai atzīmējiet kā nodaļas sponsorus, ievadus, nobeigumus, pašreklāmu",
  feat_post_4:
    "**Iegulti metadati** — nosaukums, augšupielādes datums, kanāls, apraksts, sīktēls un nodaļu atzīmes tiek ierakstītas failā",
  feat_post_5:
    "**Tikai subtitru pakotnes** — ielīmējiet URL sarakstu vai atveriet atskaņošanas sarakstu, izvēlieties Subtitri un saņemiet tikai parakstu failus katram video",
  feat_sites_h3: "YouTube + 2000 vietņu",
  feat_sites_1:
    "**YouTube pilnībā** — Video, Shorts, kanāli, atskaņošanas saraksti, YouTube Music un podkāsti tiek apstrādāti kā pilnvērtīgi avoti",
  feat_sites_2:
    "**2000+ citu vietņu**, izmantojot yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable un daudzas citas",
  feat_sites_3:
    "**Tikai audio un subtitri** darbojas visās atbalstītajās vietnēs, ne tikai YouTube",
  feat_sites_4:
    "Ja vietne mainās, yt-dlp izlaiž labojumus katru nedēļu, un Arroxy startēšanas brīdī automātiski atjaunina bināro failu",
  shot1_cap:
    "<b>Ātrās lejupielādes sākums</b><br/>Ielīmējiet URL un nekavējoties lejupielādējiet ar savu aktīvo profilu",
  shot2_cap:
    "<b>Atkārtoti izmantojami lejupielādes profili</b><br/>Saglabājiet formāta, kvalitātes un izvades sagataves — izmantojiet atkārtoti katrai lejupielādei",
  shot3_cap:
    "<b>Daudzvalodu audio celiņi</b><br/>Izvēlieties precīzu audio valodu, ar kādu video tiek piegādāts",
  shot4_cap:
    "<b>Telpiskais / Dolby audio</b><br/>5.1 un Dolby celiņi tiek atpazīti un saglabāti",
  shot5_cap:
    "<b>Vairāku URL režīms</b><br/>Ielīmējiet sarakstu, automātiski noņemiet dublikātus, pievienojiet rindai visu uzreiz",
  shot6_cap:
    "<b>Paralēla lejupielāžu rinda</b><br/>Vairākas lejupielādes vienlaikus ar tiešraides progresu",
  hotkey_fig_alt:
    "Arroxy globālais lejupielādes īsinājumtaustiņš — Ctrl+Shift+D sistēmās Windows un Linux, Cmd+Shift+D sistēmā macOS, nosūta nokopēto saiti tieši lejupielāžu rindā",
  hotkey_fig_cap:
    "<b>Globālais lejupielādes īsinājumtaustiņš</b><br/>Nokopējiet saiti jebkur, nospiediet vienreiz — tā nonāk rindā un sāk lejupielādēties",
  shot7_cap: "<b>Atskaņošanas saraksta profili katram vienumam</b><br/>Piešķiriet katram video savu profilu — daļu arhivējiet 4K, pārējo paņemiet kā MP3",
  shot8_cap:
    "<b>Izpēte</b><br/>Pārlūkojiet YouTube vai jebkuru citu vietni Arroxy iekšienē un lejupielādējiet lapu, kurā atrodaties, ar savu aktīvo profilu",
  shot9_cap:
    "<b>Izpētes pirmais ekrāns</b><br/>Īss ieskats sadaļā Izpēte un kāpēc papildu konts ir drošāka pierakstīšanās",
  shot10_cap:
    "<b>Lejupielādes parāda, kam vajadzīga jūsu uzmanība</b><br/>Saites tiek sagatavotas fonā; neizdevusies piedāvā savu risinājumu, garš atskaņošanas saraksts gaida jūsu izvēli",
  shot11_cap:
    "<b>Lejupielādējiet tikai video daļu</b><br/>Izvēlieties sākumu un beigas vai nodaļu — Arroxy saglabā tikai šo diapazonu",
  shot12_cap:
    "<b>Profilu redaktors</b><br/>Pielāgojiet profilu: faila tipu, izšķirtspēju, subtitrus, galamērķi, faila nosaukuma veidni un citu",
  shot13_cap:
    "<b>Tumšs vai gaišs, stikls vai vienlaidu</b><br/>Četri izskati izvēlei: stikla paneļi virs kustīgām debesīm vai mierīgas vienlaidu virsmas, katrs tumšā un gaišā variantā",
  shot14_cap:
    "<b>8K HDR ar 60 kadriem sekundē</b><br/>Katra izšķirtspēja, kodeks un HDR straume, ko video piedāvā, blakus",
  dl_platform_col: "Platforma",
  dl_format_col: "Tiešā lejupielāde",
  dl_oneline_note:
    "Būvējumi ir tikai x86_64. Nav `curl`? Nomainiet `curl -fsSL` ar `wget -qO-`.",
  dl_win_scoop:
    "Dodat priekšroku Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Instalētājs (NSIS) vai portatīvs `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` vai `.flatpak` (izolēts)",
  dl_grab: "Visi laidiena resursi →",
  dl_pkg_h3: "Instalēšana ar pakotņu pārvaldnieku",
  dl_channel_col: "Kanāls",
  dl_command_col: "Komanda",
  dl_win_h3: "Windows: instalētājs vai portatīvā versija",
  dl_win_col_installer: "NSIS instalētājs",
  dl_win_col_portable: "Portatīvs `.exe`",
  dl_win_r1: "Nepieciešama instalēšana",
  dl_win_r1_installer: "Jā",
  dl_win_r1_portable: "Nē — palaidiet no jebkuras vietas",
  dl_win_r2: "Automātiski atjauninājumi",
  dl_win_r2_installer: "✅ lietotnē",
  dl_win_r2_portable: "❌ manuāla lejupielāde",
  dl_win_r3: "Startēšanas ātrums",
  dl_win_r3_installer: "✅ ātrāk",
  dl_win_r3_portable: "⚠️ lēnāka aukstā palaišana",
  dl_win_r4: "Pievieno izvēlnei Sākt",
  dl_win_r5: "Viegla atinstalēšana",
  dl_win_r5_portable: "❌ izdzēsiet failu",
  dl_win_rec:
    "**Ieteikums:** izmantojiet NSIS instalētāju automātiskajiem atjauninājumiem un ātrākai startēšanai. Portatīvo `.exe` izmantojiet variantam bez instalēšanas un bez reģistra ierakstiem.",
  dl_win_smartscreen_h4: "Windows SmartScreen brīdinājums",
  dl_win_smartscreen_intro:
    "Pirmajā palaišanas reizē var parādīties **„Windows aizsargāja jūsu datoru”** (Windows protected your PC) vai **„Nezināms izdevējs”** (Unknown publisher). Tas attiecas gan uz `Arroxy-win-x64-Setup.exe`, gan uz `Arroxy-win-x64-Portable.exe`. Arroxy ir bezmaksas un atvērtā koda, un Windows būvējumi nav parakstīti ar maksas sertifikātu, tāpēc SmartScreen tos atzīmē. Tas **nenozīmē** automātiski, ka Arroxy ir nedrošs. Lai turpinātu:",
  dl_win_smartscreen_step1: "Noklikšķiniet uz **Papildinformācija** (More info).",
  dl_win_smartscreen_step2: "Noklikšķiniet uz **Tik un tā palaist** (Run anyway).",
  dl_win_smartscreen_official:
    "Lejupielādējiet Arroxy tikai no oficiālās GitHub Releases lapas. Ja failu ieguvāt no citas vietnes vai kāds jums to atsūtīja, izdzēsiet to un lejupielādējiet jaunu kopiju no oficiālā avota. Pirmkods ir publisks, tāpēc varat to pārbaudīt vai pats uzbūvēt Arroxy, ja vēlaties.",
  dl_macos_h3: "Pirmā palaišana sistēmā macOS",
  dl_macos_warning:
    "Arroxy vēl nav koda parakstīts, tāpēc macOS Gatekeeper pirmajā palaišanas reizē var parādīt brīdinājumu par bojātu lietotni. Tas ir sagaidāms — tā nav faktiska faila bojājuma pazīme.",
  dl_macos_m1_h4: "Terminālā:",
  dl_macos_step1: "Velciet `Arroxy.app` no pievienotā DMG uz `/Applications`.",
  dl_macos_step2:
    "Atveriet Termināli un izpildiet `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Izpildiet `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Ja lietotnes ceļš ir cits, aizstājiet `/Applications/Arroxy.app` ar ceļu, kur to instalējāt.",
  dl_macos_step5:
    "Ievadiet sava Mac paroli, ja `sudo` to pieprasa.",
  dl_macos_after:
    "Pēc karantīnas noņemšanas Arroxy atveras normāli.",
  dl_macos_m2_h4: "Terminālā:",
  dl_macos_note:
    "macOS būvējumi tiek veidoti CI uz Apple Silicon un Intel izpildītājiem. Ja radīsies problēmas, lūdzu, [atveriet problēmu](../../issues) — macOS lietotāju atsauksmes aktīvi veido macOS testēšanas ciklu.",
  dl_linux_h3: "Pirmā palaišana sistēmā Linux",
  dl_linux_intro:
    "AppImage darbojas tieši — bez instalēšanas. Jums tikai jāatzīmē fails kā izpildāms.",
  dl_linux_m1_text:
    "**Failu pārvaldnieks:** ar peles labo pogu noklikšķiniet uz `.AppImage` → **Rekvizīti** → **Atļaujas** → ieslēdziet **Atļaut izpildīt failu kā programmu**, pēc tam veiciet dubultklikšķi.",
  dl_linux_m2_h4: "Terminālis:",
  dl_linux_fuse_text: "Ja palaišana joprojām neizdodas, palaidiet bez montēšanas — FUSE pakotne nav nepieciešama:",
  dl_linux_targz_h4: "Vienkāršs tarball (bez FUSE, bez instalēšanas):",
  dl_linux_targz_text: "`.tar.gz` būvējums ir tā pati lietotne bez AppImage apvalka — izvelciet to jebkur un palaidiet. Nav nepieciešams ne instalētājs, ne FUSE pakotne.",
  dl_linux_arch_note: "**Linux lejupielādes laidiena lapā ir tikai x86_64.** ARM64 iekārtās (Raspberry Pi, Asahi Linux) Flatpak joprojām instalējas, bet palaišanas brīdī neizdodas ar `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Kāpēc var parādīties brīdinājums",
  dl_warning_p1:
    "Arroxy ir atvērtā koda un licencēts ar GPLv3. Windows un macOS būvējumi **nav koda parakstīti** — Apple Developer ID un Windows EV koda parakstīšanas sertifikāti katrs maksā simtiem dolāru gadā, ko neatkarīgs projekts maksā no savas kabatas. Bez šiem parakstiem Windows SmartScreen un macOS Gatekeeper pirmajā palaišanas reizē jūs brīdinās. Brīdinājumi nozīmē, ka *jūsu OS neatpazīst izdevēju* — tie nenozīmē, ka Arroxy ir ļaunprātīga programma.",
  dl_warning_p2:
    "Trīs veidi, kā pats pārbaudīt Arroxy, augošā stingrības secībā:\n\n- **Izlasiet pirmkodu.** Katra rindiņa ir [GitHub](https://github.com/antonio-orionus/Arroxy), un varat to [uzbūvēt no pirmkoda](#tech).\n- **Pārbaudiet SHA256.** Salīdziniet savu failu ar publicēto [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — skatiet [Pārbaudiet lejupielādi](#verify) zemāk.\n- **Palaidiet trešās puses skenēšanu.** Augšupielādējiet failu [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Windows pirmā palaišana",
  shot_smartscreen_more_alt:
    "SmartScreen dialoglodziņš „Windows aizsargāja jūsu datoru” ar izcelto saiti „Papildinformācija”",
  shot_smartscreen_run_alt:
    "SmartScreen dialoglodziņš pēc papildinformācijas izvēršanas, kurā redzama poga „Tik un tā palaist”",
  dl_win_defender_h4: "Ja Windows Defender atzīmē vai noņem failu",
  dl_win_defender_p:
    "Defender heiristika dažkārt atzīmē neparakstītus NSIS instalētājus un Electron portatīvās versijas kā aizdomīgas. Ja Defender ievieto karantīnā `Arroxy-win-x64-Setup.exe` vai `Arroxy-win-x64-Portable.exe`, atjaunojiet to no **Windows drošība → Aizsardzība pret vīrusiem un draudiem → Aizsardzības vēsture**, pēc tam pievienojiet Arroxy izpildāmo failu kā atļauto vienumu sadaļā **Pārvaldīt iestatījumus → Pievienot vai noņemt izņēmumus**. Tāpat kā ar SmartScreen, iemesls ir trūkstošais izdevēja paraksts, nevis atklāta ļaunprogrammatūra.",

  dl_macos_first_h3: "macOS pirmā palaišana",
  dl_macos_intro:
    "Arroxy macOS būvējumi ir parakstīti ad-hoc, bet Apple nav apstiprinājis (notarized), tāpēc Gatekeeper bloķē pirmo palaišanu ar ziņojumu *„Arroxy.app” nav atvērts — Apple nevarēja pārbaudīt, vai „Arroxy.app” nesatur ļaunprogrammatūru*. Tas nozīmē, ka macOS nevar pārbaudīt lietotni ar Apple, nevis ka ar failiem kaut kas nav kārtībā. Instalēšana ar Homebrew šo dialogu pilnībā novērš. Ja izmantojāt DMG, to novērš viena Termināļa komanda:",
  dl_macos_sequoia_h4: "Termināļa risinājums pašreizējai macOS",
  dl_macos_sequoia_intro:
    "Izmantojiet Termināli pēc Arroxy nokopēšanas uz Applications:",
  dl_macos_sequoia_step1:
    "Velciet `Arroxy.app` no pievienotā DMG uz `/Applications`.",
  dl_macos_sequoia_step2:
    "Atveriet Termināli un izpildiet šīs divas komandas:",
  dl_macos_sequoia_step3:
    "Izpildiet `open /Applications/Arroxy.app`, lai palaistu Arroxy.",
  dl_macos_sequoia_step4:
    "Ja lietotnes ceļš ir cits, aizstājiet `/Applications/Arroxy.app` ar ceļu, kur to instalējāt.",
  dl_macos_sonoma_h4: "Termināļa risinājums vecākai macOS",
  dl_macos_sonoma_step1:
    "Velciet `Arroxy.app` no pievienotā DMG uz `/Applications`.",
  dl_macos_sonoma_step2:
    "Atveriet Termināli un noņemiet karantīnu no `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Pēc karantīnas noņemšanas palaidiet Arroxy no Termināļa vai Finder.",
  dl_macos_damaged_h4:
    "Gatekeeper karantīnas risinājums",
  dl_macos_damaged_p:
    "Pirmā komanda noņem karantīnas atribūtu, ko macOS pievienoja, kad fails tika lejupielādēts; otrā palaiž lietotni. Parasti `sudo` nav vajadzīgs, jo kopija mapē `/Applications` pieder jums — pievienojiet to tikai tad, ja saņemat atļauju kļūdu.",
  dl_macos_arch_note:
    "**Apple Silicon vai Intel:** M sērijas Mac datorā (M1 / M2 / M3 / M4) lejupielādējiet `arm64` DMG. Intel Mac datoros lejupielādējiet `x64` DMG. Nepareiza būvējuma palaišana joprojām darbojas ar Rosetta, bet ir manāmi lēnāka.",

  dl_linux_first_h3: "Linux pirmā palaišana",
  dl_linux_appimagelauncher:
    "**Neobligāta darbvirsmas integrācija:** vienreiz instalējiet [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), un jebkurš AppImage, uz kura veiksiet dubultklikšķi, tiks automātiski reģistrēts jūsu palaidēja izvēlnē — nav nepieciešams manuāls `.desktop` fails.",

  dl_verify_h3: "Pārbaudiet lejupielādi (SHA256)",
  dl_verify_intro:
    "Katrs laidiens kopā ar bināro failiem publicē `SHA256SUMS` failu. Lai pārbaudītu, vai jūsu lejupielāde nav bojāta vai pārtvērumā mainīta, lokāli aprēķiniet sava faila jaucējkodu un salīdziniet ar rindu failā `SHA256SUMS`. Atveriet jaunākā laidiena lapu → **Assets** → lejupielādējiet `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell vai komandu uzvedne):",
  dl_verify_mac_label: "macOS (Terminālis):",
  dl_verify_linux_label: "Linux (Terminālis):",
  dl_verify_vt_text:
    "Vēlaties trešās puses ļaunprogrammatūras skenēšanu? Augšupielādējiet failu [VirusTotal](https://www.virustotal.com). Dažas vispārīgas heiristikas atzīmes no mazākiem dzinējiem ir normāla parādība neparakstītām Electron lietotnēm; plaši izplatīta atklāšana no lielajiem dzinējiem būtu reāls iemesls bažām.",

  dl_pm_intro:
    "Dodat priekšroku citam kanālam? Arī šie darbojas, un tie seko katram laidienam.",

  privacy_p1:
    "Lejupielādes tiek iegūtas tieši ar [yt-dlp](https://github.com/yt-dlp/yt-dlp) no YouTube uz jūsu izvēlēto mapi — nekas netiek novirzīts caur trešās puses serveri. Skatīšanās vēsture, lejupielādes vēsture, URL un failu saturs paliek jūsu ierīcē.",
  privacy_p2:
    "Nekādas telemetrijas — tikai viens anonīms pulsa signāls dienā: lietotnes versija, OS, valoda, instalēšanas kanāls, valsts un aptuveni cik sen Arroxy ir instalēts, lai mēs varētu saskaitīt aktīvos un jaunos lietotājus. Bez ID, URL, video nosaukumiem, failu ceļiem vai konta informācijas. To var izslēgt iestatījumos.",
  privacy_p3:
    "Izpēte glabā savas pierakstīšanās atsevišķi no jūsu pārlūka, un Arroxy nekad nenolasa un neaizpilda pierakstīšanās veidlapu — jūs rakstāt pašas vietnes lapā. Lejupielādes darbojas bez pierakstīšanās; tikai tad, kad kāda neizdodas tādā veidā, ko konts var novērst, Arroxy no jauna nolasa pierakstīšanos, glabā to pagaidu failā šai lejupielādei un pēc tam failu izdzēš. Izrakstīšanās no sadaļas Izpēte iestatījumos tās aizmirst.",
  faq_q1: "Vai tas tiešām ir bezmaksas?",
  faq_a1: "Jā — licencēts ar GPLv3, bez maksas līmeņa, bez funkciju ierobežošanas.",
  faq_q11: "Ar ko Arroxy atšķiras no citām yt-dlp grafiskajām saskarnēm?",
  faq_a11:
    "Lielākā daļa bezmaksas yt-dlp grafisko saskarņu ir apvalki, kas pieņem tikai saiti. Arroxy pievieno **Izpēti** — lietotnē iebūvētu pārlūku, kas atver YouTube vai jebkuru citu vietni: jūs pārlūkojat un lejupielādējat, nekopējot saites, un pierakstāties tur vienreiz, lai lejupielādētu privātus, tikai dalībniekiem paredzētus un vecuma ierobežotus videoklipus un savus sarakstus Skatīties vēlāk un Patīk, bez sīkfailu eksportēšanas. Arroxy izmanto šo pierakstīšanos, kad YouTube prasa apstiprināt, ka neesat robots, un tā iebūvētais pārlūks iegūst YouTube lejupielādes pilnvaru, lai lejupielādes nepārietu uz mazāku formātu skaitu. Skatiet [Kāpēc Arroxy](#why).",
  faq_q2: "Kādas video kvalitātes varu lejupielādēt?",
  faq_a2:
    "Jebko, ko piedāvā YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, kā arī tikai audio. 60 kadru/s un HDR straumes tiek saglabātas nemainītas, un soli pa solim lejupielāde ļauj katrā izšķirtspējā izvēlēties AV1, VP9 vai H.264.",
  faq_q3: "Vai varu izvilkt tikai audio kā MP3?",
  faq_a3:
    "Jā. Formātu izvēlnē izvēlieties *tikai audio* un izvēlieties MP3, M4A/AAC, Opus vai WAV.",
  faq_q4: "Kā lejupielādēt videoklipus, kuriem nepieciešams YouTube konts?",
  faq_a4:
    "Pierakstieties vienreiz cilnē Izpēte. Pēc tam Arroxy var lejupielādēt privātus un tikai dalībniekiem paredzētus videoklipus, ko jūsu konts var skatīties, vecuma ierobežotus videoklipus, ja konts ir ar apstiprinātu vecumu, kā arī jūsu sarakstus Skatīties vēlāk un Patīk. Tas izmanto pierakstīšanos tikai tad, ja lejupielāde neizdodas tādā veidā, ko konts var novērst; viss pārējais tiek lejupielādēts kā iepriekš. Šī ir izvēle **Pierakstīšanās sadaļā Izpēte**, kas sīkfailu iestatījumos ir uzskaitīta pirmā un atzīmēta kā Ieteicams, un Arroxy to izvēlas jūsu vietā, kad pirmo reizi atverat Izpēti. yt-dlp wiki norāda, ka [automatizācija ar pierakstīšanos var radīt Google konta atzīmēšanu](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), tāpēc papildu konts ir drošāka izvēle.",
  faq_q5: "Vai tas turpinās darboties, kad YouTube kaut ko maina?",
  faq_a5:
    "yt-dlp tiek automātiski atjaunināts startēšanas brīdī, un Arroxy ātri izlaiž labojumus, kad YouTube kaut ko maina. Kad YouTube prasa apstiprināt, ka neesat robots, Arroxy arī mēģina izmantot jūsu pierakstīšanos sadaļā Izpēte, ja tur esat pierakstījies, un sīkfaili no faila vai jūsu pārlūka ir pieejami sīkfailu iestatījumos.",
  faq_q6: "Kādās valodās Arroxy ir pieejams?",
  faq_a6:
    "Gatavas lietošanai valodas ({{LANG_COUNT}}): {{LANG_NAME_LIST}}. Arroxy pirmajā palaišanas reizē automātiski nosaka jūsu operētājsistēmas valodu, un jebkurā laikā varat pārslēgties ar valodas izvēlni rīkjoslā. Izpildlaika locale JSON atrodas src/shared/i18n/locales/, bet tulkotājiem paredzētie PO katalogi — i18n/locales/ — atveriet PR vietnē GitHub, lai palīdzētu.",
  faq_q7: "Vai man jāinstalē kaut kas cits?",
  faq_a7:
    "Nē. yt-dlp, ffmpeg un ffprobe tiek automātiski lejupielādēti pirmajā palaišanas reizē un kešoti jūsu ierīcē. Pēc tam papildu iestatīšana nav nepieciešama.",
  faq_q8: "Vai varu lejupielādēt atskaņošanas sarakstus vai veselus kanālus?",
  faq_a8:
    "Jā — abus. Ielīmējiet atskaņošanas saraksta URL vai kanāla URL (piem., `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); izvēlieties, cik ierakstu pārbaudīt, tad pievienojiet rindai visu sarakstu vai izvēlieties konkrētus video. Datumu diapazona filtri drīzumā.",
  faq_q9: "macOS saka „lietotne ir bojāta” — ko darīt?",
  faq_a9:
    "Tas ir macOS Gatekeeper, kas bloķē neparakstītu lietotni, nevis faktisks bojājums. Skatiet [macOS pirmā palaišana](#macos-first-launch) Termināļa komandām, kas noņem karantīnu un palaiž Arroxy.",
  faq_q10: "Vai YouTube video lejupielāde ir legāla?",
  faq_a10:
    "Personīgai, privātai lietošanai tā parasti tiek pieņemta lielākajā daļā jurisdikciju. Jūs esat atbildīgs par YouTube [pakalpojumu sniegšanas noteikumu](https://www.youtube.com/t/terms) un jūsu vietējo autortiesību likumu ievērošanu.",
  plan_intro: "Joprojām plānots — aptuveni prioritārā secībā:",
  plan_col1: "Iespēja",
  plan_col2: "Apraksts",
  plan_r1_name: "**Atskaņošanas sarakstu un kanālu filtri**",
  plan_r1_desc: "Datumu diapazona filtri, uzskaitot atskaņošanas sarakstu vai kanālu",
  plan_r2_name: "**YouTube audio celiņu preferences**",
  plan_r2_desc:
    "Iestatiet visas lietotnes runas valodas celiņa preferenci ar profila pārrakstīšanu, kad YouTube piedāvā vairākus audio celiņus",
  plan_r3_name: "**Spēcīgāka atkārtošanas atkopšana**",
  plan_r3_desc:
    "Jauns atkārtošanas ceļš lejupielādēm, ko pārtrauc nestabili vai problemātiski interneta savienojumi",
  plan_r4_name: "**Pilnīgs lejupielāžu pārvaldnieka panelis**",
  plan_r4_desc:
    "Pārvērst rindas paneli pilnīgākā pārvaldniekā, tostarp rindā esošo vienumu galamērķa mapju maiņu",
  plan_r5_name: "**Ieplānotas lejupielādes**",
  plan_r5_desc: "Sākt rindu noteiktā laikā (nakts darbi)",
  plan_r9_name: "**AUR pakotne**",
  plan_r9_desc: "Instalēšana sistēmās Arch Linux un Omarchy ar `yay -S arroxy-bin`",
  plan_cta:
    "Ir ideja par iespēju? [Atveriet pieprasījumu](../../issues) — kopienas ieguldījums veido prioritāti.",
  tech_content: TECH_CONTENT,
  support_h2: "Atbalstiet Arroxy",
  support_note: "Arroxy ir bezmaksas un licencēts ar GPLv3 — bez reklāmām, bez telemetrijas, bez maksas līmeņa. Ja tas ietaupa jūsu laiku, varat atbalstīt izstrādi ar Bitcoin, Tron vai Ethereum: adreses ir failā [DONATE.md](DONATE.md), kas ir vienīgais oficiālais to avots. Arroxy nekad nesūtīs jums adresi pa e-pastu vai privātā ziņā. Repozitorija atzīmēšana ar zvaigznīti, kļūdu ziņošana un tulkojumu uzlabošana palīdz tikpat daudz.",
  tos_h2: "Lietošanas noteikumi",
  tos_note:
    "Arroxy ir rīks tikai personīgai, privātai lietošanai. Jūs esat vienīgi atbildīgs par to, lai jūsu lejupielādes atbilstu YouTube [pakalpojumu sniegšanas noteikumiem](https://www.youtube.com/t/terms) un jūsu jurisdikcijas autortiesību likumiem. Neizmantojiet Arroxy, lai lejupielādētu, reproducētu vai izplatītu saturu, ko jums nav tiesību izmantot. Izstrādātāji nav atbildīgi par ļaunprātīgu izmantošanu.",
  footer_credit:
    'GPLv3 · Izveidots ar rūpību: <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
