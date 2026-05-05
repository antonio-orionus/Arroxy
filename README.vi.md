<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Linh vật Arroxy" width="180" />

# Arroxy — Trình tải video YouTube miễn phí và mã nguồn mở cho Windows, macOS & Linux

**4K · 1080p60 · HDR · MP3 · Shorts · Subtitles · SponsorBlock**

**Đọc bằng:** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · **Tiếng Việt** · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Phiên bản](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Trang web](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Giấy phép](https://img.shields.io/badge/license-MIT-green) ![Nền tảng](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Ngôn ngữ](https://img.shields.io/badge/i18n-21_languages-blue)

Tải xuống bất kỳ video YouTube, Short hay bản nhạc nào ở chất lượng gốc — lên tới 4K HDR ở 60 fps, hoặc dưới dạng MP3 / AAC / Opus. Chạy hoàn toàn cục bộ trên Windows, macOS và Linux. **Không quảng cáo, không đăng nhập, không cookie trình duyệt, không liên kết tài khoản Google.**

[**↓ Tải phiên bản mới nhất**](../../releases/latest) &nbsp;·&nbsp; [**Trang web**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Demo Arroxy" width="720" />

Nếu Arroxy giúp bạn tiết kiệm thời gian, một ⭐ sẽ giúp người khác tìm thấy nó.

</div>

---

## Mục lục

- [Tại sao chọn Arroxy](#why)
- [Không cookie, không đăng nhập, không liên kết tài khoản](#no-cookies)
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

## <a id="no-cookies"></a>Không cookie, không đăng nhập, không liên kết tài khoản

Đây là lý do phổ biến nhất khiến các trình tải video YouTube trên máy tính ngừng hoạt động — và cũng là lý do chính Arroxy ra đời.

Khi YouTube cập nhật hệ thống phát hiện bot, hầu hết các công cụ sẽ yêu cầu bạn xuất cookie YouTube từ trình duyệt như một cách khắc phục. Hai vấn đề với cách đó:

1. Phiên đã xuất thường hết hạn sau ~30 phút, nên bạn phải xuất lại liên tục.
2. Tài liệu của chính yt-dlp [cảnh báo rằng tự động hóa dựa trên cookie có thể gắn cờ tài khoản Google của bạn](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).

**Arroxy không bao giờ yêu cầu cookie, đăng nhập hay bất kỳ thông tin xác thực nào.** Nó chỉ sử dụng các token công khai mà YouTube cung cấp cho bất kỳ trình duyệt nào. Không có gì liên kết với danh tính Google của bạn, không có gì hết hạn, không có gì cần thay thế.

---

## <a id="features"></a>Tính năng

### Chất lượng & định dạng

- Lên tới **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Tốc độ khung hình cao** được giữ nguyên — 60 fps, 120 fps, HDR
- Xuất **chỉ âm thanh** sang MP3, AAC hoặc Opus
- Cài đặt nhanh: *Chất lượng tốt nhất* · *Cân bằng* · *File nhỏ*

### Quyền riêng tư & kiểm soát

- Xử lý 100% cục bộ — tải xuống trực tiếp từ YouTube đến ổ đĩa của bạn
- Không đăng nhập, không cookie, không liên kết tài khoản Google
- File được lưu thẳng vào thư mục bạn chọn

### Quy trình làm việc

- **Dán bất kỳ URL YouTube nào** — hỗ trợ cả video lẫn Shorts
- **Hàng đợi tải xuống nhiều luồng** — theo dõi nhiều lượt tải song song
- **Theo dõi clipboard** — sao chép liên kết YouTube và Arroxy tự điền URL khi bạn chuyển lại ứng dụng (bật/tắt trong Cài đặt nâng cao)
- **Tự làm sạch URL** — loại bỏ các tham số theo dõi (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) và mở gói các liên kết `youtube.com/redirect`
- **Chế độ khay hệ thống** — đóng cửa sổ vẫn tiếp tục tải xuống ở nền
- **9 ngôn ngữ** — tự động phát hiện ngôn ngữ hệ thống, có thể đổi bất cứ lúc nào

### Phụ đề & hậu xử lý

- **Phụ đề** dạng SRT, VTT hoặc ASS — thủ công hoặc tự tạo, trong bất kỳ ngôn ngữ nào có sẵn
- Lưu cùng thư mục video, nhúng vào `.mkv`, hoặc sắp xếp vào thư mục con `Subtitles/`
- **SponsorBlock** — bỏ qua hoặc đánh dấu chương cho các đoạn quảng cáo, intro, outro, tự quảng bá
- **Siêu dữ liệu nhúng** — tiêu đề, ngày tải lên, kênh, mô tả, thumbnail và điểm đánh dấu chương được ghi vào file

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

### Cài đặt qua trình quản lý gói

| Kênh | Lệnh                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |

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

<details>
<summary><strong>Lần đầu khởi động trên macOS</strong></summary>

Arroxy chưa được ký mã, nên macOS Gatekeeper sẽ cảnh báo khi khởi động lần đầu. Đây là điều bình thường — không phải dấu hiệu file bị hỏng.

**Phương pháp System Settings (được khuyến nghị):**

1. Nhấp chuột phải vào biểu tượng ứng dụng Arroxy và chọn **Open**.
2. Hộp thoại cảnh báo hiện ra — nhấp **Cancel** (đừng nhấp *Move to Trash*).
3. Mở **System Settings → Privacy & Security**.
4. Cuộn xuống phần **Security**. Bạn sẽ thấy *"Arroxy was blocked from use because it is not from an identified developer."*
5. Nhấp **Open Anyway** và xác nhận bằng mật khẩu hoặc Touch ID.

Sau bước 5, Arroxy mở bình thường và cảnh báo sẽ không xuất hiện lại nữa.

**Phương pháp Terminal (nâng cao):**

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

> Các bản build macOS được tạo qua CI trên máy chủ Apple Silicon và Intel. Nếu gặp sự cố, vui lòng [mở issue](../../issues) — phản hồi từ người dùng macOS ảnh hưởng trực tiếp đến chu kỳ kiểm thử macOS.

</details>

<details>
<summary><strong>Lần đầu khởi động trên Linux</strong></summary>

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

**Flatpak (lựa chọn thay thế sandbox):** tải `Arroxy-*.flatpak` từ cùng trang phát hành.

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

</details>

---

## <a id="privacy"></a>Quyền riêng tư

Tải xuống được lấy trực tiếp qua [yt-dlp](https://github.com/yt-dlp/yt-dlp) từ YouTube đến thư mục bạn chọn — không có gì đi qua máy chủ bên thứ ba. Lịch sử xem, lịch sử tải xuống, URL và nội dung file vẫn ở trên thiết bị của bạn.

Arroxy gửi telemetry ẩn danh, tổng hợp qua [Aptabase](https://aptabase.com) — vừa đủ để một dự án indie biết có ai đang thực sự dùng hay không (số lần khởi động, OS, phiên bản ứng dụng, sự cố). Không có URL, không có tiêu đề video, không có đường dẫn file, không có IP, không có thông tin tài khoản — Aptabase là mã nguồn mở và thân thiện GDPR theo thiết kế. Bạn có thể từ chối trong Cài đặt.

---

## <a id="faq"></a>Câu hỏi thường gặp

**Thực sự miễn phí không?**
Có — giấy phép MIT, không có gói cao cấp, không khóa tính năng.

**Tôi có thể tải xuống chất lượng video nào?**
Bất kỳ thứ gì YouTube cung cấp: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, cùng với chỉ âm thanh. Các luồng 60 fps, 120 fps và HDR được giữ nguyên.

**Tôi có thể trích xuất chỉ âm thanh dạng MP3 không?**
Có. Chọn *chỉ âm thanh* trong menu định dạng và chọn MP3, AAC hoặc Opus.

**Tôi có cần tài khoản YouTube hay cookie không?**
Không. Arroxy chỉ sử dụng các token công khai mà YouTube cung cấp cho bất kỳ trình duyệt nào. Không cookie, không đăng nhập, không lưu thông tin xác thực. Xem [Không cookie, không đăng nhập, không liên kết tài khoản](#no-cookies) để hiểu tại sao điều này quan trọng.

**Ứng dụng có tiếp tục hoạt động khi YouTube thay đổi gì đó không?**
Hai lớp bảo vệ: yt-dlp cập nhật trong vòng vài giờ sau khi YouTube thay đổi, và Arroxy không phụ thuộc vào cookie hết hạn sau ~30 phút. Điều này khiến nó ổn định hơn đáng kể so với các công cụ phụ thuộc vào phiên trình duyệt đã xuất.

**Arroxy có sẵn bằng những ngôn ngữ nào?**
Chín ngôn ngữ: English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Tự động phát hiện ngôn ngữ hệ thống; có thể đổi bất cứ lúc nào từ thanh công cụ. Các file locale là các đối tượng TypeScript thuần túy trong `src/shared/i18n/locales/` — [PR luôn được chào đón](../../pulls).

**Tôi có cần cài đặt thêm gì không?**
Không. yt-dlp và ffmpeg được tải xuống tự động khi khởi động lần đầu từ các bản phát hành GitHub chính thức của chúng và lưu vào bộ nhớ đệm cục bộ.

**Tôi có thể tải xuống danh sách phát hoặc toàn bộ kênh không?**
Hiện tại chỉ hỗ trợ video đơn lẻ và Shorts. Hỗ trợ danh sách phát và kênh có trong [lộ trình phát triển](#roadmap).

**macOS báo "ứng dụng bị hỏng" — tôi phải làm gì?**
Đó là macOS Gatekeeper chặn ứng dụng chưa được ký, không phải file thực sự bị hỏng. Xem phần [lần đầu khởi động trên macOS](#download) để biết cách xử lý.

**Tải video YouTube có hợp pháp không?**
Đối với mục đích sử dụng cá nhân, riêng tư thì nhìn chung được chấp nhận ở hầu hết các khu vực pháp lý. Bạn có trách nhiệm tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại địa phương của bạn.

---

## <a id="roadmap"></a>Lộ trình phát triển

Sắp ra mắt — theo thứ tự ưu tiên:

| Tính năng    | Mô tả    |
| ---------------- | ---------------- |
| **Tải danh sách phát & kênh** | Dán URL danh sách phát hoặc kênh; xếp hàng tất cả video với bộ lọc ngày hoặc số lượng |
| **Nhập URL hàng loạt** | Dán nhiều URL cùng lúc và chạy tất cả trong một lần |
| **Chuyển đổi định dạng** | Chuyển đổi tải xuống sang MP3, WAV, FLAC mà không cần công cụ riêng |
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

> yt-dlp và ffmpeg không được đóng gói sẵn — chúng được tải từ GitHub khi khởi động lần đầu và lưu vào thư mục dữ liệu ứng dụng của bạn.

</details>

---

## Điều khoản sử dụng

Arroxy là công cụ chỉ dành cho mục đích sử dụng cá nhân, riêng tư. Bạn hoàn toàn chịu trách nhiệm đảm bảo các tải xuống của mình tuân thủ [Điều khoản dịch vụ](https://www.youtube.com/t/terms) của YouTube và luật bản quyền tại khu vực pháp lý của bạn. Không sử dụng Arroxy để tải xuống, sao chép hoặc phân phối nội dung mà bạn không có quyền sử dụng. Các nhà phát triển không chịu trách nhiệm về bất kỳ hành vi lạm dụng nào.

<div align="center">
  <sub>Giấy phép MIT · Được tạo ra với tâm huyết bởi <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
