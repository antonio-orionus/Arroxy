import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

async function readWorkflow(): Promise<string> {
	return readFile(join(process.cwd(), '.github/workflows/deps-vuln-gate.yml'), 'utf8')
}

describe('dependency vulnerability gate workflow', () => {
	it('audits only when the dependency graph changed', async () => {
		const workflow = await readWorkflow()

		expect(workflow).toContain('fetch-depth: 0')
		expect(workflow).toContain('id: audit-scope')
		expect(workflow).toContain('bun scripts/dependencyAuditScope.ts "${BASE_REF}"')
		expect(workflow).toContain("if: steps.audit-scope.outputs.audit_required == 'true'")
	})

	it('pins third-party actions to immutable SHAs', async () => {
		const workflow = await readWorkflow()

		expect(workflow).toMatch(/uses: actions\/checkout@[a-f0-9]{40}/)
		expect(workflow).toMatch(/uses: oven-sh\/setup-bun@[a-f0-9]{40}/)
		expect(workflow).not.toMatch(/uses: (?:actions\/checkout|oven-sh\/setup-bun)@v/)
	})
})
