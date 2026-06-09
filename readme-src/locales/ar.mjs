const TECH_CONTENT = `<details>
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

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

لا حاجة لأدوات بناء أصلية — المشروع لا يحتوي على إضافات Node أصلية.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# اعتماديات Electron
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# اختبارات E2E فقط (يحتاج Electron إلى شاشة)
sudo apt install -y xvfb
\`\`\`

### الاستنساخ والتشغيل

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # بناء تطويري مع إعادة التحميل الفوري
\`\`\`

### بناء حزمة قابلة للتوزيع

\`\`\`bash
bun run build        # فحص الأنواع + التجميع
bun run dist         # حزمة للنظام الحالي
bun run dist:win     # تجميع متقاطع لـ Windows Portable exe
\`\`\`

> يُجلب yt-dlp من GitHub عند أول تشغيل ويُخزَّن في مجلد بيانات التطبيق. يأتي ffmpeg وffprobe مضمنين مع كل إصدار من Arroxy.

</details>`;

export const ar = {
  icon_alt: "شعار Arroxy",
  title: "Arroxy — محمّل يوتيوب (+ 2000 موقع) مجاني ومفتوح المصدر لـ Windows وmacOS وLinux",
  read_in_label: "اقرأ بـ:",
  badge_release_alt: "الإصدار",
  badge_build_alt: "البناء",
  badge_license_alt: "الرخصة",
  badge_platforms_alt: "الأنظمة",
  badge_i18n_alt: "اللغات",
  badge_website_alt: "الموقع الإلكتروني",
  hero_desc:
    "نزِّل مقاطع الفيديو وShorts والموسيقى والقنوات والبودكاست والمقاطع الصوتية من **يوتيوب وأكثر من 2000 موقع مدعوم** — حتى 4K HDR بـ 60 إطاراً في الثانية، أو بصيغ MP3 / AAC / Opus. يعمل محلياً على Windows وmacOS وLinux. **لا إعلانات، لا حشو، لا عروض ترويجية.**",
  cta_latest: "↓ تنزيل أحدث إصدار",
  cta_website: "الموقع الإلكتروني",
  demo_alt: "عرض توضيحي لـ Arroxy",
  star_cta: "إذا وفّر لك Arroxy الوقت، فإن ⭐ يساعد الآخرين على اكتشافه.",
  ai_notice: "",
  toc_heading: "المحتويات",
  why_h2: "لماذا Arroxy",
  features_h2: "الميزات",
  dl_h2: "التنزيل",
  privacy_h2: "الخصوصية",
  faq_h2: "الأسئلة الشائعة",
  roadmap_h2: "خارطة الطريق",
  tech_h2: "مبني باستخدام",
  why_intro: "مقارنة جنباً إلى جنب مع أكثر البدائل شيوعاً:",
  why_r1: "مجاني، بدون مستوى مميز",
  why_r2: "مفتوح المصدر",
  why_r3: "معالجة محلية فقط",
  why_r4: "لا تسجيل دخول ولا تصدير كوكيز",
  why_r5: "لا حدود للاستخدام",
  why_r6: "تطبيق سطح مكتب متعدد الأنظمة",
  why_r7: "ترجمات + SponsorBlock",
  why_summary:
    "Arroxy مبني لغرض واحد: الصق رابطاً، احصل على ملف محلي نظيف. لا حسابات، لا عروض ترويجية، لا جمع بيانات.",
  feat_quality_h3: "الجودة والصيغ",
  feat_quality_1: "حتى **4K UHD (2160p)**، 1440p، 1080p، 720p، 480p، 360p",
  feat_quality_2: "**معدل إطارات عالٍ** محفوظ كما هو — 60 fps، 120 fps، HDR",
  feat_quality_3: "**صوت فقط** إلى MP3 أو M4A/AAC أو Opus أو WAV",
  feat_quality_4: "إعدادات سريعة: *أفضل جودة* · *متوازن* · *ملف صغير*",
  feat_privacy_h3: "الخصوصية والتحكم",
  feat_privacy_1:
    "معالجة محلية 100% — تذهب التنزيلات مباشرة من يوتيوب إلى قرصك",
  feat_privacy_2: "لا تسجيل دخول، لا كوكيز، لا ربط بحساب Google",
  feat_privacy_3: "الملفات تُحفظ مباشرة في المجلد الذي تختاره",
  feat_workflow_h3: "سير العمل",
  feat_workflow_1:
    "**أوضاع بدء مرنة** — اختر تنزيلًا فرديًا موجّهًا، أو منتقي قائمة تشغيل/قناة، أو لصق روابط دفعة واحدة، أو Quick Download بالإعدادات الافتراضية المحفوظة",
  feat_workflow_2:
    "**طابور تنزيل مركزي** — كل مهمة فردية أو قائمة تشغيل أو دفعة روابط أو تنزيل سريع تصل إلى مكان واحد لمتابعة التقدم والإيقاف المؤقت والاستئناف والإلغاء وإعادة المحاولة والتحكم في الأولوية",
  feat_workflow_3:
    "**مراقبة الحافظة** — انسخ رابط يوتيوب ويملأ Arroxy الحقل تلقائياً عند العودة للتطبيق (قابل للتفعيل في الإعدادات المتقدمة)",
  feat_workflow_4:
    "**تنظيف الروابط تلقائياً** — يحذف معاملات التتبع (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) ويفك روابط `youtube.com/redirect`",
  feat_workflow_5:
    "**وضع الشريط** — إغلاق النافذة يبقي التنزيلات تعمل في الخلفية",
  feat_workflow_6:
    "**21 لغة** — يكتشف لغة النظام تلقائياً، قابل للتغيير في أي وقت",
  feat_workflow_7:
    "**مزامنة قوائم التشغيل** — يعيد فحص قائمة التشغيل مقابل مجلد محلي لتخطي الفيديوهات التي نُزّلت من قبل؛ وينشئ ملف قائمة تشغيل `.m3u` يتم تحديثه مع تنزيل كل فيديو",
  feat_workflow_8:
    "**تحكم في السرعة والإيقاع** — حدّد نطاق التنزيل، وأضف تأخيرات بين الطلبات، واضبط خيوط الأجزاء باستخدام إعدادات مسبقة (*إيقاف · متوازن · حذر · مخصص*)",
  feat_post_h3: "الترجمات والمعالجة اللاحقة",
  feat_post_1:
    "**ترجمات** بصيغ SRT أو VTT أو ASS — يدوية أو مولَّدة تلقائياً، بأي لغة متاحة",
  feat_post_2:
    "حفظها بجانب الفيديو، أو تضمينها في `.mkv`، أو تنظيمها في مجلد فرعي `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — تخطي الرعاة أو وضع علامة فصل عليهم، المقدمات والخواتم والترويج الذاتي",
  feat_post_4:
    "**بيانات وصفية مضمّنة** — العنوان، تاريخ الرفع، القناة، الوصف، الصورة المصغرة، وعلامات الفصول تُكتب في الملف",
  feat_sites_h3: "YouTube + 2000 موقع",
  feat_sites_1:
    "**YouTube — بالكامل** — الفيديوهات وShorts والقنوات وقوائم التشغيل وYouTube Music والبودكاست تُعالَج كمصادر أولى",
  feat_sites_2:
    "**أكثر من 2000 موقع آخر** عبر yt-dlp — Vimeo وTwitch وTwitter/X وTikTok وSoundCloud وBandcamp وBilibili وBBC iPlayer وarchive.org وغيرها الكثير",
  feat_sites_3:
    "**الصوت فقط والترجمات** تعملان على كل موقع مدعوم، ليس يوتيوب فحسب",
  feat_sites_4:
    "إذا تغيَّر موقع ما، يُصدر yt-dlp إصلاحات أسبوعياً ويحدِّث Arroxy الملف التنفيذي تلقائياً عند التشغيل",
  shot1_alt: "الصق رابطاً",
  shot2_alt: "اختر الجودة",
  shot3_alt: "اختر مكان الحفظ",
  shot4_alt: "قائمة التنزيل في العمل",
  shot5_alt: "منتقي لغة وصيغة الترجمة",
  dl_platform_col: "النظام",
  dl_format_col: "الصيغة",
  dl_win_format: "المثبِّت (NSIS) أو محمول `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` أو `.flatpak` (معزول)",
  dl_grab: "احصل على أحدث إصدار →",
  dl_pkg_h3: "التثبيت عبر مدير الحزم",
  dl_channel_col: "القناة",
  dl_command_col: "الأمر",
  dl_win_h3: "Windows: المثبِّت مقابل المحمول",
  dl_win_col_installer: "NSIS Installer",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "يتطلب التثبيت",
  dl_win_r1_installer: "نعم",
  dl_win_r1_portable: "لا — يعمل من أي مكان",
  dl_win_r2: "التحديث التلقائي",
  dl_win_r2_installer: "✅ داخل التطبيق",
  dl_win_r2_portable: "❌ تنزيل يدوي",
  dl_win_r3: "سرعة التشغيل",
  dl_win_r3_installer: "✅ أسرع",
  dl_win_r3_portable: "⚠️ بداية باردة أبطأ",
  dl_win_r4: "يُضاف إلى قائمة ابدأ",
  dl_win_r5: "سهولة إلغاء التثبيت",
  dl_win_r5_portable: "❌ احذف الملف",
  dl_win_rec:
    "**التوصية:** استخدم مثبِّت NSIS للتحديثات التلقائية والتشغيل الأسرع. استخدم `.exe` المحمول لخيار بدون تثبيت وبدون سجل.",
  dl_win_smartscreen_h4: "تحذير Windows SmartScreen",
  dl_win_smartscreen_intro:
    "عند التشغيل الأول قد تظهر **\"Windows protected your PC\"** أو **\"Unknown publisher.\"** ينطبق هذا على كلٍّ من `Arroxy-win-x64-Setup.exe` و`Arroxy-win-x64-Portable.exe`. Arroxy مجاني ومفتوح المصدر وإصدارات Windows غير موقَّعة بشهادة مدفوعة، لذا يُعلِّمها SmartScreen. هذا **لا** يعني تلقائياً أن Arroxy غير آمن. للمتابعة:",
  dl_win_smartscreen_step1: "انقر **More info**.",
  dl_win_smartscreen_step2: "انقر **Run anyway**.",
  dl_win_smartscreen_official:
    "حمِّل Arroxy من صفحة GitHub Releases الرسمية فقط. إذا حصلت على الملف من موقع آخر أو أرسله إليك أحد، احذفه وحمِّل نسخة جديدة من المصدر الرسمي. الكود المصدري عام ويمكنك مراجعته أو بناء Arroxy بنفسك إن أردت.",
  dl_macos_h3: "التشغيل لأول مرة على macOS",
  dl_macos_warning:
    "Arroxy غير موقَّع رمزياً بعد، لذا سيحذّرك Gatekeeper في macOS عند التشغيل الأول. هذا متوقع — وليس دليلاً على تلف.",
  dl_macos_m1_h4: "طريقة إعدادات النظام (مُوصى بها):",
  dl_macos_step1: "انقر بزر الماوس الأيمن على أيقونة تطبيق Arroxy واختر **فتح**.",
  dl_macos_step2:
    "تظهر نافذة التحذير — انقر **إلغاء** (لا تنقر *نقل إلى سلة المهملات*).",
  dl_macos_step3: "افتح **إعدادات النظام ← الخصوصية والأمان**.",
  dl_macos_step4:
    "مرِّر إلى قسم **الأمان**. ستجد *\"تم حظر Arroxy لأنه ليس من مطوّر معروف.\"*",
  dl_macos_step5:
    "انقر **فتح على أي حال** وأكِّد بكلمة المرور أو Touch ID.",
  dl_macos_after:
    "بعد الخطوة 5، يفتح Arroxy بشكل طبيعي ولن يظهر التحذير مجدداً.",
  dl_macos_m2_h4: "طريقة Terminal (متقدم):",
  dl_macos_note:
    "تُنتَج إصدارات macOS عبر CI على أجهزة Apple Silicon وIntel. إذا واجهت مشاكل، يرجى [فتح تقرير](../../issues) — تعليقات مستخدمي macOS تُشكِّل دورة الاختبار بفاعلية.",
  dl_linux_h3: "التشغيل لأول مرة على Linux",
  dl_linux_intro:
    "تعمل AppImages مباشرة — دون تثبيت. تحتاج فقط إلى تعيين الملف كقابل للتنفيذ.",
  dl_linux_m1_text:
    "**مدير الملفات:** انقر بزر الأيمن على `.AppImage` ← **خصائص** ← **أذونات** ← مكِّن **السماح بتنفيذ الملف كبرنامج**، ثم انقر نقراً مزدوجاً.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "إذا فشل التشغيل بعد ذلك، قد يكون FUSE مفقوداً:",
  dl_linux_flatpak_intro:
    "**Flatpak (بديل معزول):** نزِّل `Arroxy-*.flatpak` من صفحة الإصدار نفسها.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "لماذا قد تظهر لك تحذيرات",
  dl_warning_p1:
    "Arroxy مفتوح المصدر ومرخَّص بـ MIT. إصدارات Windows وmacOS **غير موقَّعة رمزياً** — شهادات Apple Developer ID وWindows EV للتوقيع الرمزي تكلّف كل منها مئات الدولارات سنوياً، وهو ما يتحمّله المشروع المستقل من جيبه. وبدون تلك التوقيعات، سيحذّرك Windows SmartScreen وmacOS Gatekeeper عند الإطلاق الأول. تعني هذه التحذيرات *أن نظام تشغيلك لا يتعرّف على الناشر* — ولا تعني أن Arroxy برنامج خبيث.",
  dl_warning_p2:
    "ثلاث طرق للتحقق من Arroxy بنفسك، بترتيب متصاعد من الصرامة:\n\n- **اقرأ الكود المصدري.** كل سطر موجود على [GitHub](https://github.com/antonio-orionus/Arroxy) ويمكنك [بناؤه من المصدر](#tech).\n- **تحقق من SHA256.** طابق ملفك مع [`SHA256SUMS`](../../releases/latest) المنشور — راجع [التحقق من تنزيلك](#verify) أدناه.\n- **أجرِ فحصاً بطرف ثالث.** ارفع الملف إلى [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "التشغيل الأول على Windows",
  shot_smartscreen_more_alt:
    'نافذة SmartScreen "Windows protected your PC" مع إبراز رابط "More info"',
  shot_smartscreen_run_alt:
    'نافذة SmartScreen بعد توسيع More info، تعرض زر "Run anyway"',
  dl_win_defender_h4: "إذا علّم Windows Defender الملف أو أزاله",
  dl_win_defender_p:
    "أحياناً تُعلِّم خوارزميات Defender التجريبية مثبّتات NSIS غير الموقَّعة وNSIS Electron المحمولة باعتبارها مشبوهة. إذا عزل Defender ملف `Arroxy-win-x64-Setup.exe` أو `Arroxy-win-x64-Portable.exe`، فاستعده من **Windows Security → Virus & threat protection → Protection history**، ثم أضف ملف Arroxy التنفيذي كعنصر مسموح به ضمن **Manage settings → Add or remove exclusions**. كما هو الحال مع SmartScreen، السبب هو غياب توقيع الناشر لا وجود برنامج خبيث.",

  dl_macos_first_h3: "التشغيل الأول على macOS",
  dl_macos_intro:
    "Arroxy غير موقَّع رمزياً لـ macOS بعد، لذا سيحظر Gatekeeper الإطلاق الأول. يعتمد المسار الدقيق للسماح به على إصدار macOS الخاص بك — Sequoia 15 شدّد طريقة التجاوز القديمة عبر النقر الأيمن → Open.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 والأحدث (الحالي)",
  dl_macos_sequoia_intro:
    "على Sequoia 15 والأحدث، النقر الأيمن → Open لم يعد يتجاوز Gatekeeper للكثير من التطبيقات المحجوزة. استخدم لوحة System Settings بدلاً من ذلك:",
  dl_macos_sequoia_step1:
    "اسحب `Arroxy.app` من DMG المثبَّت إلى `/Applications`.",
  dl_macos_sequoia_step2:
    "انقر مزدوجاً على Arroxy. تظهر نافذة الحظر — انقر **Done** (لا تنقر *Move to Trash*).",
  dl_macos_sequoia_step3:
    'افتح **System Settings → Privacy & Security** ومرِّر إلى قسم **Security**. ستجد *"Arroxy was blocked to protect your Mac"* (أو رسالة مشابهة).',
  dl_macos_sequoia_step4:
    "انقر **Open Anyway**، أكِّد بكلمة المرور أو Touch ID، ثم أعِد تشغيل Arroxy من `/Applications`.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 وما قبله",
  dl_macos_sonoma_step1:
    "اسحب `Arroxy.app` من DMG المثبَّت إلى `/Applications`.",
  dl_macos_sonoma_step2:
    "انقر بزر الأيمن (أو Control-click) على `Arroxy.app` في `/Applications` واختر **Open**.",
  dl_macos_sonoma_step3:
    "نافذة التحذير تحتوي الآن على زر **Open** — انقره وأكِّد. يفتح Arroxy بشكل طبيعي ولن يظهر التحذير مجدداً.",
  dl_macos_damaged_h4:
    '"App is damaged" أو حظر Gatekeeper المستمر — إصلاح عبر Terminal',
  dl_macos_damaged_p:
    'إذا قال macOS *"Arroxy is damaged and can\'t be opened"*، أو لم تُزِل أيٌّ من الخطوات أعلاه الحظر، فسمة الحجر على DMG هي السبب (بعض المتصفحات وسلوك macOS الخاص بالنقل يُعيِّنانها). احذفها من التطبيق المثبَّت:',
  dl_macos_arch_note:
    "**Apple Silicon مقابل Intel:** على Mac من سلسلة M (M1 / M2 / M3 / M4)، نزِّل DMG الإصدار `arm64`. على أجهزة Intel، نزِّل DMG الإصدار `x64`. تشغيل الإصدار الخاطئ يعمل عبر Rosetta لكنه أبطأ بشكل ملحوظ.",

  dl_linux_first_h3: "التشغيل الأول على Linux",
  dl_linux_appimagelauncher:
    "**تكامل سطح المكتب الاختياري:** ثبِّت [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) مرة واحدة، وأي AppImage تنقر عليه نقراً مزدوجاً سيُسجَّل تلقائياً في قائمة تطبيقاتك — دون الحاجة إلى إنشاء ملف `.desktop` يدوياً.",

  dl_verify_h3: "التحقق من تنزيلك (SHA256)",
  dl_verify_intro:
    "يُنشر مع كل إصدار ملف `SHA256SUMS` إلى جانب الملفات الثنائية. للتحقق من عدم تلف تنزيلك أو العبث به أثناء النقل، احسب هاش ملفك محلياً وطابقه مع السطر المقابل في `SHA256SUMS`. افتح صفحة الإصدار الأخير → **Assets** → نزِّل `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell أو Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "تريد فحصاً لبرامج الخبيثة من طرف ثالث؟ ارفع الملف على [VirusTotal](https://www.virustotal.com). بضع إشارات هيوريستية عامة من محركات صغيرة أمر طبيعي لتطبيقات Electron غير الموقَّعة؛ أما الكشف الواسع من محركات رئيسية فيكون مدعاة قلق حقيقية.",

  dl_pm_intro:
    "تستخدم مدير حزم بالفعل؟ يمكنك تجاوز مسار التنزيل اليدوي.",

  privacy_p1:
    "تُجلب التنزيلات مباشرة عبر [yt-dlp](https://github.com/yt-dlp/yt-dlp) من يوتيوب إلى المجلد الذي تختاره — لا شيء يمر عبر خادم طرف ثالث. سجل المشاهدة والتنزيل والروابط ومحتوى الملفات تبقى على جهازك.",
  privacy_p2:
    "يرسل Arroxy قياسات مجهولة ومجمّعة عبر [OpenPanel](https://openpanel.dev) — بما يكفي فقط لفهم مرات التشغيل وأنظمة التشغيل وإصدارات التطبيق والأعطال. لا URLs، لا عناوين فيديو، لا مسارات ملفات، لا معلومات حساب، لا بصمة رقمية، ولا بيانات شخصية. معرّف كل تثبيت عشوائي وغير مرتبط بهويتك. يمكنك إيقافه من الإعدادات.",
  faq_q1: "هل هو مجاني حقاً؟",
  faq_a1: "نعم — مرخَّص بـ MIT، بدون مستوى مميز، بدون قيود على الميزات.",
  faq_q2: "ما جودات الفيديو التي يمكنني تنزيلها؟",
  faq_a2:
    "كل ما يوفره يوتيوب: 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، بالإضافة إلى الصوت فقط. تدفقات 60 fps و120 fps وHDR محفوظة كما هي.",
  faq_q3: "هل يمكنني استخراج الصوت فقط بصيغة MP3؟",
  faq_a3: "نعم. اختر *صوت فقط* من قائمة الصيغ ثم اختر MP3 أو M4A/AAC أو Opus أو WAV.",
  faq_q4: "هل أحتاج إلى حساب يوتيوب أو كوكيز؟",
  faq_a4:
    "افتراضياً، لا — يعمل Arroxy دون حساب YouTube أو تسجيل دخول أو تصدير كوكيز. يتوفر دعم اختياري للكوكيز في الإعدادات المتقدمة (Cookies source: file or browser) للمحتوى الذي يتطلب مصادقة، مثل الفيديوهات المقيَّدة بالعمر أو المخصَّصة للأعضاء فقط. وهو معطَّل افتراضياً. إذا فعّلته، فإن ويكي yt-dlp يشير إلى أن [الأتمتة المعتمدة على الكوكيز قد تُعلِّم حساب Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)؛ في هذه الحالة يكون الحساب البديل المؤقت الخيار الأكثر أماناً.",
  faq_q5: "هل سيستمر في العمل عند تغيير يوتيوب لشيء ما؟",
  faq_a5:
    "يُحدَّث yt-dlp تلقائياً عند الإطلاق، ويُصدر Arroxy إصلاحات بسرعة عندما يُغيِّر YouTube شيئاً ما. وإن واجهت مشكلة، يتوفر دعم اختياري للكوكيز في الإعدادات المتقدمة كحل احتياطي.",
  faq_q6: "ما اللغات المتاحة في Arroxy؟",
  faq_a6:
    "إحدى وعشرون لغة، جاهزة للاستخدام: English وEspañol (الإسبانية) وDeutsch (الألمانية) وFrançais (الفرنسية) و日本語 (اليابانية) و中文 (الصينية) وРусский (الروسية) وУкраїнська (الأوكرانية) وहिन्दी (الهندية) وAfaan Oromoo وKiswahili وO'zbekcha (الأوزبكية) وTiếng Việt (الفيتنامية) وአማርኛ (الأمهرية) والعربية واردو (الأردية) وپښتو (البشتونية) وবাংলা (البنغالية) وမြန်မာဘာသာ (البورمية) وΕλληνικά (اليونانية) وСрпски (الصربية). يكتشف Arroxy لغة نظام تشغيلك تلقائياً عند الإطلاق الأول، ويمكنك التبديل في أي وقت من محدد اللغة في شريط الأدوات. توجد ملفات JSON الخاصة بواجهات التشغيل في src/shared/i18n/locales/، وتوجد كتالوجات PO الموجهة للمترجمين في i18n/locales/ — افتح طلب سحب على GitHub للمساهمة.",
  faq_q7: "هل أحتاج إلى تثبيت شيء آخر؟",
  faq_a7:
    "لا. يُحمَّل yt-dlp تلقائياً عند الإطلاق الأول ويُخزَّن على جهازك؛ أمّا ffmpeg وffprobe فيأتيان داخل التطبيق. بعد ذلك، لا تحتاج أي إعداد إضافي.",
  faq_q8: "هل يمكنني تنزيل قوائم التشغيل أو القنوات بالكامل؟",
  faq_a8:
    "نعم — كلاهما. الصق رابط قائمة تشغيل أو قناة (مثل `youtube.com/@handle` أو `/channel/UC…` أو `/c/Name` أو `/user/Old`)؛ اختر عدد العناصر التي تريد فحصها، ثم أضف القائمة كلها إلى الطابور أو اختر فيديوهات محددة. ستأتي فلاتر نطاق التاريخ قريبًا.",
  faq_q9: "يقول macOS إن \"التطبيق تالف\" — ماذا أفعل؟",
  faq_a9:
    'هذا Gatekeeper في macOS يحظر تطبيقاً غير موقَّع، وليس تلفاً فعلياً. راجع ["App is damaged" — إصلاح عبر Terminal](#macos-first-launch) لأمر `xattr` بسطر واحد يُزيل الحظر.',
  faq_q10: "هل تنزيل فيديوهات يوتيوب قانوني؟",
  faq_a10:
    "للاستخدام الشخصي الخاص، يُقبَل هذا عموماً في معظم الولايات القضائية. أنت مسؤول عن الامتثال لـ [شروط خدمة](https://www.youtube.com/t/terms) يوتيوب وقوانين حقوق النشر في بلدك.",
  plan_intro: "ما زال مخططًا — تقريبًا بترتيب الأولوية:",
  plan_col1: "الميزة",
  plan_col2: "الوصف",
  plan_r1_name: "**فلاتر قوائم التشغيل والقنوات**",
  plan_r1_desc: "فلاتر نطاق التاريخ عند تعداد قائمة تشغيل أو قناة",
  plan_r2_name: "**إدخال روابط متعددة**",
  plan_r2_desc: "الصق روابط متعددة دفعة واحدة وشغِّلها معاً",
  plan_r4_name: "**قوالب أسماء ملفات مخصصة**",
  plan_r4_desc:
    "تسمية الملفات بالعنوان أو الرافع أو التاريخ أو الدقة — مع معاينة فورية",
  plan_r5_name: "**التنزيلات المجدولة**",
  plan_r5_desc: "بدء قائمة في وقت محدد (تشغيل ليلي)",
  plan_r6_name: "**حدود السرعة**",
  plan_r6_desc: "تحديد عرض النطاق الترددي حتى لا تُشبع التنزيلات اتصالك",
  plan_r7_name: "**قص المقاطع**",
  plan_r7_desc: "تنزيل جزء فقط بتحديد وقت البداية والنهاية",
  plan_cta:
    "هل لديك ميزة في ذهنك؟ [افتح طلباً](../../issues) — مدخلات المجتمع تُشكِّل الأولويات.",
  tech_content: TECH_CONTENT,
  tos_h2: "شروط الاستخدام",
  tos_note:
    "Arroxy أداة للاستخدام الشخصي الخاص فقط. أنت مسؤول مسؤولية كاملة عن ضمان امتثال تنزيلاتك لـ [شروط خدمة](https://www.youtube.com/t/terms) يوتيوب وقوانين حقوق النشر في ولايتك القضائية. لا تستخدم Arroxy لتنزيل أو إعادة إنتاج أو توزيع محتوى ليس لديك حق استخدامه. المطوّرون غير مسؤولين عن أي إساءة استخدام.",
  footer_credit:
    'ترخيص MIT · صُنع بعناية بواسطة <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
