// @vitest-environment node

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {startControlSocket} from '@main/control/socket/startControlSocket.js'
import {ArroxyClient} from '../../packages/arroxy-mcp/src/client.js'
import {harness as controlHarness} from '../helpers/controlServiceHarness.js'
import {memoryRegistry, silentLog} from '../helpers/controlSocketHarness.js'

// The app's control socket driven by arroxy-mcp's own client, the real
// consumer: it reads control.json, checks the socket folder, runs the
// handshake and keeps the secret Arroxy issues, against a real ControlService.

const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
	for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

async function tempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'acmi-'))
	cleanups.push(() => fs.rm(dir, {recursive: true, force: true}))
	return dir
}

describe('control socket with arroxy-mcp', () => {
	it('asks for approval, collects the secret after Allow, then serves status', async () => {
		const userDataDir = await tempDir()
		const configDir = await tempDir()
		const approvals = await memoryRegistry()
		const control = controlHarness()
		const socket = await startControlSocket({userDataDir, appVersion: '9.9.9', platform: process.platform, env: {}, service: control.service, approvals, bootId: control.registry.bootId, log: silentLog()})
		if (socket === null) throw new Error('the control socket did not start')
		cleanups.push(() => socket.stop())
		const client = new ArroxyClient({environment: {platform: process.platform, homedir: configDir, env: {ARROXY_USER_DATA: userDataDir, ARROXY_MCP_CONFIG_DIR: configDir}}})

		const first = await client.call('status', {})
		expect(first).toMatchObject({ok: false, failure: {kind: 'approvalPending'}})
		const [pending] = approvals.snapshot().pending
		if (!pending) throw new Error('no pending approval')
		expect(pending.label).toBe('arroxy-mcp')

		const stillPending = await client.call('status', {})
		expect(stillPending).toMatchObject({ok: false, failure: {kind: 'approvalPending'}})
		expect(approvals.snapshot().pending).toHaveLength(1)

		approvals.allow(pending.approvalId, {pathsRead: false})
		const collected = await client.call('status', {})
		expect(collected).toEqual({ok: true, value: {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []}})

		const known = await client.call('status', {})
		expect(known.ok).toBe(true)
		expect(approvals.snapshot().pending).toEqual([])
	})
})
