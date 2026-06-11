const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — ক্রস-প্ল্যাটফর্ম ডেস্কটপ শেল
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — স্টাইলিং
- **Zustand** — স্টেট ম্যানেজমেন্ট
- **yt-dlp** + **ffmpeg** — ডাউনলোড ও মাক্স ইঞ্জিন (yt-dlp রানটাইমে আনা হয়; ffmpeg/ffprobe বিল্ড টাইমে বান্ডেল থাকে)
- **Vite** + **electron-vite** — বিল্ড টুলিং
- **Vitest** + **Playwright** — ইউনিট ও এন্ড-টু-এন্ড টেস্ট

</details>

<details>
<summary><strong>সোর্স থেকে বিল্ড করুন</strong></summary>

### সব প্ল্যাটফর্মের জন্য পূর্বশর্ত

| টুল  | ভার্সন     | ইনস্টল |
| ---- | ------- | ------- |
| Git  | যেকোনো  | [git-scm.com](https://git-scm.com) |
| Bun  | সর্বশেষ | নিচে OS অনুযায়ী দেখুন |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

কোনো নেটিভ বিল্ড টুল দরকার নেই — প্রজেক্টে কোনো নেটিভ Node addon নেই।

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron রানটাইম ডিপেন্ডেন্সি
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# শুধুমাত্র E2E টেস্টের জন্য (Electron-এর ডিসপ্লে দরকার)
sudo apt install -y xvfb
\`\`\`

### ক্লোন করুন ও চালান

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # হট-রিলোড ডেভ বিল্ড
\`\`\`

### ডিস্ট্রিবিউটেবল বিল্ড করুন

\`\`\`bash
bun run build        # টাইপচেক + কম্পাইল
bun run dist         # বর্তমান OS-এর জন্য প্যাকেজ করুন
bun run dist:win     # ক্রস-কম্পাইল Windows পোর্টেবল exe
\`\`\`

> yt-dlp প্রথম চালুতে GitHub থেকে আনা হয় এবং আপনার অ্যাপ ডেটা ফোল্ডারে ক্যাশ হয়। ffmpeg ও ffprobe প্রতিটি Arroxy রিলিজের সাথেই বান্ডেল থাকে।

</details>`;

export const bn = {
  icon_alt: "Arroxy মাসকট",
  title: "Arroxy — Windows, macOS ও Linux-এর জন্য বিনামূল্যে ওপেন-সোর্স YouTube (+ ২০০০ সাইট) ডাউনলোডার",
  read_in_label: "পড়ুন:",
  badge_release_alt: "রিলিজ",
  badge_build_alt: "বিল্ড",
  badge_license_alt: "লাইসেন্স",
  badge_platforms_alt: "প্ল্যাটফর্ম",
  badge_i18n_alt: "ভাষাসমূহ",
  badge_website_alt: "ওয়েবসাইট",
  discord_badge_text: "Discord কমিউনিটিতে যোগ দিন",
  discord_badge_encoded: "Discord%20%E0%A6%95%E0%A6%AE%E0%A6%BF%E0%A6%89%E0%A6%A8%E0%A6%BF%E0%A6%9F%E0%A6%BF%E0%A6%A4%E0%A7%87%20%E0%A6%AF%E0%A7%8B%E0%A6%97%20%E0%A6%A6%E0%A6%BF%E0%A6%A8",
  hero_desc:
    "**YouTube ও ২০০০+ সমর্থিত সাইট** থেকে ভিডিও, Shorts, সংগীত, চ্যানেল, পডকাস্ট বা অডিও ট্র্যাক ডাউনলোড করুন — 60 fps-এ 4K HDR পর্যন্ত, অথবা MP3 / AAC / Opus হিসেবে। Windows, macOS ও Linux-এ লোকালি চলে। **কোনো বিজ্ঞাপন নেই, কোনো ব্লোট নেই, কোনো আপসেল নেই।**",
  cta_latest: "↓ সর্বশেষ রিলিজ ডাউনলোড করুন",
  cta_website: "ওয়েবসাইট",
  demo_alt: "Arroxy ডেমো",
  star_cta: "Arroxy যদি আপনার সময় বাঁচায়, তাহলে একটি ⭐ অন্যদের খুঁজে পেতে সাহায্য করে।",
  ai_notice: "",
  toc_heading: "বিষয়বস্তু",
  why_h2: "কেন Arroxy",
  features_h2: "বৈশিষ্ট্যসমূহ",
  dl_h2: "ডাউনলোড",
  privacy_h2: "গোপনীয়তা",
  faq_h2: "সাধারণ প্রশ্নোত্তর",
  roadmap_h2: "রোডম্যাপ",
  tech_h2: "নির্মিত হয়েছে",
  why_intro: "সবচেয়ে সাধারণ বিকল্পগুলির সাথে পাশাপাশি তুলনা:",
  why_r1: "বিনামূল্যে, কোনো প্রিমিয়াম টায়ার নেই",
  why_r2: "ওপেন সোর্স",
  why_r3: "শুধুমাত্র লোকাল প্রসেসিং",
  why_r4: "কোনো লগইন বা কুকি এক্সপোর্ট নেই",
  why_r5: "কোনো ব্যবহারের সীমা নেই",
  why_r6: "ক্রস-প্ল্যাটফর্ম ডেস্কটপ অ্যাপ",
  why_r7: "সাবটাইটেল + SponsorBlock",
  why_summary:
    "Arroxy একটি কাজের জন্য তৈরি: URL পেস্ট করুন, একটি পরিষ্কার লোকাল ফাইল পান। কোনো অ্যাকাউন্ট নেই, কোনো আপসেল নেই, কোনো ডেটা সংগ্রহ নেই।",
  feat_quality_h3: "মান ও ফরম্যাট",
  feat_quality_1: "**4K UHD (2160p)** পর্যন্ত, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**হাই ফ্রেম রেট** যেমন আছে তেমনই — 60 fps, 120 fps, HDR",
  feat_quality_3: "**শুধু অডিও** MP3, M4A/AAC, Opus বা WAV হিসেবে এক্সপোর্ট",
  feat_quality_4: "দ্রুত প্রিসেট: *সর্বোচ্চ মান* · *ব্যালেন্সড* · *ছোট ফাইল*",
  feat_privacy_h3: "গোপনীয়তা ও নিয়ন্ত্রণ",
  feat_privacy_1:
    "১০০% লোকাল প্রসেসিং — ডাউনলোড সরাসরি YouTube থেকে আপনার ডিস্কে যায়",
  feat_privacy_2: "কোনো লগইন নেই, কোনো কুকিজ নেই, কোনো Google অ্যাকাউন্ট লিঙ্ক নেই",
  feat_privacy_3: "ফাইল সরাসরি আপনার বেছে নেওয়া ফোল্ডারে সংরক্ষিত হয়",
  feat_workflow_h3: "ওয়ার্কফ্লো",
  feat_workflow_1:
    "**নমনীয় শুরু মোড** — গাইডেড একক ডাউনলোড, playlist/channel picker, bulk URL paste, অথবা সংরক্ষিত ডিফল্টসহ Quick Download বেছে নিন",
  feat_workflow_2:
    "**কেন্দ্রীয় ডাউনলোড queue** — একক, playlist, bulk, বা quick কাজ সবই progress, pause, resume, cancel, retry, এবং priority control-এর জন্য এক জায়গায় আসে",
  feat_workflow_3:
    "**ক্লিপবোর্ড ওয়াচ** — একটি YouTube লিঙ্ক কপি করুন এবং অ্যাপে ফিরলে Arroxy স্বয়ংক্রিয়ভাবে URL পূরণ করে (অ্যাডভান্সড সেটিংসে টগল করুন)",
  feat_workflow_4:
    "**অটো-ক্লিন URLs** — ট্র্যাকিং প্যারামিটার (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) সরিয়ে দেয় এবং `youtube.com/redirect` লিঙ্ক খুলে দেয়",
  feat_workflow_5:
    "**ট্রে মোড** — উইন্ডো বন্ধ করলেও ডাউনলোড ব্যাকগ্রাউন্ডে চলতে থাকে",
  feat_workflow_6:
    "**২১টি ভাষা** — সিস্টেম লোকেল স্বয়ংক্রিয়ভাবে শনাক্ত করে, যেকোনো সময় পরিবর্তনযোগ্য",
  feat_workflow_7:
    "**প্লেলিস্ট সিঙ্ক** — আগে ডাউনলোড করা ভিডিও এড়াতে একটি স্থানীয় ফোল্ডারের সঙ্গে প্লেলিস্ট আবার স্ক্যান করে; প্রতিটি ভিডিও ডাউনলোড হওয়ার সঙ্গে সঙ্গে আপডেট হওয়া একটি `.m3u` প্লেলিস্ট ফাইল তৈরি করে",
  feat_workflow_8:
    "**Speed ও pacing controls** — download bandwidth সীমিত করুন, request delay যোগ করুন, এবং presets (*Off · Balanced · Careful · Custom*) দিয়ে fragment threads tune করুন",
  feat_post_h3: "সাবটাইটেল ও পোস্ট-প্রসেসিং",
  feat_post_1:
    "**সাবটাইটেল** SRT, VTT বা ASS-এ — ম্যানুয়াল বা অটো-জেনারেটেড, যেকোনো উপলব্ধ ভাষায়",
  feat_post_2:
    "ভিডিওর পাশে সংরক্ষণ করুন, `.mkv`-এ এম্বেড করুন, বা `Subtitles/` সাবফোল্ডারে সংগঠিত করুন",
  feat_post_3:
    "**SponsorBlock** — স্পনসর, ইন্ট্রো, আউট্রো, সেলফ-প্রোমো স্কিপ বা চ্যাপ্টার-মার্ক করুন",
  feat_post_4:
    "**এম্বেডেড মেটাডেটা** — শিরোনাম, আপলোডের তারিখ, চ্যানেল, বিবরণ, থাম্বনেইল ও চ্যাপ্টার মার্কার ফাইলে লেখা হয়",
  feat_sites_h3: "YouTube + ২০০০ সাইট",
  feat_sites_1:
    "**YouTube, সম্পূর্ণ** — Videos, Shorts, Channels, Playlists, YouTube Music ও Podcasts প্রথম শ্রেণীর উৎস হিসেবে পরিচালিত হয়",
  feat_sites_2:
    "**২০০০+ অন্যান্য সাইট** yt-dlp-এর মাধ্যমে — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org এবং আরও অনেক কিছু",
  feat_sites_3:
    "**শুধু অডিও ও সাবটাইটেল** সমস্ত সমর্থিত সাইটে কাজ করে, শুধু YouTube-এ নয়",
  feat_sites_4:
    "কোনো সাইট পরিবর্তিত হলে, yt-dlp সাপ্তাহিক ফিক্স পাঠায় এবং Arroxy লঞ্চে বাইনারি অটো-আপডেট করে",
  shot1_alt: "একটি URL পেস্ট করুন",
  shot2_alt: "আপনার মান বেছে নিন",
  shot3_alt: "কোথায় সংরক্ষণ করবেন বেছে নিন",
  shot4_alt: "ডাউনলোড কিউ সক্রিয়",
  shot5_alt: "সাবটাইটেল ভাষা ও ফরম্যাট পিকার",
  dl_platform_col: "প্ল্যাটফর্ম",
  dl_format_col: "ফরম্যাট",
  dl_win_format: "ইনস্টলার (NSIS) বা পোর্টেবল `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` বা `.flatpak` (sandboxed)",
  dl_grab: "সর্বশেষ রিলিজ নিন →",
  dl_pkg_h3: "প্যাকেজ ম্যানেজারের মাধ্যমে ইনস্টল করুন",
  dl_channel_col: "চ্যানেল",
  dl_command_col: "কমান্ড",
  dl_win_h3: "Windows: ইনস্টলার বনাম পোর্টেবল",
  dl_win_col_installer: "NSIS ইনস্টলার",
  dl_win_col_portable: "পোর্টেবল `.exe`",
  dl_win_r1: "ইনস্টলেশন প্রয়োজন",
  dl_win_r1_installer: "হ্যাঁ",
  dl_win_r1_portable: "না — যেকোনো জায়গা থেকে চালান",
  dl_win_r2: "অটো-আপডেট",
  dl_win_r2_installer: "✅ অ্যাপের মধ্যে",
  dl_win_r2_portable: "❌ ম্যানুয়াল ডাউনলোড",
  dl_win_r3: "স্টার্টআপ গতি",
  dl_win_r3_installer: "✅ দ্রুততর",
  dl_win_r3_portable: "⚠️ কোল্ড স্টার্ট ধীর",
  dl_win_r4: "স্টার্ট মেনুতে যোগ করে",
  dl_win_r5: "সহজ আনইনস্টল",
  dl_win_r5_portable: "❌ ফাইলটি মুছে দিন",
  dl_win_rec:
    "**সুপারিশ:** অটো-আপডেট ও দ্রুত স্টার্টআপের জন্য NSIS ইনস্টলার ব্যবহার করুন। ইনস্টলেশন ও রেজিস্ট্রি-মুক্ত বিকল্পের জন্য পোর্টেবল `.exe` ব্যবহার করুন।",
  dl_win_smartscreen_h4: "Windows SmartScreen সতর্কতা",
  dl_win_smartscreen_intro:
    "প্রথম চালুতে আপনি **\"Windows protected your PC\"** বা **\"Unknown publisher.\"** দেখতে পারেন। এটি `Arroxy-win-x64-Setup.exe` এবং `Arroxy-win-x64-Portable.exe` উভয়ের ক্ষেত্রে প্রযোজ্য। Arroxy বিনামূল্যে ও ওপেন-সোর্স এবং Windows বিল্ডগুলো পেইড সার্টিফিকেট দিয়ে কোড-সাইন করা নয়, এ কারণে SmartScreen ফ্ল্যাগ করে। এর মানে **স্বয়ংক্রিয়ভাবে** এই নয় যে Arroxy অনিরাপদ। চালিয়ে যেতে:",
  dl_win_smartscreen_step1: "**More info** ক্লিক করুন।",
  dl_win_smartscreen_step2: "**Run anyway** ক্লিক করুন।",
  dl_win_smartscreen_official:
    "শুধুমাত্র অফিশিয়াল GitHub Releases পেজ থেকে Arroxy ডাউনলোড করুন। অন্য ওয়েবসাইট থেকে পেলে বা কেউ পাঠালে সেটি মুছে ফেলুন এবং অফিশিয়াল সোর্স থেকে নতুন করে ডাউনলোড করুন। সোর্স কোড পাবলিক, তাই ইচ্ছে করলে আপনি নিজে পরীক্ষা করতে বা Arroxy বিল্ড করতে পারবেন।",
  dl_macos_h3: "macOS-এ প্রথমবার চালু করা",
  dl_macos_warning:
    "Arroxy এখনো কোড-সাইন করা নয়, তাই প্রথম চালুতে macOS Gatekeeper সতর্কবার্তা দেখাবে। এটি প্রত্যাশিত — এটি ক্ষতির কোনো চিহ্ন নয়।",
  dl_macos_m1_h4: "সিস্টেম সেটিংস পদ্ধতি (প্রস্তাবিত):",
  dl_macos_step1: "Arroxy অ্যাপ আইকনে রাইট-ক্লিক করুন এবং **Open** বেছে নিন।",
  dl_macos_step2:
    "সতর্কতা ডায়ালগ আসবে — **Cancel** ক্লিক করুন (*Move to Trash* ক্লিক করবেন না)।",
  dl_macos_step3: "**System Settings → Privacy & Security** খুলুন।",
  dl_macos_step4:
    '**Security** বিভাগে স্ক্রল করুন। দেখতে পাবেন *"Arroxy was blocked from use because it is not from an identified developer."*',
  dl_macos_step5:
    "**Open Anyway** ক্লিক করুন এবং আপনার পাসওয়ার্ড বা Touch ID দিয়ে নিশ্চিত করুন।",
  dl_macos_after:
    "ধাপ ৫-এর পরে Arroxy স্বাভাবিকভাবে খুলবে এবং সতর্কবার্তা আর কখনো দেখাবে না।",
  dl_macos_m2_h4: "টার্মিনাল পদ্ধতি (অ্যাডভান্সড):",
  dl_macos_note:
    "macOS বিল্ডগুলো CI-তে Apple Silicon ও Intel রানারে তৈরি হয়। সমস্যা হলে [একটি ইস্যু খুলুন](../../issues) — macOS ব্যবহারকারীদের মতামত সক্রিয়ভাবে macOS টেস্টিং চক্রকে রূপ দেয়।",
  dl_linux_h3: "Linux-এ প্রথমবার চালু করা",
  dl_linux_intro:
    "AppImage সরাসরি চলে — কোনো ইনস্টলেশন নেই। শুধু ফাইলটিকে এক্সিকিউটেবল হিসেবে চিহ্নিত করতে হবে।",
  dl_linux_m1_text:
    "**ফাইল ম্যানেজার:** `.AppImage`-এ রাইট-ক্লিক → **Properties** → **Permissions** → **Allow executing file as program** সক্রিয় করুন, তারপর ডাবল-ক্লিক করুন।",
  dl_linux_m2_h4: "টার্মিনাল:",
  dl_linux_fuse_text: "চালু না হলে, FUSE অনুপস্থিত থাকতে পারে:",
  dl_linux_flatpak_intro:
    "**Flatpak (স্যান্ডবক্সড বিকল্প):** একই রিলিজ পেজ থেকে `Arroxy-*.flatpak` ডাউনলোড করুন।",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "কেন আপনি সতর্কবার্তা দেখতে পাচ্ছেন",
  dl_warning_p1:
    "Arroxy ওপেন-সোর্স এবং MIT-লাইসেন্সকৃত। Windows এবং macOS বিল্ডগুলো **কোড-সাইন করা নয়** — Apple Developer ID এবং Windows EV কোড-সাইনিং সার্টিফিকেটের প্রতিটির জন্য বছরে কয়েকশো ডলার খরচ হয়, যা একটি ইন্ডি প্রজেক্ট নিজের পকেট থেকে দেয়। এই সিগনেচার ছাড়া, Windows SmartScreen এবং macOS Gatekeeper প্রথম লঞ্চে আপনাকে সতর্ক করবে। সতর্কবার্তার মানে হলো *আপনার OS প্রকাশকটিকে চেনে না* — এর মানে এই নয় যে Arroxy ম্যালওয়্যার।",
  dl_warning_p2:
    "তিনটি উপায়ে নিজেই Arroxy যাচাই করুন, ক্রমবর্ধমান কঠোরতায়:\n\n- **সোর্স পড়ুন।** প্রতিটি লাইন [GitHub](https://github.com/antonio-orionus/Arroxy)-এ আছে এবং আপনি [সোর্স থেকে বিল্ড করতে](#tech) পারবেন।\n- **SHA256 মিলিয়ে দেখুন।** প্রকাশিত [`SHA256SUMS`](../../releases/latest) এর সাথে আপনার ফাইল মেলান — নিচে [আপনার ডাউনলোড যাচাই করুন](#verify) দেখুন।\n- **তৃতীয়-পক্ষ স্ক্যান চালান।** ফাইলটি [VirusTotal](https://www.virustotal.com)-এ আপলোড করুন।",

  dl_win_first_h3: "Windows প্রথম লঞ্চ",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" ডায়ালগ যেখানে "More info" লিঙ্কটি হাইলাইট করা',
  shot_smartscreen_run_alt:
    'More info প্রসারিত করার পর SmartScreen ডায়ালগ, "Run anyway" বোতামটি দেখাচ্ছে',
  dl_win_defender_h4: "Windows Defender যদি ফাইলটি ফ্ল্যাগ বা সরিয়ে দেয়",
  dl_win_defender_p:
    "Defender হিউরিস্টিক্স কখনো কখনো আনসাইনড NSIS ইনস্টলার এবং Electron পোর্টেবলগুলোকে সন্দেহজনক হিসেবে চিহ্নিত করে। যদি Defender `Arroxy-win-x64-Setup.exe` বা `Arroxy-win-x64-Portable.exe` কোয়ারেন্টিনে রাখে, **Windows Security → Virus & threat protection → Protection history** থেকে পুনরুদ্ধার করুন, তারপর **Manage settings → Add or remove exclusions** এর অধীনে Arroxy এক্সিকিউটেবলটিকে অনুমোদিত আইটেম হিসেবে যোগ করুন। SmartScreen-এর মতোই, ট্রিগারটি হলো অনুপস্থিত প্রকাশক সিগনেচার, কোনো ম্যালওয়্যার শনাক্তি নয়।",

  dl_macos_first_h3: "macOS প্রথম লঞ্চ",
  dl_macos_intro:
    "Arroxy এখনো macOS-এর জন্য কোড-সাইন করা হয়নি, তাই Gatekeeper প্রথম লঞ্চটি ব্লক করবে। এটি অনুমোদন দেওয়ার সঠিক পদ্ধতি আপনার macOS ভার্সনের উপর নির্ভর করে — Sequoia 15 পুরনো রাইট-ক্লিক → Open বাইপাসটি কঠোর করে দিয়েছে।",
  dl_macos_sequoia_h4: "macOS Sequoia 15 এবং পরবর্তী (বর্তমান)",
  dl_macos_sequoia_intro:
    "Sequoia 15 এবং নতুনে, রাইট-ক্লিক → Open আর অনেক কোয়ারেন্টিনড অ্যাপের জন্য Gatekeeper বাইপাস করে না। পরিবর্তে System Settings প্যানেল ব্যবহার করুন:",
  dl_macos_sequoia_step1:
    "মাউন্ট করা DMG থেকে `Arroxy.app` টেনে `/Applications`-এ রাখুন।",
  dl_macos_sequoia_step2:
    "Arroxy ডাবল-ক্লিক করুন। ব্লক ডায়ালগ দেখা যাবে — **Done** ক্লিক করুন (*Move to Trash* ক্লিক করবেন না)।",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** খুলুন এবং **Security** বিভাগে স্ক্রল করুন। দেখবেন *"Arroxy was blocked to protect your Mac"* (বা অনুরূপ বার্তা)।',
  dl_macos_sequoia_step4:
    "**Open Anyway** ক্লিক করুন, আপনার পাসওয়ার্ড বা Touch ID দিয়ে নিশ্চিত করুন, তারপর `/Applications` থেকে Arroxy পুনরায় চালু করুন।",
  dl_macos_sonoma_h4: "macOS Sonoma 14 এবং পুরনো",
  dl_macos_sonoma_step1:
    "মাউন্ট করা DMG থেকে `Arroxy.app` টেনে `/Applications`-এ রাখুন।",
  dl_macos_sonoma_step2:
    "`/Applications`-এ `Arroxy.app`-এ রাইট-ক্লিক (বা Control-ক্লিক) করুন এবং **Open** বেছে নিন।",
  dl_macos_sonoma_step3:
    "সতর্কতা ডায়ালগে এখন **Open** বোতাম আছে — এটিতে ক্লিক করুন এবং নিশ্চিত করুন। Arroxy স্বাভাবিকভাবে খুলবে এবং সতর্কবার্তা আর কখনো দেখাবে না।",
  dl_macos_damaged_h4:
    '"App is damaged" অথবা ক্রমাগত Gatekeeper ব্লক — Terminal ফিক্স',
  dl_macos_damaged_p:
    'যদি macOS বলে *"Arroxy is damaged and can\'t be opened"*, অথবা উপরের পদক্ষেপগুলোর কোনোটিই ব্লক পরিষ্কার না করে, তাহলে DMG-এর কোয়ারেন্টিন অ্যাট্রিবিউটই কারণ (কিছু ব্রাউজার এবং macOS নিজস্ব ট্র্যান্সলোকেশন আচরণ এটি সেট করে)। ইনস্টল করা অ্যাপ থেকে এটি সরিয়ে দিন:',
  dl_macos_arch_note:
    "**Apple Silicon বনাম Intel:** M-সিরিজ Mac (M1 / M2 / M3 / M4)-এ `arm64` DMG ডাউনলোড করুন। Intel Mac-এ `x64` DMG ডাউনলোড করুন। ভুল বিল্ড চালানো Rosetta-র মাধ্যমে কাজ করবে তবে উল্লেখযোগ্যভাবে ধীর হবে।",

  dl_linux_first_h3: "Linux প্রথম লঞ্চ",
  dl_linux_appimagelauncher:
    "**ঐচ্ছিক ডেস্কটপ ইন্টিগ্রেশন:** একবার [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ইনস্টল করুন, এবং আপনি যেকোনো AppImage ডাবল-ক্লিক করলে স্বয়ংক্রিয়ভাবে আপনার লঞ্চার মেনুতে নিবন্ধিত হবে — কোনো ম্যানুয়াল `.desktop` ফাইল দরকার নেই।",

  dl_verify_h3: "আপনার ডাউনলোড যাচাই করুন (SHA256)",
  dl_verify_intro:
    "প্রতিটি রিলিজ বাইনারির পাশাপাশি একটি `SHA256SUMS` ফাইল প্রকাশ করে। আপনার ডাউনলোড ট্রানজিটে নষ্ট বা টেম্পার করা হয়নি তা পরীক্ষা করতে, আপনার ফাইলটি স্থানীয়ভাবে হ্যাশ করুন এবং `SHA256SUMS`-এর লাইনের সাথে মেলান। সর্বশেষ রিলিজ পেজ খুলুন → **Assets** → `SHA256SUMS` ডাউনলোড করুন।",
  dl_verify_win_label: "Windows (PowerShell বা Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "তৃতীয়-পক্ষ ম্যালওয়্যার স্ক্যান চান? [VirusTotal](https://www.virustotal.com)-এ ফাইলটি আপলোড করুন। ছোট ইঞ্জিনগুলো থেকে কিছু জেনেরিক-হিউরিস্টিক ফ্ল্যাগ আনসাইনড Electron অ্যাপের জন্য স্বাভাবিক; প্রধান ইঞ্জিনগুলো থেকে ব্যাপক শনাক্তি সত্যিকারের উদ্বেগের কারণ হবে।",

  dl_pm_intro:
    "ইতোমধ্যে একটি প্যাকেজ ম্যানেজার ব্যবহার করছেন? আপনি ম্যানুয়াল ডাউনলোডের পথ এড়িয়ে যেতে পারেন।",

  privacy_p1:
    "ডাউনলোডগুলো সরাসরি [yt-dlp](https://github.com/yt-dlp/yt-dlp)-এর মাধ্যমে YouTube থেকে আপনার বেছে নেওয়া ফোল্ডারে আনা হয় — কোনো থার্ড-পার্টি সার্ভারের মধ্য দিয়ে যায় না। দেখার ইতিহাস, ডাউনলোড ইতিহাস, URL ও ফাইলের বিষয়বস্তু আপনার ডিভাইসেই থাকে।",
  privacy_p2:
    "Arroxy [OpenPanel](https://openpanel.dev)-এর মাধ্যমে বেনামী, সমষ্টিগত টেলিমেট্রি পাঠায় — চালু হওয়া, OS, অ্যাপ সংস্করণ ও ক্র্যাশ বোঝার জন্য যতটা দরকার। কোনো URL, ভিডিও শিরোনাম, ফাইল পাথ, অ্যাকাউন্ট তথ্য, ফিঙ্গারপ্রিন্টিং বা ব্যক্তিগত ডেটা নেই। প্রতি-ইনস্টল ID এলোমেলো এবং আপনার পরিচয়ের সাথে যুক্ত নয়। সেটিংসে অপ্ট আউট করতে পারবেন।",
  faq_q1: "এটি কি সত্যিই বিনামূল্যে?",
  faq_a1: "হ্যাঁ — MIT লাইসেন্স, কোনো প্রিমিয়াম টায়ার নেই, কোনো ফিচার গেটিং নেই।",
  faq_q2: "আমি কোন ভিডিও মানে ডাউনলোড করতে পারব?",
  faq_a2:
    "YouTube যা দেয় সব কিছু: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, এবং শুধু অডিও। 60 fps, 120 fps ও HDR স্ট্রিম যেমন আছে তেমনই রাখা হয়।",
  faq_q3: "আমি কি শুধু অডিও MP3 হিসেবে বের করতে পারব?",
  faq_a3: "হ্যাঁ। format মেনু থেকে *শুধু অডিও* বেছে নিন, তারপর MP3, M4A/AAC, Opus বা WAV নির্বাচন করুন।",
  faq_q4: "আমার কি YouTube অ্যাকাউন্ট বা কুকিজ দরকার?",
  faq_a4:
    "ডিফল্টভাবে, না — Arroxy YouTube অ্যাকাউন্ট, লগইন বা কুকি এক্সপোর্ট ছাড়াই কাজ করে। বয়স-সীমাবদ্ধ বা শুধুমাত্র সদস্যদের জন্য ভিডিওর মতো প্রমাণীকরণের প্রয়োজন এমন কনটেন্টের জন্য Advanced settings-এ ঐচ্ছিক কুকি সাপোর্ট পাওয়া যায় (Cookies source: file or browser)। ডিফল্টভাবে এটি বন্ধ থাকে। আপনি যদি এটি চালু করেন, yt-dlp-এর উইকি উল্লেখ করে যে [কুকি-ভিত্তিক অটোমেশন একটি Google অ্যাকাউন্টকে ফ্ল্যাগ করতে পারে](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); সেক্ষেত্রে একটি অস্থায়ী অ্যাকাউন্টই নিরাপদ পছন্দ।",
  faq_q5: "YouTube কিছু পরিবর্তন করলেও কি এটি কাজ করতে থাকবে?",
  faq_a5:
    "yt-dlp চালুর সময় স্বয়ংক্রিয়ভাবে আপডেট হয়, এবং YouTube কিছু পরিবর্তন করলে Arroxy দ্রুত ফিক্স পাঠায়। যদি কখনো সমস্যায় পড়েন, ফলব্যাক হিসেবে Advanced settings-এ ঐচ্ছিক কুকি সাপোর্ট পাওয়া যায়।",
  faq_q6: "Arroxy কোন ভাষায় পাওয়া যায়?",
  faq_a6:
    "একুশটি, বাক্সের বাইরে: English, Español (স্পেনিশ), Deutsch (জার্মান), Français (ফরাসি), 日本語 (জাপানি), 中文 (চীনা), Русский (রাশিয়ান), Українська (ইউক্রেনিয়ান), हिन्दी (হিন্দি), Afaan Oromoo, Kiswahili, O'zbekcha (উজবেক), Tiếng Việt (ভিয়েতনামি), አማርኛ (আমহারিক), العربية (আরবি), اردو (উর্দু), پښتو (পশতু), বাংলা, မြန်မာဘာသာ (বার্মিজ), Ελληνικά (গ্রিক), এবং Српски (সার্বিয়ান)। Arroxy প্রথম চালুতে আপনার অপারেটিং সিস্টেমের ভাষা স্বয়ংক্রিয়ভাবে শনাক্ত করে এবং আপনি টুলবারের ভাষা পিকার থেকে যেকোনো সময় পরিবর্তন করতে পারেন। রানটাইম লোকেল JSON src/shared/i18n/locales/-এ থাকে, আর অনুবাদকদের জন্য PO ক্যাটালগ i18n/locales/-এ থাকে — অবদান রাখতে GitHub-এ একটি PR খুলুন।",
  faq_q7: "আমাকে কি আর কিছু ইনস্টল করতে হবে?",
  faq_a7:
    "না। yt-dlp প্রথম চালুতে স্বয়ংক্রিয়ভাবে ডাউনলোড হয়ে আপনার মেশিনে ক্যাশ হয়; ffmpeg ও ffprobe অ্যাপের সাথেই আসে। এরপর কোনো অতিরিক্ত সেটআপ দরকার নেই।",
  faq_q8: "আমি কি প্লেলিস্ট বা পুরো চ্যানেল ডাউনলোড করতে পারব?",
  faq_a8:
    "হ্যাঁ — দুটোই। playlist বা channel URL paste করুন (যেমন `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); কতগুলো entry scan হবে তা বেছে নিন, তারপর পুরো তালিকা queue করুন বা নির্দিষ্ট video বেছে নিন। date-range filters শিগগির আসছে।",
  faq_q9: 'macOS বলছে "অ্যাপটি ক্ষতিগ্রস্ত" — আমি কী করব?',
  faq_a9:
    'এটি macOS Gatekeeper একটি আনসাইনড অ্যাপ ব্লক করছে, আসল ক্ষতি নয়। ["App is damaged" — Terminal fix](#macos-first-launch) দেখুন যেখানে এক লাইনের `xattr` কমান্ড এটি পরিষ্কার করে।',
  faq_q10: "YouTube ভিডিও ডাউনলোড করা কি বৈধ?",
  faq_a10:
    "ব্যক্তিগত, ব্যক্তিগত ব্যবহারের জন্য এটি বেশিরভাগ এখতিয়ারে সাধারণত গ্রহণযোগ্য। YouTube-এর [Terms of Service](https://www.youtube.com/t/terms) ও আপনার স্থানীয় কপিরাইট আইন মেনে চলা আপনার দায়িত্ব।",
  plan_intro: "এখনও পরিকল্পনায় আছে — মোটামুটি অগ্রাধিকারের ক্রমে:",
  plan_col1: "বৈশিষ্ট্য",
  plan_col2: "বিবরণ",
  plan_r1_name: "**প্লেলিস্ট ও চ্যানেল ফিল্টার**",
  plan_r1_desc: "playlist বা channel enumerate করার সময় date-range filters",
  plan_r2_name: "**ব্যাচ URL ইনপুট**",
  plan_r2_desc: "একসাথে একাধিক URL পেস্ট করুন এবং একবারেই চালান",
  plan_r4_name: "**কাস্টম ফাইলনাম টেমপ্লেট**",
  plan_r4_desc:
    "শিরোনাম, আপলোডকারী, তারিখ, রেজোলিউশন দিয়ে ফাইল নাম দিন — লাইভ প্রিভিউ সহ",
  plan_r5_name: "**নির্ধারিত সময়ে ডাউনলোড**",
  plan_r5_desc: "নির্দিষ্ট সময়ে কিউ শুরু করুন (রাতভর রান)",
  plan_r6_name: "**গতি সীমা**",
  plan_r6_desc: "ব্যান্ডউইডথ সীমিত করুন যাতে ডাউনলোড সংযোগ স্যাচুরেট না করে",
  plan_r7_name: "**ক্লিপ ট্রিমিং**",
  plan_r7_desc: "শুরু/শেষ সময় দিয়ে শুধু একটি অংশ ডাউনলোড করুন",
  plan_cta:
    "মাথায় কোনো বৈশিষ্ট্য আছে? [একটি অনুরোধ খুলুন](../../issues) — কমিউনিটির মতামত অগ্রাধিকার নির্ধারণ করে।",
  tech_content: TECH_CONTENT,
  tos_h2: "ব্যবহারের শর্তাবলী",
  tos_note:
    "Arroxy শুধুমাত্র ব্যক্তিগত, ব্যক্তিগত ব্যবহারের জন্য একটি টুল। আপনার ডাউনলোড YouTube-এর [Terms of Service](https://www.youtube.com/t/terms) ও আপনার এখতিয়ারের কপিরাইট আইন মেনে চলছে কিনা তা নিশ্চিত করা সম্পূর্ণরূপে আপনার দায়িত্ব। এমন বিষয়বস্তু ডাউনলোড, পুনরুৎপাদন বা বিতরণ করতে Arroxy ব্যবহার করবেন না যা ব্যবহার করার অধিকার আপনার নেই। ডেভেলপাররা যেকোনো অপব্যবহারের জন্য দায়ী নন।",
  footer_credit:
    'MIT লাইসেন্স · <a href="https://x.com/OrionusAI">@OrionusAI</a>-এর যত্ন দিয়ে তৈরি',
};
