// Landing-page translations registry. One file per locale under ./locales/;
// every locale defines every key (build.mjs validates parity at build time).
//
// To edit copy: open landing-src/locales/<code>.mjs.
// To add a locale: create the file, import it here, and add a row to LOCALES.
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

export { om, de, en, es, fr, sw, uz, vi, am, ar, ur, ps, bn, hi, my, el, ru, sr, uk, zh, ja };

// Locale registry. Order = display order in the language picker.
// `dir` is the path under docs/ ("" = root for English).
// `ogLocale` is the canonical Open Graph locale tag (BCP 47 with underscore).
export const LOCALES = [
  { code: "om", name: "Afaan Oromoo",   dir: "om", ogLocale: "om_ET", strings: om },
  { code: "de", name: "Deutsch",        dir: "de", ogLocale: "de_DE", strings: de },
  { code: "en", name: "English",        dir: "",   ogLocale: "en_US", strings: en },
  { code: "es", name: "Español",        dir: "es", ogLocale: "es_ES", strings: es },
  { code: "fr", name: "Français",       dir: "fr", ogLocale: "fr_FR", strings: fr },
  { code: "sw", name: "Kiswahili",      dir: "sw", ogLocale: "sw_KE", strings: sw },
  { code: "uz", name: "O'zbekcha",      dir: "uz", ogLocale: "uz_UZ", strings: uz },
  { code: "vi", name: "Tiếng Việt",    dir: "vi", ogLocale: "vi_VN", strings: vi },
  { code: "am", name: "አማርኛ",          dir: "am", ogLocale: "am_ET", strings: am },
  { code: "ar", name: "العربية",         dir: "ar", ogLocale: "ar_SA", strings: ar },
  { code: "ur", name: "اردو",           dir: "ur", ogLocale: "ur_PK", strings: ur },
  { code: "ps", name: "پښتو",           dir: "ps", ogLocale: "ps_AF", strings: ps },
  { code: "bn", name: "বাংলা",           dir: "bn", ogLocale: "bn_BD", strings: bn },
  { code: "hi", name: "हिन्दी",            dir: "hi", ogLocale: "hi_IN", strings: hi },
  { code: "my", name: "မြန်မာဘာသာ",   dir: "my", ogLocale: "my_MM", strings: my },
  { code: "el", name: "Ελληνικά",       dir: "el", ogLocale: "el_GR", strings: el },
  { code: "ru", name: "Русский",        dir: "ru", ogLocale: "ru_RU", strings: ru },
  { code: "sr", name: "Српски",         dir: "sr", ogLocale: "sr_RS", strings: sr },
  { code: "uk", name: "Українська",     dir: "uk", ogLocale: "uk_UA", strings: uk },
  { code: "zh", name: "中文",            dir: "zh", ogLocale: "zh_CN", strings: zh },
  { code: "ja", name: "日本語",          dir: "ja", ogLocale: "ja_JP", strings: ja },
];
