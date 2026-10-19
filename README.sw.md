<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Nembo ya Arroxy" width="180" />

# Arroxy — Kipakuzi Bure cha Chanzo Wazi cha YouTube (+ Tovuti 2000) chenye Kivinjari Ndani, kwa Windows, macOS na Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Soma kwa:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **Kiswahili** · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Toleo](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Ujenzi](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Tovuti](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Leseni](https://img.shields.io/badge/license-MIT-green) ![Majukwaa](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Lugha](https://img.shields.io/badge/i18n-31_languages-blue)

Pakua video, Shorts, muziki, vituo, podikasti, au nyimbo za sauti kutoka **YouTube na tovuti 2000+ zinazotumika** — hadi 8K HDR kwa fps 60, kama MP3 / AAC / Opus, au sehemu tu unayohitaji. **Vinjari YouTube au tovuti nyingine yoyote ndani ya Arroxy** kwenye kichupo cha Explore na upakue video, playlist, au channel unayotazama; ingia humo ili kupakua video za faragha, za wanachama pekee, na zenye kikomo cha umri ambazo akaunti yako inaweza kutazama. Inafanya kazi mahali hapo kwenye Windows, macOS, na Linux. **Hakuna matangazo, hakuna mzigo wa ziada, hakuna mauzo ya ziada.**

