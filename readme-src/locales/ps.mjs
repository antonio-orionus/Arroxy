const TECH_CONTENT = `<details>
<summary><strong>ټیک سټیک</strong></summary>

- **Electron** — د ډیسکټاپ کراس-پلیټفارم شیل
- **React 19** + **TypeScript** — کارونکي انٹرفیس
- **Tailwind CSS v4** — ستایل کول
- **Zustand** — د حالت مدیریت
- **yt-dlp** + **ffmpeg** — د ډاونلوډ او mux انجن (yt-dlp د runtime پر مهال راوړل کېږي؛ ffmpeg/ffprobe د build پر مهال بنډل کېږي)
- **Vite** + **electron-vite** — د جوړولو وسیلې
- **Vitest** + **Playwright** — د واحد او له سره تر سره ازموینې

</details>

<details>
<summary><strong>له سرچینې جوړول</strong></summary>

### مخکینۍ شرطونه — ټولې پلیټفارمونه

| وسیله  | نسخه | نصب |
| ------- | ------- | ------- |
| Git     | هر     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | \`mise install\` یا \`.node-version\` |
| Bun     | 1.2.23  | \`mise install\` یا \`package.json\` \`packageManager\` |

سپارښتنه: \`mise\` نصب کړئ، بیا په checkout کې \`mise install\` وچلوئ. که mise نه کاروئ، د \`bun run bootstrap\` نه مخکې Node.js له \`.node-version\` او Bun له \`package.json\` څخه په لاسي ډول فعال کړئ.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

د اصلي rebuilds لپاره Visual Studio Build Tools او Python ته اړتیا کېدای شي.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# د build او Electron د چلولو وابستګۍ
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# یوازې E2E ازموینې (Electron ته ښکاره کیدو ته اړتیا ده)
sudo apt install -y xvfb
\`\`\`

### کلون کول او چلول

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise install           # سپارښتنه؛ که pinned tools مو لاسي فعال کړي وي پرېږدئ
bun run bootstrap
bun run doctor
bun run dev            # Electron app د Vite renderer سره
\`\`\`

### د توزیع وړ جوړول

\`\`\`bash
bun run build        # د ډول ازموینه + کمپایل
bun run dist         # د اوسني OS لپاره پیکیج کول
bun run dist:win     # په supported host کې د Windows targets پیکیج کول
\`\`\`

> \`bun run bootstrap\` dependencies نصبوي، د Electron app dependencies بیا جوړوي، Electron تاییدوي، د development لپاره embedded ffmpeg/ffprobe چمتو کوي، او Playwright Chromium نصبوي. yt-dlp په runtime کې د app data folder کې manage کېږي؛ ffmpeg او ffprobe د Arroxy هر release سره bundled وي.

</details>`;

