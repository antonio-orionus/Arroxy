const ps = {
  common: {
    back: 'شاته',
    continue: 'دوام ورکړه',
    retry: 'بیا هڅه وکړه',
    startOver: 'له سره پیل کړه'
  },
  app: {
    feedback: 'نظر',
    logs: 'لاګونه',
    feedbackNudge: 'ایا Arroxy خوند درکوي؟ ستاسو د اورولو شوق لرم! 💬',
    debugCopied: 'کاپي شو!',
    debugCopyTitle: 'د ډیبګ معلومات کاپي کړئ (Electron، OS، Chrome نسخې)',
    zoomIn: 'لویول',
    zoomOut: 'کوچنیول'
  },
  about: {
    button: 'د اړوند',
    openTitle: 'د Arroxy اړوند',
    tagline: 'د ډیسکټاپ لپاره چټک او اسانه ویډیو او غږ ډاونلوډر.',
    websiteLink: 'ویب پاڼه',
    githubLink: 'GitHub',
    licenseLine: 'MIT جواز · د Antonio Orionus لخوا',
    thirdPartyNotices: 'د دریم ډلې خبرتیاوې وګورئ'
  },
  titleBar: {
    close: 'تړل',
    minimize: 'کوچنی کول',
    maximize: 'لوی کول',
    restore: 'بیرته راوستل'
  },
  splash: {
    greeting: 'سلام، ښه راغلاست!',
    warmup: 'Arroxy چمتو کیږي…',
    downloading: '{{binary}} ډاونلوډ کیږي…',
    warmupFailedNoDiag: 'نصب ناکام شو. د توضیحاتو لپاره د نصب لاګ خلاص کړئ.'
  },
  repair: {
    title: 'نصب ستاسو مرستې ته اړتیا لري',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'تصدیق نه شو.',
      downloadFailed: 'ډاونلوډ ناکام شو. خپله د انټرنیټ اتصال وګورئ او بیا هڅه وکړئ.',
      extractFailed: 'د آرشیف استخراج ناکام شو. ډاونلوډ ممکن خرابه وي — بیا هڅه وکړئ.',
      hashFailed: 'د ډاونلوډ شوي فایل checksum سره نه سمیږي. ډاونلوډ بیا وکړئ.',
      spawnFailed: 'فایل ورک دی یا نه شي پیل کیدی. یو کاري کاپي غوره کړئ.',
      permissionDenied: 'سیسټم د فایل چلولو نه انکار وکړ. یو کاپي چې باور پرې لرئ غوره کړئ یا د ادمین په توګه بیا هڅه وکړئ.',
      blockedOrQuarantined: 'Windows فایل بنده کړه (SmartScreen / Defender). یو نصب شوی کاپي غوره کړئ یا د runtime فولډر whitelist کړئ.',
      badExitCode: 'د binary نه --version ته ځواب ونه ورکاوه. ممکن خرابه وي یا غلط جوړښت وي.',
      timeout: 'د نسخې پلټنه وخت پای شو. فایل ممکن ودریدلی وي — بیا هڅه وکړئ.',
      pairIncomplete: 'ffmpeg او ffprobe دواړه باید د یوه جوړه برخه وي.'
    },
    actions: {
      chooseExecutable: 'د اجرا وړ فایل غوره کړئ',
      resetToDefault: 'ډیفالټ ته بیرته شئ',
      retrySetup: 'نصب بیا وکړئ',
      cancel: 'لغوه کړئ',
      openDependencyFolder: 'د dependency فولډر خلاص کړئ',
      viewSetupLog: 'د نصب لاګ وګورئ'
    }
  },
  theme: {
    light: 'رڼا حالت',
    dark: 'تیاره حالت',
    system: 'د سیسټم ډیفالټ'
  },
  language: {
    label: 'ژبه'
  },
  wizard: {
    steps: {
      url: 'URL',
      playlistItems: 'Playlist',
      playlistPresets: 'کیفیت',
      formats: 'بڼه',
      subtitles: 'ژباړلیکونه',
      sponsorblock: 'SponsorBlock',
      output: 'محصول',
      folder: 'خوندي کړه',
      confirm: 'تایید کړه'
    },
    playlist: {
      heading: 'د Playlist توکي',
      itemCount_one: '{{count}} ویډیو',
      itemCount_other: '{{count}} ویډیوګانې',
      itemCountAudio_one: '{{count}} ټریک',
      itemCountAudio_other: '{{count}} ټریکونه',
      selectAll: 'ټول غوره کړئ',
      selectNone: 'هیڅ غوره مه کوئ',
      rangeFrom: 'له',
      rangeTo: 'تر',
      rangeApply: 'سلسله پلي کړئ',
      selectedCount_one: '{{count}} غوره شوی',
      selectedCount_other: '{{count}} غوره شوي',
      noSelection: 'دوام کولو لپاره لږترلږه یو ویډیو غوره کړئ',
      loadingItems: 'Playlist ترلاسه کیږي…',
      thumbnailAlt: 'د ویډیو تھمبنیل',
      durationUnknown: 'live',
      syncChange: 'فولډر بدل کړه…',
      syncApply: 'همغږي پلي کړه',
      syncScanning: 'فولډر کتل کېږي…',
      syncFoundTitle: 'مخکې په فولډر کې شته',
      syncFoundDesc: 'له دې ویډیوګانو څخه {{n}} مخکې په {{dir}} کې شته. یوازې نوي ډاونلوډولو لپاره همغږي کوې؟',
      syncNoneTitle: 'تر اوسه هېڅ نه دي ډاونلوډ شوي',
      syncNoneDesc: 'د دې پلی‌لېست هېڅ ویډیو په {{dir}} کې ونه موندل شوه.',
      alreadyDownloaded: 'مخکې ډاونلوډ شوی'
    },
    playlistPresets: {
      heading: 'د بیچ لپاره کیفیت وټاکئ',
      subhead: 'هر ویډیو خپلواکه د غوره شوي کچې سره حل کوي — مخلوط Playlist ونه بیا پرته له مشکل کار کوي.',
      itemCount_one: '{{count}} توکی',
      itemCount_other: '{{count}} توکي'
    },
    mixedPrompt: {
      title: 'دا لینک یو Playlist لري',
      body: 'یوازې هغه ویډیو چې کلیک مو کاوه، که د Playlist نه غوره کول غواړئ؟ بعد به ځانګړي ویډیوګانې یا سلسله غوره کړئ.',
      singleVideo: 'یوازې دا یو',
      pickFromPlaylist: 'له Playlist نه غوره کړئ'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'بڼې ترلاسه کړه',
      features: {
        heading: 'Arroxy څه ډاونلوډ کولی شي',
        youtube: {
          heading: 'YouTube',
          video: 'ویډیوګانې',
          channel: 'چینلونه',
          playlist: 'Playlistونه',
          short: 'Shorts',
          music: 'موسیقي',
          podcast: 'Podcastونه'
        },
        anySite: {
          heading: '2000+ سایټونه',
          video: 'ویډیوګانې',
          videoPlaylist: 'د ویډیو Playlistونه',
          musicPlaylist: 'د موسیقۍ Playlistونه'
        },
        always: {
          heading: 'تل شتون لري',
          audioOnly: 'یوازې غږونه',
          subtitles: 'ژباړلیکونه'
        }
      },
      mascotIdle: 'یو YouTube لینک (ویډیو یا Short) راکړئ — بیا "بڼې ترلاسه کړه" کلیک وکړئ او زه کار پیل کوم ✨',
      mascotBusy: 'شاتهپرده ډاونلوډ کیږي… زه کولی شم له ډیرو کارونو سره معامله وکړم 😎',
      advanced: 'پرمختللي',
      clearAria: 'URL پاکول',
      clipboard: {
        toggle: 'کلیپبورډ وګورئ',
        toggleDescription: 'کله چې تاسو یو YouTube لینک کاپي کړئ، د URL ساحه اتوماتیک ډکه کړئ.',
        dialog: {
          title: 'YouTube URL وموندل شو',
          body: 'ایا د کلیپبورډ دا لینک وکاروئ؟',
          useButton: 'URL وکاروئ',
          disableButton: 'غیر فعاله کړه',
          cancelButton: 'لغوه کړه',
          disableNote: 'تاسو کولی شئ وروسته د پرمختللو تنظیماتو کې د کلیپبورډ لیدل بیا فعاله کړئ.'
        }
      },
      cookies: {
        sourceLabel: 'د کوکیزو سرچینه',
        sourceOff: 'بند',
        sourceFile: 'فایل',
        sourceBrowser: 'براوزر',
        toggleDescription: 'د عمر محدودیت لرونکو، یوازې غړو، او شخصي ویډیوګانو سره مرسته کوي.',
        risk: 'خطر: cookies.txt د هغه براوزر هر ننوتلی سیشن لري — دا خصوصي وساتئ.',
        fileLabel: 'کوکیز فایل',
        choose: 'غوره کړئ…',
        clear: 'پاکول',
        placeholder: 'هیڅ فایل غوره نه دی شوی',
        helpLink: 'کوکیز څنګه صادر کړم؟',
        enabledButNoFile: 'د کوکیزو کارولو لپاره یو فایل غوره کړئ',
        browserLabel: 'براوزر',
        browserPlaceholder: 'براوزر غوره کړئ…',
        browserHelp: 'کوکیز مستقیم له براوزر نه لولي. د Chromium کورنۍ براوزرونو لپاره براوزر بند باید وي.',
        enabledButNoBrowser: 'د کوکیزو کارولو لپاره یو براوزر غوره کړئ',
        banWarning: 'YouTube ممکن هغه حسابونه چې د yt-dlp لخوا د کوکیزو لپاره کارول کیږي بنده کړي — کله چې ممکنه وي یو لنډمهاله حساب وکاروئ.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt ځایی ترلاسه کړئ (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'د پراکسي له لارې ترافیک لیږدول — د جغرافیایي محدودیتونو لرونکي مینځپانګې لپاره ګټور.',
        placeholder: 'http://host:port',
        clear: 'پاکول'
      },
      singleFilenameId: {
        toggle: 'د یوازینو فایل نومونو ته د ویډیو ID ورزیات کړه',
        toggleDescription: 'کله چې سرلیکونه بدل شي یا سره ټکر وکړي، یو ځلني ډاونلوډونه ځانګړي ساتي.'
      },
      closeToTray: {
        toggle: 'د تړولو پر وخت ټرې ته پټ کړه',
        toggleDescription: 'د کړکۍ د تړولو وروسته شاتهپرده ډاونلوډونه دوام کړئ.'
      },
      analytics: {
        toggle: 'د ناپیژندل شوي کارونې احصائیې واستوئ',
        toggleDescription: 'یوازې د اپلیکیشن پیلونه شمیري. هیڅ URL، د فایل نومونه، یا شخصي معلومات نه شته.'
      }
    },
    subtitles: {
      autoBadge: 'اتوماتیک',
      noLanguages: 'د دې ویډیو لپاره هیڅ ژباړلیک شتون نلري',
      skip: 'پریږدئ',
      skipSubs: 'د دې ویډیو لپاره پریږدئ',
      mascot: 'صفر، یو، یا ډیر غوره کړئ — بشپړ ستاسو خوښه ده ✨',
      searchPlaceholder: 'ژبې لټول…',
      noMatches: 'هیڅ ژبه سره برابره نه ده',
      clearAll: 'ټول پاکول',
      noSelected: 'هیڅ ژباړلیک غوره نه دی شوی',
      selectedNote_one: '{{count}} ژباړلیک به ډاونلوډ شي',
      selectedNote_other: '{{count}} ژباړلیکونه به ډاونلوډ شي',
      sectionManual: 'لاسي',
      sectionAuto: 'اتوماتیک جوړ شوی',
      saveMode: {
        heading: 'د خوندي کولو بڼه',
        sidecar: 'د ویډیو سره یوځای',
        embed: 'ویډیو کې ځای پر ځای کړه',
        subfolder: 'subtitles/ فرعي فولډر'
      },
      format: {
        heading: 'بڼه'
      },
      embedNote: 'د Embed حالت محصول د .mkv په توګه خوندي کوي ترڅو د ژباړلیکونو ټریکونه باوري طریقه سره ځای پر ځای شي.',
      autoAssNote: 'اتوماتیک کیپشنونه به د ASS پر ځای SRT بڼه کې خوندي شي — دوی تل د YouTube د رولینګ کیو تکرار پاکیږي، کوم چې زموږ ASS کنورتر لا نه شي تقلید کولی.'
    },
    sponsorblock: {
      modeHeading: 'د سپانسر فلټر کول',
      mode: {
        off: 'بند',
        mark: 'د فصلونو په توګه نښه کړه',
        remove: 'برخې لیرې کړه'
      },
      modeHint: {
        off: 'SponsorBlock نشته — ویډیو لکه اپلوډ شوي بیا کیږي.',
        mark: 'د سپانسر برخې د فصلونو (غیر ویجاړونکي) په توګه نښه کوي.',
        remove: 'FFmpeg سره د سپانسر برخې له ویډیو څخه غوڅوي.'
      },
      categoriesHeading: 'کټګورۍ',
      cat: {
        sponsor: 'سپانسر',
        intro: 'پیژندنه',
        outro: 'پای',
        selfpromo: 'ځان پروموشن',
        music_offtopic: 'Music off-topic',
        preview: 'پریویو',
        filler: 'ډکول'
      }
    },
    formats: {
      quickPresets: 'ګړندي پریسټونه',
      video: 'ویډیو',
      audio: 'غږ',
      noAudio: 'غږ نشته',
      videoOnly: 'یوازې ویډیو',
      audioOnly: 'یوازې غږ',
      audioOnlyOption: 'یوازې غږ (ویډیو نشته)',
      mascot: 'بهترین + بهترین = اعظمي کیفیت. زه به دا غوره کړم!',
      sniffing: 'ستاسو لپاره غوره بڼې لټوم…',
      loadingHint: 'مهرباني وکړئ انتظار وکړئ تر پلټنه پای ته ورسیږي — Playlistونه او لټونونه ممکن یو څه وخت ونیسي.',
      loadingAria: 'بڼې بارول',
      sizeUnknown: 'اندازه نامعلومه',
      skipToConfirm: 'تایید ته پریږدئ',
      skipToConfirmTooltip: 'ستاسو خوندي کړل شوي غوره توبونه د ټولو پاتې مرحلو لپاره کاروي. د ترتیب بدلولو لپاره، پرځای یې ګام پر ګام دوام وکړئ — ستاسو انتخاب به د راتلونکي ځل لپاره خوندي شي.',
      total: 'ټول',
      keepAudio: 'لکه چې دی وساتئ',
      keepAudioMeta: 'ورته غږ',
      convert: {
        label: 'بدلول',
        uncompressed: 'بدلول · غیر فشارشوی',
        bitrate: 'بټ ریټ',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'د غږ بدلول یوازې د غږ حالت ته اړتیا لري (د ویډیو انتخاب لغوه کړئ).',
        requiresLossy: 'یو اصلي سټریم غوره شوی — بټ ریټ یوازې د mp3, m4a, یا opus ته د بدلولو پر وخت پلي کیږي.'
      },
      botWall: {
        heading: 'YouTube دا پلټنه محدوده کړه',
        bodyUnconfigured: 'د بڼو لیست ممکن نامکمل وي. د پرمختللو تنظیماتو کې کوکیز تنظیم کړئ، یا شبکه بدله کړئ او بیا هڅه وکړئ.',
        bodyDisabled: 'کوکیز تنظیم شوي خو بند دي. د بشپړ لیست لپاره کوکیز فعال کړئ او بیا هڅه وکړئ، یا شبکه بدله کړئ او بیا هڅه وکړئ.',
        bodyEnabled: 'حتی د کوکیزو سره، YouTube دا پلټنه محدوده کړه. وروسته بیا هڅه وکړئ یا شبکه بدله کړئ.',
        retryCta: 'بیا هڅه وکړئ',
        enableRetryCta: 'کوکیز فعال کړئ او بیا هڅه وکړئ'
      },
      cookiesError: {
        heading: 'کوکیز ممکن لامل وي',
        currentModeLabel: 'د کوکیزو سرچینه',
        currentModeFile: 'فایل',
        currentModeBrowser: 'براوزر',
        explanationFile: 'ستاسو د کوکیزو فایل ممکن خالي، پخوانی، یا د غلط بڼې وي (yt-dlp Netscape cookies.txt تمه لري). هڅه وکړئ کوکیز بیا صادر کړئ، بل فایل غوره کړئ، د براوزر حالت ته بدل شئ، یا کوکیز بند کړئ.',
        explanationBrowser: 'کوکیز مستقیم له براوزر نه لوستل کیږي. که براوزر اوس مهال چلیږي، د کوکیزو ډیټابیس ممکن بند وي (Chromium کورنۍ). براوزر باید YouTube ته ننوتلی وي. هڅه وکړئ براوزر وتړئ، بل براوزر ته بدل شئ، د فایل حالت ته بدل شئ، یا کوکیز بند کړئ.',
        openSettingsCta: 'د کوکیزو تنظیمات پرانیستل',
        needsCookies: {
          heading: 'دا سایټ ننوتل ته اړتیا لري',
          body: 'yt-dlp پرته د تصدیق نه دا ویډیو ته لاسرسی نه شو کولی. د پرمختللو تنظیماتو کې کوکیز تنظیم کړئ — هغه براوزر ته اشاره وکړئ چې مو ورسره ننوتلي یئ، یا یو cookies.txt فایل واردوئ.'
        },
        dpapi: {
          heading: 'Chrome کوکیز د Windows د کوډ کولو لخوا بند شوي',
          explanation: 'Chrome 127 او نوي نسخې کوکیز داسې کوډ کوي چې نور اپلیکیشنونه یې د Windows کې لوستلی نشي. لاندې یو له حلونو هڅه وکړئ.',
          fixFirefoxLabel: 'Firefox ته بدل شئ',
          fixFirefoxBody: 'Firefox د App-Bound Encryption نه کاروي. د کوکیزو تنظیمات پرانیستل او د براوزر له لیست نه Firefox غوره کړئ.',
          fixFileLabel: 'cookies.txt صادر کړئ',
          fixFileBody: 'د براوزر د توسیع سره له Chrome نه کوکیز صادر کړئ، بیا دا اپلیکیشن د فایل حالت ته بدل کړئ او صادر شوی فایل غوره کړئ.',
          fixUnsafeLabel: 'Chrome د App-Bound Encryption غیر فعاله سره پیل کړئ',
          fixUnsafeBody: 'د Chrome د پیل شارټ کټ کې --disable-features=LockProfileCookieDatabase اضافه کړئ. خبرداری: دا مخکې کوډ شوي کوکیز باطلوي، نو تاسو به له هر سایټ وتلئ او بیا ننوتل ضروري دي.',
          docsLinkLabel: 'yt-dlp اسناد (مسئله #10927)'
        }
      }
    },
    folder: {
      heading: 'خوندي کولو ځای',
      downloads: 'ډاونلوډونه',
      videos: 'فلمونه',
      desktop: 'ډیسکټاپ',
      music: 'موسیقي',
      documents: 'سندونه',
      pictures: 'انځورونه',
      home: 'کور',
      custom: 'دودیز…',
      subfolder: {
        toggle: 'فرعي فولډر کې خوندي کړه',
        placeholder: 'مثلاً lo-fi rips',
        invalid: 'د فولډر نوم کې غلط حروف شتون لري'
      }
    },
    output: {
      embedChapters: {
        label: 'فصلونه ځای پر ځای کړه',
        description: 'د هر عصري پلیر کې د ناوي وړ فصل نښانکیان.'
      },
      embedMetadata: {
        label: 'میټاډیټا ځای پر ځای کړه',
        description: 'سرلیک، هنرمند، توضیحات، او د اپلوډ نیټه فایل کې لیکل کیږي.'
      },
      embedThumbnail: {
        label: 'تھمبنیل ځای پر ځای کړه',
        description: 'فایل کې د پوښ اثر. MP4 / M4A یوازې — کله چې ژباړلیکونه ځای پر ځای شوي وي نه کارول کیږي.'
      },
      writeDescription: {
        label: 'توضیح خوندي کړه',
        description: 'د ویډیو توضیح د ډاونلوډ سره یوځای د .description متن فایل بڼه کې خوندي کوي.'
      },
      writeThumbnail: {
        label: 'تھمبنیل خوندي کړه',
        description: 'تھمبنیل د ډاونلوډ سره یوځای د .jpg انځور فایل بڼه کې خوندي کوي.'
      }
    },
    confirm: {
      readyHeadline: 'د راکشولو لپاره چمتو!',
      landIn: 'ستاسو فایل به دلته ځای پر ځای شي',
      labelVideo: 'ویډیو',
      labelAudio: 'غږ',
      labelSubtitles: 'ژباړلیکونه',
      subtitlesNone: '—',
      labelSaveTo: 'خوندي کولو ځای',
      labelSize: 'اندازه',
      sizeUnknown: 'نامعلومه',
      nothingToDownload: 'یوازې د ژباړلیکونو پریسټ فعال دی خو هیڅ د ژباړلیک ژبه غوره نه ده شوې — هیڅ شی ډاونلوډ نه کیږي.',
      thumbnailEmbedNotSupported: 'د Thumbnail embed پریښودل شو — د محصول container یې نه ملاتړي.',
      subtitleEmbedAudioOnly: 'د ژباړلیک embed sidecar ته بدل شو — د غږ ټریکونه د embed شوو ژباړلیک سټریمونو ملاتړ نه کوي.',
      audioOnly: 'یوازې غږ',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'کله چې نور ډاونلوډونه پای ته ورسیږي پیل کیږي — بشپړ بینډوډت ترلاسه کوي',
      pullIt: 'راکش یې کړه! ↓',
      pullItTooltip: 'سمدلاسه پیل کیږي — د نورو فعالو ډاونلوډونو سره یوځای چلیږي',
      labelPlaylist: 'Playlist',
      labelPreset: 'Preset',
      labelItems: 'توکي',
      itemsValue_one: '{{count}} له {{total}} ویډیو',
      itemsValue_other: '{{count}} له {{total}} ویډیوګانې',
      itemsValueAudio_one: '{{count}} له {{total}} ټریک',
      itemsValueAudio_other: '{{count}} له {{total}} ټریکونه'
    }
  },
  videoCard: {
    titlePlaceholder: 'بارول…'
  },
  queue: {
    header: 'د ډاونلوډ کتار',
    toggleTitle: 'د ډاونلوډ کتار پرانیستل/تړل',
    empty: 'هغه ډاونلوډونه چې تاسو کتار کې اچوئ دلته ښکاره کیږي',
    noDownloads: 'لا هیڅ ډاونلوډ نشته.',
    activeCount: '{{count}} ډاونلوډیږي · {{percent}}%',
    clear: 'پاکول',
    clearTitle: 'بشپړ شوي ډاونلوډونه پاکول',
    pauseAll: 'ټول ودروئ',
    pauseAllTitle: 'ټول فعال ډاونلوډونه ودروئ',
    cancelAll: 'ټول لغوه کړئ',
    cancelAllTitle: 'ټول فعال او انتظار کې ډاونلوډونه لغوه کړئ',
    tip: 'ستاسو ډاونلوډ لاندې کتار شوی — پرمختګ تعقیبولو لپاره هر وخت پرانیستلی شئ.',
    item: {
      doneAt: '{{time}} بشپړ شو',
      paused: 'درولی شوی',
      defaultError: 'ډاونلوډ ناکام شو',
      openUrl: 'URL پرانیستل',
      pause: 'درول',
      hold: 'ودرول',
      resume: 'دوام',
      cancel: 'لغوه کول',
      remove: 'لیرې کول'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'شتون لري',
    youHave: '— تاسو {{currentVersion}} لرئ',
    install: 'نصب کړه او بیا پیل کړه',
    downloading: 'ډاونلوډیږي…',
    download: 'Download ↗',
    dismiss: 'د تازه کولو بنر وتړئ',
    copy: 'امر کلیپبورډ ته کاپي کړئ',
    copied: 'امر کلیپبورډ ته کاپي شو',
    installFailed: 'تازه کول ناکام شو',
    retry: 'بیا هڅه وکړئ'
  },
  status: {
    preparingBinaries: 'بائنري فایلونه چمتو کیږي…',
    mintingToken: 'YouTube ټوکن جوړیږي…',
    remintingToken: 'ټوکن بیا جوړیږي…',
    startingYtdlp: 'yt-dlp پروسه پیلیږي…',
    downloadingMedia: 'ویډیو او غږ ډاونلوډیږي…',
    mergingFormats: 'غږ او ویډیو یوځای کیږي…',
    extractingAudio: 'غږ بدلیږي…',
    convertingVideo: 'ویډیو بدلیږي…',
    embeddingMetadata: 'میټاډیټا ځای پر ځای کیږي…',
    movingFiles: 'فایلونه لیږدول کیږي…',
    fetchingSubtitles: 'ژباړلیکونه ترلاسه کیږي…',
    sleepingBetweenRequests: 'د نرخ محدودیتونو مخنیوي لپاره {{seconds}} ثانیې انتظار…',
    subtitlesFailed: 'ویډیو خوندي شوه — ځینې ژباړلیکونه ډاونلوډ نه شول',
    cancelled: 'ډاونلوډ لغوه شو',
    complete: 'ډاونلوډ بشپړ شو',
    usedExtractorFallback: 'د آزاد ایکسټریکټر سره ډاونلوډ شو — د باوري ډاونلوډونو لپاره cookies.txt تنظیم کړئ',
    ytdlpProcessError: 'yt-dlp پروسه تیروتنه: {{error}}',
    ytdlpExitCode: 'yt-dlp د {{code}} کوډ سره وتلو',
    downloadingBinary: '{{name}} بائنري ډاونلوډیږي…',
    unknownStartupFailure: 'نامعلومه د پیل ناکامي',
    diskSpaceInsufficient: 'د ډیسک ځای کافي نه دی — {{required}} ته اړتیا ده، یوازې {{free}} شتون لري',
    fetchingSponsorBlock: 'SponsorBlock سره اړیکه نیول کیږي…',
    retryingSponsorBlock: 'SponsorBlock شتون نلري، بیا هڅه کیږي ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'د بوټ محافظت فعال شو. ستاسو IP پته ډیره احتمال نښه شوې (د ډیټاسینټر رینج یا ګڼ کارونکي VPN وتلو ټکی). خپل IP بدل کړئ یا بل VPN پای ټکی غوره کړئ او بیا هڅه وکړئ. که چیرې لا هم ناکامه وي، دا ممکن د YouTube خوا لنډمهاله بدلون وي — Arroxy د پیل پر وخت yt-dlp اتوماتیک تازه کوي، نو سمون به چمتو شي کله چې د پروژې خوا لیږل شي.',
      ipBlock: 'ستاسو IP پته ممکن د YouTube لخوا بنده شوې وي. وروسته بیا هڅه وکړئ یا VPN وکاروئ.',
      rateLimit: 'YouTube غوښتنې محدودوي. یوه دقیقه انتظار کړئ بیا هڅه وکړئ.',
      ageRestricted: 'دا ویډیو د عمر محدودیت لري او پرته د ننوتلي حساب نه شي ډاونلوډ کیدی.',
      unavailable: 'دا ویډیو شتون نلري — ممکن شخصي، حذف شوې، یا سیمه بنده وي.',
      geoBlocked: 'دا ویډیو ستاسو سیمه کې شتون نلري.',
      outOfDiskSpace: 'د ډیسک کافي ځای نشته. ځای خالي کړئ او بیا هڅه وکړئ.',
      unsupportedUrl: 'دا د ویډیو URL نه ښکاري. یو YouTube ویډیو، Short، یا Playlist لینک ولیکئ.',
      chunkTransferFailure: 'سرور د ډاونلوډ پرمهال وصل کول پرې کاوه او yt-dlp د بیا هڅولو وروسته مو پریښود. دا معمولاً د ترټولو لوی ویډیو فارمیټونو (4K HDR / لوړ بیټ ریټ VP9) سره پیښیږي. بیا هڅه وکړئ، شبکه/VPN بدل کړئ، یا ټیټ ریزولوشن فارمیټ غوره کړئ.',
      postprocessFailure: 'yt-dlp ډاونلوډ بشپړ کړ خو وروستی پروسس (یوځای کول / mux / بدلون) ناکام شو. ډیری وختونه دا د ffmpeg لنډمهاله ستونزه ده — بیا هڅه وکړئ، او که دوام ولري، بل فارمیټ ترکیب وازمویئ.',
      parse: 'د سایټ ځواب پارس نه شو. د yt-dlp استخراج کوونکی ممکن لرې شوی وي. Arroxy په پیلیدو سره yt-dlp په اتومات ډول تازه کوي — څو دقیقې وروسته بیا هڅه وکړئ کله چې اصلاح راشي.',
      network: 'د شبکې تېروتنه. خپله اړیکه وګورئ او بیا هڅه وکړئ.',
      drmProtected: 'دا ویډیو د DRM لخوا خوندي دی. yt-dlp نشي کولی DRM لیرې کړي، نو فایل نشي ډاونلوډ کیدی.',
      loginRequired: 'دا ویډیو د ننوتلي حساب ته اړتیا لري. یو cookies.txt تنظیم کړئ (تنظیمات → Cookies) او بیا هڅه وکړئ.',
      unknown: 'ډاونلوډ ناکام شو. لاندې خام محصول وګورئ.'
    }
  },
  presets: {
    'best-quality': {
      label: 'غوره کیفیت',
      desc: 'لوړه ریزولوشن + غوره غږ'
    },
    balanced: {
      label: 'متوازن',
      desc: '720p اعظمي + ښه غږ'
    },
    'audio-only': {
      label: 'یوازې غږ',
      desc: 'ویډیو نشته، غوره غږ'
    },
    'small-file': {
      label: 'کوچنی فایل',
      desc: 'ټیټه ریزولوشن + کم غږ'
    },
    'subtitle-only': {
      label: 'یوازې ژباړلیکونه',
      desc: 'ویډیو نشته، غږ نشته، یوازې ژباړلیکونه'
    }
  },
  playlistPresets: {
    'video-best': { label: 'غوره کیفیت', desc: 'د هر توکي لپاره لوړه ریزولوشن + غږ' },
    'video-2160p': { label: '4K پورې', desc: '2160p ته محدود، د هر توکي لپاره ټیټ ته ورګرځي' },
    'video-1440p': { label: '1440p پورې', desc: '2K ته محدود، د هر توکي لپاره ټیټ ته ورګرځي' },
    'video-1080p': { label: '1080p پورې', desc: 'د هر توکي لپاره محدود، ټیټ ته ورګرځي' },
    'video-720p': { label: '720p پورې', desc: 'کوچني فایلونه، پراخه مطابقت' },
    'video-480p': { label: '480p پورې', desc: 'ټیټ پراخه کارول' },
    'video-360p': { label: '360p پورې', desc: 'تر ټولو کوچنۍ ویډیو' },
    'audio-best': { label: 'Audio (غوره)', desc: 'اصلي غوره غږ، بیا نه کوډول کیږي' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'MP3 192 kbps ته بدلول' }
  },
  formatLabel: {
    audioFallback: 'غږ',
    audioOnlyDot: 'یوازې غږ · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'بیکار',
      statusActive_one: '1 ډاونلوډیږي · {{percent}}%',
      statusActive_other: '{{count}} ډاونلوډیږي · {{percent}}%',
      open: 'Arroxy پرانیستل',
      quit: 'Arroxy پریښودل'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} ډاونلوډ روان دی',
      message_other: '{{count}} ډاونلوډونه روان دي',
      detail: 'تړول به ټول فعال ډاونلوډونه لغوه کړي.',
      confirm: 'ډاونلوډونه لغوه کړه او وتلو',
      keep: 'ډاونلوډ دوام کړه'
    },
    closeToTray: {
      message: 'ایا د تړولو پر وخت Arroxy سیسټم ټرې ته پټ کړو؟',
      detail: 'Arroxy کار کوي او فعال ډاونلوډونه بشپړوي. دا وروسته د پرمختللو تنظیماتو کې بدل کړئ.',
      hide: 'ټرې ته پټول',
      quit: 'وتل',
      remember: 'بیا مه پوښتئ'
    },
    rendererCrashed: {
      message: 'Arroxy ستونزې سره مخ شو',
      detail: 'د رینډرر پروسه کریش شوه ({{reason}}). بیا هڅه کولو لپاره بیا بار کړئ.',
      reload: 'بیا بار کړئ',
      quit: 'وتل'
    }
  },
  share: {
    title: 'Arroxy شریک کړئ',
    description: 'Arroxy وړیا او خلاص سرچینه دی. شریکول نورو خلکو سره مرسته کوي چې ومومي.',
    copyLink: 'لینک کاپي کړئ',
    copied: 'کاپي شو!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy شریک کړئ',
    footerLabel: 'شریک کړئ',
    shareAction: 'Arroxy شریک کړئ',
    inlineCard: {
      body: 'ایا Arroxy خوند درکوي؟ له چا سره یې شریک کړئ چې ممکن ورته ګټور وي.',
      dismiss: 'د شریکولو وړاندیز رد کړئ'
    },
    highValueBanner: {
      body: 'ایا Arroxy خوند درکوي؟ نورو خلکو سره مرسته وکړئ چې ومومي.',
      dismiss: 'د شریکولو وړاندیز رد کړئ'
    }
  }
} as const;

export default ps;
