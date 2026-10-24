const TECH_CONTENT = `<details>
<summary><strong>Technológiák</strong></summary>

- **Electron** — platformfüggetlen asztali keretrendszer
- **React 19** + **TypeScript** — felhasználói felület
- **Tailwind CSS v4** — stílusok
- **Zustand** — állapotkezelés
- **yt-dlp** + **ffmpeg** — letöltő- és muxolómotor (mindkettő futásidőben töltődik le: a yt-dlp naprakészen marad, az ffmpeg/ffprobe egyszer települ, és a frissítések után is megmarad)
- **Vite** + **electron-vite** — buildeszközök
- **Vitest** + **Playwright** — egység- és végpontok közötti tesztek

</details>

<details>
<summary><strong>Fordítás forráskódból</strong></summary>

### Előfeltételek — minden platformon

| Eszköz  | Verzió  | Telepítés |
| ------- | ------- | ------- |
| Git     | bármely | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` vagy \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` vagy \`package.json\` \`packageManager\` |

Ajánlott: telepítse a \`mise\`-t, majd futtassa a \`mise install\` parancsot a checkoutban. Mise nélkül a \`bun run bootstrap\` előtt kézzel aktiválja a Node.js-t a \`.node-version\`, a Bunt pedig a \`package.json\` alapján.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

A natív újrafordításokhoz szükség lehet a Visual Studio Build Tools és a Python telepítésére.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Klónozás után futtassa a \`mise trust && mise install\` parancsot a checkoutban. Ha a shell már \`fnm\`-et, \`nvm\`-et vagy Homebrew-s Bunt használ, aktiválja a mise-t a \`~/.zshrc\` fájlban, hogy az Arroxy a Node.js 24.21.0 és a Bun 1.4.2 verziót kapja:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build + Electron futásidejű függőségek
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Csak E2E-tesztekhez (az Electronnak kijelző kell)
sudo apt install -y xvfb
\`\`\`

### Klónozás és futtatás

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # ajánlott; kihagyható, ha kézzel aktiválta a rögzített eszközöket
bun run bootstrap
bun run doctor
bun run dev            # Electron-alkalmazás a Vite rendererrel
\`\`\`

### Terjeszthető csomag készítése

\`\`\`bash
bun run build        # típusellenőrzés + fordítás
bun run dist         # csomagolás az aktuális operációs rendszerre
bun run dist:win     # Windows-célok csomagolása támogatott gépen futtatva
\`\`\`

> A \`bun run bootstrap\` telepíti a függőségeket, újrafordítja az Electron-alkalmazás függőségeit, ellenőrzi az Electront, előkészíti a fejlesztéshez beágyazott ffmpeg/ffprobe-ot, és telepíti a Playwright Chromiumot. A kiadási buildek a yt-dlp-t, az ffmpeg-et és az ffprobe-ot futásidőben, az alkalmazásadatok mappájában kezelik; egyik sem kerül a telepítőbe.

</details>`;

