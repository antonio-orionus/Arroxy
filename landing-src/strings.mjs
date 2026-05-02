// Landing-page translations. One object per locale; every locale must
// define every key (build.mjs validates parity at build time).
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const en = {
  title: "Arroxy — Free Open-Source YouTube Downloader",
  description:
    "Download YouTube videos in 4K, 1080p60 and HDR. Free, ad-free, no login, no cookies, 100% private. Windows, macOS, Linux.",
  og_title: "Arroxy — Free Open-Source YouTube Downloader",
  og_description:
    "4K · 1080p60 · HDR · Shorts. No ads. No tracking. No cookies. No login.",

  nav_features: "Features",
  nav_screenshots: "Screenshots",
  nav_install: "Install",
  nav_download: "Download",

  hero_eyebrow: "Modern · Free · Open Source",
  hero_h1_a: "Download YouTube videos",
  hero_h1_b: "in full quality.",
  hero_tagline:
    "Anything YouTube serves — 4K, 1080p60, HDR, Shorts — straight to your disk.",
  pill_no_ads: "No ads",
  pill_no_tracking: "No tracking",
  pill_no_login: "No login",
  pill_no_cookies: "No cookies",
  pill_mit: "MIT licensed",
  cta_download_os: "Download for your OS",
  cta_view_github: "View on GitHub",
  release_label: "Latest release:",
  release_loading: "loading…",

  features_eyebrow: "What it does",
  features_h2: "Everything you'd expect, none of the friction.",
  features_sub: "Paste a URL, pick a quality, click download. That's it.",
  f1_h: "Up to 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — every resolution YouTube offers, plus audio-only MP3, AAC, and Opus.",
  f2_h: "60 fps & HDR preserved",
  f2_p: "High frame-rate and HDR streams come through exactly as YouTube encodes them — no quality loss.",
  f3_h: "Multiple at once",
  f3_p: "Queue as many videos as you want. The download panel tracks progress for each in parallel.",
  f4_h: "Auto-updates",
  f4_p: "Arroxy keeps yt-dlp and ffmpeg fresh under the hood — works through every YouTube change.",
  f5_h: "9 languages",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — auto-detects yours.",
  f6_h: "Cross-platform",
  f6_p: "Native builds for Windows, macOS, and Linux — installer, portable, DMG, or AppImage.",
  f7_h: "Subtitles, your way",
  f7_p: "Manual or auto-generated captions in SRT, VTT, or ASS — saved beside the video, embedded into a portable .mkv, or tucked into a Subtitles/ folder.",
  f8_h: "SponsorBlock built in",
  f8_p: "Skip or mark sponsor segments, intros, outros, self-promos, and more — cut them with FFmpeg or just add chapters. Your call, per category.",
  f9_h: "Clipboard auto-fill",
  f9_p: "Copy a YouTube link anywhere and Arroxy detects it the moment you switch back — a confirm prompt keeps you in control. Enable or disable in Advanced settings.",

  shots_eyebrow: "See it in action",
  shots_h2: "Built for clarity, not clutter.",
  shot1_alt: "Paste a URL",
  shot2_alt: "Pick your quality",
  shot3_alt: "Choose where to save",
  shot4_alt: "Parallel downloads",
  shot5_alt: "Subtitles step — pick languages, format, and save mode",
  og_image_alt: "Arroxy app icon — desktop app for downloading YouTube videos in 4K.",

  privacy_eyebrow: "Privacy",
  privacy_h2_html: "What Arroxy <em>doesn't</em> do.",
  privacy_sub:
    "Most YouTube downloaders eventually ask for your cookies. Arroxy never will.",
  p1_h: "No login",
  p1_p: "No Google account. No sessions to expire. Zero risk of your account getting flagged.",
  p2_h: "No cookies",
  p2_p: "Arroxy requests the same tokens any browser does. Nothing exported, nothing stored.",
  p3_h: "No telemetry",
  p3_p: "Zero analytics. Your downloads, history, and files stay on your device — full stop.",
  p4_h: "No third-party servers",
  p4_p: "The whole pipeline runs locally via yt-dlp + ffmpeg. Files never touch a remote server.",

  install_eyebrow: "Install",
  install_h2: "Pick your channel.",
  install_sub:
    "Direct download or any major package manager — all auto-updated each release.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "All",
  winget_desc: "Recommended for Windows 10/11. Auto-updates with the system.",
  scoop_desc: "Portable install via Scoop bucket. No admin rights needed.",
  brew_desc: "Tap the cask, install with one command. Universal binary (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Sandboxed install. Download the .flatpak bundle from Releases, install with one command. No Flathub setup needed.",
  direct_h: "Direct download",
  direct_desc: "NSIS installer, portable .exe, .dmg, .AppImage, or .flatpak — straight from GitHub Releases.",
  direct_btn: "Open Releases →",
  copy_label: "Copy",
  copied_label: "Copied!",

  footer_made_by: "MIT Licensed · Made with care by",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Language:",

  faq_eyebrow: "FAQ",
  faq_h2: "Frequently asked questions",
  faq_q1: "What video qualities can I download?",
  faq_a1:
    "Anything YouTube offers — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p, and audio-only. High frame-rate streams (60 fps, 120 fps) and HDR content are preserved as-is. Arroxy shows you every available format and lets you choose exactly what to grab.",
  faq_q2: "Is it really free?",
  faq_a2: "Yes. MIT licensed. No premium tier, no feature gating.",
  faq_q3: "What languages is Arroxy available in?",
  faq_a3:
    "Nine, out of the box: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), and हिन्दी (Hindi). Arroxy auto-detects your operating system's language on first launch and you can switch at any time from the language picker in the toolbar. Translations live as plain TypeScript objects in src/shared/i18n/locales/ — open a PR on GitHub to contribute.",
  faq_q4: "Do I need to install anything?",
  faq_a4:
    "No. yt-dlp and ffmpeg are downloaded automatically on first launch from their official GitHub releases and cached on your machine. After that, no extra setup is needed.",
  faq_q5: "Will it keep working if YouTube changes something?",
  faq_a5:
    "Yes — and Arroxy has two layers of resilience. First, yt-dlp is one of the most actively maintained open-source tools around — it updates within hours of YouTube changes. Second, Arroxy doesn't rely on cookies or your Google account at all, so there's no session to expire and no credentials to rotate. That combination makes it significantly more stable than tools that depend on exported browser cookies.",
  faq_q6: "Can I download playlists?",
  faq_a6:
    "Single videos are supported today. Playlist and channel support is on the roadmap.",
  faq_q7: "Does it need my YouTube account or cookies?",
  faq_a7:
    "No — and that's a bigger deal than it sounds. Most tools that stop working after a YouTube update tell you to export your browser's YouTube cookies. That workaround breaks every ~30 minutes as YouTube rotates sessions, and yt-dlp's own docs warn it can get your Google account flagged. Arroxy never uses cookies or credentials. No login. No account linked. Nothing to expire, nothing to ban.",
  faq_q8:
    'macOS says "the app is damaged" or "cannot be opened" — what do I do?',
  faq_a8:
    "This is macOS Gatekeeper blocking an unsigned app — not actual damage. The README has step-by-step instructions for the first-time launch on macOS.",
  faq_q9: "Is this legal?",
  faq_a9:
    "Downloading videos for personal use is generally accepted in most jurisdictions. You are responsible for complying with YouTube's Terms of Service and your local laws.",
};

