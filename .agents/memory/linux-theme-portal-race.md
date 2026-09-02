---
name: linux-theme-portal-race
description: Wrong theme on first Linux launch is unexplained; read the theme:startup / theme:systemChanged log lines before theorising, and do not trust a stopped-portal repro.
metadata:
  type: project
---

# Wrong theme on first Linux launch (open, 2026-09-02)

Observed on Ubuntu 26.04 ARM64 with GNOME `color-scheme: prefer-dark`: Arroxy came up
**light on first launch and dark from the second onwards**. Root cause is **not**
established.

**Why:** The obvious explanation is a startup race. Linux resolves the desktop colour
scheme through `xdg-desktop-portal` over D-Bus, which is activated on demand, so a cold
start can create the window before the portal answers and `nativeTheme.shouldUseDarkColors`
is still `false`. That story fits the symptom but was never proven, and one fix built on
it did not work.

Ruled out by evidence, so do not re-investigate these:

- **Persisted settings.** A fresh install writes no `uiTheme` key at all, so every launch
  takes the identical `?? DEFAULTS.uiTheme` → `'system'` path. `settings.json` cannot be
  the difference between launch 1 and 2.
- **Resolver logic.** `DEFAULTS.uiTheme` is `'system'`, and both `resolveColorScheme`
  (renderer) and `resolveMainWindowBackgroundColor` (main) consult the system correctly.
- **A missing portal backend.** `xdg-desktop-portal`, `-gnome` and `-gtk` were all
  installed and the desktop genuinely was dark.

**How to apply:** Get the log before forming a theory. `theme:startup` records what the
window was actually painted from; `theme:systemChanged` records any later correction and
how many ms after process start it arrived. A `theme:startup` with
`systemPrefersDark: false` followed by a `theme:systemChanged` with `true` proves and
times the race. **No `theme:systemChanged` line at all** means Electron never learns of
the correction and the cause is elsewhere entirely — which is what the failed fix hints at.

Do **not** reproduce it with `systemctl --user stop xdg-desktop-portal`. Chromium
subscribes to the portal's `SettingChanged` signal at startup, so with the portal stopped
there is no subscription to make and starting it later notifies nobody. That models a
state no real user is ever in, and it produced a confident wrong conclusion once already.
The real bug is a *timing race with a portal that is present throughout*.

`watchSystemThemeBackground` in `src/main/windowPresentation.ts` is kept on its own merit
— it repaints the window background on genuine runtime theme changes, which was otherwise
frozen at launch — and is the hook `theme:systemChanged` logs from. It is not a fix for
this bug.

See [[linux-vm-testing]] for the VM this was observed on.
