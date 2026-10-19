<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy маскота" width="180" />

# Arroxy — Бесплатни open-source YouTube (+ 2000 сајтова) преузимач са уграђеним прегледачем за Windows, macOS и Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Читај на:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · **Српски** · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Издање](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Изградња](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Веб-сајт](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Лиценца](https://img.shields.io/badge/license-MIT-green) ![Платформе](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Језици](https://img.shields.io/badge/i18n-31_languages-blue)

Преузимајте видео снимке, Shorts, музику, канале, подкасте или аудио записе са **YouTube-а и 2000+ подржаних сајтова** — до 8K HDR при 60 fps, у MP3 / AAC / Opus формату или само део који вам треба. **Прегледајте YouTube или било који други сајт унутар Arroxy-ја** на картици Explore и преузмите видео, плејлисту или канал који гледате; пријавите се ту да бисте преузимали приватна видеа, видеа само за чланове и видеа са старосним ограничењем која ваш налог може да гледа. Ради локално на Windows-у, macOS-у и Linux-у. **Без реклама, без непотребног, без додатне продаје.**

[**↓ Преузмите најновије издање**](#install) &nbsp;·&nbsp; [**Веб-сајт**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows: прво покретање](#windows-first-launch) · [macOS: прво покретање](#macos-first-launch) · [Linux: прво покретање](#linux-first-launch)

[![Придружите се Discord заједници](https://img.shields.io/badge/%D0%9F%D1%80%D0%B8%D0%B4%D1%80%D1%83%D0%B6%D0%B8%D1%82%D0%B5%20%D1%81%D0%B5%20Discord%20%D0%B7%D0%B0%D1%98%D0%B5%D0%B4%D0%BD%D0%B8%D1%86%D0%B8-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Ако вам Arroxy уштеди времена, ⭐ помаже другима да га пронађу.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## Садржај

- [✨ Функционалности](#features)
- [📥 Инсталација и прво покретање](#install)
  - [Windows: прво покретање](#windows-first-launch)
  - [macOS: прво покретање](#macos-first-launch)
  - [Зашто можете видети упозорење](#why-warning)
  - [Linux: прво покретање](#linux-first-launch)
  - [Верификујте преузимање (SHA256)](#verify)
- [⚖️ Зашто Arroxy](#why)
- [🔒 Приватност](#privacy)
- [❓ ЧПП](#faq)
- [🗺️ Планови](#roadmap)
- [💖 Подржи Arroxy](#support)
- [🛠️ Израђено помоћу](#tech)

---

## <a id="features"></a>✨ Функционалности

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Прегледајте YouTube или било који други сајт унутар Arroxy-ја и преузмите страницу на којој сте са активним профилом</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Први екран Explore-а</b><br/>Кратак поглед на Explore и зашто је помоћни налог безбеднија пријава</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Преузимања вам показују шта чека вас</b><br/>Линкови се припремају у позадини; неуспели нуди решење, дугачка плејлиста чека ваш избор</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Преузмите само део видеа</b><br/>Изаберите почетак и крај или поглавље — Arroxy чува само тај опсег</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Уређивач профила</b><br/>Подесите профил: тип фајла, резолуцију, титлове, одредиште, шаблон назива фајла и још много тога</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Тамно или светло, стакло или једноставно</b><br/>Четири изгледа за избор: стаклени панели преко покретног неба или мирне једнобојне површине, сваки у тамној и светлој теми</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Глобална пречица за преузимање у Arroxy — Ctrl+Shift+D на Windows и Linux, Cmd+Shift+D на macOS, шаље копирани линк право у ред за преузимање" width="760" /></picture><br/><sub><b>Глобална пречица за преузимање</b><br/>Копирајте линк било где, притисните једном — улази у ред и преузимање почиње</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Профили по ставци плејлисте</b><br/>Дајте сваком видеу сопствени профил — неке у 4K, остале као MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Почетна брзог преузимања</b><br/>Налепите URL и одмах преузмите са активним профилом</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Поново употребљиви профили преузимања</b><br/>Сачувајте формат, квалитет и излаз као поставке — користите за свако преузимање</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Вишејезичне аудио траке</b><br/>Изаберите тачан језик звука који видео носи</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Сараунд / Dolby звук</b><br/>Траке 5.1 и Dolby се препознају и чувају</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Режим масовних URL-ова</b><br/>Налепите листу, аутоматско уклањање дупликата, ставите све у ред одједном</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Паралелни ред преузимања</b><br/>Више преузимања истовремено уз праћење уживо</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: прегледајте веб унутар Arroxy-ја</strong></summary>

- **Explore картица** — прегледајте YouTube или било који други сајт унутар Arroxy-ја и преузимајте шта нађете без копирања линкова. **Преузми · *ваш профил*** ставља у ред видео, плејлисту или канал који гледате; стрелица поред мења профиле, а чаробни штапић отвара вођено преузимање корак по корак за избор формата, титлова и још тога
- **Преузимање десним кликом** — кликните десним тастером на било који линк видеа, плејлисте или канала у Explore-у да бисте га преузели са својим профилом, изабрали други профил у **Преузми са профилом**, отворили преузимање корак по корак или копирали линк. Не морате прво да отварате сваки видео
- **Компактан распоред** — један клик у траци са алаткама Explore-а премешта Arroxy-јеве картице у њу и даје страници више простора
- **Адресна трака** — унесите упит да претражите YouTube или било коју веб адресу да отворите тај сајт
- **Преузимања која захтевају налог** — пријавите се једном у Explore и Arroxy може да преузима приватна видеа и видеа само за чланове које ваш налог може да гледа, видеа са старосним ограничењем ако је налог верификован по узрасту, као и ваше листе „Гледај касније“ и „Свиђа ми се“. Пријавите се и на другим сајтовима, а њихова преузимања користе ту пријаву када им затреба. Arroxy и даље прво преузима без пријаве и користи вашу Explore пријаву само када преузимање не успе из разлога који налог може да реши. Када YouTube затражи да потврдите да нисте бот, Arroxy покушава и са вашом Explore пријавом
- **Користите помоћни налог** — први екран Explore-а објашњава зашто: преузимање преко налога носи извесан ризик да тај налог буде ограничен. Одјавите се из Explore-а у Подешавањима кад год желите да заборавите пријаве
- **Блокатор огласа** — подразумевано је искључен. Један клик на штит у траци са алаткама Explore-а блокира огласе и трекере на његовим страницама, без утицаја на преузимања. YouTube се може опирати блокаторима огласа за пријављене налоге

</details>

<details>
<summary><strong>🎞️ Квалитет и формати</strong></summary>

- До **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Висок број сличица и HDR** задржани без измена — 60 fps, HDR10
- **Zvuk** — izvezi samo audio kao MP3, M4A/AAC, Opus ili WAV. U interaktivnim preuzimanjima izaberi izvorne surround/Dolby trake izvora (AC-3, E-AC-3, 5.1, DRC) kada su dostupne, ili podesi globalnu podrazumevanu opciju **Daj prednost surround / Dolby**
- **Профили са циљем** — *Најбоља слика* (AV1 · VP9) или *Паметни TV* (MP4 · H.264), сачувани као Аутоматски, MP4, MKV или WebM без поновног кодирања. HDR је *Аутоматски* (само када ваш екран може да га прикаже), *SDR* или *HDR*
- **Сваки кодек у свакој резолуцији** — преузимање корак по корак приказује AV1, VP9 и H.264 један поред другог за сваку резолуцију, па можете изабрати онај који ваш TV или програм за монтажу може да репродукује
- **Знајте шта ток заиста јесте** — означене су резолуције које је YouTube увећао помоћу вештачке интелигенције, аудио језици синхронизовани вештачком интелигенцијом, токови са побољшаним битрејтом, видео снимци од 360° и оштећене копије или копије са воденим жигом. Профили прескачу токове увећане вештачком интелигенцијом осим ако их не дозволите

</details>

<details>
<summary><strong>🛡️ Приватност и контрола</strong></summary>

- 100% локална обрада — преузимања иду директно са YouTube-а на ваш диск
- Без пријаве, без колачића, без повезаног Google налога
- Фајлови се чувају директно у фасциклу коју одаберете

</details>

<details>
<summary><strong>⚡ Радни ток</strong></summary>

- **Глобална пречица за преузимање** — копирајте линк у било којој апликацији и притисните `Ctrl+Shift+D` (`Cmd+Shift+D` на macOS); Arroxy га ставља у ред са вашим активним профилом без отварања прозора, а обавештење то потврђује. Подразумевано укључено, пречица се може променити
- **Флексибилни начини покретања** — изабери вођено једно преузимање, бирач плејлиста/канала, bulk URL paste, Quick Download са сачуваним подразумеваним опцијама или прегледање и преузимање из Explore-а
- **Централни ред за преузимања** — сваки single, playlist, bulk или quick посао стиже на једно место за напредак, паузу, наставак, отказивање, поновни покушај и контролу приоритета
- **Праћење клипборда** — копирајте линк ка видеу и он попуњава поље за URL кад се вратите у Arroxy, уз **Опозови** ако то нисте хтели. Док је Arroxy заузет, линк чека да се вратите на картицу „URL“ (искључује се у Подешавањима)
- **Аутоматско чишћење URL-ова** — уклања параметре праћења (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) и распакује `youtube.com/redirect` линкове
- **Режим трака** — затварање прозора одржава преузимања у позадини
- **31 језика** — аутоматски препознаје системски локалитет, могуће пребацивање у било ком тренутку
- **Синхронизација плејлисте** — поново проверава плејлисту у односу на локални фолдер да би прескочио већ преузете видео снимке; прави `.m3u` фајл плејлисте који се ажурира после сваког преузетог видеа
- **Контроле брзине и pacing-а** — ограничи download bandwidth, подеси колико делова видеа се преузима истовремено и додај кашњења између request-ова уз пресете (*Искључено · Уравнотежено · Опрезно · Прилагођено*)
- **Шаблони назива датотека** — именујте преузимања како желите помоћу `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` и `{playlist_index}`, глобално или по профилу преузимања
- **Истовремена преузимања и аутоматско понављање** — изабери колико преузимања из реда се одвија истовремено и пусти Arroxy да понови преузимање које је наишло на проблем са мрежом или сервером, чекајући дуже пре сваког покушаја
- **Профили по ставци плејлисте** — доделите сваком видеу у плејлисти сопствени профил преузимања уместо једног подешавања за читаву листу, тако да један пролаз може да архивира неке у пуном квалитету, а остале преузме као MP3
- **Quick Download ради у позадини** — линк се одмах појављује у Преузимањима и припрема се тамо, напомена са дугметом **Прикажи** то потврђује, а поље за URL се празни за следећи линк. Покрените колико год желите док се претходни припремају
- **Преузимања вам показују шта чека вас** — ако Arroxy не може да прочита линк, његов ред каже зашто и нуди решење: „Покушај поново“, укључивање колачића или пријаву у Explore-у. Са искљученим колачићима, **Пријава преко Explore-а** понавља покушај за вас чим се пријавите. Плејлиста дужа од вашег ограничења учитавања чека у свом реду да изаберете целу, прве ставке или преглед. Картица Преузимања броји редове који чекају вас
- **Преузми само део видеа** — изабери почетак и крај, или поглавље, на екрану Формат и Arroxy чува само тај опсег, а у називу је опсег иза ID-а видеа. Резови падају на најближи кључни кадар; укључи прецизан рез да би се уместо тога поново кодирало
- **Уклањај завршена преузимања** — опционо: завршено преузимање нестаје са листе 5 секунди касније. Његове датотеке остају на диску, а неуспела преузимања остају на листи
- **Величина и Недостаје у Преузимањима** — колона **Величина** која се може сортирати показује колико простора заузима свако преузимање, а **Недостаје** означава датотеке премештене или обрисане ван Arroxy-ја
- **Aurora или Минималистички, тамна или светла** — стаклени панели преко покретног неба или мирне пуне површине; пребацуј из подножја. Рачунари без графичког убрзања аутоматски добијају Минималистички
- **Трака менија на Mac-у** — на macOS-у отвори Подешавања (`Cmd+,`), подеси ограничење брзине преузимања, промени стил и тему, а из траке менија отвори дневнике или сачувај датотеку дијагностике
- **Измените профил из било ког преузимања** — подесите преузимање, па ажурирајте профил од ког је кренуло (уз преглед онога што се мења) или сачувајте подешавања као нови профил. При промени профила Arroxy пита да ли да задржи ваше измене

</details>

<details>
<summary><strong>📝 Титлови и постобрада</strong></summary>

- **Титлови** у SRT, VTT или ASS формату — ручни или аутоматски генерисани, на свим доступним језицима
- Чувај поред видеа, уграђај у `.mkv`, или организуј у потфасциклу `Subtitles/`
- **Пакети само са титловима** — налепите листу URL адреса или отворите плејлисту, изаберите Титлови и добијте само датотеке титлова за сваки видео
- **SponsorBlock** — прескочи или означи поглављима спонзоре, интра, аутра, самопромоције
- **Уграђени метаподаци** — наслов, датум учитавања, канал, опис, минијатура и маркери поглавља уписани у фајл

</details>

<details>
<summary><strong>🌐 YouTube + 2000 сајтова</strong></summary>

- **YouTube — у потпуности** — видео снимци, Shorts, канали, пlejliste, YouTube Music и подкасти обрађени као извори прве класе
- **2000+ других сајтова** преко yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable и многи други
- **Само аудио и титлови** раде на свaком подржаном сaјту, не само на YouTube-у
- Ако сajт промени нешто, yt-dlp испоручује исправке недељно, а Arroxy аутоматски ажурира бинарни фajл при покретању

</details>

---

## <a id="install"></a>📥 Инсталација и прво покретање

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

Верзије су само x86_64. Немате `curl`? Замените `curl -fsSL` са `wget -qO-`.

| Платформа | Формат |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Преузмите најновије издање →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows: прво покретање</strong></summary>

При prvom покретању можете видети **«Windows protected your PC»** или **«Unknown publisher»**. Ово се односи на `Arroxy-win-x64-Setup.exe` и `Arroxy-win-x64-Portable.exe`. Arroxy је бесплатан и отвореног кода, а Windows верзије нису потписане плаћеним сертификатом — због тога SmartScreen означава ове фајлове. То **не** значи аутоматски да је Arroxy несигуран. Да бисте наставили:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Кликните **More info**.
2. Кликните **Run anyway**.

#### Ако Windows Defender означи или уклони фајл

Defender хеуристика понекад означава непотписане NSIS инсталатере и Electron преносиве верзије као сумњиве. Ако Defender стави у карантин `Arroxy-win-x64-Setup.exe` или `Arroxy-win-x64-Portable.exe`, вратите га из **Windows Security → Virus & threat protection → Protection history**, а затим додајте Arroxy извршни фајл као дозвољену ставку под **Manage settings → Add or remove exclusions**. Као и у случају SmartScreen-а, покретач је недостајући потпис издавача, а не откривен малвер.

> Преузимајте Arroxy искључиво са званичне GitHub Releases странице. Ако сте добили фајл са другог сајта или вам је неко послао, обришите га и преузмите свежу копију из званичног извора. Изворни код је јаван, тако да га можете сами прегледати или компајлирати ако желите.

Више волите Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS: прво покретање</strong></summary>

Arroxy још увек није потписан кодом за macOS, па Gatekeeper након инсталације из DMG-а може приказати застрашујући дијалог *"Arroxy.app is damaged and can't be opened"*. Та порука значи да је macOS ставио непотписану апликацију у quarantine; не значи да су фајлови апликације стварно оштећени. На актуелном macOS-у поуздано решење је Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Превуците `Arroxy.app` са монтираног DMG у `/Applications`.
2. Отворите Terminal и покрените ове две команде:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Прва команда уклања quarantine атрибут са ваше инсталиране копије Arroxy. Друга покреће апликацију. `sudo` може затражити лозинку за Mac; Terminal не приказује знакове док је куцате.

**Apple Silicon vs Intel:** на Mac рачунару са процесором серије M (M1 / M2 / M3 / M4), преузмите DMG за `arm64`. На Intel Mac рачунарима, преузмите DMG за `x64`. Покретање погрешне верзије ради преко Rosetta, али је приметно спорије.

> macOS верзије се производе путем CI на Apple Silicon и Intel покретачима. Ако наиђете на проблеме, [отворите пријаву](../../issues) — повратне информације корисника macOS-а активно обликују циклус тестирања.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Зашто можете видети упозорење</strong></summary>

Arroxy је open-source пројекат са MIT лиценцом. Windows и macOS верзије **нису потписане кодом** — сертификати Apple Developer ID и Windows EV за потписивање кода коштају стотине долара годишње, које независни пројекат плаћа из сопственог џепа. Без тих потписа, Windows SmartScreen и macOS Gatekeeper ће вас упозорити при првом покретању. Упозорења значе *да ваш оперативни систем не препознаје издавача* — не значе да је Arroxy малвер.

Три начина да сами проверите Arroxy, по растућој строгости:

- **Прочитајте изворни код.** Свака линија је на [GitHub](https://github.com/antonio-orionus/Arroxy)-у и можете [изградити апликацију из изворног кода](#tech).
- **Проверите SHA256.** Упоредите свој фајл са објављеним [`SHA256SUMS`](../../releases/latest) — погледајте [Верификујте преузимање](#verify) испод.
- **Покрените скенирање треће стране.** Отпремите фајл на [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux: прво покретање</strong></summary>

AppImage-ови се покрећу директно — без инсталације. Само треба означити фајл као извршни.

**Менаџер фајлова:** кликните десним тастером на `.AppImage` → **Своjства** → **Дозволе** → омогућите **Дозволи извршавање фајла као програм**, затим двокликните.

**Терминал:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Ако покретање и даље не успе, покрените без монтирања — FUSE пакет није потребан:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Опционална интеграција са десктопом:** инсталирајте [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) једном, и свака AppImage коју двокликнете аутоматски се региструје у менију покретача — без ручног креирања `.desktop` фајлова.

**Обична архива (без FUSE, без инсталације):**

`.tar.gz` издање је иста апликација без AppImage омотача — распакујте било где и покрените. Без инсталатера и без FUSE пакета.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Linux преузимања на страници издања су само x86_64.** На ARM64 машинама (Raspberry Pi, Asahi Linux) Flatpak се инсталира, али не успева при покретању уз `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Верификујте преузимање (SHA256)</strong></summary>

Свако издање објављује `SHA256SUMS` фајл поред бинарних датотека. Да бисте проверили да ваше преузимање није оштећено или измењено у транзиту, хешујте свој фајл локално и упоредите га са линијом у `SHA256SUMS`. Отворите страницу најновијег издања → **Assets** → преузмите `SHA256SUMS`.

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

Желите скенирање малвера треће стране? Отпремите фајл на [VirusTotal](https://www.virustotal.com). Неколико генеричко-хеуристичких означавања од стране мањих машина је нормално за непотписане Electron апликације; масовна откривања од стране главних машина би представљала прави разлог за забринутост.

</details>

<details>
<summary><strong>📦 Windows: Инсталатер vs Преносиви</strong></summary>

|               | NSIS Инсталатер | Преносиви `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Потребна инсталација | Да  | Не — покрени са било ког места  |
| Аутоматска ажурирања | ✅ унутар апликације  | ❌ ручно преузимање  |
| Брзина покретања | ✅ брже  | ⚠️ спорије хладно покретање  |
| Додаје у Start мени |            ✅            |           ❌            |
| Лако деинсталирање |            ✅            | ❌ обришите фајл  |

**Препорука:** користите NSIS инсталатер за аутоматска ажурирања и брже покретање. Користите преносиви `.exe` за опцију без инсталације и регистра.

</details>

---

## <a id="why"></a>⚖️ Зашто Arroxy

Поређење са најчешћим алтернативама:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Уграђени прегледач (прегледање, пријава, преузимање) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Приватна видеа, видеа само за чланове и са старосним ограничењем без извоза колачића |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Бесплатно, без премијум нивоа |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Отворени код |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Само локална обрада |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Без ограничења употребе |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Кроссплатформна десктоп апликација |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Титлови + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = делимично или само у плаћеној верзији. Пријава унутар апликације за приватна видеа у 4K Video Downloader-у је плаћена функција; већина бесплатних GUI-ја за yt-dlp прихвата само фајл са колачићима или чита колачиће из вашег веб претраживача.

Arroxy је направљен за једну ствар: чист локални фајл, било да налепите URL или пронађете видео у Explore-у. Без додатне продаје, без прикупљања података.

### <a id="why-explore"></a>🧭 Шта обичан омотач за yt-dlp не може: картица Explore

Већина бесплатних YouTube преузимача је само поље за URL изнад yt-dlp-а. Arroxy такође користи yt-dlp, али има и **Explore**, прегледач уграђен у апликацију који отвара YouTube или било који други сајт. Explore заобилази ограничења са којима поље за URL не може да изађе на крај:

- **Видеа која захтевају налог, без извоза колачића** — приватна видеа, видеа само за чланове и видеа са старосним ограничењем (на налогу верификованом по узрасту), као и ваше листе „Гледај касније“ и „Свиђа ми се“, и видеа иза пријаве на другим сајтовима. Обичном омотачу треба извезени cookies.txt или мора да чита колачиће из вашег веб претраживача, што Chrome на Windows-у сада блокира. У Arroxy-ју се пријавите једном у Explore и он ради остало
- **„Пријавите се да потврдите да нисте бот“** — када YouTube ово затражи, Arroxy поново покушава преузимање са вашом Explore пријавом уместо да пријави грешку
- **YouTube-ов токен за преузимање** — уграђени прегледач у Arroxy-ју добија токен који YouTube очекује пре преузимања. Без њега YouTube може да понуди мање формата и нижи квалитет од траженог
- **Без копирања линкова** — пронађите видео, плејлисту или канал у Explore-у и преузмите га једним кликом, или кликните десним тастером на било који линк на страници
- **Блокатор огласа када вам затреба** — један клик на штит блокира огласе и трекере на страницама Explore-а

---

## <a id="privacy"></a>🔒 Приватност

Преузимања се преузимају директно преко [yt-dlp](https://github.com/yt-dlp/yt-dlp) са YouTube-а у фасциклу коју одаберете — ништа не пролази кроз сервер треће стране. Историја гледања, историја преузимања, URL-ови и садржај фајлова остају на вашем уређају.

Без телеметрије — само један анонимни сигнал дневно: верзија апликације, OS, језик, начин инсталације и земља, да бисмо могли да пребројимо активне кориснике. Без ID-ова, URL-ова, наслова видеа, путања датотека или података о налогу. Можете га искључити у Подешавањима.

Explore има сопствену пријаву, одвојену од вашег претраживача, а Arroxy никада не чита нити попуњава образац за пријаву — ви куцате на Google-овој страници. Преузимања иду без пријаве; само када једно не успе из разлога који налог може да реши, Arroxy поново чита пријаву, чува је у привременом фајлу за то преузимање и затим брише фајл. Одјава из Explore-а у Подешавањима је заборавља.

---

## <a id="faq"></a>❓ ЧПП

<details>
<summary><strong>Је ли заиста бесплатно?</strong></summary>

Да — MIT лиценца, без премијум нивоа, без ограничавања функција.

</details>

<details>
<summary><strong>По чему се Arroxy разликује од других GUI-ја за yt-dlp?</strong></summary>

Већина бесплатних GUI-ја за yt-dlp су омотачи који примају само линк. Arroxy додаје **Explore**, YouTube прегледач уграђен у апликацију: прегледате и преузимате без копирања линкова, а када се тамо једном пријавите, можете да преузимате приватна видеа, видеа само за чланове и са старосним ограничењем, као и листе „Гледај касније“ и „Свиђа ми се“, без извоза колачића. Arroxy користи ту пријаву када YouTube затражи да потврдите да нисте бот, а његов уграђени прегледач добија YouTube-ов токен за преузимање, па преузимања не спадају на мањи избор формата. Погледајте [Зашто Arroxy](#why).

</details>

<details>
<summary><strong>Које квалитете видеа могу да преузмем?</strong></summary>

Све што YouTube служи: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, плус само аудио. Токови са 60 fps и HDR задржавају се без измена, а преузимање корак по корак вам омогућава да за сваку резолуцију изаберете AV1, VP9 или H.264.

</details>

<details>
<summary><strong>Могу ли извући само аудио као MP3?</strong></summary>

Da. Izaberi *samo audio* u meniju formata, pa zatim MP3, M4A/AAC, Opus ili WAV.

</details>

<details>
<summary><strong>Како да преузмем видеа за која је потребан YouTube налог?</strong></summary>

Пријавите се једном у картици Explore. Arroxy тада може да преузима приватна видеа и видеа само за чланове које ваш налог може да гледа, видеа са старосним ограничењем ако је налог верификован по узрасту, као и ваше листе „Гледај касније“ и „Свиђа ми се“. Пријаву користи само када преузимање не успе из разлога који налог може да реши; све остало се преузима као и раније. То је опција **Explore пријава**, наведена прва и означена као „Препоручено“ у подешавањима колачића, а Arroxy је сам бира када први пут отворите Explore. Документација yt-dlp-а напомиње да [аутоматизација са пријављеним налогом може означити ваш Google налог](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), па је безбедније користити помоћни налог.

</details>

<details>
<summary><strong>Хоће ли наставити да ради кад YouTube нешто промени?</strong></summary>

yt-dlp се аутоматски ажурира при покретању, а Arroxy брзо испоручује исправке кад YouTube нешто промени. Када YouTube затражи да потврдите да нисте бот, Arroxy покушава и са вашом Explore пријавом ако сте се тамо пријавили, а колачићи из фајла или претраживача доступни су у подешавањима колачића.

</details>

<details>
<summary><strong>На којим је језицима Arroxy доступан?</strong></summary>

31 језика је доступно одмах: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy при првом покретању аутоматски препознаје језик оперативног система, а језик можеш променити у било ком тренутку преко бирача језика у траци са алаткама. Runtime locale JSON је у src/shared/i18n/locales/, а PO каталози за преводиоце су у i18n/locales/ — отвори PR на GitHub-у да допринесеш.

</details>

<details>
<summary><strong>Да ли треба да инсталирам нешто друго?</strong></summary>

Не. yt-dlp, ffmpeg и ffprobe се аутоматски преузимају при првом покретању и кеширају на вашем рачунару. Након тога није потребно додатно подешавање.

</details>

<details>
<summary><strong>Могу ли преузети плејлисте или целе канале?</strong></summary>

Да — обоје. Налепи playlist или channel URL (нпр. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); изабери колико entries да се скенира, па стави целу листу у queue или изабери појединачне видео снимке. Date-range filters стижу ускоро.

</details>

<details>
<summary><strong>macOS каже да је "апликација оштећена" — шта да радим?</strong></summary>

То је macOS Gatekeeper који блокира непотписану апликацију, а не стварно оштећење. Команде Terminal-а за уклањање quarantine-а и покретање Arroxy погледајте у [macOS first launch](#macos-first-launch).

</details>

<details>
<summary><strong>Да ли је преузимање YouTube видеа законито?</strong></summary>

За личну, приватну употребу то је углавном прихватљиво у већини јурисдикција. Ви сте одговорни за усклађеност са [Условима коришћења](https://www.youtube.com/t/terms) YouTube-а и локалним законима о ауторским правима.

</details>

---

## <a id="roadmap"></a>🗺️ Планови

И даље планирано — приближно по приоритету:

| Функционалност    | Опис    |
| ---------------- | ---------------- |
| **Филтери плејлисти и канала** | Date-range filters при набрајању playlist-а или channel-а |
| **Подешавања YouTube аудио трака** | Подесите жељену говорну језичку траку за целу апликацију, уз override по профилу када YouTube нуди више аудио трака |
| **Јаче recovery преко retry механизма** | Нова retry путања за преузимања прекинута непоузданом или проблематичном интернет везом |
| **Пун drawer менаџер преузимања** | Претворити queue drawer у потпунији менаџер, укључујући промену одредишних фасцикли за ставке у реду |
| **Заказана преузимања** | Покрените ред у одређено доба (ноћна покретања) |
| **AUR пакет** | Инсталација на Arch Linux и Omarchy помоћу `yay -S arroxy-bin` |

Имате функционалност на уму? [Отворите захтев](../../issues) — улаз заједнице обликује приоритет.

---

## <a id="support"></a>💖 Подржи Arroxy

Arroxy је бесплатан и под MIT лиценцом — без реклама, без телеметрије, без плаћене верзије. Ако ти штеди време, можеш подржати развој путем Bitcoin-а, Tron-а или Ethereum-а: адресе се налазе у [DONATE.md](DONATE.md), једином званичном извору за њих. Arroxy ти никада неће послати адресу имејлом или директном поруком. Звездица на репозиторијуму, пријаве грешака и побољшање превода помажу подједнако.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Израђено помоћу

<details>
<summary><strong>Стек технологија</strong></summary>

- **Electron** — кроссплатформна десктоп љуска
- **React 19** + **TypeScript** — кориснички интерфејс
- **Tailwind CSS v4** — стилизовање
- **Zustand** — управљање стањем
- **yt-dlp** + **ffmpeg** — машина за преузимање и мешање (оба се преузимају у runtime-у: yt-dlp се одржава ажурним, а ffmpeg/ffprobe се инсталирају једном и задржавају се током ажурирања)
- **Vite** + **electron-vite** — алати за изградњу
- **Vitest** + **Playwright** — јединични и end-to-end тестови

</details>

<details>
<summary><strong>Изградња из изворног кода</strong></summary>

### Предуслови — све платформе

| Алат    | Верзија | Инсталација |
| ------- | ------- | ----------- |
| Git     | било која | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` или `.node-version` |
| Bun     | 1.4.2  | `mise install` или `package.json` `packageManager` |

Препоручено: инсталирајте `mise`, затим покрените `mise install` у checkout-у. Без mise-а, ручно активирајте Node.js из `.node-version` и Bun из `package.json` пре `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools и Python могу бити потребни за нативне rebuild-ове.

### macOS

```bash
brew install mise
xcode-select --install
```

После клонирања, покрените `mise trust && mise install` у checkout-у. Ако ваш shell већ користи `fnm`, `nvm` или Bun из Homebrew-а, активирајте mise у `~/.zshrc` како би Arroxy користио Node.js 24.21.0 и Bun 1.4.2:

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

# Зависности за build и Electron runtime
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Клонирање и покретање

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # препоручено; прескочите ако су pinned алати ручно активирани
bun run bootstrap
bun run doctor
bun run dev            # Electron апликација са Vite renderer-ом
```

### Изградња дистрибутивне верзије

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # пакетирање Windows циљева на подржаном хосту
```

> `bun run bootstrap` инсталира зависности, поново гради зависности Electron апликације, проверава Electron, припрема уграђене ffmpeg/ffprobe за развој и инсталира Playwright Chromium. Release верзије у runtime-у управљају алатима yt-dlp, ffmpeg и ffprobe у фасцикли података апликације; ниједан од њих није укључен у инсталер.

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

## 📜 Услови коришћења

Arroxy је алат искључиво за личну, приватну употребу. Ви сте искључиво одговорни за осигурање да ваша преузимања буду у складу са [Условима коришћења](https://www.youtube.com/t/terms) YouTube-а и законима о ауторским правима у вашој јурисдикцији. Немојте користити Arroxy за преузимање, репродукцију или дистрибуцију садржаја за који немате право коришћења. Програмери нису одговорни за злоупотребу.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT Лиценца · Са пажњом израдио <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
