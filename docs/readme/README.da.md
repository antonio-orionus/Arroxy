<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy-maskot" width="180" />

# Arroxy — gratis open source-downloader til YouTube (+ 2000 websteder) med indbygget browser, til Windows, macOS og Linux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Læs på:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · **Dansk** · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Udgivelse](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Websted](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licens](https://img.shields.io/badge/license-GPLv3-blue) ![Platforme](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Sprog](https://img.shields.io/badge/i18n-50_languages-blue)

Download videoer, Shorts, kanaler, podcasts eller lydspor fra **YouTube og over 2000 understøttede websteder** — op til 8K HDR ved 60 fps, som MP3 / AAC / Opus eller bare den del, du har brug for. **Surf på YouTube eller et hvilket som helst andet websted direkte i Arroxy** under fanen Udforsk, og download den video, afspilningsliste eller kanal, du er på; log ind der for at downloade videoer, som din egen konto allerede kan se. Kører lokalt på Windows, macOS og Linux. **Ingen reklamer, ingen oppustet software, ingen mersalg.**

[**↓ Installer seneste udgivelse**](#install) &nbsp;·&nbsp; [**Websted**](https://arroxy.com/) &nbsp;·&nbsp; [Første start på Windows](#windows-first-launch) · [Første start på macOS](#macos-first-launch) · [Første start på Linux](#linux-first-launch)

[![Deltag i Discord-fællesskabet](https://img.shields.io/badge/Deltag%20i%20Discord--f%C3%A6llesskabet-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Hvis Arroxy sparer dig tid, hjælper en ⭐ andre med at finde den.

</div>

> **Hvad er Arroxy?** Arroxy er en gratis open source-grænseflade til computeren, der downloader videoer, lyd, afspilningslister og undertekster fra YouTube og over 2000 andre websteder, som [yt-dlp](https://github.com/yt-dlp/yt-dlp) understøtter. Den kører på Windows 10/11, macOS 13+ (Intel + Apple Silicon) og Linux (AppImage, Flatpak, tar.gz). Licenseret under GPLv3. Ingen reklamer, ingen brugsgrænser. Distribueres via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage og direkte download.
>
> **Den afgørende forskel: en indbygget browser.** De fleste gratis YouTube-downloadere er tynde yt-dlp-indpakninger: et URL-felt og en formatmenu uden en browser af deres egen. Arroxy har en, **fanen Udforsk**. Du surfer på YouTube eller et hvilket som helst andet websted i appen og downloader den video, afspilningsliste eller kanal, du er på, eller højreklikker på et vilkårligt link. Hvis du logger ind én gang i Udforsk, bruger downloads, der kræver en konto, det login: dine private videoer, dine lister Se senere og Synes godt om og andre videoer, som din konto allerede kan se, uden cookie-eksport. Log også ind på andre websteder der, så bruger deres downloads det login, når de har brug for det. Se [Hvorfor Arroxy](#why-explore).
>
> _Sidst opdateret: 2026-10-23._

> 🌐 Denne oversættelse er lavet med hjælp fra AI. [Den engelske README](../../README.md) er den gældende kilde. Fundet en fejl? [Åbn en PR](../../../../pulls).

---

## Indhold

- [✨ Funktioner](#features)
- [📥 Installation og første start](#install)
  - [Første start på Windows](#windows-first-launch)
  - [Første start på macOS](#macos-first-launch)
  - [Hvorfor du kan se en advarsel](#why-warning)
  - [Første start på Linux](#linux-first-launch)
  - [Verificér dit download (SHA256)](#verify)
- [⚖️ Hvorfor Arroxy](#why)
- [🔒 Privatliv](#privacy)
- [❓ Ofte stillede spørgsmål](#faq)
- [🗺️ Køreplan](#roadmap)
- [💖 Støt Arroxy](#support)
- [🛠️ Bygget med](#tech)
- [📜 Brugsvilkår](#terms)

---

## <a id="features"></a>✨ Funktioner

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/da/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Udforsk</b><br/>Surf på YouTube eller et hvilket som helst andet websted i Arroxy, og download den side, du er på, med din aktive profil</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Udforsks første skærmbillede</b><br/>Et hurtigt kig på Udforsk og hvorfor en sekundær konto er det sikreste login</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Downloads fortæller, hvad der har brug for dig</b><br/>Links klargøres i baggrunden; et mislykket link tilbyder sin løsning, en lang afspilningsliste venter på dit valg</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/da/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Download kun en del af en video</b><br/>Vælg en start og slut eller et kapitel — Arroxy gemmer kun det interval</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/da/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR ved 60 fps</b><br/>Alle opløsninger, codecs og HDR-streams, en video tilbyder, side om side</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/da/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profileditor</b><br/>Justér en profil: filtype, opløsning, undertekster, mål, skabelon til filnavne og mere</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/da/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Mørk eller lys, glas eller solid</b><br/>Fire udseender at vælge imellem: glaspaneler over en bevægelig himmel eller rolige solide flader, hver i mørk og lys</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Arroxys globale genvejstast til download — Ctrl+Shift+D på Windows og Linux, Cmd+Shift+D på macOS, sender det kopierede link direkte ind i downloadkøen" width="760" /></picture><br/><sub><b>Global genvejstast til download</b><br/>Kopiér et link et vilkårligt sted, tryk én gang — det havner i køen og begynder at downloade</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/da/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profiler pr. element i afspilningslister</b><br/>Giv hver video sin egen profil — arkivér nogle i 4K, gem resten som kun lyd</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Startsiden i Hurtig download</b><br/>Indsæt en URL, og hent den med det samme med din aktive profil</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Genbrugelige downloadprofiler</b><br/>Gem format, kvalitet og output som forudindstillinger — genbrug dem pr. download</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Flersprogede lydspor</b><br/>Vælg præcis det lydsprog, en video leveres med</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround- / Dolby-lyd</b><br/>5.1- og Dolby-spor registreres og bevares</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Bulk-URL-tilstand</b><br/>Indsæt en liste, fjern dubletter automatisk, og sæt alle i kø på én gang</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/da/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Parallel downloadkø</b><br/>Flere downloads på én gang med live fremskridt</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Udforsk: surf på nettet i Arroxy</strong></summary>

- **Fanen Udforsk** — surf på YouTube eller et hvilket som helst andet websted i Arroxy, og download det, du finder, uden at kopiere links. **Download · *din profil*** sætter den video, afspilningsliste eller kanal, du kigger på, i kø; pilen ved siden af skifter profil, og tryllestaven åbner trin-for-trin-downloadet, hvor du kan vælge formater, undertekster og mere
- **Højreklik for at downloade** — højreklik på et video-, afspilningslisten- eller kanallink i Udforsk for at downloade det med din profil, vælge en anden profil under **Download med**, åbne trin-for-trin-downloadet eller kopiere linket. Du behøver ikke åbne hver video først
- **Kompakt layout** — ét klik på Udforsks værktøjslinje flytter Arroxys faner derind og giver siden mere plads
- **Adresselinje** — skriv for at søge på YouTube, eller indtast en vilkårlig webadresse for at åbne det websted
- **Downloads, der kræver en konto** — log ind én gang i Udforsk, og Arroxy kan downloade videoer, som din konto kan se: dine private videoer, aldersbegrænsede videoer, hvis kontoen er aldersverificeret, og dine lister Se senere og Synes godt om. Log også ind på andre websteder der, så bruger deres downloads det login, når de har brug for det. Arroxy downloader stadig først uden at være logget ind og bruger kun dit login i Udforsk, når et download fejler på en måde, som en konto kan rette
- **Brug en sekundær konto** — Udforsks første skærmbillede forklarer hvorfor: at downloade med en konto indebærer en vis risiko for, at kontoen bliver begrænset. Log ud af Udforsk under Indstillinger, når du vil glemme dine logins
- **Reklameblokering** — slået fra som standard. Ét klik på skjoldet på Udforsks værktøjslinje blokerer reklamer og sporing på dens sider uden at påvirke downloads. YouTube kan modarbejde reklameblokkere for konti, der er logget ind

</details>

<details>
<summary><strong>🎞️ Kvalitet og formater</strong></summary>

- Op til **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Høj billedfrekvens og HDR** bevares uændret — 60 fps, HDR10
- **Lyd** — eksportér kun lyd som MP3, M4A/AAC, Opus eller WAV. I interaktive downloads kan du vælge kildens originale surround/Dolby-spor (AC-3, E-AC-3, 5.1, DRC), når de findes, eller angive en global standard med **Foretræk surround / Dolby**
- **Profiler med et mål** — *Bedste billede* (AV1 · VP9) eller *Smart TV* (MP4 · H.264), gemt som Auto, MP4, MKV eller WebM uden genkodning. HDR er *Auto* (kun når din skærm kan vise det), *SDR* eller *HDR*
- **Alle codecs ved alle opløsninger** — trin-for-trin-downloadet viser AV1, VP9 og H.264 side om side ved hver opløsning, så du kan vælge den, dit tv eller redigeringsprogram afspiller
- **Vid, hvad en stream egentlig er** — størrelser, YouTube har opskaleret med AI, AI-dubbede lydsprog, streams med forbedret bitrate, 360°-videoer og beskadigede kopier eller kopier med vandmærke er markeret. Profiler springer AI-opskalerede streams over, medmindre du tillader dem

</details>

<details>
<summary><strong>🛡️ Privatliv og kontrol</strong></summary>

- 100 % lokal behandling — downloads går direkte fra YouTube til din disk
- **Open source** — hver eneste linje kan gennemses, GPLv3-licenseret
- Filer gemmes direkte i den mappe, du vælger

</details>

<details>
<summary><strong>⚡ Arbejdsgang</strong></summary>

- **Global genvejstast til download** — kopiér et link i en hvilken som helst app, og tryk på `Ctrl+Shift+D` (`Cmd+Shift+D` på macOS); Arroxy sætter det i kø med din aktive profil uden at åbne vinduet, og en meddelelse bekræfter det. Slået til som standard, kan tilpasses
- **Fleksible startmåder** — vælg et guidet enkelt download, udvælgelse af afspilningsliste/kanal, indsættelse af flere URL'er på én gang, Hurtig download med gemte standarder, eller surf og download fra Udforsk
- **Central downloadkø** — hvert enkelt-, afspilningslistes-, bulk- eller hurtigjob havner ét sted med fremskridt samt styring af pause, genoptagelse, annullering, nyt forsøg og prioritet
- **Overvågning af udklipsholder** — kopiér et videolink, så udfyldes URL-feltet, når du vender tilbage til Arroxy, med **Fortryd**, hvis du ikke mente det. Mens Arroxy er optaget, venter linket, til du er tilbage på URL-fanen (slå det fra under Indstillinger)
- **Automatisk oprydning af URL'er** — fjerner sporingsparametre (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) og pakker `youtube.com/redirect`-links ud
- **Systembakketilstand** — når du lukker vinduet, kører downloads videre i baggrunden
- **50 sprog** — registrerer automatisk systemets sprog, kan skiftes når som helst
- **Synkronisering af afspilningslister** — scan en afspilningsliste igen mod en lokal mappe for at springe allerede downloadede videoer over; opretter en `.m3u`-afspilningslistefil, der opdateres, efterhånden som hver video downloades
- **Kontrol af hastighed og tempo** — begræns downloadbåndbredden, angiv hvor mange dele af en video der downloades samtidig, og tilføj forsinkelser mellem anmodninger med forudindstillinger (*Fra · Afbalanceret · Forsigtig · Tilpasset*)
- **Skabeloner til filnavne** — navngiv downloads, som du vil, med `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` og `{playlist_index}`, globalt eller pr. downloadprofil
- **Downloads ad gangen og automatisk nyt forsøg** — vælg, hvor mange downloads i køen der kører samtidig, og lad Arroxy prøve igen med et download, der ramte et netværks- eller serverproblem, med længere ventetid før hvert forsøg
- **Profiler pr. element i afspilningslister** — giv hver video i en afspilningsliste sin egen downloadprofil i stedet for én indstilling til hele listen, så du i én omgang kan arkivere nogle i fuld kvalitet og gemme resten som kun lyd
- **Hurtig download virker i baggrunden** — linket dukker straks op i Downloads og klargøres dér, en note med **Vis** bekræfter det, og URL-feltet ryddes til næste link. Start så mange, du vil, mens tidligere klargøres
- **Downloads fortæller, hvad der har brug for dig** — hvis Arroxy ikke kan læse et link, fortæller rækken hvorfor og tilbyder løsningen: Prøv igen, slå cookies til, eller log ind i Udforsk. Med cookies slået fra prøver **Log ind i Udforsk** igen for dig, når du er logget ind. En afspilningsliste, der er længere end din indlæsningsgrænse, venter på sin række på, at du vælger hele listen, de første eller en gennemgang. Fanen Downloads tæller de rækker, der venter på dig
- **Download kun en del af en video** — vælg en start og slut eller et kapitel på formatskærmen, så gemmer Arroxy kun det interval, navngivet med intervallet efter video-id'et. Klip lander på det nærmeste keyframe; slå præcist klip til for i stedet at genkode
- **Fjern færdige downloads** — valgfrit: et færdigt download forlader listen 5 sekunder senere. Filerne bliver på disken, og mislykkede downloads bliver på listen
- **Størrelse og Mangler i Downloads** — en kolonne **Størrelse**, der kan sorteres, viser, hvor meget plads hvert download fylder, og **Mangler** markerer filer, der er flyttet eller slettet uden for Arroxy
- **Aurora eller Minimal, mørk eller lys** — glaspaneler over en bevægelig himmel eller rolige solide flader; skift fra sidefoden. Computere uden grafikacceleration får automatisk Minimal
- **Menulinjen på Mac** — på macOS kan du åbne Indstillinger (`Cmd+,`), angive grænsen for downloadhastighed, skifte stil og tema og åbne logfiler eller gemme en diagnosticeringsfil fra menulinjen
- **Skift en profil fra et hvilket som helst download** — justér et download, og opdater derefter den profil, det startede fra (med en forhåndsvisning af, hvad der ændres), eller gem indstillingerne som en ny profil. Når du skifter profil, bliver du spurgt, om du vil beholde dine ændringer

</details>

<details>
<summary><strong>📝 Undertekster og efterbehandling</strong></summary>

- **Undertekster** i SRT, VTT eller ASS — manuelle eller automatisk genererede, på alle tilgængelige sprog
- Gem ved siden af videoen, indlejr i `.mkv`, eller organisér i en undermappe `Subtitles/`
- **Partier med kun undertekster** — indsæt en liste med URL'er, eller åbn en afspilningsliste, vælg Undertekster, og få kun undertekstfilerne til hver video
- **SponsorBlock** — spring sponsorer, intros, outros og selvpromovering over, eller markér dem som kapitler
- **Indlejret metadata** — titel, uploaddato, kanal, beskrivelse, miniature og kapitelmarkeringer skrives ind i filen

</details>

<details>
<summary><strong>🌐 YouTube + 2000 websteder</strong></summary>

- **YouTube i sin helhed** — Videoer, Shorts, kanaler, afspilningslister, YouTube Music og podcasts håndteres som førsteklasses kilder
- **Over 2000 andre websteder** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable og mange flere
- **Kun lyd og undertekster** virker på alle understøttede websteder, ikke kun YouTube
- Hvis et websted ændrer sig, udgiver yt-dlp rettelser hver uge, og Arroxy opdaterer automatisk binærfilen ved start

</details>

---

## <a id="install"></a>📥 Installation og første start

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

Builds findes kun til x86_64. Ingen `curl`? Skift `curl -fsSL` ud med `wget -qO-`.

| Platform | Direkte download |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Alle udgivelsesfiler →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Første start på Windows</strong></summary>

Ved første start kan du se **»Windows har beskyttet din pc«** eller **»Ukendt udgiver«.** Det gælder både `Arroxy-win-x64-Setup.exe` og `Arroxy-win-x64-Portable.exe`. Arroxy er gratis og open source, og Windows-buildene er ikke kodesignerede med et betalt certifikat, hvilket er grunden til, at SmartScreen markerer dem. Det betyder **ikke** automatisk, at Arroxy er usikker. Sådan fortsætter du:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen-dialogen »Windows har beskyttet din pc« med linket »Flere oplysninger« fremhævet" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen-dialogen efter udvidelse af Flere oplysninger, med knappen »Kør alligevel«" />
</div>

1. Klik på **Flere oplysninger**.
2. Klik på **Kør alligevel**.

#### Hvis Windows Defender markerer eller fjerner filen

Heuristikker i Defender markerer nogle gange usignerede NSIS-installationsprogrammer og bærbare Electron-programmer som mistænkelige. Hvis Defender sætter `Arroxy-win-x64-Setup.exe` eller `Arroxy-win-x64-Portable.exe` i karantæne, så gendan den fra **Windows-sikkerhed → Beskyttelse mod virus og trusler → Beskyttelseshistorik**, og tilføj derefter Arroxys programfil som tilladt element under **Administrer indstillinger → Tilføj eller fjern udeladelser**. Ligesom med SmartScreen er udløseren den manglende udgiversignatur, ikke fundet malware.

> Download kun Arroxy fra den officielle GitHub Releases-side. Hvis du har fået filen fra et andet websted, eller nogen har sendt den til dig, så slet den, og download en ny kopi fra den officielle kilde. Kildekoden er offentlig, så du kan gennemse den eller bygge Arroxy selv, hvis du foretrækker det.

Foretrækker du Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Første start på macOS</strong></summary>

Arroxys macOS-builds er ad hoc-signerede, men ikke notariseret af Apple, så Gatekeeper blokerer den første start med *»Arroxy.app« blev ikke åbnet — Apple kunne ikke bekræfte, at »Arroxy.app« er fri for skadelig software*. Det betyder, at macOS ikke kan kontrollere appen hos Apple, ikke at der er noget galt med filerne. Hvis du installerer med Homebrew, undgår du helt denne dialog. Hvis du brugte DMG'en, fjerner én Terminal-kommando den:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Træk `Arroxy.app` fra den monterede DMG ind i `/Applications`.
2. Åbn Terminal, og kør disse to kommandoer:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Den første kommando fjerner den karantæneattribut, som macOS tilføjede, da filen blev downloadet; den anden starter appen. Du behøver normalt ikke `sudo`, fordi kopien i `/Applications` tilhører dig — tilføj den kun, hvis du får en fejl om tilladelser.

**Apple Silicon vs. Intel:** på en Mac med M-serien (M1 / M2 / M3 / M4) skal du downloade `arm64`-DMG'en. På Intel-Mac'er skal du downloade `x64`-DMG'en. Hvis du kører den forkerte build, virker det stadig via Rosetta, men mærkbart langsommere.

> macOS-builds produceres via CI på Apple Silicon- og Intel-runners. Hvis du løber ind i problemer, så [opret et issue](../../../../issues) — feedback fra macOS-brugere former aktivt macOS-testforløbet.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Hvorfor du kan se en advarsel</strong></summary>

Arroxy er open source og GPLv3-licenseret. Windows- og macOS-buildene er **ikke kodesignerede** — Apple Developer ID og Windows EV-kodesigneringscertifikater koster hver især hundredvis af dollars om året, som et indieprojekt betaler af egen lomme. Uden disse signaturer advarer Windows SmartScreen og macOS Gatekeeper dig ved første start. Advarslerne betyder, at *dit OS ikke genkender udgiveren* — de betyder ikke, at Arroxy er malware.

Tre måder at verificere Arroxy på selv, i stigende grad af grundighed:

- **Læs kildekoden.** Hver eneste linje ligger på [GitHub](https://github.com/antonio-orionus/Arroxy), og du kan [bygge den fra kildekode](#tech).
- **Kontrollér SHA256.** Sammenlign din fil med de offentliggjorte [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — se [Verificér dit download](#verify) nedenfor.
- **Kør en scanning hos tredjepart.** Upload filen til [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Første start på Linux</strong></summary>

AppImages kører direkte — ingen installation. Du skal blot markere filen som eksekverbar.

**Filhåndtering:** højreklik på `.AppImage` → **Egenskaber** → **Tilladelser** → slå **Tillad at udføre fil som program** til, og dobbeltklik derefter.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Hvis starten stadig fejler, så kør den uden at montere — ingen FUSE-pakke nødvendig:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Valgfri skrivebordsintegration:** installer [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) én gang, så bliver enhver AppImage, du dobbeltklikker på, automatisk registreret i din startmenu — ingen manuel `.desktop`-fil nødvendig.

**Almindelig tarball (ingen FUSE, ingen installation):**

`.tar.gz`-buildet er den samme app uden AppImage-indpakningen — udpak det hvor som helst, og kør det. Intet installationsprogram og ingen FUSE-pakke nødvendig.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Linux-downloads på udgivelsessiden findes kun til x86_64.** På ARM64-maskiner (Raspberry Pi, Asahi Linux) installeres Flatpak stadig, men fejler derefter ved start med `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verificér dit download (SHA256)</strong></summary>

Hver udgivelse offentliggør en `SHA256SUMS`-fil ved siden af binærfilerne. For at kontrollere, at dit download ikke blev beskadiget eller manipuleret undervejs, skal du beregne hashen af din fil lokalt og sammenligne den med linjen i `SHA256SUMS`. Åbn siden med den seneste udgivelse → **Assets** → download `SHA256SUMS`.

**Windows (PowerShell eller Kommandoprompt):**

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

Vil du have en malwarescanning hos tredjepart? Upload filen til [VirusTotal](https://www.virustotal.com). Et par generiske heuristiske markeringer fra mindre motorer er normalt for usignerede Electron-apps; udbredte registreringer fra store motorer ville være en reel bekymring.

</details>

<details>
<summary><strong>📦 Windows: installationsprogram vs. bærbar</strong></summary>

|               | NSIS-installationsprogram | Bærbar `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Kræver installation | Ja  | Nej — kør hvor som helst  |
| Automatiske opdateringer | ✅ i appen  | ❌ manuelt download  |
| Starthastighed | ✅ hurtigere  | ⚠️ langsommere koldstart  |
| Føjes til Start-menuen |            ✅            |           ❌            |
| Nem afinstallering |            ✅            | ❌ slet filen  |

**Anbefaling:** brug NSIS-installationsprogrammet for automatiske opdateringer og hurtigere start. Brug den bærbare `.exe` til en løsning uden installation og uden registreringsdatabase.

</details>

---

## <a id="why"></a>⚖️ Hvorfor Arroxy

En sammenligning side om side med de mest almindelige alternativer:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Indbygget browser (surf, log ind, download) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Videoer, som din egen konto kan se, uden at eksportere cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratis, intet premium-niveau |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Kun lokal behandling |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Ingen brugsgrænser |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Desktop-app på tværs af platforme |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Undertekster + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = delvist eller kun på et betalt niveau. Indlogning i appen til private videoer i 4K Video Downloader er en betalt funktion; de fleste gratis yt-dlp-grænseflader accepterer kun en cookiefil eller læser din webbrowsers cookies.

Arroxy er bygget til én ting: en ren lokal fil, uanset om du indsætter en URL eller finder videoen i Udforsk. Intet mersalg, ingen dataindsamling.

### <a id="why-explore"></a>🧭 Det, en almindelig yt-dlp-indpakning ikke kan: fanen Udforsk

De fleste gratis YouTube-downloadere er et URL-felt oven på yt-dlp. Arroxy bruger også yt-dlp, men har desuden **Udforsk**, en browser indbygget i appen, der åbner YouTube eller et hvilket som helst andet websted. Udforsk tilføjer det, som et URL-felt ikke kan:

- **Videoer, som din konto kan se, uden at eksportere cookies** — dine private videoer, dine lister Se senere og Synes godt om, aldersbegrænsede videoer på en aldersverificeret konto og sider på andre websteder, der kræver dit login. En almindelig indpakning kræver en cookies.txt-eksport eller læser din webbrowsers cookies. I Arroxy logger du ind én gang i Udforsk, og resten klarer den selv
- **Ingen kopiering af links** — find en video, afspilningsliste eller kanal i Udforsk, og download den med ét klik, eller højreklik på et vilkårligt link på siden
- **Reklameblokering, når du vil have den** — ét klik på skjoldet blokerer reklamer og sporing på Udforsks sider

---

## <a id="privacy"></a>🔒 Privatliv

Downloads hentes direkte via [yt-dlp](https://github.com/yt-dlp/yt-dlp) fra YouTube til den mappe, du vælger — intet sendes via en tredjepartsserver. Visningshistorik, downloadhistorik, URL'er og filindhold bliver på din enhed.

**No tracking.** Arroxy sends only anonymous reports that help us count users and fix problems — never your links, videos, files or accounts. You control them in Settings.

Explore keeps its own sign-ins, separate from your browser, and you always sign in on the site's own page. A download uses a sign-in only for that site, reads it fresh and deletes its copy afterwards. Signing out of Explore in Settings forgets them.

---

## <a id="faq"></a>❓ Ofte stillede spørgsmål

<details>
<summary><strong>Er det virkelig gratis?</strong></summary>

Ja — GPLv3-licenseret, intet premium-niveau, ingen låste funktioner.

</details>

<details>
<summary><strong>Hvordan adskiller Arroxy sig fra andre yt-dlp-grænseflader?</strong></summary>

De fleste gratis yt-dlp-grænseflader er indpakninger, der kun tager et link. Arroxy tilføjer **Udforsk**, en browser indbygget i appen, der åbner YouTube eller et hvilket som helst andet websted: du surfer og downloader uden at kopiere links, og du logger ind der én gang for at downloade videoer, som din konto kan se, f.eks. dine private videoer og dine lister Se senere og Synes godt om, uden cookie-eksport. Se [Hvorfor Arroxy](#why).

</details>

<details>
<summary><strong>Hvilke videokvaliteter kan jeg downloade?</strong></summary>

Alt, hvad YouTube leverer: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p samt kun lyd. 60 fps- og HDR-streams bevares uændret, og trin-for-trin-downloadet lader dig vælge AV1, VP9 eller H.264 ved hver opløsning.

</details>

<details>
<summary><strong>Kan jeg udtrække kun lyden som MP3?</strong></summary>

Ja. Vælg *kun lyd* i formatmenuen, og vælg MP3, M4A/AAC, Opus eller WAV.

</details>

<details>
<summary><strong>Hvordan downloader jeg videoer, der kræver en YouTube-konto?</strong></summary>

Log ind én gang under fanen Udforsk. Arroxy kan derefter downloade videoer, som din konto kan se: dine private videoer, aldersbegrænsede videoer, hvis kontoen er aldersverificeret, og dine lister Se senere og Synes godt om. Den bruger kun loginet, når et download fejler på en måde, som en konto kan rette; alt andet downloades som før. Det er valget **Login i Udforsk**, som står først og er markeret Anbefalet i cookieindstillingerne, og Arroxy vælger det for dig, første gang du åbner Udforsk. yt-dlp's wiki bemærker, at [automatisering med login kan få en Google-konto markeret](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), så en sekundær konto er det sikreste valg.

</details>

<details>
<summary><strong>Vil det blive ved med at virke, når YouTube ændrer noget?</strong></summary>

yt-dlp opdateres automatisk ved start, og Arroxy udgiver hurtigt rettelser, når YouTube ændrer noget. Når et download kræver et login, bruger Arroxy dit login i Udforsk, hvis du har logget ind der, og cookies fra en fil eller din browser findes i cookieindstillingerne.

</details>

<details>
<summary><strong>Hvilke sprog findes Arroxy på?</strong></summary>

50 sprog, klar til brug: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy registrerer automatisk dit operativsystems sprog ved første start, og du kan til enhver tid skifte i sprogvælgeren på værktøjslinjen. JSON-filerne med sprogene under kørsel ligger i src/shared/i18n/locales/, og PO-kataloger til oversættere ligger i i18n/locales/ — åbn en PR på GitHub for at bidrage.

</details>

<details>
<summary><strong>Skal jeg installere andet?</strong></summary>

Nej. yt-dlp, ffmpeg og ffprobe downloades automatisk ved første start og gemmes på din maskine. Derefter er ingen yderligere opsætning nødvendig.

</details>

<details>
<summary><strong>Kan jeg downloade afspilningslister eller hele kanaler?</strong></summary>

Ja — begge dele. Indsæt en URL til en afspilningsliste eller en kanal (f.eks. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); vælg, hvor mange elementer der skal scannes, og sæt derefter hele listen i kø, eller vælg bestemte videoer. Filtre efter datointerval kommer snart.

</details>

<details>
<summary><strong>macOS siger, at »appen er beskadiget« — hvad gør jeg?</strong></summary>

Det er macOS Gatekeeper, der blokerer en usigneret app, ikke en egentlig skade. Se [Første start på macOS](#macos-first-launch) for Terminal-kommandoerne, der fjerner karantænen og starter Arroxy.

</details>

<details>
<summary><strong>Er det lovligt at downloade YouTube-videoer?</strong></summary>

Det afhænger af dit land og af, hvad du downloader. Download kun indhold, du ejer, indhold, der er licenseret til download, eller indhold, som loven i dit land lader dig kopiere. Du er ansvarlig for at overholde YouTubes [servicevilkår](https://www.youtube.com/t/terms) og din lokale ophavsretslovgivning. Se [Brugsvilkår](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ Køreplan

Stadig planlagt — nogenlunde i prioriteret rækkefølge:

| Funktion    | Beskrivelse    |
| ---------------- | ---------------- |
| **Filtre til afspilningslister og kanaler** | Filtre efter datointerval, når en afspilningsliste eller kanal opregnes |
| **Præferencer for YouTube-lydspor** | Angiv en præference for talt sprog i hele appen, med tilsidesættelser pr. profil, når YouTube tilbyder flere lydspor |
| **Stærkere gendannelse ved nyt forsøg** | En ny sti til nyt forsøg for downloads, der afbrydes af upålidelige eller problematiske internetforbindelser |
| **Fuld downloadstyring i skuffen** | Gør køskuffen til en mere komplet styring, herunder ændring af målmapper for elementer i køen |
| **Planlagte downloads** | Start en kø på et bestemt tidspunkt (kørsler om natten) |
| **AUR-pakke** | Installer på Arch Linux og Omarchy med `yay -S arroxy-bin` |

Har du en funktion i tankerne? [Opret en anmodning](../../../../issues) — input fra fællesskabet er med til at afgøre prioriteten.

---

## <a id="support"></a>💖 Støt Arroxy

Arroxy er gratis og GPLv3-licenseret — ingen reklamer, ingen sporing, intet betalt niveau. Hvis den sparer dig tid, kan du støtte udviklingen med Bitcoin, Tron eller Ethereum: adresserne står i [DONATE.md](../../DONATE.md), som er den eneste officielle kilde til dem. Arroxy vil aldrig sende dig en adresse via e-mail eller direkte besked. At give repoet en stjerne, rapportere fejl og forbedre oversættelser hjælper lige så meget.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Bygget med

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — desktop-skal på tværs af platforme
- **React 19** + **TypeScript** — brugerflade
- **Tailwind CSS v4** — styling
- **Zustand** — tilstandshåndtering
- **yt-dlp** + **ffmpeg** — download- og mux-motor (begge hentes under kørsel: yt-dlp holdes opdateret, ffmpeg/ffprobe installeres én gang og bevares på tværs af opdateringer)
- **Vite** + **electron-vite** — byggeværktøjer
- **Vitest** + **Playwright** — enheds- og end-to-end-tests

</details>

<details>
<summary><strong>Byg fra kildekode</strong></summary>

### Forudsætninger — alle platforme

| Værktøj | Version | Installation |
| ------- | ------- | ------- |
| Git     | enhver  | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` eller `.node-version` |
| Bun     | 1.4.2  | `mise install` eller `package.json` `packageManager` |

Anbefalet: installer `mise`, og kør derefter `mise install` i checkouten. Uden mise skal du manuelt aktivere Node.js fra `.node-version` og Bun fra `package.json` før `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools og Python kan være nødvendige til native genopbygninger.

### macOS

```bash
brew install mise
xcode-select --install
```

Når du har klonet, så kør `mise trust && mise install` fra checkouten. Hvis din shell allerede bruger `fnm`, `nvm` eller en Homebrew-Bun, så aktivér mise i `~/.zshrc`, så Arroxy får Node.js 24.21.0 og Bun 1.4.2:

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

### Klon og kør

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Byg en distribuerbar pakke

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` installerer afhængigheder, genopbygger Electron-appens afhængigheder, verificerer Electron, klargør indlejret ffmpeg/ffprobe til udvikling og installerer Playwright Chromium. Release-builds administrerer yt-dlp, ffmpeg og ffprobe under kørsel i din apps datamappe; ingen af dem følger med i installationsprogrammet.

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

## <a id="terms"></a>📜 Brugsvilkår

Arroxy er et værktøj udelukkende til personlig, privat brug. Du er alene ansvarlig for at sikre, at dine downloads overholder YouTubes [servicevilkår](https://www.youtube.com/t/terms) og ophavsretslovgivningen i dit retssystem. Brug ikke Arroxy til at downloade, gengive eller distribuere indhold, du ikke har ret til at bruge. Udviklerne er ikke ansvarlige for misbrug.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Lavet med omhu af <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
