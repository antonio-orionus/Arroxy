<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="የ Arroxy መሸፈኛ" width="180" />

# Arroxy — አብሮ የተሰራ አሳሽ ያለው ነፃ ምን ኮድ ያለው YouTube (+ 2000 ጣቢያ) አውራጅ ለ Windows, macOS እና Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**አንብብ በ:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · **አማርኛ** · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![ስሪት](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![ግንባታ](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![ድር ጣቢያ](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![ፈቃድ](https://img.shields.io/badge/license-MIT-green) ![ሥርዓቶች](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![ቋንቋዎች](https://img.shields.io/badge/i18n-31_languages-blue)

ቪዲዮዎች፣ Shorts፣ ሙዚቃ፣ ቻናሎች፣ ፖድካስቶች ወይም የድምፅ ትራኮች ከ**YouTube እና ከ2000+ ተደገፉ ጣቢያዎች** ያውርዱ — እስከ 8K HDR በ60 fps፣ እንደ MP3 / AAC / Opus፣ ወይም የሚፈልጉትን ክፍል ብቻ። በExplore ትር **YouTubeን ወይም ማንኛውንም ሌላ ጣቢያ በArroxy ውስጥ ያስሱ** እና እየተመለከቱት ያለውን ቪዲዮ፣ playlist ወይም channel ያውርዱ፤ ሒሳብዎ ማየት የሚችላቸውን የግል፣ የአባላት-ብቻ እና ዕድሜ-የተገደቡ ቪዲዮዎች ለማውረድ እዚያ ይግቡ። በ Windows፣ macOS፣ እና Linux ላይ አካባቢያዊ ሆኖ ይሠራል። **ምንም ማስታወቂያ፣ ምንም ብዝሃ ሸቀጥ፣ ምንም ተጨማሪ ሽያጭ።**

