const en = {
  common: {
    back: 'Back',
    continue: 'Continue',
    retry: 'Retry',
    startOver: 'Start over'
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
  about: {
    button: 'About',
    openTitle: 'About Arroxy',
    tagline: 'Fast, friendly downloader for YouTube and 2000+ other sites.',
    websiteLink: 'Website',
    githubLink: 'GitHub',
    licenseLine: 'MIT License · by Antonio Orionus',
    thirdPartyNotices: 'View third-party notices'
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
    downloading: 'Downloading {{binary}}…',
    warmupFailedNoDiag: 'Setup failed. Open the setup log for details.'
  },
  repair: {
    title: 'Setup needs your help',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'Could not be verified.',
      downloadFailed: 'Download failed. Check your internet connection and retry.',
      extractFailed: 'Archive extraction failed. The download may be corrupt — retry.',
      hashFailed: 'Checksum mismatch on the downloaded file. Retry the download.',
      spawnFailed: 'The file is missing or could not be launched. Pick a working copy.',
      permissionDenied: 'The system refused to run the file. Pick a copy you trust or retry as admin.',
      blockedOrQuarantined: 'Windows blocked the file (SmartScreen / Defender). Pick an installed copy or whitelist the runtime folder.',
      badExitCode: 'The binary did not respond to --version. It may be corrupt or the wrong build.',
      timeout: 'The version probe timed out. The file may be hung — retry.',
      pairIncomplete: 'ffmpeg and ffprobe must both be set as a matched pair.'
    },
    actions: {
      chooseExecutable: 'Choose executable',
      resetToDefault: 'Reset to default',
      retrySetup: 'Retry setup',
      cancel: 'Cancel',
      openDependencyFolder: 'Open dependency folder',
      viewSetupLog: 'View setup log'
    }
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
      playlistItems: 'Playlist',
      playlistPresets: 'Quality',
      formats: 'Format',
      subtitles: 'Subtitles',
      sponsorblock: 'SponsorBlock',
      output: 'Output',
      folder: 'Save',
      confirm: 'Confirm'
    },
    playlistPresets: {
      heading: 'Pick quality for the batch',
      subhead: 'Each video resolves the chosen tier independently — heterogeneous playlists work without surprises.',
      itemCount_one: '{{count}} item',
      itemCount_other: '{{count}} items'
    },
    playlist: {
      heading: 'Playlist items',
      itemCount_one: '{{count}} video',
      itemCount_other: '{{count}} videos',
      itemCountAudio_one: '{{count}} track',
      itemCountAudio_other: '{{count}} tracks',
      selectAll: 'Select all',
      selectNone: 'Select none',
      rangeFrom: 'From',
      rangeTo: 'To',
      rangeApply: 'Apply range',
      selectedCount_one: '{{count}} selected',
      selectedCount_other: '{{count}} selected',
      noSelection: 'Select at least one video to continue',
      loadingItems: 'Fetching playlist…',
      thumbnailAlt: 'Video thumbnail',
      durationUnknown: 'live',
      syncWithFolder: 'Sync with folder',
      syncPanelDir: 'Folder',
      syncChange: 'Change…',
      syncApply: 'Apply sync',
      syncNoPriorDownloads: 'No prior downloads found in this folder',
      alreadyDownloaded: 'Already downloaded'
    },
    mixedPrompt: {
      title: 'This link has a playlist',
      body: "Want only the video you clicked, or pick from the playlist? You'll choose specific videos or a range next.",
      singleVideo: 'Just this one',
      pickFromPlaylist: 'Pick from playlist',
      playlistLimit: 'Playlist probe limit: {{count}} items',
      advancedSettings: 'Advanced settings',
      singleTooltip: 'Uses yt-dlp single-video mode so the playlist attached to this URL is ignored.',
      playlistTooltip: 'Uses yt-dlp playlist mode and fetches up to your playlist probe limit before showing the picker.'
    },
    url: {
      heading: 'Video URL',
      placeholder: 'https://...',
      fetchFormats: 'Fetch formats',
      features: {
        heading: 'What Arroxy can pull',
        youtube: {
          heading: 'YouTube',
          video: 'Videos',
          channel: 'Channels',
          playlist: 'Playlists',
          short: 'Shorts',
          music: 'Music',
          podcast: 'Podcasts'
        },
        anySite: {
          heading: '2000+ sites',
          video: 'Videos',
          videoPlaylist: 'Video playlists',
          musicPlaylist: 'Music playlists'
        },
        always: {
          heading: 'Always available',
          audioOnly: 'Audios only',
          subtitles: 'Subtitles'
        }
      },
      mascotIdle: 'Drop a link — YouTube or any of 2000+ sites ✨',
      mascotBusy: 'Downloading in the background… I can multitask 😎',
      advanced: 'Advanced',
      clearAria: 'Clear URL',
      clipboard: {
        toggle: 'Watch clipboard',
        toggleDescription: 'Auto-fill the URL field when you copy a video link.',
        dialog: {
          title: 'Video URL detected',
          body: 'Use this link from your clipboard?',
          useButton: 'Use URL',
          disableButton: 'Disable',
          cancelButton: 'Cancel',
          disableNote: 'You can re-enable clipboard watching later in Advanced settings.'
        }
      },
      cookies: {
        sourceLabel: 'Cookies source',
        sourceOff: 'Off',
        sourceFile: 'File',
        sourceBrowser: 'Browser',
        toggleDescription: 'Helps with age-restricted, members-only, and account-private videos.',
        risk: 'Risk: a cookies.txt contains every logged-in session for that browser — keep it private.',
        fileLabel: 'Cookies file',
        choose: 'Choose…',
        clear: 'Clear',
        placeholder: 'No file selected',
        helpLink: 'How do I export cookies?',
        enabledButNoFile: 'Pick a file to use cookies',
        browserLabel: 'Browser',
        browserPlaceholder: 'Pick a browser…',
        browserHelp: 'Reads cookies directly from the browser. The browser must be closed for Chromium-family browsers.',
        enabledButNoBrowser: 'Pick a browser to use cookies',
        banWarning: 'Sites like YouTube may flag — and sometimes ban — accounts whose cookies are used by yt-dlp. Use a throwaway account when possible.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Route traffic through a proxy — useful for geo-restricted content.',
        placeholder: 'http://host:port',
        clear: 'Clear'
      },
      limitRate: {
        label: 'Download speed limit',
        description: 'Cap bandwidth for media downloads. Request pacing below is usually the stronger rate-limit lever.',
        off: 'Off',
        custom: 'Custom…',
        customPlaceholder: 'e.g. 750K or 1.5M',
        invalid: 'Use a number followed by K or M (e.g. 500K, 1.5M)',
        activeWarning: 'Active downloads keep their current limit. Pause + Resume to apply changes.'
      },
      playlistProbeLimit: {
        label: 'Playlist items to scan',
        description: 'Maximum entries Arroxy loads when a playlist, channel, or search result is opened.',
        current: 'Current limit: {{count}} items',
        custom: 'Custom…',
        invalid: 'Use a whole number from 1 to 5000',
        tooltip: 'Maps to yt-dlp --playlist-end: Arroxy only asks for this many playlist, channel, or search entries while building the picker.'
      },
      networkPacing: {
        heading: 'Network pacing',
        description: 'Add small waits between yt-dlp network actions. Values are seconds unless noted.',
        presetLabel: 'How cautious should Arroxy be?',
        tooltip: 'yt-dlp supports sleeps between extraction requests, before downloads, and before subtitle downloads.',
        summary: 'Waits: {{requests}} between metadata requests, {{downloads}} before each download, {{subtitles}} before subtitle files. Fragment threads: {{fragments}}.',
        presets: {
          off: 'Off',
          balanced: 'Balanced',
          careful: 'Careful',
          custom: 'Custom'
        },
        tooltips: {
          off: 'Adds no request or download sleeps beyond Arroxy defaults.',
          balanced: 'Uses yt-dlp sleep-style pacing: short extraction sleeps and a randomized pause before downloads.',
          careful: 'Uses longer sleeps for large playlists or networks that frequently hit rate limits.',
          custom: 'Lets you tune the underlying yt-dlp pacing flags directly.'
        },
        fields: {
          sleepRequests: 'Wait between metadata requests',
          sleepInterval: 'Minimum wait before each download',
          maxSleepInterval: 'Maximum wait before each download',
          sleepSubtitles: 'Wait before subtitle files',
          concurrentFragments: 'Parallel fragment downloads'
        },
        units: {
          seconds: 'sec',
          threads: 'threads'
        }
      },
      closeToTray: {
        toggle: 'Hide to tray on close',
        toggleDescription: 'Continue downloads in the background after closing the window.'
      },
      analytics: {
        toggle: 'Send anonymous usage stats',
        toggleDescription: 'Counts app launches only. No URLs, filenames, or personal data.'
      }
    },
    subtitles: {
      autoBadge: 'Auto',
      noLanguages: 'No subtitles available for this video',
      skip: 'Skip',
      skipSubs: 'Skip for this video',
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
      autoAssNote: "Auto-captions will be saved as SRT instead of ASS — for YouTube videos they're cleaned of rolling-cue duplication, which our ASS converter can't replicate yet."
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
      keepAudio: 'Keep as-is',
      keepAudioMeta: 'Built-in audio',
      audioOnly: 'Audio only',
      audioOnlyOption: 'Audio only (no video)',
      mascot: "Best + Best = max quality. I'd pick that!",
      sniffing: 'Sniffing out the best formats for you…',
      loadingHint: 'Please wait until probing finishes — playlists and searches can take a while.',
      loadingAria: 'Loading formats',
      sizeUnknown: 'Size unknown',
      total: 'Total',
      skipToConfirm: 'Skip to confirm',
      skipToConfirmTooltip: 'Uses your saved preferences for all remaining steps. To change a setting, continue step by step instead — your choice will be saved for next time.',
      convert: {
        label: 'Convert',
        uncompressed: 'Convert · uncompressed',
        bitrate: 'Bitrate',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Audio conversion requires audio-only mode (deselect the video pick).',
        requiresLossy: 'A native stream is selected — bitrate only applies when converting to mp3, m4a, or opus.'
      },
      botWall: {
        heading: 'Probe was limited',
        bodyUnconfigured: 'The format list may be incomplete. Set up cookies in advanced settings, or change network and retry.',
        bodyDisabled: 'Cookies are configured but turned off. Enable them and retry to get the full list, or change network and retry.',
        bodyEnabled: 'Even with cookies, YouTube limited this probe. Try again later or switch network.',
        retryCta: 'Retry',
        enableRetryCta: 'Enable cookies and retry'
      },
      cookiesError: {
        heading: 'Cookies might be the cause',
        currentModeLabel: 'Cookies source',
        currentModeFile: 'File',
        currentModeBrowser: 'Browser',
        explanationFile: 'Your cookies file might be empty, expired, or in the wrong format (yt-dlp expects Netscape cookies.txt). Try re-exporting cookies, picking a different file, switching to Browser mode, or turning cookies off.',
        explanationBrowser: 'Cookies are read directly from the browser. If the browser is currently running, its cookie database may be locked (Chromium-family). The browser must also be signed in to YouTube. Try closing the browser, switching to a different browser, switching to File mode, or turning cookies off.',
        openSettingsCta: 'Open cookies settings',
        needsCookies: {
          heading: 'This site requires sign-in',
          body: "yt-dlp couldn't access this video without authentication. Configure cookies in advanced settings — point them at a browser you're already signed in to, or import a cookies.txt file."
        },
        dpapi: {
          heading: 'Chrome cookies blocked by Windows encryption',
          explanation: "Chrome 127 and newer encrypts cookies in a way other apps can't read on Windows. Try one of the workarounds below.",
          fixFirefoxLabel: 'Switch to Firefox',
          fixFirefoxBody: "Firefox doesn't use App-Bound Encryption. Open cookies settings and pick Firefox from the browser list.",
          fixFileLabel: 'Export cookies.txt',
          fixFileBody: 'Export cookies from Chrome with a browser extension, then switch this app to File mode and pick the exported file.',
          fixUnsafeLabel: 'Launch Chrome with App-Bound Encryption disabled',
          fixUnsafeBody: "Add --disable-features=LockProfileCookieDatabase to Chrome's launch shortcut. Warning: this invalidates previously encrypted cookies, so you'll be signed out of every site and need to log in again.",
          docsLinkLabel: 'yt-dlp docs (issue #10927)'
        }
      }
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
    output: {
      embedChapters: {
        label: 'Embed chapters',
        description: 'Chapter markers navigable in any modern player.'
      },
      embedMetadata: {
        label: 'Embed metadata',
        description: 'Title, artist, description, and upload date written into the file.'
      },
      embedThumbnail: {
        label: 'Embed thumbnail',
        description: 'Cover art inside the file. WebM video will be remuxed to MKV; skipped when subtitles are embedded.'
      },
      writeDescription: {
        label: 'Save description',
        description: 'Saves the video description as a .description text file next to the download.'
      },
      writeThumbnail: {
        label: 'Save thumbnail',
        description: 'Saves the thumbnail as a .jpg image file next to the download.'
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
      thumbnailEmbedNotSupported: 'Thumbnail embed skipped — output container does not support it.',
      subtitleEmbedAudioOnly: 'Subtitle embed changed to sidecar — audio tracks do not support embedded subtitle streams.',
      audioOnly: 'Audio only',
      addToQueue: '+ Queue',
      addToQueueTooltip: 'Adds to the queue — starts when the active download finishes',
      pullIt: 'Pull it! ↓',
      pullItTooltip: 'Skips the queue — starts now, runs alongside other active downloads',
      labelPlaylist: 'Playlist',
      labelPreset: 'Preset',
      labelItems: 'Items',
      itemsValue_one: '{{count}} of {{total}} video',
      itemsValue_other: '{{count}} of {{total}} videos',
      itemsValueAudio_one: '{{count}} of {{total}} track',
      itemsValueAudio_other: '{{count}} of {{total}} tracks'
    }
  },
  videoCard: {
    titlePlaceholder: 'Loading…'
  },
  queue: {
    header: 'Download Queue',
    toggleTitle: 'Toggle download queue',
    empty: 'Downloads you queue will appear here',
    noDownloads: 'No downloads yet.',
    activeCount: '{{count}} downloading · {{percent}}%',
    clear: 'Clear',
    clearTitle: 'Clear completed downloads',
    pauseAll: 'Pause queue',
    pauseAllTitle: 'Pause every active download and stop new ones from starting',
    resumeAll: 'Resume queue',
    resumeAllTitle: 'Resume paused downloads and let the queue keep going',
    cancelAll: 'Cancel all',
    cancelAllTitle: 'Cancel all active and pending downloads',
    limitRate: 'Speed: {{value}}',
    limitRateOff: 'Speed: Off',
    limitRateTitle: 'Bandwidth limit for downloads',
    tip: 'Your download is queued below — open anytime to track progress.',
    item: {
      doneAt: 'Done {{time}}',
      paused: 'Paused',
      defaultError: 'Download failed',
      openUrl: 'Open URL',
      pause: 'Pause',
      hold: 'Hold',
      resume: 'Resume',
      cancel: 'Cancel',
      remove: 'Remove',
      pullNow: 'Pull now — skip the queue',
      priorityBadge: 'Priority',
      statusPending: 'Waiting',
      statusRunning: 'Downloading',
      statusHeld: 'Held',
      statusPaused: 'Paused',
      statusDone: 'Done',
      statusError: 'Error',
      statusCancelled: 'Cancelled'
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
    copied: 'Copied command to clipboard',
    installFailed: 'Update failed',
    retry: 'Retry'
  },
  status: {
    preparingBinaries: 'Preparing binaries…',
    mintingToken: 'Minting YouTube token…',
    remintingToken: 'Re-minting token…',
    startingYtdlp: 'Starting yt-dlp process…',
    downloadingMedia: 'Downloading video & audio…',
    mergingFormats: 'Merging audio and video…',
    extractingAudio: 'Converting audio…',
    convertingVideo: 'Converting video…',
    embeddingMetadata: 'Embedding metadata…',
    movingFiles: 'Moving files…',
    fetchingSubtitles: 'Fetching subtitles…',
    sleepingBetweenRequests: 'Waiting {{seconds}}s to avoid rate limits…',
    subtitlesFailed: 'Video saved — some subtitles could not be downloaded',
    cancelled: 'Download cancelled',
    complete: 'Download complete',
    usedExtractorFallback: 'Downloaded with relaxed extractor — set up a cookies.txt for more reliable downloads',
    ytdlpProcessError: 'yt-dlp process error: {{error}}',
    ytdlpExitCode: 'yt-dlp exited with code {{code}}',
    downloadingBinary: 'Downloading {{name}} binary…',
    unknownStartupFailure: 'Unknown download startup failure',
    diskSpaceInsufficient: 'Not enough disk space — need {{required}}, only {{free}} available',
    fetchingSponsorBlock: 'Contacting SponsorBlock…',
    retryingSponsorBlock: 'SponsorBlock unavailable, retrying ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: "Bot protection triggered. The IP you're using is most likely flagged (datacenter range or busy VPN exit). Change your IP or pick a different VPN endpoint and retry. If it keeps failing, this may be a temporary site-side change — Arroxy auto-updates yt-dlp on launch, so the fix lands automatically once upstream ships it.",
      ipBlock: 'Your IP address appears to be blocked. Try again later or use a VPN.',
      rateLimit: 'Site is rate-limiting requests. Wait a minute then retry.',
      ageRestricted: 'This video is age-restricted and cannot be downloaded without a signed-in account.',
      unavailable: 'This video is unavailable — it may be private, deleted, or region-locked.',
      geoBlocked: 'This video is not available in your region.',
      outOfDiskSpace: 'Not enough disk space. Free up space and retry.',
      unsupportedUrl: "That URL isn't supported by yt-dlp. Try a different link from any of yt-dlp's supported sites.",
      chunkTransferFailure: 'The server kept cutting the download mid-stream and yt-dlp gave up after retrying. This usually hits the largest video formats (4K HDR / high-bitrate VP9). Retry, switch network/VPN, or pick a lower-resolution format.',
      postprocessFailure: 'yt-dlp finished downloading but post-processing (merge / mux / convert) failed. Often this is a transient ffmpeg issue — retry, and if it persists try a different format combination.',
      parse: "Couldn't parse the response from the site. yt-dlp's extractor may have drifted. Arroxy auto-updates yt-dlp on launch — retry in a few minutes once the fix ships.",
      network: 'Network error. Check your connection and retry.',
      drmProtected: "This video is DRM-protected. yt-dlp can't strip DRM, so the file can't be downloaded.",
      loginRequired: 'This video requires a signed-in account. Set up a cookies.txt (Settings → Cookies) and retry.',
      unknown: 'Download failed. See the raw output below.'
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
  playlistPresets: {
    'video-best': { label: 'Best quality', desc: 'Highest available video + audio per item' },
    'video-2160p': { label: 'Up to 4K', desc: 'Capped at 2160p, falls back to lower per item' },
    'video-1440p': { label: 'Up to 1440p', desc: 'Capped at 2K, falls back to lower per item' },
    'video-1080p': { label: 'Up to 1080p', desc: 'Capped per item, falls back to lower' },
    'video-720p': { label: 'Up to 720p', desc: 'Smaller files, broad compatibility' },
    'video-480p': { label: 'Up to 480p', desc: 'Low bandwidth' },
    'video-360p': { label: 'Up to 360p', desc: 'Smallest video' },
    'audio-best': { label: 'Audio (best)', desc: 'Native best audio, no re-encode' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'Convert to MP3 192 kbps' }
  },
  formatLabel: {
    audioFallback: 'Audio',
    audioOnlyDot: 'Audio only · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Idle',
      statusActive_one: '1 downloading · {{percent}}%',
      statusActive_other: '{{count}} downloading · {{percent}}%',
      open: 'Open Arroxy',
      quit: 'Quit Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} download in progress',
      message_other: '{{count}} downloads in progress',
      detail: 'Pause to resume later, or cancel to discard progress.',
      confirm: 'Cancel Downloads & Quit',
      pause: 'Pause Downloads & Quit',
      keep: 'Keep Downloading'
    },
    closeToTray: {
      message: 'Hide Arroxy to the system tray when closing?',
      detail: 'Arroxy keeps running and finishes active downloads. Change this later in Advanced settings.',
      hide: 'Hide to tray',
      quit: 'Quit',
      remember: "Don't ask again"
    },
    rendererCrashed: {
      message: 'Arroxy encountered a problem',
      detail: 'The renderer process crashed ({{reason}}). Reload to try again.',
      reload: 'Reload',
      quit: 'Quit'
    }
  },
  share: {
    title: 'Share Arroxy',
    description: 'Arroxy is free and open-source. Sharing helps more people discover it.',
    copyLink: 'Copy link',
    copied: 'Copied!',
    defaultMessage: 'Arroxy — free, open-source video downloader for Windows, macOS & Linux. Works with YouTube, Vimeo, Twitch, and 1850+ sites.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Share Arroxy',
    footerLabel: 'Share',
    shareAction: 'Share Arroxy',
    inlineCard: {
      body: 'Enjoying Arroxy? Share it with someone who might find it useful.',
      dismiss: 'Dismiss share suggestion'
    },
    highValueBanner: {
      body: 'Enjoying Arroxy? Help others discover it.',
      dismiss: 'Dismiss share suggestion'
    }
  }
} as const;

export default en;
