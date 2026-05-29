const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell máy tính để bàn đa nền tảng
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — tạo kiểu
- **Zustand** — quản lý trạng thái
- **yt-dlp** + **ffmpeg** — công cụ tải xuống và ghép luồng (yt-dlp được lấy lúc chạy; ffmpeg/ffprobe được đóng gói khi build)
- **Vite** + **electron-vite** — công cụ build
- **Vitest** + **Playwright** — kiểm thử đơn vị và end-to-end

</details>

<details>
<summary><strong>Build từ mã nguồn</strong></summary>

### Điều kiện tiên quyết — mọi nền tảng

| Công cụ | Phiên bản | Cài đặt |
| -------- | --------- | ------- |
| Git  | bất kỳ  | [git-scm.com](https://git-scm.com) |
| Bun  | mới nhất | xem theo từng OS bên dưới |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Không cần công cụ build gốc — dự án không có addon Node gốc.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
\`\`\`

### Clone & chạy

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
\`\`\`

### Tạo bản phân phối

\`\`\`bash
bun run build        # kiểm tra kiểu + biên dịch
bun run dist         # đóng gói cho OS hiện tại
bun run dist:win     # biên dịch chéo Windows portable exe
\`\`\`

> yt-dlp được lấy từ GitHub khi khởi động lần đầu và lưu trong thư mục dữ liệu ứng dụng. ffmpeg và ffprobe được đóng gói trong mọi bản phát hành Arroxy.

</details>`;

export const vi = {
  icon_alt: "Linh vật Arroxy",
  title: "Arroxy — Trình tải YouTube (+ 2000 trang) miễn phí và mã nguồn mở cho Windows, macOS & Linux",
  read_in_label: "Đọc bằng:",
  badge_release_alt: "Phiên bản",
  badge_build_alt: "Build",
  badge_license_alt: "Giấy phép",
  badge_platforms_alt: "Nền tảng",
  badge_i18n_alt: "Ngôn ngữ",
  badge_website_alt: "Trang web",
  hero_desc:
    "Tải xuống video, Shorts, nhạc, kênh, podcast hoặc bản nhạc từ **YouTube và hơn 2000 trang được hỗ trợ** — lên tới 4K HDR ở 60 fps, hoặc dưới dạng MP3 / AAC / Opus. Chạy hoàn toàn cục bộ trên Windows, macOS và Linux. **Không quảng cáo, không phồng to, không bán thêm.**",
  cta_latest: "↓ Tải phiên bản mới nhất",
  cta_website: "Trang web",
  demo_alt: "Demo Arroxy",
  star_cta: "Nếu Arroxy giúp bạn tiết kiệm thời gian, một ⭐ sẽ giúp người khác tìm thấy nó.",
  ai_notice: "",
  toc_heading: "Mục lục",
  why_h2: "Tại sao chọn Arroxy",
  features_h2: "Tính năng",
  dl_h2: "Tải xuống",
  privacy_h2: "Quyền riêng tư",
  faq_h2: "Câu hỏi thường gặp",
  roadmap_h2: "Lộ trình phát triển",
  tech_h2: "Được xây dựng với",
  why_intro: "So sánh trực tiếp với các lựa chọn thay thế phổ biến nhất:",
  why_r1: "Miễn phí, không có gói cao cấp",
  why_r2: "Mã nguồn mở",
  why_r3: "Chỉ xử lý cục bộ",
  why_r4: "Không cần đăng nhập hay xuất cookie",
  why_r5: "Không giới hạn sử dụng",
  why_r6: "Ứng dụng máy tính để bàn đa nền tảng",
  why_r7: "Phụ đề + SponsorBlock",
  why_summary:
    "Arroxy được xây dựng cho một mục đích duy nhất: dán URL, nhận file cục bộ sạch. Không tài khoản, không upsell, không thu thập dữ liệu.",
  feat_quality_h3: "Chất lượng & định dạng",
  feat_quality_1: "Lên tới **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Tốc độ khung hình cao** được giữ nguyên — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Chỉ âm thanh** sang MP3, M4A/AAC, Opus hoặc WAV",
  feat_quality_4: "Cài đặt nhanh: *Chất lượng tốt nhất* · *Cân bằng* · *File nhỏ*",
  feat_privacy_h3: "Quyền riêng tư & kiểm soát",
  feat_privacy_1:
    "Xử lý 100% cục bộ — tải xuống trực tiếp từ YouTube đến ổ đĩa của bạn",
  feat_privacy_2: "Không đăng nhập, không cookie, không liên kết tài khoản Google",
  feat_privacy_3: "File được lưu thẳng vào thư mục bạn chọn",
  feat_workflow_h3: "Quy trình làm việc",
  feat_workflow_1:
    "**Dán bất kỳ liên kết nào** — video YouTube, Shorts, kênh, playlist, podcast và YouTube Music, cùng hơn 2000 trang mà yt-dlp hỗ trợ; tải toàn bộ playlist hoặc chọn trước những video cụ thể",
  feat_workflow_2:
    "**Hàng đợi tải xuống nhiều luồng** — theo dõi nhiều lượt tải song song",
  feat_workflow_3:
    "**Theo dõi clipboard** — sao chép liên kết YouTube và Arroxy tự điền URL khi bạn chuyển lại ứng dụng (bật/tắt trong Cài đặt nâng cao)",
  feat_workflow_4:
    "**Tự làm sạch URL** — loại bỏ các tham số theo dõi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) và mở gói các liên kết `youtube.com/redirect`",
  feat_workflow_5:
    "**Chế độ khay hệ thống** — đóng cửa sổ vẫn tiếp tục tải xuống ở nền",
  feat_workflow_6:
    "**21 ngôn ngữ** — tự động phát hiện ngôn ngữ hệ thống, có thể đổi bất cứ lúc nào",
  feat_workflow_7:
    "**Đồng bộ danh sách phát** — quét lại danh sách phát với một thư mục cục bộ để bỏ qua các video đã tải; tạo tệp danh sách phát `.m3u` được cập nhật sau mỗi video tải xuống",
  feat_workflow_8:
    "**Chế độ thận trọng** — các preset nhịp độ có thể cấu hình (*Tắt · Cân bằng · Thận trọng · Tùy chỉnh*) thêm độ trễ giữa các yêu cầu và giới hạn fragment threads, giảm khả năng gặp bot-blocks trên danh sách phát lớn",
  feat_post_h3: "Phụ đề & hậu xử lý",
  feat_post_1:
    "**Phụ đề** dạng SRT, VTT hoặc ASS — thủ công hoặc tự tạo, trong bất kỳ ngôn ngữ nào có sẵn",
  feat_post_2:
    "Lưu cùng thư mục video, nhúng vào `.mkv`, hoặc sắp xếp vào thư mục con `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — bỏ qua hoặc đánh dấu chương cho các đoạn quảng cáo, intro, outro, tự quảng bá",
  feat_post_4:
    "**Siêu dữ liệu nhúng** — tiêu đề, ngày tải lên, kênh, mô tả, thumbnail và điểm đánh dấu chương được ghi vào file",
  feat_sites_h3: "YouTube + 2000 trang",
  feat_sites_1:
    "**YouTube đầy đủ** — Video, Shorts, Kênh, Playlist, YouTube Music và Podcast được hỗ trợ như nguồn hạng nhất",
  feat_sites_2:
    "**Hơn 2000 trang khác** qua yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org và nhiều hơn nữa",
  feat_sites_3:
    "**Chỉ âm thanh và phụ đề** hoạt động trên mọi trang được hỗ trợ, không chỉ YouTube",
  feat_sites_4:
    "Nếu một trang thay đổi, yt-dlp phát hành bản sửa lỗi hàng tuần và Arroxy tự động cập nhật nhị phân khi khởi động",
  shot1_alt: "Dán URL",
  shot2_alt: "Chọn chất lượng",
  shot3_alt: "Chọn nơi lưu",
  shot4_alt: "Hàng đợi tải xuống đang hoạt động",
  shot5_alt: "Bộ chọn ngôn ngữ và định dạng phụ đề",
  dl_platform_col: "Nền tảng",
  dl_format_col: "Định dạng",
  dl_win_format: "Trình cài đặt (NSIS) hoặc Portable `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` hoặc `.flatpak` (sandbox)",
  dl_grab: "Tải phiên bản mới nhất →",
  dl_pkg_h3: "Cài đặt qua trình quản lý gói",
  dl_channel_col: "Kênh",
  dl_command_col: "Lệnh",
  dl_win_h3: "Windows: Trình cài đặt vs Portable",
  dl_win_col_installer: "NSIS Installer",
  dl_win_col_portable: "Portable `.exe`",
  dl_win_r1: "Yêu cầu cài đặt",
  dl_win_r1_installer: "Có",
  dl_win_r1_portable: "Không — chạy từ bất cứ đâu",
  dl_win_r2: "Tự động cập nhật",
  dl_win_r2_installer: "✅ trong ứng dụng",
  dl_win_r2_portable: "❌ tải thủ công",
  dl_win_r3: "Tốc độ khởi động",
  dl_win_r3_installer: "✅ nhanh hơn",
  dl_win_r3_portable: "⚠️ khởi động lạnh chậm hơn",
  dl_win_r4: "Thêm vào Start Menu",
  dl_win_r5: "Gỡ cài đặt dễ dàng",
  dl_win_r5_portable: "❌ xóa file là xong",
  dl_win_rec:
    "**Khuyến nghị:** sử dụng NSIS installer để có tự động cập nhật và khởi động nhanh hơn. Dùng portable `.exe` nếu bạn muốn không cần cài đặt, không ghi registry.",
  dl_win_smartscreen_h4: "Cảnh báo Windows SmartScreen",
  dl_win_smartscreen_intro:
    "Khi khởi động lần đầu, bạn có thể thấy **\"Windows protected your PC\"** hoặc **\"Unknown publisher.\"** Điều này áp dụng cho cả `Arroxy-Setup-*.exe` và `Arroxy-Portable-*.exe`. Arroxy là phần mềm miễn phí và mã nguồn mở, các bản build trên Windows không được ký mã bằng chứng chỉ có phí, đó là lý do SmartScreen gắn cờ chúng. Điều này **không** tự động có nghĩa là Arroxy không an toàn. Để tiếp tục:",
  dl_win_smartscreen_step1: "Nhấp **More info**.",
  dl_win_smartscreen_step2: "Nhấp **Run anyway**.",
  dl_win_smartscreen_official:
    "Chỉ tải Arroxy từ trang GitHub Releases chính thức. Nếu bạn tải file từ trang web khác hoặc ai đó gửi cho bạn, hãy xóa nó và tải bản sao mới từ nguồn chính thức. Mã nguồn là công khai, vì vậy bạn có thể tự kiểm tra hoặc tự build Arroxy nếu muốn.",
  dl_macos_h3: "Lần đầu khởi động trên macOS",
  dl_macos_warning:
    "Arroxy chưa được ký mã, nên macOS Gatekeeper sẽ cảnh báo khi khởi động lần đầu. Đây là điều bình thường — không phải dấu hiệu file bị hỏng.",
  dl_macos_m1_h4: "Phương pháp System Settings (được khuyến nghị):",
  dl_macos_step1: "Nhấp chuột phải vào biểu tượng ứng dụng Arroxy và chọn **Open**.",
  dl_macos_step2:
    "Hộp thoại cảnh báo hiện ra — nhấp **Cancel** (đừng nhấp *Move to Trash*).",
  dl_macos_step3: "Mở **System Settings → Privacy & Security**.",
  dl_macos_step4:
    'Cuộn xuống phần **Security**. Bạn sẽ thấy *"Arroxy was blocked from use because it is not from an identified developer."*',
  dl_macos_step5:
    "Nhấp **Open Anyway** và xác nhận bằng mật khẩu hoặc Touch ID.",
  dl_macos_after:
    "Sau bước 5, Arroxy mở bình thường và cảnh báo sẽ không xuất hiện lại nữa.",
  dl_macos_m2_h4: "Phương pháp Terminal (nâng cao):",
  dl_macos_note:
    "Các bản build macOS được tạo qua CI trên máy chủ Apple Silicon và Intel. Nếu gặp sự cố, vui lòng [mở issue](../../issues) — phản hồi từ người dùng macOS ảnh hưởng trực tiếp đến chu kỳ kiểm thử macOS.",
  dl_linux_h3: "Lần đầu khởi động trên Linux",
  dl_linux_intro:
    "AppImages chạy trực tiếp — không cần cài đặt. Bạn chỉ cần đánh dấu file là có thể thực thi.",
  dl_linux_m1_text:
    "**Trình quản lý file:** nhấp chuột phải vào `.AppImage` → **Properties** → **Permissions** → bật **Allow executing file as program**, rồi nhấp đúp.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Nếu vẫn không khởi động được, bạn có thể thiếu FUSE:",
  dl_linux_flatpak_intro:
    "**Flatpak (lựa chọn thay thế sandbox):** tải `Arroxy-*.flatpak` từ cùng trang phát hành.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "Tại sao bạn có thể thấy cảnh báo",
  dl_warning_p1:
    "Arroxy là phần mềm mã nguồn mở theo giấy phép MIT. Các bản build trên Windows và macOS **không được ký mã** — chứng chỉ Apple Developer ID và Windows EV code-signing mỗi loại tốn hàng trăm đô la mỗi năm, một dự án độc lập phải tự chi trả. Không có những chữ ký đó, Windows SmartScreen và macOS Gatekeeper sẽ cảnh báo khi khởi động lần đầu. Các cảnh báo có nghĩa là *hệ điều hành của bạn không nhận ra nhà phát hành* — không có nghĩa là Arroxy là phần mềm độc hại.",
  dl_warning_p2:
    "Ba cách để tự xác minh Arroxy, theo mức độ nghiêm ngặt tăng dần:\n\n- **Đọc mã nguồn.** Mọi dòng đều có trên [GitHub](https://github.com/antonio-orionus/Arroxy) và bạn có thể [tự build từ nguồn](#tech).\n- **Kiểm tra SHA256.** So sánh file của bạn với [`SHA256SUMS`](../../releases/latest) đã công bố — xem [Xác minh tải xuống](#verify) bên dưới.\n- **Chạy quét của bên thứ ba.** Tải file lên [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Lần đầu khởi động trên Windows",
  shot_smartscreen_more_alt:
    'Hộp thoại SmartScreen "Windows protected your PC" với liên kết "More info" được làm nổi bật',
  shot_smartscreen_run_alt:
    'Hộp thoại SmartScreen sau khi mở rộng More info, hiển thị nút "Run anyway"',
  dl_win_defender_h4: "Nếu Windows Defender gắn cờ hoặc xóa file",
  dl_win_defender_p:
    "Heuristic của Defender đôi khi gắn cờ các trình cài đặt NSIS không được ký và Electron portable là đáng ngờ. Nếu Defender cách ly `Arroxy-Setup-*.exe` hoặc `Arroxy-Portable-*.exe`, hãy khôi phục nó từ **Windows Security → Virus & threat protection → Protection history**, sau đó thêm file thực thi Arroxy làm mục được phép trong **Manage settings → Add or remove exclusions**. Cũng giống SmartScreen, nguyên nhân là thiếu chữ ký nhà phát hành, không phải phần mềm độc hại bị phát hiện.",

  dl_macos_first_h3: "Lần đầu khởi động trên macOS",
  dl_macos_intro:
    "Arroxy chưa được ký mã cho macOS, vì vậy Gatekeeper sẽ chặn lần khởi động đầu tiên. Cách cho phép chính xác phụ thuộc vào phiên bản macOS của bạn — Sequoia 15 đã siết chặt cách bỏ qua cũ bằng chuột phải → Open.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 trở lên (hiện tại)",
  dl_macos_sequoia_intro:
    "Trên Sequoia 15 và mới hơn, chuột phải → Open không còn bỏ qua Gatekeeper cho nhiều ứng dụng bị cách ly. Thay vào đó, hãy dùng bảng System Settings:",
  dl_macos_sequoia_step1:
    "Kéo `Arroxy.app` từ DMG đã gắn vào `/Applications`.",
  dl_macos_sequoia_step2:
    "Nhấp đúp vào Arroxy. Hộp thoại chặn xuất hiện — nhấp **Done** (đừng nhấp *Move to Trash*).",
  dl_macos_sequoia_step3:
    'Mở **System Settings → Privacy & Security** và cuộn đến phần **Security**. Bạn sẽ thấy *"Arroxy was blocked to protect your Mac"* (hoặc thông báo gần giống).',
  dl_macos_sequoia_step4:
    "Nhấp **Open Anyway**, xác nhận bằng mật khẩu hoặc Touch ID, sau đó khởi động lại Arroxy từ `/Applications`.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 và cũ hơn",
  dl_macos_sonoma_step1:
    "Kéo `Arroxy.app` từ DMG đã gắn vào `/Applications`.",
  dl_macos_sonoma_step2:
    "Nhấp chuột phải (hoặc Control-click) vào `Arroxy.app` trong `/Applications` và chọn **Open**.",
  dl_macos_sonoma_step3:
    "Hộp thoại cảnh báo bây giờ có nút **Open** — nhấp vào đó và xác nhận. Arroxy mở bình thường và cảnh báo sẽ không xuất hiện lại nữa.",
  dl_macos_damaged_h4:
    '"App is damaged" hoặc Gatekeeper chặn liên tục — sửa bằng Terminal',
  dl_macos_damaged_p:
    'Nếu macOS báo *"Arroxy is damaged and can\'t be opened"*, hoặc không có bước nào ở trên giải quyết được, thuộc tính cách ly trên DMG là nguyên nhân (một số trình duyệt và hành vi translocation của macOS tự đặt nó). Xóa nó khỏi ứng dụng đã cài đặt:',
  dl_macos_arch_note:
    "**Apple Silicon vs Intel:** trên Mac dòng M (M1 / M2 / M3 / M4), hãy tải DMG `arm64`. Trên Mac Intel, tải DMG `x64`. Chạy bản build sai vẫn hoạt động qua Rosetta nhưng sẽ chậm hơn đáng kể.",

  dl_linux_first_h3: "Lần đầu khởi động trên Linux",
  dl_linux_appimagelauncher:
    "**Tích hợp desktop tùy chọn:** cài [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) một lần, và mọi AppImage bạn nhấp đúp sẽ tự động được đăng ký vào menu launcher — không cần tạo file `.desktop` thủ công.",

  dl_verify_h3: "Xác minh tải xuống của bạn (SHA256)",
  dl_verify_intro:
    "Mỗi bản phát hành đều công bố file `SHA256SUMS` cùng với các file nhị phân. Để kiểm tra tải xuống của bạn không bị hỏng hoặc bị giả mạo trong quá trình truyền, hãy băm file cục bộ và so sánh với dòng trong `SHA256SUMS`. Mở trang phát hành mới nhất → **Assets** → tải `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell hoặc Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Muốn quét phần mềm độc hại bên thứ ba? Tải file lên [VirusTotal](https://www.virustotal.com). Một số cờ heuristic chung từ các engine nhỏ là bình thường với ứng dụng Electron không được ký; phát hiện rộng rãi từ các engine lớn mới là mối lo ngại thực sự.",

  dl_pm_intro:
    "Đã dùng trình quản lý gói? Bạn có thể bỏ qua đường tải thủ công.",

  privacy_p1:
    "Tải xuống được lấy trực tiếp qua [yt-dlp](https://github.com/yt-dlp/yt-dlp) từ YouTube đến thư mục bạn chọn — không có gì đi qua máy chủ bên thứ ba. Lịch sử xem, lịch sử tải xuống, URL và nội dung file vẫn ở trên thiết bị của bạn.",
  privacy_p2:
    "Arroxy gửi telemetry ẩn danh, tổng hợp qua [OpenPanel](https://openpanel.dev) — vừa đủ để hiểu lượt khởi động, OS, phiên bản ứng dụng và sự cố. Không có URL, tiêu đề video, đường dẫn tệp, thông tin tài khoản, fingerprinting hay dữ liệu cá nhân. ID cho mỗi lần cài đặt là ngẫu nhiên và không gắn với danh tính của bạn. Bạn có thể tắt trong Cài đặt.",
  faq_q1: "Thực sự miễn phí không?",
  faq_a1: "Có — giấy phép MIT, không có gói cao cấp, không khóa tính năng.",
  faq_q2: "Tôi có thể tải xuống chất lượng video nào?",
  faq_a2:
    "Bất kỳ thứ gì YouTube cung cấp: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, cùng với chỉ âm thanh. Các luồng 60 fps, 120 fps và HDR được giữ nguyên.",
  faq_q3: "Tôi có thể trích xuất chỉ âm thanh dạng MP3 không?",
  faq_a3: "Có. Chọn *chỉ âm thanh* trong menu định dạng rồi chọn MP3, M4A/AAC, Opus hoặc WAV.",
  faq_q4: "Tôi có cần tài khoản YouTube hay cookie không?",
  faq_a4:
    "Mặc định là không — Arroxy hoạt động mà không cần tài khoản YouTube, đăng nhập hay xuất cookie. Hỗ trợ cookie tùy chọn có sẵn trong Cài đặt nâng cao (Cookies source: file or browser) cho nội dung yêu cầu xác thực, chẳng hạn như video giới hạn độ tuổi hoặc dành riêng cho thành viên. Mặc định tính năng này tắt. Nếu bạn bật nó, wiki của yt-dlp lưu ý rằng [tự động hóa dựa trên cookie có thể gắn cờ tài khoản Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); trong trường hợp đó, tài khoản dùng một lần là lựa chọn an toàn hơn.",
  faq_q5: "Ứng dụng có tiếp tục hoạt động khi YouTube thay đổi gì đó không?",
  faq_a5:
    "yt-dlp được cập nhật tự động khi khởi động, và Arroxy nhanh chóng phát hành các bản sửa lỗi khi YouTube thay đổi điều gì đó. Nếu bạn vẫn gặp sự cố, hỗ trợ cookie tùy chọn có sẵn trong Cài đặt nâng cao như một phương án dự phòng.",
  faq_q6: "Arroxy có sẵn bằng những ngôn ngữ nào?",
  faq_a6:
    "Hai mươi mốt ngôn ngữ, có sẵn ngay khi cài đặt: English, Español (Tây Ban Nha), Deutsch (Đức), Français (Pháp), 日本語 (Nhật), 中文 (Trung Quốc), Русский (Nga), Українська (Ukraine), हिन्दी (Hindi), Afaan Oromoo, Kiswahili, O'zbekcha (Uzbek), Tiếng Việt (Việt Nam), አማርኛ (Amharic), العربية (Ả Rập), اردو (Urdu), پښتو (Pashto), বাংলা (Bengali), မြန်မာဘာသာ (Miến Điện), Ελληνικά (Hy Lạp) và Српски (Serbia). Arroxy tự động phát hiện ngôn ngữ hệ điều hành của bạn khi khởi động lần đầu và bạn có thể chuyển đổi bất cứ lúc nào từ bộ chọn ngôn ngữ trên thanh công cụ. Các bản dịch được lưu dưới dạng đối tượng TypeScript thuần trong src/shared/i18n/locales/ — mở PR trên GitHub để đóng góp.",
  faq_q7: "Tôi có cần cài đặt thêm gì không?",
  faq_a7:
    "Không. yt-dlp được tải xuống tự động khi khởi động lần đầu và được lưu vào bộ nhớ đệm trên máy của bạn; ffmpeg và ffprobe đi kèm với ứng dụng. Sau đó, không cần thiết lập thêm gì.",
  faq_q8: "Tôi có thể tải xuống danh sách phát hoặc toàn bộ kênh không?",
  faq_a8:
    "Có — cả hai. Dán URL danh sách phát hoặc URL kênh (ví dụ `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); Arroxy liệt kê tới 500 mục, sau đó bạn xếp hàng toàn bộ danh sách hoặc chọn từng video cụ thể. Bộ lọc theo khoảng ngày và số lượng sẽ sớm ra mắt.",
  faq_q9: 'macOS báo "ứng dụng bị hỏng" — tôi phải làm gì?',
  faq_a9:
    'Đó là macOS Gatekeeper chặn ứng dụng chưa được ký, không phải file thực sự bị hỏng. Xem ["App is damaged" — sửa bằng Terminal](#macos-first-launch) để biết lệnh `xattr` một dòng giải quyết vấn đề.',
  faq_q10: "Tải video YouTube có hợp pháp không?",
  faq_a10:
    "Đối với mục đích sử dụng cá nhân, riêng tư thì nhìn chung được chấp nhận ở hầu hết các khu vực pháp lý. Bạn có trách nhiệm tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại địa phương của bạn.",
  plan_intro: "Sắp ra mắt — theo thứ tự ưu tiên:",
  plan_col1: "Tính năng",
  plan_col2: "Mô tả",
  plan_r1_name: "**Bộ lọc danh sách phát & kênh**",
  plan_r1_desc:
    "Bộ lọc theo khoảng ngày và số lượng khi liệt kê danh sách phát hoặc kênh (hiện tại giới hạn cố định là 500 mục)",
  plan_r2_name: "**Nhập URL hàng loạt**",
  plan_r2_desc: "Dán nhiều URL cùng lúc và chạy tất cả trong một lần",
  plan_r4_name: "**Mẫu tên file tùy chỉnh**",
  plan_r4_desc:
    "Đặt tên file theo tiêu đề, người tải lên, ngày, độ phân giải — với xem trước trực tiếp",
  plan_r5_name: "**Tải xuống theo lịch**",
  plan_r5_desc: "Bắt đầu hàng đợi vào thời điểm đặt trước (chạy qua đêm)",
  plan_r6_name: "**Giới hạn tốc độ**",
  plan_r6_desc: "Giới hạn băng thông để tải xuống không làm quá tải kết nối",
  plan_r7_name: "**Cắt đoạn clip**",
  plan_r7_desc: "Chỉ tải xuống một đoạn theo thời gian bắt đầu/kết thúc",
  plan_cta:
    "Bạn có ý tưởng tính năng? [Mở yêu cầu](../../issues) — ý kiến cộng đồng định hình thứ tự ưu tiên.",
  tech_content: TECH_CONTENT,
  tos_h2: "Điều khoản sử dụng",
  tos_note:
    "Arroxy là công cụ chỉ dành cho mục đích sử dụng cá nhân, riêng tư. Bạn hoàn toàn chịu trách nhiệm đảm bảo các tải xuống của mình tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại khu vực pháp lý của bạn. Không sử dụng Arroxy để tải xuống, sao chép hoặc phân phối nội dung mà bạn không có quyền sử dụng. Các nhà phát triển không chịu trách nhiệm về bất kỳ hành vi lạm dụng nào.",
  footer_credit:
    'Giấy phép MIT · Được tạo ra với tâm huyết bởi <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
