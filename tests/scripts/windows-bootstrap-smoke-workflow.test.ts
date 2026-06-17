import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

async function readOptionalWorkflow(path: string): Promise<string> {
	try {
		return await readFile(join(process.cwd(), path), 'utf8')
	} catch {
		return ''
	}
}

describe('Windows bootstrap smoke workflow', () => {
	it('runs bootstrap and doctor on a fresh Windows runner', async () => {
		const workflow = await readOptionalWorkflow('.github/workflows/windows-bootstrap-smoke.yml')

		expect(workflow).toContain('runs-on: windows-latest')
		expect(workflow).toContain('workflow_dispatch:')
		expect(workflow).toContain('pull_request:')
		expect(workflow).toContain('branches: [main]')
		expect(workflow).toContain('node-version-file: .node-version')
		expect(workflow).toContain('bun-version: ${{ env.BUN_VERSION }}')
		expect(workflow).toContain('run: bun run bootstrap')
		expect(workflow).toContain('run: bun run doctor')
	})
})
