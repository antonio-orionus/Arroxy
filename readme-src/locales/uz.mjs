const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — platformlararo desktop qobig'i
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — stilizatsiya
- **Zustand** — holat boshqaruvi
- **yt-dlp** + **ffmpeg** — yuklab olish va mux mexanizmi (yt-dlp runtime’da olinadi; ffmpeg/ffprobe build vaqtida qo‘shiladi)
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

> yt-dlp birinchi ishga tushirishda GitHub’dan olinadi va ilova ma’lumotlari papkasida keshlanadi. ffmpeg va ffprobe har bir Arroxy relizi bilan birga keladi.

</details>`;

export const uz = {
  icon_alt: "Arroxy maskoti",
  title: "Arroxy — Windows, macOS va Linux uchun Bepul Ochiq Manbali YouTube (+ 2000 sayt) Yuklovchi",
  read_in_label: "O'qing:",
  badge_release_alt: "Reliz",
  badge_build_alt: "Qurish",
  badge_license_alt: "Litsenziya",
  badge_platforms_alt: "Platformalar",
  badge_i18n_alt: "Tillar",
  badge_website_alt: "Veb-sayt",
  hero_desc:
    "**YouTube va 2000+ qo'llab-quvvatlanadigan saytlardan** videolar, Shorts, musiqa, kanallar, podkastlar yoki audio treklarni yuklab oling — 60 fps da 4K HDR gacha yoki MP3 / AAC / Opus sifatida. Windows, macOS va Linuxda mahalliy ishlaydi. **Reklamalar yo'q, keraksiz narsalar yo'q, qo'shimcha taklif yo'q.**",
  cta_latest: "↓ Oxirgi Relizni Yuklab Olish",
  cta_website: "Veb-sayt",
  demo_alt: "Arroxy demosi",
  star_cta: "Agar Arroxy vaqtingizni tejasa, ⭐ boshqalarga topishga yordam beradi.",
  ai_notice: "",
  toc_heading: "Mundarija",
  why_h2: "Nima uchun Arroxy",
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
  feat_quality_h3: "Sifat va formatlar",
  feat_quality_1: "**4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p gacha",
  feat_quality_2: "**Yuqori kadr tezligi** o'zgarmagan holda saqlanadi — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Faqat audio** ni MP3, M4A/AAC, Opus yoki WAV ga eksport qilish",
  feat_quality_4: "Tezkor sozlamalar: *Eng yaxshi sifat* · *Muvozanatli* · *Kichik fayl*",
  feat_privacy_h3: "Maxfiylik va nazorat",
  feat_privacy_1:
    "100% mahalliy qayta ishlash — yuklamalar YouTube'dan to'g'ridan-to'g'ri diskingizga boradi",
  feat_privacy_2: "Kirish yo'q, kukilar yo'q, Google hisob bog'liq emas",
  feat_privacy_3: "Fayllar siz tanlagan papkaga to'g'ridan-to'g'ri saqlanadi",
  feat_workflow_h3: "Ish oqimi",
  feat_workflow_1:
    "**Istalgan havolani joylashtiring** — YouTube videolari, Shorts, kanallar, pleylistlar, podkastlar va Musiqa, hamda yt-dlp qo’llab-quvvatlaydigan 2000+ boshqa saytlar; butun pleylistni yuklab oling yoki avval aniq videolarni tanlang",
  feat_workflow_2:
    "**Ko'p yuklab olish navbati** — bir nechta yuklamalarni parallel kuzatib boring",
  feat_workflow_3:
    "**Bufer kuzatish** — YouTube havolasini nusxalang va Arroxy ilovaga qaytganingizda URL'ni avtomatik to'ldiradi (Kengaytirilgan sozlamalarda o'chirish/yoqish mumkin)",
  feat_workflow_4:
    "**URL'larni avtomatik tozalash** — kuzatish parametrlarini olib tashlaydi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) va `youtube.com/redirect` havolalarini ochadi",
  feat_workflow_5:
    "**Tray rejimi** — oynani yopish yuklamalarni fon rejimida davom ettiradi",
  feat_workflow_6:
    "**21 til** — tizim tilini avtomatik aniqlaydi, istalgan vaqt almashtirish mumkin",
  feat_workflow_7:
    "**Pleylist sinxronlashuvi** — allaqachon yuklab olingan videolarni o'tkazib yuborish uchun pleylistni mahalliy jild bilan qayta tekshiradi; har bir video yuklanganda yangilanadigan `.m3u` pleylist faylini yaratadi",
  feat_workflow_8:
    "**Ehtiyotkor rejim** — sozlanadigan pacing presetlari (*O'chiq · Muvozanatli · Ehtiyotkor · Maxsus*) so'rovlar orasiga kechikishlar qo'shadi va fragment threads sonini cheklaydi, katta pleylistlarda bot-blocks ehtimolini kamaytiradi",
  feat_post_h3: "Subtitrlar va keyingi qayta ishlash",
  feat_post_1:
    "**Subtitrlar** SRT, VTT yoki ASS formatida — qo'lda yoki avtomatik yaratilgan, istalgan mavjud tilda",
  feat_post_2:
    "Video yoniga saqlash, `.mkv` ichiga joylashtirish yoki `Subtitles/` pastki papkasiga tartibga solish",
  feat_post_3:
    "**SponsorBlock** — homiylar, kirishlar, xotimalar, o'z reklamalarini o'tkazib yuborish yoki bo'limga belgilash",
  feat_post_4:
    "**Joylashtirilgan metadata** — sarlavha, yuklash sanasi, kanal, tavsif, miniatyura va bob belgilari faylga yoziladi",
  feat_sites_h3: "YouTube + 2000 sayt",
  feat_sites_1:
    "**YouTube to'liq** — Videolar, Shorts, Kanallar, Pleylistlar, YouTube Music va Podkastlar birinchi darajali manbalar sifatida ishlaydi",
  feat_sites_2:
    "**2000+ boshqa saytlar** yt-dlp orqali — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org va boshqalar",
  feat_sites_3:
    "**Faqat audio va subtitrlar** har qanday qo'llab-quvvatlanadigan saytda ishlaydi, nafaqat YouTube'da",
  feat_sites_4:
    "Sayt o'zgarsa, yt-dlp har hafta tuzatishlar chiqaradi va Arroxy ishga tushganda binarni avtomatik yangilaydi",
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
  dl_win_smartscreen_h4: "Windows SmartScreen ogohlantirishи",
  dl_win_smartscreen_intro:
    "Birinchi ishga tushirishda **\"Windows protected your PC\"** yoki **\"Unknown publisher\"** xabarini ko'rishingiz mumkin. Bu `Arroxy-Setup-*.exe` va `Arroxy-Portable-*.exe` ikkisiga ham tegishli. Arroxy bepul va ochiq manbali dastur bo'lib, Windows qurilmalari pulli sertifikat bilan imzolanmagan, shuning uchun SmartScreen ularni belgilaydi. Bu Arroxy xavfli ekanligini **avtomatik ravishda** anglatmaydi. Davom etish uchun:",
  dl_win_smartscreen_step1: "**More info** tugmasini bosing.",
  dl_win_smartscreen_step2: "**Run anyway** tugmasini bosing.",
  dl_win_smartscreen_official:
    "Arroxy'ni faqat rasmiy GitHub Releases sahifasidan yuklab oling. Agar faylni boshqa saytdan olgan bo'lsangiz yoki kimdir sizga yuborgan bo'lsa, uni o'chirib, rasmiy manbadan yangi nusxa yuklab oling. Manba kodi ommaviy, shuning uchun xohlasangiz o'zingiz tekshirishingiz yoki Arroxy'ni mustaqil qurishingiz mumkin.",
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

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "Nima uchun ogohlantirish ko'rishingiz mumkin",
  dl_warning_p1:
    "Arroxy ochiq manbali va MIT litsenziyali. Windows va macOS qurilmalari **kod imzolanmagan** — Apple Developer ID va Windows EV kod imzolash sertifikatlari har biri yiliga yuzlab dollarga tushadi, buni mustaqil loyiha o'z hisobidan to'laydi. Bu imzolarsiz, Windows SmartScreen va macOS Gatekeeper birinchi ishga tushirishda ogohlantiradi. Ogohlantirishlar *operatsion tizimingiz nashriyotchini tanib olmasligini* anglatadi — bu Arroxy zararli dastur ekanligini anglatmaydi.",
  dl_warning_p2:
    "Arroxy ni o'zingiz tekshirishning uch yo'li, ortib boruvchi qat'iylikda:\n\n- **Manbani o'qing.** Har bir satr [GitHub](https://github.com/antonio-orionus/Arroxy) da mavjud va siz [manbadan yaratishingiz](#tech) mumkin.\n- **SHA256 ni tekshiring.** Faylingizni e'lon qilingan [`SHA256SUMS`](../../releases/latest) bilan solishtiring — pastdagi [Yuklab olishingizni tekshiring](#verify) ga qarang.\n- **Uchinchi tomon skanini o'tkazing.** Faylni [VirusTotal](https://www.virustotal.com) ga yuklang.",

  dl_win_first_h3: "Windows da birinchi ishga tushirish",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialogi, "More info" havolasi ta\'kidlangan holda',
  shot_smartscreen_run_alt:
    'More info kengaytirilgandan so\'ng SmartScreen dialogi, "Run anyway" tugmasi ko\'rsatilgan holda',
  dl_win_defender_h4: "Windows Defender fayl ni belgilasa yoki olib tashlasa",
  dl_win_defender_p:
    "Defender evristikasi ba'zida imzalanmagan NSIS o'rnatuvchilari va Electron portableni shubhali deb belgilaydi. Agar Defender `Arroxy-Setup-*.exe` yoki `Arroxy-Portable-*.exe` ni karantinga olsa, uni **Windows Security → Virus & threat protection → Protection history** dan qayta tiklang, so'ng Arroxy bajariladigan faylini **Manage settings → Add or remove exclusions** ostida ruxsat etilgan element sifatida qo'shing. SmartScreen singari, bu ham aniqlanmagan zararli dastur emas, balki etishmayotgan nashriyotchi imzosi sababli yuzaga keladi.",

  dl_macos_first_h3: "macOS da birinchi ishga tushirish",
  dl_macos_intro:
    "Arroxy hali macOS uchun kod imzolanmagan, shuning uchun Gatekeeper birinchi ishga tushirishni bloklaydi. Uni ruxsat etishning aniq yo'li macOS versiyangizga bog'liq — Sequoia 15 eski sichqonchaning o'ng tugmasi → Open usulini qattiqlashtirib qo'ydi.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 va undan keyingi (joriy)",
  dl_macos_sequoia_intro:
    "Sequoia 15 va undan yangi versiyalarda, sichqonchaning o'ng tugmasi → Open ko'plab karantindagi ilovalar uchun Gatekeeper ni chetlab o'tmaydi. Buning o'rniga Tizim Sozlamalari panelidan foydalaning:",
  dl_macos_sequoia_step1:
    "O'rnatilgan DMG dan `Arroxy.app` ni `/Applications` ga torting.",
  dl_macos_sequoia_step2:
    "Arroxy ni ikki marta bosing. Bloklash dialogi paydo bo'ladi — **Done** tugmasini bosing (*Move to Trash* ni bosmang).",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** ni oching va **Security** bo\'limiga suring. Siz *"Arroxy was blocked to protect your Mac"* (yoki shunga o\'xshash xabar) ko\'rasiz.',
  dl_macos_sequoia_step4:
    "**Open Anyway** tugmasini bosing, parolingiz yoki Touch ID bilan tasdiqlang, so'ng Arroxy ni `/Applications` dan qayta ishga tushiring.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 va undan oldingi",
  dl_macos_sonoma_step1:
    "O'rnatilgan DMG dan `Arroxy.app` ni `/Applications` ga torting.",
  dl_macos_sonoma_step2:
    "`/Applications` dagi `Arroxy.app` ga sichqonchaning o'ng tugmasi bilan bosing (yoki Control-click) va **Open** ni tanlang.",
  dl_macos_sonoma_step3:
    "Ogohlantirish dialogida endi **Open** tugmasi bor — uni bosing va tasdiqlang. Arroxy odatda ochiladi va ogohlantirish boshqa ko'rinmaydi.",
  dl_macos_damaged_h4:
    '"App is damaged" yoki doimiy Gatekeeper bloki — Terminal orqali tuzatish',
  dl_macos_damaged_p:
    'Agar macOS *"Arroxy is damaged and can\'t be opened"* desa, yoki yuqoridagi qadamlarning hech biri blokni bartaraf etmasa, DMG dagi karantin atributi sabab (ba\'zi brauzerlar va macOS ning o\'zining translokatsiya xatti-harakati uni o\'rnatadi). O\'rnatilgan ilovadan uni o\'chirib tashlang:',
  dl_macos_arch_note:
    "**Apple Silicon va Intel:** M seriyali Mac da (M1 / M2 / M3 / M4) `arm64` DMG ni yuklab oling. Intel Mac larda `x64` DMG ni yuklab oling. Noto'g'ri qurilmani ishga tushirish Rosetta orqali ishlaydi, lekin sezilarli darajada sekinroq.",

  dl_linux_first_h3: "Linux da birinchi ishga tushirish",
  dl_linux_appimagelauncher:
    "**Ixtiyoriy ish stoli integratsiyasi:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ni bir marta o'rnating va siz ikki marta bosgandagi har qanday AppImage avtomatik ravishda ishga tushiruvchi menyungizga ro'yxatdan o'tkaziladi — qo'lda `.desktop` fayli talab qilinmaydi.",

  dl_verify_h3: "Yuklab olishingizni tekshiring (SHA256)",
  dl_verify_intro:
    "Har bir reliz binarylar bilan birga `SHA256SUMS` faylini e'lon qiladi. Yuklab olishingiz tranzit davomida buzilmagan yoki o'zgartirilmaganligini tekshirish uchun faylingizni mahalliy ravishda hashlang va `SHA256SUMS` dagi satr bilan solishtiring. Oxirgi reliz sahifasini oching → **Assets** → `SHA256SUMS` ni yuklab oling.",
  dl_verify_win_label: "Windows (PowerShell yoki Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Uchinchi tomon zararli dastur skanini istaysizmi? Faylni [VirusTotal](https://www.virustotal.com) da yuklang. Kichik vositalardan bir nechta umumiy evristik belgilash imzalanmagan Electron ilovalar uchun odatiy holat; yirik vositalardan keng tarqalgan aniqlanishlar haqiqiy muammo bo'lar edi.",

  dl_pm_intro:
    "Paket menejeri allaqachon ishlatayapsizmi? Qo'lda yuklab olish yo'lidan o'tishingiz shart emas.",

  privacy_p1:
    "Yuklamalar YouTube'dan siz tanlagan papkaga to'g'ridan-to'g'ri [yt-dlp](https://github.com/yt-dlp/yt-dlp) orqali olinadi — hech narsa uchinchi tomon server orqali yo'naltirilmaydi. Ko'rish tarixi, yuklab olish tarixi, URL'lar va fayl mazmunlari qurilmangizda qoladi.",
  privacy_p2:
    "Arroxy [OpenPanel](https://openpanel.dev) orqali anonim, agregat telemetriya yuboradi — ishga tushirishlar, OS, ilova versiyalari va nosozliklarni tushunish uchun yetarli. URL, video sarlavhasi, fayl yo‘li, hisob ma’lumoti, fingerprinting yoki shaxsiy ma’lumot yo‘q. Har bir o‘rnatish IDsi tasodifiy va shaxsingizga bog‘lanmagan. Sozlamalarda o‘chirib qo‘yishingiz mumkin.",
  faq_q1: "Bu haqiqatan ham bepulmi?",
  faq_a1: "Ha — MIT litsenziyalangan, premium daraja yo'q, xususiyat cheklash yo'q.",
  faq_q2: "Qanday video sifatlarini yuklab olishim mumkin?",
  faq_a2:
    "YouTube uzatadigan har qanday narsa: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p va faqat audio. 60 fps, 120 fps va HDR oqimlari o'zgarmagan holda saqlanadi.",
  faq_q3: "Faqat audioni MP3 sifatida chiqarib olishim mumkinmi?",
  faq_a3: "Ha. Format menyusidan *faqat audio* ni tanlang va MP3, M4A/AAC, Opus yoki WAV ni belgilang.",
  faq_q4: "YouTube hisob yoki kukilar kerakmi?",
  faq_a4:
    "Standart holatda — yo'q. Arroxy YouTube hisobi, tizimga kirish yoki kuki eksportisiz ishlaydi. Autentifikatsiya talab qiladigan kontent (masalan, yosh chegarasi qo'yilgan yoki faqat a'zolar uchun videolar) uchun Kengaytirilgan sozlamalarda ixtiyoriy kuki qo'llab-quvvatlash mavjud (Cookies source: file or browser). Standart holatda u o'chirilgan. Agar uni yoqsangiz, yt-dlp wiki sahifasida [kuki asosidagi avtomatlashtirish Google hisobini belgilashi mumkinligi haqida ogohlantirish berilgan](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); bunday holatda bir martalik hisob xavfsizroq tanlovdir.",
  faq_q5: "YouTube nimadir o'zgartirsa ham ishlashda davom etadimi?",
  faq_a5:
    "yt-dlp ishga tushirishda avtomatik yangilanadi, va YouTube biror narsani o'zgartirganda Arroxy tezlik bilan tuzatishlarni chiqaradi. Agar siz biron muammoga duch kelsangiz, Kengaytirilgan sozlamalarda ixtiyoriy kuki qo'llab-quvvatlash zaxira variant sifatida mavjud.",
  faq_q6: "Arroxy qanday tillarda mavjud?",
  faq_a6:
    "Yigirma bir, darhol tayyor: English, Español (ispan), Deutsch (nemis), Français (frantsuz), 日本語 (yapon), 中文 (xitoy), Русский (rus), Українська (ukrain), हिन्दी (hind), Afaan Oromoo, Kiswahili, O'zbekcha (o'zbek), Tiếng Việt (vyetnam), አማርኛ (amxar), العربية (arab), اردو (urdu), پښتو (pushtu), বাংলা (bengal), မြန်မာဘာသာ (birma), Ελληνικά (grek) va Српски (serb). Arroxy birinchi ishga tushirishda operatsion tizimingiz tilini avtomatik aniqlaydi va siz istalgan vaqtda asboblar panelindagi til tanlagichidan o'zgartirishingiz mumkin. Tarjimalar src/shared/i18n/locales/ ichidagi oddiy TypeScript obyektlari sifatida saqlanadi — hissa qo'shish uchun GitHub'da PR oching.",
  faq_q7: "Boshqa narsalarni o'rnatishim kerakmi?",
  faq_a7:
    "Yo‘q. yt-dlp birinchi ishga tushirishda avtomatik yuklab olinadi va kompyuteringizda keshlanadi; ffmpeg va ffprobe ilova bilan birga keladi. Undan keyin qo‘shimcha sozlash shart emas.",
  faq_q8: "Playlist yoki butun kanallarni yuklab olishim mumkinmi?",
  faq_a8:
    "Ha — ikkalasi ham. Playlist URL yoki kanal URL’ini joylang (masalan, `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); Arroxy 500 tagacha yozuvni ro’yxatga oladi, so’ng butun ro’yxatni navbatga qo’shasiz yoki aniq videolarni tanlab olasiz. Sana oralig’i va miqdor filtrlari tez orada qo’shiladi.",
  faq_q9: 'macOS "ilova shikastlangan" deydi — nima qilaman?',
  faq_a9:
    'Bu macOS Gatekeeper imzalanmagan ilovani bloklayotgani, haqiqiy shikastlanish emas. Bir qatorli `xattr` buyrug\'i haqida ["App is damaged" — Terminal orqali tuzatish](#macos-first-launch) ga qarang.',
  faq_q10: "YouTube videolarini yuklab olish qonuniyimi?",
  faq_a10:
    "Shaxsiy, xususiy foydalanish uchun bu ko'pchilik yurisdiktsiyalarda umumiy qabul qilingan. Siz YouTube ning [Foydalanish Shartlari](https://www.youtube.com/t/terms) va mahalliy mualliflik huquqi qonunlariga rioya qilish uchun javobgarsiz.",
  plan_intro: "Kelayotgan — taxminan ustuvorlik tartibida:",
  plan_col1: "Xususiyat",
  plan_col2: "Tavsif",
  plan_r1_name: "**Playlist va kanal filtrlari**",
  plan_r1_desc:
    "Playlist yoki kanal sanab chiqilganda sana oralig'i va miqdor filtrlari (hozircha chegara 500 yozuvga belgilangan)",
  plan_r2_name: "**Toplu URL kiritish**",
  plan_r2_desc: "Bir vaqtning o'zida bir nechta URL'larni joylashtiring va ularni bitta yugurishda bajaring",
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
