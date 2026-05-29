const ru = {
  common: {
    back: 'Назад',
    continue: 'Продолжить',
    retry: 'Повторить',
    startOver: 'Начать заново'
  },
  app: {
    feedback: 'Обратная связь',
    logs: 'Журналы',
    feedbackNudge: 'Нравится Arroxy? Я бы хотел услышать твой отзыв! 💬',
    debugCopied: 'Скопировано!',
    debugCopyTitle: 'Скопировать отладочную информацию (версии Electron, ОС, Chrome)',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить'
  },
  about: {
    button: 'О программе',
    openTitle: 'О программе Arroxy',
    tagline: 'Быстрый и удобный загрузчик видео и аудио для рабочего стола.',
    websiteLink: 'Сайт',
    githubLink: 'GitHub',
    licenseLine: 'Лицензия MIT · by Antonio Orionus',
    thirdPartyNotices: 'Просмотреть уведомления о сторонних компонентах'
  },
  titleBar: {
    close: 'Закрыть',
    minimize: 'Свернуть',
    maximize: 'Развернуть',
    restore: 'Восстановить'
  },
  splash: {
    greeting: 'Привет, с возвращением!',
    warmup: 'Arroxy запускается…',
    downloading: 'Загрузка {{binary}}…',
    warmupFailedNoDiag: 'Настройка завершилась ошибкой. Открой журнал настройки для подробностей.'
  },
  repair: {
    title: 'Настройке нужна твоя помощь',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'Не удалось проверить.',
      downloadFailed: 'Загрузка не удалась. Проверь подключение к интернету и повтори.',
      extractFailed: 'Распаковка архива не удалась. Загрузка может быть повреждена — повтори попытку.',
      hashFailed: 'Контрольная сумма загруженного файла не совпадает. Повтори загрузку.',
      spawnFailed: 'Файл отсутствует или не запускается. Выбери рабочую копию.',
      permissionDenied: 'Система отказала в запуске файла. Выбери копию, которой доверяешь, или повтори с правами администратора.',
      blockedOrQuarantined: 'Windows заблокировал файл (SmartScreen / Defender). Выбери установленную копию или добавь папку runtime в белый список.',
      badExitCode: 'Бинарник не ответил на --version. Возможно, он повреждён или это неверная сборка.',
      timeout: 'Проверка версии истекла по таймауту. Файл может зависнуть — повтори попытку.',
      pairIncomplete: 'ffmpeg и ffprobe должны быть указаны вместе как согласованная пара.'
    },
    actions: {
      chooseExecutable: 'Выбрать исполняемый файл',
      resetToDefault: 'Сбросить по умолчанию',
      retrySetup: 'Повторить настройку',
      cancel: 'Отменить',
      openDependencyFolder: 'Открыть папку с зависимостями',
      viewSetupLog: 'Посмотреть журнал настройки'
    }
  },
  theme: {
    light: 'Светлая тема',
    dark: 'Тёмная тема',
    system: 'Системная'
  },
  language: {
    label: 'Язык'
  },
  wizard: {
    steps: {
      url: 'Ссылка',
      playlistItems: 'Playlist',
      playlistPresets: 'Качество',
      formats: 'Формат',
      subtitles: 'Субтитры',
      sponsorblock: 'SponsorBlock',
      output: 'Вывод',
      folder: 'Сохранить',
      confirm: 'Подтвердить'
    },
    playlist: {
      heading: 'Элементы Playlist',
      itemCount_one: '{{count}} видео',
      itemCount_other: '{{count}} видео',
      itemCountAudio_one: '{{count}} трек',
      itemCountAudio_other: '{{count}} треков',
      selectAll: 'Выбрать все',
      selectNone: 'Снять выбор',
      rangeFrom: 'С',
      rangeTo: 'По',
      rangeApply: 'Применить диапазон',
      selectedCount_one: '{{count}} выбрано',
      selectedCount_other: '{{count}} выбрано',
      noSelection: 'Выбери хотя бы одно видео, чтобы продолжить',
      loadingItems: 'Загрузка Playlist…',
      thumbnailAlt: 'Превью видео',
      durationUnknown: 'прямой эфир',
      syncChange: 'Изменить папку…',
      syncApply: 'Применить синхронизацию',
      syncScanning: 'Проверяем папку…',
      syncFoundTitle: 'Уже в папке',
      syncFoundDesc: '{{n}} из этих видео уже есть в {{dir}}. Синхронизировать, чтобы скачать только новые?',
      syncNoneTitle: 'Пока ничего не скачано',
      syncNoneDesc: 'Видео из этого плейлиста не найдены в {{dir}}.',
      alreadyDownloaded: 'Уже скачано'
    },
    playlistPresets: {
      heading: 'Выбери качество для пакетной загрузки',
      subhead: 'Каждое видео независимо подбирает подходящий уровень качества — неоднородные плейлисты работают без сюрпризов.',
      itemCount_one: '{{count}} элемент',
      itemCount_other: '{{count}} элементов'
    },
    mixedPrompt: {
      title: 'Эта ссылка — часть Playlist',
      body: 'Хочешь скачать только то видео, на которое нажал, или выбрать из Playlist? Дальше сможешь указать конкретные видео или диапазон.',
      singleVideo: 'Только это одно',
      pickFromPlaylist: 'Выбрать из Playlist'
    },

    url: {
      heading: 'Ссылка YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'Получить форматы',
      features: {
        heading: 'Что умеет скачивать Arroxy',
        youtube: {
          heading: 'YouTube',
          video: 'Видео',
          channel: 'Каналы',
          playlist: 'Плейлисты',
          short: 'Shorts',
          music: 'Музыка',
          podcast: 'Подкасты'
        },
        anySite: {
          heading: '2000+ сайтов',
          video: 'Видео',
          videoPlaylist: 'Видеоплейлисты',
          musicPlaylist: 'Музыкальные плейлисты'
        },
        always: {
          heading: 'Всегда доступно',
          audioOnly: 'Только аудио',
          subtitles: 'Субтитры'
        }
      },
      mascotIdle: 'Кинь мне ссылку YouTube (видео или Shorts) — нажми «Получить форматы», и я возьмусь за дело ✨',
      mascotBusy: 'Качаю в фоне… могу делать несколько дел сразу 😎',
      advanced: 'Дополнительно',
      clearAria: 'Очистить URL',
      clipboard: {
        toggle: 'Следить за буфером обмена',
        toggleDescription: 'Автоматически подставляет ссылку YouTube в поле URL при копировании.',
        dialog: {
          title: 'Найдена ссылка YouTube',
          body: 'Использовать эту ссылку из буфера обмена?',
          useButton: 'Использовать URL',
          disableButton: 'Отключить',
          cancelButton: 'Отмена',
          disableNote: 'Слежение за буфером обмена можно снова включить в дополнительных настройках.'
        }
      },
      cookies: {
        sourceLabel: 'Источник cookies',
        sourceOff: 'Отключено',
        sourceFile: 'Файл',
        sourceBrowser: 'Браузер',
        toggleDescription: 'Помогает с возрастными ограничениями, видео для участников и приватными видео в твоём аккаунте.',
        risk: 'Риск: cookies.txt содержит все активные сессии браузера — храни его в секрете.',
        fileLabel: 'Файл cookies',
        choose: 'Выбрать…',
        clear: 'Сбросить',
        placeholder: 'Файл не выбран',
        helpLink: 'Как экспортировать cookies?',
        enabledButNoFile: 'Выбери файл, чтобы использовать cookies',
        browserLabel: 'Браузер',
        browserPlaceholder: 'Выбери браузер…',
        browserHelp: 'Читает cookies напрямую из браузера. Браузеры семейства Chromium должны быть закрыты.',
        enabledButNoBrowser: 'Выбери браузер, чтобы использовать cookies',
        banWarning: 'YouTube может пометить — и иногда забанить — аккаунты, чьи cookies использует yt-dlp. По возможности используй одноразовый аккаунт.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Получить cookies.txt ЛОКАЛЬНО (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Направлять трафик через прокси — полезно для контента с географическими ограничениями.',
        placeholder: 'http://host:port',
        clear: 'Очистить'
      },
      singleFilenameId: {
        toggle: 'Добавлять ID видео к одиночным именам файлов',
        toggleDescription: 'Помогает сохранять одиночные загрузки уникальными, когда названия меняются или совпадают.'
      },
      closeToTray: {
        toggle: 'Скрывать в трей при закрытии',
        toggleDescription: 'Продолжать загрузки в фоне после закрытия окна.'
      },
      analytics: {
        toggle: 'Отправлять анонимную статистику',
        toggleDescription: 'Только подсчёт запусков приложения. Без URL, имён файлов или личных данных.'
      }
    },
    subtitles: {
      autoBadge: 'Авто',
      noLanguages: 'Для этого видео субтитры недоступны',
      skip: 'Пропустить',
      skipSubs: 'Пропустить для этого видео',
      mascot: 'Ноль, один или несколько — решать тебе ✨',
      searchPlaceholder: 'Поиск языков…',
      noMatches: 'Языки не найдены',
      clearAll: 'Очистить всё',
      noSelected: 'Субтитры не выбраны',
      selectedNote_one: 'Будет загружен {{count}} субтитр',
      selectedNote_other: 'Будет загружено субтитров: {{count}}',
      sectionManual: 'Ручные',
      sectionAuto: 'Автоматические',
      saveMode: {
        heading: 'Сохранить как',
        sidecar: 'Рядом с видео',
        embed: 'Встроить в видео',
        subfolder: 'Подпапка subtitles/'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'Режим встраивания сохраняет файл как .mkv, чтобы дорожки субтитров встраивались надёжно.',
      autoAssNote: 'Авто-субтитры будут сохранены как SRT вместо ASS — они всегда очищаются от роллинговых дублей YouTube, а наш ASS-конвертер пока такое не повторяет.'
    },
    sponsorblock: {
      modeHeading: 'Фильтрация спонсоров',
      mode: {
        off: 'Выкл',
        mark: 'Отметить как главы',
        remove: 'Удалить сегменты'
      },
      modeHint: {
        off: 'Без SponsorBlock — видео воспроизводится как загружено.',
        mark: 'Помечает спонсорские сегменты как главы (не деструктивно).',
        remove: 'Вырезает спонсорские сегменты с помощью FFmpeg.'
      },
      categoriesHeading: 'Категории',
      cat: {
        sponsor: 'Спонсор',
        intro: 'Интро',
        outro: 'Аутро',
        selfpromo: 'Самореклама',
        music_offtopic: 'Музыка не по теме',
        preview: 'Превью',
        filler: 'Наполнитель'
      }
    },
    formats: {
      quickPresets: 'Пресеты',
      video: 'Видео',
      audio: 'Аудио',
      noAudio: 'Без аудио',
      videoOnly: 'Только видео',
      audioOnly: 'Только аудио',
      audioOnlyOption: 'Только аудио (без видео)',
      mascot: 'Лучшее + лучшее = максимальное качество. Я бы выбрал так!',
      sniffing: 'Ищу для тебя лучшие форматы…',
      loadingHint: 'Подождите, пока завершится проверка — плейлисты и поиски могут занять некоторое время.',
      loadingAria: 'Загрузка форматов',
      sizeUnknown: 'Размер неизвестен',
      total: 'Всего',
      skipToConfirm: 'Перейти к подтверждению',
      skipToConfirmTooltip: 'Использует сохранённые настройки для всех оставшихся шагов. Чтобы изменить параметр, продолжайте пошагово — ваш выбор будет сохранён на следующий раз.',
      keepAudio: 'Оставить как есть',
      keepAudioMeta: 'Встроенное аудио',
      convert: {
        label: 'Конвертировать',
        uncompressed: 'Конвертировать · без сжатия',
        bitrate: 'Битрейт',
        wavLabel: 'WAV (без сжатия)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Конвертация аудио требует режима «только аудио» (отмени выбор видео).',
        requiresLossy: 'Выбран нативный поток — битрейт применяется только при конвертации в mp3, m4a или opus.'
      },
      botWall: {
        heading: 'YouTube ограничил этот запрос',
        bodyUnconfigured: 'Список форматов может быть неполным. Настрой cookies в расширенных настройках или смени сеть и повтори попытку.',
        bodyDisabled: 'Cookies настроены, но отключены. Включи их и повтори, чтобы получить полный список, или смени сеть и повтори.',
        bodyEnabled: 'Даже с cookies YouTube ограничил этот запрос. Попробуй позже или смени сеть.',
        retryCta: 'Повторить',
        enableRetryCta: 'Включить cookies и повторить'
      },
      cookiesError: {
        heading: 'Возможная причина — cookies',
        currentModeLabel: 'Источник cookies',
        currentModeFile: 'Файл',
        currentModeBrowser: 'Браузер',
        explanationFile: 'Файл cookies может быть пустым, устаревшим или в неверном формате (yt-dlp ожидает Netscape cookies.txt). Попробуй заново экспортировать cookies, выбрать другой файл, переключиться в режим «Браузер» или отключить cookies.',
        explanationBrowser: 'Cookies читаются напрямую из браузера. Если браузер сейчас открыт, его база cookies может быть заблокирована (семейство Chromium). Браузер также должен быть авторизован на YouTube. Попробуй закрыть браузер, переключиться на другой браузер, перейти в режим «Файл» или отключить cookies.',
        needsCookies: {
          heading: 'Этот сайт требует авторизации',
          body: 'yt-dlp не смог получить доступ к этому видео без аутентификации. Настрой cookies в расширенных настройках — укажи браузер, в котором ты уже вошёл, или импортируй файл cookies.txt.'
        },
        openSettingsCta: 'Открыть настройки cookies',
        dpapi: {
          heading: 'Cookies Chrome заблокированы шифрованием Windows',
          explanation: 'Chrome 127 и новее шифрует cookies так, что другие приложения не могут их прочитать в Windows. Попробуй одно из решений ниже.',
          fixFirefoxLabel: 'Перейти на Firefox',
          fixFirefoxBody: 'Firefox не использует App-Bound Encryption. Открой настройки cookies и выбери Firefox из списка браузеров.',
          fixFileLabel: 'Экспортировать cookies.txt',
          fixFileBody: 'Экспортируй cookies из Chrome с помощью браузерного расширения, затем переключи это приложение в режим «Файл» и выбери экспортированный файл.',
          fixUnsafeLabel: 'Запустить Chrome с отключённым App-Bound Encryption',
          fixUnsafeBody: 'Добавь --disable-features=LockProfileCookieDatabase в ярлык запуска Chrome. Внимание: это аннулирует ранее зашифрованные cookies, поэтому ты выйдешь из всех сайтов и придётся войти заново.',
          docsLinkLabel: 'Документация yt-dlp (issue #10927)'
        }
      }
    },
    folder: {
      heading: 'Сохранить в',
      downloads: 'Загрузки',
      videos: 'Видео',
      desktop: 'Рабочий стол',
      music: 'Музыка',
      documents: 'Документы',
      pictures: 'Изображения',
      home: 'Домашняя папка',
      custom: 'Выбрать…',
      subfolder: {
        toggle: 'Сохранить во вложенной папке',
        placeholder: 'напр. lo-fi rips',
        invalid: 'Имя папки содержит недопустимые символы'
      }
    },
    output: {
      embedChapters: {
        label: 'Встроить главы',
        description: 'Маркеры глав, доступные для навигации в любом современном плеере.'
      },
      embedMetadata: {
        label: 'Встроить метаданные',
        description: 'Название, исполнитель, описание и дата загрузки записываются в файл.'
      },
      embedThumbnail: {
        label: 'Встроить обложку',
        description: 'Обложка внутри файла. WebM-видео будет перемуксировано в MKV; пропускается при встраивании субтитров.'
      },
      writeDescription: {
        label: 'Сохранить описание',
        description: 'Сохраняет описание видео как файл .description рядом с загрузкой.'
      },
      writeThumbnail: {
        label: 'Сохранить превью',
        description: 'Сохраняет превью как файл .jpg рядом с загрузкой.'
      }
    },
    confirm: {
      readyHeadline: 'Готово к загрузке!',
      landIn: 'Файл будет сохранён в',
      labelVideo: 'Видео',
      labelAudio: 'Аудио',
      labelSubtitles: 'Субтитры',
      subtitlesNone: '—',
      labelSaveTo: 'Папка',
      labelSize: 'Размер',
      sizeUnknown: 'Неизвестно',
      nothingToDownload: 'Пресет «Только субтитры» активен, но язык субтитров не выбран — ничего не будет скачано.',
      thumbnailEmbedNotSupported: 'Thumbnail embed пропущен — выходной container не поддерживает это.',
      subtitleEmbedAudioOnly: 'Subtitle embed заменён на sidecar — аудиодорожки не поддерживают встроенные потоки субтитров.',
      audioOnly: 'Только аудио',
      addToQueue: '+ В очередь',
      addToQueueTooltip: 'Стартует, когда завершатся другие загрузки — на полной скорости',
      pullIt: 'Качаем! ↓',
      pullItTooltip: 'Запускается сразу — параллельно с другими активными загрузками',
      labelPlaylist: 'Плейлист',
      labelPreset: 'Пресет',
      labelItems: 'Видео',
      itemsValue_one: '{{count}} из {{total}} видео',
      itemsValue_other: '{{count}} из {{total}} видео',
      itemsValueAudio_one: '{{count}} из {{total}} трека',
      itemsValueAudio_other: '{{count}} из {{total}} треков'
    }
  },
  videoCard: {
    titlePlaceholder: 'Загрузка…'
  },
  queue: {
    header: 'Очередь загрузок',
    toggleTitle: 'Показать/скрыть очередь загрузок',
    empty: 'Здесь будут отображаться поставленные в очередь загрузки',
    noDownloads: 'Загрузок пока нет.',
    activeCount: '{{count}} загружается · {{percent}}%',
    clear: 'Очистить',
    clearTitle: 'Очистить завершённые загрузки',
    pauseAll: 'Приостановить все',
    pauseAllTitle: 'Приостановить все активные загрузки',
    cancelAll: 'Отменить все',
    cancelAllTitle: 'Отменить все активные и ожидающие загрузки',
    tip: 'Твоя загрузка в очереди ниже — открой её в любой момент, чтобы следить за прогрессом.',
    item: {
      doneAt: 'Готово в {{time}}',
      paused: 'На паузе',
      defaultError: 'Не удалось загрузить',
      openUrl: 'Открыть ссылку',
      pause: 'Пауза',
      hold: 'Отложить',
      resume: 'Продолжить',
      cancel: 'Отменить',
      remove: 'Удалить'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'доступна',
    youHave: '— у тебя {{currentVersion}}',
    install: 'Установить и перезапустить',
    downloading: 'Загрузка…',
    download: 'Скачать ↗',
    dismiss: 'Закрыть уведомление об обновлении',
    copy: 'Скопировать команду в буфер обмена',
    copied: 'Команда скопирована в буфер обмена',
    installFailed: 'Ошибка обновления',
    retry: 'Повторить'
  },
  status: {
    preparingBinaries: 'Подготовка бинарников…',
    mintingToken: 'Генерируется токен YouTube…',
    remintingToken: 'Токен обновляется…',
    startingYtdlp: 'Запуск процесса yt-dlp…',
    downloadingMedia: 'Загрузка видео и аудио…',
    mergingFormats: 'Объединение аудио и видео…',
    extractingAudio: 'Конвертация аудио…',
    convertingVideo: 'Конвертация видео…',
    embeddingMetadata: 'Встраивание метаданных…',
    movingFiles: 'Перемещение файлов…',
    fetchingSubtitles: 'Получение субтитров…',
    sleepingBetweenRequests: 'Ожидание {{seconds}}с во избежание лимитов…',
    subtitlesFailed: 'Видео сохранено — некоторые субтитры не загрузились',
    cancelled: 'Загрузка отменена',
    complete: 'Загрузка завершена',
    usedExtractorFallback: 'Загружено с упрощённым экстрактором — настрой cookies.txt для более стабильных загрузок',
    ytdlpProcessError: 'Ошибка процесса yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp завершился с кодом {{code}}',
    downloadingBinary: 'Загрузка бинарника {{name}}…',
    unknownStartupFailure: 'Неизвестная ошибка при запуске загрузки',
    diskSpaceInsufficient: 'Недостаточно места на диске — нужно {{required}}, доступно только {{free}}',
    fetchingSponsorBlock: 'Подключение к SponsorBlock…',
    retryingSponsorBlock: 'SponsorBlock недоступен, повтор попытки ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'Сработала защита от ботов. IP-адрес, который ты используешь, скорее всего, заблокирован (диапазон дата-центра или перегруженный VPN-выход). Смени IP или выбери другой VPN-сервер и попробуй снова. Если ошибка повторяется, возможно, это временное изменение на стороне YouTube — Arroxy автоматически обновляет yt-dlp при запуске, так что исправление появится само, как только его выпустят разработчики.',
      ipBlock: 'YouTube, похоже, заблокировал твой IP-адрес. Попробуй позже или используй VPN.',
      rateLimit: 'YouTube ограничивает количество запросов. Подожди минуту и повтори.',
      ageRestricted: 'У этого видео возрастное ограничение — без авторизации скачать нельзя.',
      unavailable: 'Видео недоступно — оно может быть приватным, удалённым или ограниченным по региону.',
      geoBlocked: 'Это видео недоступно в твоём регионе.',
      outOfDiskSpace: 'Недостаточно места на диске. Освободи место и повтори попытку.',
      unsupportedUrl: 'Это не похоже на ссылку на видео. Вставь ссылку на YouTube-видео, Short или плейлист.',
      chunkTransferFailure: 'Сервер постоянно обрывал загрузку на полпути, и yt-dlp сдался после нескольких попыток. Чаще всего это случается с самыми тяжёлыми форматами (4K HDR / высокобитрейтный VP9). Попробуй повторить, сменить сеть или VPN, либо выбери формат с меньшим разрешением.',
      postprocessFailure: 'yt-dlp скачал файл, но пост-обработка (склейка / mux / конвертация) завершилась ошибкой. Обычно это временная проблема ffmpeg — повтори попытку, а если ошибка не уходит, попробуй другое сочетание форматов.',
      parse: 'Не удалось разобрать ответ сайта. Возможно, экстрактор yt-dlp устарел. Arroxy автоматически обновляет yt-dlp при запуске — повтори попытку через несколько минут, как только выйдет исправление.',
      network: 'Сетевая ошибка. Проверь подключение и повтори попытку.',
      drmProtected: 'Это видео защищено DRM. yt-dlp не может снять DRM-защиту, поэтому файл нельзя скачать.',
      loginRequired: 'Для этого видео требуется авторизованный аккаунт. Настрой cookies.txt (Настройки → Cookies) и повтори попытку.',
      unknown: 'Загрузка не удалась. Смотри необработанный вывод ниже.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Лучшее качество',
      desc: 'Максимальное разрешение + лучшее аудио'
    },
    balanced: {
      label: 'Сбалансировано',
      desc: '720p макс. + хорошее аудио'
    },
    'audio-only': {
      label: 'Только аудио',
      desc: 'Без видео, лучшее аудио'
    },
    'small-file': {
      label: 'Маленький файл',
      desc: 'Низкое разрешение + слабое аудио'
    },
    'subtitle-only': {
      label: 'Только субтитры',
      desc: 'Без видео и аудио, только субтитры'
    }
  },
  playlistPresets: {
    'video-best': { label: 'Лучшее качество', desc: 'Максимальное разрешение + лучшее аудио на каждый элемент' },
    'video-2160p': { label: 'До 4K', desc: 'Ограничено 2160p, с откатом ниже для каждого элемента' },
    'video-1440p': { label: 'До 1440p', desc: 'Ограничено 2K, с откатом ниже для каждого элемента' },
    'video-1080p': { label: 'До 1080p', desc: 'Ограничено для каждого элемента, с откатом ниже' },
    'video-720p': { label: 'До 720p', desc: 'Меньший размер файла, широкая совместимость' },
    'video-480p': { label: 'До 480p', desc: 'Низкий трафик' },
    'video-360p': { label: 'До 360p', desc: 'Минимальное видео' },
    'audio-best': { label: 'Audio (best)', desc: 'Лучшее нативное аудио без перекодирования' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'Конвертировать в MP3 192 kbps' }
  },
  formatLabel: {
    audioFallback: 'Аудио',
    audioOnlyDot: 'Только аудио · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Ожидание',
      statusActive_one: '1 загружается · {{percent}}%',
      statusActive_other: '{{count}} загружаются · {{percent}}%',
      open: 'Открыть Arroxy',
      quit: 'Выйти из Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} загрузка идёт',
      message_other: '{{count}} загрузок идёт',
      detail: 'При закрытии все активные загрузки будут отменены.',
      confirm: 'Отменить загрузки и выйти',
      keep: 'Продолжить загрузку'
    },
    closeToTray: {
      message: 'Скрывать Arroxy в системный трей при закрытии?',
      detail: 'Arroxy продолжит работу и завершит активные загрузки. Изменить в расширенных настройках.',
      hide: 'Скрыть в трей',
      quit: 'Выйти',
      remember: 'Больше не спрашивать'
    },
    rendererCrashed: {
      message: 'Arroxy столкнулся с проблемой',
      detail: 'Процесс отрисовки завершился аварийно ({{reason}}). Перезагрузи, чтобы попробовать снова.',
      reload: 'Перезагрузить',
      quit: 'Выйти'
    }
  },
  share: {
    title: 'Поделиться Arroxy',
    description: 'Arroxy — бесплатный проект с открытым кодом. Рекомендуя его, ты помогаешь другим узнать о нём.',
    copyLink: 'Скопировать ссылку',
    copied: 'Скопировано!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Поделиться Arroxy',
    footerLabel: 'Поделиться',
    shareAction: 'Поделиться Arroxy',
    inlineCard: {
      body: 'Нравится Arroxy? Поделись с тем, кому это может пригодиться.',
      dismiss: 'Скрыть предложение поделиться'
    },
    highValueBanner: {
      body: 'Нравится Arroxy? Помоги другим его найти.',
      dismiss: 'Скрыть предложение поделиться'
    }
  }
} as const;

export default ru;
