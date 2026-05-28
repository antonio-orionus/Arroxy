const zh = {
  common: {
    back: '返回',
    continue: '继续',
    retry: '重试',
    startOver: '重新开始'
  },
  app: {
    feedback: '反馈',
    logs: '日志',
    feedbackNudge: '喜欢 Arroxy 吗?我很想听听你的想法! 💬',
    debugCopied: '已复制!',
    debugCopyTitle: '复制调试信息(Electron、操作系统、Chrome 版本)',
    zoomIn: '放大',
    zoomOut: '缩小'
  },
  about: {
    button: '关于',
    openTitle: '关于 Arroxy',
    tagline: '快速易用的桌面视频与音频下载工具。',
    websiteLink: '官网',
    githubLink: 'GitHub',
    licenseLine: 'MIT 许可证 · 作者 Antonio Orionus',
    thirdPartyNotices: '查看第三方声明'
  },
  titleBar: {
    close: '关闭',
    minimize: '最小化',
    maximize: '最大化',
    restore: '还原'
  },
  splash: {
    greeting: '嘿,欢迎回来!',
    warmup: 'Arroxy 正在启动…',
    downloading: '正在下载 {{binary}}…',
    warmupFailedNoDiag: '初始化失败。打开设置日志查看详情。'
  },
  repair: {
    title: '初始化需要你的帮助',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: '无法验证。',
      downloadFailed: '下载失败。请检查网络连接后重试。',
      extractFailed: '解压缩失败。下载文件可能已损坏——请重试。',
      hashFailed: '下载文件的校验和不匹配。请重新下载。',
      spawnFailed: '文件缺失或无法启动。请选择一个可用的副本。',
      permissionDenied: '系统拒绝运行该文件。请选择你信任的副本，或以管理员身份重试。',
      blockedOrQuarantined: 'Windows 阻止了该文件（SmartScreen / Defender）。请选择已安装的副本或将运行时文件夹加入白名单。',
      badExitCode: '该二进制文件未响应 --version。可能已损坏或版本不匹配。',
      timeout: '版本检测超时。该文件可能卡住了——请重试。',
      pairIncomplete: 'ffmpeg 和 ffprobe 必须作为配对一起设置。'
    },
    actions: {
      chooseExecutable: '选择可执行文件',
      resetToDefault: '恢复默认',
      retrySetup: '重试初始化',
      cancel: '取消',
      openDependencyFolder: '打开依赖文件夹',
      viewSetupLog: '查看设置日志'
    }
  },
  theme: {
    light: '浅色模式',
    dark: '深色模式',
    system: '跟随系统'
  },
  language: {
    label: '语言'
  },
  wizard: {
    steps: {
      url: '链接',
      playlistItems: 'Playlist',
      playlistPresets: '画质',
      formats: '格式',
      subtitles: '字幕',
      sponsorblock: 'SponsorBlock',
      output: '输出',
      folder: '保存',
      confirm: '确认'
    },
    playlist: {
      heading: 'Playlist 视频',
      itemCount_one: '{{count}} 个视频',
      itemCount_other: '{{count}} 个视频',
      itemCountAudio_one: '{{count}} 首曲目',
      itemCountAudio_other: '{{count}} 首曲目',
      selectAll: '全选',
      selectNone: '取消全选',
      rangeFrom: '从',
      rangeTo: '到',
      rangeApply: '应用范围',
      selectedCount_one: '已选 {{count}} 个',
      selectedCount_other: '已选 {{count}} 个',
      noSelection: '请至少选择一个视频以继续',
      loadingItems: '正在获取 Playlist…',
      thumbnailAlt: '视频缩略图',
      durationUnknown: '直播'
    },
    playlistPresets: {
      heading: '选择批量下载画质',
      subhead: '每个视频独立匹配所选画质档位——混合内容的播放列表也能正常处理，无意外。',
      itemCount_one: '{{count}} 项',
      itemCount_other: '{{count}} 项'
    },
    mixedPrompt: {
      title: '此链接包含 Playlist',
      body: '只想下载你点击的那个视频，还是从 Playlist 中挑选？下一步可以选择特定视频或指定范围。',
      singleVideo: '就这一个',
      pickFromPlaylist: '从 Playlist 中挑选'
    },

    url: {
      heading: 'YouTube 链接',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: '获取格式',
      features: {
        heading: 'Arroxy 能下载什么',
        youtube: {
          heading: 'YouTube',
          video: '视频',
          channel: '频道',
          playlist: '播放列表',
          short: 'Shorts',
          music: '音乐',
          podcast: '播客'
        },
        anySite: {
          heading: '2000+ 个网站',
          video: '视频',
          videoPlaylist: '视频播放列表',
          musicPlaylist: '音乐播放列表'
        },
        always: {
          heading: '始终可用',
          audioOnly: '纯音频',
          subtitles: '字幕'
        }
      },
      mascotIdle: '丢一个 YouTube 链接给我(视频或 Shorts 都行)— 点「获取格式」我就开始干活 ✨',
      mascotBusy: '正在后台下载… 我可以同时处理多个任务 😎',
      advanced: '高级',
      clearAria: '清除 URL',
      clipboard: {
        toggle: '监听剪贴板',
        toggleDescription: '复制 YouTube 链接时自动填充 URL 字段。',
        dialog: {
          title: '检测到 YouTube 链接',
          body: '使用剪贴板中的此链接吗?',
          useButton: '使用 URL',
          disableButton: '禁用',
          cancelButton: '取消',
          disableNote: '你可以稍后在高级设置中重新启用剪贴板监听。'
        }
      },
      cookies: {
        sourceLabel: 'Cookies 来源',
        sourceOff: '关闭',
        sourceFile: '文件',
        sourceBrowser: '浏览器',
        toggleDescription: '可帮助下载年龄限制、会员专属和账户私享的视频。',
        risk: '风险: cookies.txt 包含该浏览器所有已登录的会话 — 请妥善保管。',
        fileLabel: 'Cookie 文件',
        choose: '选择…',
        clear: '清除',
        placeholder: '未选择文件',
        helpLink: '如何导出 Cookie?',
        enabledButNoFile: '请选择一个文件以使用 Cookie',
        browserLabel: '浏览器',
        browserPlaceholder: '选择浏览器…',
        browserHelp: '直接从浏览器读取 cookies。Chromium 系列浏览器使用时必须先关闭。',
        enabledButNoBrowser: '请选择一个浏览器以使用 Cookie',
        banWarning: '提醒: yt-dlp 使用的 Cookie 对应账号可能被 YouTube 标记,有时甚至被封禁。建议尽量使用临时小号。',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: '本地获取 cookies.txt (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: '通过代理路由流量 — 适用于地区限制内容。',
        placeholder: 'http://host:port',
        clear: '清除'
      },
      closeToTray: {
        toggle: '关闭时最小化到托盘',
        toggleDescription: '关闭窗口后继续在后台下载。'
      },
      analytics: {
        toggle: '发送匿名使用统计',
        toggleDescription: '仅统计应用启动次数，不包含任何URL、文件名或个人数据。'
      }
    },
    subtitles: {
      autoBadge: '自动',
      noLanguages: '该视频没有字幕',
      skip: '跳过',
      skipSubs: '本视频跳过',
      mascot: '选零个、一个或多个 — 完全由你决定 ✨',
      searchPlaceholder: '搜索语言…',
      noMatches: '没有匹配的语言',
      clearAll: '清除全部',
      noSelected: '未选择字幕',
      selectedNote_one: '将下载 {{count}} 个字幕',
      selectedNote_other: '将下载 {{count}} 个字幕',
      sectionManual: '手动',
      sectionAuto: '自动生成',
      saveMode: {
        heading: '保存方式',
        sidecar: '与视频同位置',
        embed: '嵌入到视频',
        subfolder: 'subtitles/ 子文件夹'
      },
      format: {
        heading: 'Format'
      },
      embedNote: '嵌入模式将输出保存为 .mkv，以便可靠地嵌入字幕轨道。',
      autoAssNote: '自动字幕将保存为 SRT 而非 ASS —— 它们会被清除 YouTube 的滚动重复字幕，但我们的 ASS 转换器目前还无法做到这一点。'
    },
    sponsorblock: {
      modeHeading: '赞助商过滤',
      mode: {
        off: '关闭',
        mark: '标记为章节',
        remove: '删除片段'
      },
      modeHint: {
        off: '不使用 SponsorBlock — 视频按上传状态播放。',
        mark: '将赞助商片段标记为章节（非破坏性）。',
        remove: '使用 FFmpeg 从视频中删除赞助商片段。'
      },
      categoriesHeading: '类别',
      cat: {
        sponsor: '赞助商',
        intro: '片头',
        outro: '片尾',
        selfpromo: '自我宣传',
        music_offtopic: '与音乐无关',
        preview: '预览',
        filler: '填充内容'
      }
    },
    formats: {
      quickPresets: '快速预设',
      video: '视频',
      audio: '音频',
      noAudio: '无音频',
      videoOnly: '仅视频',
      audioOnly: '仅音频',
      audioOnlyOption: '仅音频(无视频)',
      mascot: '最佳画质 + 最佳音质 = 最高质量。我会选这个!',
      sniffing: '正在为你寻找最佳格式…',
      loadingHint: '请等待探测完成，播放列表和搜索可能需要一些时间。',
      loadingAria: '正在加载格式',
      sizeUnknown: '大小未知',
      total: '总计',
      skipToConfirm: '跳至确认',
      skipToConfirmTooltip: '使用您保存的偏好设置完成所有剩余步骤。若要更改某项设置，请逐步继续操作——您的选择将在下次保存。',
      keepAudio: '保持原样',
      keepAudioMeta: '内置音频',
      convert: {
        label: '转换',
        uncompressed: '转换 · 无损',
        bitrate: '比特率',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: '音频转换需要仅音频模式（取消选择视频选项）。',
        requiresLossy: '已选择原生流——比特率仅在转换为 mp3、m4a 或 opus 时适用。'
      },
      botWall: {
        heading: 'YouTube 限制了本次探测',
        bodyUnconfigured: '格式列表可能不完整。请在高级设置中配置 cookies，或更换网络后重试。',
        bodyDisabled: 'Cookies 已配置但未启用。启用后重试可获取完整列表，或更换网络后重试。',
        bodyEnabled: '即使使用了 cookies，YouTube 仍然限制了本次探测。请稍后重试或更换网络。',
        retryCta: '重试',
        enableRetryCta: '启用 cookies 并重试'
      },
      cookiesError: {
        heading: 'Cookies 可能是原因所在',
        currentModeLabel: 'Cookies 来源',
        currentModeFile: '文件',
        currentModeBrowser: '浏览器',
        explanationFile: '你的 cookies 文件可能为空、已过期或格式不正确（yt-dlp 需要 Netscape cookies.txt 格式）。请尝试重新导出 cookies、选择其他文件、切换到浏览器模式或关闭 cookies。',
        explanationBrowser: 'Cookies 直接从浏览器读取。如果浏览器当前正在运行，其 cookie 数据库可能已被锁定（Chromium-family）。浏览器还必须已登录 YouTube。请尝试关闭浏览器、切换到其他浏览器、切换到文件模式或关闭 cookies。',
        needsCookies: {
          heading: '此网站需要登录',
          body: 'yt-dlp 无法在未经认证的情况下访问此视频。请在高级设置中配置 cookies——指向你已登录的浏览器，或导入 cookies.txt 文件。'
        },
        openSettingsCta: '打开 cookies 设置',
        dpapi: {
          heading: 'Chrome Cookies 被 Windows 加密阻止',
          explanation: 'Chrome 127 及更新版本以其他应用在 Windows 上无法读取的方式加密 cookies。请尝试以下任一解决方法。',
          fixFirefoxLabel: '切换到 Firefox',
          fixFirefoxBody: 'Firefox 不使用 App-Bound Encryption。打开 cookies 设置，从浏览器列表中选择 Firefox。',
          fixFileLabel: '导出 cookies.txt',
          fixFileBody: '使用浏览器扩展从 Chrome 导出 cookies，然后将此应用切换到文件模式并选择导出的文件。',
          fixUnsafeLabel: '以禁用 App-Bound Encryption 的方式启动 Chrome',
          fixUnsafeBody: '在 Chrome 的启动快捷方式中添加 --disable-features=LockProfileCookieDatabase。警告：这将使之前加密的 cookies 失效，你将被所有网站登出，需要重新登录。',
          docsLinkLabel: 'yt-dlp 文档（issue #10927）'
        }
      }
    },
    folder: {
      heading: '保存到',
      downloads: '下载',
      videos: '影片',
      desktop: '桌面',
      music: '音乐',
      documents: '文档',
      pictures: '图片',
      home: '主目录',
      custom: '自定义…',
      subfolder: {
        toggle: '保存到子文件夹',
        placeholder: '例如 lo-fi rips',
        invalid: '文件夹名包含无效字符'
      }
    },
    output: {
      embedChapters: {
        label: '嵌入章节',
        description: '可在任何现代播放器中导航的章节标记。'
      },
      embedMetadata: {
        label: '嵌入元数据',
        description: '将标题、艺术家、描述和上传日期写入文件。'
      },
      embedThumbnail: {
        label: '嵌入缩略图',
        description: '文件内封面图。WebM 视频将重新封装为 MKV；嵌入字幕时跳过。'
      },
      writeDescription: {
        label: '保存描述',
        description: '将视频描述保存为 .description 文本文件，放在下载文件旁边。'
      },
      writeThumbnail: {
        label: '保存缩略图',
        description: '将缩略图保存为 .jpg 图片文件，放在下载文件旁边。'
      }
    },
    confirm: {
      readyHeadline: '已经准备好下载!',
      landIn: '文件将保存至',
      labelVideo: '视频',
      labelAudio: '音频',
      labelSubtitles: '字幕',
      subtitlesNone: '—',
      labelSaveTo: '保存位置',
      labelSize: '大小',
      sizeUnknown: '未知',
      nothingToDownload: '「仅字幕」预设已启用，但未选择任何字幕语言 — 不会下载任何内容。',
      thumbnailEmbedNotSupported: 'Thumbnail embed 已跳过 — 输出 container 不支持此功能。',
      subtitleEmbedAudioOnly: 'Subtitle embed 已改为 sidecar — 纯音频轨道不支持嵌入字幕流。',
      audioOnly: '仅音频',
      addToQueue: '+ 队列',
      addToQueueTooltip: '其他下载完成后开始 — 享受全部带宽',
      pullIt: '开始下载! ↓',
      pullItTooltip: '立即开始 — 与其他活动下载并行运行',
      labelPlaylist: '播放列表',
      labelPreset: '预设',
      labelItems: '项目',
      itemsValue_one: '{{total}} 个视频中的 {{count}} 个',
      itemsValue_other: '{{total}} 个视频中的 {{count}} 个',
      itemsValueAudio_one: '{{total}} 首曲目中的 {{count}} 首',
      itemsValueAudio_other: '{{total}} 首曲目中的 {{count}} 首'
    }
  },
  videoCard: {
    titlePlaceholder: '加载中…'
  },
  queue: {
    header: '下载队列',
    toggleTitle: '展开/收起下载队列',
    empty: '加入队列的下载会显示在这里',
    noDownloads: '还没有下载任务。',
    activeCount: '正在下载 {{count}} 项 · {{percent}}%',
    clear: '清空',
    clearTitle: '清除已完成的下载',
    pauseAll: '全部暂停',
    pauseAllTitle: '暂停所有正在进行的下载',
    cancelAll: '全部取消',
    cancelAllTitle: '取消所有正在进行和等待中的下载',
    tip: '你的下载已在下方队列 — 随时打开查看进度。',
    item: {
      doneAt: '{{time}} 完成',
      paused: '已暂停',
      defaultError: '下载失败',
      openUrl: '打开链接',
      pause: '暂停',
      hold: '搁置',
      resume: '继续',
      cancel: '取消',
      remove: '移除'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: '已发布',
    youHave: '— 当前版本 {{currentVersion}}',
    install: '安装并重启',
    downloading: '下载中…',
    download: '下载 ↗',
    dismiss: '关闭更新提示',
    copy: '复制命令到剪贴板',
    copied: '命令已复制到剪贴板',
    installFailed: '更新失败',
    retry: '重试'
  },
  status: {
    preparingBinaries: '正在准备二进制文件…',
    mintingToken: '正在生成 YouTube 令牌…',
    remintingToken: '正在重新生成令牌…',
    startingYtdlp: '正在启动 yt-dlp 进程…',
    downloadingMedia: '正在下载视频和音频…',
    mergingFormats: '正在合并音视频…',
    extractingAudio: '正在转换音频…',
    convertingVideo: '正在转换视频…',
    embeddingMetadata: '正在嵌入元数据…',
    movingFiles: '正在移动文件…',
    fetchingSubtitles: '正在获取字幕…',
    sleepingBetweenRequests: '等待 {{seconds}} 秒以避免限流…',
    subtitlesFailed: '视频已保存 — 部分字幕未能下载',
    cancelled: '下载已取消',
    complete: '下载完成',
    usedExtractorFallback: '已使用简化提取模式完成下载 — 配置 cookies.txt 可让下载更稳定',
    ytdlpProcessError: 'yt-dlp 进程错误: {{error}}',
    ytdlpExitCode: 'yt-dlp 以代码 {{code}} 退出',
    downloadingBinary: '正在下载二进制 {{name}}…',
    unknownStartupFailure: '启动下载时出现未知错误',
    diskSpaceInsufficient: '磁盘空间不足 — 需要 {{required}}，当前仅剩 {{free}}',
    fetchingSponsorBlock: '正在连接 SponsorBlock…',
    retryingSponsorBlock: 'SponsorBlock 暂时不可用，正在重试 ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: '触发了机器人保护。你所使用的 IP 很可能已被标记（数据中心地址段或繁忙的 VPN 出口）。请更换 IP 或选择其他 VPN 节点后重试。如果持续失败，这可能是 YouTube 临时性的变动——Arroxy 会在启动时自动更新 yt-dlp，一旦上游发布修复，会自动生效。',
      ipBlock: '你的 IP 地址似乎被 YouTube 屏蔽。请稍后再试或使用 VPN。',
      rateLimit: 'YouTube 正在限制请求频率。等一分钟后再重试。',
      ageRestricted: '该视频有年龄限制,未登录账号无法下载。',
      unavailable: '该视频不可用 — 可能是私有、已删除或受地区限制。',
      geoBlocked: '该视频在你所在的地区不可用。',
      outOfDiskSpace: '磁盘空间不足。请清理空间后重试。',
      unsupportedUrl: '这看起来不像视频链接。请粘贴 YouTube 视频、Short 或播放列表的链接。',
      chunkTransferFailure: '服务器在传输过程中反复中断下载，yt-dlp 多次重试后放弃。此问题通常出现在最大的视频格式（4K HDR / 高码率 VP9）上。请重试、切换网络或 VPN，或选择分辨率较低的格式。',
      postprocessFailure: 'yt-dlp 已完成下载，但后处理（合并 / mux / 转换）失败。这通常是 ffmpeg 的临时问题——请重试，如果仍然失败，请尝试其他格式组合。',
      parse: '无法解析网站的响应。yt-dlp 的提取器可能已过时。Arroxy 会在启动时自动更新 yt-dlp——请几分钟后再重试，等待修复发布。',
      network: '网络错误。请检查你的连接并重试。',
      drmProtected: '该视频受 DRM 保护。yt-dlp 无法去除 DRM，因此无法下载该文件。',
      loginRequired: '该视频需要已登录的账号。请设置 cookies.txt（设置 → Cookies）后重试。',
      unknown: '下载失败。请查看下方的原始输出。'
    }
  },
  presets: {
    'best-quality': {
      label: '最佳画质',
      desc: '最高分辨率 + 最佳音频'
    },
    balanced: {
      label: '均衡',
      desc: '720p 上限 + 优质音频'
    },
    'audio-only': {
      label: '仅音频',
      desc: '不下载视频,只要最佳音频'
    },
    'small-file': {
      label: '小文件',
      desc: '最低分辨率 + 低音质'
    },
    'subtitle-only': {
      label: '仅字幕',
      desc: '无视频无音频，仅字幕'
    }
  },
  playlistPresets: {
    'video-best': { label: '最佳画质', desc: '每项最高分辨率 + 最佳音频' },
    'video-2160p': { label: '最高 4K', desc: '上限 2160p，每项自动降级' },
    'video-1440p': { label: '最高 1440p', desc: '上限 2K，每项自动降级' },
    'video-1080p': { label: '最高 1080p', desc: '每项上限，自动降级' },
    'video-720p': { label: '最高 720p', desc: '文件较小，兼容性好' },
    'video-480p': { label: '最高 480p', desc: '低流量' },
    'video-360p': { label: '最高 360p', desc: '最小视频' },
    'audio-best': { label: 'Audio (best)', desc: '原生最佳音频，无需重新编码' },
    'audio-mp3': { label: 'Audio (MP3)', desc: '转换为 MP3 192 kbps' }
  },
  formatLabel: {
    audioFallback: '音频',
    audioOnlyDot: '仅音频 · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: '空闲',
      statusActive_one: '1个下载中 · {{percent}}%',
      statusActive_other: '{{count}}个下载中 · {{percent}}%',
      open: '打开 Arroxy',
      quit: '退出 Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '正在进行 {{count}} 个下载',
      message_other: '正在进行 {{count}} 个下载',
      detail: '关闭将取消所有正在进行的下载。',
      confirm: '取消下载并退出',
      keep: '继续下载'
    },
    closeToTray: {
      message: '关闭时将 Arroxy 最小化到系统托盘？',
      detail: 'Arroxy 将继续运行并完成活动下载。可在高级设置中更改。',
      hide: '最小化到托盘',
      quit: '退出',
      remember: '不再询问'
    },
    rendererCrashed: {
      message: 'Arroxy 遇到了一个问题',
      detail: '渲染进程崩溃（{{reason}}）。请重新加载以重试。',
      reload: '重新加载',
      quit: '退出'
    }
  },
  share: {
    title: '分享 Arroxy',
    description: 'Arroxy 免费且开源。分享它可以帮助更多人发现它。',
    copyLink: '复制链接',
    copied: '已复制！',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: '分享 Arroxy',
    footerLabel: '分享',
    shareAction: '分享 Arroxy',
    inlineCard: {
      body: '喜欢 Arroxy 吗？把它分享给可能觉得有用的人吧。',
      dismiss: '关闭分享建议'
    },
    highValueBanner: {
      body: '喜欢 Arroxy 吗？帮助其他人发现它。',
      dismiss: '关闭分享建议'
    }
  }
} as const;

export default zh;
