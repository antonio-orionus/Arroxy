<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy マスコット" width="180" />

# Arroxy — Windows・macOS・Linux 向け無料オープンソース YouTube ダウンローダー

**4K · 1080p60 · HDR · MP3 · Shorts · Subtitles · SponsorBlock**

**言語：** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · **日本語**

[![リリース](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![ビルド](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) ![ライセンス](https://img.shields.io/badge/license-MIT-green) ![プラットフォーム](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![対応言語](https://img.shields.io/badge/i18n-21_languages-blue)

YouTube の動画・Shorts・音声トラックをオリジナル品質でダウンロード — 最大 4K HDR 60fps、または MP3 / AAC / Opus として。Windows、macOS、Linux でローカル動作。**広告なし、ログインなし、ブラウザ Cookie なし、Google アカウント連携なし。**

[**↓ 最新リリースをダウンロード**](../../releases/latest) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy デモ" width="720" />

Arroxy が役に立ったなら、⭐ で他のユーザーへの周知を助けてください。

</div>

> 🌐 これは AI 翻訳です。[英語版 README](README.md) が情報のソースです。誤りを見つけたら [PR を歓迎します](../../pulls)。

---

## 目次

- [なぜ Arroxy？](#why)
- [Cookie なし、ログインなし、アカウント連携なし](#no-cookies)
- [機能](#features)
- [ダウンロード](#download)
- [プライバシー](#privacy)
- [よくある質問](#faq)
- [ロードマップ](#roadmap)
- [技術詳細](#tech)

---

## <a id="why"></a>なぜ Arroxy？

最もよく使われる代替手段との比較：

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| 無料、プレミアム層なし |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| オープンソース |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| ローカル処理のみ |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| ログイン・Cookie エクスポート不要 |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| 利用回数制限なし |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| クロスプラットフォームのデスクトップアプリ |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| 字幕 + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy はひとつのことのために作られています：URL を貼って、クリーンなローカルファイルを得る。アカウントなし、アップセルなし、データ収集なし。

---

## <a id="no-cookies"></a>Cookie なし、ログインなし、アカウント連携なし

これはデスクトップ向け YouTube ダウンローダーが壊れる最も一般的な原因であり、Arroxy が存在する主な理由です。

YouTube が bot 検出を更新すると、多くのツールはブラウザの YouTube Cookie を回避策としてエクスポートするよう求めます。これには 2 つの問題があります：

1. エクスポートされたセッションは通常 30 分ほどで失効するため、常に再エクスポートが必要です。
2. yt-dlp の公式ドキュメントでは、[Cookie ベースの自動化が Google アカウントにフラグを立てる可能性がある](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) と警告しています。

**Arroxy は Cookie、ログイン、資格情報を一切求めません。** YouTube が任意のブラウザに提供する公開トークンのみを使用します。Google の身元に紐付くものなし、失効するものなし、ローテートするものなし。

---

## <a id="features"></a>機能

### 画質・フォーマット

- 最大 **4K UHD（2160p）**、1440p、1080p、720p、480p、360p
- **ハイフレームレート**をそのまま保存 — 60 fps、120 fps、HDR
- **音声のみ**として MP3、AAC、または Opus にエクスポート
- クイックプリセット：*最高画質* · *バランス* · *小さいファイル*

### プライバシー・制御

- 100% ローカル処理 — ダウンロードは YouTube から直接あなたのディスクへ
- ログインなし、Cookie なし、Google アカウント連携なし
- 選択したフォルダに直接ファイルを保存

### ワークフロー

- **任意の YouTube URL を貼り付け** — 動画も Shorts も両対応
- **複数ダウンロードキュー** — 複数のダウンロードを並行して追跡
- **クリップボード監視** — YouTube リンクをコピーすると、アプリにフォーカスを戻したときに Arroxy が URL を自動入力（詳細設定でトグル切替可能）
- **URL 自動クリーンアップ** — トラッキングパラメータ（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）を除去し、`youtube.com/redirect` リンクを展開
- **トレイモード** — ウィンドウを閉じてもダウンロードはバックグラウンドで継続
- **9 言語対応** — システムロケールを自動検出、いつでも切替可能

### 字幕・後処理

- SRT、VTT、または ASS 形式の**字幕** — 手動または自動生成、利用可能な任意の言語
- 動画の隣に保存、`.mkv` に埋め込み、または `Subtitles/` サブフォルダに整理
- **SponsorBlock** — スポンサー、イントロ、アウトロ、自己宣伝をスキップまたはチャプターマーク
- **埋め込みメタデータ** — タイトル、アップロード日、チャンネル、説明、サムネイル、チャプターマーカーをファイルに書き込み

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="URL を貼る" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="画質を選ぶ" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="保存先を選ぶ" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="ダウンロードキューが稼働中" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="字幕の言語とフォーマットの選択" />
</div>

---

## <a id="download"></a>ダウンロード

| プラットフォーム | フォーマット   |
| ------------------- | ------------------- |
| Windows             | インストーラ（NSIS）またはポータブル `.exe`   |
| macOS               | `.dmg`（Intel + Apple Silicon）   |
| Linux               | `.AppImage` または `.flatpak`（サンドボックス） |

[**最新リリースを入手 →**](../../releases/latest)

### パッケージマネージャー経由でインストール

| チャンネル | コマンド                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |

<details>
<summary><strong>Windows：インストーラ vs ポータブル</strong></summary>

|               | NSIS インストーラ | ポータブル `.exe` |
| ------------- | :----------------------: | :---------------------: |
| インストール必要 | はい  | いいえ — どこからでも実行可能  |
| 自動アップデート | ✅ アプリ内  | ❌ 手動ダウンロード  |
| 起動速度 | ✅ 速い  | ⚠️ コールドスタートが遅め  |
| スタートメニューに追加 |            ✅            |           ❌            |
| 簡単アンインストール |            ✅            | ❌ ファイルを削除するだけ  |

**おすすめ：** 自動アップデートと高速起動には NSIS インストーラを使用。インストール不要・レジストリ非変更のオプションにはポータブル `.exe` を使用。

</details>

<details>
<summary><strong>macOS の初回起動</strong></summary>

Arroxy はまだコード署名されていないため、初回起動時に macOS Gatekeeper が警告を表示します。これは想定内の動作であり、ファイルが破損しているわけではありません。

**システム設定を使う方法（推奨）：**

1. Arroxy のアプリアイコンを右クリックして **開く** を選択。
2. 警告ダイアログが表示されたら **キャンセル** をクリック（*ゴミ箱に入れる* は押さない）。
3. **システム設定 → プライバシーとセキュリティ** を開く。
4. **セキュリティ** セクションまでスクロール。*"Arroxy は確認済みの開発元のものではないためブロックされました"* と表示されています。
5. **このまま開く** をクリックし、パスワードまたは Touch ID で確認。

手順 5 のあとは Arroxy が通常通り開き、警告は二度と表示されません。

**ターミナルを使う方法（上級者向け）：**

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

> macOS ビルドは Apple Silicon と Intel の CI ランナーで生成されます。問題が発生した場合は [issue を開いて](../../issues) ください — macOS ユーザーからのフィードバックが macOS のテストサイクルを積極的に形成します。

</details>

<details>
<summary><strong>Linux の初回起動</strong></summary>

AppImage はインストール不要で直接実行できます。ファイルを実行可能としてマークするだけです。

**ファイルマネージャー：** `.AppImage` を右クリック → **プロパティ** → **権限** → **プログラムとして実行を許可** を有効化、ダブルクリックで起動。

**ターミナル：**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

それでも起動しない場合、FUSE が不足している可能性があります：

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Flatpak（サンドボックス版）：** 同じリリースページから `Arroxy-*.flatpak` をダウンロード。

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

</details>

---

## <a id="privacy"></a>プライバシー

ダウンロードは [yt-dlp](https://github.com/yt-dlp/yt-dlp) 経由で YouTube から選択したフォルダへ直接取得されます — サードパーティのサーバーは経由しません。視聴履歴、ダウンロード履歴、URL、ファイルの内容はすべてあなたのデバイスに留まります。

Arroxy は [Aptabase](https://aptabase.com) 経由で匿名・集計されたテレメトリを送信します — インディープロジェクトが実際に使われているかを確認するための最低限の情報（起動数、OS、アプリバージョン、クラッシュ）のみです。URL、動画タイトル、ファイルパス、IP アドレス、アカウント情報は一切収集しません — Aptabase はオープンソースで設計上 GDPR 対応済みです。設定からオプトアウトできます。

---

## <a id="faq"></a>よくある質問

**本当に無料ですか？**
はい — MIT ライセンス、プレミアム層なし、機能ゲートなし。

**どの動画品質をダウンロードできますか？**
YouTube が提供するすべて：4K UHD（2160p）、1440p、1080p、720p、480p、360p、音声のみ。60 fps、120 fps、HDR ストリームはそのまま保存されます。

**音声を MP3 として抽出できますか？**
はい。フォーマットメニューで *音声のみ* を選び、MP3、AAC、または Opus を選択してください。

**YouTube アカウントや Cookie が必要ですか？**
いいえ。Arroxy は YouTube が任意のブラウザに提供する公開トークンのみを使用します。Cookie なし、ログインなし、資格情報の保存なし。なぜこれが重要なのかは [Cookie なし、ログインなし、アカウント連携なし](#no-cookies) を参照してください。

**YouTube が変更したら使えなくなりますか？**
2 段階の耐性があります：yt-dlp は YouTube の変更から数時間以内に更新され、Arroxy は 30 分ごとに失効する Cookie に依存しません。これにより、ブラウザのセッションエクスポートに依存するツールよりも明らかに安定しています。

**Arroxy は何言語に対応していますか？**
9 言語：English、Español、Deutsch、Français、日本語、中文、Русский、Українська、हिन्दी。システム言語を自動検出し、ツールバーからいつでも切替可能。ロケールファイルは `src/shared/i18n/locales/` の素の TypeScript オブジェクトです — [PR を歓迎します](../../pulls)。

**他に何かインストールが必要ですか？**
いいえ。yt-dlp と ffmpeg は初回起動時に公式 GitHub releases から自動ダウンロードされ、ローカルにキャッシュされます。

**プレイリストやチャンネル全体をダウンロードできますか？**
現在は単一動画と Shorts のみ対応。プレイリストとチャンネルのサポートは [ロードマップ](#roadmap) にあります。

**macOS で「アプリが壊れている」と表示される — どうすれば？**
それは macOS Gatekeeper が未署名のアプリをブロックしているもので、実際の破損ではありません。修正方法は [macOS の初回起動](#download) セクションを参照してください。

**YouTube の動画をダウンロードするのは合法ですか？**
個人的・私的利用については、ほとんどの法域で一般的に容認されています。YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの地域の著作権法への準拠はあなた自身の責任です。

---

## <a id="roadmap"></a>ロードマップ

予定されている機能 — おおよその優先順位順：

| 機能    | 説明    |
| ---------------- | ---------------- |
| **プレイリスト・チャンネルのダウンロード** | プレイリストまたはチャンネルの URL を貼り付け、日付や件数のフィルタで全動画をキューに追加 |
| **複数 URL の一括入力** | 複数の URL を一度に貼り付けて一気に実行 |
| **フォーマット変換** | 別のツールなしにダウンロードを MP3、WAV、FLAC に変換 |
| **カスタムファイル名テンプレート** | タイトル、投稿者、日付、解像度でファイルを命名 — ライブプレビュー付き |
| **スケジュールダウンロード** | 設定した時刻にキューを開始（夜間実行など） |
| **速度制限** | 帯域をキャップしてダウンロードが接続を飽和させないように |
| **クリップトリミング** | 開始・終了時刻でセグメントのみをダウンロード |

機能のアイデアがありますか？[リクエストを開いてください](../../issues) — コミュニティの意見が優先順位を決めます。

---

## <a id="tech"></a>技術詳細

<details>
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

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

ネイティブビルドツールは不要 — このプロジェクトにはネイティブ Node アドオンがありません。

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux（Ubuntu / Debian）

```bash
curl -fsSL https://bun.sh/install | bash

# Electron ランタイム依存
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E テストのみ（Electron にはディスプレイが必要）
sudo apt install -y xvfb
```

### クローンして実行

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # ホットリロード開発ビルド
```

### 配布パッケージのビルド

```bash
bun run build        # 型チェック + コンパイル
bun run dist         # 現在の OS 向けパッケージ
bun run dist:win     # Windows ポータブル exe のクロスコンパイル
```

> yt-dlp と ffmpeg はバンドルされていません — 初回起動時に公式 GitHub releases から取得され、アプリデータフォルダにキャッシュされます。

</details>

---

## 利用規約

Arroxy は個人的・私的利用のみを目的としたツールです。ダウンロードが YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの法域の著作権法に準拠することはあなた自身の責任です。権利を持たないコンテンツのダウンロード・複製・配布に Arroxy を使用しないでください。開発者は誤用に対して一切の責任を負いません。

<div align="center">
  <sub>MIT ライセンス · <a href="https://x.com/OrionusAI">@OrionusAI</a> が心を込めて制作</sub>
</div>
