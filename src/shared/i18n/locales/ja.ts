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
      subtitles: '字幕',
      sponsorblock: 'SponsorBlock',
      output: '出力',
      folder: '保存先',
      confirm: '確認'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'youtube.com と youtu.be のリンクに対応',
      fetchFormats: '形式を取得',
      mascotIdle: 'YouTubeのリンクを貼ってね (動画でもShortsでもOK) — 「形式を取得」を押せばすぐ取りかかるよ ✨',
      mascotBusy: 'バックグラウンドでダウンロード中… マルチタスクは得意なんだ 😎',
      advanced: '詳細設定',
      clearAria: 'URLをクリア',
      clipboard: {
        toggle: 'クリップボードを監視',
        toggleDescription: 'YouTubeのリンクをコピーすると自動的にURLフィールドに入力します。',
        dialog: {
          title: 'YouTubeのURLを検出',
          body: 'クリップボードのこのリンクを使いますか?',
          useButton: 'URLを使う',
          disableButton: '無効化',
          cancelButton: 'キャンセル',
          disableNote: '詳細設定からクリップボード監視をいつでも再有効化できます。'
        }
      },
      cookies: {
        toggle: 'Cookieファイルを使用',
        toggleDescription: '年齢制限・メンバー限定・アカウント非公開の動画で役立ちます。',
        risk: '注意: cookies.txt にはそのブラウザのすべてのログイン情報が含まれます — 取り扱いに注意してください。',
        fileLabel: 'Cookieファイル',
        choose: '選択…',
        clear: 'クリア',
        placeholder: 'ファイルが選択されていません',
        helpLink: 'Cookieを書き出す方法は?',
        enabledButNoFile: 'Cookieを使うにはファイルを選択してください',
        banWarning: '注意: yt-dlpがCookieで使うアカウントは、YouTube側でフラグが立てられたり、稀にBANされることがあります。可能なら使い捨てアカウントを使ってください。',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'プロキシ経由でトラフィックを転送 — 地域制限コンテンツに有効。',
        placeholder: 'http://host:port',
        clear: 'クリア'
      },
      closeToTray: {
        toggle: '閉じるときにトレイに格納',
        toggleDescription: 'ウィンドウを閉じた後もバックグラウンドでダウンロードを続けます。'
      },
      analytics: {
        toggle: '匿名の使用統計を送信',
        toggleDescription: 'アプリの起動回数のみを記録します。URL、ファイル名、個人情報は含まれません。'
      }
    },
    subtitles: {
      heading: '字幕',
      autoBadge: '自動',
      hint: '字幕ファイルは動画と同じフォルダに保存されます',
      noLanguages: 'この動画には字幕がありません',
      skip: 'スキップ',
      skipSubs: 'この動画ではスキップ',
      selectAll: 'すべて選択',
      deselectAll: 'すべて解除',
      mascot: 'ゼロでも、一つでも、複数でも — お好みで ✨',
      searchPlaceholder: '言語を検索…',
      noMatches: '言語が見つかりません',
      clearAll: 'すべて削除',
      noSelected: '字幕が選択されていません',
      selectedNote_one: '字幕 {{count}} 件をダウンロードします',
      selectedNote_other: '字幕 {{count}} 件をダウンロードします',
      sectionManual: '手動',
      sectionAuto: '自動生成',
      saveMode: {
        heading: '保存方法',
        sidecar: '動画と同じ場所',
        embed: '動画に埋め込む',
        subfolder: 'subtitles/ サブフォルダー'
      },
      format: {
        heading: 'Format'
      },
      embedNote: '埋め込みモードでは、字幕トラックを確実に埋め込むため出力は .mkv で保存されます。',
      autoAssNote: '自動字幕は ASS ではなく SRT として保存されます — YouTube のローリング・キュー重複を常にクリーンアップしますが、現状 ASS コンバーターではこれを再現できません。'
    },
    sponsorblock: {
      modeHeading: 'スポンサーフィルター',
      mode: {
        off: 'オフ',
        mark: 'チャプターとしてマーク',
        remove: 'セグメントを削除'
      },
      modeHint: {
        off: 'SponsorBlockなし — 動画はアップロードされた通りに再生されます。',
        mark: 'スポンサーセグメントをチャプターとしてマークします（非破壊的）。',
        remove: 'FFmpegを使用してスポンサーセグメントを削除します。'
      },
      categoriesHeading: 'カテゴリ',
      cat: {
        sponsor: 'スポンサー',
        intro: 'イントロ',
        outro: 'アウトロ',
        selfpromo: '自己宣伝',
        music_offtopic: '音楽（無関係）',
        preview: 'プレビュー',
        filler: 'フィラー'
      }
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
      total: '合計',
      convert: {
        label: '変換',
        uncompressed: '変換 · 非圧縮',
        bitrate: 'ビットレート',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: '音声変換には音声のみモードが必要です（動画の選択を解除してください）。',
        requiresLossy: 'ネイティブストリームが選択されています — ビットレートは mp3、m4a、または opus に変換する場合にのみ適用されます。'
      }
    },
    folder: {
      heading: '保存先',
      downloads: 'ダウンロード',
      videos: 'ムービー',
      desktop: 'デスクトップ',
      music: 'ミュージック',
      documents: 'ドキュメント',
      pictures: 'ピクチャ',
      home: 'ホーム',
      custom: 'カスタム…',
      subfolder: {
        toggle: 'サブフォルダに保存',
        placeholder: '例: lo-fi rips',
        invalid: 'フォルダ名に無効な文字が含まれています'
      }
    },
    output: {
      embedChapters: {
        label: 'チャプターを埋め込む',
        description: '現代のプレーヤーでナビゲートできるチャプターマーカー。'
      },
      embedMetadata: {
        label: 'メタデータを埋め込む',
        description: 'タイトル、アーティスト、説明、アップロード日をファイルに書き込みます。'
      },
      embedThumbnail: {
        label: 'サムネイルを埋め込む',
        description: 'ファイル内のカバーアート。MP4 / M4Aのみ — 字幕を埋め込む場合はスキップ。'
      },
      writeDescription: {
        label: '説明を保存',
        description: '動画の説明を .description テキストファイルとしてダウンロードの隣に保存します。'
      },
      writeThumbnail: {
        label: 'サムネイルを保存',
        description: 'サムネイルを .jpg 画像ファイルとしてダウンロードの隣に保存します。'
      }
    },
    confirm: {
      readyHeadline: 'ダウンロード準備完了!',
      landIn: 'ファイルの保存先:',
      labelVideo: '動画',
      labelAudio: '音声',
      labelSubtitles: '字幕',
      subtitlesNone: '—',
      labelSaveTo: '保存先',
      labelSize: 'サイズ',
      sizeUnknown: '不明',
      nothingToDownload: '字幕のみプリセットが有効ですが字幕言語が選択されていません — 何もダウンロードされません。',
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
    activeCount: '{{count}} 件ダウンロード中 · {{percent}}%',
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
    copied: 'コマンドをクリップボードにコピーしました',
    installFailed: '更新に失敗しました',
    retry: '再試行'
  },
  status: {
    preparingBinaries: 'バイナリを準備中…',
    mintingToken: 'YouTubeトークンを生成中…',
    remintingToken: 'トークンを再生成中…',
    startingYtdlp: 'yt-dlpプロセスを開始中…',
    downloadingMedia: 'ビデオと音声をダウンロード中…',
    mergingFormats: '音声とビデオを結合中…',
    fetchingSubtitles: '字幕を取得中…',
    sleepingBetweenRequests: 'レート制限回避のため{{seconds}}秒待機中…',
    subtitlesFailed: 'ビデオは保存されました — 一部の字幕をダウンロードできませんでした',
    cancelled: 'ダウンロードがキャンセルされました',
    complete: 'ダウンロード完了',
    usedExtractorFallback: '簡易抽出モードでダウンロードしました — より確実にするには cookies.txt の設定をおすすめします',
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
      geoBlocked: 'この動画はあなたの地域では視聴できません。',
      outOfDiskSpace: 'ディスク容量が不足しています。空き容量を増やして再試行してください。'
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
    },
    'subtitle-only': {
      label: '字幕のみ',
      desc: '動画・音声なし、字幕のみ'
    }
  },
  formatLabel: {
    audioOnly: '音声のみ',
    audioFallback: '音声',
    audioOnlyDot: '音声のみ · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'アイドル',
      statusActive_one: '1件ダウンロード中 · {{percent}}%',
      statusActive_other: '{{count}}件ダウンロード中 · {{percent}}%',
      open: 'Arroxyを開く',
      quit: 'Arroxyを終了'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: 'ダウンロード{{count}}件を実行中',
      message_other: 'ダウンロード{{count}}件を実行中',
      detail: '閉じるとアクティブなダウンロードはすべてキャンセルされます。',
      confirm: 'ダウンロードをキャンセルして終了',
      keep: 'ダウンロードを続ける'
    },
    closeToTray: {
      message: '閉じるときにArroxyをシステムトレイに格納しますか？',
      detail: 'Arroxyは実行を続け、アクティブなダウンロードを完了します。詳細設定で変更できます。',
      hide: 'トレイに格納',
      quit: '終了',
      remember: '次回から表示しない'
    },
    rendererCrashed: {
      message: 'Arroxyで問題が発生しました',
      detail: 'レンダラープロセスがクラッシュしました ({{reason}})。再読み込みしてもう一度お試しください。',
      reload: '再読み込み',
      quit: '終了'
    }
  }
} as const;

export default ja;
