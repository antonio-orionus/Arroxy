# Site migration: `arroxy.orionus.dev` → `orionus.dev/arroxy/`

Status: **switched 2026-10-11.** Stages 0–6 done and smoke-checked; Stage 7 ships with the next app release
(#252); Stage 8 (Search Console) and Stage 9 (optional decommission) remain. Drafted from the live Cloudflare account (via
Wrangler), both site repos, and an independent Codex review.

## What happened during execution

- `_redirects` was silently truncated on Pages: Cloudflare counts every rule after the first splat as dynamic (max 100),
  so rule 104 onward never fired. Nine of the ignored rules redirected live blog posts to `/blog/`. Workers reject such a
  file, which exposed it; arroxy-web now keeps plain rules before splats and tests the limits.
- The new feedback route needed a trailing `*`: route matching includes the query string.
- Fresh deploys and the new redirect rule took a few seconds to reach every edge; rerun the smoke check before
  concluding anything failed.
- Workers Builds deploys `arroxy-site` from arroxy-web `main` in under 30 seconds. Pages production deploys for
  `arroxy-web` are off; its last production deployment `51cb5142` is the rollback anchor.
- The personal site links Arroxy from the header (sm and up), footer, home bio and projects page, and its robots.txt lists
  the Arroxy sitemap.

## Strategy in one paragraph

Build the new site next to the old one, run both in parallel, then switch with a single redirect rule. At no point is
either site down: until the switch, the old subdomain is served exactly as today and the new path is just an extra,
unlinked copy. The switch is one Cloudflare rule, and undoing it is deleting that rule. Code merges to `main` happen
only **after** the switch is proven, with the old Pages deploy pipeline turned off first, so a merge can never break the
live site.

## What must keep working (the contract)

Every stage ends by running the smoke check (below) against this list. A stage is done only when every line passes.

| # | Surface | Today | After | Notes |
|---|---|---|---|---|
| 1 | Personal site | `orionus.dev/*` (Pages `orionus-web`) | unchanged | Must never be touched by Arroxy routes or headers |
| 2 | Arroxy landing + locales + blog | `arroxy.orionus.dev/…` | `orionus.dev/arroxy/…` | ~all pages, assets, `_astro/*`, icons, demo media |
| 3 | Old URLs | 200 | one 301 hop to the matching new URL, query kept | Backlinks, search results, bookmarks |
| 4 | Feedback upload (installed apps) | POST `arroxy.orionus.dev/api/feedback-diagnostics` | **same URL keeps working forever** | Shipped apps hardcode it; a 301 turns POST into GET |
| 5 | Feedback upload (new apps) | n/a | POST `orionus.dev/arroxy/api/feedback-diagnostics` | Same Worker, same R2 bucket |
| 6 | Admin feedback viewer | `arroxy.orionus.dev/admin/feedback/` behind Access | `orionus.dev/arroxy/admin/feedback/` behind Access | Reads R2 `arroxy-feedback-diagnostics` |
| 7 | In-app links (About, Share, "Download ↗") | old host | old host redirects → new; new releases link new | Old installs keep working via #3 |
| 8 | Release manifest on the landing page | daily commit → Pages deploy | daily commit → Worker deploy | Hero download links/version come from it |
| 9 | Sitemap, RSS, robots, llms.txt, pricing.md | old host root | `/arroxy/…`; apex robots.txt points at it | robots.txt is only read at host root |
| 10 | `*.pages.dev` | 301 to canonical | unchanged until decommission | Both projects have this middleware |
| 11 | HSTS | sent only by `arroxy.orionus.dev` | **not** sent from the apex by Arroxy | Apex sends none today; `includeSubDomains` would cover every `*.orionus.dev` |

