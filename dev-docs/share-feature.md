# Share Feature — Internal Reference

Shipping reference for the in-app **Share** feature: dialog, all entry points, persisted settings, triggers, telemetry, and i18n. Code lives in:

- `src/shared/types.ts` — settings shape
- `src/shared/schemas.ts` — zod patch validator
- `src/shared/queueItem.ts` — `isHighValueDownload` helper (gates the SmartDrawer banner)
- `src/main/services/analytics.ts` — telemetry allowlist
- `src/renderer/src/store/types.ts` — `ShareTrigger` union + slice signature
- `src/renderer/src/store/systemSlice.ts` — state, helpers, actions
- `src/renderer/src/components/system/ShareDialog.tsx` — the dialog (26 destinations, popularity-sorted, brand icons via `unplugin-icons` + Iconify `logos:*` / `simple-icons:*`)
- `src/renderer/src/components/layout/SmartDrawer.tsx` — high-value passive banner
- `src/renderer/src/App.tsx` — footer button + dialog mount
- `src/renderer/src/components/layout/TitleBar.tsx` — title-bar button
- `src/renderer/src/components/system/AboutDialog.tsx` — about-dialog button
- `src/renderer/src/components/wizard/StepUrlInput.tsx` — wizard inline card
- `src/shared/i18n/locales/*.json` — generated runtime locale resources
- `i18n/locales/*.po` — agent-edited translation catalogs

---

## 1. Persisted Settings (electron-store)

Three optional fields on `CommonSettings` (see `src/shared/types.ts`):

| Field                           | Type      | Purpose                                                                                                                                | Set by                                       |
| ------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `successfulDownloadCount`       | `number`  | Lifetime count of completed downloads. Milestone fires when this transitions to any value in `SHARE_MILESTONES` (`3`, `25`, `100`).    | Status-event `done` branch in `initialize()` |
| `shareInlineCardDismissed`      | `boolean` | User clicked × on the wizard URL-step inline card. Hides only that surface.                                                            | `setShareInlineCardDismissed()`              |
| `shareHighValueBannerDismissed` | `boolean` | User clicked × on the SmartDrawer high-value banner. Hides only that surface.                                                          | `setShareHighValueBannerDismissed()`         |

All three are `.optional()` in `commonSettingsPatchSchema`. No default values — undefined === never set.

`shareAutoPromptDisabled` and `shareLastAutoPromptAt` were removed when the global "Don't ask again" footer was dropped — milestones cap at 3 lifetime events, so a global kill switch is unnecessary. Per-surface dismiss flags remain.

---

## 2. Trigger System

`ShareTrigger` union (6 values) in `src/renderer/src/store/types.ts`:

```ts
type ShareTrigger = 'footer' | 'titlebar' | 'about' | 'wizard-card' | 'milestone' | 'high-value-inline';
```

The previous `time` member (a 20-minute recurring modal) and `queue-item` member (a per-completed-item Share2 button — visually ambiguous next to a downloaded file) were removed. All triggers funnel through `openShareDialogInternal(set, trigger)` in `systemSlice.ts`.

### Truth table

| Trigger             | Source                    | Kind                            |
| ------------------- | ------------------------- | ------------------------------- |
| `footer`            | App footer Share button   | manual                          |
| `titlebar`          | TitleBar Share icon       | manual                          |
| `about`             | About dialog → Share      | manual                          |
| `wizard-card`       | URL step inline card body | manual click on passive surface |
| `milestone`         | 3rd / 25th / 100th download | **automatic modal**           |
| `high-value-inline` | SmartDrawer banner click  | manual click on passive surface |

No global "Don't ask again". Per-surface × dismisses gate `wizard-card` (`shareInlineCardDismissed`) and `high-value-inline` (`shareHighValueBannerDismissed`). `milestone` fires at most 3 times per install; no per-surface dismiss needed.

### Wizard inline card — visibility predicate

`StepUrlInput.tsx`:

```ts
const shareCardVisible = !(settings?.common?.shareInlineCardDismissed ?? false);
```

