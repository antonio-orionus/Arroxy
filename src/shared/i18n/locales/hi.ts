const hi = {
  common: {
    back: 'वापस',
    continue: 'जारी रखें',
    retry: 'फिर से कोशिश करें',
    startOver: 'फिर से शुरू करें'
  },
  app: {
    feedback: 'प्रतिक्रिया',
    logs: 'लॉग',
    feedbackNudge: 'Arroxy पसंद आ रहा है? आपकी राय सुनने को बेताब हूँ! 💬',
    debugCopied: 'कॉपी हो गया!',
    debugCopyTitle: 'डिबग जानकारी कॉपी करें (Electron, OS, Chrome वर्शन)',
    zoomIn: 'ज़ूम इन',
    zoomOut: 'ज़ूम आउट'
  },
  about: {
    button: 'जानकारी',
    openTitle: 'Arroxy के बारे में',
    tagline: 'डेस्कटॉप के लिए तेज़ और सरल वीडियो और ऑडियो डाउनलोडर।',
    websiteLink: 'वेबसाइट',
    githubLink: 'GitHub',
    licenseLine: 'MIT लाइसेंस · Antonio Orionus द्वारा',
    thirdPartyNotices: 'तृतीय-पक्ष सूचनाएँ देखें'
  },
  titleBar: {
    close: 'बंद करें',
    minimize: 'छोटा करें',
    maximize: 'बड़ा करें',
    restore: 'पुनर्स्थापित करें'
  },
  splash: {
    greeting: 'अरे, फिर से स्वागत है!',
    warmup: 'Arroxy तैयार हो रहा है…',
    downloading: '{{binary}} डाउनलोड हो रहा है…',
    warmupFailedNoDiag: 'सेटअप विफल हो गया। विवरण के लिए सेटअप लॉग खोलें।'
  },
  repair: {
    title: 'सेटअप को आपकी मदद चाहिए',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'सत्यापित नहीं किया जा सका।',
      downloadFailed: 'डाउनलोड विफल रहा। अपना इंटरनेट कनेक्शन जाँचें और पुनः प्रयास करें।',
      extractFailed: 'आर्काइव निकालने में विफलता। डाउनलोड दूषित हो सकता है — पुनः प्रयास करें।',
      hashFailed: 'डाउनलोड की गई फ़ाइल का checksum मेल नहीं खाता। डाउनलोड फिर से करें।',
      spawnFailed: 'फ़ाइल मौजूद नहीं है या लॉन्च नहीं हो सकी। एक काम करने वाली कॉपी चुनें।',
      permissionDenied: 'सिस्टम ने फ़ाइल चलाने से इनकार किया। कोई विश्वसनीय कॉपी चुनें या व्यवस्थापक के रूप में पुनः प्रयास करें।',
      blockedOrQuarantined: 'Windows ने फ़ाइल को ब्लॉक किया (SmartScreen / Defender)। इंस्टॉल की गई कॉपी चुनें या runtime फ़ोल्डर को श्वेतसूची में डालें।',
      badExitCode: 'बाइनरी ने --version का जवाब नहीं दिया। यह दूषित या गलत बिल्ड हो सकती है।',
      timeout: 'वर्शन जाँच का समय समाप्त हो गया। फ़ाइल रुकी हुई हो सकती है — पुनः प्रयास करें।',
      pairIncomplete: 'ffmpeg और ffprobe दोनों को मिलान जोड़ी के रूप में सेट करना होगा।'
    },
    actions: {
      chooseExecutable: 'एक्ज़ीक्यूटेबल चुनें',
      resetToDefault: 'डिफ़ॉल्ट पर रीसेट करें',
      retrySetup: 'सेटअप पुनः प्रयास करें',
      cancel: 'रद्द करें',
      openDependencyFolder: 'डिपेंडेंसी फ़ोल्डर खोलें',
      viewSetupLog: 'सेटअप लॉग देखें'
    }
  },
  theme: {
    light: 'लाइट मोड',
    dark: 'डार्क मोड',
    system: 'सिस्टम डिफ़ॉल्ट'
  },
  language: {
    label: 'भाषा'
  },
  wizard: {
    steps: {
      url: 'URL',
      playlistItems: 'Playlist',
      playlistPresets: 'गुणवत्ता',
      formats: 'फ़ॉर्मेट',
      subtitles: 'उपशीर्षक',
      sponsorblock: 'SponsorBlock',
      output: 'आउटपुट',
      folder: 'सेव करें',
      confirm: 'पुष्टि करें'
    },
    playlist: {
      heading: 'Playlist आइटम',
      itemCount_one: '{{count}} वीडियो',
      itemCount_other: '{{count}} वीडियो',
      itemCountAudio_one: '{{count}} ट्रैक',
      itemCountAudio_other: '{{count}} ट्रैक',
      selectAll: 'सभी चुनें',
      selectNone: 'कोई नहीं चुनें',
      rangeFrom: 'से',
      rangeTo: 'तक',
      rangeApply: 'रेंज लागू करें',
      selectedCount_one: '{{count}} चुना गया',
      selectedCount_other: '{{count}} चुने गए',
      noSelection: 'जारी रखने के लिए कम से कम एक वीडियो चुनें',
      loadingItems: 'Playlist लाया जा रहा है…',
      thumbnailAlt: 'वीडियो थंबनेल',
      durationUnknown: 'live',
      syncChange: 'फ़ोल्डर बदलें…',
      syncApply: 'सिंक लागू करें',
      syncScanning: 'फ़ोल्डर जाँचा जा रहा है…',
      syncFoundTitle: 'पहले से फ़ोल्डर में',
      syncFoundDesc: 'इन वीडियो में से {{n}} पहले से {{dir}} में हैं। केवल नए वीडियो डाउनलोड करने के लिए सिंक करें?',
      syncNoneTitle: 'अभी तक कुछ डाउनलोड नहीं हुआ',
      syncNoneDesc: 'इस प्लेलिस्ट के कोई वीडियो {{dir}} में नहीं मिले।',
      alreadyDownloaded: 'पहले से डाउनलोड किया गया'
    },
    playlistPresets: {
      heading: 'बैच के लिए गुणवत्ता चुनें',
      subhead: 'हर वीडियो चुनी गई श्रेणी के अनुसार स्वतंत्र रूप से रेज़ॉल्व होता है — मिश्रित Playlist बिना किसी परेशानी के काम करती है।',
      itemCount_one: '{{count}} आइटम',
      itemCount_other: '{{count}} आइटम'
    },
    mixedPrompt: {
      title: 'इस लिंक में एक Playlist है',
      body: 'सिर्फ़ वही वीडियो चाहिए जिस पर क्लिक किया था, या Playlist में से चुनना है? आगे आप विशेष वीडियो या रेंज चुन सकते हैं।',
      singleVideo: 'बस यही एक',
      pickFromPlaylist: 'Playlist में से चुनें'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'फ़ॉर्मेट लाएँ',
      features: {
        heading: 'Arroxy क्या डाउनलोड कर सकता है',
        youtube: {
          heading: 'YouTube',
          video: 'वीडियो',
          channel: 'चैनल',
          playlist: 'Playlist',
          short: 'Shorts',
          music: 'संगीत',
          podcast: 'Podcast'
        },
        anySite: {
          heading: '2000+ साइटें',
          video: 'वीडियो',
          videoPlaylist: 'वीडियो playlist',
          musicPlaylist: 'संगीत playlist'
        },
        always: {
          heading: 'हमेशा उपलब्ध',
          audioOnly: 'केवल ऑडियो',
          subtitles: 'उपशीर्षक'
        }
      },
      mascotIdle: 'मुझे YouTube का लिंक भेजो (वीडियो या Short) — फिर "फ़ॉर्मेट लाएँ" दबाओ और मैं काम पर लग जाऊँगा ✨',
      mascotBusy: 'पीछे चुपचाप डाउनलोड कर रहा हूँ… मैं एक साथ कई काम कर सकता हूँ 😎',
      advanced: 'उन्नत',
      clearAria: 'URL हटाएँ',
      clipboard: {
        toggle: 'क्लिपबोर्ड देखें',
        toggleDescription: 'YouTube लिंक कॉपी करने पर URL फ़ील्ड स्वतः भर जाता है।',
        dialog: {
          title: 'YouTube URL मिला',
          body: 'क्या आप अपने क्लिपबोर्ड का यह लिंक उपयोग करना चाहते हैं?',
          useButton: 'URL उपयोग करें',
          disableButton: 'बंद करें',
          cancelButton: 'रद्द करें',
          disableNote: 'आप बाद में उन्नत सेटिंग्स में क्लिपबोर्ड देखना फिर से चालू कर सकते हैं।'
        }
      },
      cookies: {
        sourceLabel: 'कुकी स्रोत',
        sourceOff: 'बंद',
        sourceFile: 'फ़ाइल',
        sourceBrowser: 'ब्राउज़र',
        toggleDescription: 'आयु-प्रतिबंधित, सदस्य-केवल और खाता-निजी वीडियो में मदद करता है।',
        risk: 'जोखिम: cookies.txt में उस ब्राउज़र के सभी लॉग-इन सत्र होते हैं — इसे निजी रखें।',
        fileLabel: 'कुकी फ़ाइल',
        choose: 'चुनें…',
        clear: 'साफ़',
        placeholder: 'कोई फ़ाइल चयनित नहीं',
        helpLink: 'कुकी कैसे एक्सपोर्ट करें?',
        enabledButNoFile: 'कुकी का उपयोग करने के लिए फ़ाइल चुनें',
        browserLabel: 'ब्राउज़र',
        browserPlaceholder: 'ब्राउज़र चुनें…',
        browserHelp: 'ब्राउज़र से सीधे कुकी पढ़ता है। Chromium-आधारित ब्राउज़र के लिए ब्राउज़र बंद होना चाहिए।',
        enabledButNoBrowser: 'कुकी उपयोग करने के लिए ब्राउज़र चुनें',
        banWarning: 'चेतावनी: yt-dlp जिन कुकी का उपयोग करता है, उनसे जुड़े अकाउंट को YouTube फ़्लैग — और कभी-कभी बैन — कर सकता है। हो सके तो डिस्पोज़ेबल अकाउंट का उपयोग करें।',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt स्थानीय रूप से प्राप्त करें (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'प्रॉक्सी के माध्यम से ट्रैफ़िक रूट करें — भू-प्रतिबंधित सामग्री के लिए उपयोगी।',
        placeholder: 'http://host:port',
        clear: 'साफ़ करें'
      },
      singleFilenameId: {
        toggle: 'एकल फ़ाइलनामों में वीडियो ID जोड़ें',
        toggleDescription: 'शीर्षक बदलने या टकराने पर एकबारगी डाउनलोड को अलग रखता है।'
      },
      networkPacing: {
        heading: 'सौम्य डाउनलोड',
        description: 'हर डाउनलोड के दौरान छोटे-छोटे इंतज़ार जोड़ें ताकि Arroxy साइट पर ज़्यादा दबाव न डाले। मान सेकंड में हैं जब तक अन्यथा न बताया जाए।',
        presetLabel: 'Arroxy को कितना सावधान रहना चाहिए?',
        tooltip: 'ये इंतज़ार हर डाउनलोड के अंदर होते हैं। Arroxy फिर भी सामान्य क्यू डाउनलोड एक-एक करके रखता है।',
        summary: 'इंतज़ार: {{requests}} जाँचों के बीच, {{downloads}} मीडिया शुरू होने से पहले, {{subtitles}} सबटाइटल फ़ाइलों से पहले। कनेक्शन: {{fragments}}.',
        presets: {
          off: 'बंद',
          balanced: 'संतुलित',
          careful: 'सावधान',
          custom: 'कस्टम'
        },
        tooltips: {
          off: 'केवल वे छोटे बेसलाइन पॉज़ उपयोग करता है जो Arroxy मीडिया और सबटाइटल के लिए रखता है।',
          balanced: 'डिफ़ॉल्ट। छोटे पॉज़ जोड़ता है और एक डाउनलोड कनेक्शन उपयोग करता है।',
          careful: 'बड़ी playlist या ऐसे नेटवर्क के लिए लंबे पॉज़ जोड़ता है जो अक्सर सीमाओं तक पहुँचते हैं।',
          custom: 'डाउनलोड के उन्नत नियंत्रण खुद ट्यून करें।'
        },
        fields: {
          sleepRequests: 'मेटाडेटा जाँचों के बीच इंतज़ार',
          sleepInterval: 'मीडिया शुरू होने से पहले पॉज़: न्यूनतम',
          maxSleepInterval: 'मीडिया शुरू होने से पहले पॉज़: अधिकतम',
          sleepSubtitles: 'सबटाइटल फ़ाइलों से पहले इंतज़ार',
          concurrentFragments: 'डाउनलोड कनेक्शन'
        },
        units: {
          seconds: 'से.',
          threads: 'थ्रेड'
        }
      },
      closeToTray: {
        toggle: 'बंद करने पर ट्रे में छिपाएं',
        toggleDescription: 'विंडो बंद करने के बाद पृष्ठभूमि में डाउनलोड जारी रखें।'
      },
      analytics: {
        toggle: 'अनाम उपयोग आँकड़े भेजें',
        toggleDescription: 'केवल ऐप लॉन्च गिनता है। कोई URL, फ़ाइलनाम या व्यक्तिगत डेटा नहीं।'
      }
    },
    subtitles: {
      autoBadge: 'स्वतः',
      noLanguages: 'इस वीडियो के लिए कोई उपशीर्षक उपलब्ध नहीं है',
      skip: 'छोड़ें',
      skipSubs: 'इस वीडियो के लिए छोड़ें',
      mascot: 'शून्य, एक या कई — पूरी तरह आप पर निर्भर है ✨',
      searchPlaceholder: 'भाषाएँ खोजें…',
      noMatches: 'कोई भाषा नहीं मिली',
      clearAll: 'सभी हटाएँ',
      noSelected: 'कोई उपशीर्षक नहीं चुना',
      selectedNote_one: '{{count}} उपशीर्षक डाउनलोड किया जाएगा',
      selectedNote_other: '{{count}} उपशीर्षक डाउनलोड किए जाएंगे',
      sectionManual: 'मैनुअल',
      sectionAuto: 'स्वतः-जनित',
      saveMode: {
        heading: 'इस रूप में सहेजें',
        sidecar: 'वीडियो के साथ',
        embed: 'वीडियो में एम्बेड करें',
        subfolder: 'subtitles/ सबफ़ोल्डर'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'एम्बेड मोड आउटपुट को .mkv के रूप में सहेजता है ताकि उपशीर्षक ट्रैक विश्वसनीय रूप से एम्बेड हों।',
      autoAssNote: 'स्वतः-जनित उपशीर्षक ASS के बजाय SRT के रूप में सहेजे जाएंगे — उन्हें हमेशा YouTube के रोलिंग-क्यू डुप्लिकेशन से साफ़ किया जाता है, जिसे हमारा ASS कन्वर्टर अभी तक दोहरा नहीं सकता।'
    },
    sponsorblock: {
      modeHeading: 'स्पॉन्सर फ़िल्टरिंग',
      mode: {
        off: 'बंद',
        mark: 'अध्याय के रूप में चिह्नित करें',
        remove: 'खंड हटाएं'
      },
      modeHint: {
        off: 'कोई SponsorBlock नहीं — वीडियो जैसे अपलोड हुआ वैसे चलेगा।',
        mark: 'स्पॉन्सर खंडों को अध्याय के रूप में चिह्नित करता है (गैर-विनाशकारी)।',
        remove: 'FFmpeg का उपयोग करके स्पॉन्सर खंड हटाता है।'
      },
      categoriesHeading: 'श्रेणियाँ',
      cat: {
        sponsor: 'स्पॉन्सर',
        intro: 'परिचय',
        outro: 'समापन',
        selfpromo: 'स्वयं-प्रचार',
        music_offtopic: 'संगीत (विषयांतर)',
        preview: 'पूर्वावलोकन',
        filler: 'भराव'
      }
    },
    formats: {
      quickPresets: 'त्वरित प्रीसेट',
      video: 'वीडियो',
      audio: 'ऑडियो',
      noAudio: 'ऑडियो नहीं',
      videoOnly: 'सिर्फ़ वीडियो',
      audioOnly: 'सिर्फ़ ऑडियो',
      audioOnlyOption: 'सिर्फ़ ऑडियो (वीडियो नहीं)',
      mascot: 'सबसे अच्छा + सबसे अच्छा = बेहतरीन क्वालिटी। मैं तो यही चुनूँगा!',
      sniffing: 'आपके लिए बेहतरीन फ़ॉर्मेट ढूँढ रहा हूँ…',
      loadingHint: 'कृपया प्रतीक्षा करें जब तक जाँच पूरी न हो जाए — playlist और खोज में थोड़ा अधिक समय लग सकता है।',
      loadingAria: 'फ़ॉर्मेट लोड हो रहे हैं',
      sizeUnknown: 'साइज़ अज्ञात',
      skipToConfirm: 'सीधे पुष्टि पर जाएँ',
      skipToConfirmTooltip: 'सभी शेष चरणों के लिए आपकी सहेजी गई प्राथमिकताओं का उपयोग करता है। कोई सेटिंग बदलने के लिए, इसके बजाय चरण दर चरण आगे बढ़ें — आपकी पसंद अगली बार के लिए सहेजी जाएगी।',
      total: 'कुल',
      keepAudio: 'जैसा है वैसा रखें',
      keepAudioMeta: 'बिल्ट-इन ऑडियो',
      convert: {
        label: 'कनवर्ट करें',
        uncompressed: 'कनवर्ट करें · असंपीड़ित',
        bitrate: 'बिटरेट',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'ऑडियो कनवर्शन के लिए केवल-ऑडियो मोड ज़रूरी है (वीडियो चयन हटाएं)।',
        requiresLossy: 'एक नेटिव स्ट्रीम चुनी गई है — बिटरेट केवल mp3, m4a, या opus में कनवर्ट करते समय लागू होता है।'
      },
      botWall: {
        heading: 'YouTube ने इस जाँच को सीमित किया',
        bodyUnconfigured: 'फ़ॉर्मेट सूची अधूरी हो सकती है। उन्नत सेटिंग्स में कुकी सेट करें, या नेटवर्क बदलकर पुनः प्रयास करें।',
        bodyDisabled: 'कुकी कॉन्फ़िगर हैं लेकिन बंद हैं। पूरी सूची पाने के लिए उन्हें चालू करके पुनः प्रयास करें, या नेटवर्क बदलकर पुनः प्रयास करें।',
        bodyEnabled: 'कुकी के साथ भी YouTube ने इस जाँच को सीमित किया। बाद में पुनः प्रयास करें या नेटवर्क बदलें।',
        retryCta: 'पुनः प्रयास',
        enableRetryCta: 'कुकी चालू करके पुनः प्रयास करें'
      },
      cookiesError: {
        heading: 'कुकी इसकी वजह हो सकती है',
        currentModeLabel: 'कुकी स्रोत',
        currentModeFile: 'फ़ाइल',
        currentModeBrowser: 'ब्राउज़र',
        explanationFile: 'आपकी कुकी फ़ाइल खाली, एक्सपायर्ड या गलत फ़ॉर्मेट में हो सकती है (yt-dlp को Netscape cookies.txt चाहिए)। कुकी फिर से एक्सपोर्ट करें, कोई अलग फ़ाइल चुनें, ब्राउज़र मोड पर जाएँ, या कुकी बंद कर दें।',
        explanationBrowser: 'कुकी सीधे ब्राउज़र से पढ़ी जाती हैं। अगर ब्राउज़र अभी चल रहा है, तो उसका कुकी डेटाबेस लॉक हो सकता है (Chromium परिवार)। ब्राउज़र में YouTube पर लॉग इन भी होना ज़रूरी है। ब्राउज़र बंद करके देखें, कोई दूसरा ब्राउज़र आज़माएँ, फ़ाइल मोड पर जाएँ, या कुकी बंद कर दें।',
        openSettingsCta: 'कुकी सेटिंग्स खोलें',
        needsCookies: {
          heading: 'इस साइट के लिए साइन-इन ज़रूरी है',
          body: 'yt-dlp प्रमाणीकरण के बिना इस वीडियो तक नहीं पहुँच सका। उन्नत सेटिंग्स में कुकी कॉन्फ़िगर करें — किसी ऐसे ब्राउज़र पर पॉइंट करें जिसमें आप पहले से साइन इन हैं, या cookies.txt फ़ाइल इम्पोर्ट करें।'
        },
        dpapi: {
          heading: 'Chrome कुकी Windows एन्क्रिप्शन से ब्लॉक हैं',
          explanation: 'Chrome 127 और उसके बाद के वर्शन कुकी को इस तरह एन्क्रिप्ट करते हैं कि Windows पर दूसरे ऐप उन्हें नहीं पढ़ सकते। नीचे दिए गए किसी एक समाधान को आज़माएँ।',
          fixFirefoxLabel: 'Firefox पर स्विच करें',
          fixFirefoxBody: 'Firefox, App-Bound Encryption का उपयोग नहीं करता। कुकी सेटिंग्स खोलें और ब्राउज़र सूची से Firefox चुनें।',
          fixFileLabel: 'cookies.txt एक्सपोर्ट करें',
          fixFileBody: 'Chrome से किसी ब्राउज़र एक्सटेंशन के ज़रिए कुकी एक्सपोर्ट करें, फिर इस ऐप को File मोड पर स्विच करें और एक्सपोर्ट की गई फ़ाइल चुनें।',
          fixUnsafeLabel: 'App-Bound Encryption बंद करके Chrome लॉन्च करें',
          fixUnsafeBody: 'Chrome के लॉन्च शॉर्टकट में --disable-features=LockProfileCookieDatabase जोड़ें। चेतावनी: इससे पहले से एन्क्रिप्टेड कुकी अमान्य हो जाएंगी, इसलिए आप हर साइट से साइन आउट हो जाएंगे और फिर से लॉग इन करना होगा।',
          docsLinkLabel: 'yt-dlp दस्तावेज़ (समस्या #10927)'
        }
      }
    },
    folder: {
      heading: 'यहाँ सेव करें',
      downloads: 'डाउनलोड',
      videos: 'मूवीज़',
      desktop: 'डेस्कटॉप',
      music: 'संगीत',
      documents: 'दस्तावेज़',
      pictures: 'चित्र',
      home: 'होम फ़ोल्डर',
      custom: 'कस्टम…',
      subfolder: {
        toggle: 'सबफ़ोल्डर में सहेजें',
        placeholder: 'जैसे lo-fi rips',
        invalid: 'फ़ोल्डर नाम में अमान्य अक्षर हैं'
      }
    },
    output: {
      embedChapters: {
        label: 'चैप्टर एम्बेड करें',
        description: 'किसी भी आधुनिक प्लेयर में नेविगेट करने योग्य चैप्टर मार्कर।'
      },
      embedMetadata: {
        label: 'मेटाडेटा एम्बेड करें',
        description: 'शीर्षक, कलाकार, विवरण और अपलोड तिथि फ़ाइल में लिखे जाते हैं।'
      },
      embedThumbnail: {
        label: 'थंबनेल एम्बेड करें',
        description: 'फ़ाइल के अंदर कवर आर्ट। WebM वीडियो को MKV में रीमक्स किया जाएगा; सबटाइटल एम्बेड होने पर छोड़ा जाता है।'
      },
      writeDescription: {
        label: 'विवरण सहेजें',
        description: 'वीडियो का विवरण डाउनलोड के पास .description टेक्स्ट फ़ाइल के रूप में सहेजता है।'
      },
      writeThumbnail: {
        label: 'थंबनेल सहेजें',
        description: 'थंबनेल को डाउनलोड के पास .jpg छवि फ़ाइल के रूप में सहेजता है।'
      }
    },
    confirm: {
      readyHeadline: 'डाउनलोड के लिए तैयार!',
      landIn: 'फ़ाइल यहाँ सेव होगी',
      labelVideo: 'वीडियो',
      labelAudio: 'ऑडियो',
      labelSubtitles: 'उपशीर्षक',
      subtitlesNone: '—',
      labelSaveTo: 'स्थान',
      labelSize: 'साइज़',
      sizeUnknown: 'अज्ञात',
      nothingToDownload: 'केवल उपशीर्षक प्रीसेट सक्रिय है लेकिन कोई भाषा नहीं चुनी गई — कुछ भी डाउनलोड नहीं होगा।',
      thumbnailEmbedNotSupported: 'Thumbnail embed छोड़ दिया गया — आउटपुट container इसे सपोर्ट नहीं करता।',
      subtitleEmbedAudioOnly: 'उपशीर्षक embed को sidecar में बदल दिया गया — ऑडियो ट्रैक embedded उपशीर्षक स्ट्रीम को सपोर्ट नहीं करते।',
      audioOnly: 'सिर्फ़ ऑडियो',
      addToQueue: '+ क़तार',
      addToQueueTooltip: 'दूसरी डाउनलोड पूरी होने पर शुरू होगा — पूरी बैंडविड्थ मिलेगी',
      pullIt: 'खींच लो! ↓',
      pullItTooltip: 'तुरंत शुरू — बाक़ी सक्रिय डाउनलोड के साथ-साथ चलेगा',
      labelPlaylist: 'Playlist',
      labelPreset: 'प्रीसेट',
      labelItems: 'आइटम',
      itemsValue_one: '{{total}} में से {{count}} वीडियो',
      itemsValue_other: '{{total}} में से {{count}} वीडियो',
      itemsValueAudio_one: '{{total}} में से {{count}} ट्रैक',
      itemsValueAudio_other: '{{total}} में से {{count}} ट्रैक'
    }
  },
  videoCard: {
    titlePlaceholder: 'लोड हो रहा है…'
  },
  queue: {
    header: 'डाउनलोड क़तार',
    toggleTitle: 'डाउनलोड क़तार दिखाएँ/छिपाएँ',
    empty: 'क़तार में डाली गई डाउनलोड यहाँ दिखेंगी',
    noDownloads: 'अभी कोई डाउनलोड नहीं।',
    activeCount: '{{count}} डाउनलोड हो रहे · {{percent}}%',
    clear: 'साफ़ करें',
    clearTitle: 'पूरी हुई डाउनलोड हटाएँ',
    pauseAll: 'सब रोकें',
    pauseAllTitle: 'सभी सक्रिय डाउनलोड रोकें',
    cancelAll: 'सब रद्द करें',
    cancelAllTitle: 'सभी सक्रिय और प्रतीक्षारत डाउनलोड रद्द करें',
    tip: 'आपकी डाउनलोड नीचे क़तार में है — कभी भी खोलकर प्रगति देख सकते हैं।',
    item: {
      doneAt: '{{time}} पर पूरा',
      paused: 'रुकी हुई',
      defaultError: 'डाउनलोड विफल',
      openUrl: 'URL खोलें',
      pause: 'रोकें',
      hold: 'होल्ड',
      resume: 'फिर से शुरू',
      cancel: 'रद्द करें',
      remove: 'हटाएँ'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'उपलब्ध है',
    youHave: '— आपके पास है {{currentVersion}}',
    install: 'इंस्टॉल करके पुनः शुरू करें',
    downloading: 'डाउनलोड हो रहा है…',
    download: 'डाउनलोड ↗',
    dismiss: 'अपडेट सूचना बंद करें',
    copy: 'कमांड क्लिपबोर्ड पर कॉपी करें',
    copied: 'कमांड क्लिपबोर्ड पर कॉपी हो गई',
    installFailed: 'अपडेट विफल',
    retry: 'पुनः प्रयास'
  },
  status: {
    preparingBinaries: 'बाइनरी तैयार हो रही हैं…',
    mintingToken: 'YouTube टोकन बन रहा है…',
    remintingToken: 'टोकन फिर से बन रहा है…',
    startingYtdlp: 'yt-dlp प्रक्रिया शुरू हो रही है…',
    downloadingMedia: 'वीडियो और ऑडियो डाउनलोड हो रहा है…',
    mergingFormats: 'ऑडियो और वीडियो मर्ज हो रहा है…',
    extractingAudio: 'ऑडियो कनवर्ट हो रहा है…',
    convertingVideo: 'वीडियो कनवर्ट हो रहा है…',
    embeddingMetadata: 'मेटाडेटा एम्बेड हो रहा है…',
    movingFiles: 'फ़ाइलें ले जाई जा रही हैं…',
    fetchingSubtitles: 'सबटाइटल लाए जा रहे हैं…',
    sleepingBetweenRequests: 'सीमाओं से बचने के लिए {{seconds}}s प्रतीक्षा कर रहे हैं…',
    subtitlesFailed: 'वीडियो सहेजा गया — कुछ सबटाइटल डाउनलोड नहीं हो सके',
    cancelled: 'डाउनलोड रद्द कर दिया',
    complete: 'डाउनलोड पूरा',
    usedExtractorFallback: 'सरलीकृत एक्सट्रैक्टर के साथ डाउनलोड हुआ — अधिक भरोसेमंद डाउनलोड के लिए cookies.txt सेट करें',
    ytdlpProcessError: 'yt-dlp प्रक्रिया त्रुटि: {{error}}',
    ytdlpExitCode: 'yt-dlp कोड {{code}} के साथ बंद हो गया',
    downloadingBinary: '{{name}} बाइनरी डाउनलोड हो रही है…',
    unknownStartupFailure: 'डाउनलोड शुरू करने में अज्ञात त्रुटि',
    diskSpaceInsufficient: 'पर्याप्त डिस्क स्थान नहीं है — {{required}} चाहिए, केवल {{free}} उपलब्ध है',
    fetchingSponsorBlock: 'SponsorBlock से संपर्क हो रहा है…',
    retryingSponsorBlock: 'SponsorBlock अनुपलब्ध है, पुनः प्रयास ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'Bot protection सक्रिय हो गई। आप जिस IP का उपयोग कर रहे हैं, वह संभवतः फ़्लैग किया गया है (डेटासेंटर रेंज या व्यस्त VPN एग्ज़िट)। अपना IP बदलें या कोई अलग VPN एंडपॉइंट चुनें और पुनः प्रयास करें। अगर यह बार-बार विफल हो, तो यह YouTube की एक अस्थायी समस्या हो सकती है — Arroxy लॉन्च होने पर yt-dlp को स्वचालित रूप से अपडेट करता है, इसलिए upstream द्वारा फ़िक्स जारी होते ही यह अपने आप ठीक हो जाएगा।',
      ipBlock: 'आपका IP YouTube ने ब्लॉक कर दिया लगता है। बाद में कोशिश करें या VPN का उपयोग करें।',
      rateLimit: 'YouTube अनुरोधों को सीमित कर रहा है। एक मिनट रुककर फिर से कोशिश करें।',
      ageRestricted: 'इस वीडियो पर आयु प्रतिबंध है — साइन-इन खाते के बिना डाउनलोड नहीं हो सकता।',
      unavailable: 'यह वीडियो उपलब्ध नहीं — हो सकता है यह निजी, हटाया गया या क्षेत्र-प्रतिबंधित हो।',
      geoBlocked: 'यह वीडियो आपके क्षेत्र में उपलब्ध नहीं है।',
      outOfDiskSpace: 'डिस्क में पर्याप्त जगह नहीं है। जगह खाली करें और पुनः प्रयास करें।',
      unsupportedUrl: 'यह कोई वीडियो URL नहीं लगता। कोई YouTube वीडियो, Short, या playlist लिंक पेस्ट करें।',
      chunkTransferFailure: 'सर्वर बार-बार डाउनलोड बीच में काट रहा था और yt-dlp बार-बार कोशिश के बाद हार मान गया। यह आमतौर पर सबसे बड़े वीडियो फॉर्मेट (4K HDR / हाई-बिटरेट VP9) पर होता है। फिर से कोशिश करें, नेटवर्क/VPN बदलें, या कम रिज़ॉल्यूशन का फॉर्मेट चुनें।',
      postprocessFailure: 'yt-dlp ने डाउनलोड पूरा कर लिया लेकिन post-processing (merge / mux / convert) विफल रहा। अक्सर यह एक अस्थायी ffmpeg समस्या होती है — फिर से कोशिश करें, और अगर समस्या बनी रहे तो कोई दूसरा फॉर्मेट कॉम्बिनेशन आज़माएँ।',
      parse: 'साइट से मिले रिस्पॉन्स को पार्स नहीं किया जा सका। yt-dlp का extractor पुराना पड़ गया हो सकता है। Arroxy लॉन्च होने पर yt-dlp को स्वचालित रूप से अपडेट करता है — कुछ मिनटों में फिक्स आने पर पुनः प्रयास करें।',
      network: 'नेटवर्क त्रुटि। अपना कनेक्शन जाँचें और पुनः प्रयास करें।',
      drmProtected: 'यह वीडियो DRM-सुरक्षित है। yt-dlp DRM हटा नहीं सकता, इसलिए फ़ाइल डाउनलोड नहीं हो सकती।',
      loginRequired: 'इस वीडियो के लिए साइन-इन खाता ज़रूरी है। एक cookies.txt सेट करें (सेटिंग्स → Cookies) और फिर से प्रयास करें।',
      unknown: 'डाउनलोड विफल। नीचे raw output देखें।'
    }
  },
  presets: {
    'best-quality': {
      label: 'बेहतरीन क्वालिटी',
      desc: 'अधिकतम रिज़ॉल्यूशन + बेहतरीन ऑडियो'
    },
    balanced: {
      label: 'संतुलित',
      desc: '720p तक + अच्छा ऑडियो'
    },
    'audio-only': {
      label: 'सिर्फ़ ऑडियो',
      desc: 'वीडियो नहीं, बेहतरीन ऑडियो'
    },
    'small-file': {
      label: 'छोटी फ़ाइल',
      desc: 'न्यूनतम रिज़ॉल्यूशन + कम ऑडियो'
    },
    'subtitle-only': {
      label: 'केवल उपशीर्षक',
      desc: 'न वीडियो न ऑडियो, केवल उपशीर्षक'
    }
  },
  playlistPresets: {
    'video-best': { label: 'बेहतरीन गुणवत्ता', desc: 'प्रति आइटम सर्वोच्च वीडियो + ऑडियो' },
    'video-2160p': { label: '4K तक', desc: '2160p तक सीमित, प्रति आइटम कम पर फ़ॉलबैक' },
    'video-1440p': { label: '1440p तक', desc: '2K तक सीमित, प्रति आइटम कम पर फ़ॉलबैक' },
    'video-1080p': { label: '1080p तक', desc: 'प्रति आइटम सीमित, कम पर फ़ॉलबैक' },
    'video-720p': { label: '720p तक', desc: 'छोटी फ़ाइलें, व्यापक संगतता' },
    'video-480p': { label: '480p तक', desc: 'कम बैंडविड्थ' },
    'video-360p': { label: '360p तक', desc: 'सबसे छोटा वीडियो' },
    'audio-best': { label: 'Audio (बेहतरीन)', desc: 'नेटिव सर्वश्रेष्ठ ऑडियो, पुनः एन्कोड नहीं' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'MP3 192 kbps में कनवर्ट करें' }
  },
  formatLabel: {
    audioFallback: 'ऑडियो',
    audioOnlyDot: 'सिर्फ़ ऑडियो · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'निष्क्रिय',
      statusActive_one: '1 डाउनलोड हो रहा है · {{percent}}%',
      statusActive_other: '{{count}} डाउनलोड हो रहे हैं · {{percent}}%',
      open: 'Arroxy खोलें',
      quit: 'Arroxy बंद करें'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} डाउनलोड चल रही है',
      message_other: '{{count}} डाउनलोड चल रही हैं',
      detail: 'बंद करने पर सभी सक्रिय डाउनलोड रद्द हो जाएँगी।',
      confirm: 'डाउनलोड रद्द करके बंद करें',
      keep: 'डाउनलोड जारी रखें'
    },
    closeToTray: {
      message: 'बंद करने पर Arroxy को सिस्टम ट्रे में छिपाएं?',
      detail: 'Arroxy चलता रहेगा और सक्रिय डाउनलोड पूरे करेगा। उन्नत सेटिंग में बदलें।',
      hide: 'ट्रे में छिपाएं',
      quit: 'बाहर निकलें',
      remember: 'दोबारा न पूछें'
    },
    rendererCrashed: {
      message: 'Arroxy में एक समस्या आई',
      detail: 'रेंडरर प्रक्रिया क्रैश हो गई ({{reason}})। पुनः प्रयास करने के लिए रीलोड करें।',
      reload: 'रीलोड करें',
      quit: 'बाहर निकलें'
    }
  },
  share: {
    title: 'Arroxy शेयर करें',
    description: 'Arroxy मुफ़्त और ओपन-सोर्स है। शेयर करने से और लोग इसे खोज सकते हैं।',
    copyLink: 'लिंक कॉपी करें',
    copied: 'कॉपी किया!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy साझा करें',
    footerLabel: 'साझा करें',
    shareAction: 'Arroxy साझा करें',
    inlineCard: {
      body: 'Arroxy पसंद आ रहा है? किसी ऐसे व्यक्ति के साथ शेयर करें जिसे यह उपयोगी लग सकता है।',
      dismiss: 'शेयर सुझाव हटाएँ'
    },
    highValueBanner: {
      body: 'Arroxy पसंद आ रहा है? दूसरों को भी इसे खोजने में मदद करें।',
      dismiss: 'शेयर सुझाव हटाएँ'
    }
  }
} as const;

export default hi;
