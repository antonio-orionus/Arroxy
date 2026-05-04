const bn = {
  common: {
    back: 'পেছনে',
    continue: 'চালিয়ে যান',
    retry: 'আবার চেষ্টা করুন',
    startOver: 'নতুন করে শুরু করুন',
    loading: 'লোড হচ্ছে…'
  },
  app: {
    feedback: 'মতামত',
    logs: 'লগ',
    feedbackNudge: 'Arroxy পছন্দ হচ্ছে? আপনার মতামত জানাতে চাই! 💬',
    debugCopied: 'কপি হয়েছে!',
    debugCopyTitle: 'ডিবাগ তথ্য কপি করুন (Electron, OS, Chrome সংস্করণ)',
    zoomIn: 'জুম ইন',
    zoomOut: 'জুম আউট'
  },
  titleBar: {
    close: 'বন্ধ করুন',
    minimize: 'ছোট করুন',
    maximize: 'বড় করুন',
    restore: 'পুনরুদ্ধার করুন'
  },
  splash: {
    greeting: 'স্বাগতম, আবার এলেন!',
    warmup: 'Arroxy প্রস্তুত হচ্ছে…',
    warning: 'সেটআপ অসম্পূর্ণ — কিছু ফিচার কাজ নাও করতে পারে'
  },
  theme: {
    light: 'লাইট মোড',
    dark: 'ডার্ক মোড',
    system: 'সিস্টেম ডিফল্ট'
  },
  language: {
    label: 'ভাষা'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'ফরম্যাট',
      subtitles: 'সাবটাইটেল',
      sponsorblock: 'SponsorBlock',
      output: 'আউটপুট',
      folder: 'সেভ',
      confirm: 'নিশ্চিত করুন'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com এবং youtu.be লিংক সমর্থিত',
      fetchFormats: 'ফরম্যাট আনুন',
      mascotIdle: 'একটি YouTube লিংক দিন (ভিডিও বা Short) — তারপর "ফরম্যাট আনুন" ক্লিক করুন, আমি কাজ শুরু করব ✨',
      mascotBusy: 'ব্যাকগ্রাউন্ডে ডাউনলোড হচ্ছে… আমি একসাথে অনেক কাজ করতে পারি 😎',
      advanced: 'উন্নত',
      clearAria: 'URL মুছুন',
      clipboard: {
        toggle: 'ক্লিপবোর্ড দেখুন',
        toggleDescription: 'YouTube লিংক কপি করলে URL ফিল্ড স্বয়ংক্রিয়ভাবে পূরণ হবে।',
        dialog: {
          title: 'YouTube URL পাওয়া গেছে',
          body: 'ক্লিপবোর্ডের এই লিংকটি ব্যবহার করবেন?',
          useButton: 'URL ব্যবহার করুন',
          disableButton: 'বন্ধ করুন',
          cancelButton: 'বাতিল',
          disableNote: 'পরে উন্নত সেটিংসে ক্লিপবোর্ড দেখা আবার চালু করা যাবে।'
        }
      },
      cookies: {
        toggle: 'কুকিজ ফাইল ব্যবহার করুন',
        toggleDescription: 'বয়স-সীমাবদ্ধ, সদস্য-শুধু এবং ব্যক্তিগত অ্যাকাউন্টের ভিডিওর জন্য সাহায্য করে।',
        risk: 'ঝুঁকি: cookies.txt-এ ওই ব্রাউজারের সমস্ত লগইন সেশন থাকে — এটি গোপন রাখুন।',
        fileLabel: 'কুকিজ ফাইল',
        choose: 'বেছে নিন…',
        clear: 'মুছুন',
        placeholder: 'কোনো ফাইল নির্বাচিত হয়নি',
        helpLink: 'কুকিজ এক্সপোর্ট করব কীভাবে?',
        enabledButNoFile: 'কুকিজ ব্যবহার করতে একটি ফাইল বেছে নিন',
        banWarning: 'YouTube অ্যাকাউন্ট ফ্ল্যাগ — এমনকি ব্যান — করতে পারে যদি সেই অ্যাকাউন্টের কুকিজ yt-dlp ব্যবহার করে। সম্ভব হলে অস্থায়ী অ্যাকাউন্ট ব্যবহার করুন।',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'প্রক্সির মাধ্যমে ট্র্যাফিক রাউট করুন — ভৌগোলিকভাবে সীমাবদ্ধ কন্টেন্টের জন্য উপযোগী।',
        placeholder: 'http://host:port',
        clear: 'মুছুন'
      },
      closeToTray: {
        toggle: 'বন্ধে ট্রেতে লুকান',
        toggleDescription: 'উইন্ডো বন্ধ করার পরেও ব্যাকগ্রাউন্ডে ডাউনলোড চলতে থাকবে।'
      },
      analytics: {
        toggle: 'বেনামী ব্যবহার পরিসংখ্যান পাঠান',
        toggleDescription: 'শুধুমাত্র অ্যাপ চালু হওয়ার সংখ্যা গণনা করে। কোনো URL, ফাইলের নাম বা ব্যক্তিগত তথ্য নেই।'
      }
    },
    subtitles: {
      heading: 'সাবটাইটেল',
      autoBadge: 'অটো',
      hint: 'সাইডকার ফাইল ভিডিওর পাশে সেভ হবে',
      noLanguages: 'এই ভিডিওর জন্য কোনো সাবটাইটেল নেই',
      skip: 'বাদ দিন',
      skipSubs: 'এই ভিডিওর জন্য বাদ দিন',
      selectAll: 'সব নির্বাচন করুন',
      deselectAll: 'সব বাতিল করুন',
      mascot: 'শূন্য, একটি বা অনেকগুলো বেছে নিন — সম্পূর্ণ আপনার উপর ✨',
      searchPlaceholder: 'ভাষা খুঁজুন…',
      noMatches: 'কোনো ভাষা মেলেনি',
      clearAll: 'সব মুছুন',
      noSelected: 'কোনো সাবটাইটেল নির্বাচিত হয়নি',
      selectedNote_one: '{{count}}টি সাবটাইটেল ডাউনলোড হবে',
      selectedNote_other: '{{count}}টি সাবটাইটেল ডাউনলোড হবে',
      sectionManual: 'ম্যানুয়াল',
      sectionAuto: 'স্বয়ংক্রিয়ভাবে তৈরি',
      saveMode: {
        heading: 'সেভ করুন',
        sidecar: 'ভিডিওর পাশে',
        embed: 'ভিডিওতে এম্বেড করুন',
        subfolder: 'subtitles/ সাবফোল্ডার'
      },
      format: {
        heading: 'ফরম্যাট'
      },
      embedNote: 'এম্বেড মোডে আউটপুট .mkv হিসেবে সেভ হয় যাতে সাবটাইটেল ট্র্যাক নির্ভরযোগ্যভাবে এম্বেড হয়।',
      autoAssNote: 'অটো-ক্যাপশন ASS-এর পরিবর্তে SRT হিসেবে সেভ হবে — YouTube-এর রোলিং-কিউ ডুপ্লিকেশন সবসময় পরিষ্কার করা হয়, যা আমাদের ASS কনভার্টার এখনও করতে পারে না।'
    },
    sponsorblock: {
      modeHeading: 'স্পনসর ফিল্টারিং',
      mode: {
        off: 'বন্ধ',
        mark: 'চ্যাপ্টার হিসেবে চিহ্নিত করুন',
        remove: 'সেগমেন্ট সরান'
      },
      modeHint: {
        off: 'কোনো SponsorBlock নেই — ভিডিও আপলোড করা অবস্থায় চলবে।',
        mark: 'স্পনসর সেগমেন্টকে চ্যাপ্টার হিসেবে চিহ্নিত করে (নন-ডেস্ট্রাক্টিভ)।',
        remove: 'FFmpeg ব্যবহার করে ভিডিও থেকে স্পনসর সেগমেন্ট কেটে ফেলে।'
      },
      categoriesHeading: 'ক্যাটাগরি',
      cat: {
        sponsor: 'স্পনসর',
        intro: 'ইন্ট্রো',
        outro: 'আউট্রো',
        selfpromo: 'সেলফ-প্রোমো',
        music_offtopic: 'অপ্রাসঙ্গিক মিউজিক',
        preview: 'প্রিভিউ',
        filler: 'ফিলার'
      }
    },
    formats: {
      quickPresets: 'দ্রুত প্রিসেট',
      video: 'ভিডিও',
      audio: 'অডিও',
      noAudio: 'অডিও নেই',
      videoOnly: 'শুধু ভিডিও',
      audioOnly: 'শুধু অডিও',
      audioOnlyOption: 'শুধু অডিও (ভিডিও ছাড়া)',
      mascot: 'সেরা + সেরা = সর্বোচ্চ মান। আমি এটাই বেছে নিতাম!',
      sniffing: 'আপনার জন্য সেরা ফরম্যাট খুঁজছি…',
      loadingHint: 'সাধারণত এক সেকেন্ড লাগে',
      loadingAria: 'ফরম্যাট লোড হচ্ছে',
      sizeUnknown: 'আকার অজানা',
      total: 'মোট'
    },
    folder: {
      heading: 'সেভ করুন',
      downloads: 'ডাউনলোড',
      videos: 'মুভিজ',
      desktop: 'ডেস্কটপ',
      music: 'মিউজিক',
      documents: 'ডকুমেন্টস',
      pictures: 'ছবি',
      home: 'হোম',
      custom: 'কাস্টম…',
      subfolder: {
        toggle: 'সাবফোল্ডারে সেভ করুন',
        placeholder: 'যেমন lo-fi rips',
        invalid: 'ফোল্ডার নামে অবৈধ অক্ষর আছে'
      }
    },
    output: {
      embedChapters: {
        label: 'চ্যাপ্টার এম্বেড করুন',
        description: 'যেকোনো আধুনিক প্লেয়ারে নেভিগেট করা যায় এমন চ্যাপ্টার মার্কার।'
      },
      embedMetadata: {
        label: 'মেটাডেটা এম্বেড করুন',
        description: 'শিরোনাম, শিল্পী, বিবরণ এবং আপলোড তারিখ ফাইলে লেখা হবে।'
      },
      embedThumbnail: {
        label: 'থাম্বনেইল এম্বেড করুন',
        description: 'ফাইলের ভেতরে কভার আর্ট। শুধুমাত্র MP4 / M4A — সাবটাইটেল এম্বেড থাকলে বাদ দেওয়া হবে।'
      },
      writeDescription: {
        label: 'বিবরণ সেভ করুন',
        description: 'ভিডিও বিবরণ ডাউনলোডের পাশে .description টেক্সট ফাইল হিসেবে সেভ করে।'
      },
      writeThumbnail: {
        label: 'থাম্বনেইল সেভ করুন',
        description: 'থাম্বনেইল ডাউনলোডের পাশে .jpg ইমেজ ফাইল হিসেবে সেভ করে।'
      }
    },
    confirm: {
      readyHeadline: 'ডাউনলোড করতে প্রস্তুত!',
      landIn: 'আপনার ফাইল যাবে',
      labelVideo: 'ভিডিও',
      labelAudio: 'অডিও',
      labelSubtitles: 'সাবটাইটেল',
      subtitlesNone: '—',
      labelSaveTo: 'সেভ করুন',
      labelSize: 'আকার',
      sizeUnknown: 'অজানা',
      nothingToDownload: 'শুধু সাবটাইটেল প্রিসেট চালু আছে কিন্তু কোনো সাবটাইটেল ভাষা নির্বাচিত হয়নি — কিছু ডাউনলোড হবে না।',
      audioOnly: 'শুধু অডিও',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'অন্য ডাউনলোড শেষ হলে শুরু হবে — পুরো ব্যান্ডউইথ পাবে',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'এখনই শুরু হবে — অন্য সক্রিয় ডাউনলোডের সাথে চলবে'
    },
    error: {
      icon: 'ত্রুটি'
    }
  },
  videoCard: {
    titlePlaceholder: 'লোড হচ্ছে…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'ডাউনলোড কিউ',
    toggleTitle: 'ডাউনলোড কিউ টগল করুন',
    empty: 'আপনার কিউ করা ডাউনলোড এখানে দেখা যাবে',
    noDownloads: 'এখনও কোনো ডাউনলোড নেই।',
    activeCount: '{{count}}টি ডাউনলোড হচ্ছে · {{percent}}%',
    clear: 'মুছুন',
    clearTitle: 'সম্পন্ন ডাউনলোড মুছুন',
    tip: 'আপনার ডাউনলোড নিচে কিউ করা হয়েছে — যেকোনো সময় খুলে অগ্রগতি দেখুন।',
    item: {
      doneAt: '{{time}} সম্পন্ন',
      paused: 'বিরতি দেওয়া',
      defaultError: 'ডাউনলোড ব্যর্থ',
      openUrl: 'URL খুলুন',
      pause: 'বিরতি',
      resume: 'চালিয়ে যান',
      cancel: 'বাতিল',
      remove: 'সরান'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'পাওয়া যাচ্ছে',
    youHave: '— আপনার কাছে আছে {{currentVersion}}',
    install: 'ইনস্টল ও রিস্টার্ট',
    downloading: 'ডাউনলোড হচ্ছে…',
    download: 'Download ↗',
    dismiss: 'আপডেট ব্যানার বন্ধ করুন',
    copy: 'কমান্ড ক্লিপবোর্ডে কপি করুন',
    copied: 'কমান্ড ক্লিপবোর্ডে কপি হয়েছে',
    installFailed: 'আপডেট ব্যর্থ হয়েছে',
    retry: 'পুনরায় চেষ্টা'
  },
  status: {
    preparingBinaries: 'বাইনারি প্রস্তুত করা হচ্ছে…',
    mintingToken: 'YouTube টোকেন তৈরি হচ্ছে…',
    remintingToken: 'টোকেন পুনরায় তৈরি হচ্ছে…',
    startingYtdlp: 'yt-dlp প্রক্রিয়া শুরু হচ্ছে…',
    downloadingMedia: 'ভিডিও ও অডিও ডাউনলোড হচ্ছে…',
    mergingFormats: 'অডিও ও ভিডিও একত্রিত হচ্ছে…',
    fetchingSubtitles: 'সাবটাইটেল আনা হচ্ছে…',
    sleepingBetweenRequests: 'রেট লিমিট এড়াতে {{seconds}} সেকেন্ড অপেক্ষা করছে…',
    subtitlesFailed: 'ভিডিও সেভ হয়েছে — কিছু সাবটাইটেল ডাউনলোড করা যায়নি',
    cancelled: 'ডাউনলোড বাতিল হয়েছে',
    complete: 'ডাউনলোড সম্পন্ন',
    usedExtractorFallback: 'শিথিল এক্সট্র্যাক্টর দিয়ে ডাউনলোড হয়েছে — আরও নির্ভরযোগ্য ডাউনলোডের জন্য cookies.txt সেট আপ করুন',
    ytdlpProcessError: 'yt-dlp প্রক্রিয়া ত্রুটি: {{error}}',
    ytdlpExitCode: 'yt-dlp {{code}} কোড দিয়ে বন্ধ হয়েছে',
    downloadingBinary: '{{name}} বাইনারি ডাউনলোড হচ্ছে…',
    unknownStartupFailure: 'অজানা ডাউনলোড স্টার্টআপ ব্যর্থতা'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube এই অনুরোধকে বট হিসেবে চিহ্নিত করেছে। একটু পরে আবার চেষ্টা করুন।',
      ipBlock: 'আপনার IP ঠিকানা YouTube দ্বারা ব্লক মনে হচ্ছে। পরে আবার চেষ্টা করুন বা VPN ব্যবহার করুন।',
      rateLimit: 'YouTube অনুরোধ সীমিত করছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।',
      ageRestricted: 'এই ভিডিওটি বয়স-সীমাবদ্ধ এবং লগইন করা অ্যাকাউন্ট ছাড়া ডাউনলোড করা যাবে না।',
      unavailable: 'এই ভিডিওটি পাওয়া যাচ্ছে না — এটি ব্যক্তিগত, মুছে ফেলা বা অঞ্চল-লক হতে পারে।',
      geoBlocked: 'এই ভিডিওটি আপনার অঞ্চলে পাওয়া যায় না।',
      outOfDiskSpace: 'পর্যাপ্ত ডিস্ক স্পেস নেই। জায়গা খালি করে আবার চেষ্টা করুন।'
    }
  },
  presets: {
    'best-quality': {
      label: 'সর্বোচ্চ মান',
      desc: 'সর্বোচ্চ রেজোলিউশন + সেরা অডিও'
    },
    balanced: {
      label: 'সুষম',
      desc: '720p সর্বোচ্চ + ভালো অডিও'
    },
    'audio-only': {
      label: 'শুধু অডিও',
      desc: 'ভিডিও নেই, সেরা অডিও'
    },
    'small-file': {
      label: 'ছোট ফাইল',
      desc: 'সর্বনিম্ন রেজোলিউশন + কম অডিও'
    },
    'subtitle-only': {
      label: 'শুধু সাবটাইটেল',
      desc: 'ভিডিও নেই, অডিও নেই, শুধু সাবটাইটেল'
    }
  },
  formatLabel: {
    audioOnly: 'শুধু অডিও',
    audioFallback: 'অডিও',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'নিষ্ক্রিয়',
      statusActive_one: '১টি ডাউনলোড হচ্ছে · {{percent}}%',
      statusActive_other: '{{count}}টি ডাউনলোড হচ্ছে · {{percent}}%',
      open: 'Arroxy খুলুন',
      quit: 'Arroxy বন্ধ করুন'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}}টি ডাউনলোড চলছে',
      message_other: '{{count}}টি ডাউনলোড চলছে',
      detail: 'বন্ধ করলে সমস্ত সক্রিয় ডাউনলোড বাতিল হয়ে যাবে।',
      confirm: 'ডাউনলোড বাতিল করুন ও বন্ধ করুন',
      keep: 'ডাউনলোড চালিয়ে যান'
    },
    closeToTray: {
      message: 'বন্ধ করার সময় Arroxy সিস্টেম ট্রেতে লুকাবে?',
      detail: 'Arroxy চলতে থাকে এবং সক্রিয় ডাউনলোড শেষ করে। পরে উন্নত সেটিংসে পরিবর্তন করুন।',
      hide: 'ট্রেতে লুকান',
      quit: 'বন্ধ করুন',
      remember: 'আর জিজ্ঞেস করবেন না'
    },
    rendererCrashed: {
      message: 'Arroxy একটি সমস্যার সম্মুখীন হয়েছে',
      detail: 'রেন্ডারার প্রক্রিয়া ক্র্যাশ হয়েছে ({{reason}})। আবার চেষ্টা করতে পুনরায় লোড করুন।',
      reload: 'পুনরায় লোড করুন',
      quit: 'বন্ধ করুন'
    }
  }
} as const;

export default bn;
