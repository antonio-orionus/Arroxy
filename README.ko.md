<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Arroxy 마스코트" width="180" />

# Arroxy — Windows, macOS, Linux용 무료 오픈 소스 YouTube(+ 2000개 사이트) 다운로더

**4K · 1080p60 · HDR · Surround/Dolby audio · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**다른 언어로 읽기:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · **한국어** · [繁體中文](README.zh-Hant.md)

[![릴리스](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![빌드](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![웹사이트](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![라이선스](https://img.shields.io/badge/license-MIT-green) ![플랫폼](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![언어](https://img.shields.io/badge/i18n-30_languages-blue)

**YouTube 및 지원되는 2000개 이상의 사이트**에서 동영상, Shorts, 음악, 채널, 팟캐스트 또는 오디오 트랙을 다운로드하세요. 60 fps 4K HDR까지, 또는 MP3 / AAC / Opus로 저장할 수 있습니다. Windows, macOS, Linux에서 로컬로 실행됩니다. **광고도, 불필요한 기능도, 유료 전환 유도도 없습니다.**

[**↓ 최신 릴리스 설치**](#install) &nbsp;·&nbsp; [**웹사이트**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows 최초 실행](#windows-first-launch) · [macOS 최초 실행](#macos-first-launch) · [Linux 최초 실행](#linux-first-launch)

[![Discord 커뮤니티 참여](https://img.shields.io/badge/Discord%20%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0%20%EC%B0%B8%EC%97%AC-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="Arroxy 데모" width="720" />

<img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" width="720" />

Arroxy로 시간을 절약했다면 ⭐를 눌러 다른 사람도 찾을 수 있게 해 주세요.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-09-14._

> 🌐 이 번역은 AI의 도움으로 작성되었습니다. [영문 README](README.md)가 기준 문서입니다. 오류를 발견했다면 [PR을 열어 주세요](../../pulls).

---

## 목차

- [설치 및 최초 실행](#install)
  - [Windows 최초 실행](#windows-first-launch)
  - [macOS 최초 실행](#macos-first-launch)
  - [경고가 표시될 수 있는 이유](#why-warning)
  - [Linux 최초 실행](#linux-first-launch)
  - [다운로드 확인(SHA256)](#verify)
- [Arroxy를 선택하는 이유](#why)
- [기능](#features)
- [개인정보 보호](#privacy)
- [자주 묻는 질문](#faq)
- [로드맵](#roadmap)
- [Arroxy 후원](#support)
- [사용 기술](#tech)

---

## <a id="install"></a>설치 및 최초 실행

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Linux 스크립트는 공개된 `SHA256SUMS`와 다운로드를 대조하고 Arroxy를 애플리케이션 메뉴에 추가합니다. 빌드는 x86_64 전용입니다. `curl`이 없나요? `curl -fsSL`을 `wget -qO-`로 바꾸세요.

| 플랫폼 | 직접 다운로드 |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**모든 릴리스 파일 →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="windows-first-launch"></a>Windows 최초 실행

처음 실행할 때 **"Windows의 PC 보호"** 또는 **"알 수 없는 게시자"**가 표시될 수 있습니다. `Arroxy-win-x64-Setup.exe`와 `Arroxy-win-x64-Portable.exe` 모두 해당합니다. Arroxy는 무료 오픈 소스지만 Windows 빌드는 유료 인증서로 코드 서명되지 않았기 때문에 SmartScreen이 표시합니다. 이것만으로 Arroxy가 안전하지 않다는 뜻은 **아닙니다**. 계속하려면:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="추가 정보 링크가 강조된 Windows의 PC 보호 SmartScreen 대화 상자" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="추가 정보를 펼친 후 실행 버튼을 보여 주는 SmartScreen 대화 상자" />
</div>

1. **추가 정보**를 클릭합니다.
2. **실행**을 클릭합니다.

#### Windows Defender가 파일을 표시하거나 제거하는 경우

Defender 휴리스틱은 서명되지 않은 NSIS 설치 프로그램과 Electron 포터블을 의심스러운 것으로 표시할 때가 있습니다. Defender가 `Arroxy-win-x64-Setup.exe` 또는 `Arroxy-win-x64-Portable.exe`를 격리했다면 **Windows 보안 → 바이러스 및 위협 방지 → 보호 기록**에서 복원한 후 **설정 관리 → 제외 추가 또는 제거**에서 Arroxy 실행 파일을 허용 항목으로 추가하세요. SmartScreen과 마찬가지로 원인은 게시자 서명이 없기 때문이지 악성 코드가 감지되었기 때문이 아닙니다.

> 공식 GitHub Releases 페이지에서만 Arroxy를 다운로드하세요. 다른 웹사이트에서 받았거나 누군가가 보낸 파일이라면 삭제하고 공식 출처에서 새로 받으세요. 소스 코드는 공개되어 있으므로 직접 살펴보거나 Arroxy를 빌드할 수 있습니다.

Scoop을 선호하나요? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

### <a id="macos-first-launch"></a>macOS 최초 실행

Arroxy의 macOS 빌드는 임시 서명되었지만 Apple 공증을 받지 않아 Gatekeeper가 처음 실행할 때 *"Arroxy.app"이 열리지 않음 — Apple은 "Arroxy.app"에 악성 소프트웨어가 없는지 확인할 수 없음* 메시지로 차단합니다. macOS가 Apple을 통해 앱을 확인할 수 없다는 뜻이지 파일에 문제가 있다는 뜻이 아닙니다. Homebrew로 설치하면 이 대화 상자를 피할 수 있습니다. DMG를 사용했다면 Terminal 명령 한 세트로 해결됩니다:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. 마운트한 DMG에서 `Arroxy.app`을 `/Applications`로 드래그합니다.
2. Terminal을 열고 다음 두 명령을 실행합니다:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

첫 명령은 다운로드할 때 macOS가 붙인 격리 속성을 제거하고 두 번째 명령은 앱을 시작합니다. `/Applications`의 복사본은 사용자 소유이므로 보통 `sudo`가 필요하지 않습니다. 권한 오류가 있을 때만 추가하세요.

**Apple Silicon과 Intel:** M 시리즈 Mac(M1 / M2 / M3 / M4)에서는 `arm64` DMG를 다운로드하세요. Intel Mac에서는 `x64` DMG를 받으세요. 다른 빌드도 Rosetta로 실행되지만 눈에 띄게 느립니다.

> macOS 빌드는 Apple Silicon 및 Intel CI 실행기에서 제작됩니다. 문제가 있다면 [이슈를 열어 주세요](../../issues). macOS 사용자의 의견이 테스트 주기에 직접 반영됩니다.

### <a id="why-warning"></a>경고가 표시될 수 있는 이유

Arroxy는 오픈 소스이며 MIT 라이선스를 사용합니다. Windows와 macOS 빌드는 **코드 서명되지 않았습니다**. Apple Developer ID와 Windows EV 코드 서명 인증서는 각각 연간 수백 달러가 들며 독립 프로젝트가 직접 부담해야 합니다. 서명이 없으면 Windows SmartScreen과 macOS Gatekeeper가 처음 실행할 때 경고합니다. 경고는 *운영 체제가 게시자를 알지 못한다*는 뜻이지 Arroxy가 악성 코드라는 뜻이 아닙니다.

엄격한 순서로 Arroxy를 직접 확인하는 세 가지 방법:

- **소스를 읽으세요.** 모든 코드가 [GitHub](https://github.com/antonio-orionus/Arroxy)에 있고 [소스에서 빌드](#tech)할 수 있습니다.
- **SHA256을 확인하세요.** 파일을 공개된 [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS)와 대조하세요. 아래 [다운로드 확인](#verify)을 참고하세요.
- **외부 검사를 실행하세요.** 파일을 [VirusTotal](https://www.virustotal.com)에 업로드하세요.

### <a id="linux-first-launch"></a>Linux 최초 실행

AppImage는 설치 없이 바로 실행됩니다. 파일에 실행 권한만 부여하면 됩니다.

**파일 관리자:** `.AppImage`를 마우스 오른쪽 버튼으로 클릭 → **속성** → **권한** → **파일을 프로그램으로 실행 허용**을 켠 다음 두 번 클릭합니다.

**터미널:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

그래도 실행되지 않으면 마운트하지 않고 실행하세요. FUSE 패키지는 필요 없습니다:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**선택적 데스크톱 통합:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)를 한 번 설치하면 두 번 클릭한 AppImage가 실행기 메뉴에 자동 등록됩니다. `.desktop` 파일을 직접 만들 필요가 없습니다.

**일반 tar 압축 파일(FUSE 및 설치 불필요):**

`.tar.gz` 빌드는 AppImage 래퍼가 없는 동일한 앱입니다. 원하는 곳에 압축을 풀고 실행하세요. 설치 프로그램과 FUSE가 필요 없습니다.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Flatpak(샌드박스 대안):** 같은 릴리스 페이지에서 `Arroxy-linux-x64.flatpak`을 다운로드하세요.

Ubuntu는 Flatpak 대신 Snap을 기본 제공하므로 먼저 Flatpak을 설치하고 Flathub를 추가하세요. 번들이 그곳에서 런타임을 가져옵니다:

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

**릴리스 페이지의 Linux 다운로드는 x86_64 전용입니다.** ARM64 장치(Raspberry Pi, Asahi Linux)에서는 Flatpak이 설치되더라도 시작할 때 `bwrap: execvp ldconfig: Exec format error` 오류가 발생합니다.

<details>
<summary><strong><a id="verify"></a>다운로드 확인(SHA256)</strong></summary>

모든 릴리스는 바이너리와 함께 `SHA256SUMS` 파일을 게시합니다. 전송 중 파일이 손상되거나 변조되지 않았는지 확인하려면 로컬에서 해시를 계산해 `SHA256SUMS`의 해당 줄과 비교하세요. 최신 릴리스 페이지 → **Assets** → `SHA256SUMS`를 다운로드합니다.

**Windows(PowerShell 또는 명령 프롬프트):**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS(Terminal):**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux(Terminal):**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

외부 악성 코드 검사를 원하나요? 파일을 [VirusTotal](https://www.virustotal.com)에 업로드하세요. 서명되지 않은 Electron 앱에서 소규모 엔진 몇 개의 일반 휴리스틱 경고는 흔하지만, 주요 엔진이 광범위하게 감지한다면 실제로 우려할 만합니다.

</details>

<details>
<summary><strong>Windows: 설치형과 포터블</strong></summary>

|               | NSIS 설치 프로그램 | 포터블 `.exe` |
| ------------- | :----------------------: | :---------------------: |
| 설치 필요 | 예  | 아니요 — 어디서든 실행  |
| 자동 업데이트 | ✅ 앱에서 처리  | ❌ 수동 다운로드  |
| 시작 속도 | ✅ 더 빠름  | ⚠️ 첫 시작이 더 느림  |
| 시작 메뉴에 추가 |            ✅            |           ❌            |
| 간편한 제거 |            ✅            | ❌ 파일 삭제  |

**권장:** 자동 업데이트와 빠른 시작을 위해 NSIS 설치 프로그램을 사용하세요. 설치나 레지스트리 변경이 필요 없다면 포터블 `.exe`를 사용하세요.

</details>

---

## <a id="why"></a>Arroxy를 선택하는 이유

가장 흔한 대안과 항목별로 비교합니다:

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| 무료, 프리미엄 등급 없음 |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| 오픈 소스 |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| 로컬 처리만 사용 |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| 로그인이나 쿠키 내보내기 불필요 |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| 사용량 제한 없음 |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| 크로스 플랫폼 데스크톱 앱 |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| 자막 + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy는 한 가지 목적을 위해 만들어졌습니다. URL을 붙여 넣으면 깔끔한 로컬 파일을 얻습니다. 계정, 유료 전환 유도, 데이터 수집이 없습니다.

---

## <a id="features"></a>기능

### 화질 및 형식

- 최대 **4K UHD(2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **높은 프레임 속도**를 그대로 보존 — 60 fps, 120 fps, HDR
- **오디오** — 오디오만 MP3, M4A/AAC, Opus 또는 WAV로 내보냅니다. 대화형 다운로드에서는 소스가 제공하는 네이티브 서라운드/Dolby 트랙(AC-3, E-AC-3, 5.1, DRC)을 선택하거나 전역 기본값으로 **서라운드 / Dolby 우선**을 설정할 수 있습니다
- 빠른 프리셋: *최고 화질* · *균형* · *작은 파일*

### 개인정보 보호 및 제어

- 100% 로컬 처리 — YouTube에서 사용자의 디스크로 바로 다운로드
- **오픈 소스** — 모든 코드를 감사할 수 있으며 MIT 라이선스 적용
- 선택한 폴더에 파일을 바로 저장

### 워크플로

- **전역 다운로드 단축키** — 어느 앱에서든 링크를 복사하고 `Ctrl+Shift+D`(macOS에서는 `Cmd+Shift+D`)를 누르면, 창을 열지 않고 활성 프로필로 대기열에 추가되며 알림으로 확인됩니다. 기본 활성화되며 키를 변경할 수 있습니다
- **유연한 시작 모드** — 안내식 단일 다운로드, 재생목록/채널 선택기, URL 일괄 붙여넣기 또는 저장된 기본값을 사용하는 빠른 다운로드 중에서 선택
- **중앙 다운로드 대기열** — 단일, 재생목록, 일괄, 빠른 작업을 한곳에서 진행률 확인, 일시 중지, 재개, 취소, 재시도 및 우선순위 조정
- **클립보드 감시** — YouTube 링크를 복사하고 앱으로 돌아오면 Arroxy가 URL을 자동으로 입력합니다(고급 설정에서 전환)
- **URL 자동 정리** — 추적 매개변수(`si`, `pp`, `utm_*`, `fbclid`, `gclid`)를 제거하고 `youtube.com/redirect` 링크를 해제
- **트레이 모드** — 창을 닫아도 다운로드가 백그라운드에서 계속 실행
- **30개 언어** — 시스템 언어를 자동 감지하며 언제든 변경 가능
- **재생목록 동기화** — 재생목록을 로컬 폴더와 다시 비교해 이미 받은 동영상을 건너뛰고, 동영상이 내려받아질 때마다 갱신되는 `.m3u` 재생목록 파일을 생성
- **속도 및 간격 제어** — 다운로드 대역폭과 동시에 받는 동영상 조각 수를 제한하고, 요청 지연을 프리셋(*끄기 · 균형 · 주의 · 사용자 지정*)으로 설정
- **파일 이름 템플릿** — `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}`, `{playlist_index}`로 전역 또는 프로필별 이름 지정
- **동시 다운로드 및 자동 재시도** — 동시에 실행할 대기열 작업 수를 정하고, 네트워크나 서버 문제를 만난 다운로드를 매번 더 오래 기다린 뒤 Arroxy가 다시 시도
- **재생목록 항목별 프로필** — 목록 전체에 하나의 설정을 쓰는 대신 각 동영상에 개별 프로필을 지정하여, 한 번에 일부는 최고 화질로 보관하고 나머지는 MP3로 저장

### 자막 및 후처리

- SRT, VTT 또는 ASS **자막** — 수동 또는 자동 생성, 제공되는 모든 언어
- 동영상 옆에 저장하거나 `.mkv`에 삽입하거나 `Subtitles/` 하위 폴더에 정리
- **SponsorBlock** — 스폰서, 인트로, 아웃트로, 자체 홍보를 건너뛰거나 챕터로 표시
- **삽입 메타데이터** — 제목, 업로드 날짜, 채널, 설명, 썸네일 및 챕터 표시를 파일에 기록

### YouTube + 2000개 사이트

- **완전한 YouTube 지원** — 동영상, Shorts, 채널, 재생목록, YouTube Music 및 팟캐스트를 최우선 소스로 처리
- yt-dlp를 통한 **2000개 이상의 기타 사이트** — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org 등
- **오디오 전용 및 자막**은 YouTube뿐 아니라 지원되는 모든 사이트에서 작동
- 사이트가 변경되면 yt-dlp가 매주 수정 사항을 제공하고 Arroxy가 시작할 때 바이너리를 자동 업데이트

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Arroxy 전역 다운로드 단축키 — Windows와 Linux의 Ctrl+Shift+D, macOS의 Cmd+Shift+D로 복사한 링크를 다운로드 대기열에 바로 전송" width="760" /></picture><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>전역 다운로드 단축키</b><br/>어디서든 링크를 복사하고 한 번 누르면 대기열에 들어가 다운로드 시작</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>재생목록 항목별 프로필</b><br/>각 동영상에 개별 프로필을 지정해 일부는 4K로, 나머지는 MP3로 저장</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>빠른 다운로드 홈</b><br/>URL을 붙여 넣고 활성 프로필로 즉시 다운로드</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>재사용 가능한 다운로드 프로필</b><br/>형식, 화질, 출력 프리셋을 저장해 다운로드마다 재사용</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>다국어 오디오 트랙</b><br/>동영상에 포함된 정확한 오디오 언어 선택</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>서라운드 / Dolby 오디오</b><br/>5.1 및 Dolby 트랙을 감지하고 보존</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>URL 일괄 모드</b><br/>목록을 붙여 넣고 중복을 자동 제거한 뒤 모두 대기열에 추가</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>병렬 다운로드 대기열</b><br/>실시간 진행률과 함께 여러 다운로드를 동시에 실행</sub></td>
  </tr>
</table>

---

## <a id="privacy"></a>개인정보 보호

[yt-dlp](https://github.com/yt-dlp/yt-dlp)가 YouTube에서 선택한 폴더로 파일을 직접 가져오며 외부 서버를 거치지 않습니다. 시청 기록, 다운로드 기록, URL, 파일 내용은 장치에 남습니다.

Arroxy는 [OpenPanel](https://openpanel.dev)을 통해 익명의 집계 텔레메트리를 보냅니다. 독립 프로젝트가 오류, 충돌, 피드백, OS 및 앱 버전을 파악하는 데 필요한 정도뿐입니다. URL, 동영상 제목, 파일 경로, 계정 정보, 지문 또는 개인 데이터는 포함하지 않습니다. 설치별 ID는 무작위이며 신원과 연결되지 않습니다. 설정에서 거부할 수 있습니다.

---

## <a id="faq"></a>자주 묻는 질문

**정말 무료인가요?**
예. MIT 라이선스이며 프리미엄 등급이나 기능 제한이 없습니다.

**어떤 동영상 화질을 다운로드할 수 있나요?**
YouTube가 제공하는 모든 화질: 4K UHD(2160p), 1440p, 1080p, 720p, 480p, 360p 및 오디오 전용. 60 fps, 120 fps, HDR 스트림을 그대로 보존합니다.

**오디오만 MP3로 추출할 수 있나요?**
예. 형식 메뉴에서 *오디오 전용*을 선택하고 MP3, M4A/AAC, Opus 또는 WAV를 고르세요.

**YouTube 계정이나 쿠키가 필요한가요?**
기본적으로 필요 없습니다. Arroxy는 YouTube 계정, 로그인 또는 쿠키 내보내기 없이 작동합니다. 연령 제한이나 회원 전용 동영상처럼 인증이 필요한 콘텐츠에는 고급 설정에서 선택적 쿠키 지원(쿠키 소스: 파일 또는 브라우저)을 사용할 수 있으며 기본값은 꺼짐입니다. 이를 켜면 yt-dlp 위키가 [쿠키 기반 자동화로 Google 계정이 표시될 수 있음](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)을 안내하므로, 이 경우 임시 계정이 더 안전합니다.

**YouTube가 변경되어도 계속 작동하나요?**
yt-dlp는 시작할 때 자동 업데이트되고 YouTube 변경 시 Arroxy가 신속하게 수정 사항을 배포합니다. 문제가 발생하면 고급 설정의 선택적 쿠키 지원을 대안으로 사용할 수 있습니다.

**Arroxy는 어떤 언어를 지원하나요?**
설치 즉시 30개 언어를 사용할 수 있습니다: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy는 처음 실행할 때 운영 체제 언어를 자동 감지하며 도구 모음의 언어 선택기에서 언제든 변경할 수 있습니다. 런타임 로캘 JSON은 src/shared/i18n/locales/에, 번역자용 PO 카탈로그는 i18n/locales/에 있습니다. 기여하려면 GitHub에서 PR을 열어 주세요.

**다른 것을 설치해야 하나요?**
아니요. yt-dlp는 처음 실행할 때 자동으로 다운로드되어 컴퓨터에 캐시되고 ffmpeg와 ffprobe는 앱에 포함됩니다. 그 뒤에는 추가 설정이 필요 없습니다.

**재생목록이나 채널 전체를 다운로드할 수 있나요?**
둘 다 가능합니다. 재생목록 또는 채널 URL(예: `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`)을 붙여 넣고 검색할 항목 수를 선택한 뒤 전체 목록을 대기열에 넣거나 특정 동영상만 선택하세요. 날짜 범위 필터는 곧 추가됩니다.

**macOS에서 "앱이 손상되었습니다"라고 합니다. 어떻게 하나요?**
실제 손상이 아니라 macOS Gatekeeper가 서명되지 않은 앱을 차단하는 것입니다. 격리를 지우고 Arroxy를 여는 Terminal 명령은 [macOS 최초 실행](#macos-first-launch)을 참고하세요.

**YouTube 동영상을 다운로드하는 것은 합법인가요?**
개인적이고 비공개인 용도는 대부분의 관할권에서 일반적으로 허용됩니다. YouTube [서비스 약관](https://www.youtube.com/t/terms)과 현지 저작권법을 준수할 책임은 사용자에게 있습니다.

---

## <a id="roadmap"></a>로드맵

아직 계획 중인 기능 — 대략적인 우선순위 순서:

| 기능    | 설명    |
| ---------------- | ---------------- |
| **재생목록 및 채널 필터** | 재생목록이나 채널을 나열할 때 날짜 범위로 필터링 |
| **YouTube 오디오 트랙 환경설정** | YouTube가 여러 오디오 트랙을 제공할 때 프로필별 재정의와 함께 앱 전체의 음성 언어 선호도 설정 |
| **앱 내 브라우저 로그인** | Arroxy 안에서 브라우저 창을 열어 수동으로 내보내지 않고 로그인 및 사이트 쿠키 사용 |
| **한 번 클릭 동영상 다운로드** | 감지하거나 붙여 넣은 URL을 활성 프로필로 한 번에 다운로드 시작 |
| **더 강력한 재시도 복구** | 불안정하거나 문제가 있는 인터넷 연결로 중단된 다운로드를 위한 새 재시도 경로 |
| **전체 다운로드 관리자 패널** | 대기 중인 항목의 대상 폴더 변경을 포함해 대기열 패널을 더 완전한 관리자로 확장 |
| **예약 다운로드** | 정해진 시간에 대기열 시작(야간 실행 등) |
| **클립 자르기** | 시작/종료 시간으로 지정한 구간만 다운로드 |

원하는 기능이 있나요? [요청을 열어 주세요](../../issues). 커뮤니티 의견이 우선순위를 정합니다.

---

## <a id="support"></a>Arroxy 후원

Arroxy는 무료이며 MIT 라이선스를 사용합니다. 광고나 유료 등급이 없습니다. 시간을 절약해 주었다면 Bitcoin 또는 Tron으로 개발을 후원할 수 있습니다. 주소는 유일한 공식 출처인 [DONATE.md](DONATE.md)에 있습니다. Arroxy는 이메일이나 개인 메시지로 주소를 보내지 않습니다. 저장소에 별을 주고, 버그를 신고하고, 번역을 개선하는 것도 같은 만큼 도움이 됩니다.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a>

---

## <a id="tech"></a>사용 기술

<details>
<summary><strong>기술 스택</strong></summary>

- **Electron** — 크로스 플랫폼 데스크톱 셸
- **React 19** + **TypeScript** — 사용자 인터페이스
- **Tailwind CSS v4** — 스타일링
- **Zustand** — 상태 관리
- **yt-dlp** + **ffmpeg** — 다운로드 및 mux 엔진(yt-dlp는 실행 중 가져오며 ffmpeg/ffprobe는 빌드할 때 포함)
- **Vite** + **electron-vite** — 빌드 도구
- **Vitest** + **Playwright** — 단위 및 엔드투엔드 테스트

</details>

<details>
<summary><strong>소스에서 빌드</strong></summary>

### 필수 항목 — 모든 플랫폼

| 도구 | 버전 | 설치 |
| ---- | ---- | ---- |
| Git | 무관 | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | `mise install` 또는 `.node-version` |
| Bun | 1.2.23 | `mise install` 또는 `package.json`의 `packageManager` |

권장: `mise`를 설치한 다음 checkout에서 `mise install`을 실행하세요. mise를 사용하지 않는다면 `bun run bootstrap` 전에 `.node-version`의 Node.js와 `package.json`의 Bun을 직접 활성화하세요.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

네이티브 의존성을 다시 빌드하려면 Visual Studio Build Tools와 Python이 필요할 수 있습니다.

### macOS

```bash
brew install mise
xcode-select --install
```

clone한 후 checkout에서 `mise trust && mise install`을 실행하세요. 셸에서 이미 `fnm`, `nvm` 또는 Homebrew Bun을 사용한다면 Arroxy가 Node.js 24.16.0과 Bun 1.2.23을 사용하도록 `~/.zshrc`에서 mise를 활성화하세요:

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

# 빌드 및 Electron 런타임 의존성
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E 테스트 전용(Electron에는 디스플레이가 필요함)
sudo apt install -y xvfb
```

### Clone 및 실행

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # 권장; 고정된 도구 버전을 직접 활성화했다면 생략
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer를 사용하는 Electron 앱
```

### 배포용 패키지 빌드

```bash
bun run build        # 타입 검사 + 컴파일
bun run dist         # 현재 운영 체제용 패키지
bun run dist:win     # 지원되는 호스트에서 Windows 대상 패키지
```

> `bun run bootstrap`은 의존성을 설치하고 Electron 앱 의존성을 다시 빌드하며 Electron을 확인합니다. 또한 개발용 내장 ffmpeg/ffprobe를 준비하고 Playwright Chromium을 설치합니다. yt-dlp는 실행 중 앱 데이터 폴더에서 관리되며 ffmpeg와 ffprobe는 모든 Arroxy 릴리스에 포함됩니다.

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

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

---

## 이용 약관

Arroxy는 개인적이고 비공개인 용도로만 사용하는 도구입니다. 다운로드가 YouTube [서비스 약관](https://www.youtube.com/t/terms)과 사용자의 관할권에 적용되는 저작권법을 준수하는지 확인할 책임은 전적으로 사용자에게 있습니다. 사용 권한이 없는 콘텐츠를 다운로드, 복제 또는 배포하는 데 Arroxy를 사용하지 마세요. 개발자는 오용에 책임지지 않습니다.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT 라이선스 · <a href="https://x.com/OrionusAI">@OrionusAI</a>가 정성껏 제작</sub>
</div>