export const hu = {
  icon_alt: "Az Arroxy kabalája",
  hero_image_alt: "Illesszen be egy hivatkozást, vagy egyszerűen böngésszen. Az Arroxy URL-képernyője és beépített böngészője, folyamatban lévő letöltéssel.",
  title:
    "Arroxy — Ingyenes, nyílt forráskódú YouTube- (+ 2000 webhely) letöltő beépített böngészővel Windowsra, macOS-re és Linuxra",
  read_in_label: "Olvassa el ezen a nyelven:",
  badge_release_alt: "Kiadás",
  badge_build_alt: "Build",
  badge_license_alt: "Licenc",
  badge_platforms_alt: "Platformok",
  badge_i18n_alt: "Nyelvek",
  badge_website_alt: "Webhely",
  discord_badge_text: "Csatlakozzon a Discord--közösséghez",
  discord_badge_encoded: "Csatlakozzon%20a%20Discord--k%C3%B6z%C3%B6ss%C3%A9ghez",
  hero_desc:
    "Töltsön le videókat, Shortsokat, csatornákat, podcastokat vagy hangsávokat a **YouTube-ról és 2000+ támogatott webhelyről** — akár 8K HDR-ben 60 fps-sel, MP3 / AAC / Opus formátumban, vagy csak a szükséges részt. **Böngésszen a YouTube-on vagy bármely más webhelyen közvetlenül az Arroxyban** a Felfedezés lapon, és töltse le az éppen nézett videót, lejátszási listát vagy csatornát; jelentkezzen be ott, hogy olyan videókat is letölthessen, amelyeket a fiókja már megnézhet. Helyben fut Windowson, macOS-en és Linuxon. **Nincs reklám, nincs felesleges ballaszt, nincs kéretlen ajánlat.**",
  cta_latest: "↓ A legújabb kiadás telepítése",
  cta_website: "Webhely",
  website_url: "https://arroxy.com/",
  star_cta: "Ha az Arroxy időt spórol Önnek, egy ⭐ segít másoknak megtalálni.",
  ai_notice: "> 🌐 Ez a fordítás MI támogatásával készült. Az [angol README](README.md) az irányadó forrás. Hibát talált? [Nyisson egy PR-t](../../pulls).",
  intro_what_is:
    "**Mi az Arroxy?** Az Arroxy egy ingyenes, nyílt forráskódú asztali grafikus felület, amely videókat, hangot, lejátszási listákat és feliratokat tölt le a YouTube-ról és 2000+ további, a [yt-dlp](https://github.com/yt-dlp/yt-dlp) által támogatott webhelyről. Windows 10/11, macOS 13+ (Intel + Apple Silicon) és Linux (AppImage, Flatpak, tar.gz) rendszeren fut. GPLv3 licenc alatt. Nincs reklám, nincs használati korlát. Terjesztés: [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage és közvetlen letöltés.",
  intro_key_difference:
    "**Fő különbség: beépített böngésző.** A legtöbb ingyenes YouTube-letöltő a yt-dlp vékony burkolója: egy URL-mező és egy formátumválasztó menü, saját böngésző nélkül. Az Arroxyban van egy, a **Felfedezés lap**. Az alkalmazáson belül böngészik a YouTube-on vagy bármely más webhelyen, és letölti az éppen nézett videót, lejátszási listát vagy csatornát, vagy jobb gombbal kattint bármely hivatkozásra. Ha egyszer bejelentkezik a Felfedezésben, a fiókot igénylő letöltések ezt a bejelentkezést használják: a privát videói, a Megnézendő és a Kedvelt listái, valamint más videók, amelyeket a fiókja már megnézhet, sütik exportálása nélkül. Más webhelyekre is bejelentkezhet ott, és azok letöltései ezt a bejelentkezést használják, ha szükséges. Részletek: [Miért az Arroxy](#why-explore).",
  last_updated: "Utolsó frissítés: {{LAST_UPDATED}}.",
  toc_heading: "Tartalom",
  why_h2: "Miért az Arroxy",
  features_h2: "Funkciók",
  dl_h2: "Telepítés és első indítás",
  privacy_h2: "Adatvédelem",
  faq_h2: "GYIK",
  roadmap_h2: "Ütemterv",
  tech_h2: "Ezzel készült",
  why_intro: "Összehasonlítás a leggyakoribb alternatívákkal:",
  why_r1: "Ingyenes, nincs prémium szint",
  why_r2: "Nyílt forráskód",
  why_r3: "Kizárólag helyi feldolgozás",
  why_r5: "Nincsenek használati korlátok",
  why_r6: "Platformfüggetlen asztali alkalmazás",
  why_r7: "Feliratok + SponsorBlock",
  why_r8: "Beépített böngésző (böngészés, bejelentkezés, letöltés)",
  why_r9: "Olyan videók, amelyeket a fiókja megnézhet, sütik exportálása nélkül",
  why_table_note:
    "⚠️ = részben, vagy csak fizetős szinten. A 4K Video Downloader alkalmazáson belüli bejelentkezése a privát videókhoz fizetős funkció; a legtöbb ingyenes yt-dlp-grafikus felület csak sütifájlt fogad el, vagy a webböngészője sütijeit olvassa.",
  why_summary:
    "Az Arroxy egyetlen dologra készült: egy tiszta, helyi fájlra, akár URL-t illeszt be, akár a Felfedezésben találja meg a videót. Nincsenek kéretlen ajánlatok, nincs adatgyűjtés.",
  why_explore_h3: "Amire egy egyszerű yt-dlp-burkoló nem képes: a Felfedezés lap",
  why_explore_intro:
    "A legtöbb ingyenes YouTube-letöltő egy URL-mező a yt-dlp tetején. Az Arroxy is a yt-dlp-t használja, de van egy **Felfedezése** is: egy az alkalmazásba épített böngésző, amely megnyitja a YouTube-ot vagy bármely más webhelyet. A Felfedezés azt adja hozzá, amit egy URL-mező nem tud:",
  why_explore_1:
    "**Olyan videók, amelyeket a fiókja megnézhet, sütik exportálása nélkül** — a privát videói, a Megnézendő és a Kedvelt listái, a korhatáros videók korhatár-ellenőrzött fiókkal, valamint más webhelyek bejelentkezést igénylő oldalai. Egy egyszerű burkolónak cookies.txt-exportra van szüksége, vagy a webböngésző sütijeit kell olvasnia. Az Arroxyban egyszer bejelentkezik a Felfedezésben, a többit az Arroxy elvégzi",
  why_explore_4:
    "**Nincs hivatkozásmásolás** — keressen meg egy videót, lejátszási listát vagy csatornát a Felfedezésben, és töltse le egy kattintással, vagy kattintson jobb gombbal bármely hivatkozásra az oldalon",
  why_explore_5:
    "**Hirdetésblokkoló, ha kell** — egy kattintás a pajzsra letiltja a hirdetéseket és a nyomkövetőket a Felfedezés oldalain",
  feat_explore_h3: "Felfedezés: böngészés az interneten az Arroxyban",
  feat_explore_1:
    "**Felfedezés lap** — böngésszen a YouTube-on vagy bármely más webhelyen az Arroxyban, és töltse le a talált tartalmat hivatkozások másolása nélkül. A **Letöltés · *a profilja*** sorba állítja a nézett videót, lejátszási listát vagy csatornát; a mellette lévő nyíl profilt vált, a varázspálca pedig megnyitja a lépésenkénti letöltést a formátumok, feliratok és egyebek kiválasztásához",
  feat_explore_6:
    "**Jobb kattintásos letöltés** — kattintson jobb gombbal bármely videó-, lejátszási lista- vagy csatornahivatkozásra a Felfedezésben, hogy letöltse a profiljával, válasszon másik profilt a **Letöltés ezzel:** menüből, nyissa meg a lépésenkénti letöltést, vagy másolja a hivatkozást. Nem kell előbb megnyitni az egyes videókat",
  feat_explore_7:
    "**Kompakt elrendezés** — egy kattintás a Felfedezés eszköztárán áthelyezi az Arroxy lapjait az eszköztárba, és több helyet ad az oldalnak",
  feat_explore_2:
    "**Címsor** — írjon be keresést a YouTube-on, vagy adjon meg bármilyen webcímet az adott webhely megnyitásához",
  feat_explore_3:
    "**Fiókot igénylő letöltések** — jelentkezzen be egyszer a Felfedezésben, és az Arroxy letöltheti azokat a videókat, amelyeket a fiókja megnézhet: a privát videóit, a korhatáros videókat, ha a fiók korhatár-ellenőrzött, valamint a Megnézendő és a Kedvelt listáit. Más webhelyekre is bejelentkezhet ott, és azok letöltései ezt a bejelentkezést használják, ha szükséges. Az Arroxy továbbra is előbb kijelentkezve tölt le, és csak akkor használja a Felfedezés-bejelentkezést, ha a letöltés olyan módon hibásodik meg, amit egy fiók orvosolhat",
  feat_explore_4:
    "**Használjon másodlagos fiókot** — a Felfedezés első képernyője elmagyarázza az okát: a fiókkal való letöltés kockázatot hordoz, hogy a fiókot korlátozzák. A Beállításokban bármikor kijelentkezhet a Felfedezésből, hogy elfelejtse a bejelentkezéseit",
  feat_explore_5:
    "**Hirdetésblokkoló** — alapból ki van kapcsolva. Egy kattintás a pajzsra a Felfedezés eszköztárán letiltja a hirdetéseket és a nyomkövetőket az oldalain, a letöltéseket nem érintve. A YouTube ellenállhat a hirdetésblokkolóknak a bejelentkezett fiókoknál",
  feat_quality_h3: "Minőség és formátumok",
  feat_quality_1: "Akár **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Magas képkockasebesség és HDR** változatlanul megőrizve — 60 fps, HDR10",
  feat_quality_3:
    "**Hang** — exportáljon csak hangot MP3, M4A/AAC, Opus vagy WAV formátumban. Az interaktív letöltésekben válassza ki a forrás eredeti térhatású/Dolby hangsávjait (AC-3, E-AC-3, 5.1, DRC), ha elérhetők, vagy állítson be globális **Térhatású / Dolby előnyben** alapértelmezést",
  feat_quality_4:
    "**Célhoz kötött profilok** — *Legjobb kép* (AV1 · VP9) vagy *Okostévé* (MP4 · H.264), mentve Automatikus, MP4, MKV vagy WebM formátumban újrakódolás nélkül. A HDR lehet *Automatikus* (csak ha a képernyő meg tudja jeleníteni), *SDR* vagy *HDR*",
  feat_quality_5:
    "**Minden kodek minden felbontásban** — a lépésenkénti letöltés egymás mellett listázza az AV1-et, a VP9-et és a H.264-et minden felbontásnál, így kiválaszthatja azt, amelyet a tévéje vagy a szerkesztője lejátszik",
  feat_quality_6:
    "**Tudja meg, mi valójában egy adatfolyam** — megjelöli a YouTube által MI-vel felskálázott méreteket, az MI-vel szinkronizált hangnyelveket, a megnövelt bitrátájú adatfolyamokat, a 360°-os videókat, valamint a sérült vagy vízjeles példányokat. A profilok kihagyják az MI-vel felskálázott adatfolyamokat, hacsak nem engedélyezi őket",
  feat_privacy_h3: "Adatvédelem és felügyelet",
  feat_privacy_1:
    "100%-ban helyi feldolgozás — a letöltések közvetlenül a YouTube-ról a lemezre kerülnek",
  feat_privacy_2: "**Nyílt forráskód** — minden sor ellenőrizhető, GPLv3 licenc alatt",
  feat_privacy_3: "A fájlok közvetlenül a kiválasztott mappába kerülnek",
  feat_workflow_h3: "Munkafolyamat",
  feat_workflow_12:
    "**Globális letöltési gyorsbillentyű** — másoljon ki egy hivatkozást bármely alkalmazásban, és nyomja meg a `Ctrl+Shift+D` billentyűparancsot (macOS-en `Cmd+Shift+D`); az Arroxy az aktív profillal sorba állítja az ablak megnyitása nélkül, és értesítés jelzi. Alapból be van kapcsolva, átállítható",
  feat_workflow_1:
    "**Rugalmas indítási módok** — válasszon vezetett egyedi letöltést, lejátszási lista/csatorna választót, tömeges URL-beillesztést, Gyorsletöltést mentett alapértelmezésekkel, vagy böngésszen és töltsön le a Felfedezésből",
  feat_workflow_2:
    "**Központi letöltési sor** — minden egyedi, lejátszási listás, tömeges vagy gyors feladat egy helyre kerül a haladás, a szüneteltetés, a folytatás, a megszakítás, az újrapróbálás és a prioritáskezelés számára",
  feat_workflow_3:
    "**Vágólap figyelése** — másoljon ki egy videóhivatkozást, és az Arroxyba visszatérve kitölti az URL-mezőt, **Visszavonás** lehetőséggel, ha nem ezt akarta. Amíg az Arroxy elfoglalt, a hivatkozás vár, amíg vissza nem tér az URL lapra (a Beállításokban kikapcsolható)",
  feat_workflow_4:
    "**Automatikus URL-tisztítás** — eltávolítja a követőparamétereket (`si`, `pp`, `utm_*`, `fbclid`, `gclid`), és feloldja a `youtube.com/redirect` hivatkozásokat",
  feat_workflow_5:
    "**Tálcamód** — az ablak bezárása után a letöltések a háttérben tovább futnak",
  feat_workflow_6:
    "**{{LANG_COUNT}} nyelv** — automatikusan felismeri a rendszer nyelvét, bármikor váltható",
  feat_workflow_7:
    "**Lejátszási lista szinkronizálása** — vizsgálja át újra a lejátszási listát egy helyi mappával szemben, hogy kihagyja a már letöltött videókat; `.m3u` lejátszásilista-fájlt készít, amely minden videó letöltésekor frissül",
  feat_workflow_8:
    "**Sebesség- és ütemezésvezérlők** — korlátozza a letöltési sávszélességet, állítsa be, hány részt tölt le egyszerre egy videóból, és adjon hozzá kéréskésleltetést előbeállításokkal (*Ki · Kiegyensúlyozott · Óvatos · Egyéni*)",
  feat_workflow_9:
    "**Fájlnévsablonok** — nevezze el a letöltéseket saját ízlése szerint a `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` és `{playlist_index}` tokenekkel, globálisan vagy letöltési profilonként",
  feat_workflow_10:
    "**Egyidejű letöltések és automatikus újrapróbálás** — válassza ki, hány sorba állított letöltés fusson egyszerre, és hagyja, hogy az Arroxy újrapróbálja a hálózati vagy kiszolgálói problémába ütköző letöltést, minden kísérlet előtt egyre hosszabb ideig várva",
  feat_workflow_11:
    "**Lejátszásilista-elemenkénti profilok** — rendeljen a lejátszási lista minden videójához saját letöltési profilt a teljes listára vonatkozó egyetlen beállítás helyett, így egyetlen menetben egyeseket teljes minőségben archiválhat, a többit pedig csak hangként mentheti",
  feat_workflow_13:
    "**A Gyorsletöltés a háttérben működik** — a hivatkozás azonnal megjelenik a Letöltésekben, és ott készül elő, a **Megtekintés** gombos értesítés jelzi, az URL-mező pedig kiürül a következő hivatkozásnak. Indítson el annyit, amennyit szeretne, amíg a korábbiak előkészülnek",
  feat_workflow_14:
    "**A Letöltések megmondja, mi igényli Önt** — ha az Arroxy nem tudja beolvasni a hivatkozást, a sora megmondja az okot, és felajánlja a javítást: Újra, sütik bekapcsolása vagy bejelentkezés a Felfedezésben. Kikapcsolt sütiknél a **Bejelentkezés a Felfedezéssel** újrapróbálja Ön helyett, amint bejelentkezett. A betöltési korlátnál hosszabb lejátszási lista a sorában várja, hogy válasszon: az egészet, az első elemeket vagy egy áttekintést. A Letöltések lap megszámolja az Önre váró sorokat",
  feat_workflow_15:
    "**Csak a videó egy részének letöltése** — válasszon kezdetet és véget vagy egy fejezetet a Formátum képernyőn, és az Arroxy csak azt a tartományt menti, a videóazonosító után a tartománnyal elnevezve. A vágások a legközelebbi kulcsképkockára esnek; kapcsolja be a pontos vágást az újrakódoláshoz",
  feat_workflow_16:
    "**Befejezett letöltések eltávolítása** — nem kötelező: a befejezett letöltés 5 másodperc múlva eltűnik a listáról. A fájlok a lemezen maradnak, a sikertelen letöltések pedig a listán",
  feat_workflow_17:
    "**Méret és Hiányzik a Letöltésekben** — a rendezhető **Méret** oszlop megmutatja, mennyi helyet foglal az egyes letöltés, a **Hiányzik** pedig megjelöli az Arroxyn kívül áthelyezett vagy törölt fájlokat",
  feat_workflow_18:
    "**Aurora vagy Minimal, sötét vagy világos** — üvegpanelek mozgó égbolt fölött, vagy nyugodt, tömör felületek; a láblécben válthat. A grafikus gyorsítás nélküli számítógépek automatikusan Minimalt kapnak",
  feat_workflow_19:
    "**Mac menüsor** — macOS-en nyissa meg a Beállításokat (`Cmd+,`), állítsa be a letöltési sebességkorlátot, váltson stílust és témát, nyissa meg a naplókat vagy mentsen diagnosztikai fájlt a menüsorból",
  feat_workflow_20:
    "**Profil módosítása bármely letöltésből** — finomhangoljon egy letöltést, majd frissítse a profilt, amelyből indult (a változások előnézetével), vagy mentse a beállításokat új profilként. A profilváltás megkérdezi, megtartja-e a módosításokat",
  feat_post_h3: "Feliratok és utófeldolgozás",
  feat_post_1:
    "**Feliratok** SRT, VTT vagy ASS formátumban — kézi vagy automatikusan generált, bármely elérhető nyelven",
  feat_post_2:
    "Mentés a videó mellé, beágyazás `.mkv`-be, vagy rendezés `Subtitles/` almappába",
  feat_post_3:
    "**SponsorBlock** — szponzorok, bevezetők, zárások, önreklámok átugrása vagy fejezetként jelölése",
  feat_post_4:
    "**Beágyazott metaadatok** — a cím, a feltöltés dátuma, a csatorna, a leírás, a miniatűr és a fejezetjelölők a fájlba íródnak",
  feat_post_5:
    "**Csak feliratos kötegek** — illesszen be URL-listát vagy nyisson meg egy lejátszási listát, válassza a Feliratok lehetőséget, és csak a feliratfájlokat kapja meg minden videóhoz",
  feat_sites_h3: "YouTube + 2000 webhely",
  feat_sites_1:
    "**A YouTube teljes körűen** — Videók, Shorts, Csatornák, Lejátszási listák, YouTube Music és Podcastok elsőrangú forrásként kezelve",
  feat_sites_2:
    "**2000+ más webhely** a yt-dlp-n keresztül — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable és sok más",
  feat_sites_3:
    "**Csak hang és feliratok** minden támogatott webhelyen működik, nem csak a YouTube-on",
  feat_sites_4:
    "Ha egy webhely megváltozik, a yt-dlp hetente ad ki javításokat, az Arroxy pedig induláskor automatikusan frissíti a binárist",
  shot1_cap:
    "<b>Gyorsletöltés kezdőlap</b><br/>Illesszen be egy URL-t, és azonnal töltse le az aktív profillal",
  shot2_cap:
    "<b>Újrahasználható letöltési profilok</b><br/>Mentsen formátum-, minőség- és kimeneti előbeállításokat — használja újra letöltésenként",
  shot3_cap:
    "<b>Többnyelvű hangsávok</b><br/>Válassza ki a videóhoz tartozó pontos hangnyelvet",
  shot4_cap:
    "<b>Térhatású / Dolby hang</b><br/>Az 5.1-es és a Dolby hangsávok felismerve és megőrizve",
  shot5_cap:
    "<b>Tömeges URL mód</b><br/>Illesszen be egy listát, automatikus ismétlődés-szűrés, és az összeset egyszerre sorba állíthatja",
  shot6_cap:
    "<b>Párhuzamos letöltési sor</b><br/>Több letöltés egyszerre, élő haladással",
  hotkey_fig_alt:
    "Az Arroxy globális letöltési gyorsbillentyűje — Ctrl+Shift+D Windowson és Linuxon, Cmd+Shift+D macOS-en, a kimásolt hivatkozást közvetlenül a letöltési sorba küldve",
  hotkey_fig_cap:
    "<b>Globális letöltési gyorsbillentyű</b><br/>Másoljon ki egy hivatkozást bárhol, nyomja meg egyszer — a sorba kerül, és elindul a letöltés",
  shot7_cap: "<b>Lejátszásilista-elemenkénti profilok</b><br/>Adjon minden videónak saját profilt — egyeseket archiváljon 4K-ban, a többit mentse csak hangként",
  shot8_cap:
    "<b>Felfedezés</b><br/>Böngésszen a YouTube-on vagy bármely más webhelyen az Arroxyban, és töltse le az éppen nézett oldalt az aktív profillal",
  shot9_cap:
    "<b>A Felfedezés első képernyője</b><br/>Rövid bemutató a Felfedezésről, és arról, miért biztonságosabb a másodlagos fiókkal való bejelentkezés",
  shot10_cap:
    "<b>A Letöltések megmondja, mi igényli Önt</b><br/>A hivatkozások a háttérben készülnek elő; a sikertelen felajánlja a javítást, a hosszú lejátszási lista a választására vár",
  shot11_cap:
    "<b>Csak a videó egy részének letöltése</b><br/>Válasszon kezdetet és véget vagy egy fejezetet — az Arroxy csak azt a tartományt menti",
  shot12_cap:
    "<b>Profilszerkesztő</b><br/>Hangolja a profilt: fájltípus, felbontás, feliratok, célmappa, fájlnévsablon és egyebek",
  shot13_cap:
    "<b>Sötét vagy világos, üveg vagy tömör</b><br/>Négy megjelenés közül választhat: üvegpanelek mozgó égbolt fölött vagy nyugodt, tömör felületek, mindegyik sötét és világos változatban",
  shot14_cap:
    "<b>8K HDR 60 fps-sel</b><br/>A videó által kínált minden felbontás, kodek és HDR-adatfolyam egymás mellett",
  dl_platform_col: "Platform",
  dl_format_col: "Közvetlen letöltés",
  dl_oneline_note:
    "A buildek csak x86_64-esek. Nincs `curl`? Cserélje a `curl -fsSL` parancsot `wget -qO-`-ra.",
  dl_win_scoop:
    "Inkább a Scoopot szereti? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Telepítő (NSIS) vagy hordozható `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` vagy `.flatpak` (homokozóban)",
  dl_grab: "Az összes kiadási fájl →",
  dl_pkg_h3: "Telepítés csomagkezelővel",
  dl_channel_col: "Csatorna",
  dl_command_col: "Parancs",
  dl_win_h3: "Windows: Telepítő vagy hordozható",
  dl_win_col_installer: "NSIS-telepítő",
  dl_win_col_portable: "Hordozható `.exe`",
  dl_win_r1: "Telepítés szükséges",
  dl_win_r1_installer: "Igen",
  dl_win_r1_portable: "Nem — bárhonnan futtatható",
  dl_win_r2: "Automatikus frissítések",
  dl_win_r2_installer: "✅ az alkalmazásban",
  dl_win_r2_portable: "❌ kézi letöltés",
  dl_win_r3: "Indulási sebesség",
  dl_win_r3_installer: "✅ gyorsabb",
  dl_win_r3_portable: "⚠️ lassabb hidegindítás",
  dl_win_r4: "Felkerül a Start menübe",
  dl_win_r5: "Egyszerű eltávolítás",
  dl_win_r5_portable: "❌ törölje a fájlt",
  dl_win_rec:
    "**Javaslat:** használja az NSIS-telepítőt az automatikus frissítésekhez és a gyorsabb induláshoz. A hordozható `.exe` telepítés és beállításjegyzék-bejegyzés nélküli megoldás.",
  dl_win_smartscreen_h4: "Windows SmartScreen figyelmeztetés",
  dl_win_smartscreen_intro:
    'Az első indításkor megjelenhet a **„A Windows megvédte a számítógépét”** vagy az **„Ismeretlen közzétevő”** üzenet. Ez mind az `Arroxy-win-x64-Setup.exe`, mind az `Arroxy-win-x64-Portable.exe` fájlra vonatkozik. Az Arroxy ingyenes és nyílt forráskódú, a Windows-buildek pedig nincsenek fizetős tanúsítvánnyal kódaláírva, ezért jelzi őket a SmartScreen. Ez **nem** jelenti automatikusan, hogy az Arroxy nem biztonságos. A folytatáshoz:',
  dl_win_smartscreen_step1: "Kattintson a **További információ** lehetőségre.",
  dl_win_smartscreen_step2: "Kattintson a **Futtatás mindenképpen** gombra.",
  dl_win_smartscreen_official:
    "Az Arroxyt csak a hivatalos GitHub Releases oldalról töltse le. Ha a fájlt másik webhelyről szerezte, vagy valaki elküldte Önnek, törölje, és töltsön le egy friss példányt a hivatalos forrásból. A forráskód nyilvános, így megvizsgálhatja, vagy ha szeretné, maga is lefordíthatja az Arroxyt.",
  dl_macos_h3: "Első indítás macOS-en",
  dl_macos_warning:
    "Az Arroxy még nincs kódaláírva, ezért a macOS Gatekeeper az első indításkor megjelenítheti a sérült alkalmazásra vonatkozó figyelmeztetést. Ez várható — nem a fájl tényleges sérülését jelzi.",
  dl_macos_m1_h4: "Terminálos módszer:",
  dl_macos_step1: "Húzza az `Arroxy.app` fájlt a csatolt DMG-ből az `/Applications` mappába.",
  dl_macos_step2:
    "Nyissa meg a Terminált, és futtassa: `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Futtassa: `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Ha az alkalmazás elérési útja más, cserélje az `/Applications/Arroxy.app` részt a telepítés helyére.",
  dl_macos_step5:
    "Adja meg a Mac jelszavát, ha a `sudo` kéri.",
  dl_macos_after:
    "A karantén eltávolítása után az Arroxy normálisan megnyílik.",
  dl_macos_m2_h4: "Terminálos módszer:",
  dl_macos_note:
    "A macOS-buildek CI-n készülnek Apple Silicon és Intel futtatókon. Ha problémába ütközik, [nyisson egy hibajegyet](../../issues) — a macOS-felhasználók visszajelzései aktívan alakítják a macOS-tesztelési ciklust.",
  dl_linux_h3: "Első indítás Linuxon",
  dl_linux_intro:
    "Az AppImage-ek közvetlenül futnak — telepítés nélkül. Csak futtathatóként kell megjelölni a fájlt.",
  dl_linux_m1_text:
    "**Fájlkezelő:** kattintson jobb gombbal az `.AppImage` fájlra → **Tulajdonságok** → **Jogosultságok** → kapcsolja be a **Fájl futtatásának engedélyezése programként** lehetőséget, majd kattintson rá duplán.",
  dl_linux_m2_h4: "Terminál:",
  dl_linux_fuse_text: "Ha az indítás még mindig sikertelen, futtassa csatolás nélkül — FUSE-csomag nem szükséges:",
  dl_linux_targz_h4: "Egyszerű tarball (FUSE és telepítés nélkül):",
  dl_linux_targz_text: "A `.tar.gz` build ugyanaz az alkalmazás az AppImage-burkoló nélkül — bárhol kicsomagolhatja és futtathatja. Nincs szükség telepítőre és FUSE-csomagra.",
  dl_linux_arch_note: "**A kiadási oldalon található Linux-letöltések csak x86_64-esek.** ARM64-es gépeken (Raspberry Pi, Asahi Linux) a Flatpak még települ, majd indításkor `bwrap: execvp ldconfig: Exec format error` hibával meghiúsul.",
  dl_warning_h3: "Miért jelenhet meg figyelmeztetés",
  dl_warning_p1:
    "Az Arroxy nyílt forráskódú és GPLv3 licenc alatt áll. A Windows- és macOS-buildek **nincsenek kódaláírva** — az Apple Developer ID és a Windows EV kódaláíró tanúsítványok egyenként évi több száz dollárba kerülnek, amit egy indie projekt saját zsebből fizet. E aláírások nélkül a Windows SmartScreen és a macOS Gatekeeper figyelmeztet az első indításkor. A figyelmeztetések azt jelentik, hogy *az operációs rendszer nem ismeri fel a közzétevőt* — nem azt, hogy az Arroxy kártevő.",
  dl_warning_p2:
    "Három módja az Arroxy saját ellenőrzésének, növekvő alaposság szerint:\n\n- **Olvassa el a forráskódot.** Minden sor elérhető a [GitHubon](https://github.com/antonio-orionus/Arroxy), és [lefordíthatja forráskódból](#tech).\n- **Ellenőrizze az SHA256-ot.** Vesse össze a fájlt a közzétett [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) fájllal — lásd lent: [A letöltés ellenőrzése](#verify).\n- **Futtasson külső vizsgálatot.** Töltse fel a fájlt a [VirusTotalra](https://www.virustotal.com).",

  dl_win_first_h3: "Első indítás Windowson",
  shot_smartscreen_more_alt:
    'A SmartScreen „A Windows megvédte a számítógépét” párbeszédpanelje, kiemelt „További információ” hivatkozással',
  shot_smartscreen_run_alt:
    'A SmartScreen párbeszédpanelje a További információ kibontása után, a „Futtatás mindenképpen” gombbal',
  dl_win_defender_h4: "Ha a Windows Defender megjelöli vagy eltávolítja a fájlt",
  dl_win_defender_p:
    "A Defender heurisztikái olykor gyanúsként jelölik az aláíratlan NSIS-telepítőket és az Electron hordozható változatokat. Ha a Defender karanténba helyezi az `Arroxy-win-x64-Setup.exe` vagy az `Arroxy-win-x64-Portable.exe` fájlt, állítsa vissza a **Windows-biztonság → Vírus- és fenyegetésvédelem → Védelmi előzmények** részből, majd adja hozzá az Arroxy végrehajtható fájlját engedélyezett elemként a **Beállítások kezelése → Kizárások hozzáadása vagy eltávolítása** menüpontban. A SmartScreenhez hasonlóan itt is a hiányzó közzétevői aláírás a kiváltó ok, nem észlelt kártevő.",

  dl_macos_first_h3: "Első indítás macOS-en",
  dl_macos_intro:
    "Az Arroxy macOS-buildjei ad-hoc aláírtak, de az Apple nem hitelesítette őket, ezért a Gatekeeper az első indításkor blokkolja őket az *„Arroxy.app” nem nyitható meg — az Apple nem tudta ellenőrizni, hogy az „Arroxy.app” mentes a kártevőktől* üzenettel. Ez azt jelenti, hogy a macOS nem tudja az Apple-lel ellenőrizni az alkalmazást, nem azt, hogy a fájlokkal bármi gond lenne. A Homebrew-val való telepítés teljesen elkerüli ezt a párbeszédpanelt. Ha a DMG-t használta, egyetlen terminálparancs megoldja:",
  dl_macos_sequoia_h4: "Terminálos megoldás a jelenlegi macOS-hez",
  dl_macos_sequoia_intro:
    "Használja a Terminált, miután az Arroxyt az Alkalmazások mappába másolta:",
  dl_macos_sequoia_step1:
    "Húzza az `Arroxy.app` fájlt a csatolt DMG-ből az `/Applications` mappába.",
  dl_macos_sequoia_step2:
    "Nyissa meg a Terminált, és futtassa ezt a két parancsot:",
  dl_macos_sequoia_step3:
    "Az Arroxy indításához futtassa: `open /Applications/Arroxy.app`.",
  dl_macos_sequoia_step4:
    "Ha az alkalmazás elérési útja más, cserélje az `/Applications/Arroxy.app` részt a telepítés helyére.",
  dl_macos_sonoma_h4: "Terminálos megoldás régebbi macOS-hez",
  dl_macos_sonoma_step1:
    "Húzza az `Arroxy.app` fájlt a csatolt DMG-ből az `/Applications` mappába.",
  dl_macos_sonoma_step2:
    "Nyissa meg a Terminált, és távolítsa el a karantént az `/Applications/Arroxy.app` fájlról.",
  dl_macos_sonoma_step3:
    "A karantén eltávolítása után indítsa el az Arroxyt a Terminálból vagy a Finderből.",
  dl_macos_damaged_h4:
    "Gatekeeper-karantén javítása",
  dl_macos_damaged_p:
    "Az első parancs eltávolítja a karanténattribútumot, amelyet a macOS a fájl letöltésekor csatolt hozzá; a második elindítja az alkalmazást. Általában nincs szükség a `sudo`-ra, mert az `/Applications` mappában lévő példány az Öné — csak akkor adja hozzá, ha jogosultsági hibát kap.",
  dl_macos_arch_note:
    "**Apple Silicon vagy Intel:** M-sorozatú Macen (M1 / M2 / M3 / M4) az `arm64` DMG-t töltse le. Intel Macen az `x64` DMG-t. A rossz build is működik a Rosettán keresztül, de érezhetően lassabb.",

  dl_linux_first_h3: "Első indítás Linuxon",
  dl_linux_appimagelauncher:
    "**Opcionális asztali integráció:** telepítse egyszer az [AppImageLaunchert](https://github.com/TheAssassin/AppImageLauncher), és minden duplán kattintott AppImage automatikusan bekerül az indítómenübe — kézi `.desktop` fájl nélkül.",

  dl_verify_h3: "A letöltés ellenőrzése (SHA256)",
  dl_verify_intro:
    "Minden kiadás a binárisok mellett közzétesz egy `SHA256SUMS` fájlt is. Annak ellenőrzéséhez, hogy a letöltés nem sérült meg, és nem módosították szállítás közben, számítsa ki helyben a fájl hash-ét, és vesse össze a `SHA256SUMS` megfelelő sorával. Nyissa meg a legújabb kiadás oldalát → **Assets** → töltse le a `SHA256SUMS` fájlt.",
  dl_verify_win_label: "Windows (PowerShell vagy Parancssor):",
  dl_verify_mac_label: "macOS (Terminál):",
  dl_verify_linux_label: "Linux (Terminál):",
  dl_verify_vt_text:
    "Külső kártevővizsgálatot szeretne? Töltse fel a fájlt a [VirusTotalra](https://www.virustotal.com). Néhány általános heurisztikus jelzés kisebb motoroktól normális az aláíratlan Electron-alkalmazásoknál; a nagy motorok széles körű észlelései viszont valódi aggodalomra adnának okot.",

  dl_pm_intro:
    "Más csatornát részesítene előnyben? Ezek is működnek, és minden kiadással lépést tartanak.",

  privacy_p1:
    "A letöltések közvetlenül a [yt-dlp](https://github.com/yt-dlp/yt-dlp) segítségével töltődnek le a YouTube-ról a kiválasztott mappába — semmi sem megy át külső kiszolgálón. A megtekintési előzmények, a letöltési előzmények, az URL-ek és a fájltartalom az eszközén marad.",
  privacy_reports:
    "Nincs követés — naponta egy névtelen jelzés (az alkalmazás verziója, az operációs rendszer, a nyelv, a telepítési csatorna, az ország és hozzávetőlegesen az, mikor telepítették az Arroxyt), hogy megszámolhassuk az aktív és az új felhasználókat, valamint, amikor az Arroxy letölti vagy frissíti a yt-dlp-t és az FFmpeg-et, egy névtelen jelzés arról, hogy sikerült-e, és nagyjából mennyi ideig tartott. Azonosítók, URL-ek, videócímek, fájlelérési utak vagy fiókadatok nincsenek benne. Mindkettőt kikapcsolhatja a Beállításokban.",
  privacy_p3:
    "A Felfedezés saját bejelentkezéseket tart a böngészőjétől elkülönítve, és az Arroxy soha nem olvas vagy tölt ki bejelentkezési űrlapot — a webhely saját oldalán gépel. A letöltések kijelentkezve futnak; csak ha egy olyan módon hibásodik meg, amit egy fiók orvosolhat, olvassa be az Arroxy frissen a bejelentkezést, tartja egy ideiglenes fájlban az adott letöltés idejére, majd utána törli a fájlt. A Beállításokban a Felfedezésből való kijelentkezés elfelejti őket.",
  faq_q1: "Tényleg ingyenes?",
  faq_a1: "Igen — GPLv3 licenc alatt, prémium szint és funkciókorlátozás nélkül.",
  faq_q11: "Miben különbözik az Arroxy más yt-dlp grafikus felületektől?",
  faq_a11:
    "A legtöbb ingyenes yt-dlp grafikus felület csak burkoló, amely egy hivatkozást fogad. Az Arroxy hozzáadja a **Felfedezést**, egy az alkalmazásba épített böngészőt, amely megnyitja a YouTube-ot vagy bármely más webhelyet: hivatkozásmásolás nélkül böngészhet és tölthet le, és ott egyszer bejelentkezve olyan videókat is letölthet, amelyeket a fiókja megnézhet, például a privát videóit, valamint a Megnézendő és a Kedvelt listáit, sütiexport nélkül. Lásd: [Miért az Arroxy](#why).",
  faq_q2: "Milyen videóminőségeket tölthetek le?",
  faq_a2:
    "Bármit, amit a YouTube kiszolgál: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, valamint csak hang. A 60 fps-es és HDR-adatfolyamok változatlanul megmaradnak, a lépésenkénti letöltés pedig lehetővé teszi az AV1, a VP9 vagy a H.264 kiválasztását minden felbontásnál.",
  faq_q3: "Kinyerhetem csak a hangot MP3-ként?",
  faq_a3:
    "Igen. Válassza a *csak hang* lehetőséget a formátummenüben, majd az MP3-at, M4A/AAC-t, Opust vagy WAV-ot.",
  faq_q4: "Hogyan tölthetek le YouTube-fiókot igénylő videókat?",
  faq_a4:
    "Jelentkezzen be egyszer a Felfedezés lapon. Az Arroxy ezután letöltheti azokat a videókat, amelyeket a fiókja megnézhet: a privát videóit, a korhatáros videókat, ha a fiók korhatár-ellenőrzött, valamint a Megnézendő és a Kedvelt listáit. A bejelentkezést csak akkor használja, ha a letöltés olyan módon hibásodik meg, amit egy fiók orvosolhat; minden más a korábbiak szerint töltődik le. Ez a **Felfedezés-bejelentkezés** lehetőség, amely a sütibeállításokban az első helyen áll és Ajánlottként van megjelölve, az Arroxy pedig a Felfedezés első megnyitásakor kiválasztja Önnek. A yt-dlp wikije megjegyzi, hogy [a bejelentkezett automatizálás megjelölheti a Google-fiókot](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), ezért a másodlagos fiók a biztonságosabb választás.",
  faq_q5: "Tovább fog működni, ha a YouTube módosít valamit?",
  faq_a5:
    "A yt-dlp induláskor automatikusan frissül, az Arroxy pedig gyorsan ad ki javításokat, ha a YouTube módosít valamit. Ha a letöltéshez bejelentkezés kell, az Arroxy a Felfedezés-bejelentkezést használja, ha ott bejelentkezett, a fájlból vagy a böngészőből származó sütik pedig elérhetők a sütibeállításokban.",
  faq_q6: "Milyen nyelveken érhető el az Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} nyelven, azonnal használhatóan: {{LANG_NAME_LIST}}. Az Arroxy az első indításkor automatikusan felismeri az operációs rendszer nyelvét, és bármikor válthat az eszköztár nyelvválasztójával. A futásidejű nyelvi JSON a src/shared/i18n/locales/ mappában található, a fordítóknak szánt PO-katalógusok pedig az i18n/locales/ mappában — a közreműködéshez nyisson egy PR-t a GitHubon.",
  faq_q7: "Kell még valamit telepítenem?",
  faq_a7:
    "Nem. A yt-dlp, az ffmpeg és az ffprobe az első indításkor automatikusan letöltődik, és a gépen gyorsítótárba kerül. Ezután nincs szükség további beállításra.",
  faq_q8: "Letölthetek lejátszási listákat vagy teljes csatornákat?",
  faq_a8:
    "Igen — mindkettőt. Illesszen be egy lejátszási lista vagy csatorna URL-jét (pl. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); válassza ki, hány bejegyzést vizsgáljon át, majd állítsa sorba a teljes listát, vagy válasszon ki egyes videókat. A dátumtartomány-szűrők hamarosan érkeznek.",
  faq_q9: 'A macOS azt mondja, „az alkalmazás sérült” — mit tegyek?',
  faq_a9:
    'Ez a macOS Gatekeeper, amely egy aláíratlan alkalmazást blokkol, nem tényleges sérülés. Lásd az [Első indítás macOS-en](#macos-first-launch) részt a karantént eltávolító és az Arroxyt elindító terminálparancsokért.',
  faq_q10: "Legális a YouTube-videók letöltése?",
  faq_a10:
    "Ez az országától és attól függ, mit tölt le. Csak olyan tartalmat töltsön le, amely az Öné, amelyet letöltésre licenceltek, vagy amelynek másolását az országa törvényei megengedik. Önnek kell gondoskodnia a YouTube [Szolgáltatási feltételeinek](https://www.youtube.com/t/terms) és a helyi szerzői jogi törvényeknek való megfelelésről. Lásd: [Felhasználási feltételek](#terms).",
  plan_intro: "Még tervben van — nagyjából fontossági sorrendben:",
  plan_col1: "Funkció",
  plan_col2: "Leírás",
  plan_r1_name: "**Lejátszási lista- és csatornaszűrők**",
  plan_r1_desc: "Dátumtartomány-szűrők lejátszási lista vagy csatorna felsorolásakor",
  plan_r2_name: "**YouTube-hangsáv-beállítások**",
  plan_r2_desc:
    "Alkalmazásszintű beszélt nyelvi hangsáv-beállítás, profilonkénti felülbírálással, ha a YouTube több hangsávot kínál",
  plan_r3_name: "**Erősebb újrapróbálási helyreállítás**",
  plan_r3_desc:
    "Új újrapróbálási út a megbízhatatlan vagy problémás internetkapcsolat miatt megszakadt letöltésekhez",
  plan_r4_name: "**Teljes letöltéskezelő panel**",
  plan_r4_desc:
    "A sorpanel teljesebb kezelővé alakítása, beleértve a sorba állított elemek célmappáinak módosítását",
  plan_r5_name: "**Ütemezett letöltések**",
  plan_r5_desc: "Sor indítása megadott időpontban (éjszakai futtatások)",
  plan_r9_name: "**AUR-csomag**",
  plan_r9_desc: "Telepítés Arch Linuxra és Omarchyra: `yay -S arroxy-bin`",
  plan_cta:
    "Van egy ötlete egy funkcióhoz? [Nyisson egy kérést](../../issues) — a közösség véleménye alakítja a prioritást.",
  tech_content: TECH_CONTENT,
  support_h2: "Az Arroxy támogatása",
  support_line: "Az Arroxy ingyenes és GPLv3 licenc alatt áll — nincs reklám, nincs követés, nincs fizetős szint. Ha időt spórol Önnek, támogathatja a fejlesztést Bitcoinnal, Tronnal vagy Ethereummal: a címek a [DONATE.md](DONATE.md) fájlban találhatók, amely az egyetlen hivatalos forrásuk. Az Arroxy soha nem küld Önnek címet e-mailben vagy közvetlen üzenetben. A tároló csillagozása, a hibák jelentése és a fordítások javítása ugyanilyen sokat segít.",
  tos_h2: "Felhasználási feltételek",
  tos_note:
    "Az Arroxy kizárólag személyes, privát használatra szánt eszköz. Kizárólag Ön felel azért, hogy a letöltései megfeleljenek a YouTube [Szolgáltatási feltételeinek](https://www.youtube.com/t/terms) és a joghatósága szerzői jogi törvényeinek. Ne használja az Arroxyt olyan tartalom letöltésére, sokszorosítására vagy terjesztésére, amelynek felhasználására nincs joga. A fejlesztők nem felelnek a visszaélésekért.",
  footer_credit:
    'GPLv3 · Gondosan készítette: <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
