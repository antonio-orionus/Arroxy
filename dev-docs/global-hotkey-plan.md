# Global Hotkey Download — Plan & Spec

> Status: approved plan. Worktree: `.worktrees/global-hotkey` (branch `feat/global-hotkey`).
> Sources: OmniGet feature verified in upstream source (`tonhowtf/omniget`), Arroxy surfaces walked in-repo.

## Goal

Close the distance between "found a link somewhere" and "it's downloading in Arroxy" —
without making Arroxy the center of attention — and never leave a trigger attempt
unacknowledged.

## Principles

1. **One link → automatable anywhere. Many links → human clicks Bulk paste.**
2. Every trigger attempt gets acknowledged (no silent paths — the OmniGet #198 lesson).
3. No automated path ever opens a dialog.
4. Feedback is **either/or, never both**: window focused → sonner toast; hidden/unfocused
   → OS notification. Same outcome vocabulary in both channels.
5. Blind paths (hotkey, watcher) dedupe against **live** queue items (queued + running,
   incl. active pause). Completed/failed/cancelled never block. Explicit wizard path
   always passes.

## The three lanes

| Lane | Trigger | Behavior | Feedback |
|---|---|---|---|
| A. Global hotkey (new) | `Cmd/Ctrl+Shift+D` anywhere in OS, app hidden or not | Clipboard → **single URL only** → live-dedupe → probe → queue instantly with pinned preset (default `best-quality`), priority lane, default output target. No window opens. | Outcomes: `queued` / `already-queued` / `invalid-clipboard` / `multiple-urls` / `submission-failed`; focused→toast, hidden→OS notification |
| B. Clipboard watch, focused (kept, pruned) | URL copied while Arroxy frontmost | 1 URL → autofill omnibox + toast. ≥2 URLs → **hint toast only** ("Multiple links — use Bulk paste"), never auto-opens anything. Queued/running URL → toast "Already in queue", no autofill. 0 URLs → silent. | In-app toast only |
| C. Explicit | User acts in-app | Omnibox paste → wizard (review path). **Bulk paste button → only bulk entry.** Tray menu "Download from clipboard" (Win/Linux) reuses lane A handler; visible only while hotkey enabled. | Existing flows |

Lanes A and B share one normalization rule (`cleanUrl`) but dedupe in their own process
(main for A, renderer for B) — the rule lives in `src/shared/`, the runtime checks don't
cross the wall.

Known limitation, v1, stated honestly: dedupe keys on cleaned URL strings, not canonical
video IDs (`youtu.be/ID` vs `watch?v=ID` are distinct). Contained fix later if it bites.

## Deliberately NOT doing

- Auto-download-on-paste (OmniGet #93; demand-driven, wait for demand).
- Second "audio-only" hotkey.
- macOS tray to keep the hotkey alive after close (separate, ADR-worthy feature).
- Reusing QuickDownloadProgressDialog (renderer-owned; hotkey path lives in main).
- Onboarding flow (doesn't exist in Arroxy; discoverability = settings block + README +
  changelog; one-time banner is a deferred idea).

## Settings UI (DownloadProfilesSettingsTab, under the clipboard-watch toggle)

- Enable switch — default **off**.
- Chord row: current accelerator display + **Record** button (click → capture; explicit
  `focus()` on click + Escape cancels, per OmniGet #198; conflict → inline warning badge,
  previous accelerator kept) + **Test** button (runs the real pipeline on current
  clipboard).
- Preset `Select` (defaults `best-quality`).
- macOS caption: "Works while Arroxy is running."

## Phases

| # | Phase | verify |
|---|---|---|
| 0 | Remove bulk auto-open: intake contract rewrite (1 URL → fill; ≥2 → hint toast only; kill `open-bulk` + pending-multi fallthrough); button-only bulk entry | rewritten `clipboard-intake.test.ts` green; no `open-bulk` refs; `bun run check` |
| 1 | Contracts: `hotkeyEnabled` / `hotkeyAccelerator` / `hotkeyPreset` in `schemas.ts` + `DEFAULTS` + `SettingsStore` keys; outcome enum incl. `already-queued`, `multiple-urls` | typecheck; settings round-trip test |
| 2 | `HotkeyService` (main): injectable registry/clipboard/notify ports; single-URL; live-queue dedupe in the submission step; priority lane | TDD with fakes; `bun run madge` |
| 3 | Feedback: `notify.ts` outcomes for focused; Electron `Notification` for hidden; `TrayManager.setHotkeyEnabled()` + menu item (Win/Linux) | outcome→copy tests; manual hidden-window check |
| 4 | Settings UI per above; `settingsHandlers` re-registers on patch | toggle round-trip registers/unregisters; typecheck |
| 5 | i18n all new keys (24 locales via `translate-arroxy-i18n`); drop `wizard.url.clipboard.autofilledLinks` | `check:i18n` |
| 6 | Full verify: `bun run check`; manual matrix — Win11 VM (contested `Ctrl+Shift+D`), macOS (`Cmd+Shift+D` vs Chrome bookmark-all-tabs), watcher+hotkey same-URL overlap → one job | checklist done |

Phase 0 ships independently. Phases 1–2 are the core; 3–4 the UX meat; 5–6 polish.

## Key implementation seams (recon results)

- `ClipboardWatcher` (main) — attention-gated poller; keep for lane B.
- `clipboardIntake.ts` (renderer) — pure resolve fn; contract rewritten in Phase 0;
  lane-B dedupe lands here in Phase 2/3.
- `prepareJob` (shared) — built exactly for main-side job synthesis without renderer.
- `QueueService` / `QueueStore.items` — priority lane exists; dedupe helper over items.
- `TrayManager.rebuildMenu` — needs `setHotkeyEnabled()` hook; Win/Linux only (no darwin tray).
- `settingsHandlers.ts` — already the re-apply point for watcher toggles; hotkey joins it.
- `notify.ts` (sonner) + Electron `Notification` — the either/or feedback channels.
