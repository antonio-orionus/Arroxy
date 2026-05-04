const TECH_CONTENT = `<details>
<summary><strong>スタック</strong></summary>

- **Electron** — クロスプラットフォームのデスクトップシェル
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — スタイリング
- **Zustand** — 状態管理
- **yt-dlp** + **ffmpeg** — ダウンロード・マルチプレクサエンジン（初回起動時に GitHub から取得、常に最新）
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

> yt-dlp と ffmpeg はバンドルされていません — 初回起動時に公式 GitHub releases から取得され、アプリデータフォルダにキャッシュされます。

</details>`;

export const ja = {
  icon_alt: "Arroxy マスコット",
  title: "Arroxy — Windows・macOS・Linux 向け無料オープンソース YouTube ダウンローダー",
  read_in_label: "言語：",
  badge_release_alt: "リリース",
  badge_build_alt: "ビルド",
  badge_license_alt: "ライセンス",
  badge_platforms_alt: "プラットフォーム",
  badge_i18n_alt: "対応言語",
  hero_desc:
    "YouTube の動画・Shorts・音声トラックをオリジナル品質でダウンロード — 最大 4K HDR 60fps、または MP3 / AAC / Opus として。Windows、macOS、Linux でローカル動作。**広告なし、ログインなし、ブラウザ Cookie なし、Google アカウント連携なし。**",
  cta_latest: "↓ 最新リリースをダウンロード",
  demo_alt: "Arroxy デモ",
  star_cta: "Arroxy が役に立ったなら、⭐ で他のユーザーへの周知を助けてください。",
  ai_notice:
    "> 🌐 これは AI 翻訳です。[英語版 README](README.md) が情報のソースです。誤りを見つけたら [PR を歓迎します](../../pulls)。",
  toc_heading: "目次",
  why_h2: "なぜ Arroxy？",
  nocookies_h2: "Cookie なし、ログインなし、アカウント連携なし",
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
  nocookies_intro:
    "これはデスクトップ向け YouTube ダウンローダーが壊れる最も一般的な原因であり、Arroxy が存在する主な理由です。",
  nocookies_setup:
    "YouTube が bot 検出を更新すると、多くのツールはブラウザの YouTube Cookie を回避策としてエクスポートするよう求めます。これには 2 つの問題があります：",
  nocookies_p1:
    "エクスポートされたセッションは通常 30 分ほどで失効するため、常に再エクスポートが必要です。",
  nocookies_p2:
    "yt-dlp の公式ドキュメントでは、[Cookie ベースの自動化が Google アカウントにフラグを立てる可能性がある](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) と警告しています。",
  nocookies_outro:
    "**Arroxy は Cookie、ログイン、資格情報を一切求めません。** YouTube が任意のブラウザに提供する公開トークンのみを使用します。Google の身元に紐付くものなし、失効するものなし、ローテートするものなし。",
  feat_quality_h3: "画質・フォーマット",
  feat_quality_1: "最大 **4K UHD（2160p）**、1440p、1080p、720p、480p、360p",
  feat_quality_2: "**ハイフレームレート**をそのまま保存 — 60 fps、120 fps、HDR",
  feat_quality_3: "**音声のみ**として MP3、AAC、または Opus にエクスポート",
  feat_quality_4: "クイックプリセット：*最高画質* · *バランス* · *小さいファイル*",
  feat_privacy_h3: "プライバシー・制御",
  feat_privacy_1:
    "100% ローカル処理 — ダウンロードは YouTube から直接あなたのディスクへ",
  feat_privacy_2: "ログインなし、Cookie なし、Google アカウント連携なし",
  feat_privacy_3: "選択したフォルダに直接ファイルを保存",
  feat_workflow_h3: "ワークフロー",
  feat_workflow_1:
    "**任意の YouTube URL を貼り付け** — 動画も Shorts も両対応",
  feat_workflow_2:
    "**複数ダウンロードキュー** — 複数のダウンロードを並行して追跡",
  feat_workflow_3:
    "**クリップボード監視** — YouTube リンクをコピーすると、アプリにフォーカスを戻したときに Arroxy が URL を自動入力（詳細設定でトグル切替可能）",
  feat_workflow_4:
    "**URL 自動クリーンアップ** — トラッキングパラメータ（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）を除去し、`youtube.com/redirect` リンクを展開",
  feat_workflow_5:
    "**トレイモード** — ウィンドウを閉じてもダウンロードはバックグラウンドで継続",
  feat_workflow_6:
    "**9 言語対応** — システムロケールを自動検出、いつでも切替可能",
  feat_post_h3: "字幕・後処理",
  feat_post_1:
    "SRT、VTT、または ASS 形式の**字幕** — 手動または自動生成、利用可能な任意の言語",
  feat_post_2:
    "動画の隣に保存、`.mkv` に埋め込み、または `Subtitles/` サブフォルダに整理",
  feat_post_3:
    "**SponsorBlock** — スポンサー、イントロ、アウトロ、自己宣伝をスキップまたはチャプターマーク",
  feat_post_4:
    "**埋め込みメタデータ** — タイトル、アップロード日、チャンネル、説明、サムネイル、チャプターマーカーをファイルに書き込み",
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
  privacy_p1:
    "ダウンロードは [yt-dlp](https://github.com/yt-dlp/yt-dlp) 経由で YouTube から選択したフォルダへ直接取得されます — サードパーティのサーバーは経由しません。視聴履歴、ダウンロード履歴、URL、ファイルの内容はすべてあなたのデバイスに留まります。",
  privacy_p2:
    "Arroxy は [Aptabase](https://aptabase.com) 経由で匿名・集計されたテレメトリを送信します — インディープロジェクトが実際に使われているかを確認するための最低限の情報（起動数、OS、アプリバージョン、クラッシュ）のみです。URL、動画タイトル、ファイルパス、IP アドレス、アカウント情報は一切収集しません — Aptabase はオープンソースで設計上 GDPR 対応済みです。設定からオプトアウトできます。",
  faq_q1: "本当に無料ですか？",
  faq_a1: "はい — MIT ライセンス、プレミアム層なし、機能ゲートなし。",
  faq_q2: "どの動画品質をダウンロードできますか？",
  faq_a2:
    "YouTube が提供するすべて：4K UHD（2160p）、1440p、1080p、720p、480p、360p、音声のみ。60 fps、120 fps、HDR ストリームはそのまま保存されます。",
  faq_q3: "音声を MP3 として抽出できますか？",
  faq_a3: "はい。フォーマットメニューで *音声のみ* を選び、MP3、AAC、または Opus を選択してください。",
  faq_q4: "YouTube アカウントや Cookie が必要ですか？",
  faq_a4:
    "いいえ。Arroxy は YouTube が任意のブラウザに提供する公開トークンのみを使用します。Cookie なし、ログインなし、資格情報の保存なし。なぜこれが重要なのかは [Cookie なし、ログインなし、アカウント連携なし](#no-cookies) を参照してください。",
  faq_q5: "YouTube が変更したら使えなくなりますか？",
  faq_a5:
    "2 段階の耐性があります：yt-dlp は YouTube の変更から数時間以内に更新され、Arroxy は 30 分ごとに失効する Cookie に依存しません。これにより、ブラウザのセッションエクスポートに依存するツールよりも明らかに安定しています。",
  faq_q6: "Arroxy は何言語に対応していますか？",
  faq_a6:
    "9 言語：English、Español、Deutsch、Français、日本語、中文、Русский、Українська、हिन्दी。システム言語を自動検出し、ツールバーからいつでも切替可能。ロケールファイルは `src/shared/i18n/locales/` の素の TypeScript オブジェクトです — [PR を歓迎します](../../pulls)。",
  faq_q7: "他に何かインストールが必要ですか？",
  faq_a7:
    "いいえ。yt-dlp と ffmpeg は初回起動時に公式 GitHub releases から自動ダウンロードされ、ローカルにキャッシュされます。",
  faq_q8: "プレイリストやチャンネル全体をダウンロードできますか？",
  faq_a8:
    "現在は単一動画と Shorts のみ対応。プレイリストとチャンネルのサポートは [ロードマップ](#roadmap) にあります。",
  faq_q9: 'macOS で「アプリが壊れている」と表示される — どうすれば？',
  faq_a9:
    "それは macOS Gatekeeper が未署名のアプリをブロックしているもので、実際の破損ではありません。修正方法は [macOS の初回起動](#download) セクションを参照してください。",
  faq_q10: "YouTube の動画をダウンロードするのは合法ですか？",
  faq_a10:
    "個人的・私的利用については、ほとんどの法域で一般的に容認されています。YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの地域の著作権法への準拠はあなた自身の責任です。",
  plan_intro: "予定されている機能 — おおよその優先順位順：",
  plan_col1: "機能",
  plan_col2: "説明",
  plan_r1_name: "**プレイリスト・チャンネルのダウンロード**",
  plan_r1_desc:
    "プレイリストまたはチャンネルの URL を貼り付け、日付や件数のフィルタで全動画をキューに追加",
  plan_r2_name: "**複数 URL の一括入力**",
  plan_r2_desc: "複数の URL を一度に貼り付けて一気に実行",
  plan_r3_name: "**フォーマット変換**",
  plan_r3_desc: "別のツールなしにダウンロードを MP3、WAV、FLAC に変換",
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
