---
name: macos-gatekeeper-quarantine
description: macOS builds are ad-hoc signed, not unsigned; Gatekeeper prompts only at first exec, and the Homebrew cask strips quarantine in postflight because --no-quarantine was removed from brew
metadata:
  type: project
---

Arroxy's macOS builds are **ad-hoc signed** (`codesign -dv` → `flags=0x2(adhoc)`, `Signature=adhoc`, `TeamIdentifier=not set`), not unsigned. That distinction decides which dialog users see:

- Ad-hoc signed + quarantined → **"Arroxy.app" Not Opened — Apple could not verify "Arroxy.app" is free of malware**
- Genuinely broken/absent signature → *"is damaged and can't be opened"*

Verified on 2026-09-10 that **both** the DMG drag-install and `brew install --cask` produce the *"could not verify"* dialog. The README used to describe the "damaged" one and still ships `build/macOS-warning-Arroxy-is-damaged.png`, which shows a dialog that does not occur — **that screenshot is wrong and needs replacing**.

## The prompt fires only at exec

`syspolicyd` (`com.apple.syspolicy.exec`) logs `GK evaluateScanResult: 0` → `Prompt shown (6, 0), waiting for response` → `Adding Gatekeeper denial breadcrumb (open)` **only on launch**. `brew install` and `xattr` produce zero syspolicy events. So:

- Stripping quarantine **before first launch** prevents the dialog outright.
- Once the dialog is up, nothing scripted dismisses it — `pkill CoreServicesUIAgent` does not work. Prevention only.

Diagnostic trap: macOS spawns the app **suspended** while Gatekeeper decides, so `pgrep` shows a live pid for ~10s during a *blocked* launch. Process liveness is not proof of a successful launch; `evaluateScanResult: 2` with no `Prompt shown` is.

Useful probe (note `/usr/bin/log` — RTK shadows bare `log`):

```bash
/usr/bin/log show --last 10m --predicate 'process == "syspolicyd" AND eventMessage CONTAINS[c] "arroxy"' --style compact
```

## Why the cask strips quarantine itself

Homebrew **removed `--no-quarantine`** (deprecated 2025-09-23, gone in 4.7; absent from `brew install --help`, completions and `HOMEBREW_CASK_OPTS` as of Homebrew 6.x). `Quarantine.cask!` now runs unconditionally, so there is no user-side opt-out. Upstream's guidance to third-party taps is that "post-processing is required" — i.e. do it yourself.

So `.github/workflows/release.yml` emits a `postflight_steps` stanza that runs `xattr -dr com.apple.quarantine {{appdir}}/Arroxy.app`. Notes:

- Use `postflight_steps`, **not** `postflight` — the block form warns `Calling postflight is deprecated!`.
- `{{appdir}}` is a real template token (`install_steps.rb`), so it honours a custom `--appdir`.
- No `sudo`: brew installs the bundle user-owned. The same is true after a Finder drag, so the README's old `sudo xattr` was stricter than necessary.
- The cask is **rewritten wholesale from the heredoc on every stable release**, so edit `release.yml`, never `Casks/arroxy.rb` in the tap — a direct tap edit is reverted by the next tag.

**This has a shelf life.** Homebrew ended support for casks failing Gatekeeper checks in the official repo on 2026-09-01 and Apple keeps tightening. Notarizing (Apple Developer Program, $99/yr) removes the dialog on every path, drops the need for the postflight, and would allow the official homebrew/cask repo. See [[linux-vm-testing]] for the ARM-vs-x86_64 testing constraints that shaped how this was verified.
