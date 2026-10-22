<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Mascota d'Arroxy" width="180" />

# Arroxy — Descarregador gratuït i de codi obert de YouTube (+ 2000 llocs) amb navegador integrat, per a Windows, macOS i Linux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Llegeix-ho en:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · **Català** · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · [Lietuvių](README.lt.md) · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Versió](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Compilació](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Lloc web](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Llicència](https://img.shields.io/badge/license-GPLv3-blue) ![Plataformes](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Idiomes](https://img.shields.io/badge/i18n-50_languages-blue)

Descarrega vídeos, Shorts, música, canals, pòdcasts o pistes d'àudio de **YouTube i més de 2000 llocs compatibles**: fins a 8K HDR a 60 fps, com a MP3 / AAC / Opus, o només el fragment que necessites. **Navega per YouTube o per qualsevol altre lloc dins d'Arroxy** a la pestanya Explora i descarrega el vídeo, la llista de reproducció o el canal que estàs veient; inicia-hi la sessió per baixar vídeos privats, només per a membres i amb restricció d'edat que el teu compte pot veure. Funciona en local a Windows, macOS i Linux. **Sense anuncis, sense programari innecessari, sense vendes addicionals.**

[**↓ Instal·la l'última versió**](#install) &nbsp;·&nbsp; [**Lloc web**](https://arroxy.com/) &nbsp;·&nbsp; [Primer inici a Windows](#windows-first-launch) · [Primer inici a macOS](#macos-first-launch) · [Primer inici a Linux](#linux-first-launch)

[![Participa a la comunitat de Discord](https://img.shields.io/badge/Participa%20a%20la%20comunitat%20de%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Si Arroxy t'estalvia temps, una ⭐ ajuda que altres el trobin.

</div>

> **Què és Arroxy?** Arroxy és una interfície d'escriptori gratuïta i de codi obert que descarrega vídeos, àudio, llistes de reproducció i subtítols de YouTube i de més de 2000 llocs compatibles amb [yt-dlp](https://github.com/yt-dlp/yt-dlp). Funciona a Windows 10/11, macOS 13+ (Intel + Apple Silicon) i Linux (AppImage, Flatpak, tar.gz). Llicència GPLv3. Sense anuncis ni límits d'ús. Es distribueix mitjançant [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage i descàrrega directa.
>
> **La diferència clau: un navegador integrat.** La majoria de descarregadors gratuïts de YouTube són embolcalls prims de yt-dlp: un quadre d'URL i un menú de formats, sense navegador propi. Arroxy en té un, la **pestanya Explora**. Navegues per YouTube o per qualsevol altre lloc dins de l'aplicació i descarregues el vídeo, la llista o el canal on ets, o fas clic dret en qualsevol enllaç. Inicies la sessió una vegada a Explora i Arroxy baixa els vídeos privats, només per a membres i amb restricció d'edat que el teu compte pot veure, a més de les teves llistes Mira-ho més tard i M'agrada, sense exportar galetes. Hi inicies la sessió també en altres llocs, i les seves descàrregues faran servir aquest inici de sessió quan el necessitin. Arroxy ho torna a provar amb aquest inici de sessió quan YouTube et demana confirmar que no ets un robot. El seu navegador integrat també obté el testimoni que YouTube espera abans d'una descàrrega, perquè YouTube no redueixi una descàrrega a menys formats. Un embolcall amb quadre d'URL es troba amb tots aquests límits. Detalls: [Per què Arroxy](#why-explore).
>
> _Última actualització: 2026-10-22._

> 🌐 Aquesta traducció s'ha fet amb ajuda de la IA. El [README en anglès](../../README.md) és la font principal. Has trobat un error? [Obre una PR](../../../../pulls).

---

## Contingut

- [✨ Funcions](#features)
- [📥 Instal·lació i primer inici](#install)
  - [Primer inici a Windows](#windows-first-launch)
  - [Primer inici a macOS](#macos-first-launch)
  - [Per què pots veure una advertència](#why-warning)
  - [Primer inici a Linux](#linux-first-launch)
  - [Verifica la teva descàrrega (SHA256)](#verify)
- [⚖️ Per què Arroxy](#why)
- [🔒 Privadesa](#privacy)
- [❓ Preguntes freqüents](#faq)
- [🗺️ Full de ruta](#roadmap)
- [💖 Dona suport a Arroxy](#support)
- [🛠️ Construït amb](#tech)
- [📜 Condicions d'ús](#terms)

---

## <a id="features"></a>✨ Funcions

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ca/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explora</b><br/>Navega per YouTube o per qualsevol altre lloc dins d'Arroxy i descarrega la pàgina on ets amb el teu perfil actiu</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>La primera pantalla d'Explora</b><br/>Una ullada ràpida a Explora i per què un compte secundari és l'inici de sessió més segur</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descàrregues t'avisa del que et necessita</b><br/>Els enllaços es preparen en segon pla; un de fallit ofereix la solució, una llista llarga espera la teva decisió</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ca/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Descarrega només un fragment d'un vídeo</b><br/>Tria un inici i un final, o un capítol — Arroxy desa només aquest interval</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ca/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR a 60 fps</b><br/>Totes les resolucions, còdecs i fluxos HDR que ofereix un vídeo, un al costat de l'altre</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ca/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editor de perfils</b><br/>Ajusta un perfil: tipus de fitxer, resolució, subtítols, destinació, plantilla de nom de fitxer i més</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ca/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Fosc o clar, vidre o sòlid</b><br/>Quatre aspectes per triar: panells de vidre sobre un cel en moviment o superfícies sòlides i discretes, cadascun en fosc i en clar</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Drecera global de descàrrega d'Arroxy — Ctrl+Shift+D a Windows i Linux, Cmd+Shift+D a macOS, que envia l'enllaç copiat directament a la cua de descàrregues" width="760" /></picture><br/><sub><b>Drecera global de descàrrega</b><br/>Copia un enllaç on sigui, prem una vegada — arriba a la cua i comença a descarregar-se</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/ca/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Perfils per element de la llista</b><br/>Dona a cada vídeo el seu propi perfil — arxiva'n alguns en 4K i baixa la resta com a MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Inici de la Descàrrega ràpida</b><br/>Enganxa una URL i descarrega-la a l'instant amb el teu perfil actiu</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Perfils de descàrrega reutilitzables</b><br/>Desa valors predefinits de format, qualitat i sortida — reutilitza'ls a cada descàrrega</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Pistes d'àudio en diversos idiomes</b><br/>Tria l'idioma d'àudio exacte que inclou un vídeo</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Àudio envoltant / Dolby</b><br/>Les pistes 5.1 i Dolby es detecten i es conserven</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Mode d'URL en bloc</b><br/>Enganxa una llista, elimina els duplicats automàticament i posa-ho tot a la cua alhora</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/ca/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Cua de descàrregues en paral·lel</b><br/>Diverses descàrregues alhora amb progrés en directe</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explora: navega per la web dins d'Arroxy</strong></summary>

- **Pestanya Explora** — navega per YouTube o per qualsevol altre lloc dins d'Arroxy i descarrega el que trobis sense copiar enllaços. **Descarrega · *el teu perfil*** posa a la cua el vídeo, la llista de reproducció o el canal que estàs mirant; la fletxa que hi ha al costat canvia de perfil i la vareta obre la descàrrega pas a pas per triar formats, subtítols i més
- **Clic dret per descarregar** — fes clic dret en qualsevol enllaç de vídeo, llista de reproducció o canal a Explora per baixar-lo amb el teu perfil, triar un altre perfil a **Descarrega amb**, obrir la descàrrega pas a pas o copiar l'enllaç. No cal obrir cada vídeo abans
- **Disseny compacte** — un clic a la barra d'eines d'Explora hi mou les pestanyes d'Arroxy i dona més espai a la pàgina
- **Barra d'adreces** — escriu per cercar a YouTube o introdueix qualsevol adreça web per obrir aquest lloc
- **Descàrregues que requereixen un compte** — inicia la sessió una vegada a Explora i Arroxy podrà baixar els vídeos privats i només per a membres que el teu compte pot veure, els vídeos amb restricció d'edat si el compte té l'edat verificada i les teves llistes Mira-ho més tard i M'agrada. Inicia també la sessió en altres llocs i les seves descàrregues faran servir aquest inici de sessió quan el necessitin. Arroxy continua baixant primer sense sessió i només fa servir el teu inici de sessió a Explora quan una descàrrega falla d'una manera que un compte pot resoldre. Quan YouTube et demana confirmar que no ets un robot, Arroxy també prova el teu inici de sessió a Explora
- **Fes servir un compte secundari** — la primera pantalla d'Explora n'explica el motiu: descarregar amb un compte comporta cert risc que el compte quedi restringit. Tanca la sessió d'Explora des de la configuració quan vulguis oblidar els teus inicis de sessió
- **Blocador d'anuncis** — desactivat de manera predeterminada. Un clic a l'escut de la barra d'eines d'Explora bloqueja anuncis i rastrejadors a les seves pàgines, sense afectar les descàrregues. És possible que YouTube posi traves als blocadors d'anuncis als comptes amb la sessió iniciada

</details>

<details>
<summary><strong>🎞️ Qualitat i formats</strong></summary>

- Fins a **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Alta taxa de fotogrames i HDR** conservats tal qual — 60 fps, HDR10
- **Àudio** — exporta només l'àudio com a MP3, M4A/AAC, Opus o WAV. En les descàrregues interactives, tria les pistes envoltants/Dolby originals de la font (AC-3, E-AC-3, 5.1, DRC) quan hi siguin, o defineix un valor global **Prefereix envoltant / Dolby**
- **Perfils amb un objectiu** — *Millor imatge* (AV1 · VP9) o *Smart TV* (MP4 · H.264), desats com a Automàtic, MP4, MKV o WebM sense recodificar. L'HDR és *Automàtic* (només quan la teva pantalla el pot mostrar), *SDR* o *HDR*
- **Tots els còdecs a totes les resolucions** — la descàrrega pas a pas llista AV1, VP9 i H.264 un al costat de l'altre a cada resolució, de manera que pots triar el que reprodueix el teu televisor o editor
- **Sap què és realment un flux** — es marquen les mides que YouTube ha escalat amb IA, els idiomes d'àudio doblats amb IA, els fluxos amb taxa de bits millorada, els vídeos de 360° i les còpies malmeses o amb marca d'aigua. Els perfils ometen els fluxos escalats amb IA tret que els permetis

</details>

<details>
<summary><strong>🛡️ Privadesa i control</strong></summary>

- Processament 100% local — les descàrregues van directament de YouTube al teu disc
- **Codi obert** — cada línia es pot auditar, amb llicència GPLv3
- Fitxers desats directament a la carpeta que triïs

</details>

<details>
<summary><strong>⚡ Flux de treball</strong></summary>

- **Drecera global de descàrrega** — copia un enllaç en qualsevol aplicació i prem `Ctrl+Shift+D` (`Cmd+Shift+D` a macOS); Arroxy el posa a la cua amb el teu perfil actiu sense obrir la finestra, i una notificació ho confirma. Activada de manera predeterminada i reassignable
- **Modes d'inici flexibles** — tria entre una descàrrega individual guiada, un selector de llista de reproducció/canal, enganxar URL en bloc, Descàrrega ràpida amb valors desats, o navegar i descarregar des d'Explora
- **Cua de descàrregues central** — cada tasca individual, de llista, en bloc o ràpida arriba a un sol lloc per controlar-ne el progrés, la pausa, la represa, la cancel·lació, el reintent i la prioritat
- **Vigilància del porta-retalls** — copia l'enllaç d'un vídeo i omple el camp d'URL quan tornes a Arroxy, amb **Desfés** si no ho volies. Mentre Arroxy està ocupat, l'enllaç espera fins que tornis a la pestanya d'URL (desactiva-ho a la configuració)
- **Neteja automàtica d'URL** — elimina els paràmetres de seguiment (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) i desembolica els enllaços `youtube.com/redirect`
- **Mode safata** — en tancar la finestra, les descàrregues continuen en segon pla
- **50 idiomes** — detecta automàticament la configuració regional del sistema i es pot canviar en qualsevol moment
- **Sincronització de llistes** — torna a examinar una llista de reproducció amb una carpeta local per ometre els vídeos ja baixats; genera un fitxer de llista `.m3u` que s'actualitza a mesura que es baixa cada vídeo
- **Controls de velocitat i ritme** — limita l'ample de banda de descàrrega, defineix quantes parts d'un vídeo es baixen alhora i afegeix retards entre sol·licituds amb valors predefinits (*Desactivada · Equilibrada · Cautelosa · Personalitzada*)
- **Plantilles de nom de fitxer** — posa nom a les descàrregues a la teva manera amb `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` i `{playlist_index}`, de manera global o per perfil de descàrrega
- **Descàrregues alhora i reintent automàtic** — tria quantes descàrregues de la cua s'executen al mateix temps i deixa que Arroxy torni a provar una descàrrega que ha topat amb un problema de xarxa o de servidor, esperant més abans de cada intent
- **Perfils per element de la llista** — assigna a cada vídeo d'una llista de reproducció el seu propi perfil de descàrrega en lloc d'una sola configuració per a tota la llista, de manera que en una sola passada pots arxivar alguns a màxima qualitat i baixar la resta com a MP3
- **La Descàrrega ràpida funciona en segon pla** — l'enllaç apareix de seguida a Descàrregues i s'hi prepara, una nota amb **Mostra** ho confirma i el camp d'URL es buida per al proper enllaç. Inicia'n tants com vulguis mentre els anteriors es preparen
- **Descàrregues t'avisa del que et necessita** — si Arroxy no pot llegir un enllaç, la seva fila diu per què i ofereix la solució: Torna-ho a provar, activar les galetes o iniciar la sessió a Explora. Amb les galetes desactivades, **Inicia la sessió a Explora** ho torna a provar per tu quan hi has iniciat la sessió. Una llista de reproducció més llarga que el teu límit de càrrega espera a la seva fila que triïs tota la llista, els primers elements o una revisió. La pestanya Descàrregues compta les files que t'esperen
- **Descarrega només un fragment d'un vídeo** — tria un inici i un final, o un capítol, a la pantalla Format i Arroxy desa només aquest interval, amb l'interval al nom després de l'identificador del vídeo. Els talls cauen al fotograma clau més proper; activa el tall exacte per recodificar-lo
- **Elimina les descàrregues acabades** — opcional: una descàrrega acabada surt de la llista 5 segons després. Els seus fitxers es queden al disc i les descàrregues fallides continuen a la llista
- **Mida i Falta a Descàrregues** — una columna **Mida** ordenable mostra quant d'espai ocupa cada descàrrega, i **Falta** assenyala els fitxers moguts o suprimits fora d'Arroxy
- **Aurora o Minimal, fosc o clar** — panells de vidre sobre un cel en moviment, o superfícies sòlides i discretes; canvia des del peu de pàgina. Els ordinadors sense acceleració gràfica reben Minimal automàticament
- **Barra de menús del Mac** — a macOS, obre la configuració (`Cmd+,`), defineix el límit de velocitat de descàrrega, canvia l'estil i el tema, i obre els registres o desa un fitxer de diagnòstic des de la barra de menús
- **Canvia un perfil des de qualsevol descàrrega** — ajusta una descàrrega i després actualitza el perfil del qual ha partit (amb una previsualització del que canvia) o desa la configuració com a perfil nou. En canviar de perfil, es pregunta si vols conservar les teves edicions

</details>

<details>
<summary><strong>📝 Subtítols i postprocessament</strong></summary>

- **Subtítols** en SRT, VTT o ASS — manuals o autogenerats, en qualsevol idioma disponible
- Desa'ls al costat del vídeo, incrusta'ls en un `.mkv` o organitza'ls en una subcarpeta `Subtitles/`
- **Lots només de subtítols** — enganxa una llista d'URL o obre una llista de reproducció, tria Subtítols i obtén només els fitxers de subtítols de cada vídeo
- **SponsorBlock** — omet o marca com a capítols els patrocinis, les introduccions, els finals i l'autopromoció
- **Metadades incrustades** — títol, data de pujada, canal, descripció, miniatura i marcadors de capítol escrits dins del fitxer

</details>

<details>
<summary><strong>🌐 YouTube + 2000 llocs</strong></summary>

- **YouTube, al complet** — Vídeos, Shorts, Canals, Llistes de reproducció, YouTube Music i Pòdcasts tractats com a fonts de primera classe
- **Més de 2000 llocs més** mitjançant yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable i molts més
- **Només àudio i subtítols** funcionen a tots els llocs compatibles, no només a YouTube
- Si un lloc canvia, yt-dlp publica correccions cada setmana i Arroxy actualitza el binari automàticament en iniciar-se

</details>

---

## <a id="install"></a>📥 Instal·lació i primer inici

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

Les compilacions són només x86_64. No tens `curl`? Canvia `curl -fsSL` per `wget -qO-`.

| Plataforma | Descàrrega directa |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Tots els fitxers de la versió →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Primer inici a Windows</strong></summary>

En el primer inici potser veuràs **«Windows ha protegit el teu ordinador»** o **«Editor desconegut»**. Això afecta tant `Arroxy-win-x64-Setup.exe` com `Arroxy-win-x64-Portable.exe`. Arroxy és gratuït i de codi obert, i les compilacions de Windows no estan signades amb un certificat de pagament, per això SmartScreen les marca. **No** vol dir automàticament que Arroxy no sigui segur. Per continuar:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="Diàleg de SmartScreen «Windows ha protegit el teu ordinador» amb l'enllaç «Més informació» ressaltat" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="Diàleg de SmartScreen després d'ampliar Més informació, amb el botó «Executa igualment»" />
</div>

1. Fes clic a **Més informació**.
2. Fes clic a **Executa igualment**.

#### Si Windows Defender marca o elimina el fitxer

De vegades, l'heurística de Defender marca com a sospitosos els instal·ladors NSIS sense signar i els Electron portàtils. Si Defender posa en quarantena `Arroxy-win-x64-Setup.exe` o `Arroxy-win-x64-Portable.exe`, restaura'l des de **Seguretat de Windows → Protecció contra virus i amenaces → Historial de protecció** i afegeix després l'executable d'Arroxy com a element permès a **Gestiona la configuració → Afegeix o elimina exclusions**. Igual que amb SmartScreen, el motiu és la falta de signatura de l'editor, no programari maliciós detectat.

> Descarrega Arroxy només de la pàgina oficial de versions de GitHub. Si has obtingut el fitxer d'un altre lloc web o te l'ha enviat algú, suprimeix-lo i baixa'n una còpia nova de la font oficial. El codi font és públic, així que el pots inspeccionar o compilar Arroxy tu mateix si ho prefereixes.

Prefereixes Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Primer inici a macOS</strong></summary>

Les compilacions d'Arroxy per a macOS estan signades ad hoc però no certificades per Apple, així que Gatekeeper bloqueja el primer inici amb *«Arroxy.app» no s'ha obert — Apple no ha pogut verificar que «Arroxy.app» no contingui programari maliciós*. Això vol dir que macOS no pot comprovar l'aplicació amb Apple, no que hi hagi res malament amb els fitxers. Instal·lar amb Homebrew evita aquest diàleg del tot. Si has fet servir el DMG, una ordre al Terminal ho soluciona:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Arrossega `Arroxy.app` des del DMG muntat fins a `/Applications`.
2. Obre el Terminal i executa aquestes dues ordres:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

La primera ordre elimina l'atribut de quarantena que macOS va adjuntar quan es va baixar el fitxer; la segona inicia l'aplicació. Normalment no necessites `sudo`, perquè la còpia a `/Applications` és teva — afegeix-lo només si obtens un error de permisos.

**Apple Silicon o Intel:** en un Mac de la sèrie M (M1 / M2 / M3 / M4), baixa el DMG `arm64`. En els Mac Intel, baixa el DMG `x64`. Executar la compilació equivocada continua funcionant mitjançant Rosetta, però és notablement més lent.

> Les compilacions de macOS es produeixen mitjançant CI en executors Apple Silicon i Intel. Si tens problemes, [obre una incidència](../../../../issues): els comentaris dels usuaris de macOS donen forma activament al cicle de proves de macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Per què pots veure una advertència</strong></summary>

Arroxy és de codi obert i té llicència GPLv3. Les compilacions de Windows i macOS **no estan signades**: els certificats de signatura Apple Developer ID i Windows EV costen centenars de dòlars l'any, cosa que un projecte independent paga de la seva butxaca. Sense aquestes signatures, Windows SmartScreen i macOS Gatekeeper t'avisaran en el primer inici. Les advertències signifiquen que *el teu sistema operatiu no reconeix l'editor*; no signifiquen que Arroxy sigui programari maliciós.

Tres maneres de verificar Arroxy tu mateix, per ordre creixent de rigor:

- **Llegeix el codi font.** Cada línia és a [GitHub](https://github.com/antonio-orionus/Arroxy) i el pots [compilar des del codi font](#tech).
- **Comprova el SHA256.** Compara el teu fitxer amb el [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) publicat — consulta [Verifica la teva descàrrega](#verify) a continuació.
- **Fes una anàlisi de tercers.** Puja el fitxer a [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Primer inici a Linux</strong></summary>

Els AppImage s'executen directament, sense instal·lació. Només cal marcar el fitxer com a executable.

**Gestor de fitxers:** fes clic dret a l'`.AppImage` → **Propietats** → **Permisos** → activa **Permet executar el fitxer com a programa** i després fes-hi doble clic.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Si l'inici continua fallant, executa'l sense muntar-lo — no cal cap paquet FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Integració opcional amb l'escriptori:** instal·la [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) una vegada i qualsevol AppImage al qual facis doble clic es registrarà automàticament al menú de l'iniciador — sense necessitat de cap fitxer `.desktop` manual.

**Tarball senzill (sense FUSE, sense instal·lació):**

La compilació `.tar.gz` és la mateixa aplicació sense l'embolcall d'AppImage — extreu-la on vulguis i executa-la. Sense instal·lador i sense cap paquet FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Les descàrregues de Linux de la pàgina de versions són només x86_64.** En màquines ARM64 (Raspberry Pi, Asahi Linux) el Flatpak s'instal·la igualment, però falla en iniciar-se amb `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verifica la teva descàrrega (SHA256)</strong></summary>

Cada versió publica un fitxer `SHA256SUMS` al costat dels binaris. Per comprovar que la teva descàrrega no s'ha corromput ni manipulat durant el trànsit, calcula el hash del teu fitxer en local i compara'l amb la línia de `SHA256SUMS`. Obre la pàgina de l'última versió → **Assets** → baixa `SHA256SUMS`.

**Windows (PowerShell o Símbol del sistema):**

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

Vols una anàlisi de programari maliciós de tercers? Puja el fitxer a [VirusTotal](https://www.virustotal.com). Un grapat d'avisos d'heurística genèrica de motors menors és normal en aplicacions Electron sense signar; deteccions generalitzades de motors importants serien una preocupació real.

</details>

<details>
<summary><strong>📦 Windows: instal·lador o portàtil</strong></summary>

|               | Instal·lador NSIS | `.exe` portàtil |
| ------------- | :----------------------: | :---------------------: |
| Cal instal·lar-lo | Sí  | No — s'executa des de qualsevol lloc  |
| Actualitzacions automàtiques | ✅ dins de l'aplicació  | ❌ descàrrega manual  |
| Velocitat d'inici | ✅ més ràpid  | ⚠️ inici en fred més lent  |
| S'afegeix al menú Inici |            ✅            |           ❌            |
| Desinstal·lació fàcil |            ✅            | ❌ suprimeix el fitxer  |

**Recomanació:** fes servir l'instal·lador NSIS per tenir actualitzacions automàtiques i un inici més ràpid. Fes servir l'`.exe` portàtil si vols una opció sense instal·lació i sense registre.

</details>

---

## <a id="why"></a>⚖️ Per què Arroxy

Una comparació cara a cara amb les alternatives més habituals:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Navegador integrat (navegar, iniciar la sessió, descarregar) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Vídeos privats, només per a membres i amb restricció d'edat sense exportar galetes |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratuït, sense nivell premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Codi obert |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Només processament local |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Sense límits d'ús |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Aplicació d'escriptori multiplataforma |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtítols + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = en part, o només en un nivell de pagament. A 4K Video Downloader, l'inici de sessió dins de l'aplicació per als vídeos privats és una funció de pagament; la majoria de les interfícies gràfiques gratuïtes de yt-dlp només accepten un fitxer de galetes o llegeixen les galetes del teu navegador.

Arroxy està pensat per a una sola cosa: un fitxer local net, tant si enganxes una URL com si trobes el vídeo a Explora. Sense vendes addicionals, sense recollida de dades.

### <a id="why-explore"></a>🧭 El que un simple embolcall de yt-dlp no pot fer: la pestanya Explora

La majoria de descarregadors gratuïts de YouTube són un quadre d'URL sobre yt-dlp. Arroxy també fa servir yt-dlp, però a més té **Explora**, un navegador integrat a l'aplicació que obre YouTube o qualsevol altre lloc. Explora supera límits que un quadre d'URL no pot:

- **Vídeos que requereixen un compte, sense exportar galetes** — vídeos privats, només per a membres i amb restricció d'edat (en un compte amb l'edat verificada), a més de les teves llistes Mira-ho més tard i M'agrada, i vídeos darrere d'un inici de sessió en altres llocs. Un embolcall simple necessita una exportació de cookies.txt o ha de llegir les galetes del teu navegador, cosa que Chrome a Windows ara bloqueja. A Arroxy inicies la sessió una vegada a Explora i ell fa la resta
- **Sense copiar enllaços** — troba un vídeo, una llista de reproducció o un canal a Explora i descarrega'l amb un sol clic, o fes clic dret en qualsevol enllaç de la pàgina
- **Blocador d'anuncis quan el vulguis** — un clic a l'escut bloqueja anuncis i rastrejadors a les pàgines d'Explora

---

## <a id="privacy"></a>🔒 Privadesa

Les descàrregues s'obtenen directament mitjançant [yt-dlp](https://github.com/yt-dlp/yt-dlp) de YouTube a la carpeta que triïs — res no passa per un servidor de tercers. L'historial de reproducció, l'historial de descàrregues, les URL i el contingut dels fitxers es queden al teu dispositiu.

No tracking — one anonymous heartbeat a day (app version, OS, language, install channel, country and roughly how long ago Arroxy was installed) so we can count active and new users, and, when Arroxy downloads or updates yt-dlp and FFmpeg, an anonymous note on whether that worked and roughly how long it took. No IDs, URLs, video titles, file paths or account info. You can turn both off in Settings.

Explora conserva els seus propis inicis de sessió, separats del teu navegador, i Arroxy mai no llegeix ni emplena un formulari d'inici de sessió — escrius a la pàgina del mateix lloc. Les descàrregues s'executen sense sessió; només quan una falla d'una manera que un compte pot resoldre, Arroxy llegeix l'inici de sessió de nou, el guarda en un fitxer temporal per a aquella descàrrega i suprimeix el fitxer després. Tancar la sessió d'Explora a la configuració els oblida.

---

## <a id="faq"></a>❓ Preguntes freqüents

<details>
<summary><strong>De debò és gratuït?</strong></summary>

Sí — amb llicència GPLv3, sense nivell premium, sense funcions bloquejades.

</details>

<details>
<summary><strong>En què es diferencia Arroxy d'altres interfícies gràfiques de yt-dlp?</strong></summary>

La majoria d'interfícies gràfiques gratuïtes de yt-dlp són embolcalls que només accepten un enllaç. Arroxy hi afegeix **Explora**, un navegador integrat a l'aplicació que obre YouTube o qualsevol altre lloc: navegues i descarregues sense copiar enllaços, i hi inicies la sessió una vegada per baixar vídeos privats, només per a membres i amb restricció d'edat i les teves llistes Mira-ho més tard i M'agrada, sense exportar galetes. Arroxy fa servir aquest inici de sessió quan YouTube et demana confirmar que no ets un robot, i el seu navegador integrat obté el testimoni de descàrrega de YouTube perquè les descàrregues no es quedin amb menys formats. Consulta [Per què Arroxy](#why).

</details>

<details>
<summary><strong>Quines qualitats de vídeo puc baixar?</strong></summary>

Tot el que serveix YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, a més de només àudio. Els fluxos de 60 fps i HDR es conserven tal qual, i la descàrrega pas a pas et deixa triar AV1, VP9 o H.264 a cada resolució.

</details>

<details>
<summary><strong>Puc extreure només l'àudio com a MP3?</strong></summary>

Sí. Tria *només àudio* al menú de formats i selecciona MP3, M4A/AAC, Opus o WAV.

</details>

<details>
<summary><strong>Com baixo vídeos que requereixen un compte de YouTube?</strong></summary>

Inicia la sessió una vegada a la pestanya Explora. Després Arroxy podrà baixar els vídeos privats i només per a membres que el teu compte pot veure, els vídeos amb restricció d'edat si el compte té l'edat verificada i les teves llistes Mira-ho més tard i M'agrada. Fa servir l'inici de sessió només quan una descàrrega falla d'una manera que un compte pot resoldre; tota la resta es baixa com abans. És l'opció **Inici de sessió a Explora**, que apareix primera i marcada com a Recomanada a la configuració de galetes, i Arroxy la tria per tu la primera vegada que obres Explora. La wiki de yt-dlp assenyala que [l'automatització amb sessió iniciada pot fer que es marqui un compte de Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), així que un compte secundari és l'opció més segura.

</details>

<details>
<summary><strong>Continuarà funcionant quan YouTube canviï alguna cosa?</strong></summary>

yt-dlp s'actualitza automàticament en iniciar-se, i Arroxy publica correccions de pressa quan YouTube canvia alguna cosa. Quan YouTube et demana confirmar que no ets un robot, Arroxy també prova el teu inici de sessió a Explora si hi has iniciat la sessió, i a la configuració de galetes tens disponibles les galetes d'un fitxer o del teu navegador.

</details>

<details>
<summary><strong>En quins idiomes està disponible Arroxy?</strong></summary>

50 idiomes, de sèrie: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy detecta automàticament l'idioma del teu sistema operatiu en el primer inici i el pots canviar en qualsevol moment des del selector d'idioma de la barra d'eines. Els JSON de configuració regional d'execució són a src/shared/i18n/locales/, i els catàlegs PO per als traductors són a i18n/locales/ — obre una PR a GitHub per contribuir-hi.

</details>

<details>
<summary><strong>Necessito instal·lar res més?</strong></summary>

No. yt-dlp, ffmpeg i ffprobe es baixen automàticament en el primer inici i es desen a la memòria cau de la teva màquina. Després, no cal cap configuració addicional.

</details>

<details>
<summary><strong>Puc baixar llistes de reproducció o canals sencers?</strong></summary>

Sí — tots dos. Enganxa l'URL d'una llista de reproducció o d'un canal (p. ex., `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); tria quantes entrades vols examinar i després posa a la cua tota la llista o tria vídeos concrets. Els filtres per interval de dates arribaran aviat.

</details>

<details>
<summary><strong>macOS diu que «l'aplicació està malmesa» — què faig?</strong></summary>

És macOS Gatekeeper bloquejant una aplicació sense signar, no un dany real. Consulta [Primer inici a macOS](#macos-first-launch) per veure les ordres del Terminal que eliminen la quarantena i inicien Arroxy.

</details>

<details>
<summary><strong>És legal descarregar vídeos de YouTube?</strong></summary>

Per a ús personal i privat, en general s'accepta a la majoria de jurisdiccions. Ets responsable de complir les [Condicions del servei](https://www.youtube.com/t/terms) de YouTube i les lleis de drets d'autor del teu país.

</details>

---

## <a id="roadmap"></a>🗺️ Full de ruta

Encara previst — aproximadament per ordre de prioritat:

| Funció    | Descripció    |
| ---------------- | ---------------- |
| **Filtres de llistes i canals** | Filtres per interval de dates en enumerar una llista de reproducció o un canal |
| **Preferències de pista d'àudio de YouTube** | Defineix una preferència de pista d'idioma parlat per a tota l'aplicació, amb substitucions per perfil quan YouTube ofereixi diverses pistes d'àudio |
| **Recuperació de reintents més sòlida** | Un nou camí de reintent per a les descàrregues interrompudes per connexions a internet poc fiables o problemàtiques |
| **Calaix complet del gestor de descàrregues** | Convertir el calaix de la cua en un gestor més complet, inclòs el canvi de les carpetes de destinació dels elements en cua |
| **Descàrregues programades** | Iniciar una cua a una hora determinada (execucions nocturnes) |
| **Paquet d'AUR** | Instal·la a Arch Linux i Omarchy amb `yay -S arroxy-bin` |

Tens alguna funció al cap? [Obre una sol·licitud](../../../../issues) — l'opinió de la comunitat determina la prioritat.

---

## <a id="support"></a>💖 Dona suport a Arroxy

Arroxy is free and GPLv3-licensed — no ads, no tracking, no paid tier. If it saves you time, you can support development with Bitcoin, Tron or Ethereum: the addresses are in [DONATE.md](../../DONATE.md), which is the only official source for them. Arroxy will never send you an address by email or direct message. Starring the repo, reporting bugs, and improving translations help just as much.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Construït amb

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell d'escriptori multiplataforma
- **React 19** + **TypeScript** — interfície d'usuari
- **Tailwind CSS v4** — estils
- **Zustand** — gestió de l'estat
- **yt-dlp** + **ffmpeg** — motor de descàrrega i muxing (tots dos s'obtenen en temps d'execució: yt-dlp es manté actualitzat; ffmpeg/ffprobe s'instal·len una sola vegada i es conserven entre actualitzacions)
- **Vite** + **electron-vite** — eines de compilació
- **Vitest** + **Playwright** — proves unitàries i d'extrem a extrem

</details>

<details>
<summary><strong>Compilar des del codi font</strong></summary>

### Requisits previs — totes les plataformes

| Eina    | Versió  | Instal·lació |
| ------- | ------- | ------------ |
| Git     | qualsevol | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` o `.node-version` |
| Bun     | 1.4.2  | `mise install` o `package.json` `packageManager` |

Recomanat: instal·la `mise` i després executa `mise install` al checkout. Sense mise, activa manualment Node.js des de `.node-version` i Bun des de `package.json` abans de `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Pot ser que calguin Visual Studio Build Tools i Python per a les recompilacions natives.

### macOS

```bash
brew install mise
xcode-select --install
```

Després de clonar, executa `mise trust && mise install` des del checkout. Si el teu shell ja fa servir `fnm`, `nvm` o un Bun instal·lat amb Homebrew, activa mise a `~/.zshrc` perquè Arroxy faci servir Node.js 24.21.0 i Bun 1.4.2:

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

# Dependències de compilació i d'execució d'Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Només per a les proves E2E (Electron necessita una pantalla)
sudo apt install -y xvfb
```

### Clonar i executar

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recomanat; omet-ho si has activat manualment les eines fixades
bun run bootstrap
bun run doctor
bun run dev            # aplicació Electron amb el renderitzador de Vite
```

### Generar un distribuïble

```bash
bun run build        # comprovació de tipus + compilació
bun run dist         # empaqueta per al sistema operatiu actual
bun run dist:win     # empaqueta per a Windows quan s'executa en un amfitrió compatible
```

> `bun run bootstrap` instal·la les dependències, recompila les dependències de l'aplicació Electron, verifica Electron, prepara ffmpeg/ffprobe incrustats per al desenvolupament i instal·la Chromium de Playwright. Les versions publicades gestionen yt-dlp, ffmpeg i ffprobe en temps d'execució a la carpeta de dades de l'aplicació; cap d'ells no s'inclou dins de l'instal·lador.

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

## <a id="terms"></a>📜 Condicions d'ús

Arroxy és una eina només per a ús personal i privat. Ets l'únic responsable d'assegurar que les teves descàrregues compleixin les [Condicions del servei](https://www.youtube.com/t/terms) de YouTube i les lleis de drets d'autor de la teva jurisdicció. No facis servir Arroxy per descarregar, reproduir ni distribuir contingut que no tinguis dret a utilitzar. Els desenvolupadors no es fan responsables de cap mal ús.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Fet amb cura per <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
