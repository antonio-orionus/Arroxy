const am = {
  common: {
    back: 'ተመለስ',
    continue: 'ቀጥል',
    retry: 'እንደገና ሞክር',
    startOver: 'ከመጀመሪያ ጀምር'
  },
  app: {
    feedback: 'አስተያየት',
    logs: 'ምዝግቦች',
    feedbackNudge: 'Arroxy ደስ ይለዎታል? አስተያየትዎን ማካፈል ይፈልጋሉ! 💬',
    debugCopied: 'ተቀድቷል!',
    debugCopyTitle: 'የሂደት መረጃ ቅዳ (Electron፣ ስርዓተ ክወና፣ Chrome ስሪቶች)',
    zoomIn: 'አቅርብ',
    zoomOut: 'አርቅ'
  },
  about: {
    button: 'ስለ',
    openTitle: 'ስለ Arroxy',
    tagline: 'ለዴስክቶፕ ፈጣን እና ቀላል ቪዲዮ እና ኦዲዮ አውርጅ።',
    websiteLink: 'ድረ-ገጽ',
    githubLink: 'GitHub',
    licenseLine: 'MIT ፈቃድ · በ Antonio Orionus',
    thirdPartyNotices: 'የሦስተኛ ወገን ማስታወቂያዎችን ይመልከቱ'
  },
  titleBar: {
    close: 'ዝጋ',
    minimize: 'አሳንስ',
    maximize: 'አሰፋ',
    restore: 'መልስ'
  },
  splash: {
    greeting: 'እንኳን ደህና መጡ!',
    warmup: 'Arroxy እየሞቀ ነው…',
    downloading: '{{binary}} እየወረደ ነው…',
    warmupFailedNoDiag: 'ማዋቀር አልተሳካም። ዝርዝሮችን ለማየት የማዋቀሪያ ምዝግብ ፋይሉን ይክፈቱ።'
  },
  repair: {
    title: 'ማዋቀሩ እርዳታዎን ይፈልጋል',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'ማረጋገጥ አልተቻለም።',
      downloadFailed: 'ማውረድ ወድቋል። የኢንተርኔት ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።',
      extractFailed: 'የማህደር ቅኝት ወድቋል። ዳውንሎዱ ሊበላሽ ይችላል — እንደገና ይሞክሩ።',
      hashFailed: 'በዳውንሎዱ ፋይል ላይ ቼክሰም አለመዛቸጥ። ዳውንሎዱን እንደገና ይሞክሩ።',
      spawnFailed: 'ፋይሉ የለም ወይም ሊጀመር አልቻለም። ሚሰራ ቅጂ ይምረጡ።',
      permissionDenied: 'ስርዓቱ ፋይሉን ለማስኬድ ፈቃደኛ አልሆነም። የሚያምኑበት ቅጂ ይምረጡ ወይም እንደ አስተዳዳሪ እንደገና ይሞክሩ።',
      blockedOrQuarantined: 'Windows ፋይሉን ዘጋው (SmartScreen / Defender)። የተጫነ ቅጂ ይምረጡ ወይም የሩጫ ጊዜ አቃፊውን ያሳምኑ።',
      badExitCode: 'ሁለዮሽ ፋይሉ ለ --version ምላሽ አልሰጠም። ሊበላሽ ወይም ያሳሳተ ግንባታ ሊሆን ይችላል።',
      timeout: 'የስሪት ምርምሩ ጊዜ አለፈ። ፋይሉ ቀዘቀዘ ሊሆን ይችላል — እንደገና ይሞክሩ።',
      pairIncomplete: 'ffmpeg እና ffprobe ሁለቱም እንደ ተጣመሩ ጥንድ መቀናጀት አለባቸው።'
    },
    actions: {
      chooseExecutable: 'ፈፃሚ ፋይል ምረጥ',
      resetToDefault: 'ወደ ነባሪ መልስ',
      retrySetup: 'ማዋቀሩን እንደገና ሞክር',
      cancel: 'ሰርዝ',
      openDependencyFolder: 'የጥገኝነት አቃፊ ክፈት',
      viewSetupLog: 'የማዋቀሪያ ምዝግብ ፋይል ተመልከት'
    }
  },
  theme: {
    light: 'ብርሃን ሁነታ',
    dark: 'ጨለማ ሁነታ',
    system: 'የስርዓት ነባሪ'
  },
  language: {
    label: 'ቋንቋ'
  },
  wizard: {
    steps: {
      url: 'URL',
      playlistItems: 'Playlist',
      playlistPresets: 'ጥራት',
      formats: 'ቅርጸት',
      subtitles: 'ንዑስ ርዕሶች',
      sponsorblock: 'SponsorBlock',
      output: 'ውፅዓት',
      folder: 'አስቀምጥ',
      confirm: 'አረጋግጥ'
    },
    playlist: {
      heading: 'የ Playlist ቪዲዮዎች',
      itemCount_one: '{{count}} ቪዲዮ',
      itemCount_other: '{{count}} ቪዲዮዎች',
      itemCountAudio_one: '{{count}} ዘፈን',
      itemCountAudio_other: '{{count}} ዘፈኖች',
      selectAll: 'ሁሉ ምረጥ',
      selectNone: 'ምንም አትምረጥ',
      rangeFrom: 'ከ',
      rangeTo: 'እስከ',
      rangeApply: 'ክልል ተጠቀም',
      selectedCount_one: '{{count}} ተመርጧል',
      selectedCount_other: '{{count}} ተመርጠዋል',
      noSelection: 'ለመቀጠል ቢያንስ አንድ ቪዲዮ ምረጥ',
      loadingItems: 'Playlist እየጫኑ…',
      thumbnailAlt: 'የቪዲዮ ድንክ ምስል',
      durationUnknown: 'live',
      syncChange: 'ፎልደር ቀይር…',
      syncApply: 'ማመሳሰልን ተግብር',
      syncScanning: 'ፎልደር በመፈተሽ ላይ…',
      syncFoundTitle: 'ቀድሞ በፎልደር ውስጥ',
      syncFoundDesc: '{{n}} ከእነዚህ ቪዲዮዎች በ{{dir}} ውስጥ ቀድሞውኑ አሉ። አዳዲሶቹን ብቻ ለማውረድ ይመሳሰል?',
      syncNoneTitle: 'እስካሁን ምንም አልወረደም',
      syncNoneDesc: 'ከዚህ አጫዋች ዝርዝር ውስጥ ምንም ቪዲዮ በ{{dir}} ውስጥ አልተገኘም።',
      alreadyDownloaded: 'ቀድሞ ወርዷል'
    },
    playlistPresets: {
      heading: 'ለቡድኑ ጥራት ይምረጡ',
      subhead: 'እያንዳንዱ ቪዲዮ የተመረጠውን ደረጃ ራሱን ችሎ ይፈታል — የተለያዩ playlists ያለ ችግር ይሰራሉ።',
      itemCount_one: '{{count}} ንጥል',
      itemCount_other: '{{count}} ንጥሎች'
    },
    mixedPrompt: {
      title: 'ይህ ሊንክ Playlist አለው',
      body: 'የጠቀሱትን ቪዲዮ ብቻ ይፈልጋሉ፣ ወይስ ከ Playlist ይምረጣሉ? በቀጣዩ ደረጃ የተወሰኑ ቪዲዮዎችን ወይም ክልል ይምረጣሉ።',
      singleVideo: 'ይህን ብቻ',
      pickFromPlaylist: 'ከ Playlist ምረጥ'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'ቅርጸቶችን ጫን',
      features: {
        heading: 'Arroxy ምን ሊያወርድ ይችላል',
        youtube: {
          heading: 'YouTube',
          video: 'ቪዲዮዎች',
          channel: 'ቻናሎች',
          playlist: 'Playlists',
          short: 'Shorts',
          music: 'ሙዚቃ',
          podcast: 'Podcasts'
        },
        anySite: {
          heading: '2000+ ጣቢያዎች',
          video: 'ቪዲዮዎች',
          videoPlaylist: 'የቪዲዮ playlists',
          musicPlaylist: 'የሙዚቃ playlists'
        },
        always: {
          heading: 'ሁልጊዜ ይኖራል',
          audioOnly: 'ድምጽ ብቻ',
          subtitles: 'ንዑስ ርዕሶች'
        }
      },
      mascotIdle: 'YouTube አገናኝ ጣል (ቪዲዮ ወይም Short) — ከዚያ "ቅርጸቶችን ጫን" ጠቅ አድርግ ✨',
      mascotBusy: 'በዳራ ዳውንሎድ እያደረጉ ነው… ብዙ ስራ አሰራ 😎',
      advanced: 'ከፍተኛ',
      clearAria: 'URL አጽዳ',
      clipboard: {
        toggle: 'ቅጂ ሰሌዳ ተቆጣጠር',
        toggleDescription: 'YouTube አገናኝ ሲቀዱ የ URL መስክን በራስ ሞላ።',
        dialog: {
          title: 'YouTube URL ተገኝቷል',
          body: 'ይህን አገናኝ ከቅጂ ሰሌዳ ይጠቀሙ?',
          useButton: 'URL ጠቀም',
          disableButton: 'አሰናክል',
          cancelButton: 'ሰርዝ',
          disableNote: 'የቅጂ ሰሌዳ ክትትልን በኋላ በከፍተኛ ቅንብሮች ውስጥ ዳግም ማስቻል ይችላሉ።'
        }
      },
      cookies: {
        sourceLabel: 'የ Cookies ምንጭ',
        sourceOff: 'ጠፍ',
        sourceFile: 'ፋይል',
        sourceBrowser: 'አሳሽ',
        toggleDescription: 'ዕድሜ-ተገደበ፣ አባላት-ብቻ እና የግል ቪዲዮዎችን ያግዛል።',
        risk: 'አደጋ: cookies.txt ለዚያ አሳሽ ሁሉንም የገቡ ስሬቶች ይዟል — ይጠብቁ።',
        fileLabel: 'Cookies ፋይል',
        choose: 'ምረጥ…',
        clear: 'አጽዳ',
        placeholder: 'ምንም ፋይል አልተመረጠም',
        helpLink: 'cookies ስዴት እንዴት ነው?',
        enabledButNoFile: 'cookies ለመጠቀም ፋይል ምረጥ',
        browserLabel: 'አሳሽ',
        browserPlaceholder: 'አሳሽ ምረጥ…',
        browserHelp: 'Cookies ቀጥታ ከአሳሹ ያነባል። Chromium-ቤተሰብ አሳሾች ሲጠቀሙ አሳሹ ዝጋ።',
        enabledButNoBrowser: 'cookies ለመጠቀም አሳሽ ምረጥ',
        banWarning: 'YouTube cookies ያለ yt-dlp ጥቅም ላይ ሲውሉ መለያዎችን ሊያግድ ይችላል። የሚጥሉ መለያ ይጠቀሙ።',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt በቦታህ ላይ ሰበሰብ (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'ትራፊክን በፕሮክሲ ለማስተላለፍ — በጂኦ-ተከልካይ ይዘት ለሚጠቀሙ ጠቃሚ።',
        placeholder: 'http://host:port',
        clear: 'አጽዳ'
      },
      singleFilenameId: {
        toggle: 'የቪዲዮ ID ወደ ነጠላ ፋይል ስሞች ጨምር',
        toggleDescription: 'ርዕሶች ሲቀየሩ ወይም ሲጋጩ ነጠላ ማውረዶችን ልዩ ያደርጋል።'
      },
      closeToTray: {
        toggle: 'ሲዘጋ ወደ ትሬ ደብቅ',
        toggleDescription: 'መስኮት ሲዘጋ ዳውንሎዶችን ዳራ ቀጥል።'
      },
      analytics: {
        toggle: 'ስም-አልባ የአጠቃቀም ስታቲስቲክስ ላክ',
        toggleDescription: 'የመተግበሪያ ማስጀመሪያዎችን ብቻ ይቆጥራል። ምንም URL፣ የፋይል ስሞች ወይም የግል መረጃ የለም።'
      }
    },
    subtitles: {
      autoBadge: 'ራስ-ሰር',
      noLanguages: 'ለዚህ ቪዲዮ ምንም ንዑስ ርዕሶች የሉም',
      skip: 'ዝለለ',
      skipSubs: 'ለዚህ ቪዲዮ ዝለለ',
      mascot: 'ዜሮ፣ አንድ ወይም ብዙ ምረጥ — ፈጽሞ ለእርስዎ ✨',
      searchPlaceholder: 'ቋንቋዎችን ፈልግ…',
      noMatches: 'ምንም ቋንቋ አልተዛመደም',
      clearAll: 'ሁሉ አጽዳ',
      noSelected: 'ምንም ንዑስ ርዕስ አልተመረጠም',
      selectedNote_one: '{{count}} ንዑስ ርዕስ ዳውንሎድ ይደረጋል',
      selectedNote_other: '{{count}} ንዑስ ርዕሶች ዳውንሎድ ይደረጋሉ',
      sectionManual: 'እጅ ሰራ',
      sectionAuto: 'ራስ-ሰር ተፈጠረ',
      saveMode: {
        heading: 'እንደ አስቀምጥ',
        sidecar: 'ከቪዲዮው ጎን',
        embed: 'ወደ ቪዲዮ ክተት',
        subfolder: 'subtitles/ ንዑስ አቃፊ'
      },
      format: {
        heading: 'ቅርጸት'
      },
      embedNote: 'ክተት ሁነታ ውፅዓቱን እንደ .mkv ያስቀምጣል ስለዚህ ንዑስ ርዕሶቹ አስተማማኝ ሆነው ይካተታሉ።',
      autoAssNote: 'ራስ-ሰር ስዕሎቹ እንደ ASS ሳይሆን SRT ሆነው ይቀመጣሉ — ከ YouTube ሩጫ-ፍንጮቹ ያለ ቅጂ ሁልጊዜ ይጸዳሉ።'
    },
    sponsorblock: {
      modeHeading: 'ስፖንሰር ማጣሪያ',
      mode: {
        off: 'ጠፍ',
        mark: 'እንደ ምዕራፎች ምልክት አድርግ',
        remove: 'ክፍሎችን አስወግድ'
      },
      modeHint: {
        off: 'ምንም SponsorBlock የለም — ቪዲዮ እንደ ተሰቀለ ይጫወታል።',
        mark: 'የስፖንሰር ክፍሎችን እንደ ምዕራፎች ምልክት ያደርጋል (አጥፊ ያልሆነ)።',
        remove: 'FFmpeg ተጠቅሞ የስፖንሰር ክፍሎችን ይቆርጣል።'
      },
      categoriesHeading: 'ምድቦች',
      cat: {
        sponsor: 'Sponsor',
        intro: 'Intro',
        outro: 'Outro',
        selfpromo: 'Self-promo',
        music_offtopic: 'Music off-topic',
        preview: 'Preview',
        filler: 'Filler'
      }
    },
    formats: {
      quickPresets: 'ፈጣን ቅድመ-ቅንብሮች',
      video: 'ቪዲዮ',
      audio: 'ድምጽ',
      noAudio: 'ምንም ድምጽ የለም',
      videoOnly: 'ቪዲዮ ብቻ',
      audioOnly: 'ድምጽ ብቻ',
      audioOnlyOption: 'ድምጽ ብቻ (ቪዲዮ የለም)',
      mascot: 'ምርጥ + ምርጥ = ከፍተኛ ጥራት። ያንኑ ይምረጡ!',
      sniffing: 'ምርጥ ቅርጸቶችን ለእርስዎ እየፈለጉ…',
      loadingHint: 'ምርምሩ እስኪጠናቀቅ ይጠብቁ — playlist ዎች እና ፍለጋዎች ጊዜ ሊወስዱ ይችላሉ።',
      loadingAria: 'ቅርጸቶችን በመጫን ላይ',
      sizeUnknown: 'መጠን አይታወቅም',
      total: 'ጠቅላላ',
      skipToConfirm: 'ወደ ማረጋገጫ ዝለል',
      skipToConfirmTooltip: 'ለቀሩት ሁሉም ደረጃዎች የተቀመጡ ምርጫዎችዎን ይጠቀማል። አንድ ቅንብር ለመለወጥ ደረጃ በደረጃ ቀጥሉ — ምርጫዎ ለሚቀጥለው ጊዜ ይቀመጣል።',
      keepAudio: 'እንዳለ ቀጥል',
      keepAudioMeta: 'ቀደም ሲል የተካተተ ድምጽ',
      convert: {
        label: 'ቀይር',
        uncompressed: 'ቀይር · ያልተጨመቀ',
        bitrate: 'ቢትሬት',
        wavLabel: 'WAV (ያልተጨመቀ)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'የድምጽ ቅርጸት ለወጥ ድምጽ-ብቻ ሁነታ ያስፈልጋል (የቪዲዮ ምርጫውን ሰርዝ)።',
        requiresLossy: 'የቀጥታ ዥረት ተመርጧል — ቢትሬት የሚሰራው ወደ mp3፣ m4a፣ ወይም opus ሲቀይሩ ብቻ ነው።'
      },
      botWall: {
        heading: 'YouTube ይህን ምርምር ገደበ',
        bodyUnconfigured: 'የቅርጸት ዝርዝሩ ሙሉ ላይሆን ይችላል። Cookies በከፍተኛ ቅንብሮች ያዘጋጁ፣ ወይም አውታረ መረብ ቀይሩ እና እንደገና ሞክሩ።',
        bodyDisabled: 'Cookies ተዘጋጅቷል ነገር ግን ጠፍ ነው። ያስቡ እና እንደገና ሞክሩ፣ ወይም አውታረ መረብ ቀይሩ።',
        bodyEnabled: 'Cookies ቢኖርም YouTube ይህን ምርምር ገደበ። ቆይቶ ዳግም ሞክሩ ወይም አውታረ መረብ ቀይሩ።',
        retryCta: 'እንደገና ሞክር',
        enableRetryCta: 'Cookies አስቻል እና እንደገና ሞክር'
      },
      cookiesError: {
        heading: 'Cookies ምክንያቱ ሊሆን ይችላል',
        currentModeLabel: 'Cookies ምንጭ',
        currentModeFile: 'ፋይል',
        currentModeBrowser: 'አሳሽ',
        explanationFile: 'የ Cookies ፋይልዎ ባዶ፣ ጊዜው ያለፈ፣ ወይም ትክክለኛ ቅርጸት ላይሆን ይችላል (yt-dlp Netscape cookies.txt ይጠቀማል)። Cookies ዳግም ወደ ውጭ ለማሳደር፣ ሌላ ፋይል ለመምረጥ፣ ወደ አሳሽ ሁነታ ለመቀየር፣ ወይም Cookies ለማጥፋት ይሞክሩ።',
        explanationBrowser: 'Cookies ቀጥታ ከአሳሹ ይነበባሉ። አሳሹ አሁን እየሰራ ከሆነ፣ የ cookie ዳታቤዝ ተቆልፎ ሊሆን ይችላል (Chromium-ቤተሰብ)። አሳሹ ወደ YouTube ገብቶ መሆን አለበት። አሳሹን ለመዝጋት፣ ወደ ሌላ አሳሽ ለመቀየር፣ ወደ ፋይል ሁነታ ለመቀየር፣ ወይም Cookies ለማጥፋት ይሞክሩ።',
        openSettingsCta: 'የ Cookies ቅንብሮችን ክፈት',
        needsCookies: {
          heading: 'ይህ ጣቢያ መግባትን ያስፈልጋል',
          body: 'yt-dlp ያለ ማረጋገጫ ይህን ቪዲዮ ማግኘት አልቻለም። Cookies በከፍተኛ ቅንብሮች ያዋቅሩ — ወደ ዘለቁበት አሳሽ ያዋቅሩ ወይም cookies.txt ፋይል ያስገቡ።'
        },
        dpapi: {
          heading: 'Chrome cookies በ Windows ምስጠራ ታግደዋል',
          explanation: 'Chrome 127 እና ከዚያ በኋላ ያሉ ስሪቶች cookies ን በ Windows ላይ ሌሎች አፕሊኬሽኖች ሊያነቡ በማይችሉ መንገድ ያመስጥሩታል። ከዚህ በታች ያሉ አንዱን መፍትሄ ይሞክሩ።',
          fixFirefoxLabel: 'ወደ Firefox ቀይር',
          fixFirefoxBody: 'Firefox App-Bound Encryption አይጠቀምም። የ Cookies ቅንብሮቹን ክፈት እና ከአሳሽ ዝርዝሩ Firefox ን ምረጥ።',
          fixFileLabel: 'cookies.txt ወደ ውጭ ላክ',
          fixFileBody: 'Cookies ን ከ Chrome በ browser extension ወደ ውጭ ላክ፣ ከዚያ ይህን አፕ ወደ ፋይል ሁነታ ቀይር እና የወጣውን ፋይል ምረጥ።',
          fixUnsafeLabel: 'Chrome ን App-Bound Encryption አሰናክሎ ጀምር',
          fixUnsafeBody: 'Chrome ን ለማስጀምር --disable-features=LockProfileCookieDatabase ወደ ቅርበት አክል። ማስጠንቀቂያ: ይህ ቀደም ሲል የተመሰጠሩ cookies ን ስለሚያወድም ከሁሉም ጣቢያዎች ይወጣሉ እና ዳግም መግባት ይኖርብዎታል።',
          docsLinkLabel: 'yt-dlp ሰነዶች (ጉዳይ #10927)'
        }
      }
    },
    folder: {
      heading: 'አስቀምጥ ወደ',
      downloads: 'ዳውንሎዶች',
      videos: 'ፊልሞች',
      desktop: 'ዴስክቶፕ',
      music: 'ሙዚቃ',
      documents: 'ሰነዶች',
      pictures: 'ስዕሎች',
      home: 'መነሻ',
      custom: 'ብጁ…',
      subfolder: {
        toggle: 'ውስጥ ንዑስ አቃፊ አስቀምጥ',
        placeholder: 'ለምሳሌ lo-fi ቅጂዎች',
        invalid: 'የአቃፊ ስም ልቅ ቁምፊዎች አሉ'
      }
    },
    output: {
      embedChapters: {
        label: 'ምዕራፎች ክተት',
        description: 'ምዕራፍ ምልክቶች በማናቸውም ዘመናዊ ተጫዋች ሊሰሩ ይችላሉ።'
      },
      embedMetadata: {
        label: 'ሜታዳታ ክተት',
        description: 'ርዕስ፣ አርቲስት፣ መግለጫ እና የቀን ቀን ወደ ፋይሉ ይፃፋሉ።'
      },
      embedThumbnail: {
        label: 'ድንክ ምስል ክተት',
        description: 'የሽፋን ስዕል ውስጥ ፋይሉ። WebM ቪዲዮ ወደ MKV ይቀየራል፤ ንዑስ ርዕሶቹ ሲካተቱ ይዘለሉ።'
      },
      writeDescription: {
        label: 'መግለጫ አስቀምጥ',
        description: 'የቪዲዮ መግለጫን እንደ .description የጽሑፍ ፋይል ከዳውንሎዱ ጎን ያስቀምጣል።'
      },
      writeThumbnail: {
        label: 'ድንክ ምስል አስቀምጥ',
        description: 'ድንክ ምስሉን እንደ .jpg ምስል ፋይል ከዳውንሎዱ ጎን ያስቀምጣል።'
      }
    },
    confirm: {
      readyHeadline: 'ለመሳብ ዝግጁ!',
      landIn: 'ፋይልዎ እዚህ ይወርዳል',
      labelVideo: 'ቪዲዮ',
      labelAudio: 'ድምጽ',
      labelSubtitles: 'ንዑስ ርዕሶች',
      subtitlesNone: '—',
      labelSaveTo: 'አስቀምጥ ወደ',
      labelSize: 'መጠን',
      sizeUnknown: 'አይታወቅም',
      nothingToDownload: 'ንዑስ ርዕስ ብቻ ቅድመ-ቅንብር ነቅቷል ነገር ግን ምንም ቋንቋ አልተመረጠም — ምንም አይዳውንሎድም።',
      thumbnailEmbedNotSupported: 'Thumbnail embed ተዘሏል — የውፅዓት container አይደግፈውም።',
      subtitleEmbedAudioOnly: 'Subtitle embed ወደ sidecar ተቀይሯል — የድምጽ ትራኮች ውስጣዊ subtitle ዥረቶችን አይደግፉም።',
      audioOnly: 'ድምጽ ብቻ',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'ሌሎች ዳውንሎዶች ሲጠናቀቁ ይጀምራል — ሙሉ ባንድዊድዝ ያገኛል',
      pullIt: 'ሳቡት! ↓',
      pullItTooltip: 'ወዲያው ይጀምራል — ከሌሎች ዳውንሎዶች ጋር ይሰራል',
      labelPlaylist: 'Playlist',
      labelPreset: 'ቅድመ-ቅንብር',
      labelItems: 'ቁጥር',
      itemsValue_one: '{{count}} ከ {{total}} ቪዲዮ',
      itemsValue_other: '{{count}} ከ {{total}} ቪዲዮዎች',
      itemsValueAudio_one: '{{count}} ከ {{total}} ዘፈን',
      itemsValueAudio_other: '{{count}} ከ {{total}} ዘፈኖች'
    }
  },
  videoCard: {
    titlePlaceholder: 'በመጫን ላይ…'
  },
  queue: {
    header: 'የዳውንሎድ ተሰላፊ',
    toggleTitle: 'የዳውንሎድ ተሰላፊ ቀያይር',
    empty: 'የሚሰለፉት ዳውንሎዶች እዚህ ይታያሉ',
    noDownloads: 'ምንም ዳውንሎዶች የሉም።',
    activeCount: '{{count}} እያወረዱ · {{percent}}%',
    clear: 'አጽዳ',
    clearTitle: 'የተጠናቀቁ ዳውንሎዶችን አጽዳ',
    pauseAll: 'ሁሉንም አቁም',
    pauseAllTitle: 'ሁሉንም ንቁ ዳውንሎዶችን አቁም',
    cancelAll: 'ሁሉንም ሰርዝ',
    cancelAllTitle: 'ሁሉንም ንቁ እና በመጠባበቅ ላይ ያሉ ዳውንሎዶችን ሰርዝ',
    tip: 'ዳውንሎድዎ ከዚህ በታች ሰልፎ ነው — ሂደቱን ለመከታተል ማንኛውም ጊዜ ክፈት።',
    item: {
      doneAt: 'ተጠናቅቋል {{time}}',
      paused: 'ታቅፏል',
      defaultError: 'ዳውንሎድ ወድቋል',
      openUrl: 'URL ክፈት',
      pause: 'አቋርጥ',
      hold: 'አቆይ',
      resume: 'ቀጥል',
      cancel: 'ሰርዝ',
      remove: 'አስወግድ'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'ተገኝቷል',
    youHave: '— እርስዎ ያለዎት {{currentVersion}}',
    install: 'ጫን እና ዳግም ጀምር',
    downloading: 'እያወረዱ…',
    download: 'Download ↗',
    dismiss: 'የዝማኔ ሰሌዳ ዝጋ',
    copy: 'ትዕዛዝ ወደ ቅጂ ሰሌዳ ቅዳ',
    copied: 'ትዕዛዝ ወደ ቅጂ ሰሌዳ ተቀድቷል',
    installFailed: 'ዝማኔ አልተሳካም',
    retry: 'እንደገና ሞክር'
  },
  status: {
    preparingBinaries: 'ሁለዮሽ ፋይሎችን እያዘጋጁ…',
    mintingToken: 'YouTube ቶከን እያመረቱ…',
    remintingToken: 'ቶከን እንደገና እያመረቱ…',
    startingYtdlp: 'yt-dlp ሂደት እየጀመሩ…',
    downloadingMedia: 'ቪዲዮ እና ድምጽ እያወረዱ…',
    mergingFormats: 'ድምጽ እና ቪዲዮ እያዋሃዱ…',
    extractingAudio: 'ድምጽ እየቀየሩ…',
    convertingVideo: 'ቪዲዮ እየቀየሩ…',
    embeddingMetadata: 'ሜታዳታ እያካተቱ…',
    movingFiles: 'ፋይሎችን እያዘዋወሩ…',
    fetchingSubtitles: 'ንዑስ ርዕሶችን እያምጡ…',
    sleepingBetweenRequests: 'ፍጥነት ላለማቀዝ {{seconds}} ሰከንድ እየጠበቁ…',
    subtitlesFailed: 'ቪዲዮ ተቀምጧል — አንዳንድ ንዑስ ርዕሶች ሊዳውንሎድ አልቻሉም',
    cancelled: 'ዳውንሎድ ተሰርዟል',
    complete: 'ዳውንሎድ ተጠናቅቋል',
    usedExtractorFallback: 'ቀልל ቅናሽ ሞዴ ዳውንሎድ ተደርጓል — ይበልጥ አስተማማኝ ዳውንሎዶች ለማግኘት cookies.txt አዘጋጅ',
    ytdlpProcessError: 'yt-dlp ሂደት ስህተት: {{error}}',
    ytdlpExitCode: 'yt-dlp በኮድ {{code}} ወጥቷል',
    downloadingBinary: '{{name}} ሁለዮሽ ፋይል እያወረዱ…',
    unknownStartupFailure: 'ያልታወቀ ዳውንሎድ መጀመሪያ ወደቀ',
    diskSpaceInsufficient: 'በቂ የዲስክ ቦታ የለም — {{required}} ያስፈልጋል፣ {{free}} ብቻ አለ',
    fetchingSponsorBlock: 'SponsorBlock እያነጋገሩ…',
    retryingSponsorBlock: 'SponsorBlock አይገኝም፣ እንደገና እየሞከሩ ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'የቦት መከላከያ ተነሳ። የሚጠቀሙበት IP አድራሻ (የዳታ ሴንተር ክልል ወይም ተጨናንቆ VPN መውጫ) ምናልባት ምልክት ተደርጎበት ሊሆን ይችላል። IP አድራሻዎን ይቀይሩ ወይም ሌላ VPN ነጥብ ይምረጡ ከዚያ እንደገና ሞክሩ። አሁንም ካልሰራ፣ ይህ ጊዜያዊ የYouTube ወገን ለውጥ ሊሆን ይችላል — Arroxy በጅምር yt-dlp ራሱን ያዘምናል፣ ስለዚህ upstream ሲያስተካክለው ማስተካከያው ራሱ ይደርሳል።',
      ipBlock: 'IP አድራሻዎ YouTube ያገደ ይመስላል። ቆየት ብሎ እንደገና ሞክሩ ወይም VPN ጠቀሙ።',
      rateLimit: 'YouTube ጥያቄዎችን እየገደበ ነው። አንድ ደቂቃ ቆይቶ እንደገና ሞክሩ።',
      ageRestricted: 'ይህ ቪዲዮ ዕድሜ-ተገደቧል ያለ የገቡ መለያ ሊዳውንሎድ አይችልም።',
      unavailable: 'ይህ ቪዲዮ አይገኝም — ምናልባት የግል፣ ተሰርዟል ወይም ክልል-ተዘግቷል።',
      geoBlocked: 'ይህ ቪዲዮ በክልልዎ አይገኝም።',
      outOfDiskSpace: 'በቂ ዲስክ ቦታ የለም። ቦታ ፍቱ እና እንደገና ሞክሩ።',
      unsupportedUrl: 'ይህ እንደ ቪዲዮ URL አይመስልም። YouTube ቪዲዮ፣ Short፣ ወይም የዝርዝር አገናኝ ለጥፍ።',
      chunkTransferFailure: 'አገልጋዩ ውርዱን ደጋግሞ ሲያቋርጥ yt-dlp እንደገና ከሞከረ በኋላ ሰጥቷል። ይህ ብዙ ጊዜ ትልቁን የቪዲዮ ቅርጸቶች (4K HDR / ከፍተኛ bitrate VP9) ይነካል። እንደገና ሞክሩ፣ አውታረ መረብ/VPN ይቀይሩ፣ ወይም ዝቅተኛ ጥራት ቅርጸት ይምረጡ።',
      postprocessFailure: 'yt-dlp ማውረዱን ጨርሷል ነገር ግን ድህረ-ሂደት (merge / mux / convert) አልተሳካም። ብዙውን ጊዜ ይህ ጊዜያዊ የffmpeg ችግር ነው — እንደገና ሞክሩ፣ ችግሩ ከቀጠለ ሌላ የቅርጸት ጥምረት ሞክሩ።',
      parse: 'ከጣቢያው የተመለሰውን ምላሽ መፈታት አልተቻለም። የyt-dlp extractor ጊዜ ያለፈበት ሊሆን ይችላል። Arroxy በሚነሳበት ጊዜ yt-dlp ን በራስ-ሰር ያዘምነዋል — እርማቱ እንደተለቀቀ በጥቂት ደቂቃዎች ውስጥ እንደገና ሞክሩ።',
      network: 'የአውታረ መረብ ስህተት። ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።',
      drmProtected: 'ይህ ቪዲዮ DRM የተጠበቀ ነው። yt-dlp DRM ን ማስወገድ አይችልም፣ ስለዚህ ፋይሉ ሊዳውንሎድ አይቻልም።',
      loginRequired: 'ይህ ቪዲዮ ወደ ስርዓት የገባ መለያ ያስፈልገዋል። cookies.txt ያዋቅሩ (ቅንብሮች → Cookies) እና እንደገና ሞክሩ።',
      unknown: 'ማውረድ አልተሳካም። ከታች ያለውን raw output ይመልከቱ።'
    }
  },
  presets: {
    'best-quality': {
      label: 'ምርጥ ጥራት',
      desc: 'ከፍተኛ ጥራት + ምርጥ ድምጽ'
    },
    balanced: {
      label: 'ሚዛናዊ',
      desc: '720p ከፍ + ጥሩ ድምጽ'
    },
    'audio-only': {
      label: 'ድምጽ ብቻ',
      desc: 'ቪዲዮ የለም፣ ምርጥ ድምጽ'
    },
    'small-file': {
      label: 'ትንሽ ፋይል',
      desc: 'ዝቅተኛ ጥራት + ዝቅ ድምጽ'
    },
    'subtitle-only': {
      label: 'ንዑስ ርዕሶች ብቻ',
      desc: 'ቪዲዮ የለም፣ ድምጽ የለም፣ ንዑስ ርዕሶች ብቻ'
    }
  },
  playlistPresets: {
    type: { video: 'Video', audio: 'Audio' },
    videoFormat: {
      best: 'Best codec',
      mp4: 'MP4 (H.264)'
    },
    videoFormatDesc: {
      best: 'Highest available codec per item',
      mp4: 'H.264 + AAC preferred, MP4 container · best-effort'
    },
    tier: {
      best: 'Best quality',
      '2160': 'Up to 4K',
      '1440': 'Up to 1440p',
      '1080': 'Up to 1080p',
      '720': 'Up to 720p',
      '480': 'Up to 480p',
      '360': 'Up to 360p'
    },
    tierDesc: {
      best: 'Highest available video + audio per item',
      '2160': 'Capped at 2160p, falls back to lower per item',
      '1440': 'Capped at 2K, falls back to lower per item',
      '1080': 'Capped at 1080p, falls back to lower per item',
      '720': 'Smaller files, broad compatibility',
      '480': 'Low bandwidth',
      '360': 'Smallest video'
    },
    audioFormat: {
      best: 'Audio (best)',
      mp3: 'MP3',
      m4a: 'M4A',
      opus: 'Opus'
    },
    audioFormatDesc: {
      best: 'Native best audio, no re-encode',
      mp3: 'Convert to MP3',
      m4a: 'Convert to M4A (AAC)',
      opus: 'Convert to Opus'
    },
    audioFormatBitrate: 'Audio ({{format}} {{kbps}}K)',
    mp4Cap: 'H.264 above 1080p is not available on YouTube — capped to 1080p automatically'
  },
  formatLabel: {
    audioFallback: 'ድምጽ',
    audioOnlyDot: 'ድምጽ ብቻ · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'ሥራ አልባ',
      statusActive_one: '1 እያወረደ · {{percent}}%',
      statusActive_other: '{{count}} እያወረዱ · {{percent}}%',
      open: 'Arroxy ክፈት',
      quit: 'Arroxy ዝጋ'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} ዳውንሎድ እየሄደ ነው',
      message_other: '{{count}} ዳውንሎዶች እየሄዱ ናቸው',
      detail: 'መዝጋት ሁሉንም ዳውንሎዶች ይሰርዛል።',
      confirm: 'ዳውንሎዶችን ሰርዝ እና ዝጋ',
      keep: 'ዳውንሎዱን ቀጥል'
    },
    closeToTray: {
      message: 'Arroxy ሲዘጋ ወደ ትሬ ደብቅ?',
      detail: 'Arroxy ይሰራ ይቆያል ዳውንሎዶቹንም ያጠናቅቃል። ይህን ወደ ኋላ በከፍተኛ ቅንብሮች ይቀይሩ።',
      hide: 'ወደ ትሬ ደብቅ',
      quit: 'ዝጋ',
      remember: 'እንደገና አትጠይቅ'
    },
    rendererCrashed: {
      message: 'Arroxy ችግር አጋጥሟል',
      detail: 'የተቀጣጣሪ ሂደት ተቋርጧል ({{reason}})። ለማደስ ዳግም ጫን።',
      reload: 'ዳግም ጫን',
      quit: 'ዝጋ'
    }
  },
  networkPacing: {
    heading: 'ለዝቅ ያሉ ዳውንሎዶች',
    description: 'Arroxy ጣቢያን ከልክ ያለፈ ጥያቄ እንዳያደርግ እያንዳንዱ ዳውንሎድ ላይ ትናንሽ መጠበቂያዎችን ያክላል። ዋጋዎች በሰከንድ ነው (ካልተጠቀሰ)።',
    tooltip: 'እነዚህ መጠበቂያዎች ማሳወቂያ ዳውንሎዶች ውስጥ ይሆናሉ። Arroxy ተራ የሆኑ ዳውንሎዶችን አሁንም አንድ ባንድ ያስተዳድራል።',
    summary: 'መጠበቂያ: {{requests}} ምርምሮች መካከል፣ {{downloads}} ሚዲያ ከመጀመሩ በፊት፣ {{subtitles}} ንዑስ ርዕስ ፋይሎች በፊት። ግንኙነቶች: {{fragments}}።',
    presets: {
      off: {
        label: 'ጠፍ',
        description: 'Arroxy ለሚዲያ እና ንዑስ ርዕሶች የሚያቆየውን ትንሽ መሰረታዊ እረፍት ብቻ ይጠቀማል።'
      },
      balanced: {
        label: 'ሚዛናዊ',
        description: 'ነባሪ። አጫጭር እረፍቶችን ያክላል እና አንድ የዳውንሎድ ግንኙነት ይጠቀማል።'
      },
      careful: {
        label: 'ጥንቁቅ',
        description: 'ለትልልቅ playlists ወይም ቶሎ ቶሎ ገደብ ለሚያጋጥማቸው አውታሮች ረዥም እረፍቶችን ያክላል።'
      },
      custom: {
        label: 'ብጁ',
        description: 'የከፍተኛ ዳውንሎድ መቆጣጠሪያዎችን እራስዎ ያስተካክሉ።'
      }
    },
    fields: {
      sleepRequests: 'ምርምሮች መካከል መጠበቂያ',
      sleepInterval: 'ሚዲያ ከመጀመሩ በፊት እረፍት: ዝቅ.',
      maxSleepInterval: 'ሚዲያ ከመጀመሩ በፊት እረፍት: ከፍ.',
      concurrentFragments: 'የዳውንሎድ ግንኙነቶች'
    }
  },
  share: {
    title: 'Arroxy ያጋሩ',
    description: 'Arroxy ነፃ እና ክፍት ምንጭ ነው። ማጋራት ብዙ ሰዎች እንዲያገኙት ይረዳቸዋል።',
    copyLink: 'ሊንክ ቅዳ',
    copied: 'ተቀድቷል!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy አጋራ',
    footerLabel: 'አጋራ',
    shareAction: 'Arroxy አጋራ',
    inlineCard: {
      body: 'Arroxy ደስ ይለዎታል? ጠቃሚ ሊሆን ከሚችልለት ሰው ጋር ያጋሩት።',
      dismiss: 'የማጋሪያ ሀሳቡን አትኩረው'
    },
    highValueBanner: {
      body: 'Arroxy ደስ ይለዎታል? ሌሎች እንዲያገኙት ይርዷቸው።',
      dismiss: 'የማጋሪያ ሀሳቡን አትኩረው'
    }
  }
} as const;

export default am;
