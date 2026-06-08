import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

export interface PreloadRequireFinding {
	specifier: string
	reason: string
}

const REQUIRE_CALL = /\brequire\(\s*(['"])(?<specifier>[^'"]+)\1\s*\)/g
const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/
const PROJECT_ALIAS = /^@(shared|preload|main|renderer)(?:\/|$)/

export function findUnsafePreloadRequires(source: string): PreloadRequireFinding[] {
	const findings: PreloadRequireFinding[] = []

	for (const match of source.matchAll(REQUIRE_CALL)) {
		const specifier = match.groups?.specifier
		if (!specifier || isAllowedRuntimeImport(specifier)) continue

		const reason = classifyUnsafeRequire(specifier)
		findings.push({specifier, reason})
	}

	return findings
}

function isAllowedRuntimeImport(specifier: string): boolean {
	return specifier === 'electron' || specifier.startsWith('electron/') || specifier.startsWith('node:')
}

function classifyUnsafeRequire(specifier: string): string {
	if (WINDOWS_ABSOLUTE_PATH.test(specifier)) return 'Windows absolute path'
	if (specifier.startsWith('/')) return 'POSIX absolute path'
	if (PROJECT_ALIAS.test(specifier)) return 'project source alias'
	if (specifier.startsWith('./') || specifier.startsWith('../')) return 'relative source import'
	return 'unexpected external dependency'
}

function checkPreloadBundle(bundlePath: string): PreloadRequireFinding[] {
	const source = fs.readFileSync(bundlePath, 'utf8')
	return findUnsafePreloadRequires(source)
}

function isCliEntrypoint(): boolean {
	const entry = process.argv[1]
	return typeof entry === 'string' && import.meta.url === pathToFileURL(entry).href
}

if (isCliEntrypoint()) {
	const bundlePath = path.resolve(process.argv[2] ?? 'out/preload/index.cjs')

	if (!fs.existsSync(bundlePath)) {
		console.error(`[preload-bundle] missing bundle: ${bundlePath}`)
		process.exit(1)
	}

	const findings = checkPreloadBundle(bundlePath)
	if (findings.length > 0) {
		console.error(`[preload-bundle] unsafe require() calls in ${bundlePath}`)
		for (const finding of findings) {
			console.error(`- ${finding.reason}: ${finding.specifier}`)
		}
		process.exit(1)
	}

	console.log(`[preload-bundle] ok: ${bundlePath}`)
}
