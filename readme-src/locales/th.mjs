const TECH_CONTENT = `<details>
<summary><strong>เทคโนโลยี</strong></summary>

- **Electron** — เชลล์เดสก์ท็อปข้ามแพลตฟอร์ม
- **React 19** + **TypeScript** — ส่วนติดต่อผู้ใช้
- **Tailwind CSS v4** — การจัดรูปแบบ
- **Zustand** — การจัดการสถานะ
- **yt-dlp** + **ffmpeg** — กลไกดาวน์โหลดและ mux (ดาวน์โหลด yt-dlp ขณะทำงาน; รวม ffmpeg/ffprobe ขณะบิลด์)
- **Vite** + **electron-vite** — เครื่องมือบิลด์
- **Vitest** + **Playwright** — การทดสอบหน่วยและแบบต้นทางถึงปลายทาง

</details>

<details>
<summary><strong>บิลด์จากซอร์ส</strong></summary>

### สิ่งที่ต้องมี — ทุกแพลตฟอร์ม

| เครื่องมือ | รุ่น | การติดตั้ง |
| ---------- | --- | ---------- |
| Git | ใดก็ได้ | [git-scm.com](https://git-scm.com) |
| Node.js | 24.16.0 | \`mise install\` หรือ \`.node-version\` |
| Bun | 1.2.23 | \`mise install\` หรือ \`package.json\` \`packageManager\` |

แนะนำให้ติดตั้ง \`mise\` แล้วเรียกใช้ \`mise install\` ใน checkout หากไม่ใช้ mise ให้เปิดใช้ Node.js ตาม \`.node-version\` และ Bun ตาม \`package.json\` ด้วยตนเองก่อน \`bun run bootstrap\`

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

อาจต้องใช้ Visual Studio Build Tools และ Python เพื่อบิลด์ส่วนที่เป็น native ใหม่

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

หลัง clone ให้เรียกใช้ \`mise trust && mise install\` ใน checkout หาก shell ใช้ \`fnm\`, \`nvm\` หรือ Bun จาก Homebrew อยู่แล้ว ให้เปิดใช้ mise ใน \`~/.zshrc\` เพื่อให้ Arroxy ใช้ Node.js 24.16.0 และ Bun 1.2.23:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# ส่วนที่ต้องใช้ในการบิลด์และ runtime ของ Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# เฉพาะการทดสอบ E2E (Electron ต้องใช้จอแสดงผล)
sudo apt install -y xvfb
\`\`\`

### Clone และเรียกใช้

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # แนะนำ; ข้ามได้หากเปิดใช้รุ่นที่กำหนดไว้ด้วยตนเองแล้ว
bun run bootstrap
bun run doctor
bun run dev            # แอป Electron กับ renderer ของ Vite
\`\`\`

### สร้างแพ็กเกจสำหรับเผยแพร่

\`\`\`bash
bun run build        # ตรวจ type + คอมไพล์
bun run dist         # แพ็กเกจสำหรับระบบปฏิบัติการปัจจุบัน
bun run dist:win     # เป้าหมาย Windows เมื่อทำงานบนโฮสต์ที่รองรับ
\`\`\`

> \`bun run bootstrap\` ติดตั้ง dependency, บิลด์ dependency ของแอป Electron ใหม่, ตรวจสอบ Electron, เตรียม ffmpeg/ffprobe ที่ฝังไว้สำหรับการพัฒนา และติดตั้ง Playwright Chromium ส่วน yt-dlp จะจัดการขณะทำงานในโฟลเดอร์ข้อมูลแอป; ffmpeg และ ffprobe รวมอยู่ใน Arroxy ทุกรุ่น

</details>`;

