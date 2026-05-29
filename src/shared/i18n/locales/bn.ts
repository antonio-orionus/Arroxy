const bn = {
  common: {
    back: 'পেছনে',
    continue: 'চালিয়ে যান',
    retry: 'আবার চেষ্টা করুন',
    startOver: 'নতুন করে শুরু করুন'
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
  about: {
    button: 'সম্পর্কে',
    openTitle: 'Arroxy সম্পর্কে',
    tagline: 'ডেস্কটপের জন্য দ্রুত ও সহজ ভিডিও ও অডিও ডাউনলোডার।',
    websiteLink: 'ওয়েবসাইট',
    githubLink: 'GitHub',
    licenseLine: 'MIT লাইসেন্স · Antonio Orionus দ্বারা',
    thirdPartyNotices: 'তৃতীয়-পক্ষ নোটিশ দেখুন'
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
    downloading: '{{binary}} ডাউনলোড হচ্ছে…',
    warmupFailedNoDiag: 'সেটআপ ব্যর্থ হয়েছে। বিস্তারিত জানতে সেটআপ লগ খুলুন।'
  },
  repair: {
    title: 'সেটআপে আপনার সাহায্য দরকার',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'যাচাই করা সম্ভব হয়নি।',
      downloadFailed: 'ডাউনলোড ব্যর্থ হয়েছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।',
      extractFailed: 'আর্কাইভ বের করা ব্যর্থ হয়েছে। ডাউনলোড ক্ষতিগ্রস্ত হতে পারে — আবার চেষ্টা করুন।',
      hashFailed: 'ডাউনলোড করা ফাইলের চেকসাম মেলেনি। ডাউনলোড আবার করুন।',
      spawnFailed: 'ফাইলটি নেই বা চালু করা যায়নি। কার্যকর একটি কপি বেছে নিন।',
      permissionDenied: 'সিস্টেম ফাইলটি চালাতে অস্বীকার করেছে। বিশ্বস্ত একটি কপি বেছে নিন বা অ্যাডমিন হিসেবে আবার চেষ্টা করুন।',
      blockedOrQuarantined: 'Windows ফাইলটি ব্লক করেছে (SmartScreen / Defender)। ইনস্টল করা কপি বেছে নিন বা রানটাইম ফোল্ডার হোয়াইটলিস্ট করুন।',
      badExitCode: 'বাইনারি --version-এ সাড়া দেয়নি। এটি ক্ষতিগ্রস্ত বা ভুল বিল্ড হতে পারে।',
      timeout: 'ভার্সন যাচাইয়ের সময় শেষ হয়ে গেছে। ফাইলটি আটকে থাকতে পারে — আবার চেষ্টা করুন।',
      pairIncomplete: 'ffmpeg এবং ffprobe উভয়কেই একটি মিলিত জোড়া হিসেবে সেট করতে হবে।'
    },
    actions: {
      chooseExecutable: 'এক্সিকিউটেবল বেছে নিন',
      resetToDefault: 'ডিফল্টে ফিরুন',
      retrySetup: 'সেটআপ আবার চেষ্টা করুন',
      cancel: 'বাতিল',
      openDependencyFolder: 'ডিপেনডেন্সি ফোল্ডার খুলুন',
      viewSetupLog: 'সেটআপ লগ দেখুন'
    }
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
      playlistItems: 'Playlist',
      playlistPresets: 'মান',
      formats: 'ফরম্যাট',
      subtitles: 'সাবটাইটেল',
      sponsorblock: 'SponsorBlock',
      output: 'আউটপুট',
      folder: 'সেভ',
      confirm: 'নিশ্চিত করুন'
    },
    playlist: {
      heading: 'Playlist আইটেম',
      itemCount_one: '{{count}}টি ভিডিও',
      itemCount_other: '{{count}}টি ভিডিও',
      itemCountAudio_one: '{{count}}টি ট্র্যাক',
      itemCountAudio_other: '{{count}}টি ট্র্যাক',
      selectAll: 'সব নির্বাচন করুন',
      selectNone: 'কোনোটি নির্বাচন করবেন না',
      rangeFrom: 'থেকে',
      rangeTo: 'পর্যন্ত',
      rangeApply: 'রেঞ্জ প্রয়োগ করুন',
      selectedCount_one: '{{count}}টি নির্বাচিত',
      selectedCount_other: '{{count}}টি নির্বাচিত',
      noSelection: 'চালিয়ে যেতে কমপক্ষে একটি ভিডিও নির্বাচন করুন',
      loadingItems: 'Playlist আনা হচ্ছে…',
      thumbnailAlt: 'ভিডিও থাম্বনেইল',
      durationUnknown: 'লাইভ',
      syncChange: 'ফোল্ডার বদলান…',
      syncApply: 'সিঙ্ক প্রয়োগ করুন',
      syncScanning: 'ফোল্ডার পরীক্ষা করা হচ্ছে…',
      syncFoundTitle: 'ইতিমধ্যেই ফোল্ডারে আছে',
      syncFoundDesc: 'এই ভিডিওগুলোর মধ্যে {{n}}টি ইতিমধ্যেই {{dir}}-এ আছে। শুধু নতুনগুলো ডাউনলোড করতে সিঙ্ক করবেন?',
      syncNoneTitle: 'এখনও কিছু ডাউনলোড হয়নি',
      syncNoneDesc: 'এই প্লেলিস্টের কোনো ভিডিও {{dir}}-এ পাওয়া যায়নি।',
      alreadyDownloaded: 'ইতিমধ্যেই ডাউনলোড করা'
    },
    playlistPresets: {
      heading: 'ব্যাচের জন্য মান বেছে নিন',
      subhead: 'প্রতিটি ভিডিও স্বাধীনভাবে বেছে নেওয়া স্তর অনুযায়ী রেজোলিউশন করে — বৈচিত্র্যময় playlist অবাক করা ছাড়াই কাজ করে।',
      itemCount_one: '{{count}}টি আইটেম',
      itemCount_other: '{{count}}টি আইটেম'
    },
    mixedPrompt: {
      title: 'এই লিংকে একটি Playlist আছে',
      body: 'শুধু যে ভিডিওতে ক্লিক করেছিলেন সেটি চান, নাকি Playlist থেকে বেছে নিতে চান? পরে নির্দিষ্ট ভিডিও বা রেঞ্জ বেছে নেবেন।',
      singleVideo: 'শুধু এটি',
      pickFromPlaylist: 'Playlist থেকে বেছে নিন'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'ফরম্যাট আনুন',
      features: {
        heading: 'Arroxy যা নামাতে পারে',
        youtube: {
          heading: 'YouTube',
          video: 'ভিডিও',
          channel: 'চ্যানেল',
          playlist: 'Playlist',
          short: 'Shorts',
          music: 'মিউজিক',
          podcast: 'Podcast'
        },
        anySite: {
          heading: '2000+ সাইট',
          video: 'ভিডিও',
          videoPlaylist: 'ভিডিও playlist',
          musicPlaylist: 'মিউজিক playlist'
        },
        always: {
          heading: 'সবসময় উপলব্ধ',
          audioOnly: 'শুধু অডিও',
          subtitles: 'সাবটাইটেল'
        }
      },
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
        sourceLabel: 'কুকিজের উৎস',
        sourceOff: 'বন্ধ',
        sourceFile: 'ফাইল',
        sourceBrowser: 'ব্রাউজার',
        toggleDescription: 'বয়স-সীমাবদ্ধ, সদস্য-শুধু এবং ব্যক্তিগত অ্যাকাউন্টের ভিডিওর জন্য সাহায্য করে।',
        risk: 'ঝুঁকি: cookies.txt-এ ওই ব্রাউজারের সমস্ত লগইন সেশন থাকে — এটি গোপন রাখুন।',
        fileLabel: 'কুকিজ ফাইল',
        choose: 'বেছে নিন…',
        clear: 'মুছুন',
        placeholder: 'কোনো ফাইল নির্বাচিত হয়নি',
        helpLink: 'কুকিজ এক্সপোর্ট করব কীভাবে?',
        enabledButNoFile: 'কুকিজ ব্যবহার করতে একটি ফাইল বেছে নিন',
        browserLabel: 'ব্রাউজার',
        browserPlaceholder: 'একটি ব্রাউজার বেছে নিন…',
        browserHelp: 'সরাসরি ব্রাউজার থেকে কুকিজ পড়ে। Chromium-পরিবারের ব্রাউজারের জন্য ব্রাউজারটি বন্ধ থাকতে হবে।',
        enabledButNoBrowser: 'কুকিজ ব্যবহার করতে একটি ব্রাউজার বেছে নিন',
        banWarning: 'YouTube অ্যাকাউন্ট ফ্ল্যাগ — এমনকি ব্যান — করতে পারে যদি সেই অ্যাকাউন্টের কুকিজ yt-dlp ব্যবহার করে। সম্ভব হলে অস্থায়ী অ্যাকাউন্ট ব্যবহার করুন।',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt স্থানীয়ভাবে পান (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'প্রক্সির মাধ্যমে ট্র্যাফিক রাউট করুন — ভৌগোলিকভাবে সীমাবদ্ধ কন্টেন্টের জন্য উপযোগী।',
        placeholder: 'http://host:port',
        clear: 'মুছুন'
      },
      singleFilenameId: {
        toggle: 'একক ফাইলনামে ভিডিও ID যোগ করুন',
        toggleDescription: 'শিরোনাম বদলালে বা মিলে গেলে এককালীন ডাউনলোডগুলোকে আলাদা রাখে।'
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
      autoBadge: 'অটো',
      noLanguages: 'এই ভিডিওর জন্য কোনো সাবটাইটেল নেই',
      skip: 'বাদ দিন',
      skipSubs: 'এই ভিডিওর জন্য বাদ দিন',
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
      loadingHint: 'প্রোবিং শেষ হওয়া পর্যন্ত অপেক্ষা করুন — প্লেলিস্ট ও অনুসন্ধানে একটু বেশি সময় লাগতে পারে।',
      loadingAria: 'ফরম্যাট লোড হচ্ছে',
      sizeUnknown: 'আকার অজানা',
      skipToConfirm: 'নিশ্চিতে যান',
      skipToConfirmTooltip: 'বাকি সকল ধাপের জন্য আপনার সংরক্ষিত পছন্দ ব্যবহার করে। কোনো সেটিং পরিবর্তন করতে, পরিবর্তে ধাপে ধাপে এগিয়ে যান — আপনার পছন্দ পরের বার সংরক্ষিত হবে।',
      total: 'মোট',
      keepAudio: 'যেমন আছে রাখুন',
      keepAudioMeta: 'বিল্ট-ইন অডিও',
      convert: {
        label: 'কনভার্ট করুন',
        uncompressed: 'কনভার্ট · আনকম্প্রেসড',
        bitrate: 'বিটরেট',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'অডিও কনভার্শনের জন্য শুধু অডিও মোড প্রয়োজন (ভিডিও পিক বাতিল করুন)।',
        requiresLossy: 'একটি নেটিভ স্ট্রিম নির্বাচিত — বিটরেট শুধুমাত্র mp3, m4a, বা opus-এ কনভার্ট করার সময় প্রযোজ্য।'
      },
      botWall: {
        heading: 'YouTube এই প্রোবটি সীমাবদ্ধ করেছে',
        bodyUnconfigured: 'ফরম্যাট তালিকা অসম্পূর্ণ হতে পারে। উন্নত সেটিংসে কুকিজ সেট করুন, অথবা নেটওয়ার্ক পরিবর্তন করে আবার চেষ্টা করুন।',
        bodyDisabled: 'কুকিজ কনফিগার করা আছে কিন্তু বন্ধ। সম্পূর্ণ তালিকা পেতে চালু করে আবার চেষ্টা করুন, অথবা নেটওয়ার্ক পরিবর্তন করে আবার চেষ্টা করুন।',
        bodyEnabled: 'কুকিজ থাকলেও YouTube এই প্রোব সীমাবদ্ধ করেছে। পরে আবার চেষ্টা করুন বা নেটওয়ার্ক পরিবর্তন করুন।',
        retryCta: 'আবার চেষ্টা করুন',
        enableRetryCta: 'কুকিজ চালু করে আবার চেষ্টা করুন'
      },
      cookiesError: {
        heading: 'কুকিজ কারণ হতে পারে',
        currentModeLabel: 'কুকিজের উৎস',
        currentModeFile: 'ফাইল',
        currentModeBrowser: 'ব্রাউজার',
        explanationFile: 'আপনার কুকিজ ফাইলটি খালি, মেয়াদ শেষ বা ভুল ফরম্যাটে থাকতে পারে (yt-dlp Netscape cookies.txt আশা করে)। কুকিজ পুনরায় এক্সপোর্ট করুন, ভিন্ন ফাইল বেছে নিন, ব্রাউজার মোডে স্যুইচ করুন, অথবা কুকিজ বন্ধ করে দেখুন।',
        explanationBrowser: 'কুকিজ সরাসরি ব্রাউজার থেকে পড়া হয়। ব্রাউজার এখন চলছে থাকলে, এর কুকি ডেটাবেস লক থাকতে পারে (Chromium-পরিবার)। ব্রাউজারটি YouTube-এ সাইন ইন থাকতে হবে। ব্রাউজার বন্ধ করুন, ভিন্ন ব্রাউজারে স্যুইচ করুন, ফাইল মোডে স্যুইচ করুন, অথবা কুকিজ বন্ধ করে দেখুন।',
        openSettingsCta: 'কুকিজ সেটিংস খুলুন',
        needsCookies: {
          heading: 'এই সাইটে সাইন-ইন প্রয়োজন',
          body: 'yt-dlp প্রমাণীকরণ ছাড়া এই ভিডিওতে অ্যাক্সেস করতে পারেনি। উন্নত সেটিংসে কুকিজ কনফিগার করুন — আপনি ইতিমধ্যে সাইন ইন করা কোনো ব্রাউজার দিন, বা cookies.txt ফাইল আমদানি করুন।'
        },
        dpapi: {
          heading: 'Windows এনক্রিপশন দ্বারা Chrome কুকিজ ব্লক হয়েছে',
          explanation: 'Chrome 127 এবং পরবর্তী সংস্করণ Windows-এ কুকিজ এমনভাবে এনক্রিপ্ট করে যা অন্য অ্যাপ পড়তে পারে না। নিচের যেকোনো একটি সমাধান চেষ্টা করুন।',
          fixFirefoxLabel: 'Firefox-এ যান',
          fixFirefoxBody: 'Firefox App-Bound Encryption ব্যবহার করে না। কুকিজ সেটিংস খুলুন এবং ব্রাউজার তালিকা থেকে Firefox বেছে নিন।',
          fixFileLabel: 'cookies.txt এক্সপোর্ট করুন',
          fixFileBody: 'Chrome থেকে ব্রাউজার এক্সটেনশন দিয়ে কুকিজ এক্সপোর্ট করুন, তারপর এই অ্যাপটি File মোডে পরিবর্তন করে এক্সপোর্ট করা ফাইলটি বেছে নিন।',
          fixUnsafeLabel: 'App-Bound Encryption নিষ্ক্রিয় করে Chrome চালু করুন',
          fixUnsafeBody: 'Chrome-এর লঞ্চ শর্টকাটে --disable-features=LockProfileCookieDatabase যোগ করুন। সতর্কতা: এটি আগে এনক্রিপ্ট করা কুকিজ অকার্যকর করে দেয়, তাই আপনি প্রতিটি সাইট থেকে লগ আউট হয়ে যাবেন এবং আবার লগ ইন করতে হবে।',
          docsLinkLabel: 'yt-dlp ডকস (ইস্যু #10927)'
        }
      }
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
        description: 'ফাইলের ভেতরে কভার আর্ট। WebM ভিডিও MKV-তে রিমাক্স করা হবে; সাবটাইটেল এম্বেড থাকলে বাদ দেওয়া হবে।'
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
      thumbnailEmbedNotSupported: 'Thumbnail embed বাদ দেওয়া হয়েছে — আউটপুট container এটি সমর্থন করে না।',
      subtitleEmbedAudioOnly: 'সাবটাইটেল embed পরিবর্তন করে sidecar করা হয়েছে — অডিও ট্র্যাক embedded সাবটাইটেল স্ট্রিম সমর্থন করে না।',
      audioOnly: 'শুধু অডিও',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'অন্য ডাউনলোড শেষ হলে শুরু হবে — পুরো ব্যান্ডউইথ পাবে',
      pullIt: 'নামিয়ে নিন! ↓',
      pullItTooltip: 'এখনই শুরু হবে — অন্য সক্রিয় ডাউনলোডের সাথে চলবে',
      labelPlaylist: 'Playlist',
      labelPreset: 'প্রিসেট',
      labelItems: 'আইটেম',
      itemsValue_one: '{{total}}-এর মধ্যে {{count}}টি ভিডিও',
      itemsValue_other: '{{total}}-এর মধ্যে {{count}}টি ভিডিও',
      itemsValueAudio_one: '{{total}}-এর মধ্যে {{count}}টি ট্র্যাক',
      itemsValueAudio_other: '{{total}}-এর মধ্যে {{count}}টি ট্র্যাক'
    }
  },
  videoCard: {
    titlePlaceholder: 'লোড হচ্ছে…'
  },
  queue: {
    header: 'ডাউনলোড কিউ',
    toggleTitle: 'ডাউনলোড কিউ টগল করুন',
    empty: 'আপনার কিউ করা ডাউনলোড এখানে দেখা যাবে',
    noDownloads: 'এখনও কোনো ডাউনলোড নেই।',
    activeCount: '{{count}}টি ডাউনলোড হচ্ছে · {{percent}}%',
    clear: 'মুছুন',
    clearTitle: 'সম্পন্ন ডাউনলোড মুছুন',
    pauseAll: 'সব বিরাম করুন',
    pauseAllTitle: 'সব সক্রিয় ডাউনলোড বিরাম করুন',
    cancelAll: 'সব বাতিল করুন',
    cancelAllTitle: 'সব সক্রিয় ও অপেক্ষমাণ ডাউনলোড বাতিল করুন',
    tip: 'আপনার ডাউনলোড নিচে কিউ করা হয়েছে — যেকোনো সময় খুলে অগ্রগতি দেখুন।',
    item: {
      doneAt: '{{time}} সম্পন্ন',
      paused: 'বিরতি দেওয়া',
      defaultError: 'ডাউনলোড ব্যর্থ',
      openUrl: 'URL খুলুন',
      pause: 'বিরতি',
      hold: 'মুলতুবি',
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
    extractingAudio: 'অডিও রূপান্তর হচ্ছে…',
    convertingVideo: 'ভিডিও রূপান্তর হচ্ছে…',
    embeddingMetadata: 'মেটাডেটা যুক্ত হচ্ছে…',
    movingFiles: 'ফাইল সরানো হচ্ছে…',
    fetchingSubtitles: 'সাবটাইটেল আনা হচ্ছে…',
    sleepingBetweenRequests: 'রেট লিমিট এড়াতে {{seconds}} সেকেন্ড অপেক্ষা করছে…',
    subtitlesFailed: 'ভিডিও সেভ হয়েছে — কিছু সাবটাইটেল ডাউনলোড করা যায়নি',
    cancelled: 'ডাউনলোড বাতিল হয়েছে',
    complete: 'ডাউনলোড সম্পন্ন',
    usedExtractorFallback: 'শিথিল এক্সট্র্যাক্টর দিয়ে ডাউনলোড হয়েছে — আরও নির্ভরযোগ্য ডাউনলোডের জন্য cookies.txt সেট আপ করুন',
    ytdlpProcessError: 'yt-dlp প্রক্রিয়া ত্রুটি: {{error}}',
    ytdlpExitCode: 'yt-dlp {{code}} কোড দিয়ে বন্ধ হয়েছে',
    downloadingBinary: '{{name}} বাইনারি ডাউনলোড হচ্ছে…',
    unknownStartupFailure: 'অজানা ডাউনলোড স্টার্টআপ ব্যর্থতা',
    diskSpaceInsufficient: 'পর্যাপ্ত ডিস্ক স্থান নেই — {{required}} প্রয়োজন, মাত্র {{free}} পাওয়া যাচ্ছে',
    fetchingSponsorBlock: 'SponsorBlock-এর সাথে যোগাযোগ করা হচ্ছে…',
    retryingSponsorBlock: 'SponsorBlock অনুপলব্ধ, আবার চেষ্টা হচ্ছে ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'বট সুরক্ষা চালু হয়েছে। আপনি যে IP ব্যবহার করছেন সেটি সম্ভবত ফ্ল্যাগ করা (ডেটাসেন্টার রেঞ্জ বা ব্যস্ত VPN এক্সিট)। আপনার IP পরিবর্তন করুন বা ভিন্ন VPN এন্ডপয়েন্ট বেছে নিন এবং আবার চেষ্টা করুন। যদি বারবার ব্যর্থ হয়, এটি সাময়িক YouTube-এর পরিবর্তন হতে পারে — Arroxy চালু হওয়ার সময় স্বয়ংক্রিয়ভাবে yt-dlp আপডেট করে, তাই আপস্ট্রিম ঠিক করলে সমাধান আপনাআপনি আসবে।',
      ipBlock: 'আপনার IP ঠিকানা YouTube দ্বারা ব্লক মনে হচ্ছে। পরে আবার চেষ্টা করুন বা VPN ব্যবহার করুন।',
      rateLimit: 'YouTube অনুরোধ সীমিত করছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।',
      ageRestricted: 'এই ভিডিওটি বয়স-সীমাবদ্ধ এবং লগইন করা অ্যাকাউন্ট ছাড়া ডাউনলোড করা যাবে না।',
      unavailable: 'এই ভিডিওটি পাওয়া যাচ্ছে না — এটি ব্যক্তিগত, মুছে ফেলা বা অঞ্চল-লক হতে পারে।',
      geoBlocked: 'এই ভিডিওটি আপনার অঞ্চলে পাওয়া যায় না।',
      outOfDiskSpace: 'পর্যাপ্ত ডিস্ক স্পেস নেই। জায়গা খালি করে আবার চেষ্টা করুন।',
      unsupportedUrl: 'এটি ভিডিও URL মনে হচ্ছে না। একটি YouTube ভিডিও, Short, বা playlist লিংক পেস্ট করুন।',
      chunkTransferFailure: 'সার্ভার বারবার ডাউনলোড মাঝপথে কেটে দিচ্ছিল এবং yt-dlp বারবার চেষ্টার পর হাল ছেড়ে দিয়েছে। এটি সাধারণত সবচেয়ে বড় ভিডিও ফরম্যাটে (4K HDR / উচ্চ বিটরেট VP9) হয়। আবার চেষ্টা করুন, নেটওয়ার্ক/VPN বদলান, অথবা কম রেজোলিউশনের ফরম্যাট বেছে নিন।',
      postprocessFailure: 'yt-dlp ডাউনলোড শেষ করেছে কিন্তু post-processing (merge / mux / convert) ব্যর্থ হয়েছে। প্রায়ই এটি একটি সাময়িক ffmpeg সমস্যা — আবার চেষ্টা করুন, এবং সমস্যা চলতে থাকলে অন্য একটি ফরম্যাট কম্বিনেশন চেষ্টা করুন।',
      parse: 'সাইট থেকে আসা রেসপন্স পার্স করা যায়নি। yt-dlp এর extractor পুরোনো হয়ে গেছে হতে পারে। Arroxy চালু হওয়ার সময় yt-dlp স্বয়ংক্রিয়ভাবে আপডেট করে — কয়েক মিনিট পর ফিক্স আসলে আবার চেষ্টা করুন।',
      network: 'নেটওয়ার্ক ত্রুটি। আপনার সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।',
      drmProtected: 'এই ভিডিওটি DRM-সুরক্ষিত। yt-dlp DRM সরাতে পারে না, তাই ফাইলটি ডাউনলোড করা যাবে না।',
      loginRequired: 'এই ভিডিওর জন্য সাইন-ইন করা অ্যাকাউন্ট প্রয়োজন। cookies.txt সেট আপ করুন (সেটিংস → Cookies) এবং আবার চেষ্টা করুন।',
      unknown: 'ডাউনলোড ব্যর্থ। নিচে raw output দেখুন।'
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
  playlistPresets: {
    'video-best': { label: 'সর্বোচ্চ মান', desc: 'প্রতিটি আইটেমে সর্বোচ্চ ভিডিও + অডিও' },
    'video-2160p': { label: '4K পর্যন্ত', desc: '2160p সীমাবদ্ধ, প্রতি আইটেমে নিম্নে ফলব্যাক' },
    'video-1440p': { label: '1440p পর্যন্ত', desc: '2K সীমাবদ্ধ, প্রতি আইটেমে নিম্নে ফলব্যাক' },
    'video-1080p': { label: '1080p পর্যন্ত', desc: 'প্রতি আইটেমে সীমাবদ্ধ, নিম্নে ফলব্যাক' },
    'video-720p': { label: '720p পর্যন্ত', desc: 'ছোট ফাইল, ব্যাপক সামঞ্জস্যতা' },
    'video-480p': { label: '480p পর্যন্ত', desc: 'কম ব্যান্ডউইথ' },
    'video-360p': { label: '360p পর্যন্ত', desc: 'সবচেয়ে ছোট ভিডিও' },
    'audio-best': { label: 'Audio (সেরা)', desc: 'নেটিভ সেরা অডিও, রি-এনকোড নেই' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'MP3 192 kbps-এ কনভার্ট করুন' }
  },
  formatLabel: {
    audioFallback: 'অডিও',
    audioOnlyDot: 'শুধু অডিও · {{audio}}',
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
  },
  share: {
    title: 'Arroxy শেয়ার করুন',
    description: 'Arroxy বিনামূল্যে এবং ওপেন-সোর্স। শেয়ার করলে আরও বেশি মানুষ এটি আবিষ্কার করতে পারবেন।',
    copyLink: 'লিঙ্ক কপি করুন',
    copied: 'কপি হয়েছে!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy শেয়ার করুন',
    footerLabel: 'শেয়ার',
    shareAction: 'Arroxy শেয়ার করুন',
    inlineCard: {
      body: 'Arroxy পছন্দ হচ্ছে? এমন কাউকে শেয়ার করুন যে উপকৃত হতে পারেন।',
      dismiss: 'শেয়ার পরামর্শ বাতিল করুন'
    },
    highValueBanner: {
      body: 'Arroxy পছন্দ হচ্ছে? অন্যদের আবিষ্কার করতে সাহায্য করুন।',
      dismiss: 'শেয়ার পরামর্শ বাতিল করুন'
    }
  }
} as const;

export default bn;
