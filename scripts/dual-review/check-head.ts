// The land flow's push step. Prints the branch's files against main, then
// refuses when the branch undoes work already on main or is not what the last
// `review:dual` run reviewed, so a squash or edit after review forces a new
// review. Plain pushes never run it.
//
//   bun run review:check-head

import {spawnSync} from 'node:child_process'
import {gitIn, revertedFiles} from '../pushGuard.js'
import {checkReviewed} from './reviewedState.js'

const BASE = 'origin/main'

async function main(): Promise<number> {
	const git = gitIn(process.cwd())
	if (spawnSync('git', ['fetch', '--quiet', 'origin', 'main'], {stdio: ['ignore', 'ignore', 'inherit']}).status !== 0) console.error(`check-head: could not fetch origin main; using the local ${BASE}.`)
	console.log(`Files this push changes against ${BASE} (check them against what the task declared):`)
	console.log(git(['diff', '--stat=200', `${BASE}...HEAD`]))

	const reverted = revertedFiles(git, BASE, 'HEAD')
	if (reverted.length > 0) {
		console.error(`check-head: the branch undoes ${reverted.length} file(s) already changed on main:`)
		for (const r of reverted) console.error(`  ${r.file}  (undoes ${r.undoes})`)
		console.error('Restore the branch from `git reflog`, squash with `git reset --soft $(git merge-base origin/main HEAD)`, then rebase onto or merge origin/main.')
		return 1
	}
	const reviewed = await checkReviewed(git, BASE)
	if (!reviewed.ok) {
		console.error(`check-head: ${reviewed.reason}.`)
		return 1
	}
	console.error('check-head: HEAD is the reviewed change and undoes nothing on main.')
	return 0
}

process.exitCode = await main()
