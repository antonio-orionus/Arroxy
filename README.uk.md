<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Маскот Arroxy" width="180" />

# Arroxy — безкоштовний завантажувач YouTube (+ 2000 сайтів) із відкритим кодом для Windows, macOS та Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Мова:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · **Українська** · [中文](README.zh.md) · [日本語](README.ja.md)

[![Реліз](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Збірка](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Сайт](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Ліцензія](https://img.shields.io/badge/license-MIT-green) ![Платформи](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Мови](https://img.shields.io/badge/i18n-21_languages-blue)

Завантажуйте відео, Shorts, музику, канали, подкасти або аудіодоріжки з **YouTube та 2000+ підтримуваних сайтів** — до 4K HDR при 60 fps або у форматі MP3 / AAC / Opus. Працює локально на Windows, macOS та Linux. **Без реклами, без зайвого, без апселів.**

[**↓ Завантажити останній реліз**](#install) &nbsp;·&nbsp; [**Сайт**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#install) · [macOS](#install) · [Linux](#install)

[![Приєднатися до Discord-спільноти](https://img.shields.io/badge/%D0%9F%D1%80%D0%B8%D1%94%D0%B4%D0%BD%D0%B0%D1%82%D0%B8%D1%81%D1%8F%20%D0%B4%D0%BE%20Discord%2D%D1%81%D0%BF%D1%96%D0%BB%D1%8C%D0%BD%D0%BE%D1%82%D0%B8-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Демо Arroxy" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

Якщо Arroxy економить ваш час, ⭐ допомагає іншим його знайти.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-06-17._

> 🌐 Це переклад за допомогою ШІ. [README англійською](README.md) — основне джерело істини. Помітили помилку? [PR вітаються](../../pulls).

---

## Зміст

- [Завантажити](#install)
- [Чому Arroxy](#why)
- [Можливості](#features)
- [Конфіденційність](#privacy)
- [Часті запитання](#faq)
- [Дорожня карта](#roadmap)
- [Технології](#tech)

---

## <a id="install"></a>Завантажити

| Платформа | Формат                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe)                                                                                                                                                                                                        |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg)                                                                                                                                                                                                                     |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS)                                                                                                                                                                                                                                                                                                                                                                                                                                              |

[**Завантажити останній реліз →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="why-warning"></a>Чому ви можете побачити попередження

Arroxy — проєкт із відкритим кодом і ліцензією MIT. Збірки для Windows та macOS **не підписані кодом** — сертифікати Apple Developer ID та Windows EV для підпису коду коштують сотні доларів на рік, і незалежний проєкт сплачує їх із власної кишені. Без цих підписів Windows SmartScreen і macOS Gatekeeper попереджатимуть вас при першому запуску. Попередження означають *що ваша ОС не розпізнає видавця* — вони не означають, що Arroxy є шкідливим ПЗ.

Три способи самостійно перевірити Arroxy, у порядку зростання строгості:

- **Прочитайте вихідний код.** Кожен рядок є на [GitHub](https://github.com/antonio-orionus/Arroxy), і ви можете [зібрати Arroxy з джерел](#tech).
- **Перевірте SHA256.** Порівняйте свій файл із опублікованим [`SHA256SUMS`](../../releases/latest) — дивіться [Перевірте своє завантаження](#verify) нижче.
- **Запустіть стороннє сканування.** Завантажте файл на [VirusTotal](https://www.virustotal.com).

### <a id="windows-first-launch"></a>Windows: перший запуск

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

### <a id="macos-first-launch"></a>macOS: перший запуск

Arroxy ще не підписаний кодом для macOS, тому Gatekeeper заблокує перший запуск. Точний спосіб дозволити його залежить від версії macOS — Sequoia 15 посилила старий обхід через правий клік → Відкрити.

#### macOS Sequoia 15 і новіші (актуально)

У Sequoia 15 і новіших версіях правий клік → Відкрити більше не обходить Gatekeeper для багатьох застосунків у карантині. Натомість скористайтеся панеллю Системних параметрів:

1. Перетягніть `Arroxy.app` зі змонтованого DMG до `/Applications`.
2. Двічі клацніть Arroxy. З'явиться вікно блокування — натисніть **Done** (не натискайте *Move to Trash*).
3. Відкрийте **System Settings → Privacy & Security** і прокрутіть до розділу **Security**. Ви побачите *"Arroxy was blocked to protect your Mac"* (або схоже повідомлення).
4. Натисніть **Open Anyway**, підтвердьте паролем або Touch ID, а потім знову запустіть Arroxy з `/Applications`.

#### macOS Sonoma 14 і старіші

1. Перетягніть `Arroxy.app` зі змонтованого DMG до `/Applications`.
2. Клацніть правою кнопкою (або Control-клік) на `Arroxy.app` у `/Applications` і виберіть **Open**.
3. У вікні попередження тепер є кнопка **Open** — натисніть її і підтвердіть. Arroxy відкриється в штатному режимі, і попередження більше не з'являтиметься.

#### "App is damaged" або постійне блокування Gatekeeper — виправлення через Terminal

Якщо macOS пише *"Arroxy is damaged and can't be opened"*, або жоден із наведених кроків не знімає блокування, причиною є атрибут карантину на DMG (його встановлюють деякі браузери та власний механізм переміщення файлів macOS). Видаліть його з встановленого застосунку:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel:** на Mac із процесором серії M (M1 / M2 / M3 / M4) завантажуйте DMG для `arm64`. На Intel Mac — DMG для `x64`. Неправильна збірка також запускатиметься через Rosetta, але помітно повільніше.

> Збірки macOS виробляються через CI на Apple Silicon та Intel рушіях. Якщо виникнуть проблеми, будь ласка, [відкрийте issue](../../issues) — зворотний зв'язок від користувачів macOS активно впливає на цикл тестування macOS.

### <a id="linux-first-launch"></a>Linux: перший запуск

AppImage запускаються безпосередньо — без встановлення. Потрібно лише позначити файл як виконуваний.

**Файловий менеджер:** клацніть правою кнопкою на `.AppImage` → **Властивості** → **Права** → увімкніть **Дозволити виконання файлу як програми**, потім подвійний клік.

**Термінал:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Якщо запуск все одно не вдається, можливо, відсутній FUSE:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Необов'язкова інтеграція з робочим столом:** встановіть [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) один раз, і будь-який AppImage, на який ви двічі клацнете, автоматично реєструватиметься в меню запуску — без ручного створення `.desktop`-файлів.

**Flatpak (ізольована альтернатива):** завантажте `Arroxy-*.flatpak` з тієї ж сторінки релізу.

```bash
flatpak install --user Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>Перевірте своє завантаження (SHA256)</strong></summary>

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
<summary><strong>Установлення через менеджер пакетів</strong></summary>

Вже використовуєте менеджер пакетів? Можна обійтися без ручного завантаження.

| Канал | Команда                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-linux-x64.flatpak`                                                 |

</details>

<details>
<summary><strong>Windows: Інсталятор vs Портативна версія</strong></summary>

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

## <a id="why"></a>Чому Arroxy

Порівняння з найпоширенішими альтернативами:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Безкоштовно, без преміум-рівня |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Відкритий код |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Лише локальна обробка |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Без логіну та експорту кук |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Без обмежень використання |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Крос-платформний настільний застосунок |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Субтитри + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy створений для однієї задачі: вставте URL — отримайте чистий локальний файл. Без акаунтів, без апселів, без збору даних.

---

## <a id="features"></a>Можливості

### Якість і формати

- До **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Висока частота кадрів** збережена як є — 60 fps, 120 fps, HDR
- **Аудіо** — експорт лише аудіо в MP3, M4A/AAC, Opus або WAV. В інтерактивних завантаженнях вибирайте нативні surround/Dolby доріжки джерела (AC-3, E-AC-3, 5.1, DRC), коли вони доступні, або задайте глобальне значення за замовчуванням **Надавати перевагу surround / Dolby**
- Швидкі пресети: *Найкраща якість* · *Збалансовано* · *Малий файл*

### Конфіденційність і контроль

- 100% локальна обробка — завантаження потрапляють прямо з YouTube на ваш диск
- Без логіну, без кук, без прив'язки акаунта Google
- Файли зберігаються прямо у вибрану вами теку

### Робочий процес

- **Гнучкі режими старту** — оберіть покрокове одиночне завантаження, вибір playlist/channel, масове вставлення URL або Quick Download зі збереженими стандартами
- **Центральна черга завантажень** — кожне single, playlist, bulk або quick завдання потрапляє в одне місце для прогресу, паузи, відновлення, скасування, повтору та керування пріоритетом
- **Моніторинг буфера обміну** — скопіюйте посилання YouTube, і Arroxy автоматично заповнить поле URL при наступному переключенні на застосунок (вимикається в розширених налаштуваннях)
- **Автоочищення URL** — видаляє трекінгові параметри (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) і розгортає посилання `youtube.com/redirect`
- **Режим трею** — закриття вікна залишає завантаження працювати у фоні
- **21 мова** — автоматично визначає мову системи, перемикається будь-коли
- **Синхронізація плейлиста** — повторно звіряє плейлист із локальною папкою, щоб пропускати вже завантажені відео; створює файл плейлиста `.m3u`, який оновлюється після кожного завантаженого відео
- **Керування швидкістю та pacing** — обмежуйте download bandwidth, додавайте затримки між запитами й налаштовуйте fragment threads за пресетами (*Off · Balanced · Careful · Custom*)

### Субтитри та постобробка

- **Субтитри** у SRT, VTT або ASS — ручні або авто-згенеровані, будь-якою доступною мовою
- Зберігайте поруч із відео, вбудовуйте в `.mkv` або складайте в підпапку `Subtitles/`
- **SponsorBlock** — пропускайте або позначайте розділами спонсорські вставки, вступи, кінцівки, самопіар
- **Вбудовані метадані** — назва, дата завантаження, канал, опис, мініатюра та маркери розділів записуються у файл

### YouTube + 2000 сайтів

- **YouTube — у повному обсязі** — відео, Shorts, канали, плейлисти, YouTube Music і подкасти обробляються як першокласні джерела
- **2000+ інших сайтів** через yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org та багато іншого
- **Лише аудіо та субтитри** працюють на кожному підтримуваному сайті, а не лише на YouTube
- Якщо сайт змінюється, yt-dlp щотижня випускає виправлення, а Arroxy оновлює бінарний файл при запуску

<table align="center" width="100%">
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

---

## <a id="privacy"></a>Конфіденційність

Завантаження виконуються безпосередньо через [yt-dlp](https://github.com/yt-dlp/yt-dlp) з YouTube у вибрану вами теку — нічого не маршрутизується через сторонні сервери. Історія перегляду, історія завантажень, URL та вміст файлів залишаються на вашому пристрої.

Arroxy надсилає анонімну агрегатну телеметрію через [OpenPanel](https://openpanel.dev) — рівно стільки, щоб розуміти запуски, OS, версії застосунку та збої. Без URL, назв відео, шляхів до файлів, даних акаунта, fingerprinting чи персональних даних. ID установки випадковий і не пов’язаний із вашою особою. Можна вимкнути в Налаштуваннях.

---

## <a id="faq"></a>Часті запитання

**Це справді безкоштовно?**
Так — ліцензія MIT, без преміум-рівня, без заблокованих функцій.

**Які якості відео можна завантажувати?**
Будь-які, що пропонує YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, а також лише аудіо. Потоки з частотою 60 fps, 120 fps та HDR зберігаються як є.

**Чи можна витягти лише аудіо як MP3?**
Так. Обери *лише аудіо* в меню форматів, а потім MP3, M4A/AAC, Opus або WAV.

**Чи потрібен акаунт YouTube або куки?**
За замовчуванням — ні. Arroxy працює без акаунта YouTube, без логіну та без експорту кук. Опціональна підтримка кук доступна в розділі «Розширені налаштування» (Джерело кук: файл або браузер) для вмісту, який потребує автентифікації, наприклад відео з віковим обмеженням або лише для учасників. За замовчуванням ця опція вимкнена. Якщо ви її увімкнете, у вікі yt-dlp зазначено, що [автоматизація на основі кук може позначити акаунт Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); у такому випадку безпечніше використовувати одноразовий акаунт.

**Чи продовжить він працювати, якщо YouTube щось зміниться?**
yt-dlp автоматично оновлюється під час запуску, а Arroxy оперативно випускає виправлення, коли YouTube щось змінює. Якщо ви все ж зіткнетеся з проблемою, як запасний варіант доступна опціональна підтримка кук у розділі «Розширені налаштування».

**Якими мовами доступний Arroxy?**
Двадцятьма однією, з коробки: English, Español (іспанська), Deutsch (німецька), Français (французька), 日本語 (японська), 中文 (китайська), Русский (російська), Українська, हिन्दी (хінді), Afaan Oromoo (оромо), Kiswahili (суахілі), O'zbekcha (узбецька), Tiếng Việt (в'єтнамська), አማርኛ (амхарська), العربية (арабська), اردو (урду), پښتو (пашто), বাংলা (бенгальська), မြန်မာဘာသာ (бірманська), Ελληνικά (грецька) і Српски (сербська). Arroxy автоматично визначає мову операційної системи при першому запуску, і ви можете перемикнутися будь-коли через вибір мови в панелі інструментів. JSON-файли локалей для runtime лежать у src/shared/i18n/locales/, а PO-каталоги для перекладачів знаходяться в i18n/locales/ — відкрийте PR на GitHub, щоб зробити внесок.

**Чи потрібно щось встановлювати додатково?**
Ні. yt-dlp автоматично завантажується при першому запуску й кешується на вашій машині; ffmpeg і ffprobe постачаються разом із застосунком. Після цього жодних додаткових налаштувань не потрібно.

**Чи можна завантажувати плейлисти або цілі канали?**
Так — і те, й інше. Вставте URL playlist або channel (наприклад, `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); виберіть, скільки entries сканувати, а потім додайте весь список у queue або виберіть окремі відео. Date-range filters з’являться незабаром.

**macOS каже «застосунок пошкоджений» — що робити?**
Це macOS Gatekeeper блокує непідписаний застосунок, а не реальне пошкодження. Дивіться розділ ["App is damaged" — виправлення через Terminal](#macos-first-launch) — там є однорядкова команда `xattr`, яка вирішує проблему.

**Чи законно завантажувати відео YouTube?**
Для особистого, приватного використання це загалом прийнято в більшості юрисдикцій. Ви несете відповідальність за дотримання [Умов використання](https://www.youtube.com/t/terms) YouTube та місцевого авторського права.

---

## <a id="roadmap"></a>Дорожня карта

Досі заплановано — приблизно за пріоритетом:

| Функція    | Опис    |
| ---------------- | ---------------- |
| **Фільтри плейлистів і каналів** | Date-range filters під час переліку playlist або channel |
| **Пріоритети аудіодоріжок YouTube** | Задати бажану мовну аудіодоріжку для всього застосунку, із перевизначеннями в окремих профілях, коли YouTube надає кілька аудіотреків |
| **Вхід через браузер у застосунку** | Відкривати браузерні вікна всередині Arroxy, щоб входити на сайти й використовувати cookies без ручного експорту |
| **Завантаження відео в один клік** | Запускати завантаження відео в один клік із виявленого або вставленого URL за активним профілем |
| **Надійніше відновлення повтором** | Новий шлях повторної спроби для завантажень, перерваних нестабільним або проблемним інтернет-з'єднанням |
| **Повноцінний менеджер завантажень у drawer** | Перетворити drawer черги на повніший менеджер, включно зі зміною папок призначення для елементів у черзі |
| **Заплановані завантаження** | Запускайте чергу в заданий час (нічні запуски) |
| **Обрізання кліпів** | Завантажуйте лише фрагмент за часом початку та кінця |

Маєте ідею? [Відкрийте запит](../../issues) — голос спільноти визначає пріоритети.

---

## <a id="tech"></a>Технології

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — крос-платформна настільна оболонка
- **React 19** + **TypeScript** — інтерфейс
- **Tailwind CSS v4** — стилізація
- **Zustand** — керування станом
- **yt-dlp** + **ffmpeg** — рушій завантаження та мультиплексування (yt-dlp отримується під час роботи; ffmpeg/ffprobe вбудовуються під час збірки)
- **Vite** + **electron-vite** — збірка
- **Vitest** + **Playwright** — модульні та наскрізні тести

</details>

<details>
<summary><strong>Збірка з вихідного коду</strong></summary>

### Передумови — всі платформи

| Інструмент | Версія  | Встановлення |
| ---------- | ------- | ------------ |
| Git        | будь-яка | [git-scm.com](https://git-scm.com) |
| Node.js    | 24.16.0 | `mise install` або `.node-version` |
| Bun        | 1.2.23  | `mise install` або `package.json` `packageManager` |

Рекомендовано: встановіть `mise`, а потім запустіть `mise install` у checkout. Без mise вручну активуйте Node.js з `.node-version` і Bun з `package.json` перед `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools і Python можуть знадобитися для нативних перебудов.

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
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

> `bun run bootstrap` встановлює залежності, перебудовує залежності Electron-застосунку, перевіряє Electron, готує вбудовані ffmpeg/ffprobe для розробки та встановлює Playwright Chromium. yt-dlp керується під час роботи в папці даних застосунку; ffmpeg і ffprobe входять до кожного релізу Arroxy.

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

## Умови використання

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
