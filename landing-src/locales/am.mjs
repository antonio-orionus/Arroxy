// Landing-page translations for "am". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const am = {
  title: "Arroxy — ነፃ 4K YouTube አውርጅ፣ ምንም መግቢያ አያስፈልግም",
  description:
    "ለ Windows፣ macOS እና Linux ነፃ፣ MIT-ፈቃድ የ desktop YouTube አውርጅ። ቪዲዮዎችን እስከ 4K HDR በ60 fps ያውርዱ ያለ Google አካውንት፣ ያለ browser ኩኪዎች፣ ወይም ያለ ምንም መግቢያ።",
  og_title: "Arroxy — ነፃ 4K YouTube አውርጅ፣ ምንም መግቢያ አያስፈልግም",
  og_description:
    "ነፃ 4K YouTube አውርጅ። ምንም ኩኪ፣ ምንም መግቢያ፣ ምንም የሚቆረጥ ክፍለ-ጊዜ። MIT-ፈቃድ። Windows · macOS · Linux።",

  nav_features: "ባህሪያት",
  nav_screenshots: "ቅጽበታዊ ምስሎች",
  nav_install: "ጫን",
  nav_blog: "Blog",
  nav_download: "አውርድ",

  hero_eyebrow: "Open Source · MIT · ቀጣይ ልማት",
  hero_h1_a: "ነፃ 4K YouTube አውርጅ።",
  hero_h1_b: "ምንም ኩኪ። ምንም መግቢያ። ምንም የሚቆረጥ ክፍለ-ጊዜ።",
  hero_tagline:
    "Arroxy ለ Windows፣ macOS እና Linux ነፃ፣ MIT-ፈቃድ የ desktop YouTube አውርጅ ነው። ቪዲዮዎችን እስከ 4K HDR በ60 fps ያውርዳል — ምንም Google አካውንት፣ ምንም browser ኩኪዎች፣ ወይም ምንም መግቢያ ሳያስፈልግ።",
  pill_no_account: "ምንም Google አካውንት የለም",
  pill_no_tracking: "ክትትል የለም",
  pill_open_source: "Open source (MIT)",
  hero_trust: "እያንዳንዱን መስመር በ GitHub ይፈትሹ።",
  cta_download_os: "ለOS ዓይነትዎ ያውርዱ",
  cta_view_github: "በ GitHub ይመልከቱ",
  release_label: "የቅርብ ጊዜ ስሪት:",
  release_loading: "እየጫነ…",

  cta_download_windows: "ለ Windows ያውርዱ",
  cta_download_windows_portable: "Portable .exe (ያለ ጫን)",
  cta_download_mac_arm: "ለ macOS ያውርዱ (Apple Silicon)",
  cta_download_mac_intel: "Intel Mac? x64 DMG ያግኙ",
  cta_download_linux_appimage: "ለ Linux ያውርዱ (.AppImage)",
  cta_download_linux_flatpak: "Flatpak ጥቅል →",
  cta_other_platforms: "ሌሎች መድረኮች / ሁሉም ማውረዶች",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "አጫጫኝ",
  cta_portable_label: "Portable",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy ለ Windows፣ macOS እና Linux የ desktop ፕሮግራም ነው።",
  mobile_notice_sub: "ለማውረድ ይህን ገጽ በኮምፒውተርዎ ይክፈቱ።",
  mobile_copy_link: "የገጽ ሊንክ ቅዳ",
  first_launch_label: "ለመጀመሪያ ጊዜ ማስጀመሪያ እርዳታ",
  first_launch_mac_html:
    "macOS በመጀመሪያ ጊዜ ሲጀምሩ <em>ያልተለየ ገንቢ</em> ማስጠንቀቂያ ያሳያል — Arroxy እስካሁን ኮድ-ፊርማ አልተደረገም። <strong>የፕሮግራሙን አዶ ቀኝ-ጠቅ ያድርጉ → ክፈት</strong>፣ ከዚያ በውይይቱ <strong>ክፈት</strong> ይጫኑ። አንድ ጊዜ ብቻ ያስፈልጋል።",
  first_launch_linux_html:
    "<strong>AppImage:</strong> ፋይሉን ቀኝ-ጠቅ ያድርጉ → <strong>Properties → Allow executing as program</strong>፣ ወይም ተርሚናሉ ውስጥ <code>chmod +x Arroxy-*.AppImage</code> ያሂዱ። ካልከፈተ <code>libfuse2</code> (Ubuntu/Debian)፣ <code>fuse-libs</code> (Fedora) ወይም <code>fuse2</code> (Arch) ይጫኑ።<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code> ያሂዱ፣ ከዚያ ከፕሮግራም ምናሌዎ ያስጀምሩ ወይም <code>flatpak run io.github.antonio_orionus.Arroxy</code> ያሂዱ።",

  features_eyebrow: "ምን ያደርጋል",
  features_h2: "የሚጠብቁትን ሁሉ፣ ምንም ሳይወሳሰብ።",
  features_sub: "URL ይለጥፉ፣ ጥራት ይምረጡ፣ አውርድ ይጫኑ። ያ ብቻ።",
  f1_h: "እስከ 4K UHD",
  f1_p: "2160p፣ 1440p፣ 1080p፣ 720p — YouTube የሚሰጠውን ሁሉም 해상도፣ እንዲሁም ድምጽ-ብቻ MP3፣ AAC እና Opus።",
  f2_h: "60 fps እና HDR ተጠብቆ",
  f2_p: "ከፍተኛ ፍሬም-ሬት እና HDR ዥረቶች ያለ ምንም ጥራት ኪሳራ YouTube እንደኮዳቸው ያድራሉ።",
  f3_h: "በአንድ ጊዜ ብዙ",
  f3_p: "የፈለጉትን ያህል ቪዲዮ ያስቀምጡ። የማውረጃ ፓኔሉ እያንዳንዱን ሂደት በትይዩ ይከታተላል።",
  f4_h: "ራስ-ሰር ዝማኔዎች",
  f4_p: "Arroxy yt-dlp እና ffmpeg ከጀርባ ትኩስ ያደርጋቸዋል — ለእያንዳንዱ የ YouTube ለውጥ ይሰራል።",
  f5_h: "9 ቋንቋዎች",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — ቋንቋዎን ራስ-ሰር ያወቃል።",
  f6_h: "ብዙ-መድረክ",
  f6_p: "ለ Windows፣ macOS እና Linux ተፈጥሯዊ ግንባታዎች — installer፣ portable፣ DMG ወይም AppImage።",
  f7_h: "የጽሑፍ ርዕሶች፣ እንደፈለጉ",
  f7_p: "SRT፣ VTT ወይም ASS ውስጥ የእጅ ወይም ራስ-ሰር የጽሑፍ ርዕሶች — ቪዲዮው አጠገብ ያስቀምጡ፣ ፖርታብል .mkv ውስጥ ያካትቱ፣ ወይም ወደ Subtitles/ ፎልደር ያስቀምጡ።",
  f8_h: "SponsorBlock ውስጥ ያለ",
  f8_p: "ስፖንሰር ክፍሎችን፣ መግቢያዎችን፣ ማሳረጊያዎችን፣ ራስ-ማስታወቂያዎችን እና ሌሎችን ይዝለሉ ወይም ምልክት ያድርጉ — FFmpeg ይቁረጡ ወይም ምዕራፎች ብቻ ያክሉ። ለእያንዳንዱ ምድብ እርስዎ ይወስናሉ።",
  f9_h: "ክሊፕቦርድ ራስ-ሰር ሙያ",
  f9_p: "ማንኛውም ቦታ YouTube ሊንክ ቀድቶ ወደ Arroxy ሲመለሱ ወዲያውኑ ያወቃል — የማረጋገጫ ጥያቄ ቁጥጥርዎን ይጠብቃል። ከላቁ ቅንብሮች ውስጥ ያሰናዱ ወይም ያሰናክሉ።",
  f10_h: "URL ራስ-ሰር ማጽዳት",
  f10_p: "ከተለጠፉ YouTube ሊንኮች የክትትል ፓራሜትሮች (si, pp, feature, utm_*፣ fbclid፣ gclid እና ሌሎች) ራስ-ሰር ይወገዳሉ፣ youtube.com/redirect ሸፋኖች ይከፈታሉ — URL ሜዳ ሁልጊዜ ዋናውን ሊንክ ያሳያል።",
  f11_h: "ወደ ትሬ ይደበቃል",
  f11_p: "መስኮቱን ሲዘጉ Arroxy ወደ ሲስተም ትሬ ይሄዳል። ማውረዶች ከጀርባ ይቀጥላሉ — ትሬ አዶ ጠቅ ያድርጉ መስኮቱን ለማምጣት፣ ወይም ትሬ ምናሌ ተጠቅመው ይውጡ።",
  f12_h: "ውስጣዊ ሜታዳታ እና ጥበብ",
  f12_p: "ርዕስ፣ የጭነት ቀን፣ ስነ-ጥበብ፣ መግለጫ፣ የሽፋን ጥበብ እና ምዕራፍ ምልክቶች ቀጥታ ወደ ፋይሉ ይፃፋሉ — ምንም ሳይድካር ፋይሎች፣ ምንም የእጅ ምልክቶች የሉም።",

  shots_eyebrow: "ተግባር ላይ ይመልከቱ",
  shots_h2: "ለግልጽነት ተሰርቷል፣ ለሁከት አይደለም።",
  shot1_alt: "URL ይለጥፉ",
  shot2_alt: "ጥራትዎን ይምረጡ",
  shot3_alt: "የማስቀመጫ ቦታ ይምረጡ",
  shot4_alt: "ትይዩ ማውረዶች",
  shot5_alt: "የጽሑፍ ርዕስ ደረጃ — ቋንቋዎች፣ ቅርጸት እና የማስቀመጫ ሁኔታ ይምረጡ",
  og_image_alt: "Arroxy ፕሮግራም አዶ — YouTube ቪዲዮዎችን በ4K ለማውረድ የ desktop ፕሮግራም።",

  privacy_eyebrow: "ግላዊነት",
  privacy_h2_html: "Arroxy <em>የማያደርጋቸው</em> ነገሮች።",
  privacy_sub:
    "አብዛኛዎቹ YouTube አውርጆች ውሎ አድሮ ኩኪዎችዎን ይጠይቃሉ። Arroxy ፈጽሞ አይጠይቅም።",
  p1_h: "መግቢያ የለም",
  p1_p: "ምንም Google አካውንት። ምንም ጊዜ የሚያልቅ ክፍለ-ጊዜ የለም። አካውንትዎ ምልክት የሚደረግበት ምንም አደጋ የለም።",
  p2_h: "ኩኪ የለም",
  p2_p: "Arroxy ማንኛውም ማሰሻ የሚጠቀማቸውን ተመሳሳይ ቶከኖች ብቻ ይጠይቃል። ምንም ወደ ውጭ አይላክም፣ ምንም አይከማችም።",
  p3_h: "ምንም የተጠቃሚ መለያ ቁጥሮች የሉም",
  p3_p: "ስም-አልባ፣ ለክፍለ-ጊዜ ብቻ telemetry በ Aptabase አማካኝነት — ምንም install ID፣ ምንም fingerprinting፣ ምንም የግል ዳታ። ማውረዶችዎ፣ ታሪክዎ እና ፋይሎችዎ ፈጽሞ ማሽንዎን አይለቁም።",
  p4_h: "ምንም የሦስተኛ-ወገን አገልጋዮች የሉም",
  p4_p: "ሁሉም ሂደቱ በ yt-dlp + ffmpeg አማካኝነት በአካባቢ ይሄዳል። ፋይሎች ርቀት አገልጋይ ፈጽሞ አይነኩም።",

  install_eyebrow: "ጫን",
  install_h2: "ቻናልዎን ይምረጡ።",
  install_sub:
    "ቀጥተኛ ማውረድ ወይም ማንኛውም ዋና ጥቅል አስተዳዳሪ — ሁሉም በእያንዳንዱ ስሪት ራስ-ሰር ይዘምናሉ።",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "ሁሉም",
  winget_desc: "ለ Windows 10/11 የሚመከር። ከሲስተሙ ጋር ራስ-ሰር ዝማኔ።",
  scoop_desc: "በ Scoop bucket አማካኝነት Portable ጫን። የአስተዳዳሪ መብት አያስፈልግም።",
  brew_desc: "Cask ይጠቀሙ፣ ባንድ ትእዛዝ ይጫኑ። Universal binary (Intel + Apple Silicon)።",
  flatpak_h: "Flatpak",
  flatpak_desc: "Sandboxed ጫን። ከ Releases .flatpak ጥቅሉን ያውርዱ፣ ባንድ ትእዛዝ ይጫኑ። Flathub ማዋቀር አያስፈልግም።",
  direct_h: "ቀጥተኛ ማውረድ",
  direct_desc: "NSIS installer፣ portable .exe፣ .dmg፣ .AppImage ወይም .flatpak — ቀጥታ ከ GitHub Releases።",
  direct_btn: "Releases ክፈት →",
  copy_label: "ቅዳ",
  copied_label: "ተቀድቷል!",

  footer_made_by: "MIT ፍቃድ · በጥንቃቄ ተሰርቷል",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "ቋንቋ:",

  faq_eyebrow: "ጥ/ወ",
  faq_h2: "ብዙ ጊዜ የሚጠየቁ ጥያቄዎች",
  faq_q1: "የትኞቹ ጥራቶች ማውረድ እችላለሁ?",
  faq_a1:
    "YouTube የሚሰጠውን ሁሉ — 4K UHD (2160p)፣ 1440p QHD፣ 1080p Full HD፣ 720p፣ 480p፣ 360p እና ድምጽ-ብቻ። ከፍተኛ ፍሬም-ሬት (60 fps፣ 120 fps) እና HDR ይዘቶች እንዳሉ ይቆያሉ። Arroxy ሁሉንም ቅርጸቶች ያሳያል ምን መውሰድ እንደሚፈልጉ ትክክለኛ ምርጫ ይሰጣችኋል።",
  faq_q2: "ከዚህ ሁሉ ነፃ ነው?",
  faq_a2: "አዎ። MIT ፍቃድ። ምንም premium ደረጃ የለም፣ ምንም ባህሪ መዝጊያ የለም።",
  faq_q3: "Arroxy በምን ቋንቋዎች ይገኛል?",
  faq_a3:
    "ዘጠኝ፣ ከሳጥን ውጭ: English, Español (Spanish), Deutsch (German), Français (French), 日本語 (Japanese), 中文 (Chinese), Русский (Russian), Українська (Ukrainian) እና हिन्दी (Hindi)። Arroxy በመጀመሪያ ጊዜ ሲጀምሩ የስርዓተ ምOS ቋንቋዎን ራስ-ሰር ያወቃል፣ ከመሳሪያ አሞሌ የቋንቋ ምርጫ ማንኛውም ጊዜ መቀየር ይችላሉ። ትርጉሞች ከ src/shared/i18n/locales/ ውስጥ ቀላል TypeScript ዕቃዎች ናቸው — ለማዋጮ GitHub ላይ PR ይክፈቱ።",
  faq_q4: "ምንም ነገር መጫን አለብኝ?",
  faq_a4:
    "አይደለም። yt-dlp እና ffmpeg በመጀመሪያ ጊዜ ከይፋዊ GitHub releases ራስ-ሰር ይወርዳሉ፣ በማሽንዎ ላይ ይቀመጣሉ። ከዚያ ምንም ተጨማሪ ማዋቀር አያስፈልግም።",
  faq_q5: "YouTube ሆኖ ቢቀይር ይሰራ ይሆን?",
  faq_a5:
    "አዎ — Arroxy ሁለት የተጣጣሚነት ደረጃዎች አሉት። መጀመሪያ፣ yt-dlp ከሚጠናከሩ ክፍት-ምንጭ መሳሪያዎች አንዱ ነው — የ YouTube ለውጦች ከሰዓታት ውስጥ ዝማኔ ያደርጋሉ። ሁለተኛ፣ Arroxy ኩኪዎች ወይም Google አካውንትዎን ፈጽሞ አይጠቀምም፣ ስለዚህ ምንም ጊዜ የሚያልቅ ክፍለ-ጊዜ የለም፣ ምንም ምስክርነቶች ማሽከርከር አያስፈልጉም። ያ ጥምረት ከ browser ኩኪዎች ወደ ውጭ ማረፊያ ላይ ከሚወሰኑ መሳሪያዎች በጣም የተረጋጋ ያደርገዋል።",
  faq_q6: "Playlist ማውረድ ይቻላል?",
  faq_a6:
    "አሁን ነጠላ ቪዲዮዎች ይደገፋሉ። Playlist እና channel ድጋፍ ወደፊት የሚሰራ ዕቅድ ነው።",
  faq_q7: "የ YouTube አካውንቴን ወይም ኩኪዎቼን ይፈልጋል?",
  faq_a7:
    "አይደለም — ይህ ከሚሰማው በላይ ትልቅ ጉዳይ ነው። አብዛኛዎቹ ከ YouTube ዝማኔ በኋላ የሚቆሙ መሳሪያዎች ማሳሻዎ YouTube ኩኪዎችን ወደ ውጭ ለመላክ ይጠይቁዎታል። ያ መፍቻ ዘዴ YouTube ክፍለ-ጊዜዎችን ስለሚቀያይር በእያንዳንዱ ~30 ደቂቃ ይሰናከላል፣ yt-dlp ዶኩሜንቶቹ Google አካውንትዎን ምልክት ሊያደርግ ይችላል ብለው ያስጠነቅቃሉ። Arroxy ፈጽሞ ኩኪዎችን ወይም ምስክርነቶችን አይጠቀምም። ምንም መግቢያ የለም። ምንም አካውንት አለ። ምንም ጊዜ የሚያልቅ የለም፣ ምንም የሚከለከለው የለም።",
  faq_q8:
    'macOS "ፕሮግራሙ ተበላሽቷል" ወይም "ሊከፈት አይችልም" ይላል — ምን ማድረግ አለብኝ?',
  faq_a8:
    "ይህ macOS Gatekeeper ፊርማ ያልተደረገ ፕሮግራምን መዝጊያ ሆኗል — ትክክለኛ ጉዳት አይደለም። README ውስጥ ለ macOS ለመጀመሪያ ጊዜ ማስጀመሪያ ደረጃ-በ-ደረጃ መመሪያዎች አሉ።",
  faq_q9: "ይህ ሕጋዊ ነው?",
  faq_a9:
    "ለግል አጠቃቀም ቪዲዮዎችን ማውረድ ብዙ ፍርድ ቤቶች ውስጥ በአጠቃላይ ተቀባይነት አለው። የ YouTube የአገልግሎት ውሎችን እና የአካባቢ ሕጎችን ማክበር ኃላፊነትዎ ነው።",
};
