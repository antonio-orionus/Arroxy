<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="តួអង្គ Arroxy" width="180" />

# Arroxy — កម្មវិធីទាញយក YouTube (+ គេហទំព័រ 2000) ឥតគិតថ្លៃ និងកូដចំហ មានកម្មវិធីរុករកភ្ជាប់មកជាមួយ សម្រាប់ Windows, macOS និង Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**អានជា៖** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · **ខ្មែរ** · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![ការចេញផ្សាយ](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![គេហទំព័រ](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![អាជ្ញាប័ណ្ណ](https://img.shields.io/badge/license-MIT-green) ![វេទិកា](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![ភាសា](https://img.shields.io/badge/i18n-31_languages-blue)

ទាញយកវីដេអូ Shorts តន្ត្រី ប៉ុស្តិ៍ ផតខាស ឬបទសំឡេងពី **YouTube និងគេហទំព័រជាង 2000 ដែលគាំទ្រ** — រហូតដល់ 8K HDR នៅ 60 fps ជា MP3 / AAC / Opus ឬតែផ្នែកដែលអ្នកត្រូវការ។ **រុករក YouTube ឬគេហទំព័រផ្សេងទៀតនៅក្នុង Arroxy** តាមផ្ទាំង Explore ហើយទាញយកវីដេអូ បញ្ជីចាក់ ឬប៉ុស្តិ៍ដែលអ្នកកំពុងមើល; ចូលគណនីនៅទីនោះ ដើម្បីទាញយកវីដេអូឯកជន សម្រាប់តែសមាជិក និងកំណត់អាយុ ដែលគណនីរបស់អ្នកអាចមើលបាន។ ដំណើរការក្នុងម៉ាស៊ីនលើ Windows, macOS និង Linux។ **គ្មានពាណិជ្ជកម្ម គ្មានកម្មវិធីរំខាន គ្មានការលក់បន្ថែម។**

