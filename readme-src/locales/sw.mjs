const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — programu ya mezani inayofanya kazi kwenye mifumo yote
- **React 19** + **TypeScript** — kiolesura cha mtumiaji
- **Tailwind CSS v4** — muundo wa kuonekana
- **Zustand** — usimamizi wa hali
- **yt-dlp** + **ffmpeg** — injini ya kupakua na kuchanganya (yt-dlp hupakuliwa wakati wa runtime; ffmpeg/ffprobe hujumuishwa wakati wa build)
- **Vite** + **electron-vite** — zana za ujenzi
- **Vitest** + **Playwright** — majaribio ya kitengo na ya mwisho-hadi-mwisho

</details>

<details>
<summary><strong>Jenga kutoka chanzo</strong></summary>

### Mahitaji ya awali — mifumo yote

| Zana | Toleo   | Usanidi |
| ---- | ------- | ------- |
| Git  | yoyote  | [git-scm.com](https://git-scm.com) |
| Bun  | la hivi karibuni | tazama kwa kila OS hapa chini |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Hakuna zana za ujenzi za asili zinazohitajika — mradi hauna nyongeza za asili za Node.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Utegemezi wa wakati wa utekelezaji wa Electron
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# Majaribio ya E2E tu (Electron inahitaji skrini)
sudo apt install -y xvfb
\`\`\`

### Clone na uendeshe

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # ujenzi wa maendeleo wenye upakiaji moto
\`\`\`

### Jenga faili la usambazaji

\`\`\`bash
bun run build        # ukaguzi wa aina + mkusanyiko
bun run dist         # funga kwa OS ya sasa
bun run dist:win     # mkusanyiko wa msalaba kwa Windows portable exe
\`\`\`

> yt-dlp hupakuliwa kutoka GitHub wakati wa uzinduzi wa kwanza na kuhifadhiwa kwenye folda ya data ya programu. ffmpeg na ffprobe hujumuishwa katika kila toleo la Arroxy.

</details>`;

export const sw = {
  icon_alt: "Nembo ya Arroxy",
  title: "Arroxy — Kipakuzi Bure cha Chanzo Wazi cha YouTube (+ Tovuti 2000) kwa Windows, macOS na Linux",
  read_in_label: "Soma kwa:",
  badge_release_alt: "Toleo",
  badge_build_alt: "Ujenzi",
  badge_license_alt: "Leseni",
  badge_platforms_alt: "Majukwaa",
  badge_i18n_alt: "Lugha",
  badge_website_alt: "Tovuti",
  hero_desc:
    "Pakua video, Shorts, muziki, vituo, podikasti, au nyimbo za sauti kutoka **YouTube na tovuti 2000+ zinazotumika** — hadi 4K HDR kwa fps 60, au kama MP3 / AAC / Opus. Inafanya kazi mahali hapo kwenye Windows, macOS, na Linux. **Hakuna matangazo, hakuna mzigo wa ziada, hakuna mauzo ya ziada.**",
  cta_latest: "↓ Pakua Toleo la Hivi Karibuni",
  cta_website: "Tovuti",
  demo_alt: "Demo ya Arroxy",
  star_cta: "Ikiwa Arroxy inakuokoa muda, ⭐ inasaidia wengine kuipata.",
  ai_notice: "",
  toc_heading: "Yaliyomo",
  why_h2: "Kwa Nini Arroxy",
  features_h2: "Vipengele",
  dl_h2: "Pakua",
  privacy_h2: "Faragha",
  faq_h2: "Maswali Yanayoulizwa Mara kwa Mara",
  roadmap_h2: "Ramani ya Barabara",
  tech_h2: "Imejengwa na",
  why_intro: "Ulinganisho wa pamoja na mbadala za kawaida zaidi:",
  why_r1: "Bure, hakuna ngazi ya malipo",
  why_r2: "Chanzo wazi",
  why_r3: "Usindikaji wa mahali hapo tu",
  why_r4: "Hakuna kuingia au kuhamisha vidakuzi",
  why_r5: "Hakuna vikwazo vya matumizi",
  why_r6: "Programu ya mezani inayofanya kazi kwenye mifumo yote",
  why_r7: "Manukuu + SponsorBlock",
  why_summary:
    "Arroxy imejengwa kwa jambo moja: bandika URL, pata faili safi la mahali hapo. Hakuna akaunti, hakuna mauzo ya ziada, hakuna ukusanyaji wa data.",
  feat_quality_h3: "Ubora na fomati",
  feat_quality_1: "Hadi **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Kiwango cha juu cha fremu** kimehifadhiwa kama kilivyo — fps 60, fps 120, HDR",
  feat_quality_3: "**Sauti pekee** kama MP3, M4A/AAC, Opus au WAV",
  feat_quality_4: "Maandiko ya haraka: *Ubora bora* · *Usawa* · *Faili ndogo*",
  feat_privacy_h3: "Faragha na udhibiti",
  feat_privacy_1:
    "Usindikaji wa mahali hapo 100% — maudhui yanashuka moja kwa moja kutoka YouTube hadi kwenye diski yako",
  feat_privacy_2: "Hakuna kuingia, hakuna vidakuzi, hakuna akaunti ya Google iliyounganishwa",
  feat_privacy_3: "Faili zimehifadhiwa moja kwa moja kwenye folda unayochagua",
  feat_workflow_h3: "Mtiririko wa kazi",
  feat_workflow_1:
    "**Bandika kiungo chochote** — video za YouTube, Shorts, vituo, orodha za kucheza, podikasti na Muziki, pamoja na tovuti 2000+ zinazoungwa mkono na yt-dlp; pakua orodha nzima ya kucheza au chagua video maalum kwanza",
  feat_workflow_2:
    "**Foleni ya upakuaji wa pamoja** — fuatilia maudhui kadhaa yanayopakuliwa wakati huo huo",
  feat_workflow_3:
    "**Ufuatiliaji wa ubao wa kunakili** — nakili kiungo cha YouTube na Arroxy itajaza URL kiotomatiki ukirejesha umakini kwenye programu (washa/zima katika mipangilio ya Kina)",
  feat_workflow_4:
    "**Usafi wa URL kiotomatiki** — huondoa vigezo vya ufuatiliaji (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) na kufungua viungo vya `youtube.com/redirect`",
  feat_workflow_5:
    "**Hali ya tray** — kufunga dirisha kunaacha maudhui kuendelea kupakuliwa nyuma ya skrini",
  feat_workflow_6:
    "**Lugha 21** — hugundua kiotomatiki lugha ya mfumo, inaweza kubadilishwa wakati wowote",
  feat_workflow_7:
    "**Usawazishaji wa orodha ya kucheza** — hukagua tena orodha ya kucheza dhidi ya folda ya ndani ili kuruka video zilizopakuliwa tayari; hutengeneza faili ya orodha ya kucheza `.m3u` inayosasishwa kila video inapopakuliwa",
  feat_workflow_8:
    "**Hali ya tahadhari** — mipangilio ya kasi inayoweza kubadilishwa (*Imezimwa · Sawazisha · Tahadhari · Maalum*) huongeza ucheleweshaji kati ya maombi na kupunguza fragment threads, ikipunguza uwezekano wa bot-blocks kwenye orodha kubwa za kucheza",
  feat_post_h3: "Manukuu na usindikaji wa baada ya kupakua",
  feat_post_1:
    "**Manukuu** katika SRT, VTT, au ASS — ya mkono au yaliyozalishwa kiotomatiki, katika lugha yoyote inayopatikana",
  feat_post_2:
    "Hifadhi karibu na video, ingiza ndani ya `.mkv`, au panga katika folda ndogo ya `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — ruka au weka alama za sehemu kwenye wadhamini, utangulizi, mwisho, matangazo binafsi",
  feat_post_4:
    "**Metadata iliyowekwa** — kichwa, tarehe ya kupakia, chaneli, maelezo, picha ndogo, na alama za sura zimeandikwa ndani ya faili",
  feat_sites_h3: "YouTube + Tovuti 2000",
  feat_sites_1:
    "**YouTube kamili** — Video, Shorts, Vituo, Orodha za Kucheza, YouTube Music na Podikasti zinashughulikiwa kama vyanzo vya daraja la kwanza",
  feat_sites_2:
    "**Tovuti 2000+ nyingine** kupitia yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org na nyingi zaidi",
  feat_sites_3:
    "**Sauti pekee na manukuu** yanafanya kazi kwenye kila tovuti inayoungwa mkono, si YouTube peke yake",
  feat_sites_4:
    "Tovuti ikibadilika, yt-dlp hutoa marekebisho kila wiki na Arroxy husasisha binary kiotomatiki wakati wa uzinduzi",
  shot1_alt: "Bandika URL",
  shot2_alt: "Chagua ubora wako",
  shot3_alt: "Chagua mahali pa kuhifadhi",
  shot4_alt: "Foleni ya upakuaji inafanya kazi",
  shot5_alt: "Kichaguo cha lugha na fomati ya manukuu",
  dl_platform_col: "Jukwaa",
  dl_format_col: "Fomati",
  dl_win_format: "Kisanidi (NSIS) au Inayobebeka `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` au `.flatpak` (imewekwa sanduku)",
  dl_grab: "Pata toleo la hivi karibuni →",
  dl_pkg_h3: "Sanidi kupitia meneja wa pakiti",
  dl_channel_col: "Njia",
  dl_command_col: "Amri",
  dl_win_h3: "Windows: Kisanidi dhidi ya Inayobebeka",
  dl_win_col_installer: "Kisanidi cha NSIS",
  dl_win_col_portable: "Inayobebeka `.exe`",
  dl_win_r1: "Usanidi unahitajika",
  dl_win_r1_installer: "Ndiyo",
  dl_win_r1_portable: "Hapana — endesha kutoka mahali popote",
  dl_win_r2: "Masasisho ya kiotomatiki",
  dl_win_r2_installer: "✅ ndani ya programu",
  dl_win_r2_portable: "❌ upakuaji wa mkono",
  dl_win_r3: "Kasi ya uzinduzi",
  dl_win_r3_installer: "✅ ya haraka zaidi",
  dl_win_r3_portable: "⚠️ mwanzo wa polepole baridi",
  dl_win_r4: "Inaongeza kwenye Menyu ya Kuanza",
  dl_win_r5: "Kuondoa kwa urahisi",
  dl_win_r5_portable: "❌ futa faili",
  dl_win_rec:
    "**Pendekezo:** tumia kisanidi cha NSIS kwa masasisho ya kiotomatiki na uzinduzi wa haraka. Tumia `.exe` inayobebeka kwa chaguo lisilo na usanidi na bila usajili.",
  dl_win_smartscreen_h4: "Onyo la Windows SmartScreen",
  dl_win_smartscreen_intro:
    "Wakati wa uzinduzi wa kwanza unaweza kuona **\"Windows protected your PC\"** au **\"Unknown publisher.\"** Hii inatumika kwa `Arroxy-Setup-*.exe` na `Arroxy-Portable-*.exe`. Arroxy ni bure na chanzo wazi, na ujenzi wa Windows haujasainiwa kwa cheti cha malipo, ndiyo maana SmartScreen huipiga bendera. Hii **haimaanishi** kiotomatiki kwamba Arroxy si salama. Ili kuendelea:",
  dl_win_smartscreen_step1: "Bonyeza **More info**.",
  dl_win_smartscreen_step2: "Bonyeza **Run anyway**.",
  dl_win_smartscreen_official:
    "Pakua Arroxy tu kutoka ukurasa rasmi wa GitHub Releases. Ukipata faili kutoka tovuti nyingine au mtu akikutumia, ifute na upakue nakala mpya kutoka chanzo rasmi. Msimbo wa chanzo ni wa umma, hivyo unaweza kuukagua au kuijenga Arroxy mwenyewe ukitaka.",
  dl_macos_h3: "Uzinduzi wa kwanza kwenye macOS",
  dl_macos_warning:
    "Arroxy bado haijakaguliwa kwa msimbo, kwa hivyo macOS Gatekeeper itakuonya wakati wa uzinduzi wa kwanza. Hii inatarajiwa — si ishara ya uharibifu.",
  dl_macos_m1_h4: "Njia ya Mipangilio ya Mfumo (inayopendekezwa):",
  dl_macos_step1: "Bonyeza kulia ikoni ya programu ya Arroxy na uchague **Open**.",
  dl_macos_step2:
    "Sanduku la onyo linaonekana — bonyeza **Cancel** (usibonyeze *Move to Trash*).",
  dl_macos_step3: "Fungua **System Settings → Privacy & Security**.",
  dl_macos_step4:
    'Tembeza hadi sehemu ya **Security**. Utaona *"Arroxy ilizuiwa kutumika kwa sababu haitoki kwa msanidi aliyetambuliwa."*',
  dl_macos_step5:
    "Bonyeza **Open Anyway** na uthibitisha kwa nenosiri lako au Touch ID.",
  dl_macos_after:
    "Baada ya hatua ya 5, Arroxy inafunguka kawaida na onyo halionekani tena.",
  dl_macos_m2_h4: "Njia ya Terminal (ya juu):",
  dl_macos_note:
    "Ujenzi wa macOS hufanywa kupitia CI kwenye vichakataji vya Apple Silicon na Intel. Ukipata matatizo, tafadhali [fungua tatizo](../../issues) — maoni kutoka kwa watumiaji wa macOS yanaathiri kikamilifu mzunguko wa majaribio ya macOS.",
  dl_linux_h3: "Uzinduzi wa kwanza kwenye Linux",
  dl_linux_intro:
    "AppImages zinaendesha moja kwa moja — hakuna usanidi. Unahitaji tu kuweka faili kama inayoweza kutekelezwa.",
  dl_linux_m1_text:
    "**Kidhibiti cha faili:** bonyeza kulia `.AppImage` → **Properties** → **Permissions** → wezesha **Allow executing file as program**, kisha bonyeza mara mbili.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Ikiwa uzinduzi bado unashindwa, huenda FUSE haipo:",
  dl_linux_flatpak_intro:
    "**Flatpak (mbadala wenye sanduku):** pakua `Arroxy-*.flatpak` kutoka ukurasa huo huo wa toleo.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "Kwa nini unaweza kuona onyo",
  dl_warning_p1:
    "Arroxy ni chanzo wazi na ina leseni ya MIT. Ujenzi wa Windows na macOS **haujasainiwa kwa nambari** — cheti cha Apple Developer ID na Windows EV cha kutia saini msimbo huchangia mamia ya dola kwa mwaka, ambayo mradi wa kujitegemea hulipa mfukoni mwake. Bila saini hizo, Windows SmartScreen na macOS Gatekeeper watakuonya wakati wa uzinduzi wa kwanza. Maonyo hayo yanamaanisha *mfumo wako wa uendeshaji haukuitambua kampuni inayotoa programu* — hayamaanishi kwamba Arroxy ni programu hasidi.",
  dl_warning_p2:
    "Njia tatu za kuthibitisha Arroxy mwenyewe, kwa uthabiti unaozidi:\n\n- **Soma msimbo wa chanzo.** Kila mstari uko kwenye [GitHub](https://github.com/antonio-orionus/Arroxy) na unaweza [kuijenga kutoka chanzo](#tech).\n- **Angalia SHA256.** Linganisha faili yako na [`SHA256SUMS`](../../releases/latest) iliyochapishwa — tazama [Thibitisha upakuaji wako](#verify) hapa chini.\n- **Fanya ukaguzi wa tatu.** Pakia faili kwenye [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Uzinduzi wa kwanza wa Windows",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "Ikiwa Windows Defender inaweka bendera au kuondoa faili",
  dl_win_defender_p:
    "Heuristics za Defender wakati mwingine huweka bendera kwenye visanidi visivyosainiwa vya NSIS na portable za Electron kama zinazoshukiwa. Ikiwa Defender inaweka karantini `Arroxy-Setup-*.exe` au `Arroxy-Portable-*.exe`, irudishe kutoka **Windows Security → Virus & threat protection → Protection history**, kisha ongeza faili inayoweza kutekelezwa ya Arroxy kama kipengele kinachoruhusiwa chini ya **Manage settings → Add or remove exclusions**. Kama ilivyo na SmartScreen, kisababishi ni saini ya mchapishaji inayokosekana, si programu hasidi iliyogunduliwa.",

  dl_macos_first_h3: "Uzinduzi wa kwanza wa macOS",
  dl_macos_intro:
    "Arroxy bado haijasainiwa kwa nambari kwa macOS, kwa hivyo Gatekeeper itazuia uzinduzi wa kwanza. Njia halisi ya kuiruhusu inategemea toleo lako la macOS — Sequoia 15 ilifunga njia ya zamani ya kukwepa kwa kubonyeza kulia → Open.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 na baadaye (ya sasa)",
  dl_macos_sequoia_intro:
    "Kwenye Sequoia 15 na toleo jipya zaidi, kubonyeza kulia → Open haizuii tena Gatekeeper kwa programu nyingi zilizowekwa karantini. Tumia paneli ya Mipangilio ya Mfumo badala yake:",
  dl_macos_sequoia_step1:
    "Buruta `Arroxy.app` kutoka kwenye DMG iliyopachikwa hadi `/Applications`.",
  dl_macos_sequoia_step2:
    "Bonyeza mara mbili Arroxy. Sanduku la mazungumzo la kuzuia linaonekana — bonyeza **Done** (usibonyeze *Move to Trash*).",
  dl_macos_sequoia_step3:
    'Fungua **System Settings → Privacy & Security** na tembeza hadi sehemu ya **Security**. Utaona *"Arroxy was blocked to protect your Mac"* (au ujumbe unaofanana sana).',
  dl_macos_sequoia_step4:
    "Bonyeza **Open Anyway**, thibitisha kwa nenosiri lako au Touch ID, kisha uzindue tena Arroxy kutoka `/Applications`.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 na mapema zaidi",
  dl_macos_sonoma_step1:
    "Buruta `Arroxy.app` kutoka kwenye DMG iliyopachikwa hadi `/Applications`.",
  dl_macos_sonoma_step2:
    "Bonyeza kulia (au Control-bonyeza) `Arroxy.app` katika `/Applications` na uchague **Open**.",
  dl_macos_sonoma_step3:
    "Sanduku la onyo sasa lina kitufe cha **Open** — bonyeza na uthibitishe. Arroxy inafunguka kawaida na onyo halitatokea tena.",
  dl_macos_damaged_h4:
    '"App is damaged" au kizuizi cha Gatekeeper kinachoendelea — suluhisho la Terminal',
  dl_macos_damaged_p:
    'Ikiwa macOS inasema *"Arroxy is damaged and can\'t be opened"*, au hakuna hatua zilizo hapo juu zinazoondoa kizuizi, sifa ya karantini kwenye DMG ndiyo sababu (vivinjari vingine na tabia ya translocation ya macOS yenyewe huiweka). Iondoe kutoka kwa programu iliyosanikishwa:',
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** kwenye Mac ya mfululizo wa M (M1 / M2 / M3 / M4), pakua DMG ya `arm64`. Kwenye Mac za Intel, pakua DMG ya `x64`. Kuendesha build isiyo sahihi bado kunafanya kazi kupitia Rosetta lakini ni polepole zaidi kwa kiasi kinachoonekana.",

  dl_linux_first_h3: "Uzinduzi wa kwanza wa Linux",
  dl_linux_appimagelauncher:
    "**Uunganishaji wa hiari wa desktop:** sakinisha [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) mara moja, na AppImage yoyote unayobonyeza mara mbili itasajiliwa kiotomatiki kwenye menyu yako ya uzinduzi — hakuna faili ya `.desktop` ya mkono inayohitajika.",

  dl_verify_h3: "Thibitisha upakuaji wako (SHA256)",
  dl_verify_intro:
    "Kila toleo linachapisha faili ya `SHA256SUMS` pamoja na faili za binary. Ili kuangalia kwamba upakuaji wako haukuharibiwa au kubadilishwa wakati wa usafirishaji, hesabu hash ya faili yako mahali hapo na ulinganishe mstari katika `SHA256SUMS`. Fungua ukurasa wa toleo la hivi karibuni → **Assets** → pakua `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Unataka ukaguzi wa programu hasidi wa mtu wa tatu? Pakia faili kwenye [VirusTotal](https://www.virustotal.com). Bendera chache za heuristic za jumla kutoka kwa injini ndogo ni za kawaida kwa programu za Electron zisizosainiwa; ugunduzi ulioenea kutoka kwa injini kubwa ungekuwa wasiwasi wa kweli.",

  dl_pm_intro:
    "Tayari unatumia meneja wa pakiti? Unaweza kuruka njia ya upakuaji wa mkono.",

  privacy_p1:
    "Maudhui hupakuliwa moja kwa moja kupitia [yt-dlp](https://github.com/yt-dlp/yt-dlp) kutoka YouTube hadi kwenye folda unayochagua — hakuna kitu kinachopita kwenye seva ya mtu wa tatu. Historia ya kutazama, historia ya kupakua, URL, na maudhui ya faili yanabaki kwenye kifaa chako.",
  privacy_p2:
    "Arroxy hutuma telemetry isiyo na jina na ya jumla kupitia [OpenPanel](https://openpanel.dev) — ya kutosha kuelewa uzinduzi, OS, matoleo ya programu na ajali. Hakuna URLs, vichwa vya video, njia za faili, taarifa za akaunti, fingerprinting au data binafsi. Kitambulisho cha kila usakinishaji ni cha nasibu na hakihusiani na utambulisho wako. Unaweza kujiondoa katika Mipangilio.",
  faq_q1: "Je, ni bure kweli kweli?",
  faq_a1: "Ndiyo — leseni ya MIT, hakuna ngazi ya malipo, hakuna kizuizi cha vipengele.",
  faq_q2: "Ninaweza kupakua ubora gani wa video?",
  faq_a2:
    "Chochote YouTube kinatoa: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, pamoja na sauti pekee. Mtiririko wa fps 60, fps 120, na HDR huhifadhiwa kama ulivyo.",
  faq_q3: "Je, ninaweza kutoa sauti pekee kama MP3?",
  faq_a3: "Ndiyo. Chagua *sauti pekee* kwenye menyu ya fomati kisha uchague MP3, M4A/AAC, Opus au WAV.",
  faq_q4: "Je, ninahitaji akaunti ya YouTube au vidakuzi?",
  faq_a4:
    "Kwa chaguomsingi, hapana — Arroxy hufanya kazi bila akaunti ya YouTube, kuingia, au kuhamisha vidakuzi. Usaidizi wa hiari wa vidakuzi unapatikana katika Mipangilio ya Kina (Chanzo cha vidakuzi: faili au kivinjari) kwa maudhui yanayohitaji uthibitisho, kama vile video zenye vikwazo vya umri au za wanachama tu. Umezimwa kwa chaguomsingi. Ukiwasha, wiki ya yt-dlp inaeleza kwamba [otomatiki inayotegemea vidakuzi inaweza kuweka alama kwenye akaunti yako ya Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); akaunti ya kutupa ni chaguo salama zaidi katika hali hiyo.",
  faq_q5: "Je, itaendelea kufanya kazi YouTube ikibadilisha kitu?",
  faq_a5:
    "yt-dlp husasishwa kiotomatiki wakati wa uzinduzi, na Arroxy hutuma marekebisho haraka YouTube inapobadilisha kitu. Iwapo utakutana na tatizo, usaidizi wa hiari wa vidakuzi unapatikana katika Mipangilio ya Kina kama suluhisho la akiba.",
  faq_q6: "Arroxy inapatikana katika lugha zipi?",
  faq_a6:
    "Ishirini na moja, kutoka mwanzoni: English, Español (Kihispania), Deutsch (Kijerumani), Français (Kifaransa), 日本語 (Kijapani), 中文 (Kichina), Русский (Kirusi), Українська (Kiukraini), हिन्दी (Kihindi), Afaan Oromoo, Kiswahili, O'zbekcha (Kiuzbeki), Tiếng Việt (Kivietinamu), አማርኛ (Kiamhara), العربية (Kiarabu), اردو (Kiurdu), پښتو (Kipashto), বাংলা (Kibengali), မြန်မာဘာသာ (Kiburma), Ελληνικά (Kigiriki), na Српски (Kiserbia). Arroxy hugundua lugha ya mfumo wako wa uendeshaji wakati wa uzinduzi wa kwanza na unaweza kubadili wakati wowote kutoka kichaguo cha lugha kwenye upau wa zana. Tafsiri zinaishi kama vitu vya TypeScript vya kawaida katika src/shared/i18n/locales/ — fungua PR kwenye GitHub kuchangia.",
  faq_q7: "Je, ninahitaji kusakinisha kitu kingine chochote?",
  faq_a7:
    "Hapana. yt-dlp hupakuliwa kiotomatiki wakati wa uzinduzi wa kwanza na kuhifadhiwa kwenye kifaa chako; ffmpeg na ffprobe huja pamoja na programu. Baada ya hapo, hakuna usanidi wa ziada unaohitajika.",
  faq_q8: "Je, ninaweza kupakua orodha za kucheza au vituo vyote?",
  faq_a8:
    "Ndiyo — vyote viwili. Bandika URL ya playlist au URL ya kituo (k.m. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); Arroxy inahesabu hadi ingizo 500, kisha unaweza kuweka foleni orodha nzima au kuchagua video maalum. Vichujio vya masafa ya tarehe na idadi vinakuja hivi karibuni.",
  faq_q9: 'macOS inasema "programu imeharibiwa" — nifanye nini?',
  faq_a9:
    'Hiyo ni macOS Gatekeeper inayozuia programu isiyosainiwa, si uharibifu wa kweli. Tazama ["App is damaged" — suluhisho la Terminal](#macos-first-launch) kwa amri ya mstari mmoja ya `xattr` inayoondoa kizuizi.',
  faq_q10: "Je, ni halali kupakua video za YouTube?",
  faq_a10:
    "Kwa matumizi ya kibinafsi na ya faragha, kwa ujumla inakubaliwa katika mamlaka nyingi. Unawajibika kufuata [Masharti ya Huduma](https://www.youtube.com/t/terms) ya YouTube na sheria za haki miliki za mamlaka yako.",
  plan_intro: "Inakuja — kwa takriban mpangilio wa kipaumbele:",
  plan_col1: "Kipengele",
  plan_col2: "Maelezo",
  plan_r1_name: "**Vichujio vya orodha za kucheza na vituo**",
  plan_r1_desc:
    "Vichujio vya masafa ya tarehe na idadi wakati wa kuhesabu orodha ya kucheza au kituo (kwa sasa kikomo ni ingizo 500 imara)",
  plan_r2_name: "**Uingizaji wa URL nyingi**",
  plan_r2_desc: "Bandika URL nyingi kwa wakati mmoja na uziendeshe mara moja",
  plan_r4_name: "**Templeti maalum za majina ya faili**",
  plan_r4_desc:
    "Weka jina la faili kwa kichwa, mpakiaji, tarehe, azimio — na onyesho la moja kwa moja",
  plan_r5_name: "**Upakuaji uliopangwa**",
  plan_r5_desc: "Anza foleni kwa wakati uliowekwa (uendeshaji wa usiku)",
  plan_r6_name: "**Vikwazo vya kasi**",
  plan_r6_desc: "Punguza kipimo data ili maudhui yasijaze muunganisho wako",
  plan_r7_name: "**Kukata sehemu**",
  plan_r7_desc: "Pakua sehemu pekee kwa wakati wa kuanza/kumalizia",
  plan_cta:
    "Una kipengele unachofikiria? [Fungua ombi](../../issues) — maoni ya jamii huathiri kipaumbele.",
  tech_content: TECH_CONTENT,
  tos_h2: "Masharti ya matumizi",
  tos_note:
    "Arroxy ni zana ya matumizi ya kibinafsi na ya faragha tu. Unawajibika peke yako kuhakikisha maudhui unayopakua yanafuata [Masharti ya Huduma](https://www.youtube.com/t/terms) ya YouTube na sheria za haki miliki za mamlaka yako. Usitumie Arroxy kupakua, kunakili, au kusambaza maudhui ambayo huna haki ya kuyatumia. Waendelezaji hawana jukumu lolote kwa matumizi mabaya.",
  footer_credit:
    'Leseni ya MIT · Imetengenezwa kwa uangalifu na <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
