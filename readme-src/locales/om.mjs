const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop wantoota hundaaf kan hojetu
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — kallattii
- **Zustand** — bulchiinsa haala
- **yt-dlp** + **ffmpeg** — injinii buusuu fi walitti makuu (yeroo jalqabaaf GitHub irraa fudhatama, yeroo hunda haaraa)
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

> yt-dlp fi ffmpeg waliin hin maramne — yeroo jalqabaaf GitHub irraa buufamanii foldaraa data appichaa keessatti kuufamu.

</details>`;

export const om = {
  icon_alt: "Arroxy mascot",
  title: "Arroxy — Buufataa YouTube Bilisaa fi Madda Banaa Windows, macOS & Linux",
  read_in_label: "Afaan:",
  badge_release_alt: "Baasii",
  badge_build_alt: "Ijaarsaa",
  badge_license_alt: "Hayyama",
  badge_platforms_alt: "Platformoota",
  badge_i18n_alt: "Afaanonni",
  badge_website_alt: "Marsariitii",
  hero_desc:
    "Viidiyoo YouTube, Short, ykn sagalee kamiyyuu qulqullina jalqabaatiin buusi — hanga 4K HDR 60 fps, ykn MP3 / AAC / Opus. Windows, macOS, fi Linux irratti naannoo kee keessatti hojeta. **Beeksisni hin jiru, seensuu hin barbaachisu, kuukkii biraawzaraa hin fayyadamu, akkaawuntii Google waliin hin hidhu.**",
  cta_latest: "↓ Baasii Haaraa Buusi",
  cta_website: "Marsariitii",
  demo_alt: "Arroxy demo",
  star_cta: "Arroxy yeroo si oolfate, ⭐ tokko kan biroo argachuu isaaniif gargaara.",
  ai_notice: "",
  toc_heading: "Qabiyyee",
  why_h2: "Maaliif Arroxy",
  nocookies_h2: "Kuukkiin hin jiru, seensuu hin jiru, akkaawuntii waliin hin hidhu",
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
  nocookies_intro:
    "Kun sababii beekamaa hundaa buufataan YouTube desktop caccabaniif — fi sababii guddaa Arroxy jiruuf.",
  nocookies_setup:
    "YouTube ittisa bot isaa yoo haaromse, meeshaalee hedduun kuukkii biraawzaraa YouTube kee akka wantaatti akka ergu si gaafatu. Rakkoon lama:",
  nocookies_p1:
    "Seshinoota ergan tipikaalaan daqiiqaa ~30 keessatti dhumuu, kanaaf yeroo hedduu erga erga.",
  nocookies_p2:
    "Dookumentii yt-dlp mataa isaa [automatic kuukkii irratti hundaa'u akkaawuntii Google kee akka mallatteessu danda'u jedha](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy kuukkii, seensuu, ykn odeeffannoo biraa kamiyyuu gaafachuu hin qabu.** Tokkicha token ummataa YouTube biraawzara kamiiyyuuf tajaajiltu fayyadama. Eenyummaa Google keetiin walitti hin hidhamu, dhumuu hin qabu, jijjiiruu hin barbaachisu.",
  feat_quality_h3: "Qulqullina & formatoota",
  feat_quality_1: "Hanga **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Frame rate ol'aanaa** akka jiru eegama — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Sagalee qofa** MP3, AAC, ykn Opus tti erga",
  feat_quality_4: "Preset saffisoo: *Qulqullina gaarii* · *Walirraanfattee* · *Faayila xiqqaa*",
  feat_privacy_h3: "Icciitii & to'annaa",
  feat_privacy_1:
    "100% naannoo keessatti hojeta — buufannoon kallattiin YouTube irraa disiki kee dhaqa",
  feat_privacy_2: "Seensuu hin jiru, kuukkii hin jiru, akkaawuntii Google waliin hin hidhu",
  feat_privacy_3: "Faayiloonni kallattiin foldera filatteen seenu",
  feat_workflow_h3: "Hojii hordoffii",
  feat_workflow_1:
    "**URL YouTube kamiyyuu maxxansi** — viidiyoo fi Shorts lameenuu ni deeggara",
  feat_workflow_2:
    "**Queue buufannoo heddu** — buufannoota heddu walitti aanee hordofi",
  feat_workflow_3:
    "**Eegaa clipboard** — link YouTube koppiisi Arroxy URL of-hordofaa guutu yeroo app deebi'itu (Advanced settings keessatti jijjiiri)",
  feat_workflow_4:
    "**URL of-qulqulleessa** — params hordoffii (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) haqa fi linkiiwwan `youtube.com/redirect` bana",
  feat_workflow_5:
    "**Haala tray** — window cufuu buufannoo duubatti itti fufsisee hojechisisa",
  feat_workflow_6:
    "**Afaan 9** — afaan siistamaa of-danda'ee addaan baafata, yeroo kamiyyuu jijjiiruu danda'ama",
  feat_post_h3: "Subtitle & seensuu boodaa",
  feat_post_1:
    "**Subtitles** SRT, VTT, ykn ASS keessatti — harka ykn of-hojeetee, afaan kamiyyuu argamu keessatti",
  feat_post_2:
    "Viidiyoo cinaa kuusi, `.mkv` keessatti maksi, ykn foldara `Subtitles/` keessatti qindeessi",
  feat_post_3:
    "**SponsorBlock** — beeksisa, seensa, xumura, of-daldala naanna'i ykn boqonnaa godhi",
  feat_post_4:
    "**Metadata makame** — mata-duree, guyyaa olkaa'uu, chaanaalii, ibsaa, suuraafi boqonnaa mallattoota faayila keessatti barreessa",
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
  privacy_p1:
    "Buufannoonni kallattiin [yt-dlp](https://github.com/yt-dlp/yt-dlp) fayyadamuudhaan YouTube irraa foldera filatteetti darbamu — miila-seerri hunduu sarara servera sadarkaa-sadaffaa tokko keessa darbuu hin qabu. Seenaa ilaaluu, seenaa buufannoo, URLs, fi qabiyyee faayilaa meeshaa kee irratti hafu.",
  privacy_p2:
    "Arroxy telemetrii anonymous, walitti makamaa [Aptabase](https://aptabase.com) fayyadamuudhaan erga — pirojekti indie tokkoof eegaa namni dhugumaan itti fayyadamaa jira beekuuf gahaa qofa (eegaluu, OS, verzhiyoonii app, caccabu). URLs hin jiru, mata-duree viidiyoo hin jiru, kallattii faayilaa hin jiru, IP hin jiru, odeeffannoo akkaawuntii hin jiru — Aptabase madda banaa fi GDPR-hayyamaadha. Settings keessatti dhorkuu dandeessa.",
  faq_q1: "Dhuguma bilisaa dha?",
  faq_a1: "Eeyyee — hayyama MIT, sadarkaa kafaltii hin jiru, amaloota dhorkamuun hin jiru.",
  faq_q2: "Qulqullina viidiyoo maal buusuu danda'a?",
  faq_a2:
    "YouTube tajaajiluu danda'u: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, sagalee qofas. 60 fps, 120 fps, fi HDR streams akka jiru eegamu.",
  faq_q3: "Sagalee qofaa MP3 akka ta'uun baasuu danda'aa?",
  faq_a3: "Eeyyee. Menuu format keessatti *sagalee qofa* filadhu fi MP3, AAC, ykn Opus filadhu.",
  faq_q4: "Akkaawuntii YouTube ykn kuukkii barbaachisaa?",
  faq_a4:
    "Lakki. Arroxy tokkicha token ummataa YouTube biraawzara kamiiyyuuf tajaajiltu fayyadama. Kuukkii hin jiru, seensuu hin jiru, odeeffannoo kuufame hin jiru. [Kuukkii hin jiru, seensuu hin jiru, akkaawuntii waliin hin hidhu](#no-cookies) ilaali kuni maaliif barbaachisuu ibsuuf.",
  faq_q5: "YouTube waan tokko jijjiirte itti fufaa hojeta?",
  faq_a5:
    "Ciminni lamaatu jira: yt-dlp saatii keessatti jijjirama YouTube haaromsa, Arroxys kuukkii daqiiqaa ~30 keessatti dhumuu irratti hin hirkattu. Kun meeshaalee naannoo biraawzaraa erge irratti hirkatan caala qajeelina beekamaa godha.",
  faq_q6: "Arroxy afaan meeqa keessatti argamu?",
  faq_a6:
    "Sagal: Ingliziffaa, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Afaan siistamaa of-danda'ee addaan baafata; yeroo kamiyyuu toolbar irraa jijjiiri. Faayiloonni locale TypeScript `src/shared/i18n/locales/` keessa jiru — [PRs simatamu](../../pulls).",
  faq_q7: "Waan biraa fayyadu barbaachisaa?",
  faq_a7:
    "Lakki. yt-dlp fi ffmpeg of-hordofaan yeroo jalqabaaf baasii GitHub isaanitii irraa buufamanii naannoo kuufamu.",
  faq_q8: "Playlist ykn chaanaalii guutuu buusuu danda'aa?",
  faq_a8:
    "Viidiyoo fi Shorts tokkoo-tokkoo har'a. Playlist fi chaanaalii deggeruu [karoora](#roadmap) irraa jira.",
  faq_q9: 'macOS "app miidhaameera" jedha — maal godhaa?',
  faq_a9:
    "Sun macOS Gatekeeper app mallattoo hin qabne dhorku, midhaa dhugaa miti. Sirreessaaf kutaa [yeroo jalqabaa macOS irratti eegaluu](#download) ilaali.",
  faq_q10: "Viidiyoo YouTube buusuu seeraa dha?",
  faq_a10:
    "Fayyadama dhuunfaa, dhoksaa qofaaf yeroo hedduun mootummoota heddu keessatti fudhatama. [Dambii Tajaajilaaf](https://www.youtube.com/t/terms) YouTube fi seeraa mirga-qopheessaa naannoo keetti hordofuuf ati itti gaafatamtummaa qabda.",
  plan_intro: "Dhufuuf jiru — bakka dursa hordofee:",
  plan_col1: "Amalli",
  plan_col2: "Ibsa",
  plan_r1_name: "**Playlist & chaanaalii buusuu**",
  plan_r1_desc:
    "Playlist ykn URL chaanaalii maxxansi; viidiyoo hunda hordoffii guyyaa ykn lakkoofsa wajjin kaa'i",
  plan_r2_name: "**Galchii URL fakkaataa**",
  plan_r2_desc: "URLs heddu yeroo tokkotti maxxansi fi isaan tokkoon oofii",
  plan_r3_name: "**Jijjiiruu format**",
  plan_r3_desc: "Buufannoota meeshaa adda tokko malee MP3, WAV, FLAC tti jijjiiri",
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
