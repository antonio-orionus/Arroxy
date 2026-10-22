const TECH_CONTENT = `<details>
<summary><strong>Technologie</strong></summary>

- **Electron** — multiplatformní desktopový obal
- **React 19** + **TypeScript** — uživatelské rozhraní
- **Tailwind CSS v4** — stylování
- **Zustand** — správa stavu
- **yt-dlp** + **ffmpeg** — modul pro stahování a slučování (oba se stahují za běhu: yt-dlp se udržuje aktuální, ffmpeg/ffprobe se nainstalují jednou a zůstanou i po aktualizacích)
- **Vite** + **electron-vite** — nástroje pro sestavení
- **Vitest** + **Playwright** — jednotkové a end-to-end testy

</details>

<details>
<summary><strong>Sestavení ze zdrojového kódu</strong></summary>

### Předpoklady — všechny platformy

| Nástroj | Verze   | Instalace |
| ------- | ------- | --------- |
| Git     | libovolná | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` nebo \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` nebo \`packageManager\` v \`package.json\` |

Doporučeno: nainstalujte \`mise\` a v repozitáři spusťte \`mise install\`. Bez mise ručně aktivujte Node.js podle \`.node-version\` a Bun podle \`package.json\` ještě před \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Pro nativní sestavení mohou být potřeba Visual Studio Build Tools a Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Po naklonování spusťte v repozitáři \`mise trust && mise install\`. Pokud váš shell už používá \`fnm\`, \`nvm\` nebo Bun z Homebrew, aktivujte mise v \`~/.zshrc\`, aby Arroxy dostalo Node.js 24.21.0 a Bun 1.4.2:

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

### Naklonování a spuštění

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Sestavení distribuovatelné verze

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` nainstaluje závislosti, znovu sestaví závislosti aplikace Electron, ověří Electron, připraví vestavěné ffmpeg/ffprobe pro vývoj a nainstaluje Playwright Chromium. Vydané sestavy spravují yt-dlp, ffmpeg a ffprobe za běhu ve složce s daty aplikace; žádný z nich není součástí instalátoru.

