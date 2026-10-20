// Detects a branch whose tree undoes work already merged on main. The case it
// exists for: squashing with `git reset --soft origin/main` after main moved
// keeps the stale index and re-parents it on the new main, so the commit reads
// as a revert of everything merged in between. A two-dot/three-dot diff
// comparison cannot see that, because the merge-base is then main itself.
// What does give it away: whole recent main commits come undone, every file
// each one changed restored byte-for-byte to an earlier version. Undoing a
// whole commit is rare otherwise; deleting or editing one of its files is not.
// A deliberate revert trips it too, and says so.

import {spawnSync} from 'node:child_process'

// Recent main commits whose changes a branch is checked for undoing.
const REVERT_WINDOW = 200
const ZERO_OID = /^0+$/

export type Git = (args: string[], input?: string) => string

export function gitIn(cwd: string, env: NodeJS.ProcessEnv = process.env): Git {
	return (args, input) => {
		const result = spawnSync('git', args, {cwd, env, input, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024})
		if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`)
		return result.stdout
	}
}

export interface RevertedFile {
	file: string
	// The earliest main commit (short sha and subject) the branch undoes in this file.
	undoes: string
}

const lines = (text: string): string[] => text.split('\n').filter(Boolean)

// Files of recent main commits the branch wholly undoes, each against the
// earliest such commit that touched it.
export function revertedFiles(git: Git, base: string, head: string): RevertedFile[] {
	const mergeBase = git(['merge-base', base, head]).trim()
	const changed = lines(git(['-c', 'core.quotePath=false', 'diff', '--name-only', '--no-renames', mergeBase, head]))
	if (changed.length === 0) return []

	// Newest first, each commit in the window with every file it touched. No
	// pathspec: a stale squash can change more files than an argument list holds.
	const changedSet = new Set(changed)
	const log = git(['-c', 'core.quotePath=false', 'log', '--first-parent', '--diff-merges=first-parent', '--no-renames', '-n', String(REVERT_WINDOW), '--format=%x00%h %s', '--name-only', mergeBase])
	const commits = log
		.split('\0')
		.filter(Boolean)
		.map(entry => {
			const [label = '', ...files] = lines(entry)
			return {sha: label.slice(0, label.indexOf(' ')), label, files}
		})
		.filter(c => c.files.some(file => changedSet.has(file)))

	const queries = [...changed.map(file => `${head}:${file}`), ...commits.flatMap(c => c.files.filter(file => changedSet.has(file)).map(file => `${c.sha}^:${file}`))]
	const answers = lines(git(['cat-file', '--batch-check=%(objectname)'], `${queries.join('\n')}\n`)).map(answer => (answer.endsWith(' missing') ? null : answer))
	const blob = new Map(queries.map((query, i) => [query, answers[i] ?? null]))

	// Per file, the oldest commit whose parent had the branch's version: the
	// branch undoes that commit and every later one in this file.
	const restoredFrom = new Map<string, number>()
	commits.forEach((c, i) => {
		for (const file of c.files) if (changedSet.has(file) && blob.get(`${c.sha}^:${file}`) === (blob.get(`${head}:${file}`) ?? null)) restoredFrom.set(file, i)
	})
	// Deleting a file undoes every commit that touched it, and is also how a file
	// is retired, so a commit counts only when some file returns to an older
	// version rather than just going away.
	const restoresContent = (c: (typeof commits)[number]): boolean => c.files.some(file => (blob.get(`${head}:${file}`) ?? null) !== null)
	const undone = commits.filter((c, i) => restoresContent(c) && c.files.every(file => (restoredFrom.get(file) ?? -1) >= i))

	const earliest = new Map<string, string>()
	for (const c of undone) for (const file of c.files) earliest.set(file, c.label)
	return changed.flatMap(file => {
		const label = earliest.get(file)
		return label === undefined ? [] : [{file, undoes: label}]
	})
}

export interface PushedRef {
	localRef: string
	localOid: string
	remoteRef: string
}

// The pre-push hook's stdin: "<local ref> <local oid> <remote ref> <remote oid>" per line.
export function parsePushedRefs(stdin: string): PushedRef[] {
	return lines(stdin).flatMap(line => {
		const [localRef, localOid, remoteRef] = line.trim().split(/\s+/)
		return localRef && localOid && remoteRef ? [{localRef, localOid, remoteRef}] : []
	})
}

// Branch pushes only: main takes docs-only commits directly, and deletions and tags carry no tree to check.
export function refsToCheck(refs: readonly PushedRef[]): PushedRef[] {
	return refs.filter(ref => !ZERO_OID.test(ref.localOid) && ref.remoteRef.startsWith('refs/heads/') && ref.remoteRef !== 'refs/heads/main')
}
