#!/usr/bin/env node
// Reports src/ files whose only importers live under tests/.
// These are candidates for dead production code.
import madge from 'madge'

const result = await madge('src/', {fileExtensions: ['ts', 'tsx']})
const graph = result.obj() // { 'src/foo.ts': ['src/bar.ts', ...] }

// Build reverse map: file → set of files that import it
const importedBy = new Map()
for (const [file, deps] of Object.entries(graph)) {
	for (const dep of deps) {
		if (!importedBy.has(dep)) importedBy.set(dep, new Set())
		importedBy.get(dep).add(file)
	}
}

// Also scan tests/ to see what src/ files they import
const testResult = await madge('tests/', {fileExtensions: ['ts', 'tsx']})
const testGraph = testResult.obj()
const importedByTests = new Map()
for (const [testFile, deps] of Object.entries(testGraph)) {
	for (const dep of deps) {
		if (!importedByTests.has(dep)) importedByTests.set(dep, new Set())
		importedByTests.get(dep).add(testFile)
	}
}

// Find src/ files imported ONLY by tests/ (not by any other src/ file)
const testOnly = []
for (const [srcFile, testImporters] of importedByTests.entries()) {
	if (!srcFile.startsWith('src/')) continue
	const srcImporters = importedBy.get(srcFile)
	const hasNonTestImporter = srcImporters && [...srcImporters].some(f => !f.startsWith('tests/'))
	if (!hasNonTestImporter) {
		testOnly.push({file: srcFile, importedBy: [...testImporters]})
	}
}

if (testOnly.length === 0) {
	console.log('✔ No src/ files imported exclusively from tests/')
	process.exit(0)
}

console.log(`⚠ ${testOnly.length} src/ file(s) imported only from tests/ (potential dead production code):\n`)
for (const {file, importedBy} of testOnly) {
	console.log(`  ${file}`)
	for (const t of importedBy) console.log(`    ← ${t}`)
}
process.exit(1)
