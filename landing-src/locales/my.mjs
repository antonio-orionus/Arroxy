// Landing-page translations for "my". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const my = {
  title: "Arroxy — အခမဲ့ 4K YouTube ဒေါင်းလုဒ်ဆော့ဖ်ဝဲ၊ လော့ဂ်အင်မလိုအပ်",
  description:
    "Windows, macOS နှင့် Linux အတွက် အခမဲ့၊ MIT လိုင်စင်ပါ desktop YouTube ဒေါင်းလုဒ်ဆော့ဖ်ဝဲ။ Google account, browser ကွတ်ကီး သို့မဟုတ် မည်သည့် လော့ဂ်အင်မျှ မလိုဘဲ 4K HDR ကို 60 fps အထိ ဒေါင်းလုဒ်လုပ်ပါ။",
  og_title: "Arroxy — အခမဲ့ 4K YouTube ဒေါင်းလုဒ်ဆော့ဖ်ဝဲ၊ လော့ဂ်အင်မလိုအပ်",
  og_description:
    "အခမဲ့ 4K YouTube ဒေါင်းလုဒ်ဆော့ဖ်ဝဲ။ ကွတ်ကီးမရှိ၊ လော့ဂ်အင်မရှိ၊ ကျိုးနေသော session မရှိ။ MIT လိုင်စင်။ Windows · macOS · Linux။",

  nav_features: "လုပ်ဆောင်ချက်များ",
  nav_screenshots: "ဖန်သားပြင်ဓာတ်ပုံများ",
  nav_install: "တပ်ဆင်ခြင်း",
  nav_download: "ဒေါင်းလုဒ်",

  hero_eyebrow: "Open Source · MIT · တက်ကြွစွာ ထိန်းသိမ်းနေသည်",
  hero_h1_a: "အခမဲ့ 4K YouTube ဒေါင်းလုဒ်ဆော့ဖ်ဝဲ။",
  hero_h1_b: "ကွတ်ကီးမရှိ။ လော့ဂ်အင်မရှိ။ ကျိုးနေသော session မရှိ။",
  hero_tagline:
    "Arroxy သည် Windows, macOS နှင့် Linux အတွက် အခမဲ့၊ MIT လိုင်စင်ပါ desktop YouTube ဒေါင်းလုဒ်ဆော့ဖ်ဝဲဖြစ်သည်။ Google account, browser ကွတ်ကီး သို့မဟုတ် မည်သည့် လော့ဂ်အင်မျှ မတောင်းဘဲ — 4K HDR ကို 60 fps အထိ ဒေါင်းလုဒ်လုပ်ပေးသည်။",
  hero_trust: "GitHub တွင် code တိုင်း စစ်ဆေးကြည့်ပါ။",
  pill_no_account: "Google account မလိုအပ်",
  pill_open_source: "Open source (MIT)",
  pill_no_tracking: "ခြေရာခံမရှိ",
  cta_download_os: "သင့် OS အတွက် ဒေါင်းလုဒ်လုပ်ပါ",
  cta_view_github: "GitHub တွင် ကြည့်ရှုပါ",
  release_label: "နောက်ဆုံး ထုတ်ပြန်မှု:",
  release_loading: "တင်နေသည်…",

  cta_download_windows: "Windows အတွက် ဒေါင်းလုဒ်လုပ်ပါ",
  cta_download_windows_portable: "Portable .exe (တပ်ဆင်မှုမလိုအပ်)",
  cta_download_mac_arm: "macOS အတွက် ဒေါင်းလုဒ်လုပ်ပါ (Apple Silicon)",
  cta_download_mac_intel: "Intel Mac? x64 DMG ရယူပါ",
  cta_download_linux_appimage: "Linux အတွက် ဒေါင်းလုဒ်လုပ်ပါ (.AppImage)",
  cta_download_linux_flatpak: "Flatpak bundle →",
  cta_other_platforms: "အခြား platform များ / ဒေါင်းလုဒ်အားလုံး",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "Installer",
  cta_portable_label: "Portable",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy သည် Windows, macOS နှင့် Linux အတွက် desktop app တစ်ခုဖြစ်သည်။",
  mobile_notice_sub: "ဒေါင်းလုဒ်လုပ်ရန် သင့်ကွန်ပျူတာတွင် ဤစာမျက်နှာကို ဖွင့်ပါ။",
  mobile_copy_link: "စာမျက်နှာ လင့်ကူးပါ",
  first_launch_label: "ပထမဆုံး ဖွင့်ခြင်း အကူအညီ",
  first_launch_mac_html:
    "macOS သည် ပထမဆုံး ဖွင့်ချိန်တွင် <em>မသိသော developer</em> သတိပေးချက် ပြသသည် — Arroxy သည် code-signed မဟုတ်သေးပါ။ <strong>App icon ကို right-click → Open</strong> နှိပ်ပြီး dialog တွင် <strong>Open</strong> ကို နှိပ်ပါ။ တစ်ကြိမ်သာ လိုအပ်သည်။",
  first_launch_linux_html:
    "<strong>AppImage:</strong> ဖိုင်ကို right-click → <strong>Properties → Allow executing as program</strong> နှိပ်ပါ၊ သို့မဟုတ် terminal တွင် <code>chmod +x Arroxy-*.AppImage</code> ကို ရိုက်ထည့်ပါ။ ဖွင့်မရသေးပါက <code>libfuse2</code> (Ubuntu/Debian), <code>fuse-libs</code> (Fedora) သို့မဟုတ် <code>fuse2</code> (Arch) ကို တပ်ဆင်ပါ။<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code> ကို ရိုက်ထည့်ပြီး app menu မှ ဖွင့်ပါ သို့မဟုတ် <code>flatpak run io.github.antonio_orionus.Arroxy</code> ကို ရိုက်ထည့်ပါ။",

  features_eyebrow: "ဘာလုပ်သနည်း",
  features_h2: "မျှော်မှန်းသမျှ အကုန်ရှိပြီး အနှောင့်အယှက်တစ်ခုမှ မရှိ။",
  features_sub: "URL ကူးထည့်ပါ၊ အရည်အသွေးရွေးပါ၊ ဒေါင်းလုဒ် နှိပ်ပါ။ ဒါပဲ။",
  f1_h: "4K UHD အထိ",
  f1_p: "2160p, 1440p, 1080p, 720p — YouTube မှ ဖြန့်ချိသည့် resolution တိုင်း၊ audio-only MP3, AAC နှင့် Opus ပါ။",
  f2_h: "60 fps နှင့် HDR ထိန်းသိမ်းခြင်း",
  f2_p: "High frame-rate နှင့် HDR stream များသည် YouTube encode လုပ်သည့်အတိုင်း ရောက်ရှိသည် — အရည်အသွေး ဆုံးရှုံးမှု မရှိ။",
  f3_h: "တပြိုင်နက် အများ",
  f3_p: "ဗီဒီယိုများကို ကြိုက်သလောက် queue ထည့်ပါ။ ဒေါင်းလုဒ် panel သည် တပြိုင်နက် တစ်ခုစီ၏ တိုးတက်မှုကို ခြေရာခံသည်။",
  f4_h: "အလိုအလျောက် အပ်ဒိတ်",
  f4_p: "Arroxy သည် yt-dlp နှင့် ffmpeg ကို နောက်ကွယ်မှ နောက်ဆုံးထားသည် — YouTube ပြောင်းလဲမှုတိုင်းတွင် အလုပ်လုပ်သည်။",
  f5_h: "ဘာသာစကား ၉ မျိုး",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — သင့်ဘာသာစကားကို အလိုအလျောက် ရှာဖွေသည်။",
  f6_h: "Cross-platform",
  f6_p: "Windows, macOS နှင့် Linux အတွက် native build များ — installer, portable, DMG သို့မဟုတ် AppImage။",
  f7_h: "Subtitle များ သင်ကြိုက်သလို",
  f7_p: "SRT, VTT သို့မဟုတ် ASS ဖြင့် လူကိုယ်တိုင် သို့မဟုတ် အလိုအလျောက် ထုတ်ပေးသော caption များ — ဗီဒီယိုနဘေးတွင် သိမ်းဆည်းပါ၊ portable .mkv ထဲ embed လုပ်ပါ၊ သို့မဟုတ် Subtitles/ folder ထဲ ထည့်ပါ။",
  f8_h: "SponsorBlock ပါဝင်",
  f8_p: "sponsor segment, intro, outro, self-promo နှင့် အခြားများကို ကျော်ပါ သို့မဟုတ် အမှတ်အသားပြုပါ — FFmpeg ဖြင့် ဖြတ်ပါ သို့မဟုတ် chapter များ ထည့်ပါ။ category တစ်ခုစီအတွက် သင့်ရွေးချယ်မှု။",
  f9_h: "Clipboard အလိုအလျောက် ဖြည့်သွင်းခြင်း",
  f9_p: "မည်သည့်နေရာတွင်မဆို YouTube link ကူးပြီး ပြန်လှည့်လာသည့်အခါ Arroxy ချက်ချင်း ရှာဖွေသည် — အတည်ပြုချက် prompt တစ်ခုဖြင့် သင် ထိန်းချုပ်ထားသည်။ Advanced settings တွင် ဖွင့်ပါ သို့မဟုတ် ပိတ်ပါ။",
  f10_h: "URL အလိုအလျောက် သန့်ရှင်းခြင်း",
  f10_p: "ကူးထည့်သော YouTube link များမှ tracking parameter များ (si, pp, feature, utm_*, fbclid, gclid နှင့် အခြားများ) အလိုအလျောက် ဖယ်ရှားပြီး youtube.com/redirect wrapper များ ဖြည်ဖြေးသည် — URL field တွင် canonical link ကိုသာ ပြသသည်။",
  f11_h: "Tray ထဲ ဝှက်သည်",
  f11_p: "Window ပိတ်လိုက်သောအခါ Arroxy သည် system tray ထဲ ဝင်သည်။ ဒေါင်းလုဒ်များ နောက်ကွယ်တွင် ဆက်လုပ်သည် — tray icon နှိပ်ပြီး window ပြန်ဖွင့်ပါ၊ သို့မဟုတ် tray menu မှ ထွက်ပါ။",
  f12_h: "Metadata နှင့် Album art ထည့်သွင်းခြင်း",
  f12_p: "ခေါင်းစဉ်၊ upload ရက်စွဲ၊ အနုပညာရှင်၊ ဖော်ပြချက်၊ cover art နှင့် chapter marker များကို ဖိုင်ထဲ တိုက်ရိုက် ရေးသွင်းသည် — sidecar ဖိုင်မရှိ၊ manual tagging မလိုအပ်။",

  shots_eyebrow: "လုပ်ဆောင်ချိန် ကြည့်ရှုပါ",
  shots_h2: "ရှင်းလင်းမှုအတွက် တည်ဆောက်ထားပြီး ရှုပ်ထွေးမှု မရှိ။",
  shot1_alt: "URL ကူးထည့်ပါ",
  shot2_alt: "အရည်အသွေးရွေးပါ",
  shot3_alt: "သိမ်းဆည်းမည့်နေရာ ရွေးပါ",
  shot4_alt: "တပြိုင်နက် ဒေါင်းလုဒ်များ",
  shot5_alt: "Subtitle အဆင့် — ဘာသာစကား၊ format နှင့် သိမ်းဆည်းမှုပုံစံ ရွေးပါ",
  og_image_alt: "Arroxy app icon — YouTube ဗီဒီယိုများကို 4K ဖြင့် ဒေါင်းလုဒ်လုပ်ရန် desktop app။",

  privacy_eyebrow: "သီးသန့်မှု",
  privacy_h2_html: "Arroxy <em>မလုပ်သောအရာများ</em>။",
  privacy_sub:
    "YouTube downloader အများစုသည် နောက်ဆုံးတွင် သင့်ကွတ်ကီးများကို တောင်းသည်။ Arroxy သည် ဘယ်တော့မှ တောင်းမည်မဟုတ်ပါ။",
  p1_h: "လော့ဂ်အင်မလိုအပ်",
  p1_p: "Google account မလိုအပ်။ သက်တမ်းကုန်သော session မရှိ။ သင့် account ကို flag ဖြစ်မည့် အန္တရာယ် သုညရှိသည်။",
  p2_h: "ကွတ်ကီးမရှိ",
  p2_p: "Arroxy သည် မည်သည့် browser မဆို တောင်းသော token တူညီသည်ကို တောင်းသည်။ ထုတ်ယူသည့်အရာ မရှိ၊ သိမ်းဆည်းသည့်အရာ မရှိ။",
  p3_h: "User ID မရှိ",
  p3_p: "Aptabase မှတဆင့် အမည်မသိ၊ session တစ်ခုတည်းသာ telemetry — install ID မရှိ၊ fingerprinting မရှိ၊ ကိုယ်ရေးကိုယ်တာ data မရှိ။ သင်၏ ဒေါင်းလုဒ်၊ မှတ်တမ်းနှင့် ဖိုင်များသည် သင့်စက်ကို ဘယ်တော့မှ မထွက်ပါ။",
  p4_h: "ပြင်ပ server မရှိ",
  p4_p: "pipeline တစ်ခုလုံးသည် yt-dlp + ffmpeg မှတဆင့် ဒေသတွင်း အလုပ်လုပ်သည်။ ဖိုင်များသည် remote server ကို ဘယ်တော့မှ မထိ။",

  install_eyebrow: "တပ်ဆင်ခြင်း",
  install_h2: "သင့် channel ရွေးပါ။",
  install_sub:
    "တိုက်ရိုက် ဒေါင်းလုဒ် သို့မဟုတ် မည်သည့် package manager မဆို — ထုတ်ပြန်မှုတိုင်း အလိုအလျောက် အပ်ဒိတ်လုပ်သည်။",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "အားလုံး",
  winget_desc: "Windows 10/11 အတွက် အကြံပြုသည်။ စနစ်နှင့်အတူ အလိုအလျောက် အပ်ဒိတ်လုပ်သည်။",
  scoop_desc: "Scoop bucket မှတဆင့် portable တပ်ဆင်မှု။ admin အခွင့်ထူး မလိုအပ်။",
  brew_desc: "Cask tap လုပ်ပြီး ညွှန်ကြားချက်တစ်ခုဖြင့် တပ်ဆင်ပါ။ Universal binary (Intel + Apple Silicon)။",
  flatpak_h: "Flatpak",
  flatpak_desc: "Sandboxed တပ်ဆင်မှု။ Releases မှ .flatpak bundle ကို ဒေါင်းလုဒ်လုပ်ပြီး ညွှန်ကြားချက်တစ်ခုဖြင့် တပ်ဆင်ပါ။ Flathub setup မလိုအပ်ပါ။",
  direct_h: "တိုက်ရိုက် ဒေါင်းလုဒ်",
  direct_desc: "NSIS installer, portable .exe, .dmg, .AppImage သို့မဟုတ် .flatpak — GitHub Releases မှ တိုက်ရိုက်။",
  direct_btn: "Releases ဖွင့်ပါ →",
  copy_label: "ကူးပါ",
  copied_label: "ကူးပြီး!",

  footer_made_by: "MIT လိုင်စင် · ဂရုတစိုက် ဖန်တီးထားသည်",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "ဘာသာစကား:",

  faq_eyebrow: "FAQ",
  faq_h2: "မကြာခဏ မေးသောမေးခွန်းများ",
  faq_q1: "မည်သည့် ဗီဒီယိုအရည်အသွေးများကို ဒေါင်းလုဒ်လုပ်နိုင်သနည်း?",
  faq_a1:
    "YouTube မှ ဖြန့်ချိသည့် မည်သည့်အရာမဆို — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p နှင့် audio-only။ High frame-rate stream များ (60 fps, 120 fps) နှင့် HDR content များသည် ဖြစ်သည့်အတိုင်း ထိန်းသိမ်းသည်။ Arroxy သည် ရနိုင်သော format တိုင်းကို ပြသပြီး ဘာကိုယူရမည်ကို တိတိကျကျ ရွေးချယ်နိုင်သည်။",
  faq_q2: "တကယ်ပင် အခမဲ့လား?",
  faq_a2: "ဟုတ်ကဲ့။ MIT လိုင်စင်။ premium tier မရှိ၊ feature ကန့်သတ်မှု မရှိ။",
  faq_q3: "Arroxy ကို မည်သည့် ဘာသာစကားများဖြင့် ရနိုင်သနည်း?",
  faq_a3:
    "ကိုးမျိုး၊ အသင့်ပါ: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), နှင့် हिन्दी (Hindi)။ Arroxy သည် ပထမဆုံး ဖွင့်ချိန်တွင် သင့် operating system ၏ ဘာသာစကားကို အလိုအလျောက် ရှာဖွေပြီး toolbar ရှိ ဘာသာစကားရွေးချယ်မှုမှ မည်သည့်အချိန်မဆို ပြောင်းနိုင်သည်။ Locale ဖိုင်များသည် src/shared/i18n/locales/ တွင် plain TypeScript object များဖြစ်သည် — ပါဝင်ကူညီရန် GitHub တွင် PR တင်ပါ။",
  faq_q4: "ဘာတစ်ခုခု တပ်ဆင်ရန် လိုအပ်သလား?",
  faq_a4:
    "မလိုပါ။ yt-dlp နှင့် ffmpeg တို့သည် ပထမဆုံး ဖွင့်ချိန်တွင် ၎င်းတို့၏ တရားဝင် GitHub releases မှ အလိုအလျောက် ဒေါင်းလုဒ်လုပ်ပြီး သင့်စက်တွင် cache လုပ်သည်။ ထို့နောက် နောက်ထပ် setup မလိုအပ်ပါ။",
  faq_q5: "YouTube ဘာတစ်ခုခု ပြောင်းလဲပါက ဆက်လုပ်ဆောင်နိုင်မည်လား?",
  faq_a5:
    "ဟုတ်ကဲ့ — Arroxy တွင် ခံနိုင်ရည် layer နှစ်ထပ် ရှိသည်။ ပထမ၊ yt-dlp သည် အစဉ်တစိုက် ထိန်းသိမ်းနေသော open-source tool များထဲမှ တစ်ခုဖြစ်သည် — YouTube ပြောင်းလဲမှုပြီး နာရီအနည်းငယ်အတွင်း အပ်ဒိတ်လုပ်သည်။ ဒုတိယ၊ Arroxy သည် ကွတ်ကီး သို့မဟုတ် သင့် Google account ကို လုံးဝ မမှီခိုသောကြောင့် သက်တမ်းကုန်မည့် session မရှိပြီး rotate လုပ်ရမည့် credential မရှိ။ ထို combination ကြောင့် browser cookie ထုတ်ယူမှုကို မှီခိုသော tool များထက် သိသိသာသာ ပိုမိုတည်ငြိမ်သည်။",
  faq_q6: "Playlist များ ဒေါင်းလုဒ်လုပ်နိုင်သလား?",
  faq_a6:
    "ယနေ့ single video များကို support လုပ်သည်။ Playlist နှင့် channel support သည် roadmap တွင် ရှိသည်။",
  faq_q7: "YouTube account သို့မဟုတ် ကွတ်ကီးများ လိုအပ်သလား?",
  faq_a7:
    "မလိုပါ — ထိုအချက်သည် ကြားသည်ထက် ပိုအရေးကြီးသည်။ YouTube အပ်ဒိတ်ပြီးနောက် အလုပ်မလုပ်တော့သော tool အများစုသည် သင့် browser ၏ YouTube ကွတ်ကီးများကို ထုတ်ယူပေးဖို့ ပြောသည်။ ထို workaround သည် YouTube session rotate လုပ်သောကြောင့် ~30 မိနစ်တိုင်း ကျိုးကောက်ပြီး yt-dlp ၏ ကိုယ်ပိုင် docs တွင်ပင် ၎င်းသည် သင့် Google account ကို flag ဖြစ်စေနိုင်သည်ဟု သတိပေးသည်။ Arroxy သည် ကွတ်ကီး သို့မဟုတ် credential ကို ဘယ်တော့မှ အသုံးမပြု။ လော့ဂ်အင် မရှိ။ Account မချိတ်ဆက်ထား။ သက်တမ်းကုန်မည့်အရာ မရှိ၊ ban ဖြစ်မည့်အရာ မရှိ။",
  faq_q8:
    'macOS က "app ပျက်စီးနေသည်" သို့မဟုတ် "ဖွင့်၍မရ" ဟုဆိုသည် — ဘာလုပ်ရမည်နည်း?',
  faq_a8:
    "ဤသည် macOS Gatekeeper သည် လက်မှတ်မထိုးသော app ကို ပိတ်ဆို့ခြင်းဖြစ်သည် — တကယ့် ပျက်စီးမှုမဟုတ်ပါ။ macOS တွင် ပထမဆုံး ဖွင့်ခြင်းအတွက် README တွင် အဆင့်ဆင့် ညွှန်ကြားချက်များ ရှိသည်။",
  faq_q9: "ဤသည် တရားဝင်သလား?",
  faq_a9:
    "ကိုယ်ပိုင် အသုံးပြုရန် ဗီဒီယိုများ ဒေါင်းလုဒ်လုပ်ခြင်းသည် တိုင်းပြည်အများစုတွင် ယေဘုယျအားဖြင့် လက်ခံသည်။ YouTube ၏ Terms of Service နှင့် သင့်ဒေသဆိုင်ရာ ဥပဒေများကို လိုက်နာရန် သင်တာဝန်ရှိသည်။",
};
