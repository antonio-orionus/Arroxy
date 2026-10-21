import {readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import {describe, expect, it} from 'vite-plus/test'
import {decideIssueAction, MAIN_HEALTH_TITLE, MAIN_REQUIRED_CHECKS, mainHealth, parseBodies, parseCheckRuns, parseCommit, parseIssueNumbers, workflowRunIdOf, type CheckRun, type CommitInfo, type MainHealth} from '../../scripts/mainHealth.js'

const CONTEXTS = MAIN_REQUIRED_CHECKS.map(check => check.context)

// GitHub numbers check runs in creation order, so a later attempt has a higher id.
function run(name: string, status: string, conclusion: string | null = null, id = 1): CheckRun {
	return {id, name, status, conclusion, html_url: `https://github.com/o/r/runs/${name.replaceAll(' ', '-')}`}
}

const allPassed = (): CheckRun[] => CONTEXTS.map(context => run(context, 'completed', 'success'))

const commit: CommitInfo = {sha: 'c62a58d37696d3c4815c0ede2ff49831ed2f0f4b', subject: 'feat(i18n): add 19 languages, Hebrew right to left (#432)', author: 'antonio-orionus', url: 'https://github.com/o/r/commit/c62a58d37696d3c4815c0ede2ff49831ed2f0f4b'}
const repoUrl = 'https://github.com/o/r'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function loadWorkflow(file: string): Record<string, unknown> {
	const doc = yaml.load(readFileSync(`.github/workflows/${file}`, 'utf8'))
	if (!isRecord(doc)) throw new Error(`${file} is not a mapping`)
	return doc
}

describe('mainHealth', () => {
	it('is green once every required check passed', () => {
		expect(mainHealth(allPassed())).toEqual({kind: 'green'})
	})

	it('is red as soon as one required check failed, even while others still run', () => {
		const runs = [run('check', 'completed', 'failure'), run('Dev smoke gate', 'in_progress')]
		const health = mainHealth(runs)
		expect(health.kind).toBe('red')
		expect(health.kind === 'red' && health.failing.map(check => [check.context, check.workflow, check.detail])).toEqual([['check', 'CI', 'failure']])
	})

	it('counts a timed-out or never-started run as red', () => {
		const runs = [...allPassed().filter(r => r.name !== 'Cold start gate' && r.name !== 'check'), run('Cold start gate', 'completed', 'timed_out'), run('check', 'completed', 'startup_failure')]
		const health = mainHealth(runs)
		expect(health.kind === 'red' && health.failing.map(check => check.context)).toEqual(['check', 'Cold start gate'])
	})

	it('reads only the latest attempt, so a passing re-run clears a failure', () => {
		const runs = [...allPassed().filter(r => r.name !== 'check'), run('check', 'completed', 'failure', 1), run('check', 'completed', 'success', 2)]
		expect(mainHealth(runs)).toEqual({kind: 'green'})
	})

	it('waits while a required check has not finished', () => {
		const health = mainHealth(allPassed().filter(r => r.name !== 'Dev smoke gate'))
		expect(health.kind === 'unsettled' && health.waiting.map(check => [check.context, check.detail])).toEqual([['Dev smoke gate', 'not started']])
	})

	it('gives no verdict on a cancelled or skipped check: nobody learned whether main is broken', () => {
		const runs = [...allPassed().filter(r => r.name !== 'check' && r.name !== 'E2E fixtures gate'), run('check', 'completed', 'cancelled'), run('E2E fixtures gate', 'completed', 'skipped')]
		expect(mainHealth(runs).kind).toBe('unsettled')
	})

	it('gives no verdict on a gate that failed only because its workflow run was cancelled', () => {
		// A gate job runs with always(), so cancelling the run fails it on its cancelled needs (731e660b, 2026-10-21).
		const gate = {...run('Dev smoke gate', 'completed', 'failure', 5), html_url: 'https://github.com/o/r/actions/runs/39591960168/job/119195148714'}
		const runs = [...allPassed().filter(r => r.name !== 'Dev smoke gate'), gate]
		expect(mainHealth(runs, new Set([39591960168]))).toMatchObject({kind: 'unsettled', waiting: [{context: 'Dev smoke gate', detail: 'workflow run cancelled'}]})
		expect(mainHealth(runs, new Set([1])).kind).toBe('red')
	})

	it('ignores checks that branch protection does not require', () => {
		expect(mainHealth([...allPassed(), run('electron-builder dist-tag advisory', 'completed', 'failure')])).toEqual({kind: 'green'})
	})
})

describe('GitHub response parsers', () => {
	it('reads check runs and rejects a response without them', () => {
		expect(parseCheckRuns({total_count: 1, check_runs: [{id: 3, name: 'check', status: 'completed', conclusion: 'failure', html_url: 'u', extra: true}]})).toEqual([{id: 3, name: 'check', status: 'completed', conclusion: 'failure', html_url: 'u'}])
		expect(parseCheckRuns({check_runs: [{id: 4, name: 'check', status: 'queued', conclusion: null, html_url: null}]})[0]?.conclusion).toBeNull()
		expect(() => parseCheckRuns({message: 'Not Found'})).toThrow('no check_runs')
		expect(() => parseCheckRuns({check_runs: [{id: '3', name: 'check', status: 'completed'}]})).toThrow('check run: id')
	})

	it('names the GitHub login, else the git author, and keeps the subject line only', () => {
		const raw = {sha: 's', html_url: 'u', author: {login: 'octo'}, commit: {message: 'fix: a thing (#9)\n\nbody', author: {name: 'Octo Cat'}}}
		expect(parseCommit(raw)).toEqual({sha: 's', subject: 'fix: a thing (#9)', author: 'octo', url: 'u'})
		expect(parseCommit({...raw, author: null}).author).toBe('Octo Cat')
		expect(() => parseCommit({sha: 's'})).toThrow()
	})

	it('flattens paginated issues and comments', () => {
		expect(parseIssueNumbers([[{number: 4}], [{number: 9}]])).toEqual([4, 9])
		expect(parseBodies([[{body: 'a'}, {body: null}], [{body: 'b'}]])).toEqual(['a', 'b'])
		expect(() => parseIssueNumbers([{number: 4}])).toThrow('page is not an array')
	})
})

describe('workflowRunIdOf', () => {
	it('reads the workflow run from a check run link', () => {
		expect(workflowRunIdOf('https://github.com/o/r/actions/runs/39516393093/job/118951728131')).toBe(39516393093)
		expect(workflowRunIdOf('https://github.com/o/r/runs/1')).toBeNull()
		expect(workflowRunIdOf(null)).toBeNull()
	})
})

describe('decideIssueAction', () => {
	const red = mainHealth([...allPassed().filter(r => r.name !== 'check'), run('check', 'completed', 'failure')])

	it('opens the issue with the failing check, commit, author, pull request and run link', () => {
		const action = decideIssueAction(red, null, commit, repoUrl)
		expect(action.kind).toBe('open')
		if (action.kind !== 'open') return
		expect(action.title).toBe(MAIN_HEALTH_TITLE)
		expect(action.body).toContain('[`c62a58d`](https://github.com/o/r/commit/c62a58d37696d3c4815c0ede2ff49831ed2f0f4b)')
		expect(action.body).toContain('feat(i18n): add 19 languages, Hebrew right to left (#432)')
		expect(action.body).toContain('| CI | [check](https://github.com/o/r/runs/check) | failure |')
		expect(action.body).toContain('@antonio-orionus')
		expect(action.body).toContain('https://github.com/o/r/pull/432')
	})

	it('names a direct push when the commit came from no pull request', () => {
		const action = decideIssueAction(red, null, {...commit, subject: 'docs: tidy the release runbook'}, repoUrl)
		expect(action.kind === 'open' && action.body).toContain('pushed straight to `main`')
	})

	it('comments on the open issue when main is still or newly red', () => {
		const action = decideIssueAction(red, {number: 7, texts: ['opened for an older commit']}, commit, repoUrl)
		expect(action).toMatchObject({kind: 'comment', issue: 7})
	})

	it('reports one failure on one commit once, however many workflow runs finish after it', () => {
		const first = decideIssueAction(red, null, commit, repoUrl)
		if (first.kind !== 'open') throw new Error('expected open')
		expect(decideIssueAction(red, {number: 7, texts: [first.body]}, commit, repoUrl)).toEqual({kind: 'none', reason: 'already reported on #7'})
	})

	it('reports a second check that failed later on the same commit', () => {
		const first = decideIssueAction(red, null, commit, repoUrl)
		if (first.kind !== 'open') throw new Error('expected open')
		const worse: MainHealth = mainHealth([...allPassed().filter(r => r.name !== 'check' && r.name !== 'Dev smoke gate'), run('check', 'completed', 'failure'), run('Dev smoke gate', 'completed', 'failure')])
		expect(decideIssueAction(worse, {number: 7, texts: [first.body]}, commit, repoUrl).kind).toBe('comment')
	})

	it('closes the open issue once every required check passed again', () => {
		const action = decideIssueAction({kind: 'green'}, {number: 7, texts: []}, commit, repoUrl)
		expect(action.kind).toBe('close')
		expect(action.kind === 'close' && action.body).toContain('c62a58d')
	})

	it('does nothing on a green main with no open issue, or while checks still run', () => {
		expect(decideIssueAction({kind: 'green'}, null, commit, repoUrl).kind).toBe('none')
		expect(decideIssueAction(mainHealth([]), {number: 7, texts: []}, commit, repoUrl).kind).toBe('none')
	})
})

describe('main-health workflow', () => {
	const workflow = loadWorkflow('main-health.yml')
	const on = isRecord(workflow.on) ? workflow.on : {}
	const trigger = isRecord(on.workflow_run) ? on.workflow_run : {}

	it('lists the branch protection contract in dev-docs', () => {
		const line = readFileSync('dev-docs/ci-cd-strategy.md', 'utf8')
			.split('\n')
			.find(l => l.startsWith('Required checks:'))
		const documented = [...(line ?? '').matchAll(/`([^`]+)`/g)].map(match => match[1])
		expect(documented).toEqual(CONTEXTS)
	})

	it('wakes on every workflow that reports a required check, only for main', () => {
		expect(trigger.workflows).toEqual([...new Set(MAIN_REQUIRED_CHECKS.map(check => check.workflow))])
		expect(trigger.types).toEqual(['completed'])
		expect(trigger.branches).toEqual(['main'])
	})

	it.each(MAIN_REQUIRED_CHECKS)('$workflow reports "$context" on pushes to main', ({workflow: name, context}) => {
		const file = ['ci.yml', 'dev-smoke.yml', 'e2e-cold-start.yml', 'e2e-fixtures.yml', 'ffmpeg-remux-matrix.yml', 'installer-smoke.yml'].map(loadWorkflow).find(doc => doc.name === name)
		expect(file, `no workflow named ${name}`).toBeDefined()
		const jobs = isRecord(file?.jobs) ? Object.values(file.jobs) : []
		expect(jobs.some(job => isRecord(job) && job.name === context)).toBe(true)
		const push = isRecord(file?.on) && isRecord(file.on.push) ? file.on.push : {}
		expect(push.branches).toContain('main')
	})

	it('counts every completed run on main except pull requests', () => {
		const jobs = isRecord(workflow.jobs) ? Object.values(workflow.jobs) : []
		expect(jobs.map(job => (isRecord(job) ? job.if : undefined))).toEqual(["github.event_name == 'workflow_dispatch' || github.event.workflow_run.event != 'pull_request'"])
	})

	it('runs without installing dependencies, so a push that breaks the install is still reported', () => {
		expect(readFileSync('.github/workflows/main-health.yml', 'utf8')).not.toMatch(/run:.*\bbun (install|i)\b/)
		for (const file of ['scripts/main-health.ts', 'scripts/mainHealth.ts']) {
			const specifiers = [...readFileSync(file, 'utf8').matchAll(/^import .* from '([^']+)'/gm)].map(match => match[1])
			for (const specifier of specifiers) expect(specifier, `${file} imports ${specifier}`).toMatch(/^(node:|\.\/mainHealth\.js$)/)
		}
	})

	it('holds only the permissions it uses and pins its actions', () => {
		expect(workflow.permissions).toEqual({})
		const jobs = isRecord(workflow.jobs) ? Object.values(workflow.jobs) : []
		expect(jobs.map(job => (isRecord(job) ? job.permissions : undefined))).toEqual([{contents: 'read', actions: 'read', checks: 'read', issues: 'write'}])
		const text = readFileSync('.github/workflows/main-health.yml', 'utf8')
		for (const [, ref] of text.matchAll(/uses: [^@\s]+@(\S+)/g)) expect(ref).toMatch(/^[a-f0-9]{40}$/)
	})
})
