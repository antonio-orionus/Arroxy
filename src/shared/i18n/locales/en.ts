const en = {
  common: {
    back: 'Back',
    cancel: 'Cancel',
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
      bulkHeading: 'Bulk URLs',
      itemCount_one: '{{count}} video',
      itemCount_other: '{{count}} videos',
      itemCountAudio_one: '{{count}} track',
      itemCountAudio_other: '{{count}} tracks',
      itemCountBulk_one: '{{count}} URL',
      itemCountBulk_other: '{{count}} URLs',
      bulkMetadataResolving: 'Fetching video details… {{done}}/{{total}}',
      bulkRowWaiting: 'Waiting',
      bulkRowResolving: 'Fetching details',
      bulkRowFailed: 'Details unavailable',
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
      syncChange: 'Change folder…',
      syncApply: 'Apply sync',
      syncScanning: 'Checking folder…',
      syncFoundTitle: 'Already in folder',
      syncFoundDesc: '{{n}} of these videos are already in {{dir}}. Sync to download only the new ones?',
      syncNoneTitle: 'Nothing downloaded yet',
      syncNoneDesc: 'No videos from this playlist were found in {{dir}}.',
      alreadyDownloaded: 'Already downloaded',
      probeLimitAlertTitle: 'Playlist scan is capped',
      probeLimitAlertDesc: 'Showing first {{count}} items. Increase the load limit to see more.'
    },
    bulk: {
      title: 'Bulk URLs',
      description: 'Paste individual video or audio URLs. Arroxy will clean duplicates and flag playlist or channel links before queueing.',
      textareaLabel: 'URL list',
      textareaPlaceholder: 'https://example.com/video-1\nhttps://example.com/video-2\nhttps://example.com/video-3',
      acceptedCount: 'Ready',
      ignoredCount: 'Ignored',
      emptyPreview: 'Paste at least two URLs to preview the batch.',
      needsTwo: 'Add at least two supported URLs to continue.',
      confirm: 'Use these URLs',
      reject: {
        duplicate: 'Duplicate',
        playlist: 'Use playlist flow',
        channel: 'Use channel flow'
      }
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
      fetchFormatsTooltip: 'Choose formats, subtitles, folder, and playlist items step by step before queueing.',
      quickDownload: 'Quick download',
      quickDownloadTooltip: 'Uses your saved or default preferences and adds this single video to the queue without opening the setup steps.',
      quickPreparing: 'Preparing',
      quickQueued: 'Added to queue',
      quickSingleOnly: 'Quick download is for single videos. Use Fetch formats for playlists and channels.',
      quickProbeFailed: 'Probe failed',
      quickPrepareFailed: 'Queue item could not be prepared',
      quickFailed: "Couldn't add this one: {{error}}",
      bulkButton: 'Bulk URLs',
      bulkTooltip: 'Paste a list of individual URLs, preview the cleaned list, then queue them with one shared quality preset.',
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
          bulkTitle: 'Bulk URLs detected',
          bulkBody: 'Use these clipboard links as a bulk download?',
          bulkSummary: '{{count}} URLs ready',
          bulkIgnored: '{{count}} ignored',
          bulkButton: 'Bulk download',
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
        option: '{{count}} items',
        current: 'Current limit: {{count}} items',
        customValue: 'Custom: {{count}} items',
        custom: 'Custom…',
        customDialogTitle: 'Custom playlist scan limit',
        customDialogDescription: 'Use a whole number from {{min}} to {{max}}.',
        customDialogCancel: 'Cancel',
        customDialogSave: 'Save limit',
        invalid: 'Use a whole number from 1 to 5000',
        tooltip: 'Maps to yt-dlp --playlist-end: Arroxy only asks for this many playlist, channel, or search entries while building the picker.'
      },
      singleFilenameId: {
        toggle: 'Add video ID to single filenames',
        toggleDescription: 'Keeps one-off downloads unique when titles change or collide.'
      },
      networkPacing: {
        heading: 'Gentle downloads',
        description: 'Add small waits during each download so Arroxy does not hit the site too aggressively. Values are seconds unless noted.',
        presetLabel: 'How cautious should Arroxy be?',
        tooltip: 'These waits happen inside each download. Arroxy still keeps normal queued downloads one-at-a-time.',
        summary: 'Waits: {{requests}} between checks, {{downloads}} before media starts, {{subtitles}} before subtitle files. Connections: {{fragments}}.',
        presets: {
          off: 'Off',
          balanced: 'Balanced',
          careful: 'Careful',
          custom: 'Custom'
        },
        tooltips: {
          off: 'Uses only the small baseline pauses Arroxy keeps for media and subtitles.',
          balanced: 'Default. Adds short pauses and uses one download connection.',
          careful: 'Adds longer pauses for large playlists or networks that frequently hit limits.',
          custom: 'Tune the advanced per-download controls yourself.'
        },
        fields: {
          sleepRequests: 'Wait between metadata checks',
          sleepInterval: 'Pause before media starts: min',
          maxSleepInterval: 'Pause before media starts: max',
          sleepSubtitles: 'Wait before subtitle files',
          concurrentFragments: 'Download connections'
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
      },
      writeM3u: {
        label: 'Generate .m3u playlist file',
        description: 'Save an .m3u playlist alongside the videos so they open in order in your media player.'
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
      labelBulk: 'Batch',
      labelPreset: 'Preset',
      labelItems: 'Items',
      itemsValue_one: '{{count}} of {{total}} video',
      itemsValue_other: '{{count}} of {{total}} videos',
      itemsValueAudio_one: '{{count}} of {{total}} track',
      itemsValueAudio_other: '{{count}} of {{total}} tracks',
      itemsValueBulk_one: '{{count}} of {{total}} URL',
      itemsValueBulk_other: '{{count}} of {{total}} URLs'
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
    type: { video: 'Video', audio: 'Audio' },
    videoFormat: {
      best: 'Best codec',
      mp4: 'MP4 (H.264)'
    },
    videoFormatDesc: {
      best: 'Highest available codec per item',
      mp4: 'H.264 + AAC preferred, MP4 container · best-effort'
    },
    tier: {
      best: 'Best quality',
      '2160': 'Up to 4K',
      '1440': 'Up to 1440p',
      '1080': 'Up to 1080p',
      '720': 'Up to 720p',
      '480': 'Up to 480p',
      '360': 'Up to 360p'
    },
    tierDesc: {
      best: 'Highest available video + audio per item',
      '2160': 'Capped at 2160p, falls back to lower per item',
      '1440': 'Capped at 2K, falls back to lower per item',
      '1080': 'Capped at 1080p, falls back to lower per item',
      '720': 'Smaller files, broad compatibility',
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
      best: 'Native best audio, no re-encode',
      mp3: 'Convert to MP3',
      m4a: 'Convert to M4A (AAC)',
      opus: 'Convert to Opus'
    },
    audioFormatBitrate: 'Audio ({{format}} {{kbps}}K)',
    mp4Cap: 'H.264 above 1080p is not available on YouTube — capped to 1080p automatically'
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
