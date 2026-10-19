const TECH_CONTENT = `<details>
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
| Node.js | 24.21.0 | \`mise install\` veya \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` veya \`package.json\` \`packageManager\` |

Önerilen: \`mise\` kur, sonra checkout içinde \`mise install\` çalıştır. mise olmadan, \`bun run bootstrap\` öncesinde Node.js'i \`.node-version\` üzerinden ve Bun'ı \`package.json\` üzerinden elle etkinleştir.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Yerel yeniden derlemeler için Visual Studio Build Tools ve Python gerekebilir.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Klonladıktan sonra checkout içinde \`mise trust && mise install\` çalıştır. Shell'in zaten \`fnm\`, \`nvm\` veya Homebrew Bun kullanıyorsa, Arroxy'nin Node.js 24.21.0 ve Bun 1.4.2 alması için \`~/.zshrc\` içinde mise'i etkinleştir:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Derleme + Electron çalışma zamanı bağımlılıkları
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Yalnızca E2E testleri için (Electron bir ekran ister)
sudo apt install -y xvfb
\`\`\`

### Klonla ve çalıştır

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # önerilir; sabitlenmiş araçları elle etkinleştirdiysen atla
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer'a karşı Electron uygulaması
\`\`\`

### Dağıtılabilir paket derle

\`\`\`bash
bun run build        # typecheck + compile
bun run dist         # geçerli işletim sistemi için paketle
bun run dist:win     # desteklenen bir host üzerinde Windows hedeflerini paketle
\`\`\`

> \`bun run bootstrap\` bağımlılıkları kurar, Electron uygulama bağımlılıklarını yeniden derler, Electron'u doğrular, geliştirme için gömülü ffmpeg/ffprobe hazırlar ve Playwright Chromium kurar. Sürüm derlemeleri yt-dlp, ffmpeg ve ffprobe'u uygulama veri klasöründe çalışma zamanında yönetir; hiçbiri yükleyicinin içinde gelmez.

</details>`;

