<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="የ Arroxy መሸፈኛ" width="180" />

# Arroxy — ነፃ ምን ኮድ ያለው YouTube (+ 2000 ጣቢያ) አውራጅ ለ Windows, macOS እና Linux

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**አንብብ በ:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · **አማርኛ** · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![ስሪት](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![ግንባታ](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![ድር ጣቢያ](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![ፈቃድ](https://img.shields.io/badge/license-MIT-green) ![ሥርዓቶች](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![ቋንቋዎች](https://img.shields.io/badge/i18n-21_languages-blue)

ቪዲዮዎች፣ Shorts፣ ሙዚቃ፣ ቻናሎች፣ ፖድካስቶች ወይም የድምፅ ትራኮች ከ**YouTube እና ከ2000+ ተደገፉ ጣቢያዎች** ያውርዱ — እስከ 4K HDR በ60 fps፣ ወይም MP3 / AAC / Opus። በ Windows፣ macOS፣ እና Linux ላይ አካባቢያዊ ሆኖ ይሠራል። **ምንም ማስታወቂያ፣ ምንም ብዝሃ ሸቀጥ፣ ምንም ተጨማሪ ሽያጭ።**

[**↓ የቅርብ ጊዜ ስሪት አውርድ**](../../releases/latest) &nbsp;·&nbsp; [**ድር ጣቢያ**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="የ Arroxy ማሳያ" width="720" />

Arroxy ጊዜ ካስቆጠበዎ፣ ⭐ ሌሎች እንዲያገኙት ይረዳል።

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

---

## ዝርዝር

- [ለምን Arroxy](#why)
- [ባህሪያት](#features)
- [አውርድ](#download)
- [ግላዊነት](#privacy)
- [ተደጋጋሚ ጥያቄዎች](#faq)
- [ወደፊት ዕቅድ](#roadmap)
- [ከምን ተሠርቷል](#tech)

---

## <a id="why"></a>ለምን Arroxy

ከተለመዱ አማራጮች ጋር ጎን ለጎን ማወዳደሪያ:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| ነፃ፣ ምንም ፕሪሚየም ደረጃ የለም |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| ምን ኮድ ያለው |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| አካባቢያዊ ሂደት ብቻ |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| ምንም ግባ ወይም ኩኪ ላክ |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| ምንም የአጠቃቀም ወሰን |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| ለሁሉም ዓይነት ሥርዓቶች የሚሠራ የዴስክቶፕ አፕ |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| ንዑስ ርዕሶች + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy ለአንድ ነገር ብቻ ተሠርቷል: URL ይለጥፉ፣ ንጹህ አካባቢያዊ ፋይል ያግኙ። ምንም ሒሳቦች፣ ምንም ሽያጭ፣ ምንም የዳታ ስብስብ።

---

## <a id="features"></a>ባህሪያት

### ጥራት እና ቅርጸቶች

- እስከ **4K UHD (2160p)**፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p
- **ፈጣን የፍሬም ፍጥነት** እንዳለ ተጠብቆ — 60 fps፣ 120 fps፣ HDR
- **ኦዲዮ ብቻ** ወደ MP3፣ M4A/AAC፣ Opus ወይም WAV ማውጣት
- ፈጣን ቅድመ ቅንብሮች: *ምርጥ ጥራት* · *ሚዛናዊ* · *ትንሽ ፋይል*

### ግላዊነት እና ቁጥጥር

- 100% አካባቢያዊ ሂደት — ማውረዶች ቀጥታ ከ YouTube ወደ ዲስክዎ ይሄዳሉ
- ምንም ግባ፣ ምንም ኩኪ፣ ምንም Google ሒሳብ አልተያያዘም
- ፋይሎች ወደ መረጡት አቃፊ ቀጥታ ተቀምጠዋል

### የሥራ ፍሰት

- **ማንኛውንም ሊንክ ለጥፍ** — YouTube ቪዲዮዎች፣ Shorts፣ ቻናሎች፣ ፕሌይሊስቶች፣ ፖድካስቶች እና YouTube Music፣ እናም yt-dlp ከሚደግፋቸው 2000+ ሌሎች ጣቢያዎች፤ playlist ሙሉውን አውርድ ወይም መጀመሪያ የተወሰኑ ቪዲዮዎችን ምረጥ
- **ብዙ ማውረድ ወረፋ** — ብዙ ማውረዶችን አንድ ጊዜ ይከታተሉ
- **ክሊፕቦርድ ክትትል** — YouTube ሊንክ ቅዱ እና Arroxy ወደ አፕ ሲመለሱ URL ን አውቶሜቲክ ይሙላሉ (በ Advanced settings ውስጥ ያብሩ/ያጥፉ)
- **URL ን ራስ ሰር ያጥሩ** — ትራኪንግ ፓራሜትሮችን (`si`፣ `pp`፣ `utm_*`፣ `fbclid`፣ `gclid`) ያስወግዳሉ እና `youtube.com/redirect` ሊንኮችን ያሰናስሉ
- **ትሬ ሁነታ** — መስኮቱን መዝጋት ማውረዶቹን በጀርባ ያስቀጥላሉ
- **21 ቋንቋዎች** — የሥርዓት ቋንቋ ራስ ሰር ያውቃሉ፣ ሁልጊዜ መቀየር ይቻላሉ
- **የአጫዋች ዝርዝር ማመሳሰል** — አስቀድሞ የወረዱ ቪዲዮዎችን ለመዝለል አጫዋች ዝርዝርን ከአካባቢያዊ ፎልደር ጋር ዳግም ይፈትሻል፤ እያንዳንዱ ቪዲዮ ሲወርድ የሚዘምን `.m3u` የአጫዋች ዝርዝር ፋይል ይፈጥራል
- **ጥንቃቄ ሁነታ** — በከባድ አጫዋች ዝርዝሮች ላይ bot-block የመከሰት እድልን ለመቀነስ በጥያቄዎች መካከል መዘግየቶችን የሚጨምሩ እና fragment threads የሚገድቡ የሚዋቀሩ የፍጥነት ቅድመ-ቅንብሮች (*ጠፍቷል · ሚዛናዊ · ጥንቃቄ · ብጁ*)

### ንዑስ ርዕሶች እና ድህረ-ሂደት

- **ንዑስ ርዕሶች** በ SRT፣ VTT፣ ወይም ASS — እጅ ወይም ራስ ሰር የተፈጠሩ፣ በማንኛውም ቋንቋ
- ከቪዲዮ ጎን ያቆዩ፣ ወደ `.mkv` ያካቱ፣ ወይም ወደ `Subtitles/` ንዑስ አቃፊ ያዘጋጁ
- **SponsorBlock** — ስፖንሰሮችን፣ ምዕራፍ ምልክቶችን፣ ወደፊት ምዕራፎችን፣ ራስ ሰር ማስታወቂያዎችን ዝለሉ ወይም ምዕራፍ ምልክት ያድርጉ
- **የተካተተ ሜታዳታ** — ርዕስ፣ የሰቀሉ ቀን፣ ቻናል፣ ዝርዝር፣ አናት ስእል፣ እና ምዕራፍ ምልክቶች ወደ ፋይሉ ተጽፈዋል

### YouTube + 2000 ጣቢያዎች

- **YouTube ሙሉ** — ቪዲዮዎች፣ Shorts፣ ቻናሎች፣ ፕሌይሊስቶች፣ YouTube Music እና ፖድካስቶች እንደ ቀዳሚ ምንጮች ይታሰባሉ
- **2000+ ሌሎች ጣቢያዎች** yt-dlp አማካኝነት — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org እና ሌሎች ብዙ
- **ኦዲዮ ብቻ እና ጽሑፍ ርዕሶች** ሁሉም ተደጋፊ ጣቢያዎች ላይ ይሠራሉ፣ YouTube ብቻ ሳይሆን
- ጣቢያ ሲቀይር yt-dlp በሳምንት ውስጥ ማሻሻያዎችን ይልካሉ፣ Arroxy ደግሞ ሲጀምር binary ን ራስ-ሰር ያዘምናሉ

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="URL ይለጥፉ" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="ጥራትዎን ይምረጡ" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="የሚቀምጡበት ቦታ ይምረጡ" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="የማውረድ ወረፋ እርምጃ ላይ" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="የንዑስ ርዕስ ቋንቋ እና ቅርጸት መምረጫ" />
</div>

---

## <a id="download"></a>አውርድ

| ሥርዓተ ክወና | ቅርጸት   |
| ------------------- | ------------------- |
| Windows             | ጫኝ (NSIS) ወይም ተጓዥ `.exe`   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` ወይም `.flatpak` (ለቅርቅብ) |

[**የቅርብ ጊዜ ስሪት ይያዙ →**](../../releases/latest)

### <a id="why-warning"></a>ለምን ማስጠንቀቂያ ሊታዩዎ ይችላሉ

Arroxy ምን ኮድ ያለው (open-source) እና MIT ፈቃድ ያለው ነው። የ Windows እና macOS ቅጅዎቹ **ኮድ አልተፈረመባቸውም** — Apple Developer ID እና Windows EV ኮድ-ፊርማ ሰርቲፊኬቶቹ እያንዳንዳቸው በዓመት በመቶዎች ዶላር ያስወጣሉ፣ ይህ ነጻ ፕሮጀክት ከኪሳቸው ይከፍላሉ። ያነዚህ ፊርሞች ሳይኖሩ፣ Windows SmartScreen እና macOS Gatekeeper በመጀመሪያ አስጀማሪ ያስጠነቅቋቸዋል። ማስጠንቀቂያዎቹ *ሥርዓተ ክወናዎ ናሸርን አይለይም* ማለት ናቸው — Arroxy ተንኮል-አዘል ሶፍትዌር ነው ማለት አይደሉም።

Arroxy ን ራስዎ ለማረጋገጥ ሦስት መንገዶች፣ ከፍ እያለ በሚሄድ ጥብቅነት:

- **ምንጩን ያንብቡ።** ሁሉም መስመሮች [GitHub](https://github.com/antonio-orionus/Arroxy) ላይ ናቸው፣ እናም [ከምንጩ ሊሠሩ](#tech) ይችላሉ።
- **SHA256ን ያረጋግጡ።** ፋይልዎን ከታተሙት [`SHA256SUMS`](../../releases/latest) ጋር ያዛምዱ — ከዚህ በታች [ማውረዱን ያረጋግጡ](#verify) ይመልከቱ።
- **የሦስተኛ ወገን ቅኝት ያካሂዱ።** ፋይሉን ወደ [VirusTotal](https://www.virustotal.com) ይጫኑ።

### <a id="windows-first-launch"></a>Windows ላይ ለመጀመሪያ ጊዜ አስጀምር

በመጀመሪያ ጊዜ ሲጀምሩ **"Windows protected your PC"** ወይም **"Unknown publisher"** ሊያዩ ይችላሉ። ይህ ለ `Arroxy-Setup-*.exe` እና `Arroxy-Portable-*.exe` ሁለቱም ይሠራሉ። Arroxy ነፃ እና ምን ኮድ ያለው ሲሆን የ Windows ቅጅዎቹ ባለ ክፍያ የምስክር ወረቀት ተፈርመዋ አይደሉም፣ ስለዚህ SmartScreen ያሳዩዋቸዋል። ይህ Arroxy ደህና ያልሆነ ማለት **አልሆነም**። ለቀጠሉ:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" መልዕክት ሳጥን፣ "More info" ሊንክ ተጎልቶ ከሚታይ ጋር" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="More info ከተከፈተ በኋላ SmartScreen መልዕክት ሳጥን፣ "Run anyway" ቁልፍ ከሚታይ ጋር" />
</div>

1. **More info** ጠቅ ያድርጉ።
2. **Run anyway** ጠቅ ያድርጉ።

#### Windows Defender ፋይሉን ቢሰምናቸው ወይም ቢያስወግዳቸው

Defender ሂዩሪስቲክስ አንዳንድ ጊዜ ያልተፈረሙ NSIS ጫኞችን እና Electron ተጓዥዎችን ጥርጣሬ አዘል ብሎ ሊሰምናቸው ይችላሉ። Defender `Arroxy-Setup-*.exe` ወይም `Arroxy-Portable-*.exe` ን ካቆጠቆጠ፣ ከ **Windows Security → Virus & threat protection → Protection history** ይመልሱ፣ ከዛ Arroxy ን ሊፈጸም የሚችልን ፋይል **Manage settings → Add or remove exclusions** ስር ፈቀደ ሆኖ ያክሉ። እንደ SmartScreen ሁሉ፣ ምክንያቱ አልተገኘ ተንኮል-አዘል ሶፍትዌር ሳይሆን የጎደለ ናሸር ፊርማ ነው።

> Arroxy'ን ከይፋዊው GitHub Releases ገጽ ብቻ ያውርዱ። ፋይሉን ሌላ ድር ጣቢያ ካወረዱ ወይም ሌሎች ከላኩልዎ፣ ሰርዘው ከይፋዊ ምንጩ አዲስ ቅጅ ያውርዱ። ምንጩ ህዝባዊ ስለሆነ ራስዎ ሊፈትሹ ወይም Arroxy'ን ሊሠሩ ይችላሉ።

### <a id="macos-first-launch"></a>macOS ላይ ለመጀመሪያ ጊዜ አስጀምር

Arroxy ለ macOS ኮድ ሳይፈርም ስለሆነ፣ Gatekeeper ለመጀመሪያ አስጀምሩ ያግዳሉ። እሱን ለመፍቀድ ያለው ትክክለኛ ዘዴ macOS ስሪቶ ላይ ይወሰናሉ — Sequoia 15 ቀድሞ ያለውን ቀኝ-ጠቅ → Open ማለፊያ አጥብቋቸዋሉ።

#### macOS Sequoia 15 እና ከዚህ በኋላ (ወቅታዊ)

Sequoia 15 እና አዳዲስ ስሪቶቹ ላይ፣ ቀኝ-ጠቅ → Open ለብዙ ቆጠቡ አፖቹ Gatekeeper ን ያሳልፋቸዋሉ አልሆነም። ምትክ ሥርዓት ቅንብሮች ፓነልን ይጠቀሙ:

1. ከተቀጠለው DMG ውስጥ `Arroxy.app` ን ወደ `/Applications` ጎትቱ።
2. Arroxy ን ሁለቴ ጠቅ ያድርጉ። የማገጃ መልዕክት ሳጥን ይታያሉ — **Done** ጠቅ ያድርጉ (*Move to Trash* አይጫኑ)።
3. **System Settings → Privacy & Security** ይክፈቱ እና ወደ **Security** ክፍሉ ያሸብልሉ። *"Arroxy was blocked to protect your Mac"* (ወይም ቅርብ ተመሳሳይ መልዕክት) ያዩሉ።
4. **Open Anyway** ጠቅ ያድርጉ፣ በይለፍ ቃልዎ ወይም Touch ID ያረጋግጡ፣ ከዛ Arroxy ን ከ `/Applications` ያስጀምሩ።

#### macOS Sonoma 14 እና ከዚህ ቀደም

1. ከተቀጠለው DMG ውስጥ `Arroxy.app` ን ወደ `/Applications` ጎትቱ።
2. በ `/Applications` ውስጥ `Arroxy.app` ን ቀኝ-ጠቅ ያድርጉ (ወይም Control-click) እና **Open** ይምረጡ።
3. የማስጠንቀቂያ መልዕክት ሳጥን አሁን **Open** ቁልፍ አለው — ጠቅ ያድርጉ እና ያረጋግጡ። Arroxy በተለምዶ ይከፈቱ እናም ማስጠንቀቂያ ሁሌ አይታዩም።

#### "App is damaged" ወይም ቀጣይ Gatekeeper ማገጃ — Terminal ዘዴ

macOS *"Arroxy is damaged and can't be opened"* ቢል፣ ወይም ከላይ ያሉት ምንም ቃምሶዎች ማገጃውን ባያስወግዱ፣ DMG ላይ ያለው ቆጠቡ ባህሪ ምክንያቱ ነው (አንዳንድ ብሮውዘሮች እና macOS ራሱ የ translocation ባህሪ ያቀናጁ)። ከተጫነው አፕ ያስወግዱ:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel:** M-ሰሪ Mac ላይ (M1 / M2 / M3 / M4)፣ `arm64` DMG ያውርዱ። Intel Mac ላይ፣ `x64` DMG ያውርዱ። የተሳሳተ ቅጅ ማሂደት Rosetta በኩል ይሠራሉ ነገር ግን በግልጽ ዘገምተኛ ነው።

> macOS ሕንጻዎች ከ Apple Silicon እና Intel ሩጫዎች በ CI ላይ ይሠራሉ። ችግር ካጋጠምዎ፣ [ጉዳይ ይክፈቱ](../../issues) — ከ macOS ተጠቃሚዎች ያለው ምላሽ የ macOS ፈተና ዑደቱን ቀጥታ ይቀርፃሉ።

### <a id="linux-first-launch"></a>Linux ላይ ለመጀመሪያ ጊዜ አስጀምር

AppImages ቀጥታ ይሠራሉ — ምንም ጫሌ አያስፈልጋቸውም። ፋይሉን ሊፈጸም እንደሚችል ብቻ ምልክት ማድረግ ያስፈልጋሉ።

**ፋይል አስተዳዳሪ:** `.AppImage` ላይ ቀኝ ጠቅ ያድርጉ → **Properties** → **Permissions** → **Allow executing file as program** ያብሩ፣ ከዛ ሁለቴ ጠቅ ያድርጉ።

**ቴርሚናል:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

አስጀምሩ አሁንም ሳይሠራ ቢቀር፣ FUSE ጎደለ ሊሆን ይችላሉ:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**አማራጭ የዴስክቶፕ ውህደት:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ን አንድ ጊዜ ጫኑ፣ ሁለቴ ጠቅ ያደርጉበት ማንኛውም AppImage በጀምር ምናሌዎ ውስጥ ራስ-ሰር ይመዘገባሉ — ምንም እጅ `.desktop` ፋይል አያስፈልጋቸውም።

**Flatpak (ለቅርቅብ አማራጭ):** `Arroxy-*.flatpak` ን ከተመሳሳዩ ስሪት ገጽ ያውርዱ።

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>ማውረዱን ያረጋግጡ (SHA256)</strong></summary>

ሁሉም ስሪቶቹ ከሁለትዮሽ ፋይሎቹ ጎን `SHA256SUMS` ፋይልን ያሳትማሉ። ማውረዱ ሳይበላሽ ወይም ሳይሻሻል እንደደረሰ ለማረጋገጥ፣ ፋይልዎን ሃሽ ያድርጉ እና `SHA256SUMS` ውስጥ ካለው መስመር ጋር ያዛምዱ። ቅርቡን ስሪት ገጽ ይክፈቱ → **Assets** → `SHA256SUMS` ያውርዱ።

**Windows (PowerShell ወይም Command Prompt):**

```powershell
certutil -hashfile Arroxy-Setup-<version>.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-<version>-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-*.AppImage
```

የሦስተኛ ወገን ተንኮል-አዘል ሶፍትዌር ቅኝት ይፈልጋሉ? ፋይሉን [VirusTotal](https://www.virustotal.com) ላይ ይጫኑ። ከቀዳሚ ሞተሮቹ ጥቂት ሂዩሪስቲክ ምልክቶቹ ፊርማ ላልተደረገባቸው Electron አፖ ዘወትር ናቸው; ከዋና ሞተሮቹ ሰፊ ምልክቶቹ ሐቀኛ ጉዳይ ሊሆኑ ይችላሉ።

</details>

<details>
<summary><strong>በፓኬጅ አስተዳዳሪ ጫን</strong></summary>

አስቀድሞ የፓኬጅ አስተዳዳሪ ይጠቀማሉ? ሰነዳዊ ማውረዱን መዝለፍ ይቻሉ።

| ቻናል | ትዕዛዝ                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-*.flatpak`                                                         |

</details>

<details>
<summary><strong>Windows: ጫኝ vs ተጓዥ</strong></summary>

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

## <a id="privacy"></a>ግላዊነት

ማውረዶቹ ቀጥታ በ [yt-dlp](https://github.com/yt-dlp/yt-dlp) ከ YouTube ወደ መረጡት አቃፊ ይወርዳሉ — ምንም ሦስተኛ ወገን ሰርቨር አይሆንም። የእይታ ታሪክ፣ የማውረድ ታሪክ፣ URLs፣ እና የፋይሎቹ ይዘቶች በመሳሪያዎ ላይ ይቆያሉ።

Arroxy ስም-አልባ፣ የተጠቃለለ telemetry በ [OpenPanel](https://openpanel.dev) ይልካል — ጅምሮችን፣ OS፣ የአፕ ስሪቶችን እና ብልሽቶችን ለመረዳት ብቻ። URLs፣ የቪዲዮ ርዕሶች፣ የፋይል መንገዶች፣ የመለያ መረጃ፣ fingerprinting ወይም የግል ዳታ የለም። የእያንዳንዱ ጭነት ID የዘፈቀደ ነው እና ከማንነትዎ ጋር አይያያዝም። በSettings ውስጥ opt out ማድረግ ይችላሉ።

---

## <a id="faq"></a>ተደጋጋሚ ጥያቄዎች

**በርግጥ ነፃ ነው?**
አዎ — MIT ፈቃድ አለው፣ ምንም ፕሪሚየም ደረጃ፣ ምንም ባህሪ ቁጥጥር የለም።

**ምን ዓይነት ቪዲዮ ጥራቶች ማውረድ እችላሉ?**
YouTube የሚሰጣቸው ሁሉ: 4K UHD (2160p)፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p፣ እና ድምፅ ብቻ። 60 fps፣ 120 fps፣ እና HDR ዥረቶች እንዳሉ ይጠበቃሉ።

**ድምፁን ብቻ MP3 አድርጎ ማቅረብ ይቻላሉ?**
አዎ። በፎርማት ሜኑ ውስጥ *ኦዲዮ ብቻ* ምረጥ እና MP3፣ M4A/AAC፣ Opus ወይም WAV ምረጥ።

**YouTube ሒሳብ ወይም ኩኪዎች ያስፈልጉናሉ?**
በነባሪ፣ አይ — Arroxy ያለ YouTube ሒሳብ፣ ግባ ወይም ኩኪ ማውጣት ይሠራል። እንደ ዕድሜ-የተገደቡ ወይም የአባላት-ብቻ ቪዲዮዎች ላሉ ማረጋገጫ ለሚፈልጉ ይዘቶች በተራቀቁ ቅንብሮች ውስጥ ተመራጭ የኩኪ ድጋፍ አለ (Cookies source: file or browser)። በነባሪ የጠፋ ነው። ካበሩት፣ የ yt-dlp ዊኪ [በኩኪ ላይ የተመሠረተ አውቶሜሽን የ Google ሒሳብን ሊያመለክት እንደሚችል](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) ያስታውቃሉ፤ በዚያ ሁኔታ ጊዜያዊ ሒሳብ ጥንቃቄ ያለው ምርጫ ነው።

**YouTube ሲቀያየር አሁንም ይሠራሉ?**
yt-dlp በማስነሻ ላይ ራስ ሰር ይዘመናሉ፣ እናም YouTube አንድ ነገር ሲቀይር Arroxy እርማቶችን በፍጥነት ያደርሳሉ። ችግር ካጋጠምዎ፣ በተራቀቁ ቅንብሮች ውስጥ እንደ ዳግም መመለሻ ተመራጭ የኩኪ ድጋፍ አለ።

**Arroxy በምን ቋንቋዎች ይገኛሉ?**
ሃያ አንድ፣ ከሳጥን ውጭ: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), हिन्दी (Hindi), Afaan Oromoo, Kiswahili, O'zbekcha (Uzbek), Tiếng Việt (Vietnamese), አማርኛ (Amharic), العربية (Arabic), اردو (Urdu), پښتو (Pashto), বাংলা (Bengali), မြန်မာဘာသာ (Burmese), Ελληνικά (Greek) እና Српски (Serbian)። Arroxy በመጀመሪያ ጊዜ ሲጀምሩ የስርዓተ ምOS ቋንቋዎን ራስ-ሰር ያወቃል፣ ከመሳሪያ አሞሌ የቋንቋ ምርጫ ማንኛውም ጊዜ መቀየር ይችላሉ። ትርጉሞች ከ src/shared/i18n/locales/ ውስጥ ቀላል TypeScript ዕቃዎች ናቸው — ለማዋጮ GitHub ላይ PR ይክፈቱ።

**ሌላ ነገር ጫን ያስፈልጋሉ?**
አይ። yt-dlp በመጀመሪያ አስጀማሪ ራስ-ሰር ይወርዳል እና በማሽንዎ ላይ ይቀመጣል፤ ffmpeg እና ffprobe ከአፑ ጋር ይመጣሉ። ከዚያ ተጨማሪ setup አያስፈልግም።

**ፕሌይሊስቶች ወይም ሙሉ ቻናሎች ማውረድ ይቻላሉ?**
አዎ — ሁለቱም። የፕሌይሊስት URL ወይም የቻናል URL ለጥፍ (ለምሳሌ `youtube.com/@handle`፣ `/channel/UC…`፣ `/c/Name`፣ `/user/Old`)፤ Arroxy እስከ 500 ግቤቶችን ዘርዝሮ ሙሉ ዝርዝሩን ወረፋ ያስቀምጣሉ ወይም የተወሰኑ ቪዲዮዎችን ይምረጡ። የቀን ወሰን እና ብዛት ማጣሪያዎች በቅርቡ ይመጣሉ።

**macOS "አፕ ተጎድቷል" ይላሉ — ምን ማድረግ አለብኝ?**
ያ macOS Gatekeeper ያልተፈረመ አፕ እየከለከሉ ናቸው፣ ሐቀኛ ጉዳት አይደሉም። ["App is damaged" — Terminal ዘዴ](#macos-first-launch) ን ለሚያጸዳው አንድ-ሸዊን `xattr` ትዕዛዝ ይመልከቱ።

**YouTube ቪዲዮዎች ማውረድ ሕጋዊ ነው?**
ለግል፣ ሚስጥራዊ አጠቃቀም በአብዛኛዎቹ ዳኝነቶች ተቀባይነት ያለው ነው። የ YouTube [የአገልግሎት ደንቦቹን](https://www.youtube.com/t/terms) እና የቦታዎ የቅጂ መብት ሕጎቹን ማክበር ኃላፊነትዎ ነው።

---

## <a id="roadmap"></a>ወደፊት ዕቅድ

የሚመጣ — ከቅድሚያ ቅደም ተከተሉ ጋር:

| ባህሪ    | ዝርዝር    |
| ---------------- | ---------------- |
| **የፕሌይሊስት እና ቻናል ማጣሪያዎች** | ፕሌይሊስት ወይም ቻናልን ሲዘረዝሩ የቀን ወሰን እና ብዛት ማጣሪያዎች (አሁን ወሰኑ ቋሚ 500 ግቤቶች ነው) |
| **ቡድን URL ግቤት** | ብዙ URLs አንድ ጊዜ ይለጥፉ እና አንድ ጊዜ ያሂዱ |
| **ተስማሚ ፋይል ስም ቅጥበቶች** | ፋይሎቹን በርዕስ፣ አሰቃዮ፣ ቀን፣ ጥራት — ቀጥተኛ ቅድዓሙ ጋር ስሟቸው |
| **የቀጠሮ ማውረዶች** | ወረፋ በተወሰነ ሰዓት ጀምሩ (ሌሊት ሂደቶች) |
| **የፍጥነት ወሰን** | ማውረዶቹ ግንኙነቱን እንዳይሞሉ ኢንተርኔት አቅምን ወሰን ያድርጉ |
| **ቁርጥ ምረጥ** | የጀምር/ማቆሚያ ጊዜ ብቻ ያወርዱ |

ባህሪ ሀሳብ አለዎ? [ጥያቄ ይክፈቱ](../../issues) — ማህበረሰቡ አስተዋጽኦ ቅድሚያ ይወስናሉ።

---

## <a id="tech"></a>ከምን ተሠርቷል

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — ለሁሉም ዓይነት ሥርዓተ ክወና የሚሠራ የዴስክቶፕ ቅጥፈት
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — ቅጥ አሠጣጥ
- **Zustand** — የሁኔታ አስተዳደር
- **yt-dlp** + **ffmpeg** — የማውረድ እና mux ሞተር (yt-dlp በ runtime ይወርዳል፤ ffmpeg/ffprobe በ build time ይካተታሉ)
- **Vite** + **electron-vite** — የግንባታ መሣሪያዎች
- **Vitest** + **Playwright** — የአሃዳዊ እና ከጫፍ-ወደ-ጫፍ ፈተናዎች

</details>

<details>
<summary><strong>ከምንጩ ግንባታ</strong></summary>

### ቅድመ ሁኔታዎች — ለሁሉም ዓይነት ሥርዓቶች

| መሣሪያ | ስሪት    | ጫን |
| ---- | ------- | ------- |
| Git  | any     | [git-scm.com](https://git-scm.com) |
| Bun  | latest  | ከዚህ በታች ለእያንዳንዱ ሥርዓተ ክወና ይመልከቱ |

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

ምንም ዓይነት ተወላጅ የግንባታ መሣሪያዎች አያስፈልጉም — ፕሮጀክቱ ምንም ዓይነት ተወላጅ Node ማስጨበጫዎች የለውም።

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### ቅዳና አሂድ

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
```

### ሊሰራጭ የሚችል ፋይል ምንጭ

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # cross-compile Windows portable exe
```

> yt-dlp በመጀመሪያ አስጀማሪ ከ GitHub ይወርዳል እና በ app data አቃፊ ይቀመጣል። ffmpeg እና ffprobe ከእያንዳንዱ የArroxy ስሪት ጋር ተካትተው ይመጣሉ።

</details>

---

## <a id="troubleshooting"></a>Troubleshooting

### App won't open / no window appears

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
.\Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-*.AppImage --disable-gpu
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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## የአጠቃቀም ደንቦች

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
