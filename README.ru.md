<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Маскот Arroxy" width="180" />

# Arroxy — бесплатный загрузчик YouTube (+ 2000 сайтов) с открытым исходным кодом для Windows, macOS и Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Язык:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · **Русский** · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Релиз](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Сборка](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Сайт](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Лицензия](https://img.shields.io/badge/license-MIT-green) ![Платформы](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Языки](https://img.shields.io/badge/i18n-21_languages-blue)

Скачивайте видео, Shorts, музыку, каналы, подкасты или аудиодорожки с **YouTube и 2000+ поддерживаемых сайтов** — до 4K HDR при 60 fps или в виде MP3 / AAC / Opus. Работает локально на Windows, macOS и Linux. **Без рекламы, без лишнего, без допродаж.**

[**↓ Скачать последний релиз**](#install) &nbsp;·&nbsp; [**Сайт**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#install) · [macOS](#install) · [Linux](#install)

[![Присоединиться к Discord-сообществу](https://img.shields.io/badge/%D0%9F%D1%80%D0%B8%D1%81%D0%BE%D0%B5%D0%B4%D0%B8%D0%BD%D0%B8%D1%82%D1%8C%D1%81%D1%8F%20%D0%BA%20Discord%2D%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D1%81%D1%82%D0%B2%D1%83-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Демо Arroxy" width="720" />

Если Arroxy экономит вам время — ⭐ поможет другим его найти.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

> 🌐 Это перевод с помощью ИИ. [README на английском](README.md) — основной источник истины. Заметили ошибку? [Pull request приветствуется](../../pulls).

---

## Содержание

- [Скачать](#install)
- [Почему Arroxy](#why)
- [Возможности](#features)
- [Конфиденциальность](#privacy)
- [Часто задаваемые вопросы](#faq)
- [Дорожная карта](#roadmap)
- [Создано на](#tech)

---

## <a id="install"></a>Скачать

| Платформа | Формат |
| ------------------- | ----------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Скачать последний релиз →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="why-warning"></a>Почему вы можете увидеть предупреждение

Arroxy — открытый проект с лицензией MIT. Сборки для Windows и macOS **не подписаны кодом** — сертификаты Apple Developer ID и Windows EV для подписи кода стоят сотни долларов в год, и независимый проект платит за них из своего кармана. Без этих подписей Windows SmartScreen и macOS Gatekeeper будут предупреждать вас при первом запуске. Предупреждения означают *что ваша ОС не распознаёт издателя* — они не говорят о том, что Arroxy является вредоносным ПО.

Три способа проверить Arroxy самостоятельно, в порядке нарастающей строгости:

- **Прочитайте исходный код.** Каждая строка находится на [GitHub](https://github.com/antonio-orionus/Arroxy), и вы можете [собрать Arroxy из исходников](#tech).
- **Проверьте SHA256.** Сравните свой файл с опубликованным [`SHA256SUMS`](../../releases/latest) — см. [Проверьте ваш загрузку](#verify) ниже.
- **Запустите стороннее сканирование.** Загрузите файл на [VirusTotal](https://www.virustotal.com).

### <a id="windows-first-launch"></a>Windows: первый запуск

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

### <a id="macos-first-launch"></a>macOS: первый запуск

Arroxy пока не подписан кодом для macOS, поэтому Gatekeeper заблокирует первый запуск. Точный способ разрешить его зависит от версии macOS — Sequoia 15 ужесточила старый обход через правый клик → Открыть.

#### macOS Sequoia 15 и новее (актуально)

В Sequoia 15 и новее правый клик → Открыть больше не обходит Gatekeeper для многих заблокированных приложений. Используйте вместо этого панель Системных настроек:

1. Перетащите `Arroxy.app` из смонтированного DMG в `/Applications`.
2. Дважды кликните Arroxy. Появится диалог блокировки — нажмите **Done** (не нажимайте *Move to Trash*).
3. Откройте **System Settings → Privacy & Security** и прокрутите до раздела **Security**. Вы увидите *"Arroxy was blocked to protect your Mac"* (или аналогичное сообщение).
4. Нажмите **Open Anyway**, подтвердите паролем или Touch ID, затем снова запустите Arroxy из `/Applications`.

#### macOS Sonoma 14 и старше

1. Перетащите `Arroxy.app` из смонтированного DMG в `/Applications`.
2. Кликните правой кнопкой (или Control-кликните) `Arroxy.app` в `/Applications` и выберите **Open**.
3. В диалоге предупреждения теперь есть кнопка **Open** — нажмите её и подтвердите. Arroxy откроется в штатном режиме, и предупреждение больше не появится.

#### "App is damaged" или постоянная блокировка Gatekeeper — исправление через Terminal

Если macOS пишет *"Arroxy is damaged and can't be opened"*, или ни один из приведённых способов не снимает блокировку, причиной является атрибут карантина на DMG (его устанавливают некоторые браузеры и механизм перемещения файлов самой macOS). Удалите атрибут у установленного приложения:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel:** на Mac с процессором серии M (M1 / M2 / M3 / M4) загружайте DMG для `arm64`. На Intel Mac — DMG для `x64`. Неправильная сборка тоже запустится через Rosetta, но заметно медленнее.

> Сборки для macOS создаются через CI на Apple Silicon и Intel. Если возникнут проблемы, пожалуйста, [откройте issue](../../issues) — отзывы пользователей macOS напрямую влияют на цикл тестирования.

### <a id="linux-first-launch"></a>Linux: первый запуск

AppImage запускаются напрямую — установка не нужна. Достаточно пометить файл как исполняемый.

**Файловый менеджер:** кликните правой кнопкой по `.AppImage` → **Свойства** → **Права** → включите **Разрешить выполнение файла как программы**, затем дважды кликните для запуска.

**Терминал:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Если запуск всё равно не удаётся — возможно, отсутствует FUSE:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Необязательная интеграция с рабочим столом:** установите [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) один раз, и любой AppImage, по которому вы дважды кликнете, автоматически регистрируется в меню запуска — без ручного создания `.desktop`-файлов.

**Flatpak (изолированная альтернатива):** скачайте `Arroxy-*.flatpak` с той же страницы релиза.

```bash
flatpak install --user Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>Проверьте вашу загрузку (SHA256)</strong></summary>

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
<summary><strong>Установка через пакетный менеджер</strong></summary>

Уже используете пакетный менеджер? Можно обойтись без ручной загрузки.

| Канал | Команда                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-linux-x64.flatpak`                                                 |

</details>

<details>
<summary><strong>Windows: Установщик vs Портативная версия</strong></summary>

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

## <a id="why"></a>Почему Arroxy

Сравнение с наиболее распространёнными альтернативами:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Бесплатно, без платных уровней |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Открытый исходный код |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Только локальная обработка |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Без логина и экспорта кук |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Без лимитов использования |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Кросс-платформенное десктопное приложение |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Субтитры + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy создан для одного: вставьте URL — получите чистый локальный файл. Никаких аккаунтов, никаких допродаж, никакого сбора данных.

---

## <a id="features"></a>Возможности

### Качество и форматы

- До **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Высокая частота кадров** сохраняется как есть — 60 fps, 120 fps, HDR
- **Управление аудио** — экспорт только аудио в MP3, M4A/AAC, Opus или WAV; глобальная настройка **Предпочитать surround / Dolby**; а также выбор нативных дорожек Dolby AC-3/EC-3, многоканальных, DRC и других продвинутых аудиодорожек в интерактивных загрузках, когда они доступны
- Быстрые пресеты: *Лучшее качество* · *Сбалансированно* · *Маленький файл*

### Конфиденциальность и контроль

- 100% локальная обработка — загрузки идут напрямую с YouTube на ваш диск
- Без логина, без кук, без привязки к аккаунту Google
- Файлы сохраняются прямо в выбранную вами папку

### Рабочий процесс

- **Гибкие режимы запуска** — выберите пошаговую одиночную загрузку, выбор плейлиста/канала, массовую вставку URL или Quick Download с сохраненными настройками по умолчанию
- **Центральная очередь загрузок** — каждая одиночная, плейлистная, массовая или быстрая задача попадает в одно место для прогресса, паузы, возобновления, отмены, повтора и управления приоритетом
- **Мониторинг буфера обмена** — скопируйте YouTube-ссылку, и Arroxy автоматически заполнит URL при следующем переключении на приложение (включается в расширенных настройках)
- **Автоочистка URL** — удаляет трекинговые параметры (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) и разворачивает ссылки `youtube.com/redirect`
- **Режим трея** — закрытие окна сохраняет загрузки в фоновом режиме
- **21 язык** — автоматически определяет язык системы, переключается в любой момент
- **Синхронизация плейлиста** — повторно сверяет плейлист с локальной папкой, чтобы пропускать уже скачанные видео; создает файл плейлиста `.m3u`, который обновляется после каждого скачанного видео
- **Управление скоростью и темпом** — ограничивайте пропускную способность загрузки, добавляйте задержки между запросами и настраивайте потоки фрагментов пресетами (*Выкл. · Сбалансировано · Осторожно · Пользовательский*)

### Субтитры и постобработка

- **Субтитры** в SRT, VTT или ASS — ручные или авто-сгенерированные, на любом доступном языке
- Сохранение рядом с видео, встраивание в `.mkv` или размещение в подпапке `Subtitles/`
- **SponsorBlock** — пропуск или разметка спонсорских вставок, вступлений, концовок, самопиара
- **Встроенные метаданные** — название, дата загрузки, канал, описание, обложка и маркеры глав записываются в файл

### YouTube + 2000 сайтов

- **YouTube — в полном объёме** — видео, Shorts, каналы, плейлисты, YouTube Music и подкасты обрабатываются как первоклассные источники
- **2000+ других сайтов** через yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org и многие другие
- **Только аудио и субтитры** работают на каждом поддерживаемом сайте, а не только на YouTube
- Если сайт меняется, yt-dlp выпускает исправления еженедельно, а Arroxy обновляет бинарный файл при запуске

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Вставьте URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Выберите качество" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Выберите, куда сохранять" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Очередь загрузок в работе" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Выбор языка субтитров и формата" />
</div>

---

## <a id="privacy"></a>Конфиденциальность

Загрузки выполняются напрямую через [yt-dlp](https://github.com/yt-dlp/yt-dlp) с YouTube в выбранную вами папку — никакого маршрутизирования через сторонние серверы. История просмотров, история загрузок, URL-адреса и содержимое файлов остаются на вашем устройстве.

Arroxy отправляет анонимную агрегированную телеметрию через [OpenPanel](https://openpanel.dev) — ровно столько, чтобы понимать запуски, ОС, версии приложения и сбои. Никаких URL, названий видео, путей к файлам, данных аккаунта, фингерпринтинга или персональных данных. ID установки случайный и не связан с вашей личностью. Можно отключить в настройках.

---

## <a id="faq"></a>Часто задаваемые вопросы

**Это правда бесплатно?**
Да — лицензия MIT, без платных уровней, без ограничений по функциям.

**Какие качества видео можно скачивать?**
Всё, что предлагает YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, а также только аудио. Потоки с высокой частотой кадров (60 fps, 120 fps) и HDR сохраняются как есть.

**Можно ли извлечь только аудио в виде MP3?**
Да. Выбери *только аудио* в меню форматов, а затем MP3, M4A/AAC, Opus или WAV.

**Нужен ли аккаунт YouTube или куки?**
По умолчанию — нет. Arroxy работает без аккаунта YouTube, логина или экспорта кук. Опциональная поддержка кук доступна в Расширенных настройках (Источник кук: файл или браузер) для контента, требующего аутентификации, например видео с возрастным ограничением или доступного только участникам. По умолчанию она отключена. Если вы её включите, вики yt-dlp отмечает, что [автоматизация на основе кук может привлечь внимание к вашему аккаунту Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); в таком случае безопаснее использовать одноразовый аккаунт.

**Будет ли работать, если YouTube что-то изменит?**
yt-dlp обновляется автоматически при запуске, а Arroxy оперативно выпускает исправления, когда YouTube что-то меняет. Если вы всё же столкнётесь с проблемой, в Расширенных настройках доступна опциональная поддержка кук в качестве запасного варианта.

**На каких языках доступен Arroxy?**
На двадцати одном, прямо из коробки: English, Español (испанский), Deutsch (немецкий), Français (французский), 日本語 (японский), 中文 (китайский), Русский, Українська (украинский), हिन्दी (хинди), Afaan Oromoo (оромо), Kiswahili (суахили), O'zbekcha (узбекский), Tiếng Việt (вьетнамский), አማርኛ (амхарский), العربية (арабский), اردو (урду), پښتو (пушту), বাংলা (бенгальский), မြန်မာဘာသာ (бирманский), Ελληνικά (греческий) и Српски (сербский). Arroxy автоматически определяет язык системы при первом запуске, и вы можете переключиться в любой момент через выбор языка в панели инструментов. Runtime JSON-файлы локалей находятся в src/shared/i18n/locales/, а PO-каталоги для переводчиков находятся в i18n/locales/ — откройте PR на GitHub, чтобы внести вклад.

**Нужно что-то дополнительно устанавливать?**
Нет. yt-dlp автоматически скачивается при первом запуске и кешируется на вашей машине; ffmpeg и ffprobe поставляются вместе с приложением. После этого никакой дополнительной настройки не требуется.

**Можно ли скачивать плейлисты или целые каналы?**
Да — и то и другое. Вставьте URL плейлиста или канала (например, `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); выберите, сколько элементов сканировать, затем поставьте в очередь весь список или выберите отдельные видео. Фильтры по диапазону дат появятся скоро.

**macOS сообщает «приложение повреждено» — что делать?**
Это macOS Gatekeeper блокирует неподписанное приложение, а не реальное повреждение. Смотрите раздел ["App is damaged" — исправление через Terminal](#macos-first-launch) — там описана однострочная команда `xattr`, которая устраняет проблему.

**Законно ли скачивать видео с YouTube?**
Для личного, частного использования это в целом допустимо в большинстве юрисдикций. Вы несёте ответственность за соблюдение [Условий использования](https://www.youtube.com/t/terms) YouTube и местных законов об авторском праве.

---

## <a id="roadmap"></a>Дорожная карта

Все еще запланировано — примерно в порядке приоритета:

| Функция    | Описание    |
| ---------------- | ---------------- |
| **Фильтры плейлистов и каналов** | Фильтры по диапазону дат при перечислении плейлиста или канала |
| **Предпочтения аудиодорожек YouTube** | Выбор предпочитаемых речевых дорожек, когда YouTube предлагает несколько аудиодорожек |
| **Вход через встроенный браузер** | Открывать браузерные окна внутри Arroxy, чтобы входить на сайты и использовать cookies без ручного экспорта |
| **Скачивание видео в один клик** | Запускать скачивание видео в один клик из найденной или вставленной ссылки с активным профилем |
| **Более надежное восстановление повтором** | Новый путь повторной попытки для загрузок, прерванных нестабильным или проблемным интернет-соединением |
| **Полноценный менеджер загрузок в drawer** | Превратить drawer очереди в более полный менеджер, включая смену папок назначения для элементов в очереди |
| **Запланированные загрузки** | Запуск очереди в заданное время (ночные загрузки) |
| **Обрезка клипов** | Скачайте только нужный отрезок, указав начало и конец |

Есть идея? [Откройте запрос](../../issues) — мнение сообщества определяет приоритеты.

---

## <a id="tech"></a>Создано на

<details>
<summary><strong>Стек технологий</strong></summary>

- **Electron** — кросс-платформенная десктопная оболочка
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — стили
- **Zustand** — управление состоянием
- **yt-dlp** + **ffmpeg** — движок загрузки и мультиплексирования (yt-dlp подтягивается во время работы; ffmpeg/ffprobe включаются при сборке)
- **Vite** + **electron-vite** — инструменты сборки
- **Vitest** + **Playwright** — юнит- и end-to-end тесты

</details>

<details>
<summary><strong>Сборка из исходников</strong></summary>

### Предварительные требования — все платформы

| Инструмент | Версия  | Установка |
| ---------- | ------- | --------- |
| Git        | любая   | [git-scm.com](https://git-scm.com) |
| Bun        | последняя | см. ниже по платформе |

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Нативные инструменты сборки не требуются — в проекте нет нативных Node-аддонов.

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Зависимости рантайма Electron
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# Только для E2E-тестов (Electron требует дисплей)
sudo apt install -y xvfb
```

### Клонирование и запуск

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # сборка с горячей перезагрузкой
```

### Сборка дистрибутива

```bash
bun run build        # проверка типов + компиляция
bun run dist         # упаковка для текущей ОС
bun run dist:win     # кросс-компиляция портативного .exe для Windows
```

> yt-dlp скачивается с GitHub при первом запуске и кешируется в папке данных приложения. ffmpeg и ffprobe входят в каждый релиз Arroxy.

</details>

---

## <a id="troubleshooting"></a>Troubleshooting

### App won't open / no window appears

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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## Условия использования

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
