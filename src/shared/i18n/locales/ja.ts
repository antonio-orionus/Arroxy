const ja = {
  common: {
    back: '戻る',
    continue: '続行',
    retry: '再試行',
    startOver: '最初からやり直す',
    loading: '読み込み中…'
  },
  app: {
    feedback: 'フィードバック',
    logs: 'ログ',
    feedbackNudge: 'Arroxyを楽しんでくれてる?ぜひ感想を聞かせて! 💬',
    debugCopied: 'コピーしました!',
    debugCopyTitle: 'デバッグ情報をコピー (Electron、OS、Chrome のバージョン)',
    zoomIn: '拡大',
    zoomOut: '縮小'
  },
  titleBar: {
    close: '閉じる',
    minimize: '最小化',
    maximize: '最大化',
    restore: '元に戻す'
  },
  splash: {
    greeting: 'やあ、おかえり!',
    warmup: 'Arroxyを起動中…',
    warning: 'セットアップが未完了 — 一部の機能が動作しない可能性があります'
  },
  theme: {
    light: 'ライトモード',
    dark: 'ダークモード',
    system: 'システム設定に従う'
  },
  language: {
    label: '言語'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: '形式',
      folder: '保存先',
      confirm: '確認'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com と youtu.be のリンクに対応',
      fetchFormats: '形式を取得',
      mascotIdle: 'YouTubeのリンクを貼ってね (動画でもShortsでもOK) — 「形式を取得」を押せばすぐ取りかかるよ ✨',
      mascotBusy: 'バックグラウンドでダウンロード中… マルチタスクは得意なんだ 😎'
    },
    formats: {
      quickPresets: 'クイックプリセット',
      video: '動画',
      audio: '音声',
      noAudio: '音声なし',
      videoOnly: '動画のみ',
      audioOnly: '音声のみ',
      audioOnlyOption: '音声のみ (動画なし)',
      mascot: '最高 + 最高 = 最高画質。これを選ぶよ!',
      sniffing: 'あなたに最適な形式を探しています…',
      loadingHint: '通常は1秒ほどで完了',
      loadingAria: '形式を読み込み中',
      sizeUnknown: 'サイズ不明',
      total: '合計'
    },
    folder: {
      heading: '保存先',
      downloads: 'ダウンロード',
      videos: 'ムービー',
      desktop: 'デスクトップ',
      custom: 'カスタム…'
    },
    confirm: {
      readyHeadline: 'ダウンロード準備完了!',
      landIn: 'ファイルの保存先:',
      labelVideo: '動画',
      labelAudio: '音声',
      labelSaveTo: '保存先',
      labelSize: 'サイズ',
      sizeUnknown: '不明',
      audioOnly: '音声のみ',
      addToQueue: '+ キュー',
      addToQueueTooltip: '他のダウンロードが終わってから開始 — 帯域幅をフル活用',
      pullIt: '取得! ↓',
      pullItTooltip: 'すぐ開始 — 他のアクティブなダウンロードと並行実行'
    },
    error: {
      icon: 'エラー'
    }
  },
  videoCard: {
    titlePlaceholder: '読み込み中…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'ダウンロードキュー',
    toggleTitle: 'ダウンロードキューの表示/非表示',
    empty: 'キューに追加したダウンロードはここに表示されます',
    noDownloads: 'まだダウンロードはありません。',
    clear: 'クリア',
    clearTitle: '完了したダウンロードをクリア',
    tip: 'ダウンロードは下のキューに入りました — いつでも開いて進捗を確認できます。',
    item: {
      doneAt: '{{time}} 完了',
      paused: '一時停止中',
      defaultError: 'ダウンロード失敗',
      openUrl: 'URLを開く',
      pause: '一時停止',
      resume: '再開',
      cancel: 'キャンセル',
      remove: '削除'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'が利用可能です',
    youHave: '— 現在のバージョン: {{currentVersion}}',
    install: 'インストールして再起動',
    downloading: 'ダウンロード中…',
    download: 'ダウンロード ↗',
    dismiss: '更新通知を閉じる',
    copy: 'コマンドをクリップボードにコピー',
    copied: 'コマンドをクリップボードにコピーしました'
  },
  status: {
    preparingBinaries: 'バイナリを準備中…',
    mintingToken: 'YouTubeトークンを生成中…',
    remintingToken: 'トークンを再生成中…',
    startingYtdlp: 'yt-dlpプロセスを開始中…',
    cancelled: 'ダウンロードがキャンセルされました',
    complete: 'ダウンロード完了',
    ytdlpProcessError: 'yt-dlpプロセスエラー: {{error}}',
    ytdlpExitCode: 'yt-dlpがコード{{code}}で終了しました',
    downloadingBinary: 'バイナリ {{name}} をダウンロード中…',
    unknownStartupFailure: 'ダウンロード開始時に不明なエラーが発生しました'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTubeがこのリクエストをボットとして検出しました。少し待ってから再試行してください。',
      ipBlock: 'IPアドレスがYouTubeにブロックされているようです。あとで試すか、VPNを使用してください。',
      rateLimit: 'YouTubeがリクエストを制限しています。1分待ってから再試行してください。',
      ageRestricted: 'この動画は年齢制限があり、ログインアカウントなしではダウンロードできません。',
      unavailable: 'この動画は利用できません — 非公開、削除済み、または地域制限の可能性があります。',
      geoBlocked: 'この動画はあなたの地域では視聴できません。'
    }
  },
  presets: {
    'best-quality': {
      label: '最高画質',
      desc: '最高解像度 + 最高音質'
    },
    balanced: {
      label: 'バランス',
      desc: '720p最大 + 良好な音質'
    },
    'audio-only': {
      label: '音声のみ',
      desc: '動画なし、最高音質'
    },
    'small-file': {
      label: '小サイズ',
      desc: '最低解像度 + 低音質'
    }
  },
  formatLabel: {
    audioOnly: '音声のみ',
    audioFallback: '音声',
    audioOnlyDot: '音声のみ · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: 'ダウンロード{{count}}件を実行中',
      message_other: 'ダウンロード{{count}}件を実行中',
      detail: '閉じるとアクティブなダウンロードはすべてキャンセルされます。',
      confirm: 'ダウンロードをキャンセルして終了',
      keep: 'ダウンロードを続ける'
    }
  }
} as const;

export default ja;
