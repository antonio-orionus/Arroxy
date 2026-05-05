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
      sponsorblock: 'SponsorBlock',
      output: 'Ausgabe',
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
      clearAria: 'URL löschen',
      clipboard: {
        toggle: 'Zwischenablage beobachten',
        toggleDescription: 'Füllt das URL-Feld automatisch aus, wenn ein YouTube-Link kopiert wird.',
        dialog: {
          title: 'YouTube-URL erkannt',
          body: 'Diesen Link aus deiner Zwischenablage verwenden?',
          useButton: 'URL verwenden',
          disableButton: 'Deaktivieren',
          cancelButton: 'Abbrechen',
          disableNote: 'Du kannst die Zwischenablage-Beobachtung später in den erweiterten Einstellungen wieder aktivieren.'
        }
      },
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
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Datenverkehr über einen Proxy leiten — nützlich für geo-gesperrte Inhalte.',
        placeholder: 'http://host:port',
        clear: 'Löschen'
      },
      closeToTray: {
        toggle: 'Beim Schließen in die Taskleiste minimieren',
        toggleDescription: 'Downloads im Hintergrund fortsetzen, wenn das Fenster geschlossen wird.'
      },
      analytics: {
        toggle: 'Anonyme Nutzungsstatistiken senden',
        toggleDescription: 'Zählt nur App-Starts. Keine URLs, Dateinamen oder persönliche Daten.'
      }
    },
    subtitles: {
      heading: 'Untertitel',
      autoBadge: 'Auto',
      hint: 'Dateien werden neben dem Video gespeichert',
      noLanguages: 'Keine Untertitel für dieses Video verfügbar',
      skip: 'Überspringen',
      skipSubs: 'Für dieses Video überspringen',
      selectAll: 'Alle auswählen',
      deselectAll: 'Alle abwählen',
      mascot: 'Wähle null, einen oder mehrere — ganz wie du möchtest ✨',
      searchPlaceholder: 'Sprachen suchen…',
      noMatches: 'Keine Sprachen gefunden',
      clearAll: 'Alle entfernen',
      noSelected: 'Keine Untertitel ausgewählt',
      selectedNote_one: '{{count}} Untertitel wird heruntergeladen',
      selectedNote_other: '{{count}} Untertitel werden heruntergeladen',
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
    sponsorblock: {
      modeHeading: 'Sponsor-Filterung',
      mode: {
        off: 'Aus',
        mark: 'Als Kapitel markieren',
        remove: 'Segmente entfernen'
      },
      modeHint: {
        off: 'Kein SponsorBlock — Video wird unverändert abgespielt.',
        mark: 'Markiert Sponsor-Segmente als Kapitel (nicht destruktiv).',
        remove: 'Schneidet Sponsor-Segmente mit FFmpeg aus dem Video.'
      },
      categoriesHeading: 'Kategorien',
      cat: {
        sponsor: 'Sponsor',
        intro: 'Intro',
        outro: 'Outro',
        selfpromo: 'Eigenwerbung',
        music_offtopic: 'Musik (Off-Topic)',
        preview: 'Vorschau',
        filler: 'Füllmaterial'
      }
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
      total: 'Gesamt',
      convert: {
        label: 'Konvertieren',
        uncompressed: 'Konvertieren · unkomprimiert',
        bitrate: 'Bitrate',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Die Audiokonvertierung erfordert den Nur-Audio-Modus (Videoauswahl aufheben).',
        requiresLossy: 'Ein nativer Stream ist ausgewählt — Bitrate gilt nur bei der Konvertierung zu mp3, m4a oder opus.'
      }
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
    output: {
      embedChapters: {
        label: 'Kapitel einbetten',
        description: 'Kapitelmarkierungen, navigierbar in jedem modernen Player.'
      },
      embedMetadata: {
        label: 'Metadaten einbetten',
        description: 'Titel, Künstler, Beschreibung und Upload-Datum in die Datei schreiben.'
      },
      embedThumbnail: {
        label: 'Thumbnail einbetten',
        description: 'Cover-Art in der Datei. WebM-Video wird zu MKV remuxed; wird übersprungen, wenn Untertitel eingebettet werden.'
      },
      writeDescription: {
        label: 'Beschreibung speichern',
        description: 'Speichert die Videobeschreibung als .description-Datei neben dem Download.'
      },
      writeThumbnail: {
        label: 'Thumbnail speichern',
        description: 'Speichert das Thumbnail als .jpg-Bilddatei neben dem Download.'
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
      nothingToDownload: 'Das Voreinstellung „Nur Untertitel" ist aktiv, aber keine Untertitelsprache ausgewählt – es wird nichts heruntergeladen.',
      audioOnly: 'Nur Audio',
      addToQueue: '+ Warteschlange',
      addToQueueTooltip: 'Startet, wenn andere Downloads fertig sind — volle Bandbreite',
      pullIt: "Hol's rein! ↓",
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
    copied: 'Befehl in die Zwischenablage kopiert',
    installFailed: 'Update fehlgeschlagen',
    retry: 'Erneut versuchen'
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
      botBlock: 'Bot-Schutz ausgelöst. Die verwendete IP ist höchstwahrscheinlich als verdächtig markiert (Rechenzentrumsbereich oder stark genutzter VPN-Ausgangsknoten). Wechsle deine IP oder wähle einen anderen VPN-Endpunkt und versuche es erneut. Falls das Problem weiterhin besteht, könnte es sich um eine vorübergehende Änderung seitens YouTube handeln – Arroxy aktualisiert yt-dlp beim Start automatisch, sodass der Fix automatisch angewendet wird, sobald er upstream verfügbar ist.',
      ipBlock: 'Deine IP-Adresse scheint von YouTube blockiert zu sein. Versuch es später oder nutze ein VPN.',
      rateLimit: 'YouTube drosselt die Anfragen. Warte eine Minute und versuch es dann erneut.',
      ageRestricted: 'Dieses Video ist altersbeschränkt und kann ohne angemeldetes Konto nicht heruntergeladen werden.',
      unavailable: 'Dieses Video ist nicht verfügbar — möglicherweise privat, gelöscht oder regional gesperrt.',
      geoBlocked: 'Dieses Video ist in deiner Region nicht verfügbar.',
      outOfDiskSpace: 'Nicht genug Speicherplatz. Gib Speicher frei und versuche es erneut.'
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
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Inaktiv',
      statusActive_one: '1 lädt herunter · {{percent}}%',
      statusActive_other: '{{count}} laden herunter · {{percent}}%',
      open: 'Arroxy öffnen',
      quit: 'Arroxy beenden'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} Download läuft',
      message_other: '{{count}} Downloads laufen',
      detail: 'Beim Schließen werden alle aktiven Downloads abgebrochen.',
      confirm: 'Downloads abbrechen & beenden',
      keep: 'Weiter herunterladen'
    },
    closeToTray: {
      message: 'Arroxy beim Schließen in den Infobereich minimieren?',
      detail: 'Arroxy läuft weiter und schließt aktive Downloads ab. Ändern Sie dies in den erweiterten Einstellungen.',
      hide: 'In Infobereich minimieren',
      quit: 'Beenden',
      remember: 'Nicht mehr fragen'
    },
    rendererCrashed: {
      message: 'Arroxy hat ein Problem festgestellt',
      detail: 'Der Renderer-Prozess ist abgestürzt ({{reason}}). Neu laden, um es erneut zu versuchen.',
      reload: 'Neu laden',
      quit: 'Beenden'
    }
  }
} as const;

export default de;
