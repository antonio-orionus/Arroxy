// Landing-page translations registry. One file per locale under ./locales/;
// every locale defines every key (build.mjs validates parity at build time).
//
// To edit copy: open landing-src/locales/<code>.mjs.
// To add a locale: create the file, import it here, and add a row to LOCALES.

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

export { en, es, de, fr, ja, zh, ru, uk, hi, bn, ar, uz, my, ps, sw, am, om, el, sr };

// Locale registry. Order = display order in the language picker.
// `dir` is the path under docs/ ("" = root for English).
// `ogLocale` is the canonical Open Graph locale tag (BCP 47 with underscore).
export const LOCALES = [
  { code: "en", name: "English",        dir: "",   ogLocale: "en_US", strings: en },
  { code: "es", name: "Español",        dir: "es", ogLocale: "es_ES", strings: es },
  { code: "de", name: "Deutsch",        dir: "de", ogLocale: "de_DE", strings: de },
  { code: "fr", name: "Français",       dir: "fr", ogLocale: "fr_FR", strings: fr },
  { code: "ja", name: "日本語",          dir: "ja", ogLocale: "ja_JP", strings: ja },
  { code: "zh", name: "中文",            dir: "zh", ogLocale: "zh_CN", strings: zh },
  { code: "ru", name: "Русский",        dir: "ru", ogLocale: "ru_RU", strings: ru },
  { code: "uk", name: "Українська",     dir: "uk", ogLocale: "uk_UA", strings: uk },
  { code: "hi", name: "हिन्दी",            dir: "hi", ogLocale: "hi_IN", strings: hi },
  { code: "bn", name: "বাংলা",           dir: "bn", ogLocale: "bn_BD", strings: bn },
  { code: "ar", name: "العربية",         dir: "ar", ogLocale: "ar_SA", strings: ar },
  { code: "uz", name: "O'zbekcha",      dir: "uz", ogLocale: "uz_UZ", strings: uz },
  { code: "my", name: "မြန်မာဘာသာ",   dir: "my", ogLocale: "my_MM", strings: my },
  { code: "ps", name: "پښتو",           dir: "ps", ogLocale: "ps_AF", strings: ps },
  { code: "sw", name: "Kiswahili",      dir: "sw", ogLocale: "sw_KE", strings: sw },
  { code: "am", name: "አማርኛ",          dir: "am", ogLocale: "am_ET", strings: am },
  { code: "om", name: "Afaan Oromoo",   dir: "om", ogLocale: "om_ET", strings: om },
  { code: "el", name: "Ελληνικά",       dir: "el", ogLocale: "el_GR", strings: el },
  { code: "sr", name: "Српски",         dir: "sr", ogLocale: "sr_RS", strings: sr },
];
