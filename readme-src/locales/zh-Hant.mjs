const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — 跨平台桌面外殼
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — 樣式
- **Zustand** — 狀態管理
- **yt-dlp** + **ffmpeg** — 下載與混流引擎（兩者都在執行時取得：yt-dlp 保持最新，ffmpeg/ffprobe 只安裝一次並在更新後保留）
- **Vite** + **electron-vite** — 建置工具
- **Vitest** + **Playwright** — 單元測試與端到端測試

</details>

<details>
<summary><strong>從原始碼建置</strong></summary>

### 前置要求 — 所有平台

| 工具    | 版本 | 安裝 |
| ------- | ------- | ------- |
| Git     | 任意     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` 或 \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` 或 \`package.json\` \`packageManager\` |

推薦安裝 \`mise\`，然後在 checkout 中執行 \`mise install\`。如果不用 mise，請先按 \`.node-version\` 手動啟用 Node.js，並按 \`package.json\` 啟用 Bun，再執行 \`bun run bootstrap\`。

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

原生 rebuild 可能需要 Visual Studio Build Tools 和 Python。

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

克隆後，在 checkout 中執行 \`mise trust && mise install\`。如果你的 shell 已經使用 \`fnm\`、\`nvm\` 或 Homebrew Bun，請在 \`~/.zshrc\` 中啟用 mise，讓 Arroxy 使用 Node.js 24.21.0 和 Bun 1.4.2：

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux（Ubuntu / Debian）

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# 建置和 Electron 執行時依賴
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# 僅 E2E 測試（Electron 需要顯示器）
sudo apt install -y xvfb
\`\`\`

### 克隆並執行

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # 推薦；如果已手動啟用固定版本工具，可跳過
bun run bootstrap
bun run doctor
bun run dev            # 使用 Vite renderer 執行 Electron 應用程式
\`\`\`

### 打包發行版

\`\`\`bash
bun run build        # 型別檢查 + 編譯
bun run dist         # 為目前系統打包
bun run dist:win     # 在受支援的主機上打包 Windows 目標
\`\`\`

> \`bun run bootstrap\` 會安裝依賴、重建 Electron 應用程式程式依賴、驗證 Electron、為開發準備嵌入式 ffmpeg/ffprobe，並安裝 Playwright Chromium。發行版本在執行時於應用程式資料目錄中管理 yt-dlp、ffmpeg 和 ffprobe；它們都不包含在安裝程式中。

</details>`;

