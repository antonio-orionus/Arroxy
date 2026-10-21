<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Maskota Arroxy" width="180" />

# Arroxy — brezplačen odprtokodni prenosnik za YouTube (+ 2000 spletnih mest) z vgrajenim brskalnikom, za Windows, macOS in Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Beri v jeziku:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · **Slovenščina** · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Izdaja](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Gradnja](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Spletno mesto](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licenca](https://img.shields.io/badge/license-GPLv3-blue) ![Platforme](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Jeziki](https://img.shields.io/badge/i18n-50_languages-blue)

Prenesite videoposnetke, Shorts, glasbo, kanale, podkaste ali zvočne posnetke z **YouTuba in več kot 2000 podprtih spletnih mest** — do 8K HDR pri 60 sličicah/s, kot MP3 / AAC / Opus ali samo del, ki ga potrebujete. **Brskajte po YouTubu ali katerem koli drugem spletnem mestu kar v programu Arroxy** na zavihku Razišči in prenesite videoposnetek, seznam predvajanja ali kanal, na katerem ste; tam se prijavite, da prenesete zasebne videoposnetke, videoposnetke samo za člane in starostno omejene videoposnetke, ki jih lahko gleda vaš račun. Deluje lokalno v sistemih Windows, macOS in Linux. **Brez oglasov, brez nepotrebnega balasta, brez vsiljevanja plačljivih različic.**

