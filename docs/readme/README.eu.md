<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy maskota" width="180" />

# Arroxy — YouTube (+ 2000 gune) deskargatzaile librea eta kode irekikoa, nabigatzaile integratuarekin, Windows, macOS eta Linux-erako

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Irakurri hemen:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · **Euskara** · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Bertsioa](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Konpilazioa](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Webgunea](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Lizentzia](https://img.shields.io/badge/license-GPLv3-blue) ![Plataformak](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Hizkuntzak](https://img.shields.io/badge/i18n-50_languages-blue)

Deskargatu bideoak, Shorts-ak, musika, kanalak, podcastak edo audio-pistak **YouTube-tik eta onartutako 2000+ guneetatik** — 8K HDR 60 fps-ra arte, MP3 / AAC / Opus formatuan, edo behar duzun zatia bakarrik. **Arakatu YouTube edo beste edozein gune Arroxy-ren barruan** Esploratu fitxan, eta deskargatu ikusten ari zaren bideoa, erreprodukzio-zerrenda edo kanala; hasi saioa hor zure kontuak ikus ditzakeen bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak deskargatzeko. Zure ordenagailuan exekutatzen da, Windows, macOS eta Linux-en. **Iragarkirik gabe, zama alferrik gabe, ordainpeko eskaintzarik gabe.**

[**↓ Instalatu azken bertsioa**](#install) &nbsp;·&nbsp; [**Webgunea**](https://arroxy.com/) &nbsp;·&nbsp; [Windows-en lehen abioa](#windows-first-launch) · [macOS-en lehen abioa](#macos-first-launch) · [Linux-en lehen abioa](#linux-first-launch)

[![Sartu Discord komunitatean](https://img.shields.io/badge/Sartu%20Discord%20komunitatean-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/Main-screenshot.png" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Arroxy-k denbora aurrezten badizu, ⭐ batek besteei aurkitzen laguntzen die.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). GPLv3 licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-20._

> 🌐 Itzulpen hau adimen artifizialaren laguntzaz egin da. [README ingelesa](../../README.md) da iturri nagusia. Akatsen bat aurkitu duzu? [Ireki PR bat](../../../../pulls).

---

## Edukia

- [✨ Eginbideak](#features)
- [📥 Instalazioa eta lehen abioa](#install)
  - [Windows-en lehen abioa](#windows-first-launch)
  - [macOS-en lehen abioa](#macos-first-launch)
  - [Zergatik ikus dezakezun abisu bat](#why-warning)
  - [Linux-en lehen abioa](#linux-first-launch)
  - [Egiaztatu zure deskarga (SHA256)](#verify)
- [⚖️ Zergatik Arroxy](#why)
- [🔒 Pribatutasuna](#privacy)
- [❓ Maiz egindako galderak](#faq)
- [🗺️ Ibilbide-orria](#roadmap)
- [💖 Lagundu Arroxy](#support)
- [🛠️ Honekin eraikia](#tech)

---

## <a id="features"></a>✨ Eginbideak

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Esploratu</b><br/>Arakatu YouTube edo beste edozein gune Arroxy-ren barruan eta deskargatu zauden orria zure profil aktiboarekin</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Esploratu fitxaren lehen pantaila</b><br/>Esploratu fitxaren begirada azkar bat, eta zergatik den bigarren mailako kontu bat saio-hasiera seguruagoa</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Deskargak fitxak esaten dizu zerk behar zaituen</b><br/>Estekak atzeko planoan prestatzen dira; huts egin duen batek bere konponbidea eskaintzen du, erreprodukzio-zerrenda luze batek zure aukeraren zain egoten da</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Deskargatu bideoaren zati bat bakarrik</b><br/>Aukeratu hasiera eta amaiera, edo kapitulu bat — Arroxy-k tarte hori bakarrik gordetzen du</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/8K-HDR-video-screenshot.png" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR 60 fps-ra</b><br/>Bideo batek eskaintzen dituen bereizmen, kodek eta HDR korronte guztiak, aldamenean</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profil-editorea</b><br/>Doitu profil bat: fitxategi-mota, bereizmena, azpitituluak, helburua, fitxategi-izenaren txantiloia eta gehiago</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Iluna edo argia, beira edo solidoa</b><br/>Lau itxura aukeran: beirazko panelak zeru higikor baten gainean edo gainazal solido lasaiak, bakoitza ilunean eta argian</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Arroxy-ren deskarga-lasterbide globala — Ctrl+Shift+D Windows eta Linux-en, Cmd+Shift+D macOS-en, kopiatutako esteka zuzenean deskarga-ilarara bidaliz" width="760" /></picture><br/><sub><b>Deskarga-lasterbide globala</b><br/>Kopiatu esteka bat edonon, sakatu behin — ilaran sartzen da eta deskargatzen hasten da</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Erreprodukzio-zerrendako elementu bakoitzeko profilak</b><br/>Eman bideo bakoitzari bere profila — artxibatu batzuk 4K-n, hartu gainerakoak MP3 gisa</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Deskarga bizkorraren hasiera</b><br/>Itsatsi URL bat eta deskargatu berehala zure profil aktiboarekin</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Berrerabil daitezkeen deskarga-profilak</b><br/>Gorde formatu, kalitate eta irteera-aurrezarpenak — berrerabili deskarga bakoitzean</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Hizkuntza anitzeko audio-pistak</b><br/>Aukeratu bideo batek dakarren audio-hizkuntza zehatza</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Inguruko / Dolby audioa</b><br/>5.1 eta Dolby pistak detektatu eta mantentzen dira</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>URL masiboen modua</b><br/>Itsatsi zerrenda bat, bikoizketak automatikoki kendu, jarri guztiak ilaran batera</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Deskarga-ilara paraleloa</b><br/>Hainbat deskarga aldi berean, aurrerapena zuzenean</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Esploratu: arakatu weba Arroxy-ren barruan</strong></summary>

- **Esploratu fitxa** — arakatu YouTube edo beste edozein gune Arroxy-ren barruan eta deskargatu aurkitzen duzuna estekak kopiatu gabe. **Deskargatu · *zure profila*** aukerak ikusten ari zaren bideoa, erreprodukzio-zerrenda edo kanala jartzen du ilaran; ondoko geziak profilak aldatzen ditu, eta makilak urratsez urratseko deskarga irekitzen du formatuak, azpitituluak eta gehiago aukeratzeko
- **Egin klik eskuineko botoiarekin deskargatzeko** — egin klik eskuineko botoiarekin Esploratu fitxako edozein bideo-, erreprodukzio-zerrenda- edo kanal-estekatan zure profilarekin deskargatzeko, aukeratu beste profil bat **Deskargatu honekin** aukeran, ireki urratsez urratseko deskarga, edo kopiatu esteka. Ez da bideo bakoitza lehenik irekitzeko beharrik
- **Diseinu trinkoa** — Esploratu fitxako tresna-barrako klik batek Arroxy-ren fitxak bertara eramaten ditu eta orriari leku gehiago ematen dio
- **Helbide-barra** — idatzi YouTube-n bilatzeko, edo sartu edozein web-helbide gune hori irekitzeko
- **Kontu bat behar duten deskargak** — hasi saioa behin Esploratu fitxan eta Arroxy-k zure kontuak ikus ditzakeen bideo pribatuak eta bazkideentzakoak deskargatu ahal izango ditu, adin-murrizketadunak kontuaren adina egiaztatuta badago, eta Ikusteko geroago eta Gustuko zerrendak. Hasi saioa beste guneetan ere hor, eta haien deskargek saio hori erabiliko dute behar dutenean. Arroxy-k saiorik gabe deskargatzen du lehenik, eta zure Esploratu fitxako saioa kontu batek konpon dezakeen moduan deskarga batek huts egiten duenean bakarrik erabiltzen du. YouTube-k bot ez zarela berresteko eskatzen duenean, Arroxy-k zure Esploratu fitxako saioa ere probatzen du
- **Erabili bigarren mailako kontu bat** — Esploratu fitxaren lehen pantailak zergatik azaltzen du: kontu batekin deskargatzeak kontu hori mugatua izateko arrisku bat dakar. Amaitu Esploratu fitxako saioa Ezarpenetan zure saio-hasierak ahazteko nahi duzunean
- **Iragarki-blokeatzailea** — lehenespenez desaktibatuta. Esploratu fitxako tresna-barrako ezkutuaren gaineko klik batek iragarkiak eta jarraitzaileak blokeatzen ditu bere orrietan, deskargei eragin gabe. YouTube-k iragarki-blokeatzaileei trabak jar diezazkieke saioa hasita duten kontuetan

</details>

<details>
<summary><strong>🎞️ Kalitatea eta formatuak</strong></summary>

- **8K (4320p)** arte, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Fotograma-tasa altua eta HDR** dauden bezala mantenduta — 60 fps, HDR10
- **Audioa** — esportatu audioa soilik MP3, M4A/AAC, Opus edo WAV formatuan. Deskarga interaktiboetan, aukeratu iturriaren inguruko/Dolby pista natiboak (AC-3, E-AC-3, 5.1, DRC) eskuragarri daudenean, edo ezarri **Lehenetsi inguruko audioa / Dolby** lehenespen orokor gisa
- **Helburua duten profilak** — *Irudi onena* (AV1 · VP9) edo *Smart TV* (MP4 · H.264), Automatikoa, MP4, MKV edo WebM gisa gordeta birkodetu gabe. HDR *Automatikoa* da (zure pantailak erakutsi dezakeenean bakarrik), *SDR* edo *HDR*
- **Kodek guztiak bereizmen guztietan** — urratsez urratseko deskargak AV1, VP9 eta H.264 zerrendatzen ditu bereizmen bakoitzean, aldamenean, zure telebistak edo editoreak erreproduzitzen duena aukeratu ahal izateko
- **Jakin zer den korronte bat benetan** — YouTube-k AA bidez handitutako tamainak, AA bidez bikoiztutako audio-hizkuntzak, bit-tasa hobetuko korronteak, 360° bideoak eta kopia hondatuak edo ur-markadunak markatuta daude. Profilek AA bidez handitutako korronteak saltatzen dituzte baimentzen ez badituzu

</details>

<details>
<summary><strong>🛡️ Pribatutasuna eta kontrola</strong></summary>

- % 100 tokiko prozesamendua — deskargak zuzenean YouTube-tik zure diskora doaz
- **Kode irekia** — lerro guztiak ikuskatu daitezke, GPLv3 lizentziarekin
- Fitxategiak zuk aukeratutako karpetan gordetzen dira zuzenean

</details>

<details>
<summary><strong>⚡ Lan-fluxua</strong></summary>

- **Deskarga-lasterbide globala** — kopiatu esteka bat edozein aplikaziotan eta sakatu `Ctrl+Shift+D` (`Cmd+Shift+D` macOS-en); Arroxy-k zure profil aktiboarekin jartzen du ilaran leihoa ireki gabe, eta jakinarazpen batek berresten du. Lehenespenez aktibatuta, aldagarria
- **Hasteko modu malguak** — aukeratu deskarga bakarra gidatua, erreprodukzio-zerrenda/kanal hautatzailea, URL masiboen itsatsia, Deskarga bizkorra gordetako lehenespenekin, edo arakatu eta deskargatu Esploratu fitxatik
- **Deskarga-ilara zentrala** — deskarga bakar, erreprodukzio-zerrenda, masibo edo bizkor orok toki bakarrean amaitzen du aurrerapena, etenak, berrekitea, bertan behera uztea, berriro saiatzea eta lehentasuna kontrolatzeko
- **Arbelaren zaintza** — kopiatu bideo-esteka bat eta URL eremua betetzen du Arroxy-ra itzultzean, **Desegin** aukerarekin ez bazenuen nahi. Arroxy lanpetuta dagoenean, esteka URL fitxara itzuli arte itxaroten du (desaktibatu Ezarpenetan)
- **URLen garbiketa automatikoa** — jarraipen-parametroak kentzen ditu (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) eta `youtube.com/redirect` estekak zabaltzen ditu
- **Erretilu modua** — leihoa ixteak deskargak atzeko planoan martxan mantentzen ditu
- **50 hizkuntza** — sistemaren hizkuntza automatikoki detektatzen du, edonoiz aldagarria
- **Erreprodukzio-zerrenda sinkronizatzea** — berriro eskaneatu erreprodukzio-zerrenda bat tokiko karpeta batekin alderatzeko, jada deskargatutako bideoak saltatzeko; bideo bakoitza deskargatu ahala eguneratzen den `.m3u` erreprodukzio-zerrenda fitxategi bat sortzen du
- **Abiadura- eta erritmo-kontrolak** — mugatu deskargaren banda-zabalera, ezarri bideo baten zenbat zati deskargatzen diren aldi berean, eta gehitu eskaeren atzerapenak aurrezarpenekin (*Desaktibatuta · Orekatua · Zuhurra · Pertsonalizatua*)
- **Fitxategi-izenen txantiloiak** — jarri izena deskargei zure erara `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` eta `{playlist_index}` erabiliz, globalki edo deskarga-profil bakoitzeko
- **Aldi berako deskargak eta berriro saiatze automatikoa** — aukeratu ilarako zenbat deskarga exekutatzen diren aldi berean, eta utzi Arroxy-ri sareko edo zerbitzariko arazo bat izan duen deskarga bat berriro saiatzen, saiakera bakoitzaren aurretik gero eta gehiago itxaroten
- **Erreprodukzio-zerrendako elementu bakoitzeko profilak** — esleitu erreprodukzio-zerrendako bideo bakoitzari bere deskarga-profila zerrenda osorako ezarpen bakarraren ordez, pasaldi bakarrean batzuk kalitate osoz artxibatu eta gainerakoak MP3 gisa hartzeko
- **Deskarga bizkorra atzeko planoan dabil** — esteka Deskargak fitxan agertzen da berehala eta han prestatzen da, **Ikusi** duen ohar batek berresten du, eta URL eremua garbitzen da hurrengo estekarako. Hasi nahi adina lehenekoak prestatzen ari diren bitartean
- **Deskargak fitxak esaten dizu zerk behar zaituen** — Arroxy-k esteka bat irakurri ezin badu, bere lerroak zergatik dioen eta konponbidea eskaintzen du: Saiatu berriro, aktibatu cookie-ak, edo hasi saioa Esploratu fitxan. Cookie-ak desaktibatuta daudenean, **Hasi saioa Esploratu fitxan** aukerak berriro saiatzen du zuretzat saioa hasi ondoren. Zure kargatze-muga baino luzeagoa den erreprodukzio-zerrenda batek bere lerroan itxaroten du zuk guztia, lehenengoak edo berrikuspen bat aukeratzeko. Deskargak fitxak zuri itxaroten dauden lerroak zenbatzen ditu
- **Deskargatu bideoaren zati bat bakarrik** — aukeratu hasiera eta amaiera, edo kapitulu bat, Formatua pantailan eta Arroxy-k tarte hori bakarrik gordetzen du, bideoaren id-aren ondoren tartearekin izendatuta. Mozketak hurbilen dagoen gako-fotogramara doaz; aktibatu ebaki zehatza horren ordez birkodetzeko
- **Kendu amaitutako deskargak** — aukerakoa: amaitutako deskarga bat zerrendatik desagertzen da 5 segundo geroago. Bere fitxategiak diskoan geratzen dira, eta huts egindako deskargak zerrendan geratzen dira
- **Tamaina eta Falta da Deskargak fitxan** — **Tamaina** zutabe ordenagarri batek deskarga bakoitzak zenbat leku hartzen duen erakusten du, eta **Falta da** aukerak Arroxy-tik kanpo mugitutako edo ezabatutako fitxategiak markatzen ditu
- **Aurora edo Minimal, iluna edo argia** — beirazko panelak zeru higikor baten gainean, edo gainazal solido lasaiak; aldatu oinetik. Grafiko-azelerazio gabeko ordenagailuek Minimal automatikoki jasotzen dute
- **Mac-eko menu-barra** — macOS-en, ireki Ezarpenak (`Cmd+,`), ezarri deskarga-abiaduraren muga, aldatu estiloa eta gaia, eta ireki erregistroak edo gorde diagnostiko-fitxategi bat menu-barratik
- **Aldatu profil bat edozein deskargatik** — doitu deskarga bat, gero eguneratu abiapuntu izan zuen profila (aldatuko denaren aurrebistarekin) edo gorde ezarpenak profil berri gisa. Profila aldatzean galdetzen da zure editatutakoak mantendu nahi dituzun

</details>

<details>
<summary><strong>📝 Azpitituluak eta postprozesamendua</strong></summary>

- **Azpitituluak** SRT, VTT edo ASS formatuan — eskuzkoak edo automatikoki sortuak, erabilgarri dagoen edozein hizkuntzatan
- Gorde bideoaren ondoan, txertatu `.mkv` fitxategian, edo antolatu `Subtitles/` azpikarpeta batean
- **Azpititulu-multzoak soilik** — itsatsi URL zerrenda bat edo ireki erreprodukzio-zerrenda bat, aukeratu Azpitituluak, eta lortu bideo bakoitzaren azpititulu-fitxategiak bakarrik
- **SponsorBlock** — saltatu edo markatu kapitulu gisa babesleak, sarrerak, amaierak, autopromozioak
- **Txertatutako metadatuak** — izenburua, igotze-data, kanala, deskribapena, miniatura eta kapitulu-markak fitxategian idatzita

</details>

<details>
<summary><strong>🌐 YouTube + 2000 gune</strong></summary>

- **YouTube, osorik** — Bideoak, Shorts, Kanalak, Erreprodukzio-zerrendak, YouTube Music eta Podcastak lehen mailako iturri gisa kudeatuta
- **Beste 2000+ gune** yt-dlp bidez — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable eta askoz gehiago
- **Audioa soilik eta azpitituluak** onartutako gune guztietan dabiltza, ez YouTube-n bakarrik
- Gune batek aldatzen badu, yt-dlp-k asteroko konponketak kaleratzen ditu eta Arroxy-k bitarra automatikoki eguneratzen du abioan

</details>

---

## <a id="install"></a>📥 Instalazioa eta lehen abioa

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
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --appimage
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

Eraikinak x86_64 soilik dira. `curl` ez duzu? Ordeztu `curl -fsSL` hau `wget -qO-` honekin.

| Plataforma | Deskarga zuzena |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Kaleratzeko aktibo guztiak →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows-en lehen abioa</strong></summary>

Lehen abioan **«Windows protected your PC»** (Windows-ek zure PCa babestu du) edo **«Unknown publisher»** (argitaratzaile ezezaguna) ikus dezakezu. Hau `Arroxy-win-x64-Setup.exe` eta `Arroxy-win-x64-Portable.exe` fitxategiei aplikatzen zaie. Arroxy doakoa eta kode irekikoa da, eta Windows-eko eraikinak ez daude ordainpeko ziurtagiri batekin kode-sinatuta; horregatik markatzen ditu SmartScreen-ek. Horrek **ez** du automatikoki esan nahi Arroxy ez denik segurua. Jarraitzeko:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen-en «Windows protected your PC» elkarrizketa-koadroa, «More info» esteka nabarmenduta" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen elkarrizketa-koadroa «More info» zabaldu ondoren, «Run anyway» botoia erakutsiz" />
</div>

1. Egin klik **Informazio gehiago** aukeran (*More info*).
2. Egin klik **Exekutatu hala ere** aukeran (*Run anyway*).

#### Windows Defender-ek fitxategia markatzen edo kentzen badu

Defender-en heuristikek batzuetan sinatu gabeko NSIS instalatzaileak eta Electron eramangarriak susmagarri gisa markatzen dituzte. Defender-ek `Arroxy-win-x64-Setup.exe` edo `Arroxy-win-x64-Portable.exe` koarentenan jartzen baditu, leheneratu ezazu **Windows Segurtasuna → Birusen eta mehatxuen babesa → Babes-historia** atalean, eta gehitu gero Arroxy exekutagarria baimendutako elementu gisa **Kudeatu ezarpenak → Gehitu edo kendu bazterketak** atalean. SmartScreen-ekin bezala, abisuaren arrazoia argitaratzailearen sinaduraren falta da, ez detektatutako malwarea.

> Deskargatu Arroxy GitHub Releases orri ofizialetik bakarrik. Fitxategia beste webgune batetik lortu baduzu edo norbaitek bidali badizu, ezabatu eta deskargatu kopia berri bat iturri ofizialetik. Iturburu-kodea publikoa da, beraz ikuskatu dezakezu edo nahiago baduzu Arroxy zeuk eraiki.

Scoop nahiago? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS-en lehen abioa</strong></summary>

Arroxy-ren macOS eraikinak ad-hoc sinatuta daude baina Apple-k ez ditu notarizatu, beraz Gatekeeper-ek lehen abioa blokeatzen du *«Arroxy.app» Not Opened — Apple could not verify «Arroxy.app» is free of malware* mezuarekin. Horrek esan nahi du macOS-ek ezin duela aplikazioa Apple-rekin egiaztatu, ez fitxategiekin zerbait gaizki dagoenik. Homebrew-rekin instalatzeak elkarrizketa-koadro hau guztiz saihesten du. DMG erabili baduzu, Terminaleko komando batek garbitzen du:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Arrastatu `Arroxy.app` muntatutako DMG-tik `/Applications` karpetara.
2. Ireki Terminala eta exekutatu bi komando hauek:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Lehen komandoak fitxategia deskargatu zenean macOS-ek erantsitako koarentena-atributua kentzen du; bigarrenak aplikazioa abiarazten du. Normalean ez duzu `sudo` behar, `/Applications` karpetako kopia zurea delako — gehitu baimen-errore bat jasotzen baduzu soilik.

**Apple Silicon vs Intel:** M serieko Mac batean (M1 / M2 / M3 / M4), deskargatu `arm64` DMG-a. Intel Mac-etan, deskargatu `x64` DMG-a. Eraikin okerra exekutatzeak Rosetta bidez funtzionatzen du, baina nabarmen mantsoagoa da.

> macOS-eko eraikinak CI bidez sortzen dira Apple Silicon eta Intel exekutatzaileetan. Arazoak badituzu, mesedez [ireki issue bat](../../../../issues) — macOS erabiltzaileen oharrek macOS probatze-zikloa aktiboki moldatzen dute.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Zergatik ikus dezakezun abisu bat</strong></summary>

Arroxy kode irekikoa da eta GPLv3 lizentziarekin dago. Windows eta macOS eraikinak **ez daude kode-sinatuta** — Apple Developer ID eta Windows EV kode-sinatzeko ziurtagiriek urtean ehunka dolar balio dute, eta proiektu independente batek bere poltsikotik ordaintzen du. Sinadura horiek gabe, Windows SmartScreen-ek eta macOS Gatekeeper-ek abisua emango dizute lehen abioan. Abisuek *zure sistema eragileak ez duela argitaratzailea ezagutzen* esan nahi dute — ez dute esan nahi Arroxy malwarea denik.

Arroxy zeuk egiaztatzeko hiru modu, zorroztasun gero eta handiagoarekin:

- **Irakurri iturburu-kodea.** Lerro guztiak [GitHub](https://github.com/antonio-orionus/Arroxy)-en daude eta [iturburutik eraiki](#tech) dezakezu.
- **Egiaztatu SHA256.** Alderatu zure fitxategia argitaratutako [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) fitxategiarekin — ikusi [Egiaztatu zure deskarga](#verify) behean.
- **Exekutatu hirugarrenen azterketa bat.** Igo fitxategia [VirusTotal](https://www.virustotal.com)-era.

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux-en lehen abioa</strong></summary>

AppImage-ak zuzenean exekutatzen dira — instalaziorik gabe. Fitxategia exekutagarri gisa markatu besterik ez duzu behar.

**Fitxategi-kudeatzailea:** egin klik eskuineko botoiarekin `.AppImage` fitxategian → **Propietateak** → **Baimenak** → gaitu **Baimendu fitxategia programa gisa exekutatzea**, eta egin klik bikoitza.

**Terminala:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Abioak hala ere huts egiten badu, exekutatu muntatu gabe — FUSE paketerik behar gabe:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Mahaigainarekiko integrazio aukerakoa:** instalatu [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) behin, eta klik bikoitza egiten diozun AppImage orok zure abiarazle-menuan automatikoki erregistratzen da — `.desktop` fitxategi manualik behar gabe.

**Tarball soila (FUSE gabe, instalaziorik gabe):**

`.tar.gz` eraikina AppImage-aren bilgarririk gabeko aplikazio bera da — atera edonon eta exekutatu. Instalatzailerik eta FUSE paketerik behar gabe.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Kaleratze-orriko Linux deskargak x86_64 soilik dira.** ARM64 makinetan (Raspberry Pi, Asahi Linux) Flatpak-a instalatu egiten da, baina abioan huts egiten du `bwrap: execvp ldconfig: Exec format error` mezuarekin.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Egiaztatu zure deskarga (SHA256)</strong></summary>

Kaleratze bakoitzak `SHA256SUMS` fitxategi bat argitaratzen du bitarren ondoan. Zure deskarga ez dela hondatu edo bidean manipulatu egiaztatzeko, kalkulatu zure fitxategiaren hash-a lokalean eta alderatu `SHA256SUMS` fitxategiko lerroarekin. Ireki azken kaleratzearen orria → **Assets** → deskargatu `SHA256SUMS`.

**Windows (PowerShell edo Command Prompt):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminala):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminala):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Hirugarrenen malware-azterketa bat nahi? Igo fitxategia [VirusTotal](https://www.virustotal.com)-era. Motor txikien heuristika generikoko adierazle gutxi batzuk normalak dira sinatu gabeko Electron aplikazioetan; motor handien detekzio zabalduak kezkagarriak lirateke.

</details>

<details>
<summary><strong>📦 Windows: Instalatzailea vs Eramangarria</strong></summary>

|               | NSIS instalatzailea | `.exe` eramangarria |
| ------------- | :----------------------: | :---------------------: |
| Instalazioa behar da | Bai  | Ez — exekutatu edonondik  |
| Eguneratze automatikoak | ✅ aplikazioan  | ❌ eskuzko deskarga  |
| Abiarazte-abiadura | ✅ azkarragoa  | ⚠️ hotzean mantsoagoa  |
| Hasiera menuan gehitzen da |            ✅            |           ❌            |
| Desinstalatze erraza |            ✅            | ❌ ezabatu fitxategia  |

**Gomendioa:** erabili NSIS instalatzailea eguneratze automatikoetarako eta abiarazte azkarragorako. Erabili `.exe` eramangarria instalaziorik gabeko eta erregistrorik gabeko aukera baterako.

</details>

---

## <a id="why"></a>⚖️ Zergatik Arroxy

Alternatibarik ohikoenekin alderaketa zuzena:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Nabigatzaile integratua (arakatu, hasi saioa, deskargatu) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak cookie-ak esportatu gabe |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Doakoa, ordainpeko mailarik gabe |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Kode irekia |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Tokiko prozesamendua soilik |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Erabilera-mugarik gabe |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Plataforma anitzeko mahaigaineko aplikazioa |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Azpitituluak + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = zati batean, edo ordainpeko mailan bakarrik. 4K Video Downloader-en aplikazioko saio-hasiera bideo pribatuetarako ordainpeko eginbide bat da; yt-dlp-ren GUI libre gehienek cookie-fitxategi bat bakarrik onartzen dute, edo zure web-nabigatzailearen cookie-ak irakurtzen dituzte.

Arroxy gauza bakar baterako eraiki da: tokiko fitxategi garbi bat, URL bat itsatsi edo bideoa Esploratu fitxan aurkitu. Ordainpeko eskaintzarik gabe, daturik bildu gabe.

### <a id="why-explore"></a>🧭 yt-dlp-ren inguruko wrapper soil batek egin ezin duena: Esploratu fitxa

YouTube-ren deskargatzaile libre gehienak yt-dlp-ren gaineko URL kutxa bat dira. Arroxy-k ere yt-dlp erabiltzen du, baina **Esploratu** ere badu: aplikazioan integratutako nabigatzaile bat, YouTube edo beste edozein gune irekitzen duena. Esploratu fitxak URL kutxa batek gainditu ezin dituen mugak gainditzen ditu:

- **Kontu bat behar duten bideoak, cookie-ak esportatu gabe** — bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak (adina egiaztatutako kontu batean), baita Ikusteko geroago eta Gustuko zerrendak ere, eta beste guneetan saio-hasiera baten atzean dauden bideoak. Wrapper soil batek cookies.txt esportazio bat behar du edo zure web-nabigatzailearen cookie-ak irakurri behar ditu, eta Windows-eko Chrome-k orain blokeatu egiten ditu. Arroxy-n behin hasten duzu saioa Esploratu fitxan eta gainerakoa berak egiten du
- **«Sign in to confirm you're not a bot»** — YouTube-k hau eskatzen duenean, Arroxy-k deskarga berriro saiatzen du zure Esploratu fitxako saioarekin, huts egin beharrean
- **YouTube-ren deskarga-tokena** — Arroxy-ren nabigatzaile integratuak YouTube-k deskarga baino lehen espero duen tokena lortzen du. Hori gabe, YouTube-k formatu gutxiago eta kalitate baxuagoa eskain ditzake eskatu duzuna baino
- **Estekak kopiatu gabe** — bilatu bideo, erreprodukzio-zerrenda edo kanal bat Esploratu fitxan eta deskargatu klik batekin, edo egin klik eskuineko botoiarekin orriko edozein estekatan
- **Iragarki-blokeatzailea nahi duzunean** — ezkutuaren gaineko klik batek iragarkiak eta jarraitzaileak blokeatzen ditu Esploratu fitxako orrietan

---

## <a id="privacy"></a>🔒 Pribatutasuna

Deskargak [yt-dlp](https://github.com/yt-dlp/yt-dlp)-ren bidez zuzenean eskuratzen dira YouTube-tik zuk aukeratutako karpetara — ezer ez da hirugarren baten zerbitzaritik igarotzen. Ikusitakoen historia, deskargen historia, URLak eta fitxategien edukia zure gailuan geratzen dira.

Telemetriarik ez — egunean behin seinale anonimo bakarra: aplikazioaren bertsioa, sistema eragilea, hizkuntza, instalazio-kanala, herrialdea eta Arroxy gutxi gorabehera noiz instalatu zen, erabiltzaile aktiboak eta berriak zenbatu ahal izateko. Ez da IDrik, URLrik, bideo-izenbururik, fitxategi-bide-izenik edo konturik bidaltzen. Ezarpenetan desaktiba dezakezu.

Esploratu fitxak bere saio-hasierak gordetzen ditu, zure nabigatzailetik bereiziak, eta Arroxy-k ez du inoiz saio-hasiera inprimakirik irakurtzen edo betetzen — gunearen orrian bertan idazten duzu. Deskargak saiorik gabe exekutatzen dira; kontu batek konpon dezakeen moduan batek huts egiten duenean bakarrik irakurtzen du Arroxy-k saioa berriro, aldi baterako fitxategi batean gordetzen du deskarga horretarako, eta fitxategia ezabatzen du ondoren. Ezarpenetan Esploratu fitxako saioa amaitzeak ahaztu egiten ditu.

---

## <a id="faq"></a>❓ Maiz egindako galderak

<details>
<summary><strong>Benetan doakoa da?</strong></summary>

Bai — GPLv3 lizentziarekin, ordainpeko mailarik gabe, eginbideak blokeatu gabe.

</details>

<details>
<summary><strong>Zertan desberdintzen da Arroxy yt-dlp-ren beste GUI-etatik?</strong></summary>

yt-dlp-ren GUI libre gehienak esteka bat bakarrik onartzen duten wrapper-ak dira. Arroxy-k **Esploratu** gehitzen du, aplikazioan integratutako nabigatzaile bat, YouTube edo beste edozein gune irekitzen duena: estekak kopiatu gabe arakatu eta deskargatzen duzu, eta behin hasten duzu saioa hor bideo pribatuak, bazkideentzakoak eta adin-murrizketadunak, eta Ikusteko geroago eta Gustuko zerrendak deskargatzeko, cookie-ak esportatu gabe. Arroxy-k saio hori erabiltzen du YouTube-k bot ez zarela berresteko eskatzen duenean, eta bere nabigatzaile integratuak YouTube-ren deskarga-tokena lortzen du, deskargak formatu gutxiagora ez erortzeko. Ikusi [Zergatik Arroxy](#why).

</details>

<details>
<summary><strong>Zer bideo-kalitate deskarga ditzaket?</strong></summary>

YouTube-k zerbitzatzen duen edozein: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, eta audioa soilik. 60 fps-ko eta HDR korronteak dauden bezala mantentzen dira, eta urratsez urratseko deskargak AV1, VP9 edo H.264 aukeratzen uzten du bereizmen bakoitzean.

</details>

<details>
<summary><strong>Audioa bakarrik atera dezaket MP3 gisa?</strong></summary>

Bai. Aukeratu *audioa soilik* formatu-menuan eta hautatu MP3, M4A/AAC, Opus edo WAV.

</details>

<details>
<summary><strong>Nola deskargatu YouTube kontu bat behar duten bideoak?</strong></summary>

Hasi saioa behin Esploratu fitxan. Arroxy-k orduan zure kontuak ikus ditzakeen bideo pribatuak eta bazkideentzakoak deskargatu ditzake, adin-murrizketadunak kontuaren adina egiaztatuta badago, eta Ikusteko geroago eta Gustuko zerrendak. Saioa kontu batek konpon dezakeen moduan deskarga batek huts egiten duenean bakarrik erabiltzen du; gainerako guztia lehen bezala deskargatzen da. Hau da cookie-en ezarpenetan lehenik zerrendatutako eta Gomendatua markarekin dagoen **Esploratu fitxako saioa** aukera, eta Arroxy-k zuretzat aukeratzen du Esploratu fitxa lehen aldiz irekitzen duzunean. yt-dlp-ren wikiak dio [saioa hasita duen automatizazioak Google kontu bat markatu dezakeela](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), beraz bigarren mailako kontu bat aukera seguruagoa da.

</details>

<details>
<summary><strong>Funtzionatzen jarraituko du YouTube-k zerbait aldatzen duenean?</strong></summary>

yt-dlp automatikoki eguneratzen da abioan, eta Arroxy-k konponketak azkar kaleratzen ditu YouTube-k zerbait aldatzen duenean. YouTube-k bot ez zarela berresteko eskatzen duenean, Arroxy-k zure Esploratu fitxako saioa ere probatzen du hor saioa hasi baduzu, eta fitxategi bateko edo zure nabigatzaileko cookie-ak erabilgarri daude cookie-en ezarpenetan.

</details>

<details>
<summary><strong>Zer hizkuntzatan dago eskuragarri Arroxy?</strong></summary>

50 hizkuntza, kutxatik atera bezala: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy-k zure sistema eragilearen hizkuntza automatikoki detektatzen du lehen abioan eta edonoiz alda dezakezu tresna-barrako hizkuntza-hautatzailetik. Exekuzio-denborako hizkuntza JSON-a src/shared/i18n/locales/ karpetan dago, eta itzultzaileentzako PO katalogoak i18n/locales/ karpetan — ireki PR bat GitHub-en laguntzeko.

</details>

<details>
<summary><strong>Beste ezer instalatu behar dut?</strong></summary>

Ez. yt-dlp, ffmpeg eta ffprobe automatikoki deskargatzen dira lehen abioan eta zure makinan gordetzen dira. Ondoren, ez da konfigurazio gehiagorik behar.

</details>

<details>
<summary><strong>Erreprodukzio-zerrendak edo kanal osoak deskarga ditzaket?</strong></summary>

Bai — bietan. Itsatsi erreprodukzio-zerrenda baten URLa edo kanal baten URLa (adib. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); aukeratu zenbat sarrera aztertu, eta gero jarri ilaran zerrenda osoa edo aukeratu bideo zehatzak. Data-tarteko iragazkiak laster etorriko dira.

</details>

<details>
<summary><strong>macOS-ek dio «aplikazioa hondatuta dago» — zer egin?</strong></summary>

Hori macOS Gatekeeper-ek sinatu gabeko aplikazio bat blokeatzea da, ez benetako hondaketa. Ikusi [macOS-en lehen abioa](#macos-first-launch) koarentena garbitzen eta Arroxy abiarazten duten Terminaleko komandoetarako.

</details>

<details>
<summary><strong>Legezkoa al da YouTube bideoak deskargatzea?</strong></summary>

Erabilera pertsonal eta pribaturako, jurisdikzio gehienetan orokorrean onartzen da. Zu zara YouTube-ren [Zerbitzu-baldintzak](https://www.youtube.com/t/terms) eta zure tokiko copyright-legeak betetzearen arduraduna.

</details>

---

## <a id="roadmap"></a>🗺️ Ibilbide-orria

Oraindik planifikatuta — lehentasun-ordenaren arabera, gutxi gorabehera:

| Eginbidea    | Deskribapena    |
| ---------------- | ---------------- |
| **Erreprodukzio-zerrenda eta kanal iragazkiak** | Data-tarteko iragazkiak erreprodukzio-zerrenda edo kanal bat zerrendatzean |
| **YouTube-ren audio-pisten lehentasunak** | Ezarri aplikazio osorako ahozko hizkuntza-pistaren lehentasuna, profil bakoitzeko gainidazketekin YouTube-k audio-pista anitz eskaintzen dituenean |
| **Berreskuratze sendoagoa berriro saiatzean** | Berriro saiatzeko bide berri bat Interneteko konexio ez-fidagarri edo arazotsuek eten dituzten deskargetarako |
| **Deskarga-kudeatzaile oso baten panela** | Bihurtu ilara-panela kudeatzaile oso bat, ilarako elementuen helburuko karpetak aldatzea barne |
| **Programatutako deskargak** | Hasi ilara bat ordu jakin batean (gaueko exekuzioak) |
| **AUR paketea** | Instalatu Arch Linux eta Omarchy-n `yay -S arroxy-bin` erabiliz |

Eginbide baten ideia duzu? [Ireki eskaera bat](../../../../issues) — komunitatearen ekarpenek lehentasuna moldatzen dute.

---

## <a id="support"></a>💖 Lagundu Arroxy

Arroxy doakoa eta GPLv3 lizentziakoa da — iragarkirik, telemetriarik edo ordainpeko mailarik gabe. Denbora aurrezten badizu, garapena lagun dezakezu Bitcoin, Tron edo Ethereum bidez: helbideak [DONATE.md](../../DONATE.md) fitxategian daude, eta hori da horien iturri ofizial bakarra. Arroxy-k ez dizu inoiz helbiderik bidaliko posta elektronikoz edo mezu zuzenez. Biltegiari izarra ematea, akatsak jakinaraztea eta itzulpenak hobetzea berdin laguntzen dute.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Honekin eraikia

<details>
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
| Node.js | 24.21.0 | `mise install` edo `.node-version` |
| Bun     | 1.4.2  | `mise install` edo `package.json` `packageManager` |

Gomendioa: instalatu `mise`, eta gero exekutatu `mise install` checkout-ean. mise gabe, aktibatu eskuz Node.js `.node-version` fitxategitik eta Bun `package.json` fitxategitik `bun run bootstrap` exekutatu aurretik.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Baliteke Visual Studio Build Tools eta Python behar izatea berreraikuntza natiboetarako.

### macOS

```bash
brew install mise
xcode-select --install
```

Klonatu ondoren, exekutatu `mise trust && mise install` checkout-etik. Zure shell-ak jada `fnm`, `nvm` edo Homebrew-eko Bun erabiltzen badu, aktibatu mise `~/.zshrc` fitxategian, Arroxy-k Node.js 24.21.0 eta Bun 1.4.2 lor ditzan:

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

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Klonatu eta exekutatu

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Banatzeko pakete bat eraiki

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` komandoak mendekotasunak instalatzen ditu, Electron aplikazioaren mendekotasunak berreraikitzen ditu, Electron egiaztatzen du, garapenerako ffmpeg/ffprobe txertatuak prestatzen ditu eta Playwright Chromium instalatzen du. Kaleratze-eraikinek yt-dlp, ffmpeg eta ffprobe kudeatzen dituzte exekuzio-denboran zure aplikazio-datuen karpetan; ez da horietako bat ere instalatzailearen barruan banatzen.

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

## 📜 Erabilera-baldintzak

Arroxy erabilera pertsonal eta pribaturako tresna bat da soilik. Zu zara bakarrik zure deskargek YouTube-ren [Zerbitzu-baldintzak](https://www.youtube.com/t/terms) eta zure jurisdikzioko copyright-legeak betetzen dituztela ziurtatzeko erantzule. Ez erabili Arroxy erabiltzeko eskubiderik ez duzun edukia deskargatzeko, erreproduzitzeko edo banatzeko. Garatzaileak ez dira erantzule erabilera okerragatik.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Arreta handiz egina: <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
