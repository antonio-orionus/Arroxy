<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="มาสคอต Arroxy" width="180" />

# Arroxy — โปรแกรมดาวน์โหลด YouTube (+ 2000 เว็บไซต์) ฟรีและโอเพนซอร์ส พร้อมเบราว์เซอร์ในตัว สำหรับ Windows, macOS และ Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**อ่านในภาษา:** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · **ไทย** · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![รุ่น](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![บิลด์](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![เว็บไซต์](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![สัญญาอนุญาต](https://img.shields.io/badge/license-MIT-green) ![แพลตฟอร์ม](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![ภาษา](https://img.shields.io/badge/i18n-31_languages-blue)

ดาวน์โหลดวิดีโอ Shorts เพลง ช่อง พอดแคสต์ หรือแทร็กเสียงจาก **YouTube และเว็บไซต์ที่รองรับกว่า 2000 แห่ง** — สูงสุด 8K HDR ที่ 60 fps เป็น MP3 / AAC / Opus หรือเฉพาะช่วงที่ต้องการ **เรียกดู YouTube หรือเว็บไซต์อื่นใดใน Arroxy** ผ่านแท็บ Explore แล้วดาวน์โหลดวิดีโอ เพลย์ลิสต์ หรือช่องที่กำลังดูอยู่ เข้าสู่ระบบที่นั่นเพื่อดาวน์โหลดวิดีโอส่วนตัว วิดีโอเฉพาะสมาชิก และวิดีโอจำกัดอายุที่บัญชีของคุณดูได้ ทำงานภายในเครื่องบน Windows, macOS และ Linux **ไม่มีโฆษณา ไม่มีส่วนเกิน และไม่มีการขายเพิ่ม**

