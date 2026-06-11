const TECH_CONTENT = `<details>
<summary><strong>Стек технологија</strong></summary>

- **Electron** — кроссплатформна десктоп љуска
- **React 19** + **TypeScript** — кориснички интерфејс
- **Tailwind CSS v4** — стилизовање
- **Zustand** — управљање стањем
- **yt-dlp** + **ffmpeg** — машина за преузимање и мешање (yt-dlp се преузима у runtime-у; ffmpeg/ffprobe се укључују при build-у)
- **Vite** + **electron-vite** — алати за изградњу
- **Vitest** + **Playwright** — јединични и end-to-end тестови

</details>

<details>
<summary><strong>Изградња из изворног кода</strong></summary>

### Предуслови — све платформе

| Алат | Верзија | Инсталација |
| ---- | ------- | ----------- |
| Git  | било која | [git-scm.com](https://git-scm.com) |
| Bun  | најновија | погледати по ОС испод |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Нису потребни нативни алати за изградњу — пројекат нема нативних Node додатака.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Клонирање и покретање

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### Изградња дистрибутивне верзије

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # cross-compile Windows portable exe
\`\`\`

> yt-dlp се преузима са GitHub-а при првом покретању и кешира у фасцикли података апликације. ffmpeg и ffprobe су укључени у свако Arroxy издање.

</details>`;

