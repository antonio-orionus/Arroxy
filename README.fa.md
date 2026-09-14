<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="نماد Arroxy" width="180" />

# Arroxy — دانلودر رایگان و متن‌باز YouTube (و بیش از ۲۰۰۰ سایت) برای Windows، macOS و Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**مطالعه به زبان:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · **فارسی** · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![انتشار](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![ساخت](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![وب‌سایت](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![مجوز](https://img.shields.io/badge/license-MIT-green) ![پلتفرم‌ها](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![زبان‌ها](https://img.shields.io/badge/i18n-30_languages-blue)

ویدیو، Shorts، موسیقی، کانال، پادکست یا قطعهٔ صوتی را از **YouTube و بیش از ۲۰۰۰ سایت پشتیبانی‌شده** دانلود کنید — تا کیفیت 4K HDR با ۶۰ فریم بر ثانیه، یا به‌صورت MP3 / AAC / Opus. برنامه روی Windows، macOS و Linux به‌صورت محلی اجرا می‌شود. **بدون تبلیغ، بدون امکانات اضافی بی‌فایده و بدون فروش اجباری.**

[**↓ نصب آخرین نسخه**](#install) &nbsp;·&nbsp; [**وب‌سایت**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [نخستین اجرا در Windows](#windows-first-launch) · [نخستین اجرا در macOS](#macos-first-launch) · [نخستین اجرا در Linux](#linux-first-launch)

[![به انجمن Discord بپیوندید](https://img.shields.io/badge/%D8%A8%D9%87%20%D8%A7%D9%86%D8%AC%D9%85%D9%86%20Discord%20%D8%A8%D9%BE%DB%8C%D9%88%D9%86%D8%AF%DB%8C%D8%AF-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="نمایش Arroxy" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

اگر Arroxy در وقت شما صرفه‌جویی می‌کند، یک ⭐ کمک می‌کند دیگران هم آن را پیدا کنند.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-09-14._

> 🌐 این ترجمه با کمک هوش مصنوعی تهیه شده است. [README انگلیسی](README.md) منبع معتبر است. خطایی پیدا کردید؟ [یک PR باز کنید](../../pulls).

---

## فهرست

- [نصب و نخستین اجرا](#install)
  - [نخستین اجرا در Windows](#windows-first-launch)
  - [نخستین اجرا در macOS](#macos-first-launch)
  - [چرا ممکن است هشدار ببینید](#why-warning)
  - [نخستین اجرا در Linux](#linux-first-launch)
  - [بررسی دانلود (SHA256)](#verify)
- [چرا Arroxy](#why)
- [قابلیت‌ها](#features)
- [حریم خصوصی](#privacy)
- [پرسش‌های متداول](#faq)
- [نقشهٔ راه](#roadmap)
- [پشتیبانی از Arroxy](#support)
- [فناوری‌های به‌کاررفته](#tech)

---

## <a id="install"></a>نصب و نخستین اجرا

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

اسکریپت Linux دانلود را با `SHA256SUMS` منتشرشده بررسی می‌کند و Arroxy را به منوی برنامه‌ها می‌افزاید. ساخت‌ها فقط برای x86_64 هستند. `curl` ندارید؟ `curl -fsSL` را با `wget -qO-` جایگزین کنید.

| پلتفرم | دانلود مستقیم |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**همهٔ فایل‌های انتشار ←**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="windows-first-launch"></a>نخستین اجرا در Windows

در نخستین اجرا ممکن است پیام **"Windows protected your PC"** یا **"Unknown publisher"** را ببینید. این موضوع برای هر دو فایل `Arroxy-win-x64-Setup.exe` و `Arroxy-win-x64-Portable.exe` صدق می‌کند. Arroxy رایگان و متن‌باز است، اما ساخت‌های Windows با گواهی پولی امضا نشده‌اند و SmartScreen به همین دلیل هشدار می‌دهد. این هشدار لزوماً به معنی ناامن‌بودن Arroxy **نیست**. برای ادامه:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="پنجرهٔ SmartScreen با پیام Windows protected your PC و پیوند More info مشخص‌شده" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="پنجرهٔ بازشدهٔ SmartScreen با دکمهٔ Run anyway" />
</div>

1. روی **More info** کلیک کنید.
2. روی **Run anyway** کلیک کنید.

#### اگر Windows Defender فایل را علامت زد یا حذف کرد

روش‌های اکتشافی Defender گاهی نصاب NSIS و نسخهٔ همراه Electron بدون امضا را مشکوک می‌دانند. اگر `Arroxy-win-x64-Setup.exe` یا `Arroxy-win-x64-Portable.exe` قرنطینه شد، آن را از **Windows Security → Virus & threat protection → Protection history** بازیابی کنید و سپس فایل اجرایی Arroxy را در **Manage settings → Add or remove exclusions** به موارد مجاز بیفزایید. مانند SmartScreen، علت نبود امضای ناشر است، نه شناسایی بدافزار.

> Arroxy را فقط از صفحهٔ رسمی GitHub Releases دانلود کنید. اگر فایل را از سایت دیگری گرفته‌اید یا کسی برایتان فرستاده است، آن را حذف کنید و نسخه‌ای تازه از منبع رسمی بگیرید. کد منبع عمومی است؛ می‌توانید آن را بررسی کنید یا خودتان Arroxy را بسازید.

Scoop را ترجیح می‌دهید؟ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

### <a id="macos-first-launch"></a>نخستین اجرا در macOS

ساخت‌های macOS در Arroxy امضای ad-hoc دارند اما Apple آن‌ها را notarize نکرده است؛ بنابراین Gatekeeper نخستین اجرا را با پیام *"Arroxy.app" Not Opened — Apple could not verify "Arroxy.app" is free of malware* مسدود می‌کند. یعنی macOS نمی‌تواند برنامه را نزد Apple بررسی کند، نه اینکه فایل مشکلی دارد. نصب با Homebrew این پنجره را نشان نمی‌دهد. اگر DMG را نصب کرده‌اید، یک فرمان ترمینال کافی است:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. `Arroxy.app` را از DMG بازشده به `/Applications` بکشید.
2. Terminal را باز و این دو فرمان را اجرا کنید:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

فرمان نخست ویژگی قرنطینه‌ای را که macOS هنگام دانلود افزوده پاک می‌کند و فرمان دوم برنامه را اجرا می‌کند. معمولاً `sudo` لازم نیست، چون نسخهٔ `/Applications` متعلق به شماست؛ فقط در صورت خطای دسترسی آن را اضافه کنید.

**Apple Silicon یا Intel:** در Macهای سری M (M1 / M2 / M3 / M4) فایل DMG با `arm64` را بگیرید. در Macهای Intel، نسخهٔ `x64` را دانلود کنید. ساخت اشتباه با Rosetta هم اجرا می‌شود، اما به‌وضوح کندتر است.

> ساخت‌های macOS در CI روی اجراکننده‌های Apple Silicon و Intel تولید می‌شوند. اگر مشکلی دیدید، [گزارش باز کنید](../../issues)؛ بازخورد کاربران macOS مستقیماً چرخهٔ آزمون را شکل می‌دهد.

### <a id="why-warning"></a>چرا ممکن است هشدار ببینید

Arroxy متن‌باز و دارای مجوز MIT است. ساخت‌های Windows و macOS **امضای کد ندارند**؛ گواهی‌های Apple Developer ID و امضای Windows EV هرکدام سالانه صدها دلار هزینه دارند که باید از جیب یک پروژهٔ مستقل پرداخت شود. بدون این امضاها، Windows SmartScreen و macOS Gatekeeper در نخستین اجرا هشدار می‌دهند. هشدار یعنی *سیستم‌عامل ناشر را نمی‌شناسد*، نه اینکه Arroxy بدافزار است.

سه روش برای بررسی Arroxy، از ساده تا دقیق:

- **کد منبع را بخوانید.** همهٔ خطوط در [GitHub](https://github.com/antonio-orionus/Arroxy) هستند و می‌توانید برنامه را [از منبع بسازید](#tech).
- **SHA256 را بررسی کنید.** فایل را با [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) منتشرشده تطبیق دهید؛ بخش [بررسی دانلود](#verify) را ببینید.
- **از اسکن بیرونی استفاده کنید.** فایل را در [VirusTotal](https://www.virustotal.com) بارگذاری کنید.

### <a id="linux-first-launch"></a>نخستین اجرا در Linux

AppImage بدون نصب مستقیماً اجرا می‌شود. فقط باید فایل را اجرایی کنید.

**مدیر فایل:** روی `.AppImage` راست‌کلیک کنید ← **Properties** ← **Permissions** ← گزینهٔ **Allow executing file as program** را فعال و سپس دوبار کلیک کنید.

**ترمینال:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

اگر باز هم اجرا نشد، آن را بدون mount اجرا کنید؛ بستهٔ FUSE لازم نیست:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**یکپارچه‌سازی اختیاری با دسکتاپ:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) را یک بار نصب کنید تا هر AppImage که دوبار کلیک می‌کنید، بدون ساخت دستی فایل `.desktop` در منوی برنامه‌ها ثبت شود.

**بستهٔ tar ساده (بدون FUSE و نصب):**

ساخت `.tar.gz` همان برنامه بدون پوشش AppImage است؛ هرجا خواستید استخراج و اجرا کنید. نصاب یا FUSE لازم نیست.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Flatpak (گزینهٔ sandbox):** فایل `Arroxy-linux-x64.flatpak` را از همان صفحهٔ انتشار بگیرید.

Ubuntu به‌جای Flatpak با Snap عرضه می‌شود؛ ابتدا Flatpak را نصب و Flathub را اضافه کنید تا بسته runtime خود را از آنجا دریافت کند:

```bash
# Ubuntu / Debian
sudo apt install -y flatpak

# Fedora
sudo dnf install -y flatpak

# Arch
sudo pacman -S flatpak
```

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user ./Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

**دانلودهای Linux در صفحهٔ انتشار فقط برای x86_64 هستند.** روی دستگاه ARM64 (مانند Raspberry Pi و Asahi Linux)، Flatpak نصب می‌شود اما هنگام اجرا خطای `bwrap: execvp ldconfig: Exec format error` می‌دهد.

<details>
<summary><strong><a id="verify"></a>بررسی دانلود (SHA256)</strong></summary>

هر انتشار فایل `SHA256SUMS` را کنار فایل‌های اجرایی منتشر می‌کند. برای اطمینان از خراب یا دست‌کاری‌نشدن فایل در انتقال، hash را روی دستگاه محاسبه و با سطر متناظر در `SHA256SUMS` مقایسه کنید. صفحهٔ آخرین انتشار را باز کنید ← **Assets** ← `SHA256SUMS` را بگیرید.

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

اسکن مستقل بدافزار می‌خواهید؟ فایل را در [VirusTotal](https://www.virustotal.com) بارگذاری کنید. چند هشدار اکتشافی عمومی از موتورهای کوچک برای برنامه‌های Electron بدون امضا عادی است؛ هشدار گسترده از موتورهای اصلی واقعاً نگران‌کننده خواهد بود.

</details>

<details>
<summary><strong>Windows: نصاب یا نسخهٔ همراه</strong></summary>

|               | نصاب NSIS | `.exe` همراه |
| ------------- | :----------------------: | :---------------------: |
| نیازمند نصب | بله  | خیر — از هرجا اجرا کنید  |
| به‌روزرسانی خودکار | ✅ درون برنامه  | ❌ دانلود دستی  |
| سرعت شروع | ✅ سریع‌تر  | ⚠️ شروع سرد کندتر  |
| افزودن به منوی Start |            ✅            |           ❌            |
| حذف آسان |            ✅            | ❌ فایل را پاک کنید  |

**پیشنهاد:** برای به‌روزرسانی خودکار و شروع سریع‌تر از نصاب NSIS استفاده کنید. اگر نصب و تغییر رجیستری نمی‌خواهید، نسخهٔ `.exe` همراه را بگیرید.

</details>

---

## <a id="why"></a>چرا Arroxy

مقایسهٔ مستقیم با رایج‌ترین گزینه‌های جایگزین:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| رایگان، بدون سطح پولی |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| متن‌باز |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| پردازش فقط روی دستگاه |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| بدون ورود به حساب یا صادرکردن کوکی |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| بدون محدودیت استفاده |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| برنامهٔ دسکتاپ چندسکویی |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| زیرنویس + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy برای یک کار ساخته شده است: نشانی را بچسبانید و یک فایل محلی تمیز تحویل بگیرید. بدون حساب، فروش اضافی یا جمع‌آوری داده.

---

## <a id="features"></a>قابلیت‌ها

### کیفیت و قالب‌ها

- تا **4K UHD (2160p)**، همچنین 1440p، 1080p، 720p، 480p و 360p
- **نرخ فریم بالا** بدون تغییر حفظ می‌شود — 60 fps، 120 fps و HDR
- **صدا** — فقط صدا را به MP3، M4A/AAC، Opus یا WAV تبدیل کنید. در دانلود تعاملی، اگر موجود باشد قطعهٔ فراگیر/Dolby اصلی منبع (AC-3، E-AC-3، 5.1، DRC) را انتخاب کنید یا گزینهٔ سراسری **اولویت با صدای فراگیر / Dolby** را تنظیم کنید
- تنظیم‌های سریع: *بهترین کیفیت* · *متعادل* · *فایل کم‌حجم*

### حریم خصوصی و کنترل

- پردازش ۱۰۰٪ محلی — دانلود مستقیماً از YouTube روی دیسک شما می‌رود
- **متن‌باز** — همهٔ خطوط قابل بررسی، با مجوز MIT
- فایل‌ها مستقیماً در پوشهٔ انتخابی شما ذخیره می‌شوند

### روند کار

- **میان‌بر سراسری دانلود** — در هر برنامه‌ای پیوندی را کپی کنید و `Ctrl+Shift+D` (در macOS، `Cmd+Shift+D`) را بزنید؛ Arroxy بدون بازکردن پنجره آن را با نمایهٔ فعال به صف می‌فرستد و یک اعلان تأیید می‌کند. به‌طور پیش‌فرض فعال و قابل تغییر است
- **روش‌های شروع انعطاف‌پذیر** — دانلود تکی راهنما‌دار، انتخابگر فهرست پخش/کانال، چسباندن گروهی نشانی‌ها یا دانلود سریع با پیش‌فرض‌های ذخیره‌شده را انتخاب کنید
- **صف مرکزی دانلود** — کارهای تکی، فهرست پخش، گروهی و سریع همگی برای نمایش پیشرفت، مکث، ادامه، لغو، تلاش دوباره و تنظیم اولویت در یک جا قرار می‌گیرند
- **پایش کلیپ‌بورد** — پیوند YouTube را کپی کنید تا هنگام بازگشت به برنامه، Arroxy نشانی را خودکار وارد کند (قابل تنظیم در تنظیمات پیشرفته)
- **پاک‌سازی خودکار نشانی‌ها** — پارامترهای رهگیری (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) را حذف می‌کند و پیوندهای `youtube.com/redirect` را باز می‌کند
- **حالت سینی سیستم** — با بستن پنجره، دانلودها در پس‌زمینه ادامه می‌یابند
- **30 زبان** — زبان سیستم را خودکار تشخیص می‌دهد و هر زمان قابل تغییر است
- **همگام‌سازی فهرست پخش** — فهرست را دوباره با یک پوشهٔ محلی مقایسه می‌کند تا ویدیوهای دانلودشده رد شوند؛ فایل فهرست پخش `.m3u` می‌سازد که پس از هر دانلود به‌روز می‌شود
- **کنترل سرعت و فاصلهٔ درخواست‌ها** — پهنای باند را محدود کنید، شمار بخش‌های هم‌زمان هر ویدیو را تعیین کنید و با حالت‌های *خاموش · متعادل · محتاط · سفارشی* بین درخواست‌ها تأخیر بگذارید
- **الگوهای نام فایل** — با `{title}`، `{uploader}`، `{id}`، `{date}`، `{resolution}` و `{playlist_index}` نام دلخواه بسازید؛ سراسری یا برای هر نمایه
- **دانلود هم‌زمان و تلاش خودکار دوباره** — شمار دانلودهای هم‌زمان را تعیین کنید و بگذارید Arroxy دانلودی را که با مشکل شبکه یا سرور روبه‌رو شده، با فاصلهٔ بیشتر در هر نوبت دوباره امتحان کند
- **نمایهٔ جدا برای هر مورد فهرست پخش** — به‌جای یک تنظیم برای همه، به هر ویدیو نمایهٔ خودش را بدهید تا برخی با کیفیت کامل بایگانی شوند و بقیه به MP3 تبدیل شوند

### زیرنویس و پس‌پردازش

- **زیرنویس** در قالب SRT، VTT یا ASS — دستی یا خودکار و به هر زبان موجود
- کنار ویدیو ذخیره کنید، در `.mkv` بگنجانید یا در زیرپوشهٔ `Subtitles/` مرتب کنید
- **SponsorBlock** — بخش‌های تبلیغ، مقدمه، پایان و تبلیغ شخصی را رد کنید یا به‌صورت فصل علامت بزنید
- **فرادادهٔ جاسازی‌شده** — عنوان، تاریخ بارگذاری، کانال، توضیح، تصویر بندانگشتی و نشانگر فصل در فایل نوشته می‌شوند

### YouTube + ۲۰۰۰ سایت

- **پشتیبانی کامل YouTube** — ویدیوها، Shorts، کانال‌ها، فهرست‌های پخش، YouTube Music و پادکست‌ها منابع درجه‌یک هستند
- **بیش از ۲۰۰۰ سایت دیگر** با yt-dlp — Vimeo، Twitch، Twitter/X، TikTok، SoundCloud، Bandcamp، Bilibili، BBC iPlayer، archive.org و بسیاری دیگر
- **فقط صدا و زیرنویس** در همهٔ سایت‌های پشتیبانی‌شده کار می‌کند، نه فقط YouTube
- اگر سایتی تغییر کند، yt-dlp هر هفته اصلاحیه می‌دهد و Arroxy فایل اجرایی را هنگام شروع خودکار به‌روز می‌کند

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="میان‌بر سراسری دانلود Arroxy — Ctrl+Shift+D در Windows و Linux و Cmd+Shift+D در macOS که پیوند کپی‌شده را مستقیم به صف می‌فرستد" width="760" /></picture><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>میان‌بر سراسری دانلود</b><br/>هرجا پیوندی را کپی و یک بار کلیدها را بزنید؛ به صف می‌رود و دانلود آغاز می‌شود</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>نمایهٔ جدا برای هر مورد فهرست پخش</b><br/>به هر ویدیو نمایهٔ خودش را بدهید؛ برخی را 4K و بقیه را MP3 بگیرید</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>صفحهٔ دانلود سریع</b><br/>نشانی را بچسبانید و فوراً با نمایهٔ فعال دانلود کنید</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>نمایه‌های دانلود قابل استفادهٔ دوباره</b><br/>قالب، کیفیت و مقصد را ذخیره و در هر دانلود استفاده کنید</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>قطعه‌های صوتی چندزبانه</b><br/>زبان دقیق صدای همراه ویدیو را انتخاب کنید</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>صدای فراگیر / Dolby</b><br/>قطعه‌های 5.1 و Dolby شناسایی و حفظ می‌شوند</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>حالت نشانی‌های گروهی</b><br/>فهرستی را بچسبانید، موارد تکراری را خودکار حذف و همه را به صف اضافه کنید</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>صف دانلود موازی</b><br/>چند دانلود هم‌زمان با پیشرفت زنده</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>حریم خصوصی

دانلود با [yt-dlp](https://github.com/yt-dlp/yt-dlp) مستقیماً از YouTube به پوشهٔ انتخابی می‌رود و از سرور ثالث عبور نمی‌کند. سابقهٔ تماشا و دانلود، نشانی‌ها و محتوای فایل روی دستگاه شما می‌مانند.

Arroxy از طریق [OpenPanel](https://openpanel.dev) داده‌های آماری ناشناس و تجمیعی می‌فرستد؛ فقط به اندازه‌ای که یک پروژهٔ مستقل خطاها، crashها، بازخورد، سیستم‌عامل و نسخهٔ برنامه را بشناسد. هیچ نشانی، عنوان ویدیو، مسیر فایل، اطلاعات حساب، fingerprint یا دادهٔ شخصی ارسال نمی‌شود. شناسهٔ هر نصب تصادفی و بی‌ارتباط با هویت شماست. می‌توانید در تنظیمات آن را خاموش کنید.

---

## <a id="faq"></a>پرسش‌های متداول

**واقعاً رایگان است؟**
بله — مجوز MIT، بدون سطح پولی یا قابلیت قفل‌شده.

**چه کیفیت‌هایی را می‌توانم دانلود کنم؟**
هرچه YouTube ارائه دهد: 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p و فقط صدا. جریان‌های 60 fps، 120 fps و HDR بدون تغییر حفظ می‌شوند.

**می‌توانم فقط صدا را به‌صورت MP3 بگیرم؟**
بله. در منوی قالب *فقط صدا* را انتخاب کنید و MP3، M4A/AAC، Opus یا WAV را برگزینید.

**به حساب YouTube یا کوکی نیاز دارم؟**
در حالت پیش‌فرض خیر؛ Arroxy بدون حساب YouTube، ورود یا صادرکردن کوکی کار می‌کند. پشتیبانی اختیاری کوکی در تنظیمات پیشرفته (منبع کوکی: فایل یا مرورگر) برای محتوای نیازمند احراز هویت، مانند ویدیوهای دارای محدودیت سنی یا ویژهٔ اعضا، وجود دارد و پیش‌فرض خاموش است. اگر آن را روشن کنید، راهنمای yt-dlp یادآور می‌شود که [اتوماسیون مبتنی بر کوکی ممکن است باعث علامت‌گذاری حساب Google شود](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)؛ در این حالت حساب موقت امن‌تر است.

**وقتی YouTube چیزی را تغییر دهد باز هم کار می‌کند؟**
yt-dlp هنگام شروع خودکار به‌روز می‌شود و Arroxy پس از تغییرات YouTube سریع اصلاحیه می‌دهد. اگر باز هم مشکلی پیش آمد، پشتیبانی اختیاری کوکی در تنظیمات پیشرفته راه‌حل جایگزین است.

**Arroxy به چه زبان‌هایی در دسترس است؟**
30 زبان آمادهٔ استفاده: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy در نخستین اجرا زبان سیستم‌عامل را خودکار تشخیص می‌دهد و هر زمان می‌توانید آن را از انتخابگر زبان نوار ابزار عوض کنید. JSONهای زبان زمان اجرا در src/shared/i18n/locales/ و کاتالوگ‌های PO مترجمان در i18n/locales/ هستند؛ برای مشارکت در GitHub یک PR باز کنید.

**لازم است چیز دیگری نصب کنم؟**
خیر. yt-dlp در نخستین اجرا خودکار دانلود و روی دستگاه cache می‌شود؛ ffmpeg و ffprobe همراه برنامه هستند. پس از آن تنظیم اضافه‌ای لازم نیست.

**می‌توانم فهرست پخش یا یک کانال کامل را دانلود کنم؟**
بله، هر دو. نشانی فهرست یا کانال را بچسبانید (مانند `youtube.com/@handle`، `/channel/UC…`، `/c/Name`، `/user/Old`)، تعداد موارد بررسی را انتخاب کنید و سپس کل فهرست یا ویدیوهای مشخص را به صف بفرستید. فیلتر بازهٔ تاریخ به‌زودی می‌آید.

**macOS می‌گوید «برنامه آسیب‌دیده است»؛ چه کنم؟**
این Gatekeeper است که برنامهٔ بدون امضا را مسدود می‌کند، نه آسیب واقعی. فرمان‌های ترمینال برای پاک‌کردن قرنطینه و اجرای Arroxy را در [نخستین اجرا در macOS](#macos-first-launch) ببینید.

**دانلود ویدیوهای YouTube قانونی است؟**
برای استفادهٔ شخصی و خصوصی در بیشتر حوزه‌های قضایی عموماً پذیرفته می‌شود. مسئولیت رعایت [شرایط استفاده](https://www.youtube.com/t/terms) YouTube و قوانین حق نشر محل زندگی با شماست.

---

## <a id="roadmap"></a>نقشهٔ راه

موارد برنامه‌ریزی‌شده، تقریباً به ترتیب اولویت:

| قابلیت    | توضیح    |
| ---------------- | ---------------- |
| **فیلتر فهرست پخش و کانال** | فیلتر بازهٔ تاریخ هنگام خواندن فهرست پخش یا کانال |
| **اولویت زبان قطعهٔ صوتی YouTube** | تعیین زبان گفتار ترجیحی برای کل برنامه با امکان تغییر در هر نمایه، وقتی YouTube چند قطعه دارد |
| **ورود با مرورگر درون برنامه** | بازکردن مرورگر در Arroxy برای ورود و استفاده از کوکی سایت بدون صادرکردن دستی |
| **دانلود ویدیو با یک کلیک** | شروع دانلود نشانی تشخیص‌داده یا چسبانده‌شده با نمایهٔ فعال در یک کلیک |
| **بازیابی قوی‌تر با تلاش دوباره** | مسیر تازه برای تکرار دانلودهایی که اینترنت ناپایدار یا مشکل‌دار قطع کرده است |
| **پنل کامل مدیریت دانلود** | تبدیل پنل صف به مدیر کامل‌تر، از جمله تغییر پوشهٔ مقصد موارد در صف |
| **دانلود زمان‌بندی‌شده** | شروع صف در زمان مشخص، مثلاً شب |
| **برش کلیپ** | دانلود فقط یک بخش با زمان آغاز و پایان |

قابلیتی در ذهن دارید؟ [درخواست باز کنید](../../issues)؛ نظر انجمن اولویت‌ها را شکل می‌دهد.

---

## <a id="support"></a>پشتیبانی از Arroxy

Arroxy رایگان و دارای مجوز MIT است؛ بدون تبلیغ و سطح پولی. اگر در وقتتان صرفه‌جویی می‌کند، می‌توانید با Bitcoin یا Tron از توسعه پشتیبانی کنید. نشانی‌ها در [DONATE.md](DONATE.md) هستند که تنها منبع رسمی است. Arroxy هرگز نشانی را با ایمیل یا پیام مستقیم نمی‌فرستد. ستاره‌دادن به مخزن، گزارش خطا و بهبود ترجمه‌ها نیز به همان اندازه کمک می‌کند.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a>

---

## <a id="tech"></a>فناوری‌های به‌کاررفته

<details>
<summary><strong>فناوری‌ها</strong></summary>

- **Electron** — پوستهٔ دسکتاپ چندسکویی
- **React 19** + **TypeScript** — رابط کاربری
- **Tailwind CSS v4** — ظاهر برنامه
- **Zustand** — مدیریت وضعیت
- **yt-dlp** + **ffmpeg** — موتور دانلود و ترکیب جریان‌ها (yt-dlp هنگام اجرا دریافت می‌شود؛ ffmpeg/ffprobe هنگام ساخت در بسته قرار می‌گیرند)
- **Vite** + **electron-vite** — ابزار ساخت
- **Vitest** + **Playwright** — آزمون واحد و سرتاسری

</details>

<details>
<summary><strong>ساخت از کد منبع</strong></summary>

### پیش‌نیازها — همهٔ پلتفرم‌ها

| ابزار | نسخه | نصب |
| ----- | ----- | --- |
| Git | هر نسخه | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | `mise install` یا `.node-version` |
| Bun | 1.2.23 | `mise install` یا `package.json` و `packageManager` |

پیشنهاد می‌شود `mise` را نصب کنید و سپس در checkout فرمان `mise install` را اجرا کنید. بدون mise، پیش از `bun run bootstrap` نسخهٔ Node.js را از `.node-version` و Bun را از `package.json` به‌صورت دستی فعال کنید.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

برای بازسازی وابستگی‌های native ممکن است Visual Studio Build Tools و Python لازم باشند.

### macOS

```bash
brew install mise
xcode-select --install
```

پس از clone، در checkout فرمان `mise trust && mise install` را اجرا کنید. اگر shell شما از قبل `fnm`، `nvm` یا Bun نصب‌شده با Homebrew را به کار می‌برد، mise را در `~/.zshrc` فعال کنید تا Arroxy از Node.js 24.16.0 و Bun 1.2.23 استفاده کند:

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

# وابستگی‌های ساخت و اجرای Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# فقط آزمون‌های E2E (Electron به نمایشگر نیاز دارد)
sudo apt install -y xvfb
```

### clone و اجرا

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # پیشنهاد می‌شود؛ اگر نسخه‌های ثابت را دستی فعال کرده‌اید، رد کنید
bun run bootstrap
bun run doctor
bun run dev            # برنامهٔ Electron با renderer مبتنی بر Vite
```

### ساخت بستهٔ قابل توزیع

```bash
bun run build        # بررسی type + ساخت
bun run dist         # بستهٔ سیستم‌عامل فعلی
bun run dist:win     # ساخت هدف‌های Windows روی میزبان پشتیبانی‌شده
```

> `bun run bootstrap` وابستگی‌ها را نصب می‌کند، وابستگی‌های برنامهٔ Electron را بازسازی و خود Electron را بررسی می‌کند، ffmpeg/ffprobe داخلی را برای توسعه آماده و Playwright Chromium را نصب می‌کند. yt-dlp هنگام اجرا در پوشهٔ دادهٔ برنامه مدیریت می‌شود؛ ffmpeg و ffprobe همراه هر انتشار Arroxy هستند.

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

---

## شرایط استفاده

Arroxy ابزاری فقط برای استفادهٔ شخصی و خصوصی است. مسئولیت اطمینان از سازگاری دانلودها با [شرایط استفاده](https://www.youtube.com/t/terms) YouTube و قوانین حق نشر حوزهٔ قضایی شما فقط بر عهدهٔ خودتان است. Arroxy را برای دانلود، تکثیر یا توزیع محتوایی که حق استفاده از آن را ندارید به کار نبرید. توسعه‌دهندگان مسئول سوءاستفاده نیستند.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>مجوز MIT · ساخته‌شده با دقت توسط <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
