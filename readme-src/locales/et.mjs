const TECH_CONTENT = `<details>
<summary><strong>Tehnoloogiapinu</strong></summary>

- **Electron** — platvormideülene töölauaraamistik
- **React 19** + **TypeScript** — kasutajaliides
- **Tailwind CSS v4** — stiilid
- **Zustand** — olekuhaldus
- **yt-dlp** + **ffmpeg** — allalaadimis- ja muksimismootor (mõlemad tuuakse käitusajal: yt-dlp hoitakse ajakohasena, ffmpeg/ffprobe installitakse üks kord ja säilivad uuenduste vahel)
- **Vite** + **electron-vite** — ehitustööriistad
- **Vitest** + **Playwright** — ühik- ja otspunktitestid

</details>

<details>
<summary><strong>Ehitamine lähtekoodist</strong></summary>

### Eeltingimused — kõik platvormid

| Tööriist | Versioon | Installimine |
| ------- | ------- | ------- |
| Git     | mis tahes | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` või \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` või \`package.json\` \`packageManager\` |

Soovitus: installige \`mise\` ja käivitage kloonitud kaustas \`mise install\`. Ilma miseta aktiveerige enne käsku \`bun run bootstrap\` käsitsi Node.js failist \`.node-version\` ja Bun failist \`package.json\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Natiivseks ümberehitamiseks võivad olla vajalikud Visual Studio Build Tools ja Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Pärast kloonimist käivitage kloonitud kaustas \`mise trust && mise install\`. Kui teie kest juba kasutab \`fnm\`, \`nvm\` või Homebrew Bunit, aktiveerige mise failis \`~/.zshrc\`, et Arroxy saaks Node.js 24.21.0 ja Bun 1.4.2:

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

### Kloonimine ja käivitamine

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Levitatava paketi ehitamine

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` installib sõltuvused, ehitab Electroni rakenduse sõltuvused ümber, kontrollib Electroni, valmistab arenduseks ette manustatud ffmpeg/ffprobe ja installib Playwrighti Chromiumi. Väljalaskeversioonid haldavad yt-dlp-d, ffmpegi ja ffprobe’i käitusajal teie rakenduse andmekaustas; ükski neist ei tule installeri sees kaasa.

