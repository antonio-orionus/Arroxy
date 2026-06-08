const sr = {
  common: {
    back: 'Назад',
    cancel: 'Откажи',
    continue: 'Настави',
    retry: 'Покушај поново',
    startOver: 'Почни испочетка'
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
  about: {
    button: 'О апликацији',
    openTitle: 'О апликацији Arroxy',
    tagline: 'Брз и пријатан преузимач видеа и звука за рачунар.',
    websiteLink: 'Веб-сајт',
    githubLink: 'GitHub',
    licenseLine: 'Лиценца MIT · by Antonio Orionus',
    thirdPartyNotices: 'Прикажи обавештења о компонентама трећих страна'
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
    downloading: 'Преузимање {{binary}}…',
    warmupFailedNoDiag: 'Подешавање није успело. Отвори дневник подешавања за детаље.'
  },
  repair: {
    title: 'Подешавању је потребна твоја помоћ',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'Није могло да се провери.',
      downloadFailed: 'Преузимање није успело. Провери интернет везу и покушај поново.',
      extractFailed: 'Распакивање архиве није успело. Преузимање може бити оштећено — покушај поново.',
      hashFailed: 'Контролна сума преузете датотеке се не подудара. Поново преузми датотеку.',
      spawnFailed: 'Датотека недостаје или не може да се покрене. Изабери исправну копију.',
      permissionDenied: 'Систем је одбио да покрене датотеку. Изабери копију којој верујеш или покушај поново као администратор.',
      blockedOrQuarantined: 'Windows је блокирао датотеку (SmartScreen / Defender). Изабери инсталирану копију или додај runtime фолдер на белу листу.',
      badExitCode: 'Бинарни фајл није одговорио на --version. Можда је оштећен или погрешна верзија.',
      timeout: 'Провера верзије је истекла. Датотека можда виси — покушај поново.',
      pairIncomplete: 'ffmpeg и ffprobe морају бити постављени заједно као усклађени пар.'
    },
    actions: {
      chooseExecutable: 'Изабери извршну датотеку',
      installWithHomebrew: 'Инсталирај преко Homebrew-а',
      installWithWinget: 'Инсталирај преко WinGet-а',
      resetToDefault: 'Врати на подразумевано',
      retrySetup: 'Покушај подешавање поново',
      cancel: 'Откажи',
      openDependencyFolder: 'Отвори фолдер зависности',
      viewSetupLog: 'Прегледај дневник подешавања'
    }
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
      playlistItems: 'Playlist',
      playlistPresets: 'Квалитет',
      formats: 'Формат',
      subtitles: 'Титлови',
      sponsorblock: 'SponsorBlock',
      output: 'Излаз',
      folder: 'Сачувај',
      confirm: 'Потврди'
    },
    playlist: {
      heading: 'Ставке плејлисте',
      bulkHeading: 'Групни URL-ови',
      itemCount_one: '{{count}} видео',
      itemCount_other: '{{count}} видеа',
      itemCountAudio_one: '{{count}} нумера',
      itemCountAudio_other: '{{count}} нумера',
      itemCountBulk_one: '{{count}} URL',
      itemCountBulk_other: '{{count}} URL-ова',
      bulkMetadataResolving: 'Преузимање детаља видеа… {{done}}/{{total}}',
      bulkRowWaiting: 'Чека',
      bulkRowResolving: 'Преузимање детаља',
      bulkRowFailed: 'Детаљи нису доступни',
      selectAll: 'Изабери све',
      selectNone: 'Поништи избор',
      rangeFrom: 'Од',
      rangeTo: 'До',
      rangeApply: 'Примени опсег',
      selectedCount_one: '{{count}} изабрано',
      selectedCount_other: '{{count}} изабрано',
      noSelection: 'Изабери барем један видео да би наставио/ла',
      loadingItems: 'Преузимање плејлисте…',
      thumbnailAlt: 'Сличица видеа',
      durationUnknown: 'live',
      syncChange: 'Промени фолдер…',
      syncApply: 'Примени синхронизацију',
      syncScanning: 'Провера фолдера…',
      syncFoundTitle: 'Већ је у фолдеру',
      syncFoundDesc: '{{n}} ових видео снимака је већ у {{dir}}. Синхронизовати да се преузму само нови?',
      syncNoneTitle: 'Још ништа није преузето',
      syncNoneDesc: 'Ниједан видео из ове плејлисте није пронађен у {{dir}}.',
      alreadyDownloaded: 'Већ преузето',
      probeLimitAlertTitle: 'Скенирање плејлисте је ограничено',
      probeLimitAlertDesc: 'Arroxy је пронашао више од {{count}} ставки, па тренутно ограничење скенирања скрива остатак.'
    },
    bulk: {
      title: 'Групни URL-ови',
      description: 'Налепи појединачне видео или аудио URL-ове. Arroxy ће очистити дупликате и означити playlist или channel линкове пре додавања у ред.',
      textareaLabel: 'Листа URL-ова',
      textareaPlaceholder: 'https://video.example/one\nhttps://video.example/two\nhttps://video.example/three',
      acceptedCount: 'Спремно',
      ignoredCount: 'Занемарено',
      emptyPreview: 'Налепи један или више URL-ова за преглед групе.',
      needsAtLeastOne: 'Додај најмање један подржан URL за наставак.',
      confirm: 'Користи ове URL-ове',
      reject: {
        duplicate: 'Дупликат',
        playlist: 'Користи playlist ток',
        channel: 'Користи channel ток'
      }
    },
    playlistPresets: {
      heading: 'Изабери квалитет за групно преузимање',
      subhead: 'Свaki видео самостално проналази одговарајући ниво квалитета — хетерогене плејлисте раде без изненађења.',
      itemCount_one: '{{count}} ставка',
      itemCount_other: '{{count}} ставки'
    },
    mixedPrompt: {
      title: 'Овај линк је из плејлисте',
      body: 'Желиш само видео на који си кликнуо, или да бираш из плејлисте? Следећи корак ти омогућава да одабереш одређене видеосе или распон.',
      singleVideo: 'Само овај',
      pickFromPlaylist: 'Бирај из плејлисте',
      playlistLimit: 'Limit provere plejliste: {{count}} stavki',
      advancedSettings: 'Napredna podešavanja',
      singleTooltip: 'Koristi yt-dlp režim za pojedinačni video, pa se plejlista vezana za ovaj URL ignoriše.',
      playlistTooltip: 'Koristi yt-dlp režim plejliste i učitava do vašeg limita pre prikaza birača.'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'Учитај формате',
      fetchFormatsTooltip: 'Izaberite formate, titlove, fasciklu i stavke plejliste korak po korak pre dodavanja u red.',
      quickDownload: 'Brzo preuzimanje',
      quickDownloadTooltip: 'Koristi sačuvana ili podrazumevana podešavanja i dodaje ovaj pojedinačni video u red bez otvaranja koraka podešavanja.',
      quickPreparing: 'Priprema',
      quickQueued: 'Dodato u red',
      quickSingleOnly: 'Brzo preuzimanje je samo za pojedinačne video snimke. Za plejliste i kanale koristite Preuzmi formate.',
      quickProbeFailed: 'Provera nije uspela',
      quickPrepareFailed: 'Stavka reda nije mogla da se pripremi',
      quickFailed: 'Nije moguće dodati: {{error}}',
      bulkButton: 'Групни URL-ови',
      bulkTooltip: 'Налепи листу појединачних URL-ова, прегледај очишћену листу, па их додај у ред са заједничким quality preset-ом.',
      features: {
        heading: 'Шта Arroxy може да преузме',
        youtube: {
          heading: 'YouTube',
          video: 'Видеа',
          channel: 'Канали',
          playlist: 'Плејлисте',
          short: 'Shorts',
          music: 'Музика',
          podcast: 'Подкасти'
        },
        anySite: {
          heading: '2000+ сајтова',
          video: 'Видеа',
          videoPlaylist: 'Видео плејлисте',
          musicPlaylist: 'Музичке плејлисте'
        },
        always: {
          heading: 'Увек доступно',
          audioOnly: 'Само звук',
          subtitles: 'Титлови'
        }
      },
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
          bulkTitle: 'Откривени су групни URL-ови',
          bulkBody: 'Користити ове линкове из clipboard-а као групно преузимање?',
          bulkSummary: '{{count}} URL-ова спремно',
          bulkIgnored: '{{count}} занемарено',
          bulkButton: 'Групно преузимање',
          useButton: 'Користи URL',
          disableButton: 'Онемогући',
          cancelButton: 'Откажи',
          disableNote: 'Праћење клипборда можеш поново укључити касније у Напредним подешавањима.'
        }
      },
      cookies: {
        sourceLabel: 'Извор cookies',
        sourceOff: 'Искључено',
        sourceFile: 'Датотека',
        sourceBrowser: 'Прегледач',
        toggleDescription: 'Помаже са видеима са ограничењем старости, само за чланове и приватним видеима.',
        risk: 'Ризик: cookies.txt садржи сваку пријављену сесију за тај прегледач — чувај је приватном.',
        fileLabel: 'Датотека Cookies',
        choose: 'Изабери…',
        clear: 'Обриши',
        placeholder: 'Нема изабране датотеке',
        helpLink: 'Како да извезем cookies?',
        enabledButNoFile: 'Изабери датотеку да би користио/ла cookies',
        browserLabel: 'Прегледач',
        browserPlaceholder: 'Изабери прегледач…',
        browserHelp: 'Чита cookies директно из прегледача. Прегледач мора бити затворен за прегледаче Chromium породице.',
        enabledButNoBrowser: 'Изабери прегледач да би користио/ла cookies',
        banWarning: 'YouTube може да означи — а понекад и забрани — налоге чији cookies користи yt-dlp. Ако је могуће, користи привремени налог.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Преузми cookies.txt ЛОКАЛНО (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Прусмери саобраћај кроз прокси — корисно за географски ограничен садржај.',
        placeholder: 'http://host:port',
        clear: 'Обриши'
      },
      playlistProbeLimit: {
        label: 'Ставке плејлисте за скенирање',
        description: 'Максималан број уноса које Arroxy учитава када се отвори плејлиста, канал или резултат претраге.',
        option: '{{count}} ставки',
        current: 'Тренутно ограничење: {{count}} ставки',
        customValue: 'Прилагођено: {{count}} ставки',
        custom: 'Прилагођено…',
        customDialogTitle: 'Прилагођено ограничење скенирања плејлисте',
        customDialogDescription: 'Унеси цео број од {{min}} до {{max}}.',
        customDialogCancel: 'Откажи',
        customDialogSave: 'Сачувај ограничење',
        invalid: 'Унеси цео број од 1 до 5000',
        tooltip: 'Одговара yt-dlp опцији --playlist-end: Arroxy тражи само овај број уноса плејлисте, канала или претраге приликом прављења бирача.'
      },
      singleFilenameId: {
        toggle: 'Додај ID видеа у појединачна имена фајлова',
        toggleDescription: 'Чува појединачна преузимања јединственим када се наслови промене или поклопе.'
      },
      networkPacing: {
        heading: 'Пажљива преузимања',
        description: 'Додаје мале паузе током сваког преузимања тако да Arroxy не приступа сајту превише агресивно. Вредности су у секундама ако није другачије назначено.',
        tooltip: 'Ове паузе се дешавају унутар сваког преузимања. Arroxy и даље обрађује преузимања из реда по једно.',
        summary: 'Паузе: {{requests}} између провера, {{downloads}} пре почетка медија, {{subtitles}} пре фајлова титлова. Везе: {{fragments}}.',
        presets: {
          off: 'Искључено',
          balanced: 'Уравнотежено',
          careful: 'Пажљиво',
          custom: 'Прилагођено'
        },
        tooltips: {
          off: 'Користи само мале основне паузе које Arroxy задржава за медије и титлове.',
          balanced: 'Подразумевано. Додаје кратке паузе и користи једну везу за преузимање.',
          careful: 'Додаје дуже паузе за велике плејлисте или мреже које често достижу ограничења.',
          custom: 'Самостално подеси напредне контроле по преузимању.'
        },
        fields: {
          sleepRequests: 'Чекање између провера метаподатака',
          sleepInterval: 'Пауза пре почетка медија: мин',
          maxSleepInterval: 'Пауза пре почетка медија: макс',
          sleepSubtitles: 'Чекање пре фајлова титлова',
          concurrentFragments: 'Везе за преузимање'
        },
        units: {
          seconds: 'сек',
          threads: 'нити'
        },
        presetLabel: 'Насколько осторожным должен быть Arroxy?'
      },
      closeToTray: {
        toggle: 'Сакриј у системски трај при затварању',
        toggleDescription: 'Настави преузимања у позадини после затварања прозора.'
      },
      analytics: {
        toggle: 'Пошаљи анонимне статистике коришћења',
        toggleDescription: 'Броји само покретања апликације. Без URL-ова, имена датотека или личних података.'
      },
      limitRate: {
        label: 'Ограничение скорости загрузки',
        description: 'Ограничивает пропускную способность для загрузки медиа. Интервалы запросов ниже обычно сильнее влияют на лимиты.',
        off: 'Выкл.',
        custom: 'Своя…',
        customPlaceholder: 'например 750K или 1.5M',
        invalid: 'Введите число с K или M (например 500K, 1.5M)',
        activeWarning: 'Активные загрузки сохранят текущий лимит. Пауза + Возобновить применит изменения.'
      }
    },
    subtitles: {
      autoBadge: 'Аутоматски',
      noLanguages: 'Нема доступних титлова за овај видео',
      skip: 'Прескочи',
      skipSubs: 'Прескочи за овај видео',
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
      loadingHint: 'Сачекајте да провера заврши — листе за репродукцију и претраге могу потрајати.',
      loadingAria: 'Учитавање формата',
      sizeUnknown: 'Величина непозната',
      total: 'Укупно',
      skipToConfirm: 'Прескочи до потврде',
      skipToConfirmTooltip: 'Користи твоја сачувана подешавања за све преостале кораке. Да бисте променили поставку, наставите корак по корак — твој избор ће бити сачуван за следећи пут.',
      keepAudio: 'Задржи као јесте',
      keepAudioMeta: 'Уграђени звук',
      convert: {
        label: 'Конвертуј',
        uncompressed: 'Конвертуј · некомпресовано',
        bitrate: 'Битрејт',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Конверзија звука захтева режим само-звука (поништи избор видеа).',
        requiresLossy: 'Изабран је нативни стрим — битрејт се примењује само при конверзији у mp3, m4a или opus.'
      },
      botWall: {
        heading: 'YouTube је ограничио ову проверу',
        bodyUnconfigured: 'Списак формата можда није потпун. Подеси cookies у напредним подешавањима или промени мрежу и покушај поново.',
        bodyDisabled: 'Cookies су подешени али искључени. Укључи их и покушај поново за потпун списак, или промени мрежу и покушај поново.',
        bodyEnabled: 'Чак и са cookies, YouTube је ограничио ову проверу. Покушај касније или промени мрежу.',
        retryCta: 'Покушај поново',
        enableRetryCta: 'Укључи cookies и покушај поново'
      },
      cookiesError: {
        heading: 'Cookies могу бити узрок',
        currentModeLabel: 'Извор cookies',
        currentModeFile: 'Датотека',
        currentModeBrowser: 'Прегледач',
        explanationFile: 'Твоја датотека cookies можда је празна, истекла или у погрешном формату (yt-dlp очекује Netscape cookies.txt). Покушај поново да извезеш cookies, изабери другу датотеку, пређи у режим „Прегледач" или искључи cookies.',
        explanationBrowser: 'Cookies се читају директно из прегледача. Ако је прегледач тренутно покренут, његова база cookies може бити закључана (Chromium породица). Прегледач такође мора бити пријављен на YouTube. Покушај затворити прегледач, пређи на другачији прегледач, пређи у режим „Датотека" или искључи cookies.',
        needsCookies: {
          heading: 'Овај сајт захтева пријаву',
          body: 'yt-dlp није могао да приступи овом видеу без аутентификације. Подеси cookies у напредним подешавањима — одреди прегледач у ком си већ пријављен или увези cookies.txt датотеку.'
        },
        openSettingsCta: 'Отвори подешавања cookies',
        dpapi: {
          heading: 'Chrome cookies блокиран Windows шифровањем',
          explanation: 'Chrome 127 и новији шифрују cookies на начин који друге апликације не могу да прочитају на Windows-у. Испробај неко од решења испод.',
          fixFirefoxLabel: 'Пређи на Firefox',
          fixFirefoxBody: 'Firefox не користи App-Bound Encryption. Отвори подешавања cookies и изабери Firefox са листе прегледача.',
          fixFileLabel: 'Извези cookies.txt',
          fixFileBody: 'Извези cookies из Chrome-а помоћу додатка за прегледач, па пређи у режим Датотека и изабери извезену датотеку.',
          fixUnsafeLabel: 'Покрени Chrome са онемогућеном App-Bound Encryption',
          fixUnsafeBody: 'Додај --disable-features=LockProfileCookieDatabase пречици за покретање Chrome-а. Упозорење: ово поништава претходно шифроване cookies, тако да ћеш бити одјављен са сваке странице и морати поново да се пријавиш.',
          docsLinkLabel: 'yt-dlp документација (issue #10927)'
        }
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
        description: 'Насловна слика унутар датотеке. WebM видео ће бити поново мултиплексован у MKV; прескаче се када су титлови уграђени.'
      },
      writeDescription: {
        label: 'Сачувај опис',
        description: 'Чува опис видеа као .description текстуалну датотеку поред преузимања.'
      },
      writeThumbnail: {
        label: 'Сачувај сличицу',
        description: 'Чува сличицу као .jpg датотеку слике поред преузимања.'
      },
      writeM3u: {
        label: 'Создать файл плейлиста .m3u',
        description: 'Сохраняет .m3u рядом с видео, чтобы медиаплеер открывал их по порядку.'
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
      thumbnailEmbedNotSupported: 'Thumbnail embed је прескочен — излазни container то не подржава.',
      subtitleEmbedAudioOnly: 'Subtitle embed је промењен у sidecar — аудио стазе не подржавају уграђене токове титлова.',
      audioOnly: 'Само звук',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Покреће се када друга преузимања заврше — добија пун пропусни опсег',
      pullIt: 'Преузми! ↓',
      pullItTooltip: 'Покреће се одмах — ради упоредо са другим активним преузимањима',
      labelPlaylist: 'Плејлиста',
      labelBulk: 'Групни URL-ови',
      labelPreset: 'Поставка',
      labelItems: 'Ставке',
      itemsValue_one: '{{count}} од {{total}} видеа',
      itemsValue_other: '{{count}} од {{total}} видеа',
      itemsValueAudio_one: '{{count}} од {{total}} нумере',
      itemsValueAudio_other: '{{count}} од {{total}} нумера',
      itemsValueBulk_one: '{{count}} од {{total}} URL-а',
      itemsValueBulk_other: '{{count}} од {{total}} URL-ова'
    }
  },
  videoCard: {
    titlePlaceholder: 'Учитавање…'
  },
  queue: {
    header: 'Ред за преузимање',
    toggleTitle: 'Прикажи/сакриј ред за преузимање',
    empty: 'Преузимања која додаш у ред ће се овде приказати',
    noDownloads: 'Нема преузимања.',
    activeCount: '{{count}} преузима · {{percent}}%',
    clear: 'Обриши',
    clearTitle: 'Обриши завршена преузимања',
    pauseAll: 'Паузирај све',
    pauseAllTitle: 'Паузирај сва активна преузимања',
    cancelAll: 'Откажи све',
    cancelAllTitle: 'Откажи сва активна и чекајућа преузимања',
    tip: 'Твоје преузимање је у реду испод — отвори у свако доба да пратиш напредак.',
    item: {
      doneAt: 'Завршено {{time}}',
      paused: 'Паузирано',
      defaultError: 'Преузимање није успело',
      openUrl: 'Отвори URL',
      pause: 'Паузирај',
      hold: 'Задржи',
      resume: 'Настави',
      cancel: 'Откажи',
      remove: 'Уклони',
      pullNow: 'Загрузить сейчас — пропустить очередь',
      priorityBadge: 'Приоритет',
      statusPending: 'Ожидание',
      statusRunning: 'Загрузка',
      statusHeld: 'Удержано',
      statusPaused: 'Пауза',
      statusDone: 'Готово',
      statusError: 'Ошибка',
      statusCancelled: 'Отменено'
    },
    resumeAll: 'Возобновить очередь',
    resumeAllTitle: 'Возобновить приостановленные загрузки и продолжить очередь',
    limitRate: 'Скорость: {{value}}',
    limitRateOff: 'Скорость: выкл.',
    limitRateTitle: 'Ограничение пропускной способности для загрузок'
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
    extractingAudio: 'Конвертовање звука…',
    convertingVideo: 'Конвертовање видеа…',
    embeddingMetadata: 'Уградња метаподатака…',
    movingFiles: 'Премештање датотека…',
    fetchingSubtitles: 'Преузимање титлова…',
    sleepingBetweenRequests: 'Чекање {{seconds}}с да би се избегла ограничења брзине…',
    subtitlesFailed: 'Видео је сачуван — неки титлови нису могли бити преузети',
    cancelled: 'Преузимање је отказано',
    complete: 'Преузимање је завршено',
    usedExtractorFallback: 'Преузето са опуштеним ektraktором — подеси cookies.txt за поузданија преузимања',
    ytdlpProcessError: 'Грешка yt-dlp процеса: {{error}}',
    ytdlpExitCode: 'yt-dlp је завршио са кодом {{code}}',
    downloadingBinary: 'Преузимање {{name}} бинарне датотеке…',
    unknownStartupFailure: 'Непозната грешка при покретању преузимања',
    diskSpaceInsufficient: 'Нема довољно простора на диску — потребно {{required}}, доступно само {{free}}',
    fetchingSponsorBlock: 'Успостављање везе са SponsorBlock-ом…',
    retryingSponsorBlock: 'SponsorBlock недоступан, поновни покушај ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'Покренута је заштита од ботова. IP адреса коју користиш је највероватније означена (опсег дата центра или прометан VPN излаз). Промени IP адресу или одабери другачији VPN сервер и покушај поново. Ако проблем и даље постоји, можда се ради о привременој промени на страни YouTube-а — Arroxy аутоматски ажурира yt-dlp при покретању, тако да ће исправка стићи аутоматски чим је буде објавио узводни пројекат.',
      ipBlock: 'Твоја IP адреса је блокирана од стране YouTube-а. Покушај касније или користи VPN.',
      rateLimit: 'YouTube ограничава захтеве. Сачекај минут па покушај поново.',
      ageRestricted: 'Овај видео је ограничен по старости и не може се преузети без пријављеног налога.',
      unavailable: 'Овај видео није доступан — можда је приватан, обрисан или ограничен по региону.',
      geoBlocked: 'Овај видео није доступан у твом региону.',
      outOfDiskSpace: 'Нема довољно простора на диску. Ослободи простор и покушај поново.',
      unsupportedUrl: 'Ово не изгледа као URL видеа. Налепи линк за YouTube видео, Short или плејлисту.',
      chunkTransferFailure: 'Сервер је стално прекидао преузимање насред потока, а yt-dlp се предао после неколико покушаја. Ово се најчешће дешава са највећим видео форматима (4K HDR / VP9 високог битрејта). Покушај поново, промени мрежу или VPN, или изабери формат нижег квалитета.',
      postprocessFailure: 'yt-dlp је завршио преузимање, али је накнадна обрада (спајање / mux / конверзија) пропала. Често је ово пролазни проблем са ffmpeg-ом — покушај поново, а ако се настави, испробај другу комбинацију формата.',
      parse: 'Није било могуће парсирати одговор сајта. yt-dlp екстрактор је можда застарео. Arroxy аутоматски ажурира yt-dlp при покретању — покушај поново за неколико минута када стигне исправка.',
      network: 'Грешка мреже. Провери везу и покушај поново.',
      drmProtected: 'Овај видео је заштићен DRM-ом. yt-dlp не може да уклони DRM, па датотека не може бити преузета.',
      loginRequired: 'Овај видео захтева пријављен налог. Подеси cookies.txt (Подешавања → Cookies) и покушај поново.',
      unknown: 'Преузимање није успело. Погледај сирови излаз испод.'
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
  playlistPresets: {
    type: { video: 'Video', audio: 'Audio' },
    videoFormat: {
      best: 'Best codec',
      mp4: 'MP4 (H.264)'
    },
    videoFormatDesc: {
      best: 'Najviši dostupan kodek po stavci',
      mp4: 'Prednost H.264 + AAC, MP4 kontejner · najbolji pokušaj'
    },
    tier: {
      best: 'Best quality',
      '2160': 'Do 4K',
      '1440': 'Do 1440p',
      '1080': 'Do 1080p',
      '720': 'Do 720p',
      '480': 'Do 480p',
      '360': 'Do 360p'
    },
    tierDesc: {
      best: 'Najbolji dostupan video + audio po stavci',
      '2160': 'Ograničeno na 2160p, pada niže po stavci',
      '1440': 'Ograničeno na 2K, pada niže po stavci',
      '1080': 'Ograničeno na 1080p, pada niže po stavci',
      '720': 'Manji fajlovi, široka kompatibilnost',
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
      best: 'Najbolji izvorni audio, bez ponovnog kodiranja',
      mp3: 'Konvertuj u MP3',
      m4a: 'Konvertuj u M4A (AAC)',
      opus: 'Konvertuj u Opus'
    },
    audioFormatBitrate: 'Audio ({{format}} {{kbps}}K)',
    mp4Cap: 'H.264 iznad 1080p nije dostupan na YouTube-u — automatski se ograničava na 1080p'
  },
  formatLabel: {
    audioFallback: 'Звук',
    audioOnlyDot: 'Само звук · {{audio}}',
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
      keep: 'Настави преузимање',
      pause: 'Поставить загрузки на паузу и выйти'
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
  },
  share: {
    title: 'Подели Arroxy',
    description: 'Arroxy је бесплатан и отвореног кода. Дељењем помажеш другима да га открију.',
    copyLink: 'Копирај линк',
    copied: 'Копирано!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Подели Arroxy',
    footerLabel: 'Подели',
    shareAction: 'Подели Arroxy',
    inlineCard: {
      body: 'Свиђа ти се Arroxy? Подели га с неким коме би могао бити користан.',
      dismiss: 'Одбаци предлог за дељење'
    },
    highValueBanner: {
      body: 'Свиђа ти се Arroxy? Помози другима да га открију.',
      dismiss: 'Одбаци предлог за дељење'
    }
  }
} as const;

export default sr;
