const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell de escritorio multiplataforma
- **React 19** + **TypeScript** — interfaz de usuario
- **Tailwind CSS v4** — estilos
- **Zustand** — gestión de estado
- **yt-dlp** + **ffmpeg** — motor de descarga y muxing (ambos se obtienen en runtime: yt-dlp se mantiene actualizado; ffmpeg/ffprobe se instalan una sola vez y se conservan entre actualizaciones)
- **Vite** + **electron-vite** — herramientas de compilación
- **Vitest** + **Playwright** — pruebas unitarias y de extremo a extremo

</details>

<details>
<summary><strong>Compilar desde el código fuente</strong></summary>

### Requisitos previos — todas las plataformas

| Herramienta | Versión  | Instalación |
| ----------- | -------- | ----------- |
| Git         | cualquiera | [git-scm.com](https://git-scm.com) |
| Node.js     | 24.21.0  | \`mise install\` o \`.node-version\` |
| Bun         | 1.4.2   | \`mise install\` o \`package.json\` \`packageManager\` |

Recomendado: instala \`mise\` y luego ejecuta \`mise install\` en el checkout. Sin mise, activa manualmente Node.js desde \`.node-version\` y Bun desde \`package.json\` antes de \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools y Python pueden ser necesarios para recompilaciones nativas.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Después de clonar, ejecuta \`mise trust && mise install\` desde el checkout. Si tu shell ya usa \`fnm\`, \`nvm\` o Bun instalado con Homebrew, activa mise en \`~/.zshrc\` para que Arroxy use Node.js 24.21.0 y Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Dependencias de build y runtime de Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clonar y ejecutar

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recomendado; omite si activaste manualmente las herramientas fijadas
bun run bootstrap
bun run doctor
bun run dev            # app Electron contra el renderer de Vite
\`\`\`

### Crear un distribuible

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # empaqueta objetivos Windows en un host compatible
\`\`\`

> \`bun run bootstrap\` instala dependencias, recompila dependencias de la app Electron, verifica Electron, prepara ffmpeg/ffprobe embebidos para desarrollo e instala Playwright Chromium. Las builds de release gestionan yt-dlp, ffmpeg y ffprobe en runtime dentro de la carpeta de datos de la app; ninguno viene incluido en el instalador.

</details>`;

export const es = {
  icon_alt: "Mascota de Arroxy",
  title:
    "Arroxy — Descargador gratuito de YouTube (+ 2000 sitios) de código abierto con navegador integrado para Windows, macOS y Linux",
  read_in_label: "Leer en:",
  badge_release_alt: "Versión",
  badge_build_alt: "Compilación",
  badge_license_alt: "Licencia",
  badge_platforms_alt: "Plataformas",
  badge_i18n_alt: "Idiomas",
  badge_website_alt: "Sitio web",
  discord_badge_text: "Únete a la comunidad de Discord",
  discord_badge_encoded: "%C3%9Anete%20a%20la%20comunidad%20de%20Discord",
  hero_desc:
    "Descarga videos, Shorts, música, canales, podcasts o pistas de audio de **YouTube y más de 2000 sitios compatibles** — hasta 8K HDR a 60 fps, como MP3 / AAC / Opus, o solo la parte que necesites. **Navega por YouTube o cualquier otro sitio dentro de Arroxy** en la pestaña Explore y descarga el video, la playlist o el canal que estás viendo; inicia sesión ahí para descargar videos privados, solo para miembros y con restricción de edad que tu cuenta pueda ver. Se ejecuta localmente en Windows, macOS y Linux. **Sin anuncios, sin bloatware, sin ventas adicionales.**",
  cta_latest: "↓ Descargar la última versión",
  cta_website: "Sitio web",
  star_cta:
    "Si Arroxy te ahorra tiempo, una ⭐ ayuda a que otros lo encuentren.",
  ai_notice:
    "> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).",
  toc_heading: "Contenido",
  why_h2: "¿Por qué Arroxy?",
  features_h2: "Características",
  dl_h2: "Instalar y primer inicio",
  privacy_h2: "Privacidad",
  faq_h2: "Preguntas frecuentes",
  roadmap_h2: "Hoja de ruta",
  tech_h2: "Construido con",
  why_intro: "Una comparación directa con las alternativas más comunes:",
  why_r1: "Gratis, sin nivel premium",
  why_r2: "Código abierto",
  why_r3: "Procesamiento 100% local",
  why_r5: "Sin límites de uso",
  why_r6: "Aplicación de escritorio multiplataforma",
  why_r7: "Subtítulos + SponsorBlock",
  why_r8: "Navegador integrado (navegar, iniciar sesión, descargar)",
  why_r9:
    "Vídeos privados, solo para miembros y con restricción de edad sin exportar cookies",
  why_table_note:
    "⚠️ = en parte, o solo en un plan de pago. En 4K Video Downloader, el inicio de sesión dentro de la app para vídeos privados es una función de pago; la mayoría de las GUI gratuitas de yt-dlp solo aceptan un archivo de cookies o leen las cookies de tu navegador web.",
  why_summary:
    "Arroxy está diseñado para una sola cosa: un archivo local limpio, tanto si pegas una URL como si encuentras el vídeo en Explore. Sin ventas adicionales, sin recolección de datos.",
  why_explore_h3:
    "Lo que un simple wrapper de yt-dlp no puede hacer: la pestaña Explore",
  why_explore_intro:
    "La mayoría de los descargadores gratuitos de YouTube son una casilla para la URL encima de yt-dlp. Arroxy también usa yt-dlp, pero además tiene **Explore**, un navegador integrado en la app que abre YouTube o cualquier otro sitio. Explore supera límites que una casilla de URL no puede superar:",
  why_explore_1:
    "**Vídeos que requieren una cuenta, sin exportar cookies** — vídeos privados, solo para miembros y con restricción de edad (con una cuenta con la edad verificada), además de tus listas Ver más tarde y Me gusta, y vídeos tras un inicio de sesión en otros sitios. Un simple wrapper necesita un cookies.txt exportado o tiene que leer las cookies de tu navegador web, algo que Chrome en Windows ahora bloquea. En Arroxy inicias sesión una vez en Explore y él se encarga del resto",
  why_explore_2:
    "**\"Inicia sesión para confirmar que no eres un bot\"** — cuando YouTube lo pide, Arroxy vuelve a intentar la descarga con tu inicio de sesión de Explore en lugar de fallar",
  why_explore_3:
    "**El token de descarga de YouTube** — el navegador integrado de Arroxy obtiene el token que YouTube espera antes de una descarga. Sin él, YouTube puede ofrecer menos formatos y menor calidad de la que pediste",
  why_explore_4:
    "**Sin copiar enlaces** — encuentra un vídeo, una playlist o un canal en Explore y descárgalo con un clic, o haz clic derecho en cualquier enlace de la página",
  why_explore_5:
    "**Bloqueador de anuncios cuando quieras** — un clic en el escudo bloquea anuncios y rastreadores en las páginas de Explore",
  feat_explore_h3: "Explore: navega por la web dentro de Arroxy",
  feat_explore_1: "**Pestaña Explore** — navega por YouTube o cualquier otro sitio dentro de Arroxy y descarga lo que encuentres sin copiar enlaces. **Descargar · *tu perfil*** pone en cola el vídeo, la playlist o el canal que estás viendo; la flecha de al lado cambia de perfil, y la varita abre la descarga paso a paso para elegir formatos, subtítulos y más",
  feat_explore_6: "**Clic derecho para descargar** — haz clic derecho en cualquier enlace de vídeo, playlist o canal en Explore para descargarlo con tu perfil, elegir otro perfil en **Descargar con**, abrir la descarga paso a paso o copiar el enlace. No hace falta abrir cada vídeo antes",
  feat_explore_7: "**Diseño compacto** — un clic en la barra de herramientas de Explore lleva allí las pestañas de Arroxy y da más espacio a la página",
  feat_explore_2: "**Barra de direcciones** — escribe para buscar en YouTube o introduce cualquier dirección web para abrir ese sitio",
  feat_explore_3: "**Descargas que necesitan una cuenta** — inicia sesión una vez en Explore y Arroxy podrá descargar vídeos privados y solo para miembros que tu cuenta pueda ver, vídeos con restricción de edad si la cuenta tiene la edad verificada, y tus listas Ver más tarde y Me gusta. Inicia sesión también en otros sitios ahí, y sus descargas usan ese inicio de sesión cuando lo necesitan. Arroxy sigue descargando primero sin sesión y solo usa tu inicio de sesión de Explore cuando una descarga falla de una forma que una cuenta puede arreglar. Cuando YouTube te pide confirmar que no eres un bot, Arroxy también prueba tu inicio de sesión de Explore",
  feat_explore_4: "**Usa una cuenta secundaria** — la primera pantalla de Explore explica por qué: descargar con una cuenta conlleva cierto riesgo de que esa cuenta sea restringida. Cierra sesión en Explore desde Configuración cuando quieras olvidar tus inicios de sesión",
  feat_explore_5: "**Bloqueador de anuncios** — desactivado por defecto. Un clic en el escudo de la barra de herramientas de Explore bloquea anuncios y rastreadores en sus páginas, sin afectar a las descargas. YouTube puede oponerse a los bloqueadores de anuncios en cuentas con sesión iniciada",
  feat_quality_h3: "Calidad y formatos",
  feat_quality_1: "Hasta **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2:
    "**Alta frecuencia de fotogramas y HDR** conservados tal cual — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — exporta solo audio como MP3, M4A/AAC, Opus o WAV. En las descargas interactivas, elige las pistas nativas surround/Dolby de la fuente (AC-3, E-AC-3, 5.1, DRC) cuando estén disponibles, o configura un valor global **Preferir surround / Dolby**",
  feat_quality_4:
    "**Perfiles con un objetivo** — *Mejor imagen* (AV1 · VP9) o *TV inteligente* (MP4 · H.264), guardados como Auto, MP4, MKV o WebM sin recodificar. HDR es *Auto* (solo cuando tu pantalla puede mostrarlo), *SDR* o *HDR*",
  feat_quality_5:
    "**Cada códec en cada resolución** — la descarga paso a paso muestra AV1, VP9 y H.264 uno junto a otro en cada resolución, para que elijas el que reproduce tu TV o tu editor",
  feat_quality_6:
    "**Sabe qué es realmente cada stream** — se marcan las resoluciones que YouTube reescaló con IA, los idiomas de audio doblados con IA, los streams con tasa de bits mejorada, los vídeos 360° y las copias dañadas o con marca de agua. Los perfiles omiten los streams reescalados con IA salvo que los permitas",
  feat_privacy_h3: "Privacidad y control",
  feat_privacy_1:
    "Procesamiento 100% local — las descargas van directamente de YouTube a tu disco",
  feat_privacy_2:
    "Sin inicio de sesión, sin cookies, sin cuenta de Google vinculada",
  feat_privacy_3: "Archivos guardados directamente en la carpeta que elijas",
  feat_workflow_h3: "Flujo de trabajo",
  feat_workflow_12: "**Atajo de descarga global** — copia un enlace en cualquier app y pulsa `Ctrl+Shift+D` (`Cmd+Shift+D` en macOS); Arroxy lo pone en cola con tu perfil activo sin abrir la ventana, y una notificación lo confirma. Activo por defecto y reasignable",
  feat_workflow_1: "**Modos de inicio flexibles** — elige una descarga individual guiada, selector de playlist/canal, pegado masivo de URLs, Quick Download con tus valores guardados, o navega y descarga desde Explore",
  feat_workflow_2:
    "**Cola central de descargas** — cada trabajo individual, de playlist, masivo o rápido llega a un solo lugar para ver progreso, pausar, reanudar, cancelar, reintentar y controlar prioridad",
  feat_workflow_3:
    "**Monitoreo del portapapeles** — copia un enlace de vídeo y se rellena el campo URL al volver a Arroxy, con **Deshacer** si no era lo que querías. Si Arroxy está ocupado, el enlace espera hasta que vuelvas a la pestaña URL (desactívalo en Ajustes)",
  feat_workflow_4:
    "**Limpieza automática de URLs** — elimina parámetros de seguimiento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) y desempaqueta los enlaces `youtube.com/redirect`",
  feat_workflow_5:
    "**Modo bandeja** — cerrar la ventana mantiene las descargas en segundo plano",
  feat_workflow_6:
    "**{{LANG_COUNT}} idiomas**: detecta automáticamente la configuración regional del sistema y se puede cambiar en cualquier momento",
  feat_workflow_7:
    "**Sincronización de playlists** — vuelve a escanear una playlist contra una carpeta local para omitir vídeos ya descargados; genera un archivo de playlist `.m3u` que se actualiza con cada vídeo descargado",
  feat_workflow_8:
    "**Controles de velocidad y ritmo** — limita el ancho de banda de descarga, define cuántas partes de un vídeo se descargan a la vez y añade pausas entre solicitudes con ajustes (*Desactivado · Equilibrado · Cuidadoso · Personalizado*)",
  feat_workflow_9:
    "**Plantillas de nombre de archivo** — nombra las descargas a tu manera con `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` y `{playlist_index}`, de forma global o por perfil de descarga",
  feat_workflow_10:
    "**Descargas a la vez y reintento automático** — elige cuántas descargas de la cola se ejecutan al mismo tiempo y deja que Arroxy reintente una descarga que sufrió un problema de red o del servidor, esperando más antes de cada intento",
  feat_workflow_11:
    "**Perfiles por elemento de playlist** — asigna a cada vídeo de una playlist su propio perfil de descarga en lugar de un único ajuste para toda la lista, para archivar algunos en calidad máxima y sacar el resto como MP3 en una sola pasada",
  feat_workflow_13: "**Quick Download funciona en segundo plano** — el enlace aparece enseguida en Descargas y se prepara allí, una nota con **Ver** lo confirma, y el campo de URL se vacía para el siguiente enlace. Lanza tantos como quieras mientras los anteriores se preparan",
  feat_workflow_14: "**Descargas te avisa de lo que necesita tu atención** — si Arroxy no puede leer un enlace, su fila explica por qué y ofrece la solución: Reintentar, activar las cookies o iniciar sesión en Explore. Con las cookies desactivadas, **Iniciar sesión con Explore** lo reintenta por ti en cuanto hayas iniciado sesión. Una playlist más larga que tu límite de carga espera en su fila a que elijas toda, los primeros vídeos o una revisión. La pestaña Descargas cuenta las filas que esperan por ti",
  feat_workflow_15:
    "**Descarga solo una parte de un vídeo**: elige un inicio y un fin, o un capítulo, en la pantalla Formato y Arroxy guarda solo ese intervalo, con el intervalo en el nombre después del id del vídeo. Los cortes caen en el fotograma clave más cercano; activa el corte exacto para recodificar en su lugar",
  feat_workflow_16:
    "**Quitar descargas terminadas** — opcional: una descarga terminada sale de la lista 5 segundos después. Sus archivos siguen en el disco, y las descargas fallidas se quedan en la lista",
  feat_workflow_17:
    "**Tamaño y Falta en Descargas** — una columna ordenable **Tamaño** muestra cuánto espacio ocupa cada descarga, y **Falta** señala los archivos movidos o borrados fuera de Arroxy",
  feat_workflow_18:
    "**Aurora o Minimalista, oscuro o claro** — paneles de cristal sobre un cielo en movimiento, o superficies sólidas y tranquilas; cambia desde el pie de página. Los equipos sin aceleración gráfica reciben Minimalista automáticamente",
  feat_workflow_19:
    "**Barra de menús del Mac** — en macOS, abre Ajustes (`Cmd+,`), fija el límite de velocidad de descarga, cambia el estilo y el tema, y abre los registros o guarda un archivo de diagnóstico desde la barra de menús",
  feat_workflow_20:
    "**Cambia un perfil desde cualquier descarga** — ajusta una descarga y luego actualiza el perfil del que partió (con una vista previa de lo que cambia) o guarda los ajustes como un perfil nuevo. Al cambiar de perfil, Arroxy te pregunta si quieres conservar tus cambios",
  feat_post_h3: "Subtítulos y posprocesamiento",
  feat_post_1:
    "**Subtítulos** en SRT, VTT o ASS — manuales o generados automáticamente, en cualquier idioma disponible",
  feat_post_2:
    "Guárdalos junto al video, incrústalos en `.mkv` u organízalos en una subcarpeta `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — omite o marca como capítulos patrocinadores, intros, outros y autopromociones",
  feat_post_4:
    "**Metadatos incrustados** — título, fecha de subida, canal, descripción, miniatura y marcadores de capítulo escritos en el archivo",
  feat_post_5:
    "**Lotes solo de subtítulos** — pega una lista de URLs o abre una lista de reproducción, elige Subtítulos y obtén solo los archivos de subtítulos de cada vídeo",
  feat_sites_h3: "YouTube + 2000 sitios",
  feat_sites_1:
    "**YouTube, al completo** — Videos, Shorts, Canales, Playlists, YouTube Music y Podcasts tratados como fuentes de primera clase",
  feat_sites_2:
    "**Más de 2000 sitios adicionales** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable y muchos más",
  feat_sites_3:
    "**Solo audio y subtítulos** funcionan en todos los sitios compatibles, no solo en YouTube",
  feat_sites_4:
    "Si un sitio cambia, yt-dlp publica correcciones semanalmente y Arroxy actualiza el binario automáticamente al iniciar",
  shot1_cap:
    "<b>Inicio de Descarga rápida</b><br/>Pega una URL y descárgala al instante con tu perfil activo",
  shot2_cap:
    "<b>Perfiles de descarga reutilizables</b><br/>Guarda formato, calidad y salida como preajustes — reutiliza en cada descarga",
  shot3_cap:
    "<b>Pistas de audio multiidioma</b><br/>Elige el idioma de audio exacto que trae el vídeo",
  shot4_cap:
    "<b>Audio Surround / Dolby</b><br/>Pistas 5.1 y Dolby detectadas y conservadas",
  shot5_cap:
    "<b>Modo de URLs en lote</b><br/>Pega una lista, elimina duplicados y encólalas todas a la vez",
  shot6_cap:
    "<b>Cola de descargas en paralelo</b><br/>Varias descargas a la vez con progreso en vivo",
  hotkey_fig_alt: "Atajo de descarga global de Arroxy — Ctrl+Shift+D en Windows y Linux, Cmd+Shift+D en macOS, que envía el enlace copiado directamente a la cola de descargas",
  hotkey_fig_cap: "<b>Atajo de descarga global</b><br/>Copia un enlace donde sea y pulsa una vez — entra en la cola y empieza a descargarse",
  shot7_cap: "<b>Perfiles por elemento de playlist</b><br/>Da a cada vídeo su propio perfil — archiva algunos en 4K y saca el resto como MP3",
  shot8_cap: "<b>Explore</b><br/>Navega por YouTube o cualquier otro sitio dentro de Arroxy y descarga la página en la que estás con tu perfil activo",
  shot9_cap: "<b>La primera pantalla de Explore</b><br/>Un vistazo rápido a Explore y por qué una cuenta secundaria es el inicio de sesión más seguro",
  shot10_cap: "<b>Descargas te avisa de lo que necesita tu atención</b><br/>Los enlaces se preparan en segundo plano; uno fallido ofrece su solución, una playlist larga espera tu decisión",
  shot11_cap:
    "<b>Descarga solo una parte del vídeo</b><br/>Elige un inicio y un final, o un capítulo — Arroxy guarda solo ese tramo",
  shot12_cap:
    "<b>Editor de perfiles</b><br/>Ajusta un perfil: tipo de archivo, resolución, subtítulos, destino, plantilla de nombre de archivo y más",
  shot13_cap:
    "<b>Oscuro o claro, cristal o sólido</b><br/>Cuatro aspectos a elegir: paneles de cristal sobre un cielo en movimiento o superficies sólidas y tranquilas, cada uno en oscuro y claro",
  dl_platform_col: "Plataforma",
  dl_format_col: "Formato",
  dl_oneline_note:
    "Solo hay versiones x86_64. ¿Sin `curl`? Cambia `curl -fsSL` por `wget -qO-`.",
  dl_win_scoop:
    "¿Prefieres Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Instalador (NSIS) o `.exe` portátil",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` o `.flatpak` (sandboxed)",
  dl_grab: "Obtén la última versión →",
  dl_pkg_h3: "Instalar mediante gestor de paquetes",
  dl_channel_col: "Canal",
  dl_command_col: "Comando",
  dl_win_h3: "Windows: Instalador vs Portátil",
  dl_win_col_installer: "Instalador NSIS",
  dl_win_col_portable: "`.exe` portátil",
  dl_win_r1: "Requiere instalación",
  dl_win_r1_installer: "Sí",
  dl_win_r1_portable: "No — ejecútalo desde donde quieras",
  dl_win_r2: "Auto-actualizaciones",
  dl_win_r2_installer: "✅ en la app",
  dl_win_r2_portable: "❌ descarga manual",
  dl_win_r3: "Velocidad de inicio",
  dl_win_r3_installer: "✅ más rápido",
  dl_win_r3_portable: "⚠️ inicio en frío más lento",
  dl_win_r4: "Aparece en el menú Inicio",
  dl_win_r5: "Desinstalación fácil",
  dl_win_r5_portable: "❌ solo borra el archivo",
  dl_win_rec:
    "**Recomendación:** usa el instalador NSIS para obtener auto-actualizaciones y un arranque más rápido. Usa el `.exe` portátil si prefieres no instalar ni tocar el registro.",
  dl_win_smartscreen_h4: "Advertencia de Windows SmartScreen",
  dl_win_smartscreen_intro:
    'En el primer arranque puede aparecer **"Windows protected your PC"** o **"Unknown publisher."** Esto aplica tanto a `Arroxy-win-x64-Setup.exe` como a `Arroxy-win-x64-Portable.exe`. Arroxy es gratuito y de código abierto, y las compilaciones de Windows no están firmadas con un certificado de pago, por lo que SmartScreen las marca. Eso **no** significa automáticamente que Arroxy sea inseguro. Para continuar:',
  dl_win_smartscreen_step1: "Haz clic en **More info**.",
  dl_win_smartscreen_step2: "Haz clic en **Run anyway**.",
  dl_win_smartscreen_official:
    "Descarga Arroxy solo desde la página oficial de GitHub Releases. Si obtuviste el archivo de otro sitio web o alguien te lo envió, bórralo y descarga una copia nueva desde la fuente oficial. El código fuente es público, así que puedes inspeccionarlo o compilar Arroxy tú mismo si lo prefieres.",
  dl_macos_h3: "Primer arranque en macOS",
  dl_macos_warning:
    "Arroxy aún no está firmado, así que macOS Gatekeeper puede mostrar la advertencia de app dañada en el primer inicio. Es esperado — no significa que los archivos estén realmente dañados.",
  dl_macos_m1_h4: "Método con Terminal:",
  dl_macos_step1:
    "Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.",
  dl_macos_step2:
    "Abre Terminal y ejecuta `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3:
    "Ejecuta `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Si la ruta de la app es distinta, reemplaza `/Applications/Arroxy.app` por la ruta donde la instalaste.",
  dl_macos_step5:
    "Introduce la contraseña de tu Mac si `sudo` la pide.",
  dl_macos_after:
    "Después de quitar la cuarentena, Arroxy se abre normalmente.",
  dl_macos_m2_h4: "Método con Terminal:",
  dl_macos_note:
    "Las compilaciones de macOS se producen mediante CI en runners de Apple Silicon e Intel. Si encuentras algún problema, por favor [abre un issue](../../issues) — los comentarios de usuarios de macOS influyen activamente en el ciclo de pruebas de macOS.",
  dl_linux_h3: "Primer arranque en Linux",
  dl_linux_intro:
    "Los AppImages se ejecutan directamente — sin instalación. Solo necesitas marcar el archivo como ejecutable.",
  dl_linux_m1_text:
    "**Gestor de archivos:** haz clic derecho en el `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir ejecutar el archivo como programa**, luego doble clic.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Si el arranque sigue fallando, ejecútalo sin montar — no hace falta el paquete FUSE:",
  dl_linux_targz_h4: "Tarball simple (sin FUSE, sin instalación):",
  dl_linux_targz_text: "La versión `.tar.gz` es la misma app sin el envoltorio AppImage: descomprímela donde quieras y ejecútala. Sin instalador y sin paquete FUSE.",
  dl_linux_arch_note: "**Las descargas de Linux en la página de versiones son solo x86_64.** En equipos ARM64 (Raspberry Pi, Asahi Linux) el Flatpak se instala pero falla al arrancar con `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Por qué puedes ver una advertencia",
  dl_warning_p1:
    "Arroxy es de código abierto y con licencia MIT. Las compilaciones de Windows y macOS **no están firmadas digitalmente** — los certificados Apple Developer ID y Windows EV de firma de código cuestan cada uno cientos de dólares al año, que un proyecto independiente paga de su bolsillo. Sin esas firmas, Windows SmartScreen y macOS Gatekeeper te advertirán en el primer arranque. Las advertencias significan *tu sistema operativo no reconoce al editor* — no significan que Arroxy sea malware.",
  dl_warning_p2:
    "Tres formas de verificar Arroxy tú mismo, en orden creciente de rigor:\n\n- **Lee el código fuente.** Cada línea está en [GitHub](https://github.com/antonio-orionus/Arroxy) y puedes [compilarlo desde el código fuente](#tech).\n- **Comprueba el SHA256.** Compara tu archivo con el [`SHA256SUMS`](../../releases/latest) publicado — consulta [Verifica tu descarga](#verify) a continuación.\n- **Realiza un análisis de terceros.** Sube el archivo a [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Primer arranque en Windows",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "Si Windows Defender marca o elimina el archivo",
  dl_win_defender_p:
    "La heurística de Defender a veces marca los instaladores NSIS sin firmar y los portables de Electron como sospechosos. Si Defender pone en cuarentena `Arroxy-win-x64-Setup.exe` o `Arroxy-win-x64-Portable.exe`, recupéralo desde **Windows Security → Virus & threat protection → Protection history**, y añade el ejecutable de Arroxy como elemento permitido en **Manage settings → Add or remove exclusions**. Al igual que con SmartScreen, el motivo es la firma del editor ausente, no malware detectado.",

  dl_macos_first_h3: "Primer arranque en macOS",
  dl_macos_intro:
    "Arroxy aún no está firmado digitalmente para macOS, así que Gatekeeper puede mostrar el aviso alarmante *\"Arroxy.app is damaged and can't be opened\"* después de instalarlo desde el DMG. Ese mensaje significa que macOS puso en cuarentena una app sin firmar; no significa que los archivos estén dañados. En macOS actual, la solución fiable es Terminal:",
  dl_macos_sequoia_h4: "Solución de Terminal para macOS actual",
  dl_macos_sequoia_intro:
    "Usa Terminal después de copiar Arroxy a Aplicaciones:",
  dl_macos_sequoia_step1:
    "Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.",
  dl_macos_sequoia_step2:
    "Abre Terminal y ejecuta estos dos comandos:",
  dl_macos_sequoia_step3:
    "Ejecuta `open /Applications/Arroxy.app` para iniciar Arroxy.",
  dl_macos_sequoia_step4:
    "Si la ruta de la app es distinta, reemplaza `/Applications/Arroxy.app` por la ruta donde la instalaste.",
  dl_macos_sonoma_h4: "Solución de Terminal para macOS anterior",
  dl_macos_sonoma_step1:
    "Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.",
  dl_macos_sonoma_step2:
    "Abre Terminal y elimina la cuarentena de `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Inicia Arroxy desde Terminal o Finder después de quitar la cuarentena.",
  dl_macos_damaged_h4:
    "Solución para la cuarentena de Gatekeeper",
  dl_macos_damaged_p:
    "El primer comando elimina el atributo de cuarentena de tu copia instalada de Arroxy. El segundo inicia la app. `sudo` puede pedir la contraseña de tu Mac; Terminal no mostrará caracteres mientras la escribes.",
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** en un Mac de la serie M (M1 / M2 / M3 / M4), descarga el DMG `arm64`. En Macs Intel, descarga el DMG `x64`. El build incorrecto funciona igualmente mediante Rosetta, pero es notablemente más lento.",

  dl_linux_first_h3: "Primer arranque en Linux",
  dl_linux_appimagelauncher:
    "**Integración de escritorio opcional:** instala [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) una sola vez, y cualquier AppImage en la que hagas doble clic quedará registrada automáticamente en tu menú de aplicaciones — sin necesidad de crear manualmente un archivo `.desktop`.",

  dl_verify_h3: "Verifica tu descarga (SHA256)",
  dl_verify_intro:
    "Cada versión publica un archivo `SHA256SUMS` junto a los binarios. Para comprobar que tu descarga no está corrompida ni fue manipulada en tránsito, calcula el hash de tu archivo localmente y compáralo con la línea en `SHA256SUMS`. Abre la página de la última versión → **Assets** → descarga `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "¿Quieres un análisis de malware de terceros? Sube el archivo en [VirusTotal](https://www.virustotal.com). Un puñado de alertas heurísticas genéricas de motores menores es normal en apps Electron sin firmar; detecciones generalizadas por motores principales serían una preocupación real.",

  dl_pm_intro:
    "¿Ya usas un gestor de paquetes? Puedes saltarte la descarga manual.",

  privacy_p1:
    "Las descargas se obtienen directamente a través de [yt-dlp](https://github.com/yt-dlp/yt-dlp) desde YouTube hacia la carpeta que elijas — nada pasa por un servidor de terceros. El historial de visualización, el historial de descargas, las URLs y el contenido de los archivos permanecen en tu dispositivo.",
  privacy_p2:
    "Sin telemetría — solo una señal anónima al día: versión de la app, OS, idioma, canal de instalación y país, para poder contar los usuarios activos. Sin IDs, URLs, títulos de video, rutas de archivo ni datos de cuenta. Puedes desactivarla en Configuración.",
  privacy_p3: "Explore mantiene su propio inicio de sesión, separado de tu navegador, y Arroxy nunca lee ni rellena el formulario de acceso: escribes en la propia página de Google. Las descargas se hacen sin sesión; solo cuando una falla de una forma que una cuenta puede arreglar, Arroxy lee el inicio de sesión en ese momento, lo guarda en un archivo temporal para esa descarga y borra el archivo después. Cerrar sesión en Explore desde Configuración lo olvida.",
  faq_q1: "¿Es realmente gratis?",
  faq_a1: "Sí — licencia MIT, sin nivel premium, sin funciones bloqueadas.",
  faq_q11: "¿En qué se diferencia Arroxy de otras GUI de yt-dlp?",
  faq_a11:
    "La mayoría de las GUI gratuitas de yt-dlp son wrappers que solo aceptan un enlace. Arroxy añade **Explore**, un navegador de YouTube integrado en la app: navegas y descargas sin copiar enlaces, e inicias sesión allí una vez para descargar vídeos privados, solo para miembros y con restricción de edad, y tus listas Ver más tarde y Me gusta, sin exportar cookies. Arroxy usa ese inicio de sesión cuando YouTube te pide confirmar que no eres un bot, y su navegador integrado obtiene el token de descarga de YouTube para que las descargas no se queden con menos formatos. Consulta [¿Por qué Arroxy?](#why).",
  faq_q2: "¿Qué calidades de video puedo descargar?",
  faq_a2:
    "Cualquiera que sirva YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, más solo audio. Los streams de 60 fps y HDR se conservan tal cual, y la descarga paso a paso te permite elegir AV1, VP9 o H.264 en cada resolución.",
  faq_q3: "¿Puedo extraer solo el audio como MP3?",
  faq_a3:
    "Sí. Elige *solo audio* en el menú de formatos y luego MP3, M4A/AAC, Opus o WAV.",
  faq_q4: "¿Cómo descargo vídeos que necesitan una cuenta de YouTube?",
  faq_a4: "Inicia sesión una vez en la pestaña Explore. Arroxy podrá entonces descargar vídeos privados y solo para miembros que tu cuenta pueda ver, vídeos con restricción de edad si la cuenta tiene la edad verificada, y tus listas Ver más tarde y Me gusta. Solo usa el inicio de sesión cuando una descarga falla de una forma que una cuenta puede arreglar; todo lo demás se descarga como antes. Es la opción **Inicio de sesión de Explore**, la primera de la lista y marcada como Recomendada en la configuración de cookies, y Arroxy la elige por ti la primera vez que abres Explore. La wiki de yt-dlp señala que [la automatización con sesión iniciada puede marcar una cuenta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), así que una cuenta secundaria es la opción más segura.",
  faq_q5: "¿Seguirá funcionando cuando YouTube cambie algo?",
  faq_a5: "yt-dlp se actualiza automáticamente al iniciar, y Arroxy publica correcciones rápidamente cuando YouTube cambia algo. Cuando YouTube te pide confirmar que no eres un bot, Arroxy también prueba tu inicio de sesión de Explore si lo has iniciado ahí, y las cookies de un archivo o de tu navegador están disponibles en la configuración de cookies.",
  faq_q6: "¿En qué idiomas está disponible Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} idiomas, listos para usar: {{LANG_NAME_LIST}}. Arroxy detecta automáticamente el idioma de tu sistema operativo en el primer inicio y puedes cambiarlo en cualquier momento desde el selector de idioma de la barra de herramientas. Los JSON de locale en runtime viven en src/shared/i18n/locales/, y los catálogos PO para traductores viven en i18n/locales/ — abre un PR en GitHub para contribuir.",
  faq_q7: "¿Necesito instalar algo más?",
  faq_a7:
    "No. yt-dlp, ffmpeg y ffprobe se descargan automáticamente en el primer arranque y se guardan en caché en tu máquina. Después de eso, no se necesita configuración adicional.",
  faq_q8: "¿Puedo descargar listas de reproducción o canales completos?",
  faq_a8:
    "Sí — ambas cosas. Pega una URL de playlist o canal (p. ej. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); elige cuántas entradas escanear y luego pon toda la lista en cola o selecciona videos concretos. Los filtros por fecha llegarán pronto.",
  faq_q9: 'macOS dice "la aplicación está dañada" — ¿qué hago?',
  faq_a9:
    "Es Gatekeeper de macOS bloqueando una app sin firmar, no un daño real. Consulta [macOS first launch](#macos-first-launch) para ver los comandos de Terminal que eliminan la cuarentena e inician Arroxy.",
  faq_q10: "¿Es legal descargar videos de YouTube?",
  faq_a10:
    "Para uso personal y privado, generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción.",
  plan_intro: "Todavía planeado — aproximadamente por orden de prioridad:",
  plan_col1: "Función",
  plan_col2: "Descripción",
  plan_r1_name: "**Filtros de listas y canales**",
  plan_r1_desc:
    "Filtros por rango de fechas al enumerar una playlist o un canal",
  plan_r2_name: "**Preferencias de pistas de audio de YouTube**",
  plan_r2_desc:
    "Define una pista de idioma hablado predeterminada para toda la app, con sobrescrituras por perfil cuando YouTube ofrece varias pistas de audio",
  plan_r3_name: "**Recuperación de reintentos más fuerte**",
  plan_r3_desc:
    "Una nueva ruta de reintento para descargas interrumpidas por conexiones de internet inestables o problemáticas",
  plan_r4_name: "**Cajón de gestor de descargas completo**",
  plan_r4_desc:
    "Convertir el cajón de cola en un gestor más completo, incluido cambiar carpetas de destino para elementos en cola",
  plan_r5_name: "**Descargas programadas**",
  plan_r5_desc: "Inicia una cola a una hora fijada (ejecuciones nocturnas)",
  plan_r9_name: "**Paquete AUR**",
  plan_r9_desc: "Instalación en Arch Linux y Omarchy con `yay -S arroxy-bin`",
  plan_cta:
    "¿Tienes alguna función en mente? [Abre una solicitud](../../issues) — la opinión de la comunidad guía la prioridad.",
  tech_content: TECH_CONTENT,
  support_h2: "Apoyar a Arroxy",
  support_note: "Arroxy es gratuito y con licencia MIT: sin anuncios, sin telemetría, sin versión de pago. Si te ahorra tiempo, puedes apoyar el desarrollo con Bitcoin, Tron o Ethereum: las direcciones están en [DONATE.md](DONATE.md), la única fuente oficial para ellas. Arroxy nunca te enviará una dirección por correo electrónico ni por mensaje directo. Dar una estrella al repositorio, informar de errores y mejorar las traducciones ayudan igual de mucho.",
  tos_h2: "Términos de uso",
  tos_note:
    "Arroxy es una herramienta para uso personal y privado únicamente. Eres el único responsable de garantizar que tus descargas cumplan con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción. No uses Arroxy para descargar, reproducir o distribuir contenido sobre el que no tengas derechos. Los desarrolladores no se hacen responsables del mal uso.",
  footer_credit:
    'Licencia MIT · Hecho con cariño por <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
