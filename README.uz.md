<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy maskoti" width="180" />

# Arroxy — Windows, macOS va Linux uchun o'rnatilgan brauzerli Bepul Ochiq Manbali YouTube (+ 2000 sayt) Yuklovchi

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**O'qing:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · **O'zbekcha** · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Reliz](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Qurish](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Veb-sayt](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Litsenziya](https://img.shields.io/badge/license-MIT-green) ![Platformalar](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Tillar](https://img.shields.io/badge/i18n-31_languages-blue)

**YouTube va 2000+ qo'llab-quvvatlanadigan saytlardan** videolar, Shorts, musiqa, kanallar, podkastlar yoki audio treklarni yuklab oling — 60 fps da 8K HDR gacha, MP3 / AAC / Opus sifatida yoki faqat kerakli qismini. Explore bo'limida **YouTube yoki boshqa istalgan saytni Arroxy ichida ko'rib chiqing** va ochiq turgan video, pleylist yoki kanalni yuklab oling; hisobingiz ko'ra oladigan yopiq, faqat a'zolar uchun va yosh chegarasi bor videolarni yuklab olish uchun u yerda tizimga kiring. Windows, macOS va Linuxda mahalliy ishlaydi. **Reklamalar yo'q, keraksiz narsalar yo'q, qo'shimcha taklif yo'q.**

[**↓ Oxirgi Relizni Yuklab Olish**](#install) &nbsp;·&nbsp; [**Veb-sayt**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows da birinchi ishga tushirish](#windows-first-launch) · [macOS da birinchi ishga tushirish](#macos-first-launch) · [Linux da birinchi ishga tushirish](#linux-first-launch)

[![Discord hamjamiyatiga qo'shiling](https://img.shields.io/badge/Discord%20hamjamiyatiga%20qo%27shiling-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Agar Arroxy vaqtingizni tejasa, ⭐ boshqalarga topishga yordam beradi.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## Mundarija

- [✨ Xususiyatlar](#features)
- [📥 O'rnatish va birinchi ishga tushirish](#install)
  - [Windows da birinchi ishga tushirish](#windows-first-launch)
  - [macOS da birinchi ishga tushirish](#macos-first-launch)
  - [Nima uchun ogohlantirish ko'rishingiz mumkin](#why-warning)
  - [Linux da birinchi ishga tushirish](#linux-first-launch)
  - [Yuklab olishingizni tekshiring (SHA256)](#verify)
- [⚖️ Nima uchun Arroxy](#why)
- [🔒 Maxfiylik](#privacy)
- [❓ Ko'p so'raladigan savollar](#faq)
- [🗺️ Yo'l xaritasi](#roadmap)
- [💖 Arroxy'ni qo'llab-quvvatlash](#support)
- [🛠️ Qurish texnologiyalari](#tech)

---

## <a id="features"></a>✨ Xususiyatlar

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>YouTube yoki boshqa istalgan saytni Arroxy ichida ko'ring va turgan sahifangizni faol profilingiz bilan yuklab oling</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore'ning birinchi ekrani</b><br/>Explore'ga qisqa nazar va nega qo'shimcha hisob xavfsizroq kirish ekani</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Yuklamalar nimaga e'tibor kerakligini aytadi</b><br/>Havolalar fonda tayyorlanadi; muvaffaqiyatsizi yechimini taklif qiladi, uzun pleylist esa tanlovingizni kutadi</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Videoning faqat bir qismini yuklab oling</b><br/>Boshlanish va tugash yoki bobni tanlang — Arroxy faqat shu oraliqni saqlaydi</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profil muharriri</b><br/>Profilni sozlang: fayl turi, ruxsat, taglavhalar, saqlash joyi, fayl nomi shabloni va boshqalar</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Qorong'i yoki yorug', shisha yoki oddiy</b><br/>Tanlash uchun to'rt ko'rinish: harakatlanuvchi osmon ustidagi shisha panellar yoki sokin oddiy sirtlar, har biri qorong'i va yorug' rejimda</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy global yuklab olish tezkor tugmasi — Windows va Linux'da Ctrl+Shift+D, macOS'da Cmd+Shift+D, nusxalangan havolani to'g'ridan-to'g'ri yuklab olish navbatiga yuboradi" width="760" /></picture><br/><sub><b>Global yuklab olish tezkor tugmasi</b><br/>Istalgan joyda havolani nusxalang, bir marta bosing — u navbatga tushadi va yuklab olina boshlaydi</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Har bir video uchun pleylist profillari</b><br/>Har bir videoga o'z profilini bering — ba'zilarini 4K'da saqlang, qolganini MP3 sifatida oling</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Tezkor yuklab olish bosh sahifasi</b><br/>URL joylang va faol profilingiz bilan darhol yuklab oling</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Qayta ishlatiladigan yuklash profillari</b><br/>Format, sifat va chiqishni shablon sifatida saqlang — har yuklashda qayta ishlating</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Ko'p tilli audio yo'llari</b><br/>Video taqdim etgan aniq audio tilini tanlang</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround / Dolby audio</b><br/>5.1 va Dolby yo'llari aniqlanadi va saqlanadi</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Ommaviy URL rejimi</b><br/>Ro'yxat joylang, nusxalarni avtomatik olib tashlang, hammasini birato'la navbatga qo'ying</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Parallel yuklash navbati</b><br/>Bir vaqtning o'zida bir nechta yuklash, jonli jarayon bilan</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: veb-saytlarni Arroxy ichida ko'rib chiqing</strong></summary>

- **Explore bo'limi** — YouTube yoki boshqa istalgan saytni Arroxy ichida ko'rib chiqing va topganingizni havola nusxalamasdan yuklab oling. **Yuklab olish · *profilingiz*** siz ko'rayotgan video, pleylist yoki kanalni navbatga qo'yadi; yonidagi o'q profilni almashtiradi, sehrli tayoqcha esa format, subtitr va boshqalarni tanlash uchun bosqichma-bosqich yuklab olishni ochadi
- **O'ng tugma bilan yuklab olish** — Explore'dagi istalgan video, pleylist yoki kanal havolasini o'ng tugma bilan bosib, uni profilingiz bilan yuklab oling, **Profil bilan yuklab olish** orqali boshqa profilni tanlang, bosqichma-bosqich yuklab olishni oching yoki havolani nusxalang. Har bir videoni avval ochish shart emas
- **Ixcham ko'rinish** — Explore asboblar panelidagi bir bosish Arroxy'ning yorliqlarini unga ko'chiradi va sahifaga ko'proq joy beradi
- **Manzil satri** — YouTube'da qidirish uchun yozing yoki istalgan veb-manzilni kiriting, shu sayt ochiladi
- **Hisob talab qiladigan yuklamalar** — Explore'da bir marta tizimga kiring, shunda Arroxy hisobingiz ko'ra oladigan yopiq va faqat a'zolar uchun videolarni, hisob yoshi tasdiqlangan bo'lsa yosh chegarali videolarni hamda “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringizni yuklab oladi. Boshqa saytlarga ham shu yerda kiring — ularning yuklamalari kerak bo'lganda shu kirishdan foydalanadi. Arroxy baribir avval tizimga kirmasdan yuklaydi va Explore orqali kirishingizdan faqat yuklab olish hisob tuzata oladigan tarzda muvaffaqiyatsiz bo'lganda foydalanadi. YouTube robot emasligingizni tasdiqlashni so'rasa, Arroxy Explore orqali kirishingizni ham sinab ko'radi
- **Qo'shimcha hisobdan foydalaning** — Explore'ning birinchi ekrani sababini tushuntiradi: hisob bilan yuklab olish o'sha hisob cheklanishi xavfini keltiradi. Kirishlaringizni unutmoqchi bo'lsangiz, istalgan payt Sozlamalardan Explore'dan chiqing
- **Reklama blokeri** — sukut bo'yicha o'chiq. Explore asboblar panelidagi qalqonni bir bossangiz, uning sahifalarida reklama va kuzatuvchilar bloklanadi, yuklab olishlarga ta'sir qilmaydi. YouTube tizimga kirgan hisoblar uchun reklama blokerlariga qarshilik qilishi mumkin

</details>

<details>
<summary><strong>🎞️ Sifat va formatlar</strong></summary>

- **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p gacha
- **Yuqori kadr tezligi va HDR** o'zgarmagan holda saqlanadi — 60 fps, HDR10
- **Audio** — faqat audioni MP3, M4A/AAC, Opus yoki WAV sifatida eksport qiling. Interaktiv yuklab olishlarda mavjud bo'lganda manbaning asl surround/Dolby treklarini (AC-3, E-AC-3, 5.1, DRC) tanlang yoki global **Surround / Dolbyni afzal ko'rish** standartini o'rnating
- **Maqsadli profillar** — *Eng yaxshi tasvir* (AV1 · VP9) yoki *Aqlli TV* (MP4 · H.264), qayta kodlashsiz Avto, MP4, MKV yoki WebM sifatida saqlanadi. HDR — *Avto* (faqat ekraningiz uni ko'rsata olsa), *SDR* yoki *HDR*
- **Har bir ruxsatda har bir kodek** — bosqichma-bosqich yuklab olish har bir ruxsat uchun AV1, VP9 va H.264 ni yonma-yon ko'rsatadi, shunda televizoringiz yoki video muharriringiz ijro eta oladiganini tanlaysiz
- **Oqim aslida qanday ekanini biling** — YouTube sun'iy intellekt yordamida kattalashtirgan o'lchamlar, sun'iy intellekt dublyaj qilgan audio tillar, yaxshilangan bitreytli oqimlar, 360° videolar hamda shikastlangan yoki suv belgili nusxalar belgilanadi. Siz ruxsat bermaguningizcha profillar sun'iy intellekt kattalashtirgan oqimlarni o'tkazib yuboradi

</details>

<details>
<summary><strong>🛡️ Maxfiylik va nazorat</strong></summary>

- 100% mahalliy qayta ishlash — yuklamalar YouTube'dan to'g'ridan-to'g'ri diskingizga boradi
- Kirish yo'q, kukilar yo'q, Google hisob bog'liq emas
- Fayllar siz tanlagan papkaga to'g'ridan-to'g'ri saqlanadi

</details>

<details>
<summary><strong>⚡ Ish oqimi</strong></summary>

- **Global yuklab olish tezkor tugmasi** — istalgan ilovada havolani nusxalang va `Ctrl+Shift+D` (macOS'da `Cmd+Shift+D`) tugmalarini bosing; Arroxy oynani ochmasdan faol profilingiz bilan uni navbatga qo'shadi va bildirishnoma buni tasdiqlaydi. Sukut bo'yicha yoqilgan, qayta tayinlash mumkin
- **Moslashuvchan boshlash rejimlari** — boshqariladigan bitta yuklab olish, playlist/kanal tanlagichi, URLlarni ommaviy joylash, saqlangan standartlar bilan Quick Download yoki Explore'da ko'rib chiqib yuklab olishni tanlang
- **Markaziy yuklab olish navbati** — bitta, playlist, bulk yoki quick ishlarning barchasi jarayon, pauza, davom ettirish, bekor qilish, qayta urinish va ustuvorlik boshqaruvi uchun bir joyga tushadi
- **Bufer kuzatish** — video havolasini nusxalang, Arroxy'ga qaytganingizda u URL maydonini to'ldiradi, xohlamagan bo'lsangiz **Bekor qilish** bor. Arroxy band bo'lsa, havola siz “URL” bo'limiga qaytguningizcha kutadi (Sozlamalarda o'chiriladi)
- **URL'larni avtomatik tozalash** — kuzatish parametrlarini olib tashlaydi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) va `youtube.com/redirect` havolalarini ochadi
- **Tray rejimi** — oynani yopish yuklamalarni fon rejimida davom ettiradi
- **31 til** — tizim tilini avtomatik aniqlaydi, istalgan vaqtda almashtirilishi mumkin
- **Pleylist sinxronlashuvi** — allaqachon yuklab olingan videolarni o'tkazib yuborish uchun pleylistni mahalliy jild bilan qayta tekshiradi; har bir video yuklanganda yangilanadigan `.m3u` pleylist faylini yaratadi
- **Tezlik va pacing boshqaruvlari** — yuklab olish bandwidthini cheklang, videoning nechta qismi bir vaqtda yuklanishini belgilang va oldindan tayyor sozlamalar (*O'chiq · Muvozanatli · Ehtiyotkor · Maxsus*) bilan so'rovlar orasiga kutish qo'shing
- **Fayl nomi shablonlari** — `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` va `{playlist_index}` yordamida yuklamalarni o‘zingiz xohlagancha nomlang, umumiy yoki har bir yuklab olish profili uchun alohida
- **Bir vaqtda yuklamalar va avtomatik qayta urinish** — navbatdagi nechta yuklama bir vaqtda ishlashini tanlang va tarmoq yoki server nosozligiga uchragan yuklamani Arroxy har urinishdan oldin uzoqroq kutib qayta urinib ko'rsin
- **Har bir video uchun pleylist profillari** — pleylistdagi har bir videoga butun ro'yxat uchun bitta sozlama o'rniga o'z yuklash profilini bering, shunda bitta bosqichda ba'zilarini to'liq sifatda saqlab, qolganlarini MP3 sifatida olish mumkin
- **Quick Download fonda ishlaydi** — havola darhol Yuklamalarda paydo bo'lib, o'sha yerda tayyorlanadi, **Ko'rish** tugmali xabar buni tasdiqlaydi va URL maydoni keyingi havola uchun tozalanadi. Oldingilari tayyorlanayotganda xohlagancha boshlang
- **Yuklamalar nimaga e'tibor kerakligini aytadi** — Arroxy havolani o'qiy olmasa, uning qatori sababini aytadi va yechimni taklif qiladi: Qayta urinish, kukilarni yoqish yoki Explore'da kirish. Kukilar o'chiq bo'lsa, **Explore orqali kirish** tizimga kirganingizdan keyin buni siz uchun qayta urinadi. Yuklash limitingizdan uzun pleylist o'z qatorida kutadi, siz hammasini, birinchilarini yoki ko'rib chiqishni tanlaysiz. Yuklamalar bo'limi sizni kutayotgan qatorlarni sanaydi
- **Videoning faqat bir qismini yuklab oling** — Format ekranida boshi va oxirini yoki bobni tanlang, Arroxy faqat shu oraliqni saqlaydi, fayl nomida video ID dan keyin oraliq ko'rsatiladi. Kesimlar eng yaqin keyframega tushadi; buning o'rniga qayta kodlash uchun aniq kesishni yoqing
- **Tugallangan yuklamalarni avtomatik olib tashlash** — ixtiyoriy: tugallangan yuklama 5 soniyadan keyin ro'yxatdan chiqadi. Fayllari diskda qoladi, muvaffaqiyatsiz yuklamalar esa ro'yxatda qoladi
- **Yuklamalarda Hajm va Yo‘q** — saralash mumkin bo'lgan **Hajm** ustuni har bir yuklama qancha joy egallashini ko'rsatadi, **Yo‘q** esa Arroxy'dan tashqarida ko'chirilgan yoki o'chirilgan fayllarni belgilaydi
- **Aurora yoki Minimalistik, qorong'i yoki yorug'** — harakatlanuvchi osmon ustidagi shisha panellar yoki sokin yaxlit sirtlar; pastki qatordan almashtiring. Grafik tezlatgichsiz kompyuterlar avtomatik ravishda Minimalistik rejimni oladi
- **Mac menyu paneli** — macOS'da menyu panelidan Sozlamalarni (`Cmd+,`) oching, yuklab olish tezligi chegarasini belgilang, uslub va mavzuni almashtiring, jurnallarni oching yoki diagnostika faylini saqlang
- **Istalgan yuklab olishdan profilni o'zgartiring** — yuklab olishni sozlang, so'ng u boshlangan profilni yangilang (nima o'zgarishini oldindan ko'rib) yoki sozlamalarni yangi profil sifatida saqlang. Profilni almashtirganda tahrirlaringizni saqlab qolish kerakmi, deb so'raladi

</details>

<details>
<summary><strong>📝 Subtitrlar va keyingi qayta ishlash</strong></summary>

- **Subtitrlar** SRT, VTT yoki ASS formatida — qo'lda yoki avtomatik yaratilgan, istalgan mavjud tilda
- Video yoniga saqlash, `.mkv` ichiga joylashtirish yoki `Subtitles/` pastki papkasiga tartibga solish
- **Faqat subtitrli to'plamlar** — URL ro'yxatini joylashtiring yoki pleylistni oching, Subtitrlar-ni tanlang va har bir video uchun faqat subtitr fayllarini oling
- **SponsorBlock** — homiylar, kirishlar, xotimalar, o'z reklamalarini o'tkazib yuborish yoki bo'limga belgilash
- **Joylashtirilgan metadata** — sarlavha, yuklash sanasi, kanal, tavsif, miniatyura va bob belgilari faylga yoziladi

</details>

<details>
<summary><strong>🌐 YouTube + 2000 sayt</strong></summary>

- **YouTube to'liq** — Videolar, Shorts, Kanallar, Pleylistlar, YouTube Music va Podkastlar birinchi darajali manbalar sifatida ishlaydi
- **2000+ boshqa saytlar** yt-dlp orqali — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable va boshqalar
- **Faqat audio va subtitrlar** har qanday qo'llab-quvvatlanadigan saytda ishlaydi, nafaqat YouTube'da
- Sayt o'zgarsa, yt-dlp har hafta tuzatishlar chiqaradi va Arroxy ishga tushganda binarni avtomatik yangilaydi

</details>

---

## <a id="install"></a>📥 O'rnatish va birinchi ishga tushirish

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

To'plamlar faqat x86_64 uchun. `curl` yo'qmi? `curl -fsSL` o'rniga `wget -qO-` ishlating.

| Platforma | Format |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Oxirgi relizni oling →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows da birinchi ishga tushirish</strong></summary>

Birinchi ishga tushirishda **"Windows protected your PC"** yoki **"Unknown publisher"** xabarini ko'rishingiz mumkin. Bu `Arroxy-win-x64-Setup.exe` va `Arroxy-win-x64-Portable.exe` ikkisiga ham tegishli. Arroxy bepul va ochiq manbali dastur bo'lib, Windows qurilmalari pulli sertifikat bilan imzolanmagan, shuning uchun SmartScreen ularni belgilaydi. Bu Arroxy xavfli ekanligini **avtomatik ravishda** anglatmaydi. Davom etish uchun:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialogi, "More info" havolasi ta'kidlangan holda" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="More info kengaytirilgandan so'ng SmartScreen dialogi, "Run anyway" tugmasi ko'rsatilgan holda" />
</div>

1. **More info** tugmasini bosing.
2. **Run anyway** tugmasini bosing.

#### Windows Defender fayl ni belgilasa yoki olib tashlasa

Defender evristikasi ba'zida imzalanmagan NSIS o'rnatuvchilari va Electron portableni shubhali deb belgilaydi. Agar Defender `Arroxy-win-x64-Setup.exe` yoki `Arroxy-win-x64-Portable.exe` ni karantinga olsa, uni **Windows Security → Virus & threat protection → Protection history** dan qayta tiklang, so'ng Arroxy bajariladigan faylini **Manage settings → Add or remove exclusions** ostida ruxsat etilgan element sifatida qo'shing. SmartScreen singari, bu ham aniqlanmagan zararli dastur emas, balki etishmayotgan nashriyotchi imzosi sababli yuzaga keladi.

> Arroxy'ni faqat rasmiy GitHub Releases sahifasidan yuklab oling. Agar faylni boshqa saytdan olgan bo'lsangiz yoki kimdir sizga yuborgan bo'lsa, uni o'chirib, rasmiy manbadan yangi nusxa yuklab oling. Manba kodi ommaviy, shuning uchun xohlasangiz o'zingiz tekshirishingiz yoki Arroxy'ni mustaqil qurishingiz mumkin.

Scoop'ni afzal ko'rasizmi? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS da birinchi ishga tushirish</strong></summary>

Arroxy hali macOS uchun kod imzolanmagan, shuning uchun Gatekeeper DMG dan o'rnatgandan keyin qo'rqinchli *"Arroxy.app is damaged and can't be opened"* dialogini ko'rsatishi mumkin. Bu xabar macOS imzolanmagan appni quarantine qilganini anglatadi; app fayllari haqiqatan shikastlanganini anglatmaydi. Hozirgi macOSlarda ishonchli tuzatish Terminal orqali:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. O'rnatilgan DMG dan `Arroxy.app` ni `/Applications` ga torting.
2. Terminalni ochib ushbu ikki buyruqni bajaring:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Birinchi buyruq o'rnatilgan Arroxy nusxasidan quarantine atributini olib tashlaydi. Ikkinchisi appni ishga tushiradi. `sudo` Mac parolingizni so'rashi mumkin; Terminal parol yozayotganingizda belgilarni ko'rsatmaydi.

**Apple Silicon va Intel:** M seriyali Mac da (M1 / M2 / M3 / M4) `arm64` DMG ni yuklab oling. Intel Mac larda `x64` DMG ni yuklab oling. Noto'g'ri qurilmani ishga tushirish Rosetta orqali ishlaydi, lekin sezilarli darajada sekinroq.

> macOS qurilmalari Apple Silicon va Intel runnerlarida CI orqali ishlab chiqariladi. Muammolarga duch kelsangiz, iltimos [muammo oching](../../issues) — macOS foydalanuvchilaridan qayta aloqa macOS test siklini faol shakllantiradi.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Nima uchun ogohlantirish ko'rishingiz mumkin</strong></summary>

Arroxy ochiq manbali va MIT litsenziyali. Windows va macOS qurilmalari **kod imzolanmagan** — Apple Developer ID va Windows EV kod imzolash sertifikatlari har biri yiliga yuzlab dollarga tushadi, buni mustaqil loyiha o'z hisobidan to'laydi. Bu imzolarsiz, Windows SmartScreen va macOS Gatekeeper birinchi ishga tushirishda ogohlantiradi. Ogohlantirishlar *operatsion tizimingiz nashriyotchini tanib olmasligini* anglatadi — bu Arroxy zararli dastur ekanligini anglatmaydi.

Arroxy ni o'zingiz tekshirishning uch yo'li, ortib boruvchi qat'iylikda:

- **Manbani o'qing.** Har bir satr [GitHub](https://github.com/antonio-orionus/Arroxy) da mavjud va siz [manbadan yaratishingiz](#tech) mumkin.
- **SHA256 ni tekshiring.** Faylingizni e'lon qilingan [`SHA256SUMS`](../../releases/latest) bilan solishtiring — pastdagi [Yuklab olishingizni tekshiring](#verify) ga qarang.
- **Uchinchi tomon skanini o'tkazing.** Faylni [VirusTotal](https://www.virustotal.com) ga yuklang.

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux da birinchi ishga tushirish</strong></summary>

AppImagelar to'g'ridan-to'g'ri ishlaydi — o'rnatish shart emas. Faqat faylni bajariladigan sifatida belgilashingiz kerak.

**Fayl menejeri:** `.AppImage` ga sichqonchaning o'ng tugmasi bilan bosing → **Xususiyatlar** → **Ruxsatlar** → **Faylni dastur sifatida bajarishga ruxsat** ni yoqing, so'ng ikki marta bosing.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Agar ishga tushirish hali ham muvaffaqiyatsiz bo'lsa, uni mount qilmasdan ishga tushiring — FUSE paketi kerak emas:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Ixtiyoriy ish stoli integratsiyasi:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ni bir marta o'rnating va siz ikki marta bosgandagi har qanday AppImage avtomatik ravishda ishga tushiruvchi menyungizga ro'yxatdan o'tkaziladi — qo'lda `.desktop` fayli talab qilinmaydi.

**Oddiy tarball (FUSE ham, o'rnatish ham kerak emas):**

`.tar.gz` to'plami — AppImage qobig'isiz o'sha ilovaning o'zi: istalgan joyga chiqaring va ishga tushiring. Na o'rnatuvchi, na FUSE paketi kerak.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Relizlar sahifasidagi Linux yuklamalari faqat x86_64 uchun.** ARM64 qurilmalarida (Raspberry Pi, Asahi Linux) Flatpak o'rnatiladi, lekin ishga tushirishda `bwrap: execvp ldconfig: Exec format error` xatosi bilan tugaydi.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Yuklab olishingizni tekshiring (SHA256)</strong></summary>

Har bir reliz binarylar bilan birga `SHA256SUMS` faylini e'lon qiladi. Yuklab olishingiz tranzit davomida buzilmagan yoki o'zgartirilmaganligini tekshirish uchun faylingizni mahalliy ravishda hashlang va `SHA256SUMS` dagi satr bilan solishtiring. Oxirgi reliz sahifasini oching → **Assets** → `SHA256SUMS` ni yuklab oling.

**Windows (PowerShell yoki Command Prompt):**

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

Uchinchi tomon zararli dastur skanini istaysizmi? Faylni [VirusTotal](https://www.virustotal.com) da yuklang. Kichik vositalardan bir nechta umumiy evristik belgilash imzalanmagan Electron ilovalar uchun odatiy holat; yirik vositalardan keng tarqalgan aniqlanishlar haqiqiy muammo bo'lar edi.

</details>

<details>
<summary><strong>📦 Windows: O'rnatuvchi va Portable taqqoslash</strong></summary>

|               | NSIS O'rnatuvchi | Portable `.exe` |
| ------------- | :----------------------: | :---------------------: |
| O'rnatish talab qilinadi | Ha  | Yo'q — istalgan joydan ishga tushiring  |
| Avtomatik yangilanishlar | ✅ ilova ichida  | ❌ qo'lda yuklab olish  |
| Ishga tushish tezligi | ✅ tezroq  | ⚠️ sekinroq sovuq ishga tushish  |
| Boshlash menyusiga qo'shadi |            ✅            |           ❌            |
| Oson o'chirish |            ✅            | ❌ faylni o'chirish  |

**Tavsiya:** avtomatik yangilanishlar va tezroq ishga tushish uchun NSIS o'rnatuvchisidan foydalaning. O'rnatishsiz, reyestrg'a ta'sir qilmaydigan variant uchun portable `.exe` dan foydalaning.

</details>

---

## <a id="why"></a>⚖️ Nima uchun Arroxy

Eng keng tarqalgan muqobillar bilan yon-yon taqqoslash:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| O'rnatilgan brauzer (ko'rib chiqish, tizimga kirish, yuklab olish) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Kukilarni eksport qilmasdan yopiq, faqat a'zolar uchun va yosh chegarali videolar |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Bepul, premium daraja yo'q |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Ochiq manba |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Faqat mahalliy qayta ishlash |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Foydalanish chegaralari yo'q |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Platformalararo desktop ilovasi |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitrlar + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = qisman yoki faqat pullik tarifda. 4K Video Downloader'da yopiq videolar uchun ilova ichida tizimga kirish pullik funksiya; ko'pchilik bepul yt-dlp GUI'lari faqat kuki faylini qabul qiladi yoki veb-brauzeringizdagi kukilarni o'qiydi.

Arroxy bir narsa uchun yaratilgan: URL'ni joylaysizmi yoki videoni Explore'da topasizmi — natijada toza mahalliy fayl. Qo'shimcha takliflar yo'q, ma'lumot to'plash yo'q.

### <a id="why-explore"></a>🧭 Oddiy yt-dlp qobig'i qila olmaydigan narsa: Explore bo'limi

Ko'pchilik bepul YouTube yuklovchilari yt-dlp ustidagi URL maydonidan iborat. Arroxy ham yt-dlp'dan foydalanadi, lekin unda **Explore** ham bor — ilovaga o'rnatilgan, YouTube yoki boshqa istalgan saytni ochadigan brauzer. Explore URL maydoni yengib o'ta olmaydigan cheklovlarni chetlab o'tadi:

- **Hisob talab qiladigan videolar, kukilarni eksport qilmasdan** — yopiq, faqat a'zolar uchun va yosh chegarali videolar (yoshi tasdiqlangan hisobda), shuningdek “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringiz hamda boshqa saytlarda tizimga kirishni talab qiladigan videolar. Oddiy qobiqqa eksport qilingan cookies.txt kerak yoki u veb-brauzeringizdagi kukilarni o'qishi shart, Windows'dagi Chrome esa endi buni bloklaydi. Arroxy'da Explore'da bir marta tizimga kirasiz, qolganini u o'zi bajaradi
- **“Robot emasligingizni tasdiqlash uchun tizimga kiring”** — YouTube buni so'raganda Arroxy xato bilan to'xtamaydi, balki Explore orqali kirishingiz bilan yuklab olishni qayta urinadi
- **YouTube yuklab olish tokeni** — Arroxy'ning o'rnatilgan brauzeri YouTube yuklab olishdan oldin kutadigan tokenni oladi. Usiz YouTube siz so'raganingizdan kamroq format va pastroq sifat berishi mumkin
- **Havola nusxalash shart emas** — Explore'da video, pleylist yoki kanalni toping va bir bosishda yuklab oling yoki sahifadagi istalgan havolani o'ng tugma bilan bosing
- **Kerak bo'lganda reklama blokeri** — qalqonni bir bossangiz, Explore sahifalarida reklama va kuzatuvchilar bloklanadi

---

## <a id="privacy"></a>🔒 Maxfiylik

Yuklamalar YouTube'dan siz tanlagan papkaga to'g'ridan-to'g'ri [yt-dlp](https://github.com/yt-dlp/yt-dlp) orqali olinadi — hech narsa uchinchi tomon server orqali yo'naltirilmaydi. Ko'rish tarixi, yuklab olish tarixi, URL'lar va fayl mazmunlari qurilmangizda qoladi.

Telemetriya yo‘q — kuniga faqat bitta anonim signal: ilova versiyasi, OS, til, o‘rnatish kanali va mamlakat, faol foydalanuvchilarni sanash uchun. ID, URL, video sarlavhasi, fayl yo‘li yoki hisob ma’lumoti yo‘q. Sozlamalarda o‘chirib qo‘yishingiz mumkin.

Explore o'z kirishini saqlaydi, brauzeringizdan alohida, va Arroxy kirish shaklini hech qachon o'qimaydi yoki to'ldirmaydi — siz Google'ning o'z sahifasiga yozasiz. Yuklab olishlar tizimga kirmasdan bajariladi; faqat biri hisob tuzata oladigan tarzda muvaffaqiyatsiz bo'lganda Arroxy kirishni o'sha payt o'qiydi, o'sha yuklab olish uchun vaqtinchalik faylda saqlaydi va keyin faylni o'chiradi. Sozlamalarda Explore'dan chiqish uni unutadi.

---

## <a id="faq"></a>❓ Ko'p so'raladigan savollar

<details>
<summary><strong>Bu haqiqatan ham bepulmi?</strong></summary>

Ha — MIT litsenziyalangan, premium daraja yo'q, xususiyat cheklash yo'q.

</details>

<details>
<summary><strong>Arroxy boshqa yt-dlp GUI'laridan nimasi bilan farq qiladi?</strong></summary>

Ko'pchilik bepul yt-dlp GUI'lari faqat havola qabul qiladigan qobiqlardir. Arroxy bunga **Explore**'ni qo'shadi — ilovaga o'rnatilgan YouTube brauzeri: havola nusxalamasdan ko'rib chiqasiz va yuklab olasiz, u yerda bir marta tizimga kirib, yopiq, faqat a'zolar uchun va yosh chegarali videolarni hamda “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringizni kukilarni eksport qilmasdan yuklab olasiz. YouTube robot emasligingizni tasdiqlashni so'raganda Arroxy shu kirishdan foydalanadi, o'rnatilgan brauzeri esa YouTube yuklab olish tokenini oladi, shuning uchun yuklab olishlar kamroq formatlarga tushib qolmaydi. [Nima uchun Arroxy](#why) bo'limiga qarang.

</details>

<details>
<summary><strong>Qanday video sifatlarini yuklab olishim mumkin?</strong></summary>

YouTube uzatadigan har qanday narsa: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p va faqat audio. 60 fps va HDR oqimlari o'zgarmagan holda saqlanadi, bosqichma-bosqich yuklab olish esa har bir ruxsatda AV1, VP9 yoki H.264 ni tanlash imkonini beradi.

</details>

<details>
<summary><strong>Faqat audioni MP3 sifatida chiqarib olishim mumkinmi?</strong></summary>

Ha. Format menyusidan *faqat audio* ni tanlang va MP3, M4A/AAC, Opus yoki WAV ni belgilang.

</details>

<details>
<summary><strong>Hisob talab qiladigan YouTube videolarini qanday yuklab olaman?</strong></summary>

Explore bo'limida bir marta tizimga kiring. Shunda Arroxy hisobingiz ko'ra oladigan yopiq va faqat a'zolar uchun videolarni, hisob yoshi tasdiqlangan bo'lsa yosh chegarali videolarni hamda “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringizni yuklab oladi. U tizimga kirishdan faqat yuklab olish hisob tuzata oladigan tarzda muvaffaqiyatsiz bo'lganda foydalanadi; qolgan hamma narsa avvalgidek yuklanadi. Bu kuki sozlamalarida birinchi turadigan va Tavsiya etiladi deb belgilangan **Explore orqali kirish** variantidir, Arroxy uni Explore'ni birinchi ochganingizda siz uchun tanlaydi. yt-dlp wiki sahifasida [tizimga kirilgan holatdagi avtomatlashtirish Google hisobini belgilashi mumkinligi haqida ogohlantirish berilgan](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), shuning uchun qo'shimcha hisob xavfsizroq tanlovdir.

</details>

<details>
<summary><strong>YouTube nimadir o'zgartirsa ham ishlashda davom etadimi?</strong></summary>

yt-dlp ishga tushirishda avtomatik yangilanadi, va YouTube biror narsani o'zgartirganda Arroxy tezlik bilan tuzatishlarni chiqaradi. YouTube robot emasligingizni tasdiqlashni so'raganda, Explore'da tizimga kirgan bo'lsangiz Arroxy Explore orqali kirishingizni ham sinab ko'radi, fayldagi yoki brauzeringizdagi kukilar esa kuki sozlamalarida mavjud.

</details>

<details>
<summary><strong>Arroxy qanday tillarda mavjud?</strong></summary>

31 til darhol mavjud: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy birinchi ishga tushirilganda operatsion tizimingiz tilini avtomatik aniqlaydi, va tilni asboblar panelidagi tanlagichdan istalgan vaqtda almashtirishingiz mumkin. Runtime locale JSON src/shared/i18n/locales/ ichida, tarjimonlar uchun PO catalog esa i18n/locales/ ichida — hissa qo‘shish uchun GitHub’da PR oching.

</details>

<details>
<summary><strong>Boshqa narsalarni o'rnatishim kerakmi?</strong></summary>

Yo‘q. yt-dlp, ffmpeg va ffprobe birinchi ishga tushirishda avtomatik yuklab olinadi va kompyuteringizda keshlanadi. Undan keyin qo‘shimcha sozlash shart emas.

</details>

<details>
<summary><strong>Playlist yoki butun kanallarni yuklab olishim mumkinmi?</strong></summary>

Ha — ikkalasi ham. Playlist yoki kanal URLini joylang (masalan, `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); nechta yozuv skanerlanishini tanlang, keyin butun ro‘yxatni navbatga qo‘ying yoki alohida videolarni tanlang. Sana oralig‘i filtrlari tez orada keladi.

</details>

<details>
<summary><strong>macOS "ilova shikastlangan" deydi — nima qilaman?</strong></summary>

Bu macOS Gatekeeper imzolanmagan appni bloklayotgani, haqiqiy shikastlanish emas. Quarantine ni olib tashlash va Arroxy ni ishga tushirish uchun Terminal buyruqlari [macOS first launch](#macos-first-launch) bo'limida.

</details>

<details>
<summary><strong>YouTube videolarini yuklab olish qonuniyimi?</strong></summary>

Shaxsiy, xususiy foydalanish uchun bu ko'pchilik yurisdiktsiyalarda umumiy qabul qilingan. Siz YouTube ning [Foydalanish Shartlari](https://www.youtube.com/t/terms) va mahalliy mualliflik huquqi qonunlariga rioya qilish uchun javobgarsiz.

</details>

---

## <a id="roadmap"></a>🗺️ Yo'l xaritasi

Hali rejalashtirilgan — taxminan ustuvorlik tartibida:

| Xususiyat    | Tavsif    |
| ---------------- | ---------------- |
| **Playlist va kanal filtrlari** | Playlist yoki kanalni ro‘yxatlashda sana oralig‘i filtrlari |
| **YouTube audio track afzalliklari** | YouTube bir nechta audio track berganda app bo'ylab og'zaki til track afzalligini sozlash va har bir profile uchun override qilish |
| **Kuchliroq retry recovery** | Ishonchsiz yoki muammoli internet connection sabab uzilgan yuklab olishlar uchun yangi retry yo'li |
| **To'liq download manager drawer** | Queue drawerni to'liqroq managerga aylantirish, queued items uchun destination folderlarni o'zgartirish bilan |
| **Rejalashtirilgan yuklab olishlar** | Navbatni belgilangan vaqtda boshlash (tunda ishlash) |
| **AUR paketi** | Arch Linux va Omarchy'ga `yay -S arroxy-bin` orqali o'rnatish |

Xayyolizda xususiyat bormi? [So'rov yuboring](../../issues) — jamiyat ishtiroki ustuvorlikni belgilaydi.

---

## <a id="support"></a>💖 Arroxy'ni qo'llab-quvvatlash

Arroxy bepul va MIT litsenziyasi ostida tarqatiladi — reklama yo'q, telemetriya yo'q, pullik versiya yo'q. Agar u vaqtingizni tejasa, ishlanmani Bitcoin, Tron yoki Ethereum orqali qo'llab-quvvatlashingiz mumkin: manzillar [DONATE.md](DONATE.md) faylida keltirilgan va bu ular uchun yagona rasmiy manbadir. Arroxy hech qachon sizga manzilni elektron pochta yoki shaxsiy xabar orqali yubormaydi. Repozitoriyga yulduzcha qo'yish, xatolar haqida xabar berish va tarjimalarni yaxshilash ham xuddi shunday yordam beradi.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Qurish texnologiyalari

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — platformlararo desktop qobig'i
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — stilizatsiya
- **Zustand** — holat boshqaruvi
- **yt-dlp** + **ffmpeg** — yuklab olish va mux mexanizmi (ikkalasi ham runtime’da olinadi: yt-dlp yangilanib turadi, ffmpeg/ffprobe esa bir marta o‘rnatiladi va yangilanishlar davomida saqlanadi)
- **Vite** + **electron-vite** — qurish vositalari
- **Vitest** + **Playwright** — birlik va uchdan-uchgacha testlar

</details>

<details>
<summary><strong>Manba koddan qurish</strong></summary>

### Talablar — barcha platformalar uchun

| Vosita  | Versiya | O'rnatish |
| ------- | ------- | --------- |
| Git     | istalgan | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` yoki `.node-version` |
| Bun     | 1.4.2  | `mise install` yoki `package.json` `packageManager` |

Tavsiya: `mise` ni o'rnating, so'ng checkout ichida `mise install` ni ishga tushiring. Mise bo'lmasa, `bun run bootstrap` dan oldin Node.js'ni `.node-version` dan va Bun'ni `package.json` dan qo'lda faollashtiring.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Mahalliy rebuildlar uchun Visual Studio Build Tools va Python kerak bo'lishi mumkin.

### macOS

```bash
brew install mise
xcode-select --install
```

Klon qilgandan so'ng checkout ichida `mise trust && mise install` ni ishga tushiring. Agar shellingiz allaqachon `fnm`, `nvm` yoki Homebrew orqali o'rnatilgan Bun ishlatsa, Arroxy Node.js 24.21.0 va Bun 1.4.2 ni olishi uchun `~/.zshrc` da mise ni faollashtiring:

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

# Build va Electron ish vaqti bog'liqliklari
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Faqat E2E testlar uchun (Electron displeyni talab qiladi)
sudo apt install -y xvfb
```

### Klonlash va ishga tushirish

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # tavsiya; pinned tools qo'lda faollashtirilgan bo'lsa o'tkazib yuboring
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer bilan Electron app
```

### Tarqatish paketini qurish

```bash
bun run build        # turni tekshirish + kompilyatsiya
bun run dist         # joriy OT uchun paketlash
bun run dist:win     # supported host'da Windows targets paketlash
```

> `bun run bootstrap` bog'liqliklarni o'rnatadi, Electron app bog'liqliklarini rebuild qiladi, Electron'ni tekshiradi, development uchun embedded ffmpeg/ffprobe tayyorlaydi va Playwright Chromium'ni o'rnatadi. Release build'larda yt-dlp, ffmpeg va ffprobe runtime'da app data folder ichida manage qilinadi; ularning hech biri installer ichida kelmaydi.

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

## 📜 Foydalanish shartlari

Arroxy faqat shaxsiy, xususiy foydalanish uchun mo'ljallangan vosita. Siz yuklab olishlaringiz YouTube ning [Foydalanish Shartlari](https://www.youtube.com/t/terms) va yurisdiktsiyangizning mualliflik huquqi qonunlariga muvofiqligini ta'minlash uchun yagona javobgarsiz. Arroxy ni foydalanish huquqingiz bo'lmagan kontentni yuklab olish, ko'paytirish yoki tarqatish uchun ishlatmang. Ishlab chiquvchilar har qanday suiiste'mollik uchun javobgar emas.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT Litsenziyasi · <a href="https://x.com/OrionusAI">@OrionusAI</a> tomonidan mehnat bilan yaratilgan</sub>
</div>
