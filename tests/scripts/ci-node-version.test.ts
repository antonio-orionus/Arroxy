import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

async function readWorkflow(path: string): Promise<string> {
	return readFile(join(process.cwd(), path), 'utf8')
}

describe('CI Node version pin', () => {
	it('uses the repo Node version file for check gates', async () => {
		const [ci, release, runtimeBinaries] = await Promise.all([readWorkflow('.github/workflows/ci.yml'), readWorkflow('.github/workflows/release.yml'), readWorkflow('.github/workflows/runtime-binaries.yml')])

		expect(ci).toContain('node-version-file: .node-version')
		expect(release).toContain('node-version-file: .node-version')
		expect(runtimeBinaries).toContain('node-version-file: .node-version')
		expect(ci).not.toMatch(/node-version:\s*['"]?22/)
		expect(release).not.toMatch(/node-version:\s*['"]?22/)
		expect(runtimeBinaries).not.toMatch(/node-version:\s*['"]?22/)
	})
})
