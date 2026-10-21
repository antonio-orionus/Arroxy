import {spawnSync} from 'node:child_process'
import {mkdtempSync, readFileSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vite-plus/test'

const SCRIPT = fileURLToPath(new URL('../../scripts/check-issue-policy.ts', import.meta.url))

// Runs the checker the way the workflow does: the issue as `gh issue view
// --json title,body,labels` wrote it, the author association in the env.
function run(issue: unknown, authorAssociation = 'OWNER'): {status: number | null; output: string; report: string} {
	const dir = mkdtempSync(join(tmpdir(), 'issue-policy-'))
	const file = join(dir, 'issue.json')
	const output = join(dir, 'output')
	const reportPath = join(dir, 'report.md')
	writeFileSync(file, JSON.stringify(issue))
	writeFileSync(output, '')
	const result = spawnSync('bun', [SCRIPT], {encoding: 'utf8', env: {...process.env, ISSUE_FILE: file, ISSUE_AUTHOR_ASSOCIATION: authorAssociation, ISSUE_REPORT: reportPath, GITHUB_OUTPUT: output}})
	let report = ''
	try {
		report = readFileSync(reportPath, 'utf8')
	} catch {}
	return {status: result.status, output: readFileSync(output, 'utf8'), report}
}

describe('check-issue-policy', () => {
	it('passes a well-formed issue and reports whether it is flagged now', () => {
		const result = run({title: 'Links lose an apostrophe', body: 'See `src/shared/bulkUrls.ts:28`.', labels: [{name: 'bug'}, {name: 'needs-triage'}]})
		expect(result.status).toBe(0)
		expect(result.output).toBe('verdict=pass\nflagged=true\n')
	})

	it('fails a bug without a location and writes the comment', () => {
		const result = run({title: 'Something broke', body: 'It broke.', labels: [{name: 'bug'}]})
		expect(result.output).toBe('verdict=fail\nflagged=false\n')
		expect(result.report).toContain('**location:**')
	})

	it('skips a community issue', () => {
		expect(run({title: 'x', body: '', labels: []}, 'NONE').output).toBe('verdict=skip\nflagged=false\n')
	})

	it('exits non-zero on an unreadable snapshot instead of judging an empty issue', () => {
		const result = run('not an issue')
		expect(result.status).not.toBe(0)
		expect(result.output).toBe('')
	})
})