export const sr = {
  icon_alt: "Arroxy маскота",
  title: "Arroxy — Бесплатни open-source YouTube (+ 2000 сајтова) преузимач за Windows, macOS и Linux",
  read_in_label: "Читај на:",
  badge_release_alt: "Издање",
  badge_build_alt: "Изградња",
  badge_license_alt: "Лиценца",
  badge_platforms_alt: "Платформе",
  badge_i18n_alt: "Језици",
  badge_website_alt: "Веб-сајт",
  discord_badge_text: "Придружите се Discord заједници",
  discord_badge_encoded: "%D0%9F%D1%80%D0%B8%D0%B4%D1%80%D1%83%D0%B6%D0%B8%D1%82%D0%B5%20%D1%81%D0%B5%20Discord%20%D0%B7%D0%B0%D1%98%D0%B5%D0%B4%D0%BD%D0%B8%D1%86%D0%B8",
  hero_desc:
    "Преузимајте видео снимке, Shorts, музику, каналe, подкасте или аудио записе са **YouTube-а и 2000+ подржаних сајтова** — до 4K HDR при 60 fps, или у MP3 / AAC / Opus формату. Ради локално на Windows-у, macOS-у и Linux-у. **Без реклама, без непотребног, без додатне продаје.**",
  cta_latest: "↓ Преузмите најновије издање",
  cta_website: "Веб-сајт",
  demo_alt: "Arroxy демонстрација",
  star_cta: "Ако вам Arroxy уштеди времена, ⭐ помаже другима да га пронађу.",
  ai_notice: "",
  toc_heading: "Садржај",
  why_h2: "Зашто Arroxy",
  features_h2: "Функционалности",
  dl_h2: "Преузимање",
  privacy_h2: "Приватност",
  faq_h2: "ЧПП",
  roadmap_h2: "Планови",
  tech_h2: "Израђено помоћу",
  why_intro: "Поређење са најчешћим алтернативама:",
  why_r1: "Бесплатно, без премијум нивоа",
  why_r2: "Отворени код",
  why_r3: "Само локална обрада",
  why_r4: "Без пријаве или извоза колачића",
  why_r5: "Без ограничења употребе",
  why_r6: "Кроссплатформна десктоп апликација",
  why_r7: "Титлови + SponsorBlock",
  why_summary:
    "Arroxy је направљен за једну ствар: налепите URL, добијете чист локални фајл. Без налога, без додатне продаје, без прикупљања података.",
  feat_quality_h3: "Квалитет и формати",
  feat_quality_1: "До **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Висок број сличица** задржан без измена — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Samo audio** u MP3, M4A/AAC, Opus ili WAV",
  feat_quality_4: "Брзи предефинисани избори: *Најбољи квалитет* · *Уравнотежено* · *Мали фајл*",
  feat_privacy_h3: "Приватност и контрола",
  feat_privacy_1:
    "100% локална обрада — преузимања иду директно са YouTube-а на ваш диск",
  feat_privacy_2: "Без пријаве, без колачића, без повезаног Google налога",
  feat_privacy_3: "Фајлови се чувају директно у фасциклу коју одаберете",
  feat_workflow_h3: "Радни ток",
  feat_workflow_1:
    "**Флексибилни начини покретања** — изабери вођено једно преузимање, бирач playlist/channel, bulk URL paste или Quick Download са сачуваним подразумеваним опцијама",
  feat_workflow_2:
    "**Централни ред за преузимања** — сваки single, playlist, bulk или quick посао стиже на једно место за напредак, паузу, наставак, отказивање, поновни покушај и контролу приоритета",
  feat_workflow_3:
    "**Праћење клипборда** — копирајте YouTube линк и Arroxy аутоматски попуњава URL кад се вратите у апликацију (укључиво у напредним подешавањима)",
  feat_workflow_4:
    "**Аутоматско чишћење URL-ова** — уклања параметре праћења (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) и распакује `youtube.com/redirect` линкове",
  feat_workflow_5:
    "**Режим трака** — затварање прозора одржава преузимања у позадини",
  feat_workflow_6:
    "**21 језик** — аутоматски препознаје системски локал, може се мењати у свако доба",
  feat_workflow_7:
    "**Синхронизација плејлисте** — поново проверава плејлисту у односу на локални фолдер да би прескочио већ преузете видео снимке; прави `.m3u` фајл плејлисте који се ажурира после сваког преузетог видеа",
  feat_workflow_8:
    "**Контроле брзине и pacing-а** — ограничи download bandwidth, додај кашњења између request-ова и подеси fragment threads помоћу preset-ова (*Off · Balanced · Careful · Custom*)",
  feat_post_h3: "Титлови и постобрада",
  feat_post_1:
    "**Титлови** у SRT, VTT или ASS формату — ручни или аутоматски генерисани, на свим доступним језицима",
  feat_post_2:
    "Чувај поред видеа, уграђај у `.mkv`, или организуј у потфасциклу `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — прескочи или означи поглављима спонзоре, интра, аутра, самопромоције",
  feat_post_4:
    "**Уграђени метаподаци** — наслов, датум учитавања, канал, опис, минијатура и маркери поглавља уписани у фајл",
  feat_sites_h3: "YouTube + 2000 сајтова",
  feat_sites_1:
    "**YouTube — у потпуности** — видео снимци, Shorts, канали, пlejliste, YouTube Music и подкасти обрађени као извори прве класе",
  feat_sites_2:
    "**2000+ других сajтова** преко yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org и многи други",
  feat_sites_3:
    "**Само аудио и титлови** раде на свaком подржаном сaјту, не само на YouTube-у",
  feat_sites_4:
    "Ако сajт промени нешто, yt-dlp испоручује исправке недељно, а Arroxy аутоматски ажурира бинарни фajл при покретању",
  shot1_alt: "Налепите URL",
  shot2_alt: "Изаберите квалитет",
  shot3_alt: "Одаберите где да сачувате",
  shot4_alt: "Ред за преузимање у акцији",
  shot5_alt: "Избор језика и формата титлова",
  dl_platform_col: "Платформа",
  dl_format_col: "Формат",
  dl_win_format: "Инсталатер (NSIS) или преносиви `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` или `.flatpak` (у песковнику)",
  dl_grab: "Преузмите најновије издање →",
  dl_pkg_h3: "Инсталирај преко менаџера пакета",
  dl_channel_col: "Канал",
  dl_command_col: "Команда",
  dl_win_h3: "Windows: Инсталатер vs Преносиви",
  dl_win_col_installer: "NSIS Инсталатер",
  dl_win_col_portable: "Преносиви `.exe`",
  dl_win_r1: "Потребна инсталација",
  dl_win_r1_installer: "Да",
  dl_win_r1_portable: "Не — покрени са било ког места",
  dl_win_r2: "Аутоматска ажурирања",
  dl_win_r2_installer: "✅ унутар апликације",
  dl_win_r2_portable: "❌ ручно преузимање",
  dl_win_r3: "Брзина покретања",
  dl_win_r3_installer: "✅ брже",
  dl_win_r3_portable: "⚠️ спорије хладно покретање",
  dl_win_r4: "Додаје у Start мени",
  dl_win_r5: "Лако деинсталирање",
  dl_win_r5_portable: "❌ обришите фајл",
  dl_win_rec:
    "**Препорука:** користите NSIS инсталатер за аутоматска ажурирања и брже покретање. Користите преносиви `.exe` за опцију без инсталације и регистра.",
  dl_win_smartscreen_h4: "Упозорење Windows SmartScreen",
  dl_win_smartscreen_intro:
    "При prvom покретању можете видети **«Windows protected your PC»** или **«Unknown publisher»**. Ово се односи на `Arroxy-win-x64-Setup.exe` и `Arroxy-win-x64-Portable.exe`. Arroxy је бесплатан и отвореног кода, а Windows верзије нису потписане плаћеним сертификатом — због тога SmartScreen означава ове фајлове. То **не** значи аутоматски да је Arroxy несигуран. Да бисте наставили:",
  dl_win_smartscreen_step1: "Кликните **More info**.",
  dl_win_smartscreen_step2: "Кликните **Run anyway**.",
  dl_win_smartscreen_official:
    "Преузимајте Arroxy искључиво са званичне GitHub Releases странице. Ако сте добили фајл са другог сајта или вам је неко послао, обришите га и преузмите свежу копију из званичног извора. Изворни код је јаван, тако да га можете сами прегледати или компајлирати ако желите.",
  dl_macos_h3: "Прво покретање на macOS-у",
  dl_macos_warning:
    "Arroxy још увек није потписан кодом, па ће macOS Gatekeeper упозорити вас при првом покретању. То је очекивано — није знак оштећења.",
  dl_macos_m1_h4: "Метода системских подешавања (препоручено):",
  dl_macos_step1: "Кликните десним тастером на иконицу Arroxy апликације и изаберите **Отвори**.",
  dl_macos_step2:
    "Приказује се дијалог упозорења — кликните **Откажи** (немојте кликнути *Премести у смеће*).",
  dl_macos_step3: "Отворите **Системска подешавања → Приватност и безбедност**.",
  dl_macos_step4:
    'Скролујте до одељка **Безбедност**. Видећете *"Arroxy је блокиран јер није од идентификованог програмера."*',
  dl_macos_step5:
    "Кликните **Свеједно отвори** и потврдите лозинком или Touch ID-ом.",
  dl_macos_after:
    "Након корака 5, Arroxy се отвара нормално и упозорење се више никад не приказује.",
  dl_macos_m2_h4: "Метода терминала (напредно):",
  dl_macos_note:
    "macOS верзије се производе путем CI на Apple Silicon и Intel покретачима. Ако наиђете на проблеме, [отворите пријаву](../../issues) — повратне информације корисника macOS-а активно обликују циклус тестирања.",
  dl_linux_h3: "Прво покретање на Linux-у",
  dl_linux_intro:
    "AppImage-ови се покрећу директно — без инсталације. Само треба означити фајл као извршни.",
  dl_linux_m1_text:
    "**Менаџер фајлова:** кликните десним тастером на `.AppImage` → **Своjства** → **Дозволе** → омогућите **Дозволи извршавање фајла као програм**, затим двокликните.",
  dl_linux_m2_h4: "Терминал:",
  dl_linux_fuse_text: "Ако покретање и даље не успе, можда недостаје FUSE:",
  dl_linux_flatpak_intro:
    "**Flatpak (алтернатива у песковнику):** преузмите `Arroxy-*.flatpak` са исте странице издања.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "Зашто можете видети упозорење",
  dl_warning_p1:
    "Arroxy је open-source пројекат са MIT лиценцом. Windows и macOS верзије **нису потписане кодом** — сертификати Apple Developer ID и Windows EV за потписивање кода коштају стотине долара годишње, које независни пројекат плаћа из сопственог џепа. Без тих потписа, Windows SmartScreen и macOS Gatekeeper ће вас упозорити при првом покретању. Упозорења значе *да ваш оперативни систем не препознаје издавача* — не значе да је Arroxy малвер.",
  dl_warning_p2:
    "Три начина да сами проверите Arroxy, по растућој строгости:\n\n- **Прочитајте изворни код.** Свака линија је на [GitHub](https://github.com/antonio-orionus/Arroxy)-у и можете [изградити апликацију из изворног кода](#tech).\n- **Проверите SHA256.** Упоредите свој фајл са објављеним [`SHA256SUMS`](../../releases/latest) — погледајте [Верификујте преузимање](#verify) испод.\n- **Покрените скенирање треће стране.** Отпремите фајл на [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Windows: прво покретање",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "Ако Windows Defender означи или уклони фајл",
  dl_win_defender_p:
    "Defender хеуристика понекад означава непотписане NSIS инсталатере и Electron преносиве верзије као сумњиве. Ако Defender стави у карантин `Arroxy-win-x64-Setup.exe` или `Arroxy-win-x64-Portable.exe`, вратите га из **Windows Security → Virus & threat protection → Protection history**, а затим додајте Arroxy извршни фајл као дозвољену ставку под **Manage settings → Add or remove exclusions**. Као и у случају SmartScreen-а, покретач је недостајући потпис издавача, а не откривен малвер.",

  dl_macos_first_h3: "macOS: прво покретање",
  dl_macos_intro:
    "Arroxy још увек није потписан кодом за macOS, па ће Gatekeeper блокирати прво покретање. Тачан начин да га дозволите зависи од верзије macOS-а — Sequoia 15 је затегла стари обилазак преко десног клика → Отвори.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 и новије (актуелно)",
  dl_macos_sequoia_intro:
    "На Sequoia 15 и новијим верзијама, десни клик → Отвори више не заобилази Gatekeeper за многе апликације у карантину. Уместо тога користите панел Системских подешавања:",
  dl_macos_sequoia_step1:
    "Превуците `Arroxy.app` са монтираног DMG у `/Applications`.",
  dl_macos_sequoia_step2:
    "Двокликните Arroxy. Приказује се дијалог блокирања — кликните **Done** (не кликајте *Move to Trash*).",
  dl_macos_sequoia_step3:
    'Отворите **System Settings → Privacy & Security** и скролујте до одељка **Security**. Видећете *"Arroxy was blocked to protect your Mac"* (или сличну поруку).',
  dl_macos_sequoia_step4:
    "Кликните **Open Anyway**, потврдите лозинком или Touch ID-ом, а затим поново покрените Arroxy из `/Applications`.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 и старије",
  dl_macos_sonoma_step1:
    "Превуците `Arroxy.app` са монтираног DMG у `/Applications`.",
  dl_macos_sonoma_step2:
    "Десним кликом (или Control-кликом) кликните на `Arroxy.app` у `/Applications` и одаберите **Open**.",
  dl_macos_sonoma_step3:
    "Дијалог упозорења сада има дугме **Open** — кликните га и потврдите. Arroxy се отвара нормално и упозорење се никад више не приказује.",
  dl_macos_damaged_h4:
    '"App is damaged" или упорна блокада Gatekeeper-а — исправка путем Terminal-а',
  dl_macos_damaged_p:
    'Ако macOS каже *"Arroxy is damaged and can\'t be opened"*, или ниједан од горњих корака не уклони блокаду, узрок је атрибут карантина на DMG-у (неки претраживачи и macOS-ово сопствено понашање трансположења га постављају). Уклоните га са инсталиране апликације:',
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** на Mac рачунару са процесором серије M (M1 / M2 / M3 / M4), преузмите DMG за `arm64`. На Intel Mac рачунарима, преузмите DMG за `x64`. Покретање погрешне верзије ради преко Rosetta, али је приметно спорије.",

  dl_linux_first_h3: "Linux: прво покретање",
  dl_linux_appimagelauncher:
    "**Опционална интеграција са десктопом:** инсталирајте [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) једном, и свака AppImage коју двокликнете аутоматски се региструје у менију покретача — без ручног креирања `.desktop` фајлова.",

  dl_verify_h3: "Верификујте преузимање (SHA256)",
  dl_verify_intro:
    "Свако издање објављује `SHA256SUMS` фајл поред бинарних датотека. Да бисте проверили да ваше преузимање није оштећено или измењено у транзиту, хешујте свој фајл локално и упоредите га са линијом у `SHA256SUMS`. Отворите страницу најновијег издања → **Assets** → преузмите `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Желите скенирање малвера треће стране? Отпремите фајл на [VirusTotal](https://www.virustotal.com). Неколико генеричко-хеуристичких означавања од стране мањих машина је нормално за непотписане Electron апликације; масовна откривања од стране главних машина би представљала прави разлог за забринутост.",

  dl_pm_intro:
    "Већ користите менаџер пакета? Можете прескочити путању ручног преузимања.",

  privacy_p1:
    "Преузимања се преузимају директно преко [yt-dlp](https://github.com/yt-dlp/yt-dlp) са YouTube-а у фасциклу коју одаберете — ништа не пролази кроз сервер треће стране. Историја гледања, историја преузимања, URL-ови и садржај фајлова остају на вашем уређају.",
  privacy_p2:
    "Arroxy шаље анонимну, збирну телеметрију преко [OpenPanel](https://openpanel.dev) — само довољно да се разумеју покретања, OS, верзије апликације и рушења. Без URL-ова, наслова видеа, путања датотека, података о налогу, fingerprinting-а или личних података. ID по инсталацији је насумичан и није повезан са вашим идентитетом. Можете се одјавити у Подешавањима.",
  faq_q1: "Је ли заиста бесплатно?",
  faq_a1: "Да — MIT лиценца, без премијум нивоа, без ограничавања функција.",
  faq_q2: "Које квалитете видеа могу да преузмем?",
  faq_a2:
    "Све што YouTube служи: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, плус само аудио. Токови са 60 fps, 120 fps и HDR задржавају се без измена.",
  faq_q3: "Могу ли извући само аудио као MP3?",
  faq_a3: "Da. Izaberi *samo audio* u meniju formata, pa zatim MP3, M4A/AAC, Opus ili WAV.",
  faq_q4: "Да ли треба YouTube налог или колачићи?",
  faq_a4:
    "Подразумевано, не — Arroxy ради без YouTube налога, пријаве или извоза колачића. Опциона подршка за колачиће доступна је у Напредним подешавањима (Извор колачића: фајл или претраживач) за садржај који захтева аутентификацију, попут видеа са старосним ограничењем или доступних само члановима. Подразумевано је искључена. Ако је омогућите, документација yt-dlp-а напомиње да [аутоматизација заснована на колачићима може означити ваш Google налог](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); у том случају је безбедније користити налог за једнократну употребу.",
  faq_q5: "Хоће ли наставити да ради кад YouTube нешто промени?",
  faq_a5:
    "yt-dlp се аутоматски ажурира при покретању, а Arroxy брзо испоручује исправке кад YouTube нешто промени. Ако ипак наиђете на проблем, у Напредним подешавањима је на располагању опциона подршка за колачиће као резервна опција.",
  faq_q6: "На којим је језицима Arroxy доступан?",
  faq_a6:
    "Двадесет и један, одмах из кутије: English, Español (шпански), Deutsch (немачки), Français (француски), 日本語 (јапански), 中文 (кинески), Русский (руски), Українська (украјински), हिन्दी (хинди), Afaan Oromoo (оромо), Kiswahili (свахили), O'zbekcha (узбечки), Tiếng Việt (вијетнамски), አማርኛ (амхарски), العربية (арапски), اردو (урду), پښتو (пашто), বাংলা (бенгалски), မြန်မာဘာသာ (бурмански), Ελληνικά (грчки) и Српски. Arroxy аутоматски препознаје језик вашег оперативног система при prvom покретању и можете да пређете на други у сваком тренутку преко бирача језика у траци са алаткама. Runtime JSON датотеке локализације налазе се у src/shared/i18n/locales/, а PO каталози за преводиоце у i18n/locales/ — отворите PR на GitHub-у да допринесете.",
  faq_q7: "Да ли треба да инсталирам нешто друго?",
  faq_a7:
    "Не. yt-dlp се аутоматски преузима при првом покретању и кешира на вашем рачунару; ffmpeg и ffprobe стижу уз апликацију. Након тога није потребно додатно подешавање.",
  faq_q8: "Могу ли преузети плејлисте или целе канале?",
  faq_a8:
    "Да — обоје. Налепи playlist или channel URL (нпр. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); изабери колико entries да се скенира, па стави целу листу у queue или изабери појединачне видео снимке. Date-range filters стижу ускоро.",
  faq_q9: 'macOS каже да је "апликација оштећена" — шта да радим?',
  faq_a9:
    'То је macOS Gatekeeper блокира непотписану апликацију, а не стварно оштећење. Погледајте ["App is damaged" — исправка путем Terminal-а](#macos-first-launch) за jednolinijsku `xattr` команду која то решава.',
  faq_q10: "Да ли је преузимање YouTube видеа законито?",
  faq_a10:
    "За личну, приватну употребу то је углавном прихватљиво у већини јурисдикција. Ви сте одговорни за усклађеност са [Условима коришћења](https://www.youtube.com/t/terms) YouTube-а и локалним законима о ауторским правима.",
  plan_intro: "И даље планирано — приближно по приоритету:",
  plan_col1: "Функционалност",
  plan_col2: "Опис",
  plan_r1_name: "**Филтери плејлисти и канала**",
  plan_r1_desc: "Date-range filters при набрајању playlist-а или channel-а",
  plan_r2_name: "**Групни унос URL-ова**",
  plan_r2_desc: "Налепите више URL-ова одједном и покрените их у једном потезу",
  plan_r4_name: "**Прилагођени шаблони назива фајлова**",
  plan_r4_desc:
    "Именујте фајлове по наслову, аутору, датуму, резолуцији — са живим прегледом",
  plan_r5_name: "**Заказана преузимања**",
  plan_r5_desc: "Покрените ред у одређено доба (ноћна покретања)",
  plan_r6_name: "**Ограничења брзине**",
  plan_r6_desc: "Ограничите пропусни опсег тако да преузимања не засите везу",
  plan_r7_name: "**Исецање клипова**",
  plan_r7_desc: "Преузмите само сегмент по времену почетка/краја",
  plan_cta:
    "Имате функционалност на уму? [Отворите захтев](../../issues) — улаз заједнице обликује приоритет.",
  tech_content: TECH_CONTENT,
  tos_h2: "Услови коришћења",
  tos_note:
    "Arroxy је алат искључиво за личну, приватну употребу. Ви сте искључиво одговорни за осигурање да ваша преузимања буду у складу са [Условима коришћења](https://www.youtube.com/t/terms) YouTube-а и законима о ауторским правима у вашој јурисдикцији. Немојте користити Arroxy за преузимање, репродукцију или дистрибуцију садржаја за који немате право коришћења. Програмери нису одговорни за злоупотребу.",
  footer_credit:
    'MIT Лиценца · Са пажњом израдио <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
