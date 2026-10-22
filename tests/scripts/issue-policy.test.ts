import {describe, expect, it} from 'vite-plus/test'
import {checkIssue, type IssueFacts, type IssueRule} from '../../scripts/issuePolicy.js'

const BODY = '## Where\n\n`src/main/services/QueueService.ts:264`\n\n## What breaks\n\nPause All skips a starting download.\n'

// A state label rides along unless a test sets the labels itself with `exact`.
function facts(overrides: Partial<IssueFacts> = {}, exact = false): IssueFacts {
	const labels = overrides.labels ?? ['bug']
	return {title: 'Pause All misses a download that is still starting', body: BODY, authorAssociation: 'OWNER', open: true, ...overrides, labels: exact ? labels : [...labels, 'ready-for-agent']}
}

const failedRules = (input: IssueFacts): IssueRule[] => checkIssue(input).failures.map(failure => failure.rule)

describe('who the policy applies to', () => {
	it('checks issues the maintainers file', () => {
		for (const authorAssociation of ['OWNER', 'MEMBER', 'COLLABORATOR']) {
			expect(checkIssue(facts({authorAssociation})).applies).toBe(true)
		}
	})

	it('leaves community issues to the issue forms', () => {
		for (const authorAssociation of ['NONE', 'CONTRIBUTOR', 'FIRST_TIME_CONTRIBUTOR', 'FIRST_TIMER']) {
			const result = checkIssue(facts({authorAssociation, labels: [], body: 'It broke. See .internal/notes.md'}))
			expect(result).toEqual({applies: false, failures: []})
		}
	})
})

describe('kind-label', () => {
	it('passes with exactly one kind label next to other labels', () => {
		expect(failedRules(facts({labels: ['bug', 'parked', 'needs-triage']}, true))).toEqual([])
		expect(failedRules(facts({labels: ['i18n', 'help wanted'], body: 'Native check wanted for the codec strings.'}))).toEqual([])
	})

	it('fails with no kind label, or with two', () => {
		expect(failedRules(facts({labels: []}))).toEqual(['kind-label'])
		expect(failedRules(facts({labels: ['parked']}, true))).toEqual(['kind-label'])
		expect(failedRules(facts({labels: ['bug', 'tech-debt']}))).toEqual(['kind-label'])
	})
})

describe('state-label', () => {
	it('passes with exactly one state label', () => {
		for (const state of ['ready-for-agent', 'ready-for-human', 'parked', 'question']) {
			expect(failedRules(facts({labels: ['bug', state]}, true))).toEqual([])
		}
	})

	it('does not count needs-triage as a state, so the flag stays until a real one is set', () => {
		expect(failedRules(facts({labels: ['bug']}, true))).toEqual(['state-label'])
		expect(failedRules(facts({labels: ['bug', 'needs-triage']}, true))).toEqual(['state-label'])
		expect(failedRules(facts({labels: ['bug', 'needs-triage', 'ready-for-agent']}, true))).toEqual([])
	})

	it('fails with two states', () => {
		expect(failedRules(facts({labels: ['bug', 'ready-for-agent', 'parked']}, true))).toEqual(['state-label'])
	})

	it('needs no state on a closed issue', () => {
		expect(failedRules(facts({labels: ['bug', 'wontfix'], open: false}, true))).toEqual([])
	})
})

describe('location', () => {
	it('requires a `file:line` for bugs, test gaps and tech debt', () => {
		for (const kind of ['bug', 'tests', 'tech-debt']) {
			expect(failedRules(facts({labels: [kind], body: 'Something is wrong somewhere.'}))).toEqual(['location'])
			expect(failedRules(facts({labels: [kind]}))).toEqual([])
		}
	})

	it('accepts a root file, a line range and a path without a slash', () => {
		for (const body of ['See `package.json:12`.', 'See `src/shared/bulkUrls.ts:27-28`.', 'In `scripts/build/btbnResolver.ts:71`.']) {
			expect(failedRules(facts({body}))).toEqual([])
		}
	})

	it('accepts a tracked file without an extension when it has a folder', () => {
		for (const body of ['See `.github/CODEOWNERS:1`.', 'In `.vite-hooks/pre-push:4`.']) {
			expect(failedRules(facts({body}))).toEqual([])
		}
	})

	it('accepts a root dotfile or a known root file without an extension', () => {
		for (const body of ['See `.gitignore:1`.', 'See `.node-version:1`.', 'See `.npmrc:2`.', 'See `.env:1`.', 'See `Makefile:3`.', 'See `Dockerfile:7`.']) {
			expect(failedRules(facts({body}))).toEqual([])
		}
	})

	it('does not count a host and port as a location', () => {
		expect(failedRules(facts({body: 'The dev server on `localhost:8080` stops.'}))).toEqual(['location'])
	})

	it('does not count a bare path, or one outside code formatting', () => {
		expect(failedRules(facts({body: 'See `src/shared/bulkUrls.ts`.'}))).toEqual(['location'])
		expect(failedRules(facts({body: 'See src/shared/bulkUrls.ts:27.'}))).toEqual(['location'])
	})

	it('needs no location for features, translations or docs', () => {
		for (const kind of ['enhancement', 'i18n', 'documentation']) {
			expect(failedRules(facts({labels: [kind], body: 'Words only.'}))).toEqual([])
		}
	})
})

describe('private-docs', () => {
	it('fails an issue that points at the private maintainer docs', () => {
		expect(failedRules(facts({body: `${BODY}\nPlan: .internal/link-intake-spec.md`}))).toEqual(['private-docs'])
		expect(failedRules(facts({body: `${BODY}\nSee \`.internal/\`.`}))).toEqual(['private-docs'])
		expect(failedRules(facts({title: 'Follow-up from arroxy-internal#4'}))).toEqual(['private-docs'])
	})

	it('allows the word internal in prose', () => {
		expect(failedRules(facts({body: `${BODY}\nAn internal error in the queue.`}))).toEqual([])
	})
})

describe('ai-attribution', () => {
	it('fails an issue that credits an assistant with finding or writing it', () => {
		for (const line of ['Found by Codex reviewing fix/x (2026-10-21).', 'Found by CodeRabbit reviewing #519.', 'Found by dual review (Codex + Claude).', 'Generated with Claude Code', 'Co-Authored-By: Claude <noreply@anthropic.com>']) {
			expect(failedRules(facts({body: `${BODY}\n${line}\n`}))).toEqual(['ai-attribution'])
		}
	})

	it('allows CLAUDE.md and a finding credited to a PR', () => {
		expect(failedRules(facts({body: `${BODY}\nFound while reviewing #519 (2026-10-21). See CLAUDE.md.`}))).toEqual([])
	})
})

it('reports every broken rule at once, each with a fix', () => {
	const result = checkIssue(facts({labels: [], body: 'Found by Codex. Details in .internal/bug.md'}))
	expect(result.failures.map(failure => failure.rule)).toEqual(['kind-label', 'private-docs', 'ai-attribution'])
	for (const failure of result.failures) expect(failure.message.length).toBeGreaterThan(20)
})
