const TECH_CONTENT = `<details>
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
| Node.js | 24.21.0 | \`mise install\` tai \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` tai \`package.json\` \`packageManager\` |

Suositus: asenna \`mise\` ja suorita \`mise install\` checkoutissa. Ilman misea aktivoi Node.js tiedostosta \`.node-version\` ja Bun tiedostosta \`package.json\` käsin ennen komentoa \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Natiivikäännöksiin voidaan tarvita Visual Studio Build Tools ja Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Kloonauksen jälkeen suorita \`mise trust && mise install\` checkoutissa. Jos komentotulkkisi käyttää jo \`fnm\`-, \`nvm\`- tai Homebrew-Bunia, aktivoi mise tiedostossa \`~/.zshrc\`, jotta Arroxy saa Node.js 24.21.0:n ja Bun 1.4.2:n:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Kloonaa ja suorita

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Jaettavan version koonti

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` asentaa riippuvuudet, koostaa Electron-sovelluksen riippuvuudet uudelleen, tarkistaa Electronin, valmistelee kehitystä varten upotetut ffmpeg/ffprobe-työkalut ja asentaa Playwright Chromiumin. Julkaisuversiot hallitsevat yt-dlp:n, ffmpegin ja ffproben ajon aikana sovelluksen tietokansiossa; mikään niistä ei sisälly asennusohjelmaan.

