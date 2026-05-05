const sw = {
  common: {
    back: 'Rudi',
    continue: 'Endelea',
    retry: 'Jaribu tena',
    startOver: 'Anza upya',
    loading: 'Inapakia…'
  },
  app: {
    feedback: 'Maoni',
    logs: 'Kumbukumbu',
    feedbackNudge: 'Unafurahia Arroxy? Ningependa kusikia kutoka kwako! 💬',
    debugCopied: 'Imenakiliwa!',
    debugCopyTitle: 'Nakili maelezo ya utatuzi (matoleo ya Electron, OS, Chrome)',
    zoomIn: 'Kuza',
    zoomOut: 'Punguza'
  },
  titleBar: {
    close: 'Funga',
    minimize: 'Punguza',
    maximize: 'Panua',
    restore: 'Rejesha'
  },
  splash: {
    greeting: 'Hujambo, karibu tena!',
    warmup: 'Arroxy inajipanga…',
    warning: 'Usanidi haukukamilika — baadhi ya vipengele vinaweza visifanye kazi'
  },
  theme: {
    light: 'Hali ya mwanga',
    dark: 'Hali ya giza',
    system: 'Chaguo-msingi la mfumo'
  },
  language: {
    label: 'Lugha'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Umbizo',
      subtitles: 'Manukuu',
      sponsorblock: 'SponsorBlock',
      output: 'Matokeo',
      folder: 'Hifadhi',
      confirm: 'Thibitisha'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Inasaidia viungo vya youtube.com na youtu.be',
      fetchFormats: 'Pata maumbo',
      mascotIdle: 'Nipe kiungo cha YouTube (video au Short) — kisha bonyeza "Pata maumbo" nami nitaanza kazi ✨',
      mascotBusy: 'Inapakua nyuma ya pazia… Ninaweza kufanya mambo mengi kwa wakati mmoja 😎',
      advanced: 'Hali ya juu',
      clearAria: 'Futa URL',
      clipboard: {
        toggle: 'Angalia ubao wa kunakili',
        toggleDescription: 'Jaza sehemu ya URL kiotomatiki unaponakili kiungo cha YouTube.',
        dialog: {
          title: 'YouTube URL imegunduliwa',
          body: 'Tumia kiungo hiki kutoka kwenye ubao wako wa kunakili?',
          useButton: 'Tumia URL',
          disableButton: 'Zima',
          cancelButton: 'Ghairi',
          disableNote: 'Unaweza kuwezesha tena uangalifu wa ubao wa kunakili baadaye katika mipangilio ya Hali ya juu.'
        }
      },
      cookies: {
        toggle: 'Tumia faili ya vidakuzi',
        toggleDescription: 'Husaidia na video zilizozuiwa kwa umri, za wanachama peke yao, na za akaunti ya kibinafsi.',
        risk: 'Hatari: cookies.txt ina vikao vyote vilivyoingia kwa kivinjari hicho — weka siri.',
        fileLabel: 'Faili ya vidakuzi',
        choose: 'Chagua…',
        clear: 'Futa',
        placeholder: 'Hakuna faili iliyochaguliwa',
        helpLink: 'Ninasafirisha vidakuzi vipi?',
        enabledButNoFile: 'Chagua faili kutumia vidakuzi',
        banWarning: 'YouTube inaweza kufunga — na wakati mwingine kupiga marufuku — akaunti ambazo vidakuzi vyake vinatumiwa na yt-dlp. Tumia akaunti ya majaribio iwezekanavyo.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Peleka trafiki kupitia proksi — muhimu kwa maudhui yenye vizuizi vya kijiografia.',
        placeholder: 'http://host:port',
        clear: 'Futa'
      },
      closeToTray: {
        toggle: 'Ficha kwenye tray ukifunga',
        toggleDescription: 'Endelea kupakua nyuma ya pazia baada ya kufunga dirisha.'
      },
      analytics: {
        toggle: 'Tuma takwimu za matumizi zisizo na jina',
        toggleDescription: 'Huhesabu tu uzinduzi wa programu. Hakuna URL, majina ya faili, au data za kibinafsi.'
      }
    },
    subtitles: {
      heading: 'Manukuu',
      autoBadge: 'Otomatiki',
      hint: 'Faili za sidecar zitahifadhiwa karibu na video',
      noLanguages: 'Hakuna manukuu yanayopatikana kwa video hii',
      skip: 'Ruka',
      skipSubs: 'Ruka kwa video hii',
      selectAll: 'Chagua yote',
      deselectAll: 'Futa uchaguzi wote',
      mascot: 'Chagua sufuri, moja, au mengi — inategemea wewe kabisa ✨',
      searchPlaceholder: 'Tafuta lugha…',
      noMatches: 'Hakuna lugha zinazolingana',
      clearAll: 'Futa yote',
      noSelected: 'Hakuna manukuu yaliyochaguliwa',
      selectedNote_one: 'Manukuu {{count}} yatapakiwa',
      selectedNote_other: 'Manukuu {{count}} yatapakiwa',
      sectionManual: 'Ya mkono',
      sectionAuto: 'Yaliyoundwa otomatiki',
      saveMode: {
        heading: 'Hifadhi kama',
        sidecar: 'Karibu na video',
        embed: 'Ingiza kwenye video',
        subfolder: 'subtitles/ saraka ndogo'
      },
      format: {
        heading: 'Umbizo'
      },
      embedNote: 'Hali ya kuingiza inahifadhi matokeo kama .mkv ili nyimbo za manukuu ziingizwe kwa uaminifu.',
      autoAssNote: 'Maandishi ya otomatiki yatahifadhiwa kama SRT badala ya ASS — husafishwa daima kutokana na urudiaji wa kielelezo cha YouTube, ambao kibadilishaji chetu cha ASS bado hakiwezi kunakili.'
    },
    sponsorblock: {
      modeHeading: 'Uchujaji wa mdhamini',
      mode: {
        off: 'Zima',
        mark: 'Weka alama kama sura',
        remove: 'Ondoa sehemu'
      },
      modeHint: {
        off: 'Hakuna SponsorBlock — video inacheza kama ilivyopakiwa.',
        mark: 'Inaweka alama sehemu za mdhamini kama sura (bila uharibifu).',
        remove: 'Hukata sehemu za mdhamini kutoka kwenye video kwa kutumia FFmpeg.'
      },
      categoriesHeading: 'Kategoria',
      cat: {
        sponsor: 'Mdhamini',
        intro: 'Utangulizi',
        outro: 'Mwisho',
        selfpromo: 'Kujitangaza',
        music_offtopic: 'Music off-topic',
        preview: 'Muhtasari',
        filler: 'Kijazio'
      }
    },
    formats: {
      quickPresets: 'Mipangilio ya haraka',
      video: 'Video',
      audio: 'Sauti',
      noAudio: 'Hakuna sauti',
      videoOnly: 'Video peke yake',
      audioOnly: 'Sauti peke yake',
      audioOnlyOption: 'Sauti peke yake (bila video)',
      mascot: 'Bora + Bora = ubora wa juu zaidi. Ningechagua hivyo!',
      sniffing: 'Natafuta maumbo bora kwako…',
      loadingHint: 'Kawaida huchukua sekunde moja',
      loadingAria: 'Inapakia maumbo',
      sizeUnknown: 'Ukubwa haujulikani',
      total: 'Jumla',
      convert: {
        label: 'Badilisha',
        uncompressed: 'Badilisha · isiyoshinikizwa',
        bitrate: 'Kiwango cha biti',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Ubadilishaji wa sauti unahitaji hali ya sauti peke yake (ondoa chaguo la video).',
        requiresLossy: 'Mkondo wa asili umechaguliwa — kiwango cha biti kinatumika tu unapobadilisha kuwa mp3, m4a, au opus.'
      }
    },
    folder: {
      heading: 'Hifadhi kwenye',
      downloads: 'Vipakuliwa',
      videos: 'Sinema',
      desktop: 'Eneo kazi',
      music: 'Muziki',
      documents: 'Hati',
      pictures: 'Picha',
      home: 'Nyumbani',
      custom: 'Maalum…',
      subfolder: {
        toggle: 'Hifadhi ndani ya saraka ndogo',
        placeholder: 'mfano lo-fi rips',
        invalid: 'Jina la saraka lina herufi batili'
      }
    },
    output: {
      embedChapters: {
        label: 'Ingiza sura',
        description: 'Alama za sura zinazoweza kuabiriwa katika kichezaji chochote cha kisasa.'
      },
      embedMetadata: {
        label: 'Ingiza metadata',
        description: 'Kichwa, msanii, maelezo, na tarehe ya kupakia vimeandikwa kwenye faili.'
      },
      embedThumbnail: {
        label: 'Ingiza picha ndogo',
        description: 'Sanaa ya jalada ndani ya faili. MP4 / M4A peke yake — hupitishwa wakati manukuu yanaingizwa.'
      },
      writeDescription: {
        label: 'Hifadhi maelezo',
        description: 'Inahifadhi maelezo ya video kama faili ya maandishi ya .description karibu na kipakuliwa.'
      },
      writeThumbnail: {
        label: 'Hifadhi picha ndogo',
        description: 'Inahifadhi picha ndogo kama faili ya picha ya .jpg karibu na kipakuliwa.'
      }
    },
    confirm: {
      readyHeadline: 'Iko tayari kupakua!',
      landIn: 'Faili yako itawekwa kwenye',
      labelVideo: 'Video',
      labelAudio: 'Sauti',
      labelSubtitles: 'Manukuu',
      subtitlesNone: '—',
      labelSaveTo: 'Hifadhi kwenye',
      labelSize: 'Ukubwa',
      sizeUnknown: 'Haijulikani',
      nothingToDownload: 'Mpangilio wa manukuu peke yake umewashwa lakini hakuna lugha ya manukuu iliyochaguliwa — hakuna kitakachopakiwa.',
      audioOnly: 'Sauti peke yake',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Inaanza vipakuzi vingine vikishamaliza — inapata upanuzi kamili',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'Inaanza mara moja — inafanya kazi pamoja na vipakuzi vingine vinavyofanya kazi'
    },
    error: {
      icon: 'Hitilafu'
    }
  },
  videoCard: {
    titlePlaceholder: 'Inapakia…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Foleni ya Kupakua',
    toggleTitle: 'Geuza foleni ya kupakua',
    empty: 'Vipakuzi unavyoweka kwenye foleni vitaonekana hapa',
    noDownloads: 'Hakuna vipakuzi bado.',
    activeCount: '{{count}} inapakua · {{percent}}%',
    clear: 'Futa',
    clearTitle: 'Futa vipakuzi vilivyokamilika',
    tip: 'Kipakuliwa chako kimewekwa kwenye foleni hapa chini — fungua wakati wowote kufuatilia maendeleo.',
    item: {
      doneAt: 'Imekamilika {{time}}',
      paused: 'Imesimamishwa',
      defaultError: 'Upakuaji umeshindwa',
      openUrl: 'Fungua URL',
      pause: 'Simamisha',
      resume: 'Endelea',
      cancel: 'Ghairi',
      remove: 'Ondoa'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'inapatikana',
    youHave: '— una {{currentVersion}}',
    install: 'Sakinisha na Uanzishe Upya',
    downloading: 'Inapakua…',
    download: 'Download ↗',
    dismiss: 'Funga bango la sasisho',
    copy: 'Nakili amri kwenye ubao wa kunakili',
    copied: 'Amri imenakiliwa kwenye ubao wa kunakili',
    installFailed: 'Sasisho limeshindwa',
    retry: 'Jaribu tena'
  },
  status: {
    preparingBinaries: 'Inaandaa faili za binary…',
    mintingToken: 'Inatengeneza tokeni ya YouTube…',
    remintingToken: 'Inatengeneza upya tokeni…',
    startingYtdlp: 'Inaanzisha mchakato wa yt-dlp…',
    downloadingMedia: 'Inapakua video na sauti…',
    mergingFormats: 'Inachanganya sauti na video…',
    fetchingSubtitles: 'Inapata manukuu…',
    sleepingBetweenRequests: 'Inasubiri sekunde {{seconds}} kuepuka vikwazo vya kiwango…',
    subtitlesFailed: 'Video imehifadhiwa — baadhi ya manukuu hayakuweza kupakuliwa',
    cancelled: 'Upakuaji umeghairiwa',
    complete: 'Upakuaji umekamilika',
    usedExtractorFallback: 'Imepakiwa kwa kiboreshaji laini — weka cookies.txt kwa upakuaji wa kuaminika zaidi',
    ytdlpProcessError: 'Hitilafu ya mchakato wa yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp ilitoka na msimbo {{code}}',
    downloadingBinary: 'Inapakua binary ya {{name}}…',
    unknownStartupFailure: 'Kushindwa kwa kuanzisha pasijulikane'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube iliashiria ombi hili kama boti. Jaribu tena baada ya muda mfupi.',
      ipBlock: 'Anwani yako ya IP inaonekana kuzuiwa na YouTube. Jaribu tena baadaye au tumia VPN.',
      rateLimit: 'YouTube inazuia maombi. Subiri dakika moja kisha ujaribu tena.',
      ageRestricted: 'Video hii ina kikwazo cha umri na haiwezi kupakuliwa bila akaunti iliyoingia.',
      unavailable: 'Video hii haipatikani — inaweza kuwa ya kibinafsi, imefutwa, au imezuiwa kwa mkoa.',
      geoBlocked: 'Video hii haipatikani katika eneo lako.',
      outOfDiskSpace: 'Nafasi ya diski haitoshi. Futa nafasi na ujaribu tena.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Ubora bora',
      desc: 'Azimio la juu zaidi + sauti bora'
    },
    balanced: {
      label: 'Uwiano',
      desc: '720p kiwango cha juu + sauti nzuri'
    },
    'audio-only': {
      label: 'Sauti peke yake',
      desc: 'Hakuna video, sauti bora'
    },
    'small-file': {
      label: 'Faili ndogo',
      desc: 'Azimio la chini + sauti ya chini'
    },
    'subtitle-only': {
      label: 'Manukuu peke yake',
      desc: 'Hakuna video, hakuna sauti, manukuu peke yake'
    }
  },
  formatLabel: {
    audioOnly: 'Sauti peke yake',
    audioFallback: 'Sauti',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Tulivu',
      statusActive_one: '1 inapakua · {{percent}}%',
      statusActive_other: '{{count}} zinapakua · {{percent}}%',
      open: 'Fungua Arroxy',
      quit: 'Funga Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: 'Upakuaji {{count}} unaendelea',
      message_other: 'Vipakuzi {{count}} vinavyoendelea',
      detail: 'Kufunga kutafuta vipakuzi vyote vinavyofanya kazi.',
      confirm: 'Ghairi Vipakuzi na Toka',
      keep: 'Endelea Kupakua'
    },
    closeToTray: {
      message: 'Ficha Arroxy kwenye tray ya mfumo ukifunga?',
      detail: 'Arroxy inaendelea kufanya kazi na kukamilisha vipakuzi vinavyofanya kazi. Badilisha hii baadaye katika mipangilio ya Hali ya juu.',
      hide: 'Ficha kwenye tray',
      quit: 'Toka',
      remember: 'Usiulize tena'
    },
    rendererCrashed: {
      message: 'Arroxy imekutana na tatizo',
      detail: 'Mchakato wa uonyeshaji umeanguka ({{reason}}). Pakia upya ujaribu tena.',
      reload: 'Pakia upya',
      quit: 'Toka'
    }
  }
} as const;

export default sw;
