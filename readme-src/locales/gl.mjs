const TECH_CONTENT = `<details>
<summary><strong>Tecnoloxía</strong></summary>

- **Electron** — contedor de escritorio multiplataforma
- **React 19** + **TypeScript** — interface de usuario
- **Tailwind CSS v4** — estilos
- **Zustand** — xestión do estado
- **yt-dlp** + **ffmpeg** — motor de descarga e muxing (ambos se obteñen en execución: yt-dlp mantense actualizado; ffmpeg/ffprobe instálanse unha soa vez e consérvanse entre actualizacións)
- **Vite** + **electron-vite** — ferramentas de compilación
- **Vitest** + **Playwright** — probas unitarias e de extremo a extremo

</details>

<details>
<summary><strong>Compilar desde o código fonte</strong></summary>

### Requisitos previos — todas as plataformas

| Ferramenta | Versión | Instalación |
| ---------- | ------- | ----------- |
| Git        | calquera | [git-scm.com](https://git-scm.com) |
| Node.js    | 24.21.0 | \`mise install\` ou \`.node-version\` |
| Bun        | 1.4.2   | \`mise install\` ou \`package.json\` \`packageManager\` |

Recomendado: instala \`mise\` e despois executa \`mise install\` no checkout. Sen mise, activa manualmente Node.js desde \`.node-version\` e Bun desde \`package.json\` antes de \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Pode que fagan falta Visual Studio Build Tools e Python para as recompilacións nativas.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Despois de clonar, executa \`mise trust && mise install\` desde o checkout. Se o teu shell xa usa \`fnm\`, \`nvm\` ou un Bun de Homebrew, activa mise en \`~/.zshrc\` para que Arroxy use Node.js 24.21.0 e Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Dependencias de compilación e de execución de Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Só para probas E2E (Electron precisa unha pantalla)
sudo apt install -y xvfb
\`\`\`

### Clonar e executar

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recomendado; omítea se activaches manualmente as ferramentas fixadas
bun run bootstrap
bun run doctor
bun run dev            # aplicación Electron co renderer de Vite
\`\`\`

### Crear un distribuíble

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # empaqueta para o SO actual
bun run dist:win     # empaqueta os destinos de Windows nun host compatible
\`\`\`

> \`bun run bootstrap\` instala as dependencias, recompila as dependencias da aplicación Electron, verifica Electron, prepara ffmpeg/ffprobe integrados para o desenvolvemento e instala Playwright Chromium. As compilacións de publicación xestionan yt-dlp, ffmpeg e ffprobe en execución no cartafol de datos da túa aplicación; ningunha delas vai dentro do instalador.

</details>`;

