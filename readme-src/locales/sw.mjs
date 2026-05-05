const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — programu ya mezani inayofanya kazi kwenye mifumo yote
- **React 19** + **TypeScript** — kiolesura cha mtumiaji
- **Tailwind CSS v4** — muundo wa kuonekana
- **Zustand** — usimamizi wa hali
- **yt-dlp** + **ffmpeg** — injini ya kupakua na kuchanganya (hupakuliwa kutoka GitHub wakati wa uzinduzi wa kwanza, daima ya kisasa)
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

> yt-dlp na ffmpeg hazijaunganishwa — zinapakuliwa kiotomatiki wakati wa uzinduzi wa kwanza kutoka kwa matoleo rasmi ya GitHub na kuhifadhiwa mahali pa kawaida.

</details>`;

export const sw = {
  icon_alt: "Nembo ya Arroxy",
  title: "Arroxy — Kipakuzi Bure cha YouTube cha Chanzo Wazi kwa Windows, macOS na Linux",
  read_in_label: "Soma kwa:",
  badge_release_alt: "Toleo",
  badge_build_alt: "Ujenzi",
  badge_license_alt: "Leseni",
  badge_platforms_alt: "Majukwaa",
  badge_i18n_alt: "Lugha",
  badge_website_alt: "Tovuti",
  hero_desc:
    "Pakua video yoyote ya YouTube, Short, au wimbo wa sauti kwa ubora wa asili — hadi 4K HDR kwa fps 60, au kama MP3 / AAC / Opus. Inafanya kazi mahali hapo kwenye Windows, macOS, na Linux. **Hakuna matangazo, hakuna kuingia, hakuna vidakuzi vya kivinjari, hakuna akaunti ya Google iliyounganishwa.**",
  cta_latest: "↓ Pakua Toleo la Hivi Karibuni",
  cta_website: "Tovuti",
  demo_alt: "Demo ya Arroxy",
  star_cta: "Ikiwa Arroxy inakuokoa muda, ⭐ inasaidia wengine kuipata.",
  ai_notice: "",
  toc_heading: "Yaliyomo",
  why_h2: "Kwa Nini Arroxy",
  nocookies_h2: "Hakuna vidakuzi, hakuna kuingia, hakuna kuunganisha akaunti",
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
  nocookies_intro:
    "Hii ndiyo sababu ya kawaida zaidi inayovunja vipakuzi vya YouTube vya mezani — na sababu kuu inayomfanya Arroxy awepo.",
  nocookies_setup:
    "YouTube inapoboresha ugunduzi wake wa boti, zana nyingi hukuambia kuhamisha vidakuzi vya YouTube vya kivinjari chako kama suluhisho la muda. Matatizo mawili na hilo:",
  nocookies_p1:
    "Vikao vilivyohamishwa kwa kawaida huisha ndani ya dakika ~30, hivyo unahamisha tena mara kwa mara.",
  nocookies_p2:
    "Hati za yt-dlp zenyewe [zinaonya kwamba ufafanuzi unaotegemea vidakuzi unaweza kuweka alama kwenye akaunti yako ya Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy haiwahi kuomba vidakuzi, kuingia, au kitambulisho chochote.** Inatumia tokeni za umma pekee ambazo YouTube inawapa vivinjari vyote. Hakuna kitu kinachohusishwa na utambulisho wako wa Google, hakuna kinachokwisha muda, hakuna kinachohitaji kuzungushwa.",
  feat_quality_h3: "Ubora na fomati",
  feat_quality_1: "Hadi **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Kiwango cha juu cha fremu** kimehifadhiwa kama kilivyo — fps 60, fps 120, HDR",
  feat_quality_3: "Usafirishaji wa **sauti pekee** kwa MP3, AAC, au Opus",
  feat_quality_4: "Maandiko ya haraka: *Ubora bora* · *Usawa* · *Faili ndogo*",
  feat_privacy_h3: "Faragha na udhibiti",
  feat_privacy_1:
    "Usindikaji wa mahali hapo 100% — maudhui yanashuka moja kwa moja kutoka YouTube hadi kwenye diski yako",
  feat_privacy_2: "Hakuna kuingia, hakuna vidakuzi, hakuna akaunti ya Google iliyounganishwa",
  feat_privacy_3: "Faili zimehifadhiwa moja kwa moja kwenye folda unayochagua",
  feat_workflow_h3: "Mtiririko wa kazi",
  feat_workflow_1:
    "**Bandika URL yoyote ya YouTube** — video na Shorts zote zinaauni",
  feat_workflow_2:
    "**Foleni ya upakuaji wa pamoja** — fuatilia maudhui kadhaa yanayopakuliwa wakati huo huo",
  feat_workflow_3:
    "**Ufuatiliaji wa ubao wa kunakili** — nakili kiungo cha YouTube na Arroxy itajaza URL kiotomatiki ukirejesha umakini kwenye programu (washa/zima katika mipangilio ya Kina)",
  feat_workflow_4:
    "**Usafi wa URL kiotomatiki** — huondoa vigezo vya ufuatiliaji (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) na kufungua viungo vya `youtube.com/redirect`",
  feat_workflow_5:
    "**Hali ya tray** — kufunga dirisha kunaacha maudhui kuendelea kupakuliwa nyuma ya skrini",
  feat_workflow_6:
    "**Lugha 9** — hugundua kiotomatiki lugha ya mfumo, inaweza kubadilishwa wakati wowote",
  feat_post_h3: "Manukuu na usindikaji wa baada ya kupakua",
  feat_post_1:
    "**Manukuu** katika SRT, VTT, au ASS — ya mkono au yaliyozalishwa kiotomatiki, katika lugha yoyote inayopatikana",
  feat_post_2:
    "Hifadhi karibu na video, ingiza ndani ya `.mkv`, au panga katika folda ndogo ya `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — ruka au weka alama za sehemu kwenye wadhamini, utangulizi, mwisho, matangazo binafsi",
  feat_post_4:
    "**Metadata iliyowekwa** — kichwa, tarehe ya kupakia, chaneli, maelezo, picha ndogo, na alama za sura zimeandikwa ndani ya faili",
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
  privacy_p1:
    "Maudhui hupakuliwa moja kwa moja kupitia [yt-dlp](https://github.com/yt-dlp/yt-dlp) kutoka YouTube hadi kwenye folda unayochagua — hakuna kitu kinachopita kwenye seva ya mtu wa tatu. Historia ya kutazama, historia ya kupakua, URL, na maudhui ya faili yanabaki kwenye kifaa chako.",
  privacy_p2:
    "Arroxy hutuma telemetry isiyo na jina na ya jumla kupitia [Aptabase](https://aptabase.com) — tu ya kutosha kwa mradi wa kujitegemea kuona kama mtu anahusika nayo (uzinduzi, OS, toleo la programu, ajali). Hakuna URL, hakuna vichwa vya video, hakuna njia za faili, hakuna IP, hakuna taarifa za akaunti — Aptabase ni chanzo wazi na inayofaa GDPR kwa muundo. Unaweza kujiepusha katika Mipangilio.",
  faq_q1: "Je, ni bure kweli kweli?",
  faq_a1: "Ndiyo — leseni ya MIT, hakuna ngazi ya malipo, hakuna kizuizi cha vipengele.",
  faq_q2: "Ninaweza kupakua ubora gani wa video?",
  faq_a2:
    "Chochote YouTube kinatoa: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, pamoja na sauti pekee. Mtiririko wa fps 60, fps 120, na HDR huhifadhiwa kama ulivyo.",
  faq_q3: "Je, ninaweza kutoa sauti pekee kama MP3?",
  faq_a3: "Ndiyo. Chagua *sauti pekee* katika menyu ya fomati na uchague MP3, AAC, au Opus.",
  faq_q4: "Je, ninahitaji akaunti ya YouTube au vidakuzi?",
  faq_a4:
    "Hapana. Arroxy inatumia tokeni za umma pekee ambazo YouTube inawapa vivinjari vyote. Hakuna vidakuzi, hakuna kuingia, hakuna vitambulisho vilivyohifadhiwa. Tazama [Hakuna vidakuzi, hakuna kuingia, hakuna kuunganisha akaunti](#no-cookies) kwa sababu hii ina maana.",
  faq_q5: "Je, itaendelea kufanya kazi YouTube ikibadilisha kitu?",
  faq_a5:
    "Tabaka mbili za ustahimilivu: yt-dlp husasishwa ndani ya masaa machache baada ya mabadiliko ya YouTube, na Arroxy haitegemei vidakuzi vinavyoisha kila dakika ~30. Hii inafanya iwe thabiti zaidi dhahiri kuliko zana zinazotegemea vikao vya kivinjari vilivyohamishwa.",
  faq_q6: "Arroxy inapatikana katika lugha zipi?",
  faq_a6:
    "Tisa: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Hugundua kiotomatiki lugha ya mfumo wako; badilisha wakati wowote kutoka kwenye upau wa zana. Faili za eneo zinapatikana kama vitu vya TypeScript wazi katika `src/shared/i18n/locales/` — [PRs zinakaribushwa](../../pulls).",
  faq_q7: "Je, ninahitaji kusakinisha kitu kingine chochote?",
  faq_a7:
    "Hapana. yt-dlp na ffmpeg zinapakuliwa kiotomatiki wakati wa uzinduzi wa kwanza kutoka kwa matoleo rasmi ya GitHub na kuhifadhiwa mahali hapo.",
  faq_q8: "Je, ninaweza kupakua orodha za kucheza au vituo vyote?",
  faq_a8:
    "Video moja na Shorts kwa sasa. Usaidizi wa orodha ya kucheza na vituo uko kwenye [ramani ya barabara](#roadmap).",
  faq_q9: 'macOS inasema "programu imeharibiwa" — nifanye nini?',
  faq_a9:
    "Hiyo ni macOS Gatekeeper inayozuia programu isiyosainiwa, si uharibifu wa kweli. Tazama sehemu ya [uzinduzi wa kwanza kwenye macOS](#download) kwa suluhisho.",
  faq_q10: "Je, ni halali kupakua video za YouTube?",
  faq_a10:
    "Kwa matumizi ya kibinafsi na ya faragha, kwa ujumla inakubaliwa katika mamlaka nyingi. Unawajibika kufuata [Masharti ya Huduma](https://www.youtube.com/t/terms) ya YouTube na sheria za haki miliki za mamlaka yako.",
  plan_intro: "Inakuja — kwa takriban mpangilio wa kipaumbele:",
  plan_col1: "Kipengele",
  plan_col2: "Maelezo",
  plan_r1_name: "**Upakuaji wa orodha ya kucheza na vituo**",
  plan_r1_desc:
    "Bandika URL ya orodha ya kucheza au kituo; panga video zote na vichujio vya tarehe au idadi",
  plan_r2_name: "**Uingizaji wa URL nyingi**",
  plan_r2_desc: "Bandika URL nyingi kwa wakati mmoja na uziendeshe mara moja",
  plan_r3_name: "**Ubadilishaji wa fomati**",
  plan_r3_desc: "Badilisha maudhui yaliyopakuliwa kuwa MP3, WAV, FLAC bila zana nyingine",
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
