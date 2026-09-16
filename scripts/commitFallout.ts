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

const TS_FILE = /\.(?:ts|tsx|cts|mts)$/

// Parses `git diff --cached --name-status`. Deletions count: removing a module
// breaks its importers just as surely as editing it. A rename contributes both
// paths, since either side can be what callers referenced.
export function stagedTypeScriptPaths(nameStatus: string): string[] {
	return nameStatus.split(/\r?\n/).flatMap(line => {
		const [, ...paths] = line.split('\t')
		return paths.filter(path => TS_FILE.test(path))
	})
}

export interface CheckerRun {
	exitCode: number | null
	launchError: string | null
	output: string
}

// Fails closed: a checker that could not start, or exited unsuccessfully without
// a single parseable finding, has not actually checked anything.
export function checkerFailure(tool: Finding['tool'], run: CheckerRun, findings: readonly Finding[]): string | null {
	if (run.launchError !== null) return `${tool} could not start: ${run.launchError}`
	if (run.exitCode !== 0 && findings.length === 0) return `${tool} exited with ${run.exitCode ?? 'a signal'} and no parseable findings:\n${run.output.trim().split(/\r?\n/).slice(-15).join('\n')}`
	return null
}
