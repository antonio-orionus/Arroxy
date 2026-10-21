import {describe, expect, it} from 'vite-plus/test'
import {loadConfig} from '../src/config.js'
import {planWorkflow, templateLiteral, type WorkflowInput, type WorkflowPlanOptions} from '../src/index.js'
import {fillLiteralFields, ytDlpExpandTemplate} from './helpers/expansion-model.js'

const URL = 'https://www.youtube.com/watch?v=test'
const ENV = {HOME: '/home/u', USERPROFILE: 'C:\\Users\\u', USERNAME: 'u', ARROXY_PARITY: 'EXPANDED', 'USERNAME-x': 'dash'}

function adjacent(args: readonly string[], flag: string, value: string): boolean {
	return args.some((arg, index) => arg === flag && args[index + 1] === value)
}

describe('templateLiteral', () => {
	it('turns each sign yt-dlp would act on into an absent field that defaults to it', () => {
		expect(templateLiteral('$HOME 100% ~u')).toBe('%(_absent|$)sHOME 100%(_absent|%)s %(_absent|~)su')
		expect(templateLiteral('Plain title [abc]')).toBe('Plain title [abc]')
	})

	// ntpath pairs `%` signs left to right, so a field before a `%%` escape
	// shifts the pairing and `%NAME%` expands. Every run between two `%` here
	// starts with `(` or `)`, whatever came before.
	it.each(['', '%(id)s ', '%(id)s %(id)s ', '%(title)s/'])('survives both expanders after %j', prefix => {
		const titles = ['$HOME', '${HOME}', '$$HOME', 'a $X %USERPROFILE% b', '50%% $USERNAME-x %USERNAME%', '%ARROXY_PARITY%', '~', '~root', '~/x', 'x$', 'Who wants $?', '%%%', '%(title)s', "it's 'q' %HOME%", '100% off ', ' lead']
		for (const title of titles) {
			const template = `${prefix}${templateLiteral(title)}.%(ext)s`
			for (const platform of ['posix', 'nt'] as const) {
				const expanded = ytDlpExpandTemplate(template, platform, ENV)
				expect(expanded, `${platform}: ${title}`).toBe(template)
				expect(fillLiteralFields(expanded.slice(prefix.length)), `${platform}: ${title}`).toBe(`${title}.%(ext)s`)
			}
		}
	})
})

// Every file-writing workflow kind, planned into a folder whose name trips
// every expansion yt-dlp has. Listing a kind is required: a new one fails to
// compile until it is planned here or said to write no files.
const DIR = '/x/Down $HOME 100% %(id)s %USERPROFILE% ~u '
const FRAGMENTS = ['/x/', 'Down ', '$HOME', 'USERPROFILE', '~u']
const managed: WorkflowPlanOptions = {config: {...loadConfig({}), outputRoot: DIR, tempRoot: `${DIR}/.tmp`}}

type Kind = NonNullable<WorkflowInput['kind']>
const KINDS: Record<Kind, readonly (readonly [WorkflowInput, WorkflowPlanOptions?])[] | 'writes no files'> = {
	probe: 'writes no files',
	'subtitle-listing': 'writes no files',
	inspect: 'writes no files',
	postprocess: 'writes no files',
	expert: 'writes no files',
	media: [
		[{kind: 'media', url: URL, output: {directory: DIR, tempDirectory: `${DIR}/.arroxy-temp/job`, report: {finalPath: `${DIR}/.arroxy-temp/job/_arroxy.final-path.txt`}}, resume: {loadInfoJsonPath: `${DIR}/.arroxy-temp/job/_arroxy.info.json`}}],
		[{kind: 'media', url: URL, output: {directory: DIR, template: '%(id)s.%(ext)s'}}],
		[{kind: 'media', url: URL, output: {directory: DIR, tempDirectory: `${DIR}/.arroxy-temp/job`}, subtitles: {embed: true, languages: ['en']}}],
		[{kind: 'media', url: URL}, managed]
	],
	subtitles: [
		[{kind: 'subtitles', url: URL, output: {directory: DIR, report: {subtitles: `${DIR}/_arroxy.subtitles.json`}}, subtitles: {languages: ['en'], format: 'srt'}}],
		[{kind: 'subtitles', url: URL, output: {directory: DIR, subtitleMode: 'subfolder'}, subtitles: {languages: ['en'], format: 'srt'}}],
		[{kind: 'subtitles', url: URL, output: {directory: DIR, tempDirectory: `${DIR}/.arroxy-temp/job`}, subtitles: {tracks: [{key: 'en', auto: false}], format: 'srt'}, loadInfoJsonPath: `${DIR}/.arroxy-temp/job/_arroxy.listing.json`}],
		[{kind: 'subtitles', url: URL, subtitles: {subLangs: 'en'}}, managed]
	],
	audio: [[{kind: 'audio', url: URL}, managed]],
	thumbnail: [[{kind: 'thumbnail', url: URL}, managed]],
	playlist: [[{kind: 'playlist', url: URL, selection: {downloadArchive: 'archive.txt'}}, managed]]
}

