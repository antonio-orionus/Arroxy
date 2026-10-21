// Real-network dry-run smoke for Arroxy playlist presets.
//
// Arroxy splits playlists into per-video queue items, so this does NOT use
// yt-dlp native playlist downloads. It probes one YouTube item, caches the real
// info JSON, then runs every UI-reachable PlaylistSelection through Arroxy's
// mediaIntentSpec -> planWorkflow path with yt-dlp --load-info-json.
//
// Usage:
//   bun run smoke:playlist
//   bun run smoke:playlist -- --url https://www.youtube.com/watch?v=...
//   bun run smoke:playlist -- --cookies /path/to/cookies.txt
//   bun run smoke:playlist -- --cookies-from-browser firefox
//   bun run smoke:playlist -- --node /path/to/node

import {spawn} from 'node:child_process'
import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {homedir, tmpdir} from 'node:os'
import {join} from 'node:path'
import {planWorkflow} from 'yt-dlp-bridge'
import {describeSelection, parseSelectedInfo, reqFor, smokeCases, validate} from './playlistPresetSmoke.js'

const DEFAULT_URL = 'https://www.youtube.com/watch?v=WO2b03Zdu4Q&pp=ygUCNGvSBwkJIwsBhyohjO8%3D'
const PLAYER_CLIENT_FALLBACK = 'youtube:player_client=default,-web,-web_safari'
const RUN_TIMEOUT_MS = 120_000

type ExtractorStrategy = 'auto' | 'vanilla' | 'fallback'

interface CliArgs {
	url?: string
	cookies?: string
	cookiesFromBrowser?: string
	ytDlpPath?: string
	nodePath?: string
	extractorStrategy: ExtractorStrategy
	keepTemp: boolean
}

interface RunResult {
	exitCode: number
	stdout: string
	stderr: string
	durationMs: number
}

function parseArgs(argv: string[]): CliArgs {
	const args: CliArgs = {extractorStrategy: 'auto', keepTemp: false}
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i]
		if (a === '--url') args.url = readFlagValue(argv, i++, a)
		else if (a === '--cookies') args.cookies = readFlagValue(argv, i++, a)
		else if (a === '--cookies-from-browser') args.cookiesFromBrowser = readFlagValue(argv, i++, a)
		else if (a === '--yt-dlp') args.ytDlpPath = readFlagValue(argv, i++, a)
		else if (a === '--node') args.nodePath = readFlagValue(argv, i++, a)
		else if (a === '--extractor-strategy') args.extractorStrategy = parseExtractorStrategy(readFlagValue(argv, i++, a))
		else if (a === '--keep-temp') args.keepTemp = true
		else if (a === '-h' || a === '--help') {
			console.log('Usage: bun run smoke:playlist [-- --url X --cookies file --cookies-from-browser firefox]')
			console.log('       [-- --yt-dlp path --node path --extractor-strategy auto|vanilla|fallback --keep-temp]')
			process.exit(0)
		}
	}
	return args
}

function readFlagValue(argv: string[], index: number, flag: string): string {
	const value = argv[index + 1]
	if (value === undefined || value.startsWith('-')) {
		throw new Error(`Missing value for ${flag}.`)
	}
	return value
}

function parseExtractorStrategy(value: string | undefined): ExtractorStrategy {
	if (value === 'auto' || value === 'vanilla' || value === 'fallback') return value
	throw new Error(`Invalid --extractor-strategy '${value ?? ''}'. Expected auto, vanilla, or fallback.`)
}

function findBinary(name: 'yt-dlp' | 'node', override?: string): string {
	if (override) {
		if (!existsSync(override)) throw new Error(`${name} not found at ${override}`)
		return override
	}

	const exeName = process.platform === 'win32' ? `${name}.exe` : name
	const userDataLinux = join(homedir(), '.config', 'arroxy')
	const userDataMac = join(homedir(), 'Library', 'Application Support', 'Arroxy')
	const userDataWin = process.env.APPDATA ? join(process.env.APPDATA, 'Arroxy') : ''
	const candidates = [
		process.env[name === 'yt-dlp' ? 'YT_DLP_PATH' : 'ARROXY_SMOKE_NODE_PATH'],
		join(userDataLinux, 'runtime-cache', 'binaries', exeName),
		join(userDataMac, 'runtime-cache', 'binaries', exeName),
		userDataWin ? join(userDataWin, 'runtime-cache', 'binaries', exeName) : null,
		`/opt/homebrew/bin/${name}`,
		`/usr/local/bin/${name}`,
		`/usr/bin/${name}`
	].filter((p): p is string => Boolean(p))

	for (const c of candidates) {
		if (existsSync(c)) return c
	}
	return exeName
}

function run(binary: string, args: string[], cwd?: string): Promise<RunResult> {
	return new Promise((resolve, reject) => {
		const start = Date.now()
		const proc = spawn(binary, args, {cwd, stdio: ['ignore', 'pipe', 'pipe']})
		let stdout = ''
		let stderr = ''
		let timedOut = false
		let settled = false
		const timer = setTimeout(() => {
			timedOut = true
			stderr += `${stderr.endsWith('\n') || stderr === '' ? '' : '\n'}Timed out after ${RUN_TIMEOUT_MS}ms.`
			proc.kill('SIGKILL')
		}, RUN_TIMEOUT_MS)
		proc.stdout.on('data', (c: Buffer) => {
			stdout += c.toString()
		})
		proc.stderr.on('data', (c: Buffer) => {
			stderr += c.toString()
		})
		proc.on('error', err => {
			clearTimeout(timer)
			if (settled) return
			settled = true
			reject(err)
		})
		proc.on('close', code => {
			clearTimeout(timer)
			if (settled) return
			settled = true
			resolve({exitCode: timedOut ? -1 : (code ?? -1), stdout, stderr, durationMs: Date.now() - start})
		})
	})
}