</details>`;

export const fi = {
  icon_alt: "Arroxyn maskotti",
  title:
    "Arroxy — ilmainen avoimen lähdekoodin YouTube- (+ 2000 sivustoa) lataaja sisäänrakennetulla selaimella Windowsille, macOS:lle ja Linuxille",
  read_in_label: "Lue kielellä:",
  badge_release_alt: "Julkaisu",
  badge_build_alt: "Koonti",
  badge_license_alt: "Lisenssi",
  badge_platforms_alt: "Alustat",
  badge_i18n_alt: "Kielet",
  badge_website_alt: "Verkkosivusto",
  discord_badge_text: "Liity Discordin yhteisöön",
  discord_badge_encoded: "Liity%20Discordin%20yhteis%C3%B6%C3%B6n",
  hero_desc:
    "Lataa videoita, Shortseja, kanavia, podcasteja tai äänitiedostoja **YouTubesta ja yli 2000 tuetulta sivustolta** — jopa 8K HDR 60 kuvaa sekunnissa, MP3- / AAC- / Opus-muodossa tai vain tarvitsemasi osa. **Selaa YouTubea tai mitä tahansa muuta sivustoa Arroxyn sisällä** Tutki-välilehdellä ja lataa video, soittolista tai kanava, jolla olet; kirjaudu siellä sisään ladataksesi videoita, joita oma tilisi voi jo katsoa. Toimii paikallisesti Windowsissa, macOS:ssä ja Linuxissa. **Ei mainoksia, ei turhaa painolastia, ei myyntipuheita.**",
  cta_latest: "↓ Asenna uusin julkaisu",
  cta_website: "Verkkosivusto",
  website_url: "https://arroxy.com/",
  star_cta: "Jos Arroxy säästää aikaasi, ⭐ auttaa muita löytämään sen.",
  ai_notice: "> 🌐 Tämä käännös on tehty tekoälyn avulla. [Englanninkielinen README](README.md) on ensisijainen lähde. Löysitkö virheen? [Avaa PR](../../pulls).",
  intro_what_is:
    "**Mikä on Arroxy?** Arroxy on ilmainen, avoimen lähdekoodin työpöytäsovellus graafisella käyttöliittymällä, joka lataa videoita, ääntä, soittolistoja ja tekstityksiä YouTubesta ja yli 2000 muulta [yt-dlp](https://github.com/yt-dlp/yt-dlp):n tukemalta sivustolta. Se toimii järjestelmissä Windows 10/11, macOS 13+ (Intel + Apple Silicon) ja Linux (AppImage, Flatpak, tar.gz). GPLv3-lisenssi. Ei mainoksia, ei käyttörajoituksia. Jakelu: [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage ja suora lataus.",
  intro_key_difference:
    "**Keskeinen ero: sisäänrakennettu selain.** Useimmat ilmaiset YouTube-lataajat ovat ohuita yt-dlp-kääreitä: URL-kenttä ja muotovalikko, ilman omaa selainta. Arroxyssa sellainen on, **Tutki-välilehti**. Selaat YouTubea tai mitä tahansa muuta sivustoa sovelluksen sisällä ja lataat videon, soittolistan tai kanavan, jolla olet, tai napsautat mitä tahansa linkkiä hiiren kakkospainikkeella. Jos kirjaudut kerran sisään Tutki-välilehdellä, tilin vaativat lataukset käyttävät tuota kirjautumista: yksityiset videosi, Katso myöhemmin- ja Tykätyt-luettelosi sekä muut videot, joita tilisi voi jo katsoa, ilman evästeiden vientiä. Kirjaudu myös muille sivustoille siellä, ja niiden lataukset käyttävät kirjautumista tarvittaessa. Lisätietoja: [Miksi Arroxy](#why-explore).",
  last_updated: "Päivitetty viimeksi: {{LAST_UPDATED}}.",
  toc_heading: "Sisältö",
  why_h2: "Miksi Arroxy",
  features_h2: "Ominaisuudet",
  dl_h2: "Asennus ja ensimmäinen käynnistys",
  privacy_h2: "Tietosuoja",
  faq_h2: "UKK",
  roadmap_h2: "Tiekartta",
  tech_h2: "Rakennettu näillä",
  why_intro: "Vertailu yleisimpiin vaihtoehtoihin:",
  why_r1: "Ilmainen, ei maksullista tasoa",
  why_r2: "Avoin lähdekoodi",
  why_r3: "Vain paikallinen käsittely",
  why_r5: "Ei käyttörajoja",
  why_r6: "Alustariippumaton työpöytäsovellus",
  why_r7: "Tekstitykset + SponsorBlock",
  why_r8: "Sisäänrakennettu selain (selaa, kirjaudu, lataa)",
  why_r9: "Videot, joita oma tilisi voi katsoa, ilman evästeiden vientiä",
  why_table_note:
    "⚠️ = osittain tai vain maksullisella tasolla. 4K Video Downloaderin sovelluksen sisäinen kirjautuminen yksityisiin videoihin on maksullinen ominaisuus; useimmat ilmaiset yt-dlp-käyttöliittymät hyväksyvät vain evästetiedoston tai lukevat verkkoselaimesi evästeet.",
  why_summary:
    "Arroxy on tehty yhtä asiaa varten: siistiä paikallista tiedostoa varten, liitit URL-osoitteen tai löysit videon Tutki-välilehdeltä. Ei myyntipuheita, ei tietojen keruuta.",
  why_explore_h3: "Mitä pelkkä yt-dlp-kääre ei osaa: Tutki-välilehti",
  why_explore_intro:
    "Useimmat ilmaiset YouTube-lataajat ovat yt-dlp:n päälle tehty URL-kenttä. Arroxykin käyttää yt-dlp:tä, mutta siinä on myös **Tutki**, sovellukseen rakennettu selain, joka avaa YouTuben tai minkä tahansa muun sivuston. Tutki tuo sen, mitä URL-kenttä ei voi:",
  why_explore_1:
    "**Videot, joita tilisi voi katsoa, ilman evästeiden vientiä** — yksityiset videosi, Katso myöhemmin- ja Tykätyt-luettelosi, ikärajoitetut videot ikävarmennetulla tilillä sekä muiden sivustojen kirjautumista vaativat sivut. Pelkkä kääre tarvitsee cookies.txt-viennin tai lukee verkkoselaimesi evästeet. Arroxyssa kirjaudut kerran Tutki-välilehdellä, ja loput hoituu itsestään",
  why_explore_4:
    "**Ei linkkien kopiointia** — etsi video, soittolista tai kanava Tutki-välilehdeltä ja lataa se yhdellä napsautuksella tai napsauta mitä tahansa sivun linkkiä hiiren kakkospainikkeella",
  why_explore_5:
    "**Mainosten esto, kun haluat** — yksi napsautus kilpeen estää mainokset ja seurantaohjelmat Tutki-välilehden sivuilla",
  feat_explore_h3: "Tutki: selaa verkkoa Arroxyn sisällä",
  feat_explore_1:
    "**Tutki-välilehti** — selaa YouTubea tai mitä tahansa muuta sivustoa Arroxyn sisällä ja lataa löytämäsi ilman linkkien kopiointia. **Lataa · *profiilisi*** lisää jonoon parhaillaan katsomasi videon, soittolistan tai kanavan; sen vieressä oleva nuoli vaihtaa profiilia, ja taikasauva avaa vaiheittaisen latauksen muotojen, tekstitysten ja muun valintaa varten",
  feat_explore_6:
    "**Lataa hiiren kakkospainikkeella** — napsauta Tutki-välilehdellä mitä tahansa video-, soittolista- tai kanavalinkkiä hiiren kakkospainikkeella ladataksesi sen profiilillasi, valitaksesi toisen profiilin kohdasta **Lataa profiililla**, avataksesi vaiheittaisen latauksen tai kopioidaksesi linkin. Videoita ei tarvitse avata yksitellen",
  feat_explore_7:
    "**Tiivis asettelu** — yksi napsautus Tutki-välilehden työkalurivillä siirtää Arroxyn välilehdet sinne ja antaa sivulle enemmän tilaa",
  feat_explore_2:
    "**Osoitepalkki** — kirjoita hakeaksesi YouTubesta tai anna mikä tahansa verkko-osoite avataksesi sivuston",
  feat_explore_3:
    "**Tilin vaativat lataukset** — kirjaudu kerran Tutki-välilehdellä, ja Arroxy voi ladata videoita, joita tilisi voi katsoa: yksityiset videosi, ikärajoitettuja videoita, jos tili on ikävarmennettu, sekä Katso myöhemmin- ja Tykätyt-luettelosi. Kirjaudu myös muille sivustoille, ja niiden lataukset käyttävät kirjautumista tarvittaessa. Arroxy lataa edelleen ensin kirjautumattomana ja käyttää Tutki-kirjautumistasi vain, kun lataus epäonnistuu tavalla, jonka tili voi korjata",
  feat_explore_4:
    "**Käytä toissijaista tiliä** — Tutki-välilehden ensimmäinen näkymä selittää miksi: tilillä lataamiseen liittyy riski tilin rajoittamisesta. Kirjaudu ulos Tutki-välilehdeltä Asetuksista milloin tahansa, kun haluat unohtaa kirjautumisesi",
  feat_explore_5:
    "**Mainosten esto** — pois päältä oletuksena. Yksi napsautus kilpeen Tutki-välilehden työkalurivillä estää mainokset ja seurantaohjelmat sen sivuilla vaikuttamatta latauksiin. YouTube voi vastustaa mainosten estoa sisäänkirjautuneilla tileillä",
  feat_quality_h3: "Laatu ja muodot",
  feat_quality_1: "Jopa **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Korkea kuvataajuus ja HDR** säilyvät sellaisenaan — 60 kuvaa sekunnissa, HDR10",
  feat_quality_3:
    "**Ääni** — vie vain ääni MP3-, M4A/AAC-, Opus- tai WAV-muodossa. Vaiheittaisissa latauksissa voit valita lähteen alkuperäiset surround-/Dolby-raidat (AC-3, E-AC-3, 5.1, DRC), kun ne ovat saatavilla, tai asettaa yleisen oletuksen **Suosi surroundia / Dolbya**",
  feat_quality_4:
    "**Tavoitteelliset profiilit** — *Paras kuva* (AV1 · VP9) tai *Smart TV* (MP4 · H.264), tallennettuna muodossa Auto, MP4, MKV tai WebM ilman uudelleenkoodausta. HDR on *Auto* (vain kun näyttösi osaa näyttää sen), *SDR* tai *HDR*",
  feat_quality_5:
    "**Jokainen koodekki jokaisella tarkkuudella** — vaiheittainen lataus listaa AV1:n, VP9:n ja H.264:n rinnakkain jokaisella tarkkuudella, joten voit valita sen, jonka televisiosi tai editorisi toistaa",
  feat_quality_6:
    "**Tiedä, mitä virta oikeasti on** — tekoälyllä YouTuben skaalaamat koot, tekoälydubatut äänikielet, parannetun bittinopeuden virrat, 360°-videot sekä vioittuneet tai vesileimatut kopiot on merkitty. Profiilit ohittavat tekoälyllä skaalatut virrat, ellet salli niitä",
  feat_privacy_h3: "Tietosuoja ja hallinta",
  feat_privacy_1:
    "100 % paikallinen käsittely — lataukset menevät suoraan YouTubesta levyllesi",
  feat_privacy_2: "**Avoin lähdekoodi** — jokainen rivi tarkastettavissa, GPLv3-lisenssi",
  feat_privacy_3: "Tiedostot tallennetaan suoraan valitsemaasi kansioon",
  feat_workflow_h3: "Työnkulku",
  feat_workflow_12:
    "**Yleinen lataus-pikanäppäin** — kopioi linkki mistä tahansa sovelluksesta ja paina `Ctrl+Shift+D` (`Cmd+Shift+D` macOS:ssä); Arroxy lisää sen jonoon aktiivisella profiilillasi avaamatta ikkunaa, ja ilmoitus vahvistaa sen. Oletuksena päällä, uudelleenmääritettävissä",
  feat_workflow_1:
    "**Joustavat aloitustavat** — valitse ohjattu yksittäinen lataus, soittolista-/kanavavalitsin, usean URL-osoitteen liittäminen, Pikalataus tallennetuilla oletuksilla tai selaa ja lataa Tutki-välilehdeltä",
  feat_workflow_2:
    "**Keskitetty latausjono** — jokainen yksittäinen, soittolista-, usean URL-osoitteen tai pikalataus päätyy samaan paikkaan edistymisen, keskeytyksen, jatkamisen, peruutuksen, uudelleenyrityksen ja prioriteetin hallintaa varten",
  feat_workflow_3:
    "**Leikepöydän seuranta** — kopioi videolinkki, ja se täyttää URL-kentän, kun palaat Arroxyyn; **Kumoa** auttaa, jos et tarkoittanut sitä. Kun Arroxy on kiireinen, linkki odottaa, kunnes palaat URL-välilehdelle (voit poistaa sen käytöstä Asetuksista)",
  feat_workflow_4:
    "**URL-osoitteiden automaattinen siivous** — poistaa seurantaparametrit (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ja purkaa `youtube.com/redirect`-linkit",
  feat_workflow_5:
    "**Ilmaisinalue-tila** — ikkunan sulkeminen pitää lataukset käynnissä taustalla",
  feat_workflow_6:
    "**{{LANG_COUNT}} kieltä** — tunnistaa järjestelmän kielen automaattisesti, vaihdettavissa milloin tahansa",
  feat_workflow_7:
    "**Soittolistan synkronointi** — tarkista soittolista uudelleen paikallista kansiota vasten ohittaaksesi jo ladatut videot; luo `.m3u`-soittolistatiedoston, jota päivitetään kunkin videon latautuessa",
  feat_workflow_8:
    "**Nopeuden ja tahdistuksen hallinta** — rajoita latauksen kaistanleveyttä, aseta kuinka monta videon osaa ladataan kerralla ja lisää pyyntöviiveitä esiasetuksilla (*Pois · Tasapainoinen · Varovainen · Mukautettu*)",
  feat_workflow_9:
    "**Tiedostonimen mallit** — nimeä lataukset haluamallasi tavalla tunnisteilla `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` ja `{playlist_index}`, yleisesti tai latausprofiilikohtaisesti",
  feat_workflow_10:
    "**Lataukset kerralla ja automaattinen uudelleenyritys** — valitse, kuinka monta jonossa olevaa latausta ajetaan samanaikaisesti, ja anna Arroxyn yrittää uudelleen latausta, joka kohtasi verkko- tai palvelinongelman, odottaen pidempään ennen jokaista yritystä",
  feat_workflow_11:
    "**Soittolistan kohdekohtaiset profiilit** — anna jokaiselle soittolistan videolle oma latausprofiilinsa koko listan yhden asetuksen sijaan, jolloin yhdellä kerralla voi arkistoida osan täydellä laadulla ja tallentaa loput pelkkänä äänenä",
  feat_workflow_13:
    "**Pikalataus toimii taustalla** — linkki ilmestyy heti Lataukset-näkymään ja valmistuu siellä, **Näytä**-ilmoitus vahvistaa sen ja URL-kenttä tyhjenee seuraavaa linkkiä varten. Aloita niin monta kuin haluat, kun aiemmat valmistuvat",
  feat_workflow_14:
    "**Lataukset kertoo, mikä tarvitsee sinua** — jos Arroxy ei pysty lukemaan linkkiä, sen rivi kertoo syyn ja tarjoaa korjauksen: Yritä uudelleen, ota evästeet käyttöön tai kirjaudu Tutki-välilehdellä. Kun evästeet ovat pois päältä, **Kirjaudu Tutki-näkymässä** yrittää sitä puolestasi uudelleen, kun olet kirjautunut. Latausrajaasi pidempi soittolista odottaa rivillään, että valitset kaikki, ensimmäiset tai tarkistuksen. Lataukset-välilehti laskee sinua odottavat rivit",
  feat_workflow_15:
    "**Lataa vain osa videosta** — valitse Muoto-näytöllä alku ja loppu tai luku, ja Arroxy tallentaa vain sen alueen, nimettynä alueella videotunnuksen jälkeen. Leikkaukset osuvat lähimpään avainkuvaan; ota tarkka leikkaus käyttöön, jos haluat sen sijaan koodata uudelleen",
  feat_workflow_16:
    "**Poista valmistuneet lataukset** — valinnainen: valmistunut lataus poistuu luettelosta 5 sekunnin kuluttua. Sen tiedostot pysyvät levyllä, ja epäonnistuneet lataukset pysyvät luettelossa",
  feat_workflow_17:
    "**Koko ja Puuttuu Latauksissa** — lajiteltava **Koko**-sarake näyttää, kuinka paljon tilaa kukin lataus vie, ja **Puuttuu** merkitsee tiedostot, jotka on siirretty tai poistettu Arroxyn ulkopuolella",
  feat_workflow_18:
    "**Aurora tai Minimal, tumma tai vaalea** — lasipaneeleja liikkuvan taivaan päällä tai rauhallisia tasaisia pintoja; vaihda alatunnisteesta. Tietokoneet ilman grafiikkakiihdytystä saavat Minimalin automaattisesti",
  feat_workflow_19:
    "**Macin valikkorivi** — avaa macOS:ssä Asetukset (`Cmd+,`), aseta latausnopeuden raja, vaihda tyyliä ja teemaa sekä avaa lokit tai tallenna diagnostiikkatiedosto valikkoriviltä",
  feat_workflow_20:
    "**Muuta profiilia mistä tahansa latauksesta** — säädä latausta ja päivitä sitten profiili, josta se alkoi (muutosten esikatselulla), tai tallenna asetukset uudeksi profiiliksi. Profiilin vaihtaminen kysyy, säilytetäänkö muokkauksesi",
  feat_post_h3: "Tekstitykset ja jälkikäsittely",
  feat_post_1:
    "**Tekstitykset** SRT-, VTT- tai ASS-muodossa — manuaaliset tai automaattisesti luodut, millä tahansa saatavilla olevalla kielellä",
  feat_post_2:
    "Tallenna videon viereen, upota `.mkv`-tiedostoon tai järjestä `Subtitles/`-alikansioon",
  feat_post_3:
    "**SponsorBlock** — ohita tai merkitse luvuiksi sponsorit, introt, outrot ja omamainokset",
  feat_post_4:
    "**Upotetut metatiedot** — nimi, lisäyspäivä, kanava, kuvaus, pikkukuva ja lukumerkit kirjoitetaan tiedostoon",
  feat_post_5:
    "**Vain tekstityksiä sisältävät erät** — liitä URL-osoitteiden luettelo tai avaa soittolista, valitse Tekstitykset ja saat vain jokaisen videon tekstitystiedostot",
  feat_sites_h3: "YouTube + 2000 sivustoa",
  feat_sites_1:
    "**YouTube kokonaisuudessaan** — Videot, Shortsit, Kanavat, Soittolistat, YouTube Music ja Podcastit käsitellään ensiluokkaisina lähteinä",
  feat_sites_2:
    "**Yli 2000 muuta sivustoa** yt-dlp:n kautta — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable ja monet muut",
  feat_sites_3:
    "**Vain ääni ja tekstitykset** toimivat kaikilla tuetuilla sivustoilla, ei vain YouTubessa",
  feat_sites_4:
    "Jos sivusto muuttuu, yt-dlp julkaisee korjauksia viikoittain ja Arroxy päivittää binäärin automaattisesti käynnistyessään",
  shot1_cap:
    "<b>Pikalatauksen etusivu</b><br/>Liitä URL-osoite ja lataa se heti aktiivisella profiilillasi",
  shot2_cap:
    "<b>Uudelleenkäytettävät latausprofiilit</b><br/>Tallenna muoto-, laatu- ja tulosteesiasetukset — käytä uudelleen latauksittain",
  shot3_cap:
    "<b>Monikieliset ääniraidat</b><br/>Valitse tarkka äänen kieli, jonka video tarjoaa",
  shot4_cap:
    "<b>Surround- / Dolby-ääni</b><br/>5.1- ja Dolby-raidat tunnistetaan ja säilytetään",
  shot5_cap:
    "<b>Usean URL-osoitteen tila</b><br/>Liitä luettelo, kaksoiskappaleet poistetaan automaattisesti, lisää kaikki jonoon kerralla",
  shot6_cap:
    "<b>Rinnakkainen latausjono</b><br/>Useita latauksia kerralla reaaliaikaisella edistymisellä",
  hotkey_fig_alt:
    "Arroxyn yleinen lataus-pikanäppäin — Ctrl+Shift+D Windowsissa ja Linuxissa, Cmd+Shift+D macOS:ssä, lähettää kopioidun linkin suoraan latausjonoon",
  hotkey_fig_cap:
    "<b>Yleinen lataus-pikanäppäin</b><br/>Kopioi linkki mistä tahansa, paina kerran — se päätyy jonoon ja alkaa latautua",
  shot7_cap: "<b>Soittolistan kohdekohtaiset profiilit</b><br/>Anna jokaiselle videolle oma profiili — arkistoi osa 4K:na, tallenna loput pelkkänä äänenä",
  shot8_cap:
    "<b>Tutki</b><br/>Selaa YouTubea tai mitä tahansa muuta sivustoa Arroxyn sisällä ja lataa sivu, jolla olet, aktiivisella profiilillasi",
  shot9_cap:
    "<b>Tutki-välilehden ensimmäinen näkymä</b><br/>Lyhyt katsaus Tutki-välilehteen ja miksi toissijainen tili on turvallisempi kirjautuminen",
  shot10_cap:
    "<b>Lataukset kertoo, mikä tarvitsee sinua</b><br/>Linkit valmistuvat taustalla; epäonnistunut tarjoaa korjauksensa, pitkä soittolista odottaa valintaasi",
  shot11_cap:
    "<b>Lataa vain osa videosta</b><br/>Valitse alku ja loppu tai luku — Arroxy tallentaa vain sen alueen",
  shot12_cap:
    "<b>Profiilieditori</b><br/>Säädä profiilia: tiedostotyyppi, tarkkuus, tekstitykset, kohde, tiedostonimen malli ja paljon muuta",
  shot13_cap:
    "<b>Tumma tai vaalea, lasi tai tasainen</b><br/>Neljä ulkoasua: lasipaneeleja liikkuvan taivaan päällä tai rauhallisia tasaisia pintoja, kumpikin tummana ja vaaleana",
  shot14_cap:
    "<b>8K HDR 60 kuvaa sekunnissa</b><br/>Jokainen videon tarjoama tarkkuus, koodekki ja HDR-virta rinnakkain",
  dl_platform_col: "Alusta",
  dl_format_col: "Suora lataus",
  dl_oneline_note:
    "Koonnokset ovat vain x86_64:lle. Eikö `curl` löydy? Korvaa `curl -fsSL` komennolla `wget -qO-`.",
  dl_win_scoop:
    "Käytätkö mieluummin Scoopia? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Asennusohjelma (NSIS) tai kannettava `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` tai `.flatpak` (hiekkalaatikossa)",
  dl_grab: "Kaikki julkaisun tiedostot →",
  dl_pkg_h3: "Asenna paketinhallinnalla",
  dl_channel_col: "Kanava",
  dl_command_col: "Komento",
  dl_win_h3: "Windows: asennusohjelma vs. kannettava",
  dl_win_col_installer: "NSIS-asennusohjelma",
  dl_win_col_portable: "Kannettava `.exe`",
  dl_win_r1: "Vaatii asennuksen",
  dl_win_r1_installer: "Kyllä",
  dl_win_r1_portable: "Ei — suoritettavissa mistä tahansa",
  dl_win_r2: "Automaattiset päivitykset",
  dl_win_r2_installer: "✅ sovelluksessa",
  dl_win_r2_portable: "❌ manuaalinen lataus",
  dl_win_r3: "Käynnistysnopeus",
  dl_win_r3_installer: "✅ nopeampi",
  dl_win_r3_portable: "⚠️ hitaampi kylmäkäynnistys",
  dl_win_r4: "Lisää Käynnistä-valikkoon",
  dl_win_r5: "Helppo poisto",
  dl_win_r5_portable: "❌ poista tiedosto",
  dl_win_rec:
    "**Suositus:** käytä NSIS-asennusohjelmaa automaattisia päivityksiä ja nopeampaa käynnistystä varten. Käytä kannettavaa `.exe`-tiedostoa, jos haluat vaihtoehdon ilman asennusta ja rekisterimerkintöjä.",
  dl_win_smartscreen_h4: "Windows SmartScreen -varoitus",
  dl_win_smartscreen_intro:
    "Ensimmäisellä käynnistyksellä saatat nähdä **”Windows suojasi tietokoneesi”** tai **”Tuntematon julkaisija”**. Tämä koskee sekä tiedostoa `Arroxy-win-x64-Setup.exe` että tiedostoa `Arroxy-win-x64-Portable.exe`. Arroxy on ilmainen ja avoimen lähdekoodin, eikä Windows-koonnoksia ole allekirjoitettu maksullisella varmenteella, minkä vuoksi SmartScreen merkitsee ne. Se **ei** automaattisesti tarkoita, että Arroxy olisi vaarallinen. Jatka näin:",
  dl_win_smartscreen_step1: "Napsauta **Lisätietoja**.",
  dl_win_smartscreen_step2: "Napsauta **Suorita silti**.",
  dl_win_smartscreen_official:
    "Lataa Arroxy vain viralliselta GitHub Releases -sivulta. Jos sait tiedoston toiselta verkkosivustolta tai joku lähetti sen sinulle, poista se ja lataa uusi kopio virallisesta lähteestä. Lähdekoodi on julkinen, joten voit tarkastaa sen tai koota Arroxyn itse, jos haluat.",
  dl_macos_h3: "Ensimmäinen käynnistys macOS:ssä",
  dl_macos_warning:
    "Arroxya ei ole vielä allekirjoitettu koodiallekirjoituksella, joten macOS Gatekeeper voi näyttää ensimmäisellä käynnistyksellä viallisen sovelluksen varoituksen. Tämä on odotettua — se ei tarkoita, että tiedosto olisi oikeasti vaurioitunut.",
  dl_macos_m1_h4: "Pääteohjelmamenetelmä:",
  dl_macos_step1: "Vedä `Arroxy.app` liitetystä DMG:stä kansioon `/Applications`.",
  dl_macos_step2:
    "Avaa Pääte ja suorita `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Suorita `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Jos sovelluksen polku on eri, korvaa `/Applications/Arroxy.app` polulla, johon asensit sen.",
  dl_macos_step5:
    "Anna Macin salasanasi, jos `sudo` kysyy sitä.",
  dl_macos_after:
    "Kun karanteeni on poistettu, Arroxy avautuu normaalisti.",
  dl_macos_m2_h4: "Pääteohjelmamenetelmä:",
  dl_macos_note:
    "macOS-koonnokset tehdään CI:ssä Apple Silicon- ja Intel-ajureilla. Jos kohtaat ongelmia, [avaa ongelmailmoitus](../../issues) — macOS-käyttäjien palaute muokkaa aktiivisesti macOS-testaussykliä.",
  dl_linux_h3: "Ensimmäinen käynnistys Linuxissa",
  dl_linux_intro:
    "AppImage-tiedostot suoritetaan suoraan — asennusta ei tarvita. Tiedosto tarvitsee vain merkitä suoritettavaksi.",
  dl_linux_m1_text:
    "**Tiedostonhallinta:** napsauta `.AppImage`-tiedostoa hiiren kakkospainikkeella → **Ominaisuudet** → **Oikeudet** → ota käyttöön **Salli tiedoston suorittaminen ohjelmana** ja kaksoisnapsauta sitten.",
  dl_linux_m2_h4: "Pääte:",
  dl_linux_fuse_text: "Jos käynnistys silti epäonnistuu, suorita se liittämättä — FUSE-pakettia ei tarvita:",
  dl_linux_targz_h4: "Pelkkä tarball (ei FUSEa, ei asennusta):",
  dl_linux_targz_text: "`.tar.gz`-koonti on sama sovellus ilman AppImage-kääreää — pura se mihin tahansa ja suorita. Asennusohjelmaa tai FUSE-pakettia ei tarvita.",
  dl_linux_arch_note: "**Julkaisusivun Linux-lataukset ovat vain x86_64:lle.** ARM64-koneilla (Raspberry Pi, Asahi Linux) Flatpak asentuu yhä, mutta epäonnistuu käynnistyksessä virheeseen `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Miksi saatat nähdä varoituksen",
  dl_warning_p1:
    "Arroxy on avointa lähdekoodia ja GPLv3-lisensoitu. Windows- ja macOS-koonnoksia **ei ole allekirjoitettu koodiallekirjoituksella** — Apple Developer ID- ja Windows EV -koodiallekirjoitusvarmenteet maksavat kumpikin satoja dollareita vuodessa, jotka itsenäinen projekti maksaa omasta pussistaan. Ilman näitä allekirjoituksia Windows SmartScreen ja macOS Gatekeeper varoittavat ensimmäisellä käynnistyksellä. Varoitukset tarkoittavat, että *käyttöjärjestelmäsi ei tunnista julkaisijaa* — ne eivät tarkoita, että Arroxy olisi haittaohjelma.",
  dl_warning_p2:
    "Kolme tapaa varmistaa Arroxy itse, tiukkuuden mukaan nousevassa järjestyksessä:\n\n- **Lue lähdekoodi.** Jokainen rivi on [GitHubissa](https://github.com/antonio-orionus/Arroxy), ja voit [koota sen lähdekoodista](#tech).\n- **Tarkista SHA256.** Vertaa tiedostoasi julkaistuun tiedostoon [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — katso alta [Varmista lataamasi tiedosto](#verify).\n- **Suorita kolmannen osapuolen tarkistus.** Lataa tiedosto palveluun [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Windowsin ensimmäinen käynnistys",
  shot_smartscreen_more_alt:
    "SmartScreen-ikkuna ”Windows suojasi tietokoneesi”, jossa ”Lisätietoja”-linkki on korostettu",
  shot_smartscreen_run_alt:
    "SmartScreen-ikkuna Lisätietoja-kohdan laajentamisen jälkeen, ”Suorita silti” -painike näkyvissä",
  dl_win_defender_h4: "Jos Windows Defender merkitsee tai poistaa tiedoston",
  dl_win_defender_p:
    "Defenderin heuristiikka merkitsee joskus allekirjoittamattomat NSIS-asennusohjelmat ja Electron-kannettavat epäilyttäviksi. Jos Defender asettaa tiedoston `Arroxy-win-x64-Setup.exe` tai `Arroxy-win-x64-Portable.exe` karanteeniin, palauta se kohdasta **Windows-suojaus → Virus- ja uhkien torjunta → Suojaushistoria** ja lisää sitten Arroxyn suoritettava tiedosto sallituksi kohteeksi kohdassa **Hallitse asetuksia → Lisää tai poista poissulkemisia**. Kuten SmartScreenin kohdalla, laukaisijana on puuttuva julkaisijan allekirjoitus, ei havaittu haittaohjelma.",

  dl_macos_first_h3: "macOS:n ensimmäinen käynnistys",
  dl_macos_intro:
    "Arroxyn macOS-koonnokset on allekirjoitettu ad hoc -menetelmällä, mutta Apple ei ole notarisoinut niitä, joten Gatekeeper estää ensimmäisen käynnistyksen ilmoituksella *”Arroxy.app” ei avattu — Apple ei voinut vahvistaa, että ”Arroxy.app” on vapaa haittaohjelmista*. Se tarkoittaa, ettei macOS voi tarkistaa sovellusta Applen kanssa, ei sitä, että tiedostoissa olisi jotain vikaa. Asennus Homebrew-ohjelmalla välttää tämän ikkunan kokonaan. Jos käytit DMG:tä, yksi Pääte-komento poistaa sen:",
  dl_macos_sequoia_h4: "Pääte-korjaus nykyiselle macOS:lle",
  dl_macos_sequoia_intro:
    "Käytä Päätettä, kun olet kopioinut Arroxyn Ohjelmat-kansioon:",
  dl_macos_sequoia_step1:
    "Vedä `Arroxy.app` liitetystä DMG:stä kansioon `/Applications`.",
  dl_macos_sequoia_step2:
    "Avaa Pääte ja suorita nämä kaksi komentoa:",
  dl_macos_sequoia_step3:
    "Käynnistä Arroxy suorittamalla `open /Applications/Arroxy.app`.",
  dl_macos_sequoia_step4:
    "Jos sovelluksen polku on eri, korvaa `/Applications/Arroxy.app` polulla, johon asensit sen.",
  dl_macos_sonoma_h4: "Pääte-korjaus vanhemmalle macOS:lle",
  dl_macos_sonoma_step1:
    "Vedä `Arroxy.app` liitetystä DMG:stä kansioon `/Applications`.",
  dl_macos_sonoma_step2:
    "Avaa Pääte ja poista karanteeni kohteesta `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Käynnistä Arroxy Päätteestä tai Finderista karanteenin poistamisen jälkeen.",
  dl_macos_damaged_h4:
    "Gatekeeperin karanteenikorjaus",
  dl_macos_damaged_p:
    "Ensimmäinen komento poistaa karanteenimääritteen, jonka macOS liitti tiedostoon sen latautuessa; toinen käynnistää sovelluksen. Yleensä et tarvitse `sudo`-komentoa, koska kansiossa `/Applications` oleva kopio on sinun — lisää se vain, jos saat oikeusvirheen.",
  dl_macos_arch_note:
    "**Apple Silicon vs. Intel:** M-sarjan Macissa (M1 / M2 / M3 / M4) lataa `arm64`-DMG. Intel-Maceissa lataa `x64`-DMG. Väärän koonnoksen käyttö toimii silti Rosettan kautta, mutta on selvästi hitaampaa.",

  dl_linux_first_h3: "Linuxin ensimmäinen käynnistys",
  dl_linux_appimagelauncher:
    "**Valinnainen työpöytäintegraatio:** asenna [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) kerran, niin jokainen kaksoisnapsauttamasi AppImage rekisteröidään automaattisesti sovellusvalikkoosi — `.desktop`-tiedostoa ei tarvitse luoda käsin.",

  dl_verify_h3: "Varmista lataamasi tiedosto (SHA256)",
  dl_verify_intro:
    "Jokainen julkaisu sisältää binäärien rinnalla `SHA256SUMS`-tiedoston. Tarkistaaksesi, ettei lataus vioittunut tai muuttunut siirron aikana, laske tiedostosi tiiviste paikallisesti ja vertaa sitä `SHA256SUMS`-tiedoston riviin. Avaa uusimman julkaisun sivu → **Assets** → lataa `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell tai Komentokehote):",
  dl_verify_mac_label: "macOS (Pääte):",
  dl_verify_linux_label: "Linux (Pääte):",
  dl_verify_vt_text:
    "Haluatko kolmannen osapuolen haittaohjelmatarkistuksen? Lataa tiedosto palveluun [VirusTotal](https://www.virustotal.com). Muutama yleisen heuristiikan merkintä pieniltä moottoreilta on normaalia allekirjoittamattomille Electron-sovelluksille; laaja tunnistus suurilta moottoreilta olisi todellinen huolenaihe.",

  dl_pm_intro:
    "Haluatko toisen kanavan? Nämä toimivat myös, ja ne pysyvät ajan tasalla jokaisen julkaisun kanssa.",

  privacy_p1:
    "Lataukset haetaan suoraan [yt-dlp:n](https://github.com/yt-dlp/yt-dlp) kautta YouTubesta valitsemaasi kansioon — mitään ei reititetä kolmannen osapuolen palvelimen kautta. Katseluhistoria, lataushistoria, URL-osoitteet ja tiedostojen sisältö pysyvät laitteellasi.",
  privacy_reports:
    "Ei seurantaa — yksi nimetön elonmerkki päivässä (sovelluksen versio, käyttöjärjestelmä, kieli, asennuskanava, maa ja suunnilleen kuinka kauan Arroxy on ollut asennettuna), jotta voimme laskea aktiiviset ja uudet käyttäjät, sekä, kun Arroxy lataa tai päivittää yt-dlp:n ja FFmpegin, nimetön ilmoitus siitä, onnistuiko se ja suunnilleen kuinka kauan se kesti. Ei tunnisteita, URL-osoitteita, videoiden nimiä, tiedostopolkuja tai tilitietoja. Voit poistaa molemmat käytöstä Asetuksista.",
  privacy_p3:
    "Tutki säilyttää omat kirjautumisensa erillään selaimestasi, eikä Arroxy koskaan lue tai täytä kirjautumislomaketta — kirjoitat sivuston omalle sivulle. Lataukset ajetaan kirjautumattomana; vasta kun lataus epäonnistuu tavalla, jonka tili voi korjata, Arroxy lukee kirjautumisen uudelleen, säilyttää sen väliaikaisessa tiedostossa kyseistä latausta varten ja poistaa tiedoston sen jälkeen. Uloskirjautuminen Tutki-välilehdeltä Asetuksissa unohtaa ne.",
  faq_q1: "Onko se oikeasti ilmainen?",
  faq_a1: "Kyllä — GPLv3-lisenssi, ei maksullista tasoa, ei ominaisuuksien rajoitusta.",
  faq_q11: "Miten Arroxy eroaa muista yt-dlp-käyttöliittymistä?",
  faq_a11:
    "Useimmat ilmaiset yt-dlp-käyttöliittymät ovat kääreitä, jotka ottavat vain linkin. Arroxy lisää **Tutki**-välilehden, sovellukseen rakennetun selaimen, joka avaa YouTuben tai minkä tahansa muun sivuston: selaat ja lataat ilman linkkien kopiointia, ja kirjaudut siellä kerran ladataksesi videoita, joita tilisi voi katsoa, kuten yksityiset videosi sekä Katso myöhemmin- ja Tykätyt-luettelosi, ilman evästeiden vientiä. Katso [Miksi Arroxy](#why).",
  faq_q2: "Minkä laatuisia videoita voin ladata?",
  faq_a2:
    "Kaikkea, mitä YouTube tarjoaa: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p sekä pelkkä ääni. 60 kuvan sekuntitaajuus ja HDR-virrat säilyvät sellaisenaan, ja vaiheittainen lataus antaa valita AV1:n, VP9:n tai H.264:n jokaisella tarkkuudella.",
  faq_q3: "Voinko poimia vain äänen MP3-muodossa?",
  faq_a3:
    "Kyllä. Valitse muotovalikosta *vain ääni* ja valitse MP3, M4A/AAC, Opus tai WAV.",
  faq_q4: "Miten lataan videoita, jotka vaativat YouTube-tilin?",
  faq_a4:
    "Kirjaudu kerran Tutki-välilehdellä. Sen jälkeen Arroxy voi ladata videoita, joita tilisi voi katsoa: yksityiset videosi, ikärajoitettuja videoita, jos tili on ikävarmennettu, sekä Katso myöhemmin- ja Tykätyt-luettelosi. Se käyttää kirjautumista vain, kun lataus epäonnistuu tavalla, jonka tili voi korjata; kaikki muu latautuu kuten ennen. Tämä on **Tutki-kirjautuminen** -vaihtoehto, joka on evästeasetuksissa ensimmäisenä ja merkitty Suositelluksi, ja Arroxy valitsee sen puolestasi, kun avaat Tutki-välilehden ensimmäisen kerran. yt-dlp:n wikissä todetaan, että [kirjautuneena tehty automaatio voi johtaa Google-tilin merkitsemiseen](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), joten toissijainen tili on turvallisempi valinta.",
  faq_q5: "Toimiiko se edelleen, kun YouTube muuttaa jotain?",
  faq_a5:
    "yt-dlp päivitetään automaattisesti käynnistyksen yhteydessä, ja Arroxy julkaisee korjauksia nopeasti, kun YouTube muuttaa jotain. Kun lataus vaatii kirjautumisen, Arroxy käyttää Tutki-kirjautumistasi, jos olet kirjautunut siellä, ja evästeet tiedostosta tai selaimestasi ovat käytettävissä evästeasetuksissa.",
  faq_q6: "Millä kielillä Arroxy on saatavilla?",
  faq_a6:
    "{{LANG_COUNT}} kieltä valmiina: {{LANG_NAME_LIST}}. Arroxy tunnistaa käyttöjärjestelmäsi kielen automaattisesti ensimmäisellä käynnistyksellä, ja voit vaihtaa sitä milloin tahansa työkalurivin kielivalitsimesta. Ajonaikaiset kielitiedostot (JSON) sijaitsevat kansiossa src/shared/i18n/locales/ ja kääntäjille tarkoitetut PO-luettelot kansiossa i18n/locales/ — osallistu avaamalla PR GitHubissa.",
  faq_q7: "Tarvitseeko minun asentaa jotain muuta?",
  faq_a7:
    "Ei. yt-dlp, ffmpeg ja ffprobe ladataan automaattisesti ensimmäisellä käynnistyksellä ja tallennetaan koneellesi välimuistiin. Sen jälkeen lisämäärityksiä ei tarvita.",
  faq_q8: "Voinko ladata soittolistoja tai kokonaisia kanavia?",
  faq_a8:
    "Kyllä — molempia. Liitä soittolistan URL tai kanavan URL (esim. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); valitse, kuinka monta kohdetta tarkistetaan, ja lisää sitten koko luettelo jonoon tai valitse tiettyjä videoita. Päivämääräsuodattimet tulevat pian.",
  faq_q9: "macOS sanoo ”sovellus on vioittunut” — mitä teen?",
  faq_a9:
    "Se on macOS Gatekeeper, joka estää allekirjoittamattoman sovelluksen, ei todellinen vaurio. Katso [macOS:n ensimmäinen käynnistys](#macos-first-launch) Pääte-komennot, jotka poistavat karanteenin ja käynnistävät Arroxyn.",
  faq_q10: "Onko YouTube-videoiden lataaminen laillista?",
  faq_a10:
    "Se riippuu maastasi ja siitä, mitä lataat. Lataa vain sisältöä, jonka omistat, jonka lataaminen on lisensoitu tai jonka kopioiminen on maasi lain mukaan sallittua. Olet itse vastuussa YouTuben [käyttöehtojen](https://www.youtube.com/t/terms) ja paikallisen tekijänoikeuslainsäädännön noudattamisesta. Katso [Käyttöehdot](#terms).",
  plan_intro: "Vielä suunnitteilla — suunnilleen tärkeysjärjestyksessä:",
  plan_col1: "Ominaisuus",
  plan_col2: "Kuvaus",
  plan_r1_name: "**Soittolista- ja kanavasuodattimet**",
  plan_r1_desc: "Päivämääräsuodattimet soittolistan tai kanavan kohteita lueteltaessa",
  plan_r2_name: "**YouTuben ääniraitojen asetukset**",
  plan_r2_desc:
    "Aseta sovelluksen laajuinen puhutun kielen raidan asetus, profiilikohtaisilla ohituksilla, kun YouTube tarjoaa useita ääniraitoja",
  plan_r3_name: "**Vahvempi uudelleenyrityksestä toipuminen**",
  plan_r3_desc:
    "Uusi uudelleenyrityspolku lataukselle, jonka epäluotettava tai ongelmallinen internetyhteys keskeytti",
  plan_r4_name: "**Täysi latauksenhallintapaneeli**",
  plan_r4_desc:
    "Muuta jonopaneeli täydemmäksi hallintanäkymäksi, mukaan lukien jonossa olevien kohteiden kohdekansioiden vaihtaminen",
  plan_r5_name: "**Ajastetut lataukset**",
  plan_r5_desc: "Käynnistä jono tiettyyn aikaan (yöajot)",
  plan_r9_name: "**AUR-paketti**",
  plan_r9_desc: "Asenna Arch Linuxiin ja Omarchyyn komennolla `yay -S arroxy-bin`",
  plan_cta:
    "Onko sinulla ominaisuusideaa? [Avaa pyyntö](../../issues) — yhteisön palaute vaikuttaa prioriteetteihin.",
  tech_content: TECH_CONTENT,
  support_h2: "Tue Arroxya",
  support_line: "Arroxy on ilmainen ja GPLv3-lisensoitu — ei mainoksia, ei seurantaa, ei maksullista tasoa. Jos se säästää aikaasi, voit tukea kehitystä Bitcoinilla, Tronilla tai Ethereumilla: osoitteet ovat tiedostossa [DONATE.md](DONATE.md), joka on niiden ainoa virallinen lähde. Arroxy ei koskaan lähetä sinulle osoitetta sähköpostitse tai yksityisviestillä. Repositorion tähdittäminen, virheistä ilmoittaminen ja käännösten parantaminen auttavat yhtä paljon.",
  tos_h2: "Käyttöehdot",
  tos_note:
    "Arroxy on työkalu, joka on tarkoitettu vain henkilökohtaiseen, yksityiseen käyttöön. Olet yksin vastuussa siitä, että lataamasi sisältö noudattaa YouTuben [käyttöehtoja](https://www.youtube.com/t/terms) ja lainkäyttöalueesi tekijänoikeuslainsäädäntöä. Älä käytä Arroxya sisällön lataamiseen, jäljentämiseen tai levittämiseen, jota sinulla ei ole oikeutta käyttää. Kehittäjät eivät vastaa väärinkäytöstä.",
  footer_credit:
    'GPLv3 · Tehty huolella, tekijä <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