[**↓ ដំឡើងកំណែចុងក្រោយ**](#install) &nbsp;·&nbsp; [**គេហទំព័រ**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [ការបើកលើកដំបូងលើ Windows](#windows-first-launch) · [ការបើកលើកដំបូងលើ macOS](#macos-first-launch) · [ការបើកលើកដំបូងលើ Linux](#linux-first-launch)

[![ចូលរួមសហគមន៍ Discord](https://img.shields.io/badge/%E1%9E%85%E1%9E%BC%E1%9E%9B%E1%9E%9A%E1%9E%BD%E1%9E%98%E1%9E%9F%E1%9E%A0%E1%9E%82%E1%9E%98%E1%9E%93%E1%9F%8D%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

ប្រសិនបើ Arroxy ជួយសន្សំពេលវេលារបស់អ្នក ⭐ មួយជួយឱ្យអ្នកដទៃរកឃើញវា។

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## មាតិកា

- [✨ មុខងារ](#features)
- [📥 ដំឡើង និងបើកលើកដំបូង](#install)
  - [ការបើកលើកដំបូងលើ Windows](#windows-first-launch)
  - [ការបើកលើកដំបូងលើ macOS](#macos-first-launch)
  - [ហេតុអ្វីអ្នកអាចឃើញការព្រមាន](#why-warning)
  - [ការបើកលើកដំបូងលើ Linux](#linux-first-launch)
  - [ផ្ទៀងផ្ទាត់ការទាញយករបស់អ្នក (SHA256)](#verify)
- [⚖️ ហេតុអ្វី Arroxy](#why)
- [🔒 ឯកជនភាព](#privacy)
- [❓ សំណួរញឹកញាប់](#faq)
- [🗺️ ផែនការ](#roadmap)
- [💖 គាំទ្រ Arroxy](#support)
- [🛠️ បង្កើតឡើងដោយ](#tech)

---

## <a id="features"></a>✨ មុខងារ

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>រុករក YouTube ឬគេហទំព័រផ្សេងទៀតនៅក្នុង Arroxy ហើយទាញយកទំព័រដែលអ្នកកំពុងនៅជាមួយប្រវត្តិរូបសកម្មរបស់អ្នក</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>អេក្រង់ដំបូងរបស់ Explore</b><br/>ការមើលរហ័សលើ Explore និងហេតុអ្វីគណនីបន្ទាប់បន្សំជាការចូលគណនីដែលមានសុវត្ថិភាពជាង</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ការទាញយកប្រាប់អ្នកពីអ្វីដែលត្រូវការអ្នក</b><br/>តំណរៀបចំនៅផ្ទៃខាងក្រោយ; តំណដែលបរាជ័យផ្តល់ដំណោះស្រាយ បញ្ជីចាក់វែងរង់ចាំជម្រើសរបស់អ្នក</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ទាញយកតែផ្នែកមួយនៃវីដេអូ</b><br/>ជ្រើសរើសចំណុចចាប់ផ្តើមនិងចុងបញ្ចប់ ឬជំពូកមួយ — Arroxy រក្សាទុកតែផ្នែកនោះប៉ុណ្ណោះ</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>កម្មវិធីកែប្រូហ្វាល់</b><br/>កែសម្រួលប្រូហ្វាល់៖ ប្រភេទឯកសារ គុណភាព ចំណងជើងរង ទីតាំងរក្សាទុក ទម្រង់ឈ្មោះឯកសារ និងផ្សេងទៀត</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>ងងឹត ឬភ្លឺ កញ្ចក់ ឬរាបស្មើ</b><br/>រូបរាងបួនឲ្យជ្រើសរើស៖ ផ្ទាំងកញ្ចក់លើមេឃដែលកំពុងរំកិល ឬផ្ទៃរាបស្មើស្ងប់ស្ងាត់ ម្យ៉ាងៗមានទាំងងងឹត និងភ្លឺ</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="គ្រាប់ចុចផ្លូវកាត់ទាញយកសកលរបស់ Arroxy — Ctrl+Shift+D លើ Windows និង Linux, Cmd+Shift+D លើ macOS ផ្ញើតំណដែលបានចម្លងដោយផ្ទាល់ទៅជួរទាញយក" width="760" /></picture><br/><sub><b>គ្រាប់ចុចផ្លូវកាត់ទាញយកសកល</b><br/>ចម្លងតំណពីកន្លែងណាក៏ដោយ ចុចម្តង — វាចូលជួរ ហើយចាប់ផ្តើមទាញយក</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>ប្រវត្តិរូបបញ្ជីចាក់តាមធាតុនីមួយៗ</b><br/>ផ្តល់ប្រវត្តិរូបផ្ទាល់ខ្លួនដល់វីដេអូនីមួយៗ — រក្សាទុកខ្លះជា 4K យកនៅសល់ជា MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>ទំព័រដើម ទាញយករហ័ស</b><br/>បិទភ្ជាប់ URL ហើយទាញយកវាភ្លាមៗជាមួយប្រវត្តិរូបសកម្មរបស់អ្នក</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>ប្រវត្តិរូបទាញយកដែលអាចប្រើឡើងវិញ</b><br/>រក្សាទុកការកំណត់ទម្រង់ គុណភាព និងលទ្ធផល — ប្រើឡើងវិញតាមការទាញយក</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>បទសំឡេងច្រើនភាសា</b><br/>ជ្រើសរើសភាសាសំឡេងជាក់លាក់ដែលវីដេអូមាន</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>សំឡេង Surround / Dolby</b><br/>បទ 5.1 និង Dolby ត្រូវបានរកឃើញ និងរក្សាទុក</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>របៀប URL ច្រើន</b><br/>បិទភ្ជាប់បញ្ជី លុបការស្ទួនដោយស្វ័យប្រវត្តិ ដាក់ទាំងអស់ក្នុងជួរក្នុងពេលតែមួយ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>ជួរទាញយកស្របគ្នា</b><br/>ការទាញយកច្រើនក្នុងពេលតែមួយជាមួយវឌ្ឍនភាពផ្ទាល់</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore៖ រុករកគេហទំព័រនៅក្នុង Arroxy</strong></summary>

- **ផ្ទាំង Explore** — រុករក YouTube ឬគេហទំព័រផ្សេងទៀតនៅក្នុង Arroxy ហើយទាញយកអ្វីដែលអ្នករកឃើញដោយមិនចាំបាច់ចម្លងតំណ។ **ទាញយក · *ប្រវត្តិរូបរបស់អ្នក*** ដាក់វីដេអូ បញ្ជីចាក់ ឬប៉ុស្តិ៍ដែលអ្នកកំពុងមើលក្នុងជួរ; ព្រួញនៅជាប់វាប្តូរប្រវត្តិរូប ហើយដំបងវេទមន្តបើកការទាញយកជាជំហានៗសម្រាប់ជ្រើសរើសទម្រង់ អក្សររត់ និងច្រើនទៀត
- **ចុចកណ្ដុរស្ដាំដើម្បីទាញយក** — ចុចកណ្ដុរស្ដាំលើតំណវីដេអូ បញ្ជីចាក់ ឬប៉ុស្តិ៍ណាមួយក្នុង Explore ដើម្បីទាញយកវាដោយប្រវត្តិរូបរបស់អ្នក ជ្រើសប្រវត្តិរូបផ្សេងពី **ទាញយកដោយប្រើ** បើកការទាញយកជាជំហានៗ ឬចម្លងតំណ។ មិនចាំបាច់បើកវីដេអូនីមួយៗជាមុនទេ
- **ប្លង់បង្រួម** — ចុចម្តងនៅលើរបារឧបករណ៍របស់ Explore ដើម្បីផ្លាស់ទីផ្ទាំងរបស់ Arroxy ចូលទៅក្នុងវា ហើយផ្តល់ទំហំបន្ថែមដល់ទំព័រ
- **របារអាសយដ្ឋាន** — វាយដើម្បីស្វែងរក YouTube ឬបញ្ចូលអាសយដ្ឋានគេហទំព័រណាមួយ ដើម្បីបើកគេហទំព័រនោះ
- **ការទាញយកដែលត្រូវការគណនី** — ចូលគណនីម្តងក្នុង Explore ហើយ Arroxy អាចទាញយកវីដេអូឯកជន និងសម្រាប់តែសមាជិកដែលគណនីរបស់អ្នកអាចមើលបាន វីដេអូកំណត់អាយុប្រសិនបើគណនីបានផ្ទៀងផ្ទាត់អាយុ និងបញ្ជី Watch Later និង Liked របស់អ្នក។ ចូលគណនីលើគេហទំព័រផ្សេងទៀតនៅទីនោះផងដែរ ហើយការទាញយករបស់គេហទំព័រទាំងនោះប្រើការចូលគណនីនោះនៅពេលចាំបាច់។ Arroxy នៅតែទាញយកដោយមិនចូលគណនីជាមុន ហើយប្រើការចូលគណនី Explore តែនៅពេលការទាញយកបរាជ័យក្នុងរបៀបដែលគណនីអាចជួសជុលបាន។ នៅពេល YouTube សុំឱ្យអ្នកបញ្ជាក់ថាអ្នកមិនមែនជា bot Arroxy ក៏សាកល្បងការចូលគណនី Explore របស់អ្នកដែរ
- **ប្រើគណនីបន្ទាប់បន្សំ** — អេក្រង់ដំបូងរបស់ Explore ពន្យល់ពីមូលហេតុ៖ ការទាញយកជាមួយគណនីមានហានិភ័យខ្លះដែលគណនីនោះអាចត្រូវបានរឹតបន្តឹង។ ចាកចេញពី Explore ពីការកំណត់នៅពេលណាដែលអ្នកចង់បំភ្លេចការចូលគណនីទាំងអស់
- **កម្មវិធីទប់ស្កាត់ពាណិជ្ជកម្ម** — បិទតាមលំនាំដើម។ ចុចម្តងលើខែលក្នុងរបារឧបករណ៍ Explore ដើម្បីទប់ស្កាត់ពាណិជ្ជកម្ម និងកម្មវិធីតាមដាននៅលើទំព័ររបស់វា ដោយមិនប៉ះពាល់ដល់ការទាញយក។ YouTube អាចប្រឆាំងនឹងកម្មវិធីទប់ស្កាត់ពាណិជ្ជកម្មសម្រាប់គណនីដែលបានចូល

</details>

<details>
<summary><strong>🎞️ គុណភាព និងទម្រង់</strong></summary>

- រហូតដល់ **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **អត្រាស៊ុមខ្ពស់ និង HDR** រក្សាដដែល — 60 fps, HDR10
- **សំឡេង** — នាំចេញតែសំឡេងជា MP3, M4A/AAC, Opus ឬ WAV។ ក្នុងការទាញយកអន្តរកម្ម ជ្រើសរើសបទ surround/Dolby ដើមរបស់ប្រភព (AC-3, E-AC-3, 5.1, DRC) នៅពេលមាន ឬកំណត់លំនាំដើមសកល **ចូលចិត្ត Surround / Dolby**
- **ប្រវត្តិរូបតាមគោលដៅ** — *រូបភាពល្អបំផុត* (AV1 · VP9) ឬ *Smart TV* (MP4 · H.264) រក្សាទុកជា ស្វ័យប្រវត្តិ, MP4, MKV ឬ WebM ដោយមិនអ៊ិនកូដឡើងវិញ។ HDR គឺ *ស្វ័យប្រវត្តិ* (តែនៅពេលអេក្រង់របស់អ្នកអាចបង្ហាញបាន), *SDR* ឬ *HDR*
- **គ្រប់ codec នៅគ្រប់គុណភាពបង្ហាញ** — ការទាញយកជាជំហានៗ បង្ហាញ AV1, VP9 និង H.264 ទន្ទឹមគ្នានៅគុណភាពបង្ហាញនីមួយៗ ដូច្នេះអ្នកអាចជ្រើសរើសមួយដែលទូរទស្សន៍ ឬកម្មវិធីកែសម្រួលរបស់អ្នកអាចចាក់បាន
- **ដឹងថាស្ទ្រីមមួយពិតជាអ្វី** — ទំហំដែល YouTube បានពង្រីកដោយ AI ភាសាសំឡេងដែលបញ្ចូលសំឡេងដោយ AI ស្ទ្រីមដែលមាន bitrate ប្រសើរជាង វីដេអូ 360° និងច្បាប់ចម្លងដែលខូច ឬមានវ៉ាត់ម៉ាក ត្រូវបានសម្គាល់។ ប្រវត្តិរូបរំលងស្ទ្រីមដែលពង្រីកដោយ AI លុះត្រាតែអ្នកអនុញ្ញាត

</details>

<details>
<summary><strong>🛡️ ឯកជនភាព និងការគ្រប់គ្រង</strong></summary>

- ដំណើរការក្នុងម៉ាស៊ីន 100% — ការទាញយកទៅដោយផ្ទាល់ពី YouTube ទៅថាសរបស់អ្នក
- **កូដចំហ** — គ្រប់បន្ទាត់អាចត្រួតពិនិត្យបាន អាជ្ញាប័ណ្ណ MIT
- ឯកសាររក្សាទុកដោយផ្ទាល់ទៅថតដែលអ្នកជ្រើសរើស

</details>

<details>
<summary><strong>⚡ លំហូរការងារ</strong></summary>

- **គ្រាប់ចុចផ្លូវកាត់ទាញយកសកល** — ចម្លងតំណក្នុងកម្មវិធីណាមួយ ហើយចុច `Ctrl+Shift+D` (`Cmd+Shift+D` លើ macOS); Arroxy ដាក់វាក្នុងជួរជាមួយប្រវត្តិរូបសកម្មរបស់អ្នកដោយមិនបើកផ្ទាំងបង្អួច ហើយការជូនដំណឹងមួយបញ្ជាក់វា។ បើកតាមលំនាំដើម អាចប្តូរគ្រាប់ចុចបាន
- **របៀបចាប់ផ្តើមបត់បែន** — ជ្រើសរើសការទាញយកតែមួយដែលមានការណែនាំ ផ្ទាំងជ្រើសរើសបញ្ជីចាក់/ប៉ុស្តិ៍ ការបិទភ្ជាប់ URL ច្រើន ទាញយករហ័ស ជាមួយលំនាំដើមដែលបានរក្សាទុក ឬរុករក និងទាញយកពី Explore
- **ជួរទាញយកកណ្តាល** — រាល់ការងារតែមួយ បញ្ជីចាក់ ច្រើន ឬរហ័ស មកដល់កន្លែងតែមួយសម្រាប់វឌ្ឍនភាព ផ្អាក បន្ត បោះបង់ ព្យាយាមម្តងទៀត និងការគ្រប់គ្រងអាទិភាព
- **តាមដានក្តារតម្បៀតខ្ទាស់** — ចម្លងតំណវីដេអូ ហើយវាបំពេញវាល URL នៅពេលអ្នកត្រឡប់មក Arroxy វិញ ដោយមាន **មិនធ្វើវិញ** ប្រសិនបើអ្នកមិនបានចង់បែបនោះ។ ខណៈពេល Arroxy កំពុងរវល់ តំណរង់ចាំរហូតដល់អ្នកត្រឡប់មកផ្ទាំង URL វិញ (បិទវាក្នុងការកំណត់)
- **សម្អាត URL ដោយស្វ័យប្រវត្តិ** — ដកប៉ារ៉ាម៉ែត្រតាមដាន (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ហើយពន្លាតំណ `youtube.com/redirect`
- **របៀបថាសប្រព័ន្ធ** — ការបិទផ្ទាំងបង្អួចរក្សាការទាញយកឱ្យដំណើរការនៅផ្ទៃខាងក្រោយ
- **31 ភាសា** — រកឃើញភាសាប្រព័ន្ធដោយស្វ័យប្រវត្តិ អាចប្តូរបានគ្រប់ពេល
- **ធ្វើសមកាលកម្មបញ្ជីចាក់** — ស្កេនបញ្ជីចាក់ម្តងទៀតធៀបនឹងថតក្នុងម៉ាស៊ីន ដើម្បីរំលងវីដេអូដែលបានទាញយករួច; បង្កើតឯកសារបញ្ជីចាក់ `.m3u` ដែលធ្វើបច្ចុប្បន្នភាពនៅពេលវីដេអូនីមួយៗទាញយក
- **ការគ្រប់គ្រងល្បឿន និងចង្វាក់** — កំណត់កម្រិតបញ្ជូនទាញយក កំណត់ចំនួនផ្នែកនៃវីដេអូដែលទាញយកក្នុងពេលតែមួយ និងបន្ថែមការពន្យារសំណើជាមួយការកំណត់ជាមុន (*បិទ · មានតុល្យភាព · ប្រុងប្រយ័ត្ន · ផ្ទាល់ខ្លួន*)
- **គំរូឈ្មោះឯកសារ** — ដាក់ឈ្មោះការទាញយកតាមរបៀបរបស់អ្នកជាមួយ `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` និង `{playlist_index}` ជាសកល ឬតាមប្រវត្តិរូបទាញយក
- **ការទាញយកក្នុងពេលតែមួយ និងការព្យាយាមម្តងទៀតដោយស្វ័យប្រវត្តិ** — ជ្រើសរើសចំនួនការទាញយកក្នុងជួរដែលដំណើរការក្នុងពេលតែមួយ ហើយឱ្យ Arroxy ព្យាយាមម្តងទៀតនូវការទាញយកដែលជួបបញ្ហាបណ្តាញ ឬម៉ាស៊ីនមេ ដោយរង់ចាំយូរជាងមុនមុនការព្យាយាមនីមួយៗ
- **ប្រវត្តិរូបបញ្ជីចាក់តាមធាតុនីមួយៗ** — កំណត់ប្រវត្តិរូបទាញយកផ្ទាល់ខ្លួនដល់វីដេអូនីមួយៗក្នុងបញ្ជីចាក់ ជំនួសឱ្យការកំណត់តែមួយសម្រាប់បញ្ជីទាំងមូល ដូច្នេះការដំណើរការតែមួយអាចរក្សាទុកខ្លះជាគុណភាពពេញ ហើយយកនៅសល់ជា MP3
- **ទាញយករហ័ស ដំណើរការនៅផ្ទៃខាងក្រោយ** — តំណបង្ហាញក្នុង ការទាញយក ភ្លាមៗ ហើយរៀបចំនៅទីនោះ កំណត់ចំណាំមួយជាមួយ **មើល** បញ្ជាក់វា ហើយវាល URL ត្រូវបានសម្អាតសម្រាប់តំណបន្ទាប់។ ចាប់ផ្តើមប៉ុន្មានក៏បានតាមចិត្ត ខណៈពេលតំណមុនៗកំពុងរៀបចំ
- **ការទាញយកប្រាប់អ្នកពីអ្វីដែលត្រូវការអ្នក** — ប្រសិនបើ Arroxy មិនអាចអានតំណបាន ជួររបស់វាប្រាប់មូលហេតុ ហើយផ្តល់ដំណោះស្រាយ៖ ព្យាយាមម្តងទៀត បើក cookies ឬចូលគណនីក្នុង Explore។ នៅពេល cookies បិទ **ចូលគណនីជាមួយ Explore** ព្យាយាមម្តងទៀតជំនួសអ្នកនៅពេលអ្នកបានចូលគណនី។ បញ្ជីចាក់ដែលវែងជាងដែនកំណត់ផ្ទុករបស់អ្នករង់ចាំនៅលើជួររបស់វាឱ្យអ្នកជ្រើសរើសទាំងអស់ ផ្នែកដំបូង ឬការពិនិត្យ។ ផ្ទាំង ការទាញយក រាប់ជួរដែលកំពុងរង់ចាំអ្នក
- **ទាញយកតែផ្នែកមួយនៃវីដេអូ** — ជ្រើសរើសចំណុចចាប់ផ្តើម និងបញ្ចប់ ឬជំពូកមួយ នៅលើអេក្រង់ទម្រង់ ហើយ Arroxy រក្សាទុកតែចន្លោះនោះ ដោយដាក់ឈ្មោះជាមួយចន្លោះបន្ទាប់ពីលេខសម្គាល់វីដេអូ។ ការកាត់ចុះលើ keyframe ដែលនៅជិតបំផុត ហើយបើកការកាត់ឱ្យត្រឹមត្រូវ ដើម្បីអ៊ិនកូដឡើងវិញជំនួសវិញ
- **ដកការទាញយកដែលបានបញ្ចប់ដោយស្វ័យប្រវត្តិ** — ជាជម្រើស៖ ការទាញយកដែលបានបញ្ចប់នឹងចេញពីបញ្ជីបន្ទាប់ពី 5 វិនាទី។ ឯកសាររបស់វានៅតែនៅលើថាស ហើយការទាញយកដែលបរាជ័យនៅតែមានក្នុងបញ្ជី
- **ទំហំ និង បាត់ ក្នុងការទាញយក** — ជួរឈរ **ទំហំ** ដែលអាចតម្រៀបបានបង្ហាញថាការទាញយកនីមួយៗប្រើទំហំប៉ុន្មាន ហើយ **បាត់** សម្គាល់ឯកសារដែលបានផ្លាស់ទី ឬលុបនៅខាងក្រៅ Arroxy
- **អូរ៉ូរ៉ា ឬសាមញ្ញ, ងងឹត ឬភ្លឺ** — បន្ទះកញ្ចក់លើមេឃដែលកំពុងផ្លាស់ទី ឬផ្ទៃរឹងស្ងប់ស្ងាត់ ប្តូរពីបាតទំព័រ។ កុំព្យូទ័រដែលគ្មានការបង្កើនល្បឿនក្រាហ្វិកទទួលបាន សាមញ្ញ ដោយស្វ័យប្រវត្តិ
- **របារម៉ឺនុយ Mac** — នៅលើ macOS បើកការកំណត់ (`Cmd+,`) កំណត់ដែនកំណត់ល្បឿនទាញយក ប្តូររចនាប័ទ្ម និងធីម ហើយបើកកំណត់ហេតុ ឬរក្សាទុកឯកសាររោគវិនិច្ឆ័យពីរបារម៉ឺនុយ
- **ប្តូរប្រវត្តិរូបពីការទាញយកណាមួយ** — កែតម្រូវការទាញយកមួយ បន្ទាប់មកធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបដែលវាចាប់ផ្តើមពី (ជាមួយការមើលជាមុននូវអ្វីដែលផ្លាស់ប្តូរ) ឬរក្សាទុកការកំណត់ជាប្រវត្តិរូបថ្មី។ ការប្តូរប្រវត្តិរូបនឹងសួរថាតើត្រូវរក្សាការកែប្រែរបស់អ្នកឬទេ

</details>

<details>
<summary><strong>📝 អក្សររត់ និងការដំណើរការក្រោយ</strong></summary>

- **អក្សររត់** ជា SRT, VTT ឬ ASS — ដោយដៃ ឬបង្កើតដោយស្វ័យប្រវត្តិ ជាភាសាណាមួយដែលមាន
- រក្សាទុកនៅជាប់វីដេអូ បង្កប់ក្នុង `.mkv` ឬរៀបចំក្នុងថតរង `Subtitles/`
- **ក្រុមតែអក្សររត់** — បិទភ្ជាប់បញ្ជី URL ឬបើកបញ្ជីចាក់ ជ្រើសរើសអក្សររត់ ហើយទទួលបានតែឯកសារអក្សររត់សម្រាប់វីដេអូនីមួយៗ
- **SponsorBlock** — រំលង ឬសម្គាល់ជាជំពូកនូវអ្នកឧបត្ថម្ភ ផ្នែកណែនាំ ផ្នែកបញ្ចប់ ការផ្សព្វផ្សាយខ្លួនឯង
- **ទិន្នន័យមេតាបង្កប់** — ចំណងជើង កាលបរិច្ឆេទផ្ទុកឡើង ប៉ុស្តិ៍ ការពិពណ៌នា រូបភាពតូច និងសញ្ញាសម្គាល់ជំពូកត្រូវបានសរសេរចូលក្នុងឯកសារ

</details>

<details>
<summary><strong>🌐 YouTube + គេហទំព័រ 2000</strong></summary>

- **YouTube ពេញលេញ** — វីដេអូ Shorts ប៉ុស្តិ៍ បញ្ជីចាក់ YouTube Music និងផតខាស ត្រូវបានគាំទ្រជាប្រភពលំដាប់ទីមួយ
- **គេហទំព័រជាង 2000 ផ្សេងទៀត** តាមរយៈ yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable និងច្រើនទៀត
- **តែសំឡេង និងអក្សររត់** ដំណើរការលើគ្រប់គេហទំព័រដែលគាំទ្រ មិនមែនតែ YouTube ទេ
- ប្រសិនបើគេហទំព័រផ្លាស់ប្តូរ yt-dlp ចេញការជួសជុលរៀងរាល់សប្តាហ៍ ហើយ Arroxy ធ្វើបច្ចុប្បន្នភាព binary ដោយស្វ័យប្រវត្តិនៅពេលបើក

</details>

---

## <a id="install"></a>📥 ដំឡើង និងបើកលើកដំបូង

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

AppImage:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

Build មានតែ x86_64 ប៉ុណ្ណោះ។ គ្មាន `curl`? ប្តូរ `curl -fsSL` ទៅ `wget -qO-`។

| វេទិកា | ទាញយកផ្ទាល់ |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**ឯកសារចេញផ្សាយទាំងអស់ →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 ការបើកលើកដំបូងលើ Windows</strong></summary>

នៅពេលបើកលើកដំបូង អ្នកអាចឃើញ **"Windows protected your PC"** ឬ **"Unknown publisher."** វាអនុវត្តចំពោះទាំង `Arroxy-win-x64-Setup.exe` និង `Arroxy-win-x64-Portable.exe`។ Arroxy ឥតគិតថ្លៃ និងកូដចំហ ហើយ build Windows មិនត្រូវបានចុះហត្ថលេខាកូដជាមួយវិញ្ញាបនបត្របង់ប្រាក់ទេ នោះហើយជាមូលហេតុដែល SmartScreen សម្គាល់ពួកវា។ វា **មិនមែន** មានន័យដោយស្វ័យប្រវត្តិថា Arroxy មិនមានសុវត្ថិភាពនោះទេ។ ដើម្បីបន្ត៖

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="ប្រអប់ SmartScreen "Windows protected your PC" ជាមួយតំណ "More info" ដែលបានបន្លិច" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="ប្រអប់ SmartScreen បន្ទាប់ពីពង្រីក More info បង្ហាញប៊ូតុង "Run anyway"" />
</div>

1. ចុច **More info**។
2. ចុច **Run anyway**។

#### ប្រសិនបើ Windows Defender សម្គាល់ ឬលុបឯកសារ

Defender heuristics ពេលខ្លះសម្គាល់កម្មវិធីដំឡើង NSIS និង Electron ចល័តដែលមិនបានចុះហត្ថលេខាថាគួរឱ្យសង្ស័យ។ ប្រសិនបើ Defender ដាក់ `Arroxy-win-x64-Setup.exe` ឬ `Arroxy-win-x64-Portable.exe` ក្នុង quarantine សូមស្តារវាពី **Windows Security → Virus & threat protection → Protection history** បន្ទាប់មកបន្ថែមឯកសារដំណើរការ Arroxy ជាធាតុដែលបានអនុញ្ញាតនៅក្រោម **Manage settings → Add or remove exclusions**។ ដូចគ្នានឹង SmartScreen មូលហេតុគឺការខ្វះហត្ថលេខាអ្នកបោះពុម្ព មិនមែនមេរោគដែលបានរកឃើញទេ។

> ទាញយក Arroxy តែពីទំព័រ GitHub Releases ផ្លូវការប៉ុណ្ណោះ។ ប្រសិនបើអ្នកទទួលបានឯកសារពីគេហទំព័រផ្សេង ឬមាននរណាម្នាក់ផ្ញើវាមកអ្នក សូមលុបវា ហើយទាញយកច្បាប់ចម្លងថ្មីពីប្រភពផ្លូវការ។ កូដប្រភពជាសាធារណៈ ដូច្នេះអ្នកអាចត្រួតពិនិត្យវា ឬ build Arroxy ដោយខ្លួនឯងប្រសិនបើអ្នកចូលចិត្ត។

ចូលចិត្ត Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 ការបើកលើកដំបូងលើ macOS</strong></summary>

Build macOS របស់ Arroxy ត្រូវបានចុះហត្ថលេខា ad-hoc ប៉ុន្តែមិនត្រូវបាន notarize ដោយ Apple ទេ ដូច្នេះ Gatekeeper ទប់ស្កាត់ការបើកលើកដំបូងជាមួយ *"Arroxy.app" Not Opened — Apple could not verify "Arroxy.app" is free of malware*។ នោះមានន័យថា macOS មិនអាចពិនិត្យកម្មវិធីជាមួយ Apple បាន មិនមែនថាមានអ្វីខុសជាមួយឯកសារនោះទេ។ ការដំឡើងជាមួយ Homebrew ជៀសវាងប្រអប់នេះទាំងស្រុង។ ប្រសិនបើអ្នកបានប្រើ DMG ពាក្យបញ្ជា Terminal មួយសម្អាតវា៖

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. អូស `Arroxy.app` ពី DMG ដែលបាន mount ទៅក្នុង `/Applications`។
2. បើក Terminal ហើយរត់ពាក្យបញ្ជាទាំងពីរនេះ៖

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

ពាក្យបញ្ជាទីមួយដកគុណលក្ខណៈ quarantine ដែល macOS បានភ្ជាប់នៅពេលឯកសារត្រូវបានទាញយក; ពាក្យបញ្ជាទីពីរបើកកម្មវិធី។ ជាធម្មតាអ្នកមិនត្រូវការ `sudo` ទេ ព្រោះច្បាប់ចម្លងក្នុង `/Applications` ជារបស់អ្នក — បន្ថែមវាតែនៅពេលអ្នកទទួលបានកំហុសសិទ្ធិប៉ុណ្ណោះ។

**Apple Silicon ធៀបនឹង Intel៖** លើ Mac ស៊េរី M (M1 / M2 / M3 / M4) សូមទាញយក DMG `arm64`។ លើ Mac Intel សូមទាញយក DMG `x64`។ ការដំណើរការ build ខុសនៅតែដំណើរការតាម Rosetta ប៉ុន្តែយឺតគួរឱ្យកត់សម្គាល់។

> Build macOS ត្រូវបានបង្កើតតាម CI លើ runner Apple Silicon និង Intel។ ប្រសិនបើអ្នកជួបបញ្ហា សូម [បើក issue](../../issues) — មតិពីអ្នកប្រើ macOS ជួយកំណត់វដ្តតេស្ត macOS យ៉ាងសកម្ម។

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ ហេតុអ្វីអ្នកអាចឃើញការព្រមាន</strong></summary>

Arroxy ជាកូដចំហ និងមានអាជ្ញាប័ណ្ណ MIT។ Build Windows និង macOS **មិនត្រូវបានចុះហត្ថលេខាកូដទេ** — វិញ្ញាបនបត្រ Apple Developer ID និង Windows EV code-signing នីមួយៗមានតម្លៃរាប់រយដុល្លារក្នុងមួយឆ្នាំ ដែលគម្រោងឯករាជ្យត្រូវបង់ពីហោប៉ៅខ្លួនឯង។ បើគ្មានហត្ថលេខាទាំងនោះ Windows SmartScreen និង macOS Gatekeeper នឹងព្រមានអ្នកនៅពេលបើកលើកដំបូង។ ការព្រមានមានន័យថា *ប្រព័ន្ធប្រតិបត្តិការរបស់អ្នកមិនស្គាល់អ្នកបោះពុម្ព* — វាមិនមានន័យថា Arroxy ជាមេរោគទេ។

វិធីបីយ៉ាងដើម្បីផ្ទៀងផ្ទាត់ Arroxy ដោយខ្លួនឯង តាមកម្រិតម៉ត់ចត់កើនឡើង៖

- **អានកូដប្រភព។** គ្រប់បន្ទាត់មាននៅលើ [GitHub](https://github.com/antonio-orionus/Arroxy) ហើយអ្នកអាច [build វាពីកូដប្រភព](#tech)។
- **ពិនិត្យ SHA256។** ផ្ទៀងឯកសាររបស់អ្នកជាមួយ [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) ដែលបានបោះពុម្ព — មើល [ផ្ទៀងផ្ទាត់ការទាញយករបស់អ្នក](#verify) ខាងក្រោម។
- **ស្កេនដោយភាគីទីបី។** ផ្ទុកឯកសារឡើងទៅ [VirusTotal](https://www.virustotal.com)។

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 ការបើកលើកដំបូងលើ Linux</strong></summary>

AppImage ដំណើរការដោយផ្ទាល់ — គ្មានការដំឡើង។ អ្នកគ្រាន់តែត្រូវសម្គាល់ឯកសារថាអាចដំណើរការបាន។

**កម្មវិធីគ្រប់គ្រងឯកសារ៖** ចុចកណ្តុរស្តាំលើ `.AppImage` → **Properties** → **Permissions** → បើក **Allow executing file as program** បន្ទាប់មកចុចពីរដង។

**Terminal៖**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

ប្រសិនបើការបើកនៅតែបរាជ័យ សូមរត់វាដោយមិន mount — មិនត្រូវការកញ្ចប់ FUSE ទេ៖

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**ការរួមបញ្ចូលផ្ទៃតុជាជម្រើស៖** ដំឡើង [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ម្តង ហើយ AppImage ណាមួយដែលអ្នកចុចពីរដងនឹងត្រូវបានចុះឈ្មោះក្នុងម៉ឺនុយកម្មវិធីរបស់អ្នកដោយស្វ័យប្រវត្តិ — មិនត្រូវការឯកសារ `.desktop` ដោយដៃទេ។

**Tarball ធម្មតា (គ្មាន FUSE គ្មានការដំឡើង)៖**

Build `.tar.gz` គឺជាកម្មវិធីដដែលដោយគ្មានសំបក AppImage — ពន្លាវានៅកន្លែងណាក៏បាន ហើយដំណើរការវា។ គ្មានកម្មវិធីដំឡើង និងមិនត្រូវការកញ្ចប់ FUSE ទេ។

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**ការទាញយក Linux នៅលើទំព័រចេញផ្សាយមានតែ x86_64 ប៉ុណ្ណោះ។** លើម៉ាស៊ីន ARM64 (Raspberry Pi, Asahi Linux) Flatpak នៅតែដំឡើងបាន បន្ទាប់មកបរាជ័យនៅពេលបើកជាមួយ `bwrap: execvp ldconfig: Exec format error`។

</details>

<details>
<summary><strong><a id="verify"></a>🔐 ផ្ទៀងផ្ទាត់ការទាញយករបស់អ្នក (SHA256)</strong></summary>

រាល់ការចេញផ្សាយបោះពុម្ពឯកសារ `SHA256SUMS` ជាមួយឯកសារ binary។ ដើម្បីពិនិត្យថាការទាញយករបស់អ្នកមិនខូច ឬត្រូវបានកែប្រែក្នុងពេលបញ្ជូន សូមគណនា hash ឯកសាររបស់អ្នកក្នុងម៉ាស៊ីន ហើយផ្ទៀងជាមួយបន្ទាត់ក្នុង `SHA256SUMS`។ បើកទំព័រចេញផ្សាយចុងក្រោយ → **Assets** → ទាញយក `SHA256SUMS`។

**Windows (PowerShell ឬ Command Prompt)៖**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminal)៖**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminal)៖**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

ចង់បានការស្កេនមេរោគដោយភាគីទីបី? ផ្ទុកឯកសារឡើងនៅ [VirusTotal](https://www.virustotal.com)។ ការសម្គាល់ generic-heuristic មួយចំនួនតូចពីម៉ាស៊ីនស្កេនតូចៗជារឿងធម្មតាសម្រាប់កម្មវិធី Electron ដែលមិនបានចុះហត្ថលេខា; ការរកឃើញទូលំទូលាយពីម៉ាស៊ីនស្កេនធំៗនឹងជាការព្រួយបារម្ភពិតប្រាកដ។

</details>

<details>
<summary><strong>📦 Windows៖ កម្មវិធីដំឡើង ធៀបនឹង ចល័ត</strong></summary>

|               | កម្មវិធីដំឡើង NSIS | `.exe` ចល័ត |
| ------------- | :----------------------: | :---------------------: |
| ត្រូវការដំឡើង | បាទ/ចាស  | ទេ — ដំណើរការពីកន្លែងណាក៏បាន  |
| ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិ | ✅ ក្នុងកម្មវិធី  | ❌ ទាញយកដោយដៃ  |
| ល្បឿនចាប់ផ្តើម | ✅ លឿនជាង  | ⚠️ ចាប់ផ្តើមលើកដំបូងយឺតជាង  |
| បន្ថែមទៅ Start Menu |            ✅            |           ❌            |
| លុបការដំឡើងងាយស្រួល |            ✅            | ❌ លុបឯកសារ  |

**ការណែនាំ៖** ប្រើកម្មវិធីដំឡើង NSIS សម្រាប់ការធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិ និងការចាប់ផ្តើមលឿនជាង។ ប្រើ `.exe` ចល័តសម្រាប់ជម្រើសគ្មានការដំឡើង គ្មាន registry។

</details>

---

## <a id="why"></a>⚖️ ហេតុអ្វី Arroxy

ការប្រៀបធៀបជាមួយជម្រើសផ្សេងទៀតដែលពេញនិយមបំផុត៖

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| កម្មវិធីរុករកភ្ជាប់មកជាមួយ (រុករក ចូលគណនី ទាញយក) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| វីដេអូឯកជន សម្រាប់តែសមាជិក និងកំណត់អាយុ ដោយមិនចាំបាច់នាំចេញ cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| ឥតគិតថ្លៃ គ្មានកម្រិតពិសេសបង់ប្រាក់ |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| កូដចំហ |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| ដំណើរការតែក្នុងម៉ាស៊ីន |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| គ្មានដែនកំណត់ការប្រើប្រាស់ |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| កម្មវិធីកុំព្យូទ័រឆ្លងវេទិកា |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| អក្សររត់ + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = បានមួយផ្នែក ឬតែក្នុងកម្រិតបង់ប្រាក់ប៉ុណ្ណោះ។ ការចូលគណនីក្នុងកម្មវិធីរបស់ 4K Video Downloader សម្រាប់វីដេអូឯកជន គឺជាមុខងារបង់ប្រាក់; GUI របស់ yt-dlp ឥតគិតថ្លៃភាគច្រើនទទួលយកតែឯកសារ cookies ឬអាន cookies ពីកម្មវិធីរុករកតាមអ៊ីនធឺណិតរបស់អ្នក។

Arroxy ត្រូវបានបង្កើតឡើងសម្រាប់រឿងតែមួយ៖ ឯកសារស្អាតក្នុងម៉ាស៊ីន មិនថាអ្នកបិទភ្ជាប់ URL ឬរកឃើញវីដេអូក្នុង Explore ទេ។ គ្មានការលក់បន្ថែម គ្មានការប្រមូលទិន្នន័យ។

### <a id="why-explore"></a>🧭 អ្វីដែល wrapper yt-dlp ធម្មតាមិនអាចធ្វើបាន៖ ផ្ទាំង Explore

កម្មវិធីទាញយក YouTube ឥតគិតថ្លៃភាគច្រើន គ្រាន់តែជាប្រអប់ URL ដាក់ពីលើ yt-dlp ប៉ុណ្ណោះ។ Arroxy ក៏ប្រើ yt-dlp ដែរ ប៉ុន្តែវាក៏មាន **Explore** ដែលជាកម្មវិធីរុករកដែលបង្កើតនៅក្នុងកម្មវិធីផ្ទាល់ ហើយបើក YouTube ឬគេហទំព័រផ្សេងទៀតបាន។ Explore ឆ្លងកាត់ដែនកំណត់ដែលប្រអប់ URL មិនអាចឆ្លងកាត់បាន៖

- **វីដេអូដែលត្រូវការគណនី ដោយមិនចាំបាច់នាំចេញ cookies** — វីដេអូឯកជន សម្រាប់តែសមាជិក និងកំណត់អាយុ (លើគណនីដែលបានផ្ទៀងផ្ទាត់អាយុ) ព្រមទាំងបញ្ជី Watch Later និង Liked របស់អ្នក និងវីដេអូដែលត្រូវចូលគណនីនៅលើគេហទំព័រផ្សេងទៀត។ wrapper ធម្មតាត្រូវការឯកសារ cookies.txt ដែលបាននាំចេញ ឬត្រូវអាន cookies ពីកម្មវិធីរុករកតាមអ៊ីនធឺណិតរបស់អ្នក ដែល Chrome លើ Windows ឥឡូវនេះទប់ស្កាត់។ ក្នុង Arroxy អ្នកគ្រាន់តែចូលគណនីម្តងក្នុង Explore ហើយវាធ្វើអ្វីៗដែលនៅសល់
- **"ចូលគណនីដើម្បីបញ្ជាក់ថាអ្នកមិនមែនជា bot"** — នៅពេល YouTube សួររឿងនេះ Arroxy សាកល្បងទាញយកម្តងទៀតដោយប្រើការចូលគណនី Explore របស់អ្នក ជំនួសឱ្យការបរាជ័យ
- **token ទាញយករបស់ YouTube** — កម្មវិធីរុករកដែលភ្ជាប់មកជាមួយ Arroxy ទទួលបាន token ដែល YouTube រំពឹងទុកមុនការទាញយក។ បើគ្មានវាទេ YouTube អាចផ្តល់ទម្រង់តិចជាង និងគុណភាពទាបជាងអ្វីដែលអ្នកបានស្នើ
- **មិនចាំបាច់ចម្លងតំណ** — ស្វែងរកវីដេអូ បញ្ជីចាក់ ឬប៉ុស្តិ៍ក្នុង Explore ហើយទាញយកវាដោយចុចតែម្តង ឬចុចកណ្ដុរស្ដាំលើតំណណាមួយនៅលើទំព័រ
- **កម្មវិធីទប់ស្កាត់ពាណិជ្ជកម្មនៅពេលអ្នកចង់បាន** — ចុចម្តងលើខែល ដើម្បីទប់ស្កាត់ពាណិជ្ជកម្ម និងកម្មវិធីតាមដាននៅលើទំព័រ Explore

---

## <a id="privacy"></a>🔒 ឯកជនភាព

ការទាញយកត្រូវបានទាញដោយផ្ទាល់តាម [yt-dlp](https://github.com/yt-dlp/yt-dlp) ពី YouTube ទៅថតដែលអ្នកជ្រើសរើស — គ្មានអ្វីឆ្លងកាត់ម៉ាស៊ីនមេភាគីទីបីទេ។ ប្រវត្តិមើល ប្រវត្តិទាញយក URL និងមាតិកាឯកសារនៅលើឧបករណ៍របស់អ្នក។

គ្មានការតាមដានទេ — មានតែសញ្ញាអនាមិកមួយក្នុងមួយថ្ងៃ៖ កំណែកម្មវិធី ប្រព័ន្ធប្រតិបត្តិការ ភាសា ប៉ុស្តិ៍ដំឡើង និងប្រទេស ដើម្បីឱ្យយើងអាចរាប់អ្នកប្រើសកម្ម។ គ្មាន ID, URL, ចំណងជើងវីដេអូ ផ្លូវឯកសារ ឬព័ត៌មានគណនីទេ។ អ្នកអាចបិទវាក្នុងការកំណត់។

Explore រក្សាការចូលគណនីផ្ទាល់ខ្លួន ដាច់ដោយឡែកពីកម្មវិធីរុករករបស់អ្នក ហើយ Arroxy មិនដែលអាន ឬបំពេញទម្រង់ចូលគណនីណាមួយទេ — អ្នកវាយចូលទំព័ររបស់គេហទំព័រនោះផ្ទាល់។ ការទាញយកដំណើរការដោយមិនចូលគណនី; មានតែនៅពេលមួយបរាជ័យក្នុងរបៀបដែលគណនីអាចជួសជុលបាន ទើប Arroxy អានការចូលគណនីថ្មី រក្សាវាក្នុងឯកសារបណ្តោះអាសន្នសម្រាប់ការទាញយកនោះ ហើយលុបឯកសារនោះបន្ទាប់មក។ ការចាកចេញពី Explore ក្នុងការកំណត់នឹងបំភ្លេចវា។

---

## <a id="faq"></a>❓ សំណួរញឹកញាប់

<details>
<summary><strong>តើវាពិតជាឥតគិតថ្លៃមែនទេ?</strong></summary>

បាទ/ចាស — អាជ្ញាប័ណ្ណ MIT គ្មានកម្រិតពិសេសបង់ប្រាក់ គ្មានការរឹតបន្តឹងមុខងារ។

</details>

<details>
<summary><strong>តើ Arroxy ខុសពី GUI របស់ yt-dlp ផ្សេងទៀតយ៉ាងដូចម្តេច?</strong></summary>

GUI របស់ yt-dlp ឥតគិតថ្លៃភាគច្រើនជា wrapper ដែលទទួលយកតែតំណ។ Arroxy បន្ថែម **Explore** ដែលជាកម្មវិធីរុករកដែលបង្កើតនៅក្នុងកម្មវិធីផ្ទាល់ ហើយបើក YouTube ឬគេហទំព័រផ្សេងទៀតបាន៖ អ្នករុករក និងទាញយកដោយមិនចាំបាច់ចម្លងតំណ ហើយចូលគណនីនៅទីនោះម្តង ដើម្បីទាញយកវីដេអូឯកជន សម្រាប់តែសមាជិក និងកំណត់អាយុ ព្រមទាំងបញ្ជី Watch Later និង Liked របស់អ្នក ដោយមិនចាំបាច់នាំចេញ cookie។ Arroxy ប្រើការចូលគណនីនោះនៅពេល YouTube សុំឱ្យអ្នកបញ្ជាក់ថាអ្នកមិនមែនជា bot ហើយកម្មវិធីរុករកដែលភ្ជាប់មកជាមួយរបស់វាទទួលបាន token ទាញយករបស់ YouTube ដូច្នេះការទាញយកមិនធ្លាក់ចុះមកនៅទម្រង់តិចជាងនេះទេ។ សូមមើល [ហេតុអ្វី Arroxy](#why)។

</details>

<details>
<summary><strong>តើខ្ញុំអាចទាញយកវីដេអូគុណភាពអ្វីខ្លះ?</strong></summary>

អ្វីដែល YouTube ផ្តល់៖ 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p បូកនឹងតែសំឡេង។ ស្ទ្រីម 60 fps និង HDR ត្រូវបានរក្សាដដែល ហើយការទាញយកជាជំហានៗអនុញ្ញាតឱ្យអ្នកជ្រើស AV1, VP9 ឬ H.264 នៅគុណភាពបង្ហាញនីមួយៗ។

</details>

<details>
<summary><strong>តើខ្ញុំអាចដកតែសំឡេងជា MP3 បានទេ?</strong></summary>

បាទ/ចាស។ ជ្រើសរើស *តែសំឡេង* ក្នុងម៉ឺនុយទម្រង់ ហើយជ្រើសរើស MP3, M4A/AAC, Opus ឬ WAV។

</details>

<details>
<summary><strong>តើខ្ញុំទាញយកវីដេអូដែលត្រូវការគណនី YouTube យ៉ាងដូចម្តេច?</strong></summary>

ចូលគណនីម្តងក្នុងផ្ទាំង Explore។ បន្ទាប់មក Arroxy អាចទាញយកវីដេអូឯកជន និងសម្រាប់តែសមាជិកដែលគណនីរបស់អ្នកអាចមើលបាន វីដេអូកំណត់អាយុប្រសិនបើគណនីបានផ្ទៀងផ្ទាត់អាយុ និងបញ្ជី Watch Later និង Liked របស់អ្នក។ វាប្រើការចូលគណនីតែនៅពេលការទាញយកបរាជ័យក្នុងរបៀបដែលគណនីអាចជួសជុលបាន; អ្វីៗផ្សេងទៀតទាញយកដូចមុន។ នេះគឺជាជម្រើស **ការចូលគណនី Explore** ដែលរាយបញ្ជីមុនគេ ហើយសម្គាល់ថា ណែនាំ ក្នុងការកំណត់ cookie ហើយ Arroxy ជ្រើសរើសវាជូនអ្នកនៅលើកដំបូងដែលអ្នកបើក Explore។ wiki របស់ yt-dlp កត់សម្គាល់ថា [ស្វ័យប្រវត្តិកម្មដែលបានចូលគណនីអាចធ្វើឱ្យគណនី Google ត្រូវបានសម្គាល់](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) ដូច្នេះគណនីបន្ទាប់បន្សំជាជម្រើសដែលមានសុវត្ថិភាពជាង។

</details>

<details>
<summary><strong>តើវានឹងបន្តដំណើរការនៅពេល YouTube ផ្លាស់ប្តូរអ្វីមួយទេ?</strong></summary>

yt-dlp ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិនៅពេលបើក ហើយ Arroxy ចេញការជួសជុលយ៉ាងឆាប់រហ័សនៅពេល YouTube ផ្លាស់ប្តូរអ្វីមួយ។ នៅពេល YouTube សុំឱ្យអ្នកបញ្ជាក់ថាអ្នកមិនមែនជា bot Arroxy ក៏សាកល្បងការចូលគណនី Explore របស់អ្នកប្រសិនបើអ្នកបានចូលគណនីនៅទីនោះ ហើយ cookies ពីឯកសារ ឬកម្មវិធីរុករករបស់អ្នកមាននៅក្នុងការកំណត់ cookie។

</details>

<details>
<summary><strong>តើ Arroxy មានជាភាសាអ្វីខ្លះ?</strong></summary>

31 ភាសា ភ្លាមៗ៖ Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文។ Arroxy រកឃើញភាសាប្រព័ន្ធប្រតិបត្តិការរបស់អ្នកដោយស្វ័យប្រវត្តិនៅពេលបើកលើកដំបូង ហើយអ្នកអាចប្តូរបានគ្រប់ពេលពីផ្ទាំងជ្រើសរើសភាសាក្នុងរបារឧបករណ៍។ Runtime locale JSON ស្ថិតនៅក្នុង src/shared/i18n/locales/ ហើយកាតាឡុក PO សម្រាប់អ្នកបកប្រែស្ថិតនៅក្នុង i18n/locales/ — បើក PR នៅលើ GitHub ដើម្បីចូលរួមចំណែក។

</details>

<details>
<summary><strong>តើខ្ញុំត្រូវដំឡើងអ្វីផ្សេងទៀតទេ?</strong></summary>

ទេ។ yt-dlp, ffmpeg និង ffprobe ត្រូវបានទាញយកដោយស្វ័យប្រវត្តិនៅពេលបើកលើកដំបូង ហើយរក្សាទុកក្នុងម៉ាស៊ីនរបស់អ្នក។ បន្ទាប់ពីនោះ មិនត្រូវការការរៀបចំបន្ថែមទេ។

</details>

<details>
<summary><strong>តើខ្ញុំអាចទាញយកបញ្ជីចាក់ ឬប៉ុស្តិ៍ទាំងមូលបានទេ?</strong></summary>

បាទ/ចាស — ទាំងពីរ។ បិទភ្ជាប់ URL បញ្ជីចាក់ ឬ URL ប៉ុស្តិ៍ (ឧ. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); ជ្រើសរើសចំនួនធាតុដែលត្រូវស្កេន បន្ទាប់មកដាក់បញ្ជីទាំងមូលក្នុងជួរ ឬជ្រើសរើសវីដេអូជាក់លាក់។ តម្រងចន្លោះកាលបរិច្ឆេទនឹងមកដល់ឆាប់ៗនេះ។

</details>

<details>
<summary><strong>macOS និយាយថា "the app is damaged" — តើខ្ញុំត្រូវធ្វើអ្វី?</strong></summary>

នោះគឺ macOS Gatekeeper ទប់ស្កាត់កម្មវិធីដែលមិនបានចុះហត្ថលេខា មិនមែនការខូចពិតប្រាកដទេ។ មើល [ការបើកលើកដំបូងលើ macOS](#macos-first-launch) សម្រាប់ពាក្យបញ្ជា Terminal ដែលសម្អាត quarantine និងបើក Arroxy។

</details>

<details>
<summary><strong>តើការទាញយកវីដេអូ YouTube ស្របច្បាប់ទេ?</strong></summary>

សម្រាប់ការប្រើប្រាស់ផ្ទាល់ខ្លួន និងឯកជន វាត្រូវបានទទួលយកជាទូទៅក្នុងយុត្តាធិការភាគច្រើន។ អ្នកទទួលខុសត្រូវក្នុងការអនុវត្តតាម [លក្ខខណ្ឌសេវាកម្ម](https://www.youtube.com/t/terms) របស់ YouTube និងច្បាប់រក្សាសិទ្ធិក្នុងតំបន់របស់អ្នក។

</details>

---

## <a id="roadmap"></a>🗺️ ផែនការ

នៅតែគ្រោងទុក — តាមលំដាប់អាទិភាពប្រហាក់ប្រហែល៖

| មុខងារ    | ការពិពណ៌នា    |
| ---------------- | ---------------- |
| **តម្រងបញ្ជីចាក់ និងប៉ុស្តិ៍** | តម្រងចន្លោះកាលបរិច្ឆេទនៅពេលរាប់បញ្ជីចាក់ ឬប៉ុស្តិ៍ |
| **ចំណូលចិត្តបទសំឡេង YouTube** | កំណត់ចំណូលចិត្តភាសានិយាយសម្រាប់កម្មវិធីទាំងមូល ជាមួយការជំនួសតាមប្រវត្តិរូបនៅពេល YouTube ផ្តល់បទសំឡេងច្រើន |
| **ការស្តារការព្យាយាមម្តងទៀតខ្លាំងជាងមុន** | ផ្លូវព្យាយាមម្តងទៀតថ្មីសម្រាប់ការទាញយកដែលត្រូវបានរំខានដោយការតភ្ជាប់អ៊ីនធឺណិតមិនស្ថិរភាព ឬមានបញ្ហា |
| **ផ្ទាំងគ្រប់គ្រងការទាញយកពេញលេញ** | ប្តូរផ្ទាំងជួរទៅជាកម្មវិធីគ្រប់គ្រងពេញលេញជាងមុន រួមទាំងការប្តូរថតទីតាំងរក្សាទុកសម្រាប់ធាតុក្នុងជួរ |
| **ការទាញយកតាមកាលវិភាគ** | ចាប់ផ្តើមជួរនៅពេលវេលាកំណត់ (ដំណើរការពេលយប់) |
| **កញ្ចប់ AUR** | ដំឡើងលើ Arch Linux និង Omarchy ជាមួយ `yay -S arroxy-bin` |

មានមុខងារក្នុងចិត្តទេ? [បើកសំណើ](../../issues) — មតិសហគមន៍កំណត់អាទិភាព។

---

## <a id="support"></a>💖 គាំទ្រ Arroxy

Arroxy ឥតគិតថ្លៃ និងមានអាជ្ញាប័ណ្ណ MIT — គ្មានពាណិជ្ជកម្ម គ្មានការតាមដាន គ្មានកម្រិតបង់ប្រាក់។ ប្រសិនបើវាជួយសន្សំពេលវេលារបស់អ្នក អ្នកអាចគាំទ្រការអភិវឌ្ឍជាមួយ Bitcoin, Tron ឬ Ethereum៖ អាសយដ្ឋានមាននៅក្នុង [DONATE.md](DONATE.md) ដែលជាប្រភពផ្លូវការតែមួយគត់សម្រាប់ពួកវា។ Arroxy នឹងមិនដែលផ្ញើអាសយដ្ឋានមកអ្នកតាមអ៊ីមែល ឬសារផ្ទាល់ទេ។ ការដាក់ផ្កាយលើ repo ការរាយការណ៍កំហុស និងការកែលម្អការបកប្រែក៏ជួយបានច្រើនដូចគ្នា។

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ បង្កើតឡើងដោយ

<details>
<summary><strong>បច្ចេកវិទ្យាដែលប្រើ</strong></summary>

- **Electron** — សំបកកម្មវិធីកុំព្យូទ័រឆ្លងវេទិកា
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — រចនាប័ទ្ម
- **Zustand** — ការគ្រប់គ្រងស្ថានភាព
- **yt-dlp** + **ffmpeg** — ម៉ាស៊ីនទាញយក និង mux (ទាំងពីរត្រូវបានទាញយកនៅពេលដំណើរការ៖ yt-dlp ត្រូវបានរក្សាឱ្យទាន់សម័យ ហើយ ffmpeg/ffprobe ត្រូវបានដំឡើងម្តង ហើយរក្សាទុកឆ្លងកាត់ការធ្វើបច្ចុប្បន្នភាព)
- **Vite** + **electron-vite** — ឧបករណ៍ build
- **Vitest** + **Playwright** — តេស្តឯកតា និងតេស្តពីដើមដល់ចប់

</details>

<details>
<summary><strong>Build ពីកូដប្រភព</strong></summary>

### តម្រូវការជាមុន — គ្រប់វេទិកា

| ឧបករណ៍  | កំណែ    | ដំឡើង |
| ------- | ------- | ------- |
| Git     | ណាមួយ   | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` ឬ `.node-version` |
| Bun     | 1.4.2  | `mise install` ឬ `package.json` `packageManager` |

ណែនាំ៖ ដំឡើង `mise` បន្ទាប់មករត់ `mise install` ក្នុង checkout។ បើគ្មាន mise សូមបើក Node.js ពី `.node-version` និង Bun ពី `package.json` ដោយដៃ មុនពេល `bun run bootstrap`។

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools និង Python អាចត្រូវការសម្រាប់ការ rebuild native។

### macOS

```bash
brew install mise
xcode-select --install
```

បន្ទាប់ពី clone សូមរត់ `mise trust && mise install` ពី checkout។ ប្រសិនបើ shell របស់អ្នកប្រើ `fnm`, `nvm` ឬ Bun ពី Homebrew រួចហើយ សូមបើក mise ក្នុង `~/.zshrc` ដើម្បីឱ្យ Arroxy ទទួលបាន Node.js 24.21.0 និង Bun 1.4.2៖

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Clone និងដំណើរការ

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Build កញ្ចប់ចែកចាយ

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` ដំឡើង dependencies, rebuild dependencies កម្មវិធី Electron, ផ្ទៀងផ្ទាត់ Electron, រៀបចំ ffmpeg/ffprobe បង្កប់សម្រាប់ការអភិវឌ្ឍ និងដំឡើង Playwright Chromium។ កំណែចេញផ្សាយគ្រប់គ្រង yt-dlp, ffmpeg និង ffprobe នៅពេលដំណើរការក្នុងថតទិន្នន័យកម្មវិធីរបស់អ្នក; គ្មានមួយណាភ្ជាប់មកក្នុងកម្មវិធីដំឡើងទេ។

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

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
.\Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-linux-x64.AppImage --disable-gpu
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

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

</details>

---

## 📜 លក្ខខណ្ឌប្រើប្រាស់

Arroxy គឺជាឧបករណ៍សម្រាប់ការប្រើប្រាស់ផ្ទាល់ខ្លួន និងឯកជនតែប៉ុណ្ណោះ។ អ្នកទទួលខុសត្រូវតែម្នាក់ឯងក្នុងការធានាថាការទាញយករបស់អ្នកអនុលោមតាម [លក្ខខណ្ឌសេវាកម្ម](https://www.youtube.com/t/terms) របស់ YouTube និងច្បាប់រក្សាសិទ្ធិនៃយុត្តាធិការរបស់អ្នក។ កុំប្រើ Arroxy ដើម្បីទាញយក ផលិតឡើងវិញ ឬចែកចាយមាតិកាដែលអ្នកមិនមានសិទ្ធិប្រើ។ អ្នកអភិវឌ្ឍមិនទទួលខុសត្រូវចំពោះការប្រើប្រាស់ខុសណាមួយឡើយ។

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>អាជ្ញាប័ណ្ណ MIT · បង្កើតដោយយកចិត្តទុកដាក់ដោយ <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