[**↓ የቅርብ ጊዜ ስሪት አውርድ**](#install) &nbsp;·&nbsp; [**ድር ጣቢያ**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows ላይ ለመጀመሪያ ጊዜ አስጀምር](#windows-first-launch) · [macOS ላይ ለመጀመሪያ ጊዜ አስጀምር](#macos-first-launch) · [Linux ላይ ለመጀመሪያ ጊዜ አስጀምር](#linux-first-launch)

[![የDiscord ማህበረሰብን ይቀላቀሉ](https://img.shields.io/badge/%E1%8B%A8Discord%20%E1%88%9B%E1%88%85%E1%89%A0%E1%88%A8%E1%88%B0%E1%89%A5%E1%8A%95%20%E1%8B%AD%E1%89%80%E1%88%8B%E1%89%80%E1%88%89-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Arroxy ጊዜ ካስቆጠበዎ፣ ⭐ ሌሎች እንዲያገኙት ይረዳል።

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## ዝርዝር

- [✨ ባህሪያት](#features)
- [📥 መጫን እና የመጀመሪያ ማስነሳት](#install)
  - [Windows ላይ ለመጀመሪያ ጊዜ አስጀምር](#windows-first-launch)
  - [macOS ላይ ለመጀመሪያ ጊዜ አስጀምር](#macos-first-launch)
  - [ለምን ማስጠንቀቂያ ሊታዩዎ ይችላሉ](#why-warning)
  - [Linux ላይ ለመጀመሪያ ጊዜ አስጀምር](#linux-first-launch)
  - [ማውረዱን ያረጋግጡ (SHA256)](#verify)
- [⚖️ ለምን Arroxy](#why)
- [🔒 ግላዊነት](#privacy)
- [❓ ተደጋጋሚ ጥያቄዎች](#faq)
- [🗺️ ወደፊት ዕቅድ](#roadmap)
- [💖 Arroxy ይደግፉ](#support)
- [🛠️ ከምን ተሠርቷል](#tech)

---

## <a id="features"></a>✨ ባህሪያት

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>YouTubeን ወይም ማንኛውንም ሌላ ጣቢያ በArroxy ውስጥ ያስሱ እና ያሉበትን ገጽ በንቁ መገለጫዎ ያውርዱ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>የExplore የመጀመሪያ ማያ</b><br/>ስለ Explore አጭር እይታ፣ እና ሁለተኛ ሒሳብ ለምን ደህንነቱ የተጠበቀ መግቢያ እንደሆነ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ዳውንሎዶች ምን እንደሚያስፈልግዎ ይነግርዎታል</b><br/>ሊንኮች በጀርባ ይዘጋጃሉ፤ የወደቀው መፍትሔ ያቀርባል፣ ረጅም playlist ምርጫዎን ይጠብቃል</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>የቪዲዮውን የተወሰነ ክፍል ብቻ ያውርዱ</b><br/>መጀመሪያና መጨረሻ ወይም ምዕራፍ ይምረጡ — Arroxy ያንን ክልል ብቻ ያስቀምጣል</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>የመገለጫ አርታዒ</b><br/>መገለጫን ያስተካክሉ፦ የፋይል ዓይነት፣ ጥራት፣ ንዑስ ርዕሶች፣ መድረሻ፣ የፋይል ስም አብነት እና ሌሎችም</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>ጨለማ ወይም ብርሃን፣ መስታወት ወይም ጠንካራ</b><br/>የሚመረጡ አራት ገጽታዎች፦ በሚንቀሳቀስ ሰማይ ላይ የመስታወት ፓነሎች ወይም ጸጥ ያሉ ጠንካራ ገጽታዎች፣ እያንዳንዳቸው በጨለማና በብርሃን</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="የArroxy አጠቃላይ የማውረድ አቋራጭ — በWindows እና Linux ላይ Ctrl+Shift+D፣ በmacOS ላይ Cmd+Shift+D፣ የተቀዳውን አገናኝ በቀጥታ ወደ ማውረጃ ወረፋ ይልካል" width="760" /></picture><br/><sub><b>አጠቃላይ የማውረድ አቋራጭ</b><br/>የትም ቦታ አገናኝ ይቅዱ፣ አንድ ጊዜ ይጫኑ — ወደ ወረፋ ገብቶ ማውረድ ይጀምራል</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>ለእያንዳንዱ ንጥል የአጫዋች ዝርዝር መገለጫዎች</b><br/>ለእያንዳንዱ ቪዲዮ የራሱን መገለጫ ይስጡ — አንዳንዶቹን በ4K ያከማቹ፣ ቀሪዎቹን እንደ MP3 ይያዙ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>የፈጣን ማውረድ መነሻ</b><br/>URL ይለጥፉ እና በነቃ መገለጫዎ ወዲያውኑ ያውርዱ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>እንደገና ጥቅም ላይ የሚውሉ የማውረድ መገለጫዎች</b><br/>ቅርጸት፣ ጥራት እና ውጤትን እንደ ቅድመ-ቅንብር ያስቀምጡ — በእያንዳንዱ ማውረድ ይጠቀሙ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>የብዙ ቋንቋ ድምፅ ትራኮች</b><br/>ቪዲዮ የያዘውን ትክክለኛ የድምፅ ቋንቋ ይምረጡ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround / Dolby ድምፅ</b><br/>5.1 እና Dolby ትራኮች ተለይተው ይጠበቃሉ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>የጅምላ URL ሁነታ</b><br/>ዝርዝር ይለጥፉ፣ ድግግሞሾችን በራስ-ሰር ያስወግዱ፣ ሁሉንም በአንድ ጊዜ ያሰልፉ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>ትይዩ የማውረድ ሰልፍ</b><br/>በቀጥታ እድገት ብዙ ማውረዶች በአንድ ጊዜ</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: ድሩን በArroxy ውስጥ ያስሱ</strong></summary>

- **Explore ትር** — YouTubeን ወይም ማንኛውንም ሌላ ጣቢያ በArroxy ውስጥ ያስሱ እና ያገኙትን ሊንክ ሳይገለብጡ ያውርዱ። **አውርድ · *መገለጫዎ*** እየተመለከቱት ያለውን ቪዲዮ፣ playlist ወይም channel በወረፋ ያስገባል፤ ከጎኑ ያለው ቀስት መገለጫዎችን ይቀይራል፣ የአስማት ዘንግ ደግሞ ቅርጸቶችን፣ ንዑስ ርዕሶችን እና ሌሎችን ለመምረጥ ደረጃ በደረጃ ማውረድን ይከፍታል
- **ለማውረድ በቀኝ ጠቅ ያድርጉ** — በExplore ውስጥ ማንኛውንም የቪዲዮ፣ playlist ወይም channel ሊንክ በቀኝ ጠቅ አድርገው በመገለጫዎ ያውርዱ፣ ከ**በመገለጫ አውርድ** ሌላ መገለጫ ይምረጡ፣ ደረጃ በደረጃ ማውረድን ይክፈቱ ወይም ሊንኩን ይቅዱ። እያንዳንዱን ቪዲዮ አስቀድሞ መክፈት አያስፈልግም
- **የታመቀ አቀማመጥ** — በExplore የመሳሪያ አሞሌ ውስጥ በአንድ ጠቅታ የArroxy ትሮችን ወደዚያ ያንቀሳቅሳል እና ገጹ ተጨማሪ ቦታ ያገኛል
- **የአድራሻ አሞሌ** — YouTube ለመፈለግ ይተይቡ፣ ወይም ማንኛውንም የድር አድራሻ አስገብተው ያንን ጣቢያ ይክፈቱ
- **ሒሳብ የሚፈልጉ ማውረዶች** — በExplore ውስጥ አንድ ጊዜ ይግቡ እና Arroxy ሒሳብዎ ማየት የሚችላቸውን የግል እና የአባላት-ብቻ ቪዲዮዎች፣ ሒሳቡ በዕድሜ ከተረጋገጠ ዕድሜ-የተገደቡ ቪዲዮዎች፣ እንዲሁም የWatch Later እና Liked ዝርዝሮችዎን ማውረድ ይችላል። ወደ ሌሎች ጣቢያዎችም እዚያ ይግቡ፣ ማውረዶቻቸውም ሲያስፈልግ ያንን መግቢያ ይጠቀማሉ። Arroxy አሁንም መጀመሪያ ሳይገባ ያወርዳል፣ እና የExplore መግቢያዎን የሚጠቀመው ማውረድ ሒሳብ ሊያስተካክለው በሚችል መንገድ ሲወድቅ ብቻ ነው። YouTube ቦት አለመሆንዎን እንዲያረጋግጡ ሲጠይቅ፣ Arroxy የExplore መግቢያዎን ደግሞ ይሞክራል
- **ሁለተኛ ሒሳብ ይጠቀሙ** — የExplore የመጀመሪያ ማያ ለምን እንደሆነ ያብራራል፡ በሒሳብ ማውረድ ያ ሒሳብ የመገደብ የተወሰነ አደጋ አለው። መግቢያዎችዎን ለመርሳት በፈለጉት ጊዜ ከSettings ከExplore ይውጡ
- **የማስታወቂያ ማገጃ** — በነባሪ ጠፍቷል። በExplore የመሳሪያ አሞሌ ላይ ባለው ጋሻ ላይ አንድ ጠቅታ በገጾቹ ላይ ማስታወቂያዎችን እና መከታተያዎችን ያግዳል፣ ማውረዶችን ሳይነካ። YouTube ለገቡ ሒሳቦች የማስታወቂያ ማገጃዎችን ሊቋቋም ይችላል

</details>

<details>
<summary><strong>🎞️ ጥራት እና ቅርጸቶች</strong></summary>

- እስከ **8K (4320p)**፣ 4K UHD (2160p)፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p
- **ፈጣን የፍሬም ፍጥነት እና HDR** እንዳሉ ተጠብቀው — 60 fps፣ HDR10
- **ድምፅ** — ኦዲዮ ብቻን ወደ MP3፣ M4A/AAC፣ Opus ወይም WAV ማውጣት። በinteractive downloads ውስጥ ካሉ የምንጩን native surround/Dolby ትራኮች (AC-3፣ E-AC-3፣ 5.1፣ DRC) ይምረጡ፣ ወይም ዓለም አቀፍ **surround / Dolby ን ይመርጡ** ነባሪ ያቀናብሩ
- **ግብ ያላቸው መገለጫዎች** — *ምርጥ ምስል* (AV1 · VP9) ወይም *ስማርት TV* (MP4 · H.264)፣ ዳግም ኮድ ሳይደረግ እንደ ራስ-ሰር፣ MP4፣ MKV ወይም WebM ይቀመጣሉ። HDR *ራስ-ሰር* (ማያዎ ማሳየት ሲችል ብቻ)፣ *SDR* ወይም *HDR* ነው
- **እያንዳንዱ ኮዴክ በእያንዳንዱ ጥራት መጠን** — ደረጃ በደረጃ ማውረድ AV1፣ VP9 እና H.264ን በእያንዳንዱ ጥራት መጠን ጎን ለጎን ይዘረዝራል፣ ስለዚህ ቲቪዎ ወይም አርታኢዎ የሚያጫውተውን መምረጥ ይችላሉ
- **ዥረቱ በእርግጥ ምን እንደሆነ ይወቁ** — YouTube በAI የሰፋቸው መጠኖች፣ በAI የተተረጎሙ የድምፅ ቋንቋዎች፣ የተሻሻለ ቢትሬት ያላቸው ዥረቶች፣ 360° ቪዲዮዎች እና የተበላሹ ወይም የውሃ ምልክት ያላቸው ቅጂዎች ምልክት ይደረግባቸዋል። እርስዎ ካልፈቀዱ በቀር መገለጫዎች በAI የተሰፉ ዥረቶችን ይዘላሉ

</details>

<details>
<summary><strong>🛡️ ግላዊነት እና ቁጥጥር</strong></summary>

- 100% አካባቢያዊ ሂደት — ማውረዶች ቀጥታ ከ YouTube ወደ ዲስክዎ ይሄዳሉ
- ምንም ግባ፣ ምንም ኩኪ፣ ምንም Google ሒሳብ አልተያያዘም
- ፋይሎች ወደ መረጡት አቃፊ ቀጥታ ተቀምጠዋል

</details>

<details>
<summary><strong>⚡ የሥራ ፍሰት</strong></summary>

- **አጠቃላይ የማውረድ አቋራጭ** — በማንኛውም መተግበሪያ ውስጥ አገናኝ ይቅዱና `Ctrl+Shift+D` (በmacOS ላይ `Cmd+Shift+D`) ይጫኑ፤ Arroxy መስኮቱን ሳይከፍት በንቁ መገለጫዎ ወደ ወረፋ ያስገባዋል፣ ማሳወቂያም ያረጋግጣል። በነባሪ የነቃ፣ እንደገና ሊመደብ የሚችል
- **ተለዋዋጭ የመጀመሪያ ሁነታዎች** — የተመራ ነጠላ ማውረድ፣ የplaylist/channel መምረጫ፣ ብዙ URL መለጠፍ፣ በተቀመጡ ነባሪዎች Quick Download፣ ወይም ከExplore ማሰስና ማውረድ ይምረጡ
- **ማዕከላዊ የማውረድ ወረፋ** — ነጠላ፣ playlist፣ bulk፣ ወይም quick ሥራ ሁሉ ለሂደት፣ ለማቆም፣ ለመቀጠል፣ ለመሰረዝ፣ እንደገና ለመሞከር እና ለቅድሚያ ቁጥጥር በአንድ ቦታ ይመጣል
- **ክሊፕቦርድ ክትትል** — የቪዲዮ ሊንክ ይቅዱ፣ ወደ Arroxy ሲመለሱም የURL መስኩን ይሞላል፤ ሳያስቡት ከሆነ **ቀልብስ** አለ። Arroxy ሥራ ላይ ሲሆን ሊንኩ ወደ URL ትር እስኪመለሱ ይጠብቃል (በቅንብሮች ውስጥ ያጥፉት)
- **URL ን ራስ ሰር ያጥሩ** — ትራኪንግ ፓራሜትሮችን (`si`፣ `pp`፣ `utm_*`፣ `fbclid`፣ `gclid`) ያስወግዳሉ እና `youtube.com/redirect` ሊንኮችን ያሰናስሉ
- **ትሬ ሁነታ** — መስኮቱን መዝጋት ማውረዶቹን በጀርባ ያስቀጥላሉ
- **31 ቋንቋዎች** — የስርዓት አካባቢን በራስ-ሰር ያገኛል፣ በማንኛውም ጊዜ መቀየር ይቻላል
- **የአጫዋች ዝርዝር ማመሳሰል** — አስቀድሞ የወረዱ ቪዲዮዎችን ለመዝለል አጫዋች ዝርዝርን ከአካባቢያዊ ፎልደር ጋር ዳግም ይፈትሻል፤ እያንዳንዱ ቪዲዮ ሲወርድ የሚዘምን `.m3u` የአጫዋች ዝርዝር ፋይል ይፈጥራል
- **የፍጥነት እና pacing መቆጣጠሪያዎች** — የማውረድ bandwidth ይገድቡ፣ የቪዲዮ ስንት ክፍሎች በአንድ ጊዜ እንደሚወርዱ ያዘጋጁ፣ እና በpresets (*ጠፍቷል · ሚዛናዊ · ጥንቁቅ · ብጁ*) በጥያቄዎች መካከል መዘግየት ያክሉ
- **የፋይል ስም አብነቶች** — `{title}`፣ `{uploader}`፣ `{id}`፣ `{date}`፣ `{resolution}` እና `{playlist_index}` በመጠቀም ውርዶችዎን በፈለጉት መንገድ ይሰይሙ፤ በአጠቃላይ ወይም በእያንዳንዱ የማውረድ መገለጫ
- **በአንድ ጊዜ ዳውንሎዶች እና ራስ-ሰር ድጋሚ ሙከራ** — በአንድ ጊዜ ስንት የተሰለፉ ዳውንሎዶች እንደሚሄዱ ይምረጡ፣ እና የኔትወርክ ወይም የሰርቨር ችግር ያጋጠመውን ዳውንሎድ Arroxy በእያንዳንዱ ሙከራ መካከል ረዘም ብሎ በመጠበቅ እንደገና ይሞክር
- **በአጫዋች ዝርዝር ውስጥ ለእያንዳንዱ ንጥል መገለጫ** — ለመላው ዝርዝር አንድ ቅንብር ከመጠቀም ይልቅ በአጫዋች ዝርዝር ውስጥ ላለ እያንዳንዱ ቪዲዮ የራሱን የማውረድ መገለጫ ይመድቡ፤ በአንድ ዙር አንዳንዶቹን በሙሉ ጥራት ማከማቸት እና ቀሪዎቹን እንደ MP3 መያዝ ይቻላል
- **Quick Download በጀርባ ይሠራል** — ሊንኩ ወዲያውኑ በዳውንሎዶች ውስጥ ይታያል እና እዚያ ይዘጋጃል፣ **View** ያለው ማስታወሻ ያረጋግጣል፣ እና የURL መስክ ለቀጣዩ ሊንክ ይጸዳል። ቀዳሚዎቹ እየተዘጋጁ ሳለ የፈለጉትን ያህል ይጀምሩ
- **ዳውንሎዶች ምን እንደሚያስፈልግዎ ይነግርዎታል** — Arroxy ሊንክ ማንበብ ካልቻለ፣ ረድፉ ምክንያቱን ይናገራል እና መፍትሔውን ያቀርባል፡ እንደገና ሞክር፣ ኩኪዎችን ማብራት፣ ወይም በExplore መግባት። ኩኪዎች ሲጠፉ፣ ከገቡ በኋላ **በExplore ግባ** ለእርስዎ እንደገና ይሞክረዋል። ከጭነት ገደብዎ የሚረዝም playlist ሁሉንም፣ የመጀመሪያዎቹን ወይም ግምገማ እስኪመርጡ በረድፉ ላይ ይጠብቃል። የዳውንሎዶች ትር እርስዎን የሚጠብቁ ረድፎችን ይቆጥራል
- **የቪዲዮውን አንድ ክፍል ብቻ ያውርዱ** — በቅርጸት ማያ ላይ መጀመሪያና መጨረሻ ወይም አንድ ምዕራፍ ይምረጡ፣ Arroxy ያንን ክልል ብቻ ያስቀምጣል፤ ስሙም ከቪዲዮ መታወቂያው በኋላ ክልሉን ይይዛል። ቁረጣዎች በቅርቡ ባለው ቁልፍ ፍሬም ላይ ያርፋሉ፤ በምትኩ ዳግም ኮድ ለማድረግ ትክክለኛ ቁረጣን ያብሩ
- **የተጠናቀቁ ዳውንሎዶችን በራስ-ሰር አስወግድ** — አማራጭ፦ የተጠናቀቀ ዳውንሎድ ከ5 ሰከንድ በኋላ ከዝርዝሩ ይወጣል። ፋይሎቹ በዲስክ ላይ ይቀራሉ፣ የከሸፉ ዳውንሎዶች ደግሞ በዝርዝሩ ውስጥ ይቆያሉ
- **በዳውንሎዶች ውስጥ መጠን እና ጠፍቷል** — ሊደረደር የሚችል **መጠን** አምድ እያንዳንዱ ዳውንሎድ ምን ያህል ቦታ እንደሚይዝ ያሳያል፣ **ጠፍቷል** ደግሞ ከArroxy ውጭ የተንቀሳቀሱ ወይም የተሰረዙ ፋይሎችን ምልክት ያደርጋል
- **Aurora ወይም ቀላል፣ ጨለማ ወይም ብርሃን** — በሚንቀሳቀስ ሰማይ ላይ የመስታወት ፓነሎች፣ ወይም ጸጥ ያሉ ጠጣር ገጾች፤ ከግርጌ ይቀያይሩ። የግራፊክስ ማፋጠን የሌላቸው ኮምፒውተሮች ቀላልን በራስ-ሰር ያገኛሉ
- **የMac ሜኑ አሞሌ** — በmacOS ላይ ቅንብሮችን (`Cmd+,`) ይክፈቱ፣ የማውረድ ፍጥነት ገደብ ያዘጋጁ፣ ዘይቤና ገጽታ ይቀይሩ፣ እንዲሁም ምዝግቦችን ይክፈቱ ወይም የምርመራ ፋይል ከሜኑ አሞሌ ያስቀምጡ
- **ከማንኛውም ማውረድ መገለጫ ይቀይሩ** — ማውረዱን ያስተካክሉ፣ ከዚያ የተጀመረበትን መገለጫ ያዘምኑ (ምን እንደሚለወጥ በቅድመ እይታ) ወይም ቅንብሮቹን እንደ አዲስ መገለጫ ያስቀምጡ። መገለጫ ሲቀይሩ ማስተካከያዎችዎን ማቆየት እንደሚፈልጉ ይጠየቃሉ

</details>

<details>
<summary><strong>📝 ንዑስ ርዕሶች እና ድህረ-ሂደት</strong></summary>

- **ንዑስ ርዕሶች** በ SRT፣ VTT፣ ወይም ASS — እጅ ወይም ራስ ሰር የተፈጠሩ፣ በማንኛውም ቋንቋ
- ከቪዲዮ ጎን ያቆዩ፣ ወደ `.mkv` ያካቱ፣ ወይም ወደ `Subtitles/` ንዑስ አቃፊ ያዘጋጁ
- **ንዑስ ርዕስ ብቻ በጅምላ** — የዩአርኤሎች ዝርዝር ይለጥፉ ወይም ፕሌይሊስት ይክፈቱ፣ ንዑስ ርዕሶችን ይምረጡ፣ እና ለእያንዳንዱ ቪዲዮ የመግለጫ ጽሑፍ ፋይሎችን ብቻ ያግኙ
- **SponsorBlock** — ስፖንሰሮችን፣ ምዕራፍ ምልክቶችን፣ ወደፊት ምዕራፎችን፣ ራስ ሰር ማስታወቂያዎችን ዝለሉ ወይም ምዕራፍ ምልክት ያድርጉ
- **የተካተተ ሜታዳታ** — ርዕስ፣ የሰቀሉ ቀን፣ ቻናል፣ ዝርዝር፣ አናት ስእል፣ እና ምዕራፍ ምልክቶች ወደ ፋይሉ ተጽፈዋል

</details>

<details>
<summary><strong>🌐 YouTube + 2000 ጣቢያዎች</strong></summary>

- **YouTube ሙሉ** — ቪዲዮዎች፣ Shorts፣ ቻናሎች፣ ፕሌይሊስቶች፣ YouTube Music እና ፖድካስቶች እንደ ቀዳሚ ምንጮች ይታሰባሉ
- **2000+ ሌሎች ጣቢያዎች** yt-dlp አማካኝነት — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable እና ሌሎች ብዙ
- **ኦዲዮ ብቻ እና ጽሑፍ ርዕሶች** ሁሉም ተደጋፊ ጣቢያዎች ላይ ይሠራሉ፣ YouTube ብቻ ሳይሆን
- ጣቢያ ሲቀይር yt-dlp በሳምንት ውስጥ ማሻሻያዎችን ይልካሉ፣ Arroxy ደግሞ ሲጀምር binary ን ራስ-ሰር ያዘምናሉ

</details>

---

## <a id="install"></a>📥 መጫን እና የመጀመሪያ ማስነሳት

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

ግንባታዎቹ ለx86_64 ብቻ ናቸው። `curl` የለም? `curl -fsSL` በ`wget -qO-` ይተኩ።

| ሥርዓተ ክወና | ቅርጸት |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**የቅርብ ጊዜ ስሪት ይያዙ →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows ላይ ለመጀመሪያ ጊዜ አስጀምር</strong></summary>

በመጀመሪያ ጊዜ ሲጀምሩ **"Windows protected your PC"** ወይም **"Unknown publisher"** ሊያዩ ይችላሉ። ይህ ለ `Arroxy-win-x64-Setup.exe` እና `Arroxy-win-x64-Portable.exe` ሁለቱም ይሠራሉ። Arroxy ነፃ እና ምን ኮድ ያለው ሲሆን የ Windows ቅጅዎቹ ባለ ክፍያ የምስክር ወረቀት ተፈርመዋ አይደሉም፣ ስለዚህ SmartScreen ያሳዩዋቸዋል። ይህ Arroxy ደህና ያልሆነ ማለት **አልሆነም**። ለቀጠሉ:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" መልዕክት ሳጥን፣ "More info" ሊንክ ተጎልቶ ከሚታይ ጋር" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="More info ከተከፈተ በኋላ SmartScreen መልዕክት ሳጥን፣ "Run anyway" ቁልፍ ከሚታይ ጋር" />
</div>

1. **More info** ጠቅ ያድርጉ።
2. **Run anyway** ጠቅ ያድርጉ።

#### Windows Defender ፋይሉን ቢሰምናቸው ወይም ቢያስወግዳቸው

Defender ሂዩሪስቲክስ አንዳንድ ጊዜ ያልተፈረሙ NSIS ጫኞችን እና Electron ተጓዥዎችን ጥርጣሬ አዘል ብሎ ሊሰምናቸው ይችላሉ። Defender `Arroxy-win-x64-Setup.exe` ወይም `Arroxy-win-x64-Portable.exe` ን ካቆጠቆጠ፣ ከ **Windows Security → Virus & threat protection → Protection history** ይመልሱ፣ ከዛ Arroxy ን ሊፈጸም የሚችልን ፋይል **Manage settings → Add or remove exclusions** ስር ፈቀደ ሆኖ ያክሉ። እንደ SmartScreen ሁሉ፣ ምክንያቱ አልተገኘ ተንኮል-አዘል ሶፍትዌር ሳይሆን የጎደለ ናሸር ፊርማ ነው።

> Arroxy'ን ከይፋዊው GitHub Releases ገጽ ብቻ ያውርዱ። ፋይሉን ሌላ ድር ጣቢያ ካወረዱ ወይም ሌሎች ከላኩልዎ፣ ሰርዘው ከይፋዊ ምንጩ አዲስ ቅጅ ያውርዱ። ምንጩ ህዝባዊ ስለሆነ ራስዎ ሊፈትሹ ወይም Arroxy'ን ሊሠሩ ይችላሉ።

Scoop ይመርጣሉ? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS ላይ ለመጀመሪያ ጊዜ አስጀምር</strong></summary>

Arroxy ለ macOS እስካሁን ኮድ አልተፈረመም፣ ስለዚህ Gatekeeper ከ DMG ከጫኑት በኋላ አስፈሪውን *"Arroxy.app is damaged and can't be opened"* መልዕክት ሊያሳይ ይችላል። ይህ መልዕክት macOS ያልተፈረመ app በquarantine ውስጥ አስገብቶታል ማለት ነው፤ የapp ፋይሎች በእውነት ተጎድተዋል ማለት አይደለም። በአሁኑ macOS ላይ አስተማማኙ መፍትሔ Terminal ነው:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. ከተቀጠለው DMG ውስጥ `Arroxy.app` ን ወደ `/Applications` ጎትቱ።
2. Terminal ይክፈቱና እነዚህን ሁለት ትዕዛዞች ያስኪዱ:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

የመጀመሪያው ትዕዛዝ ከተጫነው የArroxy ቅጂዎ quarantine attribute ያስወግዳል። ሁለተኛው appን ያስነሳል። `sudo` የMac የይለፍ ቃልዎን ሊጠይቅ ይችላል፤ Terminal ሲጻፍ ምልክቶችን አያሳይም።

**Apple Silicon vs Intel:** M-ሰሪ Mac ላይ (M1 / M2 / M3 / M4)፣ `arm64` DMG ያውርዱ። Intel Mac ላይ፣ `x64` DMG ያውርዱ። የተሳሳተ ቅጅ ማሂደት Rosetta በኩል ይሠራሉ ነገር ግን በግልጽ ዘገምተኛ ነው።

> macOS ሕንጻዎች ከ Apple Silicon እና Intel ሩጫዎች በ CI ላይ ይሠራሉ። ችግር ካጋጠምዎ፣ [ጉዳይ ይክፈቱ](../../issues) — ከ macOS ተጠቃሚዎች ያለው ምላሽ የ macOS ፈተና ዑደቱን ቀጥታ ይቀርፃሉ።

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ ለምን ማስጠንቀቂያ ሊታዩዎ ይችላሉ</strong></summary>

Arroxy ምን ኮድ ያለው (open-source) እና MIT ፈቃድ ያለው ነው። የ Windows እና macOS ቅጅዎቹ **ኮድ አልተፈረመባቸውም** — Apple Developer ID እና Windows EV ኮድ-ፊርማ ሰርቲፊኬቶቹ እያንዳንዳቸው በዓመት በመቶዎች ዶላር ያስወጣሉ፣ ይህ ነጻ ፕሮጀክት ከኪሳቸው ይከፍላሉ። ያነዚህ ፊርሞች ሳይኖሩ፣ Windows SmartScreen እና macOS Gatekeeper በመጀመሪያ አስጀማሪ ያስጠነቅቋቸዋል። ማስጠንቀቂያዎቹ *ሥርዓተ ክወናዎ ናሸርን አይለይም* ማለት ናቸው — Arroxy ተንኮል-አዘል ሶፍትዌር ነው ማለት አይደሉም።

Arroxy ን ራስዎ ለማረጋገጥ ሦስት መንገዶች፣ ከፍ እያለ በሚሄድ ጥብቅነት:

- **ምንጩን ያንብቡ።** ሁሉም መስመሮች [GitHub](https://github.com/antonio-orionus/Arroxy) ላይ ናቸው፣ እናም [ከምንጩ ሊሠሩ](#tech) ይችላሉ።
- **SHA256ን ያረጋግጡ።** ፋይልዎን ከታተሙት [`SHA256SUMS`](../../releases/latest) ጋር ያዛምዱ — ከዚህ በታች [ማውረዱን ያረጋግጡ](#verify) ይመልከቱ።
- **የሦስተኛ ወገን ቅኝት ያካሂዱ።** ፋይሉን ወደ [VirusTotal](https://www.virustotal.com) ይጫኑ።

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux ላይ ለመጀመሪያ ጊዜ አስጀምር</strong></summary>

AppImages ቀጥታ ይሠራሉ — ምንም ጫሌ አያስፈልጋቸውም። ፋይሉን ሊፈጸም እንደሚችል ብቻ ምልክት ማድረግ ያስፈልጋሉ።

**ፋይል አስተዳዳሪ:** `.AppImage` ላይ ቀኝ ጠቅ ያድርጉ → **Properties** → **Permissions** → **Allow executing file as program** ያብሩ፣ ከዛ ሁለቴ ጠቅ ያድርጉ።

**ቴርሚናል:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

አስጀምሩ አሁንም ካልሆነ ሳይጫን አስሂዱት — የFUSE ጥቅል አያስፈልግም፦

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**አማራጭ የዴስክቶፕ ውህደት:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ን አንድ ጊዜ ጫኑ፣ ሁለቴ ጠቅ ያደርጉበት ማንኛውም AppImage በጀምር ምናሌዎ ውስጥ ራስ-ሰር ይመዘገባሉ — ምንም እጅ `.desktop` ፋይል አያስፈልጋቸውም።

**ተራ ታርቦል (FUSE የለም፣ ጫና የለም)፦**

የ`.tar.gz` ግንባታ ያው መተግበሪያ ነው ያለ AppImage መጠቅለያ — የትም ፈትታችሁ አስሂዱት። ጫኚም የFUSE ጥቅልም አያስፈልግም።

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**በተለቀቀው ገጽ ላይ ያሉት የሊኑክስ ማውረጃዎች x86_64 ብቻ ናቸው።** በARM64 ማሽኖች (Raspberry Pi፣ Asahi Linux) ላይ Flatpak ይጫናል ግን ሲጀመር በ`bwrap: execvp ldconfig: Exec format error` ይወድቃል።

</details>

<details>
<summary><strong><a id="verify"></a>🔐 ማውረዱን ያረጋግጡ (SHA256)</strong></summary>

ሁሉም ስሪቶቹ ከሁለትዮሽ ፋይሎቹ ጎን `SHA256SUMS` ፋይልን ያሳትማሉ። ማውረዱ ሳይበላሽ ወይም ሳይሻሻል እንደደረሰ ለማረጋገጥ፣ ፋይልዎን ሃሽ ያድርጉ እና `SHA256SUMS` ውስጥ ካለው መስመር ጋር ያዛምዱ። ቅርቡን ስሪት ገጽ ይክፈቱ → **Assets** → `SHA256SUMS` ያውርዱ።

**Windows (PowerShell ወይም Command Prompt):**

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

የሦስተኛ ወገን ተንኮል-አዘል ሶፍትዌር ቅኝት ይፈልጋሉ? ፋይሉን [VirusTotal](https://www.virustotal.com) ላይ ይጫኑ። ከቀዳሚ ሞተሮቹ ጥቂት ሂዩሪስቲክ ምልክቶቹ ፊርማ ላልተደረገባቸው Electron አፖ ዘወትር ናቸው; ከዋና ሞተሮቹ ሰፊ ምልክቶቹ ሐቀኛ ጉዳይ ሊሆኑ ይችላሉ።

</details>

<details>
<summary><strong>📦 Windows: ጫኝ vs ተጓዥ</strong></summary>

|               | NSIS ጫኝ | ተጓዥ `.exe` |
| ------------- | :----------------------: | :---------------------: |
| ጫሌ ያስፈልጋል | አዎ  | አይ — ከየትኛውም ቦታ አሂዱ  |
| ራስ ሰር ዝማኔዎች | ✅ በአፕ ውስጥ  | ❌ እጅ ማውረድ  |
| የጅምር ፍጥነት | ✅ ፈጣን  | ⚠️ ዘገምተኛ ቀዝቃዛ ጅምር  |
| ወደ ጅምር ምናሌ ይጨምራሉ |            ✅            |           ❌            |
| ቀላል ማስወገጃ |            ✅            | ❌ ፋይሉን ሰርዙ  |

**ምክር:** ለራስ ሰር ዝማኔዎች እና ፈጣን ጅምር NSIS ጫኝ ይጠቀሙ። ምንም ጫሌ፣ ምንም ሬጂስትሪ ለሌለው አማራጭ ተጓዥ `.exe` ይጠቀሙ።

</details>

---

## <a id="why"></a>⚖️ ለምን Arroxy

ከተለመዱ አማራጮች ጋር ጎን ለጎን ማወዳደሪያ:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| አብሮ የተሠራ browser (ያስሱ፣ ይግቡ፣ ያውርዱ) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| የግል፣ የአባላት-ብቻ እና ዕድሜ-የተገደቡ ቪዲዮዎች ኩኪዎችን ወደ ውጭ ሳይልኩ |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| ነፃ፣ ምንም ፕሪሚየም ደረጃ የለም |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| ምን ኮድ ያለው |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| አካባቢያዊ ሂደት ብቻ |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| ምንም የአጠቃቀም ወሰን |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| ለሁሉም ዓይነት ሥርዓቶች የሚሠራ የዴስክቶፕ አፕ |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| ንዑስ ርዕሶች + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = በከፊል፣ ወይም በሚከፈልበት ደረጃ ብቻ። በ4K Video Downloader ውስጥ ለግል ቪዲዮዎች በአፑ ውስጥ መግባት የሚከፈልበት ባህሪ ነው፤ አብዛኞቹ ነፃ የyt-dlp GUIዎች የኩኪ ፋይል ብቻ ይቀበላሉ ወይም የድር browserዎን ኩኪዎች ያነባሉ።

Arroxy ለአንድ ነገር ብቻ ተሠርቷል: URL ቢለጥፉም ሆነ ቪዲዮውን በExplore ውስጥ ቢያገኙት፣ ንጹህ አካባቢያዊ ፋይል። ምንም ሽያጭ፣ ምንም የዳታ ስብስብ።

### <a id="why-explore"></a>🧭 ቀላል የyt-dlp መጠቅለያ የማይችለው: የExplore ትር

አብዛኞቹ ነፃ የYouTube አውራጆች በyt-dlp ላይ የተቀመጠ የURL ሳጥን ብቻ ናቸው። Arroxy ደግሞ yt-dlp ይጠቀማል፣ ግን **Explore**ም አለው፣ በአፑ ውስጥ አብሮ የተሠራ፣ YouTubeን ወይም ማንኛውንም ሌላ ጣቢያ የሚከፍት browser። Explore የURL ሳጥን ሊያልፋቸው የማይችላቸውን ገደቦች ያልፋል:

- **ሒሳብ የሚፈልጉ ቪዲዮዎች፣ ኩኪዎችን ወደ ውጭ ሳይልኩ** — የግል፣ የአባላት-ብቻ እና ዕድሜ-የተገደቡ ቪዲዮዎች (በዕድሜ በተረጋገጠ ሒሳብ)፣ እንዲሁም የWatch Later እና Liked ዝርዝሮችዎ፣ እንዲሁም በሌሎች ጣቢያዎች ላይ ከመግቢያ ጀርባ ያሉ ቪዲዮዎች። ቀላል መጠቅለያ cookies.txt ወደ ውጭ መላክ ይፈልጋል ወይም የድር browserዎን ኩኪዎች ማንበብ አለበት፣ ይህን ደግሞ Chrome በWindows ላይ አሁን ያግዳል። በArroxy ውስጥ በExplore አንድ ጊዜ ይገባሉ፣ ቀሪውን ራሱ ይሠራል
- **«ቦት አለመሆንዎን ለማረጋገጥ ይግቡ»** — YouTube ይህን ሲጠይቅ፣ Arroxy ከመውደቅ ይልቅ በExplore መግቢያዎ ማውረዱን እንደገና ይሞክራል
- **የYouTube የማውረጃ ቶከን** — የArroxy አብሮ የተሠራ browser YouTube ከማውረድ በፊት የሚጠብቀውን ቶከን ያገኛል። ያለ እሱ YouTube ከጠየቁት ያነሱ ቅርጸቶችን እና ዝቅተኛ ጥራት ሊያቀርብ ይችላል
- **ሊንክ መገልበጥ አያስፈልግም** — በExplore ውስጥ ቪዲዮ፣ playlist ወይም channel ያግኙ እና በአንድ ጠቅታ ያውርዱ፣ ወይም በገጹ ላይ ማንኛውንም ሊንክ በቀኝ ጠቅ ያድርጉ
- **ማስታወቂያ ማገጃ ሲፈልጉ** — በጋሻው ላይ አንድ ጠቅታ በExplore ገጾች ላይ ማስታወቂያዎችን እና መከታተያዎችን ያግዳል

---

## <a id="privacy"></a>🔒 ግላዊነት

ማውረዶቹ ቀጥታ በ [yt-dlp](https://github.com/yt-dlp/yt-dlp) ከ YouTube ወደ መረጡት አቃፊ ይወርዳሉ — ምንም ሦስተኛ ወገን ሰርቨር አይሆንም። የእይታ ታሪክ፣ የማውረድ ታሪክ፣ URLs፣ እና የፋይሎቹ ይዘቶች በመሳሪያዎ ላይ ይቆያሉ።

ቴሌሜትሪ የለም — በቀን አንድ ስም-አልባ ምልክት ብቻ፦ የአፕ ስሪት፣ OS፣ ቋንቋ፣ የመጫኛ ቻናል እና ሀገር፣ ንቁ ተጠቃሚዎችን ለመቁጠር። ምንም ID፣ URLs፣ የቪዲዮ ርዕሶች፣ የፋይል መንገዶች ወይም የመለያ መረጃ የለም። በSettings ውስጥ ማጥፋት ይችላሉ።

Explore ከbrowserዎ የተለየ የራሱን መግቢያዎች ይይዛል፣ እና Arroxy ማንኛውንም የመግቢያ ቅጽ ፈጽሞ አያነብም ወይም አይሞላም — እርስዎ በጣቢያው የራሱ ገጽ ላይ ይተይባሉ። ማውረዶች ሳይገቡ ይሠራሉ፤ ማውረድ ሒሳብ ሊያስተካክለው በሚችል መንገድ ሲወድቅ ብቻ Arroxy መግቢያውን እንደገና ያነባል፣ ለዚያ ማውረድ በጊዜያዊ ፋይል ውስጥ ያቆየዋል፣ እና በኋላ ፋይሉን ይሰርዛል። በSettings ውስጥ ከExplore መውጣት ይረሳቸዋል።

---

## <a id="faq"></a>❓ ተደጋጋሚ ጥያቄዎች

<details>
<summary><strong>በርግጥ ነፃ ነው?</strong></summary>

አዎ — MIT ፈቃድ አለው፣ ምንም ፕሪሚየም ደረጃ፣ ምንም ባህሪ ቁጥጥር የለም።

</details>

<details>
<summary><strong>Arroxy ከሌሎች የyt-dlp GUIዎች በምን ይለያል?</strong></summary>

አብዛኞቹ ነፃ የyt-dlp GUIዎች ሊንክ ብቻ የሚቀበሉ መጠቅለያዎች ናቸው። Arroxy **Explore**ን ይጨምራል፣ በአፑ ውስጥ አብሮ የተሠራ፣ YouTubeን ወይም ማንኛውንም ሌላ ጣቢያ የሚከፍት browser: ሊንክ ሳይገለብጡ ያስሳሉ እና ያወርዳሉ፣ እንዲሁም የግል፣ የአባላት-ብቻ እና ዕድሜ-የተገደቡ ቪዲዮዎችን እና የWatch Later እና Liked ዝርዝሮችዎን ለማውረድ እዚያ አንድ ጊዜ ይገባሉ፣ ኩኪዎችን ወደ ውጭ መላክ ሳያስፈልግ። YouTube ቦት አለመሆንዎን እንዲያረጋግጡ ሲጠይቅ Arroxy ያንን መግቢያ ይጠቀማል፣ አብሮ የተሠራው browser ደግሞ ማውረዶች ወደ ያነሱ ቅርጸቶች እንዳይወርዱ የYouTube የማውረጃ ቶከን ያገኛል። [ለምን Arroxy](#why) ይመልከቱ።

</details>

<details>
<summary><strong>ምን ዓይነት ቪዲዮ ጥራቶች ማውረድ እችላሉ?</strong></summary>

YouTube የሚሰጣቸው ሁሉ: 8K (4320p)፣ 4K UHD (2160p)፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p፣ እና ድምፅ ብቻ። 60 fps እና HDR ዥረቶች እንዳሉ ይጠበቃሉ፤ ደረጃ በደረጃ ማውረዱም በእያንዳንዱ ጥራት መጠን AV1፣ VP9 ወይም H.264 እንዲመርጡ ያስችልዎታል።

</details>

<details>
<summary><strong>ድምፁን ብቻ MP3 አድርጎ ማቅረብ ይቻላሉ?</strong></summary>

አዎ። በፎርማት ሜኑ ውስጥ *ኦዲዮ ብቻ* ምረጥ እና MP3፣ M4A/AAC፣ Opus ወይም WAV ምረጥ።

</details>

<details>
<summary><strong>YouTube ሒሳብ የሚፈልጉ ቪዲዮዎችን እንዴት አወርዳለሁ?</strong></summary>

በExplore ትር ውስጥ አንድ ጊዜ ይግቡ። ከዚያ Arroxy ሒሳብዎ ማየት የሚችላቸውን የግል እና የአባላት-ብቻ ቪዲዮዎች፣ ሒሳቡ በዕድሜ ከተረጋገጠ ዕድሜ-የተገደቡ ቪዲዮዎች፣ እንዲሁም የWatch Later እና Liked ዝርዝሮችዎን ማውረድ ይችላል። መግቢያውን የሚጠቀመው ማውረድ ሒሳብ ሊያስተካክለው በሚችል መንገድ ሲወድቅ ብቻ ነው፤ የቀረው ሁሉ እንደ ቀድሞው ይወርዳል። ይህ **Explore መግቢያ** ምርጫ ነው፣ በኩኪ ቅንብሮች ውስጥ መጀመሪያ የተዘረዘረ እና Recommended ተብሎ የተመለከተ፣ እና Explore ለመጀመሪያ ጊዜ ሲከፍቱ Arroxy ራሱ ይመርጣል። የ yt-dlp ዊኪ [በመግቢያ የሚደረግ አውቶሜሽን የ Google ሒሳብን ሊያመለክት እንደሚችል](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) ያስታውቃል፣ ስለዚህ ሁለተኛ ሒሳብ ጥንቃቄ ያለው ምርጫ ነው።

</details>

<details>
<summary><strong>YouTube ሲቀያየር አሁንም ይሠራሉ?</strong></summary>

yt-dlp በማስነሻ ላይ ራስ ሰር ይዘመናሉ፣ እናም YouTube አንድ ነገር ሲቀይር Arroxy እርማቶችን በፍጥነት ያደርሳሉ። YouTube ቦት አለመሆንዎን እንዲያረጋግጡ ሲጠይቅ፣ እዚያ ከገቡ Arroxy የExplore መግቢያዎን ደግሞ ይሞክራል፣ እና ከፋይል ወይም ከbrowser የሚመጡ ኩኪዎች በኩኪ ቅንብሮች ውስጥ ይገኛሉ።

</details>

<details>
<summary><strong>Arroxy በምን ቋንቋዎች ይገኛሉ?</strong></summary>

31 ቋንቋዎች ወዲያውኑ ይገኛሉ፦ Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文። Arroxy በመጀመሪያ ሲጀመር የእርስዎን የስርዓተ ክወና ቋንቋ በራስ-ሰር ያውቃል፣ እና በመሳሪያ አሞሌው ውስጥ ካለው ቋንቋ መራጭ በማንኛውም ጊዜ መቀየር ይችላሉ። Runtime locale JSON በ src/shared/i18n/locales/ ውስጥ ይኖራል፣ የተርጓሚዎች PO ካታሎጎች ደግሞ በ i18n/locales/ ውስጥ ይኖራሉ — ለመሳተፍ GitHub ላይ PR ይክፈቱ።

</details>

<details>
<summary><strong>ሌላ ነገር ጫን ያስፈልጋሉ?</strong></summary>

አይ። yt-dlp፣ ffmpeg እና ffprobe በመጀመሪያ አስጀማሪ ራስ-ሰር ይወርዳሉ እና በማሽንዎ ላይ ይቀመጣሉ። ከዚያ ተጨማሪ setup አያስፈልግም።

</details>

<details>
<summary><strong>ፕሌይሊስቶች ወይም ሙሉ ቻናሎች ማውረድ ይቻላሉ?</strong></summary>

አዎ — ሁለቱም። የplaylist ወይም channel URL ይለጥፉ (ለምሳሌ `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); ስንት ግቤቶች እንዲቃኙ ይምረጡ፣ ከዚያም ሙሉውን ዝርዝር ወደ ወረፋ ያክሉ ወይም ቪዲዮዎችን በተናጠል ይምረጡ። የቀን ክልል ማጣሪያዎች በቅርቡ ይመጣሉ።

</details>

<details>
<summary><strong>macOS "አፕ ተጎድቷል" ይላሉ — ምን ማድረግ አለብኝ?</strong></summary>

ያ macOS Gatekeeper ያልተፈረመ app እየከለከለ ነው፣ እውነተኛ ጉዳት አይደለም። quarantine ለማስወገድ እና Arroxyን ለማስነሳት የTerminal ትዕዛዞችን በ[macOS first launch](#macos-first-launch) ይመልከቱ።

</details>

<details>
<summary><strong>YouTube ቪዲዮዎች ማውረድ ሕጋዊ ነው?</strong></summary>

ለግል፣ ሚስጥራዊ አጠቃቀም በአብዛኛዎቹ ዳኝነቶች ተቀባይነት ያለው ነው። የ YouTube [የአገልግሎት ደንቦቹን](https://www.youtube.com/t/terms) እና የቦታዎ የቅጂ መብት ሕጎቹን ማክበር ኃላፊነትዎ ነው።

</details>

---

## <a id="roadmap"></a>🗺️ ወደፊት ዕቅድ

አሁንም የታቀደ — በግምት በቅድሚያ ቅደም ተከተል:

| ባህሪ    | ዝርዝር    |
| ---------------- | ---------------- |
| **የፕሌይሊስት እና ቻናል ማጣሪያዎች** | playlist ወይም channel ሲዘረዝሩ የቀን ክልል ማጣሪያዎች |
| **የYouTube ድምጽ ትራክ ምርጫዎች** | YouTube ብዙ የድምጽ ትራኮች ሲሰጥ በapp ሙሉ የንግግር ቋንቋ ትራክ ምርጫ ያዘጋጁ፣ በprofile ደረጃ override ያድርጉ |
| **የተጠናከረ ዳግም ሙከራ መልሶ ማገገም** | በማይታመን ወይም ችግኝ ያለው የኢንተርኔት ግንኙነት የተቋረጡ ማውረዶችን ለመቀጠል አዲስ የዳግም ሙከራ መንገድ |
| **ሙሉ የማውረድ አስተዳዳሪ መሳቢያ** | የqueue መሳቢያውን ወደ ሙሉ አስተዳዳሪ መቀየር፣ ለተሰለፉ ንጥሎች destination folder መቀየርን ጨምሮ |
| **የቀጠሮ ማውረዶች** | ወረፋ በተወሰነ ሰዓት ጀምሩ (ሌሊት ሂደቶች) |
| **የAUR ጥቅል** | በArch Linux እና Omarchy ላይ በ`yay -S arroxy-bin` ይጫኑ |

ባህሪ ሀሳብ አለዎ? [ጥያቄ ይክፈቱ](../../issues) — ማህበረሰቡ አስተዋጽኦ ቅድሚያ ይወስናሉ።

---

## <a id="support"></a>💖 Arroxy ይደግፉ

Arroxy ነፃ ነው እና በMIT ፈቃድ ይሰራጫል — ማስታወቂያ የለም፣ ቴሌሜትሪ የለም፣ የሚከፈልበት እትም የለም። ጊዜዎን የሚቆጥብ ከሆነ ልማቱን በBitcoin፣ በTron ወይም በEthereum መደገፍ ይችላሉ፦ አድራሻዎቹ በ[DONATE.md](DONATE.md) ውስጥ ይገኛሉ፣ እርሱም ብቸኛው ይፋዊ ምንጫቸው ነው። Arroxy በኢሜይል ወይም በቀጥታ መልእክት አድራሻ በፍጹም አይልክልዎትም። ማከማቻውን በኮከብ ምልክት ማድረግ፣ ስህተቶችን ማሳወቅ እና ትርጉሞችን ማሻሻል እኩል ይረዳሉ።

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ ከምን ተሠርቷል

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — ለሁሉም ዓይነት ሥርዓተ ክወና የሚሠራ የዴስክቶፕ ቅጥፈት
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — ቅጥ አሠጣጥ
- **Zustand** — የሁኔታ አስተዳደር
- **yt-dlp** + **ffmpeg** — የማውረድ እና mux ሞተር (ሁለቱም በ runtime ይወርዳሉ፤ yt-dlp ወቅታዊ ሆኖ ይቆያል፣ ffmpeg/ffprobe አንድ ጊዜ ተጭነው ከዝማኔዎች በኋላም ይቀጥላሉ)
- **Vite** + **electron-vite** — የግንባታ መሣሪያዎች
- **Vitest** + **Playwright** — የአሃዳዊ እና ከጫፍ-ወደ-ጫፍ ፈተናዎች

</details>

<details>
<summary><strong>ከምንጩ ግንባታ</strong></summary>

### ቅድመ ሁኔታዎች — ለሁሉም ዓይነት ሥርዓቶች

| መሣሪያ  | ስሪት    | ጫን |
| ------- | ------- | ------- |
| Git     | any     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` ወይም `.node-version` |
| Bun     | 1.4.2  | `mise install` ወይም `package.json` `packageManager` |

የሚመከር: `mise` ይጫኑ፣ ከዚያ checkout ውስጥ `mise install` ያሂዱ። mise ካልተጠቀሙ፣ `bun run bootstrap` ከመሮጡ በፊት Node.jsን ከ`.node-version` እና Bunን ከ`package.json` በእጅ ያንቁ።

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

ለ native rebuilds Visual Studio Build Tools እና Python ሊያስፈልጉ ይችላሉ።

### macOS

```bash
brew install mise
xcode-select --install
```

ከ clone በኋላ በ checkout ውስጥ `mise trust && mise install` ያስኪዱ። shell እርስዎ አስቀድሞ `fnm`፣ `nvm` ወይም Homebrew Bun የሚጠቀም ከሆነ፣ Arroxy Node.js 24.21.0 እና Bun 1.4.2 እንዲጠቀም `~/.zshrc` ውስጥ mise ን ያንቁ:

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

# Build እና Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### ቅዳና አሂድ

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # የሚመከር፤ pinned tools በእጅ ካነቃችሁ ይዝለሉት
bun run bootstrap
bun run doctor
bun run dev            # Electron app ከ Vite renderer ጋር
```

### ሊሰራጭ የሚችል ፋይል ምንጭ

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # supported host ላይ Windows targets package ማድረግ
```

> `bun run bootstrap` dependencies ይጭናል፣ Electron app dependencies rebuild ያደርጋል፣ Electron ያረጋግጣል፣ ለ development embedded ffmpeg/ffprobe ያዘጋጃል፣ እና Playwright Chromium ይጭናል። በRelease builds ውስጥ yt-dlp፣ ffmpeg እና ffprobe በ runtime በ app data folder ውስጥ managed ይሆናሉ፤ አንዳቸውም በ installer ውስጥ አይካተቱም።

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

## 📜 የአጠቃቀም ደንቦች

Arroxy ለግል፣ ሚስጥራዊ አጠቃቀም ብቻ ሶፍትዌር ነው። ማውረዶቹ የ YouTube [የአገልግሎት ደንቦቹን](https://www.youtube.com/t/terms) እና የቦታዎ የቅጂ መብት ሕጎቹን ማክበር ሙሉ ኃላፊነትዎ ነው። Arroxy ን ለማውረድ፣ ለማባዛት ወይም ሊጠቀሙበት የማይፈቅዱ ይዘቶችን ለማሰራጨት አይጠቀሙ። ገንቢዎቹ ለምን ዓይነት አላግባብ አጠቃቀም ኃላፊነት አይወስዱም።

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
