export type LogViolationKind = 'missing-warmup-completed' | 'unsettled-branch' | 'error-line' | 'disallowed-warning'

export interface LogViolation {
	kind: LogViolationKind
	detail: string
}

export interface LogPolicy {
	allowedWarnings: readonly RegExp[]
	/**
	 * Errors are violations by default. The allowlist exists because this oracle
	 * gates three platforms at tag time, where one benign platform-specific error
	 * line must be waivable per journey rather than by editing the oracle.
	 */
	allowedErrors: readonly RegExp[]
}

// electron-log main.log line shape: `[2026-08-30 05:22:31.753] [info]  (scope)  message`
const LEVEL_LINE = /^\[[\d\-:. ]+\]\s+\[(\w+)\]\s*(?:\([\w-]+\)\s*)?(.*)$/

// The completion summary is pretty-printed across lines, so `branches: { … }` is
// matched over the whole text rather than per line.
const BRANCHES_BLOCK = /branches:\s*\{([^}]*)\}/
const BRANCH_KEY = /(\w+):\s*\d+/g
const SETTLED_BRANCH = /Warmup branch settled \{ branch: '(\w+)'/g

function settledBranches(logText: string): Set<string> {
	const found = new Set<string>()
	for (const match of logText.matchAll(SETTLED_BRANCH)) {
		if (match[1]) found.add(match[1])
	}
	return found
}

// Only the summary's own branches are checked, and only in this direction: a
// branch the summary claims a duration for must have settled. The reverse does
// not hold — the never-awaited `token` branch settles without appearing in the
// summary, by design (see WarmupService).
function summaryBranches(logText: string): string[] {
	const block = BRANCHES_BLOCK.exec(logText)
	if (!block?.[1]) return []
	return [...block[1].matchAll(BRANCH_KEY)].flatMap(match => (match[1] ? [match[1]] : []))
}

export function inspectStartupLog(logText: string, policy: LogPolicy): LogViolation[] {
	const violations: LogViolation[] = []

	if (!logText.includes('Warmup completed')) {
		violations.push({kind: 'missing-warmup-completed', detail: 'no "Warmup completed" line in main.log'})
	}

	const settled = settledBranches(logText)
	for (const branch of summaryBranches(logText)) {
		if (!settled.has(branch)) violations.push({kind: 'unsettled-branch', detail: branch})
	}

	for (const line of logText.split(/\r?\n/)) {
		const parsed = LEVEL_LINE.exec(line)
		if (!parsed) continue
		const [, level, message = ''] = parsed
		if (level === 'error') {
			if (!policy.allowedErrors.some(pattern => pattern.test(message))) violations.push({kind: 'error-line', detail: message.trim()})
		} else if (level === 'warn' && !policy.allowedWarnings.some(pattern => pattern.test(message))) {
			violations.push({kind: 'disallowed-warning', detail: message.trim()})
		}
	}

	return violations
}
