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
import {parse} from 'acorn'

export interface ExternalMainImport {
	specifier: string
	via: 'import' | 'export' | 'dynamic-import' | 'require' | '__require'
}

const BUILTINS = new Set(builtinModules)

function isAllowed(specifier: string): boolean {
	if (specifier === 'electron' || specifier.startsWith('electron/')) return true
	if (specifier.startsWith('node:')) return true
	if (specifier.startsWith('./') || specifier.startsWith('../')) return true
	return BUILTINS.has(specifier) || BUILTINS.has(specifier.split('/')[0] ?? '')
}

interface SyntaxNode {
	type: string
	start: number
	[key: string]: unknown
}

function isNode(value: unknown): value is SyntaxNode {
	return typeof value === 'object' && value !== null && 'type' in value && typeof value.type === 'string' && 'start' in value && typeof value.start === 'number'
}

function stringLiteral(value: unknown): string | null {
	return isNode(value) && value.type === 'Literal' && typeof value.value === 'string' ? value.value : null
}

// The module a node loads, when it loads one. Only real syntax counts: text
// inside strings, comments and template literals (such as Ajv's codegen
// templates that emit `require("ajv/dist/runtime/...")` as code text) never
// becomes one of these nodes. A specifier that is not a string literal cannot
// be checked statically and is skipped.
function loadedModule(node: SyntaxNode): Omit<ExternalMainImport, 'specifier'> & {specifier: string | null} {
	switch (node.type) {
		case 'ImportDeclaration':
			return {via: 'import', specifier: stringLiteral(node.source)}
		case 'ExportAllDeclaration':
		case 'ExportNamedDeclaration':
			return {via: 'export', specifier: node.source ? stringLiteral(node.source) : null}
		case 'ImportExpression':
			return {via: 'dynamic-import', specifier: stringLiteral(node.source)}
		case 'CallExpression': {
			const callee = node.callee
			const args = Array.isArray(node.arguments) ? node.arguments : []
			if (isNode(callee) && callee.type === 'Identifier' && (callee.name === 'require' || callee.name === '__require')) return {via: callee.name, specifier: stringLiteral(args[0])}
			return {via: 'require', specifier: null}
		}
		default:
			return {via: 'import', specifier: null}
	}
}

export function findExternalMainImports(source: string): ExternalMainImport[] {
	const program: unknown = parse(source, {ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true})
	const found: Array<ExternalMainImport & {start: number}> = []
	const stack: unknown[] = [program]
	while (stack.length > 0) {
		const value = stack.pop()
		if (Array.isArray(value)) {
			for (const item of value) stack.push(item)
			continue
		}
		if (!isNode(value)) continue
		const {via, specifier} = loadedModule(value)
		if (specifier !== null && !isAllowed(specifier)) found.push({specifier, via, start: value.start})
		for (const [key, child] of Object.entries(value)) {
			if (key !== 'type' && typeof child === 'object' && child !== null) stack.push(child)
		}
	}
	return found.sort((a, b) => a.start - b.start).map(({specifier, via}) => ({specifier, via}))
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
