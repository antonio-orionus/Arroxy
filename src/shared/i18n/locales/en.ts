const en = {
  common: {
    back: 'Back',
    continue: 'Continue',
    retry: 'Retry',
    startOver: 'Start over',
    loading: 'Loading…'
  },
  app: {
    feedback: 'Feedback',
    logs: 'Logs',
    feedbackNudge: "Enjoying Arroxy? I'd love to hear from you! 💬",
    debugCopied: 'Copied!',
    debugCopyTitle: 'Copy debug info (Electron, OS, Chrome versions)',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out'
  },
  titleBar: {
    close: 'Close',
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore'
  },
  splash: {
    greeting: 'Hey, welcome back!',
    warmup: 'Arroxy is warming up…',
    warning: 'Setup incomplete — some features may not work'
  },
  theme: {
    light: 'Light mode',
    dark: 'Dark mode',
    system: 'System default'
  },
  language: {
    label: 'Language'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Format',
      subtitles: 'Subtitles',
      sponsorblock: 'SponsorBlock',
      folder: 'Save',
      confirm: 'Confirm'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Supports youtube.com and youtu.be links',
      fetchFormats: 'Fetch formats',
      mascotIdle: 'Drop me a YouTube link (video or Short) — then hit "Fetch formats" and I\'ll get to work ✨',
      mascotBusy: 'Downloading in the background… I can multitask 😎',
      advanced: 'Advanced',
      clearAria: 'Clear URL',
      clipboard: {
        toggle: 'Watch clipboard',
        toggleDescription: 'Auto-fill the URL field when you copy a YouTube link.',
        dialog: {
          title: 'YouTube URL detected',
          body: 'Use this link from your clipboard?',
          useButton: 'Use URL',
          disableButton: 'Disable',
          cancelButton: 'Cancel',
          disableNote: 'You can re-enable clipboard watching later in Advanced settings.'
        }
      },
      cookies: {
        toggle: 'Use cookies file',
        toggleDescription: 'Helps with age-restricted, members-only, and account-private videos.',
        risk: 'Risk: a cookies.txt contains every logged-in session for that browser — keep it private.',
        fileLabel: 'Cookies file',
        choose: 'Choose…',
        clear: 'Clear',
        placeholder: 'No file selected',
        helpLink: 'How do I export cookies?',
        enabledButNoFile: 'Pick a file to use cookies',
        banWarning: 'YouTube may flag — and sometimes ban — accounts whose cookies are used by yt-dlp. Use a throwaway account when possible.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      }
    },
    subtitles: {
      heading: 'Subtitles',
      autoBadge: 'Auto',
      hint: 'Sidecar files will be saved next to the video',
      noLanguages: 'No subtitles available for this video',
      skip: 'Skip',
      skipSubs: 'Skip for this video',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      mascot: 'Pick zero, one, or many — totally up to you ✨',
      searchPlaceholder: 'Search languages…',
      noMatches: 'No languages match',
      clearAll: 'Clear all',
      noSelected: 'No subtitles selected',
      selectedNote_one: '{{count}} subtitle will be downloaded',
      selectedNote_other: '{{count}} subtitles will be downloaded',
      sectionManual: 'Manual',
      sectionAuto: 'Auto-generated',
      saveMode: {
        heading: 'Save as',
        sidecar: 'Next to video',
        embed: 'Embed into video',
        subfolder: 'subtitles/ subfolder'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'Embed mode saves output as .mkv so subtitle tracks embed reliably.',
      autoAssNote: 'Auto-captions will be saved as SRT instead of ASS — they\'re always cleaned of YouTube\'s rolling-cue duplication, which our ASS converter can\'t replicate yet.'
    },
    sponsorblock: {
      modeHeading: 'Sponsor filtering',
      mode: {
        off: 'Off',
        mark: 'Mark as chapters',
        remove: 'Remove segments'
      },
      modeHint: {
        off: 'No SponsorBlock — video plays as uploaded.',
        mark: 'Marks sponsor segments as chapters (non-destructive).',
        remove: 'Cuts sponsor segments from the video using FFmpeg.'
      },
      categoriesHeading: 'Categories',
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
      quickPresets: 'Quick presets',
      video: 'Video',
      audio: 'Audio',
      noAudio: 'No audio',
      videoOnly: 'Video only',
      audioOnly: 'Audio only',
      audioOnlyOption: 'Audio only (no video)',
      mascot: "Best + Best = max quality. I'd pick that!",
      sniffing: 'Sniffing out the best formats for you…',
      loadingHint: 'Usually takes a second',
      loadingAria: 'Loading formats',
      sizeUnknown: 'Size unknown',
      total: 'Total'
    },
    folder: {
      heading: 'Save to',
      downloads: 'Downloads',
      videos: 'Movies',
      desktop: 'Desktop',
      music: 'Music',
      documents: 'Documents',
      pictures: 'Pictures',
      home: 'Home',
      custom: 'Custom…',
      subfolder: {
        toggle: 'Save inside subfolder',
        placeholder: 'e.g. lo-fi rips',
        invalid: 'Folder name has invalid characters'
      }
    },
    confirm: {
      readyHeadline: 'Ready to pull it in!',
      landIn: 'Your file will land in',
      labelVideo: 'Video',
      labelAudio: 'Audio',
      labelSubtitles: 'Subtitles',
      subtitlesNone: '—',
      labelSaveTo: 'Save to',
      labelSize: 'Size',
      sizeUnknown: 'Unknown',
      nothingToDownload: 'Subtitles only preset is active but no subtitle language is selected — nothing will be downloaded.',
      audioOnly: 'Audio only',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Starts when other downloads finish — gets full bandwidth',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'Starts immediately — runs alongside other active downloads'
    },
    error: {
      icon: 'Error'
    }
  },
  videoCard: {
    titlePlaceholder: 'Loading…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Download Queue',
    toggleTitle: 'Toggle download queue',
    empty: 'Downloads you queue will appear here',
    noDownloads: 'No downloads yet.',
    activeCount: '{{count}} downloading · {{percent}}%',
    clear: 'Clear',
    clearTitle: 'Clear completed downloads',
    tip: 'Your download is queued below — open anytime to track progress.',
    item: {
      doneAt: 'Done {{time}}',
      paused: 'Paused',
      defaultError: 'Download failed',
      openUrl: 'Open URL',
      pause: 'Pause',
      resume: 'Resume',
      cancel: 'Cancel',
      remove: 'Remove'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'is available',
    youHave: '— you have {{currentVersion}}',
    install: 'Install & Restart',
    downloading: 'Downloading…',
    download: 'Download ↗',
    dismiss: 'Dismiss update banner',
    copy: 'Copy command to clipboard',
    copied: 'Copied command to clipboard'
  },
  status: {
    preparingBinaries: 'Preparing binaries…',
    mintingToken: 'Minting YouTube token…',
    remintingToken: 'Re-minting token…',
    startingYtdlp: 'Starting yt-dlp process…',
    downloadingMedia: 'Downloading video & audio…',
    mergingFormats: 'Merging audio and video…',
    fetchingSubtitles: 'Fetching subtitles…',
    sleepingBetweenRequests: 'Waiting {{seconds}}s to avoid rate limits…',
    subtitlesFailed: 'Video saved — some subtitles could not be downloaded',
    cancelled: 'Download cancelled',
    complete: 'Download complete',
    usedExtractorFallback: 'Downloaded with relaxed extractor — set up a cookies.txt for more reliable downloads',
    ytdlpProcessError: 'yt-dlp process error: {{error}}',
    ytdlpExitCode: 'yt-dlp exited with code {{code}}',
    downloadingBinary: 'Downloading {{name}} binary…',
    unknownStartupFailure: 'Unknown download startup failure'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube flagged this request as a bot. Try again in a moment.',
      ipBlock: 'Your IP address appears to be blocked by YouTube. Try again later or use a VPN.',
      rateLimit: 'YouTube is rate-limiting requests. Wait a minute then retry.',
      ageRestricted: 'This video is age-restricted and cannot be downloaded without a signed-in account.',
      unavailable: 'This video is unavailable — it may be private, deleted, or region-locked.',
      geoBlocked: 'This video is not available in your region.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Best quality',
      desc: 'Highest resolution + best audio'
    },
    balanced: {
      label: 'Balanced',
      desc: '720p max + good audio'
    },
    'audio-only': {
      label: 'Audio only',
      desc: 'No video, best audio'
    },
    'small-file': {
      label: 'Small file',
      desc: 'Lowest resolution + low audio'
    },
    'subtitle-only': {
      label: 'Subtitles only',
      desc: 'No video, no audio, only subtitles'
    }
  },
  formatLabel: {
    audioOnly: 'Audio only',
    audioFallback: 'Audio',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} download in progress',
      message_other: '{{count}} downloads in progress',
      detail: 'Closing will cancel all active downloads.',
      confirm: 'Cancel Downloads & Quit',
      keep: 'Keep Downloading'
    }
  }
} as const;

export default en;
