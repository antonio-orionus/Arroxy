<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascota de Arroxy" width="180" />

# Arroxy — Descargador gratuito de YouTube de código abierto para Windows, macOS y Linux

**4K · 1080p60 · HDR · MP3 · Shorts · Subtitles · SponsorBlock**

**Leer en:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · **Español** · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Versión](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Compilación](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Sitio web](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Licencia](https://img.shields.io/badge/license-MIT-green) ![Plataformas](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Idiomas](https://img.shields.io/badge/i18n-21_languages-blue)

Descarga cualquier video, Short o pista de audio de YouTube en calidad original — hasta 4K HDR a 60 fps, o como MP3 / AAC / Opus. Se ejecuta localmente en Windows, macOS y Linux. **Sin anuncios, sin inicio de sesión, sin cookies del navegador, sin cuenta de Google vinculada.**

[**↓ Descargar la última versión**](../../releases/latest) &nbsp;·&nbsp; [**Sitio web**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Demo de Arroxy" width="720" />

Si Arroxy te ahorra tiempo, una ⭐ ayuda a que otros lo encuentren.

</div>

> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).

---

## Contenido

- [¿Por qué Arroxy?](#why)
- [Sin cookies, sin inicio de sesión, sin cuenta vinculada](#no-cookies)
- [Características](#features)
- [Descargar](#download)
- [Privacidad](#privacy)
- [Preguntas frecuentes](#faq)
- [Hoja de ruta](#roadmap)
- [Construido con](#tech)

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

## <a id="no-cookies"></a>Sin cookies, sin inicio de sesión, sin cuenta vinculada

Esta es la razón más común por la que los descargadores de YouTube de escritorio fallan — y la razón principal por la que existe Arroxy.

Cuando YouTube actualiza su detección de bots, la mayoría de las herramientas te piden que exportes las cookies de YouTube de tu navegador como solución alternativa. Dos problemas con eso:

1. Las sesiones exportadas suelen caducar en ~30 minutos, por lo que tienes que reexportarlas constantemente.
2. La propia documentación de yt-dlp [advierte que la automatización basada en cookies puede marcar tu cuenta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).

**Arroxy nunca solicita cookies, inicio de sesión ni ninguna credencial.** Usa solo los tokens públicos que YouTube sirve a cualquier navegador. Nada vinculado a tu identidad de Google, nada que caduque, nada que rotar.

---

## <a id="features"></a>Características

### Calidad y formatos

- Hasta **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Alta frecuencia de fotogramas** conservada tal cual — 60 fps, 120 fps, HDR
- Exportación de **solo audio** a MP3, AAC u Opus
- Presets rápidos: *Mejor calidad* · *Equilibrado* · *Archivo pequeño*

### Privacidad y control

- Procesamiento 100% local — las descargas van directamente de YouTube a tu disco
- Sin inicio de sesión, sin cookies, sin cuenta de Google vinculada
- Archivos guardados directamente en la carpeta que elijas

### Flujo de trabajo

- **Pega cualquier URL de YouTube** — videos y Shorts compatibles
- **Cola de múltiples descargas** — sigue varias descargas en paralelo
- **Monitoreo del portapapeles** — copia un enlace de YouTube y Arroxy rellena automáticamente la URL al volver a enfocar la app (actívalo en la Configuración avanzada)
- **Limpieza automática de URLs** — elimina parámetros de seguimiento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) y desempaqueta los enlaces `youtube.com/redirect`
- **Modo bandeja** — cerrar la ventana mantiene las descargas en segundo plano
- **9 idiomas** — detecta automáticamente el idioma del sistema, se puede cambiar en cualquier momento

### Subtítulos y posprocesamiento

- **Subtítulos** en SRT, VTT o ASS — manuales o generados automáticamente, en cualquier idioma disponible
- Guárdalos junto al video, incrústalos en `.mkv` u organízalos en una subcarpeta `Subtitles/`
- **SponsorBlock** — omite o marca como capítulos patrocinadores, intros, outros y autopromociones
- **Metadatos incrustados** — título, fecha de subida, canal, descripción, miniatura y marcadores de capítulo escritos en el archivo

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

## <a id="download"></a>Descargar

| Plataforma | Formato   |
| ------------------- | ------------------- |
| Windows             | Instalador (NSIS) o `.exe` portátil   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` o `.flatpak` (sandboxed) |

[**Obtén la última versión →**](../../releases/latest)

### Instalar mediante gestor de paquetes

| Canal | Comando                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |

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

<details>
<summary><strong>Primer arranque en macOS</strong></summary>

Arroxy aún no está firmado con código, por lo que Gatekeeper de macOS mostrará una advertencia en el primer arranque. Esto es esperado — no indica ningún daño.

**Método de Configuración del Sistema (recomendado):**

1. Haz clic derecho en el ícono de Arroxy y selecciona **Abrir**.
2. Aparecerá el cuadro de advertencia — haz clic en **Cancelar** (no en *Mover a la papelera*).
3. Abre **Configuración del Sistema → Privacidad y seguridad**.
4. Baja hasta la sección **Seguridad**. Verás _"Arroxy fue bloqueado porque no es de un desarrollador identificado."_
5. Haz clic en **Abrir igualmente** y confirma con tu contraseña o Touch ID.

Después del paso 5, Arroxy se abre con normalidad y la advertencia no vuelve a aparecer.

**Método por Terminal (avanzado):**

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

> Las compilaciones de macOS se producen mediante CI en runners de Apple Silicon e Intel. Si encuentras algún problema, por favor [abre un issue](../../issues) — los comentarios de usuarios de macOS influyen activamente en el ciclo de pruebas de macOS.

</details>

<details>
<summary><strong>Primer arranque en Linux</strong></summary>

Los AppImages se ejecutan directamente — sin instalación. Solo necesitas marcar el archivo como ejecutable.

**Gestor de archivos:** haz clic derecho en el `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir ejecutar el archivo como programa**, luego doble clic.

**Terminal:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
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

**Flatpak (alternativa con sandbox):** descarga `Arroxy-*.flatpak` desde la misma página de release.

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

</details>

---

## <a id="privacy"></a>Privacidad

Las descargas se obtienen directamente a través de [yt-dlp](https://github.com/yt-dlp/yt-dlp) desde YouTube hacia la carpeta que elijas — nada pasa por un servidor de terceros. El historial de visualización, el historial de descargas, las URLs y el contenido de los archivos permanecen en tu dispositivo.

Arroxy envía telemetría anónima y agregada a través de [Aptabase](https://aptabase.com) — lo justo para que un proyecto independiente vea si alguien lo usa realmente (arranques, SO, versión de la app, fallos). Sin URLs, sin títulos de video, sin rutas de archivo, sin IPs, sin información de cuenta — Aptabase es de código abierto y compatible con GDPR por diseño. Puedes desactivarlo en Configuración.

---

## <a id="faq"></a>Preguntas frecuentes

**¿Es realmente gratis?**
Sí — licencia MIT, sin nivel premium, sin funciones bloqueadas.

**¿Qué calidades de video puedo descargar?**
Cualquiera que sirva YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, más solo audio. Los streams de 60 fps, 120 fps y HDR se conservan tal cual.

**¿Puedo extraer solo el audio como MP3?**
Sí. Elige *solo audio* en el menú de formato y selecciona MP3, AAC u Opus.

**¿Necesito una cuenta de YouTube o cookies?**
No. Arroxy usa solo los tokens públicos que YouTube sirve a cualquier navegador. Sin cookies, sin inicio de sesión, sin credenciales almacenadas. Consulta [Sin cookies, sin inicio de sesión, sin cuenta vinculada](#no-cookies) para entender por qué es importante.

**¿Seguirá funcionando cuando YouTube cambie algo?**
Dos capas de resiliencia: yt-dlp se actualiza en horas tras los cambios de YouTube, y Arroxy no depende de cookies que caducan cada ~30 minutos. Eso lo hace notablemente más estable que las herramientas que dependen de sesiones de navegador exportadas.

**¿En qué idiomas está disponible Arroxy?**
Nueve: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Detecta automáticamente el idioma del sistema; cámbialo en cualquier momento desde la barra de herramientas. Los archivos de idioma son objetos TypeScript planos en `src/shared/i18n/locales/` — [las PRs son bienvenidas](../../pulls).

**¿Necesito instalar algo más?**
No. yt-dlp y ffmpeg se descargan automáticamente en el primer arranque desde sus releases oficiales en GitHub y se guardan en caché localmente.

**¿Puedo descargar listas de reproducción o canales completos?**
Hoy se admiten videos individuales y Shorts. El soporte de listas y canales está en la [hoja de ruta](#roadmap).

**macOS dice "la aplicación está dañada" — ¿qué hago?**
Es Gatekeeper de macOS bloqueando una app sin firmar — no es un daño real. Consulta la sección de [primer arranque en macOS](#download) para la solución.

**¿Es legal descargar videos de YouTube?**
Para uso personal y privado, generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción.

---

## <a id="roadmap"></a>Hoja de ruta

Próximamente — aproximadamente por orden de prioridad:

| Función    | Descripción    |
| ---------------- | ---------------- |
| **Descarga de listas y canales** | Pega la URL de una lista o canal; encola todos los videos con filtros por fecha o cantidad |
| **Entrada de URLs por lotes** | Pega varias URLs a la vez y lánzalas todas juntas |
| **Conversión de formato** | Convierte descargas a MP3, WAV, FLAC sin necesitar otra herramienta |
| **Plantillas de nombre de archivo personalizadas** | Nombra archivos por título, autor, fecha, resolución — con vista previa en vivo |
| **Descargas programadas** | Inicia una cola a una hora fijada (ejecuciones nocturnas) |
| **Límites de velocidad** | Limita el ancho de banda para que las descargas no saturen tu conexión |
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

> yt-dlp y ffmpeg no están incluidos — se descargan de GitHub en el primer arranque y se guardan en caché en tu carpeta de datos de la aplicación.

</details>

---

## Términos de uso

Arroxy es una herramienta para uso personal y privado únicamente. Eres el único responsable de garantizar que tus descargas cumplan con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción. No uses Arroxy para descargar, reproducir o distribuir contenido sobre el que no tengas derechos. Los desarrolladores no se hacen responsables del mal uso.

<div align="center">
  <sub>Licencia MIT · Hecho con cariño por <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
