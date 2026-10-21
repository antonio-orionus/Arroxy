import fs from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {ARROXY_MCP_VERSION} from '../src/version'

describe('ARROXY_MCP_VERSION', () => {
	it('matches package.json, so hello names the version that ships', () => {
		const manifest: unknown = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'package.json'), 'utf8'))
		expect(manifest).toMatchObject({version: ARROXY_MCP_VERSION})
	})
})
