const el = {
  common: {
    back: 'Πίσω',
    continue: 'Συνέχεια',
    retry: 'Επανάληψη',
    startOver: 'Επανεκκίνηση'
  },
  app: {
    feedback: 'Σχόλια',
    logs: 'Αρχεία καταγραφής',
    feedbackNudge: 'Σου αρέσει το Arroxy; Θα χαρώ να ακούσω τη γνώμη σου! 💬',
    debugCopied: 'Αντιγράφηκε!',
    debugCopyTitle: 'Αντιγραφή πληροφοριών εντοπισμού σφαλμάτων (Electron, ΛΣ, εκδόσεις Chrome)',
    zoomIn: 'Μεγέθυνση',
    zoomOut: 'Σμίκρυνση'
  },
  about: {
    button: 'Σχετικά',
    openTitle: 'Σχετικά με το Arroxy',
    tagline: 'Γρήγορο και φιλικό πρόγραμμα λήψης βίντεο και ήχου για υπολογιστή.',
    websiteLink: 'Ιστότοπος',
    githubLink: 'GitHub',
    licenseLine: 'Άδεια MIT · από Antonio Orionus',
    thirdPartyNotices: 'Προβολή ανακοινώσεων τρίτων'
  },
  titleBar: {
    close: 'Κλείσιμο',
    minimize: 'Ελαχιστοποίηση',
    maximize: 'Μεγιστοποίηση',
    restore: 'Επαναφορά'
  },
  splash: {
    greeting: 'Καλώς ήρθες πάλι!',
    warmup: 'Το Arroxy ξεκινά…',
    downloading: 'Λήψη {{binary}}…',
    warmupFailedNoDiag: 'Η ρύθμιση απέτυχε. Άνοιξε το αρχείο καταγραφής ρύθμισης για λεπτομέρειες.'
  },
  repair: {
    title: 'Η ρύθμιση χρειάζεται τη βοήθειά σου',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'Δεν ήταν δυνατή η επαλήθευση.',
      downloadFailed: 'Η λήψη απέτυχε. Έλεγξε τη σύνδεσή σου στο διαδίκτυο και δοκίμασε ξανά.',
      extractFailed: 'Η εξαγωγή αρχείου απέτυχε. Η λήψη μπορεί να είναι κατεστραμμένη — δοκίμασε ξανά.',
      hashFailed: 'Αναντιστοιχία αθροίσματος ελέγχου του ληφθέντος αρχείου. Επανέλαβε τη λήψη.',
      spawnFailed: 'Το αρχείο λείπει ή δεν μπόρεσε να εκκινηθεί. Επέλεξε ένα λειτουργικό αντίγραφο.',
      permissionDenied: 'Το σύστημα αρνήθηκε να εκτελέσει το αρχείο. Επέλεξε ένα αξιόπιστο αντίγραφο ή δοκίμασε ξανά ως διαχειριστής.',
      blockedOrQuarantined: 'Τα Windows απέκλεισαν το αρχείο (SmartScreen / Defender). Επέλεξε εγκατεστημένο αντίγραφο ή προσθέστε τον φάκελο εκτέλεσης στη λίστα εξαιρέσεων.',
      badExitCode: 'Το δυαδικό αρχείο δεν ανταποκρίθηκε στο --version. Μπορεί να είναι κατεστραμμένο ή λανθασμένη έκδοση.',
      timeout: 'Η διερεύνηση έκδοσης έληξε. Το αρχείο μπορεί να είναι κολλημένο — δοκίμασε ξανά.',
      pairIncomplete: 'Τα ffmpeg και ffprobe πρέπει να οριστούν ως ταιριαστό ζεύγος.'
    },
    actions: {
      chooseExecutable: 'Επιλογή εκτελέσιμου',
      resetToDefault: 'Επαναφορά στις προεπιλογές',
      retrySetup: 'Επανάληψη ρύθμισης',
      cancel: 'Ακύρωση',
      openDependencyFolder: 'Άνοιγμα φακέλου εξαρτήσεων',
      viewSetupLog: 'Προβολή αρχείου καταγραφής ρύθμισης'
    }
  },
  theme: {
    light: 'Ανοιχτόχρωμη εμφάνιση',
    dark: 'Σκούρα εμφάνιση',
    system: 'Προεπιλογή συστήματος'
  },
  language: {
    label: 'Γλώσσα'
  },
  wizard: {
    steps: {
      url: 'URL',
      playlistItems: 'Playlist',
      playlistPresets: 'Ποιότητα',
      formats: 'Μορφή',
      subtitles: 'Υπότιτλοι',
      sponsorblock: 'SponsorBlock',
      output: 'Έξοδος',
      folder: 'Αποθήκευση',
      confirm: 'Επιβεβαίωση'
    },
    playlist: {
      heading: 'Στοιχεία playlist',
      itemCount_one: '{{count}} βίντεο',
      itemCount_other: '{{count}} βίντεο',
      itemCountAudio_one: '{{count}} κομμάτι',
      itemCountAudio_other: '{{count}} κομμάτια',
      selectAll: 'Επιλογή όλων',
      selectNone: 'Αποεπιλογή όλων',
      rangeFrom: 'Από',
      rangeTo: 'Έως',
      rangeApply: 'Εφαρμογή εύρους',
      selectedCount_one: '{{count}} επιλεγμένο',
      selectedCount_other: '{{count}} επιλεγμένα',
      noSelection: 'Επέλεξε τουλάχιστον ένα βίντεο για να συνεχίσεις',
      loadingItems: 'Φόρτωση playlist…',
      thumbnailAlt: 'Μικρογραφία βίντεο',
      durationUnknown: 'live'
    },
    playlistPresets: {
      heading: 'Επιλογή ποιότητας για την ομαδική λήψη',
      subhead: 'Κάθε βίντεο επιλύει το επιλεγμένο επίπεδο ανεξάρτητα — οι ανομοιογενείς playlist λειτουργούν χωρίς εκπλήξεις.',
      itemCount_one: '{{count}} στοιχείο',
      itemCount_other: '{{count}} στοιχεία'
    },
    mixedPrompt: {
      title: 'Αυτός ο σύνδεσμος έχει playlist',
      body: 'Θέλεις μόνο το βίντεο που έκανες κλικ, ή να επιλέξεις από την playlist; Θα διαλέξεις συγκεκριμένα βίντεο ή εύρος στη συνέχεια.',
      singleVideo: 'Μόνο αυτό',
      pickFromPlaylist: 'Επιλογή από την playlist'
    },

    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'Φόρτωση μορφών',
      features: {
        heading: 'Τι μπορεί να κατεβάσει το Arroxy',
        youtube: {
          heading: 'YouTube',
          video: 'Βίντεο',
          channel: 'Κανάλια',
          playlist: 'Playlist',
          short: 'Shorts',
          music: 'Μουσική',
          podcast: 'Podcast'
        },
        anySite: {
          heading: '2000+ ιστότοποι',
          video: 'Βίντεο',
          videoPlaylist: 'Playlist βίντεο',
          musicPlaylist: 'Playlist μουσικής'
        },
        always: {
          heading: 'Πάντα διαθέσιμο',
          audioOnly: 'Μόνο ήχοι',
          subtitles: 'Υπότιτλοι'
        }
      },
      mascotIdle: 'Ρίξε μου έναν σύνδεσμο YouTube (βίντεο ή Short) — μετά πάτα «Φόρτωση μορφών» ✨',
      mascotBusy: 'Λήψη στο παρασκήνιο… Ξέρω να κάνω πολλά μαζί 😎',
      advanced: 'Για προχωρημένους',
      clearAria: 'Εκκαθάριση URL',
      clipboard: {
        toggle: 'Παρακολούθηση πρόχειρου',
        toggleDescription: 'Αυτόματη συμπλήρωση του πεδίου URL όταν αντιγράφεις σύνδεσμο YouTube.',
        dialog: {
          title: 'Εντοπίστηκε YouTube URL',
          body: 'Να χρησιμοποιηθεί αυτός ο σύνδεσμος από το πρόχειρο;',
          useButton: 'Χρήση URL',
          disableButton: 'Απενεργοποίηση',
          cancelButton: 'Ακύρωση',
          disableNote: 'Μπορείς να επανενεργοποιήσεις την παρακολούθηση πρόχειρου αργότερα στις Ρυθμίσεις για προχωρημένους.'
        }
      },
      cookies: {
        sourceLabel: 'Πηγή cookies',
        sourceOff: 'Απενεργοποιημένο',
        sourceFile: 'Αρχείο',
        sourceBrowser: 'Πρόγραμμα περιήγησης',
        toggleDescription: 'Βοηθά με βίντεο με περιορισμό ηλικίας, μόνο για μέλη και ιδιωτικά.',
        risk: 'Κίνδυνος: το cookies.txt περιέχει κάθε συνδεδεμένη συνεδρία του προγράμματος περιήγησης — κράτα το ιδιωτικό.',
        fileLabel: 'Αρχείο cookies',
        choose: 'Επιλογή…',
        clear: 'Εκκαθάριση',
        placeholder: 'Δεν έχει επιλεγεί αρχείο',
        helpLink: 'Πώς εξάγω τα cookies;',
        enabledButNoFile: 'Επέλεξε αρχείο για χρήση cookies',
        browserLabel: 'Πρόγραμμα περιήγησης',
        browserPlaceholder: 'Επέλεξε πρόγραμμα περιήγησης…',
        browserHelp: 'Διαβάζει cookies απευθείας από το πρόγραμμα περιήγησης. Για προγράμματα της οικογένειας Chromium, το πρόγραμμα πρέπει να είναι κλειστό.',
        enabledButNoBrowser: 'Επέλεξε πρόγραμμα περιήγησης για χρήση cookies',
        banWarning: 'Το YouTube μπορεί να επισημάνει — και μερικές φορές να αποκλείσει — λογαριασμούς των οποίων τα cookies χρησιμοποιούνται από το yt-dlp. Χρησιμοποίησε έναν εφεδρικό λογαριασμό αν είναι δυνατόν.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Λήψη cookies.txt ΤΟΠΙΚΑ (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Δρομολόγηση κίνησης μέσω proxy — χρήσιμο για περιεχόμενο με γεωγραφικούς περιορισμούς.',
        placeholder: 'http://host:port',
        clear: 'Εκκαθάριση'
      },
      closeToTray: {
        toggle: 'Απόκρυψη στο δίσκο κατά το κλείσιμο',
        toggleDescription: 'Συνέχιση λήψεων στο παρασκήνιο μετά το κλείσιμο του παραθύρου.'
      },
      analytics: {
        toggle: 'Αποστολή ανώνυμων στατιστικών χρήσης',
        toggleDescription: 'Μετράει μόνο εκκινήσεις εφαρμογής. Χωρίς URL, ονόματα αρχείων ή προσωπικά δεδομένα.'
      }
    },
    subtitles: {
      autoBadge: 'Αυτόματο',
      noLanguages: 'Δεν υπάρχουν υπότιτλοι για αυτό το βίντεο',
      skip: 'Παράλειψη',
      skipSubs: 'Παράλειψη για αυτό το βίντεο',
      mascot: 'Επέλεξε μηδέν, έναν ή πολλούς — εξαρτάται από σένα ✨',
      searchPlaceholder: 'Αναζήτηση γλωσσών…',
      noMatches: 'Δεν βρέθηκαν γλώσσες',
      clearAll: 'Εκκαθάριση όλων',
      noSelected: 'Δεν έχουν επιλεγεί υπότιτλοι',
      selectedNote_one: 'Θα ληφθεί {{count}} υπότιτλος',
      selectedNote_other: 'Θα ληφθούν {{count}} υπότιτλοι',
      sectionManual: 'Χειροκίνητο',
      sectionAuto: 'Αυτόματα δημιουργημένο',
      saveMode: {
        heading: 'Αποθήκευση ως',
        sidecar: 'Δίπλα στο βίντεο',
        embed: 'Ενσωμάτωση στο βίντεο',
        subfolder: 'subtitles/ υποφάκελος'
      },
      format: {
        heading: 'Μορφή'
      },
      embedNote: 'Η λειτουργία ενσωμάτωσης αποθηκεύει την έξοδο ως .mkv ώστε τα κομμάτια υποτίτλων να ενσωματώνονται αξιόπιστα.',
      autoAssNote: 'Οι αυτόματοι υπότιτλοι θα αποθηκευτούν ως SRT αντί για ASS — καθαρίζονται πάντα από τα επαναλαμβανόμενα cue του YouTube, τα οποία ο μετατροπέας ASS δεν μπορεί ακόμα να αναπαράγει.'
    },
    sponsorblock: {
      modeHeading: 'Φιλτράρισμα χορηγών',
      mode: {
        off: 'Απενεργοποιημένο',
        mark: 'Σήμανση ως κεφάλαια',
        remove: 'Αφαίρεση τμημάτων'
      },
      modeHint: {
        off: 'Χωρίς SponsorBlock — το βίντεο παίζει όπως ανέβηκε.',
        mark: 'Σημαίνει τα τμήματα χορηγών ως κεφάλαια (μη καταστροφικό).',
        remove: 'Αφαιρεί τμήματα χορηγών από το βίντεο χρησιμοποιώντας FFmpeg.'
      },
      categoriesHeading: 'Κατηγορίες',
      cat: {
        sponsor: 'Sponsor',
        intro: 'Intro',
        outro: 'Outro',
        selfpromo: 'Self-promo',
        music_offtopic: 'Music off-topic',
        preview: 'Preview',
        filler: 'Filler'
      }
    },
    formats: {
      quickPresets: 'Γρήγορες προεπιλογές',
      video: 'Βίντεο',
      audio: 'Ήχος',
      noAudio: 'Χωρίς ήχο',
      videoOnly: 'Μόνο βίντεο',
      audioOnly: 'Μόνο ήχος',
      audioOnlyOption: 'Μόνο ήχος (χωρίς βίντεο)',
      mascot: 'Καλύτερο + Καλύτερο = μέγιστη ποιότητα. Αυτό θα διάλεγα!',
      sniffing: 'Ανακαλύπτω τις καλύτερες μορφές για σένα…',
      loadingHint: 'Περίμενε μέχρι να ολοκληρωθεί η ανίχνευση — οι playlist και οι αναζητήσεις μπορεί να πάρουν λίγη ώρα.',
      loadingAria: 'Φόρτωση μορφών',
      sizeUnknown: 'Άγνωστο μέγεθος',
      skipToConfirm: 'Μετάβαση στην επιβεβαίωση',
      skipToConfirmTooltip: 'Χρησιμοποιεί τις αποθηκευμένες προτιμήσεις σας για όλα τα υπόλοιπα βήματα. Για να αλλάξετε μια ρύθμιση, συνεχίστε βήμα προς βήμα — η επιλογή σας θα αποθηκευτεί για την επόμενη φορά.',
      total: 'Σύνολο',
      keepAudio: 'Διατήρηση ως έχει',
      keepAudioMeta: 'Ενσωματωμένος ήχος',
      convert: {
        label: 'Μετατροπή',
        uncompressed: 'Μετατροπή · αμετάβλητο',
        bitrate: 'Ρυθμός bit',
        wavLabel: 'WAV (αμετάβλητο)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Η μετατροπή ήχου απαιτεί λειτουργία μόνο ήχου (αποεπίλεξε το βίντεο).',
        requiresLossy: 'Επιλέχθηκε εγγενής ροή — ο ρυθμός bit ισχύει μόνο κατά τη μετατροπή σε mp3, m4a ή opus.'
      },
      botWall: {
        heading: 'Το YouTube περιόρισε αυτή την ανίχνευση',
        bodyUnconfigured: 'Η λίστα μορφών μπορεί να είναι ελλιπής. Ρύθμισε cookies στις ρυθμίσεις για προχωρημένους, ή άλλαξε δίκτυο και δοκίμασε ξανά.',
        bodyDisabled: 'Τα cookies είναι ρυθμισμένα αλλά απενεργοποιημένα. Ενεργοποίησέ τα και δοκίμασε ξανά για πλήρη λίστα, ή άλλαξε δίκτυο.',
        bodyEnabled: 'Ακόμα και με cookies, το YouTube περιόρισε αυτή την ανίχνευση. Δοκίμασε αργότερα ή άλλαξε δίκτυο.',
        retryCta: 'Επανάληψη',
        enableRetryCta: 'Ενεργοποίηση cookies και επανάληψη'
      },
      cookiesError: {
        heading: 'Τα cookies μπορεί να φταίνε',
        currentModeLabel: 'Πηγή cookies',
        currentModeFile: 'Αρχείο',
        currentModeBrowser: 'Πρόγραμμα περιήγησης',
        explanationFile: 'Το αρχείο cookies μπορεί να είναι κενό, ληγμένο ή σε λάθος μορφή (το yt-dlp αναμένει Netscape cookies.txt). Δοκίμασε να εξάγεις ξανά τα cookies, να επιλέξεις διαφορετικό αρχείο, να μεταβείς σε λειτουργία προγράμματος περιήγησης ή να απενεργοποιήσεις τα cookies.',
        explanationBrowser: 'Τα cookies διαβάζονται απευθείας από το πρόγραμμα περιήγησης. Αν τρέχει αυτή τη στιγμή, η βάση δεδομένων cookies μπορεί να είναι κλειδωμένη (οικογένεια Chromium). Το πρόγραμμα περιήγησης πρέπει επίσης να είναι συνδεδεμένο στο YouTube. Δοκίμασε να το κλείσεις, να χρησιμοποιήσεις διαφορετικό πρόγραμμα, να μεταβείς σε λειτουργία αρχείου ή να απενεργοποιήσεις τα cookies.',
        openSettingsCta: 'Άνοιγμα ρυθμίσεων cookies',
        needsCookies: {
          heading: 'Αυτός ο ιστότοπος απαιτεί σύνδεση',
          body: 'Το yt-dlp δεν μπόρεσε να αποκτήσει πρόσβαση σε αυτό το βίντεο χωρίς έλεγχο ταυτότητας. Ρύθμισε τα cookies στις ρυθμίσεις για προχωρημένους — επίλεξε πρόγραμμα περιήγησης στο οποίο είσαι ήδη συνδεδεμένος, ή εισήγαγε αρχείο cookies.txt.'
        },
        dpapi: {
          heading: 'Τα cookies του Chrome αποκλείστηκαν από την κρυπτογράφηση των Windows',
          explanation: 'Το Chrome 127 και νεότερες εκδόσεις κρυπτογραφούν τα cookies με τρόπο που άλλες εφαρμογές δεν μπορούν να διαβάσουν στα Windows. Δοκίμασε μία από τις παρακάτω λύσεις.',
          fixFirefoxLabel: 'Μετάβαση στο Firefox',
          fixFirefoxBody: 'Το Firefox δεν χρησιμοποιεί App-Bound Encryption. Άνοιξε τις ρυθμίσεις cookies και επέλεξε Firefox από τη λίστα προγραμμάτων περιήγησης.',
          fixFileLabel: 'Εξαγωγή cookies.txt',
          fixFileBody: 'Εξήγαγε τα cookies από το Chrome με ένα επέκταση προγράμματος περιήγησης, μετά άλλαξε αυτή την εφαρμογή σε λειτουργία Αρχείο και επέλεξε το εξαχθέν αρχείο.',
          fixUnsafeLabel: 'Εκκίνηση Chrome με απενεργοποιημένο App-Bound Encryption',
          fixUnsafeBody: 'Πρόσθεσε --disable-features=LockProfileCookieDatabase στη συντόμευση εκκίνησης του Chrome. Προειδοποίηση: αυτό ακυρώνει τα προηγουμένως κρυπτογραφημένα cookies, οπότε θα αποσυνδεθείς από κάθε ιστότοπο και θα χρειαστεί να συνδεθείς ξανά.',
          docsLinkLabel: 'yt-dlp τεκμηρίωση (ζήτημα #10927)'
        }
      }
    },
    folder: {
      heading: 'Αποθήκευση σε',
      downloads: 'Λήψεις',
      videos: 'Ταινίες',
      desktop: 'Επιφάνεια εργασίας',
      music: 'Μουσική',
      documents: 'Έγγραφα',
      pictures: 'Εικόνες',
      home: 'Αρχική',
      custom: 'Προσαρμοσμένο…',
      subfolder: {
        toggle: 'Αποθήκευση σε υποφάκελο',
        placeholder: 'π.χ. lo-fi rips',
        invalid: 'Το όνομα φακέλου περιέχει μη έγκυρους χαρακτήρες'
      }
    },
    output: {
      embedChapters: {
        label: 'Ενσωμάτωση κεφαλαίων',
        description: 'Δείκτες κεφαλαίων πλοηγήσιμοι σε κάθε σύγχρονο πρόγραμμα αναπαραγωγής.'
      },
      embedMetadata: {
        label: 'Ενσωμάτωση μεταδεδομένων',
        description: 'Τίτλος, καλλιτέχνης, περιγραφή και ημερομηνία ανάρτησης εγγράφονται στο αρχείο.'
      },
      embedThumbnail: {
        label: 'Ενσωμάτωση μικρογραφίας',
        description: 'Εξώφυλλο εντός του αρχείου. Το βίντεο WebM θα μετατραπεί σε MKV· παραλείπεται όταν ενσωματώνονται υπότιτλοι.'
      },
      writeDescription: {
        label: 'Αποθήκευση περιγραφής',
        description: 'Αποθηκεύει την περιγραφή του βίντεο ως αρχείο κειμένου .description δίπλα στη λήψη.'
      },
      writeThumbnail: {
        label: 'Αποθήκευση μικρογραφίας',
        description: 'Αποθηκεύει τη μικρογραφία ως αρχείο εικόνας .jpg δίπλα στη λήψη.'
      }
    },
    confirm: {
      readyHeadline: 'Έτοιμο για λήψη!',
      landIn: 'Το αρχείο σου θα αποθηκευτεί στο',
      labelVideo: 'Βίντεο',
      labelAudio: 'Ήχος',
      labelSubtitles: 'Υπότιτλοι',
      subtitlesNone: '—',
      labelSaveTo: 'Αποθήκευση σε',
      labelSize: 'Μέγεθος',
      sizeUnknown: 'Άγνωστο',
      nothingToDownload: 'Η προεπιλογή «μόνο υπότιτλοι» είναι ενεργή αλλά δεν έχει επιλεγεί γλώσσα — τίποτα δεν θα ληφθεί.',
      thumbnailEmbedNotSupported: 'Το Thumbnail embed παραλείφθηκε — το container εξόδου δεν το υποστηρίζει.',
      subtitleEmbedAudioOnly: 'Το embed υποτίτλων άλλαξε σε sidecar — τα κομμάτια ήχου δεν υποστηρίζουν ενσωματωμένες ροές υποτίτλων.',
      audioOnly: 'Μόνο ήχος',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Ξεκινά όταν ολοκληρωθούν άλλες λήψεις — αποκτά πλήρες εύρος ζώνης',
      pullIt: 'Κατέβασέ το! ↓',
      pullItTooltip: 'Ξεκινά αμέσως — εκτελείται παράλληλα με άλλες ενεργές λήψεις',
      labelPlaylist: 'Playlist',
      labelPreset: 'Προεπιλογή',
      labelItems: 'Στοιχεία',
      itemsValue_one: '{{count}} από {{total}} βίντεο',
      itemsValue_other: '{{count}} από {{total}} βίντεο',
      itemsValueAudio_one: '{{count}} από {{total}} κομμάτι',
      itemsValueAudio_other: '{{count}} από {{total}} κομμάτια'
    }
  },
  videoCard: {
    titlePlaceholder: 'Φόρτωση…'
  },
  queue: {
    header: 'Ουρά λήψεων',
    toggleTitle: 'Εναλλαγή ουράς λήψεων',
    empty: 'Οι λήψεις που θα προσθέσεις στην ουρά θα εμφανιστούν εδώ',
    noDownloads: 'Δεν υπάρχουν ακόμη λήψεις.',
    activeCount: '{{count}} σε λήψη · {{percent}}%',
    clear: 'Εκκαθάριση',
    clearTitle: 'Εκκαθάριση ολοκληρωμένων λήψεων',
    pauseAll: 'Παύση όλων',
    pauseAllTitle: 'Παύση όλων των ενεργών λήψεων',
    cancelAll: 'Ακύρωση όλων',
    cancelAllTitle: 'Ακύρωση όλων των ενεργών και εκκρεμών λήψεων',
    tip: 'Η λήψη σου βρίσκεται στην ουρά παρακάτω — άνοιξέ την οποιαδήποτε στιγμή για παρακολούθηση προόδου.',
    item: {
      doneAt: 'Ολοκληρώθηκε {{time}}',
      paused: 'Σε παύση',
      defaultError: 'Αποτυχία λήψης',
      openUrl: 'Άνοιγμα URL',
      pause: 'Παύση',
      hold: 'Αναμονή',
      resume: 'Συνέχεια',
      cancel: 'Ακύρωση',
      remove: 'Κατάργηση'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'είναι διαθέσιμο',
    youHave: '— έχεις {{currentVersion}}',
    install: 'Εγκατάσταση & Επανεκκίνηση',
    downloading: 'Λήψη…',
    download: 'Download ↗',
    dismiss: 'Απόρριψη ειδοποίησης ενημέρωσης',
    copy: 'Αντιγραφή εντολής στο πρόχειρο',
    copied: 'Η εντολή αντιγράφηκε στο πρόχειρο',
    installFailed: 'Η ενημέρωση απέτυχε',
    retry: 'Επανάληψη'
  },
  status: {
    preparingBinaries: 'Προετοιμασία δυαδικών…',
    mintingToken: 'Δημιουργία YouTube token…',
    remintingToken: 'Αναδημιουργία token…',
    startingYtdlp: 'Εκκίνηση διαδικασίας yt-dlp…',
    downloadingMedia: 'Λήψη βίντεο και ήχου…',
    mergingFormats: 'Συγχώνευση ήχου και βίντεο…',
    extractingAudio: 'Μετατροπή ήχου…',
    convertingVideo: 'Μετατροπή βίντεο…',
    embeddingMetadata: 'Ενσωμάτωση μεταδεδομένων…',
    movingFiles: 'Μετακίνηση αρχείων…',
    fetchingSubtitles: 'Λήψη υποτίτλων…',
    sleepingBetweenRequests: 'Αναμονή {{seconds}} δευτ. για αποφυγή περιορισμών ρυθμού…',
    subtitlesFailed: 'Το βίντεο αποθηκεύτηκε — ορισμένοι υπότιτλοι δεν κατέβηκαν',
    cancelled: 'Η λήψη ακυρώθηκε',
    complete: 'Η λήψη ολοκληρώθηκε',
    usedExtractorFallback: 'Λήψη με χαλαρό extractor — ρύθμισε cookies.txt για πιο αξιόπιστες λήψεις',
    ytdlpProcessError: 'Σφάλμα διαδικασίας yt-dlp: {{error}}',
    ytdlpExitCode: 'Το yt-dlp έγινε έξοδος με κωδικό {{code}}',
    downloadingBinary: 'Λήψη δυαδικού {{name}}…',
    unknownStartupFailure: 'Άγνωστη αποτυχία εκκίνησης λήψης',
    diskSpaceInsufficient: 'Ανεπαρκής χώρος δίσκου — απαιτούνται {{required}}, διαθέσιμα μόνο {{free}}',
    fetchingSponsorBlock: 'Σύνδεση με το SponsorBlock…',
    retryingSponsorBlock: 'Το SponsorBlock δεν είναι διαθέσιμο, επανάληψη ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'Η προστασία bot ενεργοποιήθηκε. Η IP που χρησιμοποιείς είναι πιθανότατα επισημασμένη (εύρος datacenter ή πολυσύχναστη έξοδος VPN). Άλλαξε IP ή επέλεξε διαφορετικό endpoint VPN και δοκίμασε ξανά. Αν συνεχίζει να αποτυγχάνει, μπορεί να πρόκειται για προσωρινή αλλαγή από πλευράς YouTube — το Arroxy ενημερώνει αυτόματα το yt-dlp κατά την εκκίνηση, οπότε η επιδιόρθωση εφαρμόζεται αυτόματα μόλις την κυκλοφορήσει το upstream.',
      ipBlock: 'Η διεύθυνση IP σου φαίνεται να έχει αποκλειστεί από το YouTube. Δοκίμασε αργότερα ή χρησιμοποίησε VPN.',
      rateLimit: 'Το YouTube περιορίζει τα αιτήματα. Περίμενε ένα λεπτό και δοκίμασε ξανά.',
      ageRestricted: 'Αυτό το βίντεο έχει περιορισμό ηλικίας και δεν μπορεί να ληφθεί χωρίς συνδεδεμένο λογαριασμό.',
      unavailable: 'Αυτό το βίντεο δεν είναι διαθέσιμο — μπορεί να είναι ιδιωτικό, διαγραμμένο ή κλειδωμένο ανά περιοχή.',
      geoBlocked: 'Αυτό το βίντεο δεν είναι διαθέσιμο στην περιοχή σου.',
      outOfDiskSpace: 'Δεν υπάρχει αρκετός χώρος στο δίσκο. Ελευθέρωσε χώρο και δοκίμασε ξανά.',
      unsupportedUrl: 'Αυτό δεν μοιάζει με URL βίντεο. Επικόλλησε έναν σύνδεσμο YouTube βίντεο, Short ή playlist.',
      chunkTransferFailure: 'Ο διακομιστής διέκοπτε συνεχώς τη λήψη στη μέση και το yt-dlp τα παράτησε μετά από επανειλημμένες προσπάθειες. Αυτό συμβαίνει συνήθως με τα μεγαλύτερα φορμά βίντεο (4K HDR / VP9 υψηλού ρυθμού μετάδοσης). Δοκίμασε ξανά, άλλαξε δίκτυο/VPN ή επέλεξε χαμηλότερη ανάλυση.',
      postprocessFailure: 'Το yt-dlp ολοκλήρωσε τη λήψη αλλά η μετα-επεξεργασία (merge / mux / convert) απέτυχε. Συχνά πρόκειται για παροδικό πρόβλημα του ffmpeg — δοκίμασε ξανά και, αν επιμένει, δοκίμασε διαφορετικό συνδυασμό φορμά.',
      parse: 'Δεν ήταν δυνατή η ανάλυση της απάντησης από τον ιστότοπο. Ο extractor του yt-dlp μπορεί να έχει μείνει πίσω. Το Arroxy ενημερώνει αυτόματα το yt-dlp κατά την εκκίνηση — δοκίμασε ξανά σε λίγα λεπτά μόλις κυκλοφορήσει η διόρθωση.',
      network: 'Σφάλμα δικτύου. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.',
      drmProtected: 'Αυτό το βίντεο προστατεύεται από DRM. Το yt-dlp δεν μπορεί να αφαιρέσει DRM, οπότε το αρχείο δεν μπορεί να ληφθεί.',
      loginRequired: 'Αυτό το βίντεο απαιτεί συνδεδεμένο λογαριασμό. Ρύθμισε ένα cookies.txt (Ρυθμίσεις → Cookies) και δοκίμασε ξανά.',
      unknown: 'Η λήψη απέτυχε. Δες το raw output παρακάτω.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Καλύτερη ποιότητα',
      desc: 'Μέγιστη ανάλυση + καλύτερος ήχος'
    },
    balanced: {
      label: 'Ισορροπημένο',
      desc: 'Μέγιστο 720p + καλός ήχος'
    },
    'audio-only': {
      label: 'Μόνο ήχος',
      desc: 'Χωρίς βίντεο, καλύτερος ήχος'
    },
    'small-file': {
      label: 'Μικρό αρχείο',
      desc: 'Ελάχιστη ανάλυση + χαμηλός ήχος'
    },
    'subtitle-only': {
      label: 'Μόνο υπότιτλοι',
      desc: 'Χωρίς βίντεο, χωρίς ήχο, μόνο υπότιτλοι'
    }
  },
  playlistPresets: {
    'video-best': { label: 'Καλύτερη ποιότητα', desc: 'Υψηλότερο διαθέσιμο βίντεο + ήχος ανά στοιχείο' },
    'video-2160p': { label: 'Έως 4K', desc: 'Όριο 2160p, υποβάθμιση ανά στοιχείο' },
    'video-1440p': { label: 'Έως 1440p', desc: 'Όριο 2K, υποβάθμιση ανά στοιχείο' },
    'video-1080p': { label: 'Έως 1080p', desc: 'Όριο ανά στοιχείο, υποβάθμιση σε χαμηλότερο' },
    'video-720p': { label: 'Έως 720p', desc: 'Μικρότερα αρχεία, ευρεία συμβατότητα' },
    'video-480p': { label: 'Έως 480p', desc: 'Χαμηλό εύρος ζώνης' },
    'video-360p': { label: 'Έως 360p', desc: 'Μικρότερο βίντεο' },
    'audio-best': { label: 'Audio (καλύτερος)', desc: 'Εγγενής καλύτερος ήχος, χωρίς επανακωδικοποίηση' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'Μετατροπή σε MP3 192 kbps' }
  },
  formatLabel: {
    audioFallback: 'Ήχος',
    audioOnlyDot: 'Μόνο ήχος · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Αδρανές',
      statusActive_one: '1 σε λήψη · {{percent}}%',
      statusActive_other: '{{count}} σε λήψη · {{percent}}%',
      open: 'Άνοιγμα Arroxy',
      quit: 'Έξοδος από Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} λήψη σε εξέλιξη',
      message_other: '{{count}} λήψεις σε εξέλιξη',
      detail: 'Το κλείσιμο θα ακυρώσει όλες τις ενεργές λήψεις.',
      confirm: 'Ακύρωση λήψεων & Έξοδος',
      keep: 'Συνέχεια λήψεων'
    },
    closeToTray: {
      message: 'Απόκρυψη Arroxy στο δίσκο συστήματος κατά το κλείσιμο;',
      detail: 'Το Arroxy συνεχίζει να εκτελείται και ολοκληρώνει τις ενεργές λήψεις. Άλλαξέ το αργότερα στις Ρυθμίσεις για προχωρημένους.',
      hide: 'Απόκρυψη στο δίσκο',
      quit: 'Έξοδος',
      remember: 'Να μη ζητηθεί ξανά'
    },
    rendererCrashed: {
      message: 'Το Arroxy αντιμετώπισε πρόβλημα',
      detail: 'Η διαδικασία απόδοσης κατέρρευσε ({{reason}}). Ανανέωσε για να δοκιμάσεις ξανά.',
      reload: 'Ανανέωση',
      quit: 'Έξοδος'
    }
  },
  share: {
    title: 'Μοιράσου το Arroxy',
    description: 'Το Arroxy είναι δωρεάν και ανοιχτού κώδικα. Η κοινοποίηση βοηθά περισσότερους να το ανακαλύψουν.',
    copyLink: 'Αντιγραφή συνδέσμου',
    copied: 'Αντιγράφηκε!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Κοινή χρήση Arroxy',
    footerLabel: 'Κοινή χρήση',
    shareAction: 'Κοινή χρήση Arroxy',
    inlineCard: {
      body: 'Σου αρέσει το Arroxy; Μοιράσου το με κάποιον που μπορεί να το βρει χρήσιμο.',
      dismiss: 'Απόρριψη πρότασης κοινοποίησης'
    },
    highValueBanner: {
      body: 'Σου αρέσει το Arroxy; Βοήθησε άλλους να το ανακαλύψουν.',
      dismiss: 'Απόρριψη πρότασης κοινοποίησης'
    }
  }
} as const;

export default el;
