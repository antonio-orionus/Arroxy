<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Maskot Arroxy" width="180" />

# Arroxy — Pengunduh YouTube (+ 2000 situs) Sumber Terbuka Gratis untuk Windows, macOS & Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Baca di:** [Afaan Oromoo](README.om.md) · **Bahasa Indonesia** · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Rilis](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Situs web](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Lisensi](https://img.shields.io/badge/license-MIT-green) ![Platform](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Bahasa](https://img.shields.io/badge/i18n-24_languages-blue)

Unduh video, Shorts, musik, saluran, podcast, atau trek audio dari **YouTube dan 2000+ situs yang didukung** — hingga 4K HDR pada 60 fps, atau sebagai MP3 / AAC / Opus. Berjalan secara lokal di Windows, macOS, dan Linux. **Tanpa iklan, tanpa pembengkakan, tanpa peningkatan penjualan.**

[**↓ Instal Rilis Terbaru**](#install) &nbsp;·&nbsp; [**Situs web**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows peluncuran pertama](#windows-first-launch) · [macOS peluncuran pertama](#macos-first-launch) · [Linux peluncuran pertama](#linux-first-launch)

[![Bergabunglah dengan Komunitas Discord](https://img.shields.io/badge/Bergabunglah%20dengan%20Komunitas%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Demo Arroxy" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

Jika Arroxy menghemat waktu Anda, ⭐ membantu orang lain menemukannya.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-09-02._

> 🌐 Ini adalah terjemahan dengan bantuan AI. [README bahasa Inggris](README.md) adalah sumber kebenaran. Menemukan kesalahan? [PR diterima](../../pulls).

---

## Isi

- [Instalasi dan peluncuran pertama](#install)
  - [Instal melalui manajer paket](#package-manager)
  - [Windows peluncuran pertama](#windows-first-launch)
  - [macOS peluncuran pertama](#macos-first-launch)
  - [Mengapa Anda mungkin melihat peringatan](#why-warning)
  - [Linux peluncuran pertama](#linux-first-launch)
  - [Verifikasi unduhan Anda (SHA256)](#verify)
- [Mengapa Arroxy](#why)
- [Fitur](#features)
- [Privasi](#privacy)
- [Pertanyaan Umum](#faq)
- [Peta jalan](#roadmap)
- [Dukung Arroxy](#support)
- [Dibangun dengan](#tech)

---

## <a id="install"></a>Instalasi dan peluncuran pertama

| Platform | Unduh langsung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe)                                                                                                                                                                                                        |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg)                                                                                                                                                                                                                     |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS)                                                                                                                                                                                                                                                                                                                                                                                                                                              |

[**Semua aset rilis →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="package-manager"></a>Instal melalui manajer paket

Sudah menggunakan manajer paket? Anda dapat melewati jalur pengunduhan manual.

| Saluran | Perintah                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak (local file) | `flatpak install --user ./Arroxy-linux-x64.flatpak`                                            |

### <a id="windows-first-launch"></a>Windows peluncuran pertama

Pada peluncuran pertama Anda mungkin melihat **"Windows melindungi PC Anda"** atau **"Penerbit tidak dikenal."** Ini berlaku untuk `Arroxy-win-x64-Setup.exe` dan `Arroxy-win-x64-Portable.exe`. Arroxy gratis dan bersumber terbuka, dan build Windows tidak ditandatangani kode dengan sertifikat berbayar, itulah sebabnya SmartScreen menandainya. Ini **tidak** secara otomatis berarti Arroxy tidak aman. Untuk melanjutkan:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="Dialog SmartScreen "Windows melindungi PC Anda" dengan tautan "Info selengkapnya" disorot" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="Dialog SmartScreen setelah More info dibuka, menampilkan tombol "Run anyway"" />
</div>

1. Klik **Info lebih lanjut**.
2. Klik **Tetap jalankan**.

#### Jika Windows Defender menandai atau menghapus file

Heuristik pembela terkadang menandai penginstal NSIS yang tidak ditandatangani dan perangkat portabel Electron sebagai mencurigakan. Jika Defender mengkarantina `Arroxy-win-x64-Setup.exe` atau `Arroxy-win-x64-Portable.exe`, pulihkan dari **Keamanan Windows → Perlindungan virus & ancaman → Riwayat perlindungan**, lalu tambahkan Arroxy yang dapat dieksekusi sebagai item yang diizinkan di **Kelola pengaturan → Tambahkan atau hapus pengecualian**. Seperti halnya SmartScreen, pemicunya adalah tanda tangan penerbit yang hilang, bukan malware yang terdeteksi.

> Hanya unduh Arroxy dari halaman resmi Rilis GitHub. Jika Anda mendapatkan file dari situs web lain atau seseorang mengirimkannya kepada Anda, hapus file tersebut dan unduh salinan baru dari sumber resmi. Kode sumbernya bersifat publik, jadi Anda dapat memeriksanya atau membuat sendiri Arroxy jika Anda mau.

### <a id="macos-first-launch"></a>macOS peluncuran pertama

Arroxy belum ditandatangani untuk macOS, jadi Gatekeeper dapat menampilkan dialog menakutkan *"Arroxy.app is damaged and can't be opened"* setelah Anda memasangnya dari DMG. Pesan itu berarti macOS mengarantina aplikasi yang tidak ditandatangani; bukan berarti file aplikasi benar-benar rusak. Pada macOS saat ini, perbaikan yang paling andal adalah Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Seret `Arroxy.app` dari DMG yang terpasang ke `/Applications`.
2. Buka Terminal dan jalankan dua perintah ini:

```bash
sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Perintah pertama menghapus atribut karantina dari salinan Arroxy yang Anda instal. Yang kedua meluncurkan aplikasi. `sudo` mungkin meminta kata sandi Mac Anda; Terminal tidak akan menampilkan karakter saat Anda mengetiknya.

**Apple Silicon vs Intel:** pada Mac seri M (M1 / M2 / M3 / M4), unduh `arm64` DMG. Di Mac Intel, unduh `x64` DMG. Menjalankan build yang salah masih berfungsi melalui Rosetta tetapi terasa lebih lambat.

> Build macOS diproduksi melalui CI pada runner Apple Silicon dan Intel. Jika Anda mengalami masalah, silakan [buka masalah](../../issues) — masukan dari pengguna macOS secara aktif membentuk siklus pengujian macOS.

### <a id="why-warning"></a>Mengapa Anda mungkin melihat peringatan

Arroxy adalah sumber terbuka dan berlisensi MIT. Versi Windows dan macOS **tidak ditandatangani dengan kode** — ID Pengembang Apple dan sertifikat penandatanganan kode Windows EV masing-masing berharga ratusan dolar per tahun, yang dibayar langsung oleh proyek indie. Tanpa tanda tangan tersebut, Windows SmartScreen dan macOS Gatekeeper akan memperingatkan Anda pada peluncuran pertama. Peringatan tersebut berarti *OS Anda tidak mengenali penerbitnya* — bukan berarti Arroxy adalah malware.

Tiga cara untuk memverifikasi sendiri Arroxy, dengan semakin ketatnya:

- **Baca sumbernya.** Setiap baris ada di [GitHub](https://github.com/antonio-orionus/Arroxy) dan Anda dapat [membuatnya dari sumber](#tech).
- **Periksa SHA256.** Cocokkan file Anda dengan [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) yang dipublikasikan — lihat [Verifikasi download Anda](#verify) di bawah.
- **Jalankan pemindaian pihak ketiga.** Unggah file ke [VirusTotal](https://www.virustotal.com).

### <a id="linux-first-launch"></a>Linux peluncuran pertama

AppImages dijalankan secara langsung — tanpa instalasi. Anda hanya perlu menandai file tersebut sebagai file yang dapat dieksekusi.

**Manajer file:** klik kanan `.AppImage` → **Properti** → **Izin** → aktifkan **Izinkan mengeksekusi file sebagai program**, lalu klik dua kali.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Jika peluncuran masih gagal, jalankan tanpa mount — tidak perlu paket sistem tambahan:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Integrasi desktop opsional:** instal [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) satu kali, dan AppImage apa pun yang Anda klik dua kali akan terdaftar ke menu peluncur secara otomatis — tidak diperlukan file `.desktop` manual.

**Tarball biasa (tanpa FUSE, tanpa instalasi):**

Build `.tar.gz` adalah aplikasi yang sama tanpa pembungkus AppImage — ekstrak di mana saja lalu jalankan. Tidak ada yang perlu diinstal, tidak perlu paket sistem.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Flatpak (alternatif sandbox):** unduh `Arroxy-linux-x64.flatpak` dari halaman rilis yang sama.

Ubuntu menyertakan Snap alih-alih Flatpak, jadi instal Flatpak dan tambahkan Flathub terlebih dahulu — bundel mengambil runtime-nya dari sana:

```bash
sudo apt install -y flatpak
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user ./Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

**Unduhan Linux di halaman rilis hanya untuk x86_64.** Di mesin ARM64 (Raspberry Pi, Asahi Linux) Flatpak tetap terinstal tetapi gagal saat diluncurkan dengan `bwrap: execvp ldconfig: Exec format error`.

<details>
<summary><strong><a id="verify"></a>Verifikasi unduhan Anda (SHA256)</strong></summary>

Setiap rilis menerbitkan file `SHA256SUMS` bersama biner. Untuk memastikan bahwa unduhan Anda tidak rusak atau diubah saat transit, hash file Anda secara lokal dan cocokkan baris di `SHA256SUMS`. Buka halaman rilis terbaru → **Aset** → unduh `SHA256SUMS`.

**Windows (PowerShell atau Command Prompt):**

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

Ingin pemindaian malware pihak ketiga? Unggah file di [VirusTotal](https://www.virustotal.com). Sejumlah tanda heuristik generik dari mesin kecil adalah hal yang normal untuk aplikasi Electron yang tidak ditandatangani; deteksi luas dari mesin-mesin besar akan menjadi perhatian nyata.

</details>

<details>
<summary><strong>Windows: Penginstal vs Portabel</strong></summary>

|               | Pemasang NSIS | `.exe` portabel |
| ------------- | :----------------------: | :---------------------: |
| Diperlukan instalasi | Ya  | Tidak — jalankan dari mana saja  |
| Pembaruan otomatis | ✅ dalam aplikasi  | ❌ unduh manual  |
| Kecepatan permulaan | ✅ lebih cepat  | ⚠️ start dingin lebih lambat  |
| Menambahkan ke Menu Mulai |            ✅            |           ❌            |
| Pencopotan pemasangan yang mudah |            ✅            | ❌ hapus filenya  |

**Rekomendasi:** gunakan penginstal NSIS untuk pembaruan otomatis dan peluncuran yang lebih cepat. Gunakan `.exe` portabel untuk opsi tanpa instalasi dan tanpa perubahan registry.

</details>

---

## <a id="why"></a>Mengapa Arroxy

Perbandingan berdampingan dengan alternatif yang paling umum:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Gratis, tidak ada tingkat premium |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Sumber terbuka |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Hanya pemrosesan lokal |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Tidak ada login atau ekspor cookie |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Tidak ada batasan penggunaan |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Aplikasi desktop lintas platform |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitle + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy dibuat untuk satu hal: tempelkan URL, dapatkan file lokal yang bersih. Tidak ada akun, tidak ada upsell, tidak ada pengumpulan data.

---

## <a id="features"></a>Fitur

### Kualitas & format

- Hingga **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Kecepatan frame tinggi** dipertahankan apa adanya — 60 fps, 120 fps, HDR
- **Audio** — mengekspor audio saja sebagai MP3, M4A/AAC, Opus, atau WAV. Dalam download interaktif, pilih trek surround/Dolby asli sumber (AC-3, E-AC-3, 5.1, DRC) bila tersedia, atau atur global **Prefer surround / Dolby** default
- Preset cepat: *Kualitas terbaik* · *Seimbang* · *File kecil*

### Privasi & kontrol

- 100% pemrosesan lokal — pengunduhan langsung dari YouTube ke disk Anda
- **Sumber terbuka** — setiap baris dapat diaudit, berlisensi MIT
- File disimpan langsung ke folder yang Anda pilih

### Alur kerja

- **Mode mulai yang fleksibel** — pilih unduhan tunggal yang dipandu, pemilih daftar putar/saluran, tempel URL massal, atau Unduhan Cepat dengan default tersimpan
- **Antrian unduhan terpusat** — setiap tugas tunggal, daftar putar, massal, atau cepat berada di satu tempat untuk kemajuan, jeda, melanjutkan, membatalkan, mencoba lagi, dan kontrol prioritas
- **Pantau clipboard** — salin tautan YouTube dan Arroxy otomatis mengisi URL saat Anda kembali fokus ke aplikasi (aktifkan di Pengaturan lanjutan)
- **Pembersihan otomatis URL** — menghapus parameter pelacakan (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) dan membuka tautan `youtube.com/redirect`
- **Mode baki** — menutup jendela akan membuat unduhan tetap berjalan di latar belakang
- **24 bahasa** — mendeteksi lokal sistem secara otomatis, dapat dialihkan kapan saja
- **Sinkronisasi daftar putar** — memindai ulang daftar putar ke folder lokal untuk melewati video yang sudah diunduh; menghasilkan file daftar putar `.m3u` yang diperbarui saat setiap video diunduh
- **Kontrol kecepatan dan tempo** — membatasi bandwidth pengunduhan, mengatur berapa banyak bagian video yang diunduh sekaligus, dan menambahkan penundaan permintaan dengan preset (*Mati · Seimbang · Hati-hati · Kustom*)
- **Templat nama berkas** — beri nama unduhan sesuai keinginan Anda dengan `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}`, dan `{playlist_index}`, secara global atau per profil unduhan
- **Unduhan sekaligus dan coba ulang otomatis** — pilih berapa banyak unduhan antrean yang berjalan bersamaan, dan biarkan Arroxy mencoba ulang unduhan yang mengalami gangguan jaringan atau server, dengan menunggu lebih lama sebelum tiap percobaan
- **Profil per item dalam daftar putar** — beri setiap video dalam daftar putar profil unduhannya sendiri, bukan satu pengaturan untuk semuanya, sehingga satu proses bisa mengarsipkan sebagian dalam kualitas penuh dan mengambil sisanya sebagai MP3

### Subtitle & pasca-pemrosesan

- **Subtitel** dalam SRT, VTT, atau ASS — dibuat secara manual atau otomatis, dalam bahasa apa pun yang tersedia
- Simpan di samping video, sematkan ke `.mkv`, atau atur ke dalam subfolder `Subtitles/`
- **SponsorBlock** — lewati atau tandai bab sponsor, intro, outro, promo mandiri
- **Metadata tersemat** — judul, tanggal pengunggahan, saluran, deskripsi, gambar mini, dan penanda bab yang ditulis ke dalam file

### YouTube + 2000 situs

- **YouTube, selengkapnya** — Video, Shorts, Saluran, Daftar Putar, Musik YouTube, dan Podcast ditangani sebagai sumber kelas satu
- **2000+ situs lainnya** melalui yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org, dan masih banyak lagi
- **Khusus audio dan subtitel** berfungsi di semua situs yang didukung, tidak hanya YouTube
- Jika situs berubah, yt-dlp mengirimkan perbaikan setiap minggu dan Arroxy memperbarui biner secara otomatis saat peluncuran

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profil per item playlist</b><br/>Beri tiap video profilnya sendiri — simpan sebagian dalam 4K, ambil sisanya sebagai MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Beranda Unduhan Cepat</b><br/>Tempel URL dan unduh langsung dengan profil aktif Anda</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Profil unduhan yang dapat digunakan kembali</b><br/>Simpan preset format, kualitas, dan output — gunakan kembali untuk setiap unduhan</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Trek audio multi-bahasa</b><br/>Pilih bahasa audio yang tepat yang dikirimkan video</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Audio surround / Dolby</b><br/>5.1 dan trek Dolby terdeteksi dan disimpan</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Mode URL massal</b><br/>Tempelkan daftar, hapus duplikat otomatis, masukkan semuanya ke dalam antrean sekaligus</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Antrean unduhan paralel</b><br/>Beberapa unduhan sekaligus dengan progres langsung</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>Privasi

Unduhan diambil langsung melalui [yt-dlp](https://github.com/yt-dlp/yt-dlp) dari YouTube ke folder yang Anda pilih — tidak ada yang dirutekan melalui server pihak ketiga. Riwayat tontonan, riwayat unduhan, URL, dan konten file tetap ada di perangkat Anda.

Arroxy mengirimkan telemetri agregat anonim melalui [OpenPanel](https://openpanel.dev) — cukup bagi proyek indie untuk memahami kegagalan, kerusakan, umpan balik, OS, dan versi aplikasi. Tidak ada URL, judul video, jalur file, info akun, sidik jari, atau data pribadi. ID per-instal bersifat acak dan tidak terikat dengan identitas Anda. Anda dapat memilih untuk tidak ikut serta dalam Pengaturan.

---

## <a id="faq"></a>Pertanyaan Umum

**Apakah ini benar-benar gratis?**
Ya — berlisensi MIT, tanpa tingkat premium, tanpa fitur gating.

**Kualitas video apa yang dapat saya unduh?**
Apa pun yang disajikan YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio saja. Streaming 60 fps, 120 fps, dan HDR dipertahankan apa adanya.

**Bisakah saya mengekstrak audionya saja sebagai MP3?**
Ya. Pilih *audio saja* di menu format dan pilih MP3, M4A/AAC, Opus, atau WAV.

**Apakah saya memerlukan akun atau cookie YouTube?**
Secara default, tidak — Arroxy berfungsi tanpa akun YouTube, login, atau ekspor cookie. Dukungan cookie opsional tersedia di Setelan lanjutan (Sumber cookie: file atau browser) untuk konten yang memerlukan autentikasi, seperti video dengan batasan usia atau video khusus anggota. Ini dinonaktifkan secara default. Jika Anda mengaktifkannya, wiki yt-dlp mencatat bahwa [otomatisasi berbasis cookie dapat menandai akun Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); rekening sekali pakai adalah pilihan yang lebih aman dalam hal ini.

**Apakah ini akan tetap berfungsi ketika YouTube mengubah sesuatu?**
yt-dlp diperbarui secara otomatis saat peluncuran, dan Arroxy segera mengirimkan perbaikan ketika YouTube mengubah sesuatu. Jika Anda mengalami masalah, dukungan cookie opsional tersedia di Pengaturan lanjutan sebagai cadangan.

**Bahasa apa saja yang tersedia di Arroxy?**
24 bahasa langsung tersedia: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Kiswahili · O'zbekcha · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · বাংলা · हिन्दी · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語. Arroxy otomatis mendeteksi bahasa sistem operasi Anda saat pertama kali dijalankan, dan Anda dapat beralih kapan saja dari pemilih bahasa di toolbar. JSON locale runtime berada di src/shared/i18n/locales/, dan katalog PO untuk penerjemah berada di i18n/locales/ — buka PR di GitHub untuk berkontribusi.

**Apakah saya perlu menginstal yang lain?**
Tidak. yt-dlp diunduh secara otomatis pada peluncuran pertama dan disimpan dalam cache di mesin Anda; ffmpeg dan ffprobe dikirimkan bersama aplikasi. Setelah itu, tidak diperlukan pengaturan tambahan.

**Bisakah saya mengunduh daftar putar atau seluruh saluran?**
Ya — keduanya. Tempelkan URL daftar putar atau URL saluran (misalnya `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); pilih berapa banyak entri yang akan dipindai, lalu antri seluruh daftar atau pilih video tertentu. Filter rentang tanggal akan segera hadir.

**macOS mengatakan "aplikasi rusak" — apa yang harus saya lakukan?**
Itu macOS Gatekeeper memblokir aplikasi yang tidak ditandatangani, bukan kerusakan sebenarnya. Lihat [macOS peluncuran pertama](#macos-first-launch) untuk perintah Terminal yang menghapus karantina dan meluncurkan Arroxy.

**Apakah mengunduh video YouTube legal?**
Untuk penggunaan pribadi dan pribadi, ini diterima secara umum di sebagian besar yurisdiksi. Anda bertanggung jawab untuk mematuhi [Ketentuan Layanan](https://www.youtube.com/t/terms) YouTube dan undang-undang hak cipta setempat.

---

## <a id="roadmap"></a>Peta jalan

Masih direncanakan — kira-kira dalam urutan prioritas:

| Fitur    | Keterangan    |
| ---------------- | ---------------- |
| **Daftar putar & filter saluran** | Filter rentang tanggal saat menghitung daftar putar atau saluran |
| **Preferensi trek audio YouTube** | Tetapkan preferensi trek bahasa lisan di seluruh aplikasi, dengan penggantian per profil ketika YouTube menawarkan beberapa trek audio |
| **Login browser dalam aplikasi** | Buka jendela browser di dalam Arroxy sehingga Anda dapat masuk dan menggunakan cookie situs tanpa mengekspornya secara manual |
| **Unduh video sekali klik** | Mulai pengunduhan video dalam satu klik dari URL yang terdeteksi atau ditempelkan menggunakan profil aktif Anda |
| **Pemulihan coba lagi yang lebih kuat** | Jalur percobaan ulang baru untuk pengunduhan yang terganggu oleh koneksi internet yang tidak dapat diandalkan atau bermasalah |
| **Laci pengelola unduhan lengkap** | Ubah laci antrean menjadi pengelola yang lebih lengkap, termasuk mengubah folder tujuan untuk item antrean |
| **Unduhan terjadwal** | Memulai antrian pada waktu yang ditentukan (berjalan semalaman) |
| **Pemangkasan klip** | Unduh hanya satu segmen berdasarkan waktu mulai/berakhir |

Punya ide fitur? [Buka permintaan](../../issues) — masukan komunitas membantu menentukan prioritas.

---

## <a id="support"></a>Dukung Arroxy

Arroxy gratis dan berlisensi MIT — tanpa iklan, tanpa versi berbayar. Jika Arroxy menghemat waktu Anda, Anda bisa mendukung pengembangannya dengan Bitcoin atau Tron: alamatnya ada di [DONATE.md](DONATE.md), satu-satunya sumber resmi untuk alamat tersebut. Arroxy tidak akan pernah mengirimi Anda alamat lewat email atau pesan langsung. Memberi bintang pada repo, melaporkan bug, dan memperbaiki terjemahan sama besar bantuannya.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a>

---

## <a id="tech"></a>Dibangun dengan

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop lintas platform
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — gaya
- **Zustand** — manajemen state
- **yt-dlp** + **ffmpeg** — mesin unduh dan mux (yt-dlp diambil saat runtime; ffmpeg/ffprobe dibundel pada waktu pembuatan)
- **Vite** + **electron-vite** — tooling build
- **Vitest** + **Playwright** — pengujian unit dan menyeluruh

</details>

<details>
<summary><strong>Bangun dari sumber</strong></summary>

### Prasyarat — semua platform

| Alat | Versi | Instal |
| ------- | ------- | ------- |
| Git | apapun | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | `mise install` atau `.node-version` |
| Bun | 1.2.23 | `mise install` atau `package.json` `packageManager` |

Direkomendasikan: instal `mise`, lalu jalankan `mise install` di checkout. Tanpa mise, aktifkan Node.js secara manual dari `.node-version` dan Bun dari `package.json` sebelum `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools dan Python mungkin diperlukan untuk pembangunan kembali asli.

### macOS

```bash
brew install mise
xcode-select --install
```

Setelah kloning, jalankan `mise trust && mise install` dari checkout. Jika shell Anda sudah menggunakan `fnm`, `nvm`, atau Homebrew Bun, aktifkan mise di `~/.zshrc` sehingga Arroxy mendapatkan Node.js 24.16.0 dan Bun 1.2.23:

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Build + Electron runtime deps
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Kloning & jalankan

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app against the Vite renderer
```

### Membuat paket distribusi

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # package Windows targets when run on a supported host
```

> `bun run bootstrap` memasang dependensi, membangun kembali dependensi aplikasi Electron, memverifikasi Electron, menyiapkan ffmpeg/ffprobe tertanam untuk pengembangan, dan menginstal Playwright Chromium. yt-dlp dikelola saat runtime di folder data aplikasi Anda; ffmpeg dan ffprobe dibundel dengan setiap rilis Arroxy.

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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## Ketentuan penggunaan

Arroxy adalah alat untuk penggunaan pribadi dan privat saja. Anda bertanggung jawab penuh untuk memastikan unduhan Anda mematuhi [Ketentuan Layanan](https://www.youtube.com/t/terms) YouTube dan undang-undang hak cipta di yurisdiksi Anda. Jangan gunakan Arroxy untuk mengunduh, mereproduksi, atau mendistribusikan konten yang tidak berhak Anda gunakan. Pengembang tidak bertanggung jawab atas penyalahgunaan apa pun.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Lisensi MIT · Dibuat dengan hati-hati oleh <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
