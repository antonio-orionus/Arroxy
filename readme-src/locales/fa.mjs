const TECH_CONTENT = `<details>
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
| Node.js | 24.16.0 | \`mise install\` یا \`.node-version\` |
| Bun | 1.2.23 | \`mise install\` یا \`package.json\` و \`packageManager\` |

پیشنهاد می‌شود \`mise\` را نصب کنید و سپس در checkout فرمان \`mise install\` را اجرا کنید. بدون mise، پیش از \`bun run bootstrap\` نسخهٔ Node.js را از \`.node-version\` و Bun را از \`package.json\` به‌صورت دستی فعال کنید.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

برای بازسازی وابستگی‌های native ممکن است Visual Studio Build Tools و Python لازم باشند.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

پس از clone، در checkout فرمان \`mise trust && mise install\` را اجرا کنید. اگر shell شما از قبل \`fnm\`، \`nvm\` یا Bun نصب‌شده با Homebrew را به کار می‌برد، mise را در \`~/.zshrc\` فعال کنید تا Arroxy از Node.js 24.16.0 و Bun 1.2.23 استفاده کند:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# وابستگی‌های ساخت و اجرای Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# فقط آزمون‌های E2E (Electron به نمایشگر نیاز دارد)
sudo apt install -y xvfb
\`\`\`

### clone و اجرا

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # پیشنهاد می‌شود؛ اگر نسخه‌های ثابت را دستی فعال کرده‌اید، رد کنید
bun run bootstrap
bun run doctor
bun run dev            # برنامهٔ Electron با renderer مبتنی بر Vite
\`\`\`

### ساخت بستهٔ قابل توزیع

\`\`\`bash
bun run build        # بررسی type + ساخت
bun run dist         # بستهٔ سیستم‌عامل فعلی
bun run dist:win     # ساخت هدف‌های Windows روی میزبان پشتیبانی‌شده
\`\`\`

> \`bun run bootstrap\` وابستگی‌ها را نصب می‌کند، وابستگی‌های برنامهٔ Electron را بازسازی و خود Electron را بررسی می‌کند، ffmpeg/ffprobe داخلی را برای توسعه آماده و Playwright Chromium را نصب می‌کند. yt-dlp هنگام اجرا در پوشهٔ دادهٔ برنامه مدیریت می‌شود؛ ffmpeg و ffprobe همراه هر انتشار Arroxy هستند.

</details>`;

