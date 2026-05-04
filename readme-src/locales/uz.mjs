const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — platformlararo desktop qobig'i
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — stilizatsiya
- **Zustand** — holat boshqaruvi
- **yt-dlp** + **ffmpeg** — yuklab olish va mux mexanizmi (birinchi ishga tushirishda GitHubdan yuklab olinadi, har doim dolzarb)
- **Vite** + **electron-vite** — qurish vositalari
- **Vitest** + **Playwright** — birlik va uchdan-uchgacha testlar

</details>

<details>
<summary><strong>Manba koddan qurish</strong></summary>

### Talablar — barcha platformalar uchun

| Vosita | Versiya | O'rnatish |
| ------ | ------- | --------- |
| Git    | istalgan | [git-scm.com](https://git-scm.com) |
| Bun    | oxirgi  | quyidagi OT bo'yicha ko'ring |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Mahalliy qurish vositalari talab qilinmaydi — loyihada mahalliy Node qo'shimchalari yo'q.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron ish vaqti bog'liqliklari
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# Faqat E2E testlar uchun (Electron displeyni talab qiladi)
sudo apt install -y xvfb
\`\`\`

### Klonlash va ishga tushirish

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # issiq qayta yuklash bilan dev qurish
\`\`\`

### Tarqatish paketini qurish

\`\`\`bash
bun run build        # turni tekshirish + kompilyatsiya
bun run dist         # joriy OT uchun paketlash
bun run dist:win     # Windows portable exe ni cross-kompilyatsiya qilish
\`\`\`

> yt-dlp va ffmpeg paketga kiritilmagan — ular birinchi ishga tushirishda rasmiy GitHub relizlaridan yuklab olinadi va mahalliy keshlanadi.

</details>`;

export const uz = {
  icon_alt: "Arroxy maskoti",
  title: "Arroxy — Windows, macOS va Linux uchun Bepul Ochiq Manbali YouTube Yuklovchi",
  read_in_label: "O'qing:",
  badge_release_alt: "Reliz",
  badge_build_alt: "Qurish",
  badge_license_alt: "Litsenziya",
  badge_platforms_alt: "Platformalar",
  badge_i18n_alt: "Tillar",
  hero_desc:
    "Istalgan YouTube videosini, Shortni yoki audio treklarni original sifatda yuklab oling — 60 fps da 4K HDR gacha yoki MP3 / AAC / Opus sifatida. Windows, macOS va Linuxda mahalliy ishlaydi. **Reklamalar yo'q, kirish yo'q, brauzer kukilari yo'q, Google hisob bog'liq emas.**",
  cta_latest: "↓ Oxirgi Relizni Yuklab Olish",
  demo_alt: "Arroxy demosi",
  star_cta: "Agar Arroxy vaqtingizni tejasa, ⭐ boshqalarga topishga yordam beradi.",
  ai_notice: "",
  toc_heading: "Mundarija",
  why_h2: "Nima uchun Arroxy",
  nocookies_h2: "Kukilarsiz, kirish yo'q, hisob bog'liq emas",
  features_h2: "Xususiyatlar",
  dl_h2: "Yuklab olish",
  privacy_h2: "Maxfiylik",
  faq_h2: "Ko'p so'raladigan savollar",
  roadmap_h2: "Yo'l xaritasi",
  tech_h2: "Qurish texnologiyalari",
  why_intro: "Eng keng tarqalgan muqobillar bilan yon-yon taqqoslash:",
  why_r1: "Bepul, premium daraja yo'q",
  why_r2: "Ochiq manba",
  why_r3: "Faqat mahalliy qayta ishlash",
  why_r4: "Kirish yoki kuki eksporti yo'q",
  why_r5: "Foydalanish chegaralari yo'q",
  why_r6: "Platformalararo desktop ilovasi",
  why_r7: "Subtitrlar + SponsorBlock",
  why_summary:
    "Arroxy bir narsa uchun yaratilgan: URL'ni joylashtiring, toza mahalliy fayl oling. Hisoblar yo'q, qo'shimcha takliflar yo'q, ma'lumot to'plash yo'q.",
  nocookies_intro:
    "Bu desktop YouTube yuklovchilarining buzilishining eng keng tarqalgan sababi — va Arroxining mavjud bo'lishining asosiy sababi.",
  nocookies_setup:
    "YouTube bot aniqlashini yangilaganda, ko'pchilik vositalar sizdan muammo yechimi sifatida brauzerning YouTube kukilarini eksport qilishni so'raydi. Buning ikkita muammosi bor:",
  nocookies_p1:
    "Eksport qilingan seanslar odatda ~30 daqiqa ichida muddati tugaydi, shuning uchun siz doimiy ravishda qayta eksport qilasiz.",
  nocookies_p2:
    "yt-dlp'ning o'z hujjatlarida [kuki asosidagi avtomatlashtirilish Google hisobingizni belgilashi mumkinligi haqida ogohlantirish bor](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy hech qachon kuki, kirish yoki biron-bir hisob ma'lumotini so'ramaydi.** U faqat YouTube har qanday brauzerga uzatadigan ommaviy tokenlardan foydalanadi. Google shaxsiyatingizga bog'liq hech narsa yo'q, muddati tugaydigan narsa yo'q, rotatsiya qilinadigan narsa yo'q.",
  feat_quality_h3: "Sifat va formatlar",
  feat_quality_1: "**4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p gacha",
  feat_quality_2: "**Yuqori kadr tezligi** o'zgarmagan holda saqlanadi — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Faqat audio** MP3, AAC yoki Opus formatiga eksport",
  feat_quality_4: "Tezkor sozlamalar: *Eng yaxshi sifat* · *Muvozanatli* · *Kichik fayl*",
  feat_privacy_h3: "Maxfiylik va nazorat",
  feat_privacy_1:
    "100% mahalliy qayta ishlash — yuklamalar YouTube'dan to'g'ridan-to'g'ri diskingizga boradi",
  feat_privacy_2: "Kirish yo'q, kukilar yo'q, Google hisob bog'liq emas",
  feat_privacy_3: "Fayllar siz tanlagan papkaga to'g'ridan-to'g'ri saqlanadi",
  feat_workflow_h3: "Ish oqimi",
  feat_workflow_1:
    "**Istalgan YouTube URL'ini joylashtiring** — videolar va Shortlar ham qo'llab-quvvatlanadi",
  feat_workflow_2:
    "**Ko'p yuklab olish navbati** — bir nechta yuklamalarni parallel kuzatib boring",
  feat_workflow_3:
    "**Bufer kuzatish** — YouTube havolasini nusxalang va Arroxy ilovaga qaytganingizda URL'ni avtomatik to'ldiradi (Kengaytirilgan sozlamalarda o'chirish/yoqish mumkin)",
  feat_workflow_4:
    "**URL'larni avtomatik tozalash** — kuzatish parametrlarini olib tashlaydi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) va `youtube.com/redirect` havolalarini ochadi",
  feat_workflow_5:
    "**Tray rejimi** — oynani yopish yuklamalarni fon rejimida davom ettiradi",
  feat_workflow_6:
    "**9 til** — tizim tilini avtomatik aniqlaydi, istalgan vaqt almashtirish mumkin",
  feat_post_h3: "Subtitrlar va keyingi qayta ishlash",
  feat_post_1:
    "**Subtitrlar** SRT, VTT yoki ASS formatida — qo'lda yoki avtomatik yaratilgan, istalgan mavjud tilda",
  feat_post_2:
    "Video yoniga saqlash, `.mkv` ichiga joylashtirish yoki `Subtitles/` pastki papkasiga tartibga solish",
  feat_post_3:
    "**SponsorBlock** — homiylar, kirishlar, xotimalar, o'z reklamalarini o'tkazib yuborish yoki bo'limga belgilash",
  feat_post_4:
    "**Joylashtirilgan metadata** — sarlavha, yuklash sanasi, kanal, tavsif, miniatyura va bob belgilari faylga yoziladi",
  shot1_alt: "URL'ni joylashtirish",
  shot2_alt: "Sifatni tanlash",
  shot3_alt: "Saqlash joyini tanlash",
  shot4_alt: "Yuklab olish navbati ishda",
  shot5_alt: "Subtitle tili va format tanlagich",
  dl_platform_col: "Platforma",
  dl_format_col: "Format",
  dl_win_format: "O'rnatuvchi (NSIS) yoki Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` yoki `.flatpak` (qumloq muhitda)",
  dl_grab: "Oxirgi relizni oling →",
  dl_pkg_h3: "Paket menejeri orqali o'rnatish",
  dl_channel_col: "Kanal",
  dl_command_col: "Buyruq",
  dl_win_h3: "Windows: O'rnatuvchi va Portable taqqoslash",
  dl_win_col_installer: "NSIS O'rnatuvchi",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "O'rnatish talab qilinadi",
  dl_win_r1_installer: "Ha",
  dl_win_r1_portable: "Yo'q — istalgan joydan ishga tushiring",
  dl_win_r2: "Avtomatik yangilanishlar",
  dl_win_r2_installer: "✅ ilova ichida",
  dl_win_r2_portable: "❌ qo'lda yuklab olish",
  dl_win_r3: "Ishga tushish tezligi",
  dl_win_r3_installer: "✅ tezroq",
  dl_win_r3_portable: "⚠️ sekinroq sovuq ishga tushish",
  dl_win_r4: "Boshlash menyusiga qo'shadi",
  dl_win_r5: "Oson o'chirish",
  dl_win_r5_portable: "❌ faylni o'chirish",
  dl_win_rec:
    "**Tavsiya:** avtomatik yangilanishlar va tezroq ishga tushish uchun NSIS o'rnatuvchisidan foydalaning. O'rnatishsiz, reyestrg'a ta'sir qilmaydigan variant uchun portable `.exe` dan foydalaning.",
  dl_macos_h3: "macOS da birinchi ishga tushirish",
  dl_macos_warning:
    "Arroxy hali kod imzosiga ega emas, shuning uchun macOS Gatekeeper birinchi ishga tushirishda ogohlantirish ko'rsatadi. Bu kutilgan holat — bu shikastlanish belgisi emas.",
  dl_macos_m1_h4: "Tizim sozlamalari usuli (tavsiya etiladi):",
  dl_macos_step1: "Arroxy ilova belgisiga sichqonchaning o'ng tugmasi bilan bosing va **Ochish** ni tanlang.",
  dl_macos_step2:
    "Ogohlantirish dialogi paydo bo'ladi — **Bekor qilish** tugmasini bosing (*Axlat qutisiga o'tkazish* ni bosmang).",
  dl_macos_step3: "**Tizim Sozlamalari → Maxfiylik va Xavfsizlik** ni oching.",
  dl_macos_step4:
    'Pastga siljib **Xavfsizlik** bo\'limiga o\'ting. Siz *"Arroxy aniqlanmagan dasturchidan bo\'lganligi sababli ishlatish bloklangan."* degan yozuvni ko\'rasiz.',
  dl_macos_step5:
    "**Baribir ochish** tugmasini bosing va parolingiz yoki Touch ID bilan tasdiqlang.",
  dl_macos_after:
    "5-qadamdan so'ng Arroxy odatda ochiladi va ogohlantirish boshqa ko'rinmaydi.",
  dl_macos_m2_h4: "Terminal usuli (rivojlangan foydalanuvchilar uchun):",
  dl_macos_note:
    "macOS qurilmalari Apple Silicon va Intel runnerlarida CI orqali ishlab chiqariladi. Muammolarga duch kelsangiz, iltimos [muammo oching](../../issues) — macOS foydalanuvchilaridan qayta aloqa macOS test siklini faol shakllantiradi.",
  dl_linux_h3: "Linuxda birinchi ishga tushirish",
  dl_linux_intro:
    "AppImagelar to'g'ridan-to'g'ri ishlaydi — o'rnatish shart emas. Faqat faylni bajariladigan sifatida belgilashingiz kerak.",
  dl_linux_m1_text:
    "**Fayl menejeri:** `.AppImage` ga sichqonchaning o'ng tugmasi bilan bosing → **Xususiyatlar** → **Ruxsatlar** → **Faylni dastur sifatida bajarishga ruxsat** ni yoqing, so'ng ikki marta bosing.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Agar ishga tushirish hali ham muvaffaqiyatsiz bo'lsa, FUSE etishmayotgan bo'lishi mumkin:",
  dl_linux_flatpak_intro:
    "**Flatpak (qumloq muhitdagi muqobil):** xuddi shu reliz sahifasidan `Arroxy-*.flatpak` ni yuklab oling.",
  privacy_p1:
    "Yuklamalar YouTube'dan siz tanlagan papkaga to'g'ridan-to'g'ri [yt-dlp](https://github.com/yt-dlp/yt-dlp) orqali olinadi — hech narsa uchinchi tomon server orqali yo'naltirilmaydi. Ko'rish tarixi, yuklab olish tarixi, URL'lar va fayl mazmunlari qurilmangizda qoladi.",
  privacy_p2:
    "Arroxy [Aptabase](https://aptabase.com) orqali anonim, agregat telemetriya yuboradi — faqat mustaqil loyiha uchun kimdir uni haqiqatan ham ishlatayotganini ko'rish uchun yetarli (ishga tushirishlar, OT, ilova versiyasi, nosozliklar). URL'lar yo'q, video sarlavhalari yo'q, fayl yo'llari yo'q, IP yo'q, hisob ma'lumotlari yo'q — Aptabase ochiq manbali va o'z dizayni bo'yicha GDPR ga mos keladi. Sozlamalarda o'chirib qo'yishingiz mumkin.",
  faq_q1: "Bu haqiqatan ham bepulmi?",
  faq_a1: "Ha — MIT litsenziyalangan, premium daraja yo'q, xususiyat cheklash yo'q.",
  faq_q2: "Qanday video sifatlarini yuklab olishim mumkin?",
  faq_a2:
    "YouTube uzatadigan har qanday narsa: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p va faqat audio. 60 fps, 120 fps va HDR oqimlari o'zgarmagan holda saqlanadi.",
  faq_q3: "Faqat audioni MP3 sifatida chiqarib olishim mumkinmi?",
  faq_a3: "Ha. Format menyusida *faqat audio* ni tanlang va MP3, AAC yoki Opus ni tanlang.",
  faq_q4: "YouTube hisob yoki kukilar kerakmi?",
  faq_a4:
    "Yo'q. Arroxy faqat YouTube har qanday brauzerga uzatadigan ommaviy tokenlardan foydalanadi. Kukilar yo'q, kirish yo'q, saqlanadigan hisob ma'lumotlari yo'q. Buning nima uchun muhimligi haqida [Kukilarsiz, kirish yo'q, hisob bog'liq emas](#no-cookies) ga qarang.",
  faq_q5: "YouTube nimadir o'zgartirsa ham ishlashda davom etadimi?",
  faq_a5:
    "Ikki qavatli chidamlilik: yt-dlp YouTube o'zgarishlaridan bir necha soat ichida yangilanadi, Arroxy esa har ~30 daqiqada muddati tugaydigan kukilarga tayanmaydi. Bu uni eksport qilingan brauzer seanslariga bog'liq vositalardan sezilarli darajada barqarorroq qiladi.",
  faq_q6: "Arroxy qanday tillarda mavjud?",
  faq_a6:
    "To'qqizta: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Tizim tilini avtomatik aniqlaydi; istalgan vaqt asboblar panelidan almashtiring. Lokalizatsiya fayllari `src/shared/i18n/locales/` dagi oddiy TypeScript ob'ektlari — [PR'lar mamnuniyat bilan qabul qilinadi](../../pulls).",
  faq_q7: "Boshqa narsalarni o'rnatishim kerakmi?",
  faq_a7:
    "Yo'q. yt-dlp va ffmpeg birinchi ishga tushirishda rasmiy GitHub relizlaridan avtomatik yuklab olinadi va mahalliy keshlanadi.",
  faq_q8: "Playlist yoki butun kanallarni yuklab olishim mumkinmi?",
  faq_a8:
    "Hozirda faqat bitta videolar va Shortlar. Playlist va kanal qo'llab-quvvatlash [yo'l xaritasida](#roadmap).",
  faq_q9: 'macOS "ilova shikastlangan" deydi — nima qilaman?',
  faq_a9:
    "Bu macOS Gatekeeper imzalanmagan ilovani bloklayotgani, haqiqiy shikastlanish emas. Tuzatish uchun [macOS da birinchi ishga tushirish](#download) bo'limiga qarang.",
  faq_q10: "YouTube videolarini yuklab olish qonuniyimi?",
  faq_a10:
    "Shaxsiy, xususiy foydalanish uchun bu ko'pchilik yurisdiktsiyalarda umumiy qabul qilingan. Siz YouTube ning [Foydalanish Shartlari](https://www.youtube.com/t/terms) va mahalliy mualliflik huquqi qonunlariga rioya qilish uchun javobgarsiz.",
  plan_intro: "Kelayotgan — taxminan ustuvorlik tartibida:",
  plan_col1: "Xususiyat",
  plan_col2: "Tavsif",
  plan_r1_name: "**Playlist va kanal yuklab olish**",
  plan_r1_desc:
    "Playlist yoki kanal URL'ini joylashtiring; sana yoki miqdor filtrlari bilan barcha videolarni navbatga qo'shing",
  plan_r2_name: "**Toplu URL kiritish**",
  plan_r2_desc: "Bir vaqtning o'zida bir nechta URL'larni joylashtiring va ularni bitta yugurishda bajaring",
  plan_r3_name: "**Format konvertatsiyasi**",
  plan_r3_desc: "Alohida vositasiz yuklamalarni MP3, WAV, FLAC ga aylantirish",
  plan_r4_name: "**Maxsus fayl nomi shablonlari**",
  plan_r4_desc:
    "Fayllarni sarlavha, yuklovchi, sana, aniqlik bo'yicha nomlash — jonli ko'rinish bilan",
  plan_r5_name: "**Rejalashtirilgan yuklab olishlar**",
  plan_r5_desc: "Navbatni belgilangan vaqtda boshlash (tunda ishlash)",
  plan_r6_name: "**Tezlik cheklovlari**",
  plan_r6_desc: "Yuklamalar ulanishingizni to'liq egallab olmasligi uchun o'tkazish qobiliyatini cheklash",
  plan_r7_name: "**Klip qirqish**",
  plan_r7_desc: "Boshlash/tugash vaqti bo'yicha faqat bir segmentni yuklab olish",
  plan_cta:
    "Xayyolizda xususiyat bormi? [So'rov yuboring](../../issues) — jamiyat ishtiroki ustuvorlikni belgilaydi.",
  tech_content: TECH_CONTENT,
  tos_h2: "Foydalanish shartlari",
  tos_note:
    "Arroxy faqat shaxsiy, xususiy foydalanish uchun mo'ljallangan vosita. Siz yuklab olishlaringiz YouTube ning [Foydalanish Shartlari](https://www.youtube.com/t/terms) va yurisdiktsiyangizning mualliflik huquqi qonunlariga muvofiqligini ta'minlash uchun yagona javobgarsiz. Arroxy ni foydalanish huquqingiz bo'lmagan kontentni yuklab olish, ko'paytirish yoki tarqatish uchun ishlatmang. Ishlab chiquvchilar har qanday suiiste'mollik uchun javobgar emas.",
  footer_credit:
    'MIT Litsenziyasi · <a href="https://x.com/OrionusAI">@OrionusAI</a> tomonidan mehnat bilan yaratilgan',
};
