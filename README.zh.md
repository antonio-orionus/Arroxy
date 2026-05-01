<!-- translated from README.md as of 2026-04-27 -->

<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy 吉祥物" width="180" />

# Arroxy — 免费开源 YouTube 下载器（油管下载器）

**阅读语言：** [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [日本語](README.ja.md) · **中文** · [Русский](README.ru.md) · [Українська](README.uk.md) · [हिन्दी](README.hi.md)

[![发布](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![构建](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) ![最近提交](https://img.shields.io/github/last-commit/antonio-orionus/Arroxy?label=Last%20commit&color=informational) ![平台](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![语言](https://img.shields.io/badge/i18n-9_种语言-blue) ![许可证](https://img.shields.io/badge/license-MIT-green) [![Scoop](https://img.shields.io/scoop/v/arroxy?bucket=https%3A%2F%2Fgithub.com%2Fantonio-orionus%2Fscoop-bucket&label=Scoop&color=blue)](https://github.com/antonio-orionus/scoop-bucket) [![Homebrew](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Homebrew&color=orange)](https://github.com/antonio-orionus/homebrew-arroxy)

**4K &nbsp;•&nbsp; 1080p60 &nbsp;•&nbsp; HDR &nbsp;•&nbsp; Shorts &nbsp;·&nbsp; Windows &nbsp;•&nbsp; macOS &nbsp;•&nbsp; Linux**

**受够了 YouTube 广告毁掉视频体验？**
任意视频或 Shorts 一键下载，画质拉满 — 4K、1080p60、HDR，应有尽有。快速、免费、完全属于你。

无广告。无追踪。无 Cookie。无需登录。零废话。

[**最新版本 →**](../../releases/latest) &nbsp;·&nbsp; [Windows](#下载) · [macOS](#下载) · [Linux](#下载)

<img src="build/demo.gif" alt="Arroxy 演示" width="720" />

</div>

> 🌐 这是 AI 辅助翻译。[英文 README](README.md) 是真实来源。发现错误？欢迎 [提交 PR](../../pulls)。

---

## 为什么选 Arroxy？

|                              | Arroxy | 浏览器扩展 | 在线转换器 | 其他下载器 |
| ---------------------------- | ------ | ---------- | ---------- | ---------- |
| 永久免费                     | ✅     | ⚠️         | ⚠️         | ✅         |
| 无广告                       | ✅     | ⚠️         | ❌         | ✅         |
| 无需账号                     | ✅     | ✅         | ⚠️         | ⚠️         |
| 离线可用 _(差不多算)_        | ✅     | ❌         | ❌         | ✅         |
| 文件保留在本地               | ✅     | ✅         | ❌         | ✅         |
| 无使用上限                   | ✅     | ⚠️         | 🚫         | ✅         |
| 开源                         | ✅     | ⚠️         | ❌         | ⚠️         |
| 永远不需要登录或 Cookie      | ✅     | ✅         | ⚠️         | ⚠️         |
| 不会有 Google 账号被封风险   | ✅     | ✅         | ⚠️         | ⚠️         |

> _"离线可用" 指的是没有任何转换发生在别人的服务器上 — 整个流程都在你的机器上跑。但你仍需联网访问 YouTube。是的，我们知道。_

> **为什么这点很重要：** 大多数桌面 YouTube 下载器在 YouTube 更新机器人检测后，最终都会要求你导出浏览器 Cookie。这些会话每 30 分钟左右就会过期 — 而 yt-dlp 自己的文档警告基于 Cookie 的自动化可能会导致你的 Google 账号被封。Arroxy 永远不会要求 Cookie、登录或任何凭据。它请求的是 YouTube 给任何真实浏览器都会发的同样的 token — 账号零风险，无过期。

Arroxy 是一款 **免费、开源、隐私优先** 的桌面应用 — 为追求简单、不要臃肿的人打造。你的下载从不经过第三方服务器。零遥测、零数据收集。粘贴 URL，一键搞定。

---

## 它能做什么

- **粘贴任意 YouTube 链接** — 视频、Shorts、什么都行 — Arroxy 几秒内拉取所有可用格式
- **挑选画质** — 最高 4K UHD（2160p）、1440p、1080p、720p、60 fps 及更高帧率，纯音频（MP3/AAC/Opus），或者用快速预设（最佳画质 / 平衡 / 小文件）
- **完整高帧率支持** — 60 fps、120 fps 和 HDR 流完整保留 YouTube 原始编码
- **选择保存位置** — 记住上次的文件夹，或者每次都重新选
- **一键下载** — 实时进度条，随时取消
- **多视频队列** — 下载面板同时跟踪所有任务
- **下载字幕** — 以 SRT、VTT 或 ASS 获取手动或自动生成的字幕，支持任何可用语言。保存到视频旁边、嵌入便携的 `.mkv`，或整理到专门的 `Subtitles/` 子文件夹中
- **SponsorBlock 集成** — 跳过或标记赞助商、片头、片尾、自我推广等片段。非破坏性地标记为章节，或使用 FFmpeg 直接剪除 — 按类别自由选择
- **9 种语言可用** — English、Español、Deutsch、Français、日本語、中文、Русский、Українська、हिन्दी — 自动检测系统语言，随时切换

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="粘贴 URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="选择画质" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="选择保存位置" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="下载队列运行中" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="选择字幕语言、格式与保存方式" />
</div>

---

## 计划中的功能

路线图上的内容 — 尚未发布，按优先级大致排序。

| 功能                       | 描述                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| **播放列表与频道下载**     | 粘贴播放列表或频道链接，一次性把所有视频加入队列，支持按日期或数量过滤    |
| **批量 URL 输入**          | 一次粘贴多个链接，全部一起开跑                                             |
| **格式转换**               | 把下载内容转成 MP3、WAV、FLAC 等格式，无需额外工具                         |
| **自定义文件名模板**       | 按标题、上传者、日期、分辨率或任意组合命名 — 带实时预览                    |
| **定时下载**               | 设定时间让 Arroxy 自动开始下载 — 适合大队列连夜跑                          |
| **下载速度限制**           | 限制带宽，避免下载占满你的网线                                             |
| **片段裁剪**               | 指定起止时间，只下载视频的某一段                                           |

> 想到了这里没有的功能？[发起一个请求](../../issues) — 社区意见决定下一步开发什么。

---

## 下载

> Arroxy 处于活跃开发中。从 [Releases](../../releases) 页面获取最新构建。

| 平台    | 格式                              |
| ------- | --------------------------------- |
| Windows | 安装版（NSIS）或便携版 `.exe`     |
| macOS   | `.dmg`（Intel + Apple Silicon）   |
| Linux   | `.AppImage`                       |

下载、运行，搞定。

### 通过包管理器安装

| 渠道     | 命令                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| Winget   | `winget install AntonioOrionus.Arroxy`（或 `winget install arroxy`）                                |
| Scoop    | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`   |
| Homebrew | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                     |

### Windows：安装版 vs 便携版

提供两种构建 — 看你需要哪种：

|                  | NSIS 安装版 | 便携版 `.exe`        |
| ---------------- | ----------- | -------------------- |
| 需要安装         | 是          | 否 — 任意位置直接运行 |
| 应用内自动更新   | ✅          | ❌ 需手动下载         |
| 启动速度         | ✅ 更快      | ⚠️ 冷启动较慢        |
| 加入开始菜单     | ✅          | ❌                    |
| 卸载方便         | ✅          | ❌ 删文件即可         |

**建议：** 想让 Arroxy 自动更新且启动更快，用 NSIS 安装版。想要免安装、不写注册表，用便携版 `.exe`。

### macOS 首次启动

> **注意：** 我没有 Mac，所以 macOS 版本我没有亲自测过。如果有什么不工作 — app 打不开、`.dmg` 损坏、隔离绕过失败 — 请 [开个 issue](../../issues) 告诉我。Mac 用户的任何反馈我都非常感谢。

Arroxy 还没做代码签名。第一次打开时 macOS 会显示安全警告 — 这是正常的，并不是文件损坏。

**方法 1：系统设置（推荐）**

| 步骤 | 操作                                                                                                                            |
| :--: | ------------------------------------------------------------------------------------------------------------------------------- |
|  1   | 在 Arroxy 图标上右键，选择 **打开**。                                                                                           |
|  2   | 出现警告对话框。点 **取消**（不要点 "移到废纸篓"）。                                                                            |
|  3   | 打开 **系统设置 → 隐私与安全性**。                                                                                              |
|  4   | 滚动到 **安全性** 部分 — 你会看到 _"Arroxy 已被阻止使用，因为它不是由可识别的开发者提供的。"_                                   |
|  5   | 点 **仍然打开**，然后用密码或 Touch ID 确认。                                                                                   |

第 5 步之后，Arroxy 正常打开，以后再也不会显示警告。

**方法 2：终端（高级）**

如果上面不管用，把 Arroxy 拖到应用程序后跑一次这个：

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

### Linux 首次启动

AppImage 不需要安装 — 直接运行。只需要先把文件标记为可执行。

**方法 1：文件管理器**

右键 `.AppImage` 文件 → **属性** → **权限** → 启用 **允许作为程序执行**，然后双击运行。

**方法 2：终端**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

如果还是启动不了，可能缺 FUSE（AppImage 需要）：

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

---

## 隐私

Arroxy 完全在你的机器上运行。下载视频时：

1. Arroxy 用 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 直接调用 YouTube 链接 — 一个可审计、始终保持最新的开源工具
2. 文件直接保存到你选的文件夹
3. 零遥测。任何东西都不会被记录、追踪或发送到任何地方 — 永远不会。

你的观看历史、下载历史和文件内容都留在你的设备上。100% 私密。

---

## 常见问题

**能下载哪些画质？**
YouTube 提供的都行 — 4K UHD（2160p）、1440p QHD、1080p Full HD、720p、480p、360p 以及纯音频。高帧率（60 fps、120 fps）和 HDR 内容原样保留。Arroxy 列出所有可用格式，让你精准挑选。

**真的免费吗？**
真的。MIT 许可证。没有付费版、没有功能门槛。

**Arroxy 支持哪些语言？**
开箱即用支持九种：English、Español（西班牙语）、Deutsch（德语）、Français（法语）、日本語（日语）、中文、Русский（俄语）、Українська（乌克兰语）、हिन्दी（印地语）。Arroxy 在首次启动时自动检测系统语言，随时可在工具栏的语言选择器中切换。想添加或改进翻译？语言文件是 `src/shared/i18n/locales/` 中的纯 TypeScript 对象 — [发个 PR](../../pulls)。

**需要装别的东西吗？**
不需要。yt-dlp 和 ffmpeg 在首次启动时从它们的官方 GitHub releases 自动下载并缓存到本地。之后无需任何额外配置。

**如果 YouTube 改了什么，还能用吗？**
能 — Arroxy 有两层保障。第一，yt-dlp 是社区里最活跃维护的开源工具之一 — YouTube 一变，几小时内就更新。第二，Arroxy 完全不依赖 Cookie 或你的 Google 账号，所以没有会话过期，没有凭据要轮换。这两点结合让它比依赖浏览器导出 Cookie 的工具稳定得多。

**能下播放列表吗？**
目前支持单个视频。播放列表和频道支持在路线图里 — 见 [计划中的功能](#计划中的功能)。

**需要我的 YouTube 账号或 Cookie 吗？**
不需要 — 这事比听起来更重要。大多数在 YouTube 更新后就罢工的工具会让你导出浏览器的 YouTube Cookie。这种方案每 30 分钟左右就坏一次（YouTube 会轮换会话），而 yt-dlp 自己的文档警告这可能让你的 Google 账号被标记。Arroxy 从不使用 Cookie 或凭据。无登录、无账号绑定，没东西过期，没东西被封。

**macOS 提示 "应用已损坏" 或 "无法打开" — 怎么办？**
这是 macOS Gatekeeper 在拦截未签名应用 — 并不是真的损坏。看 [macOS 首次启动](#macos-首次启动) 的分步指引。

**这合法吗？**
为个人使用下载视频，在大多数地区一般是被接受的。你需要自己负责遵守 YouTube 的服务条款和当地法律。

---

## 技术细节

技术细节、从源码构建说明、各平台先决条件以及如何贡献，请参见 [英文 README](README.md#tech-details)。

---

> **使用条款：** Arroxy 是供个人私人使用的工具。你需要自行确保你的下载行为符合 YouTube 的 [服务条款](https://www.youtube.com/t/terms) 和你所在地区的版权法律。请勿使用 Arroxy 下载、复制或分发你不享有权利的内容。Arroxy 的开发者对任何滥用行为不承担责任。

<div align="center">
  <sub>MIT 许可证 · 由 <a href="https://x.com/OrionusAI">@OrionusAI</a> 用心打造</sub>
</div>
