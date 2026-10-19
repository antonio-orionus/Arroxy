const TECH_CONTENT = `<details>
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
| Node.js | 24.21.0 | \`mise install\` yoki \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` yoki \`package.json\` \`packageManager\` |

Tavsiya: \`mise\` ni o'rnating, so'ng checkout ichida \`mise install\` ni ishga tushiring. Mise bo'lmasa, \`bun run bootstrap\` dan oldin Node.js'ni \`.node-version\` dan va Bun'ni \`package.json\` dan qo'lda faollashtiring.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Mahalliy rebuildlar uchun Visual Studio Build Tools va Python kerak bo'lishi mumkin.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Klon qilgandan so'ng checkout ichida \`mise trust && mise install\` ni ishga tushiring. Agar shellingiz allaqachon \`fnm\`, \`nvm\` yoki Homebrew orqali o'rnatilgan Bun ishlatsa, Arroxy Node.js 24.21.0 va Bun 1.4.2 ni olishi uchun \`~/.zshrc\` da mise ni faollashtiring:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build va Electron ish vaqti bog'liqliklari
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Faqat E2E testlar uchun (Electron displeyni talab qiladi)
sudo apt install -y xvfb
\`\`\`

### Klonlash va ishga tushirish

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # tavsiya; pinned tools qo'lda faollashtirilgan bo'lsa o'tkazib yuboring
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer bilan Electron app
\`\`\`

### Tarqatish paketini qurish

\`\`\`bash
bun run build        # turni tekshirish + kompilyatsiya
bun run dist         # joriy OT uchun paketlash
bun run dist:win     # supported host'da Windows targets paketlash
\`\`\`

> \`bun run bootstrap\` bog'liqliklarni o'rnatadi, Electron app bog'liqliklarini rebuild qiladi, Electron'ni tekshiradi, development uchun embedded ffmpeg/ffprobe tayyorlaydi va Playwright Chromium'ni o'rnatadi. Release build'larda yt-dlp, ffmpeg va ffprobe runtime'da app data folder ichida manage qilinadi; ularning hech biri installer ichida kelmaydi.

</details>`;

