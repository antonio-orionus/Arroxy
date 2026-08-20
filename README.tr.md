<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy maskotu" width="180" />

# Arroxy — Windows, macOS ve Linux için Ücretsiz Açık Kaynak YouTube (+ 2000 site) İndirici

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Şu dilde oku:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · **Türkçe** · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Sürüm](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Derleme](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Web sitesi](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Lisans](https://img.shields.io/badge/license-MIT-green) ![Platformlar](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Diller](https://img.shields.io/badge/i18n-23_languages-blue)

**YouTube ve 2000+ desteklenen siteden** video, Shorts, müzik, kanal, podcast veya ses parçaları indir — 60 fps'de 4K HDR'a kadar ya da MP3 / AAC / Opus olarak. Windows, macOS ve Linux'ta yerel çalışır. **Reklam yok, şişkinlik yok, ek satış yok.**

[**↓ En son sürümü kur**](#install) &nbsp;·&nbsp; [**Web sitesi**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows ilk başlatma](#windows-first-launch) · [macOS ilk başlatma](#macos-first-launch) · [Linux ilk başlatma](#linux-first-launch)

[![Discord Topluluğuna Katıl](https://img.shields.io/badge/Discord%20Toplulu%C4%9Funa%20Kat%C4%B1l-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Arroxy demosu" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

Arroxy sana zaman kazandırıyorsa, bir ⭐ başkalarının onu bulmasına yardım eder.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-08-17._

> 🌐 Bu, yapay zeka destekli bir çeviridir. [İngilizce README](README.md) gerçek kaynak kabul edilir. Hata mı gördün? [PR'lar memnuniyetle karşılanır](../../pulls).

---

## İçindekiler

- [Kurulum ve ilk başlatma](#install)
  - [Paket yöneticisiyle kur](#package-manager)
  - [Windows ilk başlatma](#windows-first-launch)
  - [macOS ilk başlatma](#macos-first-launch)
  - [Neden uyarı görebilirsin](#why-warning)
  - [Linux ilk başlatma](#linux-first-launch)
  - [İndirmeni doğrula (SHA256)](#verify)
- [Neden Arroxy](#why)
- [Özellikler](#features)
- [Gizlilik](#privacy)
- [SSS](#faq)
- [Yol haritası](#roadmap)
- [Kullanılan teknolojiler](#tech)

---

## <a id="install"></a>Kurulum ve ilk başlatma

| Platform | Doğrudan indirme                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe)                                                                                                                                                                                                        |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg)                                                                                                                                                                                                                     |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS)                                                                                                                                                                                                                                                                                                                                                                                                                                              |

[**Tüm sürüm dosyaları →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="package-manager"></a>Paket yöneticisiyle kur

Zaten bir paket yöneticisi kullanıyorsan elle indirme yolunu atlayabilirsin.

| Kanal | Komut                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak (local file) | `flatpak install --user ./Arroxy-linux-x64.flatpak`                                            |

### <a id="windows-first-launch"></a>Windows ilk başlatma

İlk başlatmada **"Windows bilgisayarınızı korudu"** veya **"Bilinmeyen yayımcı"** görebilirsin. Bu hem `Arroxy-win-x64-Setup.exe` hem de `Arroxy-win-x64-Portable.exe` için geçerlidir. Arroxy ücretsiz ve açık kaynaklıdır; Windows derlemeleri ücretli bir sertifikayla kod imzalı değildir, SmartScreen bu yüzden işaretler. Bu, Arroxy’nin otomatik olarak güvensiz olduğu anlamına gelmez. Devam etmek için:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows bilgisayarınızı korudu" penceresinde "Daha fazla bilgi" bağlantısı vurgulanmış" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="Daha fazla bilgi açıldıktan sonra "Yine de çalıştır" düğmesini gösteren SmartScreen penceresi" />
</div>

1. **Daha fazla bilgi** seçeneğine tıkla.
2. **Yine de çalıştır** seçeneğine tıkla.

#### Windows Defender dosyayı işaretler veya kaldırırsa

Defender sezgisel kuralları bazen imzasız NSIS kurucuları ve Electron taşınabilirlerini şüpheli olarak işaretler. Defender `Arroxy-win-x64-Setup.exe` veya `Arroxy-win-x64-Portable.exe` dosyasını karantinaya alırsa **Windows Güvenliği → Virüs ve tehdit koruması → Koruma geçmişi** içinden geri yükle, sonra Arroxy yürütülebilir dosyasını **Ayarları yönet → Dışlamalar ekle veya kaldır** altında izin verilen öğe olarak ekle. SmartScreen'de olduğu gibi tetikleyici eksik yayımcı imzasıdır, tespit edilmiş kötü amaçlı yazılım değil.

> Arroxy'yi yalnızca resmi GitHub Releases sayfasından indir. Dosyayı başka bir web sitesinden aldıysan veya biri sana gönderdiyse sil ve resmi kaynaktan yeni kopya indir. Kaynak kodu herkese açık; istersen inceleyebilir veya Arroxy'yi kendin derleyebilirsin.

### <a id="macos-first-launch"></a>macOS ilk başlatma

Arroxy henüz macOS için kod imzalı değildir, bu yüzden Gatekeeper DMG'den kurduktan sonra korkutucu *"Arroxy.app is damaged and can't be opened"* penceresini gösterebilir. Bu mesaj macOS'un imzasız uygulamayı karantinaya aldığı anlamına gelir; uygulama dosyalarının gerçekten hasarlı olduğu anlamına gelmez. Güncel macOS'ta güvenilir çözüm Terminal'dir:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Bağlanan DMG'den `Arroxy.app` dosyasını `/Applications` içine sürükle.
2. Terminal'i aç ve şu iki komutu çalıştır:

```bash
sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

İlk komut kurulu Arroxy kopyandan karantina özniteliğini kaldırır. İkinci komut uygulamayı başlatır. `sudo` Mac parolanı isteyebilir; Terminal yazarken karakterleri göstermez.

**Apple Silicon ve Intel:** M serisi Mac'te (M1 / M2 / M3 / M4) `arm64` DMG indir. Intel Mac'lerde `x64` DMG indir. Yanlış derleme Rosetta ile çalışır ama belirgin şekilde daha yavaştır.

> macOS derlemeleri Apple Silicon ve Intel CI runner'larında üretilir. Sorun yaşarsan lütfen [issue aç](../../issues) — macOS kullanıcılarından gelen geri bildirim macOS test döngüsünü doğrudan şekillendirir.

### <a id="why-warning"></a>Neden uyarı görebilirsin

Arroxy açık kaynaklı ve MIT lisanslıdır. Windows ve macOS derlemeleri **kod imzalı değildir** — Apple Developer ID ve Windows EV kod imzalama sertifikalarının her biri yılda yüzlerce dolara mal olur; bağımsız bir proje bunu cebinden öder. Bu imzalar olmayınca Windows SmartScreen ve macOS Gatekeeper ilk başlatmada uyarır. Uyarılar *işletim sisteminin yayımcıyı tanımadığı* anlamına gelir — Arroxy'nin kötü amaçlı yazılım olduğu anlamına gelmez.

Arroxy'yi kendin doğrulamanın giderek daha sıkı üç yolu:

- **Kaynağı oku.** Her satır [GitHub](https://github.com/antonio-orionus/Arroxy) üzerinde ve [kaynaktan derleyebilirsin](#tech).
- **SHA256 kontrol et.** Dosyanı yayımlanan [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) ile eşleştir — aşağıdaki [İndirmeni doğrula](#verify) bölümüne bak.
- **Üçüncü taraf taraması yap.** Dosyayı [VirusTotal](https://www.virustotal.com) üzerine yükle.

### <a id="linux-first-launch"></a>Linux ilk başlatma

AppImage'lar doğrudan çalışır — kurulum gerekmez. Sadece dosyayı yürütülebilir olarak işaretlemen gerekir.

**Dosya yöneticisi:** `.AppImage` üzerine sağ tık → **Özellikler** → **İzinler** → **Dosyayı program olarak çalıştırmaya izin ver** seçeneğini aç, sonra çift tıkla.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Açılış hâlâ başarısızsa FUSE eksik olabilir:

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**İsteğe bağlı masaüstü entegrasyonu:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) bir kez kurulduğunda, çift tıkladığın her AppImage otomatik olarak başlatıcı menüne kaydolur — elle `.desktop` dosyası gerekmez.

**Flatpak (sandbox'lı alternatif):** aynı sürüm sayfasından `Arroxy-linux-x64.flatpak` indir.

```bash
flatpak install --user ./Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>İndirmeni doğrula (SHA256)</strong></summary>

Her sürüm ikili dosyaların yanında bir `SHA256SUMS` dosyası yayımlar. İndirmenin aktarım sırasında bozulmadığını veya değiştirilmediğini kontrol etmek için dosyanı yerel olarak hash'le ve `SHA256SUMS` içindeki satırla eşleştir. En son sürüm sayfasını aç → **Assets** → `SHA256SUMS` indir.

**Windows (PowerShell veya Komut İstemi):**

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

Üçüncü taraf kötü amaçlı yazılım taraması ister misin? Dosyayı [VirusTotal](https://www.virustotal.com) üzerine yükle. İmzasız Electron uygulamaları için küçük motorlardan gelen birkaç genel sezgisel uyarı normaldir; büyük motorlardan yaygın tespitler gerçek bir endişe olurdu.

</details>

<details>
<summary><strong>Windows: Kurucu mu Taşınabilir mi</strong></summary>

|               | NSIS Kurucu | Taşınabilir `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Kurulum gerekli | Evet  | Hayır — her yerden çalıştır  |
| Otomatik güncellemeler | ✅ uygulama içinde  | ❌ elle indirme  |
| Başlangıç hızı | ✅ daha hızlı  | ⚠️ soğuk başlangıç daha yavaş  |
| Başlat Menüsüne ekler |            ✅            |           ❌            |
| Kolay kaldırma |            ✅            | ❌ dosyayı sil  |

**Öneri:** otomatik güncellemeler ve daha hızlı başlangıç için NSIS kurucuyu kullan. Kurulum yapmadan, kayıt defterine dokunmadan kullanmak için taşınabilir `.exe` uygundur.

</details>

---

## <a id="why"></a>Neden Arroxy

En yaygın alternatiflerle yan yana karşılaştırma:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Ücretsiz, premium katman yok |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Açık kaynak |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Yalnızca yerel işleme |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Giriş veya çerez dışa aktarma yok |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Kullanım sınırı yok |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Platformlar arası masaüstü uygulaması |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Altyazılar + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy tek bir şey için yapılmıştır: URL yapıştır, temiz bir yerel dosya al. Hesap yok, ek satış yok, veri toplama yok.

---

## <a id="features"></a>Özellikler

### Kalite ve biçimler

- **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p'ye kadar
- **Yüksek kare hızı** olduğu gibi korunur — 60 fps, 120 fps, HDR
- **Ses** — yalnızca sesi MP3, M4A/AAC, Opus veya WAV olarak dışa aktar. Etkileşimli indirmelerde varsa kaynağın yerel surround/Dolby parçalarını (AC-3, E-AC-3, 5.1, DRC) seç veya genel **Surround / Dolby tercih et** varsayılanı ayarla
- Hızlı ön ayarlar: *En iyi kalite* · *Dengeli* · *Küçük dosya*

### Gizlilik ve kontrol

- %100 yerel işleme — indirmeler doğrudan YouTube'dan diskine gider
- **Açık kaynak** — her satır denetlenebilir, MIT lisanslı
- Dosyalar doğrudan seçtiğin klasöre kaydedilir

### İş akışı

- **Esnek başlangıç modları** — rehberli tek indirme, oynatma listesi/kanal seçici, toplu URL yapıştırma veya kayıtlı varsayılanlarla Hızlı İndirme seç
- **Merkezi indirme kuyruğu** — her tekil, oynatma listesi, toplu veya hızlı iş; ilerleme, duraklatma, sürdürme, iptal, yeniden deneme ve öncelik kontrolü için tek yere gelir
- **Pano izleme** — bir YouTube bağlantısı kopyala; uygulamaya tekrar odaklandığında Arroxy URL'yi otomatik doldurur (Gelişmiş ayarlardan aç)
- **Otomatik URL temizleme** — izleme parametrelerini (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) kaldırır ve `youtube.com/redirect` bağlantılarını çözer
- **Tepsi modu** — pencere kapansa bile indirmeler arka planda sürer
- **23 dil** — sistem dilini otomatik algılar, istediğin zaman değiştirilebilir
- **Oynatma listesi eşitleme** — zaten indirilmiş videoları atlamak için bir oynatma listesini yerel klasöre karşı yeniden tara; her indirilen videoyla güncellenen bir `.m3u` oynatma listesi dosyası oluşturur
- **Hız ve tempo kontrolleri** — indirme bant genişliğini sınırla, bir videonun aynı anda kaç parçasının indirileceğini ayarla ve ön ayarlarla istek gecikmeleri ekle (*Kapalı · Dengeli · Dikkatli · Özel*)
- **Dosya adı şablonları** — indirmelerinizi `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` ve `{playlist_index}` ile dilediğiniz gibi adlandırın; genel olarak veya indirme profili başına
- **Aynı anda indirme ve otomatik yeniden deneme** — kuyruktaki kaç indirmenin aynı anda çalışacağını seç ve ağ ya da sunucu kaynaklı sorun yaşayan bir indirmeyi Arroxy'nin, her denemeden önce daha uzun bekleyerek yeniden denemesine izin ver
- **Oynatma listesinde öğe başına profil** — bir oynatma listesindeki her videoya, tüm liste için tek bir ayar yerine kendi indirme profilini atayın; böylece tek geçişte bazılarını tam kalitede arşivleyip kalanını MP3 olarak alabilirsiniz

### Altyazılar ve son işleme

- **Altyazılar** SRT, VTT veya ASS olarak — manuel ya da otomatik oluşturulmuş, mevcut herhangi bir dilde
- Videonun yanına kaydet, `.mkv` içine göm veya `Subtitles/` alt klasöründe düzenle
- **SponsorBlock** — sponsorları, intro'ları, outro'ları ve öz tanıtımları atla ya da bölüm olarak işaretle
- **Gömülü meta veriler** — başlık, yükleme tarihi, kanal, açıklama, küçük resim ve bölüm işaretleri dosyaya yazılır

### YouTube + 2000 site

- **YouTube, tam kapsamlı** — Videolar, Shorts, Kanallar, Oynatma Listeleri, YouTube Music ve Podcast'ler birinci sınıf kaynak olarak ele alınır
- **yt-dlp aracılığıyla 2000+ diğer site** — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org ve daha fazlası
- **Yalnızca ses ve altyazılar** yalnızca YouTube'da değil, desteklenen her sitede çalışır
- Bir site değişirse yt-dlp haftalık düzeltmeler yayınlar ve Arroxy açılışta ikili dosyayı otomatik günceller

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Oynatma listesinde öğe başına profil</b><br/>Her videoya kendi profilini ver — bazılarını 4K arşivle, kalanını MP3 olarak al</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Hızlı İndirme ana ekranı</b><br/>Bir URL yapıştır ve etkin profilinle anında çek</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Yeniden kullanılabilir indirme profilleri</b><br/>Biçim, kalite ve çıktı ön ayarlarını kaydet — her indirmede yeniden kullan</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Çok dilli ses parçaları</b><br/>Videonun sunduğu tam ses dilini seç</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Surround / Dolby ses</b><br/>5.1 ve Dolby parçaları algılanır ve korunur</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Toplu URL modu</b><br/>Bir liste yapıştır, otomatik tekilleştir, hepsini tek seferde kuyruğa al</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Paralel indirme kuyruğu</b><br/>Canlı ilerlemeyle aynı anda birden fazla indirme</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>Gizlilik

İndirmeler [yt-dlp](https://github.com/yt-dlp/yt-dlp) ile doğrudan YouTube'dan seçtiğin klasöre alınır — hiçbir şey üçüncü taraf sunucu üzerinden yönlendirilmez. İzleme geçmişi, indirme geçmişi, URL'ler ve dosya içerikleri cihazında kalır.

Arroxy [OpenPanel](https://openpanel.dev) üzerinden anonim, toplu telemetri gönderir — bağımsız bir projenin açılışları, işletim sistemlerini, uygulama sürümlerini ve çökmeleri anlamasına yetecek kadar. URL, video başlığı, dosya yolu, hesap bilgisi, parmak izi veya kişisel veri yoktur. Kurulum başına kimlik rastgeledir ve kimliğinle bağlantılı değildir. Ayarlar'dan çıkabilirsin.

---

## <a id="faq"></a>SSS

**Gerçekten ücretsiz mi?**
Evet — MIT lisanslı, premium katman yok, özellik kilidi yok.

**Hangi video kalitelerini indirebilirim?**
YouTube ne sunuyorsa: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p ve yalnızca ses. 60 fps, 120 fps ve HDR akışlar olduğu gibi korunur.

**Yalnızca sesi MP3 olarak çıkarabilir miyim?**
Evet. Biçim menüsünde *yalnızca ses* seç ve MP3, M4A/AAC, Opus veya WAV tercih et.

**YouTube hesabı veya çerez gerekir mi?**
Varsayılan olarak hayır — Arroxy YouTube hesabı, giriş veya çerez dışa aktarma olmadan çalışır. Yaş kısıtlamalı veya üyelere özel videolar gibi kimlik doğrulaması gerektiren içerikler için Gelişmiş ayarlarda isteğe bağlı çerez desteği vardır (Çerez kaynağı: dosya veya tarayıcı). Varsayılan olarak kapalıdır. Etkinleştirirsen yt-dlp wiki'si [çerez tabanlı otomasyonun bir Google hesabını işaretleyebileceğini](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) belirtir; bu durumda geçici bir hesap daha güvenlidir.

**YouTube bir şey değiştirdiğinde çalışmaya devam eder mi?**
yt-dlp açılışta otomatik güncellenir ve YouTube bir şey değiştirdiğinde Arroxy hızlıca düzeltme yayımlar. Yine de sorun yaşarsan Gelişmiş ayarlarda isteğe bağlı çerez desteği yedek yol olarak kullanılabilir.

**Arroxy hangi dillerde mevcut?**
Kutudan çıktığı gibi 23 dil: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Kiswahili · O'zbekcha · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · বাংলা · हिन्दी · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語. Arroxy ilk açılışta işletim sisteminin dilini otomatik algılar ve araç çubuğundaki dil seçiciden istediğin zaman değiştirebilirsin. Çalışma zamanı locale JSON dosyaları src/shared/i18n/locales/ içinde, çevirmenlere yönelik PO katalogları i18n/locales/ içinde bulunur — katkı için GitHub'da PR aç.

**Başka bir şey kurmam gerekir mi?**
Hayır. yt-dlp ilk açılışta otomatik indirilir ve makinede önbelleğe alınır; ffmpeg ve ffprobe uygulamayla gelir. Bundan sonra ek kurulum gerekmez.

**Oynatma listeleri veya tüm kanalları indirebilir miyim?**
Evet — ikisi de. Bir oynatma listesi URL'si veya kanal URL'si yapıştır (örn. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); kaç kayıt taranacağını seç, sonra tüm listeyi kuyruğa al veya belirli videoları seç. Tarih aralığı filtreleri yakında geliyor.

**macOS "uygulama hasarlı" diyor — ne yapmalıyım?**
Bu, macOS Gatekeeper’ın imzasız uygulamayı engellemesidir; gerçek hasar değildir. Karantinayı kaldırıp Arroxy’yi başlatan Terminal komutları için [macOS ilk başlatma](#macos-first-launch) bölümüne bak.

**YouTube videoları indirmek yasal mı?**
Kişisel, özel kullanım için çoğu yargı alanında genellikle kabul edilir. YouTube'un [Hizmet Şartları](https://www.youtube.com/t/terms) ve yerel telif hakkı yasalarına uymaktan sen sorumlusun.

---

## <a id="roadmap"></a>Yol haritası

Hâlâ planlananlar — yaklaşık öncelik sırasıyla:

| Özellik    | Açıklama    |
| ---------------- | ---------------- |
| **Oynatma listesi ve kanal filtreleri** | Bir oynatma listesi veya kanal listelenirken tarih aralığı filtreleri |
| **YouTube ses parçası tercihleri** | YouTube birden fazla ses parçası sunduğunda profil bazlı geçersiz kılmalarla birlikte uygulama geneli konuşulan dil tercihi ayarla |
| **Uygulama içi tarayıcı oturumu** | Elle dışa aktarma olmadan oturum açıp site çerezlerini kullanabilmen için Arroxy içinde tarayıcı pencereleri aç |
| **Tek tıkla video indirme** | Algılanan veya yapıştırılan URL’den etkin profilini kullanarak tek tıkla video indirmesi başlat |
| **Daha güçlü yeniden deneme kurtarması** | Güvenilmez veya sorunlu internet bağlantılarıyla kesilen indirmeler için yeni bir yeniden deneme yolu |
| **Tam indirme yöneticisi çekmecesi** | Kuyruk çekmecesini, kuyruktaki öğelerin hedef klasörlerini değiştirme dahil daha kapsamlı bir yöneticisine dönüştür |
| **Zamanlanmış indirmeler** | Bir kuyruğu belirli saatte başlat (gece çalıştırmaları) |
| **Klip kırpma** | Yalnızca başlangıç/bitiş zamanıyla belirli bir segmenti indir |

Aklında bir özellik mi var? [İstek aç](../../issues) — topluluk girdisi önceliği şekillendirir.

---

## <a id="tech"></a>Kullanılan teknolojiler

<details>
<summary><strong>Teknoloji yığını</strong></summary>

- **Electron** — platformlar arası masaüstü kabuğu
- **React 19** + **TypeScript** — kullanıcı arayüzü
- **Tailwind CSS v4** — stillendirme
- **Zustand** — durum yönetimi
- **yt-dlp** + **ffmpeg** — indirme ve mux motoru (yt-dlp çalışma zamanında alınır; ffmpeg/ffprobe derleme zamanında paketlenir)
- **Vite** + **electron-vite** — derleme araçları
- **Vitest** + **Playwright** — birim ve uçtan uca testler

</details>

<details>
<summary><strong>Kaynaktan derle</strong></summary>

### Ön koşullar — tüm platformlar

| Araç    | Sürüm   | Kurulum |
| ------- | ------- | ------- |
| Git     | herhangi | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | `mise install` veya `.node-version` |
| Bun     | 1.2.23  | `mise install` veya `package.json` `packageManager` |

Önerilen: `mise` kur, sonra checkout içinde `mise install` çalıştır. mise olmadan, `bun run bootstrap` öncesinde Node.js'i `.node-version` üzerinden ve Bun'ı `package.json` üzerinden elle etkinleştir.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Yerel yeniden derlemeler için Visual Studio Build Tools ve Python gerekebilir.

### macOS

```bash
brew install mise
xcode-select --install
```

Klonladıktan sonra checkout içinde `mise trust && mise install` çalıştır. Shell'in zaten `fnm`, `nvm` veya Homebrew Bun kullanıyorsa, Arroxy'nin Node.js 24.16.0 ve Bun 1.2.23 alması için `~/.zshrc` içinde mise'i etkinleştir:

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

# Derleme + Electron çalışma zamanı bağımlılıkları
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Yalnızca E2E testleri için (Electron bir ekran ister)
sudo apt install -y xvfb
```

### Klonla ve çalıştır

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # önerilir; sabitlenmiş araçları elle etkinleştirdiysen atla
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer'a karşı Electron uygulaması
```

### Dağıtılabilir paket derle

```bash
bun run build        # typecheck + compile
bun run dist         # geçerli işletim sistemi için paketle
bun run dist:win     # desteklenen bir host üzerinde Windows hedeflerini paketle
```

> `bun run bootstrap` bağımlılıkları kurar, Electron uygulama bağımlılıklarını yeniden derler, Electron'u doğrular, geliştirme için gömülü ffmpeg/ffprobe hazırlar ve Playwright Chromium kurar. yt-dlp uygulama veri klasöründe çalışma zamanında yönetilir; ffmpeg ve ffprobe her Arroxy sürümüyle paketlenir.

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

## Kullanım şartları

Arroxy yalnızca kişisel, özel kullanım için bir araçtır. İndirmelerinin YouTube [Hizmet Şartları](https://www.youtube.com/t/terms) ve bulunduğun yargı alanındaki telif hakkı yasalarına uygun olduğundan yalnızca sen sorumlusun. Kullanma hakkına sahip olmadığın içerikleri indirmek, çoğaltmak veya dağıtmak için Arroxy'yi kullanma. Geliştiriciler kötüye kullanımdan sorumlu değildir.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT Lisansı · Özenle geliştiren <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
