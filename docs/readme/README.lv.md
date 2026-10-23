<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy talismans" width="180" />

# Arroxy — bezmaksas atvērtā koda YouTube (+ 2000 vietņu) lejupielādētājs ar iebūvētu pārlūku operētājsistēmām Windows, macOS un Linux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Lasīt valodā:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · **Latviešu** · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Laidiens](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Būvējums](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Vietne](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licence](https://img.shields.io/badge/license-GPLv3-blue) ![Platformas](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Valodas](https://img.shields.io/badge/i18n-50_languages-blue)

Lejupielādējiet videoklipus, Shorts, kanālus, podkāstus vai audio celiņus no **YouTube un 2000+ atbalstītām vietnēm** — līdz pat 8K HDR ar 60 kadriem sekundē, kā MP3 / AAC / Opus vai tikai to daļu, kas jums nepieciešama. **Pārlūkojiet YouTube vai jebkuru citu vietni Arroxy iekšienē** cilnē Izpēte un lejupielādējiet video, atskaņošanas sarakstu vai kanālu, kurā atrodaties; pierakstieties tur, lai lejupielādētu videoklipus, ko jūsu konts jau var skatīties. Darbojas lokāli operētājsistēmās Windows, macOS un Linux. **Bez reklāmām, bez liekām funkcijām, bez uzmācīgas pārdošanas.**

