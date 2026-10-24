<div align="center">
  <img src="../../build/social-preview.jpg" alt="Lim inn en lenke, eller bare surf. URL-skjermen og den innebygde nettleseren i Arroxy, med en nedlasting som pågår." width="1200" />

# Arroxy — gratis nedlaster med åpen kildekode for YouTube (+ 2000 nettsteder) med innebygd nettleser, for Windows, macOS og Linux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Les på:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · **Norsk bokmål** · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Utgivelse](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Bygg](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Nettsted](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Lisens](https://img.shields.io/badge/license-GPLv3-blue) ![Plattformer](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Språk](https://img.shields.io/badge/i18n-50_languages-blue)

Last ned videoer, Shorts, kanaler, podkaster eller lydspor fra **YouTube og over 2000 støttede nettsteder** — opptil 8K HDR i 60 fps, som MP3 / AAC / Opus, eller bare den delen du trenger. **Surf på YouTube eller et hvilket som helst annet nettsted rett i Arroxy** i fanen Utforsk, og last ned videoen, spillelisten eller kanalen du er på; logg på der for å laste ned videoer kontoen din allerede kan se. Kjører lokalt på Windows, macOS og Linux. **Ingen reklame, ingen oppblåst programvare, ingen oppsalg.**

[**↓ Installer siste utgivelse**](#install) &nbsp;·&nbsp; [**Nettsted**](https://arroxy.com/) &nbsp;·&nbsp; [Første oppstart på Windows](#windows-first-launch) · [Første oppstart på macOS](#macos-first-launch) · [Første oppstart på Linux](#linux-first-launch)

[![Bli med i Discord-fellesskapet](https://img.shields.io/badge/Bli%20med%20i%20Discord--fellesskapet-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Hvis Arroxy sparer deg tid, hjelper en ⭐ andre med å finne det.

</div>

> **Hva er Arroxy?** Arroxy er et gratis skrivebordsgrensesnitt med åpen kildekode som laster ned videoer, lyd, spillelister og undertekster fra YouTube og over 2000 andre nettsteder som [yt-dlp](https://github.com/yt-dlp/yt-dlp) støtter. Det kjører på Windows 10/11, macOS 13+ (Intel + Apple Silicon) og Linux (AppImage, Flatpak, tar.gz). Lisensiert under GPLv3. Ingen reklame, ingen bruksgrenser. Distribueres via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage og direkte nedlasting.
>
> **Hovedforskjellen: en innebygd nettleser.** De fleste gratis YouTube-nedlastere er tynne yt-dlp-innpakninger: et nettadressefelt og en formatmeny, uten egen nettleser. Arroxy har en, **fanen Utforsk**. Du surfer på YouTube eller et hvilket som helst annet nettsted i appen og laster ned videoen, spillelisten eller kanalen du er på, eller høyreklikker på en lenke. Hvis du logger på én gang i Utforsk, bruker nedlastinger som krever en konto den påloggingen: de private videoene dine, listene dine Se senere og Likte videoer og andre videoer kontoen din allerede kan se, uten eksport av informasjonskapsler. Logg på andre nettsteder der også, så bruker nedlastingene fra dem den påloggingen når de trenger det. Detaljer: [Hvorfor Arroxy](#why-explore).
>
> _Sist oppdatert: 2026-10-24._

> 🌐 Denne oversettelsen er laget med støtte fra KI. [Den engelske README-filen](../../README.md) er den overordnede kilden. Fant du en feil? [Åpne en PR](../../../../pulls).

---

## Innhold

- [✨ Funksjoner](#features)
- [📥 Installasjon og første oppstart](#install)
  - [Første oppstart på Windows](#windows-first-launch)
  - [Første oppstart på macOS](#macos-first-launch)
  - [Hvorfor du kan se en advarsel](#why-warning)
  - [Første oppstart på Linux](#linux-first-launch)
  - [Verifiser nedlastingen (SHA256)](#verify)
- [⚖️ Hvorfor Arroxy](#why)
- [🔒 Personvern](#privacy)
- [❓ Vanlige spørsmål](#faq)
- [🗺️ Veikart](#roadmap)
- [💖 Støtt Arroxy](#support)
- [🛠️ Bygget med](#tech)
- [📜 Bruksvilkår](#terms)

---

## <a id="features"></a>✨ Funksjoner

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/nb/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Utforsk</b><br/>Surf på YouTube eller et hvilket som helst annet nettsted rett i Arroxy, og last ned siden du er på med den aktive profilen din</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Den første skjermen i Utforsk</b><br/>En rask titt på Utforsk, og hvorfor en sekundær konto er den tryggere påloggingen</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Nedlastinger sier fra om hva som trenger deg</b><br/>Lenker klargjøres i bakgrunnen; en som feiler, tilbyr løsningen sin, og en lang spilleliste venter på valget ditt</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/nb/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Last ned bare en del av en video</b><br/>Velg start og slutt, eller et kapittel — Arroxy lagrer bare det området</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/nb/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR i 60 fps</b><br/>Hver oppløsning, kodek og HDR-strøm en video tilbyr, side om side</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/nb/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profilredigering</b><br/>Juster en profil: filtype, oppløsning, undertekster, målmappe, filnavnmal og mer</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/nb/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Mørk eller lys, glass eller solid</b><br/>Fire utseender å velge mellom: glasspaneler over en himmel i bevegelse eller rolige solide flater, hver i mørk og lys variant</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Arroxys globale hurtigtast for nedlasting — Ctrl+Shift+D på Windows og Linux, Cmd+Shift+D på macOS, sender den kopierte lenken rett inn i nedlastingskøen" width="760" /></picture><br/><sub><b>Global hurtigtast for nedlasting</b><br/>Kopier en lenke hvor som helst, trykk én gang — den havner i køen og begynner å laste ned</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/nb/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profiler per spillelisteelement</b><br/>Gi hver video sin egen profil — arkiver noen i 4K, lagre resten som bare lyd</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Startsiden for Hurtignedlasting</b><br/>Lim inn en nettadresse og hent den umiddelbart med den aktive profilen din</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Gjenbrukbare nedlastingsprofiler</b><br/>Lagre format, kvalitet og utdata som forhåndsvalg — gjenbruk per nedlasting</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Flerspråklige lydspor</b><br/>Velg nøyaktig det lydspråket en video kommer med</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround-/Dolby-lyd</b><br/>5.1- og Dolby-spor oppdages og bevares</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Modus for flere nettadresser</b><br/>Lim inn en liste, fjern duplikater automatisk, legg alle i køen på én gang</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/nb/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Parallell nedlastingskø</b><br/>Flere nedlastinger samtidig med fremdrift i sanntid</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Utforsk: surf på nettet rett i Arroxy</strong></summary>

- **Fanen Utforsk** — surf på YouTube eller et hvilket som helst annet nettsted rett i Arroxy, og last ned det du finner uten å kopiere lenker. **Last ned · *profilen din*** legger videoen, spillelisten eller kanalen du ser på i køen; pilen ved siden av bytter profil, og tryllestaven åpner trinn-for-trinn-nedlastingen der du velger formater, undertekster og mer
- **Høyreklikk for å laste ned** — høyreklikk på en video-, spilleliste- eller kanallenke i Utforsk for å laste den ned med profilen din, velge en annen profil under **Last ned med**, åpne trinn-for-trinn-nedlastingen eller kopiere lenken. Du slipper å åpne hver video først
- **Kompakt oppsett** — ett klikk i verktøylinjen i Utforsk flytter fanene i Arroxy dit og gir siden mer plass
- **Adressefelt** — skriv for å søke på YouTube, eller skriv inn en hvilken som helst nettadresse for å åpne det nettstedet
- **Nedlastinger som krever en konto** — logg på én gang i Utforsk, så kan Arroxy laste ned videoer kontoen din kan se: de private videoene dine, videoer med aldersgrense hvis kontoen er aldersverifisert, og listene dine Se senere og Likte videoer. Logg på andre nettsteder der også, så bruker nedlastingene fra dem den påloggingen når de trenger den. Arroxy laster fortsatt ned avlogget først og bruker Utforsk-påloggingen din bare når en nedlasting feiler på en måte en konto kan rette opp
- **Bruk en sekundær konto** — den første skjermen i Utforsk forklarer hvorfor: nedlasting med en konto innebærer en viss risiko for at kontoen blir begrenset. Logg av Utforsk fra innstillingene når du vil at påloggingene dine skal glemmes
- **Annonseblokkerer** — av som standard. Ett klikk på skjoldet i verktøylinjen i Utforsk blokkerer annonser og sporere på sidene der, uten å påvirke nedlastinger. YouTube kan motarbeide annonseblokkere for påloggede kontoer

</details>

<details>
<summary><strong>🎞️ Kvalitet og formater</strong></summary>

- Opptil **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Høy bildefrekvens og HDR** bevart som de er — 60 fps, HDR10
- **Lyd** — eksporter bare lyd som MP3, M4A/AAC, Opus eller WAV. I interaktive nedlastinger kan du velge kildens opprinnelige surround-/Dolby-spor (AC-3, E-AC-3, 5.1, DRC) når de finnes, eller angi en global standard **Foretrekk surround / Dolby**
- **Profiler med et mål** — *Beste bilde* (AV1 · VP9) eller *Smart-TV* (MP4 · H.264), lagret som Auto, MP4, MKV eller WebM uten omkoding. HDR er *Auto* (bare når skjermen din kan vise det), *SDR* eller *HDR*
- **Hver kodek i hver oppløsning** — trinn-for-trinn-nedlastingen viser AV1, VP9 og H.264 side om side i hver oppløsning, slik at du kan velge den TV-en eller redigeringsprogrammet ditt spiller av
- **Vit hva en strøm egentlig er** — størrelser YouTube har oppskalert med KI, KI-dubbede lydspråk, strømmer med økt bitrate, 360°-videoer og skadede kopier eller kopier med vannmerke merkes. Profiler hopper over KI-oppskalerte strømmer med mindre du tillater dem

</details>

<details>
<summary><strong>🛡️ Personvern og kontroll</strong></summary>

- 100 % lokal behandling — nedlastinger går rett fra YouTube til disken din
- **Åpen kildekode** — hver linje kan etterprøves, lisensiert under GPLv3
- Filer lagres rett i mappen du velger

</details>

<details>
<summary><strong>⚡ Arbeidsflyt</strong></summary>

- **Global hurtigtast for nedlasting** — kopier en lenke i en hvilken som helst app og trykk `Ctrl+Shift+D` (`Cmd+Shift+D` på macOS); Arroxy legger den i køen med den aktive profilen din uten å åpne vinduet, og et varsel bekrefter det. På som standard, kan tilordnes på nytt
- **Fleksible startmåter** — velg en veiledet enkeltnedlasting, spilleliste-/kanalvelger, innliming av flere nettadresser, Hurtignedlasting med lagrede standarder, eller surf og last ned fra Utforsk
- **Sentral nedlastingskø** — hver enkeltnedlasting, spilleliste, gruppe eller hurtigjobb havner på ett sted for fremdrift, pause, fortsettelse, avbrytelse, nytt forsøk og prioritering
- **Overvåking av utklippstavlen** — kopier en videolenke, så fyller den ut nettadressefeltet når du kommer tilbake til Arroxy, med **Angre** hvis du ikke mente det. Mens Arroxy er opptatt, venter lenken til du er tilbake i fanen for nettadresser (kan slås av i innstillingene)
- **Automatisk opprydding av nettadresser** — fjerner sporingsparametere (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) og pakker ut `youtube.com/redirect`-lenker
- **Systemstatusfelt-modus** — når du lukker vinduet, fortsetter nedlastingene i bakgrunnen
- **50 språk** — oppdager systemspråket automatisk, kan byttes når som helst
- **Spillelistesynkronisering** — skann en spilleliste på nytt mot en lokal mappe for å hoppe over videoer som allerede er lastet ned; lager en `.m3u`-spillelistefil som oppdateres etter hvert som hver video lastes ned
- **Kontroller for hastighet og tempo** — begrens nedlastingsbåndbredden, angi hvor mange deler av en video som lastes ned samtidig, og legg til forsinkelser mellom forespørsler med forhåndsvalg (*Av · Balansert · Forsiktig · Egendefinert*)
- **Filnavnmaler** — navngi nedlastinger på din måte med `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` og `{playlist_index}`, globalt eller per nedlastingsprofil
- **Samtidige nedlastinger og automatisk nytt forsøk** — velg hvor mange nedlastinger i køen som kjører samtidig, og la Arroxy prøve en nedlasting på nytt som støtte på et nettverks- eller serverproblem, med lengre ventetid før hvert forsøk
- **Profiler per spillelisteelement** — gi hver video i en spilleliste sin egen nedlastingsprofil i stedet for én innstilling for hele listen, slik at du i én omgang kan arkivere noen i full kvalitet og lagre resten som bare lyd
- **Hurtignedlasting jobber i bakgrunnen** — lenken dukker opp i Nedlastinger med en gang og klargjøres der, et varsel med **Vis** bekrefter det, og nettadressefeltet tømmes for neste lenke. Start så mange du vil mens tidligere klargjøres
- **Nedlastinger sier fra om hva som trenger deg** — hvis Arroxy ikke kan lese en lenke, forklarer raden hvorfor og tilbyr løsningen: Prøv på nytt, slå på informasjonskapsler eller logg på i Utforsk. Med informasjonskapsler av prøver **Logg på med Utforsk** på nytt for deg når du er pålogget. En spilleliste som er lengre enn innlastingsgrensen din, venter på raden sin på at du velger hele, de første eller en gjennomgang. Fanen Nedlastinger teller radene som venter på deg
- **Last ned bare en del av en video** — velg start og slutt, eller et kapittel, på Format-skjermen, så lagrer Arroxy bare det området, navngitt med området etter video-ID-en. Kutt havner på nærmeste nøkkelbilde; slå på nøyaktig kutt for å kode om i stedet
- **Fjern fullførte nedlastinger** — valgfritt: en fullført nedlasting forsvinner fra listen 5 sekunder senere. Filene blir liggende på disken, og mislykkede nedlastinger blir stående i listen
- **Størrelse og Mangler i Nedlastinger** — en sorterbar kolonne **Størrelse** viser hvor mye plass hver nedlasting tar, og **Mangler** flagger filer som er flyttet eller slettet utenfor Arroxy
- **Aurora eller Minimal, mørk eller lys** — glasspaneler over en himmel i bevegelse, eller rolige solide flater; bytt fra bunnlinjen. Datamaskiner uten grafikkakselerasjon får Minimal automatisk
- **Menylinjen på Mac** — på macOS kan du åpne innstillinger (`Cmd+,`), angi hastighetsgrensen for nedlasting, bytte stil og tema, og åpne logger eller lagre en diagnosefil fra menylinjen
- **Endre en profil fra en hvilken som helst nedlasting** — juster en nedlasting, og oppdater deretter profilen den startet fra (med en forhåndsvisning av hva som endres) eller lagre innstillingene som en ny profil. Når du bytter profil, spør Arroxy om endringene dine skal beholdes

</details>

<details>
<summary><strong>📝 Undertekster og etterbehandling</strong></summary>

- **Undertekster** i SRT, VTT eller ASS — manuelle eller automatisk genererte, på alle tilgjengelige språk
- Lagre ved siden av videoen, bygg inn i `.mkv`, eller organiser i en undermappe `Subtitles/`
- **Grupper med bare undertekster** — lim inn en liste med nettadresser eller åpne en spilleliste, velg Undertekster, og få bare tekstfilene for hver video
- **SponsorBlock** — hopp over eller kapittelmarker sponsorer, introer, outroer og selvpromotering
- **Innebygd metadata** — tittel, opplastingsdato, kanal, beskrivelse, miniatyrbilde og kapittelmarkører skrives inn i filen

</details>

<details>
<summary><strong>🌐 YouTube + 2000 nettsteder</strong></summary>

- **YouTube, fullt ut** — videoer, Shorts, kanaler, spillelister, YouTube Music og podkaster behandles som førsteklasses kilder
- **Over 2000 andre nettsteder** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable og mange flere
- **Bare lyd og undertekster** fungerer på alle støttede nettsteder, ikke bare YouTube
- Hvis et nettsted endrer seg, leverer yt-dlp rettelser hver uke, og Arroxy oppdaterer binærfilen automatisk ved oppstart

</details>

---

## <a id="install"></a>📥 Installasjon og første oppstart

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

Byggene er bare for x86_64. Mangler du `curl`? Bytt `curl -fsSL` med `wget -qO-`.

| Plattform | Direkte nedlasting |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Alle utgivelsesfiler →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Første oppstart på Windows</strong></summary>

Ved første oppstart kan du se **«Windows har beskyttet PC-en»** eller **«Ukjent utgiver».** Dette gjelder både `Arroxy-win-x64-Setup.exe` og `Arroxy-win-x64-Portable.exe`. Arroxy er gratis og har åpen kildekode, og Windows-byggene er ikke kodesignert med et betalt sertifikat, og derfor flagger SmartScreen dem. Det betyr **ikke** automatisk at Arroxy er utrygt. Slik fortsetter du:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen-dialogen «Windows har beskyttet PC-en» med lenken «Mer informasjon» uthevet" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen-dialogen etter at Mer informasjon er utvidet, med knappen «Kjør likevel»" />
</div>

1. Klikk på **Mer informasjon**.
2. Klikk på **Kjør likevel**.

#### Hvis Windows Defender flagger eller fjerner filen

Heuristikken i Defender flagger noen ganger usignerte NSIS-installasjonsprogrammer og bærbare Electron-apper som mistenkelige. Hvis Defender setter `Arroxy-win-x64-Setup.exe` eller `Arroxy-win-x64-Portable.exe` i karantene, gjenoppretter du den fra **Windows-sikkerhet → Virus- og trusselbeskyttelse → Beskyttelseshistorikk**, og legger deretter Arroxy-programfilen til som et tillatt element under **Administrer innstillinger → Legg til eller fjern ekskluderinger**. Som med SmartScreen er utløseren den manglende utgiversignaturen, ikke påvist skadelig programvare.

> Last bare ned Arroxy fra den offisielle GitHub Releases-siden. Hvis du fikk filen fra et annet nettsted, eller noen sendte den til deg, sletter du den og laster ned en ny kopi fra den offisielle kilden. Kildekoden er offentlig, så du kan undersøke den eller bygge Arroxy selv hvis du foretrekker det.

Foretrekker du Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Første oppstart på macOS</strong></summary>

Arroxys macOS-bygg er ad hoc-signert, men ikke notarisert av Apple, så Gatekeeper blokkerer den første oppstarten med *«Arroxy.app» ble ikke åpnet — Apple kunne ikke bekrefte at «Arroxy.app» er fri for skadelig programvare*. Det betyr at macOS ikke kan sjekke appen hos Apple, ikke at noe er galt med filene. Hvis du installerer med Homebrew, unngår du denne dialogen helt. Hvis du brukte DMG-filen, løser én Terminal-kommando det:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Dra `Arroxy.app` fra den monterte DMG-filen til `/Applications`.
2. Åpne Terminal og kjør disse to kommandoene:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Den første kommandoen fjerner karanteneattributtet macOS la på da filen ble lastet ned; den andre starter appen. Du trenger normalt ikke `sudo`, fordi kopien i `/Applications` tilhører deg — legg det bare til hvis du får en tilgangsfeil.

**Apple Silicon eller Intel:** på en Mac med M-serien (M1 / M2 / M3 / M4) laster du ned `arm64`-DMG-filen. På Intel-Mac-er laster du ned `x64`-DMG-filen. Feil bygg fungerer fortsatt via Rosetta, men er merkbart tregere.

> macOS-byggene lages via CI på Apple Silicon- og Intel-kjørere. Hvis du støter på problemer, [åpne en sak](../../../../issues) — tilbakemeldinger fra macOS-brukere former aktivt testsyklusen for macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Hvorfor du kan se en advarsel</strong></summary>

Arroxy har åpen kildekode og er lisensiert under GPLv3. Windows- og macOS-byggene er **ikke kodesignert** — Apple Developer ID og Windows EV-kodesigneringssertifikater koster hver flere hundre dollar i året, noe et uavhengig prosjekt betaler av egen lomme. Uten disse signaturene advarer Windows SmartScreen og macOS Gatekeeper deg ved første oppstart. Advarslene betyr at *operativsystemet ditt ikke gjenkjenner utgiveren* — de betyr ikke at Arroxy er skadelig programvare.

Tre måter å verifisere Arroxy selv på, med økende grundighet:

- **Les kildekoden.** Hver linje ligger på [GitHub](https://github.com/antonio-orionus/Arroxy), og du kan [bygge den fra kildekode](#tech).
- **Kontroller SHA256.** Sammenlign filen din med den publiserte [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — se [Verifiser nedlastingen](#verify) nedenfor.
- **Kjør en tredjepartsskanning.** Last opp filen til [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Første oppstart på Linux</strong></summary>

AppImage-filer kjører direkte — ingen installasjon. Du må bare merke filen som kjørbar.

**Filbehandler:** høyreklikk på `.AppImage`-filen → **Egenskaper** → **Tillatelser** → slå på **Tillat kjøring av fil som program**, og dobbeltklikk deretter.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Hvis oppstarten fortsatt feiler, kjører du den uten å montere — ingen FUSE-pakke nødvendig:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Valgfri skrivebordsintegrasjon:** installer [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) én gang, så blir hver AppImage du dobbeltklikker på registrert i oppstartsmenyen automatisk — ingen manuell `.desktop`-fil nødvendig.

**Vanlig tarball (ingen FUSE, ingen installasjon):**

`.tar.gz`-bygget er den samme appen uten AppImage-innpakningen — pakk den ut hvor som helst og kjør den. Ingen installasjonsprogram og ingen FUSE-pakke nødvendig.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Linux-nedlastingene på utgivelsessiden er bare for x86_64.** På ARM64-maskiner (Raspberry Pi, Asahi Linux) installeres Flatpak fortsatt, men feiler ved oppstart med `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verifiser nedlastingen (SHA256)</strong></summary>

Hver utgivelse publiserer en `SHA256SUMS`-fil ved siden av binærfilene. For å sjekke at nedlastingen din ikke ble ødelagt eller tuklet med underveis, beregner du hasjen til filen din lokalt og sammenligner den med linjen i `SHA256SUMS`. Åpne siden for siste utgivelse → **Assets** → last ned `SHA256SUMS`.

**Windows (PowerShell eller ledetekst):**

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

Vil du ha en skanning for skadelig programvare fra tredjepart? Last opp filen på [VirusTotal](https://www.virustotal.com). Noen få generiske heuristikkflagg fra mindre motorer er normalt for usignerte Electron-apper; utbredte funn fra store motorer ville vært en reell grunn til bekymring.

</details>

<details>
<summary><strong>📦 Windows: installasjonsprogram eller bærbar</strong></summary>

|               | NSIS-installasjonsprogram | Bærbar `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Installasjon kreves | Ja  | Nei — kjør fra hvor som helst  |
| Automatiske oppdateringer | ✅ i appen  | ❌ manuell nedlasting  |
| Oppstartshastighet | ✅ raskere  | ⚠️ tregere kaldstart  |
| Legges til i Start-menyen |            ✅            |           ❌            |
| Enkel avinstallering |            ✅            | ❌ slett filen  |

**Anbefaling:** bruk NSIS-installasjonsprogrammet for automatiske oppdateringer og raskere oppstart. Bruk den bærbare `.exe`-filen hvis du vil ha et alternativ uten installasjon og uten registeroppføringer.

</details>

---

## <a id="why"></a>⚖️ Hvorfor Arroxy

En side-ved-side-sammenligning med de vanligste alternativene:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Innebygd nettleser (surf, logg på, last ned) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Videoer kontoen din selv kan se, uten å eksportere informasjonskapsler |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratis, uten betalt nivå |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Åpen kildekode |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Bare lokal behandling |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Ingen bruksgrenser |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Plattformuavhengig skrivebordsapp |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Undertekster + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = delvis, eller bare i et betalt nivå. Innloggingen i appen for private videoer i 4K Video Downloader er en betalt funksjon; de fleste gratis yt-dlp-grensesnitt godtar bare en informasjonskapselfil eller leser informasjonskapslene fra nettleseren din.

Arroxy er bygget for én ting: en ren lokal fil, enten du limer inn en nettadresse eller finner videoen i Utforsk. Ingen oppsalg, ingen datainnsamling.

### <a id="why-explore"></a>🧭 Det en enkel yt-dlp-innpakning ikke kan: fanen Utforsk

De fleste gratis YouTube-nedlastere er et nettadressefelt oppå yt-dlp. Arroxy bruker også yt-dlp, men har i tillegg **Utforsk**, en nettleser bygget inn i appen som åpner YouTube eller et hvilket som helst annet nettsted. Utforsk gir det et nettadressefelt ikke kan:

- **Videoer kontoen din kan se, uten å eksportere informasjonskapsler** — de private videoene dine, listene dine Se senere og Likte videoer, videoer med aldersgrense på en aldersverifisert konto og sider på andre nettsteder som krever pålogging. En enkel innpakning trenger en cookies.txt-eksport eller leser informasjonskapslene fra nettleseren din. I Arroxy logger du på én gang i Utforsk, så tar appen seg av resten
- **Ingen kopiering av lenker** — finn en video, spilleliste eller kanal i Utforsk og last den ned med ett klikk, eller høyreklikk på en hvilken som helst lenke på siden
- **Annonseblokkerer når du vil ha den** — ett klikk på skjoldet blokkerer annonser og sporere på sidene i Utforsk

---

## <a id="privacy"></a>🔒 Personvern

Nedlastinger hentes direkte via [yt-dlp](https://github.com/yt-dlp/yt-dlp) fra YouTube til mappen du velger — ingenting rutes via en tredjepartsserver. Visningshistorikk, nedlastingshistorikk, nettadresser og filinnhold blir på enheten din.

**No tracking.** Arroxy sends only anonymous reports that help us count users and fix problems — never your links, videos, files or accounts. You control them in Settings.

Explore keeps its own sign-ins, separate from your browser, and you always sign in on the site's own page. A download uses a sign-in only for that site, reads it fresh and deletes its copy afterwards. Signing out of Explore in Settings forgets them.

---

## <a id="faq"></a>❓ Vanlige spørsmål

<details>
<summary><strong>Er det virkelig gratis?</strong></summary>

Ja — lisensiert under GPLv3, uten betalt nivå og uten funksjonsbegrensninger.

</details>

<details>
<summary><strong>Hvordan skiller Arroxy seg fra andre yt-dlp-grensesnitt?</strong></summary>

De fleste gratis yt-dlp-grensesnitt er innpakninger som bare tar imot en lenke. Arroxy legger til **Utforsk**, en nettleser bygget inn i appen som åpner YouTube eller et hvilket som helst annet nettsted: du surfer og laster ned uten å kopiere lenker, og du logger på der én gang for å laste ned videoer kontoen din kan se, som de private videoene dine og listene dine Se senere og Likte videoer, uten eksport av informasjonskapsler. Se [Hvorfor Arroxy](#why).

</details>

<details>
<summary><strong>Hvilke videokvaliteter kan jeg laste ned?</strong></summary>

Alt YouTube leverer: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, pluss bare lyd. Strømmer med 60 fps og HDR bevares som de er, og trinn-for-trinn-nedlastingen lar deg velge AV1, VP9 eller H.264 i hver oppløsning.

</details>

<details>
<summary><strong>Kan jeg hente ut bare lyden som MP3?</strong></summary>

Ja. Velg *bare lyd* i formatmenyen og velg MP3, M4A/AAC, Opus eller WAV.

</details>

<details>
<summary><strong>Hvordan laster jeg ned videoer som krever en YouTube-konto?</strong></summary>

Logg på én gang i fanen Utforsk. Arroxy kan da laste ned videoer kontoen din kan se: de private videoene dine, videoer med aldersgrense hvis kontoen er aldersverifisert, og listene dine Se senere og Likte videoer. Den bruker påloggingen bare når en nedlasting feiler på en måte en konto kan rette opp; alt annet lastes ned som før. Dette er valget **Utforsk-pålogging**, oppført først og merket Anbefalt i innstillingene for informasjonskapsler, og Arroxy velger det for deg første gang du åpner Utforsk. Wikien til yt-dlp påpeker at [automatisering med pålogging kan føre til at en Google-konto flagges](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), så en sekundær konto er det tryggere valget.

</details>

<details>
<summary><strong>Vil det fortsette å fungere når YouTube endrer noe?</strong></summary>

yt-dlp oppdateres automatisk ved oppstart, og Arroxy leverer rettelser raskt når YouTube endrer noe. Når en nedlasting krever pålogging, bruker Arroxy Utforsk-påloggingen din hvis du har logget på der, og informasjonskapsler fra en fil eller nettleseren din er tilgjengelige i innstillingene for informasjonskapsler.

</details>

<details>
<summary><strong>Hvilke språk er Arroxy tilgjengelig på?</strong></summary>

50 språk, rett ut av boksen: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy oppdager språket i operativsystemet ditt automatisk ved første oppstart, og du kan bytte når som helst fra språkvelgeren i verktøylinjen. JSON-filene for språk under kjøring ligger i src/shared/i18n/locales/, og PO-katalogene for oversettere ligger i i18n/locales/ — åpne en PR på GitHub for å bidra.

</details>

<details>
<summary><strong>Må jeg installere noe annet?</strong></summary>

Nei. yt-dlp, ffmpeg og ffprobe lastes ned automatisk ved første oppstart og bufres på maskinen din. Etter det trengs ikke noe ekstra oppsett.

</details>

<details>
<summary><strong>Kan jeg laste ned spillelister eller hele kanaler?</strong></summary>

Ja — begge deler. Lim inn en spilleliste-URL eller en kanal-URL (f.eks. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); velg hvor mange oppføringer som skal skannes, og legg deretter hele listen i køen eller velg bestemte videoer. Filtre for datoområde kommer snart.

</details>

<details>
<summary><strong>macOS sier at «appen er skadet» — hva gjør jeg?</strong></summary>

Det er macOS Gatekeeper som blokkerer en usignert app, ikke faktisk skade. Se [første oppstart på macOS](#macos-first-launch) for Terminal-kommandoene som fjerner karantenen og starter Arroxy.

</details>

<details>
<summary><strong>Er det lovlig å laste ned YouTube-videoer?</strong></summary>

Det avhenger av landet ditt og av hva du laster ned. Last bare ned innhold du eier, innhold som er lisensiert for nedlasting, eller innhold loven i landet ditt lar deg kopiere. Du er selv ansvarlig for å overholde YouTubes [bruksvilkår](https://www.youtube.com/t/terms) og de lokale opphavsrettslovene. Se [Bruksvilkår](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ Veikart

Fortsatt planlagt — omtrent i prioritert rekkefølge:

| Funksjon    | Beskrivelse    |
| ---------------- | ---------------- |
| **Spilleliste- og kanalfiltre** | Filtre for datoområde når en spilleliste eller kanal listes opp |
| **Preferanser for YouTube-lydspor** | Angi en preferanse for talespråk i hele appen, med overstyringer per profil når YouTube tilbyr flere lydspor |
| **Sterkere gjenoppretting ved nytt forsøk** | En ny gjenopprettingsløype for nedlastinger som avbrytes av upålitelige eller problematiske internettforbindelser |
| **Full nedlastingsbehandler som panel** | Gjør køpanelet om til en fyldigere behandler, inkludert endring av målmapper for elementer i køen |
| **Planlagte nedlastinger** | Start en kø til et bestemt tidspunkt (kjøringer over natten) |
| **AUR-pakke** | Installer på Arch Linux og Omarchy med `yay -S arroxy-bin` |

Har du en funksjon i tankene? [Åpne en forespørsel](../../../../issues) — innspill fra fellesskapet former prioriteringen.

---

## <a id="support"></a>💖 Støtt Arroxy

Arroxy er gratis og lisensiert under GPLv3 — ingen reklame, ingen sporing, ingen betalt nivå. Hvis det sparer deg tid, kan du støtte utviklingen med Bitcoin, Tron eller Ethereum: adressene står i [DONATE.md](../../DONATE.md), som er den eneste offisielle kilden til dem. Arroxy vil aldri sende deg en adresse på e-post eller direktemelding. Å gi repoet en stjerne, rapportere feil og forbedre oversettelser hjelper like mye.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Bygget med

<details>
<summary><strong>Teknologi</strong></summary>

- **Electron** — plattformuavhengig skrivebordsskall
- **React 19** + **TypeScript** — brukergrensesnitt
- **Tailwind CSS v4** — stiling
- **Zustand** — tilstandshåndtering
- **yt-dlp** + **ffmpeg** — nedlastings- og muxing-motor (begge hentes under kjøring: yt-dlp holdes oppdatert, ffmpeg/ffprobe installeres én gang og beholdes på tvers av oppdateringer)
- **Vite** + **electron-vite** — byggeverktøy
- **Vitest** + **Playwright** — enhetstester og ende-til-ende-tester

</details>

<details>
<summary><strong>Bygg fra kildekode</strong></summary>

### Forutsetninger – alle plattformer

| Verktøy | Versjon | Installasjon |
| ------- | ------- | ------- |
| Git     | alle    | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` eller `.node-version` |
| Bun     | 1.4.2  | `mise install` eller `package.json` `packageManager` |

Anbefalt: installer `mise`, og kjør deretter `mise install` i det utsjekkede prosjektet. Uten mise må du aktivere Node.js fra `.node-version` og Bun fra `package.json` manuelt før `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools og Python kan være nødvendig for native ombygginger.

### macOS

```bash
brew install mise
xcode-select --install
```

Etter kloning kjører du `mise trust && mise install` fra det utsjekkede prosjektet. Hvis skallet ditt allerede bruker `fnm`, `nvm` eller en Bun fra Homebrew, aktiverer du mise i `~/.zshrc` slik at Arroxy får Node.js 24.21.0 og Bun 1.4.2:

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

### Klon og kjør

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Bygg en distribuerbar pakke

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` installerer avhengigheter, bygger Electron-appens avhengigheter på nytt, verifiserer Electron, klargjør innebygd ffmpeg/ffprobe for utvikling og installerer Playwright Chromium. Utgivelsesbygg håndterer yt-dlp, ffmpeg og ffprobe under kjøring i appdatamappen din; ingen av dem følger med i installasjonsprogrammet.

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

## <a id="terms"></a>📜 Bruksvilkår

Arroxy er et verktøy kun for personlig, privat bruk. Du er alene ansvarlig for at nedlastingene dine overholder YouTubes [bruksvilkår](https://www.youtube.com/t/terms) og opphavsrettslovene i din jurisdiksjon. Ikke bruk Arroxy til å laste ned, gjengi eller distribuere innhold du ikke har rett til å bruke. Utviklerne er ikke ansvarlige for misbruk.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Laget med omtanke av <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
