const TECH_CONTENT = `<details>
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
| Node.js | 24.21.0 | \`mise install\` ali \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` ali \`packageManager\` v \`package.json\` |

Priporočeno: namestite \`mise\` in zaženite \`mise install\` v kopiji repozitorija. Brez programa mise pred \`bun run bootstrap\` ročno aktivirajte Node.js iz \`.node-version\` in Bun iz \`package.json\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Za izvirne ponovne gradnje bosta morda potrebna Visual Studio Build Tools in Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Po kloniranju v kopiji repozitorija zaženite \`mise trust && mise install\`. Če vaša lupina že uporablja \`fnm\`, \`nvm\` ali Bun iz Homebrew, v \`~/.zshrc\` aktivirajte mise, da Arroxy dobi Node.js 24.21.0 in Bun 1.4.2:

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

### Kloniranje in zagon

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Gradnja distribucijskega paketa

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` namesti odvisnosti, znova zgradi odvisnosti aplikacije Electron, preveri Electron, pripravi vdelana ffmpeg/ffprobe za razvoj in namesti Playwright Chromium. Izdajne gradnje yt-dlp, ffmpeg in ffprobe upravljajo med delovanjem v mapi s podatki aplikacije; nobeden od njih ni vsebovan v namestitvenem programu.

</details>`;

export const sl = {
  icon_alt: "Maskota Arroxy",
  title:
    "Arroxy — brezplačen odprtokodni prenosnik za YouTube (+ 2000 spletnih mest) z vgrajenim brskalnikom, za Windows, macOS in Linux",
  read_in_label: "Beri v jeziku:",
  badge_release_alt: "Izdaja",
  badge_build_alt: "Gradnja",
  badge_license_alt: "Licenca",
  badge_platforms_alt: "Platforme",
  badge_i18n_alt: "Jeziki",
  badge_website_alt: "Spletno mesto",
  discord_badge_text: "Pridružite se skupnosti Discord",
  discord_badge_encoded: "Pridru%C5%BEite%20se%20skupnosti%20Discord",
  hero_desc:
    "Prenesite videoposnetke, Shorts, glasbo, kanale, podkaste ali zvočne posnetke z **YouTuba in več kot 2000 podprtih spletnih mest** — do 8K HDR pri 60 sličicah/s, kot MP3 / AAC / Opus ali samo del, ki ga potrebujete. **Brskajte po YouTubu ali katerem koli drugem spletnem mestu kar v programu Arroxy** na zavihku Razišči in prenesite videoposnetek, seznam predvajanja ali kanal, na katerem ste; tam se prijavite, da prenesete zasebne videoposnetke, videoposnetke samo za člane in starostno omejene videoposnetke, ki jih lahko gleda vaš račun. Deluje lokalno v sistemih Windows, macOS in Linux. **Brez oglasov, brez nepotrebnega balasta, brez vsiljevanja plačljivih različic.**",
  cta_latest: "↓ Namestite najnovejšo izdajo",
  cta_website: "Spletno mesto",
  website_url: "https://arroxy.com/",
  star_cta: "Če vam Arroxy prihrani čas, ⭐ pomaga drugim, da ga najdejo.",
  ai_notice: "> 🌐 Ta prevod je nastal s pomočjo umetne inteligence. [Angleški README](README.md) je nadrejeni vir. Ste našli napako? [Odprite PR](../../pulls).",
  intro_what_is:
    "**Kaj je Arroxy?** Arroxy je brezplačen namizni grafični vmesnik z odprto kodo, ki prenaša videoposnetke, zvok, sezname predvajanja in podnapise iz YouTuba ter več kot 2000 drugih spletnih mest, ki jih podpira [yt-dlp](https://github.com/yt-dlp/yt-dlp). Deluje v sistemih Windows 10/11, macOS 13+ (Intel + Apple Silicon) in Linux (AppImage, Flatpak, tar.gz). Licenca GPLv3. Brez oglasov, brez omejitev uporabe. Distribuira se prek [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage in neposrednega prenosa.",
  intro_key_difference:
    "**Ključna razlika: vgrajen brskalnik.** Večina brezplačnih prenosnikov za YouTube so tanki ovoji okoli yt-dlp: polje za URL in meni formatov, brez lastnega brskalnika. Arroxy ga ima, to je zavihek **Razišči**. Po YouTubu ali katerem koli drugem spletnem mestu brskate v aplikaciji in prenesete videoposnetek, seznam predvajanja ali kanal, na katerem ste, ali pa z desnim klikom na katero koli povezavo. V Razišči se prijavite enkrat, Arroxy pa prenese zasebne videoposnetke, videoposnetke samo za člane in starostno omejene videoposnetke, ki jih lahko gleda vaš račun, ter vaša seznama Ogled pozneje in Všečkano, brez izvoza piškotkov. Tam se prijavite tudi v druga spletna mesta, njihovi prenosi pa to prijavo uporabijo, kadar jo potrebujejo. Ko YouTube zahteva potrditev, da niste bot, poskusi znova s to prijavo. Vgrajen brskalnik pridobi tudi žeton, ki ga YouTube pričakuje pred prenosom, zato YouTube prenosa ne zmanjša na manj formatov. Ovoj s poljem za URL naleti na vse te omejitve. Podrobnosti: [Zakaj Arroxy](#why-explore).",
  last_updated: "Zadnja posodobitev: {{LAST_UPDATED}}.",
  toc_heading: "Kazalo",
  why_h2: "Zakaj Arroxy",
  features_h2: "Funkcije",
  dl_h2: "Namestitev in prvi zagon",
  privacy_h2: "Zasebnost",
  faq_h2: "Pogosta vprašanja",
  roadmap_h2: "Načrt razvoja",
  tech_h2: "Izdelano z",
  why_intro: "Primerjava z najpogostejšimi alternativami:",
  why_r1: "Brezplačno, brez plačljive različice",
  why_r2: "Odprta koda",
  why_r3: "Samo lokalna obdelava",
  why_r5: "Brez omejitev uporabe",
  why_r6: "Medplatformska namizna aplikacija",
  why_r7: "Podnapisi + SponsorBlock",
  why_r8: "Vgrajen brskalnik (brskanje, prijava, prenos)",
  why_r9: "Zasebni videoposnetki, videoposnetki samo za člane in starostno omejeni videoposnetki brez izvoza piškotkov",
  why_table_note:
    "⚠️ = delno ali samo v plačljivi različici. Prijava v aplikaciji za zasebne videoposnetke v programu 4K Video Downloader je plačljiva funkcija; večina brezplačnih grafičnih vmesnikov za yt-dlp sprejme samo datoteko s piškotki ali prebere piškotke vašega spletnega brskalnika.",
  why_summary:
    "Arroxy je narejen za eno stvar: čisto lokalno datoteko, ne glede na to, ali prilepite URL ali videoposnetek najdete v Razišči. Brez vsiljevanja plačljivih različic, brez zbiranja podatkov.",
  why_explore_h3: "Česar navaden ovoj za yt-dlp ne zmore: zavihek Razišči",
  why_explore_intro:
    "Večina brezplačnih prenosnikov za YouTube je polje za URL nad yt-dlp. Tudi Arroxy uporablja yt-dlp, vendar ima tudi **Razišči**, v aplikacijo vgrajen brskalnik, ki odpre YouTube ali katero koli drugo spletno mesto. Razišči preseže omejitve, ki jih polje za URL ne more:",
  why_explore_1:
    "**Videoposnetki, ki zahtevajo račun, brez izvoza piškotkov** — zasebni videoposnetki, videoposnetki samo za člane in starostno omejeni videoposnetki (pri računu s preverjeno starostjo) ter vaši seznami Ogled pozneje in Všečkano, pa tudi videoposnetki za prijavo na drugih spletnih mestih. Navaden ovoj potrebuje izvoz cookies.txt ali mora prebrati piškotke vašega spletnega brskalnika, kar Chrome v sistemu Windows zdaj blokira. V Arroxy se enkrat prijavite v Razišči, ostalo opravi program",
  why_explore_2:
    "**„Prijavite se, da potrdite, da niste bot“** — ko YouTube to zahteva, Arroxy namesto neuspeha ponovno poskusi prenos z vašo prijavo v Razišči",
  why_explore_3:
    "**Žeton za prenos YouTuba** — Arroxyjev vgrajeni brskalnik pridobi žeton, ki ga YouTube pričakuje pred prenosom. Brez njega lahko YouTube ponudi manj formatov in nižjo kakovost, kot ste jo zahtevali",
  why_explore_4:
    "**Brez kopiranja povezav** — v Razišči poiščite videoposnetek, seznam predvajanja ali kanal in ga prenesite z enim klikom ali pa z desnim klikom na katero koli povezavo na strani",
  why_explore_5:
    "**Blokator oglasov, ko ga želite** — en klik na ščit blokira oglase in sledilnike na straneh v Razišči",
  feat_explore_h3: "Razišči: brskanje po spletu v programu Arroxy",
  feat_explore_1:
    "**Zavihek Razišči** — brskajte po YouTubu ali katerem koli drugem spletnem mestu v programu Arroxy in prenesite, kar najdete, brez kopiranja povezav. **Prenesi · *vaš profil*** doda v vrsto videoposnetek, seznam predvajanja ali kanal, ki ga gledate; puščica ob njem zamenja profil, čarobna palica pa odpre postopni prenos za izbiro formatov, podnapisov in drugega",
  feat_explore_6:
    "**Desni klik za prenos** — z desnim klikom na katero koli povezavo do videoposnetka, seznama predvajanja ali kanala v Razišči jo prenesite z vašim profilom, izberite drug profil v **Prenesi z**, odprite postopni prenos ali kopirajte povezavo. Ni vam treba najprej odpreti vsakega videoposnetka",
  feat_explore_7:
    "**Strnjena postavitev** — en klik v orodni vrstici Razišči premakne zavihke Arroxy vanjo in strani nameni več prostora",
  feat_explore_2:
    "**Naslovna vrstica** — vpišite iskanje po YouTubu ali pa vnesite katerikoli spletni naslov in odprite to spletno mesto",
  feat_explore_3:
    "**Prenosi, ki zahtevajo račun** — enkrat se prijavite v Razišči in Arroxy lahko prenese zasebne videoposnetke in videoposnetke samo za člane, ki jih lahko gleda vaš račun, starostno omejene videoposnetke, če je račun starostno preverjen, ter vaša seznama Ogled pozneje in Všečkano. Tam se prijavite tudi v druga spletna mesta, njihovi prenosi pa to prijavo uporabijo, kadar jo potrebujejo. Arroxy še vedno najprej prenaša odjavljen in vašo prijavo v Razišči uporabi samo, kadar prenos spodleti na način, ki ga lahko odpravi račun. Ko YouTube zahteva potrditev, da niste bot, Arroxy poskusi tudi z vašo prijavo v Razišči",
  feat_explore_4:
    "**Uporabite sekundarni račun** — prvi zaslon Razišči razloži zakaj: prenos z računom prinaša nekaj tveganja, da bo ta račun omejen. Iz Razišči se odjavite v nastavitvah, kadar koli želite pozabiti svoje prijave",
  feat_explore_5:
    "**Blokator oglasov** — privzeto izklopljen. En klik na ščit v orodni vrstici Razišči blokira oglase in sledilnike na njegovih straneh, ne da bi vplival na prenose. YouTube se lahko upira blokatorjem oglasov pri prijavljenih računih",
  feat_quality_h3: "Kakovost in formati",
  feat_quality_1: "Do **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Visoka hitrost sličic in HDR** ohranjena nespremenjena — 60 sličic/s, HDR10",
  feat_quality_3:
    "**Zvok** — izvozite samo zvok kot MP3, M4A/AAC, Opus ali WAV. Pri interaktivnih prenosih izberite izvirne prostorske/Dolby posnetke vira (AC-3, E-AC-3, 5.1, DRC), kadar so na voljo, ali nastavite splošno privzeto **Prednost prostorski zvok / Dolby**",
  feat_quality_4:
    "**Profili s ciljem** — *Najboljša slika* (AV1 · VP9) ali *Pametni televizor* (MP4 · H.264), shranjeni kot Samodejno, MP4, MKV ali WebM brez ponovnega kodiranja. HDR je *Samodejno* (samo kadar ga vaš zaslon lahko prikaže), *SDR* ali *HDR*",
  feat_quality_5:
    "**Vsak kodek pri vsaki ločljivosti** — postopni prenos našteje AV1, VP9 in H.264 drug ob drugem pri vsaki ločljivosti, tako da izberete tistega, ki ga predvaja vaš televizor ali urejevalnik",
  feat_quality_6:
    "**Vedite, kaj tok v resnici je** — velikosti, ki jih je YouTube povečal z umetno inteligenco, jeziki zvoka, sinhronizirani z umetno inteligenco, toki z izboljšano bitno hitrostjo, videoposnetki 360° ter poškodovane kopije ali kopije z vodnim žigom so označeni. Profili preskočijo toke, povečane z umetno inteligenco, razen če jih dovolite",
  feat_privacy_h3: "Zasebnost in nadzor",
  feat_privacy_1:
    "100 % lokalna obdelava — prenosi gredo neposredno z YouTuba na vaš disk",
  feat_privacy_2: "**Odprta koda** — vsako vrstico je mogoče preveriti, licenca GPLv3",
  feat_privacy_3: "Datoteke so shranjene neposredno v mapo, ki jo izberete",
  feat_workflow_h3: "Potek dela",
  feat_workflow_12:
    "**Splošna bližnjica za prenos** — kopirajte povezavo v katerikoli aplikaciji in pritisnite `Ctrl+Shift+D` (`Cmd+Shift+D` v macOS); Arroxy jo doda v vrsto z vašim aktivnim profilom, ne da bi odprl okno, obvestilo pa to potrdi. Privzeto vklopljena, nastavljiva",
  feat_workflow_1:
    "**Prilagodljivi načini zagona** — izberite vodeni posamezni prenos, izbirnik seznamov predvajanja/kanalov, lepljenje več naslovov URL, hitri prenos s shranjenimi privzetimi nastavitvami ali brskanje in prenos iz Razišči",
  feat_workflow_2:
    "**Osrednja vrsta prenosov** — vsako posamezno, seznamsko, množično ali hitro opravilo pristane na enem mestu za napredek, začasno ustavitev, nadaljevanje, preklic, ponovni poskus in nadzor prednosti",
  feat_workflow_3:
    "**Spremljanje odložišča** — kopirajte povezavo do videoposnetka in izpolnila bo polje URL, ko se vrnete v Arroxy, z možnostjo **Razveljavi**, če tega niste želeli. Medtem ko je Arroxy zaseden, povezava počaka, dokler niste spet na zavihku URL (izklopite v nastavitvah)",
  feat_workflow_4:
    "**Samodejno čiščenje URL-jev** — odstrani sledilne parametre (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) in razpre povezave `youtube.com/redirect`",
  feat_workflow_5:
    "**Način sistemske vrstice** — zapiranje okna ohrani prenose v ozadju",
  feat_workflow_6:
    "**{{LANG_COUNT}} jezikov** — samodejno zazna sistemski jezik, preklop kadar koli",
  feat_workflow_7:
    "**Sinhronizacija seznamov predvajanja** — znova preglejte seznam predvajanja glede na lokalno mapo, da preskočite že prenesene videoposnetke; ustvari datoteko seznama predvajanja `.m3u`, ki se posodablja ob prenosu vsakega videoposnetka",
  feat_workflow_8:
    "**Nadzor hitrosti in tempa** — omejite pasovno širino prenosa, nastavite, koliko delov videoposnetka se prenaša hkrati, in dodajte zakasnitve zahtev s prednastavitvami (*Izklopljeno · Uravnoteženo · Previdno · Po meri*)",
  feat_workflow_9:
    "**Predloge imen datotek** — poimenujte prenose po svoje z `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` in `{playlist_index}`, splošno ali za posamezen profil prenosa",
  feat_workflow_10:
    "**Hkratni prenosi in samodejni ponovni poskus** — izberite, koliko prenosov v vrsti teče hkrati, in pustite, da Arroxy ponovi prenos, ki je naletel na težavo z omrežjem ali strežnikom, pri čemer pred vsakim poskusom čaka dlje",
  feat_workflow_11:
    "**Profili po elementih seznama predvajanja** — vsakemu videoposnetku na seznamu predvajanja dodelite lasten profil prenosa namesto ene nastavitve za cel seznam, tako da lahko v enem prehodu nekatere arhivirate v polni kakovosti, preostale pa prenesete kot MP3",
  feat_workflow_13:
    "**Hitri prenos deluje v ozadju** — povezava se takoj pokaže v Prenosih in se tam pripravi, obvestilo z gumbom **Pokaži** to potrdi, polje URL pa se izprazni za naslednjo povezavo. Začnite, kolikor jih želite, medtem ko se prejšnji pripravljajo",
  feat_workflow_14:
    "**Prenosi vam povedo, kaj potrebuje vas** — če Arroxy povezave ne more prebrati, njena vrstica pove zakaj in ponudi rešitev: Poskusi znova, vklopi piškotke ali se prijavi v Razišči. Ko so piškotki izklopljeni, **Prijava v Razišči** poskusi znova namesto vas, ko ste prijavljeni. Seznam predvajanja, daljši od vaše omejitve nalaganja, v svoji vrstici počaka, da izberete vse, prve ali pregled. Zavihek Prenosi šteje vrstice, ki čakajo na vas",
  feat_workflow_15:
    "**Prenesite samo del videoposnetka** — na zaslonu Format izberite začetek in konec ali poglavje, Arroxy pa shrani samo ta obseg in ga za ID videoposnetka vključi v ime. Rezi pristanejo na najbližji ključni sličici; vklopite natančen rez, če želite namesto tega ponovno kodiranje",
  feat_workflow_16:
    "**Odstranjevanje končanih prenosov** — izbirno: končan prenos zapusti seznam 5 sekund pozneje. Njegove datoteke ostanejo na disku, neuspeli prenosi pa ostanejo na seznamu",
  feat_workflow_17:
    "**Velikost in Manjka v Prenosih** — razvrstljiv stolpec **Velikost** prikazuje, koliko prostora zaseda posamezen prenos, **Manjka** pa označi datoteke, premaknjene ali izbrisane zunaj programa Arroxy",
  feat_workflow_18:
    "**Aurora ali Minimalističen, temno ali svetlo** — steklene plošče nad gibajočim se nebom ali mirne polne površine; preklop v nogi. Računalniki brez grafičnega pospeševanja samodejno dobijo Minimalističen",
  feat_workflow_19:
    "**Menijska vrstica Mac** — v macOS odprite nastavitve (`Cmd+,`), nastavite omejitev hitrosti prenosa, zamenjajte slog in temo ter odprite dnevnike ali shranite datoteko z diagnostiko iz menijske vrstice",
  feat_workflow_20:
    "**Spremenite profil iz katerega koli prenosa** — prilagodite prenos, nato posodobite profil, iz katerega se je začel (s predogledom sprememb), ali shranite nastavitve kot nov profil. Pri zamenjavi profila vas vpraša, ali želite obdržati svoje spremembe",
  feat_post_h3: "Podnapisi in naknadna obdelava",
  feat_post_1:
    "**Podnapisi** v SRT, VTT ali ASS — ročni ali samodejno ustvarjeni, v katerem koli razpoložljivem jeziku",
  feat_post_2:
    "Shranite ob videoposnetku, vdelajte v `.mkv` ali uredite v podmapo `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — preskočite ali označite s poglavji sponzorje, uvode, zaključke in samopromocije",
  feat_post_4:
    "**Vdelani metapodatki** — naslov, datum nalaganja, kanal, opis, sličica in oznake poglavij, zapisani v datoteko",
  feat_post_5:
    "**Paketi samo s podnapisi** — prilepite seznam naslovov URL ali odprite seznam predvajanja, izberite Podnapisi in dobite samo datoteke s podnapisi za vsak videoposnetek",
  feat_sites_h3: "YouTube + 2000 spletnih mest",
  feat_sites_1:
    "**YouTube v celoti** — Videoposnetki, Shorts, Kanali, Seznami predvajanja, YouTube Music in Podkasti so obravnavani kot prvovrstni viri",
  feat_sites_2:
    "**Več kot 2000 drugih spletnih mest** prek yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable in še mnogo drugih",
  feat_sites_3:
    "**Samo zvok in podnapisi** delujejo na vseh podprtih spletnih mestih, ne le na YouTubu",
  feat_sites_4:
    "Če se spletno mesto spremeni, yt-dlp vsak teden izda popravke, Arroxy pa ob zagonu samodejno posodobi izvedljivo datoteko",
  shot1_cap:
    "<b>Domača stran hitrega prenosa</b><br/>Prilepite URL in ga takoj prenesite z aktivnim profilom",
  shot2_cap:
    "<b>Večkrat uporabni profili prenosa</b><br/>Shranite prednastavitve formata, kakovosti in izhoda — uporabite jih pri vsakem prenosu",
  shot3_cap:
    "<b>Večjezični zvočni posnetki</b><br/>Izberite točen jezik zvoka, ki ga videoposnetek ponuja",
  shot4_cap:
    "<b>Prostorski / Dolby zvok</b><br/>Posnetki 5.1 in Dolby so zaznani in ohranjeni",
  shot5_cap:
    "<b>Način več naslovov URL</b><br/>Prilepite seznam, samodejno odstranite dvojnike in vse dodajte v vrsto naenkrat",
  shot6_cap:
    "<b>Vzporedna vrsta prenosov</b><br/>Več prenosov hkrati z napredkom v živo",
  hotkey_fig_alt:
    "Splošna bližnjica za prenos v Arroxy — Ctrl+Shift+D v sistemih Windows in Linux, Cmd+Shift+D v macOS, ki kopirano povezavo pošlje neposredno v vrsto prenosov",
  hotkey_fig_cap:
    "<b>Splošna bližnjica za prenos</b><br/>Kjer koli kopirajte povezavo, enkrat pritisnite — pristane v vrsti in se začne prenašati",
  shot7_cap: "<b>Profili po elementih seznama predvajanja</b><br/>Vsakemu videoposnetku dajte lasten profil — nekatere arhivirajte v 4K, preostale prenesite kot MP3",
  shot8_cap:
    "<b>Razišči</b><br/>Brskajte po YouTubu ali katerem koli drugem spletnem mestu v programu Arroxy in prenesite stran, na kateri ste, z aktivnim profilom",
  shot9_cap:
    "<b>Prvi zaslon Razišči</b><br/>Kratek pogled na Razišči in zakaj je sekundarni račun varnejša prijava",
  shot10_cap:
    "<b>Prenosi vam povedo, kaj potrebuje vas</b><br/>Povezave se pripravljajo v ozadju; neuspela ponudi rešitev, dolg seznam predvajanja počaka na vašo izbiro",
  shot11_cap:
    "<b>Prenesite samo del videoposnetka</b><br/>Izberite začetek in konec ali poglavje — Arroxy shrani samo ta obseg",
  shot12_cap:
    "<b>Urejevalnik profilov</b><br/>Prilagodite profil: vrsto datoteke, ločljivost, podnapise, cilj, predlogo imena datoteke in več",
  shot13_cap:
    "<b>Temno ali svetlo, steklo ali polno</b><br/>Štirje videzi na izbiro: steklene plošče nad gibajočim se nebom ali mirne polne površine, vsak v temni in svetli različici",
  shot14_cap:
    "<b>8K HDR pri 60 sličicah/s</b><br/>Vsaka ločljivost, kodek in tok HDR, ki ga videoposnetek ponuja, drug ob drugem",
  dl_platform_col: "Platforma",
  dl_format_col: "Neposredni prenos",
  dl_oneline_note:
    "Gradnje so samo za x86_64. Nimate `curl`? Zamenjajte `curl -fsSL` z `wget -qO-`.",
  dl_win_scoop:
    "Raje Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Namestitveni program (NSIS) ali prenosni `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ali `.flatpak` (v peskovniku)",
  dl_grab: "Vse datoteke izdaje →",
  dl_pkg_h3: "Namestitev prek upravitelja paketov",
  dl_channel_col: "Kanal",
  dl_command_col: "Ukaz",
  dl_win_h3: "Windows: namestitveni program ali prenosna različica",
  dl_win_col_installer: "Namestitveni program NSIS",
  dl_win_col_portable: "Prenosni `.exe`",
  dl_win_r1: "Zahteva namestitev",
  dl_win_r1_installer: "Da",
  dl_win_r1_portable: "Ne — zaženite od koder koli",
  dl_win_r2: "Samodejne posodobitve",
  dl_win_r2_installer: "✅ v aplikaciji",
  dl_win_r2_portable: "❌ ročni prenos",
  dl_win_r3: "Hitrost zagona",
  dl_win_r3_installer: "✅ hitrejši",
  dl_win_r3_portable: "⚠️ počasnejši hladni zagon",
  dl_win_r4: "Doda se v meni Start",
  dl_win_r5: "Enostavna odstranitev",
  dl_win_r5_portable: "❌ izbrišite datoteko",
  dl_win_rec:
    "**Priporočilo:** uporabite namestitveni program NSIS za samodejne posodobitve in hitrejši zagon. Uporabite prenosni `.exe` za možnost brez namestitve in brez zapisov v register.",
  dl_win_smartscreen_h4: "Opozorilo SmartScreen v sistemu Windows",
  dl_win_smartscreen_intro:
    'Ob prvem zagonu boste morda videli **„Windows je zaščitil vaš računalnik“** ali **„Neznani založnik“.** To velja za `Arroxy-win-x64-Setup.exe` in `Arroxy-win-x64-Portable.exe`. Arroxy je brezplačen in odprtokoden, gradnje za Windows pa niso podpisane s plačljivim potrdilom, zato jih SmartScreen označi. To **ne** pomeni samodejno, da Arroxy ni varen. Za nadaljevanje:',
  dl_win_smartscreen_step1: "Kliknite **Več informacij**.",
  dl_win_smartscreen_step2: "Kliknite **Vseeno zaženi**.",
  dl_win_smartscreen_official:
    "Arroxy prenesite samo z uradne strani GitHub Releases. Če ste datoteko dobili z drugega spletnega mesta ali vam jo je nekdo poslal, jo izbrišite in iz uradnega vira prenesite novo kopijo. Izvorna koda je javna, zato jo lahko pregledate ali, če želite, Arroxy zgradite sami.",
  dl_macos_h3: "Prvi zagon v macOS",
  dl_macos_warning:
    "Arroxy še ni podpisan s kodo, zato lahko macOS Gatekeeper ob prvem zagonu prikaže opozorilo o poškodovani aplikaciji. To je pričakovano — ne pomeni dejanske poškodbe datoteke.",
  dl_macos_m1_h4: "Metoda s terminalom:",
  dl_macos_step1: "Povlecite `Arroxy.app` iz priklopljenega DMG v `/Applications`.",
  dl_macos_step2:
    "Odprite Terminal in zaženite `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Zaženite `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Če je pot do aplikacije drugačna, zamenjajte `/Applications/Arroxy.app` s potjo, kamor ste jo namestili.",
  dl_macos_step5:
    "Vnesite geslo za Mac, če ga `sudo` zahteva.",
  dl_macos_after:
    "Ko je karantena odstranjena, se Arroxy odpre normalno.",
  dl_macos_m2_h4: "Metoda s terminalom:",
  dl_macos_note:
    "Gradnje za macOS nastajajo prek CI na izvajalcih Apple Silicon in Intel. Če naletite na težave, [odprite težavo](../../issues) — povratne informacije uporabnikov macOS dejavno oblikujejo cikel testiranja za macOS.",
  dl_linux_h3: "Prvi zagon v Linuxu",
  dl_linux_intro:
    "AppImage se zaženejo neposredno — brez namestitve. Datoteko morate samo označiti kot izvedljivo.",
  dl_linux_m1_text:
    "**Upravitelj datotek:** z desno tipko miške kliknite `.AppImage` → **Lastnosti** → **Dovoljenja** → vklopite **Dovoli izvajanje datoteke kot programa**, nato dvokliknite.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Če zagon še vedno ne uspe, ga zaženite brez priklopa — paket FUSE ni potreben:",
  dl_linux_targz_h4: "Navaden tarball (brez FUSE, brez namestitve):",
  dl_linux_targz_text: "Gradnja `.tar.gz` je ista aplikacija brez ovoja AppImage — razpakirajte jo kamor koli in zaženite. Namestitveni program in paket FUSE nista potrebna.",
  dl_linux_arch_note: "**Prenosi za Linux na strani izdaje so samo za x86_64.** Na računalnikih ARM64 (Raspberry Pi, Asahi Linux) se Flatpak še vedno namesti, nato pa ob zagonu spodleti z `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Zakaj lahko vidite opozorilo",
  dl_warning_p1:
    "Arroxy je odprtokoden in ima licenco GPLv3. Gradnje za Windows in macOS **niso podpisane s kodo** — potrdila Apple Developer ID in Windows EV za podpisovanje kode stane več sto dolarjev na leto, kar neodvisen projekt plača iz lastnega žepa. Brez teh podpisov vas bosta Windows SmartScreen in macOS Gatekeeper ob prvem zagonu opozorila. Opozorila pomenijo *vaš OS ne prepozna založnika* — ne pomenijo, da je Arroxy zlonamerna programska oprema.",
  dl_warning_p2:
    "Trije načini, kako lahko Arroxy preverite sami, po naraščajoči strogosti:\n\n- **Preberite izvorno kodo.** Vsaka vrstica je na [GitHubu](https://github.com/antonio-orionus/Arroxy), [zgradite jo lahko iz izvorne kode](#tech).\n- **Preverite SHA256.** Primerjajte svojo datoteko z objavljeno [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — glejte [Preverite svoj prenos](#verify) spodaj.\n- **Zaženite pregled tretje osebe.** Naložite datoteko na [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Prvi zagon v sistemu Windows",
  shot_smartscreen_more_alt:
    'Pogovorno okno SmartScreen „Windows je zaščitil vaš računalnik“ z označeno povezavo „Več informacij“',
  shot_smartscreen_run_alt:
    'Pogovorno okno SmartScreen po razširitvi Več informacij, ki prikazuje gumb „Vseeno zaženi“',
  dl_win_defender_h4: "Če Windows Defender datoteko označi ali odstrani",
  dl_win_defender_p:
    "Hevristika programa Defender včasih nepodpisane namestitvene programe NSIS in prenosne Electron aplikacije označi kot sumljive. Če Defender v karanteno premakne `Arroxy-win-x64-Setup.exe` ali `Arroxy-win-x64-Portable.exe`, jo obnovite v **Varnost sistema Windows → Zaščita pred virusi in grožnjami → Zgodovina zaščite**, nato izvedljivo datoteko Arroxy dodajte kot dovoljen element v **Upravljanje nastavitev → Dodajanje ali odstranjevanje izjem**. Tako kot pri SmartScreen je sprožilec manjkajoči podpis založnika, ne zaznana zlonamerna programska oprema.",

  dl_macos_first_h3: "Prvi zagon v macOS",
  dl_macos_intro:
    "Gradnje Arroxy za macOS so podpisane ad hoc, vendar jih Apple ni overil (notarization), zato Gatekeeper ob prvem zagonu blokira zagon s sporočilom *„Arroxy.app“ ni bilo odprto — Apple ni mogel preveriti, da „Arroxy.app“ ne vsebuje zlonamerne programske opreme*. To pomeni, da macOS aplikacije ne more preveriti pri Applu, ne da je kaj narobe z datotekami. Namestitev s Homebrew se temu pogovornemu oknu povsem izogne. Če ste uporabili DMG, ga odpravi en ukaz v terminalu:",
  dl_macos_sequoia_h4: "Rešitev s terminalom za trenutni macOS",
  dl_macos_sequoia_intro:
    "Terminal uporabite po kopiranju Arroxy v Applications:",
  dl_macos_sequoia_step1:
    "Povlecite `Arroxy.app` iz priklopljenega DMG v `/Applications`.",
  dl_macos_sequoia_step2:
    "Odprite Terminal in zaženite ta dva ukaza:",
  dl_macos_sequoia_step3:
    "Zaženite `open /Applications/Arroxy.app`, da zaženete Arroxy.",
  dl_macos_sequoia_step4:
    "Če je pot do aplikacije drugačna, zamenjajte `/Applications/Arroxy.app` s potjo, kamor ste jo namestili.",
  dl_macos_sonoma_h4: "Rešitev s terminalom za starejši macOS",
  dl_macos_sonoma_step1:
    "Povlecite `Arroxy.app` iz priklopljenega DMG v `/Applications`.",
  dl_macos_sonoma_step2:
    "Odprite Terminal in odstranite karanteno iz `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Ko je karantena odstranjena, zaženite Arroxy iz terminala ali Finderja.",
  dl_macos_damaged_h4:
    "Odprava karantene Gatekeeper",
  dl_macos_damaged_p:
    "Prvi ukaz odstrani atribut karantene, ki ga je macOS pripel ob prenosu datoteke; drugi zažene aplikacijo. `sudo` običajno ne potrebujete, ker kopija v `/Applications` pripada vam — dodajte ga samo ob napaki dovoljenj.",
  dl_macos_arch_note:
    "**Apple Silicon ali Intel:** na Macu serije M (M1 / M2 / M3 / M4) prenesite DMG `arm64`. Na Macih Intel prenesite DMG `x64`. Napačna gradnja prek Rosetta še vedno deluje, vendar opazno počasneje.",

  dl_linux_first_h3: "Prvi zagon v Linuxu",
  dl_linux_appimagelauncher:
    "**Izbirna integracija z namizjem:** enkrat namestite [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) in vsaka AppImage, ki jo dvokliknete, se samodejno registrira v meniju zaganjalnika — ročna datoteka `.desktop` ni potrebna.",

  dl_verify_h3: "Preverite svoj prenos (SHA256)",
  dl_verify_intro:
    "Vsaka izdaja poleg binarnih datotek objavi datoteko `SHA256SUMS`. Da preverite, da vaš prenos med prenosom ni bil poškodovan ali spremenjen, lokalno izračunajte zgoščeno vrednost svoje datoteke in jo primerjajte z vrstico v `SHA256SUMS`. Odprite stran najnovejše izdaje → **Assets** → prenesite `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell ali ukazni poziv):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Želite pregled za zlonamerno programsko opremo s strani tretje osebe? Naložite datoteko na [VirusTotal](https://www.virustotal.com). Peščica splošnih hevrističnih oznak manjših mehanizmov je običajna za nepodpisane aplikacije Electron; razširjene zaznave večjih mehanizmov bi bile resen razlog za skrb.",

  dl_pm_intro:
    "Raje drug kanal? Tudi ti delujejo in ostajajo usklajeni z vsako izdajo.",

  privacy_p1:
    "Prenosi se pridobijo neposredno prek [yt-dlp](https://github.com/yt-dlp/yt-dlp) z YouTuba v mapo, ki jo izberete — nič ne gre prek strežnika tretje osebe. Zgodovina ogledov, zgodovina prenosov, naslovi URL in vsebina datotek ostanejo na vaši napravi.",
  privacy_p2:
    "Brez telemetrije — samo en anonimen signal delovanja na dan: različica aplikacije, OS, jezik, kanal namestitve, država in približno, kako dolgo nazaj je bil Arroxy nameščen, da lahko štejemo aktivne in nove uporabnike. Brez ID-jev, naslovov URL, naslovov videoposnetkov, poti do datotek ali podatkov o računu. Izklopite ga lahko v nastavitvah.",
  privacy_p3:
    "Razišči hrani lastne prijave, ločene od vašega brskalnika, Arroxy pa nikoli ne prebere ali izpolni obrazca za prijavo — vpisujete na strani spletnega mesta samega. Prenosi tečejo odjavljeni; samo kadar kateri spodleti na način, ki ga lahko odpravi račun, Arroxy sveže prebere prijavo, jo za ta prenos shrani v začasno datoteko in datoteko nato izbriše. Z odjavo iz Razišči v nastavitvah se pozabijo.",
  faq_q1: "Je res brezplačen?",
  faq_a1: "Da — licenca GPLv3, brez plačljive različice, brez zaklepanja funkcij.",
  faq_q11: "Po čem se Arroxy razlikuje od drugih grafičnih vmesnikov za yt-dlp?",
  faq_a11:
    "Večina brezplačnih grafičnih vmesnikov za yt-dlp so ovoji, ki sprejmejo samo povezavo. Arroxy doda **Razišči**, v aplikacijo vgrajen brskalnik, ki odpre YouTube ali katero koli drugo spletno mesto: brskate in prenašate brez kopiranja povezav, tam pa se enkrat prijavite, da prenesete zasebne videoposnetke, videoposnetke samo za člane in starostno omejene videoposnetke ter svoja seznama Ogled pozneje in Všečkano, brez izvoza piškotkov. Arroxy to prijavo uporabi, ko YouTube zahteva potrditev, da niste bot, njegov vgrajeni brskalnik pa pridobi žeton za prenos YouTuba, da prenosi ne padejo na manj formatov. Glejte [Zakaj Arroxy](#why).",
  faq_q2: "Kakšne kakovosti videoposnetkov lahko prenesem?",
  faq_a2:
    "Vse, kar ponuja YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, poleg tega samo zvok. Toki 60 sličic/s in HDR so ohranjeni nespremenjeni, postopni prenos pa omogoča izbiro AV1, VP9 ali H.264 pri vsaki ločljivosti.",
  faq_q3: "Ali lahko izvlečem samo zvok kot MP3?",
  faq_a3:
    "Da. V meniju formatov izberite *samo zvok* in izberite MP3, M4A/AAC, Opus ali WAV.",
  faq_q4: "Kako prenesem videoposnetke, ki zahtevajo račun YouTube?",
  faq_a4:
    "Enkrat se prijavite na zavihku Razišči. Arroxy nato lahko prenese zasebne videoposnetke in videoposnetke samo za člane, ki jih lahko gleda vaš račun, starostno omejene videoposnetke, če je račun starostno preverjen, ter vaša seznama Ogled pozneje in Všečkano. Prijavo uporabi samo, kadar prenos spodleti na način, ki ga lahko odpravi račun; vse ostalo se prenaša kot prej. To je izbira **Prijava v Razišči**, navedena prva in označena kot Priporočeno v nastavitvah piškotkov, Arroxy pa jo izbere namesto vas, ko prvič odprete Razišči. Wiki za yt-dlp navaja, da [avtomatizacija s prijavo lahko označi račun Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), zato je sekundarni račun varnejša izbira.",
  faq_q5: "Ali bo še vedno deloval, ko YouTube kaj spremeni?",
  faq_a5:
    "yt-dlp se ob zagonu samodejno posodobi, Arroxy pa ob spremembah na YouTubu hitro izda popravke. Ko YouTube zahteva potrditev, da niste bot, Arroxy poskusi tudi z vašo prijavo v Razišči, če ste se tam prijavili, v nastavitvah piškotkov pa so na voljo tudi piškotki iz datoteke ali brskalnika.",
  faq_q6: "V katerih jezikih je na voljo Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} jezikov, takoj po namestitvi: {{LANG_NAME_LIST}}. Arroxy ob prvem zagonu samodejno zazna jezik vašega operacijskega sistema, preklopite pa lahko kadar koli z izbirnika jezika v orodni vrstici. JSON jezikov za izvajanje je v src/shared/i18n/locales/, katalogi PO za prevajalce pa v i18n/locales/ — odprite PR na GitHubu in prispevajte.",
  faq_q7: "Ali moram namestiti še kaj drugega?",
  faq_a7:
    "Ne. yt-dlp, ffmpeg in ffprobe se samodejno prenesejo ob prvem zagonu in shranijo v predpomnilnik na vašem računalniku. Po tem dodatna nastavitev ni potrebna.",
  faq_q8: "Ali lahko prenesem sezname predvajanja ali cele kanale?",
  faq_a8:
    "Da — oboje. Prilepite URL seznama predvajanja ali URL kanala (npr. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); izberite, koliko vnosov naj se pregleda, nato dodajte v vrsto celoten seznam ali izberite določene videoposnetke. Filtri po časovnem obdobju prihajajo kmalu.",
  faq_q9: 'macOS pravi „aplikacija je poškodovana“ — kaj naj storim?',
  faq_a9:
    'To je macOS Gatekeeper, ki blokira nepodpisano aplikacijo, ne dejanska poškodba. Glejte [Prvi zagon v macOS](#macos-first-launch) za ukaze v terminalu, ki odstranijo karanteno in zaženejo Arroxy.',
  faq_q10: "Je prenašanje videoposnetkov z YouTuba zakonito?",
  faq_a10:
    "Za osebno, zasebno uporabo je v večini jurisdikcij na splošno sprejeto. Odgovorni ste za skladnost z YouTubovimi [Pogoji uporabe](https://www.youtube.com/t/terms) in lokalno zakonodajo o avtorskih pravicah.",
  plan_intro: "Še vedno načrtovano — približno po vrstnem redu prednosti:",
  plan_col1: "Funkcija",
  plan_col2: "Opis",
  plan_r1_name: "**Filtri za sezname predvajanja in kanale**",
  plan_r1_desc: "Filtri po časovnem obdobju pri naštevanju seznama predvajanja ali kanala",
  plan_r2_name: "**Nastavitve zvočnih posnetkov YouTube**",
  plan_r2_desc:
    "Nastavite splošno prednostni govorjeni jezik posnetka s preglasitvami po profilih, kadar YouTube ponuja več zvočnih posnetkov",
  plan_r3_name: "**Močnejše obnavljanje po napakah**",
  plan_r3_desc:
    "Nova pot ponovnega poskusa za prenose, prekinjene zaradi nezanesljivih ali problematičnih internetnih povezav",
  plan_r4_name: "**Celoten upravitelj prenosov**",
  plan_r4_desc:
    "Pretvorba predala z vrsto v popolnejši upravitelj, vključno s spreminjanjem ciljnih map za elemente v vrsti",
  plan_r5_name: "**Načrtovani prenosi**",
  plan_r5_desc: "Zagon vrste ob določenem času (nočni prenosi)",
  plan_r9_name: "**Paket AUR**",
  plan_r9_desc: "Namestitev v Arch Linux in Omarchy z `yay -S arroxy-bin`",
  plan_cta:
    "Imate v mislih funkcijo? [Odprite zahtevo](../../issues) — prednosti oblikuje mnenje skupnosti.",
  tech_content: TECH_CONTENT,
  support_h2: "Podprite Arroxy",
  support_note: "Arroxy je brezplačen in ima licenco GPLv3 — brez oglasov, brez telemetrije, brez plačljive različice. Če vam prihrani čas, lahko razvoj podprete z Bitcoinom, Tronom ali Ethereumom: naslovi so v [DONATE.md](DONATE.md), ki je edini uradni vir zanje. Arroxy vam naslova nikoli ne bo poslal po e-pošti ali neposrednem sporočilu. Zvezdica repozitoriju, prijava napak in izboljšanje prevodov pomagajo prav toliko.",
  tos_h2: "Pogoji uporabe",
  tos_note:
    "Arroxy je orodje samo za osebno, zasebno uporabo. Izključno vi ste odgovorni, da so vaši prenosi skladni z YouTubovimi [Pogoji uporabe](https://www.youtube.com/t/terms) in zakoni o avtorskih pravicah vaše jurisdikcije. Arroxy ne uporabljajte za prenos, razmnoževanje ali razširjanje vsebine, ki je nimate pravice uporabljati. Razvijalci ne odgovarjajo za nobeno zlorabo.",
  footer_credit:
    'GPLv3 · Narejeno s skrbjo, <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
