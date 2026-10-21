import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_METHOD_NAMES, CONTROL_METHODS, isControlMethod, WAIT_TIMEOUT_MAX_MS} from '../src/index'

const item = {id: 'q1', title: 'A video', site: 'youtube', status: 'running', progress: {percent: 42, downloadedBytes: 420, totalBytes: 1000, speedBytesPerSecond: 100, etaSeconds: 6}, lane: 'normal', origin: {kind: 'localClient', clientId: 'c1', label: 'Claude Code'}, intakeId: 'i1', error: null}

describe('methods', () => {
	it('covers exactly the v1 requests', () => {
		expect([...CONTROL_METHOD_NAMES].sort()).toEqual(
			[
				'hello',
				'auth',
				'status',
				'profiles.list',
				'queue.list',
				'queue.get',
				'intake.get',
				'wait',
				'links.add',
				'intake.choose',
				'intake.retry',
				'intake.cancel',
				'queue.pause',
				'queue.resume',
				'queue.cancel',
				'queue.retry',
				'queue.remove',
				'queue.pauseAll',
				'queue.resumeAll',
				'events.subscribe',
				'events.unsubscribe'
			].sort()
		)
		expect(isControlMethod('queue.get')).toBe(true)
		expect(isControlMethod('probe')).toBe(false)
		expect(isControlMethod('toString')).toBe(false)
	})

	it('tolerates unknown payload fields in params and results, dropping them', () => {
		const params = CONTROL_METHODS['queue.get'].params.parse({itemId: 'q1', addedInV1_3: true})
		expect(params).toEqual({itemId: 'q1'})
		const result = CONTROL_METHODS['queue.get'].result.parse({item: {...item, addedInV1_3: 'x'}, alsoNew: 1})
		expect(result.item).toEqual(item)
		expect(result).not.toHaveProperty('alsoNew')
	})
})

const nonce = 'AAECAwQFBgcICQoLDA0ODw'
const proof = 'x_IEryNKMjLE5SmIOQBOTwNcA1N-TpctPra9GAb_Irg'

describe('hello', () => {
	const hello = {protocol: {majors: [1]}, client: {name: 'arroxy-mcp', version: '0.1.0'}, clientNonce: nonce}

	it('takes the client majors, its name and a client nonce', () => {
		expect(CONTROL_METHODS.hello.params.parse(hello)).toEqual(hello)
		expect(CONTROL_METHODS.hello.params.safeParse({...hello, protocol: {majors: []}}).success).toBe(false)
		expect(CONTROL_METHODS.hello.params.safeParse({...hello, client: {name: ''}}).success).toBe(false)
		expect(CONTROL_METHODS.hello.params.safeParse({protocol: hello.protocol, client: hello.client}).success).toBe(false)
		expect(CONTROL_METHODS.hello.params.safeParse({...hello, clientNonce: 'short'}).success).toBe(false)
	})

	it('carries no credential: the server has not proved itself yet', () => {
		const parsed = CONTROL_METHODS.hello.params.parse({...hello, token: 't', clientSecret: 's', approvalId: 'a1'})
		expect(parsed).toEqual(hello)
	})

	it("answers with the server's proof and a server nonce", () => {
		const challenge = {serverProof: proof, serverNonce: nonce}
		expect(CONTROL_METHODS.hello.result.parse(challenge)).toEqual(challenge)
		expect(CONTROL_METHODS.hello.result.safeParse({serverNonce: nonce}).success).toBe(false)
		expect(CONTROL_METHODS.hello.result.safeParse({...challenge, serverProof: `${proof}=`}).success).toBe(false)
	})
})

describe('auth', () => {
	it('takes a known client id with its proof, a bare proof, or an approval id with its proof', () => {
		const auth = CONTROL_METHODS.auth.params
		expect(auth.parse({proof, clientId: 'c1'})).toEqual({proof, clientId: 'c1'})
		expect(auth.parse({proof})).toEqual({proof})
		expect(auth.parse({proof, approvalId: 'a1'})).toEqual({proof, approvalId: 'a1'})
	})

	it('refuses a missing or malformed proof, and a client id together with an approval id', () => {
		const auth = CONTROL_METHODS.auth.params
		expect(auth.safeParse({clientId: 'c1'}).success).toBe(false)
		expect(auth.safeParse({proof: 'not-a-proof', clientId: 'c1'}).success).toBe(false)
		expect(auth.safeParse({proof, clientId: 'c1', approvalId: 'a1'}).success).toBe(false)
	})

	it('answers with the chosen major, app version, boot id and granted rules', () => {
		const result = {protocol: 1, appVersion: '0.8.0', bootId: 'b1', clientId: 'c1', rules: ['trusted', 'paths.read']}
		expect(CONTROL_METHODS.auth.result.parse(result)).toEqual(result)
		expect(CONTROL_METHODS.auth.result.safeParse({...result, rules: ['root']}).success).toBe(false)
	})

	it('carries the issued client secret on the answer that collects an approval', () => {
		const result = {protocol: 1, appVersion: '0.8.0', bootId: 'b1', clientId: 'c1', rules: ['trusted'], clientSecret: 's'}
		expect(CONTROL_METHODS.auth.result.parse(result)).toEqual(result)
	})
})

