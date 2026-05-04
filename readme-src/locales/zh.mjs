const TECH_CONTENT = `<details>
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

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

无需本机构建工具 — 本项目没有原生 Node 插件。

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux（Ubuntu / Debian）

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron 运行时依赖
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# 仅 E2E 测试（Electron 需要显示器）
sudo apt install -y xvfb
\`\`\`

### 克隆并运行

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # 热重载开发构建
\`\`\`

### 打包发行版

\`\`\`bash
bun run build        # 类型检查 + 编译
bun run dist         # 为当前系统打包
bun run dist:win     # 交叉编译 Windows 便携版 exe
\`\`\`

> yt-dlp 和 ffmpeg 不随包附带 — 它们在首次启动时从 GitHub 获取并缓存到你的应用数据目录。

</details>`;

export const zh = {
  icon_alt: "Arroxy 吉祥物",
  title: "Arroxy — 免费开源 YouTube 下载器，支持 Windows、macOS 和 Linux",
  read_in_label: "阅读语言：",
  badge_release_alt: "发布",
  badge_build_alt: "构建",
  badge_license_alt: "许可证",
  badge_platforms_alt: "平台",
  badge_i18n_alt: "语言",
  hero_desc:
    "下载任意 YouTube 视频、Shorts 或音轨，保留原始画质 — 最高 4K HDR 60 fps，或导出为 MP3 / AAC / Opus。在 Windows、macOS 和 Linux 本地运行。**无广告、无登录、无浏览器 Cookie、无 Google 账号绑定。**",
  cta_latest: "↓ 下载最新版本",
  demo_alt: "Arroxy 演示",
  star_cta: "如果 Arroxy 帮你节省了时间，点个 ⭐ 让更多人发现它。",
  ai_notice:
    "> 🌐 这是 AI 辅助翻译。[英文 README](README.md) 是真实来源。发现错误？欢迎 [提交 PR](../../pulls)。",
  toc_heading: "目录",
  why_h2: "为什么选 Arroxy",
  nocookies_h2: "无 Cookie、无登录、无账号绑定",
  features_h2: "功能特性",
  dl_h2: "下载",
  privacy_h2: "隐私",
  faq_h2: "常见问题",
  roadmap_h2: "路线图",
  tech_h2: "技术栈",
  why_intro: "与最常见的替代方案逐项对比：",
  why_r1: "免费，无付费版",
  why_r2: "开源",
  why_r3: "仅本地处理",
  why_r4: "无需登录或导出 Cookie",
  why_r5: "无使用上限",
  why_r6: "跨平台桌面应用",
  why_r7: "字幕 + SponsorBlock",
  why_summary:
    "Arroxy 只做一件事：粘贴链接，获取干净的本地文件。无账号、无追加销售、无数据收集。",
  nocookies_intro:
    "这是桌面 YouTube 下载器最常见的失效原因 — 也是 Arroxy 存在的主要理由。",
  nocookies_setup:
    "每当 YouTube 更新机器人检测，大多数工具会让你导出浏览器的 YouTube Cookie 作为变通方案。这有两个问题：",
  nocookies_p1:
    "导出的会话通常在 ~30 分钟内过期，所以你需要反复导出。",
  nocookies_p2:
    "yt-dlp 自己的文档[警告基于 Cookie 的自动化可能会标记你的 Google 账号](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)。",
  nocookies_outro:
    "**Arroxy 从不索要 Cookie、登录凭据或任何账号信息。** 它仅使用 YouTube 向任意浏览器提供的公开 Token。与你的 Google 身份无关，没有过期问题，无需轮换。",
  feat_quality_h3: "画质与格式",
  feat_quality_1: "最高 **4K UHD（2160p）**、1440p、1080p、720p、480p、360p",
  feat_quality_2: "**高帧率**原样保留 — 60 fps、120 fps、HDR",
  feat_quality_3: "**纯音频**导出为 MP3、AAC 或 Opus",
  feat_quality_4: "快速预设：*最佳画质* · *平衡* · *小文件*",
  feat_privacy_h3: "隐私与控制",
  feat_privacy_1:
    "100% 本地处理 — 下载直接从 YouTube 到你的硬盘",
  feat_privacy_2: "无登录、无 Cookie、无 Google 账号绑定",
  feat_privacy_3: "文件直接保存到你选择的文件夹",
  feat_workflow_h3: "工作流",
  feat_workflow_1:
    "**粘贴任意 YouTube 链接** — 视频和 Shorts 均支持",
  feat_workflow_2:
    "**多任务下载队列** — 并行跟踪多个下载",
  feat_workflow_3:
    "**剪贴板监控** — 复制 YouTube 链接后切回应用，Arroxy 自动填入 URL（可在高级设置中切换）",
  feat_workflow_4:
    "**自动清理 URL** — 剥除跟踪参数（`si`、`pp`、`utm_*`、`fbclid`、`gclid`）并解包 `youtube.com/redirect` 跳转链接",
  feat_workflow_5:
    "**托盘模式** — 关闭窗口后下载在后台继续运行",
  feat_workflow_6:
    "**9 种语言** — 自动检测系统语言，随时切换",
  feat_post_h3: "字幕与后处理",
  feat_post_1:
    "**字幕**以 SRT、VTT 或 ASS 格式下载 — 手动或自动生成，支持任意可用语言",
  feat_post_2:
    "保存到视频旁边、嵌入 `.mkv`，或整理到 `Subtitles/` 子文件夹",
  feat_post_3:
    "**SponsorBlock** — 跳过或章节标记赞助商、片头、片尾、自我推广片段",
  feat_post_4:
    "**嵌入元数据** — 标题、上传日期、频道、描述、封面图和章节标记写入文件",
  shot1_alt: "粘贴 URL",
  shot2_alt: "选择画质",
  shot3_alt: "选择保存位置",
  shot4_alt: "下载队列运行中",
  shot5_alt: "选择字幕语言和格式",
  dl_platform_col: "平台",
  dl_format_col: "格式",
  dl_win_format: "安装版（NSIS）或便携版 `.exe`",
  dl_mac_format: "`.dmg`（Intel + Apple Silicon）",
  dl_linux_format: "`.AppImage` 或 `.flatpak`（沙箱）",
  dl_grab: "获取最新版本 →",
  dl_pkg_h3: "通过包管理器安装",
  dl_channel_col: "渠道",
  dl_command_col: "命令",
  dl_win_h3: "Windows：安装版 vs 便携版",
  dl_win_col_installer: "NSIS 安装版",
  dl_win_col_portable: "便携版 `.exe`",
  dl_win_r1: "需要安装",
  dl_win_r1_installer: "是",
  dl_win_r1_portable: "否 — 任意位置直接运行",
  dl_win_r2: "自动更新",
  dl_win_r2_installer: "✅ 应用内更新",
  dl_win_r2_portable: "❌ 需手动下载",
  dl_win_r3: "启动速度",
  dl_win_r3_installer: "✅ 更快",
  dl_win_r3_portable: "⚠️ 冷启动较慢",
  dl_win_r4: "添加到开始菜单",
  dl_win_r5: "卸载方便",
  dl_win_r5_portable: "❌ 删除文件即可",
  dl_win_rec:
    "**建议：** 使用 NSIS 安装版以获得自动更新和更快的启动速度。使用便携版 `.exe` 实现免安装、不写注册表。",
  dl_macos_h3: "macOS 首次启动",
  dl_macos_warning:
    "Arroxy 尚未代码签名，因此 macOS Gatekeeper 会在首次启动时发出警告。这是预期行为 — 并不表示文件损坏。",
  dl_macos_m1_h4: "系统设置方式（推荐）：",
  dl_macos_step1: "右键点击 Arroxy 应用图标，选择 **打开**。",
  dl_macos_step2:
    "出现警告对话框 — 点击 **取消**（不要点击*移到废纸篓*）。",
  dl_macos_step3: "打开 **系统设置 → 隐私与安全性**。",
  dl_macos_step4:
    '滚动到 **安全性** 部分。你会看到 *"Arroxy 已被阻止使用，因为它不是由可识别的开发者提供的。"*',
  dl_macos_step5:
    "点击 **仍然打开**，然后用密码或 Touch ID 确认。",
  dl_macos_after:
    "完成第 5 步后，Arroxy 正常打开，以后不再显示此警告。",
  dl_macos_m2_h4: "终端方式（高级）：",
  dl_macos_note:
    "macOS 构建通过 CI 在 Apple Silicon 和 Intel runner 上生成。如遇问题，请 [提交 issue](../../issues) — macOS 用户的反馈会直接影响 macOS 测试周期。",
  dl_linux_h3: "Linux 首次启动",
  dl_linux_intro:
    "AppImage 直接运行 — 无需安装。只需将文件标记为可执行。",
  dl_linux_m1_text:
    "**文件管理器：** 右键 `.AppImage` → **属性** → **权限** → 启用 **允许作为程序执行**，然后双击运行。",
  dl_linux_m2_h4: "终端：",
  dl_linux_fuse_text: "如果仍无法启动，可能缺少 FUSE：",
  dl_linux_flatpak_intro:
    "**Flatpak（沙箱版）：** 从同一发布页下载 `Arroxy-*.flatpak`。",
  privacy_p1:
    "下载通过 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 直接从 YouTube 获取到你选择的文件夹 — 不经过任何第三方服务器。观看历史、下载历史、URL 和文件内容均保留在你的设备上。",
  privacy_p2:
    "Arroxy 通过 [Aptabase](https://aptabase.com) 发送匿名聚合遥测数据 — 仅够独立项目了解是否有人在使用（启动次数、操作系统、应用版本、崩溃）。无 URL、无视频标题、无文件路径、无 IP、无账号信息 — Aptabase 开源且在设计上符合 GDPR。你可以在设置中关闭遥测。",
  faq_q1: "真的免费吗？",
  faq_a1: "是的 — MIT 许可证，无付费版，无功能门槛。",
  faq_q2: "能下载哪些视频画质？",
  faq_a2:
    "YouTube 提供的都行：4K UHD（2160p）、1440p、1080p、720p、480p、360p，以及纯音频。60 fps、120 fps 和 HDR 流原样保留。",
  faq_q3: "能将音频提取为 MP3 吗？",
  faq_a3: "可以。在格式菜单中选择*纯音频*，然后选择 MP3、AAC 或 Opus。",
  faq_q4: "需要 YouTube 账号或 Cookie 吗？",
  faq_a4:
    "不需要。Arroxy 仅使用 YouTube 向任意浏览器提供的公开 Token。无 Cookie、无登录、无凭据存储。详见[无 Cookie、无登录、无账号绑定](#no-cookies)，了解为何这点很重要。",
  faq_q5: "YouTube 更新后还能继续使用吗？",
  faq_a5:
    "两层保障：yt-dlp 在 YouTube 变化后数小时内更新，而 Arroxy 不依赖每 ~30 分钟就会过期的 Cookie。这使它比依赖导出浏览器会话的工具稳定得多。",
  faq_q6: "Arroxy 支持哪些语言？",
  faq_a6:
    "九种：English、Español、Deutsch、Français、日本語、中文、Русский、Українська、हिन्दी。自动检测系统语言；随时可从工具栏切换。语言文件是 `src/shared/i18n/locales/` 中的纯 TypeScript 对象 — [欢迎提交 PR](../../pulls)。",
  faq_q7: "需要额外安装其他软件吗？",
  faq_a7:
    "不需要。yt-dlp 和 ffmpeg 在首次启动时自动从其官方 GitHub releases 下载并缓存到本地。",
  faq_q8: "能下载播放列表或整个频道吗？",
  faq_a8:
    "目前支持单个视频和 Shorts。播放列表和频道支持在[路线图](#roadmap)中。",
  faq_q9: 'macOS 提示"应用已损坏" — 怎么处理？',
  faq_a9:
    "这是 macOS Gatekeeper 在拦截未签名应用，并非真正损坏。请参见 [macOS 首次启动](#download)章节的处理步骤。",
  faq_q10: "下载 YouTube 视频合法吗？",
  faq_a10:
    "在大多数地区，个人私人使用一般被接受。你需要自行负责遵守 YouTube 的[服务条款](https://www.youtube.com/t/terms)及当地版权法律。",
  plan_intro: "即将推出 — 大致按优先级排序：",
  plan_col1: "功能",
  plan_col2: "描述",
  plan_r1_name: "**播放列表与频道下载**",
  plan_r1_desc:
    "粘贴播放列表或频道链接；支持按日期或数量过滤，将所有视频加入队列",
  plan_r2_name: "**批量 URL 输入**",
  plan_r2_desc: "一次粘贴多个链接，全部一起运行",
  plan_r3_name: "**格式转换**",
  plan_r3_desc: "将下载内容转换为 MP3、WAV、FLAC，无需额外工具",
  plan_r4_name: "**自定义文件名模板**",
  plan_r4_desc:
    "按标题、上传者、日期、分辨率命名文件 — 带实时预览",
  plan_r5_name: "**定时下载**",
  plan_r5_desc: "在设定时间启动队列（适合连夜批量下载）",
  plan_r6_name: "**速度限制**",
  plan_r6_desc: "限制带宽，避免下载占满你的网络连接",
  plan_r7_name: "**片段裁剪**",
  plan_r7_desc: "按起止时间只下载视频的某一段",
  plan_cta:
    "有想法？[提交请求](../../issues) — 社区意见决定优先级。",
  tech_content: TECH_CONTENT,
  tos_h2: "使用条款",
  tos_note:
    "Arroxy 仅供个人私人使用。你需要自行确保下载行为符合 YouTube 的[服务条款](https://www.youtube.com/t/terms)及你所在地区的版权法律。请勿使用 Arroxy 下载、复制或分发你不享有权利的内容。开发者对任何滥用行为不承担责任。",
  footer_credit:
    'MIT 许可证 · 由 <a href="https://x.com/OrionusAI">@OrionusAI</a> 用心打造',
};
