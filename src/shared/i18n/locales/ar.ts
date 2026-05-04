const ar = {
  common: {
    back: 'رجوع',
    continue: 'متابعة',
    retry: 'إعادة المحاولة',
    startOver: 'البدء من جديد',
    loading: 'جارٍ التحميل…'
  },
  app: {
    feedback: 'ملاحظات',
    logs: 'السجلات',
    feedbackNudge: 'هل تستمتع بـ Arroxy؟ يسعدني سماع رأيك! 💬',
    debugCopied: 'تم النسخ!',
    debugCopyTitle: 'نسخ معلومات التصحيح (إصدارات Electron والنظام وChrome)',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير'
  },
  titleBar: {
    close: 'إغلاق',
    minimize: 'تصغير',
    maximize: 'تكبير',
    restore: 'استعادة'
  },
  splash: {
    greeting: 'مرحباً، أهلاً بعودتك!',
    warmup: 'Arroxy يستعد…',
    warning: 'الإعداد غير مكتمل — قد لا تعمل بعض الميزات'
  },
  theme: {
    light: 'الوضع الفاتح',
    dark: 'الوضع الداكن',
    system: 'إعداد النظام الافتراضي'
  },
  language: {
    label: 'اللغة'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'الصيغة',
      subtitles: 'الترجمات',
      sponsorblock: 'SponsorBlock',
      output: 'الإخراج',
      folder: 'حفظ',
      confirm: 'تأكيد'
    },
    url: {
      heading: 'رابط YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'يدعم روابط youtube.com وyoutu.be',
      fetchFormats: 'جلب الصيغ',
      mascotIdle: 'أرسل لي رابط YouTube (فيديو أو Short) — ثم اضغط "جلب الصيغ" وسأبدأ العمل ✨',
      mascotBusy: 'جارٍ التنزيل في الخلفية… أستطيع تعدد المهام 😎',
      advanced: 'متقدم',
      clearAria: 'مسح الرابط',
      clipboard: {
        toggle: 'مراقبة الحافظة',
        toggleDescription: 'يملأ حقل الرابط تلقائياً عند نسخ رابط YouTube.',
        dialog: {
          title: 'تم اكتشاف رابط YouTube',
          body: 'هل تريد استخدام هذا الرابط من الحافظة؟',
          useButton: 'استخدام الرابط',
          disableButton: 'تعطيل',
          cancelButton: 'إلغاء',
          disableNote: 'يمكنك إعادة تفعيل مراقبة الحافظة لاحقاً في الإعدادات المتقدمة.'
        }
      },
      cookies: {
        toggle: 'استخدام ملف الكوكيز',
        toggleDescription: 'يساعد مع مقاطع الفيديو المقيدة بالعمر والمخصصة للأعضاء والخاصة بالحساب.',
        risk: 'تحذير: يحتوي cookies.txt على جميع جلسات تسجيل الدخول لذلك المتصفح — احتفظ به سرياً.',
        fileLabel: 'ملف الكوكيز',
        choose: 'اختيار…',
        clear: 'مسح',
        placeholder: 'لم يتم اختيار ملف',
        helpLink: 'كيف أصدّر الكوكيز؟',
        enabledButNoFile: 'اختر ملفاً لاستخدام الكوكيز',
        banWarning: 'قد يُعلّم YouTube — وأحياناً يحظر — الحسابات التي يستخدم yt-dlp كوكيزها. استخدم حساباً مؤقتاً إن أمكن.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      closeToTray: {
        toggle: 'الإخفاء في علبة النظام عند الإغلاق',
        toggleDescription: 'تستمر التنزيلات في الخلفية بعد إغلاق النافذة.'
      },
      analytics: {
        toggle: 'إرسال إحصائيات الاستخدام المجهولة',
        toggleDescription: 'يحسب فقط مرات تشغيل التطبيق. بدون عناوين URL أو أسماء ملفات أو بيانات شخصية.'
      }
    },
    subtitles: {
      heading: 'الترجمات',
      autoBadge: 'تلقائي',
      hint: 'ستُحفظ الملفات الجانبية بجانب الفيديو',
      noLanguages: 'لا توجد ترجمات متاحة لهذا الفيديو',
      skip: 'تخطي',
      skipSubs: 'تخطي لهذا الفيديو',
      selectAll: 'تحديد الكل',
      deselectAll: 'إلغاء تحديد الكل',
      mascot: 'اختر صفراً أو واحداً أو أكثر — الأمر يعود لك تماماً ✨',
      searchPlaceholder: 'البحث عن لغات…',
      noMatches: 'لا توجد لغات مطابقة',
      clearAll: 'مسح الكل',
      noSelected: 'لم يتم اختيار أي ترجمة',
      selectedNote_one: 'سيتم تنزيل {{count}} ترجمة',
      selectedNote_other: 'سيتم تنزيل {{count}} ترجمات',
      sectionManual: 'يدوي',
      sectionAuto: 'مولّد تلقائياً',
      saveMode: {
        heading: 'حفظ بصيغة',
        sidecar: 'بجانب الفيديو',
        embed: 'تضمين في الفيديو',
        subfolder: 'مجلد فرعي subtitles/'
      },
      format: {
        heading: 'الصيغة'
      },
      embedNote: 'يحفظ وضع التضمين المخرج بصيغة .mkv لضمان تضمين مسارات الترجمة بشكل موثوق.',
      autoAssNote: 'ستُحفظ الترجمات التلقائية بصيغة SRT بدلاً من ASS — يتم دائماً تنظيفها من تكرارات YouTube المتدحرجة التي لا يستطيع محوّل ASS لدينا إعادة إنتاجها بعد.'
    },
    sponsorblock: {
      modeHeading: 'تصفية الرعاة',
      mode: {
        off: 'إيقاف',
        mark: 'تحديد كفصول',
        remove: 'إزالة المقاطع'
      },
      modeHint: {
        off: 'لا يوجد SponsorBlock — يُشغَّل الفيديو كما رُفع.',
        mark: 'يُحدد مقاطع الرعاة كفصول (غير تدميري).',
        remove: 'يحذف مقاطع الرعاة من الفيديو باستخدام FFmpeg.'
      },
      categoriesHeading: 'الفئات',
      cat: {
        sponsor: 'رعاية',
        intro: 'مقدمة',
        outro: 'خاتمة',
        selfpromo: 'ترويج ذاتي',
        music_offtopic: 'موسيقى خارج الموضوع',
        preview: 'معاينة',
        filler: 'حشو'
      }
    },
    formats: {
      quickPresets: 'إعدادات سريعة',
      video: 'فيديو',
      audio: 'صوت',
      noAudio: 'بدون صوت',
      videoOnly: 'فيديو فقط',
      audioOnly: 'صوت فقط',
      audioOnlyOption: 'صوت فقط (بدون فيديو)',
      mascot: 'الأفضل + الأفضل = أقصى جودة. هذا ما كنت سأختاره!',
      sniffing: 'جارٍ البحث عن أفضل الصيغ لك…',
      loadingHint: 'عادةً يستغرق ثانية',
      loadingAria: 'جارٍ تحميل الصيغ',
      sizeUnknown: 'الحجم غير معروف',
      total: 'الإجمالي'
    },
    folder: {
      heading: 'الحفظ في',
      downloads: 'التنزيلات',
      videos: 'الأفلام',
      desktop: 'سطح المكتب',
      music: 'الموسيقى',
      documents: 'المستندات',
      pictures: 'الصور',
      home: 'الرئيسية',
      custom: 'مخصص…',
      subfolder: {
        toggle: 'الحفظ داخل مجلد فرعي',
        placeholder: 'مثل lo-fi rips',
        invalid: 'اسم المجلد يحتوي على أحرف غير صالحة'
      }
    },
    output: {
      embedChapters: {
        label: 'تضمين الفصول',
        description: 'علامات فصول قابلة للتنقل في أي مشغّل حديث.'
      },
      embedMetadata: {
        label: 'تضمين البيانات الوصفية',
        description: 'كتابة العنوان والفنان والوصف وتاريخ الرفع في الملف.'
      },
      embedThumbnail: {
        label: 'تضمين الصورة المصغرة',
        description: 'صورة الغلاف داخل الملف. MP4 / M4A فقط — يُتخطى عند تضمين الترجمات.'
      },
      writeDescription: {
        label: 'حفظ الوصف',
        description: 'يحفظ وصف الفيديو كملف نصي .description بجانب التنزيل.'
      },
      writeThumbnail: {
        label: 'حفظ الصورة المصغرة',
        description: 'يحفظ الصورة المصغرة كملف صورة .jpg بجانب التنزيل.'
      }
    },
    confirm: {
      readyHeadline: 'جاهز للتنزيل!',
      landIn: 'سيُحفظ ملفك في',
      labelVideo: 'فيديو',
      labelAudio: 'صوت',
      labelSubtitles: 'الترجمات',
      subtitlesNone: '—',
      labelSaveTo: 'الحفظ في',
      labelSize: 'الحجم',
      sizeUnknown: 'غير معروف',
      nothingToDownload: 'الإعداد المسبق "ترجمات فقط" مفعّل ولكن لم يتم اختيار أي لغة ترجمة — لن يتم تنزيل أي شيء.',
      audioOnly: 'صوت فقط',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'يبدأ عند انتهاء التنزيلات الأخرى — يحصل على كامل عرض النطاق',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'يبدأ فوراً — يعمل جنباً إلى جنب مع التنزيلات النشطة الأخرى'
    },
    error: {
      icon: 'خطأ'
    }
  },
  videoCard: {
    titlePlaceholder: 'جارٍ التحميل…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'قائمة التنزيل',
    toggleTitle: 'تبديل قائمة التنزيل',
    empty: 'ستظهر التنزيلات التي تضيفها إلى القائمة هنا',
    noDownloads: 'لا توجد تنزيلات بعد.',
    activeCount: '{{count}} جارٍ التنزيل · {{percent}}%',
    clear: 'مسح',
    clearTitle: 'مسح التنزيلات المكتملة',
    tip: 'تنزيلك في قائمة الانتظار أدناه — افتح في أي وقت لمتابعة التقدم.',
    item: {
      doneAt: 'اكتمل {{time}}',
      paused: 'موقوف',
      defaultError: 'فشل التنزيل',
      openUrl: 'فتح الرابط',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      cancel: 'إلغاء',
      remove: 'إزالة'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'متاح',
    youHave: '— لديك {{currentVersion}}',
    install: 'تثبيت وإعادة التشغيل',
    downloading: 'جارٍ التنزيل…',
    download: 'Download ↗',
    dismiss: 'إخفاء شريط التحديث',
    copy: 'نسخ الأمر إلى الحافظة',
    copied: 'تم نسخ الأمر إلى الحافظة',
    installFailed: 'فشل التحديث',
    retry: 'إعادة المحاولة'
  },
  status: {
    preparingBinaries: 'جارٍ تحضير الثنائيات…',
    mintingToken: 'جارٍ إنشاء رمز YouTube…',
    remintingToken: 'جارٍ إعادة إنشاء الرمز…',
    startingYtdlp: 'جارٍ تشغيل عملية yt-dlp…',
    downloadingMedia: 'جارٍ تنزيل الفيديو والصوت…',
    mergingFormats: 'جارٍ دمج الصوت والفيديو…',
    fetchingSubtitles: 'جارٍ جلب الترجمات…',
    sleepingBetweenRequests: 'الانتظار {{seconds}} ثانية لتجنب تجاوز الحد…',
    subtitlesFailed: 'تم حفظ الفيديو — تعذّر تنزيل بعض الترجمات',
    cancelled: 'تم إلغاء التنزيل',
    complete: 'اكتمل التنزيل',
    usedExtractorFallback: 'تم التنزيل باستخدام المستخرج المخفف — أعدّ cookies.txt لتنزيلات أكثر موثوقية',
    ytdlpProcessError: 'خطأ في عملية yt-dlp: {{error}}',
    ytdlpExitCode: 'خرج yt-dlp بالرمز {{code}}',
    downloadingBinary: 'جارٍ تنزيل ثنائي {{name}}…',
    unknownStartupFailure: 'فشل غير معروف في بدء التنزيل'
  },
  errors: {
    ytdlp: {
      botBlock: 'علّمت YouTube هذا الطلب كروبوت. حاول مرة أخرى بعد لحظة.',
      ipBlock: 'يبدو أن عنوان IP الخاص بك محظور من قِبل YouTube. حاول لاحقاً أو استخدم VPN.',
      rateLimit: 'تُقيّد YouTube الطلبات. انتظر دقيقة ثم حاول مجدداً.',
      ageRestricted: 'هذا الفيديو مقيّد بالعمر ولا يمكن تنزيله بدون حساب مسجّل الدخول.',
      unavailable: 'هذا الفيديو غير متاح — قد يكون خاصاً أو محذوفاً أو مقيّداً بالمنطقة.',
      geoBlocked: 'هذا الفيديو غير متاح في منطقتك.',
      outOfDiskSpace: 'مساحة القرص غير كافية. أفرغ مساحة وأعد المحاولة.'
    }
  },
  presets: {
    'best-quality': {
      label: 'أفضل جودة',
      desc: 'أعلى دقة + أفضل صوت'
    },
    balanced: {
      label: 'متوازن',
      desc: '720p كحد أقصى + صوت جيد'
    },
    'audio-only': {
      label: 'صوت فقط',
      desc: 'بدون فيديو، أفضل صوت'
    },
    'small-file': {
      label: 'ملف صغير',
      desc: 'أدنى دقة + صوت منخفض'
    },
    'subtitle-only': {
      label: 'ترجمات فقط',
      desc: 'بدون فيديو، بدون صوت، ترجمات فقط'
    }
  },
  formatLabel: {
    audioOnly: 'صوت فقط',
    audioFallback: 'صوت',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'خامل',
      statusActive_one: '1 جارٍ التنزيل · {{percent}}%',
      statusActive_other: '{{count}} جارٍ التنزيل · {{percent}}%',
      open: 'فتح Arroxy',
      quit: 'الخروج من Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} تنزيل قيد التقدم',
      message_other: '{{count}} تنزيلات قيد التقدم',
      detail: 'سيؤدي الإغلاق إلى إلغاء جميع التنزيلات النشطة.',
      confirm: 'إلغاء التنزيلات والخروج',
      keep: 'الاستمرار في التنزيل'
    },
    closeToTray: {
      message: 'هل تريد إخفاء Arroxy في علبة النظام عند الإغلاق؟',
      detail: 'يستمر Arroxy في العمل وينهي التنزيلات النشطة. يمكنك تغيير ذلك لاحقاً في الإعدادات المتقدمة.',
      hide: 'الإخفاء في علبة النظام',
      quit: 'الخروج',
      remember: 'لا تسألني مجدداً'
    }
  }
} as const;

export default ar;