</details>`;

export const cs = {
  icon_alt: "Maskot Arroxy",
  title:
    "Arroxy — bezplatný open-source stahovač z YouTube (+ 2000 webů) s vestavěným prohlížečem pro Windows, macOS a Linux",
  read_in_label: "Číst v jazyce:",
  badge_release_alt: "Vydání",
  badge_build_alt: "Sestavení",
  badge_license_alt: "Licence",
  badge_platforms_alt: "Platformy",
  badge_i18n_alt: "Jazyky",
  badge_website_alt: "Web",
  discord_badge_text: "Připojte se na Discord",
  discord_badge_encoded: "P%C5%99ipojte%20se%20na%20Discord",
  hero_desc:
    "Stahujte videa, Shorts, kanály, podcasty nebo zvukové stopy z **YouTube a více než 2000 podporovaných webů** — až do 8K HDR při 60 fps, jako MP3 / AAC / Opus, nebo jen tu část, kterou potřebujete. **Procházejte YouTube i jakýkoli jiný web přímo v Arroxy** na kartě Procházení a stáhněte video, playlist nebo kanál, na kterém právě jste; přihlaste se tam a stahujte videa, která váš účet už smí přehrát. Běží lokálně ve Windows, macOS a Linuxu. **Bez reklam, bez zbytečností, bez vnucování placených verzí.**",
  cta_latest: "↓ Nainstalovat nejnovější verzi",
  cta_website: "Web",
  website_url: "https://arroxy.com/",
  star_cta: "Pokud vám Arroxy šetří čas, ⭐ pomůže ostatním ho najít.",
  ai_notice: "> 🌐 Tento překlad vznikl za pomoci AI. [Anglické README](README.md) je nadřazeným zdrojem. Našli jste chybu? [Otevřete PR](../../pulls).",
  intro_what_is:
    "**Co je Arroxy?** Arroxy je bezplatné open-source grafické rozhraní pro počítač, které stahuje videa, zvuk, playlisty a titulky z YouTube a z více než 2000 dalších webů podporovaných nástrojem [yt-dlp](https://github.com/yt-dlp/yt-dlp). Funguje na platformách Windows 10/11, macOS 13+ (Intel + Apple Silicon) a Linux (AppImage, Flatpak, tar.gz). Licence GPLv3. Bez reklam a bez limitů používání. Distribuuje se přes [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage a přímé stažení.",
  intro_key_difference:
    "**Hlavní rozdíl: vestavěný prohlížeč.** Většina bezplatných stahovačů z YouTube jsou tenké obaly na yt-dlp: políčko pro URL a nabídka formátů, bez vlastního prohlížeče. Arroxy ho má, a to **kartu Procházení**. Procházíte YouTube nebo jakýkoli jiný web přímo v aplikaci a stahujete video, playlist nebo kanál, na kterém právě jste, nebo kliknete pravým tlačítkem na libovolný odkaz. Když se jednou přihlásíte v Procházení, stahování, která vyžadují účet, toto přihlášení použijí: vaše soukromá videa, seznamy Podívat se později a Označeno „To se mi líbí“ a další videa, která váš účet už smí přehrát, bez exportu cookies. Přihlaste se tam i k dalším webům a jejich stahování pak toto přihlášení použije, když ho bude potřebovat. Podrobnosti: [Proč Arroxy](#why-explore).",
  last_updated: "Poslední aktualizace: {{LAST_UPDATED}}.",
  toc_heading: "Obsah",
  why_h2: "Proč Arroxy",
  features_h2: "Funkce",
  dl_h2: "Instalace a první spuštění",
  privacy_h2: "Soukromí",
  faq_h2: "Časté dotazy",
  roadmap_h2: "Plán vývoje",
  tech_h2: "Vytvořeno pomocí",
  why_intro: "Srovnání s nejběžnějšími alternativami:",
  why_r1: "Zdarma, bez prémiové verze",
  why_r2: "Otevřený zdrojový kód",
  why_r3: "Pouze lokální zpracování",
  why_r5: "Bez omezení využití",
  why_r6: "Multiplatformní desktopová aplikace",
  why_r7: "Titulky + SponsorBlock",
  why_r8: "Vestavěný prohlížeč (procházení, přihlášení, stahování)",
  why_r9: "Videa, která váš vlastní účet smí přehrát, bez exportu cookies",
  why_table_note:
    "⚠️ = částečně, nebo jen v placené verzi. Přihlášení v aplikaci pro soukromá videa je u 4K Video Downloaderu placená funkce; většina bezplatných grafických rozhraní pro yt-dlp přijímá jen soubor cookies nebo čte cookies vašeho webového prohlížeče.",
  why_summary:
    "Arroxy je stvořeno pro jedno: čistý lokální soubor, ať vložíte URL, nebo najdete video v Procházení. Bez vnucování placených verzí, bez sběru dat.",
  why_explore_h3: "Co obyčejný obal yt-dlp neumí: karta Procházení",
  why_explore_intro:
    "Většina bezplatných stahovačů z YouTube je jen políčko pro URL nad yt-dlp. Arroxy také používá yt-dlp, ale má navíc **Procházení**, prohlížeč zabudovaný v aplikaci, který otevře YouTube i jakýkoli jiný web. Procházení přidává to, co políčko pro URL nezvládne:",
  why_explore_1:
    "**Videa, která váš účet smí přehrát, bez exportu cookies** — vaše soukromá videa, seznamy Podívat se později a Označeno „To se mi líbí“, videa s věkovým omezením na účtu s ověřeným věkem a stránky na jiných webech, které vyžadují vaše přihlášení. Běžný obal potřebuje export souboru cookies.txt nebo čte cookies vašeho webového prohlížeče. V Arroxy se jednou přihlásíte v Procházení a zbytek obstará aplikace",
  why_explore_4:
    "**Bez kopírování odkazů** — najděte video, playlist nebo kanál v Procházení a stáhněte je jedním kliknutím, nebo klikněte pravým tlačítkem na libovolný odkaz na stránce",
  why_explore_5:
    "**Blokování reklam, když chcete** — jedno kliknutí na štít zablokuje reklamy a sledovací prvky na stránkách v Procházení",
  feat_explore_h3: "Procházení: surfujte po webu přímo v Arroxy",
  feat_explore_1:
    "**Karta Procházení** — procházejte YouTube i jakýkoli jiný web přímo v Arroxy a stahujte, co najdete, bez kopírování odkazů. **Stáhnout · *váš profil*** zařadí do fronty video, playlist nebo kanál, na který se díváte; šipka vedle přepíná profily a hůlka otevře stahování krok za krokem pro výběr formátů, titulků a dalšího",
  feat_explore_6:
    "**Stahování pravým tlačítkem** — klikněte pravým tlačítkem na libovolný odkaz na video, playlist nebo kanál v Procházení a stáhněte jej se svým profilem, vyberte jiný profil v nabídce **Stáhnout s profilem**, otevřete stahování krok za krokem nebo odkaz zkopírujte. Nemusíte nejdřív otevírat každé video",
  feat_explore_7:
    "**Kompaktní rozložení** — jedno kliknutí na panelu nástrojů Procházení přesune karty Arroxy do něj a dá stránce více místa",
  feat_explore_2:
    "**Adresní řádek** — zadáním textu hledejte na YouTube, nebo zadejte libovolnou webovou adresu a otevřete daný web",
  feat_explore_3:
    "**Stahování, která vyžadují účet** — jednou se přihlaste v Procházení a Arroxy může stahovat videa, která váš účet smí přehrát: soukromá videa, videa s věkovým omezením, pokud má účet ověřený věk, a vaše seznamy Podívat se později a Označeno „To se mi líbí“. Přihlaste se tam i k dalším webům a jejich stahování pak toto přihlášení použije, když ho bude potřebovat. Arroxy stále nejdřív stahuje nepřihlášené a vaše přihlášení z Procházení použije, jen když stahování selže způsobem, který účet vyřeší",
  feat_explore_4:
    "**Použijte vedlejší účet** — první obrazovka Procházení vysvětluje proč: stahování s účtem s sebou nese určité riziko, že bude účet omezen. Z Procházení se můžete kdykoli odhlásit v Nastavení a zapomenout tak svá přihlášení",
  feat_explore_5:
    "**Blokování reklam** — ve výchozím stavu vypnuté. Jedno kliknutí na štít na panelu nástrojů Procházení zablokuje reklamy a sledovací prvky na jeho stránkách, aniž by to ovlivnilo stahování. YouTube může u přihlášených účtů blokovače reklam omezovat",
  feat_quality_h3: "Kvalita a formáty",
  feat_quality_1: "Až **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Vysoká snímková frekvence a HDR** zachovány beze změny — 60 fps, HDR10",
  feat_quality_3:
    "**Zvuk** — exportujte samotný zvuk jako MP3, M4A/AAC, Opus nebo WAV. V interaktivním stahování vyberte, je-li k dispozici, nativní prostorové stopy / Dolby ze zdroje (AC-3, E-AC-3, 5.1, DRC), nebo nastavte globální výchozí volbu **Preferovat prostorový zvuk / Dolby**",
  feat_quality_4:
    "**Profily s cílem** — *Nejlepší obraz* (AV1 · VP9) nebo *Smart TV* (MP4 · H.264), uložené jako Auto, MP4, MKV nebo WebM bez překódování. HDR je *Auto* (jen když ho vaše obrazovka umí zobrazit), *SDR* nebo *HDR*",
  feat_quality_5:
    "**Každý kodek v každém rozlišení** — stahování krok za krokem uvádí AV1, VP9 a H.264 vedle sebe u každého rozlišení, takže si můžete vybrat ten, který přehraje vaše televize nebo editor",
  feat_quality_6:
    "**Poznáte, co stream skutečně je** — velikosti zvětšené YouTube pomocí AI, jazyky zvuku nadabované AI, streamy s vylepšeným datovým tokem, videa 360° a poškozené kopie nebo kopie s vodoznakem jsou označeny. Profily přeskakují streamy zvětšené pomocí AI, pokud je nepovolíte",
  feat_privacy_h3: "Soukromí a kontrola",
  feat_privacy_1:
    "100% lokální zpracování — stahování jde přímo z YouTube na váš disk",
  feat_privacy_2: "**Otevřený zdrojový kód** — každý řádek lze zkontrolovat, licence GPLv3",
  feat_privacy_3: "Soubory se ukládají přímo do složky, kterou zvolíte",
  feat_workflow_h3: "Pracovní postup",
  feat_workflow_12:
    "**Globální klávesová zkratka pro stahování** — zkopírujte odkaz v libovolné aplikaci a stiskněte `Ctrl+Shift+D` (`Cmd+Shift+D` v macOS); Arroxy jej zařadí do fronty s vaším aktivním profilem, aniž by se otevřelo okno, a potvrdí to oznámením. Ve výchozím stavu zapnuto, lze změnit",
  feat_workflow_1:
    "**Pružné způsoby spuštění** — vyberte si vedené jednotlivé stahování, výběr z playlistu nebo kanálu, hromadné vložení URL, Rychlé stahování s uloženými výchozími hodnotami, nebo procházení a stahování z Procházení",
  feat_workflow_2:
    "**Centrální fronta stahování** — každá jednotlivá, playlistová, hromadná nebo rychlá úloha skončí na jednom místě, kde můžete sledovat průběh, pozastavit, pokračovat, zrušit, zkusit znovu a řídit prioritu",
  feat_workflow_3:
    "**Sledování schránky** — zkopírujte odkaz na video a po návratu do Arroxy se vyplní do pole URL, s možností **Vrátit zpět**, pokud jste to nechtěli. Když je Arroxy zaneprázdněné, odkaz počká, až se vrátíte na kartu URL (vypnete v Nastavení)",
  feat_workflow_4:
    "**Automatické čištění URL** — odstraní sledovací parametry (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) a rozbalí odkazy `youtube.com/redirect`",
  feat_workflow_5:
    "**Režim lišty** — zavření okna ponechá stahování běžet na pozadí",
  feat_workflow_6:
    "**{{LANG_COUNT}} jazyků** — automaticky zjistí jazyk systému, kdykoli lze přepnout",
  feat_workflow_7:
    "**Synchronizace playlistů** — znovu projděte playlist a porovnejte ho s lokální složkou, abyste přeskočili již stažená videa; vytvoří soubor playlistu `.m3u`, který se aktualizuje po stažení každého videa",
  feat_workflow_8:
    "**Ovládání rychlosti a prodlev** — omezte šířku pásma, nastavte, kolik částí videa se stahuje najednou, a přidejte prodlevy mezi požadavky pomocí předvoleb (*Vypnuto · Vyvážené · Opatrné · Vlastní*)",
  feat_workflow_9:
    "**Šablony názvů souborů** — pojmenujte stahování po svém pomocí `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` a `{playlist_index}`, globálně nebo pro každý profil stahování",
  feat_workflow_10:
    "**Současná stahování a automatické opakování** — zvolte, kolik stahování z fronty běží současně, a nechte Arroxy zopakovat stahování, které narazilo na problém se sítí nebo serverem, s delším čekáním před každým pokusem",
  feat_workflow_11:
    "**Profily playlistu pro jednotlivé položky** — přiřaďte každému videu v playlistu vlastní profil stahování místo jednoho nastavení pro celý seznam, takže jedním během některá videa archivujete v plné kvalitě a zbytek uložíte jen jako zvuk",
  feat_workflow_13:
    "**Rychlé stahování funguje na pozadí** — odkaz se hned objeví ve Stahování a připravuje se tam, poznámka s tlačítkem **Zobrazit** to potvrdí a pole URL se vyčistí pro další odkaz. Spusťte, kolik chcete, zatímco se předchozí připravují",
  feat_workflow_14:
    "**Stahování vám řekne, co vás potřebuje** — pokud Arroxy nemůže odkaz přečíst, jeho řádek řekne proč a nabídne řešení: Zkusit znovu, zapnout cookies nebo se přihlásit v Procházení. Při vypnutých cookies vám **Přihlásit se v Procházení** po přihlášení odkaz zkusí znovu. Playlist delší než váš limit načítání čeká na svém řádku, až vyberete všechna videa, prvních několik nebo přehled. Karta Stahování počítá řádky, které na vás čekají",
  feat_workflow_15:
    "**Stáhněte jen část videa** — na obrazovce Formát vyberte začátek a konec nebo kapitolu a Arroxy uloží jen tento úsek, s rozsahem v názvu za ID videa. Střihy se zarovnají na nejbližší klíčový snímek; zapněte přesný střih, pokud chcete místo toho překódování",
  feat_workflow_16:
    "**Odebírání dokončených stahování** — volitelné: dokončené stahování zmizí ze seznamu o 5 sekund později. Jeho soubory zůstanou na disku a neúspěšná stahování zůstanou v seznamu",
  feat_workflow_17:
    "**Velikost a Chybí ve Stahování** — řaditelný sloupec **Velikost** ukazuje, kolik místa každé stahování zabírá, a **Chybí** označí soubory přesunuté nebo smazané mimo Arroxy",
  feat_workflow_18:
    "**Aurora nebo Minimal, tmavý nebo světlý** — skleněné panely nad pohyblivou oblohou, nebo klidné plné plochy; přepínejte v zápatí. Počítače bez grafické akcelerace dostanou Minimal automaticky",
  feat_workflow_19:
    "**Řádek nabídek v Macu** — v macOS otevřete Nastavení (`Cmd+,`), nastavte limit rychlosti stahování, přepněte styl a motiv a otevřete protokoly nebo uložte diagnostický soubor z řádku nabídek",
  feat_workflow_20:
    "**Změna profilu z libovolného stahování** — upravte stahování a poté aktualizujte profil, ze kterého vzniklo (s náhledem změn), nebo uložte nastavení jako nový profil. Při přepnutí profilu se Arroxy zeptá, zda ponechat vaše úpravy",
  feat_post_h3: "Titulky a následné zpracování",
  feat_post_1:
    "**Titulky** ve formátu SRT, VTT nebo ASS — ruční nebo automaticky generované, v jakémkoli dostupném jazyce",
  feat_post_2:
    "Uložte vedle videa, vložte do `.mkv` nebo uspořádejte do podsložky `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — přeskočte nebo označte kapitolami sponzory, úvody, závěry a vlastní propagaci",
  feat_post_4:
    "**Vložená metadata** — název, datum nahrání, kanál, popis, miniatura a značky kapitol zapsané do souboru",
  feat_post_5:
    "**Dávky pouze s titulky** — vložte seznam URL nebo otevřete playlist, vyberte Titulky a získejte jen soubory titulků ke každému videu",
  feat_sites_h3: "YouTube + 2000 webů",
  feat_sites_1:
    "**YouTube v plném rozsahu** — Videa, Shorts, kanály, playlisty, YouTube Music a podcasty jsou plnohodnotné zdroje",
  feat_sites_2:
    "**Více než 2000 dalších webů** přes yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable a mnoho dalších",
  feat_sites_3:
    "**Pouze zvuk a titulky** fungují na všech podporovaných webech, nejen na YouTube",
  feat_sites_4:
    "Když se web změní, yt-dlp vydává opravy každý týden a Arroxy při spuštění binární soubor automaticky aktualizuje",
  shot1_cap:
    "<b>Domovská obrazovka Rychlého stahování</b><br/>Vložte URL a stáhněte ji okamžitě s aktivním profilem",
  shot2_cap:
    "<b>Opakovaně použitelné profily stahování</b><br/>Uložte předvolby formátu, kvality a výstupu — použijte je při každém stahování",
  shot3_cap:
    "<b>Zvukové stopy ve více jazycích</b><br/>Vyberte přesný jazyk zvuku, ve kterém video vychází",
  shot4_cap:
    "<b>Prostorový zvuk / Dolby</b><br/>Stopy 5.1 a Dolby jsou rozpoznány a zachovány",
  shot5_cap:
    "<b>Režim Hromadné URL</b><br/>Vložte seznam, duplicity se odstraní automaticky, všechny najednou zařaďte do fronty",
  shot6_cap:
    "<b>Paralelní fronta stahování</b><br/>Několik stahování najednou s průběhem naživo",
  hotkey_fig_alt:
    "Globální klávesová zkratka pro stahování v Arroxy — Ctrl+Shift+D ve Windows a Linuxu, Cmd+Shift+D v macOS, zařadí zkopírovaný odkaz přímo do fronty stahování",
  hotkey_fig_cap:
    "<b>Globální klávesová zkratka pro stahování</b><br/>Zkopírujte odkaz kdekoli, stiskněte jednou — skončí ve frontě a začne se stahovat",
  shot7_cap: "<b>Profily playlistu pro jednotlivé položky</b><br/>Dejte každému videu vlastní profil — některá archivujte ve 4K, zbytek uložte jen jako zvuk",
  shot8_cap:
    "<b>Procházení</b><br/>Procházejte YouTube i jakýkoli jiný web přímo v Arroxy a stáhněte stránku, na které jste, se svým aktivním profilem",
  shot9_cap:
    "<b>První obrazovka Procházení</b><br/>Stručný pohled na Procházení a proč je vedlejší účet bezpečnější volbou přihlášení",
  shot10_cap:
    "<b>Stahování vám řekne, co vás potřebuje</b><br/>Odkazy se připravují na pozadí; neúspěšný nabídne řešení, dlouhý playlist čeká na vaši volbu",
  shot11_cap:
    "<b>Stáhněte jen část videa</b><br/>Vyberte začátek a konec nebo kapitolu — Arroxy uloží jen tento úsek",
  shot12_cap:
    "<b>Editor profilu</b><br/>Doladěte profil: typ souboru, rozlišení, titulky, cíl, šablonu názvu souboru a další",
  shot13_cap:
    "<b>Tmavý nebo světlý, sklo nebo plocha</b><br/>Čtyři vzhledy k výběru: skleněné panely nad pohyblivou oblohou nebo klidné plné plochy, každý v tmavé i světlé variantě",
  shot14_cap:
    "<b>8K HDR při 60 fps</b><br/>Každé rozlišení, kodek a stream HDR, které video nabízí, vedle sebe",
  dl_platform_col: "Platforma",
  dl_format_col: "Přímé stažení",
  dl_oneline_note:
    "Sestavení jsou pouze pro x86_64. Nemáte `curl`? Nahraďte `curl -fsSL` příkazem `wget -qO-`.",
  dl_win_scoop:
    "Dáváte přednost Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Instalátor (NSIS) nebo přenosný `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` nebo `.flatpak` (v izolovaném prostředí)",
  dl_grab: "Všechny soubory vydání →",
  dl_pkg_h3: "Instalace přes správce balíčků",
  dl_channel_col: "Kanál",
  dl_command_col: "Příkaz",
  dl_win_h3: "Windows: instalátor, nebo přenosná verze",
  dl_win_col_installer: "Instalátor NSIS",
  dl_win_col_portable: "Přenosný `.exe`",
  dl_win_r1: "Vyžaduje instalaci",
  dl_win_r1_installer: "Ano",
  dl_win_r1_portable: "Ne — spustíte odkudkoli",
  dl_win_r2: "Automatické aktualizace",
  dl_win_r2_installer: "✅ v aplikaci",
  dl_win_r2_portable: "❌ ruční stažení",
  dl_win_r3: "Rychlost spuštění",
  dl_win_r3_installer: "✅ rychlejší",
  dl_win_r3_portable: "⚠️ pomalejší studený start",
  dl_win_r4: "Přidá se do nabídky Start",
  dl_win_r5: "Snadné odinstalování",
  dl_win_r5_portable: "❌ smažte soubor",
  dl_win_rec:
    "**Doporučení:** použijte instalátor NSIS pro automatické aktualizace a rychlejší spuštění. Přenosný `.exe` použijte, pokud chcete variantu bez instalace a bez zápisů do registru.",
  dl_win_smartscreen_h4: "Upozornění Windows SmartScreen",
  dl_win_smartscreen_intro:
    "Při prvním spuštění se může zobrazit **„Systém Windows ochránil váš počítač“** nebo **„Neznámý vydavatel“**. Týká se to souborů `Arroxy-win-x64-Setup.exe` i `Arroxy-win-x64-Portable.exe`. Arroxy je zdarma a s otevřeným zdrojovým kódem a sestavení pro Windows nejsou podepsána placeným certifikátem, proto je SmartScreen označuje. To **automaticky neznamená**, že Arroxy není bezpečné. Postup:",
  dl_win_smartscreen_step1: "Klikněte na **Další informace**.",
  dl_win_smartscreen_step2: "Klikněte na **Přesto spustit**.",
  dl_win_smartscreen_official:
    "Arroxy stahujte jen z oficiální stránky GitHub Releases. Pokud jste soubor získali z jiného webu nebo vám ho někdo poslal, smažte ho a stáhněte si čerstvou kopii z oficiálního zdroje. Zdrojový kód je veřejný, takže jej můžete zkontrolovat nebo si Arroxy sami sestavit.",
  dl_macos_h3: "První spuštění v macOS",
  dl_macos_warning:
    "Arroxy zatím není podepsáno kódem, takže macOS Gatekeeper může při prvním spuštění zobrazit upozornění na poškozenou aplikaci. To je očekávané — neznamená to skutečné poškození souboru.",
  dl_macos_m1_h4: "Postup v Terminálu:",
  dl_macos_step1: "Přetáhněte `Arroxy.app` z připojeného DMG do `/Applications`.",
  dl_macos_step2:
    "Otevřete Terminál a spusťte `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Spusťte `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Pokud je cesta k aplikaci jiná, nahraďte `/Applications/Arroxy.app` cestou, kam jste ji nainstalovali.",
  dl_macos_step5:
    "Pokud `sudo` požádá o heslo, zadejte heslo ke svému Macu.",
  dl_macos_after:
    "Po odstranění karantény se Arroxy otevře normálně.",
  dl_macos_m2_h4: "Postup v Terminálu:",
  dl_macos_note:
    "Sestavení pro macOS vznikají v CI na runnerech Apple Silicon a Intel. Pokud narazíte na potíže, [otevřete hlášení](../../issues) — zpětná vazba od uživatelů macOS aktivně utváří testovací cyklus pro macOS.",
  dl_linux_h3: "První spuštění v Linuxu",
  dl_linux_intro:
    "AppImage se spouští přímo — bez instalace. Stačí soubor označit jako spustitelný.",
  dl_linux_m1_text:
    "**Správce souborů:** klikněte pravým tlačítkem na `.AppImage` → **Vlastnosti** → **Oprávnění** → zapněte **Povolit spouštění souboru jako programu** a poté dvakrát klikněte.",
  dl_linux_m2_h4: "Terminál:",
  dl_linux_fuse_text: "Pokud se spuštění stále nezdaří, spusťte jej bez připojení — není potřeba balíček FUSE:",
  dl_linux_targz_h4: "Prostý tarball (bez FUSE, bez instalace):",
  dl_linux_targz_text: "Sestavení `.tar.gz` je stejná aplikace bez obalu AppImage — rozbalte jej kamkoli a spusťte. Není potřeba instalátor ani balíček FUSE.",
  dl_linux_arch_note: "**Soubory pro Linux na stránce vydání jsou pouze pro x86_64.** Na počítačích ARM64 (Raspberry Pi, Asahi Linux) se Flatpak sice nainstaluje, ale při spuštění selže s chybou `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Proč se může zobrazit upozornění",
  dl_warning_p1:
    "Arroxy má otevřený zdrojový kód a licenci GPLv3. Sestavení pro Windows a macOS **nejsou podepsána kódem** — certifikáty Apple Developer ID a Windows EV stojí každý stovky dolarů ročně, což nezávislý projekt platí z vlastní kapsy. Bez těchto podpisů vás Windows SmartScreen a macOS Gatekeeper při prvním spuštění varují. Upozornění znamenají, že *váš systém vydavatele nezná* — neznamenají, že je Arroxy malware.",
  dl_warning_p2:
    "Tři způsoby, jak si Arroxy sami ověřit, od nejméně po nejpřísnější:\n\n- **Přečtěte si zdrojový kód.** Každý řádek je na [GitHubu](https://github.com/antonio-orionus/Arroxy) a můžete [sestavit aplikaci ze zdrojového kódu](#tech).\n- **Zkontrolujte SHA256.** Porovnejte svůj soubor s publikovaným [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — viz [Ověření stažení](#verify) níže.\n- **Spusťte kontrolu třetí stranou.** Nahrajte soubor na [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "První spuštění ve Windows",
  shot_smartscreen_more_alt:
    "Dialog SmartScreen „Systém Windows ochránil váš počítač“ se zvýrazněným odkazem „Další informace“",
  shot_smartscreen_run_alt:
    "Dialog SmartScreen po rozbalení Dalších informací s tlačítkem „Přesto spustit“",
  dl_win_defender_h4: "Pokud Microsoft Defender soubor označí nebo odstraní",
  dl_win_defender_p:
    "Heuristika Defenderu někdy označí nepodepsané instalátory NSIS a přenosné verze Electronu jako podezřelé. Pokud Defender přesune `Arroxy-win-x64-Setup.exe` nebo `Arroxy-win-x64-Portable.exe` do karantény, obnovte jej v části **Zabezpečení Windows → Ochrana před viry a hrozbami → Historie ochrany** a poté přidejte spustitelný soubor Arroxy jako povolenou položku v části **Spravovat nastavení → Přidat nebo odebrat vyloučení**. Stejně jako u SmartScreen je příčinou chybějící podpis vydavatele, ne zjištěný malware.",

  dl_macos_first_h3: "První spuštění v macOS",
  dl_macos_intro:
    "Sestavení Arroxy pro macOS jsou podepsána ad hoc, ale nejsou notarizována Applem, takže Gatekeeper při prvním spuštění zablokuje otevření hláškou *Aplikaci „Arroxy.app“ nelze otevřít — Apple nemohl ověřit, že „Arroxy.app“ neobsahuje malware*. To znamená, že macOS aplikaci nemůže ověřit u Applu, ne že by se soubory něco stalo. Instalace přes Homebrew se tomuto dialogu zcela vyhne. Pokud jste použili DMG, vyřeší to jeden příkaz v Terminálu:",
  dl_macos_sequoia_h4: "Oprava v Terminálu pro aktuální macOS",
  dl_macos_sequoia_intro:
    "Po zkopírování Arroxy do složky Aplikace použijte Terminál:",
  dl_macos_sequoia_step1:
    "Přetáhněte `Arroxy.app` z připojeného DMG do `/Applications`.",
  dl_macos_sequoia_step2:
    "Otevřete Terminál a spusťte tyto dva příkazy:",
  dl_macos_sequoia_step3:
    "Spusťte `open /Applications/Arroxy.app` a Arroxy se spustí.",
  dl_macos_sequoia_step4:
    "Pokud je cesta k aplikaci jiná, nahraďte `/Applications/Arroxy.app` cestou, kam jste ji nainstalovali.",
  dl_macos_sonoma_h4: "Oprava v Terminálu pro starší macOS",
  dl_macos_sonoma_step1:
    "Přetáhněte `Arroxy.app` z připojeného DMG do `/Applications`.",
  dl_macos_sonoma_step2:
    "Otevřete Terminál a odstraňte karanténu z `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Po odstranění karantény spusťte Arroxy z Terminálu nebo Finderu.",
  dl_macos_damaged_h4:
    "Oprava karantény Gatekeeper",
  dl_macos_damaged_p:
    "První příkaz odstraní atribut karantény, který macOS připojil při stažení souboru; druhý aplikaci spustí. `sudo` obvykle nepotřebujete, protože kopie v `/Applications` patří vám — přidejte jej jen při chybě oprávnění.",
  dl_macos_arch_note:
    "**Apple Silicon, nebo Intel:** na Macu řady M (M1 / M2 / M3 / M4) stáhněte DMG `arm64`. Na Macích Intel stáhněte DMG `x64`. Špatné sestavení stále funguje přes Rosettu, ale je znatelně pomalejší.",

  dl_linux_first_h3: "První spuštění v Linuxu",
  dl_linux_appimagelauncher:
    "**Volitelná integrace do systému:** jednou nainstalujte [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) a každý AppImage, na který dvakrát kliknete, se automaticky zaregistruje do nabídky spouštěče — bez ručního souboru `.desktop`.",

  dl_verify_h3: "Ověření stažení (SHA256)",
  dl_verify_intro:
    "Každé vydání zveřejňuje vedle binárních souborů soubor `SHA256SUMS`. Chcete-li ověřit, že se vaše stažení při přenosu nepoškodilo ani nezměnilo, spočítejte lokálně otisk svého souboru a porovnejte jej s řádkem v `SHA256SUMS`. Otevřete stránku nejnovějšího vydání → **Assets** → stáhněte `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell nebo Příkazový řádek):",
  dl_verify_mac_label: "macOS (Terminál):",
  dl_verify_linux_label: "Linux (Terminál):",
  dl_verify_vt_text:
    "Chcete kontrolu malwaru třetí stranou? Nahrajte soubor na [VirusTotal](https://www.virustotal.com). Několik obecných heuristických upozornění od menších antivirových nástrojů je u nepodepsaných aplikací Electron normální; rozsáhlá zjištění od velkých nástrojů by byla skutečným důvodem k obavám.",

  dl_pm_intro:
    "Dáváte přednost jinému kanálu? I tyto fungují a drží krok s každým vydáním.",

  privacy_p1:
    "Stahování probíhá přímo přes [yt-dlp](https://github.com/yt-dlp/yt-dlp) z YouTube do složky, kterou zvolíte — nic nejde přes server třetí strany. Historie sledování, historie stahování, URL a obsah souborů zůstávají na vašem zařízení.",
  privacy_reports:
    "Žádné sledování — jeden anonymní signál denně (verze aplikace, operační systém, jazyk, kanál instalace, země a přibližná doba od instalace Arroxy), abychom mohli počítat aktivní a nové uživatele, a když Arroxy stahuje nebo aktualizuje yt-dlp a FFmpeg, anonymní informace o tom, zda se to podařilo a přibližně jak dlouho to trvalo. Žádná ID, URL, názvy videí, cesty k souborům ani údaje o účtu. Obojí můžete vypnout v Nastavení.",
  privacy_p3:
    "Procházení uchovává vlastní přihlášení, oddělená od vašeho prohlížeče, a Arroxy nikdy nečte ani nevyplňuje přihlašovací formulář — píšete přímo na stránku webu. Stahování běží nepřihlášené; teprve když některé selže způsobem, který účet vyřeší, Arroxy přihlášení načte znovu, uchová je v dočasném souboru pro dané stahování a soubor poté smaže. Odhlášením z Procházení v Nastavení se přihlášení zapomenou.",
  faq_q1: "Je to opravdu zdarma?",
  faq_a1: "Ano — licence GPLv3, bez prémiové verze, bez uzamčených funkcí.",
  faq_q11: "Čím se Arroxy liší od jiných grafických rozhraní pro yt-dlp?",
  faq_a11:
    "Většina bezplatných grafických rozhraní pro yt-dlp jsou obaly, které berou jen odkaz. Arroxy přidává **Procházení**, prohlížeč zabudovaný v aplikaci, který otevře YouTube i jakýkoli jiný web: procházíte a stahujete bez kopírování odkazů a jednou se tam přihlásíte, abyste mohli stahovat videa, která váš účet smí přehrát, například soukromá videa a seznamy Podívat se později a Označeno „To se mi líbí“, bez exportu cookies. Viz [Proč Arroxy](#why).",
  faq_q2: "Jaké kvality videa mohu stáhnout?",
  faq_a2:
    "Cokoli, co YouTube nabízí: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, a také samotný zvuk. Streamy 60 fps a HDR se zachovají beze změny a stahování krok za krokem umožňuje vybrat AV1, VP9 nebo H.264 v každém rozlišení.",
  faq_q3: "Mohu extrahovat jen zvuk jako MP3?",
  faq_a3:
    "Ano. V nabídce formátu vyberte *pouze zvuk* a zvolte MP3, M4A/AAC, Opus nebo WAV.",
  faq_q4: "Jak stáhnu videa, která vyžadují účet YouTube?",
  faq_a4:
    "Jednou se přihlaste na kartě Procházení. Arroxy pak může stahovat videa, která váš účet smí přehrát: soukromá videa, videa s věkovým omezením, pokud má účet ověřený věk, a vaše seznamy Podívat se později a Označeno „To se mi líbí“. Přihlášení použije, jen když stahování selže způsobem, který účet vyřeší; vše ostatní se stahuje jako dřív. Jde o volbu **Přihlášení v Procházení**, která je v nastavení cookies uvedena první a označena jako Doporučeno, a Arroxy ji pro vás zvolí při prvním otevření Procházení. Wiki yt-dlp uvádí, že [automatizace s přihlášením může vést k označení účtu Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), takže bezpečnější volbou je vedlejší účet.",
  faq_q5: "Bude to fungovat, i když YouTube něco změní?",
  faq_a5:
    "yt-dlp se při spuštění aktualizuje automaticky a Arroxy rychle vydává opravy, když YouTube něco změní. Když stahování vyžaduje přihlášení, Arroxy použije vaše přihlášení z Procházení, pokud jste se tam přihlásili, a v nastavení cookies jsou k dispozici cookies ze souboru nebo z vašeho prohlížeče.",
  faq_q6: "V jakých jazycích je Arroxy dostupné?",
  faq_a6:
    "{{LANG_COUNT}} jazyků hned po instalaci: {{LANG_NAME_LIST}}. Arroxy při prvním spuštění automaticky zjistí jazyk vašeho operačního systému a kdykoli jej můžete přepnout ve výběru jazyka na panelu nástrojů. Soubory JSON s jazykovými verzemi pro běh aplikace jsou v src/shared/i18n/locales/ a katalogy PO pro překladatele v i18n/locales/ — přispět můžete otevřením PR na GitHubu.",
  faq_q7: "Musím instalovat ještě něco dalšího?",
  faq_a7:
    "Ne. yt-dlp, ffmpeg a ffprobe se při prvním spuštění stáhnou automaticky a uloží do mezipaměti ve vašem počítači. Poté už není potřeba žádné další nastavení.",
  faq_q8: "Mohu stahovat playlisty nebo celé kanály?",
  faq_a8:
    "Ano — obojí. Vložte URL playlistu nebo kanálu (např. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); zvolte, kolik položek se má projít, a poté zařaďte do fronty celý seznam nebo vyberte konkrétní videa. Filtry podle rozsahu dat připravujeme.",
  faq_q9: "macOS hlásí, že „aplikace je poškozená“ — co mám dělat?",
  faq_a9:
    "To macOS Gatekeeper blokuje nepodepsanou aplikaci, nejde o skutečné poškození. Příkazy pro Terminál, které odstraní karanténu a spustí Arroxy, najdete v části [První spuštění v macOS](#macos-first-launch).",
  faq_q10: "Je stahování videí z YouTube legální?",
  faq_a10:
    "Záleží na vaší zemi a na tom, co stahujete. Stahujte jen obsah, který vlastníte, obsah licencovaný ke stahování nebo obsah, který zákon ve vaší zemi dovoluje kopírovat. Za dodržování [Smluvních podmínek](https://www.youtube.com/t/terms) YouTube a místních autorských zákonů odpovídáte vy. Viz [Podmínky použití](#terms).",
  plan_intro: "Stále plánováno — zhruba v pořadí podle priority:",
  plan_col1: "Funkce",
  plan_col2: "Popis",
  plan_r1_name: "**Filtry playlistů a kanálů**",
  plan_r1_desc: "Filtry podle rozsahu dat při výpisu playlistu nebo kanálu",
  plan_r2_name: "**Předvolby zvukové stopy YouTube**",
  plan_r2_desc:
    "Nastavení preference jazyka mluvené stopy pro celou aplikaci, s přepsáním pro jednotlivé profily, když YouTube nabízí více zvukových stop",
  plan_r3_name: "**Lepší obnova po opakování**",
  plan_r3_desc:
    "Nový postup opakování pro stahování přerušená nespolehlivým nebo problematickým připojením k internetu",
  plan_r4_name: "**Plnohodnotný panel správce stahování**",
  plan_r4_desc:
    "Proměnit panel fronty v plnohodnotnějšího správce, včetně změny cílových složek u položek ve frontě",
  plan_r5_name: "**Plánovaná stahování**",
  plan_r5_desc: "Spuštění fronty v zadaný čas (noční běhy)",
  plan_r9_name: "**Balíček AUR**",
  plan_r9_desc: "Instalace na Arch Linux a Omarchy pomocí `yay -S arroxy-bin`",
  plan_cta:
    "Máte nápad na funkci? [Otevřete požadavek](../../issues) — názory komunity utvářejí prioritu.",
  tech_content: TECH_CONTENT,
  support_h2: "Podpořte Arroxy",
  support_line: "Arroxy je zdarma a s licencí GPLv3 — bez reklam, bez sledování, bez placené verze. Pokud vám šetří čas, můžete vývoj podpořit Bitcoinem, Tronem nebo Ethereem: adresy jsou v [DONATE.md](DONATE.md), což je jediný oficiální zdroj. Arroxy vám adresu nikdy nepošle e-mailem ani přímou zprávou. Stejně tak pomáhá hvězdička u repozitáře, hlášení chyb a zlepšování překladů.",
  tos_h2: "Podmínky použití",
  tos_note:
    "Arroxy je nástroj určený výhradně k osobnímu, soukromému použití. Sami odpovídáte za to, že vaše stahování je v souladu se [Smluvními podmínkami](https://www.youtube.com/t/terms) YouTube a autorskými zákony vaší jurisdikce. Nepoužívejte Arroxy ke stahování, reprodukci ani šíření obsahu, k jehož použití nemáte právo. Vývojáři neodpovídají za žádné zneužití.",
  footer_credit:
    'GPLv3 · Vytvořeno s péčí uživatelem <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
