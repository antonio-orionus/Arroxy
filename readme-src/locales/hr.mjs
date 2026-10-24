const TECH_CONTENT = `<details>
<summary><strong>Tehnologije</strong></summary>

- **Electron** — višeplatformska ljuska za stolna računala
- **React 19** + **TypeScript** — korisničko sučelje
- **Tailwind CSS v4** — stilovi
- **Zustand** — upravljanje stanjem
- **yt-dlp** + **ffmpeg** — mehanizam za preuzimanje i multipleksiranje (oba se dohvaćaju tijekom rada: yt-dlp se održava ažurnim, a ffmpeg/ffprobe se instaliraju jednom i zadržavaju nakon ažuriranja)
- **Vite** + **electron-vite** — alati za izgradnju
- **Vitest** + **Playwright** — jedinični i end-to-end testovi

</details>

<details>
<summary><strong>Izgradnja iz izvornog koda</strong></summary>

### Preduvjeti — sve platforme

| Alat    | Verzija | Instalacija |
| ------- | ------- | ----------- |
| Git     | bilo koja | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` ili \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` ili \`package.json\` \`packageManager\` |

Preporučeno: instalirajte \`mise\`, a zatim u kloniranom repozitoriju pokrenite \`mise install\`. Bez mise-a ručno aktivirajte Node.js prema \`.node-version\` i Bun prema \`package.json\` prije \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Za ponovnu izgradnju izvornih modula mogu biti potrebni Visual Studio Build Tools i Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Nakon kloniranja u repozitoriju pokrenite \`mise trust && mise install\`. Ako vaša ljuska već koristi \`fnm\`, \`nvm\` ili Bun iz Homebrewa, aktivirajte mise u \`~/.zshrc\` kako bi Arroxy dobio Node.js 24.21.0 i Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Ovisnosti za izgradnju i Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Samo za E2E testove (Electronu je potreban zaslon)
sudo apt install -y xvfb
\`\`\`

### Kloniranje i pokretanje

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # preporučeno; preskočite ako ste ručno aktivirali zadane alate
bun run bootstrap
bun run doctor
bun run dev            # Electron aplikacija uz Vite renderer
\`\`\`

### Izrada paketa za distribuciju

\`\`\`bash
bun run build        # provjera tipova + kompilacija
bun run dist         # paket za trenutačni OS
bun run dist:win     # paketi za Windows kad se pokrene na podržanom računalu
\`\`\`

> \`bun run bootstrap\` instalira ovisnosti, ponovno gradi ovisnosti Electron aplikacije, provjerava Electron, priprema ugrađene ffmpeg/ffprobe za razvoj i instalira Playwright Chromium. Izdanja upravljaju programima yt-dlp, ffmpeg i ffprobe tijekom rada u mapi s podacima aplikacije; nijedan od njih nije uključen u instalacijski program.

</details>`;

