// Landing-page translations for "uz". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const uz = {
  title: "Arroxy — Bepul 4K YouTube Yuklab Oluvchi, Kirish Talab Qilinmaydi",
  description:
    "Windows, macOS va Linux uchun bepul, MIT litsenziyali ish stoli YouTube yuklab oluvchi. Google hisobisiz, brauzer cookie'larisiz yoki hech qanday kirishsiz 4K HDR da 60 fps gacha video yuklab oling.",
  og_title: "Arroxy — Bepul 4K YouTube Yuklab Oluvchi, Kirish Talab Qilinmaydi",
  og_description:
    "Bepul 4K YouTube yuklab oluvchi. Cookie yo'q, kirish yo'q, buzilgan seanslar yo'q. MIT litsenziyali. Windows · macOS · Linux.",

  nav_features: "Imkoniyatlar",
  nav_screenshots: "Skrinshotlar",
  nav_install: "O'rnatish",
  nav_blog: "Blog",
  nav_download: "Yuklab olish",

  hero_eyebrow: "Open Source · MIT · Faol ishlab chiqilmoqda",
  hero_h1_a: "Bepul 4K YouTube yuklab oluvchi.",
  hero_h1_b: "Cookie yo'q. Kirish yo'q. Buzilgan seanslar yo'q.",
  hero_tagline:
    "Arroxy — Windows, macOS va Linux uchun bepul, MIT litsenziyali ish stoli YouTube yuklab oluvchi. Google hisobi, brauzer cookie'lari yoki hech qanday kirish so'ramasdan — 4K HDR da 60 fps gacha video yuklab oladi.",
  pill_no_tracking: "Kuzatuv yo'q",
  pill_no_account: "Google hisobi kerak emas",
  pill_open_source: "Ochiq manba (MIT)",
  hero_trust: "GitHub'da har bir satrni tekshiring.",
  cta_download_os: "OT uchun yuklab oling",
  cta_view_github: "GitHub'da ko'rish",
  release_label: "So'nggi versiya:",
  release_loading: "yuklanmoqda…",

  cta_download_windows: "Windows uchun yuklab oling",
  cta_download_windows_portable: "Portativ .exe (o'rnatmasiz)",
  cta_download_mac_arm: "macOS uchun yuklab oling (Apple Silicon)",
  cta_download_mac_intel: "Intel Mac? x64 DMG olish",
  cta_download_linux_appimage: "Linux uchun yuklab oling (.AppImage)",
  cta_download_linux_flatpak: "Flatpak to'plami →",
  cta_other_platforms: "Boshqa platformalar / Barcha yuklamalar",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "O'rnatuvchi",
  cta_portable_label: "Portativ",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy — Windows, macOS va Linux uchun ish stoli ilovasi.",
  mobile_notice_sub: "Yuklab olish uchun ushbu sahifani kompyuteringizda oching.",
  mobile_copy_link: "Sahifa havolasini nusxalash",
  first_launch_label: "Birinchi ishga tushirishda yordam",
  first_launch_mac_html:
    "macOS birinchi ishga tushirishda <em>noma'lum ishlab chiquvchi</em> ogohlantirishini ko'rsatadi — Arroxy hali kod imzolanmagan. <strong>Ilova belgisini o'ng tugma bilan bosing → Ochish</strong>, so'ng muloqot oynasida <strong>Ochish</strong> tugmasini bosing. Faqat bir marta kerak.",
  first_launch_linux_html:
    "<strong>AppImage:</strong> faylni o'ng tugma bilan bosing → <strong>Xususiyatlar → Dastur sifatida bajarishga ruxsat</strong>, yoki terminalda <code>chmod +x Arroxy-*.AppImage</code> buyrug'ini ishga tushiring. Ishga tushmasa, <code>libfuse2</code> (Ubuntu/Debian), <code>fuse-libs</code> (Fedora) yoki <code>fuse2</code> (Arch) o'rnating.<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code>, so'ng ilova menyusidan ishga tushiring yoki <code>flatpak run io.github.antonio_orionus.Arroxy</code> buyrug'ini bajaring.",

  features_eyebrow: "Nima qiladi",
  features_h2: "Kutganingizning hammasi, hech qanday murakkabliksiz.",
  features_sub: "URL manzilini joylashtiring, sifat tanlang, yuklab olishni bosing. Hammasi shu.",
  f1_h: "4K UHD gacha",
  f1_p: "2160p, 1440p, 1080p, 720p — YouTube taklif etadigan har bir aniqlik, shuningdek faqat audio MP3, AAC va Opus.",
  f2_h: "60 fps va HDR saqlanadi",
  f2_p: "Yuqori kadrlar tezligi va HDR oqimlari YouTube kodlashi bo'yicha aynan shunday keladi — sifat yo'qotilmaydi.",
  f3_h: "Bir vaqtda bir nechtasi",
  f3_p: "Xohlagan miqdordagi videolarni navbatga qo'ying. Yuklab olish paneli har birining jarayonini parallel kuzatib boradi.",
  f4_h: "Avtomatik yangilanishlar",
  f4_p: "Arroxy yt-dlp va ffmpeg'ni har doim yangilab turadi — YouTube'ning har bir o'zgarishi bilan ishlaydi.",
  f5_h: "9 til",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — tilingizni avtomatik aniqlaydi.",
  f6_h: "Ko'p platformali",
  f6_p: "Windows, macOS va Linux uchun mahalliy yig'malar — o'rnatuvchi, portativ, DMG yoki AppImage.",
  f7_h: "Subtitrlar, o'zingizcha",
  f7_p: "Qo'lda yoki avtomatik yaratilgan subtitrlar SRT, VTT yoki ASS formatida — videoning yonida saqlangan, portativ .mkv fayliga joylashtirilgan yoki Subtitles/ papkasiga qo'yilgan.",
  f8_h: "SponsorBlock o'rnatilgan",
  f8_p: "Homiy segmentlar, intro, outro, o'z-o'zini reklama va boshqalarni o'tkazib yuboring yoki belgilang — FFmpeg bilan qirqing yoki faqat bo'limlar qo'shing. Sizning tanlovingiz, har bir toifa uchun.",
  f9_h: "Clipboard'dan avtoto'ldirish",
  f9_p: "Istalgan joyda YouTube havolasini nusxalang va Arroxy qaytib o'tganingizda uni darhol aniqlaydi — tasdiqlash so'rovi sizni nazoratda saqlaydi. Kengaytirilgan sozlamalarda yoqing yoki o'chiring.",
  f10_h: "URLlarni avtomatik tozalash",
  f10_p: "Kuzatuv parametrlari (si, pp, feature, utm_*, fbclid, gclid va boshqalar) joylashtirilgan YouTube havolalaridan avtomatik olib tashlanadi, youtube.com/redirect o'ramlari ochiladi — URL maydoni har doim kanonik havolani ko'rsatadi.",
  f11_h: "Tizim paneliga yashirinadi",
  f11_p: "Oynani yopish Arroxy'ni tizim paneline joylashtiradi. Yuklamalar fonda davom etadi — oynani qaytarish uchun tizim paneli belgisini bosing yoki tizim paneli menyusidan chiqing.",
  f12_h: "Joylashtirilgan metadata va muqova",
  f12_p: "Sarlavha, yuklash sanasi, ijrochi, tavsif, muqova rasmi va bo'lim belgilari to'g'ridan-to'g'ri faylga yoziladi — qo'shimcha fayllar yo'q, qo'lda teglamasdan.",

  shots_eyebrow: "Amalda ko'ring",
  shots_h2: "Aniqlik uchun yaratilgan, tartibsizlik emas.",
  shot1_alt: "URL manzilini joylashtiring",
  shot2_alt: "Sifatingizni tanlang",
  shot3_alt: "Qayerga saqlashni tanlang",
  shot4_alt: "Parallel yuklamalar",
  shot5_alt: "Subtitr bosqichi — tillar, format va saqlash rejimini tanlang",
  og_image_alt: "Arroxy ilova belgisi — YouTube videolarini 4K sifatda yuklab olish uchun ish stoli ilovasi.",

  privacy_eyebrow: "Maxfiylik",
  privacy_h2_html: "Arroxy nima <em>qilmaydi</em>.",
  privacy_sub:
    "Ko'pgina YouTube yuklab oluvchilar oxir-oqibat cookie'laringizni so'raydi. Arroxy hech qachon so'ramaydi.",
  p1_h: "Kirish talab qilinmaydi",
  p1_p: "Google hisobi yo'q. Muddati tugaydigan seanslar yo'q. Hisobingiz belgilanish xavfi nol.",
  p2_h: "Cookie yo'q",
  p2_p: "Arroxy har qanday brauzer so'raydigan tokenlarni so'raydi. Hech narsa eksport qilinmaydi, hech narsa saqlanmaydi.",
  p3_h: "Foydalanuvchi identifikatorlari yo'q",
  p3_p: "Aptabase orqali anonim, faqat sessiya davomidagi telemetriya — o'rnatish identifikatorlari yo'q, barmoq izi yo'q, shaxsiy ma'lumotlar yo'q. Yuklamalaringiz, tarixingiz va fayllaringiz hech qachon qurilmangizdan chiqmaydi.",
  p4_h: "Uchinchi tomon serverlari yo'q",
  p4_p: "Butun jarayon yt-dlp + ffmpeg orqali mahalliy tarzda ishlaydi. Fayllar hech qachon masofaviy serverga tegmaydi.",

  install_eyebrow: "O'rnatish",
  install_h2: "Kanalingizni tanlang.",
  install_sub:
    "To'g'ridan-to'g'ri yuklab olish yoki istalgan paket menejeri — har bir versiyada avtomatik yangilanadi.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Barchasi",
  winget_desc: "Windows 10/11 uchun tavsiya etiladi. Tizim bilan birga avtomatik yangilanadi.",
  scoop_desc: "Scoop bucket orqali portativ o'rnatish. Administrator huquqlari shart emas.",
  brew_desc: "Tap'ni qo'shing, bir buyruq bilan o'rnating. Universal ikkilik fayl (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Izolyatsiyalangan o'rnatish. .flatpak to'plamini Releases'dan yuklab oling, bir buyruq bilan o'rnating. Flathub sozlamasi shart emas.",
  direct_h: "To'g'ridan-to'g'ri yuklab olish",
  direct_desc: "NSIS o'rnatuvchi, portativ .exe, .dmg, .AppImage yoki .flatpak — to'g'ridan-to'g'ri GitHub Releases'dan.",
  direct_btn: "Releases'ni ochish →",
  copy_label: "Nusxalash",
  copied_label: "Nusxalandi!",

  footer_made_by: "MIT Litsenziyasi · G'amxo'rlik bilan yaratildi",
  footer_github: "GitHub",
  footer_issues: "Muammolar",
  footer_releases: "Relizlar",
  footer_languages_label: "Til:",

  faq_eyebrow: "FAQ",
  faq_h2: "Ko'p so'raladigan savollar",
  faq_q1: "Qanday video sifatlarini yuklab olishim mumkin?",
  faq_a1:
    "YouTube taklif etadigan har qanday narsa — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p va faqat audio. Yuqori kadrlar tezligi (60 fps, 120 fps) va HDR mazmuni o'zgarishsiz saqlanadi. Arroxy barcha mavjud formatlarni ko'rsatadi va siz aynan nimani olishni tanlashingiz mumkin.",
  faq_q2: "Haqiqatan ham bepulmi?",
  faq_a2: "Ha. MIT litsenziyasi. Premium daraja yo'q, imkoniyatlar cheklanmagan.",
  faq_q3: "Arroxy qanday tillarda mavjud?",
  faq_a3:
    "To'qqizta, darhol tayyor: English, Español (ispan), Deutsch (nemis), Français (frantsuz), 日本語 (yapon), 中文 (xitoy), Русский (rus), Українська (ukrain) va हिन्दी (hind). Arroxy birinchi ishga tushirishda operatsion tizimingiz tilini avtomatik aniqlaydi va siz istalgan vaqtda asboblar panelindagi til tanlagichidan o'zgartirishingiz mumkin. Tarjimalar src/shared/i18n/locales/ ichidagi oddiy TypeScript obyektlari sifatida saqlanadi — hissa qo'shish uchun GitHub'da PR oching.",
  faq_q4: "Biror narsa o'rnatishim kerakmi?",
  faq_a4:
    "Yo'q. yt-dlp va ffmpeg birinchi ishga tushirishda rasmiy GitHub relizlaridan avtomatik yuklab olinadi va kompyuteringizda keshlanadi. Undan keyin qo'shimcha sozlash shart emas.",
  faq_q5: "YouTube biror narsa o'zgartirsa ham ishlaydimiw?",
  faq_a5:
    "Ha — va Arroxy'ning ikkita bardoshlilik qatlami bor. Birinchidan, yt-dlp eng faol saqlanadigan ochiq manba vositalaridan biri — YouTube o'zgarishlaridan soatlar ichida yangilanadi. Ikkinchidan, Arroxy cookie'lar yoki Google hisobingizga umuman tayanmaydi, shuning uchun muddati tugaydigan seans ham, almashtiriladigan hisob ma'lumotlari ham yo'q. Bu kombinatsiya uni eksport qilingan brauzer cookie'lariga tayanadigan vositalardan sezilarli darajada barqarorroq qiladi.",
  faq_q6: "Pleylistlarni yuklab olish mumkinmi?",
  faq_a6:
    "Bugun yagona videolar qo'llab-quvvatlanadi. Pleylist va kanal qo'llab-quvvatlash yo'l xaritasida.",
  faq_q7: "Bu YouTube hisobim yoki cookie'larimni talab qiladimi?",
  faq_a7:
    "Yo'q — va bu juda muhim. YouTube yangilanishidan keyin ishlamay qolgan ko'pgina vositalar brauzeringizning YouTube cookie'larini eksport qilishni taklif qiladi. Bu yechim YouTube seanslarni ~30 daqiqada bir aylantirganida buziladi va yt-dlp'ning o'z hujjatlari bu Google hisobingizning belgilanishiga olib kelishi mumkinligi haqida ogohlantiradi. Arroxy hech qachon cookie'lar yoki hisob ma'lumotlaridan foydalanmaydi. Kirish yo'q. Bog'langan hisob yo'q. Muddati tugaydigan narsa yo'q, taqiqlanadigan narsa yo'q.",
  faq_q8:
    'macOS "ilova shikastlangan" yoki "ochib bo\'lmaydi" deyapti — nima qilishim kerak?',
  faq_a8:
    "Bu macOS Gatekeeper'ning imzolanmagan ilovani bloklashi — haqiqiy shikast emas. README'da macOS'da birinchi marta ishga tushirish uchun bosqichma-bosqich ko'rsatmalar mavjud.",
  faq_q9: "Bu qonuniymi?",
  faq_a9:
    "Videolarni shaxsiy foydalanish uchun yuklab olish ko'pgina davlatlarda odatda qabul qilingan. YouTube Xizmat ko'rsatish shartlariga va mahalliy qonunlarga rioya qilish sizning mas'uliyatingiz.",
};