[**↓ Instalēt jaunāko laidienu**](#install) &nbsp;·&nbsp; [**Vietne**](https://arroxy.com/) &nbsp;·&nbsp; [Windows pirmā palaišana](#windows-first-launch) · [macOS pirmā palaišana](#macos-first-launch) · [Linux pirmā palaišana](#linux-first-launch)

[![Pievienojieties Discord kopienai](https://img.shields.io/badge/Pievienojieties%20Discord%20kopienai-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Ja Arroxy ietaupa jūsu laiku, ⭐ palīdz citiem to atrast.

</div>

> **Kas ir Arroxy?** Arroxy ir bezmaksas atvērtā koda darbvirsmas grafiskā saskarne, kas lejupielādē videoklipus, audio, atskaņošanas sarakstus un subtitrus no YouTube un 2000+ citām vietnēm, ko atbalsta [yt-dlp](https://github.com/yt-dlp/yt-dlp). Darbojas operētājsistēmās Windows 10/11, macOS 13+ (Intel + Apple Silicon) un Linux (AppImage, Flatpak, tar.gz). Licence GPLv3. Bez reklāmām, bez lietojuma ierobežojumiem. Izplatīta caur [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage un tiešo lejupielādi.
>
> **Galvenā atšķirība: iebūvēts pārlūks.** Lielākā daļa bezmaksas YouTube lejupielādētāju ir plāni yt-dlp apvalki: URL lodziņš un formātu izvēlne bez paša pārlūka. Arroxy tāds ir – **cilne Izpēte**. Jūs pārlūkojat YouTube vai jebkuru citu vietni lietotnē un lejupielādējat videoklipu, atskaņošanas sarakstu vai kanālu, kurā atrodaties, vai noklikšķiniet ar peles labo pogu uz jebkuras saites. Ja vienreiz pierakstāties sadaļā Izpēte, lejupielādes, kurām nepieciešams konts, izmanto šo pierakstīšanos: jūsu privātos videoklipus, jūsu sarakstus Skatīties vēlāk un Patīk un citus videoklipus, ko jūsu konts jau var skatīties, bez sīkfailu eksportēšanas. Tur varat pierakstīties arī citās vietnēs, un to lejupielādes vajadzības gadījumā izmanto šo pierakstīšanos. Sīkāka informācija: [Kāpēc Arroxy](#why-explore).
>
> _Pēdējo reizi atjaunināts: 2026-10-23._

> 🌐 Šis tulkojums tapis ar mākslīgā intelekta atbalstu. [Angļu valodas README](../../README.md) ir primārais avots. Atradāt kļūdu? [Atveriet PR](../../../../pulls).

---

## Saturs

- [✨ Iespējas](#features)
- [📥 Instalēšana un pirmā palaišana](#install)
  - [Windows pirmā palaišana](#windows-first-launch)
  - [macOS pirmā palaišana](#macos-first-launch)
  - [Kāpēc var parādīties brīdinājums](#why-warning)
  - [Linux pirmā palaišana](#linux-first-launch)
  - [Pārbaudiet lejupielādi (SHA256)](#verify)
- [⚖️ Kāpēc Arroxy](#why)
- [🔒 Privātums](#privacy)
- [❓ BUJ](#faq)
- [🗺️ Attīstības plāns](#roadmap)
- [💖 Atbalstiet Arroxy](#support)
- [🛠️ Izveidots ar](#tech)
- [📜 Lietošanas noteikumi](#terms)

---

## <a id="features"></a>✨ Iespējas

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lv/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Izpēte</b><br/>Pārlūkojiet YouTube vai jebkuru citu vietni Arroxy iekšienē un lejupielādējiet lapu, kurā atrodaties, ar savu aktīvo profilu</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Izpētes pirmais ekrāns</b><br/>Īss ieskats sadaļā Izpēte un kāpēc papildu konts ir drošāka pierakstīšanās</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Lejupielādes parāda, kam vajadzīga jūsu uzmanība</b><br/>Saites tiek sagatavotas fonā; neizdevusies piedāvā savu risinājumu, garš atskaņošanas saraksts gaida jūsu izvēli</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lv/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Lejupielādējiet tikai video daļu</b><br/>Izvēlieties sākumu un beigas vai nodaļu — Arroxy saglabā tikai šo diapazonu</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lv/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR ar 60 kadriem sekundē</b><br/>Katra izšķirtspēja, kodeks un HDR straume, ko video piedāvā, blakus</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lv/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profilu redaktors</b><br/>Pielāgojiet profilu: faila tipu, izšķirtspēju, subtitrus, galamērķi, faila nosaukuma veidni un citu</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lv/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Tumšs vai gaišs, stikls vai vienlaidu</b><br/>Četri izskati izvēlei: stikla paneļi virs kustīgām debesīm vai mierīgas vienlaidu virsmas, katrs tumšā un gaišā variantā</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Arroxy globālais lejupielādes īsinājumtaustiņš — Ctrl+Shift+D sistēmās Windows un Linux, Cmd+Shift+D sistēmā macOS, nosūta nokopēto saiti tieši lejupielāžu rindā" width="760" /></picture><br/><sub><b>Globālais lejupielādes īsinājumtaustiņš</b><br/>Nokopējiet saiti jebkur, nospiediet vienreiz — tā nonāk rindā un sāk lejupielādēties</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lv/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Atskaņošanas saraksta profili katram vienumam</b><br/>Piešķiriet katram video savu profilu — daļu arhivējiet 4K, pārējo saglabājiet tikai kā audio</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Ātrās lejupielādes sākums</b><br/>Ielīmējiet URL un nekavējoties lejupielādējiet ar savu aktīvo profilu</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Atkārtoti izmantojami lejupielādes profili</b><br/>Saglabājiet formāta, kvalitātes un izvades sagataves — izmantojiet atkārtoti katrai lejupielādei</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Daudzvalodu audio celiņi</b><br/>Izvēlieties precīzu audio valodu, ar kādu video tiek piegādāts</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Telpiskais / Dolby audio</b><br/>5.1 un Dolby celiņi tiek atpazīti un saglabāti</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Vairāku URL režīms</b><br/>Ielīmējiet sarakstu, automātiski noņemiet dublikātus, pievienojiet rindai visu uzreiz</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lv/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Paralēla lejupielāžu rinda</b><br/>Vairākas lejupielādes vienlaikus ar tiešraides progresu</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Izpēte: pārlūkojiet tīmekli Arroxy iekšienē</strong></summary>

- **Cilne Izpēte** — pārlūkojiet YouTube vai jebkuru citu vietni Arroxy iekšienē un lejupielādējiet atrasto, nekopējot saites. **Lejupielādēt · *jūsu profils*** pievieno rindai video, atskaņošanas sarakstu vai kanālu, ko skatāties; bulta blakus pārslēdz profilus, bet burvju nūjiņa atver soli pa solim lejupielādi formātu, subtitru un citu opciju izvēlei
- **Lejupielāde ar peles labo pogu** — ar peles labo pogu noklikšķiniet uz jebkuras video, atskaņošanas saraksta vai kanāla saites sadaļā Izpēte, lai to lejupielādētu ar savu profilu, izvēlētos citu profilu sadaļā **Lejupielādēt ar**, atvērtu soli pa solim lejupielādi vai nokopētu saiti. Nav jāatver katrs video atsevišķi
- **Kompakts izkārtojums** — viens klikšķis sadaļas Izpēte rīkjoslā pārvieto Arroxy cilnes tajā un dod lapai vairāk vietas
- **Adreses josla** — rakstiet, lai meklētu YouTube, vai ievadiet jebkuru tīmekļa adresi, lai atvērtu šo vietni
- **Lejupielādes, kurām nepieciešams konts** — pierakstieties vienreiz sadaļā Izpēte, un Arroxy varēs lejupielādēt videoklipus, ko jūsu konts var skatīties: jūsu privātos videoklipus, vecuma ierobežotus videoklipus, ja konts ir ar apstiprinātu vecumu, kā arī jūsu sarakstus Skatīties vēlāk un Patīk. Tur varat pierakstīties arī citās vietnēs, un to lejupielādēs šī pierakstīšanās tiks izmantota, kad tā būs nepieciešama. Arroxy vispirms joprojām lejupielādē bez pierakstīšanās un izmanto jūsu pierakstīšanos sadaļā Izpēte tikai tad, ja lejupielāde neizdodas tādā veidā, ko konts var novērst
- **Izmantojiet papildu kontu** — sadaļas Izpēte pirmais ekrāns paskaidro, kāpēc: lejupielāde ar kontu rada zināmu risku, ka šis konts tiks ierobežots. Izrakstieties no sadaļas Izpēte iestatījumos, kad vien vēlaties aizmirst savas pierakstīšanās
- **Reklāmu bloķētājs** — pēc noklusējuma izslēgts. Viens klikšķis uz vairoga sadaļas Izpēte rīkjoslā bloķē reklāmas un izsekotājus tās lapās, neietekmējot lejupielādes. YouTube var pretoties reklāmu bloķētājiem pierakstītiem kontiem

</details>

<details>
<summary><strong>🎞️ Kvalitāte un formāti</strong></summary>

- Līdz **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Augsts kadru ātrums un HDR** saglabāti nemainīti — 60 kadri/s, HDR10
- **Audio** — eksportējiet tikai audio kā MP3, M4A/AAC, Opus vai WAV. Interaktīvajās lejupielādēs izvēlieties avota oriģinālos telpiskā/Dolby skaņas celiņus (AC-3, E-AC-3, 5.1, DRC), kad tie ir pieejami, vai iestatiet globālu noklusējumu **Dot priekšroku telpiskajam / Dolby**
- **Profili ar mērķi** — *Labākais attēls* (AV1 · VP9) vai *Smart TV* (MP4 · H.264), saglabāti kā Automātiski, MP4, MKV vai WebM bez pārkodēšanas. HDR ir *Automātiski* (tikai tad, ja jūsu ekrāns to var attēlot), *SDR* vai *HDR*
- **Katrs kodeks katrā izšķirtspējā** — soli pa solim lejupielāde uzskaita AV1, VP9 un H.264 blakus katrā izšķirtspējā, lai varētu izvēlēties to, ko atskaņo jūsu televizors vai redaktors
- **Zini, kas straume patiesībā ir** — izmēri, ko YouTube uzlabojis ar MI, ar MI dublētas audio valodas, straumes ar uzlabotu bitrati, 360° video un bojātas vai ar ūdenszīmi marķētas kopijas ir atzīmētas. Profili izlaiž ar MI uzlabotas straumes, ja vien tās neatļaujat

</details>

<details>
<summary><strong>🛡️ Privātums un kontrole</strong></summary>

- 100% lokāla apstrāde — lejupielādes iet tieši no YouTube uz jūsu disku
- **Atvērtais kods** — katra rindiņa pārbaudāma, licencēts ar GPLv3
- Faili tiek saglabāti tieši jūsu izvēlētajā mapē

</details>

<details>
<summary><strong>⚡ Darbplūsma</strong></summary>

- **Globālais lejupielādes īsinājumtaustiņš** — nokopējiet saiti jebkurā lietotnē un nospiediet `Ctrl+Shift+D` (`Cmd+Shift+D` sistēmā macOS); Arroxy pievieno to rindai ar jūsu aktīvo profilu, neatverot logu, un paziņojums to apstiprina. Pēc noklusējuma ieslēgts, pārpiešķirams
- **Elastīgi sākšanas režīmi** — izvēlieties vadītu atsevišķu lejupielādi, atskaņošanas saraksta/kanāla izvēli, vairāku URL ielīmēšanu, ātro lejupielādi ar saglabātiem noklusējumiem vai pārlūkojiet un lejupielādējiet sadaļā Izpēte
- **Centrāla lejupielāžu rinda** — katrs atsevišķs, atskaņošanas saraksta, vairāku URL vai ātrais uzdevums nonāk vienuviet progresa, pauzes, atsākšanas, atcelšanas, atkārtošanas un prioritātes kontrolei
- **Starpliktuves vērošana** — nokopējiet video saiti, un tā aizpilda URL lauku, kad atgriežaties Arroxy, ar **Atsaukt**, ja to nevēlējāties. Kamēr Arroxy ir aizņemts, saite gaida, līdz atgriežaties URL cilnē (izslēdzams iestatījumos)
- **Automātiska URL tīrīšana** — noņem izsekošanas parametrus (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) un atver `youtube.com/redirect` saites
- **Teknes režīms** — loga aizvēršana ļauj lejupielādēm turpināties fonā
- **Valodu skaits: 50** — automātiski nosaka sistēmas valodu, pārslēdzams jebkurā laikā
- **Atskaņošanas saraksta sinhronizēšana** — atkārtoti pārbaudiet atskaņošanas sarakstu pret lokālu mapi, lai izlaistu jau lejupielādētos video; izveido `.m3u` atskaņošanas saraksta failu, kas tiek atjaunināts, katram video lejupielādējoties
- **Ātruma un tempa vadība** — ierobežojiet lejupielādes joslas platumu, iestatiet, cik video daļu lejupielādējas vienlaikus, un pievienojiet pieprasījumu aizkaves ar sagatavēm (*Izslēgts · Līdzsvarots · Piesardzīgs · Pielāgots*)
- **Failu nosaukumu veidnes** — nosauciet lejupielādes pēc savas izvēles ar `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` un `{playlist_index}`, globāli vai katram lejupielādes profilam
- **Vienlaicīgas lejupielādes un automātiska atkārtošana** — izvēlieties, cik rindā esošo lejupielāžu darbojas vienlaikus, un ļaujiet Arroxy atkārtot lejupielādi, kas saskārās ar tīkla vai servera problēmu, katru reizi gaidot ilgāk
- **Atskaņošanas saraksta profili katram vienumam** — piešķiriet katram atskaņošanas saraksta video savu lejupielādes profilu, nevis vienu iestatījumu visam sarakstam, lai vienā piegājienā daļu arhivētu pilnā kvalitātē, bet pārējo saglabātu tikai kā audio
- **Ātrā lejupielāde darbojas fonā** — saite uzreiz parādās sadaļā Lejupielādes un tiek sagatavota tur, paziņojums ar **Skatīt** to apstiprina, un URL lauks tiek notīrīts nākamajai saitei. Sāciet cik vēlaties, kamēr iepriekšējās tiek sagatavotas
- **Lejupielādes parāda, kam vajadzīga jūsu uzmanība** — ja Arroxy nevar nolasīt saiti, tās rinda norāda iemeslu un piedāvā risinājumu: Mēģināt vēlreiz, ieslēgt sīkfailus vai pierakstīties sadaļā Izpēte. Ja sīkfaili ir izslēgti, **Pierakstīties sadaļā Izpēte** mēģina vēlreiz jūsu vietā, tiklīdz esat pierakstījies. Atskaņošanas saraksts, kas garāks par jūsu ielādes limitu, gaida savā rindā, lai izvēlētos visu, pirmos vai pārskatu. Cilne Lejupielādes saskaita rindas, kas gaida jūs
- **Lejupielādējiet tikai video daļu** — ekrānā Formāts izvēlieties sākumu un beigas vai nodaļu, un Arroxy saglabā tikai šo diapazonu, nosaucot to ar diapazonu pēc video id. Griezumi nonāk uz tuvāko atslēgkadru; ieslēdziet precīzu griezumu, lai tā vietā pārkodētu
- **Noņemt pabeigtās lejupielādes** — pēc izvēles: pabeigta lejupielāde pazūd no saraksta pēc 5 sekundēm. Tās faili paliek diskā, un neizdevušās lejupielādes paliek sarakstā
- **Izmērs un Trūkst sadaļā Lejupielādes** — kārtojama kolonna **Izmērs** parāda, cik vietas aizņem katra lejupielāde, un **Trūkst** atzīmē failus, kas pārvietoti vai dzēsti ārpus Arroxy
- **Aurora vai Minimal, tumšs vai gaišs** — stikla paneļi virs kustīgām debesīm vai mierīgas vienlaidu virsmas; pārslēdzieties kājenē. Datori bez grafikas paātrinājuma automātiski saņem Minimal
- **Mac izvēlņu josla** — sistēmā macOS atveriet iestatījumus (`Cmd+,`), iestatiet lejupielādes ātruma ierobežojumu, pārslēdziet stilu un motīvu un atveriet žurnālus vai saglabājiet diagnostikas failu no izvēlņu joslas
- **Mainiet profilu no jebkuras lejupielādes** — pielāgojiet lejupielādi, pēc tam atjauniniet profilu, no kura tā sākās (ar izmaiņu priekšskatījumu), vai saglabājiet iestatījumus kā jaunu profilu. Pārslēdzot profilu, tiek jautāts, vai paturēt jūsu labojumus

</details>

<details>
<summary><strong>📝 Subtitri un pēcapstrāde</strong></summary>

- **Subtitri** formātā SRT, VTT vai ASS — manuāli vai automātiski ģenerēti, jebkurā pieejamā valodā
- Saglabājiet līdzās video, iegulstiet `.mkv` failā vai sakārtojiet apakšmapē `Subtitles/`
- **Tikai subtitru pakotnes** — ielīmējiet URL sarakstu vai atveriet atskaņošanas sarakstu, izvēlieties Subtitri un saņemiet tikai parakstu failus katram video
- **SponsorBlock** — izlaidiet vai atzīmējiet kā nodaļas sponsorus, ievadus, nobeigumus, pašreklāmu
- **Iegulti metadati** — nosaukums, augšupielādes datums, kanāls, apraksts, sīktēls un nodaļu atzīmes tiek ierakstītas failā

</details>

<details>
<summary><strong>🌐 YouTube + 2000 vietņu</strong></summary>

- **YouTube pilnībā** — Video, Shorts, kanāli, atskaņošanas saraksti, YouTube Music un podkāsti tiek apstrādāti kā pilnvērtīgi avoti
- **2000+ citu vietņu**, izmantojot yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable un daudzas citas
- **Tikai audio un subtitri** darbojas visās atbalstītajās vietnēs, ne tikai YouTube
- Ja vietne mainās, yt-dlp izlaiž labojumus katru nedēļu, un Arroxy startēšanas brīdī automātiski atjaunina bināro failu

</details>

---

## <a id="install"></a>📥 Instalēšana un pirmā palaišana

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

Būvējumi ir tikai x86_64. Nav `curl`? Nomainiet `curl -fsSL` ar `wget -qO-`.

| Platforma | Tiešā lejupielāde |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Visi laidiena resursi →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows pirmā palaišana</strong></summary>

Pirmajā palaišanas reizē var parādīties **„Windows aizsargāja jūsu datoru”** (Windows protected your PC) vai **„Nezināms izdevējs”** (Unknown publisher). Tas attiecas gan uz `Arroxy-win-x64-Setup.exe`, gan uz `Arroxy-win-x64-Portable.exe`. Arroxy ir bezmaksas un atvērtā koda, un Windows būvējumi nav parakstīti ar maksas sertifikātu, tāpēc SmartScreen tos atzīmē. Tas **nenozīmē** automātiski, ka Arroxy ir nedrošs. Lai turpinātu:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen dialoglodziņš „Windows aizsargāja jūsu datoru” ar izcelto saiti „Papildinformācija”" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialoglodziņš pēc papildinformācijas izvēršanas, kurā redzama poga „Tik un tā palaist”" />
</div>

1. Noklikšķiniet uz **Papildinformācija** (More info).
2. Noklikšķiniet uz **Tik un tā palaist** (Run anyway).

#### Ja Windows Defender atzīmē vai noņem failu

Defender heiristika dažkārt atzīmē neparakstītus NSIS instalētājus un Electron portatīvās versijas kā aizdomīgas. Ja Defender ievieto karantīnā `Arroxy-win-x64-Setup.exe` vai `Arroxy-win-x64-Portable.exe`, atjaunojiet to no **Windows drošība → Aizsardzība pret vīrusiem un draudiem → Aizsardzības vēsture**, pēc tam pievienojiet Arroxy izpildāmo failu kā atļauto vienumu sadaļā **Pārvaldīt iestatījumus → Pievienot vai noņemt izņēmumus**. Tāpat kā ar SmartScreen, iemesls ir trūkstošais izdevēja paraksts, nevis atklāta ļaunprogrammatūra.

> Lejupielādējiet Arroxy tikai no oficiālās GitHub Releases lapas. Ja failu ieguvāt no citas vietnes vai kāds jums to atsūtīja, izdzēsiet to un lejupielādējiet jaunu kopiju no oficiālā avota. Pirmkods ir publisks, tāpēc varat to pārbaudīt vai pats uzbūvēt Arroxy, ja vēlaties.

Dodat priekšroku Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS pirmā palaišana</strong></summary>

Arroxy macOS būvējumi ir parakstīti ad-hoc, bet Apple nav apstiprinājis (notarized), tāpēc Gatekeeper bloķē pirmo palaišanu ar ziņojumu *„Arroxy.app” nav atvērts — Apple nevarēja pārbaudīt, vai „Arroxy.app” nesatur ļaunprogrammatūru*. Tas nozīmē, ka macOS nevar pārbaudīt lietotni ar Apple, nevis ka ar failiem kaut kas nav kārtībā. Instalēšana ar Homebrew šo dialogu pilnībā novērš. Ja izmantojāt DMG, to novērš viena Termināļa komanda:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Velciet `Arroxy.app` no pievienotā DMG uz `/Applications`.
2. Atveriet Termināli un izpildiet šīs divas komandas:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Pirmā komanda noņem karantīnas atribūtu, ko macOS pievienoja, kad fails tika lejupielādēts; otrā palaiž lietotni. Parasti `sudo` nav vajadzīgs, jo kopija mapē `/Applications` pieder jums — pievienojiet to tikai tad, ja saņemat atļauju kļūdu.

**Apple Silicon vai Intel:** M sērijas Mac datorā (M1 / M2 / M3 / M4) lejupielādējiet `arm64` DMG. Intel Mac datoros lejupielādējiet `x64` DMG. Nepareiza būvējuma palaišana joprojām darbojas ar Rosetta, bet ir manāmi lēnāka.

> macOS būvējumi tiek veidoti CI uz Apple Silicon un Intel izpildītājiem. Ja radīsies problēmas, lūdzu, [atveriet problēmu](../../../../issues) — macOS lietotāju atsauksmes aktīvi veido macOS testēšanas ciklu.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Kāpēc var parādīties brīdinājums</strong></summary>

Arroxy ir atvērtā koda un licencēts ar GPLv3. Windows un macOS būvējumi **nav koda parakstīti** — Apple Developer ID un Windows EV koda parakstīšanas sertifikāti katrs maksā simtiem dolāru gadā, ko neatkarīgs projekts maksā no savas kabatas. Bez šiem parakstiem Windows SmartScreen un macOS Gatekeeper pirmajā palaišanas reizē jūs brīdinās. Brīdinājumi nozīmē, ka *jūsu OS neatpazīst izdevēju* — tie nenozīmē, ka Arroxy ir ļaunprātīga programma.

Trīs veidi, kā pats pārbaudīt Arroxy, augošā stingrības secībā:

- **Izlasiet pirmkodu.** Katra rindiņa ir [GitHub](https://github.com/antonio-orionus/Arroxy), un varat to [uzbūvēt no pirmkoda](#tech).
- **Pārbaudiet SHA256.** Salīdziniet savu failu ar publicēto [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — skatiet [Pārbaudiet lejupielādi](#verify) zemāk.
- **Palaidiet trešās puses skenēšanu.** Augšupielādējiet failu [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux pirmā palaišana</strong></summary>

AppImage darbojas tieši — bez instalēšanas. Jums tikai jāatzīmē fails kā izpildāms.

**Failu pārvaldnieks:** ar peles labo pogu noklikšķiniet uz `.AppImage` → **Rekvizīti** → **Atļaujas** → ieslēdziet **Atļaut izpildīt failu kā programmu**, pēc tam veiciet dubultklikšķi.

**Terminālis:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Ja palaišana joprojām neizdodas, palaidiet bez montēšanas — FUSE pakotne nav nepieciešama:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Neobligāta darbvirsmas integrācija:** vienreiz instalējiet [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), un jebkurš AppImage, uz kura veiksiet dubultklikšķi, tiks automātiski reģistrēts jūsu palaidēja izvēlnē — nav nepieciešams manuāls `.desktop` fails.

**Vienkāršs tarball (bez FUSE, bez instalēšanas):**

`.tar.gz` būvējums ir tā pati lietotne bez AppImage apvalka — izvelciet to jebkur un palaidiet. Nav nepieciešams ne instalētājs, ne FUSE pakotne.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Linux lejupielādes laidiena lapā ir tikai x86_64.** ARM64 iekārtās (Raspberry Pi, Asahi Linux) Flatpak joprojām instalējas, bet palaišanas brīdī neizdodas ar `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Pārbaudiet lejupielādi (SHA256)</strong></summary>

Katrs laidiens kopā ar bināro failiem publicē `SHA256SUMS` failu. Lai pārbaudītu, vai jūsu lejupielāde nav bojāta vai pārtvērumā mainīta, lokāli aprēķiniet sava faila jaucējkodu un salīdziniet ar rindu failā `SHA256SUMS`. Atveriet jaunākā laidiena lapu → **Assets** → lejupielādējiet `SHA256SUMS`.

**Windows (PowerShell vai komandu uzvedne):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminālis):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminālis):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Vēlaties trešās puses ļaunprogrammatūras skenēšanu? Augšupielādējiet failu [VirusTotal](https://www.virustotal.com). Dažas vispārīgas heiristikas atzīmes no mazākiem dzinējiem ir normāla parādība neparakstītām Electron lietotnēm; plaši izplatīta atklāšana no lielajiem dzinējiem būtu reāls iemesls bažām.

</details>

<details>
<summary><strong>📦 Windows: instalētājs vai portatīvā versija</strong></summary>

|               | NSIS instalētājs | Portatīvs `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Nepieciešama instalēšana | Jā  | Nē — palaidiet no jebkuras vietas  |
| Automātiski atjauninājumi | ✅ lietotnē  | ❌ manuāla lejupielāde  |
| Startēšanas ātrums | ✅ ātrāk  | ⚠️ lēnāka aukstā palaišana  |
| Pievieno izvēlnei Sākt |            ✅            |           ❌            |
| Viegla atinstalēšana |            ✅            | ❌ izdzēsiet failu  |

**Ieteikums:** izmantojiet NSIS instalētāju automātiskajiem atjauninājumiem un ātrākai startēšanai. Portatīvo `.exe` izmantojiet variantam bez instalēšanas un bez reģistra ierakstiem.

</details>

---

## <a id="why"></a>⚖️ Kāpēc Arroxy

Salīdzinājums ar visbiežāk sastopamajām alternatīvām:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Iebūvēts pārlūks (pārlūkošana, pierakstīšanās, lejupielāde) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Videoklipi, ko jūsu pašu konts var skatīties, bez sīkfailu eksportēšanas |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Bezmaksas, bez maksas līmeņa |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Atvērtais kods |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Tikai lokāla apstrāde |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Bez lietošanas ierobežojumiem |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Starpplatformu darbvirsmas lietotne |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitri + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = daļēji vai tikai maksas līmenī. 4K Video Downloader pierakstīšanās lietotnē privātiem videoklipiem ir maksas funkcija; lielākā daļa bezmaksas yt-dlp grafisko saskarņu pieņem tikai sīkfailu failu vai nolasa jūsu tīmekļa pārlūka sīkfailus.

Arroxy ir veidots vienam mērķim: tīram lokālam failam neatkarīgi no tā, vai ielīmējat URL vai atrodat video sadaļā Izpēte. Bez uzmācīgas pārdošanas, bez datu vākšanas.

### <a id="why-explore"></a>🧭 Ko vienkāršs yt-dlp apvalks nespēj: cilne Izpēte

Lielākā daļa bezmaksas YouTube lejupielādētāju ir URL lodziņš virs yt-dlp. Arroxy arī izmanto yt-dlp, bet tam ir arī **Izpēte** — lietotnē iebūvēts pārlūks, kas atver YouTube vai jebkuru citu vietni. Izpēte piedāvā to, ko URL lodziņš nespēj:

- **Videoklipi, ko jūsu konts var skatīties, bez sīkfailu eksportēšanas** — jūsu privātie videoklipi, jūsu saraksti Skatīties vēlāk un Patīk, vecuma ierobežoti videoklipi kontā ar apstiprinātu vecumu un lapas citās vietnēs, kurām nepieciešama jūsu pierakstīšanās. Vienkāršam apvalkam nepieciešams cookies.txt eksports, vai tas nolasa jūsu tīmekļa pārlūka sīkfailus. Programmā Arroxy pierakstāties vienreiz sadaļā Izpēte, un viss pārējais notiek automātiski
- **Nav jākopē saites** — atrodiet video, atskaņošanas sarakstu vai kanālu sadaļā Izpēte un lejupielādējiet ar vienu klikšķi vai ar peles labo pogu noklikšķiniet uz jebkuras saites lapā
- **Reklāmu bloķētājs, kad vēlaties** — viens klikšķis uz vairoga bloķē reklāmas un izsekotājus sadaļas Izpēte lapās

---

## <a id="privacy"></a>🔒 Privātums

Lejupielādes tiek iegūtas tieši ar [yt-dlp](https://github.com/yt-dlp/yt-dlp) no YouTube uz jūsu izvēlēto mapi — nekas netiek novirzīts caur trešās puses serveri. Skatīšanās vēsture, lejupielādes vēsture, URL un failu saturs paliek jūsu ierīcē.

**No tracking.** Arroxy sends only anonymous reports that help us count users and fix problems — never your links, videos, files or accounts. You control them in Settings.

Explore keeps its own sign-ins, separate from your browser, and you always sign in on the site's own page. A download uses a sign-in only for that site, reads it fresh and deletes its copy afterwards. Signing out of Explore in Settings forgets them.

---

## <a id="faq"></a>❓ BUJ

<details>
<summary><strong>Vai tas tiešām ir bezmaksas?</strong></summary>

Jā — licencēts ar GPLv3, bez maksas līmeņa, bez funkciju ierobežošanas.

</details>

<details>
<summary><strong>Ar ko Arroxy atšķiras no citām yt-dlp grafiskajām saskarnēm?</strong></summary>

Lielākā daļa bezmaksas yt-dlp grafisko saskarņu ir apvalki, kas pieņem tikai saiti. Arroxy pievieno **Izpēti** — lietotnē iebūvētu pārlūku, kas atver YouTube vai jebkuru citu vietni: jūs pārlūkojat un lejupielādējat, nekopējot saites, un pierakstāties tur vienreiz, lai lejupielādētu videoklipus, ko jūsu konts var skatīties, piemēram, savus privātos videoklipus un sarakstus Skatīties vēlāk un Patīk, bez sīkfailu eksportēšanas. Skatiet [Kāpēc Arroxy](#why).

</details>

<details>
<summary><strong>Kādas video kvalitātes varu lejupielādēt?</strong></summary>

Jebko, ko piedāvā YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, kā arī tikai audio. 60 kadru/s un HDR straumes tiek saglabātas nemainītas, un soli pa solim lejupielāde ļauj katrā izšķirtspējā izvēlēties AV1, VP9 vai H.264.

</details>

<details>
<summary><strong>Vai varu izvilkt tikai audio kā MP3?</strong></summary>

Jā. Formātu izvēlnē izvēlieties *tikai audio* un izvēlieties MP3, M4A/AAC, Opus vai WAV.

</details>

<details>
<summary><strong>Kā lejupielādēt videoklipus, kuriem nepieciešams YouTube konts?</strong></summary>

Pierakstieties vienreiz cilnē Izpēte. Pēc tam Arroxy var lejupielādēt videoklipus, ko jūsu konts var skatīties: jūsu privātos videoklipus, vecuma ierobežotus videoklipus, ja konts ir ar apstiprinātu vecumu, kā arī jūsu sarakstus Skatīties vēlāk un Patīk. Tas izmanto pierakstīšanos tikai tad, ja lejupielāde neizdodas tādā veidā, ko konts var novērst; viss pārējais tiek lejupielādēts kā iepriekš. Šī ir izvēle **Pierakstīšanās sadaļā Izpēte**, kas sīkfailu iestatījumos ir uzskaitīta pirmā un atzīmēta kā Ieteicams, un Arroxy to izvēlas jūsu vietā, kad pirmo reizi atverat Izpēti. yt-dlp wiki norāda, ka [automatizācija ar pierakstīšanos var radīt Google konta atzīmēšanu](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), tāpēc papildu konts ir drošāka izvēle.

</details>

<details>
<summary><strong>Vai tas turpinās darboties, kad YouTube kaut ko maina?</strong></summary>

yt-dlp tiek automātiski atjaunināts startēšanas brīdī, un Arroxy ātri izlaiž labojumus, kad YouTube kaut ko maina. Kad lejupielādei nepieciešama pierakstīšanās, Arroxy izmanto jūsu pierakstīšanos sadaļā Izpēte, ja tur esat pierakstījies, un sīkfaili no faila vai jūsu pārlūka ir pieejami sīkfailu iestatījumos.

</details>

<details>
<summary><strong>Kādās valodās Arroxy ir pieejams?</strong></summary>

Gatavas lietošanai valodas (50): Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy pirmajā palaišanas reizē automātiski nosaka jūsu operētājsistēmas valodu, un jebkurā laikā varat pārslēgties ar valodas izvēlni rīkjoslā. Izpildlaika locale JSON atrodas src/shared/i18n/locales/, bet tulkotājiem paredzētie PO katalogi — i18n/locales/ — atveriet PR vietnē GitHub, lai palīdzētu.

</details>

<details>
<summary><strong>Vai man jāinstalē kaut kas cits?</strong></summary>

Nē. yt-dlp, ffmpeg un ffprobe tiek automātiski lejupielādēti pirmajā palaišanas reizē un kešoti jūsu ierīcē. Pēc tam papildu iestatīšana nav nepieciešama.

</details>

<details>
<summary><strong>Vai varu lejupielādēt atskaņošanas sarakstus vai veselus kanālus?</strong></summary>

Jā — abus. Ielīmējiet atskaņošanas saraksta URL vai kanāla URL (piem., `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); izvēlieties, cik ierakstu pārbaudīt, tad pievienojiet rindai visu sarakstu vai izvēlieties konkrētus video. Datumu diapazona filtri drīzumā.

</details>

<details>
<summary><strong>macOS saka „lietotne ir bojāta” — ko darīt?</strong></summary>

Tas ir macOS Gatekeeper, kas bloķē neparakstītu lietotni, nevis faktisks bojājums. Skatiet [macOS pirmā palaišana](#macos-first-launch) Termināļa komandām, kas noņem karantīnu un palaiž Arroxy.

</details>

<details>
<summary><strong>Vai YouTube video lejupielāde ir legāla?</strong></summary>

Tas ir atkarīgs no jūsu valsts un no tā, ko lejupielādējat. Lejupielādējiet tikai saturu, kas pieder jums, saturu, kuram ir licence lejupielādei, vai saturu, ko jūsu valsts likums ļauj kopēt. Jūs esat atbildīgs par YouTube [pakalpojumu sniegšanas noteikumu](https://www.youtube.com/t/terms) un jūsu vietējo autortiesību likumu ievērošanu. Skatiet [Lietošanas noteikumi](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ Attīstības plāns

Joprojām plānots — aptuveni prioritārā secībā:

| Iespēja    | Apraksts    |
| ---------------- | ---------------- |
| **Atskaņošanas sarakstu un kanālu filtri** | Datumu diapazona filtri, uzskaitot atskaņošanas sarakstu vai kanālu |
| **YouTube audio celiņu preferences** | Iestatiet visas lietotnes runas valodas celiņa preferenci ar profila pārrakstīšanu, kad YouTube piedāvā vairākus audio celiņus |
| **Spēcīgāka atkārtošanas atkopšana** | Jauns atkārtošanas ceļš lejupielādēm, ko pārtrauc nestabili vai problemātiski interneta savienojumi |
| **Pilnīgs lejupielāžu pārvaldnieka panelis** | Pārvērst rindas paneli pilnīgākā pārvaldniekā, tostarp rindā esošo vienumu galamērķa mapju maiņu |
| **Ieplānotas lejupielādes** | Sākt rindu noteiktā laikā (nakts darbi) |
| **AUR pakotne** | Instalēšana sistēmās Arch Linux un Omarchy ar `yay -S arroxy-bin` |

Ir ideja par iespēju? [Atveriet pieprasījumu](../../../../issues) — kopienas ieguldījums veido prioritāti.

---

## <a id="support"></a>💖 Atbalstiet Arroxy

Arroxy ir bezmaksas un licencēts ar GPLv3 — bez reklāmām, bez izsekošanas, bez maksas līmeņa. Ja tas ietaupa jūsu laiku, varat atbalstīt izstrādi ar Bitcoin, Tron vai Ethereum: adreses ir failā [DONATE.md](../../DONATE.md), kas ir vienīgais oficiālais to avots. Arroxy nekad nesūtīs jums adresi pa e-pastu vai privātā ziņā. Repozitorija atzīmēšana ar zvaigznīti, kļūdu ziņošana un tulkojumu uzlabošana palīdz tikpat daudz.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Izveidots ar

<details>
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
| Node.js | 24.21.0 | `mise install` vai `.node-version` |
| Bun     | 1.4.2  | `mise install` vai `package.json` `packageManager` |

Ieteicams: instalējiet `mise`, pēc tam repozitorijā izpildiet `mise install`. Bez mise pirms `bun run bootstrap` manuāli aktivizējiet Node.js no `.node-version` un Bun no `package.json`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Natīvajai pārbūvei var būt nepieciešami Visual Studio Build Tools un Python.

### macOS

```bash
brew install mise
xcode-select --install
```

Pēc klonēšanas repozitorijā izpildiet `mise trust && mise install`. Ja jūsu čaula jau izmanto `fnm`, `nvm` vai Bun no Homebrew, aktivizējiet mise failā `~/.zshrc`, lai Arroxy izmantotu Node.js 24.21.0 un Bun 1.4.2:

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

# Būvēšanas un Electron izpildlaika atkarības
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tikai E2E testiem (Electron nepieciešams displejs)
sudo apt install -y xvfb
```

### Klonēt un palaist

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # ieteicams; izlaidiet, ja piesietos rīkus aktivizējāt manuāli
bun run bootstrap
bun run doctor
bun run dev            # Electron lietotne ar Vite renderētāju
```

### Izveidot izplatāmo pakotni

```bash
bun run build        # tipu pārbaude + kompilēšana
bun run dist         # pakotne pašreizējai OS
bun run dist:win     # Windows mērķi, ja palaists atbalstītā resursdatorā
```

> `bun run bootstrap` instalē atkarības, pārbūvē Electron lietotnes atkarības, pārbauda Electron, sagatavo iegulto ffmpeg/ffprobe izstrādei un instalē Playwright Chromium. Izlaiduma būvējumi pārvalda yt-dlp, ffmpeg un ffprobe darbības laikā jūsu lietotnes datu mapē; neviens no tiem netiek piegādāts instalētāja iekšpusē.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/arroxy/main.log` |
| Linux    | `~/.config/arroxy/logs/main.log` |

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
| Windows  | `%APPDATA%\arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/arroxy/argv.json` |
| Linux    | `~/.config/arroxy/argv.json`                     |

On Flatpak, both `main.log` and `argv.json` live under
`~/.var/app/io.github.antonio_orionus.Arroxy/config/arroxy/`
(for example `logs/main.log`).

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

## <a id="terms"></a>📜 Lietošanas noteikumi

Arroxy ir rīks tikai personīgai, privātai lietošanai. Jūs esat vienīgi atbildīgs par to, lai jūsu lejupielādes atbilstu YouTube [pakalpojumu sniegšanas noteikumiem](https://www.youtube.com/t/terms) un jūsu jurisdikcijas autortiesību likumiem. Neizmantojiet Arroxy, lai lejupielādētu, reproducētu vai izplatītu saturu, ko jums nav tiesību izmantot. Izstrādātāji nav atbildīgi par ļaunprātīgu izmantošanu.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Izveidots ar rūpību: <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
