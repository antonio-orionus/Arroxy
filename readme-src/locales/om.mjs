const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop wantoota hundaaf kan hojetu
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — kallattii
- **Zustand** — bulchiinsa haala
- **yt-dlp** + **ffmpeg** — injinii buusuu fi walitti makuu (lamaan isaanii runtime irratti fudhatamu: yt-dlp haaraa ta'ee tursiifama, ffmpeg/ffprobe altokko qofa fe'amee fooyya'iinsa booda illee turu)
- **Vite** + **electron-vite** — meeshaalee ijaarsaa
- **Vitest** + **Playwright** — qormaata unit fi end-to-end

</details>

<details>
<summary><strong>Madda irraa ijaari</strong></summary>

### Wantoota barbaachisaa — platformoota hundaaf

| Meeshaa | Verzhiyoonii | Fayyadu |
| ------- | ------- | ------- |
| Git     | kamiyyuu | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` yookaan \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` yookaan \`package.json\` \`packageManager\` |

Kan gorfamu: \`mise\` fe'i, sana booda checkout keessatti \`mise install\` hojjedhu. Mise malee, \`bun run bootstrap\` dura Node.js \`.node-version\` irraa fi Bun \`package.json\` irraa harkaan hojiirra oolchi.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Native rebuilds'f Visual Studio Build Tools fi Python barbaachuu danda'u.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Erga clone gootee booda checkout keessatti \`mise trust && mise install\` hojjedhu. Yoo shell kee duraan \`fnm\`, \`nvm\`, ykn Homebrew Bun fayyadama ta'e, Arroxy Node.js 24.21.0 fi Bun 1.4.2 akka fayyadamuuf \`~/.zshrc\` keessatti mise kakaasi:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Build fi Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clone fi itti fayyadami

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # kan gorfamu; pinned tools harkaan hojiirra oolchan yoo ta'e dhiisi
bun run bootstrap
bun run doctor
bun run dev            # Electron app Vite renderer waliin
\`\`\`

### Faayila rabsuu ijaari

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # OS ammaa kanaaf qindeessi
bun run dist:win     # supported host irratti Windows targets package godhi
\`\`\`

> \`bun run bootstrap\` dependencies fe'a, Electron app dependencies rebuild godha, Electron mirkaneessa, development'f embedded ffmpeg/ffprobe qopheessa, Playwright Chromium fe'a. Release builds yt-dlp, ffmpeg fi ffprobe runtime irratti app data folder keessatti manage godhu; tokkoon isaanii iyyuu installer keessa hin jiru.

</details>`;

export const om = {
  icon_alt: "Arroxy mascot",
  title:
    "Arroxy — Buufataa YouTube (+ Saayitii 2000) Bilisaa fi Madda Banaa, Ilaalaa Keessaa Qabu, Windows, macOS & Linux",
  read_in_label: "Afaan:",
  badge_release_alt: "Baasii",
  badge_build_alt: "Ijaarsaa",
  badge_license_alt: "Hayyama",
  badge_platforms_alt: "Platformoota",
  badge_i18n_alt: "Afaanonni",
  badge_website_alt: "Marsariitii",
  discord_badge_text: "Hawaasa Discord itti makami",
  discord_badge_encoded: "Hawaasa%20Discord%20itti%20makami",
  hero_desc:
    "Viidiyoo, Shorts, muuziqaa, chaanaalota, podkaastota, ykn sagalee **YouTube fi saayitiiwwan 2000+** irraa buufi — hanga 8K HDR 60 fps, MP3 / AAC / Opus, ykn kutaa barbaaddu qofa. Tabii Explore keessatti **YouTube ykn marsariitii biraa Arroxy keessatti ilaali** fi viidiyoo, playlist, ykn channel ati ilaaltu buufadhu; achitti seenuun viidiyoowwan dhuunfaa, miseensoota qofaaf, fi umuriin daangeffaman kan akkaawuntiin kee ilaaluu danda'u buufadhu. Windows, macOS, fi Linux irratti naannoo kee keessatti hojeta. **Beeksisni hin jiru, wanti dabalataa hin jiru, gurguurtaan dabalaataa hin jiru.**",
  cta_latest: "↓ Baasii Haaraa Buusi",
  cta_website: "Marsariitii",
  star_cta:
    "Arroxy yeroo si oolfate, ⭐ tokko kan biroo argachuu isaaniif gargaara.",
  ai_notice: "",
  toc_heading: "Qabiyyee",
  why_h2: "Maaliif Arroxy",
  features_h2: "Amaloota",
  dl_h2: "Fe'iitii yeroo jalqabaa banuu",
  privacy_h2: "Icciitii",
  faq_h2: "Gaaffilee Deddeebii",
  roadmap_h2: "Karoora",
  tech_h2: "Waan itti Ijaare",
  why_intro:
    "Waltajjii maayyii walitti bira qabuu filannoolee beekamoo wajjin:",
  why_r1: "Bilisaa, sadarkaa kafaltii hin qabu",
  why_r2: "Madda banaa",
  why_r3: "Naannoo keessatti qofa hojeta",
  why_r5: "Daangaa fayyadama hin qabu",
  why_r6: "App desktop platformoota hundaaf",
  why_r7: "Subtitle + SponsorBlock",
  why_r8: "Biraawzara app keessatti ijaarame (ilaali, seeni, buusi)",
  why_r9: "Viidiyoowwan dhuunfaa, miseensoota qofaaf fi umuriin daangeffaman kuukkii utuu hin baasin",
  why_table_note:
    "⚠️ = gartokkeen, ykn sadarkaa kafaltii qofa irratti. 4K Video Downloader keessatti seensi app keessaa viidiyoowwan dhuunfaaf amala kafaltiiti; GUI yt-dlp bilisaa baay'een faayila kuukkii qofa fudhatu ykn kuukkii biraawzara weebii keetii dubbisu.",
  why_summary:
    "Arroxy waan tokko qofaaf ijaarame: faayila naannoo qulqulluu, URL maxxansitees ykn viidiyoo Explore keessatti argattees. Gurgurtaa dabalataa hin jiru, odeeffannoo walitti qabuu hin jiru.",
  why_explore_h3: "Waan wraapperiin yt-dlp salphaan hin dandeenye: tabii Explore",
  why_explore_intro:
    "Buufattoota YouTube bilisaa baay'een saanduqa URL yt-dlp irratti kaa'ame qofa. Arroxy'n yt-dlp ni fayyadama, garuu **Explore** illee qaba, biraawzara app keessatti ijaarame kan YouTube ykn marsariitii biraa banu. Explore daangaa kan saanduqni URL darbuu hin dandeenye ni darba:",
  why_explore_1:
    "**Viidiyoowwan akkaawuntii barbaadan, kuukkii utuu hin baasin** — viidiyoowwan dhuunfaa, miseensoota qofaaf, fi umuriin daangeffaman (akkaawuntii umuriin isaa mirkanaa'e irratti), akkasumas tarreewwan Booda Ilaali fi Jaallatamte kee, fi viidiyoowwan marsariitiiwwan biraa irratti seensa duubatti jiran. Wraapperiin salphaan cookies.txt baasuu barbaada ykn kuukkii biraawzara weebii keetii dubbisuu qaba, kunis amma Windows irratti Chrome'n ni dhorka. Arroxy keessatti Explore keessatti altokko seenta, kan hafe isatu hojjeta",
  why_explore_2:
    "**\"Bot akka hin taane mirkaneessuuf seeni\"** — YouTube yeroo kana gaafatu, Arroxy kufuu mannaa seensa Explore keetiin buufannaa irra deebi'ee yaala",
  why_explore_3:
    "**Tokenii buufannaa YouTube** — biraawzarri Arroxy keessatti ijaarame tokenii YouTube buufannaa dura eegu ni argata. Isa malee, YouTube formaata xiqqaa fi qulqullina waan ati gaafatte gadi aanu kennuu danda'a",
  why_explore_4:
    "**Hidhaa garagalchuun hin barbaachisu** — Explore keessatti viidiyoo, playlist, ykn channel barbaadiitii tuqaa tokkoon buusi, ykn fuula irratti hidhaa kamiyyuu mirgaan cuqaasi",
  why_explore_5:
    "**Yeroo barbaaddu dhorkaa beeksisaa** — gaachana tuquun fuula Explore irratti beeksisaa fi hordoftoota ni dhorka",
  feat_explore_h3: "Explore: Weebii Arroxy keessatti ilaali",
  feat_explore_1: "**Tabii Explore** — YouTube ykn marsariitii biraa Arroxy keessatti ilaaluudhaan waan argatte hidhaa waraabuu malee buufadhu. **Buusi · *piroofaayilii kee*** viidiyoo, playlist, ykn channel ati ilaaltu tarree keessa galcha; xiyyi isa cinaa piroofaayilii jijjiira, ulee falfalaa immoo buufannaa tarkaanfii-tarkaanfiidhaan formaata, barruu jalaa fi kkf filachuuf bana",
  feat_explore_6: "**Buusuuf mirgaan cuqaasi** — Explore keessatti hidhaa viidiyoo, playlist ykn channel kamiyyuu mirgaan cuqaasiitii piroofaayilii keetiin buusi, **Profaayiliin buusi** irraa piroofaayilii biraa filadhu, buufata tarkaanfii tarkaanfiin bani, ykn hidhaa garagalchi. Tokkoon tokkoon viidiyoo dursa banuun hin barbaachisu",
  feat_explore_7: "**Qindaa'ina gabaabaa** — Explore keessatti baarii meeshaalee irratti tuqaa tokkoon sabbata Arroxy achitti geessee fuula sanaaf bakka dabalataa kenna",
  feat_explore_2: "**Bar teessoo** — YouTube barbaaduuf barreessi, ykn teessoo weebii kamiyyuu galchiitii marsariitii sana bani",
  feat_explore_3: "**Buufannaa akkaawuntii barbaadu** — Explore keessatti altokko seeni, Arroxyn viidiyoowwan dhuunfaa fi miseensoota qofaaf kan akkaawuntiin kee ilaaluu danda'u, viidiyoowwan umurii daangeffaman yoo umurii akkaawuntii mirkanaa'e, akkasumas tarreewwan Booda Ilaali fi Jaallatamte buufachuu danda'a. Marsariitiiwwan biraa irrattis achitti seenuu ni dandeessa, buufannaan isaanii yeroo barbaachisu seensa sana fayyadama. Arroxy ammas dura utuu hin seenin buufata; yeroo buufannaan karaa akkaawuntiin sirreessuu danda'uun hin milkoofnetti qofa seensa Explore kee fayyadama. YouTube bot akka hin taane akka mirkaneessitu yoo gaafate, Arroxy seensa Explore kee illee ni yaala",
  feat_explore_4: "**Akkaawuntii lammaffaa fayyadami** — fuula jalqabaa Explore sababa ibsa: akkaawuntiidhaan buufachuun balaa akkaawuntiin sun daangeffamuu tokko of keessaa qaba. Seensawwan hunda irraanfachuu yeroo barbaadde Qindoomina keessaa Explore irraa bahi",
  feat_explore_5: "**Dhorkaa beeksisaa** — Durtiidhaan cufaadha. Explore kaaba meeshaa irratti gaachana tokko tuquun fuula isaa irratti beeksisaa fi hordoftoota ni dhorka; buufannaan hin tuqamu. YouTube akkaawuntiiwwan seenan irratti dhorkaa beeksisaa mormuu danda'a",
  feat_quality_h3: "Qulqullina & formatoota",
  feat_quality_1: "Hanga **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2:
    "**Frame rate ol'aanaa fi HDR** akka jiranitti eegamu — 60 fps, HDR10",
  feat_quality_3:
    "**Sagalee** — sagalee qofa gara MP3, M4A/AAC, Opus yookaan WAV export godhi. Buufataalee wal-qunnamtii keessatti, yoo jiran, sirna sagalee surround/Dolby maddaa (AC-3, E-AC-3, 5.1, DRC) filadhu, yookaan durtii waliigalaa **Surround / Dolby filadhu** kaa'i",
  feat_quality_4:
    "**Piroofaayilii kaayyoo qabu** — *Suuraa isa caalu* (AV1 · VP9) ykn *TV smart* (MP4 · H.264), Ofumaa, MP4, MKV, ykn WebM ta'ee deebi'ee koodii gochuu malee olkaa'ama. HDR *Ofumaa* (ispiriin kee yoo agarsiisuu dandeessu qofa), *SDR*, ykn *HDR* dha",
  feat_quality_5:
    "**Koodekii hunda ifa bal'ina hunda irratti** — buufanni tarkaanfii tarkaanfiin AV1, VP9 fi H.264 ifa bal'ina tokkoon tokkoon irratti walbira tarreessa, kanaaf isa TV ykn gulaalaan kee taphachiisu filachuu dandeessa",
  feat_quality_6:
    "**Stream tokko dhugumaan maal akka ta'e beeki** — hammoota YouTube AI'n guddise, afaanota sagalee AI'n hiikaman, streams bitrate fooyya'e qaban, viidiyoowwan 360° fi garagalchawwan miidhaman ykn mallattoo bishaanii qaban ni mallattoo'u. Piroofaayiloonni yoo ati hin heyyamne malee streams AI'n guddifaman ni darbu",
  feat_privacy_h3: "Icciitii & to'annaa",
  feat_privacy_1:
    "100% naannoo keessatti hojeta — buufannoon kallattiin YouTube irraa disiki kee dhaqa",
  feat_privacy_2:
    "Seensuu hin jiru, kuukkii hin jiru, akkaawuntii Google waliin hin hidhu",
  feat_privacy_3: "Faayiloonni kallattiin foldera filatteen seenu",
  feat_workflow_h3: "Hojii hordoffii",
  feat_workflow_12: "**Qabduu ariifachiisaa buufannaa waliigalaa** — appii kamiyyuu keessatti hidhaa waraabii `Ctrl+Shift+D` (macOS irratti `Cmd+Shift+D`) tuqi; Arroxy foddaa utuu hin banin piroofaayilii kee kan hojiirra jiruun tarree keessa galcha, beeksisnis ni mirkaneessa. Durtiidhaan banaa, irra deebi'anii qindeessuun ni danda'ama",
  feat_workflow_1: "**Haalawwan jalqabaa jijjiiramaa** — buusuu tokko qajeelfamaan, filannoo playlist/channel, URL hedduu maxxansuu, Quick Download filannoowwan duraan kuufamaniin, ykn Explore irraa ilaaluu fi buufachuu filadhu",
  feat_workflow_2:
    "**Tarree buusuu giddugaleessaa** — hojii tokko, playlist, bulk, ykn quick hundi bakka tokkotti walitti dhufa: adeemsa, dhaabuu, itti fufsiisuu, haquu, irra deebi’uu, fi dursa to’achuuf",
  feat_workflow_3:
    "**Eegaa clipboard** — hidhaa viidiyoo koppii godhi, yeroo gara Arroxy deebitu bakka URL ni guuta, yoo itti hin yaadin ta'e **Deebisi** waliin. Yeroo Arroxy hojiin qabamu, hidhaan hanga ati gara tabii URL deebitutti eega (Qindaa'inoota keessatti cufi)",
  feat_workflow_4:
    "**URL of-qulqulleessa** — params hordoffii (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) haqa fi linkiiwwan `youtube.com/redirect` bana",
  feat_workflow_5:
    "**Haala tray** — window cufuu buufannoo duubatti itti fufsisee hojechisisa",
  feat_workflow_6:
    "**Afaanota {{LANG_COUNT}}** — locale sirnaa ofumaan adda baasa, yeroo kamiyyuu jijjiiramuu danda’a",
  feat_workflow_7:
    "**Walsimsiisa playlist** — viidiyoowwan duraan buufaman akka darbaman playlist galmee naannoo waliin irra deebi'ee sakatta'a; faayila playlist `.m3u` viidiyoon tokko tokko buufamu hunda irratti haaromsamu uuma",
  feat_workflow_8:
    "**To'annoo saffisaa fi pacing** — bandwidth buusuu daangessi, kutaaleen viidiyoo meeqa yeroo tokkotti akka buufaman qindeessi, fi turtii gaaffii durtii (*Cufaa · Walsimaa · Of eeggannoo · Kan mataa*) waliin dabali",
  feat_workflow_9:
    "**Bocquuwwan maqaa faayilii** — `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` fi `{playlist_index}` fayyadamuun buufamawwan kee akka feetetti moggaasi, waliigalaan ykn tokkoon tokkoon piroofaayilii buufamaatiif",
  feat_workflow_10:
    "**Buufata yeroo tokkotti fi ofumaan irra deebi'uu** — buufanni tarree meeqa yeroo tokkotti akka deemu filadhu, buufata rakkoo networkii yookaan saarvarii qunname immoo Arroxy yaalii tokkoo dura dheeraa eegee irra deebi'ee haa yaalu",
  feat_workflow_11:
    "**Profaayiloota buufannaa viidiyoo playlist keessaa tokkoon tokkoon** — sirna tokko guutummaa tarreef fayyadamuu mannaa, viidiyoo playlist keessa jiru hundaaf piroofaayilii buufannaa addaa kennuu dandeessa; kanaanis dabarsa tokkoon garii qulqullina guutuun kuufamee, hafan immoo akka MP3tti fudhatamuu danda'a",
  feat_workflow_13: "**Quick Download duubatti hojjeta** — hidhaan battaluma Buufata keessatti mul'ata achittis qophaa'a, ergaan **Ilaali** qabu ni mirkaneessa, bakki URL immoo hidhaa itti aanuuf qulqullaa'a. Kanneen duraa utuu qophaa'aa jiranii kan feete baay'ee jalqabi",
  feat_workflow_14: "**Buufata maal akka si barbaaduu sitti hima** — Arroxy hidhaa dubbisuu yoo hin dandeenye, sarara isaa sababa ibsee furmaata dhiyeessa: Irra deebi'i, kuukkii bani, ykn Explore keessatti seeni. Kuukkiin yeroo cufamu, **Explore'n seeni** erga seentee booda siif irra deebi'a. Playlist daangaa fe'uu kee caalu sarara isaa irratti eegaa jira, hunda, kan jalqabaa ykn ilaalcha akka filattu. Tabiin Buufata sarara si eegaa jiru lakkaa'a",
  feat_workflow_15:
    "**Kutaa viidiyoo tokko qofa buufadhu** — much'aa Foormaatii irratti jalqaba fi xumura, ykn boqonnaa filadhu, Arroxy ardii kana qofa olkaa'a; maqaan isaas id viidiyoo booda ardii kanaan moggaafama. Muruun keyframe isa dhiyoo irratti kufa; muruu sirrii banuun immoo deebisee koodii godha",
  feat_workflow_16:
    "**Buufata xumuraman ofumaan haqi** — filannoo: buufanni xumurame sekondii 5 booda tarreeffama keessaa ba'a. Faayiloonni isaa kuufama irra turu, buufanni kufe immoo tarreeffama keessa ni jiru",
  feat_workflow_17:
    "**Bal'ina fi Hin jiru Buufata keessatti** — gabatee **Bal'ina** tartiibaan qindeessuun buufanni tokkoon tokkoon bakka hammam fudhatu agarsiisa, **Hin jiru** immoo faayiloota Arroxy alaa sochoo'an ykn haqaman mallattoo godha",
  feat_workflow_18:
    "**Aurora ykn Salphaa, dukkana ykn ifa** — paanaala galaasaa samii socho'u irra jiru, ykn gar-fuula cimaa callisaa; gadi-fuula irraa jijjiiri. Kompiitaroonni saffisiisaa giraafiksii hin qabne ofumaan Salphaa argatu",
  feat_workflow_19:
    "**Baarii menu Mac** — macOS irratti, baarii menu irraa Qindaa'inoota (`Cmd+,`) bani, daangaa saffisa buufannaa kaa'i, taatee fi tiimii jijjiiri, galmee bani ykn faayilii qorannoo olkaa'i",
  feat_workflow_20:
    "**Buufata kamirraayyuu piroofaayilii jijjiiri** — buufata tokko sirreessi, achiis piroofaayilii inni irraa jalqabe haaromsi (wanta jijjiiramu dursitee ilaaluun) ykn qindaa'inoota akka piroofaayilii haaraatti olkaa'i. Piroofaayilii yeroo jijjiirtu, sirreeffamoota kee eeguu barbaadduu akka ta'e si gaafata",
  feat_post_h3: "Subtitle & seensuu boodaa",
  feat_post_1:
    "**Subtitles** SRT, VTT, ykn ASS keessatti — harka ykn of-hojeetee, afaan kamiyyuu argamu keessatti",
  feat_post_2:
    "Viidiyoo cinaa kuusi, `.mkv` keessatti maksi, ykn foldara `Subtitles/` keessatti qindeessi",
  feat_post_3:
    "**SponsorBlock** — beeksisa, seensa, xumura, of-daldala naanna'i ykn boqonnaa godhi",
  feat_post_4:
    "**Metadata makame** — mata-duree, guyyaa olkaa'uu, chaanaalii, ibsaa, suuraafi boqonnaa mallattoota faayila keessatti barreessa",
  feat_post_5:
    "**Tuuta axxiinii qofa** — tarree URL maxxansi ykn tarree taphaa bani, Axxiinii filadhu, viidiyoo hundaafis faayiloota axxiinii qofa argadhu",
  feat_sites_h3: "YouTube + Saayitii 2000",
  feat_sites_1:
    "**YouTube guutummaatti** — Viidiyoowwan, Shorts, Chaanaalota, Playlistoota, YouTube Music fi Podkaastota madda sadarkaa jalqabaa ta'aniin hojjetamu",
  feat_sites_2:
    "**Saayitiiwwan 2000+ biroo** yt-dlp fayyadamuudhaan — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable fi kanneen biroo heddu",
  feat_sites_3:
    "**Audio qofa fi subtitle** saayitii deeggara hunda irratti hojjeta, YouTube qofa irratti miti",
  feat_sites_4:
    "Saayitiin yoo jijjiirames, yt-dlp torban hunda sirreessa erga, Arroxy immoo binary-n yeroo eegaluu ofumaan haaromsa",
  shot1_cap:
    "<b>Fuula Buufata saffisaa</b><br/>URL maxxansiitii profaayilii kee kan socho'aadhaan battalumatti buufadhu",
  shot2_cap:
    "<b>Profaayiloota buufannaa irra deebi'anii fayyadaman</b><br/>Bocaa, qulqullinaa fi bahii akka durtii olkaa'i — buufannaa hundaaf irra deebi'ii fayyadami",
  shot3_cap:
    "<b>Sirna sagalee afaan baay'ee</b><br/>Afaan sagalee sirrii viidiyoon qabu filadhu",
  shot4_cap:
    "<b>Sagalee Surround / Dolby</b><br/>Sirni 5.1 fi Dolby ni adda baafamu, ni eegamu",
  shot5_cap:
    "<b>Haala URL baay'ee</b><br/>Tarree maxxansi, irra deebii ofumaan haqi, hunda yeroo tokkotti tarreessi",
  shot6_cap:
    "<b>Tarree buufannaa walqixaa</b><br/>Buufannaa hedduu yeroo tokkotti, guddina kallattiidhaan",
  hotkey_fig_alt: "Qabduu ariifachiisaa buufannaa waliigalaa Arroxy — Windows fi Linux irratti Ctrl+Shift+D, macOS irratti Cmd+Shift+D, hidhaa waraabame kallattiin tarree buufannaatti erga",
  hotkey_fig_cap: "<b>Qabduu ariifachiisaa buufannaa waliigalaa</b><br/>Bakka kamiyyuu hidhaa waraabi, altokko tuqi — tarree seenee buufamuu jalqaba",
  shot7_cap: "<b>Profaayilii viidiyoo playlist tokkoon tokkoon</b><br/>Viidiyoo hundaaf profaayilii mataa isaa kenni — garii 4K'n kuusi, hafan MP3'n fudhu",
  shot8_cap: "<b>Explore</b><br/>YouTube ykn marsariitii biraa Arroxy keessatti ilaali, fuula irra jirtu piroofaayilii hojiirra jiruun buufadhu",
  shot9_cap: "<b>Fuula jalqabaa Explore</b><br/>Explore ilaalcha gabaabaa, akkasumas maaliif akkaawuntiin lammaffaan seensa nageenya qabeessa ta'e",
  shot10_cap: "<b>Buufata maal akka si barbaaduu sitti hima</b><br/>Hidhaawwan duubatti qophaa'u; kan hin milkoofne furmaata dhiyeessa, playlist dheeraan filannoo kee eega",
  shot11_cap: "<b>Kutaa viidiyoo tokko qofa buusi</b><br/>Jalqabaa fi dhumaa, yookaan boqonnaa filadhu — Arroxy kutaa sana qofa kuusa",
  shot12_cap: "<b>Gulaalaa piroofayilii</b><br/>Piroofayilii sirreessi: gosa faayilii, gulaalummaa, hiikkaa jalqabaa, bakka kuusaa, qophii maqaa faayilii fi kkf",
  shot13_cap: "<b>Dukkana moo ifa, galaasaa moo cimaa</b><br/>Mul'ata afur filachuu dandeessu: paanaalii galaasaa samii socho'u irra jiru yookaan fuula cimaa callisaa, tokkoon tokkoon isaanii dukkanaa fi ifaan",
  dl_platform_col: "Platform",
  dl_format_col: "Format",
  dl_oneline_note:
    "Gosti x86_64 qofa. `curl` hin qabduu? `curl -fsSL` bakka `wget -qO-` fayyadami.",
  dl_win_scoop:
    "Scoop filattaa? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
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
    'Jalqaba banuu irratti **"Windows protected your PC"** ykn **"Unknown publisher"** arguu dandeessa. Kun `Arroxy-win-x64-Setup.exe` fi `Arroxy-win-x64-Portable.exe` lameeniifuu hojjeta. Arroxy bilisaa fi madda banaa dha, ijaarsonni Windows mallattoo kafaltii hin qabne waliin hin mallatteffamne, kanaafuu SmartScreen mallattoo isaanirratti kaa\'a. Kun Arroxy nageenya hin qabu **jechuuf** of-hordofaan miti. Itti fufuuf:',
  dl_win_smartscreen_step1: "**More info** cuqaasi.",
  dl_win_smartscreen_step2: "**Run anyway** cuqaasi.",
  dl_win_smartscreen_official:
    "Arroxy fuula GitHub Releases mirkaneessaatii qofa buufi. Faayila marsariitii biraatii argatte ykn namni tokko si erge yoo ta'e, haqii fi ganda mirkaneessaatii faayila haaraa buufi. Koodii madda ummataadhaan banaa waan ta'eef, of irraadhaa sakatta'uu ykn Arroxy of irraadhaa ijaaru dandeessa.",
  dl_macos_h3: "macOS irratti yeroo jalqabaa eegaluu",
  dl_macos_warning:
    "Arroxy ammallee mallattoo hin qabdu, kanaaf macOS Gatekeeper yeroo jalqabaa banuutti akeekkachiisa app miidhame jedhu agarsiisuu danda'a. Kun kan eegamu dha — faayiliiwwan dhugumaan miidhaman jechuu miti.",
  dl_macos_m1_h4: "Mala Terminal:",
  dl_macos_step1: "`Arroxy.app` DMG irraa gara `/Applications` harkisi.",
  dl_macos_step2:
    "Terminal baniitii `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` hojjedhu.",
  dl_macos_step3: "`open /Applications/Arroxy.app` hojjedhu.",
  dl_macos_step4:
    "Daandiin app adda yoo ta'e, `/Applications/Arroxy.app` bakka itti feeteen bakka buusi.",
  dl_macos_step5:
    "`sudo` yoo gaafate jecha darbii Mac kee galchi.",
  dl_macos_after:
    "Quarantine erga haqamee booda Arroxy akka idileetti ni banama.",
  dl_macos_m2_h4: "Mala Terminal:",
  dl_macos_note:
    "Ijaarsi macOS CI irratti Apple Silicon fi Intel runners irratti hojjetama. Rakkoo yoo qabaatte, maaloo [gaaffii bani](../../issues) — yaada fayyadamtootaa macOS irraa yeroo hedduu qabxii qormaata macOS murteessa.",
  dl_linux_h3: "Linux irratti yeroo jalqabaa eegaluu",
  dl_linux_intro:
    "AppImages kallattiin oofuu — fayyadu hin barbaachisu. Faayila akka hojjetu galchuuf qofa mallattaa itti kaa'uun barbaachisa.",
  dl_linux_m1_text:
    "**Bulchiinsa faayilaa:** `.AppImage` mirga-cuqaasi → **Properties** → **Permissions** → **Allow executing file as program** dandeessisi, erga lama-cuqaasi.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Eegaluun yoo ammallee fashale, osoo hin fe'in isa yaasi — paakejiin FUSE hin barbaachisu:",
  dl_linux_targz_h4: "Taarboolii salphaa (FUSE hin barbaachisu, ijaarsi hin barbaachisu):",
  dl_linux_targz_text: "Ijaarsi `.tar.gz` isuma appii sanaa haguuggii AppImage malee — bakka feete baasii yaasi. Ijaarsis ta'e paakejiin FUSE hin barbaachisu.",
  dl_linux_arch_note: "**Buufannoowwan Linux fuula gadhiisaa irra jiran x86_64 qofaaf.** Maashinoota ARM64 (Raspberry Pi, Asahi Linux) irratti Flatpak ni ijaarama garuu yeroo eegalu `bwrap: execvp ldconfig: Exec format error` jedhee kufa.",
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
  dl_win_defender_h4:
    "Windows Defender faayila mallattaa itti kaa'e ykn haqe yoo ta'e",
  dl_win_defender_p:
    "Heuristics Defender sometimes flag unsigned NSIS installers fi Electron portables akka shakkisiisoo. Defender `Arroxy-win-x64-Setup.exe` ykn `Arroxy-win-x64-Portable.exe` karantinii keessa kaa'e yoo ta'e, **Windows Security → Virus & threat protection → Protection history** irraa deebi'i, erga Arroxy executable **Manage settings → Add or remove exclusions** jalatti wantoota hayyamamaniitti dabalii. SmartScreen wajjin akkuma, kasaara mallattoo maxxantii dhabuu irraa dhufa, malwaare argamuuurraa miti.",

  dl_macos_first_h3: "macOS yeroo jalqabaa eegaluu",
  dl_macos_intro:
    "Arroxy ammallee macOS'f mallattoo hin qabdu, kanaaf Gatekeeper erga DMG irraa feete booda diyalogii sodaachisaa *\"Arroxy.app is damaged and can't be opened\"* agarsiisuu danda'a. Ergaan kun macOS app mallattoo hin qabne quarantine keessa kaa'e jechuu dha; faayiliiwwan app dhugumaan miidhaman jechuu miti. macOS ammaa irratti furmaanni amanamaan Terminal dha:",
  dl_macos_sequoia_h4: "Furmaata Terminal kan macOS ammaa",
  dl_macos_sequoia_intro:
    "Arroxy gara Applications erga garagalchitee booda Terminal fayyadami:",
  dl_macos_sequoia_step1:
    "`Arroxy.app` DMG ramadame irraa `/Applications` tti harkisi.",
  dl_macos_sequoia_step2:
    "Terminal baniitii ajajoota lamaan kana hojjedhu:",
  dl_macos_sequoia_step3:
    "Arroxy banuuf `open /Applications/Arroxy.app` hojjedhu.",
  dl_macos_sequoia_step4:
    "Daandiin app adda yoo ta'e, `/Applications/Arroxy.app` bakka itti feeteen bakka buusi.",
  dl_macos_sonoma_h4: "Furmaata Terminal kan macOS durii",
  dl_macos_sonoma_step1:
    "`Arroxy.app` DMG ramadame irraa `/Applications` tti harkisi.",
  dl_macos_sonoma_step2:
    "Terminal baniitii `/Applications/Arroxy.app` irraa quarantine haqi.",
  dl_macos_sonoma_step3:
    "Quarantine erga haqamee booda Arroxy Terminal ykn Finder irraa bani.",
  dl_macos_damaged_h4:
    "Furmaata quarantine Gatekeeper",
  dl_macos_damaged_p:
    "Ajajni jalqabaa kopi Arroxy kan feete irraa amala quarantine haqa. Inni lammaffaa app banuu dha. `sudo` jecha darbii Mac kee gaafachuu danda'a; Terminal yeroo barreessitu mallattoo hin agarsiisu.",
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
    "Telemetrii hin jiru — guyyaatti mallattoo maqaa-dhabduu tokko qofa: version app, OS, afaan, karaa itti install godhame fi biyya, akka fayyadamtoota hojii irra jiran lakkoofnuuf. ID, URL, mata-duree viidiyoo, karaa faayilaa yookaan odeeffannoo account hin jiru. Settings keessatti dhaabuu dandeessa.",
  privacy_p3: "Explore seensa mataa isaa qaba, biraawzara keetii addaa, Arroxyn unka seensaa gonkumaa hin dubbisu hin guutus — ati fuula Google mataa isaa irratti barreessita. Buufannaan utuu hin seenin deemu; yeroo tokko karaa akkaawuntiin sirreessuu danda'un hin milkoofnetti qofa Arroxy seensa yeroo sana haaraatti dubbisa, buufannaa sanaaf faayilii yeroo keessatti qaba, booda faayilicha haqa. Qindoomina keessatti Explore irraa bahuun isa irraanfachiisa.",
  faq_q1: "Dhuguma bilisaa dha?",
  faq_a1:
    "Eeyyee — hayyama MIT, sadarkaa kafaltii hin jiru, amaloota dhorkamuun hin jiru.",
  faq_q11: "Arroxy GUI yt-dlp biroo irraa akkamitti adda ta'a?",
  faq_a11:
    "GUI yt-dlp bilisaa baay'een wraapperoota hidhaa qofa fudhatanii dha. Arroxy **Explore** dabala, biraawzara YouTube app keessatti ijaarame: hidhaa utuu hin garagalchin ilaaltee buufatta, viidiyoowwan dhuunfaa, miseensoota qofaaf fi umuriin daangeffaman akkasumas tarreewwan Booda Ilaali fi Jaallatamte kee buufachuuf achitti altokko seenta, kuukkii utuu hin baasin. Arroxy seensa kana yeroo YouTube bot akka hin taane akka mirkaneessitu si gaafatu fayyadama, biraawzarri isaa inni ijaarames tokenii buufannaa YouTube ni argata, kanaaf buufannaan gara formaata xiqqaatti hin deebi'u. [Maaliif Arroxy](#why) ilaali.",
  faq_q2: "Qulqullina viidiyoo maal buusuu danda'a?",
  faq_a2:
    "YouTube tajaajiluu danda'u: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, sagalee qofas. 60 fps fi HDR streams akka jiranitti eegamu, buufanni tarkaanfii tarkaanfiinis ifa bal'ina tokkoon tokkoon irratti AV1, VP9 ykn H.264 akka filattu si dandeessisa.",
  faq_q3: "Sagalee qofaa MP3 akka ta'uun baasuu danda'aa?",
  faq_a3:
    "Eeyyee. Menu format keessaa *audio qofa* filadhu, booda MP3, M4A/AAC, Opus yookaan WAV filadhu.",
  faq_q4: "Viidiyoowwan akkaawuntii YouTube barbaadan akkamitti buufadha?",
  faq_a4: "Tabii Explore keessatti altokko seeni. Yeroo sana Arroxyn viidiyoowwan dhuunfaa fi miseensoota qofaaf kan akkaawuntiin kee ilaaluu danda'u, viidiyoowwan umurii daangeffaman yoo umurii akkaawuntii mirkanaa'e, akkasumas tarreewwan Booda Ilaali fi Jaallatamte buufachuu danda'a. Seensa sana yeroo buufannaan karaa akkaawuntiin sirreessuu danda'uun hin milkoofnetti qofa fayyadama; kan hafe hundi akka duraan buufama. Kun filannoo **Seensa Explore** dha, qindoomina kuukkii keessatti jalqabaatti tarreeffamee Kan Gorfamu jedhamee mallatteeffame, Arroxyn immoo yeroo jalqabaaf Explore banattu siif filata. Wiki yt-dlp [automatic akkaawuntii seenaan irratti hundaa'e akkaawuntii Google mallatteessisuu danda'a](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) jedha; kanaaf akkaawuntiin lammaffaan filannoo nageenya caalu dha.",
  faq_q5: "YouTube waan tokko jijjiirte itti fufaa hojeta?",
  faq_a5: "yt-dlp yeroo eegaluu irratti ofumaan haaromfama, fi Arroxy yeroo YouTube waan tokko jijjiirtu ariitiidhaan sirreessa erga. YouTube bot akka hin taane akka mirkaneessitu yoo gaafate, Arroxy yoo Explore keessatti seentee jirta seensa Explore kee illee ni yaala, kuukkiin faayila ykn biraawzara irraa immoo qindoomina kuukkii keessatti ni argama.",
  faq_q6: "Arroxy afaan meeqa keessatti argamu?",
  faq_a6:
    "Afaanota {{LANG_COUNT}} battalumatti ni argatta: {{LANG_NAME_LIST}}. Arroxy yeroo jalqaba banamu afaan sirna hojii kee ofumaan adda baasa, akkasumas filataa afaanii toolbar keessa jiru irraa yeroo kamiyyuu jijjiiruu dandeessa. Runtime locale JSON src/shared/i18n/locales/ keessa jira, katalogiin PO hiiktotaaf ammoo i18n/locales/ keessa jira — gumaachuuf GitHub irratti PR bani.",
  faq_q7: "Waan biraa fayyadu barbaachisaa?",
  faq_a7:
    "Lakki. yt-dlp, ffmpeg fi ffprobe jalqaba banuu irratti ofumaan buufamanii meeshaa kee irratti kuufamu. Sana booda qindaaʼinni dabalataa hin barbaachisu.",
  faq_q8: "Playlist ykn chaanaalii guutuu buusuu danda'aa?",
  faq_a8:
    "Eeyyee — lamaan isaaniiyyuu. URL playlist ykn channel maxxansi (fkn. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); galfata meeqa akka sakatta’u filadhu, ergasii tarree guutuu queue godhi ykn viidiyoo addaa filadhu. Filtraroonni guyyaa gara fuulduraatti dhufu.",
  faq_q9: 'macOS "app miidhaameera" jedha — maal godhaa?',
  faq_a9:
    "Sun macOS Gatekeeper app mallattoo hin qabne dhorku, miidhaa dhugaa miti. Ajajoota Terminal quarantine haquu fi Arroxy banuuf [macOS first launch](#macos-first-launch) ilaali.",
  faq_q10: "Viidiyoo YouTube buusuu seeraa dha?",
  faq_a10:
    "Fayyadama dhuunfaa, dhoksaa qofaaf yeroo hedduun mootummoota heddu keessatti fudhatama. [Dambii Tajaajilaaf](https://www.youtube.com/t/terms) YouTube fi seeraa mirga-qopheessaa naannoo keetti hordofuuf ati itti gaafatamtummaa qabda.",
  plan_intro: "Amma iyyuu karoorfame — tilmaamaan tartiiba dursaatiin:",
  plan_col1: "Amalli",
  plan_col2: "Ibsa",
  plan_r1_name: "**Playlist & chaanaalii hojjettoota**",
  plan_r1_desc: "Yeroo playlist ykn channel sakatta’an filtraroota guyyaa",
  plan_r2_name: "**Filannoo track sagalee YouTube**",
  plan_r2_desc:
    "Yoo YouTube track sagalee heddu dhiyeesse, filannoo track afaan dubbii app guutuu keessatti kaa’i; profile tokkoon tokkoon isaatti override godhi",
  plan_r3_name: "**Deebisanii yaaluun deebisuu cimaa**",
  plan_r3_desc:
    "Buufannoowwan walitti hidhamiinsa internetii hin tasgabboofne ykn rakkoo qabuun citeef karaa retry haaraa",
  plan_r4_name: "**Drawer download manager guutuu**",
  plan_r4_desc:
    "Queue drawer gara manager guutuutti guddisuu, items queue keessa jiranif destination folder jijjiiruu dabalatee",
  plan_r5_name: "**Buufannoo yeroo qabamee**",
  plan_r5_desc: "Queue yeroo qindaawaa irratti eegali (halkaniidhumaan hojeti)",
  plan_r9_name: "**Paakeejii AUR**",
  plan_r9_desc: "Arch Linux fi Omarchy irratti `yay -S arroxy-bin` fayyadamuun fe'i",
  plan_cta:
    "Amala yaaddetee jirtaa? [Gaaffii bani](../../issues) — galchiin hawaasaa dursa murteessa.",
  tech_content: TECH_CONTENT,
  support_h2: "Arroxy Deggeri",
  support_note: "Arroxy bilisa fi hayyama MIT jala jira — beeksisni hin jiru, telemetriin hin jiru, fooyya'iinsi kaffaltiin hin jiru. Yoo yeroo siif qusate, guddina isaa Bitcoin, Tron ykn Ethereum'iin deggeruu dandeessa: teessoowwan [DONATE.md](DONATE.md) keessa jiru, innis madda ofiisaa qofa. Arroxy gonkumaa teessoo iimeeliidhaan ykn ergaa kallattiitiin siif hin ergu. Repoo'f urjii kennuun, dogoggora gabaasuu fi hiikkaa fooyyessuun hammuma sana gargaara.",
  tos_h2: "Hayyama fayyadamuu",
  tos_note:
    "Arroxy meeshaa fayyadama dhuunfaa, dhoksaa qofaaf. Buufannoonni kee Dambii Tajaajilaaf YouTube [Terms of Service](https://www.youtube.com/t/terms) fi seeraa mirga-qopheessaa naannoo keetii wajjin walsimuu mirkaneessuu qofaaf itti gaafatamaa taata. Arroxy fayyadamuudhaan mirgaa hin qabne qabiyyee buusuu, haaromsu, ykn raabsuu hin godhin. Guddiftoonni misooma dogoggoraa kamiifis itti gaafatamu hin qaban.",
  footer_credit:
    'MIT License · Qalbii fi qormaata <a href="https://x.com/OrionusAI">@OrionusAI</a> tiin hojjetame',
};
