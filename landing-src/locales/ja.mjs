// Landing-page translations for "ja". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const ja = {
  title: "Arroxy — 無料 4K YouTube ダウンローダー、ログイン不要",
  description:
    "Windows、macOS、Linux 向けの無料・MIT ライセンスのデスクトップ YouTube ダウンローダー。Google アカウント、ブラウザ Cookie、ログイン一切不要で最大 4K HDR・60 fps の動画をダウンロード。",
  og_title: "Arroxy — 無料 4K YouTube ダウンローダー、ログイン不要",
  og_description:
    "無料 4K YouTube ダウンローダー。Cookie なし、ログインなし、セッション切れなし。MIT ライセンス。Windows · macOS · Linux。",

  nav_features: "機能",
  nav_screenshots: "スクリーンショット",
  nav_install: "インストール",
  nav_download: "ダウンロード",

  hero_eyebrow: "Open Source · MIT · 継続開発中",
  hero_h1_a: "無料 4K YouTube ダウンローダー。",
  hero_h1_b: "Cookie なし。ログインなし。セッション切れなし。",
  hero_tagline:
    "Arroxy は Windows、macOS、Linux 向けの無料・MIT ライセンスのデスクトップ YouTube ダウンローダーです。Google アカウント、ブラウザ Cookie、ログインを一切求めることなく — 最大 4K HDR・60 fps で動画をダウンロードします。",
  hero_trust: "GitHub ですべてのコードを監査できます。",
  pill_no_tracking: "トラッキングなし",
  pill_no_account: "Google アカウント不要",
  pill_open_source: "オープンソース (MIT)",
  cta_download_os: "あなたの OS 向けにダウンロード",
  cta_view_github: "GitHub で見る",
  release_label: "最新リリース:",
  release_loading: "読み込み中…",

  cta_download_windows: "Windows 版をダウンロード",
  cta_download_windows_portable: "ポータブル .exe（インストール不要）",
  cta_download_mac_arm: "macOS 版をダウンロード（Apple Silicon）",
  cta_download_mac_intel: "Intel Mac ですか？ x64 DMG を取得",
  cta_download_linux_appimage: "Linux 版をダウンロード（.AppImage）",
  cta_download_linux_flatpak: "Flatpak バンドル →",
  cta_other_platforms: "他のプラットフォーム / すべてのダウンロード",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "インストーラー",
  cta_portable_label: "ポータブル",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy は Windows、macOS、Linux 向けのデスクトップアプリです。",
  mobile_notice_sub: "ダウンロードするには、お使いのパソコンでこのページを開いてください。",
  mobile_copy_link: "リンクをコピー",
  first_launch_label: "初回起動のヘルプ",
  first_launch_mac_html:
    "macOS は初回起動時に <em>開発元未確認</em> の警告を表示します — Arroxy はまだ署名されていません。<strong>アプリアイコンを右クリック → 開く</strong>、ダイアログで <strong>開く</strong> をクリック。最初の一度だけです。",
  first_launch_linux_html:
    "<strong>AppImage:</strong> ファイルを右クリック → <strong>プロパティ → プログラムとして実行を許可</strong>、またはターミナルで <code>chmod +x Arroxy-*.AppImage</code> を実行。それでも起動しない場合は <code>libfuse2</code> (Ubuntu/Debian)、<code>fuse-libs</code> (Fedora)、または <code>fuse2</code> (Arch) をインストール。<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code> を実行し、アプリメニューから起動するか <code>flatpak run io.github.antonio_orionus.Arroxy</code> を実行。",

  features_eyebrow: "できること",
  features_h2: "期待されることはすべて、面倒は一切なく。",
  features_sub: "URL を貼り付けて、画質を選んで、ダウンロードをクリック。それだけ。",
  f1_h: "最大 4K UHD",
  f1_p: "2160p、1440p、1080p、720p — YouTube が提供するあらゆる解像度に加え、MP3、AAC、Opus の音声のみも対応。",
  f2_h: "60 fps と HDR を維持",
  f2_p: "高フレームレートと HDR ストリームは YouTube がエンコードしたまま — 画質劣化なし。",
  f3_h: "複数同時に",
  f3_p: "好きなだけ動画をキューに追加できます。ダウンロードパネルが各進捗を並行して表示。",
  f4_h: "自動アップデート",
  f4_p: "Arroxy は yt-dlp と ffmpeg を裏で常に最新に保ちます — YouTube の変更にも対応。",
  f5_h: "9 言語対応",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — あなたの言語を自動検出。",
  f6_h: "マルチプラットフォーム",
  f6_p: "Windows、macOS、Linux のネイティブビルド — インストーラー、ポータブル、DMG、AppImage。",
  f7_h: "字幕は思いのままに",
  f7_p: "手動または自動生成の字幕を SRT、VTT、ASS で取得 — 動画と並べて保存、ポータブルな .mkv に埋め込み、または Subtitles/ フォルダに整理。",
  f8_h: "SponsorBlock 内蔵",
  f8_p: "スポンサー、イントロ、アウトロ、自己宣伝などをスキップまたはマーク — FFmpeg でカットするか章として追加するか。カテゴリごとにあなたが決める。",
  f9_h: "クリップボード自動入力",
  f9_p: "YouTube リンクをどこかでコピーするだけで、アプリに戻った瞬間 Arroxy が検出します — 確認プロンプトで常に制御を維持。詳細設定で有効・無効を切り替え。",
  f10_h: "URL 自動クリーンアップ",
  f10_p: "貼り付けた YouTube リンクからトラッキングパラメータ（si、pp、feature、utm_*、fbclid、gclid など）が自動で除去され、youtube.com/redirect ラッパーも展開 — URL フィールドには常に正規リンクが表示されます。",
  f11_h: "トレイに格納",
  f11_p: "ウィンドウを閉じると Arroxy はシステムトレイに格納されます。ダウンロードはバックグラウンドで継続 — トレイアイコンをクリックするとウィンドウが戻り、トレイメニューから終了もできます。",
  f12_h: "メタデータ・カバーアート埋め込み",
  f12_p: "タイトル、アップロード日、アーティスト、説明、カバーアート、チャプターマーカーをファイルに直接書き込み — サイドカーファイルも手動タグ付けも不要。",

  shots_eyebrow: "実際の動作",
  shots_h2: "明快さのために設計、雑然さは排除。",
  shot1_alt: "URL を貼り付け",
  shot2_alt: "画質を選択",
  shot3_alt: "保存先を選択",
  shot4_alt: "並行ダウンロード",
  shot5_alt: "字幕ステップ — 言語・フォーマット・保存モードを選ぶ",
  og_image_alt: "Arroxy アプリアイコン — YouTube 動画を 4K でダウンロードするデスクトップアプリ。",

  privacy_eyebrow: "プライバシー",
  privacy_h2_html: "Arroxy が<em>しない</em>こと。",
  privacy_sub:
    "ほとんどの YouTube ダウンローダーは、いずれ Cookie を要求します。Arroxy は決して要求しません。",
  p1_h: "ログイン不要",
  p1_p: "Google アカウント不要。期限切れのセッションもなし。アカウントが警告される心配ゼロ。",
  p2_h: "Cookie 不要",
  p2_p: "Arroxy はブラウザと同じトークンを要求するだけ。何もエクスポートせず、何も保存しません。",
  p3_h: "ユーザー ID なし",
  p3_p: "Aptabase による匿名・セッション限定のテレメトリー — インストール ID なし、フィンガープリンティングなし、個人データなし。ダウンロード、履歴、ファイルはすべてあなたのデバイス内に留まります。",
  p4_h: "サードパーティサーバーなし",
  p4_p: "全パイプラインが yt-dlp + ffmpeg でローカル実行。ファイルがリモートサーバーに触れることはありません。",

  install_eyebrow: "インストール",
  install_h2: "チャンネルを選んでください。",
  install_sub:
    "直接ダウンロード、または主要パッケージマネージャー経由 — すべてリリースごとに自動更新。",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "全 OS",
  winget_desc: "Windows 10/11 推奨。システムと一緒に自動更新。",
  scoop_desc: "Scoop バケット経由のポータブルインストール。管理者権限不要。",
  brew_desc: "Cask を tap してワンコマンドでインストール。ユニバーサルバイナリ (Intel + Apple Silicon)。",
  flatpak_h: "Flatpak",
  flatpak_desc: "サンドボックスでインストール。Releases から .flatpak バンドルをダウンロードし、ワンコマンドでインストール。Flathub のセットアップは不要。",
  direct_h: "直接ダウンロード",
  direct_desc: "NSIS インストーラー、ポータブル .exe、.dmg、.AppImage、.flatpak — GitHub Releases から直接。",
  direct_btn: "Releases を開く →",
  copy_label: "コピー",
  copied_label: "コピーしました！",

  footer_made_by: "MIT ライセンス · 作者:",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "言語:",

  faq_eyebrow: "FAQ",
  faq_h2: "よくある質問",
  faq_q1: "どの画質でダウンロードできますか？",
  faq_a1:
    "YouTube が提供するすべて — 4K UHD（2160p）、1440p QHD、1080p Full HD、720p、480p、360p、音声のみ。ハイフレームレート（60 fps、120 fps）と HDR コンテンツはそのまま保存されます。Arroxy は利用可能な全フォーマットを表示し、ピンポイントで選ばせてくれます。",
  faq_q2: "本当に無料ですか？",
  faq_a2: "はい。MIT ライセンス。プレミアム版や機能ロックはありません。",
  faq_q3: "Arroxy は何カ国語に対応していますか？",
  faq_a3:
    "9 言語に標準対応：English、Español（スペイン語）、Deutsch（ドイツ語）、Français（フランス語）、日本語、中文（中国語）、Русский（ロシア語）、Українська（ウクライナ語）、हिन्दी（ヒンディー語）。Arroxy は初回起動時に OS の言語を自動検出し、ツールバーの言語選択でいつでも切り替え可能です。翻訳は src/shared/i18n/locales/ 内の素の TypeScript オブジェクトとして管理されているので、GitHub で PR を開いて貢献できます。",
  faq_q4: "何かインストールが必要ですか？",
  faq_a4:
    "いいえ。yt-dlp と ffmpeg は初回起動時に公式 GitHub releases から自動ダウンロードされ、マシンにキャッシュされます。それ以降は追加のセットアップ不要。",
  faq_q5: "YouTube が変更したら使えなくなりますか？",
  faq_a5:
    "いいえ — Arroxy には 2 段階の耐性があります。第一に、yt-dlp はオープンソースで最も活発に保守されているツールの 1 つで、YouTube の変更から数時間以内に更新されます。第二に、Arroxy は Cookie や Google アカウントに一切依存しないため、失効するセッションも、ローテートする資格情報もありません。この組み合わせにより、ブラウザの Cookie に依存するツールよりも遥かに安定しています。",
  faq_q6: "プレイリストはダウンロードできますか？",
  faq_a6:
    "現在は単一動画のみサポート。プレイリストとチャンネルのサポートはロードマップ上にあります。",
  faq_q7: "YouTube アカウントや Cookie が必要ですか？",
  faq_a7:
    "いいえ — そしてこれは思っているより重要なポイントです。YouTube の更新後に動かなくなるツールの大半は、ブラウザの YouTube Cookie のエクスポートを指示してきます。その回避策は YouTube がセッションをローテーションする約 30 分ごとに壊れますし、yt-dlp の公式ドキュメントもそれが Google アカウントのフラグ立てにつながると警告しています。Arroxy は Cookie も資格情報も一切使いません。ログインなし、アカウント連携なし、失効するものも、BAN されるものもありません。",
  faq_q8:
    'macOS で「アプリが壊れている」「開けません」と表示される — どうすれば？',
  faq_a8:
    "これは macOS Gatekeeper が未署名アプリをブロックしているもので、実際に壊れているわけではありません。README に macOS 初回起動のステップごとの手順があります。",
  faq_q9: "これは合法ですか？",
  faq_a9:
    "個人使用のための動画ダウンロードは、ほとんどの法域で一般的に容認されています。YouTube の利用規約および所在地の法律の遵守はあなたの責任です。",
};
