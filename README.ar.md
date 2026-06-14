<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="شعار Arroxy" width="180" />

# Arroxy — محمّل يوتيوب (+ 2000 موقع) مجاني ومفتوح المصدر لـ Windows وmacOS وLinux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**اقرأ بـ:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · **العربية** · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![الإصدار](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![البناء](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![الموقع الإلكتروني](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![الرخصة](https://img.shields.io/badge/license-MIT-green) ![الأنظمة](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![اللغات](https://img.shields.io/badge/i18n-21_languages-blue)

نزِّل مقاطع الفيديو وShorts والموسيقى والقنوات والبودكاست والمقاطع الصوتية من **يوتيوب وأكثر من 2000 موقع مدعوم** — حتى 4K HDR بـ 60 إطاراً في الثانية، أو بصيغ MP3 / AAC / Opus. يعمل محلياً على Windows وmacOS وLinux. **لا إعلانات، لا حشو، لا عروض ترويجية.**

[**↓ تنزيل أحدث إصدار**](#install) &nbsp;·&nbsp; [**الموقع الإلكتروني**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#install) · [macOS](#install) · [Linux](#install)

[![انضم إلى مجتمع Discord](https://img.shields.io/badge/%D8%A7%D9%86%D8%B6%D9%85%20%D8%A5%D9%84%D9%89%20%D9%85%D8%AC%D8%AA%D9%85%D8%B9%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="عرض توضيحي لـ Arroxy" width="720" />

إذا وفّر لك Arroxy الوقت، فإن ⭐ يساعد الآخرين على اكتشافه.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

---

## المحتويات

- [التنزيل](#install)
- [لماذا Arroxy](#why)
- [الميزات](#features)
- [الخصوصية](#privacy)
- [الأسئلة الشائعة](#faq)
- [خارطة الطريق](#roadmap)
- [مبني باستخدام](#tech)

---

## <a id="install"></a>التنزيل

| النظام | الصيغة |
| ------------------- | ----------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**احصل على أحدث إصدار →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="why-warning"></a>لماذا قد تظهر لك تحذيرات

Arroxy مفتوح المصدر ومرخَّص بـ MIT. إصدارات Windows وmacOS **غير موقَّعة رمزياً** — شهادات Apple Developer ID وWindows EV للتوقيع الرمزي تكلّف كل منها مئات الدولارات سنوياً، وهو ما يتحمّله المشروع المستقل من جيبه. وبدون تلك التوقيعات، سيحذّرك Windows SmartScreen وmacOS Gatekeeper عند الإطلاق الأول. تعني هذه التحذيرات *أن نظام تشغيلك لا يتعرّف على الناشر* — ولا تعني أن Arroxy برنامج خبيث.

ثلاث طرق للتحقق من Arroxy بنفسك، بترتيب متصاعد من الصرامة:

- **اقرأ الكود المصدري.** كل سطر موجود على [GitHub](https://github.com/antonio-orionus/Arroxy) ويمكنك [بناؤه من المصدر](#tech).
- **تحقق من SHA256.** طابق ملفك مع [`SHA256SUMS`](../../releases/latest) المنشور — راجع [التحقق من تنزيلك](#verify) أدناه.
- **أجرِ فحصاً بطرف ثالث.** ارفع الملف إلى [VirusTotal](https://www.virustotal.com).

### <a id="windows-first-launch"></a>التشغيل الأول على Windows

عند التشغيل الأول قد تظهر **"Windows protected your PC"** أو **"Unknown publisher."** ينطبق هذا على كلٍّ من `Arroxy-win-x64-Setup.exe` و`Arroxy-win-x64-Portable.exe`. Arroxy مجاني ومفتوح المصدر وإصدارات Windows غير موقَّعة بشهادة مدفوعة، لذا يُعلِّمها SmartScreen. هذا **لا** يعني تلقائياً أن Arroxy غير آمن. للمتابعة:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="نافذة SmartScreen "Windows protected your PC" مع إبراز رابط "More info"" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="نافذة SmartScreen بعد توسيع More info، تعرض زر "Run anyway"" />
</div>

1. انقر **More info**.
2. انقر **Run anyway**.

#### إذا علّم Windows Defender الملف أو أزاله

أحياناً تُعلِّم خوارزميات Defender التجريبية مثبّتات NSIS غير الموقَّعة وNSIS Electron المحمولة باعتبارها مشبوهة. إذا عزل Defender ملف `Arroxy-win-x64-Setup.exe` أو `Arroxy-win-x64-Portable.exe`، فاستعده من **Windows Security → Virus & threat protection → Protection history**، ثم أضف ملف Arroxy التنفيذي كعنصر مسموح به ضمن **Manage settings → Add or remove exclusions**. كما هو الحال مع SmartScreen، السبب هو غياب توقيع الناشر لا وجود برنامج خبيث.

> حمِّل Arroxy من صفحة GitHub Releases الرسمية فقط. إذا حصلت على الملف من موقع آخر أو أرسله إليك أحد، احذفه وحمِّل نسخة جديدة من المصدر الرسمي. الكود المصدري عام ويمكنك مراجعته أو بناء Arroxy بنفسك إن أردت.

### <a id="macos-first-launch"></a>التشغيل الأول على macOS

Arroxy غير موقَّع رمزياً لـ macOS بعد، لذا سيحظر Gatekeeper الإطلاق الأول. يعتمد المسار الدقيق للسماح به على إصدار macOS الخاص بك — Sequoia 15 شدّد طريقة التجاوز القديمة عبر النقر الأيمن → Open.

#### macOS Sequoia 15 والأحدث (الحالي)

على Sequoia 15 والأحدث، النقر الأيمن → Open لم يعد يتجاوز Gatekeeper للكثير من التطبيقات المحجوزة. استخدم لوحة System Settings بدلاً من ذلك:

1. اسحب `Arroxy.app` من DMG المثبَّت إلى `/Applications`.
2. انقر مزدوجاً على Arroxy. تظهر نافذة الحظر — انقر **Done** (لا تنقر *Move to Trash*).
3. افتح **System Settings → Privacy & Security** ومرِّر إلى قسم **Security**. ستجد *"Arroxy was blocked to protect your Mac"* (أو رسالة مشابهة).
4. انقر **Open Anyway**، أكِّد بكلمة المرور أو Touch ID، ثم أعِد تشغيل Arroxy من `/Applications`.

#### macOS Sonoma 14 وما قبله

1. اسحب `Arroxy.app` من DMG المثبَّت إلى `/Applications`.
2. انقر بزر الأيمن (أو Control-click) على `Arroxy.app` في `/Applications` واختر **Open**.
3. نافذة التحذير تحتوي الآن على زر **Open** — انقره وأكِّد. يفتح Arroxy بشكل طبيعي ولن يظهر التحذير مجدداً.

#### "App is damaged" أو حظر Gatekeeper المستمر — إصلاح عبر Terminal

إذا قال macOS *"Arroxy is damaged and can't be opened"*، أو لم تُزِل أيٌّ من الخطوات أعلاه الحظر، فسمة الحجر على DMG هي السبب (بعض المتصفحات وسلوك macOS الخاص بالنقل يُعيِّنانها). احذفها من التطبيق المثبَّت:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon مقابل Intel:** على Mac من سلسلة M (M1 / M2 / M3 / M4)، نزِّل DMG الإصدار `arm64`. على أجهزة Intel، نزِّل DMG الإصدار `x64`. تشغيل الإصدار الخاطئ يعمل عبر Rosetta لكنه أبطأ بشكل ملحوظ.

> تُنتَج إصدارات macOS عبر CI على أجهزة Apple Silicon وIntel. إذا واجهت مشاكل، يرجى [فتح تقرير](../../issues) — تعليقات مستخدمي macOS تُشكِّل دورة الاختبار بفاعلية.

### <a id="linux-first-launch"></a>التشغيل الأول على Linux

تعمل AppImages مباشرة — دون تثبيت. تحتاج فقط إلى تعيين الملف كقابل للتنفيذ.

**مدير الملفات:** انقر بزر الأيمن على `.AppImage` ← **خصائص** ← **أذونات** ← مكِّن **السماح بتنفيذ الملف كبرنامج**، ثم انقر نقراً مزدوجاً.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

إذا فشل التشغيل بعد ذلك، قد يكون FUSE مفقوداً:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**تكامل سطح المكتب الاختياري:** ثبِّت [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) مرة واحدة، وأي AppImage تنقر عليه نقراً مزدوجاً سيُسجَّل تلقائياً في قائمة تطبيقاتك — دون الحاجة إلى إنشاء ملف `.desktop` يدوياً.

**Flatpak (بديل معزول):** نزِّل `Arroxy-*.flatpak` من صفحة الإصدار نفسها.

```bash
flatpak install --user Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>التحقق من تنزيلك (SHA256)</strong></summary>

يُنشر مع كل إصدار ملف `SHA256SUMS` إلى جانب الملفات الثنائية. للتحقق من عدم تلف تنزيلك أو العبث به أثناء النقل، احسب هاش ملفك محلياً وطابقه مع السطر المقابل في `SHA256SUMS`. افتح صفحة الإصدار الأخير → **Assets** → نزِّل `SHA256SUMS`.

**Windows (PowerShell أو Command Prompt):**

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

تريد فحصاً لبرامج الخبيثة من طرف ثالث؟ ارفع الملف على [VirusTotal](https://www.virustotal.com). بضع إشارات هيوريستية عامة من محركات صغيرة أمر طبيعي لتطبيقات Electron غير الموقَّعة؛ أما الكشف الواسع من محركات رئيسية فيكون مدعاة قلق حقيقية.

</details>

<details>
<summary><strong>التثبيت عبر مدير الحزم</strong></summary>

تستخدم مدير حزم بالفعل؟ يمكنك تجاوز مسار التنزيل اليدوي.

| القناة | الأمر                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-linux-x64.flatpak`                                                 |

</details>

<details>
<summary><strong>Windows: المثبِّت مقابل المحمول</strong></summary>

|               | NSIS Installer | Portable `.exe` |
| ------------- | :----------------------: | :---------------------: |
| يتطلب التثبيت | نعم  | لا — يعمل من أي مكان  |
| التحديث التلقائي | ✅ داخل التطبيق  | ❌ تنزيل يدوي  |
| سرعة التشغيل | ✅ أسرع  | ⚠️ بداية باردة أبطأ  |
| يُضاف إلى قائمة ابدأ |            ✅            |           ❌            |
| سهولة إلغاء التثبيت |            ✅            | ❌ احذف الملف  |

**التوصية:** استخدم مثبِّت NSIS للتحديثات التلقائية والتشغيل الأسرع. استخدم `.exe` المحمول لخيار بدون تثبيت وبدون سجل.

</details>

---

## <a id="why"></a>لماذا Arroxy

مقارنة جنباً إلى جنب مع أكثر البدائل شيوعاً:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| مجاني، بدون مستوى مميز |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| مفتوح المصدر |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| معالجة محلية فقط |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| لا تسجيل دخول ولا تصدير كوكيز |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| لا حدود للاستخدام |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| تطبيق سطح مكتب متعدد الأنظمة |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| ترجمات + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy مبني لغرض واحد: الصق رابطاً، احصل على ملف محلي نظيف. لا حسابات، لا عروض ترويجية، لا جمع بيانات.

---

## <a id="features"></a>الميزات

### الجودة والصيغ

- حتى **4K UHD (2160p)**، 1440p، 1080p، 720p، 480p، 360p
- **معدل إطارات عالٍ** محفوظ كما هو — 60 fps، 120 fps، HDR
- **عناصر تحكم الصوت** — تصدير الصوت فقط بصيغ MP3 أو M4A/AAC أو Opus أو WAV؛ ضبط خيار عام **تفضيل المحيطي / Dolby**؛ وإبقاء مسارات Dolby AC-3/EC-3 الأصلية، ومتعددة القنوات، وDRC، وغيرها من المسارات الصوتية المتقدمة قابلة للاختيار في التنزيلات التفاعلية عند توفرها
- إعدادات سريعة: *أفضل جودة* · *متوازن* · *ملف صغير*

### الخصوصية والتحكم

- معالجة محلية 100% — تذهب التنزيلات مباشرة من يوتيوب إلى قرصك
- لا تسجيل دخول، لا كوكيز، لا ربط بحساب Google
- الملفات تُحفظ مباشرة في المجلد الذي تختاره

### سير العمل

- **أوضاع بدء مرنة** — اختر تنزيلًا فرديًا موجّهًا، أو منتقي قائمة تشغيل/قناة، أو لصق روابط دفعة واحدة، أو Quick Download بالإعدادات الافتراضية المحفوظة
- **طابور تنزيل مركزي** — كل مهمة فردية أو قائمة تشغيل أو دفعة روابط أو تنزيل سريع تصل إلى مكان واحد لمتابعة التقدم والإيقاف المؤقت والاستئناف والإلغاء وإعادة المحاولة والتحكم في الأولوية
- **مراقبة الحافظة** — انسخ رابط يوتيوب ويملأ Arroxy الحقل تلقائياً عند العودة للتطبيق (قابل للتفعيل في الإعدادات المتقدمة)
- **تنظيف الروابط تلقائياً** — يحذف معاملات التتبع (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) ويفك روابط `youtube.com/redirect`
- **وضع الشريط** — إغلاق النافذة يبقي التنزيلات تعمل في الخلفية
- **21 لغة** — يكتشف لغة النظام تلقائياً، قابل للتغيير في أي وقت
- **مزامنة قوائم التشغيل** — يعيد فحص قائمة التشغيل مقابل مجلد محلي لتخطي الفيديوهات التي نُزّلت من قبل؛ وينشئ ملف قائمة تشغيل `.m3u` يتم تحديثه مع تنزيل كل فيديو
- **تحكم في السرعة والإيقاع** — حدّد نطاق التنزيل، وأضف تأخيرات بين الطلبات، واضبط خيوط الأجزاء باستخدام إعدادات مسبقة (*إيقاف · متوازن · حذر · مخصص*)

### الترجمات والمعالجة اللاحقة

- **ترجمات** بصيغ SRT أو VTT أو ASS — يدوية أو مولَّدة تلقائياً، بأي لغة متاحة
- حفظها بجانب الفيديو، أو تضمينها في `.mkv`، أو تنظيمها في مجلد فرعي `Subtitles/`
- **SponsorBlock** — تخطي الرعاة أو وضع علامة فصل عليهم، المقدمات والخواتم والترويج الذاتي
- **بيانات وصفية مضمّنة** — العنوان، تاريخ الرفع، القناة، الوصف، الصورة المصغرة، وعلامات الفصول تُكتب في الملف

### YouTube + 2000 موقع

- **YouTube — بالكامل** — الفيديوهات وShorts والقنوات وقوائم التشغيل وYouTube Music والبودكاست تُعالَج كمصادر أولى
- **أكثر من 2000 موقع آخر** عبر yt-dlp — Vimeo وTwitch وTwitter/X وTikTok وSoundCloud وBandcamp وBilibili وBBC iPlayer وarchive.org وغيرها الكثير
- **الصوت فقط والترجمات** تعملان على كل موقع مدعوم، ليس يوتيوب فحسب
- إذا تغيَّر موقع ما، يُصدر yt-dlp إصلاحات أسبوعياً ويحدِّث Arroxy الملف التنفيذي تلقائياً عند التشغيل

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="الصق رابطاً" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="اختر الجودة" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="اختر مكان الحفظ" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="قائمة التنزيل في العمل" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="منتقي لغة وصيغة الترجمة" />
</div>

---

## <a id="privacy"></a>الخصوصية

تُجلب التنزيلات مباشرة عبر [yt-dlp](https://github.com/yt-dlp/yt-dlp) من يوتيوب إلى المجلد الذي تختاره — لا شيء يمر عبر خادم طرف ثالث. سجل المشاهدة والتنزيل والروابط ومحتوى الملفات تبقى على جهازك.

يرسل Arroxy قياسات مجهولة ومجمّعة عبر [OpenPanel](https://openpanel.dev) — بما يكفي فقط لفهم مرات التشغيل وأنظمة التشغيل وإصدارات التطبيق والأعطال. لا URLs، لا عناوين فيديو، لا مسارات ملفات، لا معلومات حساب، لا بصمة رقمية، ولا بيانات شخصية. معرّف كل تثبيت عشوائي وغير مرتبط بهويتك. يمكنك إيقافه من الإعدادات.

---

## <a id="faq"></a>الأسئلة الشائعة

**هل هو مجاني حقاً؟**
نعم — مرخَّص بـ MIT، بدون مستوى مميز، بدون قيود على الميزات.

**ما جودات الفيديو التي يمكنني تنزيلها؟**
كل ما يوفره يوتيوب: 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، بالإضافة إلى الصوت فقط. تدفقات 60 fps و120 fps وHDR محفوظة كما هي.

**هل يمكنني استخراج الصوت فقط بصيغة MP3؟**
نعم. اختر *صوت فقط* من قائمة الصيغ ثم اختر MP3 أو M4A/AAC أو Opus أو WAV.

**هل أحتاج إلى حساب يوتيوب أو كوكيز؟**
افتراضياً، لا — يعمل Arroxy دون حساب YouTube أو تسجيل دخول أو تصدير كوكيز. يتوفر دعم اختياري للكوكيز في الإعدادات المتقدمة (Cookies source: file or browser) للمحتوى الذي يتطلب مصادقة، مثل الفيديوهات المقيَّدة بالعمر أو المخصَّصة للأعضاء فقط. وهو معطَّل افتراضياً. إذا فعّلته، فإن ويكي yt-dlp يشير إلى أن [الأتمتة المعتمدة على الكوكيز قد تُعلِّم حساب Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)؛ في هذه الحالة يكون الحساب البديل المؤقت الخيار الأكثر أماناً.

**هل سيستمر في العمل عند تغيير يوتيوب لشيء ما؟**
يُحدَّث yt-dlp تلقائياً عند الإطلاق، ويُصدر Arroxy إصلاحات بسرعة عندما يُغيِّر YouTube شيئاً ما. وإن واجهت مشكلة، يتوفر دعم اختياري للكوكيز في الإعدادات المتقدمة كحل احتياطي.

**ما اللغات المتاحة في Arroxy؟**
إحدى وعشرون لغة، جاهزة للاستخدام: English وEspañol (الإسبانية) وDeutsch (الألمانية) وFrançais (الفرنسية) و日本語 (اليابانية) و中文 (الصينية) وРусский (الروسية) وУкраїнська (الأوكرانية) وहिन्दी (الهندية) وAfaan Oromoo وKiswahili وO'zbekcha (الأوزبكية) وTiếng Việt (الفيتنامية) وአማርኛ (الأمهرية) والعربية واردو (الأردية) وپښتو (البشتونية) وবাংলা (البنغالية) وမြန်မာဘာသာ (البورمية) وΕλληνικά (اليونانية) وСрпски (الصربية). يكتشف Arroxy لغة نظام تشغيلك تلقائياً عند الإطلاق الأول، ويمكنك التبديل في أي وقت من محدد اللغة في شريط الأدوات. توجد ملفات JSON الخاصة بواجهات التشغيل في src/shared/i18n/locales/، وتوجد كتالوجات PO الموجهة للمترجمين في i18n/locales/ — افتح طلب سحب على GitHub للمساهمة.

**هل أحتاج إلى تثبيت شيء آخر؟**
لا. يُحمَّل yt-dlp تلقائياً عند الإطلاق الأول ويُخزَّن على جهازك؛ أمّا ffmpeg وffprobe فيأتيان داخل التطبيق. بعد ذلك، لا تحتاج أي إعداد إضافي.

**هل يمكنني تنزيل قوائم التشغيل أو القنوات بالكامل؟**
نعم — كلاهما. الصق رابط قائمة تشغيل أو قناة (مثل `youtube.com/@handle` أو `/channel/UC…` أو `/c/Name` أو `/user/Old`)؛ اختر عدد العناصر التي تريد فحصها، ثم أضف القائمة كلها إلى الطابور أو اختر فيديوهات محددة. ستأتي فلاتر نطاق التاريخ قريبًا.

**يقول macOS إن "التطبيق تالف" — ماذا أفعل؟**
هذا Gatekeeper في macOS يحظر تطبيقاً غير موقَّع، وليس تلفاً فعلياً. راجع ["App is damaged" — إصلاح عبر Terminal](#macos-first-launch) لأمر `xattr` بسطر واحد يُزيل الحظر.

**هل تنزيل فيديوهات يوتيوب قانوني؟**
للاستخدام الشخصي الخاص، يُقبَل هذا عموماً في معظم الولايات القضائية. أنت مسؤول عن الامتثال لـ [شروط خدمة](https://www.youtube.com/t/terms) يوتيوب وقوانين حقوق النشر في بلدك.

---

## <a id="roadmap"></a>خارطة الطريق

ما زال مخططًا — تقريبًا بترتيب الأولوية:

| الميزة    | الوصف    |
| ---------------- | ---------------- |
| **فلاتر قوائم التشغيل والقنوات** | فلاتر نطاق التاريخ عند تعداد قائمة تشغيل أو قناة |
| **تفضيلات مسارات الصوت في YouTube** | اختيار مسارات لغة الكلام المفضلة عندما يوفر YouTube أكثر من مسار صوتي |
| **تسجيل دخول بمتصفح داخل التطبيق** | فتح نوافذ متصفح داخل Arroxy لتسجيل الدخول واستخدام cookies الخاصة بالموقع دون تصديرها يدوياً |
| **تنزيل فيديو بنقرة واحدة** | بدء تنزيل فيديو بنقرة واحدة من رابط مكتشف أو ملصوق باستخدام ملفك النشط |
| **استرداد أقوى بإعادة المحاولة** | مسار إعادة محاولة جديد للتنزيلات التي تقطعها اتصالات إنترنت غير موثوقة أو إشكالية |
| **درج مدير تنزيلات كامل** | تحويل درج قائمة الانتظار إلى مدير أوسع، بما في ذلك تغيير مجلدات الوجهة للعناصر المصطفة |
| **التنزيلات المجدولة** | بدء قائمة في وقت محدد (تشغيل ليلي) |
| **قص المقاطع** | تنزيل جزء فقط بتحديد وقت البداية والنهاية |

هل لديك ميزة في ذهنك؟ [افتح طلباً](../../issues) — مدخلات المجتمع تُشكِّل الأولويات.

---

## <a id="tech"></a>مبني باستخدام

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — بيئة سطح المكتب متعددة الأنظمة
- **React 19** + **TypeScript** — واجهة المستخدم
- **Tailwind CSS v4** — التنسيق
- **Zustand** — إدارة الحالة
- **yt-dlp** + **ffmpeg** — محرك التنزيل والدمج (يُجلب yt-dlp وقت التشغيل؛ ويُضمَّن ffmpeg/ffprobe وقت البناء)
- **Vite** + **electron-vite** — أدوات البناء
- **Vitest** + **Playwright** — اختبارات الوحدة والشامل

</details>

<details>
<summary><strong>البناء من المصدر</strong></summary>

### المتطلبات الأساسية — جميع الأنظمة

| الأداة | الإصدار | التثبيت |
| ---- | ------- | ------- |
| Git  | أي إصدار | [git-scm.com](https://git-scm.com) |
| Bun  | الأحدث  | انظر الأنظمة أدناه |

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

لا حاجة لأدوات بناء أصلية — المشروع لا يحتوي على إضافات Node أصلية.

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# اعتماديات Electron
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# اختبارات E2E فقط (يحتاج Electron إلى شاشة)
sudo apt install -y xvfb
```

### الاستنساخ والتشغيل

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # بناء تطويري مع إعادة التحميل الفوري
```

### بناء حزمة قابلة للتوزيع

```bash
bun run build        # فحص الأنواع + التجميع
bun run dist         # حزمة للنظام الحالي
bun run dist:win     # تجميع متقاطع لـ Windows Portable exe
```

> يُجلب yt-dlp من GitHub عند أول تشغيل ويُخزَّن في مجلد بيانات التطبيق. يأتي ffmpeg وffprobe مضمنين مع كل إصدار من Arroxy.

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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## شروط الاستخدام

Arroxy أداة للاستخدام الشخصي الخاص فقط. أنت مسؤول مسؤولية كاملة عن ضمان امتثال تنزيلاتك لـ [شروط خدمة](https://www.youtube.com/t/terms) يوتيوب وقوانين حقوق النشر في ولايتك القضائية. لا تستخدم Arroxy لتنزيل أو إعادة إنتاج أو توزيع محتوى ليس لديك حق استخدامه. المطوّرون غير مسؤولين عن أي إساءة استخدام.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>ترخيص MIT · صُنع بعناية بواسطة <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