</details>`;

export const et = {
  icon_alt: "Arroxy maskott",
  title:
    "Arroxy — tasuta avatud lähtekoodiga YouTube’i (+ 2000 saidi) allalaadija sisseehitatud brauseriga, Windowsile, macOS-ile ja Linuxile",
  read_in_label: "Loe keeles:",
  badge_release_alt: "Väljalase",
  badge_build_alt: "Ehitus",
  badge_license_alt: "Litsents",
  badge_platforms_alt: "Platvormid",
  badge_i18n_alt: "Keeled",
  badge_website_alt: "Veebisait",
  discord_badge_text: "Liitu Discordi kogukonnaga",
  discord_badge_encoded: "Liitu%20Discordi%20kogukonnaga",
  hero_desc:
    "Laadige alla videoid, Shortse, kanaleid, taskuhäälinguid või helilugusid **YouTube’ist ja 2000+ toetatud saidilt** — kuni 8K HDR 60 kaadrit sekundis, MP3 / AAC / Opus vormingus või ainult vajalik lõik. **Sirvige YouTube’i või mis tahes muud saiti otse Arroxys** vahekaardil Avasta ja laadige alla video, esitusloend või kanal, mille juures olete; logige seal sisse, et alla laadida videoid, mida Teie enda konto juba saab vaadata. Töötab kohalikult Windowsis, macOS-is ja Linuxis. **Ei mingeid reklaame, ballasti ega müügitrikke.**",
  cta_latest: "↓ Installi uusim väljalase",
  cta_website: "Veebisait",
  website_url: "https://arroxy.com/",
  star_cta: "Kui Arroxy säästab teie aega, aitab ⭐ teistel seda leida.",
  ai_notice: "> 🌐 See tõlge valmis tehisintellekti toel. [Ingliskeelne README](README.md) on esmane allikas. Leidsite vea? [Avage PR](../../pulls).",
  intro_what_is:
    "**Mis on Arroxy?** Arroxy on tasuta avatud lähtekoodiga töölaua graafiline kasutajaliides, mis laadib alla videoid, heli, esitusloendeid ja subtiitreid YouTube’ist ja 2000+ muult [yt-dlp](https://github.com/yt-dlp/yt-dlp) toetatud saidilt. Töötab süsteemides Windows 10/11, macOS 13+ (Intel + Apple Silicon) ja Linux (AppImage, Flatpak, tar.gz). GPLv3 litsentsiga. Ei mingeid reklaame ega kasutuspiiranguid. Levitatakse: [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage ja otseallalaadimine.",
  intro_key_difference:
    "**Peamine erinevus: sisseehitatud brauser.** Enamik tasuta YouTube’i allalaadijaid on õhukesed yt-dlp ümbrised: URL-i kast ja vormingumenüü, ilma oma brauserita. Arroxyl on see olemas – vahekaart **Avasta**. Sirvite YouTube’i või mis tahes muud saiti rakenduse sees ning laadite alla video, esitusloendi või kanali, mille juures olete, või paremklõpsate mis tahes lingil. Kui logite Avastas korra sisse, kasutavad kontot nõudvad allalaadimised seda sisselogimist: Teie privaatsed videod, Teie loendid Vaata hiljem ja Meeldinud videod ning muud videod, mida Teie konto juba saab vaadata, ilma küpsiseid eksportimata. Logige seal sisse ka teistele saitidele ning nende allalaadimised kasutavad seda sisselogimist, kui vaja. Üksikasjad: [Miks Arroxy](#why-explore).",
  last_updated: "Viimati uuendatud: {{LAST_UPDATED}}.",
  toc_heading: "Sisukord",
  why_h2: "Miks Arroxy",
  features_h2: "Funktsioonid",
  dl_h2: "Installimine ja esmakäivitus",
  privacy_h2: "Privaatsus",
  faq_h2: "KKK",
  roadmap_h2: "Arenduskava",
  tech_h2: "Ehitatud tehnoloogiatega",
  why_intro: "Võrdlus levinumate alternatiividega:",
  why_r1: "Tasuta, ilma tasulise versioonita",
  why_r2: "Avatud lähtekood",
  why_r3: "Ainult kohalik töötlus",
  why_r5: "Ei mingeid kasutuspiiranguid",
  why_r6: "Platvormideülene töölauarakendus",
  why_r7: "Subtiitrid + SponsorBlock",
  why_r8: "Sisseehitatud brauser (sirvimine, sisselogimine, allalaadimine)",
  why_r9: "Videod, mida Teie enda konto saab vaadata, ilma küpsiseid eksportimata",
  why_table_note:
    "⚠️ = osaliselt või ainult tasulises versioonis. 4K Video Downloaderi rakendusesisene sisselogimine privaatsete videote jaoks on tasuline funktsioon; enamik tasuta yt-dlp graafilisi kasutajaliideseid aktsepteerib ainult küpsisefaili või loeb teie veebibrauseri küpsiseid.",
  why_summary:
    "Arroxy on loodud ühe asja jaoks: puhas kohalik fail, olgu siis URL-i kleepimise või video leidmise kaudu Avastas. Ei mingeid müügitrikke, ei mingit andmekogumist.",
  why_explore_h3: "Mida tavaline yt-dlp ümbris ei oska: vahekaart Avasta",
  why_explore_intro:
    "Enamik tasuta YouTube’i allalaadijaid on lihtsalt URL-i kast yt-dlp peal. Arroxy kasutab samuti yt-dlp-d, kuid sellel on ka **Avasta** — rakendusse sisseehitatud brauser, mis avab YouTube’i või mis tahes muu saidi. Avasta lisab selle, mida URL-i kast ei suuda:",
  why_explore_1:
    "**Videod, mida Teie konto saab vaadata, ilma küpsiseid eksportimata** — Teie privaatsed videod, Teie loendid Vaata hiljem ja Meeldinud videod, vanusepiiranguga videod vanuse kinnitanud kontol ning teiste saitide lehed, mis nõuavad sisselogimist. Tavaline ümbris vajab cookies.txt eksporti või loeb Teie veebibrauseri küpsiseid. Arroxys logite Avastas korra sisse ja ülejäänu teeb rakendus",
  why_explore_4:
    "**Linke pole vaja kopeerida** — leidke video, esitusloend või kanal Avastas ja laadige see alla ühe klõpsuga või paremklõpsake mis tahes linki lehel",
  why_explore_5:
    "**Reklaamiblokeerija, kui seda soovite** — üks klõps kilbil blokeerib reklaamid ja jälgijad Avasta lehtedel",
  feat_explore_h3: "Avasta: sirvige veebi otse Arroxys",
  feat_explore_1:
    "**Vahekaart Avasta** — sirvige YouTube’i või mis tahes muud saiti Arroxys ja laadige leitu alla ilma linke kopeerimata. **Laadi alla · *teie profiil*** paneb järjekorda video, esitusloendi või kanali, mida vaatate; selle kõrval olev nool vahetab profiile ja võlukepp avab samm-sammulise allalaadimise vormingute, subtiitrite ja muu valimiseks",
  feat_explore_6:
    "**Allalaadimine paremklõpsuga** — paremklõpsake Avastas mis tahes video-, esitusloendi- või kanalilinki, et see oma profiiliga alla laadida, valida **Laadi alla profiiliga** alt teine profiil, avada samm-sammuline allalaadimine või kopeerida link. Iga videot pole vaja kõigepealt avada",
  feat_explore_7:
    "**Kompaktne paigutus** — üks klõps Avasta tööriistaribal liigutab Arroxy vahekaardid sinna ja annab lehele rohkem ruumi",
  feat_explore_2:
    "**Aadressiriba** — YouTube’is otsimiseks tippige otsing või sisestage mis tahes veebiaadress selle saidi avamiseks",
  feat_explore_3:
    "**Kontot nõudvad allalaadimised** — logige Avastas korra sisse ja Arroxy saab alla laadida videoid, mida Teie konto saab vaadata: Teie privaatseid videoid, vanusepiiranguga videoid, kui konto on vanuse kinnitanud, ning Teie loendeid Vaata hiljem ja Meeldinud videod. Logige seal sisse ka teistele saitidele ning nende allalaadimised kasutavad seda sisselogimist, kui vaja. Arroxy laadib siiski kõigepealt alla sisse logimata ja kasutab Teie Avasta sisselogimist ainult siis, kui allalaadimine ebaõnnestub viisil, mida konto saab parandada",
  feat_explore_4:
    "**Kasutage teisest kontot** — Avasta esimene ekraan selgitab, miks: kontoga allalaadimisel on teatav risk, et konto piiratakse. Logige Avastast sätetes välja, millal tahes soovite oma sisselogimised unustada",
  feat_explore_5:
    "**Reklaamiblokeerija** — vaikimisi väljas. Üks klõps kilbil Avasta tööriistaribal blokeerib selle lehtedel reklaamid ja jälgijad, mõjutamata allalaadimisi. YouTube võib sisselogitud kontode puhul reklaamiblokeerijatele vastu töötada",
  feat_quality_h3: "Kvaliteet ja vormingud",
  feat_quality_1: "Kuni **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Kõrge kaadrisagedus ja HDR** säilitatakse muutmata kujul — 60 fps, HDR10",
  feat_quality_3:
    "**Heli** — eksportige ainult heli vormingus MP3, M4A/AAC, Opus või WAV. Interaktiivsetes allalaadimistes valige allika algsed ruumi-/Dolby-rajad (AC-3, E-AC-3, 5.1, DRC), kui need on saadaval, või määrake globaalne vaikeväärtus **Eelista ruumiheli / Dolbyt**",
  feat_quality_4:
    "**Eesmärgiga profiilid** — *Parim pilt* (AV1 · VP9) või *Nutiteler* (MP4 · H.264), salvestatuna kui Automaatne, MP4, MKV või WebM ilma ümberkodeerimiseta. HDR on *Automaatne* (ainult kui teie ekraan seda kuvada suudab), *SDR* või *HDR*",
  feat_quality_5:
    "**Iga koodek igal eraldusvõimel** — samm-sammuline allalaadimine loetleb AV1, VP9 ja H.264 kõrvuti iga eraldusvõime juures, nii et saate valida selle, mida teie teler või redaktor esitab",
  feat_quality_6:
    "**Teadke, mis voog tegelikult on** — YouTube’i tehisintellektiga skaleeritud suurused, tehisintellektiga dubleeritud helikeeled, suurendatud bitikiirusega vood, 360° videod ning kahjustatud või vesimärgiga koopiad on märgitud. Profiilid jätavad tehisintellektiga skaleeritud vood vahele, kui te neid ei luba",
  feat_privacy_h3: "Privaatsus ja kontroll",
  feat_privacy_1:
    "100% kohalik töötlus — allalaadimised lähevad otse YouTube’ist teie kettale",
  feat_privacy_2: "**Avatud lähtekood** — iga rida auditeeritav, GPLv3 litsents",
  feat_privacy_3: "Failid salvestatakse otse teie valitud kausta",
  feat_workflow_h3: "Töövoog",
  feat_workflow_12:
    "**Globaalne allalaadimise kiirklahv** — kopeerige link mis tahes rakenduses ja vajutage `Ctrl+Shift+D` (macOS-is `Cmd+Shift+D`); Arroxy paneb selle teie aktiivse profiiliga järjekorda akent avamata ja teavitus kinnitab seda. Vaikimisi sees, ümberseotav",
  feat_workflow_1:
    "**Paindlikud käivitusrežiimid** — valige juhitud üksikallalaadimine, esitusloendi/kanali valija, hulgi-URL-ide kleepimine, kiirallalaadimine salvestatud vaikeväärtustega või sirvimine ja allalaadimine Avastas",
  feat_workflow_2:
    "**Keskne allalaadimisjärjekord** — iga üksik-, esitusloendi-, hulgi- või kiirülesanne jõuab ühte kohta edenemise, peatamise, jätkamise, tühistamise, uuesti proovimise ja prioriteedi juhtimiseks",
  feat_workflow_3:
    "**Lõikelaua jälgimine** — kopeerige videolink ja see täidab URL-välja, kui Arroxysse tagasi tulete, koos nupuga **Võta tagasi**, kui te seda ei mõelnud. Kui Arroxy on hõivatud, ootab link, kuni olete tagasi URL-i vahekaardil (lülitage see välja sätetes)",
  feat_workflow_4:
    "**URL-ide automaatne puhastus** — eemaldab jälgimisparameetrid (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ja avab `youtube.com/redirect` lingid",
  feat_workflow_5:
    "**Salverežiim** — akna sulgemine hoiab allalaadimised taustal töös",
  feat_workflow_6:
    "**{{LANG_COUNT}} keelt** — tuvastab süsteemi lokaadi automaatselt, vahetatav igal ajal",
  feat_workflow_7:
    "**Esitusloendi sünkroonimine** — skannige esitusloend kohaliku kausta vastu uuesti, et juba allalaaditud videod vahele jätta; loob `.m3u` esitusloendifaili, mida uuendatakse iga video allalaadimisel",
  feat_workflow_8:
    "**Kiiruse ja tempo juhtimine** — piirake allalaadimise ribalaiust, määrake, mitu video osa laaditakse korraga, ning lisage päringutele viiteid eelseadistustega (*Väljas · Tasakaalustatud · Ettevaatlik · Kohandatud*)",
  feat_workflow_9:
    "**Failinime mallid** — nimetage allalaadimised oma viisil sümbolitega `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` ja `{playlist_index}`, globaalselt või allalaadimisprofiili kohta",
  feat_workflow_10:
    "**Allalaadimisi korraga ja automaatne uuesti proovimine** — valige, mitu järjekorras allalaadimist töötab samal ajal, ning laske Arroxyl proovida uuesti allalaadimist, mis sattus võrgu- või serveriprobleemi otsa, oodates enne iga katset kauem",
  feat_workflow_11:
    "**Esitusloendi üksuste profiilid** — määrake iga esitusloendi videole oma allalaadimisprofiil kogu loendi ühe sätte asemel, et ühe läbimisega saaks mõne arhiveerida täiskvaliteediga ja ülejäänud salvestada ainult helina",
  feat_workflow_13:
    "**Kiirallalaadimine töötab taustal** — link ilmub kohe Allalaadimistesse ja valmistatakse seal ette, märge nupuga **Kuva** kinnitab seda ja URL-väli tühjeneb järgmise lingi jaoks. Alustage nii palju, kui soovite, kuni varasemaid ette valmistatakse",
  feat_workflow_14:
    "**Allalaadimised ütlevad, mis vajab teid** — kui Arroxy ei suuda linki lugeda, ütleb selle rida põhjuse ja pakub lahendust: proovi uuesti, lülita küpsised sisse või logi Avastas sisse. Kui küpsised on väljas, proovib **Logi Avastas sisse** selle teie eest uuesti, kui olete sisse loginud. Teie laadimispiirist pikem esitusloend ootab oma real, et valiksite kõik, esimesed või ülevaatuse. Vahekaart Allalaadimised loendab teid ootavad read",
  feat_workflow_15:
    "**Laadige alla ainult osa videost** — valige vormingu ekraanil algus ja lõpp või peatükk ning Arroxy salvestab ainult selle vahemiku, nimetades selle video ID järel vahemikuga. Lõiked langevad lähimale võtmekaadrile; lülitage sisse täpne lõige, et selle asemel ümber kodeerida",
  feat_workflow_16:
    "**Eemalda lõpetatud allalaadimised** — valikuline: lõpetatud allalaadimine lahkub loendist 5 sekundit hiljem. Selle failid jäävad kettale ja ebaõnnestunud allalaadimised jäävad loendisse",
  feat_workflow_17:
    "**Suurus ja Puudub allalaadimistes** — sorteeritav veerg **Suurus** näitab, kui palju ruumi iga allalaadimine võtab, ja **Puudub** märgib failid, mis on Arroxyst väljaspool teisaldatud või kustutatud",
  feat_workflow_18:
    "**Aurora või Minimaalne, tume või hele** — klaaspaneelid liikuva taeva kohal või vaiksed ühtlased pinnad; vahetage jaluses. Arvutid ilma graafikakiirenduseta saavad Minimaalse automaatselt",
  feat_workflow_19:
    "**Maci menüüriba** — macOS-is avage Sätted (`Cmd+,`), määrake allalaadimiskiiruse piirang, vahetage stiili ja teemat ning avage logid või salvestage diagnostikafail menüüribalt",
  feat_workflow_20:
    "**Muutke profiili mis tahes allalaadimisest** — kohandage allalaadimist, seejärel uuendage profiili, millest see alguse sai (koos muutuste eelvaatega), või salvestage sätted uue profiilina. Profiili vahetamisel küsitakse, kas säilitada teie muudatused",
  feat_post_h3: "Subtiitrid ja järeltöötlus",
  feat_post_1:
    "**Subtiitrid** vormingus SRT, VTT või ASS — käsitsi tehtud või automaatselt loodud, mis tahes saadaolevas keeles",
  feat_post_2:
    "Salvestage video kõrvale, manustage `.mkv`-i või korraldage alamkausta `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — jätke vahele või märkige peatükkidena sponsorid, sissejuhatused, lõpuosad, enesereklaamid",
  feat_post_4:
    "**Manustatud metaandmed** — pealkiri, üleslaadimiskuupäev, kanal, kirjeldus, pisipilt ja peatükimärgid kirjutatakse faili",
  feat_post_5:
    "**Ainult subtiitrite partiid** — kleepige URL-ide loend või avage esitusloend, valige Subtiitrid ja saage iga video kohta ainult subtiitrifailid",
  feat_sites_h3: "YouTube + 2000 saiti",
  feat_sites_1:
    "**YouTube täies mahus** — videod, Shorts, kanalid, esitusloendid, YouTube Music ja taskuhäälingud on esmaklassilised allikad",
  feat_sites_2:
    "**2000+ muud saiti** yt-dlp kaudu — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable ja palju muud",
  feat_sites_3:
    "**Ainult heli ja subtiitrid** töötavad igal toetatud saidil, mitte ainult YouTube’is",
  feat_sites_4:
    "Kui sait muutub, avaldab yt-dlp parandusi iga nädal ja Arroxy uuendab binaarfaili käivitamisel automaatselt",
  shot1_cap:
    "<b>Kiirallalaadimise avaleht</b><br/>Kleepige URL ja tõmmake see kohe alla oma aktiivse profiiliga",
  shot2_cap:
    "<b>Taaskasutatavad allalaadimisprofiilid</b><br/>Salvestage vormingu, kvaliteedi ja väljundi eelseadistused — kasutage iga allalaadimise puhul uuesti",
  shot3_cap:
    "<b>Mitmekeelsed helirajad</b><br/>Valige täpne helikeel, mida video pakub",
  shot4_cap:
    "<b>Ruumi- / Dolby-heli</b><br/>5.1 ja Dolby rajad tuvastatakse ja säilitatakse",
  shot5_cap:
    "<b>Hulgi-URL-ide režiim</b><br/>Kleepige loend, dubleerivad eemaldatakse automaatselt, pange kõik korraga järjekorda",
  shot6_cap:
    "<b>Paralleelne allalaadimisjärjekord</b><br/>Mitu allalaadimist korraga reaalajas edenemisega",
  hotkey_fig_alt:
    "Arroxy globaalne allalaadimise kiirklahv — Ctrl+Shift+D Windowsis ja Linuxis, Cmd+Shift+D macOS-is, saadab kopeeritud lingi otse allalaadimisjärjekorda",
  hotkey_fig_cap:
    "<b>Globaalne allalaadimise kiirklahv</b><br/>Kopeerige link kus tahes, vajutage üks kord — see jõuab järjekorda ja allalaadimine algab",
  shot7_cap: "<b>Esitusloendi üksuste profiilid</b><br/>Andke igale videole oma profiil — arhiveerige mõned 4K-s, ülejäänud salvestage ainult helina",
  shot8_cap:
    "<b>Avasta</b><br/>Sirvige YouTube’i või mis tahes muud saiti Arroxys ja laadige leht, millel olete, alla oma aktiivse profiiliga",
  shot9_cap:
    "<b>Avasta esimene ekraan</b><br/>Kiire ülevaade Avastast ja miks teisene konto on turvalisem sisselogimine",
  shot10_cap:
    "<b>Allalaadimised ütlevad, mis vajab teid</b><br/>Lingid valmistatakse ette taustal; ebaõnnestunud link pakub lahendust, pikk esitusloend ootab teie valikut",
  shot11_cap:
    "<b>Laadige alla ainult osa videost</b><br/>Valige algus ja lõpp või peatükk — Arroxy salvestab ainult selle vahemiku",
  shot12_cap:
    "<b>Profiiliredaktor</b><br/>Kohandage profiili: failitüüp, eraldusvõime, subtiitrid, sihtkoht, failinime mall ja muu",
  shot13_cap:
    "<b>Tume või hele, klaas või ühtlane</b><br/>Neli ilmet valida: klaaspaneelid liikuva taeva kohal või vaiksed ühtlased pinnad, kumbki tumedana ja heledana",
  shot14_cap:
    "<b>8K HDR 60 kaadrit sekundis</b><br/>Iga eraldusvõime, koodek ja HDR-voog, mida video pakub, kõrvuti",
  dl_platform_col: "Platvorm",
  dl_format_col: "Otseallalaadimine",
  dl_oneline_note:
    "Ehitused on ainult x86_64. Pole `curl`-i? Asendage `curl -fsSL` käsuga `wget -qO-`.",
  dl_win_scoop:
    "Eelistate Scoopi? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Installer (NSIS) või kaasaskantav `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` või `.flatpak` (liivakastis)",
  dl_grab: "Kõik väljalaskefailid →",
  dl_pkg_h3: "Installimine paketihalduriga",
  dl_channel_col: "Kanal",
  dl_command_col: "Käsk",
  dl_win_h3: "Windows: installer vs kaasaskantav",
  dl_win_col_installer: "NSIS-installer",
  dl_win_col_portable: "Kaasaskantav `.exe`",
  dl_win_r1: "Vajab installimist",
  dl_win_r1_installer: "Jah",
  dl_win_r1_portable: "Ei — käivitage kust tahes",
  dl_win_r2: "Automaatsed uuendused",
  dl_win_r2_installer: "✅ rakenduses",
  dl_win_r2_portable: "❌ käsitsi allalaadimine",
  dl_win_r3: "Käivituskiirus",
  dl_win_r3_installer: "✅ kiirem",
  dl_win_r3_portable: "⚠️ aeglasem külmkäivitus",
  dl_win_r4: "Lisatakse menüüsse Start",
  dl_win_r5: "Lihtne eemaldamine",
  dl_win_r5_portable: "❌ kustutage fail",
  dl_win_rec:
    "**Soovitus:** kasutage NSIS-installerit automaatsete uuenduste ja kiirema käivituse jaoks. Kasutage kaasaskantavat `.exe`-d, kui soovite varianti ilma installimiseta ja registrita.",
  dl_win_smartscreen_h4: "Windows SmartScreeni hoiatus",
  dl_win_smartscreen_intro:
    'Esmakäivitusel võite näha teadet **„Windows kaitses teie arvutit“** või **„Tundmatu väljaandja“.** See kehtib nii `Arroxy-win-x64-Setup.exe` kui ka `Arroxy-win-x64-Portable.exe` kohta. Arroxy on tasuta ja avatud lähtekoodiga ning Windowsi ehitused pole tasulise sertifikaadiga koodiallkirjastatud, mistõttu SmartScreen neid märgistab. See **ei tähenda** automaatselt, et Arroxy on ohtlik. Jätkamiseks:',
  dl_win_smartscreen_step1: "Klõpsake **Lisateave**.",
  dl_win_smartscreen_step2: "Klõpsake **Käivita ikkagi**.",
  dl_win_smartscreen_official:
    "Laadige Arroxy alla ainult ametlikult GitHubi väljalaskeleheküljelt. Kui saite faili mõnelt teiselt veebisaidilt või kui selle saatis teile keegi, kustutage see ja laadige ametlikust allikast alla uus koopia. Lähtekood on avalik, seega saate seda vaadata või soovi korral Arroxy ise ehitada.",
  dl_macos_h3: "Esmakäivitus macOS-is",
  dl_macos_warning:
    "Arroxy pole veel koodiallkirjastatud, mistõttu võib macOS Gatekeeper esmakäivitusel kuvada hoiatuse kahjustatud rakenduse kohta. See on ootuspärane — see ei viita tegelikule failikahjustusele.",
  dl_macos_m1_h4: "Terminali meetod:",
  dl_macos_step1: "Lohistage `Arroxy.app` ühendatud DMG-st kausta `/Applications`.",
  dl_macos_step2:
    "Avage Terminal ja käivitage `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Käivitage `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Kui rakenduse tee on erinev, asendage `/Applications/Arroxy.app` teie installitud teega.",
  dl_macos_step5:
    "Sisestage oma Maci parool, kui `sudo` seda küsib.",
  dl_macos_after:
    "Pärast karantiini eemaldamist avaneb Arroxy tavapäraselt.",
  dl_macos_m2_h4: "Terminali meetod:",
  dl_macos_note:
    "macOS-i ehitused valmistatakse CI kaudu Apple Silicon ja Inteli käivitajatel. Kui teil tekib probleeme, [avage probleemiaruanne](../../issues) — macOS-i kasutajate tagasiside kujundab aktiivselt macOS-i testimistsüklit.",
  dl_linux_h3: "Esmakäivitus Linuxis",
  dl_linux_intro:
    "AppImage’id käivituvad otse — installimist pole vaja. Peate faili vaid käivitatavaks märkima.",
  dl_linux_m1_text:
    "**Failihaldur:** paremklõpsake `.AppImage` → **Atribuudid** → **Õigused** → lubage **Luba faili käivitamine programmina**, seejärel topeltklõpsake.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Kui käivitamine ikka ebaõnnestub, käivitage see ühendamata — FUSE-paketti pole vaja:",
  dl_linux_targz_h4: "Lihtne tarball (ilma FUSE-ta, ilma installimiseta):",
  dl_linux_targz_text: "`.tar.gz` ehitus on sama rakendus ilma AppImage’i ümbriseta — pakkige see kuhu tahes lahti ja käivitage. Installerit ega FUSE-paketti pole vaja.",
  dl_linux_arch_note: "**Väljalaskelehe Linuxi allalaadimised on ainult x86_64.** ARM64 masinatel (Raspberry Pi, Asahi Linux) Flatpak küll installitakse, kuid käivitamisel tekib tõrge `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Miks võite hoiatust näha",
  dl_warning_p1:
    "Arroxy on avatud lähtekoodiga ja GPLv3 litsentsiga. Windowsi ja macOS-i ehitused **pole koodiallkirjastatud** — Apple Developer ID ja Windows EV koodiallkirjastamise sertifikaadid maksavad kumbki sadu dollareid aastas, mida sõltumatu projekt maksab oma taskust. Ilma nende allkirjadeta hoiatavad Windows SmartScreen ja macOS Gatekeeper teid esmakäivitusel. Hoiatused tähendavad, et *teie operatsioonisüsteem ei tunne väljaandjat ära* — need ei tähenda, et Arroxy oleks pahavara.",
  dl_warning_p2:
    "Kolm viisi Arroxy ise kontrollida, kasvava põhjalikkuse järjekorras:\n\n- **Lugege lähtekoodi.** Iga rida on [GitHubis](https://github.com/antonio-orionus/Arroxy) ja saate [selle lähtekoodist ehitada](#tech).\n- **Kontrollige SHA256.** Võrrelge oma faili avaldatud [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) failiga — vt allpool [Kontrollige oma allalaadimist](#verify).\n- **Tehke kolmanda osapoole skannimine.** Laadige fail üles teenusesse [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Windowsi esmakäivitus",
  shot_smartscreen_more_alt:
    'SmartScreeni dialoog „Windows kaitses teie arvutit“ esiletõstetud lingiga „Lisateave“',
  shot_smartscreen_run_alt:
    'SmartScreeni dialoog pärast valiku „Lisateave“ laiendamist, kus on näha nupp „Käivita ikkagi“',
  dl_win_defender_h4: "Kui Windows Defender märgistab faili või eemaldab selle",
  dl_win_defender_p:
    "Defenderi heuristika märgistab vahel allkirjastamata NSIS-installereid ja Electroni kaasaskantavaid rakendusi kahtlastena. Kui Defender paneb faili `Arroxy-win-x64-Setup.exe` või `Arroxy-win-x64-Portable.exe` karantiini, taastage see jaotisest **Windowsi turve → Viiruste ja ohtude kaitse → Kaitseajalugu**, seejärel lisage Arroxy käivitusfail lubatud üksusena jaotises **Sätete haldamine → Välistuste lisamine või eemaldamine**. Nagu SmartScreeni puhul, on põhjus puuduv väljaandja allkiri, mitte tuvastatud pahavara.",

  dl_macos_first_h3: "macOS-i esmakäivitus",
  dl_macos_intro:
    "Arroxy macOS-i ehitused on ad hoc allkirjastatud, kuid Apple’i poolt notariaalselt kinnitamata, mistõttu Gatekeeper blokeerib esmakäivituse teatega *„Arroxy.app“ ei avatud — Apple ei saanud kontrollida, et „Arroxy.app“ oleks pahavarast vaba*. See tähendab, et macOS ei saa rakendust Apple’iga kontrollida, mitte seda, et failidega oleks midagi valesti. Homebrew’ga installimine väldib seda dialoogi täielikult. Kui kasutasite DMG-d, kustutab selle üks Terminali käsk:",
  dl_macos_sequoia_h4: "Terminali parandus praeguse macOS-i jaoks",
  dl_macos_sequoia_intro:
    "Kasutage Terminali pärast Arroxy kopeerimist kausta Applications:",
  dl_macos_sequoia_step1:
    "Lohistage `Arroxy.app` ühendatud DMG-st kausta `/Applications`.",
  dl_macos_sequoia_step2:
    "Avage Terminal ja käivitage need kaks käsku:",
  dl_macos_sequoia_step3:
    "Arroxy käivitamiseks käivitage `open /Applications/Arroxy.app`.",
  dl_macos_sequoia_step4:
    "Kui rakenduse tee on erinev, asendage `/Applications/Arroxy.app` teie installitud teega.",
  dl_macos_sonoma_h4: "Terminali parandus vanema macOS-i jaoks",
  dl_macos_sonoma_step1:
    "Lohistage `Arroxy.app` ühendatud DMG-st kausta `/Applications`.",
  dl_macos_sonoma_step2:
    "Avage Terminal ja eemaldage karantiin faililt `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Käivitage Arroxy Terminalist või Finderist pärast karantiini eemaldamist.",
  dl_macos_damaged_h4:
    "Gatekeeperi karantiini parandus",
  dl_macos_damaged_p:
    "Esimene käsk eemaldab karantiiniatribuudi, mille macOS faili allalaadimisel lisas; teine käivitab rakenduse. Tavaliselt pole `sudo`-d vaja, sest kaustas `/Applications` olev koopia kuulub teile — lisage see ainult siis, kui saate õiguste tõrke.",
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** M-seeria Macil (M1 / M2 / M3 / M4) laadige alla `arm64` DMG. Inteli Macidel laadige alla `x64` DMG. Vale ehituse käitamine töötab Rosetta kaudu, kuid on märgatavalt aeglasem.",

  dl_linux_first_h3: "Linuxi esmakäivitus",
  dl_linux_appimagelauncher:
    "**Valikuline töölauaintegratsioon:** installige [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) üks kord ja iga AppImage, mida topeltklõpsate, registreeritakse automaatselt teie käivitusmenüüsse — käsitsi `.desktop` faili pole vaja.",

  dl_verify_h3: "Kontrollige oma allalaadimist (SHA256)",
  dl_verify_intro:
    "Iga väljalase avaldab binaarfailide kõrval faili `SHA256SUMS`. Et kontrollida, et teie allalaadimine pole rikutud ega transiidil muudetud, arvutage oma faili räsi lokaalselt ja võrrelge faili `SHA256SUMS` vastava reaga. Avage uusima väljalaske leht → **Assets** → laadige alla `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell või käsuviip):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Soovite kolmanda osapoole pahavaraskannimist? Laadige fail üles teenusesse [VirusTotal](https://www.virustotal.com). Mõned üldise heuristika märgistused väiksematelt mootoritelt on allkirjastamata Electroni rakenduste puhul tavalised; suurte mootorite laialdased tuvastused oleksid tõsine mure.",

  dl_pm_intro:
    "Eelistate teist kanalit? Needki töötavad ja püsivad iga väljalaskega kooskõlas.",

  privacy_p1:
    "Allalaadimised tuuakse otse [yt-dlp](https://github.com/yt-dlp/yt-dlp) abil YouTube’ist teie valitud kausta — midagi ei suunata läbi kolmanda osapoole serveri. Vaatamisajalugu, allalaadimisajalugu, URL-id ja failide sisu jäävad teie seadmesse.",
  privacy_reports:
    "Jälgimist pole — üks anonüümne elumärk päevas (rakenduse versioon, OS, keel, installikanal, riik ja ligikaudu see, kui ammu Arroxy installiti), et saaksime lugeda aktiivseid ja uusi kasutajaid, ning kui Arroxy laadib alla või uuendab yt-dlp-d ja FFmpegi, anonüümne teade selle kohta, kas see õnnestus ja ligikaudu kui kaua see aega võttis. Ei mingeid ID-sid, URL-e, videopealkirju, failiteid ega konto teavet. Saate mõlemad sätetes välja lülitada.",
  privacy_p3:
    "Avasta hoiab oma sisselogimisi eraldi teie brauserist ja Arroxy ei loe ega täida kunagi sisselogimisvormi — tippite saidi enda lehel. Allalaadimised toimuvad sisse logimata; ainult kui üks ebaõnnestub viisil, mida konto saab parandada, loeb Arroxy sisselogimise värskelt, hoiab seda selle allalaadimise ajaks ajutises failis ja kustutab faili pärast. Avastast väljalogimine sätetes unustab need.",
  faq_q1: "Kas see on tõesti tasuta?",
  faq_a1: "Jah — GPLv3 litsents, ei mingit tasulist versiooni, ei mingeid funktsioonipiiranguid.",
  faq_q11: "Mille poolest erineb Arroxy teistest yt-dlp graafilistest kasutajaliidestest?",
  faq_a11:
    "Enamik tasuta yt-dlp graafilisi kasutajaliideseid on ümbrised, mis võtavad vastu ainult lingi. Arroxy lisab **Avasta** — rakendusse sisseehitatud brauseri, mis avab YouTube’i või mis tahes muu saidi: sirvite ja laadite alla linke kopeerimata ning logite seal korra sisse, et alla laadida videoid, mida Teie konto saab vaadata, näiteks Teie privaatseid videoid ning loendeid Vaata hiljem ja Meeldinud videod, ilma küpsiseid eksportimata. Vt [Miks Arroxy](#why).",
  faq_q2: "Millise kvaliteediga videoid saan alla laadida?",
  faq_a2:
    "Kõike, mida YouTube pakub: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, pluss ainult heli. 60 fps ja HDR-vood säilitatakse muutmata kujul ning samm-sammuline allalaadimine laseb valida AV1, VP9 või H.264 igal eraldusvõimel.",
  faq_q3: "Kas ma saan eraldada ainult heli MP3-na?",
  faq_a3:
    "Jah. Valige vormingumenüüs *ainult heli* ja valige MP3, M4A/AAC, Opus või WAV.",
  faq_q4: "Kuidas laadida alla videoid, mis nõuavad YouTube’i kontot?",
  faq_a4:
    "Logige vahekaardil Avasta korra sisse. Arroxy saab siis alla laadida videoid, mida Teie konto saab vaadata: Teie privaatseid videoid, vanusepiiranguga videoid, kui konto on vanuse kinnitanud, ning Teie loendeid Vaata hiljem ja Meeldinud videod. See kasutab sisselogimist ainult siis, kui allalaadimine ebaõnnestub viisil, mida konto saab parandada; kõik muu laaditakse alla nagu varem. See on valik **Avasta sisselogimine**, mis on küpsiste sätetes esimesena loetletud ja märgitud kui Soovitatav ning mille Arroxy valib Teie eest, kui Avasta esimest korda avate. yt-dlp wiki märgib, et [sisselogitud automatiseerimine võib Google’i konto märgistada](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), seega on teisene konto turvalisem valik.",
  faq_q5: "Kas see töötab edasi, kui YouTube midagi muudab?",
  faq_a5:
    "yt-dlp uuendatakse käivitamisel automaatselt ja Arroxy avaldab parandusi kiiresti, kui YouTube midagi muudab. Kui allalaadimine nõuab sisselogimist, kasutab Arroxy Teie Avasta sisselogimist, kui olete seal sisse loginud, ning küpsiste sätetes on saadaval küpsised failist või Teie brauserist.",
  faq_q6: "Millistes keeltes Arroxy saadaval on?",
  faq_a6:
    "{{LANG_COUNT}} keelt kohe karbist: {{LANG_NAME_LIST}}. Arroxy tuvastab esmakäivitusel teie operatsioonisüsteemi keele automaatselt ja saate igal ajal tööriistaribal keelevalijast vahetada. Käitusaja lokaadi JSON asub kaustas src/shared/i18n/locales/ ja tõlkijatele mõeldud PO-kataloogid kaustas i18n/locales/ — panustamiseks avage GitHubis PR.",
  faq_q7: "Kas pean midagi muud installima?",
  faq_a7:
    "Ei. yt-dlp, ffmpeg ja ffprobe laaditakse esmakäivitusel automaatselt alla ja salvestatakse teie masinas vahemällu. Pärast seda pole lisaseadistust vaja.",
  faq_q8: "Kas ma saan alla laadida esitusloendeid või terveid kanaleid?",
  faq_a8:
    "Jah — mõlemat. Kleepige esitusloendi URL või kanali URL (nt `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); valige, mitu kirjet skannida, seejärel pange kogu loend järjekorda või valige konkreetsed videod. Kuupäevavahemiku filtrid tulevad varsti.",
  faq_q9: 'macOS ütleb „rakendus on kahjustatud“ — mida teha?',
  faq_a9:
    'See on macOS Gatekeeper, mis blokeerib allkirjastamata rakenduse, mitte tegelik kahjustus. Vt [macOS-i esmakäivitus](#macos-first-launch) Terminali käskude kohta, mis eemaldavad karantiini ja käivitavad Arroxy.',
  faq_q10: "Kas YouTube’i videote allalaadimine on seaduslik?",
  faq_a10:
    "See sõltub Teie riigist ja sellest, mida alla laadite. Laadige alla ainult sisu, mis kuulub Teile, mis on allalaadimiseks litsentsitud või mida Teie riigi seadus lubab kopeerida. Vastutate YouTube’i [teenusetingimuste](https://www.youtube.com/t/terms) ja kohaliku autoriõiguse seaduste järgimise eest. Vt [Kasutustingimused](#terms).",
  plan_intro: "Alles planeeritud — ligikaudu prioriteedi järjekorras:",
  plan_col1: "Funktsioon",
  plan_col2: "Kirjeldus",
  plan_r1_name: "**Esitusloendi ja kanali filtrid**",
  plan_r1_desc: "Kuupäevavahemiku filtrid esitusloendi või kanali loetlemisel",
  plan_r2_name: "**YouTube’i helirada eelistused**",
  plan_r2_desc:
    "Määrake kogu rakenduse hõlmav kõnekeele raja eelistus koos profiilikohaste alistustega, kui YouTube pakub mitut helirada",
  plan_r3_name: "**Tugevam uuesti proovimise taastamine**",
  plan_r3_desc:
    "Uus uuesti proovimise tee allalaadimistele, mille katkestasid ebausaldusväärsed või problemaatilised internetiühendused",
  plan_r4_name: "**Täielik allalaadimishalduri sahtel**",
  plan_r4_desc:
    "Muutke järjekorra sahtel täielikumaks halduriks, sealhulgas järjekorra üksuste sihtkaustade muutmise võimalusega",
  plan_r5_name: "**Ajastatud allalaadimised**",
  plan_r5_desc: "Alustage järjekorda määratud ajal (öised käivitused)",
  plan_r9_name: "**AUR-pakett**",
  plan_r9_desc: "Installige Arch Linuxile ja Omarchyle käsuga `yay -S arroxy-bin`",
  plan_cta:
    "On teil funktsioon meeles? [Avage taotlus](../../issues) — kogukonna sisend kujundab prioriteeti.",
  tech_content: TECH_CONTENT,
  support_h2: "Toeta Arroxyt",
  support_line: "Arroxy on tasuta ja GPLv3 litsentsiga — ei mingeid reklaame, jälgimist ega tasulist versiooni. Kui see säästab Teie aega, saate arendust toetada Bitcoini, Trony või Ethereumiga: aadressid on failis [DONATE.md](DONATE.md), mis on nende ainus ametlik allikas. Arroxy ei saada Teile kunagi aadressi e-posti ega otsesõnumiga. Hoidla tähistamine tärniga, vigadest teatamine ja tõlgete parandamine aitavad sama palju.",
  tos_h2: "Kasutustingimused",
  tos_note:
    "Arroxy on tööriist ainult isiklikuks, privaatseks kasutamiseks. Vastutate üksnes selle eest, et teie allalaadimised vastaksid YouTube’i [teenusetingimustele](https://www.youtube.com/t/terms) ja teie jurisdiktsiooni autoriõiguse seadustele. Ärge kasutage Arroxyt sisu allalaadimiseks, reprodutseerimiseks ega levitamiseks, mille kasutamise õigust teil pole. Arendajad ei vastuta kuritarvitamise eest.",
  footer_credit:
    'GPLv3 · Tehtud hoolega, autor <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
