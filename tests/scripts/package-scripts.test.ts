import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

interface PackageJson {
	scripts?: Record<string, string>
}

async function readPackageJson(): Promise<PackageJson> {
	return JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf8')) as PackageJson
}

describe('package scripts', () => {
	it('fetches host embedded binaries through the cross-platform Bun wrapper', async () => {
		const packageJson = await readPackageJson()

		expect(packageJson.scripts?.['embed:fetch:host']).toBe('bun scripts/build/fetchEmbeddedHost.ts')
	})
})
