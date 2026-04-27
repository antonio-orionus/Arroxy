const ru = {
  common: {
    back: 'Назад',
    continue: 'Продолжить',
    retry: 'Повторить',
    startOver: 'Начать заново',
    loading: 'Загрузка…'
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
  titleBar: {
    close: 'Закрыть',
    minimize: 'Свернуть',
    maximize: 'Развернуть',
    restore: 'Восстановить'
  },
  splash: {
    greeting: 'Привет, с возвращением!',
    warmup: 'Arroxy запускается…',
    warning: 'Настройка не завершена — некоторые функции могут не работать'
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
      formats: 'Формат',
      folder: 'Сохранить',
      confirm: 'Подтвердить'
    },
    url: {
      heading: 'Ссылка YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Поддерживаются ссылки youtube.com и youtu.be',
      fetchFormats: 'Получить форматы',
      mascotIdle: 'Кинь мне ссылку YouTube (видео или Shorts) — нажми «Получить форматы», и я возьмусь за дело ✨',
      mascotBusy: 'Качаю в фоне… могу делать несколько дел сразу 😎'
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
      loadingHint: 'Обычно занимает секунду',
      loadingAria: 'Загрузка форматов',
      sizeUnknown: 'Размер неизвестен',
      total: 'Всего'
    },
    folder: {
      heading: 'Сохранить в',
      downloads: 'Загрузки',
      videos: 'Видео',
      desktop: 'Рабочий стол',
      custom: 'Выбрать…'
    },
    confirm: {
      readyHeadline: 'Готово к загрузке!',
      landIn: 'Файл будет сохранён в',
      labelVideo: 'Видео',
      labelAudio: 'Аудио',
      labelSaveTo: 'Папка',
      labelSize: 'Размер',
      sizeUnknown: 'Неизвестно',
      audioOnly: 'Только аудио',
      addToQueue: '+ В очередь',
      addToQueueTooltip: 'Стартует, когда завершатся другие загрузки — на полной скорости',
      pullIt: 'Качаем! ↓',
      pullItTooltip: 'Запускается сразу — параллельно с другими активными загрузками'
    },
    error: {
      icon: 'Ошибка'
    }
  },
  videoCard: {
    titlePlaceholder: 'Загрузка…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Очередь загрузок',
    toggleTitle: 'Показать/скрыть очередь загрузок',
    empty: 'Здесь будут отображаться поставленные в очередь загрузки',
    noDownloads: 'Загрузок пока нет.',
    clear: 'Очистить',
    clearTitle: 'Очистить завершённые загрузки',
    tip: 'Твоя загрузка в очереди ниже — открой её в любой момент, чтобы следить за прогрессом.',
    item: {
      doneAt: 'Готово в {{time}}',
      paused: 'На паузе',
      defaultError: 'Не удалось загрузить',
      openUrl: 'Открыть ссылку',
      pause: 'Пауза',
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
    copied: 'Команда скопирована в буфер обмена'
  },
  status: {
    preparingBinaries: 'Подготовка бинарников…',
    mintingToken: 'Генерируется токен YouTube…',
    remintingToken: 'Токен обновляется…',
    startingYtdlp: 'Запуск процесса yt-dlp…',
    cancelled: 'Загрузка отменена',
    complete: 'Загрузка завершена',
    ytdlpProcessError: 'Ошибка процесса yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp завершился с кодом {{code}}',
    downloadingBinary: 'Загрузка бинарника {{name}}…',
    unknownStartupFailure: 'Неизвестная ошибка при запуске загрузки'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube посчитал этот запрос ботом. Попробуй ещё раз через мгновение.',
      ipBlock: 'YouTube, похоже, заблокировал твой IP-адрес. Попробуй позже или используй VPN.',
      rateLimit: 'YouTube ограничивает количество запросов. Подожди минуту и повтори.',
      ageRestricted: 'У этого видео возрастное ограничение — без авторизации скачать нельзя.',
      unavailable: 'Видео недоступно — оно может быть приватным, удалённым или ограниченным по региону.',
      geoBlocked: 'Это видео недоступно в твоём регионе.'
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
    }
  },
  formatLabel: {
    audioOnly: 'Только аудио',
    audioFallback: 'Аудио',
    audioOnlyDot: 'Только аудио · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} загрузка идёт',
      message_other: '{{count}} загрузок идёт',
      detail: 'При закрытии все активные загрузки будут отменены.',
      confirm: 'Отменить загрузки и выйти',
      keep: 'Продолжить загрузку'
    }
  }
} as const;

export default ru;
