const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — ለሁሉም ዓይነት ሥርዓተ ክወና የሚሠራ የዴስክቶፕ ቅጥፈት
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — ቅጥ አሠጣጥ
- **Zustand** — የሁኔታ አስተዳደር
- **yt-dlp** + **ffmpeg** — የማውረድ እና mux ሞተር (yt-dlp በ runtime ይወርዳል፤ ffmpeg/ffprobe በ build time ይካተታሉ)
- **Vite** + **electron-vite** — የግንባታ መሣሪያዎች
- **Vitest** + **Playwright** — የአሃዳዊ እና ከጫፍ-ወደ-ጫፍ ፈተናዎች

</details>

<details>
<summary><strong>ከምንጩ ግንባታ</strong></summary>

### ቅድመ ሁኔታዎች — ለሁሉም ዓይነት ሥርዓቶች

| መሣሪያ  | ስሪት    | ጫን |
| ------- | ------- | ------- |
| Git     | any     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | \`mise install\` ወይም \`.node-version\` |
| Bun     | 1.2.23  | \`mise install\` ወይም \`package.json\` \`packageManager\` |

የሚመከር: \`mise\` ይጫኑ፣ ከዚያ checkout ውስጥ \`mise install\` ያሂዱ። mise ካልተጠቀሙ፣ \`bun run bootstrap\` ከመሮጡ በፊት Node.jsን ከ\`.node-version\` እና Bunን ከ\`package.json\` በእጅ ያንቁ።

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

ለ native rebuilds Visual Studio Build Tools እና Python ሊያስፈልጉ ይችላሉ።

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

ከ clone በኋላ በ checkout ውስጥ \`mise trust && mise install\` ያስኪዱ። shell እርስዎ አስቀድሞ \`fnm\`፣ \`nvm\` ወይም Homebrew Bun የሚጠቀም ከሆነ፣ Arroxy Node.js 24.16.0 እና Bun 1.2.23 እንዲጠቀም \`~/.zshrc\` ውስጥ mise ን ያንቁ:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build እና Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### ቅዳና አሂድ

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # የሚመከር፤ pinned tools በእጅ ካነቃችሁ ይዝለሉት
bun run bootstrap
bun run doctor
bun run dev            # Electron app ከ Vite renderer ጋር
\`\`\`

### ሊሰራጭ የሚችል ፋይል ምንጭ

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # supported host ላይ Windows targets package ማድረግ
\`\`\`

> \`bun run bootstrap\` dependencies ይጭናል፣ Electron app dependencies rebuild ያደርጋል፣ Electron ያረጋግጣል፣ ለ development embedded ffmpeg/ffprobe ያዘጋጃል፣ እና Playwright Chromium ይጭናል። yt-dlp በ runtime ውስጥ app data folder ይ managed ይሆናል፤ ffmpeg እና ffprobe ከእያንዳንዱ የArroxy release ጋር bundled ይመጣሉ።

</details>`;

