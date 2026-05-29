<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Linh vật Arroxy" width="180" />

# Arroxy — Trình tải YouTube (+ 2000 trang) miễn phí và mã nguồn mở cho Windows, macOS & Linux

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Đọc bằng:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · **Tiếng Việt** · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Phiên bản](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Trang web](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Giấy phép](https://img.shields.io/badge/license-MIT-green) ![Nền tảng](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Ngôn ngữ](https://img.shields.io/badge/i18n-21_languages-blue)

Tải xuống video, Shorts, nhạc, kênh, podcast hoặc bản nhạc từ **YouTube và hơn 2000 trang được hỗ trợ** — lên tới 4K HDR ở 60 fps, hoặc dưới dạng MP3 / AAC / Opus. Chạy hoàn toàn cục bộ trên Windows, macOS và Linux. **Không quảng cáo, không phồng to, không bán thêm.**

[**↓ Tải phiên bản mới nhất**](../../releases/latest) &nbsp;·&nbsp; [**Trang web**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Demo Arroxy" width="720" />

Nếu Arroxy giúp bạn tiết kiệm thời gian, một ⭐ sẽ giúp người khác tìm thấy nó.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

---

## Mục lục

- [Tại sao chọn Arroxy](#why)
- [Tính năng](#features)
- [Tải xuống](#download)
- [Quyền riêng tư](#privacy)
- [Câu hỏi thường gặp](#faq)
- [Lộ trình phát triển](#roadmap)
- [Được xây dựng với](#tech)

---

## <a id="why"></a>Tại sao chọn Arroxy

So sánh trực tiếp với các lựa chọn thay thế phổ biến nhất:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Miễn phí, không có gói cao cấp |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Mã nguồn mở |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Chỉ xử lý cục bộ |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Không cần đăng nhập hay xuất cookie |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Không giới hạn sử dụng |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Ứng dụng máy tính để bàn đa nền tảng |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Phụ đề + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy được xây dựng cho một mục đích duy nhất: dán URL, nhận file cục bộ sạch. Không tài khoản, không upsell, không thu thập dữ liệu.

---

## <a id="features"></a>Tính năng

### Chất lượng & định dạng

- Lên tới **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Tốc độ khung hình cao** được giữ nguyên — 60 fps, 120 fps, HDR
- **Chỉ âm thanh** sang MP3, M4A/AAC, Opus hoặc WAV
- Cài đặt nhanh: *Chất lượng tốt nhất* · *Cân bằng* · *File nhỏ*

### Quyền riêng tư & kiểm soát

- Xử lý 100% cục bộ — tải xuống trực tiếp từ YouTube đến ổ đĩa của bạn
- Không đăng nhập, không cookie, không liên kết tài khoản Google
- File được lưu thẳng vào thư mục bạn chọn

### Quy trình làm việc

- **Dán bất kỳ liên kết nào** — video YouTube, Shorts, kênh, playlist, podcast và YouTube Music, cùng hơn 2000 trang mà yt-dlp hỗ trợ; tải toàn bộ playlist hoặc chọn trước những video cụ thể
- **Hàng đợi tải xuống nhiều luồng** — theo dõi nhiều lượt tải song song
- **Theo dõi clipboard** — sao chép liên kết YouTube và Arroxy tự điền URL khi bạn chuyển lại ứng dụng (bật/tắt trong Cài đặt nâng cao)
- **Tự làm sạch URL** — loại bỏ các tham số theo dõi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) và mở gói các liên kết `youtube.com/redirect`
- **Chế độ khay hệ thống** — đóng cửa sổ vẫn tiếp tục tải xuống ở nền
- **21 ngôn ngữ** — tự động phát hiện ngôn ngữ hệ thống, có thể đổi bất cứ lúc nào
- **Đồng bộ danh sách phát** — quét lại danh sách phát với một thư mục cục bộ để bỏ qua các video đã tải; tạo tệp danh sách phát `.m3u` được cập nhật sau mỗi video tải xuống
- **Chế độ thận trọng** — các preset nhịp độ có thể cấu hình (*Tắt · Cân bằng · Thận trọng · Tùy chỉnh*) thêm độ trễ giữa các yêu cầu và giới hạn fragment threads, giảm khả năng gặp bot-blocks trên danh sách phát lớn

### Phụ đề & hậu xử lý

- **Phụ đề** dạng SRT, VTT hoặc ASS — thủ công hoặc tự tạo, trong bất kỳ ngôn ngữ nào có sẵn
- Lưu cùng thư mục video, nhúng vào `.mkv`, hoặc sắp xếp vào thư mục con `Subtitles/`
- **SponsorBlock** — bỏ qua hoặc đánh dấu chương cho các đoạn quảng cáo, intro, outro, tự quảng bá
- **Siêu dữ liệu nhúng** — tiêu đề, ngày tải lên, kênh, mô tả, thumbnail và điểm đánh dấu chương được ghi vào file

### YouTube + 2000 trang

- **YouTube đầy đủ** — Video, Shorts, Kênh, Playlist, YouTube Music và Podcast được hỗ trợ như nguồn hạng nhất
- **Hơn 2000 trang khác** qua yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org và nhiều hơn nữa
- **Chỉ âm thanh và phụ đề** hoạt động trên mọi trang được hỗ trợ, không chỉ YouTube
- Nếu một trang thay đổi, yt-dlp phát hành bản sửa lỗi hàng tuần và Arroxy tự động cập nhật nhị phân khi khởi động

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Dán URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Chọn chất lượng" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Chọn nơi lưu" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="Hàng đợi tải xuống đang hoạt động" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Bộ chọn ngôn ngữ và định dạng phụ đề" />
</div>

---

## <a id="download"></a>Tải xuống

| Nền tảng | Định dạng   |
| ------------------- | ------------------- |
| Windows             | Trình cài đặt (NSIS) hoặc Portable `.exe`   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` hoặc `.flatpak` (sandbox) |

[**Tải phiên bản mới nhất →**](../../releases/latest)

### <a id="why-warning"></a>Tại sao bạn có thể thấy cảnh báo

Arroxy là phần mềm mã nguồn mở theo giấy phép MIT. Các bản build trên Windows và macOS **không được ký mã** — chứng chỉ Apple Developer ID và Windows EV code-signing mỗi loại tốn hàng trăm đô la mỗi năm, một dự án độc lập phải tự chi trả. Không có những chữ ký đó, Windows SmartScreen và macOS Gatekeeper sẽ cảnh báo khi khởi động lần đầu. Các cảnh báo có nghĩa là *hệ điều hành của bạn không nhận ra nhà phát hành* — không có nghĩa là Arroxy là phần mềm độc hại.

Ba cách để tự xác minh Arroxy, theo mức độ nghiêm ngặt tăng dần:

- **Đọc mã nguồn.** Mọi dòng đều có trên [GitHub](https://github.com/antonio-orionus/Arroxy) và bạn có thể [tự build từ nguồn](#tech).
- **Kiểm tra SHA256.** So sánh file của bạn với [`SHA256SUMS`](../../releases/latest) đã công bố — xem [Xác minh tải xuống](#verify) bên dưới.
- **Chạy quét của bên thứ ba.** Tải file lên [VirusTotal](https://www.virustotal.com).

### <a id="windows-first-launch"></a>Lần đầu khởi động trên Windows

Khi khởi động lần đầu, bạn có thể thấy **"Windows protected your PC"** hoặc **"Unknown publisher."** Điều này áp dụng cho cả `Arroxy-Setup-*.exe` và `Arroxy-Portable-*.exe`. Arroxy là phần mềm miễn phí và mã nguồn mở, các bản build trên Windows không được ký mã bằng chứng chỉ có phí, đó là lý do SmartScreen gắn cờ chúng. Điều này **không** tự động có nghĩa là Arroxy không an toàn. Để tiếp tục:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="Hộp thoại SmartScreen "Windows protected your PC" với liên kết "More info" được làm nổi bật" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="Hộp thoại SmartScreen sau khi mở rộng More info, hiển thị nút "Run anyway"" />
</div>

1. Nhấp **More info**.
2. Nhấp **Run anyway**.

#### Nếu Windows Defender gắn cờ hoặc xóa file

Heuristic của Defender đôi khi gắn cờ các trình cài đặt NSIS không được ký và Electron portable là đáng ngờ. Nếu Defender cách ly `Arroxy-Setup-*.exe` hoặc `Arroxy-Portable-*.exe`, hãy khôi phục nó từ **Windows Security → Virus & threat protection → Protection history**, sau đó thêm file thực thi Arroxy làm mục được phép trong **Manage settings → Add or remove exclusions**. Cũng giống SmartScreen, nguyên nhân là thiếu chữ ký nhà phát hành, không phải phần mềm độc hại bị phát hiện.

> Chỉ tải Arroxy từ trang GitHub Releases chính thức. Nếu bạn tải file từ trang web khác hoặc ai đó gửi cho bạn, hãy xóa nó và tải bản sao mới từ nguồn chính thức. Mã nguồn là công khai, vì vậy bạn có thể tự kiểm tra hoặc tự build Arroxy nếu muốn.

### <a id="macos-first-launch"></a>Lần đầu khởi động trên macOS

Arroxy chưa được ký mã cho macOS, vì vậy Gatekeeper sẽ chặn lần khởi động đầu tiên. Cách cho phép chính xác phụ thuộc vào phiên bản macOS của bạn — Sequoia 15 đã siết chặt cách bỏ qua cũ bằng chuột phải → Open.

#### macOS Sequoia 15 trở lên (hiện tại)

Trên Sequoia 15 và mới hơn, chuột phải → Open không còn bỏ qua Gatekeeper cho nhiều ứng dụng bị cách ly. Thay vào đó, hãy dùng bảng System Settings:

1. Kéo `Arroxy.app` từ DMG đã gắn vào `/Applications`.
2. Nhấp đúp vào Arroxy. Hộp thoại chặn xuất hiện — nhấp **Done** (đừng nhấp *Move to Trash*).
3. Mở **System Settings → Privacy & Security** và cuộn đến phần **Security**. Bạn sẽ thấy *"Arroxy was blocked to protect your Mac"* (hoặc thông báo gần giống).
4. Nhấp **Open Anyway**, xác nhận bằng mật khẩu hoặc Touch ID, sau đó khởi động lại Arroxy từ `/Applications`.

#### macOS Sonoma 14 và cũ hơn

1. Kéo `Arroxy.app` từ DMG đã gắn vào `/Applications`.
2. Nhấp chuột phải (hoặc Control-click) vào `Arroxy.app` trong `/Applications` và chọn **Open**.
3. Hộp thoại cảnh báo bây giờ có nút **Open** — nhấp vào đó và xác nhận. Arroxy mở bình thường và cảnh báo sẽ không xuất hiện lại nữa.

#### "App is damaged" hoặc Gatekeeper chặn liên tục — sửa bằng Terminal

Nếu macOS báo *"Arroxy is damaged and can't be opened"*, hoặc không có bước nào ở trên giải quyết được, thuộc tính cách ly trên DMG là nguyên nhân (một số trình duyệt và hành vi translocation của macOS tự đặt nó). Xóa nó khỏi ứng dụng đã cài đặt:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel:** trên Mac dòng M (M1 / M2 / M3 / M4), hãy tải DMG `arm64`. Trên Mac Intel, tải DMG `x64`. Chạy bản build sai vẫn hoạt động qua Rosetta nhưng sẽ chậm hơn đáng kể.

> Các bản build macOS được tạo qua CI trên máy chủ Apple Silicon và Intel. Nếu gặp sự cố, vui lòng [mở issue](../../issues) — phản hồi từ người dùng macOS ảnh hưởng trực tiếp đến chu kỳ kiểm thử macOS.

### <a id="linux-first-launch"></a>Lần đầu khởi động trên Linux

AppImages chạy trực tiếp — không cần cài đặt. Bạn chỉ cần đánh dấu file là có thể thực thi.

**Trình quản lý file:** nhấp chuột phải vào `.AppImage` → **Properties** → **Permissions** → bật **Allow executing file as program**, rồi nhấp đúp.

**Terminal:**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

Nếu vẫn không khởi động được, bạn có thể thiếu FUSE:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Tích hợp desktop tùy chọn:** cài [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) một lần, và mọi AppImage bạn nhấp đúp sẽ tự động được đăng ký vào menu launcher — không cần tạo file `.desktop` thủ công.

**Flatpak (lựa chọn thay thế sandbox):** tải `Arroxy-*.flatpak` từ cùng trang phát hành.

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>Xác minh tải xuống của bạn (SHA256)</strong></summary>

Mỗi bản phát hành đều công bố file `SHA256SUMS` cùng với các file nhị phân. Để kiểm tra tải xuống của bạn không bị hỏng hoặc bị giả mạo trong quá trình truyền, hãy băm file cục bộ và so sánh với dòng trong `SHA256SUMS`. Mở trang phát hành mới nhất → **Assets** → tải `SHA256SUMS`.

**Windows (PowerShell hoặc Command Prompt):**

```powershell
certutil -hashfile Arroxy-Setup-<version>.exe SHA256
```

**macOS (Terminal):**

```bash
shasum -a 256 Arroxy-<version>-arm64.dmg
```

**Linux (Terminal):**

```bash
sha256sum Arroxy-*.AppImage
```

Muốn quét phần mềm độc hại bên thứ ba? Tải file lên [VirusTotal](https://www.virustotal.com). Một số cờ heuristic chung từ các engine nhỏ là bình thường với ứng dụng Electron không được ký; phát hiện rộng rãi từ các engine lớn mới là mối lo ngại thực sự.

</details>

<details>
<summary><strong>Cài đặt qua trình quản lý gói</strong></summary>

Đã dùng trình quản lý gói? Bạn có thể bỏ qua đường tải thủ công.

| Kênh | Lệnh                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-*.flatpak`                                                         |

</details>

<details>
<summary><strong>Windows: Trình cài đặt vs Portable</strong></summary>

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

## <a id="privacy"></a>Quyền riêng tư

Tải xuống được lấy trực tiếp qua [yt-dlp](https://github.com/yt-dlp/yt-dlp) từ YouTube đến thư mục bạn chọn — không có gì đi qua máy chủ bên thứ ba. Lịch sử xem, lịch sử tải xuống, URL và nội dung file vẫn ở trên thiết bị của bạn.

Arroxy gửi telemetry ẩn danh, tổng hợp qua [OpenPanel](https://openpanel.dev) — vừa đủ để hiểu lượt khởi động, OS, phiên bản ứng dụng và sự cố. Không có URL, tiêu đề video, đường dẫn tệp, thông tin tài khoản, fingerprinting hay dữ liệu cá nhân. ID cho mỗi lần cài đặt là ngẫu nhiên và không gắn với danh tính của bạn. Bạn có thể tắt trong Cài đặt.

---

## <a id="faq"></a>Câu hỏi thường gặp

**Thực sự miễn phí không?**
Có — giấy phép MIT, không có gói cao cấp, không khóa tính năng.

**Tôi có thể tải xuống chất lượng video nào?**
Bất kỳ thứ gì YouTube cung cấp: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, cùng với chỉ âm thanh. Các luồng 60 fps, 120 fps và HDR được giữ nguyên.

**Tôi có thể trích xuất chỉ âm thanh dạng MP3 không?**
Có. Chọn *chỉ âm thanh* trong menu định dạng rồi chọn MP3, M4A/AAC, Opus hoặc WAV.

**Tôi có cần tài khoản YouTube hay cookie không?**
Mặc định là không — Arroxy hoạt động mà không cần tài khoản YouTube, đăng nhập hay xuất cookie. Hỗ trợ cookie tùy chọn có sẵn trong Cài đặt nâng cao (Cookies source: file or browser) cho nội dung yêu cầu xác thực, chẳng hạn như video giới hạn độ tuổi hoặc dành riêng cho thành viên. Mặc định tính năng này tắt. Nếu bạn bật nó, wiki của yt-dlp lưu ý rằng [tự động hóa dựa trên cookie có thể gắn cờ tài khoản Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); trong trường hợp đó, tài khoản dùng một lần là lựa chọn an toàn hơn.

**Ứng dụng có tiếp tục hoạt động khi YouTube thay đổi gì đó không?**
yt-dlp được cập nhật tự động khi khởi động, và Arroxy nhanh chóng phát hành các bản sửa lỗi khi YouTube thay đổi điều gì đó. Nếu bạn vẫn gặp sự cố, hỗ trợ cookie tùy chọn có sẵn trong Cài đặt nâng cao như một phương án dự phòng.

**Arroxy có sẵn bằng những ngôn ngữ nào?**
Hai mươi mốt ngôn ngữ, có sẵn ngay khi cài đặt: English, Español (Tây Ban Nha), Deutsch (Đức), Français (Pháp), 日本語 (Nhật), 中文 (Trung Quốc), Русский (Nga), Українська (Ukraine), हिन्दी (Hindi), Afaan Oromoo, Kiswahili, O'zbekcha (Uzbek), Tiếng Việt (Việt Nam), አማርኛ (Amharic), العربية (Ả Rập), اردو (Urdu), پښتو (Pashto), বাংলা (Bengali), မြန်မာဘာသာ (Miến Điện), Ελληνικά (Hy Lạp) và Српски (Serbia). Arroxy tự động phát hiện ngôn ngữ hệ điều hành của bạn khi khởi động lần đầu và bạn có thể chuyển đổi bất cứ lúc nào từ bộ chọn ngôn ngữ trên thanh công cụ. Các bản dịch được lưu dưới dạng đối tượng TypeScript thuần trong src/shared/i18n/locales/ — mở PR trên GitHub để đóng góp.

**Tôi có cần cài đặt thêm gì không?**
Không. yt-dlp được tải xuống tự động khi khởi động lần đầu và được lưu vào bộ nhớ đệm trên máy của bạn; ffmpeg và ffprobe đi kèm với ứng dụng. Sau đó, không cần thiết lập thêm gì.

**Tôi có thể tải xuống danh sách phát hoặc toàn bộ kênh không?**
Có — cả hai. Dán URL danh sách phát hoặc URL kênh (ví dụ `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); Arroxy liệt kê tới 500 mục, sau đó bạn xếp hàng toàn bộ danh sách hoặc chọn từng video cụ thể. Bộ lọc theo khoảng ngày và số lượng sẽ sớm ra mắt.

**macOS báo "ứng dụng bị hỏng" — tôi phải làm gì?**
Đó là macOS Gatekeeper chặn ứng dụng chưa được ký, không phải file thực sự bị hỏng. Xem ["App is damaged" — sửa bằng Terminal](#macos-first-launch) để biết lệnh `xattr` một dòng giải quyết vấn đề.

**Tải video YouTube có hợp pháp không?**
Đối với mục đích sử dụng cá nhân, riêng tư thì nhìn chung được chấp nhận ở hầu hết các khu vực pháp lý. Bạn có trách nhiệm tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại địa phương của bạn.

---

## <a id="roadmap"></a>Lộ trình phát triển

Sắp ra mắt — theo thứ tự ưu tiên:

| Tính năng    | Mô tả    |
| ---------------- | ---------------- |
| **Bộ lọc danh sách phát & kênh** | Bộ lọc theo khoảng ngày và số lượng khi liệt kê danh sách phát hoặc kênh (hiện tại giới hạn cố định là 500 mục) |
| **Nhập URL hàng loạt** | Dán nhiều URL cùng lúc và chạy tất cả trong một lần |
| **Mẫu tên file tùy chỉnh** | Đặt tên file theo tiêu đề, người tải lên, ngày, độ phân giải — với xem trước trực tiếp |
| **Tải xuống theo lịch** | Bắt đầu hàng đợi vào thời điểm đặt trước (chạy qua đêm) |
| **Giới hạn tốc độ** | Giới hạn băng thông để tải xuống không làm quá tải kết nối |
| **Cắt đoạn clip** | Chỉ tải xuống một đoạn theo thời gian bắt đầu/kết thúc |

Bạn có ý tưởng tính năng? [Mở yêu cầu](../../issues) — ý kiến cộng đồng định hình thứ tự ưu tiên.

---

## <a id="tech"></a>Được xây dựng với

<details>
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

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Không cần công cụ build gốc — dự án không có addon Node gốc.

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Electron runtime deps
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Clone & chạy

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # hot-reload dev build
```

### Tạo bản phân phối

```bash
bun run build        # kiểm tra kiểu + biên dịch
bun run dist         # đóng gói cho OS hiện tại
bun run dist:win     # biên dịch chéo Windows portable exe
```

> yt-dlp được lấy từ GitHub khi khởi động lần đầu và lưu trong thư mục dữ liệu ứng dụng. ffmpeg và ffprobe được đóng gói trong mọi bản phát hành Arroxy.

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
.\Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-*.AppImage --disable-gpu
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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## Điều khoản sử dụng

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
