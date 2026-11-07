import {createRemoteJWKSet, jwtVerify, type JWTPayload} from 'jose';

export interface FeedbackLogEnv {
  FEEDBACK_LOGS?: R2Bucket;
  CF_ACCESS_AUD?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
}

interface AccessIdentity {
  email: string | null;
}

interface FeedbackLogEntry {
  key: string;
  text: string;
  metadata: {
    uploaded: string | null;
    compressedBytes: number;
    rawBytes: string | null;
    truncated: string | null;
    sha256: string | null;
  };
}

/** One Tally answer as the feedback-upload Worker (`workers/feedback-upload`) stores it. */
export interface StoredAnswer {
  label: string;
  type: string;
  value: unknown;
}

/** `feedback/by-report/<report_id>.answers.json`, written by the Tally webhook. */
export interface StoredSubmission {
  version: 1;
  reportId: string;
  submissionId: string;
  formId: string;
  formName: string;
  submittedAt: string;
  answers: StoredAnswer[];
}

interface FoundAnswers {
  key: string;
  submission: StoredSubmission;
}

/** Each half found, missing (null), or present but unusable. */
export interface FoundFeedback {
  log: FeedbackLogEntry | 'too-large' | 'corrupt' | null;
  answers: FoundAnswers | 'unreadable' | null;
}

interface FeedbackResponse {
  reportId: string;
  log: FeedbackLogEntry | null;
  logProblem: 'too_large' | 'corrupt' | null;
  answers: FoundAnswers | null;
  answersProblem: 'unreadable' | null;
  access: AccessIdentity;
}

const REPORT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RETENTION_LOOKBACK_DAYS = 35;
/**
 * Uploads are capped at 1.5 MB compressed, but gzip can expand ~1000x. Stop
 * reading well before the Worker's 128 MB memory limit instead of crashing.
 */
const MAX_DECOMPRESSED_BYTES = 20 * 1024 * 1024;
const jwksByTeamDomain = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function handleFeedbackLog(request: Request, env: FeedbackLogEnv): Promise<Response> {
  if (request.method !== 'GET') {
    return json({error: 'method_not_allowed'}, 405, {allow: 'GET'});
  }

  const auth = await authenticateAccess(request, env);
  if (!auth.ok) return auth.response;

  if (!env.FEEDBACK_LOGS) {
    return json({error: 'missing_r2_binding', message: 'FEEDBACK_LOGS R2 binding is not configured.'}, 503);
  }

  const url = new URL(request.url);
  const reportId = normalizeReportId(url.searchParams.get('report_id'));
  if (!reportId) {
    return json({error: 'invalid_report_id', message: 'report_id must be a UUID.'}, 400);
  }

  const dateHint = normalizeDate(url.searchParams.get('date'));
  if (url.searchParams.has('date') && !dateHint) {
    return json({error: 'invalid_date', message: 'date must be YYYY-MM-DD.'}, 400);
  }

  const found = await readFeedback(env.FEEDBACK_LOGS, reportId, dateHint);
  const {status, body} = feedbackResult(reportId, found, auth.identity);
  return json(body, status);
}

/**
 * Whatever half is readable reaches the page; a problem with the other half
 * rides along. Only nothing at all is a 404, and an oversized log alone a 413.
 */
export function feedbackResult(reportId: string, found: FoundFeedback, access: AccessIdentity): {status: number; body: unknown} {
  const log = typeof found.log === 'string' ? null : found.log;
  const answers = found.answers === 'unreadable' ? null : found.answers;
  if (!log && !answers && found.answers !== 'unreadable' && found.log !== 'corrupt') {
    if (found.log === 'too-large') {
      return {status: 413, body: {error: 'log_too_large', message: `Decompressed log exceeds ${MAX_DECOMPRESSED_BYTES} bytes.`}};
    }
    return {
      status: 404,
      body: {error: 'not_found', message: `No diagnostic log or Tally answers found for ${reportId} in the current retention window.`}
    };
  }
  const body: FeedbackResponse = {
    reportId,
    log,
    logProblem: found.log === 'too-large' ? 'too_large' : found.log === 'corrupt' ? 'corrupt' : null,
    answers,
    answersProblem: found.answers === 'unreadable' ? 'unreadable' : null,
    access
  };
  return {status: 200, body};
}

/** The report's diagnostic log and its Tally answers; either may be missing. */
export async function readFeedback(bucket: R2Bucket, reportId: string, dateHint: string | null): Promise<FoundFeedback> {
  const [log, answers] = await Promise.all([readLog(bucket, reportId, dateHint), readAnswers(bucket, reportId)]);
  return {log, answers};
}

