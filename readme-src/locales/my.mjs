const TECH_CONTENT = `<details>
<summary><strong>နည်းပညာ stack</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **yt-dlp** + **ffmpeg** — download နှင့် mux engine (နှစ်ခုလုံးကို runtime တွင် fetch လုပ်သည်: yt-dlp ကို နောက်ဆုံးပေါ်ဖြစ်အောင် ထိန်းထားပြီး ffmpeg/ffprobe ကို တစ်ကြိမ်သာ install လုပ်ကာ update များအတွင်း ဆက်ထားသည်)
- **Vite** + **electron-vite** — build tooling
- **Vitest** + **Playwright** — unit နှင့် end-to-end tests

</details>

<details>
<summary><strong>Source code မှ Build လုပ်ခြင်း</strong></summary>

### လိုအပ်သောအရာများ — platform အားလုံးအတွက်

| Tool    | ဗားရှင်း | ထည့်သွင်းရန် |
| ------- | ------- | ------- |
| Git     | မည်သည့်ဗားရှင်းမဆို | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` သို့မဟုတ် \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` သို့မဟုတ် \`package.json\` \`packageManager\` |

အကြံပြုချက်: \`mise\` ကို install လုပ်ပြီး checkout အတွင်း \`mise install\` ကို run ပါ။ mise မသုံးပါက \`bun run bootstrap\` မလုပ်ခင် \`.node-version\` မှ Node.js နှင့် \`package.json\` မှ Bun ကို manual activate လုပ်ပါ။

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Native rebuilds အတွက် Visual Studio Build Tools နှင့် Python လိုအပ်နိုင်သည်။

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

clone ပြီးနောက် checkout ထဲတွင် \`mise trust && mise install\` ကို run လုပ်ပါ။ သင့် shell က \`fnm\`, \`nvm\`, သို့မဟုတ် Homebrew Bun ကို အသုံးပြုနေပြီးသားဖြစ်ပါက Arroxy သည် Node.js 24.21.0 နှင့် Bun 1.4.2 ကို သုံးနိုင်ရန် \`~/.zshrc\` တွင် mise ကို activate လုပ်ပါ:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build နှင့် Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clone နှင့် run လုပ်ခြင်း

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # အကြံပြု; pinned tools ကို manual activate လုပ်ထားလျှင် ကျော်နိုင်သည်
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer ဖြင့် Electron app
\`\`\`

### Distributable ကို Build လုပ်ခြင်း

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # လက်ရှိ OS အတွက် package ထုတ်ရန်
bun run dist:win     # supported host တွင် Windows targets package ထုတ်ရန်
\`\`\`

> \`bun run bootstrap\` သည် dependencies ကို install လုပ်ပြီး Electron app dependencies ကို rebuild လုပ်သည်၊ Electron ကို verify လုပ်သည်၊ development အတွက် embedded ffmpeg/ffprobe ကို ပြင်ဆင်သည်၊ Playwright Chromium ကို install လုပ်သည်။ Release build များသည် yt-dlp, ffmpeg နှင့် ffprobe ကို runtime တွင် app data folder ထဲ၌ manage လုပ်ပြီး ၎င်းတို့တစ်ခုမျှ installer ထဲတွင် မပါဝင်ပါ။

</details>`;