export const uz = {
  icon_alt: "Arroxy maskoti",
  title:
    "Arroxy — Windows, macOS va Linux uchun o'rnatilgan brauzerli Bepul Ochiq Manbali YouTube (+ 2000 sayt) Yuklovchi",
  read_in_label: "O'qing:",
  badge_release_alt: "Reliz",
  badge_build_alt: "Qurish",
  badge_license_alt: "Litsenziya",
  badge_platforms_alt: "Platformalar",
  badge_i18n_alt: "Tillar",
  badge_website_alt: "Veb-sayt",
  discord_badge_text: "Discord hamjamiyatiga qo'shiling",
  discord_badge_encoded: "Discord%20hamjamiyatiga%20qo%27shiling",
  hero_desc:
    "**YouTube va 2000+ qo'llab-quvvatlanadigan saytlardan** videolar, Shorts, musiqa, kanallar, podkastlar yoki audio treklarni yuklab oling — 60 fps da 8K HDR gacha, MP3 / AAC / Opus sifatida yoki faqat kerakli qismini. Explore bo'limida **YouTube yoki boshqa istalgan saytni Arroxy ichida ko'rib chiqing** va ochiq turgan video, pleylist yoki kanalni yuklab oling; hisobingiz ko'ra oladigan yopiq, faqat a'zolar uchun va yosh chegarasi bor videolarni yuklab olish uchun u yerda tizimga kiring. Windows, macOS va Linuxda mahalliy ishlaydi. **Reklamalar yo'q, keraksiz narsalar yo'q, qo'shimcha taklif yo'q.**",
  cta_latest: "↓ Oxirgi Relizni Yuklab Olish",
  cta_website: "Veb-sayt",
  star_cta:
    "Agar Arroxy vaqtingizni tejasa, ⭐ boshqalarga topishga yordam beradi.",
  ai_notice: "",
  toc_heading: "Mundarija",
  why_h2: "Nima uchun Arroxy",
  features_h2: "Xususiyatlar",
  dl_h2: "O'rnatish va birinchi ishga tushirish",
  privacy_h2: "Maxfiylik",
  faq_h2: "Ko'p so'raladigan savollar",
  roadmap_h2: "Yo'l xaritasi",
  tech_h2: "Qurish texnologiyalari",
  why_intro: "Eng keng tarqalgan muqobillar bilan yon-yon taqqoslash:",
  why_r1: "Bepul, premium daraja yo'q",
  why_r2: "Ochiq manba",
  why_r3: "Faqat mahalliy qayta ishlash",
  why_r5: "Foydalanish chegaralari yo'q",
  why_r6: "Platformalararo desktop ilovasi",
  why_r7: "Subtitrlar + SponsorBlock",
  why_r8:
    "O'rnatilgan brauzer (ko'rib chiqish, tizimga kirish, yuklab olish)",
  why_r9:
    "Kukilarni eksport qilmasdan yopiq, faqat a'zolar uchun va yosh chegarali videolar",
  why_table_note:
    "⚠️ = qisman yoki faqat pullik tarifda. 4K Video Downloader'da yopiq videolar uchun ilova ichida tizimga kirish pullik funksiya; ko'pchilik bepul yt-dlp GUI'lari faqat kuki faylini qabul qiladi yoki veb-brauzeringizdagi kukilarni o'qiydi.",
  why_summary:
    "Arroxy bir narsa uchun yaratilgan: URL'ni joylaysizmi yoki videoni Explore'da topasizmi — natijada toza mahalliy fayl. Qo'shimcha takliflar yo'q, ma'lumot to'plash yo'q.",
  why_explore_h3: "Oddiy yt-dlp qobig'i qila olmaydigan narsa: Explore bo'limi",
  why_explore_intro:
    "Ko'pchilik bepul YouTube yuklovchilari yt-dlp ustidagi URL maydonidan iborat. Arroxy ham yt-dlp'dan foydalanadi, lekin unda **Explore** ham bor — ilovaga o'rnatilgan, YouTube yoki boshqa istalgan saytni ochadigan brauzer. Explore URL maydoni yengib o'ta olmaydigan cheklovlarni chetlab o'tadi:",
  why_explore_1:
    "**Hisob talab qiladigan videolar, kukilarni eksport qilmasdan** — yopiq, faqat a'zolar uchun va yosh chegarali videolar (yoshi tasdiqlangan hisobda), shuningdek “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringiz hamda boshqa saytlarda tizimga kirishni talab qiladigan videolar. Oddiy qobiqqa eksport qilingan cookies.txt kerak yoki u veb-brauzeringizdagi kukilarni o'qishi shart, Windows'dagi Chrome esa endi buni bloklaydi. Arroxy'da Explore'da bir marta tizimga kirasiz, qolganini u o'zi bajaradi",
  why_explore_2:
    "**“Robot emasligingizni tasdiqlash uchun tizimga kiring”** — YouTube buni so'raganda Arroxy xato bilan to'xtamaydi, balki Explore orqali kirishingiz bilan yuklab olishni qayta urinadi",
  why_explore_3:
    "**YouTube yuklab olish tokeni** — Arroxy'ning o'rnatilgan brauzeri YouTube yuklab olishdan oldin kutadigan tokenni oladi. Usiz YouTube siz so'raganingizdan kamroq format va pastroq sifat berishi mumkin",
  why_explore_4:
    "**Havola nusxalash shart emas** — Explore'da video, pleylist yoki kanalni toping va bir bosishda yuklab oling yoki sahifadagi istalgan havolani o'ng tugma bilan bosing",
  why_explore_5:
    "**Kerak bo'lganda reklama blokeri** — qalqonni bir bossangiz, Explore sahifalarida reklama va kuzatuvchilar bloklanadi",
  feat_explore_h3: "Explore: veb-saytlarni Arroxy ichida ko'rib chiqing",
  feat_explore_1: "**Explore bo'limi** — YouTube yoki boshqa istalgan saytni Arroxy ichida ko'rib chiqing va topganingizni havola nusxalamasdan yuklab oling. **Yuklab olish · *profilingiz*** siz ko'rayotgan video, pleylist yoki kanalni navbatga qo'yadi; yonidagi o'q profilni almashtiradi, sehrli tayoqcha esa format, subtitr va boshqalarni tanlash uchun bosqichma-bosqich yuklab olishni ochadi",
  feat_explore_6: "**O'ng tugma bilan yuklab olish** — Explore'dagi istalgan video, pleylist yoki kanal havolasini o'ng tugma bilan bosib, uni profilingiz bilan yuklab oling, **Profil bilan yuklab olish** orqali boshqa profilni tanlang, bosqichma-bosqich yuklab olishni oching yoki havolani nusxalang. Har bir videoni avval ochish shart emas",
  feat_explore_7:
    "**Ixcham ko'rinish** — Explore asboblar panelidagi bir bosish Arroxy'ning yorliqlarini unga ko'chiradi va sahifaga ko'proq joy beradi",
  feat_explore_2: "**Manzil satri** — YouTube'da qidirish uchun yozing yoki istalgan veb-manzilni kiriting, shu sayt ochiladi",
  feat_explore_3: "**Hisob talab qiladigan yuklamalar** — Explore'da bir marta tizimga kiring, shunda Arroxy hisobingiz ko'ra oladigan yopiq va faqat a'zolar uchun videolarni, hisob yoshi tasdiqlangan bo'lsa yosh chegarali videolarni hamda “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringizni yuklab oladi. Boshqa saytlarga ham shu yerda kiring — ularning yuklamalari kerak bo'lganda shu kirishdan foydalanadi. Arroxy baribir avval tizimga kirmasdan yuklaydi va Explore orqali kirishingizdan faqat yuklab olish hisob tuzata oladigan tarzda muvaffaqiyatsiz bo'lganda foydalanadi. YouTube robot emasligingizni tasdiqlashni so'rasa, Arroxy Explore orqali kirishingizni ham sinab ko'radi",
  feat_explore_4: "**Qo'shimcha hisobdan foydalaning** — Explore'ning birinchi ekrani sababini tushuntiradi: hisob bilan yuklab olish o'sha hisob cheklanishi xavfini keltiradi. Kirishlaringizni unutmoqchi bo'lsangiz, istalgan payt Sozlamalardan Explore'dan chiqing",
  feat_explore_5: "**Reklama blokeri** — sukut bo'yicha o'chiq. Explore asboblar panelidagi qalqonni bir bossangiz, uning sahifalarida reklama va kuzatuvchilar bloklanadi, yuklab olishlarga ta'sir qilmaydi. YouTube tizimga kirgan hisoblar uchun reklama blokerlariga qarshilik qilishi mumkin",
  feat_quality_h3: "Sifat va formatlar",
  feat_quality_1: "**8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p gacha",
  feat_quality_2:
    "**Yuqori kadr tezligi va HDR** o'zgarmagan holda saqlanadi — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — faqat audioni MP3, M4A/AAC, Opus yoki WAV sifatida eksport qiling. Interaktiv yuklab olishlarda mavjud bo'lganda manbaning asl surround/Dolby treklarini (AC-3, E-AC-3, 5.1, DRC) tanlang yoki global **Surround / Dolbyni afzal ko'rish** standartini o'rnating",
  feat_quality_4:
    "**Maqsadli profillar** — *Eng yaxshi tasvir* (AV1 · VP9) yoki *Aqlli TV* (MP4 · H.264), qayta kodlashsiz Avto, MP4, MKV yoki WebM sifatida saqlanadi. HDR — *Avto* (faqat ekraningiz uni ko'rsata olsa), *SDR* yoki *HDR*",
  feat_quality_5:
    "**Har bir ruxsatda har bir kodek** — bosqichma-bosqich yuklab olish har bir ruxsat uchun AV1, VP9 va H.264 ni yonma-yon ko'rsatadi, shunda televizoringiz yoki video muharriringiz ijro eta oladiganini tanlaysiz",
  feat_quality_6:
    "**Oqim aslida qanday ekanini biling** — YouTube sun'iy intellekt yordamida kattalashtirgan o'lchamlar, sun'iy intellekt dublyaj qilgan audio tillar, yaxshilangan bitreytli oqimlar, 360° videolar hamda shikastlangan yoki suv belgili nusxalar belgilanadi. Siz ruxsat bermaguningizcha profillar sun'iy intellekt kattalashtirgan oqimlarni o'tkazib yuboradi",
  feat_privacy_h3: "Maxfiylik va nazorat",
  feat_privacy_1:
    "100% mahalliy qayta ishlash — yuklamalar YouTube'dan to'g'ridan-to'g'ri diskingizga boradi",
  feat_privacy_2: "Kirish yo'q, kukilar yo'q, Google hisob bog'liq emas",
  feat_privacy_3: "Fayllar siz tanlagan papkaga to'g'ridan-to'g'ri saqlanadi",
  feat_workflow_h3: "Ish oqimi",
  feat_workflow_12: "**Global yuklab olish tezkor tugmasi** — istalgan ilovada havolani nusxalang va `Ctrl+Shift+D` (macOS'da `Cmd+Shift+D`) tugmalarini bosing; Arroxy oynani ochmasdan faol profilingiz bilan uni navbatga qo'shadi va bildirishnoma buni tasdiqlaydi. Sukut bo'yicha yoqilgan, qayta tayinlash mumkin",
  feat_workflow_1: "**Moslashuvchan boshlash rejimlari** — boshqariladigan bitta yuklab olish, playlist/kanal tanlagichi, URLlarni ommaviy joylash, saqlangan standartlar bilan Quick Download yoki Explore'da ko'rib chiqib yuklab olishni tanlang",
  feat_workflow_2:
    "**Markaziy yuklab olish navbati** — bitta, playlist, bulk yoki quick ishlarning barchasi jarayon, pauza, davom ettirish, bekor qilish, qayta urinish va ustuvorlik boshqaruvi uchun bir joyga tushadi",
  feat_workflow_3:
    "**Bufer kuzatish** — video havolasini nusxalang, Arroxy'ga qaytganingizda u URL maydonini to'ldiradi, xohlamagan bo'lsangiz **Bekor qilish** bor. Arroxy band bo'lsa, havola siz “URL” bo'limiga qaytguningizcha kutadi (Sozlamalarda o'chiriladi)",
  feat_workflow_4:
    "**URL'larni avtomatik tozalash** — kuzatish parametrlarini olib tashlaydi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) va `youtube.com/redirect` havolalarini ochadi",
  feat_workflow_5:
    "**Tray rejimi** — oynani yopish yuklamalarni fon rejimida davom ettiradi",
  feat_workflow_6:
    "**{{LANG_COUNT}} til** — tizim tilini avtomatik aniqlaydi, istalgan vaqtda almashtirilishi mumkin",
  feat_workflow_7:
    "**Pleylist sinxronlashuvi** — allaqachon yuklab olingan videolarni o'tkazib yuborish uchun pleylistni mahalliy jild bilan qayta tekshiradi; har bir video yuklanganda yangilanadigan `.m3u` pleylist faylini yaratadi",
  feat_workflow_8:
    "**Tezlik va pacing boshqaruvlari** — yuklab olish bandwidthini cheklang, videoning nechta qismi bir vaqtda yuklanishini belgilang va oldindan tayyor sozlamalar (*O'chiq · Muvozanatli · Ehtiyotkor · Maxsus*) bilan so'rovlar orasiga kutish qo'shing",
  feat_workflow_9:
    "**Fayl nomi shablonlari** — `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` va `{playlist_index}` yordamida yuklamalarni o‘zingiz xohlagancha nomlang, umumiy yoki har bir yuklab olish profili uchun alohida",
  feat_workflow_10:
    "**Bir vaqtda yuklamalar va avtomatik qayta urinish** — navbatdagi nechta yuklama bir vaqtda ishlashini tanlang va tarmoq yoki server nosozligiga uchragan yuklamani Arroxy har urinishdan oldin uzoqroq kutib qayta urinib ko'rsin",
  feat_workflow_11:
    "**Har bir video uchun pleylist profillari** — pleylistdagi har bir videoga butun ro'yxat uchun bitta sozlama o'rniga o'z yuklash profilini bering, shunda bitta bosqichda ba'zilarini to'liq sifatda saqlab, qolganlarini MP3 sifatida olish mumkin",
  feat_workflow_13: "**Quick Download fonda ishlaydi** — havola darhol Yuklamalarda paydo bo'lib, o'sha yerda tayyorlanadi, **Ko'rish** tugmali xabar buni tasdiqlaydi va URL maydoni keyingi havola uchun tozalanadi. Oldingilari tayyorlanayotganda xohlagancha boshlang",
  feat_workflow_14: "**Yuklamalar nimaga e'tibor kerakligini aytadi** — Arroxy havolani o'qiy olmasa, uning qatori sababini aytadi va yechimni taklif qiladi: Qayta urinish, kukilarni yoqish yoki Explore'da kirish. Kukilar o'chiq bo'lsa, **Explore orqali kirish** tizimga kirganingizdan keyin buni siz uchun qayta urinadi. Yuklash limitingizdan uzun pleylist o'z qatorida kutadi, siz hammasini, birinchilarini yoki ko'rib chiqishni tanlaysiz. Yuklamalar bo'limi sizni kutayotgan qatorlarni sanaydi",
  feat_workflow_15:
    "**Videoning faqat bir qismini yuklab oling** — Format ekranida boshi va oxirini yoki bobni tanlang, Arroxy faqat shu oraliqni saqlaydi, fayl nomida video ID dan keyin oraliq ko'rsatiladi. Kesimlar eng yaqin keyframega tushadi; buning o'rniga qayta kodlash uchun aniq kesishni yoqing",
  feat_workflow_16:
    "**Tugallangan yuklamalarni avtomatik olib tashlash** — ixtiyoriy: tugallangan yuklama 5 soniyadan keyin ro'yxatdan chiqadi. Fayllari diskda qoladi, muvaffaqiyatsiz yuklamalar esa ro'yxatda qoladi",
  feat_workflow_17:
    "**Yuklamalarda Hajm va Yo‘q** — saralash mumkin bo'lgan **Hajm** ustuni har bir yuklama qancha joy egallashini ko'rsatadi, **Yo‘q** esa Arroxy'dan tashqarida ko'chirilgan yoki o'chirilgan fayllarni belgilaydi",
  feat_workflow_18:
    "**Aurora yoki Minimalistik, qorong'i yoki yorug'** — harakatlanuvchi osmon ustidagi shisha panellar yoki sokin yaxlit sirtlar; pastki qatordan almashtiring. Grafik tezlatgichsiz kompyuterlar avtomatik ravishda Minimalistik rejimni oladi",
  feat_workflow_19:
    "**Mac menyu paneli** — macOS'da menyu panelidan Sozlamalarni (`Cmd+,`) oching, yuklab olish tezligi chegarasini belgilang, uslub va mavzuni almashtiring, jurnallarni oching yoki diagnostika faylini saqlang",
  feat_workflow_20:
    "**Istalgan yuklab olishdan profilni o'zgartiring** — yuklab olishni sozlang, so'ng u boshlangan profilni yangilang (nima o'zgarishini oldindan ko'rib) yoki sozlamalarni yangi profil sifatida saqlang. Profilni almashtirganda tahrirlaringizni saqlab qolish kerakmi, deb so'raladi",
  feat_post_h3: "Subtitrlar va keyingi qayta ishlash",
  feat_post_1:
    "**Subtitrlar** SRT, VTT yoki ASS formatida — qo'lda yoki avtomatik yaratilgan, istalgan mavjud tilda",
  feat_post_2:
    "Video yoniga saqlash, `.mkv` ichiga joylashtirish yoki `Subtitles/` pastki papkasiga tartibga solish",
  feat_post_3:
    "**SponsorBlock** — homiylar, kirishlar, xotimalar, o'z reklamalarini o'tkazib yuborish yoki bo'limga belgilash",
  feat_post_4:
    "**Joylashtirilgan metadata** — sarlavha, yuklash sanasi, kanal, tavsif, miniatyura va bob belgilari faylga yoziladi",
  feat_post_5:
    "**Faqat subtitrli to'plamlar** — URL ro'yxatini joylashtiring yoki pleylistni oching, Subtitrlar-ni tanlang va har bir video uchun faqat subtitr fayllarini oling",
  feat_sites_h3: "YouTube + 2000 sayt",
  feat_sites_1:
    "**YouTube to'liq** — Videolar, Shorts, Kanallar, Pleylistlar, YouTube Music va Podkastlar birinchi darajali manbalar sifatida ishlaydi",
  feat_sites_2:
    "**2000+ boshqa saytlar** yt-dlp orqali — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable va boshqalar",
  feat_sites_3:
    "**Faqat audio va subtitrlar** har qanday qo'llab-quvvatlanadigan saytda ishlaydi, nafaqat YouTube'da",
  feat_sites_4:
    "Sayt o'zgarsa, yt-dlp har hafta tuzatishlar chiqaradi va Arroxy ishga tushganda binarni avtomatik yangilaydi",
  shot1_cap:
    "<b>Tezkor yuklab olish bosh sahifasi</b><br/>URL joylang va faol profilingiz bilan darhol yuklab oling",
  shot2_cap:
    "<b>Qayta ishlatiladigan yuklash profillari</b><br/>Format, sifat va chiqishni shablon sifatida saqlang — har yuklashda qayta ishlating",
  shot3_cap:
    "<b>Ko'p tilli audio yo'llari</b><br/>Video taqdim etgan aniq audio tilini tanlang",
  shot4_cap:
    "<b>Surround / Dolby audio</b><br/>5.1 va Dolby yo'llari aniqlanadi va saqlanadi",
  shot5_cap:
    "<b>Ommaviy URL rejimi</b><br/>Ro'yxat joylang, nusxalarni avtomatik olib tashlang, hammasini birato'la navbatga qo'ying",
  shot6_cap:
    "<b>Parallel yuklash navbati</b><br/>Bir vaqtning o'zida bir nechta yuklash, jonli jarayon bilan",
  hotkey_fig_alt: "Arroxy global yuklab olish tezkor tugmasi — Windows va Linux'da Ctrl+Shift+D, macOS'da Cmd+Shift+D, nusxalangan havolani to'g'ridan-to'g'ri yuklab olish navbatiga yuboradi",
  hotkey_fig_cap: "<b>Global yuklab olish tezkor tugmasi</b><br/>Istalgan joyda havolani nusxalang, bir marta bosing — u navbatga tushadi va yuklab olina boshlaydi",
  shot7_cap: "<b>Har bir video uchun pleylist profillari</b><br/>Har bir videoga o'z profilini bering — ba'zilarini 4K'da saqlang, qolganini MP3 sifatida oling",
  shot8_cap: "<b>Explore</b><br/>YouTube yoki boshqa istalgan saytni Arroxy ichida ko'ring va turgan sahifangizni faol profilingiz bilan yuklab oling",
  shot9_cap: "<b>Explore'ning birinchi ekrani</b><br/>Explore'ga qisqa nazar va nega qo'shimcha hisob xavfsizroq kirish ekani",
  shot10_cap: "<b>Yuklamalar nimaga e'tibor kerakligini aytadi</b><br/>Havolalar fonda tayyorlanadi; muvaffaqiyatsizi yechimini taklif qiladi, uzun pleylist esa tanlovingizni kutadi",
  shot11_cap: "<b>Videoning faqat bir qismini yuklab oling</b><br/>Boshlanish va tugash yoki bobni tanlang — Arroxy faqat shu oraliqni saqlaydi",
  shot12_cap: "<b>Profil muharriri</b><br/>Profilni sozlang: fayl turi, ruxsat, taglavhalar, saqlash joyi, fayl nomi shabloni va boshqalar",
  shot13_cap: "<b>Qorong'i yoki yorug', shisha yoki oddiy</b><br/>Tanlash uchun to'rt ko'rinish: harakatlanuvchi osmon ustidagi shisha panellar yoki sokin oddiy sirtlar, har biri qorong'i va yorug' rejimda",
  dl_platform_col: "Platforma",
  dl_format_col: "Format",
  dl_oneline_note:
    "To'plamlar faqat x86_64 uchun. `curl` yo'qmi? `curl -fsSL` o'rniga `wget -qO-` ishlating.",
  dl_win_scoop:
    "Scoop'ni afzal ko'rasizmi? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
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
    'Birinchi ishga tushirishda **"Windows protected your PC"** yoki **"Unknown publisher"** xabarini ko\'rishingiz mumkin. Bu `Arroxy-win-x64-Setup.exe` va `Arroxy-win-x64-Portable.exe` ikkisiga ham tegishli. Arroxy bepul va ochiq manbali dastur bo\'lib, Windows qurilmalari pulli sertifikat bilan imzolanmagan, shuning uchun SmartScreen ularni belgilaydi. Bu Arroxy xavfli ekanligini **avtomatik ravishda** anglatmaydi. Davom etish uchun:',
  dl_win_smartscreen_step1: "**More info** tugmasini bosing.",
  dl_win_smartscreen_step2: "**Run anyway** tugmasini bosing.",
  dl_win_smartscreen_official:
    "Arroxy'ni faqat rasmiy GitHub Releases sahifasidan yuklab oling. Agar faylni boshqa saytdan olgan bo'lsangiz yoki kimdir sizga yuborgan bo'lsa, uni o'chirib, rasmiy manbadan yangi nusxa yuklab oling. Manba kodi ommaviy, shuning uchun xohlasangiz o'zingiz tekshirishingiz yoki Arroxy'ni mustaqil qurishingiz mumkin.",
  dl_macos_h3: "macOS da birinchi ishga tushirish",
  dl_macos_warning:
    "Arroxy hali kod imzosiga ega emas, shuning uchun macOS Gatekeeper birinchi ishga tushirishda app shikastlangandek ogohlantirish ko'rsatishi mumkin. Bu kutilgan holat — fayllar haqiqatan shikastlanganini anglatmaydi.",
  dl_macos_m1_h4: "Terminal usuli:",
  dl_macos_step1:
    "Ochilgan DMG ichidagi `Arroxy.app` ni `/Applications` ga sudrab o'tkazing.",
  dl_macos_step2:
    "Terminalni ochib `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` ni ishga tushiring.",
  dl_macos_step3: "`open /Applications/Arroxy.app` ni ishga tushiring.",
  dl_macos_step4:
    "Agar app yo'li boshqacha bo'lsa, `/Applications/Arroxy.app` ni o'zingiz o'rnatgan yo'l bilan almashtiring.",
  dl_macos_step5:
    "`sudo` so'rasa, Mac parolingizni kiriting.",
  dl_macos_after:
    "Quarantine olib tashlangandan keyin Arroxy odatdagidek ochiladi.",
  dl_macos_m2_h4: "Terminal usuli:",
  dl_macos_note:
    "macOS qurilmalari Apple Silicon va Intel runnerlarida CI orqali ishlab chiqariladi. Muammolarga duch kelsangiz, iltimos [muammo oching](../../issues) — macOS foydalanuvchilaridan qayta aloqa macOS test siklini faol shakllantiradi.",
  dl_linux_h3: "Linuxda birinchi ishga tushirish",
  dl_linux_intro:
    "AppImagelar to'g'ridan-to'g'ri ishlaydi — o'rnatish shart emas. Faqat faylni bajariladigan sifatida belgilashingiz kerak.",
  dl_linux_m1_text:
    "**Fayl menejeri:** `.AppImage` ga sichqonchaning o'ng tugmasi bilan bosing → **Xususiyatlar** → **Ruxsatlar** → **Faylni dastur sifatida bajarishga ruxsat** ni yoqing, so'ng ikki marta bosing.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Agar ishga tushirish hali ham muvaffaqiyatsiz bo'lsa, uni mount qilmasdan ishga tushiring — FUSE paketi kerak emas:",
  dl_linux_targz_h4: "Oddiy tarball (FUSE ham, o'rnatish ham kerak emas):",
  dl_linux_targz_text: "`.tar.gz` to'plami — AppImage qobig'isiz o'sha ilovaning o'zi: istalgan joyga chiqaring va ishga tushiring. Na o'rnatuvchi, na FUSE paketi kerak.",
  dl_linux_arch_note: "**Relizlar sahifasidagi Linux yuklamalari faqat x86_64 uchun.** ARM64 qurilmalarida (Raspberry Pi, Asahi Linux) Flatpak o'rnatiladi, lekin ishga tushirishda `bwrap: execvp ldconfig: Exec format error` xatosi bilan tugaydi.",
  dl_warning_h3: "Nima uchun ogohlantirish ko'rishingiz mumkin",
  dl_warning_p1:
    "Arroxy ochiq manbali va MIT litsenziyali. Windows va macOS qurilmalari **kod imzolanmagan** — Apple Developer ID va Windows EV kod imzolash sertifikatlari har biri yiliga yuzlab dollarga tushadi, buni mustaqil loyiha o'z hisobidan to'laydi. Bu imzolarsiz, Windows SmartScreen va macOS Gatekeeper birinchi ishga tushirishda ogohlantiradi. Ogohlantirishlar *operatsion tizimingiz nashriyotchini tanib olmasligini* anglatadi — bu Arroxy zararli dastur ekanligini anglatmaydi.",
  dl_warning_p2:
    "Arroxy ni o'zingiz tekshirishning uch yo'li, ortib boruvchi qat'iylikda:\n\n- **Manbani o'qing.** Har bir satr [GitHub](https://github.com/antonio-orionus/Arroxy) da mavjud va siz [manbadan yaratishingiz](#tech) mumkin.\n- **SHA256 ni tekshiring.** Faylingizni e'lon qilingan [`SHA256SUMS`](../../releases/latest) bilan solishtiring — pastdagi [Yuklab olishingizni tekshiring](#verify) ga qarang.\n- **Uchinchi tomon skanini o'tkazing.** Faylni [VirusTotal](https://www.virustotal.com) ga yuklang.",

  dl_win_first_h3: "Windows da birinchi ishga tushirish",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialogi, "More info" havolasi ta\'kidlangan holda',
  shot_smartscreen_run_alt:
    "More info kengaytirilgandan so'ng SmartScreen dialogi, \"Run anyway\" tugmasi ko'rsatilgan holda",
  dl_win_defender_h4: "Windows Defender fayl ni belgilasa yoki olib tashlasa",
  dl_win_defender_p:
    "Defender evristikasi ba'zida imzalanmagan NSIS o'rnatuvchilari va Electron portableni shubhali deb belgilaydi. Agar Defender `Arroxy-win-x64-Setup.exe` yoki `Arroxy-win-x64-Portable.exe` ni karantinga olsa, uni **Windows Security → Virus & threat protection → Protection history** dan qayta tiklang, so'ng Arroxy bajariladigan faylini **Manage settings → Add or remove exclusions** ostida ruxsat etilgan element sifatida qo'shing. SmartScreen singari, bu ham aniqlanmagan zararli dastur emas, balki etishmayotgan nashriyotchi imzosi sababli yuzaga keladi.",

  dl_macos_first_h3: "macOS da birinchi ishga tushirish",
  dl_macos_intro:
    "Arroxy hali macOS uchun kod imzolanmagan, shuning uchun Gatekeeper DMG dan o'rnatgandan keyin qo'rqinchli *\"Arroxy.app is damaged and can't be opened\"* dialogini ko'rsatishi mumkin. Bu xabar macOS imzolanmagan appni quarantine qilganini anglatadi; app fayllari haqiqatan shikastlanganini anglatmaydi. Hozirgi macOSlarda ishonchli tuzatish Terminal orqali:",
  dl_macos_sequoia_h4: "Hozirgi macOS uchun Terminal tuzatishi",
  dl_macos_sequoia_intro:
    "Arroxy ni Applications ga ko'chirgandan keyin Terminaldan foydalaning:",
  dl_macos_sequoia_step1:
    "O'rnatilgan DMG dan `Arroxy.app` ni `/Applications` ga torting.",
  dl_macos_sequoia_step2:
    "Terminalni ochib ushbu ikki buyruqni bajaring:",
  dl_macos_sequoia_step3:
    "Arroxy ni ishga tushirish uchun `open /Applications/Arroxy.app` ni bajaring.",
  dl_macos_sequoia_step4:
    "Agar app yo'li boshqacha bo'lsa, `/Applications/Arroxy.app` ni o'zingiz o'rnatgan yo'l bilan almashtiring.",
  dl_macos_sonoma_h4: "Eski macOS uchun Terminal tuzatishi",
  dl_macos_sonoma_step1:
    "O'rnatilgan DMG dan `Arroxy.app` ni `/Applications` ga torting.",
  dl_macos_sonoma_step2:
    "Terminalni ochib `/Applications/Arroxy.app` dan quarantine ni olib tashlang.",
  dl_macos_sonoma_step3:
    "Quarantine olib tashlangandan keyin Arroxy ni Terminal yoki Finder orqali ishga tushiring.",
  dl_macos_damaged_h4:
    "Gatekeeper quarantine tuzatishi",
  dl_macos_damaged_p:
    "Birinchi buyruq o'rnatilgan Arroxy nusxasidan quarantine atributini olib tashlaydi. Ikkinchisi appni ishga tushiradi. `sudo` Mac parolingizni so'rashi mumkin; Terminal parol yozayotganingizda belgilarni ko'rsatmaydi.",
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
    "Telemetriya yo‘q — kuniga faqat bitta anonim signal: ilova versiyasi, OS, til, o‘rnatish kanali va mamlakat, faol foydalanuvchilarni sanash uchun. ID, URL, video sarlavhasi, fayl yo‘li yoki hisob ma’lumoti yo‘q. Sozlamalarda o‘chirib qo‘yishingiz mumkin.",
  privacy_p3: "Explore o'z kirishlarini saqlaydi, brauzeringizdan alohida, va Arroxy kirish shaklini hech qachon o'qimaydi yoki to'ldirmaydi — siz saytning o'z sahifasiga yozasiz. Yuklab olishlar tizimga kirmasdan bajariladi; faqat biri hisob tuzata oladigan tarzda muvaffaqiyatsiz bo'lganda Arroxy kirishni o'sha payt o'qiydi, o'sha yuklab olish uchun vaqtinchalik faylda saqlaydi va keyin faylni o'chiradi. Sozlamalarda Explore'dan chiqish ularni unutadi.",
  faq_q1: "Bu haqiqatan ham bepulmi?",
  faq_a1:
    "Ha — MIT litsenziyalangan, premium daraja yo'q, xususiyat cheklash yo'q.",
  faq_q11: "Arroxy boshqa yt-dlp GUI'laridan nimasi bilan farq qiladi?",
  faq_a11:
    "Ko'pchilik bepul yt-dlp GUI'lari faqat havola qabul qiladigan qobiqlardir. Arroxy bunga **Explore**'ni qo'shadi — ilovaga o'rnatilgan, YouTube yoki boshqa istalgan saytni ochadigan brauzer: havola nusxalamasdan ko'rib chiqasiz va yuklab olasiz, u yerda bir marta tizimga kirib, yopiq, faqat a'zolar uchun va yosh chegarali videolarni hamda “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringizni kukilarni eksport qilmasdan yuklab olasiz. YouTube robot emasligingizni tasdiqlashni so'raganda Arroxy shu kirishdan foydalanadi, o'rnatilgan brauzeri esa YouTube yuklab olish tokenini oladi, shuning uchun yuklab olishlar kamroq formatlarga tushib qolmaydi. [Nima uchun Arroxy](#why) bo'limiga qarang.",
  faq_q2: "Qanday video sifatlarini yuklab olishim mumkin?",
  faq_a2:
    "YouTube uzatadigan har qanday narsa: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p va faqat audio. 60 fps va HDR oqimlari o'zgarmagan holda saqlanadi, bosqichma-bosqich yuklab olish esa har bir ruxsatda AV1, VP9 yoki H.264 ni tanlash imkonini beradi.",
  faq_q3: "Faqat audioni MP3 sifatida chiqarib olishim mumkinmi?",
  faq_a3:
    "Ha. Format menyusidan *faqat audio* ni tanlang va MP3, M4A/AAC, Opus yoki WAV ni belgilang.",
  faq_q4: "Hisob talab qiladigan YouTube videolarini qanday yuklab olaman?",
  faq_a4: "Explore bo'limida bir marta tizimga kiring. Shunda Arroxy hisobingiz ko'ra oladigan yopiq va faqat a'zolar uchun videolarni, hisob yoshi tasdiqlangan bo'lsa yosh chegarali videolarni hamda “Keyinroq ko'rish” va “Yoqqanlar” ro'yxatlaringizni yuklab oladi. U tizimga kirishdan faqat yuklab olish hisob tuzata oladigan tarzda muvaffaqiyatsiz bo'lganda foydalanadi; qolgan hamma narsa avvalgidek yuklanadi. Bu kuki sozlamalarida birinchi turadigan va Tavsiya etiladi deb belgilangan **Explore orqali kirish** variantidir, Arroxy uni Explore'ni birinchi ochganingizda siz uchun tanlaydi. yt-dlp wiki sahifasida [tizimga kirilgan holatdagi avtomatlashtirish Google hisobini belgilashi mumkinligi haqida ogohlantirish berilgan](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), shuning uchun qo'shimcha hisob xavfsizroq tanlovdir.",
  faq_q5: "YouTube nimadir o'zgartirsa ham ishlashda davom etadimi?",
  faq_a5: "yt-dlp ishga tushirishda avtomatik yangilanadi, va YouTube biror narsani o'zgartirganda Arroxy tezlik bilan tuzatishlarni chiqaradi. YouTube robot emasligingizni tasdiqlashni so'raganda, Explore'da tizimga kirgan bo'lsangiz Arroxy Explore orqali kirishingizni ham sinab ko'radi, fayldagi yoki brauzeringizdagi kukilar esa kuki sozlamalarida mavjud.",
  faq_q6: "Arroxy qanday tillarda mavjud?",
  faq_a6:
    "{{LANG_COUNT}} til darhol mavjud: {{LANG_NAME_LIST}}. Arroxy birinchi ishga tushirilganda operatsion tizimingiz tilini avtomatik aniqlaydi, va tilni asboblar panelidagi tanlagichdan istalgan vaqtda almashtirishingiz mumkin. Runtime locale JSON src/shared/i18n/locales/ ichida, tarjimonlar uchun PO catalog esa i18n/locales/ ichida — hissa qo‘shish uchun GitHub’da PR oching.",
  faq_q7: "Boshqa narsalarni o'rnatishim kerakmi?",
  faq_a7:
    "Yo‘q. yt-dlp, ffmpeg va ffprobe birinchi ishga tushirishda avtomatik yuklab olinadi va kompyuteringizda keshlanadi. Undan keyin qo‘shimcha sozlash shart emas.",
  faq_q8: "Playlist yoki butun kanallarni yuklab olishim mumkinmi?",
  faq_a8:
    "Ha — ikkalasi ham. Playlist yoki kanal URLini joylang (masalan, `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); nechta yozuv skanerlanishini tanlang, keyin butun ro‘yxatni navbatga qo‘ying yoki alohida videolarni tanlang. Sana oralig‘i filtrlari tez orada keladi.",
  faq_q9: 'macOS "ilova shikastlangan" deydi — nima qilaman?',
  faq_a9:
    "Bu macOS Gatekeeper imzolanmagan appni bloklayotgani, haqiqiy shikastlanish emas. Quarantine ni olib tashlash va Arroxy ni ishga tushirish uchun Terminal buyruqlari [macOS first launch](#macos-first-launch) bo'limida.",
  faq_q10: "YouTube videolarini yuklab olish qonuniyimi?",
  faq_a10:
    "Shaxsiy, xususiy foydalanish uchun bu ko'pchilik yurisdiktsiyalarda umumiy qabul qilingan. Siz YouTube ning [Foydalanish Shartlari](https://www.youtube.com/t/terms) va mahalliy mualliflik huquqi qonunlariga rioya qilish uchun javobgarsiz.",
  plan_intro: "Hali rejalashtirilgan — taxminan ustuvorlik tartibida:",
  plan_col1: "Xususiyat",
  plan_col2: "Tavsif",
  plan_r1_name: "**Playlist va kanal filtrlari**",
  plan_r1_desc: "Playlist yoki kanalni ro‘yxatlashda sana oralig‘i filtrlari",
  plan_r2_name: "**YouTube audio track afzalliklari**",
  plan_r2_desc:
    "YouTube bir nechta audio track berganda app bo'ylab og'zaki til track afzalligini sozlash va har bir profile uchun override qilish",
  plan_r3_name: "**Kuchliroq retry recovery**",
  plan_r3_desc:
    "Ishonchsiz yoki muammoli internet connection sabab uzilgan yuklab olishlar uchun yangi retry yo'li",
  plan_r4_name: "**To'liq download manager drawer**",
  plan_r4_desc:
    "Queue drawerni to'liqroq managerga aylantirish, queued items uchun destination folderlarni o'zgartirish bilan",
  plan_r5_name: "**Rejalashtirilgan yuklab olishlar**",
  plan_r5_desc: "Navbatni belgilangan vaqtda boshlash (tunda ishlash)",
  plan_r9_name: "**AUR paketi**",
  plan_r9_desc: "Arch Linux va Omarchy'ga `yay -S arroxy-bin` orqali o'rnatish",
  plan_cta:
    "Xayyolizda xususiyat bormi? [So'rov yuboring](../../issues) — jamiyat ishtiroki ustuvorlikni belgilaydi.",
  tech_content: TECH_CONTENT,
  support_h2: "Arroxy'ni qo'llab-quvvatlash",
  support_note: "Arroxy bepul va MIT litsenziyasi ostida tarqatiladi — reklama yo'q, telemetriya yo'q, pullik versiya yo'q. Agar u vaqtingizni tejasa, ishlanmani Bitcoin, Tron yoki Ethereum orqali qo'llab-quvvatlashingiz mumkin: manzillar [DONATE.md](DONATE.md) faylida keltirilgan va bu ular uchun yagona rasmiy manbadir. Arroxy hech qachon sizga manzilni elektron pochta yoki shaxsiy xabar orqali yubormaydi. Repozitoriyga yulduzcha qo'yish, xatolar haqida xabar berish va tarjimalarni yaxshilash ham xuddi shunday yordam beradi.",
  tos_h2: "Foydalanish shartlari",
  tos_note:
    "Arroxy faqat shaxsiy, xususiy foydalanish uchun mo'ljallangan vosita. Siz yuklab olishlaringiz YouTube ning [Foydalanish Shartlari](https://www.youtube.com/t/terms) va yurisdiktsiyangizning mualliflik huquqi qonunlariga muvofiqligini ta'minlash uchun yagona javobgarsiz. Arroxy ni foydalanish huquqingiz bo'lmagan kontentni yuklab olish, ko'paytirish yoki tarqatish uchun ishlatmang. Ishlab chiquvchilar har qanday suiiste'mollik uchun javobgar emas.",
  footer_credit:
    'MIT Litsenziyasi · <a href="https://x.com/OrionusAI">@OrionusAI</a> tomonidan mehnat bilan yaratilgan',
};
