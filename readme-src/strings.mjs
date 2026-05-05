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
import { de } from "./locales/de.mjs";
import { en } from "./locales/en.mjs";
import { es } from "./locales/es.mjs";
import { fr } from "./locales/fr.mjs";
import { sw } from "./locales/sw.mjs";
import { uz } from "./locales/uz.mjs";
import { vi } from "./locales/vi.mjs";
import { am } from "./locales/am.mjs";
import { ar } from "./locales/ar.mjs";
import { ur } from "./locales/ur.mjs";
import { ps } from "./locales/ps.mjs";
import { bn } from "./locales/bn.mjs";
import { hi } from "./locales/hi.mjs";
import { my } from "./locales/my.mjs";
import { el } from "./locales/el.mjs";
import { ru } from "./locales/ru.mjs";
import { sr } from "./locales/sr.mjs";
import { uk } from "./locales/uk.mjs";
import { zh } from "./locales/zh.mjs";
import { ja } from "./locales/ja.mjs";

export const LOCALES = [
  { code: "om", filename: "README.om.md", name: "Afaan Oromoo", strings: om },
  { code: "de", filename: "README.de.md", name: "Deutsch", strings: de },
  { code: "en", filename: "README.md", name: "English", strings: en },
  { code: "es", filename: "README.es.md", name: "Español", strings: es },
  { code: "fr", filename: "README.fr.md", name: "Français", strings: fr },
  { code: "sw", filename: "README.sw.md", name: "Kiswahili", strings: sw },
  { code: "uz", filename: "README.uz.md", name: "O'zbekcha", strings: uz },
  { code: "vi", filename: "README.vi.md", name: "Tiếng Việt", strings: vi },
  { code: "am", filename: "README.am.md", name: "አማርኛ", strings: am },
  { code: "ar", filename: "README.ar.md", name: "العربية", strings: ar },
  { code: "ur", filename: "README.ur.md", name: "اردو", strings: ur },
  { code: "ps", filename: "README.ps.md", name: "پښتو", strings: ps },
  { code: "bn", filename: "README.bn.md", name: "বাংলা", strings: bn },
  { code: "hi", filename: "README.hi.md", name: "हिन्दी", strings: hi },
  { code: "my", filename: "README.my.md", name: "မြန်မာဘာသာ", strings: my },
  { code: "el", filename: "README.el.md", name: "Ελληνικά", strings: el },
  { code: "ru", filename: "README.ru.md", name: "Русский", strings: ru },
  { code: "sr", filename: "README.sr.md", name: "Српски", strings: sr },
  { code: "uk", filename: "README.uk.md", name: "Українська", strings: uk },
  { code: "zh", filename: "README.zh.md", name: "中文", strings: zh },
  { code: "ja", filename: "README.ja.md", name: "日本語", strings: ja },
];
