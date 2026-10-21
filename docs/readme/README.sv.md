<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy-maskot" width="180" />

# Arroxy — gratis hämtare med öppen källkod för YouTube (+ 2 000 webbplatser) med inbyggd webbläsare, för Windows, macOS och Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Läs på:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · **Svenska** · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Version](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Bygge](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Webbplats](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licens](https://img.shields.io/badge/license-GPLv3-blue) ![Plattformar](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Språk](https://img.shields.io/badge/i18n-50_languages-blue)

Hämta videor, Shorts, musik, kanaler, poddar eller ljudspår från **YouTube och över 2 000 webbplatser som stöds** — upp till 8K HDR i 60 fps, som MP3 / AAC / Opus, eller bara den del du behöver. **Surfa på YouTube eller någon annan webbplats direkt i Arroxy** på fliken Utforska och hämta videon, spellistan eller kanalen du befinner dig på; logga in där för att hämta privata videor, videor för medlemmar och åldersbegränsade videor som ditt konto får se. Körs lokalt på Windows, macOS och Linux. **Ingen reklam, ingen onödig kod, ingen merförsäljning.**

[**↓ Installera senaste versionen**](#install) &nbsp;·&nbsp; [**Webbplats**](https://arroxy.com/) &nbsp;·&nbsp; [Första start i Windows](#windows-first-launch) · [Första start på macOS](#macos-first-launch) · [Första start på Linux](#linux-first-launch)

[![Gå med i Discord-communityn](https://img.shields.io/badge/G%C3%A5%20med%20i%20Discord%2Dcommunityn-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Om Arroxy sparar tid åt dig hjälper en ⭐ andra att hitta det.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). GPLv3 licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-21._

> 🌐 Den här översättningen har tagits fram med hjälp av AI. Den [engelska README-filen](../../README.md) är den överordnade källan. Hittat ett fel? [Öppna en PR](../../../../pulls).

---

## Innehåll

- [✨ Funktioner](#features)
- [📥 Installation och första start](#install)
  - [Första start i Windows](#windows-first-launch)
  - [Första start på macOS](#macos-first-launch)
  - [Varför du kan se en varning](#why-warning)
  - [Första start på Linux](#linux-first-launch)
  - [Verifiera din hämtning (SHA256)](#verify)
- [⚖️ Varför Arroxy](#why)
- [🔒 Integritet](#privacy)
- [❓ Vanliga frågor](#faq)
- [🗺️ Färdplan](#roadmap)
- [💖 Stöd Arroxy](#support)
- [🛠️ Byggt med](#tech)

---

## <a id="features"></a>✨ Funktioner

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sv/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Utforska</b><br/>Surfa på YouTube eller någon annan webbplats i Arroxy och hämta sidan du befinner dig på med din aktiva profil</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Utforskas första skärm</b><br/>En snabb titt på Utforska, och varför ett sekundärt konto är den säkrare inloggningen</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Hämtningar visar vad som behöver dig</b><br/>Länkar förbereds i bakgrunden; en som misslyckats erbjuder sin åtgärd, en lång spellista väntar på ditt val</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sv/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Hämta bara en del av en video</b><br/>Välj en start och ett slut, eller ett kapitel — Arroxy sparar bara det intervallet</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sv/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR i 60 fps</b><br/>Varje upplösning, codec och HDR-ström som en video erbjuder, sida vid sida</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sv/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profilredigerare</b><br/>Justera en profil: filtyp, upplösning, undertexter, mål, filnamnsmall och mer</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sv/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Mörkt eller ljust, glas eller solid</b><br/>Fyra utseenden att välja bland: glaspaneler över en rörlig himmel eller lugna solida ytor, vart och ett i mörkt och ljust</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Arroxys globala kortkommando för hämtning — Ctrl+Shift+D i Windows och Linux, Cmd+Shift+D i macOS, skickar den kopierade länken direkt till hämtningskön" width="760" /></picture><br/><sub><b>Globalt kortkommando för hämtning</b><br/>Kopiera en länk var som helst, tryck en gång — den hamnar i kön och börjar hämtas</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/sv/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profiler per spellisteobjekt</b><br/>Ge varje video sin egen profil — arkivera vissa i 4K, hämta resten som MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Startsida för snabbhämtning</b><br/>Klistra in en webbadress och hämta direkt med din aktiva profil</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Återanvändbara hämtningsprofiler</b><br/>Spara förinställningar för format, kvalitet och utdata — återanvänd per hämtning</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Ljudspår på flera språk</b><br/>Välj exakt det ljudspråk som videon levereras med</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround-/Dolby-ljud</b><br/>5.1- och Dolby-spår identifieras och bevaras</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Läge för flera webbadresser</b><br/>Klistra in en lista, ta bort dubbletter automatiskt och köa alla på en gång</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/sv/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Parallell hämtningskö</b><br/>Flera hämtningar samtidigt med förlopp i realtid</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Utforska: surfa på webben i Arroxy</strong></summary>

- **Fliken Utforska** — surfa på YouTube eller någon annan webbplats i Arroxy och hämta det du hittar utan att kopiera länkar. **Hämta · *din profil*** köar videon, spellistan eller kanalen du tittar på; pilen intill byter profil, och trollspöet öppnar den stegvisa hämtningen där du väljer format, undertexter och mer
- **Högerklicka för att hämta** — högerklicka på valfri video-, spellist- eller kanallänk i Utforska för att hämta den med din profil, välja en annan profil under **Hämta med**, öppna den stegvisa hämtningen eller kopiera länken. Du behöver inte öppna varje video först
- **Kompakt layout** — ett klick i Utforskas verktygsfält flyttar Arroxys flikar dit och ger sidan mer utrymme
- **Adressfält** — skriv för att söka på YouTube, eller ange valfri webbadress för att öppna den webbplatsen
- **Hämtningar som kräver ett konto** — logga in en gång i Utforska så kan Arroxy hämta privata videor och videor för medlemmar som ditt konto får se, åldersbegränsade videor om kontot är åldersverifierat, samt dina listor Titta senare och Gillade. Logga in på andra webbplatser där också, så använder deras hämtningar den inloggningen när de behöver den. Arroxy hämtar fortfarande utloggat först och använder din inloggning i Utforska bara när en hämtning misslyckas på ett sätt som ett konto kan åtgärda. När YouTube ber dig bekräfta att du inte är en robot provar Arroxy också din inloggning i Utforska
- **Använd ett sekundärt konto** — Utforskas första skärm förklarar varför: att hämta med ett konto innebär en viss risk att kontot begränsas. Logga ut från Utforska i Inställningar när du vill glömma dina inloggningar
- **Annonsblockerare** — av som standard. Ett klick på skölden i Utforskas verktygsfält blockerar annonser och spårare på dess sidor, utan att påverka hämtningar. YouTube kan göra motstånd mot annonsblockerare för inloggade konton

</details>

<details>
<summary><strong>🎞️ Kvalitet och format</strong></summary>

- Upp till **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Hög bildfrekvens och HDR** bevaras som de är — 60 fps, HDR10
- **Ljud** — exportera endast ljud som MP3, M4A/AAC, Opus eller WAV. Vid interaktiva hämtningar kan du välja källans egna surround-/Dolby-spår (AC-3, E-AC-3, 5.1, DRC) när de finns, eller ange ett globalt standardval för **Föredra surround / Dolby**
- **Profiler med ett mål** — *Bästa bild* (AV1 · VP9) eller *Smart TV* (MP4 · H.264), sparade som Auto, MP4, MKV eller WebM utan omkodning. HDR är *Auto* (bara när din skärm kan visa det), *SDR* eller *HDR*
- **Alla codecs vid alla upplösningar** — den stegvisa hämtningen listar AV1, VP9 och H.264 sida vid sida vid varje upplösning, så att du kan välja den som din tv eller ditt redigeringsprogram spelar upp
- **Se vad en ström egentligen är** — storlekar som YouTube skalat upp med AI, AI-dubbade ljudspråk, strömmar med förbättrad bithastighet, 360°-videor samt skadade eller vattenstämplade kopior markeras. Profiler hoppar över AI-uppskalade strömmar om du inte tillåter dem

</details>

<details>
<summary><strong>🛡️ Integritet och kontroll</strong></summary>

- 100 % lokal bearbetning — hämtningar går direkt från YouTube till din disk
- **Öppen källkod** — varje rad kan granskas, licensierad under GPLv3
- Filer sparas direkt i mappen du väljer

</details>

<details>
<summary><strong>⚡ Arbetsflöde</strong></summary>

- **Globalt kortkommando för hämtning** — kopiera en länk i vilken app som helst och tryck på `Ctrl+Shift+D` (`Cmd+Shift+D` på macOS); Arroxy köar den med din aktiva profil utan att öppna fönstret, och en avisering bekräftar det. På som standard, kan ändras
- **Flexibla startlägen** — välj en guidad enskild hämtning, spellistans/kanalens väljare, inklistring av flera webbadresser, snabbhämtning med sparade standardvärden, eller surfa och hämta från Utforska
- **Central hämtningskö** — varje enskilt, spellists-, flerwebbadress- eller snabbjobb hamnar på ett ställe för förlopp, paus, återupptagning, avbrott, nytt försök och prioritetskontroll
- **Bevakning av Urklipp** — kopiera en videolänk så fylls webbadressfältet i när du kommer tillbaka till Arroxy, med **Ångra** om du inte menade det. Medan Arroxy är upptaget väntar länken tills du är tillbaka på fliken för webbadresser (stäng av det i Inställningar)
- **Automatisk rensning av webbadresser** — tar bort spårningsparametrar (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) och packar upp `youtube.com/redirect`-länkar
- **Systemfältsläge** — om du stänger fönstret fortsätter hämtningarna i bakgrunden
- **50 språk** — identifierar systemets språk automatiskt, kan bytas när som helst
- **Spellistesynkronisering** — skanna en spellista mot en lokal mapp för att hoppa över redan hämtade videor; skapar en `.m3u`-spellistefil som uppdateras allteftersom varje video hämtas
- **Kontroll av hastighet och tempo** — begränsa bandbredden, ange hur många delar av en video som hämtas samtidigt och lägg till fördröjningar mellan förfrågningar med förinställningar (*Av · Balanserad · Försiktig · Anpassad*)
- **Filnamnsmallar** — namnge hämtningar på ditt sätt med `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` och `{playlist_index}`, globalt eller per hämtningsprofil
- **Samtidiga hämtningar och automatiska nya försök** — välj hur många köade hämtningar som körs samtidigt, och låt Arroxy försöka igen med en hämtning som drabbats av ett nätverks- eller serverproblem, med längre väntetid före varje försök
- **Profiler per spellisteobjekt** — tilldela varje video i en spellista en egen hämtningsprofil i stället för en inställning för hela listan, så att du i ett svep kan arkivera vissa i full kvalitet och hämta resten som MP3
- **Snabbhämtning fungerar i bakgrunden** — länken dyker upp i Hämtningar direkt och förbereds där, en notis med **Visa** bekräftar det och webbadressfältet töms för nästa länk. Starta så många du vill medan tidigare förbereds
- **Hämtningar visar vad som behöver dig** — om Arroxy inte kan läsa en länk förklarar raden varför och erbjuder åtgärden: Försök igen, slå på cookies eller logga in i Utforska. Med cookies avstängda försöker **Logga in med Utforska** igen åt dig när du har loggat in. En spellista som är längre än din inläsningsgräns väntar på sin rad på att du väljer allt, de första eller en granskning. Fliken Hämtningar räknar raderna som väntar på dig
- **Hämta bara en del av en video** — välj en start och ett slut, eller ett kapitel, på formatskärmen så sparar Arroxy bara det intervallet, med intervallet i filnamnet efter video-id:t. Klippen hamnar på närmaste nyckelbild; slå på exakt klipp för att koda om i stället
- **Ta bort slutförda hämtningar** — valfritt: en slutförd hämtning försvinner från listan 5 sekunder senare. Dess filer finns kvar på disken, och misslyckade hämtningar förblir listade
- **Storlek och Saknas i Hämtningar** — en sorterbar kolumn **Storlek** visar hur mycket utrymme varje hämtning tar, och **Saknas** flaggar filer som flyttats eller tagits bort utanför Arroxy
- **Aurora eller Minimal, mörkt eller ljust** — glaspaneler över en rörlig himmel, eller lugna solida ytor; växla från sidfoten. Datorer utan grafikacceleration får automatiskt Minimal
- **Menyrad på Mac** — på macOS öppnar du Inställningar (`Cmd+,`), anger hastighetsgräns för hämtning, byter stil och tema samt öppnar loggar eller sparar en diagnostikfil från menyraden
- **Ändra en profil från valfri hämtning** — justera en hämtning och uppdatera sedan profilen den startade från (med en förhandsvisning av vad som ändras) eller spara inställningarna som en ny profil. När du byter profil frågar Arroxy om dina ändringar ska behållas

</details>

<details>
<summary><strong>📝 Undertexter och efterbearbetning</strong></summary>

- **Undertexter** i SRT, VTT eller ASS — manuella eller automatiskt genererade, på alla tillgängliga språk
- Spara bredvid videon, bädda in i `.mkv` eller organisera i en undermapp `Subtitles/`
- **Batchar med endast undertexter** — klistra in en lista med webbadresser eller öppna en spellista, välj Undertexter och få bara textfilerna för varje video
- **SponsorBlock** — hoppa över eller kapitelmarkera sponsorer, intron, outron och egenreklam
- **Inbäddad metadata** — titel, uppladdningsdatum, kanal, beskrivning, miniatyr och kapitelmarkeringar skrivs in i filen

</details>

<details>
<summary><strong>🌐 YouTube + 2 000 webbplatser</strong></summary>

- **YouTube, fullt ut** — Videor, Shorts, kanaler, spellistor, YouTube Music och poddar hanteras som förstklassiga källor
- **Över 2 000 andra webbplatser** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable och många fler
- **Endast ljud och undertexter** fungerar på alla webbplatser som stöds, inte bara YouTube
- Om en webbplats ändras levererar yt-dlp korrigeringar varje vecka och Arroxy uppdaterar binärfilen automatiskt vid start

</details>

---

## <a id="install"></a>📥 Installation och första start

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

Byggen finns bara för x86_64. Ingen `curl`? Byt `curl -fsSL` mot `wget -qO-`.

| Plattform | Direkthämtning |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Alla filer i versionen →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Första start i Windows</strong></summary>

Vid första start kan du se **”Windows skyddade datorn”** eller **”Okänd utgivare”.** Det gäller både `Arroxy-win-x64-Setup.exe` och `Arroxy-win-x64-Portable.exe`. Arroxy är gratis och har öppen källkod, och Windows-byggena är inte kodsignerade med ett betalt certifikat, vilket är därför SmartScreen flaggar dem. Det betyder **inte** automatiskt att Arroxy är osäkert. Så här fortsätter du:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen-dialogrutan ”Windows skyddade datorn” med länken ”Mer information” markerad" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen-dialogrutan efter att Mer information har expanderats, med knappen ”Kör ändå”" />
</div>

1. Klicka på **Mer information**.
2. Klicka på **Kör ändå**.

#### Om Windows Defender flaggar eller tar bort filen

Defenders heuristik flaggar ibland osignerade NSIS-installationsprogram och portabla Electron-appar som misstänkta. Om Defender sätter `Arroxy-win-x64-Setup.exe` eller `Arroxy-win-x64-Portable.exe` i karantän, återställ den från **Windows-säkerhet → Virus- och hotskydd → Skyddshistorik** och lägg sedan till Arroxys körbara fil som ett tillåtet objekt under **Hantera inställningar → Lägg till eller ta bort undantag**. Precis som med SmartScreen beror det på den saknade utgivarsignaturen, inte på upptäckt skadlig kod.

> Hämta bara Arroxy från den officiella sidan GitHub Releases. Om du fick filen från en annan webbplats eller någon skickade den till dig, ta bort den och hämta en ny kopia från den officiella källan. Källkoden är offentlig, så du kan granska den eller bygga Arroxy själv om du föredrar det.

Föredrar du Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Första start på macOS</strong></summary>

Arroxys macOS-byggen är ad hoc-signerade men inte notariserade av Apple, så Gatekeeper blockerar första starten med *”Arroxy.app” har inte öppnats — Apple kunde inte verifiera att ”Arroxy.app” är fri från skadlig kod*. Det betyder att macOS inte kan kontrollera appen hos Apple, inte att något är fel på filerna. Om du installerar med Homebrew slipper du den här dialogrutan helt. Om du använde DMG-filen löser ett Terminal-kommando det:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Dra `Arroxy.app` från den monterade DMG-filen till `/Applications`.
2. Öppna Terminal och kör de här två kommandona:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Det första kommandot tar bort karantänattributet som macOS satte när filen hämtades; det andra startar appen. Du behöver normalt inte `sudo`, eftersom kopian i `/Applications` tillhör dig — lägg bara till det om du får ett behörighetsfel.

**Apple Silicon eller Intel:** på en Mac med M-serien (M1 / M2 / M3 / M4) hämtar du DMG-filen `arm64`. På Intel-Mac hämtar du DMG-filen `x64`. Att köra fel bygge fungerar via Rosetta men är märkbart långsammare.

> macOS-byggen produceras via CI på Apple Silicon- och Intel-körare. Om du stöter på problem, [öppna ett ärende](../../../../issues) — synpunkter från macOS-användare formar aktivt macOS-testcykeln.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Varför du kan se en varning</strong></summary>

Arroxy har öppen källkod och är licensierat under GPLv3. Windows- och macOS-byggena är **inte kodsignerade** — Apple Developer ID och Windows EV-kodsigneringscertifikat kostar vart och ett hundratals dollar om året, vilket ett indieprojekt betalar ur egen ficka. Utan de signaturerna varnar Windows SmartScreen och macOS Gatekeeper dig vid första start. Varningarna betyder att *ditt operativsystem inte känner igen utgivaren* — de betyder inte att Arroxy är skadlig kod.

Tre sätt att verifiera Arroxy själv, med stigande noggrannhet:

- **Läs källkoden.** Varje rad finns på [GitHub](https://github.com/antonio-orionus/Arroxy) och du kan [bygga den från källkod](#tech).
- **Kontrollera SHA256.** Jämför din fil med den publicerade [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — se [Verifiera din hämtning](#verify) nedan.
- **Kör en tredjepartsskanning.** Ladda upp filen till [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Första start på Linux</strong></summary>

AppImage-filer körs direkt — ingen installation. Du behöver bara markera filen som körbar.

**Filhanterare:** högerklicka på `.AppImage` → **Egenskaper** → **Behörigheter** → aktivera **Tillåt körning av filen som program** och dubbelklicka sedan.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Om starten fortfarande misslyckas, kör den utan montering — inget FUSE-paket behövs:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Valfri skrivbordsintegrering:** installera [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) en gång, så registreras varje AppImage du dubbelklickar på automatiskt i din startmeny — ingen manuell `.desktop`-fil behövs.

**Vanligt tarball-arkiv (inget FUSE, ingen installation):**

Bygget `.tar.gz` är samma app utan AppImage-omslaget — packa upp det var som helst och kör det. Inget installationsprogram och inget FUSE-paket behövs.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Linux-filerna på versionssidan finns bara för x86_64.** På ARM64-datorer (Raspberry Pi, Asahi Linux) installeras Flatpak ändå, men misslyckas vid start med `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verifiera din hämtning (SHA256)</strong></summary>

Varje version publicerar en `SHA256SUMS`-fil tillsammans med binärfilerna. För att kontrollera att din hämtade fil inte skadades eller manipulerades under överföringen beräknar du en hash av filen lokalt och jämför med raden i `SHA256SUMS`. Öppna sidan för den senaste versionen → **Assets** → hämta `SHA256SUMS`.

**Windows (PowerShell eller Kommandotolken):**

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

Vill du ha en skanning efter skadlig kod från tredje part? Ladda upp filen på [VirusTotal](https://www.virustotal.com). Ett fåtal generiska heuristikflaggor från mindre motorer är normalt för osignerade Electron-appar; utbredda träffar från stora motorer vore ett verkligt orosmoment.

</details>

<details>
<summary><strong>📦 Windows: installationsprogram eller portabel</strong></summary>

|               | NSIS-installationsprogram | Portabel `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Installation krävs | Ja  | Nej — kör var som helst  |
| Automatiska uppdateringar | ✅ i appen  | ❌ manuell hämtning  |
| Starthastighet | ✅ snabbare  | ⚠️ långsammare kallstart  |
| Läggs till i Start-menyn |            ✅            |           ❌            |
| Enkel avinstallation |            ✅            | ❌ ta bort filen  |

**Rekommendation:** använd NSIS-installationsprogrammet för automatiska uppdateringar och snabbare start. Använd den portabla `.exe`-filen om du vill slippa installation och registerändringar.

</details>

---

## <a id="why"></a>⚖️ Varför Arroxy

En jämförelse sida vid sida med de vanligaste alternativen:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Inbyggd webbläsare (surfa, logga in, hämta) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Privata videor, videor för medlemmar och åldersbegränsade videor utan att exportera cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratis, ingen premiumnivå |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Öppen källkod |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Endast lokal bearbetning |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Inga användningsgränser |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Plattformsoberoende skrivbordsapp |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Undertexter + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = delvis, eller bara på en betalnivå. 4K Video Downloaders inloggning i appen för privata videor är en betalfunktion; de flesta gratis gränssnitt för yt-dlp accepterar bara en cookiefil eller läser cookies från din webbläsare.

Arroxy är byggt för en enda sak: en ren lokal fil, oavsett om du klistrar in en webbadress eller hittar videon i Utforska. Ingen merförsäljning, ingen datainsamling.

### <a id="why-explore"></a>🧭 Vad ett enkelt yt-dlp-omslag inte kan: fliken Utforska

De flesta gratis YouTube-hämtare är en webbadressruta ovanpå yt-dlp. Arroxy använder också yt-dlp, men har dessutom **Utforska**, en webbläsare inbyggd i appen som öppnar YouTube eller någon annan webbplats. Utforska tar sig förbi begränsningar som en webbadressruta inte klarar:

- **Videor som kräver ett konto, utan att exportera cookies** — privata videor, videor för medlemmar och åldersbegränsade videor (på ett åldersverifierat konto), plus dina listor Titta senare och Gillade, och videor bakom en inloggning på andra webbplatser. Ett enkelt omslag kräver en exporterad cookies.txt eller måste läsa cookies från din webbläsare, vilket Chrome i Windows numera blockerar. I Arroxy loggar du in en gång i Utforska så sköter det resten
- **”Logga in för att bekräfta att du inte är en robot”** — när YouTube frågar det försöker Arroxy hämta igen med din inloggning i Utforska i stället för att misslyckas
- **YouTubes hämtningstoken** — Arroxys inbyggda webbläsare hämtar den token som YouTube förväntar sig före en hämtning. Utan den kan YouTube erbjuda färre format och lägre kvalitet än du bad om
- **Inget kopierande av länkar** — hitta en video, spellista eller kanal i Utforska och hämta den med ett klick, eller högerklicka på valfri länk på sidan
- **Annonsblockerare när du vill ha den** — ett klick på skölden blockerar annonser och spårare på Utforskas sidor

---

## <a id="privacy"></a>🔒 Integritet

Hämtningar görs direkt via [yt-dlp](https://github.com/yt-dlp/yt-dlp) från YouTube till mappen du väljer — inget dirigeras via en tredjepartsserver. Visningshistorik, hämtningshistorik, webbadresser och filinnehåll stannar på din enhet.

Ingen telemetri — bara en anonym hjärtslagssignal om dagen: appversion, operativsystem, språk, installationskanal, land och ungefär hur länge sedan Arroxy installerades, så att vi kan räkna aktiva och nya användare. Inga ID:n, webbadresser, videotitlar, filsökvägar eller kontouppgifter. Du kan stänga av den i Inställningar.

Utforska har sina egna inloggningar, skilda från din webbläsare, och Arroxy läser eller fyller aldrig i ett inloggningsformulär — du skriver på webbplatsens egen sida. Hämtningar körs utloggade; bara när en misslyckas på ett sätt som ett konto kan åtgärda läser Arroxy inloggningen på nytt, sparar den i en temporär fil för den hämtningen och tar bort filen efteråt. Om du loggar ut från Utforska i Inställningar glöms de.

---

## <a id="faq"></a>❓ Vanliga frågor

<details>
<summary><strong>Är det verkligen gratis?</strong></summary>

Ja — licensierat under GPLv3, ingen premiumnivå, ingen funktionsspärr.

</details>

<details>
<summary><strong>Hur skiljer sig Arroxy från andra gränssnitt för yt-dlp?</strong></summary>

De flesta gratis gränssnitt för yt-dlp är omslag som bara tar en länk. Arroxy lägger till **Utforska**, en webbläsare inbyggd i appen som öppnar YouTube eller någon annan webbplats: du surfar och hämtar utan att kopiera länkar, och loggar in där en gång för att hämta privata videor, videor för medlemmar och åldersbegränsade videor samt dina listor Titta senare och Gillade, utan cookieexport. Arroxy använder den inloggningen när YouTube ber dig bekräfta att du inte är en robot, och dess inbyggda webbläsare hämtar YouTubes hämtningstoken så att hämtningar inte faller tillbaka på färre format. Se [Varför Arroxy](#why).

</details>

<details>
<summary><strong>Vilka videokvaliteter kan jag hämta?</strong></summary>

Allt YouTube erbjuder: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus endast ljud. Strömmar med 60 fps och HDR bevaras som de är, och den stegvisa hämtningen låter dig välja AV1, VP9 eller H.264 vid varje upplösning.

</details>

<details>
<summary><strong>Kan jag extrahera bara ljudet som MP3?</strong></summary>

Ja. Välj *endast ljud* i formatmenyn och välj MP3, M4A/AAC, Opus eller WAV.

</details>

<details>
<summary><strong>Hur hämtar jag videor som kräver ett YouTube-konto?</strong></summary>

Logga in en gång på fliken Utforska. Arroxy kan då hämta privata videor och videor för medlemmar som ditt konto får se, åldersbegränsade videor om kontot är åldersverifierat, samt dina listor Titta senare och Gillade. Den använder inloggningen bara när en hämtning misslyckas på ett sätt som ett konto kan åtgärda; allt annat hämtas som förut. Det här är valet **Inloggning i Utforska**, som står först och är markerat Rekommenderas i cookieinställningarna, och Arroxy väljer det åt dig första gången du öppnar Utforska. yt-dlp:s wiki noterar att [inloggad automatisering kan flagga ett Google-konto](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), så ett sekundärt konto är det säkrare valet.

</details>

<details>
<summary><strong>Fortsätter det att fungera när YouTube ändrar något?</strong></summary>

yt-dlp uppdateras automatiskt vid start, och Arroxy levererar korrigeringar snabbt när YouTube ändrar något. När YouTube ber dig bekräfta att du inte är en robot provar Arroxy också din inloggning i Utforska om du har loggat in där, och cookies från en fil eller din webbläsare finns i cookieinställningarna.

</details>

<details>
<summary><strong>Vilka språk finns Arroxy på?</strong></summary>

50 språk, direkt ur lådan: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy identifierar operativsystemets språk automatiskt vid första start och du kan byta när som helst i språkväljaren i verktygsfältet. JSON-filer för språk vid körning finns i src/shared/i18n/locales/, och PO-kataloger för översättare finns i i18n/locales/ — öppna en PR på GitHub för att bidra.

</details>

<details>
<summary><strong>Behöver jag installera något mer?</strong></summary>

Nej. yt-dlp, ffmpeg och ffprobe hämtas automatiskt vid första start och sparas på din dator. Därefter behövs ingen extra konfiguration.

</details>

<details>
<summary><strong>Kan jag hämta spellistor eller hela kanaler?</strong></summary>

Ja — båda. Klistra in en spellistas eller kanals webbadress (t.ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); välj hur många poster som ska skannas och köa sedan hela listan eller välj specifika videor. Datumintervallfilter kommer snart.

</details>

<details>
<summary><strong>macOS säger att ”appen är skadad” — vad gör jag?</strong></summary>

Det är macOS Gatekeeper som blockerar en osignerad app, inte faktisk skada. Se [Första start på macOS](#macos-first-launch) för Terminal-kommandona som tar bort karantänen och startar Arroxy.

</details>

<details>
<summary><strong>Är det lagligt att hämta YouTube-videor?</strong></summary>

För personligt, privat bruk är det i allmänhet accepterat i de flesta jurisdiktioner. Du ansvarar för att följa YouTubes [användarvillkor](https://www.youtube.com/t/terms) och dina lokala upphovsrättslagar.

</details>

---

## <a id="roadmap"></a>🗺️ Färdplan

Fortfarande planerat — ungefär i prioritetsordning:

| Funktion    | Beskrivning    |
| ---------------- | ---------------- |
| **Filter för spellistor och kanaler** | Datumintervallfilter vid uppräkning av en spellista eller kanal |
| **Inställningar för YouTubes ljudspår** | Ange en appövergripande inställning för talat språk, med åsidosättningar per profil när YouTube erbjuder flera ljudspår |
| **Starkare återhämtning vid nya försök** | En ny väg för nya försök för hämtningar som avbrutits av opålitliga eller problematiska internetanslutningar |
| **Fullständig hanterare för hämtningar** | Gör köpanelen till en fylligare hanterare, inklusive möjlighet att ändra målmappar för köade objekt |
| **Schemalagda hämtningar** | Starta en kö vid en angiven tid (nattkörningar) |
| **AUR-paket** | Installera på Arch Linux och Omarchy med `yay -S arroxy-bin` |

Har du en funktion i åtanke? [Öppna en förfrågan](../../../../issues) — input från communityn styr prioriteringen.

---

## <a id="support"></a>💖 Stöd Arroxy

Arroxy är gratis och licensierat under GPLv3 — ingen reklam, ingen telemetri, ingen betalnivå. Om det sparar tid åt dig kan du stödja utvecklingen med Bitcoin, Tron eller Ethereum: adresserna finns i [DONATE.md](../../DONATE.md), som är den enda officiella källan till dem. Arroxy skickar aldrig en adress till dig via e-post eller direktmeddelande. Att stjärnmärka repot, rapportera buggar och förbättra översättningar hjälper lika mycket.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Byggt med

<details>
<summary><strong>Teknikstack</strong></summary>

- **Electron** — plattformsoberoende skrivbordsskal
- **React 19** + **TypeScript** — gränssnitt
- **Tailwind CSS v4** — formgivning
- **Zustand** — tillståndshantering
- **yt-dlp** + **ffmpeg** — motor för hämtning och sammanfogning (båda hämtas vid körning: yt-dlp hålls uppdaterat, ffmpeg/ffprobe installeras en gång och finns kvar mellan uppdateringar)
- **Vite** + **electron-vite** — byggverktyg
- **Vitest** + **Playwright** — enhetstester och end-to-end-tester

</details>

<details>
<summary><strong>Bygg från källkod</strong></summary>

### Förutsättningar — alla plattformar

| Verktyg | Version | Installation |
| ------- | ------- | ------- |
| Git     | valfri  | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` eller `.node-version` |
| Bun     | 1.4.2  | `mise install` eller `package.json` `packageManager` |

Rekommenderas: installera `mise` och kör sedan `mise install` i utcheckningen. Utan mise aktiverar du Node.js från `.node-version` och Bun från `package.json` manuellt före `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools och Python kan behövas för inbyggda ombyggnader.

### macOS

```bash
brew install mise
xcode-select --install
```

Efter kloningen kör du `mise trust && mise install` från utcheckningen. Om ditt skal redan använder `fnm`, `nvm` eller en Bun från Homebrew, aktivera mise i `~/.zshrc` så att Arroxy får Node.js 24.21.0 och Bun 1.4.2:

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

### Klona och kör

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Bygg en distribuerbar version

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` installerar beroenden, bygger om Electron-appens beroenden, verifierar Electron, förbereder inbäddat ffmpeg/ffprobe för utveckling och installerar Playwright Chromium. Utgivna versioner hanterar yt-dlp, ffmpeg och ffprobe vid körning i appens datamapp; ingen av dem levereras i installationsprogrammet.

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

## 📜 Användarvillkor

Arroxy är ett verktyg endast för personligt, privat bruk. Du ansvarar själv för att dina hämtningar följer YouTubes [användarvillkor](https://www.youtube.com/t/terms) och upphovsrättslagarna i din jurisdiktion. Använd inte Arroxy för att hämta, kopiera eller distribuera innehåll som du inte har rätt att använda. Utvecklarna ansvarar inte för missbruk.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Gjort med omsorg av <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
