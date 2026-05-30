const ur = {
  common: {
    back: 'واپس',
    continue: 'جاری رکھیں',
    retry: 'دوبارہ کوشش کریں',
    startOver: 'دوبارہ شروع کریں'
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
  about: {
    button: 'کے بارے میں',
    openTitle: 'Arroxy کے بارے میں',
    tagline: 'ڈیسک ٹاپ کے لیے تیز اور آسان ویڈیو اور آڈیو ڈاؤن لوڈر۔',
    websiteLink: 'ویب سائٹ',
    githubLink: 'GitHub',
    licenseLine: 'MIT لائسنس · از Antonio Orionus',
    thirdPartyNotices: 'فریق ثالث کے نوٹس دیکھیں'
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
    downloading: '{{binary}} ڈاؤن لوڈ ہو رہا ہے…',
    warmupFailedNoDiag: 'سیٹ اپ ناکام ہوا۔ تفصیلات کے لیے سیٹ اپ لاگ کھولیں۔'
  },
  repair: {
    title: 'سیٹ اپ کو آپ کی مدد چاہیے',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'تصدیق نہیں ہو سکی۔',
      downloadFailed: 'ڈاؤن لوڈ ناکام ہوا۔ اپنا انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔',
      extractFailed: 'آرکائیو نکالنا ناکام ہوا۔ ڈاؤن لوڈ خراب ہو سکتا ہے — دوبارہ کوشش کریں۔',
      hashFailed: 'ڈاؤن لوڈ کی گئی فائل کا چیکسم میل نہیں کھایا۔ ڈاؤن لوڈ دوبارہ کریں۔',
      spawnFailed: 'فائل غائب ہے یا چلائی نہیں جا سکی۔ کوئی کام کرنے والی کاپی منتخب کریں۔',
      permissionDenied: 'سسٹم نے فائل چلانے سے انکار کر دیا۔ کوئی قابل اعتماد کاپی منتخب کریں یا ایڈمن کے طور پر دوبارہ کوشش کریں۔',
      blockedOrQuarantined: 'Windows نے فائل بلاک کر دی (SmartScreen / Defender)۔ کوئی انسٹال شدہ کاپی منتخب کریں یا رن ٹائم فولڈر کو وائٹ لسٹ کریں۔',
      badExitCode: 'بائنری نے --version کا جواب نہیں دیا۔ یہ خراب یا غلط بلڈ ہو سکتی ہے۔',
      timeout: 'ورژن جانچ کا وقت ختم ہو گیا۔ فائل رکی ہوئی ہو سکتی ہے — دوبارہ کوشش کریں۔',
      pairIncomplete: 'ffmpeg اور ffprobe دونوں کو ایک جوڑے کے طور پر سیٹ کرنا ضروری ہے۔'
    },
    actions: {
      chooseExecutable: 'فائل منتخب کریں',
      resetToDefault: 'ڈیفالٹ پر واپس جائیں',
      retrySetup: 'سیٹ اپ دوبارہ کریں',
      cancel: 'منسوخ کریں',
      openDependencyFolder: 'ڈیپنڈینسی فولڈر کھولیں',
      viewSetupLog: 'سیٹ اپ لاگ دیکھیں'
    }
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
      playlistItems: 'Playlist',
      playlistPresets: 'معیار',
      formats: 'فارمیٹ',
      subtitles: 'سب ٹائٹلز',
      sponsorblock: 'SponsorBlock',
      output: 'آؤٹ پٹ',
      folder: 'محفوظ کریں',
      confirm: 'تصدیق'
    },
    playlist: {
      heading: 'Playlist آئٹمز',
      itemCount_one: '{{count}} ویڈیو',
      itemCount_other: '{{count}} ویڈیوز',
      itemCountAudio_one: '{{count}} ٹریک',
      itemCountAudio_other: '{{count}} ٹریکس',
      selectAll: 'سب منتخب کریں',
      selectNone: 'کوئی نہیں منتخب کریں',
      rangeFrom: 'سے',
      rangeTo: 'تک',
      rangeApply: 'رینج لگائیں',
      selectedCount_one: '{{count}} منتخب',
      selectedCount_other: '{{count}} منتخب',
      noSelection: 'جاری رکھنے کے لیے کم از کم ایک ویڈیو منتخب کریں',
      loadingItems: 'Playlist لائی جا رہی ہے…',
      thumbnailAlt: 'ویڈیو تھمب نیل',
      durationUnknown: 'live',
      syncChange: 'فولڈر تبدیل کریں…',
      syncApply: 'سنک لاگو کریں',
      syncScanning: 'فولڈر چیک ہو رہا ہے…',
      syncFoundTitle: 'فولڈر میں پہلے سے موجود',
      syncFoundDesc: 'ان ویڈیوز میں سے {{n}} پہلے ہی {{dir}} میں موجود ہیں۔ صرف نئی ویڈیوز ڈاؤن لوڈ کرنے کے لیے سنک کریں؟',
      syncNoneTitle: 'ابھی تک کچھ ڈاؤن لوڈ نہیں ہوا',
      syncNoneDesc: 'اس پلے لسٹ کی کوئی ویڈیوز {{dir}} میں نہیں ملیں۔',
      alreadyDownloaded: 'پہلے سے ڈاؤن لوڈ شدہ'
    },
    playlistPresets: {
      heading: 'بیچ کے لیے کوالٹی منتخب کریں',
      subhead: 'ہر ویڈیو منتخب درجے کو آزادانہ طور پر حل کرتی ہے — مختلف قسم کی playlists بغیر کسی پریشانی کے کام کرتی ہیں۔',
      itemCount_one: '{{count}} آئٹم',
      itemCount_other: '{{count}} آئٹمز'
    },
    mixedPrompt: {
      title: 'اس لنک میں Playlist ہے',
      body: 'کیا آپ صرف وہی ویڈیو چاہتے ہیں جس پر کلک کیا، یا Playlist سے انتخاب کرنا چاہتے ہیں؟ اگلے مرحلے میں آپ مخصوص ویڈیوز یا رینج منتخب کریں گے۔',
      singleVideo: 'صرف یہ ایک',
      pickFromPlaylist: 'Playlist سے انتخاب'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'فارمیٹس لائیں',
      features: {
        heading: 'Arroxy کیا لا سکتا ہے',
        youtube: {
          heading: 'YouTube',
          video: 'ویڈیوز',
          channel: 'چینلز',
          playlist: 'پلے لسٹس',
          short: 'Shorts',
          music: 'موسیقی',
          podcast: 'پوڈکاسٹ'
        },
        anySite: {
          heading: '2000+ سائٹس',
          video: 'ویڈیوز',
          videoPlaylist: 'ویڈیو پلے لسٹس',
          musicPlaylist: 'میوزک پلے لسٹس'
        },
        always: {
          heading: 'ہمیشہ دستیاب',
          audioOnly: 'صرف آڈیو',
          subtitles: 'سب ٹائٹلز'
        }
      },
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
        sourceLabel: 'Cookies کا ذریعہ',
        sourceOff: 'بند',
        sourceFile: 'فائل',
        sourceBrowser: 'براؤزر',
        toggleDescription: 'عمر کی پابندی والی، صرف ممبرز والی، اور اکاؤنٹ پرائیویٹ ویڈیوز کے لیے مددگار۔',
        risk: 'خطرہ: cookies.txt میں اس براؤزر کے ہر لاگ اِن سیشن کی معلومات ہوتی ہیں — اسے پرائیویٹ رکھیں۔',
        fileLabel: 'Cookies فائل',
        choose: 'منتخب کریں…',
        clear: 'صاف کریں',
        placeholder: 'کوئی فائل منتخب نہیں',
        helpLink: 'cookies کیسے ایکسپورٹ کروں؟',
        enabledButNoFile: 'cookies استعمال کرنے کے لیے فائل منتخب کریں',
        browserLabel: 'براؤزر',
        browserPlaceholder: 'براؤزر منتخب کریں…',
        browserHelp: 'براؤزر سے براہ راست cookies پڑھتا ہے۔ Chromium خاندان کے براؤزرز بند ہونے چاہئیں۔',
        enabledButNoBrowser: 'cookies استعمال کرنے کے لیے براؤزر منتخب کریں',
        banWarning: 'YouTube ان اکاؤنٹس کو فلیگ — اور کبھی کبھار بین — کر سکتا ہے جن کے cookies yt-dlp کے ساتھ استعمال ہوں۔ ممکن ہو تو ٹمپریری اکاؤنٹ استعمال کریں۔',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt مقامی طور پر حاصل کریں (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'پراکسی کے ذریعے ٹریفک روٹ کریں — جغرافیائی پابندی والے مواد کے لیے مفید۔',
        placeholder: 'http://host:port',
        clear: 'صاف کریں'
      },
      singleFilenameId: {
        toggle: 'سنگل فائل ناموں میں ویڈیو ID شامل کریں',
        toggleDescription: 'عنوان بدلنے یا ٹکرانے پر ایک بار کی ڈاؤن لوڈز کو منفرد رکھتا ہے۔'
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
      autoBadge: 'آٹو',
      noLanguages: 'اس ویڈیو کے لیے کوئی سب ٹائٹلز دستیاب نہیں',
      skip: 'چھوڑیں',
      skipSubs: 'اس ویڈیو کے لیے چھوڑیں',
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
      loadingHint: 'براہ کرم پروبنگ مکمل ہونے تک انتظار کریں — پلے لسٹس اور تلاش میں کچھ وقت لگ سکتا ہے۔',
      loadingAria: 'فارمیٹس لوڈ ہو رہے ہیں',
      sizeUnknown: 'سائز نامعلوم',
      total: 'کل',
      skipToConfirm: 'تصدیق تک جائیں',
      skipToConfirmTooltip: 'باقی تمام مراحل کے لیے آپ کی محفوظ ترجیحات استعمال کرتا ہے۔ کوئی ترتیب تبدیل کرنے کے لیے، قدم بہ قدم جاری رکھیں — آپ کا انتخاب اگلی بار کے لیے محفوظ ہو جائے گا۔',
      keepAudio: 'جیسا ہے ویسا رکھیں',
      keepAudioMeta: 'بلٹ اِن آڈیو',
      convert: {
        label: 'کنورٹ کریں',
        uncompressed: 'کنورٹ کریں · غیر کمپریسڈ',
        bitrate: 'بٹ ریٹ',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'آڈیو کنورژن کے لیے صرف آڈیو موڈ ضروری ہے (ویڈیو انتخاب ہٹائیں)۔',
        requiresLossy: 'ایک نیٹیو سٹریم منتخب ہے — بٹ ریٹ صرف اس وقت لاگو ہوتا ہے جب mp3، m4a، یا opus میں کنورٹ کیا جائے۔'
      },
      botWall: {
        heading: 'YouTube نے یہ پروب محدود کر دی',
        bodyUnconfigured: 'فارمیٹ کی فہرست نامکمل ہو سکتی ہے۔ ایڈوانسڈ سیٹنگز میں cookies ترتیب دیں، یا نیٹ ورک تبدیل کر کے دوبارہ کوشش کریں۔',
        bodyDisabled: 'Cookies ترتیب دی گئی ہیں لیکن بند ہیں۔ مکمل فہرست کے لیے انہیں فعال کریں اور دوبارہ کوشش کریں، یا نیٹ ورک تبدیل کر کے دوبارہ کوشش کریں۔',
        bodyEnabled: 'Cookies کے ساتھ بھی YouTube نے یہ پروب محدود کی۔ بعد میں دوبارہ کوشش کریں یا نیٹ ورک تبدیل کریں۔',
        retryCta: 'دوبارہ کوشش کریں',
        enableRetryCta: 'Cookies فعال کریں اور دوبارہ کوشش کریں'
      },
      cookiesError: {
        heading: 'Cookies وجہ ہو سکتی ہیں',
        currentModeLabel: 'Cookies کا ذریعہ',
        currentModeFile: 'فائل',
        currentModeBrowser: 'براؤزر',
        explanationFile: 'آپ کی cookies فائل خالی، میعاد ختم، یا غلط فارمیٹ میں ہو سکتی ہے (yt-dlp Netscape cookies.txt کی توقع رکھتا ہے)۔ cookies دوبارہ ایکسپورٹ کریں، مختلف فائل منتخب کریں، براؤزر موڈ پر سوئچ کریں، یا cookies بند کر دیں۔',
        explanationBrowser: 'Cookies براہ راست براؤزر سے پڑھی جاتی ہیں۔ اگر براؤزر ابھی چل رہا ہے تو اس کا cookie ڈیٹا بیس لاک ہو سکتا ہے (Chromium-family)۔ براؤزر کا YouTube میں سائن اِن ہونا بھی ضروری ہے۔ براؤزر بند کریں، کوئی مختلف براؤزر آزمائیں، فائل موڈ پر سوئچ کریں، یا cookies بند کر دیں۔',
        openSettingsCta: 'Cookies سیٹنگز کھولیں',
        needsCookies: {
          heading: 'اس سائٹ کو سائن اِن ضروری ہے',
          body: 'yt-dlp تصدیق کے بغیر اس ویڈیو تک رسائی حاصل نہیں کر سکا۔ ایڈوانسڈ سیٹنگز میں cookies ترتیب دیں — کسی ایسے براؤزر کی طرف اشارہ کریں جس میں آپ پہلے سے سائن اِن ہوں، یا cookies.txt فائل درآمد کریں۔'
        },
        dpapi: {
          heading: 'Chrome cookies ونڈوز انکرپشن کے ذریعے بلاک ہیں',
          explanation: 'Chrome 127 اور اس سے نئے ورژن cookies کو اس طرح انکرپٹ کرتے ہیں کہ دوسری ایپس Windows پر انہیں پڑھ نہیں سکتیں۔ نیچے دیے گئے حلوں میں سے ایک آزمائیں۔',
          fixFirefoxLabel: 'Firefox پر سوئچ کریں',
          fixFirefoxBody: 'Firefox، App-Bound Encryption استعمال نہیں کرتا۔ Cookies سیٹنگز کھولیں اور براؤزر کی فہرست سے Firefox منتخب کریں۔',
          fixFileLabel: 'cookies.txt ایکسپورٹ کریں',
          fixFileBody: 'کسی براؤزر ایکسٹینشن سے Chrome سے cookies ایکسپورٹ کریں، پھر اس ایپ کو فائل موڈ پر سوئچ کریں اور ایکسپورٹ کی گئی فائل منتخب کریں۔',
          fixUnsafeLabel: 'App-Bound Encryption غیر فعال کر کے Chrome لانچ کریں',
          fixUnsafeBody: 'Chrome کی لانچ شارٹ کٹ میں --disable-features=LockProfileCookieDatabase شامل کریں۔ انتباہ: اس سے پہلے سے انکرپٹ cookies ختم ہو جاتی ہیں، اس لیے آپ ہر سائٹ سے لاگ آؤٹ ہو جائیں گے اور دوبارہ لاگ ان کرنا ہو گا۔',
          docsLinkLabel: 'yt-dlp دستاویزات (issue #10927)'
        }
      }
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
        description: 'فائل میں کور آرٹ۔ WebM ویڈیو کو MKV میں ری مکس کیا جائے گا؛ جب سب ٹائٹلز شامل ہوں تو چھوڑ دیا جاتا ہے۔'
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
      thumbnailEmbedNotSupported: 'Thumbnail embed چھوڑ دیا گیا — آؤٹ پٹ container اسے سپورٹ نہیں کرتا۔',
      subtitleEmbedAudioOnly: 'Subtitle embed کو sidecar میں تبدیل کر دیا گیا — آڈیو ٹریکس اندرونی subtitle سٹریمز کو سپورٹ نہیں کرتے۔',
      audioOnly: 'صرف آڈیو',
      addToQueue: '+ قطار',
      addToQueueTooltip: 'دوسرے ڈاؤن لوڈز ختم ہونے پر شروع ہو گا — مکمل بینڈوڈتھ ملے گی',
      pullIt: 'لے آؤ! ↓',
      pullItTooltip: 'فوراً شروع ہو گا — دوسرے ایکٹو ڈاؤن لوڈز کے ساتھ چلے گا',
      labelPlaylist: 'پلے لسٹ',
      labelPreset: 'پریسیٹ',
      labelItems: 'آئٹمز',
      itemsValue_one: '{{total}} میں سے {{count}} ویڈیو',
      itemsValue_other: '{{total}} میں سے {{count}} ویڈیوز',
      itemsValueAudio_one: '{{total}} میں سے {{count}} ٹریک',
      itemsValueAudio_other: '{{total}} میں سے {{count}} ٹریکس'
    }
  },
  videoCard: {
    titlePlaceholder: 'لوڈ ہو رہا ہے…'
  },
  queue: {
    header: 'ڈاؤن لوڈ قطار',
    toggleTitle: 'ڈاؤن لوڈ قطار ٹوگل کریں',
    empty: 'آپ کی قطار میں رکھے ڈاؤن لوڈز یہاں دکھائی دیں گے',
    noDownloads: 'ابھی تک کوئی ڈاؤن لوڈ نہیں۔',
    activeCount: '{{count}} ڈاؤن لوڈ ہو رہے ہیں · {{percent}}%',
    clear: 'صاف کریں',
    clearTitle: 'مکمل ڈاؤن لوڈز صاف کریں',
    pauseAll: 'سب کو روکیں',
    pauseAllTitle: 'تمام فعال ڈاؤن لوڈز کو عارضی طور پر روکیں',
    cancelAll: 'سب کو منسوخ کریں',
    cancelAllTitle: 'تمام فعال اور زیر التواء ڈاؤن لوڈز منسوخ کریں',
    tip: 'آپ کا ڈاؤن لوڈ نیچے قطار میں ہے — پیش رفت دیکھنے کے لیے کبھی بھی کھولیں۔',
    item: {
      doneAt: 'مکمل {{time}}',
      paused: 'روکا ہوا',
      defaultError: 'ڈاؤن لوڈ ناکام',
      openUrl: 'URL کھولیں',
      pause: 'روکیں',
      hold: 'روکیں',
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
    extractingAudio: 'آڈیو کنورٹ ہو رہی ہے…',
    convertingVideo: 'ویڈیو کنورٹ ہو رہی ہے…',
    embeddingMetadata: 'میٹا ڈیٹا شامل ہو رہا ہے…',
    movingFiles: 'فائلیں منتقل ہو رہی ہیں…',
    fetchingSubtitles: 'سب ٹائٹلز لائے جا رہے ہیں…',
    sleepingBetweenRequests: 'ریٹ لمٹس سے بچنے کے لیے {{seconds}} سیکنڈ انتظار…',
    subtitlesFailed: 'ویڈیو محفوظ ہو گئی — کچھ سب ٹائٹلز ڈاؤن لوڈ نہ ہو سکے',
    cancelled: 'ڈاؤن لوڈ منسوخ',
    complete: 'ڈاؤن لوڈ مکمل',
    usedExtractorFallback: 'ریلیکسڈ ایکسٹریکٹر سے ڈاؤن لوڈ ہوا — زیادہ قابل اعتماد ڈاؤن لوڈز کے لیے cookies.txt سیٹ اپ کریں',
    ytdlpProcessError: 'yt-dlp پراسیس ایرر: {{error}}',
    ytdlpExitCode: 'yt-dlp کوڈ {{code}} کے ساتھ ختم ہوا',
    downloadingBinary: '{{name}} بائنری ڈاؤن لوڈ ہو رہی ہے…',
    unknownStartupFailure: 'نامعلوم ڈاؤن لوڈ اسٹارٹ اپ ناکامی',
    diskSpaceInsufficient: 'ڈسک میں کافی جگہ نہیں — {{required}} درکار ہے، صرف {{free}} دستیاب ہے',
    fetchingSponsorBlock: 'SponsorBlock سے رابطہ ہو رہا ہے…',
    retryingSponsorBlock: 'SponsorBlock دستیاب نہیں، دوبارہ کوشش ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'بوٹ پروٹیکشن فعال ہو گئی۔ آپ کا IP ممکنہ طور پر فلیگ کیا گیا ہے (ڈیٹا سینٹر رینج یا مصروف VPN ایگزٹ)۔ اپنا IP تبدیل کریں یا کوئی مختلف VPN اینڈ پوائنٹ منتخب کریں اور دوبارہ کوشش کریں۔ اگر مسئلہ برقرار رہے تو یہ YouTube کی طرف سے ایک عارضی تبدیلی ہو سکتی ہے — Arroxy لانچ پر yt-dlp کو خودکار طور پر اپ ڈیٹ کرتا ہے، اس لیے جیسے ہی اپ اسٹریم حل شائع کرے، یہ خود بخود لاگو ہو جائے گا۔',
      ipBlock: 'آپ کا IP ایڈریس YouTube کی جانب سے بلاک شدہ لگتا ہے۔ بعد میں دوبارہ کوشش کریں یا VPN استعمال کریں۔',
      rateLimit: 'YouTube درخواستوں کو ریٹ لمٹ کر رہا ہے۔ ایک منٹ انتظار کر کے دوبارہ کوشش کریں۔',
      ageRestricted: 'یہ ویڈیو عمر کی پابندی کے ساتھ ہے اور سائن اِن اکاؤنٹ کے بغیر ڈاؤن لوڈ نہیں ہو سکتی۔',
      unavailable: 'یہ ویڈیو دستیاب نہیں — ہو سکتا ہے پرائیویٹ، ڈیلیٹ، یا ریجن لاکڈ ہو۔',
      geoBlocked: 'یہ ویڈیو آپ کے ریجن میں دستیاب نہیں۔',
      outOfDiskSpace: 'ڈسک میں کافی جگہ نہیں۔ جگہ خالی کر کے دوبارہ کوشش کریں۔',
      unsupportedUrl: 'یہ ویڈیو URL نہیں لگتا۔ YouTube ویڈیو، Short، یا پلے لسٹ کا لنک پیسٹ کریں۔',
      chunkTransferFailure: 'سرور بار بار ڈاؤن لوڈ درمیان میں کاٹتا رہا اور yt-dlp نے کئی بار کوشش کے بعد ہار مان لی۔ یہ عموماً سب سے بڑے ویڈیو فارمیٹس (4K HDR / زیادہ بٹ ریٹ VP9) میں ہوتا ہے۔ دوبارہ کوشش کریں، نیٹ ورک/VPN تبدیل کریں، یا کم ریزولیوشن فارمیٹ چنیں۔',
      postprocessFailure: 'yt-dlp نے ڈاؤن لوڈ مکمل کر لیا لیکن پوسٹ پروسیسنگ (مرج / mux / تبدیلی) ناکام رہی۔ اکثر یہ ffmpeg کا عارضی مسئلہ ہوتا ہے — دوبارہ کوشش کریں، اور اگر برقرار رہے تو مختلف فارمیٹ کا مجموعہ آزمائیں۔',
      parse: 'سائٹ کا جواب پارس نہیں ہو سکا۔ ممکن ہے yt-dlp کا ایکسٹریکٹر پرانا ہو گیا ہو۔ Arroxy لانچ پر yt-dlp کو خودکار اپڈیٹ کرتا ہے — چند منٹ بعد دوبارہ کوشش کریں جب فکس آ جائے۔',
      network: 'نیٹ ورک کی خرابی۔ اپنا کنکشن چیک کر کے دوبارہ کوشش کریں۔',
      drmProtected: 'یہ ویڈیو DRM سے محفوظ ہے۔ yt-dlp DRM نہیں ہٹا سکتا، اس لیے فائل ڈاؤن لوڈ نہیں ہو سکتی۔',
      loginRequired: 'اس ویڈیو کے لیے سائن اِن اکاؤنٹ ضروری ہے۔ cookies.txt سیٹ اپ کریں (ترتیبات → Cookies) اور دوبارہ کوشش کریں۔',
      unknown: 'ڈاؤن لوڈ ناکام ہو گیا۔ نیچے خام آؤٹ پٹ دیکھیں۔'
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
  playlistPresets: {
    type: { video: 'Video', audio: 'Audio' },
    videoFormat: {
      best: 'Best codec',
      mp4: 'MP4 (H.264)'
    },
    videoFormatDesc: {
      best: 'Highest available codec per item',
      mp4: 'H.264 + AAC preferred, MP4 container · best-effort'
    },
    tier: {
      best: 'Best quality',
      '2160': 'Up to 4K',
      '1440': 'Up to 1440p',
      '1080': 'Up to 1080p',
      '720': 'Up to 720p',
      '480': 'Up to 480p',
      '360': 'Up to 360p'
    },
    tierDesc: {
      best: 'Highest available video + audio per item',
      '2160': 'Capped at 2160p, falls back to lower per item',
      '1440': 'Capped at 2K, falls back to lower per item',
      '1080': 'Capped at 1080p, falls back to lower per item',
      '720': 'Smaller files, broad compatibility',
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
      best: 'Native best audio, no re-encode',
      mp3: 'Convert to MP3',
      m4a: 'Convert to M4A (AAC)',
      opus: 'Convert to Opus'
    },
    audioFormatBitrate: 'Audio ({{format}} {{kbps}}K)',
    mp4Cap: 'H.264 above 1080p is not available on YouTube — capped to 1080p automatically'
  },
  formatLabel: {
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
  },
  networkPacing: {
    heading: 'آہستہ ڈاؤن لوڈز',
    description: 'ہر ڈاؤن لوڈ کے دوران چھوٹے وقفے شامل کرتا ہے تاکہ Arroxy سائٹ پر زیادہ دباؤ نہ ڈالے۔ قدریں سیکنڈ میں ہیں (جب تک الگ نہ بتایا جائے)۔',
    tooltip: 'یہ وقفے ہر ڈاؤن لوڈ کے اندر ہوتے ہیں۔ Arroxy پھر بھی قطار میں موجود ڈاؤن لوڈز کو ایک ایک کر کے چلاتا ہے۔',
    summary: 'انتظار: {{requests}} چیک کرنے کے درمیان، {{downloads}} میڈیا شروع ہونے سے پہلے، {{subtitles}} سب ٹائٹل فائلوں سے پہلے۔ کنکشنز: {{fragments}}۔',
    presets: {
      off: {
        label: 'بند',
        description: 'صرف وہ چھوٹے بنیادی وقفے استعمال کرتا ہے جو Arroxy میڈیا اور سب ٹائٹلز کے لیے رکھتا ہے۔'
      },
      balanced: {
        label: 'متوازن',
        description: 'پہلے سے طے شدہ۔ مختصر وقفے شامل کرتا ہے اور ایک ڈاؤن لوڈ کنکشن استعمال کرتا ہے۔'
      },
      careful: {
        label: 'محتاط',
        description: 'بڑی پلے لسٹس یا ان نیٹ ورکس کے لیے زیادہ وقفے شامل کرتا ہے جو اکثر حدود تک پہنچتے ہیں۔'
      },
      custom: {
        label: 'حسب ضرورت',
        description: 'فی ڈاؤن لوڈ ایڈوانسڈ کنٹرولز خود ترتیب دیں۔'
      }
    },
    fields: {
      sleepRequests: 'میٹا ڈیٹا چیکس کے درمیان انتظار',
      sleepInterval: 'میڈیا شروع ہونے سے پہلے وقفہ: کم از کم',
      maxSleepInterval: 'میڈیا شروع ہونے سے پہلے وقفہ: زیادہ سے زیادہ',
      concurrentFragments: 'ڈاؤن لوڈ کنکشنز'
    }
  },
  share: {
    title: 'Arroxy شیئر کریں',
    description: 'Arroxy مفت اور اوپن سورس ہے۔ شیئر کرنے سے زیادہ لوگ اسے دریافت کر سکتے ہیں۔',
    copyLink: 'لنک کاپی کریں',
    copied: 'کاپی ہو گیا!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy شیئر کریں',
    footerLabel: 'شیئر کریں',
    shareAction: 'Arroxy شیئر کریں',
    inlineCard: {
      body: 'Arroxy پسند آ رہا ہے؟ کسی ایسے شخص کے ساتھ شیئر کریں جسے یہ مفید لگ سکتا ہو۔',
      dismiss: 'شیئر کی تجویز برخاست کریں'
    },
    highValueBanner: {
      body: 'Arroxy پسند آ رہا ہے؟ دوسروں کو اسے دریافت کرنے میں مدد کریں۔',
      dismiss: 'شیئر کی تجویز برخاست کریں'
    }
  }
} as const;

export default ur;
