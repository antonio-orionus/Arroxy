<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Maskot Arroxy" width="180" />

# Arroxy — Pengunduh YouTube (+ 2000 situs) Sumber Terbuka Gratis dengan Peramban Bawaan untuk Windows, macOS & Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Baca di:** [Afaan Oromoo](README.om.md) · **Bahasa Indonesia** · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Rilis](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Situs web](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Lisensi](https://img.shields.io/badge/license-MIT-green) ![Platform](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Bahasa](https://img.shields.io/badge/i18n-31_languages-blue)

Unduh video, Shorts, musik, saluran, podcast, atau trek audio dari **YouTube dan 2000+ situs yang didukung** — hingga 8K HDR pada 60 fps, sebagai MP3 / AAC / Opus, atau hanya bagian yang Anda perlukan. **Jelajahi YouTube atau situs lain di dalam Arroxy** lewat tab Explore dan unduh video, daftar putar, atau saluran yang sedang Anda buka; masuk di sana untuk mengunduh video privat, khusus anggota, dan dengan batasan usia yang bisa ditonton akun Anda. Berjalan secara lokal di Windows, macOS, dan Linux. **Tanpa iklan, tanpa pembengkakan, tanpa peningkatan penjualan.**

[**↓ Instal Rilis Terbaru**](#install) &nbsp;·&nbsp; [**Situs web**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows peluncuran pertama](#windows-first-launch) · [macOS peluncuran pertama](#macos-first-launch) · [Linux peluncuran pertama](#linux-first-launch)

[![Bergabunglah dengan Komunitas Discord](https://img.shields.io/badge/Bergabunglah%20dengan%20Komunitas%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Jika Arroxy menghemat waktu Anda, ⭐ membantu orang lain menemukannya.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Ini adalah terjemahan dengan bantuan AI. [README bahasa Inggris](README.md) adalah sumber kebenaran. Menemukan kesalahan? [PR diterima](../../pulls).

---

## Isi

- [✨ Fitur](#features)
- [📥 Instalasi dan peluncuran pertama](#install)
  - [Windows peluncuran pertama](#windows-first-launch)
  - [macOS peluncuran pertama](#macos-first-launch)
  - [Mengapa Anda mungkin melihat peringatan](#why-warning)
  - [Linux peluncuran pertama](#linux-first-launch)
  - [Verifikasi unduhan Anda (SHA256)](#verify)
- [⚖️ Mengapa Arroxy](#why)
- [🔒 Privasi](#privacy)
- [❓ Pertanyaan Umum](#faq)
- [🗺️ Peta jalan](#roadmap)
- [💖 Dukung Arroxy](#support)
- [🛠️ Dibangun dengan](#tech)

---

## <a id="features"></a>✨ Fitur

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Jelajahi YouTube atau situs lain di dalam Arroxy dan unduh halaman yang sedang Anda buka dengan profil aktif</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Layar pertama Explore</b><br/>Sekilas tentang Explore, dan alasan akun sekunder adalah login yang lebih aman</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Unduhan memberi tahu apa yang butuh perhatian Anda</b><br/>Tautan disiapkan di latar belakang; yang gagal menawarkan solusinya, playlist panjang menunggu pilihan Anda</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Unduh hanya sebagian video</b><br/>Pilih awal dan akhir, atau satu bab — Arroxy hanya menyimpan rentang itu</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Editor profil</b><br/>Atur profil: jenis file, resolusi, subtitel, tujuan, templat nama file, dan lainnya</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Gelap atau terang, kaca atau polos</b><br/>Empat tampilan untuk dipilih: panel kaca di atas langit bergerak atau permukaan polos yang tenang, masing-masing dalam mode gelap dan terang</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Pintasan unduh global Arroxy — Ctrl+Shift+D di Windows dan Linux, Cmd+Shift+D di macOS, mengirim tautan yang disalin langsung ke antrean unduhan" width="760" /></picture><br/><sub><b>Pintasan unduh global</b><br/>Salin tautan di mana saja, tekan sekali — langsung masuk antrean dan mulai diunduh</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profil per item playlist</b><br/>Beri tiap video profilnya sendiri — simpan sebagian dalam 4K, ambil sisanya sebagai MP3</sub></td>
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

<details open>
<summary><strong>🧭 Explore: jelajahi web di dalam Arroxy</strong></summary>

- **Tab Explore** — jelajahi YouTube atau situs lain di dalam Arroxy dan unduh yang Anda temukan tanpa menyalin tautan. **Unduh · *profil Anda*** memasukkan video, daftar putar, atau saluran yang sedang Anda lihat ke antrean; panah di sebelahnya mengganti profil, dan tongkat sihir membuka unduhan langkah demi langkah untuk memilih format, subtitle, dan lainnya
- **Klik kanan untuk mengunduh** — klik kanan tautan video, daftar putar, atau saluran mana pun di Explore untuk mengunduhnya dengan profil Anda, memilih profil lain dari **Unduh dengan**, membuka unduhan langkah demi langkah, atau menyalin tautan. Anda tidak perlu membuka setiap video terlebih dahulu
- **Tata letak ringkas** — satu klik di bilah alat Explore memindahkan tab Arroxy ke sana dan memberi halaman lebih banyak ruang
- **Bilah alamat** — ketik untuk mencari di YouTube, atau masukkan alamat web mana pun untuk membuka situs itu
- **Unduhan yang memerlukan akun** — masuk sekali di Explore dan Arroxy dapat mengunduh video privat dan khusus anggota yang bisa ditonton akun Anda, video dengan batasan usia jika usia akun terverifikasi, serta daftar Tonton Nanti dan Disukai Anda. Masuk juga ke situs lain di sana, dan unduhan dari situs itu memakai login tersebut saat memerlukannya. Arroxy tetap mengunduh tanpa masuk terlebih dahulu dan hanya memakai login Explore Anda saat unduhan gagal dengan cara yang bisa diperbaiki oleh sebuah akun. Saat YouTube meminta Anda mengonfirmasi bahwa Anda bukan bot, Arroxy juga mencoba login Explore Anda
- **Gunakan akun sekunder** — layar pertama Explore menjelaskan alasannya: mengunduh dengan akun membawa risiko tertentu akun tersebut dibatasi. Keluar dari Explore lewat Pengaturan kapan pun Anda ingin melupakan semua login Anda
- **Pemblokir iklan** — nonaktif secara bawaan. Satu klik pada ikon perisai di bilah alat Explore memblokir iklan dan pelacak di halamannya, tanpa memengaruhi unduhan. YouTube mungkin menolak pemblokir iklan untuk akun yang sudah masuk

</details>

<details>
<summary><strong>🎞️ Kualitas & format</strong></summary>

- Hingga **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Kecepatan frame tinggi dan HDR** dipertahankan apa adanya — 60 fps, HDR10
- **Audio** — mengekspor audio saja sebagai MP3, M4A/AAC, Opus, atau WAV. Dalam download interaktif, pilih trek surround/Dolby asli sumber (AC-3, E-AC-3, 5.1, DRC) bila tersedia, atau atur global **Prefer surround / Dolby** default
- **Profil dengan tujuan** — *Gambar terbaik* (AV1 · VP9) atau *TV Pintar* (MP4 · H.264), disimpan sebagai Otomatis, MP4, MKV, atau WebM tanpa encode ulang. HDR adalah *Otomatis* (hanya jika layar Anda bisa menampilkannya), *SDR*, atau *HDR*
- **Setiap codec di setiap resolusi** — unduhan langkah demi langkah menampilkan AV1, VP9, dan H.264 berdampingan di setiap resolusi, sehingga Anda bisa memilih yang dapat diputar TV atau editor Anda
- **Ketahui stream yang sebenarnya** — ukuran yang di-upscale YouTube dengan AI, bahasa audio hasil sulih suara AI, stream dengan bitrate yang ditingkatkan, video 360°, serta salinan yang rusak atau bertanda air diberi tanda. Profil melewati stream hasil upscale AI kecuali Anda mengizinkannya

</details>

<details>
<summary><strong>🛡️ Privasi & kontrol</strong></summary>

- 100% pemrosesan lokal — pengunduhan langsung dari YouTube ke disk Anda
- **Sumber terbuka** — setiap baris dapat diaudit, berlisensi MIT
- File disimpan langsung ke folder yang Anda pilih

</details>

<details>
<summary><strong>⚡ Alur kerja</strong></summary>

- **Pintasan unduh global** — salin tautan di aplikasi mana pun lalu tekan `Ctrl+Shift+D` (`Cmd+Shift+D` di macOS); Arroxy memasukkannya ke antrean dengan profil aktif tanpa membuka jendela, dan notifikasi mengonfirmasinya. Aktif secara bawaan, bisa diubah
- **Mode mulai yang fleksibel** — pilih unduhan tunggal yang dipandu, pemilih daftar putar/saluran, tempel URL massal, Unduh Cepat dengan default tersimpan, atau jelajahi dan unduh dari Explore
- **Antrian unduhan terpusat** — setiap tugas tunggal, daftar putar, massal, atau cepat berada di satu tempat untuk kemajuan, jeda, melanjutkan, membatalkan, mencoba lagi, dan kontrol prioritas
- **Pantau clipboard** — salin tautan video dan tautan itu mengisi kolom URL saat Anda kembali ke Arroxy, dengan **Urungkan** jika Anda tidak bermaksud begitu. Saat Arroxy sedang sibuk, tautan menunggu sampai Anda kembali ke tab URL (nonaktifkan di Pengaturan)
- **Pembersihan otomatis URL** — menghapus parameter pelacakan (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) dan membuka tautan `youtube.com/redirect`
- **Mode baki** — menutup jendela akan membuat unduhan tetap berjalan di latar belakang
- **31 bahasa** — mendeteksi lokal sistem secara otomatis, dapat dialihkan kapan saja
- **Sinkronisasi daftar putar** — memindai ulang daftar putar ke folder lokal untuk melewati video yang sudah diunduh; menghasilkan file daftar putar `.m3u` yang diperbarui saat setiap video diunduh
- **Kontrol kecepatan dan tempo** — membatasi bandwidth pengunduhan, mengatur berapa banyak bagian video yang diunduh sekaligus, dan menambahkan penundaan permintaan dengan preset (*Mati · Seimbang · Hati-hati · Kustom*)
- **Templat nama berkas** — beri nama unduhan sesuai keinginan Anda dengan `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}`, dan `{playlist_index}`, secara global atau per profil unduhan
- **Unduhan sekaligus dan coba ulang otomatis** — pilih berapa banyak unduhan antrean yang berjalan bersamaan, dan biarkan Arroxy mencoba ulang unduhan yang mengalami gangguan jaringan atau server, dengan menunggu lebih lama sebelum tiap percobaan
- **Profil per item dalam daftar putar** — beri setiap video dalam daftar putar profil unduhannya sendiri, bukan satu pengaturan untuk semuanya, sehingga satu proses bisa mengarsipkan sebagian dalam kualitas penuh dan mengambil sisanya sebagai MP3
- **Unduh Cepat berjalan di latar belakang** — tautan langsung muncul di Unduhan dan disiapkan di sana, catatan dengan **Lihat** mengonfirmasinya, dan kolom URL dikosongkan untuk tautan berikutnya. Mulai sebanyak yang Anda mau selagi yang sebelumnya disiapkan
- **Unduhan memberi tahu apa yang butuh perhatian Anda** — jika Arroxy tidak bisa membaca tautan, barisnya menjelaskan alasannya dan menawarkan solusi: Coba lagi, aktifkan cookie, atau masuk di Explore. Saat cookie nonaktif, **Masuk dengan Explore** mencobanya lagi untuk Anda setelah Anda masuk. Playlist yang lebih panjang dari batas muat Anda menunggu di barisnya sampai Anda memilih semuanya, beberapa yang pertama, atau meninjau. Tab Unduhan menghitung baris yang menunggu Anda
- **Unduh hanya sebagian video** — pilih waktu mulai dan selesai, atau sebuah bab, di layar Format dan Arroxy hanya menyimpan rentang itu, dengan rentangnya dicantumkan pada nama setelah id video. Potongan jatuh di keyframe terdekat; aktifkan potongan tepat untuk encode ulang
- **Hapus otomatis unduhan yang selesai** — opsional: unduhan yang selesai keluar dari daftar 5 detik kemudian. Filenya tetap ada di disk, dan unduhan yang gagal tetap tercantum
- **Ukuran dan Hilang di Unduhan** — kolom **Ukuran** yang dapat diurutkan menunjukkan ruang yang dipakai tiap unduhan, dan **Hilang** menandai file yang dipindahkan atau dihapus di luar Arroxy
- **Aurora atau Minimalis, gelap atau terang** — panel kaca di atas langit yang bergerak, atau permukaan solid yang tenang; ganti dari footer. Komputer tanpa akselerasi grafis otomatis mendapat Minimalis
- **Bilah menu Mac** — di macOS, buka Pengaturan (`Cmd+,`), atur batas kecepatan unduh, ganti gaya dan tema, serta buka log atau simpan file diagnostik dari bilah menu
- **Ubah profil dari unduhan mana pun** — sesuaikan sebuah unduhan, lalu perbarui profil asalnya (dengan pratinjau apa yang berubah) atau simpan pengaturannya sebagai profil baru. Saat berganti profil, Arroxy menanyakan apakah suntingan Anda dipertahankan

</details>

<details>
<summary><strong>📝 Subtitle & pasca-pemrosesan</strong></summary>

- **Subtitel** dalam SRT, VTT, atau ASS — dibuat secara manual atau otomatis, dalam bahasa apa pun yang tersedia
- Simpan di samping video, sematkan ke `.mkv`, atau atur ke dalam subfolder `Subtitles/`
- **Batch hanya subtitle** — tempel daftar URL atau buka playlist, pilih Subtitle, dan dapatkan hanya file teks untuk setiap video
- **SponsorBlock** — lewati atau tandai bab sponsor, intro, outro, promo mandiri
- **Metadata tersemat** — judul, tanggal pengunggahan, saluran, deskripsi, gambar mini, dan penanda bab yang ditulis ke dalam file

</details>

<details>
<summary><strong>🌐 YouTube + 2000 situs</strong></summary>

- **YouTube, selengkapnya** — Video, Shorts, Saluran, Daftar Putar, Musik YouTube, dan Podcast ditangani sebagai sumber kelas satu
- **2000+ situs lainnya** melalui yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable, dan masih banyak lagi
- **Khusus audio dan subtitel** berfungsi di semua situs yang didukung, tidak hanya YouTube
- Jika situs berubah, yt-dlp mengirimkan perbaikan setiap minggu dan Arroxy memperbarui biner secara otomatis saat peluncuran

</details>

---

## <a id="install"></a>📥 Instalasi dan peluncuran pertama

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

Build hanya tersedia untuk x86_64. Tidak ada `curl`? Ganti `curl -fsSL` dengan `wget -qO-`.

| Platform | Unduh langsung |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Semua aset rilis →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows peluncuran pertama</strong></summary>

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

Lebih suka Scoop? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS peluncuran pertama</strong></summary>

Arroxy belum ditandatangani untuk macOS, jadi Gatekeeper dapat menampilkan dialog menakutkan *"Arroxy.app is damaged and can't be opened"* setelah Anda memasangnya dari DMG. Pesan itu berarti macOS mengarantina aplikasi yang tidak ditandatangani; bukan berarti file aplikasi benar-benar rusak. Pada macOS saat ini, perbaikan yang paling andal adalah Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Seret `Arroxy.app` dari DMG yang terpasang ke `/Applications`.
2. Buka Terminal dan jalankan dua perintah ini:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Perintah pertama menghapus atribut karantina dari salinan Arroxy yang Anda instal. Yang kedua meluncurkan aplikasi. `sudo` mungkin meminta kata sandi Mac Anda; Terminal tidak akan menampilkan karakter saat Anda mengetiknya.

**Apple Silicon vs Intel:** pada Mac seri M (M1 / M2 / M3 / M4), unduh `arm64` DMG. Di Mac Intel, unduh `x64` DMG. Menjalankan build yang salah masih berfungsi melalui Rosetta tetapi terasa lebih lambat.

> Build macOS diproduksi melalui CI pada runner Apple Silicon dan Intel. Jika Anda mengalami masalah, silakan [buka masalah](../../issues) — masukan dari pengguna macOS secara aktif membentuk siklus pengujian macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Mengapa Anda mungkin melihat peringatan</strong></summary>

Arroxy adalah sumber terbuka dan berlisensi MIT. Versi Windows dan macOS **tidak ditandatangani dengan kode** — ID Pengembang Apple dan sertifikat penandatanganan kode Windows EV masing-masing berharga ratusan dolar per tahun, yang dibayar langsung oleh proyek indie. Tanpa tanda tangan tersebut, Windows SmartScreen dan macOS Gatekeeper akan memperingatkan Anda pada peluncuran pertama. Peringatan tersebut berarti *OS Anda tidak mengenali penerbitnya* — bukan berarti Arroxy adalah malware.

Tiga cara untuk memverifikasi sendiri Arroxy, dengan semakin ketatnya:

- **Baca sumbernya.** Setiap baris ada di [GitHub](https://github.com/antonio-orionus/Arroxy) dan Anda dapat [membuatnya dari sumber](#tech).
- **Periksa SHA256.** Cocokkan file Anda dengan [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) yang dipublikasikan — lihat [Verifikasi download Anda](#verify) di bawah.
- **Jalankan pemindaian pihak ketiga.** Unggah file ke [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux peluncuran pertama</strong></summary>

AppImages dijalankan secara langsung — tanpa instalasi. Anda hanya perlu menandai file tersebut sebagai file yang dapat dieksekusi.

**Manajer file:** klik kanan `.AppImage` → **Properti** → **Izin** → aktifkan **Izinkan mengeksekusi file sebagai program**, lalu klik dua kali.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Jika peluncuran masih gagal, jalankan tanpa mount — tidak perlu paket FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Integrasi desktop opsional:** instal [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) satu kali, dan AppImage apa pun yang Anda klik dua kali akan terdaftar ke menu peluncur secara otomatis — tidak diperlukan file `.desktop` manual.

**Tarball biasa (tanpa FUSE, tanpa instalasi):**

Build `.tar.gz` adalah aplikasi yang sama tanpa pembungkus AppImage — ekstrak di mana saja lalu jalankan. Tanpa pemasang dan tanpa paket FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Unduhan Linux di halaman rilis hanya untuk x86_64.** Di mesin ARM64 (Raspberry Pi, Asahi Linux) Flatpak tetap terinstal tetapi gagal saat diluncurkan dengan `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Verifikasi unduhan Anda (SHA256)</strong></summary>

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
<summary><strong>📦 Windows: Penginstal vs Portabel</strong></summary>

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

## <a id="why"></a>⚖️ Mengapa Arroxy

Perbandingan berdampingan dengan alternatif yang paling umum:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Browser bawaan (jelajahi, masuk, unduh) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Video privat, khusus anggota & dengan batasan usia tanpa mengekspor cookie |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratis, tidak ada tingkat premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Sumber terbuka |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Hanya pemrosesan lokal |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Tidak ada batasan penggunaan |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Aplikasi desktop lintas platform |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Subtitle + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = sebagian, atau hanya di paket berbayar. Login dalam aplikasi 4K Video Downloader untuk video privat adalah fitur berbayar; sebagian besar GUI yt-dlp gratis hanya menerima file cookie atau membaca cookie dari browser web Anda.

Arroxy dibuat untuk satu hal: file lokal yang bersih, baik Anda menempelkan URL maupun menemukan videonya di Explore. Tidak ada upsell, tidak ada pengumpulan data.

### <a id="why-explore"></a>🧭 Yang tidak bisa dilakukan pembungkus yt-dlp biasa: tab Explore

Sebagian besar pengunduh YouTube gratis hanyalah kotak URL di atas yt-dlp. Arroxy juga memakai yt-dlp, tetapi juga punya **Explore**, browser yang terpasang di dalam aplikasi dan membuka YouTube atau situs lain mana pun. Explore menembus batasan yang tidak bisa diatasi oleh kotak URL:

- **Video yang memerlukan akun, tanpa mengekspor cookie** — video privat, khusus anggota, dan dengan batasan usia (dengan akun yang usianya terverifikasi), serta daftar Tonton Nanti dan Disukai Anda, dan video yang memerlukan login di situs lain. Pembungkus biasa memerlukan ekspor cookies.txt atau harus membaca cookie dari browser web Anda, yang kini diblokir oleh Chrome di Windows. Di Arroxy, Anda cukup masuk sekali di Explore dan sisanya beres
- **"Login untuk mengonfirmasi bahwa Anda bukan bot"** — saat YouTube meminta ini, Arroxy mencoba mengunduh lagi dengan login Explore Anda alih-alih gagal
- **Token unduhan YouTube** — browser bawaan Arroxy mendapatkan token yang diharapkan YouTube sebelum unduhan dimulai. Tanpanya, YouTube bisa menyajikan lebih sedikit format dan kualitas yang lebih rendah dari yang Anda minta
- **Tanpa menyalin tautan** — temukan video, daftar putar, atau saluran di Explore lalu unduh dengan satu klik, atau klik kanan tautan mana pun di halaman
- **Pemblokir iklan saat Anda mau** — satu klik pada ikon perisai membuat Explore memblokir iklan dan pelacak di halamannya sendiri

---

## <a id="privacy"></a>🔒 Privasi

Unduhan diambil langsung melalui [yt-dlp](https://github.com/yt-dlp/yt-dlp) dari YouTube ke folder yang Anda pilih — tidak ada yang dirutekan melalui server pihak ketiga. Riwayat tontonan, riwayat unduhan, URL, dan konten file tetap ada di perangkat Anda.

Tanpa telemetri — hanya satu sinyal anonim per hari: versi aplikasi, OS, bahasa, saluran instalasi, dan negara, agar kami bisa menghitung pengguna aktif. Tanpa ID, URL, judul video, jalur file, atau info akun. Anda bisa mematikannya di Pengaturan.

Explore menyimpan login-nya sendiri, terpisah dari browser Anda, dan Arroxy tidak pernah membaca atau mengisi formulir login apa pun — Anda mengetik di halaman situs itu sendiri. Unduhan berjalan tanpa masuk; hanya saat satu unduhan gagal dengan cara yang bisa diperbaiki oleh sebuah akun, Arroxy membaca login itu saat itu juga, menyimpannya di file sementara untuk unduhan tersebut, lalu menghapus file itu setelahnya. Keluar dari Explore di Pengaturan akan melupakannya.

---

## <a id="faq"></a>❓ Pertanyaan Umum

<details>
<summary><strong>Apakah ini benar-benar gratis?</strong></summary>

Ya — berlisensi MIT, tanpa tingkat premium, tanpa fitur gating.

</details>

<details>
<summary><strong>Apa bedanya Arroxy dengan GUI yt-dlp lainnya?</strong></summary>

Sebagian besar GUI yt-dlp gratis adalah pembungkus yang hanya menerima tautan. Arroxy menambahkan **Explore**, browser yang terpasang di dalam aplikasi dan membuka YouTube atau situs lain mana pun: Anda menjelajah dan mengunduh tanpa menyalin tautan, dan cukup masuk sekali di sana untuk mengunduh video privat, khusus anggota, dan dengan batasan usia serta daftar Tonton Nanti dan Disukai Anda, tanpa mengekspor cookie. Arroxy memakai login itu saat YouTube meminta Anda mengonfirmasi bahwa Anda bukan bot, dan browser bawaannya mendapatkan token unduhan YouTube sehingga unduhan tidak turun ke format yang lebih sedikit. Lihat [Mengapa Arroxy](#why).

</details>

<details>
<summary><strong>Kualitas video apa yang dapat saya unduh?</strong></summary>

Apa pun yang disajikan YouTube: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio saja. Streaming 60 fps dan HDR dipertahankan apa adanya, dan unduhan langkah demi langkah memungkinkan Anda memilih AV1, VP9, atau H.264 di setiap resolusi.

</details>

<details>
<summary><strong>Bisakah saya mengekstrak audionya saja sebagai MP3?</strong></summary>

Ya. Pilih *audio saja* di menu format dan pilih MP3, M4A/AAC, Opus, atau WAV.

</details>

<details>
<summary><strong>Bagaimana cara mengunduh video yang memerlukan akun YouTube?</strong></summary>

Masuklah sekali di tab Explore. Arroxy kemudian dapat mengunduh video privat dan khusus anggota yang bisa ditonton akun Anda, video dengan batasan usia jika usia akun terverifikasi, serta daftar Tonton Nanti dan Disukai Anda. Login itu hanya dipakai saat unduhan gagal dengan cara yang bisa diperbaiki oleh sebuah akun; yang lain diunduh seperti biasa. Ini adalah pilihan **Login Explore**, tercantum pertama dan bertanda Disarankan di setelan cookie, dan Arroxy memilihnya untuk Anda saat pertama kali Anda membuka Explore. Wiki yt-dlp mencatat bahwa [otomatisasi dengan akun yang sudah masuk dapat menandai akun Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), jadi akun sekunder adalah pilihan yang lebih aman.

</details>

<details>
<summary><strong>Apakah ini akan tetap berfungsi ketika YouTube mengubah sesuatu?</strong></summary>

yt-dlp diperbarui secara otomatis saat peluncuran, dan Arroxy segera mengirimkan perbaikan ketika YouTube mengubah sesuatu. Saat YouTube meminta Anda mengonfirmasi bahwa Anda bukan bot, Arroxy juga mencoba login Explore Anda jika Anda sudah masuk di sana, dan cookie dari file atau browser tersedia di setelan cookie.

</details>

<details>
<summary><strong>Bahasa apa saja yang tersedia di Arroxy?</strong></summary>

31 bahasa langsung tersedia: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy otomatis mendeteksi bahasa sistem operasi Anda saat pertama kali dijalankan, dan Anda dapat beralih kapan saja dari pemilih bahasa di toolbar. JSON locale runtime berada di src/shared/i18n/locales/, dan katalog PO untuk penerjemah berada di i18n/locales/ — buka PR di GitHub untuk berkontribusi.

</details>

<details>
<summary><strong>Apakah saya perlu menginstal yang lain?</strong></summary>

Tidak. yt-dlp, ffmpeg, dan ffprobe diunduh secara otomatis pada peluncuran pertama dan disimpan dalam cache di mesin Anda. Setelah itu, tidak diperlukan pengaturan tambahan.

</details>

<details>
<summary><strong>Bisakah saya mengunduh daftar putar atau seluruh saluran?</strong></summary>

Ya — keduanya. Tempelkan URL daftar putar atau URL saluran (misalnya `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); pilih berapa banyak entri yang akan dipindai, lalu antri seluruh daftar atau pilih video tertentu. Filter rentang tanggal akan segera hadir.

</details>

<details>
<summary><strong>macOS mengatakan "aplikasi rusak" — apa yang harus saya lakukan?</strong></summary>

Itu macOS Gatekeeper memblokir aplikasi yang tidak ditandatangani, bukan kerusakan sebenarnya. Lihat [macOS peluncuran pertama](#macos-first-launch) untuk perintah Terminal yang menghapus karantina dan meluncurkan Arroxy.

</details>

<details>
<summary><strong>Apakah mengunduh video YouTube legal?</strong></summary>

Untuk penggunaan pribadi dan pribadi, ini diterima secara umum di sebagian besar yurisdiksi. Anda bertanggung jawab untuk mematuhi [Ketentuan Layanan](https://www.youtube.com/t/terms) YouTube dan undang-undang hak cipta setempat.

</details>

---

## <a id="roadmap"></a>🗺️ Peta jalan

Masih direncanakan — kira-kira dalam urutan prioritas:

| Fitur    | Keterangan    |
| ---------------- | ---------------- |
| **Daftar putar & filter saluran** | Filter rentang tanggal saat menghitung daftar putar atau saluran |
| **Preferensi trek audio YouTube** | Tetapkan preferensi trek bahasa lisan di seluruh aplikasi, dengan penggantian per profil ketika YouTube menawarkan beberapa trek audio |
| **Pemulihan coba lagi yang lebih kuat** | Jalur percobaan ulang baru untuk pengunduhan yang terganggu oleh koneksi internet yang tidak dapat diandalkan atau bermasalah |
| **Laci pengelola unduhan lengkap** | Ubah laci antrean menjadi pengelola yang lebih lengkap, termasuk mengubah folder tujuan untuk item antrean |
| **Unduhan terjadwal** | Memulai antrian pada waktu yang ditentukan (berjalan semalaman) |
| **Paket AUR** | Instal di Arch Linux dan Omarchy dengan `yay -S arroxy-bin` |

Punya ide fitur? [Buka permintaan](../../issues) — masukan komunitas membantu menentukan prioritas.

---

## <a id="support"></a>💖 Dukung Arroxy

Arroxy gratis dan berlisensi MIT — tanpa iklan, tanpa telemetri, tanpa versi berbayar. Jika Arroxy menghemat waktu Anda, Anda bisa mendukung pengembangannya dengan Bitcoin, Tron, atau Ethereum: alamatnya ada di [DONATE.md](DONATE.md), satu-satunya sumber resmi untuk alamat tersebut. Arroxy tidak akan pernah mengirimi Anda alamat lewat email atau pesan langsung. Memberi bintang pada repo, melaporkan bug, dan memperbaiki terjemahan sama besar bantuannya.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Dibangun dengan

<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell desktop lintas platform
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — gaya
- **Zustand** — manajemen state
- **yt-dlp** + **ffmpeg** — mesin unduh dan mux (keduanya diambil saat runtime: yt-dlp dijaga tetap terbaru, ffmpeg/ffprobe dipasang sekali dan dipertahankan setelah pembaruan)
- **Vite** + **electron-vite** — tooling build
- **Vitest** + **Playwright** — pengujian unit dan menyeluruh

</details>

<details>
<summary><strong>Bangun dari sumber</strong></summary>

### Prasyarat — semua platform

| Alat | Versi | Instal |
| ------- | ------- | ------- |
| Git | apapun | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` atau `.node-version` |
| Bun | 1.4.2 | `mise install` atau `package.json` `packageManager` |

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

Setelah kloning, jalankan `mise trust && mise install` dari checkout. Jika shell Anda sudah menggunakan `fnm`, `nvm`, atau Homebrew Bun, aktifkan mise di `~/.zshrc` sehingga Arroxy mendapatkan Node.js 24.21.0 dan Bun 1.4.2:

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

> `bun run bootstrap` memasang dependensi, membangun kembali dependensi aplikasi Electron, memverifikasi Electron, menyiapkan ffmpeg/ffprobe tertanam untuk pengembangan, dan menginstal Playwright Chromium. Build rilis mengelola yt-dlp, ffmpeg, dan ffprobe saat runtime di folder data aplikasi Anda; tidak satu pun disertakan di dalam installer.

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

## 📜 Ketentuan penggunaan

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
