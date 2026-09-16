// Pure helpers for check-commit-fallout.ts: parse whole-repo lint/type output
// and decide which findings a commit is responsible for.

export interface Finding {
	tool: 'oxlint' | 'tsc'
	file: string
	location: string
	message: string
}

const OXLINT_UNIX_LINE = /^(.+?):(\d+:\d+): (.+)$/
const TSC_LINE = /^(.+?)\((\d+,\d+)\): (error TS\d+: .+)$/

const normalizePath = (file: string): string => file.replaceAll('\\', '/')

export function parseOxlintUnix(output: string): Finding[] {
	return output.split(/\r?\n/).flatMap(line => {
		const match = OXLINT_UNIX_LINE.exec(line)
		return match?.[1] && match[2] && match[3] ? [{tool: 'oxlint' as const, file: normalizePath(match[1]), location: match[2], message: match[3]}] : []
	})
}

export function parseTscOutput(output: string): Finding[] {
	return output.split(/\r?\n/).flatMap(line => {
		const match = TSC_LINE.exec(line)
		return match?.[1] && match[2] && match[3] ? [{tool: 'tsc' as const, file: normalizePath(match[1]), location: match[2], message: match[3]}] : []
	})
}

// A file with unstaged or untracked changes holds work outside this commit —
// possibly another agent's — so its findings are reported but never block.
// Every other file's working copy is exactly what the commit will contain.
export function partitionFindings(findings: readonly Finding[], filesWithOtherChanges: ReadonlySet<string>): {blocking: Finding[]; ignored: Finding[]} {
	const blocking: Finding[] = []
	const ignored: Finding[] = []
	for (const finding of findings) (filesWithOtherChanges.has(finding.file) ? ignored : blocking).push(finding)
	return {blocking, ignored}
}
