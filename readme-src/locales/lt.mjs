const TECH_CONTENT = `<details>
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
| Node.js | 24.21.0 | \`mise install\` arba \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` arba \`package.json\` \`packageManager\` |

Rekomenduojama: įdiekite \`mise\`, tada saugykloje paleiskite \`mise install\`. Be mise prieš \`bun run bootstrap\` rankiniu būdu aktyvuokite Node.js pagal \`.node-version\` ir Bun pagal \`package.json\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Perkuriant gimtąsias priklausomybes gali prireikti Visual Studio Build Tools ir Python.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Nuklonavę saugyklą, joje paleiskite \`mise trust && mise install\`. Jei jūsų apvalkalas jau naudoja \`fnm\`, \`nvm\` arba Homebrew Bun, aktyvuokite mise faile \`~/.zshrc\`, kad Arroxy gautų Node.js 24.21.0 ir Bun 1.4.2:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Kūrimo ir Electron vykdymo priklausomybės
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tik E2E testams (Electron reikia ekrano)
sudo apt install -y xvfb
\`\`\`

### Klonavimas ir paleidimas

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # rekomenduojama; praleiskite, jei rankiniu būdu aktyvavote prisegtus įrankius
bun run bootstrap
bun run doctor
bun run dev            # Electron programa su Vite atvaizdavimo sluoksniu
\`\`\`

### Platinamojo paketo kūrimas

\`\`\`bash
bun run build        # tipų tikrinimas + kompiliavimas
bun run dist         # paketas dabartinei OS
bun run dist:win     # Windows paketai palaikomame kompiuteryje
\`\`\`

> \`bun run bootstrap\` įdiegia priklausomybes, perkuria Electron programos priklausomybes, patikrina Electron, paruošia integruotus ffmpeg/ffprobe kūrimui ir įdiegia Playwright Chromium. Išleidžiamosios versijos yt-dlp, ffmpeg ir ffprobe valdo veikimo metu jūsų programos duomenų aplanke; nė vienas jų nėra įtrauktas į diegimo programą.

</details>`;

