<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Mascota Arroxy" width="180" />

# Arroxy — descărcător gratuit și open-source pentru YouTube (+ 2000 de site-uri) cu browser încorporat, pentru Windows, macOS și Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Citiți în:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · **Română** · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Versiune](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Site web](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licență](https://img.shields.io/badge/license-GPLv3-blue) ![Platforme](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Limbi](https://img.shields.io/badge/i18n-50_languages-blue)

Descărcați videoclipuri, Shorts, muzică, canale, podcasturi sau piese audio de pe **YouTube și de pe peste 2000 de site-uri acceptate** — până la 8K HDR la 60 fps, ca MP3 / AAC / Opus sau doar porțiunea de care aveți nevoie. **Navigați pe YouTube sau pe orice alt site direct în Arroxy**, în fila Explorare, și descărcați videoclipul, lista de redare sau canalul pe care le vizitați; conectați-vă acolo pentru a descărca videoclipuri private, doar pentru membri și cu restricție de vârstă pe care contul dvs. le poate viziona. Rulează local pe Windows, macOS și Linux. **Fără reclame, fără balast, fără upsell-uri.**

[**↓ Instalați ultima versiune**](#install) &nbsp;·&nbsp; [**Site web**](https://arroxy.com/) &nbsp;·&nbsp; [Prima pornire în Windows](#windows-first-launch) · [Prima pornire în macOS](#macos-first-launch) · [Prima pornire în Linux](#linux-first-launch)

[![Alăturați-vă comunității Discord](https://img.shields.io/badge/Al%C4%83tura%C8%9Bi-v%C4%83%20comunit%C4%83%C8%9Bii%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Dacă Arroxy vă economisește timp, un ⭐ îi ajută pe alții să-l găsească.

</div>

> **Ce este Arroxy?** Arroxy este o interfață grafică desktop gratuită și open source care descarcă videoclipuri, audio, liste de redare și subtitrări de pe YouTube și de pe peste 2000 de alte site-uri compatibile cu [yt-dlp](https://github.com/yt-dlp/yt-dlp). Rulează pe Windows 10/11, macOS 13+ (Intel + Apple Silicon) și Linux (AppImage, Flatpak, tar.gz). Licență GPLv3. Fără reclame, fără limite de utilizare. Distribuit prin [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage și descărcare directă.
>
> **Diferența cheie: un browser încorporat.** Majoritatea descărcătoarelor gratuite pentru YouTube sunt simple învelișuri peste yt-dlp: o casetă de URL și un meniu de formate, fără browser propriu. Arroxy are unul, **fila Explorare**. Navigați pe YouTube sau pe orice alt site direct în aplicație și descărcați videoclipul, lista de redare sau canalul pe care vă aflați, ori faceți clic dreapta pe orice link. Vă conectați o singură dată în Explorare, iar Arroxy descarcă videoclipurile private, doar pentru membri și cu restricție de vârstă pe care contul dvs. le poate viziona, plus listele Vizionează mai târziu și Apreciate, fără export de cookie-uri. Conectați-vă acolo și la alte site-uri, iar descărcările lor folosesc acea conectare când au nevoie. Reîncearcă cu acea conectare când YouTube vă cere să confirmați că nu sunteți un robot. Browserul său încorporat obține și tokenul pe care YouTube îl așteaptă înainte de o descărcare, astfel încât YouTube nu reduce descărcarea la mai puține formate. Un înveliș cu simplă casetă de URL se lovește de toate aceste limite. Detalii: [De ce Arroxy](#why-explore).
>
> _Ultima actualizare: 2026-10-21._

> 🌐 Această traducere a fost realizată cu sprijinul IA. [README-ul în engleză](../../README.md) este sursa de referință. Ați găsit o greșeală? [Deschideți un PR](../../../../pulls).

---

## Cuprins

- [✨ Funcționalități](#features)
- [📥 Instalare și prima pornire](#install)
  - [Prima pornire în Windows](#windows-first-launch)
  - [Prima pornire în macOS](#macos-first-launch)
  - [De ce puteți vedea un avertisment](#why-warning)
  - [Prima pornire în Linux](#linux-first-launch)
  - [Verificați descărcarea (SHA256)](#verify)
- [⚖️ De ce Arroxy](#why)
- [🔒 Confidențialitate](#privacy)
- [❓ Întrebări frecvente](#faq)
- [🗺️ Foaie de parcurs](#roadmap)
- [💖 Susțineți Arroxy](#support)
- [🛠️ Construit cu](#tech)

---

## <a id="features"></a>✨ Funcționalități

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ro/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explorare</b><br/>Navigați pe YouTube sau pe orice alt site direct în Arroxy și descărcați pagina pe care o vizitați cu profilul activ</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Primul ecran din Explorare</b><br/>O privire rapidă asupra Explorării și motivul pentru care un cont secundar este o conectare mai sigură</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descărcări vă spune ce are nevoie de dvs.</b><br/>Linkurile se pregătesc în fundal; unul eșuat oferă remedierea, o listă de redare lungă așteaptă alegerea dvs.</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ro/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descărcați doar o parte dintr-un videoclip</b><br/>Alegeți un început și un sfârșit, sau un capitol — Arroxy salvează doar acel interval</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ro/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR la 60 fps</b><br/>Fiecare rezoluție, codec și flux HDR pe care le oferă un videoclip, unul lângă altul</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ro/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editorul de profil</b><br/>Reglați un profil: tipul de fișier, rezoluția, subtitrările, destinația, șablonul de nume de fișier și altele</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ro/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Întunecat sau luminos, sticlă sau plin</b><br/>Patru aspecte la alegere: panouri de sticlă peste un cer în mișcare sau suprafețe pline, discrete, fiecare în variantă întunecată și luminoasă</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Comanda rapidă globală de descărcare Arroxy — Ctrl+Shift+D în Windows și Linux, Cmd+Shift+D în macOS, trimițând linkul copiat direct în coada de descărcare" width="760" /></picture><br/><sub><b>Comandă rapidă globală de descărcare</b><br/>Copiați un link oriunde, apăsați o dată — ajunge în coadă și începe să se descarce</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ro/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profiluri pe element în listele de redare</b><br/>Dați fiecărui videoclip propriul profil — arhivați unele în 4K, luați restul ca MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Pagina Descărcare rapidă</b><br/>Lipiți un URL și descărcați-l instant cu profilul activ</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Profiluri de descărcare reutilizabile</b><br/>Salvați presetări de format, calitate și ieșire — reutilizați-le la fiecare descărcare</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Piese audio în mai multe limbi</b><br/>Alegeți exact limba audio în care vine un videoclip</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Audio surround / Dolby</b><br/>Piste 5.1 și Dolby detectate și păstrate</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Modul URL-uri în bloc</b><br/>Lipiți o listă, duplicatele se elimină automat, puneți-le pe toate în coadă deodată</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ro/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Coadă de descărcare paralelă</b><br/>Mai multe descărcări deodată, cu progres în timp real</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explorare: navigați pe web direct în Arroxy</strong></summary>

- **Fila Explorare** — navigați pe YouTube sau pe orice alt site direct în Arroxy și descărcați ce găsiți, fără copiat linkuri. **Descarcă · *profilul dvs.*** pune în coadă videoclipul, lista de redare sau canalul pe care le vizualizați; săgeata de lângă el schimbă profilurile, iar bagheta deschide descărcarea pas cu pas, pentru alegerea formatelor, a subtitrărilor și altele
- **Clic dreapta pentru descărcare** — faceți clic dreapta pe orice link de videoclip, listă de redare sau canal din Explorare pentru a-l descărca cu profilul dvs., pentru a alege alt profil din **Descarcă cu**, pentru a deschide descărcarea pas cu pas sau pentru a copia linkul. Nu trebuie să deschideți mai întâi fiecare videoclip
- **Aspect compact** — un clic în bara de instrumente din Explorare mută filele Arroxy în ea și dă paginii mai mult spațiu
- **Bara de adrese** — tastați pentru a căuta pe YouTube sau introduceți orice adresă web pentru a deschide acel site
- **Descărcări care necesită un cont** — conectați-vă o singură dată în Explorare, iar Arroxy poate descărca videoclipuri private și doar pentru membri pe care contul dvs. le poate viziona, videoclipuri cu restricție de vârstă dacă vârsta contului este verificată, plus listele Vizionează mai târziu și Apreciate. Conectați-vă acolo și la alte site-uri, iar descărcările lor folosesc acea conectare când au nevoie. Arroxy descarcă totuși mai întâi fără conectare și folosește conectarea din Explorare doar când o descărcare eșuează într-un mod pe care un cont îl poate remedia. Când YouTube vă cere să confirmați că nu sunteți un robot, Arroxy încearcă tot conectarea dvs. din Explorare
- **Folosiți un cont secundar** — primul ecran din Explorare explică de ce: descărcarea cu un cont implică un anumit risc ca acel cont să fie restricționat. Deconectați-vă din Explorare din Setări oricând doriți să uitați conectările
- **Blocant de reclame** — dezactivat implicit. Un clic pe scut în bara de instrumente din Explorare blochează reclamele și trackerele de pe paginile sale, fără să afecteze descărcările. YouTube poate opune rezistență blocantelor de reclame pentru conturile conectate

</details>

<details>
<summary><strong>🎞️ Calitate și formate</strong></summary>

- Până la **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Rată mare de cadre și HDR** păstrate ca atare — 60 fps, HDR10
- **Audio** — exportați doar audio ca MP3, M4A/AAC, Opus sau WAV. În descărcările interactive, alegeți piesele surround/Dolby native ale sursei (AC-3, E-AC-3, 5.1, DRC) când sunt disponibile sau setați o valoare globală implicită **Preferă surround / Dolby**
- **Profiluri cu un scop** — *Cea mai bună imagine* (AV1 · VP9) sau *Smart TV* (MP4 · H.264), salvate ca Auto, MP4, MKV sau WebM fără recodificare. HDR este *Auto* (doar când ecranul dvs. îl poate afișa), *SDR* sau *HDR*
- **Fiecare codec la fiecare rezoluție** — descărcarea pas cu pas listează AV1, VP9 și H.264 unul lângă altul la fiecare rezoluție, ca să-l alegeți pe cel redat de televizorul sau editorul dvs.
- **Aflați ce este de fapt un flux** — dimensiunile mărite de YouTube cu IA, limbile audio dublate cu IA, fluxurile cu bitrate îmbunătățit, videoclipurile 360° și copiile deteriorate sau cu filigran sunt marcate. Profilurile omit fluxurile mărite cu IA, cu excepția cazului în care le permiteți

</details>

<details>
<summary><strong>🛡️ Confidențialitate și control</strong></summary>

- Procesare 100% locală — descărcările merg direct de pe YouTube pe discul dvs.
- **Open source** — fiecare linie poate fi auditată, licență GPLv3
- Fișiere salvate direct în folderul pe care îl alegeți

</details>

<details>
<summary><strong>⚡ Flux de lucru</strong></summary>

- **Comandă rapidă globală de descărcare** — copiați un link în orice aplicație și apăsați `Ctrl+Shift+D` (`Cmd+Shift+D` în macOS); Arroxy îl pune în coadă cu profilul dvs. activ fără a deschide fereastra, iar o notificare confirmă. Activată implicit, poate fi reasociată
- **Moduri flexibile de pornire** — alegeți o descărcare unică ghidată, selectorul de liste de redare/canale, lipirea în bloc de URL-uri, Descărcarea rapidă cu valori implicite salvate sau navigați și descărcați din Explorare
- **Coadă centrală de descărcare** — fiecare lucrare unică, de listă de redare, în bloc sau rapidă ajunge într-un singur loc pentru progres, pauză, reluare, anulare, reîncercare și control al priorității
- **Urmărirea clipboardului** — copiați un link de videoclip și acesta completează câmpul URL când reveniți la Arroxy, cu **Anulează** dacă nu l-ați dorit. Cât timp Arroxy este ocupat, linkul așteaptă până reveniți la fila URL (dezactivați în Setări)
- **Curățare automată a URL-urilor** — elimină parametrii de urmărire (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) și despachetează linkurile `youtube.com/redirect`
- **Mod bară de sistem** — închiderea ferestrei menține descărcările în fundal
- **50 limbi** — detectează automat limba sistemului, se poate schimba oricând
- **Sincronizarea listelor de redare** — scanați din nou o listă de redare față de un folder local pentru a omite videoclipurile deja descărcate; generează un fișier de listă `.m3u` actualizat pe măsură ce fiecare videoclip se descarcă
- **Controale de viteză și ritm** — limitați lățimea de bandă, stabiliți câte părți ale unui videoclip se descarcă simultan și adăugați întârzieri între cereri cu presetări (*Dezactivat · Echilibrat · Precaut · Personalizat*)
- **Șabloane de nume de fișier** — denumiți descărcările cum doriți cu `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` și `{playlist_index}`, global sau pentru fiecare profil de descărcare
- **Descărcări simultane și reîncercare automată** — alegeți câte descărcări din coadă rulează în același timp și lăsați Arroxy să reîncerce o descărcare care a întâmpinat o problemă de rețea sau de server, așteptând mai mult înainte de fiecare încercare
- **Profiluri pe element în listele de redare** — atribuiți fiecărui videoclip dintr-o listă propriul profil de descărcare, în loc de o singură setare pentru întreaga listă, astfel încât într-o singură trecere să arhivați unele la calitate maximă și să le luați pe restul ca MP3
- **Descărcarea rapidă lucrează în fundal** — linkul apare imediat în Descărcări și se pregătește acolo, o notă cu **Vizualizare** confirmă, iar câmpul URL se golește pentru următorul link. Porniți câte doriți cât timp cele anterioare se pregătesc
- **Descărcări vă spune ce are nevoie de dvs.** — dacă Arroxy nu poate citi un link, rândul său spune de ce și oferă remedierea: Reîncercați, activați cookie-urile sau conectați-vă în Explorare. Cu cookie-urile dezactivate, **Conectați-vă cu Explorare** îl reîncearcă pentru dvs. după ce v-ați conectat. O listă de redare mai lungă decât limita de încărcare așteaptă pe rândul ei să alegeți toate videoclipurile, primele sau o examinare. Fila Descărcări numără rândurile care vă așteaptă
- **Descărcați doar o parte dintr-un videoclip** — alegeți un început și un sfârșit, sau un capitol, pe ecranul Format, iar Arroxy salvează doar acel interval, denumit cu intervalul după ID-ul videoclipului. Tăieturile ajung la cel mai apropiat cadru-cheie; activați tăierea exactă pentru a recodifica în schimb
- **Eliminarea descărcărilor finalizate** — opțional: o descărcare finalizată părăsește lista după 5 secunde. Fișierele rămân pe disc, iar descărcările eșuate rămân în listă
- **Dimensiune și Lipsă în Descărcări** — o coloană **Dimensiune** sortabilă arată cât spațiu ocupă fiecare descărcare, iar **Lipsă** semnalează fișierele mutate sau șterse în afara Arroxy
- **Aurora sau Minimal, întunecat sau luminos** — panouri de sticlă peste un cer în mișcare sau suprafețe pline, discrete; comutați din subsol. Computerele fără accelerare grafică primesc automat Minimal
- **Bara de meniu Mac** — în macOS, deschideți Setările (`Cmd+,`), setați limita de viteză la descărcare, schimbați stilul și tema și deschideți jurnalele sau salvați un fișier de diagnosticare din bara de meniu
- **Schimbați un profil din orice descărcare** — ajustați o descărcare, apoi actualizați profilul de la care a pornit (cu o previzualizare a modificărilor) sau salvați setările ca profil nou. Schimbarea profilului întreabă dacă păstrați modificările

</details>

<details>
<summary><strong>📝 Subtitrări și postprocesare</strong></summary>

- **Subtitrări** în SRT, VTT sau ASS — manuale sau generate automat, în orice limbă disponibilă
- Salvați lângă videoclip, încorporați în `.mkv` sau organizați într-un subfolder `Subtitles/`
- **Loturi doar cu subtitrări** — lipiți o listă de URL-uri sau deschideți o listă de redare, alegeți Subtitrări și obțineți doar fișierele de subtitrare pentru fiecare videoclip
- **SponsorBlock** — omiteți sau marcați ca capitole sponsorii, introducerile, încheierile, autopromovările
- **Metadate încorporate** — titlul, data încărcării, canalul, descrierea, miniatura și marcajele de capitole se scriu în fișier

</details>

<details>
<summary><strong>🌐 YouTube + 2000 de site-uri</strong></summary>

- **YouTube, în întregime** — Videoclipuri, Shorts, Canale, Liste de redare, YouTube Music și Podcasturi tratate ca surse de prim rang
- **Peste 2000 de alte site-uri** prin yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable și multe altele
- **Doar audio și subtitrări** funcționează pe fiecare site acceptat, nu doar pe YouTube
- Dacă un site se schimbă, yt-dlp livrează remedieri săptămânal, iar Arroxy actualizează automat fișierul binar la pornire

</details>

---

## <a id="install"></a>📥 Instalare și prima pornire

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

Versiunile sunt doar x86_64. Nu aveți `curl`? Înlocuiți `curl -fsSL` cu `wget -qO-`.

| Platformă | Descărcare directă |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Toate fișierele versiunii →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Prima pornire în Windows</strong></summary>

La prima pornire puteți vedea **„Windows a protejat computerul”** sau **„Editor necunoscut”.** Aceasta se aplică atât pentru `Arroxy-win-x64-Setup.exe`, cât și pentru `Arroxy-win-x64-Portable.exe`. Arroxy este gratuit și open-source, iar versiunile pentru Windows nu sunt semnate cu un certificat de semnare a codului plătit, motiv pentru care SmartScreen le semnalează. Asta **nu** înseamnă automat că Arroxy nu este sigur. Pentru a continua:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="Fereastra SmartScreen „Windows a protejat computerul” cu linkul „Mai multe informații” evidențiat" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="Fereastra SmartScreen după extinderea opțiunii Mai multe informații, cu butonul „Rulează oricum”" />
</div>

1. Faceți clic pe **Mai multe informații**.
2. Faceți clic pe **Rulează oricum**.

#### Dacă Windows Defender semnalează sau elimină fișierul

Euristicile Defender semnalează uneori drept suspecte programele de instalare NSIS nesemnate și variantele portabile Electron. Dacă Defender pune în carantină `Arroxy-win-x64-Setup.exe` sau `Arroxy-win-x64-Portable.exe`, restaurați-l din **Securitate Windows → Protecție împotriva virușilor și amenințărilor → Istoric protecție**, apoi adăugați executabilul Arroxy ca element permis la **Gestionați setările → Adăugați sau eliminați excluderi**. Ca și la SmartScreen, cauza este lipsa semnăturii editorului, nu un malware detectat.

> Descărcați Arroxy doar de pe pagina oficială GitHub Releases. Dacă ați primit fișierul de pe alt site sau vi l-a trimis cineva, ștergeți-l și descărcați o copie nouă din sursa oficială. Codul sursă este public, deci îl puteți inspecta sau puteți compila singur Arroxy, dacă preferați.

Preferați Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Prima pornire în macOS</strong></summary>

Versiunile Arroxy pentru macOS sunt semnate ad-hoc, dar nu sunt notarizate de Apple, deci Gatekeeper blochează prima pornire cu mesajul *„Arroxy.app” nu a fost deschis — Apple nu a putut verifica dacă „Arroxy.app” este lipsit de malware*. Asta înseamnă că macOS nu poate verifica aplicația cu Apple, nu că ar fi ceva în neregulă cu fișierele. Instalarea cu Homebrew evită complet această fereastră. Dacă ați folosit DMG-ul, o singură comandă în Terminal o rezolvă:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Trageți `Arroxy.app` din DMG-ul montat în `/Applications`.
2. Deschideți Terminal și rulați aceste două comenzi:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Prima comandă elimină atributul de carantină atașat de macOS la descărcarea fișierului; a doua pornește aplicația. De obicei nu aveți nevoie de `sudo`, deoarece copia din `/Applications` vă aparține — adăugați-l doar dacă primiți o eroare de permisiuni.

**Apple Silicon sau Intel:** pe un Mac din seria M (M1 / M2 / M3 / M4), descărcați DMG-ul `arm64`. Pe Mac-urile Intel, descărcați DMG-ul `x64`. Rularea versiunii greșite funcționează tot prin Rosetta, dar este vizibil mai lentă.

> Versiunile pentru macOS sunt produse prin CI pe runnere Apple Silicon și Intel. Dacă întâmpinați probleme, vă rugăm să [deschideți o problemă](../../../../issues) — feedbackul utilizatorilor de macOS modelează activ ciclul de testare pentru macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ De ce puteți vedea un avertisment</strong></summary>

Arroxy este open-source și are licență GPLv3. Versiunile pentru Windows și macOS **nu sunt semnate** — certificatele Apple Developer ID și Windows EV de semnare a codului costă fiecare sute de dolari pe an, pe care un proiect independent îi plătește din buzunar. Fără aceste semnături, Windows SmartScreen și macOS Gatekeeper vă vor avertiza la prima pornire. Avertismentele înseamnă că *sistemul dvs. de operare nu recunoaște editorul* — nu că Arroxy este malware.

Trei moduri de a verifica singur Arroxy, în ordinea crescătoare a rigorii:

- **Citiți sursa.** Fiecare linie este pe [GitHub](https://github.com/antonio-orionus/Arroxy) și puteți [compila din sursă](#tech).
- **Verificați SHA256.** Potriviți fișierul cu [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) publicat — vedeți [Verificați descărcarea](#verify) mai jos.
- **Rulați o scanare terță.** Încărcați fișierul pe [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Prima pornire în Linux</strong></summary>

AppImage-urile rulează direct — fără instalare. Trebuie doar să marcați fișierul ca executabil.

**Manager de fișiere:** faceți clic dreapta pe `.AppImage` → **Proprietăți** → **Permisiuni** → activați **Permite executarea fișierului ca program**, apoi faceți dublu clic.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Dacă pornirea tot eșuează, rulați-l fără montare — nu este nevoie de pachetul FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Integrare opțională în desktop:** instalați o dată [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), iar orice AppImage pe care faceți dublu clic este înregistrat automat în meniul de lansare — fără fișier `.desktop` manual.

**Arhivă tarball simplă (fără FUSE, fără instalare):**

Versiunea `.tar.gz` este aceeași aplicație, fără învelișul AppImage — extrageți-o oriunde și rulați-o. Fără program de instalare și fără pachetul FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Descărcările pentru Linux de pe pagina versiunii sunt doar x86_64.** Pe mașinile ARM64 (Raspberry Pi, Asahi Linux), Flatpak se instalează totuși, apoi eșuează la pornire cu `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verificați descărcarea (SHA256)</strong></summary>

Fiecare versiune publică un fișier `SHA256SUMS` alături de fișierele binare. Pentru a verifica dacă descărcarea nu a fost corupită sau alterată pe parcurs, calculați local hash-ul fișierului și potriviți-l cu linia din `SHA256SUMS`. Deschideți pagina ultimei versiuni → **Assets** → descărcați `SHA256SUMS`.

**Windows (PowerShell sau Prompt de comandă):**

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

Doriți o scanare anti-malware terță? Încărcați fișierul pe [VirusTotal](https://www.virustotal.com). Câteva semnalări euristice generice din partea unor motoare minore sunt normale pentru aplicațiile Electron nesemnate; detecțiile răspândite din partea motoarelor majore ar fi o problemă reală.

</details>

<details>
<summary><strong>📦 Windows: program de instalare sau portabil</strong></summary>

|               | Program de instalare NSIS | `.exe` portabil |
| ------------- | :----------------------: | :---------------------: |
| Necesită instalare | Da  | Nu — rulează de oriunde  |
| Actualizări automate | ✅ în aplicație  | ❌ descărcare manuală  |
| Viteza de pornire | ✅ mai rapidă  | ⚠️ pornire la rece mai lentă  |
| Se adaugă în meniul Start |            ✅            |           ❌            |
| Dezinstalare ușoară |            ✅            | ❌ ștergeți fișierul  |

**Recomandare:** folosiți programul de instalare NSIS pentru actualizări automate și pornire mai rapidă. Folosiți `.exe` portabil pentru varianta fără instalare și fără registry.

</details>

---

## <a id="why"></a>⚖️ De ce Arroxy

O comparație directă cu cele mai comune alternative:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Browser încorporat (navigare, conectare, descărcare) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Videoclipuri private, doar pentru membri și cu restricție de vârstă, fără export de cookie-uri |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratuit, fără nivel premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Procesare doar locală |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Fără limite de utilizare |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Aplicație desktop multiplatformă |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitrări + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = parțial sau doar în nivelul plătit. Conectarea din aplicație a 4K Video Downloader pentru videoclipuri private este o funcție plătită; majoritatea interfețelor grafice gratuite pentru yt-dlp acceptă doar un fișier de cookie-uri sau citesc cookie-urile browserului dvs.

Arroxy este construit pentru un singur lucru: un fișier local curat, fie că lipiți un URL, fie că găsiți videoclipul în Explorare. Fără upsell-uri, fără colectare de date.

### <a id="why-explore"></a>🧭 Ce nu poate face un simplu înveliș pentru yt-dlp: fila Explorare

Majoritatea descărcătoarelor gratuite pentru YouTube sunt o casetă de URL deasupra yt-dlp. Arroxy folosește și el yt-dlp, dar are și **Explorare**, un browser încorporat în aplicație care deschide YouTube sau orice alt site. Explorare depășește limite pe care o casetă de URL nu le poate depăși:

- **Videoclipuri care necesită un cont, fără export de cookie-uri** — videoclipuri private, doar pentru membri și cu restricție de vârstă (pe un cont cu vârsta verificată), plus listele Vizionează mai târziu și Apreciate, și videoclipuri aflate în spatele unei conectări pe alte site-uri. Un înveliș simplu are nevoie de un export cookies.txt sau trebuie să citească cookie-urile browserului dvs., pe care Chrome în Windows le blochează acum. În Arroxy vă conectați o singură dată în Explorare, iar restul se face singur
- **„Conectați-vă pentru a confirma că nu sunteți un robot”** — când YouTube cere asta, Arroxy reîncearcă descărcarea cu conectarea dvs. din Explorare, în loc să eșueze
- **Jetonul de descărcare YouTube** — browserul încorporat al Arroxy obține jetonul pe care YouTube îl așteaptă înaintea unei descărcări. Fără el, YouTube poate oferi mai puține formate și o calitate mai mică decât ați cerut
- **Fără copiat linkuri** — găsiți un videoclip, o listă de redare sau un canal în Explorare și descărcați-l cu un clic, sau faceți clic dreapta pe orice link din pagină
- **Blocant de reclame când îl doriți** — un clic pe scut blochează reclamele și trackerele de pe paginile din Explorare

---

## <a id="privacy"></a>🔒 Confidențialitate

Descărcările sunt preluate direct prin [yt-dlp](https://github.com/yt-dlp/yt-dlp) de pe YouTube în folderul ales de dvs. — nimic nu trece printr-un server terț. Istoricul de vizionare, istoricul descărcărilor, URL-urile și conținutul fișierelor rămân pe dispozitivul dvs.

Fără telemetrie — doar un semnal anonim pe zi: versiunea aplicației, sistemul de operare, limba, canalul de instalare, țara și aproximativ cât timp a trecut de la instalarea Arroxy, ca să putem număra utilizatorii activi și noi. Fără ID-uri, URL-uri, titluri de videoclipuri, căi de fișiere sau informații despre cont. Îl puteți dezactiva în Setări.

Explorare își păstrează propriile conectări, separate de browserul dvs., iar Arroxy nu citește și nu completează niciodată un formular de conectare — tastați în pagina site-ului însuși. Descărcările rulează fără conectare; doar când una eșuează într-un mod pe care un cont îl poate remedia, Arroxy citește conectarea la momentul respectiv, o păstrează într-un fișier temporar pentru acea descărcare și șterge fișierul după aceea. Deconectarea din Explorare, în Setări, le uită.

---

## <a id="faq"></a>❓ Întrebări frecvente

<details>
<summary><strong>Este într-adevăr gratuit?</strong></summary>

Da — licență GPLv3, fără nivel premium, fără funcții blocate.

</details>

<details>
<summary><strong>Cu ce se deosebește Arroxy de alte interfețe grafice pentru yt-dlp?</strong></summary>

Majoritatea interfețelor grafice gratuite pentru yt-dlp sunt învelișuri care acceptă doar un link. Arroxy adaugă **Explorare**, un browser încorporat în aplicație care deschide YouTube sau orice alt site: navigați și descărcați fără a copia linkuri, iar vă conectați acolo o singură dată pentru a descărca videoclipuri private, doar pentru membri și cu restricție de vârstă, plus listele Vizionează mai târziu și Apreciate, fără export de cookie-uri. Arroxy folosește acea conectare când YouTube vă cere să confirmați că nu sunteți un robot, iar browserul său încorporat obține jetonul de descărcare YouTube, astfel încât descărcările să nu revină la mai puține formate. Vedeți [De ce Arroxy](#why).

</details>

<details>
<summary><strong>Ce calități video pot descărca?</strong></summary>

Tot ce oferă YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus doar audio. Fluxurile de 60 fps și HDR se păstrează ca atare, iar descărcarea pas cu pas vă lasă să alegeți AV1, VP9 sau H.264 la fiecare rezoluție.

</details>

<details>
<summary><strong>Pot extrage doar audio ca MP3?</strong></summary>

Da. Alegeți *doar audio* în meniul de formate și selectați MP3, M4A/AAC, Opus sau WAV.

</details>

<details>
<summary><strong>Cum descarc videoclipuri care necesită un cont YouTube?</strong></summary>

Conectați-vă o singură dată în fila Explorare. Arroxy poate apoi descărca videoclipuri private și doar pentru membri pe care contul dvs. le poate viziona, videoclipuri cu restricție de vârstă dacă vârsta contului este verificată, plus listele Vizionează mai târziu și Apreciate. Folosește conectarea doar când o descărcare eșuează într-un mod pe care un cont îl poate remedia; restul se descarcă ca înainte. Aceasta este opțiunea **Conectare Explorare**, listată prima și marcată Recomandat în setările cookie-urilor, iar Arroxy o alege pentru dvs. prima dată când deschideți Explorare. Wiki-ul yt-dlp notează că [automatizarea cu conectare poate semnala un cont Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), deci un cont secundar este alegerea mai sigură.

</details>

<details>
<summary><strong>Va continua să funcționeze când YouTube schimbă ceva?</strong></summary>

yt-dlp este actualizat automat la pornire, iar Arroxy livrează prompt remedieri când YouTube schimbă ceva. Când YouTube vă cere să confirmați că nu sunteți un robot, Arroxy încearcă și conectarea dvs. din Explorare, dacă v-ați conectat acolo, iar cookie-urile dintr-un fișier sau din browser sunt disponibile în setările cookie-urilor.

</details>

<details>
<summary><strong>În ce limbi este disponibil Arroxy?</strong></summary>

50 limbi, din start: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy detectează automat limba sistemului de operare la prima pornire și puteți comuta oricând din selectorul de limbă din bara de instrumente. JSON-urile de limbă folosite la rulare se află în src/shared/i18n/locales/, iar cataloagele PO destinate traducătorilor se află în i18n/locales/ — deschideți un PR pe GitHub pentru a contribui.

</details>

<details>
<summary><strong>Trebuie să instalez altceva?</strong></summary>

Nu. yt-dlp, ffmpeg și ffprobe sunt descărcate automat la prima pornire și păstrate pe calculatorul dvs. După aceea, nu mai este nevoie de nicio configurare suplimentară.

</details>

<details>
<summary><strong>Pot descărca liste de redare sau canale întregi?</strong></summary>

Da — ambele. Lipiți un URL de listă de redare sau de canal (ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); alegeți câte intrări să se scaneze, apoi puneți în coadă toată lista sau alegeți videoclipuri anume. Filtrele pe interval de date vor veni în curând.

</details>

<details>
<summary><strong>macOS spune „aplicația este deteriorată” — ce fac?</strong></summary>

Este macOS Gatekeeper care blochează o aplicație nesemnată, nu o deteriorare reală. Vedeți [Prima pornire în macOS](#macos-first-launch) pentru comenzile Terminal care elimină carantina și pornesc Arroxy.

</details>

<details>
<summary><strong>Este legală descărcarea videoclipurilor YouTube?</strong></summary>

Pentru uz personal, privat, este în general acceptată în majoritatea jurisdicțiilor. Sunteți responsabil să respectați [Termenii și condițiile](https://www.youtube.com/t/terms) YouTube și legile locale privind drepturile de autor.

</details>

---

## <a id="roadmap"></a>🗺️ Foaie de parcurs

Încă planificate — aproximativ în ordinea priorității:

| Funcționalitate    | Descriere    |
| ---------------- | ---------------- |
| **Filtre pentru liste de redare și canale** | Filtre pe interval de date la enumerarea unei liste de redare sau a unui canal |
| **Preferințe pentru pistele audio YouTube** | Setați o preferință globală pentru limba vorbită a pistei, cu suprascrieri pe profil, când YouTube oferă mai multe piste audio |
| **Recuperare mai puternică la reîncercare** | O nouă cale de reîncercare pentru descărcările întrerupte de conexiuni la internet nesigure sau problematice |
| **Panou complet de gestionare a descărcărilor** | Transformarea panoului cozii într-un manager mai complet, inclusiv schimbarea folderelor de destinație pentru elementele din coadă |
| **Descărcări programate** | Pornirea unei cozi la o oră stabilită (rulări peste noapte) |
| **Pachet AUR** | Instalare pe Arch Linux și Omarchy cu `yay -S arroxy-bin` |

Aveți în minte o funcționalitate? [Deschideți o cerere](../../../../issues) — contribuțiile comunității modelează prioritatea.

---

## <a id="support"></a>💖 Susțineți Arroxy

Arroxy este gratuit și are licență GPLv3 — fără reclame, fără telemetrie, fără nivel plătit. Dacă vă economisește timp, puteți susține dezvoltarea cu Bitcoin, Tron sau Ethereum: adresele se găsesc în [DONATE.md](../../DONATE.md), singura sursă oficială pentru ele. Arroxy nu vă va trimite niciodată o adresă prin e-mail sau mesaj direct. Marcarea depozitului cu stea, raportarea erorilor și îmbunătățirea traducerilor ajută la fel de mult.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Construit cu

<details>
<summary><strong>Tehnologii</strong></summary>

- **Electron** — shell desktop multiplatformă
- **React 19** + **TypeScript** — interfața
- **Tailwind CSS v4** — stilizare
- **Zustand** — gestionarea stării
- **yt-dlp** + **ffmpeg** — motor de descărcare și multiplexare (ambele sunt preluate la rulare: yt-dlp este ținut la zi, ffmpeg/ffprobe se instalează o singură dată și se păstrează între actualizări)
- **Vite** + **electron-vite** — instrumente de build
- **Vitest** + **Playwright** — teste unitare și end-to-end

</details>

<details>
<summary><strong>Compilare din sursă</strong></summary>

### Cerințe preliminare — toate platformele

| Instrument | Versiune | Instalare |
| ------- | ------- | ------- |
| Git     | orice   | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` sau `.node-version` |
| Bun     | 1.4.2  | `mise install` sau `packageManager` din `package.json` |

Recomandat: instalați `mise`, apoi rulați `mise install` în directorul clonat. Fără mise, activați manual Node.js din `.node-version` și Bun din `package.json` înainte de `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Pentru recompilările native pot fi necesare Visual Studio Build Tools și Python.

### macOS

```bash
brew install mise
xcode-select --install
```

După clonare, rulați `mise trust && mise install` din directorul clonat. Dacă shell-ul dvs. folosește deja `fnm`, `nvm` sau un Bun din Homebrew, activați mise în `~/.zshrc` ca Arroxy să primească Node.js 24.21.0 și Bun 1.4.2:

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

### Clonare și rulare

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Construirea unui pachet de distribuție

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` instalează dependențele, recompilează dependențele aplicației Electron, verifică Electron, pregătește ffmpeg/ffprobe încorporate pentru dezvoltare și instalează Playwright Chromium. Versiunile de lansare gestionează yt-dlp, ffmpeg și ffprobe la rulare, în folderul de date al aplicației; niciunul nu este inclus în programul de instalare.

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

## 📜 Termeni de utilizare

Arroxy este un instrument destinat exclusiv uzului personal, privat. Sunteți singurul responsabil pentru a vă asigura că descărcările dvs. respectă [Termenii și condițiile](https://www.youtube.com/t/terms) YouTube și legile privind drepturile de autor din jurisdicția dvs. Nu folosiți Arroxy pentru a descărca, reproduce sau distribui conținut pe care nu aveți dreptul să-l folosiți. Dezvoltatorii nu răspund pentru nicio utilizare abuzivă.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Făcut cu grijă de <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