describe('output target: no folder text reaches argv', () => {
	for (const [kind, plans] of Object.entries(KINDS)) {
		if (plans === 'writes no files') continue
		it.each(plans.map((plan, index) => [index, ...plan] as const))(`${kind} #%i runs inside the folder`, (_index, input, options) => {
			const plan = planWorkflow(input, options)
			expect(plan.cwd).toBe(DIR)
			for (const arg of plan.args) for (const fragment of FRAGMENTS) expect(arg, `argv ${JSON.stringify(arg)}`).not.toContain(fragment)
		})
	}
})

describe('output target: relative argv', () => {
	it('plans media with its temp folder, info-json and final-path report relative to the folder', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.arroxy-temp/job', report: {finalPath: '/out/.arroxy-temp/job/_arroxy.final-path.txt'}}, selection: {formatId: '18'}})

		expect(plan.cwd).toBe('/out')
		expect(plan.args).not.toContain('home:/out')
		expect(adjacent(plan.args, '--paths', 'temp:.arroxy-temp/job')).toBe(true)
		expect(adjacent(plan.args, '-o', '%(title).200B.%(ext)s')).toBe(true)
		expect(adjacent(plan.args, '-o', 'infojson:.arroxy-temp/job/_arroxy')).toBe(true)
		expect(plan.args.join('\n')).toContain(['--print-to-file', 'after_move:filepath', '.arroxy-temp/job/_arroxy.final-path.txt'].join('\n'))
	})

	it('takes paths already relative to the folder as they are', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '.arroxy-temp/job', report: {finalPath: '.arroxy-temp/job/final.txt'}}, resume: {loadInfoJsonPath: '.arroxy-temp/job/_arroxy.info.json'}})

		expect(adjacent(plan.args, '--paths', 'temp:.arroxy-temp/job')).toBe(true)
		expect(adjacent(plan.args, '--load-info-json', '.arroxy-temp/job/_arroxy.info.json')).toBe(true)
		expect(adjacent(plan.args, 'after_move:filepath', '.arroxy-temp/job/final.txt')).toBe(true)
	})

	it('passes an info-json from outside the folder as given', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.arroxy-temp/job'}, resume: {loadInfoJsonPath: '/cache/probe.info.json'}})

		expect(adjacent(plan.args, '--load-info-json', '/cache/probe.info.json')).toBe(true)
	})

	it('refuses a temp folder or report outside the folder', () => {
		expect(() => planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/tmp/job'}})).toThrow(/output\.tempDirectory/)
		expect(() => planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/../job'}})).toThrow(/output\.tempDirectory/)
		expect(() => planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out', report: {subtitles: '/elsewhere/subs.json'}}, subtitles: {languages: ['en'], format: 'srt'}})).toThrow(/output\.report\.subtitles/)
	})

	it('escapes a report file name, which yt-dlp reads as an output template', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/t', report: {finalPath: '/out/t/100% $HOME.txt'}}})

		expect(adjacent(plan.args, 'after_move:filepath', 't/100%(_absent|%)s %(_absent|$)sHOME.txt')).toBe(true)
	})

	it('plans subtitles beside the media or in a subfolder, and reports what yt-dlp wrote', () => {
		const beside = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out', report: {subtitles: '/out/.arroxy-temp/job/_arroxy.subtitles.json'}}, subtitles: {languages: ['en'], format: 'srt'}})
		const subfolder = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out', template: '%(id)s.%(ext)s', subtitleMode: 'subfolder'}, subtitles: {languages: ['en'], format: 'srt'}})

		expect(beside.cwd).toBe('/out')
		expect(adjacent(beside.args, '-o', '%(title).200B.%(ext)s')).toBe(true)
		expect(beside.args.join('\n')).toContain(['--print-to-file', 'after_video:%(requested_subtitles)j', '.arroxy-temp/job/_arroxy.subtitles.json'].join('\n'))
		expect(adjacent(subfolder.args, '-o', 'subtitles/%(id)s.%(ext)s')).toBe(true)
	})

	it('runs a managed download inside its output root, with the temp root relative when it is inside', () => {
		const inside = planWorkflow({kind: 'playlist', url: URL, selection: {downloadArchive: 'archive.txt'}}, {config: {...loadConfig({}), outputRoot: '/srv/out', tempRoot: '/srv/out/.tmp'}})
		const outside = planWorkflow({kind: 'media', url: URL}, {config: {...loadConfig({}), outputRoot: '/srv/out', tempRoot: '/srv/tmp'}})

		expect(inside.cwd).toBe('/srv/out')
		expect(inside.args.some(arg => arg.startsWith('home:'))).toBe(false)
		expect(adjacent(inside.args, '--paths', 'temp:.tmp')).toBe(true)
		expect(adjacent(inside.args, '--download-archive', 'archive.txt')).toBe(true)
		expect(outside.cwd).toBe('/srv/out')
		expect(adjacent(outside.args, '--paths', 'temp:/srv/tmp')).toBe(true)
	})
})
