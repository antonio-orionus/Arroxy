import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {CONTROL_DISCOVERY_FILE_NAME, type ControlMethod, type ControlResult, controlDiscoverySchema, parseControlResult} from '../../packages/arroxy-control/src/index.js'
import {FIXTURE_VIDEO_IDS, runProcess, type ProcessResult} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Risk: an agent drives the real app from outside it. The arroxy-mcp command
// line finds the running app through control.json, asks to be allowed (the
// E2E run allows every client at once), collects its secret on the next call,
// and from then on adds a link and pauses and resumes the download it became,
// with the window showing the same row the agent sees.
//
// Fixture: one video whose media the fixture server holds, so the download
// is still running when the agent pauses it. Oracles: the CLI's JSON answers,
// the queue row's status in the window, and the file on disk.

const VIDEO_ID = FIXTURE_VIDEO_IDS[0]
const CLI = path.join(process.cwd(), 'packages', 'arroxy-mcp', 'src', 'cli.ts')

function cliEnvironment(userDataDir: string, configDir: string): Record<string, string> {
	const env: Record<string, string> = {}
	for (const [key, value] of Object.entries(process.env)) if (value !== undefined && !key.startsWith('ARROXY_')) env[key] = value
	return {...env, ARROXY_USER_DATA: userDataDir, ARROXY_MCP_CONFIG_DIR: configDir}
}

// The workspace's own CLI from its sources; bun resolves arroxy-control through the package's tsconfig.
function arroxyMcp(env: Record<string, string>) {
	return (...args: string[]): Promise<ProcessResult> => runProcess('bun', [CLI, ...args], {env, timeoutMs: 60_000})
}

// The CLI prints the method's result as JSON; parsed with the protocol's own schema.
function answer<M extends ControlMethod>(method: M, result: ProcessResult): ControlResult<M> {
	expect(result.exitCode, result.stderr).toBe(0)
	const parsed = parseControlResult(method, JSON.parse(result.stdout))
	if (!parsed.success) throw new Error(`${method} answered ${result.stdout}`)
	return parsed.data
}

test('an agent adds a link over the control socket, then pauses and resumes its download', async () => {
	test.setTimeout(240_000)
	const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-fixture-agent-mcp-'))
	// The socket's launch folder, removed below if a failed run left it.
	let socketDir: string | null = null
	try {
		await withFixtureProductApp({behavior: {mediaSlowIds: [VIDEO_ID]}, userDataPrefix: 'arroxy-fixture-agent-user-', outputPrefix: 'arroxy-fixture-agent-out-'}, async ({app, page, fixtureServer, userDataDir, urls, queue, files}) => {
			const cli = arroxyMcp(cliEnvironment(userDataDir, path.join(configDir, 'arroxy-mcp')))

			// The app writes control.json once its socket listens.
			const discoveryFile = path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME)
			await expect.poll(() => fs.existsSync(discoveryFile), {timeout: 30_000}).toBe(true)
			const discovery = controlDiscoverySchema.parse(JSON.parse(fs.readFileSync(discoveryFile, 'utf8')))
			if (process.platform !== 'win32') socketDir = path.dirname(discovery.socketPath)

			// First contact asks to be allowed; the next call collects the secret.
			const asked = await cli('status')
			expect(asked.exitCode, asked.stdout).toBe(1)
			expect(asked.stderr).toMatch(/allow/i)
			answer('status', await cli('status'))

			const {intakeId} = answer('links.add', await cli('add', urls.video(VIDEO_ID), '--video'))
			const settled = answer('wait', await cli('wait', '--intake', intakeId, '--until', 'settled', '--timeout', '60000'))
			expect(settled).toMatchObject({reached: true, target: {kind: 'intake', intake: {state: {state: 'queued', itemIds: [expect.any(String)]}}}})
			const state = settled.target.kind === 'intake' ? settled.target.intake.state : null
			const itemId = state?.state === 'queued' ? state.itemIds[0] : undefined
			if (itemId === undefined) throw new Error('the intake queued no item')
			const item = async (...args: string[]) => answer('queue.get', await cli(...args)).item

			// The window shows the agent's row; its media is held, so it keeps running.
			await queue.open()
			const row = page.getByTestId(`queue-manager-row-${itemId}`)
			await expect(row).toHaveAttribute('data-status', 'running', {timeout: 60_000})
			await expect.poll(async () => (await item('get', itemId)).status, {timeout: 30_000}).toBe('running')
			expect((await item('get', itemId)).origin).toMatchObject({kind: 'localClient'})

			expect((await item('pause', itemId)).status).toBe('paused')
			// The window tells a paused download that had started (paused-active) from one that had not.
			await expect(row).toHaveAttribute('data-status', /^paused/)

			expect((await item('resume', itemId)).status).not.toBe('paused')
			await expect(row).not.toHaveAttribute('data-status', /^paused/)

			// Released, the resumed download finishes to a real file.
			fixtureServer.releaseSlowMedia(VIDEO_ID)
			expect(answer('wait', await cli('wait', itemId, '--until', 'done', '--timeout', '120000'))).toMatchObject({reached: true, target: {kind: 'item', item: {id: itemId, status: 'done'}}})
			await expect(row).toHaveAttribute('data-status', 'done')
			files.expectMp4Count(1)

			// A clean quit deletes control.json and the socket's launch folder.
			await app.close()
			expect(fs.existsSync(discoveryFile)).toBe(false)
			if (socketDir !== null) expect(fs.existsSync(socketDir)).toBe(false)
		})
	} finally {
		fs.rmSync(configDir, {recursive: true, force: true})
		if (socketDir !== null) fs.rmSync(socketDir, {recursive: true, force: true})
	}
})