export const es = {
  title: "Arroxy — Descargador de YouTube gratuito y de código abierto",
  description:
    "Descarga videos de YouTube en 4K, 1080p60 y HDR. Gratis, sin anuncios, sin inicio de sesión, sin cookies, 100% privado. Windows, macOS, Linux.",
  og_title: "Arroxy — Descargador de YouTube gratuito y de código abierto",
  og_description:
    "4K · 1080p60 · HDR · Shorts. Sin anuncios. Sin rastreo. Sin cookies. Sin inicio de sesión.",

  nav_features: "Funciones",
  nav_screenshots: "Capturas",
  nav_install: "Instalar",
  nav_download: "Descargar",

  hero_eyebrow: "Moderno · Gratis · Código abierto",
  hero_h1_a: "Descarga videos de YouTube",
  hero_h1_b: "en calidad completa.",
  hero_tagline:
    "Todo lo que YouTube ofrece — 4K, 1080p60, HDR, Shorts — directo a tu disco.",
  pill_no_ads: "Sin anuncios",
  pill_no_tracking: "Sin rastreo",
  pill_no_login: "Sin inicio de sesión",
  pill_no_cookies: "Sin cookies",
  pill_mit: "Licencia MIT",
  cta_download_os: "Descargar para tu SO",
  cta_view_github: "Ver en GitHub",
  release_label: "Última versión:",
  release_loading: "cargando…",

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
  p3_h: "Sin telemetría",
  p3_p: "Cero analítica. Tus descargas, historial y archivos se quedan en tu dispositivo — punto final.",
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

export const de = {
  title: "Arroxy — Kostenloser Open-Source YouTube-Downloader",
  description:
    "Lade YouTube-Videos in 4K, 1080p60 und HDR herunter. Kostenlos, werbefrei, kein Login, keine Cookies, 100% privat. Windows, macOS, Linux.",
  og_title: "Arroxy — Kostenloser Open-Source YouTube-Downloader",
  og_description:
    "4K · 1080p60 · HDR · Shorts. Keine Werbung. Kein Tracking. Keine Cookies. Kein Login.",

  nav_features: "Funktionen",
  nav_screenshots: "Screenshots",
  nav_install: "Installation",
  nav_download: "Download",

  hero_eyebrow: "Modern · Kostenlos · Open Source",
  hero_h1_a: "Lade YouTube-Videos",
  hero_h1_b: "in voller Qualität.",
  hero_tagline:
    "Alles, was YouTube anbietet — 4K, 1080p60, HDR, Shorts — direkt auf deine Festplatte.",
  pill_no_ads: "Keine Werbung",
  pill_no_tracking: "Kein Tracking",
  pill_no_login: "Kein Login",
  pill_no_cookies: "Keine Cookies",
  pill_mit: "MIT-Lizenz",
  cta_download_os: "Für dein Betriebssystem herunterladen",
  cta_view_github: "Auf GitHub ansehen",
  release_label: "Neueste Version:",
  release_loading: "wird geladen…",

  features_eyebrow: "Was es kann",
  features_h2: "Alles, was du erwartest — ganz ohne Reibung.",
  features_sub: "URL einfügen, Qualität wählen, Download klicken. Mehr nicht.",
  f1_h: "Bis zu 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — jede Auflösung, die YouTube bietet, plus Audio-only MP3, AAC und Opus.",
  f2_h: "60 fps & HDR erhalten",
  f2_p: "High-Framerate- und HDR-Streams kommen genau so durch, wie YouTube sie kodiert — ohne Qualitätsverlust.",
  f3_h: "Mehrere gleichzeitig",
  f3_p: "Reihe so viele Videos in die Warteschlange ein, wie du willst. Das Download-Panel verfolgt jeden Fortschritt parallel.",
  f4_h: "Auto-Updates",
  f4_p: "Arroxy hält yt-dlp und ffmpeg im Hintergrund aktuell — funktioniert nach jeder YouTube-Änderung.",
  f5_h: "9 Sprachen",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — erkennt deine automatisch.",
  f6_h: "Plattformübergreifend",
  f6_p: "Native Builds für Windows, macOS und Linux — Installer, Portable, DMG oder AppImage.",
  f7_h: "Untertitel, wie du willst",
  f7_p: "Manuelle oder automatisch generierte Untertitel in SRT, VTT oder ASS — neben dem Video gespeichert, in eine portable .mkv eingebettet oder in einen Subtitles/-Ordner sortiert.",
  f8_h: "SponsorBlock integriert",
  f8_p: "Überspringe oder markiere Sponsor-Segmente, Intros, Outros, Eigenwerbung und mehr — schneide sie mit FFmpeg heraus oder füge einfach Kapitel hinzu. Deine Wahl, pro Kategorie.",
  f9_h: "Automatisches Ausfüllen aus Zwischenablage",
  f9_p: "Kopiere einen YouTube-Link irgendwo und Arroxy erkennt ihn beim nächsten Wechsel zur App — ein Bestätigungsdialog hält dich in Kontrolle. In den Erweiterten Einstellungen ein- oder ausschalten.",

  shots_eyebrow: "In Aktion sehen",
  shots_h2: "Gebaut für Klarheit, nicht für Chaos.",
  shot1_alt: "URL einfügen",
  shot2_alt: "Qualität wählen",
  shot3_alt: "Speicherort wählen",
  shot4_alt: "Parallele Downloads",
  shot5_alt: "Untertitel-Schritt — Sprachen, Format und Speichermodus wählen",
  og_image_alt: "Arroxy App-Icon — Desktop-App zum Herunterladen von YouTube-Videos in 4K.",

  privacy_eyebrow: "Privatsphäre",
  privacy_h2_html: "Was Arroxy <em>nicht</em> tut.",
  privacy_sub:
    "Die meisten YouTube-Downloader fragen irgendwann nach deinen Cookies. Arroxy niemals.",
  p1_h: "Kein Login",
  p1_p: "Kein Google-Konto. Keine ablaufenden Sitzungen. Null Risiko, dass dein Konto markiert wird.",
  p2_h: "Keine Cookies",
  p2_p: "Arroxy fordert dieselben Tokens an wie jeder Browser. Nichts exportiert, nichts gespeichert.",
  p3_h: "Keine Telemetrie",
  p3_p: "Null Analytics. Deine Downloads, Verlauf und Dateien bleiben auf deinem Gerät — Punkt.",
  p4_h: "Keine Drittanbieter-Server",
  p4_p: "Die ganze Pipeline läuft lokal über yt-dlp + ffmpeg. Dateien berühren nie einen Remote-Server.",

  install_eyebrow: "Installation",
  install_h2: "Wähle deinen Kanal.",
  install_sub:
    "Direkter Download oder ein gängiger Paketmanager — alle aktualisieren sich automatisch mit jedem Release.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Alle",
  winget_desc: "Empfohlen für Windows 10/11. Aktualisiert sich mit dem System.",
  scoop_desc: "Portable Installation via Scoop-Bucket. Keine Admin-Rechte nötig.",
  brew_desc: "Cask hinzufügen, mit einem Befehl installieren. Universal Binary (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Sandboxed Installation. Lade das .flatpak-Bundle aus den Releases und installier es mit einem Befehl. Kein Flathub-Setup nötig.",
  direct_h: "Direkter Download",
  direct_desc: "NSIS-Installer, portable .exe, .dmg, .AppImage oder .flatpak — direkt von GitHub Releases.",
  direct_btn: "Releases öffnen →",
  copy_label: "Kopieren",
  copied_label: "Kopiert!",

  footer_made_by: "MIT-Lizenz · Mit Sorgfalt gemacht von",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Sprache:",

  faq_eyebrow: "FAQ",
  faq_h2: "Häufig gestellte Fragen",
  faq_q1: "Welche Videoqualitäten kann ich herunterladen?",
  faq_a1:
    "Alles, was YouTube anbietet — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p und nur Audio. Hochbildraten-Streams (60 fps, 120 fps) und HDR-Inhalte werden unverändert übernommen. Arroxy zeigt dir jedes verfügbare Format und lässt dich exakt auswählen.",
  faq_q2: "Ist es wirklich kostenlos?",
  faq_a2:
    "Ja. MIT-Lizenz. Keine Premium-Stufe, keine versteckten Funktionsbarrieren.",
  faq_q3: "In welchen Sprachen ist Arroxy verfügbar?",
  faq_a3:
    "Neun, direkt out of the box: English, Español (Spanisch), Deutsch, Français (Französisch), 日本語 (Japanisch), 中文 (Chinesisch), Русский (Russisch), Українська (Ukrainisch) und हिन्दी (Hindi). Arroxy erkennt deine Betriebssystem-Sprache beim ersten Start und du kannst jederzeit über die Sprachauswahl in der Symbolleiste wechseln. Übersetzungen liegen als einfache TypeScript-Objekte in src/shared/i18n/locales/ — öffne einen PR auf GitHub, um beizutragen.",
  faq_q4: "Muss ich etwas installieren?",
  faq_a4:
    "Nein. yt-dlp und ffmpeg werden beim ersten Start automatisch von ihren offiziellen GitHub-Releases heruntergeladen und auf deinem Rechner gecacht. Danach ist keine weitere Einrichtung nötig.",
  faq_q5: "Funktioniert es weiter, wenn YouTube etwas ändert?",
  faq_a5:
    "Ja — und Arroxy hat zwei Resilienzschichten. Erstens: yt-dlp ist eines der am aktivsten gepflegten Open-Source-Tools überhaupt — es wird innerhalb von Stunden nach YouTube-Änderungen aktualisiert. Zweitens: Arroxy verlässt sich überhaupt nicht auf Cookies oder dein Google-Konto, also gibt's keine Session, die abläuft, und keine Anmeldedaten, die rotiert werden müssen. Diese Kombination macht es deutlich stabiler als Tools, die auf exportierte Browser-Cookies angewiesen sind.",
  faq_q6: "Kann ich Playlists herunterladen?",
  faq_a6:
    "Aktuell werden nur einzelne Videos unterstützt. Playlist- und Kanal-Support ist auf der Roadmap.",
  faq_q7: "Braucht es mein YouTube-Konto oder Cookies?",
  faq_a7:
    "Nein — und das ist wichtiger, als es klingt. Die meisten Tools, die nach einem YouTube-Update aufhören zu funktionieren, weisen dich an, deine Browser-Cookies zu exportieren. Dieser Workaround bricht alle ~30 Minuten zusammen, wenn YouTube Sessions rotiert, und yt-dlps eigene Doku warnt, dass das dein Google-Konto markieren kann. Arroxy nutzt nie Cookies oder Anmeldedaten. Kein Login. Kein verknüpftes Konto. Nichts läuft ab, nichts wird gesperrt.",
  faq_q8:
    'macOS sagt „die App ist beschädigt" oder „kann nicht geöffnet werden" — was tun?',
  faq_a8:
    "Das ist macOS Gatekeeper, der eine unsignierte App blockiert — nicht echte Beschädigung. Eine Schritt-für-Schritt-Anleitung zum Erststart unter macOS findest du im README.",
  faq_q9: "Ist das legal?",
  faq_a9:
    "Das Herunterladen von Videos zur persönlichen Nutzung ist in den meisten Rechtsordnungen allgemein akzeptiert. Du bist verantwortlich, die YouTube-AGB und deine lokalen Gesetze einzuhalten.",
};

export const fr = {
  title: "Arroxy — Téléchargeur YouTube gratuit et open source",
  description:
    "Téléchargez des vidéos YouTube en 4K, 1080p60 et HDR. Gratuit, sans pub, sans connexion, sans cookies, 100% privé. Windows, macOS, Linux.",
  og_title: "Arroxy — Téléchargeur YouTube gratuit et open source",
  og_description:
    "4K · 1080p60 · HDR · Shorts. Sans pub. Sans pistage. Sans cookies. Sans connexion.",

  nav_features: "Fonctionnalités",
  nav_screenshots: "Captures",
  nav_install: "Installer",
  nav_download: "Télécharger",

  hero_eyebrow: "Moderne · Gratuit · Open Source",
  hero_h1_a: "Téléchargez les vidéos YouTube",
  hero_h1_b: "en pleine qualité.",
  hero_tagline:
    "Tout ce que YouTube propose — 4K, 1080p60, HDR, Shorts — directement sur votre disque.",
  pill_no_ads: "Sans pub",
  pill_no_tracking: "Sans pistage",
  pill_no_login: "Sans connexion",
  pill_no_cookies: "Sans cookies",
  pill_mit: "Licence MIT",
  cta_download_os: "Télécharger pour votre OS",
  cta_view_github: "Voir sur GitHub",
  release_label: "Dernière version :",
  release_loading: "chargement…",

  features_eyebrow: "Ce qu'il fait",
  features_h2: "Tout ce que vous attendez, sans la moindre friction.",
  features_sub: "Collez une URL, choisissez une qualité, cliquez sur télécharger. C'est tout.",
  f1_h: "Jusqu'à 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — toutes les résolutions proposées par YouTube, plus l'audio seul en MP3, AAC et Opus.",
  f2_h: "60 fps et HDR préservés",
  f2_p: "Les flux haute fréquence d'images et HDR passent exactement comme YouTube les encode — sans perte de qualité.",
  f3_h: "Plusieurs à la fois",
  f3_p: "Mettez autant de vidéos que vous voulez en file d'attente. Le panneau suit la progression de chacune en parallèle.",
  f4_h: "Mises à jour automatiques",
  f4_p: "Arroxy garde yt-dlp et ffmpeg à jour en coulisse — résiste à chaque changement de YouTube.",
  f5_h: "9 langues",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — détecte la vôtre automatiquement.",
  f6_h: "Multiplateforme",
  f6_p: "Builds natifs pour Windows, macOS et Linux — installeur, portable, DMG ou AppImage.",
  f7_h: "Sous-titres comme tu veux",
  f7_p: "Sous-titres manuels ou auto-générés en SRT, VTT ou ASS — à côté de la vidéo, intégrés dans un .mkv portable, ou rangés dans un dossier Subtitles/.",
  f8_h: "SponsorBlock intégré",
  f8_p: "Passe ou marque les segments sponsors, intros, outros, autopromos et plus — coupe-les avec FFmpeg ou ajoute simplement des chapitres. Ton choix, par catégorie.",
  f9_h: "Auto-remplissage presse-papiers",
  f9_p: "Copiez un lien YouTube n'importe où et Arroxy le détecte dès que vous revenez à l'app — une invite de confirmation garde le contrôle. Activez ou désactivez dans Paramètres avancés.",

  shots_eyebrow: "Voyez-le en action",
  shots_h2: "Conçu pour la clarté, pas l'encombrement.",
  shot1_alt: "Coller une URL",
  shot2_alt: "Choisir la qualité",
  shot3_alt: "Choisir où enregistrer",
  shot4_alt: "Téléchargements parallèles",
  shot5_alt: "Étape sous-titres — choisir langues, format et mode d'enregistrement",
  og_image_alt: "Icône de l'app Arroxy — application bureau pour télécharger des vidéos YouTube en 4K.",

  privacy_eyebrow: "Confidentialité",
  privacy_h2_html: "Ce qu'Arroxy <em>ne fait pas</em>.",
  privacy_sub:
    "La plupart des téléchargeurs YouTube finissent par demander vos cookies. Arroxy ne le fera jamais.",
  p1_h: "Sans connexion",
  p1_p: "Aucun compte Google. Aucune session à expirer. Zéro risque que votre compte soit signalé.",
  p2_h: "Sans cookies",
  p2_p: "Arroxy demande les mêmes tokens que n'importe quel navigateur. Rien n'est exporté, rien n'est stocké.",
  p3_h: "Sans télémétrie",
  p3_p: "Zéro analytique. Vos téléchargements, historique et fichiers restent sur votre appareil — point final.",
  p4_h: "Sans serveurs tiers",
  p4_p: "Tout le pipeline tourne en local via yt-dlp + ffmpeg. Les fichiers ne touchent jamais un serveur distant.",

  install_eyebrow: "Installer",
  install_h2: "Choisissez votre canal.",
  install_sub:
    "Téléchargement direct ou tout gestionnaire de paquets majeur — tous mis à jour automatiquement à chaque release.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Tous",
  winget_desc: "Recommandé pour Windows 10/11. Se met à jour avec le système.",
  scoop_desc: "Installation portable via le bucket Scoop. Aucun droit admin requis.",
  brew_desc: "Tap le cask, installation en une commande. Binaire universel (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Installation en sandbox. Télécharge le bundle .flatpak depuis les Releases, installe-le en une commande. Pas de configuration Flathub nécessaire.",
  direct_h: "Téléchargement direct",
  direct_desc: "Installeur NSIS, .exe portable, .dmg, .AppImage ou .flatpak — directement depuis GitHub Releases.",
  direct_btn: "Ouvrir les Releases →",
  copy_label: "Copier",
  copied_label: "Copié !",

  footer_made_by: "Licence MIT · Fait avec soin par",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Langue :",

  faq_eyebrow: "FAQ",
  faq_h2: "Questions fréquentes",
  faq_q1: "Quelles qualités de vidéo puis-je télécharger ?",
  faq_a1:
    "Tout ce que YouTube propose — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p et audio seul. Les flux haut framerate (60 fps, 120 fps) et HDR sont préservés tels quels. Arroxy te montre tous les formats disponibles et te laisse choisir précisément ce que tu veux récupérer.",
  faq_q2: "C'est vraiment gratuit ?",
  faq_a2:
    "Oui. Licence MIT. Pas de version premium, pas de fonctions verrouillées.",
  faq_q3: "Dans quelles langues Arroxy est-il disponible ?",
  faq_a3:
    "Neuf, prêtes à l'emploi : English, Español (espagnol), Deutsch (allemand), Français, 日本語 (japonais), 中文 (chinois), Русский (russe), Українська (ukrainien) et हिन्दी (hindi). Arroxy détecte la langue de ton système d'exploitation au premier lancement et tu peux changer à tout moment depuis le sélecteur de langue dans la barre d'outils. Les traductions sont de simples objets TypeScript dans src/shared/i18n/locales/ — ouvre une PR sur GitHub pour contribuer.",
  faq_q4: "Faut-il installer quelque chose ?",
  faq_a4:
    "Non. yt-dlp et ffmpeg sont téléchargés automatiquement au premier lancement depuis leurs releases officielles GitHub et mis en cache sur ta machine. Après ça, aucune configuration supplémentaire.",
  faq_q5:
    "Est-ce que ça continuera de marcher si YouTube change quelque chose ?",
  faq_a5:
    "Oui — et Arroxy a deux couches de résilience. Premièrement, yt-dlp est l'un des outils open source les plus activement maintenus — il est mis à jour dans les heures qui suivent les changements YouTube. Deuxièmement, Arroxy ne dépend pas du tout des cookies ni de ton compte Google, donc aucune session n'expire et aucun identifiant à renouveler. Cette combinaison le rend bien plus stable que les outils dépendant de cookies de navigateur exportés.",
  faq_q6: "Puis-je télécharger des playlists ?",
  faq_a6:
    "Aujourd'hui, seules les vidéos individuelles sont supportées. Le support des playlists et des chaînes est sur la feuille de route.",
  faq_q7: "A-t-il besoin de mon compte YouTube ou de cookies ?",
  faq_a7:
    "Non — et c'est plus important qu'il n'y paraît. La plupart des outils qui cessent de fonctionner après une mise à jour de YouTube te disent d'exporter les cookies YouTube de ton navigateur. Ce contournement casse toutes les ~30 minutes quand YouTube renouvelle les sessions, et la doc de yt-dlp prévient que ça peut faire signaler ton compte Google. Arroxy n'utilise jamais de cookies ni d'identifiants. Pas de login. Pas de compte lié. Rien à expirer, rien à bannir.",
  faq_q8:
    'macOS dit « l\'application est endommagée » ou « ne peut pas être ouverte » — que faire ?',
  faq_a8:
    "C'est Gatekeeper de macOS qui bloque une app non signée — pas un vrai dommage. Le README contient la marche à suivre pour le premier lancement sur macOS.",
  faq_q9: "C'est légal ?",
  faq_a9:
    "Télécharger des vidéos pour un usage personnel est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les Conditions d'Utilisation de YouTube et les lois de ton pays.",
};

export const ja = {
  title: "Arroxy — 無料・オープンソースの YouTube ダウンローダー",
  description:
    "YouTube 動画を 4K、1080p60、HDR でダウンロード。無料、広告なし、ログイン不要、Cookie 不要、100% プライベート。Windows、macOS、Linux 対応。",
  og_title: "Arroxy — 無料・オープンソースの YouTube ダウンローダー",
  og_description:
    "4K · 1080p60 · HDR · Shorts。広告なし。トラッキングなし。Cookie なし。ログイン不要。",

  nav_features: "機能",
  nav_screenshots: "スクリーンショット",
  nav_install: "インストール",
  nav_download: "ダウンロード",

  hero_eyebrow: "モダン · 無料 · オープンソース",
  hero_h1_a: "YouTube 動画を",
  hero_h1_b: "フル画質でダウンロード。",
  hero_tagline:
    "YouTube が配信するすべて — 4K、1080p60、HDR、Shorts — そのままディスクへ。",
  pill_no_ads: "広告なし",
  pill_no_tracking: "トラッキングなし",
  pill_no_login: "ログイン不要",
  pill_no_cookies: "Cookie 不要",
  pill_mit: "MIT ライセンス",
  cta_download_os: "あなたの OS 向けにダウンロード",
  cta_view_github: "GitHub で見る",
  release_label: "最新リリース:",
  release_loading: "読み込み中…",

  features_eyebrow: "できること",
  features_h2: "期待されることはすべて、面倒は一切なく。",
  features_sub: "URL を貼り付けて、画質を選んで、ダウンロードをクリック。それだけ。",
  f1_h: "最大 4K UHD",
  f1_p: "2160p、1440p、1080p、720p — YouTube が提供するあらゆる解像度に加え、MP3、AAC、Opus の音声のみも対応。",
  f2_h: "60 fps と HDR を維持",
  f2_p: "高フレームレートと HDR ストリームは YouTube がエンコードしたまま — 画質劣化なし。",
  f3_h: "複数同時に",
  f3_p: "好きなだけ動画をキューに追加できます。ダウンロードパネルが各進捗を並行して表示。",
  f4_h: "自動アップデート",
  f4_p: "Arroxy は yt-dlp と ffmpeg を裏で常に最新に保ちます — YouTube の変更にも対応。",
  f5_h: "9 言語対応",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — あなたの言語を自動検出。",
  f6_h: "マルチプラットフォーム",
  f6_p: "Windows、macOS、Linux のネイティブビルド — インストーラー、ポータブル、DMG、AppImage。",
  f7_h: "字幕は思いのままに",
  f7_p: "手動または自動生成の字幕を SRT、VTT、ASS で取得 — 動画と並べて保存、ポータブルな .mkv に埋め込み、または Subtitles/ フォルダに整理。",
  f8_h: "SponsorBlock 内蔵",
  f8_p: "スポンサー、イントロ、アウトロ、自己宣伝などをスキップまたはマーク — FFmpeg でカットするか章として追加するか。カテゴリごとにあなたが決める。",
  f9_h: "クリップボード自動入力",
  f9_p: "YouTube リンクをどこかでコピーするだけで、アプリに戻った瞬間 Arroxy が検出します — 確認プロンプトで常に制御を維持。詳細設定で有効・無効を切り替え。",

  shots_eyebrow: "実際の動作",
  shots_h2: "明快さのために設計、雑然さは排除。",
  shot1_alt: "URL を貼り付け",
  shot2_alt: "画質を選択",
  shot3_alt: "保存先を選択",
  shot4_alt: "並行ダウンロード",
  shot5_alt: "字幕ステップ — 言語・フォーマット・保存モードを選ぶ",
  og_image_alt: "Arroxy アプリアイコン — YouTube 動画を 4K でダウンロードするデスクトップアプリ。",

  privacy_eyebrow: "プライバシー",
  privacy_h2_html: "Arroxy が<em>しない</em>こと。",
  privacy_sub:
    "ほとんどの YouTube ダウンローダーは、いずれ Cookie を要求します。Arroxy は決して要求しません。",
  p1_h: "ログイン不要",
  p1_p: "Google アカウント不要。期限切れのセッションもなし。アカウントが警告される心配ゼロ。",
  p2_h: "Cookie 不要",
  p2_p: "Arroxy はブラウザと同じトークンを要求するだけ。何もエクスポートせず、何も保存しません。",
  p3_h: "テレメトリーなし",
  p3_p: "アナリティクス一切なし。ダウンロード、履歴、ファイルはすべてあなたのデバイス内に留まります。",
  p4_h: "サードパーティサーバーなし",
  p4_p: "全パイプラインが yt-dlp + ffmpeg でローカル実行。ファイルがリモートサーバーに触れることはありません。",

  install_eyebrow: "インストール",
  install_h2: "チャンネルを選んでください。",
  install_sub:
    "直接ダウンロード、または主要パッケージマネージャー経由 — すべてリリースごとに自動更新。",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "全 OS",
  winget_desc: "Windows 10/11 推奨。システムと一緒に自動更新。",
  scoop_desc: "Scoop バケット経由のポータブルインストール。管理者権限不要。",
  brew_desc: "Cask を tap してワンコマンドでインストール。ユニバーサルバイナリ (Intel + Apple Silicon)。",
  flatpak_h: "Flatpak",
  flatpak_desc: "サンドボックスでインストール。Releases から .flatpak バンドルをダウンロードし、ワンコマンドでインストール。Flathub のセットアップは不要。",
  direct_h: "直接ダウンロード",
  direct_desc: "NSIS インストーラー、ポータブル .exe、.dmg、.AppImage、.flatpak — GitHub Releases から直接。",
  direct_btn: "Releases を開く →",
  copy_label: "コピー",
  copied_label: "コピーしました！",

  footer_made_by: "MIT ライセンス · 作者:",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "言語:",

  faq_eyebrow: "FAQ",
  faq_h2: "よくある質問",
  faq_q1: "どの画質でダウンロードできますか？",
  faq_a1:
    "YouTube が提供するすべて — 4K UHD（2160p）、1440p QHD、1080p Full HD、720p、480p、360p、音声のみ。ハイフレームレート（60 fps、120 fps）と HDR コンテンツはそのまま保存されます。Arroxy は利用可能な全フォーマットを表示し、ピンポイントで選ばせてくれます。",
  faq_q2: "本当に無料ですか？",
  faq_a2: "はい。MIT ライセンス。プレミアム版や機能ロックはありません。",
  faq_q3: "Arroxy は何カ国語に対応していますか？",
  faq_a3:
    "9 言語に標準対応：English、Español（スペイン語）、Deutsch（ドイツ語）、Français（フランス語）、日本語、中文（中国語）、Русский（ロシア語）、Українська（ウクライナ語）、हिन्दी（ヒンディー語）。Arroxy は初回起動時に OS の言語を自動検出し、ツールバーの言語選択でいつでも切り替え可能です。翻訳は src/shared/i18n/locales/ 内の素の TypeScript オブジェクトとして管理されているので、GitHub で PR を開いて貢献できます。",
  faq_q4: "何かインストールが必要ですか？",
  faq_a4:
    "いいえ。yt-dlp と ffmpeg は初回起動時に公式 GitHub releases から自動ダウンロードされ、マシンにキャッシュされます。それ以降は追加のセットアップ不要。",
  faq_q5: "YouTube が変更したら使えなくなりますか？",
  faq_a5:
    "いいえ — Arroxy には 2 段階の耐性があります。第一に、yt-dlp はオープンソースで最も活発に保守されているツールの 1 つで、YouTube の変更から数時間以内に更新されます。第二に、Arroxy は Cookie や Google アカウントに一切依存しないため、失効するセッションも、ローテートする資格情報もありません。この組み合わせにより、ブラウザの Cookie に依存するツールよりも遥かに安定しています。",
  faq_q6: "プレイリストはダウンロードできますか？",
  faq_a6:
    "現在は単一動画のみサポート。プレイリストとチャンネルのサポートはロードマップ上にあります。",
  faq_q7: "YouTube アカウントや Cookie が必要ですか？",
  faq_a7:
    "いいえ — そしてこれは思っているより重要なポイントです。YouTube の更新後に動かなくなるツールの大半は、ブラウザの YouTube Cookie のエクスポートを指示してきます。その回避策は YouTube がセッションをローテーションする約 30 分ごとに壊れますし、yt-dlp の公式ドキュメントもそれが Google アカウントのフラグ立てにつながると警告しています。Arroxy は Cookie も資格情報も一切使いません。ログインなし、アカウント連携なし、失効するものも、BAN されるものもありません。",
  faq_q8:
    'macOS で「アプリが壊れている」「開けません」と表示される — どうすれば？',
  faq_a8:
    "これは macOS Gatekeeper が未署名アプリをブロックしているもので、実際に壊れているわけではありません。README に macOS 初回起動のステップごとの手順があります。",
  faq_q9: "これは合法ですか？",
  faq_a9:
    "個人使用のための動画ダウンロードは、ほとんどの法域で一般的に容認されています。YouTube の利用規約および所在地の法律の遵守はあなたの責任です。",
};

export const zh = {
  title: "Arroxy — 免费开源的 YouTube 下载器",
  description:
    "以 4K、1080p60 和 HDR 下载 YouTube 视频。免费、无广告、无需登录、无需 Cookie、100% 私密。支持 Windows、macOS、Linux。",
  og_title: "Arroxy — 免费开源的 YouTube 下载器",
  og_description:
    "4K · 1080p60 · HDR · Shorts。无广告。无追踪。无 Cookie。无需登录。",

  nav_features: "功能",
  nav_screenshots: "截图",
  nav_install: "安装",
  nav_download: "下载",

  hero_eyebrow: "现代 · 免费 · 开源",
  hero_h1_a: "下载 YouTube 视频",
  hero_h1_b: "完整原画质。",
  hero_tagline:
    "YouTube 提供的一切 — 4K、1080p60、HDR、Shorts — 直接保存到你的磁盘。",
  pill_no_ads: "无广告",
  pill_no_tracking: "无追踪",
  pill_no_login: "无需登录",
  pill_no_cookies: "无 Cookie",
  pill_mit: "MIT 许可证",
  cta_download_os: "下载适合你系统的版本",
  cta_view_github: "在 GitHub 上查看",
  release_label: "最新版本:",
  release_loading: "加载中…",

  features_eyebrow: "它能做什么",
  features_h2: "一切如你所愿，毫无阻碍。",
  features_sub: "粘贴 URL，选择画质，点击下载。就这么简单。",
  f1_h: "高达 4K UHD",
  f1_p: "2160p、1440p、1080p、720p — YouTube 提供的每一种分辨率，外加 MP3、AAC、Opus 纯音频。",
  f2_h: "保留 60 fps 与 HDR",
  f2_p: "高帧率与 HDR 流原样直通，正如 YouTube 编码的那样 — 零画质损失。",
  f3_h: "多任务并行",
  f3_p: "想排多少视频就排多少。下载面板并行显示每个任务的进度。",
  f4_h: "自动更新",
  f4_p: "Arroxy 在后台保持 yt-dlp 与 ffmpeg 最新 — 应对 YouTube 的每一次变化。",
  f5_h: "9 种语言",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — 自动检测你的语言。",
  f6_h: "跨平台",
  f6_p: "Windows、macOS、Linux 原生构建 — 安装包、便携版、DMG 或 AppImage。",
  f7_h: "字幕，随你所愿",
  f7_p: "以 SRT、VTT 或 ASS 获取手动或自动生成的字幕 — 保存到视频旁边、嵌入便携的 .mkv，或整理到 Subtitles/ 子文件夹。",
  f8_h: "内置 SponsorBlock",
  f8_p: "跳过或标记赞助商、片头、片尾、自我推广等片段 — 用 FFmpeg 剪除或直接添加章节。按类别自由选择。",
  f9_h: "剪贴板自动填写",
  f9_p: "在任何地方复制 YouTube 链接，切换回应用时 Arroxy 立即检测 — 确认提示让你保持控制。在高级设置中开启或关闭。",

  shots_eyebrow: "实际效果",
  shots_h2: "为清晰而生，拒绝杂乱。",
  shot1_alt: "粘贴 URL",
  shot2_alt: "选择画质",
  shot3_alt: "选择保存位置",
  shot4_alt: "并行下载",
  shot5_alt: "字幕步骤 — 选择语言、格式与保存方式",
  og_image_alt: "Arroxy 应用图标 — 用于以 4K 下载 YouTube 视频的桌面应用。",

  privacy_eyebrow: "隐私",
  privacy_h2_html: "Arroxy <em>不会</em>做什么。",
  privacy_sub:
    "大多数 YouTube 下载器迟早会向你索取 Cookie。Arroxy 永远不会。",
  p1_h: "无需登录",
  p1_p: "无需 Google 账号。没有会话过期问题。账号被标记的风险为零。",
  p2_h: "无 Cookie",
  p2_p: "Arroxy 请求的只是浏览器同样会请求的令牌。不导出，不保存。",
  p3_h: "无遥测",
  p3_p: "零分析。你的下载、历史和文件全部留在本地设备 — 就这样。",
  p4_h: "无第三方服务器",
  p4_p: "整个流程通过 yt-dlp + ffmpeg 在本地运行。文件永远不会经过远程服务器。",

  install_eyebrow: "安装",
  install_h2: "选择你的渠道。",
  install_sub:
    "直接下载或任意主流包管理器 — 每次发布都会自动更新。",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "全部",
  winget_desc: "推荐用于 Windows 10/11。随系统自动更新。",
  scoop_desc: "通过 Scoop bucket 便携安装。无需管理员权限。",
  brew_desc: "添加 cask，一行命令安装。通用二进制 (Intel + Apple Silicon)。",
  flatpak_h: "Flatpak",
  flatpak_desc: "沙箱安装。从 Releases 下载 .flatpak 包，一行命令安装。无需配置 Flathub。",
  direct_h: "直接下载",
  direct_desc: "NSIS 安装包、便携 .exe、.dmg、.AppImage 或 .flatpak — 直接从 GitHub Releases 获取。",
  direct_btn: "打开 Releases →",
  copy_label: "复制",
  copied_label: "已复制！",

  footer_made_by: "MIT 许可证 · 用心制作:",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "语言:",

  faq_eyebrow: "FAQ",
  faq_h2: "常见问题",
  faq_q1: "能下载哪些画质？",
  faq_a1:
    "YouTube 提供的都行 — 4K UHD（2160p）、1440p QHD、1080p Full HD、720p、480p、360p 以及纯音频。高帧率（60 fps、120 fps）和 HDR 内容原样保留。Arroxy 列出所有可用格式，让你精准挑选。",
  faq_q2: "真的免费吗？",
  faq_a2: "真的。MIT 许可证。没有付费版、没有功能门槛。",
  faq_q3: "Arroxy 支持哪些语言？",
  faq_a3:
    "开箱即用支持九种：English、Español（西班牙语）、Deutsch（德语）、Français（法语）、日本語（日语）、中文、Русский（俄语）、Українська（乌克兰语）、हिन्दी（印地语）。Arroxy 在首次启动时自动检测系统语言，随时可在工具栏的语言选择器中切换。翻译以纯 TypeScript 对象的形式存放在 src/shared/i18n/locales/ — 在 GitHub 上发个 PR 即可贡献。",
  faq_q4: "需要装别的东西吗？",
  faq_a4:
    "不需要。yt-dlp 和 ffmpeg 在首次启动时从它们的官方 GitHub releases 自动下载并缓存到本地。之后无需任何额外配置。",
  faq_q5: "如果 YouTube 改了什么，还能用吗？",
  faq_a5:
    "能 — Arroxy 有两层保障。第一，yt-dlp 是社区里最活跃维护的开源工具之一 — YouTube 一变，几小时内就更新。第二，Arroxy 完全不依赖 Cookie 或你的 Google 账号，所以没有会话过期，没有凭据要轮换。这两点结合让它比依赖浏览器导出 Cookie 的工具稳定得多。",
  faq_q6: "能下播放列表吗？",
  faq_a6: "目前支持单个视频。播放列表和频道支持在路线图里。",
  faq_q7: "需要我的 YouTube 账号或 Cookie 吗？",
  faq_a7:
    "不需要 — 这事比听起来更重要。大多数在 YouTube 更新后就罢工的工具会让你导出浏览器的 YouTube Cookie。这种方案每 30 分钟左右就坏一次（YouTube 会轮换会话），而 yt-dlp 自己的文档警告这可能让你的 Google 账号被标记。Arroxy 从不使用 Cookie 或凭据。无登录、无账号绑定，没东西过期，没东西被封。",
  faq_q8: 'macOS 提示 "应用已损坏" 或 "无法打开" — 怎么办？',
  faq_a8:
    "这是 macOS Gatekeeper 在拦截未签名应用 — 并不是真的损坏。README 里有 macOS 首次启动的分步指引。",
  faq_q9: "这合法吗？",
  faq_a9:
    "为个人使用下载视频，在大多数地区一般是被接受的。你需要自己负责遵守 YouTube 的服务条款和当地法律。",
};

export const ru = {
  title: "Arroxy — Бесплатный загрузчик YouTube с открытым кодом",
  description:
    "Скачивайте видео с YouTube в 4K, 1080p60 и HDR. Бесплатно, без рекламы, без входа, без cookies, 100% приватно. Windows, macOS, Linux.",
  og_title: "Arroxy — Бесплатный загрузчик YouTube с открытым кодом",
  og_description:
    "4K · 1080p60 · HDR · Shorts. Без рекламы. Без слежки. Без cookies. Без входа.",

  nav_features: "Возможности",
  nav_screenshots: "Скриншоты",
  nav_install: "Установка",
  nav_download: "Скачать",

  hero_eyebrow: "Современный · Бесплатный · Open Source",
  hero_h1_a: "Скачивайте видео с YouTube",
  hero_h1_b: "в полном качестве.",
  hero_tagline:
    "Всё, что отдаёт YouTube — 4K, 1080p60, HDR, Shorts — прямо на ваш диск.",
  pill_no_ads: "Без рекламы",
  pill_no_tracking: "Без слежки",
  pill_no_login: "Без входа",
  pill_no_cookies: "Без cookies",
  pill_mit: "Лицензия MIT",
  cta_download_os: "Скачать для вашей ОС",
  cta_view_github: "Открыть на GitHub",
  release_label: "Последняя версия:",
  release_loading: "загрузка…",

  features_eyebrow: "Что он умеет",
  features_h2: "Всё, что нужно, и ничего лишнего.",
  features_sub: "Вставьте URL, выберите качество, нажмите «Скачать». Вот и всё.",
  f1_h: "До 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — все разрешения, которые предлагает YouTube, плюс только аудио в MP3, AAC и Opus.",
  f2_h: "60 fps и HDR без потерь",
  f2_p: "Высокая частота кадров и HDR-потоки приходят ровно так, как их кодирует YouTube — без потери качества.",
  f3_h: "Сразу несколько",
  f3_p: "Ставьте в очередь сколько угодно видео. Панель загрузок отслеживает прогресс каждого параллельно.",
  f4_h: "Автообновления",
  f4_p: "Arroxy сам поддерживает yt-dlp и ffmpeg в актуальном состоянии — работает после любых изменений YouTube.",
  f5_h: "9 языков",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — определяет ваш автоматически.",
  f6_h: "Кросс-платформенный",
  f6_p: "Нативные сборки для Windows, macOS и Linux — установщик, портативная версия, DMG или AppImage.",
  f7_h: "Субтитры — как вам удобно",
  f7_p: "Ручные или авто-сгенерированные субтитры в SRT, VTT или ASS — рядом с видео, встроенные в портативный .mkv или сложенные в подпапку Subtitles/.",
  f8_h: "SponsorBlock встроен",
  f8_p: "Пропускайте или отмечайте сегменты спонсоров, вступления, концовки, самопиар и прочее — вырезайте через FFmpeg или добавляйте главы. Ваш выбор, по каждой категории.",
  f9_h: "Автозаполнение из буфера обмена",
  f9_p: "Скопируйте YouTube-ссылку где угодно, и Arroxy обнаружит её при возврате в приложение — запрос подтверждения сохраняет контроль. Включайте и выключайте в расширенных настройках.",

  shots_eyebrow: "В деле",
  shots_h2: "Сделано для ясности, не для мусора.",
  shot1_alt: "Вставьте URL",
  shot2_alt: "Выберите качество",
  shot3_alt: "Выберите место сохранения",
  shot4_alt: "Параллельные загрузки",
  shot5_alt: "Шаг субтитров — выбор языков, формата и режима сохранения",
  og_image_alt: "Иконка приложения Arroxy — десктопное приложение для загрузки YouTube-видео в 4K.",

  privacy_eyebrow: "Приватность",
  privacy_h2_html: "Чего Arroxy <em>не делает</em>.",
  privacy_sub:
    "Большинство загрузчиков YouTube рано или поздно просят ваши cookies. Arroxy — никогда.",
  p1_h: "Без входа",
  p1_p: "Без Google-аккаунта. Без истекающих сессий. Нулевой риск, что аккаунт пометят.",
  p2_h: "Без cookies",
  p2_p: "Arroxy запрашивает те же токены, что любой браузер. Ничего не экспортируется, ничего не хранится.",
  p3_h: "Без телеметрии",
  p3_p: "Никакой аналитики. Ваши загрузки, история и файлы остаются на вашем устройстве — точка.",
  p4_h: "Без сторонних серверов",
  p4_p: "Весь конвейер работает локально через yt-dlp + ffmpeg. Файлы никогда не попадают на удалённый сервер.",

  install_eyebrow: "Установка",
  install_h2: "Выберите канал.",
  install_sub:
    "Прямая загрузка или любой популярный менеджер пакетов — все обновляются автоматически с каждым релизом.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Все",
  winget_desc: "Рекомендуется для Windows 10/11. Обновляется вместе с системой.",
  scoop_desc: "Портативная установка через Scoop bucket. Права администратора не нужны.",
  brew_desc: "Добавьте tap, установите одной командой. Universal Binary (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Установка в песочнице. Скачайте бандл .flatpak из Releases и установите одной командой. Настройка Flathub не нужна.",
  direct_h: "Прямая загрузка",
  direct_desc: "NSIS-установщик, портативный .exe, .dmg, .AppImage или .flatpak — прямо из GitHub Releases.",
  direct_btn: "Открыть Releases →",
  copy_label: "Копировать",
  copied_label: "Скопировано!",

  footer_made_by: "Лицензия MIT · Сделано с заботой:",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Язык:",

  faq_eyebrow: "FAQ",
  faq_h2: "Часто задаваемые вопросы",
  faq_q1: "Какие качества видео можно скачивать?",
  faq_a1:
    "Всё, что предлагает YouTube — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p и только аудио. Потоки с высокой частотой кадров (60 fps, 120 fps) и HDR сохраняются как есть. Arroxy показывает все доступные форматы и даёт точно выбрать нужный.",
  faq_q2: "Это правда бесплатно?",
  faq_a2:
    "Да. Лицензия MIT. Никаких премиум-уровней, никаких заблокированных функций.",
  faq_q3: "На каких языках доступен Arroxy?",
  faq_a3:
    "На девяти, прямо из коробки: English, Español (испанский), Deutsch (немецкий), Français (французский), 日本語 (японский), 中文 (китайский), Русский, Українська (украинский) и हिन्दी (хинди). Arroxy автоматически определяет язык системы при первом запуске, и вы можете переключиться в любой момент через выбор языка в панели инструментов. Файлы локализации — это простые TypeScript-объекты в src/shared/i18n/locales/ — откройте PR на GitHub, чтобы внести вклад.",
  faq_q4: "Нужно что-то устанавливать?",
  faq_a4:
    "Нет. yt-dlp и ffmpeg автоматически скачиваются при первом запуске с официальных GitHub releases и кешируются на вашей машине. После этого никакой настройки не требуется.",
  faq_q5: "Будет ли работать, если YouTube что-то изменит?",
  faq_a5:
    "Да — у Arroxy два уровня устойчивости. Во-первых, yt-dlp — один из самых активно поддерживаемых open-source инструментов, обновления выходят в течение часов после изменений YouTube. Во-вторых, Arroxy вообще не зависит от кук или вашего аккаунта Google, так что нет сессий, которые истекают, и нет учётных данных, которые надо менять. Эта комбинация делает его значительно стабильнее инструментов, использующих экспорт кук из браузера.",
  faq_q6: "Можно ли скачивать плейлисты?",
  faq_a6:
    "Сейчас поддерживаются только отдельные видео. Поддержка плейлистов и каналов — в дорожной карте.",
  faq_q7: "Нужен ли мой YouTube-аккаунт или куки?",
  faq_a7:
    "Нет — и это важнее, чем кажется. Большинство инструментов, которые перестают работать после обновления YouTube, советуют экспортировать куки YouTube из браузера. Этот обходной путь ломается каждые ~30 минут, когда YouTube меняет сессии, а в документации yt-dlp прямо предупреждают, что это может привести к флагу аккаунта Google. Arroxy никогда не использует ни куки, ни учётные данные. Никакого логина. Никакого привязанного аккаунта. Нечему истекать, нечему банить.",
  faq_q8:
    'macOS говорит «приложение повреждено» или «не может быть открыто» — что делать?',
  faq_a8:
    "Это macOS Gatekeeper блокирует неподписанное приложение — реального повреждения нет. В README есть пошаговая инструкция для первого запуска на macOS.",
  faq_q9: "Это законно?",
  faq_a9:
    "Скачивание видео для личного использования в большинстве юрисдикций обычно допустимо. Вы сами отвечаете за соблюдение Условий использования YouTube и местных законов.",
};

export const uk = {
  title: "Arroxy — Безкоштовний завантажувач YouTube із відкритим кодом",
  description:
    "Завантажуйте відео з YouTube у 4K, 1080p60 та HDR. Безкоштовно, без реклами, без входу, без cookies, 100% приватно. Windows, macOS, Linux.",
  og_title: "Arroxy — Безкоштовний завантажувач YouTube із відкритим кодом",
  og_description:
    "4K · 1080p60 · HDR · Shorts. Без реклами. Без стеження. Без cookies. Без входу.",

  nav_features: "Можливості",
  nav_screenshots: "Скриншоти",
  nav_install: "Встановлення",
  nav_download: "Завантажити",

  hero_eyebrow: "Сучасний · Безкоштовний · Open Source",
  hero_h1_a: "Завантажуйте відео з YouTube",
  hero_h1_b: "у повній якості.",
  hero_tagline:
    "Усе, що дає YouTube — 4K, 1080p60, HDR, Shorts — прямо на ваш диск.",
  pill_no_ads: "Без реклами",
  pill_no_tracking: "Без стеження",
  pill_no_login: "Без входу",
  pill_no_cookies: "Без cookies",
  pill_mit: "Ліцензія MIT",
  cta_download_os: "Завантажити для вашої ОС",
  cta_view_github: "Дивитися на GitHub",
  release_label: "Остання версія:",
  release_loading: "завантаження…",

  features_eyebrow: "Що він робить",
  features_h2: "Усе, чого ви очікуєте, без жодного тертя.",
  features_sub: "Вставте URL, оберіть якість, натисніть «Завантажити». Та й усе.",
  f1_h: "До 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — усі роздільні здатності, що пропонує YouTube, плюс лише аудіо у MP3, AAC та Opus.",
  f2_h: "60 fps і HDR збережено",
  f2_p: "Високочастотні та HDR-потоки приходять саме такими, як їх кодує YouTube — без втрати якості.",
  f3_h: "Декілька одночасно",
  f3_p: "Ставте в чергу скільки завгодно відео. Панель показує прогрес кожного паралельно.",
  f4_h: "Автооновлення",
  f4_p: "Arroxy сам підтримує yt-dlp та ffmpeg актуальними — працює після будь-яких змін YouTube.",
  f5_h: "9 мов",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — визначає вашу автоматично.",
  f6_h: "Крос-платформний",
  f6_p: "Нативні збірки для Windows, macOS та Linux — інсталятор, портативна версія, DMG або AppImage.",
  f7_h: "Субтитри — як вам зручно",
  f7_p: "Ручні або авто-згенеровані субтитри у SRT, VTT чи ASS — поруч із відео, вбудовані в портативний .mkv або складені в підпапку Subtitles/.",
  f8_h: "SponsorBlock вбудовано",
  f8_p: "Пропускайте або позначайте сегменти спонсорів, вступи, кінцівки, самопіар тощо — вирізайте через FFmpeg або додавайте розділи. Ваш вибір, для кожної категорії.",
  f9_h: "Автозаповнення з буфера обміну",
  f9_p: "Скопіюйте посилання YouTube будь-де, і Arroxy виявить його при поверненні до застосунку — запит підтвердження зберігає контроль. Вмикайте та вимикайте в розширених налаштуваннях.",

  shots_eyebrow: "У дії",
  shots_h2: "Зроблено заради ясності, а не для безладу.",
  shot1_alt: "Вставте URL",
  shot2_alt: "Оберіть якість",
  shot3_alt: "Оберіть місце збереження",
  shot4_alt: "Паралельні завантаження",
  shot5_alt: "Крок субтитрів — вибір мов, формату та режиму збереження",
  og_image_alt: "Іконка застосунку Arroxy — десктопний застосунок для завантаження YouTube-відео у 4K.",

  privacy_eyebrow: "Приватність",
  privacy_h2_html: "Що Arroxy <em>не робить</em>.",
  privacy_sub:
    "Більшість завантажувачів YouTube рано чи пізно просять ваші cookies. Arroxy — ніколи.",
  p1_h: "Без входу",
  p1_p: "Без Google-акаунта. Без сесій, що закінчуються. Нульовий ризик блокування акаунта.",
  p2_h: "Без cookies",
  p2_p: "Arroxy просить ті самі токени, що й будь-який браузер. Нічого не експортується й не зберігається.",
  p3_h: "Без телеметрії",
  p3_p: "Жодної аналітики. Ваші завантаження, історія та файли залишаються на вашому пристрої — крапка.",
  p4_h: "Без сторонніх серверів",
  p4_p: "Уся обробка йде локально через yt-dlp + ffmpeg. Файли ніколи не торкаються віддаленого сервера.",

  install_eyebrow: "Встановлення",
  install_h2: "Оберіть канал.",
  install_sub:
    "Пряме завантаження або будь-який популярний менеджер пакетів — усі оновлюються автоматично з кожним релізом.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Усі",
  winget_desc: "Рекомендовано для Windows 10/11. Оновлюється разом із системою.",
  scoop_desc: "Портативна установка через Scoop bucket. Прав адміністратора не потрібно.",
  brew_desc: "Додайте tap, встановіть однією командою. Universal Binary (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Установка в пісочниці. Скачайте бандл .flatpak з Releases і встановіть однією командою. Налаштування Flathub не потрібне.",
  direct_h: "Пряме завантаження",
  direct_desc: "NSIS-інсталятор, портативний .exe, .dmg, .AppImage або .flatpak — прямо з GitHub Releases.",
  direct_btn: "Відкрити Releases →",
  copy_label: "Копіювати",
  copied_label: "Скопійовано!",

  footer_made_by: "Ліцензія MIT · Зроблено з турботою:",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Мова:",

  faq_eyebrow: "FAQ",
  faq_h2: "Часті запитання",
  faq_q1: "Які якості відео можна завантажувати?",
  faq_a1:
    "Будь-які, що пропонує YouTube — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p та лише аудіо. Потоки з високою частотою кадрів (60 fps, 120 fps) і HDR зберігаються як є. Arroxy показує всі доступні формати і дає точно обрати потрібний.",
  faq_q2: "Це справді безкоштовно?",
  faq_a2: "Так. Ліцензія MIT. Без преміум-рівнів, без заблокованих функцій.",
  faq_q3: "Якими мовами доступний Arroxy?",
  faq_a3:
    "Дев'ятьма, з коробки: English, Español (іспанська), Deutsch (німецька), Français (французька), 日本語 (японська), 中文 (китайська), Русский (російська), Українська і हिन्दी (хінді). Arroxy автоматично визначає мову операційної системи при першому запуску, і ви можете перемикнутися будь-коли через вибір мови в панелі інструментів. Файли локалізації — прості TypeScript-об'єкти у src/shared/i18n/locales/ — відкрийте PR на GitHub, щоб зробити внесок.",
  faq_q4: "Чи треба щось встановлювати?",
  faq_a4:
    "Ні. yt-dlp і ffmpeg автоматично завантажуються при першому запуску з офіційних GitHub releases і кешуються на вашій машині. Після цього жодних додаткових налаштувань.",
  faq_q5: "Чи працюватиме, якщо YouTube щось змінить?",
  faq_a5:
    "Так — Arroxy має два рівні стійкості. По-перше, yt-dlp — один із найактивніше підтримуваних відкритих інструментів, оновлення виходять упродовж годин після змін YouTube. По-друге, Arroxy зовсім не залежить від кук чи вашого акаунта Google, тож немає сесій, що спливають, і немає облікових даних, які треба міняти. Це поєднання робить його значно стабільнішим за інструменти, що використовують експорт кук із браузера.",
  faq_q6: "Чи можна завантажувати плейлисти?",
  faq_a6:
    "Зараз підтримуються лише окремі відео. Підтримка плейлистів і каналів — у дорожній карті.",
  faq_q7: "Чи потрібен мій YouTube-акаунт або куки?",
  faq_a7:
    "Ні — і це важливіше, ніж може здатися. Більшість інструментів, які перестають працювати після оновлення YouTube, радять експортувати куки YouTube із браузера. Це обхід ламається кожні ~30 хвилин, коли YouTube змінює сесії, а в документації yt-dlp прямо попереджають, що це може призвести до прапорця на акаунті Google. Arroxy ніколи не використовує куки чи облікові дані. Ні логіну. Ні прив'язаного акаунта. Нічого не спливає, нічого не банять.",
  faq_q8:
    'macOS каже «застосунок пошкоджено» або «не вдається відкрити» — що робити?',
  faq_a8:
    "Це macOS Gatekeeper блокує непідписаний застосунок — реального пошкодження немає. У README є покрокова інструкція для першого запуску на macOS.",
  faq_q9: "Чи це законно?",
  faq_a9:
    "Завантаження відео для особистого використання в більшості юрисдикцій загалом допустиме. Ви самі відповідаєте за дотримання Умов використання YouTube і місцевого законодавства.",
};

export const hi = {
  title: "Arroxy — मुफ़्त ओपन-सोर्स YouTube डाउनलोडर",
  description:
    "YouTube वीडियो को 4K, 1080p60 और HDR में डाउनलोड करें। मुफ़्त, विज्ञापन रहित, बिना लॉगिन, बिना कुकीज़, 100% निजी। Windows, macOS, Linux।",
  og_title: "Arroxy — मुफ़्त ओपन-सोर्स YouTube डाउनलोडर",
  og_description:
    "4K · 1080p60 · HDR · Shorts। कोई विज्ञापन नहीं। कोई ट्रैकिंग नहीं। कोई कुकीज़ नहीं। कोई लॉगिन नहीं।",

  nav_features: "विशेषताएँ",
  nav_screenshots: "स्क्रीनशॉट",
  nav_install: "इंस्टॉल",
  nav_download: "डाउनलोड",

  hero_eyebrow: "आधुनिक · मुफ़्त · ओपन सोर्स",
  hero_h1_a: "YouTube वीडियो डाउनलोड करें",
  hero_h1_b: "पूर्ण गुणवत्ता में।",
  hero_tagline:
    "जो भी YouTube परोसता है — 4K, 1080p60, HDR, Shorts — सीधे आपकी डिस्क पर।",
  pill_no_ads: "कोई विज्ञापन नहीं",
  pill_no_tracking: "कोई ट्रैकिंग नहीं",
  pill_no_login: "कोई लॉगिन नहीं",
  pill_no_cookies: "कोई कुकीज़ नहीं",
  pill_mit: "MIT लाइसेंस",
  cta_download_os: "अपने OS के लिए डाउनलोड करें",
  cta_view_github: "GitHub पर देखें",
  release_label: "नवीनतम रिलीज़:",
  release_loading: "लोड हो रहा है…",

  features_eyebrow: "यह क्या करता है",
  features_h2: "जो आप उम्मीद करते हैं वह सब, बिना किसी अड़चन के।",
  features_sub: "URL पेस्ट करें, गुणवत्ता चुनें, डाउनलोड पर क्लिक करें। बस इतना।",
  f1_h: "4K UHD तक",
  f1_p: "2160p, 1440p, 1080p, 720p — हर वह रिज़ॉल्यूशन जो YouTube देता है, साथ ही केवल-ऑडियो MP3, AAC और Opus।",
  f2_h: "60 fps और HDR सुरक्षित",
  f2_p: "हाई फ्रेम-रेट और HDR स्ट्रीम बिल्कुल वैसी ही आती हैं जैसी YouTube एनकोड करता है — बिना गुणवत्ता के नुकसान।",
  f3_h: "एक साथ कई",
  f3_p: "जितने चाहें उतने वीडियो कतार में लगाएँ। डाउनलोड पैनल हर एक की प्रगति समानांतर में दिखाता है।",
  f4_h: "स्वचालित अपडेट",
  f4_p: "Arroxy yt-dlp और ffmpeg को पीछे से ताज़ा रखता है — YouTube के हर बदलाव के साथ चलता है।",
  f5_h: "9 भाषाएँ",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — आपकी भाषा अपने आप पहचानता है।",
  f6_h: "क्रॉस-प्लेटफ़ॉर्म",
  f6_p: "Windows, macOS और Linux के लिए नेटिव बिल्ड — इंस्टॉलर, पोर्टेबल, DMG या AppImage।",
  f7_h: "सबटाइटल, आपके अंदाज़ में",
  f7_p: "SRT, VTT या ASS में मैनुअल या ऑटो-जेनरेटेड सबटाइटल — वीडियो के बग़ल में सेव करें, पोर्टेबल .mkv में एम्बेड करें, या Subtitles/ फ़ोल्डर में रखें।",
  f8_h: "SponsorBlock बिल्ट-इन",
  f8_p: "स्पॉन्सर सेगमेंट, इंट्रो, आउट्रो, सेल्फ-प्रोमो और अन्य को स्किप या मार्क करें — FFmpeg से काटें या बस चैप्टर जोड़ें। हर कैटेगरी के लिए आपकी पसंद।",
  f9_h: "क्लिपबोर्ड ऑटो-फ़िल",
  f9_p: "कहीं भी YouTube लिंक कॉपी करें और वापस स्विच करने पर Arroxy तुरंत पहचान लेता है — एक पुष्टि प्रॉम्प्ट नियंत्रण बनाए रखता है। उन्नत सेटिंग में सक्षम या अक्षम करें।",

  shots_eyebrow: "क्रिया में देखें",
  shots_h2: "स्पष्टता के लिए बना है, अव्यवस्था के लिए नहीं।",
  shot1_alt: "URL पेस्ट करें",
  shot2_alt: "अपनी गुणवत्ता चुनें",
  shot3_alt: "सहेजने का स्थान चुनें",
  shot4_alt: "समानांतर डाउनलोड",
  shot5_alt: "सबटाइटल स्टेप — भाषाएँ, फ़ॉर्मैट और सेव मोड चुनें",
  og_image_alt: "Arroxy ऐप आइकन — YouTube वीडियो को 4K में डाउनलोड करने के लिए डेस्कटॉप ऐप।",

  privacy_eyebrow: "गोपनीयता",
  privacy_h2_html: "Arroxy जो <em>नहीं</em> करता है।",
  privacy_sub:
    "अधिकांश YouTube डाउनलोडर अंततः आपकी कुकीज़ माँगते हैं। Arroxy कभी नहीं माँगेगा।",
  p1_h: "कोई लॉगिन नहीं",
  p1_p: "कोई Google खाता नहीं। कोई समाप्त होने वाली सत्र नहीं। आपके खाते पर ध्वजांकित होने का शून्य जोखिम।",
  p2_h: "कोई कुकीज़ नहीं",
  p2_p: "Arroxy वही टोकन माँगता है जो कोई भी ब्राउज़र। कुछ निर्यात नहीं, कुछ संग्रहीत नहीं।",
  p3_h: "कोई टेलीमेट्री नहीं",
  p3_p: "शून्य एनालिटिक्स। आपके डाउनलोड, इतिहास और फ़ाइलें आपके डिवाइस पर ही रहती हैं — पूरी बात।",
  p4_h: "कोई तृतीय-पक्ष सर्वर नहीं",
  p4_p: "पूरी पाइपलाइन yt-dlp + ffmpeg के माध्यम से स्थानीय रूप से चलती है। फ़ाइलें कभी रिमोट सर्वर को नहीं छूतीं।",

  install_eyebrow: "इंस्टॉल",
  install_h2: "अपना चैनल चुनें।",
  install_sub:
    "सीधा डाउनलोड या कोई भी प्रमुख पैकेज मैनेजर — हर रिलीज़ के साथ स्वचालित रूप से अपडेट।",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "सभी",
  winget_desc: "Windows 10/11 के लिए अनुशंसित। सिस्टम के साथ ऑटो-अपडेट।",
  scoop_desc: "Scoop bucket के माध्यम से पोर्टेबल इंस्टॉल। एडमिन अधिकार आवश्यक नहीं।",
  brew_desc: "Cask टैप करें, एक कमांड से इंस्टॉल करें। यूनिवर्सल बाइनरी (Intel + Apple Silicon)।",
  flatpak_h: "Flatpak",
  flatpak_desc: "सैंडबॉक्स्ड इंस्टॉल। Releases से .flatpak बंडल डाउनलोड करें, एक कमांड से इंस्टॉल। Flathub सेटअप ज़रूरी नहीं।",
  direct_h: "सीधा डाउनलोड",
  direct_desc: "NSIS इंस्टॉलर, पोर्टेबल .exe, .dmg, .AppImage या .flatpak — सीधे GitHub Releases से।",
  direct_btn: "Releases खोलें →",
  copy_label: "कॉपी करें",
  copied_label: "कॉपी हो गया!",

  footer_made_by: "MIT लाइसेंस · सावधानी से बनाया गया:",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "भाषा:",

  faq_eyebrow: "FAQ",
  faq_h2: "अक्सर पूछे जाने वाले प्रश्न",
  faq_q1: "मैं किन क्वालिटी में डाउनलोड कर सकता हूँ?",
  faq_a1:
    "जो भी YouTube देता है — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p और ऑडियो-only। हाई फ़्रेम-रेट (60 fps, 120 fps) और HDR कंटेंट जैसे हैं वैसे ही रहते हैं। Arroxy हर उपलब्ध फ़ॉर्मैट दिखाता है और आपको ठीक वही चुनने देता है जो लेना है।",
  faq_q2: "क्या यह सच में मुफ़्त है?",
  faq_a2: "हाँ। MIT लाइसेंस। कोई प्रीमियम टियर नहीं, कोई फ़ीचर लॉक नहीं।",
  faq_q3: "Arroxy किन भाषाओं में उपलब्ध है?",
  faq_a3:
    "नौ, बॉक्स से बाहर: English, Español (स्पेनिश), Deutsch (जर्मन), Français (फ़्रेंच), 日本語 (जापानी), 中文 (चीनी), Русский (रूसी), Українська (यूक्रेनी) और हिन्दी। Arroxy पहले लॉन्च पर आपके ऑपरेटिंग सिस्टम की भाषा अपने आप पहचानता है, और आप टूलबार में भाषा चुनने वाले से कभी भी बदल सकते हैं। लोकेल फ़ाइलें src/shared/i18n/locales/ में सादे TypeScript ऑब्जेक्ट्स हैं — योगदान के लिए GitHub पर एक PR खोलें।",
  faq_q4: "क्या मुझे कुछ इंस्टॉल करना होगा?",
  faq_a4:
    "नहीं। yt-dlp और ffmpeg पहले लॉन्च पर अपने ऑफ़िशियल GitHub releases से अपने आप डाउनलोड हो जाते हैं और आपकी मशीन पर कैश हो जाते हैं। उसके बाद कोई एक्स्ट्रा सेटअप ज़रूरी नहीं।",
  faq_q5: "अगर YouTube कुछ बदले तो क्या यह काम करता रहेगा?",
  faq_a5:
    "हाँ — और Arroxy में दो लेयर रिज़िलियेंस है। पहला, yt-dlp सबसे एक्टिवली मेनटेन्ड ओपन-सोर्स टूल्स में से एक है — YouTube के बदलाव के घंटों के भीतर अपडेट होता है। दूसरा, Arroxy कुकीज़ या आपके Google अकाउंट पर बिल्कुल निर्भर नहीं है, इसलिए कोई सेशन एक्सपायर नहीं होता और कोई क्रेडेंशियल रोटेट नहीं करना। यह कॉम्बिनेशन इसे ब्राउज़र की कुकीज़ एक्सपोर्ट करने पर निर्भर टूल्स से कहीं ज़्यादा स्थिर बनाता है।",
  faq_q6: "क्या मैं प्लेलिस्ट डाउनलोड कर सकता हूँ?",
  faq_a6: "अभी सिंगल वीडियो सपोर्टेड हैं। प्लेलिस्ट और चैनल सपोर्ट रोडमैप पर है।",
  faq_q7: "क्या इसे मेरे YouTube अकाउंट या कुकीज़ की ज़रूरत है?",
  faq_a7:
    "नहीं — और यह जितना लगता है उससे ज़्यादा अहम है। ज़्यादातर टूल्स जो YouTube के अपडेट के बाद बंद हो जाते हैं, आपको ब्राउज़र की YouTube कुकीज़ एक्सपोर्ट करने को कहते हैं। यह वर्कअराउंड हर ~30 मिनट में टूटता है क्योंकि YouTube सेशन रोटेट करता है, और yt-dlp की अपनी डॉक्स चेताती है कि इससे आपका Google अकाउंट फ़्लैग हो सकता है। Arroxy कभी कुकीज़ या क्रेडेंशियल इस्तेमाल नहीं करता। कोई लॉगिन नहीं। कोई अकाउंट लिंक नहीं। कुछ एक्सपायर नहीं होता, कुछ बैन नहीं होता।",
  faq_q8: 'macOS कहता है "ऐप ख़राब है" या "नहीं खुल सकती" — क्या करूँ?',
  faq_a8:
    "यह macOS Gatekeeper बिना साइन की हुई ऐप को ब्लॉक कर रहा है — असली नुक़सान नहीं है। macOS पर पहली बार लॉन्च के लिए README में क़दम-दर-क़दम निर्देश हैं।",
  faq_q9: "क्या यह क़ानूनी है?",
  faq_a9:
    "ज़्यादातर अधिकार-क्षेत्रों में पर्सनल इस्तेमाल के लिए वीडियो डाउनलोड करना आम तौर पर स्वीकार्य है। YouTube की Terms of Service और अपने स्थानीय क़ानूनों का पालन करना आपकी ज़िम्मेदारी है।",
};

// Locale registry. Order = display order in the language picker.
// `dir` is the path under docs/ ("" = root for English).
// `ogLocale` is the canonical Open Graph locale tag (BCP 47 with underscore).
export const LOCALES = [
  { code: "en", name: "English",   dir: "",   ogLocale: "en_US", strings: en },
  { code: "es", name: "Español",   dir: "es", ogLocale: "es_ES", strings: es },
  { code: "de", name: "Deutsch",   dir: "de", ogLocale: "de_DE", strings: de },
  { code: "fr", name: "Français",  dir: "fr", ogLocale: "fr_FR", strings: fr },
  { code: "ja", name: "日本語",     dir: "ja", ogLocale: "ja_JP", strings: ja },
  { code: "zh", name: "中文",       dir: "zh", ogLocale: "zh_CN", strings: zh },
  { code: "ru", name: "Русский",   dir: "ru", ogLocale: "ru_RU", strings: ru },
  { code: "uk", name: "Українська", dir: "uk", ogLocale: "uk_UA", strings: uk },
  { code: "hi", name: "हिन्दी",      dir: "hi", ogLocale: "hi_IN", strings: hi },
];