Not affected (verified): Scoop, Homebrew, Winget, Flatpak metainfo, the published `yt-dlp-bridge` and `ytdlp-errors` packages (all point at GitHub); the Flatpak repo
(GitHub Pages); the Arroxy release pipeline (it only sends a repository dispatch to arroxy-web). Landing analytics is
currently off (`LANDING_OPENPANEL_CLIENT_ID` is unset, no `op1.js` on the live page), so there is nothing to carry over.

## Current state (verified 2026-10-11)

- Pages `arroxy-web`: domains `arroxy-web.pages.dev`, `arroxy.orionus.dev`; Git auto-deploy from `main`; build
  `bun install --frozen-lockfile && bun run build` → `dist`; vars `BUN_VERSION`, `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`;
  R2 binding `FEEDBACK_LOGS`; no secrets. Latest production deployment `51cb5142` (commit `dba839c`) — the rollback anchor.
- Pages `orionus-web`: domains `orionus-web.pages.dev`, `orionus.dev`; repo `antonio-orionus/orionus-web` (private);
  `functions/_middleware.ts` only redirects `*.pages.dev`; no `_redirects`/`_headers`; robots.txt lists only its own sitemap.
- Zone Worker routes: only `arroxy.orionus.dev/api/feedback-diagnostics → arroxy-feedback-upload`.
- Worker `arroxy-feedback-upload`: no secrets; handler matches the exact path `/api/feedback-diagnostics`.
- R2 `arroxy-feedback-diagnostics`: EEUR, private (r2.dev off, no custom domain), 30-day expiry on `feedback/`.
- Access app (AUD `499241ea…`) protects `arroxy.orionus.dev/admin/*` and `/api/admin/*`.
- Workers **Free** plan, and it stays that way (no paid Cloudflare features in this plan).
- Unknown (Wrangler's login can't read them): redirect rules, DNS records, Access app details.

## Free plan fit (checked against Cloudflare docs 2026-10-11)

| Need | Free plan allowance | Our use |
|---|---|---|
| Worker requests | 100,000/day, account-wide, resets 00:00 UTC | Feedback uploads + admin API only. Landing pages are static assets, which are free and unlimited and don't run the Worker |
| Workers Builds | 3,000 build min/month, 1 concurrent build, 20 min timeout | ~50 builds/month (daily manifest + pushes) × a few minutes |
| Pages builds (`orionus-web`) | 500/month | Unchanged |
| Single Redirect rules | 10 | 1 (2 if `/arroxy` gets its own) |
| Access | 50 users | 1 |
| R2 | 10 GB-month, 1M writes/month free; beyond that billed | Tiny today (381 kB) |

Two consequences:
- If something exhausts the 100k daily requests (a flood on the feedback endpoint), feedback uploads and the admin API
  stop until 00:00 UTC. The landing site keeps working, because static assets don't count. Set both Worker routes to
  **fail closed** so an exhausted quota never forwards traffic to the personal site.
- R2 has no spending cap. The 100k/day limit bounds the worst case at roughly $75/month (100k × 1.5 MB/day, kept 30 days).
  A cheap free fix, separate from this migration: a global daily upload cap in the feedback Worker.

## Smoke check (write it first, run it at every stage)

A script in arroxy-web, `scripts/migration-smoke.sh <stage>`, run from the Mac. Checks, grouped so a stage can run only
what applies:

- **personal**: `orionus.dev/`, `/blog/`, `/rss.xml`, `/sitemap-index.xml` → 200; apex responses carry no HSTS.
- **new**: every URL in `baseline-urls.txt`, rewritten to `/arroxy/…` → 200; one `_astro/*.css`, `/arroxy/assets/demo.webp`,
  one icon → 200; `/arroxy` → 301 `/arroxy/`; `/arroxy/no-such-page/` → 404 with the 404 page body;
  `/arroxy/sitemap-index.xml` lists only `/arroxy/` URLs and no `/admin/`; `/arroxy/release-manifest.json` tag equals the
  latest GitHub release.
