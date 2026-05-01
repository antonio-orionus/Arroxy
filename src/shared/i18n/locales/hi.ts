const hi = {
  common: {
    back: 'वापस',
    continue: 'जारी रखें',
    retry: 'फिर से कोशिश करें',
    startOver: 'फिर से शुरू करें',
    loading: 'लोड हो रहा है…'
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
  titleBar: {
    close: 'बंद करें',
    minimize: 'छोटा करें',
    maximize: 'बड़ा करें',
    restore: 'पुनर्स्थापित करें'
  },
  splash: {
    greeting: 'अरे, फिर से स्वागत है!',
    warmup: 'Arroxy तैयार हो रहा है…',
    warning: 'सेटअप अधूरा है — कुछ सुविधाएँ काम नहीं कर सकतीं'
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
      formats: 'फ़ॉर्मेट',
      subtitles: 'उपशीर्षक',
      folder: 'सेव करें',
      confirm: 'पुष्टि करें'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com और youtu.be लिंक समर्थित',
      fetchFormats: 'फ़ॉर्मेट लाएँ',
      mascotIdle: 'मुझे YouTube का लिंक भेजो (वीडियो या Short) — फिर "फ़ॉर्मेट लाएँ" दबाओ और मैं काम पर लग जाऊँगा ✨',
      mascotBusy: 'पीछे चुपचाप डाउनलोड कर रहा हूँ… मैं एक साथ कई काम कर सकता हूँ 😎',
      advanced: 'उन्नत',
      cookies: {
        toggle: 'कुकी फ़ाइल का उपयोग करें',
        toggleDescription: 'आयु-प्रतिबंधित, सदस्य-केवल और खाता-निजी वीडियो में मदद करता है।',
        risk: 'जोखिम: cookies.txt में उस ब्राउज़र के सभी लॉग-इन सत्र होते हैं — इसे निजी रखें।',
        fileLabel: 'कुकी फ़ाइल',
        choose: 'चुनें…',
        clear: 'साफ़',
        placeholder: 'कोई फ़ाइल चयनित नहीं',
        helpLink: 'कुकी कैसे एक्सपोर्ट करें?',
        enabledButNoFile: 'कुकी का उपयोग करने के लिए फ़ाइल चुनें',
        banWarning: 'चेतावनी: yt-dlp जिन कुकी का उपयोग करता है, उनसे जुड़े अकाउंट को YouTube फ़्लैग — और कभी-कभी बैन — कर सकता है। हो सके तो डिस्पोज़ेबल अकाउंट का उपयोग करें।',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      }
    },
    subtitles: {
      heading: 'उपशीर्षक',
      autoBadge: 'स्वतः',
      hint: 'फ़ाइलें वीडियो के पास ही सहेजी जाएंगी',
      noLanguages: 'इस वीडियो के लिए कोई उपशीर्षक उपलब्ध नहीं है',
      skip: 'छोड़ें',
      skipSubs: 'इस वीडियो के लिए छोड़ें',
      selectAll: 'सभी चुनें',
      deselectAll: 'सभी हटाएं',
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
      loadingHint: 'आमतौर पर एक सेकंड लगता है',
      loadingAria: 'फ़ॉर्मेट लोड हो रहे हैं',
      sizeUnknown: 'साइज़ अज्ञात',
      total: 'कुल'
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
      audioOnly: 'सिर्फ़ ऑडियो',
      addToQueue: '+ क़तार',
      addToQueueTooltip: 'दूसरी डाउनलोड पूरी होने पर शुरू होगा — पूरी बैंडविड्थ मिलेगी',
      pullIt: 'खींच लो! ↓',
      pullItTooltip: 'तुरंत शुरू — बाक़ी सक्रिय डाउनलोड के साथ-साथ चलेगा'
    },
    error: {
      icon: 'त्रुटि'
    }
  },
  videoCard: {
    titlePlaceholder: 'लोड हो रहा है…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'डाउनलोड क़तार',
    toggleTitle: 'डाउनलोड क़तार दिखाएँ/छिपाएँ',
    empty: 'क़तार में डाली गई डाउनलोड यहाँ दिखेंगी',
    noDownloads: 'अभी कोई डाउनलोड नहीं।',
    activeCount: '{{count}} डाउनलोड हो रहे · {{percent}}%',
    clear: 'साफ़ करें',
    clearTitle: 'पूरी हुई डाउनलोड हटाएँ',
    tip: 'आपकी डाउनलोड नीचे क़तार में है — कभी भी खोलकर प्रगति देख सकते हैं।',
    item: {
      doneAt: '{{time}} पर पूरा',
      paused: 'रुकी हुई',
      defaultError: 'डाउनलोड विफल',
      openUrl: 'URL खोलें',
      pause: 'रोकें',
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
    copied: 'कमांड क्लिपबोर्ड पर कॉपी हो गई'
  },
  status: {
    preparingBinaries: 'बाइनरी तैयार हो रही हैं…',
    mintingToken: 'YouTube टोकन बन रहा है…',
    remintingToken: 'टोकन फिर से बन रहा है…',
    startingYtdlp: 'yt-dlp प्रक्रिया शुरू हो रही है…',
    downloadingMedia: 'वीडियो और ऑडियो डाउनलोड हो रहा है…',
    mergingFormats: 'ऑडियो और वीडियो मर्ज हो रहा है…',
    fetchingSubtitles: 'सबटाइटल लाए जा रहे हैं…',
    sleepingBetweenRequests: 'सीमाओं से बचने के लिए {{seconds}}s प्रतीक्षा कर रहे हैं…',
    subtitlesFailed: 'वीडियो सहेजा गया — कुछ सबटाइटल डाउनलोड नहीं हो सके',
    cancelled: 'डाउनलोड रद्द कर दिया',
    complete: 'डाउनलोड पूरा',
    usedExtractorFallback: 'सरलीकृत एक्सट्रैक्टर के साथ डाउनलोड हुआ — अधिक भरोसेमंद डाउनलोड के लिए cookies.txt सेट करें',
    ytdlpProcessError: 'yt-dlp प्रक्रिया त्रुटि: {{error}}',
    ytdlpExitCode: 'yt-dlp कोड {{code}} के साथ बंद हो गया',
    downloadingBinary: '{{name}} बाइनरी डाउनलोड हो रही है…',
    unknownStartupFailure: 'डाउनलोड शुरू करने में अज्ञात त्रुटि'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube ने इस अनुरोध को बॉट के रूप में चिह्नित किया। थोड़ी देर बाद कोशिश करें।',
      ipBlock: 'आपका IP YouTube ने ब्लॉक कर दिया लगता है। बाद में कोशिश करें या VPN का उपयोग करें।',
      rateLimit: 'YouTube अनुरोधों को सीमित कर रहा है। एक मिनट रुककर फिर से कोशिश करें।',
      ageRestricted: 'इस वीडियो पर आयु प्रतिबंध है — साइन-इन खाते के बिना डाउनलोड नहीं हो सकता।',
      unavailable: 'यह वीडियो उपलब्ध नहीं — हो सकता है यह निजी, हटाया गया या क्षेत्र-प्रतिबंधित हो।',
      geoBlocked: 'यह वीडियो आपके क्षेत्र में उपलब्ध नहीं है।'
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
  formatLabel: {
    audioOnly: 'सिर्फ़ ऑडियो',
    audioFallback: 'ऑडियो',
    audioOnlyDot: 'सिर्फ़ ऑडियो · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} डाउनलोड चल रही है',
      message_other: '{{count}} डाउनलोड चल रही हैं',
      detail: 'बंद करने पर सभी सक्रिय डाउनलोड रद्द हो जाएँगी।',
      confirm: 'डाउनलोड रद्द करके बंद करें',
      keep: 'डाउनलोड जारी रखें'
    }
  }
} as const;

export default hi;
