// Arroxy decides where a download lands before yt-dlp runs: it renders the
// template's folders itself and binds the title into the `-o` template as
// literal text (filenameTemplate.ts), because playlist dedupe, folder scans and
// the M3U writer all need the path in advance. This check runs real yt-dlp over
// a corpus of awkward titles and uploaders and fails on any path that differs
// from Arroxy's prediction, so a yt-dlp rule Arroxy has not ported — shell
// expansion of `$HOME` in literal text, say — cannot go unnoticed.
//
//   bun run check:filename-parity            # fail on any difference
//   bun run check:filename-parity --verbose  # also list the agreed cases
//
// yt-dlp is the pinned release below, its zipapp fetched once into
// node_modules/.cache and checked against the published SHA-256; it runs under
// python3 (scripts/filename-parity/oracle.py), offline, from a recorded probe.

import {execFile} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs'
import {mkdir, rename, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {promisify} from 'node:util'
import {planWorkflow} from 'yt-dlp-bridge'
import {bindFilenameTemplate, compileFilenameTemplate, templateOutputDir, type TemplateMetadata} from '../src/shared/filenameTemplate.js'

const YT_DLP = {version: '2026.08.19', sha256: '1fa6733c37ea6fb51c99ad8fe785e7b7e5f3246c9b980230329d4fb72ed8d4d6'}

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/arroxy-filename-parity')
const ORACLE = path.join(ROOT, 'scripts/filename-parity/oracle.py')
const run = promisify(execFile)

// Set in yt-dlp's environment so `$ARROXY_PARITY` expands on any machine.
const PARITY_VAR = {ARROXY_PARITY: 'EXPANDED'}
// What Windows would have set, so the ntpath pass has real variables to expand.
const WINDOWS_ENV = {USERNAME: 'parity', USERPROFILE: 'C:\\Users\\parity', TEMP: 'C:\\Users\\parity\\AppData\\Local\\Temp'}

function sha256(bytes: Uint8Array): string {
	return createHash('sha256').update(bytes).digest('hex')
}

async function pinnedYtDlp(): Promise<string> {
	const file = path.join(CACHE_DIR, `yt-dlp-${YT_DLP.version}.zip`)
	if (existsSync(file) && sha256(readFileSync(file)) === YT_DLP.sha256) return file
	const response = await fetch(`https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP.version}/yt-dlp`)
	if (!response.ok) throw new Error(`could not fetch yt-dlp ${YT_DLP.version}: HTTP ${response.status}`)
	const bytes = new Uint8Array(await response.arrayBuffer())
	const actual = sha256(bytes)
	if (actual !== YT_DLP.sha256) throw new Error(`yt-dlp ${YT_DLP.version} has SHA-256 ${actual}, expected ${YT_DLP.sha256}`)
	await mkdir(CACHE_DIR, {recursive: true})
	await writeFile(`${file}.partial`, bytes)
	await rename(`${file}.partial`, file)
	return file
}

const TITLES = [
	'Why $HOME rules',
	'$$HOME doubled',
	'${USER} in braces',
	'$ARROXY_PARITY',
	'Who wants $?',
	"It's $HOME's turn",
	'I spent $100 on a $ sign $',
	'100% off %ARROXY_PARITY% and 50%% more',
	'%(id)s looks like a field',
	'~',
	'~root',
	'~/escape',
	'Привет, мир 🎉 — ünïcödé',
	'日本語のタイトル～テスト ~ 波',
	'CON',
	`Long $HOME title ${'é'.repeat(300)}`
]
const UPLOADERS = ['$USER', 'Who wants $?', '%ARROXY_PARITY%', '~root', '100%% Club', '$$ Bills', 'Ordinary Channel']
const TEMPLATES = ['{title} [{id}]', '{uploader}/{title} [{id}]', '$HOME {title} [{id}]', '~{title} [{id}]']
const PROBE = 'youtube-2005'
// The folder the user picked, with what an output template would act on: the
// subtitle phases put it in -o, so `%(` must stay literal there. (`$NAME` and a
// Windows `%%` cannot be escaped in --paths at all; the app refuses those.)
const DOWNLOAD_FOLDER = 'Downloads 100% %(id)s'

// The fixture's info dict as yt-dlp would load it, renamed: every format needs
// a URL to be chosen, and the fixtures keep none.
function infoJson(title: string, uploader: string): unknown {
	const fixture: unknown = JSON.parse(readFileSync(path.join(ROOT, 'src/renderer/src/dev/probeSources', `${PROBE}.json`), 'utf8'))
	if (typeof fixture !== 'object' || fixture === null || !('info' in fixture) || typeof fixture.info !== 'object' || fixture.info === null) throw new Error(`${PROBE}: fixture has no info dict`)
	const info: {formats?: unknown} = fixture.info
	const formats = Array.isArray(info.formats) ? info.formats : []
	return {...info, title, uploader, channel: uploader, formats: formats.map((format: unknown, index) => (typeof format === 'object' && format !== null ? {...format, url: `https://parity.invalid/${index}`} : format))}
}

interface Case {
	label: string
	outputDir: string
	boundName: string
	infoJson: string
	outputArgs: string[]
}

// The `-o` and `--paths` arguments of a planned argv, in order.
function outputArgs(args: readonly string[]): string[] {
	return args.flatMap((arg, index) => (arg === '-o' || arg === '--paths' ? [arg, args[index + 1] ?? ''] : []))
}

const verbose = process.argv.includes('--verbose')
const work = realpathSync(mkdtempSync(path.join(tmpdir(), 'arroxy-filename-parity-')))
const cases: Case[] = []
try {
	for (const [index, title] of TITLES.entries()) {
		const uploader = UPLOADERS[index % UPLOADERS.length] ?? ''
		const infoPath = path.join(work, `${index}.info.json`)
		const info = infoJson(title, uploader)
		writeFileSync(infoPath, JSON.stringify(info))
		const id = typeof info === 'object' && info !== null && 'id' in info && typeof info.id === 'string' ? info.id : ''
		const meta: TemplateMetadata = {title, id, uploader}
		for (const template of TEMPLATES) {
			const outputDir = templateOutputDir(path.join(work, DOWNLOAD_FOLDER), template, meta)
			const bound = bindFilenameTemplate(template, meta, {outputDir, platform: process.platform, inFlight: {formats: null, subtitleLanguages: ['en']}})
			if (!bound.ok) throw new Error(`${title} · ${template}: bind failed (${bound.reason})`)
			const compiled = compileFilenameTemplate(bound.template)
			if (!compiled.ok) throw new Error(`${title} · ${template}: compile failed (${compiled.code})`)
			const output = {directory: outputDir, template: compiled.template}
			// The media phase hands yt-dlp --paths; the subtitle phases put the
			// directory in -o. Both shapes reach yt-dlp's expansion differently.
			const media = planWorkflow({kind: 'media', url: 'https://parity.invalid', output: {...output, tempDirectory: path.join(outputDir, '.arroxy-tmp')}, resume: {loadInfoJsonPath: infoPath}})
			const subtitles = planWorkflow({kind: 'subtitles', url: 'https://parity.invalid', output: {...output, subtitleMode: 'sidecar'}, subtitles: {languages: ['en'], format: 'srt'}})
			for (const [shape, plan] of [['media', media] as const, ['subtitles', subtitles] as const]) {
				cases.push({label: `${shape} · ${template} · ${JSON.stringify(title.slice(0, 40))} by ${JSON.stringify(uploader)}`, outputDir, boundName: bound.template, infoJson: infoPath, outputArgs: outputArgs(plan.args)})
			}
		}
	}

	const ytDlp = await pinnedYtDlp()
	const request = JSON.stringify({
		cases: cases.map(testCase => {
			const args = testCase.outputArgs
			const values = (flag: string): string[] => args.flatMap((arg, index) => (arg === flag ? [args[index + 1] ?? ''] : []))
			return {info_json: testCase.infoJson, output_args: args, outtmpls: values('-o').map(value => value.replace(/^infojson:/, '')), paths: values('--paths').map(value => value.replace(/^(home|temp):/, ''))}
		})
	})
	const child = run('python3', [ORACLE, ytDlp], {maxBuffer: 64 * 1024 * 1024, env: {...process.env, ...PARITY_VAR, ...WINDOWS_ENV}})
	child.child.stdin?.end(request)
	const {stdout} = await child
	const results: unknown = JSON.parse(stdout)
	if (!Array.isArray(results) || results.length !== cases.length) throw new Error('the oracle returned a different number of results than cases')

	const differences = cases.flatMap((testCase, index) => {
		const result: unknown = results[index]
		if (typeof result !== 'object' || result === null || !('posix' in result) || !('nt' in result)) throw new Error(`malformed oracle result for ${testCase.label}`)
		const {posix, nt} = result
		const problems: string[] = []
		if (typeof posix !== 'object' || posix === null || !('filename' in posix) || !('ext' in posix) || typeof posix.filename !== 'string' || typeof posix.ext !== 'string') {
			problems.push(`yt-dlp failed: ${JSON.stringify(posix)}`)
		} else {
			const expected = path.join(testCase.outputDir, `${testCase.boundName}.${posix.ext}`)
			if (posix.filename !== expected) problems.push(`app ${JSON.stringify(path.relative(work, expected))}, yt-dlp ${JSON.stringify(path.relative(work, posix.filename))}`)
		}
		if (Array.isArray(nt) && nt.length > 0) problems.push(`Windows expansion changes ${nt.join('; ')}`)
		return problems.map(problem => `${testCase.label}: ${problem}`)
	})
	if (verbose) for (const testCase of cases) console.log(`${testCase.label}: ${path.relative(work, path.join(testCase.outputDir, testCase.boundName))}`)
	console.log(`filename parity: ${cases.length} cases, yt-dlp ${YT_DLP.version}; ${differences.length} differ`)
	for (const difference of differences) console.log(`  ${difference}`)
	if (differences.length > 0) process.exitCode = 1
} finally {
	rmSync(work, {recursive: true, force: true})
}