export const zhHant = {
  icon_alt: "Arroxy 吉祥物",
  title:
    "Arroxy — 內建瀏覽器的免費開源 YouTube（+ 2000 個網站）下載工具，支援 Windows、macOS 和 Linux",
  read_in_label: "閱讀語言：",
  badge_release_alt: "釋出",
  badge_build_alt: "建置",
  badge_license_alt: "授權條款",
  badge_platforms_alt: "平台",
  badge_i18n_alt: "語言",
  badge_website_alt: "官網",
  discord_badge_text: "加入 Discord 社群",
  discord_badge_encoded: "%E5%8A%A0%E5%85%A5%20Discord%20%E7%A4%BE%E7%BE%A4",
  hero_desc:
    "從 **YouTube 和 2000+ 個支援的網站**下載影片、Shorts、音樂、頻道、Podcast或音軌 — 最高 8K HDR 60 fps，可匯出為 MP3 / AAC / Opus，也可以只下載你需要的片段。在 Explore 分頁中**在 Arroxy 內瀏覽 YouTube 或任何其他網站**，下載你正在看的影片、播放清單或頻道；在那裡登入後，還能下載你的帳號可觀看的私人、會員專屬和年齡限制影片。在 Windows、macOS 和 Linux 本機執行。**無廣告、無臃腫、無付費推銷。**",
  cta_latest: "↓ 下載最新版本",
  cta_website: "官網",
  star_cta: "如果 Arroxy 幫你節省了時間，點個 ⭐ 讓更多人發現它。",
  ai_notice:
    "> 🌐 這是 AI 輔助翻譯。[英文 README](README.md) 是內容基準。發現錯誤？歡迎 [建立 PR](../../pulls)。",
  toc_heading: "目錄",
  why_h2: "為什麼選 Arroxy",
  features_h2: "功能",
  dl_h2: "安裝和首次啟動",
  privacy_h2: "隱私",
  faq_h2: "常見問題",
  roadmap_h2: "開發藍圖",
  tech_h2: "技術堆疊",
  why_intro: "與最常見的替代方案逐項比較：",
  why_r1: "免費，無付費版",
  why_r2: "開源",
  why_r3: "僅本機處理",
  why_r5: "無使用上限",
  why_r6: "跨平台桌面應用程式",
  why_r7: "字幕 + SponsorBlock",
  why_r8: "內建瀏覽器（瀏覽、登入、下載）",
  why_r9: "不必匯出 Cookie 即可下載私人、會員專屬與年齡限制影片",
  why_table_note:
    "⚠️ = 部分支援，或僅限付費版。4K Video Downloader 用於私人影片的應用程式內登入是付費功能；多數免費的 yt-dlp 圖形介面只接受 Cookie 檔案，或讀取你網頁瀏覽器中的 Cookie。",
  why_summary:
    "Arroxy 只做一件事：無論你是貼上連結，還是在 Explore 中找到影片，都能取得乾淨的本機檔案。無付費推銷、無資料收集。",
  why_explore_h3: "單純的 yt-dlp 包裝程式做不到的事：Explore 分頁",
  why_explore_intro:
    "多數免費的 YouTube 下載器只是在 yt-dlp 之上加一個網址輸入框。Arroxy 同樣使用 yt-dlp，但它還有 **Explore**，一個內建於應用程式中的瀏覽器，可開啟 YouTube 或任何其他網站。Explore 能繞過單靠網址輸入框無法應付的限制：",
  why_explore_1:
    "**需要帳號的影片，不必匯出 Cookie** — 私人、會員專屬與年齡限制影片（需使用已通過年齡驗證的帳號），以及你的「稍後觀看」和「喜歡的影片」清單，以及其他網站上需要登入才能觀看的影片。單純的包裝程式需要你匯出 cookies.txt，或讀取你網頁瀏覽器中的 Cookie，而 Windows 上的 Chrome 現在會封鎖這種讀取。在 Arroxy 中，你只要在 Explore 登入一次，其餘的都交給它處理",
  why_explore_2:
    "**「登入以確認你不是機器人」** — 當 YouTube 提出這項要求時，Arroxy 會改用你在 Explore 的登入重試下載，而不是直接失敗",
  why_explore_3:
    "**YouTube 的下載權杖** — Arroxy 的內建瀏覽器會在下載前取得 YouTube 所要求的權杖。少了它，YouTube 可能只提供較少的格式，畫質也會低於你的要求",
  why_explore_4: "**不必複製連結** — 在 Explore 中找到影片、播放清單或頻道，一鍵即可下載，或對頁面上的任何連結按右鍵",
  why_explore_5: "**需要時再開啟廣告攔截** — 點一下盾牌，Explore 就會攔截其頁面上的廣告和追蹤器",
  feat_explore_h3: "Explore：在 Arroxy 內瀏覽網頁",
  feat_explore_1:
    "**Explore 分頁** — 在 Arroxy 內瀏覽 YouTube 或任何其他網站，不必複製連結就能下載你找到的內容。**下載 · *你的設定*** 會把你正在看的影片、播放清單或頻道加入佇列；旁邊的箭頭可切換設定，魔術棒則開啟逐步下載，讓你選擇格式、字幕等",
  feat_explore_6: "**按右鍵下載** — 在 Explore 中對任何影片、播放清單或頻道連結按右鍵，即可用你的設定下載、從 **使用設定檔下載** 選擇其他設定、開啟逐步下載，或複製連結。不必先逐一開啟影片",
  feat_explore_7:
    "**精簡版面** — 在 Explore 工具列按一下，就會把 Arroxy 的分頁移進去，讓頁面有更多空間",
  feat_explore_2:
    "**位址列** — 輸入文字即可搜尋 YouTube，或輸入任何網址開啟該網站",
  feat_explore_3:
    "**需要帳號的下載** — 在 Explore 登入一次，Arroxy 就能下載你的帳號可觀看的私人與會員專屬影片、已通過年齡驗證帳號可看的年齡限制影片，以及你的「稍後觀看」和「喜歡的影片」清單。你也可以在 Explore 登入其他網站，這些網站的下載在需要時會使用該登入。Arroxy 仍會先以未登入狀態下載，只有在下載因帳號可解決的原因失敗時，才會使用你在 Explore 的登入。當 YouTube 要求確認你不是機器人時，Arroxy 也會嘗試使用你在 Explore 的登入",
  feat_explore_4:
    "**建議使用備用帳號** — Explore 的首屏會說明原因：使用帳號下載有一定風險，該帳號可能被限制。想清除所有登入時，隨時可在設定中登出 Explore",
  feat_explore_5:
    "**廣告攔截** — 預設關閉。點一下 Explore 工具列上的盾牌，即可攔截其頁面上的廣告和追蹤器，不影響下載。對已登入的帳號，YouTube 可能會抵制廣告攔截",
  feat_quality_h3: "畫質與格式",
  feat_quality_1: "最高 **8K（4320p）**、4K UHD（2160p）、1440p、1080p、720p、480p、360p",
  feat_quality_2: "**高影格率與 HDR**依原樣保留 — 60 fps、HDR10",
  feat_quality_3:
    "**音訊** — 將僅音訊匯出為 MP3、M4A/AAC、Opus 或 WAV。在互動式下載中，可用時選擇來源的原生環繞聲/Dolby 音軌（AC-3、E-AC-3、5.1、DRC），或設定全域預設 **優先環繞聲 / Dolby**",
  feat_quality_4:
    "**有目標的設定檔** — *最佳畫質*（AV1 · VP9）或 *智慧型電視*（MP4 · H.264），不重新編碼即可儲存為自動、MP4、MKV 或 WebM。HDR 可選 *自動*（僅在螢幕能顯示時）、*SDR* 或 *HDR*",
  feat_quality_5:
    "**每種解析度都有每種編碼** — 逐步下載會在每個解析度下並列顯示 AV1、VP9 和 H.264，讓你挑選電視或剪輯軟體能播放的那一種",
  feat_quality_6:
    "**看清串流的真實情況** — YouTube 以 AI 放大的尺寸、AI 配音的音訊語言、增強位元率的串流、360° 影片，以及損毀或有浮水印的副本都會被標示。除非你允許，設定檔會略過 AI 放大的串流",
  feat_privacy_h3: "隱私與控制",
  feat_privacy_1: "100% 本機處理 — 下載直接從 YouTube 到你的硬碟",
  feat_privacy_2: "無登入、無 Cookie、無 Google 帳號繫結",
  feat_privacy_3: "檔案直接儲存到你選擇的資料夾",
  feat_workflow_h3: "工作流程",
  feat_workflow_12: "**全域下載快速鍵** — 在任意應用中複製連結後按 `Ctrl+Shift+D`（macOS 為 `Cmd+Shift+D`），Arroxy 會用目前設定直接加入佇列，無需開啟視窗，並以通知確認。預設開啟，可重新繫結",
  feat_workflow_1:
    "**靈活的開始模式** — 選擇引導式單個下載、播放清單/頻道選擇器、批次貼上 URL、使用已儲存預設值的 Quick Download，或在 Explore 中瀏覽並下載",
  feat_workflow_2:
    "**中央下載佇列** — 單個、播放清單、批次或快速任務都會進入同一個地方，用於查看進度、暫停、繼續、取消、重試和控制優先順序",
  feat_workflow_3:
    "**剪貼簿監控** — 複製影片連結後，回到 Arroxy 時會自動填入 URL 輸入框；若不是你想要的，可以按 **復原**。Arroxy 忙碌時，連結會等你回到「URL」分頁再填入（可在設定中關閉）",
  feat_workflow_4:
    "**自動清理 URL** — 剝除追蹤參數（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）並展開 `youtube.com/redirect` 跳轉連結",
  feat_workflow_5: "**托盤模式** — 關閉視窗後下載在後臺繼續執行",
  feat_workflow_6: "**{{LANG_COUNT}} 種語言** — 自動檢測系統語系，可隨時切換",
  feat_workflow_7:
    "**播放清單同步** — 將播放清單與本機資料夾重新比對，跳過已下載的影片；建立一個 `.m3u` 播放清單檔案，並在每個影片下載後更新",
  feat_workflow_8:
    "**速度和節奏控制** — 限制下載頻寬、設定同時取得影片的分段數量，並用預設新增請求延遲（*關閉 · 平衡 · 謹慎 · 自訂*）",
  feat_workflow_9:
    "**檔名模板** — 使用 `{title}`、`{uploader}`、`{id}`、`{date}`、`{resolution}` 和 `{playlist_index}` 依你的方式命名下載檔案，可全域設定或按下載設定分別設定",
  feat_workflow_10:
    "**同時下載數與自動重試** — 選擇佇列中同時進行的下載數量，讓遇到網路或伺服器問題的下載由 Arroxy 自動重試，每次嘗試前等待更久",
  feat_workflow_11:
    "**播放清單逐項設定** — 為播放清單中的每個影片分配各自的下載設定，而不是整份清單用同一套設定，一次即可將部分影片存為最高畫質、其餘轉成 MP3",
  feat_workflow_13:
    "**Quick Download 在背景執行** — 連結會立即出現在「下載」中並在那裡準備，附有 **檢視** 的提示加以確認，URL 輸入框隨即清空，方便貼上下一個連結。前面的還在準備時，可以繼續開始任意多個",
  feat_workflow_14:
    "**「下載」會告訴你哪些需要處理** — Arroxy 讀取不了某個連結時，該列會說明原因並提供解決辦法：重試、開啟 Cookie，或在 Explore 登入。Cookie 關閉時，登入後點選 **使用 Explore 登入** 會幫你重試。超過載入上限的播放清單會在其所在列等你選擇：全部、前幾個，或先檢閱。「下載」分頁會顯示等你處理的列數",
  feat_workflow_15:
    "**只下載影片的一部分** — 在「Format」畫面選擇開始與結束時間或某個章節，Arroxy 就只儲存該範圍，檔名會在影片 ID 後加上該範圍。剪輯點會落在最近的關鍵影格上；開啟精確剪輯則改為重新編碼",
  feat_workflow_16:
    "**自動移除已完成的下載** — 選用：已完成的下載會在 5 秒後從清單中消失。檔案仍保留在磁碟上，失敗的下載則會留在清單中",
  feat_workflow_17:
    "**「下載」中的大小與缺少** — 可排序的 **大小** 欄顯示每個下載佔用多少空間，**缺少** 則標示在 Arroxy 之外被移動或刪除的檔案",
  feat_workflow_18:
    "**Aurora 或極簡，深色或淺色** — 在流動天空上的玻璃面板，或安靜的純色表面；可從頁尾切換。沒有圖形加速的電腦會自動使用極簡",
  feat_workflow_19:
    "**Mac 選單列** — 在 macOS 上，可從選單列開啟設定（`Cmd+,`）、設定下載速度限制、切換樣式與主題，並開啟記錄或儲存診斷檔案",
  feat_workflow_20:
    "**從任何下載修改設定檔** — 調整某個下載後，可以更新它所依據的設定檔（附變更預覽），或將這些設定另存為新設定檔。切換設定檔時會詢問是否保留你的修改",
  feat_post_h3: "字幕與後處理",
  feat_post_1:
    "**字幕**以 SRT、VTT 或 ASS 格式下載 — 手動或自動生成，支援任意可用語言",
  feat_post_2: "儲存到影片旁邊、嵌入 `.mkv`，或整理到 `Subtitles/` 子資料夾",
  feat_post_3:
    "**SponsorBlock** — 跳過或章節標記贊助商、片頭、片尾、自我推廣片段",
  feat_post_4:
    "**嵌入後設資料** — 標題、上傳日期、頻道、描述、封面圖和章節標記寫入檔案",
  feat_post_5:
    "**僅字幕批次** — 貼上網址清單或開啟播放清單，選擇「字幕」，即可只取得每部影片的字幕檔案",
  feat_sites_h3: "YouTube + 2000 個網站",
  feat_sites_1:
    "**YouTube，全面支援** — 影片、Shorts、頻道、播放清單、YouTube Music 和Podcast作為一等來源處理",
  feat_sites_2:
    "**透過 yt-dlp 支援 2000+ 個其他網站** — Twitch、TikTok、Dailymotion、VK、SoundCloud、Bandcamp、Bilibili、archive.org、Streamable 等眾多網站",
  feat_sites_3: "**僅音訊和字幕**在所有支援的網站上均可使用，不限於 YouTube",
  feat_sites_4:
    "若某個網站發生變化，yt-dlp 每週釋出修復，Arroxy 在啟動時自動更新二進位檔",
  shot1_cap: "<b>快速下載首頁</b><br/>貼上網址，用目前設定一鍵下載",
  shot2_cap:
    "<b>可重複使用的下載設定</b><br/>將格式、畫質和輸出儲存為預設——每次下載重複使用",
  shot3_cap: "<b>多語言音軌</b><br/>精確選擇影片自帶的音訊語言",
  shot4_cap: "<b>環繞聲 / Dolby 音訊</b><br/>識別並保留 5.1 和 Dolby 音軌",
  shot5_cap: "<b>批次網址模式</b><br/>貼上清單，自動去重，一次全部加入佇列",
  shot6_cap: "<b>並行下載佇列</b><br/>多個下載同時進行，即時顯示進度",
  hotkey_fig_alt: "Arroxy 全域下載快速鍵 — Windows 和 Linux 上按 Ctrl+Shift+D，macOS 上按 Cmd+Shift+D，把複製的連結直接送入下載佇列",
  hotkey_fig_cap: "<b>全域下載快速鍵</b><br/>隨處複製連結，按一次——立即進入佇列並開始下載",
  shot7_cap: "<b>播放清單逐項設定</b><br/>為每個影片指定各自的設定——部分存為 4K，其餘轉成 MP3",
  shot8_cap: "<b>Explore</b><br/>在 Arroxy 內瀏覽 YouTube 或任何其他網站，用目前設定下載你正在看的頁面",
  shot9_cap: "<b>Explore 首屏</b><br/>快速了解 Explore，以及為什麼用備用帳號登入更安全",
  shot10_cap: "<b>「下載」告訴你哪些需要處理</b><br/>連結在背景準備；失敗的會提供解決辦法，較長的播放清單則等你選擇",
  shot11_cap: "<b>只下載影片的一部分</b><br/>選擇開始與結束時間，或某個章節 — Arroxy 只會儲存該範圍",
  shot12_cap: "<b>設定檔編輯器</b><br/>細部調整設定檔：檔案類型、解析度、字幕、儲存位置、檔名範本等",
  shot13_cap: "<b>深色或淺色，玻璃或純色</b><br/>四種外觀任你選：動態天空上的玻璃面板，或安靜的純色介面，皆提供深色與淺色",
  dl_platform_col: "平台",
  dl_format_col: "格式",
  dl_oneline_note:
    "僅提供 x86_64 版本。沒有 `curl`？請將 `curl -fsSL` 換成 `wget -qO-`。",
  dl_win_scoop:
    "更喜歡 Scoop？ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "安裝版（NSIS）或可攜版 `.exe`",
  dl_mac_format: "`.dmg`（Intel + Apple Silicon）",
  dl_linux_format: "`.AppImage` 或 `.flatpak`（沙箱）",
  dl_grab: "取得最新版本 →",
  dl_pkg_h3: "透過套件管理器安裝",
  dl_channel_col: "管道",
  dl_command_col: "指令",
  dl_win_h3: "Windows：安裝版 vs 可攜版",
  dl_win_col_installer: "NSIS 安裝版",
  dl_win_col_portable: "可攜版 `.exe`",
  dl_win_r1: "需要安裝",
  dl_win_r1_installer: "是",
  dl_win_r1_portable: "否 — 任意位置直接執行",
  dl_win_r2: "自動更新",
  dl_win_r2_installer: "✅ 應用程式內更新",
  dl_win_r2_portable: "❌ 需手動下載",
  dl_win_r3: "啟動速度",
  dl_win_r3_installer: "✅ 更快",
  dl_win_r3_portable: "⚠️ 冷啟動較慢",
  dl_win_r4: "新增到開始選單",
  dl_win_r5: "解除安裝方便",
  dl_win_r5_portable: "❌ 刪除檔案即可",
  dl_win_rec:
    "**建議：** 使用 NSIS 安裝版以獲得自動更新和更快的啟動速度。使用可攜版 `.exe` 實現免安裝、不寫登錄檔。",
  dl_win_smartscreen_h4: "Windows SmartScreen 警告",
  dl_win_smartscreen_intro:
    "首次啟動時，您可能會看到 **«Windows protected your PC»** 或 **«Unknown publisher»**。這適用於 `Arroxy-win-x64-Setup.exe` 和 `Arroxy-win-x64-Portable.exe`。Arroxy 是免費開源軟體，Windows 版本未使用付費憑證籤名，這正是 SmartScreen 將它們標示的原因。這**不**代表 Arroxy 自動就是不安全的。要繼續操作：",
  dl_win_smartscreen_step1: "點選 **More info**。",
  dl_win_smartscreen_step2: "點選 **Run anyway**。",
  dl_win_smartscreen_official:
    "請僅從官方 GitHub Releases 頁面下載 Arroxy。如果您從其他網站取得了該檔案，或有人傳送給您，請刪除它並從官方來源重新下載。原始碼是公開的，如果您願意，可以自行審查或編譯 Arroxy。",
  dl_macos_h3: "macOS 首次啟動",
  dl_macos_warning:
    "Arroxy 還沒有程式碼簽名，所以 macOS Gatekeeper 首次啟動時可能會顯示應用已損壞警告。這是預期行為，並不表示檔案真的損壞了。",
  dl_macos_m1_h4: "Terminal 方法：",
  dl_macos_step1: "將已掛載 DMG 中的 `Arroxy.app` 拖到 `/Applications`。",
  dl_macos_step2: "開啟 Terminal，執行 `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`。",
  dl_macos_step3: "執行 `open /Applications/Arroxy.app`。",
  dl_macos_step4:
    "如果應用路徑不同，請把 `/Applications/Arroxy.app` 替換為你的安裝路徑。",
  dl_macos_step5: "如果 `sudo` 要求輸入密碼，請輸入你的 Mac 密碼。",
  dl_macos_after: "移除 quarantine 後，Arroxy 會正常開啟。",
  dl_macos_m2_h4: "Terminal 方法：",
  dl_macos_note:
    "macOS 建置透過 CI 在 Apple Silicon 和 Intel runner 上生成。如遇問題，請 [建立 issue](../../issues) — macOS 使用者意見回饋會直接影響 macOS 測試週期。",
  dl_linux_h3: "Linux 首次啟動",
  dl_linux_intro: "AppImage 直接執行 — 無需安裝。只需將檔案標記為可執行。",
  dl_linux_m1_text:
    "**檔案管理器：** 右鍵 `.AppImage` → **屬性** → **許可權** → 啟用 **允許作為程式執行**，然後雙擊執行。",
  dl_linux_m2_h4: "終端：",
  dl_linux_fuse_text: "如果仍無法啟動，可以不掛載直接執行 — 無需 FUSE 軟體包：",
  dl_linux_targz_h4: "普通壓縮包（無需 FUSE，無需安裝）：",
  dl_linux_targz_text: "`.tar.gz` 版本就是去掉 AppImage 外殼的同一個應用 — 解壓到任意位置直接執行。無需安裝程式，也無需 FUSE 軟體包。",
  dl_linux_arch_note: "**釋出頁面上的 Linux 下載僅提供 x86_64。** 在 ARM64 裝置（樹莓派、Asahi Linux）上 Flatpak 可以安裝，但啟動時會失敗並報 `bwrap: execvp ldconfig: Exec format error`。",
  dl_warning_h3: "為什麼可能會看到警告",
  dl_warning_p1:
    "Arroxy 是開源軟體，採用 MIT 授權條款。Windows 和 macOS 版本**未經程式碼簽名** — Apple Developer ID 和 Windows EV 程式碼簽名憑證每年各需數百美元，對於獨立專案來說完全自掏腰包。沒有這些簽名，Windows SmartScreen 和 macOS Gatekeeper 在首次啟動時會向你發出警告。這些警告的意思是*你的系統不認識該釋出者* — 並不意味著 Arroxy 是惡意軟體。",
  dl_warning_p2:
    "三種自行驗證 Arroxy 的方式，按嚴格程度遞增：\n\n- **查看原始碼。** 每一行都在 [GitHub](https://github.com/antonio-orionus/Arroxy) 上，你也可以[從原始碼建置](#tech)。\n- **驗證 SHA256。** 將你的檔案與釋出的 [`SHA256SUMS`](../../releases/latest) 對比 — 見下方[驗證你的下載](#verify)。\n- **執行第三方掃描。** 將檔案上傳至 [VirusTotal](https://www.virustotal.com)。",

  dl_win_first_h3: "Windows 首次啟動",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "如果 Windows Defender 標記或刪除了檔案",
  dl_win_defender_p:
    "Defender 啟發式規則有時會將未簽名的 NSIS 安裝套件和 Electron 可攜版標記為可疑。如果 Defender 隔離了 `Arroxy-win-x64-Setup.exe` 或 `Arroxy-win-x64-Portable.exe`，請從 **Windows Security → Virus & threat protection → Protection history** 還原，然後在 **Manage settings → Add or remove exclusions** 中將 Arroxy 可執行檔案新增為允許項。與 SmartScreen 一樣，觸發原因是缺少釋出者簽名，而非檢測到惡意軟體。",

  dl_macos_first_h3: "macOS 首次啟動",
  dl_macos_intro:
    "Arroxy 還沒有為 macOS 進行程式碼簽名，所以從 DMG 安裝後，Gatekeeper 可能會顯示嚇人的 *\"Arroxy.app is damaged and can't be opened\"* 對話方塊。這個提示表示 macOS 將未簽名應用放入了 quarantine；並不表示應用檔案真的損壞。目前 macOS 上可靠的修復方式是 Terminal：",
  dl_macos_sequoia_h4: "目前 macOS 的 Terminal 修復方法",
  dl_macos_sequoia_intro:
    "將 Arroxy 複製到 Applications 後使用 Terminal：",
  dl_macos_sequoia_step1: "將 `Arroxy.app` 從掛載的 DMG 拖入 `/Applications`。",
  dl_macos_sequoia_step2:
    "開啟 Terminal，執行這兩條指令：",
  dl_macos_sequoia_step3:
    "執行 `open /Applications/Arroxy.app` 來啟動 Arroxy。",
  dl_macos_sequoia_step4:
    "如果應用路徑不同，請把 `/Applications/Arroxy.app` 替換為你的安裝路徑。",
  dl_macos_sonoma_h4: "舊版 macOS 的 Terminal 修復方法",
  dl_macos_sonoma_step1: "將 `Arroxy.app` 從掛載的 DMG 拖入 `/Applications`。",
  dl_macos_sonoma_step2:
    "開啟 Terminal，從 `/Applications/Arroxy.app` 移除 quarantine。",
  dl_macos_sonoma_step3:
    "移除 quarantine 後，從 Terminal 或 Finder 啟動 Arroxy。",
  dl_macos_damaged_h4:
    "Gatekeeper quarantine 修復",
  dl_macos_damaged_p:
    "第一條指令會從已安裝的 Arroxy 副本中移除 quarantine 屬性。第二條指令會啟動應用。`sudo` 可能會要求輸入你的 Mac 密碼；Terminal 在輸入時不會顯示字元。",
  dl_macos_arch_note:
    "**Apple Silicon vs Intel：** 在搭載 M 系列晶片（M1 / M2 / M3 / M4）的 Mac 上，請下載 `arm64` DMG。在 Intel Mac 上，請下載 `x64` DMG。執行錯誤版本仍可透過 Rosetta 啟動，但速度會明顯變慢。",

  dl_linux_first_h3: "Linux 首次啟動",
  dl_linux_appimagelauncher:
    "**可選桌面整合：** 安裝一次 [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)，此後雙擊任意 AppImage 即可自動註冊到啟動器選單 — 無需手動建立 `.desktop` 檔案。",

  dl_verify_h3: "驗證你的下載（SHA256）",
  dl_verify_intro:
    "每次釋出都會在二進位檔旁邊附上 `SHA256SUMS` 檔案。為確認下載檔案在傳輸過程中未被損壞或篡改，請在本機對檔案進行雜湊計算，並與 `SHA256SUMS` 中對應的行進行比對。開啟最新發布頁 → **Assets** → 下載 `SHA256SUMS`。",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "想要第三方惡意軟體掃描？將檔案上傳到 [VirusTotal](https://www.virustotal.com)。小型引擎給出少量通用啟發式標記對於未簽名的 Electron 應用程式來說屬於正常；主流引擎大面積檢測才是真正值得警惕的情況。",

  dl_pm_intro: "已經在用套件管理器？可以跳過手動下載流程。",

  privacy_p1:
    "下載透過 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 直接從 YouTube 取得到你選擇的資料夾 — 不經過任何第三方伺服器。觀看歷史、下載歷史、URL 和檔案內容均保留在你的裝置上。",
  privacy_p2:
    "沒有遙測 — 每天只傳送一次匿名心跳訊號：應用程式版本、OS、語言、安裝管道和國家/地區，用來統計活躍使用者。不包含 ID、URL、影片標題、檔案路徑或帳號資訊。你可以在設定中關閉。",
  privacy_p3:
    "Explore 有自己獨立的登入，與你的瀏覽器分開，Arroxy 不會讀取或填寫登入表單 — 你是在 Google 自己的頁面上輸入。下載在未登入狀態下進行；只有在下載因帳號可解決的原因失敗時，Arroxy 才會重新讀取該登入，把它放進僅供該次下載使用的暫存檔，並在之後刪除該檔案。在設定中登出 Explore 即可清除登入。",
  faq_q1: "真的免費嗎？",
  faq_a1: "是的 — MIT 授權條款，無付費版，無功能限制。",
  faq_q11: "Arroxy 和其他 yt-dlp 圖形介面有什麼不同？",
  faq_a11:
    "多數免費的 yt-dlp 圖形介面只是接收連結的包裝程式。Arroxy 加入了 **Explore**，一個內建於應用程式中的 YouTube 瀏覽器：你可以邊瀏覽邊下載，不必複製連結；只要在其中登入一次，就能下載私人、會員專屬與年齡限制影片，以及你的「稍後觀看」和「喜歡的影片」清單，完全不必匯出 Cookie。當 YouTube 要求你確認自己不是機器人時，Arroxy 會使用這個登入；它的內建瀏覽器也會取得 YouTube 的下載權杖，讓下載不會退回到較少的格式。請參閱[為什麼選 Arroxy](#why)。",
  faq_q2: "能下載哪些影片畫質？",
  faq_a2:
    "YouTube 提供的都行：8K（4320p）、4K UHD（2160p）、1440p、1080p、720p、480p、360p，以及純音訊。60 fps 和 HDR 流依原樣保留，逐步下載還能讓你在每個解析度下選擇 AV1、VP9 或 H.264。",
  faq_q3: "能將音訊提取為 MP3 嗎？",
  faq_a3:
    "可以。在格式選單裡選擇*僅音訊*，然後選擇 MP3、M4A/AAC、Opus 或 WAV。",
  faq_q4: "如何下載需要 YouTube 帳號的影片？",
  faq_a4:
    "在 Explore 分頁中登入一次。之後 Arroxy 就能下載你的帳號可觀看的私人與會員專屬影片、已通過年齡驗證帳號可看的年齡限制影片，以及你的「稍後觀看」和「喜歡的影片」清單。只有在下載因帳號可解決的原因失敗時才會使用該登入，其他下載與之前一樣。這就是 Cookie 設定中的 **Explore 登入** 選項，排在第一位並標有「建議」，首次開啟 Explore 時 Arroxy 會為你選取它。yt-dlp 的 wiki 指出[已登入狀態下的自動化可能會標記 Google 帳號](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)，因此使用備用帳號是更安全的選擇。",
  faq_q5: "YouTube 更新後還能繼續使用嗎？",
  faq_a5:
    "yt-dlp 在啟動時自動更新，YouTube 一旦發生變化，Arroxy 會及時釋出修復。YouTube 要求確認你不是機器人時，如果你已在 Explore 登入，Arroxy 也會嘗試使用該登入；Cookie 設定中還可使用來自檔案或瀏覽器的 Cookie。",
  faq_q6: "Arroxy 支援哪些語言？",
  faq_a6:
    "立即可用的 {{LANG_COUNT}} 種語言：{{LANG_NAME_LIST}}。 Arroxy 會在首次啟動時自動檢測作業系統語言，你也可以隨時從工具列的語言選擇器切換。Runtime locale JSON 位於 src/shared/i18n/locales/，面向譯者的 PO catalog 位於 i18n/locales/ — 歡迎在 GitHub 上建立 PR 貢獻。",
  faq_q7: "需要額外安裝其他軟體嗎？",
  faq_a7:
    "不需要。yt-dlp、ffmpeg 和 ffprobe 會在首次啟動時自動下載並快取到你的電腦上。之後無需任何額外設定。",
  faq_q8: "能下載播放清單或整個頻道嗎？",
  faq_a8:
    "可以，兩者都支援。貼上播放清單或頻道 URL（例如 `youtube.com/@handle`、`/channel/UC…`、`/c/Name`、`/user/Old`）；選擇要掃描的項目數量，然後將整個清單加入佇列或選擇特定影片。日期範圍篩選即將推出。",
  faq_q9: 'macOS 提示"應用已損壞" — 怎麼處理？',
  faq_a9:
    "這是 macOS Gatekeeper 在攔截未簽名應用，並非真正損壞。請查看 [macOS first launch](#macos-first-launch)，其中有移除 quarantine 並啟動 Arroxy 的 Terminal 指令。",
  faq_q10: "下載 YouTube 影片合法嗎？",
  faq_a10:
    "在大多數地區，個人私人使用一般被接受。你需要自行負責遵守 YouTube 的[服務條款](https://www.youtube.com/t/terms)及當地版權法律。",
  plan_intro: "仍在計劃中 — 大致按優先順序排序：",
  plan_col1: "功能",
  plan_col2: "描述",
  plan_r1_name: "**播放清單與頻道篩選**",
  plan_r1_desc: "列舉播放清單或頻道時的日期範圍篩選",
  plan_r2_name: "**YouTube 音軌偏好**",
  plan_r2_desc:
    "當 YouTube 提供多個音軌時，設定全應用程式預設口語音軌，並允許每個設定單獨覆蓋",
  plan_r3_name: "**更強的重試恢復**",
  plan_r3_desc: "為不穩定或有問題的網路連線中斷的下載提供新的重試路徑",
  plan_r4_name: "**完整下載管理器面板**",
  plan_r4_desc: "將佇列面板擴充套件為更完整的管理器，包括為排隊專案更改目標資料夾",
  plan_r5_name: "**定時下載**",
  plan_r5_desc: "在設定時間啟動佇列（適合連夜批次下載）",
  plan_r9_name: "**AUR 套件**",
  plan_r9_desc: "在 Arch Linux 與 Omarchy 上以 `yay -S arroxy-bin` 安裝",
  plan_cta: "有想法？[提交請求](../../issues) — 社羣意見決定優先順序。",
  tech_content: TECH_CONTENT,
  support_h2: "支援 Arroxy",
  support_note: "Arroxy 完全免費並採用 MIT 授權條款 —— 沒有廣告、沒有遙測、沒有付費版本。如果它為你節省了時間，你可以透過 Bitcoin、Tron 或 Ethereum 支援它的開發：地址見 [DONATE.md](DONATE.md)，這是唯一的官方來源。Arroxy 絕不會透過電子郵件或私信向你傳送地址。給儲存庫點星、報告問題和改進翻譯同樣有幫助。",
  tos_h2: "使用條款",
  tos_note:
    "Arroxy 僅供個人私人使用。你需要自行確保下載行為符合 YouTube 的[服務條款](https://www.youtube.com/t/terms)及你所在地區的版權法律。請勿使用 Arroxy 下載、複製或分發你不享有權利的內容。開發者對任何濫用行為不承擔責任。",
  footer_credit:
    'MIT 授權條款 · 由 <a href="https://x.com/OrionusAI">@OrionusAI</a> 用心打造',
};