export const th = {
  icon_alt: "มาสคอต Arroxy",
  title: "Arroxy — โปรแกรมดาวน์โหลด YouTube (+ 2000 เว็บไซต์) ฟรีและโอเพนซอร์สสำหรับ Windows, macOS และ Linux",
  read_in_label: "อ่านในภาษา:",
  badge_release_alt: "รุ่น",
  badge_build_alt: "บิลด์",
  badge_license_alt: "สัญญาอนุญาต",
  badge_platforms_alt: "แพลตฟอร์ม",
  badge_i18n_alt: "ภาษา",
  badge_website_alt: "เว็บไซต์",
  discord_badge_text: "เข้าร่วมชุมชน Discord",
  discord_badge_encoded: "%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A3%E0%B9%88%E0%B8%A7%E0%B8%A1%20Discord",
  hero_desc: "ดาวน์โหลดวิดีโอ Shorts เพลง ช่อง พอดแคสต์ หรือแทร็กเสียงจาก **YouTube และเว็บไซต์ที่รองรับกว่า 2000 แห่ง** — สูงสุด 4K HDR ที่ 60 fps หรือเป็น MP3 / AAC / Opus ทำงานภายในเครื่องบน Windows, macOS และ Linux **ไม่มีโฆษณา ไม่มีส่วนเกิน และไม่มีการขายเพิ่ม**",
  cta_latest: "↓ ติดตั้งรุ่นล่าสุด",
  cta_website: "เว็บไซต์",
  demo_alt: "ตัวอย่าง Arroxy",
  star_cta: "ถ้า Arroxy ช่วยประหยัดเวลา การกด ⭐ จะช่วยให้คนอื่นค้นพบได้ง่ายขึ้น",
  ai_notice: "> 🌐 คำแปลนี้จัดทำโดยมี AI ช่วยเหลือ [README ภาษาอังกฤษ](README.md) คือแหล่งข้อมูลหลัก พบข้อผิดพลาดหรือไม่ [เปิด PR](../../pulls) ได้เลย",
  toc_heading: "สารบัญ",
  why_h2: "เหตุผลที่เลือก Arroxy",
  features_h2: "ความสามารถ",
  dl_h2: "การติดตั้งและเปิดใช้ครั้งแรก",
  privacy_h2: "ความเป็นส่วนตัว",
  faq_h2: "คำถามที่พบบ่อย",
  roadmap_h2: "แผนพัฒนา",
  tech_h2: "สร้างด้วย",
  why_intro: "เปรียบเทียบกับทางเลือกยอดนิยมแบบหัวข้อต่อหัวข้อ:",
  why_r1: "ฟรี ไม่มีระดับพรีเมียม",
  why_r2: "โอเพนซอร์ส",
  why_r3: "ประมวลผลในเครื่องเท่านั้น",
  why_r4: "ไม่ต้องเข้าสู่ระบบหรือส่งออกคุกกี้",
  why_r5: "ไม่จำกัดการใช้งาน",
  why_r6: "แอปเดสก์ท็อปข้ามแพลตฟอร์ม",
  why_r7: "คำบรรยาย + SponsorBlock",
  why_summary: "Arroxy ถูกสร้างมาเพื่อสิ่งเดียว: วาง URL แล้วรับไฟล์สะอาดในเครื่อง ไม่มีบัญชี ไม่มีการขายเพิ่ม และไม่มีการเก็บข้อมูล",
  feat_quality_h3: "คุณภาพและรูปแบบ",
  feat_quality_1: "สูงสุด **4K UHD (2160p)** รวมถึง 1440p, 1080p, 720p, 480p และ 360p",
  feat_quality_2: "คง **อัตราเฟรมสูง** ไว้ตามต้นฉบับ — 60 fps, 120 fps และ HDR",
  feat_quality_3: "**เสียง** — ส่งออกเฉพาะเสียงเป็น MP3, M4A/AAC, Opus หรือ WAV ในการดาวน์โหลดแบบโต้ตอบ คุณเลือกแทร็ก surround/Dolby ดั้งเดิมของต้นทาง (AC-3, E-AC-3, 5.1, DRC) ได้เมื่อมี หรือกำหนดค่าเริ่มต้นส่วนกลางเป็น **เน้น surround / Dolby**",
  feat_quality_4: "ค่าล่วงหน้าด่วน: *คุณภาพดีที่สุด* · *สมดุล* · *ไฟล์เล็ก*",
  feat_privacy_h3: "ความเป็นส่วนตัวและการควบคุม",
  feat_privacy_1: "ประมวลผลภายในเครื่อง 100% — ดาวน์โหลดตรงจาก YouTube ลงดิสก์ของคุณ",
  feat_privacy_2: "**โอเพนซอร์ส** — ตรวจสอบโค้ดได้ทุกบรรทัด ภายใต้ MIT License",
  feat_privacy_3: "บันทึกไฟล์ตรงไปยังโฟลเดอร์ที่คุณเลือก",
  feat_workflow_h3: "ขั้นตอนการทำงาน",
  feat_workflow_12: "**ปุ่มลัดดาวน์โหลดทั่วระบบ** — คัดลอกลิงก์ในแอปใดก็ได้แล้วกด `Ctrl+Shift+D` (`Cmd+Shift+D` บน macOS); Arroxy จะเพิ่มเข้าคิวด้วยโปรไฟล์ที่ใช้งานอยู่โดยไม่เปิดหน้าต่าง พร้อมแจ้งเตือนยืนยัน เปิดใช้โดยค่าเริ่มต้นและเปลี่ยนปุ่มได้",
  feat_workflow_1: "**วิธีเริ่มที่ยืดหยุ่น** — เลือกดาวน์โหลดไฟล์เดียวแบบมีตัวช่วย ตัวเลือกเพลย์ลิสต์/ช่อง วาง URL จำนวนมาก หรือดาวน์โหลดด่วนด้วยค่าเริ่มต้นที่บันทึกไว้",
  feat_workflow_2: "**คิวดาวน์โหลดส่วนกลาง** — งานเดี่ยว เพลย์ลิสต์ แบบกลุ่ม และแบบด่วนอยู่ในที่เดียวสำหรับดูความคืบหน้า หยุดชั่วคราว ทำต่อ ยกเลิก ลองใหม่ และกำหนดลำดับความสำคัญ",
  feat_workflow_3: "**เฝ้าดูคลิปบอร์ด** — คัดลอกลิงก์ YouTube แล้ว Arroxy จะกรอก URL ให้อัตโนมัติเมื่อคุณกลับมาโฟกัสแอป (เปิดปิดได้ในการตั้งค่าขั้นสูง)",
  feat_workflow_4: "**ล้าง URL อัตโนมัติ** — ตัดพารามิเตอร์ติดตาม (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) และแกะลิงก์ `youtube.com/redirect`",
  feat_workflow_5: "**โหมดถาดระบบ** — ปิดหน้าต่างแล้วการดาวน์โหลดยังทำงานเบื้องหลัง",
  feat_workflow_6: "**{{LANG_COUNT}} ภาษา** — ตรวจหาภาษาระบบอัตโนมัติและเปลี่ยนได้ทุกเมื่อ",
  feat_workflow_7: "**ซิงก์เพลย์ลิสต์** — สแกนเพลย์ลิสต์เทียบกับโฟลเดอร์ในเครื่องอีกครั้งเพื่อข้ามวิดีโอที่ดาวน์โหลดแล้ว พร้อมสร้างไฟล์เพลย์ลิสต์ `.m3u` ที่อัปเดตเมื่อดาวน์โหลดแต่ละวิดีโอ",
  feat_workflow_8: "**ควบคุมความเร็วและจังหวะ** — จำกัดแบนด์วิดท์ กำหนดจำนวนส่วนของวิดีโอที่ดาวน์โหลดพร้อมกัน และหน่วงคำขอด้วยค่าล่วงหน้า (*ปิด · สมดุล · ระมัดระวัง · กำหนดเอง*)",
  feat_workflow_9: "**แม่แบบชื่อไฟล์** — ตั้งชื่อด้วย `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` และ `{playlist_index}` ได้ทั้งส่วนกลางหรือแยกตามโปรไฟล์",
  feat_workflow_10: "**ดาวน์โหลดพร้อมกันและลองใหม่อัตโนมัติ** — เลือกจำนวนงานในคิวที่ทำพร้อมกัน และให้ Arroxy ลองงานที่พบปัญหาเครือข่ายหรือเซิร์ฟเวอร์ใหม่ โดยรอนานขึ้นในแต่ละครั้ง",
  feat_workflow_11: "**โปรไฟล์แยกสำหรับแต่ละรายการในเพลย์ลิสต์** — กำหนดโปรไฟล์ให้แต่ละวิดีโอแทนการใช้ค่าเดียวทั้งรายการ จึงเก็บบางรายการเต็มคุณภาพและดาวน์โหลดที่เหลือเป็น MP3 ได้ในรอบเดียว",
  feat_post_h3: "คำบรรยายและการประมวลผลภายหลัง",
  feat_post_1: "**คำบรรยาย** แบบ SRT, VTT หรือ ASS — แบบทำเองหรือสร้างอัตโนมัติ ในทุกภาษาที่มี",
  feat_post_2: "บันทึกข้างวิดีโอ ฝังใน `.mkv` หรือจัดไว้ในโฟลเดอร์ย่อย `Subtitles/`",
  feat_post_3: "**SponsorBlock** — ข้ามหรือทำเครื่องหมายบทสำหรับสปอนเซอร์ อินโทร เอาต์โทร และการโปรโมตตนเอง",
  feat_post_4: "**ข้อมูลกำกับที่ฝังในไฟล์** — ชื่อ วันที่อัปโหลด ช่อง คำอธิบาย ภาพปก และเครื่องหมายบท",
  feat_sites_h3: "YouTube + 2000 เว็บไซต์",
  feat_sites_1: "**รองรับ YouTube ครบถ้วน** — วิดีโอ Shorts ช่อง เพลย์ลิสต์ YouTube Music และพอดแคสต์เป็นแหล่งข้อมูลหลักทั้งหมด",
  feat_sites_2: "**เว็บไซต์อื่นกว่า 2000 แห่ง** ผ่าน yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org และอีกมาก",
  feat_sites_3: "**เฉพาะเสียงและคำบรรยาย** ใช้ได้กับทุกเว็บไซต์ที่รองรับ ไม่ใช่แค่ YouTube",
  feat_sites_4: "เมื่อเว็บไซต์เปลี่ยน yt-dlp จะออกการแก้ไขทุกสัปดาห์ และ Arroxy อัปเดตไบนารีอัตโนมัติเมื่อเปิดแอป",
  shot1_cap: "<b>หน้าดาวน์โหลดด่วน</b><br/>วาง URL แล้วดาวน์โหลดทันทีด้วยโปรไฟล์ที่ใช้งานอยู่",
  shot2_cap: "<b>โปรไฟล์ดาวน์โหลดที่ใช้ซ้ำได้</b><br/>บันทึกรูปแบบ คุณภาพ และปลายทาง แล้วใช้ซ้ำในแต่ละงาน",
  shot3_cap: "<b>แทร็กเสียงหลายภาษา</b><br/>เลือกภาษาเสียงที่มากับวิดีโอได้อย่างแม่นยำ",
  shot4_cap: "<b>เสียง surround / Dolby</b><br/>ตรวจพบและเก็บแทร็ก 5.1 กับ Dolby ไว้",
  shot5_cap: "<b>โหมด URL จำนวนมาก</b><br/>วางรายการ ลบรายการซ้ำอัตโนมัติ แล้วเพิ่มทั้งหมดเข้าคิว",
  shot6_cap: "<b>คิวดาวน์โหลดแบบขนาน</b><br/>ดาวน์โหลดหลายงานพร้อมกันพร้อมความคืบหน้าแบบสด",
  hotkey_fig_alt: "ปุ่มลัดดาวน์โหลดทั่วระบบของ Arroxy — Ctrl+Shift+D บน Windows และ Linux, Cmd+Shift+D บน macOS เพื่อส่งลิงก์ที่คัดลอกเข้าคิวโดยตรง",
  hotkey_fig_cap: "<b>ปุ่มลัดดาวน์โหลดทั่วระบบ</b><br/>คัดลอกลิงก์ที่ไหนก็ได้ กดครั้งเดียว แล้วลิงก์จะเข้าคิวและเริ่มดาวน์โหลด",
  shot7_cap: "<b>โปรไฟล์แยกต่อรายการเพลย์ลิสต์</b><br/>ให้แต่ละวิดีโอใช้โปรไฟล์ของตัวเอง — เก็บบางรายการเป็น 4K และที่เหลือเป็น MP3",
  dl_platform_col: "แพลตฟอร์ม",
  dl_format_col: "ดาวน์โหลดโดยตรง",
  dl_oneline_note: "สคริปต์ Linux ตรวจสอบไฟล์กับ `SHA256SUMS` ที่เผยแพร่และเพิ่ม Arroxy ลงในเมนูแอปพลิเคชัน บิลด์มีเฉพาะ x86_64 ไม่มี `curl` ใช่ไหม เปลี่ยน `curl -fsSL` เป็น `wget -qO-`",
  dl_win_scoop: "ชอบ Scoop มากกว่าหรือไม่ `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
  dl_grab: "ไฟล์ทั้งหมดของรุ่น →",
  dl_win_h3: "Windows: ตัวติดตั้งกับรุ่นพกพา",
  dl_win_col_installer: "ตัวติดตั้ง NSIS",
  dl_win_col_portable: "`.exe` แบบพกพา",
  dl_win_r1: "ต้องติดตั้ง",
  dl_win_r1_installer: "ใช่",
  dl_win_r1_portable: "ไม่ — เรียกใช้จากที่ใดก็ได้",
  dl_win_r2: "อัปเดตอัตโนมัติ",
  dl_win_r2_installer: "✅ ภายในแอป",
  dl_win_r2_portable: "❌ ดาวน์โหลดเอง",
  dl_win_r3: "ความเร็วในการเปิด",
  dl_win_r3_installer: "✅ เร็วกว่า",
  dl_win_r3_portable: "⚠️ การเปิดครั้งแรกช้ากว่า",
  dl_win_r4: "เพิ่มในเมนู Start",
  dl_win_r5: "ถอนการติดตั้งง่าย",
  dl_win_r5_portable: "❌ ลบไฟล์",
  dl_win_rec: "**คำแนะนำ:** ใช้ตัวติดตั้ง NSIS เพื่อรับการอัปเดตอัตโนมัติและเปิดเร็วขึ้น ใช้ `.exe` แบบพกพาหากไม่ต้องการติดตั้งหรือแก้ไขรีจิสทรี",
  dl_win_smartscreen_intro: "เมื่อเปิดครั้งแรก คุณอาจเห็น **\"Windows protected your PC\"** หรือ **\"Unknown publisher\"** ทั้ง `Arroxy-win-x64-Setup.exe` และ `Arroxy-win-x64-Portable.exe` เป็นเช่นนี้ Arroxy ฟรีและโอเพนซอร์ส แต่บิลด์ Windows ไม่ได้ลงนามด้วยใบรับรองแบบชำระเงิน SmartScreen จึงแจ้งเตือน ซึ่ง **ไม่ได้** หมายความว่า Arroxy ไม่ปลอดภัยโดยอัตโนมัติ หากต้องการดำเนินการต่อ:",
  dl_win_smartscreen_step1: "คลิก **More info**",
  dl_win_smartscreen_step2: "คลิก **Run anyway**",
  dl_win_smartscreen_official: "ดาวน์โหลด Arroxy จากหน้า GitHub Releases ทางการเท่านั้น หากได้ไฟล์จากเว็บไซต์อื่นหรือมีคนส่งมา ให้ลบแล้วดาวน์โหลดสำเนาใหม่จากแหล่งทางการ โค้ดเป็นสาธารณะ คุณจึงตรวจสอบหรือสร้าง Arroxy เองได้",
  dl_macos_note: "บิลด์ macOS สร้างผ่าน CI บนเครื่อง Apple Silicon และ Intel หากพบปัญหา โปรด [เปิด issue](../../issues) — ความเห็นของผู้ใช้ macOS มีส่วนกำหนดรอบการทดสอบโดยตรง",
  dl_linux_intro: "AppImage เรียกใช้ได้โดยตรงโดยไม่ต้องติดตั้ง เพียงกำหนดให้ไฟล์เรียกใช้ได้",
  dl_linux_m1_text: "**ตัวจัดการไฟล์:** คลิกขวา `.AppImage` → **Properties** → **Permissions** → เปิด **Allow executing file as program** แล้วดับเบิลคลิก",
  dl_linux_m2_h4: "เทอร์มินัล:",
  dl_linux_fuse_text: "หากยังเปิดไม่ได้ ให้เรียกใช้โดยไม่ mount — ไม่ต้องติดตั้งแพ็กเกจ FUSE:",
  dl_linux_targz_h4: "ไฟล์ tar ปกติ (ไม่ใช้ FUSE และไม่ติดตั้ง):",
  dl_linux_targz_text: "บิลด์ `.tar.gz` คือแอปเดียวกันแต่ไม่มีตัวห่อ AppImage — แตกไฟล์ไว้ที่ใดก็ได้แล้วเรียกใช้ ไม่ต้องใช้ตัวติดตั้งหรือ FUSE",
  dl_linux_flatpak_prereq: "Ubuntu มาพร้อม Snap แทน Flatpak จึงต้องติดตั้ง Flatpak และเพิ่ม Flathub ก่อน แพ็กเกจจะดึง runtime จากที่นั่น:",
  dl_linux_arch_note: "**ไฟล์ Linux ในหน้าเผยแพร่มีเฉพาะ x86_64** บนเครื่อง ARM64 (Raspberry Pi, Asahi Linux) Flatpak ยังติดตั้งได้ แต่จะเปิดไม่สำเร็จด้วย `bwrap: execvp ldconfig: Exec format error`",
  dl_linux_flatpak_intro: "**Flatpak (ทางเลือกแบบ sandbox):** ดาวน์โหลด `Arroxy-linux-x64.flatpak` จากหน้าเผยแพร่เดียวกัน",
  dl_warning_h3: "เหตุผลที่อาจเห็นคำเตือน",
  dl_warning_p1: "Arroxy เป็นโอเพนซอร์สภายใต้ MIT License บิลด์ Windows และ macOS **ไม่ได้ลงนามโค้ด** — ใบรับรอง Apple Developer ID และ Windows EV แต่ละอย่างมีค่าใช้จ่ายหลายร้อยดอลลาร์ต่อปี ซึ่งโครงการอิสระต้องออกเอง หากไม่มีลายเซ็น Windows SmartScreen และ macOS Gatekeeper จะเตือนเมื่อเปิดครั้งแรก คำเตือนหมายถึง *ระบบปฏิบัติการไม่รู้จักผู้เผยแพร่* ไม่ได้หมายความว่า Arroxy เป็นมัลแวร์",
  dl_warning_p2: "สามวิธีตรวจสอบ Arroxy ด้วยตนเอง เรียงจากง่ายไปเข้มงวด:\n\n- **อ่านซอร์สโค้ด** ทุกบรรทัดอยู่บน [GitHub](https://github.com/antonio-orionus/Arroxy) และคุณ [สร้างจากซอร์ส](#tech) ได้\n- **ตรวจ SHA256** เปรียบเทียบไฟล์กับ [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) ที่เผยแพร่ — ดู [ตรวจสอบไฟล์ดาวน์โหลด](#verify) ด้านล่าง\n- **สแกนกับผู้ให้บริการภายนอก** อัปโหลดไฟล์ไปยัง [VirusTotal](https://www.virustotal.com)",
  dl_win_first_h3: "การเปิดครั้งแรกบน Windows",
  shot_smartscreen_more_alt: "กล่อง SmartScreen ข้อความ Windows protected your PC ที่เน้นลิงก์ More info",
  shot_smartscreen_run_alt: "กล่อง SmartScreen หลังขยายข้อมูล แสดงปุ่ม Run anyway",
  dl_win_defender_h4: "หาก Windows Defender แจ้งเตือนหรือลบไฟล์",
  dl_win_defender_p: "การตรวจแบบฮิวริสติกของ Defender บางครั้งมองตัวติดตั้ง NSIS และแอป Electron แบบพกพาที่ไม่ได้ลงนามว่าน่าสงสัย หาก Defender กัก `Arroxy-win-x64-Setup.exe` หรือ `Arroxy-win-x64-Portable.exe` ให้กู้คืนจาก **Windows Security → Virus & threat protection → Protection history** แล้วเพิ่มไฟล์ Arroxy เป็นรายการที่อนุญาตใน **Manage settings → Add or remove exclusions** เช่นเดียวกับ SmartScreen สาเหตุคือลายเซ็นผู้เผยแพร่หายไป ไม่ใช่การตรวจพบมัลแวร์",
  dl_macos_first_h3: "การเปิดครั้งแรกบน macOS",
  dl_macos_intro: "บิลด์ macOS ของ Arroxy ลงนามแบบ ad-hoc แต่ยังไม่ได้ notarize โดย Apple ดังนั้น Gatekeeper จะบล็อกครั้งแรกพร้อมข้อความ *\"Arroxy.app\" Not Opened — Apple could not verify \"Arroxy.app\" is free of malware* หมายความว่า macOS ตรวจแอปกับ Apple ไม่ได้ ไม่ใช่ว่าไฟล์เสีย การติดตั้งผ่าน Homebrew จะไม่พบกล่องนี้ หากใช้ DMG ให้ใช้คำสั่ง Terminal หนึ่งชุด:",
  dl_macos_sequoia_step1: "ลาก `Arroxy.app` จาก DMG ที่เปิดอยู่ไปยัง `/Applications`",
  dl_macos_sequoia_step2: "เปิด Terminal แล้วเรียกใช้สองคำสั่งนี้:",
  dl_macos_damaged_p: "คำสั่งแรกนำแอตทริบิวต์กักกันที่ macOS ใส่ไว้ตอนดาวน์โหลดออก คำสั่งที่สองเปิดแอป ปกติไม่ต้องใช้ `sudo` เพราะสำเนาใน `/Applications` เป็นของคุณ — เพิ่มเฉพาะเมื่อพบข้อผิดพลาดด้านสิทธิ์",
  dl_macos_arch_note: "**Apple Silicon กับ Intel:** บน Mac ตระกูล M (M1 / M2 / M3 / M4) ให้ดาวน์โหลด DMG `arm64` ส่วน Mac Intel ให้ใช้ DMG `x64` บิลด์ที่ไม่ตรงยังทำงานผ่าน Rosetta ได้แต่ช้าลงอย่างเห็นได้ชัด",
  dl_linux_first_h3: "การเปิดครั้งแรกบน Linux",
  dl_linux_appimagelauncher: "**การผสานกับเดสก์ท็อปแบบเลือกได้:** ติดตั้ง [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) ครั้งเดียว แล้ว AppImage ที่ดับเบิลคลิกจะลงทะเบียนในเมนูแอปอัตโนมัติ — ไม่ต้องสร้างไฟล์ `.desktop` เอง",
  dl_verify_h3: "ตรวจสอบไฟล์ดาวน์โหลด (SHA256)",
  dl_verify_intro: "แต่ละรุ่นเผยแพร่ไฟล์ `SHA256SUMS` พร้อมไบนารี เพื่อตรวจว่าไฟล์ไม่เสียหายหรือถูกแก้ไขระหว่างส่ง ให้คำนวณแฮชในเครื่องแล้วเทียบกับบรรทัดใน `SHA256SUMS` เปิดหน้ารุ่นล่าสุด → **Assets** → ดาวน์โหลด `SHA256SUMS`",
  dl_verify_win_label: "Windows (PowerShell หรือ Command Prompt):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text: "ต้องการสแกนมัลแวร์โดยบริการภายนอกหรือไม่ อัปโหลดไฟล์ไปยัง [VirusTotal](https://www.virustotal.com) การแจ้งเตือนฮิวริสติกทั่วไปไม่กี่รายการจากเอนจินขนาดเล็กเป็นเรื่องปกติสำหรับแอป Electron ที่ไม่ได้ลงนาม แต่หากเอนจินหลักจำนวนมากตรวจพบจึงเป็นเรื่องน่ากังวลจริง",
  privacy_p1: "[yt-dlp](https://github.com/yt-dlp/yt-dlp) ดึงไฟล์ตรงจาก YouTube ไปยังโฟลเดอร์ที่คุณเลือก โดยไม่ผ่านเซิร์ฟเวอร์ภายนอก ประวัติการดูและดาวน์โหลด URL และเนื้อหาไฟล์อยู่บนอุปกรณ์ของคุณ",
  privacy_p2: "Arroxy ส่งข้อมูลสถิติแบบไม่ระบุตัวตนและรวมกลุ่มผ่าน [OpenPanel](https://openpanel.dev) เท่าที่โครงการอิสระต้องใช้เพื่อเข้าใจข้อผิดพลาด การหยุดทำงาน ความเห็น ระบบปฏิบัติการ และรุ่นแอป ไม่มี URL ชื่อวิดีโอ พาธไฟล์ ข้อมูลบัญชี ลายนิ้วมือ หรือข้อมูลส่วนบุคคล รหัสต่อการติดตั้งเป็นแบบสุ่มและไม่ผูกกับตัวตน คุณปิดได้ในการตั้งค่า",
  faq_q1: "ฟรีจริงหรือไม่",
  faq_a1: "ใช่ — MIT License ไม่มีระดับพรีเมียมและไม่ล็อกความสามารถ",
  faq_q2: "ดาวน์โหลดวิดีโอคุณภาพใดได้บ้าง",
  faq_a2: "ทุกอย่างที่ YouTube ให้บริการ: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p รวมถึงเฉพาะเสียง สตรีม 60 fps, 120 fps และ HDR จะถูกเก็บตามต้นฉบับ",
  faq_q3: "แยกเฉพาะเสียงเป็น MP3 ได้หรือไม่",
  faq_a3: "ได้ เลือก *เฉพาะเสียง* ในเมนูรูปแบบ แล้วเลือก MP3, M4A/AAC, Opus หรือ WAV",
  faq_q4: "ต้องมีบัญชี YouTube หรือคุกกี้หรือไม่",
  faq_a4: "โดยค่าเริ่มต้นไม่ต้อง — Arroxy ทำงานโดยไม่มีบัญชี YouTube การเข้าสู่ระบบ หรือการส่งออกคุกกี้ มีการรองรับคุกกี้แบบเลือกได้ในการตั้งค่าขั้นสูง (แหล่งคุกกี้: ไฟล์หรือเบราว์เซอร์) สำหรับเนื้อหาที่ต้องยืนยันตัวตน เช่น จำกัดอายุหรือสมาชิกเท่านั้น และปิดไว้โดยค่าเริ่มต้น หากเปิดใช้ วิกิ yt-dlp ระบุว่า [ระบบอัตโนมัติที่ใช้คุกกี้อาจทำให้บัญชี Google ถูกทำเครื่องหมาย](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); การใช้บัญชีสำรองจึงปลอดภัยกว่า",
  faq_q5: "ยังใช้ได้หรือไม่เมื่อ YouTube เปลี่ยนแปลง",
  faq_a5: "yt-dlp อัปเดตอัตโนมัติเมื่อเปิดแอป และ Arroxy ออกการแก้ไขอย่างรวดเร็วเมื่อ YouTube เปลี่ยน หากยังพบปัญหา คุณใช้การรองรับคุกกี้แบบเลือกได้ในการตั้งค่าขั้นสูงเป็นทางสำรองได้",
  faq_q6: "Arroxy มีภาษาใดบ้าง",
  faq_a6: "พร้อมใช้ {{LANG_COUNT}} ภาษา: {{LANG_NAME_LIST}} Arroxy ตรวจหาภาษาระบบปฏิบัติการในการเปิดครั้งแรกและเปลี่ยนได้ทุกเมื่อจากตัวเลือกภาษาบนแถบเครื่องมือ JSON ภาษาที่ใช้ขณะทำงานอยู่ใน src/shared/i18n/locales/ และแค็ตตาล็อก PO สำหรับผู้แปลอยู่ใน i18n/locales/ — เปิด PR บน GitHub เพื่อร่วมพัฒนา",
  faq_q7: "ต้องติดตั้งอย่างอื่นอีกหรือไม่",
  faq_a7: "ไม่ต้อง yt-dlp จะดาวน์โหลดอัตโนมัติเมื่อเปิดครั้งแรกและเก็บแคชในเครื่อง ส่วน ffmpeg และ ffprobe มากับแอป หลังจากนั้นไม่ต้องตั้งค่าเพิ่ม",
  faq_q8: "ดาวน์โหลดเพลย์ลิสต์หรือทั้งช่องได้หรือไม่",
  faq_a8: "ได้ทั้งสองแบบ วาง URL เพลย์ลิสต์หรือช่อง (เช่น `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`) เลือกจำนวนรายการที่จะสแกน แล้วเพิ่มทั้งรายการเข้าคิวหรือเลือกเฉพาะวิดีโอ ตัวกรองช่วงวันที่กำลังจะมา",
  faq_q9: "macOS บอกว่า \"แอปเสียหาย\" ต้องทำอย่างไร",
  faq_a9: "นั่นคือ macOS Gatekeeper บล็อกแอปที่ไม่ได้ลงนาม ไม่ใช่ไฟล์เสียจริง ดูคำสั่ง Terminal สำหรับล้าง quarantine และเปิด Arroxy ที่ [การเปิดครั้งแรกบน macOS](#macos-first-launch)",
  faq_q10: "การดาวน์โหลดวิดีโอ YouTube ถูกกฎหมายหรือไม่",
  faq_a10: "โดยทั่วไปการใช้ส่วนตัวแบบไม่เผยแพร่เป็นที่ยอมรับในเขตอำนาจส่วนใหญ่ คุณมีหน้าที่ปฏิบัติตาม [ข้อกำหนดในการให้บริการ](https://www.youtube.com/t/terms) ของ YouTube และกฎหมายลิขสิทธิ์ในพื้นที่",
  plan_intro: "สิ่งที่ยังวางแผนไว้ เรียงตามลำดับความสำคัญโดยประมาณ:",
  plan_col1: "ความสามารถ",
  plan_col2: "รายละเอียด",
  plan_r1_name: "**ตัวกรองเพลย์ลิสต์และช่อง**",
  plan_r1_desc: "กรองช่วงวันที่เมื่ออ่านรายการจากเพลย์ลิสต์หรือช่อง",
  plan_r2_name: "**การตั้งค่าภาษาแทร็กเสียง YouTube**",
  plan_r2_desc: "ตั้งภาษาพูดที่ต้องการสำหรับทั้งแอป และกำหนดต่างกันในแต่ละโปรไฟล์เมื่อ YouTube มีหลายแทร็ก",
  plan_r6_name: "**เข้าสู่ระบบด้วยเบราว์เซอร์ในแอป**",
  plan_r6_desc: "เปิดหน้าต่างเบราว์เซอร์ภายใน Arroxy เพื่อเข้าสู่ระบบและใช้คุกกี้ของเว็บไซต์โดยไม่ต้องส่งออกเอง",
  plan_r8_name: "**ดาวน์โหลดวิดีโอด้วยคลิกเดียว**",
  plan_r8_desc: "เริ่มดาวน์โหลด URL ที่ตรวจพบหรือวางไว้ด้วยโปรไฟล์ที่ใช้งานอยู่ในคลิกเดียว",
  plan_r3_name: "**การกู้คืนด้วยการลองใหม่ที่แข็งแรงขึ้น**",
  plan_r3_desc: "เส้นทางลองใหม่สำหรับงานที่ถูกขัดจังหวะโดยการเชื่อมต่ออินเทอร์เน็ตไม่เสถียรหรือมีปัญหา",
  plan_r4_name: "**แผงตัวจัดการดาวน์โหลดแบบเต็ม**",
  plan_r4_desc: "ขยายแผงคิวเป็นตัวจัดการเต็มรูปแบบ รวมถึงเปลี่ยนโฟลเดอร์ปลายทางของรายการในคิว",
  plan_r5_name: "**ดาวน์โหลดตามกำหนดเวลา**",
  plan_r5_desc: "เริ่มคิวตามเวลาที่กำหนด เช่น ทำงานข้ามคืน",
  plan_r7_name: "**ตัดช่วงคลิป**",
  plan_r7_desc: "ดาวน์โหลดเฉพาะช่วงโดยกำหนดเวลาเริ่มและสิ้นสุด",
  plan_cta: "มีความสามารถที่อยากได้หรือไม่ [เปิดคำขอ](../../issues) — ความเห็นของชุมชนช่วยกำหนดลำดับความสำคัญ",
  dl_win_format: "ตัวติดตั้ง (NSIS) หรือ `.exe` แบบพกพา",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` หรือ `.flatpak` (sandbox)",
  dl_pkg_h3: "ติดตั้งผ่านตัวจัดการแพ็กเกจ",
  dl_channel_col: "ช่องทาง",
  dl_command_col: "คำสั่ง",
  dl_win_smartscreen_h4: "คำเตือน Windows SmartScreen",
  dl_macos_h3: "การเปิดครั้งแรกบน macOS",
  dl_macos_warning: "Arroxy ยังไม่ได้ลงนามโค้ด ดังนั้น macOS Gatekeeper อาจแสดงคำเตือนว่าแอปเสียหายเมื่อเปิดครั้งแรก ซึ่งเป็นสิ่งที่คาดไว้และไม่ได้หมายความว่าไฟล์เสียจริง",
  dl_macos_m1_h4: "วิธีใช้ Terminal:",
  dl_macos_step1: "ลาก `Arroxy.app` จาก DMG ที่เปิดอยู่ไปยัง `/Applications`",
  dl_macos_step2: "เปิด Terminal แล้วเรียกใช้ `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`",
  dl_macos_step3: "เรียกใช้ `open /Applications/Arroxy.app`",
  dl_macos_step4: "หากพาธแอปต่างออกไป ให้แทน `/Applications/Arroxy.app` ด้วยพาธที่ติดตั้ง",
  dl_macos_step5: "ป้อนรหัสผ่าน Mac หาก `sudo` ร้องขอ",
  dl_macos_after: "เมื่อนำ quarantine ออกแล้ว Arroxy จะเปิดได้ตามปกติ",
  dl_macos_m2_h4: "วิธีใช้ Terminal:",
  dl_linux_h3: "การเปิดครั้งแรกบน Linux",
  dl_macos_sequoia_h4: "แก้ไขผ่าน Terminal สำหรับ macOS ปัจจุบัน",
  dl_macos_sequoia_intro: "ใช้ Terminal หลังคัดลอก Arroxy ไปยัง Applications:",
  dl_macos_sequoia_step3: "เรียกใช้ `open /Applications/Arroxy.app` เพื่อเปิด Arroxy",
  dl_macos_sequoia_step4: "หากพาธแอปต่างออกไป ให้แทน `/Applications/Arroxy.app` ด้วยพาธที่ติดตั้ง",
  dl_macos_sonoma_h4: "แก้ไขผ่าน Terminal สำหรับ macOS รุ่นเก่า",
  dl_macos_sonoma_step1: "ลาก `Arroxy.app` จาก DMG ที่เปิดอยู่ไปยัง `/Applications`",
  dl_macos_sonoma_step2: "เปิด Terminal แล้วนำ quarantine ออกจาก `/Applications/Arroxy.app`",
  dl_macos_sonoma_step3: "เปิด Arroxy จาก Terminal หรือ Finder หลังนำ quarantine ออก",
  dl_macos_damaged_h4: "แก้ไข quarantine ของ Gatekeeper",
  dl_pm_intro: "ใช้ตัวจัดการแพ็กเกจอยู่แล้วหรือไม่ คุณข้ามการดาวน์โหลดด้วยตนเองได้",
  tech_content: TECH_CONTENT,
  support_h2: "สนับสนุน Arroxy",
  support_note: "Arroxy ฟรีและใช้ MIT License — ไม่มีโฆษณาหรือระดับแบบชำระเงิน ถ้าช่วยประหยัดเวลา คุณสนับสนุนการพัฒนาด้วย Bitcoin หรือ Tron ได้ ที่อยู่ระบุไว้ใน [DONATE.md](DONATE.md) ซึ่งเป็นแหล่งทางการเพียงแห่งเดียว Arroxy จะไม่ส่งที่อยู่ให้ทางอีเมลหรือข้อความส่วนตัว การกดดาวให้ repository รายงานบั๊ก และปรับปรุงคำแปลก็ช่วยได้มากเช่นกัน",
  tos_h2: "ข้อกำหนดการใช้งาน",
  tos_note: "Arroxy เป็นเครื่องมือสำหรับการใช้งานส่วนตัวแบบไม่เผยแพร่เท่านั้น คุณมีหน้าที่แต่เพียงผู้เดียวในการทำให้การดาวน์โหลดเป็นไปตาม [ข้อกำหนดในการให้บริการ](https://www.youtube.com/t/terms) ของ YouTube และกฎหมายลิขสิทธิ์ในเขตอำนาจของคุณ อย่าใช้ Arroxy ดาวน์โหลด ทำซ้ำ หรือเผยแพร่เนื้อหาที่คุณไม่มีสิทธิ์ใช้ ผู้พัฒนาไม่รับผิดชอบต่อการใช้งานในทางที่ผิด",
  footer_credit: 'MIT License · สร้างด้วยความใส่ใจโดย <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
