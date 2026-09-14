<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy 吉祥物" width="180" />

# Arroxy — 免費開源 YouTube（+ 2000 個網站）下載工具，支援 Windows、macOS 和 Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**閱讀語言：** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **繁體中文**

[![釋出](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![建置](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![官網](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![授權條款](https://img.shields.io/badge/license-MIT-green) ![平台](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![語言](https://img.shields.io/badge/i18n-30_languages-blue)

從 **YouTube 和 2000+ 個支援的網站**下載影片、Shorts、音樂、頻道、Podcast或音軌 — 最高 4K HDR 60 fps，或匯出為 MP3 / AAC / Opus。在 Windows、macOS 和 Linux 本機執行。**無廣告、無臃腫、無付費推銷。**

[**↓ 下載最新版本**](#install) &nbsp;·&nbsp; [**官網**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows 首次啟動](#windows-first-launch) · [macOS 首次啟動](#macos-first-launch) · [Linux 首次啟動](#linux-first-launch)

[![加入 Discord 社群](https://img.shields.io/badge/%E5%8A%A0%E5%85%A5%20Discord%20%E7%A4%BE%E7%BE%A4-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Arroxy 示範" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

如果 Arroxy 幫你節省了時間，點個 ⭐ 讓更多人發現它。

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-09-14._

> 🌐 這是 AI 輔助翻譯。[英文 README](README.md) 是內容基準。發現錯誤？歡迎 [建立 PR](../../pulls)。

---

## 目錄

- [安裝和首次啟動](#install)
  - [Windows 首次啟動](#windows-first-launch)
  - [macOS 首次啟動](#macos-first-launch)
  - [為什麼可能會看到警告](#why-warning)
  - [Linux 首次啟動](#linux-first-launch)
  - [驗證你的下載（SHA256）](#verify)
- [為什麼選 Arroxy](#why)
- [功能](#features)
- [隱私](#privacy)
- [常見問題](#faq)
- [開發藍圖](#roadmap)
- [支援 Arroxy](#support)
- [技術堆疊](#tech)

---

## <a id="install"></a>安裝和首次啟動

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Linux 指令碼會根據已釋出的 `SHA256SUMS` 驗證下載檔案，並將 Arroxy 新增到應用程式選單。僅提供 x86_64 版本。沒有 `curl`？請將 `curl -fsSL` 換成 `wget -qO-`。

| 平台 | 格式 |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**取得最新版本 →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="windows-first-launch"></a>Windows 首次啟動

首次啟動時，您可能會看到 **«Windows protected your PC»** 或 **«Unknown publisher»**。這適用於 `Arroxy-win-x64-Setup.exe` 和 `Arroxy-win-x64-Portable.exe`。Arroxy 是免費開源軟體，Windows 版本未使用付費憑證籤名，這正是 SmartScreen 將它們標示的原因。這**不**代表 Arroxy 自動就是不安全的。要繼續操作：

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. 點選 **More info**。
2. 點選 **Run anyway**。

#### 如果 Windows Defender 標記或刪除了檔案

Defender 啟發式規則有時會將未簽名的 NSIS 安裝套件和 Electron 可攜版標記為可疑。如果 Defender 隔離了 `Arroxy-win-x64-Setup.exe` 或 `Arroxy-win-x64-Portable.exe`，請從 **Windows Security → Virus & threat protection → Protection history** 還原，然後在 **Manage settings → Add or remove exclusions** 中將 Arroxy 可執行檔案新增為允許項。與 SmartScreen 一樣，觸發原因是缺少釋出者簽名，而非檢測到惡意軟體。

> 請僅從官方 GitHub Releases 頁面下載 Arroxy。如果您從其他網站取得了該檔案，或有人傳送給您，請刪除它並從官方來源重新下載。原始碼是公開的，如果您願意，可以自行審查或編譯 Arroxy。

更喜歡 Scoop？ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

### <a id="macos-first-launch"></a>macOS 首次啟動

Arroxy 還沒有為 macOS 進行程式碼簽名，所以從 DMG 安裝後，Gatekeeper 可能會顯示嚇人的 *"Arroxy.app is damaged and can't be opened"* 對話方塊。這個提示表示 macOS 將未簽名應用放入了 quarantine；並不表示應用檔案真的損壞。目前 macOS 上可靠的修復方式是 Terminal：

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. 將 `Arroxy.app` 從掛載的 DMG 拖入 `/Applications`。
2. 開啟 Terminal，執行這兩條指令：

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

第一條指令會從已安裝的 Arroxy 副本中移除 quarantine 屬性。第二條指令會啟動應用。`sudo` 可能會要求輸入你的 Mac 密碼；Terminal 在輸入時不會顯示字元。

**Apple Silicon vs Intel：** 在搭載 M 系列晶片（M1 / M2 / M3 / M4）的 Mac 上，請下載 `arm64` DMG。在 Intel Mac 上，請下載 `x64` DMG。執行錯誤版本仍可透過 Rosetta 啟動，但速度會明顯變慢。

> macOS 建置透過 CI 在 Apple Silicon 和 Intel runner 上生成。如遇問題，請 [建立 issue](../../issues) — macOS 使用者意見回饋會直接影響 macOS 測試週期。

### <a id="why-warning"></a>為什麼可能會看到警告

Arroxy 是開源軟體，採用 MIT 授權條款。Windows 和 macOS 版本**未經程式碼簽名** — Apple Developer ID 和 Windows EV 程式碼簽名憑證每年各需數百美元，對於獨立專案來說完全自掏腰包。沒有這些簽名，Windows SmartScreen 和 macOS Gatekeeper 在首次啟動時會向你發出警告。這些警告的意思是*你的系統不認識該釋出者* — 並不意味著 Arroxy 是惡意軟體。

三種自行驗證 Arroxy 的方式，按嚴格程度遞增：

- **查看原始碼。** 每一行都在 [GitHub](https://github.com/antonio-orionus/Arroxy) 上，你也可以[從原始碼建置](#tech)。
- **驗證 SHA256。** 將你的檔案與釋出的 [`SHA256SUMS`](../../releases/latest) 對比 — 見下方[驗證你的下載](#verify)。
- **執行第三方掃描。** 將檔案上傳至 [VirusTotal](https://www.virustotal.com)。

### <a id="linux-first-launch"></a>Linux 首次啟動

AppImage 直接執行 — 無需安裝。只需將檔案標記為可執行。

**檔案管理器：** 右鍵 `.AppImage` → **屬性** → **許可權** → 啟用 **允許作為程式執行**，然後雙擊執行。

**終端：**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

如果仍無法啟動，可以不掛載直接執行 — 無需 FUSE 軟體包：

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**可選桌面整合：** 安裝一次 [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)，此後雙擊任意 AppImage 即可自動註冊到啟動器選單 — 無需手動建立 `.desktop` 檔案。

**普通壓縮包（無需 FUSE，無需安裝）：**

`.tar.gz` 版本就是去掉 AppImage 外殼的同一個應用 — 解壓到任意位置直接執行。無需安裝程式，也無需 FUSE 軟體包。

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Flatpak（沙箱版）：** 從同一釋出頁下載 `Arroxy-*.flatpak`。

Ubuntu 自帶的是 Snap 而非 Flatpak，因此請先安裝 Flatpak 並新增 Flathub — 安裝套件會從那裡取得執行時：

```bash
# Ubuntu / Debian
sudo apt install -y flatpak

# Fedora
sudo dnf install -y flatpak

# Arch
sudo pacman -S flatpak
```

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user ./Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

**釋出頁面上的 Linux 下載僅提供 x86_64。** 在 ARM64 裝置（樹莓派、Asahi Linux）上 Flatpak 可以安裝，但啟動時會失敗並報 `bwrap: execvp ldconfig: Exec format error`。

<details>
<summary><strong><a id="verify"></a>驗證你的下載（SHA256）</strong></summary>

每次釋出都會在二進位檔旁邊附上 `SHA256SUMS` 檔案。為確認下載檔案在傳輸過程中未被損壞或篡改，請在本機對檔案進行雜湊計算，並與 `SHA256SUMS` 中對應的行進行比對。開啟最新發布頁 → **Assets** → 下載 `SHA256SUMS`。

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

想要第三方惡意軟體掃描？將檔案上傳到 [VirusTotal](https://www.virustotal.com)。小型引擎給出少量通用啟發式標記對於未簽名的 Electron 應用程式來說屬於正常；主流引擎大面積檢測才是真正值得警惕的情況。

</details>

<details>
<summary><strong>Windows：安裝版 vs 可攜版</strong></summary>

|               | NSIS 安裝版 | 可攜版 `.exe` |
| ------------- | :----------------------: | :---------------------: |
| 需要安裝 | 是  | 否 — 任意位置直接執行  |
| 自動更新 | ✅ 應用程式內更新  | ❌ 需手動下載  |
| 啟動速度 | ✅ 更快  | ⚠️ 冷啟動較慢  |
| 新增到開始選單 |            ✅            |           ❌            |
| 解除安裝方便 |            ✅            | ❌ 刪除檔案即可  |

**建議：** 使用 NSIS 安裝版以獲得自動更新和更快的啟動速度。使用可攜版 `.exe` 實現免安裝、不寫登錄檔。

</details>

---

## <a id="why"></a>為什麼選 Arroxy

與最常見的替代方案逐項比較：

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| 免費，無付費版 |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| 開源 |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| 僅本機處理 |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| 無需登入或匯出 Cookie |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| 無使用上限 |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| 跨平台桌面應用程式 |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| 字幕 + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy 只做一件事：貼上連結，取得乾淨的本機檔案。無帳號、無付費推銷、無資料收集。

---

## <a id="features"></a>功能

### 畫質與格式

- 最高 **4K UHD（2160p）**、1440p、1080p、720p、480p、360p
- **高影格率**依原樣保留 — 60 fps、120 fps、HDR
- **音訊** — 將僅音訊匯出為 MP3、M4A/AAC、Opus 或 WAV。在互動式下載中，可用時選擇來源的原生環繞聲/Dolby 音軌（AC-3、E-AC-3、5.1、DRC），或設定全域預設 **優先環繞聲 / Dolby**
- 快速預設：*最佳畫質* · *平衡* · *小檔案*

### 隱私與控制

- 100% 本機處理 — 下載直接從 YouTube 到你的硬碟
- 無登入、無 Cookie、無 Google 帳號繫結
- 檔案直接儲存到你選擇的資料夾

### 工作流程

- **全域下載快速鍵** — 在任意應用中複製連結後按 `Ctrl+Shift+D`（macOS 為 `Cmd+Shift+D`），Arroxy 會用目前設定直接加入佇列，無需開啟視窗，並以通知確認。預設開啟，可重新繫結
- **靈活的開始模式** — 選擇引導式單個下載、播放清單/頻道選擇器、批次貼上 URL，或使用已儲存預設值的 Quick Download
- **中央下載佇列** — 單個、播放清單、批次或快速任務都會進入同一個地方，用於查看進度、暫停、繼續、取消、重試和控制優先順序
- **剪貼簿監控** — 複製 YouTube 連結後切回應用程式，Arroxy 自動填入 URL（可在進階設定中切換）
- **自動清理 URL** — 剝除追蹤參數（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）並展開 `youtube.com/redirect` 跳轉連結
- **托盤模式** — 關閉視窗後下載在後臺繼續執行
- **30 種語言** — 自動檢測系統語系，可隨時切換
- **播放清單同步** — 將播放清單與本機資料夾重新比對，跳過已下載的影片；建立一個 `.m3u` 播放清單檔案，並在每個影片下載後更新
- **速度和節奏控制** — 限制下載頻寬、設定同時取得影片的分段數量，並用預設新增請求延遲（*關閉 · 平衡 · 謹慎 · 自訂*）
- **檔名模板** — 使用 `{title}`、`{uploader}`、`{id}`、`{date}`、`{resolution}` 和 `{playlist_index}` 依你的方式命名下載檔案，可全域設定或按下載設定分別設定
- **同時下載數與自動重試** — 選擇佇列中同時進行的下載數量，讓遇到網路或伺服器問題的下載由 Arroxy 自動重試，每次嘗試前等待更久
- **播放清單逐項設定** — 為播放清單中的每個影片分配各自的下載設定，而不是整份清單用同一套設定，一次即可將部分影片存為最高畫質、其餘轉成 MP3

### 字幕與後處理

- **字幕**以 SRT、VTT 或 ASS 格式下載 — 手動或自動生成，支援任意可用語言
- 儲存到影片旁邊、嵌入 `.mkv`，或整理到 `Subtitles/` 子資料夾
- **SponsorBlock** — 跳過或章節標記贊助商、片頭、片尾、自我推廣片段
- **嵌入後設資料** — 標題、上傳日期、頻道、描述、封面圖和章節標記寫入檔案

### YouTube + 2000 個網站

- **YouTube，全面支援** — 影片、Shorts、頻道、播放清單、YouTube Music 和Podcast作為一等來源處理
- **透過 yt-dlp 支援 2000+ 個其他網站** — Vimeo、Twitch、Twitter/X、TikTok、SoundCloud、Bandcamp、Bilibili、BBC iPlayer、archive.org 等眾多網站
- **僅音訊和字幕**在所有支援的網站上均可使用，不限於 YouTube
- 若某個網站發生變化，yt-dlp 每週釋出修復，Arroxy 在啟動時自動更新二進位檔

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy 全域下載快速鍵 — Windows 和 Linux 上按 Ctrl+Shift+D，macOS 上按 Cmd+Shift+D，把複製的連結直接送入下載佇列" width="760" /></picture><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>全域下載快速鍵</b><br/>隨處複製連結，按一次——立即進入佇列並開始下載</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>播放清單逐項設定</b><br/>為每個影片指定各自的設定——部分存為 4K，其餘轉成 MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>快速下載首頁</b><br/>貼上網址，用目前設定一鍵下載</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>可重複使用的下載設定</b><br/>將格式、畫質和輸出儲存為預設——每次下載重複使用</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>多語言音軌</b><br/>精確選擇影片自帶的音訊語言</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>環繞聲 / Dolby 音訊</b><br/>識別並保留 5.1 和 Dolby 音軌</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>批次網址模式</b><br/>貼上清單，自動去重，一次全部加入佇列</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>並行下載佇列</b><br/>多個下載同時進行，即時顯示進度</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>隱私

下載透過 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 直接從 YouTube 取得到你選擇的資料夾 — 不經過任何第三方伺服器。觀看歷史、下載歷史、URL 和檔案內容均保留在你的裝置上。

Arroxy 透過 [OpenPanel](https://openpanel.dev) 傳送匿名聚合遙測資料 — 僅用於瞭解故障、崩潰、意見回饋、OS 和應用程式版本。無 URL、無影片標題、無檔案路徑、無帳號資訊、無指紋識別、無個人資料。每次安裝的 ID 是隨機的，不與你的身分繫結。你可以在設定中選擇退出。

---

## <a id="faq"></a>常見問題

**真的免費嗎？**
是的 — MIT 授權條款，無付費版，無功能限制。

**能下載哪些影片畫質？**
YouTube 提供的都行：4K UHD（2160p）、1440p、1080p、720p、480p、360p，以及純音訊。60 fps、120 fps 和 HDR 流依原樣保留。

**能將音訊提取為 MP3 嗎？**
可以。在格式選單裡選擇*僅音訊*，然後選擇 MP3、M4A/AAC、Opus 或 WAV。

**需要 YouTube 帳號或 Cookie 嗎？**
預設不需要 — Arroxy 無需 YouTube 帳號、登入或匯出 Cookie 即可工作。對於需要身分驗證的內容（例如年齡限制或僅會員可見的影片），進階設定中提供可選的 Cookie 支援（Cookies source: file or browser）。該選項預設關閉。如果你啟用它，yt-dlp 的 wiki 指出[基於 Cookie 的自動化可能會標記 Google 帳號](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)；這種情況下使用備用帳號是更安全的選擇。

**YouTube 更新後還能繼續使用嗎？**
yt-dlp 在啟動時自動更新，YouTube 一旦發生變化，Arroxy 會及時釋出修復。如果你確實遇到問題，進階設定中提供可選的 Cookie 支援作為後備方案。

**Arroxy 支援哪些語言？**
立即可用的 30 種語言：Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文。 Arroxy 會在首次啟動時自動檢測作業系統語言，你也可以隨時從工具列的語言選擇器切換。Runtime locale JSON 位於 src/shared/i18n/locales/，面向譯者的 PO catalog 位於 i18n/locales/ — 歡迎在 GitHub 上建立 PR 貢獻。

**需要額外安裝其他軟體嗎？**
不需要。yt-dlp 會在首次啟動時自動下載並快取到你的電腦上；ffmpeg 和 ffprobe 隨應用程式一起提供。之後無需任何額外設定。

**能下載播放清單或整個頻道嗎？**
可以，兩者都支援。貼上播放清單或頻道 URL（例如 `youtube.com/@handle`、`/channel/UC…`、`/c/Name`、`/user/Old`）；選擇要掃描的項目數量，然後將整個清單加入佇列或選擇特定影片。日期範圍篩選即將推出。

**macOS 提示"應用已損壞" — 怎麼處理？**
這是 macOS Gatekeeper 在攔截未簽名應用，並非真正損壞。請查看 [macOS first launch](#macos-first-launch)，其中有移除 quarantine 並啟動 Arroxy 的 Terminal 指令。

**下載 YouTube 影片合法嗎？**
在大多數地區，個人私人使用一般被接受。你需要自行負責遵守 YouTube 的[服務條款](https://www.youtube.com/t/terms)及當地版權法律。

---

## <a id="roadmap"></a>開發藍圖

仍在計劃中 — 大致按優先順序排序：

| 功能    | 描述    |
| ---------------- | ---------------- |
| **播放清單與頻道篩選** | 列舉播放清單或頻道時的日期範圍篩選 |
| **YouTube 音軌偏好** | 當 YouTube 提供多個音軌時，設定全應用程式預設口語音軌，並允許每個設定單獨覆蓋 |
| **應用程式內瀏覽器登入** | 在 Arroxy 內開啟瀏覽器視窗，登入並使用站點 cookies，無需手動匯出 |
| **一鍵影片下載** | 使用目前設定，從檢測到或貼上的 URL 一鍵開始影片下載 |
| **更強的重試恢復** | 為不穩定或有問題的網路連線中斷的下載提供新的重試路徑 |
| **完整下載管理器面板** | 將佇列面板擴充套件為更完整的管理器，包括為排隊專案更改目標資料夾 |
| **定時下載** | 在設定時間啟動佇列（適合連夜批次下載） |
| **片段裁剪** | 按起止時間只下載影片的某一段 |

有想法？[提交請求](../../issues) — 社羣意見決定優先順序。

---

## <a id="support"></a>支援 Arroxy

Arroxy 完全免費並採用 MIT 授權條款 —— 沒有廣告、沒有付費版本。如果它為你節省了時間，你可以透過 Bitcoin 或 Tron 支援它的開發：地址見 [DONATE.md](DONATE.md)，這是唯一的官方來源。Arroxy 絕不會透過電子郵件或私信向你傳送地址。給儲存庫點星、報告問題和改進翻譯同樣有幫助。

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a>

---

## <a id="tech"></a>技術堆疊

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — 跨平台桌面外殼
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — 樣式
- **Zustand** — 狀態管理
- **yt-dlp** + **ffmpeg** — 下載與混流引擎（yt-dlp 在執行時取得；ffmpeg/ffprobe 在建置時打包）
- **Vite** + **electron-vite** — 建置工具
- **Vitest** + **Playwright** — 單元測試與端到端測試

</details>

<details>
<summary><strong>從原始碼建置</strong></summary>

### 前置要求 — 所有平台

| 工具    | 版本 | 安裝 |
| ------- | ------- | ------- |
| Git     | 任意     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | `mise install` 或 `.node-version` |
| Bun     | 1.2.23  | `mise install` 或 `package.json` `packageManager` |

推薦安裝 `mise`，然後在 checkout 中執行 `mise install`。如果不用 mise，請先按 `.node-version` 手動啟用 Node.js，並按 `package.json` 啟用 Bun，再執行 `bun run bootstrap`。

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

原生 rebuild 可能需要 Visual Studio Build Tools 和 Python。

### macOS

```bash
brew install mise
xcode-select --install
```

克隆後，在 checkout 中執行 `mise trust && mise install`。如果你的 shell 已經使用 `fnm`、`nvm` 或 Homebrew Bun，請在 `~/.zshrc` 中啟用 mise，讓 Arroxy 使用 Node.js 24.16.0 和 Bun 1.2.23：

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

# 建置和 Electron 執行時依賴
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# 僅 E2E 測試（Electron 需要顯示器）
sudo apt install -y xvfb
```

### 克隆並執行

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # 推薦；如果已手動啟用固定版本工具，可跳過
bun run bootstrap
bun run doctor
bun run dev            # 使用 Vite renderer 執行 Electron 應用程式
```

### 打包發行版

```bash
bun run build        # 型別檢查 + 編譯
bun run dist         # 為目前系統打包
bun run dist:win     # 在受支援的主機上打包 Windows 目標
```

> `bun run bootstrap` 會安裝依賴、重建 Electron 應用程式程式依賴、驗證 Electron、為開發準備嵌入式 ffmpeg/ffprobe，並安裝 Playwright Chromium。yt-dlp 在執行時由應用程式資料目錄管理；ffmpeg 和 ffprobe 隨每個 Arroxy 版本一起提供。

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

---

## 使用條款

Arroxy 僅供個人私人使用。你需要自行確保下載行為符合 YouTube 的[服務條款](https://www.youtube.com/t/terms)及你所在地區的版權法律。請勿使用 Arroxy 下載、複製或分發你不享有權利的內容。開發者對任何濫用行為不承擔責任。

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT 授權條款 · 由 <a href="https://x.com/OrionusAI">@OrionusAI</a> 用心打造</sub>
</div>
