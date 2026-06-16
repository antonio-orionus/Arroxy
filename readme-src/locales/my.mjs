const TECH_CONTENT = `<details>
<summary><strong>နည်းပညာ stack</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — download နှင့် mux engine (yt-dlp ကို runtime တွင် fetch လုပ်သည်; ffmpeg/ffprobe ကို build time တွင် bundle ထည့်သည်)
- **Vite** + **electron-vite** — build tooling
- **Vitest** + **Playwright** — unit နှင့် end-to-end tests

</details>

<details>
<summary><strong>Source code မှ Build လုပ်ခြင်း</strong></summary>

### လိုအပ်သောအရာများ — platform အားလုံးအတွက်

| Tool | ဗားရှင်း | ထည့်သွင်းရန် |
| ---- | ------- | ------- |
| Git  | မည်သည့်ဗားရှင်းမဆို | [git-scm.com](https://git-scm.com) |
| Bun  | နောက်ဆုံးထွက်  | အောက်တွင် OS အလိုက်ကြည့်ရှုပါ |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Native build tool များမလိုအပ်ပါ — project တွင် native Node addons မပါဝင်ပါ။

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

### Clone နှင့် run လုပ်ခြင်း

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### Distributable ကို Build လုပ်ခြင်း

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # လက်ရှိ OS အတွက် package ထုတ်ရန်
bun run dist:win     # Windows portable exe cross-compile
\`\`\`

> yt-dlp ကို ပထမဆုံး launch တွင် GitHub မှ fetch လုပ်ပြီး app data folder တွင် cache သိမ်းထားသည်။ ffmpeg နှင့် ffprobe သည် Arroxy release တိုင်းတွင် bundle ထည့်ထားသည်။

</details>`;

