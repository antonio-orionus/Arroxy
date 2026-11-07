// Browser script of the feedback log viewer page (public/arroxy/admin/feedback/index.html).
// wrangler's build step bundles it to viewer.js next to the page.

const API = '/arroxy/api/admin/feedback-log';

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

interface StoredAnswer {
  label: string;
  type: string;
  value: unknown;
}

interface FeedbackResponse {
  reportId: string;
  log: FeedbackLogEntry | null;
  logProblem: 'too_large' | 'corrupt' | null;
  answersProblem: 'unreadable' | null;
  answers: {
    key: string;
    submission: {
      submissionId: string;
      formName: string;
      submittedAt: string;
      answers: StoredAnswer[];
    };
  } | null;
  access: {
    email: string | null;
  };
}

interface ErrorResponse {
  error?: string;
  message?: string;
}

const form = document.getElementById('feedback-log-form') as HTMLFormElement | null;
const reportIdInput = document.getElementById('report-id') as HTMLInputElement | null;
const submitButton = document.getElementById('fetch-feedback-log') as HTMLButtonElement | null;
const statusEl = document.getElementById('feedback-log-status');
const resultEl = document.getElementById('feedback-log-result');
const metaEl = document.getElementById('feedback-log-meta');
const outputEl = document.getElementById('feedback-log-output');
const answersEl = document.getElementById('feedback-answers');
const answersMetaEl = document.getElementById('feedback-answers-meta');
const answersListEl = document.getElementById('feedback-answers-list');
const answersContextEl = document.getElementById('feedback-answers-context');
const answersMissingEl = document.getElementById('feedback-answers-missing');
const logMissingEl = document.getElementById('feedback-log-missing');
const copyButton = document.getElementById('copy-feedback-log') as HTMLButtonElement | null;
const downloadButton = document.getElementById('download-feedback-log') as HTMLButtonElement | null;

let currentLog = '';
let currentReportId = '';

form?.addEventListener('submit', event => void fetchReport(event));

async function fetchReport(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const reportId = reportIdInput?.value.trim().toLowerCase() ?? '';
  if (!reportId || !reportIdInput?.checkValidity()) {
    reportIdInput?.reportValidity();
    return;
  }

  setLoading(true);
  setStatus('Fetching the report...', 'pending');
  hideResult();

  try {
    const response = await fetch(`${API}?report_id=${encodeURIComponent(reportId)}`, {
      headers: {'accept': 'application/json'},
      credentials: 'same-origin'
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = 'message' in data && data.message ? data.message : `Request failed (${response.status})`;
      throw new Error(message);
    }

    const report = data as FeedbackResponse;
    showResult(report);
    setStatus(report.log && report.answers ? 'Answers and log loaded.' : report.log ? 'Log loaded.' : report.answers ? 'Answers loaded.' : 'Nothing readable for this report.', 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), 'error');
  } finally {
    setLoading(false);
  }
}

async function readJsonResponse(response: Response): Promise<FeedbackResponse | ErrorResponse> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Request returned ${response.status} without JSON. Cloudflare Access may be redirecting the API request.`);
  }
  return (await response.json());
}

copyButton?.addEventListener('click', () => void copyLog());

async function copyLog(): Promise<void> {
  if (!currentLog) return;
  await navigator.clipboard.writeText(currentLog);
  setStatus('Log copied.', 'success');
}

downloadButton?.addEventListener('click', () => {
  if (!currentLog || !currentReportId) return;
  const blob = new Blob([currentLog], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentReportId}.log`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

function setLoading(loading: boolean): void {
  if (!submitButton) return;
  submitButton.disabled = loading;
  submitButton.textContent = loading ? 'Fetching...' : 'Fetch log';
}

function setStatus(message: string, tone: 'pending' | 'success' | 'error'): void {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function hideResult(): void {
  currentLog = '';
  currentReportId = '';
  for (const el of [resultEl, answersEl, answersMissingEl, logMissingEl]) if (el) el.hidden = true;
  if (outputEl) outputEl.textContent = '';
  for (const el of [metaEl, answersMetaEl, answersListEl, answersContextEl]) el?.replaceChildren();
}

function showResult(data: FeedbackResponse): void {
  currentReportId = data.reportId;
  showAnswers(data.answers);
  showMissing(answersMissingEl, data.answers === null, data.answersProblem === 'unreadable' ? 'Tally answers are stored for this report but could not be read: the file is not in a shape this viewer knows.' : 'No Tally answers stored for this report: it came before the webhook, or they expired after 30 days.');
  showMissing(logMissingEl, data.log === null, data.logProblem === 'too_large' ? 'The diagnostic log is over the 20 MB viewing cap once decompressed.' : data.logProblem === 'corrupt' ? 'The diagnostic log is stored but is not valid gzip, so it cannot be shown.' : 'No diagnostic log for this report: the upload failed or expired after 30 days.');
  if (!data.log) return;
  const log = data.log;
  currentLog = log.text;
  if (outputEl) outputEl.textContent = log.text;
  appendTerms(metaEl, [
    ['Report', data.reportId],
    ['R2 key', log.key],
    ['Uploaded', log.metadata.uploaded ? new Date(log.metadata.uploaded).toLocaleString() : 'unknown'],
    ['Compressed', formatBytes(log.metadata.compressedBytes)],
    ['Raw tail', log.metadata.rawBytes ? formatBytes(Number(log.metadata.rawBytes)) : 'unknown'],
    ['Truncated', log.metadata.truncated ?? 'unknown'],
    ['Viewed by', data.access.email ?? 'Cloudflare Access user']
  ]);
  if (resultEl) resultEl.hidden = false;
}

// The questions the user answered, then the hidden fields the app filled in.
function showAnswers(answers: FeedbackResponse['answers']): void {
  if (!answers) return;
  const {submission} = answers;
  appendTerms(answersMetaEl, [
    ['Form', submission.formName],
    ['Submitted', new Date(submission.submittedAt).toLocaleString()],
    ['Submission', submission.submissionId]
  ]);
  for (const answer of submission.answers) {
    appendTerms(answer.type === 'HIDDEN_FIELDS' ? answersContextEl : answersListEl, [[answer.label, answerNode(answer.value)]]);
  }
  if (answersEl) answersEl.hidden = false;
}

function showMissing(el: HTMLElement | null, missing: boolean, message: string): void {
  if (!el) return;
  el.textContent = message;
  el.hidden = !missing;
}

function appendTerms(list: HTMLElement | null, terms: [string, string | Node][]): void {
  for (const [label, value] of terms) {
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.appendChild(typeof value === 'string' ? document.createTextNode(value) : value);
    list?.appendChild(term);
    list?.appendChild(detail);
  }
}

// Files become links; choices a comma list; anything else its text.
function answerNode(value: unknown): string | Node {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) {
    const items: unknown[] = value;
    if (items.every(isFile)) {
      const links = document.createDocumentFragment();
      items.forEach((file, index) => {
        if (index > 0) links.append(', ');
        const link = document.createElement('a');
        link.href = file.url;
        link.textContent = file.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        links.append(link);
      });
      return links;
    }
    return items.map(item => (typeof item === 'string' ? item : JSON.stringify(item))).join(', ');
  }
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function isFile(value: unknown): value is {name: string; url: string} {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Record<string, unknown>;
  return typeof file.name === 'string' && typeof file.url === 'string' && file.url.startsWith('https://');
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value)) return 'unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(2)} MiB`;
}

export {};
