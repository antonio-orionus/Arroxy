<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy मस्कट" width="180" />

# Arroxy — Windows, macOS और Linux के लिए मुफ़्त ओपन-सोर्स YouTube (+ 2000 साइट) डाउनलोडर

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**भाषा:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · **हिन्दी** · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![रिलीज़](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![बिल्ड](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![वेबसाइट](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![लाइसेंस](https://img.shields.io/badge/license-MIT-green) ![प्लेटफ़ॉर्म](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![भाषाएँ](https://img.shields.io/badge/i18n-21_languages-blue)

**YouTube और 2000+ समर्थित साइटों** से वीडियो, Shorts, संगीत, चैनल, पॉडकास्ट या ऑडियो ट्रैक डाउनलोड करें — 60 fps पर 4K HDR तक, या MP3 / AAC / Opus के रूप में। Windows, macOS और Linux पर लोकल रन होता है। **कोई विज्ञापन नहीं, कोई ब्लोट नहीं, कोई अपसेल नहीं।**

[**↓ नवीनतम रिलीज़ डाउनलोड करें**](../../releases/latest) &nbsp;·&nbsp; [**वेबसाइट**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy डेमो" width="720" />

अगर Arroxy आपका समय बचाता है, तो ⭐ दूसरों को इसे खोजने में मदद करती है।

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

> 🌐 यह AI-सहायता प्राप्त अनुवाद है। [अंग्रेज़ी README](README.md) सत्य का स्रोत है। कोई गलती दिखी? [PR का स्वागत है](../../pulls)।

---

## विषय-सूची

- [Arroxy क्यों?](#why)
- [फ़ीचर](#features)
- [डाउनलोड](#download)
- [प्राइवेसी](#privacy)
- [अक्सर पूछे जाने वाले प्रश्न](#faq)
- [रोडमैप](#roadmap)
- [बनाया गया](#tech)

---

## <a id="why"></a>Arroxy क्यों?

सबसे आम विकल्पों के साथ एक साथ-साथ तुलना:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| मुफ़्त, कोई प्रीमियम टियर नहीं |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| ओपन सोर्स |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| केवल लोकल प्रोसेसिंग |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| कोई लॉगिन या कुकी एक्सपोर्ट नहीं |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| कोई उपयोग सीमा नहीं |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| क्रॉस-प्लेटफ़ॉर्म डेस्कटॉप ऐप |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| सबटाइटल + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy एक काम के लिए बना है: URL पेस्ट करें, एक साफ़ लोकल फ़ाइल पाएँ। कोई अकाउंट नहीं, कोई अपसेल नहीं, कोई डेटा कलेक्शन नहीं।

---

## <a id="features"></a>फ़ीचर

### क्वालिटी और फ़ॉर्मैट

- **4K UHD (2160p)** तक, 1440p, 1080p, 720p, 480p, 360p
- **हाई फ़्रेम रेट** जैसा है वैसा — 60 fps, 120 fps, HDR
- **सिर्फ ऑडियो** को MP3, M4A/AAC, Opus या WAV में एक्सपोर्ट करें
- त्वरित प्रीसेट: *बेस्ट क्वालिटी* · *बैलेंस्ड* · *स्मॉल फ़ाइल*

### प्राइवेसी और नियंत्रण

- 100% लोकल प्रोसेसिंग — डाउनलोड सीधे YouTube से आपकी डिस्क पर
- कोई लॉगिन नहीं, कोई कुकीज़ नहीं, कोई Google अकाउंट लिंक नहीं
- फ़ाइलें सीधे आपके चुने हुए फ़ोल्डर में सेव

### वर्कफ़्लो

- **लचीले स्टार्ट मोड** — गाइडेड single download, playlist/channel picker, bulk URL paste, या saved defaults के साथ Quick Download चुनें
- **केंद्रीय download queue** — हर single, playlist, bulk, या quick job progress, pause, resume, cancel, retry, और priority control के लिए एक जगह आता है
- **क्लिपबोर्ड वॉच** — YouTube लिंक कॉपी करें और ऐप पर वापस आते ही Arroxy URL अपने आप भर देता है (एडवांस्ड सेटिंग्स में टॉगल करें)
- **ऑटो-क्लीन URLs** — ट्रैकिंग पैरामीटर (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) हटाता है और `youtube.com/redirect` लिंक खोलता है
- **ट्रे मोड** — विंडो बंद करने पर डाउनलोड बैकग्राउंड में चलते रहते हैं
- **21 भाषाएँ** — सिस्टम लोकेल अपने आप पहचानता है, कभी भी बदला जा सकता है
- **प्लेलिस्ट सिंक** — पहले से डाउनलोड किए गए वीडियो छोड़ने के लिए प्लेलिस्ट को स्थानीय फ़ोल्डर के विरुद्ध फिर से स्कैन करता है; हर वीडियो डाउनलोड होते ही अपडेट होने वाली `.m3u` प्लेलिस्ट फ़ाइल बनाता है
- **Speed और pacing controls** — download bandwidth cap करें, request delays जोड़ें, और presets (*Off · Balanced · Careful · Custom*) से fragment threads tune करें

### सबटाइटल और पोस्ट-प्रोसेसिंग

- **सबटाइटल** SRT, VTT या ASS में — मैनुअल या ऑटो-जेनरेटेड, किसी भी उपलब्ध भाषा में
- वीडियो के बग़ल में सेव करें, `.mkv` में एम्बेड करें, या `Subtitles/` सबफ़ोल्डर में व्यवस्थित करें
- **SponsorBlock** — स्पॉन्सर, इंट्रो, आउट्रो, सेल्फ-प्रोमो को स्किप या चैप्टर-मार्क करें
- **एम्बेडेड मेटाडेटा** — टाइटल, अपलोड तिथि, चैनल, विवरण, थंबनेल और चैप्टर मार्कर फ़ाइल में लिखे जाते हैं

### YouTube + 2000 साइट

- **YouTube, पूरा** — Videos, Shorts, Channels, Playlists, YouTube Music और Podcasts को फ़र्स्ट-क्लास स्रोत के रूप में हैंडल किया जाता है
- **2000+ अन्य साइट** yt-dlp के ज़रिए — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org और भी बहुत कुछ
- **सिर्फ ऑडियो और सबटाइटल** हर समर्थित साइट पर काम करते हैं, न सिर्फ YouTube पर
- अगर कोई साइट बदलती है, तो yt-dlp हर हफ़्ते फ़िक्स जारी करता है और Arroxy लॉन्च पर बाइनरी ऑटो-अपडेट करता है

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="URL पेस्ट करें" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="क्वालिटी चुनें" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="सेव लोकेशन चुनें" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="डाउनलोड क़तार चलती हुई" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="सबटाइटल भाषा और फ़ॉर्मैट चुनें" />
</div>

---

## <a id="download"></a>डाउनलोड

| प्लेटफ़ॉर्म | फ़ॉर्मैट   |
| ------------------- | ------------------- |
| Windows             | इंस्टॉलर (NSIS) या पोर्टेबल `.exe`   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` या `.flatpak` (sandboxed) |

[**नवीनतम रिलीज़ लें →**](../../releases/latest)

### <a id="why-warning"></a>चेतावनी क्यों दिख सकती है

Arroxy ओपन-सोर्स और MIT-लाइसेंस्ड है। Windows और macOS बिल्ड **कोड-साइन्ड नहीं हैं** — Apple Developer ID और Windows EV कोड-साइनिंग सर्टिफ़िकेट में हर साल सैकड़ों डॉलर का खर्च होता है, जो एक इंडी प्रोजेक्ट अपनी जेब से भरता है। उन सिग्नेचर के बिना Windows SmartScreen और macOS Gatekeeper पहले लॉन्च पर चेतावनी देंगे। चेतावनी का मतलब है *आपका OS प्रकाशक को नहीं पहचानता* — इसका मतलब यह नहीं कि Arroxy मैलवेयर है।

Arroxy को ख़ुद वेरीफ़ाई करने के तीन तरीक़े, बढ़ती कठोरता के क्रम में:

- **सोर्स पढ़ें।** हर लाइन [GitHub](https://github.com/antonio-orionus/Arroxy) पर है और आप [सोर्स से बिल्ड कर सकते हैं](#tech)।
- **SHA256 जाँचें।** अपनी फ़ाइल को प्रकाशित [`SHA256SUMS`](../../releases/latest) से मिलाएँ — नीचे [अपना डाउनलोड वेरीफ़ाई करें](#verify) देखें।
- **थर्ड-पार्टी स्कैन चलाएँ।** फ़ाइल को [VirusTotal](https://www.virustotal.com) पर अपलोड करें।

### <a id="windows-first-launch"></a>Windows पहला लॉन्च

पहले लॉन्च पर आप **"Windows protected your PC"** या **"Unknown publisher."** देख सकते हैं। यह `Arroxy-Setup-*.exe` और `Arroxy-Portable-*.exe` दोनों पर लागू होता है। Arroxy मुफ़्त और ओपन-सोर्स है और Windows बिल्ड पेड सर्टिफ़िकेट से कोड-साइन नहीं हैं, इसीलिए SmartScreen फ़्लैग करता है। इसका **अपने आप** यह मतलब नहीं कि Arroxy असुरक्षित है। जारी रखने के लिए:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" डायलॉग जिसमें "More info" लिंक हाइलाइट है" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="More info खुलने के बाद SmartScreen डायलॉग, जिसमें "Run anyway" बटन दिख रहा है" />
</div>

1. **More info** क्लिक करें।
2. **Run anyway** क्लिक करें।

#### अगर Windows Defender फ़ाइल फ़्लैग करे या हटाए

Defender की heuristics कभी-कभी बिना साइन के NSIS इंस्टॉलर और Electron portables को संदिग्ध मान लेती है। अगर Defender `Arroxy-Setup-*.exe` या `Arroxy-Portable-*.exe` को quarantine करे, तो **Windows Security → Virus & threat protection → Protection history** से रिस्टोर करें, फिर Arroxy एक्ज़ीक्यूटेबल को **Manage settings → Add or remove exclusions** के तहत अनुमत आइटम के रूप में जोड़ें। SmartScreen की तरह ही, ट्रिगर ग़ायब publisher signature है, न कि कोई मैलवेयर।

> Arroxy केवल आधिकारिक GitHub Releases पेज से डाउनलोड करें। अगर फ़ाइल किसी दूसरी वेबसाइट से मिली हो या किसी ने भेजी हो, तो उसे डिलीट करें और आधिकारिक स्रोत से नई कॉपी डाउनलोड करें। सोर्स कोड सार्वजनिक है, इसलिए आप चाहें तो ख़ुद जाँच सकते हैं या Arroxy ख़ुद बना सकते हैं।

### <a id="macos-first-launch"></a>macOS पहला लॉन्च

Arroxy अभी macOS के लिए कोड-साइन्ड नहीं है, इसलिए Gatekeeper पहला लॉन्च ब्लॉक करेगा। इसे अनुमति देने का सटीक तरीक़ा आपके macOS वर्शन पर निर्भर करता है — Sequoia 15 ने पुराना राइट-क्लिक → Open बाईपास कड़ा कर दिया।

#### macOS Sequoia 15 और बाद में (मौजूदा)

Sequoia 15 और नए में, राइट-क्लिक → Open अब कई quarantined ऐप के लिए Gatekeeper बाईपास नहीं करता। बजाय इसके System Settings पैनल का इस्तेमाल करें:

1. माउंट किए DMG से `Arroxy.app` को `/Applications` में खींचें।
2. Arroxy को डबल-क्लिक करें। ब्लॉक डायलॉग आएगा — **Done** क्लिक करें (*Move to Trash* न क्लिक करें)।
3. **System Settings → Privacy & Security** खोलें और **Security** सेक्शन तक स्क्रॉल करें। दिखेगा *"Arroxy was blocked to protect your Mac"* (या इससे मिलता-जुलता संदेश)।
4. **Open Anyway** क्लिक करें, अपने पासवर्ड या Touch ID से पुष्टि करें, फिर `/Applications` से Arroxy दोबारा लॉन्च करें।

#### macOS Sonoma 14 और पहले

1. माउंट किए DMG से `Arroxy.app` को `/Applications` में खींचें।
2. `/Applications` में `Arroxy.app` पर राइट-क्लिक (या Control-क्लिक) करें और **Open** चुनें।
3. चेतावनी डायलॉग में अब **Open** बटन है — उसे क्लिक करें और पुष्टि करें। Arroxy सामान्य रूप से खुलेगा और चेतावनी फिर कभी नहीं आएगी।

#### "App is damaged" या लगातार Gatekeeper ब्लॉक — Terminal फ़िक्स

अगर macOS कहे *"Arroxy is damaged and can't be opened"*, या ऊपर के किसी भी क़दम से ब्लॉक न हटे, तो DMG पर quarantine attribute कारण है (कुछ ब्राउज़र और macOS का ख़ुद का translocation behavior इसे सेट करता है)। इंस्टॉल की गई ऐप से इसे हटाएँ:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon बनाम Intel:** M-series Mac (M1 / M2 / M3 / M4) पर `arm64` DMG डाउनलोड करें। Intel Mac पर `x64` DMG। ग़लत बिल्ड Rosetta से भी काम करेगा लेकिन ध्यान देने योग्य रूप से धीमा होगा।

> macOS बिल्ड CI पर Apple Silicon और Intel रनर्स पर बनाए जाते हैं। अगर कोई समस्या आए, तो [issue खोलें](../../issues) — macOS यूज़र्स का फ़ीडबैक macOS टेस्टिंग साइकिल को सक्रिय रूप से आकार देता है।

### <a id="linux-first-launch"></a>Linux पहला लॉन्च

AppImage सीधे चलते हैं — कोई इंस्टॉलेशन नहीं। बस फ़ाइल को एक्ज़ीक्यूटेबल मार्क करना होता है।

**फ़ाइल मैनेजर:** `.AppImage` पर राइट-क्लिक → **Properties** → **Permissions** → **Allow executing file as program** ऑन करें, फिर डबल-क्लिक से चलाएँ।

**टर्मिनल:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

अगर फिर भी नहीं चलता, शायद FUSE नहीं है:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**वैकल्पिक डेस्कटॉप इंटिग्रेशन:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) एक बार इंस्टॉल करें, और जो भी AppImage डबल-क्लिक करें वह अपने-आप आपके launcher menu में दर्ज हो जाएगा — कोई मैन्युअल `.desktop` फ़ाइल नहीं बनानी।

**Flatpak (सैंडबॉक्स विकल्प):** उसी रिलीज़ पेज से `Arroxy-*.flatpak` डाउनलोड करें।

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>अपना डाउनलोड वेरीफ़ाई करें (SHA256)</strong></summary>

हर रिलीज़ बाइनरी के साथ `SHA256SUMS` फ़ाइल प्रकाशित करता है। यह जाँचने के लिए कि आपका डाउनलोड ट्रांज़िट में ख़राब या छेड़छाड़ नहीं हुआ, फ़ाइल को लोकल हैश करें और `SHA256SUMS` की लाइन से मिलाएँ। नवीनतम रिलीज़ पेज खोलें → **Assets** → `SHA256SUMS` डाउनलोड करें।

**Windows (PowerShell या Command Prompt):**

```powershell
certutil -hashfile Arroxy-Setup-<version>.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-<version>-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-*.AppImage
```

थर्ड-पार्टी मैलवेयर स्कैन चाहते हैं? [VirusTotal](https://www.virustotal.com) पर फ़ाइल अपलोड करें। छोटे इंजनों से कुछ generic-heuristic फ़्लैग बिना साइन Electron ऐप के लिए सामान्य हैं; बड़े इंजनों से व्यापक detection असली चिंता का कारण होगा।

</details>

<details>
<summary><strong>पैकेज मैनेजर से इंस्टॉल करें</strong></summary>

पहले से कोई पैकेज मैनेजर इस्तेमाल करते हैं? मैन्युअल डाउनलोड पाथ छोड़ सकते हैं।

| चैनल | कमांड                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-*.flatpak`                                                         |

</details>

<details>
<summary><strong>Windows: इंस्टॉलर बनाम पोर्टेबल</strong></summary>

|               | NSIS इंस्टॉलर | पोर्टेबल `.exe` |
| ------------- | :----------------------: | :---------------------: |
| इंस्टॉलेशन ज़रूरी | हाँ  | नहीं — कहीं से भी चलाएँ  |
| ऑटो-अपडेट | ✅ ऐप में  | ❌ मैन्युअल डाउनलोड  |
| स्टार्टअप स्पीड | ✅ तेज़  | ⚠️ कोल्ड स्टार्ट धीमा  |
| स्टार्ट मेन्यू में जुड़ता है |            ✅            |           ❌            |
| आसान अनइंस्टॉल |            ✅            | ❌ बस फ़ाइल डिलीट कर दें  |

**सिफ़ारिश:** ऑटो-अपडेट और तेज़ स्टार्टअप के लिए NSIS इंस्टॉलर इस्तेमाल करें। बिना इंस्टॉल और बिना रजिस्ट्री विकल्प के लिए पोर्टेबल `.exe` लें।

</details>

---

## <a id="privacy"></a>प्राइवेसी

डाउनलोड सीधे [yt-dlp](https://github.com/yt-dlp/yt-dlp) के ज़रिए YouTube से आपके चुने हुए फ़ोल्डर में फ़ेच होते हैं — किसी थर्ड-पार्टी सर्वर से नहीं गुज़रते। देखने की हिस्ट्री, डाउनलोड हिस्ट्री, URLs और फ़ाइल कंटेंट आपके डिवाइस पर रहते हैं।

Arroxy [OpenPanel](https://openpanel.dev) के ज़रिए गुमनाम, एग्रीगेट टेलीमेट्री भेजता है — लॉन्च, OS, ऐप वर्शन और क्रैश समझने भर के लिए। कोई URL, वीडियो शीर्षक, फ़ाइल पाथ, अकाउंट जानकारी, फ़िंगरप्रिंटिंग या निजी डेटा नहीं। प्रति-इंस्टॉल ID रैंडम होती है और आपकी पहचान से जुड़ी नहीं होती। Settings में ऑप्ट आउट कर सकते हैं।

---

## <a id="faq"></a>अक्सर पूछे जाने वाले प्रश्न

**क्या यह सच में मुफ़्त है?**
हाँ — MIT लाइसेंस, कोई प्रीमियम टियर नहीं, कोई फ़ीचर गेटिंग नहीं।

**मैं किन वीडियो क्वालिटी में डाउनलोड कर सकता हूँ?**
जो भी YouTube देता है: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, और ऑडियो-only। 60 fps, 120 fps और HDR स्ट्रीम जैसे हैं वैसे ही रहते हैं।

**क्या मैं सिर्फ़ ऑडियो MP3 में निकाल सकता हूँ?**
हाँ। format menu में *सिर्फ ऑडियो* चुनें और फिर MP3, M4A/AAC, Opus या WAV चुनें।

**क्या मुझे YouTube अकाउंट या कुकीज़ चाहिए?**
डिफ़ॉल्ट रूप से, नहीं — Arroxy YouTube अकाउंट, लॉगिन या कुकी एक्सपोर्ट के बिना काम करता है। ऐसी सामग्री के लिए जो प्रमाणीकरण की माँग करती है — जैसे आयु-प्रतिबंधित या केवल-सदस्यों वाले वीडियो — एडवांस्ड सेटिंग्स में वैकल्पिक कुकी सपोर्ट उपलब्ध है (Cookies source: file or browser)। यह डिफ़ॉल्ट रूप से बंद है। अगर आप इसे चालू करते हैं, तो yt-dlp की wiki बताती है कि [कुकी-आधारित ऑटोमेशन एक Google अकाउंट को फ़्लैग कर सकता है](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); उस स्थिति में एक throwaway अकाउंट सुरक्षित विकल्प है।

**जब YouTube कुछ बदले तो क्या यह काम करता रहेगा?**
yt-dlp लॉन्च पर अपने आप अपडेट हो जाता है, और जब YouTube कुछ बदलता है तो Arroxy तुरंत फ़िक्स जारी कर देता है। अगर आपको कभी कोई समस्या आए, तो एडवांस्ड सेटिंग्स में फ़ॉलबैक के रूप में वैकल्पिक कुकी सपोर्ट उपलब्ध है।

**Arroxy किन भाषाओं में उपलब्ध है?**
इक्कीस, बॉक्स से बाहर: English, Español (स्पेनिश), Deutsch (जर्मन), Français (फ़्रेंच), 日本語 (जापानी), 中文 (चीनी), Русский (रूसी), Українська (यूक्रेनी), हिन्दी, Afaan Oromoo (ओरोमो), Kiswahili (स्वाहिली), O'zbekcha (उज़्बेक), Tiếng Việt (वियतनामी), አማርኛ (अम्हारिक), العربية (अरबी), اردو (उर्दू), پښتو (पश्तो), বাংলা (बंगाली), မြန်မာဘာသာ (बर्मी), Ελληνικά (यूनानी) और Српски (सर्बियाई)। Arroxy पहले लॉन्च पर आपके ऑपरेटिंग सिस्टम की भाषा अपने आप पहचानता है, और आप टूलबार में भाषा चुनने वाले से कभी भी बदल सकते हैं। लोकेल फ़ाइलें src/shared/i18n/locales/ में सादे TypeScript ऑब्जेक्ट्स हैं — योगदान के लिए GitHub पर एक PR खोलें।

**क्या मुझे कुछ और इंस्टॉल करना होगा?**
नहीं। yt-dlp पहले लॉन्च पर अपने आप डाउनलोड होकर आपकी मशीन पर कैश हो जाता है; ffmpeg और ffprobe ऐप के साथ आते हैं। उसके बाद कोई अतिरिक्त सेटअप ज़रूरी नहीं।

**क्या मैं प्लेलिस्ट या पूरे चैनल डाउनलोड कर सकता हूँ?**
हाँ — दोनों। playlist या channel URL paste करें (जैसे `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); कितनी entries scan करनी हैं चुनें, फिर पूरी list queue करें या specific videos चुनें। date-range filters जल्द आ रहे हैं।

**macOS कहता है "ऐप ख़राब है" — क्या करूँ?**
यह macOS Gatekeeper बिना साइन की ऐप को ब्लॉक कर रहा है, असली नुकसान नहीं। ["App is damaged" — Terminal fix](#macos-first-launch) देखें जहाँ एक लाइन का `xattr` कमांड इसे ठीक करता है।

**क्या YouTube वीडियो डाउनलोड करना क़ानूनी है?**
ज़्यादातर अधिकार-क्षेत्रों में पर्सनल, प्राइवेट इस्तेमाल के लिए यह आम तौर पर स्वीकार्य है। YouTube की [Terms of Service](https://www.youtube.com/t/terms) और अपने स्थानीय कॉपीराइट क़ानूनों का पालन करना आपकी ज़िम्मेदारी है।

---

## <a id="roadmap"></a>रोडमैप

अभी भी योजना में — लगभग प्राथमिकता के क्रम में:

| फ़ीचर    | विवरण    |
| ---------------- | ---------------- |
| **प्लेलिस्ट और चैनल फ़िल्टर** | playlist या channel enumerate करते समय date-range filters |
| **कस्टम फ़ाइल नाम टेम्पलेट** | टाइटल, अपलोडर, तारीख़, रेज़ोल्यूशन से फ़ाइलें नाम दें — लाइव प्रीव्यू के साथ |
| **शेड्यूल्ड डाउनलोड** | निर्धारित समय पर क़तार शुरू करें (रात भर के रन) |
| **क्लिप ट्रिमिंग** | शुरू/अंत समय से सिर्फ़ एक सेगमेंट डाउनलोड करें |

कोई फ़ीचर मन में है? [रिक्वेस्ट खोलें](../../issues) — कम्यूनिटी की राय प्राथमिकता तय करती है।

---

## <a id="tech"></a>बनाया गया

<details>
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

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

कोई नेटिव बिल्ड टूल ज़रूरी नहीं — प्रोजेक्ट में कोई नेटिव Node addon नहीं है।

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Electron रनटाइम डिपेंडेंसी
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E टेस्ट के लिए ही (Electron को डिस्प्ले चाहिए)
sudo apt install -y xvfb
```

### क्लोन करें और चलाएँ

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # हॉट-रीलोड देव बिल्ड
```

### डिस्ट्रीब्यूटेबल बिल्ड करें

```bash
bun run build        # टाइपचेक + कम्पाइल
bun run dist         # वर्तमान OS के लिए पैकेज
bun run dist:win     # Windows पोर्टेबल exe क्रॉस-कम्पाइल
```

> yt-dlp पहले लॉन्च पर GitHub से फ़ेच होकर आपके ऐप डेटा फ़ोल्डर में कैश होता है। ffmpeg और ffprobe हर Arroxy रिलीज़ के साथ बंडल होते हैं।

</details>

---

## <a id="troubleshooting"></a>Troubleshooting

### App won't open / no window appears

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\Arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/Arroxy/main.log` |
| Linux    | `~/.config/Arroxy/logs/main.log` |

**2. Launch with hardware acceleration disabled.** Open a terminal / Command Prompt and run the executable with a flag:

```bash
# Windows (Portable) — PowerShell, run from the folder containing the exe
.\Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-*.AppImage --disable-gpu
```

If that works, the GPU/driver is the cause. Make the change permanent (next step).

**3. Persist the flag via `argv.json`.** Create the file at:

| Platform | Path                                             |
| -------- | ------------------------------------------------ |
| Windows  | `%APPDATA%\Arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/Arroxy/argv.json` |
| Linux    | `~/.config/Arroxy/argv.json`                     |

With contents:

```json
{ "disable-hardware-acceleration": true }
```

Arroxy reads this before opening any window, so it works even when the window never appeared.

**4. Other flags worth trying** (combine if needed): `--disable-software-rasterizer`, `--disable-gpu-sandbox`, `--in-process-gpu`.

**5. Stale window position.** If the window may be opening off-screen (multi-monitor change since last run), delete `<userData>\window-state.json` and relaunch.

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## उपयोग की शर्तें

Arroxy केवल पर्सनल, प्राइवेट इस्तेमाल के लिए एक टूल है। यह सुनिश्चित करना कि आपके डाउनलोड YouTube की [Terms of Service](https://www.youtube.com/t/terms) और आपके अधिकार-क्षेत्र के कॉपीराइट क़ानूनों का पालन करते हैं — यह पूरी तरह आपकी ज़िम्मेदारी है। ऐसी सामग्री डाउनलोड, पुनरुत्पादित या वितरित करने के लिए Arroxy का उपयोग न करें जिसका उपयोग करने का अधिकार आपके पास नहीं है। डेवलपर किसी भी दुरुपयोग के लिए उत्तरदायी नहीं हैं।

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT लाइसेंस · <a href="https://x.com/OrionusAI">@OrionusAI</a> द्वारा प्यार से बनाया गया</sub>
</div>
