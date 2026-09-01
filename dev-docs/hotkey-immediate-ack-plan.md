# Hotkey immediate ack + probing row

> Status: **implemented** (2026-08-31, uncommitted; combined with Phase 3 in one diff).
> Where this draft diverged from what shipped, `src/renderer/src/store/wizard/hotkeyTrigger.ts` is the contract (no `prepared` event, no `probing-failed` kind, no in-place retry — remove-and-replace, `unknown` + raw, terminal error rows).
> Symptom: hotkey starts a probe with no toast/OS notification and no Downloads row until probe finishes (~24s in the 2026-08-31 log). A second press during that window is the first thing the user hears (`busy`).

## Goal

A valid single-URL hotkey is acknowledged the moment it is accepted, not when yt-dlp returns.

1. Immediate feedback (existing either/or rule: focused → toast, hidden → OS notification).
2. A real Downloads-view row appears at once, status **Probing**, and later becomes Waiting/Downloading (or Error).

## Why the current path is silent

`handleHotkeyTrigger` (`src/renderer/src/store/wizard/hotkeyTrigger.ts`):

1. Intake (instant): empty / multiple / mixed / live-dedupe / `busy`.
2. `probeCancel()` + `downloads.probe()` — **no outcome, no queue add**.
3. Only after probe (~24s): `enqueueActiveProfileProbeResult` → `reportOutcome('queued')`.

`hotkeyRunActive` makes a second press report `busy`. That is working as coded; it is the wrong product moment. The first press never acked.

A queue item cannot be faked as `pending` during probe:

- `QueueService.recomputeSchedule` auto-spawns every `pending` item.
- `queueItemSchema.job` is a required `preparedJobSchema` (extractor + format selector). That data does not exist until probe returns.

So “show a row now” is a **new queue status**, not a CSS trick.

## Recommended design

### 1. New queue status `probing`

Add `'probing'` to `queueItemStatusSchema` / `QUEUE_STATUS`. Glossary: a queue item whose source is accepted but whose probe has not finished — not ready to spawn.

Scheduler: spawn only `pending` (already true). `probing` is invisible to `beginSpawn`.

Live dedupe (`LIVE_STATUSES` in `hotkeyTrigger.ts`) includes `probing`. Same URL while probing → `already-queued`, not `busy`.

### 2. New job kind `unresolved`

Keep `job` required. Add `{kind: 'unresolved'}` to `preparedJobSchema`. Download start must reject it (scheduler never hands it over). On probe success the item is patched to a real job.

Do **not** make `job` optional — every construction site and the persist schema would pay for it.

### 3. Queue events

Add to `QueueEvent` / `transition` / `illegalTransition`:

| Event | From | To |
|---|---|---|
| `{kind: 'prepared', job, title, thumbnail, formatLabel, probeInfoJsonRef?, outputDir?}` | `probing` | `pending` (then scheduler may spawn) |
| `{kind: 'probe-failed', error}` | `probing` | `error` |
| existing `cancelled` | `probing` | `cancelled` |

`retry-reset` on a probing-origin error re-enters `pending` only if a real job is already on the item; otherwise retry must re-probe (see Phase 3 below). **Shipped: no in-place retry** — probe-failed rows are terminal (remove or cancel only), `retry-reset` is illegal on probing items.

### 4. Actions

`src/shared/queueActions.ts`:

- `cancel`: add `probing` (aborts that probe + cancels the item).
- `remove`: add `probing`.
- `pause` / `pull-now` / `change-output-target`: **not** valid on `probing` (no job yet; output dir is already the active profile’s).
- `cancelAll`: include `probing` ids (today it only collects running/paused/pending).

### 5. Immediate outcome

On intake `kind: 'run'`:

1. Build a placeholder item (title = URL, empty thumbnail → existing shimmer, `formatLabel` = active profile label, `outputDir` = active profile dir, `lane` = `normal` until we separately decide priority, `status` = `probing`, `job` = `{kind: 'unresolved'}`).
2. `queueCmdAdd` — row is in the Downloads view on the next snapshot.
3. `reportOutcome('queued')` **now**, not after probe.

Probe continues in the background. On success: `prepared` event (no second notification — the row flipping to Waiting/Downloading is the signal). On failure: `probe-failed` + `reportOutcome('submission-failed')`. On `needs-review` (non-obvious playlist, cookies): cancel/remove the probing row + existing `needs-review` copy.

`queued` is reused rather than a new `accepted` outcome. Copy can mention fetching; that is an i18n change, not a contract change.

Keep `busy` only for collision with an in-app quick-download (`quickDownloadStatus === 'preparing'`). Do **not** use it for “a hotkey probe is in flight.”

### 6. Parallel hotkeys

`ProbeService` already tracks a `Set<AbortController>` — multiple probes can run. Today the hotkey path calls `probeCancel()` first, which aborts **every** in-flight probe (wizard included).

Changes:

- Stop calling global `probeCancel()` from the hotkey path.
- Key in-flight probes (`Map<key, AbortController>`, key = queue item id) so Downloads **Cancel** aborts only that probe.
- Wizard URL-change still cancels wizard probes; that path must not kill hotkey probes. If cancel is still global, split it (`cancelInFlight(owner)`) before shipping parallel hotkeys.

