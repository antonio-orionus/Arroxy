<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Mascota de Arroxy" width="180" />

# Arroxy — Descargador gratuíto e de código aberto de YouTube (+ 2000 sitios) cun navegador integrado, para Windows, macOS e Linux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Ler en:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · **Galego** · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Versión](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Compilación](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Sitio web](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licenza](https://img.shields.io/badge/license-GPLv3-blue) ![Plataformas](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Idiomas](https://img.shields.io/badge/i18n-50_languages-blue)

Descarga vídeos, Shorts, canles, podcasts ou pistas de audio de **YouTube e máis de 2000 sitios compatibles**: ata 8K HDR a 60 fps, como MP3 / AAC / Opus, ou só a parte que necesites. **Navega por YouTube ou por calquera outro sitio dentro de Arroxy** na lapela Explorar e descarga o vídeo, a lista de reprodución ou a canle na que estás; inicia sesión alí para descargar os vídeos que a túa propia conta xa pode ver. Funciona en local en Windows, macOS e Linux. **Sen anuncios, sen paquetes de máis, sen vendas forzadas.**

[**↓ Instalar a última versión**](#install) &nbsp;·&nbsp; [**Sitio web**](https://arroxy.com/) &nbsp;·&nbsp; [Primeiro inicio en Windows](#windows-first-launch) · [Primeiro inicio en macOS](#macos-first-launch) · [Primeiro inicio en Linux](#linux-first-launch)

[![Únete á comunidade de Discord](https://img.shields.io/badge/%C3%9Anete%20%C3%A1%20comunidade%20de%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Se Arroxy che aforra tempo, unha ⭐ axuda a que outros o atopen.

</div>

> **Que é Arroxy?** Arroxy é unha interface gráfica de escritorio gratuíta e de código aberto que descarga vídeos, audio, listas de reprodución e subtítulos de YouTube e doutros 2000+ sitios compatibles con [yt-dlp](https://github.com/yt-dlp/yt-dlp). Funciona en Windows 10/11, macOS 13+ (Intel + Apple Silicon) e Linux (AppImage, Flatpak, tar.gz). Licenza GPLv3. Sen anuncios nin límites de uso. Distribúese a través de [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage e descarga directa.
>
> **Diferenza clave: un navegador integrado.** A maioría dos descargadores gratuítos de YouTube son envoltorios finos de yt-dlp: unha caixa de URL e un menú de formatos, sen navegador propio. Arroxy ten un, a lapela **Explorar**. Navegas por YouTube ou por calquera outro sitio dentro da aplicación e descargas o vídeo, a lista de reprodución ou a canle na que estás, ou fas clic dereito en calquera ligazón. Se inicias sesión unha vez en Explorar, as descargas que requiren unha conta usarán ese inicio de sesión: os teus vídeos privados, as túas listas Ver máis tarde e Gústame, e outros vídeos que a túa conta xa pode ver, sen exportar cookies. Inicia sesión tamén noutros sitios alí, e as súas descargas usarán ese inicio de sesión cando o precisen. Detalles: [Por que Arroxy](#why-explore).
>
> _Última actualización: 2026-10-22._

> 🌐 Esta tradución fíxose co apoio da IA. O [README en inglés](../../README.md) é a fonte de referencia. Atopaches un erro? [Abre un PR](../../../../pulls).

---

## Contido

- [✨ Funcións](#features)
- [📥 Instalación e primeiro inicio](#install)
  - [Primeiro inicio en Windows](#windows-first-launch)
  - [Primeiro inicio en macOS](#macos-first-launch)
  - [Por que podes ver un aviso](#why-warning)
  - [Primeiro inicio en Linux](#linux-first-launch)
  - [Verifica a túa descarga (SHA256)](#verify)
- [⚖️ Por que Arroxy](#why)
- [🔒 Privacidade](#privacy)
- [❓ Preguntas frecuentes](#faq)
- [🗺️ Folla de ruta](#roadmap)
- [💖 Apoia Arroxy](#support)
- [🛠️ Feito con](#tech)
- [📜 Termos de uso](#terms)

---

## <a id="features"></a>✨ Funcións

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/gl/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explorar</b><br/>Navega por YouTube ou por calquera outro sitio dentro de Arroxy e descarga a páxina na que estás co teu perfil activo</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>A primeira pantalla de Explorar</b><br/>Unha ollada rápida a Explorar e por que unha conta secundaria é o inicio de sesión máis seguro</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descargas dinche o que precisa de ti</b><br/>As ligazóns prepáranse en segundo plano; unha que falla ofrece a súa solución e unha lista longa agarda a túa decisión</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/gl/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descarga só unha parte dun vídeo</b><br/>Escolle un inicio e un final, ou un capítulo — Arroxy garda só ese intervalo</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/gl/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR a 60 fps</b><br/>Todas as resolucións, códecs e fluxos HDR que ofrece un vídeo, lado a lado</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/gl/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editor de perfís</b><br/>Axusta un perfil: tipo de ficheiro, resolución, subtítulos, destino, modelo de nome de ficheiro e máis</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/gl/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Escuro ou claro, vidro ou sólido</b><br/>Catro aspectos entre os que escoller: paneis de vidro sobre un ceo en movemento ou superficies sólidas e tranquilas, cada un en escuro e claro</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Atallo global de descarga de Arroxy — Ctrl+Shift+D en Windows e Linux, Cmd+Shift+D en macOS, que envía a ligazón copiada directamente á cola de descargas" width="760" /></picture><br/><sub><b>Atallo global de descarga</b><br/>Copia unha ligazón en calquera lugar e preme unha vez — entra na cola e comeza a descargarse</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/gl/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Perfís por elemento da lista</b><br/>Dálle a cada vídeo o seu propio perfil — arquiva algúns en 4K e garda o resto só como audio</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Inicio de Descarga rápida</b><br/>Pega unha URL e descárgaa ao instante co teu perfil activo</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Perfís de descarga reutilizables</b><br/>Garda axustes de formato, calidade e saída — reutilízaos en cada descarga</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Pistas de audio en varios idiomas</b><br/>Escolle o idioma exacto do audio co que vén un vídeo</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Audio envolvente / Dolby</b><br/>As pistas 5.1 e Dolby detéctanse e consérvanse</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Modo de URLs en lote</b><br/>Pega unha lista, elimina duplicados automaticamente e ponas todas en cola de vez</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/gl/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Cola de descargas en paralelo</b><br/>Varias descargas á vez con progreso en directo</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explorar: navega pola web dentro de Arroxy</strong></summary>

- **Lapela Explorar** — navega por YouTube ou por calquera outro sitio dentro de Arroxy e descarga o que atopes sen copiar ligazóns. **Descargar · *o teu perfil*** pon en cola o vídeo, a lista de reprodución ou a canle que estás vendo; a frecha ao seu carón cambia de perfil e a variña abre a descarga paso a paso para escoller formatos, subtítulos e máis
- **Botón dereito para descargar** — fai clic co botón dereito en calquera ligazón de vídeo, lista de reprodución ou canle en Explorar para descargala co teu perfil, escoller outro perfil en **Descargar con**, abrir a descarga paso a paso ou copiar a ligazón. Non fai falta abrir cada vídeo primeiro
- **Deseño compacto** — un clic na barra de ferramentas de Explorar leva as lapelas de Arroxy a ela e dálle máis espazo á páxina
- **Barra de enderezos** — escribe para buscar en YouTube ou introduce calquera enderezo web para abrir ese sitio
- **Descargas que requiren unha conta** — inicia sesión unha vez en Explorar e Arroxy poderá descargar vídeos que a túa conta pode ver: os teus vídeos privados, vídeos con restrición de idade se a conta ten a idade verificada, e as túas listas Ver máis tarde e Gústame. Inicia sesión tamén noutros sitios alí, e as súas descargas usarán ese inicio de sesión cando o precisen. Arroxy descarga primeiro sen sesión iniciada e só usa o teu inicio de sesión de Explorar cando unha descarga falla de xeito que unha conta pode arranxar
- **Usa unha conta secundaria** — a primeira pantalla de Explorar explica por que: descargar cunha conta leva certo risco de que se restrinxa esa conta. Pecha a sesión en Explorar desde a configuración cando queiras esquecer os teus inicios de sesión
- **Bloqueador de anuncios** — desactivado por defecto. Un clic no escudo da barra de ferramentas de Explorar bloquea anuncios e rastreadores nas súas páxinas, sen afectar ás descargas. YouTube pode poñer trabas aos bloqueadores de anuncios en contas con sesión iniciada

</details>

<details>
<summary><strong>🎞️ Calidade e formatos</strong></summary>

- Ata **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Taxa de fotogramas alta e HDR** conservados tal cal — 60 fps, HDR10
- **Audio** — exporta só o audio como MP3, M4A/AAC, Opus ou WAV. Nas descargas interactivas, escolle as pistas envolventes/Dolby nativas da orixe (AC-3, E-AC-3, 5.1, DRC) cando existan, ou define un valor global predeterminado **Preferir envolvente / Dolby**
- **Perfís con obxectivo** — *Mellor imaxe* (AV1 · VP9) ou *Smart TV* (MP4 · H.264), gardados como Automático, MP4, MKV ou WebM sen recodificar. O HDR é *Automático* (só cando a túa pantalla pode amosalo), *SDR* ou *HDR*
- **Todos os códecs en todas as resolucións** — a descarga paso a paso enumera AV1, VP9 e H.264 lado a lado en cada resolución, para que escollas o que reproduce o teu televisor ou editor
- **Sabe o que é realmente un fluxo** — márcanse os tamaños que YouTube escalou con IA, os idiomas de audio dobrados con IA, os fluxos de taxa de bits mellorada, os vídeos 360° e as copias danadas ou con marca de auga. Os perfís omiten os fluxos escalados con IA a non ser que os permitas

</details>

<details>
<summary><strong>🛡️ Privacidade e control</strong></summary>

- Procesamento 100 % local — as descargas van directamente de YouTube ao teu disco
- **Código aberto** — cada liña é auditable, baixo licenza GPLv3
- Os ficheiros gárdanse directamente no cartafol que escollas

</details>

<details>
<summary><strong>⚡ Fluxo de traballo</strong></summary>

- **Atallo global de descarga** — copia unha ligazón en calquera aplicación e preme `Ctrl+Shift+D` (`Cmd+Shift+D` en macOS); Arroxy ponna en cola co teu perfil activo sen abrir a xanela, e unha notificación confírmao. Activado por defecto, reasignable
- **Modos de inicio flexibles** — escolle unha descarga individual guiada, o selector de listas/canles, pegar URLs en lote, Descarga rápida cos valores gardados, ou navegar e descargar desde Explorar
- **Cola de descargas central** — cada tarefa individual, de lista, en lote ou rápida aterra nun só lugar para ver o progreso, pausar, retomar, cancelar, tentar de novo e controlar a prioridade
- **Vixilancia do portapapeis** — copia a ligazón dun vídeo e énchese o campo da URL cando volvas a Arroxy, con **Desfacer** se non querías facelo. Mentres Arroxy está ocupado, a ligazón agarda ata que volvas á lapela da URL (desactívao na configuración)
- **Limpeza automática de URLs** — elimina os parámetros de rastrexo (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) e desenvolve as ligazóns `youtube.com/redirect`
- **Modo bandexa** — pechar a xanela mantén as descargas en execución en segundo plano
- **50 idiomas** — detecta automaticamente o idioma do sistema, e podes cambialo cando queiras
- **Sincronización de listas** — volve examinar unha lista de reprodución contra un cartafol local para omitir os vídeos xa descargados; xera un ficheiro de lista `.m3u` que se actualiza a medida que se descarga cada vídeo
- **Controis de velocidade e ritmo** — limita a largura de banda das descargas, define cantas partes dun vídeo se descargan á vez e engade atrasos entre solicitudes con axustes predefinidos (*Desactivado · Equilibrado · Prudente · Personalizado*)
- **Modelos de nome de ficheiro** — pon nome ás descargas ao teu xeito con `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` e `{playlist_index}`, de forma global ou por perfil de descarga
- **Descargas simultáneas e reintento automático** — escolle cantas descargas da cola se executan á vez e deixa que Arroxy reintente unha descarga que atopou un problema de rede ou servidor, agardando máis antes de cada intento
- **Perfís por elemento da lista** — asigna a cada vídeo dunha lista de reprodución o seu propio perfil de descarga en vez dunha única configuración para toda a lista, de modo que nunha soa pasada podes arquivar algúns na máxima calidade e gardar o resto só como audio
- **A Descarga rápida funciona en segundo plano** — a ligazón aparece enseguida en Descargas e prepárase alí, unha nota con **Ver** confírmao, e o campo da URL límpase para a seguinte ligazón. Inicia tantas como queiras mentres as anteriores se preparan
- **Descargas dinche o que precisa de ti** — se Arroxy non pode ler unha ligazón, a súa fila di por que e ofrece a solución: Tentar de novo, activar as cookies ou iniciar sesión en Explorar. Coas cookies desactivadas, **Iniciar sesión en Explorar** tenta de novo por ti cando inicies sesión. Unha lista de reprodución máis longa que o teu límite de carga agarda na súa fila a que escollas toda ela, os primeiros ou unha revisión. A lapela Descargas conta as filas que che esperan
- **Descarga só unha parte dun vídeo** — escolle un inicio e un final, ou un capítulo, na pantalla Formato e Arroxy garda só ese intervalo, co nome co intervalo despois do id do vídeo. Os cortes caen no fotograma clave máis próximo; activa o corte exacto para recodificar
- **Quitar as descargas rematadas** — opcional: unha descarga rematada sae da lista 5 segundos despois. Os seus ficheiros quedan no disco e as descargas fallidas seguen na lista
- **Tamaño e Falta en Descargas** — unha columna **Tamaño** ordenable amosa o espazo que ocupa cada descarga, e **Falta** sinala os ficheiros movidos ou eliminados fóra de Arroxy
- **Aurora ou Minimal, escuro ou claro** — paneis de vidro sobre un ceo en movemento, ou superficies sólidas e tranquilas; cambia desde o pé. Os equipos sen aceleración gráfica reciben Minimal automaticamente
- **Barra de menú de Mac** — en macOS, abre a configuración (`Cmd+,`), define o límite de velocidade de descarga, cambia o estilo e o tema, e abre os rexistros ou garda un ficheiro de diagnóstico desde a barra de menú
- **Cambia un perfil desde calquera descarga** — axusta unha descarga e despois actualiza o perfil do que partiu (cunha vista previa do que cambia) ou garda a configuración como un perfil novo. Ao cambiar de perfil pregúntase se queres manter as túas edicións

</details>

<details>
<summary><strong>📝 Subtítulos e posprocesamento</strong></summary>

- **Subtítulos** en SRT, VTT ou ASS — manuais ou xerados automaticamente, en calquera idioma dispoñible
- Gárdaos xunto ao vídeo, incorpóraos nun `.mkv` ou organízaos nun subcartafol `Subtitles/`
- **Lotes só de subtítulos** — pega unha lista de URLs ou abre unha lista de reprodución, escolle Subtítulos e obtén só os ficheiros de subtítulos de cada vídeo
- **SponsorBlock** — omite ou marca como capítulos os patrocinios, introducións, peches e autopromocións
- **Metadatos incorporados** — título, data de publicación, canle, descrición, miniatura e marcadores de capítulos escritos no ficheiro

</details>

<details>
<summary><strong>🌐 YouTube + 2000 sitios</strong></summary>

- **YouTube, completo** — Vídeos, Shorts, Canles, Listas de reprodución, YouTube Music e Podcasts tratados como fontes de primeira clase
- **Máis de 2000 sitios máis** mediante yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable e moitos máis
- **Só audio e subtítulos** funcionan en todos os sitios compatibles, non só en YouTube
- Se un sitio cambia, yt-dlp publica correccións cada semana e Arroxy actualiza automaticamente o binario ao iniciarse

</details>

---

## <a id="install"></a>📥 Instalación e primeiro inicio

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
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --appimage
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

As compilacións son só x86_64. Non tes `curl`? Cambia `curl -fsSL` por `wget -qO-`.

| Plataforma | Descarga directa |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Todos os recursos da versión →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Primeiro inicio en Windows</strong></summary>

No primeiro inicio pode que vexas **«Windows protexeu o teu PC»** ou **«Editor descoñecido»**. Isto afecta tanto a `Arroxy-win-x64-Setup.exe` como a `Arroxy-win-x64-Portable.exe`. Arroxy é gratuíto e de código aberto e as compilacións de Windows non están asinadas cun certificado de pagamento, e por iso SmartScreen as marca. **Non** significa automaticamente que Arroxy non sexa seguro. Para continuar:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="Diálogo «Windows protexeu o teu PC» de SmartScreen co enlace «Máis información» resaltado" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="Diálogo de SmartScreen despois de expandir Máis información, co botón «Executar de todos os xeitos»" />
</div>

1. Fai clic en **Máis información**.
2. Fai clic en **Executar de todos os xeitos**.

#### Se Windows Defender marca ou elimina o ficheiro

A heurística de Defender ás veces marca como sospeitosos os instaladores NSIS sen asinar e os portátiles de Electron. Se Defender poñe en corentena `Arroxy-win-x64-Setup.exe` ou `Arroxy-win-x64-Portable.exe`, restáurao desde **Seguridade de Windows → Protección contra virus e amenazas → Historial de protección** e despois engade o executable de Arroxy como elemento permitido en **Administrar a configuración → Engadir ou quitar exclusións**. Como con SmartScreen, o motivo é a falta de sinatura do editor, non un malware detectado.

> Descarga Arroxy só desde a páxina oficial de versións de GitHub. Se obtiveches o ficheiro doutro sitio web ou alguén ch'o enviou, elimínao e descarga unha copia nova da fonte oficial. O código fonte é público, así que podes inspeccionalo ou compilar Arroxy ti mesmo se o prefires.

Prefires Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Primeiro inicio en macOS</strong></summary>

As compilacións de Arroxy para macOS están asinadas ad hoc pero non notarizadas por Apple, así que Gatekeeper bloquea o primeiro inicio con *«Arroxy.app» non se abriu — Apple non puido verificar que «Arroxy.app» estea libre de malware*. Isto significa que macOS non pode comprobar a aplicación con Apple, non que haxa algo mal cos ficheiros. Instalar con Homebrew evita este diálogo por completo. Se usaches o DMG, un comando de Terminal soluciónao:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Arrastra `Arroxy.app` desde o DMG montado a `/Applications`.
2. Abre o Terminal e executa estes dous comandos:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

O primeiro comando quita o atributo de corentena que macOS engadiu cando se descargou o ficheiro; o segundo inicia a aplicación. Normalmente non precisas `sudo`, porque a copia en `/Applications` é túa: engádeo só se obtés un erro de permisos.

**Apple Silicon fronte a Intel:** nun Mac da serie M (M1 / M2 / M3 / M4), descarga o DMG `arm64`. Nos Mac Intel, descarga o DMG `x64`. Executar a compilación equivocada segue funcionando mediante Rosetta, pero é notablemente máis lento.

> As compilacións de macOS prodúcense mediante CI en executores Apple Silicon e Intel. Se tes problemas, [abre unha incidencia](../../../../issues): os comentarios dos usuarios de macOS dan forma activamente ao ciclo de probas de macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Por que podes ver un aviso</strong></summary>

Arroxy é de código aberto e ten licenza GPLv3. As compilacións de Windows e macOS **non están asinadas**: os certificados Apple Developer ID e EV de Windows custan cada un centos de dólares ao ano, algo que un proxecto independente paga do seu peto. Sen esas sinaturas, Windows SmartScreen e macOS Gatekeeper avisarante no primeiro inicio. Os avisos significan *que o teu SO non recoñece o editor*, non que Arroxy sexa malware.

Tres formas de verificar Arroxy ti mesmo, de menor a maior rigor:

- **Le o código fonte.** Cada liña está en [GitHub](https://github.com/antonio-orionus/Arroxy) e podes [compilalo desde o código fonte](#tech).
- **Comproba o SHA256.** Compara o teu ficheiro co [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) publicado — consulta [Verifica a túa descarga](#verify) máis abaixo.
- **Fai unha análise de terceiros.** Sube o ficheiro a [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Primeiro inicio en Linux</strong></summary>

As AppImage execútanse directamente, sen instalación. Só tes que marcar o ficheiro como executable.

**Xestor de ficheiros:** fai clic co botón dereito no `.AppImage` → **Propiedades** → **Permisos** → activa **Permitir executar o ficheiro como programa** e despois fai dobre clic.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Se o inicio aínda falla, execútao sen montar: non fai falta ningún paquete FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Integración co escritorio opcional:** instala [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) unha vez e calquera AppImage na que fagas dobre clic rexistrarase automaticamente no menú de aplicacións, sen precisar un ficheiro `.desktop` manual.

**Tarball simple (sen FUSE, sen instalación):**

A compilación `.tar.gz` é a mesma aplicación sen o envoltorio de AppImage: extráea onde queiras e execútaa. Sen instalador e sen paquete FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**As descargas de Linux da páxina de versións son só x86_64.** En máquinas ARM64 (Raspberry Pi, Asahi Linux) Flatpak instálase igualmente, pero falla no inicio con `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verifica a túa descarga (SHA256)</strong></summary>

Cada versión publica un ficheiro `SHA256SUMS` xunto cos binarios. Para comprobar que a túa descarga non se corrompeu nin se manipulou durante o tránsito, calcula o hash do ficheiro en local e compáraa coa liña de `SHA256SUMS`. Abre a páxina da última versión → **Assets** → descarga `SHA256SUMS`.

**Windows (PowerShell ou Símbolo do sistema):**

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

Queres unha análise de malware de terceiros? Sube o ficheiro a [VirusTotal](https://www.virustotal.com). Un puñado de avisos de heurística xenérica de motores menores é normal nas aplicacións Electron sen asinar; unhas detección xeneralizadas de motores importantes si serían preocupantes.

</details>

<details>
<summary><strong>📦 Windows: instalador fronte a portátil</strong></summary>

|               | Instalador NSIS | `.exe` portátil |
| ------------- | :----------------------: | :---------------------: |
| Require instalación | Si  | Non — execútase desde calquera lugar  |
| Actualizacións automáticas | ✅ na aplicación  | ❌ descarga manual  |
| Velocidade de inicio | ✅ máis rápido  | ⚠️ arranque en frío máis lento  |
| Engádese ao menú Inicio |            ✅            |           ❌            |
| Desinstalación sinxela |            ✅            | ❌ elimina o ficheiro  |

**Recomendación:** usa o instalador NSIS para ter actualizacións automáticas e un inicio máis rápido. Usa o `.exe` portátil se queres unha opción sen instalación e sen rexistro.

</details>

---

## <a id="why"></a>⚖️ Por que Arroxy

Unha comparación lado a lado coas alternativas máis comúns:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Navegador integrado (navegar, iniciar sesión, descargar) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Vídeos que a túa propia conta pode ver, sen exportar cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratuíto, sen nivel premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Código aberto |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Só procesamento local |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Sen límites de uso |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Aplicación de escritorio multiplataforma |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtítulos + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = en parte, ou só nun nivel de pagamento. O inicio de sesión na aplicación de 4K Video Downloader para vídeos privados é unha función de pagamento; a maioría das interfaces gratuítas de yt-dlp só aceptan un ficheiro de cookies ou len as cookies do teu navegador web.

Arroxy está feito para unha soa cousa: un ficheiro local limpo, tanto se pegas unha URL como se atopas o vídeo en Explorar. Sen vendas forzadas, sen recompilación de datos.

### <a id="why-explore"></a>🧭 O que un simple envoltorio de yt-dlp non pode facer: a lapela Explorar

A maioría dos descargadores gratuítos de YouTube son unha caixa de URL sobre yt-dlp. Arroxy tamén usa yt-dlp, pero ademais ten **Explorar**, un navegador integrado na aplicación que abre YouTube ou calquera outro sitio. Explorar engade o que unha caixa de URL non pode:

- **Vídeos que a túa conta pode ver, sen exportar cookies** — os teus vídeos privados, as túas listas Ver máis tarde e Gústame, vídeos con restrición de idade nunha conta con idade verificada, e páxinas doutros sitios que precisan o teu inicio de sesión. Un envoltorio simple precisa unha exportación de cookies.txt ou le as cookies do teu navegador web. En Arroxy inicias sesión unha vez en Explorar e el fai o resto
- **Sen copiar ligazóns** — atopa un vídeo, lista de reprodución ou canle en Explorar e descárgao cun clic, ou fai clic co botón dereito en calquera ligazón da páxina
- **Bloqueador de anuncios cando o queiras** — un clic no escudo bloquea anuncios e rastreadores nas páxinas de Explorar

---

## <a id="privacy"></a>🔒 Privacidade

As descargas obtéñense directamente mediante [yt-dlp](https://github.com/yt-dlp/yt-dlp) desde YouTube ao cartafol que escollas: nada pasa por un servidor de terceiros. O historial de reprodución, o historial de descargas, as URLs e o contido dos ficheiros quedan no teu dispositivo.

Sen seguimento — un sinal anónimo ao día (versión da aplicación, SO, idioma, canle de instalación, país e aproximadamente canto tempo hai que se instalou Arroxy) para poder contar os usuarios activos e novos e, cando Arroxy descarga ou actualiza yt-dlp e FFmpeg, unha nota anónima sobre se funcionou e aproximadamente canto tardou. Sen IDs, URLs, títulos de vídeos, rutas de ficheiros nin datos de contas. Podes desactivar ambos na configuración.

Explorar garda os seus propios inicios de sesión, separados do teu navegador, e Arroxy nunca le nin completa un formulario de inicio de sesión: escribes na propia páxina do sitio. As descargas execútanse sen sesión iniciada; só cando unha falla de xeito que unha conta pode arranxar, Arroxy le o inicio de sesión de novo, gárdao nun ficheiro temporal para esa descarga e elimina o ficheiro despois. Pechar a sesión en Explorar na configuración esquéceos.

---

## <a id="faq"></a>❓ Preguntas frecuentes

<details>
<summary><strong>É realmente gratuíto?</strong></summary>

Si — licenza GPLv3, sen nivel premium, sen funcións bloqueadas.

</details>

<details>
<summary><strong>En que se diferencia Arroxy doutras interfaces de yt-dlp?</strong></summary>

A maioría das interfaces gratuítas de yt-dlp son envoltorios que só aceptan unha ligazón. Arroxy engade **Explorar**, un navegador integrado na aplicación que abre YouTube ou calquera outro sitio: navegas e descargas sen copiar ligazóns, e inicias sesión alí unha vez para descargar os vídeos que a túa conta pode ver, como os teus vídeos privados e as túas listas Ver máis tarde e Gústame, sen exportar cookies. Consulta [Por que Arroxy](#why).

</details>

<details>
<summary><strong>Que calidades de vídeo podo descargar?</strong></summary>

Todo o que serve YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, ademais de só audio. Os fluxos de 60 fps e HDR consérvanse tal cal, e a descarga paso a paso permíteche escoller AV1, VP9 ou H.264 en cada resolución.

</details>

<details>
<summary><strong>Podo extraer só o audio como MP3?</strong></summary>

Si. Escolle *só audio* no menú de formato e elixe MP3, M4A/AAC, Opus ou WAV.

</details>

<details>
<summary><strong>Como descargo vídeos que requiren unha conta de YouTube?</strong></summary>

Inicia sesión unha vez na lapela Explorar. Arroxy poderá entón descargar vídeos que a túa conta pode ver: os teus vídeos privados, vídeos con restrición de idade se a conta ten a idade verificada, e as túas listas Ver máis tarde e Gústame. Usa o inicio de sesión só cando unha descarga falla de xeito que unha conta pode arranxar; todo o demais descárgase como antes. Esta é a opción **Inicio de sesión en Explorar**, a primeira da lista e marcada como Recomendado na configuración das cookies, e Arroxy escóllea por ti a primeira vez que abras Explorar. A wiki de yt-dlp advirte de que [a automatización con sesión iniciada pode marcar unha conta de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), así que unha conta secundaria é a opción máis segura.

</details>

<details>
<summary><strong>Seguirá funcionando cando YouTube cambie algo?</strong></summary>

yt-dlp actualízase automaticamente ao iniciarse, e Arroxy publica correccións axiña cando YouTube cambia algo. Cando unha descarga precisa iniciar sesión, Arroxy usa o teu inicio de sesión de Explorar se iniciaches sesión alí, e na configuración das cookies están dispoñibles as cookies dun ficheiro ou do teu navegador.

</details>

<details>
<summary><strong>En que idiomas está dispoñible Arroxy?</strong></summary>

50 idiomas, de serie: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy detecta automaticamente o idioma do teu sistema operativo no primeiro inicio e podes cambialo en calquera momento desde o selector de idioma da barra de ferramentas. O JSON de configuración rexional en execución está en src/shared/i18n/locales/, e os catálogos PO para tradutores están en i18n/locales/ — abre un PR en GitHub para contribuír.

</details>

<details>
<summary><strong>Teño que instalar algo máis?</strong></summary>

Non. yt-dlp, ffmpeg e ffprobe descárganse automaticamente no primeiro inicio e gárdanse na túa máquina. Despois diso non fai falta ningunha configuración extra.

</details>

<details>
<summary><strong>Podo descargar listas de reprodución ou canles enteiras?</strong></summary>

Si, as dúas cousas. Pega a URL dunha lista de reprodución ou dunha canle (p. ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); escolle cantas entradas examinar e despois pon en cola toda a lista ou escolle vídeos concretos. Os filtros por intervalo de datas chegarán pronto.

</details>

<details>
<summary><strong>macOS di que «a aplicación está danada» — que fago?</strong></summary>

Isto é Gatekeeper de macOS bloqueando unha aplicación sen asinar, non un dano real. Consulta [Primeiro inicio en macOS](#macos-first-launch) para ver os comandos de Terminal que quitan a corentena e inician Arroxy.

</details>

<details>
<summary><strong>É legal descargar vídeos de YouTube?</strong></summary>

Depende do teu país e do que descargues. Descarga só contido que che pertenza, contido con licenza para descargalo ou contido que a lei do teu país che permita copiar. Es responsable de cumprir os [Termos do servizo](https://www.youtube.com/t/terms) de YouTube e as leis de dereitos de autor do teu país. Consulta [Termos de uso](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ Folla de ruta

Aínda previsto — aproximadamente por orde de prioridade:

| Función    | Descrición    |
| ---------------- | ---------------- |
| **Filtros de listas e canles** | Filtros por intervalo de datas ao enumerar unha lista de reprodución ou canle |
| **Preferencias de pista de audio de YouTube** | Define unha preferencia de pista de idioma falado para toda a aplicación, con sobrescrituras por perfil cando YouTube ofrece varias pistas de audio |
| **Recuperación de reintentos máis robusta** | Unha nova vía de reintento para descargas interrompidas por conexións a Internet pouco fiables ou problemáticas |
| **Panel completo do xestor de descargas** | Converter o panel da cola nun xestor máis completo, incluíndo o cambio de cartafoles de destino dos elementos en cola |
| **Descargas programadas** | Iniciar unha cola a unha hora determinada (execucións nocturnas) |
| **Paquete AUR** | Instalar en Arch Linux e Omarchy con `yay -S arroxy-bin` |

Tes unha función en mente? [Abre unha solicitude](../../../../issues) — as achegas da comunidade determinan a prioridade.

---

## <a id="support"></a>💖 Apoia Arroxy

Arroxy é gratuíto e ten licenza GPLv3: sen anuncios, sen seguimento, sen nivel de pagamento. Se che aforra tempo, podes apoiar o desenvolvemento con Bitcoin, Tron ou Ethereum: os enderezos están en [DONATE.md](../../DONATE.md), que é a única fonte oficial deles. Arroxy nunca che enviará un enderezo por correo electrónico nin mensaxe directa. Darlle unha estrela ao repositorio, informar de erros e mellorar as traducións axudan igual de ben.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Feito con

<details>
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
| Node.js    | 24.21.0 | `mise install` ou `.node-version` |
| Bun        | 1.4.2   | `mise install` ou `package.json` `packageManager` |

Recomendado: instala `mise` e despois executa `mise install` no checkout. Sen mise, activa manualmente Node.js desde `.node-version` e Bun desde `package.json` antes de `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Pode que fagan falta Visual Studio Build Tools e Python para as recompilacións nativas.

### macOS

```bash
brew install mise
xcode-select --install
```

Despois de clonar, executa `mise trust && mise install` desde o checkout. Se o teu shell xa usa `fnm`, `nvm` ou un Bun de Homebrew, activa mise en `~/.zshrc` para que Arroxy use Node.js 24.21.0 e Bun 1.4.2:

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

# Dependencias de compilación e de execución de Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Só para probas E2E (Electron precisa unha pantalla)
sudo apt install -y xvfb
```

### Clonar e executar

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recomendado; omítea se activaches manualmente as ferramentas fixadas
bun run bootstrap
bun run doctor
bun run dev            # aplicación Electron co renderer de Vite
```

### Crear un distribuíble

```bash
bun run build        # typecheck + compile
bun run dist         # empaqueta para o SO actual
bun run dist:win     # empaqueta os destinos de Windows nun host compatible
```

> `bun run bootstrap` instala as dependencias, recompila as dependencias da aplicación Electron, verifica Electron, prepara ffmpeg/ffprobe integrados para o desenvolvemento e instala Playwright Chromium. As compilacións de publicación xestionan yt-dlp, ffmpeg e ffprobe en execución no cartafol de datos da túa aplicación; ningunha delas vai dentro do instalador.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/arroxy/main.log` |
| Linux    | `~/.config/arroxy/logs/main.log` |

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
| Windows  | `%APPDATA%\arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/arroxy/argv.json` |
| Linux    | `~/.config/arroxy/argv.json`                     |

On Flatpak, both `main.log` and `argv.json` live under
`~/.var/app/io.github.antonio_orionus.Arroxy/config/arroxy/`
(for example `logs/main.log`).

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

## <a id="terms"></a>📜 Termos de uso

Arroxy é unha ferramenta só para uso persoal e privado. Es o único responsable de asegurar que as túas descargas cumpran os [Termos do servizo](https://www.youtube.com/t/terms) de YouTube e as leis de dereitos de autor da túa xurisdición. Non uses Arroxy para descargar, reproducir ou distribuír contido que non teñas dereito a usar. Os desenvolvedores non se fan responsables de ningún mal uso.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Feito con coidado por <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
