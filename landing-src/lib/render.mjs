// Shared rendering helpers used by both the landing build and the blog build.

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Escape `</script` to prevent any payload from breaking out of the script tag.
export function safeJson(data) {
  return JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
}

// Replace {{key}} placeholders in `template` with values from `strings`.
// Keys ending in `_html` are inlined raw; everything else is HTML-escaped.
// Unknown keys are left untouched (so the macro pass can fill them later).
export function applyStrings(template, strings) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in strings)) return match;
    const val = strings[key];
    return key.endsWith("_html") ? val : escapeHtml(val);
  });
}

// Replace {{KEY}} placeholders with prebuilt strings (e.g. CANONICAL, JSON_LD).
// Values are inlined verbatim — caller is responsible for safety.
export function applyMacros(html, macros) {
  for (const [key, val] of Object.entries(macros)) {
    html = html.replaceAll(`{{${key}}}`, val);
  }
  return html;
}
