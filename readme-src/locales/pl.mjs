const TECH_CONTENT = `<details>
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
| Node.js   | 24.16.0 | \`mise install\` lub \`.node-version\` |
| Bun       | 1.2.23  | \`mise install\` lub \`package.json\` \`packageManager\` |

Zalecane: zainstaluj \`mise\`, a następnie uruchom \`mise install\` w repozytorium. Bez mise ręcznie aktywuj Node.js zgodnie z \`.node-version\` oraz Bun zgodnie z \`package.json\`, zanim wykonasz \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Do przebudowania zależności natywnych mogą być potrzebne Visual Studio Build Tools i Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Po sklonowaniu uruchom w repozytorium \`mise trust && mise install\`. Jeśli powłoka używa już \`fnm\`, \`nvm\` lub Bun z Homebrew, aktywuj mise w \`~/.zshrc\`, aby Arroxy korzystało z Node.js 24.16.0 i Bun 1.2.23:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Zależności kompilacji i środowiska Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tylko testy E2E (Electron wymaga ekranu)
sudo apt install -y xvfb
\`\`\`

### Sklonuj i uruchom

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # zalecane; pomiń, jeśli ręcznie aktywowano przypięte wersje
bun run bootstrap
bun run doctor
bun run dev            # aplikacja Electron z rendererem Vite
\`\`\`

### Zbuduj pakiet do dystrybucji

\`\`\`bash
bun run build        # kontrola typów + kompilacja
bun run dist         # pakiet dla bieżącego systemu
bun run dist:win     # pakiety Windows na obsługiwanym hoście
\`\`\`

> \`bun run bootstrap\` instaluje zależności, przebudowuje zależności aplikacji Electron, sprawdza Electron, przygotowuje wbudowane ffmpeg/ffprobe do pracy programistycznej i instaluje Playwright Chromium. yt-dlp jest zarządzane podczas działania w folderze danych aplikacji; ffmpeg i ffprobe są dołączone do każdego wydania Arroxy.

</details>`;

