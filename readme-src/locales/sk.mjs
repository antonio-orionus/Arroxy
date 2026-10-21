const TECH_CONTENT = `<details>
<summary><strong>Technologický stack</strong></summary>

- **Electron** — multiplatformový desktopový obal
- **React 19** + **TypeScript** — používateľské rozhranie
- **Tailwind CSS v4** — štýlovanie
- **Zustand** — správa stavu
- **yt-dlp** + **ffmpeg** — nástroj na sťahovanie a multiplexovanie (oba sa preberajú za behu: yt-dlp sa udržiava aktuálny, ffmpeg/ffprobe sa nainštalujú raz a zostávajú aj po aktualizáciách)
- **Vite** + **electron-vite** — nástroje na zostavenie
- **Vitest** + **Playwright** — jednotkové a end-to-end testy

</details>

<details>
<summary><strong>Zostavenie zo zdrojového kódu</strong></summary>

### Požiadavky — všetky platformy

| Nástroj | Verzia  | Inštalácia |
| ------- | ------- | ------- |
| Git     | ľubovoľná | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` alebo \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` alebo \`package.json\` \`packageManager\` |

Odporúčané: nainštalujte \`mise\` a v klonovanom repozitári spustite \`mise install\`. Bez nástroja mise ručne aktivujte Node.js z \`.node-version\` a Bun z \`package.json\` pred spustením \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Pre natívne prebudovanie môžu byť potrebné Visual Studio Build Tools a Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Po klonovaní spustite v repozitári \`mise trust && mise install\`. Ak váš shell už používa \`fnm\`, \`nvm\` alebo Bun z Homebrew, aktivujte mise v \`~/.zshrc\`, aby Arroxy dostal Node.js 24.21.0 a Bun 1.4.2:

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

### Klonovanie a spustenie

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Zostavenie distribučného balíka

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` nainštaluje závislosti, prebuduje závislosti aplikácie Electron, overí Electron, pripraví vstavané ffmpeg/ffprobe na vývoj a nainštaluje Playwright Chromium. Vydané zostavy spravujú yt-dlp, ffmpeg a ffprobe za behu vo vašom priečinku s údajmi aplikácie; žiadny z nich nie je súčasťou inštalátora.

