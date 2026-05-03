const my = {
  common: {
    back: 'နောက်သို့',
    continue: 'ဆက်လက်သွားမည်',
    retry: 'ထပ်မံကြိုးစားမည်',
    startOver: 'အစကနေပြန်စမည်',
    loading: 'ဖွင့်နေသည်…'
  },
  app: {
    feedback: 'အကြံပြုချက်',
    logs: 'မှတ်တမ်းများ',
    feedbackNudge: 'Arroxy ကိုနှစ်သက်ပါသလား? သင့်ထံမှကြားချင်ပါသည်! 💬',
    debugCopied: 'ကူးယူပြီးပြီ!',
    debugCopyTitle: 'အမှားရှာဖွေရေးအချက်အလက်ကူးယူမည် (Electron, OS, Chrome ဗားရှင်းများ)',
    zoomIn: 'ချဲ့မည်',
    zoomOut: 'ချုံ့မည်'
  },
  titleBar: {
    close: 'ပိတ်မည်',
    minimize: 'သေးငယ်အောင်လုပ်မည်',
    maximize: 'အများဆုံးချဲ့မည်',
    restore: 'ပြန်ရောက်မည်'
  },
  splash: {
    greeting: 'ဟေး၊ ကြိုဆိုပါသည်!',
    warmup: 'Arroxy ပြင်ဆင်နေသည်…',
    warning: 'တပ်ဆင်မှုမပြည့်စုံသေးပါ — အချို့လုပ်ဆောင်ချက်များ အလုပ်မလုပ်နိုင်ပါ'
  },
  theme: {
    light: 'အလင်းမုဒ်',
    dark: 'အမှောင်မုဒ်',
    system: 'စနစ်မူရင်း'
  },
  language: {
    label: 'ဘာသာစကား'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'ဖော်မတ်',
      subtitles: 'စာတန်းထိုး',
      sponsorblock: 'SponsorBlock',
      output: 'ထွက်ပေါ်မည့်ဖိုင်',
      folder: 'သိမ်းမည်',
      confirm: 'အတည်ပြုမည်'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com နှင့် youtu.be လင့်ခ်များကို ထောက်ပံ့သည်',
      fetchFormats: 'ဖော်မတ်များရယူမည်',
      mascotIdle: 'YouTube လင့်ခ်တစ်ခု (ဗီဒီယို သို့ Short) ထည့်ပြီး "ဖော်မတ်များရယူမည်" နှိပ်ပါ — ကျွန်ုပ်စတင်ပြီပဲ ✨',
      mascotBusy: 'နောက်ခံတွင် ဒေါင်းလုဒ်လုပ်နေသည်… ကျွန်ုပ် တစ်ချိန်တည်းလုပ်နိုင်သည် 😎',
      advanced: 'အဆင့်မြင့်',
      clearAria: 'URL ရှင်းလင်းမည်',
      clipboard: {
        toggle: 'ကလစ်ဘုတ်ကြည့်မည်',
        toggleDescription: 'YouTube လင့်ခ်ကော်ပီလုပ်လျှင် URL ဖြည့်သွင်းမည်။',
        dialog: {
          title: 'YouTube URL တွေ့ပြီ',
          body: 'ကလစ်ဘုတ်မှ ဤလင့်ခ်ကို အသုံးပြုမည်လား?',
          useButton: 'URL အသုံးပြုမည်',
          disableButton: 'ပိတ်မည်',
          cancelButton: 'မလုပ်တော့ပါ',
          disableNote: 'အဆင့်မြင့်ဆက်တင်တွင် ကလစ်ဘုတ်ကြည့်ရှုမှုကို နောက်မှပြန်ဖွင့်နိုင်သည်။'
        }
      },
      cookies: {
        toggle: 'ကွတ်ကီးဖိုင်သုံးမည်',
        toggleDescription: 'အသက်အကန့်အသတ်ရှိ၊ အဖွဲ့ဝင်သာ နှင့် ကိုယ်ပိုင်ဗီဒီယိုများအတွက် ကူညီသည်။',
        risk: 'အန္တရာယ်: cookies.txt တွင် ထို browser ၏ login session အားလုံးပါဝင်သည် — လျှို့ဝှက်ထားပါ။',
        fileLabel: 'ကွတ်ကီးဖိုင်',
        choose: 'ရွေးချယ်မည်…',
        clear: 'ရှင်းလင်းမည်',
        placeholder: 'ဖိုင်မရွေးရသေးပါ',
        helpLink: 'ကွတ်ကီးများ ထုတ်ယူနည်းကား?',
        enabledButNoFile: 'ကွတ်ကီးသုံးရန် ဖိုင်ရွေးပါ',
        banWarning: 'yt-dlp မှ cookies သုံးသော account များကို YouTube မှ ပြဿနာတက်စေနိုင်သည် — ဖြစ်နိုင်လျှင် စမ်းသပ် account တစ်ခုသုံးပါ။',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      closeToTray: {
        toggle: 'ပိတ်လျှင် tray သို့ ဝှက်မည်',
        toggleDescription: 'ဝင်းဒိုးပိတ်ပြီးနောက်လည်း နောက်ခံတွင် ဒေါင်းလုဒ်ဆက်လုပ်မည်။'
      },
      analytics: {
        toggle: 'အမည်မသိ သုံးစွဲမှုစာရင်းအင်းများ ပေးပို့ပါ',
        toggleDescription: 'အက်ပ် ဖွင့်သည့်အကြိမ်ရေကိုသာ ရေတွက်သည်။ URL၊ ဖိုင်အမည် သို့မဟုတ် ကိုယ်ရေးကိုယ်တာ ဒေတာ မပါဝင်ပါ။'
      }
    },
    subtitles: {
      heading: 'စာတန်းထိုး',
      autoBadge: 'အလိုအလျောက်',
      hint: 'Sidecar ဖိုင်များကို ဗီဒီယိုနဘေးတွင် သိမ်းမည်',
      noLanguages: 'ဤဗီဒီယိုအတွက် စာတန်းထိုးမရှိပါ',
      skip: 'ကျော်သွားမည်',
      skipSubs: 'ဤဗီဒီယိုအတွက် ကျော်သွားမည်',
      selectAll: 'အားလုံးရွေးမည်',
      deselectAll: 'အားလုံးဖြုတ်မည်',
      mascot: 'သုည၊ တစ်ခု သို့ မည်မျှမဆိုရွေးနိုင်သည် — သင့်ဆန္ဒအတိုင်း ✨',
      searchPlaceholder: 'ဘာသာစကားရှာဖွေမည်…',
      noMatches: 'ကိုက်ညီသောဘာသာစကားမရှိပါ',
      clearAll: 'အားလုံးဖျက်မည်',
      noSelected: 'စာတန်းထိုးမရွေးရသေးပါ',
      selectedNote_one: '{{count}} ခု စာတန်းထိုးကို ဒေါင်းလုဒ်လုပ်မည်',
      selectedNote_other: '{{count}} ခု စာတန်းထိုးများကို ဒေါင်းလုဒ်လုပ်မည်',
      sectionManual: 'လက်ဖြင့်',
      sectionAuto: 'အလိုအလျောက်ထုတ်လုပ်',
      saveMode: {
        heading: 'မည်သို့သိမ်းမည်',
        sidecar: 'ဗီဒီယိုနဘေးတွင်',
        embed: 'ဗီဒီယိုထဲသို့ ထည့်သွင်းမည်',
        subfolder: 'subtitles/ အောက်ဖိုလ်ဒါ'
      },
      format: {
        heading: 'ဖော်မတ်'
      },
      embedNote: 'Embed မုဒ်တွင် စာတန်းထိုးများ အမှန်ထည့်သွင်းနိုင်ရန် ထွက်ပေါ်မည့်ဖိုင်ကို .mkv အဖြစ်သိမ်းမည်။',
      autoAssNote: 'အလိုအလျောက်စာတန်းများကို ASS အစား SRT အဖြစ်သိမ်းမည် — YouTube ၏ rolling-cue ထပ်ခါထပ်ခါမှုကို အမြဲသန့်ရှင်းပြီး ကျွန်ုပ်တို့၏ ASS converter မှ မကူးနိုင်သေးပါ။'
    },
    sponsorblock: {
      modeHeading: 'ပံ့ပိုးသူစစ်ထုတ်မှု',
      mode: {
        off: 'ပိတ်ထားမည်',
        mark: 'အခန်းကန့်များအဖြစ် မှတ်သားမည်',
        remove: 'အပိုင်းများဖယ်ရှားမည်'
      },
      modeHint: {
        off: 'SponsorBlock မရှိပါ — ဗီဒီယိုကို တင်ထားသည့်အတိုင်း ဖွင့်သည်။',
        mark: 'ပံ့ပိုးသူအပိုင်းများကို အခန်းကန့်များအဖြစ် မှတ်သားသည် (မဖျက်ပါ)။',
        remove: 'FFmpeg ဖြင့် ပံ့ပိုးသူအပိုင်းများကို ဗီဒီယိုမှ ဖြတ်ထုတ်သည်။'
      },
      categoriesHeading: 'အမျိုးအစားများ',
      cat: {
        sponsor: 'ပံ့ပိုးသူ',
        intro: 'အဝင်',
        outro: 'အထွက်',
        selfpromo: 'ကိုယ်တိုင်ကြော်ငြာ',
        music_offtopic: 'Music off-topic',
        preview: 'ကြိုတင်ကြည့်ရှုမှု',
        filler: 'အဖြည့်'
      }
    },
    formats: {
      quickPresets: 'မြန်ဆန်သောကြိုတင်သတ်မှတ်မှုများ',
      video: 'ဗီဒီယို',
      audio: 'အသံ',
      noAudio: 'အသံမပါ',
      videoOnly: 'ဗီဒီယိုသာ',
      audioOnly: 'အသံသာ',
      audioOnlyOption: 'အသံသာ (ဗီဒီယိုမပါ)',
      mascot: 'အကောင်းဆုံး + အကောင်းဆုံး = အမြင့်ဆုံးအရည်အသွေး။ ကျွန်ုပ်ရွေးမည်!',
      sniffing: 'သင့်အတွက် အကောင်းဆုံးဖော်မတ်များ ရှာနေသည်…',
      loadingHint: 'များသောအားဖြင့် တစ်စက္ကန့်ခန့်ကြာသည်',
      loadingAria: 'ဖော်မတ်များဖွင့်နေသည်',
      sizeUnknown: 'အရွယ်အစားမသိ',
      total: 'စုစုပေါင်း'
    },
    folder: {
      heading: 'ဤနေရာတွင်သိမ်းမည်',
      downloads: 'ဒေါင်းလုဒ်များ',
      videos: 'ရုပ်ရှင်များ',
      desktop: 'ဒက်စတော့',
      music: 'တေးဂီတ',
      documents: 'စာရွက်စာတမ်းများ',
      pictures: 'ဓာတ်ပုံများ',
      home: 'ပင်မ',
      custom: 'စိတ်ကြိုက်…',
      subfolder: {
        toggle: 'အောက်ဖိုလ်ဒါထဲတွင်သိမ်းမည်',
        placeholder: 'ဥပမာ lo-fi rips',
        invalid: 'ဖိုလ်ဒါနာမည်တွင် မသင့်တော်သောအက္ခရာများပါဝင်သည်'
      }
    },
    output: {
      embedChapters: {
        label: 'အခန်းကန့်များ ထည့်သွင်းမည်',
        description: 'ခေတ်မီ player မည်သည့်ခုတွင်မဆို navigate လုပ်နိုင်သော chapter marker များ။'
      },
      embedMetadata: {
        label: 'Metadata ထည့်သွင်းမည်',
        description: 'ဖိုင်ထဲသို့ ခေါင်းစဉ်၊ အနုပညာရှင်၊ ဖော်ပြချက် နှင့် တင်ထားသောရက်စွဲကို ရေးသွင်းမည်။'
      },
      embedThumbnail: {
        label: 'Thumbnail ထည့်သွင်းမည်',
        description: 'ဖိုင်ထဲတွင် မျက်နှာဖုံး artwork ထည့်မည်။ MP4 / M4A သာ — စာတန်းထိုးများ ထည့်သွင်းထားလျှင် ကျော်မည်။'
      },
      writeDescription: {
        label: 'ဖော်ပြချက်သိမ်းမည်',
        description: 'ဗီဒီယိုဖော်ပြချက်ကို ဒေါင်းလုဒ်နဘေးတွင် .description စာသားဖိုင်အဖြစ် သိမ်းမည်။'
      },
      writeThumbnail: {
        label: 'Thumbnail သိမ်းမည်',
        description: 'Thumbnail ကို ဒေါင်းလုဒ်နဘေးတွင် .jpg ဓာတ်ပုံဖိုင်အဖြစ် သိမ်းမည်။'
      }
    },
    confirm: {
      readyHeadline: 'ဆွဲထုတ်ရန်အဆင်သင့်ဖြစ်ပြီ!',
      landIn: 'သင့်ဖိုင်သည် ဤနေရာတွင် ဆင်းမည်',
      labelVideo: 'ဗီဒီယို',
      labelAudio: 'အသံ',
      labelSubtitles: 'စာတန်းထိုး',
      subtitlesNone: '—',
      labelSaveTo: 'ဤနေရာတွင်သိမ်းမည်',
      labelSize: 'အရွယ်အစား',
      sizeUnknown: 'မသိ',
      nothingToDownload: 'စာတန်းထိုးသာ preset ဖွင့်ထားသော်လည်း စာတန်းထိုးဘာသာစကားမရွေးရသေးပါ — ဘာမျှဒေါင်းလုဒ်မဖြစ်ပါ။',
      audioOnly: 'အသံသာ',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'အခြားဒေါင်းလုဒ်များပြီးဆုံးလျှင်စတင်မည် — အပြည့်အဝ bandwidth ရမည်',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'ချက်ချင်းစတင်မည် — အခြားဒေါင်းလုဒ်များနှင့်အတူ အပြိုင်လုပ်မည်'
    },
    error: {
      icon: 'အမှား'
    }
  },
  videoCard: {
    titlePlaceholder: 'ဖွင့်နေသည်…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'ဒေါင်းလုဒ် Queue',
    toggleTitle: 'ဒေါင်းလုဒ် queue ဖွင့်/ပိတ်မည်',
    empty: 'Queue ထည့်ထားသောဒေါင်းလုဒ်များ ဤနေရာတွင်ပေါ်မည်',
    noDownloads: 'ဒေါင်းလုဒ်မရှိသေးပါ။',
    activeCount: '{{count}} ဒေါင်းလုဒ်လုပ်နေသည် · {{percent}}%',
    clear: 'ရှင်းလင်းမည်',
    clearTitle: 'ပြီးဆုံးသောဒေါင်းလုဒ်များ ရှင်းလင်းမည်',
    tip: 'သင့်ဒေါင်းလုဒ်ကို queue ထည့်ပြီးပြီ — တိုးတက်မှုကြည့်ရှုရန် ဖွင့်နိုင်သည်။',
    item: {
      doneAt: '{{time}} တွင်ပြီးဆုံး',
      paused: 'ခေတ္တရပ်ထား',
      defaultError: 'ဒေါင်းလုဒ်မအောင်မြင်ပါ',
      openUrl: 'URL ဖွင့်မည်',
      pause: 'ခေတ္တရပ်မည်',
      resume: 'ဆက်လုပ်မည်',
      cancel: 'ပယ်ဖျက်မည်',
      remove: 'ဖျက်မည်'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'ရရှိနိုင်ပြီ',
    youHave: '— သင့်တွင် {{currentVersion}} ရှိသည်',
    install: 'တပ်ဆင်ပြီး ပြန်စမည်',
    downloading: 'ဒေါင်းလုဒ်လုပ်နေသည်…',
    download: 'Download ↗',
    dismiss: 'အပ်ဒိတ်ကြော်ငြာပိတ်မည်',
    copy: 'command ကို clipboard သို့ကူးမည်',
    copied: 'command ကို clipboard သို့ကူးပြီးပြီ'
  },
  status: {
    preparingBinaries: 'Binary ဖိုင်များပြင်ဆင်နေသည်…',
    mintingToken: 'YouTube token ထုတ်နေသည်…',
    remintingToken: 'Token ပြန်ထုတ်နေသည်…',
    startingYtdlp: 'yt-dlp လုပ်ငန်းစဉ်စတင်နေသည်…',
    downloadingMedia: 'ဗီဒီယိုနှင့်အသံ ဒေါင်းလုဒ်လုပ်နေသည်…',
    mergingFormats: 'အသံနှင့်ဗီဒီယိုပေါင်းစပ်နေသည်…',
    fetchingSubtitles: 'စာတန်းထိုးများ ယူနေသည်…',
    sleepingBetweenRequests: 'နှုန်းကန့်သတ်မှုရှောင်ရန် {{seconds}}s စောင့်နေသည်…',
    subtitlesFailed: 'ဗီဒီယိုသိမ်းပြီးပြီ — အချို့စာတန်းထိုးများ ဒေါင်းလုဒ်မဆင်းနိုင်ပါ',
    cancelled: 'ဒေါင်းလုဒ်ပယ်ဖျက်ပြီး',
    complete: 'ဒေါင်းလုဒ်ပြီးဆုံးပြီ',
    usedExtractorFallback: 'Relaxed extractor ဖြင့်ဒေါင်းလုဒ်လုပ်ပြီး — ပိုယုံကြည်ရသောဒေါင်းလုဒ်အတွက် cookies.txt တပ်ဆင်ပါ',
    ytdlpProcessError: 'yt-dlp လုပ်ငန်းစဉ်အမှား: {{error}}',
    ytdlpExitCode: 'yt-dlp သည် code {{code}} ဖြင့်ထွက်သွားသည်',
    downloadingBinary: '{{name}} binary ဒေါင်းလုဒ်လုပ်နေသည်…',
    unknownStartupFailure: 'မသိသောဒေါင်းလုဒ်စတင်မှုပျက်ကွက်မှု'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube မှ ဤတောင်းဆိုမှုကို bot ဟုသတ်မှတ်သည်။ ခဏကြာပြီးနောက်ထပ်ကြိုးစားပါ။',
      ipBlock: 'သင့် IP လိပ်စာကို YouTube မှ ပိတ်ဆို့ထားနိုင်သည်။ နောက်မှပြန်ကြိုးစားပါ သို့ VPN သုံးပါ။',
      rateLimit: 'YouTube မှ တောင်းဆိုမှုများကို နှုန်းကန့်သတ်နေသည်။ တစ်မိနစ်စောင့်ပြီး ထပ်ကြိုးစားပါ။',
      ageRestricted: 'ဤဗီဒီယိုသည် အသက်အကန့်အသတ်ရှိပြီး login ဝင်ထားသော account မပါဘဲ ဒေါင်းလုဒ်မဆင်းနိုင်ပါ။',
      unavailable: 'ဤဗီဒီယိုမရနိုင်ပါ — ကိုယ်ပိုင်၊ ဖျက်ထား သို့ ဒေသကန့်သတ်ဖြစ်နိုင်သည်။',
      geoBlocked: 'ဤဗီဒီယိုသည် သင့်ဒေသတွင် မရနိုင်ပါ။',
      outOfDiskSpace: 'Disk နေရာမလုံလောက်ပါ။ နေရာလွတ်ပြီး ထပ်ကြိုးစားပါ။'
    }
  },
  presets: {
    'best-quality': {
      label: 'အကောင်းဆုံးအရည်အသွေး',
      desc: 'အမြင့်ဆုံး resolution + အကောင်းဆုံးအသံ'
    },
    balanced: {
      label: 'မျှတသော',
      desc: '720p အများဆုံး + ကောင်းသောအသံ'
    },
    'audio-only': {
      label: 'အသံသာ',
      desc: 'ဗီဒီယိုမပါ၊ အကောင်းဆုံးအသံ'
    },
    'small-file': {
      label: 'ဖိုင်သေးသေး',
      desc: 'အနိမ့်ဆုံး resolution + နိမ့်သောအသံ'
    },
    'subtitle-only': {
      label: 'စာတန်းထိုးသာ',
      desc: 'ဗီဒီယိုမပါ၊ အသံမပါ၊ စာတန်းထိုးသာ'
    }
  },
  formatLabel: {
    audioOnly: 'အသံသာ',
    audioFallback: 'အသံ',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'လုပ်ငန်းမရှိ',
      statusActive_one: '1 ဒေါင်းလုဒ်လုပ်နေသည် · {{percent}}%',
      statusActive_other: '{{count}} ဒေါင်းလုဒ်လုပ်နေသည် · {{percent}}%',
      open: 'Arroxy ဖွင့်မည်',
      quit: 'Arroxy ထွက်မည်'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} ဒေါင်းလုဒ် လုပ်ဆောင်နေဆဲ',
      message_other: '{{count}} ဒေါင်းလုဒ်များ လုပ်ဆောင်နေဆဲ',
      detail: 'ပိတ်လျှင် လက်ရှိဒေါင်းလုဒ်အားလုံးကို ပယ်ဖျက်မည်။',
      confirm: 'ဒေါင်းလုဒ်ပယ်ဖျက်ပြီး ထွက်မည်',
      keep: 'ဒေါင်းလုဒ်ဆက်လုပ်မည်'
    },
    closeToTray: {
      message: 'ပိတ်သောအခါ Arroxy ကို system tray သို့ ဝှက်မည်လား?',
      detail: 'Arroxy ဆက်လည်ပတ်ပြီး လက်ရှိဒေါင်းလုဒ်များ ပြီးဆုံးမည်။ နောက်မှ အဆင့်မြင့်ဆက်တင်တွင် ပြောင်းနိုင်သည်။',
      hide: 'Tray သို့ ဝှက်မည်',
      quit: 'ထွက်မည်',
      remember: 'နောက်ထပ်မမေးတော့ပါ'
    }
  }
} as const;

export default my;
