import {describe, expect, it} from 'vite-plus/test'
import {findUnpublishedPins, registryHasVersion, workspaceDependencyPins} from '../../scripts/packedDependencies.js'

const workspaces = new Set(['ytdlp-errors', 'yt-dlp-bridge'])

function response(status: number): Response {
	return new Response(null, {status})
}

describe('workspaceDependencyPins', () => {
	it('lists runtime dependencies that are local workspace packages', () => {
		const packed = {name: 'yt-dlp-bridge', dependencies: {'ytdlp-errors': '1.5.0', zod: '4.6.7'}, devDependencies: {typescript: '6.0.3'}}
		expect(workspaceDependencyPins(packed, workspaces)).toEqual([{name: 'ytdlp-errors', spec: '1.5.0'}])
	})

	it('also reads peer and optional dependencies', () => {
		const packed = {name: 'x', peerDependencies: {'ytdlp-errors': '1.5.0'}, optionalDependencies: {'yt-dlp-bridge': '0.6.2'}}
		expect(workspaceDependencyPins(packed, workspaces)).toEqual([
			{name: 'ytdlp-errors', spec: '1.5.0'},
			{name: 'yt-dlp-bridge', spec: '0.6.2'}
		])
	})

	it('returns nothing for a package without workspace dependencies', () => {
		expect(workspaceDependencyPins({name: 'ytdlp-errors'}, workspaces)).toEqual([])
	})

	it('rejects packed metadata that is not a package.json object', () => {
		expect(() => workspaceDependencyPins(['nope'], workspaces)).toThrow(/package\.json/)
	})
})

describe('registryHasVersion', () => {
	it('asks the registry for that exact version', async () => {
		const urls: string[] = []
		const fetchVersion = async (url: string) => {
			urls.push(url)
			return response(200)
		}
		await expect(registryHasVersion('ytdlp-errors', '1.5.0', {registry: 'https://registry.npmjs.org/', fetch: fetchVersion})).resolves.toBe(true)
		expect(urls).toEqual(['https://registry.npmjs.org/ytdlp-errors/1.5.0'])
	})

	it('escapes the slash in a scoped package name', async () => {
		const urls: string[] = []
		const fetchVersion = async (url: string) => {
			urls.push(url)
			return response(200)
		}
		await registryHasVersion('@scope/pkg', '1.0.0', {registry: 'https://registry.npmjs.org', fetch: fetchVersion})
		expect(urls).toEqual(['https://registry.npmjs.org/@scope%2fpkg/1.0.0'])
	})

	it('reads a 404 as an unpublished version', async () => {
		await expect(registryHasVersion('ytdlp-errors', '9.9.9', {registry: 'https://registry.npmjs.org', fetch: async () => response(404)})).resolves.toBe(false)
	})

	it('fails instead of guessing when the registry errors', async () => {
		await expect(registryHasVersion('ytdlp-errors', '1.5.0', {registry: 'https://registry.npmjs.org', fetch: async () => response(503)})).rejects.toThrow(/503/)
	})
})

describe('findUnpublishedPins', () => {
	const published = new Set(['ytdlp-errors@1.5.0'])
	const hasVersion = async (name: string, version: string) => published.has(`${name}@${version}`)

	it('passes when every pinned version is on the registry', async () => {
		await expect(findUnpublishedPins([{name: 'ytdlp-errors', spec: '1.5.0'}], hasVersion)).resolves.toEqual([])
	})

	it('names the dependency to publish first when its version is missing', async () => {
		await expect(findUnpublishedPins([{name: 'ytdlp-errors', spec: '1.6.0'}], hasVersion)).resolves.toEqual(['publish ytdlp-errors 1.6.0 first: the packed package.json pins it, and the registry has no such version.'])
	})

	it('refuses a range it cannot check against one published version', async () => {
		const problems = await findUnpublishedPins([{name: 'ytdlp-errors', spec: '^1.5.0'}], hasVersion)
		expect(problems).toEqual(['ytdlp-errors is packed as "^1.5.0", not an exact version; depend on it with workspace:* so the pin can be checked.'])
	})
})