export const pl = {
  icon_alt: "Maskotka Arroxy",
  title: "Arroxy — bezpłatny downloader YouTube (+ 2000 serwisów) o otwartym kodzie na Windows, macOS i Linux",
  read_in_label: "Przeczytaj w języku:",
  badge_release_alt: "Wydanie",
  badge_build_alt: "Kompilacja",
  badge_license_alt: "Licencja",
  badge_platforms_alt: "Platformy",
  badge_i18n_alt: "Języki",
  badge_website_alt: "Witryna",
  discord_badge_text: "Dołącz do społeczności Discord",
  discord_badge_encoded: "Do%C5%82%C4%85cz%20do%20spo%C5%82eczno%C5%9Bci%20Discord",
  hero_desc: "Pobieraj filmy, Shorts, muzykę, kanały, podcasty i ścieżki dźwiękowe z **YouTube oraz ponad 2000 obsługiwanych serwisów** — nawet w 4K HDR przy 60 kl./s albo jako MP3 / AAC / Opus. Działa lokalnie na Windows, macOS i Linux. **Bez reklam, zbędnych dodatków i płatnych zachęt.**",
  cta_latest: "↓ Zainstaluj najnowsze wydanie",
  cta_website: "Witryna",
  demo_alt: "Prezentacja Arroxy",
  star_cta: "Jeśli Arroxy oszczędza Ci czas, ⭐ pomoże innym je znaleźć.",
  ai_notice: "> 🌐 To tłumaczenie powstało przy wsparciu AI. [Angielski README](README.md) jest źródłem nadrzędnym. Znalazłeś błąd? [Otwórz PR](../../pulls).",
  toc_heading: "Spis treści",
  why_h2: "Dlaczego Arroxy",
  features_h2: "Funkcje",
  dl_h2: "Instalacja i pierwsze uruchomienie",
  privacy_h2: "Prywatność",
  faq_h2: "Najczęstsze pytania",
  roadmap_h2: "Plan rozwoju",
  tech_h2: "Technologie",
  why_intro: "Porównanie z najpopularniejszymi alternatywami:",
  why_r1: "Bezpłatne, bez planu premium",
  why_r2: "Otwarty kod źródłowy",
  why_r3: "Wyłącznie lokalne przetwarzanie",
  why_r4: "Bez logowania i eksportu plików cookie",
  why_r5: "Bez limitów użycia",
  why_r6: "Wieloplatformowa aplikacja komputerowa",
  why_r7: "Napisy + SponsorBlock",
  why_summary: "Arroxy ma jedno zadanie: wklejasz adres URL i otrzymujesz czysty plik lokalny. Bez kont, płatnych zachęt i zbierania danych.",
  feat_quality_h3: "Jakość i formaty",
  feat_quality_1: "Do **4K UHD (2160p)**, a także 1440p, 1080p, 720p, 480p i 360p",
  feat_quality_2: "**Wysoka liczba klatek** zachowana bez zmian — 60 kl./s, 120 kl./s, HDR",
  feat_quality_3: "**Dźwięk** — eksportuj sam dźwięk jako MP3, M4A/AAC, Opus lub WAV. Podczas pobierania interaktywnego możesz wybrać natywne ścieżki surround/Dolby źródła (AC-3, E-AC-3, 5.1, DRC), gdy są dostępne, albo ustawić globalne **Preferuj surround / Dolby**",
  feat_quality_4: "Szybkie ustawienia: *Najlepsza jakość* · *Zrównoważone* · *Mały plik*",
  feat_privacy_h3: "Prywatność i kontrola",
  feat_privacy_1: "Przetwarzanie w 100% lokalne — pliki trafiają prosto z YouTube na Twój dysk",
  feat_privacy_2: "**Otwarty kod źródłowy** — każdą linię można sprawdzić, licencja MIT",
  feat_privacy_3: "Pliki są zapisywane bezpośrednio w wybranym folderze",
  feat_workflow_h3: "Przepływ pracy",
  feat_workflow_12: "**Globalny skrót pobierania** — skopiuj link w dowolnej aplikacji i naciśnij `Ctrl+Shift+D` (`Cmd+Shift+D` na macOS); Arroxy doda go do kolejki z aktywnym profilem bez otwierania okna, a powiadomienie to potwierdzi. Domyślnie włączony, z możliwością zmiany",
  feat_workflow_1: "**Elastyczne tryby rozpoczęcia** — wybierz prowadzony pojedynczy plik, selektor playlisty/kanału, zbiorcze wklejanie adresów URL albo Szybkie pobieranie z zapisanymi ustawieniami",
  feat_workflow_2: "**Centralna kolejka pobierania** — zadania pojedyncze, playlisty, zbiorcze i szybkie trafiają w jedno miejsce, gdzie można śledzić postęp, wstrzymywać, wznawiać, anulować, ponawiać i ustalać priorytet",
  feat_workflow_3: "**Monitorowanie schowka** — skopiuj link YouTube, a po powrocie do aplikacji Arroxy automatycznie uzupełni adres URL (przełącznik w ustawieniach zaawansowanych)",
  feat_workflow_4: "**Automatyczne czyszczenie URL-i** — usuwa parametry śledzące (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) i rozpakowuje linki `youtube.com/redirect`",
  feat_workflow_5: "**Tryb zasobnika** — zamknięcie okna nie przerywa pobierania w tle",
  feat_workflow_6: "**{{LANG_COUNT}} języków** — automatyczne wykrywanie języka systemu i zmiana w dowolnym momencie",
  feat_workflow_7: "**Synchronizacja playlist** — ponownie skanuje playlistę względem lokalnego folderu, pomijając już pobrane filmy; tworzy plik playlisty `.m3u` aktualizowany po pobraniu każdego filmu",
  feat_workflow_8: "**Sterowanie szybkością i tempem** — ogranicz przepustowość, ustaw liczbę równocześnie pobieranych części filmu i dodaj opóźnienia żądań za pomocą ustawień (*Wyłączone · Zrównoważone · Ostrożne · Własne*)",
  feat_workflow_9: "**Szablony nazw plików** — nazywaj pliki po swojemu za pomocą `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` i `{playlist_index}`, globalnie lub osobno w profilach",
  feat_workflow_10: "**Równoczesne pobieranie i automatyczne ponawianie** — wybierz liczbę zadań wykonywanych jednocześnie i pozwól Arroxy ponawiać pobrania przerwane przez sieć lub serwer, z coraz dłuższym oczekiwaniem",
  feat_workflow_11: "**Profile osobne dla elementów playlisty** — przypisz każdemu filmowi własny profil zamiast jednego ustawienia dla całej listy, aby w jednym przebiegu archiwizować część w pełnej jakości, a resztę pobrać jako MP3",
  feat_post_h3: "Napisy i obróbka końcowa",
  feat_post_1: "**Napisy** w SRT, VTT lub ASS — ręczne albo generowane automatycznie, w każdym dostępnym języku",
  feat_post_2: "Zapisuj obok filmu, osadzaj w `.mkv` albo porządkuj w podfolderze `Subtitles/`",
  feat_post_3: "**SponsorBlock** — pomijaj sponsorów, intra, zakończenia i autopromocje albo oznaczaj je jako rozdziały",
  feat_post_4: "**Osadzone metadane** — tytuł, data przesłania, kanał, opis, miniatura i znaczniki rozdziałów zapisane w pliku",
  feat_sites_h3: "YouTube + 2000 serwisów",
  feat_sites_1: "**Pełna obsługa YouTube** — filmy, Shorts, kanały, playlisty, YouTube Music i podcasty są źródłami pierwszej klasy",
  feat_sites_2: "**Ponad 2000 innych serwisów** dzięki yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org i wiele innych",
  feat_sites_3: "**Sam dźwięk i napisy** działają we wszystkich obsługiwanych serwisach, nie tylko w YouTube",
  feat_sites_4: "Gdy serwis się zmieni, yt-dlp co tydzień dostarcza poprawki, a Arroxy automatycznie aktualizuje plik wykonywalny przy starcie",
  shot1_cap: "<b>Ekran Szybkiego pobierania</b><br/>Wklej URL i od razu pobierz go aktywnym profilem",
  shot2_cap: "<b>Profile pobierania wielokrotnego użytku</b><br/>Zapisz format, jakość i folder docelowy, a potem używaj ich ponownie",
  shot3_cap: "<b>Wielojęzyczne ścieżki dźwiękowe</b><br/>Wybierz dokładny język dźwięku dostępny w filmie",
  shot4_cap: "<b>Dźwięk surround / Dolby</b><br/>Ścieżki 5.1 i Dolby są wykrywane i zachowywane",
  shot5_cap: "<b>Tryb zbiorczych URL-i</b><br/>Wklej listę, automatycznie usuń duplikaty i dodaj wszystko do kolejki",
  shot6_cap: "<b>Równoległa kolejka pobierania</b><br/>Kilka pobrań naraz z postępem na żywo",
  hotkey_fig_alt: "Globalny skrót pobierania Arroxy — Ctrl+Shift+D w Windows i Linux oraz Cmd+Shift+D w macOS, wysyłający skopiowany link prosto do kolejki",
  hotkey_fig_cap: "<b>Globalny skrót pobierania</b><br/>Skopiuj link gdziekolwiek i naciśnij raz — trafi do kolejki i zacznie się pobierać",
  shot7_cap: "<b>Profile osobne dla elementów playlisty</b><br/>Nadaj każdemu filmowi własny profil — część archiwizuj w 4K, resztę pobieraj jako MP3",
  dl_platform_col: "Platforma",
  dl_format_col: "Pobieranie bezpośrednie",
  dl_oneline_note: "Skrypt dla systemu Linux sprawdza pobrany plik względem opublikowanego `SHA256SUMS` i dodaje Arroxy do menu aplikacji. Dostępne są tylko kompilacje x86_64. Nie masz `curl`? Zamień `curl -fsSL` na `wget -qO-`.",
  dl_win_scoop: "Wolisz Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_grab: "Wszystkie pliki wydania →",
  dl_win_h3: "Windows: instalator a wersja przenośna",
  dl_win_col_installer: "Instalator NSIS",
  dl_win_col_portable: "Przenośny `.exe`",
  dl_win_r1: "Wymaga instalacji",
  dl_win_r1_installer: "Tak",
  dl_win_r1_portable: "Nie — uruchom z dowolnego miejsca",
  dl_win_r2: "Automatyczne aktualizacje",
  dl_win_r2_installer: "✅ w aplikacji",
  dl_win_r2_portable: "❌ pobieranie ręczne",
  dl_win_r3: "Szybkość uruchamiania",
  dl_win_r3_installer: "✅ szybciej",
  dl_win_r3_portable: "⚠️ wolniejszy zimny start",
  dl_win_r4: "Dodaje do menu Start",
  dl_win_r5: "Łatwe odinstalowanie",
  dl_win_r5_portable: "❌ usuń plik",
  dl_win_rec: "**Zalecenie:** użyj instalatora NSIS, aby uzyskać automatyczne aktualizacje i szybszy start. Wersję przenośną `.exe` wybierz, jeśli nie chcesz instalacji ani wpisów w rejestrze.",
  dl_win_smartscreen_intro: "Przy pierwszym uruchomieniu możesz zobaczyć **„System Windows ochronił ten komputer”** albo **„Nieznany wydawca”**. Dotyczy to plików `Arroxy-win-x64-Setup.exe` i `Arroxy-win-x64-Portable.exe`. Arroxy jest bezpłatne i ma otwarty kod, ale kompilacje Windows nie są podpisane płatnym certyfikatem, dlatego SmartScreen je oznacza. **Nie** oznacza to automatycznie, że Arroxy jest niebezpieczne. Aby kontynuować:",
  dl_win_smartscreen_step1: "Kliknij **Więcej informacji**.",
  dl_win_smartscreen_step2: "Kliknij **Uruchom mimo to**.",
  dl_win_smartscreen_official: "Pobieraj Arroxy wyłącznie z oficjalnej strony wydań GitHub. Jeśli plik pochodzi z innej witryny albo został przesłany przez kogoś, usuń go i pobierz świeżą kopię z oficjalnego źródła. Kod jest publiczny, więc możesz go sprawdzić lub samodzielnie zbudować Arroxy.",
  dl_macos_note: "Kompilacje macOS powstają w CI na maszynach Apple Silicon i Intel. W razie problemów [otwórz zgłoszenie](../../issues) — opinie użytkowników macOS bezpośrednio kształtują cykl testów.",
  dl_linux_intro: "AppImage uruchamia się bezpośrednio, bez instalacji. Trzeba jedynie nadać plikowi prawo wykonywania.",
  dl_linux_m1_text: "**Menedżer plików:** kliknij `.AppImage` prawym przyciskiem → **Właściwości** → **Uprawnienia** → włącz **Zezwól na wykonywanie pliku jako programu**, a następnie kliknij dwukrotnie.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Jeśli uruchamianie nadal się nie powiedzie, uruchom bez montowania — pakiet FUSE nie jest potrzebny:",
  dl_linux_targz_h4: "Zwykłe archiwum tar (bez FUSE i instalacji):",
  dl_linux_targz_text: "Kompilacja `.tar.gz` to ta sama aplikacja bez opakowania AppImage — rozpakuj ją w dowolnym miejscu i uruchom. Instalator ani FUSE nie są potrzebne.",
  dl_linux_flatpak_prereq: "Ubuntu domyślnie oferuje Snap zamiast Flatpak, więc najpierw zainstaluj Flatpak i dodaj Flathub — pakiet pobierze stamtąd środowisko wykonawcze:",
  dl_linux_arch_note: "**Pliki Linux na stronie wydania są dostępne wyłącznie dla x86_64.** Na urządzeniach ARM64 (Raspberry Pi, Asahi Linux) Flatpak zainstaluje się, lecz uruchomienie zakończy się błędem `bwrap: execvp ldconfig: Exec format error`.",
  dl_linux_flatpak_intro: "**Flatpak (alternatywa w piaskownicy):** pobierz `Arroxy-linux-x64.flatpak` z tej samej strony wydania.",
  dl_warning_h3: "Dlaczego może pojawić się ostrzeżenie",
  dl_warning_p1: "Arroxy ma otwarty kod i licencję MIT. Kompilacje Windows i macOS **nie są podpisane cyfrowo** — certyfikaty Apple Developer ID oraz Windows EV kosztują po kilkaset dolarów rocznie, co niezależny projekt musiałby opłacać sam. Bez tych podpisów Windows SmartScreen i macOS Gatekeeper ostrzegają przy pierwszym uruchomieniu. Ostrzeżenie oznacza, że *system nie rozpoznaje wydawcy*, a nie że Arroxy jest złośliwym oprogramowaniem.",
  dl_warning_p2: "Trzy sposoby samodzielnego sprawdzenia Arroxy, od najprostszego do najbardziej rygorystycznego:\n\n- **Przeczytaj kod.** Każda linia jest na [GitHubie](https://github.com/antonio-orionus/Arroxy), a aplikację możesz [zbudować ze źródeł](#tech).\n- **Sprawdź SHA256.** Porównaj plik z opublikowanym [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — zobacz niżej [Sprawdź pobrany plik](#verify).\n- **Użyj zewnętrznego skanera.** Prześlij plik do [VirusTotal](https://www.virustotal.com).",
  dl_win_first_h3: "Pierwsze uruchomienie w Windows",
  shot_smartscreen_more_alt: "Okno SmartScreen „System Windows ochronił ten komputer” z wyróżnionym linkiem „Więcej informacji”",
  shot_smartscreen_run_alt: "Rozwinięte okno SmartScreen z przyciskiem „Uruchom mimo to”",
  dl_win_defender_h4: "Gdy Windows Defender oznaczy lub usunie plik",
  dl_win_defender_p: "Heurystyka Defendera czasem uznaje niepodpisane instalatory NSIS i przenośne aplikacje Electron za podejrzane. Jeśli Defender podda kwarantannie `Arroxy-win-x64-Setup.exe` lub `Arroxy-win-x64-Portable.exe`, przywróć go w **Zabezpieczenia Windows → Ochrona przed wirusami i zagrożeniami → Historia ochrony**, a następnie dodaj plik wykonywalny Arroxy jako dozwolony element w **Zarządzaj ustawieniami → Dodaj lub usuń wykluczenia**. Tak jak w SmartScreen, powodem jest brak podpisu wydawcy, nie wykryte złośliwe oprogramowanie.",
  dl_macos_first_h3: "Pierwsze uruchomienie w macOS",
  dl_macos_intro: "Kompilacje Arroxy dla macOS są podpisane ad hoc, ale nie zostały poświadczone przez Apple, dlatego Gatekeeper blokuje pierwszy start komunikatem *Nie otwarto „Arroxy.app” — Apple nie może sprawdzić, czy „Arroxy.app” nie zawiera złośliwego oprogramowania*. Oznacza to, że macOS nie może sprawdzić aplikacji w Apple, a nie że pliki są uszkodzone. Instalacja przez Homebrew całkowicie omija to okno. Po użyciu DMG wystarczy jedno polecenie w Terminalu:",
  dl_macos_sequoia_step1: "Przeciągnij `Arroxy.app` z zamontowanego DMG do `/Applications`.",
  dl_macos_sequoia_step2: "Otwórz Terminal i wykonaj te dwa polecenia:",
  dl_macos_damaged_p: "Pierwsze polecenie usuwa atrybut kwarantanny nadany pobranemu plikowi przez macOS, a drugie uruchamia aplikację. Zwykle `sudo` nie jest potrzebne, ponieważ kopia w `/Applications` należy do Ciebie — dodaj je tylko po błędzie uprawnień.",
  dl_macos_arch_note: "**Apple Silicon a Intel:** na Macu serii M (M1 / M2 / M3 / M4) pobierz DMG `arm64`. Na Macu z procesorem Intel pobierz DMG `x64`. Niewłaściwa kompilacja zadziała przez Rosettę, ale będzie zauważalnie wolniejsza.",
  dl_linux_first_h3: "Pierwsze uruchomienie w Linux",
  dl_linux_appimagelauncher: "**Opcjonalna integracja z pulpitem:** zainstaluj raz [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), a każda dwukrotnie kliknięta AppImage zostanie automatycznie dodana do menu aplikacji — bez ręcznego pliku `.desktop`.",
  dl_verify_h3: "Sprawdź pobrany plik (SHA256)",
  dl_verify_intro: "Każde wydanie publikuje plik `SHA256SUMS` obok programów. Aby sprawdzić, czy pobrany plik nie został uszkodzony ani zmieniony w drodze, oblicz jego skrót lokalnie i porównaj z odpowiednim wierszem w `SHA256SUMS`. Otwórz stronę najnowszego wydania → **Assets** → pobierz `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell lub Wiersz polecenia):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text: "Chcesz zewnętrznego skanowania pod kątem złośliwego oprogramowania? Prześlij plik do [VirusTotal](https://www.virustotal.com). Kilka ogólnych alertów heurystycznych z mniej znanych silników jest normalne dla niepodpisanych aplikacji Electron; liczne wykrycia przez główne silniki byłyby powodem do niepokoju.",
  privacy_p1: "Pliki są pobierane przez [yt-dlp](https://github.com/yt-dlp/yt-dlp) bezpośrednio z YouTube do wybranego folderu — bez pośrednictwa serwera zewnętrznego. Historia oglądania i pobierania, adresy URL oraz zawartość plików pozostają na urządzeniu.",
  privacy_p2: "Arroxy wysyła przez [OpenPanel](https://openpanel.dev) anonimową, zagregowaną telemetrię — tylko tyle, aby niezależny projekt mógł rozumieć błędy, awarie, opinie, systemy operacyjne i wersje aplikacji. Bez adresów URL, tytułów filmów, ścieżek plików, danych kont, odcisków urządzenia ani danych osobowych. Identyfikator instalacji jest losowy i niezwiązany z Twoją tożsamością. Możesz zrezygnować w Ustawieniach.",
  faq_q1: "Czy to naprawdę jest bezpłatne?",
  faq_a1: "Tak — licencja MIT, brak planu premium i blokowania funkcji.",
  faq_q2: "Jakie jakości filmów mogę pobierać?",
  faq_a2: "Wszystko, co udostępnia YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p oraz sam dźwięk. Strumienie 60 kl./s, 120 kl./s i HDR są zachowywane bez zmian.",
  faq_q3: "Czy mogę wyodrębnić sam dźwięk jako MP3?",
  faq_a3: "Tak. W menu formatu wybierz *tylko dźwięk*, a następnie MP3, M4A/AAC, Opus lub WAV.",
  faq_q4: "Czy potrzebuję konta YouTube lub plików cookie?",
  faq_a4: "Domyślnie nie — Arroxy działa bez konta YouTube, logowania i eksportowania plików cookie. Opcjonalną obsługę cookie można włączyć w ustawieniach zaawansowanych (źródło cookie: plik lub przeglądarka) dla treści wymagających uwierzytelnienia, takich jak filmy z ograniczeniem wieku lub tylko dla wspierających. Funkcja jest domyślnie wyłączona. Wiki yt-dlp ostrzega, że po jej włączeniu [automatyzacja korzystająca z cookie może spowodować oznaczenie konta Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); bezpieczniej użyć wtedy konta zapasowego.",
  faq_q5: "Czy aplikacja będzie działać po zmianach w YouTube?",
  faq_a5: "yt-dlp aktualizuje się automatycznie przy uruchomieniu, a Arroxy szybko publikuje poprawki po zmianach w YouTube. Jeśli mimo to wystąpi problem, opcjonalna obsługa cookie jest dostępna w ustawieniach zaawansowanych jako rozwiązanie awaryjne.",
  faq_q6: "W jakich językach jest dostępne Arroxy?",
  faq_a6: "{{LANG_COUNT}} języków od razu po instalacji: {{LANG_NAME_LIST}}. Przy pierwszym uruchomieniu Arroxy automatycznie wykrywa język systemu operacyjnego, a potem można go zmienić w dowolnym momencie za pomocą selektora na pasku narzędzi. Pliki JSON używane w aplikacji znajdują się w src/shared/i18n/locales/, a katalogi PO dla tłumaczy w i18n/locales/ — otwórz PR na GitHubie, aby pomóc.",
  faq_q7: "Czy muszę instalować coś jeszcze?",
  faq_a7: "Nie. yt-dlp jest pobierane automatycznie przy pierwszym uruchomieniu i zapisywane w pamięci podręcznej, a ffmpeg i ffprobe są dołączone do aplikacji. Później nie potrzeba dodatkowej konfiguracji.",
  faq_q8: "Czy mogę pobierać playlisty lub całe kanały?",
  faq_a8: "Tak, jedno i drugie. Wklej adres playlisty lub kanału (np. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`), wybierz liczbę wpisów do sprawdzenia, a następnie dodaj całą listę do kolejki albo zaznacz konkretne filmy. Filtry zakresu dat pojawią się wkrótce.",
  faq_q9: "macOS twierdzi, że „aplikacja jest uszkodzona” — co zrobić?",
  faq_a9: "To Gatekeeper blokuje niepodpisaną aplikację, a nie faktyczne uszkodzenie. W sekcji [Pierwsze uruchomienie w macOS](#macos-first-launch) znajdziesz polecenia Terminala usuwające kwarantannę i uruchamiające Arroxy.",
  faq_q10: "Czy pobieranie filmów z YouTube jest legalne?",
  faq_a10: "W większości jurysdykcji jest ogólnie akceptowane do użytku osobistego i prywatnego. Odpowiadasz za przestrzeganie [Warunków korzystania](https://www.youtube.com/t/terms) z YouTube oraz lokalnego prawa autorskiego.",
  plan_intro: "Nadal planowane — mniej więcej w kolejności priorytetów:",
  plan_col1: "Funkcja",
  plan_col2: "Opis",
  plan_r1_name: "**Filtry playlist i kanałów**",
  plan_r1_desc: "Filtrowanie zakresu dat podczas odczytywania playlisty lub kanału",
  plan_r2_name: "**Preferencje ścieżek dźwiękowych YouTube**",
  plan_r2_desc: "Globalna preferencja języka mówionego z wyjątkami w profilach, gdy YouTube oferuje wiele ścieżek",
  plan_r6_name: "**Logowanie w przeglądarce aplikacji**",
  plan_r6_desc: "Otwieranie okien przeglądarki wewnątrz Arroxy, aby logować się i używać cookie witryn bez ręcznego eksportowania",
  plan_r8_name: "**Pobieranie filmu jednym kliknięciem**",
  plan_r8_desc: "Rozpoczęcie jednym kliknięciem pobierania wykrytego lub wklejonego URL-a przy użyciu aktywnego profilu",
  plan_r3_name: "**Skuteczniejsze odzyskiwanie przez ponawianie**",
  plan_r3_desc: "Nowa ścieżka ponawiania pobrań przerwanych przez niestabilne lub problematyczne połączenie internetowe",
  plan_r4_name: "**Pełny panel menedżera pobierania**",
  plan_r4_desc: "Rozbudowanie panelu kolejki o pełniejsze zarządzanie, w tym zmianę folderów docelowych zadań oczekujących",
  plan_r5_name: "**Zaplanowane pobieranie**",
  plan_r5_desc: "Uruchamianie kolejki o ustawionej porze, na przykład w nocy",
  plan_r7_name: "**Przycinanie klipów**",
  plan_r7_desc: "Pobieranie tylko fragmentu między czasem początkowym a końcowym",
  plan_cta: "Masz pomysł na funkcję? [Otwórz propozycję](../../issues) — opinie społeczności kształtują priorytety.",
  dl_win_format: "Instalator (NSIS) lub przenośny `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` lub `.flatpak` (piaskownica)",
  dl_pkg_h3: "Instalacja przez menedżera pakietów",
  dl_channel_col: "Kanał",
  dl_command_col: "Polecenie",
  dl_win_smartscreen_h4: "Ostrzeżenie Windows SmartScreen",
  dl_macos_h3: "Pierwsze uruchomienie w macOS",
  dl_macos_warning: "Arroxy nie jest jeszcze podpisane cyfrowo, dlatego macOS Gatekeeper może przy pierwszym uruchomieniu wyświetlić ostrzeżenie o uszkodzonej aplikacji. Jest to oczekiwane i nie oznacza rzeczywistego uszkodzenia pliku.",
  dl_macos_m1_h4: "Metoda w Terminalu:",
  dl_macos_step1: "Przeciągnij `Arroxy.app` z zamontowanego DMG do `/Applications`.",
  dl_macos_step2: "Otwórz Terminal i wykonaj `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Wykonaj `open /Applications/Arroxy.app`.",
  dl_macos_step4: "Jeśli aplikacja jest w innym miejscu, zastąp `/Applications/Arroxy.app` ścieżką instalacji.",
  dl_macos_step5: "Wpisz hasło Maca, jeśli poprosi o nie `sudo`.",
  dl_macos_after: "Po usunięciu kwarantanny Arroxy otwiera się normalnie.",
  dl_macos_m2_h4: "Metoda w Terminalu:",
  dl_linux_h3: "Pierwsze uruchomienie w Linux",
  dl_macos_sequoia_h4: "Poprawka w Terminalu dla bieżącego macOS",
  dl_macos_sequoia_intro: "Po skopiowaniu Arroxy do Aplikacji użyj Terminala:",
  dl_macos_sequoia_step3: "Wykonaj `open /Applications/Arroxy.app`, aby uruchomić Arroxy.",
  dl_macos_sequoia_step4: "Jeśli aplikacja jest w innym miejscu, zastąp `/Applications/Arroxy.app` ścieżką instalacji.",
  dl_macos_sonoma_h4: "Poprawka w Terminalu dla starszego macOS",
  dl_macos_sonoma_step1: "Przeciągnij `Arroxy.app` z zamontowanego DMG do `/Applications`.",
  dl_macos_sonoma_step2: "Otwórz Terminal i usuń kwarantannę z `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3: "Po usunięciu kwarantanny uruchom Arroxy z Terminala lub Findera.",
  dl_macos_damaged_h4: "Usunięcie kwarantanny Gatekeepera",
  dl_pm_intro: "Używasz już menedżera pakietów? Możesz pominąć pobieranie ręczne.",
  tech_content: TECH_CONTENT,
  support_h2: "Wesprzyj Arroxy",
  support_note: "Arroxy jest bezpłatne i ma licencję MIT — bez reklam i płatnego planu. Jeśli oszczędza Ci czas, możesz wesprzeć rozwój przez Bitcoin lub Tron; adresy znajdują się w [DONATE.md](DONATE.md), jedynym oficjalnym źródle. Arroxy nigdy nie wyśle adresu e-mailem ani prywatną wiadomością. Gwiazdka dla repozytorium, zgłaszanie błędów i ulepszanie tłumaczeń pomagają równie mocno.",
  tos_h2: "Warunki użytkowania",
  tos_note: "Arroxy jest narzędziem wyłącznie do użytku osobistego i prywatnego. Tylko Ty odpowiadasz za zgodność pobieranych materiałów z [Warunkami korzystania](https://www.youtube.com/t/terms) z YouTube oraz prawem autorskim obowiązującym w Twojej jurysdykcji. Nie używaj Arroxy do pobierania, powielania ani rozpowszechniania treści, do których nie masz praw. Twórcy nie odpowiadają za niewłaściwe użycie.",
  footer_credit: 'Licencja MIT · Stworzone z troską przez <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
