import {describe, expect, it} from 'vite-plus/test'
import {checkerFailure, parseOxlintUnix, partitionFindings, stagedTypeScriptPaths} from '../../scripts/commitFallout.js'

describe('parseOxlintUnix', () => {
	it('reads file and message from unix-format lines and skips the summary', () => {
		const out = ['tests/unit/ytdlp-args.test.ts:41:65: This assertion is unnecessary. [Error/typescript(no-unnecessary-type-assertion)]', '', '1 problem'].join('\n')
		expect(parseOxlintUnix(out)).toEqual([{file: 'tests/unit/ytdlp-args.test.ts', location: '41:65', message: 'This assertion is unnecessary. [Error/typescript(no-unnecessary-type-assertion)]'}])
	})

	it('reads type errors from the same pass, including Windows paths', () => {
		const out = ["src\\shared\\types.ts:640:14: Type 'string' is not assignable to type 'number'. [Error/typescript(TS2322)]", '', '1 problem'].join('\n')
		expect(parseOxlintUnix(out)).toEqual([{file: 'src/shared/types.ts', location: '640:14', message: "Type 'string' is not assignable to type 'number'. [Error/typescript(TS2322)]"}])
	})
})

describe('partitionFindings', () => {
	const finding = (file: string) => ({file, location: '1:1', message: 'x'})

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
	const finding = {file: 'a.ts', location: '1:1', message: 'x'}

	it('fails when a checker cannot start', () => {
		expect(checkerFailure({exitCode: null, launchError: 'spawn bunx ENOENT', output: ''}, [])).toMatch(/could not start/)
	})

	it('fails when a checker exits non-zero without parseable findings', () => {
		expect(checkerFailure({exitCode: 2, launchError: null, output: 'panic: boom'}, [])).toMatch(/exited with 2[\s\S]*panic: boom/)
	})

	it('passes a non-zero exit that produced findings, and a clean run', () => {
		expect(checkerFailure({exitCode: 2, launchError: null, output: ''}, [finding])).toBeNull()
		expect(checkerFailure({exitCode: 0, launchError: null, output: ''}, [])).toBeNull()
	})
})
