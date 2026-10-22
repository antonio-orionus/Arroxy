<div align="center">
  <img src="../../src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy talismanas" width="180" />

# Arroxy — nemokama atvirojo kodo YouTube (+ 2000 svetainių) atsisiuntimo programa su integruota naršykle, skirta Windows, macOS ir Linux

**Built-in browser · Your own sign-in · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Skaityti kalba:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Català](README.ca.md) · [Čeština](README.cs.md) · [Dansk](README.da.md) · [Deutsch](README.de.md) · [Eesti](README.et.md) · [English](../../README.md) · [Español](README.es.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Hrvatski](README.hr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [Latviešu](README.lv.md) · **Lietuvių** · [Magyar](README.hu.md) · [Nederlands](README.nl.md) · [Norsk bokmål](README.nb.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Română](README.ro.md) · [Slovenčina](README.sk.md) · [Slovenščina](README.sl.md) · [Suomi](README.fi.md) · [Svenska](README.sv.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [עברית](README.he.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Laida](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Kūrinys](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Svetainė](https://img.shields.io/badge/website-arroxy.com-blueviolet)](https://arroxy.com/) ![Licencija](https://img.shields.io/badge/license-GPLv3-blue) ![Platformos](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Kalbos](https://img.shields.io/badge/i18n-50_languages-blue)

Atsisiųskite vaizdo įrašus, Shorts, kanalus, tinklalaides ar garso takelius iš **YouTube ir daugiau nei 2000 palaikomų svetainių** — iki 8K HDR esant 60 kadrų/s, kaip MP3 / AAC / Opus arba tik reikiamą dalį. **Naršykite YouTube ar bet kurią kitą svetainę Arroxy viduje** skirtuke „Naršymas“ ir atsisiųskite vaizdo įrašą, grojaraštį ar kanalą, kuriame esate; prisijunkite ten, kad atsisiųstumėte vaizdo įrašus, kuriuos jūsų paskyra jau gali žiūrėti. Veikia vietoje Windows, macOS ir Linux sistemose. **Be reklamų, be nereikalingų priedų, be priverstinio pardavimo.**

[**↓ Įdiegti naujausią laidą**](#install) &nbsp;·&nbsp; [**Svetainė**](https://arroxy.com/) &nbsp;·&nbsp; [Pirmasis paleidimas Windows sistemoje](#windows-first-launch) · [Pirmasis paleidimas macOS sistemoje](#macos-first-launch) · [Pirmasis paleidimas Linux sistemoje](#linux-first-launch)

[![Prisijunkite prie Discord bendruomenės](https://img.shields.io/badge/Prisijunkite%20prie%20Discord%20bendruomen%C4%97s-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<table>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Main-screenshot.webp" alt="Arroxy — Quick Download home" /></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" /></td>
  </tr>
</table>

Jei Arroxy taupo jūsų laiką, ⭐ padės kitiems ją rasti.

</div>

> **Kas yra Arroxy?** Arroxy yra nemokama atvirojo kodo darbalaukio sąsaja, atsisiunčianti vaizdo įrašus, garso įrašus, grojaraščius ir subtitrus iš YouTube ir daugiau nei 2000 kitų [yt-dlp](https://github.com/yt-dlp/yt-dlp) palaikomų svetainių. Veikia Windows 10/11, macOS 13+ (Intel + Apple Silicon) ir Linux (AppImage, Flatpak, tar.gz) sistemose. Licencija GPLv3. Be reklamų, be naudojimo apribojimų. Platinama per [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage ir tiesioginį atsisiuntimą.
>
> **Pagrindinis skirtumas: integruota naršyklė.** Dauguma nemokamų YouTube atsisiuntimo programų yra plonos yt-dlp apvalkalo programos: URL laukelis ir formatų meniu, be savo naršyklės. Arroxy ją turi – tai **skirtukas „Naršymas“**. Naršote YouTube ar bet kurią kitą svetainę programoje ir atsisiunčiate vaizdo įrašą, grojaraštį ar kanalą, kuriame esate, arba spustelite bet kurią nuorodą dešiniuoju pelės klavišu. Jei Naršyme prisijungiate vieną kartą, atsisiuntimai, kuriems reikia paskyros, naudoja tą prisijungimą: jūsų privatūs vaizdo įrašai, jūsų „Žiūrėti vėliau“ ir „Patikę“ sąrašai bei kiti vaizdo įrašai, kuriuos jūsų paskyra jau gali žiūrėti, be slapukų eksportavimo. Taip pat ten prisijunkite prie kitų svetainių, ir jų atsisiuntimai prireikus naudos tą prisijungimą. Išsamiau: [Kodėl Arroxy](#why-explore).
>
> _Paskutinį kartą atnaujinta: 2026-10-22._

> 🌐 Šis vertimas parengtas padedant DI. [Angliškas README](../../README.md) yra pagrindinis šaltinis. Radote klaidą? [Atverkite PR](../../../../pulls).

---

## Turinys

- [✨ Funkcijos](#features)
- [📥 Diegimas ir pirmasis paleidimas](#install)
  - [Pirmasis paleidimas Windows sistemoje](#windows-first-launch)
  - [Pirmasis paleidimas macOS sistemoje](#macos-first-launch)
  - [Kodėl galite pamatyti įspėjimą](#why-warning)
  - [Pirmasis paleidimas Linux sistemoje](#linux-first-launch)
  - [Patikrinkite savo atsisiuntimą (SHA256)](#verify)
- [⚖️ Kodėl Arroxy](#why)
- [🔒 Privatumas](#privacy)
- [❓ DUK](#faq)
- [🗺️ Plėtros planas](#roadmap)
- [💖 Paremkite Arroxy](#support)
- [🛠️ Technologijos](#tech)
- [📜 Naudojimo sąlygos](#terms)

---

## <a id="features"></a>✨ Funkcijos

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lt/Explore-browsing-screenshot.webp" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Naršymas</b><br/>Naršykite YouTube ar bet kurią kitą svetainę Arroxy viduje ir atsisiųskite puslapį, kuriame esate, su savo aktyviu profiliu</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Explore-screenshot.webp" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Pirmasis Naršymo ekranas</b><br/>Trumpa Naršymo apžvalga ir paaiškinimas, kodėl antrinė paskyra yra saugesnis prisijungimas</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Downloads-attention-screenshot.webp" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Atsisiuntimai parodo, ko iš jūsų reikia</b><br/>Nuorodos ruošiamos fone; nepavykusi pasiūlo sprendimą, ilgas grojaraštis laukia jūsų pasirinkimo</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lt/Part-of-video-screenshot.webp" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Atsisiųskite tik vaizdo įrašo dalį</b><br/>Pasirinkite pradžią ir pabaigą arba skyrių — Arroxy įrašo tik tą intervalą</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lt/8K-HDR-video-screenshot.webp" alt="Arroxy — Format screen for an 8K HDR 60 fps video: AV1 and VP9 in HDR10 and SDR, H.264 up to 1080p, Dolby, AAC and Opus audio" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>8K HDR esant 60 kadrų/s</b><br/>Kiekviena skiriamoji geba, kodekas ir HDR srautas, kurį siūlo vaizdo įrašas, greta</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lt/Profile-editor-screenshot.webp" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profilio redaktorius</b><br/>Sureguliuokite profilį: failo tipą, skiriamąją gebą, subtitrus, paskirtį, failo pavadinimo šabloną ir dar daugiau</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lt/Themes-and-styles-screenshot.webp" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Tamsus ar šviesus, stiklinis ar vientisas</b><br/>Keturi stiliai: stikliniai skydeliai virš judančio dangaus arba ramūs vientisi paviršiai, kiekvienas tamsus ir šviesus</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" /><img src="../../build/Global-hotkey.png" alt="Arroxy visuotinis atsisiuntimo spartusis klavišas — Ctrl+Shift+D Windows ir Linux, Cmd+Shift+D macOS sistemoje, nukopijuotą nuorodą siunčia tiesiai į atsisiuntimų eilę" width="760" /></picture><br/><sub><b>Visuotinis atsisiuntimo spartusis klavišas</b><br/>Nukopijuokite nuorodą bet kur, paspauskite vieną kartą — ji patenka į eilę ir pradedama atsisiųsti</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="../../build/screenshots/lt/Per-item-playlist-profiles-screenshot.webp" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Kiekvieno grojaraščio elemento profiliai</b><br/>Suteikite kiekvienam vaizdo įrašui savo profilį — kai kuriuos užarchyvuokite 4K, likusius išsaugokite tik kaip garsą</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Main-screenshot.webp" alt="Arroxy — Quick Download home" /><br/><sub><b>Greitojo atsisiuntimo pradžia</b><br/>Įklijuokite URL ir iškart atsisiųskite su aktyviu profiliu</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Download-profiles-screenshot.webp" alt="Arroxy — Download profiles" /><br/><sub><b>Pakartotinai naudojami atsisiuntimo profiliai</b><br/>Įrašykite formato, kokybės ir išvesties šablonus — naudokite kiekvienam atsisiuntimui</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Multi-lang-audio-support-screenshot.webp" alt="Arroxy — Multi-language audio" /><br/><sub><b>Kelių kalbų garso takeliai</b><br/>Pasirinkite tikslią vaizdo įrašo garso kalbą</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Dolby-audio-support-screenshot.webp" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Erdvinis / Dolby garsas</b><br/>5.1 ir Dolby takeliai aptinkami ir išsaugomi</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Bulk-urls-mode-screenshot.webp" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Kelių URL režimas</b><br/>Įklijuokite sąrašą, automatiškai pašalinkite dublikatus, įtraukite viską į eilę vienu metu</sub></td>
    <td width="50%" valign="top" align="center"><img src="../../build/screenshots/lt/Downloading-in-parallel-screenshot.webp" alt="Arroxy — Parallel download queue" /><br/><sub><b>Lygiagreti atsisiuntimų eilė</b><br/>Keli atsisiuntimai vienu metu su gyva eiga</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Naršymas: naršykite internete Arroxy viduje</strong></summary>

- **Skirtukas „Naršymas“** — naršykite YouTube ar bet kurią kitą svetainę Arroxy viduje ir atsisiųskite rastą turinį nekopijuodami nuorodų. **Atsisiųsti · *jūsų profilis*** įtraukia į eilę vaizdo įrašą, grojaraštį ar kanalą, kurį žiūrite; šalia esanti rodyklė perjungia profilius, o lazdelė atveria žingsnis po žingsnio atsisiuntimą, kuriame renkamasi formatai, subtitrai ir dar daugiau
- **Atsisiuntimas dešiniuoju pelės mygtuku** — spustelėkite dešiniuoju mygtuku bet kurią vaizdo įrašo, grojaraščio ar kanalo nuorodą Naršyme, kad atsisiųstumėte ją su savo profiliu, pasirinktumėte kitą profilį skiltyje **Atsisiųsti naudojant**, atvertumėte žingsnis po žingsnio atsisiuntimą arba nukopijuotumėte nuorodą. Nereikia pirmiausia atverti kiekvieno vaizdo įrašo
- **Kompaktiškas išdėstymas** — vienas spustelėjimas Naršymo įrankių juostoje perkelia Arroxy skirtukus į ją ir suteikia puslapiui daugiau vietos
- **Adreso juosta** — rašykite, kad ieškotumėte YouTube, arba įveskite bet kurį interneto adresą, kad atvertumėte tą svetainę
- **Atsisiuntimai, kuriems reikia paskyros** — prisijunkite vieną kartą Naršyme, ir Arroxy galės atsisiųsti vaizdo įrašus, kuriuos gali žiūrėti jūsų paskyra: jūsų privačius vaizdo įrašus, amžiaus apribojimą turinčius vaizdo įrašus, jei paskyra patvirtinta pagal amžių, bei jūsų „Žiūrėti vėliau“ ir „Patikę“ sąrašus. Ten taip pat galite prisijungti prie kitų svetainių, ir jų atsisiuntimai naudos tą prisijungimą, kai reikės. Arroxy vis tiek pirmiausia atsisiunčia neprisijungusi ir jūsų prisijungimą per Naršymą naudoja tik tada, kai atsisiuntimas nepavyksta dėl priežasties, kurią gali ištaisyti paskyra
- **Naudokite antrinę paskyrą** — pirmasis Naršymo ekranas paaiškina kodėl: atsisiuntimas su paskyra kelia tam tikrą riziką, kad ta paskyra bus apribota. Kai tik norite pamiršti savo prisijungimus, atsijunkite nuo Naršymo parametruose
- **Skelbimų blokatorius** — pagal numatytuosius parametrus išjungtas. Vienas spustelėjimas ant skydo Naršymo įrankių juostoje blokuoja skelbimus ir sekimo priemones jo puslapiuose, nepaveikdamas atsisiuntimų. YouTube gali priešintis skelbimų blokatoriams prisijungusiose paskyrose

</details>

<details>
<summary><strong>🎞️ Kokybė ir formatai</strong></summary>

- Iki **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Didelis kadrų dažnis ir HDR** išsaugomi tokie, kokie yra — 60 kadrų/s, HDR10
- **Garsas** — eksportuokite tik garsą kaip MP3, M4A/AAC, Opus arba WAV. Interaktyviuose atsisiuntimuose pasirinkite šaltinio originalius erdvinio garso / Dolby takelius (AC-3, E-AC-3, 5.1, DRC), kai jų yra, arba nustatykite bendrąją numatytąją parinktį **Teikti pirmenybę erdviniam / Dolby**
- **Profiliai su tikslu** — *Geriausias vaizdas* (AV1 · VP9) arba *Smart TV* (MP4 · H.264), įrašomi kaip Automatinis, MP4, MKV arba WebM be perkodavimo. HDR yra *Automatinis* (tik kai jūsų ekranas gali jį rodyti), *SDR* arba *HDR*
- **Kiekvienas kodekas kiekvienoje skiriamojoje gebos** — žingsnis po žingsnio atsisiuntimas išvardija AV1, VP9 ir H.264 greta kiekvienoje skiriamojoje gebos, todėl galite pasirinkti tą, kurį atkuria jūsų televizorius ar redaktorius
- **Žinokite, kas iš tikrųjų yra srautas** — pažymimi YouTube DI išdidinti dydžiai, DI įgarsintos garso kalbos, padidintos spartos srautai, 360° vaizdo įrašai ir pažeistos ar su vandenženkliu kopijos. Profiliai praleidžia DI išdidintus srautus, nebent jūs tai leidžiate

</details>

<details>
<summary><strong>🛡️ Privatumas ir kontrolė</strong></summary>

- 100 % vietinis apdorojimas — atsisiuntimai keliauja tiesiai iš YouTube į jūsų diską
- **Atvirasis kodas** — kiekviena eilutė patikrinama, licencija GPLv3
- Failai įrašomi tiesiai į jūsų pasirinktą aplanką

</details>

<details>
<summary><strong>⚡ Darbo eiga</strong></summary>

- **Visuotinis atsisiuntimo spartusis klavišas** — nukopijuokite nuorodą bet kurioje programoje ir paspauskite `Ctrl+Shift+D` (`Cmd+Shift+D` macOS sistemoje); Arroxy įtraukia ją į eilę su jūsų aktyviu profiliu neatverdama lango, o pranešimas tai patvirtina. Įjungta pagal numatytuosius parametrus, galima pakeisti
- **Lankstūs paleidimo režimai** — rinkitės vedamą atskirą atsisiuntimą, grojaraščio / kanalo parinkiklį, kelių URL įklijavimą, greitąjį atsisiuntimą su įrašytais numatytaisiais parametrais arba naršykite ir atsisiųskite iš Naršymo
- **Centrinė atsisiuntimų eilė** — kiekviena atskira, grojaraščio, kelių nuorodų ar greitoji užduotis patenka į vieną vietą, kur galima stebėti eigą, pristabdyti, tęsti, atšaukti, kartoti ir valdyti prioritetą
- **Iškarpinės stebėjimas** — nukopijuokite vaizdo įrašo nuorodą, ir ji užpildys URL lauką, kai grįšite į Arroxy; yra **Anuliuoti**, jei to nenorėjote. Kol Arroxy užimta, nuoroda laukia, kol grįšite į URL skirtuką (išjunkite parametruose)
- **Automatinis URL valymas** — pašalina sekimo parametrus (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ir išskleidžia `youtube.com/redirect` nuorodas
- **Dėklo režimas** — uždarius langą atsisiuntimai toliau vyksta fone
- **50 kalbų** — automatiškai aptinka sistemos kalbą, galima bet kada perjungti
- **Grojaraščio sinchronizavimas** — iš naujo nuskaitykite grojaraštį pagal vietinį aplanką, kad praleistumėte jau atsisiųstus vaizdo įrašus; sukuria `.m3u` grojaraščio failą, atnaujinamą atsisiunčiant kiekvieną vaizdo įrašą
- **Greičio ir tempo valdymas** — apribokite atsisiuntimo pralaidumą, nustatykite, kiek vaizdo įrašo dalių atsisiunčiama vienu metu, ir pridėkite užklausų delsą su šablonais (*Išjungta · Subalansuota · Atsargi · Pasirinktinė*)
- **Failų pavadinimų šablonai** — pavadinkite atsisiuntimus savo būdu naudodami `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` ir `{playlist_index}`, bendrai arba pagal atsisiuntimo profilį
- **Atsisiuntimai vienu metu ir automatinis kartojimas** — pasirinkite, kiek eilės atsisiuntimų vykdoma tuo pačiu metu, ir leiskite Arroxy kartoti atsisiuntimą, kuris susidūrė su tinklo ar serverio problema, prieš kiekvieną bandymą laukiant ilgiau
- **Kiekvieno grojaraščio elemento profiliai** — priskirkite kiekvienam grojaraščio vaizdo įrašui savo atsisiuntimo profilį, užuot taikę vieną parametrą visam sąrašui, kad per vieną praėjimą kai kuriuos užarchyvuotumėte aukščiausia kokybe, o likusius išsaugotumėte tik kaip garsą
- **Greitasis atsisiuntimas veikia fone** — nuoroda iškart atsiranda sąraše „Atsisiuntimai“ ir ten ruošiama, pranešimas su **Rodyti** tai patvirtina, o URL laukas išvalomas kitai nuorodai. Pradėkite kiek norite, kol ankstesnės ruošiamos
- **Atsisiuntimai parodo, ko iš jūsų reikia** — jei Arroxy negali perskaityti nuorodos, jos eilutė paaiškina kodėl ir pasiūlo sprendimą: bandyti dar kartą, įjungti slapukus arba prisijungti per Naršymą. Kai slapukai išjungti, **Prisijungti per Naršymą** pakartoja bandymą už jus, kai tik prisijungiate. Už jūsų įkėlimo ribos ilgesnis grojaraštis savo eilutėje laukia, kol pasirinksite visą, pirmuosius elementus arba peržiūrą. Skirtukas „Atsisiuntimai“ suskaičiuoja jūsų laukiančias eilutes
- **Atsisiųskite tik vaizdo įrašo dalį** — ekrane „Formatas“ pasirinkite pradžią ir pabaigą arba skyrių, ir Arroxy įrašys tik tą intervalą, pavadintą su intervalu po vaizdo įrašo ID. Pjūviai patenka į artimiausią pagrindinį kadrą; įjunkite tikslų pjūvį, kad vietoj to būtų perkoduojama
- **Šalinti baigtus atsisiuntimus** — neprivaloma: baigtas atsisiuntimas palieka sąrašą po 5 sekundžių. Jo failai lieka diske, o nepavykę atsisiuntimai lieka sąraše
- **Dydis ir Trūksta sąraše „Atsisiuntimai“** — rikiuojamas stulpelis **Dydis** rodo, kiek vietos užima kiekvienas atsisiuntimas, o **Trūksta** pažymi failus, perkeltus ar ištrintus ne per Arroxy
- **Aurora ar Minimalistinis, tamsus ar šviesus** — stikliniai skydeliai virš judančio dangaus arba ramūs vientisi paviršiai; perjunkite poraštėje. Kompiuteriai be grafikos spartinimo automatiškai gauna Minimalistinį
- **Mac meniu juosta** — macOS sistemoje atverkite parametrus (`Cmd+,`), nustatykite atsisiuntimo greičio ribą, perjunkite stilių ir temą bei atverkite žurnalus ar įrašykite diagnostikos failą iš meniu juostos
- **Keiskite profilį iš bet kurio atsisiuntimo** — pakoreguokite atsisiuntimą, tada atnaujinkite profilį, nuo kurio jis prasidėjo (su pakeitimų peržiūra), arba įrašykite parametrus kaip naują profilį. Perjungiant profilį paklausiama, ar išlaikyti jūsų pakeitimus

</details>

<details>
<summary><strong>📝 Subtitrai ir paskesnis apdorojimas</strong></summary>

- **Subtitrai** SRT, VTT ar ASS formatu — rankiniai arba sugeneruoti automatiškai, bet kuria prieinama kalba
- Įrašykite šalia vaizdo įrašo, įterpkite į `.mkv` arba sutvarkykite į poaplankį `Subtitles/`
- **Tik subtitrų paketai** — įklijuokite URL sąrašą arba atverkite grojaraštį, pasirinkite Subtitrai ir gaukite tik kiekvieno vaizdo įrašo subtitrų failus
- **SponsorBlock** — praleiskite arba pažymėkite skyriais rėmėjus, įžangas, pabaigas, savireklamą
- **Įterpti metaduomenys** — pavadinimas, įkėlimo data, kanalas, aprašas, miniatiūra ir skyrių žymos įrašomi į failą

</details>

<details>
<summary><strong>🌐 YouTube + 2000 svetainių</strong></summary>

- **YouTube visa apimtimi** — vaizdo įrašai, Shorts, kanalai, grojaraščiai, YouTube Music ir tinklalaidės traktuojami kaip pilnaverčiai šaltiniai
- **2000+ kitų svetainių** per yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, archive.org, Streamable ir daugybė kitų
- **Tik garsas ir subtitrai** veikia visose palaikomose svetainėse, ne tik YouTube
- Jei svetainė pasikeičia, yt-dlp kas savaitę išleidžia pataisas, o Arroxy paleidžiant automatiškai atnaujina vykdomąjį failą

</details>

---

## <a id="install"></a>📥 Diegimas ir pirmasis paleidimas

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

Versijos tik x86_64. Neturite `curl`? Pakeiskite `curl -fsSL` į `wget -qO-`.

| Platforma | Tiesioginis atsisiuntimas |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Visi laidos failai →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Pirmasis paleidimas Windows sistemoje</strong></summary>

Pirmą kartą paleidus galite pamatyti **„Windows apsaugojo jūsų kompiuterį“** arba **„Nežinomas leidėjas“**. Tai taikoma ir `Arroxy-win-x64-Setup.exe`, ir `Arroxy-win-x64-Portable.exe`. Arroxy yra nemokama ir atvirojo kodo, o Windows versijos nėra pasirašytos mokamu sertifikatu, todėl SmartScreen jas pažymi. Tai **nebūtinai** reiškia, kad Arroxy nesaugi. Norėdami tęsti:

<div align="center">
  <img src="../../build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen dialogo langas „Windows apsaugojo jūsų kompiuterį“ su paryškinta nuoroda „Daugiau informacijos“" />
  <img src="../../build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialogo langas išplėtus „Daugiau informacijos“, rodantis mygtuką „Vis tiek vykdyti“" />
</div>

1. Spustelėkite **Daugiau informacijos**.
2. Spustelėkite **Vis tiek vykdyti**.

#### Jei Windows Defender pažymi arba pašalina failą

Defender euristika kartais pažymi nepasirašytas NSIS diegimo programas ir Electron nešiojamąsias versijas kaip įtartinas. Jei Defender perkelia `Arroxy-win-x64-Setup.exe` arba `Arroxy-win-x64-Portable.exe` į karantiną, atkurkite jį iš **Windows sauga → Apsauga nuo virusų ir grėsmių → Apsaugos istorija**, tada pridėkite Arroxy vykdomąjį failą kaip leidžiamą elementą skiltyje **Tvarkyti parametrus → Pridėti arba šalinti išimtis**. Kaip ir su SmartScreen, priežastis yra trūkstamas leidėjo parašas, o ne aptikta kenkėjiška programa.

> Atsisiųskite Arroxy tik iš oficialaus GitHub Releases puslapio. Jei failą gavote iš kitos svetainės arba jį kas nors atsiuntė, ištrinkite jį ir atsisiųskite šviežią kopiją iš oficialaus šaltinio. Šaltinio kodas viešas, todėl galite jį patikrinti arba, jei norite, patys sukompiliuoti Arroxy.

Mėgstate Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Pirmasis paleidimas macOS sistemoje</strong></summary>

Arroxy macOS versijos pasirašytos ad hoc, bet Apple jų nepatvirtino (notarizavo), todėl Gatekeeper užblokuoja pirmąjį paleidimą pranešimu *„Arroxy.app“ neatidaryta — „Apple“ negalėjo patikrinti, ar „Arroxy.app“ be kenkėjiškos programinės įrangos*. Tai reiškia, kad macOS negali patikrinti programos per Apple, o ne kad su failais kas nors negerai. Diegiant per Homebrew šio dialogo išvengiama visiškai. Jei naudojote DMG, vienos Terminalo komandos pakanka jam pašalinti:

<div align="center">
  <img src="../../build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Nuvilkite `Arroxy.app` iš prijungto DMG į `/Applications`.
2. Atverkite Terminalą ir paleiskite šias dvi komandas:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Pirmoji komanda pašalina karantino atributą, kurį macOS pridėjo atsisiuntus failą; antroji paleidžia programą. Paprastai `sudo` nereikia, nes kopija `/Applications` priklauso jums — pridėkite jį tik jei gaunate leidimų klaidą.

**Apple Silicon ar Intel:** M serijos Mac (M1 / M2 / M3 / M4) atsisiųskite `arm64` DMG. Intel Mac atsisiųskite `x64` DMG. Netinkama versija vis tiek veikia per Rosetta, bet pastebimai lėčiau.

> macOS versijos kuriamos per CI Apple Silicon ir Intel vykdytuvuose. Jei kyla problemų, [atverkite problemos pranešimą](../../../../issues) — macOS naudotojų atsiliepimai aktyviai formuoja macOS testavimo ciklą.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Kodėl galite pamatyti įspėjimą</strong></summary>

Arroxy yra atvirojo kodo ir licencijuota pagal GPLv3. Windows ir macOS versijos **nepasirašytos kodo parašu** — Apple Developer ID ir Windows EV kodo pasirašymo sertifikatai kainuoja šimtus dolerių per metus, o nepriklausomas projektas moka iš savo kišenės. Be tų parašų Windows SmartScreen ir macOS Gatekeeper pirmą kartą paleidus įspėja jus. Įspėjimai reiškia, kad *jūsų OS neatpažįsta leidėjo* — jie nereiškia, kad Arroxy yra kenkėjiška programa.

Trys būdai pačiam patikrinti Arroxy, didėjančio kruopštumo tvarka:

- **Perskaitykite šaltinio kodą.** Kiekviena eilutė yra [GitHub](https://github.com/antonio-orionus/Arroxy), o [sukompiliuoti iš šaltinio](#tech) galite patys.
- **Patikrinkite SHA256.** Palyginkite savo failą su paskelbtu [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — žr. [Patikrinkite savo atsisiuntimą](#verify) žemiau.
- **Paleiskite trečiosios šalies patikrą.** Įkelkite failą į [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Pirmasis paleidimas Linux sistemoje</strong></summary>

AppImage paleidžiami tiesiogiai — be diegimo. Tereikia failą pažymėti kaip vykdomąjį.

**Failų tvarkyklė:** spustelėkite `.AppImage` dešiniuoju pelės mygtuku → **Ypatybės** → **Leidimai** → įjunkite **Leisti vykdyti failą kaip programą**, tada dukart spustelėkite.

**Terminalas:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Jei paleisti vis tiek nepavyksta, paleiskite nemontuodami — FUSE paketo nereikia:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Neprivaloma integracija su darbalaukiu:** vieną kartą įdiekite [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), ir kiekvienas dukart spustelėtas AppImage bus automatiškai užregistruotas jūsų paleidiklio meniu — `.desktop` failo kurti rankiniu būdu nereikia.

**Paprastas archyvas (be FUSE, be diegimo):**

`.tar.gz` versija yra ta pati programa be AppImage apvalkalo — išskleiskite ją bet kur ir paleiskite. Diegimo programos ir FUSE paketo nereikia.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Linux atsisiuntimai laidos puslapyje yra tik x86_64.** ARM64 kompiuteriuose (Raspberry Pi, Asahi Linux) Flatpak vis tiek įsidiegia, bet paleidžiant nepavyksta su `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Patikrinkite savo atsisiuntimą (SHA256)</strong></summary>

Kiekviena laida kartu su vykdomaisiais failais paskelbia `SHA256SUMS` failą. Norėdami patikrinti, ar jūsų atsisiuntimas nebuvo sugadintas ar pakeistas perduodant, apskaičiuokite failo maišą vietoje ir palyginkite su eilute `SHA256SUMS`. Atverkite naujausios laidos puslapį → **Assets** → atsisiųskite `SHA256SUMS`.

**Windows (PowerShell arba komandų eilutė):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminalas):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminalas):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Norite trečiosios šalies kenkėjiškų programų patikros? Įkelkite failą į [VirusTotal](https://www.virustotal.com). Keli bendrosios euristikos pažymėjimai iš nedidelių variklių nepasirašytoms Electron programoms yra normalu; plačiai paplitę didžiųjų variklių aptikimai būtų tikras rūpestis.

</details>

<details>
<summary><strong>📦 Windows: diegimo programa ar nešiojamoji versija</strong></summary>

|               | NSIS diegimo programa | Nešiojamasis `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Reikalingas diegimas | Taip  | Ne — paleiskite iš bet kur  |
| Automatiniai naujinimai | ✅ programoje  | ❌ atsisiuntimas rankiniu būdu  |
| Paleidimo greitis | ✅ greitesnis  | ⚠️ lėtesnis šaltas paleidimas  |
| Pridedama į meniu Pradėti |            ✅            |           ❌            |
| Lengvas pašalinimas |            ✅            | ❌ ištrinkite failą  |

**Rekomendacija:** naudokite NSIS diegimo programą dėl automatinių naujinimų ir greitesnio paleidimo. Nešiojamąjį `.exe` naudokite, jei nenorite diegti ir keisti registro.

</details>

---

## <a id="why"></a>⚖️ Kodėl Arroxy

Palyginimas su dažniausiai pasitaikančiomis alternatyvomis:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader |     Online converters      | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Integruota naršyklė (naršymas, prisijungimas, atsisiuntimas) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Vaizdo įrašai, kuriuos gali žiūrėti jūsų pačių paskyra, be slapukų eksportavimo |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Nemokama, be mokamo plano |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Atvirasis kodas |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Tik vietinis apdorojimas |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Be naudojimo apribojimų |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Daugiaplatformė darbalaukio programa |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitrai + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = iš dalies arba tik mokamame plane. 4K Video Downloader prisijungimas programoje privatiems vaizdo įrašams yra mokama funkcija; dauguma nemokamų yt-dlp sąsajų priima tik slapukų failą arba skaito jūsų naršyklės slapukus.

Arroxy sukurta vienam dalykui: švariam vietiniam failui — nesvarbu, ar įklijuojate URL, ar vaizdo įrašą randate Naršyme. Jokio priverstinio pardavimo, jokio duomenų rinkimo.

### <a id="why-explore"></a>🧭 Ko paprasta yt-dlp apvalkalo programa negali: skirtukas „Naršymas“

Dauguma nemokamų YouTube atsisiuntimo programų yra tiesiog URL laukelis virš yt-dlp. Arroxy taip pat naudoja yt-dlp, bet turi ir **Naršymą** — programoje integruotą naršyklę, atverančią YouTube ar bet kurią kitą svetainę. Naršymas prideda tai, ko URL laukelis negali:

- **Vaizdo įrašai, kuriuos gali žiūrėti jūsų paskyra, be slapukų eksportavimo** — jūsų privatūs vaizdo įrašai, jūsų „Žiūrėti vėliau“ ir „Patikę“ sąrašai, amžiaus apribojimą turintys vaizdo įrašai su amžių patvirtinusia paskyra ir kitų svetainių puslapiai, kuriems reikia jūsų prisijungimo. Paprastam apvalkalui reikia cookies.txt eksporto arba jis skaito jūsų žiniatinklio naršyklės slapukus. Arroxy prisijungiate vieną kartą Naršyme, o visa kita ji padaro pati
- **Nereikia kopijuoti nuorodų** — raskite vaizdo įrašą, grojaraštį ar kanalą Naršyme ir atsisiųskite vienu spustelėjimu arba spustelėję dešiniuoju pelės mygtuku bet kurią puslapio nuorodą
- **Skelbimų blokatorius, kai jo norite** — vienas spustelėjimas ant skydo blokuoja skelbimus ir sekimo priemones Naršymo puslapiuose

---

## <a id="privacy"></a>🔒 Privatumas

Atsisiuntimai gaunami tiesiogiai per [yt-dlp](https://github.com/yt-dlp/yt-dlp) iš YouTube į jūsų pasirinktą aplanką — nieko nenukreipiant per trečiosios šalies serverį. Žiūrėjimo istorija, atsisiuntimų istorija, URL ir failų turinys lieka jūsų įrenginyje.

Jokio sekimo — vienas anoniminis aktyvumo signalas per dieną (programos versija, OS, kalba, diegimo kanalas, šalis ir apytikslis laikas nuo Arroxy įdiegimo), kad galėtume suskaičiuoti aktyvius ir naujus naudotojus, o kai Arroxy atsisiunčia ar atnaujina yt-dlp ir FFmpeg, – anoniminis pranešimas, ar tai pavyko ir apytiksliai kiek laiko užtruko. Jokių ID, URL, vaizdo įrašų pavadinimų, failų kelių ar paskyros informacijos. Abu galite išjungti parametruose.

Naršymas laiko savo prisijungimus atskirai nuo jūsų naršyklės, o Arroxy niekada neskaito ir neužpildo prisijungimo formos — rašote svetainės puslapyje. Atsisiuntimai vyksta neprisijungus; tik kai vienas nepavyksta dėl priežasties, kurią gali ištaisyti paskyra, Arroxy iš naujo nuskaito prisijungimą, laiko jį laikinajame faile to atsisiuntimo metu ir vėliau tą failą ištrina. Atsijungus nuo Naršymo parametruose, jie pamirštami.

---

## <a id="faq"></a>❓ DUK

<details>
<summary><strong>Ar tikrai nemokama?</strong></summary>

Taip — licencija GPLv3, jokio mokamo plano, jokių funkcijų apribojimų.

</details>

<details>
<summary><strong>Kuo Arroxy skiriasi nuo kitų yt-dlp sąsajų?</strong></summary>

Dauguma nemokamų yt-dlp sąsajų yra apvalkalai, priimantys tik nuorodą. Arroxy prideda **Naršymą** — programoje integruotą naršyklę, atverančią YouTube ar bet kurią kitą svetainę: naršote ir atsisiunčiate nekopijuodami nuorodų, o prisijungiate ten vieną kartą, kad atsisiųstumėte vaizdo įrašus, kuriuos gali žiūrėti jūsų paskyra, pavyzdžiui, savo privačius vaizdo įrašus bei „Žiūrėti vėliau“ ir „Patikę“ sąrašus, be slapukų eksportavimo. Žr. [Kodėl Arroxy](#why).

</details>

<details>
<summary><strong>Kokios kokybės vaizdo įrašus galiu atsisiųsti?</strong></summary>

Bet ką, ką pateikia YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, taip pat tik garsą. 60 kadrų/s ir HDR srautai išsaugomi tokie, kokie yra, o žingsnis po žingsnio atsisiuntimas leidžia pasirinkti AV1, VP9 arba H.264 kiekvienoje skiriamojoje gebos.

</details>

<details>
<summary><strong>Ar galiu išgauti tik garsą kaip MP3?</strong></summary>

Taip. Formatų meniu pasirinkite *tik garsas* ir rinkitės MP3, M4A/AAC, Opus arba WAV.

</details>

<details>
<summary><strong>Kaip atsisiųsti vaizdo įrašus, kuriems reikia YouTube paskyros?</strong></summary>

Vieną kartą prisijunkite skirtuke Naršymas. Tada Arroxy galės atsisiųsti vaizdo įrašus, kuriuos gali žiūrėti jūsų paskyra: jūsų privačius vaizdo įrašus, amžiaus apribojimą turinčius vaizdo įrašus, jei paskyra patvirtinta pagal amžių, ir jūsų „Žiūrėti vėliau“ bei „Patikę“ sąrašus. Prisijungimas naudojamas tik tada, kai atsisiuntimas nepavyksta dėl priežasties, kurią gali ištaisyti paskyra; viskas kita atsisiunčiama kaip anksčiau. Tai yra pasirinkimas **Prisijungimas per Naršymą**, slapukų parametruose išvardytas pirmas ir pažymėtas Rekomenduojama, o Arroxy jį pasirenka už jus, kai pirmą kartą atveriate Naršymą. yt-dlp wiki pažymi, kad [automatizavimas su prisijungimu gali pažymėti Google paskyrą](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), todėl antrinė paskyra yra saugesnis pasirinkimas.

</details>

<details>
<summary><strong>Ar ji toliau veiks, kai YouTube kažką pakeis?</strong></summary>

yt-dlp atnaujinamas automatiškai paleidžiant, o Arroxy greitai išleidžia pataisas, kai YouTube kažką pakeičia. Kai atsisiuntimui reikia prisijungimo, Arroxy naudoja jūsų prisijungimą per Naršymą, jei ten prisijungėte, o slapukai iš failo ar jūsų naršyklės yra pasiekiami slapukų parametruose.

</details>

<details>
<summary><strong>Kuriomis kalbomis prieinama Arroxy?</strong></summary>

50 kalbų iškart po diegimo: Afaan Oromoo · Bahasa Indonesia · Català · Čeština · Dansk · Deutsch · Eesti · English · Español · Euskara · Français · Galego · Hrvatski · Italiano · Kiswahili · Latviešu · Lietuvių · Magyar · Nederlands · Norsk bokmål · O'zbekcha · Polski · Português · Română · Slovenčina · Slovenščina · Suomi · Svenska · Tiếng Việt · Türkçe · አማርኛ · עברית · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Български · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy pirmą kartą paleidus automatiškai aptinka jūsų operacinės sistemos kalbą, o perjungti galite bet kada kalbos parinkikliu įrankių juostoje. Vykdymo metu naudojami lokalės JSON failai yra src/shared/i18n/locales/, o vertėjams skirti PO katalogai — i18n/locales/ — atverkite PR GitHub, kad prisidėtumėte.

</details>

<details>
<summary><strong>Ar reikia dar kažką įdiegti?</strong></summary>

Ne. yt-dlp, ffmpeg ir ffprobe automatiškai atsisiunčiami pirmą kartą paleidus ir išsaugomi jūsų kompiuteryje. Po to papildomos sąrankos nereikia.

</details>

<details>
<summary><strong>Ar galiu atsisiųsti grojaraščius ar ištisus kanalus?</strong></summary>

Taip — ir vienus, ir kitus. Įklijuokite grojaraščio arba kanalo URL (pvz., `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); pasirinkite, kiek įrašų nuskaityti, tada įtraukite visą sąrašą į eilę arba pasirinkite konkrečius vaizdo įrašus. Datos intervalo filtrai bus netrukus.

</details>

<details>
<summary><strong>macOS rašo „programa pažeista“ — ką daryti?</strong></summary>

Tai macOS Gatekeeper blokuoja nepasirašytą programą, o ne tikras pažeidimas. Terminalo komandas, kurios pašalina karantiną ir paleidžia Arroxy, rasite skyriuje [Pirmasis paleidimas macOS sistemoje](#macos-first-launch).

</details>

<details>
<summary><strong>Ar legalu atsisiųsti YouTube vaizdo įrašus?</strong></summary>

Tai priklauso nuo jūsų šalies ir nuo to, ką atsisiunčiate. Atsisiųskite tik turinį, kurį valdote, kurį licencija leidžia atsisiųsti arba kurį jūsų šalies įstatymai leidžia kopijuoti. Esate atsakingi už YouTube [paslaugų teikimo sąlygų](https://www.youtube.com/t/terms) ir vietinių autorių teisių įstatymų laikymąsi. Žr. [Naudojimo sąlygos](#terms).

</details>

---

## <a id="roadmap"></a>🗺️ Plėtros planas

Dar planuojama — maždaug pagal prioritetą:

| Funkcija    | Aprašas    |
| ---------------- | ---------------- |
| **Grojaraščių ir kanalų filtrai** | Datos intervalo filtrai išvardijant grojaraščio ar kanalo turinį |
| **YouTube garso takelių nuostatos** | Programos mastu nustatykite šnekamosios kalbos takelio nuostatą su pakeitimais pagal profilį, kai YouTube siūlo kelis garso takelius |
| **Patikimesnis atsigavimas po klaidų** | Naujas pakartojimo kelias atsisiuntimams, nutrūkusiems dėl nepatikimo ar problemų turinčio interneto ryšio |
| **Visavertė atsisiuntimų tvarkyklė** | Paverskite eilės skydelį visavertiškesne tvarkykle, įskaitant eilėje esančių elementų paskirties aplankų keitimą |
| **Suplanuoti atsisiuntimai** | Pradėkite eilę nustatytu laiku (naktiniai paleidimai) |
| **AUR paketas** | Diegimas Arch Linux ir Omarchy su `yay -S arroxy-bin` |

Turite funkcijos idėją? [Pateikite prašymą](../../../../issues) — bendruomenės nuomonė lemia prioritetą.

---

## <a id="support"></a>💖 Paremkite Arroxy

Arroxy yra nemokama ir licencijuota pagal GPLv3 — be reklamų, be sekimo, be mokamo plano. Jei ji taupo jūsų laiką, kūrimą galite paremti Bitcoin, Tron ar Ethereum: adresai yra [DONATE.md](../../DONATE.md), kuris yra vienintelis oficialus jų šaltinis. Arroxy niekada nesiųs jums adreso el. paštu ar tiesioginiu pranešimu. Saugyklos pažymėjimas žvaigždute, klaidų pranešimas ir vertimų gerinimas padeda ne mažiau.

<a href="../../DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="../../DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Technologijos

<details>
<summary><strong>Technologijos</strong></summary>

- **Electron** — daugiaplatformis darbalaukio programos apvalkalas
- **React 19** + **TypeScript** — naudotojo sąsaja
- **Tailwind CSS v4** — stiliai
- **Zustand** — būsenos valdymas
- **yt-dlp** + **ffmpeg** — atsisiuntimo ir maišymo variklis (abu parsisiunčiami veikimo metu: yt-dlp nuolat atnaujinamas, o ffmpeg/ffprobe įdiegiami vieną kartą ir išlieka po atnaujinimų)
- **Vite** + **electron-vite** — kūrimo įrankiai
- **Vitest** + **Playwright** — vienetų ir visapusiški (end-to-end) testai

</details>

<details>
<summary><strong>Kūrimas iš šaltinio kodo</strong></summary>

### Reikalavimai — visoms platformoms

| Įrankis | Versija | Diegimas |
| ------- | ------- | -------- |
| Git     | bet kuri | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` arba `.node-version` |
| Bun     | 1.4.2  | `mise install` arba `package.json` `packageManager` |

Rekomenduojama: įdiekite `mise`, tada saugykloje paleiskite `mise install`. Be mise prieš `bun run bootstrap` rankiniu būdu aktyvuokite Node.js pagal `.node-version` ir Bun pagal `package.json`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Perkuriant gimtąsias priklausomybes gali prireikti Visual Studio Build Tools ir Python.

### macOS

```bash
brew install mise
xcode-select --install
```

Nuklonavę saugyklą, joje paleiskite `mise trust && mise install`. Jei jūsų apvalkalas jau naudoja `fnm`, `nvm` arba Homebrew Bun, aktyvuokite mise faile `~/.zshrc`, kad Arroxy gautų Node.js 24.21.0 ir Bun 1.4.2:

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

# Kūrimo ir Electron vykdymo priklausomybės
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tik E2E testams (Electron reikia ekrano)
sudo apt install -y xvfb
```

### Klonavimas ir paleidimas

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # rekomenduojama; praleiskite, jei rankiniu būdu aktyvavote prisegtus įrankius
bun run bootstrap
bun run doctor
bun run dev            # Electron programa su Vite atvaizdavimo sluoksniu
```

### Platinamojo paketo kūrimas

```bash
bun run build        # tipų tikrinimas + kompiliavimas
bun run dist         # paketas dabartinei OS
bun run dist:win     # Windows paketai palaikomame kompiuteryje
```

> `bun run bootstrap` įdiegia priklausomybes, perkuria Electron programos priklausomybes, patikrina Electron, paruošia integruotus ffmpeg/ffprobe kūrimui ir įdiegia Playwright Chromium. Išleidžiamosios versijos yt-dlp, ffmpeg ir ffprobe valdo veikimo metu jūsų programos duomenų aplanke; nė vienas jų nėra įtrauktas į diegimo programą.

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

## <a id="terms"></a>📜 Naudojimo sąlygos

Arroxy yra įrankis tik asmeniniam, privačiam naudojimui. Esate vienintelis atsakingas už tai, kad jūsų atsisiuntimai atitiktų YouTube [paslaugų teikimo sąlygas](https://www.youtube.com/t/terms) ir jūsų jurisdikcijos autorių teisių įstatymus. Nenaudokite Arroxy atsisiųsti, atkurti ar platinti turinio, kurio neturite teisės naudoti. Kūrėjai neprisiima atsakomybės už netinkamą naudojimą.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>GPLv3 · Sukurta su rūpesčiu: <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