async function readLog(bucket: R2Bucket, reportId: string, dateHint: string | null): Promise<FoundFeedback['log']> {
  const object = await findFeedbackLog(bucket, reportId, dateHint);
  if (!object) return null;
  let text: string | null;
  try {
    // R2 object bodies are byte streams; the Workers types leave the chunk type open.
    text = await readGzipText(object.body as ReadableStream<Uint8Array>, MAX_DECOMPRESSED_BYTES);
  } catch (error) {
    // Not valid gzip (a broken upload): the answers still deserve a page.
    console.error('feedback viewer: unreadable log', {key: object.key, error: String(error)});
    return 'corrupt';
  }
  if (text === null) return 'too-large';
  return {
    key: object.key,
    text,
    metadata: {
      uploaded: object.uploaded?.toISOString() ?? null,
      compressedBytes: object.size,
      rawBytes: object.customMetadata?.rawBytes ?? null,
      truncated: object.customMetadata?.truncated ?? null,
      sha256: object.customMetadata?.sha256 ?? null
    }
  };
}

async function readAnswers(bucket: R2Bucket, reportId: string): Promise<FoundFeedback['answers']> {
  const key = `feedback/by-report/${reportId}.answers.json`;
  const object = await bucket.get(key);
  if (!object) return null;
  let stored: unknown;
  try {
    stored = JSON.parse(await object.text());
  } catch {
    stored = undefined;
  }
  if (isStoredSubmission(stored)) return {key, submission: stored};
  // Present but not a shape this viewer reads (a newer version, a broken write).
  console.error('feedback viewer: unreadable answers', {key});
  return 'unreadable';
}

function isStoredSubmission(value: unknown): value is StoredSubmission {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.answers)) return false;
  const strings = ['reportId', 'submissionId', 'formId', 'formName', 'submittedAt'] as const;
  return strings.every(name => typeof value[name] === 'string') && value.answers.every(isStoredAnswer);
}

function isStoredAnswer(value: unknown): value is StoredAnswer {
  return isRecord(value) && typeof value.label === 'string' && typeof value.type === 'string' && 'value' in value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function authenticateAccess(request: Request, env: FeedbackLogEnv): Promise<{ok: true; identity: AccessIdentity} | {ok: false; response: Response}> {
  const teamDomain = normalizeTeamDomain(env.CF_ACCESS_TEAM_DOMAIN);
  const audience = env.CF_ACCESS_AUD?.trim();
  if (!teamDomain || !audience) {
    return {
      ok: false,
      response: json({error: 'missing_access_config', message: 'CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD must be configured.'}, 503)
    };
  }

  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) {
    return {ok: false, response: json({error: 'access_required', message: 'Cloudflare Access authentication is required.'}, 403)};
  }

  try {
    const {payload} = await jwtVerify(token, jwksFor(teamDomain), {
      issuer: teamDomain,
      audience
    });
    return {ok: true, identity: {email: readEmail(payload)}};
  } catch {
    return {ok: false, response: json({error: 'invalid_access_token', message: 'Cloudflare Access token could not be verified.'}, 403)};
  }
}

function normalizeTeamDomain(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  const withProtocol = raw.startsWith('https://') ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

function jwksFor(teamDomain: string): ReturnType<typeof createRemoteJWKSet> {
  const existing = jwksByTeamDomain.get(teamDomain);
  if (existing) return existing;
  const jwks = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
  jwksByTeamDomain.set(teamDomain, jwks);
  return jwks;
}

function readEmail(payload: JWTPayload): string | null {
  return typeof payload.email === 'string' && payload.email.trim() ? payload.email : null;
}

function normalizeReportId(value: string | null): string | null {
  const reportId = value?.trim().toLowerCase() ?? '';
  return REPORT_ID_PATTERN.test(reportId) ? reportId : null;
}

function normalizeDate(value: string | null): string | null {
  const date = value?.trim() ?? '';
  return DATE_PATTERN.test(date) ? date : null;
}

async function findFeedbackLog(bucket: R2Bucket, reportId: string, dateHint: string | null): Promise<R2ObjectBody | null> {
  for (const key of candidateKeys(reportId, dateHint)) {
    const object = await bucket.get(key);
    if (object) return object;
  }
  return null;
}

function candidateKeys(reportId: string, dateHint: string | null): string[] {
  const keys = new Set<string>([`feedback/by-report/${reportId}.log.gz`]);
  if (dateHint) keys.add(`feedback/${dateHint}/${reportId}.log.gz`);

  const now = new Date();
  for (let offset = 0; offset <= RETENTION_LOOKBACK_DAYS; offset += 1) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - offset);
    keys.add(`feedback/${date.toISOString().slice(0, 10)}/${reportId}.log.gz`);
  }
  return [...keys];
}

/** Decompress and decode, or `null` once the output passes `maxBytes`. */
export async function readGzipText(body: ReadableStream<Uint8Array>, maxBytes: number): Promise<string | null> {
  // The DOM and Workers declarations of DecompressionStream disagree on its writable side; both take bytes.
  const gunzip = new DecompressionStream('gzip') as TransformStream<Uint8Array, Uint8Array>;
  const reader = body.pipeThrough(gunzip).getReader();
  const decoder = new TextDecoder();
  let text = '';
  let total = 0;
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, {stream: true});
  }
  return text + decoder.decode();
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}