export const lt = {
  icon_alt: "Arroxy talismanas",
  title:
    "Arroxy — nemokama atvirojo kodo YouTube (+ 2000 svetainių) atsisiuntimo programa su integruota naršykle, skirta Windows, macOS ir Linux",
  read_in_label: "Skaityti kalba:",
  badge_release_alt: "Laida",
  badge_build_alt: "Kūrinys",
  badge_license_alt: "Licencija",
  badge_platforms_alt: "Platformos",
  badge_i18n_alt: "Kalbos",
  badge_website_alt: "Svetainė",
  discord_badge_text: "Prisijunkite prie Discord bendruomenės",
  discord_badge_encoded: "Prisijunkite%20prie%20Discord%20bendruomen%C4%97s",
  hero_desc:
    "Atsisiųskite vaizdo įrašus, Shorts, muziką, kanalus, tinklalaides ar garso takelius iš **YouTube ir daugiau nei 2000 palaikomų svetainių** — iki 8K HDR esant 60 kadrų/s, kaip MP3 / AAC / Opus arba tik reikiamą dalį. **Naršykite YouTube ar bet kurią kitą svetainę Arroxy viduje** skirtuke „Naršymas“ ir atsisiųskite vaizdo įrašą, grojaraštį ar kanalą, kuriame esate; prisijunkite ten, kad atsisiųstumėte privačius, tik nariams skirtus ir amžiaus apribojimą turinčius vaizdo įrašus, kuriuos gali žiūrėti jūsų paskyra. Veikia vietoje Windows, macOS ir Linux sistemose. **Be reklamų, be nereikalingų priedų, be priverstinio pardavimo.**",
  cta_latest: "↓ Įdiegti naujausią laidą",
  cta_website: "Svetainė",
  website_url: "https://arroxy.com/",
  star_cta: "Jei Arroxy taupo jūsų laiką, ⭐ padės kitiems ją rasti.",
  ai_notice:
    "> 🌐 Šis vertimas parengtas padedant DI. [Angliškas README](README.md) yra pagrindinis šaltinis. Radote klaidą? [Atverkite PR](../../pulls).",
  intro_what_is:
    "**Kas yra Arroxy?** Arroxy yra nemokama atvirojo kodo darbalaukio sąsaja, atsisiunčianti vaizdo įrašus, garso įrašus, grojaraščius ir subtitrus iš YouTube ir daugiau nei 2000 kitų [yt-dlp](https://github.com/yt-dlp/yt-dlp) palaikomų svetainių. Veikia Windows 10/11, macOS 13+ (Intel + Apple Silicon) ir Linux (AppImage, Flatpak, tar.gz) sistemose. Licencija GPLv3. Be reklamų, be naudojimo apribojimų. Platinama per [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage ir tiesioginį atsisiuntimą.",
  intro_key_difference:
    "**Pagrindinis skirtumas: integruota naršyklė.** Dauguma nemokamų YouTube atsisiuntimo programų yra plonos yt-dlp apvalkalo programos: URL laukelis ir formatų meniu, be savo naršyklės. Arroxy ją turi – tai **skirtukas „Naršymas“**. Naršote YouTube ar bet kurią kitą svetainę programoje ir atsisiunčiate vaizdo įrašą, grojaraštį ar kanalą, kuriame esate, arba spustelite bet kurią nuorodą dešiniuoju pelės klavišu. Naršyme prisijungiate vieną kartą, o Arroxy atsisiunčia privačius, tik nariams skirtus ir amžiaus apribojimą turinčius vaizdo įrašus, kuriuos gali žiūrėti jūsų paskyra, taip pat jūsų „Žiūrėti vėliau“ ir „Patikę“ sąrašus, be slapukų eksportavimo. Taip pat ten prisijunkite prie kitų svetainių, ir jų atsisiuntimai prireikus naudos tą prisijungimą. Kai YouTube prašo patvirtinti, kad nesate robotas, Arroxy bando dar kartą su tuo prisijungimu. Integruota naršyklė taip pat gauna žetoną, kurio YouTube tikisi prieš atsisiuntimą, todėl YouTube neapkarpo atsisiuntimo iki mažesnio formatų skaičiaus. Apvalkalo programa su vien URL laukeliu susiduria su visais šiais apribojimais. Išsamiau: [Kodėl Arroxy](#why-explore).",
  last_updated: "Paskutinį kartą atnaujinta: {{LAST_UPDATED}}.",
  toc_heading: "Turinys",
  why_h2: "Kodėl Arroxy",
  features_h2: "Funkcijos",
  dl_h2: "Diegimas ir pirmasis paleidimas",
  privacy_h2: "Privatumas",
  faq_h2: "DUK",
  roadmap_h2: "Plėtros planas",
  tech_h2: "Technologijos",
  why_intro: "Palyginimas su dažniausiai pasitaikančiomis alternatyvomis:",
  why_r1: "Nemokama, be mokamo plano",
  why_r2: "Atvirasis kodas",
  why_r3: "Tik vietinis apdorojimas",
  why_r5: "Be naudojimo apribojimų",
  why_r6: "Daugiaplatformė darbalaukio programa",
  why_r7: "Subtitrai + SponsorBlock",
  why_r8: "Integruota naršyklė (naršymas, prisijungimas, atsisiuntimas)",
  why_r9:
    "Privatūs, tik nariams skirti ir amžiaus apribojimą turintys vaizdo įrašai be slapukų eksportavimo",
  why_table_note:
    "⚠️ = iš dalies arba tik mokamame plane. 4K Video Downloader prisijungimas programoje privatiems vaizdo įrašams yra mokama funkcija; dauguma nemokamų yt-dlp sąsajų priima tik slapukų failą arba skaito jūsų naršyklės slapukus.",
  why_summary:
    "Arroxy sukurta vienam dalykui: švariam vietiniam failui — nesvarbu, ar įklijuojate URL, ar vaizdo įrašą randate Naršyme. Jokio priverstinio pardavimo, jokio duomenų rinkimo.",
  why_explore_h3: "Ko paprasta yt-dlp apvalkalo programa negali: skirtukas „Naršymas“",
  why_explore_intro:
    "Dauguma nemokamų YouTube atsisiuntimo programų yra tiesiog URL laukelis virš yt-dlp. Arroxy taip pat naudoja yt-dlp, bet turi ir **Naršymą** — programoje integruotą naršyklę, atverančią YouTube ar bet kurią kitą svetainę. Naršymas įveikia apribojimus, kurių URL laukelis įveikti negali:",
  why_explore_1:
    "**Vaizdo įrašai, kuriems reikia paskyros, be slapukų eksportavimo** — privatūs, tik nariams skirti ir amžiaus apribojimą turintys vaizdo įrašai (su amžių patvirtinusia paskyra), taip pat jūsų „Žiūrėti vėliau“ ir „Patikę“ sąrašai bei vaizdo įrašai už prisijungimo kitose svetainėse. Paprastam apvalkalui reikia cookies.txt eksporto arba jis turi skaityti jūsų žiniatinklio naršyklės slapukus, kuriuos Chrome sistemoje Windows dabar blokuoja. Arroxy prisijungiate vieną kartą Naršyme, o visa kita ji padaro pati",
  why_explore_2:
    "**„Prisijunkite, kad patvirtintumėte, jog nesate robotas“** — kai YouTube to paprašo, Arroxy bando atsisiųsti iš naujo su jūsų prisijungimu per Naršymą, užuot nepavykusi",
  why_explore_3:
    "**YouTube atsisiuntimo žetonas** — Arroxy integruota naršyklė gauna žetoną, kurio YouTube tikisi prieš atsisiuntimą. Be jo YouTube gali pateikti mažiau formatų ir žemesnę kokybę, nei prašėte",
  why_explore_4:
    "**Nereikia kopijuoti nuorodų** — raskite vaizdo įrašą, grojaraštį ar kanalą Naršyme ir atsisiųskite vienu spustelėjimu arba spustelėję dešiniuoju pelės mygtuku bet kurią puslapio nuorodą",
  why_explore_5:
    "**Skelbimų blokatorius, kai jo norite** — vienas spustelėjimas ant skydo blokuoja skelbimus ir sekimo priemones Naršymo puslapiuose",
  feat_explore_h3: "Naršymas: naršykite internete Arroxy viduje",
  feat_explore_1:
    "**Skirtukas „Naršymas“** — naršykite YouTube ar bet kurią kitą svetainę Arroxy viduje ir atsisiųskite rastą turinį nekopijuodami nuorodų. **Atsisiųsti · *jūsų profilis*** įtraukia į eilę vaizdo įrašą, grojaraštį ar kanalą, kurį žiūrite; šalia esanti rodyklė perjungia profilius, o lazdelė atveria žingsnis po žingsnio atsisiuntimą, kuriame renkamasi formatai, subtitrai ir dar daugiau",
  feat_explore_6:
    "**Atsisiuntimas dešiniuoju pelės mygtuku** — spustelėkite dešiniuoju mygtuku bet kurią vaizdo įrašo, grojaraščio ar kanalo nuorodą Naršyme, kad atsisiųstumėte ją su savo profiliu, pasirinktumėte kitą profilį skiltyje **Atsisiųsti naudojant**, atvertumėte žingsnis po žingsnio atsisiuntimą arba nukopijuotumėte nuorodą. Nereikia pirmiausia atverti kiekvieno vaizdo įrašo",
  feat_explore_7:
    "**Kompaktiškas išdėstymas** — vienas spustelėjimas Naršymo įrankių juostoje perkelia Arroxy skirtukus į ją ir suteikia puslapiui daugiau vietos",
  feat_explore_2:
    "**Adreso juosta** — rašykite, kad ieškotumėte YouTube, arba įveskite bet kurį interneto adresą, kad atvertumėte tą svetainę",
  feat_explore_3:
    "**Atsisiuntimai, kuriems reikia paskyros** — prisijunkite vieną kartą Naršyme, ir Arroxy galės atsisiųsti privačius ir tik nariams skirtus vaizdo įrašus, kuriuos gali žiūrėti jūsų paskyra, amžiaus apribojimą turinčius vaizdo įrašus, jei paskyra patvirtinta pagal amžių, bei jūsų „Žiūrėti vėliau“ ir „Patikę“ sąrašus. Ten taip pat galite prisijungti prie kitų svetainių, ir jų atsisiuntimai naudos tą prisijungimą, kai reikės. Arroxy vis tiek pirmiausia atsisiunčia neprisijungusi ir jūsų prisijungimą per Naršymą naudoja tik tada, kai atsisiuntimas nepavyksta dėl priežasties, kurią gali ištaisyti paskyra. Kai YouTube prašo patvirtinti, kad nesate robotas, Arroxy taip pat išbando jūsų prisijungimą per Naršymą",
  feat_explore_4:
    "**Naudokite antrinę paskyrą** — pirmasis Naršymo ekranas paaiškina kodėl: atsisiuntimas su paskyra kelia tam tikrą riziką, kad ta paskyra bus apribota. Kai tik norite pamiršti savo prisijungimus, atsijunkite nuo Naršymo parametruose",
  feat_explore_5:
    "**Skelbimų blokatorius** — pagal numatytuosius parametrus išjungtas. Vienas spustelėjimas ant skydo Naršymo įrankių juostoje blokuoja skelbimus ir sekimo priemones jo puslapiuose, nepaveikdamas atsisiuntimų. YouTube gali priešintis skelbimų blokatoriams prisijungusiose paskyrose",
  feat_quality_h3: "Kokybė ir formatai",
  feat_quality_1: "Iki **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Didelis kadrų dažnis ir HDR** išsaugomi tokie, kokie yra — 60 kadrų/s, HDR10",
  feat_quality_3:
    "**Garsas** — eksportuokite tik garsą kaip MP3, M4A/AAC, Opus arba WAV. Interaktyviuose atsisiuntimuose pasirinkite šaltinio originalius erdvinio garso / Dolby takelius (AC-3, E-AC-3, 5.1, DRC), kai jų yra, arba nustatykite bendrąją numatytąją parinktį **Teikti pirmenybę erdviniam / Dolby**",
  feat_quality_4:
    "**Profiliai su tikslu** — *Geriausias vaizdas* (AV1 · VP9) arba *Smart TV* (MP4 · H.264), įrašomi kaip Automatinis, MP4, MKV arba WebM be perkodavimo. HDR yra *Automatinis* (tik kai jūsų ekranas gali jį rodyti), *SDR* arba *HDR*",
  feat_quality_5:
    "**Kiekvienas kodekas kiekvienoje skiriamojoje gebos** — žingsnis po žingsnio atsisiuntimas išvardija AV1, VP9 ir H.264 greta kiekvienoje skiriamojoje gebos, todėl galite pasirinkti tą, kurį atkuria jūsų televizorius ar redaktorius",
  feat_quality_6:
    "**Žinokite, kas iš tikrųjų yra srautas** — pažymimi YouTube DI išdidinti dydžiai, DI įgarsintos garso kalbos, padidintos spartos srautai, 360° vaizdo įrašai ir pažeistos ar su vandenženkliu kopijos. Profiliai praleidžia DI išdidintus srautus, nebent jūs tai leidžiate",
  feat_privacy_h3: "Privatumas ir kontrolė",
  feat_privacy_1:
    "100 % vietinis apdorojimas — atsisiuntimai keliauja tiesiai iš YouTube į jūsų diską",
  feat_privacy_2: "**Atvirasis kodas** — kiekviena eilutė patikrinama, licencija GPLv3",
  feat_privacy_3: "Failai įrašomi tiesiai į jūsų pasirinktą aplanką",
  feat_workflow_h3: "Darbo eiga",
  feat_workflow_12:
    "**Visuotinis atsisiuntimo spartusis klavišas** — nukopijuokite nuorodą bet kurioje programoje ir paspauskite `Ctrl+Shift+D` (`Cmd+Shift+D` macOS sistemoje); Arroxy įtraukia ją į eilę su jūsų aktyviu profiliu neatverdama lango, o pranešimas tai patvirtina. Įjungta pagal numatytuosius parametrus, galima pakeisti",
  feat_workflow_1:
    "**Lankstūs paleidimo režimai** — rinkitės vedamą atskirą atsisiuntimą, grojaraščio / kanalo parinkiklį, kelių URL įklijavimą, greitąjį atsisiuntimą su įrašytais numatytaisiais parametrais arba naršykite ir atsisiųskite iš Naršymo",
  feat_workflow_2:
    "**Centrinė atsisiuntimų eilė** — kiekviena atskira, grojaraščio, kelių nuorodų ar greitoji užduotis patenka į vieną vietą, kur galima stebėti eigą, pristabdyti, tęsti, atšaukti, kartoti ir valdyti prioritetą",
  feat_workflow_3:
    "**Iškarpinės stebėjimas** — nukopijuokite vaizdo įrašo nuorodą, ir ji užpildys URL lauką, kai grįšite į Arroxy; yra **Anuliuoti**, jei to nenorėjote. Kol Arroxy užimta, nuoroda laukia, kol grįšite į URL skirtuką (išjunkite parametruose)",
  feat_workflow_4:
    "**Automatinis URL valymas** — pašalina sekimo parametrus (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) ir išskleidžia `youtube.com/redirect` nuorodas",
  feat_workflow_5:
    "**Dėklo režimas** — uždarius langą atsisiuntimai toliau vyksta fone",
  feat_workflow_6:
    "**{{LANG_COUNT}} kalbų** — automatiškai aptinka sistemos kalbą, galima bet kada perjungti",
  feat_workflow_7:
    "**Grojaraščio sinchronizavimas** — iš naujo nuskaitykite grojaraštį pagal vietinį aplanką, kad praleistumėte jau atsisiųstus vaizdo įrašus; sukuria `.m3u` grojaraščio failą, atnaujinamą atsisiunčiant kiekvieną vaizdo įrašą",
  feat_workflow_8:
    "**Greičio ir tempo valdymas** — apribokite atsisiuntimo pralaidumą, nustatykite, kiek vaizdo įrašo dalių atsisiunčiama vienu metu, ir pridėkite užklausų delsą su šablonais (*Išjungta · Subalansuota · Atsargi · Pasirinktinė*)",
  feat_workflow_9:
    "**Failų pavadinimų šablonai** — pavadinkite atsisiuntimus savo būdu naudodami `{title}`, `{uploader}`, `{id}`, `{date}`, `{year}`, `{resolution}`, `{site}`, `{categories}`, `{artist}`, `{album}`, `{track}` ir `{playlist_index}`, bendrai arba pagal atsisiuntimo profilį",
  feat_workflow_10:
    "**Atsisiuntimai vienu metu ir automatinis kartojimas** — pasirinkite, kiek eilės atsisiuntimų vykdoma tuo pačiu metu, ir leiskite Arroxy kartoti atsisiuntimą, kuris susidūrė su tinklo ar serverio problema, prieš kiekvieną bandymą laukiant ilgiau",
  feat_workflow_11:
    "**Kiekvieno grojaraščio elemento profiliai** — priskirkite kiekvienam grojaraščio vaizdo įrašui savo atsisiuntimo profilį, užuot taikę vieną parametrą visam sąrašui, kad per vieną praėjimą kai kuriuos užarchyvuotumėte aukščiausia kokybe, o likusius atsisiųstumėte kaip MP3",
  feat_workflow_13:
    "**Greitasis atsisiuntimas veikia fone** — nuoroda iškart atsiranda sąraše „Atsisiuntimai“ ir ten ruošiama, pranešimas su **Rodyti** tai patvirtina, o URL laukas išvalomas kitai nuorodai. Pradėkite kiek norite, kol ankstesnės ruošiamos",
  feat_workflow_14:
    "**Atsisiuntimai parodo, ko iš jūsų reikia** — jei Arroxy negali perskaityti nuorodos, jos eilutė paaiškina kodėl ir pasiūlo sprendimą: bandyti dar kartą, įjungti slapukus arba prisijungti per Naršymą. Kai slapukai išjungti, **Prisijungti per Naršymą** pakartoja bandymą už jus, kai tik prisijungiate. Už jūsų įkėlimo ribos ilgesnis grojaraštis savo eilutėje laukia, kol pasirinksite visą, pirmuosius elementus arba peržiūrą. Skirtukas „Atsisiuntimai“ suskaičiuoja jūsų laukiančias eilutes",
  feat_workflow_15:
    "**Atsisiųskite tik vaizdo įrašo dalį** — ekrane „Formatas“ pasirinkite pradžią ir pabaigą arba skyrių, ir Arroxy įrašys tik tą intervalą, pavadintą su intervalu po vaizdo įrašo ID. Pjūviai patenka į artimiausią pagrindinį kadrą; įjunkite tikslų pjūvį, kad vietoj to būtų perkoduojama",
  feat_workflow_16:
    "**Šalinti baigtus atsisiuntimus** — neprivaloma: baigtas atsisiuntimas palieka sąrašą po 5 sekundžių. Jo failai lieka diske, o nepavykę atsisiuntimai lieka sąraše",
  feat_workflow_17:
    "**Dydis ir Trūksta sąraše „Atsisiuntimai“** — rikiuojamas stulpelis **Dydis** rodo, kiek vietos užima kiekvienas atsisiuntimas, o **Trūksta** pažymi failus, perkeltus ar ištrintus ne per Arroxy",
  feat_workflow_18:
    "**Aurora ar Minimalistinis, tamsus ar šviesus** — stikliniai skydeliai virš judančio dangaus arba ramūs vientisi paviršiai; perjunkite poraštėje. Kompiuteriai be grafikos spartinimo automatiškai gauna Minimalistinį",
  feat_workflow_19:
    "**Mac meniu juosta** — macOS sistemoje atverkite parametrus (`Cmd+,`), nustatykite atsisiuntimo greičio ribą, perjunkite stilių ir temą bei atverkite žurnalus ar įrašykite diagnostikos failą iš meniu juostos",
  feat_workflow_20:
    "**Keiskite profilį iš bet kurio atsisiuntimo** — pakoreguokite atsisiuntimą, tada atnaujinkite profilį, nuo kurio jis prasidėjo (su pakeitimų peržiūra), arba įrašykite parametrus kaip naują profilį. Perjungiant profilį paklausiama, ar išlaikyti jūsų pakeitimus",
  feat_post_h3: "Subtitrai ir paskesnis apdorojimas",
  feat_post_1:
    "**Subtitrai** SRT, VTT ar ASS formatu — rankiniai arba sugeneruoti automatiškai, bet kuria prieinama kalba",
  feat_post_2:
    "Įrašykite šalia vaizdo įrašo, įterpkite į `.mkv` arba sutvarkykite į poaplankį `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — praleiskite arba pažymėkite skyriais rėmėjus, įžangas, pabaigas, savireklamą",
  feat_post_4:
    "**Įterpti metaduomenys** — pavadinimas, įkėlimo data, kanalas, aprašas, miniatiūra ir skyrių žymos įrašomi į failą",
  feat_post_5:
    "**Tik subtitrų paketai** — įklijuokite URL sąrašą arba atverkite grojaraštį, pasirinkite Subtitrai ir gaukite tik kiekvieno vaizdo įrašo subtitrų failus",
  feat_sites_h3: "YouTube + 2000 svetainių",
  feat_sites_1:
    "**YouTube visa apimtimi** — vaizdo įrašai, Shorts, kanalai, grojaraščiai, YouTube Music ir tinklalaidės traktuojami kaip pilnaverčiai šaltiniai",
  feat_sites_2:
    "**2000+ kitų svetainių** per yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable ir daugybė kitų",
  feat_sites_3:
    "**Tik garsas ir subtitrai** veikia visose palaikomose svetainėse, ne tik YouTube",
  feat_sites_4:
    "Jei svetainė pasikeičia, yt-dlp kas savaitę išleidžia pataisas, o Arroxy paleidžiant automatiškai atnaujina vykdomąjį failą",
  shot1_cap:
    "<b>Greitojo atsisiuntimo pradžia</b><br/>Įklijuokite URL ir iškart atsisiųskite su aktyviu profiliu",
  shot2_cap:
    "<b>Pakartotinai naudojami atsisiuntimo profiliai</b><br/>Įrašykite formato, kokybės ir išvesties šablonus — naudokite kiekvienam atsisiuntimui",
  shot3_cap:
    "<b>Kelių kalbų garso takeliai</b><br/>Pasirinkite tikslią vaizdo įrašo garso kalbą",
  shot4_cap:
    "<b>Erdvinis / Dolby garsas</b><br/>5.1 ir Dolby takeliai aptinkami ir išsaugomi",
  shot5_cap:
    "<b>Kelių URL režimas</b><br/>Įklijuokite sąrašą, automatiškai pašalinkite dublikatus, įtraukite viską į eilę vienu metu",
  shot6_cap:
    "<b>Lygiagreti atsisiuntimų eilė</b><br/>Keli atsisiuntimai vienu metu su gyva eiga",
  hotkey_fig_alt:
    "Arroxy visuotinis atsisiuntimo spartusis klavišas — Ctrl+Shift+D Windows ir Linux, Cmd+Shift+D macOS sistemoje, nukopijuotą nuorodą siunčia tiesiai į atsisiuntimų eilę",
  hotkey_fig_cap:
    "<b>Visuotinis atsisiuntimo spartusis klavišas</b><br/>Nukopijuokite nuorodą bet kur, paspauskite vieną kartą — ji patenka į eilę ir pradedama atsisiųsti",
  shot7_cap: "<b>Kiekvieno grojaraščio elemento profiliai</b><br/>Suteikite kiekvienam vaizdo įrašui savo profilį — kai kuriuos užarchyvuokite 4K, likusius atsisiųskite kaip MP3",
  shot8_cap:
    "<b>Naršymas</b><br/>Naršykite YouTube ar bet kurią kitą svetainę Arroxy viduje ir atsisiųskite puslapį, kuriame esate, su savo aktyviu profiliu",
  shot9_cap:
    "<b>Pirmasis Naršymo ekranas</b><br/>Trumpa Naršymo apžvalga ir paaiškinimas, kodėl antrinė paskyra yra saugesnis prisijungimas",
  shot10_cap:
    "<b>Atsisiuntimai parodo, ko iš jūsų reikia</b><br/>Nuorodos ruošiamos fone; nepavykusi pasiūlo sprendimą, ilgas grojaraštis laukia jūsų pasirinkimo",
  shot11_cap:
    "<b>Atsisiųskite tik vaizdo įrašo dalį</b><br/>Pasirinkite pradžią ir pabaigą arba skyrių — Arroxy įrašo tik tą intervalą",
  shot12_cap:
    "<b>Profilio redaktorius</b><br/>Sureguliuokite profilį: failo tipą, skiriamąją gebą, subtitrus, paskirtį, failo pavadinimo šabloną ir dar daugiau",
  shot13_cap:
    "<b>Tamsus ar šviesus, stiklinis ar vientisas</b><br/>Keturi stiliai: stikliniai skydeliai virš judančio dangaus arba ramūs vientisi paviršiai, kiekvienas tamsus ir šviesus",
  shot14_cap:
    "<b>8K HDR esant 60 kadrų/s</b><br/>Kiekviena skiriamoji geba, kodekas ir HDR srautas, kurį siūlo vaizdo įrašas, greta",
  dl_platform_col: "Platforma",
  dl_format_col: "Tiesioginis atsisiuntimas",
  dl_oneline_note:
    "Versijos tik x86_64. Neturite `curl`? Pakeiskite `curl -fsSL` į `wget -qO-`.",
  dl_win_scoop:
    "Mėgstate Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Diegimo programa (NSIS) arba nešiojamasis `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` arba `.flatpak` (izoliuotas)",
  dl_grab: "Visi laidos failai →",
  dl_pkg_h3: "Diegimas per paketų tvarkyklę",
  dl_channel_col: "Kanalas",
  dl_command_col: "Komanda",
  dl_win_h3: "Windows: diegimo programa ar nešiojamoji versija",
  dl_win_col_installer: "NSIS diegimo programa",
  dl_win_col_portable: "Nešiojamasis `.exe`",
  dl_win_r1: "Reikalingas diegimas",
  dl_win_r1_installer: "Taip",
  dl_win_r1_portable: "Ne — paleiskite iš bet kur",
  dl_win_r2: "Automatiniai naujinimai",
  dl_win_r2_installer: "✅ programoje",
  dl_win_r2_portable: "❌ atsisiuntimas rankiniu būdu",
  dl_win_r3: "Paleidimo greitis",
  dl_win_r3_installer: "✅ greitesnis",
  dl_win_r3_portable: "⚠️ lėtesnis šaltas paleidimas",
  dl_win_r4: "Pridedama į meniu Pradėti",
  dl_win_r5: "Lengvas pašalinimas",
  dl_win_r5_portable: "❌ ištrinkite failą",
  dl_win_rec:
    "**Rekomendacija:** naudokite NSIS diegimo programą dėl automatinių naujinimų ir greitesnio paleidimo. Nešiojamąjį `.exe` naudokite, jei nenorite diegti ir keisti registro.",
  dl_win_smartscreen_h4: "„Windows SmartScreen“ įspėjimas",
  dl_win_smartscreen_intro:
    "Pirmą kartą paleidus galite pamatyti **„Windows apsaugojo jūsų kompiuterį“** arba **„Nežinomas leidėjas“**. Tai taikoma ir `Arroxy-win-x64-Setup.exe`, ir `Arroxy-win-x64-Portable.exe`. Arroxy yra nemokama ir atvirojo kodo, o Windows versijos nėra pasirašytos mokamu sertifikatu, todėl SmartScreen jas pažymi. Tai **nebūtinai** reiškia, kad Arroxy nesaugi. Norėdami tęsti:",
  dl_win_smartscreen_step1: "Spustelėkite **Daugiau informacijos**.",
  dl_win_smartscreen_step2: "Spustelėkite **Vis tiek vykdyti**.",
  dl_win_smartscreen_official:
    "Atsisiųskite Arroxy tik iš oficialaus GitHub Releases puslapio. Jei failą gavote iš kitos svetainės arba jį kas nors atsiuntė, ištrinkite jį ir atsisiųskite šviežią kopiją iš oficialaus šaltinio. Šaltinio kodas viešas, todėl galite jį patikrinti arba, jei norite, patys sukompiliuoti Arroxy.",
  dl_macos_h3: "Pirmasis paleidimas macOS sistemoje",
  dl_macos_warning:
    "Arroxy dar nėra pasirašyta kodo parašu, todėl macOS Gatekeeper pirmą kartą paleidus gali parodyti įspėjimą, kad programa pažeista. Tai tikėtina — tai nėra tikro failo pažeidimo ženklas.",
  dl_macos_m1_h4: "Terminalo būdas:",
  dl_macos_step1: "Nuvilkite `Arroxy.app` iš prijungto DMG į `/Applications`.",
  dl_macos_step2:
    "Atverkite Terminalą ir paleiskite `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Paleiskite `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Jei programos kelias kitoks, pakeiskite `/Applications/Arroxy.app` savo įdiegimo keliu.",
  dl_macos_step5:
    "Jei `sudo` paprašys, įveskite savo Mac slaptažodį.",
  dl_macos_after:
    "Pašalinus karantiną, Arroxy atsidaro įprastai.",
  dl_macos_m2_h4: "Terminalo būdas:",
  dl_macos_note:
    "macOS versijos kuriamos per CI Apple Silicon ir Intel vykdytuvuose. Jei kyla problemų, [atverkite problemos pranešimą](../../issues) — macOS naudotojų atsiliepimai aktyviai formuoja macOS testavimo ciklą.",
  dl_linux_h3: "Pirmasis paleidimas Linux sistemoje",
  dl_linux_intro:
    "AppImage paleidžiami tiesiogiai — be diegimo. Tereikia failą pažymėti kaip vykdomąjį.",
  dl_linux_m1_text:
    "**Failų tvarkyklė:** spustelėkite `.AppImage` dešiniuoju pelės mygtuku → **Ypatybės** → **Leidimai** → įjunkite **Leisti vykdyti failą kaip programą**, tada dukart spustelėkite.",
  dl_linux_m2_h4: "Terminalas:",
  dl_linux_fuse_text: "Jei paleisti vis tiek nepavyksta, paleiskite nemontuodami — FUSE paketo nereikia:",
  dl_linux_targz_h4: "Paprastas archyvas (be FUSE, be diegimo):",
  dl_linux_targz_text: "`.tar.gz` versija yra ta pati programa be AppImage apvalkalo — išskleiskite ją bet kur ir paleiskite. Diegimo programos ir FUSE paketo nereikia.",
  dl_linux_arch_note: "**Linux atsisiuntimai laidos puslapyje yra tik x86_64.** ARM64 kompiuteriuose (Raspberry Pi, Asahi Linux) Flatpak vis tiek įsidiegia, bet paleidžiant nepavyksta su `bwrap: execvp ldconfig: Exec format error`.",
  dl_warning_h3: "Kodėl galite pamatyti įspėjimą",
  dl_warning_p1:
    "Arroxy yra atvirojo kodo ir licencijuota pagal GPLv3. Windows ir macOS versijos **nepasirašytos kodo parašu** — Apple Developer ID ir Windows EV kodo pasirašymo sertifikatai kainuoja šimtus dolerių per metus, o nepriklausomas projektas moka iš savo kišenės. Be tų parašų Windows SmartScreen ir macOS Gatekeeper pirmą kartą paleidus įspėja jus. Įspėjimai reiškia, kad *jūsų OS neatpažįsta leidėjo* — jie nereiškia, kad Arroxy yra kenkėjiška programa.",
  dl_warning_p2:
    "Trys būdai pačiam patikrinti Arroxy, didėjančio kruopštumo tvarka:\n\n- **Perskaitykite šaltinio kodą.** Kiekviena eilutė yra [GitHub](https://github.com/antonio-orionus/Arroxy), o [sukompiliuoti iš šaltinio](#tech) galite patys.\n- **Patikrinkite SHA256.** Palyginkite savo failą su paskelbtu [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) — žr. [Patikrinkite savo atsisiuntimą](#verify) žemiau.\n- **Paleiskite trečiosios šalies patikrą.** Įkelkite failą į [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Pirmasis paleidimas Windows sistemoje",
  shot_smartscreen_more_alt:
    "SmartScreen dialogo langas „Windows apsaugojo jūsų kompiuterį“ su paryškinta nuoroda „Daugiau informacijos“",
  shot_smartscreen_run_alt:
    "SmartScreen dialogo langas išplėtus „Daugiau informacijos“, rodantis mygtuką „Vis tiek vykdyti“",
  dl_win_defender_h4: "Jei Windows Defender pažymi arba pašalina failą",
  dl_win_defender_p:
    "Defender euristika kartais pažymi nepasirašytas NSIS diegimo programas ir Electron nešiojamąsias versijas kaip įtartinas. Jei Defender perkelia `Arroxy-win-x64-Setup.exe` arba `Arroxy-win-x64-Portable.exe` į karantiną, atkurkite jį iš **Windows sauga → Apsauga nuo virusų ir grėsmių → Apsaugos istorija**, tada pridėkite Arroxy vykdomąjį failą kaip leidžiamą elementą skiltyje **Tvarkyti parametrus → Pridėti arba šalinti išimtis**. Kaip ir su SmartScreen, priežastis yra trūkstamas leidėjo parašas, o ne aptikta kenkėjiška programa.",

  dl_macos_first_h3: "Pirmasis paleidimas macOS sistemoje",
  dl_macos_intro:
    "Arroxy macOS versijos pasirašytos ad hoc, bet Apple jų nepatvirtino (notarizavo), todėl Gatekeeper užblokuoja pirmąjį paleidimą pranešimu *„Arroxy.app“ neatidaryta — „Apple“ negalėjo patikrinti, ar „Arroxy.app“ be kenkėjiškos programinės įrangos*. Tai reiškia, kad macOS negali patikrinti programos per Apple, o ne kad su failais kas nors negerai. Diegiant per Homebrew šio dialogo išvengiama visiškai. Jei naudojote DMG, vienos Terminalo komandos pakanka jam pašalinti:",
  dl_macos_sequoia_h4: "Terminalo sprendimas dabartiniam macOS",
  dl_macos_sequoia_intro:
    "Naudokite Terminalą nukopijavę Arroxy į Applications:",
  dl_macos_sequoia_step1:
    "Nuvilkite `Arroxy.app` iš prijungto DMG į `/Applications`.",
  dl_macos_sequoia_step2:
    "Atverkite Terminalą ir paleiskite šias dvi komandas:",
  dl_macos_sequoia_step3:
    "Paleiskite `open /Applications/Arroxy.app`, kad paleistumėte Arroxy.",
  dl_macos_sequoia_step4:
    "Jei programos kelias kitoks, pakeiskite `/Applications/Arroxy.app` savo įdiegimo keliu.",
  dl_macos_sonoma_h4: "Terminalo sprendimas senesniam macOS",
  dl_macos_sonoma_step1:
    "Nuvilkite `Arroxy.app` iš prijungto DMG į `/Applications`.",
  dl_macos_sonoma_step2:
    "Atverkite Terminalą ir pašalinkite karantiną iš `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Pašalinę karantiną, paleiskite Arroxy iš Terminalo arba Finder.",
  dl_macos_damaged_h4:
    "Gatekeeper karantino sprendimas",
  dl_macos_damaged_p:
    "Pirmoji komanda pašalina karantino atributą, kurį macOS pridėjo atsisiuntus failą; antroji paleidžia programą. Paprastai `sudo` nereikia, nes kopija `/Applications` priklauso jums — pridėkite jį tik jei gaunate leidimų klaidą.",
  dl_macos_arch_note:
    "**Apple Silicon ar Intel:** M serijos Mac (M1 / M2 / M3 / M4) atsisiųskite `arm64` DMG. Intel Mac atsisiųskite `x64` DMG. Netinkama versija vis tiek veikia per Rosetta, bet pastebimai lėčiau.",

  dl_linux_first_h3: "Pirmasis paleidimas Linux sistemoje",
  dl_linux_appimagelauncher:
    "**Neprivaloma integracija su darbalaukiu:** vieną kartą įdiekite [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher), ir kiekvienas dukart spustelėtas AppImage bus automatiškai užregistruotas jūsų paleidiklio meniu — `.desktop` failo kurti rankiniu būdu nereikia.",

  dl_verify_h3: "Patikrinkite savo atsisiuntimą (SHA256)",
  dl_verify_intro:
    "Kiekviena laida kartu su vykdomaisiais failais paskelbia `SHA256SUMS` failą. Norėdami patikrinti, ar jūsų atsisiuntimas nebuvo sugadintas ar pakeistas perduodant, apskaičiuokite failo maišą vietoje ir palyginkite su eilute `SHA256SUMS`. Atverkite naujausios laidos puslapį → **Assets** → atsisiųskite `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell arba komandų eilutė):",
  dl_verify_mac_label: "macOS (Terminalas):",
  dl_verify_linux_label: "Linux (Terminalas):",
  dl_verify_vt_text:
    "Norite trečiosios šalies kenkėjiškų programų patikros? Įkelkite failą į [VirusTotal](https://www.virustotal.com). Keli bendrosios euristikos pažymėjimai iš nedidelių variklių nepasirašytoms Electron programoms yra normalu; plačiai paplitę didžiųjų variklių aptikimai būtų tikras rūpestis.",

  dl_pm_intro:
    "Mėgstate kitą kanalą? Šie taip pat tinka ir lieka suderinti su kiekviena laida.",

  privacy_p1:
    "Atsisiuntimai gaunami tiesiogiai per [yt-dlp](https://github.com/yt-dlp/yt-dlp) iš YouTube į jūsų pasirinktą aplanką — nieko nenukreipiant per trečiosios šalies serverį. Žiūrėjimo istorija, atsisiuntimų istorija, URL ir failų turinys lieka jūsų įrenginyje.",
  privacy_p2:
    "Jokios telemetrijos — tik vienas anoniminis aktyvumo signalas per dieną: programos versija, OS, kalba, diegimo kanalas, šalis ir apytikslis laikas nuo Arroxy įdiegimo, kad galėtume suskaičiuoti aktyvius ir naujus naudotojus. Jokių ID, URL, vaizdo įrašų pavadinimų, failų kelių ar paskyros informacijos. Galite tai išjungti parametruose.",
  privacy_p3:
    "Naršymas laiko savo prisijungimus atskirai nuo jūsų naršyklės, o Arroxy niekada neskaito ir neužpildo prisijungimo formos — rašote svetainės puslapyje. Atsisiuntimai vyksta neprisijungus; tik kai vienas nepavyksta dėl priežasties, kurią gali ištaisyti paskyra, Arroxy iš naujo nuskaito prisijungimą, laiko jį laikinajame faile to atsisiuntimo metu ir vėliau tą failą ištrina. Atsijungus nuo Naršymo parametruose, jie pamirštami.",
  faq_q1: "Ar tikrai nemokama?",
  faq_a1: "Taip — licencija GPLv3, jokio mokamo plano, jokių funkcijų apribojimų.",
  faq_q11: "Kuo Arroxy skiriasi nuo kitų yt-dlp sąsajų?",
  faq_a11:
    "Dauguma nemokamų yt-dlp sąsajų yra apvalkalai, priimantys tik nuorodą. Arroxy prideda **Naršymą** — programoje integruotą naršyklę, atverančią YouTube ar bet kurią kitą svetainę: naršote ir atsisiunčiate nekopijuodami nuorodų, o prisijungiate ten vieną kartą, kad atsisiųstumėte privačius, tik nariams skirtus ir amžiaus apribojimą turinčius vaizdo įrašus bei savo „Žiūrėti vėliau“ ir „Patikę“ sąrašus, be slapukų eksportavimo. Arroxy naudoja tą prisijungimą, kai YouTube prašo patvirtinti, kad nesate robotas, o jos integruota naršyklė gauna YouTube atsisiuntimo žetoną, kad atsisiuntimai nenukristų iki mažesnio formatų skaičiaus. Žr. [Kodėl Arroxy](#why).",
  faq_q2: "Kokios kokybės vaizdo įrašus galiu atsisiųsti?",
  faq_a2:
    "Bet ką, ką pateikia YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, taip pat tik garsą. 60 kadrų/s ir HDR srautai išsaugomi tokie, kokie yra, o žingsnis po žingsnio atsisiuntimas leidžia pasirinkti AV1, VP9 arba H.264 kiekvienoje skiriamojoje gebos.",
  faq_q3: "Ar galiu išgauti tik garsą kaip MP3?",
  faq_a3:
    "Taip. Formatų meniu pasirinkite *tik garsas* ir rinkitės MP3, M4A/AAC, Opus arba WAV.",
  faq_q4: "Kaip atsisiųsti vaizdo įrašus, kuriems reikia YouTube paskyros?",
  faq_a4:
    "Vieną kartą prisijunkite skirtuke Naršymas. Tada Arroxy galės atsisiųsti privačius ir tik nariams skirtus vaizdo įrašus, kuriuos gali žiūrėti jūsų paskyra, amžiaus apribojimą turinčius vaizdo įrašus, jei paskyra patvirtinta pagal amžių, ir jūsų „Žiūrėti vėliau“ bei „Patikę“ sąrašus. Prisijungimas naudojamas tik tada, kai atsisiuntimas nepavyksta dėl priežasties, kurią gali ištaisyti paskyra; viskas kita atsisiunčiama kaip anksčiau. Tai yra pasirinkimas **Prisijungimas per Naršymą**, slapukų parametruose išvardytas pirmas ir pažymėtas Rekomenduojama, o Arroxy jį pasirenka už jus, kai pirmą kartą atveriate Naršymą. yt-dlp wiki pažymi, kad [automatizavimas su prisijungimu gali pažymėti Google paskyrą](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), todėl antrinė paskyra yra saugesnis pasirinkimas.",
  faq_q5: "Ar ji toliau veiks, kai YouTube kažką pakeis?",
  faq_a5:
    "yt-dlp atnaujinamas automatiškai paleidžiant, o Arroxy greitai išleidžia pataisas, kai YouTube kažką pakeičia. Kai YouTube prašo patvirtinti, kad nesate robotas, Arroxy taip pat išbando jūsų prisijungimą per Naršymą, jei ten prisijungėte, o slapukai iš failo ar jūsų naršyklės yra pasiekiami slapukų parametruose.",
  faq_q6: "Kuriomis kalbomis prieinama Arroxy?",
  faq_a6:
    "{{LANG_COUNT}} kalbų iškart po diegimo: {{LANG_NAME_LIST}}. Arroxy pirmą kartą paleidus automatiškai aptinka jūsų operacinės sistemos kalbą, o perjungti galite bet kada kalbos parinkikliu įrankių juostoje. Vykdymo metu naudojami lokalės JSON failai yra src/shared/i18n/locales/, o vertėjams skirti PO katalogai — i18n/locales/ — atverkite PR GitHub, kad prisidėtumėte.",
  faq_q7: "Ar reikia dar kažką įdiegti?",
  faq_a7:
    "Ne. yt-dlp, ffmpeg ir ffprobe automatiškai atsisiunčiami pirmą kartą paleidus ir išsaugomi jūsų kompiuteryje. Po to papildomos sąrankos nereikia.",
  faq_q8: "Ar galiu atsisiųsti grojaraščius ar ištisus kanalus?",
  faq_a8:
    "Taip — ir vienus, ir kitus. Įklijuokite grojaraščio arba kanalo URL (pvz., `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); pasirinkite, kiek įrašų nuskaityti, tada įtraukite visą sąrašą į eilę arba pasirinkite konkrečius vaizdo įrašus. Datos intervalo filtrai bus netrukus.",
  faq_q9: "macOS rašo „programa pažeista“ — ką daryti?",
  faq_a9:
    "Tai macOS Gatekeeper blokuoja nepasirašytą programą, o ne tikras pažeidimas. Terminalo komandas, kurios pašalina karantiną ir paleidžia Arroxy, rasite skyriuje [Pirmasis paleidimas macOS sistemoje](#macos-first-launch).",
  faq_q10: "Ar legalu atsisiųsti YouTube vaizdo įrašus?",
  faq_a10:
    "Asmeniniam, privačiam naudojimui tai paprastai priimtina daugumoje jurisdikcijų. Esate atsakingi už YouTube [paslaugų teikimo sąlygų](https://www.youtube.com/t/terms) ir vietinių autorių teisių įstatymų laikymąsi.",
  plan_intro: "Dar planuojama — maždaug pagal prioritetą:",
  plan_col1: "Funkcija",
  plan_col2: "Aprašas",
  plan_r1_name: "**Grojaraščių ir kanalų filtrai**",
  plan_r1_desc: "Datos intervalo filtrai išvardijant grojaraščio ar kanalo turinį",
  plan_r2_name: "**YouTube garso takelių nuostatos**",
  plan_r2_desc:
    "Programos mastu nustatykite šnekamosios kalbos takelio nuostatą su pakeitimais pagal profilį, kai YouTube siūlo kelis garso takelius",
  plan_r3_name: "**Patikimesnis atsigavimas po klaidų**",
  plan_r3_desc:
    "Naujas pakartojimo kelias atsisiuntimams, nutrūkusiems dėl nepatikimo ar problemų turinčio interneto ryšio",
  plan_r4_name: "**Visavertė atsisiuntimų tvarkyklė**",
  plan_r4_desc:
    "Paverskite eilės skydelį visavertiškesne tvarkykle, įskaitant eilėje esančių elementų paskirties aplankų keitimą",
  plan_r5_name: "**Suplanuoti atsisiuntimai**",
  plan_r5_desc: "Pradėkite eilę nustatytu laiku (naktiniai paleidimai)",
  plan_r9_name: "**AUR paketas**",
  plan_r9_desc: "Diegimas Arch Linux ir Omarchy su `yay -S arroxy-bin`",
  plan_cta:
    "Turite funkcijos idėją? [Pateikite prašymą](../../issues) — bendruomenės nuomonė lemia prioritetą.",
  tech_content: TECH_CONTENT,
  support_h2: "Paremkite Arroxy",
  support_note: "Arroxy yra nemokama ir licencijuota pagal GPLv3 — be reklamų, be telemetrijos, be mokamo plano. Jei ji taupo jūsų laiką, kūrimą galite paremti Bitcoin, Tron ar Ethereum: adresai yra [DONATE.md](DONATE.md), kuris yra vienintelis oficialus jų šaltinis. Arroxy niekada nesiųs jums adreso el. paštu ar tiesioginiu pranešimu. Saugyklos pažymėjimas žvaigždute, klaidų pranešimas ir vertimų gerinimas padeda ne mažiau.",
  tos_h2: "Naudojimo sąlygos",
  tos_note:
    "Arroxy yra įrankis tik asmeniniam, privačiam naudojimui. Esate vienintelis atsakingas už tai, kad jūsų atsisiuntimai atitiktų YouTube [paslaugų teikimo sąlygas](https://www.youtube.com/t/terms) ir jūsų jurisdikcijos autorių teisių įstatymus. Nenaudokite Arroxy atsisiųsti, atkurti ar platinti turinio, kurio neturite teisės naudoti. Kūrėjai neprisiima atsakomybės už netinkamą naudojimą.",
  footer_credit:
    'GPLv3 · Sukurta su rūpesčiu: <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
