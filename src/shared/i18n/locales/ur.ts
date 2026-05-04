const ur = {
  common: {
    back: 'واپس',
    continue: 'جاری رکھیں',
    retry: 'دوبارہ کوشش کریں',
    startOver: 'دوبارہ شروع کریں',
    loading: 'لوڈ ہو رہا ہے…'
  },
  app: {
    feedback: 'فیڈبیک',
    logs: 'لاگز',
    feedbackNudge: 'Arroxy پسند آ رہا ہے؟ آپ سے سن کر خوشی ہو گی! 💬',
    debugCopied: 'کاپی ہو گیا!',
    debugCopyTitle: 'ڈیبگ معلومات کاپی کریں (Electron, OS, Chrome ورژنز)',
    zoomIn: 'زوم اِن',
    zoomOut: 'زوم آؤٹ'
  },
  titleBar: {
    close: 'بند کریں',
    minimize: 'چھوٹا کریں',
    maximize: 'بڑا کریں',
    restore: 'بحال کریں'
  },
  splash: {
    greeting: 'ارے، خوش آمدید!',
    warmup: 'Arroxy تیار ہو رہا ہے…',
    warning: 'سیٹ اپ مکمل نہیں — کچھ فیچرز کام نہ کریں'
  },
  theme: {
    light: 'لائٹ موڈ',
    dark: 'ڈارک موڈ',
    system: 'سسٹم ڈیفالٹ'
  },
  language: {
    label: 'زبان'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'فارمیٹ',
      subtitles: 'سب ٹائٹلز',
      sponsorblock: 'SponsorBlock',
      output: 'آؤٹ پٹ',
      folder: 'محفوظ کریں',
      confirm: 'تصدیق'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com اور youtu.be لنکس سپورٹڈ ہیں',
      fetchFormats: 'فارمیٹس لائیں',
      mascotIdle: 'مجھے YouTube کا لنک دیں (ویڈیو یا Short) — پھر "فارمیٹس لائیں" دبائیں اور میں کام شروع کر دوں گا ✨',
      mascotBusy: 'بیک گراؤنڈ میں ڈاؤن لوڈ ہو رہا ہے… میں ملٹی ٹاسک کر سکتا ہوں 😎',
      advanced: 'ایڈوانسڈ',
      clearAria: 'URL صاف کریں',
      clipboard: {
        toggle: 'کلپ بورڈ پر نظر رکھیں',
        toggleDescription: 'جب آپ YouTube لنک کاپی کریں تو URL فیلڈ خود بھر جائے۔',
        dialog: {
          title: 'YouTube URL ملا',
          body: 'کلپ بورڈ سے یہ لنک استعمال کریں؟',
          useButton: 'URL استعمال کریں',
          disableButton: 'بند کریں',
          cancelButton: 'منسوخ کریں',
          disableNote: 'آپ بعد میں ایڈوانسڈ سیٹنگز سے کلپ بورڈ واچنگ دوبارہ آن کر سکتے ہیں۔'
        }
      },
      cookies: {
        toggle: 'cookies فائل استعمال کریں',
        toggleDescription: 'عمر کی پابندی والی، صرف ممبرز والی، اور اکاؤنٹ پرائیویٹ ویڈیوز کے لیے مددگار۔',
        risk: 'خطرہ: cookies.txt میں اس براؤزر کے ہر لاگ اِن سیشن کی معلومات ہوتی ہیں — اسے پرائیویٹ رکھیں۔',
        fileLabel: 'Cookies فائل',
        choose: 'منتخب کریں…',
        clear: 'صاف کریں',
        placeholder: 'کوئی فائل منتخب نہیں',
        helpLink: 'cookies کیسے ایکسپورٹ کروں؟',
        enabledButNoFile: 'cookies استعمال کرنے کے لیے فائل منتخب کریں',
        banWarning: 'YouTube ان اکاؤنٹس کو فلیگ — اور کبھی کبھار بین — کر سکتا ہے جن کے cookies yt-dlp کے ساتھ استعمال ہوں۔ ممکن ہو تو ٹمپریری اکاؤنٹ استعمال کریں۔',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'پراکسی کے ذریعے ٹریفک روٹ کریں — جغرافیائی پابندی والے مواد کے لیے مفید۔',
        placeholder: 'http://host:port',
        clear: 'صاف کریں'
      },
      closeToTray: {
        toggle: 'بند کرنے پر ٹرے میں چھپائیں',
        toggleDescription: 'ونڈو بند ہونے کے بعد بیک گراؤنڈ میں ڈاؤن لوڈز جاری رکھیں۔'
      },
      analytics: {
        toggle: 'گمنام استعمال کے اعداد و شمار بھیجیں',
        toggleDescription: 'صرف ایپ لانچز گنتا ہے۔ کوئی URL، فائل نام، یا ذاتی ڈیٹا نہیں۔'
      }
    },
    subtitles: {
      heading: 'سب ٹائٹلز',
      autoBadge: 'آٹو',
      hint: 'سائڈ کار فائلیں ویڈیو کے ساتھ محفوظ ہوں گی',
      noLanguages: 'اس ویڈیو کے لیے کوئی سب ٹائٹلز دستیاب نہیں',
      skip: 'چھوڑیں',
      skipSubs: 'اس ویڈیو کے لیے چھوڑیں',
      selectAll: 'سب منتخب کریں',
      deselectAll: 'سب غیر منتخب کریں',
      mascot: 'صفر، ایک، یا کئی منتخب کریں — مکمل آپ کی مرضی ✨',
      searchPlaceholder: 'زبانیں تلاش کریں…',
      noMatches: 'کوئی زبان میچ نہیں ہوئی',
      clearAll: 'سب صاف کریں',
      noSelected: 'کوئی سب ٹائٹل منتخب نہیں',
      selectedNote_one: '{{count}} سب ٹائٹل ڈاؤن لوڈ کیا جائے گا',
      selectedNote_other: '{{count}} سب ٹائٹلز ڈاؤن لوڈ کیے جائیں گے',
      sectionManual: 'دستی',
      sectionAuto: 'خودکار',
      saveMode: {
        heading: 'محفوظ کریں بطور',
        sidecar: 'ویڈیو کے ساتھ',
        embed: 'ویڈیو میں شامل کریں',
        subfolder: 'subtitles/ سب فولڈر'
      },
      format: {
        heading: 'فارمیٹ'
      },
      embedNote: 'Embed موڈ آؤٹ پٹ کو .mkv کے طور پر محفوظ کرتا ہے تاکہ سب ٹائٹل ٹریکس قابل اعتماد طور پر شامل ہوں۔',
      autoAssNote: 'آٹو کیپشنز ASS کے بجائے SRT کے طور پر محفوظ ہوں گے — انہیں ہمیشہ YouTube کے رولنگ کیو ڈپلیکیشن سے صاف کیا جاتا ہے، جسے ہمارا ASS کنورٹر ابھی نقل نہیں کر سکتا۔'
    },
    sponsorblock: {
      modeHeading: 'سپانسر فلٹرنگ',
      mode: {
        off: 'بند',
        mark: 'چیپٹرز کے طور پر مارک کریں',
        remove: 'سیگمنٹس ہٹائیں'
      },
      modeHint: {
        off: 'کوئی SponsorBlock نہیں — ویڈیو ویسے ہی چلے گی جیسے اپلوڈ ہوئی۔',
        mark: 'سپانسر سیگمنٹس کو چیپٹرز کے طور پر مارک کرتا ہے (نقصان رہت)۔',
        remove: 'FFmpeg سے ویڈیو سے سپانسر سیگمنٹس کاٹ دیتا ہے۔'
      },
      categoriesHeading: 'کیٹیگریز',
      cat: {
        sponsor: 'سپانسر',
        intro: 'انٹرو',
        outro: 'آؤٹرو',
        selfpromo: 'سیلف پرومو',
        music_offtopic: 'موسیقی غیر متعلقہ',
        preview: 'پری ویو',
        filler: 'فِلر'
      }
    },
    formats: {
      quickPresets: 'فوری پری سیٹس',
      video: 'ویڈیو',
      audio: 'آڈیو',
      noAudio: 'کوئی آڈیو نہیں',
      videoOnly: 'صرف ویڈیو',
      audioOnly: 'صرف آڈیو',
      audioOnlyOption: 'صرف آڈیو (کوئی ویڈیو نہیں)',
      mascot: 'بیسٹ + بیسٹ = زیادہ سے زیادہ کوالٹی۔ میں یہی منتخب کروں گا!',
      sniffing: 'آپ کے لیے بہترین فارمیٹس ڈھونڈ رہا ہوں…',
      loadingHint: 'عام طور پر ایک سیکنڈ لگتا ہے',
      loadingAria: 'فارمیٹس لوڈ ہو رہے ہیں',
      sizeUnknown: 'سائز نامعلوم',
      total: 'کل'
    },
    folder: {
      heading: 'محفوظ کریں',
      downloads: 'Downloads',
      videos: 'Movies',
      desktop: 'Desktop',
      music: 'Music',
      documents: 'Documents',
      pictures: 'Pictures',
      home: 'Home',
      custom: 'حسب ضرورت…',
      subfolder: {
        toggle: 'سب فولڈر میں محفوظ کریں',
        placeholder: 'مثلاً lo-fi rips',
        invalid: 'فولڈر کے نام میں غلط حروف ہیں'
      }
    },
    output: {
      embedChapters: {
        label: 'چیپٹرز شامل کریں',
        description: 'چیپٹر مارکرز کسی بھی جدید پلیئر میں نیویگیٹ کیے جا سکتے ہیں۔'
      },
      embedMetadata: {
        label: 'میٹا ڈیٹا شامل کریں',
        description: 'عنوان، فنکار، تفصیل، اور اپلوڈ کی تاریخ فائل میں لکھی جاتی ہے۔'
      },
      embedThumbnail: {
        label: 'تھمب نیل شامل کریں',
        description: 'فائل میں کور آرٹ۔ صرف MP4 / M4A — جب سب ٹائٹلز شامل ہوں تو چھوڑ دیا جاتا ہے۔'
      },
      writeDescription: {
        label: 'تفصیل محفوظ کریں',
        description: 'ویڈیو کی تفصیل کو ڈاؤن لوڈ کے ساتھ .description ٹیکسٹ فائل کے طور پر محفوظ کرتا ہے۔'
      },
      writeThumbnail: {
        label: 'تھمب نیل محفوظ کریں',
        description: 'تھمب نیل کو ڈاؤن لوڈ کے ساتھ .jpg امیج فائل کے طور پر محفوظ کرتا ہے۔'
      }
    },
    confirm: {
      readyHeadline: 'لانے کے لیے تیار!',
      landIn: 'آپ کی فائل یہاں پہنچے گی',
      labelVideo: 'ویڈیو',
      labelAudio: 'آڈیو',
      labelSubtitles: 'سب ٹائٹلز',
      subtitlesNone: '—',
      labelSaveTo: 'محفوظ کریں',
      labelSize: 'سائز',
      sizeUnknown: 'نامعلوم',
      nothingToDownload: 'صرف سب ٹائٹلز پری سیٹ ایکٹیو ہے لیکن کوئی سب ٹائٹل زبان منتخب نہیں — کچھ ڈاؤن لوڈ نہیں ہو گا۔',
      audioOnly: 'صرف آڈیو',
      addToQueue: '+ قطار',
      addToQueueTooltip: 'دوسرے ڈاؤن لوڈز ختم ہونے پر شروع ہو گا — مکمل بینڈوڈتھ ملے گی',
      pullIt: 'لے آؤ! ↓',
      pullItTooltip: 'فوراً شروع ہو گا — دوسرے ایکٹو ڈاؤن لوڈز کے ساتھ چلے گا'
    },
    error: {
      icon: 'خرابی'
    }
  },
  videoCard: {
    titlePlaceholder: 'لوڈ ہو رہا ہے…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'ڈاؤن لوڈ قطار',
    toggleTitle: 'ڈاؤن لوڈ قطار ٹوگل کریں',
    empty: 'آپ کی قطار میں رکھے ڈاؤن لوڈز یہاں دکھائی دیں گے',
    noDownloads: 'ابھی تک کوئی ڈاؤن لوڈ نہیں۔',
    activeCount: '{{count}} ڈاؤن لوڈ ہو رہے ہیں · {{percent}}%',
    clear: 'صاف کریں',
    clearTitle: 'مکمل ڈاؤن لوڈز صاف کریں',
    tip: 'آپ کا ڈاؤن لوڈ نیچے قطار میں ہے — پیش رفت دیکھنے کے لیے کبھی بھی کھولیں۔',
    item: {
      doneAt: 'مکمل {{time}}',
      paused: 'روکا ہوا',
      defaultError: 'ڈاؤن لوڈ ناکام',
      openUrl: 'URL کھولیں',
      pause: 'روکیں',
      resume: 'دوبارہ شروع کریں',
      cancel: 'منسوخ کریں',
      remove: 'ہٹائیں'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'دستیاب ہے',
    youHave: '— آپ کے پاس {{currentVersion}} ہے',
    install: 'انسٹال اور ری اسٹارٹ',
    downloading: 'ڈاؤن لوڈ ہو رہا ہے…',
    download: 'ڈاؤن لوڈ ↗',
    dismiss: 'اپ ڈیٹ بینر برخاست کریں',
    copy: 'کمانڈ کلپ بورڈ پر کاپی کریں',
    copied: 'کمانڈ کلپ بورڈ پر کاپی ہو گئی',
    installFailed: 'اپ ڈیٹ ناکام',
    retry: 'دوبارہ کوشش کریں'
  },
  status: {
    preparingBinaries: 'بائنریز تیار کی جا رہی ہیں…',
    mintingToken: 'YouTube ٹوکن بنایا جا رہا ہے…',
    remintingToken: 'ٹوکن دوبارہ بنایا جا رہا ہے…',
    startingYtdlp: 'yt-dlp پراسیس شروع ہو رہا ہے…',
    downloadingMedia: 'ویڈیو اور آڈیو ڈاؤن لوڈ ہو رہی ہے…',
    mergingFormats: 'آڈیو اور ویڈیو ضم ہو رہی ہیں…',
    fetchingSubtitles: 'سب ٹائٹلز لائے جا رہے ہیں…',
    sleepingBetweenRequests: 'ریٹ لمٹس سے بچنے کے لیے {{seconds}} سیکنڈ انتظار…',
    subtitlesFailed: 'ویڈیو محفوظ ہو گئی — کچھ سب ٹائٹلز ڈاؤن لوڈ نہ ہو سکے',
    cancelled: 'ڈاؤن لوڈ منسوخ',
    complete: 'ڈاؤن لوڈ مکمل',
    usedExtractorFallback: 'ریلیکسڈ ایکسٹریکٹر سے ڈاؤن لوڈ ہوا — زیادہ قابل اعتماد ڈاؤن لوڈز کے لیے cookies.txt سیٹ اپ کریں',
    ytdlpProcessError: 'yt-dlp پراسیس ایرر: {{error}}',
    ytdlpExitCode: 'yt-dlp کوڈ {{code}} کے ساتھ ختم ہوا',
    downloadingBinary: '{{name}} بائنری ڈاؤن لوڈ ہو رہی ہے…',
    unknownStartupFailure: 'نامعلوم ڈاؤن لوڈ اسٹارٹ اپ ناکامی'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube نے اس درخواست کو بوٹ کے طور پر فلیگ کیا۔ چند لمحوں میں دوبارہ کوشش کریں۔',
      ipBlock: 'آپ کا IP ایڈریس YouTube کی جانب سے بلاک شدہ لگتا ہے۔ بعد میں دوبارہ کوشش کریں یا VPN استعمال کریں۔',
      rateLimit: 'YouTube درخواستوں کو ریٹ لمٹ کر رہا ہے۔ ایک منٹ انتظار کر کے دوبارہ کوشش کریں۔',
      ageRestricted: 'یہ ویڈیو عمر کی پابندی کے ساتھ ہے اور سائن اِن اکاؤنٹ کے بغیر ڈاؤن لوڈ نہیں ہو سکتی۔',
      unavailable: 'یہ ویڈیو دستیاب نہیں — ہو سکتا ہے پرائیویٹ، ڈیلیٹ، یا ریجن لاکڈ ہو۔',
      geoBlocked: 'یہ ویڈیو آپ کے ریجن میں دستیاب نہیں۔',
      outOfDiskSpace: 'ڈسک میں کافی جگہ نہیں۔ جگہ خالی کر کے دوبارہ کوشش کریں۔'
    }
  },
  presets: {
    'best-quality': {
      label: 'بہترین کوالٹی',
      desc: 'سب سے زیادہ ریزولوشن + بہترین آڈیو'
    },
    balanced: {
      label: 'متوازن',
      desc: '720p زیادہ سے زیادہ + اچھی آڈیو'
    },
    'audio-only': {
      label: 'صرف آڈیو',
      desc: 'کوئی ویڈیو نہیں، بہترین آڈیو'
    },
    'small-file': {
      label: 'چھوٹی فائل',
      desc: 'سب سے کم ریزولوشن + کم آڈیو'
    },
    'subtitle-only': {
      label: 'صرف سب ٹائٹلز',
      desc: 'کوئی ویڈیو نہیں، کوئی آڈیو نہیں، صرف سب ٹائٹلز'
    }
  },
  formatLabel: {
    audioOnly: 'صرف آڈیو',
    audioFallback: 'آڈیو',
    audioOnlyDot: 'صرف آڈیو · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'فارغ',
      statusActive_one: '1 ڈاؤن لوڈ ہو رہا ہے · {{percent}}%',
      statusActive_other: '{{count}} ڈاؤن لوڈ ہو رہے ہیں · {{percent}}%',
      open: 'Arroxy کھولیں',
      quit: 'Arroxy بند کریں'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} ڈاؤن لوڈ جاری ہے',
      message_other: '{{count}} ڈاؤن لوڈز جاری ہیں',
      detail: 'بند کرنے سے تمام ایکٹو ڈاؤن لوڈز منسوخ ہو جائیں گے۔',
      confirm: 'ڈاؤن لوڈز منسوخ کریں اور بند کریں',
      keep: 'ڈاؤن لوڈ جاری رکھیں'
    },
    closeToTray: {
      message: 'بند کرتے وقت Arroxy کو سسٹم ٹرے میں چھپائیں؟',
      detail: 'Arroxy چلتا رہتا ہے اور ایکٹو ڈاؤن لوڈز مکمل کرتا ہے۔ یہ بعد میں ایڈوانسڈ سیٹنگز سے بدلیں۔',
      hide: 'ٹرے میں چھپائیں',
      quit: 'بند کریں',
      remember: 'دوبارہ مت پوچھیں'
    },
    rendererCrashed: {
      message: 'Arroxy کو ایک مسئلے کا سامنا ہوا',
      detail: 'رینڈرر پراسیس کریش ہو گیا ({{reason}})۔ دوبارہ کوشش کرنے کے لیے ری لوڈ کریں۔',
      reload: 'ری لوڈ',
      quit: 'بند کریں'
    }
  }
} as const;

export default ur;
