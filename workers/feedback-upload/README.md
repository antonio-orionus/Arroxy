# Arroxy Feedback Upload Worker

Stores automatic feedback diagnostic log uploads in a private Cloudflare R2 bucket after a user submits the Tally feedback form.

It also receives the Tally webhook that stores each submission's answers beside its log ([Tally webhook](#tally-webhook)).

Endpoints (same Worker, same R2 bucket, one shared rate-limit bucket per client IP):

```text
POST https://orionus.dev/arroxy/api/feedback-diagnostics   # current site path
POST https://arroxy.orionus.dev/api/feedback-diagnostics   # legacy host — keep forever
```

Installed copies of Arroxy hardcode the legacy URL, and a redirect cannot carry a POST, so the legacy route, its handler
path, and the exclusion of this path from the `arroxy.orionus.dev` redirect rule must never be removed.

The desktop app opens Tally immediately. If the user submits the form, Arroxy uploads a gzip-compressed, redacted tail of `main.log` with the same renderer-generated `report_id` that was sent to Tally as a hidden field. The Worker stores the object in R2 under that report id and returns the same id to the app.

## Tally webhook

```text
POST https://orionus.dev/arroxy/api/tally-webhook
```

Tally posts every feedback form submission here. The Worker checks the `Tally-Signature` header (base64 HMAC-SHA256 of the raw body, keyed with the webhook's signing secret), then stores the answers as JSON at `feedback/by-report/<report_id>.answers.json`, next to the log, so one `report_id` finds both. Choice answers are stored as their option text, file uploads as name and link. A submission without a valid `report_id` hidden field (one not opened from the app) is acknowledged and not stored; Tally keeps it. The `feedback/` lifecycle rule deletes the answers with the logs.

The signing secret lives in the Keychain and in the Worker; the route answers 503 until the Worker has it:

```bash
security add-generic-password -s tally-webhook-signing-secret -a antonio-orionus -l "Tally webhook signing secret (antonio-orionus): feedback Worker" -T "" -w "$(openssl rand -base64 32)"
security find-generic-password -s tally-webhook-signing-secret -a antonio-orionus -w | bunx wrangler secret put TALLY_SIGNING_SECRET
```

Each localized form needs its own webhook. `bun run tally:webhooks` (from the repo root) creates it on every published Arroxy form that lacks it and repairs one that is disabled or signs with another secret; `--dry-run` only lists the plan. Re-run it after adding a localized form. It reads the Tally API key and the signing secret from the environment, as the top of `scripts/tally-webhooks.ts` shows.

## Deploy

First enable R2 for the Cloudflare account in the dashboard:

1. Open Cloudflare Dashboard.
2. Go to **R2 Object Storage**.
3. Select **Get started** / **Enable R2** and complete any account or billing prompt.

From this directory:

```bash
bunx wrangler login
bunx wrangler r2 bucket create arroxy-feedback-diagnostics
bunx wrangler r2 bucket lifecycle add arroxy-feedback-diagnostics delete-old-feedback "feedback/" --expire-days 30 --force
bunx wrangler types src/worker-configuration.d.ts
bunx wrangler deploy --dry-run
bunx wrangler deploy
```

The routes in `wrangler.jsonc` assume `orionus.dev` is on Cloudflare and that `arroxy.orionus.dev` keeps a proxied DNS record. The new route ends in `*` because route matching includes the query string; the handler still checks the exact pathname. Set both routes to fail closed (dashboard → Workers Routes), so an exhausted Free-plan request quota never forwards uploads to another origin.

## Required Cloudflare Hardening

Do not put a secret in Arroxy. The app is open source and desktop binaries are inspectable, so the endpoint must be safe as a public ingest endpoint.

Configure these in Cloudflare:

- R2 lifecycle rule: delete `feedback/*` after 14 or 30 days.
- Keep the R2 bucket private. This Worker intentionally does not implement `GET`.

Built-in Worker checks:

- accepts only `POST /api/feedback-diagnostics` and `POST /arroxy/api/feedback-diagnostics`
- rate-limits upload attempts to 10 requests per minute per client IP using the Worker Rate Limiting binding
- rejects missing `x-arroxy-upload: feedback-diagnostic-v1`
- rejects missing or invalid `x-arroxy-report-id` UUIDs
- rejects non-`application/gzip` or non-`gzip` uploads
- caps compressed payloads at 1,500,000 bytes
- stores R2 keys under `feedback/YYYY-MM-DD/<report_id>.log.gz`

Account-level WAF/rate limiting can still be added later as defense in depth, but this Worker does not require a secret or paid WAF rule for the baseline public endpoint guard.
