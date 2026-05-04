<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy 吉祥物" width="180" />

# Arroxy — 免费开源 YouTube 下载器，支持 Windows、macOS 和 Linux

**4K · 1080p60 · HDR · MP3 · Shorts · Subtitles · SponsorBlock**

**阅读语言：** [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [日本語](README.ja.md) · **中文** · [Русский](README.ru.md) · [Українська](README.uk.md) · [हिन्दी](README.hi.md) · [বাংলা](README.bn.md) · [العربية](README.ar.md) · [O'zbekcha](README.uz.md) · [မြန်မာဘာသာ](README.my.md) · [پښتو](README.ps.md) · [Kiswahili](README.sw.md) · [አማርኛ](README.am.md) · [Afaan Oromoo](README.om.md) · [Ελληνικά](README.el.md) · [Српски](README.sr.md)

[![发布](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![构建](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) ![许可证](https://img.shields.io/badge/license-MIT-green) ![平台](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![语言](https://img.shields.io/badge/i18n-9_languages-blue)

下载任意 YouTube 视频、Shorts 或音轨，保留原始画质 — 最高 4K HDR 60 fps，或导出为 MP3 / AAC / Opus。在 Windows、macOS 和 Linux 本地运行。**无广告、无登录、无浏览器 Cookie、无 Google 账号绑定。**

[**↓ 下载最新版本**](../../releases/latest) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Arroxy 演示" width="720" />

如果 Arroxy 帮你节省了时间，点个 ⭐ 让更多人发现它。

</div>

> 🌐 这是 AI 辅助翻译。[英文 README](README.md) 是真实来源。发现错误？欢迎 [提交 PR](../../pulls)。

---

## 目录

- [为什么选 Arroxy](#why)
- [无 Cookie、无登录、无账号绑定](#no-cookies)
- [功能特性](#features)
- [下载](#download)
- [隐私](#privacy)
- [常见问题](#faq)
- [路线图](#roadmap)
- [技术栈](#tech)

---

## <a id="why"></a>为什么选 Arroxy

与最常见的替代方案逐项对比：

|                              | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------------------------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| 免费，无付费版        |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| 开源                  |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| 仅本地处理        |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| 无需登录或导出 Cookie    |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| 无使用上限                |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| 跨平台桌面应用   |   ✅   |         ✅          |     ✅      |             N/A            |         ❌         |
| 字幕 + SponsorBlock     |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy 只做一件事：粘贴链接，获取干净的本地文件。无账号、无追加销售、无数据收集。

---

## <a id="no-cookies"></a>无 Cookie、无登录、无账号绑定

这是桌面 YouTube 下载器最常见的失效原因 — 也是 Arroxy 存在的主要理由。

每当 YouTube 更新机器人检测，大多数工具会让你导出浏览器的 YouTube Cookie 作为变通方案。这有两个问题：

1. 导出的会话通常在 ~30 分钟内过期，所以你需要反复导出。
2. yt-dlp 自己的文档[警告基于 Cookie 的自动化可能会标记你的 Google 账号](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)。

**Arroxy 从不索要 Cookie、登录凭据或任何账号信息。** 它仅使用 YouTube 向任意浏览器提供的公开 Token。与你的 Google 身份无关，没有过期问题，无需轮换。

---

## <a id="features"></a>功能特性

### 画质与格式

- 最高 **4K UHD（2160p）**、1440p、1080p、720p、480p、360p
- **高帧率**原样保留 — 60 fps、120 fps、HDR
- **纯音频**导出为 MP3、AAC 或 Opus
- 快速预设：*最佳画质* · *平衡* · *小文件*

### 隐私与控制

- 100% 本地处理 — 下载直接从 YouTube 到你的硬盘
- 无登录、无 Cookie、无 Google 账号绑定
- 文件直接保存到你选择的文件夹

### 工作流

- **粘贴任意 YouTube 链接** — 视频和 Shorts 均支持
- **多任务下载队列** — 并行跟踪多个下载
- **剪贴板监控** — 复制 YouTube 链接后切回应用，Arroxy 自动填入 URL（可在高级设置中切换）
- **自动清理 URL** — 剥除跟踪参数（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）并解包 `youtube.com/redirect` 跳转链接
- **托盘模式** — 关闭窗口后下载在后台继续运行
- **9 种语言** — 自动检测系统语言，随时切换

### 字幕与后处理

- **字幕**以 SRT、VTT 或 ASS 格式下载 — 手动或自动生成，支持任意可用语言
- 保存到视频旁边、嵌入 `.mkv`，或整理到 `Subtitles/` 子文件夹
- **SponsorBlock** — 跳过或章节标记赞助商、片头、片尾、自我推广片段
- **嵌入元数据** — 标题、上传日期、频道、描述、封面图和章节标记写入文件

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="粘贴 URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="选择画质" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="选择保存位置" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="下载队列运行中" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="选择字幕语言和格式" />
</div>

---

## <a id="download"></a>下载

| 平台 | 格式 |
| -------- | ------ |
| Windows  | 安装版（NSIS）或便携版 `.exe` |
| macOS    | `.dmg`（Intel + Apple Silicon） |
| Linux    | `.AppImage` 或 `.flatpak`（沙箱） |

[**获取最新版本 →**](../../releases/latest)

### 通过包管理器安装

| 渠道  | 命令 |
| -------- | ------- |
| Winget   | `winget install AntonioOrionus.Arroxy` |
| Scoop    | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew | `brew tap antonio-orionus/arroxy && brew install --cask arroxy` |

<details>
<summary><strong>Windows：安装版 vs 便携版</strong></summary>

|                       | NSIS 安装版 | 便携版 `.exe` |
| --------------------- | :------------: | :-------------: |
| 需要安装 |      是       | 否 — 任意位置直接运行 |
| 自动更新          |   ✅ 应用内更新    |   ❌ 需手动下载 |
| 启动速度         |   ✅ 更快    |   ⚠️ 冷启动较慢 |
| 添加到开始菜单    |      ✅        |       ❌        |
| 卸载方便        |      ✅        |   ❌ 删除文件即可 |

**建议：** 使用 NSIS 安装版以获得自动更新和更快的启动速度。使用便携版 `.exe` 实现免安装、不写注册表。

</details>

<details>
<summary><strong>macOS 首次启动</strong></summary>

Arroxy 尚未代码签名，因此 macOS Gatekeeper 会在首次启动时发出警告。这是预期行为 — 并不表示文件损坏。

**系统设置方式（推荐）：**

1. 右键点击 Arroxy 应用图标，选择 **打开**。
2. 出现警告对话框 — 点击 **取消**（不要点击*移到废纸篓*）。
3. 打开 **系统设置 → 隐私与安全性**。
4. 滚动到 **安全性** 部分。你会看到 *"Arroxy 已被阻止使用，因为它不是由可识别的开发者提供的。"*
5. 点击 **仍然打开**，然后用密码或 Touch ID 确认。

完成第 5 步后，Arroxy 正常打开，以后不再显示此警告。

**终端方式（高级）：**

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

> macOS 构建通过 CI 在 Apple Silicon 和 Intel runner 上生成。如遇问题，请 [提交 issue](../../issues) — macOS 用户的反馈会直接影响 macOS 测试周期。

</details>

<details>
<summary><strong>Linux 首次启动</strong></summary>

AppImage 直接运行 — 无需安装。只需将文件标记为可执行。

**文件管理器：** 右键 `.AppImage` → **属性** → **权限** → 启用 **允许作为程序执行**，然后双击运行。

**终端：**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

如果仍无法启动，可能缺少 FUSE：

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Flatpak（沙箱版）：** 从同一发布页下载 `Arroxy-*.flatpak`。

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

</details>

---

## <a id="privacy"></a>隐私

下载通过 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 直接从 YouTube 获取到你选择的文件夹 — 不经过任何第三方服务器。观看历史、下载历史、URL 和文件内容均保留在你的设备上。

Arroxy 通过 [Aptabase](https://aptabase.com) 发送匿名聚合遥测数据 — 仅够独立项目了解是否有人在使用（启动次数、操作系统、应用版本、崩溃）。无 URL、无视频标题、无文件路径、无 IP、无账号信息 — Aptabase 开源且在设计上符合 GDPR。你可以在设置中关闭遥测。

---

## <a id="faq"></a>常见问题

**真的免费吗？**
是的 — MIT 许可证，无付费版，无功能门槛。

**能下载哪些视频画质？**
YouTube 提供的都行：4K UHD（2160p）、1440p、1080p、720p、480p、360p，以及纯音频。60 fps、120 fps 和 HDR 流原样保留。

**能将音频提取为 MP3 吗？**
可以。在格式菜单中选择*纯音频*，然后选择 MP3、AAC 或 Opus。

**需要 YouTube 账号或 Cookie 吗？**
不需要。Arroxy 仅使用 YouTube 向任意浏览器提供的公开 Token。无 Cookie、无登录、无凭据存储。详见[无 Cookie、无登录、无账号绑定](#no-cookies)，了解为何这点很重要。

**YouTube 更新后还能继续使用吗？**
两层保障：yt-dlp 在 YouTube 变化后数小时内更新，而 Arroxy 不依赖每 ~30 分钟就会过期的 Cookie。这使它比依赖导出浏览器会话的工具稳定得多。

**Arroxy 支持哪些语言？**
九种：English、Español、Deutsch、Français、日本語、中文、Русский、Українська、हिन्दी。自动检测系统语言；随时可从工具栏切换。语言文件是 `src/shared/i18n/locales/` 中的纯 TypeScript 对象 — [欢迎提交 PR](../../pulls)。

**需要额外安装其他软件吗？**
不需要。yt-dlp 和 ffmpeg 在首次启动时自动从其官方 GitHub releases 下载并缓存到本地。

**能下载播放列表或整个频道吗？**
目前支持单个视频和 Shorts。播放列表和频道支持在[路线图](#roadmap)中。

**macOS 提示"应用已损坏" — 怎么处理？**
这是 macOS Gatekeeper 在拦截未签名应用，并非真正损坏。请参见 [macOS 首次启动](#download)章节的处理步骤。

**下载 YouTube 视频合法吗？**
在大多数地区，个人私人使用一般被接受。你需要自行负责遵守 YouTube 的[服务条款](https://www.youtube.com/t/terms)及当地版权法律。

---

## <a id="roadmap"></a>路线图

即将推出 — 大致按优先级排序：

| 功能 | 描述 |
| ------- | ----------- |
| **播放列表与频道下载** | 粘贴播放列表或频道链接；支持按日期或数量过滤，将所有视频加入队列 |
| **批量 URL 输入** | 一次粘贴多个链接，全部一起运行 |
| **格式转换** | 将下载内容转换为 MP3、WAV、FLAC，无需额外工具 |
| **自定义文件名模板** | 按标题、上传者、日期、分辨率命名文件 — 带实时预览 |
| **定时下载** | 在设定时间启动队列（适合连夜批量下载） |
| **速度限制** | 限制带宽，避免下载占满你的网络连接 |
| **片段裁剪** | 按起止时间只下载视频的某一段 |

有想法？[提交请求](../../issues) — 社区意见决定优先级。

---

## <a id="tech"></a>技术栈

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — 跨平台桌面外壳
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — 样式
- **Zustand** — 状态管理
- **yt-dlp** + **ffmpeg** — 下载与混流引擎（首次启动时从 GitHub 自动获取，始终保持最新）
- **Vite** + **electron-vite** — 构建工具
- **Vitest** + **Playwright** — 单元测试与端到端测试

</details>

<details>
<summary><strong>从源码构建</strong></summary>

### 前置要求 — 所有平台

| 工具 | 版本 | 安装 |
| ---- | ------- | ------- |
| Git  | 任意     | [git-scm.com](https://git-scm.com) |
| Bun  | 最新  | 见各平台说明 |

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

无需本机构建工具 — 本项目没有原生 Node 插件。

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux（Ubuntu / Debian）

```bash
curl -fsSL https://bun.sh/install | bash

# Electron 运行时依赖
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# 仅 E2E 测试（Electron 需要显示器）
sudo apt install -y xvfb
```

### 克隆并运行

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # 热重载开发构建
```

### 打包发行版

```bash
bun run build        # 类型检查 + 编译
bun run dist         # 为当前系统打包
bun run dist:win     # 交叉编译 Windows 便携版 exe
```

> yt-dlp 和 ffmpeg 不随包附带 — 它们在首次启动时从 GitHub 获取并缓存到你的应用数据目录。

</details>

---

## 使用条款

Arroxy 仅供个人私人使用。你需要自行确保下载行为符合 YouTube 的[服务条款](https://www.youtube.com/t/terms)及你所在地区的版权法律。请勿使用 Arroxy 下载、复制或分发你不享有权利的内容。开发者对任何滥用行为不承担责任。

<div align="center">
  <sub>MIT 许可证 · 由 <a href="https://x.com/OrionusAI">@OrionusAI</a> 用心打造</sub>
</div>
