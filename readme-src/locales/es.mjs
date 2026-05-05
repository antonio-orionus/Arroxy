const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell de escritorio multiplataforma
- **React 19** + **TypeScript** — interfaz de usuario
- **Tailwind CSS v4** — estilos
- **Zustand** — gestión de estado
- **yt-dlp** + **ffmpeg** — motor de descarga y muxing (obtenidos de GitHub en el primer arranque, siempre actualizados)
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

> yt-dlp y ffmpeg no están incluidos — se descargan de GitHub en el primer arranque y se guardan en caché en tu carpeta de datos de la aplicación.

</details>`;

export const es = {
  icon_alt: "Mascota de Arroxy",
  title: "Arroxy — Descargador gratuito de YouTube de código abierto para Windows, macOS y Linux",
  read_in_label: "Leer en:",
  badge_release_alt: "Versión",
  badge_build_alt: "Compilación",
  badge_license_alt: "Licencia",
  badge_platforms_alt: "Plataformas",
  badge_i18n_alt: "Idiomas",
  badge_website_alt: "Sitio web",
  hero_desc:
    "Descarga cualquier video, Short o pista de audio de YouTube en calidad original — hasta 4K HDR a 60 fps, o como MP3 / AAC / Opus. Se ejecuta localmente en Windows, macOS y Linux. **Sin anuncios, sin inicio de sesión, sin cookies del navegador, sin cuenta de Google vinculada.**",
  cta_latest: "↓ Descargar la última versión",
  cta_website: "Sitio web",
  demo_alt: "Demo de Arroxy",
  star_cta: "Si Arroxy te ahorra tiempo, una ⭐ ayuda a que otros lo encuentren.",
  ai_notice:
    "> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).",
  toc_heading: "Contenido",
  why_h2: "¿Por qué Arroxy?",
  nocookies_h2: "Sin cookies, sin inicio de sesión, sin cuenta vinculada",
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
  nocookies_intro:
    "Esta es la razón más común por la que los descargadores de YouTube de escritorio fallan — y la razón principal por la que existe Arroxy.",
  nocookies_setup:
    "Cuando YouTube actualiza su detección de bots, la mayoría de las herramientas te piden que exportes las cookies de YouTube de tu navegador como solución alternativa. Dos problemas con eso:",
  nocookies_p1:
    "Las sesiones exportadas suelen caducar en ~30 minutos, por lo que tienes que reexportarlas constantemente.",
  nocookies_p2:
    "La propia documentación de yt-dlp [advierte que la automatización basada en cookies puede marcar tu cuenta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy nunca solicita cookies, inicio de sesión ni ninguna credencial.** Usa solo los tokens públicos que YouTube sirve a cualquier navegador. Nada vinculado a tu identidad de Google, nada que caduque, nada que rotar.",
  feat_quality_h3: "Calidad y formatos",
  feat_quality_1: "Hasta **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Alta frecuencia de fotogramas** conservada tal cual — 60 fps, 120 fps, HDR",
  feat_quality_3: "Exportación de **solo audio** a MP3, AAC u Opus",
  feat_quality_4: "Presets rápidos: *Mejor calidad* · *Equilibrado* · *Archivo pequeño*",
  feat_privacy_h3: "Privacidad y control",
  feat_privacy_1:
    "Procesamiento 100% local — las descargas van directamente de YouTube a tu disco",
  feat_privacy_2: "Sin inicio de sesión, sin cookies, sin cuenta de Google vinculada",
  feat_privacy_3: "Archivos guardados directamente en la carpeta que elijas",
  feat_workflow_h3: "Flujo de trabajo",
  feat_workflow_1:
    "**Pega cualquier URL de YouTube** — videos y Shorts compatibles",
  feat_workflow_2:
    "**Cola de múltiples descargas** — sigue varias descargas en paralelo",
  feat_workflow_3:
    "**Monitoreo del portapapeles** — copia un enlace de YouTube y Arroxy rellena automáticamente la URL al volver a enfocar la app (actívalo en la Configuración avanzada)",
  feat_workflow_4:
    "**Limpieza automática de URLs** — elimina parámetros de seguimiento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) y desempaqueta los enlaces `youtube.com/redirect`",
  feat_workflow_5:
    "**Modo bandeja** — cerrar la ventana mantiene las descargas en segundo plano",
  feat_workflow_6:
    "**9 idiomas** — detecta automáticamente el idioma del sistema, se puede cambiar en cualquier momento",
  feat_post_h3: "Subtítulos y posprocesamiento",
  feat_post_1:
    "**Subtítulos** en SRT, VTT o ASS — manuales o generados automáticamente, en cualquier idioma disponible",
  feat_post_2:
    "Guárdalos junto al video, incrústalos en `.mkv` u organízalos en una subcarpeta `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — omite o marca como capítulos patrocinadores, intros, outros y autopromociones",
  feat_post_4:
    "**Metadatos incrustados** — título, fecha de subida, canal, descripción, miniatura y marcadores de capítulo escritos en el archivo",
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
  privacy_p1:
    "Las descargas se obtienen directamente a través de [yt-dlp](https://github.com/yt-dlp/yt-dlp) desde YouTube hacia la carpeta que elijas — nada pasa por un servidor de terceros. El historial de visualización, el historial de descargas, las URLs y el contenido de los archivos permanecen en tu dispositivo.",
  privacy_p2:
    "Arroxy envía telemetría anónima y agregada a través de [Aptabase](https://aptabase.com) — lo justo para que un proyecto independiente vea si alguien lo usa realmente (arranques, SO, versión de la app, fallos). Sin URLs, sin títulos de video, sin rutas de archivo, sin IPs, sin información de cuenta — Aptabase es de código abierto y compatible con GDPR por diseño. Puedes desactivarlo en Configuración.",
  faq_q1: "¿Es realmente gratis?",
  faq_a1: "Sí — licencia MIT, sin nivel premium, sin funciones bloqueadas.",
  faq_q2: "¿Qué calidades de video puedo descargar?",
  faq_a2:
    "Cualquiera que sirva YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, más solo audio. Los streams de 60 fps, 120 fps y HDR se conservan tal cual.",
  faq_q3: "¿Puedo extraer solo el audio como MP3?",
  faq_a3: "Sí. Elige *solo audio* en el menú de formato y selecciona MP3, AAC u Opus.",
  faq_q4: "¿Necesito una cuenta de YouTube o cookies?",
  faq_a4:
    "No. Arroxy usa solo los tokens públicos que YouTube sirve a cualquier navegador. Sin cookies, sin inicio de sesión, sin credenciales almacenadas. Consulta [Sin cookies, sin inicio de sesión, sin cuenta vinculada](#no-cookies) para entender por qué es importante.",
  faq_q5: "¿Seguirá funcionando cuando YouTube cambie algo?",
  faq_a5:
    "Dos capas de resiliencia: yt-dlp se actualiza en horas tras los cambios de YouTube, y Arroxy no depende de cookies que caducan cada ~30 minutos. Eso lo hace notablemente más estable que las herramientas que dependen de sesiones de navegador exportadas.",
  faq_q6: "¿En qué idiomas está disponible Arroxy?",
  faq_a6:
    "Nueve: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Detecta automáticamente el idioma del sistema; cámbialo en cualquier momento desde la barra de herramientas. Los archivos de idioma son objetos TypeScript planos en `src/shared/i18n/locales/` — [las PRs son bienvenidas](../../pulls).",
  faq_q7: "¿Necesito instalar algo más?",
  faq_a7:
    "No. yt-dlp y ffmpeg se descargan automáticamente en el primer arranque desde sus releases oficiales en GitHub y se guardan en caché localmente.",
  faq_q8: "¿Puedo descargar listas de reproducción o canales completos?",
  faq_a8:
    "Hoy se admiten videos individuales y Shorts. El soporte de listas y canales está en la [hoja de ruta](#roadmap).",
  faq_q9: 'macOS dice "la aplicación está dañada" — ¿qué hago?',
  faq_a9:
    "Es Gatekeeper de macOS bloqueando una app sin firmar — no es un daño real. Consulta la sección de [primer arranque en macOS](#download) para la solución.",
  faq_q10: "¿Es legal descargar videos de YouTube?",
  faq_a10:
    "Para uso personal y privado, generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción.",
  plan_intro: "Próximamente — aproximadamente por orden de prioridad:",
  plan_col1: "Función",
  plan_col2: "Descripción",
  plan_r1_name: "**Descarga de listas y canales**",
  plan_r1_desc:
    "Pega la URL de una lista o canal; encola todos los videos con filtros por fecha o cantidad",
  plan_r2_name: "**Entrada de URLs por lotes**",
  plan_r2_desc: "Pega varias URLs a la vez y lánzalas todas juntas",
  plan_r3_name: "**Conversión de formato**",
  plan_r3_desc: "Convierte descargas a MP3, WAV, FLAC sin necesitar otra herramienta",
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
