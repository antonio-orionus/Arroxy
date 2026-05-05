const el = {
  common: {
    back: 'Πίσω',
    continue: 'Συνέχεια',
    retry: 'Επανάληψη',
    startOver: 'Επανεκκίνηση',
    loading: 'Φόρτωση…'
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
  titleBar: {
    close: 'Κλείσιμο',
    minimize: 'Ελαχιστοποίηση',
    maximize: 'Μεγιστοποίηση',
    restore: 'Επαναφορά'
  },
  splash: {
    greeting: 'Καλώς ήρθες πάλι!',
    warmup: 'Το Arroxy ξεκινά…',
    warning: 'Η ρύθμιση δεν ολοκληρώθηκε — ορισμένες λειτουργίες μπορεί να μην λειτουργούν'
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
      formats: 'Μορφή',
      subtitles: 'Υπότιτλοι',
      sponsorblock: 'SponsorBlock',
      output: 'Έξοδος',
      folder: 'Αποθήκευση',
      confirm: 'Επιβεβαίωση'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Υποστηρίζει συνδέσμους youtube.com και youtu.be',
      fetchFormats: 'Φόρτωση μορφών',
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
        toggle: 'Χρήση αρχείου cookies',
        toggleDescription: 'Βοηθά με βίντεο με περιορισμό ηλικίας, μόνο για μέλη και ιδιωτικά.',
        risk: 'Κίνδυνος: το cookies.txt περιέχει κάθε συνδεδεμένη συνεδρία του προγράμματος περιήγησης — κράτα το ιδιωτικό.',
        fileLabel: 'Αρχείο cookies',
        choose: 'Επιλογή…',
        clear: 'Εκκαθάριση',
        placeholder: 'Δεν έχει επιλεγεί αρχείο',
        helpLink: 'Πώς εξάγω τα cookies;',
        enabledButNoFile: 'Επέλεξε αρχείο για χρήση cookies',
        banWarning: 'Το YouTube μπορεί να επισημάνει — και μερικές φορές να αποκλείσει — λογαριασμούς των οποίων τα cookies χρησιμοποιούνται από το yt-dlp. Χρησιμοποίησε έναν εφεδρικό λογαριασμό αν είναι δυνατόν.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
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
      heading: 'Υπότιτλοι',
      autoBadge: 'Αυτόματο',
      hint: 'Τα αρχεία sidecar θα αποθηκευτούν δίπλα στο βίντεο',
      noLanguages: 'Δεν υπάρχουν υπότιτλοι για αυτό το βίντεο',
      skip: 'Παράλειψη',
      skipSubs: 'Παράλειψη για αυτό το βίντεο',
      selectAll: 'Επιλογή όλων',
      deselectAll: 'Αποεπιλογή όλων',
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
      loadingHint: 'Συνήθως παίρνει ένα δευτερόλεπτο',
      loadingAria: 'Φόρτωση μορφών',
      sizeUnknown: 'Άγνωστο μέγεθος',
      total: 'Σύνολο',
      convert: {
        label: 'Μετατροπή',
        uncompressed: 'Μετατροπή · αμετάβλητο',
        bitrate: 'Ρυθμός bit',
        wavLabel: 'WAV (αμετάβλητο)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Η μετατροπή ήχου απαιτεί λειτουργία μόνο ήχου (αποεπίλεξε το βίντεο).',
        requiresLossy: 'Επιλέχθηκε εγγενής ροή — ο ρυθμός bit ισχύει μόνο κατά τη μετατροπή σε mp3, m4a ή opus.'
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
      audioOnly: 'Μόνο ήχος',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Ξεκινά όταν ολοκληρωθούν άλλες λήψεις — αποκτά πλήρες εύρος ζώνης',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'Ξεκινά αμέσως — εκτελείται παράλληλα με άλλες ενεργές λήψεις'
    },
    error: {
      icon: 'Σφάλμα'
    }
  },
  videoCard: {
    titlePlaceholder: 'Φόρτωση…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Ουρά λήψεων',
    toggleTitle: 'Εναλλαγή ουράς λήψεων',
    empty: 'Οι λήψεις που θα προσθέσεις στην ουρά θα εμφανιστούν εδώ',
    noDownloads: 'Δεν υπάρχουν ακόμη λήψεις.',
    activeCount: '{{count}} σε λήψη · {{percent}}%',
    clear: 'Εκκαθάριση',
    clearTitle: 'Εκκαθάριση ολοκληρωμένων λήψεων',
    tip: 'Η λήψη σου βρίσκεται στην ουρά παρακάτω — άνοιξέ την οποιαδήποτε στιγμή για παρακολούθηση προόδου.',
    item: {
      doneAt: 'Ολοκληρώθηκε {{time}}',
      paused: 'Σε παύση',
      defaultError: 'Αποτυχία λήψης',
      openUrl: 'Άνοιγμα URL',
      pause: 'Παύση',
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
    fetchingSubtitles: 'Λήψη υποτίτλων…',
    sleepingBetweenRequests: 'Αναμονή {{seconds}} δευτ. για αποφυγή περιορισμών ρυθμού…',
    subtitlesFailed: 'Το βίντεο αποθηκεύτηκε — ορισμένοι υπότιτλοι δεν κατέβηκαν',
    cancelled: 'Η λήψη ακυρώθηκε',
    complete: 'Η λήψη ολοκληρώθηκε',
    usedExtractorFallback: 'Λήψη με χαλαρό extractor — ρύθμισε cookies.txt για πιο αξιόπιστες λήψεις',
    ytdlpProcessError: 'Σφάλμα διαδικασίας yt-dlp: {{error}}',
    ytdlpExitCode: 'Το yt-dlp έγινε έξοδος με κωδικό {{code}}',
    downloadingBinary: 'Λήψη δυαδικού {{name}}…',
    unknownStartupFailure: 'Άγνωστη αποτυχία εκκίνησης λήψης'
  },
  errors: {
    ytdlp: {
      botBlock: 'Η προστασία bot ενεργοποιήθηκε. Η IP που χρησιμοποιείς είναι πιθανότατα επισημασμένη (εύρος datacenter ή πολυσύχναστη έξοδος VPN). Άλλαξε IP ή επέλεξε διαφορετικό endpoint VPN και δοκίμασε ξανά. Αν συνεχίζει να αποτυγχάνει, μπορεί να πρόκειται για προσωρινή αλλαγή από πλευράς YouTube — το Arroxy ενημερώνει αυτόματα το yt-dlp κατά την εκκίνηση, οπότε η επιδιόρθωση εφαρμόζεται αυτόματα μόλις την κυκλοφορήσει το upstream.',
      ipBlock: 'Η διεύθυνση IP σου φαίνεται να έχει αποκλειστεί από το YouTube. Δοκίμασε αργότερα ή χρησιμοποίησε VPN.',
      rateLimit: 'Το YouTube περιορίζει τα αιτήματα. Περίμενε ένα λεπτό και δοκίμασε ξανά.',
      ageRestricted: 'Αυτό το βίντεο έχει περιορισμό ηλικίας και δεν μπορεί να ληφθεί χωρίς συνδεδεμένο λογαριασμό.',
      unavailable: 'Αυτό το βίντεο δεν είναι διαθέσιμο — μπορεί να είναι ιδιωτικό, διαγραμμένο ή κλειδωμένο ανά περιοχή.',
      geoBlocked: 'Αυτό το βίντεο δεν είναι διαθέσιμο στην περιοχή σου.',
      outOfDiskSpace: 'Δεν υπάρχει αρκετός χώρος στο δίσκο. Ελευθέρωσε χώρο και δοκίμασε ξανά.'
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
  formatLabel: {
    audioOnly: 'Μόνο ήχος',
    audioFallback: 'Ήχος',
    audioOnlyDot: 'Audio only · {{audio}}',
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
  }
} as const;

export default el;
