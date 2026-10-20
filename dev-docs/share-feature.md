# Share Feature — Internal Reference

Shipping reference for the in-app **Share** feature: dialog, all entry points, persisted settings, triggers, and i18n. Code lives in:

- `src/shared/types.ts` — settings shape
- `src/shared/schemas.ts` — zod patch validator
- `src/renderer/src/store/types.ts` — slice signature
- `src/renderer/src/store/systemSlice.ts` — state, helpers, actions
- `src/renderer/src/components/system/ShareDialog.tsx` — the dialog (25 destinations, popularity-sorted, brand icons via `unplugin-icons` + Iconify `logos:*` / `simple-icons:*`)
- `src/renderer/src/App.tsx` — footer button + dialog mount
- `src/renderer/src/components/system/AboutDialog.tsx` — about-dialog button
- `src/shared/i18n/locales/*.json` — generated runtime locale resources
- `i18n/locales/*.po` — agent-edited translation catalogs

---

## 1. Persisted Settings (electron-store)

Three optional fields on `CommonSettings` (see `src/shared/types.ts`):

| Field                           | Type      | Purpose                                                                                                                              | Set by                                                 |
| ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `successfulDownloadCount`       | `number`  | Lifetime count of completed downloads. A milestone fires when the count passes any value in `SHARE_MILESTONES` (`3`, `25`, `100`).   | `handleCompletedDownloadMilestones()` in `systemSlice.ts` |
| `shareInlineCardDismissed`      | `boolean` | **Unused.** Left over from the wizard URL-step card, which was removed. Still in the schema and written only by an unused store action. | `setShareInlineCardDismissed()` (no caller)            |
| `shareHighValueBannerDismissed` | `boolean` | **Unused.** Left over from the SmartDrawer banner, which was removed. Same status.                                                    | `setShareHighValueBannerDismissed()` (no caller)       |

All three are `.optional()` in `commonSettingsPatchSchema`. No default values — undefined === never set.

The two dismiss fields are still persisted and still validated, but no UI reads them: a grep of `src/` finds them only in `schemas.ts`, `types.ts`, the store type, and the unused store actions. They can be deleted together with those actions.

`shareAutoPromptDisabled` and `shareLastAutoPromptAt` were removed when the global "Don't ask again" footer was dropped — milestones cap at 3 lifetime events, so a global kill switch is unnecessary.

---

## 2. Trigger System

Entry points: the footer button, the About dialog button, and download milestones. Every one sets `shareDialogOpen: true`; the store does not record which surface opened the dialog.

Removed entry points: the `time` trigger (a 20-minute recurring modal), the per-completed-item `queue-item` button, the title-bar button, the wizard URL-step inline card, and the SmartDrawer high-value banner (with `isHighValueDownload`).

### Truth table

| Trigger     | Source                      | Kind                 |
| ----------- | --------------------------- | -------------------- |
| `footer`    | App footer Share button     | manual               |
| `about`     | About dialog → Share        | manual               |
| `milestone` | 3rd / 25th / 100th download | **automatic modal**  |

No global "Don't ask again" and no per-surface dismiss. `milestone` fires at most 3 times per install.

### Milestone trigger

The queue projection (`bindQueueProjection` in `queueProjection.ts`) reports how many items reached `done` in a batch of events. `handleCompletedDownloadMilestones()` in `systemSlice.ts`:

1. Reads `prevCount = settings.common.successfulDownloadCount ?? 0` (via `readSuccessfulDownloadCount`).
2. `nextCount = prevCount + doneIncrements`.
3. Persists via `commonPatch({ successfulDownloadCount: nextCount })`.
4. If any count in `prevCount + 1 … nextCount` is in `SHARE_MILESTONES`, opens the dialog once.

`SHARE_MILESTONES = [3, 25, 100]`. Wide spacing intentional — first prompt at proven engagement (3), second at clearly-engaged user (25), third at power user (100). After 100 the modal never fires again. No global opt-out: 3 lifetime events is bearable, and no automatic surface needs a kill switch.

Constant (top of `systemSlice.ts`):

```ts
const SHARE_MILESTONES: readonly number[] = [3, 25, 100]
```

---

## 3. Dialog (`ShareDialog.tsx`)

Single instance, lazy-loaded and mounted in `App.tsx` only while `shareDialogOpen` is true. Reads state directly from store via Zustand selectors:

- `shareDialogOpen` — controlled `open`
- `closeShareDialog` — action

Dialog width: `sm:max-w-lg md:max-w-2xl` (widened from `sm:max-w-md` to fit the destination grid).

### 25 destinations — popularity-sorted

`SOCIAL_DESTINATIONS` is an unordered list of all entries. `POPULARITY_ORDER: Exclude<DestinationId, 'copy'>[]` defines render order:

```
facebook, whatsapp, twitter, linkedin, reddit, pinterest, telegram,
threads, bluesky, mastodon, email, hackernews, tumblr, pocket, buffer, skype,
line, weibo, qq, qzone, naver, kakao, hatena, douban, diaspora
```

