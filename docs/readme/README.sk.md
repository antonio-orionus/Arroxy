<div align="center">
  <img src="../../build/banners/sk-66d8d6323b.jpg" alt="Vložte odkaz alebo len prehliadajte web. Obrazovka URL a vstavaný prehliadač aplikácie Arroxy s prebiehajúcim sťahovaním." width="1200" />

# Arroxy

Arroxy – bezplatný nástroj na sťahovanie z YouTube (+ 2000 webov) s otvoreným zdrojovým kódom a vstavaným prehliadačom, pre Windows, macOS a Linux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Čítajte v jazyku:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · **Slovenčina** · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Vydanie](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Zostava](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Webová stránka](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licencia](https://img.shields.io/badge/license-GPLv3-blue) ![Platformy](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Jazyky](https://img.shields.io/badge/i18n-50_languages-blue)

Sťahujte videá, Shorts, kanály, podcasty alebo zvukové stopy z **YouTube a viac ako 2000 podporovaných webov** — až do 8K HDR pri 60 fps, ako MP3 / AAC / Opus, alebo iba tú časť, ktorú potrebujete. **Prehliadajte YouTube alebo akýkoľvek iný web priamo v aplikácii Arroxy** na karte Preskúmať a stiahnite video, zoznam skladieb alebo kanál, na ktorom práve ste; prihláste sa tam a sťahujte videá, ktoré váš účet už dokáže prehrať. Beží lokálne vo Windows, macOS a Linuxe. **Bez reklám, bez zbytočností, bez nátlaku na platenie.**

[**↓ Nainštalovať najnovšie vydanie**](#install) &nbsp;·&nbsp; [**Webová stránka**](https://arroxy.com/) &nbsp;·&nbsp; [Prvé spustenie vo Windows](#windows-first-launch) · [Prvé spustenie v macOS](#macos-first-launch) · [Prvé spustenie v Linuxe](#linux-first-launch)

[![Pripojte sa ku komunite na Discorde](https://img.shields.io/badge/Pripojte%20sa%20ku%20komunite%20na%20Discorde-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Ak vám Arroxy ušetrí čas, ⭐ pomôže ostatným, aby ho našli.

</div>

> **Čo je Arroxy?** Arroxy je bezplatné desktopové grafické rozhranie s otvoreným zdrojovým kódom, ktoré sťahuje videá, zvuk, zoznamy skladieb a titulky z YouTube a viac ako 2000 ďalších webov podporovaných nástrojom [yt-dlp](https://github.com/yt-dlp/yt-dlp). Beží na Windows 10/11, macOS 13+ (Intel + Apple Silicon) a Linuxe (AppImage, Flatpak, tar.gz). Licencia GPLv3. Bez reklám, bez limitov používania. Distribuuje sa cez [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage a priame stiahnutie.
>
> **Kľúčový rozdiel: vstavaný prehliadač.** Väčšina bezplatných nástrojov na sťahovanie z YouTube sú tenké obaly nad yt-dlp: pole na adresu URL a ponuka formátov, bez vlastného prehliadača. Arroxy ho má, je to **karta Preskúmať**. YouTube alebo akýkoľvek iný web prehliadate priamo v aplikácii a stiahnete video, zoznam skladieb alebo kanál, na ktorom sa nachádzate, alebo kliknete pravým tlačidlom na ľubovoľný odkaz. Ak sa raz prihlásite v Preskúmať, sťahovania, ktoré vyžadujú účet, použijú toto prihlásenie: vaše súkromné videá, vaše zoznamy Pozrieť neskôr a Páči sa mi a ďalšie videá, ktoré váš účet už dokáže prehrať, bez exportu súborov cookie. Prihlásiť sa tam môžete aj na iných weboch a ich sťahovania použijú toto prihlásenie, keď ho potrebujú. Podrobnosti: [Prečo Arroxy](#why-explore).
>
> _Posledná aktualizácia: 2026-10-24._

> 🌐 Tento preklad vznikol s podporou AI. [Anglické README](../../README.md) je nadradeným zdrojom. Našli ste chybu? [Otvorte PR](../../../../pulls).

---

## Obsah

- [✨ Funkcie](#features)
- [📥 Inštalácia a prvé spustenie](#install)
  - [Prvé spustenie vo Windows](#windows-first-launch)
  - [Prvé spustenie v macOS](#macos-first-launch)
  - [Prečo sa môže zobraziť upozornenie](#why-warning)
  - [Prvé spustenie v Linuxe](#linux-first-launch)
  - [Overenie stiahnutého súboru (SHA256)](#verify)
- [⚖️ Prečo Arroxy](#why)
- [🔒 Súkromie](#privacy)
- [❓ Časté otázky](#faq)
- [🗺️ Plán vývoja](#roadmap)
- [💖 Podporte Arroxy](#support)
- [🛠️ Vytvorené pomocou](#tech)
- [📜 Podmienky používania](#terms)

---

## <a id="features"></a>✨ Funkcie

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sk/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Preskúmať</b><br/>Prehliadajte YouTube alebo akýkoľvek iný web priamo v Arroxy a stiahnite stránku, na ktorej ste, s aktívnym profilom</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Prvá obrazovka Preskúmať</b><br/>Stručný pohľad na Preskúmať a prečo je vedľajší účet bezpečnejším prihlásením</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Sťahovania vám povedia, čo od vás potrebujú</b><br/>Odkazy sa pripravujú na pozadí; zlyhaný ponúkne riešenie, dlhý zoznam skladieb čaká na váš výber</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sk/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Stiahnite iba časť videa</b><br/>Vyberte začiatok a koniec alebo kapitolu — Arroxy uloží iba tento rozsah</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sk/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR pri 60 fps</b><br/>Každé rozlíšenie, kodek a stream HDR, ktorý video ponúka, vedľa seba</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sk/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editor profilu</b><br/>Upravte profil: typ súboru, rozlíšenie, titulky, cieľ, šablónu názvu súboru a ďalšie</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sk/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Tmavý alebo svetlý, sklenený alebo plný</b><br/>Štyri vzhľady na výber: sklenené panely nad pohyblivou oblohou alebo pokojné plné plochy, každý v tmavom aj svetlom režime</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Globálna klávesová skratka na sťahovanie v Arroxy — Ctrl+Shift+D vo Windows a Linuxe, Cmd+Shift+D v macOS, ktorá pošle skopírovaný odkaz priamo do radu sťahovania" width="760" /></picture><br/><sub><b>Globálna klávesová skratka na sťahovanie</b><br/>Skopírujte odkaz kdekoľvek, raz stlačte — pristane v rade a začne sa sťahovať</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sk/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profily pre jednotlivé položky zoznamu skladieb</b><br/>Dajte každému videu vlastný profil — niektoré archivujte v 4K, ostatné uložte iba ako zvuk</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Domov Rýchleho sťahovania</b><br/>Vložte adresu URL a okamžite ju stiahnite s aktívnym profilom</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Opakovane použiteľné profily sťahovania</b><br/>Uložte predvoľby formátu, kvality a výstupu — použite ich pri každom sťahovaní</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Viacjazyčné zvukové stopy</b><br/>Vyberte presný jazyk zvuku, v ktorom video vychádza</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Priestorový zvuk / Dolby</b><br/>Stopy 5.1 a Dolby sa rozpoznajú a zachovajú</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Režim hromadných adries URL</b><br/>Vložte zoznam, duplikáty sa automaticky odstránia, všetko sa zaradí do radu naraz</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sk/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Paralelný rad sťahovania</b><br/>Niekoľko sťahovaní naraz so živým priebehom</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Preskúmať: prehliadajte web priamo v Arroxy</strong></summary>

- **Karta Preskúmať** — prehliadajte YouTube alebo akýkoľvek iný web priamo v Arroxy a stiahnite, čo nájdete, bez kopírovania odkazov. **Stiahnuť · *váš profil*** zaradí do radu video, zoznam skladieb alebo kanál, ktorý práve sledujete; šípka vedľa neho prepína profily a čarovná palička otvorí sťahovanie krok za krokom na výber formátov, titulkov a ďalšieho
- **Sťahovanie pravým kliknutím** — kliknite pravým tlačidlom na ľubovoľný odkaz na video, zoznam skladieb alebo kanál v Preskúmať a stiahnite ho so svojím profilom, vyberte iný profil v ponuke **Stiahnuť s profilom**, otvorte sťahovanie krok za krokom alebo odkaz skopírujte. Netreba najprv otvárať každé video
- **Kompaktné rozloženie** — jedno kliknutie na paneli nástrojov Preskúmať presunie karty Arroxy do neho a poskytne stránke viac miesta
- **Panel s adresou** — píšte a vyhľadávajte na YouTube, alebo zadajte ľubovoľnú webovú adresu a otvorte daný web
- **Sťahovania, ktoré vyžadujú účet** — raz sa prihláste v Preskúmať a Arroxy dokáže stiahnuť videá, ktoré váš účet dokáže prehrať: súkromné videá, videá s vekovým obmedzením, ak je vek účtu overený, a vaše zoznamy Pozrieť neskôr a Páči sa mi. Prihlásiť sa môžete aj na iných weboch a ich sťahovania použijú toto prihlásenie, keď ho potrebujú. Arroxy stále sťahuje najprv bez prihlásenia a prihlásenie z Preskúmať použije, iba keď sťahovanie zlyhá spôsobom, ktorý účet dokáže vyriešiť
- **Použite vedľajší účet** — prvá obrazovka Preskúmať vysvetľuje prečo: sťahovanie s účtom nesie určité riziko, že bude účet obmedzený. Z Preskúmať sa môžete kedykoľvek odhlásiť v Nastaveniach, aby sa vaše prihlásenia zabudli
- **Blokovač reklám** — predvolene vypnutý. Jedno kliknutie na štít na paneli nástrojov Preskúmať zablokuje reklamy a sledovače na jeho stránkach bez vplyvu na sťahovania. YouTube môže robiť problémy blokovačom reklám pri prihlásených účtoch

</details>

<details>
<summary><strong>🎞️ Kvalita a formáty</strong></summary>

- Až **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Vysoká snímková frekvencia a HDR** zachované bez zmeny — 60 fps, HDR10
- **Zvuk** — exportujte iba zvuk ako MP3, M4A/AAC, Opus alebo WAV. Pri interaktívnom sťahovaní vyberte pôvodné stopy priestorového zvuku/Dolby (AC-3, E-AC-3, 5.1, DRC), ak sú dostupné, alebo nastavte globálnu predvoľbu **Uprednostniť priestorový zvuk / Dolby**
- **Profily s cieľom** — *Najlepší obraz* (AV1 · VP9) alebo *Smart TV* (MP4 · H.264), uložené ako Auto, MP4, MKV alebo WebM bez prekódovania. HDR je *Auto* (iba keď ho vaša obrazovka dokáže zobraziť), *SDR* alebo *HDR*
- **Každý kodek v každom rozlíšení** — sťahovanie krok za krokom uvádza AV1, VP9 a H.264 vedľa seba pri každom rozlíšení, takže si môžete vybrať ten, ktorý prehrá váš televízor alebo editor
- **Vedzte, čo stream skutočne je** — veľkosti zväčšené YouTube pomocou AI, jazyky zvuku nadabované pomocou AI, streamy so zvýšenou bitovou rýchlosťou, videá 360° a poškodené kópie či kópie s vodoznakom sú označené. Profily preskakujú streamy zväčšené pomocou AI, pokiaľ ich nepovolíte

</details>

<details>
<summary><strong>🛡️ Súkromie a kontrola</strong></summary>

- 100 % lokálne spracovanie — sťahovania idú priamo z YouTube na váš disk
- **Otvorený zdrojový kód** — každý riadok sa dá preveriť, licencia GPLv3
- Súbory sa ukladajú priamo do priečinka, ktorý si vyberiete

</details>

<details>
<summary><strong>⚡ Pracovný postup</strong></summary>

- **Globálna klávesová skratka na sťahovanie** — skopírujte odkaz v ľubovoľnej aplikácii a stlačte `Ctrl+Shift+D` (`Cmd+Shift+D` v macOS); Arroxy ho zaradí do radu s vaším aktívnym profilom bez otvorenia okna a oznámenie to potvrdí. Predvolene zapnutá, dá sa zmeniť
- **Flexibilné režimy spustenia** — vyberte si sprevádzané jednotlivé sťahovanie, výber zo zoznamu skladieb/kanála, hromadné vloženie adries URL, Rýchle sťahovanie s uloženými predvoľbami, alebo prehliadajte a sťahujte z Preskúmať
- **Centrálny rad sťahovania** — každá jednotlivá, hromadná alebo rýchla úloha, aj zo zoznamu skladieb, pristane na jednom mieste s priebehom, pozastavením, obnovením, zrušením, opakovaním a ovládaním priority
- **Sledovanie schránky** — skopírujte odkaz na video a po návrate do Arroxy sa vyplní pole adresy URL s možnosťou **Vrátiť späť**, ak to nebol váš úmysel. Kým je Arroxy zaneprázdnený, odkaz počká, kým sa nevrátite na kartu s adresou URL (vypnete to v Nastaveniach)
- **Automatické čistenie adries URL** — odstráni sledovacie parametre (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) a rozbalí odkazy `youtube.com/redirect`
- **Režim systémovej lišty** — zatvorenie okna ponechá sťahovania bežať na pozadí
- **50 jazykov** — automaticky rozpozná jazyk systému, kedykoľvek sa dá prepnúť
- **Synchronizácia zoznamu skladieb** — znova prehľadá zoznam skladieb oproti lokálnemu priečinku a preskočí už stiahnuté videá; vytvorí súbor zoznamu skladieb `.m3u`, ktorý sa aktualizuje po stiahnutí každého videa
- **Ovládanie rýchlosti a oneskorenia** — obmedzte šírku pásma sťahovania, nastavte, koľko častí videa sa sťahuje naraz, a pridajte oneskorenia požiadaviek pomocou predvolieb (*Vypnuté · Vyvážené · Opatrné · Vlastné*)
- **Šablóny názvov súborov** — pomenujte sťahovania po svojom pomocou `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` a `{playlist_index}`, globálne alebo pre každý profil sťahovania
- **Súčasné sťahovania a automatické opakovanie** — vyberte, koľko sťahovaní v rade beží naraz, a nechajte Arroxy zopakovať sťahovanie, ktoré narazilo na problém so sieťou alebo serverom, pričom pred každým pokusom čaká dlhšie
- **Profily pre jednotlivé položky zoznamu skladieb** — priraďte každému videu v zozname skladieb vlastný profil sťahovania namiesto jedného nastavenia pre celý zoznam, takže jedným prechodom môžete niektoré archivovať v plnej kvalite a ostatné uložiť iba ako zvuk
- **Rýchle sťahovanie funguje na pozadí** — odkaz sa hneď zobrazí v Sťahovaniach a pripravuje sa tam, poznámka s možnosťou **Zobraziť** to potvrdí a pole adresy URL sa vyčistí pre ďalší odkaz. Spustite ich, koľko chcete, kým sa predchádzajúce pripravujú
- **Sťahovania vám povedia, čo od vás potrebujú** — ak Arroxy nedokáže prečítať odkaz, jeho riadok povie prečo a ponúkne riešenie: Skúsiť znova, zapnúť súbory cookie alebo sa prihlásiť v Preskúmať. Pri vypnutých súboroch cookie možnosť **Prihlásiť sa cez Preskúmať** odkaz zopakuje za vás, keď sa prihlásite. Zoznam skladieb dlhší ako váš limit načítania čaká na svojom riadku, kým nevyberiete všetko, prvé položky alebo kontrolu. Karta Sťahovania počíta riadky, ktoré čakajú na vás
- **Stiahnite iba časť videa** — na obrazovke Formát vyberte začiatok a koniec alebo kapitolu a Arroxy uloží iba tento rozsah, pomenovaný rozsahom za ID videa. Strihy sa zarovnajú na najbližší kľúčový snímok; zapnite presný strih, ak chcete namiesto toho prekódovať
- **Odstraňovanie dokončených sťahovaní** — voliteľné: dokončené sťahovanie zmizne zo zoznamu o 5 sekúnd. Jeho súbory zostanú na disku a zlyhané sťahovania zostanú v zozname
- **Veľkosť a Chýba v Sťahovaniach** — zoraditeľný stĺpec **Veľkosť** ukazuje, koľko miesta každé sťahovanie zaberá, a **Chýba** označí súbory presunuté alebo odstránené mimo Arroxy
- **Aurora alebo Minimal, tmavý alebo svetlý** — sklenené panely nad pohyblivou oblohou, alebo pokojné plné plochy; prepínajte v pätičke. Počítače bez grafickej akcelerácie dostanú Minimal automaticky
- **Panel s ponukami v macOS** — v macOS otvorte Nastavenia (`Cmd+,`), nastavte limit rýchlosti sťahovania, prepnite štýl a motív a otvorte protokoly alebo uložte diagnostický súbor z panela s ponukami
- **Zmeňte profil z ľubovoľného sťahovania** — upravte sťahovanie a potom aktualizujte profil, z ktorého vzišlo (s ukážkou zmien), alebo uložte nastavenia ako nový profil. Pri prepnutí profilu sa Arroxy opýta, či ponechať vaše úpravy

</details>

<details>
<summary><strong>📝 Titulky a následné spracovanie</strong></summary>

- **Titulky** vo formáte SRT, VTT alebo ASS — ručné alebo automaticky generované, v ľubovoľnom dostupnom jazyku
- Uložte vedľa videa, vložte do `.mkv` alebo usporiadajte do podpriečinka `Subtitles/`
- **Dávky iba s titulkami** — vložte zoznam adries URL alebo otvorte zoznam skladieb, vyberte Titulky a získajte iba súbory titulkov pre každé video
- **SponsorBlock** — preskočte alebo označte kapitolami sponzorov, úvody, závery a vlastnú propagáciu
- **Vložené metadáta** — názov, dátum nahratia, kanál, popis, miniatúra a značky kapitol zapísané do súboru

</details>

<details>
<summary><strong>🌐 YouTube + 2000 webov</strong></summary>

- **YouTube v plnom rozsahu** — Videá, Shorts, Kanály, Zoznamy skladieb, YouTube Music a Podcasty sú plnohodnotné zdroje
- **Viac ako 2000 ďalších webov** cez yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable a mnoho ďalších
- **Iba zvuk a titulky** fungujú na každom podporovanom webe, nielen na YouTube
- Ak sa web zmení, yt-dlp vydáva opravy každý týždeň a Arroxy pri spustení automaticky aktualizuje binárny súbor

</details>

---

## <a id="install"></a>📥 Inštalácia a prvé spustenie

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
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --appimage
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

Zostavy sú iba pre x86_64. Nemáte `curl`? Nahraďte `curl -fsSL` príkazom `wget -qO-`.

| Platforma | Priame stiahnutie |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Všetky súbory vydania →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Prvé spustenie vo Windows</strong></summary>

Pri prvom spustení sa môže zobraziť **„Systém Windows ochránil váš počítač“** alebo **„Neznámy vydavateľ“**. Týka sa to súborov `Arroxy-win-x64-Setup.exe` aj `Arroxy-win-x64-Portable.exe`. Arroxy je bezplatný a s otvoreným zdrojovým kódom a zostavy pre Windows nie sú podpísané platným certifikátom na podpisovanie kódu, preto ich SmartScreen označuje. Neznamená to automaticky, že Arroxy nie je bezpečný. Postup:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="Dialóg SmartScreen „Systém Windows ochránil váš počítač“ so zvýrazneným odkazom „Ďalšie informácie“" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="Dialóg SmartScreen po rozbalení Ďalších informácií s tlačidlom „Aj tak spustiť“" />
</div>

1. Kliknite na **Ďalšie informácie**.
2. Kliknite na **Aj tak spustiť**.

#### Ak Windows Defender súbor označí alebo odstráni

Heuristika programu Defender niekedy označí nepodpísané inštalátory NSIS a prenosné aplikácie Electron ako podozrivé. Ak Defender dá `Arroxy-win-x64-Setup.exe` alebo `Arroxy-win-x64-Portable.exe` do karantény, obnovte ho cez **Zabezpečenie Windows → Ochrana pred vírusmi a hrozbami → História ochrany** a potom pridajte spustiteľný súbor Arroxy ako povolenú položku v časti **Spravovať nastavenia → Pridať alebo odstrániť vylúčenia**. Rovnako ako pri SmartScreen je príčinou chýbajúci podpis vydavateľa, nie zistený malvér.

> Arroxy sťahujte iba z oficiálnej stránky vydaní na GitHube. Ak ste súbor získali z iného webu alebo vám ho niekto poslal, odstráňte ho a stiahnite si čerstvú kópiu z oficiálneho zdroja. Zdrojový kód je verejný, takže ho môžete skontrolovať alebo si Arroxy zostaviť sami.

Uprednostňujete Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Prvé spustenie v macOS</strong></summary>

Zostavy Arroxy pre macOS sú podpísané ad-hoc, ale nie sú notarizované spoločnosťou Apple, takže Gatekeeper zablokuje prvé spustenie hlásením *„Arroxy.app“ sa nepodarilo otvoriť — Apple nemohol overiť, že „Arroxy.app“ neobsahuje malvér*. To znamená, že macOS nedokáže aplikáciu overiť u Apple, nie že so súbormi niečo nie je v poriadku. Inštalácia cez Homebrew sa tomuto dialógu úplne vyhne. Ak ste použili DMG, vyrieši to jeden príkaz v Termináli:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Presuňte `Arroxy.app` z pripojeného obrazu DMG do `/Applications`.
2. Otvorte Terminál a spustite tieto dva príkazy:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Prvý príkaz odstráni atribút karantény, ktorý macOS pripojil pri stiahnutí súboru; druhý aplikáciu spustí. `sudo` zvyčajne nepotrebujete, pretože kópia v `/Applications` patrí vám — pridajte ho, iba ak sa zobrazí chyba oprávnení.

**Apple Silicon vs. Intel:** na Macu s procesorom radu M (M1 / M2 / M3 / M4) stiahnite DMG `arm64`. Na Macoch s procesorom Intel stiahnite DMG `x64`. Nesprávna zostava stále funguje cez Rosetta, ale citeľne pomalšie.

> Zostavy pre macOS vznikajú v CI na bežcoch Apple Silicon a Intel. Ak narazíte na problémy, [otvorte hlásenie](../../../../issues) — spätná väzba od používateľov macOS aktívne formuje testovací cyklus pre macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Prečo sa môže zobraziť upozornenie</strong></summary>

Arroxy má otvorený zdrojový kód a licenciu GPLv3. Zostavy pre Windows a macOS **nie sú podpísané kódom** — certifikáty Apple Developer ID a Windows EV na podpisovanie kódu stoja každý stovky dolárov ročne, čo nezávislý projekt platí z vlastného vrecka. Bez týchto podpisov vás Windows SmartScreen a macOS Gatekeeper pri prvom spustení upozornia. Upozornenia znamenajú, že *váš operačný systém nepozná vydavateľa* — neznamenajú, že Arroxy je malvér.

Tri spôsoby, ako si Arroxy overiť sami, s rastúcou dôkladnosťou:

- **Prečítajte si zdrojový kód.** Každý riadok je na [GitHube](https://github.com/antonio-orionus/Arroxy) a môžete si ho [zostaviť zo zdrojového kódu](#tech).
- **Skontrolujte SHA256.** Porovnajte svoj súbor so zverejneným súborom [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — pozrite si nižšie [Overenie stiahnutého súboru](#verify).
- **Spustite kontrolu treťou stranou.** Nahrajte súbor na [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Prvé spustenie v Linuxe</strong></summary>

AppImage sa spúšťajú priamo — bez inštalácie. Stačí súbor označiť ako spustiteľný.

**Správca súborov:** kliknite pravým tlačidlom na `.AppImage` → **Vlastnosti** → **Oprávnenia** → zapnite **Povoliť spúšťanie súboru ako programu** a potom dvakrát kliknite.

**Terminál:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Ak sa spustenie stále nedarí, spustite ho bez pripojenia — balík FUSE nie je potrebný:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Voliteľná integrácia do pracovného prostredia:** raz nainštalujte [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) a každý AppImage, na ktorý dvakrát kliknete, sa automaticky zaregistruje do ponuky spúšťača — bez ručného súboru `.desktop`.

**Obyčajný archív tarball (bez FUSE, bez inštalácie):**

Zostava `.tar.gz` je tá istá aplikácia bez obalu AppImage — rozbaľte ju kdekoľvek a spustite. Nie je potrebný inštalátor ani balík FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Súbory pre Linux na stránke vydania sú iba pre x86_64.** Na strojoch ARM64 (Raspberry Pi, Asahi Linux) sa Flatpak stále nainštaluje, ale pri spustení zlyhá s chybou `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Overenie stiahnutého súboru (SHA256)</strong></summary>

Každé vydanie zverejňuje popri binárnych súboroch aj súbor `SHA256SUMS`. Ak chcete skontrolovať, že sa stiahnutý súbor počas prenosu nepoškodil ani nezmenil, vypočítajte jeho kontrolný súčet lokálne a porovnajte ho s riadkom v `SHA256SUMS`. Otvorte stránku najnovšieho vydania → **Assets** → stiahnite `SHA256SUMS`.

**Windows (PowerShell alebo Príkazový riadok):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminál):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminál):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Chcete kontrolu malvéru treťou stranou? Nahrajte súbor na [VirusTotal](https://www.virustotal.com). Niekoľko všeobecných heuristických označení od menších nástrojov je u nepodpísaných aplikácií Electron normálnych; rozšírené detekcie od veľkých nástrojov by boli skutočným dôvodom na obavy.

</details>

<details>
<summary><strong>📦 Windows: inštalátor vs. prenosná verzia</strong></summary>

|               | Inštalátor NSIS | Prenosný `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Vyžaduje sa inštalácia | Áno  | Nie — spustite odkiaľkoľvek  |
| Automatické aktualizácie | ✅ v aplikácii  | ❌ ručné stiahnutie  |
| Rýchlosť spustenia | ✅ rýchlejšie  | ⚠️ pomalší studený štart  |
| Pridá sa do ponuky Štart |            ✅            |           ❌            |
| Jednoduché odinštalovanie |            ✅            | ❌ odstráňte súbor  |

**Odporúčanie:** použite inštalátor NSIS kvôli automatickým aktualizáciám a rýchlejšiemu spusteniu. Prenosný `.exe` použite, ak nechcete inštaláciu ani zápisy do registra.

</details>

---

## <a id="why"></a>⚖️ Prečo Arroxy

Porovnanie s najbežnejšími alternatívami:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Vstavaný prehliadač (prehliadanie, prihlásenie, sťahovanie) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Videá, ktoré váš vlastný účet dokáže prehrať, bez exportu súborov cookie |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Zadarmo, bez platenej verzie |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Otvorený zdrojový kód |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Iba lokálne spracovanie |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Bez limitov používania |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Multiplatformová desktopová aplikácia |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Titulky + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = čiastočne alebo iba v platenej verzii. Prihlásenie v aplikácii 4K Video Downloader kvôli súkromným videám je platená funkcia; väčšina bezplatných grafických rozhraní pre yt-dlp prijíma iba súbor cookie alebo číta súbory cookie vášho webového prehliadača.

Arroxy je vytvorený na jedno: čistý lokálny súbor, či už vložíte adresu URL, alebo nájdete video v Preskúmať. Bez nátlaku na platenie, bez zbierania údajov.

### <a id="why-explore"></a>🧭 Čo obyčajný obal yt-dlp nedokáže: karta Preskúmať

Väčšina bezplatných nástrojov na sťahovanie z YouTube je len pole na adresu URL nad yt-dlp. Arroxy tiež používa yt-dlp, ale má aj **Preskúmať** — prehliadač zabudovaný v aplikácii, ktorý otvorí YouTube alebo akýkoľvek iný web. Preskúmať pridáva to, čo pole na adresu URL nezvládne:

- **Videá, ktoré váš účet dokáže prehrať, bez exportu súborov cookie** — vaše súkromné videá, zoznamy Pozrieť neskôr a Páči sa mi, videá s vekovým obmedzením na účte s overeným vekom a stránky na iných weboch, ktoré vyžadujú vaše prihlásenie. Obyčajný obal potrebuje export cookies.txt alebo číta súbory cookie vášho webového prehliadača. V Arroxy sa raz prihlásite v Preskúmať a zvyšok zariadi on
- **Bez kopírovania odkazov** — nájdite video, zoznam skladieb alebo kanál v Preskúmať a stiahnite ho jedným kliknutím, alebo kliknite pravým tlačidlom na ľubovoľný odkaz na stránke
- **Blokovač reklám, keď ho chcete** — jedno kliknutie na štít zablokuje reklamy a sledovače na stránkach v Preskúmať

---

## <a id="privacy"></a>🔒 Súkromie

Sťahovania sa preberajú priamo cez [yt-dlp](https://github.com/yt-dlp/yt-dlp) z YouTube do priečinka, ktorý vyberiete — nič nejde cez server tretej strany. História pozerania, história sťahovania, adresy URL a obsah súborov zostávajú na vašom zariadení.

**No tracking.** Arroxy sends only anonymous reports that help us count users and fix problems — never your links, videos, files or accounts. You control them in Settings.

Explore keeps its own sign-ins, separate from your browser, and you always sign in on the site's own page. A download uses a sign-in only for that site, reads it fresh and deletes its copy afterwards. Signing out of Explore in Settings forgets them.

---

## <a id="faq"></a>❓ Časté otázky

<details>
<summary><strong>Je to naozaj zadarmo?</strong></summary>

Áno — licencia GPLv3, bez platenej verzie, bez obmedzovania funkcií.

</details>

<details>
<summary><strong>Čím sa Arroxy líši od ostatných grafických rozhraní pre yt-dlp?</strong></summary>

Väčšina bezplatných grafických rozhraní pre yt-dlp sú obaly, ktoré prijímajú iba odkaz. Arroxy pridáva **Preskúmať**, prehliadač zabudovaný v aplikácii, ktorý otvorí YouTube alebo akýkoľvek iný web: prehliadate a sťahujete bez kopírovania odkazov a raz sa tam prihlásite, aby ste mohli sťahovať videá, ktoré váš účet dokáže prehrať, napríklad súkromné videá a zoznamy Pozrieť neskôr a Páči sa mi, bez exportu súborov cookie. Pozrite si [Prečo Arroxy](#why).

</details>

<details>
<summary><strong>Aké kvality videa môžem sťahovať?</strong></summary>

Čokoľvek, čo YouTube poskytuje: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, ako aj iba zvuk. Streamy 60 fps a HDR sa zachovajú bez zmeny a sťahovanie krok za krokom vám umožní vybrať AV1, VP9 alebo H.264 pri každom rozlíšení.

</details>

<details>
<summary><strong>Môžem extrahovať iba zvuk ako MP3?</strong></summary>

Áno. V ponuke formátov vyberte *iba zvuk* a zvoľte MP3, M4A/AAC, Opus alebo WAV.

</details>

<details>
<summary><strong>Ako stiahnem videá, ktoré vyžadujú účet YouTube?</strong></summary>

Raz sa prihláste na karte Preskúmať. Arroxy potom dokáže stiahnuť videá, ktoré váš účet dokáže prehrať: súkromné videá, videá s vekovým obmedzením, ak je vek účtu overený, a vaše zoznamy Pozrieť neskôr a Páči sa mi. Prihlásenie použije iba vtedy, keď sťahovanie zlyhá spôsobom, ktorý účet dokáže vyriešiť; všetko ostatné sa sťahuje ako predtým. Ide o voľbu **Prihlásenie z Preskúmať**, ktorá je v nastaveniach súborov cookie uvedená prvá a označená ako Odporúčané, a Arroxy ju vyberie za vás pri prvom otvorení Preskúmať. Wiki yt-dlp upozorňuje, že [automatizácia s prihlásením môže účet Google označiť](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), takže bezpečnejšou voľbou je vedľajší účet.

</details>

<details>
<summary><strong>Bude to naďalej fungovať, keď YouTube niečo zmení?</strong></summary>

yt-dlp sa pri spustení aktualizuje automaticky a Arroxy rýchlo vydáva opravy, keď YouTube niečo zmení. Keď sťahovanie vyžaduje prihlásenie, Arroxy použije vaše prihlásenie z Preskúmať, ak ste sa tam prihlásili, a súbory cookie zo súboru alebo z vášho prehliadača sú k dispozícii v nastaveniach súborov cookie.

</details>

<details>
<summary><strong>V akých jazykoch je Arroxy dostupný?</strong></summary>

50 jazykov hneď po inštalácii: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy pri prvom spustení automaticky rozpozná jazyk vášho operačného systému a môžete ho kedykoľvek prepnúť vo výbere jazyka na paneli nástrojov. Runtime JSON súbory jazykov sú v src/shared/i18n/locales/ a katalógy PO pre prekladateľov v i18n/locales/ — prispejte otvorením PR na GitHube.

</details>

<details>
<summary><strong>Musím nainštalovať ešte niečo?</strong></summary>

Nie. yt-dlp, ffmpeg a ffprobe sa pri prvom spustení automaticky stiahnu a uložia do vyrovnávacej pamäte na vašom počítači. Potom už nie je potrebné žiadne ďalšie nastavovanie.

</details>

<details>
<summary><strong>Môžem sťahovať zoznamy skladieb alebo celé kanály?</strong></summary>

Áno — oboje. Vložte adresu URL zoznamu skladieb alebo kanála (napr. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); vyberte, koľko položiek sa má prehľadať, a potom zaraďte do radu celý zoznam alebo vyberte konkrétne videá. Filtre podľa rozsahu dátumov budú čoskoro.

</details>

<details>
<summary><strong>macOS hovorí „aplikácia je poškodená“ — čo mám robiť?</strong></summary>

To macOS Gatekeeper blokuje nepodpísanú aplikáciu, nie skutočné poškodenie. Príkazy v Termináli, ktoré odstránia karanténu a spustia Arroxy, nájdete v časti [Prvé spustenie v macOS](#macos-first-launch).

</details>

<details>
<summary><strong>Je sťahovanie videí z YouTube legálne?</strong></summary>

Závisí to od vašej krajiny a od toho, čo sťahujete. Sťahujte iba obsah, ktorý vlastníte, obsah s licenciou na sťahovanie alebo obsah, ktorý zákon vo vašej krajine dovoľuje kopírovať. Zodpovedáte za dodržiavanie [Podmienok služby](https://www.youtube.com/t/terms) YouTube a miestnych autorských zákonov. Pozrite si [Podmienky používania](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ Plán vývoja

Stále plánované — približne podľa priority:

| Funkcia    | Popis    |
| ---------------- | ---------------- |
| **Filtre zoznamov skladieb a kanálov** | Filtre podľa rozsahu dátumov pri vypisovaní zoznamu skladieb alebo kanála |
| **Predvoľby zvukovej stopy YouTube** | Nastavenie predvoľby jazyka hovoreného slova pre celú aplikáciu s prepísaním pre jednotlivé profily, keď YouTube ponúka viac zvukových stôp |
| **Silnejšia obnova opakovaním** | Nová cesta opakovania pre sťahovania prerušené nespoľahlivým alebo problematickým pripojením na internet |
| **Plnohodnotný správca sťahovania** | Premena panela radu na plnohodnotnejšieho správcu vrátane zmeny cieľových priečinkov pre položky v rade |
| **Naplánované sťahovania** | Spustenie radu v stanovený čas (nočné behy) |
| **Balík AUR** | Inštalácia na Arch Linux a Omarchy pomocou `yay -S arroxy-bin` |

Máte na mysli funkciu? [Otvorte požiadavku](../../../../issues) — vstup komunity formuje prioritu.

---

## <a id="support"></a>💖 Podporte Arroxy

Arroxy je zadarmo a s licenciou GPLv3 — bez reklám, bez sledovania, bez platenej verzie. Ak vám ušetrí čas, môžete podporiť vývoj cez Bitcoin, Tron alebo Ethereum: adresy sú v [DONATE.md](../../DONATE.md), čo je jediný oficiálny zdroj. Arroxy vám nikdy nepošle adresu e-mailom ani priamou správou. Rovnako pomáha označenie repozitára hviezdičkou, hlásenie chýb a zlepšovanie prekladov.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Vytvorené pomocou

<details>
<summary><strong>Technologický stack</strong></summary>

- **Electron** — multiplatformový desktopový obal
- **React 19** + **TypeScript** — používateľské rozhranie
- **Tailwind CSS v4** — štýlovanie
- **Zustand** — správa stavu
- **yt-dlp** + **ffmpeg** — nástroj na sťahovanie a multiplexovanie (oba sa preberajú za behu: yt-dlp sa udržiava aktuálny, ffmpeg/ffprobe sa nainštalujú raz a zostávajú aj po aktualizáciách)
- **Vite** + **electron-vite** — nástroje na zostavenie
- **Vitest** + **Playwright** — jednotkové a end-to-end testy

</details>

<details>
<summary><strong>Zostavenie zo zdrojového kódu</strong></summary>

### Požiadavky — všetky platformy

| Nástroj | Verzia  | Inštalácia |
| ------- | ------- | ------- |
| Git     | ľubovoľná | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` alebo `.node-version` |
| Bun     | 1.4.2  | `mise install` alebo `package.json` `packageManager` |

Odporúčané: nainštalujte `mise` a v klonovanom repozitári spustite `mise install`. Bez nástroja mise ručne aktivujte Node.js z `.node-version` a Bun z `package.json` pred spustením `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Pre natívne prebudovanie môžu byť potrebné Visual Studio Build Tools a Python.

### macOS

```bash
brew install mise
xcode-select --install
```

Po klonovaní spustite v repozitári `mise trust && mise install`. Ak váš shell už používa `fnm`, `nvm` alebo Bun z Homebrew, aktivujte mise v `~/.zshrc`, aby Arroxy dostal Node.js 24.21.0 a Bun 1.4.2:

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

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Klonovanie a spustenie

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Zostavenie distribučného balíka

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` nainštaluje závislosti, prebuduje závislosti aplikácie Electron, overí Electron, pripraví vstavané ffmpeg/ffprobe na vývoj a nainštaluje Playwright Chromium. Vydané zostavy spravujú yt-dlp, ffmpeg a ffprobe za behu vo vašom priečinku s údajmi aplikácie; žiadny z nich nie je súčasťou inštalátora.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/arroxy/main.log` |
| Linux    | `~/.config/arroxy/logs/main.log` |

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
| Windows  | `%APPDATA%\arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/arroxy/argv.json` |
| Linux    | `~/.config/arroxy/argv.json`                     |

On Flatpak, both `main.log` and `argv.json` live under
`~/.var/app/io.github.antonio_orionus.Arroxy/config/arroxy/`
(for example `logs/main.log`).

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

## <a id="terms"></a>📜 Podmienky používania

Arroxy je nástroj iba na osobné, súkromné použitie. Ste výhradne zodpovední za to, aby vaše sťahovania spĺňali [Podmienky služby](https://www.youtube.com/t/terms) YouTube a autorské zákony vašej jurisdikcie. Nepoužívajte Arroxy na sťahovanie, reprodukciu ani šírenie obsahu, na ktorý nemáte právo. Vývojári nezodpovedajú za žiadne zneužitie.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Vytvorené s láskou od <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
