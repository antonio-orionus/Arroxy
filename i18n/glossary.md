# Translator glossary

The release translation sync hands this file to every translator (`dev-docs/release-runbook.md`, step 0). Use these terms and this register; when a batch introduces a new product term, add it here in the same sync PR.

## Product terms

- **Arroxy**: never translated or transliterated.
- **download engine**: what the app calls yt-dlp. Where the English says "download engine", the translation uses the term below, never "yt-dlp".
- **Explore**: the in-app browser tab. A name: use the locale's term below every time, never the English word.
- **profile** / **download profile**: a saved set of download settings.
- **queue**: the list of downloads waiting or running.
- **Original** (a tag on an audio track): the track in the video's own language, as opposed to a dub or an audio description. Translate the adjective as said of an audio track or language, never "original file" or "authentic".
- Format and codec names (MP4, H.264, SponsorBlock, FFmpeg) stay as written.
- **YouTube list names** (**Watch later**, **Mix**, **liked videos**, a channel's **uploads**): use the name YouTube itself shows in that language, the same in every key (`*.watchLater`, `*.mix`, `*.liked`, `*.uploads`).
- **Interactive Download**: the action that opens the step-by-step setup for a link. One form for it everywhere it appears, title-like where the English capitalizes it.
- **Downloads**: the tab that lists the queue. Where the English capitalizes it ("Added 3 links to Downloads"), it names that tab: use the tab's existing translation (`queue.tabLabel`).

### Profile settings

These words sit side by side in the profile editor, the profile hint and the Update dialog, so each must stay distinct from its neighbours in every locale.

- **Best quality** (the top resolution choice, `playlistPresets.tier.best`) and **Best picture** (a goal: pick the sharpest stream, `goal.bestPicture`) are different settings. Never use the same words for both; "quality" is not "picture".
- **Best quality** for audio (`audioQuality.best`) is about sound: never "picture" or "image" quality.
- **Smart TV**: the goal that picks files any device plays. Use one form for it as a setting, the same in the built-in profile names and the editor.
- **Up to {N}p**: a resolution ceiling. 2160p is shown as "4K".
- **Built-in profile names** (`wizard.url.profile.builtinName.*`) are names, title-like. A built-in name may match an editor option (e.g. "Audio only"); that is intended.
- **Media kinds**: Video + audio, Video, no audio, Audio only, Subtitles only. Use one word for "only" across all of them, the profile names and `audioOnlyDot`.
- **Summary fragments** (`selectionOrder.summary.*`, `*.short`, `wizard.formats.savesAs.value`) are pieces of a line joined by the app: describe, never command ("saves as", not "save as"), and keep them short.
- **subfolder**: one spelling per locale.

## Per locale

Register is how the UI addresses the user. The terms are the ones the existing translations use most; where a locale has variants, this is the one to use.

| locale | register | download engine | Explore | download profile / profile | queue |
|---|---|---|---|---|---|
| am | polite/formal (-ዎ, -ሉ endings; no informal forms) | የማውረጃ ሞተር | ዳሰሳ | የማውረድ መገለጫ / መገለጫ | ወረፋ |
| ar | neutral MSA, masculine imperatives, no pronouns | محرّك التنزيل | استكشاف | ملف التنزيل / ملف التعريف | قائمة الانتظار |
| bg | formal (вие, -ете) | Механизъм за изтегляне | Разглеждане | Профил за изтегляне / Профил | опашка |
| bn | formal (আপনি) | ডাউনলোড ইঞ্জিন | অন্বেষণ | ডাউনলোড প্রোফাইল / প্রোফাইল | সারি |
| ca | informal tu | Motor de descàrrega | Explora | Perfil de descàrrega / Perfil | cua |
| cs | formal vy | Stahovací modul | Procházení | Profil stahování / Profil | fronta |
| da | informal du | Download-motor | Udforsk | Downloadprofil / Profil | kø |
| de | informal du | Download-Engine | Entdecken | Download-Profil / Profil | Warteschlange |
| el | informal (singular) | Μηχανή λήψης | Εξερεύνηση | Προφίλ λήψης / Προφίλ | ουρά |
| es | informal tú | Motor de descarga | Explorar | Perfil de descarga / Perfil | cola |
| et | formal (Teie/te) | Allalaadimismootor | Avasta | Allalaadimisprofiil / Profiil | järjekord |
| eu | standard zu (no hi) | Deskarga-motorra | Esploratu | Deskarga-profila / Profila | ilara |
| fa | formal (شما, -ید) | موتور دانلود | کاوش | نمایهٔ دانلود / نمایه | صف |
| fi | informal sinä, singular imperatives | Latausmoottori | Tutki | Latausprofiili / Profiili | jono |
| fr | formal vous | Moteur de téléchargement | Explorer | Profil de téléchargement / Profil | file (d'attente) |
| gl | informal tu | Motor de descarga | Explorar | Perfil de descarga / Perfil | cola |
| he | plural/gender-neutral imperatives (נסו, בדקו) | מנוע ההורדה | גילוי | פרופיל הורדה / פרופיל | תור |
| hi | formal आप | डाउनलोड इंजन | एक्सप्लोर | डाउनलोड प्रोफ़ाइल / प्रोफ़ाइल | कतार |
| hr | formal Vi | Mehanizam za preuzimanje | Istraži | Profil preuzimanja / Profil | red |
| hu | formal Ön (3rd-person verbs, pronoun mostly omitted) | Letöltőmotor | Felfedezés | Letöltési profil / Profil | sor |
| id | formal Anda | Mesin pengunduh | Jelajahi | Profil unduhan / Profil | antrean |
| it | informal tu | Motore di download | Esplora | Profilo di download / Profilo | coda |
| ja | polite です/ます/ください | ダウンロードエンジン | 探索 | ダウンロードプロフィール / プロフィール | キュー |
| km | polite (អ្នក, សូម) | ម៉ាស៊ីនទាញយក | រកមើល | ប្រវត្តិរូបទាញយក / ប្រវត្តិរូប | ជួរ |
| ko | polite 합니다/하세요, no honorific verb forms for the user | 다운로드 엔진 | 탐색 | 다운로드 프로필 / 프로필 | 대기열 |
| lt | formal Jūs | Atsisiuntimo variklis | Naršymas | Atsisiuntimo profilis / Profilis | eilė |
| lv | formal Jūs | Lejupielādes dzinējs | Izpēte | Lejupielādes profils / Profils | rinda |
| my | polite (သင်, -ပါ) | ဒေါင်းလုဒ်အင်ဂျင် | စူးစမ်းရန် | ဒေါင်းလုဒ် ပရိုဖိုင် / ပရိုဖိုင် | တန်းစီစာရင်း |
| nb | informal du | Nedlastingsmotor | Utforsk | Nedlastingsprofil / Profil | kø |
| nl | informal je | Downloadengine | Verkennen | Downloadprofiel / Profiel | wachtrij |
| om | informal singular (kee, -ta) | Injinii buusuu | Daawwannaa | Piroofaayilii buufataa / Piroofaayilii | tarree |
| pl | informal ty (singular imperatives; no Pan/Pani) | Silnik pobierania | Odkrywaj | Profil pobierania / Profil | kolejka |
| ps | formal تاسو | د ډاونلوډ انجن | سپړنه | د ښکته کولو پروفایل / پروفایل | قطار |
| pt | você (Brazilian), no tu | Mecanismo de download | Explorar | Perfil de Download / Perfil | fila |
| ro | formal (dumneavoastră, -ți) | Motor de descărcare | Explorare | Profil de descărcare / Profil | coadă |
| ru | informal ты | Движок загрузки | Обзор | Профиль загрузки / Профиль | очередь |
| sk | formal vy | Sťahovací nástroj | Preskúmať | Profil sťahovania / Profil | rad |
| sl | formal vi | Mehanizem za prenos | Razišči | Profil prenosa / Profil | vrsta |
| sr | informal ти | Механизам за преузимање | Истраживање | Профил преузимања / Профил | ред |
| sv | informal du | Hämtningsmotor | Utforska | Hämtningsprofil / Profil | kö |
| sw | informal/neutral singular (-ko, ukiwa) | Injini ya upakuaji | Gundua | Wasifu wa upakuaji / Wasifu | foleni |
| th | polite-neutral คุณ, no gendered particles | ตัวช่วยดาวน์โหลด | สำรวจ | โปรไฟล์ดาวน์โหลด / โปรไฟล์ | คิว |
| tr | undecided: sen and siz about evenly mixed | İndirme motoru | Keşfet | İndirme profili / Profil | kuyruk |
| uk | informal ти | Рушій завантаження | Огляд | Профіль завантаження / Профіль | черга |
| ur | formal آپ | ڈاؤن لوڈ انجن | دریافت | ڈاؤن لوڈ پروفائل / پروفائل | قطار |
| uz | formal siz (-ingiz) | Yuklash mexanizmi | Kashfiyot | Yuklab olish profili / Profil | navbat |
| vi | neutral bạn | Bộ máy tải xuống | Khám phá | Hồ sơ tải xuống / Hồ sơ | hàng đợi |
| zh-Hant | neutral 你 + 請 (您 in 4 keys) | 下載引擎 | 探索 | 下載設定檔 / 設定檔 | 佇列 |
| zh | neutral 你 + 请 (您 in 5 keys) | 下载引擎 | 探索 | 下载配置 / 配置 | 队列 |

## Known inconsistencies

Existing translations that disagree with the table. Fix one when a sync touches its key; a dedicated pass is a separate change.

- Register, mixed: fr (tu in about 23 keys, such as `errors.ytdlp.*`, `wizard.url.mascot*`, `splash.greeting`); de (Sie in about 10 keys, mostly `wizard.formats.fit.*`); ru, uk, sr, el (formal in `wizard.formats.fit.*`, `update.message.generic`, `queue.pausedBanner`); tr (no majority).
- Profile: ar uses three terms, ja splits プロフィール and プロファイル, hi writes प्रोफ़ाइल and प्रोफाइल, om three spellings, am and fa a transliteration in two keys.
- Queue: hi, bn, ar, ps, am, my and id use two or more nouns; my leaves "queue" in English in six `wizard.mixedPrompt.*` and `wizard.bulk.*` keys; om, sw and uz copy "+ Queue" as is in `wizard.confirm.addToQueue`.
- Explore: the Latin word is left in some plural forms of `notifications.exploreSignInRetrying_*` in ar, it, pl, ru, sr, uk; ja, ko, zh, zh-Hant translate `explore.toolbar.aria` as "current page".
