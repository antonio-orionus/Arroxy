<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Linh vật Arroxy" width="180" />

# Arroxy — Trình tải YouTube (+ 2000 trang) miễn phí và mã nguồn mở, có trình duyệt tích hợp, cho Windows, macOS & Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Đọc bằng:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · **Tiếng Việt** · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Phiên bản](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Trang web](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Giấy phép](https://img.shields.io/badge/license-MIT-green) ![Nền tảng](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Ngôn ngữ](https://img.shields.io/badge/i18n-31_languages-blue)

Tải xuống video, Shorts, nhạc, kênh, podcast hoặc bản nhạc từ **YouTube và hơn 2000 trang được hỗ trợ** — lên tới 8K HDR ở 60 fps, dưới dạng MP3 / AAC / Opus, hoặc chỉ đoạn bạn cần. **Duyệt YouTube hoặc bất kỳ trang nào khác ngay trong Arroxy** ở tab Explore và tải video, danh sách phát hoặc kênh bạn đang xem; đăng nhập tại đó để tải video riêng tư, dành cho thành viên và giới hạn độ tuổi mà tài khoản của bạn xem được. Chạy hoàn toàn cục bộ trên Windows, macOS và Linux. **Không quảng cáo, không phồng to, không bán thêm.**

[**↓ Tải phiên bản mới nhất**](#install) &nbsp;·&nbsp; [**Trang web**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Lần đầu khởi động trên Windows](#windows-first-launch) · [Lần đầu khởi động trên macOS](#macos-first-launch) · [Lần đầu khởi động trên Linux](#linux-first-launch)

[![Tham gia cộng đồng Discord](https://img.shields.io/badge/Tham%20gia%20c%E1%BB%99ng%20%C4%91%E1%BB%93ng%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Nếu Arroxy giúp bạn tiết kiệm thời gian, một ⭐ sẽ giúp người khác tìm thấy nó.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

---

## Mục lục

- [✨ Tính năng](#features)
- [📥 Cài đặt và lần khởi chạy đầu tiên](#install)
  - [Lần đầu khởi động trên Windows](#windows-first-launch)
  - [Lần đầu khởi động trên macOS](#macos-first-launch)
  - [Tại sao bạn có thể thấy cảnh báo](#why-warning)
  - [Lần đầu khởi động trên Linux](#linux-first-launch)
  - [Xác minh tải xuống của bạn (SHA256)](#verify)
- [⚖️ Tại sao chọn Arroxy](#why)
- [🔒 Quyền riêng tư](#privacy)
- [❓ Câu hỏi thường gặp](#faq)
- [🗺️ Lộ trình phát triển](#roadmap)
- [💖 Ủng hộ Arroxy](#support)
- [🛠️ Được xây dựng với](#tech)

---

## <a id="features"></a>✨ Tính năng

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Duyệt YouTube hoặc bất kỳ trang nào khác ngay trong Arroxy và tải trang bạn đang xem bằng hồ sơ đang dùng</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Màn hình đầu tiên của Explore</b><br/>Giới thiệu nhanh về Explore, và lý do tài khoản phụ là cách đăng nhập an toàn hơn</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Tải xuống cho bạn biết điều gì cần bạn xử lý</b><br/>Liên kết được chuẩn bị ở chế độ nền; liên kết lỗi sẽ đề xuất cách khắc phục, danh sách phát dài chờ bạn lựa chọn</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Chỉ tải một phần của video</b><br/>Chọn điểm bắt đầu và kết thúc, hoặc một chương — Arroxy chỉ lưu đoạn đó</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Trình chỉnh sửa hồ sơ</b><br/>Tinh chỉnh một hồ sơ: loại tệp, độ phân giải, phụ đề, nơi lưu, mẫu tên tệp và nhiều hơn nữa</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Tối hoặc sáng, kính hoặc đơn sắc</b><br/>Bốn giao diện để chọn: các khung kính trên bầu trời chuyển động hoặc bề mặt đơn sắc yên tĩnh, mỗi kiểu đều có tối và sáng</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Phím tắt tải xuống toàn cục của Arroxy — Ctrl+Shift+D trên Windows và Linux, Cmd+Shift+D trên macOS, đưa liên kết đã sao chép thẳng vào hàng đợi tải xuống" width="760" /></picture><br/><sub><b>Phím tắt tải xuống toàn cục</b><br/>Sao chép liên kết ở bất cứ đâu, nhấn một lần — nó vào hàng đợi và bắt đầu tải</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Hồ sơ theo từng video trong danh sách phát</b><br/>Cho mỗi video một hồ sơ riêng — lưu một số ở 4K, lấy phần còn lại dạng MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Trang Tải nhanh</b><br/>Dán URL và tải ngay với hồ sơ đang dùng</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Hồ sơ tải tái sử dụng</b><br/>Lưu định dạng, chất lượng và đầu ra thành cài sẵn — dùng lại cho mỗi lần tải</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Bản âm thanh đa ngôn ngữ</b><br/>Chọn đúng ngôn ngữ âm thanh video cung cấp</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Âm thanh Surround / Dolby</b><br/>Nhận diện và giữ nguyên bản 5.1 và Dolby</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Chế độ URL hàng loạt</b><br/>Dán danh sách, tự loại trùng, xếp hàng tất cả cùng lúc</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Hàng đợi tải song song</b><br/>Nhiều lượt tải cùng lúc với tiến trình trực tiếp</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: duyệt web ngay trong Arroxy</strong></summary>

- **Tab Explore** — duyệt YouTube hoặc bất kỳ trang nào khác ngay trong Arroxy và tải những gì bạn tìm thấy mà không cần sao chép liên kết. **Tải xuống · *hồ sơ của bạn*** đưa video, danh sách phát hoặc kênh bạn đang xem vào hàng đợi; mũi tên bên cạnh để đổi hồ sơ, còn cây đũa phép mở trình tải từng bước để chọn định dạng, phụ đề, v.v.
- **Nhấp chuột phải để tải** — nhấp chuột phải vào bất kỳ liên kết video, danh sách phát hoặc kênh nào trong Explore để tải bằng hồ sơ của bạn, chọn hồ sơ khác trong **Tải xuống với**, mở trình tải từng bước hoặc sao chép liên kết. Không cần mở từng video trước
- **Bố cục thu gọn** — một cú nhấp trên thanh công cụ của Explore chuyển các tab của Arroxy vào đó và cho trang thêm không gian
- **Thanh địa chỉ** — gõ để tìm kiếm trên YouTube, hoặc nhập bất kỳ địa chỉ web nào để mở trang đó
- **Tải video cần tài khoản** — đăng nhập một lần trong Explore là Arroxy có thể tải video riêng tư và video dành cho thành viên mà tài khoản của bạn xem được, video giới hạn độ tuổi nếu tài khoản đã xác minh tuổi, cùng danh sách Xem sau và Video đã thích của bạn. Bạn cũng có thể đăng nhập các trang khác tại đó, và các lượt tải từ những trang này sẽ dùng đăng nhập đó khi cần. Arroxy vẫn tải trước tiên khi chưa đăng nhập và chỉ dùng đăng nhập Explore của bạn khi một lượt tải thất bại theo cách mà tài khoản có thể khắc phục. Khi YouTube yêu cầu xác nhận bạn không phải robot, Arroxy cũng thử dùng đăng nhập Explore của bạn
- **Dùng tài khoản phụ** — màn hình đầu tiên của Explore giải thích lý do: tải bằng tài khoản có một chút rủi ro tài khoản đó bị hạn chế. Hãy đăng xuất khỏi Explore trong Cài đặt bất cứ khi nào bạn muốn xóa các thông tin đăng nhập
- **Trình chặn quảng cáo** — tắt theo mặc định. Một cú nhấp vào biểu tượng khiên trên thanh công cụ của Explore sẽ chặn quảng cáo và trình theo dõi trên các trang của nó mà không ảnh hưởng đến việc tải xuống. YouTube có thể phản ứng với trình chặn quảng cáo đối với tài khoản đã đăng nhập

</details>

<details>
<summary><strong>🎞️ Chất lượng & định dạng</strong></summary>

- Lên tới **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Tốc độ khung hình cao và HDR** được giữ nguyên — 60 fps, HDR10
- **Âm thanh** — xuất chỉ âm thanh thành MP3, M4A/AAC, Opus hoặc WAV. Trong tải xuống tương tác, chọn các bản âm thanh surround/Dolby gốc của nguồn (AC-3, E-AC-3, 5.1, DRC) khi có sẵn, hoặc đặt mặc định toàn cục **Ưu tiên surround / Dolby**
- **Hồ sơ theo mục tiêu** — *Hình ảnh đẹp nhất* (AV1 · VP9) hoặc *TV thông minh* (MP4 · H.264), lưu dưới dạng Tự động, MP4, MKV hoặc WebM mà không mã hóa lại. HDR là *Tự động* (chỉ khi màn hình của bạn hiển thị được), *SDR* hoặc *HDR*
- **Mọi codec ở mọi độ phân giải** — trình tải từng bước liệt kê AV1, VP9 và H.264 cạnh nhau ở từng độ phân giải, để bạn chọn loại mà TV hoặc phần mềm chỉnh sửa của bạn phát được
- **Biết một luồng thực sự là gì** — các kích thước YouTube nâng cấp bằng AI, ngôn ngữ âm thanh lồng tiếng bằng AI, luồng bitrate nâng cao, video 360° và các bản bị hỏng hoặc có hình mờ đều được đánh dấu. Hồ sơ bỏ qua luồng nâng cấp bằng AI trừ khi bạn cho phép

</details>

<details>
<summary><strong>🛡️ Quyền riêng tư & kiểm soát</strong></summary>

- Xử lý 100% cục bộ — tải xuống trực tiếp từ YouTube đến ổ đĩa của bạn
- Không đăng nhập, không cookie, không liên kết tài khoản Google
- File được lưu thẳng vào thư mục bạn chọn

</details>

<details>
<summary><strong>⚡ Quy trình làm việc</strong></summary>

- **Phím tắt tải xuống toàn cục** — sao chép một liên kết trong bất kỳ ứng dụng nào rồi nhấn `Ctrl+Shift+D` (`Cmd+Shift+D` trên macOS); Arroxy đưa nó vào hàng đợi với hồ sơ đang dùng mà không mở cửa sổ, và một thông báo xác nhận. Bật sẵn, có thể đổi phím
- **Chế độ bắt đầu linh hoạt** — chọn tải một video có hướng dẫn, bộ chọn playlist/kênh, dán URL hàng loạt, Quick Download với mặc định đã lưu, hoặc duyệt và tải từ Explore
- **Hàng đợi tải xuống trung tâm** — mọi tác vụ đơn lẻ, playlist, hàng loạt hoặc nhanh đều vào một nơi để theo dõi tiến độ, tạm dừng, tiếp tục, hủy, thử lại và điều chỉnh ưu tiên
- **Theo dõi clipboard** — sao chép liên kết video và nó được điền vào ô URL khi bạn quay lại Arroxy, kèm **Hoàn tác** nếu bạn không có ý đó. Khi Arroxy đang bận, liên kết sẽ chờ đến khi bạn quay lại tab URL (tắt trong Cài đặt)
- **Tự làm sạch URL** — loại bỏ các tham số theo dõi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) và mở gói các liên kết `youtube.com/redirect`
- **Chế độ khay hệ thống** — đóng cửa sổ vẫn tiếp tục tải xuống ở nền
- **31 ngôn ngữ** — tự động phát hiện ngôn ngữ hệ thống, có thể đổi bất cứ lúc nào
- **Đồng bộ danh sách phát** — quét lại danh sách phát với một thư mục cục bộ để bỏ qua các video đã tải; tạo tệp danh sách phát `.m3u` được cập nhật sau mỗi video tải xuống
- **Điều khiển tốc độ và nhịp tải** — giới hạn băng thông tải xuống, đặt số phần của video được tải cùng lúc và thêm độ trễ giữa các yêu cầu với các thiết lập sẵn (*Tắt · Cân bằng · Thận trọng · Tùy chỉnh*)
- **Mẫu tên tệp** — đặt tên tệp tải về theo ý bạn với `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` và `{playlist_index}`, áp dụng chung hoặc theo từng hồ sơ tải xuống
- **Tải cùng lúc và tự động thử lại** — chọn bao nhiêu mục trong hàng đợi được tải cùng lúc, và để Arroxy thử lại một mục gặp sự cố mạng hoặc máy chủ, chờ lâu hơn trước mỗi lần thử
- **Hồ sơ theo từng video trong danh sách phát** — gán cho mỗi video trong danh sách phát hồ sơ tải riêng thay vì một cài đặt chung cho cả danh sách, để một lượt tải có thể lưu trữ một số video ở chất lượng đầy đủ và lấy phần còn lại dưới dạng MP3
- **Quick Download chạy nền** — liên kết hiện ngay trong Tải xuống và được chuẩn bị tại đó, một thông báo có nút **Xem** xác nhận, và ô URL được xóa để nhập liên kết tiếp theo. Bạn có thể bắt đầu bao nhiêu lượt tùy ý trong khi các lượt trước vẫn đang chuẩn bị
- **Tải xuống cho bạn biết điều gì cần bạn xử lý** — nếu Arroxy không đọc được một liên kết, dòng của nó nêu lý do và đề xuất cách khắc phục: Thử lại, bật cookie hoặc đăng nhập trong Explore. Khi cookie tắt, **Đăng nhập bằng Explore** sẽ thử lại giúp bạn sau khi bạn đã đăng nhập. Danh sách phát dài hơn giới hạn tải sẽ chờ trên dòng của nó để bạn chọn toàn bộ, vài video đầu, hoặc xem lại. Tab Tải xuống đếm số dòng đang chờ bạn
- **Chỉ tải một đoạn của video** — chọn điểm bắt đầu và kết thúc, hoặc một chương, trên màn hình Format và Arroxy chỉ lưu đoạn đó, tên tệp ghi khoảng thời gian sau ID video. Điểm cắt rơi vào keyframe gần nhất; bật cắt chính xác để mã hóa lại thay vào đó
- **Tự động gỡ các mục tải xuống đã xong** — tùy chọn: mục tải xuống đã xong sẽ rời khỏi danh sách sau 5 giây. Tệp của nó vẫn còn trên ổ đĩa, còn các mục tải xuống thất bại vẫn nằm trong danh sách
- **Kích thước và Thiếu trong Tải xuống** — cột **Kích thước** có thể sắp xếp cho biết mỗi mục chiếm bao nhiêu dung lượng, còn **Thiếu** đánh dấu các tệp bị di chuyển hoặc xóa bên ngoài Arroxy
- **Aurora hoặc Tối giản, tối hoặc sáng** — các bảng kính trên bầu trời chuyển động, hoặc các bề mặt đặc yên tĩnh; chuyển đổi từ chân trang. Máy tính không có tăng tốc đồ họa sẽ tự động dùng Tối giản
- **Thanh menu Mac** — trên macOS, mở Cài đặt (`Cmd+,`), đặt giới hạn tốc độ tải, đổi kiểu và giao diện, rồi mở nhật ký hoặc lưu tệp chẩn đoán từ thanh menu
- **Đổi hồ sơ từ bất kỳ lượt tải nào** — tinh chỉnh một lượt tải, rồi cập nhật hồ sơ ban đầu của nó (có xem trước những gì thay đổi) hoặc lưu cài đặt thành hồ sơ mới. Khi đổi hồ sơ, Arroxy hỏi bạn có giữ các chỉnh sửa không

</details>

<details>
<summary><strong>📝 Phụ đề & hậu xử lý</strong></summary>

- **Phụ đề** dạng SRT, VTT hoặc ASS — thủ công hoặc tự tạo, trong bất kỳ ngôn ngữ nào có sẵn
- Lưu cùng thư mục video, nhúng vào `.mkv`, hoặc sắp xếp vào thư mục con `Subtitles/`
- **Lô chỉ phụ đề** — dán danh sách URL hoặc mở danh sách phát, chọn Phụ đề và chỉ nhận các tệp phụ đề cho mỗi video
- **SponsorBlock** — bỏ qua hoặc đánh dấu chương cho các đoạn quảng cáo, intro, outro, tự quảng bá
- **Siêu dữ liệu nhúng** — tiêu đề, ngày tải lên, kênh, mô tả, thumbnail và điểm đánh dấu chương được ghi vào file

</details>

<details>
<summary><strong>🌐 YouTube + 2000 trang</strong></summary>

- **YouTube đầy đủ** — Video, Shorts, Kênh, Playlist, YouTube Music và Podcast được hỗ trợ như nguồn hạng nhất
- **Hơn 2000 trang khác** qua yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable và nhiều hơn nữa
- **Chỉ âm thanh và phụ đề** hoạt động trên mọi trang được hỗ trợ, không chỉ YouTube
- Nếu một trang thay đổi, yt-dlp phát hành bản sửa lỗi hàng tuần và Arroxy tự động cập nhật nhị phân khi khởi động

</details>

---

## <a id="install"></a>📥 Cài đặt và lần khởi chạy đầu tiên

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

Bản dựng chỉ dành cho x86_64. Không có `curl`? Thay `curl -fsSL` bằng `wget -qO-`.

| Nền tảng | Định dạng |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Tải phiên bản mới nhất →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Lần đầu khởi động trên Windows</strong></summary>

Khi khởi động lần đầu, bạn có thể thấy **"Windows protected your PC"** hoặc **"Unknown publisher."** Điều này áp dụng cho cả `Arroxy-win-x64-Setup.exe` và `Arroxy-win-x64-Portable.exe`. Arroxy là phần mềm miễn phí và mã nguồn mở, các bản build trên Windows không được ký mã bằng chứng chỉ có phí, đó là lý do SmartScreen gắn cờ chúng. Điều này **không** tự động có nghĩa là Arroxy không an toàn. Để tiếp tục:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="Hộp thoại SmartScreen "Windows protected your PC" với liên kết "More info" được làm nổi bật" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="Hộp thoại SmartScreen sau khi mở rộng More info, hiển thị nút "Run anyway"" />
</div>

1. Nhấp **More info**.
2. Nhấp **Run anyway**.

#### Nếu Windows Defender gắn cờ hoặc xóa file

Heuristic của Defender đôi khi gắn cờ các trình cài đặt NSIS không được ký và Electron portable là đáng ngờ. Nếu Defender cách ly `Arroxy-win-x64-Setup.exe` hoặc `Arroxy-win-x64-Portable.exe`, hãy khôi phục nó từ **Windows Security → Virus & threat protection → Protection history**, sau đó thêm file thực thi Arroxy làm mục được phép trong **Manage settings → Add or remove exclusions**. Cũng giống SmartScreen, nguyên nhân là thiếu chữ ký nhà phát hành, không phải phần mềm độc hại bị phát hiện.

> Chỉ tải Arroxy từ trang GitHub Releases chính thức. Nếu bạn tải file từ trang web khác hoặc ai đó gửi cho bạn, hãy xóa nó và tải bản sao mới từ nguồn chính thức. Mã nguồn là công khai, vì vậy bạn có thể tự kiểm tra hoặc tự build Arroxy nếu muốn.

Bạn thích Scoop hơn? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Lần đầu khởi động trên macOS</strong></summary>

Arroxy chưa được ký mã cho macOS, vì vậy Gatekeeper có thể hiển thị hộp thoại đáng sợ *"Arroxy.app is damaged and can't be opened"* sau khi bạn cài từ DMG. Thông báo này nghĩa là macOS đã đưa một ứng dụng chưa ký vào quarantine; không có nghĩa là tệp ứng dụng thật sự bị hỏng. Trên macOS hiện tại, cách đáng tin cậy là dùng Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Kéo `Arroxy.app` từ DMG đã gắn vào `/Applications`.
2. Mở Terminal và chạy hai lệnh này:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Lệnh đầu tiên xóa thuộc tính quarantine khỏi bản Arroxy đã cài. Lệnh thứ hai khởi chạy ứng dụng. `sudo` có thể hỏi mật khẩu Mac; Terminal sẽ không hiển thị ký tự khi bạn nhập.

**Apple Silicon vs Intel:** trên Mac dòng M (M1 / M2 / M3 / M4), hãy tải DMG `arm64`. Trên Mac Intel, tải DMG `x64`. Chạy bản build sai vẫn hoạt động qua Rosetta nhưng sẽ chậm hơn đáng kể.

> Các bản build macOS được tạo qua CI trên máy chủ Apple Silicon và Intel. Nếu gặp sự cố, vui lòng [mở issue](../../issues) — phản hồi từ người dùng macOS ảnh hưởng trực tiếp đến chu kỳ kiểm thử macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Tại sao bạn có thể thấy cảnh báo</strong></summary>

Arroxy là phần mềm mã nguồn mở theo giấy phép MIT. Các bản build trên Windows và macOS **không được ký mã** — chứng chỉ Apple Developer ID và Windows EV code-signing mỗi loại tốn hàng trăm đô la mỗi năm, một dự án độc lập phải tự chi trả. Không có những chữ ký đó, Windows SmartScreen và macOS Gatekeeper sẽ cảnh báo khi khởi động lần đầu. Các cảnh báo có nghĩa là *hệ điều hành của bạn không nhận ra nhà phát hành* — không có nghĩa là Arroxy là phần mềm độc hại.

Ba cách để tự xác minh Arroxy, theo mức độ nghiêm ngặt tăng dần:

- **Đọc mã nguồn.** Mọi dòng đều có trên [GitHub](https://github.com/antonio-orionus/Arroxy) và bạn có thể [tự build từ nguồn](#tech).
- **Kiểm tra SHA256.** So sánh file của bạn với [`SHA256SUMS`](../../releases/latest) đã công bố — xem [Xác minh tải xuống](#verify) bên dưới.
- **Chạy quét của bên thứ ba.** Tải file lên [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Lần đầu khởi động trên Linux</strong></summary>

AppImages chạy trực tiếp — không cần cài đặt. Bạn chỉ cần đánh dấu file là có thể thực thi.

**Trình quản lý file:** nhấp chuột phải vào `.AppImage` → **Properties** → **Permissions** → bật **Allow executing file as program**, rồi nhấp đúp.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Nếu vẫn không khởi động được, hãy chạy mà không cần gắn kết — không cần gói FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Tích hợp desktop tùy chọn:** cài [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) một lần, và mọi AppImage bạn nhấp đúp sẽ tự động được đăng ký vào menu launcher — không cần tạo file `.desktop` thủ công.

**Tarball thuần (không FUSE, không cài đặt):**

Bản `.tar.gz` chính là ứng dụng đó nhưng không có lớp vỏ AppImage — giải nén ở đâu cũng được rồi chạy. Không cần trình cài đặt, không cần gói FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Các bản tải Linux trên trang phát hành chỉ có x86_64.** Trên máy ARM64 (Raspberry Pi, Asahi Linux), Flatpak vẫn cài được nhưng khi khởi chạy sẽ lỗi `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Xác minh tải xuống của bạn (SHA256)</strong></summary>

Mỗi bản phát hành đều công bố file `SHA256SUMS` cùng với các file nhị phân. Để kiểm tra tải xuống của bạn không bị hỏng hoặc bị giả mạo trong quá trình truyền, hãy băm file cục bộ và so sánh với dòng trong `SHA256SUMS`. Mở trang phát hành mới nhất → **Assets** → tải `SHA256SUMS`.

**Windows (PowerShell hoặc Command Prompt):**

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

Muốn quét phần mềm độc hại bên thứ ba? Tải file lên [VirusTotal](https://www.virustotal.com). Một số cờ heuristic chung từ các engine nhỏ là bình thường với ứng dụng Electron không được ký; phát hiện rộng rãi từ các engine lớn mới là mối lo ngại thực sự.

</details>

<details>
<summary><strong>📦 Windows: Trình cài đặt vs Portable</strong></summary>

|               | NSIS Installer | Portable `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Yêu cầu cài đặt | Có  | Không — chạy từ bất cứ đâu  |
| Tự động cập nhật | ✅ trong ứng dụng  | ❌ tải thủ công  |
| Tốc độ khởi động | ✅ nhanh hơn  | ⚠️ khởi động lạnh chậm hơn  |
| Thêm vào Start Menu |            ✅            |           ❌            |
| Gỡ cài đặt dễ dàng |            ✅            | ❌ xóa file là xong  |

**Khuyến nghị:** sử dụng NSIS installer để có tự động cập nhật và khởi động nhanh hơn. Dùng portable `.exe` nếu bạn muốn không cần cài đặt, không ghi registry.

</details>

---

## <a id="why"></a>⚖️ Tại sao chọn Arroxy

So sánh trực tiếp với các lựa chọn thay thế phổ biến nhất:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Trình duyệt tích hợp (duyệt, đăng nhập, tải xuống) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Video riêng tư, dành cho thành viên và giới hạn độ tuổi mà không cần xuất cookie |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Miễn phí, không có gói cao cấp |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Mã nguồn mở |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Chỉ xử lý cục bộ |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Không giới hạn sử dụng |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Ứng dụng máy tính để bàn đa nền tảng |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Phụ đề + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = một phần, hoặc chỉ có ở gói trả phí. Đăng nhập trong ứng dụng để tải video riêng tư của 4K Video Downloader là tính năng trả phí; hầu hết các GUI yt-dlp miễn phí chỉ nhận file cookie hoặc đọc cookie từ trình duyệt web của bạn.

Arroxy được xây dựng cho một mục đích duy nhất: một file cục bộ sạch, dù bạn dán URL hay tìm thấy video trong Explore. Không upsell, không thu thập dữ liệu.

### <a id="why-explore"></a>🧭 Điều mà một trình bao yt-dlp đơn thuần không làm được: tab Explore

Hầu hết các trình tải YouTube miễn phí chỉ là một ô nhập URL đặt trên yt-dlp. Arroxy cũng dùng yt-dlp, nhưng còn có **Explore**, một trình duyệt tích hợp sẵn trong ứng dụng, mở được YouTube hoặc bất kỳ trang nào khác. Explore vượt qua những giới hạn mà một ô nhập URL không làm được:

- **Video cần tài khoản, không cần xuất cookie** — video riêng tư, video dành cho thành viên và video giới hạn độ tuổi (với tài khoản đã xác minh tuổi), cùng danh sách Xem sau và Video đã thích của bạn, cùng video cần đăng nhập trên các trang khác. Một trình bao đơn thuần cần bạn xuất cookies.txt hoặc phải đọc cookie từ trình duyệt web của bạn, điều mà Chrome trên Windows hiện đã chặn. Với Arroxy, bạn chỉ cần đăng nhập một lần trong Explore và nó lo phần còn lại
- **"Đăng nhập để xác nhận bạn không phải là bot"** — khi YouTube yêu cầu điều này, Arroxy thử tải lại bằng đăng nhập Explore của bạn thay vì báo thất bại
- **Token tải xuống của YouTube** — trình duyệt tích hợp của Arroxy lấy token mà YouTube cần trước mỗi lượt tải. Thiếu nó, YouTube có thể cung cấp ít định dạng hơn và chất lượng thấp hơn mức bạn yêu cầu
- **Không cần sao chép liên kết** — tìm video, danh sách phát hoặc kênh trong Explore rồi tải chỉ với một cú nhấp, hoặc nhấp chuột phải vào bất kỳ liên kết nào trên trang
- **Trình chặn quảng cáo khi bạn cần** — chỉ một cú nhấp vào biểu tượng khiên là Explore chặn quảng cáo và trình theo dõi trên các trang của nó

---

## <a id="privacy"></a>🔒 Quyền riêng tư

Tải xuống được lấy trực tiếp qua [yt-dlp](https://github.com/yt-dlp/yt-dlp) từ YouTube đến thư mục bạn chọn — không có gì đi qua máy chủ bên thứ ba. Lịch sử xem, lịch sử tải xuống, URL và nội dung file vẫn ở trên thiết bị của bạn.

Không có telemetry — chỉ một tín hiệu ẩn danh mỗi ngày: phiên bản ứng dụng, OS, ngôn ngữ, kênh cài đặt và quốc gia, để chúng tôi đếm số người dùng đang hoạt động. Không có ID, URL, tiêu đề video, đường dẫn tệp hay thông tin tài khoản. Bạn có thể tắt trong Cài đặt.

Explore giữ các đăng nhập riêng, tách biệt với trình duyệt của bạn, và Arroxy không bao giờ đọc hay điền biểu mẫu đăng nhập — bạn nhập trực tiếp vào trang của chính trang web đó. Các lượt tải chạy khi chưa đăng nhập; chỉ khi một lượt tải thất bại theo cách mà tài khoản có thể khắc phục, Arroxy mới đọc lại thông tin đăng nhập, lưu vào một tệp tạm cho lượt tải đó và xóa tệp sau đó. Đăng xuất khỏi Explore trong Cài đặt sẽ xóa các thông tin này.

---

## <a id="faq"></a>❓ Câu hỏi thường gặp

<details>
<summary><strong>Thực sự miễn phí không?</strong></summary>

Có — giấy phép MIT, không có gói cao cấp, không khóa tính năng.

</details>

<details>
<summary><strong>Arroxy khác gì so với các GUI yt-dlp khác?</strong></summary>

Hầu hết các GUI yt-dlp miễn phí chỉ là trình bao nhận liên kết. Arroxy bổ sung **Explore**, một trình duyệt tích hợp sẵn trong ứng dụng, mở được YouTube hoặc bất kỳ trang nào khác: bạn vừa duyệt vừa tải mà không cần sao chép liên kết, và chỉ cần đăng nhập ở đó một lần để tải video riêng tư, video dành cho thành viên, video giới hạn độ tuổi cùng danh sách Xem sau và Video đã thích của bạn, không cần xuất cookie. Arroxy dùng đăng nhập đó khi YouTube yêu cầu bạn xác nhận mình không phải robot, và trình duyệt tích hợp của nó lấy token tải xuống của YouTube để các lượt tải không bị giảm xuống còn ít định dạng hơn. Xem [Tại sao chọn Arroxy](#why).

</details>

<details>
<summary><strong>Tôi có thể tải xuống chất lượng video nào?</strong></summary>

Bất kỳ thứ gì YouTube cung cấp: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, cùng với chỉ âm thanh. Các luồng 60 fps và HDR được giữ nguyên, và trình tải từng bước cho phép bạn chọn AV1, VP9 hoặc H.264 ở từng độ phân giải.

</details>

<details>
<summary><strong>Tôi có thể trích xuất chỉ âm thanh dạng MP3 không?</strong></summary>

Có. Chọn *chỉ âm thanh* trong menu định dạng rồi chọn MP3, M4A/AAC, Opus hoặc WAV.

</details>

<details>
<summary><strong>Làm sao để tải video cần tài khoản YouTube?</strong></summary>

Hãy đăng nhập một lần trong tab Explore. Sau đó Arroxy có thể tải video riêng tư và video dành cho thành viên mà tài khoản của bạn xem được, video giới hạn độ tuổi nếu tài khoản đã xác minh tuổi, cùng danh sách Xem sau và Video đã thích của bạn. Arroxy chỉ dùng đăng nhập này khi một lượt tải thất bại theo cách mà tài khoản có thể khắc phục; mọi thứ khác vẫn tải như trước. Đây là lựa chọn **Đăng nhập Explore** trong cài đặt cookie, được xếp đầu tiên và gắn nhãn Khuyên dùng, và Arroxy tự chọn nó cho bạn lần đầu bạn mở Explore. Wiki của yt-dlp lưu ý rằng [tự động hóa khi đã đăng nhập có thể gắn cờ tài khoản Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), nên tài khoản phụ là lựa chọn an toàn hơn.

</details>

<details>
<summary><strong>Ứng dụng có tiếp tục hoạt động khi YouTube thay đổi gì đó không?</strong></summary>

yt-dlp được cập nhật tự động khi khởi động, và Arroxy nhanh chóng phát hành các bản sửa lỗi khi YouTube thay đổi điều gì đó. Khi YouTube yêu cầu xác nhận bạn không phải robot, Arroxy cũng thử dùng đăng nhập Explore nếu bạn đã đăng nhập ở đó, và cookie từ tệp hoặc trình duyệt có sẵn trong cài đặt cookie.

</details>

<details>
<summary><strong>Arroxy có sẵn bằng những ngôn ngữ nào?</strong></summary>

31 ngôn ngữ có sẵn ngay: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy tự động phát hiện ngôn ngữ hệ điều hành của bạn trong lần khởi chạy đầu tiên, và bạn có thể đổi bất cứ lúc nào từ bộ chọn ngôn ngữ trên thanh công cụ. Runtime locale JSON nằm trong src/shared/i18n/locales/, còn catalog PO dành cho người dịch nằm trong i18n/locales/ — hãy mở PR trên GitHub để đóng góp.

</details>

<details>
<summary><strong>Tôi có cần cài đặt thêm gì không?</strong></summary>

Không. yt-dlp, ffmpeg và ffprobe được tải xuống tự động khi khởi động lần đầu và được lưu vào bộ nhớ đệm trên máy của bạn. Sau đó, không cần thiết lập thêm gì.

</details>

<details>
<summary><strong>Tôi có thể tải xuống danh sách phát hoặc toàn bộ kênh không?</strong></summary>

Có — cả hai. Dán URL playlist hoặc kênh (ví dụ `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); chọn số mục cần quét, rồi đưa cả danh sách vào hàng đợi hoặc chọn từng video. Bộ lọc theo khoảng ngày sẽ có sớm.

</details>

<details>
<summary><strong>macOS báo "ứng dụng bị hỏng" — tôi phải làm gì?</strong></summary>

Đó là macOS Gatekeeper chặn ứng dụng chưa được ký, không phải file thật sự bị hỏng. Xem [macOS first launch](#macos-first-launch) để biết các lệnh Terminal xóa quarantine và khởi chạy Arroxy.

</details>

<details>
<summary><strong>Tải video YouTube có hợp pháp không?</strong></summary>

Đối với mục đích sử dụng cá nhân, riêng tư thì nhìn chung được chấp nhận ở hầu hết các khu vực pháp lý. Bạn có trách nhiệm tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại địa phương của bạn.

</details>

---

## <a id="roadmap"></a>🗺️ Lộ trình phát triển

Vẫn được lên kế hoạch — theo thứ tự ưu tiên tương đối:

| Tính năng    | Mô tả    |
| ---------------- | ---------------- |
| **Bộ lọc danh sách phát & kênh** | Bộ lọc khoảng ngày khi liệt kê playlist hoặc kênh |
| **Tùy chọn track âm thanh YouTube** | Đặt tùy chọn track ngôn ngữ nói cho toàn app, với override theo từng profile khi YouTube cung cấp nhiều track âm thanh |
| **Khôi phục retry mạnh hơn** | Một đường retry mới cho các lượt tải xuống bị gián đoạn bởi kết nối internet không ổn định hoặc có vấn đề |
| **Drawer quản lý tải xuống đầy đủ** | Biến queue drawer thành manager đầy đủ hơn, bao gồm đổi thư mục đích cho các mục đang chờ |
| **Tải xuống theo lịch** | Bắt đầu hàng đợi vào thời điểm đặt trước (chạy qua đêm) |
| **Gói AUR** | Cài đặt trên Arch Linux và Omarchy bằng `yay -S arroxy-bin` |

Bạn có ý tưởng tính năng? [Mở yêu cầu](../../issues) — ý kiến cộng đồng định hình thứ tự ưu tiên.

---

## <a id="support"></a>💖 Ủng hộ Arroxy

Arroxy miễn phí và có giấy phép MIT — không quảng cáo, không telemetry, không bản trả phí. Nếu nó giúp bạn tiết kiệm thời gian, bạn có thể ủng hộ việc phát triển bằng Bitcoin, Tron hoặc Ethereum: địa chỉ nằm trong [DONATE.md](DONATE.md), nguồn chính thức duy nhất cho các địa chỉ này. Arroxy sẽ không bao giờ gửi cho bạn địa chỉ qua email hay tin nhắn riêng. Gắn sao cho kho mã, báo lỗi và cải thiện bản dịch cũng giúp ích không kém.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Được xây dựng với

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell máy tính để bàn đa nền tảng
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — tạo kiểu
- **Zustand** — quản lý trạng thái
- **yt-dlp** + **ffmpeg** — công cụ tải xuống và ghép luồng (cả hai đều được lấy lúc chạy: yt-dlp luôn được cập nhật, ffmpeg/ffprobe được cài một lần và giữ nguyên qua các lần cập nhật)
- **Vite** + **electron-vite** — công cụ build
- **Vitest** + **Playwright** — kiểm thử đơn vị và end-to-end

</details>

<details>
<summary><strong>Build từ mã nguồn</strong></summary>

### Điều kiện tiên quyết — mọi nền tảng

| Công cụ | Phiên bản | Cài đặt |
| -------- | --------- | ------- |
| Git     | bất kỳ  | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` hoặc `.node-version` |
| Bun     | 1.4.2  | `mise install` hoặc `package.json` `packageManager` |

Khuyến nghị: cài `mise`, rồi chạy `mise install` trong checkout. Nếu không dùng mise, hãy kích hoạt thủ công Node.js từ `.node-version` và Bun từ `package.json` trước `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools và Python có thể cần cho các rebuild gốc.

### macOS

```bash
brew install mise
xcode-select --install
```

Sau khi clone, chạy `mise trust && mise install` trong checkout. Nếu shell của bạn đã dùng `fnm`, `nvm`, hoặc Bun từ Homebrew, hãy kích hoạt mise trong `~/.zshrc` để Arroxy dùng Node.js 24.21.0 và Bun 1.4.2:

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Phụ thuộc build và runtime Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Clone & chạy

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # khuyến nghị; bỏ qua nếu đã kích hoạt thủ công các công cụ đã ghim
bun run bootstrap
bun run doctor
bun run dev            # app Electron với Vite renderer
```

### Tạo bản phân phối

```bash
bun run build        # kiểm tra kiểu + biên dịch
bun run dist         # đóng gói cho OS hiện tại
bun run dist:win     # đóng gói mục tiêu Windows trên host được hỗ trợ
```

> `bun run bootstrap` cài dependencies, rebuild dependencies của app Electron, xác minh Electron, chuẩn bị ffmpeg/ffprobe nhúng cho phát triển và cài Playwright Chromium. Các bản phát hành quản lý yt-dlp, ffmpeg và ffprobe lúc runtime trong thư mục dữ liệu ứng dụng; không cái nào được đóng gói trong trình cài đặt.

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

## 📜 Điều khoản sử dụng

Arroxy là công cụ chỉ dành cho mục đích sử dụng cá nhân, riêng tư. Bạn hoàn toàn chịu trách nhiệm đảm bảo các tải xuống của mình tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại khu vực pháp lý của bạn. Không sử dụng Arroxy để tải xuống, sao chép hoặc phân phối nội dung mà bạn không có quyền sử dụng. Các nhà phát triển không chịu trách nhiệm về bất kỳ hành vi lạm dụng nào.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Giấy phép MIT · Được tạo ra với tâm huyết bởi <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
