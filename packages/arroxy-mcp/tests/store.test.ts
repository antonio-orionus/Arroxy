import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {FileSecretStore} from '../src/store'

const roots: string[] = []

afterEach(async () => {
	await Promise.all(roots.splice(0).map(root => fs.rm(root, {recursive: true, force: true})))
})

async function configDir(): Promise<string> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'amcp-store-'))
	roots.push(root)
	return path.join(root, 'nested', 'arroxy-mcp')
}

describe('FileSecretStore', () => {
	it('keeps one entry per userData folder', async () => {
		const dir = await configDir()
		const store = new FileSecretStore(dir, process.platform)

		await store.set('/a', {approvalId: 'a1'})
		await store.set('/b', {clientId: 'c1', clientSecret: 's1'})

		expect(await store.get('/a')).toEqual({approvalId: 'a1'})
		expect(await store.get('/b')).toEqual({clientId: 'c1', clientSecret: 's1'})
		expect(await store.get('/c')).toBeNull()
		await store.delete('/a')
		expect(await store.get('/a')).toBeNull()
		expect(await store.get('/b')).toEqual({clientId: 'c1', clientSecret: 's1'})
	})

	it('treats a corrupt or foreign file as empty and replaces it on the next write', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		const store = new FileSecretStore(dir, process.platform)

		await fs.writeFile(path.join(dir, 'clients.json'), '{not json')
		expect(await store.get('/a')).toBeNull()
		await fs.writeFile(path.join(dir, 'clients.json'), JSON.stringify({'/a': {clientId: 7}}))
		expect(await store.get('/a')).toBeNull()

		await store.set('/b', {approvalId: 'a2'})
		expect(JSON.parse(await fs.readFile(path.join(dir, 'clients.json'), 'utf8'))).toEqual({'/b': {approvalId: 'a2'}})
	})

	it('leaves no temp file behind', async () => {
		const dir = await configDir()
		const store = new FileSecretStore(dir, process.platform)
		await store.set('/a', {approvalId: 'a1'})
		expect(await fs.readdir(dir)).toEqual(['clients.json'])
	})
})
