// Pre-push gate: refuses a branch push whose tree undoes work already merged on
// main (see pushGuard.ts for the squash that causes it). Pushes to main itself
// are not checked. Bypass a deliberate revert with ARROXY_ALLOW_REVERT=1, or
// the whole hook with --no-verify.

import {spawnSync} from 'node:child_process'
import {gitIn, parsePushedRefs, refsToCheck, revertedFiles} from './pushGuard.js'

const BASE = 'origin/main'

let stdin = ''
for await (const chunk of process.stdin) stdin += String(chunk)
const refs = refsToCheck(parsePushedRefs(stdin))
if (refs.length === 0 || process.env.ARROXY_ALLOW_REVERT === '1') process.exit(0)

const git = gitIn(process.cwd())
if (spawnSync('git', ['fetch', '--quiet', 'origin', 'main'], {stdio: ['ignore', 'ignore', 'inherit']}).status !== 0) console.error(`pre-push: could not fetch origin main; checking against the local ${BASE}.`)
if (spawnSync('git', ['rev-parse', '--verify', '--quiet', BASE], {stdio: 'ignore'}).status !== 0) {
	console.error(`pre-push: no ${BASE} ref, so the revert check is skipped.`)
	process.exit(0)
}

let failed = false
for (const ref of refs) {
	const reverted = revertedFiles(git, BASE, ref.localOid)
	if (reverted.length === 0) continue
	failed = true
	console.error(`pre-push: ${ref.remoteRef.replace('refs/heads/', '')} would undo ${reverted.length} file(s) already changed on main:`)
	for (const r of reverted) console.error(`  ${r.file}  (undoes ${r.undoes})`)
}
if (failed) {
	console.error(`
This is what a squash by \`git reset --soft origin/main\` after main moved does: the stale index is re-parented onto the new main.
Restore the branch from \`git reflog\`, squash with \`git reset --soft $(git merge-base origin/main HEAD)\`, then rebase onto or merge origin/main.
A deliberate revert: push with ARROXY_ALLOW_REVERT=1.`)
	process.exit(1)
}