export const am = {
  icon_alt: "የ Arroxy መሸፈኛ",
  title:
    "Arroxy — ነፃ ምን ኮድ ያለው YouTube (+ 2000 ጣቢያ) አውራጅ ለ Windows, macOS እና Linux",
  read_in_label: "አንብብ በ:",
  badge_release_alt: "ስሪት",
  badge_build_alt: "ግንባታ",
  badge_license_alt: "ፈቃድ",
  badge_platforms_alt: "ሥርዓቶች",
  badge_i18n_alt: "ቋንቋዎች",
  badge_website_alt: "ድር ጣቢያ",
  discord_badge_text: "የDiscord ማህበረሰብን ይቀላቀሉ",
  discord_badge_encoded:
    "%E1%8B%A8Discord%20%E1%88%9B%E1%88%85%E1%89%A0%E1%88%A8%E1%88%B0%E1%89%A5%E1%8A%95%20%E1%8B%AD%E1%89%80%E1%88%8B%E1%89%80%E1%88%89",
  hero_desc:
    "ቪዲዮዎች፣ Shorts፣ ሙዚቃ፣ ቻናሎች፣ ፖድካስቶች ወይም የድምፅ ትራኮች ከ**YouTube እና ከ2000+ ተደገፉ ጣቢያዎች** ያውርዱ — እስከ 4K HDR በ60 fps፣ ወይም MP3 / AAC / Opus። በ Windows፣ macOS፣ እና Linux ላይ አካባቢያዊ ሆኖ ይሠራል። **ምንም ማስታወቂያ፣ ምንም ብዝሃ ሸቀጥ፣ ምንም ተጨማሪ ሽያጭ።**",
  cta_latest: "↓ የቅርብ ጊዜ ስሪት አውርድ",
  cta_website: "ድር ጣቢያ",
  demo_alt: "የ Arroxy ማሳያ",
  star_cta: "Arroxy ጊዜ ካስቆጠበዎ፣ ⭐ ሌሎች እንዲያገኙት ይረዳል።",
  ai_notice: "",
  toc_heading: "ዝርዝር",
  why_h2: "ለምን Arroxy",
  features_h2: "ባህሪያት",
  dl_h2: "መጫን እና የመጀመሪያ ማስነሳት",
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
  feat_quality_h3: "ጥራት እና ቅርጸቶች",
  feat_quality_1: "እስከ **4K UHD (2160p)**፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p",
  feat_quality_2: "**ፈጣን የፍሬም ፍጥነት** እንዳለ ተጠብቆ — 60 fps፣ 120 fps፣ HDR",
  feat_quality_3:
    "**ድምፅ** — ኦዲዮ ብቻን ወደ MP3፣ M4A/AAC፣ Opus ወይም WAV ማውጣት። በinteractive downloads ውስጥ ካሉ የምንጩን native surround/Dolby ትራኮች (AC-3፣ E-AC-3፣ 5.1፣ DRC) ይምረጡ፣ ወይም ዓለም አቀፍ **surround / Dolby ን ይመርጡ** ነባሪ ያቀናብሩ",
  feat_quality_4: "ፈጣን ቅድመ ቅንብሮች: *ምርጥ ጥራት* · *ሚዛናዊ* · *ትንሽ ፋይል*",
  feat_privacy_h3: "ግላዊነት እና ቁጥጥር",
  feat_privacy_1: "100% አካባቢያዊ ሂደት — ማውረዶች ቀጥታ ከ YouTube ወደ ዲስክዎ ይሄዳሉ",
  feat_privacy_2: "ምንም ግባ፣ ምንም ኩኪ፣ ምንም Google ሒሳብ አልተያያዘም",
  feat_privacy_3: "ፋይሎች ወደ መረጡት አቃፊ ቀጥታ ተቀምጠዋል",
  feat_workflow_h3: "የሥራ ፍሰት",
  feat_workflow_1:
    "**ተለዋዋጭ የመጀመሪያ ሁነታዎች** — የተመራ ነጠላ ማውረድ፣ የplaylist/channel መምረጫ፣ ብዙ URL መለጠፍ፣ ወይም በተቀመጡ ነባሪዎች Quick Download ይምረጡ",
  feat_workflow_2:
    "**ማዕከላዊ የማውረድ ወረፋ** — ነጠላ፣ playlist፣ bulk፣ ወይም quick ሥራ ሁሉ ለሂደት፣ ለማቆም፣ ለመቀጠል፣ ለመሰረዝ፣ እንደገና ለመሞከር እና ለቅድሚያ ቁጥጥር በአንድ ቦታ ይመጣል",
  feat_workflow_3:
    "**ክሊፕቦርድ ክትትል** — YouTube ሊንክ ቅዱ እና Arroxy ወደ አፕ ሲመለሱ URL ን አውቶሜቲክ ይሙላሉ (በ Advanced settings ውስጥ ያብሩ/ያጥፉ)",
  feat_workflow_4:
    "**URL ን ራስ ሰር ያጥሩ** — ትራኪንግ ፓራሜትሮችን (`si`፣ `pp`፣ `utm_*`፣ `fbclid`፣ `gclid`) ያስወግዳሉ እና `youtube.com/redirect` ሊንኮችን ያሰናስሉ",
  feat_workflow_5: "**ትሬ ሁነታ** — መስኮቱን መዝጋት ማውረዶቹን በጀርባ ያስቀጥላሉ",
  feat_workflow_6: "**{{LANG_COUNT}} ቋንቋዎች** — የስርዓት አካባቢን በራስ-ሰር ያገኛል፣ በማንኛውም ጊዜ መቀየር ይቻላል",
  feat_workflow_7:
    "**የአጫዋች ዝርዝር ማመሳሰል** — አስቀድሞ የወረዱ ቪዲዮዎችን ለመዝለል አጫዋች ዝርዝርን ከአካባቢያዊ ፎልደር ጋር ዳግም ይፈትሻል፤ እያንዳንዱ ቪዲዮ ሲወርድ የሚዘምን `.m3u` የአጫዋች ዝርዝር ፋይል ይፈጥራል",
  feat_workflow_8:
    "**የፍጥነት እና pacing መቆጣጠሪያዎች** — የማውረድ bandwidth ይገድቡ፣ በጥያቄዎች መካከል መዘግየት ያክሉ፣ እና fragment threadsን በpresets (*Off · Balanced · Careful · Custom*) ያስተካክሉ",
  feat_post_h3: "ንዑስ ርዕሶች እና ድህረ-ሂደት",
  feat_post_1:
    "**ንዑስ ርዕሶች** በ SRT፣ VTT፣ ወይም ASS — እጅ ወይም ራስ ሰር የተፈጠሩ፣ በማንኛውም ቋንቋ",
  feat_post_2: "ከቪዲዮ ጎን ያቆዩ፣ ወደ `.mkv` ያካቱ፣ ወይም ወደ `Subtitles/` ንዑስ አቃፊ ያዘጋጁ",
  feat_post_3:
    "**SponsorBlock** — ስፖንሰሮችን፣ ምዕራፍ ምልክቶችን፣ ወደፊት ምዕራፎችን፣ ራስ ሰር ማስታወቂያዎችን ዝለሉ ወይም ምዕራፍ ምልክት ያድርጉ",
  feat_post_4:
    "**የተካተተ ሜታዳታ** — ርዕስ፣ የሰቀሉ ቀን፣ ቻናል፣ ዝርዝር፣ አናት ስእል፣ እና ምዕራፍ ምልክቶች ወደ ፋይሉ ተጽፈዋል",
  feat_sites_h3: "YouTube + 2000 ጣቢያዎች",
  feat_sites_1:
    "**YouTube ሙሉ** — ቪዲዮዎች፣ Shorts፣ ቻናሎች፣ ፕሌይሊስቶች፣ YouTube Music እና ፖድካስቶች እንደ ቀዳሚ ምንጮች ይታሰባሉ",
  feat_sites_2:
    "**2000+ ሌሎች ጣቢያዎች** yt-dlp አማካኝነት — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org እና ሌሎች ብዙ",
  feat_sites_3:
    "**ኦዲዮ ብቻ እና ጽሑፍ ርዕሶች** ሁሉም ተደጋፊ ጣቢያዎች ላይ ይሠራሉ፣ YouTube ብቻ ሳይሆን",
  feat_sites_4:
    "ጣቢያ ሲቀይር yt-dlp በሳምንት ውስጥ ማሻሻያዎችን ይልካሉ፣ Arroxy ደግሞ ሲጀምር binary ን ራስ-ሰር ያዘምናሉ",
  shot1_cap: "<b>የፈጣን ማውረድ መነሻ</b><br/>URL ይለጥፉ እና በነቃ መገለጫዎ ወዲያውኑ ያውርዱ",
  shot2_cap:
    "<b>እንደገና ጥቅም ላይ የሚውሉ የማውረድ መገለጫዎች</b><br/>ቅርጸት፣ ጥራት እና ውጤትን እንደ ቅድመ-ቅንብር ያስቀምጡ — በእያንዳንዱ ማውረድ ይጠቀሙ",
  shot3_cap: "<b>የብዙ ቋንቋ ድምፅ ትራኮች</b><br/>ቪዲዮ የያዘውን ትክክለኛ የድምፅ ቋንቋ ይምረጡ",
  shot4_cap: "<b>Surround / Dolby ድምፅ</b><br/>5.1 እና Dolby ትራኮች ተለይተው ይጠበቃሉ",
  shot5_cap:
    "<b>የጅምላ URL ሁነታ</b><br/>ዝርዝር ይለጥፉ፣ ድግግሞሾችን በራስ-ሰር ያስወግዱ፣ ሁሉንም በአንድ ጊዜ ያሰልፉ",
  shot6_cap: "<b>ትይዩ የማውረድ ሰልፍ</b><br/>በቀጥታ እድገት ብዙ ማውረዶች በአንድ ጊዜ",
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
  dl_win_smartscreen_h4: "Windows SmartScreen ማስጠንቀቂያ",
  dl_win_smartscreen_intro:
    'በመጀመሪያ ጊዜ ሲጀምሩ **"Windows protected your PC"** ወይም **"Unknown publisher"** ሊያዩ ይችላሉ። ይህ ለ `Arroxy-win-x64-Setup.exe` እና `Arroxy-win-x64-Portable.exe` ሁለቱም ይሠራሉ። Arroxy ነፃ እና ምን ኮድ ያለው ሲሆን የ Windows ቅጅዎቹ ባለ ክፍያ የምስክር ወረቀት ተፈርመዋ አይደሉም፣ ስለዚህ SmartScreen ያሳዩዋቸዋል። ይህ Arroxy ደህና ያልሆነ ማለት **አልሆነም**። ለቀጠሉ:',
  dl_win_smartscreen_step1: "**More info** ጠቅ ያድርጉ።",
  dl_win_smartscreen_step2: "**Run anyway** ጠቅ ያድርጉ።",
  dl_win_smartscreen_official:
    "Arroxy'ን ከይፋዊው GitHub Releases ገጽ ብቻ ያውርዱ። ፋይሉን ሌላ ድር ጣቢያ ካወረዱ ወይም ሌሎች ከላኩልዎ፣ ሰርዘው ከይፋዊ ምንጩ አዲስ ቅጅ ያውርዱ። ምንጩ ህዝባዊ ስለሆነ ራስዎ ሊፈትሹ ወይም Arroxy'ን ሊሠሩ ይችላሉ።",
  dl_macos_h3: "በ macOS ላይ ለመጀመሪያ ጊዜ አስጀምር",
  dl_macos_warning:
    "Arroxy እስካሁን ኮድ አልተፈረመም፣ ስለዚህ macOS Gatekeeper በመጀመሪያ ማስነሳት የተጎዳ መተግበሪያ ማስጠንቀቂያ ሊያሳይ ይችላል። ይህ የሚጠበቅ ነው — ፋይሎቹ በእውነት ተጎድተዋል ማለት አይደለም።",
  dl_macos_m1_h4: "የTerminal ዘዴ:",
  dl_macos_step1: "ከተከፈተው DMG `Arroxy.app`ን ወደ `/Applications` ይጎትቱ።",
  dl_macos_step2:
    "Terminal ይክፈቱና `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` ያስኪዱ።",
  dl_macos_step3: "`open /Applications/Arroxy.app` ያስኪዱ።",
  dl_macos_step4:
    "የapp መንገድ ከተለየ፣ `/Applications/Arroxy.app`ን በጫኑበት መንገድ ይተኩ።",
  dl_macos_step5: "`sudo` ከጠየቀ የMac የይለፍ ቃልዎን ያስገቡ።",
  dl_macos_after: "quarantine ከተወገደ በኋላ Arroxy በመደበኛ ሁኔታ ይከፈታል።",
  dl_macos_m2_h4: "የTerminal ዘዴ:",
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

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "ለምን ማስጠንቀቂያ ሊታዩዎ ይችላሉ",
  dl_warning_p1:
    "Arroxy ምን ኮድ ያለው (open-source) እና MIT ፈቃድ ያለው ነው። የ Windows እና macOS ቅጅዎቹ **ኮድ አልተፈረመባቸውም** — Apple Developer ID እና Windows EV ኮድ-ፊርማ ሰርቲፊኬቶቹ እያንዳንዳቸው በዓመት በመቶዎች ዶላር ያስወጣሉ፣ ይህ ነጻ ፕሮጀክት ከኪሳቸው ይከፍላሉ። ያነዚህ ፊርሞች ሳይኖሩ፣ Windows SmartScreen እና macOS Gatekeeper በመጀመሪያ አስጀማሪ ያስጠነቅቋቸዋል። ማስጠንቀቂያዎቹ *ሥርዓተ ክወናዎ ናሸርን አይለይም* ማለት ናቸው — Arroxy ተንኮል-አዘል ሶፍትዌር ነው ማለት አይደሉም።",
  dl_warning_p2:
    "Arroxy ን ራስዎ ለማረጋገጥ ሦስት መንገዶች፣ ከፍ እያለ በሚሄድ ጥብቅነት:\n\n- **ምንጩን ያንብቡ።** ሁሉም መስመሮች [GitHub](https://github.com/antonio-orionus/Arroxy) ላይ ናቸው፣ እናም [ከምንጩ ሊሠሩ](#tech) ይችላሉ።\n- **SHA256ን ያረጋግጡ።** ፋይልዎን ከታተሙት [`SHA256SUMS`](../../releases/latest) ጋር ያዛምዱ — ከዚህ በታች [ማውረዱን ያረጋግጡ](#verify) ይመልከቱ።\n- **የሦስተኛ ወገን ቅኝት ያካሂዱ።** ፋይሉን ወደ [VirusTotal](https://www.virustotal.com) ይጫኑ።",

  dl_win_first_h3: "Windows ላይ ለመጀመሪያ ጊዜ አስጀምር",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" መልዕክት ሳጥን፣ "More info" ሊንክ ተጎልቶ ከሚታይ ጋር',
  shot_smartscreen_run_alt:
    'More info ከተከፈተ በኋላ SmartScreen መልዕክት ሳጥን፣ "Run anyway" ቁልፍ ከሚታይ ጋር',
  dl_win_defender_h4: "Windows Defender ፋይሉን ቢሰምናቸው ወይም ቢያስወግዳቸው",
  dl_win_defender_p:
    "Defender ሂዩሪስቲክስ አንዳንድ ጊዜ ያልተፈረሙ NSIS ጫኞችን እና Electron ተጓዥዎችን ጥርጣሬ አዘል ብሎ ሊሰምናቸው ይችላሉ። Defender `Arroxy-win-x64-Setup.exe` ወይም `Arroxy-win-x64-Portable.exe` ን ካቆጠቆጠ፣ ከ **Windows Security → Virus & threat protection → Protection history** ይመልሱ፣ ከዛ Arroxy ን ሊፈጸም የሚችልን ፋይል **Manage settings → Add or remove exclusions** ስር ፈቀደ ሆኖ ያክሉ። እንደ SmartScreen ሁሉ፣ ምክንያቱ አልተገኘ ተንኮል-አዘል ሶፍትዌር ሳይሆን የጎደለ ናሸር ፊርማ ነው።",

  dl_macos_first_h3: "macOS ላይ ለመጀመሪያ ጊዜ አስጀምር",
  dl_macos_intro:
    "Arroxy ለ macOS እስካሁን ኮድ አልተፈረመም፣ ስለዚህ Gatekeeper ከ DMG ከጫኑት በኋላ አስፈሪውን *\"Arroxy.app is damaged and can't be opened\"* መልዕክት ሊያሳይ ይችላል። ይህ መልዕክት macOS ያልተፈረመ app በquarantine ውስጥ አስገብቶታል ማለት ነው፤ የapp ፋይሎች በእውነት ተጎድተዋል ማለት አይደለም። በአሁኑ macOS ላይ አስተማማኙ መፍትሔ Terminal ነው:",
  dl_macos_sequoia_h4: "ለአሁኑ macOS የTerminal መፍትሔ",
  dl_macos_sequoia_intro:
    "Arroxyን ወደ Applications ከገለበጡ በኋላ Terminal ይጠቀሙ:",
  dl_macos_sequoia_step1:
    "ከተቀጠለው DMG ውስጥ `Arroxy.app` ን ወደ `/Applications` ጎትቱ።",
  dl_macos_sequoia_step2:
    "Terminal ይክፈቱና እነዚህን ሁለት ትዕዛዞች ያስኪዱ:",
  dl_macos_sequoia_step3:
    "Arroxyን ለማስነሳት `open /Applications/Arroxy.app` ያስኪዱ።",
  dl_macos_sequoia_step4:
    "የapp መንገድ ከተለየ፣ `/Applications/Arroxy.app`ን በጫኑበት መንገድ ይተኩ።",
  dl_macos_sonoma_h4: "ለአሮጌ macOS የTerminal መፍትሔ",
  dl_macos_sonoma_step1:
    "ከተቀጠለው DMG ውስጥ `Arroxy.app` ን ወደ `/Applications` ጎትቱ።",
  dl_macos_sonoma_step2:
    "Terminal ይክፈቱና quarantine ከ `/Applications/Arroxy.app` ያስወግዱ።",
  dl_macos_sonoma_step3:
    "quarantine ከተወገደ በኋላ Arroxyን ከTerminal ወይም Finder ያስነሱ።",
  dl_macos_damaged_h4: "የGatekeeper quarantine መፍትሔ",
  dl_macos_damaged_p:
    "የመጀመሪያው ትዕዛዝ ከተጫነው የArroxy ቅጂዎ quarantine attribute ያስወግዳል። ሁለተኛው appን ያስነሳል። `sudo` የMac የይለፍ ቃልዎን ሊጠይቅ ይችላል፤ Terminal ሲጻፍ ምልክቶችን አያሳይም።",
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** M-ሰሪ Mac ላይ (M1 / M2 / M3 / M4)፣ `arm64` DMG ያውርዱ። Intel Mac ላይ፣ `x64` DMG ያውርዱ። የተሳሳተ ቅጅ ማሂደት Rosetta በኩል ይሠራሉ ነገር ግን በግልጽ ዘገምተኛ ነው።",

  dl_linux_first_h3: "Linux ላይ ለመጀመሪያ ጊዜ አስጀምር",
  dl_linux_appimagelauncher:
    "**አማራጭ የዴስክቶፕ ውህደት:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ን አንድ ጊዜ ጫኑ፣ ሁለቴ ጠቅ ያደርጉበት ማንኛውም AppImage በጀምር ምናሌዎ ውስጥ ራስ-ሰር ይመዘገባሉ — ምንም እጅ `.desktop` ፋይል አያስፈልጋቸውም።",

  dl_verify_h3: "ማውረዱን ያረጋግጡ (SHA256)",
  dl_verify_intro:
    "ሁሉም ስሪቶቹ ከሁለትዮሽ ፋይሎቹ ጎን `SHA256SUMS` ፋይልን ያሳትማሉ። ማውረዱ ሳይበላሽ ወይም ሳይሻሻል እንደደረሰ ለማረጋገጥ፣ ፋይልዎን ሃሽ ያድርጉ እና `SHA256SUMS` ውስጥ ካለው መስመር ጋር ያዛምዱ። ቅርቡን ስሪት ገጽ ይክፈቱ → **Assets** → `SHA256SUMS` ያውርዱ።",
  dl_verify_win_label: "Windows (PowerShell ወይም Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "የሦስተኛ ወገን ተንኮል-አዘል ሶፍትዌር ቅኝት ይፈልጋሉ? ፋይሉን [VirusTotal](https://www.virustotal.com) ላይ ይጫኑ። ከቀዳሚ ሞተሮቹ ጥቂት ሂዩሪስቲክ ምልክቶቹ ፊርማ ላልተደረገባቸው Electron አፖ ዘወትር ናቸው; ከዋና ሞተሮቹ ሰፊ ምልክቶቹ ሐቀኛ ጉዳይ ሊሆኑ ይችላሉ።",

  dl_pm_intro: "አስቀድሞ የፓኬጅ አስተዳዳሪ ይጠቀማሉ? ሰነዳዊ ማውረዱን መዝለፍ ይቻሉ።",

  privacy_p1:
    "ማውረዶቹ ቀጥታ በ [yt-dlp](https://github.com/yt-dlp/yt-dlp) ከ YouTube ወደ መረጡት አቃፊ ይወርዳሉ — ምንም ሦስተኛ ወገን ሰርቨር አይሆንም። የእይታ ታሪክ፣ የማውረድ ታሪክ፣ URLs፣ እና የፋይሎቹ ይዘቶች በመሳሪያዎ ላይ ይቆያሉ።",
  privacy_p2:
    "Arroxy ስም-አልባ፣ የተጠቃለለ telemetry በ [OpenPanel](https://openpanel.dev) ይልካል — ጅምሮችን፣ OS፣ የአፕ ስሪቶችን እና ብልሽቶችን ለመረዳት ብቻ። URLs፣ የቪዲዮ ርዕሶች፣ የፋይል መንገዶች፣ የመለያ መረጃ፣ fingerprinting ወይም የግል ዳታ የለም። የእያንዳንዱ ጭነት ID የዘፈቀደ ነው እና ከማንነትዎ ጋር አይያያዝም። በSettings ውስጥ opt out ማድረግ ይችላሉ።",
  faq_q1: "በርግጥ ነፃ ነው?",
  faq_a1: "አዎ — MIT ፈቃድ አለው፣ ምንም ፕሪሚየም ደረጃ፣ ምንም ባህሪ ቁጥጥር የለም።",
  faq_q2: "ምን ዓይነት ቪዲዮ ጥራቶች ማውረድ እችላሉ?",
  faq_a2:
    "YouTube የሚሰጣቸው ሁሉ: 4K UHD (2160p)፣ 1440p፣ 1080p፣ 720p፣ 480p፣ 360p፣ እና ድምፅ ብቻ። 60 fps፣ 120 fps፣ እና HDR ዥረቶች እንዳሉ ይጠበቃሉ።",
  faq_q3: "ድምፁን ብቻ MP3 አድርጎ ማቅረብ ይቻላሉ?",
  faq_a3: "አዎ። በፎርማት ሜኑ ውስጥ *ኦዲዮ ብቻ* ምረጥ እና MP3፣ M4A/AAC፣ Opus ወይም WAV ምረጥ።",
  faq_q4: "YouTube ሒሳብ ወይም ኩኪዎች ያስፈልጉናሉ?",
  faq_a4:
    "በነባሪ፣ አይ — Arroxy ያለ YouTube ሒሳብ፣ ግባ ወይም ኩኪ ማውጣት ይሠራል። እንደ ዕድሜ-የተገደቡ ወይም የአባላት-ብቻ ቪዲዮዎች ላሉ ማረጋገጫ ለሚፈልጉ ይዘቶች በተራቀቁ ቅንብሮች ውስጥ ተመራጭ የኩኪ ድጋፍ አለ (Cookies source: file or browser)። በነባሪ የጠፋ ነው። ካበሩት፣ የ yt-dlp ዊኪ [በኩኪ ላይ የተመሠረተ አውቶሜሽን የ Google ሒሳብን ሊያመለክት እንደሚችል](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) ያስታውቃሉ፤ በዚያ ሁኔታ ጊዜያዊ ሒሳብ ጥንቃቄ ያለው ምርጫ ነው።",
  faq_q5: "YouTube ሲቀያየር አሁንም ይሠራሉ?",
  faq_a5:
    "yt-dlp በማስነሻ ላይ ራስ ሰር ይዘመናሉ፣ እናም YouTube አንድ ነገር ሲቀይር Arroxy እርማቶችን በፍጥነት ያደርሳሉ። ችግር ካጋጠምዎ፣ በተራቀቁ ቅንብሮች ውስጥ እንደ ዳግም መመለሻ ተመራጭ የኩኪ ድጋፍ አለ።",
  faq_q6: "Arroxy በምን ቋንቋዎች ይገኛሉ?",
  faq_a6:
    "{{LANG_COUNT}} ቋንቋዎች ወዲያውኑ ይገኛሉ፦ {{LANG_NAME_LIST}}። Arroxy በመጀመሪያ ሲጀመር የእርስዎን የስርዓተ ክወና ቋንቋ በራስ-ሰር ያውቃል፣ እና በመሳሪያ አሞሌው ውስጥ ካለው ቋንቋ መራጭ በማንኛውም ጊዜ መቀየር ይችላሉ። Runtime locale JSON በ src/shared/i18n/locales/ ውስጥ ይኖራል፣ የተርጓሚዎች PO ካታሎጎች ደግሞ በ i18n/locales/ ውስጥ ይኖራሉ — ለመሳተፍ GitHub ላይ PR ይክፈቱ።",
  faq_q7: "ሌላ ነገር ጫን ያስፈልጋሉ?",
  faq_a7:
    "አይ። yt-dlp በመጀመሪያ አስጀማሪ ራስ-ሰር ይወርዳል እና በማሽንዎ ላይ ይቀመጣል፤ ffmpeg እና ffprobe ከአፑ ጋር ይመጣሉ። ከዚያ ተጨማሪ setup አያስፈልግም።",
  faq_q8: "ፕሌይሊስቶች ወይም ሙሉ ቻናሎች ማውረድ ይቻላሉ?",
  faq_a8:
    "አዎ — ሁለቱም። የplaylist ወይም channel URL ይለጥፉ (ለምሳሌ `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); ስንት ግቤቶች እንዲቃኙ ይምረጡ፣ ከዚያም ሙሉውን ዝርዝር ወደ ወረፋ ያክሉ ወይም ቪዲዮዎችን በተናጠል ይምረጡ። የቀን ክልል ማጣሪያዎች በቅርቡ ይመጣሉ።",
  faq_q9: 'macOS "አፕ ተጎድቷል" ይላሉ — ምን ማድረግ አለብኝ?',
  faq_a9:
    "ያ macOS Gatekeeper ያልተፈረመ app እየከለከለ ነው፣ እውነተኛ ጉዳት አይደለም። quarantine ለማስወገድ እና Arroxyን ለማስነሳት የTerminal ትዕዛዞችን በ[macOS first launch](#macos-first-launch) ይመልከቱ።",
  faq_q10: "YouTube ቪዲዮዎች ማውረድ ሕጋዊ ነው?",
  faq_a10:
    "ለግል፣ ሚስጥራዊ አጠቃቀም በአብዛኛዎቹ ዳኝነቶች ተቀባይነት ያለው ነው። የ YouTube [የአገልግሎት ደንቦቹን](https://www.youtube.com/t/terms) እና የቦታዎ የቅጂ መብት ሕጎቹን ማክበር ኃላፊነትዎ ነው።",
  plan_intro: "አሁንም የታቀደ — በግምት በቅድሚያ ቅደም ተከተል:",
  plan_col1: "ባህሪ",
  plan_col2: "ዝርዝር",
  plan_r1_name: "**የፕሌይሊስት እና ቻናል ማጣሪያዎች**",
  plan_r1_desc: "playlist ወይም channel ሲዘረዝሩ የቀን ክልል ማጣሪያዎች",
  plan_r2_name: "**የYouTube ድምጽ ትራክ ምርጫዎች**",
  plan_r2_desc:
    "YouTube ብዙ የድምጽ ትራኮች ሲሰጥ በapp ሙሉ የንግግር ቋንቋ ትራክ ምርጫ ያዘጋጁ፣ በprofile ደረጃ override ያድርጉ",
  plan_r6_name: "**በመተግበሪያው ውስጥ browser sign-in**",
  plan_r6_desc:
    "በArroxy ውስጥ browser windows ክፈቱ፣ እንዲገቡ እና site cookies በእጅ ሳይexport እንዲጠቀሙ",
  plan_r8_name: "**አንድ-click ቪዲዮ ማውረድ**",
  plan_r8_desc: "በactive profile የተገኘ ወይም የተለጠፈ URL ቪዲዮ ማውረድን በአንድ click ጀምሩ",
  plan_r3_name: "**የተጠናከረ ዳግም ሙከራ መልሶ ማገገም**",
  plan_r3_desc:
    "በማይታመን ወይም ችግኝ ያለው የኢንተርኔት ግንኙነት የተቋረጡ ማውረዶችን ለመቀጠል አዲስ የዳግም ሙከራ መንገድ",
  plan_r4_name: "**ሙሉ የማውረድ አስተዳዳሪ መሳቢያ**",
  plan_r4_desc:
    "የqueue መሳቢያውን ወደ ሙሉ አስተዳዳሪ መቀየር፣ ለተሰለፉ ንጥሎች destination folder መቀየርን ጨምሮ",
  plan_r5_name: "**የቀጠሮ ማውረዶች**",
  plan_r5_desc: "ወረፋ በተወሰነ ሰዓት ጀምሩ (ሌሊት ሂደቶች)",
  plan_r7_name: "**ቁርጥ ምረጥ**",
  plan_r7_desc: "የጀምር/ማቆሚያ ጊዜ ብቻ ያወርዱ",
  plan_cta: "ባህሪ ሀሳብ አለዎ? [ጥያቄ ይክፈቱ](../../issues) — ማህበረሰቡ አስተዋጽኦ ቅድሚያ ይወስናሉ።",
  tech_content: TECH_CONTENT,
  tos_h2: "የአጠቃቀም ደንቦች",
  tos_note:
    "Arroxy ለግል፣ ሚስጥራዊ አጠቃቀም ብቻ ሶፍትዌር ነው። ማውረዶቹ የ YouTube [የአገልግሎት ደንቦቹን](https://www.youtube.com/t/terms) እና የቦታዎ የቅጂ መብት ሕጎቹን ማክበር ሙሉ ኃላፊነትዎ ነው። Arroxy ን ለማውረድ፣ ለማባዛት ወይም ሊጠቀሙበት የማይፈቅዱ ይዘቶችን ለማሰራጨት አይጠቀሙ። ገንቢዎቹ ለምን ዓይነት አላግባብ አጠቃቀም ኃላፊነት አይወስዱም።",
  footer_credit:
    'MIT License · Made with care by <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
