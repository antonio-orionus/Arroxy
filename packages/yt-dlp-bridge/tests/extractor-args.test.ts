import {describe, expect, it} from 'vite-plus/test'
import type {z} from 'zod'
import {duplicateExtractorArgsBlocks, effectiveExtractorArgs, mergeExtractorArgs, parseExtractorArgsBlock, planWorkflow, renderExtractorArgsBlock, withExtractorArgs} from '../src/index.js'
import {WorkflowDownloadInputSchema} from '../src/schemas.js'

// yt-dlp keeps one dict per extractor and replaces it when the extractor is
// given again (options.py `_dict_from_options_callback`, append=False), so two
// `youtube:` blocks keep only the second. These tests pin both views: what the
// argv means to yt-dlp, and the single block per extractor the planner emits.

function blocks(args: readonly string[]): string[] {
	return args.flatMap((arg, i) => (arg === '--extractor-args' && args[i + 1] !== undefined ? [args[i + 1]] : []))
}

describe('parseExtractorArgsBlock', () => {
	it('reads keys and comma lists the way yt-dlp does', () => {
		expect(parseExtractorArgsBlock('YouTube:Player-Client=default, web_embedded;po_token=web.gvs+TOKEN')).toEqual({youtube: {player_client: ['default', 'web_embedded'], po_token: ['web.gvs+TOKEN']}})
	})

	it('keeps an escaped comma inside one value', () => {
		expect(parseExtractorArgsBlock('generic:impersonate=chrome\\,android')).toEqual({generic: {impersonate: ['chrome,android']}})
	})

	it('treats a bare key as one empty value and splits only on the first =', () => {
		expect(parseExtractorArgsBlock('generic:impersonate;key=a=b')).toEqual({generic: {impersonate: [''], key: ['a=b']}})
	})

	it('rejects a block without an extractor name', () => {
		expect(() => parseExtractorArgsBlock('player_client=web')).toThrow(/extractor/)
	})
})

describe('renderExtractorArgsBlock', () => {
	it('joins keys with ; and values with ,', () => {
		expect(renderExtractorArgsBlock('youtube', {player_client: ['default', 'web_embedded'], po_token: ['web.gvs+TOKEN']})).toBe('youtube:player_client=default,web_embedded;po_token=web.gvs+TOKEN')
	})

	it('escapes commas inside a value so it round-trips', () => {
		const rendered = renderExtractorArgsBlock('generic', {impersonate: ['chrome,android']})
		expect(rendered).toBe('generic:impersonate=chrome\\,android')
		expect(parseExtractorArgsBlock(rendered)).toEqual({generic: {impersonate: ['chrome,android']}})
	})

	it('refuses a value yt-dlp cannot carry', () => {
		expect(() => renderExtractorArgsBlock('youtube', {visitor_data: ['a;b']})).toThrow(/;/)
	})

	it('drops keys that have no values', () => {
		expect(renderExtractorArgsBlock('youtube', {player_client: [], lang: ['en']})).toBe('youtube:lang=en')
	})
})

describe('effectiveExtractorArgs', () => {
	it('keeps only the last block per extractor, as yt-dlp does', () => {
		const argv = ['--extractor-args', 'youtube:po_token=web.gvs+TOKEN;visitor_data=VISITOR', '--extractor-args', 'generic:impersonate', '--extractor-args', 'youtube:player_client=default,web_embedded', 'https://example.com']
		expect(effectiveExtractorArgs(argv)).toEqual({youtube: {player_client: ['default', 'web_embedded']}, generic: {impersonate: ['']}})
	})

	it('ignores a value yt-dlp would reject, such as a flag left without one', () => {
		expect(effectiveExtractorArgs(['--extractor-args', '--no-playlist', 'https://youtu.be/abc'])).toEqual({})
		expect(duplicateExtractorArgsBlocks(['--extractor-args', '--no-playlist'])).toEqual([])
	})

	it('reads the --extractor-args=value form too', () => {
		expect(effectiveExtractorArgs(['--extractor-args=youtube:lang=en'])).toEqual({youtube: {lang: ['en']}})
	})
})

