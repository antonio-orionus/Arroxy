import path from 'node:path'
import {controlError} from 'arroxy-control'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {parseCommand, runCli} from '../src/cli-run'
import {ArroxyClient, NOT_RUNNING_MESSAGE} from '../src/client'
import {ARROXY_MCP_VERSION} from '../src/version'
import {createSandbox, FakeApp, type FakeAppOptions, type Sandbox} from './fakeApp'

const REQUEST_ID = '00000000-0000-4000-8000-000000000000'
const parse = (argv: string[]): ReturnType<typeof parseCommand> => parseCommand(argv, () => REQUEST_ID)

describe('parseCommand', () => {
	it('serves MCP with no command, or with serve', () => {
		expect(parse([])).toEqual({kind: 'serve'})
		expect(parse(['serve'])).toEqual({kind: 'serve'})
	})

	it('answers --help and --version', () => {
		expect(parse(['--help'])).toEqual({kind: 'help'})
		expect(parse(['-h'])).toEqual({kind: 'help'})
		expect(parse(['--version'])).toEqual({kind: 'version'})
	})

	it('maps the read commands', () => {
		expect(parse(['status'])).toEqual({kind: 'call', method: 'status', params: {}})
		expect(parse(['profiles'])).toEqual({kind: 'call', method: 'profiles.list', params: {}})
		expect(parse(['queue'])).toEqual({kind: 'call', method: 'queue.list', params: {}})
		expect(parse(['queue', '--cursor', 'next-1', '--limit', '20'])).toEqual({kind: 'call', method: 'queue.list', params: {cursor: 'next-1', limit: 20}})
		expect(parse(['get', 'q1'])).toEqual({kind: 'call', method: 'queue.get', params: {itemId: 'q1'}})
		expect(parse(['get', '--intake', 'i1'])).toEqual({kind: 'call', method: 'intake.get', params: {intakeId: 'i1'}})
	})

	it('maps add with its profile and playlist flags', () => {
		expect(parse(['add', 'https://example.com/v'])).toEqual({kind: 'call', method: 'links.add', params: {requestId: REQUEST_ID, url: 'https://example.com/v'}})
		expect(parse(['add', 'https://example.com/v', '--profile', 'custom:p-2', '--playlist'])).toEqual({kind: 'call', method: 'links.add', params: {requestId: REQUEST_ID, url: 'https://example.com/v', profile: {kind: 'custom', id: 'p-2'}, playlistMode: 'playlist'}})
		expect(parse(['add', 'https://example.com/v', '--profile', 'builtin:best', '--video'])).toMatchObject({params: {profile: {kind: 'builtin', id: 'best'}, playlistMode: 'video'}})
		expect(parse(['add', 'https://example.com/v', '--request-id', 'mine-1'])).toMatchObject({params: {requestId: 'mine-1'}})
	})

	it('maps wait with defaults and flags', () => {
		expect(parse(['wait', 'q1'])).toEqual({kind: 'call', method: 'wait', params: {itemId: 'q1', until: 'settled', timeoutMs: 50_000}})
		expect(parse(['wait', '--intake', 'i1', '--until', 'done', '--timeout', '1000'])).toEqual({kind: 'call', method: 'wait', params: {intakeId: 'i1', until: 'done', timeoutMs: 1000}})
	})

	it('maps the queue controls', () => {
		for (const action of ['pause', 'resume', 'cancel', 'retry', 'remove']) expect(parse([action, 'q1'])).toEqual({kind: 'call', method: `queue.${action}`, params: {itemId: 'q1'}})
		expect(parse(['pause-all'])).toEqual({kind: 'call', method: 'queue.pauseAll', params: {}})
		expect(parse(['resume-all'])).toEqual({kind: 'call', method: 'queue.resumeAll', params: {}})
	})

	it('refuses bad input with a usage message', () => {
		for (const argv of [
			['launch'],
			['add'],
			['add', 'ftp://example.com/v'],
			['add', 'https://example.com/v', '--profile', 'best'],
			['add', 'https://example.com/v', '--playlist', '--video'],
			['get'],
			['pause'],
			['pause', 'q1', 'q2'],
			['queue', '--limit', 'ten'],
			['wait', 'q1', '--until', 'later'],
			['status', '--bogus'],
			['status', 'extra']
		]) {
			const parsed = parse(argv)
			expect(parsed.kind, argv.join(' ')).toBe('usage')
		}
	})

	it('refuses names inherited from Object.prototype as commands', () => {
		for (const command of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
			expect(parse([command]), command).toEqual({kind: 'usage', message: `Unknown command "${command}".`})
			expect(parse([command, 'q1']).kind, `${command} q1`).toBe('usage')
			expect(parse([command, '--intake']).kind, `${command} --intake`).toBe('usage')
		}
	})
})

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

