// Localized strings for README generation.
//
// Edit the per-locale files in ./locales/ — then run `node readme-src/build.mjs`
// to regenerate every README.{code}.md from readme-src/template.md.
//
// Add or rename a key in `en` first; build.mjs will fail loudly if any other
// locale is missing or has extra keys.
//
// Order = alphabetical by native endonym (Latin block, then non-Latin in
// Unicode-collation order). Same convention as the renderer language picker.

import { om } from "./locales/om.mjs";
import { id } from "./locales/id.mjs";
import { ca } from "./locales/ca.mjs";
import { cs } from "./locales/cs.mjs";
import { da } from "./locales/da.mjs";
import { de } from "./locales/de.mjs";
import { et } from "./locales/et.mjs";
import { en } from "./locales/en.mjs";
import { es } from "./locales/es.mjs";
import { eu } from "./locales/eu.mjs";
import { fr } from "./locales/fr.mjs";
import { gl } from "./locales/gl.mjs";
import { hr } from "./locales/hr.mjs";
import { it } from "./locales/it.mjs";
import { sw } from "./locales/sw.mjs";
import { lv } from "./locales/lv.mjs";
import { lt } from "./locales/lt.mjs";
import { hu } from "./locales/hu.mjs";
import { nl } from "./locales/nl.mjs";
import { nb } from "./locales/nb.mjs";
import { uz } from "./locales/uz.mjs";
import { pl } from "./locales/pl.mjs";
import { pt } from "./locales/pt.mjs";
import { ro } from "./locales/ro.mjs";
import { sk } from "./locales/sk.mjs";
import { sl } from "./locales/sl.mjs";
import { fi } from "./locales/fi.mjs";
import { sv } from "./locales/sv.mjs";
import { vi } from "./locales/vi.mjs";
import { tr } from "./locales/tr.mjs";
import { am } from "./locales/am.mjs";
import { he } from "./locales/he.mjs";
import { ar } from "./locales/ar.mjs";
import { ur } from "./locales/ur.mjs";
import { ps } from "./locales/ps.mjs";
import { fa } from "./locales/fa.mjs";
import { bn } from "./locales/bn.mjs";
import { hi } from "./locales/hi.mjs";
import { th } from "./locales/th.mjs";
import { my } from "./locales/my.mjs";
import { km } from "./locales/km.mjs";
import { el } from "./locales/el.mjs";
import { bg } from "./locales/bg.mjs";
import { ru } from "./locales/ru.mjs";
import { sr } from "./locales/sr.mjs";
import { uk } from "./locales/uk.mjs";
import { zh } from "./locales/zh.mjs";
import { ja } from "./locales/ja.mjs";
import { ko } from "./locales/ko.mjs";
import { zhHant } from "./locales/zh-Hant.mjs";

export const LOCALES = [
  { code: "om", filename: "README.om.md", name: "Afaan Oromoo", strings: om },
  { code: "id", filename: "README.id.md", name: "Bahasa Indonesia", strings: id },
  { code: "ca", filename: "README.ca.md", name: "Català", strings: ca },
  { code: "cs", filename: "README.cs.md", name: "Čeština", strings: cs },
  { code: "da", filename: "README.da.md", name: "Dansk", strings: da },
  { code: "de", filename: "README.de.md", name: "Deutsch", strings: de },
  { code: "et", filename: "README.et.md", name: "Eesti", strings: et },
  { code: "en", filename: "README.md", name: "English", strings: en },
  { code: "es", filename: "README.es.md", name: "Español", strings: es },
  { code: "eu", filename: "README.eu.md", name: "Euskara", strings: eu },
  { code: "fr", filename: "README.fr.md", name: "Français", strings: fr },
  { code: "gl", filename: "README.gl.md", name: "Galego", strings: gl },
  { code: "hr", filename: "README.hr.md", name: "Hrvatski", strings: hr },
  { code: "it", filename: "README.it.md", name: "Italiano", strings: it },
  { code: "sw", filename: "README.sw.md", name: "Kiswahili", strings: sw },
  { code: "lv", filename: "README.lv.md", name: "Latviešu", strings: lv },
  { code: "lt", filename: "README.lt.md", name: "Lietuvių", strings: lt },
  { code: "hu", filename: "README.hu.md", name: "Magyar", strings: hu },
  { code: "nl", filename: "README.nl.md", name: "Nederlands", strings: nl },
  { code: "nb", filename: "README.nb.md", name: "Norsk bokmål", strings: nb },
  { code: "uz", filename: "README.uz.md", name: "O'zbekcha", strings: uz },
  { code: "pl", filename: "README.pl.md", name: "Polski", strings: pl },
  { code: "pt", filename: "README.pt.md", name: "Português", strings: pt },
  { code: "ro", filename: "README.ro.md", name: "Română", strings: ro },
  { code: "sk", filename: "README.sk.md", name: "Slovenčina", strings: sk },
  { code: "sl", filename: "README.sl.md", name: "Slovenščina", strings: sl },
  { code: "fi", filename: "README.fi.md", name: "Suomi", strings: fi },
  { code: "sv", filename: "README.sv.md", name: "Svenska", strings: sv },
  { code: "vi", filename: "README.vi.md", name: "Tiếng Việt", strings: vi },
  { code: "tr", filename: "README.tr.md", name: "Türkçe", strings: tr },
  { code: "am", filename: "README.am.md", name: "አማርኛ", strings: am },
  { code: "he", filename: "README.he.md", name: "עברית", strings: he },
  { code: "ar", filename: "README.ar.md", name: "العربية", strings: ar },
  { code: "ur", filename: "README.ur.md", name: "اردو", strings: ur },
  { code: "ps", filename: "README.ps.md", name: "پښتو", strings: ps },
  { code: "fa", filename: "README.fa.md", name: "فارسی", strings: fa },
  { code: "bn", filename: "README.bn.md", name: "বাংলা", strings: bn },
  { code: "hi", filename: "README.hi.md", name: "हिन्दी", strings: hi },
  { code: "th", filename: "README.th.md", name: "ไทย", strings: th },
  { code: "my", filename: "README.my.md", name: "မြန်မာဘာသာ", strings: my },
  { code: "km", filename: "README.km.md", name: "ខ្មែរ", strings: km },
  { code: "el", filename: "README.el.md", name: "Ελληνικά", strings: el },
  { code: "bg", filename: "README.bg.md", name: "Български", strings: bg },
  { code: "ru", filename: "README.ru.md", name: "Русский", strings: ru },
  { code: "sr", filename: "README.sr.md", name: "Српски", strings: sr },
  { code: "uk", filename: "README.uk.md", name: "Українська", strings: uk },
  { code: "zh", filename: "README.zh.md", name: "中文", strings: zh },
  { code: "ja", filename: "README.ja.md", name: "日本語", strings: ja },
  { code: "ko", filename: "README.ko.md", name: "한국어", strings: ko },
  { code: "zh-Hant", filename: "README.zh-Hant.md", name: "繁體中文", strings: zhHant },
];