[**↓ Pakua Toleo la Hivi Karibuni**](#install) &nbsp;·&nbsp; [**Tovuti**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Uzinduzi wa kwanza wa Windows](#windows-first-launch) · [Uzinduzi wa kwanza wa macOS](#macos-first-launch) · [Uzinduzi wa kwanza wa Linux](#linux-first-launch)

[![Jiunge na jumuiya ya Discord](https://img.shields.io/badge/Jiunge%20na%20jumuiya%20ya%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Ikiwa Arroxy inakuokoa muda, ⭐ inasaidia wengine kuipata.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## Yaliyomo

- [✨ Vipengele](#features)
- [📥 Sakinisha na uzinduzi wa kwanza](#install)
  - [Uzinduzi wa kwanza wa Windows](#windows-first-launch)
  - [Uzinduzi wa kwanza wa macOS](#macos-first-launch)
  - [Kwa nini unaweza kuona onyo](#why-warning)
  - [Uzinduzi wa kwanza wa Linux](#linux-first-launch)
  - [Thibitisha upakuaji wako (SHA256)](#verify)
- [⚖️ Kwa Nini Arroxy](#why)
- [🔒 Faragha](#privacy)
- [❓ Maswali Yanayoulizwa Mara kwa Mara](#faq)
- [🗺️ Ramani ya Barabara](#roadmap)
- [💖 Saidia Arroxy](#support)
- [🛠️ Imejengwa na](#tech)

---

## <a id="features"></a>✨ Vipengele

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Vinjari YouTube au tovuti nyingine yoyote ndani ya Arroxy na upakue ukurasa ulioko kwa wasifu wako unaotumika</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Skrini ya kwanza ya Explore</b><br/>Mtazamo wa haraka wa Explore, na kwa nini akaunti ya pili ndiyo njia salama zaidi ya kuingia</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Vipakuliwa hukuambia kinachokuhitaji</b><br/>Viungo huandaliwa chinichini; kilichoshindwa hutoa suluhisho lake, playlist ndefu husubiri chaguo lako</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Pakua sehemu tu ya video</b><br/>Chagua mwanzo na mwisho, au sura — Arroxy huhifadhi sehemu hiyo pekee</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Kihariri cha wasifu</b><br/>Rekebisha wasifu: aina ya faili, ubora, manukuu, mahali pa kuhifadhi, kiolezo cha jina la faili na mengineyo</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Giza au mwanga, kioo au imara</b><br/>Mionekano minne ya kuchagua: paneli za kioo juu ya anga linalosonga au nyuso imara tulivu, kila mmoja katika giza na mwanga</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Njia ya mkato ya kupakua kwa mfumo mzima ya Arroxy — Ctrl+Shift+D kwenye Windows na Linux, Cmd+Shift+D kwenye macOS, hupeleka kiungo kilichonakiliwa moja kwa moja kwenye foleni ya upakuaji" width="760" /></picture><br/><sub><b>Njia ya mkato ya kupakua kwa mfumo mzima</b><br/>Nakili kiungo popote, bonyeza mara moja — huingia kwenye foleni na upakuaji huanza</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Wasifu kwa kila kipengele cha orodha ya kucheza</b><br/>Mpe kila video wasifu wake — hifadhi baadhi kwa 4K, chukua zilizobaki kama MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Ukurasa wa Upakuaji wa haraka</b><br/>Bandika URL na uipakue papo hapo kwa wasifu wako amilifu</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Wasifu wa upakuaji unaoweza kutumika tena</b><br/>Hifadhi muundo, ubora na matokeo kama mipangilio — tumia tena kwa kila upakuaji</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Nyimbo za sauti za lugha nyingi</b><br/>Chagua lugha kamili ya sauti inayokuja na video</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Sauti ya Surround / Dolby</b><br/>Nyimbo za 5.1 na Dolby zinatambuliwa na kuhifadhiwa</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Hali ya URL nyingi</b><br/>Bandika orodha, ondoa nakala kiotomatiki, panga zote kwa pamoja</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Foleni ya upakuaji sambamba</b><br/>Upakuaji kadhaa kwa wakati mmoja na maendeleo ya moja kwa moja</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: vinjari wavuti ndani ya Arroxy</strong></summary>

- **Kichupo cha Explore** — vinjari YouTube au tovuti nyingine yoyote ndani ya Arroxy na upakue unachopata bila kunakili viungo. **Pakua · *wasifu wako*** huweka kwenye foleni video, playlist, au channel unayotazama; mshale ulio kando hubadilisha wasifu, na kijiti cha uchawi hufungua upakuaji wa hatua kwa hatua wa kuchagua fomati, manukuu, na zaidi
- **Bofya kulia ili kupakua** — bofya kulia kiungo chochote cha video, playlist au channel katika Explore ili kukipakua kwa wasifu wako, kuchagua wasifu mwingine kutoka **Pakua kwa**, kufungua upakuaji wa hatua kwa hatua, au kunakili kiungo. Hakuna haja ya kufungua kila video kwanza
- **Mpangilio mshikamano** — kubofya mara moja kwenye upau wa zana wa Explore huhamishia vichupo vya Arroxy ndani yake na kuipa ukurasa nafasi zaidi
- **Upau wa anwani** — andika kutafuta YouTube au andika anwani yoyote ya wavuti kufungua tovuti hiyo
- **Upakuaji unaohitaji akaunti** — ingia mara moja katika Explore na Arroxy inaweza kupakua video za faragha na za wanachama pekee ambazo akaunti yako inaweza kutazama, video zenye kikomo cha umri ikiwa umri wa akaunti umethibitishwa, na orodha zako za Tazama Baadaye na Zilizopendwa. Ingia pia kwenye tovuti nyingine humo, na upakuaji wao hutumia kuingia huko pale unapohitajika. Arroxy bado hupakua kwanza bila kuingia na hutumia kuingia kwako kwa Explore tu pale upakuaji unaposhindwa kwa njia ambayo akaunti inaweza kurekebisha. YouTube inapokuomba uthibitishe kuwa wewe si roboti, Arroxy pia hujaribu kuingia kwako kwa Explore
- **Tumia akaunti ya pili** — skrini ya kwanza ya Explore inaeleza sababu: kupakua kwa akaunti kuna hatari fulani ya akaunti hiyo kuwekewa vikwazo. Toka kwenye Explore kupitia Mipangilio wakati wowote unapotaka kusahau kuingia kwako kote
- **Kizuia matangazo** — kimezimwa kwa chaguomsingi. Kubofya ngao mara moja kwenye upau wa zana wa Explore huzuia matangazo na vifuatiliaji kwenye kurasa zake, bila kuathiri upakuaji. YouTube inaweza kupinga vizuia matangazo kwa akaunti zilizoingia

</details>

<details>
<summary><strong>🎞️ Ubora na fomati</strong></summary>

- Hadi **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Kiwango cha juu cha fremu na HDR** vimehifadhiwa kama vilivyo — fps 60, HDR10
- **Sauti** — hamisha sauti pekee kama MP3, M4A/AAC, Opus au WAV. Katika upakuaji wa mwingiliano, chagua nyimbo asili za surround/Dolby za chanzo (AC-3, E-AC-3, 5.1, DRC) zinapopatikana, au weka chaguo-msingi la jumla **Pendelea surround / Dolby**
- **Wasifu wenye lengo** — *Picha bora* (AV1 · VP9) au *Runinga janja* (MP4 · H.264), huhifadhiwa kama Otomatiki, MP4, MKV, au WebM bila kusimba upya. HDR ni *Otomatiki* (tu skrini yako inapoweza kuionyesha), *SDR*, au *HDR*
- **Kila kodeki katika kila azimio** — upakuaji wa hatua kwa hatua huorodhesha AV1, VP9 na H.264 kando kwa kando katika kila azimio, ili uchague ile ambayo TV yako au kihariri chako kinacheza
- **Jua mtiririko ulivyo hasa** — ukubwa ambao YouTube imekuza kwa AI, lugha za sauti zilizotafsiriwa na AI, mitiririko yenye bitrate iliyoboreshwa, video za 360° na nakala zilizoharibika au zenye alama-maji huwekewa alama. Wasifu huruka mitiririko iliyokuzwa kwa AI isipokuwa uiruhusu

</details>

<details>
<summary><strong>🛡️ Faragha na udhibiti</strong></summary>

- Usindikaji wa mahali hapo 100% — maudhui yanashuka moja kwa moja kutoka YouTube hadi kwenye diski yako
- Hakuna kuingia, hakuna vidakuzi, hakuna akaunti ya Google iliyounganishwa
- Faili zimehifadhiwa moja kwa moja kwenye folda unayochagua

</details>

<details>
<summary><strong>⚡ Mtiririko wa kazi</strong></summary>

- **Njia ya mkato ya kupakua kwa mfumo mzima** — nakili kiungo katika programu yoyote kisha bonyeza `Ctrl+Shift+D` (`Cmd+Shift+D` kwenye macOS); Arroxy huikiweka kwenye foleni kwa wasifu wako unaotumika bila kufungua dirisha, na arifa huthibitisha. Imewashwa kwa chaguo-msingi, inaweza kubadilishwa
- **Njia rahisi za kuanza** — chagua upakuaji mmoja unaoongozwa, kichagua playlist/channel, kubandika URL nyingi, Quick Download kwa mipangilio chaguomsingi iliyohifadhiwa, au vinjari na upakue kutoka Explore
- **Foleni kuu ya upakuaji** — kazi ya single, playlist, bulk, au quick yote huingia sehemu moja kwa maendeleo, kusitisha, kuendelea, kughairi, kujaribu tena, na udhibiti wa kipaumbele
- **Ufuatiliaji wa ubao wa kunakili** — nakili kiungo cha video na kitajaza sehemu ya URL ukirudi kwenye Arroxy, pamoja na **Tendua** ikiwa hukukusudia. Arroxy ikiwa na shughuli, kiungo husubiri hadi urudi kwenye kichupo cha URL (kizime katika Mipangilio)
- **Usafi wa URL kiotomatiki** — huondoa vigezo vya ufuatiliaji (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) na kufungua viungo vya `youtube.com/redirect`
- **Hali ya tray** — kufunga dirisha kunaacha maudhui kuendelea kupakuliwa nyuma ya skrini
- **Lugha 31** — hutambua locale ya mfumo kiotomatiki, unaweza kubadilisha wakati wowote
- **Usawazishaji wa orodha ya kucheza** — hukagua tena orodha ya kucheza dhidi ya folda ya ndani ili kuruka video zilizopakuliwa tayari; hutengeneza faili ya orodha ya kucheza `.m3u` inayosasishwa kila video inapopakuliwa
- **Udhibiti wa kasi na pacing** — weka kikomo cha bandwidth ya upakuaji, weka ni sehemu ngapi za video zinapakuliwa kwa wakati mmoja, na ongeza ucheleweshaji wa maombi kwa mipangilio (*Zima · Uwiano · Tahadhari · Maalum*)
- **Violezo vya majina ya faili** — taja upakuaji jinsi unavyotaka kwa `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` na `{playlist_index}`, kwa jumla au kwa kila wasifu wa upakuaji
- **Upakuaji kwa wakati mmoja na kujaribu tena kiotomatiki** — chagua upakuaji mangapi wa foleni unaendelea kwa wakati mmoja, na acha Arroxy ajaribu tena upakuaji uliokumbwa na hitilafu ya mtandao au seva, akisubiri muda mrefu zaidi kabla ya kila jaribio
- **Wasifu kwa kila kipengele cha orodha ya kucheza** — mpe kila video katika orodha ya kucheza wasifu wake wa upakuaji badala ya mpangilio mmoja kwa orodha nzima, ili pasi moja iweze kuhifadhi baadhi kwa ubora kamili na kupata zilizobaki kama MP3
- **Quick Download hufanya kazi chinichini** — kiungo huonekana mara moja katika Vipakuliwa na kuandaliwa huko, ujumbe wenye **Tazama** unathibitisha, na sehemu ya URL husafishwa kwa kiungo kinachofuata. Anzisha nyingi upendavyo huku zile za awali zikiandaliwa
- **Vipakuliwa hukuambia kinachokuhitaji** — ikiwa Arroxy haiwezi kusoma kiungo, safu yake inaeleza sababu na kutoa suluhisho: Jaribu tena, washa vidakuzi, au ingia katika Explore. Vidakuzi vikiwa vimezimwa, **Ingia kwa Explore** hujaribu tena kwa ajili yako ukishaingia. Playlist ndefu kuliko kikomo chako cha kupakia husubiri kwenye safu yake ili uchague yote, za kwanza, au ukaguzi. Kichupo cha Vipakuliwa kinahesabu safu zinazokusubiri
- **Pakua sehemu tu ya video** — chagua mwanzo na mwisho, au sura, kwenye skrini ya Umbizo na Arroxy huhifadhi kipindi hicho tu, kikiwa na jina lenye kipindi baada ya kitambulisho cha video. Ukataji hutua kwenye fremu kuu iliyo karibu zaidi; washa ukataji kamili ili kusimba upya badala yake
- **Ondoa kiotomatiki vipakuzi vilivyokamilika** — hiari: upakuaji uliokamilika huondoka kwenye orodha baada ya sekunde 5. Faili zake hubaki kwenye diski, na upakuaji ulioshindwa hubaki kwenye orodha
- **Ukubwa na Haipo katika Vipakuliwa** — safu ya **Ukubwa** inayoweza kupangwa inaonyesha kila upakuaji unatumia nafasi kiasi gani, na **Haipo** huashiria faili zilizohamishwa au kufutwa nje ya Arroxy
- **Aurora au Rahisi, giza au mwanga** — paneli za kioo juu ya anga linalosogea, au nyuso tulivu thabiti; badilisha kutoka kijachini. Kompyuta zisizo na kasi ya michoro hupata Rahisi kiotomatiki
- **Upau wa menyu wa Mac** — kwenye macOS, fungua Mipangilio (`Cmd+,`), weka kikomo cha kasi ya kupakua, badilisha mtindo na mandhari, na fungua kumbukumbu au hifadhi faili la uchunguzi kutoka kwenye upau wa menyu
- **Badilisha wasifu kutoka kwa upakuaji wowote** — rekebisha upakuaji, kisha sasisha wasifu ulioanzia (pamoja na onyesho la kinachobadilika) au hifadhi mipangilio kama wasifu mpya. Unapobadilisha wasifu, unaulizwa kama uhifadhi mabadiliko yako

</details>

<details>
<summary><strong>📝 Manukuu na usindikaji wa baada ya kupakua</strong></summary>

- **Manukuu** katika SRT, VTT, au ASS — ya mkono au yaliyozalishwa kiotomatiki, katika lugha yoyote inayopatikana
- Hifadhi karibu na video, ingiza ndani ya `.mkv`, au panga katika folda ndogo ya `Subtitles/`
- **Mafungu ya manukuu pekee** — bandika orodha ya URL au fungua orodha ya kucheza, chagua Manukuu, na upate faili za manukuu pekee kwa kila video
- **SponsorBlock** — ruka au weka alama za sehemu kwenye wadhamini, utangulizi, mwisho, matangazo binafsi
- **Metadata iliyowekwa** — kichwa, tarehe ya kupakia, chaneli, maelezo, picha ndogo, na alama za sura zimeandikwa ndani ya faili

</details>

<details>
<summary><strong>🌐 YouTube + Tovuti 2000</strong></summary>

- **YouTube kamili** — Video, Shorts, Vituo, Orodha za Kucheza, YouTube Music na Podikasti zinashughulikiwa kama vyanzo vya daraja la kwanza
- **Tovuti 2000+ nyingine** kupitia yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable na nyingi zaidi
- **Sauti pekee na manukuu** yanafanya kazi kwenye kila tovuti inayoungwa mkono, si YouTube peke yake
- Tovuti ikibadilika, yt-dlp hutoa marekebisho kila wiki na Arroxy husasisha binary kiotomatiki wakati wa uzinduzi

</details>

---

## <a id="install"></a>📥 Sakinisha na uzinduzi wa kwanza

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

Matoleo ni ya x86_64 pekee. Huna `curl`? Badilisha `curl -fsSL` kuwa `wget -qO-`.

| Jukwaa | Fomati |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Pata toleo la hivi karibuni →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Uzinduzi wa kwanza wa Windows</strong></summary>

Wakati wa uzinduzi wa kwanza unaweza kuona **"Windows protected your PC"** au **"Unknown publisher."** Hii inatumika kwa `Arroxy-win-x64-Setup.exe` na `Arroxy-win-x64-Portable.exe`. Arroxy ni bure na chanzo wazi, na ujenzi wa Windows haujasainiwa kwa cheti cha malipo, ndiyo maana SmartScreen huipiga bendera. Hii **haimaanishi** kiotomatiki kwamba Arroxy si salama. Ili kuendelea:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Bonyeza **More info**.
2. Bonyeza **Run anyway**.

#### Ikiwa Windows Defender inaweka bendera au kuondoa faili

Heuristics za Defender wakati mwingine huweka bendera kwenye visanidi visivyosainiwa vya NSIS na portable za Electron kama zinazoshukiwa. Ikiwa Defender inaweka karantini `Arroxy-win-x64-Setup.exe` au `Arroxy-win-x64-Portable.exe`, irudishe kutoka **Windows Security → Virus & threat protection → Protection history**, kisha ongeza faili inayoweza kutekelezwa ya Arroxy kama kipengele kinachoruhusiwa chini ya **Manage settings → Add or remove exclusions**. Kama ilivyo na SmartScreen, kisababishi ni saini ya mchapishaji inayokosekana, si programu hasidi iliyogunduliwa.

> Pakua Arroxy tu kutoka ukurasa rasmi wa GitHub Releases. Ukipata faili kutoka tovuti nyingine au mtu akikutumia, ifute na upakue nakala mpya kutoka chanzo rasmi. Msimbo wa chanzo ni wa umma, hivyo unaweza kuukagua au kuijenga Arroxy mwenyewe ukitaka.

Unapendelea Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Uzinduzi wa kwanza wa macOS</strong></summary>

Arroxy bado haijasainiwa kwa macOS, kwa hivyo Gatekeeper inaweza kuonyesha ujumbe wa kutisha *"Arroxy.app is damaged and can't be opened"* baada ya kuisakinisha kutoka DMG. Ujumbe huo unamaanisha macOS imeweka programu isiyosainiwa kwenye quarantine; haumaanishi faili za programu zimeharibika kweli. Kwenye macOS za sasa, suluhisho la kuaminika ni Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Buruta `Arroxy.app` kutoka kwenye DMG iliyopachikwa hadi `/Applications`.
2. Fungua Terminal na uendeshe amri hizi mbili:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Amri ya kwanza huondoa sifa ya quarantine kutoka kwenye nakala yako ya Arroxy iliyosakinishwa. Ya pili huzindua programu. `sudo` inaweza kukuuliza nenosiri la Mac yako; Terminal haitaonyesha herufi unapoliandika.

**Apple Silicon vs Intel:** kwenye Mac ya mfululizo wa M (M1 / M2 / M3 / M4), pakua DMG ya `arm64`. Kwenye Mac za Intel, pakua DMG ya `x64`. Kuendesha build isiyo sahihi bado kunafanya kazi kupitia Rosetta lakini ni polepole zaidi kwa kiasi kinachoonekana.

> Ujenzi wa macOS hufanywa kupitia CI kwenye vichakataji vya Apple Silicon na Intel. Ukipata matatizo, tafadhali [fungua tatizo](../../issues) — maoni kutoka kwa watumiaji wa macOS yanaathiri kikamilifu mzunguko wa majaribio ya macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Kwa nini unaweza kuona onyo</strong></summary>

Arroxy ni chanzo wazi na ina leseni ya MIT. Ujenzi wa Windows na macOS **haujasainiwa kwa nambari** — cheti cha Apple Developer ID na Windows EV cha kutia saini msimbo huchangia mamia ya dola kwa mwaka, ambayo mradi wa kujitegemea hulipa mfukoni mwake. Bila saini hizo, Windows SmartScreen na macOS Gatekeeper watakuonya wakati wa uzinduzi wa kwanza. Maonyo hayo yanamaanisha *mfumo wako wa uendeshaji haukuitambua kampuni inayotoa programu* — hayamaanishi kwamba Arroxy ni programu hasidi.

Njia tatu za kuthibitisha Arroxy mwenyewe, kwa uthabiti unaozidi:

- **Soma msimbo wa chanzo.** Kila mstari uko kwenye [GitHub](https://github.com/antonio-orionus/Arroxy) na unaweza [kuijenga kutoka chanzo](#tech).
- **Angalia SHA256.** Linganisha faili yako na [`SHA256SUMS`](../../releases/latest) iliyochapishwa — tazama [Thibitisha upakuaji wako](#verify) hapa chini.
- **Fanya ukaguzi wa tatu.** Pakia faili kwenye [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Uzinduzi wa kwanza wa Linux</strong></summary>

AppImages zinaendesha moja kwa moja — hakuna usanidi. Unahitaji tu kuweka faili kama inayoweza kutekelezwa.

**Kidhibiti cha faili:** bonyeza kulia `.AppImage` → **Properties** → **Permissions** → wezesha **Allow executing file as program**, kisha bonyeza mara mbili.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Ikiwa uzinduzi bado unashindwa, iendeshe bila kupachika — hakuna kifurushi cha FUSE kinachohitajika:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Uunganishaji wa hiari wa desktop:** sakinisha [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) mara moja, na AppImage yoyote unayobonyeza mara mbili itasajiliwa kiotomatiki kwenye menyu yako ya uzinduzi — hakuna faili ya `.desktop` ya mkono inayohitajika.

**Tarball ya kawaida (hakuna FUSE, hakuna usakinishaji):**

Toleo la `.tar.gz` ni programu ile ile bila kifuniko cha AppImage — ifungue popote kisha uiendeshe. Hakuna kisakinishi wala kifurushi cha FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Vipakuliwa vya Linux kwenye ukurasa wa matoleo ni vya x86_64 pekee.** Kwenye mashine za ARM64 (Raspberry Pi, Asahi Linux) Flatpak husakinishwa lakini hushindwa kuanza ikitoa `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Thibitisha upakuaji wako (SHA256)</strong></summary>

Kila toleo linachapisha faili ya `SHA256SUMS` pamoja na faili za binary. Ili kuangalia kwamba upakuaji wako haukuharibiwa au kubadilishwa wakati wa usafirishaji, hesabu hash ya faili yako mahali hapo na ulinganishe mstari katika `SHA256SUMS`. Fungua ukurasa wa toleo la hivi karibuni → **Assets** → pakua `SHA256SUMS`.

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

Unataka ukaguzi wa programu hasidi wa mtu wa tatu? Pakia faili kwenye [VirusTotal](https://www.virustotal.com). Bendera chache za heuristic za jumla kutoka kwa injini ndogo ni za kawaida kwa programu za Electron zisizosainiwa; ugunduzi ulioenea kutoka kwa injini kubwa ungekuwa wasiwasi wa kweli.

</details>

<details>
<summary><strong>📦 Windows: Kisanidi dhidi ya Inayobebeka</strong></summary>

|               | Kisanidi cha NSIS | Inayobebeka `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Usanidi unahitajika | Ndiyo  | Hapana — endesha kutoka mahali popote  |
| Masasisho ya kiotomatiki | ✅ ndani ya programu  | ❌ upakuaji wa mkono  |
| Kasi ya uzinduzi | ✅ ya haraka zaidi  | ⚠️ mwanzo wa polepole baridi  |
| Inaongeza kwenye Menyu ya Kuanza |            ✅            |           ❌            |
| Kuondoa kwa urahisi |            ✅            | ❌ futa faili  |

**Pendekezo:** tumia kisanidi cha NSIS kwa masasisho ya kiotomatiki na uzinduzi wa haraka. Tumia `.exe` inayobebeka kwa chaguo lisilo na usanidi na bila usajili.

</details>

---

## <a id="why"></a>⚖️ Kwa Nini Arroxy

Ulinganisho wa pamoja na mbadala za kawaida zaidi:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Kivinjari kilichojengewa ndani (vinjari, ingia, pakua) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Video za faragha, za wanachama pekee na zenye kikomo cha umri bila kuhamisha vidakuzi |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Bure, hakuna ngazi ya malipo |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Chanzo wazi |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Usindikaji wa mahali hapo tu |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Hakuna vikwazo vya matumizi |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Programu ya mezani inayofanya kazi kwenye mifumo yote |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Manukuu + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = kwa sehemu, au kwenye kiwango cha kulipia pekee. Kuingia ndani ya programu kwa video za faragha katika 4K Video Downloader ni kipengele cha kulipia; GUI nyingi za bure za yt-dlp hukubali faili ya vidakuzi pekee au husoma vidakuzi vya kivinjari chako cha wavuti.

Arroxy imejengwa kwa jambo moja: faili safi la mahali hapo, iwe unabandika URL au unapata video katika Explore. Hakuna mauzo ya ziada, hakuna ukusanyaji wa data.

### <a id="why-explore"></a>🧭 Kile ambacho kifuniko cha kawaida cha yt-dlp hakiwezi: kichupo cha Explore

Vipakuzi vingi vya bure vya YouTube ni kisanduku cha URL juu ya yt-dlp tu. Arroxy pia hutumia yt-dlp, lakini ina **Explore** pia, kivinjari kilichojengwa ndani ya programu kinachofungua YouTube au tovuti nyingine yoyote. Explore hupita vikwazo ambavyo kisanduku cha URL hakiwezi kupita:

- **Video zinazohitaji akaunti, bila kuhamisha vidakuzi** — video za faragha, za wanachama pekee, na zenye kikomo cha umri (kwenye akaunti iliyothibitishwa umri), pamoja na orodha zako za Tazama Baadaye na Zilizopendwa, na video zilizo nyuma ya kuingia kwenye tovuti nyingine. Kifuniko cha kawaida kinahitaji faili ya cookies.txt iliyohamishwa au lazima kisome vidakuzi vya kivinjari chako cha wavuti, jambo ambalo Chrome kwenye Windows sasa huzuia. Katika Arroxy unaingia mara moja katika Explore na inashughulikia mengine yote
- **"Ingia ili uthibitishe kuwa wewe si roboti"** — YouTube inapouliza hivi, Arroxy hujaribu upakuaji tena kwa kuingia kwako kwa Explore badala ya kushindwa
- **Tokeni ya upakuaji ya YouTube** — kivinjari kilichojengewa ndani cha Arroxy hupata tokeni ambayo YouTube inatarajia kabla ya upakuaji. Bila tokeni hiyo, YouTube inaweza kutoa fomati chache na ubora wa chini kuliko ulioomba
- **Hakuna kunakili viungo** — tafuta video, playlist, au channel katika Explore na uipakue kwa kubofya mara moja, au bofya kulia kiungo chochote kwenye ukurasa
- **Kizuia matangazo ukitaka** — kubofya ngao mara moja huzuia matangazo na vifuatiliaji kwenye kurasa za Explore

---

## <a id="privacy"></a>🔒 Faragha

Maudhui hupakuliwa moja kwa moja kupitia [yt-dlp](https://github.com/yt-dlp/yt-dlp) kutoka YouTube hadi kwenye folda unayochagua — hakuna kitu kinachopita kwenye seva ya mtu wa tatu. Historia ya kutazama, historia ya kupakua, URL, na maudhui ya faili yanabaki kwenye kifaa chako.

Hakuna telemetry — ishara moja tu isiyo na jina kwa siku: toleo la programu, OS, lugha, njia ya usakinishaji na nchi, ili tuweze kuhesabu watumiaji hai. Hakuna vitambulisho, URLs, vichwa vya video, njia za faili wala taarifa za akaunti. Unaweza kuizima katika Mipangilio.

Explore ina njia yake ya kuingia, tofauti na kivinjari chako, na Arroxy haisomi wala kujaza fomu ya kuingia kamwe — unaandika kwenye ukurasa wa Google wenyewe. Upakuaji hufanyika bila kuingia; ni pale tu upakuaji unaposhindwa kwa njia ambayo akaunti inaweza kurekebisha ndipo Arroxy husoma kuingia upya, kuliweka kwenye faili ya muda kwa upakuaji huo, na kufuta faili baadaye. Kutoka kwenye Explore katika Mipangilio huifanya isahaulike.

---

## <a id="faq"></a>❓ Maswali Yanayoulizwa Mara kwa Mara

<details>
<summary><strong>Je, ni bure kweli kweli?</strong></summary>

Ndiyo — leseni ya MIT, hakuna ngazi ya malipo, hakuna kizuizi cha vipengele.

</details>

<details>
<summary><strong>Arroxy ina tofauti gani na GUI nyingine za yt-dlp?</strong></summary>

GUI nyingi za bure za yt-dlp ni vifuniko vinavyopokea kiungo tu. Arroxy inaongeza **Explore**, kivinjari cha YouTube kilichojengwa ndani ya programu: unavinjari na kupakua bila kunakili viungo, na unaingia humo mara moja ili kupakua video za faragha, za wanachama pekee, na zenye kikomo cha umri pamoja na orodha zako za Tazama Baadaye na Zilizopendwa, bila kuhamisha vidakuzi. Arroxy hutumia kuingia huko YouTube inapokuomba uthibitishe kuwa wewe si roboti, na kivinjari chake kilichojengewa ndani hupata tokeni ya upakuaji ya YouTube ili upakuaji usirudi kwenye fomati chache. Angalia [Kwa Nini Arroxy](#why).

</details>

<details>
<summary><strong>Ninaweza kupakua ubora gani wa video?</strong></summary>

Chochote YouTube kinatoa: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, pamoja na sauti pekee. Mtiririko wa fps 60 na HDR huhifadhiwa kama ulivyo, na upakuaji wa hatua kwa hatua hukuruhusu kuchagua AV1, VP9 au H.264 katika kila azimio.

</details>

<details>
<summary><strong>Je, ninaweza kutoa sauti pekee kama MP3?</strong></summary>

Ndiyo. Chagua *sauti pekee* kwenye menyu ya fomati kisha uchague MP3, M4A/AAC, Opus au WAV.

</details>

<details>
<summary><strong>Ninawezaje kupakua video zinazohitaji akaunti ya YouTube?</strong></summary>

Ingia mara moja kwenye kichupo cha Explore. Kisha Arroxy inaweza kupakua video za faragha na za wanachama pekee ambazo akaunti yako inaweza kutazama, video zenye kikomo cha umri ikiwa umri wa akaunti umethibitishwa, na orodha zako za Tazama Baadaye na Zilizopendwa. Hutumia kuingia huko tu pale upakuaji unaposhindwa kwa njia ambayo akaunti inaweza kurekebisha; kila kitu kingine hupakuliwa kama kawaida. Hili ni chaguo la **Kuingia kwa Explore**, lililoorodheshwa kwanza na kuwekewa alama ya Inapendekezwa katika mipangilio ya vidakuzi, na Arroxy huliteua kwa ajili yako mara ya kwanza unapofungua Explore. Wiki ya yt-dlp inaeleza kwamba [otomatiki ya akaunti iliyoingia inaweza kuweka alama kwenye akaunti ya Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); kwa hiyo akaunti ya pili ndiyo chaguo salama zaidi.

</details>

<details>
<summary><strong>Je, itaendelea kufanya kazi YouTube ikibadilisha kitu?</strong></summary>

yt-dlp husasishwa kiotomatiki wakati wa uzinduzi, na Arroxy hutuma marekebisho haraka YouTube inapobadilisha kitu. YouTube inapokuomba uthibitishe kuwa wewe si roboti, Arroxy pia hujaribu kuingia kwako kwa Explore ikiwa umeingia huko, na vidakuzi kutoka kwenye faili au kivinjari chako vinapatikana katika mipangilio ya vidakuzi.

</details>

<details>
<summary><strong>Arroxy inapatikana katika lugha zipi?</strong></summary>

Lugha 31 zipo tayari: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy hutambua lugha ya mfumo wako wa uendeshaji kiotomatiki inapofunguliwa mara ya kwanza, na unaweza kubadilisha wakati wowote kupitia kiteuzi cha lugha kwenye upau wa zana. Runtime locale JSON ziko src/shared/i18n/locales/, na catalog za PO kwa watafsiri ziko i18n/locales/ — fungua PR kwenye GitHub ili kuchangia.

</details>

<details>
<summary><strong>Je, ninahitaji kusakinisha kitu kingine chochote?</strong></summary>

Hapana. yt-dlp, ffmpeg na ffprobe hupakuliwa kiotomatiki wakati wa uzinduzi wa kwanza na kuhifadhiwa kwenye kifaa chako. Baada ya hapo, hakuna usanidi wa ziada unaohitajika.

</details>

<details>
<summary><strong>Je, ninaweza kupakua orodha za kucheza au vituo vyote?</strong></summary>

Ndiyo — zote mbili. Bandika URL ya playlist au channel (mf. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); chagua idadi ya vipengee vya kuchanganua, kisha weka orodha yote kwenye foleni au chagua video maalum. Vichujio vya tarehe vinakuja hivi karibuni.

</details>

<details>
<summary><strong>macOS inasema "programu imeharibiwa" — nifanye nini?</strong></summary>

Hiyo ni macOS Gatekeeper inayozuia programu isiyosainiwa, si uharibifu wa kweli. Tazama [macOS first launch](#macos-first-launch) kwa amri za Terminal zinazoondoa quarantine na kuzindua Arroxy.

</details>

<details>
<summary><strong>Je, ni halali kupakua video za YouTube?</strong></summary>

Kwa matumizi ya kibinafsi na ya faragha, kwa ujumla inakubaliwa katika mamlaka nyingi. Unawajibika kufuata [Masharti ya Huduma](https://www.youtube.com/t/terms) ya YouTube na sheria za haki miliki za mamlaka yako.

</details>

---

## <a id="roadmap"></a>🗺️ Ramani ya Barabara

Bado imepangwa — takriban kwa mpangilio wa kipaumbele:

| Kipengele    | Maelezo    |
| ---------------- | ---------------- |
| **Vichujio vya orodha za kucheza na vituo** | Vichujio vya muda wa tarehe unapoorodhesha playlist au channel |
| **Mapendeleo ya track za sauti za YouTube** | Weka upendeleo wa track ya lugha ya mazungumzo kwa app nzima, na override kwa kila profile YouTube inapotoa track nyingi za sauti |
| **Urejeshaji imara kwa retry** | Njia mpya ya retry kwa upakuaji uliokatizwa na miunganisho ya internet isiyotegemeka au yenye matatizo |
| **Drawer kamili ya msimamizi wa upakuaji** | Kubadilisha queue drawer kuwa manager kamili zaidi, ikijumuisha kubadilisha folder za destination kwa vipengee vilivyo kwenye foleni |
| **Upakuaji uliopangwa** | Anza foleni kwa wakati uliowekwa (uendeshaji wa usiku) |
| **Kifurushi cha AUR** | Sakinisha kwenye Arch Linux na Omarchy kwa `yay -S arroxy-bin` |

Una kipengele unachofikiria? [Fungua ombi](../../issues) — maoni ya jamii huathiri kipaumbele.

---

## <a id="support"></a>💖 Saidia Arroxy

Arroxy ni bure na ina leseni ya MIT — hakuna matangazo, hakuna telemetria, hakuna toleo la kulipia. Ikiwa inakuokolea muda, unaweza kusaidia maendeleo yake kwa Bitcoin, Tron au Ethereum: anwani zipo katika [DONATE.md](DONATE.md), ambacho ndicho chanzo rasmi pekee cha anwani hizo. Arroxy hatakutumia kamwe anwani kwa barua pepe au ujumbe wa moja kwa moja. Kuipa repo nyota, kuripoti hitilafu, na kuboresha tafsiri kunasaidia vivyo hivyo.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Imejengwa na

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — programu ya mezani inayofanya kazi kwenye mifumo yote
- **React 19** + **TypeScript** — kiolesura cha mtumiaji
- **Tailwind CSS v4** — muundo wa kuonekana
- **Zustand** — usimamizi wa hali
- **yt-dlp** + **ffmpeg** — injini ya kupakua na kuchanganya (zote mbili hupakuliwa wakati wa runtime: yt-dlp hudumishwa kuwa ya kisasa, ffmpeg/ffprobe husakinishwa mara moja na kubaki baada ya masasisho)
- **Vite** + **electron-vite** — zana za ujenzi
- **Vitest** + **Playwright** — majaribio ya kitengo na ya mwisho-hadi-mwisho

</details>

<details>
<summary><strong>Jenga kutoka chanzo</strong></summary>

### Mahitaji ya awali — mifumo yote

| Zana    | Toleo   | Usanidi |
| ------- | ------- | ------- |
| Git     | yoyote  | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` au `.node-version` |
| Bun     | 1.4.2  | `mise install` au `package.json` `packageManager` |

Inapendekezwa: sakinisha `mise`, kisha endesha `mise install` ndani ya checkout. Bila mise, washa Node.js kutoka `.node-version` na Bun kutoka `package.json` kabla ya `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools na Python zinaweza kuhitajika kwa rebuild za asili.

### macOS

```bash
brew install mise
xcode-select --install
```

Baada ya ku-clone, endesha `mise trust && mise install` ndani ya checkout. Ikiwa shell yako tayari inatumia `fnm`, `nvm`, au Bun ya Homebrew, wezesha mise katika `~/.zshrc` ili Arroxy itumie Node.js 24.21.0 na Bun 1.4.2:

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

# Utegemezi wa build na wakati wa utekelezaji wa Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Majaribio ya E2E tu (Electron inahitaji skrini)
sudo apt install -y xvfb
```

### Clone na uendeshe

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # inapendekezwa; ruka kama umewezesha zana zilizopiniwa mwenyewe
bun run bootstrap
bun run doctor
bun run dev            # programu ya Electron dhidi ya Vite renderer
```

### Jenga faili la usambazaji

```bash
bun run build        # ukaguzi wa aina + mkusanyiko
bun run dist         # funga kwa OS ya sasa
bun run dist:win     # funga malengo ya Windows kwenye host inayotumika
```

> `bun run bootstrap` husakinisha utegemezi, hujenga upya utegemezi wa programu ya Electron, huthibitisha Electron, huandaa ffmpeg/ffprobe zilizopachikwa kwa maendeleo, na husakinisha Playwright Chromium. Matoleo rasmi husimamia yt-dlp, ffmpeg na ffprobe wakati wa runtime kwenye folda ya data ya programu; hakuna kati yake kinachokuja ndani ya kisakinishi.

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

## 📜 Masharti ya matumizi

Arroxy ni zana ya matumizi ya kibinafsi na ya faragha tu. Unawajibika peke yako kuhakikisha maudhui unayopakua yanafuata [Masharti ya Huduma](https://www.youtube.com/t/terms) ya YouTube na sheria za haki miliki za mamlaka yako. Usitumie Arroxy kupakua, kunakili, au kusambaza maudhui ambayo huna haki ya kuyatumia. Waendelezaji hawana jukumu lolote kwa matumizi mabaya.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Leseni ya MIT · Imetengenezwa kwa uangalifu na <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