- **admin**: unauthenticated `/arroxy/admin/` and `/arroxy/api/admin/feedback-log?report_id=<uuid>` → redirect to
  `*.cloudflareaccess.com` (never 200).
- **feedback**: POST to both feedback URLs with a wrong `x-arroxy-upload` header → 400 `bad_upload_marker`. That proves
  the request reached the Worker without writing anything to R2. GET → 405.
- **redirect** (after the switch): every baseline URL on the old host → exactly one 301 to the exact new URL, query
  string kept; POST to the old feedback URL still → 400 `bad_upload_marker` (not 301).

`baseline-urls.txt` is captured in Stage 0 from today's live sitemap plus the non-sitemap surfaces (`/rss.xml`,
`/robots.txt`, `/llms.txt`, `/pricing.md`, `/release-manifest.json`, `/admin/`, `/admin/feedback/`, a blocked-locale URL
such as `/de/`, `/en/`).

Manual checks the script can't do: log in to the admin viewer and open a real report; click the hero download buttons; the
locale banner; one end-to-end feedback upload (below).

## Stages

Each stage lists what it changes in production, how to verify it, and how to undo it.

### Stage 0 — Prepare (no production change)

1. Give read access for redirect rules and DNS (an API token with Zone → Single Redirect/Rulesets Read and DNS Read, or the
   Cloudflare MCP). Inventory existing redirect rules and confirm `arroxy.orionus.dev` has a proxied DNS record.
2. Record the rollback anchor: Pages `arroxy-web` deployment `51cb5142`.
3. Write `migration-smoke.sh`, capture `baseline-urls.txt`, run `personal` against today's production → all pass.

### Stage 1 — Feedback Worker accepts both paths (Arroxy repo; independent of everything else)

1. Accept `/api/feedback-diagnostics` **and** `/arroxy/api/feedback-diagnostics` in
   `workers/feedback-upload/src/index.ts`; add tests for both and for any other path still returning 404.
2. Add the route `orionus.dev/arroxy/api/feedback-diagnostics*` next to the old one in `wrangler.jsonc` (the trailing `*`
   lets query strings through; route matching includes them). It only claims a path that returns 404 on the personal
   site today, and the handler still checks the exact pathname.
3. PR → merge → `wrangler deploy`.
- **verify:** smoke `feedback` + `personal`. Then a real upload end to end: run the app with
  `ARROXY_FEEDBACK_DIAGNOSTICS_URL=https://orionus.dev/arroxy/api/feedback-diagnostics`, send feedback with diagnostics,
  and open that report ID in the **current** admin viewer (same bucket).
- **undo:** redeploy the previous Worker version (`wrangler rollback`). The old path never changed.

### Stage 2 — Rebuild arroxy-web for the subpath (branch only; no production change)

On a branch `subpath` in arroxy-web. `main` keeps deploying the old site to Pages as usual.

1. `base: '/arroxy/'`; one `SITE_URL` module replacing the copies in `astro.config.mjs`, `i18n/urls.ts`, `i18n/seo.ts`,
   `i18n/posts.ts`, `pages/index.astro`, `robots.txt.ts`, `BaseLayout.astro`, admin pages and tests.
2. Fix every hand-written URL (`base` does not rewrite them): `Hero.astro:164`, `Screenshots.astro:12`,
   `global.css:323` (icon `url()`), `BaseLayout.astro:82/122`, `index.astro:57`, `[lang]/index.astro:64`,
   `RecentPosts.astro:21`, `blog/index.astro:62`, `404.astro:32`, `i18n/author.ts:18`, root-relative links in blog
   Markdown, blog frontmatter `ogImage`, `rss.xml.ts:21`, the admin `fetch`, the inline locale script,
   `rehypeExternalNofollow` `SITE_HOST`, `public/llms.txt`, `public/pricing.md`. Historical prose that names the old host
   may stay.
3. Rewrite the sitemap `filter`/`serialize` in `astro.config.mjs` for the prefix (admin exclusion, landing/blog matchers,
   alternates, image entries).