[**↓ ติดตั้งรุ่นล่าสุด**](#install) &nbsp;·&nbsp; [**เว็บไซต์**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [การเปิดครั้งแรกบน Windows](#windows-first-launch) · [การเปิดครั้งแรกบน macOS](#macos-first-launch) · [การเปิดครั้งแรกบน Linux](#linux-first-launch)

[![เข้าร่วมชุมชน Discord](https://img.shields.io/badge/%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A3%E0%B9%88%E0%B8%A7%E0%B8%A1%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

ถ้า Arroxy ช่วยประหยัดเวลา การกด ⭐ จะช่วยให้คนอื่นค้นพบได้ง่ายขึ้น

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 คำแปลนี้จัดทำโดยมี AI ช่วยเหลือ [README ภาษาอังกฤษ](README.md) คือแหล่งข้อมูลหลัก พบข้อผิดพลาดหรือไม่ [เปิด PR](../../pulls) ได้เลย

---

## สารบัญ

- [✨ ความสามารถ](#features)
- [📥 การติดตั้งและเปิดใช้ครั้งแรก](#install)
  - [การเปิดครั้งแรกบน Windows](#windows-first-launch)
  - [การเปิดครั้งแรกบน macOS](#macos-first-launch)
  - [เหตุผลที่อาจเห็นคำเตือน](#why-warning)
  - [การเปิดครั้งแรกบน Linux](#linux-first-launch)
  - [ตรวจสอบไฟล์ดาวน์โหลด (SHA256)](#verify)
- [⚖️ เหตุผลที่เลือก Arroxy](#why)
- [🔒 ความเป็นส่วนตัว](#privacy)
- [❓ คำถามที่พบบ่อย](#faq)
- [🗺️ แผนพัฒนา](#roadmap)
- [💖 สนับสนุน Arroxy](#support)
- [🛠️ สร้างด้วย](#tech)

---

## <a id="features"></a>✨ ความสามารถ

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>เรียกดู YouTube หรือเว็บไซต์อื่นใดใน Arroxy แล้วดาวน์โหลดหน้าที่กำลังดูด้วยโปรไฟล์ที่ใช้งานอยู่</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>หน้าแรกของ Explore</b><br/>แนะนำ Explore สั้น ๆ และเหตุผลที่บัญชีสำรองปลอดภัยกว่าสำหรับการเข้าสู่ระบบ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>แท็บดาวน์โหลดบอกว่าอะไรต้องให้คุณจัดการ</b><br/>ลิงก์เตรียมข้อมูลเบื้องหลัง ลิงก์ที่ล้มเหลวจะเสนอวิธีแก้ และเพลย์ลิสต์ยาวจะรอให้คุณเลือก</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ดาวน์โหลดเฉพาะบางส่วนของวิดีโอ</b><br/>เลือกจุดเริ่มต้นและจุดสิ้นสุด หรือเลือกบท — Arroxy จะบันทึกเฉพาะช่วงนั้น</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>ตัวแก้ไขโปรไฟล์</b><br/>ปรับแต่งโปรไฟล์: ชนิดไฟล์ ความละเอียด คำบรรยาย ปลายทาง เทมเพลตชื่อไฟล์ และอื่น ๆ</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>มืดหรือสว่าง กระจกหรือเรียบ</b><br/>สี่รูปลักษณ์ให้เลือก: แผงกระจกบนท้องฟ้าที่เคลื่อนไหว หรือพื้นผิวเรียบสงบ ทั้งแบบมืดและสว่าง</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="ปุ่มลัดดาวน์โหลดทั่วระบบของ Arroxy — Ctrl+Shift+D บน Windows และ Linux, Cmd+Shift+D บน macOS เพื่อส่งลิงก์ที่คัดลอกเข้าคิวโดยตรง" width="760" /></picture><br/><sub><b>ปุ่มลัดดาวน์โหลดทั่วระบบ</b><br/>คัดลอกลิงก์ที่ไหนก็ได้ กดครั้งเดียว แล้วลิงก์จะเข้าคิวและเริ่มดาวน์โหลด</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>โปรไฟล์แยกต่อรายการเพลย์ลิสต์</b><br/>ให้แต่ละวิดีโอใช้โปรไฟล์ของตัวเอง — เก็บบางรายการเป็น 4K และที่เหลือเป็น MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>หน้าดาวน์โหลดด่วน</b><br/>วาง URL แล้วดาวน์โหลดทันทีด้วยโปรไฟล์ที่ใช้งานอยู่</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>โปรไฟล์ดาวน์โหลดที่ใช้ซ้ำได้</b><br/>บันทึกรูปแบบ คุณภาพ และปลายทาง แล้วใช้ซ้ำในแต่ละงาน</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>แทร็กเสียงหลายภาษา</b><br/>เลือกภาษาเสียงที่มากับวิดีโอได้อย่างแม่นยำ</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>เสียง surround / Dolby</b><br/>ตรวจพบและเก็บแทร็ก 5.1 กับ Dolby ไว้</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>โหมด URL จำนวนมาก</b><br/>วางรายการ ลบรายการซ้ำอัตโนมัติ แล้วเพิ่มทั้งหมดเข้าคิว</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>คิวดาวน์โหลดแบบขนาน</b><br/>ดาวน์โหลดหลายงานพร้อมกันพร้อมความคืบหน้าแบบสด</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore: เรียกดูเว็บใน Arroxy</strong></summary>

- **แท็บ Explore** — เรียกดู YouTube หรือเว็บไซต์อื่นใดภายใน Arroxy และดาวน์โหลดสิ่งที่พบโดยไม่ต้องคัดลอกลิงก์ **ดาวน์โหลด · *โปรไฟล์ของคุณ*** จะเข้าคิววิดีโอ เพลย์ลิสต์ หรือช่องที่กำลังดูอยู่ ลูกศรข้างปุ่มใช้สลับโปรไฟล์ ส่วนไม้กายสิทธิ์เปิดการดาวน์โหลดทีละขั้นเพื่อเลือกรูปแบบ คำบรรยาย และอื่น ๆ
- **คลิกขวาเพื่อดาวน์โหลด** — คลิกขวาที่ลิงก์วิดีโอ เพลย์ลิสต์ หรือช่องใดก็ได้ใน Explore เพื่อดาวน์โหลดด้วยโปรไฟล์ของคุณ เลือกโปรไฟล์อื่นจาก **ดาวน์โหลดด้วย** เปิดการดาวน์โหลดทีละขั้น หรือคัดลอกลิงก์ ไม่ต้องเปิดวิดีโอทีละรายการก่อน
- **เลย์เอาต์แบบกะทัดรัด** — คลิกครั้งเดียวบนแถบเครื่องมือของ Explore เพื่อย้ายแท็บของ Arroxy เข้าไปอยู่ในนั้น และให้หน้ามีพื้นที่มากขึ้น
- **แถบที่อยู่** — พิมพ์เพื่อค้นหาใน YouTube หรือพิมพ์ที่อยู่เว็บใดก็ได้เพื่อเปิดเว็บไซต์นั้น
- **ดาวน์โหลดที่ต้องใช้บัญชี** — เข้าสู่ระบบใน Explore เพียงครั้งเดียว Arroxy ก็ดาวน์โหลดวิดีโอส่วนตัวและวิดีโอเฉพาะสมาชิกที่บัญชีของคุณดูได้ วิดีโอจำกัดอายุหากบัญชียืนยันอายุแล้ว รวมถึงรายการดูภายหลังและวิดีโอที่ถูกใจของคุณได้ เข้าสู่ระบบเว็บไซต์อื่นที่นั่นได้เช่นกัน และการดาวน์โหลดจากเว็บไซต์เหล่านั้นจะใช้การเข้าสู่ระบบนี้เมื่อจำเป็น โดย Arroxy ยังคงดาวน์โหลดแบบไม่เข้าสู่ระบบก่อน และใช้การเข้าสู่ระบบ Explore ของคุณเฉพาะเมื่อการดาวน์โหลดล้มเหลวด้วยเหตุที่บัญชีแก้ได้ เมื่อ YouTube ขอให้ยืนยันว่าคุณไม่ใช่บอต Arroxy ก็จะลองใช้การเข้าสู่ระบบ Explore ของคุณด้วย
- **ใช้บัญชีสำรอง** — หน้าแรกของ Explore อธิบายเหตุผลไว้ การดาวน์โหลดด้วยบัญชีมีความเสี่ยงอยู่บ้างที่บัญชีนั้นจะถูกจำกัด ออกจากระบบ Explore ได้จากการตั้งค่าทุกเมื่อที่ต้องการให้ลืมการเข้าสู่ระบบทั้งหมด
- **ตัวบล็อกโฆษณา** — ปิดไว้โดยค่าเริ่มต้น คลิกที่โล่บนแถบเครื่องมือของ Explore ครั้งเดียวก็บล็อกโฆษณาและตัวติดตามบนหน้าของ Explore โดยไม่กระทบการดาวน์โหลด YouTube อาจตอบโต้ตัวบล็อกโฆษณากับบัญชีที่เข้าสู่ระบบอยู่

</details>

<details>
<summary><strong>🎞️ คุณภาพและรูปแบบ</strong></summary>

- สูงสุด **8K (4320p)** รวมถึง 4K UHD (2160p), 1440p, 1080p, 720p, 480p และ 360p
- คง **อัตราเฟรมสูงและ HDR** ไว้ตามต้นฉบับ — 60 fps และ HDR10
- **เสียง** — ส่งออกเฉพาะเสียงเป็น MP3, M4A/AAC, Opus หรือ WAV ในการดาวน์โหลดแบบโต้ตอบ คุณเลือกแทร็ก surround/Dolby ดั้งเดิมของต้นทาง (AC-3, E-AC-3, 5.1, DRC) ได้เมื่อมี หรือกำหนดค่าเริ่มต้นส่วนกลางเป็น **เน้น surround / Dolby**
- **โปรไฟล์ที่มีเป้าหมาย** — *ภาพดีที่สุด* (AV1 · VP9) หรือ *สมาร์ททีวี* (MP4 · H.264) บันทึกเป็น อัตโนมัติ, MP4, MKV หรือ WebM โดยไม่เข้ารหัสใหม่ HDR เป็น *อัตโนมัติ* (เฉพาะเมื่อหน้าจอของคุณแสดงได้), *SDR* หรือ *HDR*
- **ทุกโคเดกในทุกความละเอียด** — การดาวน์โหลดทีละขั้นแสดง AV1, VP9 และ H.264 เคียงกันในแต่ละความละเอียด คุณจึงเลือกตัวที่ทีวีหรือโปรแกรมตัดต่อของคุณเล่นได้
- **รู้ว่าสตรีมเป็นอย่างไรจริง ๆ** — ขนาดที่ YouTube อัปสเกลด้วย AI ภาษาเสียงที่พากย์ด้วย AI สตรีมบิตเรตเสริม วิดีโอ 360° และสำเนาที่เสียหายหรือมีลายน้ำจะถูกทำเครื่องหมาย โปรไฟล์จะข้ามสตรีมที่อัปสเกลด้วย AI เว้นแต่คุณอนุญาต

</details>

<details>
<summary><strong>🛡️ ความเป็นส่วนตัวและการควบคุม</strong></summary>

- ประมวลผลภายในเครื่อง 100% — ดาวน์โหลดตรงจาก YouTube ลงดิสก์ของคุณ
- **โอเพนซอร์ส** — ตรวจสอบโค้ดได้ทุกบรรทัด ภายใต้ MIT License
- บันทึกไฟล์ตรงไปยังโฟลเดอร์ที่คุณเลือก

</details>

<details>
<summary><strong>⚡ ขั้นตอนการทำงาน</strong></summary>

- **ปุ่มลัดดาวน์โหลดทั่วระบบ** — คัดลอกลิงก์ในแอปใดก็ได้แล้วกด `Ctrl+Shift+D` (`Cmd+Shift+D` บน macOS); Arroxy จะเพิ่มเข้าคิวด้วยโปรไฟล์ที่ใช้งานอยู่โดยไม่เปิดหน้าต่าง พร้อมแจ้งเตือนยืนยัน เปิดใช้โดยค่าเริ่มต้นและเปลี่ยนปุ่มได้
- **วิธีเริ่มที่ยืดหยุ่น** — เลือกดาวน์โหลดไฟล์เดียวแบบมีตัวช่วย ตัวเลือกเพลย์ลิสต์/ช่อง วาง URL จำนวนมาก ดาวน์โหลดด่วนด้วยค่าเริ่มต้นที่บันทึกไว้ หรือเรียกดูและดาวน์โหลดจาก Explore
- **คิวดาวน์โหลดส่วนกลาง** — งานเดี่ยว เพลย์ลิสต์ แบบกลุ่ม และแบบด่วนอยู่ในที่เดียวสำหรับดูความคืบหน้า หยุดชั่วคราว ทำต่อ ยกเลิก ลองใหม่ และกำหนดลำดับความสำคัญ
- **เฝ้าดูคลิปบอร์ด** — คัดลอกลิงก์วิดีโอแล้วลิงก์จะถูกกรอกในช่อง URL เมื่อคุณกลับมาที่ Arroxy พร้อม **เลิกทำ** หากคุณไม่ได้ตั้งใจ ระหว่างที่ Arroxy ไม่ว่าง ลิงก์จะรอจนกว่าคุณจะกลับมาที่แท็บ URL (ปิดได้ในการตั้งค่า)
- **ล้าง URL อัตโนมัติ** — ตัดพารามิเตอร์ติดตาม (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) และแกะลิงก์ `youtube.com/redirect`
- **โหมดถาดระบบ** — ปิดหน้าต่างแล้วการดาวน์โหลดยังทำงานเบื้องหลัง
- **31 ภาษา** — ตรวจหาภาษาระบบอัตโนมัติและเปลี่ยนได้ทุกเมื่อ
- **ซิงก์เพลย์ลิสต์** — สแกนเพลย์ลิสต์เทียบกับโฟลเดอร์ในเครื่องอีกครั้งเพื่อข้ามวิดีโอที่ดาวน์โหลดแล้ว พร้อมสร้างไฟล์เพลย์ลิสต์ `.m3u` ที่อัปเดตเมื่อดาวน์โหลดแต่ละวิดีโอ
- **ควบคุมความเร็วและจังหวะ** — จำกัดแบนด์วิดท์ กำหนดจำนวนส่วนของวิดีโอที่ดาวน์โหลดพร้อมกัน และหน่วงคำขอด้วยค่าล่วงหน้า (*ปิด · สมดุล · ระมัดระวัง · กำหนดเอง*)
- **แม่แบบชื่อไฟล์** — ตั้งชื่อด้วย `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` และ `{playlist_index}` ได้ทั้งส่วนกลางหรือแยกตามโปรไฟล์
- **ดาวน์โหลดพร้อมกันและลองใหม่อัตโนมัติ** — เลือกจำนวนงานในคิวที่ทำพร้อมกัน และให้ Arroxy ลองงานที่พบปัญหาเครือข่ายหรือเซิร์ฟเวอร์ใหม่ โดยรอนานขึ้นในแต่ละครั้ง
- **โปรไฟล์แยกสำหรับแต่ละรายการในเพลย์ลิสต์** — กำหนดโปรไฟล์ให้แต่ละวิดีโอแทนการใช้ค่าเดียวทั้งรายการ จึงเก็บบางรายการเต็มคุณภาพและดาวน์โหลดที่เหลือเป็น MP3 ได้ในรอบเดียว
- **ดาวน์โหลดด่วนทำงานเบื้องหลัง** — ลิงก์จะแสดงในแท็บดาวน์โหลดทันทีและเตรียมข้อมูลที่นั่น มีการแจ้งเตือนพร้อมปุ่ม **ดู** ยืนยัน และช่อง URL จะถูกล้างเพื่อรอลิงก์ถัดไป เริ่มกี่ลิงก์ก็ได้ระหว่างที่ลิงก์ก่อนหน้ากำลังเตรียม
- **แท็บดาวน์โหลดบอกว่าอะไรต้องให้คุณจัดการ** — หาก Arroxy อ่านลิงก์ไม่ได้ แถวของลิงก์นั้นจะบอกสาเหตุและเสนอวิธีแก้: ลองอีกครั้ง เปิดคุกกี้ หรือเข้าสู่ระบบใน Explore เมื่อปิดคุกกี้ไว้ **เข้าสู่ระบบด้วย Explore** จะลองให้อีกครั้งหลังคุณเข้าสู่ระบบแล้ว เพลย์ลิสต์ที่ยาวเกินขีดจำกัดการโหลดจะรอบนแถวให้คุณเลือกทั้งหมด เฉพาะไม่กี่รายการแรก หรือตรวจดูก่อน แท็บดาวน์โหลดจะนับจำนวนแถวที่รอคุณอยู่
- **ดาวน์โหลดเพียงบางส่วนของวิดีโอ** — เลือกจุดเริ่มและจุดสิ้นสุด หรือเลือกบท ที่หน้ารูปแบบ แล้ว Arroxy จะบันทึกเฉพาะช่วงนั้น โดยตั้งชื่อไฟล์ให้มีช่วงเวลาต่อท้ายรหัสวิดีโอ การตัดจะอยู่ที่คีย์เฟรมที่ใกล้ที่สุด เปิดตัวเลือกตัดแม่นยำเพื่อเข้ารหัสใหม่แทน
- **ลบการดาวน์โหลดที่เสร็จแล้วอัตโนมัติ** — ตัวเลือกเสริม: การดาวน์โหลดที่เสร็จแล้วจะหายไปจากรายการหลังจาก 5 วินาที ไฟล์ยังอยู่ในดิสก์ และการดาวน์โหลดที่ล้มเหลวจะยังคงอยู่ในรายการ
- **ขนาดและไม่มีไฟล์ในดาวน์โหลด** — คอลัมน์ **ขนาด** ที่เรียงลำดับได้แสดงว่าแต่ละรายการใช้พื้นที่เท่าไร และ **ไม่มี** ทำเครื่องหมายไฟล์ที่ถูกย้ายหรือลบนอก Arroxy
- **Aurora หรือ มินิมอล มืดหรือสว่าง** — แผงกระจกเหนือท้องฟ้าที่เคลื่อนไหว หรือพื้นผิวทึบที่เรียบง่าย สลับได้จากส่วนท้าย คอมพิวเตอร์ที่ไม่มีการเร่งความเร็วกราฟิกจะได้มินิมอลโดยอัตโนมัติ
- **เมนูบาร์ของ Mac** — บน macOS เปิดการตั้งค่า (`Cmd+,`) ตั้งขีดจำกัดความเร็วดาวน์โหลด สลับสไตล์และธีม และเปิดบันทึกหรือบันทึกไฟล์การวินิจฉัยได้จากเมนูบาร์
- **เปลี่ยนโปรไฟล์จากการดาวน์โหลดใดก็ได้** — ปรับแต่งการดาวน์โหลด แล้วอัปเดตโปรไฟล์ที่ใช้เริ่มต้น (พร้อมตัวอย่างสิ่งที่จะเปลี่ยน) หรือบันทึกการตั้งค่าเป็นโปรไฟล์ใหม่ การสลับโปรไฟล์จะถามว่าจะเก็บการแก้ไขของคุณไว้หรือไม่

</details>

<details>
<summary><strong>📝 คำบรรยายและการประมวลผลภายหลัง</strong></summary>

- **คำบรรยาย** แบบ SRT, VTT หรือ ASS — แบบทำเองหรือสร้างอัตโนมัติ ในทุกภาษาที่มี
- บันทึกข้างวิดีโอ ฝังใน `.mkv` หรือจัดไว้ในโฟลเดอร์ย่อย `Subtitles/`
- **ชุดงานเฉพาะคำบรรยาย** — วางรายการ URL หรือเปิดเพลย์ลิสต์ เลือกคำบรรยาย แล้วรับเฉพาะไฟล์คำบรรยายของทุกวิดีโอ
- **SponsorBlock** — ข้ามหรือทำเครื่องหมายบทสำหรับสปอนเซอร์ อินโทร เอาต์โทร และการโปรโมตตนเอง
- **ข้อมูลกำกับที่ฝังในไฟล์** — ชื่อ วันที่อัปโหลด ช่อง คำอธิบาย ภาพปก และเครื่องหมายบท

</details>

<details>
<summary><strong>🌐 YouTube + 2000 เว็บไซต์</strong></summary>

- **รองรับ YouTube ครบถ้วน** — วิดีโอ Shorts ช่อง เพลย์ลิสต์ YouTube Music และพอดแคสต์เป็นแหล่งข้อมูลหลักทั้งหมด
- **เว็บไซต์อื่นกว่า 2000 แห่ง** ผ่าน yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable และอีกมาก
- **เฉพาะเสียงและคำบรรยาย** ใช้ได้กับทุกเว็บไซต์ที่รองรับ ไม่ใช่แค่ YouTube
- เมื่อเว็บไซต์เปลี่ยน yt-dlp จะออกการแก้ไขทุกสัปดาห์ และ Arroxy อัปเดตไบนารีอัตโนมัติเมื่อเปิดแอป

</details>

---

## <a id="install"></a>📥 การติดตั้งและเปิดใช้ครั้งแรก

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

บิลด์มีเฉพาะ x86_64 ไม่มี `curl` ใช่ไหม เปลี่ยน `curl -fsSL` เป็น `wget -qO-`

| แพลตฟอร์ม | ดาวน์โหลดโดยตรง |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**ไฟล์ทั้งหมดของรุ่น →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 การเปิดครั้งแรกบน Windows</strong></summary>

เมื่อเปิดครั้งแรก คุณอาจเห็น **"Windows protected your PC"** หรือ **"Unknown publisher"** ทั้ง `Arroxy-win-x64-Setup.exe` และ `Arroxy-win-x64-Portable.exe` เป็นเช่นนี้ Arroxy ฟรีและโอเพนซอร์ส แต่บิลด์ Windows ไม่ได้ลงนามด้วยใบรับรองแบบชำระเงิน SmartScreen จึงแจ้งเตือน ซึ่ง **ไม่ได้** หมายความว่า Arroxy ไม่ปลอดภัยโดยอัตโนมัติ หากต้องการดำเนินการต่อ:

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="กล่อง SmartScreen ข้อความ Windows protected your PC ที่เน้นลิงก์ More info" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="กล่อง SmartScreen หลังขยายข้อมูล แสดงปุ่ม Run anyway" />
</div>

1. คลิก **More info**
2. คลิก **Run anyway**

#### หาก Windows Defender แจ้งเตือนหรือลบไฟล์

การตรวจแบบฮิวริสติกของ Defender บางครั้งมองตัวติดตั้ง NSIS และแอป Electron แบบพกพาที่ไม่ได้ลงนามว่าน่าสงสัย หาก Defender กัก `Arroxy-win-x64-Setup.exe` หรือ `Arroxy-win-x64-Portable.exe` ให้กู้คืนจาก **Windows Security → Virus & threat protection → Protection history** แล้วเพิ่มไฟล์ Arroxy เป็นรายการที่อนุญาตใน **Manage settings → Add or remove exclusions** เช่นเดียวกับ SmartScreen สาเหตุคือลายเซ็นผู้เผยแพร่หายไป ไม่ใช่การตรวจพบมัลแวร์

> ดาวน์โหลด Arroxy จากหน้า GitHub Releases ทางการเท่านั้น หากได้ไฟล์จากเว็บไซต์อื่นหรือมีคนส่งมา ให้ลบแล้วดาวน์โหลดสำเนาใหม่จากแหล่งทางการ โค้ดเป็นสาธารณะ คุณจึงตรวจสอบหรือสร้าง Arroxy เองได้

ชอบ Scoop มากกว่าหรือไม่ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 การเปิดครั้งแรกบน macOS</strong></summary>

บิลด์ macOS ของ Arroxy ลงนามแบบ ad-hoc แต่ยังไม่ได้ notarize โดย Apple ดังนั้น Gatekeeper จะบล็อกครั้งแรกพร้อมข้อความ *"Arroxy.app" Not Opened — Apple could not verify "Arroxy.app" is free of malware* หมายความว่า macOS ตรวจแอปกับ Apple ไม่ได้ ไม่ใช่ว่าไฟล์เสีย การติดตั้งผ่าน Homebrew จะไม่พบกล่องนี้ หากใช้ DMG ให้ใช้คำสั่ง Terminal หนึ่งชุด:

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. ลาก `Arroxy.app` จาก DMG ที่เปิดอยู่ไปยัง `/Applications`
2. เปิด Terminal แล้วเรียกใช้สองคำสั่งนี้:

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

คำสั่งแรกนำแอตทริบิวต์กักกันที่ macOS ใส่ไว้ตอนดาวน์โหลดออก คำสั่งที่สองเปิดแอป ปกติไม่ต้องใช้ `sudo` เพราะสำเนาใน `/Applications` เป็นของคุณ — เพิ่มเฉพาะเมื่อพบข้อผิดพลาดด้านสิทธิ์

**Apple Silicon กับ Intel:** บน Mac ตระกูล M (M1 / M2 / M3 / M4) ให้ดาวน์โหลด DMG `arm64` ส่วน Mac Intel ให้ใช้ DMG `x64` บิลด์ที่ไม่ตรงยังทำงานผ่าน Rosetta ได้แต่ช้าลงอย่างเห็นได้ชัด

> บิลด์ macOS สร้างผ่าน CI บนเครื่อง Apple Silicon และ Intel หากพบปัญหา โปรด [เปิด issue](../../issues) — ความเห็นของผู้ใช้ macOS มีส่วนกำหนดรอบการทดสอบโดยตรง

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ เหตุผลที่อาจเห็นคำเตือน</strong></summary>

Arroxy เป็นโอเพนซอร์สภายใต้ MIT License บิลด์ Windows และ macOS **ไม่ได้ลงนามโค้ด** — ใบรับรอง Apple Developer ID และ Windows EV แต่ละอย่างมีค่าใช้จ่ายหลายร้อยดอลลาร์ต่อปี ซึ่งโครงการอิสระต้องออกเอง หากไม่มีลายเซ็น Windows SmartScreen และ macOS Gatekeeper จะเตือนเมื่อเปิดครั้งแรก คำเตือนหมายถึง *ระบบปฏิบัติการไม่รู้จักผู้เผยแพร่* ไม่ได้หมายความว่า Arroxy เป็นมัลแวร์

สามวิธีตรวจสอบ Arroxy ด้วยตนเอง เรียงจากง่ายไปเข้มงวด:

- **อ่านซอร์สโค้ด** ทุกบรรทัดอยู่บน [GitHub](https://github.com/antonio-orionus/Arroxy) และคุณ [สร้างจากซอร์ส](#tech) ได้
- **ตรวจ SHA256** เปรียบเทียบไฟล์กับ [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) ที่เผยแพร่ — ดู [ตรวจสอบไฟล์ดาวน์โหลด](#verify) ด้านล่าง
- **สแกนกับผู้ให้บริการภายนอก** อัปโหลดไฟล์ไปยัง [VirusTotal](https://www.virustotal.com)

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 การเปิดครั้งแรกบน Linux</strong></summary>

AppImage เรียกใช้ได้โดยตรงโดยไม่ต้องติดตั้ง เพียงกำหนดให้ไฟล์เรียกใช้ได้

**ตัวจัดการไฟล์:** คลิกขวา `.AppImage` → **Properties** → **Permissions** → เปิด **Allow executing file as program** แล้วดับเบิลคลิก

**เทอร์มินัล:**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

หากยังเปิดไม่ได้ ให้เรียกใช้โดยไม่ mount — ไม่ต้องติดตั้งแพ็กเกจ FUSE:

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**การผสานกับเดสก์ท็อปแบบเลือกได้:** ติดตั้ง [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ครั้งเดียว แล้ว AppImage ที่ดับเบิลคลิกจะลงทะเบียนในเมนูแอปอัตโนมัติ — ไม่ต้องสร้างไฟล์ `.desktop` เอง

**ไฟล์ tar ปกติ (ไม่ใช้ FUSE และไม่ติดตั้ง):**

บิลด์ `.tar.gz` คือแอปเดียวกันแต่ไม่มีตัวห่อ AppImage — แตกไฟล์ไว้ที่ใดก็ได้แล้วเรียกใช้ ไม่ต้องใช้ตัวติดตั้งหรือ FUSE

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**ไฟล์ Linux ในหน้าเผยแพร่มีเฉพาะ x86_64** บนเครื่อง ARM64 (Raspberry Pi, Asahi Linux) Flatpak ยังติดตั้งได้ แต่จะเปิดไม่สำเร็จด้วย `bwrap: execvp ldconfig: Exec format error`

</details>

<details>
<summary><strong><a id="verify"></a>🔐 ตรวจสอบไฟล์ดาวน์โหลด (SHA256)</strong></summary>

แต่ละรุ่นเผยแพร่ไฟล์ `SHA256SUMS` พร้อมไบนารี เพื่อตรวจว่าไฟล์ไม่เสียหายหรือถูกแก้ไขระหว่างส่ง ให้คำนวณแฮชในเครื่องแล้วเทียบกับบรรทัดใน `SHA256SUMS` เปิดหน้ารุ่นล่าสุด → **Assets** → ดาวน์โหลด `SHA256SUMS`

**Windows (PowerShell หรือ Command Prompt):**

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

ต้องการสแกนมัลแวร์โดยบริการภายนอกหรือไม่ อัปโหลดไฟล์ไปยัง [VirusTotal](https://www.virustotal.com) การแจ้งเตือนฮิวริสติกทั่วไปไม่กี่รายการจากเอนจินขนาดเล็กเป็นเรื่องปกติสำหรับแอป Electron ที่ไม่ได้ลงนาม แต่หากเอนจินหลักจำนวนมากตรวจพบจึงเป็นเรื่องน่ากังวลจริง

</details>

<details>
<summary><strong>📦 Windows: ตัวติดตั้งกับรุ่นพกพา</strong></summary>

|               | ตัวติดตั้ง NSIS | `.exe` แบบพกพา |
| ------------- | :----------------------: | :---------------------: |
| ต้องติดตั้ง | ใช่  | ไม่ — เรียกใช้จากที่ใดก็ได้  |
| อัปเดตอัตโนมัติ | ✅ ภายในแอป  | ❌ ดาวน์โหลดเอง  |
| ความเร็วในการเปิด | ✅ เร็วกว่า  | ⚠️ การเปิดครั้งแรกช้ากว่า  |
| เพิ่มในเมนู Start |            ✅            |           ❌            |
| ถอนการติดตั้งง่าย |            ✅            | ❌ ลบไฟล์  |

**คำแนะนำ:** ใช้ตัวติดตั้ง NSIS เพื่อรับการอัปเดตอัตโนมัติและเปิดเร็วขึ้น ใช้ `.exe` แบบพกพาหากไม่ต้องการติดตั้งหรือแก้ไขรีจิสทรี

</details>

---

## <a id="why"></a>⚖️ เหตุผลที่เลือก Arroxy

เปรียบเทียบกับทางเลือกยอดนิยมแบบหัวข้อต่อหัวข้อ:

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| เบราว์เซอร์ในตัว (เรียกดู เข้าสู่ระบบ ดาวน์โหลด) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| วิดีโอส่วนตัว เฉพาะสมาชิก และจำกัดอายุ โดยไม่ต้องส่งออกคุกกี้ |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| ฟรี ไม่มีระดับพรีเมียม |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| โอเพนซอร์ส |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| ประมวลผลในเครื่องเท่านั้น |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| ไม่จำกัดการใช้งาน |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| แอปเดสก์ท็อปข้ามแพลตฟอร์ม |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| คำบรรยาย + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = ได้บางส่วน หรือเฉพาะแพ็กเกจแบบชำระเงิน การเข้าสู่ระบบในแอปของ 4K Video Downloader สำหรับวิดีโอส่วนตัวเป็นฟีเจอร์แบบชำระเงิน ส่วน GUI ของ yt-dlp แบบฟรีส่วนใหญ่รับได้แค่ไฟล์คุกกี้ หรืออ่านคุกกี้จากเว็บเบราว์เซอร์ของคุณ

Arroxy ถูกสร้างมาเพื่อสิ่งเดียว: ไฟล์สะอาดในเครื่อง ไม่ว่าคุณจะวาง URL หรือหาวิดีโอเจอใน Explore ไม่มีการขายเพิ่ม และไม่มีการเก็บข้อมูล

### <a id="why-explore"></a>🧭 สิ่งที่ตัวครอบ yt-dlp ธรรมดาทำไม่ได้: แท็บ Explore

โปรแกรมดาวน์โหลด YouTube แบบฟรีส่วนใหญ่เป็นแค่ช่องใส่ URL ที่ครอบ yt-dlp ไว้ Arroxy ก็ใช้ yt-dlp เช่นกัน แต่ยังมี **Explore** ซึ่งเป็นเบราว์เซอร์ที่สร้างไว้ในแอปและเปิด YouTube หรือเว็บไซต์อื่นใดก็ได้ Explore ผ่านข้อจำกัดที่ช่องใส่ URL ผ่านไม่ได้:

- **วิดีโอที่ต้องใช้บัญชี โดยไม่ต้องส่งออกคุกกี้** — วิดีโอส่วนตัว เฉพาะสมาชิก และจำกัดอายุ (กับบัญชีที่ยืนยันอายุแล้ว) รวมถึงรายการดูภายหลังและวิดีโอที่ถูกใจของคุณ และวิดีโอที่ต้องเข้าสู่ระบบบนเว็บไซต์อื่น ตัวครอบธรรมดาต้องใช้ไฟล์ cookies.txt ที่ส่งออกมา หรือต้องอ่านคุกกี้จากเว็บเบราว์เซอร์ของคุณ ซึ่งตอนนี้ Chrome บน Windows บล็อกไว้แล้ว ใน Arroxy คุณแค่เข้าสู่ระบบใน Explore ครั้งเดียว ที่เหลือแอปจัดการให้
- **"ลงชื่อเข้าใช้เพื่อยืนยันว่าคุณไม่ใช่บอต"** — เมื่อ YouTube ถามแบบนี้ Arroxy จะลองดาวน์โหลดอีกครั้งด้วยการเข้าสู่ระบบ Explore ของคุณ แทนที่จะล้มเหลว
- **โทเค็นดาวน์โหลดของ YouTube** — เบราว์เซอร์ในตัวของ Arroxy รับโทเค็นที่ YouTube ต้องการก่อนการดาวน์โหลด หากไม่มีโทเค็นนี้ YouTube อาจให้รูปแบบน้อยลงและคุณภาพต่ำกว่าที่คุณขอ
- **ไม่ต้องคัดลอกลิงก์** — หาวิดีโอ เพลย์ลิสต์ หรือช่องใน Explore แล้วดาวน์โหลดได้ด้วยคลิกเดียว หรือคลิกขวาที่ลิงก์ใดก็ได้บนหน้า
- **ตัวบล็อกโฆษณาเมื่อคุณต้องการ** — คลิกที่โล่ครั้งเดียวก็บล็อกโฆษณาและตัวติดตามบนหน้าของ Explore

---

## <a id="privacy"></a>🔒 ความเป็นส่วนตัว

[yt-dlp](https://github.com/yt-dlp/yt-dlp) ดึงไฟล์ตรงจาก YouTube ไปยังโฟลเดอร์ที่คุณเลือก โดยไม่ผ่านเซิร์ฟเวอร์ภายนอก ประวัติการดูและดาวน์โหลด URL และเนื้อหาไฟล์อยู่บนอุปกรณ์ของคุณ

ไม่มีเทเลเมทรี มีเพียงสัญญาณแบบไม่ระบุตัวตนวันละครั้ง ได้แก่ รุ่นแอป ระบบปฏิบัติการ ภาษา ช่องทางการติดตั้ง และประเทศ เพื่อให้เรานับจำนวนผู้ใช้ที่ใช้งานอยู่ได้ ไม่มี ID URL ชื่อวิดีโอ พาธไฟล์ หรือข้อมูลบัญชี คุณปิดได้ในการตั้งค่า

Explore เก็บการเข้าสู่ระบบของตัวเองแยกจากเบราว์เซอร์ และ Arroxy ไม่เคยอ่านหรือกรอกแบบฟอร์มเข้าสู่ระบบ คุณพิมพ์บนหน้าของเว็บไซต์นั้นเอง การดาวน์โหลดทำงานแบบไม่เข้าสู่ระบบ เฉพาะเมื่อล้มเหลวด้วยเหตุที่บัญชีแก้ได้ Arroxy จึงอ่านข้อมูลการเข้าสู่ระบบใหม่ เก็บในไฟล์ชั่วคราวสำหรับการดาวน์โหลดนั้น แล้วลบไฟล์ทิ้งหลังจากนั้น การออกจากระบบ Explore ในการตั้งค่าจะลบข้อมูลเหล่านั้น

---

## <a id="faq"></a>❓ คำถามที่พบบ่อย

<details>
<summary><strong>ฟรีจริงหรือไม่</strong></summary>

ใช่ — MIT License ไม่มีระดับพรีเมียมและไม่ล็อกความสามารถ

</details>

<details>
<summary><strong>Arroxy ต่างจาก GUI ของ yt-dlp ตัวอื่นอย่างไร</strong></summary>

GUI ของ yt-dlp แบบฟรีส่วนใหญ่เป็นตัวครอบที่รับได้แค่ลิงก์ Arroxy เพิ่ม **Explore** ซึ่งเป็นเบราว์เซอร์ที่สร้างไว้ในแอปและเปิด YouTube หรือเว็บไซต์อื่นใดก็ได้ คุณเรียกดูและดาวน์โหลดได้โดยไม่ต้องคัดลอกลิงก์ และเข้าสู่ระบบที่นั่นเพียงครั้งเดียวเพื่อดาวน์โหลดวิดีโอส่วนตัว เฉพาะสมาชิก และจำกัดอายุ รวมถึงรายการดูภายหลังและวิดีโอที่ถูกใจของคุณ โดยไม่ต้องส่งออกคุกกี้ Arroxy ใช้การเข้าสู่ระบบนั้นเมื่อ YouTube ขอให้ยืนยันว่าคุณไม่ใช่บอต และเบราว์เซอร์ในตัวยังรับโทเค็นดาวน์โหลดของ YouTube เพื่อไม่ให้การดาวน์โหลดถูกลดเหลือรูปแบบที่น้อยลง ดู [เหตุผลที่เลือก Arroxy](#why)

</details>

<details>
<summary><strong>ดาวน์โหลดวิดีโอคุณภาพใดได้บ้าง</strong></summary>

ทุกอย่างที่ YouTube ให้บริการ: 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p รวมถึงเฉพาะเสียง สตรีม 60 fps และ HDR จะถูกเก็บตามต้นฉบับ และการดาวน์โหลดทีละขั้นให้คุณเลือก AV1, VP9 หรือ H.264 ได้ในแต่ละความละเอียด

</details>

<details>
<summary><strong>แยกเฉพาะเสียงเป็น MP3 ได้หรือไม่</strong></summary>

ได้ เลือก *เฉพาะเสียง* ในเมนูรูปแบบ แล้วเลือก MP3, M4A/AAC, Opus หรือ WAV

</details>

<details>
<summary><strong>จะดาวน์โหลดวิดีโอที่ต้องใช้บัญชี YouTube ได้อย่างไร</strong></summary>

เข้าสู่ระบบครั้งเดียวในแท็บ Explore จากนั้น Arroxy จะดาวน์โหลดวิดีโอส่วนตัวและวิดีโอเฉพาะสมาชิกที่บัญชีของคุณดูได้ วิดีโอจำกัดอายุหากบัญชียืนยันอายุแล้ว รวมถึงรายการดูภายหลังและวิดีโอที่ถูกใจของคุณได้ โดยจะใช้การเข้าสู่ระบบนี้เฉพาะเมื่อการดาวน์โหลดล้มเหลวด้วยเหตุที่บัญชีแก้ได้ ส่วนอย่างอื่นดาวน์โหลดเหมือนเดิม นี่คือตัวเลือก **การเข้าสู่ระบบ Explore** ซึ่งอยู่อันดับแรกและมีป้ายแนะนำในการตั้งค่าคุกกี้ และ Arroxy จะเลือกให้เองเมื่อคุณเปิด Explore ครั้งแรก วิกิ yt-dlp ระบุว่า [ระบบอัตโนมัติที่เข้าสู่ระบบอาจทำให้บัญชี Google ถูกทำเครื่องหมาย](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) การใช้บัญชีสำรองจึงปลอดภัยกว่า

</details>

<details>
<summary><strong>ยังใช้ได้หรือไม่เมื่อ YouTube เปลี่ยนแปลง</strong></summary>

yt-dlp อัปเดตอัตโนมัติเมื่อเปิดแอป และ Arroxy ออกการแก้ไขอย่างรวดเร็วเมื่อ YouTube เปลี่ยน เมื่อ YouTube ขอให้ยืนยันว่าคุณไม่ใช่บอต Arroxy จะลองใช้การเข้าสู่ระบบ Explore ด้วยหากคุณเข้าสู่ระบบไว้ และในการตั้งค่าคุกกี้ยังใช้คุกกี้จากไฟล์หรือเบราว์เซอร์ได้

</details>

<details>
<summary><strong>Arroxy มีภาษาใดบ้าง</strong></summary>

พร้อมใช้ 31 ภาษา: Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文 Arroxy ตรวจหาภาษาระบบปฏิบัติการในการเปิดครั้งแรกและเปลี่ยนได้ทุกเมื่อจากตัวเลือกภาษาบนแถบเครื่องมือ JSON ภาษาที่ใช้ขณะทำงานอยู่ใน src/shared/i18n/locales/ และแค็ตตาล็อก PO สำหรับผู้แปลอยู่ใน i18n/locales/ — เปิด PR บน GitHub เพื่อร่วมพัฒนา

</details>

<details>
<summary><strong>ต้องติดตั้งอย่างอื่นอีกหรือไม่</strong></summary>

ไม่ต้อง yt-dlp, ffmpeg และ ffprobe จะดาวน์โหลดอัตโนมัติเมื่อเปิดครั้งแรกและเก็บแคชในเครื่อง หลังจากนั้นไม่ต้องตั้งค่าเพิ่ม

</details>

<details>
<summary><strong>ดาวน์โหลดเพลย์ลิสต์หรือทั้งช่องได้หรือไม่</strong></summary>

ได้ทั้งสองแบบ วาง URL เพลย์ลิสต์หรือช่อง (เช่น `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`) เลือกจำนวนรายการที่จะสแกน แล้วเพิ่มทั้งรายการเข้าคิวหรือเลือกเฉพาะวิดีโอ ตัวกรองช่วงวันที่กำลังจะมา

</details>

<details>
<summary><strong>macOS บอกว่า "แอปเสียหาย" ต้องทำอย่างไร</strong></summary>

นั่นคือ macOS Gatekeeper บล็อกแอปที่ไม่ได้ลงนาม ไม่ใช่ไฟล์เสียจริง ดูคำสั่ง Terminal สำหรับล้าง quarantine และเปิด Arroxy ที่ [การเปิดครั้งแรกบน macOS](#macos-first-launch)

</details>

<details>
<summary><strong>การดาวน์โหลดวิดีโอ YouTube ถูกกฎหมายหรือไม่</strong></summary>

โดยทั่วไปการใช้ส่วนตัวแบบไม่เผยแพร่เป็นที่ยอมรับในเขตอำนาจส่วนใหญ่ คุณมีหน้าที่ปฏิบัติตาม [ข้อกำหนดในการให้บริการ](https://www.youtube.com/t/terms) ของ YouTube และกฎหมายลิขสิทธิ์ในพื้นที่

</details>

---

## <a id="roadmap"></a>🗺️ แผนพัฒนา

สิ่งที่ยังวางแผนไว้ เรียงตามลำดับความสำคัญโดยประมาณ:

| ความสามารถ    | รายละเอียด    |
| ---------------- | ---------------- |
| **ตัวกรองเพลย์ลิสต์และช่อง** | กรองช่วงวันที่เมื่ออ่านรายการจากเพลย์ลิสต์หรือช่อง |
| **การตั้งค่าภาษาแทร็กเสียง YouTube** | ตั้งภาษาพูดที่ต้องการสำหรับทั้งแอป และกำหนดต่างกันในแต่ละโปรไฟล์เมื่อ YouTube มีหลายแทร็ก |
| **การกู้คืนด้วยการลองใหม่ที่แข็งแรงขึ้น** | เส้นทางลองใหม่สำหรับงานที่ถูกขัดจังหวะโดยการเชื่อมต่ออินเทอร์เน็ตไม่เสถียรหรือมีปัญหา |
| **แผงตัวจัดการดาวน์โหลดแบบเต็ม** | ขยายแผงคิวเป็นตัวจัดการเต็มรูปแบบ รวมถึงเปลี่ยนโฟลเดอร์ปลายทางของรายการในคิว |
| **ดาวน์โหลดตามกำหนดเวลา** | เริ่มคิวตามเวลาที่กำหนด เช่น ทำงานข้ามคืน |
| **แพ็กเกจ AUR** | ติดตั้งบน Arch Linux และ Omarchy ด้วย `yay -S arroxy-bin` |

มีความสามารถที่อยากได้หรือไม่ [เปิดคำขอ](../../issues) — ความเห็นของชุมชนช่วยกำหนดลำดับความสำคัญ

---

## <a id="support"></a>💖 สนับสนุน Arroxy

Arroxy ฟรีและใช้ MIT License — ไม่มีโฆษณา ไม่มีเทเลเมทรี และไม่มีระดับแบบชำระเงิน ถ้าช่วยประหยัดเวลา คุณสนับสนุนการพัฒนาด้วย Bitcoin, Tron หรือ Ethereum ได้ ที่อยู่ระบุไว้ใน [DONATE.md](DONATE.md) ซึ่งเป็นแหล่งทางการเพียงแห่งเดียว Arroxy จะไม่ส่งที่อยู่ให้ทางอีเมลหรือข้อความส่วนตัว การกดดาวให้ repository รายงานบั๊ก และปรับปรุงคำแปลก็ช่วยได้มากเช่นกัน

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ สร้างด้วย

<details>
<summary><strong>เทคโนโลยี</strong></summary>

- **Electron** — เชลล์เดสก์ท็อปข้ามแพลตฟอร์ม
- **React 19** + **TypeScript** — ส่วนติดต่อผู้ใช้
- **Tailwind CSS v4** — การจัดรูปแบบ
- **Zustand** — การจัดการสถานะ
- **yt-dlp** + **ffmpeg** — กลไกดาวน์โหลดและ mux (ดาวน์โหลดทั้งคู่ขณะทำงาน: yt-dlp อัปเดตให้ทันสมัยเสมอ ส่วน ffmpeg/ffprobe ติดตั้งครั้งเดียวและคงอยู่หลังอัปเดต)
- **Vite** + **electron-vite** — เครื่องมือบิลด์
- **Vitest** + **Playwright** — การทดสอบหน่วยและแบบต้นทางถึงปลายทาง

</details>

<details>
<summary><strong>บิลด์จากซอร์ส</strong></summary>

### สิ่งที่ต้องมี — ทุกแพลตฟอร์ม

| เครื่องมือ | รุ่น | การติดตั้ง |
| ---------- | --- | ---------- |
| Git | ใดก็ได้ | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | `mise install` หรือ `.node-version` |
| Bun | 1.4.2 | `mise install` หรือ `package.json` `packageManager` |

แนะนำให้ติดตั้ง `mise` แล้วเรียกใช้ `mise install` ใน checkout หากไม่ใช้ mise ให้เปิดใช้ Node.js ตาม `.node-version` และ Bun ตาม `package.json` ด้วยตนเองก่อน `bun run bootstrap`

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

อาจต้องใช้ Visual Studio Build Tools และ Python เพื่อบิลด์ส่วนที่เป็น native ใหม่

### macOS

```bash
brew install mise
xcode-select --install
```

หลัง clone ให้เรียกใช้ `mise trust && mise install` ใน checkout หาก shell ใช้ `fnm`, `nvm` หรือ Bun จาก Homebrew อยู่แล้ว ให้เปิดใช้ mise ใน `~/.zshrc` เพื่อให้ Arroxy ใช้ Node.js 24.21.0 และ Bun 1.4.2:

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

# ส่วนที่ต้องใช้ในการบิลด์และ runtime ของ Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# เฉพาะการทดสอบ E2E (Electron ต้องใช้จอแสดงผล)
sudo apt install -y xvfb
```

### Clone และเรียกใช้

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # แนะนำ; ข้ามได้หากเปิดใช้รุ่นที่กำหนดไว้ด้วยตนเองแล้ว
bun run bootstrap
bun run doctor
bun run dev            # แอป Electron กับ renderer ของ Vite
```

### สร้างแพ็กเกจสำหรับเผยแพร่

```bash
bun run build        # ตรวจ type + คอมไพล์
bun run dist         # แพ็กเกจสำหรับระบบปฏิบัติการปัจจุบัน
bun run dist:win     # เป้าหมาย Windows เมื่อทำงานบนโฮสต์ที่รองรับ
```

> `bun run bootstrap` ติดตั้ง dependency, บิลด์ dependency ของแอป Electron ใหม่, ตรวจสอบ Electron, เตรียม ffmpeg/ffprobe ที่ฝังไว้สำหรับการพัฒนา และติดตั้ง Playwright Chromium ส่วนบิลด์รุ่นเผยแพร่จะจัดการ yt-dlp, ffmpeg และ ffprobe ขณะทำงานในโฟลเดอร์ข้อมูลแอป โดยไม่มีตัวใดรวมอยู่ในตัวติดตั้ง

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

## 📜 ข้อกำหนดการใช้งาน

Arroxy เป็นเครื่องมือสำหรับการใช้งานส่วนตัวแบบไม่เผยแพร่เท่านั้น คุณมีหน้าที่แต่เพียงผู้เดียวในการทำให้การดาวน์โหลดเป็นไปตาม [ข้อกำหนดในการให้บริการ](https://www.youtube.com/t/terms) ของ YouTube และกฎหมายลิขสิทธิ์ในเขตอำนาจของคุณ อย่าใช้ Arroxy ดาวน์โหลด ทำซ้ำ หรือเผยแพร่เนื้อหาที่คุณไม่มีสิทธิ์ใช้ ผู้พัฒนาไม่รับผิดชอบต่อการใช้งานในทางที่ผิด

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>MIT License · สร้างด้วยความใส่ใจโดย <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