export const tr = {
  icon_alt: "Arroxy maskotu",
  title:
    "Arroxy — Windows, macOS ve Linux için Dahili Tarayıcılı, Ücretsiz Açık Kaynak YouTube (+ 2000 site) İndirici",
  read_in_label: "Şu dilde oku:",
  badge_release_alt: "Sürüm",
  badge_build_alt: "Derleme",
  badge_license_alt: "Lisans",
  badge_platforms_alt: "Platformlar",
  badge_i18n_alt: "Diller",
  badge_website_alt: "Web sitesi",
  discord_badge_text: "Discord Topluluğuna Katıl",
  discord_badge_encoded: "Discord%20Toplulu%C4%9Funa%20Kat%C4%B1l",
  hero_desc:
    "**YouTube ve 2000+ desteklenen siteden** video, Shorts, müzik, kanal, podcast veya ses parçaları indir — 60 fps'de 8K HDR'a kadar, MP3 / AAC / Opus olarak ya da yalnızca ihtiyacın olan kısmı. Explore sekmesinde **YouTube'a ya da başka herhangi bir siteye Arroxy içinden göz at** ve baktığın videoyu, oynatma listesini veya kanalı indir; hesabının izleyebildiği özel, üyelere özel ve yaş kısıtlamalı videoları indirmek için orada giriş yap. Windows, macOS ve Linux'ta yerel çalışır. **Reklam yok, şişkinlik yok, ek satış yok.**",
  cta_latest: "↓ En son sürümü kur",
  cta_website: "Web sitesi",
  star_cta:
    "Arroxy sana zaman kazandırıyorsa, bir ⭐ başkalarının onu bulmasına yardım eder.",
  ai_notice:
    "> 🌐 Bu, yapay zeka destekli bir çeviridir. [İngilizce README](README.md) gerçek kaynak kabul edilir. Hata mı gördün? [PR'lar memnuniyetle karşılanır](../../pulls).",
  toc_heading: "İçindekiler",
  why_h2: "Neden Arroxy",
  features_h2: "Özellikler",
  dl_h2: "Kurulum ve ilk başlatma",
  privacy_h2: "Gizlilik",
  faq_h2: "SSS",
  roadmap_h2: "Yol haritası",
  tech_h2: "Kullanılan teknolojiler",
  why_intro: "En yaygın alternatiflerle yan yana karşılaştırma:",
  why_r1: "Ücretsiz, premium katman yok",
  why_r2: "Açık kaynak",
  why_r3: "Yalnızca yerel işleme",
  why_r5: "Kullanım sınırı yok",
  why_r6: "Platformlar arası masaüstü uygulaması",
  why_r7: "Altyazılar + SponsorBlock",
  why_r8: "Yerleşik tarayıcı (göz at, giriş yap, indir)",
  why_r9:
    "Çerez dışa aktarmadan özel, üyelere özel ve yaş kısıtlamalı videolar",
  why_table_note:
    "⚠️ = kısmen veya yalnızca ücretli sürümde. 4K Video Downloader'da özel videolar için uygulama içi giriş ücretli bir özelliktir; ücretsiz yt-dlp arayüzlerinin çoğu yalnızca bir çerez dosyası kabul eder ya da web tarayıcının çerezlerini okur.",
  why_summary:
    "Arroxy tek bir şey için yapılmıştır: ister URL yapıştır ister videoyu Explore'da bul, sonunda temiz bir yerel dosya. Ek satış yok, veri toplama yok.",
  why_explore_h3:
    "Sıradan bir yt-dlp sarmalayıcısının yapamadığı: Explore sekmesi",
  why_explore_intro:
    "Ücretsiz YouTube indiricilerinin çoğu, yt-dlp'nin üstüne konmuş bir URL kutusundan ibarettir. Arroxy de yt-dlp kullanır, ama bir de **Explore**'u vardır: YouTube'u ya da başka herhangi bir siteyi açan, uygulamaya yerleşik bir tarayıcı. Explore, bir URL kutusunun aşamadığı sınırları aşar:",
  why_explore_1:
    "**Çerez dışa aktarmadan hesap gerektiren videolar** — özel, üyelere özel ve yaş kısıtlamalı videolar (yaşı doğrulanmış bir hesapta), ayrıca Daha Sonra İzle ve Beğenilenler listelerin ve diğer sitelerde girişin arkasındaki videolar. Sıradan bir sarmalayıcı, dışa aktarılmış bir cookies.txt ister ya da web tarayıcının çerezlerini okumak zorundadır; Windows'taki Chrome ise artık bunu engelliyor. Arroxy'de Explore'da bir kez giriş yaparsın, gerisini o halleder",
  why_explore_2:
    "**“Robot olmadığını doğrulamak için giriş yap”** — YouTube bunu istediğinde Arroxy başarısız olmak yerine indirmeyi Explore girişinle yeniden dener",
  why_explore_3:
    "**YouTube'un indirme token'ı** — Arroxy'nin yerleşik tarayıcısı, YouTube'un bir indirmeden önce beklediği token'ı alır. Bu olmadan YouTube istediğinden daha az biçim ve daha düşük kalite sunabilir",
  why_explore_4:
    "**Bağlantı kopyalamak yok** — Explore'da bir video, oynatma listesi veya kanal bul ve tek tıkla indir ya da sayfadaki herhangi bir bağlantıya sağ tıkla",
  why_explore_5:
    "**İstediğinde reklam engelleyici** — kalkana tek tıklama, Explore sayfalarındaki reklamları ve izleyicileri engeller",
  feat_explore_h3: "Explore: Web'de Arroxy içinden gez",
  feat_explore_1: "**Explore sekmesi** — YouTube'a ya da başka herhangi bir siteye Arroxy içinden göz at ve bulduklarını bağlantı kopyalamadan indir. **İndir · *profilin*** baktığın videoyu, oynatma listesini veya kanalı kuyruğa ekler; yanındaki ok profil değiştirir, sihirli değnek ise biçim, altyazı ve daha fazlasını seçebileceğin adım adım indirmeyi açar",
  feat_explore_6: "**Sağ tıklayarak indir** — Explore'da herhangi bir video, oynatma listesi veya kanal bağlantısına sağ tıklayıp profilinle indir, **Profille indir** menüsünden başka bir profil seç, adım adım indirmeyi aç ya da bağlantıyı kopyala. Her videoyu önce açman gerekmez",
  feat_explore_7:
    "**Kompakt düzen** — Explore araç çubuğundaki tek bir tıklama Arroxy'nin sekmelerini oraya taşır ve sayfaya daha fazla yer açar",
  feat_explore_2: "**Adres çubuğu** — YouTube'da aramak için yaz ya da herhangi bir web adresi gir, o site açılsın",
  feat_explore_3: "**Hesap gerektiren indirmeler** — Explore'da bir kez giriş yap; Arroxy hesabının izleyebildiği özel ve üyelere özel videoları, hesabın yaşı doğrulanmışsa yaş kısıtlamalı videoları, ayrıca Daha Sonra İzle ve Beğenilenler listelerini indirebilir. Başka sitelerde de orada giriş yap; onların indirmeleri gerektiğinde bu girişi kullanır. Arroxy yine de önce oturum açmadan indirir ve Explore girişini yalnızca bir indirme, hesabın düzeltebileceği bir şekilde başarısız olduğunda kullanır. YouTube robot olmadığını doğrulamanı istediğinde Arroxy Explore girişini de dener",
  feat_explore_4: "**İkincil hesap kullan** — Explore'un ilk ekranı nedenini açıklar: bir hesapla indirmek, o hesabın kısıtlanması riskini bir ölçüde taşır. Girişlerini unutmak istediğinde Ayarlar'dan Explore'dan çıkış yap",
  feat_explore_5: "**Reklam engelleyici** — varsayılan olarak kapalı. Explore araç çubuğundaki kalkana tek tıklama, sayfalarındaki reklamları ve izleyicileri indirmeleri etkilemeden engeller. YouTube, giriş yapılmış hesaplarda reklam engelleyicilere karşı önlem alabilir",
  feat_quality_h3: "Kalite ve biçimler",
  feat_quality_1: "**8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p'ye kadar",
  feat_quality_2:
    "**Yüksek kare hızı ve HDR** olduğu gibi korunur — 60 fps, HDR10",
  feat_quality_3:
    "**Ses** — yalnızca sesi MP3, M4A/AAC, Opus veya WAV olarak dışa aktar. Etkileşimli indirmelerde varsa kaynağın yerel surround/Dolby parçalarını (AC-3, E-AC-3, 5.1, DRC) seç veya genel **Surround / Dolby tercih et** varsayılanı ayarla",
  feat_quality_4:
    "**Hedefli profiller** — *En iyi görüntü* (AV1 · VP9) veya *Akıllı TV* (MP4 · H.264); yeniden kodlamadan Otomatik, MP4, MKV veya WebM olarak kaydedilir. HDR ise *Otomatik* (yalnızca ekranın gösterebiliyorsa), *SDR* veya *HDR*",
  feat_quality_5:
    "**Her çözünürlükte her codec** — adım adım indirme her çözünürlükte AV1, VP9 ve H.264'ü yan yana listeler; böylece TV'nin veya düzenleme programının oynattığını seçebilirsin",
  feat_quality_6:
    "**Bir akışın gerçekte ne olduğunu bil** — YouTube'un yapay zekayla büyüttüğü çözünürlükler, yapay zekayla seslendirilmiş ses dilleri, geliştirilmiş bit hızlı akışlar, 360° videolar ve hasarlı ya da filigranlı kopyalar işaretlenir. Profiller, sen izin vermedikçe yapay zekayla büyütülmüş akışları atlar",
  feat_privacy_h3: "Gizlilik ve kontrol",
  feat_privacy_1:
    "%100 yerel işleme — indirmeler doğrudan YouTube'dan diskine gider",
  feat_privacy_2: "**Açık kaynak** — her satır denetlenebilir, MIT lisanslı",
  feat_privacy_3: "Dosyalar doğrudan seçtiğin klasöre kaydedilir",
  feat_workflow_h3: "İş akışı",
  feat_workflow_12: "**Genel indirme kısayolu** — herhangi bir uygulamada bir bağlantı kopyala ve `Ctrl+Shift+D` (macOS'ta `Cmd+Shift+D`) tuşlarına bas; Arroxy pencereyi açmadan aktif profilinle kuyruğa ekler ve bir bildirim bunu doğrular. Varsayılan olarak açık, yeniden atanabilir",
  feat_workflow_1: "**Esnek başlangıç modları** — rehberli tek indirme, oynatma listesi/kanal seçici, toplu URL yapıştırma, kayıtlı varsayılanlarla Hızlı İndirme veya Explore'da gezip indirme seç",
  feat_workflow_2:
    "**Merkezi indirme kuyruğu** — her tekil, oynatma listesi, toplu veya hızlı iş; ilerleme, duraklatma, sürdürme, iptal, yeniden deneme ve öncelik kontrolü için tek yere gelir",
  feat_workflow_3:
    "**Pano izleme** — bir video bağlantısı kopyala; Arroxy'ye döndüğünde URL alanını doldurur, istemediysen **Geri al** ile vazgeçebilirsin. Arroxy meşgulken bağlantı, sen URL sekmesine dönene kadar bekler (Ayarlar'dan kapatılabilir)",
  feat_workflow_4:
    "**Otomatik URL temizleme** — izleme parametrelerini (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) kaldırır ve `youtube.com/redirect` bağlantılarını çözer",
  feat_workflow_5:
    "**Tepsi modu** — pencere kapansa bile indirmeler arka planda sürer",
  feat_workflow_6:
    "**{{LANG_COUNT}} dil** — sistem dilini otomatik algılar, istediğin zaman değiştirilebilir",
  feat_workflow_7:
    "**Oynatma listesi eşitleme** — zaten indirilmiş videoları atlamak için bir oynatma listesini yerel klasöre karşı yeniden tara; her indirilen videoyla güncellenen bir `.m3u` oynatma listesi dosyası oluşturur",
  feat_workflow_8:
    "**Hız ve tempo kontrolleri** — indirme bant genişliğini sınırla, bir videonun aynı anda kaç parçasının indirileceğini ayarla ve ön ayarlarla istek gecikmeleri ekle (*Kapalı · Dengeli · Dikkatli · Özel*)",
  feat_workflow_9:
    "**Dosya adı şablonları** — indirmelerinizi `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` ve `{playlist_index}` ile dilediğiniz gibi adlandırın; genel olarak veya indirme profili başına",
  feat_workflow_10:
    "**Aynı anda indirme ve otomatik yeniden deneme** — kuyruktaki kaç indirmenin aynı anda çalışacağını seç ve ağ ya da sunucu kaynaklı sorun yaşayan bir indirmeyi Arroxy'nin, her denemeden önce daha uzun bekleyerek yeniden denemesine izin ver",
  feat_workflow_11:
    "**Oynatma listesinde öğe başına profil** — bir oynatma listesindeki her videoya, tüm liste için tek bir ayar yerine kendi indirme profilini atayın; böylece tek geçişte bazılarını tam kalitede arşivleyip kalanını MP3 olarak alabilirsiniz",
  feat_workflow_13: "**Hızlı İndirme arka planda çalışır** — bağlantı hemen İndirmeler'de görünür ve orada hazırlanır, **Görüntüle** içeren bir not bunu doğrular ve URL alanı bir sonraki bağlantı için temizlenir. Öncekiler hazırlanırken istediğin kadar başlat",
  feat_workflow_14: "**İndirmeler sana neye ihtiyaç olduğunu söyler** — Arroxy bir bağlantıyı okuyamazsa satırı nedenini söyler ve çözümü sunar: Tekrar dene, çerezleri aç veya Explore'da giriş yap. Çerezler kapalıyken **Explore ile giriş yap**, giriş yaptıktan sonra bunu senin için yeniden dener. Yükleme sınırından uzun bir oynatma listesi satırında bekler; tamamını, ilk birkaç videoyu veya bir incelemeyi seçmeni bekler. İndirmeler sekmesi sende bekleyen satırları sayar",
  feat_workflow_15:
    "**Videonun yalnızca bir kısmını indir** — Biçim ekranında bir başlangıç ve bitiş ya da bir bölüm seç, Arroxy yalnızca o aralığı kaydeder; dosya adında video kimliğinden sonra aralık yer alır. Kesimler en yakın anahtar kareye denk gelir; bunun yerine yeniden kodlamak için tam kesimi aç",
  feat_workflow_16:
    "**Biten indirmeleri otomatik kaldır** — isteğe bağlı: biten bir indirme 5 saniye sonra listeden kalkar. Dosyaları diskte kalır, başarısız indirmeler ise listede durur",
  feat_workflow_17:
    "**İndirmeler'de Boyut ve Eksik** — sıralanabilir **Boyut** sütunu her indirmenin ne kadar yer kapladığını gösterir, **Eksik** ise Arroxy dışında taşınan ya da silinen dosyaları işaretler",
  feat_workflow_18:
    "**Aurora veya Minimal, koyu veya açık** — hareketli bir gökyüzü üzerinde cam paneller ya da sakin düz yüzeyler; alt bilgi çubuğundan değiştir. Grafik hızlandırması olmayan bilgisayarlar otomatik olarak Minimal'i alır",
  feat_workflow_19:
    "**Mac menü çubuğu** — macOS'ta menü çubuğundan Ayarlar'ı (`Cmd+,`) aç, indirme hızı sınırını belirle, stil ve temayı değiştir, günlükleri aç ya da tanılama dosyasını kaydet",
  feat_workflow_20:
    "**Herhangi bir indirmeden profili değiştir** — bir indirmede ayar yap, ardından başladığı profili güncelle (neyin değişeceğini önizleyerek) ya da ayarları yeni bir profil olarak kaydet. Profil değiştirirken düzenlemelerini koruyup korumayacağın sorulur",
  feat_post_h3: "Altyazılar ve son işleme",
  feat_post_1:
    "**Altyazılar** SRT, VTT veya ASS olarak — manuel ya da otomatik oluşturulmuş, mevcut herhangi bir dilde",
  feat_post_2:
    "Videonun yanına kaydet, `.mkv` içine göm veya `Subtitles/` alt klasöründe düzenle",
  feat_post_3:
    "**SponsorBlock** — sponsorları, intro'ları, outro'ları ve öz tanıtımları atla ya da bölüm olarak işaretle",
  feat_post_4:
    "**Gömülü meta veriler** — başlık, yükleme tarihi, kanal, açıklama, küçük resim ve bölüm işaretleri dosyaya yazılır",
  feat_post_5:
    "**Yalnızca altyazı toplu işleri** — bir URL listesi yapıştırın veya bir oynatma listesi açın, Altyazılar'ı seçin ve her video için yalnızca altyazı dosyalarını alın",
  feat_sites_h3: "YouTube + 2000 site",
  feat_sites_1:
    "**YouTube, tam kapsamlı** — Videolar, Shorts, Kanallar, Oynatma Listeleri, YouTube Music ve Podcast'ler birinci sınıf kaynak olarak ele alınır",
  feat_sites_2:
    "**yt-dlp aracılığıyla 2000+ diğer site** — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable ve daha fazlası",
  feat_sites_3:
    "**Yalnızca ses ve altyazılar** yalnızca YouTube'da değil, desteklenen her sitede çalışır",
  feat_sites_4:
    "Bir site değişirse yt-dlp haftalık düzeltmeler yayınlar ve Arroxy açılışta ikili dosyayı otomatik günceller",
  shot1_cap:
    "<b>Hızlı İndirme ana ekranı</b><br/>Bir URL yapıştır ve etkin profilinle anında çek",
  shot2_cap:
    "<b>Yeniden kullanılabilir indirme profilleri</b><br/>Biçim, kalite ve çıktı ön ayarlarını kaydet — her indirmede yeniden kullan",
  shot3_cap:
    "<b>Çok dilli ses parçaları</b><br/>Videonun sunduğu tam ses dilini seç",
  shot4_cap:
    "<b>Surround / Dolby ses</b><br/>5.1 ve Dolby parçaları algılanır ve korunur",
  shot5_cap:
    "<b>Toplu URL modu</b><br/>Bir liste yapıştır, otomatik tekilleştir, hepsini tek seferde kuyruğa al",
  shot6_cap:
    "<b>Paralel indirme kuyruğu</b><br/>Canlı ilerlemeyle aynı anda birden fazla indirme",
  hotkey_fig_alt: "Arroxy genel indirme kısayolu — Windows ve Linux'ta Ctrl+Shift+D, macOS'ta Cmd+Shift+D, kopyalanan bağlantıyı doğrudan indirme kuyruğuna gönderir",
  hotkey_fig_cap: "<b>Genel indirme kısayolu</b><br/>Bağlantıyı nerede olursan ol kopyala, bir kez bas — kuyruğa girer ve inmeye başlar",
  shot7_cap: "<b>Oynatma listesinde öğe başına profil</b><br/>Her videoya kendi profilini ver — bazılarını 4K arşivle, kalanını MP3 olarak al",
  shot8_cap: "<b>Explore</b><br/>YouTube'a ya da başka herhangi bir siteye Arroxy içinden göz at ve bulunduğun sayfayı aktif profilinle indir",
  shot9_cap: "<b>Explore'un ilk ekranı</b><br/>Explore'a kısa bir bakış ve ikincil hesabın neden daha güvenli giriş olduğu",
  shot10_cap: "<b>İndirmeler sana neye ihtiyaç olduğunu söyler</b><br/>Bağlantılar arka planda hazırlanır; başarısız olan çözümünü sunar, uzun bir oynatma listesi seçimini bekler",
  shot11_cap: "<b>Videonun yalnızca bir bölümünü indirin</b><br/>Başlangıç ve bitiş ya da bir bölüm seçin — Arroxy yalnızca o aralığı kaydeder",
  shot12_cap: "<b>Profil düzenleyici</b><br/>Bir profili ayarlayın: dosya türü, çözünürlük, altyazılar, hedef, dosya adı şablonu ve daha fazlası",
  shot13_cap: "<b>Koyu ya da açık, cam ya da sade</b><br/>Seçebileceğiniz dört görünüm: hareketli bir gökyüzü üzerinde cam paneller ya da sakin düz yüzeyler, her biri koyu ve açık temada",
  dl_platform_col: "Platform",
  dl_format_col: "Doğrudan indirme",
  dl_oneline_note:
    "Sürümler yalnızca x86_64'tür. `curl` yok mu? `curl -fsSL` yerine `wget -qO-` kullanın.",
  dl_win_scoop:
    "Scoop mu tercih edersiniz? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_win_format: "Kurucu (NSIS) veya Taşınabilir `.exe`",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` veya `.flatpak` (sandbox'lı)",
  dl_grab: "Tüm sürüm dosyaları →",
  dl_pkg_h3: "Paket yöneticisiyle kur",
  dl_channel_col: "Kanal",
  dl_command_col: "Komut",
  dl_win_h3: "Windows: Kurucu mu Taşınabilir mi",
  dl_win_col_installer: "NSIS Kurucu",
  dl_win_col_portable: "Taşınabilir `.exe`",
  dl_win_r1: "Kurulum gerekli",
  dl_win_r1_installer: "Evet",
  dl_win_r1_portable: "Hayır — her yerden çalıştır",
  dl_win_r2: "Otomatik güncellemeler",
  dl_win_r2_installer: "✅ uygulama içinde",
  dl_win_r2_portable: "❌ elle indirme",
  dl_win_r3: "Başlangıç hızı",
  dl_win_r3_installer: "✅ daha hızlı",
  dl_win_r3_portable: "⚠️ soğuk başlangıç daha yavaş",
  dl_win_r4: "Başlat Menüsüne ekler",
  dl_win_r5: "Kolay kaldırma",
  dl_win_r5_portable: "❌ dosyayı sil",
  dl_win_rec:
    "**Öneri:** otomatik güncellemeler ve daha hızlı başlangıç için NSIS kurucuyu kullan. Kurulum yapmadan, kayıt defterine dokunmadan kullanmak için taşınabilir `.exe` uygundur.",
  dl_win_smartscreen_h4: "Windows SmartScreen uyarısı",
  dl_win_smartscreen_intro:
    'İlk başlatmada **"Windows bilgisayarınızı korudu"** veya **"Bilinmeyen yayımcı"** görebilirsin. Bu hem `Arroxy-win-x64-Setup.exe` hem de `Arroxy-win-x64-Portable.exe` için geçerlidir. Arroxy ücretsiz ve açık kaynaklıdır; Windows derlemeleri ücretli bir sertifikayla kod imzalı değildir, SmartScreen bu yüzden işaretler. Bu, Arroxy’nin otomatik olarak güvensiz olduğu anlamına gelmez. Devam etmek için:',
  dl_win_smartscreen_step1: "**Daha fazla bilgi** seçeneğine tıkla.",
  dl_win_smartscreen_step2: "**Yine de çalıştır** seçeneğine tıkla.",
  dl_win_smartscreen_official:
    "Arroxy'yi yalnızca resmi GitHub Releases sayfasından indir. Dosyayı başka bir web sitesinden aldıysan veya biri sana gönderdiyse sil ve resmi kaynaktan yeni kopya indir. Kaynak kodu herkese açık; istersen inceleyebilir veya Arroxy'yi kendin derleyebilirsin.",
  dl_macos_h3: "macOS'ta ilk başlatma",
  dl_macos_warning:
    "Arroxy henüz kod imzalı değildir, bu yüzden macOS Gatekeeper ilk açılışta hasarlı uygulama uyarısı gösterebilir. Bu beklenen bir durumdur — gerçek dosya hasarı anlamına gelmez.",
  dl_macos_m1_h4: "Terminal yöntemi:",
  dl_macos_step1: "Bağlanan DMG'den `Arroxy.app` dosyasını `/Applications` içine sürükle.",
  dl_macos_step2:
    "Terminal'i aç ve `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app` çalıştır.",
  dl_macos_step3: "`open /Applications/Arroxy.app` çalıştır.",
  dl_macos_step4:
    "Uygulama yolu farklıysa `/Applications/Arroxy.app` yerine kurduğun yolu yaz.",
  dl_macos_step5:
    "`sudo` isterse Mac parolanı gir.",
  dl_macos_after:
    "Karantina kaldırıldıktan sonra Arroxy normal şekilde açılır.",
  dl_macos_m2_h4: "Terminal yöntemi:",
  dl_macos_note:
    "macOS derlemeleri Apple Silicon ve Intel CI runner'larında üretilir. Sorun yaşarsan lütfen [issue aç](../../issues) — macOS kullanıcılarından gelen geri bildirim macOS test döngüsünü doğrudan şekillendirir.",
  dl_linux_h3: "Linux'ta ilk başlatma",
  dl_linux_intro:
    "AppImage'lar doğrudan çalışır — kurulum gerekmez. Sadece dosyayı yürütülebilir olarak işaretlemen gerekir.",
  dl_linux_m1_text:
    "**Dosya yöneticisi:** `.AppImage` üzerine sağ tık → **Özellikler** → **İzinler** → **Dosyayı program olarak çalıştırmaya izin ver** seçeneğini aç, sonra çift tıkla.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Açılış hâlâ başarısızsa bağlamadan çalıştırın — FUSE paketi gerekmez:",
  dl_linux_targz_h4: "Düz arşiv (FUSE yok, kurulum yok):",
  dl_linux_targz_text: "`.tar.gz` sürümü, AppImage sarmalayıcısı olmayan aynı uygulamadır — istediğiniz yere çıkarın ve çalıştırın. Kurulum programı ve FUSE paketi gerekmez.",
  dl_linux_arch_note: "**Sürüm sayfasındaki Linux indirmeleri yalnızca x86_64'tür.** ARM64 makinelerde (Raspberry Pi, Asahi Linux) Flatpak kurulur ama açılışta `bwrap: execvp ldconfig: Exec format error` hatasıyla başarısız olur.",
  dl_warning_h3: "Neden uyarı görebilirsin",
  dl_warning_p1:
    "Arroxy açık kaynaklı ve MIT lisanslıdır. Windows ve macOS derlemeleri **kod imzalı değildir** — Apple Developer ID ve Windows EV kod imzalama sertifikalarının her biri yılda yüzlerce dolara mal olur; bağımsız bir proje bunu cebinden öder. Bu imzalar olmayınca Windows SmartScreen ve macOS Gatekeeper ilk başlatmada uyarır. Uyarılar *işletim sisteminin yayımcıyı tanımadığı* anlamına gelir — Arroxy'nin kötü amaçlı yazılım olduğu anlamına gelmez.",
  dl_warning_p2:
    "Arroxy'yi kendin doğrulamanın giderek daha sıkı üç yolu:\n\n- **Kaynağı oku.** Her satır [GitHub](https://github.com/antonio-orionus/Arroxy) üzerinde ve [kaynaktan derleyebilirsin](#tech).\n- **SHA256 kontrol et.** Dosyanı yayımlanan [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) ile eşleştir — aşağıdaki [İndirmeni doğrula](#verify) bölümüne bak.\n- **Üçüncü taraf taraması yap.** Dosyayı [VirusTotal](https://www.virustotal.com) üzerine yükle.",

  dl_win_first_h3: "Windows ilk başlatma",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows bilgisayarınızı korudu" penceresinde "Daha fazla bilgi" bağlantısı vurgulanmış',
  shot_smartscreen_run_alt:
    'Daha fazla bilgi açıldıktan sonra "Yine de çalıştır" düğmesini gösteren SmartScreen penceresi',
  dl_win_defender_h4: "Windows Defender dosyayı işaretler veya kaldırırsa",
  dl_win_defender_p:
    "Defender sezgisel kuralları bazen imzasız NSIS kurucuları ve Electron taşınabilirlerini şüpheli olarak işaretler. Defender `Arroxy-win-x64-Setup.exe` veya `Arroxy-win-x64-Portable.exe` dosyasını karantinaya alırsa **Windows Güvenliği → Virüs ve tehdit koruması → Koruma geçmişi** içinden geri yükle, sonra Arroxy yürütülebilir dosyasını **Ayarları yönet → Dışlamalar ekle veya kaldır** altında izin verilen öğe olarak ekle. SmartScreen'de olduğu gibi tetikleyici eksik yayımcı imzasıdır, tespit edilmiş kötü amaçlı yazılım değil.",

  dl_macos_first_h3: "macOS ilk başlatma",
  dl_macos_intro:
    "Arroxy henüz macOS için kod imzalı değildir, bu yüzden Gatekeeper DMG'den kurduktan sonra korkutucu *\"Arroxy.app is damaged and can't be opened\"* penceresini gösterebilir. Bu mesaj macOS'un imzasız uygulamayı karantinaya aldığı anlamına gelir; uygulama dosyalarının gerçekten hasarlı olduğu anlamına gelmez. Güncel macOS'ta güvenilir çözüm Terminal'dir:",
  dl_macos_sequoia_h4: "Güncel macOS için Terminal düzeltmesi",
  dl_macos_sequoia_intro:
    "Arroxy'yi Applications içine kopyaladıktan sonra Terminal kullan:",
  dl_macos_sequoia_step1:
    "Bağlanan DMG'den `Arroxy.app` dosyasını `/Applications` içine sürükle.",
  dl_macos_sequoia_step2:
    "Terminal'i aç ve şu iki komutu çalıştır:",
  dl_macos_sequoia_step3:
    "Arroxy'yi başlatmak için `open /Applications/Arroxy.app` çalıştır.",
  dl_macos_sequoia_step4:
    "Uygulama yolu farklıysa `/Applications/Arroxy.app` yerine kurduğun yolu yaz.",
  dl_macos_sonoma_h4: "Eski macOS için Terminal düzeltmesi",
  dl_macos_sonoma_step1:
    "Bağlanan DMG'den `Arroxy.app` dosyasını `/Applications` içine sürükle.",
  dl_macos_sonoma_step2:
    "Terminal'i aç ve `/Applications/Arroxy.app` üzerindeki karantinayı kaldır.",
  dl_macos_sonoma_step3:
    "Karantina kaldırıldıktan sonra Arroxy'yi Terminal veya Finder'dan başlat.",
  dl_macos_damaged_h4:
    "Gatekeeper karantina düzeltmesi",
  dl_macos_damaged_p:
    "İlk komut kurulu Arroxy kopyandan karantina özniteliğini kaldırır. İkinci komut uygulamayı başlatır. `sudo` Mac parolanı isteyebilir; Terminal yazarken karakterleri göstermez.",
  dl_macos_arch_note:
    "**Apple Silicon ve Intel:** M serisi Mac'te (M1 / M2 / M3 / M4) `arm64` DMG indir. Intel Mac'lerde `x64` DMG indir. Yanlış derleme Rosetta ile çalışır ama belirgin şekilde daha yavaştır.",

  dl_linux_first_h3: "Linux ilk başlatma",
  dl_linux_appimagelauncher:
    "**İsteğe bağlı masaüstü entegrasyonu:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) bir kez kurulduğunda, çift tıkladığın her AppImage otomatik olarak başlatıcı menüne kaydolur — elle `.desktop` dosyası gerekmez.",

  dl_verify_h3: "İndirmeni doğrula (SHA256)",
  dl_verify_intro:
    "Her sürüm ikili dosyaların yanında bir `SHA256SUMS` dosyası yayımlar. İndirmenin aktarım sırasında bozulmadığını veya değiştirilmediğini kontrol etmek için dosyanı yerel olarak hash'le ve `SHA256SUMS` içindeki satırla eşleştir. En son sürüm sayfasını aç → **Assets** → `SHA256SUMS` indir.",
  dl_verify_win_label: "Windows (PowerShell veya Komut İstemi):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Üçüncü taraf kötü amaçlı yazılım taraması ister misin? Dosyayı [VirusTotal](https://www.virustotal.com) üzerine yükle. İmzasız Electron uygulamaları için küçük motorlardan gelen birkaç genel sezgisel uyarı normaldir; büyük motorlardan yaygın tespitler gerçek bir endişe olurdu.",

  dl_pm_intro:
    "Zaten bir paket yöneticisi kullanıyorsan elle indirme yolunu atlayabilirsin.",

  privacy_p1:
    "İndirmeler [yt-dlp](https://github.com/yt-dlp/yt-dlp) ile doğrudan YouTube'dan seçtiğin klasöre alınır — hiçbir şey üçüncü taraf sunucu üzerinden yönlendirilmez. İzleme geçmişi, indirme geçmişi, URL'ler ve dosya içerikleri cihazında kalır.",
  privacy_p2:
    "Telemetri yok — günde yalnızca bir anonim sinyal: uygulama sürümü, işletim sistemi, dil, kurulum kanalı ve ülke; böylece etkin kullanıcıları sayabiliriz. Kimlik, URL, video başlığı, dosya yolu veya hesap bilgisi yok. Ayarlar'dan kapatabilirsin.",
  privacy_p3: "Explore, tarayıcından ayrı kendi girişini tutar ve Arroxy giriş formunu asla okumaz ya da doldurmaz — Google'ın kendi sayfasına yazarsın. İndirmeler oturum açmadan çalışır; yalnızca biri hesabın düzeltebileceği bir şekilde başarısız olduğunda Arroxy girişi o an okur, o indirme için geçici bir dosyada tutar ve dosyayı sonra siler. Ayarlar'dan Explore'dan çıkış yapmak girişi unutturur.",
  faq_q1: "Gerçekten ücretsiz mi?",
  faq_a1: "Evet — MIT lisanslı, premium katman yok, özellik kilidi yok.",
  faq_q11: "Arroxy'yi diğer yt-dlp arayüzlerinden ayıran ne?",
  faq_a11:
    "Ücretsiz yt-dlp arayüzlerinin çoğu yalnızca bağlantı alan sarmalayıcılardır. Arroxy buna **Explore**'u ekler: uygulamaya yerleşik bir YouTube tarayıcısı. Bağlantı kopyalamadan göz atıp indirirsin; orada bir kez giriş yaparak özel, üyelere özel ve yaş kısıtlamalı videoları, ayrıca Daha Sonra İzle ve Beğenilenler listelerini çerez dışa aktarmadan indirebilirsin. YouTube robot olmadığını doğrulamanı istediğinde Arroxy bu girişi kullanır; yerleşik tarayıcısı da YouTube'un indirme token'ını alır, böylece indirmeler daha az biçime düşmez. Bkz. [Neden Arroxy](#why).",
  faq_q2: "Hangi video kalitelerini indirebilirim?",
  faq_a2:
    "YouTube ne sunuyorsa: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p ve yalnızca ses. 60 fps ve HDR akışlar olduğu gibi korunur; adım adım indirme ise her çözünürlükte AV1, VP9 veya H.264 seçmeni sağlar.",
  faq_q3: "Yalnızca sesi MP3 olarak çıkarabilir miyim?",
  faq_a3:
    "Evet. Biçim menüsünde *yalnızca ses* seç ve MP3, M4A/AAC, Opus veya WAV tercih et.",
  faq_q4: "Hesap gerektiren YouTube videolarını nasıl indiririm?",
  faq_a4: "Explore sekmesinde bir kez giriş yap. Arroxy bunun ardından hesabının izleyebildiği özel ve üyelere özel videoları, hesabın yaşı doğrulanmışsa yaş kısıtlamalı videoları, ayrıca Daha Sonra İzle ve Beğenilenler listelerini indirebilir. Girişi yalnızca bir indirme, hesabın düzeltebileceği bir şekilde başarısız olduğunda kullanır; geri kalan her şey eskisi gibi iner. Bu, çerez ayarlarında en başta listelenen ve Önerilen olarak işaretlenen **Explore girişi** seçeneğidir ve Explore'u ilk açtığında Arroxy bunu senin için seçer. yt-dlp wiki'si [oturum açılmış otomasyonun bir Google hesabını işaretleyebileceğini](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) belirtir, bu yüzden ikincil hesap daha güvenli bir seçimdir.",
  faq_q5: "YouTube bir şey değiştirdiğinde çalışmaya devam eder mi?",
  faq_a5: "yt-dlp açılışta otomatik güncellenir ve YouTube bir şey değiştirdiğinde Arroxy hızlıca düzeltme yayımlar. YouTube robot olmadığını doğrulamanı istediğinde, Explore'da giriş yaptıysan Arroxy Explore girişini de dener; bir dosyadaki veya tarayıcındaki çerezler de çerez ayarlarında kullanılabilir.",
  faq_q6: "Arroxy hangi dillerde mevcut?",
  faq_a6:
    "Kutudan çıktığı gibi {{LANG_COUNT}} dil: {{LANG_NAME_LIST}}. Arroxy ilk açılışta işletim sisteminin dilini otomatik algılar ve araç çubuğundaki dil seçiciden istediğin zaman değiştirebilirsin. Çalışma zamanı locale JSON dosyaları src/shared/i18n/locales/ içinde, çevirmenlere yönelik PO katalogları i18n/locales/ içinde bulunur — katkı için GitHub'da PR aç.",
  faq_q7: "Başka bir şey kurmam gerekir mi?",
  faq_a7:
    "Hayır. yt-dlp, ffmpeg ve ffprobe ilk açılışta otomatik indirilir ve makinede önbelleğe alınır. Bundan sonra ek kurulum gerekmez.",
  faq_q8: "Oynatma listeleri veya tüm kanalları indirebilir miyim?",
  faq_a8:
    "Evet — ikisi de. Bir oynatma listesi URL'si veya kanal URL'si yapıştır (örn. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`); kaç kayıt taranacağını seç, sonra tüm listeyi kuyruğa al veya belirli videoları seç. Tarih aralığı filtreleri yakında geliyor.",
  faq_q9: 'macOS "uygulama hasarlı" diyor — ne yapmalıyım?',
  faq_a9:
    'Bu, macOS Gatekeeper’ın imzasız uygulamayı engellemesidir; gerçek hasar değildir. Karantinayı kaldırıp Arroxy’yi başlatan Terminal komutları için [macOS ilk başlatma](#macos-first-launch) bölümüne bak.',
  faq_q10: "YouTube videoları indirmek yasal mı?",
  faq_a10:
    "Kişisel, özel kullanım için çoğu yargı alanında genellikle kabul edilir. YouTube'un [Hizmet Şartları](https://www.youtube.com/t/terms) ve yerel telif hakkı yasalarına uymaktan sen sorumlusun.",
  plan_intro: "Hâlâ planlananlar — yaklaşık öncelik sırasıyla:",
  plan_col1: "Özellik",
  plan_col2: "Açıklama",
  plan_r1_name: "**Oynatma listesi ve kanal filtreleri**",
  plan_r1_desc: "Bir oynatma listesi veya kanal listelenirken tarih aralığı filtreleri",
  plan_r2_name: "**YouTube ses parçası tercihleri**",
  plan_r2_desc:
    "YouTube birden fazla ses parçası sunduğunda profil bazlı geçersiz kılmalarla birlikte uygulama geneli konuşulan dil tercihi ayarla",
  plan_r3_name: "**Daha güçlü yeniden deneme kurtarması**",
  plan_r3_desc:
    "Güvenilmez veya sorunlu internet bağlantılarıyla kesilen indirmeler için yeni bir yeniden deneme yolu",
  plan_r4_name: "**Tam indirme yöneticisi çekmecesi**",
  plan_r4_desc:
    "Kuyruk çekmecesini, kuyruktaki öğelerin hedef klasörlerini değiştirme dahil daha kapsamlı bir yöneticisine dönüştür",
  plan_r5_name: "**Zamanlanmış indirmeler**",
  plan_r5_desc: "Bir kuyruğu belirli saatte başlat (gece çalıştırmaları)",
  plan_r9_name: "**AUR paketi**",
  plan_r9_desc: "Arch Linux ve Omarchy'ye `yay -S arroxy-bin` ile kurulum",
  plan_cta:
    "Aklında bir özellik mi var? [İstek aç](../../issues) — topluluk girdisi önceliği şekillendirir.",
  tech_content: TECH_CONTENT,
  support_h2: "Arroxy'yi destekle",
  support_note: "Arroxy ücretsizdir ve MIT lisanslıdır — reklam yok, telemetri yok, ücretli sürüm yok. Sana zaman kazandırıyorsa geliştirmeyi Bitcoin, Tron veya Ethereum ile destekleyebilirsin: adresler, tek resmi kaynak olan [DONATE.md](DONATE.md) dosyasında. Arroxy sana asla e-posta veya özel mesajla adres göndermez. Depoya yıldız vermek, hata bildirmek ve çevirileri iyileştirmek de en az o kadar yardımcı olur.",
  tos_h2: "Kullanım şartları",
  tos_note:
    "Arroxy yalnızca kişisel, özel kullanım için bir araçtır. İndirmelerinin YouTube [Hizmet Şartları](https://www.youtube.com/t/terms) ve bulunduğun yargı alanındaki telif hakkı yasalarına uygun olduğundan yalnızca sen sorumlusun. Kullanma hakkına sahip olmadığın içerikleri indirmek, çoğaltmak veya dağıtmak için Arroxy'yi kullanma. Geliştiriciler kötüye kullanımdan sorumlu değildir.",
  footer_credit:
    'MIT Lisansı · Özenle geliştiren <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
