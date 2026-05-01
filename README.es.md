<!-- translated from README.md as of 2026-04-27 -->

<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascota de Arroxy" width="180" />

# Arroxy — Descargador gratuito de YouTube de código abierto

**Leer en:** [English](README.md) · **Español** · [Deutsch](README.de.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [हिन्दी](README.hi.md)

[![Versión](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Compilación](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) ![Último commit](https://img.shields.io/github/last-commit/antonio-orionus/Arroxy?label=Last%20commit&color=informational) ![Plataformas](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Idiomas](https://img.shields.io/badge/i18n-9_idiomas-blue) ![Licencia](https://img.shields.io/badge/licencia-MIT-green) [![Scoop](https://img.shields.io/scoop/v/arroxy?bucket=https%3A%2F%2Fgithub.com%2Fantonio-orionus%2Fscoop-bucket&label=Scoop&color=blue)](https://github.com/antonio-orionus/scoop-bucket) [![Homebrew](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Homebrew&color=orange)](https://github.com/antonio-orionus/homebrew-arroxy)

**4K &nbsp;•&nbsp; 1080p60 &nbsp;•&nbsp; HDR &nbsp;•&nbsp; Shorts &nbsp;·&nbsp; Windows &nbsp;•&nbsp; macOS &nbsp;•&nbsp; Linux**

**¿Cansado de los anuncios de YouTube que arruinan tus videos?**
Descarga cualquier video o Short en máxima calidad — 4K, 1080p60, HDR y más. Rápido, gratis y 100% tuyo.

Sin anuncios. Sin rastreo. Sin cookies. Sin inicio de sesión. Sin tonterías.

[**Última versión →**](../../releases/latest) &nbsp;·&nbsp; [Windows](#descargar) · [macOS](#descargar) · [Linux](#descargar)

<img src="build/demo.gif" alt="Demo de Arroxy" width="720" />

</div>

> 🌐 Esta es una traducción asistida por IA. El [README en inglés](README.md) es la fuente de verdad. ¿Encontraste un error? [Las PRs son bienvenidas](../../pulls).

---

## ¿Por qué Arroxy?

|                                          | Arroxy | Extensiones del navegador | Conversores en línea | Otros descargadores |
| ---------------------------------------- | ------ | ------------------------- | -------------------- | ------------------- |
| Gratis para siempre                      | ✅     | ⚠️                        | ⚠️                   | ✅                  |
| Sin anuncios                             | ✅     | ⚠️                        | ❌                   | ✅                  |
| No requiere cuenta                       | ✅     | ✅                        | ⚠️                   | ⚠️                  |
| Funciona sin conexión _(más o menos)_    | ✅     | ❌                        | ❌                   | ✅                  |
| Tus archivos se quedan en tu equipo      | ✅     | ✅                        | ❌                   | ✅                  |
| Sin límites de uso                       | ✅     | ⚠️                        | 🚫                   | ✅                  |
| Código abierto                           | ✅     | ⚠️                        | ❌                   | ⚠️                  |
| Nunca pide login ni cookies              | ✅     | ✅                        | ⚠️                   | ⚠️                  |
| Cero riesgo de baneo de cuenta de Google | ✅     | ✅                        | ⚠️                   | ⚠️                  |

> _"Funciona sin conexión" significa que ninguna conversión ocurre en el servidor de otra persona — toda la cadena se ejecuta en tu máquina. Aún necesitas internet para llegar a YouTube. Sí, lo sabemos._

> **Por qué importa:** La mayoría de los descargadores de escritorio para YouTube terminan pidiéndote que exportes las cookies de tu navegador cada vez que YouTube actualiza su detección de bots. Esas sesiones expiran cada ~30 minutos — y la propia documentación de yt-dlp advierte que la automatización basada en cookies puede provocar el baneo de tu cuenta de Google. Arroxy nunca te pide cookies, login ni credenciales. Solicita los mismos tokens que YouTube emite a cualquier navegador real — cero riesgo para tu cuenta, sin caducidad.

Arroxy es una aplicación de escritorio **gratuita, de código abierto y centrada en la privacidad** — pensada para quienes quieren simplicidad sin sobrecarga. Tus descargas nunca pasan por un servidor de terceros. Cero telemetría, cero recolección de datos. Solo pega una URL y listo.

---

## Qué hace

- **Pega cualquier URL de YouTube** — videos, Shorts, lo que sea — Arroxy obtiene todos los formatos disponibles en segundos
- **Elige tu calidad** — hasta 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps y mayores tasas de fotogramas, solo audio (MP3/AAC/Opus), o usa un preset rápido (Mejor calidad / Equilibrado / Archivo pequeño)
- **Soporte completo de alto frame rate** — los streams de 60 fps, 120 fps y HDR se conservan exactamente como YouTube los codifica
- **Elige dónde guardar** — recuerda la última carpeta, o elige una nueva cada vez
- **Un clic para descargar** — barra de progreso en tiempo real, cancela cuando quieras
- **Cola de varios videos** — el panel de descargas lo lleva todo a la vez
- **Descargar subtítulos** — obtén subtítulos manuales o automáticos en SRT, VTT o ASS, en cualquier idioma disponible. Guárdalos junto al video, intégralos en un `.mkv` portátil, u organízalos en una subcarpeta `Subtitles/` dedicada
- **Integración con SponsorBlock** — omite o marca segmentos de patrocinadores, intros, outros, autopromociones y más. Márcalos como capítulos (no destructivo) o elimínalos por completo con FFmpeg — tú decides, por categoría
- **Disponible en 9 idiomas** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — detecta el idioma de tu sistema y se puede cambiar en cualquier momento

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Pega una URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Elige la calidad" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Elige dónde guardar" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Cola de descargas en acción" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Elige idiomas, formato y modo de guardado de subtítulos" />
</div>

---

## Funciones planeadas

Cosas en la hoja de ruta — aún no lanzadas, aproximadamente por orden de prioridad.

| Función                              | Descripción                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Descarga de listas y canales**     | Pega la URL de una lista o canal y encola todos los videos de una vez, con filtros por fecha o cantidad    |
| **Entrada de URLs por lotes**        | Pega varias URLs a la vez y lánzalas todas juntas                                                          |
| **Conversión de formato**            | Convierte descargas a MP3, WAV, FLAC u otros formatos sin necesitar otra herramienta                       |
| **Plantillas de nombre de archivo**  | Nombra archivos por título, autor, fecha, resolución o cualquier combinación — con vista previa en vivo    |
| **Descargas programadas**            | Define una hora para que Arroxy comience a descargar — útil para colas grandes durante la noche            |
| **Límites de velocidad de descarga** | Limita el ancho de banda para que las descargas no saturen tu conexión mientras trabajas                   |
| **Recorte de clips**                 | Especifica un tiempo de inicio y fin para descargar solo un segmento de un video                           |

> ¿Tienes una idea que no está aquí? [Abre una solicitud](../../issues) — la opinión de la comunidad guía lo que se construye después.

---

## Descargar

> Arroxy está en desarrollo activo. Consigue la última versión en la página de [Releases](../../releases).

| Plataforma | Formato                                |
| ---------- | -------------------------------------- |
| Windows    | Instalador (NSIS) o `.exe` portátil    |
| macOS      | `.dmg` (Intel + Apple Silicon)         |
| Linux      | `.AppImage`                            |

Solo descarga, ejecuta, listo.

### Instalar mediante gestor de paquetes

| Canal    | Comando                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------- |
| Winget   | `winget install AntonioOrionus.Arroxy` (o `winget install arroxy`)                                   |
| Scoop    | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`    |
| Homebrew | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                      |

### Windows: Instalador vs Portátil

Hay dos compilaciones disponibles — elige la que mejor te sirva:

|                          | Instalador NSIS | `.exe` portátil           |
| ------------------------ | --------------- | ------------------------- |
| Requiere instalación     | Sí              | No — ejecútalo desde donde quieras |
| Auto-actualizaciones     | ✅ en la app     | ❌ descarga manual         |
| Velocidad de inicio      | ✅ más rápido    | ⚠️ inicio en frío más lento |
| Aparece en el menú Inicio| ✅              | ❌                        |
| Desinstalación fácil     | ✅              | ❌ solo borra el archivo  |

**Recomendación:** usa el instalador NSIS si quieres que Arroxy se actualice solo y arranque más rápido. Usa el `.exe` portátil si prefieres no instalar y no tocar el registro.

### Primer arranque en macOS

> **Nota:** No tengo un Mac, así que la versión de macOS no la he probado personalmente. Si algo no funciona — la app no abre, el `.dmg` está roto, el bypass de cuarentena falla — por favor [abre un issue](../../issues) y avísame. Cualquier comentario de usuarios de macOS se agradece de verdad.

Arroxy aún no está firmado con código. macOS mostrará una advertencia de seguridad la primera vez que lo abras — esto es esperado, no significa que esté dañado.

**Método 1: Configuración del Sistema (recomendado)**

| Paso | Acción                                                                                                                                |
| :--: | ------------------------------------------------------------------------------------------------------------------------------------- |
|  1   | Haz clic derecho en el ícono de Arroxy y elige **Abrir**.                                                                             |
|  2   | Aparecerá un cuadro de advertencia. Haz clic en **Cancelar** (no en "Mover a la papelera").                                           |
|  3   | Abre **Configuración del Sistema → Privacidad y seguridad**.                                                                          |
|  4   | Baja hasta la sección **Seguridad** — verás _"Arroxy fue bloqueado porque no es de un desarrollador identificado."_                   |
|  5   | Haz clic en **Abrir igualmente**, luego confirma con tu contraseña o Touch ID.                                                        |

Después del paso 5, Arroxy abre normalmente y nunca volverá a mostrar la advertencia.

**Método 2: Terminal (avanzado)**

Si lo anterior no funciona, ejecuta esto una sola vez después de arrastrar Arroxy a Aplicaciones:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

### Primer arranque en Linux

Los AppImages no se instalan — se ejecutan directamente. Solo necesitas marcar el archivo como ejecutable primero.

**Método 1: Gestor de archivos**

Clic derecho en el `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir ejecutar el archivo como programa**, luego doble clic para ejecutarlo.

**Método 2: Terminal**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

Si aún no arranca, puede que te falte FUSE (lo necesita AppImage):

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

---

## Privacidad

Arroxy se ejecuta enteramente en tu máquina. Cuando descargas un video:

1. Arroxy llama directamente a la URL de YouTube usando [yt-dlp](https://github.com/yt-dlp/yt-dlp) — una herramienta de código abierto auditable y siempre actualizada
2. El archivo se guarda directamente en la carpeta que elegiste
3. Cero telemetría. Nada se registra, rastrea ni envía a ningún sitio — nunca.

Tu historial de visualización, tu historial de descargas y el contenido de los archivos se quedan en tu dispositivo. 100% privado.

---

## Preguntas frecuentes

**¿Qué calidades de video puedo descargar?**
Cualquiera que ofrezca YouTube — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p y solo audio. Los streams de alto frame rate (60 fps, 120 fps) y HDR se conservan tal cual. Arroxy te muestra todos los formatos disponibles y te deja elegir exactamente cuál bajar.

**¿De verdad es gratis?**
Sí. Licencia MIT. Sin nivel premium, sin funciones bloqueadas.

**¿En qué idiomas está disponible Arroxy?**
En nueve, listos para usar: English, Español, Deutsch (alemán), Français (francés), 日本語 (japonés), 中文 (chino), Русский (ruso), Українська (ucraniano) y हिन्दी (hindi). Arroxy detecta el idioma de tu sistema operativo en el primer arranque y puedes cambiarlo en cualquier momento desde el selector de idioma en la barra de herramientas. ¿Quieres añadir o mejorar una traducción? Los archivos de idioma son objetos TypeScript planos en `src/shared/i18n/locales/` — [abre un PR](../../pulls).

**¿Necesito instalar algo?**
No. yt-dlp y ffmpeg se descargan automáticamente en el primer arranque desde sus releases oficiales en GitHub y se guardan en caché en tu máquina. Después de eso, no se necesita configuración adicional.

**¿Seguirá funcionando si YouTube cambia algo?**
Sí — y Arroxy tiene dos capas de resiliencia. Primero, yt-dlp es una de las herramientas open-source más mantenidas activamente — se actualiza en horas tras cualquier cambio de YouTube. Segundo, Arroxy no depende de cookies ni de tu cuenta de Google, así que no hay sesión que caduque ni credenciales que rotar. Esa combinación lo hace mucho más estable que las herramientas que dependen de cookies exportadas del navegador.

**¿Puedo descargar listas de reproducción?**
Hoy se admiten videos individuales. El soporte de listas y canales está en la hoja de ruta — ver [Funciones planeadas](#funciones-planeadas).

**¿Necesita mi cuenta de YouTube o cookies?**
No — y es un tema más importante de lo que parece. La mayoría de las herramientas que dejan de funcionar tras una actualización de YouTube te piden exportar las cookies de YouTube de tu navegador. Esa solución se rompe cada ~30 minutos cuando YouTube rota las sesiones, y la propia documentación de yt-dlp advierte que puede provocar el baneo de tu cuenta de Google. Arroxy nunca usa cookies ni credenciales. Sin login. Sin cuenta vinculada. Nada que caduque, nada que banear.

**macOS dice "la aplicación está dañada" o "no se puede abrir" — ¿qué hago?**
Es Gatekeeper de macOS bloqueando una app sin firmar — no es un daño real. Mira [Primer arranque en macOS](#primer-arranque-en-macos) para instrucciones paso a paso.

**¿Es legal?**
Descargar videos para uso personal generalmente se acepta en la mayoría de jurisdicciones. Eres responsable de cumplir con los Términos de Servicio de YouTube y las leyes de tu país.

---

## Detalles técnicos

Para detalles técnicos, instrucciones de compilación desde el código fuente, prerequisitos por plataforma y cómo contribuir, consulta el [README en inglés](README.md#tech-details).

---

> **Términos de uso:** Arroxy es una herramienta para uso personal y privado. Eres el único responsable de garantizar que tus descargas cumplan con los [Términos de Servicio](https://www.youtube.com/t/terms) de YouTube y las leyes de propiedad intelectual de tu jurisdicción. No uses Arroxy para descargar, reproducir o distribuir contenido sobre el que no tengas derechos. Los desarrolladores de Arroxy no se hacen responsables del mal uso.

<div align="center">
  <sub>Licencia MIT · Hecho con cariño por <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
