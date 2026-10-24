const TECH_CONTENT = `<details>
<summary><strong>Tehnologii</strong></summary>

- **Electron** — shell desktop multiplatformă
- **React 19** + **TypeScript** — interfața
- **Tailwind CSS v4** — stilizare
- **Zustand** — gestionarea stării
- **yt-dlp** + **ffmpeg** — motor de descărcare și multiplexare (ambele sunt preluate la rulare: yt-dlp este ținut la zi, ffmpeg/ffprobe se instalează o singură dată și se păstrează între actualizări)
- **Vite** + **electron-vite** — instrumente de build
- **Vitest** + **Playwright** — teste unitare și end-to-end

</details>

<details>
<summary><strong>Compilare din sursă</strong></summary>

### Cerințe preliminare — toate platformele

| Instrument | Versiune | Instalare |
| ------- | ------- | ------- |
| Git     | orice   | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` sau \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` sau \`packageManager\` din \`package.json\` |

Recomandat: instalați \`mise\`, apoi rulați \`mise install\` în directorul clonat. Fără mise, activați manual Node.js din \`.node-version\` și Bun din \`package.json\` înainte de \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Pentru recompilările native pot fi necesare Visual Studio Build Tools și Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

După clonare, rulați \`mise trust && mise install\` din directorul clonat. Dacă shell-ul dvs. folosește deja \`fnm\`, \`nvm\` sau un Bun din Homebrew, activați mise în \`~/.zshrc\` ca Arroxy să primească Node.js 24.21.0 și Bun 1.4.2:

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

### Clonare și rulare

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
\`\`\`

### Construirea unui pachet de distribuție

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
\`\`\`

> \`bun run bootstrap\` instalează dependențele, recompilează dependențele aplicației Electron, verifică Electron, pregătește ffmpeg/ffprobe încorporate pentru dezvoltare și instalează Playwright Chromium. Versiunile de lansare gestionează yt-dlp, ffmpeg și ffprobe la rulare, în folderul de date al aplicației; niciunul nu este inclus în programul de instalare.

</details>`;