Viber was dropped: its `viber://forward` link is rejected by the http(s)-only allowlist in `shell.openExternal`, so the button did nothing. Restoring it would mean allowing `viber://` in the IPC layer.

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
| Russia/Iran/global messengers | Telegram                                                                             |
| Japan/Taiwan/Thailand         | LINE, はてな                                                                         |
| South Korea                   | 카카오스토리, 네이버                                                                 |
| China                         | 微博, QQ, QQ空间, 豆瓣                                                               |

### URL building

All share URLs use `encodeURIComponent`. Default share text comes from `i18next.t('share.defaultMessage')`. The shared URL is `WEBSITE_URL` from `@shared/constants`:

```ts
import {WEBSITE_URL} from '@shared/constants.js' // 'https://arroxy.com/'
```

External open uses `window.appApi.shell.openExternal(url)` (Electron IPC → OS default browser/handler) — **not** `window.open`.

### Copy-link

Uses `navigator.clipboard.writeText(WEBSITE_URL)`. Renders `Copy` ↔ `CopyCheck` icon swap (lucide-react) for ~1.5 s after click.

---

## 4. Entry Points (2 manual surfaces + 1 automatic modal)

| Surface                                           | File                | `data-testid`             | Kind      |
| ------------------------------------------------- | ------------------- | ------------------------- | --------- |
| Footer icon + label (label hidden on narrow windows) | `App.tsx`        | `btn-share`, `btn-share-label` | manual |
| About dialog Share button (closes About on click) | `AboutDialog.tsx`   | `about-link-share`        | manual    |
| Milestone modal (3rd / 25th / 100th download)     | `systemSlice.ts`    | (dialog renders directly) | automatic |

The per-completed-item Share2 button was removed — beside a downloaded file the icon read as "share this file" rather than "share Arroxy".

---

## 5. Telemetry

None. Share surfaces send no events; the app reports nothing but the daily anonymous heartbeat described in [`heartbeat.md`](heartbeat.md).

---

## 6. i18n

8 keys under `share.*` in every locale (see `SUPPORTED_LANGS` in `src/shared/schemas.ts` for the canonical list). `bun run check:app` enforces key parity, placeholder leakage, and gettext catalog freshness; runtime non-English JSON is generated from `i18n/locales/*.po`.

Keys:

```
share.title                  // dialog header — "Share Arroxy"
share.description            // dialog subtitle
share.copyLink               // copy-link button label
share.copied                 // copy-link button label after click
share.defaultMessage         // share text appended to share intents
share.footerTooltip          // tooltip on the footer button
share.footerLabel            // text label on the footer button
share.shareAction            // About-dialog Share button label
```

Brand/platform names are **not** in the i18n machinery. Hardcoded in `SOCIAL_DESTINATIONS`.

Default English message (line break preserved on Telegram/WhatsApp/Email/Mastodon/Bluesky/Threads; collapsed to space on X/Reddit/Facebook/LinkedIn):

```
Arroxy — free, open-source video downloader for Windows, macOS & Linux. Works with YouTube, Vimeo, Twitch, and 2000+ sites.
4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock
```

When keys change, edit English first, run `bun run i18n:sync`, translate the fuzzy/untranslated PO entries across every non-English locale, then run `bun run i18n:compile`.

---

## 7. Edge Cases & Concurrency Notes

- **Concurrent triggers.** If a milestone fires while a manual surface is already open, the milestone path sets `shareDialogOpen: true` again. Acceptable — opening is idempotent.
- **Settings race.** `commonPatch()` does an optimistic local `set()` and a fire-and-forget `settings.update()`. If the update fails, local state stays ahead of disk. Acceptable trade-off for share fields — no critical data loss, and `notify.settingsSaveFailed('share', err)` logs the failure.
- **`window.open` vs `shell.openExternal`.** Renderer `window.open` doesn't trigger Electron's external browser by default. All destinations route through IPC. The explicit `browser-mock` dev mode in `src/renderer/src/browserMock.ts` polyfills `shell.openExternal` to call `window.open`, so dev-server testing still works.
- **Mock state in dev.** The renderer dev server uses `browserMock.ts` to stub `window.appApi` only when Vite runs with `--mode browser-mock`. Settings mutations there don't survive page reload — full Electron run is required to verify persistence.

---

## 8. Verification Checklist

```bash
bunx vp check && bun run knip
```

Both must exit clean. Currently they do.

Renderer-only Playwright walk-through (per `AGENTS.md`):

```bash
bun run dev:mock
bun run doctor
```

Drive it in a browser (the Claude desktop app's built-in browser, `agent-browser`, or by hand):

1. Click footer share → dialog opens, no Don't-ask button. Close it, reopen, click Copy → the icon swaps to a check for ~1.5 s.
2. Open About → click Share → About closes, dialog opens.
3. Drive a download to completion → confirm the queue-item card renders no `Share2` icon (only `FolderOpen` for `done` items).
4. Drive 3 mock completions → on the 3rd success, the dialog opens. No "Don't ask again" button. Close the dialog. Confirm 4th–24th completions do **not** re-open the dialog. Drive completion #25 → modal re-opens. Same again at #100. After #100 the modal never fires again.
5. Click each social destination → `shell.openExternal` called with a correctly-encoded URL.
6. Resize browser to 360 / 640 / 900 / 1200 px widths → confirm the destination grid reflows (3 / 5 / 6 / 7 columns).
