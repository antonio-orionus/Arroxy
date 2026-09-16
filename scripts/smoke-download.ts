// Runs the app's headless download smoke (ARROXY_SMOKE_KIND=download) from a
// shell and prints a compact summary. See dev-docs/download-smoke.md.
//
// Usage:
//   bun run build   # the dev launch runs out/main/index.js
//   bun run smoke:download -- --url https://www.youtube.com/watch?v=... [--cookies off|browser:firefox|file:/path]
//     [--proxy off|<url>] [--profile balanced] [--clients default,web_embedded|none] [--timeout 180000]
//     [--exe /path/to/packaged/Arroxy] [--fresh]
//
// The wrapper exists for the two mistakes a hand-written launch makes:
//   - An inherited ELECTRON_RUN_AS_NODE=1 (set by any shell spawned from an
//     Electron app, including agent harnesses) turns Electron into plain Node,
//     which then dies on `import {BrowserWindow} from 'electron'`. It is removed.
//   - Running against the real user-data folder. A scratch folder is always
//     used; it is reused between runs so the managed yt-dlp is fetched once,
//     unless --fresh asks for a new one.

import {spawn} from 'node:child_process'
import {existsSync, mkdirSync, mkdtempSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {parseArgs} from 'node:util'
import {resolveSmokeUrl} from './smoke-shared.js'

const RESULT_PREFIX = 'ARROXY_DOWNLOAD_SMOKE_RESULT '

const {values: flags} = parseArgs({options: {url: {type: 'string'}, cookies: {type: 'string'}, proxy: {type: 'string'}, profile: {type: 'string'}, clients: {type: 'string'}, timeout: {type: 'string'}, exe: {type: 'string'}, fresh: {type: 'boolean', default: false}}, strict: true})

function electronLaunch(): {file: string; args: string[]} {
	if (flags.exe) return {file: flags.exe, args: []}
	const main = join(process.cwd(), 'out', 'main', 'index.js')
	if (!existsSync(main)) throw new Error('out/main/index.js is missing — run `bun run build` first, or pass --exe for a packaged app')
	const resolved: unknown = createRequire(join(process.cwd(), 'package.json'))('electron')
	if (typeof resolved !== 'string') throw new Error('electron package did not resolve to an executable path')
	return {file: resolved, args: [main]}
}

function userDataDir(): string {
	if (flags.fresh) return mkdtempSync(join(tmpdir(), 'arroxy-download-smoke-userdata-'))
	const dir = join(tmpdir(), 'arroxy-download-smoke-userdata')
	mkdirSync(dir, {recursive: true})
	return dir
}

function smokeEnv(url: string, userData: string): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {...process.env, ARROXY_SMOKE_KIND: 'download', ARROXY_SMOKE_URL: url, ELECTRON_USER_DATA: userData}
	delete env.ELECTRON_RUN_AS_NODE
	const overrides: Array<[string, string | undefined]> = [
		['ARROXY_SMOKE_COOKIES', flags.cookies],
		['ARROXY_SMOKE_PROXY', flags.proxy],
		['ARROXY_SMOKE_PROFILE', flags.profile],
		['ARROXY_SMOKE_PLAYER_CLIENTS', flags.clients],
		['ARROXY_SMOKE_TIMEOUT_MS', flags.timeout]
	]
	for (const [name, value] of overrides) {
		if (value === undefined) delete env[name]
		else env[name] = value
	}
	return env
}

function field(record: unknown, ...path: string[]): unknown {
	let current = record
	for (const key of path) {
		if (typeof current !== 'object' || current === null || !(key in current)) return undefined
		current = (current as Record<string, unknown>)[key]
	}
	return current
}

function show(value: unknown): string {
	if (value === undefined || value === null) return '-'
	if (Array.isArray(value)) return value.length > 0 ? value.join(',') : '-'
	return typeof value === 'string' ? value : JSON.stringify(value)
}

function printSummary(report: unknown, reportPath: string): void {
	const rows: Array<[string, unknown]> = [
		['outcome', field(report, 'outcome')],
		['format', field(report, 'selection', 'selectedFormat')],
		['max height', field(report, 'selection', 'maxHeight')],
		['sent cookies', field(report, 'spawned', 'cookies')],
		['sent proxy', field(report, 'spawned', 'proxy')],
		['sent clients', field(report, 'spawned', 'playerClients') ?? '(yt-dlp default)'],
		['players queried', field(report, 'observed', 'playerApiClients')],
		['SABR skipped', field(report, 'observed', 'sabrSkippedClients')],
		['error', field(report, 'error')],
		['duration ms', field(report, 'durationMs')]
	]
	for (const [label, value] of rows) console.log(`  ${label.padEnd(16)} ${show(value)}`)
	console.log(`  full report      ${reportPath}`)
}

function main(): Promise<number> {
	const url = resolveSmokeUrl(flags.url)
	const launch = electronLaunch()
	const userData = userDataDir()
	console.log(`download smoke: ${url}\n  user data        ${userData}`)
	return new Promise(resolve => {
		const child = spawn(launch.file, launch.args, {env: smokeEnv(url, userData), stdio: ['ignore', 'pipe', 'pipe']})
		let stdout = ''
		let stderr = ''
		child.stdout.on('data', (chunk: Buffer) => (stdout += chunk.toString()))
		child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
		child.on('error', err => {
			console.error(`failed to launch ${launch.file}: ${err.message}`)
			resolve(1)
		})
		child.on('close', code => {
			const lines = stdout.split(/\r?\n/)
			for (const line of lines) if (line.includes('download smoke')) console.log(line)
			const resultLine = lines.findLast(line => line.startsWith(RESULT_PREFIX))
			if (!resultLine) {
				console.error(`no result line (exit ${code})\n--- stdout tail\n${lines.slice(-30).join('\n')}\n--- stderr tail\n${stderr.split(/\r?\n/).slice(-30).join('\n')}`)
				resolve(code ?? 1)
				return
			}
			const payload = resultLine.slice(RESULT_PREFIX.length)
			const reportPath = join(tmpdir(), 'arroxy-download-smoke-last.json')
			writeFileSync(reportPath, payload)
			printSummary(JSON.parse(payload), reportPath)
			resolve(code ?? 1)
		})
	})
}

process.exitCode = await main()
