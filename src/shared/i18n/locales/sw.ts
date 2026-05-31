const sw = {
  common: {
    back: 'Rudi',
    continue: 'Endelea',
    retry: 'Jaribu tena',
    startOver: 'Anza upya'
  },
  app: {
    feedback: 'Maoni',
    logs: 'Kumbukumbu',
    feedbackNudge: 'Unafurahia Arroxy? Ningependa kusikia kutoka kwako! 💬',
    debugCopied: 'Imenakiliwa!',
    debugCopyTitle: 'Nakili maelezo ya utatuzi (matoleo ya Electron, OS, Chrome)',
    zoomIn: 'Kuza',
    zoomOut: 'Punguza'
  },
  about: {
    button: 'Kuhusu',
    openTitle: 'Kuhusu Arroxy',
    tagline: 'Kipakuzi cha video na sauti cha haraka na rahisi kwa kompyuta.',
    websiteLink: 'Tovuti',
    githubLink: 'GitHub',
    licenseLine: 'Leseni ya MIT · na Antonio Orionus',
    thirdPartyNotices: 'Tazama notisi za wengine'
  },
  titleBar: {
    close: 'Funga',
    minimize: 'Punguza',
    maximize: 'Panua',
    restore: 'Rejesha'
  },
  splash: {
    greeting: 'Hujambo, karibu tena!',
    warmup: 'Arroxy inajipanga…',
    downloading: 'Inapakua {{binary}}…',
    warmupFailedNoDiag: 'Usanidi umeshindwa. Fungua kumbukumbu ya usanidi kwa maelezo zaidi.'
  },
  repair: {
    title: 'Usanidi unahitaji msaada wako',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'Haikuweza kuthibitishwa.',
      downloadFailed: 'Upakuaji umeshindwa. Angalia muunganisho wako wa intaneti na ujaribu tena.',
      extractFailed: 'Ufunguzi wa kumbukumbu umeshindwa. Upakuaji unaweza kuwa umeharibiwa — jaribu tena.',
      hashFailed: 'Checksum ya faili iliyopakuliwa haifanani. Pakua upya faili.',
      spawnFailed: 'Faili haipo au haiwezi kuzinduliwa. Chagua nakala inayofanya kazi.',
      permissionDenied: 'Mfumo ulikataa kuendesha faili. Chagua nakala unayoiamini au jaribu tena kama msimamizi.',
      blockedOrQuarantined: 'Windows ilizuia faili (SmartScreen / Defender). Chagua nakala iliyosakinishwa au weka saraka ya runtime kwenye orodha nyeupe.',
      badExitCode: 'Binary haikujibu --version. Inaweza kuwa imeharibiwa au muundo mbaya.',
      timeout: 'Uchunguzi wa toleo ulichukua muda mrefu. Faili inaweza kuwa imesimama — jaribu tena.',
      pairIncomplete: 'ffmpeg na ffprobe lazima ziwekwe zote kwa pamoja kama jozi inayolingana.'
    },
    actions: {
      chooseExecutable: 'Chagua faili inayotekelezwa',
      resetToDefault: 'Rejesha chaguo-msingi',
      retrySetup: 'Jaribu usanidi tena',
      cancel: 'Ghairi',
      openDependencyFolder: 'Fungua saraka ya utegemezi',
      viewSetupLog: 'Angalia kumbukumbu ya usanidi'
    }
  },
  theme: {
    light: 'Hali ya mwanga',
    dark: 'Hali ya giza',
    system: 'Chaguo-msingi la mfumo'
  },
  language: {
    label: 'Lugha'
  },
  wizard: {
    steps: {
      url: 'URL',
      playlistItems: 'Playlist',
      playlistPresets: 'Ubora',
      formats: 'Umbizo',
      subtitles: 'Manukuu',
      sponsorblock: 'SponsorBlock',
      output: 'Matokeo',
      folder: 'Hifadhi',
      confirm: 'Thibitisha'
    },
    playlist: {
      heading: 'Vipande vya Playlist',
      itemCount_one: '{{count}} video',
      itemCount_other: '{{count}} video',
      itemCountAudio_one: '{{count}} wimbo',
      itemCountAudio_other: '{{count}} nyimbo',
      selectAll: 'Chagua yote',
      selectNone: 'Futa uchaguzi wote',
      rangeFrom: 'Kutoka',
      rangeTo: 'Hadi',
      rangeApply: 'Tumia masafa',
      selectedCount_one: '{{count}} imechaguliwa',
      selectedCount_other: '{{count}} zimechaguliwa',
      noSelection: 'Chagua angalau video moja ili kuendelea',
      loadingItems: 'Inapata Playlist…',
      thumbnailAlt: 'Picha ndogo ya video',
      durationUnknown: 'live',
      syncChange: 'Badilisha folda…',
      syncApply: 'Tekeleza usawazishaji',
      syncScanning: 'Inakagua folda…',
      syncFoundTitle: 'Tayari ipo kwenye folda',
      syncFoundDesc: '{{n}} kati ya video hizi tayari zipo kwenye {{dir}}. Sawazisha ili kupakua mpya pekee?',
      syncNoneTitle: 'Hakuna kilichopakuliwa bado',
      syncNoneDesc: 'Hakuna video kutoka orodha hii ya kucheza zilizopatikana kwenye {{dir}}.',
      alreadyDownloaded: 'Tayari imepakuliwa',
      probeLimitAlertTitle: 'Skani ya playlist imefungwa',
      probeLimitAlertDesc: 'Arroxy imepata zaidi ya vipande {{count}}, kwa hivyo kikomo cha skani cha sasa kinaficha vilivyobaki.'
    },
    playlistPresets: {
      heading: 'Chagua ubora wa kundi',
      subhead: 'Kila video inatatua kiwango kilichochaguliwa kwa kujitegemea — playlists tofauti hufanya kazi bila mshangao.',
      itemCount_one: '{{count}} kipande',
      itemCount_other: '{{count}} vipande'
    },
    mixedPrompt: {
      title: 'Kiungo hiki kina Playlist',
      body: 'Unataka video uliyobofya tu, au uchague kutoka Playlist? Hatua inayofuata utachagua video maalum au anuwai.',
      singleVideo: 'Hii tu',
      pickFromPlaylist: 'Chagua kutoka Playlist',
      playlistLimit: 'Kikomo cha kuchunguza playlist: vipengee {{count}}',
      advancedSettings: 'Mipangilio ya kina',
      singleTooltip: 'Hutumia modi ya video moja ya yt-dlp ili kupuuza playlist iliyounganishwa na URL hii.',
      playlistTooltip: 'Hutumia modi ya playlist ya yt-dlp na kuchukua hadi kikomo chako kabla ya kuonyesha kichaguaji.'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'Pata maumbo',
      fetchFormatsTooltip: 'Chagua fomati, manukuu, folda na vipengee vya orodha ya kucheza hatua kwa hatua kabla ya kuongeza kwenye foleni.',
      quickDownload: 'Pakua haraka',
      quickDownloadTooltip: 'Hutumia mapendeleo yako yaliyohifadhiwa au chaguomsingi na kuongeza video hii moja kwenye foleni bila kufungua hatua za usanidi.',
      quickPreparing: 'Inaandaa',
      quickQueued: 'Imeongezwa kwenye foleni',
      quickSingleOnly: 'Pakua haraka ni kwa video moja tu. Tumia Leta fomati kwa orodha za kucheza na vituo.',
      quickProbeFailed: 'Uchunguzi umeshindikana',
      quickPrepareFailed: 'Kipengee cha foleni hakikuweza kuandaliwa',
      quickFailed: 'Haikuweza kuongeza hii: {{error}}',
      features: {
        heading: 'Arroxy inaweza kupakua nini',
        youtube: {
          heading: 'YouTube',
          video: 'Video',
          channel: 'Vituo',
          playlist: 'Playlists',
          short: 'Shorts',
          music: 'Muziki',
          podcast: 'Podcasts'
        },
        anySite: {
          heading: 'Tovuti 2000+',
          video: 'Video',
          videoPlaylist: 'Playlists za video',
          musicPlaylist: 'Playlists za muziki'
        },
        always: {
          heading: 'Daima inapatikana',
          audioOnly: 'Sauti peke yake',
          subtitles: 'Manukuu'
        }
      },
      mascotIdle: 'Nipe kiungo cha YouTube (video au Short) — kisha bonyeza "Pata maumbo" nami nitaanza kazi ✨',
      mascotBusy: 'Inapakua nyuma ya pazia… Ninaweza kufanya mambo mengi kwa wakati mmoja 😎',
      advanced: 'Hali ya juu',
      clearAria: 'Futa URL',
      clipboard: {
        toggle: 'Angalia ubao wa kunakili',
        toggleDescription: 'Jaza sehemu ya URL kiotomatiki unaponakili kiungo cha YouTube.',
        dialog: {
          title: 'YouTube URL imegunduliwa',
          body: 'Tumia kiungo hiki kutoka kwenye ubao wako wa kunakili?',
          useButton: 'Tumia URL',
          disableButton: 'Zima',
          cancelButton: 'Ghairi',
          disableNote: 'Unaweza kuwezesha tena uangalifu wa ubao wa kunakili baadaye katika mipangilio ya Hali ya juu.'
        }
      },
      cookies: {
        sourceLabel: 'Chanzo cha vidakuzi',
        sourceOff: 'Zima',
        sourceFile: 'Faili',
        sourceBrowser: 'Kivinjari',
        toggleDescription: 'Husaidia na video zilizozuiwa kwa umri, za wanachama peke yao, na za akaunti ya kibinafsi.',
        risk: 'Hatari: cookies.txt ina vikao vyote vilivyoingia kwa kivinjari hicho — weka siri.',
        fileLabel: 'Faili ya vidakuzi',
        choose: 'Chagua…',
        clear: 'Futa',
        placeholder: 'Hakuna faili iliyochaguliwa',
        helpLink: 'Ninasafirisha vidakuzi vipi?',
        enabledButNoFile: 'Chagua faili kutumia vidakuzi',
        browserLabel: 'Kivinjari',
        browserPlaceholder: 'Chagua kivinjari…',
        browserHelp: 'Inasoma vidakuzi moja kwa moja kutoka kwenye kivinjari. Kivinjari lazima kifungwe kwa vivinjari vya familia ya Chromium.',
        enabledButNoBrowser: 'Chagua kivinjari kutumia vidakuzi',
        banWarning: 'YouTube inaweza kufunga — na wakati mwingine kupiga marufuku — akaunti ambazo vidakuzi vyake vinatumiwa na yt-dlp. Tumia akaunti ya majaribio iwezekanavyo.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Pata cookies.txt NDANI YA KOMPYUTA (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Peleka trafiki kupitia proksi — muhimu kwa maudhui yenye vizuizi vya kijiografia.',
        placeholder: 'http://host:port',
        clear: 'Futa'
      },
      playlistProbeLimit: {
        label: 'Vipande vya playlist vya kuskanisha',
        description: 'Idadi ya juu ya maingizo ambayo Arroxy hupakia wakati playlist, kituo, au matokeo ya utafutaji yanafunguliwa.',
        option: 'Vipande {{count}}',
        current: 'Kikomo cha sasa: vipande {{count}}',
        customValue: 'Maalum: vipande {{count}}',
        custom: 'Maalum…',
        customDialogTitle: 'Kikomo maalum cha skani ya playlist',
        customDialogDescription: 'Tumia nambari nzima kutoka {{min}} hadi {{max}}.',
        customDialogCancel: 'Ghairi',
        customDialogSave: 'Hifadhi kikomo',
        invalid: 'Tumia nambari nzima kutoka 1 hadi 5000',
        tooltip: 'Inalingana na yt-dlp --playlist-end: Arroxy inauliza idadi hii tu ya maingizo ya playlist, kituo, au utafutaji wakati wa kujenga kichaguzi.'
      },
      singleFilenameId: {
        toggle: 'Ongeza ID ya video kwenye majina ya faili moja moja',
        toggleDescription: 'Huweka upakuaji wa mara moja kuwa wa kipekee wakati vichwa vinabadilika au kugongana.'
      },
      networkPacing: {
        heading: 'Upakuaji wa taratibu',
        description: 'Inaongeza mapumziko madogo wakati wa kila upakuaji ili Arroxy isishambue tovuti. Maadili ni sekunde isipokuwa imetajwa.',
        presetLabel: 'Arroxy iwe makini kiasi gani?',
        tooltip: 'Mapumziko haya hutokea ndani ya kila upakuaji. Arroxy bado inashughulikia vipakuzi vya foleni moja kwa moja.',
        summary: 'Mapumziko: {{requests}} kati ya ukaguzi, {{downloads}} kabla ya media kuanza, {{subtitles}} kabla ya faili za manukuu. Miunganisho: {{fragments}}.',
        presets: {
          off: 'Zima',
          balanced: 'Uwiano',
          careful: 'Uangalifu',
          custom: 'Maalum'
        },
        tooltips: {
          off: 'Inatumia mapumziko madogo ya msingi tu ambayo Arroxy inayashikilia kwa media na manukuu.',
          balanced: 'Chaguo-msingi. Inaongeza mapumziko mafupi na kutumia muunganisho mmoja wa kupakua.',
          careful: 'Inaongeza mapumziko marefu kwa playlists kubwa au mitandao inayofikia vikwazo mara kwa mara.',
          custom: 'Rekebisha mwenyewe udhibiti wa hali ya juu wa kila upakuaji.'
        },
        fields: {
          sleepRequests: 'Pumzika kati ya ukaguzi wa metadata',
          sleepInterval: 'Pumzika kabla ya media kuanza: kiwango cha chini',
          maxSleepInterval: 'Pumzika kabla ya media kuanza: kiwango cha juu',
          sleepSubtitles: 'Pumzika kabla ya faili za manukuu',
          concurrentFragments: 'Miunganisho ya kupakua'
        },
        units: {
          seconds: 'sek',
          threads: 'miunganisho'
        }
      },
      closeToTray: {
        toggle: 'Ficha kwenye tray ukifunga',
        toggleDescription: 'Endelea kupakua nyuma ya pazia baada ya kufunga dirisha.'
      },
      analytics: {
        toggle: 'Tuma takwimu za matumizi zisizo na jina',
        toggleDescription: 'Huhesabu tu uzinduzi wa programu. Hakuna URL, majina ya faili, au data za kibinafsi.'
      },
      limitRate: {
        label: 'Kikomo cha kasi ya kupakua',
        description: 'Dhibiti bandwidth ya vipakuliwa vya media. Udhibiti wa maombi hapa chini mara nyingi una nguvu zaidi.',
        off: 'Imezimwa',
        custom: 'Maalum…',
        customPlaceholder: 'mf. 750K au 1.5M',
        invalid: 'Tumia nambari ikifuatiwa na K au M (mf. 500K, 1.5M)',
        activeWarning: 'Vipakuliwa vinavyoendelea huhifadhi kikomo cha sasa. Sitisha + Endelea ili kutumia mabadiliko.'
      }
    },
    subtitles: {
      autoBadge: 'Otomatiki',
      noLanguages: 'Hakuna manukuu yanayopatikana kwa video hii',
      skip: 'Ruka',
      skipSubs: 'Ruka kwa video hii',
      mascot: 'Chagua sufuri, moja, au mengi — inategemea wewe kabisa ✨',
      searchPlaceholder: 'Tafuta lugha…',
      noMatches: 'Hakuna lugha zinazolingana',
      clearAll: 'Futa yote',
      noSelected: 'Hakuna manukuu yaliyochaguliwa',
      selectedNote_one: 'Manukuu {{count}} yatapakiwa',
      selectedNote_other: 'Manukuu {{count}} yatapakiwa',
      sectionManual: 'Ya mkono',
      sectionAuto: 'Yaliyoundwa otomatiki',
      saveMode: {
        heading: 'Hifadhi kama',
        sidecar: 'Karibu na video',
        embed: 'Ingiza kwenye video',
        subfolder: 'subtitles/ saraka ndogo'
      },
      format: {
        heading: 'Umbizo'
      },
      embedNote: 'Hali ya kuingiza inahifadhi matokeo kama .mkv ili nyimbo za manukuu ziingizwe kwa uaminifu.',
      autoAssNote: 'Maandishi ya otomatiki yatahifadhiwa kama SRT badala ya ASS — husafishwa daima kutokana na urudiaji wa kielelezo cha YouTube, ambao kibadilishaji chetu cha ASS bado hakiwezi kunakili.'
    },
    sponsorblock: {
      modeHeading: 'Uchujaji wa mdhamini',
      mode: {
        off: 'Zima',
        mark: 'Weka alama kama sura',
        remove: 'Ondoa sehemu'
      },
      modeHint: {
        off: 'Hakuna SponsorBlock — video inacheza kama ilivyopakiwa.',
        mark: 'Inaweka alama sehemu za mdhamini kama sura (bila uharibifu).',
        remove: 'Hukata sehemu za mdhamini kutoka kwenye video kwa kutumia FFmpeg.'
      },
      categoriesHeading: 'Kategoria',
      cat: {
        sponsor: 'Mdhamini',
        intro: 'Utangulizi',
        outro: 'Mwisho',
        selfpromo: 'Kujitangaza',
        music_offtopic: 'Music off-topic',
        preview: 'Muhtasari',
        filler: 'Kijazio'
      }
    },
    formats: {
      quickPresets: 'Mipangilio ya haraka',
      video: 'Video',
      audio: 'Sauti',
      noAudio: 'Hakuna sauti',
      videoOnly: 'Video peke yake',
      keepAudio: 'Acha kama ilivyo',
      keepAudioMeta: 'Sauti iliyojengwa ndani',
      audioOnly: 'Sauti peke yake',
      audioOnlyOption: 'Sauti peke yake (bila video)',
      mascot: 'Bora + Bora = ubora wa juu zaidi. Ningechagua hivyo!',
      sniffing: 'Natafuta maumbo bora kwako…',
      loadingHint: 'Tafadhali subiri hadi uchunguzi ukamilike — orodha za kuimba na utafutaji vinaweza kuchukua muda.',
      loadingAria: 'Inapakia maumbo',
      sizeUnknown: 'Ukubwa haujulikani',
      total: 'Jumla',
      skipToConfirm: 'Ruka hadi uthibitisho',
      skipToConfirmTooltip: 'Inatumia mapendeleo yako yaliyohifadhiwa kwa hatua zote zilizobaki. Ili kubadilisha mipangilio, endelea hatua kwa hatua badala yake — chaguo lako litahifadhiwa kwa wakati ujao.',
      convert: {
        label: 'Badilisha',
        uncompressed: 'Badilisha · isiyoshinikizwa',
        bitrate: 'Kiwango cha biti',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Ubadilishaji wa sauti unahitaji hali ya sauti peke yake (ondoa chaguo la video).',
        requiresLossy: 'Mkondo wa asili umechaguliwa — kiwango cha biti kinatumika tu unapobadilisha kuwa mp3, m4a, au opus.'
      },
      botWall: {
        heading: 'YouTube ilipunguza uchunguzi huu',
        bodyUnconfigured: 'Orodha ya maumbo inaweza kuwa haikamilika. Sanidi vidakuzi katika mipangilio ya hali ya juu, au badilisha mtandao na ujaribu tena.',
        bodyDisabled: 'Vidakuzi vimesanidiwa lakini vimezimwa. Viwashe na ujaribu tena kupata orodha kamili, au badilisha mtandao na ujaribu tena.',
        bodyEnabled: 'Hata na vidakuzi, YouTube ilipunguza uchunguzi huu. Jaribu tena baadaye au badilisha mtandao.',
        retryCta: 'Jaribu tena',
        enableRetryCta: 'Washa vidakuzi na ujaribu tena'
      },
      cookiesError: {
        heading: 'Vidakuzi vinaweza kuwa sababu',
        currentModeLabel: 'Chanzo cha vidakuzi',
        currentModeFile: 'Faili',
        currentModeBrowser: 'Kivinjari',
        explanationFile: 'Faili yako ya vidakuzi inaweza kuwa tupu, imeisha muda wake, au iko katika umbizo lisilo sahihi (yt-dlp inategemea Netscape cookies.txt). Jaribu kusafirisha vidakuzi tena, chagua faili tofauti, ubadilishe hadi hali ya Kivinjari, au uzime vidakuzi.',
        explanationBrowser: 'Vidakuzi vinasomwa moja kwa moja kutoka kwenye kivinjari. Ikiwa kivinjari kinaendesha sasa hivi, hifadhidata yake ya vidakuzi inaweza kufungwa (familia ya Chromium). Kivinjari pia lazima kiingie katika YouTube. Jaribu kufunga kivinjari, ubadilishe hadi kivinjari tofauti, ubadilishe hadi hali ya Faili, au uzime vidakuzi.',
        openSettingsCta: 'Fungua mipangilio ya vidakuzi',
        needsCookies: {
          heading: 'Tovuti hii inahitaji kuingia',
          body: 'yt-dlp haikuweza kufikia video hii bila uthibitisho. Sanidi vidakuzi katika mipangilio ya hali ya juu — ielekeza kwenye kivinjari unachoingia tayari, au ingiza faili ya cookies.txt.'
        },
        dpapi: {
          heading: 'Vidakuzi vya Chrome vimezuiwa na usimbaji fiche wa Windows',
          explanation: 'Chrome 127 na toleo jipya zaidi husimba fiche vidakuzi kwa njia ambayo programu nyingine haziwezi kusoma kwenye Windows. Jaribu moja ya masuluhisho yaliyo hapa chini.',
          fixFirefoxLabel: 'Badilisha kwenda Firefox',
          fixFirefoxBody: 'Firefox haitumii App-Bound Encryption. Fungua mipangilio ya vidakuzi na uchague Firefox kutoka kwenye orodha ya vivinjari.',
          fixFileLabel: 'Safirisha cookies.txt',
          fixFileBody: 'Safirisha vidakuzi kutoka Chrome kwa kutumia kiendelezi cha kivinjari, kisha ubadilishe programu hii hadi hali ya Faili na uchague faili iliyosafirishwa.',
          fixUnsafeLabel: 'Zindua Chrome huku App-Bound Encryption imezimwa',
          fixUnsafeBody: 'Ongeza --disable-features=LockProfileCookieDatabase kwenye mkato wa kuzindua Chrome. Onyo: hii inabatilisha vidakuzi vilivyosimbwa fiche hapo awali, kwa hivyo utaondolewa katika kila tovuti na itabidi uingie tena.',
          docsLinkLabel: 'yt-dlp nyaraka (issue #10927)'
        }
      }
    },
    folder: {
      heading: 'Hifadhi kwenye',
      downloads: 'Vipakuliwa',
      videos: 'Sinema',
      desktop: 'Eneo kazi',
      music: 'Muziki',
      documents: 'Hati',
      pictures: 'Picha',
      home: 'Nyumbani',
      custom: 'Maalum…',
      subfolder: {
        toggle: 'Hifadhi ndani ya saraka ndogo',
        placeholder: 'mfano lo-fi rips',
        invalid: 'Jina la saraka lina herufi batili'
      }
    },
    output: {
      embedChapters: {
        label: 'Ingiza sura',
        description: 'Alama za sura zinazoweza kuabiriwa katika kichezaji chochote cha kisasa.'
      },
      embedMetadata: {
        label: 'Ingiza metadata',
        description: 'Kichwa, msanii, maelezo, na tarehe ya kupakia vimeandikwa kwenye faili.'
      },
      embedThumbnail: {
        label: 'Ingiza picha ndogo',
        description: 'Sanaa ya jalada ndani ya faili. Video ya WebM itabadilishwa kuwa MKV; hupitishwa wakati manukuu yanaingizwa.'
      },
      writeDescription: {
        label: 'Hifadhi maelezo',
        description: 'Inahifadhi maelezo ya video kama faili ya maandishi ya .description karibu na kipakuliwa.'
      },
      writeThumbnail: {
        label: 'Hifadhi picha ndogo',
        description: 'Inahifadhi picha ndogo kama faili ya picha ya .jpg karibu na kipakuliwa.'
      },
      writeM3u: {
        label: 'Tengeneza faili ya playlist .m3u',
        description: 'Hifadhi playlist ya .m3u pamoja na video ili zifunguke kwa mpangilio kwenye kicheza media.'
      }
    },
    confirm: {
      readyHeadline: 'Iko tayari kupakua!',
      landIn: 'Faili yako itawekwa kwenye',
      labelVideo: 'Video',
      labelAudio: 'Sauti',
      labelSubtitles: 'Manukuu',
      subtitlesNone: '—',
      labelSaveTo: 'Hifadhi kwenye',
      labelSize: 'Ukubwa',
      sizeUnknown: 'Haijulikani',
      nothingToDownload: 'Mpangilio wa manukuu peke yake umewashwa lakini hakuna lugha ya manukuu iliyochaguliwa — hakuna kitakachopakiwa.',
      thumbnailEmbedNotSupported: 'Thumbnail embed imerukwa — container ya matokeo hauitumii.',
      subtitleEmbedAudioOnly: 'Subtitle embed imebadilishwa kuwa sidecar — nyimbo za sauti hazitumii mtiririko wa manukuu uliowekwa ndani.',
      audioOnly: 'Sauti peke yake',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Inaanza vipakuzi vingine vikishamaliza — inapata upanuzi kamili',
      pullIt: 'Pakua sasa! ↓',
      pullItTooltip: 'Inaanza mara moja — inafanya kazi pamoja na vipakuzi vingine vinavyofanya kazi',
      labelPlaylist: 'Playlist',
      labelPreset: 'Mpangilio',
      labelItems: 'Vipande',
      itemsValue_one: '{{count}} kati ya {{total}} video',
      itemsValue_other: '{{count}} kati ya {{total}} video',
      itemsValueAudio_one: '{{count}} kati ya {{total}} wimbo',
      itemsValueAudio_other: '{{count}} kati ya {{total}} nyimbo'
    }
  },
  videoCard: {
    titlePlaceholder: 'Inapakia…'
  },
  queue: {
    header: 'Foleni ya Kupakua',
    toggleTitle: 'Geuza foleni ya kupakua',
    empty: 'Vipakuzi unavyoweka kwenye foleni vitaonekana hapa',
    noDownloads: 'Hakuna vipakuzi bado.',
    activeCount: '{{count}} inapakua · {{percent}}%',
    clear: 'Futa',
    clearTitle: 'Futa vipakuzi vilivyokamilika',
    pauseAll: 'Simamisha vyote',
    pauseAllTitle: 'Simamisha vipakuzi vyote vinavyoendelea',
    cancelAll: 'Ghairi vyote',
    cancelAllTitle: 'Ghairi vipakuzi vyote vinavyoendelea na vinavyosubiri',
    tip: 'Kipakuliwa chako kimewekwa kwenye foleni hapa chini — fungua wakati wowote kufuatilia maendeleo.',
    item: {
      doneAt: 'Imekamilika {{time}}',
      paused: 'Imesimamishwa',
      defaultError: 'Upakuaji umeshindwa',
      openUrl: 'Fungua URL',
      pause: 'Simamisha',
      hold: 'Simama',
      resume: 'Endelea',
      cancel: 'Ghairi',
      remove: 'Ondoa',
      pullNow: 'Pakua sasa — ruka foleni',
      priorityBadge: 'Kipaumbele',
      statusPending: 'Inasubiri',
      statusRunning: 'Inapakua',
      statusHeld: 'Imeshikiliwa',
      statusPaused: 'Imesitishwa',
      statusDone: 'Imekamilika',
      statusError: 'Hitilafu',
      statusCancelled: 'Imeghairiwa'
    },
    resumeAll: 'Endeleza foleni',
    resumeAllTitle: 'Endeleza vipakuliwa vilivyosimamishwa na ruhusu foleni iendelee',
    limitRate: 'Kasi: {{value}}',
    limitRateOff: 'Kasi: Imezimwa',
    limitRateTitle: 'Kikomo cha bandwidth kwa vipakuliwa'
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'inapatikana',
    youHave: '— una {{currentVersion}}',
    install: 'Sakinisha na Uanzishe Upya',
    downloading: 'Inapakua…',
    download: 'Download ↗',
    dismiss: 'Funga bango la sasisho',
    copy: 'Nakili amri kwenye ubao wa kunakili',
    copied: 'Amri imenakiliwa kwenye ubao wa kunakili',
    installFailed: 'Sasisho limeshindwa',
    retry: 'Jaribu tena'
  },
  status: {
    preparingBinaries: 'Inaandaa faili za binary…',
    mintingToken: 'Inatengeneza tokeni ya YouTube…',
    remintingToken: 'Inatengeneza upya tokeni…',
    startingYtdlp: 'Inaanzisha mchakato wa yt-dlp…',
    downloadingMedia: 'Inapakua video na sauti…',
    mergingFormats: 'Inachanganya sauti na video…',
    extractingAudio: 'Inabadilisha sauti…',
    convertingVideo: 'Inabadilisha video…',
    embeddingMetadata: 'Inaingiza metadata…',
    movingFiles: 'Inahamisha faili…',
    fetchingSubtitles: 'Inapata manukuu…',
    sleepingBetweenRequests: 'Inasubiri sekunde {{seconds}} kuepuka vikwazo vya kiwango…',
    subtitlesFailed: 'Video imehifadhiwa — baadhi ya manukuu hayakuweza kupakuliwa',
    cancelled: 'Upakuaji umeghairiwa',
    complete: 'Upakuaji umekamilika',
    usedExtractorFallback: 'Imepakiwa kwa kiboreshaji laini — weka cookies.txt kwa upakuaji wa kuaminika zaidi',
    ytdlpProcessError: 'Hitilafu ya mchakato wa yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp ilitoka na msimbo {{code}}',
    downloadingBinary: 'Inapakua binary ya {{name}}…',
    unknownStartupFailure: 'Kushindwa kwa kuanzisha pasijulikane',
    diskSpaceInsufficient: 'Nafasi ya diski haitoshi — inahitajika {{required}}, {{free}} tu inapatikana',
    fetchingSponsorBlock: 'Inawasiliana na SponsorBlock…',
    retryingSponsorBlock: 'SponsorBlock haipatikani, inajaribu tena ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'Ulinzi wa boti umeanzishwa. IP unayotumia ina uwezekano mkubwa wa kuwa imepigwa alama (anuwai ya kituo cha data au mlango wa VPN wenye msongamano). Badilisha IP yako au chagua seva nyingine ya VPN na ujaribu tena. Ikiwa itaendelea kushindwa, hii inaweza kuwa mabadiliko ya muda ya upande wa YouTube — Arroxy inasasisha yt-dlp kiotomatiki wakati wa uzinduzi, kwa hivyo marekebisho yatafika kiotomatiki mara chanzo kikitoa sasisho.',
      ipBlock: 'Anwani yako ya IP inaonekana kuzuiwa na YouTube. Jaribu tena baadaye au tumia VPN.',
      rateLimit: 'YouTube inazuia maombi. Subiri dakika moja kisha ujaribu tena.',
      ageRestricted: 'Video hii ina kikwazo cha umri na haiwezi kupakuliwa bila akaunti iliyoingia.',
      unavailable: 'Video hii haipatikani — inaweza kuwa ya kibinafsi, imefutwa, au imezuiwa kwa mkoa.',
      geoBlocked: 'Video hii haipatikani katika eneo lako.',
      outOfDiskSpace: 'Nafasi ya diski haitoshi. Futa nafasi na ujaribu tena.',
      unsupportedUrl: 'Hii haionekani kama URL ya video. Bandika kiungo cha video ya YouTube, Short, au playlist.',
      chunkTransferFailure: 'Seva ilikatiza upakuaji mara kwa mara na yt-dlp ilikata tamaa baada ya kujaribu tena. Hii hutokea zaidi kwa muundo mkubwa wa video (4K HDR / VP9 ya bitrate ya juu). Jaribu tena, badilisha mtandao/VPN, au chagua muundo wa ubora wa chini.',
      postprocessFailure: 'yt-dlp ilimaliza kupakua lakini uchakataji wa baadaye (kuunganisha / mux / kubadilisha) ulishindwa. Mara nyingi hili ni tatizo la muda la ffmpeg — jaribu tena, na ikiendelea, jaribu mchanganyiko tofauti wa muundo.',
      parse: 'Haikuwezekana kuchanganua jibu kutoka tovuti. Kichanganuzi cha yt-dlp kinaweza kuwa kimepitwa na wakati. Arroxy huboresha yt-dlp kiotomatiki wakati wa uzinduzi — jaribu tena baada ya dakika chache marekebisho yatakapowasili.',
      network: 'Hitilafu ya mtandao. Angalia muunganisho wako na ujaribu tena.',
      drmProtected: 'Video hii inalindwa na DRM. yt-dlp haiwezi kuondoa DRM, kwa hivyo faili haiwezi kupakuliwa.',
      loginRequired: 'Video hii inahitaji akaunti iliyoingia. Sanidi cookies.txt (Mipangilio → Cookies) na ujaribu tena.',
      unknown: 'Upakuaji umeshindwa. Tazama matokeo ghafi hapa chini.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Ubora bora',
      desc: 'Azimio la juu zaidi + sauti bora'
    },
    balanced: {
      label: 'Uwiano',
      desc: '720p kiwango cha juu + sauti nzuri'
    },
    'audio-only': {
      label: 'Sauti peke yake',
      desc: 'Hakuna video, sauti bora'
    },
    'small-file': {
      label: 'Faili ndogo',
      desc: 'Azimio la chini + sauti ya chini'
    },
    'subtitle-only': {
      label: 'Manukuu peke yake',
      desc: 'Hakuna video, hakuna sauti, manukuu peke yake'
    }
  },
  playlistPresets: {
    type: { video: 'Video', audio: 'Audio' },
    videoFormat: {
      best: 'Best codec',
      mp4: 'MP4 (H.264)'
    },
    videoFormatDesc: {
      best: 'Kodeki bora inayopatikana kwa kila kipengee',
      mp4: 'H.264 + AAC inapendelewa, kontena MP4 · juhudi bora'
    },
    tier: {
      best: 'Best quality',
      '2160': 'Hadi 4K',
      '1440': 'Hadi 1440p',
      '1080': 'Hadi 1080p',
      '720': 'Hadi 720p',
      '480': 'Hadi 480p',
      '360': 'Hadi 360p'
    },
    tierDesc: {
      best: 'Video + sauti bora inayopatikana kwa kila kipengee',
      '2160': 'Imepunguzwa hadi 2160p, hushuka kwa kila kipengee ikihitajika',
      '1440': 'Imepunguzwa hadi 2K, hushuka kwa kila kipengee ikihitajika',
      '1080': 'Imepunguzwa hadi 1080p, hushuka kwa kila kipengee ikihitajika',
      '720': 'Faili ndogo, upatanifu mpana',
      '480': 'Low bandwidth',
      '360': 'Smallest video'
    },
    audioFormat: {
      best: 'Audio (best)',
      mp3: 'MP3',
      m4a: 'M4A',
      opus: 'Opus'
    },
    audioFormatDesc: {
      best: 'Sauti bora asilia, bila kusimba upya',
      mp3: 'Geuza kuwa MP3',
      m4a: 'Geuza kuwa M4A (AAC)',
      opus: 'Geuza kuwa Opus'
    },
    audioFormatBitrate: 'Audio ({{format}} {{kbps}}K)',
    mp4Cap: 'H.264 zaidi ya 1080p haipatikani YouTube — hupunguzwa kiotomatiki hadi 1080p'
  },
  formatLabel: {
    audioFallback: 'Sauti',
    audioOnlyDot: 'Sauti peke yake · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Tulivu',
      statusActive_one: '1 inapakua · {{percent}}%',
      statusActive_other: '{{count}} zinapakua · {{percent}}%',
      open: 'Fungua Arroxy',
      quit: 'Funga Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: 'Upakuaji {{count}} unaendelea',
      message_other: 'Vipakuzi {{count}} vinavyoendelea',
      detail: 'Kufunga kutafuta vipakuzi vyote vinavyofanya kazi.',
      confirm: 'Ghairi Vipakuzi na Toka',
      keep: 'Endelea Kupakua',
      pause: 'Sitisha vipakuliwa na uondoke'
    },
    closeToTray: {
      message: 'Ficha Arroxy kwenye tray ya mfumo ukifunga?',
      detail: 'Arroxy inaendelea kufanya kazi na kukamilisha vipakuzi vinavyofanya kazi. Badilisha hii baadaye katika mipangilio ya Hali ya juu.',
      hide: 'Ficha kwenye tray',
      quit: 'Toka',
      remember: 'Usiulize tena'
    },
    rendererCrashed: {
      message: 'Arroxy imekutana na tatizo',
      detail: 'Mchakato wa uonyeshaji umeanguka ({{reason}}). Pakia upya ujaribu tena.',
      reload: 'Pakia upya',
      quit: 'Toka'
    }
  },
  share: {
    title: 'Shiriki Arroxy',
    description: 'Arroxy ni ya bure na chanzo wazi. Kushiriki husaidia watu wengi zaidi kuigundua.',
    copyLink: 'Nakili kiungo',
    copied: 'Imenakiliwa!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Shiriki Arroxy',
    footerLabel: 'Shiriki',
    shareAction: 'Shiriki Arroxy',
    inlineCard: {
      body: 'Unafurahia Arroxy? Shiriki na mtu anayeweza kuifaidika.',
      dismiss: 'Funga pendekezo la kushiriki'
    },
    highValueBanner: {
      body: 'Unafurahia Arroxy? Saidia wengine kuigundua.',
      dismiss: 'Funga pendekezo la kushiriki'
    }
  }
} as const;

export default sw;
