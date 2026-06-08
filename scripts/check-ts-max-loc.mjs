#!/usr/bin/env node
// Fail if any TS/TSX file in src/ exceeds MAX_LOC.
// Soft target is ~700 (see CLAUDE.md); hard cap defaults to 800.
// Override: `--max 1000`.

import {readdir, readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT = 'src'
const DEFAULT_MAX = 800
const args = process.argv.slice(2)
const maxIdx = args.indexOf('--max')
const MAX_LOC = maxIdx >= 0 ? Number(args[maxIdx + 1]) : DEFAULT_MAX

if (!Number.isFinite(MAX_LOC) || MAX_LOC <= 0) {
	console.error(`bad --max value: ${args[maxIdx + 1]}`)
	process.exit(2)
}

async function walk(dir) {
	const out = []
	for (const entry of await readdir(dir, {withFileTypes: true})) {
		const p = join(dir, entry.name)
		if (entry.isDirectory()) {
			out.push(...(await walk(p)))
		} else if (/\.(ts|tsx|mts|cts)$/.test(entry.name)) {
			out.push(p)
		}
	}
	return out
}

const files = await walk(ROOT)
const offenders = []

for (const f of files) {
	const text = await readFile(f, 'utf8')
	const lines = text.split('\n').length
	if (lines > MAX_LOC) {
		offenders.push({file: f, lines})
	}
}

if (offenders.length === 0) {
	console.log(`[check:loc] OK — ${files.length} files, all ≤ ${MAX_LOC} LOC`)
	process.exit(0)
}

offenders.sort((a, b) => b.lines - a.lines)
console.error(`[check:loc] FAIL — ${offenders.length} file(s) over ${MAX_LOC} LOC:`)
for (const {file, lines} of offenders) {
	console.error(`  ${lines}\t${file}`)
}
console.error('\nSplit the file or pass `--max <larger>` if intentional.')
process.exit(1)
