import {readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import picomatch from 'picomatch'
import {describe, expect, it} from 'vite-plus/test'

const ACTION_PATH = '.github/actions/app-changes/action.yml'
const SCOPES = ['e2e', 'browser', 'installer'] as const
type Scope = (typeof SCOPES)[number]

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown, what: string): Record<string, unknown> {
	if (!isRecord(value)) throw new Error(`${what} is not a mapping`)
	return value
}

function readYaml(path: string): Record<string, unknown> {
	return record(yaml.load(readFileSync(path, 'utf8')), path)
}

// Anchored rules nest arrays, which paths-filter flattens.
function flatPatterns(value: unknown): string[] {
	if (typeof value === 'string') return [value]
	if (Array.isArray(value)) return value.flatMap(flatPatterns)
	throw new Error('a filter rule is neither a pattern nor a list')
}

function filterRules(): Record<string, string[]> {
	const steps = record(readYaml(ACTION_PATH).runs, 'runs').steps
	if (!Array.isArray(steps)) throw new Error('the action has no steps')
	const filter = record(steps[0], 'the filter step')
	const inputs = record(filter.with, 'the filter inputs')
	expect(filter.uses).toMatch(/^dorny\/paths-filter@[a-f0-9]{40}$/)
	expect(inputs['predicate-quantifier']).toBe('some-with-excludes')
	if (typeof inputs.filters !== 'string') throw new Error('the filters input is not a string')
	return Object.fromEntries(Object.entries(record(yaml.load(inputs.filters), 'filters')).map(([name, rule]) => [name, flatPatterns(rule)]))
}

// paths-filter's `some-with-excludes`: picomatch with dotfiles, a file counts
// when it matches an include and none of the excludes.
function changesRun(scope: Scope, files: string[]): boolean {
	const patterns = filterRules()[scope]
	if (!patterns) throw new Error(`no ${scope} filter`)
	const matchers = patterns.map(pattern => picomatch(pattern, {dot: true}, true))
	const includes = matchers.filter(matcher => !matcher.state.negated)
	const excludes = matchers.filter(matcher => matcher.state.negated)
	return files.some(file => includes.some(matcher => matcher(file)) && !excludes.some(matcher => !matcher(file)))
}

// PR 346: dev FFmpeg fetch scripts, their unit test and docs. Build scripts and
// any workflow count for every suite, so it still runs them all.
const PIN_RECORD_PR = [
	'.github/workflows/ffmpeg-remux-matrix.yml',
	'dev-docs/binary-distribution.md',
	'dev-docs/ffmpeg-packages.md',
	'scripts/build/btbnResolver.ts',
	'scripts/build/embeddedPayload.ts',
	'scripts/build/embeddedPin.ts',
	'scripts/build/fetch-embedded.sh',
	'scripts/build/fetchEmbeddedHost.ts',
	'tests/scripts/embedded-payload.test.ts'
]

const CASES: {name: string; files: string[]; runs: Scope[]}[] = [
	{name: 'docs and translation sources', files: ['dev-docs/release-runbook.md', 'README.md', 'README.de.md', 'readme-src/strings/en.json', 'i18n/locales/de.po', 'GLOSSARY.md', 'docs/adr/0010-ffmpeg-package.md'], runs: []},
	{name: 'agent tooling', files: ['.agents/memory/MEMORY.md', 'skills-lock.json', 'AGENTS.md', '.coderabbit.yaml'], runs: []},
	{name: 'unit and renderer tests', files: ['tests/unit/queue.test.ts', 'tests/renderer/wizard.test.tsx', 'tests/scripts/embedded-payload.test.ts', 'packages/yt-dlp-bridge/tests/bridge.test.ts'], runs: []},
	{name: 'the remux matrix and VM scripts', files: ['scripts/ffmpeg-matrix/run.ts', 'tests/fixtures/ffmpeg-remux/vp9-hls.mp4', 'scripts/vm/win-sync.sh'], runs: []},
	{name: 'the feedback worker', files: ['workers/feedback-upload/src/index.ts'], runs: []},
	{name: 'main-process code', files: ['src/main/services/YtDlp.ts'], runs: ['e2e', 'browser', 'installer']},
	{name: 'renderer code', files: ['src/renderer/src/App.tsx'], runs: ['e2e', 'browser', 'installer']},
	{name: 'runtime locale JSON', files: ['src/shared/i18n/locales/de.json'], runs: ['e2e', 'browser', 'installer']},
	{name: 'the changelog the renderer imports', files: ['CHANGELOG.md'], runs: ['e2e', 'browser', 'installer']},
	{name: 'dependencies', files: ['bun.lock'], runs: ['e2e', 'browser', 'installer']},
	{name: 'workspace package source', files: ['packages/yt-dlp-bridge/src/index.ts'], runs: ['e2e', 'browser', 'installer']},
	{name: 'packaging config', files: ['electron-builder.json5'], runs: ['e2e', 'browser', 'installer']},
	{name: 'any workflow', files: ['.github/workflows/ci.yml'], runs: ['e2e', 'browser', 'installer']},
	{name: 'a new top-level file nobody listed', files: ['bunfig.toml'], runs: ['e2e', 'browser', 'installer']},
	{name: 'a new test directory nobody listed', files: ['tests/contract/ipc.test.ts'], runs: ['e2e', 'browser']},
	{name: 'Electron E2E specs', files: ['tests/e2e/fixture-smoke.spec.ts'], runs: ['e2e']},
	{name: 'browser smoke specs', files: ['tests/browser/smoke.spec.ts', 'playwright.browser.config.ts'], runs: ['browser']},
	{name: 'the dev FFmpeg fetch (PR 346)', files: PIN_RECORD_PR, runs: ['e2e', 'browser', 'installer']},
	{name: 'only its docs and unit test', files: PIN_RECORD_PR.filter(file => file.endsWith('.md') || file.startsWith('tests/')), runs: []}
]