Card body click fires `share_inline_card_clicked` then opens the dialog with `wizard-card`. × dismiss fires `share_inline_card_dismissed` and persists `shareInlineCardDismissed`. First-time appearance fires `share_inline_card_impression` (deduped via `useRef` so re-renders don't re-fire).

Visual: `[Share2 icon] [body text] [×]` — single share icon on the left as the affordance signal, no trailing arrow. (Earlier iterations used `Sparkles` + `ArrowRight`; both were dropped because the chevron implied "open detail panel" rather than "open share dialog".)

### SmartDrawer high-value banner — visibility predicate

`SmartDrawer.tsx`:

```ts
const hasHighValueCompletion = useMemo(() => queue.some(isHighValueDownload), [queue]);
const showShareBanner = hasHighValueCompletion && !shareHighValueBannerDismissed;
```

`isHighValueDownload(item)` lives in `src/shared/queueItem.ts`. Returns `true` when:

- `item.status === 'done'` AND
- any of: `playlistGroupId` set, `job.kind` is `audio-convert` / `subtitle-only` / `playlist-preset`, OR (kind `single-format` AND any of: subtitle languages selected, SponsorBlock mode `mark|remove`, `formatLabel` matches `/2160|4K|3840/i`).

Banner appears compact above the queue list inside the drawer body. First appearance fires `share_prompt_impression { via: 'high-value-inline' }`. The whole text row is one clickable button — opens the dialog with `high-value-inline`. × dismiss (separate trailing button) fires `share_prompt_dismissed { via: 'high-value-inline' }` and persists `shareHighValueBannerDismissed`.

Visual: `[Share2 icon] [body text] [×]` — same single-icon layout as the wizard card. No trailing chevron.

### Milestone trigger

Inside the `event.stage === 'done'` branch of the status-event handler in `systemSlice.ts`:

1. Standard queue-item update (status, progress, finishedAt).
2. Read `prevCount = settings.common.successfulDownloadCount ?? 0`.
3. `nextCount = prevCount + 1`.
4. Persist via `commonPatch({ successfulDownloadCount: nextCount })`.
5. If `SHARE_MILESTONES.includes(nextCount)`, fire `openShareDialogInternal(set, 'milestone')`.

`SHARE_MILESTONES = [3, 25, 100]`. Wide spacing intentional — first prompt at proven engagement (3), second at clearly-engaged user (25), third at power user (100). After 100 the modal never fires again. No global opt-out: 3 lifetime events is bearable, and no automatic surface needs a kill switch.

Constants (top of `systemSlice.ts`):

```ts
const SHARE_MILESTONES: readonly number[] = [3, 25, 100];
```

(The previous `SHARE_PROMPT_INTERVAL_MS` and `SHARE_TIMER_TICK_MS` are gone along with the time trigger.)

---

## 3. Dialog (`ShareDialog.tsx`)

Single instance, mounted once in `App.tsx` (`<ShareDialog />` after `<AboutDialog />`). Reads state directly from store via Zustand selectors:

- `shareDialogOpen` — controlled `open`
- `shareDialogTrigger` — recorded on `share_dialog_closed { via }` for funnel attribution
- `closeShareDialog` — action

Dialog width: `sm:max-w-lg md:max-w-2xl` (widened from `sm:max-w-md` to fit the 26-destination grid).

### 26 destinations — popularity-sorted

`SOCIAL_DESTINATIONS` is an unordered list of all entries. `POPULARITY_ORDER: Exclude<DestinationId, 'copy'>[]` defines render order:

```
facebook, whatsapp, twitter, linkedin, reddit, pinterest, telegram, viber,
threads, bluesky, mastodon, email, hackernews, tumblr, pocket, buffer, skype,
line, weibo, qq, qzone, naver, kakao, hatena, douban, diaspora
```

Viber uses the `viber://forward?text=...` deep link — opens the installed desktop Viber client via `shell.openExternal`. Devices without Viber will get an "unknown protocol" handler error from the OS; acceptable trade-off given Viber has no public web-share intent.

The dialog computes `sortedDestinations = useMemo(() => POPULARITY_ORDER.map(id => SOCIAL_DESTINATIONS.find(...)), [])`. Less-popular destinations remain visible — they just appear later in the responsive grid. Copy is the primary action above the grid, not part of the social list.

Brand icons are imported per-destination via [`unplugin-icons`](https://github.com/unplugin/unplugin-icons) — each `~icons/{collection}/{name}` import resolves at build time to a tree-shaken React SVG component. Two collections in use: `logos:*` (colored multi-tone marks, preferred when available) and `simple-icons:*` (monochrome, used as fallback for CJK and niche brands). `email` uses `lucide-react`'s `Mail` (not a brand). Naver Band was dropped because it has no representation in either Iconify collection and the audience is niche.

Responsive grid:

```
grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7
```

`label` is hardcoded English brand name for Latin-alphabet platforms; **CJK native script** for native-script platforms (`微博`, `豆瓣`, `はてな`, `카카오스토리`, `밴드`, `네이버`, `QQ空间`). No i18n machinery — brands are global.

| Region focus                  | Destinations                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Universal                     | Copy link, Email                                                                     |
| Western                       | X, Facebook, Reddit, LinkedIn, Pinterest, Tumblr, Hacker News, Skype, Pocket, Buffer |
| Fediverse                     | Bluesky, Threads, Mastodon, Diaspora                                                 |
| LatAm/India/MENA/Africa       | WhatsApp                                                                             |
| Russia/Iran/global messengers | Telegram, Viber                                                                      |
| Japan/Taiwan/Thailand         | LINE, はてな                                                                         |
| South Korea                   | 카카오스토리, 네이버                                                                 |
| China                         | 微博, QQ, QQ空间, 豆瓣                                                               |

### URL building

All share URLs use `encodeURIComponent`. Default share text comes from `i18next.t('share.defaultMessage')`. URL constant:

```ts
const SHARE_URL = 'https://arroxy.orionus.dev';
```

External open uses `window.appApi.shell.openExternal(url)` (Electron IPC → OS default browser/handler) — **not** `window.open`.

### Copy-link

Uses `navigator.clipboard.writeText(SHARE_URL)`. Renders `Copy` ↔ `CopyCheck` icon swap (lucide-react) for ~1.5 s after click.

### Close tracking

`handleOpenChange(false)` fires `share_dialog_closed { via, clicked }`:

- `via`: the `ShareTrigger` that opened the dialog (falls back to `'footer'` when the trigger is `null`, which shouldn't normally occur).
- `clicked`: boolean — `true` if any social destination or Copy was clicked during the open session, `false` otherwise. A `useRef<boolean>` flips to `true` inside `handleSocial` / `handleCopy` and resets on close. Closes the prompt-fatigue measurement gap (dialog opens vs. successful share funnel).

---

## 4. Entry Points (5 manual surfaces + 1 automatic modal)

| Surface                                           | File                | `data-testid`                    | Trigger               | Kind                           |
| ------------------------------------------------- | ------------------- | -------------------------------- | --------------------- | ------------------------------ |
| Footer icon + label                               | `App.tsx`           | `btn-share`                      | `'footer'`            | manual                         |
| Title-bar icon (`WebkitAppRegion: no-drag`)       | `TitleBar.tsx`      | `btn-share-titlebar`             | `'titlebar'`          | manual                         |
| About dialog Share button (closes About on click) | `AboutDialog.tsx`   | `about-link-share`               | `'about'`             | manual                         |
| Wizard URL inline card body                       | `StepUrlInput.tsx`  | `share-inline-card-body`         | `'wizard-card'`       | manual click on passive card   |
| SmartDrawer high-value banner action button       | `SmartDrawer.tsx`   | `share-high-value-banner-action` | `'high-value-inline'` | manual click on passive banner |
| Milestone modal (3rd / 25th / 100th download)     | `systemSlice.ts`    | (dialog renders directly)        | `'milestone'`         | automatic                      |

The previous per-completed-item Share2 icon button (`btn-share-item` in `QueueItemCard.tsx`) was removed — visually adjacent to a downloaded file, the share icon read as "share this file" rather than "share Arroxy". Manual share access remains via the four other surfaces.

Wizard card × dismiss: `data-testid="share-inline-card-dismiss"` → `setShareInlineCardDismissed()`.
SmartDrawer banner × dismiss: `data-testid="share-high-value-banner-dismiss"` → `setShareHighValueBannerDismissed()`.

---

## 5. Telemetry

All events go through `track(name, props)` (`src/renderer/src/lib/analytics.ts`) which forwards over IPC. Main-side `trackMain` enforces the allowlist in `src/main/services/analytics.ts`. All events are gated by the user's `analyticsEnabled` setting (existing global gate in `trackMain`).

| Event                                | Props                                     | Fired from                                      | Notes                                                                                                                 |
| ------------------------------------ | ----------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `share_dialog_opened`                | `{ via: ShareTrigger }`                   | `openShareDialogInternal()`                     | Every open, regardless of trigger.                                                                                    |
| `share_dialog_closed`                | `{ via: ShareTrigger, clicked: boolean }` | `ShareDialog` `handleOpenChange(false)`         | Lets us measure prompt fatigue: opens without destination clicks.                                                     |
| `share_destination_clicked`          | `{ destination: DestinationId }`          | `ShareDialog` `handleSocial` and `handleCopy`   | Every social/copy/email click.                                                                                        |
| `share_link_copied`                  | `{}`                                      | `ShareDialog` `handleCopy`                      | Sub-case fired in addition to `share_destination_clicked` for the Copy button.                                        |
| `share_inline_card_impression`       | `{}`                                      | `StepUrlInput.tsx` `useEffect`                  | First time the wizard inline card becomes visible per session. Deduped via `useRef`.                                  |
| `share_inline_card_clicked`          | `{}`                                      | `StepUrlInput.tsx` `handleShareInlineCardClick` | Card body click. Always paired with a subsequent `share_dialog_opened { via: 'wizard-card' }`.                        |
| `share_inline_card_dismissed`        | `{}`                                      | `setShareInlineCardDismissed()`                 | Single fire on wizard card × click.                                                                                   |
| `share_prompt_impression`            | `{ via: ShareTrigger }`                   | `SmartDrawer.tsx` `useEffect`                   | First time the high-value banner becomes visible. Deduped via `useRef`.                                               |
| `share_prompt_dismissed`             | `{ via: ShareTrigger }`                   | `setShareHighValueBannerDismissed()`            | Banner × click.                                                                                                       |

Verifying allowlist parity: with `ARROXY_ANALYTICS_DEBUG=1` set, the dev branch of `trackMain` throws on unknown events / props.

---

## 6. i18n

12 keys under `share.*` in every locale (21 total — see `src/shared/schemas.ts` `supportedLangSchema` for the canonical list). `bun run check:app` enforces key parity, placeholder leakage, and gettext catalog freshness; runtime non-English JSON is generated from `i18n/locales/*.po`.

Keys:

```
share.title                  // dialog header — "Share Arroxy"
share.description            // dialog subtitle
share.copyLink               // copy-link button label
share.copied                 // copy-link button label after click
share.defaultMessage         // share text appended to share intents
share.footerTooltip          // tooltip on footer + titlebar + queue-item buttons
share.footerLabel            // text label on the footer button
share.shareAction            // About-dialog Share button label + SmartDrawer banner action label
share.inlineCard.body        // wizard inline card body text
share.inlineCard.dismiss     // wizard inline card × aria-label
share.highValueBanner.body   // SmartDrawer high-value banner body text
share.highValueBanner.dismiss// SmartDrawer high-value banner × aria-label
```

Brand/platform names are **not** in the i18n machinery. Hardcoded in `SOCIAL_DESTINATIONS`.

Default English message (line break preserved on Telegram/WhatsApp/Email/Mastodon/Bluesky/Threads; collapsed to space on X/Reddit/Facebook/LinkedIn):

```
Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.
4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock
```

When keys change, edit English first, run `bun run i18n:sync`, translate the fuzzy/untranslated PO entries across all 20 non-English locales, then run `bun run i18n:compile`.

---

## 7. Edge Cases & Concurrency Notes

- **Concurrent triggers.** If a milestone fires while a manual surface is already open, the milestone path overwrites `{ open: true, trigger: 'milestone' }`. Acceptable — `openShareDialogInternal` is idempotent and the timestamp write is a single optimistic patch.
- **Settings race.** `commonPatch()` does an optimistic local `set()` and a fire-and-forget `settings.update()`. If the update fails, local state stays ahead of disk. Acceptable trade-off for share fields — no critical data loss, and `notify.settingsSaveFailed('share', err)` logs the failure.
- **`window.open` vs `shell.openExternal`.** Renderer `window.open` doesn't trigger Electron's external browser by default. All destinations route through IPC. The explicit `browser-mock` dev mode in `src/renderer/src/browserMock.ts` polyfills `shell.openExternal` to call `window.open`, so dev-server testing still works.
- **Mock state in dev.** The renderer dev server uses `browserMock.ts` to stub `window.appApi` only when Vite runs with `--mode browser-mock`. Settings mutations there don't survive page reload — full Electron run is required to verify persistence.
- **Impression dedup.** All `_impression` events use a component-local `useRef<boolean>` so React StrictMode double-invokes and re-renders don't cause double-counting. A new mount of the component (drawer collapse/expand, queue-item unmount) re-arms the ref, which is intentional — a re-mounted card is a fresh visual exposure.
- **High-value detection narrowness.** `isHighValueDownload` returns `false` for plain single-format SD/HD downloads with no subs/SponsorBlock — so the banner does NOT spam the drawer after every successful pull. It only surfaces after the user has actually exercised a feature beyond the default path.

---

## 8. Verification Checklist

```bash
bun run lint && bun run typecheck && bun run knip
```

All three must exit clean. Currently they do.

Renderer-only Playwright walk-through (per `CLAUDE.md`):

```bash
npx vite src/renderer --port 5173 --mode browser-mock
```

Drive in a browser via the Playwright MCP tools or manually:

1. Click footer share → dialog opens, no Don't-ask button, telemetry `share_dialog_opened { via: 'footer' }`. Close without clicking → `share_dialog_closed { via: 'footer', clicked: false }`. Reopen, click Copy → close → `share_dialog_closed { via: 'footer', clicked: true }`.
2. Click title-bar icon → telemetry `via: 'titlebar'`.
3. Open About → click Share → About closes, dialog opens, telemetry `via: 'about'`.
4. Drive a download to completion → confirm the queue-item card renders no `Share2` icon (only `FolderOpen` for `done` items). No `share_queue_item_button_impression` event fires (event removed).
5. Wizard URL step → first paint of the card fires `share_inline_card_impression`. Confirm the card layout is `[Share2] [body text] [×]` — single share icon left, no trailing `ArrowRight`. Click body → fires `share_inline_card_clicked` then opens dialog `via: 'wizard-card'`. Click × → card hides, telemetry `share_inline_card_dismissed`, `shareInlineCardDismissed: true` in store.
6. Edit `browserMock.ts` to push a queue item with high-value attributes (e.g. `subtitles.languages = ['en']` or `formatLabel` containing `2160`). On completion, the SmartDrawer banner appears at the top of the drawer body. Confirm layout is `[Share2] [body text] [×]` — no trailing chevron. First appearance fires `share_prompt_impression { via: 'high-value-inline' }`. Click body → opens dialog `via: 'high-value-inline'`. Click × → banner hides, telemetry `share_prompt_dismissed { via: 'high-value-inline' }`, `shareHighValueBannerDismissed: true`.
7. Drive 3 mock completions → on the 3rd success, dialog opens with telemetry `via: 'milestone'`. No "Don't ask again" button. Close the dialog. Confirm 4th–24th completions do **not** re-open the dialog. Drive completion #25 → modal re-opens. Same again at #100. After #100 the modal never fires again.
8. Click each social destination → `share_destination_clicked` event with the right `destination` value, `shell.openExternal` called with correctly-encoded URL.
9. Resize browser to 360 / 640 / 900 / 1200 px widths → confirm the destination grid reflows (3 / 5 / 6 / 7 columns).
