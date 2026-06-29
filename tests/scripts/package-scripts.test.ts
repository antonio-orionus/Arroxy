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

	it('previews the macOS installer from the prepackaged app', async () => {
		const packageJson = await readPackageJson()

		expect(packageJson.scripts?.['preview:installer']).toBe("electron-builder --mac dmg --arm64 --prepackaged dist/mac-arm64/Arroxy.app --publish never && node -e \"require('node:child_process').execFileSync('open', ['dist/Arroxy-mac-arm64.dmg'])\"")
	})
})
