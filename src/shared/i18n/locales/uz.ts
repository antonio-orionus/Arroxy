const uz = {
  common: {
    back: 'Orqaga',
    continue: 'Davom etish',
    retry: 'Qayta urinish',
    startOver: 'Qaytadan boshlash'
  },
  app: {
    feedback: 'Fikr-mulohaza',
    logs: 'Jurnallar',
    feedbackNudge: 'Arroxy yoqdimi? Fikringizni bilmoqchiman! 💬',
    debugCopied: 'Nusxalandi!',
    debugCopyTitle: "Debug ma'lumotlarini nusxalash (Electron, OS, Chrome versiyalari)",
    zoomIn: 'Kattalashtirish',
    zoomOut: 'Kichraytirish'
  },
  about: {
    button: 'Dastur haqida',
    openTitle: 'Arroxy haqida',
    tagline: 'Ish stoli uchun tez va qulay video va audio yuklash dasturi.',
    websiteLink: 'Veb-sayt',
    githubLink: 'GitHub',
    licenseLine: 'MIT litsenziyasi · by Antonio Orionus',
    thirdPartyNotices: "Uchinchi tomon bildirishnomalarini ko'rish"
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
    downloading: '{{binary}} yuklanmoqda…',
    warmupFailedNoDiag: 'Sozlash muvaffaqiyatsiz yakunlandi. Tafsilotlar uchun sozlash jurnalini oching.'
  },
  repair: {
    title: 'Sozlash sizning yordamingizga muhtoj',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: "Tekshirib bo'lmadi.",
      downloadFailed: "Yuklash muvaffaqiyatsiz. Internet ulanishingizni tekshiring va qayta urinib ko'ring.",
      extractFailed: "Arxivni ochish muvaffaqiyatsiz. Yuklama buzilgan bo'lishi mumkin — qayta urinib ko'ring.",
      hashFailed: 'Yuklangan faylning nazorat summasi mos kelmadi. Yuklamani qaytadan boshlang.',
      spawnFailed: "Fayl topilmadi yoki ishga tushirib bo'lmadi. Ishlaydigan nusxani tanlang.",
      permissionDenied: "Tizim faylni ishga tushirishdan bosh tortdi. Ishonchli nusxani tanlang yoki administrator sifatida qayta urinib ko'ring.",
      blockedOrQuarantined: "Windows fayli blokladi (SmartScreen / Defender). O'rnatilgan nusxani tanlang yoki ishlash vaqti papkasini oq ro'yxatga qo'shing.",
      badExitCode: "Ikkilik fayl --version ga javob bermadi. U buzilgan yoki noto'g'ri qurilma uchun bo'lishi mumkin.",
      timeout: "Versiya tekshiruvi vaqti tugadi. Fayl muammoga uchragan bo'lishi mumkin — qayta urinib ko'ring.",
      pairIncomplete: 'ffmpeg va ffprobe ikkalasi ham juft sifatida birgalikda sozlanishi kerak.'
    },
    actions: {
      chooseExecutable: 'Bajariladigan faylni tanlash',
      resetToDefault: 'Standartga qaytarish',
      retrySetup: 'Sozlashni qayta boshlash',
      cancel: 'Bekor qilish',
      openDependencyFolder: 'Qaramlik papkasini ochish',
      viewSetupLog: "Sozlash jurnalini ko'rish"
    }
  },
  theme: {
    light: "Yorug' rejim",
    dark: "Qorong'i rejim",
    system: 'Tizim standart'
  },
  language: {
    label: 'Til'
  },
  wizard: {
    steps: {
      url: 'URL',
      playlistItems: 'Playlist',
      playlistPresets: 'Sifat',
      formats: 'Format',
      subtitles: 'Subtitrlar',
      sponsorblock: 'SponsorBlock',
      output: 'Chiqish',
      folder: 'Saqlash',
      confirm: 'Tasdiqlash'
    },
    playlist: {
      heading: 'Playlist elementlari',
      itemCount_one: '{{count}} ta video',
      itemCount_other: '{{count}} ta video',
      itemCountAudio_one: '{{count}} ta trek',
      itemCountAudio_other: '{{count}} ta trek',
      selectAll: 'Hammasini tanlash',
      selectNone: 'Hammasini bekor qilish',
      rangeFrom: 'Dan',
      rangeTo: 'Gacha',
      rangeApply: 'Diapazonni qoʻllash',
      selectedCount_one: '{{count}} ta tanlangan',
      selectedCount_other: '{{count}} ta tanlangan',
      noSelection: 'Davom etish uchun kamida bitta videoni tanlang',
      loadingItems: 'Playlist yuklanmoqda…',
      thumbnailAlt: 'Video muqovasi',
      durationUnknown: 'jonli',
      syncChange: 'Jildni o‘zgartirish…',
      syncApply: 'Sinxronlashni qo‘llash',
      syncScanning: 'Jild tekshirilmoqda…',
      syncFoundTitle: 'Allaqachon jildda',
      syncFoundDesc: 'Bu videolarning {{n}} tasi allaqachon {{dir}} ichida. Faqat yangilarini yuklab olish uchun sinxronlansinmi?',
      syncNoneTitle: 'Hali hech narsa yuklab olinmagan',
      syncNoneDesc: 'Bu pleylistdan hech bir video {{dir}} ichida topilmadi.',
      alreadyDownloaded: 'Allaqachon yuklab olingan'
    },
    playlistPresets: {
      heading: 'Paket uchun sifatni tanlang',
      subhead: 'Har bir video tanlangan darajani mustaqil ravishda hal qiladi — turli xil playlistlar muammosiz ishlaydi.',
      itemCount_one: '{{count}} ta element',
      itemCount_other: '{{count}} ta element'
    },
    mixedPrompt: {
      title: 'Bu havola Playlist ga tegishli',
      body: 'Faqat bosilgan videoni olasizmi yoki Playlist dan tanlaysizmi? Keyingi qadamda aniq videolar yoki diapazon tanlanadi.',
      singleVideo: 'Faqat shu birini',
      pickFromPlaylist: 'Playlist dan tanlash'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'Formatlarni olish',
      features: {
        heading: 'Arroxy nima yuklab olishi mumkin',
        youtube: {
          heading: 'YouTube',
          video: 'Videolar',
          channel: 'Kanallar',
          playlist: 'Pleylistlar',
          short: 'Shortlar',
          music: 'Musiqa',
          podcast: 'Podkastlar'
        },
        anySite: {
          heading: '2000+ sayt',
          video: 'Videolar',
          videoPlaylist: 'Video pleylistlar',
          musicPlaylist: 'Musiqa pleylistlar'
        },
        always: {
          heading: 'Har doim mavjud',
          audioOnly: 'Faqat audio',
          subtitles: 'Subtitrlar'
        }
      },
      mascotIdle: 'Menga YouTube havolasini yuboring (video yoki Short) — keyin "Formatlarni olish" tugmasini bosing, ishga tushaman ✨',
      mascotBusy: "Fonda yuklanmoqda… Men bir vaqtda ko'p ish qila olaman 😎",
      advanced: 'Kengaytirilgan',
      clearAria: 'URLni tozalash',
      clipboard: {
        toggle: 'Buferga nazar solish',
        toggleDescription: "YouTube havolasini nusxalaganda URL maydonini avtomatik to'ldiradi.",
        dialog: {
          title: 'YouTube URL aniqlandi',
          body: 'Buferingizdagi bu havoladan foydalanasizmi?',
          useButton: 'URLdan foydalanish',
          disableButton: "O'chirish",
          cancelButton: 'Bekor qilish',
          disableNote: 'Buferga nazar solishni keyinroq Kengaytirilgan sozlamalarda qayta yoqishingiz mumkin.'
        }
      },
      cookies: {
        sourceLabel: 'Cookies manbai',
        sourceOff: "O'chirilgan",
        sourceFile: 'Fayl',
        sourceBrowser: 'Brauzer',
        toggleDescription: "Yosh cheklovli, faqat a'zolar uchun va shaxsiy hisob videolari bilan yordam beradi.",
        risk: "Xavf: cookies.txt o'sha brauzerning barcha kirgan sessiyalarini o'z ichiga oladi — uni shaxsiy saqlang.",
        fileLabel: 'Cookies fayli',
        choose: 'Tanlash…',
        clear: 'Tozalash',
        placeholder: 'Fayl tanlanmagan',
        helpLink: 'Cookiesni qanday eksport qilaman?',
        enabledButNoFile: 'Cookiesdan foydalanish uchun fayl tanlang',
        browserLabel: 'Brauzer',
        browserPlaceholder: 'Brauzer tanlang…',
        browserHelp: "Brauzerdan to'g'ridan-to'g'ri cookies o'qiydi. Chromium oilasidagi brauzerlar yopiq bo'lishi kerak.",
        enabledButNoBrowser: 'Cookiesdan foydalanish uchun brauzer tanlang',
        banWarning: "YouTube — va ba'zida — yt-dlp cookieslaridan foydalanadigan hisoblarni belgilashi yoki taqiqlashi mumkin. Iloji bo'lsa vaqtinchalik hisob ishlating.",
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'cookies.txt ni LOKAL olish (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: "Trafikni proksi orqali yo'naltirish — geo-cheklangan kontent uchun foydali.",
        placeholder: 'http://host:port',
        clear: 'Tozalash'
      },
      singleFilenameId: {
        toggle: 'Yakka fayl nomlariga video ID qo‘shish',
        toggleDescription: 'Sarlavhalar o‘zgarganda yoki mos kelib qolganda yakka yuklab olishlarni noyob saqlaydi.'
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
      autoBadge: 'Avto',
      noLanguages: 'Bu video uchun subtitrlar mavjud emas',
      skip: "O'tkazib yuborish",
      skipSubs: "Bu video uchun o'tkazib yuborish",
      mascot: "Nol, bir yoki ko'p tanlang — bu sizga bog'liq ✨",
      searchPlaceholder: 'Tillarni qidirish…',
      noMatches: 'Mos til topilmadi',
      clearAll: 'Hammasini tozalash',
      noSelected: 'Hech qanday subtitrl tanlanmagan',
      selectedNote_one: '{{count}} ta subtitrl yuklanadi',
      selectedNote_other: '{{count}} ta subtitrl yuklanadi',
      sectionManual: "Qo'lda",
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
        off: "O'chirilgan",
        mark: 'Boblar sifatida belgilash',
        remove: 'Segmentlarni olib tashlash'
      },
      modeHint: {
        off: "SponsorBlock yo'q — video yuklangan holatda ijro etiladi.",
        mark: 'Homiy segmentlarini boblar sifatida belgilaydi (vayron qilmaydi).',
        remove: 'FFmpeg yordamida videodan homiy segmentlarini qirqib tashlaydi.'
      },
      categoriesHeading: 'Kategoriyalar',
      cat: {
        sponsor: 'Homiy',
        intro: 'Kirish',
        outro: 'Chiqish',
        selfpromo: "O'z reklamasi",
        music_offtopic: 'Mavzudan tashqari musiqa',
        preview: "Ko'rib chiqish",
        filler: "To'ldiruvchi"
      }
    },
    formats: {
      quickPresets: 'Tezkor sozlamalar',
      video: 'Video',
      audio: 'Audio',
      noAudio: "Audio yo'q",
      videoOnly: 'Faqat video',
      keepAudio: "O'zgartirishsiz saqlash",
      keepAudioMeta: 'Ichki audio',
      audioOnly: 'Faqat audio',
      audioOnlyOption: "Faqat audio (video yo'q)",
      mascot: 'Eng yaxshi + Eng yaxshi = maksimal sifat. Men shuni tanlardim!',
      sniffing: 'Siz uchun eng yaxshi formatlarni qidiryapman…',
      loadingHint: 'Tekshiruv tugaguncha kuting — pleylistlar va qidiruv natijalari biroz vaqt olishi mumkin.',
      loadingAria: 'Formatlar yuklanmoqda',
      sizeUnknown: "Hajm noma'lum",
      total: 'Jami',
      skipToConfirm: "Tasdiqlashga o'tish",
      skipToConfirmTooltip: "Qolgan barcha qadamlar uchun saqlangan sozlamalaringizdan foydalanadi. Biror sozlamani o'zgartirish uchun, qadamma-qadam davom eting — tanlovingiz keyingi safar saqlanadi.",
      convert: {
        label: 'Konvertatsiya qilish',
        uncompressed: 'Konvertatsiya · siqilmagan',
        bitrate: 'Bit tezligi',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Audio konvertatsiyasi faqat audio rejimini talab qiladi (video tanlovini bekor qiling).',
        requiresLossy: "Mahalliy oqim tanlangan — bit tezligi faqat mp3, m4a yoki opus ga konvertatsiya qilishda qo'llaniladi."
      },
      botWall: {
        heading: 'YouTube bu tekshiruvni chekladi',
        bodyUnconfigured: "Format ro'yxati to'liq bo'lmasligi mumkin. Kengaytirilgan sozlamalarda cookiesni sozlang yoki tarmoqni o'zgartiring va qayta urinib ko'ring.",
        bodyDisabled: "Cookies sozlangan, lekin o'chirilgan. To'liq ro'yxat uchun ularni yoqing va qayta urinib ko'ring, yoki tarmoqni o'zgartirin.",
        bodyEnabled: "Cookies bilan ham YouTube bu tekshiruvni chekladi. Keyinroq urinib ko'ring yoki tarmoqni o'zgartiring.",
        retryCta: 'Qayta urinish',
        enableRetryCta: 'Cookiesni yoqish va qayta urinish'
      },
      cookiesError: {
        heading: "Sabab cookies bo'lishi mumkin",
        currentModeLabel: 'Cookies manbai',
        currentModeFile: 'Fayl',
        currentModeBrowser: 'Brauzer',
        explanationFile: "Cookies faylingiz bo'sh, muddati o'tgan yoki noto'g'ri formatda bo'lishi mumkin (yt-dlp Netscape cookies.txt kutadi). Cookiesni qayta eksport qiling, boshqa fayl tanlang, Brauzer rejimiga o'ting yoki cookiesni o'chiring.",
        explanationBrowser: "Cookies to'g'ridan-to'g'ri brauzerdan o'qiladi. Agar brauzer hozir ochiq bo'lsa, uning cookie ma'lumotlar bazasi qulflangan bo'lishi mumkin (Chromium-family). Brauzer YouTube ga kirgan bo'lishi ham kerak. Brauzerni yoping, boshqa brauzer sinab ko'ring, Fayl rejimiga o'ting yoki cookiesni o'chiring.",
        openSettingsCta: 'Cookies sozlamalarini ochish',
        needsCookies: {
          heading: 'Bu sayt tizimga kirish talab qiladi',
          body: "yt-dlp bu videoga autentifikatsiyasiz kira olmadi. Kengaytirilgan sozlamalarda cookiesni sozlang — allaqachon kirgan brauzeringizga yo'naltiring yoki cookies.txt faylini import qiling."
        },
        dpapi: {
          heading: 'Chrome cookies Windows shifrlash orqali bloklangan',
          explanation: "Chrome 127 va undan yangi versiyalar cookies ni Windows da boshqa ilovalar o'qiy olmaydigan tarzda shifrlaydi. Quyidagi yechimlardan birini sinab ko'ring.",
          fixFirefoxLabel: "Firefox ga o'tish",
          fixFirefoxBody: "Firefox App-Bound Encryption dan foydalanmaydi. Cookies sozlamalarini oching va brauzer ro'yxatidan Firefox ni tanlang.",
          fixFileLabel: 'cookies.txt ni eksport qilish',
          fixFileBody: "Chrome dan brauzer kengaytmasi yordamida cookies ni eksport qiling, so'ng bu ilovani Fayl rejimiga o'tkazing va eksport qilingan faylni tanlang.",
          fixUnsafeLabel: "App-Bound Encryption o'chirilgan holda Chrome ni ishga tushirish",
          fixUnsafeBody: "Chrome ishga tushirish yorlig'iga --disable-features=LockProfileCookieDatabase qo'shing. Ogohlantirish: bu oldindan shifrlangan cookies ni bekor qiladi, shuning uchun siz barcha saytlardan chiqib ketasiz va qayta kirishingiz kerak bo'ladi.",
          docsLinkLabel: 'yt-dlp hujjatlar (issue #10927)'
        }
      }
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
        invalid: "Papka nomida noto'g'ri belgilar bor"
      }
    },
    output: {
      embedChapters: {
        label: 'Boblarni joylashtirish',
        description: 'Har qanday zamonaviy pleyerda navigatsiya qilinuvchi bob belgilari.'
      },
      embedMetadata: {
        label: "Metama'lumotlarni joylashtirish",
        description: 'Sarlavha, ijrochi, tavsif va yuklash sanasi faylga yoziladi.'
      },
      embedThumbnail: {
        label: 'Muqovani joylashtirish',
        description: "Fayl ichidagi muqova rasmi. WebM video MKV formatiga o'tkaziladi; subtitrlar joylashtirilganda o'tkazib yuboriladi."
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
      sizeUnknown: "Noma'lum",
      nothingToDownload: 'Faqat subtitrlar oldindan sozlamasi faol, lekin hech qanday subtitrl tili tanlanmagan — hech narsa yuklanmaydi.',
      thumbnailEmbedNotSupported: "Thumbnail embed o'tkazib yuborildi — chiqish container uni qo'llab-quvvatlamaydi.",
      subtitleEmbedAudioOnly: "Subtitle embed sidecar ga o'zgartirildi — audio treklari ichki subtitle oqimlarini qo'llab-quvvatlamaydi.",
      audioOnly: 'Faqat audio',
      addToQueue: '+ Queue',
      addToQueueTooltip: "Boshqa yuklamalar tugaganda boshlanadi — to'liq tarmoq kengligini oladi",
      pullIt: 'Yuklab ol! ↓',
      pullItTooltip: 'Darhol boshlanadi — boshqa faol yuklamalar bilan parallel ishlaydi',
      labelPlaylist: 'Pleylist',
      labelPreset: 'Sozlama',
      labelItems: 'Elementlar',
      itemsValue_one: '{{total}} ta videoning {{count}} tasi',
      itemsValue_other: '{{total}} ta videoning {{count}} tasi',
      itemsValueAudio_one: '{{total}} ta trekning {{count}} tasi',
      itemsValueAudio_other: '{{total}} ta trekning {{count}} tasi'
    }
  },
  videoCard: {
    titlePlaceholder: 'Yuklanmoqda…'
  },
  queue: {
    header: 'Yuklash navbati',
    toggleTitle: "Yuklash navbatini ko'rsatish/yashirish",
    empty: "Navbatga qo'shgan yuklamalaringiz bu yerda ko'rinadi",
    noDownloads: "Hali hech qanday yuklama yo'q.",
    activeCount: '{{count}} ta yuklanmoqda · {{percent}}%',
    clear: 'Tozalash',
    clearTitle: 'Tugallangan yuklamalarni tozalash',
    pauseAll: "Hammasini to'xtatib turish",
    pauseAllTitle: "Barcha faol yuklamalarni to'xtatib turish",
    cancelAll: 'Hammasini bekor qilish',
    cancelAllTitle: 'Barcha faol va kutayotgan yuklamalarni bekor qilish',
    tip: 'Yuklamangiz quyida navbatda — jarayonni kuzatish uchun istalgan vaqt oching.',
    item: {
      doneAt: '{{time}} da tugallandi',
      paused: "To'xtatilgan",
      defaultError: 'Yuklama muvaffaqiyatsiz',
      openUrl: 'URLni ochish',
      pause: "To'xtatish",
      hold: 'Ushlab tur',
      resume: 'Davom ettirish',
      cancel: 'Bekor qilish',
      remove: "O'chirish"
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'mavjud',
    youHave: '— sizda {{currentVersion}} bor',
    install: "O'rnatish va qayta ishga tushirish",
    downloading: 'Yuklanmoqda…',
    download: 'Download ↗',
    dismiss: 'Yangilanish bannerini yopish',
    copy: 'Buyruqni buferga nusxalash',
    copied: 'Buyruq buferga nusxalandi',
    installFailed: 'Yangilanish muvaffaqiyatsiz',
    retry: 'Qayta urinish'
  },
  status: {
    preparingBinaries: 'Ikkilik fayllar tayyorlanmoqda…',
    mintingToken: 'YouTube tokeni yaratilmoqda…',
    remintingToken: 'Token qayta yaratilmoqda…',
    startingYtdlp: 'yt-dlp jarayoni boshlanmoqda…',
    downloadingMedia: 'Video va audio yuklanmoqda…',
    mergingFormats: 'Audio va video birlashtirilmoqda…',
    extractingAudio: 'Audio konvertatsiya qilinmoqda…',
    convertingVideo: 'Video konvertatsiya qilinmoqda…',
    embeddingMetadata: "Metama'lumotlar joylashtirilmoqda…",
    movingFiles: "Fayllar ko'chirilmoqda…",
    fetchingSubtitles: 'Subtitrlar olinmoqda…',
    sleepingBetweenRequests: 'Tezlik chegarasidan qochish uchun {{seconds}} soniya kutilmoqda…',
    subtitlesFailed: "Video saqlandi — ba'zi subtitrlarni yuklab bo'lmadi",
    cancelled: 'Yuklama bekor qilindi',
    complete: 'Yuklama yakunlandi',
    usedExtractorFallback: 'Yengilroq ekstraktor bilan yuklab olindi — ishonchli yuklamalar uchun cookies.txt ni sozlang',
    ytdlpProcessError: 'yt-dlp jarayon xatosi: {{error}}',
    ytdlpExitCode: 'yt-dlp {{code}} kodi bilan chiqdi',
    downloadingBinary: '{{name}} ikkilik fayli yuklanmoqda…',
    unknownStartupFailure: "Noma'lum yuklama ishga tushirish xatosi",
    diskSpaceInsufficient: 'Disk xotirasi yetarli emas — {{required}} kerak, faqat {{free}} mavjud',
    fetchingSponsorBlock: "SponsorBlock bilan bog'lanilmoqda…",
    retryingSponsorBlock: 'SponsorBlock mavjud emas, qayta urinilmoqda ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: "Bot himoyasi ishga tushdi. Siz foydalanayotgan IP manzil, ehtimol, bloklangan (ma'lumot markazi diapazoni yoki band VPN chiqish nuqtasi). IP manzilingizni o'zgartiring yoki boshqa VPN nuqtasini tanlang va qayta urinib ko'ring. Muammo davom etsa, bu YouTube tomonidan vaqtinchalik o'zgarish bo'lishi mumkin — Arroxy ishga tushganda yt-dlp ni avtomatik yangilaydi, shuning uchun tuzatish yuqori oqim chiqarilishi bilan avtomatik amalga oshiriladi.",
      ipBlock: "IP manzilingiz YouTube tomonidan bloklangan ko'rinadi. Keyinroq urinib ko'ring yoki VPN ishlating.",
      rateLimit: "YouTube so'rovlarni cheklayapti. Bir daqiqa kuting va qayta urinib ko'ring.",
      ageRestricted: "Bu video yosh cheklovli va tizimga kirgan hisob bo'lmasdan yuklab bo'lmaydi.",
      unavailable: "Bu video mavjud emas — u shaxsiy, o'chirilgan yoki mintaqa bilan cheklangan bo'lishi mumkin.",
      geoBlocked: 'Bu video sizning mintaqangizda mavjud emas.',
      outOfDiskSpace: "Disk xotirasi yetarli emas. Bo'sh joy ajrating va qayta urinib ko'ring.",
      unsupportedUrl: "Bu video URL manzilga o'xshamaydi. YouTube video, Short yoki pleylist havolasini joylashtiring.",
      chunkTransferFailure: "Server yuklab olishni o'rtasida uzib qo'ydi va yt-dlp qayta urinishlardan so'ng voz kechdi. Bu odatda eng katta video formatlarida (4K HDR / yuqori bitreytli VP9) uchraydi. Qayta urining, tarmoq/VPN almashtiring yoki pastroq ruxsat formatini tanlang.",
      postprocessFailure: "yt-dlp yuklab olishni tugatdi, biroq keyingi qayta ishlash (birlashtirish / mux / o'girish) muvaffaqiyatsiz tugadi. Ko'pincha bu ffmpeg ning vaqtinchalik muammosi — qayta urining, agar davom etsa, boshqa format kombinatsiyasini sinab ko'ring.",
      parse: "Saytdan kelgan javobni tahlil qilib bo'lmadi. yt-dlp ekstraktori eskirib qolgan bo'lishi mumkin. Arroxy ishga tushganda yt-dlp ni avtomatik yangilaydi — bir necha daqiqadan so'ng tuzatish kelgach qayta urinib ko'ring.",
      network: 'Tarmoq xatosi. Aloqangizni tekshiring va qayta urining.',
      drmProtected: "Bu video DRM bilan himoyalangan. yt-dlp DRM ni olib tashlayolmaydi, shuning uchun fayl yuklab bo'lmaydi.",
      loginRequired: "Bu video uchun tizimga kirgan hisob zarur. cookies.txt ni sozlang (Sozlamalar → Cookies) va qayta urinib ko'ring.",
      unknown: "Yuklab olish muvaffaqiyatsiz tugadi. Quyidagi xom natijani ko'ring."
    }
  },
  presets: {
    'best-quality': {
      label: 'Eng yuqori sifat',
      desc: "Eng yuqori o'lcham + eng yaxshi audio"
    },
    balanced: {
      label: 'Muvozanatli',
      desc: '720p maksimal + yaxshi audio'
    },
    'audio-only': {
      label: 'Faqat audio',
      desc: "Video yo'q, eng yaxshi audio"
    },
    'small-file': {
      label: 'Kichik fayl',
      desc: "Eng past o'lcham + past audio"
    },
    'subtitle-only': {
      label: 'Faqat subtitrlar',
      desc: "Video yo'q, audio yo'q, faqat subtitrlar"
    }
  },
  playlistPresets: {
    'video-best': { label: 'Eng yuqori sifat', desc: 'Har bir element uchun eng yuqori video + audio' },
    'video-2160p': { label: '4K gacha', desc: '2160p bilan cheklangan, har bir element uchun pastroqqa tushadi' },
    'video-1440p': { label: '1440p gacha', desc: '2K bilan cheklangan, har bir element uchun pastroqqa tushadi' },
    'video-1080p': { label: '1080p gacha', desc: 'Har bir element uchun cheklangan, pastroqqa tushadi' },
    'video-720p': { label: '720p gacha', desc: 'Kichikroq fayllar, keng muvofiqlik' },
    'video-480p': { label: '480p gacha', desc: 'Past tarmoq kengligi' },
    'video-360p': { label: '360p gacha', desc: 'Eng kichik video' },
    'audio-best': { label: 'Audio (eng yaxshi)', desc: 'Mahalliy eng yaxshi audio, qayta kodlashsiz' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'MP3 192 kbps ga konvertatsiya qilish' }
  },
  formatLabel: {
    audioFallback: 'Audio',
    audioOnlyDot: 'Faqat audio · {{audio}}',
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
      detail: "Arroxy ishlashda davom etadi va faol yuklamalarni yakunlaydi. Buni keyinroq Kengaytirilgan sozlamalarda o'zgartiring.",
      hide: 'Tizim soatiga yashirish',
      quit: 'Chiqish',
      remember: "Boshqa so'ramaslik"
    },
    rendererCrashed: {
      message: 'Arroxy muammo bilan duch keldi',
      detail: 'Renderlovchi jarayon ishdan chiqdi ({{reason}}). Qayta urinish uchun yangilang.',
      reload: 'Yangilash',
      quit: 'Chiqish'
    }
  },
  share: {
    title: 'Arroxy ni ulashing',
    description: "Arroxy bepul va ochiq manbali. Ulashish ko'proq odamlar uni topishiga yordam beradi.",
    copyLink: 'Havolani nusxalash',
    copied: 'Nusxalandi!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Arroxy ulashish',
    footerLabel: 'Ulashish',
    shareAction: 'Arroxy ulashish',
    inlineCard: {
      body: "Arroxy yoqdimi? Uni foydali deb topishi mumkin bo'lgan biri bilan ulashing.",
      dismiss: 'Ulashish taklifini yopish'
    },
    highValueBanner: {
      body: 'Arroxy yoqdimi? Boshqalarga uni topishga yordam bering.',
      dismiss: 'Ulashish taklifini yopish'
    }
  }
} as const;

export default uz;
