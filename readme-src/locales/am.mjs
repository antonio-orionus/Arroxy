const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — ለሁሉም ዓይነት ሥርዓተ ክወና የሚሠራ የዴስክቶፕ ቅጥፈት
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — ቅጥ አሠጣጥ
- **Zustand** — የሁኔታ አስተዳደር
- **yt-dlp** + **ffmpeg** — የማውረድ እና ማዋሃጃ ሞተር (በመጀመሪያ አስጀማሪ ከ GitHub ይወርዳሉ፣ ሁልጊዜ ወቅታዊ)
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

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

ምንም ዓይነት ተወላጅ የግንባታ መሣሪያዎች አያስፈልጉም — ፕሮጀክቱ ምንም ዓይነት ተወላጅ Node ማስጨበጫዎች የለውም።

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### ቅዳና አሂድ

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### ሊሰራጭ የሚችል ፋይል ምንጭ

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # cross-compile Windows portable exe
\`\`\`

> yt-dlp እና ffmpeg አያካተቱም — በመጀመሪያ አስጀማሪ ከዕውቅ GitHub ስሪቶቻቸው ይወርዳሉ እናም በአፕ ዳታ አቃፊዎ ውስጥ ይቀመጣሉ።

</details>`;

export const am = {
  icon_alt: "የ Arroxy መሸፈኛ",
  title: "Arroxy — ነፃ ምን ኮድ ያለው YouTube አውራጅ ለ Windows, macOS እና Linux",
  read_in_label: "አንብብ በ:",
  badge_release_alt: "ስሪት",
  badge_build_alt: "ግንባታ",
  badge_license_alt: "ፈቃድ",
  badge_platforms_alt: "ሥርዓቶች",
  badge_i18n_alt: "ቋንቋዎች",
  badge_website_alt: "ድር ጣቢያ",
  hero_desc:
    "ማንኛውንም YouTube ቪዲዮ፣ Short፣ ወይም የድምፅ ትራክ በዋናው ጥራት ያውርዱ — እስከ 4K HDR በ60 fps፣ ወይም MP3 / AAC / Opus። በ Windows፣ macOS፣ እና Linux ላይ አካባቢያዊ ሆኖ ይሠራል። **ምንም ማስታወቂያ፣ ምንም ግባ፣ ምንም ብሮውዘር ኩኪ፣ ምንም Google ሂሳብ አልተያያዘም።**",
  cta_latest: "↓ የቅርብ ጊዜ ስሪት አውርድ",
  cta_website: "ድር ጣቢያ",
  demo_alt: "የ Arroxy ማሳያ",
  star_cta: "Arroxy ጊዜ ካስቆጠበዎ፣ ⭐ ሌሎች እንዲያገኙት ይረዳል።",
  ai_notice: "",
  toc_heading: "ዝርዝር",
  why_h2: "ለምን Arroxy",
  nocookies_h2: "ምንም ኩኪ፣ ምንም ግባ፣ ምንም ሒሳብ ትስስር",
  features_h2: "ባህሪያት",
  dl_h2: "አውርድ",
  privacy_h2: "ግላዊነት",
  faq_h2: "ተደጋጋሚ ጥያቄዎች",
  roadmap_h2: "ወደፊት ዕቅድ",
  tech_h2: "ከምን ተሠርቷል",
  why_intro: "ከተለመዱ አማራጮች ጋር ጎን ለጎን ማወዳደሪያ:",
  why_r1: "ነፃ፣ ምንም ፕሪሚየም ደረጃ የለም",
  why_r2: "ምን ኮድ ያለው",
  why_r3: "አካባቢያዊ ሂደት ብቻ",
  why_r4: "ምንም ግባ ወይም ኩኪ ላክ",
  why_r5: "ምንም የአጠቃቀም ወሰን",
  why_r6: "ለሁሉም ዓይነት ሥርዓቶች የሚሠራ የዴስክቶፕ አፕ",
  why_r7: "ንዑስ ርዕሶች + SponsorBlock",
  why_summary:
    "Arroxy ለአንድ ነገር ብቻ ተሠርቷል: URL ይለጥፉ፣ ንጹህ አካባቢያዊ ፋይል ያግኙ። ምንም ሒሳቦች፣ ምንም ሽያጭ፣ ምንም የዳታ ስብስብ።",
  nocookies_intro:
    "ይህ የዴስክቶፕ YouTube አውራጆች ብዙ ጊዜ የሚሰናከሉበት ዋና ምክንያት ነው — እናም Arroxy ለምን እንደተፈጠረ ዋና ምክንያቱ ይሄ ነው።",
  nocookies_setup:
    "YouTube የቦት ማወቂያ ሲያዘምን፣ አብዛኛዎቹ ሶፍትዌሮች እንደ ዙርያ አፍ ብሮውዘርዎ YouTube ኩኪዎችን ለማሳወቅ ይነግሩዎታል። ሁለት ችግሮች ከዚህ ጋር አሉ:",
  nocookies_p1:
    "የተላኩ ክፍለ ጊዜዎች በተለምዶ በ~30 ደቂቃ ውስጥ ያበቃሉ፣ ስለዚህ ሁልጊዜ ይልካሉ።",
  nocookies_p2:
    "yt-dlp ራሱ [ኩኪ ላይ የሚመሠረት አውቶሜሽን Google ሒሳብዎን ሊለይ ይችላል ሲል ያስጠነቅቃል](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)።",
  nocookies_outro:
    "**Arroxy ምንም ጊዜ ኩኪዎችን፣ ግቦችን ወይም ምስክርነቶችን አይጠይቅም።** YouTube ለማንኛውም ብሮውዘር የሚሰጣቸውን ህዝባዊ ቶኬኖች ብቻ ይጠቀማል። ከ Google ማንነትዎ ጋር ምንም ትስስር የለም፣ ሊቋርጥ የሚችል ምንም የለም፣ ሊቀያየር የሚችል ምንም የለም።",
  feat_quality_h3: "ጥራት እና ቅርጸቶች",
  feat_quality_1: "እስከ **4K UHD (2160p)**፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p",
  feat_quality_2: "**ፈጣን የፍሬም ፍጥነት** እንዳለ ተጠብቆ — 60 fps፣ 120 fps፣ HDR",
  feat_quality_3: "**ድምፅ ብቻ** ወደ MP3፣ AAC፣ ወይም Opus ላክ",
  feat_quality_4: "ፈጣን ቅድመ ቅንብሮች: *ምርጥ ጥራት* · *ሚዛናዊ* · *ትንሽ ፋይል*",
  feat_privacy_h3: "ግላዊነት እና ቁጥጥር",
  feat_privacy_1:
    "100% አካባቢያዊ ሂደት — ማውረዶች ቀጥታ ከ YouTube ወደ ዲስክዎ ይሄዳሉ",
  feat_privacy_2: "ምንም ግባ፣ ምንም ኩኪ፣ ምንም Google ሒሳብ አልተያያዘም",
  feat_privacy_3: "ፋይሎች ወደ መረጡት አቃፊ ቀጥታ ተቀምጠዋል",
  feat_workflow_h3: "የሥራ ፍሰት",
  feat_workflow_1:
    "**ማንኛውም YouTube URL ይለጥፉ** — ቪዲዮዎች እና Shorts ሁለቱም ይደገፋሉ",
  feat_workflow_2:
    "**ብዙ ማውረድ ወረፋ** — ብዙ ማውረዶችን አንድ ጊዜ ይከታተሉ",
  feat_workflow_3:
    "**ክሊፕቦርድ ክትትል** — YouTube ሊንክ ቅዱ እና Arroxy ወደ አፕ ሲመለሱ URL ን አውቶሜቲክ ይሙላሉ (በ Advanced settings ውስጥ ያብሩ/ያጥፉ)",
  feat_workflow_4:
    "**URL ን ራስ ሰር ያጥሩ** — ትራኪንግ ፓራሜትሮችን (`si`፣ `pp`፣ `utm_*`፣ `fbclid`፣ `gclid`) ያስወግዳሉ እና `youtube.com/redirect` ሊንኮችን ያሰናስሉ",
  feat_workflow_5:
    "**ትሬ ሁነታ** — መስኮቱን መዝጋት ማውረዶቹን በጀርባ ያስቀጥላሉ",
  feat_workflow_6:
    "**9 ቋንቋዎች** — የሥርዓት ቋንቋ ራስ ሰር ያውቃሉ፣ ሁልጊዜ መቀየር ይቻላሉ",
  feat_post_h3: "ንዑስ ርዕሶች እና ድህረ-ሂደት",
  feat_post_1:
    "**ንዑስ ርዕሶች** በ SRT፣ VTT፣ ወይም ASS — እጅ ወይም ራስ ሰር የተፈጠሩ፣ በማንኛውም ቋንቋ",
  feat_post_2:
    "ከቪዲዮ ጎን ያቆዩ፣ ወደ `.mkv` ያካቱ፣ ወይም ወደ `Subtitles/` ንዑስ አቃፊ ያዘጋጁ",
  feat_post_3:
    "**SponsorBlock** — ስፖንሰሮችን፣ ምዕራፍ ምልክቶችን፣ ወደፊት ምዕራፎችን፣ ራስ ሰር ማስታወቂያዎችን ዝለሉ ወይም ምዕራፍ ምልክት ያድርጉ",
  feat_post_4:
    "**የተካተተ ሜታዳታ** — ርዕስ፣ የሰቀሉ ቀን፣ ቻናል፣ ዝርዝር፣ አናት ስእል፣ እና ምዕራፍ ምልክቶች ወደ ፋይሉ ተጽፈዋል",
  shot1_alt: "URL ይለጥፉ",
  shot2_alt: "ጥራትዎን ይምረጡ",
  shot3_alt: "የሚቀምጡበት ቦታ ይምረጡ",
  shot4_alt: "የማውረድ ወረፋ እርምጃ ላይ",
  shot5_alt: "የንዑስ ርዕስ ቋንቋ እና ቅርጸት መምረጫ",
  dl_platform_col: "ሥርዓተ ክወና",
  dl_format_col: "ቅርጸት",
  dl_win_format: "ጫኝ (NSIS) ወይም ተጓዥ `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ወይም `.flatpak` (ለቅርቅብ)",
  dl_grab: "የቅርብ ጊዜ ስሪት ይያዙ →",
  dl_pkg_h3: "በፓኬጅ አስተዳዳሪ ጫን",
  dl_channel_col: "ቻናል",
  dl_command_col: "ትዕዛዝ",
  dl_win_h3: "Windows: ጫኝ vs ተጓዥ",
  dl_win_col_installer: "NSIS ጫኝ",
  dl_win_col_portable: "ተጓዥ `.exe`",
  dl_win_r1: "ጫሌ ያስፈልጋል",
  dl_win_r1_installer: "አዎ",
  dl_win_r1_portable: "አይ — ከየትኛውም ቦታ አሂዱ",
  dl_win_r2: "ራስ ሰር ዝማኔዎች",
  dl_win_r2_installer: "✅ በአፕ ውስጥ",
  dl_win_r2_portable: "❌ እጅ ማውረድ",
  dl_win_r3: "የጅምር ፍጥነት",
  dl_win_r3_installer: "✅ ፈጣን",
  dl_win_r3_portable: "⚠️ ዘገምተኛ ቀዝቃዛ ጅምር",
  dl_win_r4: "ወደ ጅምር ምናሌ ይጨምራሉ",
  dl_win_r5: "ቀላል ማስወገጃ",
  dl_win_r5_portable: "❌ ፋይሉን ሰርዙ",
  dl_win_rec:
    "**ምክር:** ለራስ ሰር ዝማኔዎች እና ፈጣን ጅምር NSIS ጫኝ ይጠቀሙ። ምንም ጫሌ፣ ምንም ሬጂስትሪ ለሌለው አማራጭ ተጓዥ `.exe` ይጠቀሙ።",
  dl_macos_h3: "በ macOS ላይ ለመጀመሪያ ጊዜ አስጀምር",
  dl_macos_warning:
    "Arroxy ገና ኮድ አልተፈረመበትም፣ ስለዚህ macOS Gatekeeper በመጀመሪያ አስጀማሪ ሲያስጠነቅቅዎ ይጠብቁ። ይህ ተጠበቀ ነው — የጉዳት ምልክት አይደለም።",
  dl_macos_m1_h4: "የሥርዓት ቅንብሮች ዘዴ (ምከረ):",
  dl_macos_step1: "የ Arroxy አፕ አዶ ላይ ቀኝ ጠቅ ያድርጉ እና **Open** ይምረጡ።",
  dl_macos_step2:
    "የማስጠንቀቂያ መልዕክት ሳጥን ይታያሉ — **Cancel** ጠቅ ያድርጉ (*Move to Trash* አይጫኑ)።",
  dl_macos_step3: "**System Settings → Privacy & Security** ይክፈቱ።",
  dl_macos_step4:
    "ወደ **Security** ክፍል ያሸብልሉ። *\"Arroxy was blocked from use because it is not from an identified developer.\"* ያዩሉ።",
  dl_macos_step5:
    "**Open Anyway** ጠቅ ያድርጉ እና በይለፍ ቃልዎ ወይም Touch ID ያረጋግጡ።",
  dl_macos_after:
    "ደረጃ 5 ከተከናወነ በኋላ፣ Arroxy በተለምዶ ይከፈቱ እናም ማስጠንቀቂያ ሁሌ አይታዩም።",
  dl_macos_m2_h4: "የቴርሚናል ዘዴ (ተሂሳዊ):",
  dl_macos_note:
    "macOS ሕንጻዎች ከ Apple Silicon እና Intel ሩጫዎች በ CI ላይ ይሠራሉ። ችግር ካጋጠምዎ፣ [ጉዳይ ይክፈቱ](../../issues) — ከ macOS ተጠቃሚዎች ያለው ምላሽ የ macOS ፈተና ዑደቱን ቀጥታ ይቀርፃሉ።",
  dl_linux_h3: "በ Linux ላይ ለመጀመሪያ ጊዜ አስጀምር",
  dl_linux_intro:
    "AppImages ቀጥታ ይሠራሉ — ምንም ጫሌ አያስፈልጋቸውም። ፋይሉን ሊፈጸም እንደሚችል ብቻ ምልክት ማድረግ ያስፈልጋሉ።",
  dl_linux_m1_text:
    "**ፋይል አስተዳዳሪ:** `.AppImage` ላይ ቀኝ ጠቅ ያድርጉ → **Properties** → **Permissions** → **Allow executing file as program** ያብሩ፣ ከዛ ሁለቴ ጠቅ ያድርጉ።",
  dl_linux_m2_h4: "ቴርሚናል:",
  dl_linux_fuse_text: "አስጀምሩ አሁንም ሳይሠራ ቢቀር፣ FUSE ጎደለ ሊሆን ይችላሉ:",
  dl_linux_flatpak_intro:
    "**Flatpak (ለቅርቅብ አማራጭ):** `Arroxy-*.flatpak` ን ከተመሳሳዩ ስሪት ገጽ ያውርዱ።",
  privacy_p1:
    "ማውረዶቹ ቀጥታ በ [yt-dlp](https://github.com/yt-dlp/yt-dlp) ከ YouTube ወደ መረጡት አቃፊ ይወርዳሉ — ምንም ሦስተኛ ወገን ሰርቨር አይሆንም። የእይታ ታሪክ፣ የማውረድ ታሪክ፣ URLs፣ እና የፋይሎቹ ይዘቶች በመሳሪያዎ ላይ ይቆያሉ።",
  privacy_p2:
    "Arroxy ሳያውቁ፣ ሰብሰቦ የቴሌሜትሪ ውሂብ ወደ [Aptabase](https://aptabase.com) ይልካሉ — ምን ጥቅም ላይ እንዳለ ለማየት ብቻ (ጅምሮች፣ ሥርዓተ ክወና፣ አፕ ስሪት፣ ብልሽቶች)። ምንም URLs፣ ምንም ቪዲዮ ርዕሶች፣ ምንም የፋይል ዱካዎች፣ ምንም IP አድራሻዎች፣ ምንም ሒሳብ መረጃ — Aptabase ምን ኮድ ያለው እና ዲዛይን ሆኖ GDPR-ምቹ ነው። ቅንብሮቹ ውስጥ መቃወም ይቻሉ።",
  faq_q1: "በርግጥ ነፃ ነው?",
  faq_a1: "አዎ — MIT ፈቃድ አለው፣ ምንም ፕሪሚየም ደረጃ፣ ምንም ባህሪ ቁጥጥር የለም።",
  faq_q2: "ምን ዓይነት ቪዲዮ ጥራቶች ማውረድ እችላሉ?",
  faq_a2:
    "YouTube የሚሰጣቸው ሁሉ: 4K UHD (2160p)፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p፣ እና ድምፅ ብቻ። 60 fps፣ 120 fps፣ እና HDR ዥረቶች እንዳሉ ይጠበቃሉ።",
  faq_q3: "ድምፁን ብቻ MP3 አድርጎ ማቅረብ ይቻላሉ?",
  faq_a3: "አዎ። ከቅርጸት ምናሌ *ድምፅ ብቻ* ይምረጡ እና MP3፣ AAC፣ ወይም Opus ይምረጡ።",
  faq_q4: "YouTube ሒሳብ ወይም ኩኪዎች ያስፈልጉናሉ?",
  faq_a4:
    "አይ። Arroxy YouTube ለማንኛውም ብሮውዘር የሚሰጣቸውን ህዝባዊ ቶኬኖች ብቻ ይጠቀማሉ። ምንም ኩኪ፣ ምንም ግባ፣ ምንም የተቀመጡ ምስክርነቶች። ለምን ይህ ጠቃሚ እንደሆነ [ምንም ኩኪ፣ ምንም ግባ፣ ምንም ሒሳብ ትስስር](#no-cookies) ይመልከቱ።",
  faq_q5: "YouTube ሲቀያየር አሁንም ይሠራሉ?",
  faq_a5:
    "ሁለት የጥንካሬ ሽፋኖች: yt-dlp የ YouTube ለውጦቹ ከደረሱ ከጥቂት ሰዓት ውስጥ ያዘምናሉ፣ እናም Arroxy በ~30 ደቂቃ ውስጥ ሊቋርጡ በሚችሉ ኩኪዎች አይመሠረቱም። ይህ ከምን ኮድ ያለው ብሮውዘር ክፍለ ጊዜዎች ላይ ከሚወሰኑ ሶፍትዌሮች ጋር ሲነጻጸር ግልፅ ስርዓት ይሰጣሉ።",
  faq_q6: "Arroxy በምን ቋንቋዎች ይገኛሉ?",
  faq_a6:
    "ዘጠኝ: English፣ Español፣ Deutsch፣ Français፣ 日本語፣ 中文፣ Русский፣ Українська፣ हिन्दी። የሥርዓት ቋንቋዎን ራስ ሰር ያወቁ; ሁልጊዜ ከቱልባሩ ይቀይሩ። የቦታ ፋይሎቹ `src/shared/i18n/locales/` ውስጥ ቀጥተኛ TypeScript ዕቃዎች ናቸው — [PRs ይቀበላሉ](../../pulls)።",
  faq_q7: "ሌላ ነገር ጫን ያስፈልጋሉ?",
  faq_a7:
    "አይ። yt-dlp እና ffmpeg በመጀመሪያ አስጀማሪ ከዕውቅ GitHub ስሪቶቻቸው ራስ ሰር ይወርዳሉ እናም አካባቢያዊ ይቀምጣሉ።",
  faq_q8: "ፕሌይሊስቶች ወይም ሙሉ ቻናሎች ማውረድ ይቻላሉ?",
  faq_a8:
    "ዛሬ ነጠላ ቪዲዮዎች እና Shorts። የፕሌይሊስት እና ቻናል ድጋፍ [ዕቅዱ](#roadmap) ላይ ናቸው።",
  faq_q9: 'macOS "አፕ ተጎድቷል" ይላሉ — ምን ማድረግ አለብኝ?',
  faq_a9:
    "ያ macOS Gatekeeper ያልተፈረመ አፕ ያለ ምንም ጉዳት እየከለከሉ ናቸው። ለፍትሃዊ ክርክሩ [በ macOS ላይ ለመጀመሪያ ጊዜ አስጀምር](#download) ክፍሉን ይመልከቱ።",
  faq_q10: "YouTube ቪዲዮዎች ማውረድ ሕጋዊ ነው?",
  faq_a10:
    "ለግል፣ ሚስጥራዊ አጠቃቀም በአብዛኛዎቹ ዳኝነቶች ተቀባይነት ያለው ነው። የ YouTube [የአገልግሎት ደንቦቹን](https://www.youtube.com/t/terms) እና የቦታዎ የቅጂ መብት ሕጎቹን ማክበር ኃላፊነትዎ ነው።",
  plan_intro: "የሚመጣ — ከቅድሚያ ቅደም ተከተሉ ጋር:",
  plan_col1: "ባህሪ",
  plan_col2: "ዝርዝር",
  plan_r1_name: "**ፕሌይሊስት እና ቻናል ማውረዶች**",
  plan_r1_desc:
    "ፕሌይሊስት ወይም ቻናል URL ይለጥፉ; ሁሉም ቪዲዮዎችን በቀን ወይም ብዛት ማጣሪያ ወረፋ ያስቀምጡ",
  plan_r2_name: "**ቡድን URL ግቤት**",
  plan_r2_desc: "ብዙ URLs አንድ ጊዜ ይለጥፉ እና አንድ ጊዜ ያሂዱ",
  plan_r3_name: "**ቅርጸት ቀይሮ**",
  plan_r3_desc: "ማውረዶቹን ወደ MP3፣ WAV፣ FLAC ሳይለዩ ሶፍትዌር ቀይሩ",
  plan_r4_name: "**ተስማሚ ፋይል ስም ቅጥበቶች**",
  plan_r4_desc:
    "ፋይሎቹን በርዕስ፣ አሰቃዮ፣ ቀን፣ ጥራት — ቀጥተኛ ቅድዓሙ ጋር ስሟቸው",
  plan_r5_name: "**የቀጠሮ ማውረዶች**",
  plan_r5_desc: "ወረፋ በተወሰነ ሰዓት ጀምሩ (ሌሊት ሂደቶች)",
  plan_r6_name: "**የፍጥነት ወሰን**",
  plan_r6_desc: "ማውረዶቹ ግንኙነቱን እንዳይሞሉ ኢንተርኔት አቅምን ወሰን ያድርጉ",
  plan_r7_name: "**ቁርጥ ምረጥ**",
  plan_r7_desc: "የጀምር/ማቆሚያ ጊዜ ብቻ ያወርዱ",
  plan_cta:
    "ባህሪ ሀሳብ አለዎ? [ጥያቄ ይክፈቱ](../../issues) — ማህበረሰቡ አስተዋጽኦ ቅድሚያ ይወስናሉ።",
  tech_content: TECH_CONTENT,
  tos_h2: "የአጠቃቀም ደንቦች",
  tos_note:
    "Arroxy ለግል፣ ሚስጥራዊ አጠቃቀም ብቻ ሶፍትዌር ነው። ማውረዶቹ የ YouTube [የአገልግሎት ደንቦቹን](https://www.youtube.com/t/terms) እና የቦታዎ የቅጂ መብት ሕጎቹን ማክበር ሙሉ ኃላፊነትዎ ነው። Arroxy ን ለማውረድ፣ ለማባዛት ወይም ሊጠቀሙበት የማይፈቅዱ ይዘቶችን ለማሰራጨት አይጠቀሙ። ገንቢዎቹ ለምን ዓይነት አላግባብ አጠቃቀም ኃላፊነት አይወስዱም።",
  footer_credit:
    'MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
