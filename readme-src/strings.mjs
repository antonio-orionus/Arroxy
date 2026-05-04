// Localized strings for README generation.
//
// Edit the per-locale files in ./locales/ — then run `node readme-src/build.mjs`
// to regenerate every README.{code}.md from readme-src/template.md.
//
// Add or rename a key in `en` first; build.mjs will fail loudly if any other
// locale is missing or has extra keys.

import { en } from "./locales/en.mjs";
import { es } from "./locales/es.mjs";
import { de } from "./locales/de.mjs";
import { fr } from "./locales/fr.mjs";
import { ja } from "./locales/ja.mjs";
import { zh } from "./locales/zh.mjs";
import { ru } from "./locales/ru.mjs";
import { uk } from "./locales/uk.mjs";
import { hi } from "./locales/hi.mjs";
import { bn } from "./locales/bn.mjs";
import { ar } from "./locales/ar.mjs";
import { uz } from "./locales/uz.mjs";
import { my } from "./locales/my.mjs";
import { ps } from "./locales/ps.mjs";
import { sw } from "./locales/sw.mjs";
import { am } from "./locales/am.mjs";
import { om } from "./locales/om.mjs";
import { el } from "./locales/el.mjs";
import { sr } from "./locales/sr.mjs";

export const LOCALES = [
  { code: "en", filename: "README.md", name: "English", strings: en },
  { code: "es", filename: "README.es.md", name: "Español", strings: es },
  { code: "de", filename: "README.de.md", name: "Deutsch", strings: de },
  { code: "fr", filename: "README.fr.md", name: "Français", strings: fr },
  { code: "ja", filename: "README.ja.md", name: "日本語", strings: ja },
  { code: "zh", filename: "README.zh.md", name: "中文", strings: zh },
  { code: "ru", filename: "README.ru.md", name: "Русский", strings: ru },
  { code: "uk", filename: "README.uk.md", name: "Українська", strings: uk },
  { code: "hi", filename: "README.hi.md", name: "हिन्दी", strings: hi },
  { code: "bn", filename: "README.bn.md", name: "বাংলা", strings: bn },
  { code: "ar", filename: "README.ar.md", name: "العربية", strings: ar },
  { code: "uz", filename: "README.uz.md", name: "O'zbekcha", strings: uz },
  { code: "my", filename: "README.my.md", name: "မြန်မာဘာသာ", strings: my },
  { code: "ps", filename: "README.ps.md", name: "پښتو", strings: ps },
  { code: "sw", filename: "README.sw.md", name: "Kiswahili", strings: sw },
  { code: "am", filename: "README.am.md", name: "አማርኛ", strings: am },
  { code: "om", filename: "README.om.md", name: "Afaan Oromoo", strings: om },
  { code: "el", filename: "README.el.md", name: "Ελληνικά", strings: el },
  { code: "sr", filename: "README.sr.md", name: "Српски", strings: sr },
];