[**↓ Namestite najnovejšo izdajo**](#install) &nbsp;·&nbsp; [**Spletno mesto**](https://arroxy.com/) &nbsp;·&nbsp; [Prvi zagon v sistemu Windows](#windows-first-launch) · [Prvi zagon v macOS](#macos-first-launch) · [Prvi zagon v Linuxu](#linux-first-launch)

[![Pridružite se skupnosti Discord](https://img.shields.io/badge/Pridru%C5%BEite%20se%20skupnosti%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Če vam Arroxy prihrani čas, ⭐ pomaga drugim, da ga najdejo.

</div>

> **Kaj je Arroxy?** Arroxy je brezplačen namizni grafični vmesnik z odprto kodo, ki prenaša videoposnetke, zvok, sezname predvajanja in podnapise iz YouTuba ter več kot 2000 drugih spletnih mest, ki jih podpira [yt-dlp](https://github.com/yt-dlp/yt-dlp). Deluje v sistemih Windows 10/11, macOS 13+ (Intel + Apple Silicon) in Linux (AppImage, Flatpak, tar.gz). Licenca GPLv3. Brez oglasov, brez omejitev uporabe. Distribuira se prek [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage in neposrednega prenosa.
>
> **Ključna razlika: vgrajen brskalnik.** Večina brezplačnih prenosnikov za YouTube so tanki ovoji okoli yt-dlp: polje za URL in meni formatov, brez lastnega brskalnika. Arroxy ga ima, to je zavihek **Razišči**. Po YouTubu ali katerem koli drugem spletnem mestu brskate v aplikaciji in prenesete videoposnetek, seznam predvajanja ali kanal, na katerem ste, ali pa z desnim klikom na katero koli povezavo. V Razišči se prijavite enkrat, Arroxy pa prenese zasebne videoposnetke, videoposnetke samo za člane in starostno omejene videoposnetke, ki jih lahko gleda vaš račun, ter vaša seznama Ogled pozneje in Všečkano, brez izvoza piškotkov. Tam se prijavite tudi v druga spletna mesta, njihovi prenosi pa to prijavo uporabijo, kadar jo potrebujejo. Ko YouTube zahteva potrditev, da niste bot, poskusi znova s to prijavo. Vgrajen brskalnik pridobi tudi žeton, ki ga YouTube pričakuje pred prenosom, zato YouTube prenosa ne zmanjša na manj formatov. Ovoj s poljem za URL naleti na vse te omejitve. Podrobnosti: [Zakaj Arroxy](#why-explore).
>
> _Zadnja posodobitev: 2026-10-21._

> 🌐 Ta prevod je nastal s pomočjo umetne inteligence. [Angleški README](../../README.md) je nadrejeni vir. Ste našli napako? [Odprite PR](../../../../pulls).

---

## Kazalo

- [✨ Funkcije](#features)
- [📥 Namestitev in prvi zagon](#install)
  - [Prvi zagon v sistemu Windows](#windows-first-launch)
  - [Prvi zagon v macOS](#macos-first-launch)
  - [Zakaj lahko vidite opozorilo](#why-warning)
  - [Prvi zagon v Linuxu](#linux-first-launch)
  - [Preverite svoj prenos (SHA256)](#verify)
- [⚖️ Zakaj Arroxy](#why)
- [🔒 Zasebnost](#privacy)
- [❓ Pogosta vprašanja](#faq)
- [🗺️ Načrt razvoja](#roadmap)
- [💖 Podprite Arroxy](#support)
- [🛠️ Izdelano z](#tech)

---

## <a id="features"></a>✨ Funkcije

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sl/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Razišči</b><br/>Brskajte po YouTubu ali katerem koli drugem spletnem mestu v programu Arroxy in prenesite stran, na kateri ste, z aktivnim profilom</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Prvi zaslon Razišči</b><br/>Kratek pogled na Razišči in zakaj je sekundarni račun varnejša prijava</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Prenosi vam povedo, kaj potrebuje vas</b><br/>Povezave se pripravljajo v ozadju; neuspela ponudi rešitev, dolg seznam predvajanja počaka na vašo izbiro</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sl/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Prenesite samo del videoposnetka</b><br/>Izberite začetek in konec ali poglavje — Arroxy shrani samo ta obseg</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sl/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR pri 60 sličicah/s</b><br/>Vsaka ločljivost, kodek in tok HDR, ki ga videoposnetek ponuja, drug ob drugem</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sl/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Urejevalnik profilov</b><br/>Prilagodite profil: vrsto datoteke, ločljivost, podnapise, cilj, predlogo imena datoteke in več</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sl/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Temno ali svetlo, steklo ali polno</b><br/>Štirje videzi na izbiro: steklene plošče nad gibajočim se nebom ali mirne polne površine, vsak v temni in svetli različici</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Splošna bližnjica za prenos v Arroxy — Ctrl+Shift+D v sistemih Windows in Linux, Cmd+Shift+D v macOS, ki kopirano povezavo pošlje neposredno v vrsto prenosov" width="760" /></picture><br/><sub><b>Splošna bližnjica za prenos</b><br/>Kjer koli kopirajte povezavo, enkrat pritisnite — pristane v vrsti in se začne prenašati</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sl/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profili po elementih seznama predvajanja</b><br/>Vsakemu videoposnetku dajte lasten profil — nekatere arhivirajte v 4K, preostale prenesite kot MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Domača stran hitrega prenosa</b><br/>Prilepite URL in ga takoj prenesite z aktivnim profilom</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Večkrat uporabni profili prenosa</b><br/>Shranite prednastavitve formata, kakovosti in izhoda — uporabite jih pri vsakem prenosu</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Večjezični zvočni posnetki</b><br/>Izberite točen jezik zvoka, ki ga videoposnetek ponuja</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Prostorski / Dolby zvok</b><br/>Posnetki 5.1 in Dolby so zaznani in ohranjeni</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Način več naslovov URL</b><br/>Prilepite seznam, samodejno odstranite dvojnike in vse dodajte v vrsto naenkrat</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sl/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Vzporedna vrsta prenosov</b><br/>Več prenosov hkrati z napredkom v živo</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Razišči: brskanje po spletu v programu Arroxy</strong></summary>

- **Zavihek Razišči** — brskajte po YouTubu ali katerem koli drugem spletnem mestu v programu Arroxy in prenesite, kar najdete, brez kopiranja povezav. **Prenesi · *vaš profil*** doda v vrsto videoposnetek, seznam predvajanja ali kanal, ki ga gledate; puščica ob njem zamenja profil, čarobna palica pa odpre postopni prenos za izbiro formatov, podnapisov in drugega
- **Desni klik za prenos** — z desnim klikom na katero koli povezavo do videoposnetka, seznama predvajanja ali kanala v Razišči jo prenesite z vašim profilom, izberite drug profil v **Prenesi z**, odprite postopni prenos ali kopirajte povezavo. Ni vam treba najprej odpreti vsakega videoposnetka
- **Strnjena postavitev** — en klik v orodni vrstici Razišči premakne zavihke Arroxy vanjo in strani nameni več prostora
- **Naslovna vrstica** — vpišite iskanje po YouTubu ali pa vnesite katerikoli spletni naslov in odprite to spletno mesto
- **Prenosi, ki zahtevajo račun** — enkrat se prijavite v Razišči in Arroxy lahko prenese zasebne videoposnetke in videoposnetke samo za člane, ki jih lahko gleda vaš račun, starostno omejene videoposnetke, če je račun starostno preverjen, ter vaša seznama Ogled pozneje in Všečkano. Tam se prijavite tudi v druga spletna mesta, njihovi prenosi pa to prijavo uporabijo, kadar jo potrebujejo. Arroxy še vedno najprej prenaša odjavljen in vašo prijavo v Razišči uporabi samo, kadar prenos spodleti na način, ki ga lahko odpravi račun. Ko YouTube zahteva potrditev, da niste bot, Arroxy poskusi tudi z vašo prijavo v Razišči
- **Uporabite sekundarni račun** — prvi zaslon Razišči razloži zakaj: prenos z računom prinaša nekaj tveganja, da bo ta račun omejen. Iz Razišči se odjavite v nastavitvah, kadar koli želite pozabiti svoje prijave
- **Blokator oglasov** — privzeto izklopljen. En klik na ščit v orodni vrstici Razišči blokira oglase in sledilnike na njegovih straneh, ne da bi vplival na prenose. YouTube se lahko upira blokatorjem oglasov pri prijavljenih računih

</details>

<details>
<summary><strong>🎞️ Kakovost in formati</strong></summary>

- Do **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Visoka hitrost sličic in HDR** ohranjena nespremenjena — 60 sličic/s, HDR10
- **Zvok** — izvozite samo zvok kot MP3, M4A/AAC, Opus ali WAV. Pri interaktivnih prenosih izberite izvirne prostorske/Dolby posnetke vira (AC-3, E-AC-3, 5.1, DRC), kadar so na voljo, ali nastavite splošno privzeto **Prednost prostorski zvok / Dolby**
- **Profili s ciljem** — *Najboljša slika* (AV1 · VP9) ali *Pametni televizor* (MP4 · H.264), shranjeni kot Samodejno, MP4, MKV ali WebM brez ponovnega kodiranja. HDR je *Samodejno* (samo kadar ga vaš zaslon lahko prikaže), *SDR* ali *HDR*
- **Vsak kodek pri vsaki ločljivosti** — postopni prenos našteje AV1, VP9 in H.264 drug ob drugem pri vsaki ločljivosti, tako da izberete tistega, ki ga predvaja vaš televizor ali urejevalnik
- **Vedite, kaj tok v resnici je** — velikosti, ki jih je YouTube povečal z umetno inteligenco, jeziki zvoka, sinhronizirani z umetno inteligenco, toki z izboljšano bitno hitrostjo, videoposnetki 360° ter poškodovane kopije ali kopije z vodnim žigom so označeni. Profili preskočijo toke, povečane z umetno inteligenco, razen če jih dovolite

</details>

<details>
<summary><strong>🛡️ Zasebnost in nadzor</strong></summary>

- 100 % lokalna obdelava — prenosi gredo neposredno z YouTuba na vaš disk
- **Odprta koda** — vsako vrstico je mogoče preveriti, licenca GPLv3
- Datoteke so shranjene neposredno v mapo, ki jo izberete

</details>

<details>
<summary><strong>⚡ Potek dela</strong></summary>

- **Splošna bližnjica za prenos** — kopirajte povezavo v katerikoli aplikaciji in pritisnite `Ctrl+Shift+D` (`Cmd+Shift+D` v macOS); Arroxy jo doda v vrsto z vašim aktivnim profilom, ne da bi odprl okno, obvestilo pa to potrdi. Privzeto vklopljena, nastavljiva
- **Prilagodljivi načini zagona** — izberite vodeni posamezni prenos, izbirnik seznamov predvajanja/kanalov, lepljenje več naslovov URL, hitri prenos s shranjenimi privzetimi nastavitvami ali brskanje in prenos iz Razišči
- **Osrednja vrsta prenosov** — vsako posamezno, seznamsko, množično ali hitro opravilo pristane na enem mestu za napredek, začasno ustavitev, nadaljevanje, preklic, ponovni poskus in nadzor prednosti
- **Spremljanje odložišča** — kopirajte povezavo do videoposnetka in izpolnila bo polje URL, ko se vrnete v Arroxy, z možnostjo **Razveljavi**, če tega niste želeli. Medtem ko je Arroxy zaseden, povezava počaka, dokler niste spet na zavihku URL (izklopite v nastavitvah)
- **Samodejno čiščenje URL-jev** — odstrani sledilne parametre (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) in razpre povezave `youtube.com/redirect`
- **Način sistemske vrstice** — zapiranje okna ohrani prenose v ozadju
- **50 jezikov** — samodejno zazna sistemski jezik, preklop kadar koli
- **Sinhronizacija seznamov predvajanja** — znova preglejte seznam predvajanja glede na lokalno mapo, da preskočite že prenesene videoposnetke; ustvari datoteko seznama predvajanja `.m3u`, ki se posodablja ob prenosu vsakega videoposnetka
- **Nadzor hitrosti in tempa** — omejite pasovno širino prenosa, nastavite, koliko delov videoposnetka se prenaša hkrati, in dodajte zakasnitve zahtev s prednastavitvami (*Izklopljeno · Uravnoteženo · Previdno · Po meri*)
- **Predloge imen datotek** — poimenujte prenose po svoje z `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` in `{playlist_index}`, splošno ali za posamezen profil prenosa
- **Hkratni prenosi in samodejni ponovni poskus** — izberite, koliko prenosov v vrsti teče hkrati, in pustite, da Arroxy ponovi prenos, ki je naletel na težavo z omrežjem ali strežnikom, pri čemer pred vsakim poskusom čaka dlje
- **Profili po elementih seznama predvajanja** — vsakemu videoposnetku na seznamu predvajanja dodelite lasten profil prenosa namesto ene nastavitve za cel seznam, tako da lahko v enem prehodu nekatere arhivirate v polni kakovosti, preostale pa prenesete kot MP3
- **Hitri prenos deluje v ozadju** — povezava se takoj pokaže v Prenosih in se tam pripravi, obvestilo z gumbom **Pokaži** to potrdi, polje URL pa se izprazni za naslednjo povezavo. Začnite, kolikor jih želite, medtem ko se prejšnji pripravljajo
- **Prenosi vam povedo, kaj potrebuje vas** — če Arroxy povezave ne more prebrati, njena vrstica pove zakaj in ponudi rešitev: Poskusi znova, vklopi piškotke ali se prijavi v Razišči. Ko so piškotki izklopljeni, **Prijava v Razišči** poskusi znova namesto vas, ko ste prijavljeni. Seznam predvajanja, daljši od vaše omejitve nalaganja, v svoji vrstici počaka, da izberete vse, prve ali pregled. Zavihek Prenosi šteje vrstice, ki čakajo na vas
- **Prenesite samo del videoposnetka** — na zaslonu Format izberite začetek in konec ali poglavje, Arroxy pa shrani samo ta obseg in ga za ID videoposnetka vključi v ime. Rezi pristanejo na najbližji ključni sličici; vklopite natančen rez, če želite namesto tega ponovno kodiranje
- **Odstranjevanje končanih prenosov** — izbirno: končan prenos zapusti seznam 5 sekund pozneje. Njegove datoteke ostanejo na disku, neuspeli prenosi pa ostanejo na seznamu
- **Velikost in Manjka v Prenosih** — razvrstljiv stolpec **Velikost** prikazuje, koliko prostora zaseda posamezen prenos, **Manjka** pa označi datoteke, premaknjene ali izbrisane zunaj programa Arroxy
- **Aurora ali Minimalističen, temno ali svetlo** — steklene plošče nad gibajočim se nebom ali mirne polne površine; preklop v nogi. Računalniki brez grafičnega pospeševanja samodejno dobijo Minimalističen
- **Menijska vrstica Mac** — v macOS odprite nastavitve (`Cmd+,`), nastavite omejitev hitrosti prenosa, zamenjajte slog in temo ter odprite dnevnike ali shranite datoteko z diagnostiko iz menijske vrstice
- **Spremenite profil iz katerega koli prenosa** — prilagodite prenos, nato posodobite profil, iz katerega se je začel (s predogledom sprememb), ali shranite nastavitve kot nov profil. Pri zamenjavi profila vas vpraša, ali želite obdržati svoje spremembe

</details>

<details>
<summary><strong>📝 Podnapisi in naknadna obdelava</strong></summary>

- **Podnapisi** v SRT, VTT ali ASS — ročni ali samodejno ustvarjeni, v katerem koli razpoložljivem jeziku
- Shranite ob videoposnetku, vdelajte v `.mkv` ali uredite v podmapo `Subtitles/`
- **Paketi samo s podnapisi** — prilepite seznam naslovov URL ali odprite seznam predvajanja, izberite Podnapisi in dobite samo datoteke s podnapisi za vsak videoposnetek
- **SponsorBlock** — preskočite ali označite s poglavji sponzorje, uvode, zaključke in samopromocije
- **Vdelani metapodatki** — naslov, datum nalaganja, kanal, opis, sličica in oznake poglavij, zapisani v datoteko

</details>

<details>
<summary><strong>🌐 YouTube + 2000 spletnih mest</strong></summary>

- **YouTube v celoti** — Videoposnetki, Shorts, Kanali, Seznami predvajanja, YouTube Music in Podkasti so obravnavani kot prvovrstni viri
- **Več kot 2000 drugih spletnih mest** prek yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable in še mnogo drugih
- **Samo zvok in podnapisi** delujejo na vseh podprtih spletnih mestih, ne le na YouTubu
- Če se spletno mesto spremeni, yt-dlp vsak teden izda popravke, Arroxy pa ob zagonu samodejno posodobi izvedljivo datoteko

</details>

---

## <a id="install"></a>📥 Namestitev in prvi zagon

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

Gradnje so samo za x86_64. Nimate `curl`? Zamenjajte `curl -fsSL` z `wget -qO-`.

| Platforma | Neposredni prenos |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Vse datoteke izdaje →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Prvi zagon v sistemu Windows</strong></summary>

Ob prvem zagonu boste morda videli **„Windows je zaščitil vaš računalnik“** ali **„Neznani založnik“.** To velja za `Arroxy-win-x64-Setup.exe` in `Arroxy-win-x64-Portable.exe`. Arroxy je brezplačen in odprtokoden, gradnje za Windows pa niso podpisane s plačljivim potrdilom, zato jih SmartScreen označi. To **ne** pomeni samodejno, da Arroxy ni varen. Za nadaljevanje:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="Pogovorno okno SmartScreen „Windows je zaščitil vaš računalnik“ z označeno povezavo „Več informacij“" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="Pogovorno okno SmartScreen po razširitvi Več informacij, ki prikazuje gumb „Vseeno zaženi“" />
</div>

1. Kliknite **Več informacij**.
2. Kliknite **Vseeno zaženi**.

#### Če Windows Defender datoteko označi ali odstrani

Hevristika programa Defender včasih nepodpisane namestitvene programe NSIS in prenosne Electron aplikacije označi kot sumljive. Če Defender v karanteno premakne `Arroxy-win-x64-Setup.exe` ali `Arroxy-win-x64-Portable.exe`, jo obnovite v **Varnost sistema Windows → Zaščita pred virusi in grožnjami → Zgodovina zaščite**, nato izvedljivo datoteko Arroxy dodajte kot dovoljen element v **Upravljanje nastavitev → Dodajanje ali odstranjevanje izjem**. Tako kot pri SmartScreen je sprožilec manjkajoči podpis založnika, ne zaznana zlonamerna programska oprema.

> Arroxy prenesite samo z uradne strani GitHub Releases. Če ste datoteko dobili z drugega spletnega mesta ali vam jo je nekdo poslal, jo izbrišite in iz uradnega vira prenesite novo kopijo. Izvorna koda je javna, zato jo lahko pregledate ali, če želite, Arroxy zgradite sami.

Raje Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Prvi zagon v macOS</strong></summary>

Gradnje Arroxy za macOS so podpisane ad hoc, vendar jih Apple ni overil (notarization), zato Gatekeeper ob prvem zagonu blokira zagon s sporočilom *„Arroxy.app“ ni bilo odprto — Apple ni mogel preveriti, da „Arroxy.app“ ne vsebuje zlonamerne programske opreme*. To pomeni, da macOS aplikacije ne more preveriti pri Applu, ne da je kaj narobe z datotekami. Namestitev s Homebrew se temu pogovornemu oknu povsem izogne. Če ste uporabili DMG, ga odpravi en ukaz v terminalu:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Povlecite `Arroxy.app` iz priklopljenega DMG v `/Applications`.
2. Odprite Terminal in zaženite ta dva ukaza:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Prvi ukaz odstrani atribut karantene, ki ga je macOS pripel ob prenosu datoteke; drugi zažene aplikacijo. `sudo` običajno ne potrebujete, ker kopija v `/Applications` pripada vam — dodajte ga samo ob napaki dovoljenj.

**Apple Silicon ali Intel:** na Macu serije M (M1 / M2 / M3 / M4) prenesite DMG `arm64`. Na Macih Intel prenesite DMG `x64`. Napačna gradnja prek Rosetta še vedno deluje, vendar opazno počasneje.

> Gradnje za macOS nastajajo prek CI na izvajalcih Apple Silicon in Intel. Če naletite na težave, [odprite težavo](../../../../issues) — povratne informacije uporabnikov macOS dejavno oblikujejo cikel testiranja za macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Zakaj lahko vidite opozorilo</strong></summary>

Arroxy je odprtokoden in ima licenco GPLv3. Gradnje za Windows in macOS **niso podpisane s kodo** — potrdila Apple Developer ID in Windows EV za podpisovanje kode stane več sto dolarjev na leto, kar neodvisen projekt plača iz lastnega žepa. Brez teh podpisov vas bosta Windows SmartScreen in macOS Gatekeeper ob prvem zagonu opozorila. Opozorila pomenijo *vaš OS ne prepozna založnika* — ne pomenijo, da je Arroxy zlonamerna programska oprema.

Trije načini, kako lahko Arroxy preverite sami, po naraščajoči strogosti:

- **Preberite izvorno kodo.** Vsaka vrstica je na [GitHubu](https://github.com/antonio-orionus/Arroxy), [zgradite jo lahko iz izvorne kode](#tech).
- **Preverite SHA256.** Primerjajte svojo datoteko z objavljeno [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — glejte [Preverite svoj prenos](#verify) spodaj.
- **Zaženite pregled tretje osebe.** Naložite datoteko na [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Prvi zagon v Linuxu</strong></summary>

AppImage se zaženejo neposredno — brez namestitve. Datoteko morate samo označiti kot izvedljivo.

**Upravitelj datotek:** z desno tipko miške kliknite `.AppImage` → **Lastnosti** → **Dovoljenja** → vklopite **Dovoli izvajanje datoteke kot programa**, nato dvokliknite.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Če zagon še vedno ne uspe, ga zaženite brez priklopa — paket FUSE ni potreben:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Izbirna integracija z namizjem:** enkrat namestite [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) in vsaka AppImage, ki jo dvokliknete, se samodejno registrira v meniju zaganjalnika — ročna datoteka `.desktop` ni potrebna.

**Navaden tarball (brez FUSE, brez namestitve):**

Gradnja `.tar.gz` je ista aplikacija brez ovoja AppImage — razpakirajte jo kamor koli in zaženite. Namestitveni program in paket FUSE nista potrebna.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Prenosi za Linux na strani izdaje so samo za x86_64.** Na računalnikih ARM64 (Raspberry Pi, Asahi Linux) se Flatpak še vedno namesti, nato pa ob zagonu spodleti z `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Preverite svoj prenos (SHA256)</strong></summary>

Vsaka izdaja poleg binarnih datotek objavi datoteko `SHA256SUMS`. Da preverite, da vaš prenos med prenosom ni bil poškodovan ali spremenjen, lokalno izračunajte zgoščeno vrednost svoje datoteke in jo primerjajte z vrstico v `SHA256SUMS`. Odprite stran najnovejše izdaje → **Assets** → prenesite `SHA256SUMS`.

**Windows (PowerShell ali ukazni poziv):**

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

Želite pregled za zlonamerno programsko opremo s strani tretje osebe? Naložite datoteko na [VirusTotal](https://www.virustotal.com). Peščica splošnih hevrističnih oznak manjših mehanizmov je običajna za nepodpisane aplikacije Electron; razširjene zaznave večjih mehanizmov bi bile resen razlog za skrb.

</details>

<details>
<summary><strong>📦 Windows: namestitveni program ali prenosna različica</strong></summary>

|               | Namestitveni program NSIS | Prenosni `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Zahteva namestitev | Da  | Ne — zaženite od koder koli  |
| Samodejne posodobitve | ✅ v aplikaciji  | ❌ ročni prenos  |
| Hitrost zagona | ✅ hitrejši  | ⚠️ počasnejši hladni zagon  |
| Doda se v meni Start |            ✅            |           ❌            |
| Enostavna odstranitev |            ✅            | ❌ izbrišite datoteko  |

**Priporočilo:** uporabite namestitveni program NSIS za samodejne posodobitve in hitrejši zagon. Uporabite prenosni `.exe` za možnost brez namestitve in brez zapisov v register.

</details>

---

## <a id="why"></a>⚖️ Zakaj Arroxy

Primerjava z najpogostejšimi alternativami:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Vgrajen brskalnik (brskanje, prijava, prenos) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Zasebni videoposnetki, videoposnetki samo za člane in starostno omejeni videoposnetki brez izvoza piškotkov |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Brezplačno, brez plačljive različice |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Odprta koda |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Samo lokalna obdelava |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Brez omejitev uporabe |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Medplatformska namizna aplikacija |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Podnapisi + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = delno ali samo v plačljivi različici. Prijava v aplikaciji za zasebne videoposnetke v programu 4K Video Downloader je plačljiva funkcija; večina brezplačnih grafičnih vmesnikov za yt-dlp sprejme samo datoteko s piškotki ali prebere piškotke vašega spletnega brskalnika.

Arroxy je narejen za eno stvar: čisto lokalno datoteko, ne glede na to, ali prilepite URL ali videoposnetek najdete v Razišči. Brez vsiljevanja plačljivih različic, brez zbiranja podatkov.

### <a id="why-explore"></a>🧭 Česar navaden ovoj za yt-dlp ne zmore: zavihek Razišči

Večina brezplačnih prenosnikov za YouTube je polje za URL nad yt-dlp. Tudi Arroxy uporablja yt-dlp, vendar ima tudi **Razišči**, v aplikacijo vgrajen brskalnik, ki odpre YouTube ali katero koli drugo spletno mesto. Razišči preseže omejitve, ki jih polje za URL ne more:

- **Videoposnetki, ki zahtevajo račun, brez izvoza piškotkov** — zasebni videoposnetki, videoposnetki samo za člane in starostno omejeni videoposnetki (pri računu s preverjeno starostjo) ter vaši seznami Ogled pozneje in Všečkano, pa tudi videoposnetki za prijavo na drugih spletnih mestih. Navaden ovoj potrebuje izvoz cookies.txt ali mora prebrati piškotke vašega spletnega brskalnika, kar Chrome v sistemu Windows zdaj blokira. V Arroxy se enkrat prijavite v Razišči, ostalo opravi program
- **„Prijavite se, da potrdite, da niste bot“** — ko YouTube to zahteva, Arroxy namesto neuspeha ponovno poskusi prenos z vašo prijavo v Razišči
- **Žeton za prenos YouTuba** — Arroxyjev vgrajeni brskalnik pridobi žeton, ki ga YouTube pričakuje pred prenosom. Brez njega lahko YouTube ponudi manj formatov in nižjo kakovost, kot ste jo zahtevali
- **Brez kopiranja povezav** — v Razišči poiščite videoposnetek, seznam predvajanja ali kanal in ga prenesite z enim klikom ali pa z desnim klikom na katero koli povezavo na strani
- **Blokator oglasov, ko ga želite** — en klik na ščit blokira oglase in sledilnike na straneh v Razišči

---

## <a id="privacy"></a>🔒 Zasebnost

Prenosi se pridobijo neposredno prek [yt-dlp](https://github.com/yt-dlp/yt-dlp) z YouTuba v mapo, ki jo izberete — nič ne gre prek strežnika tretje osebe. Zgodovina ogledov, zgodovina prenosov, naslovi URL in vsebina datotek ostanejo na vaši napravi.

Brez telemetrije — samo en anonimen signal delovanja na dan: različica aplikacije, OS, jezik, kanal namestitve, država in približno, kako dolgo nazaj je bil Arroxy nameščen, da lahko štejemo aktivne in nove uporabnike. Brez ID-jev, naslovov URL, naslovov videoposnetkov, poti do datotek ali podatkov o računu. Izklopite ga lahko v nastavitvah.

Razišči hrani lastne prijave, ločene od vašega brskalnika, Arroxy pa nikoli ne prebere ali izpolni obrazca za prijavo — vpisujete na strani spletnega mesta samega. Prenosi tečejo odjavljeni; samo kadar kateri spodleti na način, ki ga lahko odpravi račun, Arroxy sveže prebere prijavo, jo za ta prenos shrani v začasno datoteko in datoteko nato izbriše. Z odjavo iz Razišči v nastavitvah se pozabijo.

---

## <a id="faq"></a>❓ Pogosta vprašanja

<details>
<summary><strong>Je res brezplačen?</strong></summary>

Da — licenca GPLv3, brez plačljive različice, brez zaklepanja funkcij.

</details>

<details>
<summary><strong>Po čem se Arroxy razlikuje od drugih grafičnih vmesnikov za yt-dlp?</strong></summary>

Večina brezplačnih grafičnih vmesnikov za yt-dlp so ovoji, ki sprejmejo samo povezavo. Arroxy doda **Razišči**, v aplikacijo vgrajen brskalnik, ki odpre YouTube ali katero koli drugo spletno mesto: brskate in prenašate brez kopiranja povezav, tam pa se enkrat prijavite, da prenesete zasebne videoposnetke, videoposnetke samo za člane in starostno omejene videoposnetke ter svoja seznama Ogled pozneje in Všečkano, brez izvoza piškotkov. Arroxy to prijavo uporabi, ko YouTube zahteva potrditev, da niste bot, njegov vgrajeni brskalnik pa pridobi žeton za prenos YouTuba, da prenosi ne padejo na manj formatov. Glejte [Zakaj Arroxy](#why).

</details>

<details>
<summary><strong>Kakšne kakovosti videoposnetkov lahko prenesem?</strong></summary>

Vse, kar ponuja YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, poleg tega samo zvok. Toki 60 sličic/s in HDR so ohranjeni nespremenjeni, postopni prenos pa omogoča izbiro AV1, VP9 ali H.264 pri vsaki ločljivosti.

</details>

<details>
<summary><strong>Ali lahko izvlečem samo zvok kot MP3?</strong></summary>

Da. V meniju formatov izberite *samo zvok* in izberite MP3, M4A/AAC, Opus ali WAV.

</details>

<details>
<summary><strong>Kako prenesem videoposnetke, ki zahtevajo račun YouTube?</strong></summary>

Enkrat se prijavite na zavihku Razišči. Arroxy nato lahko prenese zasebne videoposnetke in videoposnetke samo za člane, ki jih lahko gleda vaš račun, starostno omejene videoposnetke, če je račun starostno preverjen, ter vaša seznama Ogled pozneje in Všečkano. Prijavo uporabi samo, kadar prenos spodleti na način, ki ga lahko odpravi račun; vse ostalo se prenaša kot prej. To je izbira **Prijava v Razišči**, navedena prva in označena kot Priporočeno v nastavitvah piškotkov, Arroxy pa jo izbere namesto vas, ko prvič odprete Razišči. Wiki za yt-dlp navaja, da [avtomatizacija s prijavo lahko označi račun Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), zato je sekundarni račun varnejša izbira.

</details>

<details>
<summary><strong>Ali bo še vedno deloval, ko YouTube kaj spremeni?</strong></summary>

yt-dlp se ob zagonu samodejno posodobi, Arroxy pa ob spremembah na YouTubu hitro izda popravke. Ko YouTube zahteva potrditev, da niste bot, Arroxy poskusi tudi z vašo prijavo v Razišči, če ste se tam prijavili, v nastavitvah piškotkov pa so na voljo tudi piškotki iz datoteke ali brskalnika.

</details>

<details>
<summary><strong>V katerih jezikih je na voljo Arroxy?</strong></summary>

50 jezikov, takoj po namestitvi: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy ob prvem zagonu samodejno zazna jezik vašega operacijskega sistema, preklopite pa lahko kadar koli z izbirnika jezika v orodni vrstici. JSON jezikov za izvajanje je v src/shared/i18n/locales/, katalogi PO za prevajalce pa v i18n/locales/ — odprite PR na GitHubu in prispevajte.

</details>

<details>
<summary><strong>Ali moram namestiti še kaj drugega?</strong></summary>

Ne. yt-dlp, ffmpeg in ffprobe se samodejno prenesejo ob prvem zagonu in shranijo v predpomnilnik na vašem računalniku. Po tem dodatna nastavitev ni potrebna.

</details>

<details>
<summary><strong>Ali lahko prenesem sezname predvajanja ali cele kanale?</strong></summary>

Da — oboje. Prilepite URL seznama predvajanja ali URL kanala (npr. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); izberite, koliko vnosov naj se pregleda, nato dodajte v vrsto celoten seznam ali izberite določene videoposnetke. Filtri po časovnem obdobju prihajajo kmalu.

</details>

<details>
<summary><strong>macOS pravi „aplikacija je poškodovana“ — kaj naj storim?</strong></summary>

To je macOS Gatekeeper, ki blokira nepodpisano aplikacijo, ne dejanska poškodba. Glejte [Prvi zagon v macOS](#macos-first-launch) za ukaze v terminalu, ki odstranijo karanteno in zaženejo Arroxy.

</details>

<details>
<summary><strong>Je prenašanje videoposnetkov z YouTuba zakonito?</strong></summary>

Za osebno, zasebno uporabo je v večini jurisdikcij na splošno sprejeto. Odgovorni ste za skladnost z YouTubovimi [Pogoji uporabe](https://www.youtube.com/t/terms) in lokalno zakonodajo o avtorskih pravicah.

</details>

---

## <a id="roadmap"></a>🗺️ Načrt razvoja

Še vedno načrtovano — približno po vrstnem redu prednosti:

| Funkcija    | Opis    |
| ---------------- | ---------------- |
| **Filtri za sezname predvajanja in kanale** | Filtri po časovnem obdobju pri naštevanju seznama predvajanja ali kanala |
| **Nastavitve zvočnih posnetkov YouTube** | Nastavite splošno prednostni govorjeni jezik posnetka s preglasitvami po profilih, kadar YouTube ponuja več zvočnih posnetkov |
| **Močnejše obnavljanje po napakah** | Nova pot ponovnega poskusa za prenose, prekinjene zaradi nezanesljivih ali problematičnih internetnih povezav |
| **Celoten upravitelj prenosov** | Pretvorba predala z vrsto v popolnejši upravitelj, vključno s spreminjanjem ciljnih map za elemente v vrsti |
| **Načrtovani prenosi** | Zagon vrste ob določenem času (nočni prenosi) |
| **Paket AUR** | Namestitev v Arch Linux in Omarchy z `yay -S arroxy-bin` |

Imate v mislih funkcijo? [Odprite zahtevo](../../../../issues) — prednosti oblikuje mnenje skupnosti.

---

## <a id="support"></a>💖 Podprite Arroxy

Arroxy je brezplačen in ima licenco GPLv3 — brez oglasov, brez telemetrije, brez plačljive različice. Če vam prihrani čas, lahko razvoj podprete z Bitcoinom, Tronom ali Ethereumom: naslovi so v [DONATE.md](../../DONATE.md), ki je edini uradni vir zanje. Arroxy vam naslova nikoli ne bo poslal po e-pošti ali neposrednem sporočilu. Zvezdica repozitoriju, prijava napak in izboljšanje prevodov pomagajo prav toliko.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Izdelano z

<details>
<summary><strong>Tehnologije</strong></summary>

- **Electron** — medplatformsko namizno ogrodje
- **React 19** + **TypeScript** — uporabniški vmesnik
- **Tailwind CSS v4** — slogi
- **Zustand** — upravljanje stanja
- **yt-dlp** + **ffmpeg** — mehanizem za prenos in multipleksiranje (oba se pridobita med delovanjem: yt-dlp se redno posodablja, ffmpeg/ffprobe pa se namestita enkrat in ostaneta ohranjena med posodobitvami)
- **Vite** + **electron-vite** — orodja za gradnjo
- **Vitest** + **Playwright** — enotni in celoviti testi

</details>

<details>
<summary><strong>Gradnja iz izvorne kode</strong></summary>

### Predpogoji — vse platforme

| Orodje  | Različica | Namestitev |
| ------- | --------- | ---------- |
| Git     | katera koli | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` ali `.node-version` |
| Bun     | 1.4.2  | `mise install` ali `packageManager` v `package.json` |

Priporočeno: namestite `mise` in zaženite `mise install` v kopiji repozitorija. Brez programa mise pred `bun run bootstrap` ročno aktivirajte Node.js iz `.node-version` in Bun iz `package.json`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Za izvirne ponovne gradnje bosta morda potrebna Visual Studio Build Tools in Python.

### macOS

```bash
brew install mise
xcode-select --install
```

Po kloniranju v kopiji repozitorija zaženite `mise trust && mise install`. Če vaša lupina že uporablja `fnm`, `nvm` ali Bun iz Homebrew, v `~/.zshrc` aktivirajte mise, da Arroxy dobi Node.js 24.21.0 in Bun 1.4.2:

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

### Kloniranje in zagon

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Gradnja distribucijskega paketa

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` namesti odvisnosti, znova zgradi odvisnosti aplikacije Electron, preveri Electron, pripravi vdelana ffmpeg/ffprobe za razvoj in namesti Playwright Chromium. Izdajne gradnje yt-dlp, ffmpeg in ffprobe upravljajo med delovanjem v mapi s podatki aplikacije; nobeden od njih ni vsebovan v namestitvenem programu.

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

## 📜 Pogoji uporabe

Arroxy je orodje samo za osebno, zasebno uporabo. Izključno vi ste odgovorni, da so vaši prenosi skladni z YouTubovimi [Pogoji uporabe](https://www.youtube.com/t/terms) in zakoni o avtorskih pravicah vaše jurisdikcije. Arroxy ne uporabljajte za prenos, razmnoževanje ali razširjanje vsebine, ki je nimate pravice uporabljati. Razvijalci ne odgovarjajo za nobeno zlorabo.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Narejeno s skrbjo, <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
