const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — क्रॉस-प्लेटफ़ॉर्म डेस्कटॉप शेल
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — स्टाइलिंग
- **Zustand** — स्टेट मैनेजमेंट
- **yt-dlp** + **ffmpeg** — डाउनलोड और मक्स इंजन (yt-dlp रनटाइम पर फ़ेच होता है; ffmpeg/ffprobe बिल्ड समय पर बंडल होते हैं)
- **Vite** + **electron-vite** — बिल्ड टूलिंग
- **Vitest** + **Playwright** — यूनिट और एंड-टू-एंड टेस्ट

</details>

<details>
<summary><strong>सोर्स से बिल्ड करें</strong></summary>

### सभी प्लेटफ़ॉर्म के लिए आवश्यकताएँ

| टूल | वर्शन   | इंस्टॉल |
| ---- | ------- | ------- |
| Git  | कोई भी  | [git-scm.com](https://git-scm.com) |
| Bun  | नवीनतम  | नीचे OS-वार देखें |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

कोई नेटिव बिल्ड टूल ज़रूरी नहीं — प्रोजेक्ट में कोई नेटिव Node addon नहीं है।

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron रनटाइम डिपेंडेंसी
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E टेस्ट के लिए ही (Electron को डिस्प्ले चाहिए)
sudo apt install -y xvfb
\`\`\`

### क्लोन करें और चलाएँ

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # हॉट-रीलोड देव बिल्ड
\`\`\`

### डिस्ट्रीब्यूटेबल बिल्ड करें

\`\`\`bash
bun run build        # टाइपचेक + कम्पाइल
bun run dist         # वर्तमान OS के लिए पैकेज
bun run dist:win     # Windows पोर्टेबल exe क्रॉस-कम्पाइल
\`\`\`

> yt-dlp पहले लॉन्च पर GitHub से फ़ेच होकर आपके ऐप डेटा फ़ोल्डर में कैश होता है। ffmpeg और ffprobe हर Arroxy रिलीज़ के साथ बंडल होते हैं।

</details>`;

export const hi = {
  icon_alt: "Arroxy मस्कट",
  title:
    "Arroxy — Windows, macOS और Linux के लिए मुफ़्त ओपन-सोर्स YouTube (+ 2000 साइट) डाउनलोडर",
  read_in_label: "भाषा:",
  badge_release_alt: "रिलीज़",
  badge_build_alt: "बिल्ड",
  badge_license_alt: "लाइसेंस",
  badge_platforms_alt: "प्लेटफ़ॉर्म",
  badge_i18n_alt: "भाषाएँ",
  badge_website_alt: "वेबसाइट",
  discord_badge_text: "Discord समुदाय से जुड़ें",
  discord_badge_encoded:
    "Discord%20%E0%A4%B8%E0%A4%AE%E0%A5%81%E0%A4%A6%E0%A4%BE%E0%A4%AF%20%E0%A4%B8%E0%A5%87%20%E0%A4%9C%E0%A5%81%E0%A4%A1%E0%A4%BC%E0%A5%87%E0%A4%82",
  hero_desc:
    "**YouTube और 2000+ समर्थित साइटों** से वीडियो, Shorts, संगीत, चैनल, पॉडकास्ट या ऑडियो ट्रैक डाउनलोड करें — 60 fps पर 4K HDR तक, या MP3 / AAC / Opus के रूप में। Windows, macOS और Linux पर लोकल रन होता है। **कोई विज्ञापन नहीं, कोई ब्लोट नहीं, कोई अपसेल नहीं।**",
  cta_latest: "↓ नवीनतम रिलीज़ डाउनलोड करें",
  cta_website: "वेबसाइट",
  demo_alt: "Arroxy डेमो",
  star_cta:
    "अगर Arroxy आपका समय बचाता है, तो ⭐ दूसरों को इसे खोजने में मदद करती है।",
  ai_notice:
    "> 🌐 यह AI-सहायता प्राप्त अनुवाद है। [अंग्रेज़ी README](README.md) सत्य का स्रोत है। कोई गलती दिखी? [PR का स्वागत है](../../pulls)।",
  toc_heading: "विषय-सूची",
  why_h2: "Arroxy क्यों?",
  features_h2: "फ़ीचर",
  dl_h2: "डाउनलोड",
  privacy_h2: "प्राइवेसी",
  faq_h2: "अक्सर पूछे जाने वाले प्रश्न",
  roadmap_h2: "रोडमैप",
  tech_h2: "बनाया गया",
  why_intro: "सबसे आम विकल्पों के साथ एक साथ-साथ तुलना:",
  why_r1: "मुफ़्त, कोई प्रीमियम टियर नहीं",
  why_r2: "ओपन सोर्स",
  why_r3: "केवल लोकल प्रोसेसिंग",
  why_r4: "कोई लॉगिन या कुकी एक्सपोर्ट नहीं",
  why_r5: "कोई उपयोग सीमा नहीं",
  why_r6: "क्रॉस-प्लेटफ़ॉर्म डेस्कटॉप ऐप",
  why_r7: "सबटाइटल + SponsorBlock",
  why_summary:
    "Arroxy एक काम के लिए बना है: URL पेस्ट करें, एक साफ़ लोकल फ़ाइल पाएँ। कोई अकाउंट नहीं, कोई अपसेल नहीं, कोई डेटा कलेक्शन नहीं।",
  feat_quality_h3: "क्वालिटी और फ़ॉर्मैट",
  feat_quality_1: "**4K UHD (2160p)** तक, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**हाई फ़्रेम रेट** जैसा है वैसा — 60 fps, 120 fps, HDR",
  feat_quality_3:
    "**ऑडियो** — सिर्फ ऑडियो को MP3, M4A/AAC, Opus या WAV में एक्सपोर्ट करें। इंटरैक्टिव डाउनलोड में, उपलब्ध होने पर स्रोत के नेटिव surround/Dolby ट्रैक (AC-3, E-AC-3, 5.1, DRC) चुनें, या ग्लोबल डिफ़ॉल्ट **सराउंड / Dolby को प्राथमिकता दें** सेट करें",
  feat_quality_4:
    "त्वरित प्रीसेट: *बेस्ट क्वालिटी* · *बैलेंस्ड* · *स्मॉल फ़ाइल*",
  feat_privacy_h3: "प्राइवेसी और नियंत्रण",
  feat_privacy_1:
    "100% लोकल प्रोसेसिंग — डाउनलोड सीधे YouTube से आपकी डिस्क पर",
  feat_privacy_2:
    "कोई लॉगिन नहीं, कोई कुकीज़ नहीं, कोई Google अकाउंट लिंक नहीं",
  feat_privacy_3: "फ़ाइलें सीधे आपके चुने हुए फ़ोल्डर में सेव",
  feat_workflow_h3: "वर्कफ़्लो",
  feat_workflow_1:
    "**लचीले स्टार्ट मोड** — गाइडेड single download, playlist/channel picker, bulk URL paste, या saved defaults के साथ Quick Download चुनें",
  feat_workflow_2:
    "**केंद्रीय download queue** — हर single, playlist, bulk, या quick job progress, pause, resume, cancel, retry, और priority control के लिए एक जगह आता है",
  feat_workflow_3:
    "**क्लिपबोर्ड वॉच** — YouTube लिंक कॉपी करें और ऐप पर वापस आते ही Arroxy URL अपने आप भर देता है (एडवांस्ड सेटिंग्स में टॉगल करें)",
  feat_workflow_4:
    "**ऑटो-क्लीन URLs** — ट्रैकिंग पैरामीटर (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) हटाता है और `youtube.com/redirect` लिंक खोलता है",
  feat_workflow_5:
    "**ट्रे मोड** — विंडो बंद करने पर डाउनलोड बैकग्राउंड में चलते रहते हैं",
  feat_workflow_6:
    "**21 भाषाएँ** — सिस्टम लोकेल अपने आप पहचानता है, कभी भी बदला जा सकता है",
  feat_workflow_7:
    "**प्लेलिस्ट सिंक** — पहले से डाउनलोड किए गए वीडियो छोड़ने के लिए प्लेलिस्ट को स्थानीय फ़ोल्डर के विरुद्ध फिर से स्कैन करता है; हर वीडियो डाउनलोड होते ही अपडेट होने वाली `.m3u` प्लेलिस्ट फ़ाइल बनाता है",
  feat_workflow_8:
    "**Speed और pacing controls** — download bandwidth cap करें, request delays जोड़ें, और presets (*Off · Balanced · Careful · Custom*) से fragment threads tune करें",
  feat_post_h3: "सबटाइटल और पोस्ट-प्रोसेसिंग",
  feat_post_1:
    "**सबटाइटल** SRT, VTT या ASS में — मैनुअल या ऑटो-जेनरेटेड, किसी भी उपलब्ध भाषा में",
  feat_post_2:
    "वीडियो के बग़ल में सेव करें, `.mkv` में एम्बेड करें, या `Subtitles/` सबफ़ोल्डर में व्यवस्थित करें",
  feat_post_3:
    "**SponsorBlock** — स्पॉन्सर, इंट्रो, आउट्रो, सेल्फ-प्रोमो को स्किप या चैप्टर-मार्क करें",
  feat_post_4:
    "**एम्बेडेड मेटाडेटा** — टाइटल, अपलोड तिथि, चैनल, विवरण, थंबनेल और चैप्टर मार्कर फ़ाइल में लिखे जाते हैं",
  feat_sites_h3: "YouTube + 2000 साइट",
  feat_sites_1:
    "**YouTube, पूरा** — Videos, Shorts, Channels, Playlists, YouTube Music और Podcasts को फ़र्स्ट-क्लास स्रोत के रूप में हैंडल किया जाता है",
  feat_sites_2:
    "**2000+ अन्य साइट** yt-dlp के ज़रिए — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org और भी बहुत कुछ",
  feat_sites_3:
    "**सिर्फ ऑडियो और सबटाइटल** हर समर्थित साइट पर काम करते हैं, न सिर्फ YouTube पर",
  feat_sites_4:
    "अगर कोई साइट बदलती है, तो yt-dlp हर हफ़्ते फ़िक्स जारी करता है और Arroxy लॉन्च पर बाइनरी ऑटो-अपडेट करता है",
  shot1_cap:
    "<b>क्विक डाउनलोड होम</b><br/>एक URL पेस्ट करें और अपनी सक्रिय प्रोफ़ाइल से तुरंत डाउनलोड करें",
  shot2_cap:
    "<b>पुन: प्रयोज्य डाउनलोड प्रोफ़ाइल</b><br/>फ़ॉर्मेट, गुणवत्ता और आउटपुट को प्रीसेट के रूप में सहेजें — हर डाउनलोड पर दोबारा उपयोग करें",
  shot3_cap:
    "<b>बहुभाषी ऑडियो ट्रैक</b><br/>वीडियो में मौजूद सटीक ऑडियो भाषा चुनें",
  shot4_cap:
    "<b>सराउंड / Dolby ऑडियो</b><br/>5.1 और Dolby ट्रैक पहचाने और सुरक्षित रखे जाते हैं",
  shot5_cap:
    "<b>बल्क URL मोड</b><br/>एक सूची पेस्ट करें, स्वतः डुप्लिकेट हटाएँ, सभी को एक साथ कतार में लगाएँ",
  shot6_cap:
    "<b>समानांतर डाउनलोड कतार</b><br/>लाइव प्रगति के साथ एक साथ कई डाउनलोड",
  dl_platform_col: "प्लेटफ़ॉर्म",
  dl_format_col: "फ़ॉर्मैट",
  dl_win_format: "इंस्टॉलर (NSIS) या पोर्टेबल `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` या `.flatpak` (sandboxed)",
  dl_grab: "नवीनतम रिलीज़ लें →",
  dl_pkg_h3: "पैकेज मैनेजर से इंस्टॉल करें",
  dl_channel_col: "चैनल",
  dl_command_col: "कमांड",
  dl_win_h3: "Windows: इंस्टॉलर बनाम पोर्टेबल",
  dl_win_col_installer: "NSIS इंस्टॉलर",
  dl_win_col_portable: "पोर्टेबल `.exe`",
  dl_win_r1: "इंस्टॉलेशन ज़रूरी",
  dl_win_r1_installer: "हाँ",
  dl_win_r1_portable: "नहीं — कहीं से भी चलाएँ",
  dl_win_r2: "ऑटो-अपडेट",
  dl_win_r2_installer: "✅ ऐप में",
  dl_win_r2_portable: "❌ मैन्युअल डाउनलोड",
  dl_win_r3: "स्टार्टअप स्पीड",
  dl_win_r3_installer: "✅ तेज़",
  dl_win_r3_portable: "⚠️ कोल्ड स्टार्ट धीमा",
  dl_win_r4: "स्टार्ट मेन्यू में जुड़ता है",
  dl_win_r5: "आसान अनइंस्टॉल",
  dl_win_r5_portable: "❌ बस फ़ाइल डिलीट कर दें",
  dl_win_rec:
    "**सिफ़ारिश:** ऑटो-अपडेट और तेज़ स्टार्टअप के लिए NSIS इंस्टॉलर इस्तेमाल करें। बिना इंस्टॉल और बिना रजिस्ट्री विकल्प के लिए पोर्टेबल `.exe` लें।",
  dl_win_smartscreen_h4: "Windows SmartScreen चेतावनी",
  dl_win_smartscreen_intro:
    'पहले लॉन्च पर आप **"Windows protected your PC"** या **"Unknown publisher."** देख सकते हैं। यह `Arroxy-win-x64-Setup.exe` और `Arroxy-win-x64-Portable.exe` दोनों पर लागू होता है। Arroxy मुफ़्त और ओपन-सोर्स है और Windows बिल्ड पेड सर्टिफ़िकेट से कोड-साइन नहीं हैं, इसीलिए SmartScreen फ़्लैग करता है। इसका **अपने आप** यह मतलब नहीं कि Arroxy असुरक्षित है। जारी रखने के लिए:',
  dl_win_smartscreen_step1: "**More info** क्लिक करें।",
  dl_win_smartscreen_step2: "**Run anyway** क्लिक करें।",
  dl_win_smartscreen_official:
    "Arroxy केवल आधिकारिक GitHub Releases पेज से डाउनलोड करें। अगर फ़ाइल किसी दूसरी वेबसाइट से मिली हो या किसी ने भेजी हो, तो उसे डिलीट करें और आधिकारिक स्रोत से नई कॉपी डाउनलोड करें। सोर्स कोड सार्वजनिक है, इसलिए आप चाहें तो ख़ुद जाँच सकते हैं या Arroxy ख़ुद बना सकते हैं।",
  dl_macos_h3: "macOS पर पहली बार लॉन्च",
  dl_macos_warning:
    "Arroxy अभी कोड-साइन्ड नहीं है, इसलिए पहले लॉन्च पर macOS Gatekeeper चेतावनी देगा। यह अपेक्षित है — यह नुकसान का संकेत नहीं है।",
  dl_macos_m1_h4: "सिस्टम सेटिंग्स तरीक़ा (अनुशंसित):",
  dl_macos_step1: "Arroxy ऐप आइकॉन पर राइट-क्लिक करें और **Open** चुनें।",
  dl_macos_step2:
    "चेतावनी डायलॉग आएगा — **Cancel** क्लिक करें (*Move to Trash* न क्लिक करें)।",
  dl_macos_step3: "**System Settings → Privacy & Security** खोलें।",
  dl_macos_step4:
    '**Security** सेक्शन तक स्क्रॉल करें। दिखेगा *"Arroxy was blocked from use because it is not from an identified developer."*',
  dl_macos_step5:
    "**Open Anyway** क्लिक करें और पासवर्ड या Touch ID से कन्फ़र्म करें।",
  dl_macos_after:
    "क़दम 5 के बाद Arroxy सामान्य रूप से खुलेगा और चेतावनी फिर कभी नहीं आएगी।",
  dl_macos_m2_h4: "टर्मिनल तरीक़ा (एडवांस्ड):",
  dl_macos_note:
    "macOS बिल्ड CI पर Apple Silicon और Intel रनर्स पर बनाए जाते हैं। अगर कोई समस्या आए, तो [issue खोलें](../../issues) — macOS यूज़र्स का फ़ीडबैक macOS टेस्टिंग साइकिल को सक्रिय रूप से आकार देता है।",
  dl_linux_h3: "Linux पर पहली बार लॉन्च",
  dl_linux_intro:
    "AppImage सीधे चलते हैं — कोई इंस्टॉलेशन नहीं। बस फ़ाइल को एक्ज़ीक्यूटेबल मार्क करना होता है।",
  dl_linux_m1_text:
    "**फ़ाइल मैनेजर:** `.AppImage` पर राइट-क्लिक → **Properties** → **Permissions** → **Allow executing file as program** ऑन करें, फिर डबल-क्लिक से चलाएँ।",
  dl_linux_m2_h4: "टर्मिनल:",
  dl_linux_fuse_text: "अगर फिर भी नहीं चलता, शायद FUSE नहीं है:",
  dl_linux_flatpak_intro:
    "**Flatpak (सैंडबॉक्स विकल्प):** उसी रिलीज़ पेज से `Arroxy-*.flatpak` डाउनलोड करें।",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "चेतावनी क्यों दिख सकती है",
  dl_warning_p1:
    "Arroxy ओपन-सोर्स और MIT-लाइसेंस्ड है। Windows और macOS बिल्ड **कोड-साइन्ड नहीं हैं** — Apple Developer ID और Windows EV कोड-साइनिंग सर्टिफ़िकेट में हर साल सैकड़ों डॉलर का खर्च होता है, जो एक इंडी प्रोजेक्ट अपनी जेब से भरता है। उन सिग्नेचर के बिना Windows SmartScreen और macOS Gatekeeper पहले लॉन्च पर चेतावनी देंगे। चेतावनी का मतलब है *आपका OS प्रकाशक को नहीं पहचानता* — इसका मतलब यह नहीं कि Arroxy मैलवेयर है।",
  dl_warning_p2:
    "Arroxy को ख़ुद वेरीफ़ाई करने के तीन तरीक़े, बढ़ती कठोरता के क्रम में:\n\n- **सोर्स पढ़ें।** हर लाइन [GitHub](https://github.com/antonio-orionus/Arroxy) पर है और आप [सोर्स से बिल्ड कर सकते हैं](#tech)।\n- **SHA256 जाँचें।** अपनी फ़ाइल को प्रकाशित [`SHA256SUMS`](../../releases/latest) से मिलाएँ — नीचे [अपना डाउनलोड वेरीफ़ाई करें](#verify) देखें।\n- **थर्ड-पार्टी स्कैन चलाएँ।** फ़ाइल को [VirusTotal](https://www.virustotal.com) पर अपलोड करें।",

  dl_win_first_h3: "Windows पहला लॉन्च",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" डायलॉग जिसमें "More info" लिंक हाइलाइट है',
  shot_smartscreen_run_alt:
    'More info खुलने के बाद SmartScreen डायलॉग, जिसमें "Run anyway" बटन दिख रहा है',
  dl_win_defender_h4: "अगर Windows Defender फ़ाइल फ़्लैग करे या हटाए",
  dl_win_defender_p:
    "Defender की heuristics कभी-कभी बिना साइन के NSIS इंस्टॉलर और Electron portables को संदिग्ध मान लेती है। अगर Defender `Arroxy-win-x64-Setup.exe` या `Arroxy-win-x64-Portable.exe` को quarantine करे, तो **Windows Security → Virus & threat protection → Protection history** से रिस्टोर करें, फिर Arroxy एक्ज़ीक्यूटेबल को **Manage settings → Add or remove exclusions** के तहत अनुमत आइटम के रूप में जोड़ें। SmartScreen की तरह ही, ट्रिगर ग़ायब publisher signature है, न कि कोई मैलवेयर।",

  dl_macos_first_h3: "macOS पहला लॉन्च",
  dl_macos_intro:
    "Arroxy अभी macOS के लिए कोड-साइन्ड नहीं है, इसलिए Gatekeeper पहला लॉन्च ब्लॉक करेगा। इसे अनुमति देने का सटीक तरीक़ा आपके macOS वर्शन पर निर्भर करता है — Sequoia 15 ने पुराना राइट-क्लिक → Open बाईपास कड़ा कर दिया।",
  dl_macos_sequoia_h4: "macOS Sequoia 15 और बाद में (मौजूदा)",
  dl_macos_sequoia_intro:
    "Sequoia 15 और नए में, राइट-क्लिक → Open अब कई quarantined ऐप के लिए Gatekeeper बाईपास नहीं करता। बजाय इसके System Settings पैनल का इस्तेमाल करें:",
  dl_macos_sequoia_step1:
    "माउंट किए DMG से `Arroxy.app` को `/Applications` में खींचें।",
  dl_macos_sequoia_step2:
    "Arroxy को डबल-क्लिक करें। ब्लॉक डायलॉग आएगा — **Done** क्लिक करें (*Move to Trash* न क्लिक करें)।",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** खोलें और **Security** सेक्शन तक स्क्रॉल करें। दिखेगा *"Arroxy was blocked to protect your Mac"* (या इससे मिलता-जुलता संदेश)।',
  dl_macos_sequoia_step4:
    "**Open Anyway** क्लिक करें, अपने पासवर्ड या Touch ID से पुष्टि करें, फिर `/Applications` से Arroxy दोबारा लॉन्च करें।",
  dl_macos_sonoma_h4: "macOS Sonoma 14 और पहले",
  dl_macos_sonoma_step1:
    "माउंट किए DMG से `Arroxy.app` को `/Applications` में खींचें।",
  dl_macos_sonoma_step2:
    "`/Applications` में `Arroxy.app` पर राइट-क्लिक (या Control-क्लिक) करें और **Open** चुनें।",
  dl_macos_sonoma_step3:
    "चेतावनी डायलॉग में अब **Open** बटन है — उसे क्लिक करें और पुष्टि करें। Arroxy सामान्य रूप से खुलेगा और चेतावनी फिर कभी नहीं आएगी।",
  dl_macos_damaged_h4:
    '"App is damaged" या लगातार Gatekeeper ब्लॉक — Terminal फ़िक्स',
  dl_macos_damaged_p:
    'अगर macOS कहे *"Arroxy is damaged and can\'t be opened"*, या ऊपर के किसी भी क़दम से ब्लॉक न हटे, तो DMG पर quarantine attribute कारण है (कुछ ब्राउज़र और macOS का ख़ुद का translocation behavior इसे सेट करता है)। इंस्टॉल की गई ऐप से इसे हटाएँ:',
  dl_macos_arch_note:
    "**Apple Silicon बनाम Intel:** M-series Mac (M1 / M2 / M3 / M4) पर `arm64` DMG डाउनलोड करें। Intel Mac पर `x64` DMG। ग़लत बिल्ड Rosetta से भी काम करेगा लेकिन ध्यान देने योग्य रूप से धीमा होगा।",

  dl_linux_first_h3: "Linux पहला लॉन्च",
  dl_linux_appimagelauncher:
    "**वैकल्पिक डेस्कटॉप इंटिग्रेशन:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) एक बार इंस्टॉल करें, और जो भी AppImage डबल-क्लिक करें वह अपने-आप आपके launcher menu में दर्ज हो जाएगा — कोई मैन्युअल `.desktop` फ़ाइल नहीं बनानी।",

  dl_verify_h3: "अपना डाउनलोड वेरीफ़ाई करें (SHA256)",
  dl_verify_intro:
    "हर रिलीज़ बाइनरी के साथ `SHA256SUMS` फ़ाइल प्रकाशित करता है। यह जाँचने के लिए कि आपका डाउनलोड ट्रांज़िट में ख़राब या छेड़छाड़ नहीं हुआ, फ़ाइल को लोकल हैश करें और `SHA256SUMS` की लाइन से मिलाएँ। नवीनतम रिलीज़ पेज खोलें → **Assets** → `SHA256SUMS` डाउनलोड करें।",
  dl_verify_win_label: "Windows (PowerShell या Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "थर्ड-पार्टी मैलवेयर स्कैन चाहते हैं? [VirusTotal](https://www.virustotal.com) पर फ़ाइल अपलोड करें। छोटे इंजनों से कुछ generic-heuristic फ़्लैग बिना साइन Electron ऐप के लिए सामान्य हैं; बड़े इंजनों से व्यापक detection असली चिंता का कारण होगा।",

  dl_pm_intro:
    "पहले से कोई पैकेज मैनेजर इस्तेमाल करते हैं? मैन्युअल डाउनलोड पाथ छोड़ सकते हैं।",

  privacy_p1:
    "डाउनलोड सीधे [yt-dlp](https://github.com/yt-dlp/yt-dlp) के ज़रिए YouTube से आपके चुने हुए फ़ोल्डर में फ़ेच होते हैं — किसी थर्ड-पार्टी सर्वर से नहीं गुज़रते। देखने की हिस्ट्री, डाउनलोड हिस्ट्री, URLs और फ़ाइल कंटेंट आपके डिवाइस पर रहते हैं।",
  privacy_p2:
    "Arroxy [OpenPanel](https://openpanel.dev) के ज़रिए गुमनाम, एग्रीगेट टेलीमेट्री भेजता है — लॉन्च, OS, ऐप वर्शन और क्रैश समझने भर के लिए। कोई URL, वीडियो शीर्षक, फ़ाइल पाथ, अकाउंट जानकारी, फ़िंगरप्रिंटिंग या निजी डेटा नहीं। प्रति-इंस्टॉल ID रैंडम होती है और आपकी पहचान से जुड़ी नहीं होती। Settings में ऑप्ट आउट कर सकते हैं।",
  faq_q1: "क्या यह सच में मुफ़्त है?",
  faq_a1: "हाँ — MIT लाइसेंस, कोई प्रीमियम टियर नहीं, कोई फ़ीचर गेटिंग नहीं।",
  faq_q2: "मैं किन वीडियो क्वालिटी में डाउनलोड कर सकता हूँ?",
  faq_a2:
    "जो भी YouTube देता है: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, और ऑडियो-only। 60 fps, 120 fps और HDR स्ट्रीम जैसे हैं वैसे ही रहते हैं।",
  faq_q3: "क्या मैं सिर्फ़ ऑडियो MP3 में निकाल सकता हूँ?",
  faq_a3:
    "हाँ। format menu में *सिर्फ ऑडियो* चुनें और फिर MP3, M4A/AAC, Opus या WAV चुनें।",
  faq_q4: "क्या मुझे YouTube अकाउंट या कुकीज़ चाहिए?",
  faq_a4:
    "डिफ़ॉल्ट रूप से, नहीं — Arroxy YouTube अकाउंट, लॉगिन या कुकी एक्सपोर्ट के बिना काम करता है। ऐसी सामग्री के लिए जो प्रमाणीकरण की माँग करती है — जैसे आयु-प्रतिबंधित या केवल-सदस्यों वाले वीडियो — एडवांस्ड सेटिंग्स में वैकल्पिक कुकी सपोर्ट उपलब्ध है (Cookies source: file or browser)। यह डिफ़ॉल्ट रूप से बंद है। अगर आप इसे चालू करते हैं, तो yt-dlp की wiki बताती है कि [कुकी-आधारित ऑटोमेशन एक Google अकाउंट को फ़्लैग कर सकता है](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); उस स्थिति में एक throwaway अकाउंट सुरक्षित विकल्प है।",
  faq_q5: "जब YouTube कुछ बदले तो क्या यह काम करता रहेगा?",
  faq_a5:
    "yt-dlp लॉन्च पर अपने आप अपडेट हो जाता है, और जब YouTube कुछ बदलता है तो Arroxy तुरंत फ़िक्स जारी कर देता है। अगर आपको कभी कोई समस्या आए, तो एडवांस्ड सेटिंग्स में फ़ॉलबैक के रूप में वैकल्पिक कुकी सपोर्ट उपलब्ध है।",
  faq_q6: "Arroxy किन भाषाओं में उपलब्ध है?",
  faq_a6:
    "इक्कीस, बॉक्स से बाहर: English, Español (स्पेनिश), Deutsch (जर्मन), Français (फ़्रेंच), 日本語 (जापानी), 中文 (चीनी), Русский (रूसी), Українська (यूक्रेनी), हिन्दी, Afaan Oromoo (ओरोमो), Kiswahili (स्वाहिली), O'zbekcha (उज़्बेक), Tiếng Việt (वियतनामी), አማርኛ (अम्हारिक), العربية (अरबी), اردو (उर्दू), پښتو (पश्तो), বাংলা (बंगाली), မြန်မာဘာသာ (बर्मी), Ελληνικά (यूनानी) और Српски (सर्बियाई)। Arroxy पहले लॉन्च पर आपके ऑपरेटिंग सिस्टम की भाषा अपने आप पहचानता है, और आप टूलबार में भाषा चुनने वाले से कभी भी बदल सकते हैं। रनटाइम लोकेल JSON src/shared/i18n/locales/ में हैं, और अनुवादकों के लिए PO कैटलॉग i18n/locales/ में हैं — योगदान के लिए GitHub पर एक PR खोलें।",
  faq_q7: "क्या मुझे कुछ और इंस्टॉल करना होगा?",
  faq_a7:
    "नहीं। yt-dlp पहले लॉन्च पर अपने आप डाउनलोड होकर आपकी मशीन पर कैश हो जाता है; ffmpeg और ffprobe ऐप के साथ आते हैं। उसके बाद कोई अतिरिक्त सेटअप ज़रूरी नहीं।",
  faq_q8: "क्या मैं प्लेलिस्ट या पूरे चैनल डाउनलोड कर सकता हूँ?",
  faq_a8:
    "हाँ — दोनों। playlist या channel URL paste करें (जैसे `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); कितनी entries scan करनी हैं चुनें, फिर पूरी list queue करें या specific videos चुनें। date-range filters जल्द आ रहे हैं।",
  faq_q9: 'macOS कहता है "ऐप ख़राब है" — क्या करूँ?',
  faq_a9:
    'यह macOS Gatekeeper बिना साइन की ऐप को ब्लॉक कर रहा है, असली नुकसान नहीं। ["App is damaged" — Terminal fix](#macos-first-launch) देखें जहाँ एक लाइन का `xattr` कमांड इसे ठीक करता है।',
  faq_q10: "क्या YouTube वीडियो डाउनलोड करना क़ानूनी है?",
  faq_a10:
    "ज़्यादातर अधिकार-क्षेत्रों में पर्सनल, प्राइवेट इस्तेमाल के लिए यह आम तौर पर स्वीकार्य है। YouTube की [Terms of Service](https://www.youtube.com/t/terms) और अपने स्थानीय कॉपीराइट क़ानूनों का पालन करना आपकी ज़िम्मेदारी है।",
  plan_intro: "अभी भी योजना में — लगभग प्राथमिकता के क्रम में:",
  plan_col1: "फ़ीचर",
  plan_col2: "विवरण",
  plan_r1_name: "**प्लेलिस्ट और चैनल फ़िल्टर**",
  plan_r1_desc: "playlist या channel enumerate करते समय date-range filters",
  plan_r2_name: "**YouTube ऑडियो ट्रैक प्राथमिकताएँ**",
  plan_r2_desc:
    "जब YouTube कई ऑडियो ट्रैक देता है, तो पूरी app के लिए बोली जाने वाली भाषा का track preference सेट करें और हर profile में override करें",
  plan_r6_name: "**ऐप के अंदर browser sign-in**",
  plan_r6_desc:
    "Arroxy के अंदर browser windows खोलें ताकि आप sign in कर सकें और site cookies को manual export किए बिना इस्तेमाल कर सकें",
  plan_r8_name: "**एक-क्लिक वीडियो डाउनलोड**",
  plan_r8_desc:
    "active profile से detected या pasted URL का वीडियो डाउनलोड एक क्लिक में शुरू करें",
  plan_r3_name: "**मज़बूत रिट्राई रिकवरी**",
  plan_r3_desc:
    "अविश्वसनीय या समस्याग्रस्त इंटरनेट कनेक्शन से बाधित डाउनलोड के लिए नया रिट्राई पथ",
  plan_r4_name: "**पूरा डाउनलोड मैनेजर ड्रॉअर**",
  plan_r4_desc:
    "क्यू ड्रॉअर को अधिक पूर्ण मैनेजर में बदलना, queued आइटमों के destination folder बदलने सहित",
  plan_r5_name: "**शेड्यूल्ड डाउनलोड**",
  plan_r5_desc: "निर्धारित समय पर क़तार शुरू करें (रात भर के रन)",
  plan_r7_name: "**क्लिप ट्रिमिंग**",
  plan_r7_desc: "शुरू/अंत समय से सिर्फ़ एक सेगमेंट डाउनलोड करें",
  plan_cta:
    "कोई फ़ीचर मन में है? [रिक्वेस्ट खोलें](../../issues) — कम्यूनिटी की राय प्राथमिकता तय करती है।",
  tech_content: TECH_CONTENT,
  tos_h2: "उपयोग की शर्तें",
  tos_note:
    "Arroxy केवल पर्सनल, प्राइवेट इस्तेमाल के लिए एक टूल है। यह सुनिश्चित करना कि आपके डाउनलोड YouTube की [Terms of Service](https://www.youtube.com/t/terms) और आपके अधिकार-क्षेत्र के कॉपीराइट क़ानूनों का पालन करते हैं — यह पूरी तरह आपकी ज़िम्मेदारी है। ऐसी सामग्री डाउनलोड, पुनरुत्पादित या वितरित करने के लिए Arroxy का उपयोग न करें जिसका उपयोग करने का अधिकार आपके पास नहीं है। डेवलपर किसी भी दुरुपयोग के लिए उत्तरदायी नहीं हैं।",
  footer_credit:
    'MIT लाइसेंस · <a href="https://x.com/OrionusAI">@OrionusAI</a> द्वारा प्यार से बनाया गया',
};
