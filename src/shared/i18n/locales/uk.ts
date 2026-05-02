const uk = {
  common: {
    back: 'Назад',
    continue: 'Продовжити',
    retry: 'Повторити',
    startOver: 'Почати спочатку',
    loading: 'Завантаження…'
  },
  app: {
    feedback: 'Зворотний зв\'язок',
    logs: 'Журнали',
    feedbackNudge: 'Подобається Arroxy? Я б залюбки почув твою думку! 💬',
    debugCopied: 'Скопійовано!',
    debugCopyTitle: 'Скопіювати налагоджувальну інформацію (версії Electron, ОС, Chrome)',
    zoomIn: 'Збільшити',
    zoomOut: 'Зменшити'
  },
  titleBar: {
    close: 'Закрити',
    minimize: 'Згорнути',
    maximize: 'Розгорнути',
    restore: 'Відновити'
  },
  splash: {
    greeting: 'Привіт, з поверненням!',
    warmup: 'Arroxy розігрівається…',
    warning: 'Налаштування не завершено — деякі функції можуть не працювати'
  },
  theme: {
    light: 'Світла тема',
    dark: 'Темна тема',
    system: 'Системна'
  },
  language: {
    label: 'Мова'
  },
  wizard: {
    steps: {
      url: 'Посилання',
      formats: 'Формат',
      subtitles: 'Субтитри',
      sponsorblock: 'SponsorBlock',
      folder: 'Зберегти',
      confirm: 'Підтвердити'
    },
    url: {
      heading: 'Посилання YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Підтримуються посилання youtube.com і youtu.be',
      fetchFormats: 'Отримати формати',
      mascotIdle: 'Кинь мені посилання YouTube (відео або Shorts) — натисни «Отримати формати» і я візьмусь за справу ✨',
      mascotBusy: 'Завантажую у фоні… можу робити кілька справ одночасно 😎',
      advanced: 'Додатково',
      clearAria: 'Очистити URL',
      clipboard: {
        toggle: 'Стежити за буфером обміну',
        toggleDescription: 'Автоматично підставляє посилання YouTube у поле URL при копіюванні.',
        dialog: {
          title: 'Знайдено посилання YouTube',
          body: 'Використати це посилання з буфера обміну?',
          useButton: 'Використати URL',
          disableButton: 'Вимкнути',
          cancelButton: 'Скасувати',
          disableNote: 'Стеження за буфером обміну можна знову ввімкнути в додаткових налаштуваннях.'
        }
      },
      cookies: {
        toggle: 'Використовувати файл cookies',
        toggleDescription: 'Допомагає з відео з віковим обмеженням, лише для учасників і приватними у твоєму акаунті.',
        risk: 'Ризик: cookies.txt містить усі активні сесії браузера — тримай його в таємниці.',
        fileLabel: 'Файл cookies',
        choose: 'Обрати…',
        clear: 'Скинути',
        placeholder: 'Файл не обрано',
        helpLink: 'Як експортувати cookies?',
        enabledButNoFile: 'Обери файл, щоб використовувати cookies',
        banWarning: 'YouTube може позначити — і іноді забанити — акаунти, чиї cookies використовує yt-dlp. По можливості використовуй одноразовий акаунт.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      }
    },
    subtitles: {
      heading: 'Субтитри',
      autoBadge: 'Авто',
      hint: 'Файли буде збережено поряд із відео',
      noLanguages: 'Для цього відео субтитри недоступні',
      skip: 'Пропустити',
      skipSubs: 'Пропустити для цього відео',
      selectAll: 'Вибрати всі',
      deselectAll: 'Зняти вибір',
      mascot: 'Нуль, одну або кілька мов — вирішуй сам ✨',
      searchPlaceholder: 'Пошук мов…',
      noMatches: 'Мови не знайдено',
      clearAll: 'Очистити все',
      noSelected: 'Субтитри не вибрані',
      selectedNote_one: 'Буде завантажено {{count}} субтитр',
      selectedNote_other: 'Буде завантажено субтитрів: {{count}}',
      sectionManual: 'Ручні',
      sectionAuto: 'Автоматичні',
      saveMode: {
        heading: 'Зберегти як',
        sidecar: 'Поруч із відео',
        embed: 'Вбудувати у відео',
        subfolder: 'Підпапка subtitles/'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'Режим вбудовування зберігає файл як .mkv, щоб доріжки субтитрів вбудовувалися надійно.',
      autoAssNote: 'Авто-субтитри будуть збережені як SRT замість ASS — вони завжди очищаються від роллінгових дублів YouTube, а наш ASS-конвертер поки такого не повторює.'
    },
    sponsorblock: {
      modeHeading: 'Фільтрація спонсорів',
      mode: {
        off: 'Вимк',
        mark: 'Позначити як розділи',
        remove: 'Видалити сегменти'
      },
      modeHint: {
        off: 'Без SponsorBlock — відео відтворюється як завантажено.',
        mark: 'Позначає спонсорські сегменти як розділи (не деструктивно).',
        remove: 'Вирізає спонсорські сегменти за допомогою FFmpeg.'
      },
      categoriesHeading: 'Категорії',
      cat: {
        sponsor: 'Спонсор',
        intro: 'Інтро',
        outro: 'Аутро',
        selfpromo: 'Самореклама',
        music_offtopic: 'Музика не по темі',
        preview: 'Перегляд',
        filler: 'Заповнювач'
      }
    },
    formats: {
      quickPresets: 'Швидкі пресети',
      video: 'Відео',
      audio: 'Аудіо',
      noAudio: 'Без аудіо',
      videoOnly: 'Тільки відео',
      audioOnly: 'Тільки аудіо',
      audioOnlyOption: 'Тільки аудіо (без відео)',
      mascot: 'Найкраще + найкраще = максимальна якість. Я б обрав саме це!',
      sniffing: 'Шукаю для тебе найкращі формати…',
      loadingHint: 'Зазвичай займає секунду',
      loadingAria: 'Завантаження форматів',
      sizeUnknown: 'Розмір невідомий',
      total: 'Усього'
    },
    folder: {
      heading: 'Зберегти у',
      downloads: 'Завантаження',
      videos: 'Відео',
      desktop: 'Робочий стіл',
      music: 'Музика',
      documents: 'Документи',
      pictures: 'Зображення',
      home: 'Домашня папка',
      custom: 'Обрати…',
      subfolder: {
        toggle: 'Зберегти у вкладеній папці',
        placeholder: 'напр. lo-fi rips',
        invalid: 'Назва папки містить недопустимі символи'
      }
    },
    confirm: {
      readyHeadline: 'Готово до завантаження!',
      landIn: 'Файл потрапить у',
      labelVideo: 'Відео',
      labelAudio: 'Аудіо',
      labelSubtitles: 'Субтитри',
      subtitlesNone: '—',
      labelSaveTo: 'Папка',
      labelSize: 'Розмір',
      sizeUnknown: 'Невідомо',
      nothingToDownload: 'Пресет «Тільки субтитри» активний, але мову субтитрів не вибрано — нічого не буде завантажено.',
      audioOnly: 'Тільки аудіо',
      addToQueue: '+ У чергу',
      addToQueueTooltip: 'Запуститься, коли завершаться інші завантаження — на повній швидкості',
      pullIt: 'Качаємо! ↓',
      pullItTooltip: 'Запускається миттєво — паралельно з іншими активними завантаженнями'
    },
    error: {
      icon: 'Помилка'
    }
  },
  videoCard: {
    titlePlaceholder: 'Завантаження…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Черга завантажень',
    toggleTitle: 'Показати/сховати чергу завантажень',
    empty: 'Тут з\'являться завантаження, додані в чергу',
    noDownloads: 'Завантажень поки немає.',
    activeCount: '{{count}} завантажуються · {{percent}}%',
    clear: 'Очистити',
    clearTitle: 'Очистити завершені завантаження',
    tip: 'Твоє завантаження в черзі нижче — відкрий її будь-коли, щоб стежити за прогресом.',
    item: {
      doneAt: 'Готово о {{time}}',
      paused: 'На паузі',
      defaultError: 'Не вдалося завантажити',
      openUrl: 'Відкрити посилання',
      pause: 'Пауза',
      resume: 'Продовжити',
      cancel: 'Скасувати',
      remove: 'Видалити'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'доступна',
    youHave: '— у тебе {{currentVersion}}',
    install: 'Встановити й перезапустити',
    downloading: 'Завантаження…',
    download: 'Завантажити ↗',
    dismiss: 'Закрити сповіщення про оновлення',
    copy: 'Скопіювати команду в буфер обміну',
    copied: 'Команду скопійовано в буфер обміну'
  },
  status: {
    preparingBinaries: 'Підготовка бінарників…',
    mintingToken: 'Створення токена YouTube…',
    remintingToken: 'Оновлення токена…',
    startingYtdlp: 'Запуск процесу yt-dlp…',
    downloadingMedia: 'Завантаження відео та аудіо…',
    mergingFormats: 'Об\'єднання аудіо та відео…',
    fetchingSubtitles: 'Отримання субтитрів…',
    sleepingBetweenRequests: 'Очікування {{seconds}}с для уникнення лімітів…',
    subtitlesFailed: 'Відео збережено — деякі субтитри не завантажилися',
    cancelled: 'Завантаження скасовано',
    complete: 'Завантаження завершено',
    usedExtractorFallback: 'Завантажено зі спрощеним екстрактором — налаштуй cookies.txt для надійніших завантажень',
    ytdlpProcessError: 'Помилка процесу yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp завершився з кодом {{code}}',
    downloadingBinary: 'Завантаження бінарника {{name}}…',
    unknownStartupFailure: 'Невідома помилка під час запуску завантаження'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube вирішив, що це бот. Спробуй ще раз за хвилину.',
      ipBlock: 'YouTube, схоже, заблокував твою IP-адресу. Спробуй пізніше або скористайся VPN.',
      rateLimit: 'YouTube обмежує кількість запитів. Зачекай хвилину і повтори.',
      ageRestricted: 'Це відео має віковий ценз — без авторизації завантажити неможливо.',
      unavailable: 'Це відео недоступне — можливо, воно приватне, видалене або обмежене за регіоном.',
      geoBlocked: 'Це відео недоступне у твоєму регіоні.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Найкраща якість',
      desc: 'Максимальна роздільна здатність + найкраще аудіо'
    },
    balanced: {
      label: 'Збалансовано',
      desc: '720p макс. + гарне аудіо'
    },
    'audio-only': {
      label: 'Тільки аудіо',
      desc: 'Без відео, найкраще аудіо'
    },
    'small-file': {
      label: 'Малий файл',
      desc: 'Найнижча роздільна здатність + слабке аудіо'
    },
    'subtitle-only': {
      label: 'Тільки субтитри',
      desc: 'Без відео та аудіо, лише субтитри'
    }
  },
  formatLabel: {
    audioOnly: 'Тільки аудіо',
    audioFallback: 'Аудіо',
    audioOnlyDot: 'Тільки аудіо · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: 'Триває {{count}} завантаження',
      message_other: 'Триває завантажень: {{count}}',
      detail: 'Закриття скасує всі активні завантаження.',
      confirm: 'Скасувати завантаження й вийти',
      keep: 'Продовжити завантаження'
    }
  }
} as const;

export default uk;
