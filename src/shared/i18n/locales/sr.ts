const sr = {
  common: {
    back: 'Назад',
    continue: 'Настави',
    retry: 'Покушај поново',
    startOver: 'Почни испочетка',
    loading: 'Учитавање…'
  },
  app: {
    feedback: 'Повратна информација',
    logs: 'Дневници',
    feedbackNudge: 'Свиђа ти се Arroxy? Радо бих чуо твоје мишљење! 💬',
    debugCopied: 'Копирано!',
    debugCopyTitle: 'Копирај информације за отклањање грешака (Electron, ОС, верзије Chrome-а)',
    zoomIn: 'Увећај',
    zoomOut: 'Умањи'
  },
  titleBar: {
    close: 'Затвори',
    minimize: 'Минимизуј',
    maximize: 'Максимизуј',
    restore: 'Врати'
  },
  splash: {
    greeting: 'Добродошао/ла назад!',
    warmup: 'Arroxy се покреће…',
    warning: 'Подешавање није завршено — неке функције можда неће радити'
  },
  theme: {
    light: 'Светла тема',
    dark: 'Тамна тема',
    system: 'Подразумевана системска'
  },
  language: {
    label: 'Језик'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Формат',
      subtitles: 'Титлови',
      sponsorblock: 'SponsorBlock',
      output: 'Излаз',
      folder: 'Сачувај',
      confirm: 'Потврди'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Подржава youtube.com и youtu.be линкове',
      fetchFormats: 'Учитај формате',
      mascotIdle: 'Убаци YouTube линк (видео или Short) — па кликни „Учитај формате" и крећемо ✨',
      mascotBusy: 'Преузимање у позадини… Умем да радим више ствари одједном 😎',
      advanced: 'Напредно',
      clearAria: 'Обриши URL',
      clipboard: {
        toggle: 'Прати клипборд',
        toggleDescription: 'Аутоматски попуни поље URL-а када копираш YouTube линк.',
        dialog: {
          title: 'Откривен YouTube URL',
          body: 'Да ли да користиш овај линк из клипборда?',
          useButton: 'Користи URL',
          disableButton: 'Онемогући',
          cancelButton: 'Откажи',
          disableNote: 'Праћење клипборда можеш поново укључити касније у Напредним подешавањима.'
        }
      },
      cookies: {
        toggle: 'Користи датотеку cookies',
        toggleDescription: 'Помаже са видеима са ограничењем старости, само за чланове и приватним видеима.',
        risk: 'Ризик: cookies.txt садржи сваку пријављену сесију за тај прегледач — чувај је приватном.',
        fileLabel: 'Датотека Cookies',
        choose: 'Изабери…',
        clear: 'Обриши',
        placeholder: 'Нема изабране датотеке',
        helpLink: 'Како да извезем cookies?',
        enabledButNoFile: 'Изабери датотеку да би користио/ла cookies',
        banWarning: 'YouTube може да означи — а понекад и забрани — налоге чији cookies користи yt-dlp. Ако је могуће, користи привремени налог.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Прусмери саобраћај кроз прокси — корисно за географски ограничен садржај.',
        placeholder: 'http://host:port',
        clear: 'Обриши'
      },
      closeToTray: {
        toggle: 'Сакриј у системски трај при затварању',
        toggleDescription: 'Настави преузимања у позадини после затварања прозора.'
      },
      analytics: {
        toggle: 'Пошаљи анонимне статистике коришћења',
        toggleDescription: 'Броји само покретања апликације. Без URL-ова, имена датотека или личних података.'
      }
    },
    subtitles: {
      heading: 'Титлови',
      autoBadge: 'Аутоматски',
      hint: 'Sidecar датотеке биће сачуване поред видеа',
      noLanguages: 'Нема доступних титлова за овај видео',
      skip: 'Прескочи',
      skipSubs: 'Прескочи за овај видео',
      selectAll: 'Изабери све',
      deselectAll: 'Поништи избор свих',
      mascot: 'Изабери нула, један или много — потпуно је на теби ✨',
      searchPlaceholder: 'Претражи језике…',
      noMatches: 'Нема пронађених језика',
      clearAll: 'Обриши све',
      noSelected: 'Нема изабраних титлова',
      selectedNote_one: '{{count}} титл ће бити преузет',
      selectedNote_other: '{{count}} титлова ће бити преузето',
      sectionManual: 'Ручно',
      sectionAuto: 'Аутоматски генерисано',
      saveMode: {
        heading: 'Сачувај као',
        sidecar: 'Поред видеа',
        embed: 'Уграђено у видео',
        subfolder: 'subtitles/ поддиректоријум'
      },
      format: {
        heading: 'Формат'
      },
      embedNote: 'Режим уградње чува излаз као .mkv тако да се титлови поуздано уграђују.',
      autoAssNote: 'Аутоматски титлови биће сачувани као SRT уместо ASS — увек се чисте од YouTube-овог rolling-cue дуплирања, које наш ASS конвертер не може да реплицира.'
    },
    sponsorblock: {
      modeHeading: 'Филтрирање спонзора',
      mode: {
        off: 'Искључено',
        mark: 'Означи као поглавља',
        remove: 'Уклони сегменте'
      },
      modeHint: {
        off: 'Без SponsorBlock-а — видео се пушта онако како је отпремљен.',
        mark: 'Означава спонзорске сегменте као поглавља (неразорно).',
        remove: 'Исеца спонзорске сегменте из видеа коришћењем FFmpeg-а.'
      },
      categoriesHeading: 'Категорије',
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
      quickPresets: 'Брзе поставке',
      video: 'Видео',
      audio: 'Звук',
      noAudio: 'Без звука',
      videoOnly: 'Само видео',
      audioOnly: 'Само звук',
      audioOnlyOption: 'Само звук (без видеа)',
      mascot: 'Најбоље + Најбоље = максималан квалитет. То бих ја изабрао!',
      sniffing: 'Тражим најбоље формате за тебе…',
      loadingHint: 'Обично траје секунду',
      loadingAria: 'Учитавање формата',
      sizeUnknown: 'Величина непозната',
      total: 'Укупно',
      convert: {
        label: 'Конвертуј',
        uncompressed: 'Конвертуј · некомпресовано',
        bitrate: 'Битрејт',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Конверзија звука захтева режим само-звука (поништи избор видеа).',
        requiresLossy: 'Изабран је нативни стрим — битрејт се примењује само при конверзији у mp3, m4a или opus.'
      }
    },
    folder: {
      heading: 'Сачувај у',
      downloads: 'Преузимања',
      videos: 'Филмови',
      desktop: 'Радна површина',
      music: 'Музика',
      documents: 'Документи',
      pictures: 'Слике',
      home: 'Почетна директоријум',
      custom: 'Прилагођено…',
      subfolder: {
        toggle: 'Сачувај у поддиректоријум',
        placeholder: 'нпр. lo-fi rips',
        invalid: 'Назив директоријума садржи неважеће знакове'
      }
    },
    output: {
      embedChapters: {
        label: 'Уграђена поглавља',
        description: 'Маркери поглавља доступни за навигацију у сваком савременом плејеру.'
      },
      embedMetadata: {
        label: 'Уграђени метаподаци',
        description: 'Наслов, извођач, опис и датум отпремања уписани у датотеку.'
      },
      embedThumbnail: {
        label: 'Уграђена сличица',
        description: 'Насловна слика унутар датотеке. MP4 / M4A само — прескаче се када су титлови уграђени.'
      },
      writeDescription: {
        label: 'Сачувај опис',
        description: 'Чува опис видеа као .description текстуалну датотеку поред преузимања.'
      },
      writeThumbnail: {
        label: 'Сачувај сличицу',
        description: 'Чува сличицу као .jpg датотеку слике поред преузимања.'
      }
    },
    confirm: {
      readyHeadline: 'Спремно за преузимање!',
      landIn: 'Твоја датотека ће бити сачувана у',
      labelVideo: 'Видео',
      labelAudio: 'Звук',
      labelSubtitles: 'Титлови',
      subtitlesNone: '—',
      labelSaveTo: 'Сачувај у',
      labelSize: 'Величина',
      sizeUnknown: 'Непознато',
      nothingToDownload: 'Поставка „само титлови" је активна, али није изабран ниједан језик — ништа неће бити преузето.',
      audioOnly: 'Само звук',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Покреће се када друга преузимања заврше — добија пун пропусни опсег',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'Покреће се одмах — ради упоредо са другим активним преузимањима'
    },
    error: {
      icon: 'Грешка'
    }
  },
  videoCard: {
    titlePlaceholder: 'Учитавање…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Ред за преузимање',
    toggleTitle: 'Прикажи/сакриј ред за преузимање',
    empty: 'Преузимања која додаш у ред ће се овде приказати',
    noDownloads: 'Нема преузимања.',
    activeCount: '{{count}} преузима · {{percent}}%',
    clear: 'Обриши',
    clearTitle: 'Обриши завршена преузимања',
    tip: 'Твоје преузимање је у реду испод — отвори у свако доба да пратиш напредак.',
    item: {
      doneAt: 'Завршено {{time}}',
      paused: 'Паузирано',
      defaultError: 'Преузимање није успело',
      openUrl: 'Отвори URL',
      pause: 'Паузирај',
      resume: 'Настави',
      cancel: 'Откажи',
      remove: 'Уклони'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'је доступно',
    youHave: '— тренутно имаш {{currentVersion}}',
    install: 'Инсталирај и Поново покрени',
    downloading: 'Преузимање…',
    download: 'Download ↗',
    dismiss: 'Одбаци обавештење о ажурирању',
    copy: 'Копирај команду у клипборд',
    copied: 'Команда је копирана у клипборд',
    installFailed: 'Ажурирање није успело',
    retry: 'Покушај поново'
  },
  status: {
    preparingBinaries: 'Припрема бинарних датотека…',
    mintingToken: 'Генерисање YouTube токена…',
    remintingToken: 'Поновно генерисање токена…',
    startingYtdlp: 'Покретање yt-dlp процеса…',
    downloadingMedia: 'Преузимање видеа и звука…',
    mergingFormats: 'Спајање звука и видеа…',
    fetchingSubtitles: 'Преузимање титлова…',
    sleepingBetweenRequests: 'Чекање {{seconds}}с да би се избегла ограничења брзине…',
    subtitlesFailed: 'Видео је сачуван — неки титлови нису могли бити преузети',
    cancelled: 'Преузимање је отказано',
    complete: 'Преузимање је завршено',
    usedExtractorFallback: 'Преузето са опуштеним ektraktором — подеси cookies.txt за поузданија преузимања',
    ytdlpProcessError: 'Грешка yt-dlp процеса: {{error}}',
    ytdlpExitCode: 'yt-dlp је завршио са кодом {{code}}',
    downloadingBinary: 'Преузимање {{name}} бинарне датотеке…',
    unknownStartupFailure: 'Непозната грешка при покретању преузимања'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube је означио овај захтев као бота. Покушај поново за тренутак.',
      ipBlock: 'Твоја IP адреса је блокирана од стране YouTube-а. Покушај касније или користи VPN.',
      rateLimit: 'YouTube ограничава захтеве. Сачекај минут па покушај поново.',
      ageRestricted: 'Овај видео је ограничен по старости и не може се преузети без пријављеног налога.',
      unavailable: 'Овај видео није доступан — можда је приватан, обрисан или ограничен по региону.',
      geoBlocked: 'Овај видео није доступан у твом региону.',
      outOfDiskSpace: 'Нема довољно простора на диску. Ослободи простор и покушај поново.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Најбољи квалитет',
      desc: 'Највиша резолуција + најбољи звук'
    },
    balanced: {
      label: 'Уравнотежено',
      desc: 'Максимум 720p + добар звук'
    },
    'audio-only': {
      label: 'Само звук',
      desc: 'Без видеа, најбољи звук'
    },
    'small-file': {
      label: 'Мала датотека',
      desc: 'Најнижа резолуција + низак квалитет звука'
    },
    'subtitle-only': {
      label: 'Само титлови',
      desc: 'Без видеа, без звука, само титлови'
    }
  },
  formatLabel: {
    audioOnly: 'Само звук',
    audioFallback: 'Звук',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Неактивно',
      statusActive_one: '1 преузима · {{percent}}%',
      statusActive_other: '{{count}} преузима · {{percent}}%',
      open: 'Отвори Arroxy',
      quit: 'Затвори Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} преузимање у току',
      message_other: '{{count}} преузимања у току',
      detail: 'Затварање ће отказати сва активна преузимања.',
      confirm: 'Откажи преузимања и Затвори',
      keep: 'Настави преузимање'
    },
    closeToTray: {
      message: 'Сакрити Arroxy у системски трај при затварању?',
      detail: 'Arroxy наставља да ради и завршава активна преузимања. Промени ово касније у Напредним подешавањима.',
      hide: 'Сакриј у трај',
      quit: 'Затвори',
      remember: 'Не питај поново'
    },
    rendererCrashed: {
      message: 'Arroxy је наишао на проблем',
      detail: 'Процес приказивача је пао ({{reason}}). Поново учитај да би покушао/ла поново.',
      reload: 'Поново учитај',
      quit: 'Затвори'
    }
  }
} as const;

export default sr;
