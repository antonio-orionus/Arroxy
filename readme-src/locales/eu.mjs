const TECH_CONTENT = `<details>
<summary><strong>Teknologia-pila</strong></summary>

- **Electron** — plataforma anitzeko mahaigaineko oskola
- **React 19** + **TypeScript** — erabiltzaile-interfazea
- **Tailwind CSS v4** — estiloak
- **Zustand** — egoeraren kudeaketa
- **yt-dlp** + **ffmpeg** — deskarga- eta muxing-motorra (biak exekuzio-denboran eskuratzen dira: yt-dlp eguneratuta mantentzen da, ffmpeg/ffprobe behin instalatzen dira eta eguneratzeen artean gordetzen dira)
- **Vite** + **electron-vite** — eraikuntza-tresnak
- **Vitest** + **Playwright** — unitate- eta muturretik muturrerako probak

</details>

<details>
<summary><strong>Iturburutik eraiki</strong></summary>

### Aurrebaldintzak — plataforma guztiak

| Tresna  | Bertsioa | Instalazioa |
| ------- | ------- | ------- |
| Git     | edozein | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` edo \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` edo \`package.json\` \`packageManager\` |

Gomendioa: instalatu \`mise\`, eta gero exekutatu \`mise install\` checkout-ean. mise gabe, aktibatu eskuz Node.js \`.node-version\` fitxategitik eta Bun \`package.json\` fitxategitik \`bun run bootstrap\` exekutatu aurretik.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Baliteke Visual Studio Build Tools eta Python behar izatea berreraikuntza natiboetarako.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Klonatu ondoren, exekutatu \`mise trust && mise install\` checkout-etik. Zure shell-ak jada \`fnm\`, \`nvm\` edo Homebrew-eko Bun erabiltzen badu, aktibatu mise \`~/.zshrc\` fitxategian, Arroxy-k Node.js 24.21.0 eta Bun 1.4.2 lor ditzan:

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

### Klonatu eta exekutatu

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Banatzeko pakete bat eraiki

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` komandoak mendekotasunak instalatzen ditu, Electron aplikazioaren mendekotasunak berreraikitzen ditu, Electron egiaztatzen du, garapenerako ffmpeg/ffprobe txertatuak prestatzen ditu eta Playwright Chromium instalatzen du. Kaleratze-eraikinek yt-dlp, ffmpeg eta ffprobe kudeatzen dituzte exekuzio-denboran zure aplikazio-datuen karpetan; ez da horietako bat ere instalatzailearen barruan banatzen.