Second press, **same** URL: `already-queued`.
Second press, **different** URL: second probing row, second immediate ack. No `busy`.

### 7. Persistence / restart

Persist `probing` items (they are real queue items). On `QueueService.init()`, leftover `probing` rows did not finish: transition them to `error` with a distinct status/error the user can retry. Do **not** auto-reprobe on boot (surprise network).

### 8. Feedback channel

Keep the Phase 3 either/or rule. “System notification” in the request matches the hidden-window case in the log; a focused window still gets the sonner toast, never both. Changing that rule is out of scope.

Do **not** auto-focus the window or switch to the Downloads tab.

### 9. Downloads UI

`STATUS_META` in `useQueueManagerColumns.tsx`: `probing` → spinner icon (same Loader2 as running), new label key `queue.item.statusProbing`. Detail line can be empty or the URL (title already is the URL). `data-status="probing"` for E2E.

## Deliberately not doing

- Renderer-only overlay merged into the table. Looks the same until cancel/restart/quit, then it is a ghost. Rejected.
- Reusing `pending` + “don’t spawn if job.kind === unresolved”. `pending` means ready to run. Lying to the scheduler is how this class of bug comes back.
- A second OS notification when download actually starts.
- Opening the window, switching tabs, or any dialog.
- Priority-lane for hotkey (plan originally said priority; current enqueue uses `normal`). Separate decision, not this bug.
- Canonical-video-ID dedupe (known v1 limitation).

## English copy (needs explicit approval before `en.json`)

Current `notifications.hotkey.queued`: “Download queued from clipboard”.

Options for the **immediate** ack:

1. Keep as-is. Simplest. Slightly early to call it queued.
2. “Added from clipboard — fetching details…”
3. “Link added — getting video info…”

New Downloads badge:

1. “Probing”
2. “Fetching details”
3. “Getting info”

Probe-failed row uses existing error machinery; no new failure toast beyond current `submission-failed` (“Could not add that link — try again in Arroxy”). The row is now visible, so that toast is less load-bearing.

## Phases

1. **Contracts** — `probing` status, `unresolved` job kind, two QueueEvents, `queueActions`, `LIVE_STATUSES`. TDD: `queueTransition` + `queueActions` + schema superRefine (unresolved job only legal while `probing`; real job illegal while `probing`).
   verify: unit tests red then green; `bun run check` (knip will flag unused until consumers land — land consumers in the same commit).

2. **QueueService** — `cancelAll` includes probing; `init()` promotes stale probing → error; `prepared` / `probe-failed` go through `commit`. DownloadService start rejects `unresolved`.
   verify: main-side queue tests with fakes; no spawn log for probing items.

3. **Probe cancel ownership** — keyed abort; wizard cancel ≠ hotkey cancel.
   verify: unit test that aborting item A does not abort item B.

4. **Placeholder factory + hotkeyTrigger** — add probing item → report `queued` → probe (no global cancel) → `prepared` or `probe-failed`. Drop `hotkeyRunActive` as a busy gate (keep only quick-download collision). Stop parking the URL in `wizardUrl`.
   verify: `tests/renderer/hotkey-trigger.test.ts` covers immediate add + already-queued-while-probing + no busy on a second different URL.

5. **Downloads UI + i18n** — `STATUS_META`, English keys after approval, then `translate-arroxy-i18n` for 23 locales.
   verify: `check:i18n`; column renders `data-status="probing"`.

6. **Fixture E2E** — `tests/e2e/fixture-hotkey.spec.ts`: after press, assert a row with `data-status="probing"` **before** the fixture probe can finish; then `done`; same-URL second press → already-queued while first is still probing; hidden branch still writes the OS sink immediately (not 20s later). Rebuild `out/` before the spec (`bun run build`).
   verify: `ARROXY_E2E_HEADLESS=1` spec green 3×.

7. **`bun run check`**. Manual leftover: real OS banner delivery (TCC / terminal-notifier), contested chord.

## Seams

| Seam | Change |
|---|---|
| `src/shared/schemas.ts` | status + job kind |
| `src/shared/queueTransition.ts` | events |
| `src/shared/queueActions.ts` | cancel/remove |
| `src/main/services/QueueService.ts` | cancelAll, init, spawn guard |
| `src/main/services/ProbeService.ts` | keyed in-flight |
| `src/renderer/src/store/wizard/hotkeyTrigger.ts` | add-then-probe |
| `src/renderer/src/store/wizard/queueSubmission.ts` | placeholder factory (or a sibling module — keep wizard submission free of unresolved jobs) |
| `src/renderer/src/components/queue/useQueueManagerColumns.tsx` | STATUS_META |
| `src/renderer/src/lib/notify.ts` | no new outcome if `queued` is reused |
| `tests/e2e/fixture-hotkey.spec.ts` | probing oracle |

## Assumptions (challenge these)

- Either/or feedback stays. If you want OS notifications even with the window focused, say so — that contradicts the Phase 3 rule.
- `queued` fires at accept time; no second ping when the download starts.
- Parallel different-URL hotkeys are allowed. Same URL is `already-queued`.
- Stale probing items on restart become `error`, not silent drop and not auto-reprobe.
