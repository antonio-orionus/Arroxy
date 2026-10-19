<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Маскот Arroxy" width="180" />

# Arroxy — безкоштовний завантажувач YouTube (+ 2000 сайтів) із відкритим кодом і вбудованим браузером для Windows, macOS та Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Мова:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · **Українська** · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Реліз](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Збірка](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Сайт](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Ліцензія](https://img.shields.io/badge/license-MIT-green) ![Платформи](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Мови](https://img.shields.io/badge/i18n-31_languages-blue)

Завантажуйте відео, Shorts, музику, канали, подкасти або аудіодоріжки з **YouTube та 2000+ підтримуваних сайтів** — до 8K HDR при 60 fps, у форматі MP3 / AAC / Opus або лише потрібний фрагмент. **Переглядайте YouTube або будь-який інший сайт просто в Arroxy** на вкладці Explore і завантажуйте відео, плейлист або канал, який зараз відкрито; увійдіть там, щоб завантажувати приватні відео, відео лише для учасників і відео з віковим обмеженням, доступні вашому акаунту. Працює локально на Windows, macOS та Linux. **Без реклами, без зайвого, без апселів.**

[**↓ Завантажити останній реліз**](#install) &nbsp;·&nbsp; [**Сайт**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows: перший запуск](#windows-first-launch) · [macOS: перший запуск](#macos-first-launch) · [Linux: перший запуск](#linux-first-launch)

[![Приєднатися до Discord-спільноти](https://img.shields.io/badge/%D0%9F%D1%80%D0%B8%D1%94%D0%B4%D0%BD%D0%B0%D1%82%D0%B8%D1%81%D1%8F%20%D0%B4%D0%BE%20Discord%2D%D1%81%D0%BF%D1%96%D0%BB%D1%8C%D0%BD%D0%BE%D1%82%D0%B8-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Якщо Arroxy економить ваш час, ⭐ допомагає іншим його знайти.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Це переклад за допомогою ШІ. [README англійською](README.md) — основне джерело істини. Помітили помилку? [PR вітаються](../../pulls).

---

## Зміст

- [✨ Можливості](#features)
- [📥 Встановлення та перший запуск](#install)
  - [Windows: перший запуск](#windows-first-launch)
  - [macOS: перший запуск](#macos-first-launch)
  - [Чому ви можете побачити попередження](#why-warning)
  - [Linux: перший запуск](#linux-first-launch)
  - [Перевірте своє завантаження (SHA256)](#verify)
- [⚖️ Чому Arroxy](#why)
- [🔒 Конфіденційність](#privacy)
- [❓ Часті запитання](#faq)
- [🗺️ Дорожня карта](#roadmap)
- [💖 Підтримати Arroxy](#support)
- [🛠️ Технології](#tech)

---

## <a id="features"></a>✨ Можливості

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Переглядайте YouTube або будь-який інший сайт просто в Arroxy і завантажуйте поточну сторінку з активним профілем</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Перший екран Explore</b><br/>Короткий огляд Explore і чому другий акаунт — безпечніший спосіб входу</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Завантаження підказують, що чекає на вас</b><br/>Посилання готуються у фоні; невдале пропонує рішення, довгий плейлист чекає на ваш вибір</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Завантажте лише частину відео</b><br/>Виберіть початок і кінець або розділ — Arroxy збереже лише цей діапазон</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Редактор профілів</b><br/>Налаштуйте профіль: тип файлу, роздільна здатність, субтитри, тека, шаблон імені файлу та більше</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Темна чи світла, скло чи однотонна</b><br/>Чотири вигляди на вибір: скляні панелі на рухомому небі або спокійні однотонні поверхні, кожен у темній і світлій темі</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Глобальна гаряча клавіша завантаження Arroxy — Ctrl+Shift+D у Windows і Linux, Cmd+Shift+D у macOS, надсилає скопійоване посилання просто до черги завантажень" width="760" /></picture><br/><sub><b>Глобальна гаряча клавіша завантаження</b><br/>Скопіюйте посилання будь-де, натисніть один раз — воно потрапляє в чергу й починає завантажуватися</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Профілі для кожного відео плейлиста</b><br/>Власний профіль для кожного відео — частину в 4K, решту як MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Головна швидкого завантаження</b><br/>Вставте URL і одразу завантажте з активним профілем</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Багаторазові профілі завантаження</b><br/>Зберігайте формат, якість і вивід як пресети — використовуйте для кожного завантаження</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Багатомовні аудіодоріжки</b><br/>Виберіть саме ту мову звуку, що є у відео</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Об'ємний / Dolby звук</b><br/>Доріжки 5.1 і Dolby розпізнаються та зберігаються</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Режим масових URL</b><br/>Вставте список, авто-вилучення дублікатів, поставте все в чергу одразу</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Паралельна черга завантажень</b><br/>Кілька завантажень одночасно з живим прогресом</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: перегляд сайтів просто в Arroxy</strong></summary>

- **Вкладка Explore** — переглядайте YouTube або будь-який інший сайт просто в Arroxy і завантажуйте знайдене без копіювання посилань. **Завантажити · *ваш профіль*** додає в чергу відео, плейлист або канал, який ви зараз дивитеся; стрілка поруч перемикає профілі, а чарівна паличка відкриває покрокове завантаження для вибору форматів, субтитрів тощо
- **Завантаження правим кліком** — клацніть правою кнопкою на посилання на відео, плейлист або канал в Explore, щоб завантажити його з вашим профілем, вибрати інший профіль у меню **Завантажити з профілем**, відкрити покрокове завантаження або скопіювати посилання. Відкривати кожне відео не потрібно
- **Компактний вигляд** — один клік на панелі інструментів Explore переносить вкладки Arroxy на неї й дає сторінці більше місця
- **Адресний рядок** — введіть запит, щоб шукати на YouTube, або введіть будь-яку веб-адресу, щоб відкрити цей сайт
- **Завантаження, що потребують акаунта** — увійдіть один раз в Explore, і Arroxy зможе завантажувати приватні відео та відео лише для учасників, які доступні вашому акаунту, відео з віковим обмеженням (якщо акаунт підтверджено за віком), а також ваші списки «Дивитися пізніше» та «Вподобані». Входьте й на інші сайти — їхні завантаження використовують цей вхід, коли він потрібен. Arroxy, як і раніше, спершу завантажує без входу й використовує ваш вхід в Explore, лише коли завантаження зривається з причини, яку може вирішити акаунт. Коли YouTube просить підтвердити, що ви не бот, Arroxy також пробує ваш вхід в Explore
- **Користуйтеся другим акаунтом** — перший екран Explore пояснює чому: завантаження через акаунт несе певний ризик обмеження цього акаунта. Вийти з Explore можна в Налаштуваннях будь-коли, щоб забути всі входи
- **Блокувальник реклами** — вимкнено за замовчуванням. Один клік по щиту на панелі інструментів Explore блокує рекламу й трекери на його сторінках, не впливаючи на завантаження. YouTube може опиратися блокувальникам реклами для акаунтів, у які виконано вхід

</details>

<details>
<summary><strong>🎞️ Якість і формати</strong></summary>

- До **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Висока частота кадрів і HDR** зберігаються як є — 60 fps, HDR10
- **Аудіо** — експорт лише аудіо в MP3, M4A/AAC, Opus або WAV. В інтерактивних завантаженнях вибирайте нативні surround/Dolby доріжки джерела (AC-3, E-AC-3, 5.1, DRC), коли вони доступні, або задайте глобальне значення за замовчуванням **Надавати перевагу surround / Dolby**
- **Профілі з метою** — *Найкраща картинка* (AV1 · VP9) або *Смарт-ТВ* (MP4 · H.264), що зберігаються як Авто, MP4, MKV або WebM без перекодування. HDR — це *Авто* (лише коли ваш екран може його показати), *SDR* або *HDR*
- **Будь-який кодек у будь-якій роздільній здатності** — покрокове завантаження показує AV1, VP9 і H.264 поруч для кожної роздільної здатності, щоб ви обрали той, який відтворює ваш телевізор або відеоредактор
- **Знайте, що за потік перед вами** — позначаються роздільні здатності, які YouTube збільшив за допомогою ШІ, мови аудіо з дубляжем ШІ, потоки з підвищеним бітрейтом, відео 360°, а також пошкоджені копії та копії з водяними знаками. Профілі пропускають потоки, збільшені ШІ, якщо ви їх не дозволили

</details>

<details>
<summary><strong>🛡️ Конфіденційність і контроль</strong></summary>

- 100% локальна обробка — завантаження потрапляють прямо з YouTube на ваш диск
- Без логіну, без кук, без прив'язки акаунта Google
- Файли зберігаються прямо у вибрану вами теку

</details>

<details>
<summary><strong>⚡ Робочий процес</strong></summary>

- **Глобальна гаряча клавіша завантаження** — скопіюйте посилання в будь-якому застосунку й натисніть `Ctrl+Shift+D` (`Cmd+Shift+D` на macOS); Arroxy додасть його до черги з вашим активним профілем, не відкриваючи вікно, а сповіщення це підтвердить. Увімкнено за замовчуванням, комбінацію можна змінити
- **Гнучкі режими старту** — оберіть покрокове одиночне завантаження, вибір плейлиста/каналу, масове вставлення URL, Quick Download зі збереженими стандартами або перегляд і завантаження з Explore
- **Центральна черга завантажень** — кожне single, playlist, bulk або quick завдання потрапляє в одне місце для прогресу, паузи, відновлення, скасування, повтору та керування пріоритетом
- **Моніторинг буфера обміну** — скопіюйте посилання на відео, і воно з’явиться в полі URL, коли ви повернетеся в Arroxy, з кнопкою **Скасувати**, якщо ви цього не хотіли. Поки Arroxy зайнятий, посилання чекає, доки ви не повернетеся на вкладку «Посилання» (вимикається в Налаштуваннях)
- **Автоочищення URL** — видаляє трекінгові параметри (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) і розгортає посилання `youtube.com/redirect`
- **Режим трею** — закриття вікна залишає завантаження працювати у фоні
- **31 мов** — автоматично визначає локаль системи, можна перемкнути будь-коли
- **Синхронізація плейлиста** — повторно звіряє плейлист із локальною папкою, щоб пропускати вже завантажені відео; створює файл плейлиста `.m3u`, який оновлюється після кожного завантаженого відео
- **Керування швидкістю та pacing** — обмежуйте download bandwidth, задавайте, скільки частин відео завантажується одночасно, і додавайте затримки між запитами з пресетами (*Вимк · Збалансовано · Обережно · Власний*)
- **Шаблони імен файлів** — називайте завантаження на свій смак за допомогою `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` та `{playlist_index}`, глобально або для кожного профілю завантаження
- **Завантажень одночасно та автоповтор** — обирайте, скільки завантажень із черги йде одночасно, і дозвольте Arroxy повторити завантаження після збою мережі або сервера, збільшуючи паузу перед кожною спробою
- **Профілі для кожного відео плейлиста** — призначайте кожному відео в плейлисті власний профіль завантаження замість одного налаштування для всього списку, щоб за один прохід частину відео зберегти в повній якості, а решту — як MP3
- **Quick Download працює у фоні** — посилання одразу з’являється в Завантаженнях і готується там, примітка з кнопкою **Переглянути** підтверджує це, а поле URL очищується для наступного посилання. Запускайте скільки завгодно, поки попередні готуються
- **Завантаження підказують, що чекає на вас** — якщо Arroxy не може прочитати посилання, його рядок пояснює причину й пропонує рішення: «Повторити», увімкнути cookies або увійти в Explore. Коли cookies вимкнено, **Увійти через Explore** повторить спробу за вас після входу. Плейлист довший за ваш ліміт завантаження чекає у своєму рядку, доки ви оберете весь плейлист, перші елементи або перегляд. Вкладка «Завантаження» показує кількість рядків, що чекають на вас
- **Завантажуй лише частину відео** — вибери початок і кінець або розділ на екрані «Формат», і Arroxy збереже лише цей діапазон, а в назві файлу діапазон іде після ідентифікатора відео. Розрізи припадають на найближчий ключовий кадр; увімкни точне вирізання, щоб натомість перекодувати
- **Прибирати завершені завантаження** — необов’язково: завершене завантаження зникає зі списку через 5 секунд. Його файли залишаються на диску, а невдалі завантаження лишаються в списку
- **Розмір і Відсутній у Завантаженнях** — стовпець **Розмір** із сортуванням показує, скільки місця займає кожне завантаження, а **Відсутній** позначає файли, переміщені або видалені поза Arroxy
- **Aurora або Мінімалістичний, темна чи світла** — скляні панелі на тлі рухомого неба або спокійні суцільні поверхні; перемикайте внизу вікна. Комп’ютери без графічного прискорення автоматично отримують Мінімалістичний
- **Рядок меню Mac** — у macOS відкривайте Налаштування (`Cmd+,`), задавайте обмеження швидкості завантаження, перемикайте стиль і тему, відкривайте журнали або зберігайте файл діагностики з рядка меню
- **Змінюйте профіль з будь-якого завантаження** — налаштуйте завантаження, потім оновіть профіль, з якого воно почалося (з попереднім переглядом змін), або збережіть налаштування як новий профіль. Під час зміни профілю Arroxy запитає, чи зберегти ваші правки

</details>

<details>
<summary><strong>📝 Субтитри та постобробка</strong></summary>

- **Субтитри** у SRT, VTT або ASS — ручні або авто-згенеровані, будь-якою доступною мовою
- Зберігайте поруч із відео, вбудовуйте в `.mkv` або складайте в підпапку `Subtitles/`
- **Пакети лише із субтитрами** — вставте список посилань або відкрийте плейлист, виберіть «Субтитри» й отримайте для кожного відео лише файли субтитрів
- **SponsorBlock** — пропускайте або позначайте розділами спонсорські вставки, вступи, кінцівки, самопіар
- **Вбудовані метадані** — назва, дата завантаження, канал, опис, мініатюра та маркери розділів записуються у файл

</details>

<details>
<summary><strong>🌐 YouTube + 2000 сайтів</strong></summary>

- **YouTube — у повному обсязі** — відео, Shorts, канали, плейлисти, YouTube Music і подкасти обробляються як першокласні джерела
- **2000+ інших сайтів** через yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable та багато іншого
- **Лише аудіо та субтитри** працюють на кожному підтримуваному сайті, а не лише на YouTube
- Якщо сайт змінюється, yt-dlp щотижня випускає виправлення, а Arroxy оновлює бінарний файл при запуску

</details>

---

## <a id="install"></a>📥 Встановлення та перший запуск

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

Збірки лише x86_64. Немає `curl`? Замініть `curl -fsSL` на `wget -qO-`.

| Платформа | Формат |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Завантажити останній реліз →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows: перший запуск</strong></summary>

При першому запуску ви можете побачити **«Windows protected your PC»** або **«Unknown publisher»**. Це стосується як `Arroxy-win-x64-Setup.exe`, так і `Arroxy-win-x64-Portable.exe`. Arroxy є безкоштовним і відкритим, а Windows-збірки не підписані платним сертифікатом — саме тому SmartScreen їх позначає. Це **не** означає автоматично, що Arroxy небезпечний. Щоб продовжити:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Натисніть **More info**.
2. Натисніть **Run anyway**.

#### Якщо Windows Defender позначив або видалив файл

Евристика Defender іноді позначає непідписані інсталятори NSIS і портативні версії Electron як підозрілі. Якщо Defender помістив у карантин `Arroxy-win-x64-Setup.exe` або `Arroxy-win-x64-Portable.exe`, відновіть файл із **Windows Security → Virus & threat protection → Protection history**, а потім додайте виконуваний файл Arroxy до списку дозволених елементів у розділі **Manage settings → Add or remove exclusions**. Як і у випадку зі SmartScreen, причиною є відсутній підпис видавця, а не виявлення шкідливого ПЗ.

> Завантажуйте Arroxy лише з офіційної сторінки GitHub Releases. Якщо ви отримали файл з іншого сайту або хтось надіслав його вам — видаліть його та завантажте свіжу копію з офіційного джерела. Вихідний код відкритий, тому за бажанням ви можете перевірити його або зібрати Arroxy самостійно.

Віддаєте перевагу Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS: перший запуск</strong></summary>

Arroxy ще не підписаний кодом для macOS, тому після встановлення з DMG Gatekeeper може показати страшний діалог *"Arroxy.app is damaged and can't be opened"*. Це означає, що macOS помістила непідписаний застосунок у quarantine; файли застосунку насправді не пошкоджені. У сучасних версіях macOS надійне рішення — Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Перетягніть `Arroxy.app` зі змонтованого DMG до `/Applications`.
2. Відкрийте Terminal і виконайте ці дві команди:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Перша команда видаляє атрибут quarantine з установленої копії Arroxy. Друга запускає застосунок. `sudo` може попросити пароль Mac; Terminal не показує символи під час введення.

**Apple Silicon vs Intel:** на Mac із процесором серії M (M1 / M2 / M3 / M4) завантажуйте DMG для `arm64`. На Intel Mac — DMG для `x64`. Неправильна збірка також запускатиметься через Rosetta, але помітно повільніше.

> Збірки macOS виробляються через CI на Apple Silicon та Intel рушіях. Якщо виникнуть проблеми, будь ласка, [відкрийте issue](../../issues) — зворотний зв'язок від користувачів macOS активно впливає на цикл тестування macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Чому ви можете побачити попередження</strong></summary>

Arroxy — проєкт із відкритим кодом і ліцензією MIT. Збірки для Windows та macOS **не підписані кодом** — сертифікати Apple Developer ID та Windows EV для підпису коду коштують сотні доларів на рік, і незалежний проєкт сплачує їх із власної кишені. Без цих підписів Windows SmartScreen і macOS Gatekeeper попереджатимуть вас при першому запуску. Попередження означають *що ваша ОС не розпізнає видавця* — вони не означають, що Arroxy є шкідливим ПЗ.

Три способи самостійно перевірити Arroxy, у порядку зростання строгості:

- **Прочитайте вихідний код.** Кожен рядок є на [GitHub](https://github.com/antonio-orionus/Arroxy), і ви можете [зібрати Arroxy з джерел](#tech).
- **Перевірте SHA256.** Порівняйте свій файл із опублікованим [`SHA256SUMS`](../../releases/latest) — дивіться [Перевірте своє завантаження](#verify) нижче.
- **Запустіть стороннє сканування.** Завантажте файл на [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux: перший запуск</strong></summary>

AppImage запускаються безпосередньо — без встановлення. Потрібно лише позначити файл як виконуваний.

**Файловий менеджер:** клацніть правою кнопкою на `.AppImage` → **Властивості** → **Права** → увімкніть **Дозволити виконання файлу як програми**, потім подвійний клік.

**Термінал:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Якщо запуск все одно не вдається — запустіть без монтування, пакунок FUSE не потрібен:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Необов'язкова інтеграція з робочим столом:** встановіть [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) один раз, і будь-який AppImage, на який ви двічі клацнете, автоматично реєструватиметься в меню запуску — без ручного створення `.desktop`-файлів.

**Звичайний архів (без FUSE, без встановлення):**

Збірка `.tar.gz` — той самий застосунок без оболонки AppImage: розпакуйте будь-куди й запустіть. Ані інсталятора, ані пакунка FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Завантаження для Linux на сторінці релізів лише x86_64.** На машинах ARM64 (Raspberry Pi, Asahi Linux) Flatpak встановиться, але не запуститься: `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Перевірте своє завантаження (SHA256)</strong></summary>

До кожного релізу публікується файл `SHA256SUMS` поруч із бінарними файлами. Щоб переконатися, що ваш файл не було пошкоджено або підмінено під час передачі, обчисліть хеш файлу локально та порівняйте його з рядком у `SHA256SUMS`. Відкрийте сторінку останнього релізу → **Assets** → завантажте `SHA256SUMS`.

**Windows (PowerShell or Command Prompt):**

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

Хочете стороннє сканування на шкідливе ПЗ? Завантажте файл на [VirusTotal](https://www.virustotal.com). Кілька спрацьовувань узагальненої евристики у другорядних рушіях — норма для непідписаних Electron-застосунків; масові виявлення у великих рушіях були б справжнім приводом для занепокоєння.

</details>

<details>
<summary><strong>📦 Windows: Інсталятор vs Портативна версія</strong></summary>

|               | Інсталятор NSIS | Портативний `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Потрібне встановлення | Так  | Ні — запускається будь-звідки  |
| Авто-оновлення | ✅ у застосунку  | ❌ ручне завантаження  |
| Швидкість запуску | ✅ швидше  | ⚠️ повільніший холодний старт  |
| Додається до меню «Пуск» |            ✅            |           ❌            |
| Зручне видалення |            ✅            | ❌ просто видаліть файл  |

**Рекомендація:** використовуйте інсталятор NSIS для авто-оновлень і швидкого запуску. Використовуйте портативний `.exe` для варіанту без встановлення та без змін реєстру.

</details>

---

## <a id="why"></a>⚖️ Чому Arroxy

Порівняння з найпоширенішими альтернативами:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Вбудований браузер (перегляд, вхід, завантаження) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Приватні відео, відео лише для учасників і з віковим обмеженням без експорту cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Безкоштовно, без преміум-рівня |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Відкритий код |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Лише локальна обробка |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Без обмежень використання |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Крос-платформний настільний застосунок |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Субтитри + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = частково або лише на платному тарифі. Вхід у застосунку для приватних відео в 4K Video Downloader — платна функція; більшість безкоштовних GUI для yt-dlp приймають лише файл cookies або зчитують cookies вашого браузера.

Arroxy створений для однієї задачі: чистий локальний файл — вставите ви URL чи знайдете відео в Explore. Без апселів, без збору даних.

### <a id="why-explore"></a>🧭 Чого не вміє проста обгортка над yt-dlp: вкладка Explore

Більшість безкоштовних завантажувачів YouTube — це поле для URL поверх yt-dlp. Arroxy теж використовує yt-dlp, але в ньому є **Explore** — браузер, вбудований у застосунок, який відкриває YouTube або будь-який інший сайт. Explore обходить обмеження, з якими поле для URL не впорається:

- **Відео, що потребують акаунта, без експорту cookies** — приватні відео, відео лише для учасників і з віковим обмеженням (на акаунті, підтвердженому за віком), а також ваші списки «Дивитися пізніше» та «Вподобані», а також відео за входом на інших сайтах. Простій обгортці потрібен експорт cookies.txt або доступ до cookies вашого браузера, а Chrome у Windows тепер такий доступ блокує. В Arroxy достатньо один раз увійти в Explore — решту застосунок зробить сам
- **«Увійдіть, щоб підтвердити, що ви не бот»** — коли YouTube про це просить, Arroxy не здається, а повторює завантаження з вашим входом в Explore
- **Токен завантаження YouTube** — вбудований браузер Arroxy отримує токен, на який YouTube чекає перед завантаженням. Без нього YouTube може віддати менше форматів і нижчу якість, ніж ви запросили
- **Без копіювання посилань** — знайдіть відео, плейлист або канал в Explore і завантажте його одним кліком або клацніть правою кнопкою на будь-яке посилання на сторінці
- **Блокувальник реклами, коли він потрібен** — один клік по щиту блокує рекламу й трекери на сторінках Explore

---

## <a id="privacy"></a>🔒 Конфіденційність

Завантаження виконуються безпосередньо через [yt-dlp](https://github.com/yt-dlp/yt-dlp) з YouTube у вибрану вами теку — нічого не маршрутизується через сторонні сервери. Історія перегляду, історія завантажень, URL та вміст файлів залишаються на вашому пристрої.

Жодної телеметрії — лише один анонімний сигнал на день: версія застосунку, ОС, мова, спосіб встановлення та країна, щоб ми могли порахувати активних користувачів. Без ID, URL, назв відео, шляхів до файлів чи даних акаунта. Можна вимкнути в Налаштуваннях.

Explore має власні входи, окремі від вашого браузера, а Arroxy ніколи не читає й не заповнює форму входу — ви вводите дані на сторінці самого сайту. Завантаження виконуються без входу; лише коли завантаження зривається з причини, яку може вирішити акаунт, Arroxy заново зчитує вхід, зберігає його в тимчасовому файлі на час цього завантаження й видаляє файл після. Вихід з Explore в Налаштуваннях стирає їх.

---

## <a id="faq"></a>❓ Часті запитання

<details>
<summary><strong>Це справді безкоштовно?</strong></summary>

Так — ліцензія MIT, без преміум-рівня, без заблокованих функцій.

</details>

<details>
<summary><strong>Чим Arroxy відрізняється від інших GUI для yt-dlp?</strong></summary>

Більшість безкоштовних GUI для yt-dlp — це обгортки, які приймають лише посилання. В Arroxy є **Explore** — вбудований у застосунок браузер, який відкриває YouTube або будь-який інший сайт: ви переглядаєте і завантажуєте без копіювання посилань, а увійшовши там один раз, можете завантажувати приватні відео, відео лише для учасників і з віковим обмеженням, а також списки «Дивитися пізніше» та «Вподобані» — без експорту cookies. Arroxy використовує цей вхід, коли YouTube просить підтвердити, що ви не бот, а його вбудований браузер отримує токен завантаження YouTube, щоб завантаження не відкочувалися до меншого набору форматів. Докладніше — у розділі [Чому Arroxy](#why).

</details>

<details>
<summary><strong>Які якості відео можна завантажувати?</strong></summary>

Будь-які, що пропонує YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, а також лише аудіо. Потоки 60 fps і HDR зберігаються як є, а покрокове завантаження дає змогу вибрати AV1, VP9 або H.264 для кожної роздільної здатності.

</details>

<details>
<summary><strong>Чи можна витягти лише аудіо як MP3?</strong></summary>

Так. Обери *лише аудіо* в меню форматів, а потім MP3, M4A/AAC, Opus або WAV.

</details>

<details>
<summary><strong>Як завантажувати відео, для яких потрібен акаунт YouTube?</strong></summary>

Увійдіть один раз на вкладці Explore. Після цього Arroxy зможе завантажувати приватні відео та відео лише для учасників, які доступні вашому акаунту, відео з віковим обмеженням (якщо акаунт підтверджено за віком), а також ваші списки «Дивитися пізніше» та «Вподобані». Цей вхід використовується, лише коли завантаження зривається з причини, яку може вирішити акаунт; усе інше завантажується як і раніше. Це варіант **Вхід через Explore**: він стоїть першим і позначений «Рекомендовано» в налаштуваннях cookies, а Arroxy обирає його сам, коли ви вперше відкриваєте Explore. У вікі yt-dlp зазначено, що [автоматизація з входом в акаунт може позначити акаунт Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), тож безпечніше використовувати другий акаунт.

</details>

<details>
<summary><strong>Чи продовжить він працювати, якщо YouTube щось зміниться?</strong></summary>

yt-dlp автоматично оновлюється під час запуску, а Arroxy оперативно випускає виправлення, коли YouTube щось змінює. Коли YouTube просить підтвердити, що ви не бот, Arroxy також пробує ваш вхід в Explore, якщо ви там увійшли, а cookies з файлу чи браузера доступні в налаштуваннях cookies.

</details>

<details>
<summary><strong>Якими мовами доступний Arroxy?</strong></summary>

31 мов доступні одразу: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy автоматично визначає мову операційної системи під час першого запуску, а перемкнути її можна будь-коли через вибір мови на панелі інструментів. Runtime locale JSON зберігається в src/shared/i18n/locales/, а PO-каталоги для перекладачів — в i18n/locales/ — відкрийте PR на GitHub, щоб долучитися.

</details>

<details>
<summary><strong>Чи потрібно щось встановлювати додатково?</strong></summary>

Ні. yt-dlp, ffmpeg і ffprobe автоматично завантажуються при першому запуску й кешуються на вашій машині. Після цього жодних додаткових налаштувань не потрібно.

</details>

<details>
<summary><strong>Чи можна завантажувати плейлисти або цілі канали?</strong></summary>

Так — і те, й інше. Вставте URL playlist або channel (наприклад, `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); виберіть, скільки entries сканувати, а потім додайте весь список у queue або виберіть окремі відео. Date-range filters з’являться незабаром.

</details>

<details>
<summary><strong>macOS каже «застосунок пошкоджений» — що робити?</strong></summary>

Це macOS Gatekeeper блокує непідписаний застосунок, а не реальне пошкодження. Команди Terminal для зняття quarantine і запуску Arroxy дивіться в [macOS first launch](#macos-first-launch).

</details>

<details>
<summary><strong>Чи законно завантажувати відео YouTube?</strong></summary>

Для особистого, приватного використання це загалом прийнято в більшості юрисдикцій. Ви несете відповідальність за дотримання [Умов використання](https://www.youtube.com/t/terms) YouTube та місцевого авторського права.

</details>

---

## <a id="roadmap"></a>🗺️ Дорожня карта

Досі заплановано — приблизно за пріоритетом:

| Функція    | Опис    |
| ---------------- | ---------------- |
| **Фільтри плейлистів і каналів** | Date-range filters під час переліку playlist або channel |
| **Пріоритети аудіодоріжок YouTube** | Задати бажану мовну аудіодоріжку для всього застосунку, із перевизначеннями в окремих профілях, коли YouTube надає кілька аудіотреків |
| **Надійніше відновлення повтором** | Новий шлях повторної спроби для завантажень, перерваних нестабільним або проблемним інтернет-з'єднанням |
| **Повноцінний менеджер завантажень у drawer** | Перетворити drawer черги на повніший менеджер, включно зі зміною папок призначення для елементів у черзі |
| **Заплановані завантаження** | Запускайте чергу в заданий час (нічні запуски) |
| **Пакет в AUR** | Встановлення в Arch Linux та Omarchy через `yay -S arroxy-bin` |

Маєте ідею? [Відкрийте запит](../../issues) — голос спільноти визначає пріоритети.

---

## <a id="support"></a>💖 Підтримати Arroxy

Arroxy безкоштовний і має ліцензію MIT — без реклами, без телеметрії, без платної версії. Якщо він заощаджує ваш час, ви можете підтримати розробку через Bitcoin, Tron або Ethereum: адреси наведені в [DONATE.md](DONATE.md) — єдиному офіційному джерелі для них. Arroxy ніколи не надішле вам адресу електронною поштою чи в особистому повідомленні. Зірка репозиторію, повідомлення про помилки та покращення перекладів допомагають не менше.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Технології

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — крос-платформна настільна оболонка
- **React 19** + **TypeScript** — інтерфейс
- **Tailwind CSS v4** — стилізація
- **Zustand** — керування станом
- **yt-dlp** + **ffmpeg** — рушій завантаження та мультиплексування (обидва отримуються під час роботи: yt-dlp підтримується актуальним, ffmpeg/ffprobe встановлюються один раз і зберігаються між оновленнями)
- **Vite** + **electron-vite** — збірка
- **Vitest** + **Playwright** — модульні та наскрізні тести

</details>

<details>
<summary><strong>Збірка з вихідного коду</strong></summary>

### Передумови — всі платформи

| Інструмент | Версія  | Встановлення |
| ---------- | ------- | ------------ |
| Git        | будь-яка | [git-scm.com](https://git-scm.com) |
| Node.js    | 24.21.0 | `mise install` або `.node-version` |
| Bun        | 1.4.2  | `mise install` або `package.json` `packageManager` |

Рекомендовано: встановіть `mise`, а потім запустіть `mise install` у checkout. Без mise вручну активуйте Node.js з `.node-version` і Bun з `package.json` перед `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools і Python можуть знадобитися для нативних перебудов.

### macOS

```bash
brew install mise
xcode-select --install
```

Після клонування запустіть `mise trust && mise install` у checkout. Якщо ваш shell уже використовує `fnm`, `nvm` або Bun з Homebrew, активуйте mise у `~/.zshrc`, щоб Arroxy отримав Node.js 24.21.0 і Bun 1.4.2:

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

# Залежності збірки та середовища виконання Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Лише для E2E-тестів (Electron потребує дисплея)
sudo apt install -y xvfb
```

### Клонування та запуск

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # рекомендовано; пропустіть, якщо закріплені інструменти активовані вручну
bun run bootstrap
bun run doctor
bun run dev            # Electron-застосунок із Vite-рендерером
```

### Збірка дистрибутиву

```bash
bun run build        # перевірка типів + компіляція
bun run dist         # пакування для поточної ОС
bun run dist:win     # пакування Windows-цілей на підтримуваному хості
```

> `bun run bootstrap` встановлює залежності, перебудовує залежності Electron-застосунку, перевіряє Electron, готує вбудовані ffmpeg/ffprobe для розробки та встановлює Playwright Chromium. Релізні збірки керують yt-dlp, ffmpeg і ffprobe під час роботи в папці даних застосунку; жоден із них не входить до інсталятора.

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

## 📜 Умови використання

Arroxy — інструмент виключно для особистого, приватного використання. Ви одноосібно відповідаєте за те, щоб ваші завантаження відповідали [Умовам використання](https://www.youtube.com/t/terms) YouTube та авторському праву вашої юрисдикції. Не використовуйте Arroxy для завантаження, відтворення чи розповсюдження контенту, на який ви не маєте прав. Розробники не несуть відповідальності за зловживання.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Ліцензія MIT · Зроблено з турботою <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
