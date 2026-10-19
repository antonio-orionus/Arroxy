const TECH_CONTENT = `<details>
<summary><strong>기술 스택</strong></summary>

- **Electron** — 크로스 플랫폼 데스크톱 셸
- **React 19** + **TypeScript** — 사용자 인터페이스
- **Tailwind CSS v4** — 스타일링
- **Zustand** — 상태 관리
- **yt-dlp** + **ffmpeg** — 다운로드 및 mux 엔진(둘 다 실행 중 가져오며, yt-dlp는 최신 상태로 유지하고 ffmpeg/ffprobe는 한 번 설치해 업데이트 후에도 유지)
- **Vite** + **electron-vite** — 빌드 도구
- **Vitest** + **Playwright** — 단위 및 엔드투엔드 테스트

</details>

<details>
<summary><strong>소스에서 빌드</strong></summary>

### 필수 항목 — 모든 플랫폼

| 도구 | 버전 | 설치 |
| ---- | ---- | ---- |
| Git | 무관 | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` 또는 \`.node-version\` |
| Bun | 1.4.2 | \`mise install\` 또는 \`package.json\`의 \`packageManager\` |

권장: \`mise\`를 설치한 다음 checkout에서 \`mise install\`을 실행하세요. mise를 사용하지 않는다면 \`bun run bootstrap\` 전에 \`.node-version\`의 Node.js와 \`package.json\`의 Bun을 직접 활성화하세요.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

네이티브 의존성을 다시 빌드하려면 Visual Studio Build Tools와 Python이 필요할 수 있습니다.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

clone한 후 checkout에서 \`mise trust && mise install\`을 실행하세요. 셸에서 이미 \`fnm\`, \`nvm\` 또는 Homebrew Bun을 사용한다면 Arroxy가 Node.js 24.21.0과 Bun 1.4.2을 사용하도록 \`~/.zshrc\`에서 mise를 활성화하세요:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# 빌드 및 Electron 런타임 의존성
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# E2E 테스트 전용(Electron에는 디스플레이가 필요함)
sudo apt install -y xvfb
\`\`\`

### Clone 및 실행

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # 권장; 고정된 도구 버전을 직접 활성화했다면 생략
bun run bootstrap
bun run doctor
bun run dev            # Vite renderer를 사용하는 Electron 앱
\`\`\`

### 배포용 패키지 빌드

\`\`\`bash
bun run build        # 타입 검사 + 컴파일
bun run dist         # 현재 운영 체제용 패키지
bun run dist:win     # 지원되는 호스트에서 Windows 대상 패키지
\`\`\`

> \`bun run bootstrap\`은 의존성을 설치하고 Electron 앱 의존성을 다시 빌드하며 Electron을 확인합니다. 또한 개발용 내장 ffmpeg/ffprobe를 준비하고 Playwright Chromium을 설치합니다. 릴리스 빌드는 yt-dlp, ffmpeg, ffprobe를 실행 중 앱 데이터 폴더에서 관리하며, 어느 것도 설치 프로그램에 포함되지 않습니다.

</details>`;

