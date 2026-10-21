import path from 'node:path'
import {Client} from '@modelcontextprotocol/client'
import {InMemoryTransport} from '@modelcontextprotocol/server'
import {controlError} from 'arroxy-control'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {ArroxyClient, NOT_RUNNING_MESSAGE} from '../src/client'
import {createArroxyMcpServer, TOOL_NAMES} from '../src/tools'
import {createSandbox, FakeApp, type FakeAppOptions, type Sandbox} from './fakeApp'

const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
	for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

async function sandbox(): Promise<Sandbox> {
	const created = await createSandbox()
	cleanups.push(created.cleanup)
	return created
}

async function startApp(options: FakeAppOptions): Promise<FakeApp> {
	const app = new FakeApp(options)
	await app.start()
	cleanups.push(() => app.stop())
	return app
}

async function connect(box: Sandbox): Promise<Client> {
	const arroxy = new ArroxyClient({environment: {platform: process.platform, homedir: path.join(box.root, 'home'), env: {ARROXY_USER_DATA: box.userDataDir, ARROXY_MCP_CONFIG_DIR: box.configDir}}})
	const server = createArroxyMcpServer(arroxy)
	// Both halves of a linked pair come from one package.
	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
	await server.connect(serverTransport)
	const client = new Client({name: 'test', version: '0.0.0'})
	await client.connect(clientTransport)
	cleanups.push(async () => {
		await client.close()
		await server.close()
	})
	return client
}

// Allows the bridge in the fake app, the way a user would click Allow.
async function allowBridge(app: FakeApp, client: Client): Promise<void> {
	await client.callTool({name: 'arroxy_status', arguments: {}})
	app.allow(app.pendingApprovals()[0] ?? '')
	await client.callTool({name: 'arroxy_status', arguments: {}})
}

function textOf(result: Awaited<ReturnType<Client['callTool']>>): string {
	const [first] = result.content
	if (first?.type !== 'text') throw new Error('expected a text block')
	return first.text
}

describe('MCP server with Arroxy closed', () => {
	it('initializes and lists every tool, without list_changed', async () => {
		const box = await sandbox()
		const client = await connect(box)

		expect(client.getServerCapabilities()?.tools?.listChanged).toBe(false)
		const {tools} = await client.listTools()
		expect(tools.map(tool => tool.name).sort()).toEqual([...TOOL_NAMES].sort())
		for (const tool of tools) {
			expect(tool.description).toBeTruthy()
			expect(tool.inputSchema.type).toBe('object')
		}
	})

	it('answers a tool call with isError and the not-running text', async () => {
		const box = await sandbox()
		const client = await connect(box)

		const result = await client.callTool({name: 'arroxy_status', arguments: {}})

		expect(result.isError).toBe(true)
		expect(textOf(result)).toBe(NOT_RUNNING_MESSAGE)
	})
})

describe('MCP tools against the app', () => {
	it('arroxy_add_link returns the intake handle and sends a fresh requestId', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const client = await connect(box)
		await allowBridge(app, client)

		const first = await client.callTool({name: 'arroxy_add_link', arguments: {url: 'https://www.youtube.com/watch?v=abc', profile: {kind: 'builtin', id: 'best'}, playlistMode: 'video'}})
		await client.callTool({name: 'arroxy_add_link', arguments: {url: 'https://www.youtube.com/watch?v=abc'}})

		expect(first.isError).toBeFalsy()
		expect(JSON.parse(textOf(first))).toEqual({intakeId: 'i1', placeholderId: 'q1'})
		expect(first.structuredContent).toEqual({intakeId: 'i1', placeholderId: 'q1'})
		const adds = app.requests.filter(request => request.method === 'links.add')
		expect(adds[0]?.params).toMatchObject({url: 'https://www.youtube.com/watch?v=abc', profile: {kind: 'builtin', id: 'best'}, playlistMode: 'video'})
		const ids = adds.map(add => (add.params as {requestId: string}).requestId)
		expect(ids[0]).toMatch(/^[0-9a-f-]{36}$/)
		expect(ids[0]).not.toBe(ids[1])
	})

	it('arroxy_add_link keeps a requestId the caller passes', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const client = await connect(box)
		await allowBridge(app, client)

		await client.callTool({name: 'arroxy_add_link', arguments: {url: 'https://example.com/v', requestId: 'mine-1'}})

		expect(app.requests.at(-1)?.params).toMatchObject({requestId: 'mine-1'})
	})

	it('turns a Control API error into isError text with its next step', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {'queue.get': () => ({error: controlError('not_found', 'No queue item q9.')})}})
		const client = await connect(box)
		await allowBridge(app, client)

		const result = await client.callTool({name: 'arroxy_get', arguments: {itemId: 'q9'}})

		expect(result.isError).toBe(true)
		expect(textOf(result)).toContain('No queue item q9.')
		expect(textOf(result)).toContain('Check the id with queue.list')
	})

	it('maps each coarse tool to its Control API method', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const client = await connect(box)
		await allowBridge(app, client)
		const calls: Array<[string, Record<string, unknown>, string, unknown]> = [
			['arroxy_get', {intakeId: 'i1'}, 'intake.get', {intakeId: 'i1'}],
			['arroxy_get', {itemId: 'q1'}, 'queue.get', {itemId: 'q1'}],
			['arroxy_list_queue', {limit: 10}, 'queue.list', {limit: 10}],
			['arroxy_wait', {intakeId: 'i1', until: 'done', timeoutMs: 1000}, 'wait', {intakeId: 'i1', until: 'done', timeoutMs: 1000}],
			['arroxy_wait', {itemId: 'q1'}, 'wait', {itemId: 'q1', until: 'settled', timeoutMs: 50_000}],
			['arroxy_item_action', {action: 'pause', itemId: 'q1'}, 'queue.pause', {itemId: 'q1'}],
			['arroxy_item_action', {action: 'remove', itemId: 'q1'}, 'queue.remove', {itemId: 'q1'}],
			['arroxy_queue_action', {action: 'pauseAll'}, 'queue.pauseAll', {}],
			['arroxy_answer_intake', {action: 'choose', intakeId: 'i1', take: 'first', count: 3}, 'intake.choose', {intakeId: 'i1', take: 'first', count: 3}]
		]

		for (const [name, args, method, params] of calls) {
			const result = await client.callTool({name, arguments: args})
			expect(result.isError, `${name} ${JSON.stringify(args)}: ${textOf(result)}`).toBeFalsy()
			expect(app.requests.at(-1)).toEqual({method, params})
		}
	})

	it('arroxy_status returns the status and the profiles together', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const client = await connect(box)
		await allowBridge(app, client)

		const result = await client.callTool({name: 'arroxy_status', arguments: {}})

		expect(result.structuredContent).toMatchObject({status: {ready: true}, profiles: {active: {kind: 'builtin', id: 'best'}}})
	})

	it('refuses arguments that do not make one Control API request, without calling the app', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const client = await connect(box)
		await allowBridge(app, client)
		const before = app.connections.length

		for (const args of [{}, {itemId: 'q1', intakeId: 'i1'}]) {
			const result = await client.callTool({name: 'arroxy_get', arguments: args})
			expect(result.isError).toBe(true)
		}
		const choose = await client.callTool({name: 'arroxy_answer_intake', arguments: {action: 'choose', intakeId: 'i1', take: 'first'}})
		expect(choose.isError).toBe(true)

		expect(app.connections.length).toBe(before)
	})
})
