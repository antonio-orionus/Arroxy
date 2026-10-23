import {z} from 'zod'

// Keeps a webhook to the feedback Worker on every published Arroxy feedback
// form in Tally, one per locale. The CLI is scripts/tally-webhooks.ts.

export const TALLY_WEBHOOK_URL = 'https://orionus.dev/arroxy/api/tally-webhook'
const TALLY_API = 'https://api.tally.so'
const EVENT_TYPES = ['FORM_RESPONSE']
// Pinned: requests otherwise use the API key's own version, and before
// 2025-02-01 GET /forms returned a bare array instead of {items, hasMore}.
const TALLY_API_VERSION = '2025-02-01'

const formSchema = z.object({id: z.string(), name: z.string(), status: z.string()})
const formsPageSchema = z.object({items: z.array(formSchema), hasMore: z.boolean()})
const webhookSchema = z.object({id: z.string(), formId: z.string(), url: z.string(), signingSecret: z.string().nullable(), isEnabled: z.boolean()})
const webhooksPageSchema = z.object({webhooks: z.array(webhookSchema), hasMore: z.boolean()})

export type TallyForm = z.infer<typeof formSchema>
export type TallyWebhook = z.infer<typeof webhookSchema>

export type WebhookAction = {kind: 'ok'; form: TallyForm} | {kind: 'create'; form: TallyForm} | {kind: 'update'; form: TallyForm; webhook: TallyWebhook}

/** Every Arroxy feedback form is named for the app in each locale. */
function isFeedbackForm(form: TallyForm): boolean {
	return form.status === 'PUBLISHED' && form.name.includes('Arroxy')
}

export function planWebhooks(forms: readonly TallyForm[], webhooks: readonly TallyWebhook[], secret: string): WebhookAction[] {
	return forms.filter(isFeedbackForm).map(form => {
		const ours = webhooks.find(webhook => webhook.formId === form.id && webhook.url === TALLY_WEBHOOK_URL)
		if (!ours) return {kind: 'create', form}
		if (!ours.isEnabled || ours.signingSecret !== secret) return {kind: 'update', form, webhook: ours}
		return {kind: 'ok', form}
	})
}

export async function listFeedbackForms(apiKey: string, fetchFn: typeof fetch = fetch): Promise<TallyForm[]> {
	const pages = await listPages('/forms', 500, formsPageSchema, apiKey, fetchFn)
	return pages.flatMap(page => page.items)
}

export async function listWebhooks(apiKey: string, fetchFn: typeof fetch = fetch): Promise<TallyWebhook[]> {
	const pages = await listPages('/webhooks', 100, webhooksPageSchema, apiKey, fetchFn)
	return pages.flatMap(page => page.webhooks)
}

/** Creates or updates what the plan says, one form at a time; stops on the first failure. */
export async function applyPlan(plan: readonly WebhookAction[], apiKey: string, secret: string, fetchFn: typeof fetch = fetch): Promise<void> {
	for (const action of plan) {
		if (action.kind === 'ok') continue
		const body = {formId: action.form.id, url: TALLY_WEBHOOK_URL, eventTypes: EVENT_TYPES, signingSecret: secret}
		const [method, path, payload] = action.kind === 'create' ? ['POST', '/webhooks', body] : ['PATCH', `/webhooks/${action.webhook.id}`, {...body, isEnabled: true}]
		// Sequential on purpose: a failure stops before touching the next form.
		const response = await fetchFn(`${TALLY_API}${path}`, {method, headers: headers(apiKey), body: JSON.stringify(payload)})
		if (!response.ok) throw new Error(`${method} ${path} for form ${action.form.id} (${action.form.name}) failed: ${response.status} ${await response.text()}`)
	}
}

async function listPages<T extends {hasMore: boolean}>(path: string, limit: number, schema: z.ZodType<T>, apiKey: string, fetchFn: typeof fetch): Promise<T[]> {
	const pages: T[] = []
	for (let page = 1; ; page += 1) {
		// Pages come one after another: each says whether another follows.
		const response = await fetchFn(`${TALLY_API}${path}?page=${page}&limit=${limit}`, {headers: headers(apiKey)})
		if (!response.ok) throw new Error(`Tally API GET ${path} failed: ${response.status} ${await response.text()}`)
		const parsed = schema.safeParse(await response.json())
		if (!parsed.success) throw new Error(`Tally API returned an unexpected ${path} response: ${describeIssues(parsed.error)}`)
		pages.push(parsed.data)
		if (!parsed.data.hasMore) return pages
	}
}

/** `items.0.name: Invalid input: expected string, received undefined; …` */
function describeIssues(error: z.ZodError): string {
	return error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
}

function headers(apiKey: string): Record<string, string> {
	return {authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'tally-version': TALLY_API_VERSION}
}