export const ps = {
  icon_alt: "د Arroxy ماسکوټ",
  title:
    "Arroxy — د Windows، macOS او Linux لپاره وړیا خلاصه سرچینه YouTube (+ ۲۰۰۰ سایټونه) ډاونلوډر",
  read_in_label: "پدې ژبه ولولئ:",
  badge_release_alt: "خپرونه",
  badge_build_alt: "جوړونه",
  badge_license_alt: "جواز",
  badge_platforms_alt: "پلیټفارمونه",
  badge_i18n_alt: "ژبې",
  badge_website_alt: "ویب پاڼه",
  discord_badge_text: "د Discord ټولنې سره یوځای شئ",
  discord_badge_encoded:
    "%D8%AF%20Discord%20%D9%BC%D9%88%D9%84%D9%86%DB%90%20%D8%B3%D8%B1%D9%87%20%DB%8C%D9%88%DA%81%D8%A7%DB%8C%20%D8%B4%D8%A6",
  hero_desc:
    "له **YouTube او ۲۰۰۰+ ملاتړ شویو سایټونو** نه ویډیوګانې، Shorts، موسیقي، چینلونه، پوډکاسټونه، یا اوډیو ټریکونه ډاونلوډ کړئ — تر 4K HDR پورې د 60 fps سره، یا د MP3 / AAC / Opus په توګه. د Windows، macOS، او Linux پر سیستم ځایي چلیږي. **هیڅ اعلانات، هیڅ بلوټ، هیڅ اضافي پلورنه نه ده.**",
  cta_latest: "↓ وروستۍ خپرونه ډاونلوډ کړئ",
  cta_website: "ویب پاڼه",
  demo_alt: "د Arroxy ډیمو",
  star_cta: "که Arroxy ستاسو وخت خوندي کوي، یو ⭐ نورو سره مرسته کوي چې ومومي.",
  ai_notice: "",
  toc_heading: "منځپانګه",
  why_h2: "ولې Arroxy",
  features_h2: "ځانګړتیاوې",
  dl_h2: "ډاونلوډ",
  privacy_h2: "محرمیت",
  faq_h2: "مکرر پوښتنې",
  roadmap_h2: "د پرمختیا لار",
  tech_h2: "د جوړولو ټیکنالوژي",
  why_intro: "د ترټولو عام بدیلونو سره د اړخ پر اړخ پرتله:",
  why_r1: "وړیا، هیڅ پریمیم کچه نشته",
  why_r2: "خلاصه سرچینه",
  why_r3: "یوازې ځایي پروسس کول",
  why_r4: "هیڅ ننوتل یا د کوکیز صادرول نشته",
  why_r5: "هیڅ د کارولو سقف نشته",
  why_r6: "کراس-پلیټفارم ډیسکټاپ اپلیکیشن",
  why_r7: "ساب ټایټلونه + SponsorBlock",
  why_summary:
    "Arroxy د یوه کار لپاره جوړ شوی: URL پیسټ کړئ، پاک ځایني فایل ترلاسه کړئ. هیڅ اکاونټونه، هیڅ اضافي پلورنه، هیڅ د معلوماتو راټولونه.",
  feat_quality_h3: "کیفیت او بڼه",
  feat_quality_1: "تر **4K UHD (2160p)** پورې، 1440p، 1080p، 720p، 480p، 360p",
  feat_quality_2: "**لوړ فریم نرخ** لکه چې دی ساتل کیږي — 60 fps، 120 fps، HDR",
  feat_quality_3:
    "**آډیو** — یوازې آډیو MP3، M4A/AAC، Opus یا WAV ته صادر کړئ. په تعاملي ډاونلوډونو کې، که موجود وي، د سرچینې اصلي surround/Dolby ټرېکونه (AC-3، E-AC-3، 5.1، DRC) وټاکئ، یا نړیوال تلواله **surround / Dolby ته لومړیتوب ورکړئ** وټاکئ",
  feat_quality_4: "ګړندي مخکینۍ: *ترټولو ښه کیفیت* · *متوازن* · *کوچنی فایل*",
  feat_privacy_h3: "محرمیت او کنټرول",
  feat_privacy_1:
    "۱۰۰٪ ځایني پروسس کول — ډاونلوډونه مستقیما له YouTube څخه ستاسو ډیسک ته ځي",
  feat_privacy_2: "هیڅ ننوتل، هیڅ کوکیز، هیڅ د ګوګل اکاونټ لینک نه دی",
  feat_privacy_3: "فایلونه مستقیما هغه فولډر ته خوندي کیږي چې تاسو انتخاب کوئ",
  feat_workflow_h3: "کاري جریان",
  feat_workflow_1:
    "**انعطاف منونکي د پیل حالتونه** — لارښود شوی واحد ډاونلوډ، د playlist/channel ټاکونکی، د bulk URL پیسټ، یا د خوندي شوو defaultونو سره Quick Download وټاکئ",
  feat_workflow_2:
    "**مرکزي ډاونلوډ قطار** — هر single، playlist، bulk، یا quick کار د پرمختګ، pause، resume، cancel، retry، او priority کنټرول لپاره یوه ځای ته راځي",
  feat_workflow_3:
    "**د کلپبورډ لیدل** — یو YouTube لینک کاپي کړئ او Arroxy د اپ بیا تمرکز کولو پر مهال URL پخپله ډکوي (د پرمختللو تنظیماتو کې بدل کړئ)",
  feat_workflow_4:
    "**د URL اتوماتیک پاکول** — د تعقیب پیرامیترونه (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) لرې کوي او `youtube.com/redirect` لینکونه پرانیستي",
  feat_workflow_5:
    "**د ټرې حالت** — د کړکۍ بندول ډاونلوډونه شالید کې روان ساتي",
  feat_workflow_6:
    "**۲۱ ژبې** — د سیستم ژبه اتوماتیک کشف کوي، هر وخت بدلولی شئ",
  feat_workflow_7:
    "**د پلی‌لېست همغږي** — پلی‌لېست له ځایي فولډر سره بیا ګوري تر څو مخکې ډاونلوډ شوې ویډیوګانې پرېږدي؛ د `.m3u` پلی‌لېست فایل جوړوي چې د هرې ویډیو په ډاونلوډ سره تازه کېږي",
  feat_workflow_8:
    "**د سرعت او pacing کنټرولونه** — د ډاونلوډ bandwidth محدود کړئ، د requests تر منځ ځنډونه زیات کړئ، او fragment threads د presets (*Off · Balanced · Careful · Custom*) سره عیار کړئ",
  feat_post_h3: "ساب ټایټلونه او د پروسس کولو وروسته",
  feat_post_1:
    "**ساب ټایټلونه** د SRT، VTT، یا ASS کې — لاسي یا اتوماتیک جوړ شوي، د هر شته ژبې کې",
  feat_post_2:
    "د ویډیو تر څنګ خوندي کړئ، `.mkv` کې ځای پر ځای کړئ، یا د `Subtitles/` فرعي فولډر کې سازمان ورکړئ",
  feat_post_3:
    "**SponsorBlock** — سپانسران، شمولې، وتلو، ځان-سپارښتنې پریږدئ یا د فصل نښه ورکړئ",
  feat_post_4:
    "**ځای پر ځای شوي میټاډاټا** — سرلیک، د اپلوډ نیټه، چینل، توضیح، تصویر، او د فصل نښانونه فایل ته لیکل کیږي",
  feat_sites_h3: "YouTube + ۲۰۰۰ سایټونه",
  feat_sites_1:
    "**YouTube، بشپړ** — Videos، Shorts، Channels، Playlists، YouTube Music، او Podcasts د لومړي ټولګي سرچینو په توګه اداره کیږي",
  feat_sites_2:
    "**۲۰۰۰+ نور سایټونه** د yt-dlp له لارې — Vimeo، Twitch، Twitter/X، TikTok، SoundCloud، Bandcamp، Bilibili، BBC iPlayer، archive.org، او ډیر نور",
  feat_sites_3:
    "**یوازې اوډیو او ساب ټایټلونه** د هر ملاتړ شوي سایټ پر مهال کار کوي، نه یوازې YouTube",
  feat_sites_4:
    "که یو سایټ بدل شي، yt-dlp اونیزه فکسونه لیږدوي او Arroxy د پیلولو پر مهال بائنري اوتومات تازه کوي",
  shot1_cap:
    "<b>د چټک ښکته کولو کور</b><br/>URL پیسټ کړئ او په خپل فعال پروفایل سره یې سمدلاسه ښکته کړئ",
  shot2_cap:
    "<b>د بیا کارونې وړ د ښکته کولو پروفایلونه</b><br/>بڼه، کیفیت او محصول د وړاندیز په توګه خوندي کړئ — په هر ښکته کولو کې یې بیا وکاروئ",
  shot3_cap: "<b>څو ژبني غږ مزي</b><br/>هغه دقیق غږ ژبه وټاکئ چې ویډیو یې لري",
  shot4_cap:
    "<b>Surround / Dolby غږ</b><br/>د 5.1 او Dolby مزي پیژندل کیږي او ساتل کیږي",
  shot5_cap:
    "<b>د ډله ییز URL حالت</b><br/>لیست پیسټ کړئ، په اتومات ډول نقلونه لرې کړئ، ټول یې په یوه وخت کې کتار کړئ",
  shot6_cap:
    "<b>موازي د ښکته کولو کتار</b><br/>د ژوندۍ پرمختیا سره په یوه وخت کې څو ښکته کول",
  dl_platform_col: "پلیټفارم",
  dl_format_col: "بڼه",
  dl_win_format: "نصب کوونکی (NSIS) یا پورټیبل `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` یا `.flatpak` (sandboxed)",
  dl_grab: "وروستۍ خپرونه واخلئ →",
  dl_pkg_h3: "د پیکیج مدیر له لارې نصب کول",
  dl_channel_col: "چینل",
  dl_command_col: "کمانډ",
  dl_win_h3: "Windows: نصب کوونکی د پورټیبل پرتله",
  dl_win_col_installer: "NSIS نصب کوونکی",
  dl_win_col_portable: "پورټیبل `.exe`",
  dl_win_r1: "نصب کولو ته اړتیا ده",
  dl_win_r1_installer: "هو",
  dl_win_r1_portable: "نه — له هر ځای چلیږي",
  dl_win_r2: "اتوماتیک تازه کول",
  dl_win_r2_installer: "✅ د اپ دننه",
  dl_win_r2_portable: "❌ لاسي ډاونلوډ",
  dl_win_r3: "د پیل سرعت",
  dl_win_r3_installer: "✅ ګړندي",
  dl_win_r3_portable: "⚠️ ورو سړه پیل",
  dl_win_r4: "د پیل مینو ته اضافه کوي",
  dl_win_r5: "اسانه لرې کول",
  dl_win_r5_portable: "❌ فایل حذف کړئ",
  dl_win_rec:
    "**سپارښتنه:** د اتوماتیک تازه کولو او ګړندي پیل لپاره د NSIS نصب کوونکی وکاروئ. د بې نصبه، بې ریجسټرۍ اختیار لپاره پورټیبل `.exe` وکاروئ.",
  dl_win_smartscreen_h4: "Windows SmartScreen خبرداری",
  dl_win_smartscreen_intro:
    'د لومړي پیلولو پر مهال ممکن وګورئ **"Windows protected your PC"** یا **"Unknown publisher."** دا د دواړو `Arroxy-win-x64-Setup.exe` او `Arroxy-win-x64-Portable.exe` پر لور پلي کیږي. Arroxy وړیا او خلاصه سرچینه ده او د Windows جوړونې د پیسو ورکولو سند سره کوډ لاسلیک شوي نه دي، له همدې امله SmartScreen یې بیرغ کوي. دا **اوتومات** معنی نه لري چې Arroxy خطرناک ده. د دوام لپاره:',
  dl_win_smartscreen_step1: "**More info** کلیک کړئ.",
  dl_win_smartscreen_step2: "**Run anyway** کلیک کړئ.",
  dl_win_smartscreen_official:
    "یوازې د رسمي GitHub Releases پاڼې نه Arroxy ډاونلوډ کړئ. که چیرې تاسو فایل د بل ویب پاڼې نه ترلاسه کولو وي یا چا درته لیږلی وي، هغه حذف کړئ او د رسمي سرچینې نه نوي نسخه ډاونلوډ کړئ. سرچینه کوډ عامه ده، نو که چیرې غواړئ کولی شئ پخپله یې وڅیړئ یا Arroxy جوړ کړئ.",
  dl_macos_h3: "د macOS پر لومړي پیل",
  dl_macos_warning:
    "Arroxy لاهم کوډ نه دی لاسلیک شوی، نو macOS Gatekeeper به تاسو ته د لومړي پیل پر مهال خبرداری درکوي. دا متوقع دی — دا د زیان نښه نه ده.",
  dl_macos_m1_h4: "د سیستم تنظیماتو طریقه (سپارښتنه شوې):",
  dl_macos_step1: "د Arroxy اپ آیکون ښي کلیک وکړئ او **Open** غوره کړئ.",
  dl_macos_step2:
    "د خبرداری ډیالوګ ښکاري — **Cancel** کلیک وکړئ (د *Move to Trash* کلیک مه کوئ).",
  dl_macos_step3: "**System Settings → Privacy & Security** خلاص کړئ.",
  dl_macos_step4:
    'د **Security** برخې ته سکرول وکړئ. تاسو به وګورئ *"Arroxy was blocked from use because it is not from an identified developer."*',
  dl_macos_step5:
    "**Open Anyway** کلیک وکړئ او د خپل پاسورډ یا Touch ID سره تایید کړئ.",
  dl_macos_after:
    "د ۵مې ګام وروسته، Arroxy نورمال خلاصیږي او خبرداری بیا نه ښکاري.",
  dl_macos_m2_h4: "د ټرمینل طریقه (پرمختللي):",
  dl_macos_note:
    "د macOS جوړونه د Apple Silicon او Intel رنرانو پر CI کیږي. که تاسو ستونزو سره مخ شئ، مهرباني وکړئ [یوه ستونزه خلاصه کړئ](../../issues) — د macOS کارونکو بازخورد فعاله د macOS ازموینې دورې بڼه ورکوي.",
  dl_linux_h3: "د Linux پر لومړي پیل",
  dl_linux_intro:
    "AppImages مستقیم چلیږي — هیڅ نصب کول نشته. تاسو یوازې اړتیا لرئ فایل د اجرا وړ نښه کړئ.",
  dl_linux_m1_text:
    "**د فایل مدیر:** د `.AppImage` ښي کلیک وکړئ → **Properties** → **Permissions** → **Allow executing file as program** فعال کړئ، بیا دوه ځله کلیک وکړئ.",
  dl_linux_m2_h4: "ټرمینل:",
  dl_linux_fuse_text: "که پیل لاهم ناکام شي، ممکن تاسو ته FUSE کمه وي:",
  dl_linux_flatpak_intro:
    "**Flatpak (sandboxed بدیل):** د ورته خپرونې پاڼې څخه `Arroxy-*.flatpak` ډاونلوډ کړئ.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "ولې ممکن خبرداری وګورئ",
  dl_warning_p1:
    "Arroxy خلاصه سرچینه او MIT-licensed ده. د Windows او macOS جوړونې **د کوډ لاسلیک شوي نه دي** — د Apple Developer ID او د Windows EV د کوډ لاسلیک کولو سندونه هر کال د سلو ډالرو لګښت لري، چې یو خپلواک پروژه له خپل ځان ادا کوي. پرته له هغو لاسلیکونو، د Windows SmartScreen او macOS Gatekeeper به تاسو ته د لومړي پیل پر مهال خبرداری درکوي. خبرداریونه دا معنی لري چې *ستاسو OS خپرنده نه پیژني* — دا معنی نه لري چې Arroxy malware دی.",
  dl_warning_p2:
    "درې طریقې چې پخپله Arroxy تصدیق کړئ، د لوړیدونکي دقت سره:\n\n- **سرچینه ولولئ.** هره کرښه پر [GitHub](https://github.com/antonio-orionus/Arroxy) ده او تاسو کولی شئ [له سرچینې جوړ کړئ](#tech).\n- **SHA256 وڅیړئ.** ستاسو فایل د خپور شوي [`SHA256SUMS`](../../releases/latest) سره سمول کړئ — لاندې [خپل ډاونلوډ تصدیق کړئ](#verify) وګورئ.\n- **د دریمې ډلې سکن چلوئ.** فایل [VirusTotal](https://www.virustotal.com) ته اپلوډ کړئ.",

  dl_win_first_h3: "Windows لومړی پیل",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" د "More info" لینک د روښانه کولو سره ډیالوګ',
  shot_smartscreen_run_alt:
    'SmartScreen د More info پراخولو وروسته ډیالوګ، د "Run anyway" تڼۍ ښودلو سره',
  dl_win_defender_h4: "که Windows Defender فایل بیرغ کوي یا لرې کوي",
  dl_win_defender_p:
    "د Defender د اټکل کولو میکانیزمونه ځینې وختونه بې لاسلیکه NSIS نصب کوونکي او Electron پورټیبل د شکمن وګڼي. که Defender `Arroxy-win-x64-Setup.exe` یا `Arroxy-win-x64-Portable.exe` قرنطین کوي، له **Windows Security → Virus & threat protection → Protection history** بیرته راولئ، بیا د Arroxy اجرایوي د مجاز توکي تحت **Manage settings → Add or remove exclusions** ووهئ. لکه SmartScreen، محرک د غیر موجوده خپرندې لاسلیک دی، نه کشف شوی malware.",

  dl_macos_first_h3: "macOS لومړی پیل",
  dl_macos_intro:
    "Arroxy لاهم د macOS لپاره کوډ لاسلیک شوی نه دی، نو Gatekeeper به لومړی پیل بند کوي. د مجاز کولو سمه لار ستاسو د macOS نسخې پورې اړه لري — Sequoia 15 د زوړ ښي-کلیک → Open بای‌پاس سخت کړ.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 او وروسته (اوسني)",
  dl_macos_sequoia_intro:
    "پر Sequoia 15 او نوو، ښي-کلیک → Open نور د ډیری قرنطین شوو اپلیکیشنونو لپاره Gatekeeper بای‌پاس نه کوي. پرځای یې د System Settings پینل وکاروئ:",
  dl_macos_sequoia_step1:
    "د نصب شوي DMG نه `Arroxy.app` د `/Applications` ته ډریګ کړئ.",
  dl_macos_sequoia_step2:
    "Arroxy دوه ځله کلیک وکړئ. د بند کولو ډیالوګ ښکاري — **Done** کلیک وکړئ (د *Move to Trash* کلیک مه کوئ).",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** خلاص کړئ او د **Security** برخې ته سکرول وکړئ. به وګورئ *"Arroxy was blocked to protect your Mac"* (یا نږدې ورته پیغام).',
  dl_macos_sequoia_step4:
    "**Open Anyway** کلیک وکړئ، د خپل پاسورډ یا Touch ID سره تایید کړئ، بیا Arroxy له `/Applications` بیا پیل کړئ.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 او مخکې",
  dl_macos_sonoma_step1:
    "د نصب شوي DMG نه `Arroxy.app` د `/Applications` ته ډریګ کړئ.",
  dl_macos_sonoma_step2:
    "د `/Applications` کې `Arroxy.app` ښي-کلیک (یا Control-کلیک) وکړئ او **Open** غوره کړئ.",
  dl_macos_sonoma_step3:
    "د خبرداری ډیالوګ اوس د **Open** تڼۍ لري — یې کلیک کړئ او تایید کړئ. Arroxy نورمال خلاصیږي او خبرداری بیا نه ښکاري.",
  dl_macos_damaged_h4:
    '"App is damaged" یا دوامداره Gatekeeper بند — د Terminal فکس',
  dl_macos_damaged_p:
    'که macOS ووایي *"Arroxy is damaged and can\'t be opened"*، یا د پورتني ګامونو هیڅ یو بند نه پاکوي، د DMG د قرنطین صفت لامل دی (ځینې براوزران او د macOS خپل د انتقال چلند یې ټاکي). د نصب شوي اپلیکیشن نه یې ووباسئ:',
  dl_macos_arch_note:
    "**Apple Silicon د Intel پرتله:** پر M-series Mac (M1 / M2 / M3 / M4)، `arm64` DMG ډاونلوډ کړئ. پر Intel Mac، `x64` DMG ډاونلوډ کړئ. د غلط جوړونې چلول د Rosetta له لارې لاهم کار کوي خو د پام وړ ورو دي.",

  dl_linux_first_h3: "Linux لومړی پیل",
  dl_linux_appimagelauncher:
    "**د ډیسکټاپ اختیاري یوځای کول:** یو ځل [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) نصب کړئ، او هر AppImage چې تاسو دوه ځله کلیک کوئ اتوماتیک ستاسو د لانچر مینو کې ثبتیږي — هیڅ لاسي `.desktop` فایل ته اړتیا نشته.",

  dl_verify_h3: "خپل ډاونلوډ تصدیق کړئ (SHA256)",
  dl_verify_intro:
    "هره خپرونه د binary سره یوځای `SHA256SUMS` فایل خپروي. د دې لپاره چې ستاسو ډاونلوډ د لیږد پر مهال خراب یا لاسوهنه شوی نه دی، خپل فایل ځایي کشف کړئ او د `SHA256SUMS` کرښه سره یې سمول کړئ. د وروستۍ خپرونې پاڼه خلاص کړئ → **Assets** → `SHA256SUMS` ډاونلوډ کړئ.",
  dl_verify_win_label: "Windows (PowerShell یا Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "د دریمې ډلې malware سکن غواړئ؟ فایل [VirusTotal](https://www.virustotal.com) کې اپلوډ کړئ. د کوچنیو انجنونو لخوا د عمومي اټکل کولو بیرغونه لږ شمیر د بې لاسلیکه Electron اپلیکیشنونو لپاره نورمال دي؛ د لوی انجنونو لخوا پراخه کشف کول به واقعي اندیښنه وي.",

  dl_pm_intro:
    "ایا لا مخکې پیکیج مدیر کاروئ؟ تاسو کولی شئ لاسي ډاونلوډ لار پریږدئ.",

  privacy_p1:
    "ډاونلوډونه مستقیما د [yt-dlp](https://github.com/yt-dlp/yt-dlp) له لارې له YouTube څخه هغه فولډر ته راوړل کیږي چې تاسو انتخاب کوئ — هیڅ شی د دریمې ډلې سرور له لارې نه تیریږي. د لیدلو تاریخ، ډاونلوډ تاریخ، URL، او د فایل منځپانګه ستاسو وسیله کې پاتې کیږي.",
  privacy_p2:
    "Arroxy د [OpenPanel](https://openpanel.dev) له لارې ناپیژندلې، ټولیزه ټیلیمیټري لېږي — یوازې د پیلونو، OS، د اپ نسخو او کریشونو د پوهېدو لپاره. URLs، د ویډیو سرلیکونه، د فایل لارې، د اکاونټ معلومات، fingerprinting یا شخصي معلومات نشته. د هر نصب ID تصادفي دی او ستاسو هویت سره نه تړل کېږي. تاسو یې په Settings کې بندولی شئ.",
  faq_q1: "ایا دا واقعیا وړیا ده؟",
  faq_a1: "هو — د MIT جواز، هیڅ پریمیم کچه، هیڅ د ځانګړتیا محدودیت نشته.",
  faq_q2: "کومې ویډیو کیفیتونه ډاونلوډ کولی شم؟",
  faq_a2:
    "هر هغه شی چې YouTube وړاندې کوي: 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، او یوازې اوډیو. 60 fps، 120 fps، او HDR سټریمونه لکه چې دي ساتل کیږي.",
  faq_q3: "ایا کولی شم یوازې اوډیو د MP3 په توګه وباسم؟",
  faq_a3:
    "هو. د format menu کې *یوازې آډیو* وټاکئ او بیا MP3، M4A/AAC، Opus یا WAV غوره کړئ.",
  faq_q4: "ایا ما ته د YouTube اکاونټ یا کوکیز ته اړتیا ده؟",
  faq_a4:
    "په ډیفالټ کې، نه — Arroxy د YouTube اکاونټ، ننوتلو، یا د کوکیز صادرولو پرته کار کوي. د کوکیز اختیاري ملاتړ په پرمختللو تنظیماتو کې شتون لري (د کوکیز سرچینه: فایل یا براوزر) د هغه منځپانګې لپاره چې اعتبار ته اړتیا لري، لکه د عمر محدودې یا یوازې د غړو ویډیوګانې. دا په ډیفالټ کې غیرفعاله ده. که تاسو یې فعاله کړئ، د yt-dlp ویکي یاد کوي چې [د کوکیز پر بنسټ اتومات کولی شي ستاسو د ګوګل اکاونټ بیرغ کړي](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)؛ په دې حالت کې یو لرې غورځولو وړ اکاونټ خوندي انتخاب دی.",
  faq_q5: "ایا کله چې YouTube یو شی بدل کوي کار کوي؟",
  faq_a5:
    "yt-dlp د لانچ پر مهال اتومات تازه کیږي، او Arroxy هغه وخت چې YouTube یو شی بدل کړي په چټکۍ سره فکسونه لیږدوي. که تاسو کله ستونزه لرئ، د کوکیز اختیاري ملاتړ په پرمختللو تنظیماتو کې د بیک اپ په توګه شتون لري.",
  faq_q6: "Arroxy د کومو ژبو لپاره شته دی؟",
  faq_a6:
    "یویشت، له صندوقه: English، Español (سپانوي)، Deutsch (جرماني)، Français (فرانسوي)، 日本語 (جاپاني)، 中文 (چیني)، Русский (روسي)، Українська (اوکراني)، हिन्दी (هندي)، Afaan Oromoo، Kiswahili، O'zbekcha (ازبکي)، Tiếng Việt (ویتنامي)، አማርኛ (امهاري)، العربية (عربي)، اردو، پښتو، বাংলা (بنګالي)، မြန်မာဘာသာ (برمي)، Ελληνικά (یوناني)، او Српски (سربي). Arroxy ستاسو د عملیاتي سیسټم ژبه د لومړي پیلولو پر مهال اوتومات کشفوي او تاسو کولی شئ هر وخت د ټول بار کې د ژبې پیک نه بدل کړئ. د runtime ژبو JSON فایلونه په src/shared/i18n/locales/ کې دي، او د ژباړونکو لپاره PO کتلاګونه په i18n/locales/ کې دي — د مرستې لپاره GitHub کې PR پرانیزئ.",
  faq_q7: "ایا ما ته بل شی نصب کولو ته اړتیا ده؟",
  faq_a7:
    "نه. yt-dlp د لومړي پیل پر مهال اوتومات ډاونلوډ او ستاسو په ماشین کې کېچ کېږي؛ ffmpeg او ffprobe د اپ سره راځي. له دې وروسته، کوم اضافي ترتیب ته اړتیا نشته.",
  faq_q8: "ایا کولی شم پلیلیسټونه یا ټول چینلونه ډاونلوډ کړم؟",
  faq_a8:
    "هو — دواړه. د playlist یا channel URL پیسټ کړئ (لکه `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`)؛ وټاکئ چې څو entries scan شي، بیا ټول لیست queue کړئ یا ځانګړي ویډیوګانې وټاکئ. د date-range filters ژر راځي.",
  faq_q9: 'macOS وايي "اپ خرابه ده" — څه وکړم؟',
  faq_a9:
    'دا macOS Gatekeeper دی چې بې لاسلیکه اپ بندوي، واقعي زیان نه دی. ["App is damaged" — Terminal fix](#macos-first-launch) وګورئ چې د یو کرښه `xattr` کمانډ چې یې پاکوي.',
  faq_q10: "ایا د YouTube ویډیوز ډاونلوډ کول قانوني دي؟",
  faq_a10:
    "د شخصي، خصوصي کارولو لپاره دا معمولا ډیرو قضایي سیمو کې منل کیږي. تاسو د YouTube د [د کارولو شرایطو](https://www.youtube.com/t/terms) او د خپل ځایني د کاپي رایټ قوانینو سره مطابقت لرل ستاسو مسؤلیت دی.",
  plan_intro: "لا هم پلان شوي — نږدې د لومړیتوب په ترتیب:",
  plan_col1: "ځانګړتیا",
  plan_col2: "توضیح",
  plan_r1_name: "**د پلیلیسټ او چینل فیلترونه**",
  plan_r1_desc: "د playlist یا channel د شمېرلو پر مهال date-range filters",
  plan_r2_name: "**د YouTube د غږ ټریک غوره توبونه**",
  plan_r2_desc:
    "کله چې YouTube څو غږیز ټریکونه وړاندې کوي، د ټول app لپاره د خبرې ژبې track غوره توب وټاکئ او د هر profile لپاره override وکړئ",
  plan_r6_name: "**په app کې دننه browser sign-in**",
  plan_r6_desc:
    "د Arroxy دننه browser windows پرانیزئ څو sign in وکړئ او site cookies د لاس له export پرته وکاروئ",
  plan_r8_name: "**یو-click ویډیو ډاونلوډ**",
  plan_r8_desc:
    "د active profile په کارولو detected یا pasted URL څخه ویډیو ډاونلوډ په یو click پیل کړئ",
  plan_r3_name: "**غښتلی retry recovery**",
  plan_r3_desc:
    "د بې ثباته یا ستونزمن internet connection له امله د پرې شویو ډاونلوډونو لپاره نوی retry لاره",
  plan_r4_name: "**بشپړ download manager drawer**",
  plan_r4_desc:
    "د queue drawer بشپړ manager ته اړول، د queued items لپاره destination folder بدلولو په ګډون",
  plan_r5_name: "**مهالویش شوي ډاونلوډونه**",
  plan_r5_desc: "کیو د ټاکلي وخت کې پیل کړئ (شپه اجرا کول)",
  plan_r7_name: "**د کلپ کمول**",
  plan_r7_desc: "یوازې د پیل/پای وخت له مخې یو برخه ډاونلوډ کړئ",
  plan_cta:
    "ذهن کې کومه ځانګړتیا لرئ؟ [یوه غوښتنه خلاصه کړئ](../../issues) — د ټولنې ننوتل لومړیتوب ورکوي.",
  tech_content: TECH_CONTENT,
  tos_h2: "د کارولو شرایط",
  tos_note:
    "Arroxy یوازې د شخصي، خصوصي کارولو لپاره یوه وسیله ده. تاسو یوازې مسؤل یاست چې ستاسو ډاونلوډونه د YouTube د [د کارولو شرایطو](https://www.youtube.com/t/terms) او ستاسو د قضایي سیمې د کاپي رایټ قوانینو سره مطابقت لري. د Arroxy د ډاونلوډ، تکرار، یا د هغه منځپانګې توزیع لپاره مه کاروئ چې تاسو حق نه لرئ وکاروئ. پراختیا کونکي د هر ناسم کارولو لپاره مسؤل نه دي.",
  footer_credit:
    'MIT License · د مینې سره جوړ شوی <a href="https://x.com/OrionusAI">@OrionusAI</a> لخوا',
};