export const gl = {
  icon_alt: "Mascota de Arroxy",
  hero_image_alt: "Pega unha ligazón ou simplemente navega. A pantalla de URL e o navegador integrado de Arroxy, cunha descarga en curso.",
  title:
    "Arroxy — Descargador gratuíto e de código aberto de YouTube (+ 2000 sitios) cun navegador integrado, para Windows, macOS e Linux",
  read_in_label: "Ler en:",
  badge_release_alt: "Versión",
  badge_build_alt: "Compilación",
  badge_license_alt: "Licenza",
  badge_platforms_alt: "Plataformas",
  badge_i18n_alt: "Idiomas",
  badge_website_alt: "Sitio web",
  discord_badge_text: "Únete á comunidade de Discord",
  discord_badge_encoded: "%C3%9Anete%20%C3%A1%20comunidade%20de%20Discord",
  hero_desc:
    "Descarga vídeos, Shorts, canles, podcasts ou pistas de audio de **YouTube e máis de 2000 sitios compatibles**: ata 8K HDR a 60 fps, como MP3 / AAC / Opus, ou só a parte que necesites. **Navega por YouTube ou por calquera outro sitio dentro de Arroxy** na lapela Explorar e descarga o vídeo, a lista de reprodución ou a canle na que estás; inicia sesión alí para descargar os vídeos que a túa propia conta xa pode ver. Funciona en local en Windows, macOS e Linux. **Sen anuncios, sen paquetes de máis, sen vendas forzadas.**",
  cta_latest: "↓ Instalar a última versión",
  cta_website: "Sitio web",
  website_url: "https://arroxy.com/",
  star_cta: "Se Arroxy che aforra tempo, unha ⭐ axuda a que outros o atopen.",
  ai_notice: "> 🌐 Esta tradución fíxose co apoio da IA. O [README en inglés](README.md) é a fonte de referencia. Atopaches un erro? [Abre un PR](../../pulls).",
  intro_what_is:
    "**Que é Arroxy?** Arroxy é unha interface gráfica de escritorio gratuíta e de código aberto que descarga vídeos, audio, listas de reprodución e subtítulos de YouTube e doutros 2000+ sitios compatibles con [yt-dlp](https://github.com/yt-dlp/yt-dlp). Funciona en Windows 10/11, macOS 13+ (Intel + Apple Silicon) e Linux (AppImage, Flatpak, tar.gz). Licenza GPLv3. Sen anuncios nin límites de uso. Distribúese a través de [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage e descarga directa.",
  intro_key_difference:
    "**Diferenza clave: un navegador integrado.** A maioría dos descargadores gratuítos de YouTube son envoltorios finos de yt-dlp: unha caixa de URL e un menú de formatos, sen navegador propio. Arroxy ten un, a lapela **Explorar**. Navegas por YouTube ou por calquera outro sitio dentro da aplicación e descargas o vídeo, a lista de reprodución ou a canle na que estás, ou fas clic dereito en calquera ligazón. Se inicias sesión unha vez en Explorar, as descargas que requiren unha conta usarán ese inicio de sesión: os teus vídeos privados, as túas listas Ver máis tarde e Gústame, e outros vídeos que a túa conta xa pode ver, sen exportar cookies. Inicia sesión tamén noutros sitios alí, e as súas descargas usarán ese inicio de sesión cando o precisen. Detalles: [Por que Arroxy](#why-explore).",
  last_updated: "Última actualización: {{LAST_UPDATED}}.",
  toc_heading: "Contido",
  why_h2: "Por que Arroxy",
  features_h2: "Funcións",
  dl_h2: "Instalación e primeiro inicio",
  privacy_h2: "Privacidade",
  faq_h2: "Preguntas frecuentes",
  roadmap_h2: "Folla de ruta",
  tech_h2: "Feito con",
  why_intro: "Unha comparación lado a lado coas alternativas máis comúns:",
  why_r1: "Gratuíto, sen nivel premium",
  why_r2: "Código aberto",
  why_r3: "Só procesamento local",
  why_r5: "Sen límites de uso",
  why_r6: "Aplicación de escritorio multiplataforma",
  why_r7: "Subtítulos + SponsorBlock",
  why_r8: "Navegador integrado (navegar, iniciar sesión, descargar)",
  why_r9: "Vídeos que a túa propia conta pode ver, sen exportar cookies",
  why_table_note:
    "⚠️ = en parte, ou só nun nivel de pagamento. O inicio de sesión na aplicación de 4K Video Downloader para vídeos privados é unha función de pagamento; a maioría das interfaces gratuítas de yt-dlp só aceptan un ficheiro de cookies ou len as cookies do teu navegador web.",
  why_summary:
    "Arroxy está feito para unha soa cousa: un ficheiro local limpo, tanto se pegas unha URL como se atopas o vídeo en Explorar. Sen vendas forzadas, sen recompilación de datos.",
  why_explore_h3: "O que un simple envoltorio de yt-dlp non pode facer: a lapela Explorar",
  why_explore_intro:
    "A maioría dos descargadores gratuítos de YouTube son unha caixa de URL sobre yt-dlp. Arroxy tamén usa yt-dlp, pero ademais ten **Explorar**, un navegador integrado na aplicación que abre YouTube ou calquera outro sitio. Explorar engade o que unha caixa de URL non pode:",
  why_explore_1:
    "**Vídeos que a túa conta pode ver, sen exportar cookies** — os teus vídeos privados, as túas listas Ver máis tarde e Gústame, vídeos con restrición de idade nunha conta con idade verificada, e páxinas doutros sitios que precisan o teu inicio de sesión. Un envoltorio simple precisa unha exportación de cookies.txt ou le as cookies do teu navegador web. En Arroxy inicias sesión unha vez en Explorar e el fai o resto",
  why_explore_4:
    "**Sen copiar ligazóns** — atopa un vídeo, lista de reprodución ou canle en Explorar e descárgao cun clic, ou fai clic co botón dereito en calquera ligazón da páxina",
  why_explore_5:
    "**Bloqueador de anuncios cando o queiras** — un clic no escudo bloquea anuncios e rastreadores nas páxinas de Explorar",
  feat_explore_h3: "Explorar: navega pola web dentro de Arroxy",
  feat_explore_1:
    "**Lapela Explorar** — navega por YouTube ou por calquera outro sitio dentro de Arroxy e descarga o que atopes sen copiar ligazóns. **Descargar · *o teu perfil*** pon en cola o vídeo, a lista de reprodución ou a canle que estás vendo; a frecha ao seu carón cambia de perfil e a variña abre a descarga paso a paso para escoller formatos, subtítulos e máis",
  feat_explore_6:
    "**Botón dereito para descargar** — fai clic co botón dereito en calquera ligazón de vídeo, lista de reprodución ou canle en Explorar para descargala co teu perfil, escoller outro perfil en **Descargar con**, abrir a descarga paso a paso ou copiar a ligazón. Non fai falta abrir cada vídeo primeiro",
  feat_explore_7:
    "**Deseño compacto** — un clic na barra de ferramentas de Explorar leva as lapelas de Arroxy a ela e dálle máis espazo á páxina",
  feat_explore_2:
    "**Barra de enderezos** — escribe para buscar en YouTube ou introduce calquera enderezo web para abrir ese sitio",
  feat_explore_3:
    "**Descargas que requiren unha conta** — inicia sesión unha vez en Explorar e Arroxy poderá descargar vídeos que a túa conta pode ver: os teus vídeos privados, vídeos con restrición de idade se a conta ten a idade verificada, e as túas listas Ver máis tarde e Gústame. Inicia sesión tamén noutros sitios alí, e as súas descargas usarán ese inicio de sesión cando o precisen. Arroxy descarga primeiro sen sesión iniciada e só usa o teu inicio de sesión de Explorar cando unha descarga falla de xeito que unha conta pode arranxar",
  feat_explore_4:
    "**Usa unha conta secundaria** — a primeira pantalla de Explorar explica por que: descargar cunha conta leva certo risco de que se restrinxa esa conta. Pecha a sesión en Explorar desde a configuración cando queiras esquecer os teus inicios de sesión",
  feat_explore_5:
    "**Bloqueador de anuncios** — desactivado por defecto. Un clic no escudo da barra de ferramentas de Explorar bloquea anuncios e rastreadores nas súas páxinas, sen afectar ás descargas. YouTube pode poñer trabas aos bloqueadores de anuncios en contas con sesión iniciada",
  feat_quality_h3: "Calidade e formatos",
  feat_quality_1: "Ata **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Taxa de fotogramas alta e HDR** conservados tal cal — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — exporta só o audio como MP3, M4A/AAC, Opus ou WAV. Nas descargas interactivas, escolle as pistas envolventes/Dolby nativas da orixe (AC-3, E-AC-3, 5.1, DRC) cando existan, ou define un valor global predeterminado **Preferir envolvente / Dolby**",
  feat_quality_4:
    "**Perfís con obxectivo** — *Mellor imaxe* (AV1 · VP9) ou *Smart TV* (MP4 · H.264), gardados como Automático, MP4, MKV ou WebM sen recodificar. O HDR é *Automático* (só cando a túa pantalla pode amosalo), *SDR* ou *HDR*",
  feat_quality_5:
    "**Todos os códecs en todas as resolucións** — a descarga paso a paso enumera AV1, VP9 e H.264 lado a lado en cada resolución, para que escollas o que reproduce o teu televisor ou editor",
  feat_quality_6:
    "**Sabe o que é realmente un fluxo** — márcanse os tamaños que YouTube escalou con IA, os idiomas de audio dobrados con IA, os fluxos de taxa de bits mellorada, os vídeos 360° e as copias danadas ou con marca de auga. Os perfís omiten os fluxos escalados con IA a non ser que os permitas",
  feat_privacy_h3: "Privacidade e control",
  feat_privacy_1:
    "Procesamento 100 % local — as descargas van directamente de YouTube ao teu disco",
  feat_privacy_2: "**Código aberto** — cada liña é auditable, baixo licenza GPLv3",
  feat_privacy_3: "Os ficheiros gárdanse directamente no cartafol que escollas",
  feat_workflow_h3: "Fluxo de traballo",
  feat_workflow_12:
    "**Atallo global de descarga** — copia unha ligazón en calquera aplicación e preme `Ctrl+Shift+D` (`Cmd+Shift+D` en macOS); Arroxy ponna en cola co teu perfil activo sen abrir a xanela, e unha notificación confírmao. Activado por defecto, reasignable",
  feat_workflow_1:
    "**Modos de inicio flexibles** — escolle unha descarga individual guiada, o selector de listas/canles, pegar URLs en lote, Descarga rápida cos valores gardados, ou navegar e descargar desde Explorar",
  feat_workflow_2:
    "**Cola de descargas central** — cada tarefa individual, de lista, en lote ou rápida aterra nun só lugar para ver o progreso, pausar, retomar, cancelar, tentar de novo e controlar a prioridade",
  feat_workflow_3:
    "**Vixilancia do portapapeis** — copia a ligazón dun vídeo e énchese o campo da URL cando volvas a Arroxy, con **Desfacer** se non querías facelo. Mentres Arroxy está ocupado, a ligazón agarda ata que volvas á lapela da URL (desactívao na configuración)",
  feat_workflow_4:
    "**Limpeza automática de URLs** — elimina os parámetros de rastrexo (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) e desenvolve as ligazóns `youtube.com/redirect`",
  feat_workflow_5:
    "**Modo bandexa** — pechar a xanela mantén as descargas en execución en segundo plano",
  feat_workflow_6:
    "**{{LANG_COUNT}} idiomas** — detecta automaticamente o idioma do sistema, e podes cambialo cando queiras",
  feat_workflow_7:
    "**Sincronización de listas** — volve examinar unha lista de reprodución contra un cartafol local para omitir os vídeos xa descargados; xera un ficheiro de lista `.m3u` que se actualiza a medida que se descarga cada vídeo",
  feat_workflow_8:
    "**Controis de velocidade e ritmo** — limita a largura de banda das descargas, define cantas partes dun vídeo se descargan á vez e engade atrasos entre solicitudes con axustes predefinidos (*Desactivado · Equilibrado · Prudente · Personalizado*)",
  feat_workflow_9:
    "**Modelos de nome de ficheiro** — pon nome ás descargas ao teu xeito con `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` e `{playlist_index}`, de forma global ou por perfil de descarga",
  feat_workflow_10:
    "**Descargas simultáneas e reintento automático** — escolle cantas descargas da cola se executan á vez e deixa que Arroxy reintente unha descarga que atopou un problema de rede ou servidor, agardando máis antes de cada intento",
  feat_workflow_11:
    "**Perfís por elemento da lista** — asigna a cada vídeo dunha lista de reprodución o seu propio perfil de descarga en vez dunha única configuración para toda a lista, de modo que nunha soa pasada podes arquivar algúns na máxima calidade e gardar o resto só como audio",
  feat_workflow_13:
    "**A Descarga rápida funciona en segundo plano** — a ligazón aparece enseguida en Descargas e prepárase alí, unha nota con **Ver** confírmao, e o campo da URL límpase para a seguinte ligazón. Inicia tantas como queiras mentres as anteriores se preparan",
  feat_workflow_14:
    "**Descargas dinche o que precisa de ti** — se Arroxy non pode ler unha ligazón, a súa fila di por que e ofrece a solución: Tentar de novo, activar as cookies ou iniciar sesión en Explorar. Coas cookies desactivadas, **Iniciar sesión en Explorar** tenta de novo por ti cando inicies sesión. Unha lista de reprodución máis longa que o teu límite de carga agarda na súa fila a que escollas toda ela, os primeiros ou unha revisión. A lapela Descargas conta as filas que che esperan",
  feat_workflow_15:
    "**Descarga só unha parte dun vídeo** — escolle un inicio e un final, ou un capítulo, na pantalla Formato e Arroxy garda só ese intervalo, co nome co intervalo despois do id do vídeo. Os cortes caen no fotograma clave máis próximo; activa o corte exacto para recodificar",
  feat_workflow_16:
    "**Quitar as descargas rematadas** — opcional: unha descarga rematada sae da lista 5 segundos despois. Os seus ficheiros quedan no disco e as descargas fallidas seguen na lista",
  feat_workflow_17:
    "**Tamaño e Falta en Descargas** — unha columna **Tamaño** ordenable amosa o espazo que ocupa cada descarga, e **Falta** sinala os ficheiros movidos ou eliminados fóra de Arroxy",
  feat_workflow_18:
    "**Aurora ou Minimal, escuro ou claro** — paneis de vidro sobre un ceo en movemento, ou superficies sólidas e tranquilas; cambia desde o pé. Os equipos sen aceleración gráfica reciben Minimal automaticamente",
  feat_workflow_19:
    "**Barra de menú de Mac** — en macOS, abre a configuración (`Cmd+,`), define o límite de velocidade de descarga, cambia o estilo e o tema, e abre os rexistros ou garda un ficheiro de diagnóstico desde a barra de menú",
  feat_workflow_20:
    "**Cambia un perfil desde calquera descarga** — axusta unha descarga e despois actualiza o perfil do que partiu (cunha vista previa do que cambia) ou garda a configuración como un perfil novo. Ao cambiar de perfil pregúntase se queres manter as túas edicións",
  feat_post_h3: "Subtítulos e posprocesamento",
  feat_post_1:
    "**Subtítulos** en SRT, VTT ou ASS — manuais ou xerados automaticamente, en calquera idioma dispoñible",
  feat_post_2:
    "Gárdaos xunto ao vídeo, incorpóraos nun `.mkv` ou organízaos nun subcartafol `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — omite ou marca como capítulos os patrocinios, introducións, peches e autopromocións",
  feat_post_4:
    "**Metadatos incorporados** — título, data de publicación, canle, descrición, miniatura e marcadores de capítulos escritos no ficheiro",
  feat_post_5:
    "**Lotes só de subtítulos** — pega unha lista de URLs ou abre unha lista de reprodución, escolle Subtítulos e obtén só os ficheiros de subtítulos de cada vídeo",
  feat_sites_h3: "YouTube + 2000 sitios",
  feat_sites_1:
    "**YouTube, completo** — Vídeos, Shorts, Canles, Listas de reprodución, YouTube Music e Podcasts tratados como fontes de primeira clase",
  feat_sites_2:
    "**Máis de 2000 sitios máis** mediante yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable e moitos máis",
  feat_sites_3:
    "**Só audio e subtítulos** funcionan en todos os sitios compatibles, non só en YouTube",
  feat_sites_4:
    "Se un sitio cambia, yt-dlp publica correccións cada semana e Arroxy actualiza automaticamente o binario ao iniciarse",
  shot1_cap:
    "<b>Inicio de Descarga rápida</b><br/>Pega unha URL e descárgaa ao instante co teu perfil activo",
  shot2_cap:
    "<b>Perfís de descarga reutilizables</b><br/>Garda axustes de formato, calidade e saída — reutilízaos en cada descarga",
  shot3_cap:
    "<b>Pistas de audio en varios idiomas</b><br/>Escolle o idioma exacto do audio co que vén un vídeo",
  shot4_cap:
    "<b>Audio envolvente / Dolby</b><br/>As pistas 5.1 e Dolby detéctanse e consérvanse",
  shot5_cap:
    "<b>Modo de URLs en lote</b><br/>Pega unha lista, elimina duplicados automaticamente e ponas todas en cola de vez",
  shot6_cap:
    "<b>Cola de descargas en paralelo</b><br/>Varias descargas á vez con progreso en directo",
  hotkey_fig_alt:
    "Atallo global de descarga de Arroxy — Ctrl+Shift+D en Windows e Linux, Cmd+Shift+D en macOS, que envía a ligazón copiada directamente á cola de descargas",
  hotkey_fig_cap:
    "<b>Atallo global de descarga</b><br/>Copia unha ligazón en calquera lugar e preme unha vez — entra na cola e comeza a descargarse",
  shot7_cap: "<b>Perfís por elemento da lista</b><br/>Dálle a cada vídeo o seu propio perfil — arquiva algúns en 4K e garda o resto só como audio",
  shot8_cap:
    "<b>Explorar</b><br/>Navega por YouTube ou por calquera outro sitio dentro de Arroxy e descarga a páxina na que estás co teu perfil activo",
  shot9_cap:
    "<b>A primeira pantalla de Explorar</b><br/>Unha ollada rápida a Explorar e por que unha conta secundaria é o inicio de sesión máis seguro",
  shot10_cap:
    "<b>Descargas dinche o que precisa de ti</b><br/>As ligazóns prepáranse en segundo plano; unha que falla ofrece a súa solución e unha lista longa agarda a túa decisión",
  shot11_cap:
    "<b>Descarga só unha parte dun vídeo</b><br/>Escolle un inicio e un final, ou un capítulo — Arroxy garda só ese intervalo",
  shot12_cap:
    "<b>Editor de perfís</b><br/>Axusta un perfil: tipo de ficheiro, resolución, subtítulos, destino, modelo de nome de ficheiro e máis",
  shot13_cap:
    "<b>Escuro ou claro, vidro ou sólido</b><br/>Catro aspectos entre os que escoller: paneis de vidro sobre un ceo en movemento ou superficies sólidas e tranquilas, cada un en escuro e claro",
  shot14_cap:
    "<b>8K HDR a 60 fps</b><br/>Todas as resolucións, códecs e fluxos HDR que ofrece un vídeo, lado a lado",
  dl_platform_col: "Plataforma",
  dl_format_col: "Descarga directa",
  dl_oneline_note:
    "As compilacións son só x86_64. Non tes `curl`? Cambia `curl -fsSL` por `wget -qO-`.",
  dl_win_scoop:
    "Prefires Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Instalador (NSIS) ou `.exe` portátil",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ou `.flatpak` (en sandbox)",
  dl_grab: "Todos os recursos da versión →",
  dl_pkg_h3: "Instalar mediante xestor de paquetes",
  dl_channel_col: "Canle",
  dl_command_col: "Comando",
  dl_win_h3: "Windows: instalador fronte a portátil",
  dl_win_col_installer: "Instalador NSIS",
  dl_win_col_portable: "`.exe` portátil",
  dl_win_r1: "Require instalación",
  dl_win_r1_installer: "Si",
  dl_win_r1_portable: "Non — execútase desde calquera lugar",
  dl_win_r2: "Actualizacións automáticas",
  dl_win_r2_installer: "✅ na aplicación",
  dl_win_r2_portable: "❌ descarga manual",
  dl_win_r3: "Velocidade de inicio",
  dl_win_r3_installer: "✅ máis rápido",
  dl_win_r3_portable: "⚠️ arranque en frío máis lento",
  dl_win_r4: "Engádese ao menú Inicio",
  dl_win_r5: "Desinstalación sinxela",
  dl_win_r5_portable: "❌ elimina o ficheiro",
  dl_win_rec:
    "**Recomendación:** usa o instalador NSIS para ter actualizacións automáticas e un inicio máis rápido. Usa o `.exe` portátil se queres unha opción sen instalación e sen rexistro.",
  dl_win_smartscreen_h4: "Aviso de Windows SmartScreen",
  dl_win_smartscreen_intro:
    'No primeiro inicio pode que vexas **«Windows protexeu o teu PC»** ou **«Editor descoñecido»**. Isto afecta tanto a `Arroxy-win-x64-Setup.exe` como a `Arroxy-win-x64-Portable.exe`. Arroxy é gratuíto e de código aberto e as compilacións de Windows non están asinadas cun certificado de pagamento, e por iso SmartScreen as marca. **Non** significa automaticamente que Arroxy non sexa seguro. Para continuar:',
  dl_win_smartscreen_step1: "Fai clic en **Máis información**.",
  dl_win_smartscreen_step2: "Fai clic en **Executar de todos os xeitos**.",
  dl_win_smartscreen_official:
    "Descarga Arroxy só desde a páxina oficial de versións de GitHub. Se obtiveches o ficheiro doutro sitio web ou alguén ch'o enviou, elimínao e descarga unha copia nova da fonte oficial. O código fonte é público, así que podes inspeccionalo ou compilar Arroxy ti mesmo se o prefires.",
  dl_macos_h3: "Primeiro inicio en macOS",
  dl_macos_warning:
    "Arroxy aínda non está asinado, así que Gatekeeper de macOS pode amosar o aviso de aplicación danada no primeiro inicio. É o esperado: non é sinal de dano real nos ficheiros.",
  dl_macos_m1_h4: "Método co Terminal:",
  dl_macos_step1: "Arrastra `Arroxy.app` desde o DMG montado a `/Applications`.",
  dl_macos_step2:
    "Abre o Terminal e executa `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Executa `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Se a ruta da aplicación é distinta, substitúe `/Applications/Arroxy.app` pola ruta na que a instalaches.",
  dl_macos_step5:
    "Introduce o contrasinal do teu Mac se `sudo` llo pide.",
  dl_macos_after:
    "Despois de quitar a corentena, Arroxy ábrese con normalidade.",
  dl_macos_m2_h4: "Método co Terminal:",
  dl_macos_note:
    "As compilacións de macOS prodúcense mediante CI en executores Apple Silicon e Intel. Se tes problemas, [abre unha incidencia](../../issues): os comentarios dos usuarios de macOS dan forma activamente ao ciclo de probas de macOS.",
  dl_linux_h3: "Primeiro inicio en Linux",
  dl_linux_intro:
    "As AppImage execútanse directamente, sen instalación. Só tes que marcar o ficheiro como executable.",
  dl_linux_m1_text:
    "**Xestor de ficheiros:** fai clic co botón dereito no `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir executar o ficheiro como programa** e despois fai dobre clic.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Se o inicio aínda falla, execútao sen montar: non fai falta ningún paquete FUSE:",
  dl_linux_targz_h4: "Tarball simple (sen FUSE, sen instalación):",
  dl_linux_targz_text: "A compilación `.tar.gz` é a mesma aplicación sen o envoltorio de AppImage: extráea onde queiras e execútaa. Sen instalador e sen paquete FUSE.",
  dl_linux_arch_note: "**As descargas de Linux da páxina de versións son só x86_64.** En máquinas ARM64 (Raspberry Pi, Asahi Linux) Flatpak instálase igualmente, pero falla no inicio con `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Por que podes ver un aviso",
  dl_warning_p1:
    "Arroxy é de código aberto e ten licenza GPLv3. As compilacións de Windows e macOS **non están asinadas**: os certificados Apple Developer ID e EV de Windows custan cada un centos de dólares ao ano, algo que un proxecto independente paga do seu peto. Sen esas sinaturas, Windows SmartScreen e macOS Gatekeeper avisarante no primeiro inicio. Os avisos significan *que o teu SO non recoñece o editor*, non que Arroxy sexa malware.",
  dl_warning_p2:
    "Tres formas de verificar Arroxy ti mesmo, de menor a maior rigor:\n\n- **Le o código fonte.** Cada liña está en [GitHub](https://github.com/antonio-orionus/Arroxy) e podes [compilalo desde o código fonte](#tech).\n- **Comproba o SHA256.** Compara o teu ficheiro co [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) publicado — consulta [Verifica a túa descarga](#verify) máis abaixo.\n- **Fai unha análise de terceiros.** Sube o ficheiro a [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Primeiro inicio en Windows",
  shot_smartscreen_more_alt:
    'Diálogo «Windows protexeu o teu PC» de SmartScreen co enlace «Máis información» resaltado',
  shot_smartscreen_run_alt:
    'Diálogo de SmartScreen despois de expandir Máis información, co botón «Executar de todos os xeitos»',
  dl_win_defender_h4: "Se Windows Defender marca ou elimina o ficheiro",
  dl_win_defender_p:
    "A heurística de Defender ás veces marca como sospeitosos os instaladores NSIS sen asinar e os portátiles de Electron. Se Defender poñe en corentena `Arroxy-win-x64-Setup.exe` ou `Arroxy-win-x64-Portable.exe`, restáurao desde **Seguridade de Windows → Protección contra virus e amenazas → Historial de protección** e despois engade o executable de Arroxy como elemento permitido en **Administrar a configuración → Engadir ou quitar exclusións**. Como con SmartScreen, o motivo é a falta de sinatura do editor, non un malware detectado.",

  dl_macos_first_h3: "Primeiro inicio en macOS",
  dl_macos_intro:
    "As compilacións de Arroxy para macOS están asinadas ad hoc pero non notarizadas por Apple, así que Gatekeeper bloquea o primeiro inicio con *«Arroxy.app» non se abriu — Apple non puido verificar que «Arroxy.app» estea libre de malware*. Isto significa que macOS non pode comprobar a aplicación con Apple, non que haxa algo mal cos ficheiros. Instalar con Homebrew evita este diálogo por completo. Se usaches o DMG, un comando de Terminal soluciónao:",
  dl_macos_sequoia_h4: "Solución con Terminal para macOS actual",
  dl_macos_sequoia_intro:
    "Usa o Terminal despois de copiar Arroxy a Aplicacións:",
  dl_macos_sequoia_step1:
    "Arrastra `Arroxy.app` desde o DMG montado a `/Applications`.",
  dl_macos_sequoia_step2:
    "Abre o Terminal e executa estes dous comandos:",
  dl_macos_sequoia_step3:
    "Executa `open /Applications/Arroxy.app` para iniciar Arroxy.",
  dl_macos_sequoia_step4:
    "Se a ruta da aplicación é distinta, substitúe `/Applications/Arroxy.app` pola ruta na que a instalaches.",
  dl_macos_sonoma_h4: "Solución con Terminal para macOS máis antigo",
  dl_macos_sonoma_step1:
    "Arrastra `Arroxy.app` desde o DMG montado a `/Applications`.",
  dl_macos_sonoma_step2:
    "Abre o Terminal e quita a corentena de `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Inicia Arroxy desde o Terminal ou o Finder despois de quitar a corentena.",
  dl_macos_damaged_h4:
    "Solución para a corentena de Gatekeeper",
  dl_macos_damaged_p:
    "O primeiro comando quita o atributo de corentena que macOS engadiu cando se descargou o ficheiro; o segundo inicia a aplicación. Normalmente non precisas `sudo`, porque a copia en `/Applications` é túa: engádeo só se obtés un erro de permisos.",
  dl_macos_arch_note:
    "**Apple Silicon fronte a Intel:** nun Mac da serie M (M1 / M2 / M3 / M4), descarga o DMG `arm64`. Nos Mac Intel, descarga o DMG `x64`. Executar a compilación equivocada segue funcionando mediante Rosetta, pero é notablemente máis lento.",

  dl_linux_first_h3: "Primeiro inicio en Linux",
  dl_linux_appimagelauncher:
    "**Integración co escritorio opcional:** instala [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) unha vez e calquera AppImage na que fagas dobre clic rexistrarase automaticamente no menú de aplicacións, sen precisar un ficheiro `.desktop` manual.",

  dl_verify_h3: "Verifica a túa descarga (SHA256)",
  dl_verify_intro:
    "Cada versión publica un ficheiro `SHA256SUMS` xunto cos binarios. Para comprobar que a túa descarga non se corrompeu nin se manipulou durante o tránsito, calcula o hash do ficheiro en local e compáraa coa liña de `SHA256SUMS`. Abre a páxina da última versión → **Assets** → descarga `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell ou Símbolo do sistema):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Queres unha análise de malware de terceiros? Sube o ficheiro a [VirusTotal](https://www.virustotal.com). Un puñado de avisos de heurística xenérica de motores menores é normal nas aplicacións Electron sen asinar; unhas detección xeneralizadas de motores importantes si serían preocupantes.",

  dl_pm_intro:
    "Prefires outra canle? Estas tamén funcionan e avanzan ao mesmo ritmo ca cada versión.",

  privacy_p1:
    "As descargas obtéñense directamente mediante [yt-dlp](https://github.com/yt-dlp/yt-dlp) desde YouTube ao cartafol que escollas: nada pasa por un servidor de terceiros. O historial de reprodución, o historial de descargas, as URLs e o contido dos ficheiros quedan no teu dispositivo.",
  privacy_reports:
    "Sen seguimento — un sinal anónimo ao día (versión da aplicación, SO, idioma, canle de instalación, país e aproximadamente canto tempo hai que se instalou Arroxy) para poder contar os usuarios activos e novos e, cando Arroxy descarga ou actualiza yt-dlp e FFmpeg, unha nota anónima sobre se funcionou e aproximadamente canto tardou. Sen IDs, URLs, títulos de vídeos, rutas de ficheiros nin datos de contas. Podes desactivar ambos na configuración.",
  privacy_p3:
    "Explorar garda os seus propios inicios de sesión, separados do teu navegador, e Arroxy nunca le nin completa un formulario de inicio de sesión: escribes na propia páxina do sitio. As descargas execútanse sen sesión iniciada; só cando unha falla de xeito que unha conta pode arranxar, Arroxy le o inicio de sesión de novo, gárdao nun ficheiro temporal para esa descarga e elimina o ficheiro despois. Pechar a sesión en Explorar na configuración esquéceos.",
  faq_q1: "É realmente gratuíto?",
  faq_a1: "Si — licenza GPLv3, sen nivel premium, sen funcións bloqueadas.",
  faq_q11: "En que se diferencia Arroxy doutras interfaces de yt-dlp?",
  faq_a11:
    "A maioría das interfaces gratuítas de yt-dlp son envoltorios que só aceptan unha ligazón. Arroxy engade **Explorar**, un navegador integrado na aplicación que abre YouTube ou calquera outro sitio: navegas e descargas sen copiar ligazóns, e inicias sesión alí unha vez para descargar os vídeos que a túa conta pode ver, como os teus vídeos privados e as túas listas Ver máis tarde e Gústame, sen exportar cookies. Consulta [Por que Arroxy](#why).",
  faq_q2: "Que calidades de vídeo podo descargar?",
  faq_a2:
    "Todo o que serve YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, ademais de só audio. Os fluxos de 60 fps e HDR consérvanse tal cal, e a descarga paso a paso permíteche escoller AV1, VP9 ou H.264 en cada resolución.",
  faq_q3: "Podo extraer só o audio como MP3?",
  faq_a3:
    "Si. Escolle *só audio* no menú de formato e elixe MP3, M4A/AAC, Opus ou WAV.",
  faq_q4: "Como descargo vídeos que requiren unha conta de YouTube?",
  faq_a4:
    "Inicia sesión unha vez na lapela Explorar. Arroxy poderá entón descargar vídeos que a túa conta pode ver: os teus vídeos privados, vídeos con restrición de idade se a conta ten a idade verificada, e as túas listas Ver máis tarde e Gústame. Usa o inicio de sesión só cando unha descarga falla de xeito que unha conta pode arranxar; todo o demais descárgase como antes. Esta é a opción **Inicio de sesión en Explorar**, a primeira da lista e marcada como Recomendado na configuración das cookies, e Arroxy escóllea por ti a primeira vez que abras Explorar. A wiki de yt-dlp advirte de que [a automatización con sesión iniciada pode marcar unha conta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), así que unha conta secundaria é a opción máis segura.",
  faq_q5: "Seguirá funcionando cando YouTube cambie algo?",
  faq_a5:
    "yt-dlp actualízase automaticamente ao iniciarse, e Arroxy publica correccións axiña cando YouTube cambia algo. Cando unha descarga precisa iniciar sesión, Arroxy usa o teu inicio de sesión de Explorar se iniciaches sesión alí, e na configuración das cookies están dispoñibles as cookies dun ficheiro ou do teu navegador.",
  faq_q6: "En que idiomas está dispoñible Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} idiomas, de serie: {{LANG_NAME_LIST}}. Arroxy detecta automaticamente o idioma do teu sistema operativo no primeiro inicio e podes cambialo en calquera momento desde o selector de idioma da barra de ferramentas. O JSON de configuración rexional en execución está en src/shared/i18n/locales/, e os catálogos PO para tradutores están en i18n/locales/ — abre un PR en GitHub para contribuír.",
  faq_q7: "Teño que instalar algo máis?",
  faq_a7:
    "Non. yt-dlp, ffmpeg e ffprobe descárganse automaticamente no primeiro inicio e gárdanse na túa máquina. Despois diso non fai falta ningunha configuración extra.",
  faq_q8: "Podo descargar listas de reprodución ou canles enteiras?",
  faq_a8:
    "Si, as dúas cousas. Pega a URL dunha lista de reprodución ou dunha canle (p. ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); escolle cantas entradas examinar e despois pon en cola toda a lista ou escolle vídeos concretos. Os filtros por intervalo de datas chegarán pronto.",
  faq_q9: 'macOS di que «a aplicación está danada» — que fago?',
  faq_a9:
    'Isto é Gatekeeper de macOS bloqueando unha aplicación sen asinar, non un dano real. Consulta [Primeiro inicio en macOS](#macos-first-launch) para ver os comandos de Terminal que quitan a corentena e inician Arroxy.',
  faq_q10: "É legal descargar vídeos de YouTube?",
  faq_a10:
    "Depende do teu país e do que descargues. Descarga só contido que che pertenza, contido con licenza para descargalo ou contido que a lei do teu país che permita copiar. Es responsable de cumprir os [Termos do servizo](https://www.youtube.com/t/terms) de YouTube e as leis de dereitos de autor do teu país. Consulta [Termos de uso](#terms).",
  plan_intro: "Aínda previsto — aproximadamente por orde de prioridade:",
  plan_col1: "Función",
  plan_col2: "Descrición",
  plan_r1_name: "**Filtros de listas e canles**",
  plan_r1_desc: "Filtros por intervalo de datas ao enumerar unha lista de reprodución ou canle",
  plan_r2_name: "**Preferencias de pista de audio de YouTube**",
  plan_r2_desc:
    "Define unha preferencia de pista de idioma falado para toda a aplicación, con sobrescrituras por perfil cando YouTube ofrece varias pistas de audio",
  plan_r3_name: "**Recuperación de reintentos máis robusta**",
  plan_r3_desc:
    "Unha nova vía de reintento para descargas interrompidas por conexións a Internet pouco fiables ou problemáticas",
  plan_r4_name: "**Panel completo do xestor de descargas**",
  plan_r4_desc:
    "Converter o panel da cola nun xestor máis completo, incluíndo o cambio de cartafoles de destino dos elementos en cola",
  plan_r5_name: "**Descargas programadas**",
  plan_r5_desc: "Iniciar unha cola a unha hora determinada (execucións nocturnas)",
  plan_r9_name: "**Paquete AUR**",
  plan_r9_desc: "Instalar en Arch Linux e Omarchy con `yay -S arroxy-bin`",
  plan_cta:
    "Tes unha función en mente? [Abre unha solicitude](../../issues) — as achegas da comunidade determinan a prioridade.",
  tech_content: TECH_CONTENT,
  support_h2: "Apoia Arroxy",
  support_line: "Arroxy é gratuíto e ten licenza GPLv3: sen anuncios, sen seguimento, sen nivel de pagamento. Se che aforra tempo, podes apoiar o desenvolvemento con Bitcoin, Tron ou Ethereum: os enderezos están en [DONATE.md](DONATE.md), que é a única fonte oficial deles. Arroxy nunca che enviará un enderezo por correo electrónico nin mensaxe directa. Darlle unha estrela ao repositorio, informar de erros e mellorar as traducións axudan igual de ben.",
  tos_h2: "Termos de uso",
  tos_note:
    "Arroxy é unha ferramenta só para uso persoal e privado. Es o único responsable de asegurar que as túas descargas cumpran os [Termos do servizo](https://www.youtube.com/t/terms) de YouTube e as leis de dereitos de autor da túa xurisdición. Non uses Arroxy para descargar, reproducir ou distribuír contido que non teñas dereito a usar. Os desenvolvedores non se fan responsables de ningún mal uso.",
  footer_credit:
    'GPLv3 · Feito con coidado por <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