</details>`;

export const sk = {
  icon_alt: "Maskot Arroxy",
  title:
    "Arroxy – bezplatný nástroj na sťahovanie z YouTube (+ 2000 webov) s otvoreným zdrojovým kódom a vstavaným prehliadačom, pre Windows, macOS a Linux",
  read_in_label: "Čítajte v jazyku:",
  badge_release_alt: "Vydanie",
  badge_build_alt: "Zostava",
  badge_license_alt: "Licencia",
  badge_platforms_alt: "Platformy",
  badge_i18n_alt: "Jazyky",
  badge_website_alt: "Webová stránka",
  discord_badge_text: "Pripojte sa ku komunite na Discorde",
  discord_badge_encoded: "Pripojte%20sa%20ku%20komunite%20na%20Discorde",
  hero_desc:
    "Sťahujte videá, Shorts, hudbu, kanály, podcasty alebo zvukové stopy z **YouTube a viac ako 2000 podporovaných webov** — až do 8K HDR pri 60 fps, ako MP3 / AAC / Opus, alebo iba tú časť, ktorú potrebujete. **Prehliadajte YouTube alebo akýkoľvek iný web priamo v aplikácii Arroxy** na karte Preskúmať a stiahnite video, zoznam skladieb alebo kanál, na ktorom práve ste; prihláste sa tam a stiahnete súkromné videá, videá iba pre členov a videá s vekovým obmedzením, ktoré váš účet dokáže prehrať. Beží lokálne vo Windows, macOS a Linuxe. **Bez reklám, bez zbytočností, bez nátlaku na platenie.**",
  cta_latest: "↓ Nainštalovať najnovšie vydanie",
  cta_website: "Webová stránka",
  website_url: "https://arroxy.com/",
  star_cta: "Ak vám Arroxy ušetrí čas, ⭐ pomôže ostatným, aby ho našli.",
  ai_notice: "> 🌐 Tento preklad vznikol s podporou AI. [Anglické README](README.md) je nadradeným zdrojom. Našli ste chybu? [Otvorte PR](../../pulls).",
  intro_what_is:
    "**Čo je Arroxy?** Arroxy je bezplatné desktopové grafické rozhranie s otvoreným zdrojovým kódom, ktoré sťahuje videá, zvuk, zoznamy skladieb a titulky z YouTube a viac ako 2000 ďalších webov podporovaných nástrojom [yt-dlp](https://github.com/yt-dlp/yt-dlp). Beží na Windows 10/11, macOS 13+ (Intel + Apple Silicon) a Linuxe (AppImage, Flatpak, tar.gz). Licencia GPLv3. Bez reklám, bez limitov používania. Distribuuje sa cez [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage a priame stiahnutie.",
  intro_key_difference:
    "**Kľúčový rozdiel: vstavaný prehliadač.** Väčšina bezplatných nástrojov na sťahovanie z YouTube sú tenké obaly nad yt-dlp: pole na adresu URL a ponuka formátov, bez vlastného prehliadača. Arroxy ho má, je to **karta Preskúmať**. YouTube alebo akýkoľvek iný web prehliadate priamo v aplikácii a stiahnete video, zoznam skladieb alebo kanál, na ktorom sa nachádzate, alebo kliknete pravým tlačidlom na ľubovoľný odkaz. V Preskúmať sa prihlásite raz a Arroxy stiahne súkromné videá, videá iba pre členov a videá s vekovým obmedzením, ktoré váš účet dokáže prehrať, plus vaše zoznamy Pozrieť neskôr a Páči sa mi, bez exportu súborov cookie. Prihlásiť sa tam môžete aj na iných weboch a ich sťahovania použijú toto prihlásenie, keď ho potrebujú. Keď vás YouTube požiada o potvrdenie, že nie ste robot, skúsi to znova s týmto prihlásením. Jeho vstavaný prehliadač získa aj token, ktorý YouTube pred sťahovaním očakáva, takže YouTube sťahovanie neobmedzí na menej formátov. Obal s poľom na adresu URL naráža na všetky tieto limity. Podrobnosti: [Prečo Arroxy](#why-explore).",
  last_updated: "Posledná aktualizácia: {{LAST_UPDATED}}.",
  toc_heading: "Obsah",
  why_h2: "Prečo Arroxy",
  features_h2: "Funkcie",
  dl_h2: "Inštalácia a prvé spustenie",
  privacy_h2: "Súkromie",
  faq_h2: "Časté otázky",
  roadmap_h2: "Plán vývoja",
  tech_h2: "Vytvorené pomocou",
  why_intro: "Porovnanie s najbežnejšími alternatívami:",
  why_r1: "Zadarmo, bez platenej verzie",
  why_r2: "Otvorený zdrojový kód",
  why_r3: "Iba lokálne spracovanie",
  why_r5: "Bez limitov používania",
  why_r6: "Multiplatformová desktopová aplikácia",
  why_r7: "Titulky + SponsorBlock",
  why_r8: "Vstavaný prehliadač (prehliadanie, prihlásenie, sťahovanie)",
  why_r9: "Súkromné videá, videá iba pre členov a videá s vekovým obmedzením bez exportu súborov cookie",
  why_table_note:
    "⚠️ = čiastočne alebo iba v platenej verzii. Prihlásenie v aplikácii 4K Video Downloader kvôli súkromným videám je platená funkcia; väčšina bezplatných grafických rozhraní pre yt-dlp prijíma iba súbor cookie alebo číta súbory cookie vášho webového prehliadača.",
  why_summary:
    "Arroxy je vytvorený na jedno: čistý lokálny súbor, či už vložíte adresu URL, alebo nájdete video v Preskúmať. Bez nátlaku na platenie, bez zbierania údajov.",
  why_explore_h3: "Čo obyčajný obal yt-dlp nedokáže: karta Preskúmať",
  why_explore_intro:
    "Väčšina bezplatných nástrojov na sťahovanie z YouTube je len pole na adresu URL nad yt-dlp. Arroxy tiež používa yt-dlp, ale má aj **Preskúmať** — prehliadač zabudovaný v aplikácii, ktorý otvorí YouTube alebo akýkoľvek iný web. Preskúmať prekoná obmedzenia, na ktoré pole na adresu URL nestačí:",
  why_explore_1:
    "**Videá, ktoré vyžadujú účet, bez exportu súborov cookie** — súkromné videá, videá iba pre členov a videá s vekovým obmedzením (na účte s overeným vekom), ako aj vaše zoznamy Pozrieť neskôr a Páči sa mi, a videá za prihlásením na iných weboch. Obyčajný obal potrebuje export cookies.txt alebo musí čítať súbory cookie vášho webového prehliadača, čo Chrome vo Windows už blokuje. V Arroxy sa raz prihlásite v Preskúmať a zvyšok zariadi on",
  why_explore_2:
    "**„Prihláste sa, aby sme potvrdili, že nie ste robot“** — keď sa YouTube opýta, Arroxy skúsi sťahovanie znova s vaším prihlásením z Preskúmať namiesto zlyhania",
  why_explore_3:
    "**Token na sťahovanie z YouTube** — vstavaný prehliadač Arroxy získa token, ktorý YouTube pred sťahovaním očakáva. Bez neho môže YouTube poskytnúť menej formátov a nižšiu kvalitu, než ste požadovali",
  why_explore_4:
    "**Bez kopírovania odkazov** — nájdite video, zoznam skladieb alebo kanál v Preskúmať a stiahnite ho jedným kliknutím, alebo kliknite pravým tlačidlom na ľubovoľný odkaz na stránke",
  why_explore_5:
    "**Blokovač reklám, keď ho chcete** — jedno kliknutie na štít zablokuje reklamy a sledovače na stránkach v Preskúmať",
  feat_explore_h3: "Preskúmať: prehliadajte web priamo v Arroxy",
  feat_explore_1:
    "**Karta Preskúmať** — prehliadajte YouTube alebo akýkoľvek iný web priamo v Arroxy a stiahnite, čo nájdete, bez kopírovania odkazov. **Stiahnuť · *váš profil*** zaradí do radu video, zoznam skladieb alebo kanál, ktorý práve sledujete; šípka vedľa neho prepína profily a čarovná palička otvorí sťahovanie krok za krokom na výber formátov, titulkov a ďalšieho",
  feat_explore_6:
    "**Sťahovanie pravým kliknutím** — kliknite pravým tlačidlom na ľubovoľný odkaz na video, zoznam skladieb alebo kanál v Preskúmať a stiahnite ho so svojím profilom, vyberte iný profil v ponuke **Stiahnuť s profilom**, otvorte sťahovanie krok za krokom alebo odkaz skopírujte. Netreba najprv otvárať každé video",
  feat_explore_7:
    "**Kompaktné rozloženie** — jedno kliknutie na paneli nástrojov Preskúmať presunie karty Arroxy do neho a poskytne stránke viac miesta",
  feat_explore_2:
    "**Panel s adresou** — píšte a vyhľadávajte na YouTube, alebo zadajte ľubovoľnú webovú adresu a otvorte daný web",
  feat_explore_3:
    "**Sťahovania, ktoré vyžadujú účet** — raz sa prihláste v Preskúmať a Arroxy dokáže stiahnuť súkromné videá a videá iba pre členov, ktoré váš účet dokáže prehrať, videá s vekovým obmedzením, ak je vek účtu overený, a vaše zoznamy Pozrieť neskôr a Páči sa mi. Prihlásiť sa môžete aj na iných weboch a ich sťahovania použijú toto prihlásenie, keď ho potrebujú. Arroxy stále sťahuje najprv bez prihlásenia a prihlásenie z Preskúmať použije, iba keď sťahovanie zlyhá spôsobom, ktorý účet dokáže vyriešiť. Keď vás YouTube požiada o potvrdenie, že nie ste robot, Arroxy skúsi aj vaše prihlásenie z Preskúmať",
  feat_explore_4:
    "**Použite vedľajší účet** — prvá obrazovka Preskúmať vysvetľuje prečo: sťahovanie s účtom nesie určité riziko, že bude účet obmedzený. Z Preskúmať sa môžete kedykoľvek odhlásiť v Nastaveniach, aby sa vaše prihlásenia zabudli",
  feat_explore_5:
    "**Blokovač reklám** — predvolene vypnutý. Jedno kliknutie na štít na paneli nástrojov Preskúmať zablokuje reklamy a sledovače na jeho stránkach bez vplyvu na sťahovania. YouTube môže robiť problémy blokovačom reklám pri prihlásených účtoch",
  feat_quality_h3: "Kvalita a formáty",
  feat_quality_1: "Až **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Vysoká snímková frekvencia a HDR** zachované bez zmeny — 60 fps, HDR10",
  feat_quality_3:
    "**Zvuk** — exportujte iba zvuk ako MP3, M4A/AAC, Opus alebo WAV. Pri interaktívnom sťahovaní vyberte pôvodné stopy priestorového zvuku/Dolby (AC-3, E-AC-3, 5.1, DRC), ak sú dostupné, alebo nastavte globálnu predvoľbu **Uprednostniť priestorový zvuk / Dolby**",
  feat_quality_4:
    "**Profily s cieľom** — *Najlepší obraz* (AV1 · VP9) alebo *Smart TV* (MP4 · H.264), uložené ako Auto, MP4, MKV alebo WebM bez prekódovania. HDR je *Auto* (iba keď ho vaša obrazovka dokáže zobraziť), *SDR* alebo *HDR*",
  feat_quality_5:
    "**Každý kodek v každom rozlíšení** — sťahovanie krok za krokom uvádza AV1, VP9 a H.264 vedľa seba pri každom rozlíšení, takže si môžete vybrať ten, ktorý prehrá váš televízor alebo editor",
  feat_quality_6:
    "**Vedzte, čo stream skutočne je** — veľkosti zväčšené YouTube pomocou AI, jazyky zvuku nadabované pomocou AI, streamy so zvýšenou bitovou rýchlosťou, videá 360° a poškodené kópie či kópie s vodoznakom sú označené. Profily preskakujú streamy zväčšené pomocou AI, pokiaľ ich nepovolíte",
  feat_privacy_h3: "Súkromie a kontrola",
  feat_privacy_1:
    "100 % lokálne spracovanie — sťahovania idú priamo z YouTube na váš disk",
  feat_privacy_2: "**Otvorený zdrojový kód** — každý riadok sa dá preveriť, licencia GPLv3",
  feat_privacy_3: "Súbory sa ukladajú priamo do priečinka, ktorý si vyberiete",
  feat_workflow_h3: "Pracovný postup",
  feat_workflow_12:
    "**Globálna klávesová skratka na sťahovanie** — skopírujte odkaz v ľubovoľnej aplikácii a stlačte `Ctrl+Shift+D` (`Cmd+Shift+D` v macOS); Arroxy ho zaradí do radu s vaším aktívnym profilom bez otvorenia okna a oznámenie to potvrdí. Predvolene zapnutá, dá sa zmeniť",
  feat_workflow_1:
    "**Flexibilné režimy spustenia** — vyberte si sprevádzané jednotlivé sťahovanie, výber zo zoznamu skladieb/kanála, hromadné vloženie adries URL, Rýchle sťahovanie s uloženými predvoľbami, alebo prehliadajte a sťahujte z Preskúmať",
  feat_workflow_2:
    "**Centrálny rad sťahovania** — každá jednotlivá, hromadná alebo rýchla úloha, aj zo zoznamu skladieb, pristane na jednom mieste s priebehom, pozastavením, obnovením, zrušením, opakovaním a ovládaním priority",
  feat_workflow_3:
    "**Sledovanie schránky** — skopírujte odkaz na video a po návrate do Arroxy sa vyplní pole adresy URL s možnosťou **Vrátiť späť**, ak to nebol váš úmysel. Kým je Arroxy zaneprázdnený, odkaz počká, kým sa nevrátite na kartu s adresou URL (vypnete to v Nastaveniach)",
  feat_workflow_4:
    "**Automatické čistenie adries URL** — odstráni sledovacie parametre (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) a rozbalí odkazy `youtube.com/redirect`",
  feat_workflow_5:
    "**Režim systémovej lišty** — zatvorenie okna ponechá sťahovania bežať na pozadí",
  feat_workflow_6:
    "**{{LANG_COUNT}} jazykov** — automaticky rozpozná jazyk systému, kedykoľvek sa dá prepnúť",
  feat_workflow_7:
    "**Synchronizácia zoznamu skladieb** — znova prehľadá zoznam skladieb oproti lokálnemu priečinku a preskočí už stiahnuté videá; vytvorí súbor zoznamu skladieb `.m3u`, ktorý sa aktualizuje po stiahnutí každého videa",
  feat_workflow_8:
    "**Ovládanie rýchlosti a oneskorenia** — obmedzte šírku pásma sťahovania, nastavte, koľko častí videa sa sťahuje naraz, a pridajte oneskorenia požiadaviek pomocou predvolieb (*Vypnuté · Vyvážené · Opatrné · Vlastné*)",
  feat_workflow_9:
    "**Šablóny názvov súborov** — pomenujte sťahovania po svojom pomocou `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` a `{playlist_index}`, globálne alebo pre každý profil sťahovania",
  feat_workflow_10:
    "**Súčasné sťahovania a automatické opakovanie** — vyberte, koľko sťahovaní v rade beží naraz, a nechajte Arroxy zopakovať sťahovanie, ktoré narazilo na problém so sieťou alebo serverom, pričom pred každým pokusom čaká dlhšie",
  feat_workflow_11:
    "**Profily pre jednotlivé položky zoznamu skladieb** — priraďte každému videu v zozname skladieb vlastný profil sťahovania namiesto jedného nastavenia pre celý zoznam, takže jedným prechodom môžete niektoré archivovať v plnej kvalite a ostatné stiahnuť ako MP3",
  feat_workflow_13:
    "**Rýchle sťahovanie funguje na pozadí** — odkaz sa hneď zobrazí v Sťahovaniach a pripravuje sa tam, poznámka s možnosťou **Zobraziť** to potvrdí a pole adresy URL sa vyčistí pre ďalší odkaz. Spustite ich, koľko chcete, kým sa predchádzajúce pripravujú",
  feat_workflow_14:
    "**Sťahovania vám povedia, čo od vás potrebujú** — ak Arroxy nedokáže prečítať odkaz, jeho riadok povie prečo a ponúkne riešenie: Skúsiť znova, zapnúť súbory cookie alebo sa prihlásiť v Preskúmať. Pri vypnutých súboroch cookie možnosť **Prihlásiť sa cez Preskúmať** odkaz zopakuje za vás, keď sa prihlásite. Zoznam skladieb dlhší ako váš limit načítania čaká na svojom riadku, kým nevyberiete všetko, prvé položky alebo kontrolu. Karta Sťahovania počíta riadky, ktoré čakajú na vás",
  feat_workflow_15:
    "**Stiahnite iba časť videa** — na obrazovke Formát vyberte začiatok a koniec alebo kapitolu a Arroxy uloží iba tento rozsah, pomenovaný rozsahom za ID videa. Strihy sa zarovnajú na najbližší kľúčový snímok; zapnite presný strih, ak chcete namiesto toho prekódovať",
  feat_workflow_16:
    "**Odstraňovanie dokončených sťahovaní** — voliteľné: dokončené sťahovanie zmizne zo zoznamu o 5 sekúnd. Jeho súbory zostanú na disku a zlyhané sťahovania zostanú v zozname",
  feat_workflow_17:
    "**Veľkosť a Chýba v Sťahovaniach** — zoraditeľný stĺpec **Veľkosť** ukazuje, koľko miesta každé sťahovanie zaberá, a **Chýba** označí súbory presunuté alebo odstránené mimo Arroxy",
  feat_workflow_18:
    "**Aurora alebo Minimal, tmavý alebo svetlý** — sklenené panely nad pohyblivou oblohou, alebo pokojné plné plochy; prepínajte v pätičke. Počítače bez grafickej akcelerácie dostanú Minimal automaticky",
  feat_workflow_19:
    "**Panel s ponukami v macOS** — v macOS otvorte Nastavenia (`Cmd+,`), nastavte limit rýchlosti sťahovania, prepnite štýl a motív a otvorte protokoly alebo uložte diagnostický súbor z panela s ponukami",
  feat_workflow_20:
    "**Zmeňte profil z ľubovoľného sťahovania** — upravte sťahovanie a potom aktualizujte profil, z ktorého vzišlo (s ukážkou zmien), alebo uložte nastavenia ako nový profil. Pri prepnutí profilu sa Arroxy opýta, či ponechať vaše úpravy",
  feat_post_h3: "Titulky a následné spracovanie",
  feat_post_1:
    "**Titulky** vo formáte SRT, VTT alebo ASS — ručné alebo automaticky generované, v ľubovoľnom dostupnom jazyku",
  feat_post_2:
    "Uložte vedľa videa, vložte do `.mkv` alebo usporiadajte do podpriečinka `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — preskočte alebo označte kapitolami sponzorov, úvody, závery a vlastnú propagáciu",
  feat_post_4:
    "**Vložené metadáta** — názov, dátum nahratia, kanál, popis, miniatúra a značky kapitol zapísané do súboru",
  feat_post_5:
    "**Dávky iba s titulkami** — vložte zoznam adries URL alebo otvorte zoznam skladieb, vyberte Titulky a získajte iba súbory titulkov pre každé video",
  feat_sites_h3: "YouTube + 2000 webov",
  feat_sites_1:
    "**YouTube v plnom rozsahu** — Videá, Shorts, Kanály, Zoznamy skladieb, YouTube Music a Podcasty sú plnohodnotné zdroje",
  feat_sites_2:
    "**Viac ako 2000 ďalších webov** cez yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable a mnoho ďalších",
  feat_sites_3:
    "**Iba zvuk a titulky** fungujú na každom podporovanom webe, nielen na YouTube",
  feat_sites_4:
    "Ak sa web zmení, yt-dlp vydáva opravy každý týždeň a Arroxy pri spustení automaticky aktualizuje binárny súbor",
  shot1_cap:
    "<b>Domov Rýchleho sťahovania</b><br/>Vložte adresu URL a okamžite ju stiahnite s aktívnym profilom",
  shot2_cap:
    "<b>Opakovane použiteľné profily sťahovania</b><br/>Uložte predvoľby formátu, kvality a výstupu — použite ich pri každom sťahovaní",
  shot3_cap:
    "<b>Viacjazyčné zvukové stopy</b><br/>Vyberte presný jazyk zvuku, v ktorom video vychádza",
  shot4_cap:
    "<b>Priestorový zvuk / Dolby</b><br/>Stopy 5.1 a Dolby sa rozpoznajú a zachovajú",
  shot5_cap:
    "<b>Režim hromadných adries URL</b><br/>Vložte zoznam, duplikáty sa automaticky odstránia, všetko sa zaradí do radu naraz",
  shot6_cap:
    "<b>Paralelný rad sťahovania</b><br/>Niekoľko sťahovaní naraz so živým priebehom",
  hotkey_fig_alt:
    "Globálna klávesová skratka na sťahovanie v Arroxy — Ctrl+Shift+D vo Windows a Linuxe, Cmd+Shift+D v macOS, ktorá pošle skopírovaný odkaz priamo do radu sťahovania",
  hotkey_fig_cap:
    "<b>Globálna klávesová skratka na sťahovanie</b><br/>Skopírujte odkaz kdekoľvek, raz stlačte — pristane v rade a začne sa sťahovať",
  shot7_cap: "<b>Profily pre jednotlivé položky zoznamu skladieb</b><br/>Dajte každému videu vlastný profil — niektoré archivujte v 4K, ostatné stiahnite ako MP3",
  shot8_cap:
    "<b>Preskúmať</b><br/>Prehliadajte YouTube alebo akýkoľvek iný web priamo v Arroxy a stiahnite stránku, na ktorej ste, s aktívnym profilom",
  shot9_cap:
    "<b>Prvá obrazovka Preskúmať</b><br/>Stručný pohľad na Preskúmať a prečo je vedľajší účet bezpečnejším prihlásením",
  shot10_cap:
    "<b>Sťahovania vám povedia, čo od vás potrebujú</b><br/>Odkazy sa pripravujú na pozadí; zlyhaný ponúkne riešenie, dlhý zoznam skladieb čaká na váš výber",
  shot11_cap:
    "<b>Stiahnite iba časť videa</b><br/>Vyberte začiatok a koniec alebo kapitolu — Arroxy uloží iba tento rozsah",
  shot12_cap:
    "<b>Editor profilu</b><br/>Upravte profil: typ súboru, rozlíšenie, titulky, cieľ, šablónu názvu súboru a ďalšie",
  shot13_cap:
    "<b>Tmavý alebo svetlý, sklenený alebo plný</b><br/>Štyri vzhľady na výber: sklenené panely nad pohyblivou oblohou alebo pokojné plné plochy, každý v tmavom aj svetlom režime",
  shot14_cap:
    "<b>8K HDR pri 60 fps</b><br/>Každé rozlíšenie, kodek a stream HDR, ktorý video ponúka, vedľa seba",
  dl_platform_col: "Platforma",
  dl_format_col: "Priame stiahnutie",
  dl_oneline_note:
    "Zostavy sú iba pre x86_64. Nemáte `curl`? Nahraďte `curl -fsSL` príkazom `wget -qO-`.",
  dl_win_scoop:
    "Uprednostňujete Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Inštalátor (NSIS) alebo prenosný `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` alebo `.flatpak` (izolovaný)",
  dl_grab: "Všetky súbory vydania →",
  dl_pkg_h3: "Inštalácia cez správcu balíkov",
  dl_channel_col: "Kanál",
  dl_command_col: "Príkaz",
  dl_win_h3: "Windows: inštalátor vs. prenosná verzia",
  dl_win_col_installer: "Inštalátor NSIS",
  dl_win_col_portable: "Prenosný `.exe`",
  dl_win_r1: "Vyžaduje sa inštalácia",
  dl_win_r1_installer: "Áno",
  dl_win_r1_portable: "Nie — spustite odkiaľkoľvek",
  dl_win_r2: "Automatické aktualizácie",
  dl_win_r2_installer: "✅ v aplikácii",
  dl_win_r2_portable: "❌ ručné stiahnutie",
  dl_win_r3: "Rýchlosť spustenia",
  dl_win_r3_installer: "✅ rýchlejšie",
  dl_win_r3_portable: "⚠️ pomalší studený štart",
  dl_win_r4: "Pridá sa do ponuky Štart",
  dl_win_r5: "Jednoduché odinštalovanie",
  dl_win_r5_portable: "❌ odstráňte súbor",
  dl_win_rec:
    "**Odporúčanie:** použite inštalátor NSIS kvôli automatickým aktualizáciám a rýchlejšiemu spusteniu. Prenosný `.exe` použite, ak nechcete inštaláciu ani zápisy do registra.",
  dl_win_smartscreen_h4: "Upozornenie Windows SmartScreen",
  dl_win_smartscreen_intro:
    "Pri prvom spustení sa môže zobraziť **„Systém Windows ochránil váš počítač“** alebo **„Neznámy vydavateľ“**. Týka sa to súborov `Arroxy-win-x64-Setup.exe` aj `Arroxy-win-x64-Portable.exe`. Arroxy je bezplatný a s otvoreným zdrojovým kódom a zostavy pre Windows nie sú podpísané platným certifikátom na podpisovanie kódu, preto ich SmartScreen označuje. Neznamená to automaticky, že Arroxy nie je bezpečný. Postup:",
  dl_win_smartscreen_step1: "Kliknite na **Ďalšie informácie**.",
  dl_win_smartscreen_step2: "Kliknite na **Aj tak spustiť**.",
  dl_win_smartscreen_official:
    "Arroxy sťahujte iba z oficiálnej stránky vydaní na GitHube. Ak ste súbor získali z iného webu alebo vám ho niekto poslal, odstráňte ho a stiahnite si čerstvú kópiu z oficiálneho zdroja. Zdrojový kód je verejný, takže ho môžete skontrolovať alebo si Arroxy zostaviť sami.",
  dl_macos_h3: "Prvé spustenie v macOS",
  dl_macos_warning:
    "Arroxy zatiaľ nie je podpísaný kódom, takže macOS Gatekeeper môže pri prvom spustení zobraziť upozornenie o poškodenej aplikácii. Je to očakávané — neznamená to skutočné poškodenie súboru.",
  dl_macos_m1_h4: "Postup cez Terminál:",
  dl_macos_step1: "Presuňte `Arroxy.app` z pripojeného obrazu DMG do `/Applications`.",
  dl_macos_step2:
    "Otvorte Terminál a spustite `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Spustite `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Ak je cesta k aplikácii iná, nahraďte `/Applications/Arroxy.app` cestou, kam ste ju nainštalovali.",
  dl_macos_step5:
    "Ak sa `sudo` opýta, zadajte heslo svojho Macu.",
  dl_macos_after:
    "Po odstránení karantény sa Arroxy otvorí normálne.",
  dl_macos_m2_h4: "Postup cez Terminál:",
  dl_macos_note:
    "Zostavy pre macOS vznikajú v CI na bežcoch Apple Silicon a Intel. Ak narazíte na problémy, [otvorte hlásenie](../../issues) — spätná väzba od používateľov macOS aktívne formuje testovací cyklus pre macOS.",
  dl_linux_h3: "Prvé spustenie v Linuxe",
  dl_linux_intro:
    "AppImage sa spúšťajú priamo — bez inštalácie. Stačí súbor označiť ako spustiteľný.",
  dl_linux_m1_text:
    "**Správca súborov:** kliknite pravým tlačidlom na `.AppImage` → **Vlastnosti** → **Oprávnenia** → zapnite **Povoliť spúšťanie súboru ako programu** a potom dvakrát kliknite.",
  dl_linux_m2_h4: "Terminál:",
  dl_linux_fuse_text: "Ak sa spustenie stále nedarí, spustite ho bez pripojenia — balík FUSE nie je potrebný:",
  dl_linux_targz_h4: "Obyčajný archív tarball (bez FUSE, bez inštalácie):",
  dl_linux_targz_text: "Zostava `.tar.gz` je tá istá aplikácia bez obalu AppImage — rozbaľte ju kdekoľvek a spustite. Nie je potrebný inštalátor ani balík FUSE.",
  dl_linux_arch_note: "**Súbory pre Linux na stránke vydania sú iba pre x86_64.** Na strojoch ARM64 (Raspberry Pi, Asahi Linux) sa Flatpak stále nainštaluje, ale pri spustení zlyhá s chybou `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Prečo sa môže zobraziť upozornenie",
  dl_warning_p1:
    "Arroxy má otvorený zdrojový kód a licenciu GPLv3. Zostavy pre Windows a macOS **nie sú podpísané kódom** — certifikáty Apple Developer ID a Windows EV na podpisovanie kódu stoja každý stovky dolárov ročne, čo nezávislý projekt platí z vlastného vrecka. Bez týchto podpisov vás Windows SmartScreen a macOS Gatekeeper pri prvom spustení upozornia. Upozornenia znamenajú, že *váš operačný systém nepozná vydavateľa* — neznamenajú, že Arroxy je malvér.",
  dl_warning_p2:
    "Tri spôsoby, ako si Arroxy overiť sami, s rastúcou dôkladnosťou:\n\n- **Prečítajte si zdrojový kód.** Každý riadok je na [GitHube](https://github.com/antonio-orionus/Arroxy) a môžete si ho [zostaviť zo zdrojového kódu](#tech).\n- **Skontrolujte SHA256.** Porovnajte svoj súbor so zverejneným súborom [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — pozrite si nižšie [Overenie stiahnutého súboru](#verify).\n- **Spustite kontrolu treťou stranou.** Nahrajte súbor na [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Prvé spustenie vo Windows",
  shot_smartscreen_more_alt:
    "Dialóg SmartScreen „Systém Windows ochránil váš počítač“ so zvýrazneným odkazom „Ďalšie informácie“",
  shot_smartscreen_run_alt:
    "Dialóg SmartScreen po rozbalení Ďalších informácií s tlačidlom „Aj tak spustiť“",
  dl_win_defender_h4: "Ak Windows Defender súbor označí alebo odstráni",
  dl_win_defender_p:
    "Heuristika programu Defender niekedy označí nepodpísané inštalátory NSIS a prenosné aplikácie Electron ako podozrivé. Ak Defender dá `Arroxy-win-x64-Setup.exe` alebo `Arroxy-win-x64-Portable.exe` do karantény, obnovte ho cez **Zabezpečenie Windows → Ochrana pred vírusmi a hrozbami → História ochrany** a potom pridajte spustiteľný súbor Arroxy ako povolenú položku v časti **Spravovať nastavenia → Pridať alebo odstrániť vylúčenia**. Rovnako ako pri SmartScreen je príčinou chýbajúci podpis vydavateľa, nie zistený malvér.",

  dl_macos_first_h3: "Prvé spustenie v macOS",
  dl_macos_intro:
    "Zostavy Arroxy pre macOS sú podpísané ad-hoc, ale nie sú notarizované spoločnosťou Apple, takže Gatekeeper zablokuje prvé spustenie hlásením *„Arroxy.app“ sa nepodarilo otvoriť — Apple nemohol overiť, že „Arroxy.app“ neobsahuje malvér*. To znamená, že macOS nedokáže aplikáciu overiť u Apple, nie že so súbormi niečo nie je v poriadku. Inštalácia cez Homebrew sa tomuto dialógu úplne vyhne. Ak ste použili DMG, vyrieši to jeden príkaz v Termináli:",
  dl_macos_sequoia_h4: "Oprava cez Terminál pre aktuálny macOS",
  dl_macos_sequoia_intro:
    "Použite Terminál po skopírovaní Arroxy do priečinka Aplikácie:",
  dl_macos_sequoia_step1:
    "Presuňte `Arroxy.app` z pripojeného obrazu DMG do `/Applications`.",
  dl_macos_sequoia_step2:
    "Otvorte Terminál a spustite tieto dva príkazy:",
  dl_macos_sequoia_step3:
    "Spustite `open /Applications/Arroxy.app` a otvorte Arroxy.",
  dl_macos_sequoia_step4:
    "Ak je cesta k aplikácii iná, nahraďte `/Applications/Arroxy.app` cestou, kam ste ju nainštalovali.",
  dl_macos_sonoma_h4: "Oprava cez Terminál pre starší macOS",
  dl_macos_sonoma_step1:
    "Presuňte `Arroxy.app` z pripojeného obrazu DMG do `/Applications`.",
  dl_macos_sonoma_step2:
    "Otvorte Terminál a odstráňte karanténu z `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Po odstránení karantény spustite Arroxy z Terminálu alebo z Findera.",
  dl_macos_damaged_h4:
    "Oprava karantény Gatekeeper",
  dl_macos_damaged_p:
    "Prvý príkaz odstráni atribút karantény, ktorý macOS pripojil pri stiahnutí súboru; druhý aplikáciu spustí. `sudo` zvyčajne nepotrebujete, pretože kópia v `/Applications` patrí vám — pridajte ho, iba ak sa zobrazí chyba oprávnení.",
  dl_macos_arch_note:
    "**Apple Silicon vs. Intel:** na Macu s procesorom radu M (M1 / M2 / M3 / M4) stiahnite DMG `arm64`. Na Macoch s procesorom Intel stiahnite DMG `x64`. Nesprávna zostava stále funguje cez Rosetta, ale citeľne pomalšie.",

  dl_linux_first_h3: "Prvé spustenie v Linuxe",
  dl_linux_appimagelauncher:
    "**Voliteľná integrácia do pracovného prostredia:** raz nainštalujte [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) a každý AppImage, na ktorý dvakrát kliknete, sa automaticky zaregistruje do ponuky spúšťača — bez ručného súboru `.desktop`.",

  dl_verify_h3: "Overenie stiahnutého súboru (SHA256)",
  dl_verify_intro:
    "Každé vydanie zverejňuje popri binárnych súboroch aj súbor `SHA256SUMS`. Ak chcete skontrolovať, že sa stiahnutý súbor počas prenosu nepoškodil ani nezmenil, vypočítajte jeho kontrolný súčet lokálne a porovnajte ho s riadkom v `SHA256SUMS`. Otvorte stránku najnovšieho vydania → **Assets** → stiahnite `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell alebo Príkazový riadok):",
  dl_verify_mac_label: "macOS (Terminál):",
  dl_verify_linux_label: "Linux (Terminál):",
  dl_verify_vt_text:
    "Chcete kontrolu malvéru treťou stranou? Nahrajte súbor na [VirusTotal](https://www.virustotal.com). Niekoľko všeobecných heuristických označení od menších nástrojov je u nepodpísaných aplikácií Electron normálnych; rozšírené detekcie od veľkých nástrojov by boli skutočným dôvodom na obavy.",

  dl_pm_intro:
    "Uprednostňujete iný kanál? Fungujú aj tieto a držia krok s každým vydaním.",

  privacy_p1:
    "Sťahovania sa preberajú priamo cez [yt-dlp](https://github.com/yt-dlp/yt-dlp) z YouTube do priečinka, ktorý vyberiete — nič nejde cez server tretej strany. História pozerania, história sťahovania, adresy URL a obsah súborov zostávajú na vašom zariadení.",
  privacy_p2:
    "Žiadna telemetria — iba jeden anonymný denný signál o aktivite: verzia aplikácie, operačný systém, jazyk, kanál inštalácie, krajina a približne ako dávno bol Arroxy nainštalovaný, aby sme mohli počítať aktívnych a nových používateľov. Žiadne identifikátory, adresy URL, názvy videí, cesty k súborom ani údaje o účte. Vypnúť ho môžete v Nastaveniach.",
  privacy_p3:
    "Preskúmať si uchováva vlastné prihlásenia, oddelené od vášho prehliadača, a Arroxy nikdy nečíta ani nevypĺňa prihlasovací formulár — píšete na vlastnú stránku webu. Sťahovania bežia bez prihlásenia; iba keď jedno zlyhá spôsobom, ktorý účet dokáže vyriešiť, Arroxy znova načíta prihlásenie, uchová ho v dočasnom súbore pre dané sťahovanie a súbor potom odstráni. Odhlásenie z Preskúmať v Nastaveniach ich zabudne.",
  faq_q1: "Je to naozaj zadarmo?",
  faq_a1: "Áno — licencia GPLv3, bez platenej verzie, bez obmedzovania funkcií.",
  faq_q11: "Čím sa Arroxy líši od ostatných grafických rozhraní pre yt-dlp?",
  faq_a11:
    "Väčšina bezplatných grafických rozhraní pre yt-dlp sú obaly, ktoré prijímajú iba odkaz. Arroxy pridáva **Preskúmať**, prehliadač zabudovaný v aplikácii, ktorý otvorí YouTube alebo akýkoľvek iný web: prehliadate a sťahujete bez kopírovania odkazov a raz sa tam prihlásite, aby ste mohli sťahovať súkromné videá, videá iba pre členov a videá s vekovým obmedzením a svoje zoznamy Pozrieť neskôr a Páči sa mi, bez exportu súborov cookie. Arroxy toto prihlásenie použije, keď vás YouTube požiada o potvrdenie, že nie ste robot, a jeho vstavaný prehliadač získa token na sťahovanie z YouTube, takže sťahovania nepadnú na menej formátov. Pozrite si [Prečo Arroxy](#why).",
  faq_q2: "Aké kvality videa môžem sťahovať?",
  faq_a2:
    "Čokoľvek, čo YouTube poskytuje: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, ako aj iba zvuk. Streamy 60 fps a HDR sa zachovajú bez zmeny a sťahovanie krok za krokom vám umožní vybrať AV1, VP9 alebo H.264 pri každom rozlíšení.",
  faq_q3: "Môžem extrahovať iba zvuk ako MP3?",
  faq_a3:
    "Áno. V ponuke formátov vyberte *iba zvuk* a zvoľte MP3, M4A/AAC, Opus alebo WAV.",
  faq_q4: "Ako stiahnem videá, ktoré vyžadujú účet YouTube?",
  faq_a4:
    "Raz sa prihláste na karte Preskúmať. Arroxy potom dokáže stiahnuť súkromné videá a videá iba pre členov, ktoré váš účet dokáže prehrať, videá s vekovým obmedzením, ak je vek účtu overený, a vaše zoznamy Pozrieť neskôr a Páči sa mi. Prihlásenie použije iba vtedy, keď sťahovanie zlyhá spôsobom, ktorý účet dokáže vyriešiť; všetko ostatné sa sťahuje ako predtým. Ide o voľbu **Prihlásenie z Preskúmať**, ktorá je v nastaveniach súborov cookie uvedená prvá a označená ako Odporúčané, a Arroxy ju vyberie za vás pri prvom otvorení Preskúmať. Wiki yt-dlp upozorňuje, že [automatizácia s prihlásením môže účet Google označiť](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), takže bezpečnejšou voľbou je vedľajší účet.",
  faq_q5: "Bude to naďalej fungovať, keď YouTube niečo zmení?",
  faq_a5:
    "yt-dlp sa pri spustení aktualizuje automaticky a Arroxy rýchlo vydáva opravy, keď YouTube niečo zmení. Keď vás YouTube požiada o potvrdenie, že nie ste robot, Arroxy skúsi aj vaše prihlásenie z Preskúmať, ak ste sa tam prihlásili, a súbory cookie zo súboru alebo z vášho prehliadača sú k dispozícii v nastaveniach súborov cookie.",
  faq_q6: "V akých jazykoch je Arroxy dostupný?",
  faq_a6:
    "{{LANG_COUNT}} jazykov hneď po inštalácii: {{LANG_NAME_LIST}}. Arroxy pri prvom spustení automaticky rozpozná jazyk vášho operačného systému a môžete ho kedykoľvek prepnúť vo výbere jazyka na paneli nástrojov. Runtime JSON súbory jazykov sú v src/shared/i18n/locales/ a katalógy PO pre prekladateľov v i18n/locales/ — prispejte otvorením PR na GitHube.",
  faq_q7: "Musím nainštalovať ešte niečo?",
  faq_a7:
    "Nie. yt-dlp, ffmpeg a ffprobe sa pri prvom spustení automaticky stiahnu a uložia do vyrovnávacej pamäte na vašom počítači. Potom už nie je potrebné žiadne ďalšie nastavovanie.",
  faq_q8: "Môžem sťahovať zoznamy skladieb alebo celé kanály?",
  faq_a8:
    "Áno — oboje. Vložte adresu URL zoznamu skladieb alebo kanála (napr. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); vyberte, koľko položiek sa má prehľadať, a potom zaraďte do radu celý zoznam alebo vyberte konkrétne videá. Filtre podľa rozsahu dátumov budú čoskoro.",
  faq_q9: "macOS hovorí „aplikácia je poškodená“ — čo mám robiť?",
  faq_a9:
    "To macOS Gatekeeper blokuje nepodpísanú aplikáciu, nie skutočné poškodenie. Príkazy v Termináli, ktoré odstránia karanténu a spustia Arroxy, nájdete v časti [Prvé spustenie v macOS](#macos-first-launch).",
  faq_q10: "Je sťahovanie videí z YouTube legálne?",
  faq_a10:
    "Na osobné, súkromné použitie je to vo väčšine jurisdikcií všeobecne akceptované. Zodpovedáte za dodržiavanie [Podmienok služby](https://www.youtube.com/t/terms) YouTube a miestnych autorských zákonov.",
  plan_intro: "Stále plánované — približne podľa priority:",
  plan_col1: "Funkcia",
  plan_col2: "Popis",
  plan_r1_name: "**Filtre zoznamov skladieb a kanálov**",
  plan_r1_desc: "Filtre podľa rozsahu dátumov pri vypisovaní zoznamu skladieb alebo kanála",
  plan_r2_name: "**Predvoľby zvukovej stopy YouTube**",
  plan_r2_desc:
    "Nastavenie predvoľby jazyka hovoreného slova pre celú aplikáciu s prepísaním pre jednotlivé profily, keď YouTube ponúka viac zvukových stôp",
  plan_r3_name: "**Silnejšia obnova opakovaním**",
  plan_r3_desc:
    "Nová cesta opakovania pre sťahovania prerušené nespoľahlivým alebo problematickým pripojením na internet",
  plan_r4_name: "**Plnohodnotný správca sťahovania**",
  plan_r4_desc:
    "Premena panela radu na plnohodnotnejšieho správcu vrátane zmeny cieľových priečinkov pre položky v rade",
  plan_r5_name: "**Naplánované sťahovania**",
  plan_r5_desc: "Spustenie radu v stanovený čas (nočné behy)",
  plan_r9_name: "**Balík AUR**",
  plan_r9_desc: "Inštalácia na Arch Linux a Omarchy pomocou `yay -S arroxy-bin`",
  plan_cta:
    "Máte na mysli funkciu? [Otvorte požiadavku](../../issues) — vstup komunity formuje prioritu.",
  tech_content: TECH_CONTENT,
  support_h2: "Podporte Arroxy",
  support_note: "Arroxy je zadarmo a s licenciou GPLv3 — bez reklám, bez telemetrie, bez platenej verzie. Ak vám ušetrí čas, môžete podporiť vývoj cez Bitcoin, Tron alebo Ethereum: adresy sú v [DONATE.md](DONATE.md), čo je jediný oficiálny zdroj. Arroxy vám nikdy nepošle adresu e-mailom ani priamou správou. Rovnako pomáha označenie repozitára hviezdičkou, hlásenie chýb a zlepšovanie prekladov.",
  tos_h2: "Podmienky používania",
  tos_note:
    "Arroxy je nástroj iba na osobné, súkromné použitie. Ste výhradne zodpovední za to, aby vaše sťahovania spĺňali [Podmienky služby](https://www.youtube.com/t/terms) YouTube a autorské zákony vašej jurisdikcie. Nepoužívajte Arroxy na sťahovanie, reprodukciu ani šírenie obsahu, na ktorý nemáte právo. Vývojári nezodpovedajú za žiadne zneužitie.",
  footer_credit:
    'GPLv3 · Vytvorené s láskou od <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
