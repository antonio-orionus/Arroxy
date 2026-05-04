// Landing-page translations for "es". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const es = {
  title: "Arroxy — Descargador de YouTube 4K gratuito, sin inicio de sesión",
  description:
    "Descargador de escritorio YouTube gratuito con licencia MIT para Windows, macOS y Linux. Descarga videos en hasta 4K HDR a 60 fps sin cuenta de Google, cookies del navegador ni ningún inicio de sesión.",
  og_title: "Arroxy — Descargador de YouTube 4K gratuito, sin inicio de sesión",
  og_description:
    "Descargador de YouTube 4K gratuito. Sin cookies, sin inicios de sesión, sin sesiones rotas. Licencia MIT. Windows · macOS · Linux.",

  nav_features: "Funciones",
  nav_screenshots: "Capturas",
  nav_install: "Instalar",
  nav_download: "Descargar",

  hero_eyebrow: "Open Source · MIT · Desarrollo activo",
  hero_h1_a: "Descargador de YouTube 4K gratuito.",
  hero_h1_b: "Sin cookies. Sin inicios de sesión. Sin sesiones rotas.",
  hero_tagline:
    "Arroxy es un descargador de escritorio YouTube gratuito con licencia MIT para Windows, macOS y Linux. Descarga videos en hasta 4K HDR a 60 fps — sin pedir nunca una cuenta de Google, cookies del navegador ni ningún inicio de sesión.",
  hero_trust: "Audita cada línea en GitHub.",
  pill_no_account: "Sin cuenta de Google",
  pill_no_tracking: "Sin rastreo",
  pill_open_source: "Código abierto (MIT)",
  cta_download_os: "Descargar para tu SO",
  cta_view_github: "Ver en GitHub",
  release_label: "Última versión:",
  release_loading: "cargando…",

  cta_download_windows: "Descargar para Windows",
  cta_download_windows_portable: "Portátil .exe (sin instalación)",
  cta_download_mac_arm: "Descargar para macOS (Apple Silicon)",
  cta_download_mac_intel: "¿Mac con Intel? Obtener DMG x64",
  cta_download_linux_appimage: "Descargar para Linux (.AppImage)",
  cta_download_linux_flatpak: "Paquete Flatpak →",
  cta_other_platforms: "Otras plataformas / Todas las descargas",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "Instalador",
  cta_portable_label: "Portátil",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy es una app de escritorio para Windows, macOS y Linux.",
  mobile_notice_sub: "Visita esta página desde tu computadora para descargar.",
  mobile_copy_link: "Copiar enlace de la página",
  first_launch_label: "Ayuda en el primer arranque",
  first_launch_mac_html:
    "macOS muestra un aviso de <em>desarrollador no identificado</em> en el primer arranque — Arroxy aún no está firmada. <strong>Clic derecho en el icono → Abrir</strong>, luego pulsa <strong>Abrir</strong> en el diálogo. Solo la primera vez.",
  first_launch_linux_html:
    "<strong>AppImage:</strong> clic derecho en el archivo → <strong>Propiedades → Permitir ejecutar como programa</strong>, o ejecuta <code>chmod +x Arroxy-*.AppImage</code> en una terminal. Si aún no inicia, instala <code>libfuse2</code> (Ubuntu/Debian), <code>fuse-libs</code> (Fedora) o <code>fuse2</code> (Arch).<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code>, luego ábrelo desde el menú de aplicaciones o ejecuta <code>flatpak run io.github.antonio_orionus.Arroxy</code>.",

  features_eyebrow: "Qué hace",
  features_h2: "Todo lo que esperas, sin fricción.",
  features_sub: "Pega una URL, elige la calidad, haz clic en descargar. Así de simple.",
  f1_h: "Hasta 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — todas las resoluciones que ofrece YouTube, además de audio MP3, AAC y Opus.",
  f2_h: "60 fps y HDR preservados",
  f2_p: "Las transmisiones de alta tasa de fotogramas y HDR llegan tal como las codifica YouTube — sin pérdida de calidad.",
  f3_h: "Varios a la vez",
  f3_p: "Pon en cola tantos videos como quieras. El panel de descargas muestra el progreso de cada uno en paralelo.",
  f4_h: "Actualizaciones automáticas",
  f4_p: "Arroxy mantiene yt-dlp y ffmpeg al día — funciona con cada cambio de YouTube.",
  f5_h: "9 idiomas",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — detecta el tuyo automáticamente.",
  f6_h: "Multiplataforma",
  f6_p: "Compilaciones nativas para Windows, macOS y Linux — instalador, portátil, DMG o AppImage.",
  f7_h: "Subtítulos a tu manera",
  f7_p: "Subtítulos manuales o automáticos en SRT, VTT o ASS — junto al video, integrados en un .mkv portátil, o en una subcarpeta Subtitles/.",
  f8_h: "SponsorBlock integrado",
  f8_p: "Omite o marca segmentos de patrocinadores, intros, outros, autopromociones y más — recórtalos con FFmpeg o simplemente añade capítulos. Tú decides, por categoría.",
  f9_h: "Autocompletar desde portapapeles",
  f9_p: "Copia un enlace de YouTube en cualquier lugar y Arroxy lo detecta al volver a la app — un diálogo de confirmación mantiene el control. Actívalo o desactívalo en Configuración avanzada.",
  f10_h: "Limpieza automática de URLs",
  f10_p: "Los parámetros de seguimiento (si, pp, feature, utm_*, fbclid, gclid y más) se eliminan automáticamente de los enlaces de YouTube pegados, y los envoltorios youtube.com/redirect se desempaquetan — el campo de URL siempre muestra el enlace canónico.",
  f11_h: "Se oculta en la bandeja",
  f11_p: "Cerrar la ventana lleva Arroxy a la bandeja del sistema. Las descargas siguen ejecutándose en segundo plano — haz clic en el icono para volver a la ventana, o sal desde el menú de la bandeja.",
  f12_h: "Metadatos y portada integrados",
  f12_p: "Título, fecha de subida, artista, descripción, portada y marcadores de capítulo escritos directamente en el archivo — sin archivos auxiliares ni etiquetado manual.",

  shots_eyebrow: "Velo en acción",
  shots_h2: "Diseñado para la claridad, no para el desorden.",
  shot1_alt: "Pega una URL",
  shot2_alt: "Elige tu calidad",
  shot3_alt: "Elige dónde guardar",
  shot4_alt: "Descargas en paralelo",
  shot5_alt: "Paso de subtítulos — elige idiomas, formato y modo de guardado",
  og_image_alt: "Icono de la app Arroxy — app de escritorio para descargar videos de YouTube en 4K.",

  privacy_eyebrow: "Privacidad",
  privacy_h2_html: "Lo que Arroxy <em>no</em> hace.",
  privacy_sub:
    "La mayoría de descargadores de YouTube acaban pidiendo tus cookies. Arroxy nunca lo hará.",
  p1_h: "Sin inicio de sesión",
  p1_p: "Sin cuenta de Google. Sin sesiones que caducan. Cero riesgo de que marquen tu cuenta.",
  p2_h: "Sin cookies",
  p2_p: "Arroxy solicita los mismos tokens que cualquier navegador. Nada se exporta, nada se almacena.",
  p3_h: "Sin IDs de usuario",
  p3_p: "Telemetría anónima y solo de sesión vía Aptabase — sin IDs de instalación, sin fingerprinting, sin datos personales. Tus descargas, historial y archivos nunca salen de tu máquina.",
  p4_h: "Sin servidores de terceros",
  p4_p: "Todo el proceso se ejecuta localmente con yt-dlp + ffmpeg. Los archivos nunca tocan un servidor remoto.",

  install_eyebrow: "Instalar",
  install_h2: "Elige tu canal.",
  install_sub:
    "Descarga directa o cualquier gestor de paquetes — todos se actualizan automáticamente con cada versión.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Todo",
  winget_desc: "Recomendado para Windows 10/11. Se actualiza con el sistema.",
  scoop_desc: "Instalación portátil vía Scoop bucket. No requiere permisos de administrador.",
  brew_desc: "Añade el tap, instala con un comando. Binario universal (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Instalación con sandbox. Descarga el bundle .flatpak desde Releases e instálalo con un comando. Sin configurar Flathub.",
  direct_h: "Descarga directa",
  direct_desc: "Instalador NSIS, .exe portátil, .dmg, .AppImage o .flatpak — directo desde GitHub Releases.",
  direct_btn: "Abrir Releases →",
  copy_label: "Copiar",
  copied_label: "¡Copiado!",

  footer_made_by: "Licencia MIT · Hecho con cariño por",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Idioma:",

  faq_eyebrow: "FAQ",
  faq_h2: "Preguntas frecuentes",
  faq_q1: "¿Qué calidades de video puedo descargar?",
  faq_a1:
    "Cualquiera que ofrezca YouTube — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p y solo audio. Los streams de alto frame rate (60 fps, 120 fps) y HDR se conservan tal cual. Arroxy te muestra todos los formatos disponibles y te deja elegir exactamente cuál bajar.",
  faq_q2: "¿De verdad es gratis?",
  faq_a2: "Sí. Licencia MIT. Sin nivel premium, sin funciones bloqueadas.",
  faq_q3: "¿En qué idiomas está disponible Arroxy?",
  faq_a3:
    "En nueve, listos para usar: English, Español, Deutsch (alemán), Français (francés), 日本語 (japonés), 中文 (chino), Русский (ruso), Українська (ucraniano) y हिन्दी (hindi). Arroxy detecta el idioma de tu sistema operativo en el primer arranque y puedes cambiarlo en cualquier momento desde el selector de idioma en la barra de herramientas. Las traducciones viven como objetos TypeScript planos en src/shared/i18n/locales/ — abre un PR en GitHub para contribuir.",
  faq_q4: "¿Necesito instalar algo?",
  faq_a4:
    "No. yt-dlp y ffmpeg se descargan automáticamente en el primer arranque desde sus releases oficiales en GitHub y se guardan en caché en tu máquina. Después de eso, no se necesita configuración adicional.",
  faq_q5: "¿Seguirá funcionando si YouTube cambia algo?",
  faq_a5:
    "Sí — y Arroxy tiene dos capas de resiliencia. Primero, yt-dlp es una de las herramientas open-source más mantenidas activamente — se actualiza en horas tras cualquier cambio de YouTube. Segundo, Arroxy no depende de cookies ni de tu cuenta de Google, así que no hay sesión que caduque ni credenciales que rotar. Esa combinación lo hace mucho más estable que las herramientas que dependen de cookies exportadas del navegador.",
  faq_q6: "¿Puedo descargar listas de reproducción?",
  faq_a6:
    "Hoy se admiten videos individuales. El soporte de listas y canales está en la hoja de ruta.",
  faq_q7: "¿Necesita mi cuenta de YouTube o cookies?",
  faq_a7:
    "No — y es un tema más importante de lo que parece. La mayoría de las herramientas que dejan de funcionar tras una actualización de YouTube te piden exportar las cookies de YouTube de tu navegador. Esa solución se rompe cada ~30 minutos cuando YouTube rota las sesiones, y la propia documentación de yt-dlp advierte que puede provocar el baneo de tu cuenta de Google. Arroxy nunca usa cookies ni credenciales. Sin login. Sin cuenta vinculada. Nada que caduque, nada que banear.",
  faq_q8:
    'macOS dice "la aplicación está dañada" o "no se puede abrir" — ¿qué hago?',
  faq_a8:
    "Es Gatekeeper de macOS bloqueando una app sin firmar — no es un daño real. El README tiene instrucciones paso a paso para el primer arranque en macOS.",
  faq_q9: "¿Es legal?",
  faq_a9:
    "Descargar videos para uso personal generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los Términos de Servicio de YouTube y las leyes de tu país.",
};
