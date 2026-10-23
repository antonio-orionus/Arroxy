// Every message site in a yt-dlp source tree: the call that prints or raises it,
// its text as a template, and the flags the catalogue's label rules read. Facts
// only, no labels. scripts/ytdlp-catalogue/extract.py does the reading with
// Python's own `ast` module, so the tree is parsed, never imported or run.
//
//   bun run ytdlp:catalogue:extract --src <yt-dlp checkout> [--out sites.json]
//
// Needs Python 3.10 or newer, found as the parity checks find it.

import {execFile} from 'node:child_process'
import {writeFile} from 'node:fs/promises'
import path from 'node:path'
import {parseArgs, promisify} from 'node:util'
import {z} from 'zod'
import {findPython} from '../selection-parity/python.js'

const EXTRACT = path.join(import.meta.dirname, 'extract.py')
const run = promisify(execFile)

const tristate = z.enum(['yes', 'no', 'dynamic'])

const rawSiteSchema = z.strictObject({
	file: z.string(),
	line: z.number().int().positive(),
	scope: z.string(),
	// The extractor's IE_NAME when its class sets a literal one, else the class
	// name without its `IE` suffix; null outside an extractor class.
	extractor: z.string().nullable(),
	call: z.string(),
	kind: z.enum(['raise', 'helper', 'report', 'status', 'regex', 'download']),
	// Literal text verbatim, every computed part as `{expression}`.
	template: z.string().nullable(),
	shape: z.enum(['literal', 'template', 'default', 'relay', 'dynamic']),
	// The response field whose text the message may show, as a dotted path, or
	// `page:<field>` for text scraped off the page. An over-estimate by design.
	relays: z.string().nullable(),
	flags: z.strictObject({
		expected: z.enum(['yes', 'no', 'absent', 'dynamic']).optional(),
		fatal: tristate.optional(),
		cause: z.literal(true).optional(),
		onHttpError: z.literal(true).optional(),
		// Inside an `except` for a network error, where ExtractorError sets expected=True
		// itself: `yes` for HTTPError alone, `maybe` when the except also catches subclasses.
		networkExcept: z.enum(['yes', 'maybe']).optional(),
		metadataAvailable: tristate.optional(),
		loginMethod: z.enum(['password', 'cookies', 'session_cookies', 'any', 'default', 'dynamic']).optional(),
		// A regex helper's default= may be a fallback or NO_DEFAULT; only known at run time.
		hasDefault: z.literal('dynamic').optional()
	})
})

const extractResultSchema = z.strictObject({schemaVersion: z.literal(1), files: z.number().int().positive(), parseFailures: z.array(z.strictObject({file: z.string(), error: z.string()})), sites: z.array(rawSiteSchema)})

export type RawSite = z.infer<typeof rawSiteSchema>
export type ExtractResult = z.infer<typeof extractResultSchema>

export async function extractSites(srcRoot: string): Promise<ExtractResult> {
	const python = await findPython()
	if (!python) throw new Error('extracting yt-dlp message sites needs Python 3.10 or newer (python3, python or py -3)')
	const {stdout} = await run(python.command, [...python.args, '-I', EXTRACT, srcRoot], {maxBuffer: 256 * 1024 * 1024})
	return extractResultSchema.parse(JSON.parse(stdout))
}

async function main(): Promise<void> {
	const {values} = parseArgs({options: {src: {type: 'string'}, out: {type: 'string'}}})
	if (!values.src) throw new Error('usage: bun run ytdlp:catalogue:extract --src <yt-dlp checkout> [--out sites.json]')
	const result = await extractSites(path.resolve(values.src))
	const json = `${JSON.stringify(result, null, '\t')}\n`
	if (values.out) await writeFile(values.out, json)
	else process.stdout.write(json)
	const failures = result.parseFailures.length
	console.error(`${result.sites.length} message sites in ${result.files} files${failures ? `; ${failures} did not parse` : ''}`)
}

if (import.meta.main) await main()
