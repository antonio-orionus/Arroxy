import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'

async function readWorkflow(name: string): Promise<string> {
	return readFile(join(process.cwd(), '.github/workflows', name), 'utf8')
}

describe('yt-dlp-bridge publish workflow', () => {
	it('checks the packed ytdlp-errors pin is on npm before the artifact is uploaded', async () => {
		const workflow = await readWorkflow('publish-yt-dlp-bridge.yml')
		const pack = workflow.indexOf('bun pm pack --destination')
		const precheck = workflow.indexOf('bun scripts/check-packed-dependencies.ts npm-artifacts/*.tgz')
		const upload = workflow.indexOf('actions/upload-artifact')

		expect(pack).toBeGreaterThan(-1)
		expect(precheck).toBeGreaterThan(pack)
		expect(upload).toBeGreaterThan(precheck)
	})
})
