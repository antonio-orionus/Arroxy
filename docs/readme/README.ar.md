<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="شعار Arroxy" width="180" />

# Arroxy — محمّل يوتيوب (+ 2000 موقع) مجاني ومفتوح المصدر مع متصفح مدمج لـ Windows وmacOS وLinux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**اقرأ بـ:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · **العربية** · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![الإصدار](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![البناء](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![الموقع الإلكتروني](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![الرخصة](https://img.shields.io/badge/license-GPLv3-blue) ![الأنظمة](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![اللغات](https://img.shields.io/badge/i18n-50_languages-blue)

نزِّل مقاطع الفيديو وShorts والقنوات والبودكاست والمقاطع الصوتية من **يوتيوب وأكثر من 2000 موقع مدعوم** — حتى 8K HDR بـ 60 إطاراً في الثانية، أو بصيغ MP3 / AAC / Opus، أو الجزء الذي تحتاجه فقط. **تصفّح YouTube أو أي موقع آخر داخل Arroxy** من تبويب Explore ونزّل الفيديو أو قائمة التشغيل أو القناة التي تشاهدها؛ وسجّل الدخول هناك لتنزيل الفيديوهات التي يستطيع حسابك مشاهدتها. يعمل محلياً على Windows وmacOS وLinux. **لا إعلانات، لا حشو، لا عروض ترويجية.**

