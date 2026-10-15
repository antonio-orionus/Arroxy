import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'

const tempDirs: string[] = []

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
})

async function runPins(manifest: Record<string, unknown>): Promise<{status: number | null; output: string}> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-pins-'))
	tempDirs.push(root)
	await fs.writeFile(path.join(root, 'package.json'), JSON.stringify(manifest))
	const result = spawnSync(process.execPath, [path.join(process.cwd(), 'scripts/check-dependency-pins.mjs')], {cwd: root, encoding: 'utf8'})
	return {status: result.status, output: `${result.stdout}${result.stderr}`}
}

describe('check:pins', () => {
	it('accepts exact versions, exact npm aliases and catalog references to exact entries', async () => {
		const result = await runPins({devDependencies: {vitest: '5.0.3', vite: 'catalog:', alias: 'npm:@scope/real@1.2.3'}, catalog: {vite: 'npm:@voidzero-dev/vite-plus-core@1.1.0'}})

		expect(result.status).toBe(0)
	})

	it('rejects an npm alias whose version is a range or a tag', async () => {
		const result = await runPins({devDependencies: {ranged: 'npm:@scope/real@^1.2.3', tagged: 'npm:other@latest'}})

		expect(result.status).toBe(1)
		expect(result.output).toContain('ranged')
		expect(result.output).toContain('tagged')
	})

	it('rejects a catalog entry that is an unpinned npm alias', async () => {
		const result = await runPins({devDependencies: {vite: 'catalog:'}, catalog: {vite: 'npm:@voidzero-dev/vite-plus-core@latest'}})

		expect(result.status).toBe(1)
		expect(result.output).toContain('catalog\tvite')
	})

	it('rejects a catalog reference with no catalog entry', async () => {
		const result = await runPins({devDependencies: {vite: 'catalog:'}})

		expect(result.status).toBe(1)
		expect(result.output).toContain('devDependencies\tvite')
	})
})
