// Post-build guard for the main-process bundle.
//
// The packaged app ships no node_modules (electron-builder.json5 excludes them),
// which is only safe because the main bundle is self-contained: every npm
// dependency is inlined and only `electron` and Node built-ins stay external
// (see isExternalMainBuildImport in electron.vite.config.ts). If a package ever
// stays external, dev and fixture runs still pass, because they resolve it from
// the checkout's node_modules, but the packaged app fails at startup. This check
// fails the build instead.
import {builtinModules} from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

export interface ExternalMainImport {
	specifier: string
	via: '__require' | 'import' | 'dynamic-import'
}

// Real runtime loads in the ESM bundle take one of these forms. A bare
// `require("…")` is deliberately not matched: in an ESM bundle it only appears
// as text inside code generators, such as Ajv's `codegen._` templates, which
// emit `require("ajv/dist/runtime/…")` into standalone-code strings that are
// never executed by the app.
const PATTERNS: ReadonlyArray<{via: ExternalMainImport['via']; regex: RegExp}> = [
	{via: '__require', regex: /\b__require\(\s*(['"])(?<specifier>[^'"]+)\1\s*\)/g},
	{via: 'import', regex: /(?:^|[\s;}])(?:import|export)\s[^'"`;]*?\bfrom\s*(['"])(?<specifier>[^'"]+)\1/gm},
	{via: 'import', regex: /(?:^|[\s;}])import\s*(['"])(?<specifier>[^'"]+)\1/gm},
	{via: 'dynamic-import', regex: /\bimport\(\s*(['"])(?<specifier>[^'"]+)\1\s*\)/g}
]

const BUILTINS = new Set(builtinModules)

function isAllowed(specifier: string): boolean {
	if (specifier === 'electron' || specifier.startsWith('electron/')) return true
	if (specifier.startsWith('node:')) return true
	if (specifier.startsWith('./') || specifier.startsWith('../')) return true
	return BUILTINS.has(specifier) || BUILTINS.has(specifier.split('/')[0] ?? '')
}

export function findExternalMainImports(source: string): ExternalMainImport[] {
	const found: Array<ExternalMainImport & {index: number}> = []
	for (const {via, regex} of PATTERNS) {
		for (const match of source.matchAll(regex)) {
			const specifier = match.groups?.specifier
			if (specifier && !isAllowed(specifier)) found.push({specifier, via, index: match.index})
		}
	}
	return found.sort((a, b) => a.index - b.index).map(({specifier, via}) => ({specifier, via}))
}

function isCliEntrypoint(): boolean {
	const entry = process.argv[1]
	return typeof entry === 'string' && import.meta.url === pathToFileURL(entry).href
}

if (isCliEntrypoint()) {
	const dir = path.resolve(process.argv[2] ?? 'out/main')
	if (!fs.existsSync(dir)) {
		console.error(`[main-bundle] missing build output: ${dir}`)
		process.exit(1)
	}
	const files = fs.readdirSync(dir).filter(name => name.endsWith('.js'))
	let failed = false
	for (const name of files) {
		const findings = findExternalMainImports(fs.readFileSync(path.join(dir, name), 'utf8'))
		if (findings.length === 0) continue
		failed = true
		console.error(`[main-bundle] ${name} loads packages at runtime that the packaged app does not ship:`)
		for (const finding of findings) console.error(`  ${finding.via} ${finding.specifier}`)
	}
	if (failed) {
		console.error('\nInline the package (see isExternalMainBuildImport in electron.vite.config.ts) or ship it explicitly.')
		process.exit(1)
	}
	console.log(`[main-bundle] ok: ${files.length} file(s) in ${dir} load only electron and Node built-ins`)
}