4. `_redirects` and `_headers`: prefix every path; **remove HSTS** from `_headers`; fix the `Link` discovery headers.
   Delete `public/CNAME` (only a GitHub Pages fallback).
5. Post-build step: move the build into `dist/arroxy/`, leaving `_headers`/`_redirects` at `dist/`.
6. Worker config: replace the Pages `wrangler.toml` with a Worker config named **`arroxy-site`** (avoids confusion with
   the Pages project `arroxy-web`): `main`, `assets.directory = "dist"`, `ASSETS` binding,
   `assets.run_worker_first = ["/arroxy/api/admin/*"]`, `not_found_handling = "404-page"`, `.assetsignore`,
   `workers_dev = false`, `preview_urls = true` + `previews`, R2 `FEEDBACK_LOGS`, `CF_ACCESS_TEAM_DOMAIN`, and
   `CF_ACCESS_AUD` (filled in Stage 3). **No route yet.**
7. Port `functions/api/admin/feedback-log.ts` into the Worker script; delete `functions/` (`_middleware.ts` included).
   While porting, cap decompressed log size (for example 20 MB) instead of reading the whole stream with `.text()`.
8. Update the tests: `seo-indexing.spec.ts` (including the sitemap assertions), `admin-feedback.spec.ts`,
   `locale-banner.spec.ts`.
- **verify:** `bun run build && bun run check && bun run test:e2e`. Grep the built `dist/` for `"/assets`, `"/icons`,
  `"/blog`, `"/admin`, `"/api`, `url(/` and `arroxy.orionus.dev` → zero hits outside the intended ones. `wrangler dev` and
  click through `/arroxy/` in two locales and the blog.
- Pages will build preview deploys of this branch. They will look broken, which is expected and harmless: they're
  previews, not production.

### Stage 3 — Parallel run (adds the new site; the old one is untouched)

1. Create the new Access app first: self-hosted, `orionus.dev/arroxy/admin` and `orionus.dev/arroxy/api/admin`, with
   descendants, and the same policy as the old app. Put its AUD in `CF_ACCESS_AUD`.
2. Connect **Workers Builds** to `arroxy-site` now, with production branch `subpath`, so the real deploy pipeline is proven
   before the switch rather than after:
   - build command `bun install --frozen-lockfile && bun run build`, deploy command `bunx wrangler deploy`;
   - build variables `BUN_VERSION=1.2.23` and `SKIP_DEPENDENCY_INSTALL=1` (the build command installs with Bun, so the
     image's own package-manager detection can't pick npm);
   - the route `orionus.dev/arroxy/*` is in the Worker config, set to fail closed.
   Push to `subpath` → the build deploys. Route precedence: the feedback route (exact path, from Stage 1) is more specific
   and keeps winning.
- **verify:** smoke `personal` + `new` + `admin` + `feedback`. Manually: log in to `/arroxy/admin/feedback/` and open the
  report from Stage 1; hero downloads; locale banner. Leave it running a few hours and re-run the smoke check.
- Both sites are now live: users and installed apps still use the old host. The new path is unlinked. Keep this window
  short (same day) so search engines don't pick up the duplicate.
- **undo:** remove the route (`wrangler deploy` without it, or delete it in the dashboard). Instant.

### Stage 4 — Switch (one rule; minutes)

1. `git merge main` into `subpath` and push; Workers Builds redeploys with today's release manifest and content.
2. Disable automatic production deploys on the Pages project `arroxy-web`, so later merges can't touch the old host.
   Pages keeps serving `51cb5142`.
3. Create the Single Redirect rule (custom filter):
   - filter: `http.host eq "arroxy.orionus.dev" and not http.request.uri.path eq "/api/feedback-diagnostics"`
   - target: dynamic `concat("https://orionus.dev/arroxy", http.request.uri.path)`, 301, preserve query string.
   - verify it with Cloudflare Trace before relying on it.