describe('mergeExtractorArgs', () => {
	it('merges per key, later layers winning', () => {
		expect(mergeExtractorArgs({youtube: {player_client: ['default'], lang: ['en']}}, {youtube: {player_client: ['web']}, generic: {impersonate: ['']}})).toEqual({youtube: {player_client: ['web'], lang: ['en']}, generic: {impersonate: ['']}})
	})
})

describe('withExtractorArgs', () => {
	it('consolidates every block in the argv with the overrides into one block per extractor', () => {
		const argv = ['--dump-single-json', '--extractor-args', 'youtube:player_client=default,web_embedded', '--no-playlist', 'https://youtu.be/abc']
		const result = withExtractorArgs(argv, {youtube: {po_token: ['web.gvs+TOKEN'], visitor_data: ['VISITOR']}})

		expect(blocks(result)).toEqual(['youtube:player_client=default,web_embedded;po_token=web.gvs+TOKEN;visitor_data=VISITOR'])
		expect(result.filter(arg => arg !== '--extractor-args' && !arg.startsWith('youtube:'))).toEqual(['--dump-single-json', '--no-playlist', 'https://youtu.be/abc'])
		expect(effectiveExtractorArgs(result)).toEqual({youtube: {player_client: ['default', 'web_embedded'], po_token: ['web.gvs+TOKEN'], visitor_data: ['VISITOR']}})
	})

	it('adds the overrides when the argv carries no block', () => {
		expect(withExtractorArgs(['https://youtu.be/abc'], {youtube: {player_client: ['default', '-web']}})).toEqual(['--extractor-args', 'youtube:player_client=default,-web', 'https://youtu.be/abc'])
	})

	it('leaves an argv without blocks or overrides unchanged', () => {
		expect(withExtractorArgs(['--dump-json', 'https://youtu.be/abc'], {})).toEqual(['--dump-json', 'https://youtu.be/abc'])
	})
})

describe('duplicateExtractorArgsBlocks', () => {
	it('names every extractor given more than one block', () => {
		expect(duplicateExtractorArgsBlocks(['--extractor-args', 'youtube:lang=en', '--extractor-args', 'generic:impersonate', '--extractor-args=YouTube:player_client=web'])).toEqual(['youtube'])
		expect(duplicateExtractorArgsBlocks(['--extractor-args', 'youtube:lang=en'])).toEqual([])
	})
})

type PlanInput = z.input<typeof WorkflowDownloadInputSchema>

describe('planned workflows emit one block per extractor', () => {
	it('keeps every managed YouTube option the caller set', () => {
		const input: PlanInput = {
			url: 'https://www.youtube.com/watch?v=abc',
			kind: 'media',
			format: {formatSort: []},
			output: {allowOverwrite: false},
			network: {},
			selection: {matchFilters: [], breakMatchFilters: []},
			download: {retrySleep: [], downloadSections: [], downloader: [], downloaderArgs: []},
			subtitles: {},
			thumbnails: {},
			auth: {},
			postprocess: {postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: [], usePostprocessor: []},
			sponsorblock: {},
			extractor: {extractorArgs: ['youtube:player_skip=webpage', 'generic:impersonate'], youtube: {lang: 'en', fetchPot: 'never', playerClient: ['default', 'web_embedded'], poToken: ['web.gvs+TOKEN']}}
		}
		const plan = planWorkflow(input)

		expect(duplicateExtractorArgsBlocks(plan.args)).toEqual([])
		expect(effectiveExtractorArgs(plan.args)).toEqual({youtube: {player_skip: ['webpage'], lang: ['en'], fetch_pot: ['never'], player_client: ['default', 'web_embedded'], po_token: ['web.gvs+TOKEN']}, generic: {impersonate: ['']}})
		expect(plan.redactedArgs.join(' ')).not.toContain('TOKEN')
	})

	it('passes expert argv through untouched', () => {
		const args = ['--extractor-args', 'youtube:lang=en', '--extractor-args', 'youtube:player_client=web']
		expect(planWorkflow({kind: 'expert', args, dryRun: false, output: {}}).args).toEqual(args)
	})
})