</details>`;

export const eu = {
  icon_alt: "Arroxy maskota",
  title:
    "Arroxy — YouTube (+ 2000 gune) deskargatzaile librea eta kode irekikoa, nabigatzaile integratuarekin, Windows, macOS eta Linux-erako",
  read_in_label: "Irakurri hemen:",
  badge_release_alt: "Bertsioa",
  badge_build_alt: "Konpilazioa",
  badge_license_alt: "Lizentzia",
  badge_platforms_alt: "Plataformak",
  badge_i18n_alt: "Hizkuntzak",
  badge_website_alt: "Webgunea",
  discord_badge_text: "Sartu Discord komunitatean",
  discord_badge_encoded: "Sartu%20Discord%20komunitatean",
  hero_desc:
    "Deskargatu bideoak, Shorts-ak, musika, kanalak, podcastak edo audio-pistak **YouTube-tik eta onartutako 2000+ guneetatik** — 8K HDR 60 fps-ra arte, MP3 / AAC / Opus formatuan, edo behar duzun zatia bakarrik. **Arakatu YouTube edo beste edozein gune Arroxy-ren barruan** Esploratu fitxan, eta deskargatu ikusten ari zaren bideoa, erreprodukzio-zerrenda edo kanala; hasi saioa hor zure kontuak ikus ditzakeen bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak deskargatzeko. Zure ordenagailuan exekutatzen da, Windows, macOS eta Linux-en. **Iragarkirik gabe, zama alferrik gabe, ordainpeko eskaintzarik gabe.**",
  cta_latest: "↓ Instalatu azken bertsioa",
  cta_website: "Webgunea",
  website_url: "https://arroxy.com/",
  star_cta: "Arroxy-k denbora aurrezten badizu, ⭐ batek besteei aurkitzen laguntzen die.",
  ai_notice: "> 🌐 Itzulpen hau adimen artifizialaren laguntzaz egin da. [README ingelesa](README.md) da iturri nagusia. Akatsen bat aurkitu duzu? [Ireki PR bat](../../pulls).",
  toc_heading: "Edukia",
  why_h2: "Zergatik Arroxy",
  features_h2: "Eginbideak",
  dl_h2: "Instalazioa eta lehen abioa",
  privacy_h2: "Pribatutasuna",
  faq_h2: "Maiz egindako galderak",
  roadmap_h2: "Ibilbide-orria",
  tech_h2: "Honekin eraikia",
  why_intro: "Alternatibarik ohikoenekin alderaketa zuzena:",
  why_r1: "Doakoa, ordainpeko mailarik gabe",
  why_r2: "Kode irekia",
  why_r3: "Tokiko prozesamendua soilik",
  why_r5: "Erabilera-mugarik gabe",
  why_r6: "Plataforma anitzeko mahaigaineko aplikazioa",
  why_r7: "Azpitituluak + SponsorBlock",
  why_r8: "Nabigatzaile integratua (arakatu, hasi saioa, deskargatu)",
  why_r9: "Bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak cookie-ak esportatu gabe",
  why_table_note:
    "⚠️ = zati batean, edo ordainpeko mailan bakarrik. 4K Video Downloader-en aplikazioko saio-hasiera bideo pribatuetarako ordainpeko eginbide bat da; yt-dlp-ren GUI libre gehienek cookie-fitxategi bat bakarrik onartzen dute, edo zure web-nabigatzailearen cookie-ak irakurtzen dituzte.",
  why_summary:
    "Arroxy gauza bakar baterako eraiki da: tokiko fitxategi garbi bat, URL bat itsatsi edo bideoa Esploratu fitxan aurkitu. Ordainpeko eskaintzarik gabe, daturik bildu gabe.",
  why_explore_h3: "yt-dlp-ren inguruko wrapper soil batek egin ezin duena: Esploratu fitxa",
  why_explore_intro:
    "YouTube-ren deskargatzaile libre gehienak yt-dlp-ren gaineko URL kutxa bat dira. Arroxy-k ere yt-dlp erabiltzen du, baina **Esploratu** ere badu: aplikazioan integratutako nabigatzaile bat, YouTube edo beste edozein gune irekitzen duena. Esploratu fitxak URL kutxa batek gainditu ezin dituen mugak gainditzen ditu:",
  why_explore_1:
    "**Kontu bat behar duten bideoak, cookie-ak esportatu gabe** — bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak (adina egiaztatutako kontu batean), baita Ikusteko geroago eta Gustuko zerrendak ere, eta beste guneetan saio-hasiera baten atzean dauden bideoak. Wrapper soil batek cookies.txt esportazio bat behar du edo zure web-nabigatzailearen cookie-ak irakurri behar ditu, eta Windows-eko Chrome-k orain blokeatu egiten ditu. Arroxy-n behin hasten duzu saioa Esploratu fitxan eta gainerakoa berak egiten du",
  why_explore_2:
    "**«Sign in to confirm you're not a bot»** — YouTube-k hau eskatzen duenean, Arroxy-k deskarga berriro saiatzen du zure Esploratu fitxako saioarekin, huts egin beharrean",
  why_explore_3:
    "**YouTube-ren deskarga-tokena** — Arroxy-ren nabigatzaile integratuak YouTube-k deskarga baino lehen espero duen tokena lortzen du. Hori gabe, YouTube-k formatu gutxiago eta kalitate baxuagoa eskain ditzake eskatu duzuna baino",
  why_explore_4:
    "**Estekak kopiatu gabe** — bilatu bideo, erreprodukzio-zerrenda edo kanal bat Esploratu fitxan eta deskargatu klik batekin, edo egin klik eskuineko botoiarekin orriko edozein estekatan",
  why_explore_5:
    "**Iragarki-blokeatzailea nahi duzunean** — ezkutuaren gaineko klik batek iragarkiak eta jarraitzaileak blokeatzen ditu Esploratu fitxako orrietan",
  feat_explore_h3: "Esploratu: arakatu weba Arroxy-ren barruan",
  feat_explore_1:
    "**Esploratu fitxa** — arakatu YouTube edo beste edozein gune Arroxy-ren barruan eta deskargatu aurkitzen duzuna estekak kopiatu gabe. **Deskargatu · *zure profila*** aukerak ikusten ari zaren bideoa, erreprodukzio-zerrenda edo kanala jartzen du ilaran; ondoko geziak profilak aldatzen ditu, eta makilak urratsez urratseko deskarga irekitzen du formatuak, azpitituluak eta gehiago aukeratzeko",
  feat_explore_6:
    "**Egin klik eskuineko botoiarekin deskargatzeko** — egin klik eskuineko botoiarekin Esploratu fitxako edozein bideo-, erreprodukzio-zerrenda- edo kanal-estekatan zure profilarekin deskargatzeko, aukeratu beste profil bat **Deskargatu honekin** aukeran, ireki urratsez urratseko deskarga, edo kopiatu esteka. Ez da bideo bakoitza lehenik irekitzeko beharrik",
  feat_explore_7:
    "**Diseinu trinkoa** — Esploratu fitxako tresna-barrako klik batek Arroxy-ren fitxak bertara eramaten ditu eta orriari leku gehiago ematen dio",
  feat_explore_2:
    "**Helbide-barra** — idatzi YouTube-n bilatzeko, edo sartu edozein web-helbide gune hori irekitzeko",
  feat_explore_3:
    "**Kontu bat behar duten deskargak** — hasi saioa behin Esploratu fitxan eta Arroxy-k zure kontuak ikus ditzakeen bideo pribatuak eta bazkideentzakoak deskargatu ahal izango ditu, adin-murrizketadunak kontuaren adina egiaztatuta badago, eta Ikusteko geroago eta Gustuko zerrendak. Hasi saioa beste guneetan ere hor, eta haien deskargek saio hori erabiliko dute behar dutenean. Arroxy-k saiorik gabe deskargatzen du lehenik, eta zure Esploratu fitxako saioa kontu batek konpon dezakeen moduan deskarga batek huts egiten duenean bakarrik erabiltzen du. YouTube-k bot ez zarela berresteko eskatzen duenean, Arroxy-k zure Esploratu fitxako saioa ere probatzen du",
  feat_explore_4:
    "**Erabili bigarren mailako kontu bat** — Esploratu fitxaren lehen pantailak zergatik azaltzen du: kontu batekin deskargatzeak kontu hori mugatua izateko arrisku bat dakar. Amaitu Esploratu fitxako saioa Ezarpenetan zure saio-hasierak ahazteko nahi duzunean",
  feat_explore_5:
    "**Iragarki-blokeatzailea** — lehenespenez desaktibatuta. Esploratu fitxako tresna-barrako ezkutuaren gaineko klik batek iragarkiak eta jarraitzaileak blokeatzen ditu bere orrietan, deskargei eragin gabe. YouTube-k iragarki-blokeatzaileei trabak jar diezazkieke saioa hasita duten kontuetan",
  feat_quality_h3: "Kalitatea eta formatuak",
  feat_quality_1: "**8K (4320p)** arte, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Fotograma-tasa altua eta HDR** dauden bezala mantenduta — 60 fps, HDR10",
  feat_quality_3:
    "**Audioa** — esportatu audioa soilik MP3, M4A/AAC, Opus edo WAV formatuan. Deskarga interaktiboetan, aukeratu iturriaren inguruko/Dolby pista natiboak (AC-3, E-AC-3, 5.1, DRC) eskuragarri daudenean, edo ezarri **Lehenetsi inguruko audioa / Dolby** lehenespen orokor gisa",
  feat_quality_4:
    "**Helburua duten profilak** — *Irudi onena* (AV1 · VP9) edo *Smart TV* (MP4 · H.264), Automatikoa, MP4, MKV edo WebM gisa gordeta birkodetu gabe. HDR *Automatikoa* da (zure pantailak erakutsi dezakeenean bakarrik), *SDR* edo *HDR*",
  feat_quality_5:
    "**Kodek guztiak bereizmen guztietan** — urratsez urratseko deskargak AV1, VP9 eta H.264 zerrendatzen ditu bereizmen bakoitzean, aldamenean, zure telebistak edo editoreak erreproduzitzen duena aukeratu ahal izateko",
  feat_quality_6:
    "**Jakin zer den korronte bat benetan** — YouTube-k AA bidez handitutako tamainak, AA bidez bikoiztutako audio-hizkuntzak, bit-tasa hobetuko korronteak, 360° bideoak eta kopia hondatuak edo ur-markadunak markatuta daude. Profilek AA bidez handitutako korronteak saltatzen dituzte baimentzen ez badituzu",
  feat_privacy_h3: "Pribatutasuna eta kontrola",
  feat_privacy_1:
    "% 100 tokiko prozesamendua — deskargak zuzenean YouTube-tik zure diskora doaz",
  feat_privacy_2: "**Kode irekia** — lerro guztiak ikuskatu daitezke, GPLv3 lizentziarekin",
  feat_privacy_3: "Fitxategiak zuk aukeratutako karpetan gordetzen dira zuzenean",
  feat_workflow_h3: "Lan-fluxua",
  feat_workflow_12:
    "**Deskarga-lasterbide globala** — kopiatu esteka bat edozein aplikaziotan eta sakatu `Ctrl+Shift+D` (`Cmd+Shift+D` macOS-en); Arroxy-k zure profil aktiboarekin jartzen du ilaran leihoa ireki gabe, eta jakinarazpen batek berresten du. Lehenespenez aktibatuta, aldagarria",
  feat_workflow_1:
    "**Hasteko modu malguak** — aukeratu deskarga bakarra gidatua, erreprodukzio-zerrenda/kanal hautatzailea, URL masiboen itsatsia, Deskarga bizkorra gordetako lehenespenekin, edo arakatu eta deskargatu Esploratu fitxatik",
  feat_workflow_2:
    "**Deskarga-ilara zentrala** — deskarga bakar, erreprodukzio-zerrenda, masibo edo bizkor orok toki bakarrean amaitzen du aurrerapena, etenak, berrekitea, bertan behera uztea, berriro saiatzea eta lehentasuna kontrolatzeko",
  feat_workflow_3:
    "**Arbelaren zaintza** — kopiatu bideo-esteka bat eta URL eremua betetzen du Arroxy-ra itzultzean, **Desegin** aukerarekin ez bazenuen nahi. Arroxy lanpetuta dagoenean, esteka URL fitxara itzuli arte itxaroten du (desaktibatu Ezarpenetan)",
  feat_workflow_4:
    "**URLen garbiketa automatikoa** — jarraipen-parametroak kentzen ditu (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) eta `youtube.com/redirect` estekak zabaltzen ditu",
  feat_workflow_5:
    "**Erretilu modua** — leihoa ixteak deskargak atzeko planoan martxan mantentzen ditu",
  feat_workflow_6:
    "**{{LANG_COUNT}} hizkuntza** — sistemaren hizkuntza automatikoki detektatzen du, edonoiz aldagarria",
  feat_workflow_7:
    "**Erreprodukzio-zerrenda sinkronizatzea** — berriro eskaneatu erreprodukzio-zerrenda bat tokiko karpeta batekin alderatzeko, jada deskargatutako bideoak saltatzeko; bideo bakoitza deskargatu ahala eguneratzen den `.m3u` erreprodukzio-zerrenda fitxategi bat sortzen du",
  feat_workflow_8:
    "**Abiadura- eta erritmo-kontrolak** — mugatu deskargaren banda-zabalera, ezarri bideo baten zenbat zati deskargatzen diren aldi berean, eta gehitu eskaeren atzerapenak aurrezarpenekin (*Desaktibatuta · Orekatua · Zuhurra · Pertsonalizatua*)",
  feat_workflow_9:
    "**Fitxategi-izenen txantiloiak** — jarri izena deskargei zure erara `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` eta `{playlist_index}` erabiliz, globalki edo deskarga-profil bakoitzeko",
  feat_workflow_10:
    "**Aldi berako deskargak eta berriro saiatze automatikoa** — aukeratu ilarako zenbat deskarga exekutatzen diren aldi berean, eta utzi Arroxy-ri sareko edo zerbitzariko arazo bat izan duen deskarga bat berriro saiatzen, saiakera bakoitzaren aurretik gero eta gehiago itxaroten",
  feat_workflow_11:
    "**Erreprodukzio-zerrendako elementu bakoitzeko profilak** — esleitu erreprodukzio-zerrendako bideo bakoitzari bere deskarga-profila zerrenda osorako ezarpen bakarraren ordez, pasaldi bakarrean batzuk kalitate osoz artxibatu eta gainerakoak MP3 gisa hartzeko",
  feat_workflow_13:
    "**Deskarga bizkorra atzeko planoan dabil** — esteka Deskargak fitxan agertzen da berehala eta han prestatzen da, **Ikusi** duen ohar batek berresten du, eta URL eremua garbitzen da hurrengo estekarako. Hasi nahi adina lehenekoak prestatzen ari diren bitartean",
  feat_workflow_14:
    "**Deskargak fitxak esaten dizu zerk behar zaituen** — Arroxy-k esteka bat irakurri ezin badu, bere lerroak zergatik dioen eta konponbidea eskaintzen du: Saiatu berriro, aktibatu cookie-ak, edo hasi saioa Esploratu fitxan. Cookie-ak desaktibatuta daudenean, **Hasi saioa Esploratu fitxan** aukerak berriro saiatzen du zuretzat saioa hasi ondoren. Zure kargatze-muga baino luzeagoa den erreprodukzio-zerrenda batek bere lerroan itxaroten du zuk guztia, lehenengoak edo berrikuspen bat aukeratzeko. Deskargak fitxak zuri itxaroten dauden lerroak zenbatzen ditu",
  feat_workflow_15:
    "**Deskargatu bideoaren zati bat bakarrik** — aukeratu hasiera eta amaiera, edo kapitulu bat, Formatua pantailan eta Arroxy-k tarte hori bakarrik gordetzen du, bideoaren id-aren ondoren tartearekin izendatuta. Mozketak hurbilen dagoen gako-fotogramara doaz; aktibatu ebaki zehatza horren ordez birkodetzeko",
  feat_workflow_16:
    "**Kendu amaitutako deskargak** — aukerakoa: amaitutako deskarga bat zerrendatik desagertzen da 5 segundo geroago. Bere fitxategiak diskoan geratzen dira, eta huts egindako deskargak zerrendan geratzen dira",
  feat_workflow_17:
    "**Tamaina eta Falta da Deskargak fitxan** — **Tamaina** zutabe ordenagarri batek deskarga bakoitzak zenbat leku hartzen duen erakusten du, eta **Falta da** aukerak Arroxy-tik kanpo mugitutako edo ezabatutako fitxategiak markatzen ditu",
  feat_workflow_18:
    "**Aurora edo Minimal, iluna edo argia** — beirazko panelak zeru higikor baten gainean, edo gainazal solido lasaiak; aldatu oinetik. Grafiko-azelerazio gabeko ordenagailuek Minimal automatikoki jasotzen dute",
  feat_workflow_19:
    "**Mac-eko menu-barra** — macOS-en, ireki Ezarpenak (`Cmd+,`), ezarri deskarga-abiaduraren muga, aldatu estiloa eta gaia, eta ireki erregistroak edo gorde diagnostiko-fitxategi bat menu-barratik",
  feat_workflow_20:
    "**Aldatu profil bat edozein deskargatik** — doitu deskarga bat, gero eguneratu abiapuntu izan zuen profila (aldatuko denaren aurrebistarekin) edo gorde ezarpenak profil berri gisa. Profila aldatzean galdetzen da zure editatutakoak mantendu nahi dituzun",
  feat_post_h3: "Azpitituluak eta postprozesamendua",
  feat_post_1:
    "**Azpitituluak** SRT, VTT edo ASS formatuan — eskuzkoak edo automatikoki sortuak, erabilgarri dagoen edozein hizkuntzatan",
  feat_post_2:
    "Gorde bideoaren ondoan, txertatu `.mkv` fitxategian, edo antolatu `Subtitles/` azpikarpeta batean",
  feat_post_3:
    "**SponsorBlock** — saltatu edo markatu kapitulu gisa babesleak, sarrerak, amaierak, autopromozioak",
  feat_post_4:
    "**Txertatutako metadatuak** — izenburua, igotze-data, kanala, deskribapena, miniatura eta kapitulu-markak fitxategian idatzita",
  feat_post_5:
    "**Azpititulu-multzoak soilik** — itsatsi URL zerrenda bat edo ireki erreprodukzio-zerrenda bat, aukeratu Azpitituluak, eta lortu bideo bakoitzaren azpititulu-fitxategiak bakarrik",
  feat_sites_h3: "YouTube + 2000 gune",
  feat_sites_1:
    "**YouTube, osorik** — Bideoak, Shorts, Kanalak, Erreprodukzio-zerrendak, YouTube Music eta Podcastak lehen mailako iturri gisa kudeatuta",
  feat_sites_2:
    "**Beste 2000+ gune** yt-dlp bidez — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable eta askoz gehiago",
  feat_sites_3:
    "**Audioa soilik eta azpitituluak** onartutako gune guztietan dabiltza, ez YouTube-n bakarrik",
  feat_sites_4:
    "Gune batek aldatzen badu, yt-dlp-k asteroko konponketak kaleratzen ditu eta Arroxy-k bitarra automatikoki eguneratzen du abioan",
  shot1_cap:
    "<b>Deskarga bizkorraren hasiera</b><br/>Itsatsi URL bat eta deskargatu berehala zure profil aktiboarekin",
  shot2_cap:
    "<b>Berrerabil daitezkeen deskarga-profilak</b><br/>Gorde formatu, kalitate eta irteera-aurrezarpenak — berrerabili deskarga bakoitzean",
  shot3_cap:
    "<b>Hizkuntza anitzeko audio-pistak</b><br/>Aukeratu bideo batek dakarren audio-hizkuntza zehatza",
  shot4_cap:
    "<b>Inguruko / Dolby audioa</b><br/>5.1 eta Dolby pistak detektatu eta mantentzen dira",
  shot5_cap:
    "<b>URL masiboen modua</b><br/>Itsatsi zerrenda bat, bikoizketak automatikoki kendu, jarri guztiak ilaran batera",
  shot6_cap:
    "<b>Deskarga-ilara paraleloa</b><br/>Hainbat deskarga aldi berean, aurrerapena zuzenean",
  hotkey_fig_alt:
    "Arroxy-ren deskarga-lasterbide globala — Ctrl+Shift+D Windows eta Linux-en, Cmd+Shift+D macOS-en, kopiatutako esteka zuzenean deskarga-ilarara bidaliz",
  hotkey_fig_cap:
    "<b>Deskarga-lasterbide globala</b><br/>Kopiatu esteka bat edonon, sakatu behin — ilaran sartzen da eta deskargatzen hasten da",
  shot7_cap: "<b>Erreprodukzio-zerrendako elementu bakoitzeko profilak</b><br/>Eman bideo bakoitzari bere profila — artxibatu batzuk 4K-n, hartu gainerakoak MP3 gisa",
  shot8_cap:
    "<b>Esploratu</b><br/>Arakatu YouTube edo beste edozein gune Arroxy-ren barruan eta deskargatu zauden orria zure profil aktiboarekin",
  shot9_cap:
    "<b>Esploratu fitxaren lehen pantaila</b><br/>Esploratu fitxaren begirada azkar bat, eta zergatik den bigarren mailako kontu bat saio-hasiera seguruagoa",
  shot10_cap:
    "<b>Deskargak fitxak esaten dizu zerk behar zaituen</b><br/>Estekak atzeko planoan prestatzen dira; huts egin duen batek bere konponbidea eskaintzen du, erreprodukzio-zerrenda luze batek zure aukeraren zain egoten da",
  shot11_cap:
    "<b>Deskargatu bideoaren zati bat bakarrik</b><br/>Aukeratu hasiera eta amaiera, edo kapitulu bat — Arroxy-k tarte hori bakarrik gordetzen du",
  shot12_cap:
    "<b>Profil-editorea</b><br/>Doitu profil bat: fitxategi-mota, bereizmena, azpitituluak, helburua, fitxategi-izenaren txantiloia eta gehiago",
  shot13_cap:
    "<b>Iluna edo argia, beira edo solidoa</b><br/>Lau itxura aukeran: beirazko panelak zeru higikor baten gainean edo gainazal solido lasaiak, bakoitza ilunean eta argian",
  shot14_cap:
    "<b>8K HDR 60 fps-ra</b><br/>Bideo batek eskaintzen dituen bereizmen, kodek eta HDR korronte guztiak, aldamenean",
  dl_platform_col: "Plataforma",
  dl_format_col: "Deskarga zuzena",
  dl_oneline_note:
    "Eraikinak x86_64 soilik dira. `curl` ez duzu? Ordeztu `curl -fsSL` hau `wget -qO-` honekin.",
  dl_win_scoop:
    "Scoop nahiago? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Instalatzailea (NSIS) edo `.exe` eramangarria",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` edo `.flatpak` (sandbox-ean)",
  dl_grab: "Kaleratzeko aktibo guztiak →",
  dl_pkg_h3: "Instalatu pakete-kudeatzaile bidez",
  dl_channel_col: "Kanala",
  dl_command_col: "Komandoa",
  dl_win_h3: "Windows: Instalatzailea vs Eramangarria",
  dl_win_col_installer: "NSIS instalatzailea",
  dl_win_col_portable: "`.exe` eramangarria",
  dl_win_r1: "Instalazioa behar da",
  dl_win_r1_installer: "Bai",
  dl_win_r1_portable: "Ez — exekutatu edonondik",
  dl_win_r2: "Eguneratze automatikoak",
  dl_win_r2_installer: "✅ aplikazioan",
  dl_win_r2_portable: "❌ eskuzko deskarga",
  dl_win_r3: "Abiarazte-abiadura",
  dl_win_r3_installer: "✅ azkarragoa",
  dl_win_r3_portable: "⚠️ hotzean mantsoagoa",
  dl_win_r4: "Hasiera menuan gehitzen da",
  dl_win_r5: "Desinstalatze erraza",
  dl_win_r5_portable: "❌ ezabatu fitxategia",
  dl_win_rec:
    "**Gomendioa:** erabili NSIS instalatzailea eguneratze automatikoetarako eta abiarazte azkarragorako. Erabili `.exe` eramangarria instalaziorik gabeko eta erregistrorik gabeko aukera baterako.",
  dl_win_smartscreen_h4: "Windows SmartScreen-en abisua",
  dl_win_smartscreen_intro:
    "Lehen abioan **«Windows protected your PC»** (Windows-ek zure PCa babestu du) edo **«Unknown publisher»** (argitaratzaile ezezaguna) ikus dezakezu. Hau `Arroxy-win-x64-Setup.exe` eta `Arroxy-win-x64-Portable.exe` fitxategiei aplikatzen zaie. Arroxy doakoa eta kode irekikoa da, eta Windows-eko eraikinak ez daude ordainpeko ziurtagiri batekin kode-sinatuta; horregatik markatzen ditu SmartScreen-ek. Horrek **ez** du automatikoki esan nahi Arroxy ez denik segurua. Jarraitzeko:",
  dl_win_smartscreen_step1: "Egin klik **Informazio gehiago** aukeran (*More info*).",
  dl_win_smartscreen_step2: "Egin klik **Exekutatu hala ere** aukeran (*Run anyway*).",
  dl_win_smartscreen_official:
    "Deskargatu Arroxy GitHub Releases orri ofizialetik bakarrik. Fitxategia beste webgune batetik lortu baduzu edo norbaitek bidali badizu, ezabatu eta deskargatu kopia berri bat iturri ofizialetik. Iturburu-kodea publikoa da, beraz ikuskatu dezakezu edo nahiago baduzu Arroxy zeuk eraiki.",
  dl_macos_h3: "macOS-en lehen abioa",
  dl_macos_warning:
    "Arroxy oraindik ez dago kode-sinatuta, beraz macOS Gatekeeper-ek aplikazio hondatuaren abisua erakutsi dezake lehen abioan. Hori espero da — ez da fitxategiaren benetako hondaketaren seinale.",
  dl_macos_m1_h4: "Terminalaren metodoa:",
  dl_macos_step1: "Arrastatu `Arroxy.app` muntatutako DMG-tik `/Applications` karpetara.",
  dl_macos_step2:
    "Ireki Terminala eta exekutatu `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Exekutatu `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Aplikazioaren bide-izena desberdina bada, ordeztu `/Applications/Arroxy.app` instalatu duzun bide-izenarekin.",
  dl_macos_step5:
    "Sartu zure Mac-eko pasahitza `sudo`-k eskatzen badu.",
  dl_macos_after:
    "Koarentena kendu ondoren, Arroxy ohiko moduan irekitzen da.",
  dl_macos_m2_h4: "Terminalaren metodoa:",
  dl_macos_note:
    "macOS-eko eraikinak CI bidez sortzen dira Apple Silicon eta Intel exekutatzaileetan. Arazoak badituzu, mesedez [ireki issue bat](../../issues) — macOS erabiltzaileen oharrek macOS probatze-zikloa aktiboki moldatzen dute.",
  dl_linux_h3: "Linux-en lehen abioa",
  dl_linux_intro:
    "AppImage-ak zuzenean exekutatzen dira — instalaziorik gabe. Fitxategia exekutagarri gisa markatu besterik ez duzu behar.",
  dl_linux_m1_text:
    "**Fitxategi-kudeatzailea:** egin klik eskuineko botoiarekin `.AppImage` fitxategian → **Propietateak** → **Baimenak** → gaitu **Baimendu fitxategia programa gisa exekutatzea**, eta egin klik bikoitza.",
  dl_linux_m2_h4: "Terminala:",
  dl_linux_fuse_text: "Abioak hala ere huts egiten badu, exekutatu muntatu gabe — FUSE paketerik behar gabe:",
  dl_linux_targz_h4: "Tarball soila (FUSE gabe, instalaziorik gabe):",
  dl_linux_targz_text: "`.tar.gz` eraikina AppImage-aren bilgarririk gabeko aplikazio bera da — atera edonon eta exekutatu. Instalatzailerik eta FUSE paketerik behar gabe.",
  dl_linux_arch_note: "**Kaleratze-orriko Linux deskargak x86_64 soilik dira.** ARM64 makinetan (Raspberry Pi, Asahi Linux) Flatpak-a instalatu egiten da, baina abioan huts egiten du `bwrap: execvp ldconfig: Exec format error` mezuarekin.",
  dl_warning_h3: "Zergatik ikus dezakezun abisu bat",
  dl_warning_p1:
    "Arroxy kode irekikoa da eta GPLv3 lizentziarekin dago. Windows eta macOS eraikinak **ez daude kode-sinatuta** — Apple Developer ID eta Windows EV kode-sinatzeko ziurtagiriek urtean ehunka dolar balio dute, eta proiektu independente batek bere poltsikotik ordaintzen du. Sinadura horiek gabe, Windows SmartScreen-ek eta macOS Gatekeeper-ek abisua emango dizute lehen abioan. Abisuek *zure sistema eragileak ez duela argitaratzailea ezagutzen* esan nahi dute — ez dute esan nahi Arroxy malwarea denik.",
  dl_warning_p2:
    "Arroxy zeuk egiaztatzeko hiru modu, zorroztasun gero eta handiagoarekin:\n\n- **Irakurri iturburu-kodea.** Lerro guztiak [GitHub](https://github.com/antonio-orionus/Arroxy)-en daude eta [iturburutik eraiki](#tech) dezakezu.\n- **Egiaztatu SHA256.** Alderatu zure fitxategia argitaratutako [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) fitxategiarekin — ikusi [Egiaztatu zure deskarga](#verify) behean.\n- **Exekutatu hirugarrenen azterketa bat.** Igo fitxategia [VirusTotal](https://www.virustotal.com)-era.",

  dl_win_first_h3: "Windows-en lehen abioa",
  shot_smartscreen_more_alt:
    "SmartScreen-en «Windows protected your PC» elkarrizketa-koadroa, «More info» esteka nabarmenduta",
  shot_smartscreen_run_alt:
    "SmartScreen elkarrizketa-koadroa «More info» zabaldu ondoren, «Run anyway» botoia erakutsiz",
  dl_win_defender_h4: "Windows Defender-ek fitxategia markatzen edo kentzen badu",
  dl_win_defender_p:
    "Defender-en heuristikek batzuetan sinatu gabeko NSIS instalatzaileak eta Electron eramangarriak susmagarri gisa markatzen dituzte. Defender-ek `Arroxy-win-x64-Setup.exe` edo `Arroxy-win-x64-Portable.exe` koarentenan jartzen baditu, leheneratu ezazu **Windows Segurtasuna → Birusen eta mehatxuen babesa → Babes-historia** atalean, eta gehitu gero Arroxy exekutagarria baimendutako elementu gisa **Kudeatu ezarpenak → Gehitu edo kendu bazterketak** atalean. SmartScreen-ekin bezala, abisuaren arrazoia argitaratzailearen sinaduraren falta da, ez detektatutako malwarea.",

  dl_macos_first_h3: "macOS-en lehen abioa",
  dl_macos_intro:
    "Arroxy-ren macOS eraikinak ad-hoc sinatuta daude baina Apple-k ez ditu notarizatu, beraz Gatekeeper-ek lehen abioa blokeatzen du *«Arroxy.app» Not Opened — Apple could not verify «Arroxy.app» is free of malware* mezuarekin. Horrek esan nahi du macOS-ek ezin duela aplikazioa Apple-rekin egiaztatu, ez fitxategiekin zerbait gaizki dagoenik. Homebrew-rekin instalatzeak elkarrizketa-koadro hau guztiz saihesten du. DMG erabili baduzu, Terminaleko komando batek garbitzen du:",
  dl_macos_sequoia_h4: "Terminaleko konponbidea macOS egungoarentzat",
  dl_macos_sequoia_intro:
    "Erabili Terminala Arroxy Applications karpetara kopiatu ondoren:",
  dl_macos_sequoia_step1:
    "Arrastatu `Arroxy.app` muntatutako DMG-tik `/Applications` karpetara.",
  dl_macos_sequoia_step2:
    "Ireki Terminala eta exekutatu bi komando hauek:",
  dl_macos_sequoia_step3:
    "Exekutatu `open /Applications/Arroxy.app` Arroxy abiarazteko.",
  dl_macos_sequoia_step4:
    "Aplikazioaren bide-izena desberdina bada, ordeztu `/Applications/Arroxy.app` instalatu duzun bide-izenarekin.",
  dl_macos_sonoma_h4: "Terminaleko konponbidea macOS zaharragoentzat",
  dl_macos_sonoma_step1:
    "Arrastatu `Arroxy.app` muntatutako DMG-tik `/Applications` karpetara.",
  dl_macos_sonoma_step2:
    "Ireki Terminala eta kendu koarentena `/Applications/Arroxy.app` aplikaziotik.",
  dl_macos_sonoma_step3:
    "Abiarazi Arroxy Terminaletik edo Finder-etik koarentena kendu ondoren.",
  dl_macos_damaged_h4:
    "Gatekeeper-en koarentenaren konponbidea",
  dl_macos_damaged_p:
    "Lehen komandoak fitxategia deskargatu zenean macOS-ek erantsitako koarentena-atributua kentzen du; bigarrenak aplikazioa abiarazten du. Normalean ez duzu `sudo` behar, `/Applications` karpetako kopia zurea delako — gehitu baimen-errore bat jasotzen baduzu soilik.",
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** M serieko Mac batean (M1 / M2 / M3 / M4), deskargatu `arm64` DMG-a. Intel Mac-etan, deskargatu `x64` DMG-a. Eraikin okerra exekutatzeak Rosetta bidez funtzionatzen du, baina nabarmen mantsoagoa da.",

  dl_linux_first_h3: "Linux-en lehen abioa",
  dl_linux_appimagelauncher:
    "**Mahaigainarekiko integrazio aukerakoa:** instalatu [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) behin, eta klik bikoitza egiten diozun AppImage orok zure abiarazle-menuan automatikoki erregistratzen da — `.desktop` fitxategi manualik behar gabe.",

  dl_verify_h3: "Egiaztatu zure deskarga (SHA256)",
  dl_verify_intro:
    "Kaleratze bakoitzak `SHA256SUMS` fitxategi bat argitaratzen du bitarren ondoan. Zure deskarga ez dela hondatu edo bidean manipulatu egiaztatzeko, kalkulatu zure fitxategiaren hash-a lokalean eta alderatu `SHA256SUMS` fitxategiko lerroarekin. Ireki azken kaleratzearen orria → **Assets** → deskargatu `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell edo Command Prompt):",
  dl_verify_mac_label: "macOS (Terminala):",
  dl_verify_linux_label: "Linux (Terminala):",
  dl_verify_vt_text:
    "Hirugarrenen malware-azterketa bat nahi? Igo fitxategia [VirusTotal](https://www.virustotal.com)-era. Motor txikien heuristika generikoko adierazle gutxi batzuk normalak dira sinatu gabeko Electron aplikazioetan; motor handien detekzio zabalduak kezkagarriak lirateke.",

  dl_pm_intro:
    "Beste kanal bat nahiago? Hauek ere balio dute, eta kaleratze bakoitzarekin batera mantentzen dira.",

  privacy_p1:
    "Deskargak [yt-dlp](https://github.com/yt-dlp/yt-dlp)-ren bidez zuzenean eskuratzen dira YouTube-tik zuk aukeratutako karpetara — ezer ez da hirugarren baten zerbitzaritik igarotzen. Ikusitakoen historia, deskargen historia, URLak eta fitxategien edukia zure gailuan geratzen dira.",
  privacy_p2:
    "Telemetriarik ez — egunean behin seinale anonimo bakarra: aplikazioaren bertsioa, sistema eragilea, hizkuntza, instalazio-kanala, herrialdea eta Arroxy gutxi gorabehera noiz instalatu zen, erabiltzaile aktiboak eta berriak zenbatu ahal izateko. Ez da IDrik, URLrik, bideo-izenbururik, fitxategi-bide-izenik edo konturik bidaltzen. Ezarpenetan desaktiba dezakezu.",
  privacy_p3:
    "Esploratu fitxak bere saio-hasierak gordetzen ditu, zure nabigatzailetik bereiziak, eta Arroxy-k ez du inoiz saio-hasiera inprimakirik irakurtzen edo betetzen — gunearen orrian bertan idazten duzu. Deskargak saiorik gabe exekutatzen dira; kontu batek konpon dezakeen moduan batek huts egiten duenean bakarrik irakurtzen du Arroxy-k saioa berriro, aldi baterako fitxategi batean gordetzen du deskarga horretarako, eta fitxategia ezabatzen du ondoren. Ezarpenetan Esploratu fitxako saioa amaitzeak ahaztu egiten ditu.",
  faq_q1: "Benetan doakoa da?",
  faq_a1: "Bai — GPLv3 lizentziarekin, ordainpeko mailarik gabe, eginbideak blokeatu gabe.",
  faq_q11: "Zertan desberdintzen da Arroxy yt-dlp-ren beste GUI-etatik?",
  faq_a11:
    "yt-dlp-ren GUI libre gehienak esteka bat bakarrik onartzen duten wrapper-ak dira. Arroxy-k **Esploratu** gehitzen du, aplikazioan integratutako nabigatzaile bat, YouTube edo beste edozein gune irekitzen duena: estekak kopiatu gabe arakatu eta deskargatzen duzu, eta behin hasten duzu saioa hor bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak, eta Ikusteko geroago eta Gustuko zerrendak deskargatzeko, cookie-ak esportatu gabe. Arroxy-k saio hori erabiltzen du YouTube-k bot ez zarela berresteko eskatzen duenean, eta bere nabigatzaile integratuak YouTube-ren deskarga-tokena lortzen du, deskargak formatu gutxiagora ez erortzeko. Ikusi [Zergatik Arroxy](#why).",
  faq_q2: "Zer bideo-kalitate deskarga ditzaket?",
  faq_a2:
    "YouTube-k zerbitzatzen duen edozein: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, eta audioa soilik. 60 fps-ko eta HDR korronteak dauden bezala mantentzen dira, eta urratsez urratseko deskargak AV1, VP9 edo H.264 aukeratzen uzten du bereizmen bakoitzean.",
  faq_q3: "Audioa bakarrik atera dezaket MP3 gisa?",
  faq_a3:
    "Bai. Aukeratu *audioa soilik* formatu-menuan eta hautatu MP3, M4A/AAC, Opus edo WAV.",
  faq_q4: "Nola deskargatu YouTube kontu bat behar duten bideoak?",
  faq_a4:
    "Hasi saioa behin Esploratu fitxan. Arroxy-k orduan zure kontuak ikus ditzakeen bideo pribatuak eta bazkideentzakoak deskargatu ditzake, adin-murrizketadunak kontuaren adina egiaztatuta badago, eta Ikusteko geroago eta Gustuko zerrendak. Saioa kontu batek konpon dezakeen moduan deskarga batek huts egiten duenean bakarrik erabiltzen du; gainerako guztia lehen bezala deskargatzen da. Hau da cookie-en ezarpenetan lehenik zerrendatutako eta Gomendatua markarekin dagoen **Esploratu fitxako saioa** aukera, eta Arroxy-k zuretzat aukeratzen du Esploratu fitxa lehen aldiz irekitzen duzunean. yt-dlp-ren wikiak dio [saioa hasita duen automatizazioak Google kontu bat markatu dezakeela](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), beraz bigarren mailako kontu bat aukera seguruagoa da.",
  faq_q5: "Funtzionatzen jarraituko du YouTube-k zerbait aldatzen duenean?",
  faq_a5:
    "yt-dlp automatikoki eguneratzen da abioan, eta Arroxy-k konponketak azkar kaleratzen ditu YouTube-k zerbait aldatzen duenean. YouTube-k bot ez zarela berresteko eskatzen duenean, Arroxy-k zure Esploratu fitxako saioa ere probatzen du hor saioa hasi baduzu, eta fitxategi bateko edo zure nabigatzaileko cookie-ak erabilgarri daude cookie-en ezarpenetan.",
  faq_q6: "Zer hizkuntzatan dago eskuragarri Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} hizkuntza, kutxatik atera bezala: {{LANG_NAME_LIST}}. Arroxy-k zure sistema eragilearen hizkuntza automatikoki detektatzen du lehen abioan eta edonoiz alda dezakezu tresna-barrako hizkuntza-hautatzailetik. Exekuzio-denborako hizkuntza JSON-a src/shared/i18n/locales/ karpetan dago, eta itzultzaileentzako PO katalogoak i18n/locales/ karpetan — ireki PR bat GitHub-en laguntzeko.",
  faq_q7: "Beste ezer instalatu behar dut?",
  faq_a7:
    "Ez. yt-dlp, ffmpeg eta ffprobe automatikoki deskargatzen dira lehen abioan eta zure makinan gordetzen dira. Ondoren, ez da konfigurazio gehiagorik behar.",
  faq_q8: "Erreprodukzio-zerrendak edo kanal osoak deskarga ditzaket?",
  faq_a8:
    "Bai — bietan. Itsatsi erreprodukzio-zerrenda baten URLa edo kanal baten URLa (adib. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); aukeratu zenbat sarrera aztertu, eta gero jarri ilaran zerrenda osoa edo aukeratu bideo zehatzak. Data-tarteko iragazkiak laster etorriko dira.",
  faq_q9: "macOS-ek dio «aplikazioa hondatuta dago» — zer egin?",
  faq_a9:
    "Hori macOS Gatekeeper-ek sinatu gabeko aplikazio bat blokeatzea da, ez benetako hondaketa. Ikusi [macOS-en lehen abioa](#macos-first-launch) koarentena garbitzen eta Arroxy abiarazten duten Terminaleko komandoetarako.",
  faq_q10: "Legezkoa al da YouTube bideoak deskargatzea?",
  faq_a10:
    "Erabilera pertsonal eta pribaturako, jurisdikzio gehienetan orokorrean onartzen da. Zu zara YouTube-ren [Zerbitzu-baldintzak](https://www.youtube.com/t/terms) eta zure tokiko copyright-legeak betetzearen arduraduna.",
  plan_intro: "Oraindik planifikatuta — lehentasun-ordenaren arabera, gutxi gorabehera:",
  plan_col1: "Eginbidea",
  plan_col2: "Deskribapena",
  plan_r1_name: "**Erreprodukzio-zerrenda eta kanal iragazkiak**",
  plan_r1_desc: "Data-tarteko iragazkiak erreprodukzio-zerrenda edo kanal bat zerrendatzean",
  plan_r2_name: "**YouTube-ren audio-pisten lehentasunak**",
  plan_r2_desc:
    "Ezarri aplikazio osorako ahozko hizkuntza-pistaren lehentasuna, profil bakoitzeko gainidazketekin YouTube-k audio-pista anitz eskaintzen dituenean",
  plan_r3_name: "**Berreskuratze sendoagoa berriro saiatzean**",
  plan_r3_desc:
    "Berriro saiatzeko bide berri bat Interneteko konexio ez-fidagarri edo arazotsuek eten dituzten deskargetarako",
  plan_r4_name: "**Deskarga-kudeatzaile oso baten panela**",
  plan_r4_desc:
    "Bihurtu ilara-panela kudeatzaile oso bat, ilarako elementuen helburuko karpetak aldatzea barne",
  plan_r5_name: "**Programatutako deskargak**",
  plan_r5_desc: "Hasi ilara bat ordu jakin batean (gaueko exekuzioak)",
  plan_r9_name: "**AUR paketea**",
  plan_r9_desc: "Instalatu Arch Linux eta Omarchy-n `yay -S arroxy-bin` erabiliz",
  plan_cta:
    "Eginbide baten ideia duzu? [Ireki eskaera bat](../../issues) — komunitatearen ekarpenek lehentasuna moldatzen dute.",
  tech_content: TECH_CONTENT,
  support_h2: "Lagundu Arroxy",
  support_note: "Arroxy doakoa eta GPLv3 lizentziakoa da — iragarkirik, telemetriarik edo ordainpeko mailarik gabe. Denbora aurrezten badizu, garapena lagun dezakezu Bitcoin, Tron edo Ethereum bidez: helbideak [DONATE.md](DONATE.md) fitxategian daude, eta hori da horien iturri ofizial bakarra. Arroxy-k ez dizu inoiz helbiderik bidaliko posta elektronikoz edo mezu zuzenez. Biltegiari izarra ematea, akatsak jakinaraztea eta itzulpenak hobetzea berdin laguntzen dute.",
  tos_h2: "Erabilera-baldintzak",
  tos_note:
    "Arroxy erabilera pertsonal eta pribaturako tresna bat da soilik. Zu zara bakarrik zure deskargek YouTube-ren [Zerbitzu-baldintzak](https://www.youtube.com/t/terms) eta zure jurisdikzioko copyright-legeak betetzen dituztela ziurtatzeko erantzule. Ez erabili Arroxy erabiltzeko eskubiderik ez duzun edukia deskargatzeko, erreproduzitzeko edo banatzeko. Garatzaileak ez dira erantzule erabilera okerragatik.",
  footer_credit:
    'GPLv3 · Arreta handiz egina: <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
