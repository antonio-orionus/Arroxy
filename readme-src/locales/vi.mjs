const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell máy tính để bàn đa nền tảng
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — tạo kiểu
- **Zustand** — quản lý trạng thái
- **yt-dlp** + **ffmpeg** — công cụ tải xuống và ghép luồng (lấy từ GitHub khi khởi động lần đầu, luôn cập nhật)
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

> yt-dlp và ffmpeg không được đóng gói sẵn — chúng được tải từ GitHub khi khởi động lần đầu và lưu vào thư mục dữ liệu ứng dụng của bạn.

</details>`;

export const vi = {
  icon_alt: "Linh vật Arroxy",
  title: "Arroxy — Trình tải video YouTube miễn phí và mã nguồn mở cho Windows, macOS & Linux",
  read_in_label: "Đọc bằng:",
  badge_release_alt: "Phiên bản",
  badge_build_alt: "Build",
  badge_license_alt: "Giấy phép",
  badge_platforms_alt: "Nền tảng",
  badge_i18n_alt: "Ngôn ngữ",
  hero_desc:
    "Tải xuống bất kỳ video YouTube, Short hay bản nhạc nào ở chất lượng gốc — lên tới 4K HDR ở 60 fps, hoặc dưới dạng MP3 / AAC / Opus. Chạy hoàn toàn cục bộ trên Windows, macOS và Linux. **Không quảng cáo, không đăng nhập, không cookie trình duyệt, không liên kết tài khoản Google.**",
  cta_latest: "↓ Tải phiên bản mới nhất",
  demo_alt: "Demo Arroxy",
  star_cta: "Nếu Arroxy giúp bạn tiết kiệm thời gian, một ⭐ sẽ giúp người khác tìm thấy nó.",
  ai_notice: "",
  toc_heading: "Mục lục",
  why_h2: "Tại sao chọn Arroxy",
  nocookies_h2: "Không cookie, không đăng nhập, không liên kết tài khoản",
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
  nocookies_intro:
    "Đây là lý do phổ biến nhất khiến các trình tải video YouTube trên máy tính ngừng hoạt động — và cũng là lý do chính Arroxy ra đời.",
  nocookies_setup:
    "Khi YouTube cập nhật hệ thống phát hiện bot, hầu hết các công cụ sẽ yêu cầu bạn xuất cookie YouTube từ trình duyệt như một cách khắc phục. Hai vấn đề với cách đó:",
  nocookies_p1:
    "Phiên đã xuất thường hết hạn sau ~30 phút, nên bạn phải xuất lại liên tục.",
  nocookies_p2:
    "Tài liệu của chính yt-dlp [cảnh báo rằng tự động hóa dựa trên cookie có thể gắn cờ tài khoản Google của bạn](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy không bao giờ yêu cầu cookie, đăng nhập hay bất kỳ thông tin xác thực nào.** Nó chỉ sử dụng các token công khai mà YouTube cung cấp cho bất kỳ trình duyệt nào. Không có gì liên kết với danh tính Google của bạn, không có gì hết hạn, không có gì cần thay thế.",
  feat_quality_h3: "Chất lượng & định dạng",
  feat_quality_1: "Lên tới **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Tốc độ khung hình cao** được giữ nguyên — 60 fps, 120 fps, HDR",
  feat_quality_3: "Xuất **chỉ âm thanh** sang MP3, AAC hoặc Opus",
  feat_quality_4: "Cài đặt nhanh: *Chất lượng tốt nhất* · *Cân bằng* · *File nhỏ*",
  feat_privacy_h3: "Quyền riêng tư & kiểm soát",
  feat_privacy_1:
    "Xử lý 100% cục bộ — tải xuống trực tiếp từ YouTube đến ổ đĩa của bạn",
  feat_privacy_2: "Không đăng nhập, không cookie, không liên kết tài khoản Google",
  feat_privacy_3: "File được lưu thẳng vào thư mục bạn chọn",
  feat_workflow_h3: "Quy trình làm việc",
  feat_workflow_1:
    "**Dán bất kỳ URL YouTube nào** — hỗ trợ cả video lẫn Shorts",
  feat_workflow_2:
    "**Hàng đợi tải xuống nhiều luồng** — theo dõi nhiều lượt tải song song",
  feat_workflow_3:
    "**Theo dõi clipboard** — sao chép liên kết YouTube và Arroxy tự điền URL khi bạn chuyển lại ứng dụng (bật/tắt trong Cài đặt nâng cao)",
  feat_workflow_4:
    "**Tự làm sạch URL** — loại bỏ các tham số theo dõi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) và mở gói các liên kết `youtube.com/redirect`",
  feat_workflow_5:
    "**Chế độ khay hệ thống** — đóng cửa sổ vẫn tiếp tục tải xuống ở nền",
  feat_workflow_6:
    "**9 ngôn ngữ** — tự động phát hiện ngôn ngữ hệ thống, có thể đổi bất cứ lúc nào",
  feat_post_h3: "Phụ đề & hậu xử lý",
  feat_post_1:
    "**Phụ đề** dạng SRT, VTT hoặc ASS — thủ công hoặc tự tạo, trong bất kỳ ngôn ngữ nào có sẵn",
  feat_post_2:
    "Lưu cùng thư mục video, nhúng vào `.mkv`, hoặc sắp xếp vào thư mục con `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — bỏ qua hoặc đánh dấu chương cho các đoạn quảng cáo, intro, outro, tự quảng bá",
  feat_post_4:
    "**Siêu dữ liệu nhúng** — tiêu đề, ngày tải lên, kênh, mô tả, thumbnail và điểm đánh dấu chương được ghi vào file",
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
  privacy_p1:
    "Tải xuống được lấy trực tiếp qua [yt-dlp](https://github.com/yt-dlp/yt-dlp) từ YouTube đến thư mục bạn chọn — không có gì đi qua máy chủ bên thứ ba. Lịch sử xem, lịch sử tải xuống, URL và nội dung file vẫn ở trên thiết bị của bạn.",
  privacy_p2:
    "Arroxy gửi telemetry ẩn danh, tổng hợp qua [Aptabase](https://aptabase.com) — vừa đủ để một dự án indie biết có ai đang thực sự dùng hay không (số lần khởi động, OS, phiên bản ứng dụng, sự cố). Không có URL, không có tiêu đề video, không có đường dẫn file, không có IP, không có thông tin tài khoản — Aptabase là mã nguồn mở và thân thiện GDPR theo thiết kế. Bạn có thể từ chối trong Cài đặt.",
  faq_q1: "Thực sự miễn phí không?",
  faq_a1: "Có — giấy phép MIT, không có gói cao cấp, không khóa tính năng.",
  faq_q2: "Tôi có thể tải xuống chất lượng video nào?",
  faq_a2:
    "Bất kỳ thứ gì YouTube cung cấp: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, cùng với chỉ âm thanh. Các luồng 60 fps, 120 fps và HDR được giữ nguyên.",
  faq_q3: "Tôi có thể trích xuất chỉ âm thanh dạng MP3 không?",
  faq_a3: "Có. Chọn *chỉ âm thanh* trong menu định dạng và chọn MP3, AAC hoặc Opus.",
  faq_q4: "Tôi có cần tài khoản YouTube hay cookie không?",
  faq_a4:
    "Không. Arroxy chỉ sử dụng các token công khai mà YouTube cung cấp cho bất kỳ trình duyệt nào. Không cookie, không đăng nhập, không lưu thông tin xác thực. Xem [Không cookie, không đăng nhập, không liên kết tài khoản](#no-cookies) để hiểu tại sao điều này quan trọng.",
  faq_q5: "Ứng dụng có tiếp tục hoạt động khi YouTube thay đổi gì đó không?",
  faq_a5:
    "Hai lớp bảo vệ: yt-dlp cập nhật trong vòng vài giờ sau khi YouTube thay đổi, và Arroxy không phụ thuộc vào cookie hết hạn sau ~30 phút. Điều này khiến nó ổn định hơn đáng kể so với các công cụ phụ thuộc vào phiên trình duyệt đã xuất.",
  faq_q6: "Arroxy có sẵn bằng những ngôn ngữ nào?",
  faq_a6:
    "Chín ngôn ngữ: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Tự động phát hiện ngôn ngữ hệ thống; có thể đổi bất cứ lúc nào từ thanh công cụ. Các file locale là các đối tượng TypeScript thuần túy trong `src/shared/i18n/locales/` — [PR luôn được chào đón](../../pulls).",
  faq_q7: "Tôi có cần cài đặt thêm gì không?",
  faq_a7:
    "Không. yt-dlp và ffmpeg được tải xuống tự động khi khởi động lần đầu từ các bản phát hành GitHub chính thức của chúng và lưu vào bộ nhớ đệm cục bộ.",
  faq_q8: "Tôi có thể tải xuống danh sách phát hoặc toàn bộ kênh không?",
  faq_a8:
    "Hiện tại chỉ hỗ trợ video đơn lẻ và Shorts. Hỗ trợ danh sách phát và kênh có trong [lộ trình phát triển](#roadmap).",
  faq_q9: 'macOS báo "ứng dụng bị hỏng" — tôi phải làm gì?',
  faq_a9:
    "Đó là macOS Gatekeeper chặn ứng dụng chưa được ký, không phải file thực sự bị hỏng. Xem phần [lần đầu khởi động trên macOS](#download) để biết cách xử lý.",
  faq_q10: "Tải video YouTube có hợp pháp không?",
  faq_a10:
    "Đối với mục đích sử dụng cá nhân, riêng tư thì nhìn chung được chấp nhận ở hầu hết các khu vực pháp lý. Bạn có trách nhiệm tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại địa phương của bạn.",
  plan_intro: "Sắp ra mắt — theo thứ tự ưu tiên:",
  plan_col1: "Tính năng",
  plan_col2: "Mô tả",
  plan_r1_name: "**Tải danh sách phát & kênh**",
  plan_r1_desc:
    "Dán URL danh sách phát hoặc kênh; xếp hàng tất cả video với bộ lọc ngày hoặc số lượng",
  plan_r2_name: "**Nhập URL hàng loạt**",
  plan_r2_desc: "Dán nhiều URL cùng lúc và chạy tất cả trong một lần",
  plan_r3_name: "**Chuyển đổi định dạng**",
  plan_r3_desc: "Chuyển đổi tải xuống sang MP3, WAV, FLAC mà không cần công cụ riêng",
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
