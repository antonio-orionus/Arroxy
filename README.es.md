<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascota de Arroxy" width="180" />

# Arroxy — Descargador gratuito de YouTube (+ 2000 sitios) de código abierto con navegador integrado para Windows, macOS y Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Leer en:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · **Español** · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Versión](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Compilación](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Sitio web](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Licencia](https://img.shields.io/badge/license-MIT-green) ![Plataformas](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Idiomas](https://img.shields.io/badge/i18n-31_languages-blue)

Descarga videos, Shorts, música, canales, podcasts o pistas de audio de **YouTube y más de 2000 sitios compatibles** — hasta 8K HDR a 60 fps, como MP3 / AAC / Opus, o solo la parte que necesites. **Navega por YouTube o cualquier otro sitio dentro de Arroxy** en la pestaña Explore y descarga el video, la playlist o el canal que estás viendo; inicia sesión ahí para descargar videos privados, solo para miembros y con restricción de edad que tu cuenta pueda ver. Se ejecuta localmente en Windows, macOS y Linux. **Sin anuncios, sin bloatware, sin ventas adicionales.**

[**↓ Descargar la última versión**](#install) &nbsp;·&nbsp; [**Sitio web**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Primer arranque en Windows](#windows-first-launch) · [Primer arranque en macOS](#macos-first-launch) · [Primer arranque en Linux](#linux-first-launch)

[![Únete a la comunidad de Discord](https://img.shields.io/badge/%C3%9Anete%20a%20la%20comunidad%20de%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Si Arroxy te ahorra tiempo, una ⭐ ayuda a que otros lo encuentren.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).

---

## Contenido

- [✨ Características](#features)
- [📥 Instalar y primer inicio](#install)
  - [Primer arranque en Windows](#windows-first-launch)
  - [Primer arranque en macOS](#macos-first-launch)
  - [Por qué puedes ver una advertencia](#why-warning)
  - [Primer arranque en Linux](#linux-first-launch)
  - [Verifica tu descarga (SHA256)](#verify)
- [⚖️ ¿Por qué Arroxy?](#why)
- [🔒 Privacidad](#privacy)
- [❓ Preguntas frecuentes](#faq)
- [🗺️ Hoja de ruta](#roadmap)
- [💖 Apoyar a Arroxy](#support)
- [🛠️ Construido con](#tech)

---

## <a id="features"></a>✨ Características

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Navega por YouTube o cualquier otro sitio dentro de Arroxy y descarga la página en la que estás con tu perfil activo</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>La primera pantalla de Explore</b><br/>Un vistazo rápido a Explore y por qué una cuenta secundaria es el inicio de sesión más seguro</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descargas te avisa de lo que necesita tu atención</b><br/>Los enlaces se preparan en segundo plano; uno fallido ofrece su solución, una playlist larga espera tu decisión</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descarga solo una parte del vídeo</b><br/>Elige un inicio y un final, o un capítulo — Arroxy guarda solo ese tramo</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editor de perfiles</b><br/>Ajusta un perfil: tipo de archivo, resolución, subtítulos, destino, plantilla de nombre de archivo y más</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Oscuro o claro, cristal o sólido</b><br/>Cuatro aspectos a elegir: paneles de cristal sobre un cielo en movimiento o superficies sólidas y tranquilas, cada uno en oscuro y claro</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Atajo de descarga global de Arroxy — Ctrl+Shift+D en Windows y Linux, Cmd+Shift+D en macOS, que envía el enlace copiado directamente a la cola de descargas" width="760" /></picture><br/><sub><b>Atajo de descarga global</b><br/>Copia un enlace donde sea y pulsa una vez — entra en la cola y empieza a descargarse</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Perfiles por elemento de playlist</b><br/>Da a cada vídeo su propio perfil — archiva algunos en 4K y saca el resto como MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Inicio de Descarga rápida</b><br/>Pega una URL y descárgala al instante con tu perfil activo</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Perfiles de descarga reutilizables</b><br/>Guarda formato, calidad y salida como preajustes — reutiliza en cada descarga</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Pistas de audio multiidioma</b><br/>Elige el idioma de audio exacto que trae el vídeo</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Audio Surround / Dolby</b><br/>Pistas 5.1 y Dolby detectadas y conservadas</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Modo de URLs en lote</b><br/>Pega una lista, elimina duplicados y encólalas todas a la vez</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Cola de descargas en paralelo</b><br/>Varias descargas a la vez con progreso en vivo</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: navega por la web dentro de Arroxy</strong></summary>

- **Pestaña Explore** — navega por YouTube o cualquier otro sitio dentro de Arroxy y descarga lo que encuentres sin copiar enlaces. **Descargar · *tu perfil*** pone en cola el vídeo, la playlist o el canal que estás viendo; la flecha de al lado cambia de perfil, y la varita abre la descarga paso a paso para elegir formatos, subtítulos y más
- **Clic derecho para descargar** — haz clic derecho en cualquier enlace de vídeo, playlist o canal en Explore para descargarlo con tu perfil, elegir otro perfil en **Descargar con**, abrir la descarga paso a paso o copiar el enlace. No hace falta abrir cada vídeo antes
- **Diseño compacto** — un clic en la barra de herramientas de Explore lleva allí las pestañas de Arroxy y da más espacio a la página
- **Barra de direcciones** — escribe para buscar en YouTube o introduce cualquier dirección web para abrir ese sitio
- **Descargas que necesitan una cuenta** — inicia sesión una vez en Explore y Arroxy podrá descargar vídeos privados y solo para miembros que tu cuenta pueda ver, vídeos con restricción de edad si la cuenta tiene la edad verificada, y tus listas Ver más tarde y Me gusta. Inicia sesión también en otros sitios ahí, y sus descargas usan ese inicio de sesión cuando lo necesitan. Arroxy sigue descargando primero sin sesión y solo usa tu inicio de sesión de Explore cuando una descarga falla de una forma que una cuenta puede arreglar. Cuando YouTube te pide confirmar que no eres un bot, Arroxy también prueba tu inicio de sesión de Explore
- **Usa una cuenta secundaria** — la primera pantalla de Explore explica por qué: descargar con una cuenta conlleva cierto riesgo de que esa cuenta sea restringida. Cierra sesión en Explore desde Configuración cuando quieras olvidar tus inicios de sesión
- **Bloqueador de anuncios** — desactivado por defecto. Un clic en el escudo de la barra de herramientas de Explore bloquea anuncios y rastreadores en sus páginas, sin afectar a las descargas. YouTube puede oponerse a los bloqueadores de anuncios en cuentas con sesión iniciada

</details>

<details>
<summary><strong>🎞️ Calidad y formatos</strong></summary>

- Hasta **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Alta frecuencia de fotogramas y HDR** conservados tal cual — 60 fps, HDR10
- **Audio** — exporta solo audio como MP3, M4A/AAC, Opus o WAV. En las descargas interactivas, elige las pistas nativas surround/Dolby de la fuente (AC-3, E-AC-3, 5.1, DRC) cuando estén disponibles, o configura un valor global **Preferir surround / Dolby**
- **Perfiles con un objetivo** — *Mejor imagen* (AV1 · VP9) o *TV inteligente* (MP4 · H.264), guardados como Auto, MP4, MKV o WebM sin recodificar. HDR es *Auto* (solo cuando tu pantalla puede mostrarlo), *SDR* o *HDR*
- **Cada códec en cada resolución** — la descarga paso a paso muestra AV1, VP9 y H.264 uno junto a otro en cada resolución, para que elijas el que reproduce tu TV o tu editor
- **Sabe qué es realmente cada stream** — se marcan las resoluciones que YouTube reescaló con IA, los idiomas de audio doblados con IA, los streams con tasa de bits mejorada, los vídeos 360° y las copias dañadas o con marca de agua. Los perfiles omiten los streams reescalados con IA salvo que los permitas

</details>

<details>
<summary><strong>🛡️ Privacidad y control</strong></summary>

- Procesamiento 100% local — las descargas van directamente de YouTube a tu disco
- Sin inicio de sesión, sin cookies, sin cuenta de Google vinculada
- Archivos guardados directamente en la carpeta que elijas

</details>

<details>
<summary><strong>⚡ Flujo de trabajo</strong></summary>

- **Atajo de descarga global** — copia un enlace en cualquier app y pulsa `Ctrl+Shift+D` (`Cmd+Shift+D` en macOS); Arroxy lo pone en cola con tu perfil activo sin abrir la ventana, y una notificación lo confirma. Activo por defecto y reasignable
- **Modos de inicio flexibles** — elige una descarga individual guiada, selector de playlist/canal, pegado masivo de URLs, Quick Download con tus valores guardados, o navega y descarga desde Explore
- **Cola central de descargas** — cada trabajo individual, de playlist, masivo o rápido llega a un solo lugar para ver progreso, pausar, reanudar, cancelar, reintentar y controlar prioridad
- **Monitoreo del portapapeles** — copia un enlace de vídeo y se rellena el campo URL al volver a Arroxy, con **Deshacer** si no era lo que querías. Si Arroxy está ocupado, el enlace espera hasta que vuelvas a la pestaña URL (desactívalo en Ajustes)
- **Limpieza automática de URLs** — elimina parámetros de seguimiento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) y desempaqueta los enlaces `youtube.com/redirect`
- **Modo bandeja** — cerrar la ventana mantiene las descargas en segundo plano
- **31 idiomas**: detecta automáticamente la configuración regional del sistema y se puede cambiar en cualquier momento
- **Sincronización de playlists** — vuelve a escanear una playlist contra una carpeta local para omitir vídeos ya descargados; genera un archivo de playlist `.m3u` que se actualiza con cada vídeo descargado
- **Controles de velocidad y ritmo** — limita el ancho de banda de descarga, define cuántas partes de un vídeo se descargan a la vez y añade pausas entre solicitudes con ajustes (*Desactivado · Equilibrado · Cuidadoso · Personalizado*)
- **Plantillas de nombre de archivo** — nombra las descargas a tu manera con `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` y `{playlist_index}`, de forma global o por perfil de descarga
- **Descargas a la vez y reintento automático** — elige cuántas descargas de la cola se ejecutan al mismo tiempo y deja que Arroxy reintente una descarga que sufrió un problema de red o del servidor, esperando más antes de cada intento
- **Perfiles por elemento de playlist** — asigna a cada vídeo de una playlist su propio perfil de descarga en lugar de un único ajuste para toda la lista, para archivar algunos en calidad máxima y sacar el resto como MP3 en una sola pasada
- **Quick Download funciona en segundo plano** — el enlace aparece enseguida en Descargas y se prepara allí, una nota con **Ver** lo confirma, y el campo de URL se vacía para el siguiente enlace. Lanza tantos como quieras mientras los anteriores se preparan
- **Descargas te avisa de lo que necesita tu atención** — si Arroxy no puede leer un enlace, su fila explica por qué y ofrece la solución: Reintentar, activar las cookies o iniciar sesión en Explore. Con las cookies desactivadas, **Iniciar sesión con Explore** lo reintenta por ti en cuanto hayas iniciado sesión. Una playlist más larga que tu límite de carga espera en su fila a que elijas toda, los primeros vídeos o una revisión. La pestaña Descargas cuenta las filas que esperan por ti
- **Descarga solo una parte de un vídeo**: elige un inicio y un fin, o un capítulo, en la pantalla Formato y Arroxy guarda solo ese intervalo, con el intervalo en el nombre después del id del vídeo. Los cortes caen en el fotograma clave más cercano; activa el corte exacto para recodificar en su lugar
- **Quitar descargas terminadas** — opcional: una descarga terminada sale de la lista 5 segundos después. Sus archivos siguen en el disco, y las descargas fallidas se quedan en la lista
- **Tamaño y Falta en Descargas** — una columna ordenable **Tamaño** muestra cuánto espacio ocupa cada descarga, y **Falta** señala los archivos movidos o borrados fuera de Arroxy
- **Aurora o Minimalista, oscuro o claro** — paneles de cristal sobre un cielo en movimiento, o superficies sólidas y tranquilas; cambia desde el pie de página. Los equipos sin aceleración gráfica reciben Minimalista automáticamente
- **Barra de menús del Mac** — en macOS, abre Ajustes (`Cmd+,`), fija el límite de velocidad de descarga, cambia el estilo y el tema, y abre los registros o guarda un archivo de diagnóstico desde la barra de menús
- **Cambia un perfil desde cualquier descarga** — ajusta una descarga y luego actualiza el perfil del que partió (con una vista previa de lo que cambia) o guarda los ajustes como un perfil nuevo. Al cambiar de perfil, Arroxy te pregunta si quieres conservar tus cambios

</details>

<details>
<summary><strong>📝 Subtítulos y posprocesamiento</strong></summary>

- **Subtítulos** en SRT, VTT o ASS — manuales o generados automáticamente, en cualquier idioma disponible
- Guárdalos junto al video, incrústalos en `.mkv` u organízalos en una subcarpeta `Subtitles/`
- **Lotes solo de subtítulos** — pega una lista de URLs o abre una lista de reproducción, elige Subtítulos y obtén solo los archivos de subtítulos de cada vídeo
- **SponsorBlock** — omite o marca como capítulos patrocinadores, intros, outros y autopromociones
- **Metadatos incrustados** — título, fecha de subida, canal, descripción, miniatura y marcadores de capítulo escritos en el archivo

</details>

<details>
<summary><strong>🌐 YouTube + 2000 sitios</strong></summary>

- **YouTube, al completo** — Videos, Shorts, Canales, Playlists, YouTube Music y Podcasts tratados como fuentes de primera clase
- **Más de 2000 sitios adicionales** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable y muchos más
- **Solo audio y subtítulos** funcionan en todos los sitios compatibles, no solo en YouTube
- Si un sitio cambia, yt-dlp publica correcciones semanalmente y Arroxy actualiza el binario automáticamente al iniciar

</details>

---

## <a id="install"></a>📥 Instalar y primer inicio

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

AppImage:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

Solo hay versiones x86_64. ¿Sin `curl`? Cambia `curl -fsSL` por `wget -qO-`.

| Plataforma | Formato |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Obtén la última versión →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Primer arranque en Windows</strong></summary>

En el primer arranque puede aparecer **"Windows protected your PC"** o **"Unknown publisher."** Esto aplica tanto a `Arroxy-win-x64-Setup.exe` como a `Arroxy-win-x64-Portable.exe`. Arroxy es gratuito y de código abierto, y las compilaciones de Windows no están firmadas con un certificado de pago, por lo que SmartScreen las marca. Eso **no** significa automáticamente que Arroxy sea inseguro. Para continuar:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Haz clic en **More info**.
2. Haz clic en **Run anyway**.

#### Si Windows Defender marca o elimina el archivo

La heurística de Defender a veces marca los instaladores NSIS sin firmar y los portables de Electron como sospechosos. Si Defender pone en cuarentena `Arroxy-win-x64-Setup.exe` o `Arroxy-win-x64-Portable.exe`, recupéralo desde **Windows Security → Virus & threat protection → Protection history**, y añade el ejecutable de Arroxy como elemento permitido en **Manage settings → Add or remove exclusions**. Al igual que con SmartScreen, el motivo es la firma del editor ausente, no malware detectado.

> Descarga Arroxy solo desde la página oficial de GitHub Releases. Si obtuviste el archivo de otro sitio web o alguien te lo envió, bórralo y descarga una copia nueva desde la fuente oficial. El código fuente es público, así que puedes inspeccionarlo o compilar Arroxy tú mismo si lo prefieres.

¿Prefieres Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Primer arranque en macOS</strong></summary>

Arroxy aún no está firmado digitalmente para macOS, así que Gatekeeper puede mostrar el aviso alarmante *"Arroxy.app is damaged and can't be opened"* después de instalarlo desde el DMG. Ese mensaje significa que macOS puso en cuarentena una app sin firmar; no significa que los archivos estén dañados. En macOS actual, la solución fiable es Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.
2. Abre Terminal y ejecuta estos dos comandos:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

El primer comando elimina el atributo de cuarentena de tu copia instalada de Arroxy. El segundo inicia la app. `sudo` puede pedir la contraseña de tu Mac; Terminal no mostrará caracteres mientras la escribes.

**Apple Silicon vs Intel:** en un Mac de la serie M (M1 / M2 / M3 / M4), descarga el DMG `arm64`. En Macs Intel, descarga el DMG `x64`. El build incorrecto funciona igualmente mediante Rosetta, pero es notablemente más lento.

> Las compilaciones de macOS se producen mediante CI en runners de Apple Silicon e Intel. Si encuentras algún problema, por favor [abre un issue](../../issues) — los comentarios de usuarios de macOS influyen activamente en el ciclo de pruebas de macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Por qué puedes ver una advertencia</strong></summary>

Arroxy es de código abierto y con licencia MIT. Las compilaciones de Windows y macOS **no están firmadas digitalmente** — los certificados Apple Developer ID y Windows EV de firma de código cuestan cada uno cientos de dólares al año, que un proyecto independiente paga de su bolsillo. Sin esas firmas, Windows SmartScreen y macOS Gatekeeper te advertirán en el primer arranque. Las advertencias significan *tu sistema operativo no reconoce al editor* — no significan que Arroxy sea malware.

Tres formas de verificar Arroxy tú mismo, en orden creciente de rigor:

- **Lee el código fuente.** Cada línea está en [GitHub](https://github.com/antonio-orionus/Arroxy) y puedes [compilarlo desde el código fuente](#tech).
- **Comprueba el SHA256.** Compara tu archivo con el [`SHA256SUMS`](../../releases/latest) publicado — consulta [Verifica tu descarga](#verify) a continuación.
- **Realiza un análisis de terceros.** Sube el archivo a [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Primer arranque en Linux</strong></summary>

Los AppImages se ejecutan directamente — sin instalación. Solo necesitas marcar el archivo como ejecutable.

**Gestor de archivos:** haz clic derecho en el `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir ejecutar el archivo como programa**, luego doble clic.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Si el arranque sigue fallando, ejecútalo sin montar — no hace falta el paquete FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Integración de escritorio opcional:** instala [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) una sola vez, y cualquier AppImage en la que hagas doble clic quedará registrada automáticamente en tu menú de aplicaciones — sin necesidad de crear manualmente un archivo `.desktop`.

**Tarball simple (sin FUSE, sin instalación):**

La versión `.tar.gz` es la misma app sin el envoltorio AppImage: descomprímela donde quieras y ejecútala. Sin instalador y sin paquete FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Las descargas de Linux en la página de versiones son solo x86_64.** En equipos ARM64 (Raspberry Pi, Asahi Linux) el Flatpak se instala pero falla al arrancar con `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verifica tu descarga (SHA256)</strong></summary>

Cada versión publica un archivo `SHA256SUMS` junto a los binarios. Para comprobar que tu descarga no está corrompida ni fue manipulada en tránsito, calcula el hash de tu archivo localmente y compáralo con la línea en `SHA256SUMS`. Abre la página de la última versión → **Assets** → descarga `SHA256SUMS`.

**Windows (PowerShell or Command Prompt):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

¿Quieres un análisis de malware de terceros? Sube el archivo en [VirusTotal](https://www.virustotal.com). Un puñado de alertas heurísticas genéricas de motores menores es normal en apps Electron sin firmar; detecciones generalizadas por motores principales serían una preocupación real.

</details>

<details>
<summary><strong>📦 Windows: Instalador vs Portátil</strong></summary>

|               | Instalador NSIS | `.exe` portátil |
| ------------- | :----------------------: | :---------------------: |
| Requiere instalación | Sí  | No — ejecútalo desde donde quieras  |
| Auto-actualizaciones | ✅ en la app  | ❌ descarga manual  |
| Velocidad de inicio | ✅ más rápido  | ⚠️ inicio en frío más lento  |
| Aparece en el menú Inicio |            ✅            |           ❌            |
| Desinstalación fácil |            ✅            | ❌ solo borra el archivo  |

**Recomendación:** usa el instalador NSIS para obtener auto-actualizaciones y un arranque más rápido. Usa el `.exe` portátil si prefieres no instalar ni tocar el registro.

</details>

---

## <a id="why"></a>⚖️ ¿Por qué Arroxy?

Una comparación directa con las alternativas más comunes:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Navegador integrado (navegar, iniciar sesión, descargar) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Vídeos privados, solo para miembros y con restricción de edad sin exportar cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratis, sin nivel premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Código abierto |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Procesamiento 100% local |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Sin límites de uso |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Aplicación de escritorio multiplataforma |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtítulos + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = en parte, o solo en un plan de pago. En 4K Video Downloader, el inicio de sesión dentro de la app para vídeos privados es una función de pago; la mayoría de las GUI gratuitas de yt-dlp solo aceptan un archivo de cookies o leen las cookies de tu navegador web.

Arroxy está diseñado para una sola cosa: un archivo local limpio, tanto si pegas una URL como si encuentras el vídeo en Explore. Sin ventas adicionales, sin recolección de datos.

### <a id="why-explore"></a>🧭 Lo que un simple wrapper de yt-dlp no puede hacer: la pestaña Explore

La mayoría de los descargadores gratuitos de YouTube son una casilla para la URL encima de yt-dlp. Arroxy también usa yt-dlp, pero además tiene **Explore**, un navegador integrado en la app que abre YouTube o cualquier otro sitio. Explore supera límites que una casilla de URL no puede superar:

- **Vídeos que requieren una cuenta, sin exportar cookies** — vídeos privados, solo para miembros y con restricción de edad (con una cuenta con la edad verificada), además de tus listas Ver más tarde y Me gusta, y vídeos tras un inicio de sesión en otros sitios. Un simple wrapper necesita un cookies.txt exportado o tiene que leer las cookies de tu navegador web, algo que Chrome en Windows ahora bloquea. En Arroxy inicias sesión una vez en Explore y él se encarga del resto
- **"Inicia sesión para confirmar que no eres un bot"** — cuando YouTube lo pide, Arroxy vuelve a intentar la descarga con tu inicio de sesión de Explore en lugar de fallar
- **El token de descarga de YouTube** — el navegador integrado de Arroxy obtiene el token que YouTube espera antes de una descarga. Sin él, YouTube puede ofrecer menos formatos y menor calidad de la que pediste
- **Sin copiar enlaces** — encuentra un vídeo, una playlist o un canal en Explore y descárgalo con un clic, o haz clic derecho en cualquier enlace de la página
- **Bloqueador de anuncios cuando quieras** — un clic en el escudo bloquea anuncios y rastreadores en las páginas de Explore

---

## <a id="privacy"></a>🔒 Privacidad

Las descargas se obtienen directamente a través de [yt-dlp](https://github.com/yt-dlp/yt-dlp) desde YouTube hacia la carpeta que elijas — nada pasa por un servidor de terceros. El historial de visualización, el historial de descargas, las URLs y el contenido de los archivos permanecen en tu dispositivo.

Sin telemetría — solo una señal anónima al día: versión de la app, OS, idioma, canal de instalación y país, para poder contar los usuarios activos. Sin IDs, URLs, títulos de video, rutas de archivo ni datos de cuenta. Puedes desactivarla en Configuración.

Explore mantiene su propio inicio de sesión, separado de tu navegador, y Arroxy nunca lee ni rellena el formulario de acceso: escribes en la propia página de Google. Las descargas se hacen sin sesión; solo cuando una falla de una forma que una cuenta puede arreglar, Arroxy lee el inicio de sesión en ese momento, lo guarda en un archivo temporal para esa descarga y borra el archivo después. Cerrar sesión en Explore desde Configuración lo olvida.

---

## <a id="faq"></a>❓ Preguntas frecuentes

<details>
<summary><strong>¿Es realmente gratis?</strong></summary>

Sí — licencia MIT, sin nivel premium, sin funciones bloqueadas.

</details>

<details>
<summary><strong>¿En qué se diferencia Arroxy de otras GUI de yt-dlp?</strong></summary>

La mayoría de las GUI gratuitas de yt-dlp son wrappers que solo aceptan un enlace. Arroxy añade **Explore**, un navegador de YouTube integrado en la app: navegas y descargas sin copiar enlaces, e inicias sesión allí una vez para descargar vídeos privados, solo para miembros y con restricción de edad, y tus listas Ver más tarde y Me gusta, sin exportar cookies. Arroxy usa ese inicio de sesión cuando YouTube te pide confirmar que no eres un bot, y su navegador integrado obtiene el token de descarga de YouTube para que las descargas no se queden con menos formatos. Consulta [¿Por qué Arroxy?](#why).

</details>

<details>
<summary><strong>¿Qué calidades de video puedo descargar?</strong></summary>

Cualquiera que sirva YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, más solo audio. Los streams de 60 fps y HDR se conservan tal cual, y la descarga paso a paso te permite elegir AV1, VP9 o H.264 en cada resolución.

</details>

<details>
<summary><strong>¿Puedo extraer solo el audio como MP3?</strong></summary>

Sí. Elige *solo audio* en el menú de formatos y luego MP3, M4A/AAC, Opus o WAV.

</details>

<details>
<summary><strong>¿Cómo descargo vídeos que necesitan una cuenta de YouTube?</strong></summary>

Inicia sesión una vez en la pestaña Explore. Arroxy podrá entonces descargar vídeos privados y solo para miembros que tu cuenta pueda ver, vídeos con restricción de edad si la cuenta tiene la edad verificada, y tus listas Ver más tarde y Me gusta. Solo usa el inicio de sesión cuando una descarga falla de una forma que una cuenta puede arreglar; todo lo demás se descarga como antes. Es la opción **Inicio de sesión de Explore**, la primera de la lista y marcada como Recomendada en la configuración de cookies, y Arroxy la elige por ti la primera vez que abres Explore. La wiki de yt-dlp señala que [la automatización con sesión iniciada puede marcar una cuenta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), así que una cuenta secundaria es la opción más segura.

</details>

<details>
<summary><strong>¿Seguirá funcionando cuando YouTube cambie algo?</strong></summary>

yt-dlp se actualiza automáticamente al iniciar, y Arroxy publica correcciones rápidamente cuando YouTube cambia algo. Cuando YouTube te pide confirmar que no eres un bot, Arroxy también prueba tu inicio de sesión de Explore si lo has iniciado ahí, y las cookies de un archivo o de tu navegador están disponibles en la configuración de cookies.

</details>

<details>
<summary><strong>¿En qué idiomas está disponible Arroxy?</strong></summary>

31 idiomas, listos para usar: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy detecta automáticamente el idioma de tu sistema operativo en el primer inicio y puedes cambiarlo en cualquier momento desde el selector de idioma de la barra de herramientas. Los JSON de locale en runtime viven en src/shared/i18n/locales/, y los catálogos PO para traductores viven en i18n/locales/ — abre un PR en GitHub para contribuir.

</details>

<details>
<summary><strong>¿Necesito instalar algo más?</strong></summary>

No. yt-dlp, ffmpeg y ffprobe se descargan automáticamente en el primer arranque y se guardan en caché en tu máquina. Después de eso, no se necesita configuración adicional.

</details>

<details>
<summary><strong>¿Puedo descargar listas de reproducción o canales completos?</strong></summary>

Sí — ambas cosas. Pega una URL de playlist o canal (p. ej. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); elige cuántas entradas escanear y luego pon toda la lista en cola o selecciona videos concretos. Los filtros por fecha llegarán pronto.

</details>

<details>
<summary><strong>macOS dice "la aplicación está dañada" — ¿qué hago?</strong></summary>

Es Gatekeeper de macOS bloqueando una app sin firmar, no un daño real. Consulta [macOS first launch](#macos-first-launch) para ver los comandos de Terminal que eliminan la cuarentena e inician Arroxy.

</details>

<details>
<summary><strong>¿Es legal descargar videos de YouTube?</strong></summary>

Para uso personal y privado, generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción.

</details>

---

## <a id="roadmap"></a>🗺️ Hoja de ruta

Todavía planeado — aproximadamente por orden de prioridad:

| Función    | Descripción    |
| ---------------- | ---------------- |
| **Filtros de listas y canales** | Filtros por rango de fechas al enumerar una playlist o un canal |
| **Preferencias de pistas de audio de YouTube** | Define una pista de idioma hablado predeterminada para toda la app, con sobrescrituras por perfil cuando YouTube ofrece varias pistas de audio |
| **Recuperación de reintentos más fuerte** | Una nueva ruta de reintento para descargas interrumpidas por conexiones de internet inestables o problemáticas |
| **Cajón de gestor de descargas completo** | Convertir el cajón de cola en un gestor más completo, incluido cambiar carpetas de destino para elementos en cola |
| **Descargas programadas** | Inicia una cola a una hora fijada (ejecuciones nocturnas) |
| **Paquete AUR** | Instalación en Arch Linux y Omarchy con `yay -S arroxy-bin` |

¿Tienes alguna función en mente? [Abre una solicitud](../../issues) — la opinión de la comunidad guía la prioridad.

---

## <a id="support"></a>💖 Apoyar a Arroxy

Arroxy es gratuito y con licencia MIT: sin anuncios, sin telemetría, sin versión de pago. Si te ahorra tiempo, puedes apoyar el desarrollo con Bitcoin, Tron o Ethereum: las direcciones están en [DONATE.md](DONATE.md), la única fuente oficial para ellas. Arroxy nunca te enviará una dirección por correo electrónico ni por mensaje directo. Dar una estrella al repositorio, informar de errores y mejorar las traducciones ayudan igual de mucho.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Construido con

<details>
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
| Node.js     | 24.21.0  | `mise install` o `.node-version` |
| Bun         | 1.4.2   | `mise install` o `package.json` `packageManager` |

Recomendado: instala `mise` y luego ejecuta `mise install` en el checkout. Sin mise, activa manualmente Node.js desde `.node-version` y Bun desde `package.json` antes de `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools y Python pueden ser necesarios para recompilaciones nativas.

### macOS

```bash
brew install mise
xcode-select --install
```

Después de clonar, ejecuta `mise trust && mise install` desde el checkout. Si tu shell ya usa `fnm`, `nvm` o Bun instalado con Homebrew, activa mise en `~/.zshrc` para que Arroxy use Node.js 24.21.0 y Bun 1.4.2:

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Dependencias de build y runtime de Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Clonar y ejecutar

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recomendado; omite si activaste manualmente las herramientas fijadas
bun run bootstrap
bun run doctor
bun run dev            # app Electron contra el renderer de Vite
```

### Crear un distribuible

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # empaqueta objetivos Windows en un host compatible
```

> `bun run bootstrap` instala dependencias, recompila dependencias de la app Electron, verifica Electron, prepara ffmpeg/ffprobe embebidos para desarrollo e instala Playwright Chromium. Las builds de release gestionan yt-dlp, ffmpeg y ffprobe en runtime dentro de la carpeta de datos de la app; ninguno viene incluido en el instalador.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\Arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/Arroxy/main.log` |
| Linux    | `~/.config/Arroxy/logs/main.log` |

**2. Launch with hardware acceleration disabled.** Open a terminal / Command Prompt and run the executable with a flag:

```bash
# Windows (Portable) — PowerShell, run from the folder containing the exe
.\Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-linux-x64.AppImage --disable-gpu
```

If that works, the GPU/driver is the cause. Make the change permanent (next step).

**3. Persist the flag via `argv.json`.** Create the file at:

| Platform | Path                                             |
| -------- | ------------------------------------------------ |
| Windows  | `%APPDATA%\Arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/Arroxy/argv.json` |
| Linux    | `~/.config/Arroxy/argv.json`                     |

With contents:

```json
{ "disable-hardware-acceleration": true }
```

Arroxy reads this before opening any window, so it works even when the window never appeared.

**4. Other flags worth trying** (combine if needed): `--disable-software-rasterizer`, `--disable-gpu-sandbox`, `--in-process-gpu`.

**5. Stale window position.** If the window may be opening off-screen (multi-monitor change since last run), delete `<userData>\window-state.json` and relaunch.

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

</details>

---

## 📜 Términos de uso

Arroxy es una herramienta para uso personal y privado únicamente. Eres el único responsable de garantizar que tus descargas cumplan con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción. No uses Arroxy para descargar, reproducir o distribuir contenido sobre el que no tengas derechos. Los desarrolladores no se hacen responsables del mal uso.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Licencia MIT · Hecho con cariño por <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
