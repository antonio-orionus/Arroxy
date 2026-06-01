const TECH_CONTENT = `<details>
<summary><strong>スタック</strong></summary>

- **Electron** — クロスプラットフォームのデスクトップシェル
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — スタイリング
- **Zustand** — 状態管理
- **yt-dlp** + **ffmpeg** — ダウンロード・マルチプレクサエンジン（yt-dlp は実行時に取得、ffmpeg/ffprobe はビルド時に同梱）
- **Vite** + **electron-vite** — ビルドツール
- **Vitest** + **Playwright** — ユニットテスト・E2E テスト

</details>

<details>
<summary><strong>ソースからビルド</strong></summary>

### 前提条件 — 全プラットフォーム共通

| ツール | バージョン | インストール |
| ---- | ------- | ------- |
| Git  | 任意    | [git-scm.com](https://git-scm.com) |
| Bun  | 最新    | 各 OS の手順を参照 |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

ネイティブビルドツールは不要 — このプロジェクトにはネイティブ Node アドオンがありません。

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux（Ubuntu / Debian）

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron ランタイム依存
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E テストのみ（Electron にはディスプレイが必要）
sudo apt install -y xvfb
\`\`\`

### クローンして実行

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # ホットリロード開発ビルド
\`\`\`

### 配布パッケージのビルド

\`\`\`bash
bun run build        # 型チェック + コンパイル
bun run dist         # 現在の OS 向けパッケージ
bun run dist:win     # Windows ポータブル exe のクロスコンパイル
\`\`\`

> yt-dlp は初回起動時に GitHub から取得され、アプリデータフォルダにキャッシュされます。ffmpeg と ffprobe はすべての Arroxy リリースに同梱されています。

</details>`;

