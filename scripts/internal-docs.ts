// Links every checkout to the maintainer-only `arroxy-internal` repo through a
// gitignored `.internal` symlink. One clone sits next to the main checkout and
// every worktree points at it, so an edit is visible everywhere at once.
//   link (bootstrap): clone or fast-forward the shared clone, then link it; skips quietly without access.
//   save:             commit everything in the shared clone, rebase on its remote, push.
import {execFile} from 'node:child_process'
import {lstat, readlink, rm, stat, symlink} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {promisify} from 'node:util'

const run = promisify(execFile)
const LINK_NAME = '.internal'
const REPO_NAME = 'arroxy-internal'
// Never wait on a password prompt or an unknown host key: no access means skip.
const GIT_ENV = {...process.env, GIT_TERMINAL_PROMPT: '0', GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o ConnectTimeout=10'}

export function internalRepoUrl(originUrl: string): string | null {
	const match = /^(.+[:/][^/:]+\/)[^/]+?(?:\.git)?$/.exec(originUrl.trim())
	return match ? `${match[1]}${REPO_NAME}.git` : null
}

// `git rev-parse --git-common-dir` is the main checkout's `.git` from any worktree.
export function internalCheckoutDir(gitCommonDir: string): string {
	return path.join(path.dirname(path.dirname(gitCommonDir)), REPO_NAME)
}

export async function linkInternalDir(repoRoot: string, target: string): Promise<'linked' | 'kept-directory'> {
	const link = path.join(repoRoot, LINK_NAME)
	const current = await lstat(link).catch(() => null)
	if (current && !current.isSymbolicLink()) return 'kept-directory'
	if (current && (await readlink(link)) === target) return 'linked'
	if (current) await rm(link)
	// Junctions need no Windows symlink privilege and take the absolute target as is.
	await symlink(target, link, process.platform === 'win32' ? 'junction' : 'dir')
	return 'linked'
}

async function git(args: string[], cwd: string): Promise<string> {
	const {stdout} = await run('git', args, {cwd, env: GIT_ENV})
	return stdout.trim()
}

async function resolveInternalDir(repoRoot: string): Promise<string> {
	if (process.env.ARROXY_INTERNAL_DIR) return path.resolve(process.env.ARROXY_INTERNAL_DIR)
	return internalCheckoutDir(await git(['rev-parse', '--path-format=absolute', '--git-common-dir'], repoRoot))
}

async function link(repoRoot: string): Promise<void> {
	if (process.env.CI) return
	const dir = await resolveInternalDir(repoRoot)
	const present = await stat(path.join(dir, '.git')).catch(() => null)
	try {
		if (present) await git(['pull', '--ff-only', '--quiet'], dir)
		else {
			const url = internalRepoUrl(await git(['remote', 'get-url', 'origin'], repoRoot))
			if (!url) return
			await git(['clone', '--quiet', url, dir], repoRoot)
		}
	} catch {
		// A contributor without access, or offline: the public repo works without it.
		if (!present) return
		console.warn(`internal-docs: could not update ${dir}; using it as is`)
	}
	if ((await linkInternalDir(repoRoot, dir)) === 'kept-directory') console.warn(`internal-docs: leaving ${LINK_NAME} alone — it is not a link`)
}

async function save(repoRoot: string, message: string): Promise<void> {
	const dir = await resolveInternalDir(repoRoot)
	await git(['add', '-A'], dir)
	if (await git(['status', '--porcelain'], dir)) await git(['commit', '--quiet', '-m', message], dir)
	await git(['pull', '--rebase', '--quiet'], dir)
	await git(['push', '--quiet'], dir)
	console.log(`internal-docs: ${dir} is saved and pushed`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
	const [command, ...rest] = process.argv.slice(2)
	if (command === 'link') await link(process.cwd())
	else if (command === 'save') await save(process.cwd(), rest.join(' ') || 'docs: update internal docs')
	else throw new Error('usage: bun scripts/internal-docs.ts <link|save> [commit message]')
}
