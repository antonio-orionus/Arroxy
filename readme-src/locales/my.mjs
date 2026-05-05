const TECH_CONTENT = `<details>
<summary><strong>နည်းပညာ stack</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — ဒေါင်းလုဒ်နှင့် mux engine (ပထမဆုံး launch လုပ်သောအခါ GitHub မှ fetch လုပ်ပြီး အမြဲ up-to-date ဖြစ်နေသည်)
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

> yt-dlp နှင့် ffmpeg များကို bundle ထည့်မထားပါ — ၎င်းတို့ကို ပထမဆုံး launch လုပ်သောအခါ official GitHub releases မှ download ဆင်းပြီး app data folder တွင် cache သိမ်းထားသည်။

</details>`;

export const my = {
  icon_alt: "Arroxy မုဒ်ကော့",
  title: "Arroxy — Windows, macOS နှင့် Linux အတွက် အခမဲ့ Open-Source YouTube Downloader",
  read_in_label: "ဘာသာဖြင့် ဖတ်ရှုရန်:",
  badge_release_alt: "Release",
  badge_build_alt: "Build",
  badge_license_alt: "လိုင်စင်",
  badge_platforms_alt: "Platforms",
  badge_i18n_alt: "ဘာသာစကားများ",
  badge_website_alt: "ဝဘ်ဆိုက်",
  hero_desc:
    "မည်သည့် YouTube ဗီဒီယို၊ Short သို့မဟုတ် audio track ကိုမဆို မူလအရည်အသွေးဖြင့် ဒေါင်းလုဒ်ဆွဲပါ — 60 fps တွင် 4K HDR အထိ၊ သို့မဟုတ် MP3 / AAC / Opus အဖြစ်။ Windows, macOS နှင့် Linux တွင် သင့်ကွန်ပျူတာပေါ်တွင်သာ run ပါသည်။ **ကြော်ငြာမပါ၊ login မလိုအပ်၊ browser cookie မလိုအပ်၊ Google account ချိတ်ဆက်မှုမပါ။**",
  cta_latest: "↓ နောက်ဆုံး Release ကို ဒေါင်းလုဒ်ဆွဲပါ",
  cta_website: "ဝဘ်ဆိုက်",
  demo_alt: "Arroxy demo",
  star_cta: "Arroxy သည် သင့်အချိန်ကို သက်သာစေပါက ⭐ တစ်ချက်က အခြားသူများ ရှာတွေ့ရန် ကူညီပါသည်။",
  ai_notice: "",
  toc_heading: "မာတိကာ",
  why_h2: "Arroxy ဘာကြောင့်",
  nocookies_h2: "Cookie မပါ၊ login မပါ၊ account ချိတ်ဆက်မှုမပါ",
  features_h2: "လုပ်ဆောင်ချက်များ",
  dl_h2: "ဒေါင်းလုဒ်",
  privacy_h2: "ကိုယ်ရေးကိုယ်တာ",
  faq_h2: "မေးလေ့ရှိသောမေးခွန်းများ",
  roadmap_h2: "Roadmap",
  tech_h2: "တည်ဆောက်ထားသောနည်းပညာ",
  why_intro: "အသုံးများဆုံး alternatives များနှင့် side-by-side နှိုင်းယှဉ်ချက်:",
  why_r1: "အခမဲ့၊ premium tier မပါ",
  why_r2: "Open source",
  why_r3: "Local processing သာ",
  why_r4: "Login သို့မဟုတ် cookie export မလိုအပ်",
  why_r5: "အသုံးပြုမှုကန့်သတ်ချက်မပါ",
  why_r6: "Cross-platform desktop app",
  why_r7: "Subtitles + SponsorBlock",
  why_summary:
    "Arroxy ကို တစ်ခုတည်းသောရည်ရွယ်ချက်ဖြင့် တည်ဆောက်ထားသည်: URL ကို paste လုပ်ပြီး ကောင်းမွန်သောသော local file ကိုရရှိပါ။ Account မပါ၊ upsell မပါ၊ data ကောက်ခံမှုမပါ။",
  nocookies_intro:
    "ဤသည်မှာ desktop YouTube downloader များ ချွတ်ယွင်းရခြင်း၏ အဖြစ်များဆုံးအကြောင်းရင်းဖြစ်ပြီး Arroxy တည်ရှိရသည့် အဓိကအကြောင်းရင်းလည်းဖြစ်သည်။",
  nocookies_setup:
    "YouTube က bot detection ကို အပ်ဒိတ်လုပ်သည့်အခါ tool အများစုသည် သင့်ဘရောက်ဇာ၏ YouTube cookie များကို workaround အဖြစ် export လုပ်ရန် ပြောကြသည်။ ၎င်းနှင့်ပတ်သက်သော ပြဿနာနှစ်ရပ်ရှိသည်:",
  nocookies_p1:
    "Export ထားသော sessions များသည် ပုံမှန်အားဖြင့် ~30 မိနစ်အတွင်း သက်တမ်းကုန်ဆုံးသောကြောင့် အမြဲ re-export လုပ်နေရသည်။",
  nocookies_p2:
    "yt-dlp ၏ ကိုယ်ပိုင်စာတမ်းများသည် [cookie-based automation သည် သင့် Google account ကို flag လုပ်နိုင်ကြောင်း သတိပေးထားသည်](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)။",
  nocookies_outro:
    "**Arroxy သည် cookie၊ login သို့မဟုတ် မည်သည့် credential ကိုမျှ တောင်းဆိုခြင်းမရှိပါ။** ၎င်းသည် YouTube က မည်သည့်ဘရောက်ဇာကိုမဆို ပေးသော public tokens များကိုသာ အသုံးပြုသည်။ သင့် Google identity နှင့် ချိတ်ဆက်မှုမပါ၊ သက်တမ်းကုန်ဆုံးမည့်အရာမပါ၊ rotate လုပ်ရမည့်အရာမပါ။",
  feat_quality_h3: "အရည်အသွေးနှင့် format များ",
  feat_quality_1: "**4K UHD (2160p)** အထိ၊ 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**High frame rate** ကို မူရင်းအတိုင်း ထိန်းသိမ်း — 60 fps, 120 fps, HDR",
  feat_quality_3: "MP3, AAC သို့မဟုတ် Opus သို့ **Audio-only** export",
  feat_quality_4: "အမြန် presets: *အကောင်းဆုံးအရည်အသွေး* · * မျှတသော* · *ဖိုင်ငယ်*",
  feat_privacy_h3: "ကိုယ်ရေးကိုယ်တာနှင့် ထိန်းချုပ်မှု",
  feat_privacy_1:
    "100% local processing — ဒေါင်းလုဒ်များသည် YouTube မှ တိုက်ရိုက် သင့် disk သို့ သွားသည်",
  feat_privacy_2: "Login မပါ၊ cookie မပါ၊ Google account ချိတ်ဆက်မှုမပါ",
  feat_privacy_3: "သင်ရွေးချယ်သောဖိုဒါတွင် ဖိုင်များကို တိုက်ရိုက်သိမ်းဆည်းသည်",
  feat_workflow_h3: "Workflow",
  feat_workflow_1:
    "**မည်သည့် YouTube URL မဆို Paste လုပ်ပါ** — ဗီဒီယိုများနှင့် Shorts နှစ်မျိုးစလုံး ပံ့ပိုးသည်",
  feat_workflow_2:
    "**Multi-download queue** — downloads များစွာကို တပြိုင်တည်း ခြေရာခံပါ",
  feat_workflow_3:
    "**Clipboard watch** — YouTube link ကို copy လုပ်ပြီး app ကို refocus လုပ်သောအခါ Arroxy သည် URL ကို auto-fill လုပ်သည် (Advanced settings တွင် toggle နှိပ်ပါ)",
  feat_workflow_4:
    "**Auto-clean URLs** — tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ကိုဖယ်ရှားပြီး `youtube.com/redirect` links ကိုဖြေရှင်းသည်",
  feat_workflow_5:
    "**Tray mode** — window ကိုပိတ်လျှင် downloads များသည် နောက်ကွယ်တွင် ဆက်လည်ပတ်နေသည်",
  feat_workflow_6:
    "**ဘာသာစကား ၉ မျိုး** — system locale ကို auto-detect လုပ်ပြီး မည်သည့်အချိန်မဆို ပြောင်းလဲနိုင်သည်",
  feat_post_h3: "Subtitles နှင့် post-processing",
  feat_post_1:
    "SRT, VTT သို့မဟုတ် ASS တွင် **Subtitles** — ကိုယ်တိုင်ရိုက်ထည့်ထားသော သို့မဟုတ် auto-generated၊ မည်သည့် language မဆို",
  feat_post_2:
    "ဗီဒီယိုဘေးတွင်သိမ်းပါ၊ `.mkv` ထဲ embed လုပ်ပါ၊ သို့မဟုတ် `Subtitles/` subfolder တွင် စီစဉ်ပါ",
  feat_post_3:
    "**SponsorBlock** — sponsors, intros, outros, self-promos ကို ကျော်ပြီး chapter-mark လုပ်ပါ",
  feat_post_4:
    "**Embedded metadata** — ခေါင်းစဉ်၊ upload date, channel, description, thumbnail နှင့် chapter markers တို့ကို ဖိုင်ထဲသို့ ရေးသွင်းသည်",
  shot1_alt: "URL တစ်ခု Paste လုပ်ပါ",
  shot2_alt: "သင့်အရည်အသွေးကို ရွေးချယ်ပါ",
  shot3_alt: "သိမ်းဆည်းမည့်နေရာကို ရွေးချယ်ပါ",
  shot4_alt: "Download queue လုပ်ဆောင်မှု",
  shot5_alt: "Subtitle ဘာသာစကားနှင့် format ရွေးချယ်မှု",
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
  privacy_p1:
    "Downloads များကို [yt-dlp](https://github.com/yt-dlp/yt-dlp) မှတဆင့် YouTube မှ တိုက်ရိုက် သင်ရွေးချယ်သောဖိုဒါသို့ fetch လုပ်သည် — third-party server မှတဆင့် routing မလုပ်ပါ။ ကြည့်ရှုမှတ်တမ်း၊ ဒေါင်းလုဒ်မှတ်တမ်း၊ URL များနှင့် ဖိုင်အကြောင်းအရာများသည် သင့်ကိရိယာပေါ်တွင်သာ ကျန်ရှိသည်။",
  privacy_p2:
    "Arroxy သည် [Aptabase](https://aptabase.com) မှတဆင့် anonymous aggregate telemetry ပေးပို့သည် — indie project တစ်ခုအတွက် တစ်ယောက်ယောက်က တကယ်အသုံးပြုနေသည်ကို မြင်နိုင်ရုံလောက် (launches, OS, app version, crashes)။ URL မပါ၊ ဗီဒီယိုခေါင်းစဉ်မပါ၊ ဖိုင် path မပါ၊ IP မပါ၊ account info မပါ — Aptabase သည် design အားဖြင့် open-source ဖြစ်ပြီး GDPR-friendly ဖြစ်သည်။ Settings တွင် opt out လုပ်နိုင်သည်။",
  faq_q1: "တကယ်ကို အခမဲ့လား?",
  faq_a1: "ဟုတ်သည် — MIT licensed၊ premium tier မပါ၊ feature gating မပါ။",
  faq_q2: "မည်သည့် ဗီဒီယိုအရည်အသွေးများ ဒေါင်းလုဒ်ဆွဲနိုင်သနည်း?",
  faq_a2:
    "YouTube ပေးသောအရာများအားလုံး: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p နှင့် audio-only။ 60 fps, 120 fps နှင့် HDR streams များကို မူရင်းအတိုင်း ထိန်းသိမ်းသည်။",
  faq_q3: "Audio ကိုသာ MP3 အဖြစ် ထုတ်ယူနိုင်သလား?",
  faq_a3: "ဟုတ်သည်။ Format menu တွင် *audio-only* ကိုရွေးပြီး MP3, AAC သို့မဟုတ် Opus ကိုရွေးပါ။",
  faq_q4: "YouTube account သို့မဟုတ် cookie လိုအပ်သလား?",
  faq_a4:
    "မလိုအပ်ပါ။ Arroxy သည် YouTube က မည်သည့်ဘရောက်ဇာကိုမဆို ပေးသော public tokens များကိုသာ အသုံးပြုသည်။ Cookie မပါ၊ login မပါ၊ credential မသိမ်းဆည်းပါ။ ၎င်းသည် အဘယ်ကြောင့် အရေးကြီးသည်ကို [Cookie မပါ၊ login မပါ၊ account ချိတ်ဆက်မှုမပါ](#no-cookies) တွင် ကြည့်ပါ။",
  faq_q5: "YouTube တွင် တစ်ခုခုပြောင်းသောအခါ ဆက်လက်အလုပ်လုပ်မည်လား?",
  faq_a5:
    "ခံနိုင်ရည်ရှိမှုနှစ်ထပ်: yt-dlp သည် YouTube ပြောင်းလဲမှုများ ဖြစ်ပြီး နာရီပိုင်းအတွင်း update လုပ်သည်၊ Arroxy သည် ~30 မိနစ်တိုင်း သက်တမ်းကုန်ဆုံးသော cookie များပေါ်တွင် မမှီခိုပါ။ ၎င်းကြောင့် export လုပ်ထားသော browser session များပေါ်တွင် မှီခိုသော tools များထက် သိသာစွာ ပိုတည်ငြိမ်သည်။",
  faq_q6: "Arroxy ကို မည်သည့်ဘာသာစကားများဖြင့် ရနိုင်သနည်း?",
  faq_a6:
    "ကိုးမျိုး: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी။ သင့် system language ကို auto-detect လုပ်ပြီး toolbar မှ မည်သည့်အချိန်မဆို ပြောင်းနိုင်သည်။ Locale ဖိုင်များသည် `src/shared/i18n/locales/` တွင် plain TypeScript objects ဖြစ်သည် — [PR ဖိတ်ကြိုသည်](../../pulls)။",
  faq_q7: "အခြားအရာများ ထည့်သွင်းရန်လိုသလား?",
  faq_a7:
    "မလိုအပ်ပါ။ yt-dlp နှင့် ffmpeg တို့ကို ပထမဆုံး launch လုပ်သောအခါ official GitHub releases မှ အလိုအလျောက် download ဆင်းပြီး locally cache သိမ်းသည်။",
  faq_q8: "Playlist များ သို့မဟုတ် channel တစ်ခုလုံး ဒေါင်းလုဒ်ဆွဲနိုင်သလား?",
  faq_a8:
    "ယနေ့တွင် single videos နှင့် Shorts သာ။ Playlist နှင့် channel ပံ့ပိုးမှုသည် [roadmap](#roadmap) တွင် ပါဝင်သည်။",
  faq_q9: 'macOS က "app ပျက်စီးနေသည်" ဟုဆိုသည် — ဘာလုပ်ရမည်နည်း?',
  faq_a9:
    "၎င်းသည် macOS Gatekeeper သည် unsigned app ကို ပိတ်ဆို့ခြင်းဖြစ်ပြီး တကယ်ပျက်စီးမှုမဟုတ်ပါ။ ဖြေရှင်းနည်းအတွက် [macOS တွင် ပထမဆုံး launch လုပ်ခြင်း](#download) section ကိုကြည့်ပါ။",
  faq_q10: "YouTube ဗီဒီယိုများ ဒေါင်းလုဒ်ဆွဲခြင်း တရားဝင်ပါသလား?",
  faq_a10:
    "ကိုယ်ရေးကိုယ်တာ သုံးစွဲမှုအတွက် ကိုယ်ရေးကိုယ်တာ purposes အတွက် နိုင်ငံအများစုတွင် ယေဘုယျအားဖြင့် လက်ခံသည်။ YouTube ၏ [Terms of Service](https://www.youtube.com/t/terms) နှင့် သင့်ဒေသခံ copyright ဥပဒေများနှင့် ကိုက်ညီသည်ကို သင်ကိုယ်တိုင် တာဝန်ယူရသည်။",
  plan_intro: "အနီးကပ် ဦးစားပေးအစဉ်လိုက် လာမည့်အရာများ:",
  plan_col1: "လုပ်ဆောင်ချက်",
  plan_col2: "ဖော်ပြချက်",
  plan_r1_name: "**Playlist နှင့် channel ဒေါင်းလုဒ်များ**",
  plan_r1_desc:
    "Playlist သို့မဟုတ် channel URL ကို paste လုပ်ပါ; date သို့မဟုတ် count filters ဖြင့် ဗီဒီယိုများအားလုံးကို queue ထည့်ပါ",
  plan_r2_name: "**Batch URL input**",
  plan_r2_desc: "URLs များစွာကို တစ်ကြိမ်တည်း paste လုပ်ပြီး တစ်ကြိမ်တည်း run ပါ",
  plan_r3_name: "**Format ပြောင်းလဲခြင်း**",
  plan_r3_desc: "သီးခြား tool မလိုဘဲ downloads ကို MP3, WAV, FLAC သို့ ပြောင်းလဲပါ",
  plan_r4_name: "**Custom filename templates**",
  plan_r4_desc:
    "ဖိုင်များကို ခေါင်းစဉ်၊ uploader, date, resolution ဖြင့် နာမည်ပေးပြီး live preview ဖြင့်",
  plan_r5_name: "**ဒေါင်းလုဒ်ချိန်သတ်မှတ်ခြင်း**",
  plan_r5_desc: "သတ်မှတ်ချိန်တွင် queue ကို စတင်ပါ (ညဘက် runs)",
  plan_r6_name: "**Speed limits**",
  plan_r6_desc: "ဒေါင်းလုဒ်များသည် သင့် connection ကို မပြည့်လျှံစေရန် bandwidth ကို cap လုပ်ပါ",
  plan_r7_name: "**Clip trimming**",
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