export const my = {
  icon_alt: "Arroxy မုဒ်ကော့",
  title:
    "Arroxy — Windows, macOS နှင့် Linux အတွက် built-in browser ပါသော အခမဲ့ Open-Source YouTube (+ ၂၀၀၀ ဆိုဒ်) Downloader",
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
    "**YouTube နှင့် ၂၀၀၀+ ထောက်ပံ့သောဆိုဒ်များ** မှ ဗီဒီယိုများ၊ Shorts၊ သီချင်းများ၊ channel များ၊ podcast များ သို့မဟုတ် audio track များကို ဒေါင်းလုဒ်ဆွဲပါ — 60 fps တွင် 8K HDR အထိ၊ MP3 / AAC / Opus အဖြစ်၊ သို့မဟုတ် လိုအပ်သည့်အပိုင်းကိုသာ။ Explore tab တွင် **Arroxy အတွင်းမှာပင် YouTube သို့မဟုတ် အခြားဝဘ်ဆိုက်ကို ကြည့်ရှုပြီး** သင်ကြည့်နေသော ဗီဒီယို၊ playlist သို့မဟုတ် channel ကို ဒေါင်းလုဒ်လုပ်ပါ၊ သင့်အကောင့်ဖြင့် ကြည့်နိုင်သော private၊ member-only နှင့် အသက်ကန့်သတ်ထားသော ဗီဒီယိုများကို ဒေါင်းလုဒ်လုပ်ရန် ထိုနေရာတွင် sign in လုပ်ပါ။ Windows, macOS နှင့် Linux တွင် သင့်ကွန်ပျူတာပေါ်တွင်သာ run ပါသည်။ **ကြော်ငြာမပါ၊ bloat မပါ၊ upsell မပါ။**",
  cta_latest: "↓ နောက်ဆုံး Release ကို ဒေါင်းလုဒ်ဆွဲပါ",
  cta_website: "ဝဘ်ဆိုက်",
  star_cta:
    "Arroxy သည် သင့်အချိန်ကို သက်သာစေပါက ⭐ တစ်ချက်က အခြားသူများ ရှာတွေ့ရန် ကူညီပါသည်။",
  ai_notice: "",
  toc_heading: "မာတိကာ",
  why_h2: "Arroxy ဘာကြောင့်",
  features_h2: "လုပ်ဆောင်ချက်များ",
  dl_h2: "ထည့်သွင်းခြင်းနှင့် ပထမဆုံးဖွင့်ခြင်း",
  privacy_h2: "ကိုယ်ရေးကိုယ်တာ",
  faq_h2: "မေးလေ့ရှိသောမေးခွန်းများ",
  roadmap_h2: "လမ်းပြမြေပုံ",
  tech_h2: "တည်ဆောက်ထားသောနည်းပညာ",
  why_intro:
    "အသုံးများဆုံး alternatives များနှင့် side-by-side နှိုင်းယှဉ်ချက်:",
  why_r1: "အခမဲ့၊ premium tier မပါ",
  why_r2: "Open source",
  why_r3: "Local processing သာ",
  why_r5: "အသုံးပြုမှုကန့်သတ်ချက်မပါ",
  why_r6: "Cross-platform desktop app",
  why_r7: "Subtitles + SponsorBlock",
  why_r8: "Built-in browser (ကြည့်ရှု၊ sign in၊ ဒေါင်းလုဒ်)",
  why_r9:
    "cookie များ export မလုပ်ဘဲ private၊ member-only နှင့် အသက်ကန့်သတ်ဗီဒီယိုများ",
  why_table_note:
    "⚠️ = တစ်စိတ်တစ်ပိုင်းသာ သို့မဟုတ် ငွေပေးရသော tier တွင်သာ။ private ဗီဒီယိုများအတွက် 4K Video Downloader ၏ app အတွင်း sign-in သည် ငွေပေးရသော feature ဖြစ်သည်၊ အခမဲ့ yt-dlp GUI အများစုသည် cookie ဖိုင်ကိုသာ လက်ခံသည် သို့မဟုတ် သင့် web browser ၏ cookie များကို ဖတ်သည်။",
  why_summary:
    "Arroxy ကို ရည်ရွယ်ချက်တစ်ခုတည်းဖြင့် တည်ဆောက်ထားသည်: URL ကို paste လုပ်သည်ဖြစ်စေ၊ Explore တွင် ဗီဒီယိုကို ရှာတွေ့သည်ဖြစ်စေ သန့်ရှင်းသော local file တစ်ခုကို ရရှိစေရန်ပင်။ upsell မပါ၊ data ကောက်ခံမှုမပါ။",
  why_explore_h3:
    "ရိုးရိုး yt-dlp wrapper တစ်ခု မလုပ်နိုင်သည့်အရာ: Explore tab",
  why_explore_intro:
    "အခမဲ့ YouTube downloader အများစုသည် yt-dlp ပေါ်တွင် URL box တစ်ခု တင်ထားခြင်းသာ ဖြစ်သည်။ Arroxy သည်လည်း yt-dlp ကို အသုံးပြုသော်လည်း app ထဲတွင် တည်ဆောက်ထားပြီး YouTube သို့မဟုတ် အခြားဝဘ်ဆိုက်ကို ဖွင့်နိုင်သော browser ဖြစ်သည့် **Explore** ပါ ပါရှိသည်။ Explore သည် URL box တစ်ခု မကျော်နိုင်သော ကန့်သတ်ချက်များကို ကျော်လွှားပေးသည်:",
  why_explore_1:
    "**အကောင့်လိုသော ဗီဒီယိုများကို cookie export မလုပ်ဘဲ** — private၊ member-only နှင့် အသက်ကန့်သတ်ဗီဒီယိုများ (အသက်အတည်ပြုထားသော အကောင့်ဖြင့်)၊ ထို့အပြင် သင်၏ Watch Later နှင့် Liked စာရင်းများ၊ အခြားဝဘ်ဆိုက်များတွင် sign in ဝင်ရသော ဗီဒီယိုများ။ ရိုးရိုး wrapper တစ်ခုသည် cookies.txt export လိုအပ်သည် သို့မဟုတ် သင့် web browser ၏ cookie များကို ဖတ်ရမည်ဖြစ်ပြီး ယခု Windows ပေါ်ရှိ Chrome က ၎င်းကို ပိတ်ဆို့ထားသည်။ Arroxy တွင်မူ Explore ၌ တစ်ကြိမ် sign in ဝင်ရုံဖြင့် ကျန်အရာများကို ၎င်းက လုပ်ဆောင်ပေးသည်",
  why_explore_2:
    "**\"သင်သည် bot မဟုတ်ကြောင်း အတည်ပြုရန် sign in ဝင်ပါ\"** — YouTube က ဤသို့ မေးလာသောအခါ Arroxy သည် ဒေါင်းလုဒ်ကို မအောင်မြင်ဘဲ ထားခဲ့မည့်အစား သင်၏ Explore sign-in ဖြင့် ထပ်မံကြိုးစားသည်",
  why_explore_3:
    "**YouTube ၏ ဒေါင်းလုဒ် token** — ဒေါင်းလုဒ်မလုပ်မီ YouTube မျှော်လင့်ထားသော token ကို Arroxy ၏ built-in browser က ရယူပေးသည်။ ၎င်းမရှိလျှင် YouTube သည် သင်တောင်းဆိုထားသည်ထက် format နည်းပြီး အရည်အသွေးနိမ့်သည်ကို ပေးနိုင်သည်",
  why_explore_4:
    "**လင့်ခ်ကူးစရာမလို** — Explore တွင် ဗီဒီယို၊ playlist သို့မဟုတ် channel ကို ရှာပြီး တစ်ချက်နှိပ်ရုံဖြင့် ဒေါင်းလုဒ်လုပ်ပါ၊ သို့မဟုတ် စာမျက်နှာပေါ်ရှိ မည်သည့်လင့်ခ်ကိုမဆို right-click နှိပ်ပါ",
  why_explore_5:
    "**လိုချင်သည့်အခါ ကြော်ငြာပိတ်ဆို့** — ဒိုင်းလွှားကို တစ်ချက်နှိပ်ရုံဖြင့် Explore စာမျက်နှာများတွင် ကြော်ငြာနှင့် tracker များကို ပိတ်ဆို့နိုင်သည်",
  feat_explore_h3: "Explore: Arroxy အတွင်းမှာပင် ဝဘ်ကို ကြည့်ရှုပါ",
  feat_explore_1:
    "**Explore tab** — Arroxy အတွင်းမှာပင် YouTube သို့မဟုတ် အခြားဝဘ်ဆိုက်ကို ကြည့်ရှုပြီး လင့်ခ်မကူးဘဲ တွေ့သည့်အရာကို ဒေါင်းလုဒ်လုပ်ပါ။ **ဒေါင်းလုဒ် · *သင့်ပရိုဖိုင်*** သည် သင်ကြည့်နေသော ဗီဒီယို၊ playlist သို့မဟုတ် channel ကို စာရင်းထဲထည့်ပေးသည်၊ ဘေးရှိ မြှားက ပရိုဖိုင်ပြောင်းပေးပြီး မှော်လှံတံက format၊ subtitle စသည်တို့ကို ရွေးရန် အဆင့်ဆင့် ဒေါင်းလုဒ်ကို ဖွင့်ပေးသည်",
  feat_explore_6: "**Right-click ဖြင့် ဒေါင်းလုဒ်** — Explore ရှိ မည်သည့် ဗီဒီယို၊ playlist သို့မဟုတ် channel လင့်ခ်ကိုမဆို right-click နှိပ်ပြီး သင့်ပရိုဖိုင်ဖြင့် ဒေါင်းလုဒ်လုပ်ပါ၊ **ပရိုဖိုင်ဖြင့် ဒေါင်းလုဒ်** မှ အခြားပရိုဖိုင်ကို ရွေးပါ၊ အဆင့်ဆင့် ဒေါင်းလုဒ်ကို ဖွင့်ပါ သို့မဟုတ် လင့်ခ်ကို ကူးယူပါ။ ဗီဒီယိုတစ်ခုချင်းစီကို အရင်ဖွင့်ရန် မလိုပါ",
  feat_explore_7: "**ကျစ်လစ်သော အပြင်အဆင်** — Explore ၏ toolbar ရှိ တစ်ချက်နှိပ်ရုံဖြင့် Arroxy ၏ tab များကို ၎င်းထဲသို့ ရွှေ့ပေးပြီး စာမျက်နှာကို နေရာပိုပေးသည်",
  feat_explore_2:
    "**လိပ်စာဘား** — YouTube တွင် ရှာဖွေရန် ရိုက်ထည့်ပါ သို့မဟုတ် မည်သည့်ဝဘ်လိပ်စာကိုမဆို ရိုက်ထည့်ပြီး ထိုဆိုက်ကို ဖွင့်ပါ",
  feat_explore_3:
    "**အကောင့်လိုသော ဒေါင်းလုဒ်များ** — Explore တွင် တစ်ကြိမ် sign in လုပ်ထားလျှင် Arroxy သည် သင့်အကောင့်ဖြင့် ကြည့်နိုင်သော private နှင့် member-only ဗီဒီယိုများ၊ အသက်အတည်ပြုထားသော အကောင့်ဖြစ်လျှင် အသက်ကန့်သတ်ဗီဒီယိုများ၊ သင်၏ Watch Later နှင့် Liked စာရင်းများကို ဒေါင်းလုဒ်လုပ်နိုင်သည်။ အခြားဝဘ်ဆိုက်များတွင်လည်း ထိုနေရာ၌ sign in လုပ်နိုင်ပြီး ၎င်းတို့၏ ဒေါင်းလုဒ်များသည် လိုအပ်သည့်အခါ ထို sign-in ကို အသုံးပြုသည်။ Arroxy သည် ဦးစွာ sign out အခြေအနေတွင် ဒေါင်းလုဒ်လုပ်ပြီး အကောင့်ဖြင့် ဖြေရှင်းနိုင်သော အကြောင်းရင်းကြောင့် ဒေါင်းလုဒ်မအောင်မြင်မှသာ သင်၏ Explore sign-in ကို အသုံးပြုသည်။ သင်သည် bot မဟုတ်ကြောင်း YouTube က အတည်ပြုခိုင်းသောအခါတွင်လည်း Arroxy က သင်၏ Explore sign-in ကို စမ်းကြည့်သည်",
  feat_explore_4:
    "**အရန်အကောင့် သုံးပါ** — Explore ၏ ပထမဆုံးမျက်နှာပြင်က အကြောင်းရင်းကို ရှင်းပြထားသည် - အကောင့်ဖြင့် ဒေါင်းလုဒ်လုပ်ခြင်းသည် ထိုအကောင့် ကန့်သတ်ခံရနိုင်သည့် အန္တရာယ် အနည်းငယ်ရှိသည်။ sign-in အားလုံးကို မေ့စေလိုသည့်အခါ ဆက်တင်များမှ Explore ကို အချိန်မရွေး sign out လုပ်ပါ",
  feat_explore_5:
    "**ကြော်ငြာပိတ်ဆို့ကိရိယာ** — မူရင်းအတိုင်း ပိတ်ထားသည်။ Explore toolbar ရှိ ဒိုင်းလွှားကို တစ်ချက်နှိပ်ရုံဖြင့် Explore စာမျက်နှာများတွင် ကြော်ငြာနှင့် tracker များကို ပိတ်ဆို့ပေးပြီး ဒေါင်းလုဒ်များကို မထိခိုက်ပါ။ sign in ဝင်ထားသော အကောင့်များအတွက် YouTube က ကြော်ငြာပိတ်ဆို့ကိရိယာကို ပြန်လည်တားဆီးနိုင်သည်",
  feat_quality_h3: "အရည်အသွေးနှင့် format များ",
  feat_quality_1: "**8K (4320p)** အထိ၊ 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2:
    "**High frame rate နှင့် HDR** ကို မူရင်းအတိုင်း ထိန်းသိမ်း — 60 fps, HDR10",
  feat_quality_3:
    "**အသံ** — အသံသာကို MP3၊ M4A/AAC၊ Opus သို့မဟုတ် WAV အဖြစ် export လုပ်ပါ။ interactive downloads တွင် ရနိုင်ပါက source ၏ native surround/Dolby tracks (AC-3၊ E-AC-3၊ 5.1၊ DRC) ကို ရွေးချယ်ပါ၊ သို့မဟုတ် global default **surround / Dolby ကို ဦးစားပေးပါ** ကို သတ်မှတ်ပါ",
  feat_quality_4:
    "**ရည်မှန်းချက်ပါသော ပရိုဖိုင်များ** — *အကောင်းဆုံး ရုပ်ထွက်* (AV1 · VP9) သို့မဟုတ် *စမတ် TV* (MP4 · H.264)၊ ပြန်လည် encode မလုပ်ဘဲ အလိုအလျောက်၊ MP4၊ MKV သို့မဟုတ် WebM အဖြစ် သိမ်းဆည်းသည်။ HDR သည် *အလိုအလျောက်* (သင့်စခရင်ပြသနိုင်မှသာ)၊ *SDR* သို့မဟုတ် *HDR* ဖြစ်သည်",
  feat_quality_5:
    "**ကြည်လင်ပြတ်သားမှုတိုင်းတွင် codec တိုင်း** — အဆင့်ဆင့် ဒေါင်းလုဒ်သည် ကြည်လင်ပြတ်သားမှု တစ်ခုစီတွင် AV1, VP9 နှင့် H.264 ကို ဘေးချင်းယှဉ် ပြသပေးသဖြင့် သင့် TV သို့မဟုတ် editor ဖွင့်နိုင်သည့်တစ်ခုကို ရွေးနိုင်သည်",
  feat_quality_6:
    "**Stream တစ်ခု အမှန်တကယ် ဘာလဲဆိုတာ သိပါ** — YouTube က AI ဖြင့် ချဲ့ထားသော အရွယ်အစားများ၊ AI အသံသွင်းထားသော အသံဘာသာစကားများ၊ မြှင့်ထားသော bitrate ပါသည့် streams များ၊ 360° ဗီဒီယိုများနှင့် ပျက်စီးနေသော သို့မဟုတ် watermark ပါသော မိတ္တူများကို အမှတ်အသားပြထားသည်။ သင်ခွင့်မပြုလျှင် ပရိုဖိုင်များသည် AI ချဲ့ထားသော streams များကို ကျော်သွားသည်",
  feat_privacy_h3: "ကိုယ်ရေးကိုယ်တာနှင့် ထိန်းချုပ်မှု",
  feat_privacy_1:
    "100% local processing — ဒေါင်းလုဒ်များသည် YouTube မှ တိုက်ရိုက် သင့် disk သို့ သွားသည်",
  feat_privacy_2: "Login မပါ၊ cookie မပါ၊ Google account ချိတ်ဆက်မှုမပါ",
  feat_privacy_3: "သင်ရွေးချယ်သောဖိုဒါတွင် ဖိုင်များကို တိုက်ရိုက်သိမ်းဆည်းသည်",
  feat_workflow_h3: "Workflow",
  feat_workflow_12: "**စနစ်တစ်ခုလုံးအတွက် ဒေါင်းလုဒ် ဖြတ်လမ်းခလုတ်** — မည်သည့်အက်ပ်တွင်မဆို လင့်ခ်ကို ကူးယူပြီး `Ctrl+Shift+D` (macOS တွင် `Cmd+Shift+D`) ကိုနှိပ်ပါ။ Arroxy သည် ဝင်းဒိုးမဖွင့်ဘဲ သင့်လက်ရှိပရိုဖိုင်ဖြင့် စာရင်းထဲထည့်ပေးပြီး အသိပေးချက်ဖြင့် အတည်ပြုပါသည်။ မူရင်းအတိုင်း ဖွင့်ထားပြီး ပြန်သတ်မှတ်နိုင်သည်",
  feat_workflow_1:
    "**ပြောင်းလွယ်ပြင်လွယ် စတင်မုဒ်များ** — လမ်းညွှန်ထားသော single download၊ playlist/channel picker၊ bulk URL paste၊ သိမ်းထားသော defaults ဖြင့် Quick Download၊ သို့မဟုတ် Explore တွင် ကြည့်ရှုပြီး ဒေါင်းလုဒ်လုပ်ခြင်းတို့ကို ရွေးပါ",
  feat_workflow_2:
    "**ဗဟို download queue** — single၊ playlist၊ bulk၊ quick job အားလုံးသည် progress၊ pause၊ resume၊ cancel၊ retry နှင့် priority control အတွက် တစ်နေရာတည်းသို့ ရောက်သည်",
  feat_workflow_3:
    "**Clipboard watch** — ဗီဒီယိုလင့်ခ်ကို copy လုပ်ပါက Arroxy သို့ ပြန်လာသောအခါ URL အကွက်ကို ဖြည့်ပေးပြီး မရည်ရွယ်ခဲ့လျှင် **ပြန်ဖျက်ရန်** ပါသည်။ Arroxy အလုပ်များနေစဉ် သင် URL tab သို့ ပြန်ရောက်သည်အထိ လင့်ခ်က စောင့်နေသည် (ဆက်တင်များတွင် ပိတ်နိုင်သည်)",
  feat_workflow_4:
    "**Auto-clean URLs** — tracking params (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ကိုဖယ်ရှားပြီး `youtube.com/redirect` links ကိုဖြေရှင်းသည်",
  feat_workflow_5:
    "**Tray mode** — window ကိုပိတ်လျှင် downloads များသည် နောက်ကွယ်တွင် ဆက်လည်ပတ်နေသည်",
  feat_workflow_6:
    "**{{LANG_COUNT}} ဘာသာစကား** — စနစ်ဒေသကို အလိုအလျောက်သိရှိနိုင်ပြီး အချိန်မရွေးပြောင်းနိုင်သည်",
  feat_workflow_7:
    "**Playlist sync** — ဒေါင်းလုဒ်လုပ်ပြီးသား ဗီဒီယိုများကို ကျော်ရန် playlist ကို local folder နှင့် ပြန်စစ်ဆေးပြီး၊ ဗီဒီယိုတစ်ခုစီ ဒေါင်းလုဒ်ပြီးတိုင်း အပ်ဒိတ်ဖြစ်သော `.m3u` playlist ဖိုင်ကို ဖန်တီးသည်",
  feat_workflow_8:
    "**Speed နှင့် pacing controls** — download bandwidth ကိုကန့်သတ်ပါ၊ ဗီဒီယိုအပိုင်းမည်မျှကို တစ်ပြိုင်နက် download လုပ်မည်ကို သတ်မှတ်ပါ၊ presets (*Off · Balanced · Careful · Custom*) ဖြင့် request delays ထည့်ပါ",
  feat_workflow_9:
    "**ဖိုင်အမည် ပုံစံခွက်များ** — `{title}`၊ `{uploader}`၊ `{id}`၊ `{date}`၊ `{resolution}` နှင့် `{playlist_index}` တို့ဖြင့် ဒေါင်းလုဒ်များကို သင်နှစ်သက်သလို အမည်ပေးပါ။ အထွေထွေ သို့မဟုတ် ဒေါင်းလုဒ်ပရိုဖိုင်တစ်ခုစီအလိုက် သတ်မှတ်နိုင်သည်",
  feat_workflow_10:
    "**တစ်ပြိုင်နက် ဒေါင်းလုဒ်များ နှင့် အလိုအလျောက် ပြန်ကြိုးစားမှု** — တန်းစီထားသော ဒေါင်းလုဒ်မည်မျှကို တစ်ပြိုင်နက် လုပ်မည်ကို ရွေးပါ၊ ကွန်ရက် သို့မဟုတ် ဆာဗာ ပြဿနာ ကြုံရသော ဒေါင်းလုဒ်ကို Arroxy သည် ကြိုးစားမှုတိုင်းမတိုင်မီ ပိုကြာစွာ စောင့်ပြီး ပြန်ကြိုးစားပါမည်",
  feat_workflow_11:
    "**Playlist ရှိ item တစ်ခုချင်းအတွက် ပရိုဖိုင်** — list တစ်ခုလုံးအတွက် setting တစ်ခုတည်း အသုံးပြုမည့်အစား၊ playlist ထဲက ဗီဒီယိုတစ်ခုစီကို ၎င်းတို့ ကိုယ်ပိုင် ဒေါင်းလုဒ်ပရိုဖိုင် သတ်မှတ်ပေးနိုင်သဖြင့် တစ်ကြိမ်တည်းတွင် အချို့ကို အရည်အသွေးအပြည့်ဖြင့် သိမ်းဆည်းပြီး ကျန်တာကို MP3 အနေနှင့် ရယူနိုင်သည်",
  feat_workflow_13:
    "**Quick Download သည် နောက်ခံတွင် အလုပ်လုပ်သည်** — လင့်ခ်သည် ဒေါင်းလုဒ်များထဲတွင် ချက်ချင်းပေါ်လာပြီး ထိုနေရာတွင်ပင် ပြင်ဆင်ပေးကာ **ကြည့်ရန်** ပါသော မှတ်စုက အတည်ပြုပေးပြီး နောက်လင့်ခ်အတွက် URL အကွက်ကို ရှင်းပေးသည်။ ယခင်ဟာများ ပြင်ဆင်နေစဉ်မှာပင် လိုသလောက် စတင်နိုင်သည်",
  feat_workflow_14:
    "**ဒေါင်းလုဒ်များက သင့်အကူအညီလိုသည်ကို ပြောပြသည်** — Arroxy က လင့်ခ်ကို မဖတ်နိုင်ပါက ၎င်း၏အတန်းတွင် အကြောင်းရင်းကိုပြပြီး ဖြေရှင်းနည်းကို အကြံပြုသည် - ထပ်မံကြိုးစားမည်၊ cookie ဖွင့်ပါ သို့မဟုတ် Explore တွင် sign in ဝင်ပါ။ cookie ပိတ်ထားလျှင် သင် sign in ဝင်ပြီးနောက် **Explore ဖြင့် Sign in** က သင့်အတွက် ပြန်စမ်းပေးသည်။ load ကန့်သတ်ချက်ထက် ရှည်သော playlist သည် ၎င်း၏အတန်းပေါ်တွင် စောင့်နေပြီး အားလုံး၊ ပထမအနည်းငယ် သို့မဟုတ် ပြန်လည်စစ်ဆေးခြင်းကို သင်ရွေးရန် စောင့်သည်။ ဒေါင်းလုဒ်များ tab တွင် သင့်ကိုစောင့်နေသော အတန်းအရေအတွက်ကို ပြသည်",
  feat_workflow_15:
    "**ဗီဒီယိုတစ်ခု၏ အပိုင်းတစ်ခုကိုသာ ဒေါင်းလုဒ်လုပ်ပါ** — Format စခရင်တွင် စတင်ချိန်နှင့် ပြီးဆုံးချိန်၊ သို့မဟုတ် အခန်းကန့်တစ်ခုကို ရွေးပါက Arroxy သည် ထိုအပိုင်းကိုသာ သိမ်းပြီး ဗီဒီယို id နောက်တွင် အပိုင်းကို ထည့်၍ အမည်ပေးသည်။ ဖြတ်တောက်မှုများသည် အနီးဆုံး keyframe တွင် ကျသည်၊ တိကျစွာဖြတ်ခြင်းကို ဖွင့်ပါက ပြန်လည် encode လုပ်မည်",
  feat_workflow_16:
    "**ပြီးဆုံးသော ဒေါင်းလုဒ်များကို အလိုအလျောက် ဖယ်ရှားရန်** — ရွေးချယ်နိုင်သည်- ပြီးဆုံးသော ဒေါင်းလုဒ်သည် 5 စက္ကန့်အကြာတွင် စာရင်းမှ ထွက်သွားသည်။ ၎င်း၏ ဖိုင်များ disk ပေါ်တွင် ကျန်ရှိပြီး မအောင်မြင်သော ဒေါင်းလုဒ်များ စာရင်းထဲတွင် ဆက်ရှိနေသည်",
  feat_workflow_17:
    "**ဒေါင်းလုဒ်များရှိ အရွယ်အစားနှင့် မရှိပါ** — စီနိုင်သော **အရွယ်အစား** ကော်လံက ဒေါင်းလုဒ်တစ်ခုစီ နေရာမည်မျှယူသည်ကို ပြပြီး **မရှိပါ** က Arroxy အပြင်ဘက်တွင် ရွှေ့ထား သို့မဟုတ် ဖျက်ထားသော ဖိုင်များကို အမှတ်အသားပြုသည်",
  feat_workflow_18:
    "**အောရိုရာ သို့မဟုတ် ရိုးရှင်း၊ အမှောင် သို့မဟုတ် အလင်း** — ရွေ့လျားနေသော ကောင်းကင်ပေါ်ရှိ ဖန်သားပြားများ သို့မဟုတ် တိတ်ဆိတ်သော အစိုင်အခဲမျက်နှာပြင်များ၊ footer မှ ပြောင်းနိုင်သည်။ ဂရပ်ဖစ်အရှိန်မြှင့်မှု မရှိသော ကွန်ပျူတာများသည် ရိုးရှင်း ကို အလိုအလျောက် ရရှိသည်",
  feat_workflow_19:
    "**Mac menu bar** — macOS တွင် menu bar မှ ဆက်တင်များ (`Cmd+,`) ကိုဖွင့်ပါ၊ ဒေါင်းလုဒ်အမြန်နှုန်းကန့်သတ်ချက်ကို သတ်မှတ်ပါ၊ စတိုင်နှင့် အသွင်အပြင်ကို ပြောင်းပါ၊ မှတ်တမ်းများကိုဖွင့်ပါ သို့မဟုတ် စစ်ဆေးချက်ဖိုင်ကို သိမ်းပါ",
  feat_workflow_20:
    "**မည်သည့်ဒေါင်းလုဒ်မှမဆို ပရိုဖိုင်ကို ပြောင်းပါ** — ဒေါင်းလုဒ်တစ်ခုကို ချိန်ညှိပြီးနောက် ၎င်းစတင်ခဲ့သော ပရိုဖိုင်ကို update လုပ်ပါ (ဘာပြောင်းမည်ကို ကြိုကြည့်နိုင်သည်) သို့မဟုတ် ဆက်တင်များကို ပရိုဖိုင်အသစ်အဖြစ် သိမ်းပါ။ ပရိုဖိုင်ပြောင်းသောအခါ သင့်ပြင်ဆင်မှုများကို ထားမလား မေးသည်",
  feat_post_h3: "Subtitles နှင့် post-processing",
  feat_post_1:
    "SRT, VTT သို့မဟုတ် ASS တွင် **Subtitles** — ကိုယ်တိုင်ရိုက်ထည့်ထားသော သို့မဟုတ် auto-generated၊ မည်သည့် language မဆို",
  feat_post_2:
    "ဗီဒီယိုဘေးတွင်သိမ်းပါ၊ `.mkv` ထဲ embed လုပ်ပါ၊ သို့မဟုတ် `Subtitles/` subfolder တွင် စီစဉ်ပါ",
  feat_post_3:
    "**SponsorBlock** — sponsors, intros, outros, self-promos ကို ကျော်ပြီး chapter-mark လုပ်ပါ",
  feat_post_4:
    "**Embedded metadata** — ခေါင်းစဉ်၊ upload date, channel, description, thumbnail နှင့် chapter markers တို့ကို ဖိုင်ထဲသို့ ရေးသွင်းသည်",
  feat_post_5:
    "**စာတန်းထိုးသီးသန့် အစုလိုက်** — URL စာရင်းကို ကူးထည့်ပါ သို့မဟုတ် ပလေးလစ်ကို ဖွင့်ပါ၊ စာတန်းထိုးကို ရွေးပါ၊ ဗီဒီယိုတစ်ခုချင်းစီအတွက် စာတန်းထိုးဖိုင်များကိုသာ ရယူပါ",
  feat_sites_h3: "YouTube + ၂၀၀၀ ဆိုဒ်",
  feat_sites_1:
    "**YouTube၊ အပြည့်အဝ** — Videos, Shorts, Channels, Playlists, YouTube Music နှင့် Podcasts တို့ကို ပထမတန်းစား ရင်းမြစ်များအဖြစ် ကိုင်တွယ်သည်",
  feat_sites_2:
    "**၂၀၀၀+ အခြားဆိုဒ်များ** yt-dlp မှတဆင့် — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable နှင့် အခြားအများကြီး",
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
  hotkey_fig_alt: "Arroxy ၏ စနစ်တစ်ခုလုံးအတွက် ဒေါင်းလုဒ် ဖြတ်လမ်းခလုတ် — Windows နှင့် Linux တွင် Ctrl+Shift+D၊ macOS တွင် Cmd+Shift+D ဖြင့် ကူးယူထားသောလင့်ခ်ကို ဒေါင်းလုဒ်စာရင်းသို့ တိုက်ရိုက်ပို့သည်",
  hotkey_fig_cap: "<b>စနစ်တစ်ခုလုံးအတွက် ဒေါင်းလုဒ် ဖြတ်လမ်းခလုတ်</b><br/>ဘယ်နေရာမှာမဆို လင့်ခ်ကူးပြီး တစ်ချက်နှိပ်လိုက်ရုံ — စာရင်းထဲရောက်ပြီး ဒေါင်းလုဒ်စတင်",
  shot7_cap: "<b>Playlist ရှိ item တစ်ခုချင်းအတွက် ပရိုဖိုင်</b><br/>ဗီဒီယိုတစ်ခုစီကို ကိုယ်ပိုင်ပရိုဖိုင် သတ်မှတ်ပါ — အချို့ကို 4K ဖြင့် သိမ်းပြီး ကျန်တာကို MP3 အဖြစ် ရယူပါ",
  shot8_cap:
    "<b>Explore</b><br/>Arroxy အတွင်းမှာပင် YouTube သို့မဟုတ် အခြားဝဘ်ဆိုက်ကို ကြည့်ရှုပြီး ကြည့်နေသော စာမျက်နှာကို လက်ရှိပရိုဖိုင်ဖြင့် ဒေါင်းလုဒ်လုပ်ပါ",
  shot9_cap:
    "<b>Explore ၏ ပထမဆုံးမျက်နှာပြင်</b><br/>Explore ကို အကျဉ်းချုပ်ကြည့်ခြင်းနှင့် အရန်အကောင့်က sign in ဝင်ရန် ပိုလုံခြုံသည့် အကြောင်းရင်း",
  shot10_cap:
    "<b>ဒေါင်းလုဒ်များက သင့်အကူအညီလိုသည်ကို ပြောပြသည်</b><br/>လင့်ခ်များကို နောက်ခံတွင် ပြင်ဆင်သည်၊ မအောင်မြင်သည့်လင့်ခ်က ဖြေရှင်းနည်းပေးပြီး ရှည်သော playlist က သင့်ရွေးချယ်မှုကို စောင့်သည်",
  shot11_cap:
    "<b>ဗီဒီယိုရဲ့ တစ်စိတ်တစ်ပိုင်းကိုသာ ဒေါင်းလုဒ်လုပ်ပါ</b><br/>အစနဲ့ အဆုံး ဒါမှမဟုတ် အခန်းတစ်ခုကို ရွေးပါ — Arroxy က ထိုအပိုင်းကိုသာ သိမ်းပေးပါတယ်",
  shot12_cap:
    "<b>ပရိုဖိုင် တည်းဖြတ်ကိရိယာ</b><br/>ပရိုဖိုင်ကို ညှိပါ- ဖိုင်အမျိုးအစား၊ ရီဇိုလူးရှင်း၊ စာတန်းထိုး၊ သိမ်းဆည်းမည့်နေရာ၊ ဖိုင်အမည်ပုံစံနှင့် အခြားများ",
  shot13_cap:
    "<b>မှောင် သို့မဟုတ် လင်း၊ မှန် သို့မဟုတ် ရိုးရိုး</b><br/>ရွေးချယ်စရာ ပုံစံလေးမျိုး- ရွေ့လျားနေသော ကောင်းကင်ပေါ်ရှိ မှန်အကန့်များ သို့မဟုတ် တည်ငြိမ်သော ရိုးရိုးမျက်နှာပြင်များ၊ တစ်ခုချင်းစီ မှောင်နှင့် လင်းနှစ်မျိုးလုံးဖြင့်",
  dl_platform_col: "Platform",
  dl_format_col: "Format",
  dl_oneline_note:
    "Build များမှာ x86_64 အတွက်သာ ဖြစ်သည်။ `curl` မရှိဘူးလား။ `curl -fsSL` အစား `wget -qO-` သုံးပါ။",
  dl_win_scoop:
    "Scoop ကို ပိုနှစ်သက်ပါသလား။ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
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
    "Arroxy သည် code-sign မလုပ်ရသေးသောကြောင့် macOS Gatekeeper သည် ပထမဆုံးဖွင့်ချိန်တွင် damaged app သတိပေးချက် ပြသနိုင်သည်။ ဤသည်မှာ မျှော်လင့်ထားသည့်အရာဖြစ်ပြီး ဖိုင်များ တကယ်ပျက်စီးနေသည်ဟု မဆိုလိုပါ။",
  dl_macos_m1_h4: "Terminal နည်းလမ်း:",
  dl_macos_step1: "ဖွင့်ထားသော DMG မှ `Arroxy.app` ကို `/Applications` သို့ ဆွဲထည့်ပါ။",
  dl_macos_step2:
    "Terminal ကိုဖွင့်ပြီး `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` ကို run ပါ။",
  dl_macos_step3: "`open /Applications/Arroxy.app` ကို run ပါ။",
  dl_macos_step4:
    "app path မတူပါက `/Applications/Arroxy.app` ကို သင်ထည့်သွင်းထားသော path ဖြင့် အစားထိုးပါ။",
  dl_macos_step5:
    "`sudo` က တောင်းပါက သင့် Mac password ကို ထည့်ပါ။",
  dl_macos_after:
    "quarantine ဖယ်ရှားပြီးနောက် Arroxy သည် ပုံမှန်ဖွင့်ပါမည်။",
  dl_macos_m2_h4: "Terminal နည်းလမ်း:",
  dl_macos_note:
    "macOS builds များကို Apple Silicon နှင့် Intel runners တို့ပေါ်တွင် CI မှတဆင့် ထုတ်လုပ်သည်။ ပြဿနာများကြုံတွေ့ပါက [issue တင်ပါ](../../issues) — macOS သုံးစွဲသူများ၏ feedback သည် macOS testing cycle ကို တက်ကြွစွာ ပုံဖော်ပေသည်။",
  dl_linux_h3: "Linux တွင် ပထမဆုံး launch လုပ်ခြင်း",
  dl_linux_intro:
    "AppImages များကို တိုက်ရိုက် run နိုင်သည် — ထည့်သွင်းမှုမလိုအပ်ပါ။ ဖိုင်ကို executable အဖြစ် mark လုပ်ရုံသာ လိုအပ်သည်။",
  dl_linux_m1_text:
    "**File manager:** `.AppImage` ကို right-click → **Properties** → **Permissions** → **Allow executing file as program** ကိုဖွင့်ပြီး double-click နှိပ်ပါ။",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Launch မအောင်မြင်သေးလျှင် mount မလုပ်ဘဲ ဖွင့်ပါ — FUSE package မလိုပါ:",
  dl_linux_targz_h4: "ရိုးရိုး tarball (FUSE မလို၊ install မလို):",
  dl_linux_targz_text: "`.tar.gz` ဗားရှင်းသည် AppImage အခွံမပါသော အက်ပ်တူပင်ဖြစ်သည် — ကြိုက်ရာနေရာတွင် ဖြေပြီး ဖွင့်လိုက်ပါ။ installer လည်းမလို၊ FUSE package လည်း မလိုပါ။",
  dl_linux_arch_note: "**ထုတ်ဝေမှုစာမျက်နှာရှိ Linux ဒေါင်းလုဒ်များသည် x86_64 သီးသန့်ဖြစ်သည်။** ARM64 စက်များ (Raspberry Pi, Asahi Linux) တွင် Flatpak install လုပ်၍ရသော်လည်း ဖွင့်သည့်အခါ `bwrap: execvp ldconfig: Exec format error` ဖြင့် ကျရှုံးသည်။",
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
    "Arroxy သည် macOS အတွက် code-sign မလုပ်ရသေးသောကြောင့် DMG မှ install လုပ်ပြီးနောက် Gatekeeper သည် ကြောက်စရာ *\"Arroxy.app is damaged and can't be opened\"* dialog ကို ပြသနိုင်သည်။ ထို message သည် macOS က unsigned app ကို quarantine လုပ်ထားသည်ဟု ဆိုလိုပြီး app files တကယ်ပျက်စီးနေသည်ဟု မဆိုလိုပါ။ လက်ရှိ macOS တွင် ယုံကြည်ရသော ဖြေရှင်းနည်းမှာ Terminal ဖြစ်သည်:",
  dl_macos_sequoia_h4: "လက်ရှိ macOS အတွက် Terminal fix",
  dl_macos_sequoia_intro:
    "Arroxy ကို Applications သို့ copy ပြီးနောက် Terminal ကို အသုံးပြုပါ:",
  dl_macos_sequoia_step1:
    "တပ်ဆင်ထားသော DMG မှ `Arroxy.app` ကို `/Applications` သို့ ဆွဲထည့်ပါ။",
  dl_macos_sequoia_step2:
    "Terminal ကိုဖွင့်ပြီး ဤ command နှစ်ခုကို run ပါ:",
  dl_macos_sequoia_step3:
    "Arroxy ကိုဖွင့်ရန် `open /Applications/Arroxy.app` ကို run ပါ။",
  dl_macos_sequoia_step4:
    "app path မတူပါက `/Applications/Arroxy.app` ကို သင်ထည့်သွင်းထားသော path ဖြင့် အစားထိုးပါ။",
  dl_macos_sonoma_h4: "macOS အဟောင်းများအတွက် Terminal fix",
  dl_macos_sonoma_step1:
    "တပ်ဆင်ထားသော DMG မှ `Arroxy.app` ကို `/Applications` သို့ ဆွဲထည့်ပါ။",
  dl_macos_sonoma_step2:
    "Terminal ကိုဖွင့်ပြီး `/Applications/Arroxy.app` မှ quarantine ကို ဖယ်ရှားပါ။",
  dl_macos_sonoma_step3:
    "quarantine ဖယ်ရှားပြီးနောက် Arroxy ကို Terminal သို့မဟုတ် Finder မှ ဖွင့်ပါ။",
  dl_macos_damaged_h4:
    "Gatekeeper quarantine fix",
  dl_macos_damaged_p:
    "ပထမ command သည် သင်ထည့်သွင်းထားသော Arroxy copy မှ quarantine attribute ကို ဖယ်ရှားသည်။ ဒုတိယ command သည် app ကို ဖွင့်သည်။ `sudo` သည် သင့် Mac password ကို တောင်းနိုင်သည်။ Terminal သည် password ရိုက်နေချိန်တွင် စာလုံးများကို မပြပါ။",
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
    "Telemetry မရှိပါ — တစ်နေ့လျှင် anonymous signal တစ်ခုသာ ပို့သည်: app version, OS, ဘာသာစကား, install channel နှင့် နိုင်ငံ — active users အရေအတွက်ကို ရေတွက်နိုင်ရန်။ ID, URLs, video titles, file paths သို့မဟုတ် account info မပါဝင်ပါ။ Settings တွင် ပိတ်နိုင်သည်။",
  privacy_p3:
    "Explore သည် သင့် browser နှင့် သီးခြားဖြစ်သော ကိုယ်ပိုင် sign-in ကို ထားရှိပြီး Arroxy က sign-in ဖောင်ကို ဘယ်တော့မှ မဖတ်ပါ၊ မဖြည့်ပါ — Google ၏ ကိုယ်ပိုင်စာမျက်နှာတွင် သင်ကိုယ်တိုင် ရိုက်ထည့်ရသည်။ ဒေါင်းလုဒ်များသည် sign out အခြေအနေတွင် လုပ်ဆောင်သည်၊ အကောင့်ဖြင့် ဖြေရှင်းနိုင်သော အကြောင်းရင်းကြောင့် ဒေါင်းလုဒ်မအောင်မြင်မှသာ Arroxy က sign-in ကို အသစ်ပြန်ဖတ်ပြီး ထိုဒေါင်းလုဒ်အတွက် ယာယီဖိုင်တွင်ထားကာ နောက်မှ ထိုဖိုင်ကို ဖျက်သည်။ ဆက်တင်များတွင် Explore မှ sign out လုပ်ပါက sign-in ကို မေ့သွားသည်။",
  faq_q1: "တကယ်ကို အခမဲ့လား?",
  faq_a1: "ဟုတ်သည် — MIT licensed၊ premium tier မပါ၊ feature gating မပါ။",
  faq_q11: "Arroxy သည် အခြား yt-dlp GUI များနှင့် မည်သို့ကွာခြားသနည်း?",
  faq_a11:
    "အခမဲ့ yt-dlp GUI အများစုသည် လင့်ခ်ကိုသာ လက်ခံသော wrapper များဖြစ်သည်။ Arroxy တွင် app ထဲ၌ တည်ဆောက်ထားသော YouTube browser ဖြစ်သည့် **Explore** ပါရှိသည်: လင့်ခ်မကူးဘဲ ကြည့်ရှုပြီး ဒေါင်းလုဒ်လုပ်နိုင်ကာ ထိုနေရာတွင် တစ်ကြိမ် sign in ဝင်ရုံဖြင့် private၊ member-only နှင့် အသက်ကန့်သတ်ဗီဒီယိုများနှင့် သင်၏ Watch Later နှင့် Liked စာရင်းများကို cookie export မလုပ်ဘဲ ဒေါင်းလုဒ်လုပ်နိုင်သည်။ သင်သည် bot မဟုတ်ကြောင်း YouTube က အတည်ပြုခိုင်းသောအခါ Arroxy က ထို sign-in ကို အသုံးပြုပြီး ၎င်း၏ built-in browser က YouTube ၏ ဒေါင်းလုဒ် token ကို ရယူပေးသဖြင့် ဒေါင်းလုဒ်များသည် format နည်းသွားခြင်း မရှိပါ။ [Arroxy ဘာကြောင့်](#why) ကို ကြည့်ပါ။",
  faq_q2: "မည်သည့် ဗီဒီယိုအရည်အသွေးများ ဒေါင်းလုဒ်ဆွဲနိုင်သနည်း?",
  faq_a2:
    "YouTube ပေးသောအရာများအားလုံး: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p နှင့် audio-only။ 60 fps နှင့် HDR streams များကို မူရင်းအတိုင်း ထိန်းသိမ်းပြီး အဆင့်ဆင့် ဒေါင်းလုဒ်တွင် ကြည်လင်ပြတ်သားမှု တစ်ခုစီ၌ AV1, VP9 သို့မဟုတ် H.264 ကို ရွေးနိုင်သည်။",
  faq_q3: "Audio ကိုသာ MP3 အဖြစ် ထုတ်ယူနိုင်သလား?",
  faq_a3:
    "ဟုတ်ပါတယ်။ format menu ထဲက *အသံသာ* ကိုရွေးပြီး MP3၊ M4A/AAC၊ Opus သို့မဟုတ် WAV ကိုရွေးပါ။",
  faq_q4: "YouTube account လိုအပ်သော ဗီဒီယိုများကို ဘယ်လို ဒေါင်းလုဒ်လုပ်ရမလဲ?",
  faq_a4:
    "Explore tab တွင် တစ်ကြိမ် sign in ဝင်ပါ။ ထို့နောက် Arroxy သည် သင့်အကောင့်ဖြင့် ကြည့်နိုင်သော private နှင့် member-only ဗီဒီယိုများ၊ အသက်အတည်ပြုထားသော အကောင့်ဖြစ်လျှင် အသက်ကန့်သတ်ဗီဒီယိုများ၊ သင်၏ Watch Later နှင့် Liked စာရင်းများကို ဒေါင်းလုဒ်လုပ်နိုင်သည်။ အကောင့်ဖြင့် ဖြေရှင်းနိုင်သော အကြောင်းရင်းကြောင့် ဒေါင်းလုဒ်မအောင်မြင်မှသာ ထို sign-in ကို သုံးပြီး ကျန်အရာအားလုံးကို အရင်ကဲ့သို့ပင် ဒေါင်းလုဒ်လုပ်သည်။ ၎င်းမှာ cookie ဆက်တင်များတွင် ပထမဆုံးစာရင်းသွင်းထားပြီး \"အကြံပြု\" ဟု အမှတ်အသားပြထားသော **Explore sign-in** ရွေးချယ်မှုဖြစ်ပြီး Explore ကို ပထမဆုံးဖွင့်သောအခါ Arroxy က သင့်အတွက် ရွေးပေးသည်။ yt-dlp ၏ wiki က [sign in ဝင်ထားသော automation သည် Google account ကို flag လုပ်နိုင်ကြောင်း](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) သတိပေးထားသဖြင့် အရန် account တစ်ခုသည် ပိုပြီးဘေးကင်းသောရွေးချယ်မှုဖြစ်သည်။",
  faq_q5: "YouTube တွင် တစ်ခုခုပြောင်းသောအခါ ဆက်လက်အလုပ်လုပ်မည်လား?",
  faq_a5:
    "yt-dlp ကို launch တိုင်း အလိုအလျောက် update လုပ်ပြီး YouTube က တစ်ခုခု ပြောင်းလဲသောအခါ Arroxy က fix များကို လျင်မြန်စွာ ထုတ်ပေးသည်။ သင်သည် bot မဟုတ်ကြောင်း YouTube က အတည်ပြုခိုင်းသောအခါ Explore တွင် sign in ဝင်ထားလျှင် Arroxy က သင်၏ Explore sign-in ကိုလည်း စမ်းကြည့်ပြီး cookie ဆက်တင်များတွင် ဖိုင် သို့မဟုတ် browser မှ cookie များကိုလည်း သုံးနိုင်သည်။",
  faq_q6: "Arroxy ကို မည်သည့်ဘာသာစကားများဖြင့် ရနိုင်သနည်း?",
  faq_a6:
    "ချက်ချင်းအသုံးပြုနိုင်သော {{LANG_COUNT}} ဘာသာစကားများ: {{LANG_NAME_LIST}}။ Arroxy သည် ပထမဆုံးစတင်ချိန်တွင် သင့် operating system ဘာသာစကားကို အလိုအလျောက်သိရှိပြီး toolbar ရှိ ဘာသာစကားရွေးချယ်စနစ်မှ အချိန်မရွေးပြောင်းနိုင်သည်။ Runtime locale JSON သည် src/shared/i18n/locales/ တွင်ရှိပြီး ဘာသာပြန်သူများအတွက် PO catalog များသည် i18n/locales/ တွင်ရှိသည် — ပါဝင်ရန် GitHub တွင် PR ဖွင့်ပါ။",
  faq_q7: "အခြားအရာများ ထည့်သွင်းရန်လိုသလား?",
  faq_a7:
    "မလိုပါ။ yt-dlp, ffmpeg နှင့် ffprobe တို့ကို ပထမဆုံး ဖွင့်ချိန်တွင် အလိုအလျောက် ဒေါင်းလုဒ်လုပ်ပြီး သင့်စက်တွင် cache လုပ်သည်။ ထို့နောက် နောက်ထပ် setup မလိုအပ်ပါ။",
  faq_q8: "Playlist များ သို့မဟုတ် channel တစ်ခုလုံး ဒေါင်းလုဒ်ဆွဲနိုင်သလား?",
  faq_a8:
    "ရပါတယ် — နှစ်မျိုးလုံး။ playlist သို့မဟုတ် channel URL ကို paste လုပ်ပါ (ဥပမာ `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); scan လုပ်မည့် entries အရေအတွက်ကိုရွေးပြီး စာရင်းတစ်ခုလုံးကို queue ထဲထည့်ပါ သို့မဟုတ် video များကို သီးသန့်ရွေးပါ။ date-range filters မကြာမီလာပါမည်။",
  faq_q9: 'macOS က "app ပျက်စီးနေသည်" ဟုဆိုသည် — ဘာလုပ်ရမည်နည်း?',
  faq_a9:
    "၎င်းသည် macOS Gatekeeper က unsigned app ကို block လုပ်ခြင်းဖြစ်ပြီး တကယ်ပျက်စီးမှုမဟုတ်ပါ။ quarantine ကိုဖယ်ရှားပြီး Arroxy ကိုဖွင့်ရန် Terminal commands များကို [macOS first launch](#macos-first-launch) တွင် ကြည့်ပါ။",
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
  plan_r3_name: "**ပိုမိုခိုင်မာသော retry recovery**",
  plan_r3_desc:
    "မတည်ငြိမ်သော သို့မဟုတ် ပြဿနာရှိသော internet connection ကြောင့် ပြတ်တောက်သွားသော downloads များအတွက် retry လမ်းကြောင်းအသစ်",
  plan_r4_name: "**ပြည့်စုံသော download manager drawer**",
  plan_r4_desc:
    "queue drawer ကို ပိုမိုပြည့်စုံသော manager အဖြစ် ပြောင်းလဲပြီး queued items များအတွက် destination folder ပြောင်းလဲနိုင်ရန်",
  plan_r5_name: "**ဒေါင်းလုဒ်ချိန်သတ်မှတ်ခြင်း**",
  plan_r5_desc: "သတ်မှတ်ချိန်တွင် queue ကို စတင်ပါ (ညဘက် runs)",
  plan_r9_name: "**AUR package**",
  plan_r9_desc: "Arch Linux နှင့် Omarchy တွင် `yay -S arroxy-bin` ဖြင့် ထည့်သွင်းပါ",
  plan_cta:
    "လုပ်ဆောင်ချက်တစ်ခု ကြံဆထားပါသလား? [Request တင်ပါ](../../issues) — community input က ဦးစားပေးမှုကို ပုံဖော်သည်။",
  tech_content: TECH_CONTENT,
  support_h2: "Arroxy ကို ပံ့ပိုးရန်",
  support_note: "Arroxy သည် အခမဲ့ဖြစ်ပြီး MIT လိုင်စင်ဖြင့် ဖြန့်ဝေသည် — ကြော်ငြာမပါ၊ telemetry မပါ၊ ငွေပေးရသည့် ဗားရှင်းလည်း မရှိပါ။ သင့်အချိန်ကို သက်သာစေပါက Bitcoin, Tron သို့မဟုတ် Ethereum ဖြင့် ဖွံ့ဖြိုးတိုးတက်မှုကို ပံ့ပိုးနိုင်ပါသည် — လိပ်စာများကို [DONATE.md](DONATE.md) တွင် ကြည့်ပါ၊ ၎င်းသည် လိပ်စာများ၏ တစ်ခုတည်းသော တရားဝင် အရင်းအမြစ် ဖြစ်ပါသည်။ Arroxy သည် သင့်ထံသို့ အီးမေးလ် သို့မဟုတ် တိုက်ရိုက်မက်ဆေ့ချ်ဖြင့် လိပ်စာ ဘယ်တော့မျှ ပို့မည်မဟုတ်ပါ။ repo ကို ကြယ်ပွင့်ပေးခြင်း၊ bug များ အစီရင်ခံခြင်းနှင့် ဘာသာပြန်များ တိုးတက်အောင် ကူညီခြင်းတို့သည်လည်း အလားတူ အထောက်အကူဖြစ်ပါသည်။",
  tos_h2: "အသုံးပြုမှုသဘောတူညီချက်",
  tos_note:
    "Arroxy သည် ကိုယ်ရေးကိုယ်တာ သုံးစွဲမှုအတွက်သာ tool ဖြစ်သည်။ သင့် downloads သည် YouTube ၏ [Terms of Service](https://www.youtube.com/t/terms) နှင့် သင့်နိုင်ငံ၏ copyright ဥပဒေများနှင့် ကိုက်ညီကြောင်း သေချာစေရန် တာဝန်သည် သင့်ကိုယ်သင်တွင်သာ ရှိသည်။ သင့်တွင် အသုံးပြုခွင့်မရှိသောကြောင့် content ကို ဒေါင်းလုဒ်ဆွဲ၊ ထပ်ဆင့်ဖြန့်ဝေ သို့မဟုတ် ဖြန့်ဖြူးရန် Arroxy ကို မသုံးပါနှင့်။ Developer များသည် မည်သည့် အလွဲသုံးမှုမဆိုအတွက် တာဝန်ကင်းသည်။",
  footer_credit:
    'MIT License · <a href="https://x.com/OrionusAI">@OrionusAI</a> မှ ဂရုတစိုက်ဖန်တီးထားသည်',
};
