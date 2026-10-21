<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Maskot Arroxy" width="180" />

# Arroxy — bezplatný open-source stahovač z YouTube (+ 2000 webů) s vestavěným prohlížečem pro Windows, macOS a Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Číst v jazyce:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · **Čeština** · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Vydání](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Sestavení](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Web](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licence](https://img.shields.io/badge/license-GPLv3-blue) ![Platformy](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Jazyky](https://img.shields.io/badge/i18n-50_languages-blue)

Stahujte videa, Shorts, hudbu, kanály, podcasty nebo zvukové stopy z **YouTube a více než 2000 podporovaných webů** — až do 8K HDR při 60 fps, jako MP3 / AAC / Opus, nebo jen tu část, kterou potřebujete. **Procházejte YouTube i jakýkoli jiný web přímo v Arroxy** na kartě Procházení a stáhněte video, playlist nebo kanál, na kterém právě jste; přihlaste se tam a stáhněte soukromá videa, videa pro členy a videa s věkovým omezením, která váš účet smí přehrát. Běží lokálně ve Windows, macOS a Linuxu. **Bez reklam, bez zbytečností, bez vnucování placených verzí.**

[**↓ Nainstalovat nejnovější verzi**](#install) &nbsp;·&nbsp; [**Web**](https://arroxy.com/) &nbsp;·&nbsp; [První spuštění ve Windows](#windows-first-launch) · [První spuštění v macOS](#macos-first-launch) · [První spuštění v Linuxu](#linux-first-launch)

[![Připojte se na Discord](https://img.shields.io/badge/P%C5%99ipojte%20se%20na%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Pokud vám Arroxy šetří čas, ⭐ pomůže ostatním ho najít.

</div>

> **Co je Arroxy?** Arroxy je bezplatné open-source grafické rozhraní pro počítač, které stahuje videa, zvuk, playlisty a titulky z YouTube a z více než 2000 dalších webů podporovaných nástrojem [yt-dlp](https://github.com/yt-dlp/yt-dlp). Funguje na platformách Windows 10/11, macOS 13+ (Intel + Apple Silicon) a Linux (AppImage, Flatpak, tar.gz). Licence GPLv3. Bez reklam a bez limitů používání. Distribuuje se přes [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage a přímé stažení.
>
> **Hlavní rozdíl: vestavěný prohlížeč.** Většina bezplatných stahovačů z YouTube jsou tenké obaly na yt-dlp: políčko pro URL a nabídka formátů, bez vlastního prohlížeče. Arroxy ho má, a to **kartu Procházení**. Procházíte YouTube nebo jakýkoli jiný web přímo v aplikaci a stahujete video, playlist nebo kanál, na kterém právě jste, nebo kliknete pravým tlačítkem na libovolný odkaz. V Procházení se jednou přihlásíte a Arroxy stáhne soukromá videa, videa pro členy a videa s věkovým omezením, která váš účet smí přehrát, plus vaše seznamy Podívat se později a Označeno „To se mi líbí“, bez exportu cookies. Přihlaste se tam i k dalším webům a jejich stahování pak toto přihlášení použije, když ho bude potřebovat. S tímto přihlášením to Arroxy zkusí znovu, když vás YouTube požádá o potvrzení, že nejste robot. Jeho vestavěný prohlížeč také získá token, který YouTube před stažením očekává, takže YouTube stahování neomezí na méně formátů. Obal s políčkem pro URL narazí na všechna tato omezení. Podrobnosti: [Proč Arroxy](#why-explore).
>
> _Poslední aktualizace: 2026-10-21._

> 🌐 Tento překlad vznikl za pomoci AI. [Anglické README](../../README.md) je nadřazeným zdrojem. Našli jste chybu? [Otevřete PR](../../../../pulls).

---

## Obsah

- [✨ Funkce](#features)
- [📥 Instalace a první spuštění](#install)
  - [První spuštění ve Windows](#windows-first-launch)
  - [První spuštění v macOS](#macos-first-launch)
  - [Proč se může zobrazit upozornění](#why-warning)
  - [První spuštění v Linuxu](#linux-first-launch)
  - [Ověření stažení (SHA256)](#verify)
- [⚖️ Proč Arroxy](#why)
- [🔒 Soukromí](#privacy)
- [❓ Časté dotazy](#faq)
- [🗺️ Plán vývoje](#roadmap)
- [💖 Podpořte Arroxy](#support)
- [🛠️ Vytvořeno pomocí](#tech)

---

## <a id="features"></a>✨ Funkce

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/cs/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Procházení</b><br/>Procházejte YouTube i jakýkoli jiný web přímo v Arroxy a stáhněte stránku, na které jste, se svým aktivním profilem</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>První obrazovka Procházení</b><br/>Stručný pohled na Procházení a proč je vedlejší účet bezpečnější volbou přihlášení</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Stahování vám řekne, co vás potřebuje</b><br/>Odkazy se připravují na pozadí; neúspěšný nabídne řešení, dlouhý playlist čeká na vaši volbu</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/cs/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Stáhněte jen část videa</b><br/>Vyberte začátek a konec nebo kapitolu — Arroxy uloží jen tento úsek</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/cs/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR při 60 fps</b><br/>Každé rozlišení, kodek a stream HDR, které video nabízí, vedle sebe</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/cs/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editor profilu</b><br/>Doladěte profil: typ souboru, rozlišení, titulky, cíl, šablonu názvu souboru a další</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/cs/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Tmavý nebo světlý, sklo nebo plocha</b><br/>Čtyři vzhledy k výběru: skleněné panely nad pohyblivou oblohou nebo klidné plné plochy, každý v tmavé i světlé variantě</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Globální klávesová zkratka pro stahování v Arroxy — Ctrl+Shift+D ve Windows a Linuxu, Cmd+Shift+D v macOS, zařadí zkopírovaný odkaz přímo do fronty stahování" width="760" /></picture><br/><sub><b>Globální klávesová zkratka pro stahování</b><br/>Zkopírujte odkaz kdekoli, stiskněte jednou — skončí ve frontě a začne se stahovat</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/cs/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profily playlistu pro jednotlivé položky</b><br/>Dejte každému videu vlastní profil — některá archivujte ve 4K, zbytek stáhněte jako MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Domovská obrazovka Rychlého stahování</b><br/>Vložte URL a stáhněte ji okamžitě s aktivním profilem</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Opakovaně použitelné profily stahování</b><br/>Uložte předvolby formátu, kvality a výstupu — použijte je při každém stahování</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Zvukové stopy ve více jazycích</b><br/>Vyberte přesný jazyk zvuku, ve kterém video vychází</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Prostorový zvuk / Dolby</b><br/>Stopy 5.1 a Dolby jsou rozpoznány a zachovány</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Režim Hromadné URL</b><br/>Vložte seznam, duplicity se odstraní automaticky, všechny najednou zařaďte do fronty</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/cs/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Paralelní fronta stahování</b><br/>Několik stahování najednou s průběhem naživo</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Procházení: surfujte po webu přímo v Arroxy</strong></summary>

- **Karta Procházení** — procházejte YouTube i jakýkoli jiný web přímo v Arroxy a stahujte, co najdete, bez kopírování odkazů. **Stáhnout · *váš profil*** zařadí do fronty video, playlist nebo kanál, na který se díváte; šipka vedle přepíná profily a hůlka otevře stahování krok za krokem pro výběr formátů, titulků a dalšího
- **Stahování pravým tlačítkem** — klikněte pravým tlačítkem na libovolný odkaz na video, playlist nebo kanál v Procházení a stáhněte jej se svým profilem, vyberte jiný profil v nabídce **Stáhnout s profilem**, otevřete stahování krok za krokem nebo odkaz zkopírujte. Nemusíte nejdřív otevírat každé video
- **Kompaktní rozložení** — jedno kliknutí na panelu nástrojů Procházení přesune karty Arroxy do něj a dá stránce více místa
- **Adresní řádek** — zadáním textu hledejte na YouTube, nebo zadejte libovolnou webovou adresu a otevřete daný web
- **Stahování, která vyžadují účet** — jednou se přihlaste v Procházení a Arroxy může stahovat soukromá videa a videa pro členy, která váš účet smí přehrát, videa s věkovým omezením, pokud má účet ověřený věk, a vaše seznamy Podívat se později a Označeno „To se mi líbí“. Přihlaste se tam i k dalším webům a jejich stahování pak toto přihlášení použije, když ho bude potřebovat. Arroxy stále nejdřív stahuje nepřihlášené a vaše přihlášení z Procházení použije, jen když stahování selže způsobem, který účet vyřeší. Když vás YouTube požádá o potvrzení, že nejste robot, Arroxy zkusí také vaše přihlášení z Procházení
- **Použijte vedlejší účet** — první obrazovka Procházení vysvětluje proč: stahování s účtem s sebou nese určité riziko, že bude účet omezen. Z Procházení se můžete kdykoli odhlásit v Nastavení a zapomenout tak svá přihlášení
- **Blokování reklam** — ve výchozím stavu vypnuté. Jedno kliknutí na štít na panelu nástrojů Procházení zablokuje reklamy a sledovací prvky na jeho stránkách, aniž by to ovlivnilo stahování. YouTube může u přihlášených účtů blokovače reklam omezovat

</details>

<details>
<summary><strong>🎞️ Kvalita a formáty</strong></summary>

- Až **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Vysoká snímková frekvence a HDR** zachovány beze změny — 60 fps, HDR10
- **Zvuk** — exportujte samotný zvuk jako MP3, M4A/AAC, Opus nebo WAV. V interaktivním stahování vyberte, je-li k dispozici, nativní prostorové stopy / Dolby ze zdroje (AC-3, E-AC-3, 5.1, DRC), nebo nastavte globální výchozí volbu **Preferovat prostorový zvuk / Dolby**
- **Profily s cílem** — *Nejlepší obraz* (AV1 · VP9) nebo *Smart TV* (MP4 · H.264), uložené jako Auto, MP4, MKV nebo WebM bez překódování. HDR je *Auto* (jen když ho vaše obrazovka umí zobrazit), *SDR* nebo *HDR*
- **Každý kodek v každém rozlišení** — stahování krok za krokem uvádí AV1, VP9 a H.264 vedle sebe u každého rozlišení, takže si můžete vybrat ten, který přehraje vaše televize nebo editor
- **Poznáte, co stream skutečně je** — velikosti zvětšené YouTube pomocí AI, jazyky zvuku nadabované AI, streamy s vylepšeným datovým tokem, videa 360° a poškozené kopie nebo kopie s vodoznakem jsou označeny. Profily přeskakují streamy zvětšené pomocí AI, pokud je nepovolíte

</details>

<details>
<summary><strong>🛡️ Soukromí a kontrola</strong></summary>

- 100% lokální zpracování — stahování jde přímo z YouTube na váš disk
- **Otevřený zdrojový kód** — každý řádek lze zkontrolovat, licence GPLv3
- Soubory se ukládají přímo do složky, kterou zvolíte

</details>

<details>
<summary><strong>⚡ Pracovní postup</strong></summary>

- **Globální klávesová zkratka pro stahování** — zkopírujte odkaz v libovolné aplikaci a stiskněte `Ctrl+Shift+D` (`Cmd+Shift+D` v macOS); Arroxy jej zařadí do fronty s vaším aktivním profilem, aniž by se otevřelo okno, a potvrdí to oznámením. Ve výchozím stavu zapnuto, lze změnit
- **Pružné způsoby spuštění** — vyberte si vedené jednotlivé stahování, výběr z playlistu nebo kanálu, hromadné vložení URL, Rychlé stahování s uloženými výchozími hodnotami, nebo procházení a stahování z Procházení
- **Centrální fronta stahování** — každá jednotlivá, playlistová, hromadná nebo rychlá úloha skončí na jednom místě, kde můžete sledovat průběh, pozastavit, pokračovat, zrušit, zkusit znovu a řídit prioritu
- **Sledování schránky** — zkopírujte odkaz na video a po návratu do Arroxy se vyplní do pole URL, s možností **Vrátit zpět**, pokud jste to nechtěli. Když je Arroxy zaneprázdněné, odkaz počká, až se vrátíte na kartu URL (vypnete v Nastavení)
- **Automatické čištění URL** — odstraní sledovací parametry (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) a rozbalí odkazy `youtube.com/redirect`
- **Režim lišty** — zavření okna ponechá stahování běžet na pozadí
- **50 jazyků** — automaticky zjistí jazyk systému, kdykoli lze přepnout
- **Synchronizace playlistů** — znovu projděte playlist a porovnejte ho s lokální složkou, abyste přeskočili již stažená videa; vytvoří soubor playlistu `.m3u`, který se aktualizuje po stažení každého videa
- **Ovládání rychlosti a prodlev** — omezte šířku pásma, nastavte, kolik částí videa se stahuje najednou, a přidejte prodlevy mezi požadavky pomocí předvoleb (*Vypnuto · Vyvážené · Opatrné · Vlastní*)
- **Šablony názvů souborů** — pojmenujte stahování po svém pomocí `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` a `{playlist_index}`, globálně nebo pro každý profil stahování
- **Současná stahování a automatické opakování** — zvolte, kolik stahování z fronty běží současně, a nechte Arroxy zopakovat stahování, které narazilo na problém se sítí nebo serverem, s delším čekáním před každým pokusem
- **Profily playlistu pro jednotlivé položky** — přiřaďte každému videu v playlistu vlastní profil stahování místo jednoho nastavení pro celý seznam, takže jedním během některá videa archivujete v plné kvalitě a zbytek stáhnete jako MP3
- **Rychlé stahování funguje na pozadí** — odkaz se hned objeví ve Stahování a připravuje se tam, poznámka s tlačítkem **Zobrazit** to potvrdí a pole URL se vyčistí pro další odkaz. Spusťte, kolik chcete, zatímco se předchozí připravují
- **Stahování vám řekne, co vás potřebuje** — pokud Arroxy nemůže odkaz přečíst, jeho řádek řekne proč a nabídne řešení: Zkusit znovu, zapnout cookies nebo se přihlásit v Procházení. Při vypnutých cookies vám **Přihlásit se v Procházení** po přihlášení odkaz zkusí znovu. Playlist delší než váš limit načítání čeká na svém řádku, až vyberete všechna videa, prvních několik nebo přehled. Karta Stahování počítá řádky, které na vás čekají
- **Stáhněte jen část videa** — na obrazovce Formát vyberte začátek a konec nebo kapitolu a Arroxy uloží jen tento úsek, s rozsahem v názvu za ID videa. Střihy se zarovnají na nejbližší klíčový snímek; zapněte přesný střih, pokud chcete místo toho překódování
- **Odebírání dokončených stahování** — volitelné: dokončené stahování zmizí ze seznamu o 5 sekund později. Jeho soubory zůstanou na disku a neúspěšná stahování zůstanou v seznamu
- **Velikost a Chybí ve Stahování** — řaditelný sloupec **Velikost** ukazuje, kolik místa každé stahování zabírá, a **Chybí** označí soubory přesunuté nebo smazané mimo Arroxy
- **Aurora nebo Minimal, tmavý nebo světlý** — skleněné panely nad pohyblivou oblohou, nebo klidné plné plochy; přepínejte v zápatí. Počítače bez grafické akcelerace dostanou Minimal automaticky
- **Řádek nabídek v Macu** — v macOS otevřete Nastavení (`Cmd+,`), nastavte limit rychlosti stahování, přepněte styl a motiv a otevřete protokoly nebo uložte diagnostický soubor z řádku nabídek
- **Změna profilu z libovolného stahování** — upravte stahování a poté aktualizujte profil, ze kterého vzniklo (s náhledem změn), nebo uložte nastavení jako nový profil. Při přepnutí profilu se Arroxy zeptá, zda ponechat vaše úpravy

</details>

<details>
<summary><strong>📝 Titulky a následné zpracování</strong></summary>

- **Titulky** ve formátu SRT, VTT nebo ASS — ruční nebo automaticky generované, v jakémkoli dostupném jazyce
- Uložte vedle videa, vložte do `.mkv` nebo uspořádejte do podsložky `Subtitles/`
- **Dávky pouze s titulky** — vložte seznam URL nebo otevřete playlist, vyberte Titulky a získejte jen soubory titulků ke každému videu
- **SponsorBlock** — přeskočte nebo označte kapitolami sponzory, úvody, závěry a vlastní propagaci
- **Vložená metadata** — název, datum nahrání, kanál, popis, miniatura a značky kapitol zapsané do souboru

</details>

<details>
<summary><strong>🌐 YouTube + 2000 webů</strong></summary>

- **YouTube v plném rozsahu** — Videa, Shorts, kanály, playlisty, YouTube Music a podcasty jsou plnohodnotné zdroje
- **Více než 2000 dalších webů** přes yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable a mnoho dalších
- **Pouze zvuk a titulky** fungují na všech podporovaných webech, nejen na YouTube
- Když se web změní, yt-dlp vydává opravy každý týden a Arroxy při spuštění binární soubor automaticky aktualizuje

</details>

---

## <a id="install"></a>📥 Instalace a první spuštění

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

Sestavení jsou pouze pro x86_64. Nemáte `curl`? Nahraďte `curl -fsSL` příkazem `wget -qO-`.

| Platforma | Přímé stažení |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Všechny soubory vydání →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 První spuštění ve Windows</strong></summary>

Při prvním spuštění se může zobrazit **„Systém Windows ochránil váš počítač“** nebo **„Neznámý vydavatel“**. Týká se to souborů `Arroxy-win-x64-Setup.exe` i `Arroxy-win-x64-Portable.exe`. Arroxy je zdarma a s otevřeným zdrojovým kódem a sestavení pro Windows nejsou podepsána placeným certifikátem, proto je SmartScreen označuje. To **automaticky neznamená**, že Arroxy není bezpečné. Postup:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="Dialog SmartScreen „Systém Windows ochránil váš počítač“ se zvýrazněným odkazem „Další informace“" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="Dialog SmartScreen po rozbalení Dalších informací s tlačítkem „Přesto spustit“" />
</div>

1. Klikněte na **Další informace**.
2. Klikněte na **Přesto spustit**.

#### Pokud Microsoft Defender soubor označí nebo odstraní

Heuristika Defenderu někdy označí nepodepsané instalátory NSIS a přenosné verze Electronu jako podezřelé. Pokud Defender přesune `Arroxy-win-x64-Setup.exe` nebo `Arroxy-win-x64-Portable.exe` do karantény, obnovte jej v části **Zabezpečení Windows → Ochrana před viry a hrozbami → Historie ochrany** a poté přidejte spustitelný soubor Arroxy jako povolenou položku v části **Spravovat nastavení → Přidat nebo odebrat vyloučení**. Stejně jako u SmartScreen je příčinou chybějící podpis vydavatele, ne zjištěný malware.

> Arroxy stahujte jen z oficiální stránky GitHub Releases. Pokud jste soubor získali z jiného webu nebo vám ho někdo poslal, smažte ho a stáhněte si čerstvou kopii z oficiálního zdroje. Zdrojový kód je veřejný, takže jej můžete zkontrolovat nebo si Arroxy sami sestavit.

Dáváte přednost Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 První spuštění v macOS</strong></summary>

Sestavení Arroxy pro macOS jsou podepsána ad hoc, ale nejsou notarizována Applem, takže Gatekeeper při prvním spuštění zablokuje otevření hláškou *Aplikaci „Arroxy.app“ nelze otevřít — Apple nemohl ověřit, že „Arroxy.app“ neobsahuje malware*. To znamená, že macOS aplikaci nemůže ověřit u Applu, ne že by se soubory něco stalo. Instalace přes Homebrew se tomuto dialogu zcela vyhne. Pokud jste použili DMG, vyřeší to jeden příkaz v Terminálu:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Přetáhněte `Arroxy.app` z připojeného DMG do `/Applications`.
2. Otevřete Terminál a spusťte tyto dva příkazy:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

První příkaz odstraní atribut karantény, který macOS připojil při stažení souboru; druhý aplikaci spustí. `sudo` obvykle nepotřebujete, protože kopie v `/Applications` patří vám — přidejte jej jen při chybě oprávnění.

**Apple Silicon, nebo Intel:** na Macu řady M (M1 / M2 / M3 / M4) stáhněte DMG `arm64`. Na Macích Intel stáhněte DMG `x64`. Špatné sestavení stále funguje přes Rosettu, ale je znatelně pomalejší.

> Sestavení pro macOS vznikají v CI na runnerech Apple Silicon a Intel. Pokud narazíte na potíže, [otevřete hlášení](../../../../issues) — zpětná vazba od uživatelů macOS aktivně utváří testovací cyklus pro macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Proč se může zobrazit upozornění</strong></summary>

Arroxy má otevřený zdrojový kód a licenci GPLv3. Sestavení pro Windows a macOS **nejsou podepsána kódem** — certifikáty Apple Developer ID a Windows EV stojí každý stovky dolarů ročně, což nezávislý projekt platí z vlastní kapsy. Bez těchto podpisů vás Windows SmartScreen a macOS Gatekeeper při prvním spuštění varují. Upozornění znamenají, že *váš systém vydavatele nezná* — neznamenají, že je Arroxy malware.

Tři způsoby, jak si Arroxy sami ověřit, od nejméně po nejpřísnější:

- **Přečtěte si zdrojový kód.** Každý řádek je na [GitHubu](https://github.com/antonio-orionus/Arroxy) a můžete [sestavit aplikaci ze zdrojového kódu](#tech).
- **Zkontrolujte SHA256.** Porovnejte svůj soubor s publikovaným [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — viz [Ověření stažení](#verify) níže.
- **Spusťte kontrolu třetí stranou.** Nahrajte soubor na [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 První spuštění v Linuxu</strong></summary>

AppImage se spouští přímo — bez instalace. Stačí soubor označit jako spustitelný.

**Správce souborů:** klikněte pravým tlačítkem na `.AppImage` → **Vlastnosti** → **Oprávnění** → zapněte **Povolit spouštění souboru jako programu** a poté dvakrát klikněte.

**Terminál:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Pokud se spuštění stále nezdaří, spusťte jej bez připojení — není potřeba balíček FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Volitelná integrace do systému:** jednou nainstalujte [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) a každý AppImage, na který dvakrát kliknete, se automaticky zaregistruje do nabídky spouštěče — bez ručního souboru `.desktop`.

**Prostý tarball (bez FUSE, bez instalace):**

Sestavení `.tar.gz` je stejná aplikace bez obalu AppImage — rozbalte jej kamkoli a spusťte. Není potřeba instalátor ani balíček FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Soubory pro Linux na stránce vydání jsou pouze pro x86_64.** Na počítačích ARM64 (Raspberry Pi, Asahi Linux) se Flatpak sice nainstaluje, ale při spuštění selže s chybou `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Ověření stažení (SHA256)</strong></summary>

Každé vydání zveřejňuje vedle binárních souborů soubor `SHA256SUMS`. Chcete-li ověřit, že se vaše stažení při přenosu nepoškodilo ani nezměnilo, spočítejte lokálně otisk svého souboru a porovnejte jej s řádkem v `SHA256SUMS`. Otevřete stránku nejnovějšího vydání → **Assets** → stáhněte `SHA256SUMS`.

**Windows (PowerShell nebo Příkazový řádek):**

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

Chcete kontrolu malwaru třetí stranou? Nahrajte soubor na [VirusTotal](https://www.virustotal.com). Několik obecných heuristických upozornění od menších antivirových nástrojů je u nepodepsaných aplikací Electron normální; rozsáhlá zjištění od velkých nástrojů by byla skutečným důvodem k obavám.

</details>

<details>
<summary><strong>📦 Windows: instalátor, nebo přenosná verze</strong></summary>

|               | Instalátor NSIS | Přenosný `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Vyžaduje instalaci | Ano  | Ne — spustíte odkudkoli  |
| Automatické aktualizace | ✅ v aplikaci  | ❌ ruční stažení  |
| Rychlost spuštění | ✅ rychlejší  | ⚠️ pomalejší studený start  |
| Přidá se do nabídky Start |            ✅            |           ❌            |
| Snadné odinstalování |            ✅            | ❌ smažte soubor  |

**Doporučení:** použijte instalátor NSIS pro automatické aktualizace a rychlejší spuštění. Přenosný `.exe` použijte, pokud chcete variantu bez instalace a bez zápisů do registru.

</details>

---

## <a id="why"></a>⚖️ Proč Arroxy

Srovnání s nejběžnějšími alternativami:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Vestavěný prohlížeč (procházení, přihlášení, stahování) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Soukromá videa, videa pro členy a videa s věkovým omezením bez exportu cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Zdarma, bez prémiové verze |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Otevřený zdrojový kód |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Pouze lokální zpracování |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Bez omezení využití |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Multiplatformní desktopová aplikace |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Titulky + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = částečně, nebo jen v placené verzi. Přihlášení v aplikaci pro soukromá videa je u 4K Video Downloaderu placená funkce; většina bezplatných grafických rozhraní pro yt-dlp přijímá jen soubor cookies nebo čte cookies vašeho webového prohlížeče.

Arroxy je stvořeno pro jedno: čistý lokální soubor, ať vložíte URL, nebo najdete video v Procházení. Bez vnucování placených verzí, bez sběru dat.

### <a id="why-explore"></a>🧭 Co obyčejný obal yt-dlp neumí: karta Procházení

Většina bezplatných stahovačů z YouTube je jen políčko pro URL nad yt-dlp. Arroxy také používá yt-dlp, ale má navíc **Procházení**, prohlížeč zabudovaný v aplikaci, který otevře YouTube i jakýkoli jiný web. Procházení překoná omezení, na která políčko pro URL nestačí:

- **Videa, která vyžadují účet, bez exportu cookies** — soukromá videa, videa pro členy a videa s věkovým omezením (na účtu s ověřeným věkem), a také vaše seznamy Podívat se později a Označeno „To se mi líbí“ a videa za přihlášením na jiných webech. Běžný obal potřebuje export souboru cookies.txt nebo musí číst cookies vašeho webového prohlížeče, což Chrome ve Windows nyní blokuje. V Arroxy se jednou přihlásíte v Procházení a zbytek obstará aplikace
- **„Přihlaste se a potvrďte, že nejste robot“** — když se YouTube zeptá, Arroxy zkusí stahování znovu s vaším přihlášením z Procházení, místo aby selhalo
- **Stahovací token YouTube** — vestavěný prohlížeč Arroxy získá token, který YouTube před stažením očekává. Bez něj může YouTube nabídnout méně formátů a nižší kvalitu, než jste chtěli
- **Bez kopírování odkazů** — najděte video, playlist nebo kanál v Procházení a stáhněte je jedním kliknutím, nebo klikněte pravým tlačítkem na libovolný odkaz na stránce
- **Blokování reklam, když chcete** — jedno kliknutí na štít zablokuje reklamy a sledovací prvky na stránkách v Procházení

---

## <a id="privacy"></a>🔒 Soukromí

Stahování probíhá přímo přes [yt-dlp](https://github.com/yt-dlp/yt-dlp) z YouTube do složky, kterou zvolíte — nic nejde přes server třetí strany. Historie sledování, historie stahování, URL a obsah souborů zůstávají na vašem zařízení.

Žádná telemetrie — jen jeden anonymní signál denně: verze aplikace, operační systém, jazyk, kanál instalace, země a přibližná doba od instalace Arroxy, abychom mohli počítat aktivní a nové uživatele. Žádná ID, URL, názvy videí, cesty k souborům ani údaje o účtu. Můžete jej vypnout v Nastavení.

Procházení uchovává vlastní přihlášení, oddělená od vašeho prohlížeče, a Arroxy nikdy nečte ani nevyplňuje přihlašovací formulář — píšete přímo na stránku webu. Stahování běží nepřihlášené; teprve když některé selže způsobem, který účet vyřeší, Arroxy přihlášení načte znovu, uchová je v dočasném souboru pro dané stahování a soubor poté smaže. Odhlášením z Procházení v Nastavení se přihlášení zapomenou.

---

## <a id="faq"></a>❓ Časté dotazy

<details>
<summary><strong>Je to opravdu zdarma?</strong></summary>

Ano — licence GPLv3, bez prémiové verze, bez uzamčených funkcí.

</details>

<details>
<summary><strong>Čím se Arroxy liší od jiných grafických rozhraní pro yt-dlp?</strong></summary>

Většina bezplatných grafických rozhraní pro yt-dlp jsou obaly, které berou jen odkaz. Arroxy přidává **Procházení**, prohlížeč zabudovaný v aplikaci, který otevře YouTube i jakýkoli jiný web: procházíte a stahujete bez kopírování odkazů a jednou se tam přihlásíte, abyste mohli stahovat soukromá videa, videa pro členy a videa s věkovým omezením a také seznamy Podívat se později a Označeno „To se mi líbí“, bez exportu cookies. Arroxy toto přihlášení použije, když vás YouTube požádá o potvrzení, že nejste robot, a jeho vestavěný prohlížeč získá stahovací token YouTube, aby stahování nepřešlo na méně formátů. Viz [Proč Arroxy](#why).

</details>

<details>
<summary><strong>Jaké kvality videa mohu stáhnout?</strong></summary>

Cokoli, co YouTube nabízí: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, a také samotný zvuk. Streamy 60 fps a HDR se zachovají beze změny a stahování krok za krokem umožňuje vybrat AV1, VP9 nebo H.264 v každém rozlišení.

</details>

<details>
<summary><strong>Mohu extrahovat jen zvuk jako MP3?</strong></summary>

Ano. V nabídce formátu vyberte *pouze zvuk* a zvolte MP3, M4A/AAC, Opus nebo WAV.

</details>

<details>
<summary><strong>Jak stáhnu videa, která vyžadují účet YouTube?</strong></summary>

Jednou se přihlaste na kartě Procházení. Arroxy pak může stahovat soukromá videa a videa pro členy, která váš účet smí přehrát, videa s věkovým omezením, pokud má účet ověřený věk, a vaše seznamy Podívat se později a Označeno „To se mi líbí“. Přihlášení použije, jen když stahování selže způsobem, který účet vyřeší; vše ostatní se stahuje jako dřív. Jde o volbu **Přihlášení v Procházení**, která je v nastavení cookies uvedena první a označena jako Doporučeno, a Arroxy ji pro vás zvolí při prvním otevření Procházení. Wiki yt-dlp uvádí, že [automatizace s přihlášením může vést k označení účtu Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), takže bezpečnější volbou je vedlejší účet.

</details>

<details>
<summary><strong>Bude to fungovat, i když YouTube něco změní?</strong></summary>

yt-dlp se při spuštění aktualizuje automaticky a Arroxy rychle vydává opravy, když YouTube něco změní. Když vás YouTube požádá o potvrzení, že nejste robot, Arroxy zkusí také vaše přihlášení z Procházení, pokud jste se tam přihlásili, a v nastavení cookies jsou k dispozici cookies ze souboru nebo z vašeho prohlížeče.

</details>

<details>
<summary><strong>V jakých jazycích je Arroxy dostupné?</strong></summary>

50 jazyků hned po instalaci: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy při prvním spuštění automaticky zjistí jazyk vašeho operačního systému a kdykoli jej můžete přepnout ve výběru jazyka na panelu nástrojů. Soubory JSON s jazykovými verzemi pro běh aplikace jsou v src/shared/i18n/locales/ a katalogy PO pro překladatele v i18n/locales/ — přispět můžete otevřením PR na GitHubu.

</details>

<details>
<summary><strong>Musím instalovat ještě něco dalšího?</strong></summary>

Ne. yt-dlp, ffmpeg a ffprobe se při prvním spuštění stáhnou automaticky a uloží do mezipaměti ve vašem počítači. Poté už není potřeba žádné další nastavení.

</details>

<details>
<summary><strong>Mohu stahovat playlisty nebo celé kanály?</strong></summary>

Ano — obojí. Vložte URL playlistu nebo kanálu (např. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); zvolte, kolik položek se má projít, a poté zařaďte do fronty celý seznam nebo vyberte konkrétní videa. Filtry podle rozsahu dat připravujeme.

</details>

<details>
<summary><strong>macOS hlásí, že „aplikace je poškozená“ — co mám dělat?</strong></summary>

To macOS Gatekeeper blokuje nepodepsanou aplikaci, nejde o skutečné poškození. Příkazy pro Terminál, které odstraní karanténu a spustí Arroxy, najdete v části [První spuštění v macOS](#macos-first-launch).

</details>

<details>
<summary><strong>Je stahování videí z YouTube legální?</strong></summary>

Pro osobní, soukromé použití je to ve většině jurisdikcí obecně přijímáno. Za dodržování [Smluvních podmínek](https://www.youtube.com/t/terms) YouTube a místních autorských zákonů odpovídáte vy.

</details>

---

## <a id="roadmap"></a>🗺️ Plán vývoje

Stále plánováno — zhruba v pořadí podle priority:

| Funkce    | Popis    |
| ---------------- | ---------------- |
| **Filtry playlistů a kanálů** | Filtry podle rozsahu dat při výpisu playlistu nebo kanálu |
| **Předvolby zvukové stopy YouTube** | Nastavení preference jazyka mluvené stopy pro celou aplikaci, s přepsáním pro jednotlivé profily, když YouTube nabízí více zvukových stop |
| **Lepší obnova po opakování** | Nový postup opakování pro stahování přerušená nespolehlivým nebo problematickým připojením k internetu |
| **Plnohodnotný panel správce stahování** | Proměnit panel fronty v plnohodnotnějšího správce, včetně změny cílových složek u položek ve frontě |
| **Plánovaná stahování** | Spuštění fronty v zadaný čas (noční běhy) |
| **Balíček AUR** | Instalace na Arch Linux a Omarchy pomocí `yay -S arroxy-bin` |

Máte nápad na funkci? [Otevřete požadavek](../../../../issues) — názory komunity utvářejí prioritu.

---

## <a id="support"></a>💖 Podpořte Arroxy

Arroxy je zdarma a s licencí GPLv3 — bez reklam, bez telemetrie, bez placené verze. Pokud vám šetří čas, můžete vývoj podpořit Bitcoinem, Tronem nebo Ethereem: adresy jsou v [DONATE.md](../../DONATE.md), což je jediný oficiální zdroj. Arroxy vám adresu nikdy nepošle e-mailem ani přímou zprávou. Stejně tak pomáhá hvězdička u repozitáře, hlášení chyb a zlepšování překladů.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Vytvořeno pomocí

<details>
<summary><strong>Technologie</strong></summary>

- **Electron** — multiplatformní desktopový obal
- **React 19** + **TypeScript** — uživatelské rozhraní
- **Tailwind CSS v4** — stylování
- **Zustand** — správa stavu
- **yt-dlp** + **ffmpeg** — modul pro stahování a slučování (oba se stahují za běhu: yt-dlp se udržuje aktuální, ffmpeg/ffprobe se nainstalují jednou a zůstanou i po aktualizacích)
- **Vite** + **electron-vite** — nástroje pro sestavení
- **Vitest** + **Playwright** — jednotkové a end-to-end testy

</details>

<details>
<summary><strong>Sestavení ze zdrojového kódu</strong></summary>

### Předpoklady — všechny platformy

| Nástroj | Verze   | Instalace |
| ------- | ------- | --------- |
| Git     | libovolná | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` nebo `.node-version` |
| Bun     | 1.4.2  | `mise install` nebo `packageManager` v `package.json` |

Doporučeno: nainstalujte `mise` a v repozitáři spusťte `mise install`. Bez mise ručně aktivujte Node.js podle `.node-version` a Bun podle `package.json` ještě před `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Pro nativní sestavení mohou být potřeba Visual Studio Build Tools a Python.

### macOS

```bash
brew install mise
xcode-select --install
```

Po naklonování spusťte v repozitáři `mise trust && mise install`. Pokud váš shell už používá `fnm`, `nvm` nebo Bun z Homebrew, aktivujte mise v `~/.zshrc`, aby Arroxy dostalo Node.js 24.21.0 a Bun 1.4.2:

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

### Naklonování a spuštění

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Sestavení distribuovatelné verze

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` nainstaluje závislosti, znovu sestaví závislosti aplikace Electron, ověří Electron, připraví vestavěné ffmpeg/ffprobe pro vývoj a nainstaluje Playwright Chromium. Vydané sestavy spravují yt-dlp, ffmpeg a ffprobe za běhu ve složce s daty aplikace; žádný z nich není součástí instalátoru.

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

## 📜 Podmínky použití

Arroxy je nástroj určený výhradně k osobnímu, soukromému použití. Sami odpovídáte za to, že vaše stahování je v souladu se [Smluvními podmínkami](https://www.youtube.com/t/terms) YouTube a autorskými zákony vaší jurisdikce. Nepoužívejte Arroxy ke stahování, reprodukci ani šíření obsahu, k jehož použití nemáte právo. Vývojáři neodpovídají za žádné zneužití.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Vytvořeno s péčí uživatelem <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
