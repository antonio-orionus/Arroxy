<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy マスコット" width="180" />

# Arroxy — Windows・macOS・Linux 向け無料オープンソース YouTube（+ 2000 サイト）ダウンローダー

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**言語：** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · **日本語**

[![リリース](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![ビルド](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![ウェブサイト](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![ライセンス](https://img.shields.io/badge/license-MIT-green) ![プラットフォーム](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![対応言語](https://img.shields.io/badge/i18n-21_languages-blue)

**YouTube と 2000 以上の対応サイト**から動画・Shorts・音楽・チャンネル・ポッドキャスト・音声トラックをダウンロード — 最大 4K HDR 60fps、または MP3 / AAC / Opus として。Windows、macOS、Linux でローカル動作。**広告なし、余計なものなし、アップセルなし。**

[**↓ 最新リリースをダウンロード**](../../releases/latest) &nbsp;·&nbsp; [**ウェブサイト**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy デモ" width="720" />

Arroxy が役に立ったなら、⭐ で他のユーザーへの周知を助けてください。

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

> 🌐 これは AI 翻訳です。[英語版 README](README.md) が情報のソースです。誤りを見つけたら [PR を歓迎します](../../pulls)。

---

## 目次

- [なぜ Arroxy？](#why)
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

## <a id="features"></a>機能

### 画質・フォーマット

- 最大 **4K UHD（2160p）**、1440p、1080p、720p、480p、360p
- **ハイフレームレート**をそのまま保存 — 60 fps、120 fps、HDR
- **音声のみ**を MP3、M4A/AAC、Opus、WAV で書き出し
- クイックプリセット：*最高画質* · *バランス* · *小さいファイル*

### プライバシー・制御

- 100% ローカル処理 — ダウンロードは YouTube から直接あなたのディスクへ
- ログインなし、Cookie なし、Google アカウント連携なし
- 選択したフォルダに直接ファイルを保存

### ワークフロー

- **柔軟な開始モード** — ガイド付き単体ダウンロード、プレイリスト/チャンネル選択、URL一括貼り付け、保存済み既定値での Quick Download を選べます
- **中央ダウンロードキュー** — 単体、プレイリスト、一括、クイックの各ジョブが一か所に入り、進行状況、一時停止、再開、キャンセル、再試行、優先度を管理できます
- **クリップボード監視** — YouTube リンクをコピーすると、アプリにフォーカスを戻したときに Arroxy が URL を自動入力（詳細設定でトグル切替可能）
- **URL 自動クリーンアップ** — トラッキングパラメータ（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）を除去し、`youtube.com/redirect` リンクを展開
- **トレイモード** — ウィンドウを閉じてもダウンロードはバックグラウンドで継続
- **21 言語対応** — システムロケールを自動検出、いつでも切替可能
- **プレイリスト同期** — ローカルフォルダーと照合してプレイリストを再スキャンし、ダウンロード済みの動画をスキップします。各動画のダウンロードに合わせて更新される `.m3u` プレイリストファイルも生成します
- **速度とペーシング制御** — ダウンロード帯域を制限し、リクエスト間の待機を追加し、プリセット（*オフ · バランス · 慎重 · カスタム*）でフラグメントスレッドを調整できます

### 字幕・後処理

- SRT、VTT、または ASS 形式の**字幕** — 手動または自動生成、利用可能な任意の言語
- 動画の隣に保存、`.mkv` に埋め込み、または `Subtitles/` サブフォルダに整理
- **SponsorBlock** — スポンサー、イントロ、アウトロ、自己宣伝をスキップまたはチャプターマーク
- **埋め込みメタデータ** — タイトル、アップロード日、チャンネル、説明、サムネイル、チャプターマーカーをファイルに書き込み

### YouTube + 2000 サイト

- **YouTube、フル対応** — 動画・Shorts・チャンネル・プレイリスト・YouTube Music・ポッドキャストをファーストクラスのソースとして処理
- **2000 以上の他サイト** via yt-dlp — Vimeo、Twitch、Twitter/X、TikTok、SoundCloud、Bandcamp、Bilibili、BBC iPlayer、archive.org など多数
- **音声のみと字幕**は YouTube だけでなく、すべての対応サイトで機能します
- サイトが変更されても、yt-dlp は毎週修正をリリースし、Arroxy は起動時にバイナリを自動更新します

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

### <a id="why-warning"></a>警告が表示される理由

Arroxy はオープンソースで MIT ライセンスのソフトウェアです。Windows および macOS のビルドは**コード署名されていません** — Apple Developer ID と Windows EV のコード署名証明書はそれぞれ年間数百ドルかかり、個人プロジェクトでは自己負担になります。署名がない場合、Windows SmartScreen と macOS Gatekeeper は初回起動時に警告を表示します。これらの警告は*OS が発行元を認識していない*ことを意味するものであり、Arroxy がマルウェアであることを示すものではありません。

自分で Arroxy を検証する 3 つの方法（厳密さの高い順）：

- **ソースコードを読む。** すべての行は [GitHub](https://github.com/antonio-orionus/Arroxy) にあり、[ソースからビルド](#tech)することもできます。
- **SHA256 を確認する。** ダウンロードしたファイルを公開済みの [`SHA256SUMS`](../../releases/latest) と照合してください — 下記の[ダウンロードの検証](#verify)を参照。
- **サードパーティのスキャンを実行する。** [VirusTotal](https://www.virustotal.com) にファイルをアップロード。

### <a id="windows-first-launch"></a>Windows 初回起動

初回起動時に **«Windows protected your PC»** または **«Unknown publisher»** が表示されることがあります。これは `Arroxy-Setup-*.exe` と `Arroxy-Portable-*.exe` の両方に該当します。Arroxy は無料のオープンソースソフトウェアであり、Windows ビルドには有料の証明書によるコード署名がないため、SmartScreen がフラグを立てます。これは Arroxy が危険であることを**自動的に**意味するわけではありません。続行するには：

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. **More info** をクリック。
2. **Run anyway** をクリック。

#### Windows Defender がファイルをフラグまたは削除した場合

Defender のヒューリスティックは、署名されていない NSIS インストーラーや Electron のポータブル版を不審として検出することがあります。Defender が `Arroxy-Setup-*.exe` または `Arroxy-Portable-*.exe` を隔離した場合は、**Windows Security → Virus & threat protection → Protection history** から復元し、**Manage settings → Add or remove exclusions** で Arroxy の実行ファイルを許可リストに追加してください。SmartScreen と同様に、トリガーとなるのは発行元署名の欠如であり、マルウェアの検出ではありません。

> Arroxy は必ず公式の GitHub Releases ページからダウンロードしてください。他のウェブサイトから入手したファイルや、誰かから送られてきたファイルは削除し、公式ソースから新しいコピーをダウンロードしてください。ソースコードは公開されているため、ご自身で確認したり、Arroxy をビルドしたりすることも可能です。

### <a id="macos-first-launch"></a>macOS 初回起動

Arroxy はまだ macOS 向けのコード署名が行われていないため、Gatekeeper が初回起動をブロックします。許可する方法は macOS のバージョンによって異なります — Sequoia 15 では旧来の右クリック → 開く による回避策が制限されました。

#### macOS Sequoia 15 以降（現行）

Sequoia 15 以降では、右クリック → 開く では多くの隔離済みアプリの Gatekeeper をバイパスできなくなりました。代わりにシステム設定パネルを使用してください：

1. マウントした DMG から `Arroxy.app` を `/Applications` にドラッグ。
2. Arroxy をダブルクリックするとブロックダイアログが表示されます — **Done** をクリック（*Move to Trash* はクリックしない）。
3. **System Settings → Privacy & Security** を開き、**Security** セクションまでスクロール。*"Arroxy was blocked to protect your Mac"*（または同様のメッセージ）が表示されます。
4. **Open Anyway** をクリックし、パスワードまたは Touch ID で確認後、`/Applications` から Arroxy を再起動してください。

#### macOS Sonoma 14 以前

1. マウントした DMG から `Arroxy.app` を `/Applications` にドラッグ。
2. `/Applications` 内の `Arroxy.app` を右クリック（または Control-クリック）して **Open** を選択。
3. 警告ダイアログに **Open** ボタンが表示されます — クリックして確認。Arroxy が正常に開き、以後警告は表示されません。

#### "App is damaged" または Gatekeeper の継続的なブロック — Terminal による修正

macOS が *"Arroxy is damaged and can't be opened"* と表示する場合、または上記の手順でブロックが解除できない場合、原因は DMG の隔離属性です（一部のブラウザや macOS 自体のトランスロケーション動作が設定します）。インストール済みアプリからその属性を削除してください：

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel：** M シリーズ Mac（M1 / M2 / M3 / M4）では `arm64` DMG をダウンロード。Intel Mac では `x64` DMG をダウンロード。誤ったビルドも Rosetta 経由で動作しますが、速度は明らかに遅くなります。

> macOS ビルドは Apple Silicon と Intel の CI ランナーで生成されます。問題が発生した場合は [issue を開いて](../../issues) ください — macOS ユーザーからのフィードバックが macOS のテストサイクルを積極的に形成します。

### <a id="linux-first-launch"></a>Linux 初回起動

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

**省略可能なデスクトップ統合：** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) を一度インストールしておくと、ダブルクリックした AppImage が自動的にランチャーメニューに登録されます — `.desktop` ファイルの手動作成は不要です。

**Flatpak（サンドボックス版）：** 同じリリースページから `Arroxy-*.flatpak` をダウンロード。

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>ダウンロードの検証（SHA256）</strong></summary>

各リリースではバイナリと一緒に `SHA256SUMS` ファイルが公開されています。ダウンロードが転送中に破損または改ざんされていないことを確認するには、ファイルをローカルでハッシュ計算し、`SHA256SUMS` の該当行と照合してください。最新リリースページを開き → **Assets** → `SHA256SUMS` をダウンロード。

**Windows (PowerShell or Command Prompt):**

```powershell
certutil -hashfile Arroxy-Setup-<version>.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-<version>-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-*.AppImage
```

サードパーティのマルウェアスキャンを希望する場合は、[VirusTotal](https://www.virustotal.com) にファイルをアップロードしてください。マイナーなエンジンによる汎用ヒューリスティックの数件の検出は、署名されていない Electron アプリでは通常の範囲内です。主要エンジンによる広範な検出があれば、それは本物の懸念事項です。

</details>

<details>
<summary><strong>パッケージマネージャー経由でインストール</strong></summary>

パッケージマネージャーを使っている場合は、手動ダウンロードのステップを省略できます。

| チャンネル | コマンド                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-*.flatpak`                                                         |

</details>

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

---

## <a id="privacy"></a>プライバシー

ダウンロードは [yt-dlp](https://github.com/yt-dlp/yt-dlp) 経由で YouTube から選択したフォルダへ直接取得されます — サードパーティのサーバーは経由しません。視聴履歴、ダウンロード履歴、URL、ファイルの内容はすべてあなたのデバイスに留まります。

Arroxy は [OpenPanel](https://openpanel.dev) 経由で匿名・集計されたテレメトリーを送信します — 起動数、OS、アプリバージョン、クラッシュを把握するための最低限だけです。URL、動画タイトル、ファイルパス、アカウント情報、フィンガープリンティング、個人データはありません。インストールごとの ID はランダムで、あなたの身元には結びつきません。設定からオプトアウトできます。

---

## <a id="faq"></a>よくある質問

**本当に無料ですか？**
はい — MIT ライセンス、プレミアム層なし、機能ゲートなし。

**どの動画品質をダウンロードできますか？**
YouTube が提供するすべて：4K UHD（2160p）、1440p、1080p、720p、480p、360p、音声のみ。60 fps、120 fps、HDR ストリームはそのまま保存されます。

**音声を MP3 として抽出できますか？**
はい。形式メニューで*音声のみ*を選び、MP3、M4A/AAC、Opus、WAV を選択できます。

**YouTube アカウントや Cookie が必要ですか？**
デフォルトでは不要です — Arroxy は YouTube アカウント、ログイン、Cookie のエクスポートなしで動作します。年齢制限付きやメンバー限定動画など、認証が必要なコンテンツのために、詳細設定にオプションの Cookie サポート（Cookies source: file or browser）が用意されています。デフォルトはオフです。有効化する場合、yt-dlp の wiki は [Cookie ベースの自動化が Google アカウントにフラグを立てる可能性がある](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) と注意しています。その場合は使い捨てアカウントの利用が安全です。

**YouTube が変更したら使えなくなりますか？**
yt-dlp は起動時に自動更新され、YouTube に変更があれば Arroxy も迅速に修正をリリースします。万が一問題が発生した場合は、フォールバックとして詳細設定にオプションの Cookie サポートが用意されています。

**Arroxy は何言語に対応していますか？**
21 言語に標準対応：English、Español（スペイン語）、Deutsch（ドイツ語）、Français（フランス語）、日本語、中文（中国語）、Русский（ロシア語）、Українська（ウクライナ語）、हिन्दी（ヒンディー語）、Afaan Oromoo、Kiswahili、O'zbekcha（ウズベク語）、Tiếng Việt（ベトナム語）、አማርኛ（アムハラ語）、العربية（アラビア語）、اردو（ウルドゥー語）、پښتو（パシュトー語）、বাংলা（ベンガル語）、မြန်မာဘာသာ（ビルマ語）、Ελληνικά（ギリシャ語）、Српски（セルビア語）。Arroxy は初回起動時に OS の言語を自動検出し、ツールバーの言語選択でいつでも切り替え可能です。翻訳は src/shared/i18n/locales/ 内の素の TypeScript オブジェクトとして管理されているので、GitHub で PR を開いて貢献できます。

**他に何かインストールが必要ですか？**
いいえ。yt-dlp は初回起動時に自動ダウンロードされてマシンにキャッシュされます。ffmpeg と ffprobe はアプリに同梱されています。それ以降は追加のセットアップ不要です。

**プレイリストやチャンネル全体をダウンロードできますか？**
はい、どちらも対応しています。プレイリストまたはチャンネルのURL（例: `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`）を貼り付け、スキャンする件数を選んでから、リスト全体をキューに入れるか特定の動画を選べます。日付範囲フィルターは近日対応予定です。

**macOS で「アプリが壊れている」と表示される — どうすれば？**
それは macOS Gatekeeper が未署名のアプリをブロックしているもので、実際の破損ではありません。["App is damaged" — Terminal による修正](#macos-first-launch) を参照してください — 1 行の `xattr` コマンドで解決できます。

**YouTube の動画をダウンロードするのは合法ですか？**
個人的・私的利用については、ほとんどの法域で一般的に容認されています。YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの地域の著作権法への準拠はあなた自身の責任です。

---

## <a id="roadmap"></a>ロードマップ

引き続き予定されている機能 — おおよその優先順位順：

| 機能    | 説明    |
| ---------------- | ---------------- |
| **プレイリスト・チャンネルのフィルター** | プレイリストまたはチャンネルの列挙時の日付範囲フィルター |
| **カスタムファイル名テンプレート** | タイトル、投稿者、日付、解像度でファイルを命名 — ライブプレビュー付き |
| **スケジュールダウンロード** | 設定した時刻にキューを開始（夜間実行など） |
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

> yt-dlp は初回起動時に GitHub から取得され、アプリデータフォルダにキャッシュされます。ffmpeg と ffprobe はすべての Arroxy リリースに同梱されています。

</details>

---

## <a id="troubleshooting"></a>Troubleshooting

### App won't open / no window appears

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\Arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/Arroxy/main.log` |
| Linux    | `~/.config/Arroxy/logs/main.log` |

**2. Launch with hardware acceleration disabled.** Open a terminal / Command Prompt and run the executable with a flag:

```bash
# Windows (Portable) — PowerShell, run from the folder containing the exe
.\Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-*.AppImage --disable-gpu
```

If that works, the GPU/driver is the cause. Make the change permanent (next step).

**3. Persist the flag via `argv.json`.** Create the file at:

| Platform | Path                                             |
| -------- | ------------------------------------------------ |
| Windows  | `%APPDATA%\Arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/Arroxy/argv.json` |
| Linux    | `~/.config/Arroxy/argv.json`                     |

With contents:

```json
{ "disable-hardware-acceleration": true }
```

Arroxy reads this before opening any window, so it works even when the window never appeared.

**4. Other flags worth trying** (combine if needed): `--disable-software-rasterizer`, `--disable-gpu-sandbox`, `--in-process-gpu`.

**5. Stale window position.** If the window may be opening off-screen (multi-monitor change since last run), delete `<userData>\window-state.json` and relaunch.

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## 利用規約

Arroxy は個人的・私的利用のみを目的としたツールです。ダウンロードが YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの法域の著作権法に準拠することはあなた自身の責任です。権利を持たないコンテンツのダウンロード・複製・配布に Arroxy を使用しないでください。開発者は誤用に対して一切の責任を負いません。

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT ライセンス · <a href="https://x.com/OrionusAI">@OrionusAI</a> が心を込めて制作</sub>
</div>
