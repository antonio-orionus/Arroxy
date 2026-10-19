<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Maskotka Arroxy" width="180" />

# Arroxy — bezpłatny downloader YouTube (+ 2000 serwisów) o otwartym kodzie z wbudowaną przeglądarką na Windows, macOS i Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Przeczytaj w języku:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · **Polski** · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Wydanie](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Kompilacja](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Witryna](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Licencja](https://img.shields.io/badge/license-MIT-green) ![Platformy](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Języki](https://img.shields.io/badge/i18n-31_languages-blue)

Pobieraj filmy, Shorts, muzykę, kanały, podcasty i ścieżki dźwiękowe z **YouTube oraz ponad 2000 obsługiwanych serwisów** — nawet w 8K HDR przy 60 kl./s, jako MP3 / AAC / Opus albo tylko potrzebny fragment. **Przeglądaj YouTube lub dowolną inną stronę w Arroxy** na karcie Explore i pobieraj oglądany film, playlistę lub kanał; zaloguj się tam, aby pobierać filmy prywatne, tylko dla członków i z ograniczeniem wieku, które może oglądać Twoje konto. Działa lokalnie na Windows, macOS i Linux. **Bez reklam, zbędnych dodatków i płatnych zachęt.**

[**↓ Zainstaluj najnowsze wydanie**](#install) &nbsp;·&nbsp; [**Witryna**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Pierwsze uruchomienie w Windows](#windows-first-launch) · [Pierwsze uruchomienie w macOS](#macos-first-launch) · [Pierwsze uruchomienie w Linux](#linux-first-launch)

[![Dołącz do społeczności Discord](https://img.shields.io/badge/Do%C5%82%C4%85cz%20do%20spo%C5%82eczno%C5%9Bci%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Jeśli Arroxy oszczędza Ci czas, ⭐ pomoże innym je znaleźć.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 To tłumaczenie powstało przy wsparciu AI. [Angielski README](README.md) jest źródłem nadrzędnym. Znalazłeś błąd? [Otwórz PR](../../pulls).

---

## Spis treści

- [✨ Funkcje](#features)
- [📥 Instalacja i pierwsze uruchomienie](#install)
  - [Pierwsze uruchomienie w Windows](#windows-first-launch)
  - [Pierwsze uruchomienie w macOS](#macos-first-launch)
  - [Dlaczego może pojawić się ostrzeżenie](#why-warning)
  - [Pierwsze uruchomienie w Linux](#linux-first-launch)
  - [Sprawdź pobrany plik (SHA256)](#verify)
- [⚖️ Dlaczego Arroxy](#why)
- [🔒 Prywatność](#privacy)
- [❓ Najczęstsze pytania](#faq)
- [🗺️ Plan rozwoju](#roadmap)
- [💖 Wesprzyj Arroxy](#support)
- [🛠️ Technologie](#tech)

---

## <a id="features"></a>✨ Funkcje

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Przeglądaj YouTube lub dowolną inną stronę w Arroxy i pobieraj bieżącą stronę z aktywnym profilem</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Pierwszy ekran Explore</b><br/>Krótkie wprowadzenie do Explore i powód, dla którego dodatkowe konto to bezpieczniejsze logowanie</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Pobieranie pokazuje, co wymaga Twojej uwagi</b><br/>Linki przygotowują się w tle; nieudany proponuje rozwiązanie, a długa playlista czeka na Twój wybór</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Pobierz tylko fragment wideo</b><br/>Wybierz początek i koniec albo rozdział — Arroxy zapisze tylko ten zakres</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Edytor profili</b><br/>Dopasuj profil: typ pliku, rozdzielczość, napisy, miejsce zapisu, szablon nazwy pliku i więcej</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Ciemny lub jasny, szklany lub jednolity</b><br/>Cztery wyglądy do wyboru: szklane panele na ruchomym niebie albo spokojne, jednolite powierzchnie — każdy w trybie ciemnym i jasnym</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Globalny skrót pobierania Arroxy — Ctrl+Shift+D w Windows i Linux oraz Cmd+Shift+D w macOS, wysyłający skopiowany link prosto do kolejki" width="760" /></picture><br/><sub><b>Globalny skrót pobierania</b><br/>Skopiuj link gdziekolwiek i naciśnij raz — trafi do kolejki i zacznie się pobierać</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profile osobne dla elementów playlisty</b><br/>Nadaj każdemu filmowi własny profil — część archiwizuj w 4K, resztę pobieraj jako MP3</sub></td>
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

<details open>
<summary><strong>🧭 Explore: przeglądaj sieć w Arroxy</strong></summary>

- **Karta Explore** — przeglądaj YouTube lub dowolną inną stronę w Arroxy i pobieraj znalezione filmy bez kopiowania linków. **Pobierz · *Twój profil*** dodaje do kolejki oglądany film, playlistę lub kanał; strzałka obok przełącza profile, a różdżka otwiera pobieranie krok po kroku, gdzie wybierzesz formaty, napisy i więcej
- **Pobieranie prawym przyciskiem** — kliknij prawym przyciskiem dowolny link do filmu, playlisty lub kanału w Explore, aby pobrać go ze swoim profilem, wybrać inny profil w **Pobierz z profilem**, otworzyć pobieranie krok po kroku lub skopiować link. Nie trzeba najpierw otwierać każdego filmu
- **Układ kompaktowy** — jedno kliknięcie na pasku narzędzi Explore przenosi do niego karty Arroxy i daje stronie więcej miejsca
- **Pasek adresu** — wpisz frazę, aby wyszukać w YouTube, albo wpisz dowolny adres internetowy, aby otworzyć tę stronę
- **Pobieranie wymagające konta** — zaloguj się raz w Explore, a Arroxy pobierze prywatne filmy i filmy tylko dla członków, które może oglądać Twoje konto, filmy z ograniczeniem wieku (jeśli wiek konta jest zweryfikowany) oraz listy Do obejrzenia i Polubione. Zaloguj się tam także na innych stronach, a ich pobieranie użyje tego logowania, gdy będzie potrzebne. Arroxy nadal najpierw pobiera bez logowania i używa Twojego logowania w Explore tylko wtedy, gdy pobieranie kończy się błędem, który może naprawić konto. Gdy YouTube prosi o potwierdzenie, że nie jesteś botem, Arroxy próbuje też użyć Twojego logowania w Explore
- **Użyj dodatkowego konta** — pierwszy ekran Explore wyjaśnia dlaczego: pobieranie z użyciem konta niesie pewne ryzyko, że konto zostanie ograniczone. Wyloguj się z Explore w Ustawieniach, kiedy tylko chcesz, aby logowania zostały zapomniane
- **Blokowanie reklam** — domyślnie wyłączone. Jedno kliknięcie tarczy na pasku narzędzi Explore blokuje reklamy i trackery na jego stronach, bez wpływu na pobieranie. YouTube może utrudniać korzystanie z blokad reklam na zalogowanych kontach

</details>

<details>
<summary><strong>🎞️ Jakość i formaty</strong></summary>

- Do **8K (4320p)**, a także 4K UHD (2160p), 1440p, 1080p, 720p, 480p i 360p
- **Wysoka liczba klatek i HDR** zachowane bez zmian — 60 kl./s, HDR10
- **Dźwięk** — eksportuj sam dźwięk jako MP3, M4A/AAC, Opus lub WAV. Podczas pobierania interaktywnego możesz wybrać natywne ścieżki surround/Dolby źródła (AC-3, E-AC-3, 5.1, DRC), gdy są dostępne, albo ustawić globalne **Preferuj surround / Dolby**
- **Profile z celem** — *Najlepszy obraz* (AV1 · VP9) lub *Smart TV* (MP4 · H.264), zapisywane jako Automatycznie, MP4, MKV lub WebM bez ponownego kodowania. HDR to *Automatycznie* (tylko gdy ekran potrafi go wyświetlić), *SDR* lub *HDR*
- **Każdy kodek w każdej rozdzielczości** — pobieranie krok po kroku pokazuje AV1, VP9 i H.264 obok siebie w każdej rozdzielczości, więc wybierzesz ten, który odtworzy Twój telewizor lub edytor
- **Wiedz, czym naprawdę jest strumień** — oznaczane są rozdzielczości przeskalowane przez YouTube za pomocą AI, języki ścieżek dźwiękowych z dubbingiem AI, strumienie o wyższej przepływności, filmy 360° oraz kopie uszkodzone lub ze znakiem wodnym. Profile pomijają strumienie przeskalowane przez AI, chyba że na nie zezwolisz

</details>

<details>
<summary><strong>🛡️ Prywatność i kontrola</strong></summary>

- Przetwarzanie w 100% lokalne — pliki trafiają prosto z YouTube na Twój dysk
- **Otwarty kod źródłowy** — każdą linię można sprawdzić, licencja MIT
- Pliki są zapisywane bezpośrednio w wybranym folderze

</details>

<details>
<summary><strong>⚡ Przepływ pracy</strong></summary>

- **Globalny skrót pobierania** — skopiuj link w dowolnej aplikacji i naciśnij `Ctrl+Shift+D` (`Cmd+Shift+D` na macOS); Arroxy doda go do kolejki z aktywnym profilem bez otwierania okna, a powiadomienie to potwierdzi. Domyślnie włączony, z możliwością zmiany
- **Elastyczne tryby rozpoczęcia** — wybierz prowadzony pojedynczy plik, selektor playlisty/kanału, zbiorcze wklejanie adresów URL, Szybkie pobieranie z zapisanymi ustawieniami albo przeglądanie i pobieranie z Explore
- **Centralna kolejka pobierania** — zadania pojedyncze, playlisty, zbiorcze i szybkie trafiają w jedno miejsce, gdzie można śledzić postęp, wstrzymywać, wznawiać, anulować, ponawiać i ustalać priorytet
- **Monitorowanie schowka** — skopiuj link do filmu, a po powrocie do Arroxy trafi on do pola URL, z opcją **Cofnij**, jeśli to pomyłka. Gdy Arroxy jest zajęty, link czeka, aż wrócisz na kartę „URL” (wyłączysz to w Ustawieniach)
- **Automatyczne czyszczenie URL-i** — usuwa parametry śledzące (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) i rozpakowuje linki `youtube.com/redirect`
- **Tryb zasobnika** — zamknięcie okna nie przerywa pobierania w tle
- **31 języków** — automatyczne wykrywanie języka systemu i zmiana w dowolnym momencie
- **Synchronizacja playlist** — ponownie skanuje playlistę względem lokalnego folderu, pomijając już pobrane filmy; tworzy plik playlisty `.m3u` aktualizowany po pobraniu każdego filmu
- **Sterowanie szybkością i tempem** — ogranicz przepustowość, ustaw liczbę równocześnie pobieranych części filmu i dodaj opóźnienia żądań za pomocą ustawień (*Wyłączone · Zrównoważone · Ostrożne · Własne*)
- **Szablony nazw plików** — nazywaj pliki po swojemu za pomocą `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` i `{playlist_index}`, globalnie lub osobno w profilach
- **Równoczesne pobieranie i automatyczne ponawianie** — wybierz liczbę zadań wykonywanych jednocześnie i pozwól Arroxy ponawiać pobrania przerwane przez sieć lub serwer, z coraz dłuższym oczekiwaniem
- **Profile osobne dla elementów playlisty** — przypisz każdemu filmowi własny profil zamiast jednego ustawienia dla całej listy, aby w jednym przebiegu archiwizować część w pełnej jakości, a resztę pobrać jako MP3
- **Szybkie pobieranie działa w tle** — link od razu pojawia się w zakładce Pobieranie i tam się przygotowuje, notatka z przyciskiem **Pokaż** to potwierdza, a pole URL czyści się na kolejny link. Uruchamiaj ile chcesz, gdy poprzednie jeszcze się przygotowują
- **Pobieranie pokazuje, co wymaga Twojej uwagi** — jeśli Arroxy nie może odczytać linku, jego wiersz podaje powód i proponuje rozwiązanie: Spróbuj ponownie, włącz cookie lub zaloguj się w Explore. Przy wyłączonych cookie **Zaloguj się przez Explore** ponowi próbę za Ciebie po zalogowaniu. Playlista dłuższa niż Twój limit wczytywania czeka w swoim wierszu, aż wybierzesz całość, pierwsze filmy lub przegląd. Karta Pobieranie liczy wiersze czekające na Ciebie
- **Pobieraj tylko fragment filmu** — wybierz początek i koniec albo rozdział na ekranie Format, a Arroxy zapisze tylko ten zakres, dodając go do nazwy po identyfikatorze filmu. Cięcia trafiają w najbliższą klatkę kluczową; włącz dokładne cięcie, aby zamiast tego ponownie zakodować materiał
- **Usuwaj ukończone pobierania** — opcjonalnie: ukończone pobieranie znika z listy po 5 sekundach. Jego pliki zostają na dysku, a nieudane pobierania pozostają na liście
- **Rozmiar i Brak w sekcji Pobieranie** — sortowalna kolumna **Rozmiar** pokazuje, ile miejsca zajmuje każde pobieranie, a **Brak** oznacza pliki przeniesione lub usunięte poza Arroxy
- **Aurora lub Minimalistyczny, ciemny lub jasny** — szklane panele na ruchomym niebie albo spokojne, jednolite powierzchnie; przełączasz je w stopce. Komputery bez akceleracji grafiki dostają Minimalistyczny automatycznie
- **Pasek menu Maca** — w macOS otwórz Ustawienia (`Cmd+,`), ustaw limit prędkości pobierania, przełącz styl i motyw oraz otwórz dzienniki lub zapisz plik diagnostyczny z paska menu
- **Zmiana profilu z poziomu dowolnego pobierania** — dostosuj pobieranie, a potem zaktualizuj profil, od którego się zaczęło (z podglądem zmian), lub zapisz ustawienia jako nowy profil. Przy przełączaniu profilu Arroxy zapyta, czy zachować Twoje zmiany

</details>

<details>
<summary><strong>📝 Napisy i obróbka końcowa</strong></summary>

- **Napisy** w SRT, VTT lub ASS — ręczne albo generowane automatycznie, w każdym dostępnym języku
- Zapisuj obok filmu, osadzaj w `.mkv` albo porządkuj w podfolderze `Subtitles/`
- **Partie tylko z napisami** — wklej listę adresów URL lub otwórz playlistę, wybierz Napisy i pobierz wyłącznie pliki napisów dla każdego filmu
- **SponsorBlock** — pomijaj sponsorów, intra, zakończenia i autopromocje albo oznaczaj je jako rozdziały
- **Osadzone metadane** — tytuł, data przesłania, kanał, opis, miniatura i znaczniki rozdziałów zapisane w pliku

</details>

<details>
<summary><strong>🌐 YouTube + 2000 serwisów</strong></summary>

- **Pełna obsługa YouTube** — filmy, Shorts, kanały, playlisty, YouTube Music i podcasty są źródłami pierwszej klasy
- **Ponad 2000 innych serwisów** dzięki yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable i wiele innych
- **Sam dźwięk i napisy** działają we wszystkich obsługiwanych serwisach, nie tylko w YouTube
- Gdy serwis się zmieni, yt-dlp co tydzień dostarcza poprawki, a Arroxy automatycznie aktualizuje plik wykonywalny przy starcie

</details>

---

## <a id="install"></a>📥 Instalacja i pierwsze uruchomienie

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

Dostępne są tylko kompilacje x86_64. Nie masz `curl`? Zamień `curl -fsSL` na `wget -qO-`.

| Platforma | Pobieranie bezpośrednie |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Wszystkie pliki wydania →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Pierwsze uruchomienie w Windows</strong></summary>

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

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Pierwsze uruchomienie w macOS</strong></summary>

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

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Dlaczego może pojawić się ostrzeżenie</strong></summary>

Arroxy ma otwarty kod i licencję MIT. Kompilacje Windows i macOS **nie są podpisane cyfrowo** — certyfikaty Apple Developer ID oraz Windows EV kosztują po kilkaset dolarów rocznie, co niezależny projekt musiałby opłacać sam. Bez tych podpisów Windows SmartScreen i macOS Gatekeeper ostrzegają przy pierwszym uruchomieniu. Ostrzeżenie oznacza, że *system nie rozpoznaje wydawcy*, a nie że Arroxy jest złośliwym oprogramowaniem.

Trzy sposoby samodzielnego sprawdzenia Arroxy, od najprostszego do najbardziej rygorystycznego:

- **Przeczytaj kod.** Każda linia jest na [GitHubie](https://github.com/antonio-orionus/Arroxy), a aplikację możesz [zbudować ze źródeł](#tech).
- **Sprawdź SHA256.** Porównaj plik z opublikowanym [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — zobacz niżej [Sprawdź pobrany plik](#verify).
- **Użyj zewnętrznego skanera.** Prześlij plik do [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Pierwsze uruchomienie w Linux</strong></summary>

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

**Pliki Linux na stronie wydania są dostępne wyłącznie dla x86_64.** Na urządzeniach ARM64 (Raspberry Pi, Asahi Linux) Flatpak zainstaluje się, lecz uruchomienie zakończy się błędem `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Sprawdź pobrany plik (SHA256)</strong></summary>

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
<summary><strong>📦 Windows: instalator a wersja przenośna</strong></summary>

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

## <a id="why"></a>⚖️ Dlaczego Arroxy

Porównanie z najpopularniejszymi alternatywami:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Wbudowana przeglądarka (przeglądanie, logowanie, pobieranie) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Filmy prywatne, tylko dla członków i z ograniczeniem wieku bez eksportowania plików cookie |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Bezpłatne, bez planu premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Otwarty kod źródłowy |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Wyłącznie lokalne przetwarzanie |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Bez limitów użycia |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Wieloplatformowa aplikacja komputerowa |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Napisy + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = częściowo lub tylko w płatnym planie. W 4K Video Downloader logowanie w aplikacji do prywatnych filmów to funkcja płatna; większość darmowych GUI dla yt-dlp przyjmuje tylko plik cookie albo odczytuje pliki cookie z Twojej przeglądarki internetowej.

Arroxy ma jedno zadanie: czysty plik lokalny, niezależnie od tego, czy wklejasz adres URL, czy znajdujesz film w Explore. Bez płatnych zachęt i zbierania danych.

### <a id="why-explore"></a>🧭 Czego nie potrafi zwykła nakładka na yt-dlp: karta Explore

Większość darmowych programów do pobierania z YouTube to pole na adres URL nałożone na yt-dlp. Arroxy też korzysta z yt-dlp, ale ma dodatkowo **Explore** — przeglądarkę wbudowaną w aplikację, która otwiera YouTube lub dowolną inną stronę. Explore omija ograniczenia, z którymi samo pole na URL sobie nie poradzi:

- **Filmy wymagające konta, bez eksportowania plików cookie** — filmy prywatne, tylko dla członków i z ograniczeniem wieku (na koncie ze zweryfikowanym wiekiem), listy Do obejrzenia i Polubione oraz filmy za logowaniem na innych stronach. Zwykła nakładka potrzebuje wyeksportowanego pliku cookies.txt albo musi odczytać pliki cookie z Twojej przeglądarki internetowej, co Chrome w Windows obecnie blokuje. W Arroxy logujesz się raz w Explore, a resztą zajmuje się aplikacja
- **„Zaloguj się, aby potwierdzić, że nie jesteś botem”** — gdy YouTube o to prosi, Arroxy ponawia pobieranie z Twoim logowaniem w Explore, zamiast kończyć je błędem
- **Token pobierania YouTube** — wbudowana przeglądarka Arroxy uzyskuje token, którego YouTube oczekuje przed pobraniem. Bez niego YouTube może udostępnić mniej formatów i niższą jakość, niż wybrano
- **Bez kopiowania linków** — znajdź film, playlistę lub kanał w Explore i pobierz go jednym kliknięciem albo kliknij prawym przyciskiem dowolny link na stronie
- **Blokowanie reklam, gdy tego chcesz** — jedno kliknięcie tarczy blokuje reklamy i trackery na stronach Explore

---

## <a id="privacy"></a>🔒 Prywatność

Pliki są pobierane przez [yt-dlp](https://github.com/yt-dlp/yt-dlp) bezpośrednio z YouTube do wybranego folderu — bez pośrednictwa serwera zewnętrznego. Historia oglądania i pobierania, adresy URL oraz zawartość plików pozostają na urządzeniu.

Bez telemetrii — tylko jeden anonimowy sygnał dziennie: wersja aplikacji, system, język, kanał instalacji i kraj, abyśmy mogli policzyć aktywnych użytkowników. Bez identyfikatorów, adresów URL, tytułów filmów, ścieżek plików i danych kont. Możesz go wyłączyć w Ustawieniach.

Explore ma własne logowania, oddzielone od Twojej przeglądarki, a Arroxy nigdy nie odczytuje ani nie wypełnia formularza logowania — wpisujesz dane na stronie danej witryny. Pobieranie odbywa się bez logowania; tylko gdy jedno kończy się błędem, który może naprawić konto, Arroxy odczytuje logowanie na nowo, przechowuje je w pliku tymczasowym na czas tego pobierania i potem go usuwa. Wylogowanie z Explore w Ustawieniach usuwa logowania.

---

## <a id="faq"></a>❓ Najczęstsze pytania

<details>
<summary><strong>Czy to naprawdę jest bezpłatne?</strong></summary>

Tak — licencja MIT, brak planu premium i blokowania funkcji.

</details>

<details>
<summary><strong>Czym Arroxy różni się od innych GUI dla yt-dlp?</strong></summary>

Większość darmowych GUI dla yt-dlp to nakładki, które przyjmują tylko link. Arroxy dodaje **Explore** — przeglądarkę wbudowaną w aplikację, która otwiera YouTube lub dowolną inną stronę: przeglądasz i pobierasz bez kopiowania linków, a logujesz się tam raz, by pobierać filmy prywatne, tylko dla członków i z ograniczeniem wieku oraz listy Do obejrzenia i Polubione, bez eksportowania plików cookie. Arroxy używa tego logowania, gdy YouTube prosi o potwierdzenie, że nie jesteś botem, a wbudowana przeglądarka uzyskuje token pobierania YouTube, dzięki czemu pobieranie nie ogranicza się do mniejszej liczby formatów. Zobacz [Dlaczego Arroxy](#why).

</details>

<details>
<summary><strong>Jakie jakości filmów mogę pobierać?</strong></summary>

Wszystko, co udostępnia YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p oraz sam dźwięk. Strumienie 60 kl./s i HDR są zachowywane bez zmian, a pobieranie krok po kroku pozwala wybrać AV1, VP9 lub H.264 w każdej rozdzielczości.

</details>

<details>
<summary><strong>Czy mogę wyodrębnić sam dźwięk jako MP3?</strong></summary>

Tak. W menu formatu wybierz *tylko dźwięk*, a następnie MP3, M4A/AAC, Opus lub WAV.

</details>

<details>
<summary><strong>Jak pobrać filmy, które wymagają konta YouTube?</strong></summary>

Zaloguj się raz na karcie Explore. Arroxy pobierze wtedy prywatne filmy i filmy tylko dla członków, które może oglądać Twoje konto, filmy z ograniczeniem wieku (jeśli wiek konta jest zweryfikowany) oraz listy Do obejrzenia i Polubione. Używa logowania tylko wtedy, gdy pobieranie kończy się błędem, który może naprawić konto; wszystko inne pobiera się jak dotąd. To opcja **Logowanie w Explore**, wymieniona jako pierwsza i oznaczona jako Zalecana w ustawieniach cookie, a Arroxy wybiera ją za Ciebie przy pierwszym otwarciu Explore. Wiki yt-dlp ostrzega, że [automatyzacja z zalogowanym kontem może spowodować oznaczenie konta Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), więc bezpieczniej użyć konta dodatkowego.

</details>

<details>
<summary><strong>Czy aplikacja będzie działać po zmianach w YouTube?</strong></summary>

yt-dlp aktualizuje się automatycznie przy uruchomieniu, a Arroxy szybko publikuje poprawki po zmianach w YouTube. Gdy YouTube prosi o potwierdzenie, że nie jesteś botem, Arroxy próbuje też użyć Twojego logowania w Explore, jeśli jest ono aktywne, a cookie z pliku lub z przeglądarki są dostępne w ustawieniach cookie.

</details>

<details>
<summary><strong>W jakich językach jest dostępne Arroxy?</strong></summary>

31 języków od razu po instalacji: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Przy pierwszym uruchomieniu Arroxy automatycznie wykrywa język systemu operacyjnego, a potem można go zmienić w dowolnym momencie za pomocą selektora na pasku narzędzi. Pliki JSON używane w aplikacji znajdują się w src/shared/i18n/locales/, a katalogi PO dla tłumaczy w i18n/locales/ — otwórz PR na GitHubie, aby pomóc.

</details>

<details>
<summary><strong>Czy muszę instalować coś jeszcze?</strong></summary>

Nie. yt-dlp, ffmpeg i ffprobe są pobierane automatycznie przy pierwszym uruchomieniu i zapisywane w pamięci podręcznej. Później nie potrzeba dodatkowej konfiguracji.

</details>

<details>
<summary><strong>Czy mogę pobierać playlisty lub całe kanały?</strong></summary>

Tak, jedno i drugie. Wklej adres playlisty lub kanału (np. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`), wybierz liczbę wpisów do sprawdzenia, a następnie dodaj całą listę do kolejki albo zaznacz konkretne filmy. Filtry zakresu dat pojawią się wkrótce.

</details>

<details>
<summary><strong>macOS twierdzi, że „aplikacja jest uszkodzona” — co zrobić?</strong></summary>

To Gatekeeper blokuje niepodpisaną aplikację, a nie faktyczne uszkodzenie. W sekcji [Pierwsze uruchomienie w macOS](#macos-first-launch) znajdziesz polecenia Terminala usuwające kwarantannę i uruchamiające Arroxy.

</details>

<details>
<summary><strong>Czy pobieranie filmów z YouTube jest legalne?</strong></summary>

W większości jurysdykcji jest ogólnie akceptowane do użytku osobistego i prywatnego. Odpowiadasz za przestrzeganie [Warunków korzystania](https://www.youtube.com/t/terms) z YouTube oraz lokalnego prawa autorskiego.

</details>

---

## <a id="roadmap"></a>🗺️ Plan rozwoju

Nadal planowane — mniej więcej w kolejności priorytetów:

| Funkcja    | Opis    |
| ---------------- | ---------------- |
| **Filtry playlist i kanałów** | Filtrowanie zakresu dat podczas odczytywania playlisty lub kanału |
| **Preferencje ścieżek dźwiękowych YouTube** | Globalna preferencja języka mówionego z wyjątkami w profilach, gdy YouTube oferuje wiele ścieżek |
| **Skuteczniejsze odzyskiwanie przez ponawianie** | Nowa ścieżka ponawiania pobrań przerwanych przez niestabilne lub problematyczne połączenie internetowe |
| **Pełny panel menedżera pobierania** | Rozbudowanie panelu kolejki o pełniejsze zarządzanie, w tym zmianę folderów docelowych zadań oczekujących |
| **Zaplanowane pobieranie** | Uruchamianie kolejki o ustawionej porze, na przykład w nocy |
| **Pakiet AUR** | Instalacja w Arch Linux i Omarchy przez `yay -S arroxy-bin` |

Masz pomysł na funkcję? [Otwórz propozycję](../../issues) — opinie społeczności kształtują priorytety.

---

## <a id="support"></a>💖 Wesprzyj Arroxy

Arroxy jest bezpłatne i ma licencję MIT — bez reklam, telemetrii i płatnego planu. Jeśli oszczędza Ci czas, możesz wesprzeć rozwój przez Bitcoin, Tron lub Ethereum; adresy znajdują się w [DONATE.md](DONATE.md), jedynym oficjalnym źródle. Arroxy nigdy nie wyśle adresu e-mailem ani prywatną wiadomością. Gwiazdka dla repozytorium, zgłaszanie błędów i ulepszanie tłumaczeń pomagają równie mocno.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Technologie

<details>
<summary><strong>Technologie</strong></summary>

- **Electron** — wieloplatformowa powłoka aplikacji komputerowej
- **React 19** + **TypeScript** — interfejs użytkownika
- **Tailwind CSS v4** — style
- **Zustand** — zarządzanie stanem
- **yt-dlp** + **ffmpeg** — silnik pobierania i multipleksowania (oba pobierane podczas działania: yt-dlp jest aktualizowane na bieżąco, a ffmpeg/ffprobe instalowane jednorazowo i zachowywane po aktualizacjach)
- **Vite** + **electron-vite** — narzędzia kompilacji
- **Vitest** + **Playwright** — testy jednostkowe i end-to-end

</details>

<details>
<summary><strong>Budowanie ze źródeł</strong></summary>

### Wymagania wstępne — wszystkie platformy

| Narzędzie | Wersja | Instalacja |
| --------- | ------ | ---------- |
| Git       | dowolna | [git-scm.com](https://git-scm.com) |
| Node.js   | 24.21.0 | `mise install` lub `.node-version` |
| Bun       | 1.4.2  | `mise install` lub `package.json` `packageManager` |

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

Po sklonowaniu uruchom w repozytorium `mise trust && mise install`. Jeśli powłoka używa już `fnm`, `nvm` lub Bun z Homebrew, aktywuj mise w `~/.zshrc`, aby Arroxy korzystało z Node.js 24.21.0 i Bun 1.4.2:

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

> `bun run bootstrap` instaluje zależności, przebudowuje zależności aplikacji Electron, sprawdza Electron, przygotowuje wbudowane ffmpeg/ffprobe do pracy programistycznej i instaluje Playwright Chromium. Wydania produkcyjne zarządzają yt-dlp, ffmpeg i ffprobe podczas działania w folderze danych aplikacji; żadne z nich nie jest dołączone do instalatora.

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

## 📜 Warunki użytkowania

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