export const fa = {
  icon_alt: "نماد Arroxy",
  title: "Arroxy — دانلودر رایگان و متن‌باز YouTube (و بیش از ۲۰۰۰ سایت) برای Windows، macOS و Linux",
  read_in_label: "مطالعه به زبان:",
  badge_release_alt: "انتشار",
  badge_build_alt: "ساخت",
  badge_license_alt: "مجوز",
  badge_platforms_alt: "پلتفرم‌ها",
  badge_i18n_alt: "زبان‌ها",
  badge_website_alt: "وب‌سایت",
  discord_badge_text: "به انجمن Discord بپیوندید",
  discord_badge_encoded: "%D8%A8%D9%87%20%D8%A7%D9%86%D8%AC%D9%85%D9%86%20Discord%20%D8%A8%D9%BE%DB%8C%D9%88%D9%86%D8%AF%DB%8C%D8%AF",
  hero_desc: "ویدیو، Shorts، موسیقی، کانال، پادکست یا قطعهٔ صوتی را از **YouTube و بیش از ۲۰۰۰ سایت پشتیبانی‌شده** دانلود کنید — تا کیفیت 4K HDR با ۶۰ فریم بر ثانیه، یا به‌صورت MP3 / AAC / Opus. برنامه روی Windows، macOS و Linux به‌صورت محلی اجرا می‌شود. **بدون تبلیغ، بدون امکانات اضافی بی‌فایده و بدون فروش اجباری.**",
  cta_latest: "↓ نصب آخرین نسخه",
  cta_website: "وب‌سایت",
  demo_alt: "نمایش Arroxy",
  star_cta: "اگر Arroxy در وقت شما صرفه‌جویی می‌کند، یک ⭐ کمک می‌کند دیگران هم آن را پیدا کنند.",
  ai_notice: "> 🌐 این ترجمه با کمک هوش مصنوعی تهیه شده است. [README انگلیسی](README.md) منبع معتبر است. خطایی پیدا کردید؟ [یک PR باز کنید](../../pulls).",
  toc_heading: "فهرست",
  why_h2: "چرا Arroxy",
  features_h2: "قابلیت‌ها",
  dl_h2: "نصب و نخستین اجرا",
  privacy_h2: "حریم خصوصی",
  faq_h2: "پرسش‌های متداول",
  roadmap_h2: "نقشهٔ راه",
  tech_h2: "فناوری‌های به‌کاررفته",
  why_intro: "مقایسهٔ مستقیم با رایج‌ترین گزینه‌های جایگزین:",
  why_r1: "رایگان، بدون سطح پولی",
  why_r2: "متن‌باز",
  why_r3: "پردازش فقط روی دستگاه",
  why_r4: "بدون ورود به حساب یا صادرکردن کوکی",
  why_r5: "بدون محدودیت استفاده",
  why_r6: "برنامهٔ دسکتاپ چندسکویی",
  why_r7: "زیرنویس + SponsorBlock",
  why_summary: "Arroxy برای یک کار ساخته شده است: نشانی را بچسبانید و یک فایل محلی تمیز تحویل بگیرید. بدون حساب، فروش اضافی یا جمع‌آوری داده.",
  feat_quality_h3: "کیفیت و قالب‌ها",
  feat_quality_1: "تا **4K UHD (2160p)**، همچنین 1440p، 1080p، 720p، 480p و 360p",
  feat_quality_2: "**نرخ فریم بالا** بدون تغییر حفظ می‌شود — 60 fps، 120 fps و HDR",
  feat_quality_3: "**صدا** — فقط صدا را به MP3، M4A/AAC، Opus یا WAV تبدیل کنید. در دانلود تعاملی، اگر موجود باشد قطعهٔ فراگیر/Dolby اصلی منبع (AC-3، E-AC-3، 5.1، DRC) را انتخاب کنید یا گزینهٔ سراسری **اولویت با صدای فراگیر / Dolby** را تنظیم کنید",
  feat_quality_4: "تنظیم‌های سریع: *بهترین کیفیت* · *متعادل* · *فایل کم‌حجم*",
  feat_privacy_h3: "حریم خصوصی و کنترل",
  feat_privacy_1: "پردازش ۱۰۰٪ محلی — دانلود مستقیماً از YouTube روی دیسک شما می‌رود",
  feat_privacy_2: "**متن‌باز** — همهٔ خطوط قابل بررسی، با مجوز MIT",
  feat_privacy_3: "فایل‌ها مستقیماً در پوشهٔ انتخابی شما ذخیره می‌شوند",
  feat_workflow_h3: "روند کار",
  feat_workflow_12: "**میان‌بر سراسری دانلود** — در هر برنامه‌ای پیوندی را کپی کنید و `Ctrl+Shift+D` (در macOS، `Cmd+Shift+D`) را بزنید؛ Arroxy بدون بازکردن پنجره آن را با نمایهٔ فعال به صف می‌فرستد و یک اعلان تأیید می‌کند. به‌طور پیش‌فرض فعال و قابل تغییر است",
  feat_workflow_1: "**روش‌های شروع انعطاف‌پذیر** — دانلود تکی راهنما‌دار، انتخابگر فهرست پخش/کانال، چسباندن گروهی نشانی‌ها یا دانلود سریع با پیش‌فرض‌های ذخیره‌شده را انتخاب کنید",
  feat_workflow_2: "**صف مرکزی دانلود** — کارهای تکی، فهرست پخش، گروهی و سریع همگی برای نمایش پیشرفت، مکث، ادامه، لغو، تلاش دوباره و تنظیم اولویت در یک جا قرار می‌گیرند",
  feat_workflow_3: "**پایش کلیپ‌بورد** — پیوند YouTube را کپی کنید تا هنگام بازگشت به برنامه، Arroxy نشانی را خودکار وارد کند (قابل تنظیم در تنظیمات پیشرفته)",
  feat_workflow_4: "**پاک‌سازی خودکار نشانی‌ها** — پارامترهای رهگیری (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) را حذف می‌کند و پیوندهای `youtube.com/redirect` را باز می‌کند",
  feat_workflow_5: "**حالت سینی سیستم** — با بستن پنجره، دانلودها در پس‌زمینه ادامه می‌یابند",
  feat_workflow_6: "**{{LANG_COUNT}} زبان** — زبان سیستم را خودکار تشخیص می‌دهد و هر زمان قابل تغییر است",
  feat_workflow_7: "**همگام‌سازی فهرست پخش** — فهرست را دوباره با یک پوشهٔ محلی مقایسه می‌کند تا ویدیوهای دانلودشده رد شوند؛ فایل فهرست پخش `.m3u` می‌سازد که پس از هر دانلود به‌روز می‌شود",
  feat_workflow_8: "**کنترل سرعت و فاصلهٔ درخواست‌ها** — پهنای باند را محدود کنید، شمار بخش‌های هم‌زمان هر ویدیو را تعیین کنید و با حالت‌های *خاموش · متعادل · محتاط · سفارشی* بین درخواست‌ها تأخیر بگذارید",
  feat_workflow_9: "**الگوهای نام فایل** — با `{title}`، `{uploader}`، `{id}`، `{date}`، `{resolution}` و `{playlist_index}` نام دلخواه بسازید؛ سراسری یا برای هر نمایه",
  feat_workflow_10: "**دانلود هم‌زمان و تلاش خودکار دوباره** — شمار دانلودهای هم‌زمان را تعیین کنید و بگذارید Arroxy دانلودی را که با مشکل شبکه یا سرور روبه‌رو شده، با فاصلهٔ بیشتر در هر نوبت دوباره امتحان کند",
  feat_workflow_11: "**نمایهٔ جدا برای هر مورد فهرست پخش** — به‌جای یک تنظیم برای همه، به هر ویدیو نمایهٔ خودش را بدهید تا برخی با کیفیت کامل بایگانی شوند و بقیه به MP3 تبدیل شوند",
  feat_post_h3: "زیرنویس و پس‌پردازش",
  feat_post_1: "**زیرنویس** در قالب SRT، VTT یا ASS — دستی یا خودکار و به هر زبان موجود",
  feat_post_2: "کنار ویدیو ذخیره کنید، در `.mkv` بگنجانید یا در زیرپوشهٔ `Subtitles/` مرتب کنید",
  feat_post_3: "**SponsorBlock** — بخش‌های تبلیغ، مقدمه، پایان و تبلیغ شخصی را رد کنید یا به‌صورت فصل علامت بزنید",
  feat_post_4: "**فرادادهٔ جاسازی‌شده** — عنوان، تاریخ بارگذاری، کانال، توضیح، تصویر بندانگشتی و نشانگر فصل در فایل نوشته می‌شوند",
  feat_sites_h3: "YouTube + ۲۰۰۰ سایت",
  feat_sites_1: "**پشتیبانی کامل YouTube** — ویدیوها، Shorts، کانال‌ها، فهرست‌های پخش، YouTube Music و پادکست‌ها منابع درجه‌یک هستند",
  feat_sites_2: "**بیش از ۲۰۰۰ سایت دیگر** با yt-dlp — Vimeo، Twitch، Twitter/X، TikTok، SoundCloud، Bandcamp، Bilibili، BBC iPlayer، archive.org و بسیاری دیگر",
  feat_sites_3: "**فقط صدا و زیرنویس** در همهٔ سایت‌های پشتیبانی‌شده کار می‌کند، نه فقط YouTube",
  feat_sites_4: "اگر سایتی تغییر کند، yt-dlp هر هفته اصلاحیه می‌دهد و Arroxy فایل اجرایی را هنگام شروع خودکار به‌روز می‌کند",
  shot1_cap: "<b>صفحهٔ دانلود سریع</b><br/>نشانی را بچسبانید و فوراً با نمایهٔ فعال دانلود کنید",
  shot2_cap: "<b>نمایه‌های دانلود قابل استفادهٔ دوباره</b><br/>قالب، کیفیت و مقصد را ذخیره و در هر دانلود استفاده کنید",
  shot3_cap: "<b>قطعه‌های صوتی چندزبانه</b><br/>زبان دقیق صدای همراه ویدیو را انتخاب کنید",
  shot4_cap: "<b>صدای فراگیر / Dolby</b><br/>قطعه‌های 5.1 و Dolby شناسایی و حفظ می‌شوند",
  shot5_cap: "<b>حالت نشانی‌های گروهی</b><br/>فهرستی را بچسبانید، موارد تکراری را خودکار حذف و همه را به صف اضافه کنید",
  shot6_cap: "<b>صف دانلود موازی</b><br/>چند دانلود هم‌زمان با پیشرفت زنده",
  hotkey_fig_alt: "میان‌بر سراسری دانلود Arroxy — Ctrl+Shift+D در Windows و Linux و Cmd+Shift+D در macOS که پیوند کپی‌شده را مستقیم به صف می‌فرستد",
  hotkey_fig_cap: "<b>میان‌بر سراسری دانلود</b><br/>هرجا پیوندی را کپی و یک بار کلیدها را بزنید؛ به صف می‌رود و دانلود آغاز می‌شود",
  shot7_cap: "<b>نمایهٔ جدا برای هر مورد فهرست پخش</b><br/>به هر ویدیو نمایهٔ خودش را بدهید؛ برخی را 4K و بقیه را MP3 بگیرید",
  dl_platform_col: "پلتفرم",
  dl_format_col: "دانلود مستقیم",
  dl_oneline_note: "اسکریپت Linux دانلود را با `SHA256SUMS` منتشرشده بررسی می‌کند و Arroxy را به منوی برنامه‌ها می‌افزاید. ساخت‌ها فقط برای x86_64 هستند. `curl` ندارید؟ `curl -fsSL` را با `wget -qO-` جایگزین کنید.",
  dl_win_scoop: "Scoop را ترجیح می‌دهید؟ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_grab: "همهٔ فایل‌های انتشار ←",
  dl_win_h3: "Windows: نصاب یا نسخهٔ همراه",
  dl_win_col_installer: "نصاب NSIS",
  dl_win_col_portable: "`.exe` همراه",
  dl_win_r1: "نیازمند نصب",
  dl_win_r1_installer: "بله",
  dl_win_r1_portable: "خیر — از هرجا اجرا کنید",
  dl_win_r2: "به‌روزرسانی خودکار",
  dl_win_r2_installer: "✅ درون برنامه",
  dl_win_r2_portable: "❌ دانلود دستی",
  dl_win_r3: "سرعت شروع",
  dl_win_r3_installer: "✅ سریع‌تر",
  dl_win_r3_portable: "⚠️ شروع سرد کندتر",
  dl_win_r4: "افزودن به منوی Start",
  dl_win_r5: "حذف آسان",
  dl_win_r5_portable: "❌ فایل را پاک کنید",
  dl_win_rec: "**پیشنهاد:** برای به‌روزرسانی خودکار و شروع سریع‌تر از نصاب NSIS استفاده کنید. اگر نصب و تغییر رجیستری نمی‌خواهید، نسخهٔ `.exe` همراه را بگیرید.",
  dl_win_smartscreen_intro: "در نخستین اجرا ممکن است پیام **\"Windows protected your PC\"** یا **\"Unknown publisher\"** را ببینید. این موضوع برای هر دو فایل `Arroxy-win-x64-Setup.exe` و `Arroxy-win-x64-Portable.exe` صدق می‌کند. Arroxy رایگان و متن‌باز است، اما ساخت‌های Windows با گواهی پولی امضا نشده‌اند و SmartScreen به همین دلیل هشدار می‌دهد. این هشدار لزوماً به معنی ناامن‌بودن Arroxy **نیست**. برای ادامه:",
  dl_win_smartscreen_step1: "روی **More info** کلیک کنید.",
  dl_win_smartscreen_step2: "روی **Run anyway** کلیک کنید.",
  dl_win_smartscreen_official: "Arroxy را فقط از صفحهٔ رسمی GitHub Releases دانلود کنید. اگر فایل را از سایت دیگری گرفته‌اید یا کسی برایتان فرستاده است، آن را حذف کنید و نسخه‌ای تازه از منبع رسمی بگیرید. کد منبع عمومی است؛ می‌توانید آن را بررسی کنید یا خودتان Arroxy را بسازید.",
  dl_macos_note: "ساخت‌های macOS در CI روی اجراکننده‌های Apple Silicon و Intel تولید می‌شوند. اگر مشکلی دیدید، [گزارش باز کنید](../../issues)؛ بازخورد کاربران macOS مستقیماً چرخهٔ آزمون را شکل می‌دهد.",
  dl_linux_intro: "AppImage بدون نصب مستقیماً اجرا می‌شود. فقط باید فایل را اجرایی کنید.",
  dl_linux_m1_text: "**مدیر فایل:** روی `.AppImage` راست‌کلیک کنید ← **Properties** ← **Permissions** ← گزینهٔ **Allow executing file as program** را فعال و سپس دوبار کلیک کنید.",
  dl_linux_m2_h4: "ترمینال:",
  dl_linux_fuse_text: "اگر باز هم اجرا نشد، آن را بدون mount اجرا کنید؛ بستهٔ FUSE لازم نیست:",
  dl_linux_targz_h4: "بستهٔ tar ساده (بدون FUSE و نصب):",
  dl_linux_targz_text: "ساخت `.tar.gz` همان برنامه بدون پوشش AppImage است؛ هرجا خواستید استخراج و اجرا کنید. نصاب یا FUSE لازم نیست.",
  dl_linux_flatpak_prereq: "Ubuntu به‌جای Flatpak با Snap عرضه می‌شود؛ ابتدا Flatpak را نصب و Flathub را اضافه کنید تا بسته runtime خود را از آنجا دریافت کند:",
  dl_linux_arch_note: "**دانلودهای Linux در صفحهٔ انتشار فقط برای x86_64 هستند.** روی دستگاه ARM64 (مانند Raspberry Pi و Asahi Linux)، Flatpak نصب می‌شود اما هنگام اجرا خطای `bwrap: execvp ldconfig: Exec format error` می‌دهد.",
  dl_linux_flatpak_intro: "**Flatpak (گزینهٔ sandbox):** فایل `Arroxy-linux-x64.flatpak` را از همان صفحهٔ انتشار بگیرید.",
  dl_warning_h3: "چرا ممکن است هشدار ببینید",
  dl_warning_p1: "Arroxy متن‌باز و دارای مجوز MIT است. ساخت‌های Windows و macOS **امضای کد ندارند**؛ گواهی‌های Apple Developer ID و امضای Windows EV هرکدام سالانه صدها دلار هزینه دارند که باید از جیب یک پروژهٔ مستقل پرداخت شود. بدون این امضاها، Windows SmartScreen و macOS Gatekeeper در نخستین اجرا هشدار می‌دهند. هشدار یعنی *سیستم‌عامل ناشر را نمی‌شناسد*، نه اینکه Arroxy بدافزار است.",
  dl_warning_p2: "سه روش برای بررسی Arroxy، از ساده تا دقیق:\n\n- **کد منبع را بخوانید.** همهٔ خطوط در [GitHub](https://github.com/antonio-orionus/Arroxy) هستند و می‌توانید برنامه را [از منبع بسازید](#tech).\n- **SHA256 را بررسی کنید.** فایل را با [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) منتشرشده تطبیق دهید؛ بخش [بررسی دانلود](#verify) را ببینید.\n- **از اسکن بیرونی استفاده کنید.** فایل را در [VirusTotal](https://www.virustotal.com) بارگذاری کنید.",
  dl_win_first_h3: "نخستین اجرا در Windows",
  shot_smartscreen_more_alt: "پنجرهٔ SmartScreen با پیام Windows protected your PC و پیوند More info مشخص‌شده",
  shot_smartscreen_run_alt: "پنجرهٔ بازشدهٔ SmartScreen با دکمهٔ Run anyway",
  dl_win_defender_h4: "اگر Windows Defender فایل را علامت زد یا حذف کرد",
  dl_win_defender_p: "روش‌های اکتشافی Defender گاهی نصاب NSIS و نسخهٔ همراه Electron بدون امضا را مشکوک می‌دانند. اگر `Arroxy-win-x64-Setup.exe` یا `Arroxy-win-x64-Portable.exe` قرنطینه شد، آن را از **Windows Security → Virus & threat protection → Protection history** بازیابی کنید و سپس فایل اجرایی Arroxy را در **Manage settings → Add or remove exclusions** به موارد مجاز بیفزایید. مانند SmartScreen، علت نبود امضای ناشر است، نه شناسایی بدافزار.",
  dl_macos_first_h3: "نخستین اجرا در macOS",
  dl_macos_intro: "ساخت‌های macOS در Arroxy امضای ad-hoc دارند اما Apple آن‌ها را notarize نکرده است؛ بنابراین Gatekeeper نخستین اجرا را با پیام *\"Arroxy.app\" Not Opened — Apple could not verify \"Arroxy.app\" is free of malware* مسدود می‌کند. یعنی macOS نمی‌تواند برنامه را نزد Apple بررسی کند، نه اینکه فایل مشکلی دارد. نصب با Homebrew این پنجره را نشان نمی‌دهد. اگر DMG را نصب کرده‌اید، یک فرمان ترمینال کافی است:",
  dl_macos_sequoia_step1: "`Arroxy.app` را از DMG بازشده به `/Applications` بکشید.",
  dl_macos_sequoia_step2: "Terminal را باز و این دو فرمان را اجرا کنید:",
  dl_macos_damaged_p: "فرمان نخست ویژگی قرنطینه‌ای را که macOS هنگام دانلود افزوده پاک می‌کند و فرمان دوم برنامه را اجرا می‌کند. معمولاً `sudo` لازم نیست، چون نسخهٔ `/Applications` متعلق به شماست؛ فقط در صورت خطای دسترسی آن را اضافه کنید.",
  dl_macos_arch_note: "**Apple Silicon یا Intel:** در Macهای سری M (M1 / M2 / M3 / M4) فایل DMG با `arm64` را بگیرید. در Macهای Intel، نسخهٔ `x64` را دانلود کنید. ساخت اشتباه با Rosetta هم اجرا می‌شود، اما به‌وضوح کندتر است.",
  dl_linux_first_h3: "نخستین اجرا در Linux",
  dl_linux_appimagelauncher: "**یکپارچه‌سازی اختیاری با دسکتاپ:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) را یک بار نصب کنید تا هر AppImage که دوبار کلیک می‌کنید، بدون ساخت دستی فایل `.desktop` در منوی برنامه‌ها ثبت شود.",
  dl_verify_h3: "بررسی دانلود (SHA256)",
  dl_verify_intro: "هر انتشار فایل `SHA256SUMS` را کنار فایل‌های اجرایی منتشر می‌کند. برای اطمینان از خراب یا دست‌کاری‌نشدن فایل در انتقال، hash را روی دستگاه محاسبه و با سطر متناظر در `SHA256SUMS` مقایسه کنید. صفحهٔ آخرین انتشار را باز کنید ← **Assets** ← `SHA256SUMS` را بگیرید.",
  dl_verify_win_label: "Windows (PowerShell یا Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text: "اسکن مستقل بدافزار می‌خواهید؟ فایل را در [VirusTotal](https://www.virustotal.com) بارگذاری کنید. چند هشدار اکتشافی عمومی از موتورهای کوچک برای برنامه‌های Electron بدون امضا عادی است؛ هشدار گسترده از موتورهای اصلی واقعاً نگران‌کننده خواهد بود.",
  privacy_p1: "دانلود با [yt-dlp](https://github.com/yt-dlp/yt-dlp) مستقیماً از YouTube به پوشهٔ انتخابی می‌رود و از سرور ثالث عبور نمی‌کند. سابقهٔ تماشا و دانلود، نشانی‌ها و محتوای فایل روی دستگاه شما می‌مانند.",
  privacy_p2: "Arroxy از طریق [OpenPanel](https://openpanel.dev) داده‌های آماری ناشناس و تجمیعی می‌فرستد؛ فقط به اندازه‌ای که یک پروژهٔ مستقل خطاها، crashها، بازخورد، سیستم‌عامل و نسخهٔ برنامه را بشناسد. هیچ نشانی، عنوان ویدیو، مسیر فایل، اطلاعات حساب، fingerprint یا دادهٔ شخصی ارسال نمی‌شود. شناسهٔ هر نصب تصادفی و بی‌ارتباط با هویت شماست. می‌توانید در تنظیمات آن را خاموش کنید.",
  faq_q1: "واقعاً رایگان است؟",
  faq_a1: "بله — مجوز MIT، بدون سطح پولی یا قابلیت قفل‌شده.",
  faq_q2: "چه کیفیت‌هایی را می‌توانم دانلود کنم؟",
  faq_a2: "هرچه YouTube ارائه دهد: 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p و فقط صدا. جریان‌های 60 fps، 120 fps و HDR بدون تغییر حفظ می‌شوند.",
  faq_q3: "می‌توانم فقط صدا را به‌صورت MP3 بگیرم؟",
  faq_a3: "بله. در منوی قالب *فقط صدا* را انتخاب کنید و MP3، M4A/AAC، Opus یا WAV را برگزینید.",
  faq_q4: "به حساب YouTube یا کوکی نیاز دارم؟",
  faq_a4: "در حالت پیش‌فرض خیر؛ Arroxy بدون حساب YouTube، ورود یا صادرکردن کوکی کار می‌کند. پشتیبانی اختیاری کوکی در تنظیمات پیشرفته (منبع کوکی: فایل یا مرورگر) برای محتوای نیازمند احراز هویت، مانند ویدیوهای دارای محدودیت سنی یا ویژهٔ اعضا، وجود دارد و پیش‌فرض خاموش است. اگر آن را روشن کنید، راهنمای yt-dlp یادآور می‌شود که [اتوماسیون مبتنی بر کوکی ممکن است باعث علامت‌گذاری حساب Google شود](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)؛ در این حالت حساب موقت امن‌تر است.",
  faq_q5: "وقتی YouTube چیزی را تغییر دهد باز هم کار می‌کند؟",
  faq_a5: "yt-dlp هنگام شروع خودکار به‌روز می‌شود و Arroxy پس از تغییرات YouTube سریع اصلاحیه می‌دهد. اگر باز هم مشکلی پیش آمد، پشتیبانی اختیاری کوکی در تنظیمات پیشرفته راه‌حل جایگزین است.",
  faq_q6: "Arroxy به چه زبان‌هایی در دسترس است؟",
  faq_a6: "{{LANG_COUNT}} زبان آمادهٔ استفاده: {{LANG_NAME_LIST}}. Arroxy در نخستین اجرا زبان سیستم‌عامل را خودکار تشخیص می‌دهد و هر زمان می‌توانید آن را از انتخابگر زبان نوار ابزار عوض کنید. JSONهای زبان زمان اجرا در src/shared/i18n/locales/ و کاتالوگ‌های PO مترجمان در i18n/locales/ هستند؛ برای مشارکت در GitHub یک PR باز کنید.",
  faq_q7: "لازم است چیز دیگری نصب کنم؟",
  faq_a7: "خیر. yt-dlp در نخستین اجرا خودکار دانلود و روی دستگاه cache می‌شود؛ ffmpeg و ffprobe همراه برنامه هستند. پس از آن تنظیم اضافه‌ای لازم نیست.",
  faq_q8: "می‌توانم فهرست پخش یا یک کانال کامل را دانلود کنم؟",
  faq_a8: "بله، هر دو. نشانی فهرست یا کانال را بچسبانید (مانند `youtube.com/@handle`، `/channel/UC…`، `/c/Name`، `/user/Old`)، تعداد موارد بررسی را انتخاب کنید و سپس کل فهرست یا ویدیوهای مشخص را به صف بفرستید. فیلتر بازهٔ تاریخ به‌زودی می‌آید.",
  faq_q9: "macOS می‌گوید «برنامه آسیب‌دیده است»؛ چه کنم؟",
  faq_a9: "این Gatekeeper است که برنامهٔ بدون امضا را مسدود می‌کند، نه آسیب واقعی. فرمان‌های ترمینال برای پاک‌کردن قرنطینه و اجرای Arroxy را در [نخستین اجرا در macOS](#macos-first-launch) ببینید.",
  faq_q10: "دانلود ویدیوهای YouTube قانونی است؟",
  faq_a10: "برای استفادهٔ شخصی و خصوصی در بیشتر حوزه‌های قضایی عموماً پذیرفته می‌شود. مسئولیت رعایت [شرایط استفاده](https://www.youtube.com/t/terms) YouTube و قوانین حق نشر محل زندگی با شماست.",
  plan_intro: "موارد برنامه‌ریزی‌شده، تقریباً به ترتیب اولویت:",
  plan_col1: "قابلیت",
  plan_col2: "توضیح",
  plan_r1_name: "**فیلتر فهرست پخش و کانال**",
  plan_r1_desc: "فیلتر بازهٔ تاریخ هنگام خواندن فهرست پخش یا کانال",
  plan_r2_name: "**اولویت زبان قطعهٔ صوتی YouTube**",
  plan_r2_desc: "تعیین زبان گفتار ترجیحی برای کل برنامه با امکان تغییر در هر نمایه، وقتی YouTube چند قطعه دارد",
  plan_r6_name: "**ورود با مرورگر درون برنامه**",
  plan_r6_desc: "بازکردن مرورگر در Arroxy برای ورود و استفاده از کوکی سایت بدون صادرکردن دستی",
  plan_r8_name: "**دانلود ویدیو با یک کلیک**",
  plan_r8_desc: "شروع دانلود نشانی تشخیص‌داده یا چسبانده‌شده با نمایهٔ فعال در یک کلیک",
  plan_r3_name: "**بازیابی قوی‌تر با تلاش دوباره**",
  plan_r3_desc: "مسیر تازه برای تکرار دانلودهایی که اینترنت ناپایدار یا مشکل‌دار قطع کرده است",
  plan_r4_name: "**پنل کامل مدیریت دانلود**",
  plan_r4_desc: "تبدیل پنل صف به مدیر کامل‌تر، از جمله تغییر پوشهٔ مقصد موارد در صف",
  plan_r5_name: "**دانلود زمان‌بندی‌شده**",
  plan_r5_desc: "شروع صف در زمان مشخص، مثلاً شب",
  plan_r7_name: "**برش کلیپ**",
  plan_r7_desc: "دانلود فقط یک بخش با زمان آغاز و پایان",
  plan_cta: "قابلیتی در ذهن دارید؟ [درخواست باز کنید](../../issues)؛ نظر انجمن اولویت‌ها را شکل می‌دهد.",
  dl_win_format: "نصاب (NSIS) یا `.exe` همراه",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` یا `.flatpak` (sandbox)",
  dl_pkg_h3: "نصب با مدیر بسته",
  dl_channel_col: "کانال",
  dl_command_col: "فرمان",
  dl_win_smartscreen_h4: "هشدار Windows SmartScreen",
  dl_macos_h3: "نخستین اجرا در macOS",
  dl_macos_warning: "Arroxy هنوز امضای کد ندارد؛ بنابراین macOS Gatekeeper ممکن است در نخستین اجرا هشدار آسیب‌دیدن برنامه را نشان دهد. این رفتار عادی است و به معنی آسیب واقعی فایل نیست.",
  dl_macos_m1_h4: "روش ترمینال:",
  dl_macos_step1: "`Arroxy.app` را از DMG بازشده به `/Applications` بکشید.",
  dl_macos_step2: "Terminal را باز و `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` را اجرا کنید.",
  dl_macos_step3: "`open /Applications/Arroxy.app` را اجرا کنید.",
  dl_macos_step4: "اگر مسیر برنامه متفاوت است، `/Applications/Arroxy.app` را با مسیر نصب جایگزین کنید.",
  dl_macos_step5: "اگر `sudo` درخواست کرد، گذرواژهٔ Mac را وارد کنید.",
  dl_macos_after: "پس از حذف قرنطینه، Arroxy عادی باز می‌شود.",
  dl_macos_m2_h4: "روش ترمینال:",
  dl_linux_h3: "نخستین اجرا در Linux",
  dl_macos_sequoia_h4: "راه‌حل ترمینال برای macOS کنونی",
  dl_macos_sequoia_intro: "پس از کپی Arroxy به Applications از Terminal استفاده کنید:",
  dl_macos_sequoia_step3: "برای اجرای Arroxy، `open /Applications/Arroxy.app` را اجرا کنید.",
  dl_macos_sequoia_step4: "اگر مسیر برنامه متفاوت است، `/Applications/Arroxy.app` را با مسیر نصب جایگزین کنید.",
  dl_macos_sonoma_h4: "راه‌حل ترمینال برای macOS قدیمی‌تر",
  dl_macos_sonoma_step1: "`Arroxy.app` را از DMG بازشده به `/Applications` بکشید.",
  dl_macos_sonoma_step2: "Terminal را باز و قرنطینه را از `/Applications/Arroxy.app` حذف کنید.",
  dl_macos_sonoma_step3: "پس از حذف قرنطینه، Arroxy را از Terminal یا Finder اجرا کنید.",
  dl_macos_damaged_h4: "رفع قرنطینهٔ Gatekeeper",
  dl_pm_intro: "از قبل مدیر بسته دارید؟ می‌توانید دانلود دستی را رد کنید.",
  tech_content: TECH_CONTENT,
  support_h2: "پشتیبانی از Arroxy",
  support_note: "Arroxy رایگان و دارای مجوز MIT است؛ بدون تبلیغ و سطح پولی. اگر در وقتتان صرفه‌جویی می‌کند، می‌توانید با Bitcoin یا Tron از توسعه پشتیبانی کنید. نشانی‌ها در [DONATE.md](DONATE.md) هستند که تنها منبع رسمی است. Arroxy هرگز نشانی را با ایمیل یا پیام مستقیم نمی‌فرستد. ستاره‌دادن به مخزن، گزارش خطا و بهبود ترجمه‌ها نیز به همان اندازه کمک می‌کند.",
  tos_h2: "شرایط استفاده",
  tos_note: "Arroxy ابزاری فقط برای استفادهٔ شخصی و خصوصی است. مسئولیت اطمینان از سازگاری دانلودها با [شرایط استفاده](https://www.youtube.com/t/terms) YouTube و قوانین حق نشر حوزهٔ قضایی شما فقط بر عهدهٔ خودتان است. Arroxy را برای دانلود، تکثیر یا توزیع محتوایی که حق استفاده از آن را ندارید به کار نبرید. توسعه‌دهندگان مسئول سوءاستفاده نیستند.",
  footer_credit: 'مجوز MIT · ساخته‌شده با دقت توسط <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
