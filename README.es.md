<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascota de Arroxy" width="180" />

# Arroxy — Descargador gratuito de YouTube (+ 2000 sitios) de código abierto para Windows, macOS y Linux

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Leer en:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · **Español** · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Versión](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Compilación](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Sitio web](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Licencia](https://img.shields.io/badge/license-MIT-green) ![Plataformas](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Idiomas](https://img.shields.io/badge/i18n-21_languages-blue)

Descarga videos, Shorts, música, canales, podcasts o pistas de audio de **YouTube y más de 2000 sitios compatibles** — hasta 4K HDR a 60 fps, o como MP3 / AAC / Opus. Se ejecuta localmente en Windows, macOS y Linux. **Sin anuncios, sin bloatware, sin ventas adicionales.**

[**↓ Descargar la última versión**](#install) &nbsp;·&nbsp; [**Sitio web**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#install) · [macOS](#install) · [Linux](#install)

<img src="build/demo.gif" alt="Demo de Arroxy" width="720" />

Si Arroxy te ahorra tiempo, una ⭐ ayuda a que otros lo encuentren.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).

---

## Contenido

- [Descargar](#install)
- [¿Por qué Arroxy?](#why)
- [Características](#features)
- [Privacidad](#privacy)
- [Preguntas frecuentes](#faq)
- [Hoja de ruta](#roadmap)
- [Construido con](#tech)

---

## <a id="install"></a>Descargar

| Plataforma | Formato |
| ------------------- | ----------------- |
| 🪟 Windows          | [Instalador NSIS](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) · [`.exe` portátil](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| 🍎 macOS            | [arm64 `.dmg`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) · [x64 `.dmg`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| 🐧 Linux            | [AppImage](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) · [Flatpak](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) · [`tar.gz`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| 🔐 SHA256           | [SHA256SUMS](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Obtén la última versión →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="why-warning"></a>Por qué puedes ver una advertencia

Arroxy es de código abierto y con licencia MIT. Las compilaciones de Windows y macOS **no están firmadas digitalmente** — los certificados Apple Developer ID y Windows EV de firma de código cuestan cada uno cientos de dólares al año, que un proyecto independiente paga de su bolsillo. Sin esas firmas, Windows SmartScreen y macOS Gatekeeper te advertirán en el primer arranque. Las advertencias significan *tu sistema operativo no reconoce al editor* — no significan que Arroxy sea malware.

Tres formas de verificar Arroxy tú mismo, en orden creciente de rigor:

- **Lee el código fuente.** Cada línea está en [GitHub](https://github.com/antonio-orionus/Arroxy) y puedes [compilarlo desde el código fuente](#tech).
- **Comprueba el SHA256.** Compara tu archivo con el [`SHA256SUMS`](../../releases/latest) publicado — consulta [Verifica tu descarga](#verify) a continuación.
- **Realiza un análisis de terceros.** Sube el archivo a [VirusTotal](https://www.virustotal.com).

### <a id="windows-first-launch"></a>Primer arranque en Windows

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

### <a id="macos-first-launch"></a>Primer arranque en macOS

Arroxy aún no está firmado digitalmente para macOS, así que Gatekeeper bloqueará el primer arranque. La ruta exacta para permitirlo depende de tu versión de macOS — Sequoia 15 endureció el antiguo método de saltarse Gatekeeper con clic derecho → Abrir.

#### macOS Sequoia 15 y posterior (actual)

En Sequoia 15 y versiones más nuevas, clic derecho → Abrir ya no sortea Gatekeeper para muchas apps en cuarentena. Usa el panel de Configuración del Sistema:

1. Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.
2. Haz doble clic en Arroxy. Aparece el diálogo de bloqueo — haz clic en **Done** (no hagas clic en *Move to Trash*).
3. Abre **System Settings → Privacy & Security** y desplázate hasta la sección **Security**. Verás *"Arroxy was blocked to protect your Mac"* (o un mensaje casi idéntico).
4. Haz clic en **Open Anyway**, confirma con tu contraseña o Touch ID, y vuelve a iniciar Arroxy desde `/Applications`.

#### macOS Sonoma 14 y anterior

1. Arrastra `Arroxy.app` desde el DMG montado a `/Applications`.
2. Haz clic derecho (o Control-clic) en `Arroxy.app` en `/Applications` y elige **Open**.
3. El diálogo de advertencia ahora tiene un botón **Open** — haz clic en él y confirma. Arroxy se abre con normalidad y la advertencia no vuelve a aparecer.

#### "App is damaged" o bloqueo persistente de Gatekeeper — solución con Terminal

Si macOS dice *"Arroxy is damaged and can't be opened"*, o ninguno de los pasos anteriores elimina el bloqueo, el atributo de cuarentena del DMG es la causa (algunos navegadores y el propio comportamiento de translación de macOS lo establecen). Elimínalo de la app instalada:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel:** en un Mac de la serie M (M1 / M2 / M3 / M4), descarga el DMG `arm64`. En Macs Intel, descarga el DMG `x64`. El build incorrecto funciona igualmente mediante Rosetta, pero es notablemente más lento.

> Las compilaciones de macOS se producen mediante CI en runners de Apple Silicon e Intel. Si encuentras algún problema, por favor [abre un issue](../../issues) — los comentarios de usuarios de macOS influyen activamente en el ciclo de pruebas de macOS.

### <a id="linux-first-launch"></a>Primer arranque en Linux

Los AppImages se ejecutan directamente — sin instalación. Solo necesitas marcar el archivo como ejecutable.

**Gestor de archivos:** haz clic derecho en el `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir ejecutar el archivo como programa**, luego doble clic.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Si el arranque sigue fallando, puede que te falte FUSE:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Integración de escritorio opcional:** instala [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) una sola vez, y cualquier AppImage en la que hagas doble clic quedará registrada automáticamente en tu menú de aplicaciones — sin necesidad de crear manualmente un archivo `.desktop`.

**Flatpak (alternativa con sandbox):** descarga `Arroxy-*.flatpak` desde la misma página de release.

```bash
flatpak install --user Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>Verifica tu descarga (SHA256)</strong></summary>

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
<summary><strong>Instalar mediante gestor de paquetes</strong></summary>

¿Ya usas un gestor de paquetes? Puedes saltarte la descarga manual.

| Canal | Comando                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-linux-x64.flatpak`                                                 |

</details>

<details>
<summary><strong>Windows: Instalador vs Portátil</strong></summary>

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

## <a id="why"></a>¿Por qué Arroxy?

Una comparación directa con las alternativas más comunes:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Gratis, sin nivel premium |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Código abierto |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Procesamiento 100% local |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Sin inicio de sesión ni exportación de cookies |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Sin límites de uso |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Aplicación de escritorio multiplataforma |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtítulos + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy está diseñado para una sola cosa: pega una URL y obtén un archivo local limpio. Sin cuentas, sin ventas adicionales, sin recolección de datos.

---

## <a id="features"></a>Características

### Calidad y formatos

- Hasta **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Alta frecuencia de fotogramas** conservada tal cual — 60 fps, 120 fps, HDR
- **Solo audio** a MP3, M4A/AAC, Opus o WAV
- Presets rápidos: *Mejor calidad* · *Equilibrado* · *Archivo pequeño*

### Privacidad y control

- Procesamiento 100% local — las descargas van directamente de YouTube a tu disco
- Sin inicio de sesión, sin cookies, sin cuenta de Google vinculada
- Archivos guardados directamente en la carpeta que elijas

### Flujo de trabajo

- **Modos de inicio flexibles** — elige una descarga individual guiada, selector de playlist/canal, pegado masivo de URLs o Quick Download con tus valores guardados
- **Cola central de descargas** — cada trabajo individual, de playlist, masivo o rápido llega a un solo lugar para ver progreso, pausar, reanudar, cancelar, reintentar y controlar prioridad
- **Monitoreo del portapapeles** — copia un enlace de YouTube y Arroxy rellena automáticamente la URL al volver a enfocar la app (actívalo en la Configuración avanzada)
- **Limpieza automática de URLs** — elimina parámetros de seguimiento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) y desempaqueta los enlaces `youtube.com/redirect`
- **Modo bandeja** — cerrar la ventana mantiene las descargas en segundo plano
- **21 idiomas** — detecta automáticamente el idioma del sistema, se puede cambiar en cualquier momento
- **Sincronización de playlists** — vuelve a escanear una playlist contra una carpeta local para omitir vídeos ya descargados; genera un archivo de playlist `.m3u` que se actualiza con cada vídeo descargado
- **Controles de velocidad y ritmo** — limita el ancho de banda de descarga, añade pausas entre solicitudes y ajusta los hilos de fragmentos con presets (*Desactivado · Equilibrado · Cuidadoso · Personalizado*)

### Subtítulos y posprocesamiento

- **Subtítulos** en SRT, VTT o ASS — manuales o generados automáticamente, en cualquier idioma disponible
- Guárdalos junto al video, incrústalos en `.mkv` u organízalos en una subcarpeta `Subtitles/`
- **SponsorBlock** — omite o marca como capítulos patrocinadores, intros, outros y autopromociones
- **Metadatos incrustados** — título, fecha de subida, canal, descripción, miniatura y marcadores de capítulo escritos en el archivo

### YouTube + 2000 sitios

- **YouTube, al completo** — Videos, Shorts, Canales, Playlists, YouTube Music y Podcasts tratados como fuentes de primera clase
- **Más de 2000 sitios adicionales** via yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org y muchos más
- **Solo audio y subtítulos** funcionan en todos los sitios compatibles, no solo en YouTube
- Si un sitio cambia, yt-dlp publica correcciones semanalmente y Arroxy actualiza el binario automáticamente al iniciar

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Pega una URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Elige la calidad" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Elige dónde guardar" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Cola de descargas en acción" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Selector de idioma y formato de subtítulos" />
</div>

---

## <a id="privacy"></a>Privacidad

Las descargas se obtienen directamente a través de [yt-dlp](https://github.com/yt-dlp/yt-dlp) desde YouTube hacia la carpeta que elijas — nada pasa por un servidor de terceros. El historial de visualización, el historial de descargas, las URLs y el contenido de los archivos permanecen en tu dispositivo.

Arroxy envía telemetría anónima y agregada a través de [OpenPanel](https://openpanel.dev) — lo justo para entender arranques, OS, versiones de la app y fallos. Sin URLs, títulos de video, rutas de archivo, datos de cuenta, fingerprinting ni datos personales. El ID por instalación es aleatorio y no está ligado a tu identidad. Puedes desactivarlo en Configuración.

---

## <a id="faq"></a>Preguntas frecuentes

**¿Es realmente gratis?**
Sí — licencia MIT, sin nivel premium, sin funciones bloqueadas.

**¿Qué calidades de video puedo descargar?**
Cualquiera que sirva YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, más solo audio. Los streams de 60 fps, 120 fps y HDR se conservan tal cual.

**¿Puedo extraer solo el audio como MP3?**
Sí. Elige *solo audio* en el menú de formatos y luego MP3, M4A/AAC, Opus o WAV.

**¿Necesito una cuenta de YouTube o cookies?**
Por defecto, no — Arroxy funciona sin cuenta de YouTube, sin inicio de sesión y sin exportación de cookies. Hay soporte opcional de cookies disponible en la configuración avanzada (Origen de cookies: archivo o navegador) para contenido que requiere autenticación, como videos con restricción de edad o solo para miembros. Está desactivado por defecto. Si lo activas, la wiki de yt-dlp señala que [la automatización basada en cookies puede marcar una cuenta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); en ese caso, una cuenta desechable es la opción más segura.

**¿Seguirá funcionando cuando YouTube cambie algo?**
yt-dlp se actualiza automáticamente al iniciar, y Arroxy publica correcciones rápidamente cuando YouTube cambia algo. Si alguna vez tienes algún problema, hay soporte opcional de cookies disponible en la configuración avanzada como alternativa.

**¿En qué idiomas está disponible Arroxy?**
Veintiuno, listos para usar: English, Español, Deutsch (alemán), Français (francés), 日本語 (japonés), 中文 (chino), Русский (ruso), Українська (ucraniano), हिन्दी (hindi), Afaan Oromoo, Kiswahili, O'zbekcha (uzbeko), Tiếng Việt (vietnamita), አማርኛ (amhárico), العربية (árabe), اردو (urdu), پښتو (pastún), বাংলা (bengalí), မြန်မာဘာသာ (birmano), Ελληνικά (griego) y Српски (serbio). Arroxy detecta el idioma de tu sistema operativo en el primer arranque y puedes cambiarlo en cualquier momento desde el selector de idioma en la barra de herramientas. Las traducciones viven como objetos TypeScript planos en src/shared/i18n/locales/ — abre un PR en GitHub para contribuir.

**¿Necesito instalar algo más?**
No. yt-dlp se descarga automáticamente en el primer arranque y se guarda en caché en tu máquina; ffmpeg y ffprobe vienen incluidos con la app. Después de eso, no se necesita configuración adicional.

**¿Puedo descargar listas de reproducción o canales completos?**
Sí — ambas cosas. Pega una URL de playlist o canal (p. ej. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); elige cuántas entradas escanear y luego pon toda la lista en cola o selecciona videos concretos. Los filtros por fecha llegarán pronto.

**macOS dice "la aplicación está dañada" — ¿qué hago?**
Es Gatekeeper de macOS bloqueando una app sin firmar, no un daño real. Consulta ["App is damaged" — solución con Terminal](#macos-first-launch) para el comando `xattr` de una sola línea que lo resuelve.

**¿Es legal descargar videos de YouTube?**
Para uso personal y privado, generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción.

---

## <a id="roadmap"></a>Hoja de ruta

Todavía planeado — aproximadamente por orden de prioridad:

| Función    | Descripción    |
| ---------------- | ---------------- |
| **Filtros de listas y canales** | Filtros por rango de fechas al enumerar una playlist o un canal |
| **Plantillas de nombre de archivo personalizadas** | Nombra archivos por título, autor, fecha, resolución — con vista previa en vivo |
| **Descargas programadas** | Inicia una cola a una hora fijada (ejecuciones nocturnas) |
| **Recorte de clips** | Descarga solo un segmento especificando tiempo de inicio y fin |

¿Tienes alguna función en mente? [Abre una solicitud](../../issues) — la opinión de la comunidad guía la prioridad.

---

## <a id="tech"></a>Construido con

<details>
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

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

No se requieren herramientas de compilación nativas — el proyecto no tiene addons nativos de Node.

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Clonar y ejecutar

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
```

### Crear un distribuible

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # cross-compile Windows portable exe
```

> yt-dlp se obtiene desde GitHub en el primer arranque y se guarda en la carpeta de datos de la app. ffmpeg y ffprobe vienen incluidos en cada release de Arroxy.

</details>

---

## <a id="troubleshooting"></a>Troubleshooting

### App won't open / no window appears

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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## Términos de uso

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
