// Landing-page translations for "vi". One key per string; build.mjs
// validates parity against en.mjs at build time.
//
// Keys ending in `_html` are injected as raw HTML so translations can
// keep inline tags like <em>. Everything else is HTML-escaped.

export const vi = {
  title: "Arroxy — Tải YouTube 4K miễn phí, không cần đăng nhập",
  description:
    "Phần mềm tải YouTube miễn phí, giấy phép MIT dành cho Windows, macOS và Linux. Tải video lên tới 4K HDR ở 60 fps mà không cần tài khoản Google, cookie trình duyệt hay bất kỳ thông tin đăng nhập nào.",
  og_title: "Arroxy — Tải YouTube 4K miễn phí, không cần đăng nhập",
  og_description:
    "Phần mềm tải YouTube 4K miễn phí. Không cookie, không đăng nhập, không phiên hết hạn. Giấy phép MIT. Windows · macOS · Linux.",

  nav_features: "Tính năng",
  nav_screenshots: "Ảnh chụp màn hình",
  nav_install: "Cài đặt",
  nav_blog: "Blog",
  nav_download: "Tải xuống",

  hero_eyebrow: "Mã nguồn mở · MIT · Đang phát triển tích cực",
  hero_h1_a: "Tải YouTube 4K miễn phí.",
  hero_h1_b: "Không cookie. Không đăng nhập. Không phiên hết hạn.",
  hero_tagline:
    "Arroxy là phần mềm tải YouTube miễn phí, giấy phép MIT dành cho Windows, macOS và Linux. Tải video lên tới 4K HDR ở 60 fps — không bao giờ yêu cầu tài khoản Google, cookie trình duyệt hay bất kỳ thông tin đăng nhập nào.",
  pill_no_account: "Không cần tài khoản Google",
  pill_no_tracking: "Không theo dõi",
  pill_open_source: "Mã nguồn mở (MIT)",
  hero_trust: "Kiểm tra toàn bộ mã nguồn trên GitHub.",
  cta_download_os: "Tải xuống cho hệ điều hành của bạn",
  cta_view_github: "Xem trên GitHub",
  release_label: "Phiên bản mới nhất:",
  release_loading: "đang tải…",

  cta_download_windows: "Tải xuống cho Windows",
  cta_download_windows_portable: "Portable .exe (không cần cài đặt)",
  cta_download_mac_arm: "Tải xuống cho macOS (Apple Silicon)",
  cta_download_mac_intel: "Mac Intel? Tải DMG x64",
  cta_download_linux_appimage: "Tải xuống cho Linux (.AppImage)",
  cta_download_linux_flatpak: "Gói Flatpak →",
  cta_other_platforms: "Nền tảng khác / Tất cả bản tải xuống",
  cta_os_windows: "Windows",
  cta_os_mac: "macOS",
  cta_os_linux: "Linux",
  cta_installer_label: "Trình cài đặt",
  cta_portable_label: "Portable",
  cta_arm_label: "Apple Silicon",
  cta_intel_label: "Intel",
  mobile_notice: "Arroxy là ứng dụng máy tính để bàn cho Windows, macOS và Linux.",
  mobile_notice_sub: "Hãy truy cập trang này trên máy tính của bạn để tải xuống.",
  mobile_copy_link: "Sao chép liên kết trang",
  first_launch_label: "Hướng dẫn khởi động lần đầu",
  first_launch_mac_html:
    "macOS hiển thị cảnh báo <em>nhà phát triển không xác định</em> khi khởi động lần đầu — Arroxy chưa được ký mã. <strong>Nhấp chuột phải vào biểu tượng ứng dụng → Mở</strong>, sau đó nhấp <strong>Mở</strong> trong hộp thoại. Chỉ cần thực hiện một lần.",
  first_launch_linux_html:
    "<strong>AppImage:</strong> nhấp chuột phải vào tệp → <strong>Thuộc tính → Cho phép thực thi như chương trình</strong>, hoặc chạy <code>chmod +x Arroxy-*.AppImage</code> trong terminal. Nếu khởi động vẫn thất bại, hãy cài đặt <code>libfuse2</code> (Ubuntu/Debian), <code>fuse-libs</code> (Fedora) hoặc <code>fuse2</code> (Arch).<br><br><strong>Flatpak:</strong> <code>flatpak install --user Arroxy-*.flatpak</code>, sau đó khởi động từ menu ứng dụng hoặc chạy <code>flatpak run io.github.antonio_orionus.Arroxy</code>.",

  features_eyebrow: "Tính năng",
  features_h2: "Tất cả những gì bạn mong đợi, không có bất kỳ phiền hà nào.",
  features_sub: "Dán URL, chọn chất lượng, nhấn tải xuống. Chỉ vậy thôi.",
  f1_h: "Lên tới 4K UHD",
  f1_p: "2160p, 1440p, 1080p, 720p — mọi độ phân giải YouTube cung cấp, cộng thêm chỉ âm thanh MP3, AAC và Opus.",
  f2_h: "60 fps & HDR được bảo toàn",
  f2_p: "Luồng tốc độ khung hình cao và HDR được truyền tải chính xác như YouTube mã hóa — không mất chất lượng.",
  f3_h: "Nhiều video cùng lúc",
  f3_p: "Thêm bao nhiêu video vào hàng đợi tùy ý. Bảng tải xuống theo dõi tiến trình từng video song song.",
  f4_h: "Tự động cập nhật",
  f4_p: "Arroxy tự động giữ yt-dlp và ffmpeg luôn mới — hoạt động qua mọi thay đổi của YouTube.",
  f5_h: "9 ngôn ngữ",
  f5_p: "English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — tự động nhận diện ngôn ngữ của bạn.",
  f6_h: "Đa nền tảng",
  f6_p: "Bản dựng gốc cho Windows, macOS và Linux — trình cài đặt, portable, DMG hoặc AppImage.",
  f7_h: "Phụ đề theo ý bạn",
  f7_p: "Phụ đề thủ công hoặc tự động tạo ở định dạng SRT, VTT hoặc ASS — lưu bên cạnh video, nhúng vào tệp .mkv portable, hoặc đặt vào thư mục Subtitles/.",
  f8_h: "SponsorBlock tích hợp sẵn",
  f8_p: "Bỏ qua hoặc đánh dấu các đoạn tài trợ, intro, outro, tự quảng cáo và nhiều hơn nữa — cắt bằng FFmpeg hoặc chỉ thêm chương. Tùy bạn quyết định, theo từng danh mục.",
  f9_h: "Tự động điền từ clipboard",
  f9_p: "Sao chép liên kết YouTube bất cứ đâu và Arroxy phát hiện ngay khi bạn quay lại — hộp thoại xác nhận giúp bạn kiểm soát. Bật hoặc tắt trong Cài đặt nâng cao.",
  f10_h: "Tự động làm sạch URL",
  f10_p: "Các tham số theo dõi (si, pp, feature, utm_*, fbclid, gclid và nhiều hơn) được tự động loại bỏ khỏi liên kết YouTube được dán, và các wrapper youtube.com/redirect được mở ra — trường URL luôn hiển thị liên kết chuẩn.",
  f11_h: "Thu nhỏ xuống khay hệ thống",
  f11_p: "Đóng cửa sổ sẽ thu nhỏ Arroxy vào khay hệ thống. Các tải xuống tiếp tục chạy nền — nhấp biểu tượng khay để mở lại cửa sổ, hoặc thoát từ menu khay.",
  f12_h: "Siêu dữ liệu & ảnh bìa nhúng sẵn",
  f12_p: "Tiêu đề, ngày tải lên, nghệ sĩ, mô tả, ảnh bìa và điểm đánh dấu chương được ghi thẳng vào tệp — không cần tệp đính kèm, không cần gắn thẻ thủ công.",

  shots_eyebrow: "Xem thực tế",
  shots_h2: "Được thiết kế cho sự rõ ràng, không lộn xộn.",
  shot1_alt: "Dán URL",
  shot2_alt: "Chọn chất lượng",
  shot3_alt: "Chọn nơi lưu",
  shot4_alt: "Tải xuống song song",
  shot5_alt: "Bước phụ đề — chọn ngôn ngữ, định dạng và chế độ lưu",
  og_image_alt: "Biểu tượng ứng dụng Arroxy — phần mềm máy tính để bàn tải video YouTube ở 4K.",

  privacy_eyebrow: "Quyền riêng tư",
  privacy_h2_html: "Những gì Arroxy <em>không</em> làm.",
  privacy_sub:
    "Hầu hết các phần mềm tải YouTube đều yêu cầu cookie của bạn. Arroxy thì không bao giờ.",
  p1_h: "Không đăng nhập",
  p1_p: "Không cần tài khoản Google. Không phiên nào hết hạn. Không có nguy cơ tài khoản bị gắn cờ.",
  p2_h: "Không cookie",
  p2_p: "Arroxy yêu cầu cùng token như mọi trình duyệt. Không có gì được xuất, không có gì được lưu trữ.",
  p3_h: "Không có ID người dùng",
  p3_p: "Dữ liệu phân tích ẩn danh, chỉ trong phiên qua Aptabase — không có ID cài đặt, không có dấu vân tay, không có dữ liệu cá nhân. Lịch sử tải xuống và tệp của bạn không bao giờ rời khỏi máy tính của bạn.",
  p4_h: "Không có máy chủ bên thứ ba",
  p4_p: "Toàn bộ quy trình chạy cục bộ qua yt-dlp + ffmpeg. Các tệp không bao giờ chạm đến máy chủ từ xa.",

  install_eyebrow: "Cài đặt",
  install_h2: "Chọn kênh của bạn.",
  install_sub:
    "Tải trực tiếp hoặc qua bất kỳ trình quản lý gói lớn nào — tất cả tự động cập nhật mỗi lần phát hành.",
  badge_windows: "Windows",
  badge_macos: "macOS",
  badge_linux: "Linux",
  badge_all: "Tất cả",
  winget_desc: "Được khuyến nghị cho Windows 10/11. Tự động cập nhật cùng hệ thống.",
  scoop_desc: "Cài đặt portable qua bucket Scoop. Không cần quyền quản trị.",
  brew_desc: "Tap cask, cài đặt bằng một lệnh. Nhị phân phổ quát (Intel + Apple Silicon).",
  flatpak_h: "Flatpak",
  flatpak_desc: "Cài đặt sandbox. Tải gói .flatpak từ Releases, cài đặt bằng một lệnh. Không cần thiết lập Flathub.",
  direct_h: "Tải trực tiếp",
  direct_desc: "Trình cài đặt NSIS, .exe portable, .dmg, .AppImage hoặc .flatpak — thẳng từ GitHub Releases.",
  direct_btn: "Mở Releases →",
  copy_label: "Sao chép",
  copied_label: "Đã sao chép!",

  footer_made_by: "Giấy phép MIT · Được tạo ra với tâm huyết bởi",
  footer_github: "GitHub",
  footer_issues: "Issues",
  footer_releases: "Releases",
  footer_languages_label: "Ngôn ngữ:",

  faq_eyebrow: "FAQ",
  faq_h2: "Câu hỏi thường gặp",
  faq_q1: "Tôi có thể tải video ở những chất lượng nào?",
  faq_a1:
    "Tất cả những gì YouTube cung cấp — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p và chỉ âm thanh. Các luồng tốc độ khung hình cao (60 fps, 120 fps) và nội dung HDR được bảo toàn nguyên vẹn. Arroxy hiển thị cho bạn mọi định dạng có sẵn và cho phép bạn chọn chính xác những gì muốn tải.",
  faq_q2: "Thực sự miễn phí không?",
  faq_a2: "Có. Giấy phép MIT. Không có gói cao cấp, không có tính năng bị khóa.",
  faq_q3: "Arroxy có sẵn bằng những ngôn ngữ nào?",
  faq_a3:
    "Chín ngôn ngữ, có sẵn ngay khi cài đặt: English, Español (Tây Ban Nha), Deutsch (Đức), Français (Pháp), 日本語 (Nhật), 中文 (Trung Quốc), Русский (Nga), Українська (Ukraine) và हिन्दी (Hindi). Arroxy tự động phát hiện ngôn ngữ hệ điều hành của bạn khi khởi động lần đầu và bạn có thể chuyển đổi bất cứ lúc nào từ bộ chọn ngôn ngữ trên thanh công cụ. Các bản dịch được lưu dưới dạng đối tượng TypeScript thuần trong src/shared/i18n/locales/ — mở PR trên GitHub để đóng góp.",
  faq_q4: "Tôi có cần cài đặt thêm gì không?",
  faq_a4:
    "Không. yt-dlp và ffmpeg được tải xuống tự động khi khởi động lần đầu từ các bản phát hành chính thức trên GitHub và được lưu vào bộ nhớ đệm trên máy của bạn. Sau đó, không cần thiết lập thêm gì.",
  faq_q5: "Nó có tiếp tục hoạt động nếu YouTube thay đổi gì đó không?",
  faq_a5:
    "Có — và Arroxy có hai lớp khả năng chống chịu. Thứ nhất, yt-dlp là một trong những công cụ mã nguồn mở được duy trì tích cực nhất — nó cập nhật trong vài giờ sau khi YouTube thay đổi. Thứ hai, Arroxy hoàn toàn không phụ thuộc vào cookie hay tài khoản Google của bạn, vì vậy không có phiên nào hết hạn và không có thông tin đăng nhập nào cần xoay vòng. Sự kết hợp đó khiến nó ổn định hơn đáng kể so với các công cụ phụ thuộc vào cookie trình duyệt được xuất ra.",
  faq_q6: "Tôi có thể tải playlist không?",
  faq_a6:
    "Hiện tại chỉ hỗ trợ video đơn lẻ. Hỗ trợ playlist và kênh đang có trong lộ trình phát triển.",
  faq_q7: "Nó có cần tài khoản YouTube hay cookie của tôi không?",
  faq_a7:
    "Không — và điều đó quan trọng hơn bạn nghĩ. Hầu hết các công cụ ngừng hoạt động sau khi YouTube cập nhật đều yêu cầu bạn xuất cookie YouTube từ trình duyệt. Cách khắc phục đó bị phá vỡ sau khoảng ~30 phút khi YouTube xoay vòng phiên, và tài liệu của yt-dlp chính họ cảnh báo rằng điều đó có thể khiến tài khoản Google của bạn bị gắn cờ. Arroxy không bao giờ sử dụng cookie hay thông tin đăng nhập. Không đăng nhập. Không có tài khoản nào được liên kết. Không có gì hết hạn, không có gì bị cấm.",
  faq_q8:
    'macOS báo "ứng dụng bị hỏng" hoặc "không thể mở" — tôi phải làm gì?',
  faq_a8:
    "Đây là Gatekeeper của macOS đang chặn một ứng dụng chưa được ký — không phải hư hỏng thực sự. README có hướng dẫn từng bước để khởi động lần đầu trên macOS.",
  faq_q9: "Điều này có hợp pháp không?",
  faq_a9:
    "Tải video để sử dụng cá nhân thường được chấp nhận ở hầu hết các quốc gia. Bạn có trách nhiệm tuân thủ Điều khoản Dịch vụ của YouTube và luật pháp địa phương.",
};