function cookiesArgs(args: CliArgs): string[] {
	if (args.cookies) return ['--cookies', args.cookies]
	if (args.cookiesFromBrowser) return ['--cookies-from-browser', args.cookiesFromBrowser]
	return []
}

function nodeRuntimeValue(nodePath: string): string {
	return existsSync(nodePath) ? `node:${nodePath}` : 'node'
}

function nodeArgs(nodePath: string): string[] {
	return ['--remote-components', 'ejs:github', '--no-js-runtimes', '--js-runtimes', nodeRuntimeValue(nodePath)]
}

function probeArgs(url: string, cli: CliArgs, nodePath: string, strategy: Exclude<ExtractorStrategy, 'auto'>): string[] {
	return ['--dump-single-json', '--skip-download', '--no-playlist', '--no-warnings', ...nodeArgs(nodePath), ...(strategy === 'fallback' ? ['--extractor-args', PLAYER_CLIENT_FALLBACK] : []), ...cookiesArgs(cli), url]
}

async function probeInfoJson(ytDlpPath: string, url: string, cli: CliArgs, nodePath: string): Promise<{json: string; strategy: Exclude<ExtractorStrategy, 'auto'>; durationMs: number}> {
	const strategies: Exclude<ExtractorStrategy, 'auto'>[] = cli.extractorStrategy === 'auto' ? ['vanilla', 'fallback'] : [cli.extractorStrategy]
	let last: RunResult | null = null

	for (const strategy of strategies) {
		const result = await run(ytDlpPath, probeArgs(url, cli, nodePath, strategy))
		if (result.exitCode === 0 && parseSelectedInfo(result.stdout)) {
			return {json: result.stdout, strategy, durationMs: result.durationMs}
		}
		last = result
	}

	const tail = last?.stderr.trim().split('\n').slice(-4).join('\n') ?? 'unknown probe failure'
	throw new Error(`Initial YouTube probe failed.\n${tail}`)
}

async function main(): Promise<void> {
	const cli = parseArgs(process.argv.slice(2))
	const url = firstNonEmpty(cli.url, process.env.ARROXY_SMOKE_URL) ?? DEFAULT_URL
	const ytDlpPath = findBinary('yt-dlp', cli.ytDlpPath)
	const nodePath = findBinary('node', cli.nodePath)
	const tempDir = await mkdtemp(join(tmpdir(), 'arroxy-playlist-smoke-'))
	const infoJsonPath = join(tempDir, 'info.json')

	console.log('Playlist preset smoke — real YouTube probe, yt-dlp dry-runs')
	console.log(`  yt-dlp: ${ytDlpPath}`)
	console.log(`  node:   ${nodePath}`)
	console.log(`  url:    ${url}`)
	console.log('')

	try {
		const probe = await probeInfoJson(ytDlpPath, url, cli, nodePath)
		await writeFile(infoJsonPath, probe.json, 'utf-8')
		const probedInfo = parseSelectedInfo(probe.json)
		console.log(`  PASS  initial probe (${probe.strategy}, ${probe.durationMs}ms)  ${probedInfo?.title ?? '(no title)'}`)

		const cases = smokeCases()
		let failed = 0
		for (const caseDef of cases) {
			// The plan's paths are relative to its cwd, so the run has to start there.
			const plan = planWorkflow(reqFor(caseDef.selection, tempDir, infoJsonPath, url))
			const args = ['--simulate', '--dump-single-json', '--no-warnings', ...nodeArgs(nodePath), ...plan.args]
			const result = await run(ytDlpPath, args, plan.cwd)
			const info = parseSelectedInfo(result.stdout)
			const failures = info ? validate(caseDef, args, info) : ['yt-dlp did not return parseable JSON']
			const ok = result.exitCode === 0 && failures.length === 0
			if (!ok) failed++
			const tag = ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
			console.log(`  ${tag}  ${caseDef.name.padEnd(25)} ${result.durationMs}ms  ${info ? describeSelection(info) : result.stderr.trim().split('\n').pop()}`)
			for (const failure of failures) console.log(`         ${failure}`)
		}

		console.log('')
		if (failed > 0) {
			console.log(`\x1b[31m${failed}/${cases.length} playlist preset dry-runs failed.\x1b[0m`)
			process.exit(1)
		}
		console.log(`\x1b[32mAll ${cases.length} playlist preset dry-runs passed.\x1b[0m`)
	} finally {
		if (cli.keepTemp) {
			console.log(`  kept temp: ${tempDir}`)
		} else {
			await rm(tempDir, {recursive: true, force: true})
		}
	}
}

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
	for (const value of values) {
		const trimmed = value?.trim()
		if (trimmed !== undefined && trimmed !== '') return trimmed
	}
	return undefined
}

main().catch((err: unknown) => {
	console.error('Playlist preset smoke crashed:', err instanceof Error ? err.message : err)
	process.exit(2)
})