export const ja = {
  icon_alt: "Arroxy マスコット",
  title: "Arroxy — Windows・macOS・Linux 向け無料オープンソース YouTube（+ 2000 サイト）ダウンローダー",
  read_in_label: "言語：",
  badge_release_alt: "リリース",
  badge_build_alt: "ビルド",
  badge_license_alt: "ライセンス",
  badge_platforms_alt: "プラットフォーム",
  badge_i18n_alt: "対応言語",
  badge_website_alt: "ウェブサイト",
  hero_desc:
    "**YouTube と 2000 以上の対応サイト**から動画・Shorts・音楽・チャンネル・ポッドキャスト・音声トラックをダウンロード — 最大 4K HDR 60fps、または MP3 / AAC / Opus として。Windows、macOS、Linux でローカル動作。**広告なし、余計なものなし、アップセルなし。**",
  cta_latest: "↓ 最新リリースをダウンロード",
  cta_website: "ウェブサイト",
  demo_alt: "Arroxy デモ",
  star_cta: "Arroxy が役に立ったなら、⭐ で他のユーザーへの周知を助けてください。",
  ai_notice:
    "> 🌐 これは AI 翻訳です。[英語版 README](README.md) が情報のソースです。誤りを見つけたら [PR を歓迎します](../../pulls)。",
  toc_heading: "目次",
  why_h2: "なぜ Arroxy？",
  features_h2: "機能",
  dl_h2: "ダウンロード",
  privacy_h2: "プライバシー",
  faq_h2: "よくある質問",
  roadmap_h2: "ロードマップ",
  tech_h2: "技術詳細",
  why_intro: "最もよく使われる代替手段との比較：",
  why_r1: "無料、プレミアム層なし",
  why_r2: "オープンソース",
  why_r3: "ローカル処理のみ",
  why_r4: "ログイン・Cookie エクスポート不要",
  why_r5: "利用回数制限なし",
  why_r6: "クロスプラットフォームのデスクトップアプリ",
  why_r7: "字幕 + SponsorBlock",
  why_summary:
    "Arroxy はひとつのことのために作られています：URL を貼って、クリーンなローカルファイルを得る。アカウントなし、アップセルなし、データ収集なし。",
  feat_quality_h3: "画質・フォーマット",
  feat_quality_1: "最大 **4K UHD（2160p）**、1440p、1080p、720p、480p、360p",
  feat_quality_2: "**ハイフレームレート**をそのまま保存 — 60 fps、120 fps、HDR",
  feat_quality_3: "**音声のみ**を MP3、M4A/AAC、Opus、WAV で書き出し",
  feat_quality_4: "クイックプリセット：*最高画質* · *バランス* · *小さいファイル*",
  feat_privacy_h3: "プライバシー・制御",
  feat_privacy_1:
    "100% ローカル処理 — ダウンロードは YouTube から直接あなたのディスクへ",
  feat_privacy_2: "ログインなし、Cookie なし、Google アカウント連携なし",
  feat_privacy_3: "選択したフォルダに直接ファイルを保存",
  feat_workflow_h3: "ワークフロー",
  feat_workflow_1: "**柔軟な開始モード** — ガイド付き単体ダウンロード、プレイリスト/チャンネル選択、URL一括貼り付け、保存済み既定値での Quick Download を選べます",
  feat_workflow_2: "**中央ダウンロードキュー** — 単体、プレイリスト、一括、クイックの各ジョブが一か所に入り、進行状況、一時停止、再開、キャンセル、再試行、優先度を管理できます",
  feat_workflow_3:
    "**クリップボード監視** — YouTube リンクをコピーすると、アプリにフォーカスを戻したときに Arroxy が URL を自動入力（詳細設定でトグル切替可能）",
  feat_workflow_4:
    "**URL 自動クリーンアップ** — トラッキングパラメータ（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）を除去し、`youtube.com/redirect` リンクを展開",
  feat_workflow_5:
    "**トレイモード** — ウィンドウを閉じてもダウンロードはバックグラウンドで継続",
  feat_workflow_6:
    "**21 言語対応** — システムロケールを自動検出、いつでも切替可能",
  feat_workflow_7:
    "**プレイリスト同期** — ローカルフォルダーと照合してプレイリストを再スキャンし、ダウンロード済みの動画をスキップします。各動画のダウンロードに合わせて更新される `.m3u` プレイリストファイルも生成します",
  feat_workflow_8:
    "**速度とペーシング制御** — ダウンロード帯域を制限し、リクエスト間の待機を追加し、プリセット（*オフ · バランス · 慎重 · カスタム*）でフラグメントスレッドを調整できます",
  feat_post_h3: "字幕・後処理",
  feat_post_1:
    "SRT、VTT、または ASS 形式の**字幕** — 手動または自動生成、利用可能な任意の言語",
  feat_post_2:
    "動画の隣に保存、`.mkv` に埋め込み、または `Subtitles/` サブフォルダに整理",
  feat_post_3:
    "**SponsorBlock** — スポンサー、イントロ、アウトロ、自己宣伝をスキップまたはチャプターマーク",
  feat_post_4:
    "**埋め込みメタデータ** — タイトル、アップロード日、チャンネル、説明、サムネイル、チャプターマーカーをファイルに書き込み",
  feat_sites_h3: "YouTube + 2000 サイト",
  feat_sites_1:
    "**YouTube、フル対応** — 動画・Shorts・チャンネル・プレイリスト・YouTube Music・ポッドキャストをファーストクラスのソースとして処理",
  feat_sites_2:
    "**2000 以上の他サイト** via yt-dlp — Vimeo、Twitch、Twitter/X、TikTok、SoundCloud、Bandcamp、Bilibili、BBC iPlayer、archive.org など多数",
  feat_sites_3:
    "**音声のみと字幕**は YouTube だけでなく、すべての対応サイトで機能します",
  feat_sites_4:
    "サイトが変更されても、yt-dlp は毎週修正をリリースし、Arroxy は起動時にバイナリを自動更新します",
  shot1_alt: "URL を貼る",
  shot2_alt: "画質を選ぶ",
  shot3_alt: "保存先を選ぶ",
  shot4_alt: "ダウンロードキューが稼働中",
  shot5_alt: "字幕の言語とフォーマットの選択",
  dl_platform_col: "プラットフォーム",
  dl_format_col: "フォーマット",
  dl_win_format: "インストーラ（NSIS）またはポータブル `.exe`",
  dl_mac_format: "`.dmg`（Intel + Apple Silicon）",
  dl_linux_format: "`.AppImage` または `.flatpak`（サンドボックス）",
  dl_grab: "最新リリースを入手 →",
  dl_pkg_h3: "パッケージマネージャー経由でインストール",
  dl_channel_col: "チャンネル",
  dl_command_col: "コマンド",
  dl_win_h3: "Windows：インストーラ vs ポータブル",
  dl_win_col_installer: "NSIS インストーラ",
  dl_win_col_portable: "ポータブル `.exe`",
  dl_win_r1: "インストール必要",
  dl_win_r1_installer: "はい",
  dl_win_r1_portable: "いいえ — どこからでも実行可能",
  dl_win_r2: "自動アップデート",
  dl_win_r2_installer: "✅ アプリ内",
  dl_win_r2_portable: "❌ 手動ダウンロード",
  dl_win_r3: "起動速度",
  dl_win_r3_installer: "✅ 速い",
  dl_win_r3_portable: "⚠️ コールドスタートが遅め",
  dl_win_r4: "スタートメニューに追加",
  dl_win_r5: "簡単アンインストール",
  dl_win_r5_portable: "❌ ファイルを削除するだけ",
  dl_win_rec:
    "**おすすめ：** 自動アップデートと高速起動には NSIS インストーラを使用。インストール不要・レジストリ非変更のオプションにはポータブル `.exe` を使用。",
  dl_win_smartscreen_h4: "Windows SmartScreen の警告",
  dl_win_smartscreen_intro:
    "初回起動時に **«Windows protected your PC»** または **«Unknown publisher»** が表示されることがあります。これは `Arroxy-Setup-*.exe` と `Arroxy-Portable-*.exe` の両方に該当します。Arroxy は無料のオープンソースソフトウェアであり、Windows ビルドには有料の証明書によるコード署名がないため、SmartScreen がフラグを立てます。これは Arroxy が危険であることを**自動的に**意味するわけではありません。続行するには：",
  dl_win_smartscreen_step1: "**More info** をクリック。",
  dl_win_smartscreen_step2: "**Run anyway** をクリック。",
  dl_win_smartscreen_official:
    "Arroxy は必ず公式の GitHub Releases ページからダウンロードしてください。他のウェブサイトから入手したファイルや、誰かから送られてきたファイルは削除し、公式ソースから新しいコピーをダウンロードしてください。ソースコードは公開されているため、ご自身で確認したり、Arroxy をビルドしたりすることも可能です。",
  dl_macos_h3: "macOS の初回起動",
  dl_macos_warning:
    "Arroxy はまだコード署名されていないため、初回起動時に macOS Gatekeeper が警告を表示します。これは想定内の動作であり、ファイルが破損しているわけではありません。",
  dl_macos_m1_h4: "システム設定を使う方法（推奨）：",
  dl_macos_step1: "Arroxy のアプリアイコンを右クリックして **開く** を選択。",
  dl_macos_step2:
    "警告ダイアログが表示されたら **キャンセル** をクリック（*ゴミ箱に入れる* は押さない）。",
  dl_macos_step3: "**システム設定 → プライバシーとセキュリティ** を開く。",
  dl_macos_step4:
    '**セキュリティ** セクションまでスクロール。*"Arroxy は確認済みの開発元のものではないためブロックされました"* と表示されています。',
  dl_macos_step5:
    "**このまま開く** をクリックし、パスワードまたは Touch ID で確認。",
  dl_macos_after:
    "手順 5 のあとは Arroxy が通常通り開き、警告は二度と表示されません。",
  dl_macos_m2_h4: "ターミナルを使う方法（上級者向け）：",
  dl_macos_note:
    "macOS ビルドは Apple Silicon と Intel の CI ランナーで生成されます。問題が発生した場合は [issue を開いて](../../issues) ください — macOS ユーザーからのフィードバックが macOS のテストサイクルを積極的に形成します。",
  dl_linux_h3: "Linux の初回起動",
  dl_linux_intro:
    "AppImage はインストール不要で直接実行できます。ファイルを実行可能としてマークするだけです。",
  dl_linux_m1_text:
    "**ファイルマネージャー：** `.AppImage` を右クリック → **プロパティ** → **権限** → **プログラムとして実行を許可** を有効化、ダブルクリックで起動。",
  dl_linux_m2_h4: "ターミナル：",
  dl_linux_fuse_text: "それでも起動しない場合、FUSE が不足している可能性があります：",
  dl_linux_flatpak_intro:
    "**Flatpak（サンドボックス版）：** 同じリリースページから `Arroxy-*.flatpak` をダウンロード。",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "警告が表示される理由",
  dl_warning_p1:
    "Arroxy はオープンソースで MIT ライセンスのソフトウェアです。Windows および macOS のビルドは**コード署名されていません** — Apple Developer ID と Windows EV のコード署名証明書はそれぞれ年間数百ドルかかり、個人プロジェクトでは自己負担になります。署名がない場合、Windows SmartScreen と macOS Gatekeeper は初回起動時に警告を表示します。これらの警告は*OS が発行元を認識していない*ことを意味するものであり、Arroxy がマルウェアであることを示すものではありません。",
  dl_warning_p2:
    "自分で Arroxy を検証する 3 つの方法（厳密さの高い順）：\n\n- **ソースコードを読む。** すべての行は [GitHub](https://github.com/antonio-orionus/Arroxy) にあり、[ソースからビルド](#tech)することもできます。\n- **SHA256 を確認する。** ダウンロードしたファイルを公開済みの [`SHA256SUMS`](../../releases/latest) と照合してください — 下記の[ダウンロードの検証](#verify)を参照。\n- **サードパーティのスキャンを実行する。** [VirusTotal](https://www.virustotal.com) にファイルをアップロード。",

  dl_win_first_h3: "Windows 初回起動",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "Windows Defender がファイルをフラグまたは削除した場合",
  dl_win_defender_p:
    "Defender のヒューリスティックは、署名されていない NSIS インストーラーや Electron のポータブル版を不審として検出することがあります。Defender が `Arroxy-Setup-*.exe` または `Arroxy-Portable-*.exe` を隔離した場合は、**Windows Security → Virus & threat protection → Protection history** から復元し、**Manage settings → Add or remove exclusions** で Arroxy の実行ファイルを許可リストに追加してください。SmartScreen と同様に、トリガーとなるのは発行元署名の欠如であり、マルウェアの検出ではありません。",

  dl_macos_first_h3: "macOS 初回起動",
  dl_macos_intro:
    "Arroxy はまだ macOS 向けのコード署名が行われていないため、Gatekeeper が初回起動をブロックします。許可する方法は macOS のバージョンによって異なります — Sequoia 15 では旧来の右クリック → 開く による回避策が制限されました。",
  dl_macos_sequoia_h4: "macOS Sequoia 15 以降（現行）",
  dl_macos_sequoia_intro:
    "Sequoia 15 以降では、右クリック → 開く では多くの隔離済みアプリの Gatekeeper をバイパスできなくなりました。代わりにシステム設定パネルを使用してください：",
  dl_macos_sequoia_step1:
    "マウントした DMG から `Arroxy.app` を `/Applications` にドラッグ。",
  dl_macos_sequoia_step2:
    "Arroxy をダブルクリックするとブロックダイアログが表示されます — **Done** をクリック（*Move to Trash* はクリックしない）。",
  dl_macos_sequoia_step3:
    '**System Settings → Privacy & Security** を開き、**Security** セクションまでスクロール。*"Arroxy was blocked to protect your Mac"*（または同様のメッセージ）が表示されます。',
  dl_macos_sequoia_step4:
    "**Open Anyway** をクリックし、パスワードまたは Touch ID で確認後、`/Applications` から Arroxy を再起動してください。",
  dl_macos_sonoma_h4: "macOS Sonoma 14 以前",
  dl_macos_sonoma_step1:
    "マウントした DMG から `Arroxy.app` を `/Applications` にドラッグ。",
  dl_macos_sonoma_step2:
    "`/Applications` 内の `Arroxy.app` を右クリック（または Control-クリック）して **Open** を選択。",
  dl_macos_sonoma_step3:
    "警告ダイアログに **Open** ボタンが表示されます — クリックして確認。Arroxy が正常に開き、以後警告は表示されません。",
  dl_macos_damaged_h4:
    '"App is damaged" または Gatekeeper の継続的なブロック — Terminal による修正',
  dl_macos_damaged_p:
    'macOS が *"Arroxy is damaged and can\'t be opened"* と表示する場合、または上記の手順でブロックが解除できない場合、原因は DMG の隔離属性です（一部のブラウザや macOS 自体のトランスロケーション動作が設定します）。インストール済みアプリからその属性を削除してください：',
  dl_macos_arch_note:
    "**Apple Silicon vs Intel：** M シリーズ Mac（M1 / M2 / M3 / M4）では `arm64` DMG をダウンロード。Intel Mac では `x64` DMG をダウンロード。誤ったビルドも Rosetta 経由で動作しますが、速度は明らかに遅くなります。",

  dl_linux_first_h3: "Linux 初回起動",
  dl_linux_appimagelauncher:
    "**省略可能なデスクトップ統合：** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) を一度インストールしておくと、ダブルクリックした AppImage が自動的にランチャーメニューに登録されます — `.desktop` ファイルの手動作成は不要です。",

  dl_verify_h3: "ダウンロードの検証（SHA256）",
  dl_verify_intro:
    "各リリースではバイナリと一緒に `SHA256SUMS` ファイルが公開されています。ダウンロードが転送中に破損または改ざんされていないことを確認するには、ファイルをローカルでハッシュ計算し、`SHA256SUMS` の該当行と照合してください。最新リリースページを開き → **Assets** → `SHA256SUMS` をダウンロード。",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "サードパーティのマルウェアスキャンを希望する場合は、[VirusTotal](https://www.virustotal.com) にファイルをアップロードしてください。マイナーなエンジンによる汎用ヒューリスティックの数件の検出は、署名されていない Electron アプリでは通常の範囲内です。主要エンジンによる広範な検出があれば、それは本物の懸念事項です。",

  dl_pm_intro:
    "パッケージマネージャーを使っている場合は、手動ダウンロードのステップを省略できます。",

  privacy_p1:
    "ダウンロードは [yt-dlp](https://github.com/yt-dlp/yt-dlp) 経由で YouTube から選択したフォルダへ直接取得されます — サードパーティのサーバーは経由しません。視聴履歴、ダウンロード履歴、URL、ファイルの内容はすべてあなたのデバイスに留まります。",
  privacy_p2:
    "Arroxy は [OpenPanel](https://openpanel.dev) 経由で匿名・集計されたテレメトリーを送信します — 起動数、OS、アプリバージョン、クラッシュを把握するための最低限だけです。URL、動画タイトル、ファイルパス、アカウント情報、フィンガープリンティング、個人データはありません。インストールごとの ID はランダムで、あなたの身元には結びつきません。設定からオプトアウトできます。",
  faq_q1: "本当に無料ですか？",
  faq_a1: "はい — MIT ライセンス、プレミアム層なし、機能ゲートなし。",
  faq_q2: "どの動画品質をダウンロードできますか？",
  faq_a2:
    "YouTube が提供するすべて：4K UHD（2160p）、1440p、1080p、720p、480p、360p、音声のみ。60 fps、120 fps、HDR ストリームはそのまま保存されます。",
  faq_q3: "音声を MP3 として抽出できますか？",
  faq_a3: "はい。形式メニューで*音声のみ*を選び、MP3、M4A/AAC、Opus、WAV を選択できます。",
  faq_q4: "YouTube アカウントや Cookie が必要ですか？",
  faq_a4:
    "デフォルトでは不要です — Arroxy は YouTube アカウント、ログイン、Cookie のエクスポートなしで動作します。年齢制限付きやメンバー限定動画など、認証が必要なコンテンツのために、詳細設定にオプションの Cookie サポート（Cookies source: file or browser）が用意されています。デフォルトはオフです。有効化する場合、yt-dlp の wiki は [Cookie ベースの自動化が Google アカウントにフラグを立てる可能性がある](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) と注意しています。その場合は使い捨てアカウントの利用が安全です。",
  faq_q5: "YouTube が変更したら使えなくなりますか？",
  faq_a5:
    "yt-dlp は起動時に自動更新され、YouTube に変更があれば Arroxy も迅速に修正をリリースします。万が一問題が発生した場合は、フォールバックとして詳細設定にオプションの Cookie サポートが用意されています。",
  faq_q6: "Arroxy は何言語に対応していますか？",
  faq_a6:
    "21 言語に標準対応：English、Español（スペイン語）、Deutsch（ドイツ語）、Français（フランス語）、日本語、中文（中国語）、Русский（ロシア語）、Українська（ウクライナ語）、हिन्दी（ヒンディー語）、Afaan Oromoo、Kiswahili、O'zbekcha（ウズベク語）、Tiếng Việt（ベトナム語）、አማርኛ（アムハラ語）、العربية（アラビア語）、اردو（ウルドゥー語）、پښتو（パシュトー語）、বাংলা（ベンガル語）、မြန်မာဘာသာ（ビルマ語）、Ελληνικά（ギリシャ語）、Српски（セルビア語）。Arroxy は初回起動時に OS の言語を自動検出し、ツールバーの言語選択でいつでも切り替え可能です。翻訳は src/shared/i18n/locales/ 内の素の TypeScript オブジェクトとして管理されているので、GitHub で PR を開いて貢献できます。",
  faq_q7: "他に何かインストールが必要ですか？",
  faq_a7:
    "いいえ。yt-dlp は初回起動時に自動ダウンロードされてマシンにキャッシュされます。ffmpeg と ffprobe はアプリに同梱されています。それ以降は追加のセットアップ不要です。",
  faq_q8: "プレイリストやチャンネル全体をダウンロードできますか？",
  faq_a8:
    "はい、どちらも対応しています。プレイリストまたはチャンネルのURL（例: `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`）を貼り付け、スキャンする件数を選んでから、リスト全体をキューに入れるか特定の動画を選べます。日付範囲フィルターは近日対応予定です。",
  faq_q9: 'macOS で「アプリが壊れている」と表示される — どうすれば？',
  faq_a9:
    'それは macOS Gatekeeper が未署名のアプリをブロックしているもので、実際の破損ではありません。["App is damaged" — Terminal による修正](#macos-first-launch) を参照してください — 1 行の `xattr` コマンドで解決できます。',
  faq_q10: "YouTube の動画をダウンロードするのは合法ですか？",
  faq_a10:
    "個人的・私的利用については、ほとんどの法域で一般的に容認されています。YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの地域の著作権法への準拠はあなた自身の責任です。",
  plan_intro: "引き続き予定されている機能 — おおよその優先順位順：",
  plan_col1: "機能",
  plan_col2: "説明",
  plan_r1_name: "**プレイリスト・チャンネルのフィルター**",
  plan_r1_desc: "プレイリストまたはチャンネルの列挙時の日付範囲フィルター",
  plan_r2_name: "**複数 URL の一括入力**",
  plan_r2_desc: "複数の URL を一度に貼り付けて一気に実行",
  plan_r4_name: "**カスタムファイル名テンプレート**",
  plan_r4_desc:
    "タイトル、投稿者、日付、解像度でファイルを命名 — ライブプレビュー付き",
  plan_r5_name: "**スケジュールダウンロード**",
  plan_r5_desc: "設定した時刻にキューを開始（夜間実行など）",
  plan_r6_name: "**速度制限**",
  plan_r6_desc: "帯域をキャップしてダウンロードが接続を飽和させないように",
  plan_r7_name: "**クリップトリミング**",
  plan_r7_desc: "開始・終了時刻でセグメントのみをダウンロード",
  plan_cta:
    "機能のアイデアがありますか？[リクエストを開いてください](../../issues) — コミュニティの意見が優先順位を決めます。",
  tech_content: TECH_CONTENT,
  tos_h2: "利用規約",
  tos_note:
    "Arroxy は個人的・私的利用のみを目的としたツールです。ダウンロードが YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの法域の著作権法に準拠することはあなた自身の責任です。権利を持たないコンテンツのダウンロード・複製・配布に Arroxy を使用しないでください。開発者は誤用に対して一切の責任を負いません。",
  footer_credit:
    'MIT ライセンス · <a href="https://x.com/OrionusAI">@OrionusAI</a> が心を込めて制作',
};
