<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy မုဒ်ကော့" width="180" />

# Arroxy — Windows, macOS နှင့် Linux အတွက် အခမဲ့ Open-Source YouTube Downloader

**4K · 1080p60 · HDR · MP3 · Shorts · Subtitles · SponsorBlock**

**ဘာသာဖြင့် ဖတ်ရှုရန်:** [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [हिन्दी](README.hi.md) · [বাংলা](README.bn.md) · [العربية](README.ar.md) · [O'zbekcha](README.uz.md) · **မြန်မာဘာသာ** · [پښتو](README.ps.md) · [Kiswahili](README.sw.md) · [አማርኛ](README.am.md) · [Afaan Oromoo](README.om.md) · [Ελληνικά](README.el.md) · [Српски](README.sr.md)

[![Release](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) ![လိုင်စင်](https://img.shields.io/badge/license-MIT-green) ![Platforms](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![ဘာသာစကားများ](https://img.shields.io/badge/i18n-9_languages-blue)

မည်သည့် YouTube ဗီဒီယို၊ Short သို့မဟုတ် audio track ကိုမဆို မူလအရည်အသွေးဖြင့် ဒေါင်းလုဒ်ဆွဲပါ — 60 fps တွင် 4K HDR အထိ၊ သို့မဟုတ် MP3 / AAC / Opus အဖြစ်။ Windows, macOS နှင့် Linux တွင် သင့်ကွန်ပျူတာပေါ်တွင်သာ run ပါသည်။ **ကြော်ငြာမပါ၊ login မလိုအပ်၊ browser cookie မလိုအပ်၊ Google account ချိတ်ဆက်မှုမပါ။**

[**↓ နောက်ဆုံး Release ကို ဒေါင်းလုဒ်ဆွဲပါ**](../../releases/latest) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy demo" width="720" />

Arroxy သည် သင့်အချိန်ကို သက်သာစေပါက ⭐ တစ်ချက်က အခြားသူများ ရှာတွေ့ရန် ကူညီပါသည်။

</div>

---

## မာတိကာ

- [Arroxy ဘာကြောင့်](#why)
- [Cookie မပါ၊ login မပါ၊ account ချိတ်ဆက်မှုမပါ](#no-cookies)
- [လုပ်ဆောင်ချက်များ](#features)
- [ဒေါင်းလုဒ်](#download)
- [ကိုယ်ရေးကိုယ်တာ](#privacy)
- [မေးလေ့ရှိသောမေးခွန်းများ](#faq)
- [Roadmap](#roadmap)
- [တည်ဆောက်ထားသောနည်းပညာ](#tech)

---

## <a id="why"></a>Arroxy ဘာကြောင့်

အသုံးများဆုံး alternatives များနှင့် side-by-side နှိုင်းယှဉ်ချက်:

|                              | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------------------------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| အခမဲ့၊ premium tier မပါ        |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source                  |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Local processing သာ        |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Login သို့မဟုတ် cookie export မလိုအပ်    |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| အသုံးပြုမှုကန့်သတ်ချက်မပါ                |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Cross-platform desktop app   |   ✅   |         ✅          |     ✅      |             N/A            |         ❌         |
| Subtitles + SponsorBlock     |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy ကို တစ်ခုတည်းသောရည်ရွယ်ချက်ဖြင့် တည်ဆောက်ထားသည်: URL ကို paste လုပ်ပြီး ကောင်းမွန်သောသော local file ကိုရရှိပါ။ Account မပါ၊ upsell မပါ၊ data ကောက်ခံမှုမပါ။

---

## <a id="no-cookies"></a>Cookie မပါ၊ login မပါ၊ account ချိတ်ဆက်မှုမပါ

ဤသည်မှာ desktop YouTube downloader များ ချွတ်ယွင်းရခြင်း၏ အဖြစ်များဆုံးအကြောင်းရင်းဖြစ်ပြီး Arroxy တည်ရှိရသည့် အဓိကအကြောင်းရင်းလည်းဖြစ်သည်။

YouTube က bot detection ကို အပ်ဒိတ်လုပ်သည့်အခါ tool အများစုသည် သင့်ဘရောက်ဇာ၏ YouTube cookie များကို workaround အဖြစ် export လုပ်ရန် ပြောကြသည်။ ၎င်းနှင့်ပတ်သက်သော ပြဿနာနှစ်ရပ်ရှိသည်:

1. Export ထားသော sessions များသည် ပုံမှန်အားဖြင့် ~30 မိနစ်အတွင်း သက်တမ်းကုန်ဆုံးသောကြောင့် အမြဲ re-export လုပ်နေရသည်။
2. yt-dlp ၏ ကိုယ်ပိုင်စာတမ်းများသည် [cookie-based automation သည် သင့် Google account ကို flag လုပ်နိုင်ကြောင်း သတိပေးထားသည်](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)။

**Arroxy သည် cookie၊ login သို့မဟုတ် မည်သည့် credential ကိုမျှ တောင်းဆိုခြင်းမရှိပါ။** ၎င်းသည် YouTube က မည်သည့်ဘရောက်ဇာကိုမဆို ပေးသော public tokens များကိုသာ အသုံးပြုသည်။ သင့် Google identity နှင့် ချိတ်ဆက်မှုမပါ၊ သက်တမ်းကုန်ဆုံးမည့်အရာမပါ၊ rotate လုပ်ရမည့်အရာမပါ။

---

## <a id="features"></a>လုပ်ဆောင်ချက်များ

### အရည်အသွေးနှင့် format များ

- **4K UHD (2160p)** အထိ၊ 1440p, 1080p, 720p, 480p, 360p
- **High frame rate** ကို မူရင်းအတိုင်း ထိန်းသိမ်း — 60 fps, 120 fps, HDR
- MP3, AAC သို့မဟုတ် Opus သို့ **Audio-only** export
- အမြန် presets: *အကောင်းဆုံးအရည်အသွေး* · * မျှတသော* · *ဖိုင်ငယ်*

### ကိုယ်ရေးကိုယ်တာနှင့် ထိန်းချုပ်မှု

- 100% local processing — ဒေါင်းလုဒ်များသည် YouTube မှ တိုက်ရိုက် သင့် disk သို့ သွားသည်
- Login မပါ၊ cookie မပါ၊ Google account ချိတ်ဆက်မှုမပါ
- သင်ရွေးချယ်သောဖိုဒါတွင် ဖိုင်များကို တိုက်ရိုက်သိမ်းဆည်းသည်

### Workflow

- **မည်သည့် YouTube URL မဆို Paste လုပ်ပါ** — ဗီဒီယိုများနှင့် Shorts နှစ်မျိုးစလုံး ပံ့ပိုးသည်
- **Multi-download queue** — downloads များစွာကို တပြိုင်တည်း ခြေရာခံပါ
- **Clipboard watch** — YouTube link ကို copy လုပ်ပြီး app ကို refocus လုပ်သောအခါ Arroxy သည် URL ကို auto-fill လုပ်သည် (Advanced settings တွင် toggle နှိပ်ပါ)
- **Auto-clean URLs** — tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ကိုဖယ်ရှားပြီး `youtube.com/redirect` links ကိုဖြေရှင်းသည်
- **Tray mode** — window ကိုပိတ်လျှင် downloads များသည် နောက်ကွယ်တွင် ဆက်လည်ပတ်နေသည်
- **ဘာသာစကား ၉ မျိုး** — system locale ကို auto-detect လုပ်ပြီး မည်သည့်အချိန်မဆို ပြောင်းလဲနိုင်သည်

### Subtitles နှင့် post-processing

- SRT, VTT သို့မဟုတ် ASS တွင် **Subtitles** — ကိုယ်တိုင်ရိုက်ထည့်ထားသော သို့မဟုတ် auto-generated၊ မည်သည့် language မဆို
- ဗီဒီယိုဘေးတွင်သိမ်းပါ၊ `.mkv` ထဲ embed လုပ်ပါ၊ သို့မဟုတ် `Subtitles/` subfolder တွင် စီစဉ်ပါ
- **SponsorBlock** — sponsors, intros, outros, self-promos ကို ကျော်ပြီး chapter-mark လုပ်ပါ
- **Embedded metadata** — ခေါင်းစဉ်၊ upload date, channel, description, thumbnail နှင့် chapter markers တို့ကို ဖိုင်ထဲသို့ ရေးသွင်းသည်

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="URL တစ်ခု Paste လုပ်ပါ" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="သင့်အရည်အသွေးကို ရွေးချယ်ပါ" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="သိမ်းဆည်းမည့်နေရာကို ရွေးချယ်ပါ" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Download queue လုပ်ဆောင်မှု" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Subtitle ဘာသာစကားနှင့် format ရွေးချယ်မှု" />
</div>

---

## <a id="download"></a>ဒေါင်းလုဒ်

| Platform | Format |
| -------- | ------ |
| Windows  | Installer (NSIS) သို့မဟုတ် Portable `.exe` |
| macOS    | `.dmg` (Intel + Apple Silicon) |
| Linux    | `.AppImage` သို့မဟုတ် `.flatpak` (sandboxed) |

[**နောက်ဆုံး release ကို ယူပါ →**](../../releases/latest)

### Package manager မှတစ်ဆင့် ထည့်သွင်းပါ

| Channel  | Command |
| -------- | ------- |
| Winget   | `winget install AntonioOrionus.Arroxy` |
| Scoop    | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew | `brew tap antonio-orionus/arroxy && brew install --cask arroxy` |

<details>
<summary><strong>Windows: Installer နှင့် Portable နှိုင်းယှဉ်</strong></summary>

|                       | NSIS Installer | Portable `.exe` |
| --------------------- | :------------: | :-------------: |
| ထည့်သွင်းမှုလိုအပ်သည် |      ဟုတ်သည်       | မလိုအပ်ပါ — မည်သည့်နေရာမှမဆို run ပါ |
| Auto-update          |   ✅ app အတွင်းမှ    |   ❌ ကိုယ်တိုင် download ဆင်းရသည် |
| Startup မြန်နှုန်း         |   ✅ ပိုမြန်သည်    |   ⚠️ cold start နှေးသည် |
| Start Menu တွင် ထည့်သည်    |      ✅        |       ❌        |
| လွယ်ကူစွာ ဖြုတ်နိုင်သည်        |      ✅        |   ❌ ဖိုင်ကိုဖျက်ပစ်ပါ |

**အကြံပြုချက်:** auto-update နှင့် ပိုမြန်သော startup အတွက် NSIS installer ကို အသုံးပြုပါ။ install မလုပ်ဘဲ registry မသုံးသောနည်းအတွက် portable `.exe` ကို အသုံးပြုပါ။

</details>

<details>
<summary><strong>macOS တွင် ပထမဆုံး launch လုပ်ခြင်း</strong></summary>

Arroxy သည် code-sign မလုပ်ရသေးသောကြောင့် macOS Gatekeeper သည် ပထမဆုံး launch လုပ်သည့်အခါ သတိပေးလိမ့်မည်။ ၎င်းသည် မျှော်မှန်းထားသောဖြစ်ရပ်ဖြစ်ပြီး ပျက်စီးမှုသင်္ကေတမဟုတ်ပါ။

**System Settings နည်းလမ်း (အကြံပြု):**

1. Arroxy app icon ကို right-click ပြီး **Open** ကိုရွေးပါ။
2. သတိပေးမှု dialog ပေါ်လာသည် — **Cancel** ကိုနှိပ်ပါ (*Move to Trash* ကိုမနှိပ်ပါနှင့်)။
3. **System Settings → Privacy & Security** ကိုဖွင့်ပါ။
4. **Security** section သို့ scroll ဆင်းပါ။ *"Arroxy was blocked from use because it is not from an identified developer."* ဟုမြင်ရလိမ့်မည်။
5. **Open Anyway** ကိုနှိပ်ပြီး သင့် password သို့မဟုတ် Touch ID ဖြင့် အတည်ပြုပါ။

အဆင့် ၅ ပြီးနောက် Arroxy သည် ပုံမှန်ဖွင့်ပြီး သတိပေးချက်သည် နောက်ထပ်မပေါ်တော့ပါ။

**Terminal နည်းလမ်း (အဆင့်မြင့်):**

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

> macOS builds များကို Apple Silicon နှင့် Intel runners တို့ပေါ်တွင် CI မှတဆင့် ထုတ်လုပ်သည်။ ပြဿနာများကြုံတွေ့ပါက [issue တင်ပါ](../../issues) — macOS သုံးစွဲသူများ၏ feedback သည် macOS testing cycle ကို တက်ကြွစွာ ပုံဖော်ပေသည်။

</details>

<details>
<summary><strong>Linux တွင် ပထမဆုံး launch လုပ်ခြင်း</strong></summary>

AppImages များကို တိုက်ရိုက် run နိုင်သည် — ထည့်သွင်းမှုမလိုအပ်ပါ။ ဖိုင်ကို executable အဖြစ် mark လုပ်ရုံသာ လိုအပ်သည်။

**File manager:** `.AppImage` ကို right-click → **Properties** → **Permissions** → **Allow executing file as program** ကိုဖွင့်ပြီး double-click နှိပ်ပါ။

**Terminal:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

Launch မအောင်မြင်သေးလျှင် FUSE ပျောက်ဆုံးနေနိုင်သည်:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Flatpak (sandboxed alternative):** တူညီသော release page မှ `Arroxy-*.flatpak` ကို download ဆင်းပါ။

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

</details>

---

## <a id="privacy"></a>ကိုယ်ရေးကိုယ်တာ

Downloads များကို [yt-dlp](https://github.com/yt-dlp/yt-dlp) မှတဆင့် YouTube မှ တိုက်ရိုက် သင်ရွေးချယ်သောဖိုဒါသို့ fetch လုပ်သည် — third-party server မှတဆင့် routing မလုပ်ပါ။ ကြည့်ရှုမှတ်တမ်း၊ ဒေါင်းလုဒ်မှတ်တမ်း၊ URL များနှင့် ဖိုင်အကြောင်းအရာများသည် သင့်ကိရိယာပေါ်တွင်သာ ကျန်ရှိသည်။

Arroxy သည် [Aptabase](https://aptabase.com) မှတဆင့် anonymous aggregate telemetry ပေးပို့သည် — indie project တစ်ခုအတွက် တစ်ယောက်ယောက်က တကယ်အသုံးပြုနေသည်ကို မြင်နိုင်ရုံလောက် (launches, OS, app version, crashes)။ URL မပါ၊ ဗီဒီယိုခေါင်းစဉ်မပါ၊ ဖိုင် path မပါ၊ IP မပါ၊ account info မပါ — Aptabase သည် design အားဖြင့် open-source ဖြစ်ပြီး GDPR-friendly ဖြစ်သည်။ Settings တွင် opt out လုပ်နိုင်သည်။

---

## <a id="faq"></a>မေးလေ့ရှိသောမေးခွန်းများ

**တကယ်ကို အခမဲ့လား?**
ဟုတ်သည် — MIT licensed၊ premium tier မပါ၊ feature gating မပါ။

**မည်သည့် ဗီဒီယိုအရည်အသွေးများ ဒေါင်းလုဒ်ဆွဲနိုင်သနည်း?**
YouTube ပေးသောအရာများအားလုံး: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p နှင့် audio-only။ 60 fps, 120 fps နှင့် HDR streams များကို မူရင်းအတိုင်း ထိန်းသိမ်းသည်။

**Audio ကိုသာ MP3 အဖြစ် ထုတ်ယူနိုင်သလား?**
ဟုတ်သည်။ Format menu တွင် *audio-only* ကိုရွေးပြီး MP3, AAC သို့မဟုတ် Opus ကိုရွေးပါ။

**YouTube account သို့မဟုတ် cookie လိုအပ်သလား?**
မလိုအပ်ပါ။ Arroxy သည် YouTube က မည်သည့်ဘရောက်ဇာကိုမဆို ပေးသော public tokens များကိုသာ အသုံးပြုသည်။ Cookie မပါ၊ login မပါ၊ credential မသိမ်းဆည်းပါ။ ၎င်းသည် အဘယ်ကြောင့် အရေးကြီးသည်ကို [Cookie မပါ၊ login မပါ၊ account ချိတ်ဆက်မှုမပါ](#no-cookies) တွင် ကြည့်ပါ။

**YouTube တွင် တစ်ခုခုပြောင်းသောအခါ ဆက်လက်အလုပ်လုပ်မည်လား?**
ခံနိုင်ရည်ရှိမှုနှစ်ထပ်: yt-dlp သည် YouTube ပြောင်းလဲမှုများ ဖြစ်ပြီး နာရီပိုင်းအတွင်း update လုပ်သည်၊ Arroxy သည် ~30 မိနစ်တိုင်း သက်တမ်းကုန်ဆုံးသော cookie များပေါ်တွင် မမှီခိုပါ။ ၎င်းကြောင့် export လုပ်ထားသော browser session များပေါ်တွင် မှီခိုသော tools များထက် သိသာစွာ ပိုတည်ငြိမ်သည်။

**Arroxy ကို မည်သည့်ဘာသာစကားများဖြင့် ရနိုင်သနည်း?**
ကိုးမျိုး: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी။ သင့် system language ကို auto-detect လုပ်ပြီး toolbar မှ မည်သည့်အချိန်မဆို ပြောင်းနိုင်သည်။ Locale ဖိုင်များသည် `src/shared/i18n/locales/` တွင် plain TypeScript objects ဖြစ်သည် — [PR ဖိတ်ကြိုသည်](../../pulls)။

**အခြားအရာများ ထည့်သွင်းရန်လိုသလား?**
မလိုအပ်ပါ။ yt-dlp နှင့် ffmpeg တို့ကို ပထမဆုံး launch လုပ်သောအခါ official GitHub releases မှ အလိုအလျောက် download ဆင်းပြီး locally cache သိမ်းသည်။

**Playlist များ သို့မဟုတ် channel တစ်ခုလုံး ဒေါင်းလုဒ်ဆွဲနိုင်သလား?**
ယနေ့တွင် single videos နှင့် Shorts သာ။ Playlist နှင့် channel ပံ့ပိုးမှုသည် [roadmap](#roadmap) တွင် ပါဝင်သည်။

**macOS က "app ပျက်စီးနေသည်" ဟုဆိုသည် — ဘာလုပ်ရမည်နည်း?**
၎င်းသည် macOS Gatekeeper သည် unsigned app ကို ပိတ်ဆို့ခြင်းဖြစ်ပြီး တကယ်ပျက်စီးမှုမဟုတ်ပါ။ ဖြေရှင်းနည်းအတွက် [macOS တွင် ပထမဆုံး launch လုပ်ခြင်း](#download) section ကိုကြည့်ပါ။

**YouTube ဗီဒီယိုများ ဒေါင်းလုဒ်ဆွဲခြင်း တရားဝင်ပါသလား?**
ကိုယ်ရေးကိုယ်တာ သုံးစွဲမှုအတွက် ကိုယ်ရေးကိုယ်တာ purposes အတွက် နိုင်ငံအများစုတွင် ယေဘုယျအားဖြင့် လက်ခံသည်။ YouTube ၏ [Terms of Service](https://www.youtube.com/t/terms) နှင့် သင့်ဒေသခံ copyright ဥပဒေများနှင့် ကိုက်ညီသည်ကို သင်ကိုယ်တိုင် တာဝန်ယူရသည်။

---

## <a id="roadmap"></a>Roadmap

အနီးကပ် ဦးစားပေးအစဉ်လိုက် လာမည့်အရာများ:

| လုပ်ဆောင်ချက် | ဖော်ပြချက် |
| ------- | ----------- |
| **Playlist နှင့် channel ဒေါင်းလုဒ်များ** | Playlist သို့မဟုတ် channel URL ကို paste လုပ်ပါ; date သို့မဟုတ် count filters ဖြင့် ဗီဒီယိုများအားလုံးကို queue ထည့်ပါ |
| **Batch URL input** | URLs များစွာကို တစ်ကြိမ်တည်း paste လုပ်ပြီး တစ်ကြိမ်တည်း run ပါ |
| **Format ပြောင်းလဲခြင်း** | သီးခြား tool မလိုဘဲ downloads ကို MP3, WAV, FLAC သို့ ပြောင်းလဲပါ |
| **Custom filename templates** | ဖိုင်များကို ခေါင်းစဉ်၊ uploader, date, resolution ဖြင့် နာမည်ပေးပြီး live preview ဖြင့် |
| **ဒေါင်းလုဒ်ချိန်သတ်မှတ်ခြင်း** | သတ်မှတ်ချိန်တွင် queue ကို စတင်ပါ (ညဘက် runs) |
| **Speed limits** | ဒေါင်းလုဒ်များသည် သင့် connection ကို မပြည့်လျှံစေရန် bandwidth ကို cap လုပ်ပါ |
| **Clip trimming** | start/end time ဖြင့် segment တစ်ခုသာ ဒေါင်းလုဒ်ဆွဲပါ |

လုပ်ဆောင်ချက်တစ်ခု ကြံဆထားပါသလား? [Request တင်ပါ](../../issues) — community input က ဦးစားပေးမှုကို ပုံဖော်သည်။

---

## <a id="tech"></a>တည်ဆောက်ထားသောနည်းပညာ

<details>
<summary><strong>နည်းပညာ stack</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — ဒေါင်းလုဒ်နှင့် mux engine (ပထမဆုံး launch လုပ်သောအခါ GitHub မှ fetch လုပ်ပြီး အမြဲ up-to-date ဖြစ်နေသည်)
- **Vite** + **electron-vite** — build tooling
- **Vitest** + **Playwright** — unit နှင့် end-to-end tests

</details>

<details>
<summary><strong>Source code မှ Build လုပ်ခြင်း</strong></summary>

### လိုအပ်သောအရာများ — platform အားလုံးအတွက်

| Tool | ဗားရှင်း | ထည့်သွင်းရန် |
| ---- | ------- | ------- |
| Git  | မည်သည့်ဗားရှင်းမဆို | [git-scm.com](https://git-scm.com) |
| Bun  | နောက်ဆုံးထွက်  | အောက်တွင် OS အလိုက်ကြည့်ရှုပါ |

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Native build tool များမလိုအပ်ပါ — project တွင် native Node addons မပါဝင်ပါ။

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

### Clone နှင့် run လုပ်ခြင်း

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
```

### Distributable ကို Build လုပ်ခြင်း

```bash
bun run build        # typecheck + compile
bun run dist         # လက်ရှိ OS အတွက် package ထုတ်ရန်
bun run dist:win     # Windows portable exe cross-compile
```

> yt-dlp နှင့် ffmpeg များကို bundle ထည့်မထားပါ — ၎င်းတို့ကို ပထမဆုံး launch လုပ်သောအခါ official GitHub releases မှ download ဆင်းပြီး app data folder တွင် cache သိမ်းထားသည်။

</details>

---

## အသုံးပြုမှုသဘောတူညီချက်

Arroxy သည် ကိုယ်ရေးကိုယ်တာ သုံးစွဲမှုအတွက်သာ tool ဖြစ်သည်။ သင့် downloads သည် YouTube ၏ [Terms of Service](https://www.youtube.com/t/terms) နှင့် သင့်နိုင်ငံ၏ copyright ဥပဒေများနှင့် ကိုက်ညီကြောင်း သေချာစေရန် တာဝန်သည် သင့်ကိုယ်သင်တွင်သာ ရှိသည်။ သင့်တွင် အသုံးပြုခွင့်မရှိသောကြောင့် content ကို ဒေါင်းလုဒ်ဆွဲ၊ ထပ်ဆင့်ဖြန့်ဝေ သို့မဟုတ် ဖြန့်ဖြူးရန် Arroxy ကို မသုံးပါနှင့်။ Developer များသည် မည်သည့် အလွဲသုံးမှုမဆိုအတွက် တာဝန်ကင်းသည်။

<div align="center">
  <sub>MIT License · <a href="https://x.com/OrionusAI">@OrionusAI</a> မှ ဂရုတစိုက်ဖန်တီးထားသည်</sub>
</div>
