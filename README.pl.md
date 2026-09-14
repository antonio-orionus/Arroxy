<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Maskotka Arroxy" width="180" />

# Arroxy — bezpłatny downloader YouTube (+ 2000 serwisów) o otwartym kodzie na Windows, macOS i Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Przeczytaj w języku:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · **Polski** · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Wydanie](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Kompilacja](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Witryna](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Licencja](https://img.shields.io/badge/license-MIT-green) ![Platformy](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Języki](https://img.shields.io/badge/i18n-30_languages-blue)

Pobieraj filmy, Shorts, muzykę, kanały, podcasty i ścieżki dźwiękowe z **YouTube oraz ponad 2000 obsługiwanych serwisów** — nawet w 4K HDR przy 60 kl./s albo jako MP3 / AAC / Opus. Działa lokalnie na Windows, macOS i Linux. **Bez reklam, zbędnych dodatków i płatnych zachęt.**

[**↓ Zainstaluj najnowsze wydanie**](#install) &nbsp;·&nbsp; [**Witryna**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Pierwsze uruchomienie w Windows](#windows-first-launch) · [Pierwsze uruchomienie w macOS](#macos-first-launch) · [Pierwsze uruchomienie w Linux](#linux-first-launch)

[![Dołącz do społeczności Discord](https://img.shields.io/badge/Do%C5%82%C4%85cz%20do%20spo%C5%82eczno%C5%9Bci%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Prezentacja Arroxy" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

Jeśli Arroxy oszczędza Ci czas, ⭐ pomoże innym je znaleźć.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-09-14._

> 🌐 To tłumaczenie powstało przy wsparciu AI. [Angielski README](README.md) jest źródłem nadrzędnym. Znalazłeś błąd? [Otwórz PR](../../pulls).

---

## Spis treści

- [Instalacja i pierwsze uruchomienie](#install)
  - [Pierwsze uruchomienie w Windows](#windows-first-launch)
  - [Pierwsze uruchomienie w macOS](#macos-first-launch)
  - [Dlaczego może pojawić się ostrzeżenie](#why-warning)
  - [Pierwsze uruchomienie w Linux](#linux-first-launch)
  - [Sprawdź pobrany plik (SHA256)](#verify)
- [Dlaczego Arroxy](#why)
- [Funkcje](#features)
- [Prywatność](#privacy)
- [Najczęstsze pytania](#faq)
- [Plan rozwoju](#roadmap)
- [Wesprzyj Arroxy](#support)
- [Technologie](#tech)

---

## <a id="install"></a>Instalacja i pierwsze uruchomienie

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Skrypt dla systemu Linux sprawdza pobrany plik względem opublikowanego `SHA256SUMS` i dodaje Arroxy do menu aplikacji. Dostępne są tylko kompilacje x86_64. Nie masz `curl`? Zamień `curl -fsSL` na `wget -qO-`.

| Platforma | Pobieranie bezpośrednie |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Wszystkie pliki wydania →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="windows-first-launch"></a>Pierwsze uruchomienie w Windows

Przy pierwszym uruchomieniu możesz zobaczyć **„System Windows ochronił ten komputer”** albo **„Nieznany wydawca”**. Dotyczy to plików `Arroxy-win-x64-Setup.exe` i `Arroxy-win-x64-Portable.exe`. Arroxy jest bezpłatne i ma otwarty kod, ale kompilacje Windows nie są podpisane płatnym certyfikatem, dlatego SmartScreen je oznacza. **Nie** oznacza to automatycznie, że Arroxy jest niebezpieczne. Aby kontynuować:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="Okno SmartScreen „System Windows ochronił ten komputer” z wyróżnionym linkiem „Więcej informacji”" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="Rozwinięte okno SmartScreen z przyciskiem „Uruchom mimo to”" />
</div>

1. Kliknij **Więcej informacji**.
2. Kliknij **Uruchom mimo to**.

#### Gdy Windows Defender oznaczy lub usunie plik

Heurystyka Defendera czasem uznaje niepodpisane instalatory NSIS i przenośne aplikacje Electron za podejrzane. Jeśli Defender podda kwarantannie `Arroxy-win-x64-Setup.exe` lub `Arroxy-win-x64-Portable.exe`, przywróć go w **Zabezpieczenia Windows → Ochrona przed wirusami i zagrożeniami → Historia ochrony**, a następnie dodaj plik wykonywalny Arroxy jako dozwolony element w **Zarządzaj ustawieniami → Dodaj lub usuń wykluczenia**. Tak jak w SmartScreen, powodem jest brak podpisu wydawcy, nie wykryte złośliwe oprogramowanie.

> Pobieraj Arroxy wyłącznie z oficjalnej strony wydań GitHub. Jeśli plik pochodzi z innej witryny albo został przesłany przez kogoś, usuń go i pobierz świeżą kopię z oficjalnego źródła. Kod jest publiczny, więc możesz go sprawdzić lub samodzielnie zbudować Arroxy.

Wolisz Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

### <a id="macos-first-launch"></a>Pierwsze uruchomienie w macOS

Kompilacje Arroxy dla macOS są podpisane ad hoc, ale nie zostały poświadczone przez Apple, dlatego Gatekeeper blokuje pierwszy start komunikatem *Nie otwarto „Arroxy.app” — Apple nie może sprawdzić, czy „Arroxy.app” nie zawiera złośliwego oprogramowania*. Oznacza to, że macOS nie może sprawdzić aplikacji w Apple, a nie że pliki są uszkodzone. Instalacja przez Homebrew całkowicie omija to okno. Po użyciu DMG wystarczy jedno polecenie w Terminalu:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Przeciągnij `Arroxy.app` z zamontowanego DMG do `/Applications`.
2. Otwórz Terminal i wykonaj te dwa polecenia:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Pierwsze polecenie usuwa atrybut kwarantanny nadany pobranemu plikowi przez macOS, a drugie uruchamia aplikację. Zwykle `sudo` nie jest potrzebne, ponieważ kopia w `/Applications` należy do Ciebie — dodaj je tylko po błędzie uprawnień.

**Apple Silicon a Intel:** na Macu serii M (M1 / M2 / M3 / M4) pobierz DMG `arm64`. Na Macu z procesorem Intel pobierz DMG `x64`. Niewłaściwa kompilacja zadziała przez Rosettę, ale będzie zauważalnie wolniejsza.

> Kompilacje macOS powstają w CI na maszynach Apple Silicon i Intel. W razie problemów [otwórz zgłoszenie](../../issues) — opinie użytkowników macOS bezpośrednio kształtują cykl testów.

### <a id="why-warning"></a>Dlaczego może pojawić się ostrzeżenie

Arroxy ma otwarty kod i licencję MIT. Kompilacje Windows i macOS **nie są podpisane cyfrowo** — certyfikaty Apple Developer ID oraz Windows EV kosztują po kilkaset dolarów rocznie, co niezależny projekt musiałby opłacać sam. Bez tych podpisów Windows SmartScreen i macOS Gatekeeper ostrzegają przy pierwszym uruchomieniu. Ostrzeżenie oznacza, że *system nie rozpoznaje wydawcy*, a nie że Arroxy jest złośliwym oprogramowaniem.

Trzy sposoby samodzielnego sprawdzenia Arroxy, od najprostszego do najbardziej rygorystycznego:

- **Przeczytaj kod.** Każda linia jest na [GitHubie](https://github.com/antonio-orionus/Arroxy), a aplikację możesz [zbudować ze źródeł](#tech).
- **Sprawdź SHA256.** Porównaj plik z opublikowanym [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — zobacz niżej [Sprawdź pobrany plik](#verify).
- **Użyj zewnętrznego skanera.** Prześlij plik do [VirusTotal](https://www.virustotal.com).

### <a id="linux-first-launch"></a>Pierwsze uruchomienie w Linux

AppImage uruchamia się bezpośrednio, bez instalacji. Trzeba jedynie nadać plikowi prawo wykonywania.

**Menedżer plików:** kliknij `.AppImage` prawym przyciskiem → **Właściwości** → **Uprawnienia** → włącz **Zezwól na wykonywanie pliku jako programu**, a następnie kliknij dwukrotnie.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Jeśli uruchamianie nadal się nie powiedzie, uruchom bez montowania — pakiet FUSE nie jest potrzebny:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Opcjonalna integracja z pulpitem:** zainstaluj raz [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), a każda dwukrotnie kliknięta AppImage zostanie automatycznie dodana do menu aplikacji — bez ręcznego pliku `.desktop`.

**Zwykłe archiwum tar (bez FUSE i instalacji):**

Kompilacja `.tar.gz` to ta sama aplikacja bez opakowania AppImage — rozpakuj ją w dowolnym miejscu i uruchom. Instalator ani FUSE nie są potrzebne.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Flatpak (alternatywa w piaskownicy):** pobierz `Arroxy-linux-x64.flatpak` z tej samej strony wydania.

Ubuntu domyślnie oferuje Snap zamiast Flatpak, więc najpierw zainstaluj Flatpak i dodaj Flathub — pakiet pobierze stamtąd środowisko wykonawcze:

```bash
# Ubuntu / Debian
sudo apt install -y flatpak

# Fedora
sudo dnf install -y flatpak

# Arch
sudo pacman -S flatpak
```

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user ./Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

**Pliki Linux na stronie wydania są dostępne wyłącznie dla x86_64.** Na urządzeniach ARM64 (Raspberry Pi, Asahi Linux) Flatpak zainstaluje się, lecz uruchomienie zakończy się błędem `bwrap: execvp ldconfig: Exec format error`.

<details>
<summary><strong><a id="verify"></a>Sprawdź pobrany plik (SHA256)</strong></summary>

Każde wydanie publikuje plik `SHA256SUMS` obok programów. Aby sprawdzić, czy pobrany plik nie został uszkodzony ani zmieniony w drodze, oblicz jego skrót lokalnie i porównaj z odpowiednim wierszem w `SHA256SUMS`. Otwórz stronę najnowszego wydania → **Assets** → pobierz `SHA256SUMS`.

**Windows (PowerShell lub Wiersz polecenia):**

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

Chcesz zewnętrznego skanowania pod kątem złośliwego oprogramowania? Prześlij plik do [VirusTotal](https://www.virustotal.com). Kilka ogólnych alertów heurystycznych z mniej znanych silników jest normalne dla niepodpisanych aplikacji Electron; liczne wykrycia przez główne silniki byłyby powodem do niepokoju.

</details>

<details>
<summary><strong>Windows: instalator a wersja przenośna</strong></summary>

|               | Instalator NSIS | Przenośny `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Wymaga instalacji | Tak  | Nie — uruchom z dowolnego miejsca  |
| Automatyczne aktualizacje | ✅ w aplikacji  | ❌ pobieranie ręczne  |
| Szybkość uruchamiania | ✅ szybciej  | ⚠️ wolniejszy zimny start  |
| Dodaje do menu Start |            ✅            |           ❌            |
| Łatwe odinstalowanie |            ✅            | ❌ usuń plik  |

**Zalecenie:** użyj instalatora NSIS, aby uzyskać automatyczne aktualizacje i szybszy start. Wersję przenośną `.exe` wybierz, jeśli nie chcesz instalacji ani wpisów w rejestrze.

</details>

---

## <a id="why"></a>Dlaczego Arroxy

Porównanie z najpopularniejszymi alternatywami:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Bezpłatne, bez planu premium |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Otwarty kod źródłowy |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Wyłącznie lokalne przetwarzanie |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Bez logowania i eksportu plików cookie |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Bez limitów użycia |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Wieloplatformowa aplikacja komputerowa |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Napisy + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy ma jedno zadanie: wklejasz adres URL i otrzymujesz czysty plik lokalny. Bez kont, płatnych zachęt i zbierania danych.

---

## <a id="features"></a>Funkcje

### Jakość i formaty

- Do **4K UHD (2160p)**, a także 1440p, 1080p, 720p, 480p i 360p
- **Wysoka liczba klatek** zachowana bez zmian — 60 kl./s, 120 kl./s, HDR
- **Dźwięk** — eksportuj sam dźwięk jako MP3, M4A/AAC, Opus lub WAV. Podczas pobierania interaktywnego możesz wybrać natywne ścieżki surround/Dolby źródła (AC-3, E-AC-3, 5.1, DRC), gdy są dostępne, albo ustawić globalne **Preferuj surround / Dolby**
- Szybkie ustawienia: *Najlepsza jakość* · *Zrównoważone* · *Mały plik*

### Prywatność i kontrola

- Przetwarzanie w 100% lokalne — pliki trafiają prosto z YouTube na Twój dysk
- **Otwarty kod źródłowy** — każdą linię można sprawdzić, licencja MIT
- Pliki są zapisywane bezpośrednio w wybranym folderze

### Przepływ pracy

- **Globalny skrót pobierania** — skopiuj link w dowolnej aplikacji i naciśnij `Ctrl+Shift+D` (`Cmd+Shift+D` na macOS); Arroxy doda go do kolejki z aktywnym profilem bez otwierania okna, a powiadomienie to potwierdzi. Domyślnie włączony, z możliwością zmiany
- **Elastyczne tryby rozpoczęcia** — wybierz prowadzony pojedynczy plik, selektor playlisty/kanału, zbiorcze wklejanie adresów URL albo Szybkie pobieranie z zapisanymi ustawieniami
- **Centralna kolejka pobierania** — zadania pojedyncze, playlisty, zbiorcze i szybkie trafiają w jedno miejsce, gdzie można śledzić postęp, wstrzymywać, wznawiać, anulować, ponawiać i ustalać priorytet
- **Monitorowanie schowka** — skopiuj link YouTube, a po powrocie do aplikacji Arroxy automatycznie uzupełni adres URL (przełącznik w ustawieniach zaawansowanych)
- **Automatyczne czyszczenie URL-i** — usuwa parametry śledzące (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) i rozpakowuje linki `youtube.com/redirect`
- **Tryb zasobnika** — zamknięcie okna nie przerywa pobierania w tle
- **30 języków** — automatyczne wykrywanie języka systemu i zmiana w dowolnym momencie
- **Synchronizacja playlist** — ponownie skanuje playlistę względem lokalnego folderu, pomijając już pobrane filmy; tworzy plik playlisty `.m3u` aktualizowany po pobraniu każdego filmu
- **Sterowanie szybkością i tempem** — ogranicz przepustowość, ustaw liczbę równocześnie pobieranych części filmu i dodaj opóźnienia żądań za pomocą ustawień (*Wyłączone · Zrównoważone · Ostrożne · Własne*)
- **Szablony nazw plików** — nazywaj pliki po swojemu za pomocą `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` i `{playlist_index}`, globalnie lub osobno w profilach
- **Równoczesne pobieranie i automatyczne ponawianie** — wybierz liczbę zadań wykonywanych jednocześnie i pozwól Arroxy ponawiać pobrania przerwane przez sieć lub serwer, z coraz dłuższym oczekiwaniem
- **Profile osobne dla elementów playlisty** — przypisz każdemu filmowi własny profil zamiast jednego ustawienia dla całej listy, aby w jednym przebiegu archiwizować część w pełnej jakości, a resztę pobrać jako MP3

### Napisy i obróbka końcowa

- **Napisy** w SRT, VTT lub ASS — ręczne albo generowane automatycznie, w każdym dostępnym języku
- Zapisuj obok filmu, osadzaj w `.mkv` albo porządkuj w podfolderze `Subtitles/`
- **SponsorBlock** — pomijaj sponsorów, intra, zakończenia i autopromocje albo oznaczaj je jako rozdziały
- **Osadzone metadane** — tytuł, data przesłania, kanał, opis, miniatura i znaczniki rozdziałów zapisane w pliku

### YouTube + 2000 serwisów

- **Pełna obsługa YouTube** — filmy, Shorts, kanały, playlisty, YouTube Music i podcasty są źródłami pierwszej klasy
- **Ponad 2000 innych serwisów** dzięki yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org i wiele innych
- **Sam dźwięk i napisy** działają we wszystkich obsługiwanych serwisach, nie tylko w YouTube
- Gdy serwis się zmieni, yt-dlp co tydzień dostarcza poprawki, a Arroxy automatycznie aktualizuje plik wykonywalny przy starcie

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Globalny skrót pobierania Arroxy — Ctrl+Shift+D w Windows i Linux oraz Cmd+Shift+D w macOS, wysyłający skopiowany link prosto do kolejki" width="760" /></picture><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Globalny skrót pobierania</b><br/>Skopiuj link gdziekolwiek i naciśnij raz — trafi do kolejki i zacznie się pobierać</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profile osobne dla elementów playlisty</b><br/>Nadaj każdemu filmowi własny profil — część archiwizuj w 4K, resztę pobieraj jako MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Ekran Szybkiego pobierania</b><br/>Wklej URL i od razu pobierz go aktywnym profilem</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Profile pobierania wielokrotnego użytku</b><br/>Zapisz format, jakość i folder docelowy, a potem używaj ich ponownie</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Wielojęzyczne ścieżki dźwiękowe</b><br/>Wybierz dokładny język dźwięku dostępny w filmie</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Dźwięk surround / Dolby</b><br/>Ścieżki 5.1 i Dolby są wykrywane i zachowywane</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Tryb zbiorczych URL-i</b><br/>Wklej listę, automatycznie usuń duplikaty i dodaj wszystko do kolejki</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Równoległa kolejka pobierania</b><br/>Kilka pobrań naraz z postępem na żywo</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>Prywatność

Pliki są pobierane przez [yt-dlp](https://github.com/yt-dlp/yt-dlp) bezpośrednio z YouTube do wybranego folderu — bez pośrednictwa serwera zewnętrznego. Historia oglądania i pobierania, adresy URL oraz zawartość plików pozostają na urządzeniu.

Arroxy wysyła przez [OpenPanel](https://openpanel.dev) anonimową, zagregowaną telemetrię — tylko tyle, aby niezależny projekt mógł rozumieć błędy, awarie, opinie, systemy operacyjne i wersje aplikacji. Bez adresów URL, tytułów filmów, ścieżek plików, danych kont, odcisków urządzenia ani danych osobowych. Identyfikator instalacji jest losowy i niezwiązany z Twoją tożsamością. Możesz zrezygnować w Ustawieniach.

---

## <a id="faq"></a>Najczęstsze pytania

**Czy to naprawdę jest bezpłatne?**
Tak — licencja MIT, brak planu premium i blokowania funkcji.

**Jakie jakości filmów mogę pobierać?**
Wszystko, co udostępnia YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p oraz sam dźwięk. Strumienie 60 kl./s, 120 kl./s i HDR są zachowywane bez zmian.

**Czy mogę wyodrębnić sam dźwięk jako MP3?**
Tak. W menu formatu wybierz *tylko dźwięk*, a następnie MP3, M4A/AAC, Opus lub WAV.

**Czy potrzebuję konta YouTube lub plików cookie?**
Domyślnie nie — Arroxy działa bez konta YouTube, logowania i eksportowania plików cookie. Opcjonalną obsługę cookie można włączyć w ustawieniach zaawansowanych (źródło cookie: plik lub przeglądarka) dla treści wymagających uwierzytelnienia, takich jak filmy z ograniczeniem wieku lub tylko dla wspierających. Funkcja jest domyślnie wyłączona. Wiki yt-dlp ostrzega, że po jej włączeniu [automatyzacja korzystająca z cookie może spowodować oznaczenie konta Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); bezpieczniej użyć wtedy konta zapasowego.

**Czy aplikacja będzie działać po zmianach w YouTube?**
yt-dlp aktualizuje się automatycznie przy uruchomieniu, a Arroxy szybko publikuje poprawki po zmianach w YouTube. Jeśli mimo to wystąpi problem, opcjonalna obsługa cookie jest dostępna w ustawieniach zaawansowanych jako rozwiązanie awaryjne.

**W jakich językach jest dostępne Arroxy?**
30 języków od razu po instalacji: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Przy pierwszym uruchomieniu Arroxy automatycznie wykrywa język systemu operacyjnego, a potem można go zmienić w dowolnym momencie za pomocą selektora na pasku narzędzi. Pliki JSON używane w aplikacji znajdują się w src/shared/i18n/locales/, a katalogi PO dla tłumaczy w i18n/locales/ — otwórz PR na GitHubie, aby pomóc.

**Czy muszę instalować coś jeszcze?**
Nie. yt-dlp jest pobierane automatycznie przy pierwszym uruchomieniu i zapisywane w pamięci podręcznej, a ffmpeg i ffprobe są dołączone do aplikacji. Później nie potrzeba dodatkowej konfiguracji.

**Czy mogę pobierać playlisty lub całe kanały?**
Tak, jedno i drugie. Wklej adres playlisty lub kanału (np. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`), wybierz liczbę wpisów do sprawdzenia, a następnie dodaj całą listę do kolejki albo zaznacz konkretne filmy. Filtry zakresu dat pojawią się wkrótce.

**macOS twierdzi, że „aplikacja jest uszkodzona” — co zrobić?**
To Gatekeeper blokuje niepodpisaną aplikację, a nie faktyczne uszkodzenie. W sekcji [Pierwsze uruchomienie w macOS](#macos-first-launch) znajdziesz polecenia Terminala usuwające kwarantannę i uruchamiające Arroxy.

**Czy pobieranie filmów z YouTube jest legalne?**
W większości jurysdykcji jest ogólnie akceptowane do użytku osobistego i prywatnego. Odpowiadasz za przestrzeganie [Warunków korzystania](https://www.youtube.com/t/terms) z YouTube oraz lokalnego prawa autorskiego.

---

## <a id="roadmap"></a>Plan rozwoju

Nadal planowane — mniej więcej w kolejności priorytetów:

| Funkcja    | Opis    |
| ---------------- | ---------------- |
| **Filtry playlist i kanałów** | Filtrowanie zakresu dat podczas odczytywania playlisty lub kanału |
| **Preferencje ścieżek dźwiękowych YouTube** | Globalna preferencja języka mówionego z wyjątkami w profilach, gdy YouTube oferuje wiele ścieżek |
| **Logowanie w przeglądarce aplikacji** | Otwieranie okien przeglądarki wewnątrz Arroxy, aby logować się i używać cookie witryn bez ręcznego eksportowania |
| **Pobieranie filmu jednym kliknięciem** | Rozpoczęcie jednym kliknięciem pobierania wykrytego lub wklejonego URL-a przy użyciu aktywnego profilu |
| **Skuteczniejsze odzyskiwanie przez ponawianie** | Nowa ścieżka ponawiania pobrań przerwanych przez niestabilne lub problematyczne połączenie internetowe |
| **Pełny panel menedżera pobierania** | Rozbudowanie panelu kolejki o pełniejsze zarządzanie, w tym zmianę folderów docelowych zadań oczekujących |
| **Zaplanowane pobieranie** | Uruchamianie kolejki o ustawionej porze, na przykład w nocy |
| **Przycinanie klipów** | Pobieranie tylko fragmentu między czasem początkowym a końcowym |

Masz pomysł na funkcję? [Otwórz propozycję](../../issues) — opinie społeczności kształtują priorytety.

---

## <a id="support"></a>Wesprzyj Arroxy

Arroxy jest bezpłatne i ma licencję MIT — bez reklam i płatnego planu. Jeśli oszczędza Ci czas, możesz wesprzeć rozwój przez Bitcoin lub Tron; adresy znajdują się w [DONATE.md](DONATE.md), jedynym oficjalnym źródle. Arroxy nigdy nie wyśle adresu e-mailem ani prywatną wiadomością. Gwiazdka dla repozytorium, zgłaszanie błędów i ulepszanie tłumaczeń pomagają równie mocno.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a>

---

## <a id="tech"></a>Technologie

<details>
<summary><strong>Technologie</strong></summary>

- **Electron** — wieloplatformowa powłoka aplikacji komputerowej
- **React 19** + **TypeScript** — interfejs użytkownika
- **Tailwind CSS v4** — style
- **Zustand** — zarządzanie stanem
- **yt-dlp** + **ffmpeg** — silnik pobierania i multipleksowania (yt-dlp pobierane podczas działania; ffmpeg/ffprobe dołączane podczas kompilacji)
- **Vite** + **electron-vite** — narzędzia kompilacji
- **Vitest** + **Playwright** — testy jednostkowe i end-to-end

</details>

<details>
<summary><strong>Budowanie ze źródeł</strong></summary>

### Wymagania wstępne — wszystkie platformy

| Narzędzie | Wersja | Instalacja |
| --------- | ------ | ---------- |
| Git       | dowolna | [git-scm.com](https://git-scm.com) |
| Node.js   | 24.16.0 | `mise install` lub `.node-version` |
| Bun       | 1.2.23  | `mise install` lub `package.json` `packageManager` |

Zalecane: zainstaluj `mise`, a następnie uruchom `mise install` w repozytorium. Bez mise ręcznie aktywuj Node.js zgodnie z `.node-version` oraz Bun zgodnie z `package.json`, zanim wykonasz `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Do przebudowania zależności natywnych mogą być potrzebne Visual Studio Build Tools i Python.

### macOS

```bash
brew install mise
xcode-select --install
```

Po sklonowaniu uruchom w repozytorium `mise trust && mise install`. Jeśli powłoka używa już `fnm`, `nvm` lub Bun z Homebrew, aktywuj mise w `~/.zshrc`, aby Arroxy korzystało z Node.js 24.16.0 i Bun 1.2.23:

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

# Zależności kompilacji i środowiska Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tylko testy E2E (Electron wymaga ekranu)
sudo apt install -y xvfb
```

### Sklonuj i uruchom

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # zalecane; pomiń, jeśli ręcznie aktywowano przypięte wersje
bun run bootstrap
bun run doctor
bun run dev            # aplikacja Electron z rendererem Vite
```

### Zbuduj pakiet do dystrybucji

```bash
bun run build        # kontrola typów + kompilacja
bun run dist         # pakiet dla bieżącego systemu
bun run dist:win     # pakiety Windows na obsługiwanym hoście
```

> `bun run bootstrap` instaluje zależności, przebudowuje zależności aplikacji Electron, sprawdza Electron, przygotowuje wbudowane ffmpeg/ffprobe do pracy programistycznej i instaluje Playwright Chromium. yt-dlp jest zarządzane podczas działania w folderze danych aplikacji; ffmpeg i ffprobe są dołączone do każdego wydania Arroxy.

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

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

---

## Warunki użytkowania

Arroxy jest narzędziem wyłącznie do użytku osobistego i prywatnego. Tylko Ty odpowiadasz za zgodność pobieranych materiałów z [Warunkami korzystania](https://www.youtube.com/t/terms) z YouTube oraz prawem autorskim obowiązującym w Twojej jurysdykcji. Nie używaj Arroxy do pobierania, powielania ani rozpowszechniania treści, do których nie masz praw. Twórcy nie odpowiadają za niewłaściwe użycie.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Licencja MIT · Stworzone z troską przez <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
