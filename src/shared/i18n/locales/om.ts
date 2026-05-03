const om = {
  common: {
    back: 'Duubatti',
    continue: 'Itti fufi',
    retry: 'Irra deebi\'i',
    startOver: 'Jalqabbii irra deebi\'i',
    loading: 'Fe\'amaa jira…'
  },
  app: {
    feedback: 'Yaada',
    logs: 'Galmee',
    feedbackNudge: 'Arroxy si gammachiisaa jiraa? Yaada kee dhaga\'uu barbaada! 💬',
    debugCopied: 'Koopii ta\'e!',
    debugCopyTitle: 'Odeeffannoo dhibdee koopii godhi (Electron, OS, Chrome versiiwwan)',
    zoomIn: 'Guddisi',
    zoomOut: 'Xiqqeessi'
  },
  titleBar: {
    close: 'Cufii',
    minimize: 'Xiqqeessi',
    maximize: 'Guddisi',
    restore: 'Deebi\'si'
  },
  splash: {
    greeting: 'Baga nagaan deebitee!',
    warmup: 'Arroxy qophaa\'aa jira…',
    warning: 'Qindaa\'inni hin xumuramne — feetii tokko tokko hojjechuu dhiisuu dandanda\'u'
  },
  theme: {
    light: 'Haala iftoomaa',
    dark: 'Haala gurraacha',
    system: 'Sirna durtii'
  },
  language: {
    label: 'Afaan'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Foormaatii',
      subtitles: 'Axxiinni',
      sponsorblock: 'SponsorBlock',
      output: 'Ba\'uu',
      folder: 'Kuusi',
      confirm: 'Mirkaneessi'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Liinkii youtube.com fi youtu.be ni deeggara',
      fetchFormats: 'Foormaatii fidi',
      mascotIdle: 'Liinkii YouTube naaf ergi (viidiyoo ykn Short) — achiin "Foormaatii fidi" cuqaasi ✨',
      mascotBusy: 'Duubaan buusaa jira… rakkoo guguddaa hojjechuuf dandeessa 😎',
      advanced: 'Ammayyaa',
      clearAria: 'URL qulqulleessi',
      clipboard: {
        toggle: 'Kliipboordii hordofi',
        toggleDescription: 'Liinkii YouTube koopii gootee booda dirree URL ofumaan guuti.',
        dialog: {
          title: 'YouTube URL argame',
          body: 'Liinkii kana kliipboordii kee irraa fayyadamduu?',
          useButton: 'URL fayyadami',
          disableButton: 'Dhaabbi',
          cancelButton: 'Haqi',
          disableNote: 'Hordoffii kliipboordii booda Qindaa\'inoota Ammayyaa keessatti deebi\'sitee dandeessa.'
        }
      },
      cookies: {
        toggle: 'Faayilii cookies fayyadami',
        toggleDescription: 'Viidiyoowwan umuriin-daangeffame, miseensota-qofaaf, fi dhuunfaa ta\'e ni gargaara.',
        risk: 'Balaa: cookies.txt seensa browser sanaa hunda qaba — dhuunfaa ta\'ee eegi.',
        fileLabel: 'Faayilii Cookies',
        choose: 'Filadhu…',
        clear: 'Qulqulleessi',
        placeholder: 'Faayilii hin filanne',
        helpLink: 'Akkamitti cookies erga?',
        enabledButNoFile: 'Cookies fayyadamuuf faayilii filadhu',
        banWarning: 'YouTube akkawntoota cookies yt-dlp waliin fayyadaman mallatteessuu fi yeroo tokko tokko dhowwuu danda\'a. Yoo danda\'ame akkawuntii yeroo fayyadami.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      closeToTray: {
        toggle: 'Cufuun dura tiiree dhoksi',
        toggleDescription: 'Daawniloodii booda gubbaan cufamuu itti fufi.'
      },
      analytics: {
        toggle: 'Tilastoo faayidaa maqaa-malee ergaa',
        toggleDescription: 'Jalqabbii app qofa lakkaawa. URL, maqaa faayilii, ykn daataa dhuunfaa hin qabatu.'
      }
    },
    subtitles: {
      heading: 'Axxiinni',
      autoBadge: 'Ofumaa',
      hint: 'Faayiloonni saidikaar viidiyoo cinaa ni kuufamu',
      noLanguages: 'Viidiyoo kanaaf axxiinni hin jiru',
      skip: 'Irri cabi',
      skipSubs: 'Viidiyoo kana irra cabi',
      selectAll: 'Hunda filadhu',
      deselectAll: 'Hunda filatame haquu',
      mascot: 'Tokko, lama ykn baay\'ee filadhu — si irratti hundaa\'a ✨',
      searchPlaceholder: 'Afaanota barbaadi…',
      noMatches: 'Afaan hin argatamne',
      clearAll: 'Hunda qulqulleessi',
      noSelected: 'Axxiinni hin filamine',
      selectedNote_one: 'Axxiinni {{count}} ni buufama',
      selectedNote_other: 'Axxiinnota {{count}} ni buufamu',
      sectionManual: 'Harkaan',
      sectionAuto: 'Ofumaan uumame',
      saveMode: {
        heading: 'Akkamitti kuusi',
        sidecar: 'Viidiyoo cinaa',
        embed: 'Viidiyoo keessatti maksi',
        subfolder: 'subtitles/ saab-foldarii'
      },
      format: {
        heading: 'Foormaatii'
      },
      embedNote: 'Haalli makuun ba\'insa .mkv ta\'ee kuusaa fi kuunni sirnaan makama.',
      autoAssNote: 'Waxaleen ofumaan uumaman ASS osoo hin ta\'in SRT ta\'ee ni kuufamu — yeroo hundaa YouTube\'s rolling-cue duplication\'n qulqulleeffama.'
    },
    sponsorblock: {
      modeHeading: 'Dhiibbaa gurmeessuu',
      mode: {
        off: 'Dhaabbi',
        mark: 'Boqonnaa ta\'ee mallattaa\'i',
        remove: 'Kutaalee haquu'
      },
      modeHint: {
        off: 'SponsorBlock hin jiru — viidiyoon akka fe\'ametti taphatama.',
        mark: 'Kutaalee dhiibbaa boqonnaa ta\'ee mallattaa\'a (miidhaa hin qabne).',
        remove: 'FFmpeg fayyadamuun kutaalee dhiibbaa muqa.'
      },
      categoriesHeading: 'Caasaalee',
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
      quickPresets: 'Qophii ariifatoo',
      video: 'Viidiyoo',
      audio: 'Sagalee',
      noAudio: 'Sagalee hin jiru',
      videoOnly: 'Viidiyoo qofa',
      audioOnly: 'Sagalee qofa',
      audioOnlyOption: 'Sagalee qofa (viidiyoo hin jiru)',
      mascot: 'Caalmaa + Caalmaa = qulqullina ol\'aanaa. Sana filadha!',
      sniffing: 'Foormaatii caalmaa si barbaachisu barbaaduun jira…',
      loadingHint: 'Yeroo baay\'ee sekoondii fudhata',
      loadingAria: 'Foormaatii fe\'amaa jira',
      sizeUnknown: 'Bal\'inni hin beekamne',
      total: 'Waliigala'
    },
    folder: {
      heading: 'Kuusi gara',
      downloads: 'Buufata',
      videos: 'Filimii',
      desktop: 'Desktop',
      music: 'Muuziqaa',
      documents: 'Sanadoota',
      pictures: 'Suuraalee',
      home: 'Mana',
      custom: 'Ofiin kaa\'i…',
      subfolder: {
        toggle: 'Saab-foldarii keessatti kuusi',
        placeholder: 'fkn lo-fi rips',
        invalid: 'Maqaan foldarii mallattoolee sirrii hin qabu'
      }
    },
    output: {
      embedChapters: {
        label: 'Boqonnaa maksi',
        description: 'Mallattooleen boqonnaa taphataa ammayyaa kamiyyuu keessatti hojjetu.'
      },
      embedMetadata: {
        label: 'Metadata maksi',
        description: 'Mata-duree, artist, ibsa, fi guyyaan fe\'ame faayilii keessatti barreeffama.'
      },
      embedThumbnail: {
        label: 'Thumbnail maksi',
        description: 'Suuraa haguugduu faayilii keessa. MP4 / M4A qofa — axxiinni makamuun dura ni darba.'
      },
      writeDescription: {
        label: 'Ibsa kuusi',
        description: 'Ibsa viidiyoo .description faayilii barreeffamaa ta\'ee daawniloodii cinaa ni kuusa.'
      },
      writeThumbnail: {
        label: 'Thumbnail kuusi',
        description: 'Thumbnail .jpg faayilii suuraa ta\'ee daawniloodii cinaa ni kuusa.'
      }
    },
    confirm: {
      readyHeadline: 'Buusuuf qophii dha!',
      landIn: 'Faayilin kee bakka kanatti bu\'a',
      labelVideo: 'Viidiyoo',
      labelAudio: 'Sagalee',
      labelSubtitles: 'Axxiinni',
      subtitlesNone: '—',
      labelSaveTo: 'Kuusi gara',
      labelSize: 'Bal\'ina',
      sizeUnknown: 'Hin beekamne',
      nothingToDownload: 'Qophiin axxiinni qofa hojjechaa jira garuu afaan hin filamine — waan buufamu hin jiru.',
      audioOnly: 'Sagalee qofa',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Daawniloodoonni biroo xumuramu booda jalqaba — bandwidth guutuu argata',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'Immediately jalqaba — daawniloodoonni biroo waliin hojjeta'
    },
    error: {
      icon: 'Dogoggora'
    }
  },
  videoCard: {
    titlePlaceholder: 'Fe\'amaa jira…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Tartiiba Daawniloodii',
    toggleTitle: 'Tartiiba daawniloodii jijjiiri',
    empty: 'Daawniloodoonni si tartiibsiiftan asitti mul\'atu',
    noDownloads: 'Daawniloodii hin jiru.',
    activeCount: '{{count}} buufamaa jira · {{percent}}%',
    clear: 'Qulqulleessi',
    clearTitle: 'Daawniloodoonni xumuraman haquu',
    tip: 'Daawniloodiin kee tartiiba asii gaditti jira — yeroo kamiyyuu bani irratti hordofi.',
    item: {
      doneAt: 'Xumurame {{time}}',
      paused: 'Dhaabbe',
      defaultError: 'Daawniloodii kufe',
      openUrl: 'URL bani',
      pause: 'Dhaabi',
      resume: 'Itti fufi',
      cancel: 'Haqi',
      remove: 'Balleessi'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'ni argama',
    youHave: '— kan qabdu {{currentVersion}}',
    install: 'Facaalikee fi Deebi\'i jalqabi',
    downloading: 'Buufamaa jira…',
    download: 'Download ↗',
    dismiss: 'Baanara haaraa cufii',
    copy: 'Ajaja kliipboorditti koopii godhi',
    copied: 'Ajajni kliipboorditti koopii ta\'e'
  },
  status: {
    preparingBinaries: 'Faayiloota binaryii qopheessaa jira…',
    mintingToken: 'Tookenii YouTube uumaa jira…',
    remintingToken: 'Tookenii irra deebi\'ee uumaa jira…',
    startingYtdlp: 'Prosessii yt-dlp jalqabaa jira…',
    downloadingMedia: 'Viidiyoo fi sagalee buufaa jira…',
    mergingFormats: 'Sagalee fi viidiyoo walitti makaa jira…',
    fetchingSubtitles: 'Axxiinni fidaa jira…',
    sleepingBetweenRequests: 'Dhiibbaa oolfachuuf sekoondii {{seconds}} eegaa jira…',
    subtitlesFailed: 'Viidiyoon kuufame — axxiinnota tokko tokko buufachuu hin danda\'amne',
    cancelled: 'Daawniloodii haqame',
    complete: 'Daawniloodii xumurame',
    usedExtractorFallback: 'Haala laafaa ta\'een buufame — daawniloodii amanamuuf cookies.txt qopheessi',
    ytdlpProcessError: 'Dogoggora prosessii yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp koodii {{code}} wajjin bahe',
    downloadingBinary: 'Faayilii binaryii {{name}} buufaa jira…',
    unknownStartupFailure: 'Daawniloodii jalqabbii hin beekamne kufee'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube gaaffii kana bot\'tti mallattesse. Daqiiqaa tokko booda irra deebi\'i.',
      ipBlock: 'Teessoon IP kee YouTube\'n cufamuu mala. Yeroo booda irra deebi\'i ykn VPN fayyadami.',
      rateLimit: 'YouTube gaaffii daangeessaa jira. Daqiiqaa tokko eegi achiin irra deebi\'i.',
      ageRestricted: 'Viidiyoon kun umuriin-daangeffamee seensa malee buufachuu hin danda\'u.',
      unavailable: 'Viidiyoon kun hin argamu — dhuunfaa, haqame, ykn naannoo-cufaa ta\'uu mala.',
      geoBlocked: 'Viidiyoon kun naanno kee keessatti hin argamu.',
      outOfDiskSpace: 'Bakki disikii gahaa hin jiru. Bakka duwwaa godhi achiin irra deebi\'i.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Qulqullina ol\'aanaa',
      desc: 'Firiimii ol\'aanaa + sagalee caalmaa'
    },
    balanced: {
      label: 'Walsimu',
      desc: '720p ol\'aanaa + sagalee gaarii'
    },
    'audio-only': {
      label: 'Sagalee qofa',
      desc: 'Viidiyoo hin jiru, sagalee caalmaa'
    },
    'small-file': {
      label: 'Faayilii xiqqaa',
      desc: 'Firiimii gadi aanaa + sagalee gadi aanaa'
    },
    'subtitle-only': {
      label: 'Axxiinni qofa',
      desc: 'Viidiyoo hin jiru, sagalee hin jiru, axxiinni qofa'
    }
  },
  formatLabel: {
    audioOnly: 'Sagalee qofa',
    audioFallback: 'Sagalee',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Boqachaa',
      statusActive_one: '1 buufamaa jira · {{percent}}%',
      statusActive_other: '{{count}} buufamaa jiru · {{percent}}%',
      open: 'Arroxy bani',
      quit: 'Arroxy cufii'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: 'Daawniloodii {{count}} adeemaa jira',
      message_other: 'Daawniloodoonni {{count}} adeemaa jiru',
      detail: 'Cufuun daawniloodoonni hundi haqama.',
      confirm: 'Daawniloodii Haqi fi Cufii',
      keep: 'Daawniloodii itti fufi'
    },
    closeToTray: {
      message: 'Cufuun Arroxy tiiree irratti dhoksi?',
      detail: 'Arroxy hojjechuuf itti fufa daawniloodoonnis xumurama. Booda Qindaa\'inoota Ammayyaa keessatti jijjiiri.',
      hide: 'Tiiree irratti dhoksi',
      quit: 'Cufii',
      remember: 'Gara fuula duraatti hin gaafatin'
    }
  }
} as const;

export default om;
