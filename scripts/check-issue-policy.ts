// Checks an issue against the issue policy in issuePolicy.ts. Runs in the issue
// policy workflow, on the issue as it is when the job runs:
//
//   gh issue view <N> --json title,body,labels,state > issue.json
//   ISSUE_FILE=issue.json ISSUE_AUTHOR_ASSOCIATION=OWNER bun scripts/check-issue-policy.ts
//
// Not the event payload: a queued run's payload can predate a later edit or a
// label an earlier run set, and GitHub doesn't promise queued runs keep order.
//
// Writes `verdict=pass|fail|skip` and `flagged=true|false` (the issue has
// needs-triage now) to $GITHUB_OUTPUT and, on a failure, the comment to post to
// $ISSUE_REPORT. Exits 0 on any verdict, since the needs-triage label is the
// signal; exits non-zero only on a snapshot it can't read, so a failed lookup
// never judges an empty issue.

import {appendFileSync, readFileSync, writeFileSync} from 'node:fs'
import {checkIssue} from './issuePolicy.js'

interface IssueSnapshot {
	title: string
	body: string
	labels: string[]
	open: boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

function readSnapshot(path: string | undefined): IssueSnapshot {
	if (path === undefined) throw new Error('ISSUE_FILE is not set')
	const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
	if (!isRecord(parsed) || typeof parsed.title !== 'string' || !Array.isArray(parsed.labels) || (parsed.state !== 'OPEN' && parsed.state !== 'CLOSED')) throw new Error(`${path} is not a \`gh issue view --json title,body,labels,state\` result`)
	const labels = parsed.labels.flatMap(label => (isRecord(label) && typeof label.name === 'string' ? [label.name] : []))
	return {title: parsed.title, body: typeof parsed.body === 'string' ? parsed.body : '', labels, open: parsed.state === 'OPEN'}
}

const issue = readSnapshot(process.env.ISSUE_FILE)
const result = checkIssue({...issue, authorAssociation: process.env.ISSUE_AUTHOR_ASSOCIATION ?? ''})
const verdict = !result.applies ? 'skip' : result.failures.length > 0 ? 'fail' : 'pass'

for (const {rule, message} of result.failures) console.log(`${rule}: ${message}`)
console.log(`Issue policy: ${verdict}.`)

if (verdict === 'fail' && process.env.ISSUE_REPORT !== undefined) {
	const lines = result.failures.map(({rule, message}) => `- **${rule}:** ${message}`)
	writeFileSync(process.env.ISSUE_REPORT, `This issue doesn't follow the issue policy yet, so it's marked \`needs-triage\`:\n\n${lines.join('\n')}\n\nEdit the issue or its labels; the label comes off once it passes.\n`)
}
if (process.env.GITHUB_OUTPUT !== undefined) appendFileSync(process.env.GITHUB_OUTPUT, `verdict=${verdict}\nflagged=${issue.labels.includes('needs-triage')}\n`)
