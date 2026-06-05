const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell de escritorio multiplataforma
- **React 19** + **TypeScript** — interfaz de usuario
- **Tailwind CSS v4** — estilos
- **Zustand** — gestión de estado
- **yt-dlp** + **ffmpeg** — motor de descarga y muxing (yt-dlp se obtiene en runtime; ffmpeg/ffprobe se incluyen al compilar)
- **Vite** + **electron-vite** — herramientas de compilación
- **Vitest** + **Playwright** — pruebas unitarias y de extremo a extremo

</details>

<details>
<summary><strong>Compilar desde el código fuente</strong></summary>

### Requisitos previos — todas las plataformas

| Herramienta | Versión  | Instalación |
| ----------- | -------- | ----------- |
| Git         | cualquiera | [git-scm.com](https://git-scm.com) |
| Bun         | latest   | ver por SO a continuación |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

No se requieren herramientas de compilación nativas — el proyecto no tiene addons nativos de Node.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clonar y ejecutar

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### Crear un distribuible

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # cross-compile Windows portable exe
\`\`\`

> yt-dlp se obtiene desde GitHub en el primer arranque y se guarda en la carpeta de datos de la app. ffmpeg y ffprobe vienen incluidos en cada release de Arroxy.

</details>`;

export const es = {
  icon_alt: "Mascota de Arroxy",
  title: "Arroxy — Descargador gratuito de YouTube (+ 2000 sitios) de código abierto para Windows, macOS y Linux",
  read_in_label: "Leer en:",
  badge_release_alt: "Versión",
  badge_build_alt: "Compilación",
  badge_license_alt: "Licencia",
  badge_platforms_alt: "Plataformas",
  badge_i18n_alt: "Idiomas",
  badge_website_alt: "Sitio web",
  hero_desc:
    "Descarga videos, Shorts, música, canales, podcasts o pistas de audio de **YouTube y más de 2000 sitios compatibles** — hasta 4K HDR a 60 fps, o como MP3 / AAC / Opus. Se ejecuta localmente en Windows, macOS y Linux. **Sin anuncios, sin bloatware, sin ventas adicionales.**",
  cta_latest: "↓ Descargar la última versión",
  cta_website: "Sitio web",
  demo_alt: "Demo de Arroxy",
  star_cta: "Si Arroxy te ahorra tiempo, una ⭐ ayuda a que otros lo encuentren.",
  ai_notice:
    "> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).",
  toc_heading: "Contenido",
  why_h2: "¿Por qué Arroxy?",
  features_h2: "Características",
  dl_h2: "Descargar",
  privacy_h2: "Privacidad",
  faq_h2: "Preguntas frecuentes",
  roadmap_h2: "Hoja de ruta",
  tech_h2: "Construido con",
  why_intro: "Una comparación directa con las alternativas más comunes:",
  why_r1: "Gratis, sin nivel premium",
  why_r2: "Código abierto",
  why_r3: "Procesamiento 100% local",
  why_r4: "Sin inicio de sesión ni exportación de cookies",
  why_r5: "Sin límites de uso",
  why_r6: "Aplicación de escritorio multiplataforma",
  why_r7: "Subtítulos + SponsorBlock",
  why_summary:
    "Arroxy está diseñado para una sola cosa: pega una URL y obtén un archivo local limpio. Sin cuentas, sin ventas adicionales, sin recolección de datos.",
  feat_quality_h3: "Calidad y formatos",
  feat_quality_1: "Hasta **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Alta frecuencia de fotogramas** conservada tal cual — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Solo audio** a MP3, M4A/AAC, Opus o WAV",
  feat_quality_4: "Presets rápidos: *Mejor calidad* · *Equilibrado* · *Archivo pequeño*",
  feat_privacy_h3: "Privacidad y control",
  feat_privacy_1:
    "Procesamiento 100% local — las descargas van directamente de YouTube a tu disco",
  feat_privacy_2: "Sin inicio de sesión, sin cookies, sin cuenta de Google vinculada",
  feat_privacy_3: "Archivos guardados directamente en la carpeta que elijas",
  feat_workflow_h3: "Flujo de trabajo",
  feat_workflow_1:
    "**Modos de inicio flexibles** — elige una descarga individual guiada, selector de playlist/canal, pegado masivo de URLs o Quick Download con tus valores guardados",
  feat_workflow_2:
    "**Cola central de descargas** — cada trabajo individual, de playlist, masivo o rápido llega a un solo lugar para ver progreso, pausar, reanudar, cancelar, reintentar y controlar prioridad",
  feat_workflow_3:
    "**Monitoreo del portapapeles** — copia un enlace de YouTube y Arroxy rellena automáticamente la URL al volver a enfocar la app (actívalo en la Configuración avanzada)",
  feat_workflow_4:
    "**Limpieza automática de URLs** — elimina parámetros de seguimiento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) y desempaqueta los enlaces `youtube.com/redirect`",
  feat_workflow_5:
    "**Modo bandeja** — cerrar la ventana mantiene las descargas en segundo plano",
  feat_workflow_6:
    "**21 idiomas** — detecta automáticamente el idioma del sistema, se puede cambiar en cualquier momento",
  feat_workflow_7:
    "**Sincronización de playlists** — vuelve a escanear una playlist contra una carpeta local para omitir vídeos ya descargados; genera un archivo de playlist `.m3u` que se actualiza con cada vídeo descargado",
  feat_workflow_8:
    "**Controles de velocidad y ritmo** — limita el ancho de banda de descarga, añade pausas entre solicitudes y ajusta los hilos de fragmentos con presets (*Desactivado · Equilibrado · Cuidadoso · Personalizado*)",
  feat_post_h3: "Subtítulos y posprocesamiento",
  feat_post_1:
    "**Subtítulos** en SRT, VTT o ASS — manuales o generados automáticamente, en cualquier idioma disponible",
  feat_post_2:
    "Guárdalos junto al video, incrústalos en `.mkv` u organízalos en una subcarpeta `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — omite o marca como capítulos patrocinadores, intros, outros y autopromociones",
  feat_post_4:
    "**Metadatos incrustados** — título, fecha de subida, canal, descripción, miniatura y marcadores de capítulo escritos en el archivo",
  feat_sites_h3: "YouTube + 2000 sitios",
  feat_sites_1:
    "**YouTube, al completo** — Videos, Shorts, Canales, Playlists, YouTube Music y Podcasts tratados como fuentes de primera clase",
  feat_sites_2:
    "**Más de 2000 sitios adicionales** via yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org y muchos más",
  feat_sites_3:
    "**Solo audio y subtítulos** funcionan en todos los sitios compatibles, no solo en YouTube",
  feat_sites_4:
    "Si un sitio cambia, yt-dlp publica correcciones semanalmente y Arroxy actualiza el binario automáticamente al iniciar",
  shot1_alt: "Pega una URL",
  shot2_alt: "Elige la calidad",
  shot3_alt: "Elige dónde guardar",
  shot4_alt: "Cola de descargas en acción",
  shot5_alt: "Selector de idioma y formato de subtítulos",
  dl_platform_col: "Plataforma",
  dl_format_col: "Formato",
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
    "En el primer arranque puede aparecer **\"Windows protected your PC\"** o **\"Unknown publisher.\"** Esto aplica tanto a `Arroxy-win-x64-Setup.exe` como a `Arroxy-win-x64-Portable.exe`. Arroxy es gratuito y de código abierto, y las compilaciones de Windows no están firmadas con un certificado de pago, por lo que SmartScreen las marca. Eso **no** significa automáticamente que Arroxy sea inseguro. Para continuar:",
  dl_win_smartscreen_step1: "Haz clic en **More info**.",
  dl_win_smartscreen_step2: "Haz clic en **Run anyway**.",
  dl_win_smartscreen_official:
    "Descarga Arroxy solo desde la página oficial de GitHub Releases. Si obtuviste el archivo de otro sitio web o alguien te lo envió, bórralo y descarga una copia nueva desde la fuente oficial. El código fuente es público, así que puedes inspeccionarlo o compilar Arroxy tú mismo si lo prefieres.",
  dl_macos_h3: "Primer arranque en macOS",
  dl_macos_warning:
    "Arroxy aún no está firmado con código, por lo que Gatekeeper de macOS mostrará una advertencia en el primer arranque. Esto es esperado — no indica ningún daño.",
  dl_macos_m1_h4: "Método de Configuración del Sistema (recomendado):",
  dl_macos_step1: "Haz clic derecho en el ícono de Arroxy y selecciona **Abrir**.",
  dl_macos_step2:
    "Aparecerá el cuadro de advertencia — haz clic en **Cancelar** (no en *Mover a la papelera*).",
  dl_macos_step3: "Abre **Configuración del Sistema → Privacidad y seguridad**.",
  dl_macos_step4:
    'Baja hasta la sección **Seguridad**. Verás _"Arroxy fue bloqueado porque no es de un desarrollador identificado."_',
  dl_macos_step5:
    "Haz clic en **Abrir igualmente** y confirma con tu contraseña o Touch ID.",
  dl_macos_after:
    "Después del paso 5, Arroxy se abre con normalidad y la advertencia no vuelve a aparecer.",
  dl_macos_m2_h4: "Método por Terminal (avanzado):",
  dl_macos_note:
    "Las compilaciones de macOS se producen mediante CI en runners de Apple Silicon e Intel. Si encuentras algún problema, por favor [abre un issue](../../issues) — los comentarios de usuarios de macOS influyen activamente en el ciclo de pruebas de macOS.",
  dl_linux_h3: "Primer arranque en Linux",
  dl_linux_intro:
    "Los AppImages se ejecutan directamente — sin instalación. Solo necesitas marcar el archivo como ejecutable.",
  dl_linux_m1_text:
    "**Gestor de archivos:** haz clic derecho en el `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir ejecutar el archivo como programa**, luego doble clic.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Si el arranque sigue fallando, puede que te falte FUSE:",
  dl_linux_flatpak_intro:
    "**Flatpak (alternativa con sandbox):** descarga `Arroxy-*.flatpak` desde la misma página de release.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
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
    "Arroxy aún no está firmado digitalmente para macOS, así que Gatekeeper bloqueará el primer arranque. La ruta exacta para permitirlo depende de tu versión de macOS — Sequoia 15 endureció el antiguo método de saltarse Gatekeeper con clic derecho → Abrir.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 y posterior (actual)",
  dl_macos_sequoia_intro:
    "En Sequoia 15 y versiones más nuevas, clic derecho → Abrir ya no sortea Gatekeeper para muchas apps en cuarentena. Usa el panel de Configuración del Sistema:",
  dl_macos_sequoia_step1:
    "Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.",
  dl_macos_sequoia_step2:
    "Haz doble clic en Arroxy. Aparece el diálogo de bloqueo — haz clic en **Done** (no hagas clic en *Move to Trash*).",
  dl_macos_sequoia_step3:
    'Abre **System Settings → Privacy & Security** y desplázate hasta la sección **Security**. Verás *"Arroxy was blocked to protect your Mac"* (o un mensaje casi idéntico).',
  dl_macos_sequoia_step4:
    "Haz clic en **Open Anyway**, confirma con tu contraseña o Touch ID, y vuelve a iniciar Arroxy desde `/Applications`.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 y anterior",
  dl_macos_sonoma_step1:
    "Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.",
  dl_macos_sonoma_step2:
    "Haz clic derecho (o Control-clic) en `Arroxy.app` en `/Applications` y elige **Open**.",
  dl_macos_sonoma_step3:
    "El diálogo de advertencia ahora tiene un botón **Open** — haz clic en él y confirma. Arroxy se abre con normalidad y la advertencia no vuelve a aparecer.",
  dl_macos_damaged_h4:
    '"App is damaged" o bloqueo persistente de Gatekeeper — solución con Terminal',
  dl_macos_damaged_p:
    'Si macOS dice *"Arroxy is damaged and can\'t be opened"*, o ninguno de los pasos anteriores elimina el bloqueo, el atributo de cuarentena del DMG es la causa (algunos navegadores y el propio comportamiento de translación de macOS lo establecen). Elimínalo de la app instalada:',
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
    "Arroxy envía telemetría anónima y agregada a través de [OpenPanel](https://openpanel.dev) — lo justo para entender arranques, OS, versiones de la app y fallos. Sin URLs, títulos de video, rutas de archivo, datos de cuenta, fingerprinting ni datos personales. El ID por instalación es aleatorio y no está ligado a tu identidad. Puedes desactivarlo en Configuración.",
  faq_q1: "¿Es realmente gratis?",
  faq_a1: "Sí — licencia MIT, sin nivel premium, sin funciones bloqueadas.",
  faq_q2: "¿Qué calidades de video puedo descargar?",
  faq_a2:
    "Cualquiera que sirva YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, más solo audio. Los streams de 60 fps, 120 fps y HDR se conservan tal cual.",
  faq_q3: "¿Puedo extraer solo el audio como MP3?",
  faq_a3: "Sí. Elige *solo audio* en el menú de formatos y luego MP3, M4A/AAC, Opus o WAV.",
  faq_q4: "¿Necesito una cuenta de YouTube o cookies?",
  faq_a4:
    "Por defecto, no — Arroxy funciona sin cuenta de YouTube, sin inicio de sesión y sin exportación de cookies. Hay soporte opcional de cookies disponible en la configuración avanzada (Origen de cookies: archivo o navegador) para contenido que requiere autenticación, como videos con restricción de edad o solo para miembros. Está desactivado por defecto. Si lo activas, la wiki de yt-dlp señala que [la automatización basada en cookies puede marcar una cuenta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); en ese caso, una cuenta desechable es la opción más segura.",
  faq_q5: "¿Seguirá funcionando cuando YouTube cambie algo?",
  faq_a5:
    "yt-dlp se actualiza automáticamente al iniciar, y Arroxy publica correcciones rápidamente cuando YouTube cambia algo. Si alguna vez tienes algún problema, hay soporte opcional de cookies disponible en la configuración avanzada como alternativa.",
  faq_q6: "¿En qué idiomas está disponible Arroxy?",
  faq_a6:
    "Veintiuno, listos para usar: English, Español, Deutsch (alemán), Français (francés), 日本語 (japonés), 中文 (chino), Русский (ruso), Українська (ucraniano), हिन्दी (hindi), Afaan Oromoo, Kiswahili, O'zbekcha (uzbeko), Tiếng Việt (vietnamita), አማርኛ (amhárico), العربية (árabe), اردو (urdu), پښتو (pastún), বাংলা (bengalí), မြန်မာဘာသာ (birmano), Ελληνικά (griego) y Српски (serbio). Arroxy detecta el idioma de tu sistema operativo en el primer arranque y puedes cambiarlo en cualquier momento desde el selector de idioma en la barra de herramientas. Las traducciones viven como objetos TypeScript planos en src/shared/i18n/locales/ — abre un PR en GitHub para contribuir.",
  faq_q7: "¿Necesito instalar algo más?",
  faq_a7:
    "No. yt-dlp se descarga automáticamente en el primer arranque y se guarda en caché en tu máquina; ffmpeg y ffprobe vienen incluidos con la app. Después de eso, no se necesita configuración adicional.",
  faq_q8: "¿Puedo descargar listas de reproducción o canales completos?",
  faq_a8:
    "Sí — ambas cosas. Pega una URL de playlist o canal (p. ej. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); elige cuántas entradas escanear y luego pon toda la lista en cola o selecciona videos concretos. Los filtros por fecha llegarán pronto.",
  faq_q9: 'macOS dice "la aplicación está dañada" — ¿qué hago?',
  faq_a9:
    'Es Gatekeeper de macOS bloqueando una app sin firmar, no un daño real. Consulta ["App is damaged" — solución con Terminal](#macos-first-launch) para el comando `xattr` de una sola línea que lo resuelve.',
  faq_q10: "¿Es legal descargar videos de YouTube?",
  faq_a10:
    "Para uso personal y privado, generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción.",
  plan_intro: "Todavía planeado — aproximadamente por orden de prioridad:",
  plan_col1: "Función",
  plan_col2: "Descripción",
  plan_r1_name: "**Filtros de listas y canales**",
  plan_r1_desc: "Filtros por rango de fechas al enumerar una playlist o un canal",
  plan_r2_name: "**Entrada de URLs por lotes**",
  plan_r2_desc: "Pega varias URLs a la vez y lánzalas todas juntas",
  plan_r4_name: "**Plantillas de nombre de archivo personalizadas**",
  plan_r4_desc:
    "Nombra archivos por título, autor, fecha, resolución — con vista previa en vivo",
  plan_r5_name: "**Descargas programadas**",
  plan_r5_desc: "Inicia una cola a una hora fijada (ejecuciones nocturnas)",
  plan_r6_name: "**Límites de velocidad**",
  plan_r6_desc: "Limita el ancho de banda para que las descargas no saturen tu conexión",
  plan_r7_name: "**Recorte de clips**",
  plan_r7_desc: "Descarga solo un segmento especificando tiempo de inicio y fin",
  plan_cta:
    "¿Tienes alguna función en mente? [Abre una solicitud](../../issues) — la opinión de la comunidad guía la prioridad.",
  tech_content: TECH_CONTENT,
  tos_h2: "Términos de uso",
  tos_note:
    "Arroxy es una herramienta para uso personal y privado únicamente. Eres el único responsable de garantizar que tus descargas cumplan con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción. No uses Arroxy para descargar, reproducir o distribuir contenido sobre el que no tengas derechos. Los desarrolladores no se hacen responsables del mal uso.",
  footer_credit:
    'Licencia MIT · Hecho con cariño por <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
