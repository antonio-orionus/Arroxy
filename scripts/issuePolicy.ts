import {creditsAnAssistantFinding} from './aiAttribution.js'

// Pure rules for check-issue-policy.ts: what an issue a maintainer (or an agent
// on a maintainer's account) files must carry, so triage reads labels instead
// of prose. Community issues come through the issue forms, which hold their
// own required fields, so this leaves them alone.

export const ISSUE_RULES = ['kind-label', 'state-label', 'location', 'private-docs', 'ai-attribution'] as const
export type IssueRule = (typeof ISSUE_RULES)[number]

/** Exactly one of these says what an issue is. */
export const ISSUE_KINDS = ['bug', 'enhancement', 'tests', 'tech-debt', 'i18n', 'documentation'] as const
/**
 * Exactly one of these says what happens next to an open issue
 * (docs/agents/triage-labels.md). needs-triage isn't one: the policy sets and
 * clears it, so it stays until a real state replaces it.
 */
export const ISSUE_STATES = ['ready-for-agent', 'ready-for-human', 'parked', 'question'] as const
/** The kinds that point at code, so they name a `file:line`. */
const LOCATED_KINDS: ReadonlySet<string> = new Set(['bug', 'tests', 'tech-debt'])
/** The GitHub author associations of people who maintain the repo. */
const MAINTAINERS: ReadonlySet<string> = new Set(['OWNER', 'MEMBER', 'COLLABORATOR'])

export interface IssueFacts {
	title: string
	body: string
	labels: readonly string[]
	/** `github.event.issue.author_association`. */
	authorAssociation: string
	/** A closed issue needs no state. */
	open: boolean
}

export interface IssueFailure {
	rule: IssueRule
	message: string
}

export interface IssueResult {
	/** False for community issues, which the policy doesn't check. */
	applies: boolean
	failures: IssueFailure[]
}

// A file and a line (or range), in code formatting: a path with a folder
// (`.github/CODEOWNERS:1`), a name with an extension (`package.json:12`), a
// dotfile (`.gitignore:3`) or a root file known to have no extension
// (`Makefile:3`), so a host and port like `localhost:8080` doesn't count.
const LOCATION = /`(?:[\w.@-]+(?:\/[\w.@-]+)+|[\w.@-]+\.[A-Za-z0-9]+|\.[\w@-][\w.@-]*|Makefile|Dockerfile|Justfile|Procfile|Brewfile|Gemfile|Rakefile):\d+(?:-\d+)?`/
// The private maintainer docs: the `.internal/` folder or the repo behind it.
const PRIVATE_DOCS = /(?:^|[\s`(/])\.internal\b|arroxy-internal/i

function kindLabel(kinds: string[]): string | null {
	if (kinds.length === 1) return null
	const found = kinds.length === 0 ? 'none' : kinds.join(', ')
	return `Give the issue exactly one kind label (${ISSUE_KINDS.join(', ')}); it has ${found}.`
}

function stateLabel(open: boolean, labels: readonly string[]): string | null {
	const states = labels.filter(label => (ISSUE_STATES as readonly string[]).includes(label))
	if (!open || states.length === 1) return null
	const found = states.length === 0 ? 'none' : states.join(', ')
	return `Give the issue exactly one state label (${ISSUE_STATES.join(', ')}); it has ${found}.`
}

function location(kinds: string[], body: string): string | null {
	const kind = kinds[0]
	if (kinds.length !== 1 || kind === undefined || !LOCATED_KINDS.has(kind) || LOCATION.test(body)) return null
	return `A ${kind} issue names where it is, as a \`path/to/file.ts:123\` reference in code formatting.`
}

function privateDocs(text: string): string | null {
	if (!PRIVATE_DOCS.test(text)) return null
	return 'Issues are public: describe the problem here instead of pointing at the private maintainer docs.'
}

function aiAttribution(text: string): string | null {
	if (!creditsAnAssistantFinding(text)) return null
	return 'Credit the PR or the date a problem was found, never an AI tool (AGENTS.md, "No AI attribution").'
}

/** Every rule a maintainer's issue breaks; nothing for a community issue. */
export function checkIssue(input: IssueFacts): IssueResult {
	if (!MAINTAINERS.has(input.authorAssociation)) return {applies: false, failures: []}
	const kinds = input.labels.filter(label => (ISSUE_KINDS as readonly string[]).includes(label))
	const text = `${input.title}\n${input.body}`
	const failures: IssueFailure[] = []
	const report = (rule: IssueRule, message: string | null): void => {
		if (message !== null) failures.push({rule, message})
	}
	report('kind-label', kindLabel(kinds))
	report('state-label', stateLabel(input.open, input.labels))
	report('location', location(kinds, input.body))
	report('private-docs', privateDocs(text))
	report('ai-attribution', aiAttribution(text))
	return {applies: true, failures}
}
