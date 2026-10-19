<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy マスコット" width="180" />

# Arroxy — ブラウザー内蔵、Windows・macOS・Linux 向け無料オープンソース YouTube（+ 2000 サイト）ダウンローダー

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**言語：** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · **日本語** · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![リリース](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![ビルド](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![ウェブサイト](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![ライセンス](https://img.shields.io/badge/license-MIT-green) ![プラットフォーム](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![対応言語](https://img.shields.io/badge/i18n-31_languages-blue)

**YouTube と 2000 以上の対応サイト**から動画・Shorts・音楽・チャンネル・ポッドキャスト・音声トラックをダウンロード — 最大 8K HDR 60fps、MP3 / AAC / Opus として、または必要な部分だけ。Explore タブで **Arroxy の中で YouTube やほかのサイトを閲覧**し、表示中の動画・プレイリスト・チャンネルをダウンロード。そこでサインインすれば、アカウントで視聴できる非公開動画、メンバー限定動画、年齢制限付き動画もダウンロードできます。Windows、macOS、Linux でローカル動作。**広告なし、余計なものなし、アップセルなし。**

[**↓ 最新リリースをダウンロード**](#install) &nbsp;·&nbsp; [**ウェブサイト**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows 初回起動](#windows-first-launch) · [macOS 初回起動](#macos-first-launch) · [Linux 初回起動](#linux-first-launch)

[![Discord コミュニティに参加](https://img.shields.io/badge/Discord%20%E3%82%B3%E3%83%9F%E3%83%A5%E3%83%8B%E3%83%86%E3%82%A3%E3%81%AB%E5%8F%82%E5%8A%A0-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Arroxy が役に立ったなら、⭐ で他のユーザーへの周知を助けてください。

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 これは AI 翻訳です。[英語版 README](README.md) が情報のソースです。誤りを見つけたら [PR を歓迎します](../../pulls)。

---

## 目次

- [✨ 機能](#features)
- [📥 インストールと初回起動](#install)
  - [Windows 初回起動](#windows-first-launch)
  - [macOS 初回起動](#macos-first-launch)
  - [警告が表示される理由](#why-warning)
  - [Linux 初回起動](#linux-first-launch)
  - [ダウンロードの検証（SHA256）](#verify)
- [⚖️ なぜ Arroxy？](#why)
- [🔒 プライバシー](#privacy)
- [❓ よくある質問](#faq)
- [🗺️ ロードマップ](#roadmap)
- [💖 Arroxy を支援する](#support)
- [🛠️ 技術詳細](#tech)

---

## <a id="features"></a>✨ 機能

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Arroxy の中で YouTube やほかのサイトを閲覧し、表示中のページをアクティブなプロファイルでダウンロード</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore の最初の画面</b><br/>Explore の簡単な紹介と、サブアカウントのほうが安全なサインインである理由</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>対応が必要なものをダウンロードが知らせます</b><br/>リンクはバックグラウンドで準備され、失敗したものは対処法を提示し、長いプレイリストは選択を待ちます</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>動画の一部だけをダウンロード</b><br/>開始と終了、またはチャプターを選ぶだけ — Arroxy はその範囲だけを保存します</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>プロファイルエディター</b><br/>プロファイルを細かく調整：ファイル形式、解像度、字幕、保存先、ファイル名テンプレートなど</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>ダークかライトか、ガラスかソリッドか</b><br/>選べる4つのデザイン：動く空に浮かぶガラスのパネル、または落ち着いたソリッドな画面。それぞれダークとライトに対応</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy のグローバルダウンロードホットキー — Windows と Linux では Ctrl+Shift+D、macOS では Cmd+Shift+D で、コピーしたリンクをそのままダウンロードキューへ送ります" width="760" /></picture><br/><sub><b>グローバルダウンロードホットキー</b><br/>どこでもリンクをコピーして一度押すだけ——キューに入りダウンロードが始まります</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>プレイリストの動画ごとのプロファイル</b><br/>各動画に個別のプロファイルを指定——一部は4Kで保存し、残りはMP3で取得</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>クイックダウンロードのホーム</b><br/>URLを貼り付け、アクティブなプロファイルですぐにダウンロード</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>再利用できるダウンロードプロファイル</b><br/>形式・画質・出力をプリセットとして保存——ダウンロードごとに再利用</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>多言語の音声トラック</b><br/>動画が持つ音声言語を正確に選択</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>サラウンド / Dolby 音声</b><br/>5.1 と Dolby のトラックを検出して保持</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>一括URLモード</b><br/>リストを貼り付け、自動で重複を除去し、まとめてキューに追加</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>並列ダウンロードキュー</b><br/>複数のダウンロードを同時に、進捗をリアルタイム表示</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore：Arroxy の中でウェブを閲覧</strong></summary>

- **Explore タブ** — Arroxy の中で YouTube やほかのサイトを閲覧し、見つけた動画をリンクをコピーせずにダウンロードできます。**ダウンロード · *プロファイル名*** は、表示中の動画・プレイリスト・チャンネルをキューに追加します。隣の矢印でプロファイルを切り替え、魔法の杖アイコンからは形式や字幕などを選べるステップ式のダウンロードを開けます
- **右クリックでダウンロード** — Explore で動画・プレイリスト・チャンネルのリンクを右クリックすると、プロファイルでそのままダウンロードしたり、**プロファイルでダウンロード** から別のプロファイルを選んだり、ステップ式のダウンロードを開いたり、リンクをコピーしたりできます。動画を一つずつ開く必要はありません
- **コンパクト表示** — Explore のツールバーでワンクリックすると、Arroxy のタブがそこに移り、ページを広く使えます
- **アドレスバー** — 入力して YouTube を検索するか、ウェブアドレスを入力してそのサイトを開きます
- **アカウントが必要なダウンロード** — Explore で一度サインインすれば、アカウントで視聴できる非公開動画やメンバー限定動画、年齢確認済みアカウントなら年齢制限付き動画、「後で見る」や「高く評価した動画」のリストもダウンロードできます。ほかのサイトにもそこでサインインでき、必要なときはそのサイトのダウンロードにそのサインインが使われます。Arroxy はまずサインアウトの状態でダウンロードし、アカウントで解決できる理由でダウンロードに失敗したときだけ Explore のサインインを使います。YouTube からボットでないことの確認を求められた場合も、Arroxy は Explore のサインインを試します
- **サブアカウントの利用を推奨** — Explore の最初の画面で理由を説明しています。アカウントを使ってダウンロードすると、そのアカウントが制限される恐れが多少あります。サインインをすべて消したいときは、設定から Explore をサインアウトしてください
- **広告ブロック** — 既定ではオフです。Explore のツールバーのシールドをワンクリックすると、そのページで広告とトラッカーをブロックします。ダウンロードには影響しません。サインイン済みアカウントでは、YouTube が広告ブロックに対抗してくることがあります

</details>

<details>
<summary><strong>🎞️ 画質・フォーマット</strong></summary>

- 最大 **8K（4320p）**、4K UHD（2160p）、1440p、1080p、720p、480p、360p
- **ハイフレームレートと HDR**をそのまま保存 — 60 fps、HDR10
- **音声** — 音声のみを MP3、M4A/AAC、Opus、WAV で書き出します。インタラクティブなダウンロードでは、利用可能な場合にソースのネイティブ サラウンド/Dolby トラック（AC-3、E-AC-3、5.1、DRC）を選択でき、グローバルな既定値 **サラウンド / Dolby を優先** を設定できます
- **目的別のプロファイル** — *最高画質*（AV1 · VP9）または *スマートTV*（MP4 · H.264）を、自動・MP4・MKV・WebM のいずれかで再エンコードなしに保存します。HDR は *自動*（画面が表示できる場合のみ）、*SDR*、*HDR* から選べます
- **すべての解像度ですべてのコーデック** — ステップ式のダウンロードでは解像度ごとに AV1、VP9、H.264 が並べて表示されるので、テレビや編集ソフトで再生できるものを選べます
- **ストリームの実態がわかる** — YouTube が AI でアップスケールしたサイズ、AI 吹き替えの音声言語、ビットレート強化版のストリーム、360° 動画、破損または透かし入りのコピーにはマークが付きます。プロファイルは、許可しない限り AI アップスケールのストリームをスキップします

</details>

<details>
<summary><strong>🛡️ プライバシー・制御</strong></summary>

- 100% ローカル処理 — ダウンロードは YouTube から直接あなたのディスクへ
- ログインなし、Cookie なし、Google アカウント連携なし
- 選択したフォルダに直接ファイルを保存

</details>

<details>
<summary><strong>⚡ ワークフロー</strong></summary>

- **グローバルダウンロードホットキー** — どのアプリでもリンクをコピーして `Ctrl+Shift+D`（macOS では `Cmd+Shift+D`）を押すだけ。Arroxy はウィンドウを開かずにアクティブなプロファイルでキューに追加し、通知で結果を知らせます。既定で有効、キー割り当ては変更可能
- **柔軟な開始モード** — ガイド付き単体ダウンロード、プレイリスト/チャンネル選択、URL一括貼り付け、保存済み既定値での Quick Download、または Explore での閲覧とダウンロードを選べます
- **中央ダウンロードキュー** — 単体、プレイリスト、一括、クイックの各ジョブが一か所に入り、進行状況、一時停止、再開、キャンセル、再試行、優先度を管理できます
- **クリップボード監視** — 動画リンクをコピーすると、Arroxy に戻ったときに URL 欄に入力されます。意図しない場合は **元に戻す** で取り消せます。Arroxy が処理中のときは、「URL」タブに戻るまでリンクが待機します（設定でオフにできます）
- **URL 自動クリーンアップ** — トラッキングパラメータ（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）を除去し、`youtube.com/redirect` リンクを展開
- **トレイモード** — ウィンドウを閉じてもダウンロードはバックグラウンドで継続
- **31 言語** — システム ロケールを自動検出し、いつでも切り替え可能
- **プレイリスト同期** — ローカルフォルダーと照合してプレイリストを再スキャンし、ダウンロード済みの動画をスキップします。各動画のダウンロードに合わせて更新される `.m3u` プレイリストファイルも生成します
- **速度とペーシング制御** — ダウンロード帯域を制限し、動画を同時に何分割で取得するかを設定し、プリセット（*オフ · バランス · 慎重 · カスタム*）でリクエスト間の待機を追加できます
- **ファイル名テンプレート** — `{title}`、`{uploader}`、`{id}`、`{date}`、`{resolution}`、`{playlist_index}` を使って好きな名前を付けられます。全体にもダウンロードプロファイルごとにも設定可能
- **同時ダウンロード数と自動再試行** — キューのダウンロードを同時に何件走らせるか選べます。ネットワークやサーバーの問題が起きたダウンロードは、試行ごとに待ち時間を延ばしながら Arroxy が再試行します
- **プレイリストの動画ごとにプロファイルを指定** — リスト全体に同じ設定を使う代わりに、プレイリスト内の各動画に個別のダウンロードプロファイルを割り当てられます。一度の処理で一部を最高画質で保存し、残りをMP3として取得できます
- **Quick Download はバックグラウンドで動作** — リンクはすぐにダウンロードに表示されてそこで準備され、**表示**付きの通知で確認でき、URL 欄は次のリンクのために空になります。前のものを準備している間も、いくつでも開始できます
- **対応が必要なものをダウンロードが知らせます** — Arroxy がリンクを読み取れないと、その行に理由と対処法（再試行、Cookie をオン、Explore でサインイン）が表示されます。Cookie がオフのときは、サインイン後に **Explore でサインイン** が自動で再試行します。読み込み上限を超えるプレイリストは、その行で待機し、全件・先頭の数件・確認のいずれかを選べます。ダウンロードタブには、対応待ちの行数が表示されます
- **動画の一部だけをダウンロード** — 形式画面で開始と終了、またはチャプターを選ぶと、Arroxy はその範囲だけを保存し、動画 ID の後ろに範囲を付けた名前にします。カットは最も近いキーフレームで行われます。正確なカットをオンにすると、代わりに再エンコードします
- **完了したダウンロードを自動で削除** — オプション：完了したダウンロードは 5 秒後にリストから消えます。ファイルはディスクに残り、失敗したダウンロードはリストに残ります
- **ダウンロードの「サイズ」と「見つかりません」** — 並べ替えできる **サイズ** 列で各ダウンロードの容量が分かり、**見つかりません** は Arroxy の外で移動・削除されたファイルを示します
- **オーロラかミニマル、ダークかライト** — 動く空の上にガラスのパネルを重ねるか、静かなソリッドの面か。フッターから切り替えられます。グラフィックスアクセラレーションのないコンピューターでは自動的にミニマルになります
- **Mac のメニューバー** — macOS では、メニューバーから設定（`Cmd+,`）を開き、ダウンロード速度の上限を設定し、スタイルとテーマを切り替え、ログを開いたり診断ファイルを保存したりできます
- **どのダウンロードからでもプロファイルを変更** — ダウンロードを調整してから、元になったプロファイルを更新する（変更点のプレビュー付き）か、その設定を新しいプロファイルとして保存できます。プロファイルを切り替えるときは、編集内容を残すかどうかを確認します

</details>

<details>
<summary><strong>📝 字幕・後処理</strong></summary>

- SRT、VTT、または ASS 形式の**字幕** — 手動または自動生成、利用可能な任意の言語
- 動画の隣に保存、`.mkv` に埋め込み、または `Subtitles/` サブフォルダに整理
- **字幕のみの一括処理** — URLリストを貼り付けるかプレイリストを開き、字幕を選ぶだけで、各動画の字幕ファイルだけを取得
- **SponsorBlock** — スポンサー、イントロ、アウトロ、自己宣伝をスキップまたはチャプターマーク
- **埋め込みメタデータ** — タイトル、アップロード日、チャンネル、説明、サムネイル、チャプターマーカーをファイルに書き込み

</details>

<details>
<summary><strong>🌐 YouTube + 2000 サイト</strong></summary>

- **YouTube、フル対応** — 動画・Shorts・チャンネル・プレイリスト・YouTube Music・ポッドキャストをファーストクラスのソースとして処理
- **2000 以上の他サイト** via yt-dlp — Twitch、TikTok、Dailymotion、VK、SoundCloud、Bandcamp、Bilibili、archive.org、Streamable など多数
- **音声のみと字幕**は YouTube だけでなく、すべての対応サイトで機能します
- サイトが変更されても、yt-dlp は毎週修正をリリースし、Arroxy は起動時にバイナリを自動更新します

</details>

---

## <a id="install"></a>📥 インストールと初回起動

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

AppImage:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

ビルドは x86_64 のみです。`curl` がない場合は `curl -fsSL` を `wget -qO-` に置き換えてください。

| プラットフォーム | フォーマット |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**最新リリースを入手 →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows 初回起動</strong></summary>

初回起動時に **«Windows protected your PC»** または **«Unknown publisher»** が表示されることがあります。これは `Arroxy-win-x64-Setup.exe` と `Arroxy-win-x64-Portable.exe` の両方に該当します。Arroxy は無料のオープンソースソフトウェアであり、Windows ビルドには有料の証明書によるコード署名がないため、SmartScreen がフラグを立てます。これは Arroxy が危険であることを**自動的に**意味するわけではありません。続行するには：

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. **More info** をクリック。
2. **Run anyway** をクリック。

#### Windows Defender がファイルをフラグまたは削除した場合

Defender のヒューリスティックは、署名されていない NSIS インストーラーや Electron のポータブル版を不審として検出することがあります。Defender が `Arroxy-win-x64-Setup.exe` または `Arroxy-win-x64-Portable.exe` を隔離した場合は、**Windows Security → Virus & threat protection → Protection history** から復元し、**Manage settings → Add or remove exclusions** で Arroxy の実行ファイルを許可リストに追加してください。SmartScreen と同様に、トリガーとなるのは発行元署名の欠如であり、マルウェアの検出ではありません。

> Arroxy は必ず公式の GitHub Releases ページからダウンロードしてください。他のウェブサイトから入手したファイルや、誰かから送られてきたファイルは削除し、公式ソースから新しいコピーをダウンロードしてください。ソースコードは公開されているため、ご自身で確認したり、Arroxy をビルドしたりすることも可能です。

Scoop をお使いですか？ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS 初回起動</strong></summary>

Arroxy はまだ macOS 向けにコード署名されていないため、DMG からインストールした後に Gatekeeper が *"Arroxy.app is damaged and can't be opened"* という怖いダイアログを表示することがあります。これは macOS が未署名アプリを quarantine したという意味で、アプリのファイルが実際に壊れているわけではありません。現在の macOS では Terminal を使う方法が確実です:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. マウントした DMG から `Arroxy.app` を `/Applications` にドラッグ。
2. Terminal を開き、次の 2 つのコマンドを実行します:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

最初のコマンドは、インストール済みの Arroxy から quarantine 属性を削除します。2 つ目はアプリを起動します。`sudo` は Mac のパスワードを求めることがあります。Terminal は入力中の文字を表示しません。

**Apple Silicon vs Intel：** M シリーズ Mac（M1 / M2 / M3 / M4）では `arm64` DMG をダウンロード。Intel Mac では `x64` DMG をダウンロード。誤ったビルドも Rosetta 経由で動作しますが、速度は明らかに遅くなります。

> macOS ビルドは Apple Silicon と Intel の CI ランナーで生成されます。問題が発生した場合は [issue を開いて](../../issues) ください — macOS ユーザーからのフィードバックが macOS のテストサイクルを積極的に形成します。

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ 警告が表示される理由</strong></summary>

Arroxy はオープンソースで MIT ライセンスのソフトウェアです。Windows および macOS のビルドは**コード署名されていません** — Apple Developer ID と Windows EV のコード署名証明書はそれぞれ年間数百ドルかかり、個人プロジェクトでは自己負担になります。署名がない場合、Windows SmartScreen と macOS Gatekeeper は初回起動時に警告を表示します。これらの警告は*OS が発行元を認識していない*ことを意味するものであり、Arroxy がマルウェアであることを示すものではありません。

自分で Arroxy を検証する 3 つの方法（厳密さの高い順）：

- **ソースコードを読む。** すべての行は [GitHub](https://github.com/antonio-orionus/Arroxy) にあり、[ソースからビルド](#tech)することもできます。
- **SHA256 を確認する。** ダウンロードしたファイルを公開済みの [`SHA256SUMS`](../../releases/latest) と照合してください — 下記の[ダウンロードの検証](#verify)を参照。
- **サードパーティのスキャンを実行する。** [VirusTotal](https://www.virustotal.com) にファイルをアップロード。

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux 初回起動</strong></summary>

AppImage はインストール不要で直接実行できます。ファイルを実行可能としてマークするだけです。

**ファイルマネージャー：** `.AppImage` を右クリック → **プロパティ** → **権限** → **プログラムとして実行を許可** を有効化、ダブルクリックで起動。

**ターミナル：**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

それでも起動しない場合は、マウントせずに実行してください。FUSE パッケージは不要です：

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**省略可能なデスクトップ統合：** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) を一度インストールしておくと、ダブルクリックした AppImage が自動的にランチャーメニューに登録されます — `.desktop` ファイルの手動作成は不要です。

**通常のアーカイブ（FUSE 不要、インストール不要）：**

`.tar.gz` 版は AppImage のラッパーを外した同じアプリです。好きな場所に展開して実行するだけで、インストーラーも FUSE パッケージも不要です。

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**リリースページの Linux ダウンロードは x86_64 のみです。** ARM64 マシン（Raspberry Pi、Asahi Linux）では Flatpak はインストールできますが、起動時に `bwrap: execvp ldconfig: Exec format error` で失敗します。

</details>

<details>
<summary><strong><a id="verify"></a>🔐 ダウンロードの検証（SHA256）</strong></summary>

各リリースではバイナリと一緒に `SHA256SUMS` ファイルが公開されています。ダウンロードが転送中に破損または改ざんされていないことを確認するには、ファイルをローカルでハッシュ計算し、`SHA256SUMS` の該当行と照合してください。最新リリースページを開き → **Assets** → `SHA256SUMS` をダウンロード。

**Windows (PowerShell or Command Prompt):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

サードパーティのマルウェアスキャンを希望する場合は、[VirusTotal](https://www.virustotal.com) にファイルをアップロードしてください。マイナーなエンジンによる汎用ヒューリスティックの数件の検出は、署名されていない Electron アプリでは通常の範囲内です。主要エンジンによる広範な検出があれば、それは本物の懸念事項です。

</details>

<details>
<summary><strong>📦 Windows：インストーラ vs ポータブル</strong></summary>

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

## <a id="why"></a>⚖️ なぜ Arroxy？

最もよく使われる代替手段との比較：

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| ブラウザーを内蔵（閲覧・サインイン・ダウンロード） |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Cookie をエクスポートせずに非公開・メンバー限定・年齢制限付き動画に対応 |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| 無料、プレミアム層なし |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| オープンソース |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| ローカル処理のみ |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| 利用回数制限なし |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| クロスプラットフォームのデスクトップアプリ |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| 字幕 + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = 一部のみ、または有料プランのみ。4K Video Downloader で非公開動画を扱うアプリ内サインインは有料機能です。無料の yt-dlp GUI の多くは、Cookie ファイルを受け付けるか、ウェブブラウザーの Cookie を読み取ることしかできません。

Arroxy はひとつのことのために作られています：URL を貼り付けても、Explore で動画を見つけても、クリーンなローカルファイルが手に入ること。アップセルなし、データ収集なし。

### <a id="why-explore"></a>🧭 単なる yt-dlp ラッパーにはできないこと：Explore タブ

無料の YouTube ダウンローダーの多くは、yt-dlp の上に URL 入力欄を載せただけのものです。Arroxy も yt-dlp を使いますが、YouTube やほかのサイトを開けるアプリ組み込みのブラウザー **Explore** も備えています。Explore は、URL 入力欄だけでは越えられない制限を乗り越えます：

- **アカウントが必要な動画を、Cookie のエクスポートなしで** — 非公開動画、メンバー限定動画、年齢制限付き動画（年齢確認済みアカウントの場合）、さらに「後で見る」や「高く評価した動画」のリスト、ほかのサイトのサインインが必要な動画も。単なるラッパーでは cookies.txt をエクスポートするか、ウェブブラウザーの Cookie を読み取らせる必要がありますが、Windows の Chrome は現在これをブロックしています。Arroxy なら Explore で一度サインインするだけで、あとはおまかせです
- **「ログインして、ボットではないことを確認してください」** — YouTube にこう求められても、Arroxy は失敗で終わらせず、Explore のサインインを使ってダウンロードを再試行します
- **YouTube のダウンロードトークン** — Arroxy の内蔵ブラウザーは、ダウンロードの前に YouTube が求めるトークンを取得します。これがないと、YouTube が提供する形式が減り、指定より低い画質になることがあります
- **リンクのコピーは不要** — Explore で動画・プレイリスト・チャンネルを見つけてワンクリックでダウンロード。ページ上のリンクを右クリックしてもダウンロードできます
- **広告ブロックは必要なときに** — シールドをワンクリックすると、Explore は自身のページで広告とトラッカーをブロックします

---

## <a id="privacy"></a>🔒 プライバシー

ダウンロードは [yt-dlp](https://github.com/yt-dlp/yt-dlp) 経由で YouTube から選択したフォルダへ直接取得されます — サードパーティのサーバーは経由しません。視聴履歴、ダウンロード履歴、URL、ファイルの内容はすべてあなたのデバイスに留まります。

テレメトリーはありません — 1日1回、匿名のハートビートを送るだけです：アプリバージョン、OS、言語、インストール方法、国。アクティブユーザー数を数えるためのものです。ID、URL、動画タイトル、ファイルパス、アカウント情報は含みません。設定でオフにできます。

Explore は、ブラウザーとは別に独自のサインインを保持します。Arroxy がサインインフォームを読み取ったり入力したりすることはなく、入力するのは Google 自身のページです。ダウンロードはサインアウトの状態で実行され、アカウントで解決できる理由で失敗したときだけ、Arroxy はサインイン情報をその都度読み取り、そのダウンロード用の一時ファイルに保存して、終了後にファイルを削除します。設定で Explore をサインアウトすると、サインインは消去されます。

---

## <a id="faq"></a>❓ よくある質問

<details>
<summary><strong>本当に無料ですか？</strong></summary>

はい — MIT ライセンス、プレミアム層なし、機能ゲートなし。

</details>

<details>
<summary><strong>Arroxy は他の yt-dlp GUI と何が違いますか？</strong></summary>

無料の yt-dlp GUI の多くは、リンクを受け取るだけのラッパーです。Arroxy には、アプリに組み込まれた YouTube ブラウザー **Explore** があります。リンクをコピーせずに閲覧しながらダウンロードでき、そこで一度サインインすれば、Cookie をエクスポートすることなく、非公開動画、メンバー限定動画、年齢制限付き動画、「後で見る」や「高く評価した動画」のリストもダウンロードできます。YouTube からボットでないことの確認を求められたときは、Arroxy がそのサインインを使います。また、内蔵ブラウザーが YouTube のダウンロードトークンを取得するので、ダウンロードで使える形式が減ってしまうこともありません。詳しくは[なぜ Arroxy？](#why)をご覧ください。

</details>

<details>
<summary><strong>どの動画品質をダウンロードできますか？</strong></summary>

YouTube が提供するすべて：8K（4320p）、4K UHD（2160p）、1440p、1080p、720p、480p、360p、音声のみ。60 fps と HDR ストリームはそのまま保存され、ステップ式のダウンロードでは解像度ごとに AV1、VP9、H.264 を選べます。

</details>

<details>
<summary><strong>音声を MP3 として抽出できますか？</strong></summary>

はい。形式メニューで*音声のみ*を選び、MP3、M4A/AAC、Opus、WAV を選択できます。

</details>

<details>
<summary><strong>YouTube アカウントが必要な動画はどうやってダウンロードしますか？</strong></summary>

Explore タブで一度サインインしてください。すると Arroxy は、アカウントで視聴できる非公開動画やメンバー限定動画、年齢確認済みアカウントなら年齢制限付き動画、「後で見る」や「高く評価した動画」のリストもダウンロードできます。サインインはアカウントで解決できる理由でダウンロードに失敗したときだけ使われ、それ以外は従来どおりダウンロードされます。これは Cookie 設定の **Explore サインイン** で、先頭に表示され「おすすめ」と示されており、初めて Explore を開いたときに Arroxy が自動で選択します。yt-dlp の wiki は [サインイン状態での自動化が Google アカウントにフラグを立てる可能性がある](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) と注意しているため、サブアカウントの利用が安全です。

</details>

<details>
<summary><strong>YouTube が変更したら使えなくなりますか？</strong></summary>

yt-dlp は起動時に自動更新され、YouTube に変更があれば Arroxy も迅速に修正をリリースします。YouTube からボットでないことの確認を求められた場合は、Explore でサインインしていれば Arroxy がそのサインインも試し、Cookie 設定ではファイルやブラウザーの Cookie も利用できます。

</details>

<details>
<summary><strong>Arroxy は何言語に対応していますか？</strong></summary>

すぐに使える 31 言語: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文。 Arroxy は初回起動時にオペレーティング システムの言語を自動検出し、ツールバーの言語ピッカーからいつでも切り替えられます。 Runtime locale JSON は src/shared/i18n/locales/ にあり、翻訳者向けの PO catalog は i18n/locales/ にあります。貢献するには GitHub で PR を開いてください。

</details>

<details>
<summary><strong>他に何かインストールが必要ですか？</strong></summary>

いいえ。yt-dlp、ffmpeg、ffprobe は初回起動時に自動ダウンロードされ、マシンにキャッシュされます。それ以降は追加のセットアップ不要です。

</details>

<details>
<summary><strong>プレイリストやチャンネル全体をダウンロードできますか？</strong></summary>

はい、どちらも対応しています。プレイリストまたはチャンネルのURL（例: `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`）を貼り付け、スキャンする件数を選んでから、リスト全体をキューに入れるか特定の動画を選べます。日付範囲フィルターは近日対応予定です。

</details>

<details>
<summary><strong>macOS で「アプリが壊れている」と表示される — どうすれば？</strong></summary>

これは macOS Gatekeeper が未署名のアプリをブロックしているだけで、実際の破損ではありません。quarantine を削除して Arroxy を起動する Terminal コマンドは [macOS first launch](#macos-first-launch) を参照してください。

</details>

<details>
<summary><strong>YouTube の動画をダウンロードするのは合法ですか？</strong></summary>

個人的・私的利用については、ほとんどの法域で一般的に容認されています。YouTube の[利用規約](https://www.youtube.com/t/terms)およびあなたの地域の著作権法への準拠はあなた自身の責任です。

</details>

---

## <a id="roadmap"></a>🗺️ ロードマップ

引き続き予定されている機能 — おおよその優先順位順：

| 機能    | 説明    |
| ---------------- | ---------------- |
| **プレイリスト・チャンネルのフィルター** | プレイリストまたはチャンネルの列挙時の日付範囲フィルター |
| **YouTube 音声トラックの優先設定** | YouTube が複数の音声トラックを提供する場合に、アプリ全体の優先言語トラックを設定し、プロファイルごとに上書き |
| **より強いリトライ復旧** | 不安定または問題のあるインターネット接続で中断されたダウンロード向けの新しいリトライ経路 |
| **本格的なダウンロードマネージャードロワー** | キュードロワーをより完全なマネージャーへ拡張し、キュー内アイテムの保存先フォルダー変更にも対応 |
| **スケジュールダウンロード** | 設定した時刻にキューを開始（夜間実行など） |
| **AUR パッケージ** | Arch Linux と Omarchy に `yay -S arroxy-bin` でインストール |

機能のアイデアがありますか？[リクエストを開いてください](../../issues) — コミュニティの意見が優先順位を決めます。

---

## <a id="support"></a>💖 Arroxy を支援する

Arroxy は無料で MIT ライセンスです。広告もテレメトリも有料版もありません。時間の節約に役立っているなら、Bitcoin、Tron、または Ethereum で開発を支援できます。アドレスは [DONATE.md](DONATE.md) に記載しており、これが唯一の公式な情報源です。Arroxy がメールやダイレクトメッセージでアドレスをお送りすることは決してありません。リポジトリへのスター、バグ報告、翻訳の改善も同じくらい助けになります。

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ 技術詳細

<details>
<summary><strong>スタック</strong></summary>

- **Electron** — クロスプラットフォームのデスクトップシェル
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — スタイリング
- **Zustand** — 状態管理
- **yt-dlp** + **ffmpeg** — ダウンロード・マルチプレクサエンジン（どちらも実行時に取得：yt-dlp は最新に保たれ、ffmpeg/ffprobe は一度だけインストールされアップデート後も維持）
- **Vite** + **electron-vite** — ビルドツール
- **Vitest** + **Playwright** — ユニットテスト・E2E テスト

</details>

<details>
<summary><strong>ソースからビルド</strong></summary>

### 前提条件 — 全プラットフォーム共通

| ツール  | バージョン | インストール |
| ------- | ------- | ------- |
| Git     | 任意    | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` または `.node-version` |
| Bun     | 1.4.2  | `mise install` または `package.json` `packageManager` |

推奨: `mise` をインストールし、checkout 内で `mise install` を実行します。mise を使わない場合は、`bun run bootstrap` の前に `.node-version` の Node.js と `package.json` の Bun を手動で有効化してください。

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

ネイティブ rebuild には Visual Studio Build Tools と Python が必要になる場合があります。

### macOS

```bash
brew install mise
xcode-select --install
```

clone 後、checkout 内で `mise trust && mise install` を実行してください。shell がすでに `fnm`、`nvm`、または Homebrew の Bun を使っている場合は、Arroxy が Node.js 24.21.0 と Bun 1.4.2 を使うように `~/.zshrc` で mise を有効化してください：

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux（Ubuntu / Debian）

```bash
curl -fsSL https://bun.sh/install | bash

# ビルド + Electron ランタイム依存
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E テストのみ（Electron にはディスプレイが必要）
sudo apt install -y xvfb
```

### クローンして実行

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # 推奨。固定バージョンのツールを手動で有効化済みならスキップ
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer に接続した Electron アプリ
```

### 配布パッケージのビルド

```bash
bun run build        # 型チェック + コンパイル
bun run dist         # 現在の OS 向けパッケージ
bun run dist:win     # 対応ホストで Windows ターゲットをパッケージ
```

> `bun run bootstrap` は依存関係をインストールし、Electron アプリ依存を rebuild し、Electron を検証し、開発用の埋め込み ffmpeg/ffprobe を準備し、Playwright Chromium をインストールします。リリースビルドでは、yt-dlp・ffmpeg・ffprobe は実行時にアプリデータフォルダで管理され、いずれもインストーラーには含まれません。

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

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
.\Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-linux-x64.AppImage --disable-gpu
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

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

</details>

---

## 📜 利用規約

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
