const TECH_CONTENT = `<details>
<summary><strong>ټیک سټیک</strong></summary>

- **Electron** — د ډیسکټاپ کراس-پلیټفارم شیل
- **React 19** + **TypeScript** — کارونکي انٹرفیس
- **Tailwind CSS v4** — ستایل کول
- **Zustand** — د حالت مدیریت
- **yt-dlp** + **ffmpeg** — د ډاونلوډ او mux انجن (دواړه د runtime پر مهال راوړل کېږي: yt-dlp تازه ساتل کېږي، ffmpeg/ffprobe یو ځل نصبېږي او د تازه کولو وروسته هم پاتې کېږي)
- **Vite** + **electron-vite** — د جوړولو وسیلې
- **Vitest** + **Playwright** — د واحد او له سره تر سره ازموینې

</details>

<details>
<summary><strong>له سرچینې جوړول</strong></summary>

### مخکینۍ شرطونه — ټولې پلیټفارمونه

| وسیله  | نسخه | نصب |
| ------- | ------- | ------- |
| Git     | هر     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` یا \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` یا \`package.json\` \`packageManager\` |

سپارښتنه: \`mise\` نصب کړئ، بیا په checkout کې \`mise install\` وچلوئ. که mise نه کاروئ، د \`bun run bootstrap\` نه مخکې Node.js له \`.node-version\` او Bun له \`package.json\` څخه په لاسي ډول فعال کړئ.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

د اصلي rebuilds لپاره Visual Studio Build Tools او Python ته اړتیا کېدای شي.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

له clone وروسته، په checkout کې \`mise trust && mise install\` وچلوئ. که ستاسو shell له مخکې \`fnm\`، \`nvm\`، يا د Homebrew Bun کاروي، نو په \`~/.zshrc\` کې mise فعال کړئ څو Arroxy د Node.js 24.21.0 او Bun 1.4.2 وکاروي:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# د build او Electron د چلولو وابستګۍ
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# یوازې E2E ازموینې (Electron ته ښکاره کیدو ته اړتیا ده)
sudo apt install -y xvfb
\`\`\`

### کلون کول او چلول

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # سپارښتنه؛ که pinned tools مو لاسي فعال کړي وي پرېږدئ
bun run bootstrap
bun run doctor
bun run dev            # Electron app د Vite renderer سره
\`\`\`

### د توزیع وړ جوړول

\`\`\`bash
bun run build        # د ډول ازموینه + کمپایل
bun run dist         # د اوسني OS لپاره پیکیج کول
bun run dist:win     # په supported host کې د Windows targets پیکیج کول
\`\`\`

> \`bun run bootstrap\` dependencies نصبوي، د Electron app dependencies بیا جوړوي، Electron تاییدوي، د development لپاره embedded ffmpeg/ffprobe چمتو کوي، او Playwright Chromium نصبوي. د release builds yt-dlp، ffmpeg او ffprobe په runtime کې د app data folder کې manage کوي؛ هیڅ یو یې د installer دننه نه راځي.

</details>`;

