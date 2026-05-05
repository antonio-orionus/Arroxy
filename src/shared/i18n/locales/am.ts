const am = {
  common: {
    back: 'ተመለስ',
    continue: 'ቀጥል',
    retry: 'እንደገና ሞክር',
    startOver: 'ከመጀመሪያ ጀምር',
    loading: 'በመጫን ላይ…'
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
  titleBar: {
    close: 'ዝጋ',
    minimize: 'አሳንስ',
    maximize: 'አሰፋ',
    restore: 'መልስ'
  },
  splash: {
    greeting: 'እንኳን ደህና መጡ!',
    warmup: 'Arroxy እየሞቀ ነው…',
    warning: 'ማዋቀር አልተጠናቀቀም — አንዳንድ ባህሪያት ላይሰሩ ይችላሉ'
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
      formats: 'ቅርጸት',
      subtitles: 'ንዑስ ርዕሶች',
      sponsorblock: 'SponsorBlock',
      output: 'ውፅዓት',
      folder: 'አስቀምጥ',
      confirm: 'አረጋግጥ'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com እና youtu.be አገናኞችን ይደግፋል',
      fetchFormats: 'ቅርጸቶችን ጫን',
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
        toggle: 'የ cookies ፋይል ጠቀም',
        toggleDescription: 'ዕድሜ-ተገደበ፣ አባላት-ብቻ እና የግል ቪዲዮዎችን ያግዛል።',
        risk: 'አደጋ: cookies.txt ለዚያ አሳሽ ሁሉንም የገቡ ስሬቶች ይዟል — ይጠብቁ።',
        fileLabel: 'Cookies ፋይል',
        choose: 'ምረጥ…',
        clear: 'አጽዳ',
        placeholder: 'ምንም ፋይል አልተመረጠም',
        helpLink: 'cookies ስዴት እንዴት ነው?',
        enabledButNoFile: 'cookies ለመጠቀም ፋይል ምረጥ',
        banWarning: 'YouTube cookies ያለ yt-dlp ጥቅም ላይ ሲውሉ መለያዎችን ሊያግድ ይችላል። የሚጥሉ መለያ ይጠቀሙ።',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'ትራፊክን በፕሮክሲ ለማስተላለፍ — በጂኦ-ተከልካይ ይዘት ለሚጠቀሙ ጠቃሚ።',
        placeholder: 'http://host:port',
        clear: 'አጽዳ'
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
      heading: 'ንዑስ ርዕሶች',
      autoBadge: 'ራስ-ሰር',
      hint: 'ሳይድካር ፋይሎች ከቪዲዮው ጎን ይቀመጣሉ',
      noLanguages: 'ለዚህ ቪዲዮ ምንም ንዑስ ርዕሶች የሉም',
      skip: 'ዝለለ',
      skipSubs: 'ለዚህ ቪዲዮ ዝለለ',
      selectAll: 'ሁሉ ምረጥ',
      deselectAll: 'ሁሉ ምርጫ ሰርዝ',
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
      loadingHint: 'ብዙውን ጊዜ ሰከንድ ይወስዳል',
      loadingAria: 'ቅርጸቶችን በመጫን ላይ',
      sizeUnknown: 'መጠን አይታወቅም',
      total: 'ጠቅላላ',
      convert: {
        label: 'ቀይር',
        uncompressed: 'ቀይር · ያልተጨመቀ',
        bitrate: 'ቢትሬት',
        wavLabel: 'WAV (ያልተጨመቀ)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'የድምጽ ቅርጸት ለወጥ ድምጽ-ብቻ ሁነታ ያስፈልጋል (የቪዲዮ ምርጫውን ሰርዝ)።',
        requiresLossy: 'የቀጥታ ዥረት ተመርጧል — ቢትሬት የሚሰራው ወደ mp3፣ m4a፣ ወይም opus ሲቀይሩ ብቻ ነው።'
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
      audioOnly: 'ድምጽ ብቻ',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'ሌሎች ዳውንሎዶች ሲጠናቀቁ ይጀምራል — ሙሉ ባንድዊድዝ ያገኛል',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'ወዲያው ይጀምራል — ከሌሎች ዳውንሎዶች ጋር ይሰራል'
    },
    error: {
      icon: 'ስህተት'
    }
  },
  videoCard: {
    titlePlaceholder: 'በመጫን ላይ…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'የዳውንሎድ ተሰላፊ',
    toggleTitle: 'የዳውንሎድ ተሰላፊ ቀያይር',
    empty: 'የሚሰለፉት ዳውንሎዶች እዚህ ይታያሉ',
    noDownloads: 'ምንም ዳውንሎዶች የሉም።',
    activeCount: '{{count}} እያወረዱ · {{percent}}%',
    clear: 'አጽዳ',
    clearTitle: 'የተጠናቀቁ ዳውንሎዶችን አጽዳ',
    tip: 'ዳውንሎድዎ ከዚህ በታች ሰልፎ ነው — ሂደቱን ለመከታተል ማንኛውም ጊዜ ክፈት።',
    item: {
      doneAt: 'ተጠናቅቋል {{time}}',
      paused: 'ታቅፏል',
      defaultError: 'ዳውንሎድ ወድቋል',
      openUrl: 'URL ክፈት',
      pause: 'አቋርጥ',
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
    fetchingSubtitles: 'ንዑስ ርዕሶችን እያምጡ…',
    sleepingBetweenRequests: 'ፍጥነት ላለማቀዝ {{seconds}} ሰከንድ እየጠበቁ…',
    subtitlesFailed: 'ቪዲዮ ተቀምጧል — አንዳንድ ንዑስ ርዕሶች ሊዳውንሎድ አልቻሉም',
    cancelled: 'ዳውንሎድ ተሰርዟል',
    complete: 'ዳውንሎድ ተጠናቅቋል',
    usedExtractorFallback: 'ቀልל ቅናሽ ሞዴ ዳውንሎድ ተደርጓል — ይበልጥ አስተማማኝ ዳውንሎዶች ለማግኘት cookies.txt አዘጋጅ',
    ytdlpProcessError: 'yt-dlp ሂደት ስህተት: {{error}}',
    ytdlpExitCode: 'yt-dlp በኮድ {{code}} ወጥቷል',
    downloadingBinary: '{{name}} ሁለዮሽ ፋይል እያወረዱ…',
    unknownStartupFailure: 'ያልታወቀ ዳውንሎድ መጀመሪያ ወደቀ'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube ይህን ጥያቄ እንደ ቦት ምልክት አደረጉ። ቅጽበት ቆይቶ እንደገና ሞክሩ።',
      ipBlock: 'IP አድራሻዎ YouTube ያገደ ይመስላል። ቆየት ብሎ እንደገና ሞክሩ ወይም VPN ጠቀሙ።',
      rateLimit: 'YouTube ጥያቄዎችን እየገደበ ነው። አንድ ደቂቃ ቆይቶ እንደገና ሞክሩ።',
      ageRestricted: 'ይህ ቪዲዮ ዕድሜ-ተገደቧል ያለ የገቡ መለያ ሊዳውንሎድ አይችልም።',
      unavailable: 'ይህ ቪዲዮ አይገኝም — ምናልባት የግል፣ ተሰርዟል ወይም ክልል-ተዘግቷል።',
      geoBlocked: 'ይህ ቪዲዮ በክልልዎ አይገኝም።',
      outOfDiskSpace: 'በቂ ዲስክ ቦታ የለም። ቦታ ፍቱ እና እንደገና ሞክሩ።'
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
  formatLabel: {
    audioOnly: 'ድምጽ ብቻ',
    audioFallback: 'ድምጽ',
    audioOnlyDot: 'Audio only · {{audio}}',
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
  }
} as const;

export default am;