export const ro = {
  icon_alt: "Mascota Arroxy",
  hero_image_alt: "Lipiți un link sau pur și simplu navigați. Ecranul URL și browserul încorporat din Arroxy, cu o descărcare în curs.",
  title:
    "Arroxy — descărcător gratuit și open-source pentru YouTube (+ 2000 de site-uri) cu browser încorporat, pentru Windows, macOS și Linux",
  read_in_label: "Citiți în:",
  badge_release_alt: "Versiune",
  badge_build_alt: "Build",
  badge_license_alt: "Licență",
  badge_platforms_alt: "Platforme",
  badge_i18n_alt: "Limbi",
  badge_website_alt: "Site web",
  discord_badge_text: "Alăturați-vă comunității Discord",
  discord_badge_encoded: "Al%C4%83tura%C8%9Bi-v%C4%83%20comunit%C4%83%C8%9Bii%20Discord",
  hero_desc:
    "Descărcați videoclipuri, Shorts, canale, podcasturi sau piese audio de pe **YouTube și de pe peste 2000 de site-uri acceptate** — până la 8K HDR la 60 fps, ca MP3 / AAC / Opus sau doar porțiunea de care aveți nevoie. **Navigați pe YouTube sau pe orice alt site direct în Arroxy**, în fila Explorare, și descărcați videoclipul, lista de redare sau canalul pe care le vizitați; conectați-vă acolo pentru a descărca videoclipuri pe care contul dvs. le poate deja viziona. Rulează local pe Windows, macOS și Linux. **Fără reclame, fără balast, fără upsell-uri.**",
  cta_latest: "↓ Instalați ultima versiune",
  cta_website: "Site web",
  website_url: "https://arroxy.com/",
  star_cta: "Dacă Arroxy vă economisește timp, un ⭐ îi ajută pe alții să-l găsească.",
  ai_notice: "> 🌐 Această traducere a fost realizată cu sprijinul IA. [README-ul în engleză](README.md) este sursa de referință. Ați găsit o greșeală? [Deschideți un PR](../../pulls).",
  intro_what_is:
    "**Ce este Arroxy?** Arroxy este o interfață grafică desktop gratuită și open source care descarcă videoclipuri, audio, liste de redare și subtitrări de pe YouTube și de pe peste 2000 de alte site-uri compatibile cu [yt-dlp](https://github.com/yt-dlp/yt-dlp). Rulează pe Windows 10/11, macOS 13+ (Intel + Apple Silicon) și Linux (AppImage, Flatpak, tar.gz). Licență GPLv3. Fără reclame, fără limite de utilizare. Distribuit prin [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage și descărcare directă.",
  intro_key_difference:
    "**Diferența cheie: un browser încorporat.** Majoritatea descărcătoarelor gratuite pentru YouTube sunt simple învelișuri peste yt-dlp: o casetă de URL și un meniu de formate, fără browser propriu. Arroxy are unul, **fila Explorare**. Navigați pe YouTube sau pe orice alt site direct în aplicație și descărcați videoclipul, lista de redare sau canalul pe care vă aflați, ori faceți clic dreapta pe orice link. Dacă vă conectați o singură dată în Explorare, descărcările care necesită un cont folosesc acea conectare: videoclipurile private, listele Vizionează mai târziu și Apreciate și alte videoclipuri pe care contul dvs. le poate deja viziona, fără export de cookie-uri. Conectați-vă acolo și la alte site-uri, iar descărcările lor folosesc acea conectare când au nevoie. Detalii: [De ce Arroxy](#why-explore).",
  last_updated: "Ultima actualizare: {{LAST_UPDATED}}.",
  toc_heading: "Cuprins",
  why_h2: "De ce Arroxy",
  features_h2: "Funcționalități",
  dl_h2: "Instalare și prima pornire",
  privacy_h2: "Confidențialitate",
  faq_h2: "Întrebări frecvente",
  roadmap_h2: "Foaie de parcurs",
  tech_h2: "Construit cu",
  why_intro: "O comparație directă cu cele mai comune alternative:",
  why_r1: "Gratuit, fără nivel premium",
  why_r2: "Open source",
  why_r3: "Procesare doar locală",
  why_r5: "Fără limite de utilizare",
  why_r6: "Aplicație desktop multiplatformă",
  why_r7: "Subtitrări + SponsorBlock",
  why_r8: "Browser încorporat (navigare, conectare, descărcare)",
  why_r9: "Videoclipuri pe care propriul dvs. cont le poate viziona, fără export de cookie-uri",
  why_table_note:
    "⚠️ = parțial sau doar în nivelul plătit. Conectarea din aplicație a 4K Video Downloader pentru videoclipuri private este o funcție plătită; majoritatea interfețelor grafice gratuite pentru yt-dlp acceptă doar un fișier de cookie-uri sau citesc cookie-urile browserului dvs.",
  why_summary:
    "Arroxy este construit pentru un singur lucru: un fișier local curat, fie că lipiți un URL, fie că găsiți videoclipul în Explorare. Fără upsell-uri, fără colectare de date.",
  why_explore_h3: "Ce nu poate face un simplu înveliș pentru yt-dlp: fila Explorare",
  why_explore_intro:
    "Majoritatea descărcătoarelor gratuite pentru YouTube sunt o casetă de URL deasupra yt-dlp. Arroxy folosește și el yt-dlp, dar are și **Explorare**, un browser încorporat în aplicație care deschide YouTube sau orice alt site. Explorare adaugă ceea ce o casetă de URL nu poate oferi:",
  why_explore_1:
    "**Videoclipuri pe care contul dvs. le poate viziona, fără export de cookie-uri** — videoclipurile private, listele Vizionează mai târziu și Apreciate, videoclipurile cu restricție de vârstă pe un cont cu vârsta verificată și paginile de pe alte site-uri care necesită conectarea dvs. Un înveliș simplu are nevoie de un export cookies.txt sau citește cookie-urile browserului dvs. În Arroxy vă conectați o singură dată în Explorare, iar restul se face singur",
  why_explore_4:
    "**Fără copiat linkuri** — găsiți un videoclip, o listă de redare sau un canal în Explorare și descărcați-l cu un clic, sau faceți clic dreapta pe orice link din pagină",
  why_explore_5:
    "**Blocant de reclame când îl doriți** — un clic pe scut blochează reclamele și trackerele de pe paginile din Explorare",
  feat_explore_h3: "Explorare: navigați pe web direct în Arroxy",
  feat_explore_1:
    "**Fila Explorare** — navigați pe YouTube sau pe orice alt site direct în Arroxy și descărcați ce găsiți, fără copiat linkuri. **Descarcă · *profilul dvs.*** pune în coadă videoclipul, lista de redare sau canalul pe care le vizualizați; săgeata de lângă el schimbă profilurile, iar bagheta deschide descărcarea pas cu pas, pentru alegerea formatelor, a subtitrărilor și altele",
  feat_explore_6:
    "**Clic dreapta pentru descărcare** — faceți clic dreapta pe orice link de videoclip, listă de redare sau canal din Explorare pentru a-l descărca cu profilul dvs., pentru a alege alt profil din **Descarcă cu**, pentru a deschide descărcarea pas cu pas sau pentru a copia linkul. Nu trebuie să deschideți mai întâi fiecare videoclip",
  feat_explore_7:
    "**Aspect compact** — un clic în bara de instrumente din Explorare mută filele Arroxy în ea și dă paginii mai mult spațiu",
  feat_explore_2:
    "**Bara de adrese** — tastați pentru a căuta pe YouTube sau introduceți orice adresă web pentru a deschide acel site",
  feat_explore_3:
    "**Descărcări care necesită un cont** — conectați-vă o singură dată în Explorare, iar Arroxy poate descărca videoclipuri pe care contul dvs. le poate viziona: videoclipurile private, videoclipurile cu restricție de vârstă dacă vârsta contului este verificată, plus listele Vizionează mai târziu și Apreciate. Conectați-vă acolo și la alte site-uri, iar descărcările lor folosesc acea conectare când au nevoie. Arroxy descarcă totuși mai întâi fără conectare și folosește conectarea din Explorare doar când o descărcare eșuează într-un mod pe care un cont îl poate remedia",
  feat_explore_4:
    "**Folosiți un cont secundar** — primul ecran din Explorare explică de ce: descărcarea cu un cont implică un anumit risc ca acel cont să fie restricționat. Deconectați-vă din Explorare din Setări oricând doriți să uitați conectările",
  feat_explore_5:
    "**Blocant de reclame** — dezactivat implicit. Un clic pe scut în bara de instrumente din Explorare blochează reclamele și trackerele de pe paginile sale, fără să afecteze descărcările. YouTube poate opune rezistență blocantelor de reclame pentru conturile conectate",
  feat_quality_h3: "Calitate și formate",
  feat_quality_1: "Până la **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Rată mare de cadre și HDR** păstrate ca atare — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — exportați doar audio ca MP3, M4A/AAC, Opus sau WAV. În descărcările interactive, alegeți piesele surround/Dolby native ale sursei (AC-3, E-AC-3, 5.1, DRC) când sunt disponibile sau setați o valoare globală implicită **Preferă surround / Dolby**",
  feat_quality_4:
    "**Profiluri cu un scop** — *Cea mai bună imagine* (AV1 · VP9) sau *Smart TV* (MP4 · H.264), salvate ca Auto, MP4, MKV sau WebM fără recodificare. HDR este *Auto* (doar când ecranul dvs. îl poate afișa), *SDR* sau *HDR*",
  feat_quality_5:
    "**Fiecare codec la fiecare rezoluție** — descărcarea pas cu pas listează AV1, VP9 și H.264 unul lângă altul la fiecare rezoluție, ca să-l alegeți pe cel redat de televizorul sau editorul dvs.",
  feat_quality_6:
    "**Aflați ce este de fapt un flux** — dimensiunile mărite de YouTube cu IA, limbile audio dublate cu IA, fluxurile cu bitrate îmbunătățit, videoclipurile 360° și copiile deteriorate sau cu filigran sunt marcate. Profilurile omit fluxurile mărite cu IA, cu excepția cazului în care le permiteți",
  feat_privacy_h3: "Confidențialitate și control",
  feat_privacy_1:
    "Procesare 100% locală — descărcările merg direct de pe YouTube pe discul dvs.",
  feat_privacy_2: "**Open source** — fiecare linie poate fi auditată, licență GPLv3",
  feat_privacy_3: "Fișiere salvate direct în folderul pe care îl alegeți",
  feat_workflow_h3: "Flux de lucru",
  feat_workflow_12:
    "**Comandă rapidă globală de descărcare** — copiați un link în orice aplicație și apăsați `Ctrl+Shift+D` (`Cmd+Shift+D` în macOS); Arroxy îl pune în coadă cu profilul dvs. activ fără a deschide fereastra, iar o notificare confirmă. Activată implicit, poate fi reasociată",
  feat_workflow_1:
    "**Moduri flexibile de pornire** — alegeți o descărcare unică ghidată, selectorul de liste de redare/canale, lipirea în bloc de URL-uri, Descărcarea rapidă cu valori implicite salvate sau navigați și descărcați din Explorare",
  feat_workflow_2:
    "**Coadă centrală de descărcare** — fiecare lucrare unică, de listă de redare, în bloc sau rapidă ajunge într-un singur loc pentru progres, pauză, reluare, anulare, reîncercare și control al priorității",
  feat_workflow_3:
    "**Urmărirea clipboardului** — copiați un link de videoclip și acesta completează câmpul URL când reveniți la Arroxy, cu **Anulează** dacă nu l-ați dorit. Cât timp Arroxy este ocupat, linkul așteaptă până reveniți la fila URL (dezactivați în Setări)",
  feat_workflow_4:
    "**Curățare automată a URL-urilor** — elimină parametrii de urmărire (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) și despachetează linkurile `youtube.com/redirect`",
  feat_workflow_5:
    "**Mod bară de sistem** — închiderea ferestrei menține descărcările în fundal",
  feat_workflow_6:
    "**{{LANG_COUNT}} limbi** — detectează automat limba sistemului, se poate schimba oricând",
  feat_workflow_7:
    "**Sincronizarea listelor de redare** — scanați din nou o listă de redare față de un folder local pentru a omite videoclipurile deja descărcate; generează un fișier de listă `.m3u` actualizat pe măsură ce fiecare videoclip se descarcă",
  feat_workflow_8:
    "**Controale de viteză și ritm** — limitați lățimea de bandă, stabiliți câte părți ale unui videoclip se descarcă simultan și adăugați întârzieri între cereri cu presetări (*Dezactivat · Echilibrat · Precaut · Personalizat*)",
  feat_workflow_9:
    "**Șabloane de nume de fișier** — denumiți descărcările cum doriți cu `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` și `{playlist_index}`, global sau pentru fiecare profil de descărcare",
  feat_workflow_10:
    "**Descărcări simultane și reîncercare automată** — alegeți câte descărcări din coadă rulează în același timp și lăsați Arroxy să reîncerce o descărcare care a întâmpinat o problemă de rețea sau de server, așteptând mai mult înainte de fiecare încercare",
  feat_workflow_11:
    "**Profiluri pe element în listele de redare** — atribuiți fiecărui videoclip dintr-o listă propriul profil de descărcare, în loc de o singură setare pentru întreaga listă, astfel încât într-o singură trecere să arhivați unele la calitate maximă și să le salvați pe restul doar ca audio",
  feat_workflow_13:
    "**Descărcarea rapidă lucrează în fundal** — linkul apare imediat în Descărcări și se pregătește acolo, o notă cu **Vizualizare** confirmă, iar câmpul URL se golește pentru următorul link. Porniți câte doriți cât timp cele anterioare se pregătesc",
  feat_workflow_14:
    "**Descărcări vă spune ce are nevoie de dvs.** — dacă Arroxy nu poate citi un link, rândul său spune de ce și oferă remedierea: Reîncercați, activați cookie-urile sau conectați-vă în Explorare. Cu cookie-urile dezactivate, **Conectați-vă cu Explorare** îl reîncearcă pentru dvs. după ce v-ați conectat. O listă de redare mai lungă decât limita de încărcare așteaptă pe rândul ei să alegeți toate videoclipurile, primele sau o examinare. Fila Descărcări numără rândurile care vă așteaptă",
  feat_workflow_15:
    "**Descărcați doar o parte dintr-un videoclip** — alegeți un început și un sfârșit, sau un capitol, pe ecranul Format, iar Arroxy salvează doar acel interval, denumit cu intervalul după ID-ul videoclipului. Tăieturile ajung la cel mai apropiat cadru-cheie; activați tăierea exactă pentru a recodifica în schimb",
  feat_workflow_16:
    "**Eliminarea descărcărilor finalizate** — opțional: o descărcare finalizată părăsește lista după 5 secunde. Fișierele rămân pe disc, iar descărcările eșuate rămân în listă",
  feat_workflow_17:
    "**Dimensiune și Lipsă în Descărcări** — o coloană **Dimensiune** sortabilă arată cât spațiu ocupă fiecare descărcare, iar **Lipsă** semnalează fișierele mutate sau șterse în afara Arroxy",
  feat_workflow_18:
    "**Aurora sau Minimal, întunecat sau luminos** — panouri de sticlă peste un cer în mișcare sau suprafețe pline, discrete; comutați din subsol. Computerele fără accelerare grafică primesc automat Minimal",
  feat_workflow_19:
    "**Bara de meniu Mac** — în macOS, deschideți Setările (`Cmd+,`), setați limita de viteză la descărcare, schimbați stilul și tema și deschideți jurnalele sau salvați un fișier de diagnosticare din bara de meniu",
  feat_workflow_20:
    "**Schimbați un profil din orice descărcare** — ajustați o descărcare, apoi actualizați profilul de la care a pornit (cu o previzualizare a modificărilor) sau salvați setările ca profil nou. Schimbarea profilului întreabă dacă păstrați modificările",
  feat_post_h3: "Subtitrări și postprocesare",
  feat_post_1:
    "**Subtitrări** în SRT, VTT sau ASS — manuale sau generate automat, în orice limbă disponibilă",
  feat_post_2:
    "Salvați lângă videoclip, încorporați în `.mkv` sau organizați într-un subfolder `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — omiteți sau marcați ca capitole sponsorii, introducerile, încheierile, autopromovările",
  feat_post_4:
    "**Metadate încorporate** — titlul, data încărcării, canalul, descrierea, miniatura și marcajele de capitole se scriu în fișier",
  feat_post_5:
    "**Loturi doar cu subtitrări** — lipiți o listă de URL-uri sau deschideți o listă de redare, alegeți Subtitrări și obțineți doar fișierele de subtitrare pentru fiecare videoclip",
  feat_sites_h3: "YouTube + 2000 de site-uri",
  feat_sites_1:
    "**YouTube, în întregime** — Videoclipuri, Shorts, Canale, Liste de redare, YouTube Music și Podcasturi tratate ca surse de prim rang",
  feat_sites_2:
    "**Peste 2000 de alte site-uri** prin yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable și multe altele",
  feat_sites_3:
    "**Doar audio și subtitrări** funcționează pe fiecare site acceptat, nu doar pe YouTube",
  feat_sites_4:
    "Dacă un site se schimbă, yt-dlp livrează remedieri săptămânal, iar Arroxy actualizează automat fișierul binar la pornire",
  shot1_cap:
    "<b>Pagina Descărcare rapidă</b><br/>Lipiți un URL și descărcați-l instant cu profilul activ",
  shot2_cap:
    "<b>Profiluri de descărcare reutilizabile</b><br/>Salvați presetări de format, calitate și ieșire — reutilizați-le la fiecare descărcare",
  shot3_cap:
    "<b>Piese audio în mai multe limbi</b><br/>Alegeți exact limba audio în care vine un videoclip",
  shot4_cap:
    "<b>Audio surround / Dolby</b><br/>Piste 5.1 și Dolby detectate și păstrate",
  shot5_cap:
    "<b>Modul URL-uri în bloc</b><br/>Lipiți o listă, duplicatele se elimină automat, puneți-le pe toate în coadă deodată",
  shot6_cap:
    "<b>Coadă de descărcare paralelă</b><br/>Mai multe descărcări deodată, cu progres în timp real",
  hotkey_fig_alt:
    "Comanda rapidă globală de descărcare Arroxy — Ctrl+Shift+D în Windows și Linux, Cmd+Shift+D în macOS, trimițând linkul copiat direct în coada de descărcare",
  hotkey_fig_cap:
    "<b>Comandă rapidă globală de descărcare</b><br/>Copiați un link oriunde, apăsați o dată — ajunge în coadă și începe să se descarce",
  shot7_cap: "<b>Profiluri pe element în listele de redare</b><br/>Dați fiecărui videoclip propriul profil — arhivați unele în 4K, salvați restul doar ca audio",
  shot8_cap:
    "<b>Explorare</b><br/>Navigați pe YouTube sau pe orice alt site direct în Arroxy și descărcați pagina pe care o vizitați cu profilul activ",
  shot9_cap:
    "<b>Primul ecran din Explorare</b><br/>O privire rapidă asupra Explorării și motivul pentru care un cont secundar este o conectare mai sigură",
  shot10_cap:
    "<b>Descărcări vă spune ce are nevoie de dvs.</b><br/>Linkurile se pregătesc în fundal; unul eșuat oferă remedierea, o listă de redare lungă așteaptă alegerea dvs.",
  shot11_cap:
    "<b>Descărcați doar o parte dintr-un videoclip</b><br/>Alegeți un început și un sfârșit, sau un capitol — Arroxy salvează doar acel interval",
  shot12_cap:
    "<b>Editorul de profil</b><br/>Reglați un profil: tipul de fișier, rezoluția, subtitrările, destinația, șablonul de nume de fișier și altele",
  shot13_cap:
    "<b>Întunecat sau luminos, sticlă sau plin</b><br/>Patru aspecte la alegere: panouri de sticlă peste un cer în mișcare sau suprafețe pline, discrete, fiecare în variantă întunecată și luminoasă",
  shot14_cap:
    "<b>8K HDR la 60 fps</b><br/>Fiecare rezoluție, codec și flux HDR pe care le oferă un videoclip, unul lângă altul",
  dl_platform_col: "Platformă",
  dl_format_col: "Descărcare directă",
  dl_oneline_note:
    "Versiunile sunt doar x86_64. Nu aveți `curl`? Înlocuiți `curl -fsSL` cu `wget -qO-`.",
  dl_win_scoop:
    "Preferați Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Program de instalare (NSIS) sau `.exe` portabil",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` sau `.flatpak` (izolat)",
  dl_grab: "Toate fișierele versiunii →",
  dl_pkg_h3: "Instalare prin manager de pachete",
  dl_channel_col: "Canal",
  dl_command_col: "Comandă",
  dl_win_h3: "Windows: program de instalare sau portabil",
  dl_win_col_installer: "Program de instalare NSIS",
  dl_win_col_portable: "`.exe` portabil",
  dl_win_r1: "Necesită instalare",
  dl_win_r1_installer: "Da",
  dl_win_r1_portable: "Nu — rulează de oriunde",
  dl_win_r2: "Actualizări automate",
  dl_win_r2_installer: "✅ în aplicație",
  dl_win_r2_portable: "❌ descărcare manuală",
  dl_win_r3: "Viteza de pornire",
  dl_win_r3_installer: "✅ mai rapidă",
  dl_win_r3_portable: "⚠️ pornire la rece mai lentă",
  dl_win_r4: "Se adaugă în meniul Start",
  dl_win_r5: "Dezinstalare ușoară",
  dl_win_r5_portable: "❌ ștergeți fișierul",
  dl_win_rec:
    "**Recomandare:** folosiți programul de instalare NSIS pentru actualizări automate și pornire mai rapidă. Folosiți `.exe` portabil pentru varianta fără instalare și fără registry.",
  dl_win_smartscreen_h4: "Avertismentul Windows SmartScreen",
  dl_win_smartscreen_intro:
    "La prima pornire puteți vedea **„Windows a protejat computerul”** sau **„Editor necunoscut”.** Aceasta se aplică atât pentru `Arroxy-win-x64-Setup.exe`, cât și pentru `Arroxy-win-x64-Portable.exe`. Arroxy este gratuit și open-source, iar versiunile pentru Windows nu sunt semnate cu un certificat de semnare a codului plătit, motiv pentru care SmartScreen le semnalează. Asta **nu** înseamnă automat că Arroxy nu este sigur. Pentru a continua:",
  dl_win_smartscreen_step1: "Faceți clic pe **Mai multe informații**.",
  dl_win_smartscreen_step2: "Faceți clic pe **Rulează oricum**.",
  dl_win_smartscreen_official:
    "Descărcați Arroxy doar de pe pagina oficială GitHub Releases. Dacă ați primit fișierul de pe alt site sau vi l-a trimis cineva, ștergeți-l și descărcați o copie nouă din sursa oficială. Codul sursă este public, deci îl puteți inspecta sau puteți compila singur Arroxy, dacă preferați.",
  dl_macos_h3: "Prima pornire în macOS",
  dl_macos_warning:
    "Arroxy nu este încă semnat, deci macOS Gatekeeper poate afișa la prima pornire avertismentul de aplicație deteriorată. Este de așteptat — nu indică o deteriorare reală a fișierelor.",
  dl_macos_m1_h4: "Metoda Terminal:",
  dl_macos_step1: "Trageți `Arroxy.app` din DMG-ul montat în `/Applications`.",
  dl_macos_step2:
    "Deschideți Terminal și rulați `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Rulați `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Dacă ruta aplicației este diferită, înlocuiți `/Applications/Arroxy.app` cu ruta în care ați instalat-o.",
  dl_macos_step5:
    "Introduceți parola Mac-ului dacă `sudo` o cere.",
  dl_macos_after:
    "După ce carantina este eliminată, Arroxy se deschide normal.",
  dl_macos_m2_h4: "Metoda Terminal:",
  dl_macos_note:
    "Versiunile pentru macOS sunt produse prin CI pe runnere Apple Silicon și Intel. Dacă întâmpinați probleme, vă rugăm să [deschideți o problemă](../../issues) — feedbackul utilizatorilor de macOS modelează activ ciclul de testare pentru macOS.",
  dl_linux_h3: "Prima pornire în Linux",
  dl_linux_intro:
    "AppImage-urile rulează direct — fără instalare. Trebuie doar să marcați fișierul ca executabil.",
  dl_linux_m1_text:
    "**Manager de fișiere:** faceți clic dreapta pe `.AppImage` → **Proprietăți** → **Permisiuni** → activați **Permite executarea fișierului ca program**, apoi faceți dublu clic.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Dacă pornirea tot eșuează, rulați-l fără montare — nu este nevoie de pachetul FUSE:",
  dl_linux_targz_h4: "Arhivă tarball simplă (fără FUSE, fără instalare):",
  dl_linux_targz_text: "Versiunea `.tar.gz` este aceeași aplicație, fără învelișul AppImage — extrageți-o oriunde și rulați-o. Fără program de instalare și fără pachetul FUSE.",
  dl_linux_arch_note: "**Descărcările pentru Linux de pe pagina versiunii sunt doar x86_64.** Pe mașinile ARM64 (Raspberry Pi, Asahi Linux), Flatpak se instalează totuși, apoi eșuează la pornire cu `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "De ce puteți vedea un avertisment",
  dl_warning_p1:
    "Arroxy este open-source și are licență GPLv3. Versiunile pentru Windows și macOS **nu sunt semnate** — certificatele Apple Developer ID și Windows EV de semnare a codului costă fiecare sute de dolari pe an, pe care un proiect independent îi plătește din buzunar. Fără aceste semnături, Windows SmartScreen și macOS Gatekeeper vă vor avertiza la prima pornire. Avertismentele înseamnă că *sistemul dvs. de operare nu recunoaște editorul* — nu că Arroxy este malware.",
  dl_warning_p2:
    "Trei moduri de a verifica singur Arroxy, în ordinea crescătoare a rigorii:\n\n- **Citiți sursa.** Fiecare linie este pe [GitHub](https://github.com/antonio-orionus/Arroxy) și puteți [compila din sursă](#tech).\n- **Verificați SHA256.** Potriviți fișierul cu [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) publicat — vedeți [Verificați descărcarea](#verify) mai jos.\n- **Rulați o scanare terță.** Încărcați fișierul pe [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Prima pornire în Windows",
  shot_smartscreen_more_alt:
    "Fereastra SmartScreen „Windows a protejat computerul” cu linkul „Mai multe informații” evidențiat",
  shot_smartscreen_run_alt:
    "Fereastra SmartScreen după extinderea opțiunii Mai multe informații, cu butonul „Rulează oricum”",
  dl_win_defender_h4: "Dacă Windows Defender semnalează sau elimină fișierul",
  dl_win_defender_p:
    "Euristicile Defender semnalează uneori drept suspecte programele de instalare NSIS nesemnate și variantele portabile Electron. Dacă Defender pune în carantină `Arroxy-win-x64-Setup.exe` sau `Arroxy-win-x64-Portable.exe`, restaurați-l din **Securitate Windows → Protecție împotriva virușilor și amenințărilor → Istoric protecție**, apoi adăugați executabilul Arroxy ca element permis la **Gestionați setările → Adăugați sau eliminați excluderi**. Ca și la SmartScreen, cauza este lipsa semnăturii editorului, nu un malware detectat.",

  dl_macos_first_h3: "Prima pornire în macOS",
  dl_macos_intro:
    "Versiunile Arroxy pentru macOS sunt semnate ad-hoc, dar nu sunt notarizate de Apple, deci Gatekeeper blochează prima pornire cu mesajul *„Arroxy.app” nu a fost deschis — Apple nu a putut verifica dacă „Arroxy.app” este lipsit de malware*. Asta înseamnă că macOS nu poate verifica aplicația cu Apple, nu că ar fi ceva în neregulă cu fișierele. Instalarea cu Homebrew evită complet această fereastră. Dacă ați folosit DMG-ul, o singură comandă în Terminal o rezolvă:",
  dl_macos_sequoia_h4: "Remediere prin Terminal pentru macOS actual",
  dl_macos_sequoia_intro:
    "Folosiți Terminal după ce ați copiat Arroxy în Applications:",
  dl_macos_sequoia_step1:
    "Trageți `Arroxy.app` din DMG-ul montat în `/Applications`.",
  dl_macos_sequoia_step2:
    "Deschideți Terminal și rulați aceste două comenzi:",
  dl_macos_sequoia_step3:
    "Rulați `open /Applications/Arroxy.app` pentru a porni Arroxy.",
  dl_macos_sequoia_step4:
    "Dacă ruta aplicației este diferită, înlocuiți `/Applications/Arroxy.app` cu ruta în care ați instalat-o.",
  dl_macos_sonoma_h4: "Remediere prin Terminal pentru macOS mai vechi",
  dl_macos_sonoma_step1:
    "Trageți `Arroxy.app` din DMG-ul montat în `/Applications`.",
  dl_macos_sonoma_step2:
    "Deschideți Terminal și eliminați carantina din `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Porniți Arroxy din Terminal sau din Finder după eliminarea carantinei.",
  dl_macos_damaged_h4:
    "Remedierea carantinei Gatekeeper",
  dl_macos_damaged_p:
    "Prima comandă elimină atributul de carantină atașat de macOS la descărcarea fișierului; a doua pornește aplicația. De obicei nu aveți nevoie de `sudo`, deoarece copia din `/Applications` vă aparține — adăugați-l doar dacă primiți o eroare de permisiuni.",
  dl_macos_arch_note:
    "**Apple Silicon sau Intel:** pe un Mac din seria M (M1 / M2 / M3 / M4), descărcați DMG-ul `arm64`. Pe Mac-urile Intel, descărcați DMG-ul `x64`. Rularea versiunii greșite funcționează tot prin Rosetta, dar este vizibil mai lentă.",

  dl_linux_first_h3: "Prima pornire în Linux",
  dl_linux_appimagelauncher:
    "**Integrare opțională în desktop:** instalați o dată [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), iar orice AppImage pe care faceți dublu clic este înregistrat automat în meniul de lansare — fără fișier `.desktop` manual.",

  dl_verify_h3: "Verificați descărcarea (SHA256)",
  dl_verify_intro:
    "Fiecare versiune publică un fișier `SHA256SUMS` alături de fișierele binare. Pentru a verifica dacă descărcarea nu a fost corupită sau alterată pe parcurs, calculați local hash-ul fișierului și potriviți-l cu linia din `SHA256SUMS`. Deschideți pagina ultimei versiuni → **Assets** → descărcați `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell sau Prompt de comandă):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Doriți o scanare anti-malware terță? Încărcați fișierul pe [VirusTotal](https://www.virustotal.com). Câteva semnalări euristice generice din partea unor motoare minore sunt normale pentru aplicațiile Electron nesemnate; detecțiile răspândite din partea motoarelor majore ar fi o problemă reală.",

  dl_pm_intro:
    "Preferați alt canal? Și acestea funcționează și rămân în ritm cu fiecare versiune.",

  privacy_p1:
    "Descărcările sunt preluate direct prin [yt-dlp](https://github.com/yt-dlp/yt-dlp) de pe YouTube în folderul ales de dvs. — nimic nu trece printr-un server terț. Istoricul de vizionare, istoricul descărcărilor, URL-urile și conținutul fișierelor rămân pe dispozitivul dvs.",
  privacy_reports:
    "Fără urmărire — un semnal anonim pe zi (versiunea aplicației, sistemul de operare, limba, canalul de instalare, țara și aproximativ cât timp a trecut de la instalarea Arroxy), ca să putem număra utilizatorii activi și noi, iar atunci când Arroxy descarcă sau actualizează yt-dlp și FFmpeg, o notă anonimă despre dacă a reușit și aproximativ cât a durat. Fără ID-uri, URL-uri, titluri de videoclipuri, căi de fișiere sau informații despre cont. Le puteți dezactiva pe ambele în Setări.",
  privacy_p3:
    "Explorare își păstrează propriile conectări, separate de browserul dvs., iar Arroxy nu citește și nu completează niciodată un formular de conectare — tastați în pagina site-ului însuși. Descărcările rulează fără conectare; doar când una eșuează într-un mod pe care un cont îl poate remedia, Arroxy citește conectarea la momentul respectiv, o păstrează într-un fișier temporar pentru acea descărcare și șterge fișierul după aceea. Deconectarea din Explorare, în Setări, le uită.",
  faq_q1: "Este într-adevăr gratuit?",
  faq_a1: "Da — licență GPLv3, fără nivel premium, fără funcții blocate.",
  faq_q11: "Cu ce se deosebește Arroxy de alte interfețe grafice pentru yt-dlp?",
  faq_a11:
    "Majoritatea interfețelor grafice gratuite pentru yt-dlp sunt învelișuri care acceptă doar un link. Arroxy adaugă **Explorare**, un browser încorporat în aplicație care deschide YouTube sau orice alt site: navigați și descărcați fără a copia linkuri, și vă conectați acolo o singură dată pentru a descărca videoclipuri pe care contul dvs. le poate viziona, precum videoclipurile private și listele Vizionează mai târziu și Apreciate, fără export de cookie-uri. Vedeți [De ce Arroxy](#why).",
  faq_q2: "Ce calități video pot descărca?",
  faq_a2:
    "Tot ce oferă YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus doar audio. Fluxurile de 60 fps și HDR se păstrează ca atare, iar descărcarea pas cu pas vă lasă să alegeți AV1, VP9 sau H.264 la fiecare rezoluție.",
  faq_q3: "Pot extrage doar audio ca MP3?",
  faq_a3:
    "Da. Alegeți *doar audio* în meniul de formate și selectați MP3, M4A/AAC, Opus sau WAV.",
  faq_q4: "Cum descarc videoclipuri care necesită un cont YouTube?",
  faq_a4:
    "Conectați-vă o singură dată în fila Explorare. Arroxy poate apoi descărca videoclipuri pe care contul dvs. le poate viziona: videoclipurile private, videoclipurile cu restricție de vârstă dacă vârsta contului este verificată, plus listele Vizionează mai târziu și Apreciate. Folosește conectarea doar când o descărcare eșuează într-un mod pe care un cont îl poate remedia; restul se descarcă ca înainte. Aceasta este opțiunea **Conectare Explorare**, listată prima și marcată Recomandat în setările cookie-urilor, iar Arroxy o alege pentru dvs. prima dată când deschideți Explorare. Wiki-ul yt-dlp notează că [automatizarea cu conectare poate semnala un cont Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), deci un cont secundar este alegerea mai sigură.",
  faq_q5: "Va continua să funcționeze când YouTube schimbă ceva?",
  faq_a5:
    "yt-dlp este actualizat automat la pornire, iar Arroxy livrează prompt remedieri când YouTube schimbă ceva. Când o descărcare necesită conectare, Arroxy folosește conectarea dvs. din Explorare, dacă v-ați conectat acolo, iar cookie-urile dintr-un fișier sau din browser sunt disponibile în setările cookie-urilor.",
  faq_q6: "În ce limbi este disponibil Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} limbi, din start: {{LANG_NAME_LIST}}. Arroxy detectează automat limba sistemului de operare la prima pornire și puteți comuta oricând din selectorul de limbă din bara de instrumente. JSON-urile de limbă folosite la rulare se află în src/shared/i18n/locales/, iar cataloagele PO destinate traducătorilor se află în i18n/locales/ — deschideți un PR pe GitHub pentru a contribui.",
  faq_q7: "Trebuie să instalez altceva?",
  faq_a7:
    "Nu. yt-dlp, ffmpeg și ffprobe sunt descărcate automat la prima pornire și păstrate pe calculatorul dvs. După aceea, nu mai este nevoie de nicio configurare suplimentară.",
  faq_q8: "Pot descărca liste de redare sau canale întregi?",
  faq_a8:
    "Da — ambele. Lipiți un URL de listă de redare sau de canal (ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); alegeți câte intrări să se scaneze, apoi puneți în coadă toată lista sau alegeți videoclipuri anume. Filtrele pe interval de date vor veni în curând.",
  faq_q9: "macOS spune „aplicația este deteriorată” — ce fac?",
  faq_a9:
    "Este macOS Gatekeeper care blochează o aplicație nesemnată, nu o deteriorare reală. Vedeți [Prima pornire în macOS](#macos-first-launch) pentru comenzile Terminal care elimină carantina și pornesc Arroxy.",
  faq_q10: "Este legală descărcarea videoclipurilor YouTube?",
  faq_a10:
    "Depinde de țara dvs. și de ceea ce descărcați. Descărcați doar conținut pe care îl dețineți, conținut cu licență care permite descărcarea sau conținut pe care legea din țara dvs. vă permite să îl copiați. Sunteți responsabil să respectați [Termenii și condițiile](https://www.youtube.com/t/terms) YouTube și legile locale privind drepturile de autor. Vedeți [Termeni de utilizare](#terms).",
  plan_intro: "Încă planificate — aproximativ în ordinea priorității:",
  plan_col1: "Funcționalitate",
  plan_col2: "Descriere",
  plan_r1_name: "**Filtre pentru liste de redare și canale**",
  plan_r1_desc: "Filtre pe interval de date la enumerarea unei liste de redare sau a unui canal",
  plan_r2_name: "**Preferințe pentru pistele audio YouTube**",
  plan_r2_desc:
    "Setați o preferință globală pentru limba vorbită a pistei, cu suprascrieri pe profil, când YouTube oferă mai multe piste audio",
  plan_r3_name: "**Recuperare mai puternică la reîncercare**",
  plan_r3_desc:
    "O nouă cale de reîncercare pentru descărcările întrerupte de conexiuni la internet nesigure sau problematice",
  plan_r4_name: "**Panou complet de gestionare a descărcărilor**",
  plan_r4_desc:
    "Transformarea panoului cozii într-un manager mai complet, inclusiv schimbarea folderelor de destinație pentru elementele din coadă",
  plan_r5_name: "**Descărcări programate**",
  plan_r5_desc: "Pornirea unei cozi la o oră stabilită (rulări peste noapte)",
  plan_r9_name: "**Pachet AUR**",
  plan_r9_desc: "Instalare pe Arch Linux și Omarchy cu `yay -S arroxy-bin`",
  plan_cta:
    "Aveți în minte o funcționalitate? [Deschideți o cerere](../../issues) — contribuțiile comunității modelează prioritatea.",
  tech_content: TECH_CONTENT,
  support_h2: "Susțineți Arroxy",
  support_line: "Arroxy este gratuit și are licență GPLv3 — fără reclame, fără urmărire, fără nivel plătit. Dacă vă economisește timp, puteți susține dezvoltarea cu Bitcoin, Tron sau Ethereum: adresele se găsesc în [DONATE.md](DONATE.md), singura sursă oficială pentru ele. Arroxy nu vă va trimite niciodată o adresă prin e-mail sau mesaj direct. Marcarea depozitului cu stea, raportarea erorilor și îmbunătățirea traducerilor ajută la fel de mult.",
  tos_h2: "Termeni de utilizare",
  tos_note:
    "Arroxy este un instrument destinat exclusiv uzului personal, privat. Sunteți singurul responsabil pentru a vă asigura că descărcările dvs. respectă [Termenii și condițiile](https://www.youtube.com/t/terms) YouTube și legile privind drepturile de autor din jurisdicția dvs. Nu folosiți Arroxy pentru a descărca, reproduce sau distribui conținut pe care nu aveți dreptul să-l folosiți. Dezvoltatorii nu răspund pentru nicio utilizare abuzivă.",
  footer_credit:
    'GPLv3 · Făcut cu grijă de <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