interface Run {
	readonly code: number
	readonly stdout: string
	readonly stderr: string
}

async function run(box: Sandbox, argv: string[]): Promise<Run> {
	let stdout = ''
	let stderr = ''
	let served = false
	const client = new ArroxyClient({environment: {platform: process.platform, homedir: path.join(box.root, 'home'), env: {ARROXY_USER_DATA: box.userDataDir, ARROXY_MCP_CONFIG_DIR: box.configDir}}})
	const code = await runCli(argv, {
		client,
		stdout: text => void (stdout += text),
		stderr: text => void (stderr += text),
		serve: async () => {
			served = true
		},
		newRequestId: () => REQUEST_ID
	})
	return {code, stdout: served ? 'served' : stdout, stderr}
}

describe('runCli', () => {
	it('exits 2 with the not-running message when Arroxy is closed', async () => {
		const box = await sandbox()
		const result = await run(box, ['status'])
		expect(result).toEqual({code: 2, stdout: '', stderr: `${NOT_RUNNING_MESSAGE}\n`})
	})

	it('prints the JSON result and exits 0', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		expect((await run(box, ['status'])).code).toBe(1)
		app.allow(app.pendingApprovals()[0] ?? '')

		const result = await run(box, ['add', 'https://example.com/v'])

		expect(result.code).toBe(0)
		expect(JSON.parse(result.stdout)).toEqual({intakeId: 'i1', placeholderId: 'q1'})
		expect(app.requests.at(-1)).toEqual({method: 'links.add', params: {requestId: REQUEST_ID, url: 'https://example.com/v'}})
	})

	it('prints the error and its next step to stderr and exits 1', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {'queue.pause': () => ({error: controlError('invalid_state', 'q1 is done.')})}})
		await run(box, ['status'])
		app.allow(app.pendingApprovals()[0] ?? '')

		const result = await run(box, ['pause', 'q1'])

		expect(result.code).toBe(1)
		expect(result.stdout).toBe('')
		expect(result.stderr).toContain('q1 is done.')
		expect(result.stderr).toContain('Read the current state with queue.get')
	})

	it('reports the approval request on stderr', async () => {
		const box = await sandbox()
		await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const result = await run(box, ['status'])
		expect(result.code).toBe(1)
		expect(result.stderr).toContain('Choose Allow in Arroxy')
	})

	it('prints usage for a bad command and exits 1', async () => {
		const box = await sandbox()
		const result = await run(box, ['launch'])
		expect(result.code).toBe(1)
		expect(result.stderr).toContain('Usage')
	})

	it('prints help and the version on stdout', async () => {
		const box = await sandbox()
		expect((await run(box, ['--help'])).stdout).toContain('add <url> [--profile builtin:<id>|custom:<id>]')
		expect(await run(box, ['--version'])).toEqual({code: 0, stdout: `${ARROXY_MCP_VERSION}\n`, stderr: ''})
	})

	it('serves MCP when no command is given', async () => {
		const box = await sandbox()
		expect(await run(box, [])).toEqual({code: 0, stdout: 'served', stderr: ''})
	})
})
