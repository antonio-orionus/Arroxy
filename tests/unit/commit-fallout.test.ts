import {describe, expect, it} from 'vitest'
import {checkerFailure, parseOxlintUnix, parseTscOutput, partitionFindings, stagedTypeScriptPaths} from '../../scripts/commitFallout.js'

describe('parseOxlintUnix', () => {
	it('reads file and message from unix-format lines and skips the summary', () => {
		const out = ['tests/unit/ytdlp-args.test.ts:41:65: This assertion is unnecessary. [Error/typescript(no-unnecessary-type-assertion)]', '', '1 problem'].join('\n')
		expect(parseOxlintUnix(out)).toEqual([{tool: 'oxlint', file: 'tests/unit/ytdlp-args.test.ts', location: '41:65', message: 'This assertion is unnecessary. [Error/typescript(no-unnecessary-type-assertion)]'}])
	})
})

describe('parseTscOutput', () => {
	it('reads file and message from non-pretty tsc errors, including Windows paths', () => {
		const out = ["src/main/downloadSmoke.ts(76,47): error TS2345: Argument of type 'string' is not assignable.", 'src\\main\\index.ts(3,1): error TS2307: Cannot find module.', 'Found 2 errors.'].join('\n')
		expect(parseTscOutput(out)).toEqual([
			{tool: 'tsc', file: 'src/main/downloadSmoke.ts', location: '76,47', message: "error TS2345: Argument of type 'string' is not assignable."},
			{tool: 'tsc', file: 'src/main/index.ts', location: '3,1', message: 'error TS2307: Cannot find module.'}
		])
	})
})

describe('partitionFindings', () => {
	const finding = (file: string) => ({tool: 'oxlint' as const, file, location: '1:1', message: 'x'})

	it('blocks on files the commit determines and sets aside files with other uncommitted work', () => {
		const result = partitionFindings([finding('tests/a.test.ts'), finding('src/wip.ts'), finding('src/new-untracked.ts')], new Set(['src/wip.ts', 'src/new-untracked.ts']))
		expect(result.blocking.map(f => f.file)).toEqual(['tests/a.test.ts'])
		expect(result.ignored.map(f => f.file)).toEqual(['src/wip.ts', 'src/new-untracked.ts'])
	})
})

describe('stagedTypeScriptPaths', () => {
	it('includes deletions and both sides of a rename, and skips non-TypeScript files', () => {
		const nameStatus = ['D\tsrc/main/removed.ts', 'R100\tsrc/old.ts\tsrc/new.ts', 'M\tREADME.md', 'A\tsrc/renderer/App.tsx', ''].join('\n')
		expect(stagedTypeScriptPaths(nameStatus)).toEqual(['src/main/removed.ts', 'src/old.ts', 'src/new.ts', 'src/renderer/App.tsx'])
	})

	it('treats a deletion-only commit as TypeScript work', () => {
		expect(stagedTypeScriptPaths('D\tsrc/main/removed.ts\n')).toEqual(['src/main/removed.ts'])
	})
})

describe('checkerFailure', () => {
	const finding = {tool: 'tsc' as const, file: 'a.ts', location: '1,1', message: 'error TS1: x'}

	it('fails when a checker cannot start', () => {
		expect(checkerFailure('tsc', {exitCode: null, launchError: 'spawn bunx ENOENT', output: ''}, [])).toMatch(/could not start/)
	})

	it('fails when a checker exits non-zero without parseable findings', () => {
		expect(checkerFailure('oxlint', {exitCode: 2, launchError: null, output: 'panic: boom'}, [])).toMatch(/exited with 2[\s\S]*panic: boom/)
	})

	it('passes a non-zero exit that produced findings, and a clean run', () => {
		expect(checkerFailure('tsc', {exitCode: 2, launchError: null, output: ''}, [finding])).toBeNull()
		expect(checkerFailure('tsc', {exitCode: 0, launchError: null, output: ''}, [])).toBeNull()
	})
})
