<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy mascot" width="180" />

# Arroxy — Buufataa YouTube (+ Saayitii 2000) Bilisaa fi Madda Banaa, Ilaalaa Keessaa Qabu, Windows, macOS & Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Afaan:** **Afaan Oromoo** · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Baasii](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Ijaarsaa](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Marsariitii](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Hayyama](https://img.shields.io/badge/license-MIT-green) ![Platformoota](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Afaanonni](https://img.shields.io/badge/i18n-31_languages-blue)

Viidiyoo, Shorts, muuziqaa, chaanaalota, podkaastota, ykn sagalee **YouTube fi saayitiiwwan 2000+** irraa buufi — hanga 8K HDR 60 fps, MP3 / AAC / Opus, ykn kutaa barbaaddu qofa. Tabii Explore keessatti **YouTube ykn marsariitii biraa Arroxy keessatti ilaali** fi viidiyoo, playlist, ykn channel ati ilaaltu buufadhu; achitti seenuun viidiyoowwan dhuunfaa, miseensoota qofaaf, fi umuriin daangeffaman kan akkaawuntiin kee ilaaluu danda'u buufadhu. Windows, macOS, fi Linux irratti naannoo kee keessatti hojeta. **Beeksisni hin jiru, wanti dabalataa hin jiru, gurguurtaan dabalaataa hin jiru.**