export const hr = {
  icon_alt: "Maskota Arroxyja",
  hero_image_alt: "Zalijepite poveznicu ili jednostavno pregledavajte web. Zaslon za unos URL-a i ugrađeni preglednik programa Arroxy s preuzimanjem u tijeku.",
  hero_banner_line1: "Zalijepite poveznicu,",
  hero_banner_line2: "ili pregledavajte web.",
  title:
    "Arroxy — besplatan program otvorenog koda za preuzimanje s YouTubea (+ 2000 web-mjesta) s ugrađenim preglednikom, za Windows, macOS i Linux",
  read_in_label: "Čitajte na jeziku:",
  badge_release_alt: "Izdanje",
  badge_build_alt: "Izgradnja",
  badge_license_alt: "Licencija",
  badge_platforms_alt: "Platforme",
  badge_i18n_alt: "Jezici",
  badge_website_alt: "Web-mjesto",
  discord_badge_text: "Pridružite se zajednici na Discordu",
  discord_badge_encoded: "Pridru%C5%BEite%20se%20zajednici%20na%20Discordu",
  hero_desc:
    "Preuzimajte videozapise, Shorts, kanale, podcaste ili audiozapise s **YouTubea i više od 2000 podržanih web-mjesta** — do 8K HDR pri 60 sličica u sekundi, kao MP3 / AAC / Opus ili samo dio koji vam treba. **Pregledavajte YouTube ili bilo koje drugo web-mjesto unutar Arroxyja** na kartici Istraži i preuzmite videozapis, popis za reprodukciju ili kanal na kojem se nalazite; prijavite se tamo da biste preuzimali videozapise koje vaš račun već može gledati. Radi lokalno na sustavima Windows, macOS i Linux. **Bez oglasa, suvišnog softvera i dodatnog plaćanja.**",
  cta_latest: "↓ Instaliraj najnovije izdanje",
  cta_website: "Web-mjesto",
  website_url: "https://arroxy.com/",
  star_cta: "Ako vam Arroxy štedi vrijeme, ⭐ pomaže drugima da ga pronađu.",
  ai_notice: "> 🌐 Ovaj je prijevod nastao uz pomoć umjetne inteligencije. [Englesko izdanje README-a](README.md) mjerodavan je izvor. Pronašli ste pogrešku? [Otvorite PR](../../pulls).",
  intro_what_is:
    "**Što je Arroxy?** Arroxy je besplatno grafičko sučelje otvorenog koda za stolna računala koje preuzima videozapise, audio, popise za reprodukciju i titlove s YouTubea i više od 2000 drugih web-mjesta koja podržava [yt-dlp](https://github.com/yt-dlp/yt-dlp). Radi na sustavima Windows 10/11, macOS 13+ (Intel + Apple Silicon) i Linux (AppImage, Flatpak, tar.gz). Licenca GPLv3. Bez oglasa i ograničenja korištenja. Distribucija: [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage i izravno preuzimanje.",
  intro_key_difference:
    "**Ključna razlika: ugrađeni preglednik.** Većina besplatnih programa za preuzimanje s YouTubea tanki su omotači oko yt-dlp-a: okvir za URL i izbornik formata, bez vlastitog preglednika. Arroxy ga ima, a to je kartica **Istraži**. Pregledavate YouTube ili bilo koje drugo web-mjesto unutar aplikacije i preuzimate videozapis, popis za reprodukciju ili kanal na kojem se nalazite, ili desnom tipkom miša kliknete bilo koju poveznicu. Ako se jednom prijavite u Istraži, preuzimanja koja zahtijevaju račun koriste tu prijavu: vaše privatne videozapise, vaše popise Za kasnije i Označeno sa sviđa mi se te druge videozapise koje vaš račun već može gledati, bez izvoza kolačića. Prijavite se tamo i na druga web-mjesta pa će njihova preuzimanja koristiti tu prijavu kad im zatreba. Pojedinosti: [Zašto Arroxy](#why-explore).",
  last_updated: "Zadnje ažuriranje: {{LAST_UPDATED}}.",
  toc_heading: "Sadržaj",
  why_h2: "Zašto Arroxy",
  features_h2: "Značajke",
  dl_h2: "Instalacija i prvo pokretanje",
  privacy_h2: "Privatnost",
  faq_h2: "Česta pitanja",
  roadmap_h2: "Plan razvoja",
  tech_h2: "Izrađeno pomoću",
  why_intro: "Usporedba s najčešćim alternativama:",
  why_r1: "Besplatno, bez plaćene razine",
  why_r2: "Otvoreni kod",
  why_r3: "Samo lokalna obrada",
  why_r5: "Bez ograničenja korištenja",
  why_r6: "Višeplatformska aplikacija za stolna računala",
  why_r7: "Titlovi + SponsorBlock",
  why_r8: "Ugrađeni preglednik (pregledavanje, prijava, preuzimanje)",
  why_r9: "Videozapisi koje vaš račun može gledati, bez izvoza kolačića",
  why_table_note:
    "⚠️ = djelomično ili samo u plaćenoj razini. Prijava unutar aplikacije za privatne videozapise u programu 4K Video Downloader plaćena je značajka; većina besplatnih yt-dlp sučelja prihvaća samo datoteku s kolačićima ili čita kolačiće vašeg web-preglednika.",
  why_summary:
    "Arroxy je izrađen za jedno: čistu lokalnu datoteku, bilo da zalijepite URL ili pronađete videozapis u Istraži. Bez dodatnog plaćanja, bez prikupljanja podataka.",
  why_explore_h3: "Što običan omotač oko yt-dlp-a ne može: kartica Istraži",
  why_explore_intro:
    "Većina besplatnih programa za preuzimanje s YouTubea samo je okvir za URL povrh yt-dlp-a. Arroxy također koristi yt-dlp, ali ima i **Istraži**, preglednik ugrađen u aplikaciju koji otvara YouTube ili bilo koje drugo web-mjesto. Istraži dodaje ono što okvir za URL ne može:",
  why_explore_1:
    "**Videozapisi koje može gledati vaš račun, bez izvoza kolačića** — vaši privatni videozapisi, vaši popisi Za kasnije i Označeno sa sviđa mi se, videozapisi s dobnim ograničenjem na računu s potvrđenom dobi te stranice na drugim web-mjestima koje zahtijevaju vašu prijavu. Običan omotač treba izvoz cookies.txt ili čita kolačiće vašeg web-preglednika. U Arroxyju se jednom prijavite u Istraži, a ostalo odrađuje on",
  why_explore_4:
    "**Bez kopiranja poveznica** — pronađite videozapis, popis za reprodukciju ili kanal u Istraži i preuzmite ga jednim klikom ili desnom tipkom miša kliknite bilo koju poveznicu na stranici",
  why_explore_5:
    "**Blokator oglasa kad ga želite** — jedan klik na štit blokira oglase i alate za praćenje na stranicama u Istraži",
  feat_explore_h3: "Istraži: pregledavajte web unutar Arroxyja",
  feat_explore_1:
    "**Kartica Istraži** — pregledavajte YouTube ili bilo koje drugo web-mjesto unutar Arroxyja i preuzmite što pronađete bez kopiranja poveznica. **Preuzmi · *vaš profil*** stavlja u red videozapis, popis za reprodukciju ili kanal koji gledate; strelica pokraj toga mijenja profile, a čarobni štapić otvara preuzimanje korak po korak za odabir formata, titlova i više",
  feat_explore_6:
    "**Preuzimanje desnom tipkom miša** — desnom tipkom kliknite bilo koju poveznicu na videozapis, popis za reprodukciju ili kanal u Istraži da ga preuzmete sa svojim profilom, odaberite drugi profil u izborniku **Preuzmi s profilom**, otvorite preuzimanje korak po korak ili kopirajte poveznicu. Nije potrebno prvo otvarati svaki videozapis",
  feat_explore_7:
    "**Kompaktan raspored** — jedan klik na alatnoj traci Istraži premješta Arroxyjeve kartice u nju i daje stranici više prostora",
  feat_explore_2:
    "**Adresna traka** — upišite pojam za pretraživanje YouTubea ili unesite bilo koju web-adresu da otvorite to web-mjesto",
  feat_explore_3:
    "**Preuzimanja koja zahtijevaju račun** — jednom se prijavite u Istraži i Arroxy može preuzimati videozapise koje vaš račun može gledati: vaše privatne videozapise, videozapise s dobnim ograničenjem ako je dob računa potvrđena te vaše popise Za kasnije i Označeno sa sviđa mi se. Prijavite se tamo i na druga web-mjesta pa će njihova preuzimanja koristiti tu prijavu kad im zatreba. Arroxy i dalje prvo preuzima bez prijave i koristi vašu prijavu u Istraži samo kad preuzimanje propadne na način koji račun može popraviti",
  feat_explore_4:
    "**Koristite sporedni račun** — prvi zaslon Istraži objašnjava zašto: preuzimanje s računom nosi određeni rizik da će taj račun biti ograničen. Odjavite se iz Istraži u postavkama kad god želite zaboraviti svoje prijave",
  feat_explore_5:
    "**Blokator oglasa** — prema zadanim postavkama isključen. Jedan klik na štit na alatnoj traci Istraži blokira oglase i alate za praćenje na njegovim stranicama, bez utjecaja na preuzimanja. YouTube može praviti poteškoće blokatorima oglasa za prijavljene račune",
  feat_quality_h3: "Kvaliteta i formati",
  feat_quality_1: "Do **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Visoka brzina sličica i HDR** zadržani su nepromijenjeni — 60 sličica u sekundi, HDR10",
  feat_quality_3:
    "**Audio** — izvezite samo zvuk kao MP3, M4A/AAC, Opus ili WAV. U interaktivnim preuzimanjima, kad su dostupni, odaberite izvorne surround/Dolby zapise izvora (AC-3, E-AC-3, 5.1, DRC) ili postavite globalno zadano **Preferiraj surround / Dolby**",
  feat_quality_4:
    "**Profili s ciljem** — *Najbolja slika* (AV1 · VP9) ili *Smart TV* (MP4 · H.264), spremljeni kao Automatski, MP4, MKV ili WebM bez ponovnog kodiranja. HDR je *Automatski* (samo kad ga vaš zaslon može prikazati), *SDR* ili *HDR*",
  feat_quality_5:
    "**Svaki kodek u svakoj razlučivosti** — preuzimanje korak po korak prikazuje AV1, VP9 i H.264 jedan pokraj drugoga u svakoj razlučivosti pa možete odabrati onaj koji reproducira vaš televizor ili uređivač",
  feat_quality_6:
    "**Znajte što tok zapravo jest** — veličine koje je YouTube povećao pomoću AI-ja, jezici zvuka sinkronizirani AI-jem, tokovi s poboljšanom brzinom prijenosa, videozapisi od 360° te oštećene kopije i kopije s vodenim žigom su označeni. Profili preskaču tokove povećane pomoću AI-ja osim ako ih dopustite",
  feat_privacy_h3: "Privatnost i kontrola",
  feat_privacy_1:
    "100 % lokalna obrada — preuzimanja idu izravno s YouTubea na vaš disk",
  feat_privacy_2: "**Otvoreni kod** — svaki redak može se provjeriti, licencija GPLv3",
  feat_privacy_3: "Datoteke se spremaju izravno u mapu koju odaberete",
  feat_workflow_h3: "Tijek rada",
  feat_workflow_12:
    "**Globalni prečac za preuzimanje** — kopirajte poveznicu u bilo kojoj aplikaciji i pritisnite `Ctrl+Shift+D` (`Cmd+Shift+D` na macOS-u); Arroxy je stavlja u red s vašim aktivnim profilom bez otvaranja prozora, a obavijest to potvrđuje. Uključeno prema zadanim postavkama, prečac se može promijeniti",
  feat_workflow_1:
    "**Fleksibilni načini početka** — odaberite vođeno pojedinačno preuzimanje, birač popisa za reprodukciju/kanala, lijepljenje više URL-ova, brzo preuzimanje sa spremljenim zadanim postavkama ili pregledavanje i preuzimanje iz Istraži",
  feat_workflow_2:
    "**Središnji red za preuzimanje** — svaki pojedinačni, popis, skupni ili brzi zadatak završava na jednom mjestu radi praćenja napretka te upravljanja pauzom, nastavkom, otkazivanjem, ponovnim pokušajem i prioritetom",
  feat_workflow_3:
    "**Praćenje međuspremnika** — kopirajte poveznicu na videozapis i ona popunjava polje URL-a kad se vratite u Arroxy, uz **Poništi** ako to niste željeli. Dok je Arroxy zauzet, poveznica čeka dok se ne vratite na karticu URL-a (isključite u postavkama)",
  feat_workflow_4:
    "**Automatsko čišćenje URL-ova** — uklanja parametre praćenja (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) i otkriva poveznice `youtube.com/redirect`",
  feat_workflow_5:
    "**Način rada u traci sustava** — zatvaranje prozora ostavlja preuzimanja pokrenutima u pozadini",
  feat_workflow_6:
    "**{{LANG_COUNT}} jezika** — automatski prepoznaje jezik sustava, može se promijeniti u bilo kojem trenutku",
  feat_workflow_7:
    "**Sinkronizacija popisa za reprodukciju** — ponovno skenirajte popis za reprodukciju u odnosu na lokalnu mapu da preskočite već preuzete videozapise; generira `.m3u` datoteku popisa koja se ažurira kako se svaki videozapis preuzima",
  feat_workflow_8:
    "**Kontrole brzine i tempa** — ograničite propusnost preuzimanja, postavite koliko se dijelova videozapisa preuzima odjednom i dodajte odgode zahtjeva s predlošcima (*Isključeno · Uravnoteženo · Oprezno · Prilagođeno*)",
  feat_workflow_9:
    "**Predlošci naziva datoteka** — imenujte preuzimanja po svome pomoću `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` i `{playlist_index}`, globalno ili po profilu preuzimanja",
  feat_workflow_10:
    "**Istodobna preuzimanja i automatski ponovni pokušaj** — odaberite koliko preuzimanja iz reda radi istodobno i pustite da Arroxy ponovno pokuša preuzimanje koje je naišlo na mrežni ili poslužiteljski problem, čekajući dulje prije svakog pokušaja",
  feat_workflow_11:
    "**Profili po stavkama popisa za reprodukciju** — svakom videozapisu na popisu za reprodukciju dodijelite vlastiti profil preuzimanja umjesto jedne postavke za cijeli popis, pa jednim prolazom neke možete arhivirati u punoj kvaliteti, a ostale spremiti samo kao zvuk",
  feat_workflow_13:
    "**Brzo preuzimanje radi u pozadini** — poveznica se odmah pojavljuje u Preuzimanjima i tamo se priprema, bilješka s gumbom **Prikaži** to potvrđuje, a polje URL-a se prazni za sljedeću poveznicu. Pokrenite koliko god želite dok se prethodne pripremaju",
  feat_workflow_14:
    "**Preuzimanja vam kažu što treba vašu pažnju** — ako Arroxy ne može pročitati poveznicu, njezin redak kaže zašto i nudi rješenje: Pokušaj ponovo, uključivanje kolačića ili prijava u Istraži. Kad su kolačići isključeni, **Prijavi se u Istraži** ponovno pokušava umjesto vas čim se prijavite. Popis za reprodukciju dulji od vašeg ograničenja učitavanja čeka u svom retku da odaberete cijeli popis, prvih nekoliko ili pregled. Kartica Preuzimanja broji retke koji čekaju vas",
  feat_workflow_15:
    "**Preuzmite samo dio videozapisa** — na zaslonu Format odaberite početak i kraj ili poglavlje i Arroxy sprema samo taj raspon, imenovan rasponom iza ID-a videozapisa. Rezovi padaju na najbliži ključni kadar; uključite točan rez da se umjesto toga ponovno kodira",
  feat_workflow_16:
    "**Uklonite završena preuzimanja** — neobavezno: završeno preuzimanje napušta popis 5 sekundi poslije. Njegove datoteke ostaju na disku, a neuspjela preuzimanja ostaju na popisu",
  feat_workflow_17:
    "**Veličina i Nedostaje u Preuzimanjima** — stupac **Veličina** koji se može sortirati pokazuje koliko prostora svako preuzimanje zauzima, a **Nedostaje** označava datoteke premještene ili izbrisane izvan Arroxyja",
  feat_workflow_18:
    "**Aurora ili Minimal, tamno ili svijetlo** — staklene ploče nad pokretnim nebom ili mirne čvrste površine; prebacujte u podnožju. Računala bez grafičkog ubrzanja automatski dobivaju Minimal",
  feat_workflow_19:
    "**Traka izbornika na Macu** — na macOS-u otvorite postavke (`Cmd+,`), postavite ograničenje brzine preuzimanja, promijenite stil i temu te otvorite zapisnike ili spremite datoteku s dijagnostikom iz trake izbornika",
  feat_workflow_20:
    "**Promijenite profil iz bilo kojeg preuzimanja** — prilagodite preuzimanje, zatim ažurirajte profil od kojeg je krenulo (uz pregled što se mijenja) ili spremite postavke kao novi profil. Promjena profila pita želite li zadržati svoje izmjene",
  feat_post_h3: "Titlovi i naknadna obrada",
  feat_post_1:
    "**Titlovi** u SRT, VTT ili ASS formatu — ručni ili automatski generirani, na bilo kojem dostupnom jeziku",
  feat_post_2:
    "Spremite pokraj videozapisa, ugradite u `.mkv` ili organizirajte u podmapu `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — preskočite ili označite poglavljima sponzore, uvode, završetke, samopromocije",
  feat_post_4:
    "**Ugrađeni metapodaci** — naslov, datum otpremanja, kanal, opis, sličica i oznake poglavlja upisani u datoteku",
  feat_post_5:
    "**Skupovi samo s titlovima** — zalijepite popis URL-ova ili otvorite popis za reprodukciju, odaberite Titlovi i dobit ćete samo datoteke s titlovima za svaki videozapis",
  feat_sites_h3: "YouTube + 2000 web-mjesta",
  feat_sites_1:
    "**YouTube u cijelosti** — videozapisi, Shorts, kanali, popisi za reprodukciju, YouTube Music i podcasti obrađuju se kao prvorazredni izvori",
  feat_sites_2:
    "**Više od 2000 drugih web-mjesta** putem yt-dlp-a — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable i mnoga druga",
  feat_sites_3:
    "**Samo audio i titlovi** rade na svakom podržanom web-mjestu, ne samo na YouTubeu",
  feat_sites_4:
    "Ako se web-mjesto promijeni, yt-dlp tjedno objavljuje ispravke, a Arroxy pri pokretanju automatski ažurira program",
  shot1_cap:
    "<b>Početni zaslon brzog preuzimanja</b><br/>Zalijepite URL i odmah ga preuzmite s aktivnim profilom",
  shot2_cap:
    "<b>Višekratni profili preuzimanja</b><br/>Spremite predloške formata, kvalitete i izlaza — upotrijebite ih po preuzimanju",
  shot3_cap:
    "<b>Audiozapisi na više jezika</b><br/>Odaberite točan jezik zvuka koji videozapis nudi",
  shot4_cap:
    "<b>Surround / Dolby zvuk</b><br/>Zapisi 5.1 i Dolby prepoznaju se i čuvaju",
  shot5_cap:
    "<b>Način rada s više URL-ova</b><br/>Zalijepite popis, automatski uklonite duplikate i sve stavite u red odjednom",
  shot6_cap:
    "<b>Paralelni red za preuzimanje</b><br/>Više preuzimanja odjednom uz napredak uživo",
  hotkey_fig_alt:
    "Arroxyjev globalni prečac za preuzimanje — Ctrl+Shift+D u sustavima Windows i Linux, Cmd+Shift+D na macOS-u, šalje kopiranu poveznicu izravno u red za preuzimanje",
  hotkey_fig_cap:
    "<b>Globalni prečac za preuzimanje</b><br/>Kopirajte poveznicu bilo gdje, pritisnite jednom — završit će u redu i počet će se preuzimati",
  shot7_cap: "<b>Profili po stavkama popisa za reprodukciju</b><br/>Dajte svakom videozapisu vlastiti profil — neke arhivirajte u 4K, a ostale spremite samo kao zvuk",
  shot8_cap:
    "<b>Istraži</b><br/>Pregledavajte YouTube ili bilo koje drugo web-mjesto unutar Arroxyja i preuzmite stranicu na kojoj se nalazite s aktivnim profilom",
  shot9_cap:
    "<b>Prvi zaslon Istraži</b><br/>Kratki pogled na Istraži i zašto je sporedni račun sigurnija prijava",
  shot10_cap:
    "<b>Preuzimanja vam kažu što treba vašu pažnju</b><br/>Poveznice se pripremaju u pozadini; neuspjela nudi svoje rješenje, dugačak popis za reprodukciju čeka vaš odabir",
  shot11_cap:
    "<b>Preuzmite samo dio videozapisa</b><br/>Odaberite početak i kraj ili poglavlje — Arroxy sprema samo taj raspon",
  shot12_cap:
    "<b>Uređivač profila</b><br/>Podesite profil: vrstu datoteke, razlučivost, titlove, odredište, predložak naziva datoteke i više",
  shot13_cap:
    "<b>Tamno ili svijetlo, staklo ili čvrsto</b><br/>Četiri izgleda za izbor: staklene ploče nad pokretnim nebom ili mirne čvrste površine, svaka u tamnoj i svijetloj verziji",
  shot14_cap:
    "<b>8K HDR pri 60 sličica u sekundi</b><br/>Svaka razlučivost, kodek i HDR tok koje videozapis nudi, jedan pokraj drugoga",
  dl_platform_col: "Platforma",
  dl_format_col: "Izravno preuzimanje",
  dl_oneline_note:
    "Izdanja su samo za x86_64. Nemate `curl`? Zamijenite `curl -fsSL` s `wget -qO-`.",
  dl_win_scoop:
    "Više volite Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Instalacijski program (NSIS) ili prijenosni `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ili `.flatpak` (u izoliranom okruženju)",
  dl_grab: "Sve datoteke izdanja →",
  dl_pkg_h3: "Instalacija putem upravitelja paketa",
  dl_channel_col: "Kanal",
  dl_command_col: "Naredba",
  dl_win_h3: "Windows: instalacijski program ili prijenosna verzija",
  dl_win_col_installer: "NSIS instalacijski program",
  dl_win_col_portable: "Prijenosni `.exe`",
  dl_win_r1: "Potrebna instalacija",
  dl_win_r1_installer: "Da",
  dl_win_r1_portable: "Ne — pokrenite s bilo kojeg mjesta",
  dl_win_r2: "Automatska ažuriranja",
  dl_win_r2_installer: "✅ unutar aplikacije",
  dl_win_r2_portable: "❌ ručno preuzimanje",
  dl_win_r3: "Brzina pokretanja",
  dl_win_r3_installer: "✅ brže",
  dl_win_r3_portable: "⚠️ sporije hladno pokretanje",
  dl_win_r4: "Dodaje se u izbornik Start",
  dl_win_r5: "Jednostavna deinstalacija",
  dl_win_r5_portable: "❌ izbrišite datoteku",
  dl_win_rec:
    "**Preporuka:** upotrijebite NSIS instalacijski program za automatska ažuriranja i brže pokretanje. Upotrijebite prijenosni `.exe` ako želite opciju bez instalacije i bez zapisa u registru.",
  dl_win_smartscreen_h4: "Upozorenje Windows SmartScreena",
  dl_win_smartscreen_intro:
    'Pri prvom pokretanju možda ćete vidjeti **„Windows je zaštitio vaše računalo”** ili **„Nepoznati izdavač”.** To vrijedi i za `Arroxy-win-x64-Setup.exe` i za `Arroxy-win-x64-Portable.exe`. Arroxy je besplatan i otvorenog koda, a Windows izdanja nisu potpisana plaćenim certifikatom, zbog čega ih SmartScreen označava. To **ne** znači automatski da Arroxy nije siguran. Za nastavak:',
  dl_win_smartscreen_step1: "Kliknite **Više informacija**.",
  dl_win_smartscreen_step2: "Kliknite **Svejedno pokreni**.",
  dl_win_smartscreen_official:
    "Arroxy preuzimajte samo sa službene stranice GitHub Releases. Ako ste datoteku dobili s drugog web-mjesta ili vam ju je netko poslao, izbrišite je i preuzmite novu kopiju iz službenog izvora. Izvorni kod je javan pa ga možete pregledati ili sami izgraditi Arroxy ako to više volite.",
  dl_macos_h3: "Prvo pokretanje na macOS-u",
  dl_macos_warning:
    "Arroxy još nije potpisan kodom pa macOS Gatekeeper pri prvom pokretanju može prikazati upozorenje o oštećenoj aplikaciji. To je očekivano — nije znak stvarnog oštećenja datoteke.",
  dl_macos_m1_h4: "Metoda putem Terminala:",
  dl_macos_step1: "Povucite `Arroxy.app` iz montiranog DMG-a u `/Applications`.",
  dl_macos_step2:
    "Otvorite Terminal i pokrenite `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Pokrenite `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Ako je putanja aplikacije drukčija, zamijenite `/Applications/Arroxy.app` putanjom na koju ste je instalirali.",
  dl_macos_step5:
    "Unesite lozinku za Mac ako je `sudo` zatraži.",
  dl_macos_after:
    "Nakon uklanjanja karantene Arroxy se otvara normalno.",
  dl_macos_m2_h4: "Metoda putem Terminala:",
  dl_macos_note:
    "macOS izdanja izrađuju se putem CI-ja na Apple Silicon i Intel runnerima. Ako naiđete na probleme, [otvorite prijavu](../../issues) — povratne informacije korisnika macOS-a aktivno oblikuju ciklus testiranja za macOS.",
  dl_linux_h3: "Prvo pokretanje na Linuxu",
  dl_linux_intro:
    "AppImage datoteke pokreću se izravno — bez instalacije. Samo datoteku morate označiti kao izvršnu.",
  dl_linux_m1_text:
    "**Upravitelj datoteka:** desnom tipkom miša kliknite `.AppImage` datoteku → **Svojstva** → **Dopuštenja** → uključite **Dopusti izvršavanje datoteke kao programa**, zatim dvaput kliknite.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Ako pokretanje i dalje ne uspijeva, pokrenite je bez montiranja — paket FUSE nije potreban:",
  dl_linux_targz_h4: "Običan tarball (bez FUSE-a, bez instalacije):",
  dl_linux_targz_text: "Izdanje `.tar.gz` je ista aplikacija bez AppImage omota — raspakirajte je bilo gdje i pokrenite. Nisu potrebni ni instalacijski program ni paket FUSE.",
  dl_linux_arch_note: "**Linux preuzimanja na stranici izdanja samo su za x86_64.** Na ARM64 računalima (Raspberry Pi, Asahi Linux) Flatpak se i dalje instalira, ali pri pokretanju propada s `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Zašto možete vidjeti upozorenje",
  dl_warning_p1:
    "Arroxy je otvorenog koda s licencijom GPLv3. Izdanja za Windows i macOS **nisu potpisana kodom** — certifikati Apple Developer ID i Windows EV za potpisivanje koda koštaju stotine dolara godišnje, što nezavisni projekt plaća iz vlastitog džepa. Bez tih potpisa Windows SmartScreen i macOS Gatekeeper upozorit će vas pri prvom pokretanju. Upozorenja znače da *vaš OS ne prepoznaje izdavača* — ne znače da je Arroxy zlonamjerni softver.",
  dl_warning_p2:
    "Tri načina da sami provjerite Arroxy, po rastućoj strogosti:\n\n- **Pročitajte izvorni kod.** Svaki je redak na [GitHubu](https://github.com/antonio-orionus/Arroxy) i možete ga [izgraditi iz izvornog koda](#tech).\n- **Provjerite SHA256.** Usporedite svoju datoteku s objavljenim [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — pogledajte [Provjera preuzete datoteke](#verify) u nastavku.\n- **Pokrenite skeniranje treće strane.** Otpremite datoteku na [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Prvo pokretanje u sustavu Windows",
  shot_smartscreen_more_alt:
    'Dijaloški okvir SmartScreena „Windows je zaštitio vaše računalo” s istaknutom poveznicom „Više informacija”',
  shot_smartscreen_run_alt:
    'Dijaloški okvir SmartScreena nakon proširivanja opcije Više informacija, s prikazanim gumbom „Svejedno pokreni”',
  dl_win_defender_h4: "Ako Windows Defender označi ili ukloni datoteku",
  dl_win_defender_p:
    "Heuristika programa Defender ponekad označava nepotpisane NSIS instalacijske programe i Electron prijenosne verzije kao sumnjive. Ako Defender stavi `Arroxy-win-x64-Setup.exe` ili `Arroxy-win-x64-Portable.exe` u karantenu, vratite ga iz **Sigurnost sustava Windows → Zaštita od virusa i prijetnji → Povijest zaštite**, a zatim dodajte izvršnu datoteku Arroxyja kao dopuštenu stavku pod **Upravljanje postavkama → Dodavanje ili uklanjanje izuzimanja**. Kao i kod SmartScreena, okidač je nedostajući potpis izdavača, a ne otkriveni zlonamjerni softver.",

  dl_macos_first_h3: "Prvo pokretanje na macOS-u",
  dl_macos_intro:
    "Arroxyjeva macOS izdanja potpisana su ad-hoc, ali ih Apple nije ovjerio (notarizirao), pa Gatekeeper blokira prvo pokretanje porukom *„Arroxy.app” nije otvoren — Apple ne može provjeriti da „Arroxy.app” ne sadrži zlonamjerni softver*. To znači da macOS ne može provjeriti aplikaciju kod Applea, a ne da je nešto u redu s datotekama. Instalacija putem Homebrewa u potpunosti izbjegava ovaj dijalog. Ako ste koristili DMG, jedna naredba u Terminalu to rješava:",
  dl_macos_sequoia_h4: "Rješenje putem Terminala za aktualni macOS",
  dl_macos_sequoia_intro:
    "Upotrijebite Terminal nakon kopiranja Arroxyja u mapu Applications:",
  dl_macos_sequoia_step1:
    "Povucite `Arroxy.app` iz montiranog DMG-a u `/Applications`.",
  dl_macos_sequoia_step2:
    "Otvorite Terminal i pokrenite ove dvije naredbe:",
  dl_macos_sequoia_step3:
    "Pokrenite `open /Applications/Arroxy.app` da biste pokrenuli Arroxy.",
  dl_macos_sequoia_step4:
    "Ako je putanja aplikacije drukčija, zamijenite `/Applications/Arroxy.app` putanjom na koju ste je instalirali.",
  dl_macos_sonoma_h4: "Rješenje putem Terminala za stariji macOS",
  dl_macos_sonoma_step1:
    "Povucite `Arroxy.app` iz montiranog DMG-a u `/Applications`.",
  dl_macos_sonoma_step2:
    "Otvorite Terminal i uklonite karantenu s `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Nakon uklanjanja karantene pokrenite Arroxy iz Terminala ili Findera.",
  dl_macos_damaged_h4:
    "Uklanjanje Gatekeeperove karantene",
  dl_macos_damaged_p:
    "Prva naredba uklanja atribut karantene koji je macOS dodao pri preuzimanju datoteke; druga pokreće aplikaciju. `sudo` obično nije potreban jer kopija u `/Applications` pripada vama — dodajte ga samo ako dobijete pogrešku o dopuštenjima.",
  dl_macos_arch_note:
    "**Apple Silicon ili Intel:** na Macu s M-serijom (M1 / M2 / M3 / M4) preuzmite `arm64` DMG. Na Intel Macovima preuzmite `x64` DMG. Pogrešno izdanje i dalje radi putem Rosette, ali je primjetno sporije.",

  dl_linux_first_h3: "Prvo pokretanje na Linuxu",
  dl_linux_appimagelauncher:
    "**Neobavezna integracija s radnom površinom:** jednom instalirajte [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) i svaka AppImage datoteka na koju dvaput kliknete automatski se registrira u izborniku pokretača — nije potrebna ručna `.desktop` datoteka.",

  dl_verify_h3: "Provjera preuzete datoteke (SHA256)",
  dl_verify_intro:
    "Svako izdanje uz binarne datoteke objavljuje i datoteku `SHA256SUMS`. Da biste provjerili da vaša preuzeta datoteka nije oštećena ili izmijenjena tijekom prijenosa, izračunajte hash svoje datoteke lokalno i usporedite ga s retkom u `SHA256SUMS`. Otvorite stranicu najnovijeg izdanja → **Assets** → preuzmite `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell ili naredbeni redak):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Želite skeniranje zlonamjernog softvera treće strane? Otpremite datoteku na [VirusTotal](https://www.virustotal.com). Nekoliko oznaka opće heuristike manjih mehanizama normalno je za nepotpisane Electron aplikacije; raširena otkrivanja velikih mehanizama bila bi stvarni razlog za zabrinutost.",

  dl_pm_intro:
    "Više volite drugi kanal? I ovi rade, a prate svako izdanje.",

  privacy_p1:
    "Preuzimanja se dohvaćaju izravno putem [yt-dlp-a](https://github.com/yt-dlp/yt-dlp) s YouTubea u mapu koju odaberete — ništa ne prolazi kroz poslužitelj treće strane. Povijest gledanja, povijest preuzimanja, URL-ovi i sadržaj datoteka ostaju na vašem uređaju.",
  privacy_reports:
    "Bez praćenja — jedan anonimni signal aktivnosti dnevno (verzija aplikacije, OS, jezik, kanal instalacije, država i otprilike koliko je prošlo od instalacije Arroxyja) kako bismo mogli brojati aktivne i nove korisnike te, kad Arroxy preuzima ili ažurira yt-dlp i FFmpeg, anonimna bilješka o tome je li uspjelo i otprilike koliko je trajalo. Bez ID-ova, URL-ova, naslova videozapisa, putanja datoteka ili podataka o računu. Oboje možete isključiti u postavkama.",
  privacy_p3:
    "Istraži čuva vlastite prijave, odvojeno od vašeg preglednika, a Arroxy nikad ne čita niti ispunjava obrazac za prijavu — upisujete izravno na stranici web-mjesta. Preuzimanja se izvode odjavljena; tek kad jedno propadne na način koji račun može popraviti, Arroxy iznova pročita prijavu, zadrži je u privremenoj datoteci za to preuzimanje i nakon toga izbriše datoteku. Odjava iz Istraži u postavkama zaboravlja ih.",
  faq_q1: "Je li stvarno besplatno?",
  faq_a1: "Da — licencija GPLv3, bez plaćene razine, bez zaključavanja značajki.",
  faq_q11: "Po čemu se Arroxy razlikuje od drugih yt-dlp sučelja?",
  faq_a11:
    "Većina besplatnih yt-dlp sučelja samo su omotači koji primaju poveznicu. Arroxy dodaje **Istraži**, preglednik ugrađen u aplikaciju koji otvara YouTube ili bilo koje drugo web-mjesto: pregledavate i preuzimate bez kopiranja poveznica, a tamo se jednom prijavite da biste preuzimali videozapise koje može gledati vaš račun, poput privatnih videozapisa te svojih popisa Za kasnije i Označeno sa sviđa mi se, bez izvoza kolačića. Pogledajte [Zašto Arroxy](#why).",
  faq_q2: "Koje kvalitete videozapisa mogu preuzeti?",
  faq_a2:
    "Sve što YouTube poslužuje: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p te samo audio. Tokovi od 60 sličica u sekundi i HDR zadržavaju se nepromijenjeni, a preuzimanje korak po korak omogućuje odabir AV1, VP9 ili H.264 u svakoj razlučivosti.",
  faq_q3: "Mogu li izdvojiti samo zvuk kao MP3?",
  faq_a3:
    "Da. U izborniku formata odaberite *samo audio* i izaberite MP3, M4A/AAC, Opus ili WAV.",
  faq_q4: "Kako preuzeti videozapise koji zahtijevaju YouTube račun?",
  faq_a4:
    "Jednom se prijavite na kartici Istraži. Arroxy tada može preuzimati videozapise koje vaš račun može gledati: vaše privatne videozapise, videozapise s dobnim ograničenjem ako je dob računa potvrđena te vaše popise Za kasnije i Označeno sa sviđa mi se. Prijavu koristi samo kad preuzimanje propadne na način koji račun može popraviti; sve ostalo preuzima se kao i prije. To je izbor **Prijava u Istraži**, naveden prvi i označen kao Preporučeno u postavkama kolačića, a Arroxy ga bira umjesto vas kad prvi put otvorite Istraži. Wiki yt-dlp-a navodi da [automatizacija s prijavom može označiti Google račun](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), pa je sporedni račun sigurniji izbor.",
  faq_q5: "Hoće li nastaviti raditi kad YouTube nešto promijeni?",
  faq_a5:
    "yt-dlp se pri pokretanju automatski ažurira, a Arroxy brzo objavljuje ispravke kad YouTube nešto promijeni. Kad preuzimanje zahtijeva prijavu, Arroxy koristi vašu prijavu u Istraži ako ste se tamo prijavili, a u postavkama kolačića dostupni su i kolačići iz datoteke ili vašeg preglednika.",
  faq_q6: "Na kojim je jezicima Arroxy dostupan?",
  faq_a6:
    "{{LANG_COUNT}} jezika, odmah po instalaciji: {{LANG_NAME_LIST}}. Arroxy pri prvom pokretanju automatski prepoznaje jezik vašeg operacijskog sustava, a možete ga promijeniti u bilo kojem trenutku u biraču jezika na alatnoj traci. JSON datoteke jezika za izvođenje nalaze se u src/shared/i18n/locales/, a PO katalozi za prevoditelje u i18n/locales/ — otvorite PR na GitHubu da pridonesete.",
  faq_q7: "Moram li instalirati još nešto?",
  faq_a7:
    "Ne. yt-dlp, ffmpeg i ffprobe automatski se preuzimaju pri prvom pokretanju i spremaju na vaše računalo. Nakon toga nije potrebno nikakvo dodatno postavljanje.",
  faq_q8: "Mogu li preuzeti popise za reprodukciju ili cijele kanale?",
  faq_a8:
    "Da — i jedno i drugo. Zalijepite URL popisa za reprodukciju ili kanala (npr. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); odaberite koliko unosa treba pregledati, zatim stavite u red cijeli popis ili odaberite određene videozapise. Filtri po rasponu datuma stižu uskoro.",
  faq_q9: 'macOS kaže „aplikacija je oštećena” — što da radim?',
  faq_a9:
    'To macOS Gatekeeper blokira nepotpisanu aplikaciju, a ne stvarno oštećenje. Pogledajte [Prvo pokretanje na macOS-u](#macos-first-launch) za naredbe u Terminalu koje uklanjaju karantenu i pokreću Arroxy.',
  faq_q10: "Je li preuzimanje YouTube videozapisa legalno?",
  faq_a10:
    "Ovisi o vašoj državi i o tome što preuzimate. Preuzimajte samo sadržaj koji posjedujete, sadržaj čije je preuzimanje licencirano ili sadržaj koji zakon u vašoj državi dopušta kopirati. Odgovorni ste za pridržavanje YouTubeovih [Uvjeta pružanja usluge](https://www.youtube.com/t/terms) i lokalnih zakona o autorskim pravima. Pogledajte [Uvjete korištenja](#terms).",
  plan_intro: "Još je u planu — otprilike prema prioritetu:",
  plan_col1: "Značajka",
  plan_col2: "Opis",
  plan_r1_name: "**Filtri za popise za reprodukciju i kanale**",
  plan_r1_desc: "Filtri po rasponu datuma pri nabrajanju popisa za reprodukciju ili kanala",
  plan_r2_name: "**Postavke YouTubeovih audiozapisa**",
  plan_r2_desc:
    "Postavite aplikacijsku postavku audiozapisa na govornom jeziku, uz zamjene po profilu kad YouTube nudi više audiozapisa",
  plan_r3_name: "**Snažniji oporavak pri ponovnom pokušaju**",
  plan_r3_desc:
    "Novi put ponovnog pokušaja za preuzimanja prekinuta nepouzdanim ili problematičnim internetskim vezama",
  plan_r4_name: "**Potpuna ladica upravitelja preuzimanja**",
  plan_r4_desc:
    "Pretvorite ladicu reda u potpuniji upravitelj, uključujući promjenu odredišnih mapa za stavke u redu",
  plan_r5_name: "**Zakazana preuzimanja**",
  plan_r5_desc: "Pokrenite red u zadano vrijeme (noćna izvođenja)",
  plan_r9_name: "**AUR paket**",
  plan_r9_desc: "Instalirajte na Arch Linux i Omarchy pomoću `yay -S arroxy-bin`",
  plan_cta:
    "Imate ideju za značajku? [Otvorite zahtjev](../../issues) — doprinos zajednice oblikuje prioritete.",
  tech_content: TECH_CONTENT,
  support_h2: "Podržite Arroxy",
  support_line: "Arroxy je besplatan i pod licencijom GPLv3 — bez oglasa, bez praćenja, bez plaćene razine. Ako vam štedi vrijeme, razvoj možete podržati Bitcoinom, Tronom ili Ethereumom: adrese su u [DONATE.md](DONATE.md), što je jedini službeni izvor za njih. Arroxy vam nikad neće poslati adresu e-poštom ni izravnom porukom. Označavanje repozitorija zvjezdicom, prijava grešaka i poboljšanje prijevoda pomažu jednako toliko.",
  tos_h2: "Uvjeti korištenja",
  tos_note:
    "Arroxy je alat samo za osobnu, privatnu upotrebu. Isključivo ste odgovorni za osiguravanje da su vaša preuzimanja u skladu s YouTubeovim [Uvjetima pružanja usluge](https://www.youtube.com/t/terms) i zakonima o autorskim pravima vaše jurisdikcije. Ne koristite Arroxy za preuzimanje, reproduciranje ili distribuciju sadržaja koji nemate pravo koristiti. Razvojni programeri nisu odgovorni za bilo kakvu zlouporabu.",
  footer_credit:
    'GPLv3 · Izradio s pažnjom <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
