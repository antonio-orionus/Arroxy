<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="{{icon_alt}}" width="180" />

# {{title}}

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**{{read_in_label}}** {{LANG_NAV}}

[![{{badge_release_alt}}](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![{{badge_build_alt}}](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![{{badge_website_alt}}](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![{{badge_license_alt}}](https://img.shields.io/badge/license-MIT-green) ![{{badge_platforms_alt}}](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![{{badge_i18n_alt}}](https://img.shields.io/badge/i18n-21_languages-blue)

{{hero_desc}}

[**{{cta_latest}}**](#install) &nbsp;·&nbsp; [**{{cta_website}}**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#install) · [macOS](#install) · [Linux](#install)

[![{{discord_badge_text}}](https://img.shields.io/badge/{{discord_badge_encoded}}-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/demo.gif" alt="{{demo_alt}}" width="720" />

{{star_cta}}

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

{{ai_notice}}

---

## {{toc_heading}}

- [{{dl_h2}}](#install)
- [{{why_h2}}](#why)
- [{{features_h2}}](#features)
- [{{privacy_h2}}](#privacy)
- [{{faq_h2}}](#faq)
- [{{roadmap_h2}}](#roadmap)
- [{{tech_h2}}](#tech)

---

## <a id="install"></a>{{dl_h2}}

| {{dl_platform_col}} | {{dl_format_col}} |
| ------------------- | ----------------- |
| Windows             | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS               | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux               | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify              | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**{{dl_grab}}**](https://github.com/antonio-orionus/Arroxy/releases/latest)

### <a id="why-warning"></a>{{dl_warning_h3}}

{{dl_warning_p1}}

{{dl_warning_p2}}

### <a id="windows-first-launch"></a>{{dl_win_first_h3}}

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

### <a id="macos-first-launch"></a>{{dl_macos_first_h3}}

{{dl_macos_intro}}

#### {{dl_macos_sequoia_h4}}

{{dl_macos_sequoia_intro}}

1. {{dl_macos_sequoia_step1}}
2. {{dl_macos_sequoia_step2}}
3. {{dl_macos_sequoia_step3}}
4. {{dl_macos_sequoia_step4}}

#### {{dl_macos_sonoma_h4}}

1. {{dl_macos_sonoma_step1}}
2. {{dl_macos_sonoma_step2}}
3. {{dl_macos_sonoma_step3}}

#### {{dl_macos_damaged_h4}}

{{dl_macos_damaged_p}}

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

{{dl_macos_arch_note}}

> {{dl_macos_note}}

### <a id="linux-first-launch"></a>{{dl_linux_first_h3}}

{{dl_linux_intro}}

{{dl_linux_m1_text}}

**{{dl_linux_m2_h4}}**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

{{dl_linux_fuse_text}}

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

{{dl_linux_appimagelauncher}}

{{dl_linux_flatpak_intro}}

```bash
flatpak install --user Arroxy-linux-x64.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>{{dl_verify_h3}}</strong></summary>

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
<summary><strong>{{dl_pkg_h3}}</strong></summary>

{{dl_pm_intro}}

| {{dl_channel_col}} | {{dl_command_col}}                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-linux-x64.flatpak`                                                 |

</details>

<details>
<summary><strong>{{dl_win_h3}}</strong></summary>

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

## <a id="why"></a>{{why_h2}}

{{why_intro}}

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| {{why_r1}} |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| {{why_r2}} |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| {{why_r3}} |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| {{why_r4}} |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| {{why_r5}} |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| {{why_r6}} |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| {{why_r7}} |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

{{why_summary}}

---

## <a id="features"></a>{{features_h2}}

### {{feat_quality_h3}}

- {{feat_quality_1}}
- {{feat_quality_2}}
- {{feat_quality_3}}
- {{feat_quality_4}}

### {{feat_privacy_h3}}

- {{feat_privacy_1}}
- {{feat_privacy_2}}
- {{feat_privacy_3}}

### {{feat_workflow_h3}}

- {{feat_workflow_1}}
- {{feat_workflow_2}}
- {{feat_workflow_3}}
- {{feat_workflow_4}}
- {{feat_workflow_5}}
- {{feat_workflow_6}}
- {{feat_workflow_7}}
- {{feat_workflow_8}}

### {{feat_post_h3}}

- {{feat_post_1}}
- {{feat_post_2}}
- {{feat_post_3}}
- {{feat_post_4}}

### {{feat_sites_h3}}

- {{feat_sites_1}}
- {{feat_sites_2}}
- {{feat_sites_3}}
- {{feat_sites_4}}

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="{{shot1_alt}}" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="{{shot2_alt}}" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="{{shot3_alt}}" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="{{shot4_alt}}" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="{{shot5_alt}}" />
</div>

---

## <a id="privacy"></a>{{privacy_h2}}

{{privacy_p1}}

{{privacy_p2}}

---

## <a id="faq"></a>{{faq_h2}}

**{{faq_q1}}**
{{faq_a1}}

**{{faq_q2}}**
{{faq_a2}}

**{{faq_q3}}**
{{faq_a3}}

**{{faq_q4}}**
{{faq_a4}}

**{{faq_q5}}**
{{faq_a5}}

**{{faq_q6}}**
{{faq_a6}}

**{{faq_q7}}**
{{faq_a7}}

**{{faq_q8}}**
{{faq_a8}}

**{{faq_q9}}**
{{faq_a9}}

**{{faq_q10}}**
{{faq_a10}}

---

## <a id="roadmap"></a>{{roadmap_h2}}

{{plan_intro}}

| {{plan_col1}}    | {{plan_col2}}    |
| ---------------- | ---------------- |
| {{plan_r1_name}} | {{plan_r1_desc}} |
| {{plan_r4_name}} | {{plan_r4_desc}} |
| {{plan_r5_name}} | {{plan_r5_desc}} |
| {{plan_r7_name}} | {{plan_r7_desc}} |

{{plan_cta}}

---

## <a id="tech"></a>{{tech_h2}}

{{tech_content}}

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

## {{tos_h2}}

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
