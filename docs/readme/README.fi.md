<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Arroxyn maskotti" width="180" />

# Arroxy — ilmainen avoimen lähdekoodin YouTube- (+ 2000 sivustoa) lataaja sisäänrakennetulla selaimella Windowsille, macOS:lle ja Linuxille

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Lue kielellä:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · **Suomi** · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Julkaisu](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Koonti](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Verkkosivusto](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Lisenssi](https://img.shields.io/badge/license-GPLv3-blue) ![Alustat](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Kielet](https://img.shields.io/badge/i18n-50_languages-blue)

Lataa videoita, Shortseja, kanavia, podcasteja tai äänitiedostoja **YouTubesta ja yli 2000 tuetulta sivustolta** — jopa 8K HDR 60 kuvaa sekunnissa, MP3- / AAC- / Opus-muodossa tai vain tarvitsemasi osa. **Selaa YouTubea tai mitä tahansa muuta sivustoa Arroxyn sisällä** Tutki-välilehdellä ja lataa video, soittolista tai kanava, jolla olet; kirjaudu siellä sisään ladataksesi videoita, joita oma tilisi voi jo katsoa. Toimii paikallisesti Windowsissa, macOS:ssä ja Linuxissa. **Ei mainoksia, ei turhaa painolastia, ei myyntipuheita.**

[**↓ Asenna uusin julkaisu**](#install) &nbsp;·&nbsp; [**Verkkosivusto**](https://arroxy.com/) &nbsp;·&nbsp; [Windowsin ensimmäinen käynnistys](#windows-first-launch) · [macOS:n ensimmäinen käynnistys](#macos-first-launch) · [Linuxin ensimmäinen käynnistys](#linux-first-launch)

[![Liity Discordin yhteisöön](https://img.shields.io/badge/Liity%20Discordin%20yhteis%C3%B6%C3%B6n-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Jos Arroxy säästää aikaasi, ⭐ auttaa muita löytämään sen.

</div>

> **Mikä on Arroxy?** Arroxy on ilmainen, avoimen lähdekoodin työpöytäsovellus graafisella käyttöliittymällä, joka lataa videoita, ääntä, soittolistoja ja tekstityksiä YouTubesta ja yli 2000 muulta [yt-dlp](https://github.com/yt-dlp/yt-dlp):n tukemalta sivustolta. Se toimii järjestelmissä Windows 10/11, macOS 13+ (Intel + Apple Silicon) ja Linux (AppImage, Flatpak, tar.gz). GPLv3-lisenssi. Ei mainoksia, ei käyttörajoituksia. Jakelu: [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage ja suora lataus.
>
> **Keskeinen ero: sisäänrakennettu selain.** Useimmat ilmaiset YouTube-lataajat ovat ohuita yt-dlp-kääreitä: URL-kenttä ja muotovalikko, ilman omaa selainta. Arroxyssa sellainen on, **Tutki-välilehti**. Selaat YouTubea tai mitä tahansa muuta sivustoa sovelluksen sisällä ja lataat videon, soittolistan tai kanavan, jolla olet, tai napsautat mitä tahansa linkkiä hiiren kakkospainikkeella. Jos kirjaudut kerran sisään Tutki-välilehdellä, tilin vaativat lataukset käyttävät tuota kirjautumista: yksityiset videosi, Katso myöhemmin- ja Tykätyt-luettelosi sekä muut videot, joita tilisi voi jo katsoa, ilman evästeiden vientiä. Kirjaudu myös muille sivustoille siellä, ja niiden lataukset käyttävät kirjautumista tarvittaessa. Lisätietoja: [Miksi Arroxy](#why-explore).
>
> _Päivitetty viimeksi: 2026-10-22._

> 🌐 Tämä käännös on tehty tekoälyn avulla. [Englanninkielinen README](../../README.md) on ensisijainen lähde. Löysitkö virheen? [Avaa PR](../../../../pulls).

---

## Sisältö

- [✨ Ominaisuudet](#features)
- [📥 Asennus ja ensimmäinen käynnistys](#install)
  - [Windowsin ensimmäinen käynnistys](#windows-first-launch)
  - [macOS:n ensimmäinen käynnistys](#macos-first-launch)
  - [Miksi saatat nähdä varoituksen](#why-warning)
  - [Linuxin ensimmäinen käynnistys](#linux-first-launch)
  - [Varmista lataamasi tiedosto (SHA256)](#verify)
- [⚖️ Miksi Arroxy](#why)
- [🔒 Tietosuoja](#privacy)
- [❓ UKK](#faq)
- [🗺️ Tiekartta](#roadmap)
- [💖 Tue Arroxya](#support)
- [🛠️ Rakennettu näillä](#tech)
- [📜 Käyttöehdot](#terms)

---

## <a id="features"></a>✨ Ominaisuudet

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/fi/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Tutki</b><br/>Selaa YouTubea tai mitä tahansa muuta sivustoa Arroxyn sisällä ja lataa sivu, jolla olet, aktiivisella profiilillasi</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Tutki-välilehden ensimmäinen näkymä</b><br/>Lyhyt katsaus Tutki-välilehteen ja miksi toissijainen tili on turvallisempi kirjautuminen</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Lataukset kertoo, mikä tarvitsee sinua</b><br/>Linkit valmistuvat taustalla; epäonnistunut tarjoaa korjauksensa, pitkä soittolista odottaa valintaasi</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/fi/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Lataa vain osa videosta</b><br/>Valitse alku ja loppu tai luku — Arroxy tallentaa vain sen alueen</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/fi/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR 60 kuvaa sekunnissa</b><br/>Jokainen videon tarjoama tarkkuus, koodekki ja HDR-virta rinnakkain</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/fi/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profiilieditori</b><br/>Säädä profiilia: tiedostotyyppi, tarkkuus, tekstitykset, kohde, tiedostonimen malli ja paljon muuta</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/fi/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Tumma tai vaalea, lasi tai tasainen</b><br/>Neljä ulkoasua: lasipaneeleja liikkuvan taivaan päällä tai rauhallisia tasaisia pintoja, kumpikin tummana ja vaaleana</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Arroxyn yleinen lataus-pikanäppäin — Ctrl+Shift+D Windowsissa ja Linuxissa, Cmd+Shift+D macOS:ssä, lähettää kopioidun linkin suoraan latausjonoon" width="760" /></picture><br/><sub><b>Yleinen lataus-pikanäppäin</b><br/>Kopioi linkki mistä tahansa, paina kerran — se päätyy jonoon ja alkaa latautua</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/fi/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Soittolistan kohdekohtaiset profiilit</b><br/>Anna jokaiselle videolle oma profiili — arkistoi osa 4K:na, tallenna loput pelkkänä äänenä</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Pikalatauksen etusivu</b><br/>Liitä URL-osoite ja lataa se heti aktiivisella profiilillasi</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Uudelleenkäytettävät latausprofiilit</b><br/>Tallenna muoto-, laatu- ja tulosteesiasetukset — käytä uudelleen latauksittain</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Monikieliset ääniraidat</b><br/>Valitse tarkka äänen kieli, jonka video tarjoaa</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround- / Dolby-ääni</b><br/>5.1- ja Dolby-raidat tunnistetaan ja säilytetään</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Usean URL-osoitteen tila</b><br/>Liitä luettelo, kaksoiskappaleet poistetaan automaattisesti, lisää kaikki jonoon kerralla</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/fi/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Rinnakkainen latausjono</b><br/>Useita latauksia kerralla reaaliaikaisella edistymisellä</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Tutki: selaa verkkoa Arroxyn sisällä</strong></summary>

- **Tutki-välilehti** — selaa YouTubea tai mitä tahansa muuta sivustoa Arroxyn sisällä ja lataa löytämäsi ilman linkkien kopiointia. **Lataa · *profiilisi*** lisää jonoon parhaillaan katsomasi videon, soittolistan tai kanavan; sen vieressä oleva nuoli vaihtaa profiilia, ja taikasauva avaa vaiheittaisen latauksen muotojen, tekstitysten ja muun valintaa varten
- **Lataa hiiren kakkospainikkeella** — napsauta Tutki-välilehdellä mitä tahansa video-, soittolista- tai kanavalinkkiä hiiren kakkospainikkeella ladataksesi sen profiilillasi, valitaksesi toisen profiilin kohdasta **Lataa profiililla**, avataksesi vaiheittaisen latauksen tai kopioidaksesi linkin. Videoita ei tarvitse avata yksitellen
- **Tiivis asettelu** — yksi napsautus Tutki-välilehden työkalurivillä siirtää Arroxyn välilehdet sinne ja antaa sivulle enemmän tilaa
- **Osoitepalkki** — kirjoita hakeaksesi YouTubesta tai anna mikä tahansa verkko-osoite avataksesi sivuston
- **Tilin vaativat lataukset** — kirjaudu kerran Tutki-välilehdellä, ja Arroxy voi ladata videoita, joita tilisi voi katsoa: yksityiset videosi, ikärajoitettuja videoita, jos tili on ikävarmennettu, sekä Katso myöhemmin- ja Tykätyt-luettelosi. Kirjaudu myös muille sivustoille, ja niiden lataukset käyttävät kirjautumista tarvittaessa. Arroxy lataa edelleen ensin kirjautumattomana ja käyttää Tutki-kirjautumistasi vain, kun lataus epäonnistuu tavalla, jonka tili voi korjata
- **Käytä toissijaista tiliä** — Tutki-välilehden ensimmäinen näkymä selittää miksi: tilillä lataamiseen liittyy riski tilin rajoittamisesta. Kirjaudu ulos Tutki-välilehdeltä Asetuksista milloin tahansa, kun haluat unohtaa kirjautumisesi
- **Mainosten esto** — pois päältä oletuksena. Yksi napsautus kilpeen Tutki-välilehden työkalurivillä estää mainokset ja seurantaohjelmat sen sivuilla vaikuttamatta latauksiin. YouTube voi vastustaa mainosten estoa sisäänkirjautuneilla tileillä

</details>

<details>
<summary><strong>🎞️ Laatu ja muodot</strong></summary>

- Jopa **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Korkea kuvataajuus ja HDR** säilyvät sellaisenaan — 60 kuvaa sekunnissa, HDR10
- **Ääni** — vie vain ääni MP3-, M4A/AAC-, Opus- tai WAV-muodossa. Vaiheittaisissa latauksissa voit valita lähteen alkuperäiset surround-/Dolby-raidat (AC-3, E-AC-3, 5.1, DRC), kun ne ovat saatavilla, tai asettaa yleisen oletuksen **Suosi surroundia / Dolbya**
- **Tavoitteelliset profiilit** — *Paras kuva* (AV1 · VP9) tai *Smart TV* (MP4 · H.264), tallennettuna muodossa Auto, MP4, MKV tai WebM ilman uudelleenkoodausta. HDR on *Auto* (vain kun näyttösi osaa näyttää sen), *SDR* tai *HDR*
- **Jokainen koodekki jokaisella tarkkuudella** — vaiheittainen lataus listaa AV1:n, VP9:n ja H.264:n rinnakkain jokaisella tarkkuudella, joten voit valita sen, jonka televisiosi tai editorisi toistaa
- **Tiedä, mitä virta oikeasti on** — tekoälyllä YouTuben skaalaamat koot, tekoälydubatut äänikielet, parannetun bittinopeuden virrat, 360°-videot sekä vioittuneet tai vesileimatut kopiot on merkitty. Profiilit ohittavat tekoälyllä skaalatut virrat, ellet salli niitä

</details>

<details>
<summary><strong>🛡️ Tietosuoja ja hallinta</strong></summary>

- 100 % paikallinen käsittely — lataukset menevät suoraan YouTubesta levyllesi
- **Avoin lähdekoodi** — jokainen rivi tarkastettavissa, GPLv3-lisenssi
- Tiedostot tallennetaan suoraan valitsemaasi kansioon

</details>

<details>
<summary><strong>⚡ Työnkulku</strong></summary>

- **Yleinen lataus-pikanäppäin** — kopioi linkki mistä tahansa sovelluksesta ja paina `Ctrl+Shift+D` (`Cmd+Shift+D` macOS:ssä); Arroxy lisää sen jonoon aktiivisella profiilillasi avaamatta ikkunaa, ja ilmoitus vahvistaa sen. Oletuksena päällä, uudelleenmääritettävissä
- **Joustavat aloitustavat** — valitse ohjattu yksittäinen lataus, soittolista-/kanavavalitsin, usean URL-osoitteen liittäminen, Pikalataus tallennetuilla oletuksilla tai selaa ja lataa Tutki-välilehdeltä
- **Keskitetty latausjono** — jokainen yksittäinen, soittolista-, usean URL-osoitteen tai pikalataus päätyy samaan paikkaan edistymisen, keskeytyksen, jatkamisen, peruutuksen, uudelleenyrityksen ja prioriteetin hallintaa varten
- **Leikepöydän seuranta** — kopioi videolinkki, ja se täyttää URL-kentän, kun palaat Arroxyyn; **Kumoa** auttaa, jos et tarkoittanut sitä. Kun Arroxy on kiireinen, linkki odottaa, kunnes palaat URL-välilehdelle (voit poistaa sen käytöstä Asetuksista)
- **URL-osoitteiden automaattinen siivous** — poistaa seurantaparametrit (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ja purkaa `youtube.com/redirect`-linkit
- **Ilmaisinalue-tila** — ikkunan sulkeminen pitää lataukset käynnissä taustalla
- **50 kieltä** — tunnistaa järjestelmän kielen automaattisesti, vaihdettavissa milloin tahansa
- **Soittolistan synkronointi** — tarkista soittolista uudelleen paikallista kansiota vasten ohittaaksesi jo ladatut videot; luo `.m3u`-soittolistatiedoston, jota päivitetään kunkin videon latautuessa
- **Nopeuden ja tahdistuksen hallinta** — rajoita latauksen kaistanleveyttä, aseta kuinka monta videon osaa ladataan kerralla ja lisää pyyntöviiveitä esiasetuksilla (*Pois · Tasapainoinen · Varovainen · Mukautettu*)
- **Tiedostonimen mallit** — nimeä lataukset haluamallasi tavalla tunnisteilla `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` ja `{playlist_index}`, yleisesti tai latausprofiilikohtaisesti
- **Lataukset kerralla ja automaattinen uudelleenyritys** — valitse, kuinka monta jonossa olevaa latausta ajetaan samanaikaisesti, ja anna Arroxyn yrittää uudelleen latausta, joka kohtasi verkko- tai palvelinongelman, odottaen pidempään ennen jokaista yritystä
- **Soittolistan kohdekohtaiset profiilit** — anna jokaiselle soittolistan videolle oma latausprofiilinsa koko listan yhden asetuksen sijaan, jolloin yhdellä kerralla voi arkistoida osan täydellä laadulla ja tallentaa loput pelkkänä äänenä
- **Pikalataus toimii taustalla** — linkki ilmestyy heti Lataukset-näkymään ja valmistuu siellä, **Näytä**-ilmoitus vahvistaa sen ja URL-kenttä tyhjenee seuraavaa linkkiä varten. Aloita niin monta kuin haluat, kun aiemmat valmistuvat
- **Lataukset kertoo, mikä tarvitsee sinua** — jos Arroxy ei pysty lukemaan linkkiä, sen rivi kertoo syyn ja tarjoaa korjauksen: Yritä uudelleen, ota evästeet käyttöön tai kirjaudu Tutki-välilehdellä. Kun evästeet ovat pois päältä, **Kirjaudu Tutki-näkymässä** yrittää sitä puolestasi uudelleen, kun olet kirjautunut. Latausrajaasi pidempi soittolista odottaa rivillään, että valitset kaikki, ensimmäiset tai tarkistuksen. Lataukset-välilehti laskee sinua odottavat rivit
- **Lataa vain osa videosta** — valitse Muoto-näytöllä alku ja loppu tai luku, ja Arroxy tallentaa vain sen alueen, nimettynä alueella videotunnuksen jälkeen. Leikkaukset osuvat lähimpään avainkuvaan; ota tarkka leikkaus käyttöön, jos haluat sen sijaan koodata uudelleen
- **Poista valmistuneet lataukset** — valinnainen: valmistunut lataus poistuu luettelosta 5 sekunnin kuluttua. Sen tiedostot pysyvät levyllä, ja epäonnistuneet lataukset pysyvät luettelossa
- **Koko ja Puuttuu Latauksissa** — lajiteltava **Koko**-sarake näyttää, kuinka paljon tilaa kukin lataus vie, ja **Puuttuu** merkitsee tiedostot, jotka on siirretty tai poistettu Arroxyn ulkopuolella
- **Aurora tai Minimal, tumma tai vaalea** — lasipaneeleja liikkuvan taivaan päällä tai rauhallisia tasaisia pintoja; vaihda alatunnisteesta. Tietokoneet ilman grafiikkakiihdytystä saavat Minimalin automaattisesti
- **Macin valikkorivi** — avaa macOS:ssä Asetukset (`Cmd+,`), aseta latausnopeuden raja, vaihda tyyliä ja teemaa sekä avaa lokit tai tallenna diagnostiikkatiedosto valikkoriviltä
- **Muuta profiilia mistä tahansa latauksesta** — säädä latausta ja päivitä sitten profiili, josta se alkoi (muutosten esikatselulla), tai tallenna asetukset uudeksi profiiliksi. Profiilin vaihtaminen kysyy, säilytetäänkö muokkauksesi

</details>

<details>
<summary><strong>📝 Tekstitykset ja jälkikäsittely</strong></summary>

- **Tekstitykset** SRT-, VTT- tai ASS-muodossa — manuaaliset tai automaattisesti luodut, millä tahansa saatavilla olevalla kielellä
- Tallenna videon viereen, upota `.mkv`-tiedostoon tai järjestä `Subtitles/`-alikansioon
- **Vain tekstityksiä sisältävät erät** — liitä URL-osoitteiden luettelo tai avaa soittolista, valitse Tekstitykset ja saat vain jokaisen videon tekstitystiedostot
- **SponsorBlock** — ohita tai merkitse luvuiksi sponsorit, introt, outrot ja omamainokset
- **Upotetut metatiedot** — nimi, lisäyspäivä, kanava, kuvaus, pikkukuva ja lukumerkit kirjoitetaan tiedostoon

</details>

<details>
<summary><strong>🌐 YouTube + 2000 sivustoa</strong></summary>

- **YouTube kokonaisuudessaan** — Videot, Shortsit, Kanavat, Soittolistat, YouTube Music ja Podcastit käsitellään ensiluokkaisina lähteinä
- **Yli 2000 muuta sivustoa** yt-dlp:n kautta — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable ja monet muut
- **Vain ääni ja tekstitykset** toimivat kaikilla tuetuilla sivustoilla, ei vain YouTubessa
- Jos sivusto muuttuu, yt-dlp julkaisee korjauksia viikoittain ja Arroxy päivittää binäärin automaattisesti käynnistyessään

</details>

---

## <a id="install"></a>📥 Asennus ja ensimmäinen käynnistys

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

Koonnokset ovat vain x86_64:lle. Eikö `curl` löydy? Korvaa `curl -fsSL` komennolla `wget -qO-`.

| Alusta | Suora lataus |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Kaikki julkaisun tiedostot →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windowsin ensimmäinen käynnistys</strong></summary>

Ensimmäisellä käynnistyksellä saatat nähdä **”Windows suojasi tietokoneesi”** tai **”Tuntematon julkaisija”**. Tämä koskee sekä tiedostoa `Arroxy-win-x64-Setup.exe` että tiedostoa `Arroxy-win-x64-Portable.exe`. Arroxy on ilmainen ja avoimen lähdekoodin, eikä Windows-koonnoksia ole allekirjoitettu maksullisella varmenteella, minkä vuoksi SmartScreen merkitsee ne. Se **ei** automaattisesti tarkoita, että Arroxy olisi vaarallinen. Jatka näin:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen-ikkuna ”Windows suojasi tietokoneesi”, jossa ”Lisätietoja”-linkki on korostettu" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen-ikkuna Lisätietoja-kohdan laajentamisen jälkeen, ”Suorita silti” -painike näkyvissä" />
</div>

1. Napsauta **Lisätietoja**.
2. Napsauta **Suorita silti**.

#### Jos Windows Defender merkitsee tai poistaa tiedoston

Defenderin heuristiikka merkitsee joskus allekirjoittamattomat NSIS-asennusohjelmat ja Electron-kannettavat epäilyttäviksi. Jos Defender asettaa tiedoston `Arroxy-win-x64-Setup.exe` tai `Arroxy-win-x64-Portable.exe` karanteeniin, palauta se kohdasta **Windows-suojaus → Virus- ja uhkien torjunta → Suojaushistoria** ja lisää sitten Arroxyn suoritettava tiedosto sallituksi kohteeksi kohdassa **Hallitse asetuksia → Lisää tai poista poissulkemisia**. Kuten SmartScreenin kohdalla, laukaisijana on puuttuva julkaisijan allekirjoitus, ei havaittu haittaohjelma.

> Lataa Arroxy vain viralliselta GitHub Releases -sivulta. Jos sait tiedoston toiselta verkkosivustolta tai joku lähetti sen sinulle, poista se ja lataa uusi kopio virallisesta lähteestä. Lähdekoodi on julkinen, joten voit tarkastaa sen tai koota Arroxyn itse, jos haluat.

Käytätkö mieluummin Scoopia? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS:n ensimmäinen käynnistys</strong></summary>

Arroxyn macOS-koonnokset on allekirjoitettu ad hoc -menetelmällä, mutta Apple ei ole notarisoinut niitä, joten Gatekeeper estää ensimmäisen käynnistyksen ilmoituksella *”Arroxy.app” ei avattu — Apple ei voinut vahvistaa, että ”Arroxy.app” on vapaa haittaohjelmista*. Se tarkoittaa, ettei macOS voi tarkistaa sovellusta Applen kanssa, ei sitä, että tiedostoissa olisi jotain vikaa. Asennus Homebrew-ohjelmalla välttää tämän ikkunan kokonaan. Jos käytit DMG:tä, yksi Pääte-komento poistaa sen:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Vedä `Arroxy.app` liitetystä DMG:stä kansioon `/Applications`.
2. Avaa Pääte ja suorita nämä kaksi komentoa:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Ensimmäinen komento poistaa karanteenimääritteen, jonka macOS liitti tiedostoon sen latautuessa; toinen käynnistää sovelluksen. Yleensä et tarvitse `sudo`-komentoa, koska kansiossa `/Applications` oleva kopio on sinun — lisää se vain, jos saat oikeusvirheen.

**Apple Silicon vs. Intel:** M-sarjan Macissa (M1 / M2 / M3 / M4) lataa `arm64`-DMG. Intel-Maceissa lataa `x64`-DMG. Väärän koonnoksen käyttö toimii silti Rosettan kautta, mutta on selvästi hitaampaa.

> macOS-koonnokset tehdään CI:ssä Apple Silicon- ja Intel-ajureilla. Jos kohtaat ongelmia, [avaa ongelmailmoitus](../../../../issues) — macOS-käyttäjien palaute muokkaa aktiivisesti macOS-testaussykliä.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Miksi saatat nähdä varoituksen</strong></summary>

Arroxy on avointa lähdekoodia ja GPLv3-lisensoitu. Windows- ja macOS-koonnoksia **ei ole allekirjoitettu koodiallekirjoituksella** — Apple Developer ID- ja Windows EV -koodiallekirjoitusvarmenteet maksavat kumpikin satoja dollareita vuodessa, jotka itsenäinen projekti maksaa omasta pussistaan. Ilman näitä allekirjoituksia Windows SmartScreen ja macOS Gatekeeper varoittavat ensimmäisellä käynnistyksellä. Varoitukset tarkoittavat, että *käyttöjärjestelmäsi ei tunnista julkaisijaa* — ne eivät tarkoita, että Arroxy olisi haittaohjelma.

Kolme tapaa varmistaa Arroxy itse, tiukkuuden mukaan nousevassa järjestyksessä:

- **Lue lähdekoodi.** Jokainen rivi on [GitHubissa](https://github.com/antonio-orionus/Arroxy), ja voit [koota sen lähdekoodista](#tech).
- **Tarkista SHA256.** Vertaa tiedostoasi julkaistuun tiedostoon [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — katso alta [Varmista lataamasi tiedosto](#verify).
- **Suorita kolmannen osapuolen tarkistus.** Lataa tiedosto palveluun [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linuxin ensimmäinen käynnistys</strong></summary>

AppImage-tiedostot suoritetaan suoraan — asennusta ei tarvita. Tiedosto tarvitsee vain merkitä suoritettavaksi.

**Tiedostonhallinta:** napsauta `.AppImage`-tiedostoa hiiren kakkospainikkeella → **Ominaisuudet** → **Oikeudet** → ota käyttöön **Salli tiedoston suorittaminen ohjelmana** ja kaksoisnapsauta sitten.

**Pääte:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Jos käynnistys silti epäonnistuu, suorita se liittämättä — FUSE-pakettia ei tarvita:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Valinnainen työpöytäintegraatio:** asenna [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) kerran, niin jokainen kaksoisnapsauttamasi AppImage rekisteröidään automaattisesti sovellusvalikkoosi — `.desktop`-tiedostoa ei tarvitse luoda käsin.

**Pelkkä tarball (ei FUSEa, ei asennusta):**

`.tar.gz`-koonti on sama sovellus ilman AppImage-kääreää — pura se mihin tahansa ja suorita. Asennusohjelmaa tai FUSE-pakettia ei tarvita.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Julkaisusivun Linux-lataukset ovat vain x86_64:lle.** ARM64-koneilla (Raspberry Pi, Asahi Linux) Flatpak asentuu yhä, mutta epäonnistuu käynnistyksessä virheeseen `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Varmista lataamasi tiedosto (SHA256)</strong></summary>

Jokainen julkaisu sisältää binäärien rinnalla `SHA256SUMS`-tiedoston. Tarkistaaksesi, ettei lataus vioittunut tai muuttunut siirron aikana, laske tiedostosi tiiviste paikallisesti ja vertaa sitä `SHA256SUMS`-tiedoston riviin. Avaa uusimman julkaisun sivu → **Assets** → lataa `SHA256SUMS`.

**Windows (PowerShell tai Komentokehote):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Pääte):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Pääte):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Haluatko kolmannen osapuolen haittaohjelmatarkistuksen? Lataa tiedosto palveluun [VirusTotal](https://www.virustotal.com). Muutama yleisen heuristiikan merkintä pieniltä moottoreilta on normaalia allekirjoittamattomille Electron-sovelluksille; laaja tunnistus suurilta moottoreilta olisi todellinen huolenaihe.

</details>

<details>
<summary><strong>📦 Windows: asennusohjelma vs. kannettava</strong></summary>

|               | NSIS-asennusohjelma | Kannettava `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Vaatii asennuksen | Kyllä  | Ei — suoritettavissa mistä tahansa  |
| Automaattiset päivitykset | ✅ sovelluksessa  | ❌ manuaalinen lataus  |
| Käynnistysnopeus | ✅ nopeampi  | ⚠️ hitaampi kylmäkäynnistys  |
| Lisää Käynnistä-valikkoon |            ✅            |           ❌            |
| Helppo poisto |            ✅            | ❌ poista tiedosto  |

**Suositus:** käytä NSIS-asennusohjelmaa automaattisia päivityksiä ja nopeampaa käynnistystä varten. Käytä kannettavaa `.exe`-tiedostoa, jos haluat vaihtoehdon ilman asennusta ja rekisterimerkintöjä.

</details>

---

## <a id="why"></a>⚖️ Miksi Arroxy

Vertailu yleisimpiin vaihtoehtoihin:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Sisäänrakennettu selain (selaa, kirjaudu, lataa) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Videot, joita oma tilisi voi katsoa, ilman evästeiden vientiä |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Ilmainen, ei maksullista tasoa |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Avoin lähdekoodi |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Vain paikallinen käsittely |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Ei käyttörajoja |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Alustariippumaton työpöytäsovellus |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Tekstitykset + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = osittain tai vain maksullisella tasolla. 4K Video Downloaderin sovelluksen sisäinen kirjautuminen yksityisiin videoihin on maksullinen ominaisuus; useimmat ilmaiset yt-dlp-käyttöliittymät hyväksyvät vain evästetiedoston tai lukevat verkkoselaimesi evästeet.

Arroxy on tehty yhtä asiaa varten: siistiä paikallista tiedostoa varten, liitit URL-osoitteen tai löysit videon Tutki-välilehdeltä. Ei myyntipuheita, ei tietojen keruuta.

### <a id="why-explore"></a>🧭 Mitä pelkkä yt-dlp-kääre ei osaa: Tutki-välilehti

Useimmat ilmaiset YouTube-lataajat ovat yt-dlp:n päälle tehty URL-kenttä. Arroxykin käyttää yt-dlp:tä, mutta siinä on myös **Tutki**, sovellukseen rakennettu selain, joka avaa YouTuben tai minkä tahansa muun sivuston. Tutki tuo sen, mitä URL-kenttä ei voi:

- **Videot, joita tilisi voi katsoa, ilman evästeiden vientiä** — yksityiset videosi, Katso myöhemmin- ja Tykätyt-luettelosi, ikärajoitetut videot ikävarmennetulla tilillä sekä muiden sivustojen kirjautumista vaativat sivut. Pelkkä kääre tarvitsee cookies.txt-viennin tai lukee verkkoselaimesi evästeet. Arroxyssa kirjaudut kerran Tutki-välilehdellä, ja loput hoituu itsestään
- **Ei linkkien kopiointia** — etsi video, soittolista tai kanava Tutki-välilehdeltä ja lataa se yhdellä napsautuksella tai napsauta mitä tahansa sivun linkkiä hiiren kakkospainikkeella
- **Mainosten esto, kun haluat** — yksi napsautus kilpeen estää mainokset ja seurantaohjelmat Tutki-välilehden sivuilla

---

## <a id="privacy"></a>🔒 Tietosuoja

Lataukset haetaan suoraan [yt-dlp:n](https://github.com/yt-dlp/yt-dlp) kautta YouTubesta valitsemaasi kansioon — mitään ei reititetä kolmannen osapuolen palvelimen kautta. Katseluhistoria, lataushistoria, URL-osoitteet ja tiedostojen sisältö pysyvät laitteellasi.

Ei seurantaa — yksi nimetön elonmerkki päivässä (sovelluksen versio, käyttöjärjestelmä, kieli, asennuskanava, maa ja suunnilleen kuinka kauan Arroxy on ollut asennettuna), jotta voimme laskea aktiiviset ja uudet käyttäjät, sekä, kun Arroxy lataa tai päivittää yt-dlp:n ja FFmpegin, nimetön ilmoitus siitä, onnistuiko se ja suunnilleen kuinka kauan se kesti. Ei tunnisteita, URL-osoitteita, videoiden nimiä, tiedostopolkuja tai tilitietoja. Voit poistaa molemmat käytöstä Asetuksista.

Tutki säilyttää omat kirjautumisensa erillään selaimestasi, eikä Arroxy koskaan lue tai täytä kirjautumislomaketta — kirjoitat sivuston omalle sivulle. Lataukset ajetaan kirjautumattomana; vasta kun lataus epäonnistuu tavalla, jonka tili voi korjata, Arroxy lukee kirjautumisen uudelleen, säilyttää sen väliaikaisessa tiedostossa kyseistä latausta varten ja poistaa tiedoston sen jälkeen. Uloskirjautuminen Tutki-välilehdeltä Asetuksissa unohtaa ne.

---

## <a id="faq"></a>❓ UKK

<details>
<summary><strong>Onko se oikeasti ilmainen?</strong></summary>

Kyllä — GPLv3-lisenssi, ei maksullista tasoa, ei ominaisuuksien rajoitusta.

</details>

<details>
<summary><strong>Miten Arroxy eroaa muista yt-dlp-käyttöliittymistä?</strong></summary>

Useimmat ilmaiset yt-dlp-käyttöliittymät ovat kääreitä, jotka ottavat vain linkin. Arroxy lisää **Tutki**-välilehden, sovellukseen rakennetun selaimen, joka avaa YouTuben tai minkä tahansa muun sivuston: selaat ja lataat ilman linkkien kopiointia, ja kirjaudut siellä kerran ladataksesi videoita, joita tilisi voi katsoa, kuten yksityiset videosi sekä Katso myöhemmin- ja Tykätyt-luettelosi, ilman evästeiden vientiä. Katso [Miksi Arroxy](#why).

</details>

<details>
<summary><strong>Minkä laatuisia videoita voin ladata?</strong></summary>

Kaikkea, mitä YouTube tarjoaa: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p sekä pelkkä ääni. 60 kuvan sekuntitaajuus ja HDR-virrat säilyvät sellaisenaan, ja vaiheittainen lataus antaa valita AV1:n, VP9:n tai H.264:n jokaisella tarkkuudella.

</details>

<details>
<summary><strong>Voinko poimia vain äänen MP3-muodossa?</strong></summary>

Kyllä. Valitse muotovalikosta *vain ääni* ja valitse MP3, M4A/AAC, Opus tai WAV.

</details>

<details>
<summary><strong>Miten lataan videoita, jotka vaativat YouTube-tilin?</strong></summary>

Kirjaudu kerran Tutki-välilehdellä. Sen jälkeen Arroxy voi ladata videoita, joita tilisi voi katsoa: yksityiset videosi, ikärajoitettuja videoita, jos tili on ikävarmennettu, sekä Katso myöhemmin- ja Tykätyt-luettelosi. Se käyttää kirjautumista vain, kun lataus epäonnistuu tavalla, jonka tili voi korjata; kaikki muu latautuu kuten ennen. Tämä on **Tutki-kirjautuminen** -vaihtoehto, joka on evästeasetuksissa ensimmäisenä ja merkitty Suositelluksi, ja Arroxy valitsee sen puolestasi, kun avaat Tutki-välilehden ensimmäisen kerran. yt-dlp:n wikissä todetaan, että [kirjautuneena tehty automaatio voi johtaa Google-tilin merkitsemiseen](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), joten toissijainen tili on turvallisempi valinta.

</details>

<details>
<summary><strong>Toimiiko se edelleen, kun YouTube muuttaa jotain?</strong></summary>

yt-dlp päivitetään automaattisesti käynnistyksen yhteydessä, ja Arroxy julkaisee korjauksia nopeasti, kun YouTube muuttaa jotain. Kun lataus vaatii kirjautumisen, Arroxy käyttää Tutki-kirjautumistasi, jos olet kirjautunut siellä, ja evästeet tiedostosta tai selaimestasi ovat käytettävissä evästeasetuksissa.

</details>

<details>
<summary><strong>Millä kielillä Arroxy on saatavilla?</strong></summary>

50 kieltä valmiina: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy tunnistaa käyttöjärjestelmäsi kielen automaattisesti ensimmäisellä käynnistyksellä, ja voit vaihtaa sitä milloin tahansa työkalurivin kielivalitsimesta. Ajonaikaiset kielitiedostot (JSON) sijaitsevat kansiossa src/shared/i18n/locales/ ja kääntäjille tarkoitetut PO-luettelot kansiossa i18n/locales/ — osallistu avaamalla PR GitHubissa.

</details>

<details>
<summary><strong>Tarvitseeko minun asentaa jotain muuta?</strong></summary>

Ei. yt-dlp, ffmpeg ja ffprobe ladataan automaattisesti ensimmäisellä käynnistyksellä ja tallennetaan koneellesi välimuistiin. Sen jälkeen lisämäärityksiä ei tarvita.

</details>

<details>
<summary><strong>Voinko ladata soittolistoja tai kokonaisia kanavia?</strong></summary>

Kyllä — molempia. Liitä soittolistan URL tai kanavan URL (esim. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); valitse, kuinka monta kohdetta tarkistetaan, ja lisää sitten koko luettelo jonoon tai valitse tiettyjä videoita. Päivämääräsuodattimet tulevat pian.

</details>

<details>
<summary><strong>macOS sanoo ”sovellus on vioittunut” — mitä teen?</strong></summary>

Se on macOS Gatekeeper, joka estää allekirjoittamattoman sovelluksen, ei todellinen vaurio. Katso [macOS:n ensimmäinen käynnistys](#macos-first-launch) Pääte-komennot, jotka poistavat karanteenin ja käynnistävät Arroxyn.

</details>

<details>
<summary><strong>Onko YouTube-videoiden lataaminen laillista?</strong></summary>

Se riippuu maastasi ja siitä, mitä lataat. Lataa vain sisältöä, jonka omistat, jonka lataaminen on lisensoitu tai jonka kopioiminen on maasi lain mukaan sallittua. Olet itse vastuussa YouTuben [käyttöehtojen](https://www.youtube.com/t/terms) ja paikallisen tekijänoikeuslainsäädännön noudattamisesta. Katso [Käyttöehdot](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ Tiekartta

Vielä suunnitteilla — suunnilleen tärkeysjärjestyksessä:

| Ominaisuus    | Kuvaus    |
| ---------------- | ---------------- |
| **Soittolista- ja kanavasuodattimet** | Päivämääräsuodattimet soittolistan tai kanavan kohteita lueteltaessa |
| **YouTuben ääniraitojen asetukset** | Aseta sovelluksen laajuinen puhutun kielen raidan asetus, profiilikohtaisilla ohituksilla, kun YouTube tarjoaa useita ääniraitoja |
| **Vahvempi uudelleenyrityksestä toipuminen** | Uusi uudelleenyrityspolku lataukselle, jonka epäluotettava tai ongelmallinen internetyhteys keskeytti |
| **Täysi latauksenhallintapaneeli** | Muuta jonopaneeli täydemmäksi hallintanäkymäksi, mukaan lukien jonossa olevien kohteiden kohdekansioiden vaihtaminen |
| **Ajastetut lataukset** | Käynnistä jono tiettyyn aikaan (yöajot) |
| **AUR-paketti** | Asenna Arch Linuxiin ja Omarchyyn komennolla `yay -S arroxy-bin` |

Onko sinulla ominaisuusideaa? [Avaa pyyntö](../../../../issues) — yhteisön palaute vaikuttaa prioriteetteihin.

---

## <a id="support"></a>💖 Tue Arroxya

Arroxy on ilmainen ja GPLv3-lisensoitu — ei mainoksia, ei seurantaa, ei maksullista tasoa. Jos se säästää aikaasi, voit tukea kehitystä Bitcoinilla, Tronilla tai Ethereumilla: osoitteet ovat tiedostossa [DONATE.md](../../DONATE.md), joka on niiden ainoa virallinen lähde. Arroxy ei koskaan lähetä sinulle osoitetta sähköpostitse tai yksityisviestillä. Repositorion tähdittäminen, virheistä ilmoittaminen ja käännösten parantaminen auttavat yhtä paljon.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Rakennettu näillä

<details>
<summary><strong>Teknologiat</strong></summary>

- **Electron** — alustariippumaton työpöytäkuori
- **React 19** + **TypeScript** — käyttöliittymä
- **Tailwind CSS v4** — tyylit
- **Zustand** — tilanhallinta
- **yt-dlp** + **ffmpeg** — lataus- ja yhdistysmoottori (molemmat haetaan ajon aikana: yt-dlp pidetään ajan tasalla, ffmpeg/ffprobe asennetaan kerran ja säilytetään päivitysten yli)
- **Vite** + **electron-vite** — koontityökalut
- **Vitest** + **Playwright** — yksikkö- ja päästä päähän -testit

</details>

<details>
<summary><strong>Koonti lähdekoodista</strong></summary>

### Edellytykset — kaikki alustat

| Työkalu | Versio  | Asennus |
| ------- | ------- | ------- |
| Git     | mikä tahansa | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` tai `.node-version` |
| Bun     | 1.4.2  | `mise install` tai `package.json` `packageManager` |

Suositus: asenna `mise` ja suorita `mise install` checkoutissa. Ilman misea aktivoi Node.js tiedostosta `.node-version` ja Bun tiedostosta `package.json` käsin ennen komentoa `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Natiivikäännöksiin voidaan tarvita Visual Studio Build Tools ja Python.

### macOS

```bash
brew install mise
xcode-select --install
```

Kloonauksen jälkeen suorita `mise trust && mise install` checkoutissa. Jos komentotulkkisi käyttää jo `fnm`-, `nvm`- tai Homebrew-Bunia, aktivoi mise tiedostossa `~/.zshrc`, jotta Arroxy saa Node.js 24.21.0:n ja Bun 1.4.2:n:

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

### Kloonaa ja suorita

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Jaettavan version koonti

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` asentaa riippuvuudet, koostaa Electron-sovelluksen riippuvuudet uudelleen, tarkistaa Electronin, valmistelee kehitystä varten upotetut ffmpeg/ffprobe-työkalut ja asentaa Playwright Chromiumin. Julkaisuversiot hallitsevat yt-dlp:n, ffmpegin ja ffproben ajon aikana sovelluksen tietokansiossa; mikään niistä ei sisälly asennusohjelmaan.

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

## <a id="terms"></a>📜 Käyttöehdot

Arroxy on työkalu, joka on tarkoitettu vain henkilökohtaiseen, yksityiseen käyttöön. Olet yksin vastuussa siitä, että lataamasi sisältö noudattaa YouTuben [käyttöehtoja](https://www.youtube.com/t/terms) ja lainkäyttöalueesi tekijänoikeuslainsäädäntöä. Älä käytä Arroxya sisällön lataamiseen, jäljentämiseen tai levittämiseen, jota sinulla ei ole oikeutta käyttää. Kehittäjät eivät vastaa väärinkäytöstä.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Tehty huolella, tekijä <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