describe('app-changes action', () => {
	it.each(CASES)('$name runs $runs', ({files, runs}) => {
		expect(SCOPES.filter(scope => changesRun(scope, files))).toEqual(runs)
	})

	it('builds every scope on the shared base list', () => {
		const rules = filterRules()
		const base = rules.base ?? []
		for (const scope of SCOPES) expect(rules[scope]?.slice(0, base.length)).toEqual(base)
	})

	it('always runs outside pull requests', () => {
		const run = record(record(readYaml(ACTION_PATH).outputs, 'outputs').run, 'the run output').value
		expect(run).toBe("${{ github.event_name != 'pull_request' || steps.filter.outputs[inputs.scope] == 'true' }}")
	})
})

const GATED: {workflow: string; scope: Scope; gate: string; ungated: string[]}[] = [
	{workflow: 'e2e-fixtures.yml', scope: 'e2e', gate: 'E2E fixtures gate', ungated: []},
	{workflow: 'e2e-cold-start.yml', scope: 'e2e', gate: 'Cold start gate', ungated: []},
	{workflow: 'dev-smoke.yml', scope: 'browser', gate: 'Dev smoke gate', ungated: []},
	// Publishing runs on tags, where the suite always runs; the dist-tag check is
	// an advisory, not part of the suite.
	{workflow: 'installer-smoke.yml', scope: 'installer', gate: 'Windows installer gate', ungated: ['publish-windows', 'registry-latest-gate']}
]

function needsOf(job: Record<string, unknown>): string[] {
	if (typeof job.needs === 'string') return [job.needs]
	if (Array.isArray(job.needs)) return job.needs.filter((name): name is string => typeof name === 'string')
	return []
}

describe.each(GATED)('$workflow', ({workflow, scope, gate, ungated}) => {
	const doc = readYaml(`.github/workflows/${workflow}`)
	const jobs = record(doc.jobs, 'jobs')
	const suiteJobs = Object.keys(jobs).filter(name => name !== 'changes' && name !== 'gate' && !ungated.includes(name))

	it('triggers on every pull request, so its gate always reports', () => {
		const pullRequest = record(doc.on, 'on').pull_request
		expect(isRecord(pullRequest) ? pullRequest.paths : undefined).toBeUndefined()
	})

	it(`asks the app-changes action for the ${scope} scope`, () => {
		const steps = record(jobs.changes, 'changes').steps
		expect(steps).toContainEqual({id: 'changes', uses: './.github/actions/app-changes', with: {scope}})
	})

	it('skips every suite job, directly or through the jobs it needs, when the filter says so', () => {
		const skipped = (name: string): boolean => {
			const job = record(jobs[name], name)
			return (job.if === "${{ needs.changes.outputs.run == 'true' }}" && needsOf(job).includes('changes')) || needsOf(job).some(skipped)
		}
		expect(suiteJobs.filter(name => !skipped(name))).toEqual([])
	})

	it('gates on the filter and every suite job, even when they are skipped or fail', () => {
		const job = record(jobs.gate, 'gate')
		expect(job.name).toBe(gate)
		expect(job.if).toBe('${{ always() }}')
		expect(needsOf(job).toSorted()).toEqual(['changes', ...suiteJobs].toSorted())
		expect(job.steps).toContainEqual({uses: './.github/actions/suite-gate', with: {suite: gate.replace(/ gate$/, ''), needs: '${{ toJSON(needs) }}', run: '${{ needs.changes.outputs.run }}'}})
	})
})
