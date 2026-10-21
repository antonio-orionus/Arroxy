// Checks an issue against the issue policy in issuePolicy.ts. Runs in the issue
// policy workflow, with the issue's text in the environment:
//
//   ISSUE_TITLE=… ISSUE_BODY=… ISSUE_LABELS='["bug"]' ISSUE_AUTHOR_ASSOCIATION=OWNER \
//     bun scripts/check-issue-policy.ts
//
// Writes `verdict=pass|fail|skip` to $GITHUB_OUTPUT and, on a failure, the
// comment to post to $ISSUE_REPORT. Always exits 0: the needs-triage label is
// the signal, since nobody watches a failed run on an issue.

import {appendFileSync, writeFileSync} from 'node:fs'
import {checkIssue} from './issuePolicy.js'

function labelsFrom(json: string | undefined): string[] {
	const parsed: unknown = JSON.parse(json === undefined || json.trim() === '' ? '[]' : json)
	return Array.isArray(parsed) ? parsed.filter((label): label is string => typeof label === 'string') : []
}

const result = checkIssue({title: process.env.ISSUE_TITLE ?? '', body: process.env.ISSUE_BODY ?? '', labels: labelsFrom(process.env.ISSUE_LABELS), authorAssociation: process.env.ISSUE_AUTHOR_ASSOCIATION ?? ''})
const verdict = !result.applies ? 'skip' : result.failures.length > 0 ? 'fail' : 'pass'

for (const {rule, message} of result.failures) console.log(`${rule}: ${message}`)
console.log(`Issue policy: ${verdict}.`)

if (verdict === 'fail' && process.env.ISSUE_REPORT !== undefined) {
	const lines = result.failures.map(({rule, message}) => `- **${rule}:** ${message}`)
	writeFileSync(process.env.ISSUE_REPORT, `This issue doesn't follow the issue policy yet, so it's marked \`needs-triage\`:\n\n${lines.join('\n')}\n\nEdit the issue or its labels; the label comes off once it passes.\n`)
}
if (process.env.GITHUB_OUTPUT !== undefined) appendFileSync(process.env.GITHUB_OUTPUT, `verdict=${verdict}\n`)
