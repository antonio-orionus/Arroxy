import {readFileSync, readdirSync} from 'node:fs'
import {dirname, join, matchesGlob} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'

const WORKFLOW_PATH = '.github/workflows/ffmpeg-remux-matrix.yml'
const MATRIX_ENTRYPOINTS = [
	...readdirSync('scripts/ffmpeg-matrix')
		.filter(name => name.endsWith('.ts'))
		.map(name => `scripts/ffmpeg-matrix/${name}`),
	'scripts/build/ffmpegPackage.ts'
]

// The enum SSOT feeds every corner of the app; its FFmpeg-relevant enums reach
// the matrix only through runtimeBinarySchemas.ts, which is filtered.
const NOT_FILTERED = new Set(['src/shared/schemas.ts'])

function readWorkflow(): string {
	return readFileSync(WORKFLOW_PATH, 'utf8')
}

function filterPatterns(workflow: string): string[] {
	const block = /filters: \|\n\s+matrix:\n((?:\s+- \S+\n)+)/.exec(workflow)
	if (!block?.[1]) throw new Error('the matrix path filter is missing')
	return block[1]
		.trim()
		.split('\n')
		.map(line => line.replace(/^\s*- /, ''))
}

function resolveImport(from: string, specifier: string): string | null {
	let target: string
	if (specifier.startsWith('.')) target = join(dirname(from), specifier)
	else if (specifier.startsWith('@shared/')) target = join('src/shared', specifier.slice('@shared/'.length))
	else if (specifier.startsWith('@main/')) target = join('src/main', specifier.slice('@main/'.length))
	else return null
	return target.replace(/\.js$/, '.ts')
}

// Repo files the matrix runs: runtime imports only, since a type-only import
// cannot change what ffmpeg does.
function runtimeImportClosure(entrypoints: string[]): string[] {
	const seen = new Set<string>()
	const pending = [...entrypoints]
	for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
		if (seen.has(file) || NOT_FILTERED.has(file)) continue
		seen.add(file)
		for (const match of readFileSync(file, 'utf8').matchAll(/^(?:import|export)\s+(type\s+)?[^'"]*?from\s+'([^']+)'/gm)) {
			const target = match[1] || !match[2] ? null : resolveImport(file, match[2])
			if (target) pending.push(target)
		}
	}
	return [...seen].sort()
}

function jobNames(workflow: string): string[] {
	const jobs = workflow.slice(workflow.indexOf('\njobs:\n'))
	return [...jobs.matchAll(/^ {2}([a-z-]+):$/gm)].flatMap(match => (match[1] ? [match[1]] : []))
}

describe('FFmpeg remux matrix workflow', () => {
	it('runs the matrix for every file it executes', () => {
		const patterns = filterPatterns(readWorkflow())
		const closure = runtimeImportClosure(MATRIX_ENTRYPOINTS)

		expect(closure).toContain('src/main/services/binary/FfmpegPackageMaterializer.ts')
		expect(closure).toContain('src/main/utils/process.ts')
		expect(closure.filter(file => !patterns.some(pattern => matchesGlob(file, pattern)))).toEqual([])
	})

	it('triggers on every PR and push, so the required gate always reports', () => {
		const workflow = readWorkflow()
		const triggers = workflow.slice(workflow.indexOf('\non:\n'), workflow.indexOf('\nconcurrency:'))

		expect(triggers).not.toContain('paths:')
		expect(triggers).toContain('  pull_request:\n')
		expect(triggers).toMatch(/ {2}schedule:\n\s+- cron: '[^']+'/)
	})

	it('gates on every other job, even when they are skipped or fail', () => {
		const workflow = readWorkflow()
		const gate = workflow.slice(workflow.indexOf('\n  gate:\n'))
		const others = jobNames(workflow).filter(name => name !== 'gate')

		expect(gate).toContain('name: FFmpeg remux gate')
		expect(gate).toContain('if: ${{ always() }}')
		expect(gate).toContain(`needs: [${others.join(', ')}]`)
	})

	it('pins the path filter action to an immutable SHA', () => {
		expect(readWorkflow()).toMatch(/uses: dorny\/paths-filter@[a-f0-9]{40}/)
	})
})
