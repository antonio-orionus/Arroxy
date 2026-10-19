<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="{{icon_alt}}" width="180" />

# {{title}}

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**{{read_in_label}}** {{LANG_NAV}}

[![{{badge_release_alt}}](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![{{badge_build_alt}}](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![{{badge_website_alt}}](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![{{badge_license_alt}}](https://img.shields.io/badge/license-MIT-green) ![{{badge_platforms_alt}}](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![{{badge_i18n_alt}}](https://img.shields.io/badge/i18n-{{LANG_COUNT}}_languages-blue)

{{hero_desc}}

[**{{cta_latest}}**](#install) &nbsp;·&nbsp; [**{{cta_website}}**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [{{dl_win_first_h3}}](#windows-first-launch) · [{{dl_macos_first_h3}}](#macos-first-launch) · [{{dl_linux_first_h3}}](#linux-first-launch)

[![{{discord_badge_text}}](https://img.shields.io/badge/{{discord_badge_encoded}}-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

{{star_cta}}

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: {{LAST_UPDATED}}._

{{ai_notice}}

---

## {{toc_heading}}

- [✨ {{features_h2}}](#features)
- [📥 {{dl_h2}}](#install)
  - [{{dl_win_first_h3}}](#windows-first-launch)
  - [{{dl_macos_first_h3}}](#macos-first-launch)
  - [{{dl_warning_h3}}](#why-warning)
  - [{{dl_linux_first_h3}}](#linux-first-launch)
  - [{{dl_verify_h3}}](#verify)
- [⚖️ {{why_h2}}](#why)
- [🔒 {{privacy_h2}}](#privacy)
- [❓ {{faq_h2}}](#faq)
- [🗺️ {{roadmap_h2}}](#roadmap)
- [💖 {{support_h2}}](#support)
- [🛠️ {{tech_h2}}](#tech)

---

## <a id="features"></a>✨ {{features_h2}}

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub>{{shot8_cap}}</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub>{{shot9_cap}}</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub>{{shot10_cap}}</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub>{{shot11_cap}}</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub>{{shot12_cap}}</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub>{{shot13_cap}}</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="{{hotkey_fig_alt}}" width="760" /></picture><br/><sub>{{hotkey_fig_cap}}</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub>{{shot7_cap}}</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub>{{shot1_cap}}</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub>{{shot2_cap}}</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub>{{shot3_cap}}</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub>{{shot4_cap}}</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub>{{shot5_cap}}</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub>{{shot6_cap}}</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 {{feat_explore_h3}}</strong></summary>

- {{feat_explore_1}}
- {{feat_explore_6}}
- {{feat_explore_7}}
- {{feat_explore_2}}
- {{feat_explore_3}}
- {{feat_explore_4}}
- {{feat_explore_5}}

</details>

<details>
<summary><strong>🎞️ {{feat_quality_h3}}</strong></summary>

- {{feat_quality_1}}
- {{feat_quality_2}}
- {{feat_quality_3}}
- {{feat_quality_4}}
- {{feat_quality_5}}
- {{feat_quality_6}}

</details>

<details>
<summary><strong>🛡️ {{feat_privacy_h3}}</strong></summary>

- {{feat_privacy_1}}
- {{feat_privacy_2}}
- {{feat_privacy_3}}

</details>

<details>
<summary><strong>⚡ {{feat_workflow_h3}}</strong></summary>

- {{feat_workflow_12}}
- {{feat_workflow_1}}
- {{feat_workflow_2}}
- {{feat_workflow_3}}
- {{feat_workflow_4}}
- {{feat_workflow_5}}
- {{feat_workflow_6}}
- {{feat_workflow_7}}
- {{feat_workflow_8}}
- {{feat_workflow_9}}
- {{feat_workflow_10}}
- {{feat_workflow_11}}
- {{feat_workflow_13}}
- {{feat_workflow_14}}
- {{feat_workflow_15}}
- {{feat_workflow_16}}
- {{feat_workflow_17}}
- {{feat_workflow_18}}
- {{feat_workflow_19}}
- {{feat_workflow_20}}

</details>

<details>
<summary><strong>📝 {{feat_post_h3}}</strong></summary>

- {{feat_post_1}}
- {{feat_post_2}}
- {{feat_post_5}}
- {{feat_post_3}}
- {{feat_post_4}}

</details>

<details>
<summary><strong>🌐 {{feat_sites_h3}}</strong></summary>

- {{feat_sites_1}}
- {{feat_sites_2}}
- {{feat_sites_3}}
- {{feat_sites_4}}

</details>

---

## <a id="install"></a>📥 {{dl_h2}}

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

{{dl_oneline_note}}

| {{dl_platform_col}} | {{dl_format_col}} |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**{{dl_grab}}**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 {{dl_win_first_h3}}</strong></summary>

{{dl_win_smartscreen_intro}}

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="{{shot_smartscreen_more_alt}}" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="{{shot_smartscreen_run_alt}}" />
</div>

1. {{dl_win_smartscreen_step1}}
2. {{dl_win_smartscreen_step2}}

#### {{dl_win_defender_h4}}

{{dl_win_defender_p}}

> {{dl_win_smartscreen_official}}

{{dl_win_scoop}}

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 {{dl_macos_first_h3}}</strong></summary>

{{dl_macos_intro}}

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. {{dl_macos_sequoia_step1}}
2. {{dl_macos_sequoia_step2}}

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

{{dl_macos_damaged_p}}

{{dl_macos_arch_note}}

> {{dl_macos_note}}

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ {{dl_warning_h3}}</strong></summary>

{{dl_warning_p1}}

{{dl_warning_p2}}

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 {{dl_linux_first_h3}}</strong></summary>

{{dl_linux_intro}}

{{dl_linux_m1_text}}

**{{dl_linux_m2_h4}}**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

{{dl_linux_fuse_text}}

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

{{dl_linux_appimagelauncher}}

**{{dl_linux_targz_h4}}**

{{dl_linux_targz_text}}

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

{{dl_linux_arch_note}}

</details>

<details>
<summary><strong><a id="verify"></a>🔐 {{dl_verify_h3}}</strong></summary>

{{dl_verify_intro}}

**{{dl_verify_win_label}}**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**{{dl_verify_mac_label}}**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**{{dl_verify_linux_label}}**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

{{dl_verify_vt_text}}

</details>

<details>
<summary><strong>📦 {{dl_win_h3}}</strong></summary>

|               | {{dl_win_col_installer}} | {{dl_win_col_portable}} |
| ------------- | :----------------------: | :---------------------: |
| {{dl_win_r1}} | {{dl_win_r1_installer}}  | {{dl_win_r1_portable}}  |
| {{dl_win_r2}} | {{dl_win_r2_installer}}  | {{dl_win_r2_portable}}  |
| {{dl_win_r3}} | {{dl_win_r3_installer}}  | {{dl_win_r3_portable}}  |
| {{dl_win_r4}} |            ✅            |           ❌            |
| {{dl_win_r5}} |            ✅            | {{dl_win_r5_portable}}  |

{{dl_win_rec}}

</details>

---

## <a id="why"></a>⚖️ {{why_h2}}

{{why_intro}}

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| {{why_r8}} |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| {{why_r9}} |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| {{why_r1}} |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| {{why_r2}} |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| {{why_r3}} |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| {{why_r5}} |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| {{why_r6}} |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| {{why_r7}} |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

{{why_table_note}}

{{why_summary}}

### <a id="why-explore"></a>🧭 {{why_explore_h3}}

{{why_explore_intro}}

- {{why_explore_1}}
- {{why_explore_2}}
- {{why_explore_3}}
- {{why_explore_4}}
- {{why_explore_5}}

---

## <a id="privacy"></a>🔒 {{privacy_h2}}

{{privacy_p1}}

{{privacy_p2}}

{{privacy_p3}}

---

## <a id="faq"></a>❓ {{faq_h2}}

<details>
<summary><strong>{{faq_q1}}</strong></summary>

{{faq_a1}}

</details>

<details>
<summary><strong>{{faq_q11}}</strong></summary>

{{faq_a11}}

</details>

<details>
<summary><strong>{{faq_q2}}</strong></summary>

{{faq_a2}}

</details>

<details>
<summary><strong>{{faq_q3}}</strong></summary>

{{faq_a3}}

</details>

<details>
<summary><strong>{{faq_q4}}</strong></summary>

{{faq_a4}}

</details>

<details>
<summary><strong>{{faq_q5}}</strong></summary>

{{faq_a5}}

</details>

<details>
<summary><strong>{{faq_q6}}</strong></summary>

{{faq_a6}}

</details>

<details>
<summary><strong>{{faq_q7}}</strong></summary>

{{faq_a7}}

</details>

<details>
<summary><strong>{{faq_q8}}</strong></summary>

{{faq_a8}}

</details>

<details>
<summary><strong>{{faq_q9}}</strong></summary>

{{faq_a9}}

</details>

<details>
<summary><strong>{{faq_q10}}</strong></summary>

{{faq_a10}}

</details>

---

## <a id="roadmap"></a>🗺️ {{roadmap_h2}}

{{plan_intro}}

| {{plan_col1}}    | {{plan_col2}}    |
| ---------------- | ---------------- |
| {{plan_r1_name}} | {{plan_r1_desc}} |
| {{plan_r2_name}} | {{plan_r2_desc}} |
| {{plan_r3_name}} | {{plan_r3_desc}} |
| {{plan_r4_name}} | {{plan_r4_desc}} |
| {{plan_r5_name}} | {{plan_r5_desc}} |
| {{plan_r9_name}} | {{plan_r9_desc}} |

{{plan_cta}}

---

## <a id="support"></a>💖 {{support_h2}}

{{support_note}}

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ {{tech_h2}}

{{tech_content}}

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

## 📜 {{tos_h2}}

{{tos_note}}

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>{{footer_credit}}</sub>
</div>
