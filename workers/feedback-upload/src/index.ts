import { hasValidSignature, MAX_WEBHOOK_BYTES, readSubmission, TALLY_WEBHOOK_PATH } from './tallyWebhook.js';

// The signing secret is a Worker secret (`wrangler secret put`), so the
// generated Env doesn't list it.
type WorkerEnv = Env & { TALLY_SIGNING_SECRET?: string };

const ROUTE_PATH = '/api/feedback-diagnostics';
// Installed apps POST to the legacy host path forever; newer apps use the site's subpath.
const ROUTE_PATHS = new Set([ROUTE_PATH, `/arroxy${ROUTE_PATH}`]);
const MAX_COMPRESSED_BYTES = 1_500_000;
const UPLOAD_HEADER = 'feedback-diagnostic-v1';
const REPORT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname === TALLY_WEBHOOK_PATH) {
        return await handleTallyWebhook(request, env);
      }
      if (!ROUTE_PATHS.has(url.pathname)) {
        return json({ error: 'not_found' }, 404);
      }
      if (request.method !== 'POST') {
        return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });
      }
      const { success } = await env.FEEDBACK_UPLOAD_RATE_LIMIT.limit({ key: rateLimitKey(request) });
      if (!success) {
        return json({ error: 'rate_limited' }, 429, { 'Retry-After': '60' });
      }
      if (request.headers.get('x-arroxy-upload') !== UPLOAD_HEADER) {
        return json({ error: 'bad_upload_marker' }, 400);
      }
      if (request.headers.get('content-encoding')?.toLowerCase() !== 'gzip') {
        return json({ error: 'unsupported_content_encoding' }, 415);
      }
      if (!isAllowedContentType(request.headers.get('content-type'))) {
        return json({ error: 'unsupported_content_type' }, 415);
      }

      const reportId = readReportId(request.headers.get('x-arroxy-report-id'));
      const body = await readBodyWithLimit(request, MAX_COMPRESSED_BYTES);
      const key = `feedback/${new Date().toISOString().slice(0, 10)}/${reportId}.log.gz`;
      const sha256 = await sha256Hex(body);

      await env.FEEDBACK_LOGS.put(key, body, {
        httpMetadata: {
          contentType: 'application/gzip',
          contentEncoding: 'gzip'
        },
        customMetadata: {
          reportId,
          sha256,
          rawBytes: safeHeaderValue(request.headers.get('x-arroxy-raw-bytes')),
          compressedBytes: String(body.byteLength),
          truncated: safeHeaderValue(request.headers.get('x-arroxy-truncated'))
        }
      });

      return json({ report_id: reportId, diagnostic_key: key, diagnostic_url: null }, 201);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
      }
      return json({ error: 'internal_error' }, 500);
    }
  }
} satisfies ExportedHandler<WorkerEnv>;

// Signature first, so an unsigned caller learns nothing about the payload rules.
async function handleTallyWebhook(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });
  }
  const secret = env.TALLY_SIGNING_SECRET;
  if (!secret) {
    return json({ error: 'webhook_not_configured' }, 503);
  }
  const body = await readBodyWithLimit(request, MAX_WEBHOOK_BYTES);
  if (!(await hasValidSignature(body, request.headers.get('tally-signature'), secret))) {
    return json({ error: 'invalid_signature' }, 401);
  }

  const outcome = readSubmission(body);
  if (outcome.kind === 'invalid-payload') {
    return json({ error: 'invalid_payload' }, 400);
  }
  // A submission from outside the app has no report to join; Tally keeps it.
  if (outcome.kind === 'no-report-id') {
    return json({ stored: false, reason: 'no_report_id' }, 200);
  }

  const { key, submission } = outcome;
  await env.FEEDBACK_LOGS.put(key, JSON.stringify(submission), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
    customMetadata: { reportId: submission.reportId, submissionId: submission.submissionId, formId: submission.formId }
  });
  return json({ report_id: submission.reportId, answers_key: key }, 201);
}

function isAllowedContentType(value: string | null): boolean {
  return value?.split(';', 1)[0]?.trim().toLowerCase() === 'application/gzip';
}

function rateLimitKey(request: Request): string {
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',', 1)[0]?.trim() ?? 'unknown';
  return `${ROUTE_PATH}:${ip}`;
}

function readReportId(value: string | null): string {
  const reportId = value?.trim().toLowerCase() ?? '';
  if (!REPORT_ID_PATTERN.test(reportId)) {
    throw new HttpError(400, 'invalid_report_id');
  }
  return reportId;
}

async function readBodyWithLimit(request: Request, maxBytes: number): Promise<ArrayBuffer> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new HttpError(413, 'payload_too_large');
  }
  if (!request.body) {
    throw new HttpError(400, 'missing_body');
  }

  const reader = request.body.getReader() as ReadableStreamDefaultReader<Uint8Array>;
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    // react-doctor-disable-next-line react-doctor/async-await-in-loop -- stream chunks must be read sequentially from a single reader
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      throw new HttpError(413, 'payload_too_large');
    }
    chunks.push(value);
  }

  const body = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body.buffer;
}

async function sha256Hex(body: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', body);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeHeaderValue(value: string | null): string {
  return value?.slice(0, 128) ?? '';
}

function json(data: Record<string, unknown>, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}
