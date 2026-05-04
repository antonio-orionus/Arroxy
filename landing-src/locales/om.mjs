// Landing-page translations for "om". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const om = {
  title: "Arroxy — Buufata YouTube 4K Bilisaa, Seensa Hin Barbaadu",
  description:
    "Buufata YouTube desktop bilisaa, hayyama MIT, Windows, macOS, fi Linux dhaaf. Viidiyoo hamma 4K HDR sa'aatii 60 fps buufi — akkaawuntii Google, kuukii browser, ykn seensa kamiiyyuu malee.",
  og_title: "Arroxy — Buufata YouTube 4K Bilisaa, Seensa Hin Barbaadu",
  og_description:
    "Buufata YouTube 4K bilisaa. Kuukii hin jiru, seensa hin jiru, seesiini cabuu hin jiru. Hayyama MIT. Windows · macOS · Linux.",

  nav_features: "Amaloota",
  nav_screenshots: "Fakkiiwwan",
  nav_install: "Diriirsi",
  nav_download: "Buufi",

  hero_eyebrow: "Open Source · MIT · Guddinni Itti Fufa",
  hero_h1_a: "Buufata YouTube 4K bilisaa.",
  hero_h1_b: "Kuukii hin jiru. Seensa hin jiru. Seesiini cabuu hin jiru.",
  hero_tagline:
    "Arroxy buufata YouTube desktop bilisaa, hayyama MIT, Windows, macOS, fi Linux dhaaf dha. Viidiyoo hamma 4K HDR sa'aatii 60 fps buufa — akkaawuntii Google, kuukii browser, ykn seensa kamiiyyuu gaafachuu gonkumaa malee.",
  pill_no_tracking: "Hordoffii hin jiru",
  pill_no_account: "Akkaawuntii Google hin barbaadu",
  pill_open_source: "Open source (MIT)",
  hero_trust: "Sarara koodii hunda GitHub irratti qoradhu.",
  cta_download_os: "OS keetiif buufi",
  cta_view_github: "GitHub irratti ilaali",
  release_label: "Baasii haaraa:",
  release_loading: "fe'aa jira…",

  cta_download_windows: "Windows dhaaf buufi",
  cta_download_windows_portable: "Portable .exe (diriirsa hin barbaadu)",
  cta_download_mac_arm: "macOS dhaaf buufi (Apple Silicon)",
  cta_download_mac_intel: "Mac Intel? DMG x64 argadhu",
  cta_download_linux_appimage: "Linux dhaaf buufi (.AppImage)",
  cta_download_linux_flatpak: "Xiinxala Flatpak →",
  cta_other_platforms: "Platformoota biroo / Buufatoota hunda",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "Diriirfataa",
  cta_portable_label: "Portable",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy app desktop Windows, macOS, fi Linux dhaaf ta'edha.",
  mobile_notice_sub: "Buufachuuf fuula kana kompyuutara keetii irratti bani.",
  mobile_copy_link: "Liinki fuulaa copy gori",
  first_launch_label: "Gargaarsa jalqaba banuu",
  first_launch_mac_html:
    "macOS jalqaba banuu irratti <em>guddifataa hin beekamne</em> jechuun dhorka — Arroxy ammalee mallattoo koodii hin qabu. <strong>Akaawuntii app irratti cuqaasi mirgaan → Bani</strong>, kana booda galmee keessaa <strong>Bani</strong> cuqaasi. Yeroo tokkoo qofa barbaachisa.",
  first_launch_linux_html:
    "<strong>AppImage:</strong> faylii irratti mirgaan cuqaasi → <strong>Amaloota → Akka sagantaatti hojjechuuf hayyami</strong>, ykn terminal keessaa <code>chmod +x Arroxy-*.AppImage</code> hojjeti. Yoo ammallee hin jalqabne, <code>libfuse2</code> (Ubuntu/Debian), <code>fuse-libs</code> (Fedora), ykn <code>fuse2</code> (Arch) diriirsi.<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code>, kana booda menu app keetii irraa bani ykn <code>flatpak run io.github.antonio_orionus.Arroxy</code> hojjeti.",

  features_eyebrow: "Maal hojjeta",
  features_h2: "Waan eegdu hunda, rakkoo tokko malee.",
  features_sub: "URL maxxansi, qulqullina filadhu, buufi cuqaasi. Kun dha.",
  f1_h: "Hamma 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — YouTube kennu murteessaa hunda, akkasumas sagantaa qofa MP3, AAC, fi Opus.",
  f2_h: "60 fps fi HDR eegamaniiru",
  f2_p: "Raadiyoon sarara fps olaanaa fi HDR YouTube encode godhe sana sana dhufu — qulqullina dhabuu tokko malee.",
  f3_h: "Yeroo tokkotti baay'ee",
  f3_p: "Viidiyoo barbaaddu hunda toora itti naqii. Paanaaliin buufachuu hundi tokkoon tokkoon isaanii adeemsa mul'isa.",
  f4_h: "Haaromsa ofii",
  f4_p: "Arroxy yt-dlp fi ffmpeg haaromsa jalaa — jijjiirama YouTube hundaaf hojjeta.",
  f5_h: "Afaan 9",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — kan kee ofii isaa argata.",
  f6_h: "Platform hedduu",
  f6_p: "Ijaarsi asaasaa Windows, macOS, fi Linux dhaaf — diriirfataa, portable, DMG, ykn AppImage.",
  f7_h: "Caaltuu, akka fedhetti",
  f7_p: "Caaltuu harka ykn ofumaan uumame SRT, VTT, ykn ASS keessatti — viidiyoo cinaa ol-kaa'ama, .mkv portable keessa ramadama, ykn gita Subtitles/ keessa kaa'ama.",
  f8_h: "SponsorBlock keessatti jira",
  f8_p: "Kutaa beeksisaa, seensa, baxxannoo, of-beeksisuu fi kkf irra ture ykn mallattoo isaan irratti kaa'i — FFmpeg waliin muri ykn boqonnaa dabalii. Filannoon kee, kutaa kutaadhaan.",
  f9_h: "Clipboard ofumaan guuta",
  f9_p: "Liinki YouTube eessallee copy godhi, Arroxy yeroo deebitu ni argata — mirkaneessa beeksisa to'annaa siif kenna. Qindaa'ina Olaanaa keessatti eegi ykn dhaabi.",
  f10_h: "URL ofumaan qulqulleessa",
  f10_p: "Parameetaroonni hordoffii (si, pp, feature, utm_*, fbclid, gclid, fi kanneen biroo) liinkii YouTube maxxanfame irraa ofumaan haaqamu, fi maramtoota youtube.com/redirect hiikamu — dirreen URL yeroo hunda liinkii bu'uuraa agarsiisa.",
  f11_h: "Tireey keessatti dhossata",
  f11_p: "Foddaa cufuu Arroxy tireey sirna keessatti ukaa'a. Buufachuu duubaan hojjechaa tura — akaawuntii tireey cuqaasii foddaa deebi'i, ykn menu tireey irraa ba'i.",
  f12_h: "Metadata fi barreeffama keessaa jiru",
  f12_p: "Mata-duree, guyyaa olkaa'uu, artisti, ibsa, barreeffama cufaa, fi mallattoolee boqonnaa kallattumaan faayilii keessa barreeffama — faayilii dhibbaa tokko malee, mallattoo of danda'aa malee.",

  shots_eyebrow: "Hojii ilaali",
  shots_h2: "Ifaaf ijaarsame, kuuffii malee.",
  shot1_alt: "URL maxxansi",
  shot2_alt: "Qulqullina kee filadhu",
  shot3_alt: "Eessa ol-kaa'uu filadhu",
  shot4_alt: "Buufachuu parallel",
  shot5_alt: "Tarkaanfii caaltuu — afaan, format, fi haaluma ol-kaa'uu filadhu",
  og_image_alt: "Akaawuntii app Arroxy — app desktop viidiyoo YouTube 4K buufachuuf.",

  privacy_eyebrow: "Dhuunfaa",
  privacy_h2_html: "Arroxy <em>hin</em> hojjennu.",
  privacy_sub:
    "Buufatoota YouTube hedduun yeroo tokkotti kuukii kee gaafatu. Arroxy gaafachuu hin danda'u.",
  p1_h: "Seensa hin barbaadu",
  p1_p: "Akkaawuntii Google hin barbaadu. Seesiini dhumuu hin jiru. Akkaawuntiin kee mallatteffamuuf carraan duwwaa dha.",
  p2_h: "Kuukii hin jiru",
  p2_p: "Arroxy tokeenota browser kamiyyuu gaafatu sana gaafata. Wanti ol-baafame hin jiru, wanti kuufame hin jiru.",
  p3_h: "ID fayyadamaa hin jiru",
  p3_p: "Teelemeettrii maqaa-dhabduu, seesiiniif qofa Aptabase waliin — ID diriirsa hin jiru, maamilooma hin jiru, ragaa dhuunfaa hin jiru. Buufatoota, seenaa, fi faayiloonni kee meeshaa kee irratti hafu — guutummaatti.",
  p4_h: "Sirnaalee sadaffaa hin jiran",
  p4_p: "Tooftaan guutuun naannoo yt-dlp + ffmpeg waliin hojjeta. Faayiloonni sarara fagoo tokkollee hin tuqan.",

  install_eyebrow: "Diriirsi",
  install_h2: "Karaa kee filadhu.",
  install_sub:
    "Kallattiin buufi ykn maniijara paakeejii guddaa kamiyyuu — hundi baasii hunda waliin ofumaan haaromfamu.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Hunda",
  winget_desc: "Windows 10/11 dhaaf gorfama. Sirna waliin ofumaan haaromfama.",
  scoop_desc: "Diriirsa portable Scoop bucket waliin. Mirga bulchaa hin barbaadu.",
  brew_desc: "Cask naqii, ajaja tokkoon diriirsi. Baayinariin universal (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Diriirsa sandbox. Xiinxala .flatpak Releases irraa buufi, ajaja tokkoon diriirsi. Qindaa'ina Flathub hin barbaadu.",
  direct_h: "Kallattiin buufi",
  direct_desc: "Diriirfataa NSIS, .exe portable, .dmg, .AppImage, ykn .flatpak — kallattumaan GitHub Releases irraa.",
  direct_btn: "Releases bani →",
  copy_label: "Copy gori",
  copied_label: "Copii ta'eera!",

  footer_made_by: "Hayyama MIT · Qulqullinaan hojjetame kan",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Afaan:",

  faq_eyebrow: "FAQ",
  faq_h2: "Gaaffilee yeroo baay'ee gaafataman",
  faq_q1: "Qulqullina viidiyoo kamii buufachuu danda'a?",
  faq_a1:
    "YouTube kennu kamiyyuu — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p, fi sagantaa qofa. Sarara fps olaanaa (60 fps, 120 fps) fi HDR akka jiranitti eegamu. Arroxy formatoota argachuu danda'an hunda sitti agarsiisa, sirumaan maalii buufachuu feetu akka filattu si hayyama.",
  faq_q2: "Dhugumatti bilisaa dha?",
  faq_a2: "Eeyyee. Hayyama MIT. Sadarkaa premium hin jiru, amaloota eegame hin jiru.",
  faq_q3: "Arroxy afaan meeqa keessatti argama?",
  faq_a3:
    "Sagal, yeroo jalqabaatii: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian), fi हिन्दी (Hindi). Arroxy afaan mana-hojii kee sirna hojjetaa irratti yeroo jalqabaatti ofumaa argata, yeroo kamiiyyuu toolbar irraa filataa afaan jijjiiruu dandeessa. Hiikaaleen objiektii TypeScript duwwaa akka src/shared/i18n/locales/ keessa jiran — gargaaruf GitHub irratti PR bani.",
  faq_q4: "Wanta diriirsu barbaadaa?",
  faq_a4:
    "Lakki. yt-dlp fi ffmpeg jalqaba banuu irratti GitHub releases isaanitii ofumaan buufamu, meeshaa kee irratti kuufamu. Kana booda, qindaa'ina dabalataa barbaachisaa miti.",
  faq_q5: "YouTube waa jijjiire yoo hojjetaa tura?",
  faq_a5:
    "Eeyyee — Arroxynis kutaalee lamaatu jabina qaba. Jalqaba, yt-dlp meeshaalee madda banaa hojii irra oolan keessaa baay'ee qoratamani tokko dha — jijjiirama YouTube booda sa'aatii muraasa keessatti haaromfama. Lammaffaa, Arroxy kuukii ykn akkaawuntii Google kee irratti hundaa'a hin qabu, kanaafuu seesiini dhumatu hin jiru, ibsitoonni jijjiiramuu hin qaban. Walitti makamni kun meeshaalee kuukii browser ergan irratti hundaa'an caalaa yk hammaachuu godha.",
  faq_q6: "Tarree taphachuu buufachuu danda'aa?",
  faq_a6:
    "Viidiyoo takka takka har'a ni deeggarama. Deeggarsi tarree fi chaanaalii karaa karoora irratti jira.",
  faq_q7: "Akkaawuntii YouTube koo ykn kuukii barbaadaa?",
  faq_a7:
    "Lakki — kunis waan itti dhagayamu caalaa guddaa dha. Meeshaalee hedduu haaromsa YouTube booda hojjechuuf dhaaban kuukii YouTube browser keetii erguuf si gaafatu. Furmaanni sun yeroo 30 hunda YouTube seesiini naanna'a waan ta'eef caba, fi dokumeentiin yt-dlp ofii isaa akkaawuntii Google kee mallatteffamuu danda'a jechuun dhorka. Arroxy kuukii ykn ibsitoo gonkumaa hin fayyadamu. Seensa hin jiru. Akkaawuntii walqabate hin jiru. Dhumatu hin jiru, dhorkamu hin jiru.",
  faq_q8:
    'macOS "app miidhamte" ykn "banamuun hin danda\'amu" jedha — maal gochuu?',
  faq_a8:
    "Kun macOS Gatekeeper app mallattoo hin qabne dhorka — miidha dhugaa miti. README jalqaba banuu macOS irratti tarkaanfii tarkaanfiitti qajeelfama qaba.",
  faq_q9: "Seeraan alaa dha?",
  faq_a9:
    "Viidiyoo fayyadama dhuunfaaf buufachuun biyyoota hedduu keessatti akkuma jirutti fudhatama. Haala Tajaajila YouTube fi seerota naannoo keetii hordofuuf itti gaafatamni kee irratti jira.",
};
