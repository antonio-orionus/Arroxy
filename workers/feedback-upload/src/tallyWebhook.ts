import { z } from 'zod';

// Tally posts each feedback form submission here. The answers land in R2 next
// to the report's diagnostic log, so one report_id finds both.
export const TALLY_WEBHOOK_PATH = '/arroxy/api/tally-webhook';
export const MAX_WEBHOOK_BYTES = 256 * 1024;
const REPORT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const optionSchema = z.object({ id: z.string(), text: z.string() });
const fileSchema = z.object({ name: z.string(), url: z.string(), mimeType: z.string(), size: z.number() });
const fieldSchema = z.object({
  key: z.string(),
  label: z.string().nullish(),
  type: z.string(),
  value: z.unknown(),
  options: z.array(optionSchema).optional()
});
const submissionSchema = z.object({
  eventType: z.literal('FORM_RESPONSE'),
  data: z.object({
    submissionId: z.string(),
    formId: z.string(),
    formName: z.string(),
    createdAt: z.string(),
    fields: z.array(fieldSchema)
  })
});

type TallyField = z.infer<typeof fieldSchema>;

export interface StoredAnswer {
  label: string;
  type: string;
  value: unknown;
}

export interface StoredSubmission {
  version: 1;
  reportId: string;
  submissionId: string;
  formId: string;
  formName: string;
  submittedAt: string;
  answers: StoredAnswer[];
}

export type WebhookOutcome =
  | { kind: 'store'; key: string; submission: StoredSubmission }
  | { kind: 'no-report-id' }
  | { kind: 'invalid-payload' };

export function answersKey(reportId: string): string {
  return `feedback/by-report/${reportId}.answers.json`;
}

// Tally signs the raw body: base64 of HMAC-SHA256 keyed with the webhook's
// signing secret. `verify` compares in constant time.
export async function hasValidSignature(body: ArrayBuffer, signature: string | null, secret: string): Promise<boolean> {
  const mac = signature === null ? null : decodeBase64(signature.trim());
  if (!mac) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, mac, body);
}

export function readSubmission(body: ArrayBuffer): WebhookOutcome {
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return { kind: 'invalid-payload' };
  }
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) return { kind: 'invalid-payload' };

  const { data } = parsed.data;
  const reportId = hiddenValue(data.fields, 'report_id')?.trim().toLowerCase();
  if (!reportId || !REPORT_ID_PATTERN.test(reportId)) return { kind: 'no-report-id' };

  return {
    kind: 'store',
    key: answersKey(reportId),
    submission: {
      version: 1,
      reportId,
      submissionId: data.submissionId,
      formId: data.formId,
      formName: data.formName,
      submittedAt: data.createdAt,
      answers: data.fields.map(toAnswer)
    }
  };
}

function hiddenValue(fields: TallyField[], label: string): string | undefined {
  const field = fields.find((candidate) => candidate.type === 'HIDDEN_FIELDS' && candidate.label === label);
  return typeof field?.value === 'string' ? field.value : undefined;
}

// Choice answers arrive as option ids; files carry Tally's internal ids.
// Store what a reader needs: the option text, and each file's name and link.
function toAnswer(field: TallyField): StoredAnswer {
  const answer = { label: field.label ?? field.key, type: field.type };
  const { options, value } = field;
  if (options && Array.isArray(value)) {
    const ids: unknown[] = value;
    const textById = new Map(options.map((option) => [option.id, option.text]));
    return { ...answer, value: ids.map((id) => (typeof id === 'string' ? (textById.get(id) ?? id) : id)) };
  }
  const files = z.array(fileSchema).safeParse(value);
  if (files.success && files.data.length > 0) {
    return { ...answer, value: files.data.map(({ name, url, mimeType, size }) => ({ name, url, mimeType, size })) };
  }
  return { ...answer, value: value ?? null };
}

function decodeBase64(value: string): Uint8Array<ArrayBuffer> | null {
  let binary: string;
  try {
    binary = atob(value);
  } catch {
    return null;
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