- **verify:** smoke, every group, including `redirect`. Manually: open an old admin link → redirect → new Access login → viewer
  works.
- **undo:** delete the redirect rule. The old host is served by Pages again immediately (still `51cb5142`), and the feedback
  path was never redirected.

### Stage 5 — Consolidate (same day, once Stage 4 is stable for an hour)

1. Merge `subpath` → `main` (Pages auto-deploy is off, so nothing reaches the old host).
2. In Workers Builds, switch the production branch of `arroxy-site` from `subpath` to `main`. Enable preview builds for
   other branches.
3. Confirm the daily release-manifest commit (or a manual `workflow_dispatch` of `release-manifest.yml`) deploys the Worker
  and updates `/arroxy/release-manifest.json`.
4. Update arroxy-web `AGENTS.md` hosting and deploy docs (Workers, not Pages; new Access paths; new URLs).
- **verify:** smoke, all groups.
- **undo:** revert the merge on `main`, re-enable Pages production deploys, redeploy `51cb5142`, delete the redirect rule
  and the Worker route. Confirm the old Access app still protects the old admin, then run the old-host smoke check.

### Stage 6 — Personal site (orionus-web; any time after Stage 4)

1. `public/robots.txt`: add `Sitemap: https://orionus.dev/arroxy/sitemap-index.xml`.
2. Link Arroxy's site from the projects page and the home page mention.
3. Decide whether the apex `/llms.txt` should mention Arroxy (Arroxy's own lives at `/arroxy/llms.txt`).
- **verify:** smoke `personal`; `orionus.dev/robots.txt` lists both sitemaps.

### Stage 7 — Arroxy app release (after Stage 4)

1. One shared site-URL constant used by `AboutDialog.tsx`, `ShareDialog.tsx` and `useUpdateChannel.ts`, with tests updated.
2. Feedback default → `https://orionus.dev/arroxy/api/feedback-diagnostics`. Stage 1 must already be deployed.
3. `readme-src/template.md` badge and CTA → regenerate READMEs; `scripts/flatpak/publish-repo.sh`; `AGENTS.md`;
   `dev-docs/`; `workers/feedback-upload/README.md`; CHANGELOG entry.
4. `gh repo edit antonio-orionus/Arroxy --homepage https://orionus.dev/arroxy/`.
- **verify:** `bun run check`; in the built app, About, Share and the update-banner link open the new URL; one feedback
  upload from the release build shows up in the new admin viewer.

### Stage 8 — Search and external links (after Stage 4)

Search Console: confirm the property covers `orionus.dev` (a Domain property covers both hosts); submit
`https://orionus.dev/arroxy/sitemap-index.xml`. Rely on the 301s; the Change of Address tool doesn't apply to a move into a
subfolder. Update external listings and profiles you control. Watch indexing and impressions for 4–8 weeks.

### Stage 9 — Decommission (after 2–4 weeks; optional)

Leaving the Pages project dormant with its custom domain attached costs nothing and is the zero-risk option. If you do
remove it:

1. Remove `arroxy.orionus.dev` from the Pages project, then check DNS right away. The redirect rule and the old feedback
   route both need a **proxied** record for that hostname. If Pages removed it, create `AAAA arroxy 100::` (proxied).
2. Run the `redirect` and `feedback` smoke groups.
3. Only then delete the Pages project (this also retires `arroxy-web.pages.dev`).

## Keep forever

- A proxied DNS record for `arroxy.orionus.dev`, plus the redirect rule.
- The feedback Worker's old route **and** its old path in the handler (installed apps).
- The redirect exclusion for `/api/feedback-diagnostics`.

## Open decisions

1. Goal: branding or SEO? If SEO is the main reason, compare the expected gain against a few weeks of ranking wobble
   before starting.
2. Timing: Stages 3–5 should fit in one working session; pick a quiet day and avoid landing-copy changes on `main` during it.