export const my = {
  icon_alt: "Arroxy မုဒ်ကော့",
  title:
    "Arroxy — Windows, macOS နှင့် Linux အတွက် အခမဲ့ Open-Source YouTube (+ ၂၀၀၀ ဆိုဒ်) Downloader",
  read_in_label: "ဘာသာဖြင့် ဖတ်ရှုရန်:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "လိုင်စင်",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "ဘာသာစကားများ",
  badge_website_alt: "ဝဘ်ဆိုက်",
  discord_badge_text: "Discord အသိုင်းအဝိုင်းတွင် ပါဝင်ပါ",
  discord_badge_encoded:
    "Discord%20%E1%80%A1%E1%80%9E%E1%80%AD%E1%80%AF%E1%80%84%E1%80%BA%E1%80%B8%E1%80%A1%E1%80%9D%E1%80%AD%E1%80%AF%E1%80%84%E1%80%BA%E1%80%B8%E1%80%90%E1%80%BD%E1%80%84%E1%80%BA%20%E1%80%95%E1%80%AB%E1%80%9D%E1%80%84%E1%80%BA%E1%80%95%E1%80%AB",
  hero_desc:
    "**YouTube နှင့် ၂၀၀၀+ ထောက်ပံ့သောဆိုဒ်များ** မှ ဗီဒီယိုများ၊ Shorts၊ သီချင်းများ၊ channel များ၊ podcast များ သို့မဟုတ် audio track များကို ဒေါင်းလုဒ်ဆွဲပါ — 60 fps တွင် 4K HDR အထိ၊ သို့မဟုတ် MP3 / AAC / Opus အဖြစ်။ Windows, macOS နှင့် Linux တွင် သင့်ကွန်ပျူတာပေါ်တွင်သာ run ပါသည်။ **ကြော်ငြာမပါ၊ bloat မပါ၊ upsell မပါ။**",
  cta_latest: "↓ နောက်ဆုံး Release ကို ဒေါင်းလုဒ်ဆွဲပါ",
  cta_website: "ဝဘ်ဆိုက်",
  demo_alt: "Arroxy ပြသချက်",
  star_cta:
    "Arroxy သည် သင့်အချိန်ကို သက်သာစေပါက ⭐ တစ်ချက်က အခြားသူများ ရှာတွေ့ရန် ကူညီပါသည်။",
  ai_notice: "",
  toc_heading: "မာတိကာ",
  why_h2: "Arroxy ဘာကြောင့်",
  features_h2: "လုပ်ဆောင်ချက်များ",
  dl_h2: "ဒေါင်းလုဒ်",
  privacy_h2: "ကိုယ်ရေးကိုယ်တာ",
  faq_h2: "မေးလေ့ရှိသောမေးခွန်းများ",
  roadmap_h2: "လမ်းပြမြေပုံ",
  tech_h2: "တည်ဆောက်ထားသောနည်းပညာ",
  why_intro:
    "အသုံးများဆုံး alternatives များနှင့် side-by-side နှိုင်းယှဉ်ချက်:",
  why_r1: "အခမဲ့၊ premium tier မပါ",
  why_r2: "Open source",
  why_r3: "Local processing သာ",
  why_r4: "Login သို့မဟုတ် cookie export မလိုအပ်",
  why_r5: "အသုံးပြုမှုကန့်သတ်ချက်မပါ",
  why_r6: "Cross-platform desktop app",
  why_r7: "Subtitles + SponsorBlock",
  why_summary:
    "Arroxy ကို တစ်ခုတည်းသောရည်ရွယ်ချက်ဖြင့် တည်ဆောက်ထားသည်: URL ကို paste လုပ်ပြီး ကောင်းမွန်သောသော local file ကိုရရှိပါ။ Account မပါ၊ upsell မပါ၊ data ကောက်ခံမှုမပါ။",
  feat_quality_h3: "အရည်အသွေးနှင့် format များ",
  feat_quality_1: "**4K UHD (2160p)** အထိ၊ 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2:
    "**High frame rate** ကို မူရင်းအတိုင်း ထိန်းသိမ်း — 60 fps, 120 fps, HDR",
  feat_quality_3:
    "**အသံ** — အသံသာကို MP3၊ M4A/AAC၊ Opus သို့မဟုတ် WAV အဖြစ် export လုပ်ပါ။ interactive downloads တွင် ရနိုင်ပါက source ၏ native surround/Dolby tracks (AC-3၊ E-AC-3၊ 5.1၊ DRC) ကို ရွေးချယ်ပါ၊ သို့မဟုတ် global default **surround / Dolby ကို ဦးစားပေးပါ** ကို သတ်မှတ်ပါ",
  feat_quality_4:
    "အမြန် presets: *အကောင်းဆုံးအရည်အသွေး* · * မျှတသော* · *ဖိုင်ငယ်*",
  feat_privacy_h3: "ကိုယ်ရေးကိုယ်တာနှင့် ထိန်းချုပ်မှု",
  feat_privacy_1:
    "100% local processing — ဒေါင်းလုဒ်များသည် YouTube မှ တိုက်ရိုက် သင့် disk သို့ သွားသည်",
  feat_privacy_2: "Login မပါ၊ cookie မပါ၊ Google account ချိတ်ဆက်မှုမပါ",
  feat_privacy_3: "သင်ရွေးချယ်သောဖိုဒါတွင် ဖိုင်များကို တိုက်ရိုက်သိမ်းဆည်းသည်",
  feat_workflow_h3: "Workflow",
  feat_workflow_1:
    "**ပြောင်းလွယ်ပြင်လွယ် စတင်မုဒ်များ** — လမ်းညွှန်ထားသော single download၊ playlist/channel picker၊ bulk URL paste၊ သို့မဟုတ် သိမ်းထားသော defaults ဖြင့် Quick Download ကိုရွေးပါ",
  feat_workflow_2:
    "**ဗဟို download queue** — single၊ playlist၊ bulk၊ quick job အားလုံးသည် progress၊ pause၊ resume၊ cancel၊ retry နှင့် priority control အတွက် တစ်နေရာတည်းသို့ ရောက်သည်",
  feat_workflow_3:
    "**Clipboard watch** — YouTube link ကို copy လုပ်ပြီး app ကို refocus လုပ်သောအခါ Arroxy သည် URL ကို auto-fill လုပ်သည် (Advanced settings တွင် toggle နှိပ်ပါ)",
  feat_workflow_4:
    "**Auto-clean URLs** — tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ကိုဖယ်ရှားပြီး `youtube.com/redirect` links ကိုဖြေရှင်းသည်",
  feat_workflow_5:
    "**Tray mode** — window ကိုပိတ်လျှင် downloads များသည် နောက်ကွယ်တွင် ဆက်လည်ပတ်နေသည်",
  feat_workflow_6:
    "**ဘာသာစကား ၂၁ မျိုး** — system locale ကို auto-detect လုပ်ပြီး မည်သည့်အချိန်မဆို ပြောင်းလဲနိုင်သည်",
  feat_workflow_7:
    "**Playlist sync** — ဒေါင်းလုဒ်လုပ်ပြီးသား ဗီဒီယိုများကို ကျော်ရန် playlist ကို local folder နှင့် ပြန်စစ်ဆေးပြီး၊ ဗီဒီယိုတစ်ခုစီ ဒေါင်းလုဒ်ပြီးတိုင်း အပ်ဒိတ်ဖြစ်သော `.m3u` playlist ဖိုင်ကို ဖန်တီးသည်",
  feat_workflow_8:
    "**Speed နှင့် pacing controls** — download bandwidth ကိုကန့်သတ်ပါ၊ request delays ထည့်ပါ၊ presets (*Off · Balanced · Careful · Custom*) ဖြင့် fragment threads ကိုညှိပါ",
  feat_post_h3: "Subtitles နှင့် post-processing",
  feat_post_1:
    "SRT, VTT သို့မဟုတ် ASS တွင် **Subtitles** — ကိုယ်တိုင်ရိုက်ထည့်ထားသော သို့မဟုတ် auto-generated၊ မည်သည့် language မဆို",
  feat_post_2:
    "ဗီဒီယိုဘေးတွင်သိမ်းပါ၊ `.mkv` ထဲ embed လုပ်ပါ၊ သို့မဟုတ် `Subtitles/` subfolder တွင် စီစဉ်ပါ",
  feat_post_3:
    "**SponsorBlock** — sponsors, intros, outros, self-promos ကို ကျော်ပြီး chapter-mark လုပ်ပါ",
  feat_post_4:
    "**Embedded metadata** — ခေါင်းစဉ်၊ upload date, channel, description, thumbnail နှင့် chapter markers တို့ကို ဖိုင်ထဲသို့ ရေးသွင်းသည်",
  feat_sites_h3: "YouTube + ၂၀၀၀ ဆိုဒ်",
  feat_sites_1:
    "**YouTube၊ အပြည့်အဝ** — Videos, Shorts, Channels, Playlists, YouTube Music နှင့် Podcasts တို့ကို ပထမတန်းစား ရင်းမြစ်များအဖြစ် ကိုင်တွယ်သည်",
  feat_sites_2:
    "**၂၀၀၀+ အခြားဆိုဒ်များ** yt-dlp မှတဆင့် — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org နှင့် အခြားအများကြီး",
  feat_sites_3:
    "**အသံသာနှင့် subtitle များ** ထောက်ပံ့သောဆိုဒ်တိုင်းတွင် အလုပ်လုပ်သည်၊ YouTube တွင်သာမဟုတ်",
  feat_sites_4:
    "ဆိုဒ်တစ်ခု ပြောင်းလဲပါက yt-dlp သည် အပတ်တိုင်း fix များ ထုတ်ပြီး Arroxy သည် launch တွင် binary ကို auto-update လုပ်သည်",
  shot1_cap:
    "<b>အမြန်ဒေါင်းလုဒ် ပင်မ</b><br/>URL ကို ကူးထည့်ပြီး သင့်လက်ရှိ ပရိုဖိုင်ဖြင့် ချက်ချင်းဒေါင်းလုဒ်လုပ်ပါ",
  shot2_cap:
    "<b>ပြန်သုံးနိုင်သော ဒေါင်းလုဒ်ပရိုဖိုင်များ</b><br/>ဖော်မတ်၊ အရည်အသွေးနှင့် အထွက်ကို ကြိုတင်သတ်မှတ်ချက်အဖြစ် သိမ်းပါ — ဒေါင်းလုဒ်တိုင်းတွင် ပြန်သုံးပါ",
  shot3_cap:
    "<b>ဘာသာစကားစုံ အသံလမ်းကြောင်းများ</b><br/>ဗီဒီယိုပါ တိကျသော အသံဘာသာစကားကို ရွေးပါ",
  shot4_cap:
    "<b>Surround / Dolby အသံ</b><br/>5.1 နှင့် Dolby လမ်းကြောင်းများကို ရှာဖွေ ထိန်းသိမ်းပေးသည်",
  shot5_cap:
    "<b>အစုလိုက် URL မုဒ်</b><br/>စာရင်းကူးထည့်ပါ၊ ပွားနေသည်များကို အလိုအလျောက်ဖယ်ရှားပါ၊ အားလုံးကို တစ်ပြိုင်နက်တန်းစီပါ",
  shot6_cap:
    "<b>ပြိုင်တူ ဒေါင်းလုဒ်တန်းစီ</b><br/>တိုက်ရိုက်တိုးတက်မှုဖြင့် တစ်ပြိုင်နက် ဒေါင်းလုဒ်များစွာ",
  dl_platform_col: "Platform",
  dl_format_col: "Format",
  dl_win_format: "Installer (NSIS) သို့မဟုတ် Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` သို့မဟုတ် `.flatpak` (sandboxed)",
  dl_grab: "နောက်ဆုံး release ကို ယူပါ →",
  dl_pkg_h3: "Package manager မှတစ်ဆင့် ထည့်သွင်းပါ",
  dl_channel_col: "Channel",
  dl_command_col: "Command",
  dl_win_h3: "Windows: Installer နှင့် Portable နှိုင်းယှဉ်",
  dl_win_col_installer: "NSIS Installer",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "ထည့်သွင်းမှုလိုအပ်သည်",
  dl_win_r1_installer: "ဟုတ်သည်",
  dl_win_r1_portable: "မလိုအပ်ပါ — မည်သည့်နေရာမှမဆို run ပါ",
  dl_win_r2: "Auto-update",
  dl_win_r2_installer: "✅ app အတွင်းမှ",
  dl_win_r2_portable: "❌ ကိုယ်တိုင် download ဆင်းရသည်",
  dl_win_r3: "Startup မြန်နှုန်း",
  dl_win_r3_installer: "✅ ပိုမြန်သည်",
  dl_win_r3_portable: "⚠️ cold start နှေးသည်",
  dl_win_r4: "Start Menu တွင် ထည့်သည်",
  dl_win_r5: "လွယ်ကူစွာ ဖြုတ်နိုင်သည်",
  dl_win_r5_portable: "❌ ဖိုင်ကိုဖျက်ပစ်ပါ",
  dl_win_rec:
    "**အကြံပြုချက်:** auto-update နှင့် ပိုမြန်သော startup အတွက် NSIS installer ကို အသုံးပြုပါ။ install မလုပ်ဘဲ registry မသုံးသောနည်းအတွက် portable `.exe` ကို အသုံးပြုပါ။",
  dl_win_smartscreen_h4: "Windows SmartScreen သတိပေးချက်",
  dl_win_smartscreen_intro:
    'ပထမဆုံး ဖွင့်သောအခါ **"Windows protected your PC"** သို့မဟုတ် **"Unknown publisher."** ဟု မြင်ရနိုင်သည်။ ၎င်းသည် `Arroxy-win-x64-Setup.exe` နှင့် `Arroxy-win-x64-Portable.exe` နှစ်မျိုးစလုံးအတွက် သက်ဆိုင်သည်။ Arroxy သည် အခမဲ့ open-source ဖြစ်ပြီး Windows builds များကို ငွေပေးချေ certificate ဖြင့် code-sign မလုပ်ထားသောကြောင့် SmartScreen က flag လုပ်သည်။ ၎င်းသည် Arroxy မဘေးကင်းကြောင်း **အလိုအလျောက်** မဆိုလိုပါ။ ဆက်လုပ်ရန်:',
  dl_win_smartscreen_step1: "**More info** ကို နှိပ်ပါ။",
  dl_win_smartscreen_step2: "**Run anyway** ကို နှိပ်ပါ။",
  dl_win_smartscreen_official:
    "Arroxy ကို တရားဝင် GitHub Releases စာမျက်နှာမှသာ ဒေါင်းလုဒ်ဆွဲပါ။ ဖိုင်ကို အခြား website မှ ရရှိပါက သို့မဟုတ် တစ်ယောက်ယောက်က ပေးပို့ပါက ၎င်းကို ဖျက်ပြီး တရားဝင် source မှ အသစ် download ဆင်းပါ။ source code ကို public တင်ထားသောကြောင့် သင်ကြိုက်ပါက ကိုယ်တိုင် စစ်ဆေးနိုင်သည် သို့မဟုတ် Arroxy ကိုယ်တိုင် build လုပ်နိုင်သည်။",
  dl_macos_h3: "macOS တွင် ပထမဆုံး launch လုပ်ခြင်း",
  dl_macos_warning:
    "Arroxy သည် code-sign မလုပ်ရသေးသောကြောင့် macOS Gatekeeper သည် ပထမဆုံး launch လုပ်သည့်အခါ သတိပေးလိမ့်မည်။ ၎င်းသည် မျှော်မှန်းထားသောဖြစ်ရပ်ဖြစ်ပြီး ပျက်စီးမှုသင်္ကေတမဟုတ်ပါ။",
  dl_macos_m1_h4: "System Settings နည်းလမ်း (အကြံပြု):",
  dl_macos_step1: "Arroxy app icon ကို right-click ပြီး **Open** ကိုရွေးပါ။",
  dl_macos_step2:
    "သတိပေးမှု dialog ပေါ်လာသည် — **Cancel** ကိုနှိပ်ပါ (*Move to Trash* ကိုမနှိပ်ပါနှင့်)။",
  dl_macos_step3: "**System Settings → Privacy & Security** ကိုဖွင့်ပါ။",
  dl_macos_step4:
    '**Security** section သို့ scroll ဆင်းပါ။ *"Arroxy was blocked from use because it is not from an identified developer."* ဟုမြင်ရလိမ့်မည်။',
  dl_macos_step5:
    "**Open Anyway** ကိုနှိပ်ပြီး သင့် password သို့မဟုတ် Touch ID ဖြင့် အတည်ပြုပါ။",
  dl_macos_after:
    "အဆင့် ၅ ပြီးနောက် Arroxy သည် ပုံမှန်ဖွင့်ပြီး သတိပေးချက်သည် နောက်ထပ်မပေါ်တော့ပါ။",
  dl_macos_m2_h4: "Terminal နည်းလမ်း (အဆင့်မြင့်):",
  dl_macos_note:
    "macOS builds များကို Apple Silicon နှင့် Intel runners တို့ပေါ်တွင် CI မှတဆင့် ထုတ်လုပ်သည်။ ပြဿနာများကြုံတွေ့ပါက [issue တင်ပါ](../../issues) — macOS သုံးစွဲသူများ၏ feedback သည် macOS testing cycle ကို တက်ကြွစွာ ပုံဖော်ပေသည်။",
  dl_linux_h3: "Linux တွင် ပထမဆုံး launch လုပ်ခြင်း",
  dl_linux_intro:
    "AppImages များကို တိုက်ရိုက် run နိုင်သည် — ထည့်သွင်းမှုမလိုအပ်ပါ။ ဖိုင်ကို executable အဖြစ် mark လုပ်ရုံသာ လိုအပ်သည်။",
  dl_linux_m1_text:
    "**File manager:** `.AppImage` ကို right-click → **Properties** → **Permissions** → **Allow executing file as program** ကိုဖွင့်ပြီး double-click နှိပ်ပါ။",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Launch မအောင်မြင်သေးလျှင် FUSE ပျောက်ဆုံးနေနိုင်သည်:",
  dl_linux_flatpak_intro:
    "**Flatpak (sandboxed alternative):** တူညီသော release page မှ `Arroxy-*.flatpak` ကို download ဆင်းပါ။",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "သတိပေးချက် ဘာကြောင့်မြင်ရနိုင်သနည်း",
  dl_warning_p1:
    "Arroxy သည် open-source ဖြစ်ပြီး MIT-licensed ဖြစ်သည်။ Windows နှင့် macOS builds များသည် **code-sign မလုပ်ထားပါ** — Apple Developer ID နှင့် Windows EV code-signing certificates တို့သည် တစ်နှစ်လျှင် ဒေါ်လာ ရာနှင့်ချီ ကုန်ကျပြီး indie project တစ်ခုအတွက် ကိုယ်တိုင်ကျခံရသည်။ ထိုလက်မှတ်များမပါဘဲ Windows SmartScreen နှင့် macOS Gatekeeper တို့သည် ပထမဆုံး launch တွင် သတိပေးလိမ့်မည်။ သတိပေးချက်များ၏ အဓိပ္ပာယ်မှာ *သင့် OS က publisher ကို မသိသောကြောင့်ဖြစ်ပြီး* Arroxy malware ဖြစ်ကြောင်း မဆိုလိုပါ။",
  dl_warning_p2:
    "Arroxy ကိုယ်တိုင် စစ်ဆေးရန် နည်းလမ်းသုံးမျိုး၊ တဆင့်ပြင်းထန်လာသောစီစဉ်မှုဖြင့်:\n\n- **Source ကိုဖတ်ပါ။** မျဉ်းတိုင်းသည် [GitHub](https://github.com/antonio-orionus/Arroxy) တွင်ရှိပြီး [source မှ build](#tech) လုပ်နိုင်သည်။\n- **SHA256 စစ်ဆေးပါ။** သင့်ဖိုင်ကို ထုတ်ဝေထားသော [`SHA256SUMS`](../../releases/latest) နှင့် ကိုက်ညီမှုစစ်ဆေးပါ — အောက်တွင် [သင့်ဒေါင်းလုဒ်ကို အတည်ပြုပါ](#verify) ကိုကြည့်ပါ။\n- **Third-party scan ပြုလုပ်ပါ။** ဖိုင်ကို [VirusTotal](https://www.virustotal.com) တွင် upload ပြုလုပ်ပါ။",

  dl_win_first_h3: "Windows ပထမဆုံး launch",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog တွင် "More info" link ကိုထင်ရှားအောင်ပြထားသည်',
  shot_smartscreen_run_alt:
    'More info ချဲ့ပြီးနောက် SmartScreen dialog တွင် "Run anyway" ခလုတ်ပေါ်လာသည်',
  dl_win_defender_h4:
    "Windows Defender သည် ဖိုင်ကို flag လုပ်ခြင်း သို့မဟုတ် ဖယ်ရှားပါက",
  dl_win_defender_p:
    "Defender heuristics သည် တစ်ခါတစ်ရံ unsigned NSIS installers နှင့် Electron portables ကို သံသယဖြစ်ဖွယ်ဟု flag လုပ်တတ်သည်။ Defender က `Arroxy-win-x64-Setup.exe` သို့မဟုတ် `Arroxy-win-x64-Portable.exe` ကို quarantine ထည့်ပါက **Windows Security → Virus & threat protection → Protection history** မှ ပြန်ယူပြီး Arroxy executable ကို **Manage settings → Add or remove exclusions** အောက်တွင် ခွင့်ပြုထားသောအရာအဖြစ် ထည့်သွင်းပါ။ SmartScreen ကဲ့သို့ပင် trigger သည် ပျောက်ဆုံးသော publisher signature ဖြစ်ပြီး malware တွေ့ရှိမှုမဟုတ်ပါ။",

  dl_macos_first_h3: "macOS ပထမဆုံး launch",
  dl_macos_intro:
    "Arroxy သည် macOS အတွက် code-sign မလုပ်ရသေးသောကြောင့် Gatekeeper သည် ပထမဆုံး launch ကို ပိတ်ဆို့လိမ့်မည်။ ၎င်းကို ခွင့်ပြုရန် တိကျသောနည်းလမ်းသည် သင့် macOS ဗားရှင်းပေါ် မူတည်သည် — Sequoia 15 သည် right-click → Open bypass ဟောင်းကို တင်းကျပ်လာသည်။",
  dl_macos_sequoia_h4: "macOS Sequoia 15 နှင့် နောက်ပိုင်း (လက်ရှိ)",
  dl_macos_sequoia_intro:
    "Sequoia 15 နှင့် နောက်ပိုင်းတွင် right-click → Open သည် quarantine ထည့်ထားသော apps များစွာအတွက် Gatekeeper ကို ကျော်ဖြတ်၍မရတော့ပါ။ ယင်းအစား System Settings panel ကို အသုံးပြုပါ:",
  dl_macos_sequoia_step1:
    "တပ်ဆင်ထားသော DMG မှ `Arroxy.app` ကို `/Applications` သို့ ဆွဲထည့်ပါ။",
  dl_macos_sequoia_step2:
    "Arroxy ကို double-click နှိပ်ပါ။ ပိတ်ဆို့မှု dialog ပေါ်လာသည် — **Done** ကိုနှိပ်ပါ (*Move to Trash* ကိုမနှိပ်ပါနှင့်)။",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** ကိုဖွင့်ပြီး **Security** section သို့ scroll ဆင်းပါ။ *"Arroxy was blocked to protect your Mac"* (သို့မဟုတ် ၎င်းနှင့်ဆင်တူသော message) မြင်ရပါမည်။',
  dl_macos_sequoia_step4:
    "**Open Anyway** ကိုနှိပ်ပြီး သင့် password သို့မဟုတ် Touch ID ဖြင့် အတည်ပြုကာ `/Applications` မှ Arroxy ကို ပြန်လည်ဖွင့်ပါ။",
  dl_macos_sonoma_h4: "macOS Sonoma 14 နှင့် အစောပိုင်း",
  dl_macos_sonoma_step1:
    "တပ်ဆင်ထားသော DMG မှ `Arroxy.app` ကို `/Applications` သို့ ဆွဲထည့်ပါ။",
  dl_macos_sonoma_step2:
    "`/Applications` ထဲရှိ `Arroxy.app` ကို right-click (သို့မဟုတ် Control-click) နှိပ်ပြီး **Open** ကိုရွေးပါ။",
  dl_macos_sonoma_step3:
    "သတိပေးမှု dialog တွင် **Open** ခလုတ်ပေါ်လာသည် — ၎င်းကိုနှိပ်ပြီး အတည်ပြုပါ။ Arroxy ပုံမှန်ဖွင့်ပြီး သတိပေးချက်သည် နောက်ထပ်မပေါ်တော့ပါ။",
  dl_macos_damaged_h4:
    '"App is damaged" သို့မဟုတ် ဆက်တိုက် Gatekeeper ပိတ်ဆို့မှု — Terminal ဖြေရှင်းနည်း',
  dl_macos_damaged_p:
    'macOS က *"Arroxy is damaged and can\'t be opened"* ဟုဆိုပါက သို့မဟုတ် အထက်ပါ အဆင့်များထဲမှ တစ်ခုမျှ ပိတ်ဆို့မှုကို မဖယ်ရှားနိုင်ပါက DMG ပေါ်ရှိ quarantine attribute ဖြစ်သည် (အချို့သော browsers နှင့် macOS ကိုယ်တိုင်၏ translocation behavior က ၎င်းကို သတ်မှတ်ထားသည်)။ ထည့်သွင်းထားသော app မှ ၎င်းကိုဖယ်ရှားပါ:',
  dl_macos_arch_note:
    "**Apple Silicon နှင့် Intel:** M-series Mac (M1 / M2 / M3 / M4) ပေါ်တွင် `arm64` DMG ကိုဒေါင်းလုဒ်ဆွဲပါ။ Intel Mac ပေါ်တွင် `x64` DMG ကိုဒေါင်းလုဒ်ဆွဲပါ။ မမှန်ကန်သော build ကိုဖွင့်ပါက Rosetta မှတစ်ဆင့် အလုပ်လုပ်သော်လည်း သိသာစွာ နှေးကွေးပါမည်။",

  dl_linux_first_h3: "Linux ပထမဆုံး launch",
  dl_linux_appimagelauncher:
    "**ရွေးချယ်နိုင်သော desktop ပေါင်းစည်းမှု:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ကို တစ်ကြိမ်ထည့်သွင်းပါ၊ သင် double-click နှိပ်သော AppImage တိုင်းသည် သင့် launcher menu တွင် အလိုအလျောက် မှတ်ပုံတင်ပြီး ကိုယ်တိုင် `.desktop` ဖိုင်ဖန်တီးရန် မလိုအပ်တော့ပါ။",

  dl_verify_h3: "သင့်ဒေါင်းလုဒ်ကို အတည်ပြုပါ (SHA256)",
  dl_verify_intro:
    "Release တိုင်းသည် binaries များနှင့်အတူ `SHA256SUMS` ဖိုင်ကို ထုတ်ဝေသည်။ သင့်ဒေါင်းလုဒ်သည် ပိုဆောင်ရင်းတွင် ပျက်စီးသွားခြင်း သို့မဟုတ် ကြားဖြတ်ဝင်ရောက်ပြောင်းလဲမှုမရှိကြောင်း စစ်ဆေးရန် ဖိုင်ကို locally hash ပြုလုပ်ပြီး `SHA256SUMS` ရှိ လိုင်းနှင့် ကိုက်ညီမှုစစ်ဆေးပါ။ နောက်ဆုံး release page ဖွင့်ပါ → **Assets** → `SHA256SUMS` ကိုဒေါင်းလုဒ်ဆွဲပါ။",
  dl_verify_win_label: "Windows (PowerShell သို့မဟုတ် Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Third-party malware scan လိုချင်ပါသလား? [VirusTotal](https://www.virustotal.com) တွင် ဖိုင်ကို upload ပြုလုပ်ပါ။ unsigned Electron apps အတွက် သေးငယ်သော engines မှ generic-heuristic flags အနည်းငယ်ရှိခြင်းသည် ပုံမှန်ဖြစ်သည်၊ သို့သော် အဓိက engines များမှ ကျယ်ပြန့်သော detections ရှိပါက စစ်မှန်သောစိုးရိမ်ဖွယ်ရာဖြစ်သည်။",

  dl_pm_intro:
    "Package manager တစ်ခုကို သုံးနေပြီလား? ကိုယ်တိုင် download ဆင်းသောနည်းလမ်းကို ကျော်လွှားနိုင်သည်။",

  privacy_p1:
    "Downloads များကို [yt-dlp](https://github.com/yt-dlp/yt-dlp) မှတဆင့် YouTube မှ တိုက်ရိုက် သင်ရွေးချယ်သောဖိုဒါသို့ fetch လုပ်သည် — third-party server မှတဆင့် routing မလုပ်ပါ။ ကြည့်ရှုမှတ်တမ်း၊ ဒေါင်းလုဒ်မှတ်တမ်း၊ URL များနှင့် ဖိုင်အကြောင်းအရာများသည် သင့်ကိရိယာပေါ်တွင်သာ ကျန်ရှိသည်။",
  privacy_p2:
    "Arroxy သည် [OpenPanel](https://openpanel.dev) မှတဆင့် anonymous aggregate telemetry ပေးပို့သည် — launches, OS, app versions နှင့် crashes ကိုနားလည်ရန်လောက်သာ။ URLs, video titles, file paths, account info, fingerprinting သို့မဟုတ် personal data မရှိပါ။ per-install ID သည် random ဖြစ်ပြီး သင့် identity နှင့် မချိတ်ဆက်ထားပါ။ Settings တွင် opt out လုပ်နိုင်သည်။",
  faq_q1: "တကယ်ကို အခမဲ့လား?",
  faq_a1: "ဟုတ်သည် — MIT licensed၊ premium tier မပါ၊ feature gating မပါ။",
  faq_q2: "မည်သည့် ဗီဒီယိုအရည်အသွေးများ ဒေါင်းလုဒ်ဆွဲနိုင်သနည်း?",
  faq_a2:
    "YouTube ပေးသောအရာများအားလုံး: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p နှင့် audio-only။ 60 fps, 120 fps နှင့် HDR streams များကို မူရင်းအတိုင်း ထိန်းသိမ်းသည်။",
  faq_q3: "Audio ကိုသာ MP3 အဖြစ် ထုတ်ယူနိုင်သလား?",
  faq_a3:
    "ဟုတ်ပါတယ်။ format menu ထဲက *အသံသာ* ကိုရွေးပြီး MP3၊ M4A/AAC၊ Opus သို့မဟုတ် WAV ကိုရွေးပါ။",
  faq_q4: "YouTube account သို့မဟုတ် cookie လိုအပ်သလား?",
  faq_a4:
    "ပုံမှန်အားဖြင့် မလိုအပ်ပါ — Arroxy သည် YouTube account, login သို့မဟုတ် cookie export မပါဘဲ အလုပ်လုပ်သည်။ အသက်အရွယ်ကန့်သတ်ထားသော သို့မဟုတ် member-only ဗီဒီယိုကဲ့သို့ authentication လိုအပ်သော content များအတွက် Advanced settings တွင် optional cookie support (Cookies source: file or browser) ရရှိနိုင်ပါသည်။ default အားဖြင့် ပိတ်ထားသည်။ သင်ဖွင့်လိုက်ပါက yt-dlp ၏ wiki က [cookie-based automation သည် Google account ကို flag လုပ်နိုင်ကြောင်း](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) သတိပေးထားသည်; ၎င်းအခြေအနေတွင် throwaway account တစ်ခုသည် ပိုပြီးဘေးကင်းသောရွေးချယ်မှုဖြစ်သည်။",
  faq_q5: "YouTube တွင် တစ်ခုခုပြောင်းသောအခါ ဆက်လက်အလုပ်လုပ်မည်လား?",
  faq_a5:
    "yt-dlp ကို launch တိုင်း အလိုအလျောက် update လုပ်ပြီး YouTube က တစ်ခုခု ပြောင်းလဲသောအခါ Arroxy က fix များကို လျင်မြန်စွာ ထုတ်ပေးသည်။ ပြဿနာတစ်စုံတစ်ရာ ကြုံတွေ့ခဲ့ပါက Advanced settings တွင် optional cookie support ကို fallback အဖြစ် ရရှိနိုင်ပါသည်။",
  faq_q6: "Arroxy ကို မည်သည့်ဘာသာစကားများဖြင့် ရနိုင်သနည်း?",
  faq_a6:
    "နှစ်ဆယ့်တစ်မျိုး၊ အသင့်ပါ: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), हिन्दी (Hindi), Afaan Oromoo, Kiswahili, O'zbekcha (Uzbek), Tiếng Việt (Vietnamese), አማርኛ (Amharic), العربية (Arabic), اردو (Urdu), پښتو (Pashto), বাংলা (Bengali), မြန်မာဘာသာ, Ελληνικά (Greek), နှင့် Српски (Serbian)။ Arroxy သည် ပထမဆုံး ဖွင့်ချိန်တွင် သင့် operating system ၏ ဘာသာစကားကို အလိုအလျောက် ရှာဖွေပြီး toolbar ရှိ ဘာသာစကားရွေးချယ်မှုမှ မည်သည့်အချိန်မဆို ပြောင်းနိုင်သည်။ Runtime locale JSON များသည် src/shared/i18n/locales/ တွင်ရှိပြီး ဘာသာပြန်သူများအတွက် PO catalog များသည် i18n/locales/ တွင်ရှိသည် — ပါဝင်ကူညီရန် GitHub တွင် PR တင်ပါ။",
  faq_q7: "အခြားအရာများ ထည့်သွင်းရန်လိုသလား?",
  faq_a7:
    "မလိုပါ။ yt-dlp သည် ပထမဆုံး ဖွင့်ချိန်တွင် အလိုအလျောက် ဒေါင်းလုဒ်လုပ်ပြီး သင့်စက်တွင် cache လုပ်သည်; ffmpeg နှင့် ffprobe သည် app နှင့်အတူ ပါလာသည်။ ထို့နောက် နောက်ထပ် setup မလိုအပ်ပါ။",
  faq_q8: "Playlist များ သို့မဟုတ် channel တစ်ခုလုံး ဒေါင်းလုဒ်ဆွဲနိုင်သလား?",
  faq_a8:
    "ရပါတယ် — နှစ်မျိုးလုံး။ playlist သို့မဟုတ် channel URL ကို paste လုပ်ပါ (ဥပမာ `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); scan လုပ်မည့် entries အရေအတွက်ကိုရွေးပြီး စာရင်းတစ်ခုလုံးကို queue ထဲထည့်ပါ သို့မဟုတ် video များကို သီးသန့်ရွေးပါ။ date-range filters မကြာမီလာပါမည်။",
  faq_q9: 'macOS က "app ပျက်စီးနေသည်" ဟုဆိုသည် — ဘာလုပ်ရမည်နည်း?',
  faq_a9:
    '၎င်းသည် macOS Gatekeeper သည် unsigned app ကို ပိတ်ဆို့ခြင်းဖြစ်ပြီး တကယ်ပျက်စီးမှုမဟုတ်ပါ။ ["App is damaged" — Terminal fix](#macos-first-launch) ကိုကြည့်ပါ၊ ၎င်းကိုဖြေရှင်းသည့် တစ်ကြောင်းတည်းသော `xattr` command ပါဝင်သည်။',
  faq_q10: "YouTube ဗီဒီယိုများ ဒေါင်းလုဒ်ဆွဲခြင်း တရားဝင်ပါသလား?",
  faq_a10:
    "ကိုယ်ရေးကိုယ်တာ သုံးစွဲမှုအတွက် ကိုယ်ရေးကိုယ်တာ purposes အတွက် နိုင်ငံအများစုတွင် ယေဘုယျအားဖြင့် လက်ခံသည်။ YouTube ၏ [Terms of Service](https://www.youtube.com/t/terms) နှင့် သင့်ဒေသခံ copyright ဥပဒေများနှင့် ကိုက်ညီသည်ကို သင်ကိုယ်တိုင် တာဝန်ယူရသည်။",
  plan_intro: "ဆက်လက်စီစဉ်ထားသည် — ဦးစားပေးအစဉ်လိုက် ခန့်မှန်းအားဖြင့်:",
  plan_col1: "လုပ်ဆောင်ချက်",
  plan_col2: "ဖော်ပြချက်",
  plan_r1_name: "**Playlist နှင့် channel filters**",
  plan_r1_desc:
    "playlist သို့မဟုတ် channel ကို enumerate လုပ်သည့်အခါ date-range filters",
  plan_r2_name: "**YouTube audio track preference များ**",
  plan_r2_desc:
    "YouTube တွင် audio tracks များစွာရှိပါက app တစ်ခုလုံးအတွက် spoken-language track preference သတ်မှတ်ပြီး profile တစ်ခုချင်းစီမှာ override လုပ်ပါ",
  plan_r6_name: "**App ထဲရှိ browser sign-in**",
  plan_r6_desc:
    "Arroxy ထဲတွင် browser windows ဖွင့်ပြီး sign in လုပ်ကာ site cookies ကို manually export မလုပ်ဘဲ အသုံးပြုနိုင်ရန်",
  plan_r8_name: "**တစ်ချက်နှိပ် video download**",
  plan_r8_desc:
    "active profile ဖြင့် detected သို့မဟုတ် pasted URL မှ video download ကို တစ်ချက်နှိပ်၍ စတင်ပါ",
  plan_r3_name: "**ပိုမိုခိုင်မာသော retry recovery**",
  plan_r3_desc:
    "မတည်ငြိမ်သော သို့မဟုတ် ပြဿနာရှိသော internet connection ကြောင့် ပြတ်တောက်သွားသော downloads များအတွက် retry လမ်းကြောင်းအသစ်",
  plan_r4_name: "**ပြည့်စုံသော download manager drawer**",
  plan_r4_desc:
    "queue drawer ကို ပိုမိုပြည့်စုံသော manager အဖြစ် ပြောင်းလဲပြီး queued items များအတွက် destination folder ပြောင်းလဲနိုင်ရန်",
  plan_r5_name: "**ဒေါင်းလုဒ်ချိန်သတ်မှတ်ခြင်း**",
  plan_r5_desc: "သတ်မှတ်ချိန်တွင် queue ကို စတင်ပါ (ညဘက် runs)",
  plan_r7_name: "**Clip ဖြတ်တောက်ခြင်း**",
  plan_r7_desc: "start/end time ဖြင့် segment တစ်ခုသာ ဒေါင်းလုဒ်ဆွဲပါ",
  plan_cta:
    "လုပ်ဆောင်ချက်တစ်ခု ကြံဆထားပါသလား? [Request တင်ပါ](../../issues) — community input က ဦးစားပေးမှုကို ပုံဖော်သည်။",
  tech_content: TECH_CONTENT,
  tos_h2: "အသုံးပြုမှုသဘောတူညီချက်",
  tos_note:
    "Arroxy သည် ကိုယ်ရေးကိုယ်တာ သုံးစွဲမှုအတွက်သာ tool ဖြစ်သည်။ သင့် downloads သည် YouTube ၏ [Terms of Service](https://www.youtube.com/t/terms) နှင့် သင့်နိုင်ငံ၏ copyright ဥပဒေများနှင့် ကိုက်ညီကြောင်း သေချာစေရန် တာဝန်သည် သင့်ကိုယ်သင်တွင်သာ ရှိသည်။ သင့်တွင် အသုံးပြုခွင့်မရှိသောကြောင့် content ကို ဒေါင်းလုဒ်ဆွဲ၊ ထပ်ဆင့်ဖြန့်ဝေ သို့မဟုတ် ဖြန့်ဖြူးရန် Arroxy ကို မသုံးပါနှင့်။ Developer များသည် မည်သည့် အလွဲသုံးမှုမဆိုအတွက် တာဝန်ကင်းသည်။",
  footer_credit:
    'MIT License · <a href="https://x.com/OrionusAI">@OrionusAI</a> မှ ဂရုတစိုက်ဖန်တီးထားသည်',
};
