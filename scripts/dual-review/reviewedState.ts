// What the last dual review saw, so the land flow can refuse to push anything
// else. The record is the branch's diff against its merge-base with main,
// reduced to a patch id: a clean rebase or a merge of main keeps it, while any
// edit, or a squash that drags a stale tree along, changes it and needs a new
// review. It lives in this worktree's git dir, never in the tree.

import {createHash} from 'node:crypto'
import {readFile, writeFile} from 'node:fs/promises'
import {z} from 'zod'
import type {Git} from '../pushGuard.js'

const STATE_FILE = 'arroxy-reviewed-diff'

const reviewedStateSchema = z.object({diffId: z.string(), head: z.string(), mergeBase: z.string(), recordedAt: z.string()})
type ReviewedState = z.infer<typeof reviewedStateSchema>

export type ReviewCheck = {ok: true} | {ok: false; reason: string}

// Zero context lines, so main's edits next to the branch's hunks do not change
// the id; --verbatim keeps whitespace changes significant.
export function branchDiffId(git: Git, base: string): string {
	const mergeBase = git(['merge-base', base, 'HEAD']).trim()
	const diff = git(['diff', '-U0', '--full-index', '--binary', '--no-color', '--no-ext-diff', '--no-renames', mergeBase, 'HEAD'])
	if (diff === '') return 'empty'
	// patch-id prints nothing for a diff it finds no hunks in; the diff's own hash then stands in.
	return git(['patch-id', '--verbatim'], diff).split(' ')[0] || createHash('sha256').update(diff).digest('hex')
}

const statePath = (git: Git): string => git(['rev-parse', '--path-format=absolute', '--git-path', STATE_FILE]).trim()

function parseState(text: string): ReviewedState | null {
	try {
		const result = reviewedStateSchema.safeParse(JSON.parse(text))
		return result.success ? result.data : null
	} catch {
		return null
	}
}

export async function recordReviewed(git: Git, base: string): Promise<void> {
	const state: ReviewedState = {diffId: branchDiffId(git, base), head: git(['rev-parse', 'HEAD']).trim(), mergeBase: git(['merge-base', base, 'HEAD']).trim(), recordedAt: new Date().toISOString()}
	await writeFile(statePath(git), `${JSON.stringify(state, null, '\t')}\n`)
}

export async function checkReviewed(git: Git, base: string): Promise<ReviewCheck> {
	let text: string
	try {
		text = await readFile(statePath(git), 'utf8')
	} catch (err) {
		if (err instanceof Error && 'code' in err && err.code === 'ENOENT') return {ok: false, reason: 'no review recorded in this worktree; run bun run review:dual'}
		throw err
	}
	const state = parseState(text)
	if (state === null) return {ok: false, reason: `unreadable review record at ${statePath(git)}; run bun run review:dual again`}
	if (state.diffId === branchDiffId(git, base)) return {ok: true}
	return {ok: false, reason: `the branch's diff against main changed since the review of ${state.head.slice(0, 12)}; review the new commits with bun run review:dual --light --base ${state.head.slice(0, 12)}, or the whole branch again`}
}