export const ps = {
  icon_alt: "د Arroxy ماسکوټ",
  title:
    "Arroxy — د Windows، macOS او Linux لپاره وړیا خلاصه سرچینه YouTube (+ ۲۰۰۰ سایټونه) ډاونلوډر، د جوړ شوي براوزر سره",
  read_in_label: "پدې ژبه ولولئ:",
  badge_release_alt: "خپرونه",
  badge_build_alt: "جوړونه",
  badge_license_alt: "جواز",
  badge_platforms_alt: "پلیټفارمونه",
  badge_i18n_alt: "ژبې",
  badge_website_alt: "ویب پاڼه",
  discord_badge_text: "د Discord ټولنې سره یوځای شئ",
  discord_badge_encoded:
    "%D8%AF%20Discord%20%D9%BC%D9%88%D9%84%D9%86%DB%90%20%D8%B3%D8%B1%D9%87%20%DB%8C%D9%88%DA%81%D8%A7%DB%8C%20%D8%B4%D8%A6",
  hero_desc:
    "له **YouTube او ۲۰۰۰+ ملاتړ شویو سایټونو** نه ویډیوګانې، Shorts، موسیقي، چینلونه، پوډکاسټونه، یا اوډیو ټریکونه ډاونلوډ کړئ — تر 8K HDR پورې د 60 fps سره، د MP3 / AAC / Opus په توګه، یا یوازې هغه برخه چې ورته اړتیا لرئ. په Explore ټب کې **په Arroxy کې YouTube یا بل هر سایټ وګورئ** او هغه ویډیو، playlist یا چینل ډاونلوډ کړئ چې تاسو یې ګورئ؛ هلته sign in وکړئ ترڅو هغه شخصي، یوازې د غړو او د عمر محدودیت لرونکې ویډیوګانې ډاونلوډ کړئ چې ستاسو اکاونټ یې لیدلی شي. د Windows، macOS، او Linux پر سیستم ځایي چلیږي. **هیڅ اعلانات، هیڅ بلوټ، هیڅ اضافي پلورنه نه ده.**",
  cta_latest: "↓ وروستۍ خپرونه ډاونلوډ کړئ",
  cta_website: "ویب پاڼه",
  star_cta: "که Arroxy ستاسو وخت خوندي کوي، یو ⭐ نورو سره مرسته کوي چې ومومي.",
  ai_notice: "",
  toc_heading: "منځپانګه",
  why_h2: "ولې Arroxy",
  features_h2: "ځانګړتیاوې",
  dl_h2: "نصب او لومړی پیل",
  privacy_h2: "محرمیت",
  faq_h2: "مکرر پوښتنې",
  roadmap_h2: "د پرمختیا لار",
  tech_h2: "د جوړولو ټیکنالوژي",
  why_intro: "د ترټولو عام بدیلونو سره د اړخ پر اړخ پرتله:",
  why_r1: "وړیا، هیڅ پریمیم کچه نشته",
  why_r2: "خلاصه سرچینه",
  why_r3: "یوازې ځایي پروسس کول",
  why_r5: "هیڅ د کارولو سقف نشته",
  why_r6: "کراس-پلیټفارم ډیسکټاپ اپلیکیشن",
  why_r7: "ساب ټایټلونه + SponsorBlock",
  why_r8: "د اپلیکیشن دننه browser (کتل، sign in، ډاونلوډ)",
  why_r9: "شخصي، یوازې د غړو او د عمر محدودیت لرونکې ویډیوګانې پرته له دې چې کوکیز صادر کړئ",
  why_table_note:
    "⚠️ = تر یوه حده، یا یوازې په پیسو پلان کې. په 4K Video Downloader کې د شخصي ویډیوګانو لپاره د اپلیکیشن دننه sign in پیسو ته اړتیا لري؛ ډېری وړیا yt-dlp GUIs یوازې د کوکیز فایل مني یا ستاسو د ویب browser کوکیز لولي.",
  why_summary:
    "Arroxy د یوه کار لپاره جوړ شوی: یو پاک ځایي فایل، که URL پیسټ کړئ او که ویډیو په Explore کې ومومئ. هیڅ اضافي پلورنه، هیڅ د معلوماتو راټولونه.",
  why_explore_h3: "هغه څه چې ساده yt-dlp wrapper یې نشي کولی: د Explore ټب",
  why_explore_intro:
    "ډېری وړیا YouTube ډاونلوډرونه د yt-dlp پر سر یوازې د URL یوه خانه ده. Arroxy هم yt-dlp کاروي، خو **Explore** هم لري، د اپلیکیشن دننه جوړ شوی browser چې YouTube یا بل هر سایټ پرانیزي. Explore هغه محدودیتونه تېروي چې د URL خانه یې نشي تېرولی:",
  why_explore_1:
    "**هغه ویډیوګانې چې اکاونټ ته اړتیا لري، پرته له کوکیز صادرولو** — شخصي، یوازې د غړو، او د عمر محدودیت لرونکې ویډیوګانې (په هغه اکاونټ چې عمر یې تایید شوی وي)، او ستاسو Watch Later او Liked لیستونه، او په نورو سایټونو کې هغه ویډیوګانې چې sign in ته اړتیا لري. ساده wrapper د cookies.txt صادر شوي فایل ته اړتیا لري یا باید ستاسو د ویب browser کوکیز ولولي، چې Chrome یې اوس په Windows کې بندوي. په Arroxy کې تاسو یو ځل په Explore کې sign in کوئ او پاتې کار پخپله کوي",
  why_explore_2:
    "**\"sign in وکړئ چې تایید کړئ bot نه یاست\"** — کله چې YouTube دا وپوښتي، Arroxy د ناکامېدو پر ځای ډاونلوډ ستاسو د Explore sign in سره بیا هڅوي",
  why_explore_3:
    "**د YouTube د ډاونلوډ ټوکن** — د Arroxy دننه browser هغه ټوکن ترلاسه کوي چې YouTube یې له ډاونلوډ مخکې تمه لري. پرته له هغه، YouTube کېدای شي له هغه څه چې تاسو غوښتي لږ فارمټونه او ټیټ کیفیت درکړي",
  why_explore_4:
    "**د لینکونو کاپي کولو ته اړتیا نشته** — په Explore کې یوه ویډیو، playlist یا چینل ومومئ او په یو کلیک یې ډاونلوډ کړئ، یا په پاڼه کې په هر لینک ښي کلیک وکړئ",
  why_explore_5:
    "**اعلان بلاکر کله چې یې وغواړئ** — په shield یو click د Explore په پاڼو کې اعلانونه او ټریکرونه بلاک کوي",
  feat_explore_h3:
    "Explore: په Arroxy کې ویب وګورئ",
  feat_explore_1:
    "**Explore ټب** — د Arroxy په دننه کې YouTube یا بل هر سایټ وګورئ او هغه څه چې مومئ پرته له لینکونو کاپي کولو ډاونلوډ یې کړئ. **ډاونلوډ · *ستاسو پروفایل*** هغه ویډیو، playlist یا چینل په قطار کې اچوي چې تاسو یې ګورئ؛ د هغې تر څنګ تیر پروفایلونه بدلوي، او جادویي لرګی د فارمټونو، ساب ټایټلونو او نورو د ټاکلو لپاره ګام په ګام ډاونلوډ پرانیزي",
  feat_explore_6: "**د ډاونلوډ لپاره ښي کلیک** — په Explore کې د هرې ویډیو، playlist یا چینل په لینک ښي کلیک وکړئ چې د خپل پروفایل سره یې ډاونلوډ کړئ، له **په پروفایل ډاونلوډ** څخه بل پروفایل وټاکئ، ګام په ګام ډاونلوډ پرانیزئ، یا لینک کاپي کړئ. اړتیا نشته چې لومړی هره ویډیو پرانیزئ",
  feat_explore_7: "**کمپیکټ ترتیب** — د Explore په وسیلو پټه کې یو کلیک د Arroxy ټبونه همدې ته راوړي او پاڼې ته ډېر ځای ورکوي",
  feat_explore_2:
    "**د پتې پټه** — د YouTube د لټون لپاره ټایپ کړئ، یا کومه هم ویب پته ولیکئ ترڅو هغه سایټ پرانیزي",
  feat_explore_3:
    "**هغه ډاونلوډونه چې اکاونټ ته اړتیا لري** — په Explore کې یو ځل sign in وکړئ او Arroxy کولی شي هغه شخصي او یوازې د غړو ویډیوګانې ډاونلوډ کړي چې ستاسو اکاونټ یې لیدلی شي، د عمر محدودیت لرونکې ویډیوګانې که اکاونټ د عمر لپاره تایید شوی وي، او ستاسو Watch Later او Liked لیستونه. په نورو سایټونو کې هم هلته sign in وکړئ، او د هغوی ډاونلوډونه هغه sign in کاروي کله چې ورته اړتیا وي. Arroxy لا هم لومړی له sign in پرته ډاونلوډ کوي او ستاسو Explore sign in یوازې هغه وخت کاروي چې ډاونلوډ په داسې ډول ناکام شي چې اکاونټ یې سمولی شي. کله چې YouTube وغواړي تاسو تایید کړئ چې bot نه یاست، Arroxy ستاسو Explore sign in هم هڅوي",
  feat_explore_4:
    "**دوهم اکاونټ وکاروئ** — د Explore لومړی سکرین دلیل بیانوي: د اکاونټ سره ډاونلوډ کول د هغه اکاونټ د محدودېدو یو څه خطر لري. کله چې غواړئ ټول sign in هېر شي، له Settings څخه له Explore sign out وکړئ",
  feat_explore_5:
    "**د اعلان بلاکر** — په ډیفالټ بند دی. د Explore په toolbar کې په shield یو click د هغه په پاڼو کې اعلانونه او ټریکرونه بلاک کوي، پرته له دې چې ډاونلوډونه اغېزمن کړي. YouTube کېدای شي د sign in شویو اکاونټونو لپاره د اعلان بلاکرونو پروړاندې مقاومت وکړي",
  feat_quality_h3: "کیفیت او بڼه",
  feat_quality_1:
    "تر **8K (4320p)** پورې، 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p",
  feat_quality_2:
    "**لوړ فریم نرخ او HDR** لکه چې دي ساتل کیږي — 60 fps، HDR10",
  feat_quality_3:
    "**آډیو** — یوازې آډیو MP3، M4A/AAC، Opus یا WAV ته صادر کړئ. په تعاملي ډاونلوډونو کې، که موجود وي، د سرچینې اصلي surround/Dolby ټرېکونه (AC-3، E-AC-3، 5.1، DRC) وټاکئ، یا نړیوال تلواله **surround / Dolby ته لومړیتوب ورکړئ** وټاکئ",
  feat_quality_4: "**د موخې سره پروفایلونه** — *غوره انځور* (AV1 · VP9) یا *سمارټ TV* (MP4 · H.264)، د اتوماتیک، MP4، MKV یا WebM په توګه پرته له بیا کوډ کولو خوندي کیږي. HDR *اتوماتیک* دی (یوازې کله چې ستاسو پرده یې وښيي)، *SDR*، یا *HDR*",
  feat_quality_5:
    "**په هر ریزولوشن کې هر کوډیک** — ګام په ګام ډاونلوډ په هر ریزولوشن کې AV1، VP9 او H.264 څنګ په څنګ ښيي، ترڅو هغه وټاکئ چې ستاسو TV یا اډیټر یې چلوي",
  feat_quality_6:
    "**پوه شئ چې سټریم په رښتیا څه دی** — هغه اندازې چې YouTube د AI په مرسته لویې کړې، د AI په مرسته ډوب شوې اوډیو ژبې، ښه شوي بټ ریټ لرونکي سټریمونه، 360° ویډیوګانې او زیانمنې یا واټرمارک لرونکې کاپۍ نښه کېږي. پروفایلونه د AI په مرسته لوی شوي سټریمونه پرېږدي، مګر دا چې تاسو یې اجازه ورکړئ",
  feat_privacy_h3: "محرمیت او کنټرول",
  feat_privacy_1:
    "۱۰۰٪ ځایني پروسس کول — ډاونلوډونه مستقیما له YouTube څخه ستاسو ډیسک ته ځي",
  feat_privacy_2: "هیڅ ننوتل، هیڅ کوکیز، هیڅ د ګوګل اکاونټ لینک نه دی",
  feat_privacy_3: "فایلونه مستقیما هغه فولډر ته خوندي کیږي چې تاسو انتخاب کوئ",
  feat_workflow_h3: "کاري جریان",
  feat_workflow_12: "**عمومي د ډاونلوډ هاټکي** — په هره اپلیکیشن کې یو لینک کاپي کړئ او `Ctrl+Shift+D` (په macOS کې `Cmd+Shift+D`) کېکاږئ؛ Arroxy یې پرته له دې چې کړکۍ پرانیزي ستاسو فعال پروفایل سره په کتار کې ورزیاتوي او یوه خبرتیا یې تاییدوي. په ډیفالټ ډول فعال، بیا ټاکل کېدونکی",
  feat_workflow_1:
    "**انعطاف منونکي د پیل حالتونه** — لارښود شوی واحد ډاونلوډ، د playlist/channel ټاکونکی، د bulk URL پیسټ، د خوندي شوو defaultونو سره Quick Download، یا له Explore څخه کتل او ډاونلوډ وټاکئ",
  feat_workflow_2:
    "**مرکزي ډاونلوډ قطار** — هر single، playlist، bulk، یا quick کار د پرمختګ، pause، resume، cancel، retry، او priority کنټرول لپاره یوه ځای ته راځي",
  feat_workflow_3:
    "**د کلپبورډ لیدل** — د ویډیو لینک کاپي کړئ او کله چې Arroxy ته بېرته راشئ د URL ساحه ډکوي، او که مو مطلب نه و **بېرته راګرځول** وکاروئ. کله چې Arroxy بوخت وي، لینک تر هغه انتظار کوي چې د URL ټب ته بېرته راشئ (په امستنو کې یې بند کړئ)",
  feat_workflow_4:
    "**د URL اتوماتیک پاکول** — د تعقیب پیرامیترونه (`si`، `pp`، `utm_*`، `fbclid`، `gclid`) لرې کوي او `youtube.com/redirect` لینکونه پرانیستي",
  feat_workflow_5:
    "**د ټرې حالت** — د کړکۍ بندول ډاونلوډونه شالید کې روان ساتي",
  feat_workflow_6:
    "**{{LANG_COUNT}} ژبې** — د سیسټم ژبه په اتومات ډول پېژني، هر وخت بدلول کېدای شي",
  feat_workflow_7:
    "**د پلی‌لېست همغږي** — پلی‌لېست له ځایي فولډر سره بیا ګوري تر څو مخکې ډاونلوډ شوې ویډیوګانې پرېږدي؛ د `.m3u` پلی‌لېست فایل جوړوي چې د هرې ویډیو په ډاونلوډ سره تازه کېږي",
  feat_workflow_8:
    "**د سرعت او pacing کنټرولونه** — د ډاونلوډ bandwidth محدود کړئ، وټاکئ چې د ویډیو څو برخې په یو وخت کې ډاونلوډ شي، او د requests تر منځ ځنډونه د presets (*بند · متوازن · محتاط · دودیز*) سره زیات کړئ",
  feat_workflow_9:
    "**د دوتنې نوم بېلګې** — د `{title}`، `{uploader}`، `{id}`، `{date}`، `{resolution}` او `{playlist_index}` په مرسته خپل ښکته کول د خپلې خوښې سره سم ونوموئ، ټولیز یا د هر ښکته کولو پروفایل لپاره",
  feat_workflow_10:
    "**یو ځای ډاونلوډونه او اتوماتیک بیا هڅه** — وټاکئ چې د کتار څو ډاونلوډونه په یو وخت کې روان وي، او هغه ډاونلوډ چې د شبکې یا سرور ستونزه ورسره پیښه شوې وي، Arroxy د هرې هڅې دمخه اوږد انتظار سره بیا هڅه وکړي",
  feat_workflow_11:
    "**د پلی‌لېست د هر توکي لپاره پروفایل** — د ټول لیست لپاره یوه ترتیب پرځای، د پلی‌لېست هر ویډیو ته خپل ډاونلوډ پروفایل وټاکئ، ترڅو یو پړاو کې ځینې په بشپړ کیفیت خوندي شي او پاتې یې د MP3 په توګه واخیستل شي",
  feat_workflow_13:
    "**Quick Download په شاليد کې کار کوي** — لینک سمدستي په ډاونلوډونو کې ښکاري او هلته چمتو کېږي، د **View** سره یوه یادښت دا تاییدوي، او د URL ساحه د راتلونکي لینک لپاره پاکېږي. کله چې پخواني چمتو کېږي، لکه څومره چې غواړئ پیل یې کړئ",
  feat_workflow_14:
    "**ډاونلوډونه درته وايي څه ستاسو سره اړتیا لري** — که Arroxy یو لینک ونه لوستلی شي، د هغه کتار دلیل وايي او حل وړاندې کوي: بیا هڅه، کوکیز فعالول، یا په Explore کې sign in. کله چې کوکیز بند وي، **له Explore سره sign in** وروسته له دې چې تاسو sign in وکړئ، دا بیا درته هڅوي. هغه playlist چې ستاسو د بارولو حد څخه اوږد وي په خپل کتار کې انتظار کوي چې تاسو ټول، لومړني، یا بیاکتنه وټاکئ. د ډاونلوډونو ټب هغه کتارونه شمېري چې ستاسو انتظار باسي",
  feat_workflow_15:
    "**د ویډیو یوازې یوه برخه ډاونلوډ کړئ** — د بڼې په پردې کې پیل او پای، یا یو فصل وټاکئ او Arroxy یوازې همدا بریدونه ساتي، او د ویډیو id وروسته یې په نوم کې اضافه کوي. پرې کول نږدې کیفریم ته رسېږي؛ دقیق پرې کول چالان کړئ ترڅو پرځای یې بیا کوډ شي",
  feat_workflow_16:
    "**بشپړ شوي ډاونلوډونه په اتوماتيک ډول لرې کړئ** — اختیاري: بشپړ شوی ډاونلوډ 5 ثانیې وروسته له لیست څخه وځي. فایلونه یې په ډیسک کې پاتې کیږي، او ناکام ډاونلوډونه په لیست کې پاتې کیږي",
  feat_workflow_17:
    "**په ډاونلوډونو کې اندازه او ورک** — د ترتیبولو وړ **اندازه** ستون ښيي چې هر ډاونلوډ څومره ځای نیسي، او **ورک** هغه فایلونه په نښه کوي چې د Arroxy بهر حرکت یا ړنګ شوي",
  feat_workflow_18:
    "**اورورا یا ساده، تیاره یا روښانه** — د حرکت کوونکي اسمان پر سر شیشه‌ایي پینلونه، یا آرام ټینګې سطحې؛ له فوټر څخه یې بدل کړئ. هغه کمپیوټرونه چې ګرافیک ګړندیتوب نلري په اتوماتيک ډول ساده ترلاسه کوي",
  feat_workflow_19:
    "**د Mac مینو بار** — په macOS کې له مینو بار څخه امستنې (`Cmd+,`) پرانیزئ، د ډاونلوډ سرعت حد وټاکئ، ډول او تم بدل کړئ، او لاګونه پرانیزئ یا د تشخیص فایل خوندي کړئ",
  feat_workflow_20:
    "**له هر ډاونلوډ څخه پروفایل بدل کړئ** — یو ډاونلوډ سم کړئ، بیا هغه پروفایل تازه کړئ چې ترې پیل شوی و (د بدلونونو د مخکتنې سره) یا امستنې د نوي پروفایل په توګه خوندي کړئ. د پروفایل بدلول پوښتنه کوي چې ستاسو سمونونه وساتل شي که نه",
  feat_post_h3: "ساب ټایټلونه او د پروسس کولو وروسته",
  feat_post_1:
    "**ساب ټایټلونه** د SRT، VTT، یا ASS کې — لاسي یا اتوماتیک جوړ شوي، د هر شته ژبې کې",
  feat_post_2:
    "د ویډیو تر څنګ خوندي کړئ، `.mkv` کې ځای پر ځای کړئ، یا د `Subtitles/` فرعي فولډر کې سازمان ورکړئ",
  feat_post_3:
    "**SponsorBlock** — سپانسران، شمولې، وتلو، ځان-سپارښتنې پریږدئ یا د فصل نښه ورکړئ",
  feat_post_4:
    "**ځای پر ځای شوي میټاډاټا** — سرلیک، د اپلوډ نیټه، چینل، توضیح، تصویر، او د فصل نښانونه فایل ته لیکل کیږي",
  feat_post_5:
    "**یوازې د ژباړلیکونو ډله** — د URL لیست پیسټ کړئ یا پلې لیست خلاص کړئ، ژباړلیکونه غوره کړئ، او د هرې ویډیو لپاره یوازې د ژباړلیک فایلونه ترلاسه کړئ",
  feat_sites_h3: "YouTube + ۲۰۰۰ سایټونه",
  feat_sites_1:
    "**YouTube، بشپړ** — Videos، Shorts، Channels، Playlists، YouTube Music، او Podcasts د لومړي ټولګي سرچینو په توګه اداره کیږي",
  feat_sites_2:
    "**۲۰۰۰+ نور سایټونه** د yt-dlp له لارې — Twitch، TikTok، Dailymotion، VK، SoundCloud، Bandcamp، Bilibili، archive.org، Streamable، او ډیر نور",
  feat_sites_3:
    "**یوازې اوډیو او ساب ټایټلونه** د هر ملاتړ شوي سایټ پر مهال کار کوي، نه یوازې YouTube",
  feat_sites_4:
    "که یو سایټ بدل شي، yt-dlp اونیزه فکسونه لیږدوي او Arroxy د پیلولو پر مهال بائنري اوتومات تازه کوي",
  shot1_cap:
    "<b>د چټک ښکته کولو کور</b><br/>URL پیسټ کړئ او په خپل فعال پروفایل سره یې سمدلاسه ښکته کړئ",
  shot2_cap:
    "<b>د بیا کارونې وړ د ښکته کولو پروفایلونه</b><br/>بڼه، کیفیت او محصول د وړاندیز په توګه خوندي کړئ — په هر ښکته کولو کې یې بیا وکاروئ",
  shot3_cap: "<b>څو ژبني غږ مزي</b><br/>هغه دقیق غږ ژبه وټاکئ چې ویډیو یې لري",
  shot4_cap:
    "<b>Surround / Dolby غږ</b><br/>د 5.1 او Dolby مزي پیژندل کیږي او ساتل کیږي",
  shot5_cap:
    "<b>د ډله ییز URL حالت</b><br/>لیست پیسټ کړئ، په اتومات ډول نقلونه لرې کړئ، ټول یې په یوه وخت کې کتار کړئ",
  shot6_cap:
    "<b>موازي د ښکته کولو کتار</b><br/>د ژوندۍ پرمختیا سره په یوه وخت کې څو ښکته کول",
  hotkey_fig_alt: "د Arroxy عمومي د ډاونلوډ هاټکي — په Windows او Linux کې Ctrl+Shift+D، په macOS کې Cmd+Shift+D، کاپي شوی لینک مستقیم د ډاونلوډ کتار ته لېږي",
  hotkey_fig_cap: "<b>عمومي د ډاونلوډ هاټکي</b><br/>هر چېرې لینک کاپي کړئ، یو ځل کېکاږئ — کتار ته ننوځي او ډاونلوډ پیلېږي",
  shot7_cap: "<b>د پلی‌لېست د هر توکي پروفایل</b><br/>هر ویډیو ته خپل پروفایل ورکړئ — ځینې په 4K کې خوندي کړئ، پاتې یې د MP3 په توګه واخلئ",
  shot8_cap:
    "<b>Explore</b><br/>په Arroxy کې YouTube یا بل هر سایټ وګورئ او اوسنۍ پاڼه د خپل فعال پروفایل سره ډاونلوډ کړئ",
  shot9_cap:
    "<b>د Explore لومړی سکرین</b><br/>Explore ته یوه ګړندۍ کتنه، او ولې دوهم اکاونټ خوندي sign in دی",
  shot10_cap:
    "<b>ډاونلوډونه درته وايي څه ستاسو سره اړتیا لري</b><br/>لینکونه په شاليد کې چمتو کېږي؛ ناکام لینک حل وړاندې کوي، اوږد playlist ستاسو انتخاب ته انتظار باسي",
  shot11_cap:
    "<b>د ویډیو یوازې یوه برخه ډاونلوډ کړئ</b><br/>پیل او پای، یا یو فصل وټاکئ — Arroxy یوازې همدا برخه ساتي",
  shot12_cap:
    "<b>د پروفایل مدیر</b><br/>یو پروفایل برابر کړئ: د فایل ډول، ریزولیشن، فرعي سرلیکونه، منزل، د فایل نوم کينه او نور",
  shot13_cap:
    "<b>تور یا روښانه، شیشه‌ای یا ساده</b><br/>د ټاکلو لپاره څلور بڼې: په خوځنده اسمان د شیشې پینلونه یا آرام ساده سطحې، هره یوه په تور او روښانه حالت کې",
  dl_platform_col: "پلیټفارم",
  dl_format_col: "بڼه",
  dl_oneline_note:
    "جوړښتونه یوازې د x86_64 لپاره دي. `curl` نشته؟ `curl -fsSL` په `wget -qO-` بدل کړئ.",
  dl_win_scoop:
    "Scoop غوره ګڼئ؟ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "نصب کوونکی (NSIS) یا پورټیبل `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` یا `.flatpak` (sandboxed)",
  dl_grab: "وروستۍ خپرونه واخلئ →",
  dl_pkg_h3: "د پیکیج مدیر له لارې نصب کول",
  dl_channel_col: "چینل",
  dl_command_col: "کمانډ",
  dl_win_h3: "Windows: نصب کوونکی د پورټیبل پرتله",
  dl_win_col_installer: "NSIS نصب کوونکی",
  dl_win_col_portable: "پورټیبل `.exe`",
  dl_win_r1: "نصب کولو ته اړتیا ده",
  dl_win_r1_installer: "هو",
  dl_win_r1_portable: "نه — له هر ځای چلیږي",
  dl_win_r2: "اتوماتیک تازه کول",
  dl_win_r2_installer: "✅ د اپ دننه",
  dl_win_r2_portable: "❌ لاسي ډاونلوډ",
  dl_win_r3: "د پیل سرعت",
  dl_win_r3_installer: "✅ ګړندي",
  dl_win_r3_portable: "⚠️ ورو سړه پیل",
  dl_win_r4: "د پیل مینو ته اضافه کوي",
  dl_win_r5: "اسانه لرې کول",
  dl_win_r5_portable: "❌ فایل حذف کړئ",
  dl_win_rec:
    "**سپارښتنه:** د اتوماتیک تازه کولو او ګړندي پیل لپاره د NSIS نصب کوونکی وکاروئ. د بې نصبه، بې ریجسټرۍ اختیار لپاره پورټیبل `.exe` وکاروئ.",
  dl_win_smartscreen_h4: "Windows SmartScreen خبرداری",
  dl_win_smartscreen_intro:
    'د لومړي پیلولو پر مهال ممکن وګورئ **"Windows protected your PC"** یا **"Unknown publisher."** دا د دواړو `Arroxy-win-x64-Setup.exe` او `Arroxy-win-x64-Portable.exe` پر لور پلي کیږي. Arroxy وړیا او خلاصه سرچینه ده او د Windows جوړونې د پیسو ورکولو سند سره کوډ لاسلیک شوي نه دي، له همدې امله SmartScreen یې بیرغ کوي. دا **اوتومات** معنی نه لري چې Arroxy خطرناک ده. د دوام لپاره:',
  dl_win_smartscreen_step1: "**More info** کلیک کړئ.",
  dl_win_smartscreen_step2: "**Run anyway** کلیک کړئ.",
  dl_win_smartscreen_official:
    "یوازې د رسمي GitHub Releases پاڼې نه Arroxy ډاونلوډ کړئ. که چیرې تاسو فایل د بل ویب پاڼې نه ترلاسه کولو وي یا چا درته لیږلی وي، هغه حذف کړئ او د رسمي سرچینې نه نوي نسخه ډاونلوډ کړئ. سرچینه کوډ عامه ده، نو که چیرې غواړئ کولی شئ پخپله یې وڅیړئ یا Arroxy جوړ کړئ.",
  dl_macos_h3: "د macOS پر لومړي پیل",
  dl_macos_warning:
    "Arroxy لاهم کوډ لاسلیک شوی نه دی، نو macOS Gatekeeper د لومړي پیل پر وخت د app damaged خبرداری ښودلی شي. دا تمه کېدونکې ده — دا مانا نه لري چې فایلونه رښتیا خراب دي.",
  dl_macos_m1_h4: "د Terminal طریقه:",
  dl_macos_step1: "`Arroxy.app` له پرانیستل شوي DMG څخه `/Applications` ته کش کړئ.",
  dl_macos_step2:
    "Terminal پرانیزئ او `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` وچلوئ.",
  dl_macos_step3: "`open /Applications/Arroxy.app` وچلوئ.",
  dl_macos_step4:
    "که د app لاره بله وي، `/Applications/Arroxy.app` د نصب شوې لارې سره بدله کړئ.",
  dl_macos_step5:
    "که `sudo` وغواړي، د خپل Mac پاسورډ ولیکئ.",
  dl_macos_after:
    "کله چې quarantine لرې شي، Arroxy عادي پرانیستل کېږي.",
  dl_macos_m2_h4: "د Terminal طریقه:",
  dl_macos_note:
    "د macOS جوړونه د Apple Silicon او Intel رنرانو پر CI کیږي. که تاسو ستونزو سره مخ شئ، مهرباني وکړئ [یوه ستونزه خلاصه کړئ](../../issues) — د macOS کارونکو بازخورد فعاله د macOS ازموینې دورې بڼه ورکوي.",
  dl_linux_h3: "د Linux پر لومړي پیل",
  dl_linux_intro:
    "AppImages مستقیم چلیږي — هیڅ نصب کول نشته. تاسو یوازې اړتیا لرئ فایل د اجرا وړ نښه کړئ.",
  dl_linux_m1_text:
    "**د فایل مدیر:** د `.AppImage` ښي کلیک وکړئ → **Properties** → **Permissions** → **Allow executing file as program** فعال کړئ، بیا دوه ځله کلیک وکړئ.",
  dl_linux_m2_h4: "ټرمینل:",
  dl_linux_fuse_text: "که بیا هم پیل نه شي، هغه پرته له ماونټ کولو چل کړئ — د FUSE کڅوړې ته اړتیا نشته:",
  dl_linux_targz_h4: "ساده تاربال (نه FUSE، نه انسټال):",
  dl_linux_targz_text: "د `.tar.gz` بیلډ همغه اپلیکیشن دی خو د AppImage پوښ پرته — هر چیرې یې استخراج کړئ او چل یې کړئ. نه انسټالر پکار دی او نه د FUSE کڅوړه.",
  dl_linux_arch_note: "**د خپرونې پاڼې د لینکس ډاونلوډونه یوازې x86_64 دي.** په ARM64 ماشینونو (Raspberry Pi، Asahi Linux) کې Flatpak انسټالېږي خو د پیل پر مهال د `bwrap: execvp ldconfig: Exec format error` سره ناکامېږي.",
  dl_warning_h3: "ولې ممکن خبرداری وګورئ",
  dl_warning_p1:
    "Arroxy خلاصه سرچینه او MIT-licensed ده. د Windows او macOS جوړونې **د کوډ لاسلیک شوي نه دي** — د Apple Developer ID او د Windows EV د کوډ لاسلیک کولو سندونه هر کال د سلو ډالرو لګښت لري، چې یو خپلواک پروژه له خپل ځان ادا کوي. پرته له هغو لاسلیکونو، د Windows SmartScreen او macOS Gatekeeper به تاسو ته د لومړي پیل پر مهال خبرداری درکوي. خبرداریونه دا معنی لري چې *ستاسو OS خپرنده نه پیژني* — دا معنی نه لري چې Arroxy malware دی.",
  dl_warning_p2:
    "درې طریقې چې پخپله Arroxy تصدیق کړئ، د لوړیدونکي دقت سره:\n\n- **سرچینه ولولئ.** هره کرښه پر [GitHub](https://github.com/antonio-orionus/Arroxy) ده او تاسو کولی شئ [له سرچینې جوړ کړئ](#tech).\n- **SHA256 وڅیړئ.** ستاسو فایل د خپور شوي [`SHA256SUMS`](../../releases/latest) سره سمول کړئ — لاندې [خپل ډاونلوډ تصدیق کړئ](#verify) وګورئ.\n- **د دریمې ډلې سکن چلوئ.** فایل [VirusTotal](https://www.virustotal.com) ته اپلوډ کړئ.",

  dl_win_first_h3: "Windows لومړی پیل",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" د "More info" لینک د روښانه کولو سره ډیالوګ',
  shot_smartscreen_run_alt:
    'SmartScreen د More info پراخولو وروسته ډیالوګ، د "Run anyway" تڼۍ ښودلو سره',
  dl_win_defender_h4: "که Windows Defender فایل بیرغ کوي یا لرې کوي",
  dl_win_defender_p:
    "د Defender د اټکل کولو میکانیزمونه ځینې وختونه بې لاسلیکه NSIS نصب کوونکي او Electron پورټیبل د شکمن وګڼي. که Defender `Arroxy-win-x64-Setup.exe` یا `Arroxy-win-x64-Portable.exe` قرنطین کوي، له **Windows Security → Virus & threat protection → Protection history** بیرته راولئ، بیا د Arroxy اجرایوي د مجاز توکي تحت **Manage settings → Add or remove exclusions** ووهئ. لکه SmartScreen، محرک د غیر موجوده خپرندې لاسلیک دی، نه کشف شوی malware.",

  dl_macos_first_h3: "macOS لومړی پیل",
  dl_macos_intro:
    "Arroxy لاهم د macOS لپاره کوډ لاسلیک شوی نه دی، نو Gatekeeper ښايي له DMG څخه د نصب وروسته وېرونکی *\"Arroxy.app is damaged and can't be opened\"* ډیالوګ وښيي. دا پیغام مانا لري چې macOS بې لاسلیکه app quarantine کړی؛ دا مانا نه لري چې د app فایلونه رښتیا خراب دي. په اوسني macOS کې باوري حل Terminal دی:",
  dl_macos_sequoia_h4: "د اوسني macOS لپاره Terminal فکس",
  dl_macos_sequoia_intro:
    "Arroxy Applications ته له کاپي کولو وروسته Terminal وکاروئ:",
  dl_macos_sequoia_step1:
    "د نصب شوي DMG نه `Arroxy.app` د `/Applications` ته ډریګ کړئ.",
  dl_macos_sequoia_step2:
    "Terminal پرانیزئ او دا دوه قوماندې وچلوئ:",
  dl_macos_sequoia_step3:
    "د Arroxy د پیل لپاره `open /Applications/Arroxy.app` وچلوئ.",
  dl_macos_sequoia_step4:
    "که د app لاره بله وي، `/Applications/Arroxy.app` د نصب شوې لارې سره بدله کړئ.",
  dl_macos_sonoma_h4: "د زاړه macOS لپاره Terminal فکس",
  dl_macos_sonoma_step1:
    "د نصب شوي DMG نه `Arroxy.app` د `/Applications` ته ډریګ کړئ.",
  dl_macos_sonoma_step2:
    "Terminal پرانیزئ او quarantine له `/Applications/Arroxy.app` څخه لرې کړئ.",
  dl_macos_sonoma_step3:
    "له quarantine لرې کولو وروسته Arroxy له Terminal یا Finder څخه پیل کړئ.",
  dl_macos_damaged_h4:
    "د Gatekeeper quarantine فکس",
  dl_macos_damaged_p:
    "لومړۍ قومانده ستاسو د نصب شوي Arroxy له نسخې څخه quarantine attribute لرې کوي. دویمه app پیلوي. `sudo` ښايي ستاسو د Mac پاسورډ وغواړي؛ Terminal د لیکلو پر وخت حروف نه ښيي.",
  dl_macos_arch_note:
    "**Apple Silicon د Intel پرتله:** پر M-series Mac (M1 / M2 / M3 / M4)، `arm64` DMG ډاونلوډ کړئ. پر Intel Mac، `x64` DMG ډاونلوډ کړئ. د غلط جوړونې چلول د Rosetta له لارې لاهم کار کوي خو د پام وړ ورو دي.",

  dl_linux_first_h3: "Linux لومړی پیل",
  dl_linux_appimagelauncher:
    "**د ډیسکټاپ اختیاري یوځای کول:** یو ځل [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) نصب کړئ، او هر AppImage چې تاسو دوه ځله کلیک کوئ اتوماتیک ستاسو د لانچر مینو کې ثبتیږي — هیڅ لاسي `.desktop` فایل ته اړتیا نشته.",

  dl_verify_h3: "خپل ډاونلوډ تصدیق کړئ (SHA256)",
  dl_verify_intro:
    "هره خپرونه د binary سره یوځای `SHA256SUMS` فایل خپروي. د دې لپاره چې ستاسو ډاونلوډ د لیږد پر مهال خراب یا لاسوهنه شوی نه دی، خپل فایل ځایي کشف کړئ او د `SHA256SUMS` کرښه سره یې سمول کړئ. د وروستۍ خپرونې پاڼه خلاص کړئ → **Assets** → `SHA256SUMS` ډاونلوډ کړئ.",
  dl_verify_win_label: "Windows (PowerShell یا Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "د دریمې ډلې malware سکن غواړئ؟ فایل [VirusTotal](https://www.virustotal.com) کې اپلوډ کړئ. د کوچنیو انجنونو لخوا د عمومي اټکل کولو بیرغونه لږ شمیر د بې لاسلیکه Electron اپلیکیشنونو لپاره نورمال دي؛ د لوی انجنونو لخوا پراخه کشف کول به واقعي اندیښنه وي.",

  dl_pm_intro:
    "ایا لا مخکې پیکیج مدیر کاروئ؟ تاسو کولی شئ لاسي ډاونلوډ لار پریږدئ.",

  privacy_p1:
    "ډاونلوډونه مستقیما د [yt-dlp](https://github.com/yt-dlp/yt-dlp) له لارې له YouTube څخه هغه فولډر ته راوړل کیږي چې تاسو انتخاب کوئ — هیڅ شی د دریمې ډلې سرور له لارې نه تیریږي. د لیدلو تاریخ، ډاونلوډ تاریخ، URL، او د فایل منځپانګه ستاسو وسیله کې پاتې کیږي.",
  privacy_p2:
    "هیڅ ټیلیمیټري نشته — په ورځ کې یوازې یو ناپیژندلی سیګنال: د اپ نسخه، OS، ژبه، د نصب چینل او هېواد، ترڅو موږ فعال کاروونکي وشمېرو. هیڅ ID، URLs، د ویډیو سرلیکونه، د فایل لارې یا د اکاونټ معلومات نشته. تاسو یې په Settings کې بندولی شئ.",
  privacy_p3:
    "Explore خپل sign in ساتي، ستاسو له browser جلا، او Arroxy هیڅکله د sign in فورمه نه لولي او نه یې ډکوي — تاسو د Google په خپله پاڼه کې ټایپ کوئ. ډاونلوډونه له sign in پرته چلېږي؛ یوازې کله چې یو ډاونلوډ په داسې ډول ناکام شي چې اکاونټ یې سمولی شي، Arroxy sign in بیا لولي، د هغه ډاونلوډ لپاره یې په موقت فایل کې ساتي، او وروسته فایل ړنګوي. په Settings کې له Explore څخه sign out دا هېروي.",
  faq_q1: "ایا دا واقعیا وړیا ده؟",
  faq_a1: "هو — د MIT جواز، هیڅ پریمیم کچه، هیڅ د ځانګړتیا محدودیت نشته.",
  faq_q11: "Arroxy له نورو yt-dlp GUIs څخه څه توپیر لري؟",
  faq_a11:
    "ډېری وړیا yt-dlp GUIs داسې wrappers دي چې یوازې لینک اخلي. Arroxy **Explore** ورزیاتوي، د اپلیکیشن دننه جوړ شوی YouTube browser: تاسو پرته له لینکونو کاپي کولو ګورئ او ډاونلوډ کوئ، او هلته یو ځل sign in کوئ ترڅو شخصي، یوازې د غړو او د عمر محدودیت لرونکې ویډیوګانې او خپل Watch Later او Liked لیستونه ډاونلوډ کړئ، پرته له دې چې کوکیز صادر کړئ. کله چې YouTube وغواړي تاسو تایید کړئ چې bot نه یاست، Arroxy همدا sign in کاروي، او د هغه دننه browser د YouTube د ډاونلوډ ټوکن ترلاسه کوي ترڅو ډاونلوډونه لږو فارمټونو ته را ونه لوېږي. [ولې Arroxy](#why) وګورئ.",
  faq_q2: "کومې ویډیو کیفیتونه ډاونلوډ کولی شم؟",
  faq_a2:
    "هر هغه شی چې YouTube وړاندې کوي: 8K (4320p)، 4K UHD (2160p)، 1440p، 1080p، 720p، 480p، 360p، او یوازې اوډیو. 60 fps او HDR سټریمونه لکه چې دي ساتل کیږي، او ګام په ګام ډاونلوډ تاسو ته اجازه درکوي چې په هر ریزولوشن کې AV1، VP9 یا H.264 وټاکئ.",
  faq_q3: "ایا کولی شم یوازې اوډیو د MP3 په توګه وباسم؟",
  faq_a3:
    "هو. د format menu کې *یوازې آډیو* وټاکئ او بیا MP3، M4A/AAC، Opus یا WAV غوره کړئ.",
  faq_q4: "هغه ویډیوګانې څنګه ډاونلوډ کړم چې د YouTube اکاونټ ته اړتیا لري؟",
  faq_a4:
    "په Explore ټب کې یو ځل sign in وکړئ. بیا Arroxy کولی شي هغه شخصي او یوازې د غړو ویډیوګانې ډاونلوډ کړي چې ستاسو اکاونټ یې لیدلی شي، د عمر محدودیت لرونکې ویډیوګانې که اکاونټ د عمر لپاره تایید شوی وي، او ستاسو Watch Later او Liked لیستونه. دا sign in یوازې هغه وخت کاروي چې ډاونلوډ په داسې ډول ناکام شي چې اکاونټ یې سمولی شي؛ نور هر څه لکه مخکې ډاونلوډېږي. دا د **Explore sign in** انتخاب دی، چې د کوکیز په تنظیماتو کې لومړی لیست شوی او Recommended نښه لري، او Arroxy یې ستاسو لپاره لومړی ځل چې Explore پرانیزئ غوره کوي. د yt-dlp ویکي یاد کوي چې [د sign in سره اتومات کول کولی شي د ګوګل اکاونټ بیرغ کړي](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)، نو دوهم اکاونټ خوندي انتخاب دی.",
  faq_q5: "ایا کله چې YouTube یو شی بدل کوي کار کوي؟",
  faq_a5:
    "yt-dlp د لانچ پر مهال اتومات تازه کیږي، او Arroxy هغه وخت چې YouTube یو شی بدل کړي په چټکۍ سره فکسونه لیږدوي. کله چې YouTube وغواړي تاسو تایید کړئ چې bot نه یاست، که تاسو په Explore کې sign in کړی وي Arroxy ستاسو Explore sign in هم هڅوي، او د فایل یا browser کوکیز د کوکیز په تنظیماتو کې شته.",
  faq_q6: "Arroxy د کومو ژبو لپاره شته دی؟",
  faq_a6:
    "{{LANG_COUNT}} ژبې له مخکې چمتو دي: {{LANG_NAME_LIST}}. Arroxy په لومړي پیل کې ستاسو د عملیاتي سیسټم ژبه په اتومات ډول پېژني، او تاسو یې هر وخت د تولبار د ژبې له ټاکونکي څخه بدلولای شئ. Runtime locale JSON په src/shared/i18n/locales/ کې دی، او د ژباړونکو PO catalog په i18n/locales/ کې دی — د مرستې لپاره په GitHub کې PR پرانیزئ.",
  faq_q7: "ایا ما ته بل شی نصب کولو ته اړتیا ده؟",
  faq_a7:
    "نه. yt-dlp، ffmpeg او ffprobe د لومړي پیل پر مهال اوتومات ډاونلوډ او ستاسو په ماشین کې کېچ کېږي. له دې وروسته، کوم اضافي ترتیب ته اړتیا نشته.",
  faq_q8: "ایا کولی شم پلیلیسټونه یا ټول چینلونه ډاونلوډ کړم؟",
  faq_a8:
    "هو — دواړه. د playlist یا channel URL پیسټ کړئ (لکه `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`)؛ وټاکئ چې څو entries scan شي، بیا ټول لیست queue کړئ یا ځانګړي ویډیوګانې وټاکئ. د date-range filters ژر راځي.",
  faq_q9: 'macOS وايي "اپ خرابه ده" — څه وکړم؟',
  faq_a9:
    "دا macOS Gatekeeper دی چې بې لاسلیکه app بندوي، واقعي زیان نه دی. د quarantine لرې کولو او Arroxy پیلولو لپاره د Terminal قوماندې په [macOS first launch](#macos-first-launch) کې وګورئ.",
  faq_q10: "ایا د YouTube ویډیوز ډاونلوډ کول قانوني دي؟",
  faq_a10:
    "د شخصي، خصوصي کارولو لپاره دا معمولا ډیرو قضایي سیمو کې منل کیږي. تاسو د YouTube د [د کارولو شرایطو](https://www.youtube.com/t/terms) او د خپل ځایني د کاپي رایټ قوانینو سره مطابقت لرل ستاسو مسؤلیت دی.",
  plan_intro: "لا هم پلان شوي — نږدې د لومړیتوب په ترتیب:",
  plan_col1: "ځانګړتیا",
  plan_col2: "توضیح",
  plan_r1_name: "**د پلیلیسټ او چینل فیلترونه**",
  plan_r1_desc: "د playlist یا channel د شمېرلو پر مهال date-range filters",
  plan_r2_name: "**د YouTube د غږ ټریک غوره توبونه**",
  plan_r2_desc:
    "کله چې YouTube څو غږیز ټریکونه وړاندې کوي، د ټول app لپاره د خبرې ژبې track غوره توب وټاکئ او د هر profile لپاره override وکړئ",
  plan_r3_name: "**غښتلی retry recovery**",
  plan_r3_desc:
    "د بې ثباته یا ستونزمن internet connection له امله د پرې شویو ډاونلوډونو لپاره نوی retry لاره",
  plan_r4_name: "**بشپړ download manager drawer**",
  plan_r4_desc:
    "د queue drawer بشپړ manager ته اړول، د queued items لپاره destination folder بدلولو په ګډون",
  plan_r5_name: "**مهالویش شوي ډاونلوډونه**",
  plan_r5_desc: "کیو د ټاکلي وخت کې پیل کړئ (شپه اجرا کول)",
  plan_r9_name: "**د AUR کڅوړه**",
  plan_r9_desc: "په Arch Linux او Omarchy کې د `yay -S arroxy-bin` سره نصب کړئ",
  plan_cta:
    "ذهن کې کومه ځانګړتیا لرئ؟ [یوه غوښتنه خلاصه کړئ](../../issues) — د ټولنې ننوتل لومړیتوب ورکوي.",
  tech_content: TECH_CONTENT,
  support_h2: "Arroxy ملاتړ وکړئ",
  support_note: "Arroxy وړیا دی او د MIT جواز لري — نه اعلانونه، نه ټیلي‌مېټري، او نه د پیسو نسخه. که ستاسو وخت خوندي کوي، کولی شئ د Bitcoin، Tron یا Ethereum له لارې یې پرمختګ ملاتړ کړئ: پتې په [DONATE.md](DONATE.md) کې دي، چې د هغوی یوازینۍ رسمي سرچینه ده. Arroxy به تاسو ته هیڅکله د بریښنالیک یا مستقیم پیغام له لارې پته وا نه لېږي. ریپو ته ستوری ورکول، د ستونزو راپور ورکول او د ژباړو ښه کول هم په همدې اندازه ګټور دي.",
  tos_h2: "د کارولو شرایط",
  tos_note:
    "Arroxy یوازې د شخصي، خصوصي کارولو لپاره یوه وسیله ده. تاسو یوازې مسؤل یاست چې ستاسو ډاونلوډونه د YouTube د [د کارولو شرایطو](https://www.youtube.com/t/terms) او ستاسو د قضایي سیمې د کاپي رایټ قوانینو سره مطابقت لري. د Arroxy د ډاونلوډ، تکرار، یا د هغه منځپانګې توزیع لپاره مه کاروئ چې تاسو حق نه لرئ وکاروئ. پراختیا کونکي د هر ناسم کارولو لپاره مسؤل نه دي.",
  footer_credit:
    'MIT License · د مینې سره جوړ شوی <a href="https://x.com/OrionusAI">@OrionusAI</a> لخوا',
};
