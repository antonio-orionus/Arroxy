<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Маскот Arroxy" width="180" />

# Arroxy — бесплатный загрузчик YouTube (+ 2000 сайтов) с открытым исходным кодом и встроенным браузером для Windows, macOS и Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Язык:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · **Русский** · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Релиз](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Сборка](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Сайт](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Лицензия](https://img.shields.io/badge/license-MIT-green) ![Платформы](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Языки](https://img.shields.io/badge/i18n-31_languages-blue)

Скачивайте видео, Shorts, музыку, каналы, подкасты или аудиодорожки с **YouTube и 2000+ поддерживаемых сайтов** — до 8K HDR при 60 fps, в виде MP3 / AAC / Opus или только нужный фрагмент. **Просматривайте YouTube или любой другой сайт прямо в Arroxy** на вкладке Explore и скачивайте видео, плейлист или канал, который сейчас открыт; войдите там, чтобы скачивать приватные видео, видео только для участников и видео с возрастным ограничением, доступные вашему аккаунту. Работает локально на Windows, macOS и Linux. **Без рекламы, без лишнего, без допродаж.**

[**↓ Скачать последний релиз**](#install) &nbsp;·&nbsp; [**Сайт**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows: первый запуск](#windows-first-launch) · [macOS: первый запуск](#macos-first-launch) · [Linux: первый запуск](#linux-first-launch)

[![Присоединиться к Discord-сообществу](https://img.shields.io/badge/%D0%9F%D1%80%D0%B8%D1%81%D0%BE%D0%B5%D0%B4%D0%B8%D0%BD%D0%B8%D1%82%D1%8C%D1%81%D1%8F%20%D0%BA%20Discord%2D%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D1%81%D1%82%D0%B2%D1%83-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Если Arroxy экономит вам время — ⭐ поможет другим его найти.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Это перевод с помощью ИИ. [README на английском](README.md) — основной источник истины. Заметили ошибку? [Pull request приветствуется](../../pulls).

---

## Содержание

- [✨ Возможности](#features)
- [📥 Установка и первый запуск](#install)
  - [Windows: первый запуск](#windows-first-launch)
  - [macOS: первый запуск](#macos-first-launch)
  - [Почему вы можете увидеть предупреждение](#why-warning)
  - [Linux: первый запуск](#linux-first-launch)
  - [Проверьте вашу загрузку (SHA256)](#verify)
- [⚖️ Почему Arroxy](#why)
- [🔒 Конфиденциальность](#privacy)
- [❓ Часто задаваемые вопросы](#faq)
- [🗺️ Дорожная карта](#roadmap)
- [💖 Поддержать Arroxy](#support)
- [🛠️ Создано на](#tech)

---

## <a id="features"></a>✨ Возможности

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Просматривайте YouTube или любой другой сайт прямо в Arroxy и скачивайте текущую страницу с активным профилем</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Первый экран Explore</b><br/>Краткий обзор Explore и почему второй аккаунт — более безопасный вариант входа</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Загрузки подсказывают, что ждёт вас</b><br/>Ссылки готовятся в фоне; неудавшаяся предлагает решение, длинный плейлист ждёт вашего выбора</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Скачайте только часть видео</b><br/>Выберите начало и конец или главу — Arroxy сохранит только этот фрагмент</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Редактор профилей</b><br/>Тонкая настройка профиля: тип файла, разрешение, субтитры, папка, шаблон имени файла и не только</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Тёмная или светлая, стекло или без эффектов</b><br/>Четыре вида на выбор: стеклянные панели на движущемся небе или спокойные однотонные поверхности, каждый в тёмной и светлой теме</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Глобальная горячая клавиша загрузки Arroxy — Ctrl+Shift+D в Windows и Linux, Cmd+Shift+D в macOS, отправляет скопированную ссылку прямо в очередь загрузок" width="760" /></picture><br/><sub><b>Глобальная горячая клавиша загрузки</b><br/>Скопируйте ссылку где угодно и нажмите один раз — она попадёт в очередь и начнёт скачиваться</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Профили для каждого видео плейлиста</b><br/>Своя настройка для каждого видео — часть в 4K, остальные как MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Главная быстрой загрузки</b><br/>Вставьте URL и сразу скачайте с активным профилем</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Многоразовые профили загрузки</b><br/>Сохраняйте формат, качество и вывод как пресеты — используйте при каждой загрузке</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Многоязычные аудиодорожки</b><br/>Выберите именно тот язык аудио, что есть в видео</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Объёмный / Dolby звук</b><br/>Дорожки 5.1 и Dolby распознаются и сохраняются</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Режим массовых URL</b><br/>Вставьте список, авто-удаление дубликатов, поставьте всё в очередь сразу</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Параллельная очередь загрузок</b><br/>Несколько загрузок одновременно с живым прогрессом</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: просмотр сайтов прямо в Arroxy</strong></summary>

- **Вкладка Explore** — просматривайте YouTube или любой другой сайт прямо в Arroxy и скачивайте найденное без копирования ссылок. **Скачать · *ваш профиль*** ставит в очередь видео, плейлист или канал, который вы сейчас смотрите; стрелка рядом переключает профили, а волшебная палочка открывает пошаговую загрузку для выбора форматов, субтитров и не только
- **Скачивание по правому клику** — щёлкните правой кнопкой по ссылке на видео, плейлист или канал в Explore, чтобы скачать его с вашим профилем, выбрать другой профиль в меню **Скачать с профилем**, открыть пошаговую загрузку или скопировать ссылку. Открывать каждое видео не нужно
- **Компактный вид** — один щелчок на панели инструментов Explore переносит вкладки Arroxy в неё и освобождает больше места странице
- **Адресная строка** — введите запрос для поиска на YouTube или любой веб-адрес, чтобы открыть этот сайт
- **Загрузки, которым нужен аккаунт** — войдите один раз в Explore, и Arroxy сможет скачивать приватные видео и видео только для участников, доступные вашему аккаунту, видео с возрастным ограничением (если аккаунт подтверждён по возрасту), а также списки «Смотреть позже» и «Понравившиеся». Входите и на других сайтах — их загрузки используют этот вход, когда он нужен. Arroxy по-прежнему сначала скачивает без входа и использует ваш вход в Explore, только когда загрузка не удаётся по причине, которую может решить аккаунт. Когда YouTube просит подтвердить, что вы не бот, Arroxy тоже пробует ваш вход в Explore
- **Используйте второй аккаунт** — первый экран Explore объясняет почему: загрузка через аккаунт несёт некоторый риск ограничения этого аккаунта. Выйти из Explore можно в Настройках в любой момент, чтобы забыть свои входы
- **Блокировщик рекламы** — выключен по умолчанию. Один щелчок по щиту на панели инструментов Explore блокирует рекламу и трекеры на его страницах, не влияя на загрузки. YouTube может сопротивляться блокировщикам рекламы для аккаунтов, выполнивших вход

</details>

<details>
<summary><strong>🎞️ Качество и форматы</strong></summary>

- До **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Высокая частота кадров и HDR** сохраняются как есть — 60 fps, HDR10
- **Аудио** — экспорт только аудио в MP3, M4A/AAC, Opus или WAV. В интерактивных загрузках выбирайте нативные surround/Dolby дорожки источника (AC-3, E-AC-3, 5.1, DRC), когда они доступны, или задайте глобальное значение по умолчанию **Предпочитать surround / Dolby**
- **Профили с целью** — *Лучшая картинка* (AV1 · VP9) или *Смарт-ТВ* (MP4 · H.264), сохраняются как Авто, MP4, MKV или WebM без перекодирования. HDR — это *Авто* (только если экран умеет его показывать), *SDR* или *HDR*
- **Любой кодек в любом разрешении** — пошаговая загрузка показывает AV1, VP9 и H.264 рядом для каждого разрешения, чтобы вы выбрали тот, который воспроизводит ваш телевизор или видеоредактор
- **Знайте, что за поток перед вами** — помечаются разрешения, которые YouTube увеличил с помощью ИИ, языки аудио с ИИ-дубляжом, потоки с улучшенным битрейтом, видео 360°, а также повреждённые копии и копии с водяными знаками. Профили пропускают потоки, увеличенные ИИ, если вы их не разрешили

</details>

<details>
<summary><strong>🛡️ Конфиденциальность и контроль</strong></summary>

- 100% локальная обработка — загрузки идут напрямую с YouTube на ваш диск
- Без логина, без кук, без привязки к аккаунту Google
- Файлы сохраняются прямо в выбранную вами папку

</details>

<details>
<summary><strong>⚡ Рабочий процесс</strong></summary>

- **Глобальная горячая клавиша загрузки** — скопируйте ссылку в любом приложении и нажмите `Ctrl+Shift+D` (`Cmd+Shift+D` на macOS); Arroxy добавит её в очередь с вашим активным профилем, не открывая окно, а уведомление это подтвердит. Включено по умолчанию, сочетание можно изменить
- **Гибкие режимы запуска** — выберите пошаговую одиночную загрузку, выбор плейлиста/канала, массовую вставку URL, Quick Download с сохранёнными настройками по умолчанию или просмотр и загрузку из Explore
- **Центральная очередь загрузок** — каждая одиночная, плейлистная, массовая или быстрая задача попадает в одно место для прогресса, паузы, возобновления, отмены, повтора и управления приоритетом
- **Мониторинг буфера обмена** — скопируйте ссылку на видео, и она появится в поле URL, когда вы вернётесь в Arroxy, с кнопкой **Отменить**, если вы этого не хотели. Пока Arroxy занят, ссылка ждёт, когда вы вернётесь на вкладку «Ссылка» (отключается в Настройках)
- **Автоочистка URL** — удаляет трекинговые параметры (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) и разворачивает ссылки `youtube.com/redirect`
- **Режим трея** — закрытие окна сохраняет загрузки в фоновом режиме
- **Языки: 31** — автоматически определяет язык системы, можно переключить в любой момент
- **Синхронизация плейлиста** — повторно сверяет плейлист с локальной папкой, чтобы пропускать уже скачанные видео; создает файл плейлиста `.m3u`, который обновляется после каждого скачанного видео
- **Управление скоростью и темпом** — ограничивайте пропускную способность загрузки, задавайте, сколько частей видео скачивается одновременно, и добавляйте задержки между запросами с пресетами (*Выкл · Сбалансированно · Осторожно · Свой*)
- **Шаблоны имён файлов** — называйте загрузки по-своему с помощью `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` и `{playlist_index}`, глобально или для каждого профиля загрузки
- **Загрузок одновременно и автоповтор** — выбирайте, сколько загрузок из очереди идёт одновременно, и позвольте Arroxy повторить загрузку после сбоя сети или сервера, увеличивая паузу перед каждой попыткой
- **Профили для каждого видео плейлиста** — назначайте каждому видео в плейлисте собственный профиль загрузки вместо одной настройки для всего списка, чтобы за один проход часть видео сохранялась в полном качестве, а остальные — как MP3
- **Quick Download работает в фоне** — ссылка сразу появляется в Загрузках и готовится там, заметка с кнопкой **Открыть** подтверждает это, а поле URL очищается для следующей ссылки. Запускайте сколько угодно, пока предыдущие готовятся
- **Загрузки подсказывают, что ждёт вас** — если Arroxy не может прочитать ссылку, её строка объясняет причину и предлагает решение: «Повторить», включить cookies или войти в Explore. При выключенных cookies **Войти через Explore** повторит попытку за вас после входа. Плейлист длиннее вашего лимита загрузки ждёт в своей строке, пока вы не выберете весь плейлист, первые элементы или просмотр. Вкладка «Загрузки» показывает число строк, ожидающих вас
- **Скачайте только часть видео** — выберите начало и конец или главу на экране «Формат», и Arroxy сохранит только этот диапазон, добавив его в имя файла после id видео. Разрезы приходятся на ближайший ключевой кадр; включите точную обрезку, чтобы вместо этого перекодировать
- **Убирать завершённые загрузки** — по желанию: завершённая загрузка исчезает из списка через 5 секунд. Её файлы остаются на диске, а неудавшиеся загрузки остаются в списке
- **Размер и Отсутствует в Загрузках** — сортируемый столбец **Размер** показывает, сколько места занимает каждая загрузка, а **Отсутствует** отмечает файлы, перемещённые или удалённые вне Arroxy
- **Aurora или Минимализм, тёмная или светлая тема** — стеклянные панели на фоне движущегося неба или спокойные сплошные поверхности; переключается внизу окна. Компьютеры без графического ускорения автоматически получают Минимализм
- **Строка меню Mac** — в macOS откройте Настройки (`Cmd+,`), задайте ограничение скорости загрузки, переключайте стиль и тему, открывайте журналы или сохраняйте файл диагностики прямо из строки меню
- **Меняйте профиль из любой загрузки** — настройте загрузку, затем обновите профиль, с которого она началась (с предпросмотром изменений), или сохраните настройки как новый профиль. При смене профиля Arroxy спросит, сохранить ли ваши правки

</details>

<details>
<summary><strong>📝 Субтитры и постобработка</strong></summary>

- **Субтитры** в SRT, VTT или ASS — ручные или авто-сгенерированные, на любом доступном языке
- Сохранение рядом с видео, встраивание в `.mkv` или размещение в подпапке `Subtitles/`
- **Пакеты только с субтитрами** — вставьте список ссылок или откройте плейлист, выберите «Субтитры» и получите для каждого видео только файлы субтитров
- **SponsorBlock** — пропуск или разметка спонсорских вставок, вступлений, концовок, самопиара
- **Встроенные метаданные** — название, дата загрузки, канал, описание, обложка и маркеры глав записываются в файл

</details>

<details>
<summary><strong>🌐 YouTube + 2000 сайтов</strong></summary>

- **YouTube — в полном объёме** — видео, Shorts, каналы, плейлисты, YouTube Music и подкасты обрабатываются как первоклассные источники
- **2000+ других сайтов** через yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable и многие другие
- **Только аудио и субтитры** работают на каждом поддерживаемом сайте, а не только на YouTube
- Если сайт меняется, yt-dlp выпускает исправления еженедельно, а Arroxy обновляет бинарный файл при запуске

</details>

---

## <a id="install"></a>📥 Установка и первый запуск

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

Сборки только x86_64. Нет `curl`? Замените `curl -fsSL` на `wget -qO-`.

| Платформа | Формат |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Скачать последний релиз →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows: первый запуск</strong></summary>

При первом запуске вы можете увидеть **«Windows protected your PC»** или **«Unknown publisher»**. Это касается как `Arroxy-win-x64-Setup.exe`, так и `Arroxy-win-x64-Portable.exe`. Arroxy бесплатный и открытый, а Windows-сборки не подписаны платным сертификатом — именно поэтому SmartScreen их помечает. Это **не** означает автоматически, что Arroxy опасен. Чтобы продолжить:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Нажмите **More info**.
2. Нажмите **Run anyway**.

#### Если Windows Defender пометил или удалил файл

Эвристика Defender иногда помечает неподписанные установщики NSIS и портативные версии Electron как подозрительные. Если Defender поместил в карантин `Arroxy-win-x64-Setup.exe` или `Arroxy-win-x64-Portable.exe`, восстановите файл из **Windows Security → Virus & threat protection → Protection history**, а затем добавьте исполняемый файл Arroxy в список разрешённых элементов в разделе **Manage settings → Add or remove exclusions**. Как и в случае со SmartScreen, причиной является отсутствие подписи издателя, а не обнаружение вредоносного ПО.

> Скачивайте Arroxy только с официальной страницы GitHub Releases. Если вы получили файл с другого сайта или он был вам прислан — удалите его и загрузите свежую копию из официального источника. Исходный код открыт, поэтому при желании вы можете проверить его или собрать Arroxy самостоятельно.

Предпочитаете Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS: первый запуск</strong></summary>

Arroxy пока не подписан кодом для macOS, поэтому после установки из DMG Gatekeeper может показать пугающий диалог *"Arroxy.app is damaged and can't be opened"*. Это означает, что macOS поместила неподписанное приложение в карантин; файлы приложения не повреждены на самом деле. В актуальных версиях macOS надёжное решение — Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Перетащите `Arroxy.app` из смонтированного DMG в `/Applications`.
2. Откройте Terminal и выполните две команды:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Первая команда удаляет атрибут карантина с установленной копии Arroxy. Вторая запускает приложение. `sudo` может запросить пароль Mac; Terminal не показывает символы во время ввода.

**Apple Silicon vs Intel:** на Mac с процессором серии M (M1 / M2 / M3 / M4) загружайте DMG для `arm64`. На Intel Mac — DMG для `x64`. Неправильная сборка тоже запустится через Rosetta, но заметно медленнее.

> Сборки для macOS создаются через CI на Apple Silicon и Intel. Если возникнут проблемы, пожалуйста, [откройте issue](../../issues) — отзывы пользователей macOS напрямую влияют на цикл тестирования.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Почему вы можете увидеть предупреждение</strong></summary>

Arroxy — открытый проект с лицензией MIT. Сборки для Windows и macOS **не подписаны кодом** — сертификаты Apple Developer ID и Windows EV для подписи кода стоят сотни долларов в год, и независимый проект платит за них из своего кармана. Без этих подписей Windows SmartScreen и macOS Gatekeeper будут предупреждать вас при первом запуске. Предупреждения означают *что ваша ОС не распознаёт издателя* — они не говорят о том, что Arroxy является вредоносным ПО.

Три способа проверить Arroxy самостоятельно, в порядке нарастающей строгости:

- **Прочитайте исходный код.** Каждая строка находится на [GitHub](https://github.com/antonio-orionus/Arroxy), и вы можете [собрать Arroxy из исходников](#tech).
- **Проверьте SHA256.** Сравните свой файл с опубликованным [`SHA256SUMS`](../../releases/latest) — см. [Проверьте ваш загрузку](#verify) ниже.
- **Запустите стороннее сканирование.** Загрузите файл на [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux: первый запуск</strong></summary>

AppImage запускаются напрямую — установка не нужна. Достаточно пометить файл как исполняемый.

**Файловый менеджер:** кликните правой кнопкой по `.AppImage` → **Свойства** → **Права** → включите **Разрешить выполнение файла как программы**, затем дважды кликните для запуска.

**Терминал:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Если запуск всё равно не удаётся — запустите без монтирования, пакет FUSE не нужен:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Необязательная интеграция с рабочим столом:** установите [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) один раз, и любой AppImage, по которому вы дважды кликнете, автоматически регистрируется в меню запуска — без ручного создания `.desktop`-файлов.

**Обычный архив (без FUSE, без установки):**

Сборка `.tar.gz` — то же приложение без обёртки AppImage: распакуйте куда угодно и запустите. Ни установщика, ни пакета FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Загрузки для Linux на странице релизов только x86_64.** На машинах ARM64 (Raspberry Pi, Asahi Linux) Flatpak установится, но не запустится: `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Проверьте вашу загрузку (SHA256)</strong></summary>

К каждому релизу публикуется файл `SHA256SUMS` вместе с бинарными файлами. Чтобы убедиться, что ваш загрузочный файл не был повреждён или подменён в процессе передачи, вычислите хэш файла локально и сравните его со строкой в `SHA256SUMS`. Откройте страницу последнего релиза → **Assets** → загрузите `SHA256SUMS`.

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

Хотите стороннюю проверку на вредоносное ПО? Загрузите файл на [VirusTotal](https://www.virustotal.com). Несколько срабатываний обобщённой эвристики у второстепенных движков — норма для неподписанных Electron-приложений; массовые обнаружения у крупных движков были бы настоящим поводом для беспокойства.

</details>

<details>
<summary><strong>📦 Windows: Установщик vs Портативная версия</strong></summary>

|               | Установщик NSIS | Портативный `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Требует установки | Да  | Нет — запускается откуда угодно  |
| Авто-обновления | ✅ в приложении  | ❌ ручное скачивание  |
| Скорость запуска | ✅ быстрее  | ⚠️ долгий холодный старт  |
| Добавляется в меню «Пуск» |            ✅            |           ❌            |
| Удобное удаление |            ✅            | ❌ просто удалите файл  |

**Рекомендация:** используйте установщик NSIS для авто-обновлений и быстрого запуска. Портативный `.exe` подходит тем, кто предпочитает вариант без установки и без изменений реестра.

</details>

---

## <a id="why"></a>⚖️ Почему Arroxy

Сравнение с наиболее распространёнными альтернативами:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Встроенный браузер (просмотр, вход, загрузка) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Приватные видео, видео только для участников и с возрастным ограничением без экспорта cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Бесплатно, без платных уровней |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Открытый исходный код |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Только локальная обработка |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Без лимитов использования |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Кросс-платформенное десктопное приложение |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Субтитры + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = частично или только в платной версии. Вход внутри приложения для приватных видео в 4K Video Downloader — платная функция; большинство бесплатных GUI для yt-dlp принимают только файл cookies или читают cookies вашего браузера.

Arroxy создан для одного: получить чистый локальный файл — вставите ли вы URL или найдёте видео в Explore. Никаких допродаж, никакого сбора данных.

### <a id="why-explore"></a>🧭 Чего не умеет простая обёртка над yt-dlp: вкладка Explore

Большинство бесплатных загрузчиков YouTube — это поле для URL поверх yt-dlp. Arroxy тоже использует yt-dlp, но в нём есть **Explore** — встроенный в приложение браузер, который открывает YouTube или любой другой сайт. Explore обходит ограничения, с которыми поле для URL не справляется:

- **Видео, которым нужен аккаунт, без экспорта cookies** — приватные видео, видео только для участников и с возрастным ограничением (на аккаунте, подтверждённом по возрасту), а также ваши списки «Смотреть позже» и «Понравившиеся», а также видео за входом на других сайтах. Простой обёртке нужен экспорт cookies.txt или доступ к cookies вашего браузера, а Chrome в Windows теперь такой доступ блокирует. В Arroxy достаточно один раз войти в Explore — остальное приложение сделает само
- **«Войдите, чтобы подтвердить, что вы не бот»** — когда YouTube так просит, Arroxy не сдаётся, а повторяет загрузку с вашим входом в Explore
- **Токен загрузки YouTube** — встроенный браузер Arroxy получает токен, который YouTube ожидает перед загрузкой. Без него YouTube может отдать меньше форматов и более низкое качество, чем вы запросили
- **Без копирования ссылок** — найдите видео, плейлист или канал в Explore и скачайте его в один клик или щёлкните правой кнопкой по любой ссылке на странице
- **Блокировщик рекламы, когда он нужен** — один щелчок по щиту блокирует рекламу и трекеры на страницах Explore

---

## <a id="privacy"></a>🔒 Конфиденциальность

Загрузки выполняются напрямую через [yt-dlp](https://github.com/yt-dlp/yt-dlp) с YouTube в выбранную вами папку — никакого маршрутизирования через сторонние серверы. История просмотров, история загрузок, URL-адреса и содержимое файлов остаются на вашем устройстве.

Никакой телеметрии — только один анонимный сигнал в день: версия приложения, ОС, язык, способ установки и страна, чтобы мы могли посчитать активных пользователей. Без ID, URL, названий видео, путей к файлам и данных аккаунта. Можно отключить в настройках.

У Explore собственные входы, отдельные от вашего браузера, а Arroxy никогда не читает и не заполняет форму входа — вы вводите данные на странице самого сайта. Загрузки идут без входа; только когда загрузка не удаётся по причине, которую может решить аккаунт, Arroxy заново считывает вход, хранит его во временном файле на время этой загрузки и затем удаляет файл. Выход из Explore в Настройках стирает их.

---

## <a id="faq"></a>❓ Часто задаваемые вопросы

<details>
<summary><strong>Это правда бесплатно?</strong></summary>

Да — лицензия MIT, без платных уровней, без ограничений по функциям.

</details>

<details>
<summary><strong>Чем Arroxy отличается от других GUI для yt-dlp?</strong></summary>

Большинство бесплатных GUI для yt-dlp — это обёртки, которые принимают только ссылку. В Arroxy есть **Explore** — встроенный в приложение браузер, который открывает YouTube или любой другой сайт: вы просматриваете и скачиваете без копирования ссылок, а войдя там один раз, можете скачивать приватные видео, видео только для участников и с возрастным ограничением, а также списки «Смотреть позже» и «Понравившиеся» — без экспорта cookies. Arroxy использует этот вход, когда YouTube просит подтвердить, что вы не бот, а его встроенный браузер получает токен загрузки YouTube, чтобы загрузки не откатывались к меньшему набору форматов. Подробнее — в разделе [Почему Arroxy](#why).

</details>

<details>
<summary><strong>Какие качества видео можно скачивать?</strong></summary>

Всё, что предлагает YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, а также только аудио. Потоки 60 fps и HDR сохраняются как есть, а пошаговая загрузка позволяет выбрать AV1, VP9 или H.264 для каждого разрешения.

</details>

<details>
<summary><strong>Можно ли извлечь только аудио в виде MP3?</strong></summary>

Да. Выбери *только аудио* в меню форматов, а затем MP3, M4A/AAC, Opus или WAV.

</details>

<details>
<summary><strong>Как скачать видео, для которых нужен аккаунт YouTube?</strong></summary>

Войдите один раз на вкладке Explore. После этого Arroxy сможет скачивать приватные видео и видео только для участников, доступные вашему аккаунту, видео с возрастным ограничением (если аккаунт подтверждён по возрасту), а также списки «Смотреть позже» и «Понравившиеся». Этот вход используется, только когда загрузка не удаётся по причине, которую может решить аккаунт; всё остальное скачивается как раньше. Это вариант **Вход через Explore**: он указан первым и помечен «Рекомендуется» в настройках cookies, а при первом открытии Explore Arroxy выбирает его сам. Вики yt-dlp отмечает, что [автоматизация с входом в аккаунт может привлечь внимание к вашему аккаунту Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), поэтому безопаснее использовать второй аккаунт.

</details>

<details>
<summary><strong>Будет ли работать, если YouTube что-то изменит?</strong></summary>

yt-dlp обновляется автоматически при запуске, а Arroxy оперативно выпускает исправления, когда YouTube что-то меняет. Когда YouTube просит подтвердить, что вы не бот, Arroxy также пробует ваш вход в Explore, если вы вошли там, а cookies из файла или браузера доступны в настройках cookies.

</details>

<details>
<summary><strong>На каких языках доступен Arroxy?</strong></summary>

Доступные языки (31): Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy автоматически определяет язык операционной системы при первом запуске, а переключить язык можно в любой момент через выбор языка на панели инструментов. Runtime locale JSON находится в src/shared/i18n/locales/, а PO-каталоги для переводчиков находятся в i18n/locales/ — откройте PR на GitHub, чтобы внести вклад.

</details>

<details>
<summary><strong>Нужно что-то дополнительно устанавливать?</strong></summary>

Нет. yt-dlp, ffmpeg и ffprobe автоматически скачиваются при первом запуске и кешируются на вашей машине. После этого никакой дополнительной настройки не требуется.

</details>

<details>
<summary><strong>Можно ли скачивать плейлисты или целые каналы?</strong></summary>

Да — и то и другое. Вставьте URL плейлиста или канала (например, `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); выберите, сколько элементов сканировать, затем поставьте в очередь весь список или выберите отдельные видео. Фильтры по диапазону дат появятся скоро.

</details>

<details>
<summary><strong>macOS сообщает «приложение повреждено» — что делать?</strong></summary>

Это macOS Gatekeeper блокирует неподписанное приложение, а не реальное повреждение. Команды Terminal для снятия карантина и запуска Arroxy смотрите в разделе [macOS first launch](#macos-first-launch).

</details>

<details>
<summary><strong>Законно ли скачивать видео с YouTube?</strong></summary>

Для личного, частного использования это в целом допустимо в большинстве юрисдикций. Вы несёте ответственность за соблюдение [Условий использования](https://www.youtube.com/t/terms) YouTube и местных законов об авторском праве.

</details>

---

## <a id="roadmap"></a>🗺️ Дорожная карта

Все еще запланировано — примерно в порядке приоритета:

| Функция    | Описание    |
| ---------------- | ---------------- |
| **Фильтры плейлистов и каналов** | Фильтры по диапазону дат при перечислении плейлиста или канала |
| **Предпочтения аудиодорожек YouTube** | Задать предпочтительную речевую дорожку для всего приложения, с переопределениями в отдельных профилях, когда YouTube предлагает несколько аудиодорожек |
| **Более надежное восстановление повтором** | Новый путь повторной попытки для загрузок, прерванных нестабильным или проблемным интернет-соединением |
| **Полноценный менеджер загрузок в drawer** | Превратить drawer очереди в более полный менеджер, включая смену папок назначения для элементов в очереди |
| **Запланированные загрузки** | Запуск очереди в заданное время (ночные загрузки) |
| **Пакет в AUR** | Установка в Arch Linux и Omarchy через `yay -S arroxy-bin` |

Есть идея? [Откройте запрос](../../issues) — мнение сообщества определяет приоритеты.

---

## <a id="support"></a>💖 Поддержать Arroxy

Arroxy бесплатен и распространяется по лицензии MIT — без рекламы, без телеметрии, без платной версии. Если он экономит вам время, вы можете поддержать разработку через Bitcoin, Tron или Ethereum: адреса указаны в [DONATE.md](DONATE.md) — единственном официальном источнике для них. Arroxy никогда не пришлёт вам адрес по электронной почте или в личном сообщении. Звезда репозиторию, сообщения об ошибках и улучшение переводов помогают ничуть не меньше.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Создано на

<details>
<summary><strong>Стек технологий</strong></summary>

- **Electron** — кросс-платформенная десктопная оболочка
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — стили
- **Zustand** — управление состоянием
- **yt-dlp** + **ffmpeg** — движок загрузки и мультиплексирования (оба подтягиваются во время работы: yt-dlp поддерживается актуальным, ffmpeg/ffprobe устанавливаются один раз и сохраняются между обновлениями)
- **Vite** + **electron-vite** — инструменты сборки
- **Vitest** + **Playwright** — юнит- и end-to-end тесты

</details>

<details>
<summary><strong>Сборка из исходников</strong></summary>

### Предварительные требования — все платформы

| Инструмент | Версия  | Установка |
| ---------- | ------- | --------- |
| Git        | любая   | [git-scm.com](https://git-scm.com) |
| Node.js    | 24.21.0 | `mise install` или `.node-version` |
| Bun        | 1.4.2  | `mise install` или `package.json` `packageManager` |

Рекомендуется установить `mise`, затем выполнить `mise install` в checkout. Без mise вручную активируйте Node.js из `.node-version` и Bun из `package.json` перед `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools и Python могут понадобиться для нативных пересборок.

### macOS

```bash
brew install mise
xcode-select --install
```

После клонирования запустите `mise trust && mise install` в checkout. Если ваш shell уже использует `fnm`, `nvm` или Bun из Homebrew, активируйте mise в `~/.zshrc`, чтобы Arroxy получил Node.js 24.21.0 и Bun 1.4.2:

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

# Зависимости сборки и рантайма Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Только для E2E-тестов (Electron требует дисплей)
sudo apt install -y xvfb
```

### Клонирование и запуск

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # рекомендуется; пропустите, если закреплённые инструменты активированы вручную
bun run bootstrap
bun run doctor
bun run dev            # Electron-приложение с Vite-рендерером
```

### Сборка дистрибутива

```bash
bun run build        # проверка типов + компиляция
bun run dist         # упаковка для текущей ОС
bun run dist:win     # упаковка Windows-целей на поддерживаемом хосте
```

> `bun run bootstrap` устанавливает зависимости, пересобирает зависимости Electron-приложения, проверяет Electron, подготавливает встроенные ffmpeg/ffprobe для разработки и устанавливает Playwright Chromium. Релизные сборки управляют yt-dlp, ffmpeg и ffprobe во время работы в папке данных приложения; ничто из этого не входит в установщик.

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

## 📜 Условия использования

Arroxy — инструмент исключительно для личного, частного использования. Вы единолично отвечаете за то, чтобы ваши загрузки соответствовали [Условиям использования](https://www.youtube.com/t/terms) YouTube и законам об авторском праве вашей юрисдикции. Не используйте Arroxy для скачивания, воспроизведения или распространения контента, на который у вас нет прав. Разработчики не несут ответственности за злоупотребления.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Лицензия MIT · Сделано с заботой <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
