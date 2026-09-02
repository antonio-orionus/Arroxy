<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Μασκότ Arroxy" width="180" />

# Arroxy — Δωρεάν Ανοιχτού Κώδικα Λήψη YouTube (+ 2000 ιστοτόπους) για Windows, macOS & Linux

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Διαβάστε στα:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · **Ελληνικά** · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Έκδοση](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Ιστότοπος](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Άδεια](https://img.shields.io/badge/license-MIT-green) ![Πλατφόρμες](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Γλώσσες](https://img.shields.io/badge/i18n-24_languages-blue)

Κατεβάστε βίντεο, Shorts, μουσική, κανάλια, podcasts ή ηχητικά κομμάτια από το **YouTube και 2000+ υποστηριζόμενους ιστοτόπους** — έως 4K HDR στα 60 fps, ή ως MP3 / AAC / Opus. Εκτελείται τοπικά σε Windows, macOS και Linux. **Χωρίς διαφημίσεις, χωρίς bloat, χωρίς upsells.**

[**↓ Λήψη Τελευταίας Έκδοσης**](#install) &nbsp;·&nbsp; [**Ιστότοπος**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows — πρώτη εκκίνηση](#windows-first-launch) · [macOS — πρώτη εκκίνηση](#macos-first-launch) · [Linux — πρώτη εκκίνηση](#linux-first-launch)

[![Εγγραφείτε στην κοινότητα Discord](https://img.shields.io/badge/%CE%95%CE%B3%CE%B3%CF%81%CE%B1%CF%86%CE%B5%CE%AF%CF%84%CE%B5%20%CF%83%CF%84%CE%B7%CE%BD%20%CE%BA%CE%BF%CE%B9%CE%BD%CF%8C%CF%84%CE%B7%CF%84%CE%B1%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Demo του Arroxy" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

Αν το Arroxy σας εξοικονομεί χρόνο, ένα ⭐ βοηθά άλλους να το βρουν.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-09-02._

---

## Περιεχόμενα

- [Εγκατάσταση και πρώτη εκκίνηση](#install)
  - [Εγκατάσταση μέσω διαχειριστή πακέτων](#package-manager)
  - [Windows — πρώτη εκκίνηση](#windows-first-launch)
  - [macOS — πρώτη εκκίνηση](#macos-first-launch)
  - [Γιατί μπορεί να δείτε προειδοποίηση](#why-warning)
  - [Linux — πρώτη εκκίνηση](#linux-first-launch)
  - [Επαληθεύστε τη λήψη σας (SHA256)](#verify)
- [Γιατί Arroxy](#why)
- [Χαρακτηριστικά](#features)
- [Απόρρητο](#privacy)
- [Συχνές Ερωτήσεις](#faq)
- [Χάρτης Πορείας](#roadmap)
- [Υποστήριξη του Arroxy](#support)
- [Κατασκευάστηκε με](#tech)

---

## <a id="install"></a>Εγκατάσταση και πρώτη εκκίνηση

| Πλατφόρμα | Μορφή                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe)                                                                                                                                                                                                        |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg)                                                                                                                                                                                                                     |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS)                                                                                                                                                                                                                                                                                                                                                                                                                                              |

[**Αποκτήστε την τελευταία έκδοση →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="package-manager"></a>Εγκατάσταση μέσω διαχειριστή πακέτων

Χρησιμοποιείτε ήδη διαχειριστή πακέτων; Μπορείτε να παραλείψετε τη χειροκίνητη λήψη.

| Κανάλι | Εντολή                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak (local file) | `flatpak install --user ./Arroxy-linux-x64.flatpak`                                            |

### <a id="windows-first-launch"></a>Windows — πρώτη εκκίνηση

Κατά την πρώτη εκκίνηση μπορεί να δείτε **"Windows protected your PC"** ή **"Unknown publisher."** Αυτό ισχύει τόσο για το `Arroxy-win-x64-Setup.exe` όσο και για το `Arroxy-win-x64-Portable.exe`. Το Arroxy είναι δωρεάν και ανοιχτού κώδικα και τα Windows builds δεν είναι υπογεγραμμένα με επί πληρωμή πιστοποιητικό, γι' αυτό το SmartScreen τα επισημαίνει. Αυτό **δεν** σημαίνει αυτόματα ότι το Arroxy είναι επικίνδυνο. Για να συνεχίσετε:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="Παράθυρο SmartScreen "Windows protected your PC" με τον σύνδεσμο "More info" επισημασμένο" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="Παράθυρο SmartScreen μετά την ανάπτυξη του More info, που δείχνει το κουμπί "Run anyway"" />
</div>

1. Κάντε κλικ στο **More info**.
2. Κάντε κλικ στο **Run anyway**.

#### Αν το Windows Defender επισημάνει ή αφαιρέσει το αρχείο

Τα ευρετικά του Defender επισημαίνουν μερικές φορές ανυπόγραφα NSIS installers και Electron portables ως ύποπτα. Αν ο Defender βάλει σε καραντίνα το `Arroxy-win-x64-Setup.exe` ή το `Arroxy-win-x64-Portable.exe`, επαναφέρετέ το από **Windows Security → Virus & threat protection → Protection history**, και στη συνέχεια προσθέστε το εκτελέσιμο αρχείο του Arroxy ως επιτρεπόμενο στοιχείο στο **Manage settings → Add or remove exclusions**. Όπως και με το SmartScreen, η αιτία είναι η έλλειψη υπογραφής εκδότη, όχι εντοπισμός κακόβουλου λογισμικού.

> Κατεβάστε το Arroxy μόνο από την επίσημη σελίδα GitHub Releases. Αν το αρχείο προήλθε από άλλη ιστοσελίδα ή σας το έστειλε κάποιος, διαγράψτε το και κατεβάστε αντίγραφο από την επίσημη πηγή. Ο πηγαίος κώδικας είναι δημόσιος, οπότε μπορείτε να τον ελέγξετε ή να φτιάξετε το Arroxy μόνοι σας αν προτιμάτε.

### <a id="macos-first-launch"></a>macOS — πρώτη εκκίνηση

Το Arroxy δεν έχει ακόμα υπογραφεί ψηφιακά για macOS, οπότε το Gatekeeper μπορεί να εμφανίσει το τρομακτικό μήνυμα *"Arroxy.app is damaged and can't be opened"* μετά την εγκατάσταση από το DMG. Αυτό σημαίνει ότι το macOS έθεσε σε quarantine μια μη υπογεγραμμένη εφαρμογή· δεν σημαίνει ότι τα αρχεία της εφαρμογής είναι πραγματικά κατεστραμμένα. Στα τρέχοντα macOS, η αξιόπιστη λύση είναι το Terminal:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Σύρετε το `Arroxy.app` από το τοποθετημένο DMG στον φάκελο `/Applications`.
2. Ανοίξτε το Terminal και εκτελέστε αυτές τις δύο εντολές:

```bash
sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

Η πρώτη εντολή αφαιρεί το χαρακτηριστικό quarantine από το εγκατεστημένο αντίγραφο του Arroxy. Η δεύτερη ξεκινά την εφαρμογή. Το `sudo` μπορεί να ζητήσει τον κωδικό του Mac σας· το Terminal δεν εμφανίζει χαρακτήρες όσο τον πληκτρολογείτε.

**Apple Silicon έναντι Intel:** σε Mac με επεξεργαστή M-series (M1 / M2 / M3 / M4), κατεβάστε το DMG `arm64`. Σε Intel Mac, κατεβάστε το DMG `x64`. Η εκτέλεση του λάθος build λειτουργεί μέσω Rosetta αλλά είναι αισθητά πιο αργή.

> Τα builds για macOS παράγονται μέσω CI σε Apple Silicon και Intel runners. Αν αντιμετωπίσετε προβλήματα, παρακαλώ [ανοίξτε ένα ζήτημα](../../issues) — τα σχόλια χρηστών macOS διαμορφώνουν ενεργά τον κύκλο δοκιμών macOS.

### <a id="why-warning"></a>Γιατί μπορεί να δείτε προειδοποίηση

Το Arroxy είναι ανοιχτού κώδικα και αδειοδοτημένο με MIT. Τα builds για Windows και macOS **δεν υπογράφονται ψηφιακά** — τα πιστοποιητικά Apple Developer ID και Windows EV code-signing κοστίζουν εκατοντάδες δολάρια το χρόνο, που ένα indie project πληρώνει από την τσέπη του. Χωρίς αυτές τις υπογραφές, το Windows SmartScreen και το macOS Gatekeeper θα σας προειδοποιήσουν κατά την πρώτη εκκίνηση. Οι προειδοποιήσεις σημαίνουν *ότι το OS σας δεν αναγνωρίζει τον εκδότη* — δεν σημαίνουν ότι το Arroxy είναι κακόβουλο λογισμικό.

Τρεις τρόποι να επαληθεύσετε το Arroxy μόνοι σας, με αυξανόμενη αυστηρότητα:

- **Διαβάστε τον πηγαίο κώδικα.** Κάθε γραμμή βρίσκεται στο [GitHub](https://github.com/antonio-orionus/Arroxy) και μπορείτε να [κατασκευάσετε από τον πηγαίο κώδικα](#tech).
- **Ελέγξτε το SHA256.** Αντιστοιχίστε το αρχείο σας με το δημοσιευμένο [`SHA256SUMS`](../../releases/latest) — δείτε παρακάτω [Επαληθεύστε τη λήψη σας](#verify).
- **Εκτελέστε σάρωση τρίτου.** Ανεβάστε το αρχείο στο [VirusTotal](https://www.virustotal.com).

### <a id="linux-first-launch"></a>Linux — πρώτη εκκίνηση

Τα AppImage εκτελούνται απευθείας — χωρίς εγκατάσταση. Απλά πρέπει να επισημάνετε το αρχείο ως εκτελέσιμο.

**Διαχειριστής αρχείων:** δεξί κλικ στο `.AppImage` → **Ιδιότητες** → **Δικαιώματα** → ενεργοποιήστε **Να επιτρέπεται η εκτέλεση αρχείου ως πρόγραμμα**, στη συνέχεια διπλό κλικ.

**Terminal:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Αν η εκκίνηση εξακολουθεί να αποτυγχάνει, τρέξτε το χωρίς προσάρτηση — δεν χρειάζεται πακέτο FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Προαιρετική ενσωμάτωση επιφάνειας εργασίας:** εγκαταστήστε μία φορά το [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) και κάθε AppImage που κάνετε διπλό κλικ καταχωρείται αυτόματα στο μενού εκκίνησής σας — δεν χρειάζεται χειροκίνητο αρχείο `.desktop`.

**Απλό αρχείο tar (χωρίς FUSE, χωρίς εγκατάσταση):**

Η έκδοση `.tar.gz` είναι η ίδια εφαρμογή χωρίς το περίβλημα AppImage — αποσυμπιέστε την οπουδήποτε και τρέξτε την. Χωρίς πρόγραμμα εγκατάστασης και χωρίς πακέτο FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Flatpak (εναλλακτικό σε sandbox):** κατεβάστε το `Arroxy-*.flatpak` από την ίδια σελίδα έκδοσης.

Το Ubuntu διαθέτει Snap αντί για Flatpak, οπότε εγκαταστήστε πρώτα το Flatpak και προσθέστε το Flathub — από εκεί κατεβάζει το πακέτο το runtime του:

```bash
# Ubuntu / Debian
sudo apt install -y flatpak

# Fedora
sudo dnf install -y flatpak

# Arch
sudo pacman -S flatpak
```

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user ./Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

**Τα αρχεία Linux στη σελίδα εκδόσεων είναι μόνο x86_64.** Σε μηχανήματα ARM64 (Raspberry Pi, Asahi Linux) το Flatpak εγκαθίσταται αλλά αποτυγχάνει στην εκκίνηση με `bwrap: execvp ldconfig: Exec format error`.

<details>
<summary><strong><a id="verify"></a>Επαληθεύστε τη λήψη σας (SHA256)</strong></summary>

Κάθε έκδοση δημοσιεύει ένα αρχείο `SHA256SUMS` μαζί με τα δυαδικά αρχεία. Για να ελέγξετε ότι η λήψη σας δεν έχει αλλοιωθεί ή τροποποιηθεί κατά τη μεταφορά, κάντε hash το αρχείο σας τοπικά και αντιστοιχίστε τη γραμμή στο `SHA256SUMS`. Ανοίξτε τη σελίδα τελευταίας έκδοσης → **Assets** → κατεβάστε το `SHA256SUMS`.

**Windows (PowerShell ή Command Prompt):**

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

Θέλετε σάρωση κακόβουλου λογισμικού από τρίτο; Ανεβάστε το αρχείο στο [VirusTotal](https://www.virustotal.com). Μερικές ευρετικές σημαίες από μικρές μηχανές είναι φυσιολογικές για ανυπόγραφες εφαρμογές Electron· εκτεταμένες εντοπίσεις από μεγάλες μηχανές θα ήταν πραγματική ανησυχία.

</details>

<details>
<summary><strong>Windows: Πρόγραμμα εγκατάστασης vs Φορητό</strong></summary>

|               | NSIS Installer | Φορητό `.exe` |
| ------------- | :----------------------: | :---------------------: |
| Απαιτείται εγκατάσταση | Ναι  | Όχι — εκτέλεση από οπουδήποτε  |
| Αυτόματες ενημερώσεις | ✅ εντός εφαρμογής  | ❌ χειροκίνητη λήψη  |
| Ταχύτητα εκκίνησης | ✅ ταχύτερη  | ⚠️ πιο αργή κρύα εκκίνηση  |
| Προσθήκη στο μενού Έναρξης |            ✅            |           ❌            |
| Εύκολη απεγκατάσταση |            ✅            | ❌ διαγράψτε το αρχείο  |

**Σύσταση:** χρησιμοποιήστε το πρόγραμμα εγκατάστασης NSIS για αυτόματες ενημερώσεις και ταχύτερη εκκίνηση. Χρησιμοποιήστε το φορητό `.exe` για επιλογή χωρίς εγκατάσταση και χωρίς μητρώο.

</details>

---

## <a id="why"></a>Γιατί Arroxy

Σύγκριση δίπλα-δίπλα με τις πιο κοινές εναλλακτικές λύσεις:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Δωρεάν, χωρίς premium επίπεδο |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Ανοιχτού κώδικα |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Μόνο τοπική επεξεργασία |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Χωρίς σύνδεση ή εξαγωγή cookies |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Χωρίς όρια χρήσης |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Εφαρμογή επιφάνειας εργασίας για πολλαπλές πλατφόρμες |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Υπότιτλοι + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Το Arroxy κατασκευάστηκε για ένα πράγμα: επικολλήστε ένα URL, αποκτήστε ένα καθαρό τοπικό αρχείο. Χωρίς λογαριασμούς, χωρίς upsells, χωρίς συλλογή δεδομένων.

---

## <a id="features"></a>Χαρακτηριστικά

### Ποιότητα & μορφές

- Έως **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Υψηλός ρυθμός καρέ** διατηρείται ως έχει — 60 fps, 120 fps, HDR
- **Ήχος** — εξαγωγή μόνο ήχου σε MP3, M4A/AAC, Opus ή WAV. Στις διαδραστικές λήψεις, επίλεξε τα εγγενή κομμάτια surround/Dolby της πηγής (AC-3, E-AC-3, 5.1, DRC) όταν είναι διαθέσιμα, ή όρισε μια καθολική προεπιλογή **Προτίμηση surround / Dolby**
- Γρήγορες προεπιλογές: *Καλύτερη ποιότητα* · *Ισορροπημένη* · *Μικρό αρχείο*

### Απόρρητο & έλεγχος

- 100% τοπική επεξεργασία — οι λήψεις πηγαίνουν απευθείας από το YouTube στον δίσκο σας
- Χωρίς σύνδεση, χωρίς cookies, χωρίς συνδεδεμένο λογαριασμό Google
- Αρχεία αποθηκευμένα απευθείας στον φάκελο που επιλέγετε

### Ροή εργασίας

- **Ευέλικτοι τρόποι εκκίνησης** — διάλεξε καθοδηγούμενη μεμονωμένη λήψη, επιλογέα playlist/καναλιού, μαζική επικόλληση URL ή Quick Download με αποθηκευμένες προεπιλογές
- **Κεντρική ουρά λήψεων** — κάθε μεμονωμένη, playlist, μαζική ή γρήγορη εργασία καταλήγει σε ένα σημείο για πρόοδο, παύση, συνέχιση, ακύρωση, επανάληψη και έλεγχο προτεραιότητας
- **Παρακολούθηση πρόχειρου** — αντιγράψτε έναν σύνδεσμο YouTube και το Arroxy συμπληρώνει αυτόματα το URL όταν εστιάζετε ξανά στην εφαρμογή (εναλλαγή στις Σύνθετες ρυθμίσεις)
- **Αυτόματη εκκαθάριση URL** — αφαιρεί παραμέτρους παρακολούθησης (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) και ξετυλίγει συνδέσμους `youtube.com/redirect`
- **Λειτουργία δίσκου** — το κλείσιμο του παραθύρου διατηρεί τις λήψεις στο παρασκήνιο
- **24 γλώσσες** — εντοπίζει αυτόματα τη γλώσσα συστήματος, με αλλαγή οποιαδήποτε στιγμή
- **Συγχρονισμός playlist** — ξανασαρώνει μια playlist σε σχέση με έναν τοπικό φάκελο για να παραλείψει ήδη κατεβασμένα βίντεο· δημιουργεί ένα αρχείο playlist `.m3u` που ενημερώνεται καθώς κατεβαίνει κάθε βίντεο
- **Έλεγχοι ταχύτητας και ρυθμού** — περιόρισε το bandwidth λήψης, όρισε πόσα μέρη ενός βίντεο κατεβαίνουν ταυτόχρονα και πρόσθεσε καθυστερήσεις αιτημάτων με προεπιλογές (*Ανενεργό · Ισορροπημένο · Προσεκτικό · Προσαρμοσμένο*)
- **Πρότυπα ονομάτων αρχείων** — ονομάστε τις λήψεις όπως θέλετε με `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` και `{playlist_index}`, καθολικά ή ανά προφίλ λήψης
- **Ταυτόχρονες λήψεις και αυτόματη επανάληψη** — διάλεξε πόσες λήψεις της ουράς τρέχουν ταυτόχρονα και άσε το Arroxy να επαναλάβει μια λήψη που συνάντησε πρόβλημα δικτύου ή διακομιστή, περιμένοντας περισσότερο πριν από κάθε προσπάθεια
- **Προφίλ ανά βίντεο σε playlist** — αναθέστε σε κάθε βίντεο μιας playlist το δικό του προφίλ λήψης αντί για μία ρύθμιση για ολόκληρη τη λίστα, ώστε ένα πέρασμα να αρχειοθετεί κάποια σε πλήρη ποιότητα και να παίρνει τα υπόλοιπα ως MP3

### Υπότιτλοι & μετεπεξεργασία

- **Υπότιτλοι** σε SRT, VTT ή ASS — χειροκίνητοι ή αυτόματα δημιουργημένοι, σε οποιαδήποτε διαθέσιμη γλώσσα
- Αποθήκευση δίπλα στο βίντεο, ενσωμάτωση σε `.mkv`, ή οργάνωση σε υποφάκελο `Subtitles/`
- **SponsorBlock** — παράλειψη ή επισήμανση κεφαλαίου για χορηγούς, εισαγωγές, εξόδους, αυτο-προωθήσεις
- **Ενσωματωμένα μεταδεδομένα** — τίτλος, ημερομηνία μεταφόρτωσης, κανάλι, περιγραφή, μικρογραφία και δείκτες κεφαλαίων γραμμένα στο αρχείο

### YouTube + 2000 ιστοτόποι

- **YouTube, πλήρως** — βίντεο, Shorts, κανάλια, playlists, YouTube Music και podcasts χειρίζονται ως πρωτεύουσες πηγές
- **2000+ άλλοι ιστοτόποι** μέσω yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org και πολλοί άλλοι
- **Μόνο ήχος και υπότιτλοι** λειτουργούν σε κάθε υποστηριζόμενο ιστοτόπο, όχι μόνο στο YouTube
- Αν ένας ιστοτόπος αλλάξει, το yt-dlp παρέχει διορθώσεις εβδομαδιαία και το Arroxy ενημερώνει αυτόματα το εκτελέσιμο κατά την εκκίνηση

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Προφίλ ανά βίντεο σε playlist</b><br/>Δώστε σε κάθε βίντεο το δικό του προφίλ — άλλα σε 4K, τα υπόλοιπα ως MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Αρχική Γρήγορης λήψης</b><br/>Επικολλήστε ένα URL και κατεβάστε το αμέσως με το ενεργό προφίλ σας</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Επαναχρησιμοποιήσιμα προφίλ λήψης</b><br/>Αποθηκεύστε μορφή, ποιότητα και έξοδο ως προεπιλογές — επαναχρησιμοποιήστε σε κάθε λήψη</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Πολύγλωσσα κομμάτια ήχου</b><br/>Επιλέξτε την ακριβή γλώσσα ήχου που διαθέτει το βίντεο</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Ήχος Surround / Dolby</b><br/>Τα κομμάτια 5.1 και Dolby εντοπίζονται και διατηρούνται</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Λειτουργία μαζικών URL</b><br/>Επικολλήστε μια λίστα, αυτόματη αφαίρεση διπλότυπων, βάλτε τα όλα στην ουρά μαζί</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>Παράλληλη ουρά λήψεων</b><br/>Πολλές λήψεις ταυτόχρονα με ζωντανή πρόοδο</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>Απόρρητο

Οι λήψεις γίνονται απευθείας μέσω [yt-dlp](https://github.com/yt-dlp/yt-dlp) από το YouTube στον φάκελο που επιλέγετε — τίποτα δεν δρομολογείται μέσω τρίτου διακομιστή. Το ιστορικό παρακολούθησης, το ιστορικό λήψεων, τα URL και τα περιεχόμενα αρχείων παραμένουν στη συσκευή σας.

Το Arroxy στέλνει ανώνυμη, συγκεντρωτική τηλεμετρία μέσω [OpenPanel](https://openpanel.dev) — μόνο ό,τι χρειάζεται για σφάλματα, καταρρεύσεις, σχόλια, OS και εκδόσεις εφαρμογής. Χωρίς URLs, τίτλους βίντεο, διαδρομές αρχείων, στοιχεία λογαριασμού, fingerprinting ή προσωπικά δεδομένα. Το αναγνωριστικό ανά εγκατάσταση είναι τυχαίο και δεν συνδέεται με την ταυτότητά σας. Μπορείτε να το απενεργοποιήσετε στις Ρυθμίσεις.

---

## <a id="faq"></a>Συχνές Ερωτήσεις

**Είναι πραγματικά δωρεάν;**
Ναι — άδεια MIT, χωρίς premium επίπεδο, χωρίς περιορισμούς λειτουργιών.

**Ποιες ποιότητες βίντεο μπορώ να κατεβάσω;**
Ό,τι παρέχει το YouTube: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, καθώς και μόνο ήχο. Ροές 60 fps, 120 fps και HDR διατηρούνται ως έχουν.

**Μπορώ να εξάγω μόνο τον ήχο ως MP3;**
Ναι. Επίλεξε *μόνο ήχος* στο μενού μορφής και μετά MP3, M4A/AAC, Opus ή WAV.

**Χρειάζομαι λογαριασμό YouTube ή cookies;**
Από προεπιλογή, όχι — το Arroxy λειτουργεί χωρίς λογαριασμό YouTube, σύνδεση ή εξαγωγή cookies. Προαιρετική υποστήριξη cookies είναι διαθέσιμη στις Προηγμένες ρυθμίσεις (Cookies source: file or browser) για περιεχόμενο που απαιτεί έλεγχο ταυτότητας, όπως βίντεο με περιορισμό ηλικίας ή μόνο για μέλη. Είναι απενεργοποιημένη από προεπιλογή. Αν την ενεργοποιήσετε, το wiki του yt-dlp σημειώνει ότι [η αυτοματοποίηση με βάση cookies μπορεί να επισημάνει έναν λογαριασμό Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)· σε αυτή την περίπτωση, ένας προσωρινός λογαριασμός είναι η ασφαλέστερη επιλογή.

**Θα συνεχίσει να λειτουργεί όταν το YouTube αλλάξει κάτι;**
Το yt-dlp ενημερώνεται αυτόματα κατά την εκκίνηση, και το Arroxy κυκλοφορεί διορθώσεις άμεσα όταν το YouTube αλλάζει κάτι. Αν ποτέ αντιμετωπίσετε πρόβλημα, προαιρετική υποστήριξη cookies είναι διαθέσιμη στις Προηγμένες ρυθμίσεις ως εφεδρεία.

**Σε ποιες γλώσσες είναι διαθέσιμο το Arroxy;**
24 γλώσσες είναι διαθέσιμες από την αρχή: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Kiswahili · O'zbekcha · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · বাংলা · हिन्दी · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語. Το Arroxy εντοπίζει αυτόματα τη γλώσσα του λειτουργικού συστήματος στην πρώτη εκκίνηση και μπορείς να αλλάξεις γλώσσα οποιαδήποτε στιγμή από τον επιλογέα στη γραμμή εργαλείων. Τα Runtime locale JSON βρίσκονται στο src/shared/i18n/locales/, και οι κατάλογοι PO για μεταφραστές βρίσκονται στο i18n/locales/ — άνοιξε PR στο GitHub για να συνεισφέρεις.

**Χρειάζεται να εγκαταστήσω κάτι άλλο;**
Όχι. Το yt-dlp κατεβαίνει αυτόματα στην πρώτη εκκίνηση και αποθηκεύεται στον υπολογιστή σας· το ffmpeg και το ffprobe περιλαμβάνονται στην εφαρμογή. Μετά από αυτό δεν απαιτείται καμία επιπλέον ρύθμιση.

**Μπορώ να κατεβάσω λίστες αναπαραγωγής ή ολόκληρα κανάλια;**
Ναι — και τα δύο. Επικόλλησε URL playlist ή καναλιού (π.χ. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`), διάλεξε πόσες εγγραφές θα σαρωθούν και μετά βάλε όλη τη λίστα στην ουρά ή επίλεξε συγκεκριμένα βίντεο. Τα φίλτρα εύρους ημερομηνιών έρχονται σύντομα.

**Το macOS λέει "η εφαρμογή είναι κατεστραμμένη" — τι να κάνω;**
Αυτό είναι το macOS Gatekeeper που αποκλείει μια μη υπογεγραμμένη εφαρμογή, όχι πραγματική βλάβη. Δείτε το [macOS first launch](#macos-first-launch) για τις εντολές Terminal που αφαιρούν το quarantine και ξεκινούν το Arroxy.

**Είναι νόμιμη η λήψη βίντεο YouTube;**
Για προσωπική, ιδιωτική χρήση γίνεται γενικά αποδεκτή στις περισσότερες δικαιοδοσίες. Είστε υπεύθυνοι για τη συμμόρφωση με τους [Όρους Χρήσης](https://www.youtube.com/t/terms) του YouTube και τους τοπικούς νόμους πνευματικής ιδιοκτησίας.

---

## <a id="roadmap"></a>Χάρτης Πορείας

Ακόμα προγραμματισμένα — περίπου με σειρά προτεραιότητας:

| Λειτουργία    | Περιγραφή    |
| ---------------- | ---------------- |
| **Φίλτρα playlist & καναλιών** | Φίλτρα εύρους ημερομηνιών κατά την απαρίθμηση playlist ή καναλιού |
| **Προτιμήσεις ηχητικών κομματιών YouTube** | Ορισμός προτίμησης κομματιού ομιλούμενης γλώσσας σε όλη την εφαρμογή, με overrides ανά προφίλ όταν το YouTube παρέχει πολλαπλά ηχητικά κομμάτια |
| **Σύνδεση με browser μέσα στην εφαρμογή** | Άνοιγμα παραθύρων browser μέσα στο Arroxy για σύνδεση και χρήση site cookies χωρίς χειροκίνητη εξαγωγή |
| **Λήψη βίντεο με ένα κλικ** | Έναρξη λήψης βίντεο με ένα κλικ από ανιχνευμένο ή επικολλημένο URL χρησιμοποιώντας το ενεργό προφίλ |
| **Ισχυρότερη ανάκτηση με επανάληψη** | Νέα διαδρομή επανάληψης για λήψεις που διακόπτονται από αναξιόπιστες ή προβληματικές συνδέσεις internet |
| **Πλήρες drawer διαχείρισης λήψεων** | Μετατροπή του drawer ουράς σε πληρέστερο manager, μαζί με αλλαγή φακέλων προορισμού για στοιχεία στην ουρά |
| **Προγραμματισμένες λήψεις** | Ξεκινήστε μια ουρά σε καθορισμένη ώρα (νυχτερινές εκτελέσεις) |
| **Περικοπή κλιπ** | Λήψη μόνο ενός τμήματος με χρόνο έναρξης/λήξης |

Έχετε κάποια λειτουργία στο μυαλό σας; [Ανοίξτε ένα αίτημα](../../issues) — η συμβολή της κοινότητας διαμορφώνει τις προτεραιότητες.

---

## <a id="support"></a>Υποστήριξη του Arroxy

Το Arroxy είναι δωρεάν και με άδεια MIT — χωρίς διαφημίσεις, χωρίς επί πληρωμή έκδοση. Αν σου εξοικονομεί χρόνο, μπορείς να στηρίξεις την ανάπτυξή του με Bitcoin ή Tron: οι διευθύνσεις βρίσκονται στο [DONATE.md](DONATE.md), τη μοναδική επίσημη πηγή γι' αυτές. Το Arroxy δεν θα σου στείλει ποτέ διεύθυνση με email ή προσωπικό μήνυμα. Ένα αστέρι στο αποθετήριο, οι αναφορές σφαλμάτων και οι βελτιώσεις στις μεταφράσεις βοηθούν εξίσου.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a>

---

## <a id="tech"></a>Κατασκευάστηκε με

<details>
<summary><strong>Στοίβα τεχνολογιών</strong></summary>

- **Electron** — cross-platform desktop shell
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Zustand** — διαχείριση κατάστασης
- **yt-dlp** + **ffmpeg** — μηχανή λήψης και mux (το yt-dlp λαμβάνεται στο runtime· τα ffmpeg/ffprobe περιλαμβάνονται στο build)
- **Vite** + **electron-vite** — build tooling
- **Vitest** + **Playwright** — unit και end-to-end tests

</details>

<details>
<summary><strong>Κατασκευή από πηγαίο κώδικα</strong></summary>

### Προαπαιτούμενα — όλες οι πλατφόρμες

| Εργαλείο | Έκδοση  | Εγκατάσταση |
| -------- | ------- | ----------- |
| Git      | οποιαδήποτε | [git-scm.com](https://git-scm.com) |
| Node.js  | 24.16.0 | `mise install` ή `.node-version` |
| Bun      | 1.2.23  | `mise install` ή `package.json` `packageManager` |

Προτείνεται: εγκαταστήστε το `mise` και μετά τρέξτε `mise install` στο checkout. Χωρίς mise, ενεργοποιήστε χειροκίνητα το Node.js από το `.node-version` και το Bun από το `package.json` πριν από το `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools και Python μπορεί να χρειαστούν για native rebuilds.

### macOS

```bash
brew install mise
xcode-select --install
```

Μετά το clone, τρέξε `mise trust && mise install` μέσα από το checkout. Αν το shell σου χρησιμοποιεί ήδη `fnm`, `nvm` ή Bun από Homebrew, ενεργοποίησε το mise στο `~/.zshrc` ώστε το Arroxy να χρησιμοποιεί Node.js 24.16.0 και Bun 1.2.23:

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

# Εξαρτήσεις build και Electron runtime
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E tests only (Electron needs a display)
sudo apt install -y xvfb
```

### Κλωνοποίηση & εκτέλεση

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # προτείνεται· παραλείψτε το αν ενεργοποιήσατε χειροκίνητα τα pinned tools
bun run bootstrap
bun run doctor
bun run dev            # Electron app με Vite renderer
```

### Κατασκευή διανεμήσιμου πακέτου

```bash
bun run build        # typecheck + compile
bun run dist         # package for current OS
bun run dist:win     # πακετάρισμα Windows targets σε υποστηριζόμενο host
```

> Το `bun run bootstrap` εγκαθιστά εξαρτήσεις, ξαναχτίζει τις εξαρτήσεις της Electron εφαρμογής, ελέγχει το Electron, προετοιμάζει τα ενσωματωμένα ffmpeg/ffprobe για ανάπτυξη και εγκαθιστά το Playwright Chromium. Το yt-dlp διαχειρίζεται στο runtime μέσα στον φάκελο δεδομένων της εφαρμογής· τα ffmpeg και ffprobe περιλαμβάνονται σε κάθε έκδοση του Arroxy.

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

## Όροι χρήσης

Το Arroxy είναι εργαλείο αποκλειστικά για προσωπική, ιδιωτική χρήση. Είστε αποκλειστικά υπεύθυνοι για τη διασφάλιση ότι οι λήψεις σας συμμορφώνονται με τους [Όρους Χρήσης](https://www.youtube.com/t/terms) του YouTube και τους νόμους πνευματικής ιδιοκτησίας της δικαιοδοσίας σας. Μην χρησιμοποιείτε το Arroxy για λήψη, αναπαραγωγή ή διανομή περιεχομένου που δεν έχετε δικαίωμα χρήσης. Οι προγραμματιστές δεν ευθύνονται για οποιαδήποτε κακή χρήση.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT License · Δημιουργήθηκε με φροντίδα από <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