[**↓ Baasii Haaraa Buusi**](#install) &nbsp;·&nbsp; [**Marsariitii**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows yeroo jalqabaa eegaluu](#windows-first-launch) · [macOS yeroo jalqabaa eegaluu](#macos-first-launch) · [Linux yeroo jalqabaa eegaluu](#linux-first-launch)

[![Hawaasa Discord itti makami](https://img.shields.io/badge/Hawaasa%20Discord%20itti%20makami-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Arroxy yeroo si oolfate, ⭐ tokko kan biroo argachuu isaaniif gargaara.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## Qabiyyee

- [✨ Amaloota](#features)
- [📥 Fe'iitii yeroo jalqabaa banuu](#install)
  - [Windows yeroo jalqabaa eegaluu](#windows-first-launch)
  - [macOS yeroo jalqabaa eegaluu](#macos-first-launch)
  - [Maaliif akeekkachiisa arguu dandeessa](#why-warning)
  - [Linux yeroo jalqabaa eegaluu](#linux-first-launch)
  - [Buufannoo kee mirkaneessi (SHA256)](#verify)
- [⚖️ Maaliif Arroxy](#why)
- [🔒 Icciitii](#privacy)
- [❓ Gaaffilee Deddeebii](#faq)
- [🗺️ Karoora](#roadmap)
- [💖 Arroxy Deggeri](#support)
- [🛠️ Waan itti Ijaare](#tech)

---

## <a id="features"></a>✨ Amaloota

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>YouTube ykn marsariitii biraa Arroxy keessatti ilaali, fuula irra jirtu piroofaayilii hojiirra jiruun buufadhu</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Fuula jalqabaa Explore</b><br/>Explore ilaalcha gabaabaa, akkasumas maaliif akkaawuntiin lammaffaan seensa nageenya qabeessa ta'e</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Buufata maal akka si barbaaduu sitti hima</b><br/>Hidhaawwan duubatti qophaa'u; kan hin milkoofne furmaata dhiyeessa, playlist dheeraan filannoo kee eega</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Kutaa viidiyoo tokko qofa buusi</b><br/>Jalqabaa fi dhumaa, yookaan boqonnaa filadhu — Arroxy kutaa sana qofa kuusa</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Gulaalaa piroofayilii</b><br/>Piroofayilii sirreessi: gosa faayilii, gulaalummaa, hiikkaa jalqabaa, bakka kuusaa, qophii maqaa faayilii fi kkf</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Dukkana moo ifa, galaasaa moo cimaa</b><br/>Mul'ata afur filachuu dandeessu: paanaalii galaasaa samii socho'u irra jiru yookaan fuula cimaa callisaa, tokkoon tokkoon isaanii dukkanaa fi ifaan</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Qabduu ariifachiisaa buufannaa waliigalaa Arroxy — Windows fi Linux irratti Ctrl+Shift+D, macOS irratti Cmd+Shift+D, hidhaa waraabame kallattiin tarree buufannaatti erga" width="760" /></picture><br/><sub><b>Qabduu ariifachiisaa buufannaa waliigalaa</b><br/>Bakka kamiyyuu hidhaa waraabi, altokko tuqi — tarree seenee buufamuu jalqaba</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profaayilii viidiyoo playlist tokkoon tokkoon</b><br/>Viidiyoo hundaaf profaayilii mataa isaa kenni — garii 4K'n kuusi, hafan MP3'n fudhu</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Fuula Buufata saffisaa</b><br/>URL maxxansiitii profaayilii kee kan socho'aadhaan battalumatti buufadhu</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Profaayiloota buufannaa irra deebi'anii fayyadaman</b><br/>Bocaa, qulqullinaa fi bahii akka durtii olkaa'i — buufannaa hundaaf irra deebi'ii fayyadami</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Sirna sagalee afaan baay'ee</b><br/>Afaan sagalee sirrii viidiyoon qabu filadhu</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Sagalee Surround / Dolby</b><br/>Sirni 5.1 fi Dolby ni adda baafamu, ni eegamu</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Haala URL baay'ee</b><br/>Tarree maxxansi, irra deebii ofumaan haqi, hunda yeroo tokkotti tarreessi</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Tarree buufannaa walqixaa</b><br/>Buufannaa hedduu yeroo tokkotti, guddina kallattiidhaan</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: Weebii Arroxy keessatti ilaali</strong></summary>

- **Tabii Explore** — YouTube ykn marsariitii biraa Arroxy keessatti ilaaluudhaan waan argatte hidhaa waraabuu malee buufadhu. **Buusi · *piroofaayilii kee*** viidiyoo, playlist, ykn channel ati ilaaltu tarree keessa galcha; xiyyi isa cinaa piroofaayilii jijjiira, ulee falfalaa immoo buufannaa tarkaanfii-tarkaanfiidhaan formaata, barruu jalaa fi kkf filachuuf bana
- **Buusuuf mirgaan cuqaasi** — Explore keessatti hidhaa viidiyoo, playlist ykn channel kamiyyuu mirgaan cuqaasiitii piroofaayilii keetiin buusi, **Profaayiliin buusi** irraa piroofaayilii biraa filadhu, buufata tarkaanfii tarkaanfiin bani, ykn hidhaa garagalchi. Tokkoon tokkoon viidiyoo dursa banuun hin barbaachisu
- **Qindaa'ina gabaabaa** — Explore keessatti baarii meeshaalee irratti tuqaa tokkoon sabbata Arroxy achitti geessee fuula sanaaf bakka dabalataa kenna
- **Bar teessoo** — YouTube barbaaduuf barreessi, ykn teessoo weebii kamiyyuu galchiitii marsariitii sana bani
- **Buufannaa akkaawuntii barbaadu** — Explore keessatti altokko seeni, Arroxyn viidiyoowwan dhuunfaa fi miseensoota qofaaf kan akkaawuntiin kee ilaaluu danda'u, viidiyoowwan umurii daangeffaman yoo umurii akkaawuntii mirkanaa'e, akkasumas tarreewwan Booda Ilaali fi Jaallatamte buufachuu danda'a. Marsariitiiwwan biraa irrattis achitti seenuu ni dandeessa, buufannaan isaanii yeroo barbaachisu seensa sana fayyadama. Arroxy ammas dura utuu hin seenin buufata; yeroo buufannaan karaa akkaawuntiin sirreessuu danda'uun hin milkoofnetti qofa seensa Explore kee fayyadama. YouTube bot akka hin taane akka mirkaneessitu yoo gaafate, Arroxy seensa Explore kee illee ni yaala
- **Akkaawuntii lammaffaa fayyadami** — fuula jalqabaa Explore sababa ibsa: akkaawuntiidhaan buufachuun balaa akkaawuntiin sun daangeffamuu tokko of keessaa qaba. Seensawwan hunda irraanfachuu yeroo barbaadde Qindoomina keessaa Explore irraa bahi
- **Dhorkaa beeksisaa** — Durtiidhaan cufaadha. Explore kaaba meeshaa irratti gaachana tokko tuquun fuula isaa irratti beeksisaa fi hordoftoota ni dhorka; buufannaan hin tuqamu. YouTube akkaawuntiiwwan seenan irratti dhorkaa beeksisaa mormuu danda'a

</details>

<details>
<summary><strong>🎞️ Qulqullina & formatoota</strong></summary>

- Hanga **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Frame rate ol'aanaa fi HDR** akka jiranitti eegamu — 60 fps, HDR10
- **Sagalee** — sagalee qofa gara MP3, M4A/AAC, Opus yookaan WAV export godhi. Buufataalee wal-qunnamtii keessatti, yoo jiran, sirna sagalee surround/Dolby maddaa (AC-3, E-AC-3, 5.1, DRC) filadhu, yookaan durtii waliigalaa **Surround / Dolby filadhu** kaa'i
- **Piroofaayilii kaayyoo qabu** — *Suuraa isa caalu* (AV1 · VP9) ykn *TV smart* (MP4 · H.264), Ofumaa, MP4, MKV, ykn WebM ta'ee deebi'ee koodii gochuu malee olkaa'ama. HDR *Ofumaa* (ispiriin kee yoo agarsiisuu dandeessu qofa), *SDR*, ykn *HDR* dha
- **Koodekii hunda ifa bal'ina hunda irratti** — buufanni tarkaanfii tarkaanfiin AV1, VP9 fi H.264 ifa bal'ina tokkoon tokkoon irratti walbira tarreessa, kanaaf isa TV ykn gulaalaan kee taphachiisu filachuu dandeessa
- **Stream tokko dhugumaan maal akka ta'e beeki** — hammoota YouTube AI'n guddise, afaanota sagalee AI'n hiikaman, streams bitrate fooyya'e qaban, viidiyoowwan 360° fi garagalchawwan miidhaman ykn mallattoo bishaanii qaban ni mallattoo'u. Piroofaayiloonni yoo ati hin heyyamne malee streams AI'n guddifaman ni darbu

</details>

<details>
<summary><strong>🛡️ Icciitii & to'annaa</strong></summary>

- 100% naannoo keessatti hojeta — buufannoon kallattiin YouTube irraa disiki kee dhaqa
- Seensuu hin jiru, kuukkii hin jiru, akkaawuntii Google waliin hin hidhu
- Faayiloonni kallattiin foldera filatteen seenu

</details>

<details>
<summary><strong>⚡ Hojii hordoffii</strong></summary>

- **Qabduu ariifachiisaa buufannaa waliigalaa** — appii kamiyyuu keessatti hidhaa waraabii `Ctrl+Shift+D` (macOS irratti `Cmd+Shift+D`) tuqi; Arroxy foddaa utuu hin banin piroofaayilii kee kan hojiirra jiruun tarree keessa galcha, beeksisnis ni mirkaneessa. Durtiidhaan banaa, irra deebi'anii qindeessuun ni danda'ama
- **Haalawwan jalqabaa jijjiiramaa** — buusuu tokko qajeelfamaan, filannoo playlist/channel, URL hedduu maxxansuu, Quick Download filannoowwan duraan kuufamaniin, ykn Explore irraa ilaaluu fi buufachuu filadhu
- **Tarree buusuu giddugaleessaa** — hojii tokko, playlist, bulk, ykn quick hundi bakka tokkotti walitti dhufa: adeemsa, dhaabuu, itti fufsiisuu, haquu, irra deebi’uu, fi dursa to’achuuf
- **Eegaa clipboard** — hidhaa viidiyoo koppii godhi, yeroo gara Arroxy deebitu bakka URL ni guuta, yoo itti hin yaadin ta'e **Deebisi** waliin. Yeroo Arroxy hojiin qabamu, hidhaan hanga ati gara tabii URL deebitutti eega (Qindaa'inoota keessatti cufi)
- **URL of-qulqulleessa** — params hordoffii (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) haqa fi linkiiwwan `youtube.com/redirect` bana
- **Haala tray** — window cufuu buufannoo duubatti itti fufsisee hojechisisa
- **Afaanota 31** — locale sirnaa ofumaan adda baasa, yeroo kamiyyuu jijjiiramuu danda’a
- **Walsimsiisa playlist** — viidiyoowwan duraan buufaman akka darbaman playlist galmee naannoo waliin irra deebi'ee sakatta'a; faayila playlist `.m3u` viidiyoon tokko tokko buufamu hunda irratti haaromsamu uuma
- **To'annoo saffisaa fi pacing** — bandwidth buusuu daangessi, kutaaleen viidiyoo meeqa yeroo tokkotti akka buufaman qindeessi, fi turtii gaaffii durtii (*Cufaa · Walsimaa · Of eeggannoo · Kan mataa*) waliin dabali
- **Bocquuwwan maqaa faayilii** — `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` fi `{playlist_index}` fayyadamuun buufamawwan kee akka feetetti moggaasi, waliigalaan ykn tokkoon tokkoon piroofaayilii buufamaatiif
- **Buufata yeroo tokkotti fi ofumaan irra deebi'uu** — buufanni tarree meeqa yeroo tokkotti akka deemu filadhu, buufata rakkoo networkii yookaan saarvarii qunname immoo Arroxy yaalii tokkoo dura dheeraa eegee irra deebi'ee haa yaalu
- **Profaayiloota buufannaa viidiyoo playlist keessaa tokkoon tokkoon** — sirna tokko guutummaa tarreef fayyadamuu mannaa, viidiyoo playlist keessa jiru hundaaf piroofaayilii buufannaa addaa kennuu dandeessa; kanaanis dabarsa tokkoon garii qulqullina guutuun kuufamee, hafan immoo akka MP3tti fudhatamuu danda'a
- **Quick Download duubatti hojjeta** — hidhaan battaluma Buufata keessatti mul'ata achittis qophaa'a, ergaan **Ilaali** qabu ni mirkaneessa, bakki URL immoo hidhaa itti aanuuf qulqullaa'a. Kanneen duraa utuu qophaa'aa jiranii kan feete baay'ee jalqabi
- **Buufata maal akka si barbaaduu sitti hima** — Arroxy hidhaa dubbisuu yoo hin dandeenye, sarara isaa sababa ibsee furmaata dhiyeessa: Irra deebi'i, kuukkii bani, ykn Explore keessatti seeni. Kuukkiin yeroo cufamu, **Explore'n seeni** erga seentee booda siif irra deebi'a. Playlist daangaa fe'uu kee caalu sarara isaa irratti eegaa jira, hunda, kan jalqabaa ykn ilaalcha akka filattu. Tabiin Buufata sarara si eegaa jiru lakkaa'a
- **Kutaa viidiyoo tokko qofa buufadhu** — much'aa Foormaatii irratti jalqaba fi xumura, ykn boqonnaa filadhu, Arroxy ardii kana qofa olkaa'a; maqaan isaas id viidiyoo booda ardii kanaan moggaafama. Muruun keyframe isa dhiyoo irratti kufa; muruu sirrii banuun immoo deebisee koodii godha
- **Buufata xumuraman ofumaan haqi** — filannoo: buufanni xumurame sekondii 5 booda tarreeffama keessaa ba'a. Faayiloonni isaa kuufama irra turu, buufanni kufe immoo tarreeffama keessa ni jiru
- **Bal'ina fi Hin jiru Buufata keessatti** — gabatee **Bal'ina** tartiibaan qindeessuun buufanni tokkoon tokkoon bakka hammam fudhatu agarsiisa, **Hin jiru** immoo faayiloota Arroxy alaa sochoo'an ykn haqaman mallattoo godha
- **Aurora ykn Salphaa, dukkana ykn ifa** — paanaala galaasaa samii socho'u irra jiru, ykn gar-fuula cimaa callisaa; gadi-fuula irraa jijjiiri. Kompiitaroonni saffisiisaa giraafiksii hin qabne ofumaan Salphaa argatu
- **Baarii menu Mac** — macOS irratti, baarii menu irraa Qindaa'inoota (`Cmd+,`) bani, daangaa saffisa buufannaa kaa'i, taatee fi tiimii jijjiiri, galmee bani ykn faayilii qorannoo olkaa'i
- **Buufata kamirraayyuu piroofaayilii jijjiiri** — buufata tokko sirreessi, achiis piroofaayilii inni irraa jalqabe haaromsi (wanta jijjiiramu dursitee ilaaluun) ykn qindaa'inoota akka piroofaayilii haaraatti olkaa'i. Piroofaayilii yeroo jijjiirtu, sirreeffamoota kee eeguu barbaadduu akka ta'e si gaafata

</details>

<details>
<summary><strong>📝 Subtitle & seensuu boodaa</strong></summary>

- **Subtitles** SRT, VTT, ykn ASS keessatti — harka ykn of-hojeetee, afaan kamiyyuu argamu keessatti
- Viidiyoo cinaa kuusi, `.mkv` keessatti maksi, ykn foldara `Subtitles/` keessatti qindeessi
- **Tuuta axxiinii qofa** — tarree URL maxxansi ykn tarree taphaa bani, Axxiinii filadhu, viidiyoo hundaafis faayiloota axxiinii qofa argadhu
- **SponsorBlock** — beeksisa, seensa, xumura, of-daldala naanna'i ykn boqonnaa godhi
- **Metadata makame** — mata-duree, guyyaa olkaa'uu, chaanaalii, ibsaa, suuraafi boqonnaa mallattoota faayila keessatti barreessa

</details>

<details>
<summary><strong>🌐 YouTube + Saayitii 2000</strong></summary>

- **YouTube guutummaatti** — Viidiyoowwan, Shorts, Chaanaalota, Playlistoota, YouTube Music fi Podkaastota madda sadarkaa jalqabaa ta'aniin hojjetamu
- **Saayitiiwwan 2000+ biroo** yt-dlp fayyadamuudhaan — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable fi kanneen biroo heddu
- **Audio qofa fi subtitle** saayitii deeggara hunda irratti hojjeta, YouTube qofa irratti miti
- Saayitiin yoo jijjiirames, yt-dlp torban hunda sirreessa erga, Arroxy immoo binary-n yeroo eegaluu ofumaan haaromsa

</details>

---

## <a id="install"></a>📥 Fe'iitii yeroo jalqabaa banuu

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

Gosti x86_64 qofa. `curl` hin qabduu? `curl -fsSL` bakka `wget -qO-` fayyadami.

| Platform | Format |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Baasii haaraa fudhachuu →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows yeroo jalqabaa eegaluu</strong></summary>

Jalqaba banuu irratti **"Windows protected your PC"** ykn **"Unknown publisher"** arguu dandeessa. Kun `Arroxy-win-x64-Setup.exe` fi `Arroxy-win-x64-Portable.exe` lameeniifuu hojjeta. Arroxy bilisaa fi madda banaa dha, ijaarsonni Windows mallattoo kafaltii hin qabne waliin hin mallatteffamne, kanaafuu SmartScreen mallattoo isaanirratti kaa'a. Kun Arroxy nageenya hin qabu **jechuuf** of-hordofaan miti. Itti fufuuf:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. **More info** cuqaasi.
2. **Run anyway** cuqaasi.

#### Windows Defender faayila mallattaa itti kaa'e ykn haqe yoo ta'e

Heuristics Defender sometimes flag unsigned NSIS installers fi Electron portables akka shakkisiisoo. Defender `Arroxy-win-x64-Setup.exe` ykn `Arroxy-win-x64-Portable.exe` karantinii keessa kaa'e yoo ta'e, **Windows Security → Virus & threat protection → Protection history** irraa deebi'i, erga Arroxy executable **Manage settings → Add or remove exclusions** jalatti wantoota hayyamamaniitti dabalii. SmartScreen wajjin akkuma, kasaara mallattoo maxxantii dhabuu irraa dhufa, malwaare argamuuurraa miti.

> Arroxy fuula GitHub Releases mirkaneessaatii qofa buufi. Faayila marsariitii biraatii argatte ykn namni tokko si erge yoo ta'e, haqii fi ganda mirkaneessaatii faayila haaraa buufi. Koodii madda ummataadhaan banaa waan ta'eef, of irraadhaa sakatta'uu ykn Arroxy of irraadhaa ijaaru dandeessa.

Scoop filattaa? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS yeroo jalqabaa eegaluu</strong></summary>

Arroxy ammallee macOS'f mallattoo hin qabdu, kanaaf Gatekeeper erga DMG irraa feete booda diyalogii sodaachisaa *"Arroxy.app is damaged and can't be opened"* agarsiisuu danda'a. Ergaan kun macOS app mallattoo hin qabne quarantine keessa kaa'e jechuu dha; faayiliiwwan app dhugumaan miidhaman jechuu miti. macOS ammaa irratti furmaanni amanamaan Terminal dha:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. `Arroxy.app` DMG ramadame irraa `/Applications` tti harkisi.
2. Terminal baniitii ajajoota lamaan kana hojjedhu:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Ajajni jalqabaa kopi Arroxy kan feete irraa amala quarantine haqa. Inni lammaffaa app banuu dha. `sudo` jecha darbii Mac kee gaafachuu danda'a; Terminal yeroo barreessitu mallattoo hin agarsiisu.

**Apple Silicon vs Intel:** Mac M-series (M1 / M2 / M3 / M4) irratti, `arm64` DMG buusi. Intel Macs irratti, `x64` DMG buusi. Ijaarsaa dogoggora oofuu Rosetta fayyadamuudhaan hojjeta garuu ifa gadi bu'aa.

> Ijaarsi macOS CI irratti Apple Silicon fi Intel runners irratti hojjetama. Rakkoo yoo qabaatte, maaloo [gaaffii bani](../../issues) — yaada fayyadamtootaa macOS irraa yeroo hedduu qabxii qormaata macOS murteessa.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Maaliif akeekkachiisa arguu dandeessa</strong></summary>

Arroxy madda banaa fi hayyama MIT qaba. Ijaarsonni Windows fi macOS **mallattoo hin qaban** — ragaaleen Apple Developer ID fi Windows EV mallattoo koodii kafaltii waggaatti dhibba doolara baay'ee waan gaafataniif, pirojektiin self-funded baasii kana mataa isaarraa kafala. Mallattoo sana malee, Windows SmartScreen fi macOS Gatekeeper yeroo jalqabaatti si akeekachisuu. Akeekkachiisni kun *siistamni kee maxxantiisa hin beeku* jechuudha — Arroxy malwaare dha jechuuf miti.

Haala sadii Arroxy ofii keetiin mirkaneessuuf, kutaa cimina irraa cimina gaditti:

- **Koodii madda dubbisi.** Sarara hundi [GitHub](https://github.com/antonio-orionus/Arroxy) irratti jira fi [madda irraa ijaaruuf](#tech) ni danda'ama.
- **SHA256 mirkaneessi.** Faayila kee [`SHA256SUMS`](../../releases/latest) maxxanfame walitti bira qabbi — armaan gadii [Buufannoo kee mirkaneessi](#verify) ilaali.
- **Sakattaa miilaafi baasii.** Faayila [VirusTotal](https://www.virustotal.com) irratti fe'i.

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux yeroo jalqabaa eegaluu</strong></summary>

AppImages kallattiin oofuu — fayyadu hin barbaachisu. Faayila akka hojjetu galchuuf qofa mallattaa itti kaa'uun barbaachisa.

**Bulchiinsa faayilaa:** `.AppImage` mirga-cuqaasi → **Properties** → **Permissions** → **Allow executing file as program** dandeessisi, erga lama-cuqaasi.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Eegaluun yoo ammallee fashale, osoo hin fe'in isa yaasi — paakejiin FUSE hin barbaachisu:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Walitti makoo desktop filannoo:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) yeroo tokkoo fayyadi, AppImage lama-cuqaaste kamiyyuu launcher menu keessatti of-dursuudhaan galmeeffama — faayila `.desktop` harkaan barbaachisu hin jiru.

**Taarboolii salphaa (FUSE hin barbaachisu, ijaarsi hin barbaachisu):**

Ijaarsi `.tar.gz` isuma appii sanaa haguuggii AppImage malee — bakka feete baasii yaasi. Ijaarsis ta'e paakejiin FUSE hin barbaachisu.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Buufannoowwan Linux fuula gadhiisaa irra jiran x86_64 qofaaf.** Maashinoota ARM64 (Raspberry Pi, Asahi Linux) irratti Flatpak ni ijaarama garuu yeroo eegalu `bwrap: execvp ldconfig: Exec format error` jedhee kufa.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Buufannoo kee mirkaneessi (SHA256)</strong></summary>

Baasii hundi faayila `SHA256SUMS` binary waliin maxxansa. Buufannoon kee darbuu ykn dabsuu hin qabne mirkaneessuuf, faayila naannoo keessatti hash godhi fi sarara `SHA256SUMS` walitti bira qabbi. Fuula baasii haaraa bani → **Assets** → `SHA256SUMS` buusi.

**Windows (PowerShell or Command Prompt):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Sakattaa malwaare miilaafi baasii barbaaddaa? Faayila [VirusTotal](https://www.virustotal.com) irratti fe'i. Mallattoo heuristic yeroo muraasaa injinii xiqqaa irraa arguu Electron apps mallattoo hin qabne bira darbaa; injinii gurguddoo irraa arguu bal'aa rakkoo dhugaa ta'a.

</details>

<details>
<summary><strong>📦 Windows: Fayyadu vs Portable</strong></summary>

|               | NSIS Fayyadu | Portable `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Fayyadu barbaachisa | Eeyyee  | Lakki — bakka kamiyyuu irraa oofii  |
| Of-haaromeessa | ✅ app keessatti  | ❌ of-harkaan buusi  |
| Saffisa eegaluu | ✅ saffisaa  | ⚠️ yeroo eegaluu jabinaafi gara jabina qabu  |
| Start Menu tti dabalama |            ✅            |           ❌            |
| Salphatti maqaa itti haquu |            ✅            | ❌ faayila haquu  |

**Gorsa:** Of-haaromeessaa fi saffisa eegaluu gaaariif NSIS fayyadu fayyadami. Fayyadu hin barbaachifne, reejistrii hin barbaachifne filannoof portable `.exe` fayyadami.

</details>

---

## <a id="why"></a>⚖️ Maaliif Arroxy

Waltajjii maayyii walitti bira qabuu filannoolee beekamoo wajjin:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Biraawzara app keessatti ijaarame (ilaali, seeni, buusi) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Viidiyoowwan dhuunfaa, miseensoota qofaaf fi umuriin daangeffaman kuukkii utuu hin baasin |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Bilisaa, sadarkaa kafaltii hin qabu |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Madda banaa |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Naannoo keessatti qofa hojeta |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Daangaa fayyadama hin qabu |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| App desktop platformoota hundaaf |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitle + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = gartokkeen, ykn sadarkaa kafaltii qofa irratti. 4K Video Downloader keessatti seensi app keessaa viidiyoowwan dhuunfaaf amala kafaltiiti; GUI yt-dlp bilisaa baay'een faayila kuukkii qofa fudhatu ykn kuukkii biraawzara weebii keetii dubbisu.

Arroxy waan tokko qofaaf ijaarame: faayila naannoo qulqulluu, URL maxxansitees ykn viidiyoo Explore keessatti argattees. Gurgurtaa dabalataa hin jiru, odeeffannoo walitti qabuu hin jiru.

### <a id="why-explore"></a>🧭 Waan wraapperiin yt-dlp salphaan hin dandeenye: tabii Explore

Buufattoota YouTube bilisaa baay'een saanduqa URL yt-dlp irratti kaa'ame qofa. Arroxy'n yt-dlp ni fayyadama, garuu **Explore** illee qaba, biraawzara app keessatti ijaarame kan YouTube ykn marsariitii biraa banu. Explore daangaa kan saanduqni URL darbuu hin dandeenye ni darba:

- **Viidiyoowwan akkaawuntii barbaadan, kuukkii utuu hin baasin** — viidiyoowwan dhuunfaa, miseensoota qofaaf, fi umuriin daangeffaman (akkaawuntii umuriin isaa mirkanaa'e irratti), akkasumas tarreewwan Booda Ilaali fi Jaallatamte kee, fi viidiyoowwan marsariitiiwwan biraa irratti seensa duubatti jiran. Wraapperiin salphaan cookies.txt baasuu barbaada ykn kuukkii biraawzara weebii keetii dubbisuu qaba, kunis amma Windows irratti Chrome'n ni dhorka. Arroxy keessatti Explore keessatti altokko seenta, kan hafe isatu hojjeta
- **"Bot akka hin taane mirkaneessuuf seeni"** — YouTube yeroo kana gaafatu, Arroxy kufuu mannaa seensa Explore keetiin buufannaa irra deebi'ee yaala
- **Tokenii buufannaa YouTube** — biraawzarri Arroxy keessatti ijaarame tokenii YouTube buufannaa dura eegu ni argata. Isa malee, YouTube formaata xiqqaa fi qulqullina waan ati gaafatte gadi aanu kennuu danda'a
- **Hidhaa garagalchuun hin barbaachisu** — Explore keessatti viidiyoo, playlist, ykn channel barbaadiitii tuqaa tokkoon buusi, ykn fuula irratti hidhaa kamiyyuu mirgaan cuqaasi
- **Yeroo barbaaddu dhorkaa beeksisaa** — gaachana tuquun fuula Explore irratti beeksisaa fi hordoftoota ni dhorka

---

## <a id="privacy"></a>🔒 Icciitii

Buufannoonni kallattiin [yt-dlp](https://github.com/yt-dlp/yt-dlp) fayyadamuudhaan YouTube irraa foldera filatteetti darbamu — miila-seerri hunduu sarara servera sadarkaa-sadaffaa tokko keessa darbuu hin qabu. Seenaa ilaaluu, seenaa buufannoo, URLs, fi qabiyyee faayilaa meeshaa kee irratti hafu.

Telemetrii hin jiru — guyyaatti mallattoo maqaa-dhabduu tokko qofa: version app, OS, afaan, karaa itti install godhame fi biyya, akka fayyadamtoota hojii irra jiran lakkoofnuuf. ID, URL, mata-duree viidiyoo, karaa faayilaa yookaan odeeffannoo account hin jiru. Settings keessatti dhaabuu dandeessa.

Explore seensawwan mataa isaa qaba, biraawzara keetii addaa, Arroxyn unka seensaa gonkumaa hin dubbisu hin guutus — ati fuula marsariitii mataa isaa irratti barreessita. Buufannaan utuu hin seenin deemu; yeroo tokko karaa akkaawuntiin sirreessuu danda'un hin milkoofnetti qofa Arroxy seensa yeroo sana haaraatti dubbisa, buufannaa sanaaf faayilii yeroo keessatti qaba, booda faayilicha haqa. Qindoomina keessatti Explore irraa bahuun isaan irraanfachiisa.

---

## <a id="faq"></a>❓ Gaaffilee Deddeebii

<details>
<summary><strong>Dhuguma bilisaa dha?</strong></summary>

Eeyyee — hayyama MIT, sadarkaa kafaltii hin jiru, amaloota dhorkamuun hin jiru.

</details>

<details>
<summary><strong>Arroxy GUI yt-dlp biroo irraa akkamitti adda ta'a?</strong></summary>

GUI yt-dlp bilisaa baay'een wraapperoota hidhaa qofa fudhatanii dha. Arroxy **Explore** dabala, biraawzara app keessatti ijaarame kan YouTube ykn marsariitii biraa banu: hidhaa utuu hin garagalchin ilaaltee buufatta, viidiyoowwan dhuunfaa, miseensoota qofaaf fi umuriin daangeffaman akkasumas tarreewwan Booda Ilaali fi Jaallatamte kee buufachuuf achitti altokko seenta, kuukkii utuu hin baasin. Arroxy seensa kana yeroo YouTube bot akka hin taane akka mirkaneessitu si gaafatu fayyadama, biraawzarri isaa inni ijaarames tokenii buufannaa YouTube ni argata, kanaaf buufannaan gara formaata xiqqaatti hin deebi'u. [Maaliif Arroxy](#why) ilaali.

</details>

<details>
<summary><strong>Qulqullina viidiyoo maal buusuu danda'a?</strong></summary>

YouTube tajaajiluu danda'u: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, sagalee qofas. 60 fps fi HDR streams akka jiranitti eegamu, buufanni tarkaanfii tarkaanfiinis ifa bal'ina tokkoon tokkoon irratti AV1, VP9 ykn H.264 akka filattu si dandeessisa.

</details>

<details>
<summary><strong>Sagalee qofaa MP3 akka ta'uun baasuu danda'aa?</strong></summary>

Eeyyee. Menu format keessaa *audio qofa* filadhu, booda MP3, M4A/AAC, Opus yookaan WAV filadhu.

</details>

<details>
<summary><strong>Viidiyoowwan akkaawuntii YouTube barbaadan akkamitti buufadha?</strong></summary>

Tabii Explore keessatti altokko seeni. Yeroo sana Arroxyn viidiyoowwan dhuunfaa fi miseensoota qofaaf kan akkaawuntiin kee ilaaluu danda'u, viidiyoowwan umurii daangeffaman yoo umurii akkaawuntii mirkanaa'e, akkasumas tarreewwan Booda Ilaali fi Jaallatamte buufachuu danda'a. Seensa sana yeroo buufannaan karaa akkaawuntiin sirreessuu danda'uun hin milkoofnetti qofa fayyadama; kan hafe hundi akka duraan buufama. Kun filannoo **Seensa Explore** dha, qindoomina kuukkii keessatti jalqabaatti tarreeffamee Kan Gorfamu jedhamee mallatteeffame, Arroxyn immoo yeroo jalqabaaf Explore banattu siif filata. Wiki yt-dlp [automatic akkaawuntii seenaan irratti hundaa'e akkaawuntii Google mallatteessisuu danda'a](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) jedha; kanaaf akkaawuntiin lammaffaan filannoo nageenya caalu dha.

</details>

<details>
<summary><strong>YouTube waan tokko jijjiirte itti fufaa hojeta?</strong></summary>

yt-dlp yeroo eegaluu irratti ofumaan haaromfama, fi Arroxy yeroo YouTube waan tokko jijjiirtu ariitiidhaan sirreessa erga. YouTube bot akka hin taane akka mirkaneessitu yoo gaafate, Arroxy yoo Explore keessatti seentee jirta seensa Explore kee illee ni yaala, kuukkiin faayila ykn biraawzara irraa immoo qindoomina kuukkii keessatti ni argama.

</details>

<details>
<summary><strong>Arroxy afaan meeqa keessatti argamu?</strong></summary>

Afaanota 31 battalumatti ni argatta: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy yeroo jalqaba banamu afaan sirna hojii kee ofumaan adda baasa, akkasumas filataa afaanii toolbar keessa jiru irraa yeroo kamiyyuu jijjiiruu dandeessa. Runtime locale JSON src/shared/i18n/locales/ keessa jira, katalogiin PO hiiktotaaf ammoo i18n/locales/ keessa jira — gumaachuuf GitHub irratti PR bani.

</details>

<details>
<summary><strong>Waan biraa fayyadu barbaachisaa?</strong></summary>

Lakki. yt-dlp, ffmpeg fi ffprobe jalqaba banuu irratti ofumaan buufamanii meeshaa kee irratti kuufamu. Sana booda qindaaʼinni dabalataa hin barbaachisu.

</details>

<details>
<summary><strong>Playlist ykn chaanaalii guutuu buusuu danda'aa?</strong></summary>

Eeyyee — lamaan isaaniiyyuu. URL playlist ykn channel maxxansi (fkn. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); galfata meeqa akka sakatta’u filadhu, ergasii tarree guutuu queue godhi ykn viidiyoo addaa filadhu. Filtraroonni guyyaa gara fuulduraatti dhufu.

</details>

<details>
<summary><strong>macOS "app miidhaameera" jedha — maal godhaa?</strong></summary>

Sun macOS Gatekeeper app mallattoo hin qabne dhorku, miidhaa dhugaa miti. Ajajoota Terminal quarantine haquu fi Arroxy banuuf [macOS first launch](#macos-first-launch) ilaali.

</details>

<details>
<summary><strong>Viidiyoo YouTube buusuu seeraa dha?</strong></summary>

Fayyadama dhuunfaa, dhoksaa qofaaf yeroo hedduun mootummoota heddu keessatti fudhatama. [Dambii Tajaajilaaf](https://www.youtube.com/t/terms) YouTube fi seeraa mirga-qopheessaa naannoo keetti hordofuuf ati itti gaafatamtummaa qabda.

</details>

---

## <a id="roadmap"></a>🗺️ Karoora

Amma iyyuu karoorfame — tilmaamaan tartiiba dursaatiin:

| Amalli    | Ibsa    |
| ---------------- | ---------------- |
| **Playlist & chaanaalii hojjettoota** | Yeroo playlist ykn channel sakatta’an filtraroota guyyaa |
| **Filannoo track sagalee YouTube** | Yoo YouTube track sagalee heddu dhiyeesse, filannoo track afaan dubbii app guutuu keessatti kaa’i; profile tokkoon tokkoon isaatti override godhi |
| **Deebisanii yaaluun deebisuu cimaa** | Buufannoowwan walitti hidhamiinsa internetii hin tasgabboofne ykn rakkoo qabuun citeef karaa retry haaraa |
| **Drawer download manager guutuu** | Queue drawer gara manager guutuutti guddisuu, items queue keessa jiranif destination folder jijjiiruu dabalatee |
| **Buufannoo yeroo qabamee** | Queue yeroo qindaawaa irratti eegali (halkaniidhumaan hojeti) |
| **Paakeejii AUR** | Arch Linux fi Omarchy irratti `yay -S arroxy-bin` fayyadamuun fe'i |

Amala yaaddetee jirtaa? [Gaaffii bani](../../issues) — galchiin hawaasaa dursa murteessa.

---

## <a id="support"></a>💖 Arroxy Deggeri

Arroxy bilisa fi hayyama MIT jala jira — beeksisni hin jiru, telemetriin hin jiru, fooyya'iinsi kaffaltiin hin jiru. Yoo yeroo siif qusate, guddina isaa Bitcoin, Tron ykn Ethereum'iin deggeruu dandeessa: teessoowwan [DONATE.md](DONATE.md) keessa jiru, innis madda ofiisaa qofa. Arroxy gonkumaa teessoo iimeeliidhaan ykn ergaa kallattiitiin siif hin ergu. Repoo'f urjii kennuun, dogoggora gabaasuu fi hiikkaa fooyyessuun hammuma sana gargaara.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Waan itti Ijaare

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop wantoota hundaaf kan hojetu
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — kallattii
- **Zustand** — bulchiinsa haala
- **yt-dlp** + **ffmpeg** — injinii buusuu fi walitti makuu (lamaan isaanii runtime irratti fudhatamu: yt-dlp haaraa ta'ee tursiifama, ffmpeg/ffprobe altokko qofa fe'amee fooyya'iinsa booda illee turu)
- **Vite** + **electron-vite** — meeshaalee ijaarsaa
- **Vitest** + **Playwright** — qormaata unit fi end-to-end

</details>

<details>
<summary><strong>Madda irraa ijaari</strong></summary>

### Wantoota barbaachisaa — platformoota hundaaf

| Meeshaa | Verzhiyoonii | Fayyadu |
| ------- | ------- | ------- |
| Git     | kamiyyuu | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` yookaan `.node-version` |
| Bun     | 1.4.2  | `mise install` yookaan `package.json` `packageManager` |

Kan gorfamu: `mise` fe'i, sana booda checkout keessatti `mise install` hojjedhu. Mise malee, `bun run bootstrap` dura Node.js `.node-version` irraa fi Bun `package.json` irraa harkaan hojiirra oolchi.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Native rebuilds'f Visual Studio Build Tools fi Python barbaachuu danda'u.

### macOS

```bash
brew install mise
xcode-select --install
```

Erga clone gootee booda checkout keessatti `mise trust && mise install` hojjedhu. Yoo shell kee duraan `fnm`, `nvm`, ykn Homebrew Bun fayyadama ta'e, Arroxy Node.js 24.21.0 fi Bun 1.4.2 akka fayyadamuuf `~/.zshrc` keessatti mise kakaasi:

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

# Build fi Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Clone fi itti fayyadami

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # kan gorfamu; pinned tools harkaan hojiirra oolchan yoo ta'e dhiisi
bun run bootstrap
bun run doctor
bun run dev            # Electron app Vite renderer waliin
```

### Faayila rabsuu ijaari

```bash
bun run build        # typecheck + compile
bun run dist         # OS ammaa kanaaf qindeessi
bun run dist:win     # supported host irratti Windows targets package godhi
```

> `bun run bootstrap` dependencies fe'a, Electron app dependencies rebuild godha, Electron mirkaneessa, development'f embedded ffmpeg/ffprobe qopheessa, Playwright Chromium fe'a. Release builds yt-dlp, ffmpeg fi ffprobe runtime irratti app data folder keessatti manage godhu; tokkoon isaanii iyyuu installer keessa hin jiru.

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

## 📜 Hayyama fayyadamuu

Arroxy meeshaa fayyadama dhuunfaa, dhoksaa qofaaf. Buufannoonni kee Dambii Tajaajilaaf YouTube [Terms of Service](https://www.youtube.com/t/terms) fi seeraa mirga-qopheessaa naannoo keetii wajjin walsimuu mirkaneessuu qofaaf itti gaafatamaa taata. Arroxy fayyadamuudhaan mirgaa hin qabne qabiyyee buusuu, haaromsu, ykn raabsuu hin godhin. Guddiftoonni misooma dogoggoraa kamiifis itti gaafatamu hin qaban.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT License · Qalbii fi qormaata <a href="https://x.com/OrionusAI">@OrionusAI</a> tiin hojjetame</sub>
</div>
