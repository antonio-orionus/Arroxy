import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'

async function readOptionalWorkflow(path: string): Promise<string> {
	try {
		return await readFile(join(process.cwd(), path), 'utf8')
	} catch {
		return ''
	}
}

describe('dev smoke workflow', () => {
	it('runs bootstrap, doctor, and browser-mock smoke on every PR platform', async () => {
		const workflow = await readOptionalWorkflow('.github/workflows/dev-smoke.yml')

		expect(workflow).toContain('name: Dev Smoke')
		expect(workflow).toContain('workflow_dispatch:')
		// Every pull request, not only those into main: a stacked PR moved onto
		// main after its base merges must already carry this required check. And
		// every push to main, where the release script verifies required checks.
		expect(workflow).toMatch(/^on:\n  push:\n    branches: \[main\]\n  pull_request:\n  workflow_dispatch:/m)
		expect(workflow).toContain('fail-fast: false')
		expect(workflow).toContain('max-parallel: 3')
		expect(workflow).toContain('os: windows-latest')
		expect(workflow).toContain('label: windows')
		expect(workflow).toContain('os: macos-latest')
		expect(workflow).toContain('label: macos-arm64')
		expect(workflow).toContain('os: ubuntu-latest')
		expect(workflow).toContain('label: linux')
		expect(workflow).toContain('node-version-file: .node-version')
		expect(workflow).toContain('bun-version: ${{ env.BUN_VERSION }}')
		expect(workflow).toContain('Cache bun dependencies')
		expect(workflow).toContain("key: ${{ matrix.os }}-bun-${{ hashFiles('bun.lock') }}")
		expect(workflow).toContain('run: bun run bootstrap')
		expect(workflow).toContain('run: bun run doctor')
		expect(workflow).toContain('run: bun run test:browser:smoke')
		expect(workflow).toContain('name: dev-smoke-playwright-${{ matrix.label }}')
	})

	it('pins third-party actions to immutable SHAs', async () => {
		const workflow = await readOptionalWorkflow('.github/workflows/dev-smoke.yml')

		expect(workflow).toMatch(/uses: actions\/checkout@[a-f0-9]{40}/)
		expect(workflow).toMatch(/uses: actions\/setup-node@[a-f0-9]{40}/)
		expect(workflow).toMatch(/uses: oven-sh\/setup-bun@[a-f0-9]{40}/)
		expect(workflow).toMatch(/uses: actions\/cache@[a-f0-9]{40}/)
		expect(workflow).not.toMatch(/uses: (?:actions\/checkout|actions\/setup-node|oven-sh\/setup-bun|actions\/cache)@v/)
	})
})
