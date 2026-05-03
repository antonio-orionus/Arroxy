const uz = {
  common: {
    back: 'Orqaga',
    continue: 'Davom etish',
    retry: 'Qayta urinish',
    startOver: 'Qaytadan boshlash',
    loading: 'Yuklanmoqda…'
  },
  app: {
    feedback: 'Fikr-mulohaza',
    logs: 'Jurnallar',
    feedbackNudge: "Arroxy yoqdimi? Fikringizni bilmoqchiman! 💬",
    debugCopied: 'Nusxalandi!',
    debugCopyTitle: 'Debug ma\'lumotlarini nusxalash (Electron, OS, Chrome versiyalari)',
    zoomIn: 'Kattalashtirish',
    zoomOut: 'Kichraytirish'
  },
  titleBar: {
    close: 'Yopish',
    minimize: 'Kichraytirish',
    maximize: 'Kattalashtirish',
    restore: 'Tiklash'
  },
  splash: {
    greeting: 'Xush kelibsiz, qayta keldingiz!',
    warmup: 'Arroxy ishga tayyorlanmoqda…',
    warning: 'Sozlash yakunlanmagan — ba\'zi funksiyalar ishlamasligi mumkin'
  },
  theme: {
    light: 'Yorug\' rejim',
    dark: 'Qorong\'i rejim',
    system: 'Tizim standart'
  },
  language: {
    label: 'Til'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Format',
      subtitles: 'Subtitrlar',
      sponsorblock: 'SponsorBlock',
      output: 'Chiqish',
      folder: 'Saqlash',
      confirm: 'Tasdiqlash'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com va youtu.be havolalarini qo\'llab-quvvatlaydi',
      fetchFormats: 'Formatlarni olish',
      mascotIdle: 'Menga YouTube havolasini yuboring (video yoki Short) — keyin "Formatlarni olish" tugmasini bosing, ishga tushaman ✨',
      mascotBusy: 'Fonda yuklanmoqda… Men bir vaqtda ko\'p ish qila olaman 😎',
      advanced: 'Kengaytirilgan',
      clearAria: 'URLni tozalash',
      clipboard: {
        toggle: 'Buferga nazar solish',
        toggleDescription: 'YouTube havolasini nusxalaganda URL maydonini avtomatik to\'ldiradi.',
        dialog: {
          title: 'YouTube URL aniqlandi',
          body: 'Buferingizdagi bu havoladan foydalanasizmi?',
          useButton: 'URLdan foydalanish',
          disableButton: 'O\'chirish',
          cancelButton: 'Bekor qilish',
          disableNote: 'Buferga nazar solishni keyinroq Kengaytirilgan sozlamalarda qayta yoqishingiz mumkin.'
        }
      },
      cookies: {
        toggle: 'Cookies faylidan foydalanish',
        toggleDescription: 'Yosh cheklovli, faqat a\'zolar uchun va shaxsiy hisob videolari bilan yordam beradi.',
        risk: 'Xavf: cookies.txt o\'sha brauzerning barcha kirgan sessiyalarini o\'z ichiga oladi — uni shaxsiy saqlang.',
        fileLabel: 'Cookies fayli',
        choose: 'Tanlash…',
        clear: 'Tozalash',
        placeholder: 'Fayl tanlanmagan',
        helpLink: 'Cookiesni qanday eksport qilaman?',
        enabledButNoFile: 'Cookiesdan foydalanish uchun fayl tanlang',
        banWarning: 'YouTube — va ba\'zida — yt-dlp cookieslaridan foydalanadigan hisoblarni belgilashi yoki taqiqlashi mumkin. Iloji bo\'lsa vaqtinchalik hisob ishlating.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      closeToTray: {
        toggle: 'Yopilganda tizim soatiga yashirish',
        toggleDescription: 'Oyna yopilgandan keyin yuklamalar fonda davom etadi.'
      },
      analytics: {
        toggle: 'Anonim foydalanish statistikasini yuborish',
        toggleDescription: 'Faqat ilovani ishga tushirish sonini hisoblaydi. URL, fayl nomlari yoki shaxsiy maʼlumotlar yoʼq.'
      }
    },
    subtitles: {
      heading: 'Subtitrlar',
      autoBadge: 'Avto',
      hint: 'Yordamchi fayllar videoning yoniga saqlanadi',
      noLanguages: 'Bu video uchun subtitrlar mavjud emas',
      skip: 'O\'tkazib yuborish',
      skipSubs: 'Bu video uchun o\'tkazib yuborish',
      selectAll: 'Hammasini tanlash',
      deselectAll: 'Hammasini bekor qilish',
      mascot: 'Nol, bir yoki ko\'p tanlang — bu sizga bog\'liq ✨',
      searchPlaceholder: 'Tillarni qidirish…',
      noMatches: 'Mos til topilmadi',
      clearAll: 'Hammasini tozalash',
      noSelected: 'Hech qanday subtitrl tanlanmagan',
      selectedNote_one: '{{count}} ta subtitrl yuklanadi',
      selectedNote_other: '{{count}} ta subtitrl yuklanadi',
      sectionManual: 'Qo\'lda',
      sectionAuto: 'Avtomatik yaratilgan',
      saveMode: {
        heading: 'Saqlash turi',
        sidecar: 'Videoning yoniga',
        embed: 'Videoga joylash',
        subfolder: 'subtitles/ papkachasi'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'Joylash rejimida chiqish .mkv sifatida saqlanadi, shunda subtitrl treklari ishonchli joylashadi.',
      autoAssNote: "Avtomatik sarlavhalar ASS o'rniga SRT sifatida saqlanadi — ular doimo YouTube'ning bizning ASS konvertorimiz hali takrorlay olmagan aylanma replikatsiyadan tozalanadi."
    },
    sponsorblock: {
      modeHeading: 'Homiy filtrlash',
      mode: {
        off: 'O\'chirilgan',
        mark: 'Boblar sifatida belgilash',
        remove: 'Segmentlarni olib tashlash'
      },
      modeHint: {
        off: 'SponsorBlock yo\'q — video yuklangan holatda ijro etiladi.',
        mark: 'Homiy segmentlarini boblar sifatida belgilaydi (vayron qilmaydi).',
        remove: 'FFmpeg yordamida videodan homiy segmentlarini qirqib tashlaydi.'
      },
      categoriesHeading: 'Kategoriyalar',
      cat: {
        sponsor: 'Homiy',
        intro: 'Kirish',
        outro: 'Chiqish',
        selfpromo: 'O\'z reklamasi',
        music_offtopic: 'Mavzudan tashqari musiqa',
        preview: 'Ko\'rib chiqish',
        filler: 'To\'ldiruvchi'
      }
    },
    formats: {
      quickPresets: 'Tezkor sozlamalar',
      video: 'Video',
      audio: 'Audio',
      noAudio: 'Audio yo\'q',
      videoOnly: 'Faqat video',
      audioOnly: 'Faqat audio',
      audioOnlyOption: 'Faqat audio (video yo\'q)',
      mascot: 'Eng yaxshi + Eng yaxshi = maksimal sifat. Men shuni tanlardim!',
      sniffing: 'Siz uchun eng yaxshi formatlarni qidiryapman…',
      loadingHint: 'Odatda bir soniya vaqt oladi',
      loadingAria: 'Formatlar yuklanmoqda',
      sizeUnknown: 'Hajm noma\'lum',
      total: 'Jami'
    },
    folder: {
      heading: 'Saqlash joyi',
      downloads: 'Yuklamalar',
      videos: 'Filmlar',
      desktop: 'Ish stoli',
      music: 'Musiqa',
      documents: 'Hujjatlar',
      pictures: 'Rasmlar',
      home: 'Uy',
      custom: 'Maxsus…',
      subfolder: {
        toggle: 'Papkachaga saqlash',
        placeholder: 'mas. lo-fi rips',
        invalid: 'Papka nomida noto\'g\'ri belgilar bor'
      }
    },
    output: {
      embedChapters: {
        label: 'Boblarni joylashtirish',
        description: 'Har qanday zamonaviy pleyerda navigatsiya qilinuvchi bob belgilari.'
      },
      embedMetadata: {
        label: 'Metama\'lumotlarni joylashtirish',
        description: 'Sarlavha, ijrochi, tavsif va yuklash sanasi faylga yoziladi.'
      },
      embedThumbnail: {
        label: 'Muqovani joylashtirish',
        description: 'Fayl ichidagi muqova rasmi. Faqat MP4 / M4A — subtitrlar joylashtirilganda o\'tkazib yuboriladi.'
      },
      writeDescription: {
        label: 'Tavsifni saqlash',
        description: 'Video tavsifini yuklamaning yoniga .description matn fayli sifatida saqlaydi.'
      },
      writeThumbnail: {
        label: 'Muqovani saqlash',
        description: 'Muqovani yuklamaning yoniga .jpg rasm fayli sifatida saqlaydi.'
      }
    },
    confirm: {
      readyHeadline: 'Yuklab olishga tayyor!',
      landIn: 'Faylingiz quyidagi joyga tushadi',
      labelVideo: 'Video',
      labelAudio: 'Audio',
      labelSubtitles: 'Subtitrlar',
      subtitlesNone: '—',
      labelSaveTo: 'Saqlash joyi',
      labelSize: 'Hajm',
      sizeUnknown: 'Noma\'lum',
      nothingToDownload: 'Faqat subtitrlar oldindan sozlamasi faol, lekin hech qanday subtitrl tili tanlanmagan — hech narsa yuklanmaydi.',
      audioOnly: 'Faqat audio',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Boshqa yuklamalar tugaganda boshlanadi — to\'liq tarmoq kengligini oladi',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'Darhol boshlanadi — boshqa faol yuklamalar bilan parallel ishlaydi'
    },
    error: {
      icon: 'Xato'
    }
  },
  videoCard: {
    titlePlaceholder: 'Yuklanmoqda…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Yuklash navbati',
    toggleTitle: 'Yuklash navbatini ko\'rsatish/yashirish',
    empty: 'Navbatga qo\'shgan yuklamalaringiz bu yerda ko\'rinadi',
    noDownloads: 'Hali hech qanday yuklama yo\'q.',
    activeCount: '{{count}} ta yuklanmoqda · {{percent}}%',
    clear: 'Tozalash',
    clearTitle: 'Tugallangan yuklamalarni tozalash',
    tip: 'Yuklamangiz quyida navbatda — jarayonni kuzatish uchun istalgan vaqt oching.',
    item: {
      doneAt: '{{time}} da tugallandi',
      paused: 'To\'xtatilgan',
      defaultError: 'Yuklama muvaffaqiyatsiz',
      openUrl: 'URLni ochish',
      pause: 'To\'xtatish',
      resume: 'Davom ettirish',
      cancel: 'Bekor qilish',
      remove: 'O\'chirish'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'mavjud',
    youHave: '— sizda {{currentVersion}} bor',
    install: 'O\'rnatish va qayta ishga tushirish',
    downloading: 'Yuklanmoqda…',
    download: 'Download ↗',
    dismiss: 'Yangilanish bannerini yopish',
    copy: 'Buyruqni buferga nusxalash',
    copied: 'Buyruq buferga nusxalandi'
  },
  status: {
    preparingBinaries: 'Ikkilik fayllar tayyorlanmoqda…',
    mintingToken: 'YouTube tokeni yaratilmoqda…',
    remintingToken: 'Token qayta yaratilmoqda…',
    startingYtdlp: 'yt-dlp jarayoni boshlanmoqda…',
    downloadingMedia: 'Video va audio yuklanmoqda…',
    mergingFormats: 'Audio va video birlashtirilmoqda…',
    fetchingSubtitles: 'Subtitrlar olinmoqda…',
    sleepingBetweenRequests: 'Tezlik chegarasidan qochish uchun {{seconds}} soniya kutilmoqda…',
    subtitlesFailed: 'Video saqlandi — ba\'zi subtitrlarni yuklab bo\'lmadi',
    cancelled: 'Yuklama bekor qilindi',
    complete: 'Yuklama yakunlandi',
    usedExtractorFallback: 'Yengilroq ekstraktor bilan yuklab olindi — ishonchli yuklamalar uchun cookies.txt ni sozlang',
    ytdlpProcessError: 'yt-dlp jarayon xatosi: {{error}}',
    ytdlpExitCode: 'yt-dlp {{code}} kodi bilan chiqdi',
    downloadingBinary: '{{name}} ikkilik fayli yuklanmoqda…',
    unknownStartupFailure: 'Noma\'lum yuklama ishga tushirish xatosi'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube bu so\'rovni bot deb belgiladi. Bir oz kutib qayta urinib ko\'ring.',
      ipBlock: 'IP manzilingiz YouTube tomonidan bloklangan ko\'rinadi. Keyinroq urinib ko\'ring yoki VPN ishlating.',
      rateLimit: 'YouTube so\'rovlarni cheklayapti. Bir daqiqa kuting va qayta urinib ko\'ring.',
      ageRestricted: 'Bu video yosh cheklovli va tizimga kirgan hisob bo\'lmasdan yuklab bo\'lmaydi.',
      unavailable: 'Bu video mavjud emas — u shaxsiy, o\'chirilgan yoki mintaqa bilan cheklangan bo\'lishi mumkin.',
      geoBlocked: 'Bu video sizning mintaqangizda mavjud emas.',
      outOfDiskSpace: 'Disk xotirasi yetarli emas. Bo\'sh joy ajrating va qayta urinib ko\'ring.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Eng yuqori sifat',
      desc: 'Eng yuqori o\'lcham + eng yaxshi audio'
    },
    balanced: {
      label: 'Muvozanatli',
      desc: '720p maksimal + yaxshi audio'
    },
    'audio-only': {
      label: 'Faqat audio',
      desc: 'Video yo\'q, eng yaxshi audio'
    },
    'small-file': {
      label: 'Kichik fayl',
      desc: 'Eng past o\'lcham + past audio'
    },
    'subtitle-only': {
      label: 'Faqat subtitrlar',
      desc: 'Video yo\'q, audio yo\'q, faqat subtitrlar'
    }
  },
  formatLabel: {
    audioOnly: 'Faqat audio',
    audioFallback: 'Audio',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Faoliyatsiz',
      statusActive_one: '1 ta yuklanmoqda · {{percent}}%',
      statusActive_other: '{{count}} ta yuklanmoqda · {{percent}}%',
      open: 'Arroxy ni ochish',
      quit: 'Arroxy dan chiqish'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} ta yuklama jarayonda',
      message_other: '{{count}} ta yuklama jarayonda',
      detail: 'Yopilsa barcha faol yuklamalar bekor qilinadi.',
      confirm: 'Yuklamalarni bekor qilish va chiqish',
      keep: 'Yuklab olishni davom ettirish'
    },
    closeToTray: {
      message: 'Yopilganda Arroxy ni tizim soatiga yashirasizmi?',
      detail: 'Arroxy ishlashda davom etadi va faol yuklamalarni yakunlaydi. Buni keyinroq Kengaytirilgan sozlamalarda o\'zgartiring.',
      hide: 'Tizim soatiga yashirish',
      quit: 'Chiqish',
      remember: "Boshqa so'ramaslik"
    }
  }
} as const;

export default uz;
