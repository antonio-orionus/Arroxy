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
      folder: 'Зберегти',
      confirm: 'Підтвердити'
    },
    url: {
      heading: 'Посилання YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Підтримуються посилання youtube.com і youtu.be',
      fetchFormats: 'Отримати формати',
      mascotIdle: 'Кинь мені посилання YouTube (відео або Shorts) — натисни «Отримати формати» і я візьмусь за справу ✨',
      mascotBusy: 'Завантажую у фоні… можу робити кілька справ одночасно 😎'
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
      custom: 'Обрати…'
    },
    confirm: {
      readyHeadline: 'Готово до завантаження!',
      landIn: 'Файл потрапить у',
      labelVideo: 'Відео',
      labelAudio: 'Аудіо',
      labelSaveTo: 'Папка',
      labelSize: 'Розмір',
      sizeUnknown: 'Невідомо',
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
    cancelled: 'Завантаження скасовано',
    complete: 'Завантаження завершено',
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
