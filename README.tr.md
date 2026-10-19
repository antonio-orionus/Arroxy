<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy maskotu" width="180" />

# Arroxy — Windows, macOS ve Linux için Dahili Tarayıcılı, Ücretsiz Açık Kaynak YouTube (+ 2000 site) İndirici

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Şu dilde oku:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · **Türkçe** · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Sürüm](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Derleme](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Web sitesi](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Lisans](https://img.shields.io/badge/license-MIT-green) ![Platformlar](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Diller](https://img.shields.io/badge/i18n-31_languages-blue)

**YouTube ve 2000+ desteklenen siteden** video, Shorts, müzik, kanal, podcast veya ses parçaları indir — 60 fps'de 8K HDR'a kadar, MP3 / AAC / Opus olarak ya da yalnızca ihtiyacın olan kısmı. Explore sekmesinde **YouTube'a ya da başka herhangi bir siteye Arroxy içinden göz at** ve baktığın videoyu, oynatma listesini veya kanalı indir; hesabının izleyebildiği özel, üyelere özel ve yaş kısıtlamalı videoları indirmek için orada giriş yap. Windows, macOS ve Linux'ta yerel çalışır. **Reklam yok, şişkinlik yok, ek satış yok.**

[**↓ En son sürümü kur**](#install) &nbsp;·&nbsp; [**Web sitesi**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Windows ilk başlatma](#windows-first-launch) · [macOS ilk başlatma](#macos-first-launch) · [Linux ilk başlatma](#linux-first-launch)

[![Discord Topluluğuna Katıl](https://img.shields.io/badge/Discord%20Toplulu%C4%9Funa%20Kat%C4%B1l-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Arroxy sana zaman kazandırıyorsa, bir ⭐ başkalarının onu bulmasına yardım eder.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Bu, yapay zeka destekli bir çeviridir. [İngilizce README](README.md) gerçek kaynak kabul edilir. Hata mı gördün? [PR'lar memnuniyetle karşılanır](../../pulls).

---

## İçindekiler

- [✨ Özellikler](#features)
- [📥 Kurulum ve ilk başlatma](#install)
  - [Windows ilk başlatma](#windows-first-launch)
  - [macOS ilk başlatma](#macos-first-launch)
  - [Neden uyarı görebilirsin](#why-warning)
  - [Linux ilk başlatma](#linux-first-launch)
  - [İndirmeni doğrula (SHA256)](#verify)
- [⚖️ Neden Arroxy](#why)
- [🔒 Gizlilik](#privacy)
- [❓ SSS](#faq)
- [🗺️ Yol haritası](#roadmap)
- [💖 Arroxy'yi destekle](#support)
- [🛠️ Kullanılan teknolojiler](#tech)

---

## <a id="features"></a>✨ Özellikler

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>YouTube'a ya da başka herhangi bir siteye Arroxy içinden göz at ve bulunduğun sayfayı aktif profilinle indir</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore'un ilk ekranı</b><br/>Explore'a kısa bir bakış ve ikincil hesabın neden daha güvenli giriş olduğu</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>İndirmeler sana neye ihtiyaç olduğunu söyler</b><br/>Bağlantılar arka planda hazırlanır; başarısız olan çözümünü sunar, uzun bir oynatma listesi seçimini bekler</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Videonun yalnızca bir bölümünü indirin</b><br/>Başlangıç ve bitiş ya da bir bölüm seçin — Arroxy yalnızca o aralığı kaydeder</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Profil düzenleyici</b><br/>Bir profili ayarlayın: dosya türü, çözünürlük, altyazılar, hedef, dosya adı şablonu ve daha fazlası</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Koyu ya da açık, cam ya da sade</b><br/>Seçebileceğiniz dört görünüm: hareketli bir gökyüzü üzerinde cam paneller ya da sakin düz yüzeyler, her biri koyu ve açık temada</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy genel indirme kısayolu — Windows ve Linux'ta Ctrl+Shift+D, macOS'ta Cmd+Shift+D, kopyalanan bağlantıyı doğrudan indirme kuyruğuna gönderir" width="760" /></picture><br/><sub><b>Genel indirme kısayolu</b><br/>Bağlantıyı nerede olursan ol kopyala, bir kez bas — kuyruğa girer ve inmeye başlar</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Oynatma listesinde öğe başına profil</b><br/>Her videoya kendi profilini ver — bazılarını 4K arşivle, kalanını MP3 olarak al</sub></td>
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

<details open>
<summary><strong>🧭 Explore: Web'de Arroxy içinden gez</strong></summary>

- **Explore sekmesi** — YouTube'a ya da başka herhangi bir siteye Arroxy içinden göz at ve bulduklarını bağlantı kopyalamadan indir. **İndir · *profilin*** baktığın videoyu, oynatma listesini veya kanalı kuyruğa ekler; yanındaki ok profil değiştirir, sihirli değnek ise biçim, altyazı ve daha fazlasını seçebileceğin adım adım indirmeyi açar
- **Sağ tıklayarak indir** — Explore'da herhangi bir video, oynatma listesi veya kanal bağlantısına sağ tıklayıp profilinle indir, **Profille indir** menüsünden başka bir profil seç, adım adım indirmeyi aç ya da bağlantıyı kopyala. Her videoyu önce açman gerekmez
- **Kompakt düzen** — Explore araç çubuğundaki tek bir tıklama Arroxy'nin sekmelerini oraya taşır ve sayfaya daha fazla yer açar
- **Adres çubuğu** — YouTube'da aramak için yaz ya da herhangi bir web adresi gir, o site açılsın
- **Hesap gerektiren indirmeler** — Explore'da bir kez giriş yap; Arroxy hesabının izleyebildiği özel ve üyelere özel videoları, hesabın yaşı doğrulanmışsa yaş kısıtlamalı videoları, ayrıca Daha Sonra İzle ve Beğenilenler listelerini indirebilir. Başka sitelerde de orada giriş yap; onların indirmeleri gerektiğinde bu girişi kullanır. Arroxy yine de önce oturum açmadan indirir ve Explore girişini yalnızca bir indirme, hesabın düzeltebileceği bir şekilde başarısız olduğunda kullanır. YouTube robot olmadığını doğrulamanı istediğinde Arroxy Explore girişini de dener
- **İkincil hesap kullan** — Explore'un ilk ekranı nedenini açıklar: bir hesapla indirmek, o hesabın kısıtlanması riskini bir ölçüde taşır. Girişlerini unutmak istediğinde Ayarlar'dan Explore'dan çıkış yap
- **Reklam engelleyici** — varsayılan olarak kapalı. Explore araç çubuğundaki kalkana tek tıklama, sayfalarındaki reklamları ve izleyicileri indirmeleri etkilemeden engeller. YouTube, giriş yapılmış hesaplarda reklam engelleyicilere karşı önlem alabilir

</details>

<details>
<summary><strong>🎞️ Kalite ve biçimler</strong></summary>

- **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p'ye kadar
- **Yüksek kare hızı ve HDR** olduğu gibi korunur — 60 fps, HDR10
- **Ses** — yalnızca sesi MP3, M4A/AAC, Opus veya WAV olarak dışa aktar. Etkileşimli indirmelerde varsa kaynağın yerel surround/Dolby parçalarını (AC-3, E-AC-3, 5.1, DRC) seç veya genel **Surround / Dolby tercih et** varsayılanı ayarla
- **Hedefli profiller** — *En iyi görüntü* (AV1 · VP9) veya *Akıllı TV* (MP4 · H.264); yeniden kodlamadan Otomatik, MP4, MKV veya WebM olarak kaydedilir. HDR ise *Otomatik* (yalnızca ekranın gösterebiliyorsa), *SDR* veya *HDR*
- **Her çözünürlükte her codec** — adım adım indirme her çözünürlükte AV1, VP9 ve H.264'ü yan yana listeler; böylece TV'nin veya düzenleme programının oynattığını seçebilirsin
- **Bir akışın gerçekte ne olduğunu bil** — YouTube'un yapay zekayla büyüttüğü çözünürlükler, yapay zekayla seslendirilmiş ses dilleri, geliştirilmiş bit hızlı akışlar, 360° videolar ve hasarlı ya da filigranlı kopyalar işaretlenir. Profiller, sen izin vermedikçe yapay zekayla büyütülmüş akışları atlar

</details>

<details>
<summary><strong>🛡️ Gizlilik ve kontrol</strong></summary>

- %100 yerel işleme — indirmeler doğrudan YouTube'dan diskine gider
- **Açık kaynak** — her satır denetlenebilir, MIT lisanslı
- Dosyalar doğrudan seçtiğin klasöre kaydedilir

</details>

<details>
<summary><strong>⚡ İş akışı</strong></summary>

- **Genel indirme kısayolu** — herhangi bir uygulamada bir bağlantı kopyala ve `Ctrl+Shift+D` (macOS'ta `Cmd+Shift+D`) tuşlarına bas; Arroxy pencereyi açmadan aktif profilinle kuyruğa ekler ve bir bildirim bunu doğrular. Varsayılan olarak açık, yeniden atanabilir
- **Esnek başlangıç modları** — rehberli tek indirme, oynatma listesi/kanal seçici, toplu URL yapıştırma, kayıtlı varsayılanlarla Hızlı İndirme veya Explore'da gezip indirme seç
- **Merkezi indirme kuyruğu** — her tekil, oynatma listesi, toplu veya hızlı iş; ilerleme, duraklatma, sürdürme, iptal, yeniden deneme ve öncelik kontrolü için tek yere gelir
- **Pano izleme** — bir video bağlantısı kopyala; Arroxy'ye döndüğünde URL alanını doldurur, istemediysen **Geri al** ile vazgeçebilirsin. Arroxy meşgulken bağlantı, sen URL sekmesine dönene kadar bekler (Ayarlar'dan kapatılabilir)
- **Otomatik URL temizleme** — izleme parametrelerini (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) kaldırır ve `youtube.com/redirect` bağlantılarını çözer
- **Tepsi modu** — pencere kapansa bile indirmeler arka planda sürer
- **31 dil** — sistem dilini otomatik algılar, istediğin zaman değiştirilebilir
- **Oynatma listesi eşitleme** — zaten indirilmiş videoları atlamak için bir oynatma listesini yerel klasöre karşı yeniden tara; her indirilen videoyla güncellenen bir `.m3u` oynatma listesi dosyası oluşturur
- **Hız ve tempo kontrolleri** — indirme bant genişliğini sınırla, bir videonun aynı anda kaç parçasının indirileceğini ayarla ve ön ayarlarla istek gecikmeleri ekle (*Kapalı · Dengeli · Dikkatli · Özel*)
- **Dosya adı şablonları** — indirmelerinizi `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` ve `{playlist_index}` ile dilediğiniz gibi adlandırın; genel olarak veya indirme profili başına
- **Aynı anda indirme ve otomatik yeniden deneme** — kuyruktaki kaç indirmenin aynı anda çalışacağını seç ve ağ ya da sunucu kaynaklı sorun yaşayan bir indirmeyi Arroxy'nin, her denemeden önce daha uzun bekleyerek yeniden denemesine izin ver
- **Oynatma listesinde öğe başına profil** — bir oynatma listesindeki her videoya, tüm liste için tek bir ayar yerine kendi indirme profilini atayın; böylece tek geçişte bazılarını tam kalitede arşivleyip kalanını MP3 olarak alabilirsiniz
- **Hızlı İndirme arka planda çalışır** — bağlantı hemen İndirmeler'de görünür ve orada hazırlanır, **Görüntüle** içeren bir not bunu doğrular ve URL alanı bir sonraki bağlantı için temizlenir. Öncekiler hazırlanırken istediğin kadar başlat
- **İndirmeler sana neye ihtiyaç olduğunu söyler** — Arroxy bir bağlantıyı okuyamazsa satırı nedenini söyler ve çözümü sunar: Tekrar dene, çerezleri aç veya Explore'da giriş yap. Çerezler kapalıyken **Explore ile giriş yap**, giriş yaptıktan sonra bunu senin için yeniden dener. Yükleme sınırından uzun bir oynatma listesi satırında bekler; tamamını, ilk birkaç videoyu veya bir incelemeyi seçmeni bekler. İndirmeler sekmesi sende bekleyen satırları sayar
- **Videonun yalnızca bir kısmını indir** — Biçim ekranında bir başlangıç ve bitiş ya da bir bölüm seç, Arroxy yalnızca o aralığı kaydeder; dosya adında video kimliğinden sonra aralık yer alır. Kesimler en yakın anahtar kareye denk gelir; bunun yerine yeniden kodlamak için tam kesimi aç
- **Biten indirmeleri otomatik kaldır** — isteğe bağlı: biten bir indirme 5 saniye sonra listeden kalkar. Dosyaları diskte kalır, başarısız indirmeler ise listede durur
- **İndirmeler'de Boyut ve Eksik** — sıralanabilir **Boyut** sütunu her indirmenin ne kadar yer kapladığını gösterir, **Eksik** ise Arroxy dışında taşınan ya da silinen dosyaları işaretler
- **Aurora veya Minimal, koyu veya açık** — hareketli bir gökyüzü üzerinde cam paneller ya da sakin düz yüzeyler; alt bilgi çubuğundan değiştir. Grafik hızlandırması olmayan bilgisayarlar otomatik olarak Minimal'i alır
- **Mac menü çubuğu** — macOS'ta menü çubuğundan Ayarlar'ı (`Cmd+,`) aç, indirme hızı sınırını belirle, stil ve temayı değiştir, günlükleri aç ya da tanılama dosyasını kaydet
- **Herhangi bir indirmeden profili değiştir** — bir indirmede ayar yap, ardından başladığı profili güncelle (neyin değişeceğini önizleyerek) ya da ayarları yeni bir profil olarak kaydet. Profil değiştirirken düzenlemelerini koruyup korumayacağın sorulur

</details>

<details>
<summary><strong>📝 Altyazılar ve son işleme</strong></summary>

- **Altyazılar** SRT, VTT veya ASS olarak — manuel ya da otomatik oluşturulmuş, mevcut herhangi bir dilde
- Videonun yanına kaydet, `.mkv` içine göm veya `Subtitles/` alt klasöründe düzenle
- **Yalnızca altyazı toplu işleri** — bir URL listesi yapıştırın veya bir oynatma listesi açın, Altyazılar'ı seçin ve her video için yalnızca altyazı dosyalarını alın
- **SponsorBlock** — sponsorları, intro'ları, outro'ları ve öz tanıtımları atla ya da bölüm olarak işaretle
- **Gömülü meta veriler** — başlık, yükleme tarihi, kanal, açıklama, küçük resim ve bölüm işaretleri dosyaya yazılır

</details>

<details>
<summary><strong>🌐 YouTube + 2000 site</strong></summary>

- **YouTube, tam kapsamlı** — Videolar, Shorts, Kanallar, Oynatma Listeleri, YouTube Music ve Podcast'ler birinci sınıf kaynak olarak ele alınır
- **yt-dlp aracılığıyla 2000+ diğer site** — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable ve daha fazlası
- **Yalnızca ses ve altyazılar** yalnızca YouTube'da değil, desteklenen her sitede çalışır
- Bir site değişirse yt-dlp haftalık düzeltmeler yayınlar ve Arroxy açılışta ikili dosyayı otomatik günceller

</details>

---

## <a id="install"></a>📥 Kurulum ve ilk başlatma

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

Sürümler yalnızca x86_64'tür. `curl` yok mu? `curl -fsSL` yerine `wget -qO-` kullanın.

| Platform | Doğrudan indirme |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Tüm sürüm dosyaları →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Windows ilk başlatma</strong></summary>

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

Scoop mu tercih edersiniz? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 macOS ilk başlatma</strong></summary>

Arroxy henüz macOS için kod imzalı değildir, bu yüzden Gatekeeper DMG'den kurduktan sonra korkutucu *"Arroxy.app is damaged and can't be opened"* penceresini gösterebilir. Bu mesaj macOS'un imzasız uygulamayı karantinaya aldığı anlamına gelir; uygulama dosyalarının gerçekten hasarlı olduğu anlamına gelmez. Güncel macOS'ta güvenilir çözüm Terminal'dir:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Bağlanan DMG'den `Arroxy.app` dosyasını `/Applications` içine sürükle.
2. Terminal'i aç ve şu iki komutu çalıştır:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

İlk komut kurulu Arroxy kopyandan karantina özniteliğini kaldırır. İkinci komut uygulamayı başlatır. `sudo` Mac parolanı isteyebilir; Terminal yazarken karakterleri göstermez.

**Apple Silicon ve Intel:** M serisi Mac'te (M1 / M2 / M3 / M4) `arm64` DMG indir. Intel Mac'lerde `x64` DMG indir. Yanlış derleme Rosetta ile çalışır ama belirgin şekilde daha yavaştır.

> macOS derlemeleri Apple Silicon ve Intel CI runner'larında üretilir. Sorun yaşarsan lütfen [issue aç](../../issues) — macOS kullanıcılarından gelen geri bildirim macOS test döngüsünü doğrudan şekillendirir.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Neden uyarı görebilirsin</strong></summary>

Arroxy açık kaynaklı ve MIT lisanslıdır. Windows ve macOS derlemeleri **kod imzalı değildir** — Apple Developer ID ve Windows EV kod imzalama sertifikalarının her biri yılda yüzlerce dolara mal olur; bağımsız bir proje bunu cebinden öder. Bu imzalar olmayınca Windows SmartScreen ve macOS Gatekeeper ilk başlatmada uyarır. Uyarılar *işletim sisteminin yayımcıyı tanımadığı* anlamına gelir — Arroxy'nin kötü amaçlı yazılım olduğu anlamına gelmez.

Arroxy'yi kendin doğrulamanın giderek daha sıkı üç yolu:

- **Kaynağı oku.** Her satır [GitHub](https://github.com/antonio-orionus/Arroxy) üzerinde ve [kaynaktan derleyebilirsin](#tech).
- **SHA256 kontrol et.** Dosyanı yayımlanan [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) ile eşleştir — aşağıdaki [İndirmeni doğrula](#verify) bölümüne bak.
- **Üçüncü taraf taraması yap.** Dosyayı [VirusTotal](https://www.virustotal.com) üzerine yükle.

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Linux ilk başlatma</strong></summary>

AppImage'lar doğrudan çalışır — kurulum gerekmez. Sadece dosyayı yürütülebilir olarak işaretlemen gerekir.

**Dosya yöneticisi:** `.AppImage` üzerine sağ tık → **Özellikler** → **İzinler** → **Dosyayı program olarak çalıştırmaya izin ver** seçeneğini aç, sonra çift tıkla.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Açılış hâlâ başarısızsa bağlamadan çalıştırın — FUSE paketi gerekmez:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**İsteğe bağlı masaüstü entegrasyonu:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) bir kez kurulduğunda, çift tıkladığın her AppImage otomatik olarak başlatıcı menüne kaydolur — elle `.desktop` dosyası gerekmez.

**Düz arşiv (FUSE yok, kurulum yok):**

`.tar.gz` sürümü, AppImage sarmalayıcısı olmayan aynı uygulamadır — istediğiniz yere çıkarın ve çalıştırın. Kurulum programı ve FUSE paketi gerekmez.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Sürüm sayfasındaki Linux indirmeleri yalnızca x86_64'tür.** ARM64 makinelerde (Raspberry Pi, Asahi Linux) Flatpak kurulur ama açılışta `bwrap: execvp ldconfig: Exec format error` hatasıyla başarısız olur.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 İndirmeni doğrula (SHA256)</strong></summary>

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
<summary><strong>📦 Windows: Kurucu mu Taşınabilir mi</strong></summary>

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

## <a id="why"></a>⚖️ Neden Arroxy

En yaygın alternatiflerle yan yana karşılaştırma:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Yerleşik tarayıcı (göz at, giriş yap, indir) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Çerez dışa aktarmadan özel, üyelere özel ve yaş kısıtlamalı videolar |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Ücretsiz, premium katman yok |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Açık kaynak |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Yalnızca yerel işleme |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Kullanım sınırı yok |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Platformlar arası masaüstü uygulaması |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Altyazılar + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = kısmen veya yalnızca ücretli sürümde. 4K Video Downloader'da özel videolar için uygulama içi giriş ücretli bir özelliktir; ücretsiz yt-dlp arayüzlerinin çoğu yalnızca bir çerez dosyası kabul eder ya da web tarayıcının çerezlerini okur.

Arroxy tek bir şey için yapılmıştır: ister URL yapıştır ister videoyu Explore'da bul, sonunda temiz bir yerel dosya. Ek satış yok, veri toplama yok.

### <a id="why-explore"></a>🧭 Sıradan bir yt-dlp sarmalayıcısının yapamadığı: Explore sekmesi

Ücretsiz YouTube indiricilerinin çoğu, yt-dlp'nin üstüne konmuş bir URL kutusundan ibarettir. Arroxy de yt-dlp kullanır, ama bir de **Explore**'u vardır: YouTube'u ya da başka herhangi bir siteyi açan, uygulamaya yerleşik bir tarayıcı. Explore, bir URL kutusunun aşamadığı sınırları aşar:

- **Çerez dışa aktarmadan hesap gerektiren videolar** — özel, üyelere özel ve yaş kısıtlamalı videolar (yaşı doğrulanmış bir hesapta), ayrıca Daha Sonra İzle ve Beğenilenler listelerin ve diğer sitelerde girişin arkasındaki videolar. Sıradan bir sarmalayıcı, dışa aktarılmış bir cookies.txt ister ya da web tarayıcının çerezlerini okumak zorundadır; Windows'taki Chrome ise artık bunu engelliyor. Arroxy'de Explore'da bir kez giriş yaparsın, gerisini o halleder
- **“Robot olmadığını doğrulamak için giriş yap”** — YouTube bunu istediğinde Arroxy başarısız olmak yerine indirmeyi Explore girişinle yeniden dener
- **YouTube'un indirme token'ı** — Arroxy'nin yerleşik tarayıcısı, YouTube'un bir indirmeden önce beklediği token'ı alır. Bu olmadan YouTube istediğinden daha az biçim ve daha düşük kalite sunabilir
- **Bağlantı kopyalamak yok** — Explore'da bir video, oynatma listesi veya kanal bul ve tek tıkla indir ya da sayfadaki herhangi bir bağlantıya sağ tıkla
- **İstediğinde reklam engelleyici** — kalkana tek tıklama, Explore sayfalarındaki reklamları ve izleyicileri engeller

---

## <a id="privacy"></a>🔒 Gizlilik

İndirmeler [yt-dlp](https://github.com/yt-dlp/yt-dlp) ile doğrudan YouTube'dan seçtiğin klasöre alınır — hiçbir şey üçüncü taraf sunucu üzerinden yönlendirilmez. İzleme geçmişi, indirme geçmişi, URL'ler ve dosya içerikleri cihazında kalır.

Telemetri yok — günde yalnızca bir anonim sinyal: uygulama sürümü, işletim sistemi, dil, kurulum kanalı ve ülke; böylece etkin kullanıcıları sayabiliriz. Kimlik, URL, video başlığı, dosya yolu veya hesap bilgisi yok. Ayarlar'dan kapatabilirsin.

Explore, tarayıcından ayrı kendi girişlerini tutar ve Arroxy bir giriş formunu asla okumaz ya da doldurmaz — sitenin kendi sayfasına yazarsın. İndirmeler oturum açmadan çalışır; yalnızca biri hesabın düzeltebileceği bir şekilde başarısız olduğunda Arroxy girişi o an okur, o indirme için geçici bir dosyada tutar ve dosyayı sonra siler. Ayarlar'dan Explore'dan çıkış yapmak girişleri unutturur.

---

## <a id="faq"></a>❓ SSS

<details>
<summary><strong>Gerçekten ücretsiz mi?</strong></summary>

Evet — MIT lisanslı, premium katman yok, özellik kilidi yok.

</details>

<details>
<summary><strong>Arroxy'yi diğer yt-dlp arayüzlerinden ayıran ne?</strong></summary>

Ücretsiz yt-dlp arayüzlerinin çoğu yalnızca bağlantı alan sarmalayıcılardır. Arroxy buna **Explore**'u ekler: uygulamaya yerleşik, YouTube'u ya da başka herhangi bir siteyi açan bir tarayıcı. Bağlantı kopyalamadan göz atıp indirirsin; orada bir kez giriş yaparak özel, üyelere özel ve yaş kısıtlamalı videoları, ayrıca Daha Sonra İzle ve Beğenilenler listelerini çerez dışa aktarmadan indirebilirsin. YouTube robot olmadığını doğrulamanı istediğinde Arroxy bu girişi kullanır; yerleşik tarayıcısı da YouTube'un indirme token'ını alır, böylece indirmeler daha az biçime düşmez. Bkz. [Neden Arroxy](#why).

</details>

<details>
<summary><strong>Hangi video kalitelerini indirebilirim?</strong></summary>

YouTube ne sunuyorsa: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p ve yalnızca ses. 60 fps ve HDR akışlar olduğu gibi korunur; adım adım indirme ise her çözünürlükte AV1, VP9 veya H.264 seçmeni sağlar.

</details>

<details>
<summary><strong>Yalnızca sesi MP3 olarak çıkarabilir miyim?</strong></summary>

Evet. Biçim menüsünde *yalnızca ses* seç ve MP3, M4A/AAC, Opus veya WAV tercih et.

</details>

<details>
<summary><strong>Hesap gerektiren YouTube videolarını nasıl indiririm?</strong></summary>

Explore sekmesinde bir kez giriş yap. Arroxy bunun ardından hesabının izleyebildiği özel ve üyelere özel videoları, hesabın yaşı doğrulanmışsa yaş kısıtlamalı videoları, ayrıca Daha Sonra İzle ve Beğenilenler listelerini indirebilir. Girişi yalnızca bir indirme, hesabın düzeltebileceği bir şekilde başarısız olduğunda kullanır; geri kalan her şey eskisi gibi iner. Bu, çerez ayarlarında en başta listelenen ve Önerilen olarak işaretlenen **Explore girişi** seçeneğidir ve Explore'u ilk açtığında Arroxy bunu senin için seçer. yt-dlp wiki'si [oturum açılmış otomasyonun bir Google hesabını işaretleyebileceğini](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) belirtir, bu yüzden ikincil hesap daha güvenli bir seçimdir.

</details>

<details>
<summary><strong>YouTube bir şey değiştirdiğinde çalışmaya devam eder mi?</strong></summary>

yt-dlp açılışta otomatik güncellenir ve YouTube bir şey değiştirdiğinde Arroxy hızlıca düzeltme yayımlar. YouTube robot olmadığını doğrulamanı istediğinde, Explore'da giriş yaptıysan Arroxy Explore girişini de dener; bir dosyadaki veya tarayıcındaki çerezler de çerez ayarlarında kullanılabilir.

</details>

<details>
<summary><strong>Arroxy hangi dillerde mevcut?</strong></summary>

Kutudan çıktığı gibi 31 dil: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy ilk açılışta işletim sisteminin dilini otomatik algılar ve araç çubuğundaki dil seçiciden istediğin zaman değiştirebilirsin. Çalışma zamanı locale JSON dosyaları src/shared/i18n/locales/ içinde, çevirmenlere yönelik PO katalogları i18n/locales/ içinde bulunur — katkı için GitHub'da PR aç.

</details>

<details>
<summary><strong>Başka bir şey kurmam gerekir mi?</strong></summary>

Hayır. yt-dlp, ffmpeg ve ffprobe ilk açılışta otomatik indirilir ve makinede önbelleğe alınır. Bundan sonra ek kurulum gerekmez.

</details>

<details>
<summary><strong>Oynatma listeleri veya tüm kanalları indirebilir miyim?</strong></summary>

Evet — ikisi de. Bir oynatma listesi URL'si veya kanal URL'si yapıştır (örn. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); kaç kayıt taranacağını seç, sonra tüm listeyi kuyruğa al veya belirli videoları seç. Tarih aralığı filtreleri yakında geliyor.

</details>

<details>
<summary><strong>macOS "uygulama hasarlı" diyor — ne yapmalıyım?</strong></summary>

Bu, macOS Gatekeeper’ın imzasız uygulamayı engellemesidir; gerçek hasar değildir. Karantinayı kaldırıp Arroxy’yi başlatan Terminal komutları için [macOS ilk başlatma](#macos-first-launch) bölümüne bak.

</details>

<details>
<summary><strong>YouTube videoları indirmek yasal mı?</strong></summary>

Kişisel, özel kullanım için çoğu yargı alanında genellikle kabul edilir. YouTube'un [Hizmet Şartları](https://www.youtube.com/t/terms) ve yerel telif hakkı yasalarına uymaktan sen sorumlusun.

</details>

---

## <a id="roadmap"></a>🗺️ Yol haritası

Hâlâ planlananlar — yaklaşık öncelik sırasıyla:

| Özellik    | Açıklama    |
| ---------------- | ---------------- |
| **Oynatma listesi ve kanal filtreleri** | Bir oynatma listesi veya kanal listelenirken tarih aralığı filtreleri |
| **YouTube ses parçası tercihleri** | YouTube birden fazla ses parçası sunduğunda profil bazlı geçersiz kılmalarla birlikte uygulama geneli konuşulan dil tercihi ayarla |
| **Daha güçlü yeniden deneme kurtarması** | Güvenilmez veya sorunlu internet bağlantılarıyla kesilen indirmeler için yeni bir yeniden deneme yolu |
| **Tam indirme yöneticisi çekmecesi** | Kuyruk çekmecesini, kuyruktaki öğelerin hedef klasörlerini değiştirme dahil daha kapsamlı bir yöneticisine dönüştür |
| **Zamanlanmış indirmeler** | Bir kuyruğu belirli saatte başlat (gece çalıştırmaları) |
| **AUR paketi** | Arch Linux ve Omarchy'ye `yay -S arroxy-bin` ile kurulum |

Aklında bir özellik mi var? [İstek aç](../../issues) — topluluk girdisi önceliği şekillendirir.

---

## <a id="support"></a>💖 Arroxy'yi destekle

Arroxy ücretsizdir ve MIT lisanslıdır — reklam yok, telemetri yok, ücretli sürüm yok. Sana zaman kazandırıyorsa geliştirmeyi Bitcoin, Tron veya Ethereum ile destekleyebilirsin: adresler, tek resmi kaynak olan [DONATE.md](DONATE.md) dosyasında. Arroxy sana asla e-posta veya özel mesajla adres göndermez. Depoya yıldız vermek, hata bildirmek ve çevirileri iyileştirmek de en az o kadar yardımcı olur.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Kullanılan teknolojiler

<details>
<summary><strong>Teknoloji yığını</strong></summary>

- **Electron** — platformlar arası masaüstü kabuğu
- **React 19** + **TypeScript** — kullanıcı arayüzü
- **Tailwind CSS v4** — stillendirme
- **Zustand** — durum yönetimi
- **yt-dlp** + **ffmpeg** — indirme ve mux motoru (ikisi de çalışma zamanında alınır: yt-dlp güncel tutulur, ffmpeg/ffprobe bir kez kurulur ve güncellemeler boyunca korunur)
- **Vite** + **electron-vite** — derleme araçları
- **Vitest** + **Playwright** — birim ve uçtan uca testler

</details>

<details>
<summary><strong>Kaynaktan derle</strong></summary>

### Ön koşullar — tüm platformlar

| Araç    | Sürüm   | Kurulum |
| ------- | ------- | ------- |
| Git     | herhangi | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` veya `.node-version` |
| Bun     | 1.4.2  | `mise install` veya `package.json` `packageManager` |

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

Klonladıktan sonra checkout içinde `mise trust && mise install` çalıştır. Shell'in zaten `fnm`, `nvm` veya Homebrew Bun kullanıyorsa, Arroxy'nin Node.js 24.21.0 ve Bun 1.4.2 alması için `~/.zshrc` içinde mise'i etkinleştir:

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

> `bun run bootstrap` bağımlılıkları kurar, Electron uygulama bağımlılıklarını yeniden derler, Electron'u doğrular, geliştirme için gömülü ffmpeg/ffprobe hazırlar ve Playwright Chromium kurar. Sürüm derlemeleri yt-dlp, ffmpeg ve ffprobe'u uygulama veri klasöründe çalışma zamanında yönetir; hiçbiri yükleyicinin içinde gelmez.

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

## 📜 Kullanım şartları

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
