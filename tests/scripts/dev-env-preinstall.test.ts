import {readFile} from 'node:fs/promises'
import {builtinModules} from 'node:module'
import path from 'node:path'
import ts from 'typescript'
import {describe, expect, it} from 'vite-plus/test'

// `bootstrap` and `doctor` run dev-env.ts in a checkout with no node_modules,
// so nothing it loads may need an installed package. Steps that do run as
// child processes after `bun install`; lazy requires inside a function are fine.
const ENTRY = path.join(process.cwd(), 'scripts/dev-env.ts')

function resolveLocal(fromFile: string, specifier: string): string {
	return path.resolve(path.dirname(fromFile), specifier).replace(/\.js$/, '.ts')
}

function staticImportSpecifiers(file: string, source: string): string[] {
	const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest)
	return sourceFile.statements.flatMap(statement => ((ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? [statement.moduleSpecifier.text] : []))
}

async function collectPackageImports(entry: string): Promise<string[]> {
	const seen = new Set<string>()
	const packages: string[] = []
	const queue = [entry]
	for (let file = queue.shift(); file; file = queue.shift()) {
		if (seen.has(file)) continue
		seen.add(file)
		for (const specifier of staticImportSpecifiers(file, await readFile(file, 'utf8'))) {
			if (specifier.startsWith('.')) queue.push(resolveLocal(file, specifier))
			else if (!specifier.startsWith('node:') && !builtinModules.includes(specifier)) packages.push(`${path.relative(process.cwd(), file)} -> ${specifier}`)
		}
	}
	return packages
}

describe('dev-env pre-install imports', () => {
	it('loads only Node builtins and local modules', async () => {
		expect(await collectPackageImports(ENTRY)).toEqual([])
	})
})
