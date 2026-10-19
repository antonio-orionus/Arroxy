<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy মাসকট" width="180" />

# Arroxy — Windows, macOS ও Linux-এর জন্য বিল্ট-ইন ব্রাউজারসহ বিনামূল্যে ওপেন-সোর্স YouTube (+ ২০০০ সাইট) ডাউনলোডার

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**পড়ুন:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · **বাংলা** · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![রিলিজ](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![বিল্ড](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![ওয়েবসাইট](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![লাইসেন্স](https://img.shields.io/badge/license-MIT-green) ![প্ল্যাটফর্ম](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![ভাষাসমূহ](https://img.shields.io/badge/i18n-31_languages-blue)

**YouTube ও ২০০০+ সমর্থিত সাইট** থেকে ভিডিও, Shorts, সংগীত, চ্যানেল, পডকাস্ট বা অডিও ট্র্যাক ডাউনলোড করুন — 60 fps-এ 8K HDR পর্যন্ত, MP3 / AAC / Opus হিসেবে, অথবা শুধু যে অংশটুকু দরকার। Explore ট্যাবে **Arroxy-এর ভেতরেই YouTube বা অন্য যেকোনো সাইট ব্রাউজ করুন** এবং যে ভিডিও, প্লেলিস্ট বা চ্যানেল দেখছেন তা ডাউনলোড করুন; আপনার অ্যাকাউন্টে দেখা যায় এমন প্রাইভেট, শুধু-সদস্যদের ও বয়স-সীমাবদ্ধ ভিডিও ডাউনলোড করতে সেখানে সাইন ইন করুন। Windows, macOS ও Linux-এ লোকালি চলে। **কোনো বিজ্ঞাপন নেই, কোনো ব্লোট নেই, কোনো আপসেল নেই।**

[**↓ সর্বশেষ রিলিজ ডাউনলোড করুন**](#install) &nbsp;·&nbsp; [**ওয়েবসাইট**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows প্রথম লঞ্চ](#windows-first-launch) · [macOS প্রথম লঞ্চ](#macos-first-launch) · [Linux প্রথম লঞ্চ](#linux-first-launch)

[![Discord কমিউনিটিতে যোগ দিন](https://img.shields.io/badge/Discord%20%E0%A6%95%E0%A6%AE%E0%A6%BF%E0%A6%89%E0%A6%A8%E0%A6%BF%E0%A6%9F%E0%A6%BF%E0%A6%A4%E0%A7%87%20%E0%A6%AF%E0%A7%8B%E0%A6%97%20%E0%A6%A6%E0%A6%BF%E0%A6%A8-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Arroxy যদি আপনার সময় বাঁচায়, তাহলে একটি ⭐ অন্যদের খুঁজে পেতে সাহায্য করে।

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## বিষয়বস্তু

- [✨ বৈশিষ্ট্যসমূহ](#features)
- [📥 ইনস্টল ও প্রথম চালু](#install)
  - [Windows প্রথম লঞ্চ](#windows-first-launch)
  - [macOS প্রথম লঞ্চ](#macos-first-launch)
  - [কেন আপনি সতর্কবার্তা দেখতে পাচ্ছেন](#why-warning)
  - [Linux প্রথম লঞ্চ](#linux-first-launch)
  - [আপনার ডাউনলোড যাচাই করুন (SHA256)](#verify)
- [⚖️ কেন Arroxy](#why)
- [🔒 গোপনীয়তা](#privacy)
- [❓ সাধারণ প্রশ্নোত্তর](#faq)
- [🗺️ রোডম্যাপ](#roadmap)
- [💖 Arroxy-কে সমর্থন করুন](#support)
- [🛠️ নির্মিত হয়েছে](#tech)

---

## <a id="features"></a>✨ বৈশিষ্ট্যসমূহ

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Arroxy-এর ভেতরেই YouTube বা অন্য যেকোনো সাইট ব্রাউজ করুন এবং সক্রিয় প্রোফাইল দিয়ে বর্তমান পেজটি ডাউনলোড করুন</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore-এর প্রথম স্ক্রিন</b><br/>Explore-এর সংক্ষিপ্ত পরিচিতি, এবং সেকেন্ডারি অ্যাকাউন্ট কেন সাইন-ইনের নিরাপদ উপায়</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ডাউনলোড ট্যাব জানায় কোনটিতে আপনার দরকার</b><br/>লিংক ব্যাকগ্রাউন্ডে প্রস্তুত হয়; ব্যর্থ লিংক সমাধান দেখায়, আর লম্বা প্লেলিস্ট আপনার সিদ্ধান্তের অপেক্ষায় থাকে</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ভিডিওর শুধু একটি অংশ ডাউনলোড করুন</b><br/>শুরু ও শেষ, অথবা একটি চ্যাপ্টার বেছে নিন — Arroxy শুধু সেই অংশটুকুই সংরক্ষণ করে</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>প্রোফাইল এডিটর</b><br/>প্রোফাইল ঠিক করুন: ফাইলের ধরন, রেজোলিউশন, সাবটাইটেল, গন্তব্য, ফাইলনেম টেমপ্লেট এবং আরও অনেক কিছু</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>ডার্ক বা লাইট, গ্লাস বা সলিড</b><br/>বেছে নেওয়ার মতো চারটি লুক: চলমান আকাশের উপর কাচের প্যানেল বা শান্ত সলিড সারফেস, প্রতিটিই ডার্ক ও লাইটে</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy-এর গ্লোবাল ডাউনলোড হটকি — Windows ও Linux-এ Ctrl+Shift+D, macOS-এ Cmd+Shift+D, কপি করা লিংক সরাসরি ডাউনলোড সারিতে পাঠায়" width="760" /></picture><br/><sub><b>গ্লোবাল ডাউনলোড হটকি</b><br/>যেকোনো জায়গায় লিংক কপি করুন, একবার চাপুন — সারিতে ঢুকে ডাউনলোড শুরু</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>প্লেলিস্টের প্রতিটি আইটেমের প্রোফাইল</b><br/>প্রতিটি ভিডিওকে নিজস্ব প্রোফাইল দিন — কিছু 4K-তে সংরক্ষণ করুন, বাকিগুলো MP3 হিসেবে নিন</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>দ্রুত ডাউনলোড হোম</b><br/>একটি URL পেস্ট করুন এবং আপনার সক্রিয় প্রোফাইল দিয়ে সঙ্গে সঙ্গে ডাউনলোড করুন</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>পুনঃব্যবহারযোগ্য ডাউনলোড প্রোফাইল</b><br/>ফরম্যাট, মান ও আউটপুট প্রিসেট হিসেবে সংরক্ষণ করুন — প্রতি ডাউনলোডে পুনরায় ব্যবহার করুন</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>বহুভাষিক অডিও ট্র্যাক</b><br/>ভিডিওতে থাকা সঠিক অডিও ভাষা নির্বাচন করুন</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>সারাউন্ড / Dolby অডিও</b><br/>5.1 এবং Dolby ট্র্যাক শনাক্ত করে সংরক্ষণ করা হয়</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>বাল্ক URL মোড</b><br/>একটি তালিকা পেস্ট করুন, স্বয়ংক্রিয়ভাবে ডুপ্লিকেট সরান, সব একসাথে সারিবদ্ধ করুন</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>সমান্তরাল ডাউনলোড সারি</b><br/>লাইভ অগ্রগতিসহ একসাথে একাধিক ডাউনলোড</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: Arroxy-এর ভেতরেই ওয়েব ব্রাউজ করুন</strong></summary>

- **Explore ট্যাব** — Arroxy-এর ভেতরেই YouTube বা অন্য যেকোনো সাইট ব্রাউজ করুন এবং লিংক কপি না করেই যা পান তা ডাউনলোড করুন। **ডাউনলোড · *আপনার প্রোফাইল*** আপনি যে ভিডিও, প্লেলিস্ট বা চ্যানেল দেখছেন সেটি সারিতে যোগ করে; পাশের তীর প্রোফাইল বদলায়, আর জাদুদণ্ড ফরম্যাট, সাবটাইটেল ইত্যাদি বেছে নিতে ধাপে ধাপে ডাউনলোড খোলে
- **ডান-ক্লিকে ডাউনলোড** — Explore-এ যেকোনো ভিডিও, প্লেলিস্ট বা চ্যানেলের লিংকে ডান-ক্লিক করে আপনার প্রোফাইলে ডাউনলোড করুন, **প্রোফাইল দিয়ে ডাউনলোড** থেকে অন্য প্রোফাইল বেছে নিন, ধাপে ধাপে ডাউনলোড খুলুন, অথবা লিংক কপি করুন। প্রতিটি ভিডিও আগে খোলার দরকার নেই
- **কমপ্যাক্ট লেআউট** — Explore-এর টুলবারে এক ক্লিকে Arroxy-এর ট্যাবগুলো সেখানে চলে আসে এবং পেজ আরও জায়গা পায়
- **অ্যাড্রেস বার** — YouTube-এ খুঁজতে টাইপ করুন, অথবা যেকোনো ওয়েব ঠিকানা দিয়ে সেই সাইট খুলুন
- **অ্যাকাউন্ট লাগে এমন ডাউনলোড** — Explore-এ একবার সাইন ইন করলে Arroxy আপনার অ্যাকাউন্টে দেখা যায় এমন প্রাইভেট ও শুধু-সদস্যদের ভিডিও, বয়স যাচাই করা অ্যাকাউন্ট হলে বয়স-সীমাবদ্ধ ভিডিও, এবং আপনার Watch Later ও Liked তালিকা ডাউনলোড করতে পারে। সেখানে অন্য সাইটেও সাইন ইন করুন; প্রয়োজন হলে সেগুলোর ডাউনলোড ওই সাইন-ইন ব্যবহার করে। Arroxy এখনও আগে সাইন-আউট অবস্থাতেই ডাউনলোড করে এবং অ্যাকাউন্ট দিয়ে সমাধান করা যায় এমন কারণে ডাউনলোড ব্যর্থ হলেই কেবল আপনার Explore সাইন-ইন ব্যবহার করে। YouTube যখন আপনি যে বট নন তা নিশ্চিত করতে বলে, তখনও Arroxy আপনার Explore সাইন-ইন চেষ্টা করে
- **সেকেন্ডারি অ্যাকাউন্ট ব্যবহার করুন** — Explore-এর প্রথম স্ক্রিনে কারণটা বলা আছে: অ্যাকাউন্ট দিয়ে ডাউনলোড করলে সেই অ্যাকাউন্ট সীমাবদ্ধ হওয়ার কিছুটা ঝুঁকি থাকে। সাইন-ইনগুলো ভুলিয়ে দিতে চাইলে যেকোনো সময় সেটিংস থেকে Explore থেকে সাইন আউট করুন
- **অ্যাড ব্লকার** — ডিফল্টে বন্ধ। Explore-এর টুলবারে শিল্ডে এক ক্লিকে তার পেজে বিজ্ঞাপন ও ট্র্যাকার ব্লক হয়, ডাউনলোডে কোনো প্রভাব পড়ে না। সাইন-ইন করা অ্যাকাউন্টে YouTube অ্যাড ব্লকারে বাধা দিতে পারে

</details>

<details>
<summary><strong>🎞️ মান ও ফরম্যাট</strong></summary>

- **8K (4320p)** পর্যন্ত, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **হাই ফ্রেম রেট ও HDR** যেমন আছে তেমনই — 60 fps, HDR10
- **অডিও** — শুধু অডিও MP3, M4A/AAC, Opus বা WAV হিসেবে এক্সপোর্ট করুন। ইন্টারঅ্যাক্টিভ ডাউনলোডে, উপলভ্য হলে উৎসের নেটিভ surround/Dolby ট্র্যাক (AC-3, E-AC-3, 5.1, DRC) বেছে নিন, অথবা গ্লোবাল ডিফল্ট **সারাউন্ড / Dolby অগ্রাধিকার দিন** সেট করুন
- **লক্ষ্যভিত্তিক প্রোফাইল** — *সেরা ছবি* (AV1 · VP9) বা *স্মার্ট TV* (MP4 · H.264), পুনরায় encode না করে অটো, MP4, MKV বা WebM হিসেবে সংরক্ষিত। HDR হলো *অটো* (শুধু আপনার স্ক্রিন দেখাতে পারলে), *SDR* বা *HDR*
- **প্রতিটি রেজোলিউশনে প্রতিটি কোডেক** — ধাপে ধাপে ডাউনলোড প্রতিটি রেজোলিউশনে AV1, VP9 ও H.264 পাশাপাশি দেখায়, যাতে আপনার TV বা এডিটর যেটি চালায় সেটিই বেছে নিতে পারেন
- **জানুন স্ট্রিমটি আসলে কী** — YouTube যে সাইজগুলো AI দিয়ে আপস্কেল করেছে, AI দিয়ে ডাব করা অডিও ভাষা, উন্নত বিটরেটের স্ট্রিম, 360° ভিডিও এবং ক্ষতিগ্রস্ত বা ওয়াটারমার্কযুক্ত কপি চিহ্নিত থাকে। আপনি অনুমতি না দিলে প্রোফাইল AI দিয়ে আপস্কেল করা স্ট্রিম বাদ দেয়

</details>

<details>
<summary><strong>🛡️ গোপনীয়তা ও নিয়ন্ত্রণ</strong></summary>

- ১০০% লোকাল প্রসেসিং — ডাউনলোড সরাসরি YouTube থেকে আপনার ডিস্কে যায়
- কোনো লগইন নেই, কোনো কুকিজ নেই, কোনো Google অ্যাকাউন্ট লিঙ্ক নেই
- ফাইল সরাসরি আপনার বেছে নেওয়া ফোল্ডারে সংরক্ষিত হয়

</details>

<details>
<summary><strong>⚡ ওয়ার্কফ্লো</strong></summary>

- **গ্লোবাল ডাউনলোড হটকি** — যেকোনো অ্যাপে একটি লিংক কপি করে `Ctrl+Shift+D` (macOS-এ `Cmd+Shift+D`) চাপুন; Arroxy উইন্ডো না খুলেই আপনার সক্রিয় প্রোফাইল দিয়ে সেটি সারিতে যোগ করে এবং একটি নোটিফিকেশন তা নিশ্চিত করে। ডিফল্টে চালু, কি বদলানো যায়
- **নমনীয় শুরু মোড** — গাইডেড একক ডাউনলোড, playlist/channel picker, bulk URL paste, সংরক্ষিত ডিফল্টসহ Quick Download, অথবা Explore থেকে ব্রাউজ করে ডাউনলোড বেছে নিন
- **কেন্দ্রীয় ডাউনলোড queue** — একক, playlist, bulk, বা quick কাজ সবই progress, pause, resume, cancel, retry, এবং priority control-এর জন্য এক জায়গায় আসে
- **ক্লিপবোর্ড ওয়াচ** — একটি ভিডিও লিংক কপি করুন, Arroxy-তে ফিরলে সেটি URL ঘর পূরণ করে, আর না চাইলে **পূর্বাবস্থায় ফেরান** চাপুন। Arroxy ব্যস্ত থাকলে আপনি URL ট্যাবে না ফেরা পর্যন্ত লিংকটি অপেক্ষা করে (সেটিংসে এটি বন্ধ করুন)
- **অটো-ক্লিন URLs** — ট্র্যাকিং প্যারামিটার (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) সরিয়ে দেয় এবং `youtube.com/redirect` লিঙ্ক খুলে দেয়
- **ট্রে মোড** — উইন্ডো বন্ধ করলেও ডাউনলোড ব্যাকগ্রাউন্ডে চলতে থাকে
- **31টি ভাষা** — সিস্টেম লোকেল স্বয়ংক্রিয়ভাবে শনাক্ত করে, যেকোনো সময় বদলানো যায়
- **প্লেলিস্ট সিঙ্ক** — আগে ডাউনলোড করা ভিডিও এড়াতে একটি স্থানীয় ফোল্ডারের সঙ্গে প্লেলিস্ট আবার স্ক্যান করে; প্রতিটি ভিডিও ডাউনলোড হওয়ার সঙ্গে সঙ্গে আপডেট হওয়া একটি `.m3u` প্লেলিস্ট ফাইল তৈরি করে
- **Speed ও pacing controls** — download bandwidth সীমিত করুন, একসাথে ভিডিওর কতগুলো অংশ download হবে তা সেট করুন, এবং presets (*Off · Balanced · Careful · Custom*) দিয়ে request delay যোগ করুন
- **ফাইলের নামের টেমপ্লেট** — `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` ও `{playlist_index}` দিয়ে ডাউনলোডের নাম নিজের মতো দিন, সব ক্ষেত্রে বা প্রতিটি ডাউনলোড প্রোফাইলের জন্য আলাদা
- **একসাথে ডাউনলোড ও স্বয়ংক্রিয় পুনঃচেষ্টা** — একসাথে কতগুলো সারিবদ্ধ ডাউনলোড চলবে তা বেছে নিন, এবং নেটওয়ার্ক বা সার্ভার সমস্যায় পড়া ডাউনলোড Arroxy প্রতিটি চেষ্টার আগে আরও বেশি অপেক্ষা করে আবার চেষ্টা করুক
- **প্লেলিস্টের প্রতিটি আইটেমের জন্য প্রোফাইল** — পুরো তালিকার জন্য একটি সেটিং-এর বদলে প্লেলিস্টের প্রতিটি ভিডিওকে তার নিজস্ব ডাউনলোড প্রোফাইল দিন, যাতে একবারেই কিছু ভিডিও পূর্ণ মানে সংরক্ষণ আর বাকিগুলো MP3 হিসেবে নেওয়া যায়
- **Quick Download ব্যাকগ্রাউন্ডে চলে** — লিংকটি সঙ্গে সঙ্গে ডাউনলোড ট্যাবে দেখা যায় এবং সেখানেই প্রস্তুত হয়, **দেখুন** সহ একটি নোট তা নিশ্চিত করে, আর পরের লিংকের জন্য URL ঘর খালি হয়ে যায়। আগেরগুলো প্রস্তুত হওয়ার সময়ও যত খুশি শুরু করুন
- **ডাউনলোড ট্যাব জানায় কোনটিতে আপনার দরকার** — Arroxy কোনো লিংক পড়তে না পারলে তার এন্ট্রিতে কারণ লেখা থাকে এবং সমাধান দেওয়া হয়: আবার চেষ্টা করুন, কুকি চালু করুন, অথবা Explore-এ সাইন ইন করুন। কুকি বন্ধ থাকলে, সাইন ইন করার পর **Explore দিয়ে সাইন ইন** আপনার হয়ে সেটি আবার চেষ্টা করে। লোড সীমার চেয়ে বড় প্লেলিস্ট তার এন্ট্রিতেই অপেক্ষা করে, যাতে আপনি সব, প্রথম কয়েকটি, বা পর্যালোচনা বেছে নিতে পারেন। ডাউনলোড ট্যাব আপনার অপেক্ষায় থাকা এন্ট্রির সংখ্যা গোনে
- **ভিডিওর শুধু একটি অংশ ডাউনলোড করুন** — Format স্ক্রিনে শুরু ও শেষ, অথবা একটি চ্যাপ্টার বেছে নিন, আর Arroxy শুধু সেই অংশটুকু সংরক্ষণ করবে, ভিডিও আইডির পরে সেই সীমা দিয়ে নাম দিয়ে। কাট নিকটতম কীফ্রেমে পড়ে; বদলে পুনরায় encode করতে নিখুঁত কাট চালু করুন
- **সম্পন্ন ডাউনলোড নিজে থেকে মুছুন** — ঐচ্ছিক: সম্পন্ন হওয়া ডাউনলোড ৫ সেকেন্ড পরে তালিকা থেকে সরে যায়। এর ফাইল ডিস্কেই থাকে, আর ব্যর্থ ডাউনলোড তালিকায় থেকে যায়
- **ডাউনলোডে আকার ও অনুপস্থিত** — সাজানো যায় এমন **আকার** কলাম দেখায় প্রতিটি ডাউনলোড কতটা জায়গা নেয়, আর **অনুপস্থিত** চিহ্ন দেখায় Arroxy-এর বাইরে সরানো বা মুছে ফেলা ফাইল
- **Aurora বা মিনিমাল, ডার্ক বা লাইট** — চলমান আকাশের ওপর কাচের প্যানেল, অথবা শান্ত সলিড সারফেস; ফুটার থেকে বদলান। গ্রাফিক্স অ্যাক্সিলারেশনহীন কম্পিউটারে নিজে থেকেই মিনিমাল চালু হয়
- **Mac মেনু বার** — macOS-এ সেটিংস (`Cmd+,`) খুলুন, ডাউনলোড গতিসীমা ঠিক করুন, স্টাইল ও থিম বদলান, এবং মেনু বার থেকে লগ খুলুন বা ডায়াগনস্টিক ফাইল সংরক্ষণ করুন
- **যেকোনো ডাউনলোড থেকে প্রোফাইল বদলান** — একটি ডাউনলোডে পরিবর্তন করুন, তারপর যে প্রোফাইল থেকে এটি শুরু হয়েছিল সেটি আপডেট করুন (কী বদলাবে তার প্রিভিউসহ) অথবা সেটিংস নতুন প্রোফাইল হিসেবে সংরক্ষণ করুন। প্রোফাইল বদলালে জিজ্ঞেস করা হয় আপনার পরিবর্তনগুলো রাখবেন কি না

</details>

<details>
<summary><strong>📝 সাবটাইটেল ও পোস্ট-প্রসেসিং</strong></summary>

- **সাবটাইটেল** SRT, VTT বা ASS-এ — ম্যানুয়াল বা অটো-জেনারেটেড, যেকোনো উপলব্ধ ভাষায়
- ভিডিওর পাশে সংরক্ষণ করুন, `.mkv`-এ এম্বেড করুন, বা `Subtitles/` সাবফোল্ডারে সংগঠিত করুন
- **শুধু সাবটাইটেলের ব্যাচ** — URL-এর তালিকা পেস্ট করুন বা প্লেলিস্ট খুলুন, সাবটাইটেল বেছে নিন, আর প্রতিটি ভিডিওর জন্য শুধু ক্যাপশন ফাইল পান
- **SponsorBlock** — স্পনসর, ইন্ট্রো, আউট্রো, সেলফ-প্রোমো স্কিপ বা চ্যাপ্টার-মার্ক করুন
- **এম্বেডেড মেটাডেটা** — শিরোনাম, আপলোডের তারিখ, চ্যানেল, বিবরণ, থাম্বনেইল ও চ্যাপ্টার মার্কার ফাইলে লেখা হয়

</details>

<details>
<summary><strong>🌐 YouTube + ২০০০ সাইট</strong></summary>

- **YouTube, সম্পূর্ণ** — Videos, Shorts, Channels, Playlists, YouTube Music ও Podcasts প্রথম শ্রেণীর উৎস হিসেবে পরিচালিত হয়
- **২০০০+ অন্যান্য সাইট** yt-dlp-এর মাধ্যমে — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable এবং আরও অনেক কিছু
- **শুধু অডিও ও সাবটাইটেল** সমস্ত সমর্থিত সাইটে কাজ করে, শুধু YouTube-এ নয়
- কোনো সাইট পরিবর্তিত হলে, yt-dlp সাপ্তাহিক ফিক্স পাঠায় এবং Arroxy লঞ্চে বাইনারি অটো-আপডেট করে

</details>

---

## <a id="install"></a>📥 ইনস্টল ও প্রথম চালু

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

বিল্ড শুধুমাত্র x86_64 এর জন্য। `curl` নেই? `curl -fsSL` এর বদলে `wget -qO-` ব্যবহার করুন।

| প্ল্যাটফর্ম | ফরম্যাট |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**সর্বশেষ রিলিজ নিন →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows প্রথম লঞ্চ</strong></summary>

প্রথম চালুতে আপনি **"Windows protected your PC"** বা **"Unknown publisher."** দেখতে পারেন। এটি `Arroxy-win-x64-Setup.exe` এবং `Arroxy-win-x64-Portable.exe` উভয়ের ক্ষেত্রে প্রযোজ্য। Arroxy বিনামূল্যে ও ওপেন-সোর্স এবং Windows বিল্ডগুলো পেইড সার্টিফিকেট দিয়ে কোড-সাইন করা নয়, এ কারণে SmartScreen ফ্ল্যাগ করে। এর মানে **স্বয়ংক্রিয়ভাবে** এই নয় যে Arroxy অনিরাপদ। চালিয়ে যেতে:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" ডায়ালগ যেখানে "More info" লিঙ্কটি হাইলাইট করা" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="More info প্রসারিত করার পর SmartScreen ডায়ালগ, "Run anyway" বোতামটি দেখাচ্ছে" />
</div>

1. **More info** ক্লিক করুন।
2. **Run anyway** ক্লিক করুন।

#### Windows Defender যদি ফাইলটি ফ্ল্যাগ বা সরিয়ে দেয়

Defender হিউরিস্টিক্স কখনো কখনো আনসাইনড NSIS ইনস্টলার এবং Electron পোর্টেবলগুলোকে সন্দেহজনক হিসেবে চিহ্নিত করে। যদি Defender `Arroxy-win-x64-Setup.exe` বা `Arroxy-win-x64-Portable.exe` কোয়ারেন্টিনে রাখে, **Windows Security → Virus & threat protection → Protection history** থেকে পুনরুদ্ধার করুন, তারপর **Manage settings → Add or remove exclusions** এর অধীনে Arroxy এক্সিকিউটেবলটিকে অনুমোদিত আইটেম হিসেবে যোগ করুন। SmartScreen-এর মতোই, ট্রিগারটি হলো অনুপস্থিত প্রকাশক সিগনেচার, কোনো ম্যালওয়্যার শনাক্তি নয়।

> শুধুমাত্র অফিশিয়াল GitHub Releases পেজ থেকে Arroxy ডাউনলোড করুন। অন্য ওয়েবসাইট থেকে পেলে বা কেউ পাঠালে সেটি মুছে ফেলুন এবং অফিশিয়াল সোর্স থেকে নতুন করে ডাউনলোড করুন। সোর্স কোড পাবলিক, তাই ইচ্ছে করলে আপনি নিজে পরীক্ষা করতে বা Arroxy বিল্ড করতে পারবেন।

Scoop পছন্দ করেন? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS প্রথম লঞ্চ</strong></summary>

Arroxy এখনও macOS-এর জন্য কোড-সাইন করা নয়, তাই DMG থেকে ইনস্টল করার পরে Gatekeeper ভয়ের *"Arroxy.app is damaged and can't be opened"* ডায়ালগ দেখাতে পারে। এর মানে macOS একটি unsigned app-কে quarantine করেছে; অ্যাপ ফাইল সত্যিই ক্ষতিগ্রস্ত, এমন নয়। বর্তমান macOS-এ নির্ভরযোগ্য সমাধান Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. মাউন্ট করা DMG থেকে `Arroxy.app` টেনে `/Applications`-এ রাখুন।
2. Terminal খুলে এই দুইটি command চালান:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

প্রথম command আপনার ইনস্টল করা Arroxy copy থেকে quarantine attribute সরায়। দ্বিতীয়টি app চালু করে। `sudo` আপনার Mac password চাইতে পারে; Terminal password টাইপ করার সময় অক্ষর দেখাবে না।

**Apple Silicon বনাম Intel:** M-সিরিজ Mac (M1 / M2 / M3 / M4)-এ `arm64` DMG ডাউনলোড করুন। Intel Mac-এ `x64` DMG ডাউনলোড করুন। ভুল বিল্ড চালানো Rosetta-র মাধ্যমে কাজ করবে তবে উল্লেখযোগ্যভাবে ধীর হবে।

> macOS বিল্ডগুলো CI-তে Apple Silicon ও Intel রানারে তৈরি হয়। সমস্যা হলে [একটি ইস্যু খুলুন](../../issues) — macOS ব্যবহারকারীদের মতামত সক্রিয়ভাবে macOS টেস্টিং চক্রকে রূপ দেয়।

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ কেন আপনি সতর্কবার্তা দেখতে পাচ্ছেন</strong></summary>

Arroxy ওপেন-সোর্স এবং MIT-লাইসেন্সকৃত। Windows এবং macOS বিল্ডগুলো **কোড-সাইন করা নয়** — Apple Developer ID এবং Windows EV কোড-সাইনিং সার্টিফিকেটের প্রতিটির জন্য বছরে কয়েকশো ডলার খরচ হয়, যা একটি ইন্ডি প্রজেক্ট নিজের পকেট থেকে দেয়। এই সিগনেচার ছাড়া, Windows SmartScreen এবং macOS Gatekeeper প্রথম লঞ্চে আপনাকে সতর্ক করবে। সতর্কবার্তার মানে হলো *আপনার OS প্রকাশকটিকে চেনে না* — এর মানে এই নয় যে Arroxy ম্যালওয়্যার।

তিনটি উপায়ে নিজেই Arroxy যাচাই করুন, ক্রমবর্ধমান কঠোরতায়:

- **সোর্স পড়ুন।** প্রতিটি লাইন [GitHub](https://github.com/antonio-orionus/Arroxy)-এ আছে এবং আপনি [সোর্স থেকে বিল্ড করতে](#tech) পারবেন।
- **SHA256 মিলিয়ে দেখুন।** প্রকাশিত [`SHA256SUMS`](../../releases/latest) এর সাথে আপনার ফাইল মেলান — নিচে [আপনার ডাউনলোড যাচাই করুন](#verify) দেখুন।
- **তৃতীয়-পক্ষ স্ক্যান চালান।** ফাইলটি [VirusTotal](https://www.virustotal.com)-এ আপলোড করুন।

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux প্রথম লঞ্চ</strong></summary>

AppImage সরাসরি চলে — কোনো ইনস্টলেশন নেই। শুধু ফাইলটিকে এক্সিকিউটেবল হিসেবে চিহ্নিত করতে হবে।

**ফাইল ম্যানেজার:** `.AppImage`-এ রাইট-ক্লিক → **Properties** → **Permissions** → **Allow executing file as program** সক্রিয় করুন, তারপর ডাবল-ক্লিক করুন।

**টার্মিনাল:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

তারপরও চালু না হলে, মাউন্ট ছাড়াই চালান — FUSE প্যাকেজ লাগবে না:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**ঐচ্ছিক ডেস্কটপ ইন্টিগ্রেশন:** একবার [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ইনস্টল করুন, এবং আপনি যেকোনো AppImage ডাবল-ক্লিক করলে স্বয়ংক্রিয়ভাবে আপনার লঞ্চার মেনুতে নিবন্ধিত হবে — কোনো ম্যানুয়াল `.desktop` ফাইল দরকার নেই।

**সাধারণ টারবল (FUSE নেই, ইনস্টল নেই):**

`.tar.gz` বিল্ডটি একই অ্যাপ, শুধু AppImage মোড়ক ছাড়া — যেকোনো জায়গায় এক্সট্র্যাক্ট করে চালান। ইনস্টলারও লাগে না, FUSE প্যাকেজও নয়।

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**রিলিজ পেজের Linux ডাউনলোড শুধু x86_64-এর জন্য।** ARM64 মেশিনে (Raspberry Pi, Asahi Linux) Flatpak ইনস্টল হয় ঠিকই, কিন্তু চালু করার সময় `bwrap: execvp ldconfig: Exec format error` দিয়ে ব্যর্থ হয়।

</details>

<details>
<summary><strong><a id="verify"></a>🔐 আপনার ডাউনলোড যাচাই করুন (SHA256)</strong></summary>

প্রতিটি রিলিজ বাইনারির পাশাপাশি একটি `SHA256SUMS` ফাইল প্রকাশ করে। আপনার ডাউনলোড ট্রানজিটে নষ্ট বা টেম্পার করা হয়নি তা পরীক্ষা করতে, আপনার ফাইলটি স্থানীয়ভাবে হ্যাশ করুন এবং `SHA256SUMS`-এর লাইনের সাথে মেলান। সর্বশেষ রিলিজ পেজ খুলুন → **Assets** → `SHA256SUMS` ডাউনলোড করুন।

**Windows (PowerShell বা Command Prompt):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

তৃতীয়-পক্ষ ম্যালওয়্যার স্ক্যান চান? [VirusTotal](https://www.virustotal.com)-এ ফাইলটি আপলোড করুন। ছোট ইঞ্জিনগুলো থেকে কিছু জেনেরিক-হিউরিস্টিক ফ্ল্যাগ আনসাইনড Electron অ্যাপের জন্য স্বাভাবিক; প্রধান ইঞ্জিনগুলো থেকে ব্যাপক শনাক্তি সত্যিকারের উদ্বেগের কারণ হবে।

</details>

<details>
<summary><strong>📦 Windows: ইনস্টলার বনাম পোর্টেবল</strong></summary>

|               | NSIS ইনস্টলার | পোর্টেবল `.exe` |
| ------------- | :----------------------: | :---------------------: |
| ইনস্টলেশন প্রয়োজন | হ্যাঁ  | না — যেকোনো জায়গা থেকে চালান  |
| অটো-আপডেট | ✅ অ্যাপের মধ্যে  | ❌ ম্যানুয়াল ডাউনলোড  |
| স্টার্টআপ গতি | ✅ দ্রুততর  | ⚠️ কোল্ড স্টার্ট ধীর  |
| স্টার্ট মেনুতে যোগ করে |            ✅            |           ❌            |
| সহজ আনইনস্টল |            ✅            | ❌ ফাইলটি মুছে দিন  |

**সুপারিশ:** অটো-আপডেট ও দ্রুত স্টার্টআপের জন্য NSIS ইনস্টলার ব্যবহার করুন। ইনস্টলেশন ও রেজিস্ট্রি-মুক্ত বিকল্পের জন্য পোর্টেবল `.exe` ব্যবহার করুন।

</details>

---

## <a id="why"></a>⚖️ কেন Arroxy

সবচেয়ে সাধারণ বিকল্পগুলির সাথে পাশাপাশি তুলনা:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| বিল্ট-ইন ব্রাউজার (ব্রাউজ, সাইন ইন, ডাউনলোড) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| কুকি এক্সপোর্ট না করেই প্রাইভেট, শুধু-সদস্যদের ও বয়স-সীমাবদ্ধ ভিডিও |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| বিনামূল্যে, কোনো প্রিমিয়াম টায়ার নেই |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| ওপেন সোর্স |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| শুধুমাত্র লোকাল প্রসেসিং |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| কোনো ব্যবহারের সীমা নেই |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| ক্রস-প্ল্যাটফর্ম ডেস্কটপ অ্যাপ |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| সাবটাইটেল + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = আংশিকভাবে, বা শুধু পেইড টায়ারে। প্রাইভেট ভিডিওর জন্য 4K Video Downloader-এর অ্যাপের ভেতরের সাইন-ইন একটি পেইড ফিচার; বেশিরভাগ ফ্রি yt-dlp GUI শুধু একটি কুকি ফাইল নেয় বা আপনার ওয়েব ব্রাউজারের কুকি পড়ে।

Arroxy একটি কাজের জন্যই তৈরি: একটি পরিষ্কার লোকাল ফাইল, আপনি URL পেস্ট করুন বা Explore-এ ভিডিওটি খুঁজে নিন। কোনো আপসেল নেই, কোনো ডেটা সংগ্রহ নেই।

### <a id="why-explore"></a>🧭 সাধারণ yt-dlp র‍্যাপার যা পারে না: Explore ট্যাব

বেশিরভাগ ফ্রি YouTube ডাউনলোডার আসলে yt-dlp-এর ওপর বসানো একটি URL বক্স মাত্র। Arroxy-ও yt-dlp ব্যবহার করে, তবে এতে আছে **Explore** — অ্যাপের ভেতরেই তৈরি একটি ব্রাউজার, যা YouTube বা অন্য যেকোনো সাইট খুলতে পারে। Explore এমন সব সীমা পেরিয়ে যায়, যা একটি URL বক্স পারে না:

- **অ্যাকাউন্ট লাগে এমন ভিডিও, কুকি এক্সপোর্ট ছাড়াই** — প্রাইভেট, শুধু-সদস্যদের ও বয়স-সীমাবদ্ধ ভিডিও (বয়স যাচাই করা অ্যাকাউন্টে), সঙ্গে আপনার Watch Later ও Liked তালিকা, এবং অন্য সাইটে সাইন-ইনের পেছনে থাকা ভিডিও। সাধারণ র‍্যাপারের জন্য একটি cookies.txt এক্সপোর্ট লাগে, অথবা সেটিকে আপনার ওয়েব ব্রাউজারের কুকি পড়তে হয়, যা Windows-এ Chrome এখন ব্লক করে। Arroxy-তে আপনি Explore-এ একবার সাইন ইন করেন, বাকিটা সে নিজেই সামলায়
- **"আপনি বট নন তা নিশ্চিত করতে সাইন ইন করুন"** — YouTube এটি জানতে চাইলে Arroxy ব্যর্থ না হয়ে আপনার Explore সাইন-ইন দিয়ে ডাউনলোডটি আবার চেষ্টা করে
- **YouTube-এর ডাউনলোড টোকেন** — ডাউনলোডের আগে YouTube যে টোকেন আশা করে, Arroxy-এর বিল্ট-ইন ব্রাউজার সেটি সংগ্রহ করে। এটি ছাড়া YouTube আপনার চাওয়ার চেয়ে কম ফরম্যাট ও কম মানের ভিডিও দিতে পারে
- **লিংক কপি করার ঝামেলা নেই** — Explore-এ একটি ভিডিও, প্লেলিস্ট বা চ্যানেল খুঁজে এক ক্লিকে ডাউনলোড করুন, অথবা পেজের যেকোনো লিংকে ডান-ক্লিক করুন
- **চাইলে অ্যাড ব্লকার** — শিল্ডে এক ক্লিকে Explore তার পেজে বিজ্ঞাপন ও ট্র্যাকার ব্লক করে

---

## <a id="privacy"></a>🔒 গোপনীয়তা

ডাউনলোডগুলো সরাসরি [yt-dlp](https://github.com/yt-dlp/yt-dlp)-এর মাধ্যমে YouTube থেকে আপনার বেছে নেওয়া ফোল্ডারে আনা হয় — কোনো থার্ড-পার্টি সার্ভারের মধ্য দিয়ে যায় না। দেখার ইতিহাস, ডাউনলোড ইতিহাস, URL ও ফাইলের বিষয়বস্তু আপনার ডিভাইসেই থাকে।

কোনো টেলিমেট্রি নেই — দিনে শুধু একটি বেনামী সিগন্যাল: অ্যাপ সংস্করণ, OS, ভাষা, ইনস্টল চ্যানেল ও দেশ, যাতে আমরা সক্রিয় ব্যবহারকারী গুনতে পারি। কোনো ID, URL, ভিডিও শিরোনাম, ফাইল পাথ বা অ্যাকাউন্ট তথ্য নেই। সেটিংসে এটি বন্ধ করতে পারবেন।

Explore ব্রাউজার থেকে আলাদা তার নিজস্ব সাইন-ইন রাখে, এবং Arroxy কখনও সাইন-ইন ফর্ম পড়ে না বা পূরণ করে না — আপনি Google-এর নিজের পেজেই টাইপ করেন। ডাউনলোড সাইন-আউট অবস্থায় চলে; অ্যাকাউন্ট দিয়ে সমাধান করা যায় এমন কারণে কোনো ডাউনলোড ব্যর্থ হলেই কেবল Arroxy সাইন-ইনটি নতুন করে পড়ে, সেই ডাউনলোডের জন্য একটি অস্থায়ী ফাইলে রাখে এবং পরে ফাইলটি মুছে দেয়। সেটিংসে Explore থেকে সাইন আউট করলে সাইন-ইন ভুলে যায়।

---

## <a id="faq"></a>❓ সাধারণ প্রশ্নোত্তর

<details>
<summary><strong>এটি কি সত্যিই বিনামূল্যে?</strong></summary>

হ্যাঁ — MIT লাইসেন্স, কোনো প্রিমিয়াম টায়ার নেই, কোনো ফিচার গেটিং নেই।

</details>

<details>
<summary><strong>অন্যান্য yt-dlp GUI থেকে Arroxy কীভাবে আলাদা?</strong></summary>

বেশিরভাগ ফ্রি yt-dlp GUI এমন র‍্যাপার, যা শুধু একটি লিংক নেয়। Arroxy যোগ করে **Explore**, অ্যাপের ভেতরেই তৈরি একটি YouTube ব্রাউজার: লিংক কপি না করেই ব্রাউজ ও ডাউনলোড করুন, আর সেখানে একবার সাইন ইন করে প্রাইভেট, শুধু-সদস্যদের ও বয়স-সীমাবদ্ধ ভিডিও এবং আপনার Watch Later ও Liked তালিকা ডাউনলোড করুন, কোনো কুকি এক্সপোর্ট ছাড়াই। YouTube যখন আপনি বট নন তা নিশ্চিত করতে বলে, Arroxy তখন সেই সাইন-ইন ব্যবহার করে, আর এর বিল্ট-ইন ব্রাউজার YouTube-এর ডাউনলোড টোকেন সংগ্রহ করে, যাতে ডাউনলোড কম ফরম্যাটে নেমে না যায়। দেখুন [কেন Arroxy](#why)।

</details>

<details>
<summary><strong>আমি কোন ভিডিও মানে ডাউনলোড করতে পারব?</strong></summary>

YouTube যা দেয় সব কিছু: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, এবং শুধু অডিও। 60 fps ও HDR স্ট্রিম যেমন আছে তেমনই রাখা হয়, আর ধাপে ধাপে ডাউনলোডে প্রতিটি রেজোলিউশনে AV1, VP9 বা H.264 বেছে নিতে পারেন।

</details>

<details>
<summary><strong>আমি কি শুধু অডিও MP3 হিসেবে বের করতে পারব?</strong></summary>

হ্যাঁ। format মেনু থেকে *শুধু অডিও* বেছে নিন, তারপর MP3, M4A/AAC, Opus বা WAV নির্বাচন করুন।

</details>

<details>
<summary><strong>YouTube অ্যাকাউন্ট লাগে এমন ভিডিও আমি কীভাবে ডাউনলোড করব?</strong></summary>

Explore ট্যাবে একবার সাইন ইন করুন। এরপর Arroxy আপনার অ্যাকাউন্টে দেখা যায় এমন প্রাইভেট ও শুধু-সদস্যদের ভিডিও, বয়স যাচাই করা অ্যাকাউন্ট হলে বয়স-সীমাবদ্ধ ভিডিও, এবং আপনার Watch Later ও Liked তালিকা ডাউনলোড করতে পারে। অ্যাকাউন্ট দিয়ে সমাধান করা যায় এমন কারণে ডাউনলোড ব্যর্থ হলেই কেবল Arroxy সেই সাইন-ইন ব্যবহার করে; বাকি সব আগের মতোই ডাউনলোড হয়। কুকি সেটিংসে এটিই **Explore সাইন-ইন** বিকল্প, যা তালিকার প্রথমে এবং "প্রস্তাবিত" চিহ্নিত, আর প্রথমবার Explore খোলার সময় Arroxy নিজেই এটি বেছে নেয়। yt-dlp-এর উইকি উল্লেখ করে যে [সাইন-ইন করা অটোমেশন একটি Google অ্যাকাউন্টকে ফ্ল্যাগ করতে পারে](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); তাই সেকেন্ডারি অ্যাকাউন্টই নিরাপদ পছন্দ।

</details>

<details>
<summary><strong>YouTube কিছু পরিবর্তন করলেও কি এটি কাজ করতে থাকবে?</strong></summary>

yt-dlp চালুর সময় স্বয়ংক্রিয়ভাবে আপডেট হয়, এবং YouTube কিছু পরিবর্তন করলে Arroxy দ্রুত ফিক্স পাঠায়। YouTube যখন আপনি বট নন তা নিশ্চিত করতে বলে, তখন আপনি Explore-এ সাইন ইন করে থাকলে Arroxy আপনার Explore সাইন-ইনও চেষ্টা করে, আর কুকি সেটিংসে ফাইল বা ব্রাউজার থেকে কুকিও ব্যবহার করা যায়।

</details>

<details>
<summary><strong>Arroxy কোন ভাষায় পাওয়া যায়?</strong></summary>

শুরু থেকেই 31টি ভাষা: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文। Arroxy প্রথম চালুর সময় আপনার অপারেটিং সিস্টেমের ভাষা স্বয়ংক্রিয়ভাবে শনাক্ত করে, এবং টুলবারের ভাষা পিকার থেকে যেকোনো সময় বদলানো যায়। Runtime locale JSON থাকে src/shared/i18n/locales/ এ, আর অনুবাদকদের জন্য PO catalog থাকে i18n/locales/ এ — অবদান রাখতে GitHub-এ PR খুলুন।

</details>

<details>
<summary><strong>আমাকে কি আর কিছু ইনস্টল করতে হবে?</strong></summary>

না। yt-dlp, ffmpeg ও ffprobe প্রথম চালুতে স্বয়ংক্রিয়ভাবে ডাউনলোড হয়ে আপনার মেশিনে ক্যাশ হয়। এরপর কোনো অতিরিক্ত সেটআপ দরকার নেই।

</details>

<details>
<summary><strong>আমি কি প্লেলিস্ট বা পুরো চ্যানেল ডাউনলোড করতে পারব?</strong></summary>

হ্যাঁ — দুটোই। playlist বা channel URL paste করুন (যেমন `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); কতগুলো entry scan হবে তা বেছে নিন, তারপর পুরো তালিকা queue করুন বা নির্দিষ্ট video বেছে নিন। date-range filters শিগগির আসছে।

</details>

<details>
<summary><strong>macOS বলছে "অ্যাপটি ক্ষতিগ্রস্ত" — আমি কী করব?</strong></summary>

এটি macOS Gatekeeper একটি unsigned app ব্লক করছে, আসল ক্ষতি নয়। quarantine সরিয়ে Arroxy চালু করার Terminal commands দেখতে [macOS first launch](#macos-first-launch) দেখুন।

</details>

<details>
<summary><strong>YouTube ভিডিও ডাউনলোড করা কি বৈধ?</strong></summary>

ব্যক্তিগত, ব্যক্তিগত ব্যবহারের জন্য এটি বেশিরভাগ এখতিয়ারে সাধারণত গ্রহণযোগ্য। YouTube-এর [Terms of Service](https://www.youtube.com/t/terms) ও আপনার স্থানীয় কপিরাইট আইন মেনে চলা আপনার দায়িত্ব।

</details>

---

## <a id="roadmap"></a>🗺️ রোডম্যাপ

এখনও পরিকল্পনায় আছে — মোটামুটি অগ্রাধিকারের ক্রমে:

| বৈশিষ্ট্য    | বিবরণ    |
| ---------------- | ---------------- |
| **প্লেলিস্ট ও চ্যানেল ফিল্টার** | playlist বা channel enumerate করার সময় date-range filters |
| **YouTube অডিও ট্র্যাক পছন্দ** | YouTube একাধিক অডিও ট্র্যাক দিলে পুরো app-এর জন্য কথ্য-ভাষার track preference সেট করুন, আর প্রতিটি profile-এ override করুন |
| **আরও শক্তিশালী রিট্রাই রিকভারি** | অবিশ্বস্ত বা সমস্যাযুক্ত ইন্টারনেট সংযোগে বাধাগ্রস্ত ডাউনলোডের জন্য নতুন রিট্রাই পথ |
| **পূর্ণ ডাউনলোড ম্যানেজার ড্রয়ার** | কিউ ড্রয়ারকে আরও পূর্ণ ম্যানেজারে পরিণত করা, queued আইটেমের destination folder বদলানোসহ |
| **নির্ধারিত সময়ে ডাউনলোড** | নির্দিষ্ট সময়ে কিউ শুরু করুন (রাতভর রান) |
| **AUR প্যাকেজ** | `yay -S arroxy-bin` দিয়ে Arch Linux ও Omarchy-তে ইনস্টল করুন |

মাথায় কোনো বৈশিষ্ট্য আছে? [একটি অনুরোধ খুলুন](../../issues) — কমিউনিটির মতামত অগ্রাধিকার নির্ধারণ করে।

---

## <a id="support"></a>💖 Arroxy-কে সমর্থন করুন

Arroxy বিনামূল্যের এবং MIT লাইসেন্সপ্রাপ্ত — কোনো বিজ্ঞাপন নেই, টেলিমেট্রি নেই, পেইড সংস্করণ নেই। এটি যদি আপনার সময় বাঁচায়, তাহলে আপনি Bitcoin, Tron বা Ethereum দিয়ে এর উন্নয়নে সহায়তা করতে পারেন: ঠিকানাগুলো [DONATE.md](DONATE.md)-এ রয়েছে, যা এগুলোর একমাত্র আনুষ্ঠানিক উৎস। Arroxy কখনোই আপনাকে ইমেল বা সরাসরি বার্তায় ঠিকানা পাঠাবে না। রিপোতে স্টার দেওয়া, বাগ রিপোর্ট করা এবং অনুবাদ উন্নত করাও সমান সহায়ক।

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ নির্মিত হয়েছে

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — ক্রস-প্ল্যাটফর্ম ডেস্কটপ শেল
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — স্টাইলিং
- **Zustand** — স্টেট ম্যানেজমেন্ট
- **yt-dlp** + **ffmpeg** — ডাউনলোড ও মাক্স ইঞ্জিন (দুটোই রানটাইমে আনা হয়: yt-dlp আপ টু ডেট রাখা হয়, ffmpeg/ffprobe একবার ইনস্টল হয়ে আপডেটের পরও থেকে যায়)
- **Vite** + **electron-vite** — বিল্ড টুলিং
- **Vitest** + **Playwright** — ইউনিট ও এন্ড-টু-এন্ড টেস্ট

</details>

<details>
<summary><strong>সোর্স থেকে বিল্ড করুন</strong></summary>

### সব প্ল্যাটফর্মের জন্য পূর্বশর্ত

| টুল    | ভার্সন     | ইনস্টল |
| ------- | ------- | ------- |
| Git     | যেকোনো  | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` অথবা `.node-version` |
| Bun     | 1.4.2  | `mise install` অথবা `package.json` `packageManager` |

সুপারিশ: `mise` ইনস্টল করুন, তারপর checkout-এ `mise install` চালান। mise না ব্যবহার করলে `bun run bootstrap` চালানোর আগে `.node-version` থেকে Node.js এবং `package.json` থেকে Bun ম্যানুয়ালি সক্রিয় করুন।

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

নেটিভ rebuilds-এর জন্য Visual Studio Build Tools এবং Python দরকার হতে পারে।

### macOS

```bash
brew install mise
xcode-select --install
```

ক্লোন করার পরে checkout থেকে `mise trust && mise install` চালান। আপনার shell যদি আগে থেকেই `fnm`, `nvm`, অথবা Homebrew Bun ব্যবহার করে, তাহলে `~/.zshrc`-এ mise সক্রিয় করুন যাতে Arroxy Node.js 24.21.0 এবং Bun 1.4.2 ব্যবহার করে:

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

# build এবং Electron রানটাইম ডিপেন্ডেন্সি
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# শুধুমাত্র E2E টেস্টের জন্য (Electron-এর ডিসপ্লে দরকার)
sudo apt install -y xvfb
```

### ক্লোন করুন ও চালান

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # সুপারিশকৃত; pinned tools ম্যানুয়ালি সক্রিয় থাকলে বাদ দিন
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer সহ Electron app
```

### ডিস্ট্রিবিউটেবল বিল্ড করুন

```bash
bun run build        # টাইপচেক + কম্পাইল
bun run dist         # বর্তমান OS-এর জন্য প্যাকেজ করুন
bun run dist:win     # supported host-এ Windows targets প্যাকেজ করুন
```

> `bun run bootstrap` dependencies ইনস্টল করে, Electron app dependencies rebuild করে, Electron যাচাই করে, development-এর জন্য embedded ffmpeg/ffprobe প্রস্তুত করে, এবং Playwright Chromium ইনস্টল করে। Release build-এ yt-dlp, ffmpeg ও ffprobe runtime-এ app data folder-এ manage হয়; এগুলোর কোনোটিই installer-এর ভেতরে থাকে না।

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

## 📜 ব্যবহারের শর্তাবলী

Arroxy শুধুমাত্র ব্যক্তিগত, ব্যক্তিগত ব্যবহারের জন্য একটি টুল। আপনার ডাউনলোড YouTube-এর [Terms of Service](https://www.youtube.com/t/terms) ও আপনার এখতিয়ারের কপিরাইট আইন মেনে চলছে কিনা তা নিশ্চিত করা সম্পূর্ণরূপে আপনার দায়িত্ব। এমন বিষয়বস্তু ডাউনলোড, পুনরুৎপাদন বা বিতরণ করতে Arroxy ব্যবহার করবেন না যা ব্যবহার করার অধিকার আপনার নেই। ডেভেলপাররা যেকোনো অপব্যবহারের জন্য দায়ী নন।

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT লাইসেন্স · <a href="https://x.com/OrionusAI">@OrionusAI</a>-এর যত্ন দিয়ে তৈরি</sub>
</div>
