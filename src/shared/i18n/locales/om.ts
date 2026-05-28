const om = {
  common: {
    back: 'Duubatti',
    continue: 'Itti fufi',
    retry: "Irra deebi'i",
    startOver: "Jalqabbii irra deebi'i"
  },
  app: {
    feedback: 'Yaada',
    logs: 'Galmee',
    feedbackNudge: "Arroxy si gammachiisaa jiraa? Yaada kee dhaga'uu barbaada! 💬",
    debugCopied: "Koopii ta'e!",
    debugCopyTitle: 'Odeeffannoo dhibdee koopii godhi (Electron, OS, Chrome versiiwwan)',
    zoomIn: 'Guddisi',
    zoomOut: 'Xiqqeessi'
  },
  about: {
    button: "Waa'ee",
    openTitle: "Waa'ee Arroxy",
    tagline: 'Buufataa viidiyoo fi sagalee ariifataa fi miidhaaginaan desktop irratti.',
    websiteLink: 'Marsariitii',
    githubLink: 'GitHub',
    licenseLine: 'Heeyyama MIT · by Antonio Orionus',
    thirdPartyNotices: 'Beeksisa seera-biroo ilaali'
  },
  titleBar: {
    close: 'Cufii',
    minimize: 'Xiqqeessi',
    maximize: 'Guddisi',
    restore: "Deebi'si"
  },
  splash: {
    greeting: 'Baga nagaan deebitee!',
    warmup: "Arroxy qophaa'aa jira…",
    downloading: '{{binary}} buufatamaa jira…',
    warmupFailedNoDiag: "Qindaa'inni hin milkoofne. Bal'ina argachuuf galmee qindaa'inaa bani."
  },
  repair: {
    title: "Qindaa'inni gargaarsa kee gaafata",
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: "Mirkaneeffachuu hin danda'amne.",
      downloadFailed: "Buufachuun hin milkoofne. Walqunnamtii interneetii kee ilaalii achiin irra deebi'i.",
      extractFailed: "Baasuu arkaayivii hin milkoofne. Buufanni miidhaa qabaachuu danda'a — irra deebi'i.",
      hashFailed: "Faayilii buufamame irratti walsimuun checksum hin milkoofne. Buufaa irra deebi'i.",
      spawnFailed: "Faayiliin hin argamne ykn jalqabuu hin danda'amne. Kopii hojjetu filadhu.",
      permissionDenied: "Sirnichi faayilii hojjechuuf dide. Amantaa qabdu kopii filadhu ykn akka admin irra deebi'i.",
      blockedOrQuarantined: "Windowsiin faayilii dhorkate (SmartScreen / Defender). Kopii fe'ame filadhu ykn foldarii runtime irratti whitelist godhi.",
      badExitCode: "Faayiliin binaryii --version irratti deebii hin kenneef. Miidhaa qabaachuu ykn build dogoggoraa ta'uu danda'a.",
      timeout: "Madaalliin version yeroo darbe. Faayilichii hin deebiin jiraachuu danda'a — irra deebi'i.",
      pairIncomplete: "ffmpeg fi ffprobe lachuu waloon pair ta'ee qindaa'uu qabu."
    },
    actions: {
      chooseExecutable: 'Faayilii hojjetu filadhu',
      resetToDefault: "Durtii irra deebi'i",
      retrySetup: "Qindaa'inaa irra deebi'i yaali",
      cancel: 'Haqdhaabi',
      openDependencyFolder: 'Foldarii hirmaannaa bani',
      viewSetupLog: "Galmee qindaa'inaa ilaali"
    }
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
      playlistItems: 'Playlist',
      playlistPresets: 'Qulqullina',
      formats: 'Foormaatii',
      subtitles: 'Axxiinni',
      sponsorblock: 'SponsorBlock',
      output: "Ba'uu",
      folder: 'Kuusi',
      confirm: 'Mirkaneessi'
    },
    playlist: {
      heading: 'Wantoota Playlist',
      itemCount_one: '{{count}} viidiyoo',
      itemCount_other: '{{count}} viidiyoowwan',
      itemCountAudio_one: '{{count}} weellaa',
      itemCountAudio_other: '{{count}} weellaalee',
      selectAll: 'Hunda filadhu',
      selectNone: 'Tokkollee hin filin',
      rangeFrom: 'Irraa',
      rangeTo: 'Gara',
      rangeApply: 'Daangaa hojiirra oolchi',
      selectedCount_one: '{{count}} filatame',
      selectedCount_other: '{{count}} filataman',
      noSelection: 'Itti fufuuf viidiyoo tokko yoo xiqqaate filadhu',
      loadingItems: 'Playlist fidaa jira…',
      thumbnailAlt: 'Thumbnail viidiyoo',
      durationUnknown: 'kallattii'
    },
    playlistPresets: {
      heading: 'Kutaa gurmuu barbaadi',
      subhead: 'Viidiyoon hundi sadarkaa filatame ofumaan qorata — playlist garagaraa sodaa malee hojjeta.',
      itemCount_one: '{{count}} wanta',
      itemCount_other: '{{count}} wantota'
    },
    mixedPrompt: {
      title: 'Liinkin kun Playlist qaba',
      body: 'Viidiyoo tokko kana filadda, moo Playlist keessaa barbaadda? Viidiyoowwan addaddaa yookaan kutaa filattu itti aanu.',
      singleVideo: 'Kana qofa',
      pickFromPlaylist: 'Playlist keessaa filadhu'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'Foormaatii fidi',
      features: {
        heading: "Arroxy maal buufachuu danda'a",
        youtube: {
          heading: 'YouTube',
          video: 'Viidiyoowwan',
          channel: 'Channelota',
          playlist: 'Playlists',
          short: 'Shorts',
          music: 'Muuziqaa',
          podcast: 'Podcastota'
        },
        anySite: {
          heading: 'Gareewwan 2000+',
          video: 'Viidiyoowwan',
          videoPlaylist: 'Playlist viidiyoo',
          musicPlaylist: 'Playlist muuziqaa'
        },
        always: {
          heading: 'Yeroo hundaa ni argama',
          audioOnly: 'Sagalee qofa',
          subtitles: 'Axxiinni'
        }
      },
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
          disableNote: "Hordoffii kliipboordii booda Qindaa'inoota Ammayyaa keessatti deebi'sitee dandeessa."
        }
      },
      cookies: {
        sourceLabel: 'Madda Cookies',
        sourceOff: 'Dhaabbi',
        sourceFile: 'Faayilii',
        sourceBrowser: 'Browser',
        toggleDescription: "Viidiyoowwan umuriin-daangeffame, miseensota-qofaaf, fi dhuunfaa ta'e ni gargaara.",
        risk: "Balaa: cookies.txt seensa browser sanaa hunda qaba — dhuunfaa ta'ee eegi.",
        fileLabel: 'Faayilii Cookies',
        choose: 'Filadhu…',
        clear: 'Qulqulleessi',
        placeholder: 'Faayilii hin filanne',
        helpLink: 'Akkamitti cookies erga?',
        enabledButNoFile: 'Cookies fayyadamuuf faayilii filadhu',
        browserLabel: 'Browser',
        browserPlaceholder: 'Browser filadhu…',
        browserHelp: 'Cookies browser irraa kallattiin dubbisa. Chromium-gosa browser cufamuu qaba.',
        enabledButNoBrowser: 'Cookies fayyadamuuf browser filadhu',
        banWarning: "YouTube akkawntoota cookies yt-dlp waliin fayyadaman mallatteessuu fi yeroo tokko tokko dhowwuu danda'a. Yoo danda'ame akkawuntii yeroo fayyadami.",
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt LOCALLY argadhu (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Geejjiba proxy darbii ergi — qabiyyee mootummaan dhorge argachuuf gargaara.',
        placeholder: 'http://host:port',
        clear: 'Haquu'
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
      autoBadge: 'Ofumaa',
      noLanguages: 'Viidiyoo kanaaf axxiinni hin jiru',
      skip: 'Irri cabi',
      skipSubs: 'Viidiyoo kana irra cabi',
      mascot: "Tokko, lama ykn baay'ee filadhu — si irratti hundaa'a ✨",
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
      embedNote: "Haalli makuun ba'insa .mkv ta'ee kuusaa fi kuunni sirnaan makama.",
      autoAssNote: "Waxaleen ofumaan uumaman ASS osoo hin ta'in SRT ta'ee ni kuufamu — yeroo hundaa YouTube's rolling-cue duplication'n qulqulleeffama."
    },
    sponsorblock: {
      modeHeading: 'Dhiibbaa gurmeessuu',
      mode: {
        off: 'Dhaabbi',
        mark: "Boqonnaa ta'ee mallattaa'i",
        remove: 'Kutaalee haquu'
      },
      modeHint: {
        off: "SponsorBlock hin jiru — viidiyoon akka fe'ametti taphatama.",
        mark: "Kutaalee dhiibbaa boqonnaa ta'ee mallattaa'a (miidhaa hin qabne).",
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
      mascot: "Caalmaa + Caalmaa = qulqullina ol'aanaa. Sana filadha!",
      sniffing: 'Foormaatii caalmaa si barbaachisu barbaaduun jira…',
      loadingHint: "Qorannoon xumuramuu hanga eegtu — playlist fi barbaacha yeroo fudhachuu danda'a.",
      loadingAria: "Foormaatii fe'amaa jira",
      sizeUnknown: "Bal'inni hin beekamne",
      total: 'Waliigala',
      skipToConfirm: "Mirkaneessaatti ce'i",
      skipToConfirmTooltip: "Filannoowwan kee kan olkaawaman tarkaanfiiwwan hafan hundaaf fayyadama. Qindaa'ina jijjiiruf, tarkaanfii tarkaanfiin itti fufii — filannoon kee yeroo itti aanuuf olkaawama.",
      keepAudio: 'Akka jirutti eegi',
      keepAudioMeta: 'Sagalee keessoo',
      convert: {
        label: 'Jijjiiri',
        uncompressed: 'Jijjiiri · cuqxaa hin taane',
        bitrate: 'Saaffata bitii',
        wavLabel: 'WAV (cuqxaa hin taane)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Jijjiirraa sagalee haala sagalee-qofa (filannoo viidiyoo haqi) gaafata.',
        requiresLossy: 'Tarreessa uumamaa filatameera — saaffatni bitii yoo mp3, m4a, ykn opus keessatti jijjiiramu qofa hojiirra oola.'
      },
      botWall: {
        heading: 'YouTube qorannoo kana daangeessee jira',
        bodyUnconfigured: "Tarreessi foormaatii guutuu ta'uu dhiisuu danda'a. Qindaa'inoota ammayyaa keessatti cookies qopheessi, ykn netwoorkii jijjiiri achiin irra deebi'i.",
        bodyDisabled: "Cookies qindaa'eera garuu dhaabbe jira. Tarreessa guutuu argachuuf cookies dandeessii achiin irra deebi'i, ykn netwoorkii jijjiiri achiin irra deebi'i.",
        bodyEnabled: "Cookies waliin illee, YouTube qorannoo kana daangeessee jira. Booda irra deebi'i ykn netwoorkii jijjiiri.",
        retryCta: "Irra deebi'i",
        enableRetryCta: "Cookies dandeessii achiin irra deebi'i"
      },
      cookiesError: {
        heading: "Cookies sababa ta'uu danda'a",
        currentModeLabel: 'Madda Cookies',
        currentModeFile: 'Faayilii',
        currentModeBrowser: 'Browser',
        explanationFile: "Faayilin cookies kee duwwaa, yeroon darbee, ykn foormaatii dogoggoraa ta'uu danda'a (yt-dlp Netscape cookies.txt eega). Cookies irra deebi'ii ergi, faayilii biraa filadhu, Browser haala jijjiiri, ykn cookies dhaabbi.",
        explanationBrowser: "Cookies browser irraa kallattiin dubbifama. Browser yoo amma hojjechaa jiraate, kuusaa cookies isaa cufamuu danda'a (Chromium-gosa). Browser YouTube keessattis seenuu qaba. Browser cufadhu, browser biraa jijjiiri, Faayilii haala jijjiiri, ykn cookies dhaabbi.",
        openSettingsCta: "Qindaa'inoota cookies bani",
        needsCookies: {
          heading: 'Gareewwan kun seensa gaafata',
          body: "yt-dlp viidiyoo kana mirkaneessuu malee argachuu hin danda'u. Qindaa'inoota ammayyaa keessatti cookies qopheessi — browser seenite irra qeensi, ykn faayilii cookies.txt galchi."
        },
        dpapi: {
          heading: "Cookies Chrome'ii farsimaa Windows'n cufame",
          explanation: "Chrome 127 fi itti aanu cookies'a appoonii biroon Windows irratti dubbisuu hin dandeenye ta'een farsima. Furmaata armaan gadii keessaa tokko yaali.",
          fixFirefoxLabel: 'Firefox fayyadami',
          fixFirefoxBody: "Firefox App-Bound Encryption hin fayyadamu. Qindaa'inoota cookies bani achiin tarree browser keessaa Firefox filadhu.",
          fixFileLabel: 'cookies.txt ergi',
          fixFileBody: 'Cookies Chrome irraa extension browser waliin ergi, achiin app kana haala Faayilii jijjiiri achiin faayilii ergame filadhu.',
          fixUnsafeLabel: 'App-Bound Encryption dhaabbatee Chrome jalqabi',
          fixUnsafeBody: "--disable-features=LockProfileCookieDatabase gabaabduu jalqabbii Chrome'tti dabaluu. Akeekkachiisa: kunis cookies duraan farsimaman haquu waan taasiseef gareewwan hundarraa ba'uuf fi deebisanii seenuuf dirqisiifama.",
          docsLinkLabel: 'yt-dlp sanadoota (dhimma #10927)'
        }
      }
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
      custom: "Ofiin kaa'i…",
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
        description: "Mata-duree, artist, ibsa, fi guyyaan fe'ame faayilii keessatti barreeffama."
      },
      embedThumbnail: {
        label: 'Thumbnail maksi',
        description: 'Suuraa haguugduu faayilii keessa. MP4 / M4A qofa — axxiinni makamuun dura ni darba.'
      },
      writeDescription: {
        label: 'Ibsa kuusi',
        description: "Ibsa viidiyoo .description faayilii barreeffamaa ta'ee daawniloodii cinaa ni kuusa."
      },
      writeThumbnail: {
        label: 'Thumbnail kuusi',
        description: "Thumbnail .jpg faayilii suuraa ta'ee daawniloodii cinaa ni kuusa."
      }
    },
    confirm: {
      readyHeadline: 'Buusuuf qophii dha!',
      landIn: "Faayilin kee bakka kanatti bu'a",
      labelVideo: 'Viidiyoo',
      labelAudio: 'Sagalee',
      labelSubtitles: 'Axxiinni',
      subtitlesNone: '—',
      labelSaveTo: 'Kuusi gara',
      labelSize: "Bal'ina",
      sizeUnknown: 'Hin beekamne',
      nothingToDownload: 'Qophiin axxiinni qofa hojjechaa jira garuu afaan hin filamine — waan buufamu hin jiru.',
      thumbnailEmbedNotSupported: "Thumbnail embed ni dhiifame — container bu'aa embed hin deeggarre.",
      subtitleEmbedAudioOnly: 'Subtitle embed gara sidecar jijjiirameera — tarreewwan sagalee tartiiba subtitle embed hin deeggaran.',
      audioOnly: 'Sagalee qofa',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Daawniloodoonni biroo xumuramu booda jalqaba — bandwidth guutuu argata',
      pullIt: 'Buusi! ↓',
      pullItTooltip: 'Immediately jalqaba — daawniloodoonni biroo waliin hojjeta',
      labelPlaylist: 'Playlist',
      labelPreset: 'Preset',
      labelItems: 'Wantota',
      itemsValue_one: '{{count}} fi {{total}} keessaa viidiyoo',
      itemsValue_other: '{{count}} fi {{total}} keessaa viidiyoowwan',
      itemsValueAudio_one: '{{count}} fi {{total}} keessaa weellaa',
      itemsValueAudio_other: '{{count}} fi {{total}} keessaa weellaalee'
    }
  },
  videoCard: {
    titlePlaceholder: "Fe'amaa jira…"
  },
  queue: {
    header: 'Tartiiba Daawniloodii',
    toggleTitle: 'Tartiiba daawniloodii jijjiiri',
    empty: "Daawniloodoonni si tartiibsiiftan asitti mul'atu",
    noDownloads: 'Daawniloodii hin jiru.',
    activeCount: '{{count}} buufamaa jira · {{percent}}%',
    clear: 'Qulqulleessi',
    clearTitle: 'Daawniloodoonni xumuraman haquu',
    pauseAll: 'Hunda gidduu dhabi',
    pauseAllTitle: 'Daawniloodoonni hunda qabsoo jiran gidduu dhabi',
    cancelAll: 'Hunda addaan kuti',
    cancelAllTitle: 'Daawniloodoonni hunda qabsoo jiran fi eegaa jiran addaan kuti',
    tip: 'Daawniloodiin kee tartiiba asii gaditti jira — yeroo kamiyyuu bani irratti hordofi.',
    item: {
      doneAt: 'Xumurame {{time}}',
      paused: 'Dhaabbe',
      defaultError: 'Daawniloodii kufe',
      openUrl: 'URL bani',
      pause: 'Dhaabi',
      hold: 'Eegi',
      resume: 'Itti fufi',
      cancel: 'Haqi',
      remove: 'Balleessi'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'ni argama',
    youHave: '— kan qabdu {{currentVersion}}',
    install: "Facaalikee fi Deebi'i jalqabi",
    downloading: 'Buufamaa jira…',
    download: 'Download ↗',
    dismiss: 'Baanara haaraa cufii',
    copy: 'Ajaja kliipboorditti koopii godhi',
    copied: "Ajajni kliipboorditti koopii ta'e",
    installFailed: 'Haaromsuun hin milkoofne',
    retry: "Irra deebi'i yaali"
  },
  status: {
    preparingBinaries: 'Faayiloota binaryii qopheessaa jira…',
    mintingToken: 'Tookenii YouTube uumaa jira…',
    remintingToken: "Tookenii irra deebi'ee uumaa jira…",
    startingYtdlp: 'Prosessii yt-dlp jalqabaa jira…',
    downloadingMedia: 'Viidiyoo fi sagalee buufaa jira…',
    mergingFormats: 'Sagalee fi viidiyoo walitti makaa jira…',
    extractingAudio: 'Sagalee jijjiiramaa jira…',
    convertingVideo: 'Viidiyoo jijjiiramaa jira…',
    embeddingMetadata: 'Metadata maksamaa jira…',
    movingFiles: 'Faayiloota daddabarsamaa jira…',
    fetchingSubtitles: 'Axxiinni fidaa jira…',
    sleepingBetweenRequests: 'Dhiibbaa oolfachuuf sekoondii {{seconds}} eegaa jira…',
    subtitlesFailed: "Viidiyoon kuufame — axxiinnota tokko tokko buufachuu hin danda'amne",
    cancelled: 'Daawniloodii haqame',
    complete: 'Daawniloodii xumurame',
    usedExtractorFallback: "Haala laafaa ta'een buufame — daawniloodii amanamuuf cookies.txt qopheessi",
    ytdlpProcessError: 'Dogoggora prosessii yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp koodii {{code}} wajjin bahe',
    downloadingBinary: 'Faayilii binaryii {{name}} buufaa jira…',
    unknownStartupFailure: 'Daawniloodii jalqabbii hin beekamne kufee',
    diskSpaceInsufficient: 'Bakki kuusaa gahaa miti — {{required}} barbaachisa, {{free}} qofa jira',
    fetchingSponsorBlock: 'SponsorBlock waliin qunnamtii godhamaa jira…',
    retryingSponsorBlock: "SponsorBlock hin argamne, irra deebi'ii yaalamuutti jira ({{attempt}}/{{total}})…"
  },
  errors: {
    ytdlp: {
      botBlock: "Eegumsa bot ka'eera. IP fayyadamaa jirtu naannoo datacenter ykn VPN baay'ee fayyadamame irraa ta'uu mala — IP kee jijjiiri ykn VPN endpoint biraa filadhu achiin irra deebi'i. Yoo itti fufe dhabamsiisuu baate, jijjiirra yeroo gabaabaadhaaf YouTube gama ta'uu danda'a — Arroxy jalqabbii irratti yt-dlp ofumaan haaromsa, kanaaf fooyyessaan olka'iinsa irra ga'ee booda ofumaan ni dhufaa.",
      ipBlock: "Teessoon IP kee YouTube'n cufamuu mala. Yeroo booda irra deebi'i ykn VPN fayyadami.",
      rateLimit: "YouTube gaaffii daangeessaa jira. Daqiiqaa tokko eegi achiin irra deebi'i.",
      ageRestricted: "Viidiyoon kun umuriin-daangeffamee seensa malee buufachuu hin danda'u.",
      unavailable: "Viidiyoon kun hin argamu — dhuunfaa, haqame, ykn naannoo-cufaa ta'uu mala.",
      geoBlocked: 'Viidiyoon kun naanno kee keessatti hin argamu.',
      outOfDiskSpace: "Bakki disikii gahaa hin jiru. Bakka duwwaa godhi achiin irra deebi'i.",
      unsupportedUrl: 'Kunis URL viidiyoo fakkaata miti. YouTube viidiyoo, Short, ykn playlist liinkii maxxansi.',
      chunkTransferFailure: "Sarvarri buufannaa giddu-galeessatti kuteera, yt-dlp irra deebi'uun yaale booddee kufe. Kun baay'inaan foormaatii viidiyoo guddoo (4K HDR / VP9 bitrate olaanaa) irratti mul'ata. Irra deebi'i, network/VPN jijjiiri, ykn foormaatii qulqullina xiqqaa ta'e filadhu.",
      postprocessFailure: "yt-dlp buufannaa xumuree, garuu post-processing (merge / mux / convert) hin milkoofne. Kun yeroo baay'ee rakkoo ffmpeg yeroo gabaabaa ti — irra deebi'i, yoo itti fufe walitti makamuu foormaatii biraa yaali.",
      parse: "Deebii saayitii irraa dhufe parse gochuun hin danda'amne. Extractor yt-dlp jijjiiramuu mala. Arroxy yeroo banamu yt-dlp ofumaan haaressa — daqiiqaa muraasa booda fooyya'iinsi yeroo ba'u irra deebi'i.",
      network: "Dogoggora network. Walqunnamtii kee mirkaneessi ergasii irra deebi'i.",
      drmProtected: "Viidiyoon kun DRM-iin eegama. yt-dlp DRM haquu hin danda'u, kanaafuu faayilichi buufachuu hin danda'amu.",
      loginRequired: "Viidiyoon kun seensa gaafata. cookies.txt qopheessi (Qindaa'inoota → Cookies) achiin irra deebi'i.",
      unknown: 'Buufannaan kufe. Bu’aa raaw’aa armaan gadii ilaali.'
    }
  },
  presets: {
    'best-quality': {
      label: "Qulqullina ol'aanaa",
      desc: "Firiimii ol'aanaa + sagalee caalmaa"
    },
    balanced: {
      label: 'Walsimu',
      desc: "720p ol'aanaa + sagalee gaarii"
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
  playlistPresets: {
    'video-best': { label: "Qulqullina ol'aanaa", desc: 'Viidiyoo fi sagalee ol aanaa hunda wanta hundaaf' },
    'video-2160p': { label: 'Hanga 4K', desc: "Hanga 2160p, gadi aanaatti deebi'a wanta hundaaf" },
    'video-1440p': { label: 'Hanga 1440p', desc: "Hanga 2K, gadi aanaatti deebi'a wanta hundaaf" },
    'video-1080p': { label: 'Hanga 1080p', desc: "Wanta hundaaf daangeffame, gadi aanaatti deebi'a" },
    'video-720p': { label: 'Hanga 720p', desc: "Faayilii xiqqaa, walii galteen bal'aa" },
    'video-480p': { label: 'Hanga 480p', desc: 'Intarneetii gadi aanaa' },
    'video-360p': { label: 'Hanga 360p', desc: 'Viidiyoo xiqqaa' },
    'audio-best': { label: 'Audio (caalmaa)', desc: 'Sagalee caalmaa uumamaa, irra deebi hojii hin qabu' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'MP3 192 kbps tti jijjiiri' }
  },
  formatLabel: {
    audioFallback: 'Sagalee',
    audioOnlyDot: 'Sagalee qofa · {{audio}}',
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
      detail: "Arroxy hojjechuuf itti fufa daawniloodoonnis xumurama. Booda Qindaa'inoota Ammayyaa keessatti jijjiiri.",
      hide: 'Tiiree irratti dhoksi',
      quit: 'Cufii',
      remember: 'Gara fuula duraatti hin gaafatin'
    },
    rendererCrashed: {
      message: 'Arroxy rakkoo mudateera',
      detail: "Prosessiin renderer kufee ({{reason}}). Irra deebi'uuf fe'adhu.",
      reload: "Fe'adhu",
      quit: 'Cufii'
    }
  },
  share: {
    title: 'Arroxy Qoodi',
    description: "Arroxy bilisaa fi madda-banaadha. Qoodun namoota baay'ee argachuu ni gargaara.",
    copyLink: 'Hidhata garagalchi',
    copied: 'Garagalfame!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy qoodi',
    footerLabel: 'Qoodi',
    shareAction: 'Arroxy qoodi',
    inlineCard: {
      body: "Arroxy si gammachiisaa jiraa? Namaa faayidaa qabu ta'uu danda'u wajjin qoodi.",
      dismiss: 'Yaada qooduu haqdhaabi'
    },
    highValueBanner: {
      body: 'Arroxy si gammachiisaa jiraa? Namoota biroo argachuu gargaari.',
      dismiss: 'Yaada qooduu haqdhaabi'
    }
  }
} as const;

export default om;
