const my = {
  common: {
    back: 'နောက်သို့',
    continue: 'ဆက်လက်သွားမည်',
    retry: 'ထပ်မံကြိုးစားမည်',
    startOver: 'အစကနေပြန်စမည်'
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
  about: {
    button: 'အကြောင်း',
    openTitle: 'Arroxy အကြောင်း',
    tagline: 'Desktop အတွက် မြန်ဆန်သော ဗီဒီယို နှင့် အသံ ဒေါင်းလုဒ်တူး။',
    websiteLink: 'ဝက်ဘ်ဆိုက်',
    githubLink: 'GitHub',
    licenseLine: 'MIT လိုင်စင် · Antonio Orionus မှ',
    thirdPartyNotices: 'တတိယပါတီ သတိပေးချက်များ ကြည့်မည်'
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
    downloading: '{{binary}} ဒေါင်းလုဒ်လုပ်နေသည်…',
    warmupFailedNoDiag: 'တပ်ဆင်မှုမအောင်မြင်ပါ။ အသေးစိတ်ကြည့်ရန် setup log ဖွင့်ပါ။'
  },
  repair: {
    title: 'တပ်ဆင်မှုတွင် သင့်အကူအညီလိုပါသည်',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'အတည်မပြုနိုင်ပါ။',
      downloadFailed: 'ဒေါင်းလုဒ်မအောင်မြင်ပါ။ အင်တာနက်ချိတ်ဆက်မှုစစ်ဆေးပြီး ထပ်ကြိုးစားပါ။',
      extractFailed: 'Archive ဖြေထုတ်မှုမအောင်မြင်ပါ။ ဒေါင်းလုဒ်ပျက်စီးနေနိုင်သည် — ထပ်ကြိုးစားပါ။',
      hashFailed: 'ဒေါင်းလုဒ်ဖိုင်၏ checksum မကိုက်ညီပါ။ ဒေါင်းလုဒ်ထပ်ကြိုးစားပါ။',
      spawnFailed: 'ဖိုင်မရှိပါ သို့မဟုတ် မဖွင့်နိုင်ပါ။ အလုပ်လုပ်သောကော်ပီတစ်ခုရွေးပါ။',
      permissionDenied: 'စနစ်မှ ဖိုင်မဖွင့်ပေးပါ။ ယုံကြည်ရသောကော်ပီရွေးပါ သို့မဟုတ် admin အဖြစ် ထပ်ကြိုးစားပါ။',
      blockedOrQuarantined: 'Windows မှ ဖိုင်ပိတ်ဆို့သည် (SmartScreen / Defender)။ တပ်ဆင်ထားသောကော်ပီရွေးပါ သို့မဟုတ် runtime ဖိုဒါကို ခွင့်ပြုချက်ထည့်ပါ။',
      badExitCode: 'Binary မှ --version ကိုမတုံ့ပြန်ပါ။ ပျက်စီးနေသော သို့မဟုတ် မှားသောဗားရှင်းဖြစ်နိုင်သည်။',
      timeout: 'ဗားရှင်းစစ်ဆေးမှု time out ဖြစ်ပြီ။ ဖိုင်ရပ်နေနိုင်သည် — ထပ်ကြိုးစားပါ။',
      pairIncomplete: 'ffmpeg နှင့် ffprobe နှစ်ခုလုံးကို တွဲဖက်အဖြစ် သတ်မှတ်ရမည်။'
    },
    actions: {
      chooseExecutable: 'Executable ရွေးမည်',
      resetToDefault: 'မူလသို့ပြန်ထားမည်',
      retrySetup: 'Setup ထပ်ကြိုးစားမည်',
      cancel: 'ပယ်ဖျက်မည်',
      openDependencyFolder: 'Dependency ဖိုဒါဖွင့်မည်',
      viewSetupLog: 'Setup log ကြည့်မည်'
    }
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
      playlistItems: 'Playlist',
      playlistPresets: 'အရည်အသွေး',
      formats: 'ဖော်မတ်',
      subtitles: 'စာတန်းထိုး',
      sponsorblock: 'SponsorBlock',
      output: 'ထွက်ပေါ်မည့်ဖိုင်',
      folder: 'သိမ်းမည်',
      confirm: 'အတည်ပြုမည်'
    },
    playlist: {
      heading: 'Playlist အကြောင်းအရာများ',
      itemCount_one: '{{count}} ဗီဒီယို',
      itemCount_other: '{{count}} ဗီဒီယိုများ',
      itemCountAudio_one: '{{count}} ခု သီချင်း',
      itemCountAudio_other: '{{count}} ခု သီချင်းများ',
      selectAll: 'အားလုံးရွေးမည်',
      selectNone: 'အားလုံးဖြုတ်မည်',
      rangeFrom: 'မှ',
      rangeTo: 'သို့',
      rangeApply: 'အပိုင်းအခြားသတ်မှတ်မည်',
      selectedCount_one: '{{count}} ခုရွေးထားသည်',
      selectedCount_other: '{{count}} ခုရွေးထားသည်',
      noSelection: 'ဆက်လက်ရန် ဗီဒီယိုတစ်ခုအနည်းဆုံးရွေးပါ',
      loadingItems: 'Playlist ရယူနေသည်…',
      thumbnailAlt: 'ဗီဒီယို thumbnail',
      durationUnknown: 'live'
    },
    playlistPresets: {
      heading: 'Batch အတွက် အရည်အသွေးရွေးပါ',
      subhead: 'ဗီဒီယိုတစ်ခုချင်းစီသည် ရွေးချယ်ထားသော tier အတိုင်း သီးခြားဖြေရှင်းသည် — မတူညီသော playlist များ အဆင်မပြေမှုမရှိဘဲ အလုပ်လုပ်သည်။',
      itemCount_one: '{{count}} ခု',
      itemCount_other: '{{count}} ခု'
    },
    mixedPrompt: {
      title: 'ဤလင့်ခ်တွင် Playlist ပါဝင်သည်',
      body: 'သင်နှိပ်ခဲ့သော ဗီဒီယိုကိုသာ လိုချင်သလော၊ Playlist မှ ရွေးချင်သလော? နောက်တွင် သီးခြားဗီဒီယိုများ သို့မဟုတ် အပိုင်းအခြား ရွေးနိုင်မည်။',
      singleVideo: 'ဤတစ်ခုသာ',
      pickFromPlaylist: 'Playlist မှ ရွေးမည်'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'ဖော်မတ်များရယူမည်',
      features: {
        heading: 'Arroxy ဆွဲထုတ်နိုင်သည်',
        youtube: {
          heading: 'YouTube',
          video: 'ဗီဒီယိုများ',
          channel: 'Channel များ',
          playlist: 'Playlist များ',
          short: 'Shorts',
          music: 'တေးဂီတ',
          podcast: 'Podcast များ'
        },
        anySite: {
          heading: '2000+ ဝဘ်ဆိုဒ်',
          video: 'ဗီဒီယိုများ',
          videoPlaylist: 'ဗီဒီယို playlist များ',
          musicPlaylist: 'တေးဂီတ playlist များ'
        },
        always: {
          heading: 'အမြဲ ရရှိနိုင်',
          audioOnly: 'အသံသာများ',
          subtitles: 'စာတန်းထိုးများ'
        }
      },
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
        sourceLabel: 'ကွတ်ကီးရင်းမြစ်',
        sourceOff: 'ပိတ်',
        sourceFile: 'ဖိုင်',
        sourceBrowser: 'Browser',
        toggleDescription: 'အသက်အကန့်အသတ်ရှိ၊ အဖွဲ့ဝင်သာ နှင့် ကိုယ်ပိုင်ဗီဒီယိုများအတွက် ကူညီသည်။',
        risk: 'အန္တရာယ်: cookies.txt တွင် ထို browser ၏ login session အားလုံးပါဝင်သည် — လျှို့ဝှက်ထားပါ။',
        fileLabel: 'ကွတ်ကီးဖိုင်',
        choose: 'ရွေးချယ်မည်…',
        clear: 'ရှင်းလင်းမည်',
        placeholder: 'ဖိုင်မရွေးရသေးပါ',
        helpLink: 'ကွတ်ကီးများ ထုတ်ယူနည်းကား?',
        enabledButNoFile: 'ကွတ်ကီးသုံးရန် ဖိုင်ရွေးပါ',
        browserLabel: 'Browser',
        browserPlaceholder: 'Browser ရွေးပါ…',
        browserHelp: 'Browser မှ ကွတ်ကီးများကို တိုက်ရိုက်ဖတ်သည်။ Chromium မျိုးနွယ် browser များအတွက် browser ပိတ်ထားရမည်။',
        enabledButNoBrowser: 'ကွတ်ကီးသုံးရန် browser ရွေးပါ',
        banWarning: 'yt-dlp မှ cookies သုံးသော account များကို YouTube မှ ပြဿနာတက်စေနိုင်သည် — ဖြစ်နိုင်လျှင် စမ်းသပ် account တစ်ခုသုံးပါ။',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt ကို ဒေသတွင်း ရယူရန် (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Proxy မှတဆင့် traffic လမ်းကြောင်းလွှဲပါ — ဂျီဩဂရပ်ကန့်သတ်ချက်ရှိသော အကြောင်းအရာများအတွက် အသုံးဝင်သည်။',
        placeholder: 'http://host:port',
        clear: 'ရှင်းလင်း'
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
      autoBadge: 'အလိုအလျောက်',
      noLanguages: 'ဤဗီဒီယိုအတွက် စာတန်းထိုးမရှိပါ',
      skip: 'ကျော်သွားမည်',
      skipSubs: 'ဤဗီဒီယိုအတွက် ကျော်သွားမည်',
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
      loadingHint: 'စစ်ဆေးမှုပြီးဆုံးသည်အထိ ကျေးဇူးပြု၍ စောင့်ပါ — playlist များနှင့် ရှာဖွေမှုများ အချိန်ယူနိုင်သည်။',
      loadingAria: 'ဖော်မတ်များဖွင့်နေသည်',
      sizeUnknown: 'အရွယ်အစားမသိ',
      skipToConfirm: 'အတည်ပြုသို့ ကျော်သွားရန်',
      skipToConfirmTooltip: 'ကျန်ရှိသော အဆင့်များအားလုံးအတွက် သင်၏ သိမ်းဆည်းထားသော နှစ်သက်မှုများကို အသုံးပြုသည်။ ဆက်တင်တစ်ခုကို ပြောင်းလဲရန်၊ ယင်းအစား အဆင့်ဆင့် ဆက်လက်သွားပါ — သင်၏ ရွေးချယ်မှုကို နောက်တစ်ကြိမ်အတွက် သိမ်းဆည်းမည်။',
      total: 'စုစုပေါင်း',
      keepAudio: 'မပြောင်းဘဲ ထားမည်',
      keepAudioMeta: 'ပါဝင်သောအသံ',
      convert: {
        label: 'ပြောင်းရန်',
        uncompressed: 'ပြောင်းရန် · ချုံ့မထားသော',
        bitrate: 'Bitrate',
        wavLabel: 'WAV (ချုံ့မထားသော)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'အသံပြောင်းလဲမှုအတွက် အသံသာမုဒ် လိုအပ်သည် (ဗီဒီယိုရွေးချယ်မှုကို ဖြုတ်ပါ)။',
        requiresLossy: 'Native stream ရွေးထားသည် — bitrate သည် mp3, m4a, သို့မဟုတ် opus သို့ပြောင်းရန်သာ သက်ဆိုင်သည်။'
      },
      botWall: {
        heading: 'YouTube မှ ဤစစ်ဆေးမှုကို ကန့်သတ်ပြီ',
        bodyUnconfigured: 'ဖော်မတ်စာရင်း မပြည့်စုံနိုင်ပါ။ အဆင့်မြင့်ဆက်တင်တွင် cookies တပ်ဆင်ပါ၊ သို့မဟုတ် network ပြောင်းပြီး ထပ်ကြိုးစားပါ။',
        bodyDisabled: 'Cookies တပ်ဆင်ထားသော်လည်း ပိတ်ထားသည်။ ပြည့်စုံသောစာရင်းရရှိရန် ဖွင့်ပြီး ထပ်ကြိုးစားပါ၊ သို့မဟုတ် network ပြောင်းပြီး ထပ်ကြိုးစားပါ။',
        bodyEnabled: 'Cookies ပါသော်လည်း YouTube မှ ဤစစ်ဆေးမှုကို ကန့်သတ်ပြီ။ နောက်မှ ထပ်ကြိုးစားပါ သို့မဟုတ် network ပြောင်းပါ။',
        retryCta: 'ထပ်ကြိုးစားမည်',
        enableRetryCta: 'Cookies ဖွင့်ပြီး ထပ်ကြိုးစားမည်'
      },
      cookiesError: {
        heading: 'Cookies သည် အကြောင်းရင်းဖြစ်နိုင်သည်',
        currentModeLabel: 'ကွတ်ကီးရင်းမြစ်',
        currentModeFile: 'ဖိုင်',
        currentModeBrowser: 'Browser',
        explanationFile: 'Cookies ဖိုင်သည် ဗလာဖြစ်နေ၊ သက်တမ်းကုန်နေ သို့မဟုတ် မှားသောဖော်မတ်ဖြစ်နေနိုင်သည် (yt-dlp သည် Netscape cookies.txt ကိုသာ လက်ခံသည်)။ Cookies ကို ထပ်မံ export လုပ်ကြည့်ပါ၊ ဖိုင်အခြားတစ်ခုရွေးကြည့်ပါ၊ Browser မုဒ်သို့ပြောင်းကြည့်ပါ၊ သို့မဟုတ် cookies ပိတ်ကြည့်ပါ။',
        explanationBrowser: 'Cookies ကို browser မှ တိုက်ရိုက်ဖတ်သည်။ Browser ယခုဖွင့်ထားပါက၊ cookie database ကို ပိတ်ဆို့ထားနိုင်သည် (Chromium မျိုးနွယ်)။ Browser သည် YouTube သို့ login ဝင်ထားရမည်ဖြစ်သည်။ Browser ပိတ်ကြည့်ပါ၊ Browser အခြားတစ်ခုသို့ ပြောင်းကြည့်ပါ၊ ဖိုင်မုဒ်သို့ ပြောင်းကြည့်ပါ သို့မဟုတ် cookies ပိတ်ကြည့်ပါ။',
        openSettingsCta: 'Cookies ဆက်တင် ဖွင့်မည်',
        needsCookies: {
          heading: 'ဤဝဘ်ဆိုဒ်တွင် အကောင့်ဝင်ရမည်',
          body: 'yt-dlp သည် အတည်ပြုမှုမပါဘဲ ဤဗီဒီယိုကို ဖွင့်၍မရပါ။ အဆင့်မြင့်ဆက်တင်တွင် cookies တပ်ဆင်ပါ — သင်အကောင့်ဝင်ထားသော browser တစ်ခုသို့ ညွှန်ပါ၊ သို့မဟုတ် cookies.txt ဖိုင်တင်သွင်းပါ။'
        },
        dpapi: {
          heading: 'Windows ကုဒ်ဝှက်မှုကြောင့် Chrome cookies ပိတ်ဆို့ခံရသည်',
          explanation: 'Chrome 127 နှင့် ၎င်းနောက်ပိုင်းဗားရှင်းများသည် Windows တွင် အခြား app များ မဖတ်နိုင်သောနည်းဖြင့် cookies များကို ကုဒ်ဝှက်ထားသည်။ အောက်ပါ ဖြေရှင်းနည်းများထဲမှ တစ်ခုကို ကြိုးစားပါ။',
          fixFirefoxLabel: 'Firefox သို့ ပြောင်းမည်',
          fixFirefoxBody: 'Firefox သည် App-Bound Encryption မသုံးပါ။ Cookies ဆက်တင် ဖွင့်ပြီး browser စာရင်းမှ Firefox ကို ရွေးပါ။',
          fixFileLabel: 'cookies.txt ထုတ်ယူမည်',
          fixFileBody: 'Chrome မှ browser extension ဖြင့် cookies ထုတ်ယူပြီး ဤ app ကို File မုဒ်သို့ ပြောင်းကာ ထုတ်ယူထားသောဖိုင်ကို ရွေးပါ။',
          fixUnsafeLabel: 'App-Bound Encryption ပိတ်ထား၍ Chrome ဖွင့်မည်',
          fixUnsafeBody: 'Chrome ၏ launch shortcut တွင် --disable-features=LockProfileCookieDatabase ထည့်ပါ။ သတိပေးချက်: ဤနည်းသည် ယခင်ကုဒ်ဝှက်ထားသော cookies များကို ပျက်ကွက်စေသောကြောင့် ဝဘ်ဆိုဒ်အားလုံးမှ logout ဖြစ်ပြီး ပြန်လည် login ဝင်ရမည်ဖြစ်သည်။',
          docsLinkLabel: 'yt-dlp စာတမ်းများ (ပြဿနာ #10927)'
        }
      }
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
      thumbnailEmbedNotSupported: 'Thumbnail embed ကို ကျော်လိုက်သည် — ထွက်ပေါ်မည့် container မှ ၎င်းကို မထောက်ပံ့ပါ။',
      subtitleEmbedAudioOnly: 'စာတန်းထိုး embed ကို sidecar သို့ ပြောင်းလဲပြီ — အသံ track များသည် embedded စာတန်းထိုး stream များကို မထောက်ပံ့ပါ။',
      audioOnly: 'အသံသာ',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'အခြားဒေါင်းလုဒ်များပြီးဆုံးလျှင်စတင်မည် — အပြည့်အဝ bandwidth ရမည်',
      pullIt: 'ဆွဲထုတ်မည်! ↓',
      pullItTooltip: 'ချက်ချင်းစတင်မည် — အခြားဒေါင်းလုဒ်များနှင့်အတူ အပြိုင်လုပ်မည်',
      labelPlaylist: 'Playlist',
      labelPreset: 'Preset',
      labelItems: 'အကြောင်းအရာ',
      itemsValue_one: '{{total}} ခုမှ {{count}} ဗီဒီယို',
      itemsValue_other: '{{total}} ခုမှ {{count}} ဗီဒီယိုများ',
      itemsValueAudio_one: '{{total}} ခုမှ {{count}} သီချင်း',
      itemsValueAudio_other: '{{total}} ခုမှ {{count}} သီချင်းများ'
    }
  },
  videoCard: {
    titlePlaceholder: 'ဖွင့်နေသည်…'
  },
  queue: {
    header: 'ဒေါင်းလုဒ် Queue',
    toggleTitle: 'ဒေါင်းလုဒ် queue ဖွင့်/ပိတ်မည်',
    empty: 'Queue ထည့်ထားသောဒေါင်းလုဒ်များ ဤနေရာတွင်ပေါ်မည်',
    noDownloads: 'ဒေါင်းလုဒ်မရှိသေးပါ။',
    activeCount: '{{count}} ဒေါင်းလုဒ်လုပ်နေသည် · {{percent}}%',
    clear: 'ရှင်းလင်းမည်',
    clearTitle: 'ပြီးဆုံးသောဒေါင်းလုဒ်များ ရှင်းလင်းမည်',
    pauseAll: 'အားလုံး ခေတ္တရပ်မည်',
    pauseAllTitle: 'လုပ်ဆောင်နေသောဒေါင်းလုဒ်အားလုံး ခေတ္တရပ်မည်',
    cancelAll: 'အားလုံး ဖျက်သိမ်းမည်',
    cancelAllTitle: 'လုပ်ဆောင်နေသောနှင့် ဆိုင်းငံ့ထားသောဒေါင်းလုဒ်အားလုံး ဖျက်သိမ်းမည်',
    tip: 'သင့်ဒေါင်းလုဒ်ကို queue ထည့်ပြီးပြီ — တိုးတက်မှုကြည့်ရှုရန် ဖွင့်နိုင်သည်။',
    item: {
      doneAt: '{{time}} တွင်ပြီးဆုံး',
      paused: 'ခေတ္တရပ်ထား',
      defaultError: 'ဒေါင်းလုဒ်မအောင်မြင်ပါ',
      openUrl: 'URL ဖွင့်မည်',
      pause: 'ခေတ္တရပ်မည်',
      hold: 'ဆိုင်းငံ့မည်',
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
    copied: 'command ကို clipboard သို့ကူးပြီးပြီ',
    installFailed: 'အပ်ဒိတ် မအောင်မြင်ပါ',
    retry: 'ထပ်စမ်းမည်'
  },
  status: {
    preparingBinaries: 'Binary ဖိုင်များပြင်ဆင်နေသည်…',
    mintingToken: 'YouTube token ထုတ်နေသည်…',
    remintingToken: 'Token ပြန်ထုတ်နေသည်…',
    startingYtdlp: 'yt-dlp လုပ်ငန်းစဉ်စတင်နေသည်…',
    downloadingMedia: 'ဗီဒီယိုနှင့်အသံ ဒေါင်းလုဒ်လုပ်နေသည်…',
    mergingFormats: 'အသံနှင့်ဗီဒီယိုပေါင်းစပ်နေသည်…',
    extractingAudio: 'အသံပြောင်းလဲနေသည်…',
    convertingVideo: 'ဗီဒီယိုပြောင်းလဲနေသည်…',
    embeddingMetadata: 'Metadata ထည့်သွင်းနေသည်…',
    movingFiles: 'ဖိုင်များရွှေ့နေသည်…',
    fetchingSubtitles: 'စာတန်းထိုးများ ယူနေသည်…',
    sleepingBetweenRequests: 'နှုန်းကန့်သတ်မှုရှောင်ရန် {{seconds}}s စောင့်နေသည်…',
    subtitlesFailed: 'ဗီဒီယိုသိမ်းပြီးပြီ — အချို့စာတန်းထိုးများ ဒေါင်းလုဒ်မဆင်းနိုင်ပါ',
    cancelled: 'ဒေါင်းလုဒ်ပယ်ဖျက်ပြီး',
    complete: 'ဒေါင်းလုဒ်ပြီးဆုံးပြီ',
    usedExtractorFallback: 'Relaxed extractor ဖြင့်ဒေါင်းလုဒ်လုပ်ပြီး — ပိုယုံကြည်ရသောဒေါင်းလုဒ်အတွက် cookies.txt တပ်ဆင်ပါ',
    ytdlpProcessError: 'yt-dlp လုပ်ငန်းစဉ်အမှား: {{error}}',
    ytdlpExitCode: 'yt-dlp သည် code {{code}} ဖြင့်ထွက်သွားသည်',
    downloadingBinary: '{{name}} binary ဒေါင်းလုဒ်လုပ်နေသည်…',
    unknownStartupFailure: 'မသိသောဒေါင်းလုဒ်စတင်မှုပျက်ကွက်မှု',
    diskSpaceInsufficient: 'disk နေရာ မလုံလောက်ပါ — {{required}} လိုအပ်သည်၊ {{free}} သာ ရရှိနိုင်သည်',
    fetchingSponsorBlock: 'SponsorBlock သို့ ဆက်သွယ်နေသည်…',
    retryingSponsorBlock: 'SponsorBlock မရရှိနိုင်ပါ၊ ပြန်လည်ကြိုးစားနေသည် ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'Bot ကာကွယ်မှု အစပြုပြီ။ သင်သုံးနေသော IP သည် datacenter range သို့မဟုတ် သူများများသုံးသော VPN exit ဖြစ်၍ ပိတ်ဆို့ခံရနိုင်သည်။ သင့် IP ကို ပြောင်းပါ သို့မဟုတ် VPN endpoint အခြားတစ်ခုရွေးပြီး ထပ်ကြိုးစားပါ။ ဆက်မအောင်မြင်ပါက YouTube ၏ ယာယီပြောင်းလဲမှုဖြစ်နိုင်သည် — Arroxy သည် ဖွင့်သည့်အခါ yt-dlp ကို အလိုအလျောက်အပ်ဒိတ်လုပ်သောကြောင့် upstream မှ ပြင်ဆင်မှုရောက်သောအခါ အလိုလိုဖြေရှင်းသွားမည်ဖြစ်သည်။',
      ipBlock: 'သင့် IP လိပ်စာကို YouTube မှ ပိတ်ဆို့ထားနိုင်သည်။ နောက်မှပြန်ကြိုးစားပါ သို့ VPN သုံးပါ။',
      rateLimit: 'YouTube မှ တောင်းဆိုမှုများကို နှုန်းကန့်သတ်နေသည်။ တစ်မိနစ်စောင့်ပြီး ထပ်ကြိုးစားပါ။',
      ageRestricted: 'ဤဗီဒီယိုသည် အသက်အကန့်အသတ်ရှိပြီး login ဝင်ထားသော account မပါဘဲ ဒေါင်းလုဒ်မဆင်းနိုင်ပါ။',
      unavailable: 'ဤဗီဒီယိုမရနိုင်ပါ — ကိုယ်ပိုင်၊ ဖျက်ထား သို့ ဒေသကန့်သတ်ဖြစ်နိုင်သည်။',
      geoBlocked: 'ဤဗီဒီယိုသည် သင့်ဒေသတွင် မရနိုင်ပါ။',
      outOfDiskSpace: 'Disk နေရာမလုံလောက်ပါ။ နေရာလွတ်ပြီး ထပ်ကြိုးစားပါ။',
      unsupportedUrl: 'ဤ URL သည် ဗီဒီယို URL မဟုတ်ပုံရပါ။ YouTube ဗီဒီယို၊ Short သို့မဟုတ် playlist လင့်ခ်တစ်ခု ထည့်ပါ။',
      chunkTransferFailure: 'ဆာဗာသည် ဒေါင်းလုဒ်လုပ်နေစဉ် အကြိမ်ကြိမ် ဖြတ်တောက်နေပြီး yt-dlp သည် ထပ်ကြိုးစားပြီးနောက် လက်လျှော့သွားသည်။ ၎င်းသည် အများအားဖြင့် အကြီးဆုံးဗီဒီယိုဖော်မတ်များ (4K HDR / bitrate မြင့် VP9) တွင် ဖြစ်တတ်သည်။ ထပ်ကြိုးစားပါ၊ network/VPN ပြောင်းပါ၊ သို့မဟုတ် resolution နိမ့်သောဖော်မတ်ကို ရွေးချယ်ပါ။',
      postprocessFailure: 'yt-dlp ဒေါင်းလုဒ်လုပ်ခြင်းကို ပြီးစီးခဲ့သော်လည်း post-processing (merge / mux / convert) မအောင်မြင်ပါ။ ၎င်းသည် ခဏတာ ffmpeg ပြဿနာဖြစ်တတ်ပါသည် — ထပ်ကြိုးစားကြည့်ပါ၊ ဆက်လက်ဖြစ်နေပါက ဖော်မတ်ပေါင်းစပ်မှု အခြားတစ်ခုကို စမ်းကြည့်ပါ။',
      parse: 'ဆိုက်မှ တုံ့ပြန်ချက်ကို parse မလုပ်နိုင်ပါ။ yt-dlp ၏ extractor သည် ခေတ်နောက်ကျနေပြီ ဖြစ်နိုင်သည်။ Arroxy သည် launch လုပ်သည့်အခါ yt-dlp ကို အလိုအလျောက် update လုပ်ပါသည် — ပြင်ဆင်မှု ထွက်ရှိပြီးနောက် မိနစ်အနည်းငယ်အကြာတွင် ထပ်ကြိုးစားကြည့်ပါ။',
      network: 'Network အမှား။ သင့်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။',
      drmProtected: 'ဤဗီဒီယိုသည် DRM ကာကွယ်ထားသည်။ yt-dlp သည် DRM ကို ဖြုတ်နိုင်မည်မဟုတ်သောကြောင့် ဖိုင်ကို ဒေါင်းလုဒ်မဆင်းနိုင်ပါ။',
      loginRequired: 'ဤဗီဒီယိုအတွက် login ဝင်ထားသော account လိုအပ်သည်။ cookies.txt တစ်ခု တပ်ဆင်ပါ (ဆက်တင် → Cookies) ပြီးနောက် ထပ်ကြိုးစားပါ။',
      unknown: 'ဒေါင်းလုဒ်မအောင်မြင်ပါ။ အောက်ပါ raw output ကို ကြည့်ပါ။'
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
  playlistPresets: {
    'video-best': { label: 'အကောင်းဆုံးအရည်အသွေး', desc: 'တစ်ခုချင်းစီ အမြင့်ဆုံး ဗီဒီယို + အသံ' },
    'video-2160p': { label: '4K အထိ', desc: '2160p ကန့်သတ်ထား၊ တစ်ခုချင်းစီ နိမ့်သောဘက်သို့ fallback' },
    'video-1440p': { label: '1440p အထိ', desc: '2K ကန့်သတ်ထား၊ တစ်ခုချင်းစီ နိမ့်သောဘက်သို့ fallback' },
    'video-1080p': { label: '1080p အထိ', desc: 'တစ်ခုချင်းစီ ကန့်သတ်ထား၊ နိမ့်သောဘက်သို့ fallback' },
    'video-720p': { label: '720p အထိ', desc: 'ဖိုင်သေး၊ ကျယ်ပြန့်သော ကိုက်ညီမှု' },
    'video-480p': { label: '480p အထိ', desc: 'Bandwidth နည်း' },
    'video-360p': { label: '360p အထိ', desc: 'အသေးဆုံးဗီဒီယို' },
    'audio-best': { label: 'Audio (အကောင်းဆုံး)', desc: 'မူလ အကောင်းဆုံးအသံ၊ ပြန်encode မလုပ်' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'MP3 192 kbps သို့ ပြောင်းမည်' }
  },
  formatLabel: {
    audioFallback: 'အသံ',
    audioOnlyDot: 'အသံသာ · {{audio}}',
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
    },
    rendererCrashed: {
      message: 'Arroxy တွင် ပြဿနာတစ်ခုဖြစ်ပေါ်ပါသည်',
      detail: 'Renderer လုပ်ငန်းစဉ် ပျက်ကွက်သွားပါသည် ({{reason}})။ ထပ်မံကြိုးစားရန် ပြန်ဖွင့်ပါ။',
      reload: 'ပြန်ဖွင့်မည်',
      quit: 'ထွက်မည်'
    }
  },
  share: {
    title: 'Arroxy မျှဝေမည်',
    description: 'Arroxy သည် အခမဲ့ နှင့် ဖွင့်ရင်းမြစ်ဖြစ်သည်။ မျှဝေခြင်းသည် လူပိုများ ၎င်းကို ရှာဖွေတွေ့ရှိနိုင်ရန် ကူညီသည်။',
    copyLink: 'လင့်ကိုကူးယူရန်',
    copied: 'ကူးယူပြီး!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy ကိုမျှဝေရန်',
    footerLabel: 'မျှဝေရန်',
    shareAction: 'Arroxy ကိုမျှဝေရန်',
    inlineCard: {
      body: 'Arroxy ကို နှစ်သက်ပါသလား? အသုံးဝင်နိုင်သော သူတစ်ဦးနှင့် မျှဝေပါ။',
      dismiss: 'မျှဝေရန်အကြံပြုချက် ပယ်ဖျက်မည်'
    },
    highValueBanner: {
      body: 'Arroxy ကို နှစ်သက်ပါသလား? အခြားသူများ ရှာဖွေတွေ့ရှိနိုင်ရန် ကူညီပါ။',
      dismiss: 'မျှဝေရန်အကြံပြုချက် ပယ်ဖျက်မည်'
    }
  }
} as const;

export default my;