describe('links.add', () => {
	it('accepts a request id, a web URL, a profile ref and a playlist mode', () => {
		const params = {requestId: 'req-1', url: 'https://www.youtube.com/watch?v=abc', profile: {kind: 'custom', id: 'p1'}, playlistMode: 'playlist'}
		expect(CONTROL_METHODS['links.add'].params.parse(params)).toEqual(params)
		expect(CONTROL_METHODS['links.add'].result.parse({intakeId: 'i1', placeholderId: 'q1'})).toEqual({intakeId: 'i1', placeholderId: 'q1'})
	})

	it('refuses a URL that is not http(s), and a missing request id', () => {
		expect(CONTROL_METHODS['links.add'].params.safeParse({requestId: 'r', url: 'file:///etc/passwd'}).success).toBe(false)
		expect(CONTROL_METHODS['links.add'].params.safeParse({requestId: 'r', url: 'not a url'}).success).toBe(false)
		expect(CONTROL_METHODS['links.add'].params.safeParse({url: 'https://example.com/v'}).success).toBe(false)
	})

	it("has no 'auto' playlist mode: leaving it out applies the hotkey's rule", () => {
		expect(CONTROL_METHODS['links.add'].params.safeParse({requestId: 'r', url: 'https://example.com/v', playlistMode: 'auto'}).success).toBe(false)
	})
})

describe('intake answers', () => {
	it('needs a positive count to take the first N, and none to take all', () => {
		const choose = CONTROL_METHODS['intake.choose'].params
		expect(choose.safeParse({intakeId: 'i1', take: 'all'}).success).toBe(true)
		expect(choose.safeParse({intakeId: 'i1', take: 'first', count: 20}).success).toBe(true)
		expect(choose.safeParse({intakeId: 'i1', take: 'first'}).success).toBe(false)
		expect(choose.safeParse({intakeId: 'i1', take: 'first', count: 0}).success).toBe(false)
		expect(choose.safeParse({intakeId: 'i1', take: 'review'}).success).toBe(false)
	})
})

describe('wait', () => {
	it('waits on one intake or one item, never both', () => {
		const wait = CONTROL_METHODS.wait.params
		expect(wait.safeParse({intakeId: 'i1', until: 'settled', timeoutMs: 1000}).success).toBe(true)
		expect(wait.safeParse({itemId: 'q1', until: 'done', timeoutMs: 1000}).success).toBe(true)
		expect(wait.safeParse({until: 'done', timeoutMs: 1000}).success).toBe(false)
		expect(wait.safeParse({intakeId: 'i1', itemId: 'q1', until: 'done', timeoutMs: 1000}).success).toBe(false)
	})

	it(`caps the timeout at ${WAIT_TIMEOUT_MAX_MS} ms`, () => {
		expect(WAIT_TIMEOUT_MAX_MS).toBe(240_000)
		expect(CONTROL_METHODS.wait.params.safeParse({itemId: 'q1', until: 'done', timeoutMs: WAIT_TIMEOUT_MAX_MS}).success).toBe(true)
		expect(CONTROL_METHODS.wait.params.safeParse({itemId: 'q1', until: 'done', timeoutMs: WAIT_TIMEOUT_MAX_MS + 1}).success).toBe(false)
	})

	it('returns the current state and whether the condition was reached', () => {
		expect(CONTROL_METHODS.wait.result.parse({reached: false, target: {kind: 'item', item}})).toEqual({reached: false, target: {kind: 'item', item}})
		const intake = {intakeId: 'i1', placeholderId: 'q1', state: {state: 'probing'}, updatedAt: 1}
		expect(CONTROL_METHODS.wait.result.parse({reached: true, target: {kind: 'intake', intake}})).toEqual({reached: true, target: {kind: 'intake', intake}})
	})
})

describe('queue verbs', () => {
	it.each(['queue.pause', 'queue.resume', 'queue.cancel', 'queue.retry', 'queue.remove'] as const)('%s takes one item id and refuses null', method => {
		expect(CONTROL_METHODS[method].params.safeParse({itemId: 'q1'}).success).toBe(true)
		expect(CONTROL_METHODS[method].params.safeParse({itemId: null}).success).toBe(false)
		expect(CONTROL_METHODS[method].params.safeParse({}).success).toBe(false)
	})

	it.each(['queue.pauseAll', 'queue.resumeAll'] as const)('%s reports partial outcomes', method => {
		const result = {scheduler: 'paused', done: ['q1', 'q2'], failed: [{itemId: 'q3', code: 'invalid_state'}]}
		expect(CONTROL_METHODS[method].result.parse(result)).toEqual(result)
		expect(CONTROL_METHODS[method].result.safeParse({...result, failed: [{itemId: 'q3', code: 'nope'}]}).success).toBe(false)
	})

	it.each(['queue.pauseAll', 'queue.resumeAll'] as const)('%s reports a running scheduler', method => {
		const result = {scheduler: 'running', done: [], failed: []}
		expect(CONTROL_METHODS[method].result.parse(result)).toEqual(result)
		expect(CONTROL_METHODS[method].result.safeParse({...result, scheduler: 'stopped'}).success).toBe(false)
	})

	it('pages queue.list with a cursor', () => {
		expect(CONTROL_METHODS['queue.list'].params.parse({})).toEqual({})
		expect(CONTROL_METHODS['queue.list'].params.safeParse({limit: 0}).success).toBe(false)
		expect(CONTROL_METHODS['queue.list'].result.parse({items: [item], nextCursor: null})).toEqual({items: [item], nextCursor: null})
	})
})
