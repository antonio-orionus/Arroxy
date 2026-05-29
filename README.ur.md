<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy ماسکٹ" width="180" />

# Arroxy — Windows، macOS اور Linux کے لیے مفت اوپن سورس YouTube (+ 2000 سائٹس) ڈاؤن لوڈر

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**زبان:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · **اردو** · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![ریلیز](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![بلڈ](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![ویب سائٹ](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![لائسنس](https://img.shields.io/badge/license-MIT-green) ![پلیٹ فارمز](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![زبانیں](https://img.shields.io/badge/i18n-21_languages-blue)

**YouTube اور 2000+ معاون سائٹس** سے ویڈیوز، Shorts، موسیقی، چینلز، پوڈکاسٹ یا آڈیو ٹریک ڈاؤن لوڈ کریں — 60 fps پر 4K HDR تک، یا MP3 / AAC / Opus کے طور پر۔ Windows، macOS اور Linux پر مقامی طور پر چلتا ہے۔ **کوئی اشتہارات نہیں، کوئی بلوٹ نہیں، کوئی اپ سیلز نہیں۔**

[**↓ تازہ ترین ریلیز ڈاؤن لوڈ کریں**](../../releases/latest) &nbsp;·&nbsp; [**ویب سائٹ**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy ڈیمو" width="720" />

اگر Arroxy آپ کا وقت بچاتا ہے، تو ایک ⭐ دوسروں کو اسے ڈھونڈنے میں مدد کرتا ہے۔

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

> 🌐 یہ AI کی مدد سے کیا گیا ترجمہ ہے۔ [انگریزی README](README.md) سچائی کا ماخذ ہے۔ کوئی غلطی نظر آئی؟ [PR کا خیر مقدم ہے](../../pulls)۔

---

## فہرست

- [Arroxy کیوں](#why)
- [خصوصیات](#features)
- [ڈاؤن لوڈ](#download)
- [پرائیویسی](#privacy)
- [اکثر پوچھے گئے سوالات](#faq)
- [روڈ میپ](#roadmap)
- [ان چیزوں سے بنایا گیا](#tech)

---

## <a id="why"></a>Arroxy کیوں

سب سے عام متبادل کے ساتھ ساتھ ساتھ موازنہ:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| مفت، کوئی پریمیم سطح نہیں |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| اوپن سورس |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| صرف مقامی پراسیسنگ |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| کوئی لاگ ان یا کوکی ایکسپورٹ نہیں |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| استعمال کی کوئی حد نہیں |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| کراس پلیٹ فارم ڈیسک ٹاپ ایپ |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| سب ٹائٹلز + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy ایک ہی کام کے لیے بنایا گیا ہے: URL پیسٹ کریں، ایک صاف ستھری مقامی فائل حاصل کریں۔ کوئی اکاؤنٹس نہیں، کوئی اپ سیلز نہیں، کوئی ڈیٹا کلیکشن نہیں۔

---

## <a id="features"></a>خصوصیات

### کوالٹی اور فارمیٹس

- **4K UHD (2160p)** تک، 1440p، 1080p، 720p، 480p، 360p
- **ہائی فریم ریٹ** جیسا ہے ویسا ہی محفوظ — 60 fps، 120 fps، HDR
- **صرف آڈیو** کو MP3، M4A/AAC، Opus یا WAV میں ایکسپورٹ کریں
- فوری پری سیٹس: *بہترین کوالٹی* · *متوازن* · *چھوٹی فائل*

### پرائیویسی اور کنٹرول

- 100% مقامی پراسیسنگ — ڈاؤن لوڈز سیدھے YouTube سے آپ کی ڈسک پر جاتے ہیں
- کوئی لاگ ان نہیں، کوئی کوکیز نہیں، کوئی Google اکاؤنٹ منسلک نہیں
- فائلیں سیدھی آپ کے منتخب کردہ فولڈر میں محفوظ

### ورک فلو

- **کوئی بھی لنک پیسٹ کریں** — YouTube ویڈیوز، Shorts، چینلز، پلے لسٹس، پوڈکاسٹ اور Music، نیز 2000+ دیگر سائٹس جو yt-dlp سپورٹ کرتا ہے؛ پوری playlist ڈاؤن لوڈ کریں یا پہلے مخصوص ویڈیوز منتخب کریں
- **ملٹی ڈاؤن لوڈ قطار** — کئی ڈاؤن لوڈز کو متوازی طور پر ٹریک کریں
- **کلپ بورڈ واچ** — YouTube لنک کاپی کریں اور جب آپ ایپ پر واپس آئیں تو Arroxy خود بخود URL بھر دیتا ہے (ایڈوانسڈ سیٹنگز میں ٹوگل کریں)
- **خودکار صاف URLs** — ٹریکنگ پیرامیٹرز (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) کو ہٹاتا ہے اور `youtube.com/redirect` لنکس کو کھولتا ہے
- **ٹرے موڈ** — ونڈو بند کرنے سے ڈاؤن لوڈز پس منظر میں چلتے رہتے ہیں
- **21 زبانیں** — سسٹم لوکیل کو خود بخود پہچانتا ہے، کسی بھی وقت تبدیل کیا جا سکتا ہے
- **پلے لسٹ سنک** — پہلے سے ڈاؤن لوڈ شدہ ویڈیوز چھوڑنے کے لیے پلے لسٹ کو مقامی فولڈر کے مقابل دوبارہ اسکین کرتا ہے؛ ہر ویڈیو ڈاؤن لوڈ ہونے پر اپ ڈیٹ ہونے والی `.m3u` پلے لسٹ فائل بناتا ہے
- **احتیاطی موڈ** — قابلِ ترتیب pacing presets (*بند · متوازن · محتاط · کسٹم*) درخواستوں کے درمیان وقفے شامل کرتے ہیں اور fragment threads محدود کرتے ہیں، جس سے بڑی پلے لسٹس پر bot-blocks کا امکان کم ہوتا ہے

### سب ٹائٹلز اور پوسٹ پراسیسنگ

- **سب ٹائٹلز** SRT، VTT یا ASS میں — دستی یا خود کار طریقے سے بنائے گئے، کسی بھی دستیاب زبان میں
- ویڈیو کے ساتھ محفوظ کریں، `.mkv` میں ایمبیڈ کریں، یا `Subtitles/` سب فولڈر میں منظم کریں
- **SponsorBlock** — اسپانسرز، انٹروز، آؤٹروز اور سیلف پروموز کو سکپ کریں یا چیپٹر مارک کریں
- **ایمبیڈڈ میٹا ڈیٹا** — ٹائٹل، اپ لوڈ کی تاریخ، چینل، تفصیل، تھمب نیل اور چیپٹر مارکرز فائل میں لکھے جاتے ہیں

### YouTube + 2000 سائٹس

- **YouTube، مکمل** — Videos، Shorts، Channels، Playlists، YouTube Music اور Podcasts کو فرسٹ-کلاس ذرائع کے طور پر ہینڈل کیا جاتا ہے
- **2000+ دیگر سائٹس** yt-dlp کے ذریعے — Vimeo، Twitch، Twitter/X، TikTok، SoundCloud، Bandcamp، Bilibili، BBC iPlayer، archive.org اور بہت کچھ
- **صرف آڈیو اور سب ٹائٹلز** ہر معاون سائٹ پر کام کرتے ہیں، نہ صرف YouTube پر
- اگر کوئی سائٹ بدلتی ہے تو yt-dlp ہر ہفتے فکس جاری کرتا ہے اور Arroxy لانچ پر بائنری خودکار طور پر اپ ڈیٹ کرتا ہے

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="URL پیسٹ کریں" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="اپنی کوالٹی منتخب کریں" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="محفوظ کرنے کی جگہ منتخب کریں" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="ڈاؤن لوڈ قطار چلتی ہوئی" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="سب ٹائٹل زبان اور فارمیٹ منتخب کرنے والا" />
</div>

---

## <a id="download"></a>ڈاؤن لوڈ

| پلیٹ فارم | فارمیٹ   |
| ------------------- | ------------------- |
| Windows             | انسٹالر (NSIS) یا پورٹیبل `.exe`   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` یا `.flatpak` (سینڈ باکسڈ) |

[**تازہ ترین ریلیز حاصل کریں →**](../../releases/latest)

### <a id="why-warning"></a>آپ کو وارننگ کیوں نظر آ سکتی ہے

Arroxy اوپن سورس اور MIT لائسنس یافتہ ہے۔ Windows اور macOS بلڈز **کوڈ سائنڈ نہیں ہیں** — Apple Developer ID اور Windows EV کوڈ سائننگ سرٹیفکیٹس میں سے ہر ایک سالانہ سینکڑوں ڈالر لاگت آتی ہے، جو ایک انڈی پروجیکٹ اپنی جیب سے ادا کرتا ہے۔ ان دستخطوں کے بغیر، Windows SmartScreen اور macOS Gatekeeper پہلی بار لانچ پر آپ کو تنبیہ کریں گے۔ یہ تنبیہات اس بات کی علامت ہیں کہ *آپ کا OS ناشر کو نہیں پہچانتا* — یہ اس بات کی علامت نہیں کہ Arroxy میلویئر ہے۔

Arroxy کو خود جانچنے کے تین طریقے، بڑھتی ہوئی سختی کے ساتھ:

- **سورس پڑھیں۔** ہر لائن [GitHub](https://github.com/antonio-orionus/Arroxy) پر موجود ہے اور آپ [سورس سے بلڈ](#tech) کر سکتے ہیں۔
- **SHA256 چیک کریں۔** اپنی فائل کو شائع شدہ [`SHA256SUMS`](../../releases/latest) سے ملائیں — نیچے [اپنا ڈاؤن لوڈ تصدیق کریں](#verify) دیکھیں۔
- **تھرڈ پارٹی اسکین چلائیں۔** فائل کو [VirusTotal](https://www.virustotal.com) پر اپ لوڈ کریں۔

### <a id="windows-first-launch"></a>Windows پر پہلی بار لانچ

پہلی بار لانچ پر آپ کو **"Windows protected your PC"** یا **"Unknown publisher"** نظر آ سکتا ہے۔ یہ `Arroxy-Setup-*.exe` اور `Arroxy-Portable-*.exe` دونوں پر لاگو ہوتا ہے۔ Arroxy مفت اور اوپن سورس ہے اور Windows بلڈز کو ادائیگی والے سرٹیفکیٹ سے کوڈ سائن نہیں کیا گیا، اسی لیے SmartScreen انہیں فلیگ کرتا ہے۔ اس کا مطلب **نہیں** کہ Arroxy خود بخود غیر محفوظ ہے۔ جاری رکھنے کے لیے:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" ڈائیلاگ جس میں "More info" لنک نمایاں ہے" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="More info کھولنے کے بعد SmartScreen ڈائیلاگ، جس میں "Run anyway" بٹن دکھائی دے رہا ہے" />
</div>

1. **More info** پر کلک کریں۔
2. **Run anyway** پر کلک کریں۔

#### اگر Windows Defender فائل کو فلیگ کرے یا ہٹا دے

Defender کے ہیورسٹکس کبھی کبھی غیر سائنڈ NSIS انسٹالرز اور Electron پورٹیبلز کو مشکوک قرار دیتے ہیں۔ اگر Defender نے `Arroxy-Setup-*.exe` یا `Arroxy-Portable-*.exe` کو قرنطینہ میں ڈالا ہو، تو اسے **Windows Security → Virus & threat protection → Protection history** سے بحال کریں، پھر Arroxy ایگزیکیوٹیبل کو **Manage settings → Add or remove exclusions** کے تحت اجازت یافتہ آئٹم کے طور پر شامل کریں۔ SmartScreen کی طرح، وجہ غائب پبلشر دستخط ہے، کوئی دریافت شدہ میلویئر نہیں۔

> Arroxy صرف آفیشل GitHub Releases صفحے سے ڈاؤن لوڈ کریں۔ اگر آپ کو فائل کسی دوسری ویب سائٹ سے ملی ہے یا کسی نے بھیجی ہے، تو اسے ڈیلیٹ کریں اور آفیشل ماخذ سے تازہ کاپی ڈاؤن لوڈ کریں۔ سورس کوڈ عوامی ہے، اس لیے آپ خود اسے جانچ یا Arroxy بنا سکتے ہیں۔

### <a id="macos-first-launch"></a>macOS پر پہلی بار لانچ

Arroxy ابھی macOS کے لیے کوڈ سائنڈ نہیں ہے، اس لیے Gatekeeper پہلی بار لانچ کو بلاک کرے گا۔ اسے اجازت دینے کا عین طریقہ آپ کے macOS ورژن پر منحصر ہے — Sequoia 15 نے پرانے دائیں کلک → Open کو مزید سخت کر دیا ہے۔

#### macOS Sequoia 15 اور بعد میں (موجودہ)

Sequoia 15 اور نئے ورژنز پر، دائیں کلک → Open اب کئی قرنطینہ شدہ ایپس کے لیے Gatekeeper کو bypass نہیں کرتا۔ اس کی بجائے System Settings پینل استعمال کریں:

1. نصب شدہ DMG سے `Arroxy.app` کو `/Applications` میں گھسیٹیں۔
2. Arroxy کو ڈبل کلک کریں۔ بلاک ڈائیلاگ ظاہر ہوگا — **Done** پر کلک کریں (*Move to Trash* پر کلک نہ کریں)۔
3. **System Settings → Privacy & Security** کھولیں اور **Security** سیکشن تک اسکرول کریں۔ آپ کو نظر آئے گا *"Arroxy was blocked to protect your Mac"* (یا ایسا ہی پیغام)۔
4. **Open Anyway** پر کلک کریں، اپنے پاس ورڈ یا Touch ID سے تصدیق کریں، پھر Arroxy کو `/Applications` سے دوبارہ لانچ کریں۔

#### macOS Sonoma 14 اور اس سے پہلے

1. نصب شدہ DMG سے `Arroxy.app` کو `/Applications` میں گھسیٹیں۔
2. `/Applications` میں `Arroxy.app` پر دائیں کلک کریں (یا Control-click) اور **Open** منتخب کریں۔
3. اب تنبیہی ڈائیلاگ میں **Open** بٹن موجود ہے — اسے کلک کریں اور تصدیق کریں۔ Arroxy عام طور پر کھلتا ہے اور تنبیہ پھر کبھی ظاہر نہیں ہوتی۔

#### "App is damaged" یا مسلسل Gatekeeper بلاک — Terminal فکس

اگر macOS کہے *"Arroxy is damaged and can't be opened"*، یا اوپر کے کسی بھی قدم نے بلاک کو نہ ہٹایا ہو، تو DMG پر quarantine attribute وجہ ہے (کچھ براؤزرز اور macOS کا اپنا translocation رویہ اسے سیٹ کرتا ہے)۔ اسے انسٹال شدہ ایپ سے ہٹائیں:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon بمقابلہ Intel:** M-سیریز Mac پر (M1 / M2 / M3 / M4)، `arm64` DMG ڈاؤن لوڈ کریں۔ Intel Macs پر، `x64` DMG ڈاؤن لوڈ کریں۔ غلط بلڈ چلانا Rosetta کے ذریعے کام کرتا ہے لیکن نمایاں طور پر سست ہے۔

> macOS بلڈز Apple Silicon اور Intel رنرز پر CI کے ذریعے تیار کیے جاتے ہیں۔ اگر آپ کو مسائل پیش آئیں، تو براہ کرم [ایک issue کھولیں](../../issues) — macOS صارفین سے ملنے والی فیڈ بیک macOS ٹیسٹنگ سائیکل کو فعال طور پر تشکیل دیتی ہے۔

### <a id="linux-first-launch"></a>Linux پر پہلی بار لانچ

AppImages براہ راست چلتے ہیں — کوئی انسٹالیشن نہیں۔ آپ کو صرف فائل کو ایگزیکیوٹیبل مارک کرنا ہوگا۔

**فائل مینیجر:** `.AppImage` پر دائیں کلک کریں → **Properties** → **Permissions** → **Allow executing file as program** کو فعال کریں، پھر ڈبل کلک کریں۔

**ٹرمینل:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

اگر لانچ پھر بھی ناکام ہو جائے، تو شاید آپ کے پاس FUSE نہیں ہے:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**اختیاری ڈیسک ٹاپ انٹیگریشن:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ایک بار انسٹال کریں، اور جس بھی AppImage کو آپ ڈبل کلک کریں گے وہ خود بخود آپ کے لانچر مینو میں رجسٹر ہو جائے گا — کوئی دستی `.desktop` فائل نہیں چاہیے۔

**Flatpak (سینڈ باکسڈ متبادل):** اسی ریلیز پیج سے `Arroxy-*.flatpak` ڈاؤن لوڈ کریں۔

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>اپنا ڈاؤن لوڈ تصدیق کریں (SHA256)</strong></summary>

ہر ریلیز بائنریز کے ساتھ `SHA256SUMS` فائل بھی شائع کرتی ہے۔ یہ جانچنے کے لیے کہ آپ کا ڈاؤن لوڈ ٹرانسمیشن میں خراب یا تبدیل نہیں ہوا، اپنی فائل کو مقامی طور پر ہیش کریں اور `SHA256SUMS` کی لائن سے ملائیں۔ تازہ ترین ریلیز پیج کھولیں → **Assets** → `SHA256SUMS` ڈاؤن لوڈ کریں۔

**Windows (PowerShell یا Command Prompt):**

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

تھرڈ پارٹی میلویئر اسکین چاہتے ہیں؟ فائل کو [VirusTotal](https://www.virustotal.com) پر اپ لوڈ کریں۔ چھوٹے انجنوں سے چند عام ہیورسٹک فلیگز غیر سائنڈ Electron ایپس کے لیے معمول ہیں؛ بڑے انجنوں سے وسیع پیمانے پر دریافت واقعی تشویش کا باعث ہوگی۔

</details>

<details>
<summary><strong>پیکج مینیجر کے ذریعے انسٹال کریں</strong></summary>

پہلے سے پیکج مینیجر استعمال کرتے ہیں؟ آپ دستی ڈاؤن لوڈ کا راستہ چھوڑ سکتے ہیں۔

| چینل | کمانڈ                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-*.flatpak`                                                         |

</details>

<details>
<summary><strong>Windows: انسٹالر بمقابلہ پورٹیبل</strong></summary>

|               | NSIS انسٹالر | پورٹیبل `.exe` |
| ------------- | :----------------------: | :---------------------: |
| انسٹالیشن ضروری | ہاں  | نہیں — کہیں سے بھی چلائیں  |
| خودکار اپ ڈیٹس | ✅ ایپ کے اندر  | ❌ دستی ڈاؤن لوڈ  |
| اسٹارٹ اپ سپیڈ | ✅ تیز  | ⚠️ کولڈ اسٹارٹ سست  |
| اسٹارٹ مینو میں شامل |            ✅            |           ❌            |
| آسان ان انسٹال |            ✅            | ❌ بس فائل ڈیلیٹ کر دیں  |

**تجویز:** خودکار اپ ڈیٹس اور تیز اسٹارٹ اپ کے لیے NSIS انسٹالر استعمال کریں۔ بغیر انسٹالیشن، بغیر رجسٹری آپشن کے لیے پورٹیبل `.exe` استعمال کریں۔

</details>

---

## <a id="privacy"></a>پرائیویسی

ڈاؤن لوڈز [yt-dlp](https://github.com/yt-dlp/yt-dlp) کے ذریعے براہ راست YouTube سے آپ کے منتخب کردہ فولڈر میں آتے ہیں — کسی تھرڈ پارٹی سرور سے نہیں گزرتے۔ دیکھنے کی تاریخ، ڈاؤن لوڈ تاریخ، URLs اور فائل کے مواد آپ کے ڈیوائس پر ہی رہتے ہیں۔

Arroxy [OpenPanel](https://openpanel.dev) کے ذریعے گمنام، مجموعی ٹیلی میٹری بھیجتا ہے — صرف اتنی کہ لانچز، OS، ایپ ورژنز اور کریشز سمجھ آ سکیں۔ کوئی URLs، ویڈیو ٹائٹلز، فائل پاتھز، اکاؤنٹ معلومات، fingerprinting یا ذاتی ڈیٹا نہیں۔ ہر انسٹال کا ID رینڈم ہے اور آپ کی شناخت سے منسلک نہیں۔ آپ Settings میں اسے بند کر سکتے ہیں۔

---

## <a id="faq"></a>اکثر پوچھے گئے سوالات

**کیا یہ واقعی مفت ہے؟**
ہاں — MIT لائسنس یافتہ، کوئی پریمیم سطح نہیں، کوئی فیچر گیٹنگ نہیں۔

**میں کن ویڈیو کوالٹیز میں ڈاؤن لوڈ کر سکتا ہوں؟**
جو بھی YouTube فراہم کرتا ہے: 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، اور صرف آڈیو۔ 60 fps، 120 fps اور HDR اسٹریمز جیسے ہیں ویسے ہی محفوظ ہوتے ہیں۔

**کیا میں صرف آڈیو کو MP3 کے طور پر نکال سکتا ہوں؟**
جی ہاں۔ فارمیٹ مینو میں *صرف آڈیو* منتخب کریں اور پھر MP3، M4A/AAC، Opus یا WAV چنیں۔

**کیا مجھے YouTube اکاؤنٹ یا کوکیز کی ضرورت ہے؟**
بطور ڈیفالٹ، نہیں — Arroxy YouTube اکاؤنٹ، لاگ ان یا کوکی ایکسپورٹ کے بغیر کام کرتا ہے۔ ایسا مواد جس کے لیے توثیق درکار ہو، جیسے عمر کی پابندی والے یا صرف ممبران کے لیے ویڈیوز، کے لیے ایڈوانسڈ سیٹنگز میں اختیاری کوکی سپورٹ دستیاب ہے (Cookies source: file or browser)۔ یہ بطور ڈیفالٹ بند ہے۔ اگر آپ اسے فعال کرتے ہیں، تو yt-dlp کی وکی میں نوٹ کیا گیا ہے کہ [کوکی پر مبنی آٹومیشن Google اکاؤنٹ کو فلیگ کر سکتی ہے](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)؛ ایسی صورت میں ایک عارضی اکاؤنٹ زیادہ محفوظ انتخاب ہے۔

**جب YouTube کچھ تبدیل کرے تو کیا یہ کام کرتا رہے گا؟**
yt-dlp لانچ پر خود بخود اپ ڈیٹ ہو جاتا ہے، اور جب YouTube کچھ تبدیل کرتا ہے تو Arroxy فوری طور پر فکس فراہم کرتا ہے۔ اگر آپ کو کبھی کوئی مسئلہ پیش آئے، تو ایڈوانسڈ سیٹنگز میں اختیاری کوکی سپورٹ ایک متبادل کے طور پر دستیاب ہے۔

**Arroxy کن زبانوں میں دستیاب ہے؟**
اکیس، باکس سے باہر: English، Español (ہسپانوی)، Deutsch (جرمن)، Français (فرانسیسی)، 日本語 (جاپانی)، 中文 (چینی)، Русский (روسی)، Українська (یوکرینی)، हिन्दी (ہندی)، Afaan Oromoo، Kiswahili، O'zbekcha (ازبک)، Tiếng Việt (ویتنامی)، አማርኛ (امہاری)، العربية (عربی)، اردو، پښتو (پشتو)، বাংলা (بنگالی)، မြန်မာဘာသာ (برمی)، Ελληνικά (یونانی)، اور Српски (صربی)۔ Arroxy پہلی بار لانچ پر آپ کے آپریٹنگ سسٹم کی زبان خود بخود پہچان لیتا ہے اور آپ ٹول بار میں زبان منتخب کرنے والے سے کسی بھی وقت تبدیل کر سکتے ہیں۔ ترجمے src/shared/i18n/locales/ میں سادہ TypeScript آبجیکٹس کے طور پر موجود ہیں — حصہ ڈالنے کے لیے GitHub پر PR کھولیں۔

**کیا مجھے کچھ اور انسٹال کرنا ہوگا؟**
نہیں۔ yt-dlp پہلی بار لانچ پر خود بخود ڈاؤن لوڈ ہو کر آپ کی مشین پر کیش ہو جاتا ہے؛ ffmpeg اور ffprobe ایپ کے ساتھ آتے ہیں۔ اس کے بعد کسی اضافی سیٹ اپ کی ضرورت نہیں۔

**کیا میں پلے لسٹس یا پورے چینلز ڈاؤن لوڈ کر سکتا ہوں؟**
جی ہاں — دونوں۔ ایک playlist URL یا channel URL پیسٹ کریں (جیسے `youtube.com/@handle`، `/channel/UC…`، `/c/Name`، `/user/Old`)؛ Arroxy 500 تک اندراجات کی فہرست بناتا ہے، پھر آپ پوری فہرست یا مخصوص ویڈیوز کو قطار میں ڈالتے ہیں۔ تاریخ کی حد اور تعداد کے فلٹرز جلد آ رہے ہیں۔

**macOS کہتا ہے "ایپ خراب ہے" — میں کیا کروں؟**
یہ macOS Gatekeeper ایک غیر سائنڈ ایپ کو بلاک کر رہا ہے، اصل نقصان نہیں ہے۔ ایک لائن کے `xattr` کمانڈ کے لیے ["App is damaged" — Terminal فکس](#macos-first-launch) دیکھیں جو اسے صاف کرتا ہے۔

**کیا YouTube ویڈیوز ڈاؤن لوڈ کرنا قانونی ہے؟**
ذاتی، نجی استعمال کے لیے، زیادہ تر دائرہ اختیار میں یہ عام طور پر قبول کیا جاتا ہے۔ آپ YouTube کی [Terms of Service](https://www.youtube.com/t/terms) اور اپنے مقامی کاپی رائٹ قوانین کی پابندی کے ذمہ دار ہیں۔

---

## <a id="roadmap"></a>روڈ میپ

آنے والا — تقریباً ترجیح کے ترتیب سے:

| خصوصیت    | تفصیل    |
| ---------------- | ---------------- |
| **پلے لسٹ اور چینل فلٹرز** | پلے لسٹ یا چینل کی فہرست بناتے وقت تاریخ کی حد اور تعداد کے فلٹرز (ابھی حد 500 اندراجات تک محدود ہے) |
| **بیچ URL ان پٹ** | ایک ساتھ کئی URLs پیسٹ کریں اور انہیں ایک ساتھ چلائیں |
| **کسٹم فائل نام ٹیمپلیٹس** | فائلوں کو ٹائٹل، اپ لوڈر، تاریخ، ریزولیوشن کے حساب سے نام دیں — لائیو پری ویو کے ساتھ |
| **شیڈیولڈ ڈاؤن لوڈز** | مقررہ وقت پر قطار شروع کریں (رات بھر کے رنز) |
| **اسپیڈ کی حدود** | بینڈ ودتھ کیپ کریں تاکہ ڈاؤن لوڈز آپ کے کنکشن کو بھر نہ دیں |
| **کلپ ٹرمنگ** | شروع/اختتام کے وقت سے صرف ایک سیگمنٹ ڈاؤن لوڈ کریں |

ذہن میں کوئی فیچر ہے؟ [ایک درخواست کھولیں](../../issues) — کمیونٹی کی رائے ترجیح کو تشکیل دیتی ہے۔

---

## <a id="tech"></a>ان چیزوں سے بنایا گیا

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — کراس پلیٹ فارم ڈیسک ٹاپ شیل
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — اسٹائلنگ
- **Zustand** — اسٹیٹ مینجمنٹ
- **yt-dlp** + **ffmpeg** — ڈاؤن لوڈ اور مکس انجن (yt-dlp runtime پر حاصل ہوتا ہے؛ ffmpeg/ffprobe build time پر بنڈل ہوتے ہیں)
- **Vite** + **electron-vite** — بلڈ ٹولنگ
- **Vitest** + **Playwright** — یونٹ اور اینڈ ٹو اینڈ ٹیسٹ

</details>

<details>
<summary><strong>سورس سے بلڈ کریں</strong></summary>

### تمام پلیٹ فارمز کے لیے ضروریات

| ٹول | ورژن | انسٹال |
| ---- | ------- | ------- |
| Git  | کوئی بھی | [git-scm.com](https://git-scm.com) |
| Bun  | تازہ ترین | نیچے OS کے حساب سے دیکھیں |

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

کسی نیٹو بلڈ ٹول کی ضرورت نہیں — اس پروجیکٹ میں کوئی نیٹو Node ایڈ آن نہیں ہے۔

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Electron رن ٹائم ڈپینڈنسیز
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# صرف E2E ٹیسٹ کے لیے (Electron کو ڈسپلے درکار ہوتا ہے)
sudo apt install -y xvfb
```

### کلون اور رن کریں

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # ہاٹ ری لوڈ ڈیو بلڈ
```

### تقسیم کے قابل بلڈ بنائیں

```bash
bun run build        # ٹائپ چیک + کمپائل
bun run dist         # موجودہ OS کے لیے پیکج
bun run dist:win     # Windows پورٹیبل exe کراس کمپائل
```

> yt-dlp پہلی بار لانچ پر GitHub سے حاصل ہو کر آپ کے ایپ ڈیٹا فولڈر میں کیش ہوتا ہے۔ ffmpeg اور ffprobe ہر Arroxy ریلیز کے ساتھ بنڈل ہوتے ہیں۔

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

## استعمال کی شرائط

Arroxy صرف ذاتی، نجی استعمال کے لیے ایک ٹول ہے۔ آپ اس بات کو یقینی بنانے کے واحد ذمہ دار ہیں کہ آپ کے ڈاؤن لوڈز YouTube کی [Terms of Service](https://www.youtube.com/t/terms) اور آپ کے دائرہ اختیار کے کاپی رائٹ قوانین کی پابندی کرتے ہیں۔ Arroxy کو ایسے مواد کو ڈاؤن لوڈ، دوبارہ تیار یا تقسیم کرنے کے لیے استعمال نہ کریں جس کے استعمال کا حق آپ کے پاس نہیں ہے۔ ڈویلپرز کسی بھی غلط استعمال کے ذمہ دار نہیں ہیں۔

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT لائسنس · <a href="https://x.com/OrionusAI">@OrionusAI</a> کی جانب سے محبت سے بنایا گیا</sub>
</div>
