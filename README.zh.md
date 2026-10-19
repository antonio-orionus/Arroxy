<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy 吉祥物" width="180" />

# Arroxy — 内置浏览器的免费开源 YouTube（+ 2000 个网站）下载器，支持 Windows、macOS 和 Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**阅读语言：** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · **中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![发布](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![构建](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![官网](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![许可证](https://img.shields.io/badge/license-MIT-green) ![平台](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![语言](https://img.shields.io/badge/i18n-31_languages-blue)

从 **YouTube 和 2000+ 个支持的网站**下载视频、Shorts、音乐、频道、播客或音轨 — 最高 8K HDR 60 fps，可导出为 MP3 / AAC / Opus，也可以只下载你需要的片段。在 Explore 标签页中**在 Arroxy 内浏览 YouTube 或任意其他网站**，下载你正在查看的视频、播放列表或频道；在那里登录后，还能下载你的账号可观看的私享、会员专属和年龄限制视频。在 Windows、macOS 和 Linux 本地运行。**无广告、无冗余、无追加销售。**

[**↓ 下载最新版本**](#install) &nbsp;·&nbsp; [**官网**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows 首次启动](#windows-first-launch) · [macOS 首次启动](#macos-first-launch) · [Linux 首次启动](#linux-first-launch)

[![加入 Discord 社群](https://img.shields.io/badge/%E5%8A%A0%E5%85%A5%20Discord%20%E7%A4%BE%E7%BE%A4-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

如果 Arroxy 帮你节省了时间，点个 ⭐ 让更多人发现它。

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 这是 AI 辅助翻译。[英文 README](README.md) 是真实来源。发现错误？欢迎 [提交 PR](../../pulls)。

---

## 目录

- [✨ 功能特性](#features)
- [📥 安装和首次启动](#install)
  - [Windows 首次启动](#windows-first-launch)
  - [macOS 首次启动](#macos-first-launch)
  - [为什么可能会看到警告](#why-warning)
  - [Linux 首次启动](#linux-first-launch)
  - [验证你的下载（SHA256）](#verify)
- [⚖️ 为什么选 Arroxy](#why)
- [🔒 隐私](#privacy)
- [❓ 常见问题](#faq)
- [🗺️ 路线图](#roadmap)
- [💖 支持 Arroxy](#support)
- [🛠️ 技术栈](#tech)

---

## <a id="features"></a>✨ 功能特性

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>在 Arroxy 内浏览 YouTube 或任意其他网站，用当前配置下载你正在查看的页面</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore 首屏</b><br/>快速了解 Explore，以及为什么用备用账号登录更安全</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>“下载”告诉你哪些需要处理</b><br/>链接在后台准备；失败的会给出解决办法，较长的播放列表则等你选择</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>只下载视频的一部分</b><br/>选择开始和结束时间，或某个章节 — Arroxy 只保存该范围</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>配置文件编辑器</b><br/>精细调整配置文件：文件类型、分辨率、字幕、保存位置、文件名模板等</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>深色或浅色，玻璃或纯色</b><br/>四种外观任你选：动态天空上的玻璃面板，或安静的纯色界面，均支持深色和浅色</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy 全局下载快捷键 — Windows 和 Linux 上按 Ctrl+Shift+D，macOS 上按 Cmd+Shift+D，把复制的链接直接送入下载队列" width="760" /></picture><br/><sub><b>全局下载快捷键</b><br/>随处复制链接，按一次——即刻进入队列并开始下载</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>播放列表逐条配置</b><br/>为每个视频指定各自的配置——部分存为 4K，其余转成 MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>快速下载主页</b><br/>粘贴网址，用当前配置一键下载</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>可复用的下载配置</b><br/>将格式、画质和输出保存为预设——每次下载复用</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>多语言音轨</b><br/>精确选择视频自带的音频语言</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>环绕声 / Dolby 音频</b><br/>识别并保留 5.1 和 Dolby 音轨</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>批量网址模式</b><br/>粘贴列表，自动去重，一次性全部入队</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>并行下载队列</b><br/>多个下载同时进行，实时显示进度</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore：在 Arroxy 内浏览网页</strong></summary>

- **Explore 标签页** — 在 Arroxy 内浏览 YouTube 或任意其他网站，无需复制链接即可下载你找到的内容。**下载 · *你的配置*** 会把你正在查看的视频、播放列表或频道加入队列；旁边的箭头可切换配置，魔杖则打开分步下载，用来选择格式、字幕等
- **右键下载** — 在 Explore 中右键点击任意视频、播放列表或频道链接，即可用你的配置下载、从 **使用配置文件下载** 中选择其他配置、打开分步下载，或复制链接。无需逐个打开视频
- **紧凑布局** — 在 Explore 工具栏点一下，就会把 Arroxy 的标签页移进去，让页面有更多空间
- **地址栏** — 输入关键词搜索 YouTube，或输入任意网址打开该网站
- **需要账号的下载** — 在 Explore 中登录一次，Arroxy 就能下载你的账号可观看的私享和会员专属视频、已通过年龄验证的账号可看的年龄限制视频，以及你的“稍后观看”和“赞过的视频”列表。你也可以在 Explore 中登录其他网站，这些网站的下载在需要时会使用该登录。Arroxy 仍默认先在未登录状态下下载，只有当下载因账号可解决的原因失败时才会使用你在 Explore 中的登录。YouTube 要求确认你不是机器人时，Arroxy 也会尝试使用你在 Explore 中的登录
- **建议使用备用账号** — Explore 的首屏会说明原因：使用账号下载有一定风险，该账号可能被限制。想清除所有登录时，随时可在设置中退出 Explore
- **广告拦截** — 默认关闭。点击 Explore 工具栏上的盾牌，即可拦截其页面上的广告和跟踪器，不影响下载。对已登录的账号，YouTube 可能会抵制广告拦截

</details>

<details>
<summary><strong>🎞️ 画质与格式</strong></summary>

- 最高 **8K（4320p）**、4K UHD（2160p）、1440p、1080p、720p、480p、360p
- **高帧率与 HDR**原样保留 — 60 fps、HDR10
- **音频** — 将仅音频导出为 MP3、M4A/AAC、Opus 或 WAV。在交互式下载中，可用时选择来源的原生环绕声/Dolby 音轨（AC-3、E-AC-3、5.1、DRC），或设置全局默认 **优先环绕声 / Dolby**
- **有目标的配置文件** — *最佳画质*（AV1 · VP9）或 *智能电视*（MP4 · H.264），无需重新编码即可保存为自动、MP4、MKV 或 WebM。HDR 可选 *自动*（仅在屏幕能显示时）、*SDR* 或 *HDR*
- **每种分辨率都有每种编码** — 分步下载会在每个分辨率下并列显示 AV1、VP9 和 H.264，让你选择电视或剪辑软件能播放的那一种
- **看清流的真实情况** — YouTube 用 AI 放大的尺寸、AI 配音的音频语言、增强码率的流、360° 视频，以及损坏或带水印的副本都会被标记。除非你允许，配置文件会跳过 AI 放大的流

</details>

<details>
<summary><strong>🛡️ 隐私与控制</strong></summary>

- 100% 本地处理 — 下载直接从 YouTube 到你的硬盘
- 无登录、无 Cookie、无 Google 账号绑定
- 文件直接保存到你选择的文件夹

</details>

<details>
<summary><strong>⚡ 工作流</strong></summary>

- **全局下载快捷键** — 在任意应用中复制链接后按 `Ctrl+Shift+D`（macOS 为 `Cmd+Shift+D`），Arroxy 会用当前配置直接加入队列，无需打开窗口，并以通知确认。默认开启，可重新绑定
- **灵活的开始模式** — 选择引导式单个下载、播放列表/频道选择器、批量粘贴 URL、使用已保存默认值的 Quick Download，或在 Explore 中浏览并下载
- **中央下载队列** — 单个、播放列表、批量或快速任务都会进入同一个地方，用于查看进度、暂停、继续、取消、重试和控制优先级
- **剪贴板监控** — 复制视频链接后，回到 Arroxy 时会自动填入 URL 输入框；如果不是你想要的，可以点 **撤销**。Arroxy 忙碌时，链接会等你回到“链接”标签页再填入（可在设置中关闭）
- **自动清理 URL** — 剥除跟踪参数（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）并解包 `youtube.com/redirect` 跳转链接
- **托盘模式** — 关闭窗口后下载在后台继续运行
- **31 种语言** — 自动检测系统区域设置，可随时切换
- **播放列表同步** — 将播放列表与本地文件夹重新比对，跳过已下载的视频；生成一个 `.m3u` 播放列表文件，并在每个视频下载后更新
- **速度和节奏控制** — 限制下载带宽、设置同时获取视频的分片数量，并用预设添加请求延迟（*关闭 · 平衡 · 谨慎 · 自定义*）
- **文件名模板** — 使用 `{title}`、`{uploader}`、`{id}`、`{date}`、`{resolution}` 和 `{playlist_index}` 按你的方式命名下载文件，可全局设置或按下载配置分别设置
- **同时下载数与自动重试** — 选择队列中同时进行的下载数量，让遇到网络或服务器问题的下载由 Arroxy 自动重试，每次尝试前等待更久
- **播放列表逐条配置** — 为播放列表中的每个视频分配各自的下载配置，而不是整份列表用同一套设置，一次即可将部分视频存为完整画质、其余转成 MP3
- **Quick Download 在后台运行** — 链接会立即出现在“下载”中并在那里准备，带有 **查看** 的提示予以确认，URL 输入框随即清空，方便粘贴下一个链接。前面的还在准备时，可以继续开始任意多个
- **“下载”会告诉你哪些需要处理** — Arroxy 读取不了某个链接时，该行会说明原因并给出解决办法：重试、开启 Cookie，或在 Explore 中登录。Cookie 关闭时，登录后点击 **使用 Explore 登录** 会替你重试。超过加载上限的播放列表会在其所在行等你选择：全部、前几个，或先审阅。“下载”标签页会显示等你处理的行数
- **只下载视频的一部分** — 在“Format”界面选择开始和结束时间或某个章节，Arroxy 就只保存该范围，文件名会在视频 ID 后附上该范围。剪辑点会落在最近的关键帧上；开启精确剪辑则改为重新编码
- **自动移除已完成的下载** — 可选：已完成的下载会在 5 秒后从列表中消失。文件仍保留在磁盘上，失败的下载则会留在列表中
- **“下载”中的大小与缺失** — 可排序的 **大小** 列显示每个下载占用多少空间，**缺失** 则标示在 Arroxy 之外被移动或删除的文件
- **Aurora 或极简，深色或浅色** — 流动天空上的玻璃面板，或安静的纯色表面；可从页脚切换。没有图形加速的电脑会自动使用极简
- **Mac 菜单栏** — 在 macOS 上，可从菜单栏打开设置（`Cmd+,`）、设置下载速度限制、切换样式与主题，并打开日志或保存诊断文件
- **从任意下载修改配置文件** — 调整某个下载后，可以更新它所基于的配置文件（附带改动预览），或将这些设置另存为新配置文件。切换配置文件时会询问是否保留你的修改

</details>

<details>
<summary><strong>📝 字幕与后处理</strong></summary>

- **字幕**以 SRT、VTT 或 ASS 格式下载 — 手动或自动生成，支持任意可用语言
- 保存到视频旁边、嵌入 `.mkv`，或整理到 `Subtitles/` 子文件夹
- **仅字幕批量** — 粘贴链接列表或打开播放列表，选择“字幕”，即可只获取每个视频的字幕文件
- **SponsorBlock** — 跳过或章节标记赞助商、片头、片尾、自我推广片段
- **嵌入元数据** — 标题、上传日期、频道、描述、封面图和章节标记写入文件

</details>

<details>
<summary><strong>🌐 YouTube + 2000 个网站</strong></summary>

- **YouTube，全面支持** — 视频、Shorts、频道、播放列表、YouTube Music 和播客作为一等来源处理
- **通过 yt-dlp 支持 2000+ 个其他网站** — Twitch、TikTok、Dailymotion、VK、SoundCloud、Bandcamp、Bilibili、archive.org、Streamable 等众多网站
- **仅音频和字幕**在所有支持的网站上均可使用，不限于 YouTube
- 若某个网站发生变化，yt-dlp 每周发布修复，Arroxy 在启动时自动更新二进制文件

</details>

---

## <a id="install"></a>📥 安装和首次启动

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

仅提供 x86_64 版本。没有 `curl`？请将 `curl -fsSL` 换成 `wget -qO-`。

| 平台 | 格式 |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**获取最新版本 →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows 首次启动</strong></summary>

首次启动时，您可能会看到 **«Windows protected your PC»** 或 **«Unknown publisher»**。这适用于 `Arroxy-win-x64-Setup.exe` 和 `Arroxy-win-x64-Portable.exe`。Arroxy 是免费开源软件，Windows 版本未使用付费证书签名，这正是 SmartScreen 标记它们的原因。这**不**代表 Arroxy 自动就是不安全的。要继续操作：

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. 点击 **More info**。
2. 点击 **Run anyway**。

#### 如果 Windows Defender 标记或删除了文件

Defender 启发式规则有时会将未签名的 NSIS 安装包和 Electron 便携版标记为可疑。如果 Defender 隔离了 `Arroxy-win-x64-Setup.exe` 或 `Arroxy-win-x64-Portable.exe`，请从 **Windows Security → Virus & threat protection → Protection history** 还原，然后在 **Manage settings → Add or remove exclusions** 中将 Arroxy 可执行文件添加为允许项。与 SmartScreen 一样，触发原因是缺少发布者签名，而非检测到恶意软件。

> 请仅从官方 GitHub Releases 页面下载 Arroxy。如果您从其他网站获取了该文件，或有人发送给您，请删除它并从官方来源重新下载。源代码是公开的，如果您愿意，可以自行审查或编译 Arroxy。

更喜欢 Scoop？ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS 首次启动</strong></summary>

Arroxy 还没有为 macOS 进行代码签名，所以从 DMG 安装后，Gatekeeper 可能会显示吓人的 *"Arroxy.app is damaged and can't be opened"* 对话框。这个提示表示 macOS 将未签名应用放入了 quarantine；并不表示应用文件真的损坏。当前 macOS 上可靠的修复方式是 Terminal：

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. 将 `Arroxy.app` 从挂载的 DMG 拖入 `/Applications`。
2. 打开 Terminal，运行这两条命令：

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

第一条命令会从已安装的 Arroxy 副本中移除 quarantine 属性。第二条命令会启动应用。`sudo` 可能会要求输入你的 Mac 密码；Terminal 在输入时不会显示字符。

**Apple Silicon vs Intel：** 在搭载 M 系列芯片（M1 / M2 / M3 / M4）的 Mac 上，请下载 `arm64` DMG。在 Intel Mac 上，请下载 `x64` DMG。运行错误版本仍可通过 Rosetta 启动，但速度会明显变慢。

> macOS 构建通过 CI 在 Apple Silicon 和 Intel runner 上生成。如遇问题，请 [提交 issue](../../issues) — macOS 用户的反馈会直接影响 macOS 测试周期。

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ 为什么可能会看到警告</strong></summary>

Arroxy 是开源软件，采用 MIT 许可证。Windows 和 macOS 版本**未经代码签名** — Apple Developer ID 和 Windows EV 代码签名证书每年各需数百美元，对于独立项目来说完全自掏腰包。没有这些签名，Windows SmartScreen 和 macOS Gatekeeper 在首次启动时会向你发出警告。这些警告的意思是*你的系统不认识该发布者* — 并不意味着 Arroxy 是恶意软件。

三种自行验证 Arroxy 的方式，按严格程度递增：

- **查看源码。** 每一行都在 [GitHub](https://github.com/antonio-orionus/Arroxy) 上，你也可以[从源码构建](#tech)。
- **校验 SHA256。** 将你的文件与发布的 [`SHA256SUMS`](../../releases/latest) 对比 — 见下方[验证你的下载](#verify)。
- **运行第三方扫描。** 将文件上传至 [VirusTotal](https://www.virustotal.com)。

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux 首次启动</strong></summary>

AppImage 直接运行 — 无需安装。只需将文件标记为可执行。

**文件管理器：** 右键 `.AppImage` → **属性** → **权限** → 启用 **允许作为程序执行**，然后双击运行。

**终端：**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

如果仍无法启动，可以不挂载直接运行 — 无需 FUSE 软件包：

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**可选桌面集成：** 安装一次 [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)，此后双击任意 AppImage 即可自动注册到启动器菜单 — 无需手动创建 `.desktop` 文件。

**普通压缩包（无需 FUSE，无需安装）：**

`.tar.gz` 版本就是去掉 AppImage 外壳的同一个应用 — 解压到任意位置直接运行。无需安装程序，也无需 FUSE 软件包。

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**发布页面上的 Linux 下载仅提供 x86_64。** 在 ARM64 设备（树莓派、Asahi Linux）上 Flatpak 可以安装，但启动时会失败并报 `bwrap: execvp ldconfig: Exec format error`。

</details>

<details>
<summary><strong><a id="verify"></a>🔐 验证你的下载（SHA256）</strong></summary>

每次发布都会在二进制文件旁边附上 `SHA256SUMS` 文件。为确认下载文件在传输过程中未被损坏或篡改，请在本地对文件进行哈希计算，并与 `SHA256SUMS` 中对应的行进行比对。打开最新发布页 → **Assets** → 下载 `SHA256SUMS`。

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

想要第三方恶意软件扫描？将文件上传到 [VirusTotal](https://www.virustotal.com)。小型引擎给出少量通用启发式标记对于未签名的 Electron 应用来说属于正常；主流引擎大面积检测才是真正值得警惕的情况。

</details>

<details>
<summary><strong>📦 Windows：安装版 vs 便携版</strong></summary>

|               | NSIS 安装版 | 便携版 `.exe` |
| ------------- | :----------------------: | :---------------------: |
| 需要安装 | 是  | 否 — 任意位置直接运行  |
| 自动更新 | ✅ 应用内更新  | ❌ 需手动下载  |
| 启动速度 | ✅ 更快  | ⚠️ 冷启动较慢  |
| 添加到开始菜单 |            ✅            |           ❌            |
| 卸载方便 |            ✅            | ❌ 删除文件即可  |

**建议：** 使用 NSIS 安装版以获得自动更新和更快的启动速度。使用便携版 `.exe` 实现免安装、不写注册表。

</details>

---

## <a id="why"></a>⚖️ 为什么选 Arroxy

与最常见的替代方案逐项对比：

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| 内置浏览器（浏览、登录、下载） |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| 无需导出 Cookie 即可下载私享、会员专属和年龄限制视频 |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| 免费，无付费版 |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| 开源 |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| 仅本地处理 |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| 无使用上限 |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| 跨平台桌面应用 |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| 字幕 + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = 部分支持，或仅限付费版。4K Video Downloader 用于私享视频的应用内登录是付费功能；大多数免费的 yt-dlp 图形界面只接受 Cookie 文件，或读取你网页浏览器中的 Cookie。

Arroxy 只做一件事：无论你是粘贴链接，还是在 Explore 中找到视频，都能得到干净的本地文件。无追加销售、无数据收集。

### <a id="why-explore"></a>🧭 普通 yt-dlp 套壳做不到的事：Explore 标签页

大多数免费的 YouTube 下载器只是在 yt-dlp 之上加了一个链接输入框。Arroxy 同样使用 yt-dlp，但它还有 **Explore**，一个内置在应用中的浏览器，可打开 YouTube 或任意其他网站。Explore 能绕过仅靠链接输入框无法应对的限制：

- **需要账号的视频，无需导出 Cookie** — 私享、会员专属和年龄限制视频（需已通过年龄验证的账号），以及你的“稍后观看”和“赞过的视频”列表，以及其他网站上需要登录才能观看的视频。普通套壳工具需要你导出 cookies.txt，或读取你网页浏览器中的 Cookie，而 Windows 上的 Chrome 现在会阻止这种读取。在 Arroxy 中，你只需在 Explore 中登录一次，其余的交给它处理
- **“登录以确认你不是机器人”** — YouTube 提出这一要求时，Arroxy 会用你在 Explore 中的登录重试下载，而不是直接失败
- **YouTube 的下载令牌** — Arroxy 的内置浏览器会在下载前获取 YouTube 所要求的令牌。没有它，YouTube 可能只提供更少的格式，画质也会低于你的要求
- **无需复制链接** — 在 Explore 中找到视频、播放列表或频道，一键即可下载，也可以右键点击页面上的任意链接
- **需要时再开启广告拦截** — 点一下盾牌，Explore 就会拦截其页面上的广告和跟踪器

---

## <a id="privacy"></a>🔒 隐私

下载通过 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 直接从 YouTube 获取到你选择的文件夹 — 不经过任何第三方服务器。观看历史、下载历史、URL 和文件内容均保留在你的设备上。

没有遥测 — 每天只发送一次匿名心跳：应用版本、OS、语言、安装渠道和国家/地区，用于统计活跃用户。不包含 ID、URL、视频标题、文件路径或账号信息。你可以在设置中关闭。

Explore 有自己独立的登录，与你的浏览器分开，Arroxy 不会读取或填写登录表单 — 你是在 该网站自己的页面上输入。下载在未登录状态下进行；只有当下载因账号可解决的原因失败时，Arroxy 才会重新读取该登录，把它放进仅供本次下载使用的临时文件，并在之后删除该文件。在设置中退出 Explore 即可清除这些登录。

---

## <a id="faq"></a>❓ 常见问题

<details>
<summary><strong>真的免费吗？</strong></summary>

是的 — MIT 许可证，无付费版，无功能门槛。

</details>

<details>
<summary><strong>Arroxy 与其他 yt-dlp 图形界面有何不同？</strong></summary>

大多数免费的 yt-dlp 图形界面只是接收链接的套壳工具。Arroxy 增加了 **Explore**，一个内置在应用中的浏览器，可打开 YouTube 或任意其他网站：你可以边浏览边下载，无需复制链接；只需在其中登录一次，就能下载私享、会员专属和年龄限制视频，以及你的“稍后观看”和“赞过的视频”列表，无需导出 Cookie。当 YouTube 要求你确认自己不是机器人时，Arroxy 会使用这一登录；它的内置浏览器还会获取 YouTube 的下载令牌，让下载不会退回到更少的格式。参见[为什么选 Arroxy](#why)。

</details>

<details>
<summary><strong>能下载哪些视频画质？</strong></summary>

YouTube 提供的都行：8K（4320p）、4K UHD（2160p）、1440p、1080p、720p、480p、360p，以及纯音频。60 fps 和 HDR 流原样保留，分步下载还能让你在每个分辨率下选择 AV1、VP9 或 H.264。

</details>

<details>
<summary><strong>能将音频提取为 MP3 吗？</strong></summary>

可以。在格式菜单里选择*仅音频*，然后选择 MP3、M4A/AAC、Opus 或 WAV。

</details>

<details>
<summary><strong>如何下载需要 YouTube 账号的视频？</strong></summary>

在 Explore 标签页中登录一次。之后 Arroxy 就能下载你的账号可观看的私享和会员专属视频、已通过年龄验证的账号可看的年龄限制视频，以及你的“稍后观看”和“赞过的视频”列表。只有当下载因账号可解决的原因失败时才会使用该登录，其他下载与之前一样。这就是 Cookie 设置中的 **Explore 登录** 选项，排在第一位并标有“推荐”，首次打开 Explore 时 Arroxy 会为你选中它。yt-dlp 的 wiki 指出[已登录状态下的自动化可能会标记 Google 账号](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)，因此使用备用账号是更安全的选择。

</details>

<details>
<summary><strong>YouTube 更新后还能继续使用吗？</strong></summary>

yt-dlp 在启动时自动更新，YouTube 一旦发生变化，Arroxy 会及时发布修复。YouTube 要求确认你不是机器人时，如果你已在 Explore 中登录，Arroxy 也会尝试使用该登录；Cookie 设置中还可使用来自文件或浏览器的 Cookie。

</details>

<details>
<summary><strong>Arroxy 支持哪些语言？</strong></summary>

开箱即用的 31 种语言：Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文。 Arroxy 会在首次启动时自动检测操作系统语言，你也可以随时从工具栏的语言选择器切换。Runtime locale JSON 位于 src/shared/i18n/locales/，面向译者的 PO catalog 位于 i18n/locales/ — 欢迎在 GitHub 上打开 PR 贡献。

</details>

<details>
<summary><strong>需要额外安装其他软件吗？</strong></summary>

不需要。yt-dlp、ffmpeg 和 ffprobe 会在首次启动时自动下载并缓存到你的机器上。之后无需任何额外配置。

</details>

<details>
<summary><strong>能下载播放列表或整个频道吗？</strong></summary>

可以，两者都支持。粘贴播放列表或频道 URL（例如 `youtube.com/@handle`、`/channel/UC…`、`/c/Name`、`/user/Old`）；选择要扫描的条目数量，然后将整个列表加入队列或选择特定视频。日期范围筛选即将推出。

</details>

<details>
<summary><strong>macOS 提示"应用已损坏" — 怎么处理？</strong></summary>

这是 macOS Gatekeeper 在拦截未签名应用，并非真正损坏。请查看 [macOS first launch](#macos-first-launch)，其中有移除 quarantine 并启动 Arroxy 的 Terminal 命令。

</details>

<details>
<summary><strong>下载 YouTube 视频合法吗？</strong></summary>

在大多数地区，个人私人使用一般被接受。你需要自行负责遵守 YouTube 的[服务条款](https://www.youtube.com/t/terms)及当地版权法律。

</details>

---

## <a id="roadmap"></a>🗺️ 路线图

仍在计划中 — 大致按优先级排序：

| 功能    | 描述    |
| ---------------- | ---------------- |
| **播放列表与频道筛选** | 枚举播放列表或频道时的日期范围筛选 |
| **YouTube 音轨偏好** | 当 YouTube 提供多个音轨时，设置全应用默认口语音轨，并允许每个配置单独覆盖 |
| **更强的重试恢复** | 为不稳定或有问题的网络连接中断的下载提供新的重试路径 |
| **完整下载管理器抽屉** | 将队列抽屉扩展为更完整的管理器，包括为排队项目更改目标文件夹 |
| **定时下载** | 在设定时间启动队列（适合连夜批量下载） |
| **AUR 软件包** | 在 Arch Linux 和 Omarchy 上用 `yay -S arroxy-bin` 安装 |

有想法？[提交请求](../../issues) — 社区意见决定优先级。

---

## <a id="support"></a>💖 支持 Arroxy

Arroxy 完全免费并采用 MIT 许可证 —— 没有广告、没有遥测、没有付费版本。如果它为你节省了时间，你可以通过 Bitcoin、Tron 或 Ethereum 支持它的开发：地址见 [DONATE.md](DONATE.md)，这是唯一的官方来源。Arroxy 绝不会通过电子邮件或私信向你发送地址。给仓库点星、报告问题和改进翻译同样有帮助。

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ 技术栈

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — 跨平台桌面外壳
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — 样式
- **Zustand** — 状态管理
- **yt-dlp** + **ffmpeg** — 下载与混流引擎（两者都在运行时获取：yt-dlp 保持最新，ffmpeg/ffprobe 只安装一次并在更新后保留）
- **Vite** + **electron-vite** — 构建工具
- **Vitest** + **Playwright** — 单元测试与端到端测试

</details>

<details>
<summary><strong>从源码构建</strong></summary>

### 前置要求 — 所有平台

| 工具    | 版本 | 安装 |
| ------- | ------- | ------- |
| Git     | 任意     | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` 或 `.node-version` |
| Bun     | 1.4.2  | `mise install` 或 `package.json` `packageManager` |

推荐安装 `mise`，然后在 checkout 中运行 `mise install`。如果不用 mise，请先按 `.node-version` 手动启用 Node.js，并按 `package.json` 启用 Bun，再运行 `bun run bootstrap`。

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

克隆后，在 checkout 中运行 `mise trust && mise install`。如果你的 shell 已经使用 `fnm`、`nvm` 或 Homebrew Bun，请在 `~/.zshrc` 中启用 mise，让 Arroxy 使用 Node.js 24.21.0 和 Bun 1.4.2：

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

# 构建和 Electron 运行时依赖
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# 仅 E2E 测试（Electron 需要显示器）
sudo apt install -y xvfb
```

### 克隆并运行

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # 推荐；如果已手动启用固定版本工具，可跳过
bun run bootstrap
bun run doctor
bun run dev            # 使用 Vite renderer 运行 Electron 应用
```

### 打包发行版

```bash
bun run build        # 类型检查 + 编译
bun run dist         # 为当前系统打包
bun run dist:win     # 在受支持的主机上打包 Windows 目标
```

> `bun run bootstrap` 会安装依赖、重建 Electron 应用依赖、验证 Electron、为开发准备嵌入式 ffmpeg/ffprobe，并安装 Playwright Chromium。发布版本在运行时于应用数据目录中管理 yt-dlp、ffmpeg 和 ffprobe；它们都不包含在安装程序中。

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

## 📜 使用条款

Arroxy 仅供个人私人使用。你需要自行确保下载行为符合 YouTube 的[服务条款](https://www.youtube.com/t/terms)及你所在地区的版权法律。请勿使用 Arroxy 下载、复制或分发你不享有权利的内容。开发者对任何滥用行为不承担责任。

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT 许可证 · 由 <a href="https://x.com/OrionusAI">@OrionusAI</a> 用心打造</sub>
</div>
