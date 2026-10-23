import {describe, expect, it} from 'vite-plus/test'

import {applyPlan, listFeedbackForms, listWebhooks, planWebhooks, TALLY_WEBHOOK_URL, type TallyForm, type TallyWebhook} from '../../scripts/tallyWebhooks.js'

const SECRET = 'signing-secret'

function form(id: string, name = `Arroxy feedback ${id}`, status = 'PUBLISHED'): TallyForm {
	return {id, name, status}
}

function webhook(formId: string, overrides: Partial<TallyWebhook> = {}): TallyWebhook {
	return {id: `wh-${formId}`, formId, url: TALLY_WEBHOOK_URL, signingSecret: SECRET, isEnabled: true, ...overrides}
}

interface Call {
	method: string
	url: string
	body: unknown
	auth: string | null
}

// A fake Tally API: answers each GET from `pages` by path and page number,
// and records every call.
function fakeTally(pages: Record<string, unknown[]>): {fetch: typeof fetch; calls: Call[]} {
	const calls: Call[] = []
	const fakeFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
		const url = new URL(input instanceof Request ? input.url : input)
		const method = init?.method ?? 'GET'
		const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined
		calls.push({method, url: url.toString(), body, auth: new Headers(init?.headers).get('authorization')})
		if (method !== 'GET') return new Response(null, {status: method === 'POST' ? 201 : 204})
		const page = Number(url.searchParams.get('page') ?? '1')
		const responses = pages[url.pathname] ?? []
		return Response.json(responses[page - 1] ?? {})
	}
	return {fetch: fakeFetch, calls}
}

describe('planWebhooks', () => {
	it('creates the webhook on every published Arroxy form that lacks it, and leaves correct ones alone', () => {
		const forms = [form('a'), form('b'), form('c'), form('draft', 'Arroxy draft', 'DRAFT'), form('other', 'Vita intake')]
		const plan = planWebhooks(forms, [webhook('a'), webhook('other')], SECRET)

		expect(plan).toEqual([
			{kind: 'ok', form: forms[0]},
			{kind: 'create', form: forms[1]},
			{kind: 'create', form: forms[2]}
		])
	})

	it('updates our webhook when it is disabled or signs with another secret', () => {
		const forms = [form('a'), form('b')]
		const disabled = webhook('a', {isEnabled: false})
		const staleSecret = webhook('b', {signingSecret: 'old'})

		expect(planWebhooks(forms, [disabled, staleSecret], SECRET)).toEqual([
			{kind: 'update', form: forms[0], webhook: disabled},
			{kind: 'update', form: forms[1], webhook: staleSecret}
		])
	})

	it('ignores other webhooks on the same form', () => {
		const forms = [form('a')]
		expect(planWebhooks(forms, [webhook('a', {id: 'zapier', url: 'https://hooks.zapier.com/x'})], SECRET)).toEqual([{kind: 'create', form: forms[0]}])
	})
})

describe('Tally API calls', () => {
	it('lists every page of forms and webhooks with the bearer key', async () => {
		const {fetch, calls} = fakeTally({
			'/forms': [
				{items: [form('a')], page: 1, limit: 500, total: 2, hasMore: true},
				{items: [form('b', 'Vita intake')], page: 2, limit: 500, total: 2, hasMore: false}
			],
			'/webhooks': [{webhooks: [webhook('a')], page: 1, limit: 100, hasMore: false, totalCount: 1}]
		})

		expect(await listFeedbackForms('key', fetch)).toEqual([form('a'), form('b', 'Vita intake')])
		expect(await listWebhooks('key', fetch)).toEqual([webhook('a')])
		expect(calls.map(call => call.url)).toEqual(['https://api.tally.so/forms?page=1&limit=500', 'https://api.tally.so/forms?page=2&limit=500', 'https://api.tally.so/webhooks?page=1&limit=100'])
		expect(calls.every(call => call.auth === 'Bearer key')).toBe(true)
	})

	it('rejects a response that is not the documented shape', async () => {
		const {fetch} = fakeTally({'/forms': [{items: 'nope'}]})
		await expect(listFeedbackForms('key', fetch)).rejects.toThrow('Tally API returned an unexpected /forms response')
	})

	it('creates and updates webhooks with the signing secret and form-response events', async () => {
		const {fetch, calls} = fakeTally({})
		const forms = [form('a'), form('b'), form('c')]
		const stale = webhook('b', {isEnabled: false})

		await applyPlan(
			[
				{kind: 'create', form: forms[0]},
				{kind: 'update', form: forms[1], webhook: stale},
				{kind: 'ok', form: forms[2]}
			],
			'key',
			SECRET,
			fetch
		)

		expect(calls).toEqual([
			{method: 'POST', url: 'https://api.tally.so/webhooks', body: {formId: 'a', url: TALLY_WEBHOOK_URL, eventTypes: ['FORM_RESPONSE'], signingSecret: SECRET}, auth: 'Bearer key'},
			{method: 'PATCH', url: 'https://api.tally.so/webhooks/wh-b', body: {formId: 'b', url: TALLY_WEBHOOK_URL, eventTypes: ['FORM_RESPONSE'], signingSecret: SECRET, isEnabled: true}, auth: 'Bearer key'}
		])
	})

	it('stops on a failed write and names the form', async () => {
		const failing = (async () => new Response('nope', {status: 403})) as unknown as typeof fetch
		await expect(applyPlan([{kind: 'create', form: form('a')}], 'key', SECRET, failing)).rejects.toThrow('POST /webhooks for form a (Arroxy feedback a) failed: 403')
	})
})
