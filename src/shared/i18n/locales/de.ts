const de = {
  common: {
    back: 'Zurück',
    continue: 'Weiter',
    retry: 'Erneut versuchen',
    startOver: 'Von vorn beginnen',
    loading: 'Wird geladen…'
  },
  app: {
    feedback: 'Feedback',
    logs: 'Protokolle',
    feedbackNudge: 'Gefällt dir Arroxy? Ich freue mich über dein Feedback! 💬',
    debugCopied: 'Kopiert!',
    debugCopyTitle: 'Debug-Infos kopieren (Electron-, OS-, Chrome-Versionen)',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern'
  },
  titleBar: {
    close: 'Schließen',
    minimize: 'Minimieren',
    maximize: 'Maximieren',
    restore: 'Wiederherstellen'
  },
  splash: {
    greeting: 'Hey, schön dich wiederzusehen!',
    warmup: 'Arroxy wärmt sich auf…',
    warning: 'Einrichtung unvollständig — einige Funktionen funktionieren möglicherweise nicht'
  },
  theme: {
    light: 'Heller Modus',
    dark: 'Dunkler Modus',
    system: 'Systemstandard'
  },
  language: {
    label: 'Sprache'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Format',
      subtitles: 'Untertitel',
      folder: 'Speichern',
      confirm: 'Bestätigen'
    },
    url: {
      heading: 'YouTube-URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Unterstützt youtube.com- und youtu.be-Links',
      fetchFormats: 'Formate abrufen',
      mascotIdle: 'Wirf mir einen YouTube-Link rüber (Video oder Short) — klick dann auf „Formate abrufen" und ich leg los ✨',
      mascotBusy: 'Lade im Hintergrund… ich kann mehrere Dinge gleichzeitig 😎',
      advanced: 'Erweitert',
      cookies: {
        toggle: 'Cookies-Datei verwenden',
        toggleDescription: 'Hilft bei altersbeschränkten, nur-für-Mitglieder- und kontoprivaten Videos.',
        risk: 'Risiko: Eine cookies.txt enthält alle angemeldeten Sitzungen dieses Browsers — halte sie geheim.',
        fileLabel: 'Cookies-Datei',
        choose: 'Auswählen…',
        clear: 'Entfernen',
        placeholder: 'Keine Datei ausgewählt',
        helpLink: 'Wie exportiere ich Cookies?',
        enabledButNoFile: 'Wähle eine Datei aus, um Cookies zu nutzen',
        banWarning: 'YouTube kann Konten markieren — und teils sperren — deren Cookies von yt-dlp verwendet werden. Nutze nach Möglichkeit ein Wegwerfkonto.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      }
    },
    subtitles: {
      heading: 'Untertitel',
      autoBadge: 'Auto',
      hint: 'Dateien werden neben dem Video gespeichert',
      noLanguages: 'Keine Untertitel für dieses Video verfügbar',
      skip: 'Überspringen',
      selectAll: 'Alle auswählen',
      deselectAll: 'Alle abwählen',
      mascot: 'Wähle null, einen oder mehrere — ganz wie du möchtest ✨',
      searchPlaceholder: 'Sprachen suchen…',
      noMatches: 'Keine Sprachen gefunden',
      clearAll: 'Alle entfernen',
      noSelected: 'Keine Untertitel ausgewählt',
      sectionManual: 'Manuell',
      sectionAuto: 'Automatisch generiert',
      saveMode: {
        heading: 'Speichern als',
        sidecar: 'Neben dem Video',
        embed: 'In Video einbetten',
        subfolder: 'Unterordner subtitles/'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'Im Einbettungsmodus wird die Ausgabe als .mkv gespeichert, damit Untertitel-Spuren zuverlässig eingebettet werden.',
      autoAssNote: 'Auto-Untertitel werden als SRT statt ASS gespeichert — sie werden immer von YouTubes rollenden Cue-Duplikaten bereinigt, was unser ASS-Konverter noch nicht abbilden kann.'
    },
    formats: {
      quickPresets: 'Schnelleinstellungen',
      video: 'Video',
      audio: 'Audio',
      noAudio: 'Kein Audio',
      videoOnly: 'Nur Video',
      audioOnly: 'Nur Audio',
      audioOnlyOption: 'Nur Audio (kein Video)',
      mascot: 'Beste + beste = maximale Qualität. Das würde ich nehmen!',
      sniffing: 'Suche die besten Formate für dich…',
      loadingHint: 'Dauert meist nur eine Sekunde',
      loadingAria: 'Formate werden geladen',
      sizeUnknown: 'Größe unbekannt',
      total: 'Gesamt'
    },
    folder: {
      heading: 'Speichern in',
      downloads: 'Downloads',
      videos: 'Filme',
      desktop: 'Schreibtisch',
      music: 'Musik',
      documents: 'Dokumente',
      pictures: 'Bilder',
      home: 'Persönlicher Ordner',
      custom: 'Benutzerdefiniert…',
      subfolder: {
        toggle: 'In Unterordner speichern',
        placeholder: 'z. B. lo-fi rips',
        invalid: 'Ordnername enthält ungültige Zeichen'
      }
    },
    confirm: {
      readyHeadline: 'Bereit zum Herunterladen!',
      landIn: 'Deine Datei landet in',
      labelVideo: 'Video',
      labelAudio: 'Audio',
      labelSubtitles: 'Untertitel',
      subtitlesNone: '—',
      labelSaveTo: 'Speicherort',
      labelSize: 'Größe',
      sizeUnknown: 'Unbekannt',
      audioOnly: 'Nur Audio',
      addToQueue: '+ Warteschlange',
      addToQueueTooltip: 'Startet, wenn andere Downloads fertig sind — volle Bandbreite',
      pullIt: 'Hol\'s rein! ↓',
      pullItTooltip: 'Startet sofort — läuft parallel zu anderen aktiven Downloads'
    },
    error: {
      icon: 'Fehler'
    }
  },
  videoCard: {
    titlePlaceholder: 'Wird geladen…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Download-Warteschlange',
    toggleTitle: 'Download-Warteschlange ein-/ausblenden',
    empty: 'Hier erscheinen Downloads, die du in die Warteschlange legst',
    noDownloads: 'Noch keine Downloads.',
    activeCount: '{{count}} werden geladen · {{percent}}%',
    clear: 'Leeren',
    clearTitle: 'Abgeschlossene Downloads entfernen',
    tip: 'Dein Download ist unten in der Warteschlange — öffne sie jederzeit, um den Fortschritt zu verfolgen.',
    item: {
      doneAt: 'Fertig {{time}}',
      paused: 'Pausiert',
      defaultError: 'Download fehlgeschlagen',
      openUrl: 'URL öffnen',
      pause: 'Pause',
      resume: 'Fortsetzen',
      cancel: 'Abbrechen',
      remove: 'Entfernen'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'ist verfügbar',
    youHave: '— du hast {{currentVersion}}',
    install: 'Installieren & neu starten',
    downloading: 'Wird heruntergeladen…',
    download: 'Herunterladen ↗',
    dismiss: 'Update-Banner schließen',
    copy: 'Befehl in die Zwischenablage kopieren',
    copied: 'Befehl in die Zwischenablage kopiert'
  },
  status: {
    preparingBinaries: 'Binärdateien werden vorbereitet…',
    mintingToken: 'YouTube-Token wird erzeugt…',
    remintingToken: 'Token wird neu erzeugt…',
    startingYtdlp: 'yt-dlp-Prozess wird gestartet…',
    downloadingMedia: 'Video & Audio werden heruntergeladen…',
    mergingFormats: 'Audio und Video werden zusammengeführt…',
    fetchingSubtitles: 'Untertitel werden geholt…',
    sleepingBetweenRequests: 'Warte {{seconds}}s, um Limits zu vermeiden…',
    subtitlesFailed: 'Video gespeichert — einige Untertitel konnten nicht geladen werden',
    cancelled: 'Download abgebrochen',
    complete: 'Download abgeschlossen',
    usedExtractorFallback: 'Mit gelockertem Extraktor heruntergeladen — richte eine cookies.txt für zuverlässigere Downloads ein',
    ytdlpProcessError: 'yt-dlp-Prozessfehler: {{error}}',
    ytdlpExitCode: 'yt-dlp wurde mit Code {{code}} beendet',
    downloadingBinary: 'Binärdatei {{name}} wird heruntergeladen…',
    unknownStartupFailure: 'Unbekannter Fehler beim Starten des Downloads'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube hat diese Anfrage als Bot markiert. Versuch es gleich noch mal.',
      ipBlock: 'Deine IP-Adresse scheint von YouTube blockiert zu sein. Versuch es später oder nutze ein VPN.',
      rateLimit: 'YouTube drosselt die Anfragen. Warte eine Minute und versuch es dann erneut.',
      ageRestricted: 'Dieses Video ist altersbeschränkt und kann ohne angemeldetes Konto nicht heruntergeladen werden.',
      unavailable: 'Dieses Video ist nicht verfügbar — möglicherweise privat, gelöscht oder regional gesperrt.',
      geoBlocked: 'Dieses Video ist in deiner Region nicht verfügbar.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Beste Qualität',
      desc: 'Höchste Auflösung + bestes Audio'
    },
    balanced: {
      label: 'Ausgewogen',
      desc: '720p max + gutes Audio'
    },
    'audio-only': {
      label: 'Nur Audio',
      desc: 'Kein Video, bestes Audio'
    },
    'small-file': {
      label: 'Kleine Datei',
      desc: 'Niedrigste Auflösung + niedriges Audio'
    },
    'subtitle-only': {
      label: 'Nur Untertitel',
      desc: 'Kein Video, kein Audio, nur Untertitel'
    }
  },
  formatLabel: {
    audioOnly: 'Nur Audio',
    audioFallback: 'Audio',
    audioOnlyDot: 'Nur Audio · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} Download läuft',
      message_other: '{{count}} Downloads laufen',
      detail: 'Beim Schließen werden alle aktiven Downloads abgebrochen.',
      confirm: 'Downloads abbrechen & beenden',
      keep: 'Weiter herunterladen'
    }
  }
} as const;

export default de;
