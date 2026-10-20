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
// It is a gate of `bun run check`. Where Python 3.10+ or the yt-dlp download is
// missing, a local run prints SKIPPED and exits 0, so a contributor without
// them is not blocked; it never reports a pass. Under CI (`CI` set) the same
// gap fails the run, so the check cannot be skipped where it is enforced.
//
// yt-dlp is the pinned release below, its zipapp fetched once into
// node_modules/.cache and checked against the published SHA-256; it runs under
// python3 (scripts/filename-parity/oracle.py), offline, from a recorded probe.

import {execFile} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs'
import {mkdir, rename, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {promisify} from 'node:util'
import {planWorkflow, templateLiteral, type WorkflowPlan} from 'yt-dlp-bridge'
import {bindFilenameTemplate, compileFilenameTemplate, templateOutputDir, type TemplateMetadata} from '../src/shared/filenameTemplate.js'
import {findPython, PYTHON_REQUIREMENT, type PythonCommand} from './selection-parity/python.js'

const YT_DLP = {version: '2026.08.19', sha256: '1fa6733c37ea6fb51c99ad8fe785e7b7e5f3246c9b980230329d4fb72ed8d4d6'}

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/arroxy-filename-parity')
const ORACLE = path.join(ROOT, 'scripts/filename-parity/oracle.py')
const run = promisify(execFile)

// Set in yt-dlp's environment so `$ARROXY_PARITY` expands on any machine.
const PARITY_VAR = {ARROXY_PARITY: 'EXPANDED'}
// What Windows would have set, so the ntpath pass has real variables to expand.
const WINDOWS_ENV = {USERNAME: 'parity', USERPROFILE: 'C:\\Users\\parity', TEMP: 'C:\\Users\\parity\\AppData\\Local\\Temp'}

// A prerequisite the check cannot run without: skipped locally, failed in CI.
class MissingPrerequisite extends Error {}

function sha256(bytes: Uint8Array): string {
	return createHash('sha256').update(bytes).digest('hex')
}

async function pinnedYtDlp(): Promise<string> {
	const file = path.join(CACHE_DIR, `yt-dlp-${YT_DLP.version}.zip`)
	if (existsSync(file) && sha256(readFileSync(file)) === YT_DLP.sha256) return file
	const url = `https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP.version}/yt-dlp`
	let bytes: Uint8Array
	try {
		const response = await fetch(url)
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		bytes = new Uint8Array(await response.arrayBuffer())
	} catch (error) {
		throw new MissingPrerequisite(`yt-dlp ${YT_DLP.version} could not be downloaded (${error instanceof Error ? error.message : String(error)}) and is not cached`)
	}
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
	// ntpath pairs `%` signs: a field before an escaped `%%` shifts the pairs.
	'$X then %USERPROFILE% after a field',
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
// The folder the user picked, with everything yt-dlp would expand or strip in
// a path: a set variable on both OSes, a field, a leading `~` in a segment and
// a trailing space. yt-dlp runs inside it, so none of it reaches argv.
const DOWNLOAD_FOLDER = 'Downloads 100% %(id)s $ARROXY_PARITY %USERPROFILE% ~u '

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
	// The run's working directory, from the plan.
	cwd: string
	// Where the file must land, without its extension.
	expected: string
	infoJson: string
	outputArgs: string[]
	// A file the plan has yt-dlp report into, and where it must appear.
	report?: string
}

// The `-o`, `--paths` and `--print-to-file` arguments of a planned argv, in
// order. A report printed `after_move` is printed at `video` here: the oracle
// only simulates, and the FILE template is expanded the same way at any stage.
function outputArgs(args: readonly string[]): string[] {
	return args.flatMap((arg, index) => {
		if (arg === '-o' || arg === '--paths') return [arg, args[index + 1] ?? '']
		if (arg === '--print-to-file') return [arg, (args[index + 1] ?? '').replace(/^\w+:/, 'video:'), args[index + 2] ?? '']
		return []
	})
}

function planCwd(plan: WorkflowPlan): string {
	if (plan.cwd === undefined) throw new Error(`a ${plan.kind} plan that writes files has no working directory`)
	return plan.cwd
}

const verbose = process.argv.includes('--verbose')

// Both prerequisites are settled before any case is built, so a skip is cheap.
async function prerequisites(): Promise<{python: PythonCommand; ytDlp: string}> {
	const python = await findPython()
	if (python === null) throw new MissingPrerequisite(`needs ${PYTHON_REQUIREMENT}, which was not found`)
	return {python, ytDlp: await pinnedYtDlp()}
}

let ready: {python: PythonCommand; ytDlp: string}
try {
	ready = await prerequisites()
} catch (error) {
	if (!(error instanceof MissingPrerequisite)) throw error
	if (process.env.CI) {
		console.error(`filename parity: FAILED, ${error.message}; CI must run this check`)
		process.exit(1)
	}
	console.warn(`filename parity: SKIPPED, ${error.message}. Nothing was compared against yt-dlp; CI will run it.`)
	process.exit(0)
}

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
			// The media phase has a temp folder; the subtitle phases write beside
			// the media. Both run inside the folder.
			const media = planWorkflow({kind: 'media', url: 'https://parity.invalid', output: {...output, tempDirectory: path.join(outputDir, '.arroxy-tmp')}, resume: {loadInfoJsonPath: infoPath}})
			const subtitles = planWorkflow({kind: 'subtitles', url: 'https://parity.invalid', output: {...output, subtitleMode: 'sidecar'}, subtitles: {languages: ['en'], format: 'srt'}})
			for (const [shape, plan] of [['media', media] as const, ['subtitles', subtitles] as const]) {
				cases.push({label: `${shape} · ${template} · ${JSON.stringify(title.slice(0, 40))} by ${JSON.stringify(uploader)}`, cwd: planCwd(plan), expected: path.join(outputDir, bound.template), infoJson: infoPath, outputArgs: outputArgs(plan.args)})
			}
		}

		// The bridge's own literal escape, with no app rule in front of it: the
		// title as text, `$`, `%` and `~` included, must be the name on disk. The
		// report file sits in a folder whose name needs the same escape.
		const directory = path.join(work, DOWNLOAD_FOLDER)
		const name = `${templateLiteral(title)} [%(id)s].%(ext)s`
		const media = planWorkflow({kind: 'media', url: 'https://parity.invalid', output: {directory, template: name, tempDirectory: path.join(directory, '.arroxy-tmp'), report: {finalPath: path.join(directory, '.arroxy-tmp', `${title.slice(0, 20)}.txt`)}}})
		const subtitles = planWorkflow({kind: 'subtitles', url: 'https://parity.invalid', output: {directory, template: name, subtitleMode: 'subfolder'}, subtitles: {languages: ['en'], format: 'srt'}})
		const label = `literal · ${JSON.stringify(title.slice(0, 40))}`
		cases.push({label: `${label} · media`, cwd: planCwd(media), expected: path.join(directory, `${title} [${id}]`), infoJson: infoPath, outputArgs: outputArgs(media.args), report: path.join(directory, '.arroxy-tmp', `${title.slice(0, 20)}.txt`)})
		cases.push({label: `${label} · subtitles in a subfolder`, cwd: planCwd(subtitles), expected: path.join(directory, 'subtitles', `${title} [${id}]`), infoJson: infoPath, outputArgs: outputArgs(subtitles.args)})
	}
	for (const testCase of cases) mkdirSync(testCase.cwd, {recursive: true})

	const {python, ytDlp} = ready
	const request = JSON.stringify({
		cases: cases.map(testCase => {
			const args = testCase.outputArgs
			const values = (flag: string): string[] => args.flatMap((arg, index) => (arg === flag ? [args[index + 1] ?? ''] : []))
			const reports = args.flatMap((arg, index) => (arg === '--print-to-file' ? [args[index + 2] ?? ''] : []))
			return {cwd: testCase.cwd, info_json: testCase.infoJson, output_args: args, outtmpls: [...values('-o').map(value => value.replace(/^infojson:/, '')), ...reports], paths: values('--paths').map(value => value.replace(/^(home|temp):/, '')), report: testCase.report ?? null}
		})
	})
	const child = run(python.command, [...python.args, ORACLE, ytDlp], {maxBuffer: 64 * 1024 * 1024, env: {...process.env, ...PARITY_VAR, ...WINDOWS_ENV}})
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
			const expected = `${testCase.expected}.${posix.ext}`
			if (posix.filename !== expected) problems.push(`app ${JSON.stringify(path.relative(work, expected))}, yt-dlp ${JSON.stringify(path.relative(work, posix.filename))}`)
			if ('report_written' in posix && posix.report_written === false) problems.push(`yt-dlp wrote no report at ${JSON.stringify(path.relative(work, testCase.report ?? ''))}`)
		}
		if (Array.isArray(nt) && nt.length > 0) problems.push(`Windows expansion changes ${nt.join('; ')}`)
		return problems.map(problem => `${testCase.label}: ${problem}`)
	})
	if (verbose) for (const testCase of cases) console.log(`${testCase.label}: ${path.relative(work, testCase.expected)}`)
	console.log(`filename parity: ${cases.length} cases, yt-dlp ${YT_DLP.version}; ${differences.length} differ`)
	for (const difference of differences) console.log(`  ${difference}`)
	if (differences.length > 0) process.exitCode = 1
} finally {
	rmSync(work, {recursive: true, force: true})
}
