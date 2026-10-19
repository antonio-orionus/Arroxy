<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="د Arroxy ماسکوټ" width="180" />

# Arroxy — د Windows، macOS او Linux لپاره وړیا خلاصه سرچینه YouTube (+ ۲۰۰۰ سایټونه) ډاونلوډر، د جوړ شوي براوزر سره

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**پدې ژبه ولولئ:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · **پښتو** · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![خپرونه](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![جوړونه](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![ویب پاڼه](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![جواز](https://img.shields.io/badge/license-MIT-green) ![پلیټفارمونه](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![ژبې](https://img.shields.io/badge/i18n-31_languages-blue)

له **YouTube او ۲۰۰۰+ ملاتړ شویو سایټونو** نه ویډیوګانې، Shorts، موسیقي، چینلونه، پوډکاسټونه، یا اوډیو ټریکونه ډاونلوډ کړئ — تر 8K HDR پورې د 60 fps سره، د MP3 / AAC / Opus په توګه، یا یوازې هغه برخه چې ورته اړتیا لرئ. په Explore ټب کې **په Arroxy کې YouTube یا بل هر سایټ وګورئ** او هغه ویډیو، playlist یا چینل ډاونلوډ کړئ چې تاسو یې ګورئ؛ هلته sign in وکړئ ترڅو هغه شخصي، یوازې د غړو او د عمر محدودیت لرونکې ویډیوګانې ډاونلوډ کړئ چې ستاسو اکاونټ یې لیدلی شي. د Windows، macOS، او Linux پر سیستم ځایي چلیږي. **هیڅ اعلانات، هیڅ بلوټ، هیڅ اضافي پلورنه نه ده.**

[**↓ وروستۍ خپرونه ډاونلوډ کړئ**](#install) &nbsp;·&nbsp; [**ویب پاڼه**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows لومړی پیل](#windows-first-launch) · [macOS لومړی پیل](#macos-first-launch) · [Linux لومړی پیل](#linux-first-launch)

[![د Discord ټولنې سره یوځای شئ](https://img.shields.io/badge/%D8%AF%20Discord%20%D9%BC%D9%88%D9%84%D9%86%DB%90%20%D8%B3%D8%B1%D9%87%20%DB%8C%D9%88%DA%81%D8%A7%DB%8C%20%D8%B4%D8%A6-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

که Arroxy ستاسو وخت خوندي کوي، یو ⭐ نورو سره مرسته کوي چې ومومي.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## منځپانګه

- [✨ ځانګړتیاوې](#features)
- [📥 نصب او لومړی پیل](#install)
  - [Windows لومړی پیل](#windows-first-launch)
  - [macOS لومړی پیل](#macos-first-launch)
  - [ولې ممکن خبرداری وګورئ](#why-warning)
  - [Linux لومړی پیل](#linux-first-launch)
  - [خپل ډاونلوډ تصدیق کړئ (SHA256)](#verify)
- [⚖️ ولې Arroxy](#why)
- [🔒 محرمیت](#privacy)
- [❓ مکرر پوښتنې](#faq)
- [🗺️ د پرمختیا لار](#roadmap)
- [💖 Arroxy ملاتړ وکړئ](#support)
- [🛠️ د جوړولو ټیکنالوژي](#tech)

---

## <a id="features"></a>✨ ځانګړتیاوې

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>په Arroxy کې YouTube یا بل هر سایټ وګورئ او اوسنۍ پاڼه د خپل فعال پروفایل سره ډاونلوډ کړئ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>د Explore لومړی سکرین</b><br/>Explore ته یوه ګړندۍ کتنه، او ولې دوهم اکاونټ خوندي sign in دی</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ډاونلوډونه درته وايي څه ستاسو سره اړتیا لري</b><br/>لینکونه په شاليد کې چمتو کېږي؛ ناکام لینک حل وړاندې کوي، اوږد playlist ستاسو انتخاب ته انتظار باسي</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>د ویډیو یوازې یوه برخه ډاونلوډ کړئ</b><br/>پیل او پای، یا یو فصل وټاکئ — Arroxy یوازې همدا برخه ساتي</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>د پروفایل مدیر</b><br/>یو پروفایل برابر کړئ: د فایل ډول، ریزولیشن، فرعي سرلیکونه، منزل، د فایل نوم کينه او نور</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>تور یا روښانه، شیشه‌ای یا ساده</b><br/>د ټاکلو لپاره څلور بڼې: په خوځنده اسمان د شیشې پینلونه یا آرام ساده سطحې، هره یوه په تور او روښانه حالت کې</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="د Arroxy عمومي د ډاونلوډ هاټکي — په Windows او Linux کې Ctrl+Shift+D، په macOS کې Cmd+Shift+D، کاپي شوی لینک مستقیم د ډاونلوډ کتار ته لېږي" width="760" /></picture><br/><sub><b>عمومي د ډاونلوډ هاټکي</b><br/>هر چېرې لینک کاپي کړئ، یو ځل کېکاږئ — کتار ته ننوځي او ډاونلوډ پیلېږي</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>د پلی‌لېست د هر توکي پروفایل</b><br/>هر ویډیو ته خپل پروفایل ورکړئ — ځینې په 4K کې خوندي کړئ، پاتې یې د MP3 په توګه واخلئ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>د چټک ښکته کولو کور</b><br/>URL پیسټ کړئ او په خپل فعال پروفایل سره یې سمدلاسه ښکته کړئ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>د بیا کارونې وړ د ښکته کولو پروفایلونه</b><br/>بڼه، کیفیت او محصول د وړاندیز په توګه خوندي کړئ — په هر ښکته کولو کې یې بیا وکاروئ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>څو ژبني غږ مزي</b><br/>هغه دقیق غږ ژبه وټاکئ چې ویډیو یې لري</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround / Dolby غږ</b><br/>د 5.1 او Dolby مزي پیژندل کیږي او ساتل کیږي</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>د ډله ییز URL حالت</b><br/>لیست پیسټ کړئ، په اتومات ډول نقلونه لرې کړئ، ټول یې په یوه وخت کې کتار کړئ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>موازي د ښکته کولو کتار</b><br/>د ژوندۍ پرمختیا سره په یوه وخت کې څو ښکته کول</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: په Arroxy کې ویب وګورئ</strong></summary>

- **Explore ټب** — د Arroxy په دننه کې YouTube یا بل هر سایټ وګورئ او هغه څه چې مومئ پرته له لینکونو کاپي کولو ډاونلوډ یې کړئ. **ډاونلوډ · *ستاسو پروفایل*** هغه ویډیو، playlist یا چینل په قطار کې اچوي چې تاسو یې ګورئ؛ د هغې تر څنګ تیر پروفایلونه بدلوي، او جادویي لرګی د فارمټونو، ساب ټایټلونو او نورو د ټاکلو لپاره ګام په ګام ډاونلوډ پرانیزي
- **د ډاونلوډ لپاره ښي کلیک** — په Explore کې د هرې ویډیو، playlist یا چینل په لینک ښي کلیک وکړئ چې د خپل پروفایل سره یې ډاونلوډ کړئ، له **په پروفایل ډاونلوډ** څخه بل پروفایل وټاکئ، ګام په ګام ډاونلوډ پرانیزئ، یا لینک کاپي کړئ. اړتیا نشته چې لومړی هره ویډیو پرانیزئ
- **کمپیکټ ترتیب** — د Explore په وسیلو پټه کې یو کلیک د Arroxy ټبونه همدې ته راوړي او پاڼې ته ډېر ځای ورکوي
- **د پتې پټه** — د YouTube د لټون لپاره ټایپ کړئ، یا کومه هم ویب پته ولیکئ ترڅو هغه سایټ پرانیزي
- **هغه ډاونلوډونه چې اکاونټ ته اړتیا لري** — په Explore کې یو ځل sign in وکړئ او Arroxy کولی شي هغه شخصي او یوازې د غړو ویډیوګانې ډاونلوډ کړي چې ستاسو اکاونټ یې لیدلی شي، د عمر محدودیت لرونکې ویډیوګانې که اکاونټ د عمر لپاره تایید شوی وي، او ستاسو Watch Later او Liked لیستونه. په نورو سایټونو کې هم هلته sign in وکړئ، او د هغوی ډاونلوډونه هغه sign in کاروي کله چې ورته اړتیا وي. Arroxy لا هم لومړی له sign in پرته ډاونلوډ کوي او ستاسو Explore sign in یوازې هغه وخت کاروي چې ډاونلوډ په داسې ډول ناکام شي چې اکاونټ یې سمولی شي. کله چې YouTube وغواړي تاسو تایید کړئ چې bot نه یاست، Arroxy ستاسو Explore sign in هم هڅوي
- **دوهم اکاونټ وکاروئ** — د Explore لومړی سکرین دلیل بیانوي: د اکاونټ سره ډاونلوډ کول د هغه اکاونټ د محدودېدو یو څه خطر لري. کله چې غواړئ ټول sign in هېر شي، له Settings څخه له Explore sign out وکړئ
- **د اعلان بلاکر** — په ډیفالټ بند دی. د Explore په toolbar کې په shield یو click د هغه په پاڼو کې اعلانونه او ټریکرونه بلاک کوي، پرته له دې چې ډاونلوډونه اغېزمن کړي. YouTube کېدای شي د sign in شویو اکاونټونو لپاره د اعلان بلاکرونو پروړاندې مقاومت وکړي

</details>

<details>
<summary><strong>🎞️ کیفیت او بڼه</strong></summary>

- تر **8K (4320p)** پورې، 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p
- **لوړ فریم نرخ او HDR** لکه چې دي ساتل کیږي — 60 fps، HDR10
- **آډیو** — یوازې آډیو MP3، M4A/AAC، Opus یا WAV ته صادر کړئ. په تعاملي ډاونلوډونو کې، که موجود وي، د سرچینې اصلي surround/Dolby ټرېکونه (AC-3، E-AC-3، 5.1، DRC) وټاکئ، یا نړیوال تلواله **surround / Dolby ته لومړیتوب ورکړئ** وټاکئ
- **د موخې سره پروفایلونه** — *غوره انځور* (AV1 · VP9) یا *سمارټ TV* (MP4 · H.264)، د اتوماتیک، MP4، MKV یا WebM په توګه پرته له بیا کوډ کولو خوندي کیږي. HDR *اتوماتیک* دی (یوازې کله چې ستاسو پرده یې وښيي)، *SDR*، یا *HDR*
- **په هر ریزولوشن کې هر کوډیک** — ګام په ګام ډاونلوډ په هر ریزولوشن کې AV1، VP9 او H.264 څنګ په څنګ ښيي، ترڅو هغه وټاکئ چې ستاسو TV یا اډیټر یې چلوي
- **پوه شئ چې سټریم په رښتیا څه دی** — هغه اندازې چې YouTube د AI په مرسته لویې کړې، د AI په مرسته ډوب شوې اوډیو ژبې، ښه شوي بټ ریټ لرونکي سټریمونه، 360° ویډیوګانې او زیانمنې یا واټرمارک لرونکې کاپۍ نښه کېږي. پروفایلونه د AI په مرسته لوی شوي سټریمونه پرېږدي، مګر دا چې تاسو یې اجازه ورکړئ

</details>

<details>
<summary><strong>🛡️ محرمیت او کنټرول</strong></summary>

- ۱۰۰٪ ځایني پروسس کول — ډاونلوډونه مستقیما له YouTube څخه ستاسو ډیسک ته ځي
- هیڅ ننوتل، هیڅ کوکیز، هیڅ د ګوګل اکاونټ لینک نه دی
- فایلونه مستقیما هغه فولډر ته خوندي کیږي چې تاسو انتخاب کوئ

</details>

<details>
<summary><strong>⚡ کاري جریان</strong></summary>

- **عمومي د ډاونلوډ هاټکي** — په هره اپلیکیشن کې یو لینک کاپي کړئ او `Ctrl+Shift+D` (په macOS کې `Cmd+Shift+D`) کېکاږئ؛ Arroxy یې پرته له دې چې کړکۍ پرانیزي ستاسو فعال پروفایل سره په کتار کې ورزیاتوي او یوه خبرتیا یې تاییدوي. په ډیفالټ ډول فعال، بیا ټاکل کېدونکی
- **انعطاف منونکي د پیل حالتونه** — لارښود شوی واحد ډاونلوډ، د playlist/channel ټاکونکی، د bulk URL پیسټ، د خوندي شوو defaultونو سره Quick Download، یا له Explore څخه کتل او ډاونلوډ وټاکئ
- **مرکزي ډاونلوډ قطار** — هر single، playlist، bulk، یا quick کار د پرمختګ، pause، resume، cancel، retry، او priority کنټرول لپاره یوه ځای ته راځي
- **د کلپبورډ لیدل** — د ویډیو لینک کاپي کړئ او کله چې Arroxy ته بېرته راشئ د URL ساحه ډکوي، او که مو مطلب نه و **بېرته راګرځول** وکاروئ. کله چې Arroxy بوخت وي، لینک تر هغه انتظار کوي چې د URL ټب ته بېرته راشئ (په امستنو کې یې بند کړئ)
- **د URL اتوماتیک پاکول** — د تعقیب پیرامیترونه (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) لرې کوي او `youtube.com/redirect` لینکونه پرانیستي
- **د ټرې حالت** — د کړکۍ بندول ډاونلوډونه شالید کې روان ساتي
- **31 ژبې** — د سیسټم ژبه په اتومات ډول پېژني، هر وخت بدلول کېدای شي
- **د پلی‌لېست همغږي** — پلی‌لېست له ځایي فولډر سره بیا ګوري تر څو مخکې ډاونلوډ شوې ویډیوګانې پرېږدي؛ د `.m3u` پلی‌لېست فایل جوړوي چې د هرې ویډیو په ډاونلوډ سره تازه کېږي
- **د سرعت او pacing کنټرولونه** — د ډاونلوډ bandwidth محدود کړئ، وټاکئ چې د ویډیو څو برخې په یو وخت کې ډاونلوډ شي، او د requests تر منځ ځنډونه د presets (*بند · متوازن · محتاط · دودیز*) سره زیات کړئ
- **د دوتنې نوم بېلګې** — د `{title}`، `{uploader}`، `{id}`، `{date}`، `{resolution}` او `{playlist_index}` په مرسته خپل ښکته کول د خپلې خوښې سره سم ونوموئ، ټولیز یا د هر ښکته کولو پروفایل لپاره
- **یو ځای ډاونلوډونه او اتوماتیک بیا هڅه** — وټاکئ چې د کتار څو ډاونلوډونه په یو وخت کې روان وي، او هغه ډاونلوډ چې د شبکې یا سرور ستونزه ورسره پیښه شوې وي، Arroxy د هرې هڅې دمخه اوږد انتظار سره بیا هڅه وکړي
- **د پلی‌لېست د هر توکي لپاره پروفایل** — د ټول لیست لپاره یوه ترتیب پرځای، د پلی‌لېست هر ویډیو ته خپل ډاونلوډ پروفایل وټاکئ، ترڅو یو پړاو کې ځینې په بشپړ کیفیت خوندي شي او پاتې یې د MP3 په توګه واخیستل شي
- **Quick Download په شاليد کې کار کوي** — لینک سمدستي په ډاونلوډونو کې ښکاري او هلته چمتو کېږي، د **View** سره یوه یادښت دا تاییدوي، او د URL ساحه د راتلونکي لینک لپاره پاکېږي. کله چې پخواني چمتو کېږي، لکه څومره چې غواړئ پیل یې کړئ
- **ډاونلوډونه درته وايي څه ستاسو سره اړتیا لري** — که Arroxy یو لینک ونه لوستلی شي، د هغه کتار دلیل وايي او حل وړاندې کوي: بیا هڅه، کوکیز فعالول، یا په Explore کې sign in. کله چې کوکیز بند وي، **له Explore سره sign in** وروسته له دې چې تاسو sign in وکړئ، دا بیا درته هڅوي. هغه playlist چې ستاسو د بارولو حد څخه اوږد وي په خپل کتار کې انتظار کوي چې تاسو ټول، لومړني، یا بیاکتنه وټاکئ. د ډاونلوډونو ټب هغه کتارونه شمېري چې ستاسو انتظار باسي
- **د ویډیو یوازې یوه برخه ډاونلوډ کړئ** — د بڼې په پردې کې پیل او پای، یا یو فصل وټاکئ او Arroxy یوازې همدا بریدونه ساتي، او د ویډیو id وروسته یې په نوم کې اضافه کوي. پرې کول نږدې کیفریم ته رسېږي؛ دقیق پرې کول چالان کړئ ترڅو پرځای یې بیا کوډ شي
- **بشپړ شوي ډاونلوډونه په اتوماتيک ډول لرې کړئ** — اختیاري: بشپړ شوی ډاونلوډ 5 ثانیې وروسته له لیست څخه وځي. فایلونه یې په ډیسک کې پاتې کیږي، او ناکام ډاونلوډونه په لیست کې پاتې کیږي
- **په ډاونلوډونو کې اندازه او ورک** — د ترتیبولو وړ **اندازه** ستون ښيي چې هر ډاونلوډ څومره ځای نیسي، او **ورک** هغه فایلونه په نښه کوي چې د Arroxy بهر حرکت یا ړنګ شوي
- **اورورا یا ساده، تیاره یا روښانه** — د حرکت کوونکي اسمان پر سر شیشه‌ایي پینلونه، یا آرام ټینګې سطحې؛ له فوټر څخه یې بدل کړئ. هغه کمپیوټرونه چې ګرافیک ګړندیتوب نلري په اتوماتيک ډول ساده ترلاسه کوي
- **د Mac مینو بار** — په macOS کې له مینو بار څخه امستنې (`Cmd+,`) پرانیزئ، د ډاونلوډ سرعت حد وټاکئ، ډول او تم بدل کړئ، او لاګونه پرانیزئ یا د تشخیص فایل خوندي کړئ
- **له هر ډاونلوډ څخه پروفایل بدل کړئ** — یو ډاونلوډ سم کړئ، بیا هغه پروفایل تازه کړئ چې ترې پیل شوی و (د بدلونونو د مخکتنې سره) یا امستنې د نوي پروفایل په توګه خوندي کړئ. د پروفایل بدلول پوښتنه کوي چې ستاسو سمونونه وساتل شي که نه

</details>

<details>
<summary><strong>📝 ساب ټایټلونه او د پروسس کولو وروسته</strong></summary>

- **ساب ټایټلونه** د SRT، VTT، یا ASS کې — لاسي یا اتوماتیک جوړ شوي، د هر شته ژبې کې
- د ویډیو تر څنګ خوندي کړئ، `.mkv` کې ځای پر ځای کړئ، یا د `Subtitles/` فرعي فولډر کې سازمان ورکړئ
- **یوازې د ژباړلیکونو ډله** — د URL لیست پیسټ کړئ یا پلې لیست خلاص کړئ، ژباړلیکونه غوره کړئ، او د هرې ویډیو لپاره یوازې د ژباړلیک فایلونه ترلاسه کړئ
- **SponsorBlock** — سپانسران، شمولې، وتلو، ځان-سپارښتنې پریږدئ یا د فصل نښه ورکړئ
- **ځای پر ځای شوي میټاډاټا** — سرلیک، د اپلوډ نیټه، چینل، توضیح، تصویر، او د فصل نښانونه فایل ته لیکل کیږي

</details>

<details>
<summary><strong>🌐 YouTube + ۲۰۰۰ سایټونه</strong></summary>

- **YouTube، بشپړ** — Videos، Shorts، Channels، Playlists، YouTube Music، او Podcasts د لومړي ټولګي سرچینو په توګه اداره کیږي
- **۲۰۰۰+ نور سایټونه** د yt-dlp له لارې — Twitch، TikTok، Dailymotion، VK، SoundCloud، Bandcamp، Bilibili، archive.org، Streamable، او ډیر نور
- **یوازې اوډیو او ساب ټایټلونه** د هر ملاتړ شوي سایټ پر مهال کار کوي، نه یوازې YouTube
- که یو سایټ بدل شي، yt-dlp اونیزه فکسونه لیږدوي او Arroxy د پیلولو پر مهال بائنري اوتومات تازه کوي

</details>

---

## <a id="install"></a>📥 نصب او لومړی پیل

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

جوړښتونه یوازې د x86_64 لپاره دي. `curl` نشته؟ `curl -fsSL` په `wget -qO-` بدل کړئ.

| پلیټفارم | بڼه |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**وروستۍ خپرونه واخلئ →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows لومړی پیل</strong></summary>

د لومړي پیلولو پر مهال ممکن وګورئ **"Windows protected your PC"** یا **"Unknown publisher."** دا د دواړو `Arroxy-win-x64-Setup.exe` او `Arroxy-win-x64-Portable.exe` پر لور پلي کیږي. Arroxy وړیا او خلاصه سرچینه ده او د Windows جوړونې د پیسو ورکولو سند سره کوډ لاسلیک شوي نه دي، له همدې امله SmartScreen یې بیرغ کوي. دا **اوتومات** معنی نه لري چې Arroxy خطرناک ده. د دوام لپاره:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" د "More info" لینک د روښانه کولو سره ډیالوګ" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen د More info پراخولو وروسته ډیالوګ، د "Run anyway" تڼۍ ښودلو سره" />
</div>

1. **More info** کلیک کړئ.
2. **Run anyway** کلیک کړئ.

#### که Windows Defender فایل بیرغ کوي یا لرې کوي

د Defender د اټکل کولو میکانیزمونه ځینې وختونه بې لاسلیکه NSIS نصب کوونکي او Electron پورټیبل د شکمن وګڼي. که Defender `Arroxy-win-x64-Setup.exe` یا `Arroxy-win-x64-Portable.exe` قرنطین کوي، له **Windows Security → Virus & threat protection → Protection history** بیرته راولئ، بیا د Arroxy اجرایوي د مجاز توکي تحت **Manage settings → Add or remove exclusions** ووهئ. لکه SmartScreen، محرک د غیر موجوده خپرندې لاسلیک دی، نه کشف شوی malware.

> یوازې د رسمي GitHub Releases پاڼې نه Arroxy ډاونلوډ کړئ. که چیرې تاسو فایل د بل ویب پاڼې نه ترلاسه کولو وي یا چا درته لیږلی وي، هغه حذف کړئ او د رسمي سرچینې نه نوي نسخه ډاونلوډ کړئ. سرچینه کوډ عامه ده، نو که چیرې غواړئ کولی شئ پخپله یې وڅیړئ یا Arroxy جوړ کړئ.

Scoop غوره ګڼئ؟ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS لومړی پیل</strong></summary>

Arroxy لاهم د macOS لپاره کوډ لاسلیک شوی نه دی، نو Gatekeeper ښايي له DMG څخه د نصب وروسته وېرونکی *"Arroxy.app is damaged and can't be opened"* ډیالوګ وښيي. دا پیغام مانا لري چې macOS بې لاسلیکه app quarantine کړی؛ دا مانا نه لري چې د app فایلونه رښتیا خراب دي. په اوسني macOS کې باوري حل Terminal دی:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. د نصب شوي DMG نه `Arroxy.app` د `/Applications` ته ډریګ کړئ.
2. Terminal پرانیزئ او دا دوه قوماندې وچلوئ:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

لومړۍ قومانده ستاسو د نصب شوي Arroxy له نسخې څخه quarantine attribute لرې کوي. دویمه app پیلوي. `sudo` ښايي ستاسو د Mac پاسورډ وغواړي؛ Terminal د لیکلو پر وخت حروف نه ښيي.

**Apple Silicon د Intel پرتله:** پر M-series Mac (M1 / M2 / M3 / M4)، `arm64` DMG ډاونلوډ کړئ. پر Intel Mac، `x64` DMG ډاونلوډ کړئ. د غلط جوړونې چلول د Rosetta له لارې لاهم کار کوي خو د پام وړ ورو دي.

> د macOS جوړونه د Apple Silicon او Intel رنرانو پر CI کیږي. که تاسو ستونزو سره مخ شئ، مهرباني وکړئ [یوه ستونزه خلاصه کړئ](../../issues) — د macOS کارونکو بازخورد فعاله د macOS ازموینې دورې بڼه ورکوي.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ ولې ممکن خبرداری وګورئ</strong></summary>

Arroxy خلاصه سرچینه او MIT-licensed ده. د Windows او macOS جوړونې **د کوډ لاسلیک شوي نه دي** — د Apple Developer ID او د Windows EV د کوډ لاسلیک کولو سندونه هر کال د سلو ډالرو لګښت لري، چې یو خپلواک پروژه له خپل ځان ادا کوي. پرته له هغو لاسلیکونو، د Windows SmartScreen او macOS Gatekeeper به تاسو ته د لومړي پیل پر مهال خبرداری درکوي. خبرداریونه دا معنی لري چې *ستاسو OS خپرنده نه پیژني* — دا معنی نه لري چې Arroxy malware دی.

درې طریقې چې پخپله Arroxy تصدیق کړئ، د لوړیدونکي دقت سره:

- **سرچینه ولولئ.** هره کرښه پر [GitHub](https://github.com/antonio-orionus/Arroxy) ده او تاسو کولی شئ [له سرچینې جوړ کړئ](#tech).
- **SHA256 وڅیړئ.** ستاسو فایل د خپور شوي [`SHA256SUMS`](../../releases/latest) سره سمول کړئ — لاندې [خپل ډاونلوډ تصدیق کړئ](#verify) وګورئ.
- **د دریمې ډلې سکن چلوئ.** فایل [VirusTotal](https://www.virustotal.com) ته اپلوډ کړئ.

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux لومړی پیل</strong></summary>

AppImages مستقیم چلیږي — هیڅ نصب کول نشته. تاسو یوازې اړتیا لرئ فایل د اجرا وړ نښه کړئ.

**د فایل مدیر:** د `.AppImage` ښي کلیک وکړئ → **Properties** → **Permissions** → **Allow executing file as program** فعال کړئ، بیا دوه ځله کلیک وکړئ.

**ټرمینل:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

که بیا هم پیل نه شي، هغه پرته له ماونټ کولو چل کړئ — د FUSE کڅوړې ته اړتیا نشته:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**د ډیسکټاپ اختیاري یوځای کول:** یو ځل [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) نصب کړئ، او هر AppImage چې تاسو دوه ځله کلیک کوئ اتوماتیک ستاسو د لانچر مینو کې ثبتیږي — هیڅ لاسي `.desktop` فایل ته اړتیا نشته.

**ساده تاربال (نه FUSE، نه انسټال):**

د `.tar.gz` بیلډ همغه اپلیکیشن دی خو د AppImage پوښ پرته — هر چیرې یې استخراج کړئ او چل یې کړئ. نه انسټالر پکار دی او نه د FUSE کڅوړه.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**د خپرونې پاڼې د لینکس ډاونلوډونه یوازې x86_64 دي.** په ARM64 ماشینونو (Raspberry Pi، Asahi Linux) کې Flatpak انسټالېږي خو د پیل پر مهال د `bwrap: execvp ldconfig: Exec format error` سره ناکامېږي.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 خپل ډاونلوډ تصدیق کړئ (SHA256)</strong></summary>

هره خپرونه د binary سره یوځای `SHA256SUMS` فایل خپروي. د دې لپاره چې ستاسو ډاونلوډ د لیږد پر مهال خراب یا لاسوهنه شوی نه دی، خپل فایل ځایي کشف کړئ او د `SHA256SUMS` کرښه سره یې سمول کړئ. د وروستۍ خپرونې پاڼه خلاص کړئ → **Assets** → `SHA256SUMS` ډاونلوډ کړئ.

**Windows (PowerShell یا Command Prompt):**

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

د دریمې ډلې malware سکن غواړئ؟ فایل [VirusTotal](https://www.virustotal.com) کې اپلوډ کړئ. د کوچنیو انجنونو لخوا د عمومي اټکل کولو بیرغونه لږ شمیر د بې لاسلیکه Electron اپلیکیشنونو لپاره نورمال دي؛ د لوی انجنونو لخوا پراخه کشف کول به واقعي اندیښنه وي.

</details>

<details>
<summary><strong>📦 Windows: نصب کوونکی د پورټیبل پرتله</strong></summary>

|               | NSIS نصب کوونکی | پورټیبل `.exe` |
| ------------- | :----------------------: | :---------------------: |
| نصب کولو ته اړتیا ده | هو  | نه — له هر ځای چلیږي  |
| اتوماتیک تازه کول | ✅ د اپ دننه  | ❌ لاسي ډاونلوډ  |
| د پیل سرعت | ✅ ګړندي  | ⚠️ ورو سړه پیل  |
| د پیل مینو ته اضافه کوي |            ✅            |           ❌            |
| اسانه لرې کول |            ✅            | ❌ فایل حذف کړئ  |

**سپارښتنه:** د اتوماتیک تازه کولو او ګړندي پیل لپاره د NSIS نصب کوونکی وکاروئ. د بې نصبه، بې ریجسټرۍ اختیار لپاره پورټیبل `.exe` وکاروئ.

</details>

---

## <a id="why"></a>⚖️ ولې Arroxy

د ترټولو عام بدیلونو سره د اړخ پر اړخ پرتله:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| د اپلیکیشن دننه browser (کتل، sign in، ډاونلوډ) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| شخصي، یوازې د غړو او د عمر محدودیت لرونکې ویډیوګانې پرته له دې چې کوکیز صادر کړئ |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| وړیا، هیڅ پریمیم کچه نشته |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| خلاصه سرچینه |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| یوازې ځایي پروسس کول |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| هیڅ د کارولو سقف نشته |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| کراس-پلیټفارم ډیسکټاپ اپلیکیشن |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| ساب ټایټلونه + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = تر یوه حده، یا یوازې په پیسو پلان کې. په 4K Video Downloader کې د شخصي ویډیوګانو لپاره د اپلیکیشن دننه sign in پیسو ته اړتیا لري؛ ډېری وړیا yt-dlp GUIs یوازې د کوکیز فایل مني یا ستاسو د ویب browser کوکیز لولي.

Arroxy د یوه کار لپاره جوړ شوی: یو پاک ځایي فایل، که URL پیسټ کړئ او که ویډیو په Explore کې ومومئ. هیڅ اضافي پلورنه، هیڅ د معلوماتو راټولونه.

### <a id="why-explore"></a>🧭 هغه څه چې ساده yt-dlp wrapper یې نشي کولی: د Explore ټب

ډېری وړیا YouTube ډاونلوډرونه د yt-dlp پر سر یوازې د URL یوه خانه ده. Arroxy هم yt-dlp کاروي، خو **Explore** هم لري، د اپلیکیشن دننه جوړ شوی browser چې YouTube یا بل هر سایټ پرانیزي. Explore هغه محدودیتونه تېروي چې د URL خانه یې نشي تېرولی:

- **هغه ویډیوګانې چې اکاونټ ته اړتیا لري، پرته له کوکیز صادرولو** — شخصي، یوازې د غړو، او د عمر محدودیت لرونکې ویډیوګانې (په هغه اکاونټ چې عمر یې تایید شوی وي)، او ستاسو Watch Later او Liked لیستونه، او په نورو سایټونو کې هغه ویډیوګانې چې sign in ته اړتیا لري. ساده wrapper د cookies.txt صادر شوي فایل ته اړتیا لري یا باید ستاسو د ویب browser کوکیز ولولي، چې Chrome یې اوس په Windows کې بندوي. په Arroxy کې تاسو یو ځل په Explore کې sign in کوئ او پاتې کار پخپله کوي
- **"sign in وکړئ چې تایید کړئ bot نه یاست"** — کله چې YouTube دا وپوښتي، Arroxy د ناکامېدو پر ځای ډاونلوډ ستاسو د Explore sign in سره بیا هڅوي
- **د YouTube د ډاونلوډ ټوکن** — د Arroxy دننه browser هغه ټوکن ترلاسه کوي چې YouTube یې له ډاونلوډ مخکې تمه لري. پرته له هغه، YouTube کېدای شي له هغه څه چې تاسو غوښتي لږ فارمټونه او ټیټ کیفیت درکړي
- **د لینکونو کاپي کولو ته اړتیا نشته** — په Explore کې یوه ویډیو، playlist یا چینل ومومئ او په یو کلیک یې ډاونلوډ کړئ، یا په پاڼه کې په هر لینک ښي کلیک وکړئ
- **اعلان بلاکر کله چې یې وغواړئ** — په shield یو click د Explore په پاڼو کې اعلانونه او ټریکرونه بلاک کوي

---

## <a id="privacy"></a>🔒 محرمیت

ډاونلوډونه مستقیما د [yt-dlp](https://github.com/yt-dlp/yt-dlp) له لارې له YouTube څخه هغه فولډر ته راوړل کیږي چې تاسو انتخاب کوئ — هیڅ شی د دریمې ډلې سرور له لارې نه تیریږي. د لیدلو تاریخ، ډاونلوډ تاریخ، URL، او د فایل منځپانګه ستاسو وسیله کې پاتې کیږي.

هیڅ ټیلیمیټري نشته — په ورځ کې یوازې یو ناپیژندلی سیګنال: د اپ نسخه، OS، ژبه، د نصب چینل او هېواد، ترڅو موږ فعال کاروونکي وشمېرو. هیڅ ID، URLs، د ویډیو سرلیکونه، د فایل لارې یا د اکاونټ معلومات نشته. تاسو یې په Settings کې بندولی شئ.

Explore خپل sign in ساتي، ستاسو له browser جلا، او Arroxy هیڅکله د sign in فورمه نه لولي او نه یې ډکوي — تاسو د Google په خپله پاڼه کې ټایپ کوئ. ډاونلوډونه له sign in پرته چلېږي؛ یوازې کله چې یو ډاونلوډ په داسې ډول ناکام شي چې اکاونټ یې سمولی شي، Arroxy sign in بیا لولي، د هغه ډاونلوډ لپاره یې په موقت فایل کې ساتي، او وروسته فایل ړنګوي. په Settings کې له Explore څخه sign out دا هېروي.

---

## <a id="faq"></a>❓ مکرر پوښتنې

<details>
<summary><strong>ایا دا واقعیا وړیا ده؟</strong></summary>

هو — د MIT جواز، هیڅ پریمیم کچه، هیڅ د ځانګړتیا محدودیت نشته.

</details>

<details>
<summary><strong>Arroxy له نورو yt-dlp GUIs څخه څه توپیر لري؟</strong></summary>

ډېری وړیا yt-dlp GUIs داسې wrappers دي چې یوازې لینک اخلي. Arroxy **Explore** ورزیاتوي، د اپلیکیشن دننه جوړ شوی YouTube browser: تاسو پرته له لینکونو کاپي کولو ګورئ او ډاونلوډ کوئ، او هلته یو ځل sign in کوئ ترڅو شخصي، یوازې د غړو او د عمر محدودیت لرونکې ویډیوګانې او خپل Watch Later او Liked لیستونه ډاونلوډ کړئ، پرته له دې چې کوکیز صادر کړئ. کله چې YouTube وغواړي تاسو تایید کړئ چې bot نه یاست، Arroxy همدا sign in کاروي، او د هغه دننه browser د YouTube د ډاونلوډ ټوکن ترلاسه کوي ترڅو ډاونلوډونه لږو فارمټونو ته را ونه لوېږي. [ولې Arroxy](#why) وګورئ.

</details>

<details>
<summary><strong>کومې ویډیو کیفیتونه ډاونلوډ کولی شم؟</strong></summary>

هر هغه شی چې YouTube وړاندې کوي: 8K (4320p)، 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، او یوازې اوډیو. 60 fps او HDR سټریمونه لکه چې دي ساتل کیږي، او ګام په ګام ډاونلوډ تاسو ته اجازه درکوي چې په هر ریزولوشن کې AV1، VP9 یا H.264 وټاکئ.

</details>

<details>
<summary><strong>ایا کولی شم یوازې اوډیو د MP3 په توګه وباسم؟</strong></summary>

هو. د format menu کې *یوازې آډیو* وټاکئ او بیا MP3، M4A/AAC، Opus یا WAV غوره کړئ.

</details>

<details>
<summary><strong>هغه ویډیوګانې څنګه ډاونلوډ کړم چې د YouTube اکاونټ ته اړتیا لري؟</strong></summary>

په Explore ټب کې یو ځل sign in وکړئ. بیا Arroxy کولی شي هغه شخصي او یوازې د غړو ویډیوګانې ډاونلوډ کړي چې ستاسو اکاونټ یې لیدلی شي، د عمر محدودیت لرونکې ویډیوګانې که اکاونټ د عمر لپاره تایید شوی وي، او ستاسو Watch Later او Liked لیستونه. دا sign in یوازې هغه وخت کاروي چې ډاونلوډ په داسې ډول ناکام شي چې اکاونټ یې سمولی شي؛ نور هر څه لکه مخکې ډاونلوډېږي. دا د **Explore sign in** انتخاب دی، چې د کوکیز په تنظیماتو کې لومړی لیست شوی او Recommended نښه لري، او Arroxy یې ستاسو لپاره لومړی ځل چې Explore پرانیزئ غوره کوي. د yt-dlp ویکي یاد کوي چې [د sign in سره اتومات کول کولی شي د ګوګل اکاونټ بیرغ کړي](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)، نو دوهم اکاونټ خوندي انتخاب دی.

</details>

<details>
<summary><strong>ایا کله چې YouTube یو شی بدل کوي کار کوي؟</strong></summary>

yt-dlp د لانچ پر مهال اتومات تازه کیږي، او Arroxy هغه وخت چې YouTube یو شی بدل کړي په چټکۍ سره فکسونه لیږدوي. کله چې YouTube وغواړي تاسو تایید کړئ چې bot نه یاست، که تاسو په Explore کې sign in کړی وي Arroxy ستاسو Explore sign in هم هڅوي، او د فایل یا browser کوکیز د کوکیز په تنظیماتو کې شته.

</details>

<details>
<summary><strong>Arroxy د کومو ژبو لپاره شته دی؟</strong></summary>

31 ژبې له مخکې چمتو دي: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy په لومړي پیل کې ستاسو د عملیاتي سیسټم ژبه په اتومات ډول پېژني، او تاسو یې هر وخت د تولبار د ژبې له ټاکونکي څخه بدلولای شئ. Runtime locale JSON په src/shared/i18n/locales/ کې دی، او د ژباړونکو PO catalog په i18n/locales/ کې دی — د مرستې لپاره په GitHub کې PR پرانیزئ.

</details>

<details>
<summary><strong>ایا ما ته بل شی نصب کولو ته اړتیا ده؟</strong></summary>

نه. yt-dlp، ffmpeg او ffprobe د لومړي پیل پر مهال اوتومات ډاونلوډ او ستاسو په ماشین کې کېچ کېږي. له دې وروسته، کوم اضافي ترتیب ته اړتیا نشته.

</details>

<details>
<summary><strong>ایا کولی شم پلیلیسټونه یا ټول چینلونه ډاونلوډ کړم؟</strong></summary>

هو — دواړه. د playlist یا channel URL پیسټ کړئ (لکه `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`)؛ وټاکئ چې څو entries scan شي، بیا ټول لیست queue کړئ یا ځانګړي ویډیوګانې وټاکئ. د date-range filters ژر راځي.

</details>

<details>
<summary><strong>macOS وايي "اپ خرابه ده" — څه وکړم؟</strong></summary>

دا macOS Gatekeeper دی چې بې لاسلیکه app بندوي، واقعي زیان نه دی. د quarantine لرې کولو او Arroxy پیلولو لپاره د Terminal قوماندې په [macOS first launch](#macos-first-launch) کې وګورئ.

</details>

<details>
<summary><strong>ایا د YouTube ویډیوز ډاونلوډ کول قانوني دي؟</strong></summary>

د شخصي، خصوصي کارولو لپاره دا معمولا ډیرو قضایي سیمو کې منل کیږي. تاسو د YouTube د [د کارولو شرایطو](https://www.youtube.com/t/terms) او د خپل ځایني د کاپي رایټ قوانینو سره مطابقت لرل ستاسو مسؤلیت دی.

</details>

---

## <a id="roadmap"></a>🗺️ د پرمختیا لار

لا هم پلان شوي — نږدې د لومړیتوب په ترتیب:

| ځانګړتیا    | توضیح    |
| ---------------- | ---------------- |
| **د پلیلیسټ او چینل فیلترونه** | د playlist یا channel د شمېرلو پر مهال date-range filters |
| **د YouTube د غږ ټریک غوره توبونه** | کله چې YouTube څو غږیز ټریکونه وړاندې کوي، د ټول app لپاره د خبرې ژبې track غوره توب وټاکئ او د هر profile لپاره override وکړئ |
| **غښتلی retry recovery** | د بې ثباته یا ستونزمن internet connection له امله د پرې شویو ډاونلوډونو لپاره نوی retry لاره |
| **بشپړ download manager drawer** | د queue drawer بشپړ manager ته اړول، د queued items لپاره destination folder بدلولو په ګډون |
| **مهالویش شوي ډاونلوډونه** | کیو د ټاکلي وخت کې پیل کړئ (شپه اجرا کول) |
| **د AUR کڅوړه** | په Arch Linux او Omarchy کې د `yay -S arroxy-bin` سره نصب کړئ |

ذهن کې کومه ځانګړتیا لرئ؟ [یوه غوښتنه خلاصه کړئ](../../issues) — د ټولنې ننوتل لومړیتوب ورکوي.

---

## <a id="support"></a>💖 Arroxy ملاتړ وکړئ

Arroxy وړیا دی او د MIT جواز لري — نه اعلانونه، نه ټیلي‌مېټري، او نه د پیسو نسخه. که ستاسو وخت خوندي کوي، کولی شئ د Bitcoin، Tron یا Ethereum له لارې یې پرمختګ ملاتړ کړئ: پتې په [DONATE.md](DONATE.md) کې دي، چې د هغوی یوازینۍ رسمي سرچینه ده. Arroxy به تاسو ته هیڅکله د بریښنالیک یا مستقیم پیغام له لارې پته وا نه لېږي. ریپو ته ستوری ورکول، د ستونزو راپور ورکول او د ژباړو ښه کول هم په همدې اندازه ګټور دي.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ د جوړولو ټیکنالوژي

<details>
<summary><strong>ټیک سټیک</strong></summary>

- **Electron** — د ډیسکټاپ کراس-پلیټفارم شیل
- **React 19** + **TypeScript** — کارونکي انٹرفیس
- **Tailwind CSS v4** — ستایل کول
- **Zustand** — د حالت مدیریت
- **yt-dlp** + **ffmpeg** — د ډاونلوډ او mux انجن (دواړه د runtime پر مهال راوړل کېږي: yt-dlp تازه ساتل کېږي، ffmpeg/ffprobe یو ځل نصبېږي او د تازه کولو وروسته هم پاتې کېږي)
- **Vite** + **electron-vite** — د جوړولو وسیلې
- **Vitest** + **Playwright** — د واحد او له سره تر سره ازموینې

</details>

<details>
<summary><strong>له سرچینې جوړول</strong></summary>

### مخکینۍ شرطونه — ټولې پلیټفارمونه

| وسیله  | نسخه | نصب |
| ------- | ------- | ------- |
| Git     | هر     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` یا `.node-version` |
| Bun     | 1.4.2  | `mise install` یا `package.json` `packageManager` |

سپارښتنه: `mise` نصب کړئ، بیا په checkout کې `mise install` وچلوئ. که mise نه کاروئ، د `bun run bootstrap` نه مخکې Node.js له `.node-version` او Bun له `package.json` څخه په لاسي ډول فعال کړئ.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

د اصلي rebuilds لپاره Visual Studio Build Tools او Python ته اړتیا کېدای شي.

### macOS

```bash
brew install mise
xcode-select --install
```

له clone وروسته، په checkout کې `mise trust && mise install` وچلوئ. که ستاسو shell له مخکې `fnm`، `nvm`، يا د Homebrew Bun کاروي، نو په `~/.zshrc` کې mise فعال کړئ څو Arroxy د Node.js 24.21.0 او Bun 1.4.2 وکاروي:

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

# د build او Electron د چلولو وابستګۍ
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# یوازې E2E ازموینې (Electron ته ښکاره کیدو ته اړتیا ده)
sudo apt install -y xvfb
```

### کلون کول او چلول

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # سپارښتنه؛ که pinned tools مو لاسي فعال کړي وي پرېږدئ
bun run bootstrap
bun run doctor
bun run dev            # Electron app د Vite renderer سره
```

### د توزیع وړ جوړول

```bash
bun run build        # د ډول ازموینه + کمپایل
bun run dist         # د اوسني OS لپاره پیکیج کول
bun run dist:win     # په supported host کې د Windows targets پیکیج کول
```

> `bun run bootstrap` dependencies نصبوي، د Electron app dependencies بیا جوړوي، Electron تاییدوي، د development لپاره embedded ffmpeg/ffprobe چمتو کوي، او Playwright Chromium نصبوي. د release builds yt-dlp، ffmpeg او ffprobe په runtime کې د app data folder کې manage کوي؛ هیڅ یو یې د installer دننه نه راځي.

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

## 📜 د کارولو شرایط

Arroxy یوازې د شخصي، خصوصي کارولو لپاره یوه وسیله ده. تاسو یوازې مسؤل یاست چې ستاسو ډاونلوډونه د YouTube د [د کارولو شرایطو](https://www.youtube.com/t/terms) او ستاسو د قضایي سیمې د کاپي رایټ قوانینو سره مطابقت لري. د Arroxy د ډاونلوډ، تکرار، یا د هغه منځپانګې توزیع لپاره مه کاروئ چې تاسو حق نه لرئ وکاروئ. پراختیا کونکي د هر ناسم کارولو لپاره مسؤل نه دي.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT License · د مینې سره جوړ شوی <a href="https://x.com/OrionusAI">@OrionusAI</a> لخوا</sub>
</div>
