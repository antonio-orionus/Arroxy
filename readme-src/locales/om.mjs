const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop wantoota hundaaf kan hojetu
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — kallattii
- **Zustand** — bulchiinsa haala
- **yt-dlp** + **ffmpeg** — injinii buusuu fi walitti makuu (yt-dlp runtime irratti fudhatama; ffmpeg/ffprobe build time irratti waliin maramu)
- **Vite** + **electron-vite** — meeshaalee ijaarsaa
- **Vitest** + **Playwright** — qormaata unit fi end-to-end

</details>

<details>
<summary><strong>Madda irraa ijaari</strong></summary>

### Wantoota barbaachisaa — platformoota hundaaf

| Meeshaa | Verzhiyoonii | Fayyadu |
| ---- | ------- | ------- |
| Git  | kamiyyuu | [git-scm.com](https://git-scm.com) |
| Bun  | haaraa   | armaan gadii OS-tiin ilaali |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Meeshaalee ijaarsaa native barbaachisoo miti — pirojektichi Node addon native qaba hin jiru.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clone fi itti fayyadami

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### Faayila rabsuu ijaari

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # OS ammaa kanaaf qindeessi
bun run dist:win     # Windows portable exe cross-compile
\`\`\`

> yt-dlp yeroo jalqabaaf GitHub irraa fudhatamee foldara data app keessatti kuufama. ffmpeg fi ffprobe release Arroxy hunda waliin dhufu.

</details>`;

export const om = {
  icon_alt: "Arroxy mascot",
  title: "Arroxy — Buufataa YouTube (+ Saayitii 2000) Bilisaa fi Madda Banaa Windows, macOS & Linux",
  read_in_label: "Afaan:",
  badge_release_alt: "Baasii",
  badge_build_alt: "Ijaarsaa",
  badge_license_alt: "Hayyama",
  badge_platforms_alt: "Platformoota",
  badge_i18n_alt: "Afaanonni",
  badge_website_alt: "Marsariitii",
  hero_desc:
    "Viidiyoo, Shorts, muuziqaa, chaanaalota, podkaastota, ykn sagalee **YouTube fi saayitiiwwan 2000+** irraa buufi — hanga 4K HDR 60 fps, ykn MP3 / AAC / Opus. Windows, macOS, fi Linux irratti naannoo kee keessatti hojeta. **Beeksisni hin jiru, wanti dabalataa hin jiru, gurguurtaan dabalaataa hin jiru.**",
  cta_latest: "↓ Baasii Haaraa Buusi",
  cta_website: "Marsariitii",
  demo_alt: "Arroxy demo",
  star_cta: "Arroxy yeroo si oolfate, ⭐ tokko kan biroo argachuu isaaniif gargaara.",
  ai_notice: "",
  toc_heading: "Qabiyyee",
  why_h2: "Maaliif Arroxy",
  features_h2: "Amaloota",
  dl_h2: "Buusi",
  privacy_h2: "Icciitii",
  faq_h2: "Gaaffilee Deddeebii",
  roadmap_h2: "Karoora",
  tech_h2: "Waan itti Ijaare",
  why_intro: "Waltajjii maayyii walitti bira qabuu filannoolee beekamoo wajjin:",
  why_r1: "Bilisaa, sadarkaa kafaltii hin qabu",
  why_r2: "Madda banaa",
  why_r3: "Naannoo keessatti qofa hojeta",
  why_r4: "Seensuu ykn kuukkii erga hin barbaachisu",
  why_r5: "Daangaa fayyadama hin qabu",
  why_r6: "App desktop platformoota hundaaf",
  why_r7: "Subtitle + SponsorBlock",
  why_summary:
    "Arroxy waan tokko qofaaf ijaarame: URL maxxansi, faayila naannoo qulqulluu argadhu. Akkaawuntiin hin jiru, gurgurtaa dabalaataa hin jiru, odeeffannoo walitti qabuu hin jiru.",
  feat_quality_h3: "Qulqullina & formatoota",
  feat_quality_1: "Hanga **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Frame rate ol'aanaa** akka jiru eegama — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Audio qofa** gara MP3, M4A/AAC, Opus yookaan WAV",
  feat_quality_4: "Preset saffisoo: *Qulqullina gaarii* · *Walirraanfattee* · *Faayila xiqqaa*",
  feat_privacy_h3: "Icciitii & to'annaa",
  feat_privacy_1:
    "100% naannoo keessatti hojeta — buufannoon kallattiin YouTube irraa disiki kee dhaqa",
  feat_privacy_2: "Seensuu hin jiru, kuukkii hin jiru, akkaawuntii Google waliin hin hidhu",
  feat_privacy_3: "Faayiloonni kallattiin foldera filatteen seenu",
  feat_workflow_h3: "Hojii hordoffii",
  feat_workflow_1:
    "**Haalawwan jalqabaa jijjiiramaa** — buusuu tokko qajeelfamaan, filannoo playlist/channel, URL hedduu maxxansuu, ykn Quick Download filannoowwan duraan kuufamaniin filadhu",
  feat_workflow_2:
    "**Tarree buusuu giddugaleessaa** — hojii tokko, playlist, bulk, ykn quick hundi bakka tokkotti walitti dhufa: adeemsa, dhaabuu, itti fufsiisuu, haquu, irra deebi’uu, fi dursa to’achuuf",
  feat_workflow_3:
    "**Eegaa clipboard** — link YouTube koppiisi Arroxy URL of-hordofaa guutu yeroo app deebi'itu (Advanced settings keessatti jijjiiri)",
  feat_workflow_4:
    "**URL of-qulqulleessa** — params hordoffii (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) haqa fi linkiiwwan `youtube.com/redirect` bana",
  feat_workflow_5:
    "**Haala tray** — window cufuu buufannoo duubatti itti fufsisee hojechisisa",
  feat_workflow_6:
    "**Afaan 21** — afaan siistamaa of-danda'ee addaan baafata, yeroo kamiyyuu jijjiiruu danda'ama",
  feat_workflow_7:
    "**Walsimsiisa playlist** — viidiyoowwan duraan buufaman akka darbaman playlist galmee naannoo waliin irra deebi'ee sakatta'a; faayila playlist `.m3u` viidiyoon tokko tokko buufamu hunda irratti haaromsamu uuma",
  feat_workflow_8:
    "**To’annoo saffisaa fi pacing** — bandwidth buusuu daangessi, turtii gaaffii dabali, fi thread fragment presets (*Off · Balanced · Careful · Custom*) waliin sirreessi",
  feat_post_h3: "Subtitle & seensuu boodaa",
  feat_post_1:
    "**Subtitles** SRT, VTT, ykn ASS keessatti — harka ykn of-hojeetee, afaan kamiyyuu argamu keessatti",
  feat_post_2:
    "Viidiyoo cinaa kuusi, `.mkv` keessatti maksi, ykn foldara `Subtitles/` keessatti qindeessi",
  feat_post_3:
    "**SponsorBlock** — beeksisa, seensa, xumura, of-daldala naanna'i ykn boqonnaa godhi",
  feat_post_4:
    "**Metadata makame** — mata-duree, guyyaa olkaa'uu, chaanaalii, ibsaa, suuraafi boqonnaa mallattoota faayila keessatti barreessa",
  feat_sites_h3: "YouTube + Saayitii 2000",
  feat_sites_1:
    "**YouTube guutummaatti** — Viidiyoowwan, Shorts, Chaanaalota, Playlistoota, YouTube Music fi Podkaastota madda sadarkaa jalqabaa ta'aniin hojjetamu",
  feat_sites_2:
    "**Saayitiiwwan 2000+ biroo** yt-dlp fayyadamuudhaan — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org fi kanneen biroo heddu",
  feat_sites_3:
    "**Audio qofa fi subtitle** saayitii deeggara hunda irratti hojjeta, YouTube qofa irratti miti",
  feat_sites_4:
    "Saayitiin yoo jijjiirames, yt-dlp torban hunda sirreessa erga, Arroxy immoo binary-n yeroo eegaluu ofumaan haaromsa",
  shot1_alt: "URL maxxansi",
  shot2_alt: "Qulqullina filadhu",
  shot3_alt: "Bakka olkaa'uu filadhu",
  shot4_alt: "Queue buufannoo hojii irra jiru",
  shot5_alt: "Afaan fi format subtitle filuuf",
  dl_platform_col: "Platform",
  dl_format_col: "Format",
  dl_win_format: "Fayyadu (NSIS) ykn Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ykn `.flatpak` (sandboxed)",
  dl_grab: "Baasii haaraa fudhachuu →",
  dl_pkg_h3: "Package manager fayyadamuun fayyadu",
  dl_channel_col: "Chaanaalii",
  dl_command_col: "Ajajaa",
  dl_win_h3: "Windows: Fayyadu vs Portable",
  dl_win_col_installer: "NSIS Fayyadu",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "Fayyadu barbaachisa",
  dl_win_r1_installer: "Eeyyee",
  dl_win_r1_portable: "Lakki — bakka kamiyyuu irraa oofii",
  dl_win_r2: "Of-haaromeessa",
  dl_win_r2_installer: "✅ app keessatti",
  dl_win_r2_portable: "❌ of-harkaan buusi",
  dl_win_r3: "Saffisa eegaluu",
  dl_win_r3_installer: "✅ saffisaa",
  dl_win_r3_portable: "⚠️ yeroo eegaluu jabinaafi gara jabina qabu",
  dl_win_r4: "Start Menu tti dabalama",
  dl_win_r5: "Salphatti maqaa itti haquu",
  dl_win_r5_portable: "❌ faayila haquu",
  dl_win_rec:
    "**Gorsa:** Of-haaromeessaa fi saffisa eegaluu gaaariif NSIS fayyadu fayyadami. Fayyadu hin barbaachifne, reejistrii hin barbaachifne filannoof portable `.exe` fayyadami.",
  dl_win_smartscreen_h4: "Windows SmartScreen akeekkachiisa",
  dl_win_smartscreen_intro:
    "Jalqaba banuu irratti **\"Windows protected your PC\"** ykn **\"Unknown publisher\"** arguu dandeessa. Kun `Arroxy-Setup-*.exe` fi `Arroxy-Portable-*.exe` lameeniifuu hojjeta. Arroxy bilisaa fi madda banaa dha, ijaarsonni Windows mallattoo kafaltii hin qabne waliin hin mallatteffamne, kanaafuu SmartScreen mallattoo isaanirratti kaa'a. Kun Arroxy nageenya hin qabu **jechuuf** of-hordofaan miti. Itti fufuuf:",
  dl_win_smartscreen_step1: "**More info** cuqaasi.",
  dl_win_smartscreen_step2: "**Run anyway** cuqaasi.",
  dl_win_smartscreen_official:
    "Arroxy fuula GitHub Releases mirkaneessaatii qofa buufi. Faayila marsariitii biraatii argatte ykn namni tokko si erge yoo ta'e, haqii fi ganda mirkaneessaatii faayila haaraa buufi. Koodii madda ummataadhaan banaa waan ta'eef, of irraadhaa sakatta'uu ykn Arroxy of irraadhaa ijaaru dandeessa.",
  dl_macos_h3: "macOS irratti yeroo jalqabaa eegaluu",
  dl_macos_warning:
    "Arroxy ammallee mallattoo hin qabdu, kanaaf macOS Gatekeeper yeroo jalqabaa si akeeka. Kun eegamu — midhaan agarsiisu miti.",
  dl_macos_m1_h4: "Mala System Settings (gorsamaa):",
  dl_macos_step1: "Akaawuntii app Arroxy mirga-cuqaasi fi **Open** filadhu.",
  dl_macos_step2:
    "Diyaalogiin akeekkachiisaa ni mul'ata — **Cancel** cuqaasi (*Move to Trash* hin cuqasin).",
  dl_macos_step3: "**System Settings → Privacy & Security** bani.",
  dl_macos_step4:
    'Kutaa **Security** hamma gaditti deemi. *"Arroxy meeshaa guddaa hin taanee irraa waan ta\'eef itti fayyadamuun dhorkaame."* ni argita.',
  dl_macos_step5:
    "**Open Anyway** cuqaasi fi jecha darbii keetin ykn Touch ID waliin mirkaneessi.",
  dl_macos_after:
    "Tarkaanfii 5 boodaa, Arroxy salphaan ni banama fi akeekkachiisni ammas hin mul'atu.",
  dl_macos_m2_h4: "Mala Terminal (ogeessa):",
  dl_macos_note:
    "Ijaarsi macOS CI irratti Apple Silicon fi Intel runners irratti hojjetama. Rakkoo yoo qabaatte, maaloo [gaaffii bani](../../issues) — yaada fayyadamtootaa macOS irraa yeroo hedduu qabxii qormaata macOS murteessa.",
  dl_linux_h3: "Linux irratti yeroo jalqabaa eegaluu",
  dl_linux_intro:
    "AppImages kallattiin oofuu — fayyadu hin barbaachisu. Faayila akka hojjetu galchuuf qofa mallattaa itti kaa'uun barbaachisa.",
  dl_linux_m1_text:
    "**Bulchiinsa faayilaa:** `.AppImage` mirga-cuqaasi → **Properties** → **Permissions** → **Allow executing file as program** dandeessisi, erga lama-cuqaasi.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Eegaluun yoo ammallee fashale, FUSE dhabu danda'a:",
  dl_linux_flatpak_intro:
    "**Flatpak (filannoo sandboxed):** `Arroxy-*.flatpak` gara fuula baasii sanuma irraa buusi.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "Maaliif akeekkachiisa arguu dandeessa",
  dl_warning_p1:
    "Arroxy madda banaa fi hayyama MIT qaba. Ijaarsonni Windows fi macOS **mallattoo hin qaban** — ragaaleen Apple Developer ID fi Windows EV mallattoo koodii kafaltii waggaatti dhibba doolara baay'ee waan gaafataniif, pirojektiin self-funded baasii kana mataa isaarraa kafala. Mallattoo sana malee, Windows SmartScreen fi macOS Gatekeeper yeroo jalqabaatti si akeekachisuu. Akeekkachiisni kun *siistamni kee maxxantiisa hin beeku* jechuudha — Arroxy malwaare dha jechuuf miti.",
  dl_warning_p2:
    "Haala sadii Arroxy ofii keetiin mirkaneessuuf, kutaa cimina irraa cimina gaditti:\n\n- **Koodii madda dubbisi.** Sarara hundi [GitHub](https://github.com/antonio-orionus/Arroxy) irratti jira fi [madda irraa ijaaruuf](#tech) ni danda'ama.\n- **SHA256 mirkaneessi.** Faayila kee [`SHA256SUMS`](../../releases/latest) maxxanfame walitti bira qabbi — armaan gadii [Buufannoo kee mirkaneessi](#verify) ilaali.\n- **Sakattaa miilaafi baasii.** Faayila [VirusTotal](https://www.virustotal.com) irratti fe'i.",

  dl_win_first_h3: "Windows yeroo jalqabaa eegaluu",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "Windows Defender faayila mallattaa itti kaa'e ykn haqe yoo ta'e",
  dl_win_defender_p:
    "Heuristics Defender sometimes flag unsigned NSIS installers fi Electron portables akka shakkisiisoo. Defender `Arroxy-Setup-*.exe` ykn `Arroxy-Portable-*.exe` karantinii keessa kaa'e yoo ta'e, **Windows Security → Virus & threat protection → Protection history** irraa deebi'i, erga Arroxy executable **Manage settings → Add or remove exclusions** jalatti wantoota hayyamamaniitti dabalii. SmartScreen wajjin akkuma, kasaara mallattoo maxxantii dhabuu irraa dhufa, malwaare argamuuurraa miti.",

  dl_macos_first_h3: "macOS yeroo jalqabaa eegaluu",
  dl_macos_intro:
    "Arroxy ammallee macOS'f mallattoo hin qabdu, kanaafuu Gatekeeper yeroo jalqabaa ni dhorka. Hayyama kennuuf karaan sirrii macOS version keetiin murteeffama — Sequoia 15 mirga-cuqaasuu → banuu darbuu dulloomaa cime.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 fi booda (ammaa)",
  dl_macos_sequoia_intro:
    "Sequoia 15 fi haaraa irraatti, mirga-cuqaasuu → banuu apps heddu quarantine jiran Gatekeeper hin darbu. System Settings panel fayyadami:",
  dl_macos_sequoia_step1:
    "`Arroxy.app` DMG ramadame irraa `/Applications` tti harkisi.",
  dl_macos_sequoia_step2:
    "Arroxy lama-cuqaasi. Diyaalogiin dhorkaaf ni mul'ata — **Done** cuqaasi (*Move to Trash* hin cuqasin).",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** bani fi kutaa **Security** hamma gaditti deemi. *"Arroxy was blocked to protect your Mac"* (ykn ergaa itti dhiyaatu) ni argita.',
  dl_macos_sequoia_step4:
    "**Open Anyway** cuqaasi, jecha darbii keetin ykn Touch ID waliin mirkaneessi, erga Arroxy `/Applications` irraa deebi'ii eegali.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 fi dura",
  dl_macos_sonoma_step1:
    "`Arroxy.app` DMG ramadame irraa `/Applications` tti harkisi.",
  dl_macos_sonoma_step2:
    "`Arroxy.app` `/Applications` keessatti mirga-cuqaasi (ykn Control-cuqaasi) fi **Open** filadhu.",
  dl_macos_sonoma_step3:
    "Diyaalogiin akeekkachiisaa amma **Open** button qaba — cuqaasii mirkaneessi. Arroxy salphaan ni banama fi akeekkachiisni ammas hin mul'atu.",
  dl_macos_damaged_h4:
    '"App is damaged" ykn Gatekeeper dhorku cimaa — Terminal dursaa',
  dl_macos_damaged_p:
    'macOS *"Arroxy is damaged and can\'t be opened"* jedhe yoo ta\'e, ykn tarkaanfiiwwan armaan olii hanga tokkollee dhorkuu hin baasnee, qabiyyeen quarantine DMG irratti sababii (biraawzarootni muraasaa fi macOS mataa isaa translocation behavior waan qindaa\'aniif). App fayyadu irraa balleessi:',
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** Mac M-series (M1 / M2 / M3 / M4) irratti, `arm64` DMG buusi. Intel Macs irratti, `x64` DMG buusi. Ijaarsaa dogoggora oofuu Rosetta fayyadamuudhaan hojjeta garuu ifa gadi bu'aa.",

  dl_linux_first_h3: "Linux yeroo jalqabaa eegaluu",
  dl_linux_appimagelauncher:
    "**Walitti makoo desktop filannoo:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) yeroo tokkoo fayyadi, AppImage lama-cuqaaste kamiyyuu launcher menu keessatti of-dursuudhaan galmeeffama — faayila `.desktop` harkaan barbaachisu hin jiru.",

  dl_verify_h3: "Buufannoo kee mirkaneessi (SHA256)",
  dl_verify_intro:
    "Baasii hundi faayila `SHA256SUMS` binary waliin maxxansa. Buufannoon kee darbuu ykn dabsuu hin qabne mirkaneessuuf, faayila naannoo keessatti hash godhi fi sarara `SHA256SUMS` walitti bira qabbi. Fuula baasii haaraa bani → **Assets** → `SHA256SUMS` buusi.",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Sakattaa malwaare miilaafi baasii barbaaddaa? Faayila [VirusTotal](https://www.virustotal.com) irratti fe'i. Mallattoo heuristic yeroo muraasaa injinii xiqqaa irraa arguu Electron apps mallattoo hin qabne bira darbaa; injinii gurguddoo irraa arguu bal'aa rakkoo dhugaa ta'a.",

  dl_pm_intro:
    "Durumaa package manager fayyadamtaa? Karaa buufannoo harkaa darbuu dandeessa.",

  privacy_p1:
    "Buufannoonni kallattiin [yt-dlp](https://github.com/yt-dlp/yt-dlp) fayyadamuudhaan YouTube irraa foldera filatteetti darbamu — miila-seerri hunduu sarara servera sadarkaa-sadaffaa tokko keessa darbuu hin qabu. Seenaa ilaaluu, seenaa buufannoo, URLs, fi qabiyyee faayilaa meeshaa kee irratti hafu.",
  privacy_p2:
    "Arroxy telemetrii maqaa-dhabduu walitti makamaa [OpenPanel](https://openpanel.dev) fayyadamuudhaan erga — eegaluu, OS, version app fi kufaatii hubachuuf qofa. URL, mata-duree viidiyoo, karaa faayilaa, odeeffannoo account, fingerprinting yookaan data dhuunfaa hin jiru. ID install tokkoon tokkoo tasaa dha, eenyummaa keetti hin hidhamu. Settings keessatti dhaabuu dandeessa.",
  faq_q1: "Dhuguma bilisaa dha?",
  faq_a1: "Eeyyee — hayyama MIT, sadarkaa kafaltii hin jiru, amaloota dhorkamuun hin jiru.",
  faq_q2: "Qulqullina viidiyoo maal buusuu danda'a?",
  faq_a2:
    "YouTube tajaajiluu danda'u: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, sagalee qofas. 60 fps, 120 fps, fi HDR streams akka jiru eegamu.",
  faq_q3: "Sagalee qofaa MP3 akka ta'uun baasuu danda'aa?",
  faq_a3: "Eeyyee. Menu format keessaa *audio qofa* filadhu, booda MP3, M4A/AAC, Opus yookaan WAV filadhu.",
  faq_q4: "Akkaawuntii YouTube ykn kuukkii barbaachisaa?",
  faq_a4:
    "Durtii, lakki — Arroxy akkaawuntii YouTube, seensuu, ykn ergaa kuukkii malee hojeeta. Deeggarsi kuukkii filannoof Qindoomina Olaanaa keessa jira (Madda Kuukkii: faayila ykn biraawzara) qabiyyee mirkaneessuu barbaadu, kan akka viidiyoowwan umurii daangeffaman ykn miseensoota qofaaf, fayyadamuuf. Durtii dhaabbatee jira. Yoo dandeessistee, dookumentii yt-dlp [automatic kuukkii irratti hundaa'u akkaawuntii Google mallatteessisuu danda'a](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) jedha; akkaawuntiin gatamuu danda'u haala kanatti filannoo nageenya qabeessa dha.",
  faq_q5: "YouTube waan tokko jijjiirte itti fufaa hojeta?",
  faq_a5:
    "yt-dlp yeroo eegaluu irratti ofumaan haaromfama, fi Arroxy yeroo YouTube waan tokko jijjiirtu ariitiidhaan sirreessa erga. Yoo rakkoo argattan, deeggarsi kuukkii filannoof Qindoomina Olaanaa keessa akka filannoo deebii argama.",
  faq_q6: "Arroxy afaan meeqa keessatti argamu?",
  faq_a6:
    "Digdamatokkoo, yeroo jalqabaatii: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), हिन्दी (Hindi), Afaan Oromoo, Kiswahili, O'zbekcha (Uzbek), Tiếng Việt (Vietnamese), አማርኛ (Amharic), العربية (Arabic), اردو (Urdu), پښتو (Pashto), বাংলা (Bengali), မြန်မာဘာသာ (Burmese), Ελληνικά (Greek), fi Српски (Serbian). Arroxy afaan mana-hojii kee sirna hojjetaa irratti yeroo jalqabaatti ofumaa argata, yeroo kamiiyyuu toolbar irraa filataa afaan jijjiiruu dandeessa. Hiikaaleen objiektii TypeScript duwwaa akka src/shared/i18n/locales/ keessa jiran — gargaaruf GitHub irratti PR bani.",
  faq_q7: "Waan biraa fayyadu barbaachisaa?",
  faq_a7:
    "Lakki. yt-dlp jalqaba banuu irratti ofumaan buufamee meeshaa kee irratti kuufama; ffmpeg fi ffprobe app waliin dhufu. Sana booda qindaaʼinni dabalataa hin barbaachisu.",
  faq_q8: "Playlist ykn chaanaalii guutuu buusuu danda'aa?",
  faq_a8:
    "Eeyyee — lamaan isaaniiyyuu. URL playlist ykn channel maxxansi (fkn. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); galfata meeqa akka sakatta’u filadhu, ergasii tarree guutuu queue godhi ykn viidiyoo addaa filadhu. Filtraroonni guyyaa gara fuulduraatti dhufu.",
  faq_q9: 'macOS "app miidhaameera" jedha — maal godhaa?',
  faq_a9:
    'Sun macOS Gatekeeper app mallattoo hin qabne dhorku, midhaa dhugaa miti. ["App is damaged" — Terminal dursaa](#macos-first-launch) ilaali, ajaja sarara tokkoo `xattr` kan sirreessuu argachuuf.',
  faq_q10: "Viidiyoo YouTube buusuu seeraa dha?",
  faq_a10:
    "Fayyadama dhuunfaa, dhoksaa qofaaf yeroo hedduun mootummoota heddu keessatti fudhatama. [Dambii Tajaajilaaf](https://www.youtube.com/t/terms) YouTube fi seeraa mirga-qopheessaa naannoo keetti hordofuuf ati itti gaafatamtummaa qabda.",
  plan_intro: "Amma iyyuu karoorfame — tilmaamaan tartiiba dursaatiin:",
  plan_col1: "Amalli",
  plan_col2: "Ibsa",
  plan_r1_name: "**Playlist & chaanaalii hojjettoota**",
  plan_r1_desc: "Yeroo playlist ykn channel sakatta’an filtraroota guyyaa",
  plan_r2_name: "**Galchii URL fakkaataa**",
  plan_r2_desc: "URLs heddu yeroo tokkotti maxxansi fi isaan tokkoon oofii",
  plan_r4_name: "**Template maqaa faayilaa dhuunfaa**",
  plan_r4_desc:
    "Faayiloota mata-duree, olkaa'aa, guyyaa, mookii shan — preview qindoofame wajjin maqaa kaa'i",
  plan_r5_name: "**Buufannoo yeroo qabamee**",
  plan_r5_desc: "Queue yeroo qindaawaa irratti eegali (halkaniidhumaan hojeti)",
  plan_r6_name: "**Daangaa saffisaa**",
  plan_r6_desc: "Bandwidth daangessii buufannoonni walitti hidhamina kee hin guunnee",
  plan_r7_name: "**Muraa Clip**",
  plan_r7_desc: "Tokkicha kutaa yeroo eegaluu/dhumu irratti buusi",
  plan_cta:
    "Amala yaaddetee jirtaa? [Gaaffii bani](../../issues) — galchiin hawaasaa dursa murteessa.",
  tech_content: TECH_CONTENT,
  tos_h2: "Hayyama fayyadamuu",
  tos_note:
    "Arroxy meeshaa fayyadama dhuunfaa, dhoksaa qofaaf. Buufannoonni kee Dambii Tajaajilaaf YouTube [Terms of Service](https://www.youtube.com/t/terms) fi seeraa mirga-qopheessaa naannoo keetii wajjin walsimuu mirkaneessuu qofaaf itti gaafatamaa taata. Arroxy fayyadamuudhaan mirgaa hin qabne qabiyyee buusuu, haaromsu, ykn raabsuu hin godhin. Guddiftoonni misooma dogoggoraa kamiifis itti gaafatamu hin qaban.",
  footer_credit:
    'MIT License · Qalbii fi qormaata <a href="https://x.com/OrionusAI">@OrionusAI</a> tiin hojjetame',
};
