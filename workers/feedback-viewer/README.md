# Arroxy Feedback Viewer Worker

Private admin pages for support: look a feedback report up by its Tally `report_id` and read its Tally answers and its diagnostic log, both stored by the [feedback upload Worker](../feedback-upload/README.md) in the `arroxy-feedback-diagnostics` R2 bucket.

```text
https://orionus.dev/arroxy/admin/                       # index
https://orionus.dev/arroxy/admin/feedback/              # viewer page
GET https://orionus.dev/arroxy/api/admin/feedback-log?report_id=<uuid>[&date=YYYY-MM-DD]
```

The upload Worker is a public ingest endpoint and never reads the bucket back; reading lives here, in a separate Worker, so a bug in the public endpoint can't expose stored logs.

## Access

The Cloudflare Access application "Arroxy admin (orionus.dev)" covers `orionus.dev/arroxy/admin` and `orionus.dev/arroxy/api/admin`. Its audience tag is `CF_ACCESS_AUD` in `wrangler.jsonc`; the API verifies the `Cf-Access-Jwt-Assertion` token against it again (`src/feedbackLog.ts`) and answers 403 without one, 503 if the Access vars are missing.

The zone's Single Redirect rules send the rest of `orionus.dev/arroxy/*` to arroxy.com. They run before any Worker, so they must keep skipping `/arroxy/admin` and `/arroxy/api/`.

## Layout

- `src/index.ts`: routes `/arroxy/api/admin/*`; everything else is a static asset.
- `src/feedbackLog.ts`: Access check, R2 lookup (the dated log key and `feedback/by-report/<id>.answers.json`), gzip decoding capped at 20 MB.
- `public/arroxy/admin/`: the pages, their script and stylesheet, and `_headers` (noindex, no-store, a strict CSP). The directory mirrors the route prefix.

Tests: `tests/unit/feedback-viewer-worker.test.ts` (API and R2 reading) and `tests/unit/feedback-viewer-page.test.ts` (the page in jsdom).

## Deploy

From this directory:

```bash
bunx wrangler deploy --dry-run
bunx wrangler deploy
```

Its routes are more specific than any other Worker's under `orionus.dev/arroxy/`, so they take these paths over as soon as it deploys.
