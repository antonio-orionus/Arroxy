const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell d'escriptori multiplataforma
- **React 19** + **TypeScript** — interfície d'usuari
- **Tailwind CSS v4** — estils
- **Zustand** — gestió de l'estat
- **yt-dlp** + **ffmpeg** — motor de descàrrega i muxing (tots dos s'obtenen en temps d'execució: yt-dlp es manté actualitzat; ffmpeg/ffprobe s'instal·len una sola vegada i es conserven entre actualitzacions)
- **Vite** + **electron-vite** — eines de compilació
- **Vitest** + **Playwright** — proves unitàries i d'extrem a extrem

</details>

<details>
<summary><strong>Compilar des del codi font</strong></summary>

### Requisits previs — totes les plataformes

| Eina    | Versió  | Instal·lació |
| ------- | ------- | ------------ |
| Git     | qualsevol | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` o \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` o \`package.json\` \`packageManager\` |

Recomanat: instal·la \`mise\` i després executa \`mise install\` al checkout. Sense mise, activa manualment Node.js des de \`.node-version\` i Bun des de \`package.json\` abans de \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Pot ser que calguin Visual Studio Build Tools i Python per a les recompilacions natives.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Després de clonar, executa \`mise trust && mise install\` des del checkout. Si el teu shell ja fa servir \`fnm\`, \`nvm\` o un Bun instal·lat amb Homebrew, activa mise a \`~/.zshrc\` perquè Arroxy faci servir Node.js 24.21.0 i Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Dependències de compilació i d'execució d'Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Només per a les proves E2E (Electron necessita una pantalla)
sudo apt install -y xvfb
\`\`\`

### Clonar i executar

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recomanat; omet-ho si has activat manualment les eines fixades
bun run bootstrap
bun run doctor
bun run dev            # aplicació Electron amb el renderitzador de Vite
\`\`\`

### Generar un distribuïble

\`\`\`bash
bun run build        # comprovació de tipus + compilació
bun run dist         # empaqueta per al sistema operatiu actual
bun run dist:win     # empaqueta per a Windows quan s'executa en un amfitrió compatible
\`\`\`

> \`bun run bootstrap\` instal·la les dependències, recompila les dependències de l'aplicació Electron, verifica Electron, prepara ffmpeg/ffprobe incrustats per al desenvolupament i instal·la Chromium de Playwright. Les versions publicades gestionen yt-dlp, ffmpeg i ffprobe en temps d'execució a la carpeta de dades de l'aplicació; cap d'ells no s'inclou dins de l'instal·lador.

</details>`;

export const ca = {
  icon_alt: "Mascota d'Arroxy",
  hero_image_alt: "Enganxa un enllaç o simplement navega. La pantalla d’URL i el navegador integrat d’Arroxy, amb una descàrrega en curs.",
  hero_banner_line1: "Enganxa un enllaç,",
  hero_banner_line2: "o simplement navega.",
  title: "Descarregador gratuït i de codi obert per a YouTube i més de 2000 llocs, amb navegador integrat. Per a Windows, macOS i Linux.",
  hero_promise: "Sense anuncis, límits d'ús ni vendes addicionals.",
  intro_workflow_h2: "Navega, inicia la sessió i descarrega",
  intro_workflow: "**Enganxa un enllaç o navega dins de l'aplicació.** Fes servir la pestanya Explora per descarregar el vídeo, la llista de reproducció o el canal que estàs veient, o fes clic dret en un enllaç per descarregar-lo.",
  intro_signin: "Inicia la sessió una vegada en cada lloc per descarregar contingut al qual el teu compte tingui accés, inclosos els vídeos privats i les llistes Mira-ho més tard i M'agrada. No cal exportar galetes. [Més sobre Explora](#why-explore).",
  dl_requirements: "**Requisits:** Windows 10/11 · macOS 13+ (Intel o Apple Silicon) · Linux (AppImage, Flatpak o tar.gz).",
  chip_browser: "Navegador integrat",
  chip_signin: "Amb la teva sessió",
  chip_resolution: "Fins a 8K",
  chip_framerate: "60 fps",
  chip_dolby: "Àudio Dolby",
  chip_clip: "Fragment d'un vídeo",
  chip_playlists: "Llistes de reproducció",
  chip_subtitles: "Subtítols",
  chip_sites: "+2000 llocs",
  privacy_anonymous_reports: "**Sense seguiment.** Arroxy només envia informes anònims que ens ajuden a comptar usuaris i resoldre problemes; mai els teus enllaços, vídeos, fitxers ni comptes. Els pots controlar a la configuració.",
  privacy_explore_sign_ins: "Explora conserva els seus propis inicis de sessió, separats del teu navegador, i sempre inicies la sessió a la pàgina del mateix lloc. Cada descàrrega només fa servir l'inici de sessió d'aquell lloc, el llegeix de nou i n'elimina la còpia després. Tancar la sessió d'Explora a la configuració els esborra.",
  chip_browser_encoded: "Navegador%20integrat",
  chip_signin_encoded: "Amb%20la%20teva%20sessi%C3%B3",
  chip_resolution_encoded: "Fins%20a%208K",
  chip_framerate_encoded: "60%20fps",
  chip_dolby_encoded: "%C3%80udio%20Dolby",
  chip_clip_encoded: "Fragment%20d%27un%20v%C3%ADdeo",
  chip_playlists_encoded: "Llistes%20de%20reproducci%C3%B3",
  chip_subtitles_encoded: "Subt%C3%ADtols",
  chip_sites_encoded: "%2B2000%20llocs",
  read_in_label: "Llegeix-ho en:",
  badge_release_alt: "Versió",
  badge_build_alt: "Compilació",
  badge_license_alt: "Llicència",
  badge_i18n_alt: "Idiomes",
  discord_badge_text: "Participa a la comunitat de Discord",
  discord_badge_encoded: "Participa%20a%20la%20comunitat%20de%20Discord",
  cta_latest: "↓ Instal·la Arroxy",
  cta_website: "Lloc web",
  website_url: "https://arroxy.com/",
  star_cta: "Si Arroxy t'estalvia temps, una ⭐ ajuda que altres el trobin.",
  ai_notice: "> 🌐 Aquesta traducció s'ha fet amb ajuda de la IA. El [README en anglès](README.md) és la font principal. Has trobat un error? [Obre una PR](../../pulls).",
  last_updated: "Última actualització: {{LAST_UPDATED}}.",
  toc_heading: "Contingut",
  why_h2: "Per què Arroxy",
  features_h2: "Funcions",
  dl_h2: "Instal·lació i primer inici",
  privacy_h2: "Privadesa",
  faq_h2: "Preguntes freqüents",
  roadmap_h2: "Full de ruta",
  tech_h2: "Construït amb",
  why_intro: "Una comparació cara a cara amb les alternatives més habituals:",
  why_r1: "Gratuït, sense nivell premium",
  why_r2: "Codi obert",
  why_r3: "Només processament local",
  why_r5: "Sense límits d'ús",
  why_r6: "Aplicació d'escriptori multiplataforma",
  why_r7: "Subtítols + SponsorBlock",
  why_r8: "Navegador integrat (navegar, iniciar la sessió, descarregar)",
  why_r9: "Vídeos que el teu propi compte pot veure, sense exportar galetes",
  why_table_note:
    "⚠️ = en part, o només en un nivell de pagament. A 4K Video Downloader, l'inici de sessió dins de l'aplicació per als vídeos privats és una funció de pagament; la majoria de les interfícies gràfiques gratuïtes de yt-dlp només accepten un fitxer de galetes o llegeixen les galetes del teu navegador.",
  why_summary:
    "Arroxy està pensat per a una sola cosa: un fitxer local net, tant si enganxes una URL com si trobes el vídeo a Explora. Sense vendes addicionals, sense recollida de dades.",
  why_explore_h3: "El que un simple embolcall de yt-dlp no pot fer: la pestanya Explora",
  why_explore_intro:
    "La majoria de descarregadors gratuïts de YouTube són un quadre d'URL sobre yt-dlp. Arroxy també fa servir yt-dlp, però a més té **Explora**, un navegador integrat a l'aplicació que obre YouTube o qualsevol altre lloc. Explora afegeix el que un quadre d'URL no pot:",
  why_explore_1:
    "**Vídeos que el teu compte pot veure, sense exportar galetes** — els teus vídeos privats, les teves llistes Mira-ho més tard i M'agrada, vídeos amb restricció d'edat en un compte amb l'edat verificada, i pàgines d'altres llocs que necessiten el teu inici de sessió. Un embolcall simple necessita una exportació de cookies.txt o llegeix les galetes del teu navegador web. A Arroxy inicies la sessió una vegada a Explora i ell fa la resta",
  why_explore_4:
    "**Sense copiar enllaços** — troba un vídeo, una llista de reproducció o un canal a Explora i descarrega'l amb un sol clic, o fes clic dret en qualsevol enllaç de la pàgina",
  why_explore_5:
    "**Blocador d'anuncis quan el vulguis** — un clic a l'escut bloqueja anuncis i rastrejadors a les pàgines d'Explora",
  feat_explore_h3: "Explora: navega per la web dins d'Arroxy",
  feat_explore_1:
    "**Pestanya Explora** — navega per YouTube o per qualsevol altre lloc dins d'Arroxy i descarrega el que trobis sense copiar enllaços. **Descarrega · *el teu perfil*** posa a la cua el vídeo, la llista de reproducció o el canal que estàs mirant; la fletxa que hi ha al costat canvia de perfil i la vareta obre la descàrrega pas a pas per triar formats, subtítols i més",
  feat_explore_6:
    "**Clic dret per descarregar** — fes clic dret en qualsevol enllaç de vídeo, llista de reproducció o canal a Explora per baixar-lo amb el teu perfil, triar un altre perfil a **Descarrega amb**, obrir la descàrrega pas a pas o copiar l'enllaç. No cal obrir cada vídeo abans",
  feat_explore_7:
    "**Disseny compacte** — un clic a la barra d'eines d'Explora hi mou les pestanyes d'Arroxy i dona més espai a la pàgina",
  feat_explore_2:
    "**Barra d'adreces** — escriu per cercar a YouTube o introdueix qualsevol adreça web per obrir aquest lloc",
  feat_explore_3:
    "**Descàrregues que requereixen un compte** — inicia la sessió una vegada a Explora i Arroxy podrà baixar els vídeos que el teu compte pot veure: els teus vídeos privats, els vídeos amb restricció d'edat si el compte té l'edat verificada i les teves llistes Mira-ho més tard i M'agrada. Inicia també la sessió en altres llocs i les seves descàrregues faran servir aquest inici de sessió quan el necessitin. Arroxy continua baixant primer sense sessió i només fa servir el teu inici de sessió a Explora quan una descàrrega falla d'una manera que un compte pot resoldre",
  feat_explore_4:
    "**Fes servir un compte secundari** — la primera pantalla d'Explora n'explica el motiu: descarregar amb un compte comporta cert risc que el compte quedi restringit. Tanca la sessió d'Explora des de la configuració quan vulguis oblidar els teus inicis de sessió",
  feat_explore_5:
    "**Blocador d'anuncis** — desactivat de manera predeterminada. Un clic a l'escut de la barra d'eines d'Explora bloqueja anuncis i rastrejadors a les seves pàgines, sense afectar les descàrregues. És possible que YouTube posi traves als blocadors d'anuncis als comptes amb la sessió iniciada",
  feat_quality_h3: "Qualitat i formats",
  feat_quality_1: "Fins a **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Alta taxa de fotogrames i HDR** conservats tal qual — 60 fps, HDR10",
  feat_quality_3:
    "**Àudio** — exporta només l'àudio com a MP3, M4A/AAC, Opus o WAV. En les descàrregues interactives, tria les pistes envoltants/Dolby originals de la font (AC-3, E-AC-3, 5.1, DRC) quan hi siguin, o defineix un valor global **Prefereix envoltant / Dolby**",
  feat_quality_4:
    "**Perfils amb un objectiu** — *Millor imatge* (AV1 · VP9) o *Smart TV* (MP4 · H.264), desats com a Automàtic, MP4, MKV o WebM sense recodificar. L'HDR és *Automàtic* (només quan la teva pantalla el pot mostrar), *SDR* o *HDR*",
  feat_quality_5:
    "**Tots els còdecs a totes les resolucions** — la descàrrega pas a pas llista AV1, VP9 i H.264 un al costat de l'altre a cada resolució, de manera que pots triar el que reprodueix el teu televisor o editor",
  feat_quality_6:
    "**Sap què és realment un flux** — es marquen les mides que YouTube ha escalat amb IA, els idiomes d'àudio doblats amb IA, els fluxos amb taxa de bits millorada, els vídeos de 360° i les còpies malmeses o amb marca d'aigua. Els perfils ometen els fluxos escalats amb IA tret que els permetis",
  feat_privacy_h3: "Privadesa i control",
  feat_privacy_1:
    "Processament 100% local — les descàrregues van directament de YouTube al teu disc",
  feat_privacy_2: "**Codi obert** — cada línia es pot auditar, amb llicència GPLv3",
  feat_privacy_3: "Fitxers desats directament a la carpeta que triïs",
  feat_workflow_h3: "Flux de treball",
  feat_workflow_12:
    "**Drecera global de descàrrega** — copia un enllaç en qualsevol aplicació i prem `Ctrl+Shift+D` (`Cmd+Shift+D` a macOS); Arroxy el posa a la cua amb el teu perfil actiu sense obrir la finestra, i una notificació ho confirma. Activada de manera predeterminada i reassignable",
  feat_workflow_1:
    "**Modes d'inici flexibles** — tria entre una descàrrega individual guiada, un selector de llista de reproducció/canal, enganxar URL en bloc, Descàrrega ràpida amb valors desats, o navegar i descarregar des d'Explora",
  feat_workflow_2:
    "**Cua de descàrregues central** — cada tasca individual, de llista, en bloc o ràpida arriba a un sol lloc per controlar-ne el progrés, la pausa, la represa, la cancel·lació, el reintent i la prioritat",
  feat_workflow_3:
    "**Vigilància del porta-retalls** — copia l'enllaç d'un vídeo i omple el camp d'URL quan tornes a Arroxy, amb **Desfés** si no ho volies. Mentre Arroxy està ocupat, l'enllaç espera fins que tornis a la pestanya d'URL (desactiva-ho a la configuració)",
  feat_workflow_4:
    "**Neteja automàtica d'URL** — elimina els paràmetres de seguiment (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) i desembolica els enllaços `youtube.com/redirect`",
  feat_workflow_5:
    "**Mode safata** — en tancar la finestra, les descàrregues continuen en segon pla",
  feat_workflow_6:
    "**{{LANG_COUNT}} idiomes** — detecta automàticament la configuració regional del sistema i es pot canviar en qualsevol moment",
  feat_workflow_7:
    "**Sincronització de llistes** — torna a examinar una llista de reproducció amb una carpeta local per ometre els vídeos ja baixats; genera un fitxer de llista `.m3u` que s'actualitza a mesura que es baixa cada vídeo",
  feat_workflow_8:
    "**Controls de velocitat i ritme** — limita l'ample de banda de descàrrega, defineix quantes parts d'un vídeo es baixen alhora i afegeix retards entre sol·licituds amb valors predefinits (*Desactivada · Equilibrada · Cautelosa · Personalitzada*)",
  feat_workflow_9:
    "**Plantilles de nom de fitxer** — posa nom a les descàrregues a la teva manera amb `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` i `{playlist_index}`, de manera global o per perfil de descàrrega",
  feat_workflow_10:
    "**Descàrregues alhora i reintent automàtic** — tria quantes descàrregues de la cua s'executen al mateix temps i deixa que Arroxy torni a provar una descàrrega que ha topat amb un problema de xarxa o de servidor, esperant més abans de cada intent",
  feat_workflow_11:
    "**Perfils per element de la llista** — assigna a cada vídeo d'una llista de reproducció el seu propi perfil de descàrrega en lloc d'una sola configuració per a tota la llista, de manera que en una sola passada pots arxivar alguns a màxima qualitat i desar la resta només com a àudio",
  feat_workflow_13:
    "**La Descàrrega ràpida funciona en segon pla** — l'enllaç apareix de seguida a Descàrregues i s'hi prepara, una nota amb **Mostra** ho confirma i el camp d'URL es buida per al proper enllaç. Inicia'n tants com vulguis mentre els anteriors es preparen",
  feat_workflow_14:
    "**Descàrregues t'avisa del que et necessita** — si Arroxy no pot llegir un enllaç, la seva fila diu per què i ofereix la solució: Torna-ho a provar, activar les galetes o iniciar la sessió a Explora. Amb les galetes desactivades, **Inicia la sessió a Explora** ho torna a provar per tu quan hi has iniciat la sessió. Una llista de reproducció més llarga que el teu límit de càrrega espera a la seva fila que triïs tota la llista, els primers elements o una revisió. La pestanya Descàrregues compta les files que t'esperen",
  feat_workflow_15:
    "**Descarrega només un fragment d'un vídeo** — tria un inici i un final, o un capítol, a la pantalla Format i Arroxy desa només aquest interval, amb l'interval al nom després de l'identificador del vídeo. Els talls cauen al fotograma clau més proper; activa el tall exacte per recodificar-lo",
  feat_workflow_16:
    "**Elimina les descàrregues acabades** — opcional: una descàrrega acabada surt de la llista 5 segons després. Els seus fitxers es queden al disc i les descàrregues fallides continuen a la llista",
  feat_workflow_17:
    "**Mida i Falta a Descàrregues** — una columna **Mida** ordenable mostra quant d'espai ocupa cada descàrrega, i **Falta** assenyala els fitxers moguts o suprimits fora d'Arroxy",
  feat_workflow_18:
    "**Aurora o Minimal, fosc o clar** — panells de vidre sobre un cel en moviment, o superfícies sòlides i discretes; canvia des del peu de pàgina. Els ordinadors sense acceleració gràfica reben Minimal automàticament",
  feat_workflow_19:
    "**Barra de menús del Mac** — a macOS, obre la configuració (`Cmd+,`), defineix el límit de velocitat de descàrrega, canvia l'estil i el tema, i obre els registres o desa un fitxer de diagnòstic des de la barra de menús",
  feat_workflow_20:
    "**Canvia un perfil des de qualsevol descàrrega** — ajusta una descàrrega i després actualitza el perfil del qual ha partit (amb una previsualització del que canvia) o desa la configuració com a perfil nou. En canviar de perfil, es pregunta si vols conservar les teves edicions",
  feat_post_h3: "Subtítols i postprocessament",
  feat_post_1:
    "**Subtítols** en SRT, VTT o ASS — manuals o autogenerats, en qualsevol idioma disponible",
  feat_post_2:
    "Desa'ls al costat del vídeo, incrusta'ls en un `.mkv` o organitza'ls en una subcarpeta `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — omet o marca com a capítols els patrocinis, les introduccions, els finals i l'autopromoció",
  feat_post_4:
    "**Metadades incrustades** — títol, data de pujada, canal, descripció, miniatura i marcadors de capítol escrits dins del fitxer",
  feat_post_5:
    "**Lots només de subtítols** — enganxa una llista d'URL o obre una llista de reproducció, tria Subtítols i obtén només els fitxers de subtítols de cada vídeo",
  feat_sites_h3: "YouTube + 2000 llocs",
  feat_sites_1:
    "**YouTube, al complet** — Vídeos, Shorts, Canals, Llistes de reproducció, YouTube Music i Pòdcasts tractats com a fonts de primera classe",
  feat_sites_2:
    "**Més de 2000 llocs més** mitjançant yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable i molts més",
  feat_sites_3:
    "**Només àudio i subtítols** funcionen a tots els llocs compatibles, no només a YouTube",
  feat_sites_4:
    "Si un lloc canvia, yt-dlp publica correccions cada setmana i Arroxy actualitza el binari automàticament en iniciar-se",
  shot1_cap:
    "<b>Inici de la Descàrrega ràpida</b><br/>Enganxa una URL i descarrega-la a l'instant amb el teu perfil actiu",
  shot2_cap:
    "<b>Perfils de descàrrega reutilitzables</b><br/>Desa valors predefinits de format, qualitat i sortida — reutilitza'ls a cada descàrrega",
  shot3_cap:
    "<b>Pistes d'àudio en diversos idiomes</b><br/>Tria l'idioma d'àudio exacte que inclou un vídeo",
  shot4_cap:
    "<b>Àudio envoltant / Dolby</b><br/>Les pistes 5.1 i Dolby es detecten i es conserven",
  shot5_cap:
    "<b>Mode d'URL en bloc</b><br/>Enganxa una llista, elimina els duplicats automàticament i posa-ho tot a la cua alhora",
  shot6_cap:
    "<b>Cua de descàrregues en paral·lel</b><br/>Diverses descàrregues alhora amb progrés en directe",
  hotkey_fig_alt:
    "Drecera global de descàrrega d'Arroxy — Ctrl+Shift+D a Windows i Linux, Cmd+Shift+D a macOS, que envia l'enllaç copiat directament a la cua de descàrregues",
  hotkey_fig_cap:
    "<b>Drecera global de descàrrega</b><br/>Copia un enllaç on sigui, prem una vegada — arriba a la cua i comença a descarregar-se",
  shot7_cap: "<b>Perfils per element de la llista</b><br/>Dona a cada vídeo el seu propi perfil — arxiva'n alguns en 4K i desa la resta només com a àudio",
  shot8_cap:
    "<b>Explora</b><br/>Navega per YouTube o per qualsevol altre lloc dins d'Arroxy i descarrega la pàgina on ets amb el teu perfil actiu",
  shot9_cap:
    "<b>La primera pantalla d'Explora</b><br/>Una ullada ràpida a Explora i per què un compte secundari és l'inici de sessió més segur",
  shot10_cap:
    "<b>Descàrregues t'avisa del que et necessita</b><br/>Els enllaços es preparen en segon pla; un de fallit ofereix la solució, una llista llarga espera la teva decisió",
  shot11_cap:
    "<b>Descarrega només un fragment d'un vídeo</b><br/>Tria un inici i un final, o un capítol — Arroxy desa només aquest interval",
  shot12_cap:
    "<b>Editor de perfils</b><br/>Ajusta un perfil: tipus de fitxer, resolució, subtítols, destinació, plantilla de nom de fitxer i més",
  shot13_cap:
    "<b>Fosc o clar, vidre o sòlid</b><br/>Quatre aspectes per triar: panells de vidre sobre un cel en moviment o superfícies sòlides i discretes, cadascun en fosc i en clar",
  shot14_cap:
    "<b>8K HDR a 60 fps</b><br/>Totes les resolucions, còdecs i fluxos HDR que ofereix un vídeo, un al costat de l'altre",
  dl_platform_col: "Plataforma",
  dl_format_col: "Descàrrega directa",
  dl_oneline_note:
    "Les compilacions són només x86_64. No tens `curl`? Canvia `curl -fsSL` per `wget -qO-`.",
  dl_win_scoop:
    "Prefereixes Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Instal·lador (NSIS) o `.exe` portàtil",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` o `.flatpak` (en un entorn aïllat)",
  dl_grab: "Tots els fitxers de la versió →",
  dl_pkg_h3: "Instal·la amb un gestor de paquets",
  dl_channel_col: "Canal",
  dl_command_col: "Ordre",
  dl_win_h3: "Windows: instal·lador o portàtil",
  dl_win_col_installer: "Instal·lador NSIS",
  dl_win_col_portable: "`.exe` portàtil",
  dl_win_r1: "Cal instal·lar-lo",
  dl_win_r1_installer: "Sí",
  dl_win_r1_portable: "No — s'executa des de qualsevol lloc",
  dl_win_r2: "Actualitzacions automàtiques",
  dl_win_r2_installer: "✅ dins de l'aplicació",
  dl_win_r2_portable: "❌ descàrrega manual",
  dl_win_r3: "Velocitat d'inici",
  dl_win_r3_installer: "✅ més ràpid",
  dl_win_r3_portable: "⚠️ inici en fred més lent",
  dl_win_r4: "S'afegeix al menú Inici",
  dl_win_r5: "Desinstal·lació fàcil",
  dl_win_r5_portable: "❌ suprimeix el fitxer",
  dl_win_rec:
    "**Recomanació:** fes servir l'instal·lador NSIS per tenir actualitzacions automàtiques i un inici més ràpid. Fes servir l'`.exe` portàtil si vols una opció sense instal·lació i sense registre.",
  dl_win_smartscreen_h4: "Advertència de Windows SmartScreen",
  dl_win_smartscreen_intro:
    "En el primer inici potser veuràs **«Windows ha protegit el teu ordinador»** o **«Editor desconegut»**. Això afecta tant `Arroxy-win-x64-Setup.exe` com `Arroxy-win-x64-Portable.exe`. Arroxy és gratuït i de codi obert, i les compilacions de Windows no estan signades amb un certificat de pagament, per això SmartScreen les marca. **No** vol dir automàticament que Arroxy no sigui segur. Per continuar:",
  dl_win_smartscreen_step1: "Fes clic a **Més informació**.",
  dl_win_smartscreen_step2: "Fes clic a **Executa igualment**.",
  dl_win_smartscreen_official:
    "Descarrega Arroxy només de la pàgina oficial de versions de GitHub. Si has obtingut el fitxer d'un altre lloc web o te l'ha enviat algú, suprimeix-lo i baixa'n una còpia nova de la font oficial. El codi font és públic, així que el pots inspeccionar o compilar Arroxy tu mateix si ho prefereixes.",
  dl_macos_h3: "Primer inici a macOS",
  dl_macos_warning:
    "Arroxy encara no està signat, així que macOS Gatekeeper pot mostrar l'advertència d'aplicació malmesa en el primer inici. És normal — no és senyal que el fitxer estigui realment malmès.",
  dl_macos_m1_h4: "Mètode amb el Terminal:",
  dl_macos_step1: "Arrossega `Arroxy.app` des del DMG muntat fins a `/Applications`.",
  dl_macos_step2:
    "Obre el Terminal i executa `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Executa `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Si la ruta de l'aplicació és diferent, substitueix `/Applications/Arroxy.app` per la ruta on l'has instal·lat.",
  dl_macos_step5:
    "Introdueix la contrasenya del teu Mac si `sudo` te la demana.",
  dl_macos_after:
    "Un cop eliminada la quarantena, Arroxy s'obre amb normalitat.",
  dl_macos_m2_h4: "Mètode amb el Terminal:",
  dl_macos_note:
    "Les compilacions de macOS es produeixen mitjançant CI en executors Apple Silicon i Intel. Si tens problemes, [obre una incidència](../../issues): els comentaris dels usuaris de macOS donen forma activament al cicle de proves de macOS.",
  dl_linux_h3: "Primer inici a Linux",
  dl_linux_intro:
    "Els AppImage s'executen directament, sense instal·lació. Només cal marcar el fitxer com a executable.",
  dl_linux_m1_text:
    "**Gestor de fitxers:** fes clic dret a l'`.AppImage` → **Propietats** → **Permisos** → activa **Permet executar el fitxer com a programa** i després fes-hi doble clic.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Si l'inici continua fallant, executa'l sense muntar-lo — no cal cap paquet FUSE:",
  dl_linux_targz_h4: "Tarball senzill (sense FUSE, sense instal·lació):",
  dl_linux_targz_text: "La compilació `.tar.gz` és la mateixa aplicació sense l'embolcall d'AppImage — extreu-la on vulguis i executa-la. Sense instal·lador i sense cap paquet FUSE.",
  dl_linux_arch_note: "**Les descàrregues de Linux de la pàgina de versions són només x86_64.** En màquines ARM64 (Raspberry Pi, Asahi Linux) el Flatpak s'instal·la igualment, però falla en iniciar-se amb `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Per què pots veure una advertència",
  dl_warning_p1:
    "Arroxy és de codi obert i té llicència GPLv3. Les compilacions de Windows i macOS **no estan signades**: els certificats de signatura Apple Developer ID i Windows EV costen centenars de dòlars l'any, cosa que un projecte independent paga de la seva butxaca. Sense aquestes signatures, Windows SmartScreen i macOS Gatekeeper t'avisaran en el primer inici. Les advertències signifiquen que *el teu sistema operatiu no reconeix l'editor*; no signifiquen que Arroxy sigui programari maliciós.",
  dl_warning_p2:
    "Tres maneres de verificar Arroxy tu mateix, per ordre creixent de rigor:\n\n- **Llegeix el codi font.** Cada línia és a [GitHub](https://github.com/antonio-orionus/Arroxy) i el pots [compilar des del codi font](#tech).\n- **Comprova el SHA256.** Compara el teu fitxer amb el [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) publicat — consulta [Verifica la teva descàrrega](#verify) a continuació.\n- **Fes una anàlisi de tercers.** Puja el fitxer a [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Primer inici a Windows",
  shot_smartscreen_more_alt:
    "Diàleg de SmartScreen «Windows ha protegit el teu ordinador» amb l'enllaç «Més informació» ressaltat",
  shot_smartscreen_run_alt:
    "Diàleg de SmartScreen després d'ampliar Més informació, amb el botó «Executa igualment»",
  dl_win_defender_h4: "Si Windows Defender marca o elimina el fitxer",
  dl_win_defender_p:
    "De vegades, l'heurística de Defender marca com a sospitosos els instal·ladors NSIS sense signar i els Electron portàtils. Si Defender posa en quarantena `Arroxy-win-x64-Setup.exe` o `Arroxy-win-x64-Portable.exe`, restaura'l des de **Seguretat de Windows → Protecció contra virus i amenaces → Historial de protecció** i afegeix després l'executable d'Arroxy com a element permès a **Gestiona la configuració → Afegeix o elimina exclusions**. Igual que amb SmartScreen, el motiu és la falta de signatura de l'editor, no programari maliciós detectat.",

  dl_macos_first_h3: "Primer inici a macOS",
  dl_macos_intro:
    "Les compilacions d'Arroxy per a macOS estan signades ad hoc però no certificades per Apple, així que Gatekeeper bloqueja el primer inici amb *«Arroxy.app» no s'ha obert — Apple no ha pogut verificar que «Arroxy.app» no contingui programari maliciós*. Això vol dir que macOS no pot comprovar l'aplicació amb Apple, no que hi hagi res malament amb els fitxers. Instal·lar amb Homebrew evita aquest diàleg del tot. Si has fet servir el DMG, una ordre al Terminal ho soluciona:",
  dl_macos_sequoia_h4: "Solució amb el Terminal per a macOS actual",
  dl_macos_sequoia_intro:
    "Fes servir el Terminal després de copiar Arroxy a Aplicacions:",
  dl_macos_sequoia_step1:
    "Arrossega `Arroxy.app` des del DMG muntat fins a `/Applications`.",
  dl_macos_sequoia_step2:
    "Obre el Terminal i executa aquestes dues ordres:",
  dl_macos_sequoia_step3:
    "Executa `open /Applications/Arroxy.app` per iniciar Arroxy.",
  dl_macos_sequoia_step4:
    "Si la ruta de l'aplicació és diferent, substitueix `/Applications/Arroxy.app` per la ruta on l'has instal·lat.",
  dl_macos_sonoma_h4: "Solució amb el Terminal per a macOS anteriors",
  dl_macos_sonoma_step1:
    "Arrossega `Arroxy.app` des del DMG muntat fins a `/Applications`.",
  dl_macos_sonoma_step2:
    "Obre el Terminal i elimina la quarantena de `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Inicia Arroxy des del Terminal o el Finder un cop eliminada la quarantena.",
  dl_macos_damaged_h4:
    "Solució de la quarantena de Gatekeeper",
  dl_macos_damaged_p:
    "La primera ordre elimina l'atribut de quarantena que macOS va adjuntar quan es va baixar el fitxer; la segona inicia l'aplicació. Normalment no necessites `sudo`, perquè la còpia a `/Applications` és teva — afegeix-lo només si obtens un error de permisos.",
  dl_macos_arch_note:
    "**Apple Silicon o Intel:** en un Mac de la sèrie M (M1 / M2 / M3 / M4), baixa el DMG `arm64`. En els Mac Intel, baixa el DMG `x64`. Executar la compilació equivocada continua funcionant mitjançant Rosetta, però és notablement més lent.",

  dl_linux_first_h3: "Primer inici a Linux",
  dl_linux_appimagelauncher:
    "**Integració opcional amb l'escriptori:** instal·la [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) una vegada i qualsevol AppImage al qual facis doble clic es registrarà automàticament al menú de l'iniciador — sense necessitat de cap fitxer `.desktop` manual.",

  dl_verify_h3: "Verifica la teva descàrrega (SHA256)",
  dl_verify_intro:
    "Cada versió publica un fitxer `SHA256SUMS` al costat dels binaris. Per comprovar que la teva descàrrega no s'ha corromput ni manipulat durant el trànsit, calcula el hash del teu fitxer en local i compara'l amb la línia de `SHA256SUMS`. Obre la pàgina de l'última versió → **Assets** → baixa `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell o Símbol del sistema):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Vols una anàlisi de programari maliciós de tercers? Puja el fitxer a [VirusTotal](https://www.virustotal.com). Un grapat d'avisos d'heurística genèrica de motors menors és normal en aplicacions Electron sense signar; deteccions generalitzades de motors importants serien una preocupació real.",

  dl_pm_intro:
    "Prefereixes un altre canal? Aquests també funcionen, i van al ritme de cada versió.",

  privacy_p1:
    "Les descàrregues s'obtenen directament mitjançant [yt-dlp](https://github.com/yt-dlp/yt-dlp) de YouTube a la carpeta que triïs — res no passa per un servidor de tercers. L'historial de reproducció, l'historial de descàrregues, les URL i el contingut dels fitxers es queden al teu dispositiu.",
  faq_q1: "De debò és gratuït?",
  faq_a1: "Sí — amb llicència GPLv3, sense nivell premium, sense funcions bloquejades.",
  faq_q11: "En què es diferencia Arroxy d'altres interfícies gràfiques de yt-dlp?",
  faq_a11:
    "La majoria d'interfícies gràfiques gratuïtes de yt-dlp són embolcalls que només accepten un enllaç. Arroxy hi afegeix **Explora**, un navegador integrat a l'aplicació que obre YouTube o qualsevol altre lloc: navegues i descarregues sense copiar enllaços, i hi inicies la sessió una vegada per baixar els vídeos que el teu compte pot veure, com els teus vídeos privats i les teves llistes Mira-ho més tard i M'agrada, sense exportar galetes. Consulta [Per què Arroxy](#why).",
  faq_q2: "Quines qualitats de vídeo puc baixar?",
  faq_a2:
    "Tot el que serveix YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, a més de només àudio. Els fluxos de 60 fps i HDR es conserven tal qual, i la descàrrega pas a pas et deixa triar AV1, VP9 o H.264 a cada resolució.",
  faq_q3: "Puc extreure només l'àudio com a MP3?",
  faq_a3:
    "Sí. Tria *només àudio* al menú de formats i selecciona MP3, M4A/AAC, Opus o WAV.",
  faq_q4: "Com baixo vídeos que requereixen un compte de YouTube?",
  faq_a4:
    "Inicia la sessió una vegada a la pestanya Explora. Després Arroxy podrà baixar els vídeos que el teu compte pot veure: els teus vídeos privats, els vídeos amb restricció d'edat si el compte té l'edat verificada i les teves llistes Mira-ho més tard i M'agrada. Fa servir l'inici de sessió només quan una descàrrega falla d'una manera que un compte pot resoldre; tota la resta es baixa com abans. És l'opció **Inici de sessió a Explora**, que apareix primera i marcada com a Recomanada a la configuració de galetes, i Arroxy la tria per tu la primera vegada que obres Explora. La wiki de yt-dlp assenyala que [l'automatització amb sessió iniciada pot fer que es marqui un compte de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), així que un compte secundari és l'opció més segura.",
  faq_q5: "Continuarà funcionant quan YouTube canviï alguna cosa?",
  faq_a5:
    "yt-dlp s'actualitza automàticament en iniciar-se, i Arroxy publica correccions de pressa quan YouTube canvia alguna cosa. Quan una descàrrega necessita iniciar la sessió, Arroxy fa servir el teu inici de sessió a Explora si hi has iniciat la sessió, i a la configuració de galetes tens disponibles les galetes d'un fitxer o del teu navegador.",
  faq_q6: "En quins idiomes està disponible Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} idiomes, de sèrie: {{LANG_NAME_LIST}}. Arroxy detecta automàticament l'idioma del teu sistema operatiu en el primer inici i el pots canviar en qualsevol moment des del selector d'idioma de la barra d'eines. Els JSON de configuració regional d'execució són a src/shared/i18n/locales/, i els catàlegs PO per als traductors són a i18n/locales/ — obre una PR a GitHub per contribuir-hi.",
  faq_q7: "Necessito instal·lar res més?",
  faq_a7:
    "No. yt-dlp, ffmpeg i ffprobe es baixen automàticament en el primer inici i es desen a la memòria cau de la teva màquina. Després, no cal cap configuració addicional.",
  faq_q8: "Puc baixar llistes de reproducció o canals sencers?",
  faq_a8:
    "Sí — tots dos. Enganxa l'URL d'una llista de reproducció o d'un canal (p. ex., `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); tria quantes entrades vols examinar i després posa a la cua tota la llista o tria vídeos concrets. Els filtres per interval de dates arribaran aviat.",
  faq_q9: "macOS diu que «l'aplicació està malmesa» — què faig?",
  faq_a9:
    "És macOS Gatekeeper bloquejant una aplicació sense signar, no un dany real. Consulta [Primer inici a macOS](#macos-first-launch) per veure les ordres del Terminal que eliminen la quarantena i inicien Arroxy.",
  faq_q10: "És legal descarregar vídeos de YouTube?",
  faq_a10:
    "Depèn del teu país i del que descarregues. Descarrega només contingut que sigui teu, contingut amb llicència per descarregar-lo o contingut que la llei del teu país et permeti copiar. Ets responsable de complir les [Condicions del servei](https://www.youtube.com/t/terms) de YouTube i les lleis de drets d'autor del teu país. Consulta [Condicions d'ús](#terms).",
  plan_intro: "Encara previst — aproximadament per ordre de prioritat:",
  plan_col1: "Funció",
  plan_col2: "Descripció",
  plan_r1_name: "**Filtres de llistes i canals**",
  plan_r1_desc: "Filtres per interval de dates en enumerar una llista de reproducció o un canal",
  plan_r2_name: "**Preferències de pista d'àudio de YouTube**",
  plan_r2_desc:
    "Defineix una preferència de pista d'idioma parlat per a tota l'aplicació, amb substitucions per perfil quan YouTube ofereixi diverses pistes d'àudio",
  plan_r3_name: "**Recuperació de reintents més sòlida**",
  plan_r3_desc:
    "Un nou camí de reintent per a les descàrregues interrompudes per connexions a internet poc fiables o problemàtiques",
  plan_r4_name: "**Calaix complet del gestor de descàrregues**",
  plan_r4_desc:
    "Convertir el calaix de la cua en un gestor més complet, inclòs el canvi de les carpetes de destinació dels elements en cua",
  plan_r5_name: "**Descàrregues programades**",
  plan_r5_desc: "Iniciar una cua a una hora determinada (execucions nocturnes)",
  plan_r9_name: "**Paquet d'AUR**",
  plan_r9_desc: "Instal·la a Arch Linux i Omarchy amb `yay -S arroxy-bin`",
  plan_cta:
    "Tens alguna funció al cap? [Obre una sol·licitud](../../issues) — l'opinió de la comunitat determina la prioritat.",
  tech_content: TECH_CONTENT,
  support_h2: "Dona suport a Arroxy",
  support_line: "Arroxy és gratuït i amb llicència GPLv3 — sense anuncis, sense seguiment, sense nivell de pagament. Si t'estalvia temps, pots donar suport al desenvolupament amb Bitcoin, Tron o Ethereum: les adreces són a [DONATE.md](DONATE.md), que és l'única font oficial. Arroxy mai no t'enviarà una adreça per correu electrònic ni per missatge directe. Donar una estrella al repositori, informar d'errors i millorar les traduccions ajuda igual de bé.",
  tos_h2: "Condicions d'ús",
  tos_note:
    "Arroxy és una eina només per a ús personal i privat. Ets l'únic responsable d'assegurar que les teves descàrregues compleixin les [Condicions del servei](https://www.youtube.com/t/terms) de YouTube i les lleis de drets d'autor de la teva jurisdicció. No facis servir Arroxy per descarregar, reproduir ni distribuir contingut que no tinguis dret a utilitzar. Els desenvolupadors no es fan responsables de cap mal ús.",
  footer_credit:
    'GPLv3 · Fet amb cura per <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
