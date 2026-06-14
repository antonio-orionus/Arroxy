const TECH_CONTENT = `<details>
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

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

کسی نیٹو بلڈ ٹول کی ضرورت نہیں — اس پروجیکٹ میں کوئی نیٹو Node ایڈ آن نہیں ہے۔

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron رن ٹائم ڈپینڈنسیز
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# صرف E2E ٹیسٹ کے لیے (Electron کو ڈسپلے درکار ہوتا ہے)
sudo apt install -y xvfb
\`\`\`

### کلون اور رن کریں

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # ہاٹ ری لوڈ ڈیو بلڈ
\`\`\`

### تقسیم کے قابل بلڈ بنائیں

\`\`\`bash
bun run build        # ٹائپ چیک + کمپائل
bun run dist         # موجودہ OS کے لیے پیکج
bun run dist:win     # Windows پورٹیبل exe کراس کمپائل
\`\`\`

> yt-dlp پہلی بار لانچ پر GitHub سے حاصل ہو کر آپ کے ایپ ڈیٹا فولڈر میں کیش ہوتا ہے۔ ffmpeg اور ffprobe ہر Arroxy ریلیز کے ساتھ بنڈل ہوتے ہیں۔

</details>`;

export const ur = {
  icon_alt: "Arroxy ماسکٹ",
  title: "Arroxy — Windows، macOS اور Linux کے لیے مفت اوپن سورس YouTube (+ 2000 سائٹس) ڈاؤن لوڈر",
  read_in_label: "زبان:",
  badge_release_alt: "ریلیز",
  badge_build_alt: "بلڈ",
  badge_license_alt: "لائسنس",
  badge_platforms_alt: "پلیٹ فارمز",
  badge_i18n_alt: "زبانیں",
  badge_website_alt: "ویب سائٹ",
  discord_badge_text: "Discord کمیونٹی میں شامل ہوں",
  discord_badge_encoded: "Discord%20%DA%A9%D9%85%DB%8C%D9%88%D9%86%D9%B9%DB%8C%20%D9%85%DB%8C%DA%BA%20%D8%B4%D8%A7%D9%85%D9%84%20%DB%81%D9%88%DA%BA",
  hero_desc:
    "**YouTube اور 2000+ معاون سائٹس** سے ویڈیوز، Shorts، موسیقی، چینلز، پوڈکاسٹ یا آڈیو ٹریک ڈاؤن لوڈ کریں — 60 fps پر 4K HDR تک، یا MP3 / AAC / Opus کے طور پر۔ Windows، macOS اور Linux پر مقامی طور پر چلتا ہے۔ **کوئی اشتہارات نہیں، کوئی بلوٹ نہیں، کوئی اپ سیلز نہیں۔**",
  cta_latest: "↓ تازہ ترین ریلیز ڈاؤن لوڈ کریں",
  cta_website: "ویب سائٹ",
  demo_alt: "Arroxy ڈیمو",
  star_cta: "اگر Arroxy آپ کا وقت بچاتا ہے، تو ایک ⭐ دوسروں کو اسے ڈھونڈنے میں مدد کرتا ہے۔",
  ai_notice:
    "> 🌐 یہ AI کی مدد سے کیا گیا ترجمہ ہے۔ [انگریزی README](README.md) سچائی کا ماخذ ہے۔ کوئی غلطی نظر آئی؟ [PR کا خیر مقدم ہے](../../pulls)۔",
  toc_heading: "فہرست",
  why_h2: "Arroxy کیوں",
  features_h2: "خصوصیات",
  dl_h2: "ڈاؤن لوڈ",
  privacy_h2: "پرائیویسی",
  faq_h2: "اکثر پوچھے گئے سوالات",
  roadmap_h2: "روڈ میپ",
  tech_h2: "ان چیزوں سے بنایا گیا",
  why_intro: "سب سے عام متبادل کے ساتھ ساتھ ساتھ موازنہ:",
  why_r1: "مفت، کوئی پریمیم سطح نہیں",
  why_r2: "اوپن سورس",
  why_r3: "صرف مقامی پراسیسنگ",
  why_r4: "کوئی لاگ ان یا کوکی ایکسپورٹ نہیں",
  why_r5: "استعمال کی کوئی حد نہیں",
  why_r6: "کراس پلیٹ فارم ڈیسک ٹاپ ایپ",
  why_r7: "سب ٹائٹلز + SponsorBlock",
  why_summary:
    "Arroxy ایک ہی کام کے لیے بنایا گیا ہے: URL پیسٹ کریں، ایک صاف ستھری مقامی فائل حاصل کریں۔ کوئی اکاؤنٹس نہیں، کوئی اپ سیلز نہیں، کوئی ڈیٹا کلیکشن نہیں۔",
  feat_quality_h3: "کوالٹی اور فارمیٹس",
  feat_quality_1: "**4K UHD (2160p)** تک، 1440p، 1080p، 720p، 480p، 360p",
  feat_quality_2: "**ہائی فریم ریٹ** جیسا ہے ویسا ہی محفوظ — 60 fps، 120 fps، HDR",
  feat_quality_3:
    "**آڈیو کنٹرولز** — صرف آڈیو کو MP3، M4A/AAC، Opus یا WAV میں ایکسپورٹ کریں؛ عالمی **سراؤنڈ / Dolby کو ترجیح دیں** آپشن سیٹ کریں؛ اور دستیاب ہونے پر انٹرایکٹو ڈاؤن لوڈز میں نیٹو Dolby AC-3/EC-3، ملٹی چینل، DRC اور دیگر جدید آڈیو ٹریکس کو منتخب رہنے دیں",
  feat_quality_4: "فوری پری سیٹس: *بہترین کوالٹی* · *متوازن* · *چھوٹی فائل*",
  feat_privacy_h3: "پرائیویسی اور کنٹرول",
  feat_privacy_1:
    "100% مقامی پراسیسنگ — ڈاؤن لوڈز سیدھے YouTube سے آپ کی ڈسک پر جاتے ہیں",
  feat_privacy_2: "کوئی لاگ ان نہیں، کوئی کوکیز نہیں، کوئی Google اکاؤنٹ منسلک نہیں",
  feat_privacy_3: "فائلیں سیدھی آپ کے منتخب کردہ فولڈر میں محفوظ",
  feat_workflow_h3: "ورک فلو",
  feat_workflow_1:
    "**لچکدار آغاز کے طریقے** — گائیڈڈ سنگل ڈاؤن لوڈ، پلے لسٹ/چینل پکر، bulk URL پیسٹ، یا محفوظ ڈیفالٹس کے ساتھ Quick Download منتخب کریں",
  feat_workflow_2:
    "**مرکزی ڈاؤن لوڈ قطار** — ہر سنگل، پلے لسٹ، bulk، یا quick کام پیش رفت، pause، resume، cancel، retry، اور priority کنٹرول کے لیے ایک ہی جگہ آتا ہے",
  feat_workflow_3:
    "**کلپ بورڈ واچ** — YouTube لنک کاپی کریں اور جب آپ ایپ پر واپس آئیں تو Arroxy خود بخود URL بھر دیتا ہے (ایڈوانسڈ سیٹنگز میں ٹوگل کریں)",
  feat_workflow_4:
    "**خودکار صاف URLs** — ٹریکنگ پیرامیٹرز (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) کو ہٹاتا ہے اور `youtube.com/redirect` لنکس کو کھولتا ہے",
  feat_workflow_5:
    "**ٹرے موڈ** — ونڈو بند کرنے سے ڈاؤن لوڈز پس منظر میں چلتے رہتے ہیں",
  feat_workflow_6:
    "**21 زبانیں** — سسٹم لوکیل کو خود بخود پہچانتا ہے، کسی بھی وقت تبدیل کیا جا سکتا ہے",
  feat_workflow_7:
    "**پلے لسٹ سنک** — پہلے سے ڈاؤن لوڈ شدہ ویڈیوز چھوڑنے کے لیے پلے لسٹ کو مقامی فولڈر کے مقابل دوبارہ اسکین کرتا ہے؛ ہر ویڈیو ڈاؤن لوڈ ہونے پر اپ ڈیٹ ہونے والی `.m3u` پلے لسٹ فائل بناتا ہے",
  feat_workflow_8:
    "**رفتار اور pacing کنٹرولز** — ڈاؤن لوڈ bandwidth محدود کریں، requests کے درمیان delays شامل کریں، اور presets (*Off · Balanced · Careful · Custom*) سے fragment threads کو tune کریں",
  feat_post_h3: "سب ٹائٹلز اور پوسٹ پراسیسنگ",
  feat_post_1:
    "**سب ٹائٹلز** SRT، VTT یا ASS میں — دستی یا خود کار طریقے سے بنائے گئے، کسی بھی دستیاب زبان میں",
  feat_post_2:
    "ویڈیو کے ساتھ محفوظ کریں، `.mkv` میں ایمبیڈ کریں، یا `Subtitles/` سب فولڈر میں منظم کریں",
  feat_post_3:
    "**SponsorBlock** — اسپانسرز، انٹروز، آؤٹروز اور سیلف پروموز کو سکپ کریں یا چیپٹر مارک کریں",
  feat_post_4:
    "**ایمبیڈڈ میٹا ڈیٹا** — ٹائٹل، اپ لوڈ کی تاریخ، چینل، تفصیل، تھمب نیل اور چیپٹر مارکرز فائل میں لکھے جاتے ہیں",
  feat_sites_h3: "YouTube + 2000 سائٹس",
  feat_sites_1:
    "**YouTube، مکمل** — Videos، Shorts، Channels، Playlists، YouTube Music اور Podcasts کو فرسٹ-کلاس ذرائع کے طور پر ہینڈل کیا جاتا ہے",
  feat_sites_2:
    "**2000+ دیگر سائٹس** yt-dlp کے ذریعے — Vimeo، Twitch، Twitter/X، TikTok، SoundCloud، Bandcamp، Bilibili، BBC iPlayer، archive.org اور بہت کچھ",
  feat_sites_3:
    "**صرف آڈیو اور سب ٹائٹلز** ہر معاون سائٹ پر کام کرتے ہیں، نہ صرف YouTube پر",
  feat_sites_4:
    "اگر کوئی سائٹ بدلتی ہے تو yt-dlp ہر ہفتے فکس جاری کرتا ہے اور Arroxy لانچ پر بائنری خودکار طور پر اپ ڈیٹ کرتا ہے",
  shot1_alt: "URL پیسٹ کریں",
  shot2_alt: "اپنی کوالٹی منتخب کریں",
  shot3_alt: "محفوظ کرنے کی جگہ منتخب کریں",
  shot4_alt: "ڈاؤن لوڈ قطار چلتی ہوئی",
  shot5_alt: "سب ٹائٹل زبان اور فارمیٹ منتخب کرنے والا",
  dl_platform_col: "پلیٹ فارم",
  dl_format_col: "فارمیٹ",
  dl_win_format: "انسٹالر (NSIS) یا پورٹیبل `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` یا `.flatpak` (سینڈ باکسڈ)",
  dl_grab: "تازہ ترین ریلیز حاصل کریں →",
  dl_pkg_h3: "پیکج مینیجر کے ذریعے انسٹال کریں",
  dl_channel_col: "چینل",
  dl_command_col: "کمانڈ",
  dl_win_h3: "Windows: انسٹالر بمقابلہ پورٹیبل",
  dl_win_col_installer: "NSIS انسٹالر",
  dl_win_col_portable: "پورٹیبل `.exe`",
  dl_win_r1: "انسٹالیشن ضروری",
  dl_win_r1_installer: "ہاں",
  dl_win_r1_portable: "نہیں — کہیں سے بھی چلائیں",
  dl_win_r2: "خودکار اپ ڈیٹس",
  dl_win_r2_installer: "✅ ایپ کے اندر",
  dl_win_r2_portable: "❌ دستی ڈاؤن لوڈ",
  dl_win_r3: "اسٹارٹ اپ سپیڈ",
  dl_win_r3_installer: "✅ تیز",
  dl_win_r3_portable: "⚠️ کولڈ اسٹارٹ سست",
  dl_win_r4: "اسٹارٹ مینو میں شامل",
  dl_win_r5: "آسان ان انسٹال",
  dl_win_r5_portable: "❌ بس فائل ڈیلیٹ کر دیں",
  dl_win_rec:
    "**تجویز:** خودکار اپ ڈیٹس اور تیز اسٹارٹ اپ کے لیے NSIS انسٹالر استعمال کریں۔ بغیر انسٹالیشن، بغیر رجسٹری آپشن کے لیے پورٹیبل `.exe` استعمال کریں۔",
  dl_win_smartscreen_h4: "Windows SmartScreen وارننگ",
  dl_win_smartscreen_intro:
    "پہلی بار لانچ پر آپ کو **\"Windows protected your PC\"** یا **\"Unknown publisher\"** نظر آ سکتا ہے۔ یہ `Arroxy-win-x64-Setup.exe` اور `Arroxy-win-x64-Portable.exe` دونوں پر لاگو ہوتا ہے۔ Arroxy مفت اور اوپن سورس ہے اور Windows بلڈز کو ادائیگی والے سرٹیفکیٹ سے کوڈ سائن نہیں کیا گیا، اسی لیے SmartScreen انہیں فلیگ کرتا ہے۔ اس کا مطلب **نہیں** کہ Arroxy خود بخود غیر محفوظ ہے۔ جاری رکھنے کے لیے:",
  dl_win_smartscreen_step1: "**More info** پر کلک کریں۔",
  dl_win_smartscreen_step2: "**Run anyway** پر کلک کریں۔",
  dl_win_smartscreen_official:
    "Arroxy صرف آفیشل GitHub Releases صفحے سے ڈاؤن لوڈ کریں۔ اگر آپ کو فائل کسی دوسری ویب سائٹ سے ملی ہے یا کسی نے بھیجی ہے، تو اسے ڈیلیٹ کریں اور آفیشل ماخذ سے تازہ کاپی ڈاؤن لوڈ کریں۔ سورس کوڈ عوامی ہے، اس لیے آپ خود اسے جانچ یا Arroxy بنا سکتے ہیں۔",
  dl_macos_h3: "macOS پر پہلی بار لانچ",
  dl_macos_warning:
    "Arroxy ابھی کوڈ سائنڈ نہیں ہے، اس لیے macOS Gatekeeper پہلی بار لانچ پر آپ کو تنبیہ کرے گا۔ یہ متوقع ہے — یہ نقصان کی علامت نہیں۔",
  dl_macos_m1_h4: "سسٹم سیٹنگز کا طریقہ (تجویز کردہ):",
  dl_macos_step1: "Arroxy ایپ آئیکن پر دائیں کلک کریں اور **Open** منتخب کریں۔",
  dl_macos_step2:
    "تنبیہی ڈائیلاگ ظاہر ہوگا — **Cancel** پر کلک کریں (*Move to Trash* پر کلک نہ کریں)۔",
  dl_macos_step3: "**System Settings → Privacy & Security** کھولیں۔",
  dl_macos_step4:
    '**Security** سیکشن تک اسکرول کریں۔ آپ کو نظر آئے گا *"Arroxy was blocked from use because it is not from an identified developer."*',
  dl_macos_step5:
    "**Open Anyway** پر کلک کریں اور اپنے پاس ورڈ یا Touch ID سے تصدیق کریں۔",
  dl_macos_after:
    "مرحلہ 5 کے بعد، Arroxy عام طور پر کھلتا ہے اور تنبیہ پھر کبھی ظاہر نہیں ہوتی۔",
  dl_macos_m2_h4: "ٹرمینل کا طریقہ (ایڈوانسڈ):",
  dl_macos_note:
    "macOS بلڈز Apple Silicon اور Intel رنرز پر CI کے ذریعے تیار کیے جاتے ہیں۔ اگر آپ کو مسائل پیش آئیں، تو براہ کرم [ایک issue کھولیں](../../issues) — macOS صارفین سے ملنے والی فیڈ بیک macOS ٹیسٹنگ سائیکل کو فعال طور پر تشکیل دیتی ہے۔",
  dl_linux_h3: "Linux پر پہلی بار لانچ",
  dl_linux_intro:
    "AppImages براہ راست چلتے ہیں — کوئی انسٹالیشن نہیں۔ آپ کو صرف فائل کو ایگزیکیوٹیبل مارک کرنا ہوگا۔",
  dl_linux_m1_text:
    "**فائل مینیجر:** `.AppImage` پر دائیں کلک کریں → **Properties** → **Permissions** → **Allow executing file as program** کو فعال کریں، پھر ڈبل کلک کریں۔",
  dl_linux_m2_h4: "ٹرمینل:",
  dl_linux_fuse_text: "اگر لانچ پھر بھی ناکام ہو جائے، تو شاید آپ کے پاس FUSE نہیں ہے:",
  dl_linux_flatpak_intro:
    "**Flatpak (سینڈ باکسڈ متبادل):** اسی ریلیز پیج سے `Arroxy-*.flatpak` ڈاؤن لوڈ کریں۔",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "آپ کو وارننگ کیوں نظر آ سکتی ہے",
  dl_warning_p1:
    "Arroxy اوپن سورس اور MIT لائسنس یافتہ ہے۔ Windows اور macOS بلڈز **کوڈ سائنڈ نہیں ہیں** — Apple Developer ID اور Windows EV کوڈ سائننگ سرٹیفکیٹس میں سے ہر ایک سالانہ سینکڑوں ڈالر لاگت آتی ہے، جو ایک انڈی پروجیکٹ اپنی جیب سے ادا کرتا ہے۔ ان دستخطوں کے بغیر، Windows SmartScreen اور macOS Gatekeeper پہلی بار لانچ پر آپ کو تنبیہ کریں گے۔ یہ تنبیہات اس بات کی علامت ہیں کہ *آپ کا OS ناشر کو نہیں پہچانتا* — یہ اس بات کی علامت نہیں کہ Arroxy میلویئر ہے۔",
  dl_warning_p2:
    "Arroxy کو خود جانچنے کے تین طریقے، بڑھتی ہوئی سختی کے ساتھ:\n\n- **سورس پڑھیں۔** ہر لائن [GitHub](https://github.com/antonio-orionus/Arroxy) پر موجود ہے اور آپ [سورس سے بلڈ](#tech) کر سکتے ہیں۔\n- **SHA256 چیک کریں۔** اپنی فائل کو شائع شدہ [`SHA256SUMS`](../../releases/latest) سے ملائیں — نیچے [اپنا ڈاؤن لوڈ تصدیق کریں](#verify) دیکھیں۔\n- **تھرڈ پارٹی اسکین چلائیں۔** فائل کو [VirusTotal](https://www.virustotal.com) پر اپ لوڈ کریں۔",

  dl_win_first_h3: "Windows پر پہلی بار لانچ",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" ڈائیلاگ جس میں "More info" لنک نمایاں ہے',
  shot_smartscreen_run_alt:
    'More info کھولنے کے بعد SmartScreen ڈائیلاگ، جس میں "Run anyway" بٹن دکھائی دے رہا ہے',
  dl_win_defender_h4: "اگر Windows Defender فائل کو فلیگ کرے یا ہٹا دے",
  dl_win_defender_p:
    "Defender کے ہیورسٹکس کبھی کبھی غیر سائنڈ NSIS انسٹالرز اور Electron پورٹیبلز کو مشکوک قرار دیتے ہیں۔ اگر Defender نے `Arroxy-win-x64-Setup.exe` یا `Arroxy-win-x64-Portable.exe` کو قرنطینہ میں ڈالا ہو، تو اسے **Windows Security → Virus & threat protection → Protection history** سے بحال کریں، پھر Arroxy ایگزیکیوٹیبل کو **Manage settings → Add or remove exclusions** کے تحت اجازت یافتہ آئٹم کے طور پر شامل کریں۔ SmartScreen کی طرح، وجہ غائب پبلشر دستخط ہے، کوئی دریافت شدہ میلویئر نہیں۔",

  dl_macos_first_h3: "macOS پر پہلی بار لانچ",
  dl_macos_intro:
    "Arroxy ابھی macOS کے لیے کوڈ سائنڈ نہیں ہے، اس لیے Gatekeeper پہلی بار لانچ کو بلاک کرے گا۔ اسے اجازت دینے کا عین طریقہ آپ کے macOS ورژن پر منحصر ہے — Sequoia 15 نے پرانے دائیں کلک → Open کو مزید سخت کر دیا ہے۔",
  dl_macos_sequoia_h4: "macOS Sequoia 15 اور بعد میں (موجودہ)",
  dl_macos_sequoia_intro:
    "Sequoia 15 اور نئے ورژنز پر، دائیں کلک → Open اب کئی قرنطینہ شدہ ایپس کے لیے Gatekeeper کو bypass نہیں کرتا۔ اس کی بجائے System Settings پینل استعمال کریں:",
  dl_macos_sequoia_step1:
    "نصب شدہ DMG سے `Arroxy.app` کو `/Applications` میں گھسیٹیں۔",
  dl_macos_sequoia_step2:
    "Arroxy کو ڈبل کلک کریں۔ بلاک ڈائیلاگ ظاہر ہوگا — **Done** پر کلک کریں (*Move to Trash* پر کلک نہ کریں)۔",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** کھولیں اور **Security** سیکشن تک اسکرول کریں۔ آپ کو نظر آئے گا *"Arroxy was blocked to protect your Mac"* (یا ایسا ہی پیغام)۔',
  dl_macos_sequoia_step4:
    "**Open Anyway** پر کلک کریں، اپنے پاس ورڈ یا Touch ID سے تصدیق کریں، پھر Arroxy کو `/Applications` سے دوبارہ لانچ کریں۔",
  dl_macos_sonoma_h4: "macOS Sonoma 14 اور اس سے پہلے",
  dl_macos_sonoma_step1:
    "نصب شدہ DMG سے `Arroxy.app` کو `/Applications` میں گھسیٹیں۔",
  dl_macos_sonoma_step2:
    "`/Applications` میں `Arroxy.app` پر دائیں کلک کریں (یا Control-click) اور **Open** منتخب کریں۔",
  dl_macos_sonoma_step3:
    "اب تنبیہی ڈائیلاگ میں **Open** بٹن موجود ہے — اسے کلک کریں اور تصدیق کریں۔ Arroxy عام طور پر کھلتا ہے اور تنبیہ پھر کبھی ظاہر نہیں ہوتی۔",
  dl_macos_damaged_h4:
    '"App is damaged" یا مسلسل Gatekeeper بلاک — Terminal فکس',
  dl_macos_damaged_p:
    'اگر macOS کہے *"Arroxy is damaged and can\'t be opened"*، یا اوپر کے کسی بھی قدم نے بلاک کو نہ ہٹایا ہو، تو DMG پر quarantine attribute وجہ ہے (کچھ براؤزرز اور macOS کا اپنا translocation رویہ اسے سیٹ کرتا ہے)۔ اسے انسٹال شدہ ایپ سے ہٹائیں:',
  dl_macos_arch_note:
    "**Apple Silicon بمقابلہ Intel:** M-سیریز Mac پر (M1 / M2 / M3 / M4)، `arm64` DMG ڈاؤن لوڈ کریں۔ Intel Macs پر، `x64` DMG ڈاؤن لوڈ کریں۔ غلط بلڈ چلانا Rosetta کے ذریعے کام کرتا ہے لیکن نمایاں طور پر سست ہے۔",

  dl_linux_first_h3: "Linux پر پہلی بار لانچ",
  dl_linux_appimagelauncher:
    "**اختیاری ڈیسک ٹاپ انٹیگریشن:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ایک بار انسٹال کریں، اور جس بھی AppImage کو آپ ڈبل کلک کریں گے وہ خود بخود آپ کے لانچر مینو میں رجسٹر ہو جائے گا — کوئی دستی `.desktop` فائل نہیں چاہیے۔",

  dl_verify_h3: "اپنا ڈاؤن لوڈ تصدیق کریں (SHA256)",
  dl_verify_intro:
    "ہر ریلیز بائنریز کے ساتھ `SHA256SUMS` فائل بھی شائع کرتی ہے۔ یہ جانچنے کے لیے کہ آپ کا ڈاؤن لوڈ ٹرانسمیشن میں خراب یا تبدیل نہیں ہوا، اپنی فائل کو مقامی طور پر ہیش کریں اور `SHA256SUMS` کی لائن سے ملائیں۔ تازہ ترین ریلیز پیج کھولیں → **Assets** → `SHA256SUMS` ڈاؤن لوڈ کریں۔",
  dl_verify_win_label: "Windows (PowerShell یا Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "تھرڈ پارٹی میلویئر اسکین چاہتے ہیں؟ فائل کو [VirusTotal](https://www.virustotal.com) پر اپ لوڈ کریں۔ چھوٹے انجنوں سے چند عام ہیورسٹک فلیگز غیر سائنڈ Electron ایپس کے لیے معمول ہیں؛ بڑے انجنوں سے وسیع پیمانے پر دریافت واقعی تشویش کا باعث ہوگی۔",

  dl_pm_intro:
    "پہلے سے پیکج مینیجر استعمال کرتے ہیں؟ آپ دستی ڈاؤن لوڈ کا راستہ چھوڑ سکتے ہیں۔",

  privacy_p1:
    "ڈاؤن لوڈز [yt-dlp](https://github.com/yt-dlp/yt-dlp) کے ذریعے براہ راست YouTube سے آپ کے منتخب کردہ فولڈر میں آتے ہیں — کسی تھرڈ پارٹی سرور سے نہیں گزرتے۔ دیکھنے کی تاریخ، ڈاؤن لوڈ تاریخ، URLs اور فائل کے مواد آپ کے ڈیوائس پر ہی رہتے ہیں۔",
  privacy_p2:
    "Arroxy [OpenPanel](https://openpanel.dev) کے ذریعے گمنام، مجموعی ٹیلی میٹری بھیجتا ہے — صرف اتنی کہ لانچز، OS، ایپ ورژنز اور کریشز سمجھ آ سکیں۔ کوئی URLs، ویڈیو ٹائٹلز، فائل پاتھز، اکاؤنٹ معلومات، fingerprinting یا ذاتی ڈیٹا نہیں۔ ہر انسٹال کا ID رینڈم ہے اور آپ کی شناخت سے منسلک نہیں۔ آپ Settings میں اسے بند کر سکتے ہیں۔",
  faq_q1: "کیا یہ واقعی مفت ہے؟",
  faq_a1: "ہاں — MIT لائسنس یافتہ، کوئی پریمیم سطح نہیں، کوئی فیچر گیٹنگ نہیں۔",
  faq_q2: "میں کن ویڈیو کوالٹیز میں ڈاؤن لوڈ کر سکتا ہوں؟",
  faq_a2:
    "جو بھی YouTube فراہم کرتا ہے: 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، اور صرف آڈیو۔ 60 fps، 120 fps اور HDR اسٹریمز جیسے ہیں ویسے ہی محفوظ ہوتے ہیں۔",
  faq_q3: "کیا میں صرف آڈیو کو MP3 کے طور پر نکال سکتا ہوں؟",
  faq_a3: "جی ہاں۔ فارمیٹ مینو میں *صرف آڈیو* منتخب کریں اور پھر MP3، M4A/AAC، Opus یا WAV چنیں۔",
  faq_q4: "کیا مجھے YouTube اکاؤنٹ یا کوکیز کی ضرورت ہے؟",
  faq_a4:
    "بطور ڈیفالٹ، نہیں — Arroxy YouTube اکاؤنٹ، لاگ ان یا کوکی ایکسپورٹ کے بغیر کام کرتا ہے۔ ایسا مواد جس کے لیے توثیق درکار ہو، جیسے عمر کی پابندی والے یا صرف ممبران کے لیے ویڈیوز، کے لیے ایڈوانسڈ سیٹنگز میں اختیاری کوکی سپورٹ دستیاب ہے (Cookies source: file or browser)۔ یہ بطور ڈیفالٹ بند ہے۔ اگر آپ اسے فعال کرتے ہیں، تو yt-dlp کی وکی میں نوٹ کیا گیا ہے کہ [کوکی پر مبنی آٹومیشن Google اکاؤنٹ کو فلیگ کر سکتی ہے](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)؛ ایسی صورت میں ایک عارضی اکاؤنٹ زیادہ محفوظ انتخاب ہے۔",
  faq_q5: "جب YouTube کچھ تبدیل کرے تو کیا یہ کام کرتا رہے گا؟",
  faq_a5:
    "yt-dlp لانچ پر خود بخود اپ ڈیٹ ہو جاتا ہے، اور جب YouTube کچھ تبدیل کرتا ہے تو Arroxy فوری طور پر فکس فراہم کرتا ہے۔ اگر آپ کو کبھی کوئی مسئلہ پیش آئے، تو ایڈوانسڈ سیٹنگز میں اختیاری کوکی سپورٹ ایک متبادل کے طور پر دستیاب ہے۔",
  faq_q6: "Arroxy کن زبانوں میں دستیاب ہے؟",
  faq_a6:
    "اکیس، باکس سے باہر: English، Español (ہسپانوی)، Deutsch (جرمن)، Français (فرانسیسی)، 日本語 (جاپانی)، 中文 (چینی)، Русский (روسی)، Українська (یوکرینی)، हिन्दी (ہندی)، Afaan Oromoo، Kiswahili، O'zbekcha (ازبک)، Tiếng Việt (ویتنامی)، አማርኛ (امہاری)، العربية (عربی)، اردو، پښتو (پشتو)، বাংলা (بنگالی)، မြန်မာဘာသာ (برمی)، Ελληνικά (یونانی)، اور Српски (صربی)۔ Arroxy پہلی بار لانچ پر آپ کے آپریٹنگ سسٹم کی زبان خود بخود پہچان لیتا ہے اور آپ ٹول بار میں زبان منتخب کرنے والے سے کسی بھی وقت تبدیل کر سکتے ہیں۔ رن ٹائم لوکیل JSON src/shared/i18n/locales/ میں ہیں، اور مترجمین کے لیے PO کیٹلاگ i18n/locales/ میں ہیں — حصہ ڈالنے کے لیے GitHub پر PR کھولیں۔",
  faq_q7: "کیا مجھے کچھ اور انسٹال کرنا ہوگا؟",
  faq_a7:
    "نہیں۔ yt-dlp پہلی بار لانچ پر خود بخود ڈاؤن لوڈ ہو کر آپ کی مشین پر کیش ہو جاتا ہے؛ ffmpeg اور ffprobe ایپ کے ساتھ آتے ہیں۔ اس کے بعد کسی اضافی سیٹ اپ کی ضرورت نہیں۔",
  faq_q8: "کیا میں پلے لسٹس یا پورے چینلز ڈاؤن لوڈ کر سکتا ہوں؟",
  faq_a8:
    "ہاں — دونوں۔ پلے لسٹ یا چینل URL پیسٹ کریں (مثلاً `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`)؛ منتخب کریں کہ کتنی entries scan کرنی ہیں، پھر پوری فہرست queue کریں یا مخصوص ویڈیوز چنیں۔ date-range filters جلد آ رہے ہیں۔",
  faq_q9: 'macOS کہتا ہے "ایپ خراب ہے" — میں کیا کروں؟',
  faq_a9:
    'یہ macOS Gatekeeper ایک غیر سائنڈ ایپ کو بلاک کر رہا ہے، اصل نقصان نہیں ہے۔ ایک لائن کے `xattr` کمانڈ کے لیے ["App is damaged" — Terminal فکس](#macos-first-launch) دیکھیں جو اسے صاف کرتا ہے۔',
  faq_q10: "کیا YouTube ویڈیوز ڈاؤن لوڈ کرنا قانونی ہے؟",
  faq_a10:
    "ذاتی، نجی استعمال کے لیے، زیادہ تر دائرہ اختیار میں یہ عام طور پر قبول کیا جاتا ہے۔ آپ YouTube کی [Terms of Service](https://www.youtube.com/t/terms) اور اپنے مقامی کاپی رائٹ قوانین کی پابندی کے ذمہ دار ہیں۔",
  plan_intro: "ابھی بھی منصوبہ بند — تقریباً ترجیحی ترتیب سے:",
  plan_col1: "خصوصیت",
  plan_col2: "تفصیل",
  plan_r1_name: "**پلے لسٹ اور چینل فلٹرز**",
  plan_r1_desc: "پلے لسٹ یا چینل enumerate کرتے وقت date-range filters",
  plan_r2_name: "**YouTube آڈیو ٹریک ترجیحات**",
  plan_r2_desc:
    "جب YouTube متعدد آڈیو ٹریک دے تو ترجیحی بولی جانے والی زبان کے ٹریک منتخب کریں",
  plan_r6_name: "**ایپ کے اندر browser sign-in**",
  plan_r6_desc:
    "Arroxy کے اندر browser windows کھولیں تاکہ آپ sign in کر سکیں اور site cookies کو manual export کیے بغیر استعمال کر سکیں",
  plan_r8_name: "**ایک-click ویڈیو ڈاؤن لوڈ**",
  plan_r8_desc:
    "active profile استعمال کرتے ہوئے detected یا pasted URL سے ویڈیو ڈاؤن لوڈ ایک click میں شروع کریں",
  plan_r3_name: "**مضبوط retry recovery**",
  plan_r3_desc:
    "غیر معتبر یا مسئلہ پیدا کرنے والے internet connection سے رکی ہوئی ڈاؤن لوڈز کے لیے نیا retry راستہ",
  plan_r4_name: "**مکمل download manager drawer**",
  plan_r4_desc:
    "queue drawer کو زیادہ مکمل manager میں بدلنا، queued items کے لیے destination folder تبدیل کرنے سمیت",
  plan_r5_name: "**شیڈیولڈ ڈاؤن لوڈز**",
  plan_r5_desc: "مقررہ وقت پر قطار شروع کریں (رات بھر کے رنز)",
  plan_r7_name: "**کلپ ٹرمنگ**",
  plan_r7_desc: "شروع/اختتام کے وقت سے صرف ایک سیگمنٹ ڈاؤن لوڈ کریں",
  plan_cta:
    "ذہن میں کوئی فیچر ہے؟ [ایک درخواست کھولیں](../../issues) — کمیونٹی کی رائے ترجیح کو تشکیل دیتی ہے۔",
  tech_content: TECH_CONTENT,
  tos_h2: "استعمال کی شرائط",
  tos_note:
    "Arroxy صرف ذاتی، نجی استعمال کے لیے ایک ٹول ہے۔ آپ اس بات کو یقینی بنانے کے واحد ذمہ دار ہیں کہ آپ کے ڈاؤن لوڈز YouTube کی [Terms of Service](https://www.youtube.com/t/terms) اور آپ کے دائرہ اختیار کے کاپی رائٹ قوانین کی پابندی کرتے ہیں۔ Arroxy کو ایسے مواد کو ڈاؤن لوڈ، دوبارہ تیار یا تقسیم کرنے کے لیے استعمال نہ کریں جس کے استعمال کا حق آپ کے پاس نہیں ہے۔ ڈویلپرز کسی بھی غلط استعمال کے ذمہ دار نہیں ہیں۔",
  footer_credit:
    'MIT لائسنس · <a href="https://x.com/OrionusAI">@OrionusAI</a> کی جانب سے محبت سے بنایا گیا',
};
