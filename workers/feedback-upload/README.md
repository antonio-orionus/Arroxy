# Arroxy Feedback Upload Worker

Stores automatic feedback diagnostic log uploads in a private Cloudflare R2 bucket after a user submits the Tally feedback form.

Endpoint:

```text
POST https://arroxy.orionus.dev/api/feedback-diagnostics
```

The desktop app opens Tally immediately. If the user submits the form, Arroxy uploads a gzip-compressed, redacted tail of `main.log` with the same renderer-generated `report_id` that was sent to Tally as a hidden field. The Worker stores the object in R2 under that report id and returns the same id to the app.

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

The route in `wrangler.jsonc` assumes `orionus.dev` is already on Cloudflare and that `arroxy.orionus.dev` has a proxied DNS record.

## Required Cloudflare Hardening

Do not put a secret in Arroxy. The app is open source and desktop binaries are inspectable, so the endpoint must be safe as a public ingest endpoint.

Configure these in Cloudflare:

- R2 lifecycle rule: delete `feedback/*` after 14 or 30 days.
- Keep the R2 bucket private. This Worker intentionally does not implement `GET`.

Built-in Worker checks:

- accepts only `POST /api/feedback-diagnostics`
- rate-limits upload attempts to 10 requests per minute per client IP using the Worker Rate Limiting binding
- rejects missing `x-arroxy-upload: feedback-diagnostic-v1`
- rejects missing or invalid `x-arroxy-report-id` UUIDs
- rejects non-`application/gzip` or non-`gzip` uploads
- caps compressed payloads at 1,500,000 bytes
- stores R2 keys under `feedback/YYYY-MM-DD/<report_id>.log.gz`

Account-level WAF/rate limiting can still be added later as defense in depth, but this Worker does not require a secret or paid WAF rule for the baseline public endpoint guard.
