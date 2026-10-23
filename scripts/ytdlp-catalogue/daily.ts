// The daily job behind .github/workflows/ytdlp-catalogue.yml: resolve the yt-dlp
// users run, and when it (or the label rules) changed since the catalogue in the
// data folder, fetch exactly that commit and rebuild the catalogue there.
//
//   bun scripts/ytdlp-catalogue/daily.ts --data-dir <checkout of the ytdlp-catalogue branch>
//
// Writes `changed`, `reason`, `version`, `report` and `parseFailures` to
// $GITHUB_OUTPUT when it is set.

import {execFileSync} from 'node:child_process'
import {appendFileSync, existsSync} from 'node:fs'
import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {parseArgs} from 'node:util'
import {buildCatalogue, generatorHash, readPrevious, writeCatalogue} from './build.js'
import type {Catalogue} from './catalogue.js'
import {fetchText, type Pin, resolvePin} from './pin.js'

const CATALOGUE = 'ytdlp-catalogue.json'

const README = `# yt-dlp message catalogue

Written by \`.github/workflows/ytdlp-catalogue.yml\` on Arroxy's \`main\`; never edit by hand.

- \`ytdlp-catalogue.json\`: every message site in the yt-dlp commit the runtime manifest pins, with its labels and the rule behind each (one site per line).
- \`coverage/<version>.md\`: what is labelled, what changed since the previous pin, and what drifts.

One commit per pin (and one per generator change on main, with a report of its own), so \`git log -p\` is the history of yt-dlp's messages. Labels change on \`main\` (\`scripts/ytdlp-catalogue/\`), never here.
`

type Previous = Catalogue | null | 'unreadable'

// The catalogue in the data folder: null on a first run, 'unreadable' when the
// current schema no longer reads it (a format change on main), so the job
// rebuilds instead of failing every day.
export async function loadPrevious(dataDir: string): Promise<Previous> {
	const file = path.join(dataDir, CATALOGUE)
	if (!existsSync(file)) return null
	try {
		return await readPrevious(file)
	} catch (error) {
		console.error(`Previous catalogue unreadable, rebuilding from scratch: ${error instanceof Error ? error.message : String(error)}`)
		return 'unreadable'
	}
}

// Why the catalogue needs a rebuild, or null when it is current.
export function rebuildReason(previous: Previous, pin: Pin, generator: string): string | null {
	if (previous === null) return 'first catalogue'
	if (previous === 'unreadable') return 'previous catalogue unreadable'
	if (previous.ytDlp.commit !== pin.commit) return `yt-dlp ${pin.version}`
	if (previous.generator.hash !== generator) return 'generator changed'
	return null
}

// A pin's first report is named after its version and compares it with the pin
// before; any later rebuild of the same pin (a generator or format change)
// writes a report of its own, so that one keeps its diff.
export function reportName(version: string, pinReported: boolean, generator: string): string {
	return pinReported ? `${version}+generator-${generator}` : version
}

// A shallow checkout of exactly one yt-dlp commit. Only a hex SHA reaches git,
// so nothing from the network can be read as an option.
function checkoutYtDlp(commit: string, dir: string): void {
	if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`expected a commit SHA, got "${commit}"`)
	const git = (...args: string[]): void => void execFileSync('git', args, {stdio: 'inherit'})
	git('init', '--quiet', dir)
	git('-C', dir, 'remote', 'add', 'origin', 'https://github.com/yt-dlp/yt-dlp.git')
	git('-C', dir, 'fetch', '--depth=1', '--quiet', 'origin', commit)
	git('-C', dir, 'checkout', '--quiet', 'FETCH_HEAD')
}

function output(values: Record<string, string>): void {
	const file = process.env.GITHUB_OUTPUT
	if (!file) return
	for (const [key, value] of Object.entries(values)) appendFileSync(file, `${key}=${value.replaceAll('\n', ' ')}\n`)
}

async function main(): Promise<void> {
	const {values} = parseArgs({options: {'data-dir': {type: 'string'}}})
	const dataDir = values['data-dir']
	if (!dataDir) throw new Error('usage: bun scripts/ytdlp-catalogue/daily.ts --data-dir <dir>')
	const previous = await loadPrevious(dataDir)
	const pin = await resolvePin({fetchText})
	const generator = await generatorHash()
	const reason = rebuildReason(previous, pin, generator)
	if (reason === null) {
		console.error(`Catalogue is current: yt-dlp ${pin.version} (${pin.commit}).`)
		output({changed: 'false', version: pin.version})
		return
	}
	console.error(`Rebuilding: ${reason}. yt-dlp ${pin.version} (${pin.commit}), ${pin.channel}.`)
	const work = await mkdtemp(path.join(os.tmpdir(), 'ytdlp-catalogue-'))
	try {
		const src = path.join(work, 'yt-dlp')
		checkoutYtDlp(pin.commit, src)
		const built = await buildCatalogue({src, ytDlp: pin, previous: previous === 'unreadable' ? null : previous})
		const report = reportName(pin.version, existsSync(path.join(dataDir, 'coverage', `${pin.version}.md`)), generator)
		await writeCatalogue(dataDir, built, report)
		output({report, parseFailures: String(built.parseFailures.length)})
		if (!existsSync(path.join(dataDir, 'README.md'))) await writeFile(path.join(dataDir, 'README.md'), README)
		console.error(`${built.catalogue.sites.length} sites${built.parseFailures.length ? `; ${built.parseFailures.length} files did not parse: ${built.parseFailures.map(failure => failure.file).join(', ')}` : ''}.`)
	} finally {
		await rm(work, {recursive: true, force: true})
	}
	output({changed: 'true', version: pin.version, reason})
}

if (import.meta.main) await main()