export const ko = {
  icon_alt: "Arroxy 마스코트",
  title: "Arroxy — 브라우저가 내장된 Windows, macOS, Linux용 무료 오픈 소스 YouTube(+ 2000개 사이트) 다운로더",
  read_in_label: "다른 언어로 읽기:",
  badge_release_alt: "릴리스",
  badge_build_alt: "빌드",
  badge_license_alt: "라이선스",
  badge_platforms_alt: "플랫폼",
  badge_i18n_alt: "언어",
  badge_website_alt: "웹사이트",
  discord_badge_text: "Discord 커뮤니티 참여",
  discord_badge_encoded: "Discord%20%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0%20%EC%B0%B8%EC%97%AC",
  hero_desc: "**YouTube 및 지원되는 2000개 이상의 사이트**에서 동영상, Shorts, 음악, 채널, 팟캐스트 또는 오디오 트랙을 다운로드하세요. 60 fps 8K HDR까지, MP3 / AAC / Opus로, 또는 필요한 부분만 저장할 수 있습니다. Explore 탭에서 **Arroxy 안에서 YouTube나 다른 사이트를 둘러보고** 보고 있는 동영상, 재생목록 또는 채널을 다운로드하세요. 그곳에서 로그인하면 계정으로 볼 수 있는 비공개, 멤버 전용, 연령 제한 동영상도 다운로드할 수 있습니다. Windows, macOS, Linux에서 로컬로 실행됩니다. **광고도, 불필요한 기능도, 유료 전환 유도도 없습니다.**",
  cta_latest: "↓ 최신 릴리스 설치",
  cta_website: "웹사이트",
  star_cta: "Arroxy로 시간을 절약했다면 ⭐를 눌러 다른 사람도 찾을 수 있게 해 주세요.",
  ai_notice: "> 🌐 이 번역은 AI의 도움으로 작성되었습니다. [영문 README](README.md)가 기준 문서입니다. 오류를 발견했다면 [PR을 열어 주세요](../../pulls).",
  toc_heading: "목차",
  why_h2: "Arroxy를 선택하는 이유",
  features_h2: "기능",
  dl_h2: "설치 및 최초 실행",
  privacy_h2: "개인정보 보호",
  faq_h2: "자주 묻는 질문",
  roadmap_h2: "로드맵",
  tech_h2: "사용 기술",
  why_intro: "가장 흔한 대안과 항목별로 비교합니다:",
  why_r1: "무료, 프리미엄 등급 없음",
  why_r2: "오픈 소스",
  why_r3: "로컬 처리만 사용",
  why_r5: "사용량 제한 없음",
  why_r6: "크로스 플랫폼 데스크톱 앱",
  why_r7: "자막 + SponsorBlock",
  why_r8: "내장 브라우저(탐색, 로그인, 다운로드)",
  why_r9: "쿠키를 내보내지 않고 비공개·멤버 전용·연령 제한 동영상 다운로드",
  why_table_note:
    "⚠️ = 일부만 지원하거나 유료 등급에서만 지원. 4K Video Downloader에서 비공개 동영상용 앱 내 로그인은 유료 기능이며, 대부분의 무료 yt-dlp GUI는 쿠키 파일만 받거나 웹 브라우저의 쿠키를 읽습니다.",
  why_summary:
    "Arroxy는 한 가지 목적을 위해 만들어졌습니다. URL을 붙여 넣든 Explore에서 영상을 찾든, 깔끔한 로컬 파일을 얻는 것입니다. 유료 전환 유도, 데이터 수집이 없습니다.",
  why_explore_h3: "단순한 yt-dlp 래퍼로는 할 수 없는 것: Explore 탭",
  why_explore_intro:
    "대부분의 무료 YouTube 다운로더는 yt-dlp 위에 URL 입력창을 얹은 것입니다. Arroxy도 yt-dlp를 사용하지만, 앱에 내장된 브라우저인 **Explore**도 갖추고 있으며, YouTube든 다른 사이트든 열 수 있습니다. Explore는 URL 입력창만으로는 넘을 수 없는 제한을 넘어섭니다:",
  why_explore_1:
    "**계정이 필요한 동영상을 쿠키 내보내기 없이** — 비공개·멤버 전용 동영상, 연령 제한 동영상(연령 인증을 마친 계정), 나중에 볼 동영상과 좋아요 표시한 동영상 목록, 다른 사이트의 로그인이 필요한 동영상까지. 단순한 래퍼는 cookies.txt를 내보내거나 웹 브라우저의 쿠키를 읽어야 하는데, Windows의 Chrome은 이제 이를 차단합니다. Arroxy에서는 Explore에서 한 번 로그인하면 나머지는 알아서 처리합니다",
  why_explore_2:
    "**\"로그인하여 봇이 아님을 확인하세요\"** — YouTube가 이렇게 요구하면 Arroxy는 실패로 끝내지 않고 Explore 로그인으로 다운로드를 다시 시도합니다",
  why_explore_3:
    "**YouTube의 다운로드 토큰** — Arroxy의 내장 브라우저는 다운로드 전에 YouTube가 요구하는 토큰을 받아 옵니다. 토큰이 없으면 YouTube가 더 적은 형식과 요청보다 낮은 화질을 제공할 수 있습니다",
  why_explore_4:
    "**링크 복사 불필요** — Explore에서 동영상, 재생목록 또는 채널을 찾아 클릭 한 번으로 다운로드하거나, 페이지의 아무 링크나 우클릭하세요",
  why_explore_5: "**원할 때 켜는 광고 차단** — 방패를 한 번 클릭하면 Explore 페이지의 광고와 트래커를 차단합니다",
  feat_explore_h3: "Explore: Arroxy 안에서 웹 탐색",
  feat_explore_1:
    "**Explore 탭** — Arroxy 안에서 YouTube나 다른 사이트를 둘러보고, 링크를 복사하지 않고도 찾은 영상을 바로 다운로드합니다. **다운로드 · *내 프로필*** 은 보고 있는 동영상, 재생목록 또는 채널을 대기열에 추가하고, 옆의 화살표로 프로필을 바꾸며, 마법봉은 형식·자막 등을 고르는 단계별 다운로드를 엽니다",
  feat_explore_6: "**우클릭으로 다운로드** — Explore에서 동영상, 재생목록, 채널 링크를 우클릭하면 내 프로필로 다운로드하거나, **프로필로 다운로드**에서 다른 프로필을 고르거나, 단계별 다운로드를 열거나, 링크를 복사할 수 있습니다. 영상을 하나씩 열 필요가 없습니다",
  feat_explore_7: "**컴팩트 레이아웃** — Explore 도구 모음에서 한 번 클릭하면 Arroxy의 탭이 그 안으로 옮겨져 페이지 공간이 넓어집니다",
  feat_explore_2:
    "**주소창** — 입력해서 YouTube를 검색하거나, 웹 주소를 입력해 해당 사이트를 엽니다",
  feat_explore_3:
    "**계정이 필요한 다운로드** — Explore에서 한 번 로그인하면 Arroxy가 계정으로 볼 수 있는 비공개·멤버 전용 동영상, 연령 인증을 마친 계정의 연령 제한 동영상, 나중에 볼 동영상과 좋아요 표시한 동영상 목록까지 다운로드할 수 있습니다. 다른 사이트도 그곳에서 로그인할 수 있으며, 해당 사이트의 다운로드는 필요할 때 그 로그인을 사용합니다. Arroxy는 먼저 로그아웃 상태로 다운로드하며, 계정으로 해결할 수 있는 이유로 다운로드가 실패할 때만 Explore 로그인을 사용합니다. YouTube가 봇이 아닌지 확인을 요구할 때도 Arroxy는 Explore 로그인을 시도합니다",
  feat_explore_4:
    "**보조 계정을 사용하세요** — Explore 첫 화면에서 이유를 설명합니다. 계정으로 다운로드하면 해당 계정이 제한될 위험이 어느 정도 있습니다. 로그인 정보를 지우고 싶다면 언제든 설정에서 Explore 로그아웃을 하세요",
  feat_explore_5:
    "**광고 차단** — 기본으로 꺼져 있습니다. Explore 도구 모음의 방패를 한 번 클릭하면 Explore 페이지의 광고와 트래커를 차단하며 다운로드에는 영향이 없습니다. 로그인한 계정에는 YouTube가 광고 차단에 대응할 수 있습니다",
  feat_quality_h3: "화질 및 형식",
  feat_quality_1: "최대 **8K(4320p)**, 4K UHD(2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**높은 프레임 속도와 HDR**을 그대로 보존 — 60 fps, HDR10",
  feat_quality_3: "**오디오** — 오디오만 MP3, M4A/AAC, Opus 또는 WAV로 내보냅니다. 대화형 다운로드에서는 소스가 제공하는 네이티브 서라운드/Dolby 트랙(AC-3, E-AC-3, 5.1, DRC)을 선택하거나 전역 기본값으로 **서라운드 / Dolby 우선**을 설정할 수 있습니다",
  feat_quality_4: "**목표별 프로필** — *최고 화질*(AV1 · VP9) 또는 *스마트 TV*(MP4 · H.264)를 자동, MP4, MKV, WebM으로 재인코딩 없이 저장합니다. HDR은 *자동*(화면이 표시할 수 있을 때만), *SDR*, *HDR* 중에서 고릅니다",
  feat_quality_5:
    "**모든 해상도에서 모든 코덱** — 단계별 다운로드는 해상도마다 AV1, VP9, H.264를 나란히 보여 주므로 TV나 편집 프로그램에서 재생되는 것을 고를 수 있습니다",
  feat_quality_6:
    "**스트림의 실체를 파악** — YouTube가 AI로 업스케일한 크기, AI 더빙 오디오 언어, 향상된 비트레이트 스트림, 360° 동영상, 손상되었거나 워터마크가 있는 사본이 표시됩니다. 프로필은 허용하지 않는 한 AI 업스케일 스트림을 건너뜁니다",
  feat_privacy_h3: "개인정보 보호 및 제어",
  feat_privacy_1: "100% 로컬 처리 — YouTube에서 사용자의 디스크로 바로 다운로드",
  feat_privacy_2: "**오픈 소스** — 모든 코드를 감사할 수 있으며 MIT 라이선스 적용",
  feat_privacy_3: "선택한 폴더에 파일을 바로 저장",
  feat_workflow_h3: "워크플로",
  feat_workflow_12: "**전역 다운로드 단축키** — 어느 앱에서든 링크를 복사하고 `Ctrl+Shift+D`(macOS에서는 `Cmd+Shift+D`)를 누르면, 창을 열지 않고 활성 프로필로 대기열에 추가되며 알림으로 확인됩니다. 기본 활성화되며 키를 변경할 수 있습니다",
  feat_workflow_1:
    "**유연한 시작 모드** — 안내식 단일 다운로드, 재생목록/채널 선택기, URL 일괄 붙여넣기, 저장된 기본값을 사용하는 빠른 다운로드 또는 Explore에서 탐색하며 다운로드 중에서 선택",
  feat_workflow_2: "**중앙 다운로드 대기열** — 단일, 재생목록, 일괄, 빠른 작업을 한곳에서 진행률 확인, 일시 중지, 재개, 취소, 재시도 및 우선순위 조정",
  feat_workflow_3: "**클립보드 감시** — 동영상 링크를 복사하면 Arroxy로 돌아왔을 때 URL 입력란이 채워지며, 원하지 않았다면 **실행 취소**할 수 있습니다. Arroxy가 작업 중이면 URL 탭으로 돌아올 때까지 링크가 기다립니다(설정에서 끌 수 있음)",
  feat_workflow_4: "**URL 자동 정리** — 추적 매개변수(`si`, `pp`, `utm_*`, `fbclid`, `gclid`)를 제거하고 `youtube.com/redirect` 링크를 해제",
  feat_workflow_5: "**트레이 모드** — 창을 닫아도 다운로드가 백그라운드에서 계속 실행",
  feat_workflow_6: "**{{LANG_COUNT}}개 언어** — 시스템 언어를 자동 감지하며 언제든 변경 가능",
  feat_workflow_7: "**재생목록 동기화** — 재생목록을 로컬 폴더와 다시 비교해 이미 받은 동영상을 건너뛰고, 동영상이 내려받아질 때마다 갱신되는 `.m3u` 재생목록 파일을 생성",
  feat_workflow_8: "**속도 및 간격 제어** — 다운로드 대역폭과 동시에 받는 동영상 조각 수를 제한하고, 요청 지연을 프리셋(*끄기 · 균형 · 주의 · 사용자 지정*)으로 설정",
  feat_workflow_9: "**파일 이름 템플릿** — `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}`, `{playlist_index}`로 전역 또는 프로필별 이름 지정",
  feat_workflow_10: "**동시 다운로드 및 자동 재시도** — 동시에 실행할 대기열 작업 수를 정하고, 네트워크나 서버 문제를 만난 다운로드를 매번 더 오래 기다린 뒤 Arroxy가 다시 시도",
  feat_workflow_11: "**재생목록 항목별 프로필** — 목록 전체에 하나의 설정을 쓰는 대신 각 동영상에 개별 프로필을 지정하여, 한 번에 일부는 최고 화질로 보관하고 나머지는 MP3로 저장",
  feat_workflow_13:
    "**빠른 다운로드는 백그라운드에서 동작** — 링크가 곧바로 다운로드 탭에 나타나 거기서 준비되고, **보기**가 있는 알림이 확인해 주며, URL 입력란은 다음 링크를 위해 비워집니다. 앞선 항목이 준비되는 동안에도 원하는 만큼 시작할 수 있습니다",
  feat_workflow_14:
    "**다운로드 탭이 도움이 필요한 항목을 알려 줍니다** — Arroxy가 링크를 읽을 수 없으면 해당 행에 이유와 해결 방법(다시 시도, 쿠키 켜기, Explore에서 로그인)이 표시됩니다. 쿠키가 꺼져 있다면 로그인한 뒤 **Explore로 로그인**이 대신 다시 시도합니다. 불러오기 한도를 넘는 재생목록은 행에서 전체, 처음 몇 개, 검토 중 선택을 기다립니다. 다운로드 탭에는 사용자를 기다리는 행의 수가 표시됩니다",
  feat_workflow_15:
    "**동영상의 일부만 다운로드** — 형식 화면에서 시작과 종료 또는 챕터를 고르면 Arroxy가 해당 구간만 저장하며, 파일 이름에는 동영상 ID 뒤에 구간이 붙습니다. 자르기는 가장 가까운 키프레임에서 이루어지며, 정확한 자르기를 켜면 대신 재인코딩합니다",
  feat_workflow_16:
    "**완료된 다운로드 자동 제거** — 선택 사항: 완료된 다운로드는 5초 뒤 목록에서 사라집니다. 파일은 디스크에 남고, 실패한 다운로드는 목록에 그대로 있습니다",
  feat_workflow_17:
    "**다운로드의 크기와 누락됨** — 정렬할 수 있는 **크기** 열에서 각 다운로드가 차지하는 공간을 확인하고, **누락됨**은 Arroxy 밖에서 이동되거나 삭제된 파일을 표시합니다",
  feat_workflow_18:
    "**오로라 또는 미니멀, 다크 또는 라이트** — 움직이는 하늘 위의 유리 패널 또는 차분한 단색 표면, 하단에서 전환합니다. 그래픽 가속이 없는 컴퓨터는 자동으로 미니멀이 적용됩니다",
  feat_workflow_19:
    "**Mac 메뉴 막대** — macOS에서는 메뉴 막대에서 설정(`Cmd+,`)을 열고, 다운로드 속도 제한을 지정하고, 스타일과 테마를 바꾸고, 로그를 열거나 진단 파일을 저장할 수 있습니다",
  feat_workflow_20:
    "**어느 다운로드에서든 프로필 변경** — 다운로드를 조정한 뒤 시작한 프로필을 업데이트하거나(변경 내용 미리 보기 제공) 설정을 새 프로필로 저장합니다. 프로필을 바꾸면 편집 내용을 유지할지 묻습니다",
  feat_post_h3: "자막 및 후처리",
  feat_post_1: "SRT, VTT 또는 ASS **자막** — 수동 또는 자동 생성, 제공되는 모든 언어",
  feat_post_2: "동영상 옆에 저장하거나 `.mkv`에 삽입하거나 `Subtitles/` 하위 폴더에 정리",
  feat_post_3: "**SponsorBlock** — 스폰서, 인트로, 아웃트로, 자체 홍보를 건너뛰거나 챕터로 표시",
  feat_post_4: "**삽입 메타데이터** — 제목, 업로드 날짜, 채널, 설명, 썸네일 및 챕터 표시를 파일에 기록",
  feat_post_5: "**자막 전용 일괄 처리** — URL 목록을 붙여넣거나 재생목록을 열고 자막을 선택하면 각 동영상의 자막 파일만 받습니다",
  feat_sites_h3: "YouTube + 2000개 사이트",
  feat_sites_1: "**완전한 YouTube 지원** — 동영상, Shorts, 채널, 재생목록, YouTube Music 및 팟캐스트를 최우선 소스로 처리",
  feat_sites_2: "yt-dlp를 통한 **2000개 이상의 기타 사이트** — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable 등",
  feat_sites_3: "**오디오 전용 및 자막**은 YouTube뿐 아니라 지원되는 모든 사이트에서 작동",
  feat_sites_4: "사이트가 변경되면 yt-dlp가 매주 수정 사항을 제공하고 Arroxy가 시작할 때 바이너리를 자동 업데이트",
  shot1_cap: "<b>빠른 다운로드 홈</b><br/>URL을 붙여 넣고 활성 프로필로 즉시 다운로드",
  shot2_cap: "<b>재사용 가능한 다운로드 프로필</b><br/>형식, 화질, 출력 프리셋을 저장해 다운로드마다 재사용",
  shot3_cap: "<b>다국어 오디오 트랙</b><br/>동영상에 포함된 정확한 오디오 언어 선택",
  shot4_cap: "<b>서라운드 / Dolby 오디오</b><br/>5.1 및 Dolby 트랙을 감지하고 보존",
  shot5_cap: "<b>URL 일괄 모드</b><br/>목록을 붙여 넣고 중복을 자동 제거한 뒤 모두 대기열에 추가",
  shot6_cap: "<b>병렬 다운로드 대기열</b><br/>실시간 진행률과 함께 여러 다운로드를 동시에 실행",
  hotkey_fig_alt: "Arroxy 전역 다운로드 단축키 — Windows와 Linux의 Ctrl+Shift+D, macOS의 Cmd+Shift+D로 복사한 링크를 다운로드 대기열에 바로 전송",
  hotkey_fig_cap: "<b>전역 다운로드 단축키</b><br/>어디서든 링크를 복사하고 한 번 누르면 대기열에 들어가 다운로드 시작",
  shot7_cap: "<b>재생목록 항목별 프로필</b><br/>각 동영상에 개별 프로필을 지정해 일부는 4K로, 나머지는 MP3로 저장",
  shot8_cap:
    "<b>Explore</b><br/>Arroxy 안에서 YouTube나 다른 사이트를 둘러보고, 보고 있는 페이지를 활성 프로필로 다운로드",
  shot9_cap: "<b>Explore 첫 화면</b><br/>Explore 간단 소개와 보조 계정 로그인이 더 안전한 이유",
  shot10_cap:
    "<b>다운로드 탭이 도움이 필요한 항목을 알려 줍니다</b><br/>링크는 백그라운드에서 준비되고, 실패한 항목은 해결 방법을 제시하며, 긴 재생목록은 선택을 기다립니다",
  shot11_cap:
    "<b>영상의 일부만 다운로드</b><br/>시작과 끝, 또는 챕터를 고르면 — Arroxy가 그 구간만 저장합니다",
  shot12_cap:
    "<b>프로필 편집기</b><br/>프로필을 세밀하게 조정하세요: 파일 형식, 해상도, 자막, 저장 위치, 파일 이름 템플릿 등",
  shot13_cap:
    "<b>다크 또는 라이트, 글래스 또는 솔리드</b><br/>고를 수 있는 네 가지 룩: 움직이는 하늘 위의 유리 패널 또는 차분한 솔리드 화면, 각각 다크와 라이트 지원",
  dl_platform_col: "플랫폼",
  dl_format_col: "직접 다운로드",
  dl_oneline_note: "빌드는 x86_64 전용입니다. `curl`이 없나요? `curl -fsSL`을 `wget -qO-`로 바꾸세요.",
  dl_win_scoop: "Scoop을 선호하나요? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_grab: "모든 릴리스 파일 →",
  dl_win_h3: "Windows: 설치형과 포터블",
  dl_win_col_installer: "NSIS 설치 프로그램",
  dl_win_col_portable: "포터블 `.exe`",
  dl_win_r1: "설치 필요",
  dl_win_r1_installer: "예",
  dl_win_r1_portable: "아니요 — 어디서든 실행",
  dl_win_r2: "자동 업데이트",
  dl_win_r2_installer: "✅ 앱에서 처리",
  dl_win_r2_portable: "❌ 수동 다운로드",
  dl_win_r3: "시작 속도",
  dl_win_r3_installer: "✅ 더 빠름",
  dl_win_r3_portable: "⚠️ 첫 시작이 더 느림",
  dl_win_r4: "시작 메뉴에 추가",
  dl_win_r5: "간편한 제거",
  dl_win_r5_portable: "❌ 파일 삭제",
  dl_win_rec: "**권장:** 자동 업데이트와 빠른 시작을 위해 NSIS 설치 프로그램을 사용하세요. 설치나 레지스트리 변경이 필요 없다면 포터블 `.exe`를 사용하세요.",
  dl_win_smartscreen_intro: "처음 실행할 때 **\"Windows의 PC 보호\"** 또는 **\"알 수 없는 게시자\"**가 표시될 수 있습니다. `Arroxy-win-x64-Setup.exe`와 `Arroxy-win-x64-Portable.exe` 모두 해당합니다. Arroxy는 무료 오픈 소스지만 Windows 빌드는 유료 인증서로 코드 서명되지 않았기 때문에 SmartScreen이 표시합니다. 이것만으로 Arroxy가 안전하지 않다는 뜻은 **아닙니다**. 계속하려면:",
  dl_win_smartscreen_step1: "**추가 정보**를 클릭합니다.",
  dl_win_smartscreen_step2: "**실행**을 클릭합니다.",
  dl_win_smartscreen_official: "공식 GitHub Releases 페이지에서만 Arroxy를 다운로드하세요. 다른 웹사이트에서 받았거나 누군가가 보낸 파일이라면 삭제하고 공식 출처에서 새로 받으세요. 소스 코드는 공개되어 있으므로 직접 살펴보거나 Arroxy를 빌드할 수 있습니다.",
  dl_macos_note: "macOS 빌드는 Apple Silicon 및 Intel CI 실행기에서 제작됩니다. 문제가 있다면 [이슈를 열어 주세요](../../issues). macOS 사용자의 의견이 테스트 주기에 직접 반영됩니다.",
  dl_linux_intro: "AppImage는 설치 없이 바로 실행됩니다. 파일에 실행 권한만 부여하면 됩니다.",
  dl_linux_m1_text: "**파일 관리자:** `.AppImage`를 마우스 오른쪽 버튼으로 클릭 → **속성** → **권한** → **파일을 프로그램으로 실행 허용**을 켠 다음 두 번 클릭합니다.",
  dl_linux_m2_h4: "터미널:",
  dl_linux_fuse_text: "그래도 실행되지 않으면 마운트하지 않고 실행하세요. FUSE 패키지는 필요 없습니다:",
  dl_linux_targz_h4: "일반 tar 압축 파일(FUSE 및 설치 불필요):",
  dl_linux_targz_text: "`.tar.gz` 빌드는 AppImage 래퍼가 없는 동일한 앱입니다. 원하는 곳에 압축을 풀고 실행하세요. 설치 프로그램과 FUSE가 필요 없습니다.",
  dl_linux_arch_note: "**릴리스 페이지의 Linux 다운로드는 x86_64 전용입니다.** ARM64 장치(Raspberry Pi, Asahi Linux)에서는 Flatpak이 설치되더라도 시작할 때 `bwrap: execvp ldconfig: Exec format error` 오류가 발생합니다.",
  dl_warning_h3: "경고가 표시될 수 있는 이유",
  dl_warning_p1: "Arroxy는 오픈 소스이며 MIT 라이선스를 사용합니다. Windows와 macOS 빌드는 **코드 서명되지 않았습니다**. Apple Developer ID와 Windows EV 코드 서명 인증서는 각각 연간 수백 달러가 들며 독립 프로젝트가 직접 부담해야 합니다. 서명이 없으면 Windows SmartScreen과 macOS Gatekeeper가 처음 실행할 때 경고합니다. 경고는 *운영 체제가 게시자를 알지 못한다*는 뜻이지 Arroxy가 악성 코드라는 뜻이 아닙니다.",
  dl_warning_p2: "엄격한 순서로 Arroxy를 직접 확인하는 세 가지 방법:\n\n- **소스를 읽으세요.** 모든 코드가 [GitHub](https://github.com/antonio-orionus/Arroxy)에 있고 [소스에서 빌드](#tech)할 수 있습니다.\n- **SHA256을 확인하세요.** 파일을 공개된 [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS)와 대조하세요. 아래 [다운로드 확인](#verify)을 참고하세요.\n- **외부 검사를 실행하세요.** 파일을 [VirusTotal](https://www.virustotal.com)에 업로드하세요.",
  dl_win_first_h3: "Windows 최초 실행",
  shot_smartscreen_more_alt: "추가 정보 링크가 강조된 Windows의 PC 보호 SmartScreen 대화 상자",
  shot_smartscreen_run_alt: "추가 정보를 펼친 후 실행 버튼을 보여 주는 SmartScreen 대화 상자",
  dl_win_defender_h4: "Windows Defender가 파일을 표시하거나 제거하는 경우",
  dl_win_defender_p: "Defender 휴리스틱은 서명되지 않은 NSIS 설치 프로그램과 Electron 포터블을 의심스러운 것으로 표시할 때가 있습니다. Defender가 `Arroxy-win-x64-Setup.exe` 또는 `Arroxy-win-x64-Portable.exe`를 격리했다면 **Windows 보안 → 바이러스 및 위협 방지 → 보호 기록**에서 복원한 후 **설정 관리 → 제외 추가 또는 제거**에서 Arroxy 실행 파일을 허용 항목으로 추가하세요. SmartScreen과 마찬가지로 원인은 게시자 서명이 없기 때문이지 악성 코드가 감지되었기 때문이 아닙니다.",
  dl_macos_first_h3: "macOS 최초 실행",
  dl_macos_intro: "Arroxy의 macOS 빌드는 임시 서명되었지만 Apple 공증을 받지 않아 Gatekeeper가 처음 실행할 때 *\"Arroxy.app\"이 열리지 않음 — Apple은 \"Arroxy.app\"에 악성 소프트웨어가 없는지 확인할 수 없음* 메시지로 차단합니다. macOS가 Apple을 통해 앱을 확인할 수 없다는 뜻이지 파일에 문제가 있다는 뜻이 아닙니다. Homebrew로 설치하면 이 대화 상자를 피할 수 있습니다. DMG를 사용했다면 Terminal 명령 한 세트로 해결됩니다:",
  dl_macos_sequoia_step1: "마운트한 DMG에서 `Arroxy.app`을 `/Applications`로 드래그합니다.",
  dl_macos_sequoia_step2: "Terminal을 열고 다음 두 명령을 실행합니다:",
  dl_macos_damaged_p: "첫 명령은 다운로드할 때 macOS가 붙인 격리 속성을 제거하고 두 번째 명령은 앱을 시작합니다. `/Applications`의 복사본은 사용자 소유이므로 보통 `sudo`가 필요하지 않습니다. 권한 오류가 있을 때만 추가하세요.",
  dl_macos_arch_note: "**Apple Silicon과 Intel:** M 시리즈 Mac(M1 / M2 / M3 / M4)에서는 `arm64` DMG를 다운로드하세요. Intel Mac에서는 `x64` DMG를 받으세요. 다른 빌드도 Rosetta로 실행되지만 눈에 띄게 느립니다.",
  dl_linux_first_h3: "Linux 최초 실행",
  dl_linux_appimagelauncher: "**선택적 데스크톱 통합:** [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)를 한 번 설치하면 두 번 클릭한 AppImage가 실행기 메뉴에 자동 등록됩니다. `.desktop` 파일을 직접 만들 필요가 없습니다.",
  dl_verify_h3: "다운로드 확인(SHA256)",
  dl_verify_intro: "모든 릴리스는 바이너리와 함께 `SHA256SUMS` 파일을 게시합니다. 전송 중 파일이 손상되거나 변조되지 않았는지 확인하려면 로컬에서 해시를 계산해 `SHA256SUMS`의 해당 줄과 비교하세요. 최신 릴리스 페이지 → **Assets** → `SHA256SUMS`를 다운로드합니다.",
  dl_verify_win_label: "Windows(PowerShell 또는 명령 프롬프트):",
  dl_verify_mac_label: "macOS(Terminal):",
  dl_verify_linux_label: "Linux(Terminal):",
  dl_verify_vt_text: "외부 악성 코드 검사를 원하나요? 파일을 [VirusTotal](https://www.virustotal.com)에 업로드하세요. 서명되지 않은 Electron 앱에서 소규모 엔진 몇 개의 일반 휴리스틱 경고는 흔하지만, 주요 엔진이 광범위하게 감지한다면 실제로 우려할 만합니다.",
  privacy_p1: "[yt-dlp](https://github.com/yt-dlp/yt-dlp)가 YouTube에서 선택한 폴더로 파일을 직접 가져오며 외부 서버를 거치지 않습니다. 시청 기록, 다운로드 기록, URL, 파일 내용은 장치에 남습니다.",
  privacy_p2: "텔레메트리는 없습니다. 하루에 한 번 익명 하트비트만 보냅니다: 앱 버전, OS, 언어, 설치 방식, 국가. 활성 사용자 수를 세기 위한 것입니다. ID, URL, 동영상 제목, 파일 경로, 계정 정보는 포함하지 않습니다. 설정에서 끌 수 있습니다.",
  privacy_p3:
    "Explore는 브라우저와 별개로 자체 로그인을 유지하며, Arroxy는 로그인 양식을 읽거나 채우지 않습니다. 입력은 Google 자체 페이지에서 직접 합니다. 다운로드는 로그아웃 상태로 실행되고, 계정으로 해결할 수 있는 이유로 실패할 때만 Arroxy가 로그인 정보를 새로 읽어 해당 다운로드용 임시 파일에 두었다가 끝나면 파일을 삭제합니다. 설정에서 Explore를 로그아웃하면 로그인 정보가 지워집니다.",
  faq_q1: "정말 무료인가요?",
  faq_a1: "예. MIT 라이선스이며 프리미엄 등급이나 기능 제한이 없습니다.",
  faq_q11: "Arroxy는 다른 yt-dlp GUI와 무엇이 다른가요?",
  faq_a11:
    "대부분의 무료 yt-dlp GUI는 링크만 받는 래퍼입니다. Arroxy는 앱에 내장된 YouTube 브라우저인 **Explore**를 더했습니다. 링크를 복사하지 않고 둘러보며 다운로드할 수 있고, 그곳에서 한 번 로그인하면 쿠키를 내보내지 않고도 비공개·멤버 전용·연령 제한 동영상과 나중에 볼 동영상, 좋아요 표시한 동영상 목록을 다운로드할 수 있습니다. YouTube가 봇이 아닌지 확인을 요구하면 Arroxy가 이 로그인을 사용하며, 내장 브라우저가 YouTube의 다운로드 토큰을 받아 오므로 다운로드가 더 적은 형식으로 떨어지지 않습니다. [Arroxy를 선택하는 이유](#why)를 참고하세요.",
  faq_q2: "어떤 동영상 화질을 다운로드할 수 있나요?",
  faq_a2: "YouTube가 제공하는 모든 화질: 8K(4320p), 4K UHD(2160p), 1440p, 1080p, 720p, 480p, 360p 및 오디오 전용. 60 fps와 HDR 스트림을 그대로 보존하며, 단계별 다운로드에서는 해상도마다 AV1, VP9, H.264 중에서 고를 수 있습니다.",
  faq_q3: "오디오만 MP3로 추출할 수 있나요?",
  faq_a3: "예. 형식 메뉴에서 *오디오 전용*을 선택하고 MP3, M4A/AAC, Opus 또는 WAV를 고르세요.",
  faq_q4: "YouTube 계정이 필요한 동영상은 어떻게 다운로드하나요?",
  faq_a4:
    "Explore 탭에서 한 번 로그인하세요. 그러면 Arroxy가 계정으로 볼 수 있는 비공개·멤버 전용 동영상, 연령 인증을 마친 계정의 연령 제한 동영상, 나중에 볼 동영상과 좋아요 표시한 동영상 목록까지 다운로드할 수 있습니다. 계정으로 해결할 수 있는 이유로 다운로드가 실패할 때만 이 로그인을 사용하며, 나머지는 이전과 같이 다운로드됩니다. 쿠키 설정에서 첫 번째로 표시되고 추천 표시가 붙은 **Explore 로그인** 옵션이 바로 이것이며, Explore를 처음 열 때 Arroxy가 대신 선택합니다. yt-dlp 위키가 [로그인 상태의 자동화로 Google 계정이 표시될 수 있음](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)을 안내하므로 보조 계정이 더 안전합니다.",
  faq_q5: "YouTube가 변경되어도 계속 작동하나요?",
  faq_a5:
    "yt-dlp는 시작할 때 자동 업데이트되고 YouTube 변경 시 Arroxy가 신속하게 수정 사항을 배포합니다. YouTube가 봇이 아닌지 확인을 요구하면, Explore에 로그인해 둔 경우 Arroxy가 그 로그인도 시도하며, 쿠키 설정에서는 파일이나 브라우저의 쿠키도 사용할 수 있습니다.",
  faq_q6: "Arroxy는 어떤 언어를 지원하나요?",
  faq_a6: "설치 즉시 {{LANG_COUNT}}개 언어를 사용할 수 있습니다: {{LANG_NAME_LIST}}. Arroxy는 처음 실행할 때 운영 체제 언어를 자동 감지하며 도구 모음의 언어 선택기에서 언제든 변경할 수 있습니다. 런타임 로캘 JSON은 src/shared/i18n/locales/에, 번역자용 PO 카탈로그는 i18n/locales/에 있습니다. 기여하려면 GitHub에서 PR을 열어 주세요.",
  faq_q7: "다른 것을 설치해야 하나요?",
  faq_a7: "아니요. yt-dlp, ffmpeg, ffprobe는 처음 실행할 때 자동으로 다운로드되어 컴퓨터에 캐시됩니다. 그 뒤에는 추가 설정이 필요 없습니다.",
  faq_q8: "재생목록이나 채널 전체를 다운로드할 수 있나요?",
  faq_a8: "둘 다 가능합니다. 재생목록 또는 채널 URL(예: `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`)을 붙여 넣고 검색할 항목 수를 선택한 뒤 전체 목록을 대기열에 넣거나 특정 동영상만 선택하세요. 날짜 범위 필터는 곧 추가됩니다.",
  faq_q9: "macOS에서 \"앱이 손상되었습니다\"라고 합니다. 어떻게 하나요?",
  faq_a9: "실제 손상이 아니라 macOS Gatekeeper가 서명되지 않은 앱을 차단하는 것입니다. 격리를 지우고 Arroxy를 여는 Terminal 명령은 [macOS 최초 실행](#macos-first-launch)을 참고하세요.",
  faq_q10: "YouTube 동영상을 다운로드하는 것은 합법인가요?",
  faq_a10: "개인적이고 비공개인 용도는 대부분의 관할권에서 일반적으로 허용됩니다. YouTube [서비스 약관](https://www.youtube.com/t/terms)과 현지 저작권법을 준수할 책임은 사용자에게 있습니다.",
  plan_intro: "아직 계획 중인 기능 — 대략적인 우선순위 순서:",
  plan_col1: "기능",
  plan_col2: "설명",
  plan_r1_name: "**재생목록 및 채널 필터**",
  plan_r1_desc: "재생목록이나 채널을 나열할 때 날짜 범위로 필터링",
  plan_r2_name: "**YouTube 오디오 트랙 환경설정**",
  plan_r2_desc: "YouTube가 여러 오디오 트랙을 제공할 때 프로필별 재정의와 함께 앱 전체의 음성 언어 선호도 설정",
  plan_r3_name: "**더 강력한 재시도 복구**",
  plan_r3_desc: "불안정하거나 문제가 있는 인터넷 연결로 중단된 다운로드를 위한 새 재시도 경로",
  plan_r4_name: "**전체 다운로드 관리자 패널**",
  plan_r4_desc: "대기 중인 항목의 대상 폴더 변경을 포함해 대기열 패널을 더 완전한 관리자로 확장",
  plan_r5_name: "**예약 다운로드**",
  plan_r5_desc: "정해진 시간에 대기열 시작(야간 실행 등)",
  plan_r9_name: "**AUR 패키지**",
  plan_r9_desc: "`yay -S arroxy-bin`로 Arch Linux와 Omarchy에 설치",
  plan_cta: "원하는 기능이 있나요? [요청을 열어 주세요](../../issues). 커뮤니티 의견이 우선순위를 정합니다.",
  dl_win_format: "설치 프로그램(NSIS) 또는 포터블 `.exe`",
  dl_mac_format: "`.dmg`(Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` 또는 `.flatpak`(샌드박스)",
  dl_pkg_h3: "패키지 관리자로 설치",
  dl_channel_col: "채널",
  dl_command_col: "명령",
  dl_win_smartscreen_h4: "Windows SmartScreen 경고",
  dl_macos_h3: "macOS 최초 실행",
  dl_macos_warning: "Arroxy는 아직 코드 서명되지 않아 macOS Gatekeeper가 처음 실행할 때 앱이 손상되었다는 경고를 표시할 수 있습니다. 예상되는 동작이며 실제 파일 손상을 뜻하지 않습니다.",
  dl_macos_m1_h4: "Terminal 방법:",
  dl_macos_step1: "마운트한 DMG에서 `Arroxy.app`을 `/Applications`로 드래그합니다.",
  dl_macos_step2: "Terminal을 열고 `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`을 실행합니다.",
  dl_macos_step3: "`open /Applications/Arroxy.app`을 실행합니다.",
  dl_macos_step4: "앱 경로가 다르면 `/Applications/Arroxy.app`을 설치한 경로로 바꿉니다.",
  dl_macos_step5: "`sudo`가 요청하면 Mac 암호를 입력합니다.",
  dl_macos_after: "격리를 제거하면 Arroxy가 정상적으로 열립니다.",
  dl_macos_m2_h4: "Terminal 방법:",
  dl_linux_h3: "Linux 최초 실행",
  dl_macos_sequoia_h4: "현재 macOS용 Terminal 해결 방법",
  dl_macos_sequoia_intro: "Arroxy를 Applications에 복사한 후 Terminal을 사용하세요:",
  dl_macos_sequoia_step3: "Arroxy를 시작하려면 `open /Applications/Arroxy.app`을 실행합니다.",
  dl_macos_sequoia_step4: "앱 경로가 다르면 `/Applications/Arroxy.app`을 설치한 경로로 바꿉니다.",
  dl_macos_sonoma_h4: "이전 macOS용 Terminal 해결 방법",
  dl_macos_sonoma_step1: "마운트한 DMG에서 `Arroxy.app`을 `/Applications`로 드래그합니다.",
  dl_macos_sonoma_step2: "Terminal을 열고 `/Applications/Arroxy.app`에서 격리를 제거합니다.",
  dl_macos_sonoma_step3: "격리를 제거한 뒤 Terminal 또는 Finder에서 Arroxy를 실행합니다.",
  dl_macos_damaged_h4: "Gatekeeper 격리 해결",
  dl_pm_intro: "이미 패키지 관리자를 사용하나요? 수동 다운로드 단계를 건너뛸 수 있습니다.",
  tech_content: TECH_CONTENT,
  support_h2: "Arroxy 후원",
  support_note: "Arroxy는 무료이며 MIT 라이선스를 사용합니다. 광고, 텔레메트리, 유료 등급이 없습니다. 시간을 절약해 주었다면 Bitcoin, Tron 또는 Ethereum으로 개발을 후원할 수 있습니다. 주소는 유일한 공식 출처인 [DONATE.md](DONATE.md)에 있습니다. Arroxy는 이메일이나 개인 메시지로 주소를 보내지 않습니다. 저장소에 별을 주고, 버그를 신고하고, 번역을 개선하는 것도 같은 만큼 도움이 됩니다.",
  tos_h2: "이용 약관",
  tos_note: "Arroxy는 개인적이고 비공개인 용도로만 사용하는 도구입니다. 다운로드가 YouTube [서비스 약관](https://www.youtube.com/t/terms)과 사용자의 관할권에 적용되는 저작권법을 준수하는지 확인할 책임은 전적으로 사용자에게 있습니다. 사용 권한이 없는 콘텐츠를 다운로드, 복제 또는 배포하는 데 Arroxy를 사용하지 마세요. 개발자는 오용에 책임지지 않습니다.",
  footer_credit: 'MIT 라이선스 · <a href="https://x.com/OrionusAI">@OrionusAI</a>가 정성껏 제작',
};