[**↓ تنزيل أحدث إصدار**](#install) &nbsp;·&nbsp; [**الموقع الإلكتروني**](https://arroxy.com/) &nbsp;·&nbsp; [التشغيل الأول على Windows](#windows-first-launch) · [التشغيل الأول على macOS](#macos-first-launch) · [التشغيل الأول على Linux](#linux-first-launch)

[![انضم إلى مجتمع Discord](https://img.shields.io/badge/%D8%A7%D9%86%D8%B6%D9%85%20%D8%A5%D9%84%D9%89%20%D9%85%D8%AC%D8%AA%D9%85%D8%B9%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

إذا وفّر لك Arroxy الوقت، فإن ⭐ يساعد الآخرين على اكتشافه.

</div>

> **ما هو Arroxy؟** Arroxy واجهة رسومية مجانية ومفتوحة المصدر لسطح المكتب، تنزّل مقاطع الفيديو والصوت وقوائم التشغيل والترجمات من YouTube ومن أكثر من 2000 موقع آخر يدعمها [yt-dlp](https://github.com/yt-dlp/yt-dlp). يعمل على Windows 10/11 وmacOS 13+ (Intel + Apple Silicon) وLinux (AppImage وFlatpak وtar.gz). مرخّص بموجب GPLv3. بلا إعلانات ولا حدود للاستخدام. يُوزَّع عبر [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy) و[Scoop](https://github.com/antonio-orionus/scoop-bucket) و[Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy) وFlatpak وAppImage والتنزيل المباشر.
>
> **الفرق الجوهري: متصفح مدمج.** معظم برامج تنزيل YouTube المجانية أغلفة رقيقة حول yt-dlp: مربع لإدخال الرابط وقائمة صيغ، بلا متصفح خاص بها. أما Arroxy فلديه واحد، هو **تبويب Explore**. تتصفّح YouTube أو أي موقع آخر داخل التطبيق وتنزّل الفيديو أو قائمة التشغيل أو القناة التي أنت فيها، أو تنقر بزر الفأرة الأيمن على أي رابط. إذا سجّلت الدخول مرة واحدة في Explore، استخدمت التنزيلات التي تحتاج إلى حساب هذا التسجيل: فيديوهاتك الخاصة وقائمتَا «المشاهدة لاحقاً» و«الإعجابات» وغيرها من الفيديوهات التي يستطيع حسابك مشاهدتها، دون تصدير الكوكيز. سجّل الدخول إلى مواقع أخرى هناك أيضاً، وستستخدم تنزيلاتها تسجيل الدخول هذا عند الحاجة. التفاصيل: [لماذا Arroxy](#why-explore).
>
> _آخر تحديث: 2026-10-23._

---

## المحتويات

- [✨ الميزات](#features)
- [📥 التثبيت والتشغيل الأول](#install)
  - [التشغيل الأول على Windows](#windows-first-launch)
  - [التشغيل الأول على macOS](#macos-first-launch)
  - [لماذا قد تظهر لك تحذيرات](#why-warning)
  - [التشغيل الأول على Linux](#linux-first-launch)
  - [التحقق من تنزيلك (SHA256)](#verify)
- [⚖️ لماذا Arroxy](#why)
- [🔒 الخصوصية](#privacy)
- [❓ الأسئلة الشائعة](#faq)
- [🗺️ خارطة الطريق](#roadmap)
- [💖 ادعم Arroxy](#support)
- [🛠️ مبني باستخدام](#tech)
- [📜 شروط الاستخدام](#terms)

---

## <a id="features"></a>✨ الميزات

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ar/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>تصفّح YouTube أو أي موقع آخر داخل Arroxy ونزّل الصفحة التي أنت فيها بملف تعريفك النشط</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>الشاشة الأولى في Explore</b><br/>نظرة سريعة على Explore، ولماذا الحساب الثانوي أكثر أماناً لتسجيل الدخول</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>التنزيلات تخبرك بما يحتاج إليك</b><br/>تُجهَّز الروابط في الخلفية؛ والرابط الفاشل يقترح حله، وقائمة التشغيل الطويلة تنتظر اختيارك</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ar/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>نزّل جزءًا فقط من الفيديو</b><br/>حدّد البداية والنهاية أو فصلًا — وسيحفظ Arroxy هذا النطاق فقط</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ar/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR بمعدل 60 إطارًا في الثانية</b><br/>كل دقة وترميز وبث HDR يقدّمه الفيديو، جنبًا إلى جنب</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ar/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>محرّر الملفات الشخصية</b><br/>اضبط ملفًا شخصيًا: نوع الملف والدقة والترجمات والوجهة وقالب اسم الملف وغير ذلك</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ar/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>داكن أو فاتح، زجاجي أو صلب</b><br/>أربعة أشكال للاختيار: ألواح زجاجية فوق سماء متحركة أو أسطح صلبة هادئة، كلٌّ منها بالوضع الداكن والفاتح</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="اختصار التنزيل العام في Arroxy — Ctrl+Shift+D على Windows وLinux، وCmd+Shift+D على macOS، يرسل الرابط المنسوخ مباشرة إلى طابور التنزيل" width="760" /></picture><br/><sub><b>اختصار تنزيل عام</b><br/>انسخ رابطاً في أي مكان واضغط مرة واحدة — يدخل الطابور ويبدأ التنزيل</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ar/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>ملفات تعريف لكل عنصر في قائمة التشغيل</b><br/>امنح كل فيديو ملف تعريف خاصًا به — احفظ بعضها بدقة 4K وبقية الفيديوهات صوتًا فقط</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>صفحة التنزيل السريع</b><br/>الصق رابطًا ونزّله فورًا بملفك النشط</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>ملفات تنزيل قابلة لإعادة الاستخدام</b><br/>احفظ التنسيق والجودة والإخراج كإعدادات مسبقة — أعد استخدامها لكل تنزيل</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>مسارات صوت متعددة اللغات</b><br/>اختر لغة الصوت الدقيقة التي يوفرها الفيديو</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>صوت Surround / Dolby</b><br/>يتم اكتشاف مسارات 5.1 وDolby والحفاظ عليها</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>وضع الروابط المجمّعة</b><br/>الصق قائمة، وأزل التكرارات تلقائيًا، وضعها كلها في الطابور دفعة واحدة</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ar/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>قائمة تنزيل متوازية</b><br/>عدة تنزيلات في وقت واحد مع تقدم مباشر</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: تصفّح الويب داخل Arroxy</strong></summary>

- **تبويب Explore** — تصفّح YouTube أو أي موقع آخر داخل Arroxy ونزّل ما تجده دون نسخ الروابط. زر **تنزيل · *ملف تعريفك*** يضيف إلى قائمة الانتظار الفيديو أو قائمة التشغيل أو القناة التي تشاهدها؛ والسهم المجاور يبدّل ملفات التعريف، وعصا السحر تفتح التنزيل خطوة بخطوة لاختيار الصيغ والترجمات وغير ذلك
- **انقر بزر الفأرة الأيمن للتنزيل** — انقر بزر الفأرة الأيمن على أي رابط فيديو أو قائمة تشغيل أو قناة في Explore لتنزيله بملف تعريفك، أو اختر ملف تعريف آخر من **تنزيل باستخدام**، أو افتح التنزيل خطوة بخطوة، أو انسخ الرابط. لا حاجة لفتح كل فيديو أولًا
- **تخطيط مضغوط** — نقرة واحدة في شريط أدوات Explore تنقل تبويبات Arroxy إليه وتمنح الصفحة مساحة أكبر
- **شريط العناوين** — اكتب للبحث في YouTube، أو أدخل أي عنوان ويب لفتح ذلك الموقع
- **تنزيلات تحتاج إلى حساب** — سجّل الدخول مرة واحدة في Explore ويستطيع Arroxy تنزيل الفيديوهات التي يمكن لحسابك مشاهدتها: فيديوهاتك الخاصة، والفيديوهات المقيَّدة بالعمر إذا كان عمر الحساب موثَّقاً، وقائمتَي «المشاهدة لاحقاً» و«الإعجابات». سجّل الدخول إلى مواقع أخرى هناك أيضاً، وتستخدم تنزيلاتها ذلك التسجيل عند الحاجة. ما يزال Arroxy ينزّل أولاً دون تسجيل دخول ولا يستخدم تسجيل دخولك في Explore إلا عندما يفشل تنزيل لسبب يمكن لحساب إصلاحه
- **استخدم حساباً ثانوياً** — تشرح الشاشة الأولى في Explore السبب: التنزيل بحساب ينطوي على بعض مخاطر تقييد ذلك الحساب. سجّل الخروج من Explore من الإعدادات متى شئت لنسيان عمليات تسجيل الدخول
- **مانع الإعلانات** — متوقف افتراضياً. نقرة واحدة على الدرع في شريط أدوات Explore تحجب الإعلانات وأدوات التتبع في صفحاته، دون التأثير على التنزيلات. قد يقاوم YouTube مانعات الإعلانات للحسابات المسجَّل دخولها

</details>

<details>
<summary><strong>🎞️ الجودة والصيغ</strong></summary>

- حتى **8K (4320p)**، 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p
- **معدل إطارات عالٍ وHDR** محفوظان كما هما — 60 fps، HDR10
- **الصوت** — تصدير الصوت فقط بصيغ MP3 أو M4A/AAC أو Opus أو WAV. في التنزيلات التفاعلية، اختر مسارات surround/Dolby الأصلية للمصدر (AC-3، E-AC-3، 5.1، DRC) عند توفرها، أو اضبط إعدادًا افتراضيًا عامًا **تفضيل المحيطي / Dolby**
- **ملفات تعريف بهدف** — *أفضل صورة* (AV1 · VP9) أو *تلفاز ذكي* (MP4 · H.264)، وتُحفظ بصيغة تلقائي أو MP4 أو MKV أو WebM دون إعادة ترميز. وHDR هو *تلقائي* (فقط عندما تستطيع شاشتك عرضه) أو *SDR* أو *HDR*
- **كل ترميز بكل دقة** — يعرض التنزيل خطوة بخطوة AV1 وVP9 وH.264 جنبًا إلى جنب عند كل دقة، لتختار ما يشغّله تلفازك أو برنامج المونتاج لديك
- **اعرف حقيقة كل تدفق** — تُعلَّم الأحجام التي كبّرها YouTube بالذكاء الاصطناعي، ولغات الصوت المدبلجة بالذكاء الاصطناعي، والتدفقات ذات معدل البت المحسّن، وفيديوهات 360°، والنسخ التالفة أو ذات العلامة المائية. وتتخطى ملفات التعريف التدفقات المُكبَّرة بالذكاء الاصطناعي ما لم تسمح بها

</details>

<details>
<summary><strong>🛡️ الخصوصية والتحكم</strong></summary>

- معالجة محلية 100% — تذهب التنزيلات مباشرة من يوتيوب إلى قرصك
- لا تسجيل دخول، لا كوكيز، لا ربط بحساب Google
- الملفات تُحفظ مباشرة في المجلد الذي تختاره

</details>

<details>
<summary><strong>⚡ سير العمل</strong></summary>

- **اختصار تنزيل عام** — انسخ رابطاً في أي تطبيق واضغط `Ctrl+Shift+D` (`Cmd+Shift+D` على macOS)؛ يضيفه Arroxy إلى الطابور بملف التعريف النشط دون فتح النافذة، ويؤكد ذلك إشعار. مُفعَّل افتراضياً وقابل لإعادة التعيين
- **أوضاع بدء مرنة** — اختر تنزيلًا فرديًا موجّهًا، أو منتقي قائمة تشغيل/قناة، أو لصق روابط دفعة واحدة، أو Quick Download بالإعدادات الافتراضية المحفوظة، أو التصفّح والتنزيل من Explore
- **طابور تنزيل مركزي** — كل مهمة فردية أو قائمة تشغيل أو دفعة روابط أو تنزيل سريع تصل إلى مكان واحد لمتابعة التقدم والإيقاف المؤقت والاستئناف والإلغاء وإعادة المحاولة والتحكم في الأولوية
- **مراقبة الحافظة** — انسخ رابط فيديو فيملأ حقل URL عند عودتك إلى Arroxy، مع **تراجع** إن لم تقصد ذلك. وإذا كان Arroxy مشغولًا، ينتظر الرابط حتى تعود إلى تبويب «URL» (أوقفها من الإعدادات)
- **تنظيف الروابط تلقائياً** — يحذف معاملات التتبع (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) ويفك روابط `youtube.com/redirect`
- **وضع الشريط** — إغلاق النافذة يبقي التنزيلات تعمل في الخلفية
- **50 لغة** — يكتشف لغة النظام تلقائيًا ويمكن تبديلها في أي وقت
- **مزامنة قوائم التشغيل** — يعيد فحص قائمة التشغيل مقابل مجلد محلي لتخطي الفيديوهات التي نُزّلت من قبل؛ وينشئ ملف قائمة تشغيل `.m3u` يتم تحديثه مع تنزيل كل فيديو
- **تحكم في السرعة والإيقاع** — حدّد نطاق التنزيل، واضبط عدد أجزاء الفيديو التي تُنزَّل في وقت واحد، وأضف تأخيرات بين الطلبات باستخدام إعدادات جاهزة (*إيقاف · متوازن · حذر · مخصص*)
- **قوالب أسماء الملفات** — سمِّ تنزيلاتك كما تريد باستخدام `{title}` و`{uploader}` و`{id}` و`{date}` و`{year}` و`{resolution}` و`{site}` و`{categories}` و`{artist}` و`{album}` و`{track}` و`{playlist_index}`، بشكل عام أو لكل ملف تعريف تنزيل
- **التنزيلات في وقت واحد وإعادة المحاولة التلقائية** — اختر عدد التنزيلات التي تعمل في الوقت نفسه، ودع Arroxy يعيد محاولة تنزيل واجه عطلًا في الشبكة أو الخادم، مع انتظار أطول قبل كل محاولة
- **ملفات تعريف لكل عنصر في قائمة التشغيل** — عيّن لكل فيديو في قائمة التشغيل ملف تعريف تنزيل خاص به بدلاً من إعداد واحد للقائمة بأكملها، بحيث يمكن لعملية واحدة أرشفة بعضها بجودة كاملة وحفظ الباقي صوتاً فقط
- **يعمل Quick Download في الخلفية** — يظهر الرابط في التنزيلات فوراً ويُجهَّز هناك، وتؤكد ذلك ملاحظة فيها **عرض**، ويُفرَّغ حقل URL للرابط التالي. ابدأ ما تشاء بينما تُجهَّز الروابط السابقة
- **التنزيلات تخبرك بما يحتاج إليك** — إذا تعذّرت على Arroxy قراءة رابط، يوضح صفّه السبب ويقترح الحل: إعادة المحاولة، أو تفعيل الكوكيز، أو تسجيل الدخول في Explore. وعند إيقاف الكوكيز، يعيد **تسجيل الدخول عبر Explore** المحاولة عنك فور تسجيل دخولك. وتنتظر قائمة التشغيل الأطول من حدّ التحميل لديك في صفّها لتختار كلها أو الأولى فقط أو مراجعتها. ويعدّ تبويب التنزيلات الصفوف التي تنتظرك
- **تنزيل جزء من الفيديو فقط** — حدد بداية ونهاية، أو فصلاً، في شاشة الصيغة فيحفظ Arroxy هذا النطاق فقط، ويسمّي الملف بالنطاق بعد معرّف الفيديو. يقع القص عند أقرب إطار رئيسي (keyframe)؛ فعّل القص الدقيق لإعادة الترميز بدلاً من ذلك
- **إزالة التنزيلات المكتملة تلقائيًا** — اختياري: يغادر التنزيل المكتمل القائمة بعد 5 ثوانٍ. تبقى ملفاته على القرص، وتبقى التنزيلات الفاشلة في القائمة
- **الحجم والمفقود في التنزيلات** — يعرض عمود **الحجم** القابل للفرز المساحة التي يشغلها كل تنزيل، وتشير علامة **مفقود** إلى الملفات التي نُقلت أو حُذفت خارج Arroxy
- **Aurora أو بسيط، داكن أو فاتح** — ألواح زجاجية فوق سماء متحركة، أو أسطح صلبة هادئة؛ بدّل من التذييل. تحصل الحواسيب بلا تسريع للرسوميات على النمط البسيط تلقائيًا
- **شريط قوائم Mac** — على macOS، افتح الإعدادات (`Cmd+,`)، واضبط حد سرعة التنزيل، وبدّل النمط والمظهر، وافتح السجلات أو احفظ ملف التشخيص من شريط القوائم
- **غيّر ملف تعريف من أي تنزيل** — عدّل تنزيلًا، ثم حدّث ملف التعريف الذي بدأ منه (مع معاينة لما سيتغيّر) أو احفظ الإعدادات كملف تعريف جديد. وعند تبديل ملف التعريف يسألك Arroxy هل تُبقي تعديلاتك

</details>

<details>
<summary><strong>📝 الترجمات والمعالجة اللاحقة</strong></summary>

- **ترجمات** بصيغ SRT أو VTT أو ASS — يدوية أو مولَّدة تلقائياً، بأي لغة متاحة
- حفظها بجانب الفيديو، أو تضمينها في `.mkv`، أو تنظيمها في مجلد فرعي `Subtitles/`
- **دفعات الترجمات فقط** — الصق قائمة روابط أو افتح قائمة تشغيل، واختر الترجمات، واحصل على ملفات الترجمة فقط لكل فيديو
- **SponsorBlock** — تخطي الرعاة أو وضع علامة فصل عليهم، المقدمات والخواتم والترويج الذاتي
- **بيانات وصفية مضمّنة** — العنوان، تاريخ الرفع، القناة، الوصف، الصورة المصغرة، وعلامات الفصول تُكتب في الملف

</details>

<details>
<summary><strong>🌐 YouTube + 2000 موقع</strong></summary>

- **YouTube — بالكامل** — الفيديوهات وShorts والقنوات وقوائم التشغيل وYouTube Music والبودكاست تُعالَج كمصادر أولى
- **أكثر من 2000 موقع آخر** عبر yt-dlp — Twitch وTikTok وDailymotion وVK وSoundCloud وBandcamp وarchive.org وStreamable وغيرها الكثير
- **الصوت فقط والترجمات** تعملان على كل موقع مدعوم، ليس يوتيوب فحسب
- إذا تغيَّر موقع ما، يُصدر yt-dlp إصلاحات أسبوعياً ويحدِّث Arroxy الملف التنفيذي تلقائياً عند التشغيل

</details>

---

## <a id="install"></a>📥 التثبيت والتشغيل الأول

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
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --appimage
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

الإصدارات متاحة لمعمارية x86_64 فقط. لا يوجد `curl`؟ استبدل `curl -fsSL` بـ `wget -qO-`.

| النظام | الصيغة |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**احصل على أحدث إصدار →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 التشغيل الأول على Windows</strong></summary>

عند التشغيل الأول قد تظهر **"Windows protected your PC"** أو **"Unknown publisher."** ينطبق هذا على كلٍّ من `Arroxy-win-x64-Setup.exe` و`Arroxy-win-x64-Portable.exe`. Arroxy مجاني ومفتوح المصدر وإصدارات Windows غير موقَّعة بشهادة مدفوعة، لذا يُعلِّمها SmartScreen. هذا **لا** يعني تلقائياً أن Arroxy غير آمن. للمتابعة:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="نافذة SmartScreen "Windows protected your PC" مع إبراز رابط "More info"" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="نافذة SmartScreen بعد توسيع More info، تعرض زر "Run anyway"" />
</div>

1. انقر **More info**.
2. انقر **Run anyway**.

#### إذا علّم Windows Defender الملف أو أزاله

أحياناً تُعلِّم خوارزميات Defender التجريبية مثبّتات NSIS غير الموقَّعة وNSIS Electron المحمولة باعتبارها مشبوهة. إذا عزل Defender ملف `Arroxy-win-x64-Setup.exe` أو `Arroxy-win-x64-Portable.exe`، فاستعده من **Windows Security → Virus & threat protection → Protection history**، ثم أضف ملف Arroxy التنفيذي كعنصر مسموح به ضمن **Manage settings → Add or remove exclusions**. كما هو الحال مع SmartScreen، السبب هو غياب توقيع الناشر لا وجود برنامج خبيث.

> حمِّل Arroxy من صفحة GitHub Releases الرسمية فقط. إذا حصلت على الملف من موقع آخر أو أرسله إليك أحد، احذفه وحمِّل نسخة جديدة من المصدر الرسمي. الكود المصدري عام ويمكنك مراجعته أو بناء Arroxy بنفسك إن أردت.

تفضّل Scoop؟ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 التشغيل الأول على macOS</strong></summary>

Arroxy غير موقَّع رمزياً لـ macOS بعد، لذلك قد يعرض Gatekeeper الرسالة المخيفة *"Arroxy.app is damaged and can't be opened"* بعد تثبيته من DMG. تعني هذه الرسالة أن macOS وضع تطبيقاً غير موقَّع في quarantine؛ ولا تعني أن ملفات التطبيق تالفة فعلاً. على macOS الحالي، الإصلاح الموثوق هو Terminal:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. اسحب `Arroxy.app` من DMG المثبَّت إلى `/Applications`.
2. افتح Terminal وشغّل هذين الأمرين:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

الأمر الأول يزيل سمة quarantine من نسخة Arroxy المثبّتة لديك. الأمر الثاني يشغّل التطبيق. قد يطلب `sudo` كلمة مرور Mac؛ ولن يعرض Terminal أي أحرف أثناء كتابتها.

**Apple Silicon مقابل Intel:** على Mac من سلسلة M (M1 / M2 / M3 / M4)، نزِّل DMG الإصدار `arm64`. على أجهزة Intel، نزِّل DMG الإصدار `x64`. تشغيل الإصدار الخاطئ يعمل عبر Rosetta لكنه أبطأ بشكل ملحوظ.

> تُنتَج إصدارات macOS عبر CI على أجهزة Apple Silicon وIntel. إذا واجهت مشاكل، يرجى [فتح تقرير](../../../../issues) — تعليقات مستخدمي macOS تُشكِّل دورة الاختبار بفاعلية.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ لماذا قد تظهر لك تحذيرات</strong></summary>

Arroxy مفتوح المصدر ومرخَّص بـ GPLv3. إصدارات Windows وmacOS **غير موقَّعة رمزياً** — شهادات Apple Developer ID وWindows EV للتوقيع الرمزي تكلّف كل منها مئات الدولارات سنوياً، وهو ما يتحمّله المشروع المستقل من جيبه. وبدون تلك التوقيعات، سيحذّرك Windows SmartScreen وmacOS Gatekeeper عند الإطلاق الأول. تعني هذه التحذيرات *أن نظام تشغيلك لا يتعرّف على الناشر* — ولا تعني أن Arroxy برنامج خبيث.

ثلاث طرق للتحقق من Arroxy بنفسك، بترتيب متصاعد من الصرامة:

- **اقرأ الكود المصدري.** كل سطر موجود على [GitHub](https://github.com/antonio-orionus/Arroxy) ويمكنك [بناؤه من المصدر](#tech).
- **تحقق من SHA256.** طابق ملفك مع [`SHA256SUMS`](../../../../releases/latest) المنشور — راجع [التحقق من تنزيلك](#verify) أدناه.
- **أجرِ فحصاً بطرف ثالث.** ارفع الملف إلى [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 التشغيل الأول على Linux</strong></summary>

تعمل AppImages مباشرة — دون تثبيت. تحتاج فقط إلى تعيين الملف كقابل للتنفيذ.

**مدير الملفات:** انقر بزر الأيمن على `.AppImage` ← **خصائص** ← **أذونات** ← مكِّن **السماح بتنفيذ الملف كبرنامج**، ثم انقر نقراً مزدوجاً.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

إذا فشل التشغيل بعد ذلك، شغّله دون تركيب — لا حاجة إلى حزمة FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**تكامل سطح المكتب الاختياري:** ثبِّت [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) مرة واحدة، وأي AppImage تنقر عليه نقراً مزدوجاً سيُسجَّل تلقائياً في قائمة تطبيقاتك — دون الحاجة إلى إنشاء ملف `.desktop` يدوياً.

**أرشيف عادي (بدون FUSE، بدون تثبيت):**

إصدار `.tar.gz` هو التطبيق نفسه بدون غلاف AppImage — فك ضغطه في أي مكان وشغّله. بلا مثبِّت وبلا حزمة FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**تنزيلات لينكس في صفحة الإصدارات متاحة لمعمارية x86_64 فقط.** على أجهزة ARM64 (Raspberry Pi، Asahi Linux) يُثبَّت Flatpak لكنه يفشل عند التشغيل برسالة `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 التحقق من تنزيلك (SHA256)</strong></summary>

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
<summary><strong>📦 Windows: المثبِّت مقابل المحمول</strong></summary>

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

## <a id="why"></a>⚖️ لماذا Arroxy

مقارنة جنباً إلى جنب مع أكثر البدائل شيوعاً:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| متصفح مدمج (تصفّح، سجّل الدخول، نزّل) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| فيديوهات يستطيع حسابك مشاهدتها، دون تصدير الكوكيز |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| مجاني، بدون مستوى مميز |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| مفتوح المصدر |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| معالجة محلية فقط |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| لا حدود للاستخدام |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| تطبيق سطح مكتب متعدد الأنظمة |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| ترجمات + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = جزئياً، أو في خطة مدفوعة فقط. تسجيل الدخول داخل التطبيق لتنزيل الفيديوهات الخاصة في 4K Video Downloader ميزة مدفوعة؛ ومعظم واجهات yt-dlp الرسومية المجانية لا تقبل إلا ملف كوكيز أو تقرأ كوكيز متصفح الويب لديك.

Arroxy مبني لغرض واحد: ملف محلي نظيف، سواء ألصقت رابطاً أو وجدت الفيديو في Explore. لا عروض ترويجية، لا جمع بيانات.

### <a id="why-explore"></a>🧭 ما لا تستطيعه واجهة yt-dlp البسيطة: تبويب Explore

معظم برامج تنزيل YouTube المجانية مجرد خانة للرابط فوق yt-dlp. يستخدم Arroxy أيضاً yt-dlp، لكنه يضم كذلك **Explore**، متصفح مدمج في التطبيق يفتح YouTube أو أي موقع آخر. يضيف Explore ما لا تستطيعه خانة الرابط:

- **فيديوهات يستطيع حسابك مشاهدتها، دون تصدير الكوكيز** — فيديوهاتك الخاصة وقائمتَا «المشاهدة لاحقاً» و«الإعجابات» والفيديوهات المقيَّدة بالعمر على حساب موثَّق العمر، وصفحات على مواقع أخرى تتطلب تسجيل دخولك. تحتاج الواجهة البسيطة إلى تصدير ملف cookies.txt أو إلى قراءة كوكيز متصفح الويب لديك. أما في Arroxy فتسجّل الدخول مرة واحدة في Explore ويتولّى هو الباقي
- **بلا نسخ روابط** — اعثر على فيديو أو قائمة تشغيل أو قناة في Explore ونزّلها بنقرة واحدة، أو انقر بزر الفأرة الأيمن على أي رابط في الصفحة
- **مانع الإعلانات عند الطلب** — نقرة واحدة على الدرع تحجب الإعلانات وأدوات التتبع في صفحات Explore

---

## <a id="privacy"></a>🔒 الخصوصية

تُجلب التنزيلات مباشرة عبر [yt-dlp](https://github.com/yt-dlp/yt-dlp) من يوتيوب إلى المجلد الذي تختاره — لا شيء يمر عبر خادم طرف ثالث. سجل المشاهدة والتنزيل والروابط ومحتوى الملفات تبقى على جهازك.

**No tracking.** Arroxy sends only anonymous reports that help us count users and fix problems — never your links, videos, files or accounts. You control them in Settings.

Explore keeps its own sign-ins, separate from your browser, and you always sign in on the site's own page. A download uses a sign-in only for that site, reads it fresh and deletes its copy afterwards. Signing out of Explore in Settings forgets them.

---

## <a id="faq"></a>❓ الأسئلة الشائعة

<details>
<summary><strong>هل هو مجاني حقاً؟</strong></summary>

نعم — مرخَّص بـ GPLv3، بدون مستوى مميز، بدون قيود على الميزات.

</details>

<details>
<summary><strong>بماذا يختلف Arroxy عن واجهات yt-dlp الرسومية الأخرى؟</strong></summary>

معظم واجهات yt-dlp الرسومية المجانية مجرد أغلفة لا تقبل إلا رابطاً. يضيف Arroxy **Explore**، متصفح مدمج في التطبيق يفتح YouTube أو أي موقع آخر: تتصفّح وتنزّل دون نسخ الروابط، وتسجّل الدخول فيه مرة واحدة لتنزيل الفيديوهات التي يستطيع حسابك مشاهدتها، مثل فيديوهاتك الخاصة وقائمتَي «المشاهدة لاحقاً» و«الإعجابات»، دون تصدير الكوكيز. راجع [لماذا Arroxy](#why).

</details>

<details>
<summary><strong>ما جودات الفيديو التي يمكنني تنزيلها؟</strong></summary>

كل ما يوفره يوتيوب: 8K (4320p)، 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، بالإضافة إلى الصوت فقط. تدفقات 60 fps وHDR محفوظة كما هي، ويتيح لك التنزيل خطوة بخطوة اختيار AV1 أو VP9 أو H.264 عند كل دقة.

</details>

<details>
<summary><strong>هل يمكنني استخراج الصوت فقط بصيغة MP3؟</strong></summary>

نعم. اختر *صوت فقط* من قائمة الصيغ ثم اختر MP3 أو M4A/AAC أو Opus أو WAV.

</details>

<details>
<summary><strong>كيف أنزّل الفيديوهات التي تحتاج إلى حساب YouTube؟</strong></summary>

سجّل الدخول مرة واحدة في تبويب Explore. عندها يستطيع Arroxy تنزيل الفيديوهات التي يمكن لحسابك مشاهدتها: فيديوهاتك الخاصة، والفيديوهات المقيَّدة بالعمر إذا كان عمر الحساب موثَّقاً، وقائمتَي «المشاهدة لاحقاً» و«الإعجابات». ولا يستخدم هذا الدخول إلا عندما يفشل تنزيل لسبب يمكن لحساب إصلاحه؛ أما كل ما عدا ذلك فيُنزَّل كما كان. هذا هو خيار **تسجيل الدخول عبر Explore**، المدرج أولاً والموسوم بـ«موصى به» في إعدادات الكوكيز، ويختاره Arroxy لك أول مرة تفتح فيها Explore. يشير ويكي yt-dlp إلى أن [الأتمتة بحساب مسجَّل الدخول قد تُعلِّم حساب Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)، لذا فالحساب الثانوي هو الخيار الأكثر أماناً.

</details>

<details>
<summary><strong>هل سيستمر في العمل عند تغيير يوتيوب لشيء ما؟</strong></summary>

يُحدَّث yt-dlp تلقائياً عند الإطلاق، ويُصدر Arroxy إصلاحات بسرعة عندما يُغيِّر YouTube شيئاً ما. وعندما يحتاج تنزيل إلى تسجيل دخول، يستخدم Arroxy تسجيل دخولك في Explore إن كنت قد سجّلت الدخول فيه، كما تتوفر كوكيز من ملف أو من متصفحك في إعدادات الكوكيز.

</details>

<details>
<summary><strong>ما اللغات المتاحة في Arroxy؟</strong></summary>

50 لغة جاهزة مباشرة: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. يكتشف Arroxy لغة نظام التشغيل عند التشغيل الأول، ويمكنك التبديل في أي وقت من منتقي اللغة في شريط الأدوات. توجد ملفات Runtime locale JSON في src/shared/i18n/locales/، وتوجد كتالوجات PO الخاصة بالمترجمين في i18n/locales/ — افتح PR على GitHub للمساهمة.

</details>

<details>
<summary><strong>هل أحتاج إلى تثبيت شيء آخر؟</strong></summary>

لا. يُحمَّل yt-dlp وffmpeg وffprobe تلقائياً عند الإطلاق الأول ويُخزَّنان على جهازك. بعد ذلك، لا تحتاج أي إعداد إضافي.

</details>

<details>
<summary><strong>هل يمكنني تنزيل قوائم التشغيل أو القنوات بالكامل؟</strong></summary>

نعم — كلاهما. الصق رابط قائمة تشغيل أو قناة (مثل `youtube.com/@handle` أو `/channel/UC…` أو `/c/Name` أو `/user/Old`)؛ اختر عدد العناصر التي تريد فحصها، ثم أضف القائمة كلها إلى الطابور أو اختر فيديوهات محددة. ستأتي فلاتر نطاق التاريخ قريبًا.

</details>

<details>
<summary><strong>يقول macOS إن "التطبيق تالف" — ماذا أفعل؟</strong></summary>

هذا Gatekeeper في macOS يحظر تطبيقاً غير موقَّع، وليس تلفاً فعلياً. راجع [macOS first launch](#macos-first-launch) لأوامر Terminal التي تزيل quarantine وتشغّل Arroxy.

</details>

<details>
<summary><strong>هل تنزيل فيديوهات يوتيوب قانوني؟</strong></summary>

يعتمد ذلك على بلدك وعلى ما تنزّله. نزّل فقط المحتوى الذي تملكه، أو المرخَّص للتنزيل، أو الذي يسمح لك قانون بلدك بنسخه. أنت مسؤول عن الامتثال لـ [شروط خدمة](https://www.youtube.com/t/terms) يوتيوب وقوانين حقوق النشر في بلدك. راجع [شروط الاستخدام](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ خارطة الطريق

ما زال مخططًا — تقريبًا بترتيب الأولوية:

| الميزة    | الوصف    |
| ---------------- | ---------------- |
| **فلاتر قوائم التشغيل والقنوات** | فلاتر نطاق التاريخ عند تعداد قائمة تشغيل أو قناة |
| **تفضيلات مسارات الصوت في YouTube** | تعيين تفضيل مسار لغة الكلام على مستوى التطبيق، مع تجاوزات لكل profile عندما يوفر YouTube عدة مسارات صوتية |
| **استرداد أقوى بإعادة المحاولة** | مسار إعادة محاولة جديد للتنزيلات التي تقطعها اتصالات إنترنت غير موثوقة أو إشكالية |
| **درج مدير تنزيلات كامل** | تحويل درج قائمة الانتظار إلى مدير أوسع، بما في ذلك تغيير مجلدات الوجهة للعناصر المصطفة |
| **التنزيلات المجدولة** | بدء قائمة في وقت محدد (تشغيل ليلي) |
| **حزمة AUR** | التثبيت على Arch Linux وOmarchy باستخدام `yay -S arroxy-bin` |

هل لديك ميزة في ذهنك؟ [افتح طلباً](../../../../issues) — مدخلات المجتمع تُشكِّل الأولويات.

---

## <a id="support"></a>💖 ادعم Arroxy

Arroxy مجاني ومرخّص بموجب GPLv3 — بلا إعلانات، بلا تتبّع، وبلا نسخة مدفوعة. إذا كان يوفّر وقتك، يمكنك دعم تطويره عبر Bitcoin أو Tron أو Ethereum: العناوين موجودة في [DONATE.md](../../DONATE.md)، وهو المصدر الرسمي الوحيد لها. لن يرسل إليك Arroxy عنواناً عبر البريد الإلكتروني أو الرسائل المباشرة أبداً. منح المستودع نجمة والإبلاغ عن الأخطاء وتحسين الترجمات تساعد بالقدر نفسه.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ مبني باستخدام

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — بيئة سطح المكتب متعددة الأنظمة
- **React 19** + **TypeScript** — واجهة المستخدم
- **Tailwind CSS v4** — التنسيق
- **Zustand** — إدارة الحالة
- **yt-dlp** + **ffmpeg** — محرك التنزيل والدمج (يُجلب كلاهما وقت التشغيل: يُحدَّث yt-dlp باستمرار، ويُثبَّت ffmpeg/ffprobe مرة واحدة ويبقيان عبر التحديثات)
- **Vite** + **electron-vite** — أدوات البناء
- **Vitest** + **Playwright** — اختبارات الوحدة والشامل

</details>

<details>
<summary><strong>البناء من المصدر</strong></summary>

### المتطلبات الأساسية — جميع الأنظمة

| الأداة  | الإصدار | التثبيت |
| ------- | ------- | ------- |
| Git     | أي إصدار | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` أو `.node-version` |
| Bun     | 1.4.2  | `mise install` أو `package.json` `packageManager` |

الموصى به: ثبّت `mise` ثم شغّل `mise install` داخل checkout. من دون mise، فعّل Node.js من `.node-version` وBun من `package.json` يدوياً قبل `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

قد تحتاج إلى Visual Studio Build Tools وPython لإعادة البناء الأصلية.

### macOS

```bash
brew install mise
xcode-select --install
```

بعد الاستنساخ، شغّل `mise trust && mise install` من داخل checkout. إذا كان shell لديك يستخدم بالفعل `fnm` أو `nvm` أو Bun عبر Homebrew، ففعّل mise في `~/.zshrc` لكي يستخدم Arroxy ‏Node.js 24.21.0 و Bun 1.4.2:

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

# اعتماديات البناء وتشغيل Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# اختبارات E2E فقط (يحتاج Electron إلى شاشة)
sudo apt install -y xvfb
```

### الاستنساخ والتشغيل

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # موصى به؛ تخطّه إذا فعّلت الأدوات المثبتة يدوياً
bun run bootstrap
bun run doctor
bun run dev            # تطبيق Electron مع عارض Vite
```

### بناء حزمة قابلة للتوزيع

```bash
bun run build        # فحص الأنواع + التجميع
bun run dist         # حزمة للنظام الحالي
bun run dist:win     # حزم أهداف Windows على مضيف مدعوم
```

> يثبّت `bun run bootstrap` الاعتماديات، ويعيد بناء اعتماديات تطبيق Electron، ويتحقق من Electron، ويجهز ffmpeg/ffprobe المضمنين للتطوير، ويثبّت Playwright Chromium. تُدير النسخ الرسمية yt-dlp وffmpeg وffprobe وقت التشغيل داخل مجلد بيانات التطبيق؛ ولا يأتي أي منها داخل المثبّت.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/arroxy/main.log` |
| Linux    | `~/.config/arroxy/logs/main.log` |

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
| Windows  | `%APPDATA%\arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/arroxy/argv.json` |
| Linux    | `~/.config/arroxy/argv.json`                     |

On Flatpak, both `main.log` and `argv.json` live under
`~/.var/app/io.github.antonio_orionus.Arroxy/config/arroxy/`
(for example `logs/main.log`).

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

## <a id="terms"></a>📜 شروط الاستخدام

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
  <sub>ترخيص GPLv3 · صُنع بعناية بواسطة <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
