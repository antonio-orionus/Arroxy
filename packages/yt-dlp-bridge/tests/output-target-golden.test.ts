import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {loadConfig} from '../src/config.js'
import {planWorkflow, type WorkflowInput, type WorkflowPlanOptions} from '../src/index.js'

// Every path flag a workflow plans, and the working directory it runs in,
// pinned argv for argv. A change to the file is a change to what yt-dlp is
// told, and is reviewed as one.
const URL = 'https://www.youtube.com/watch?v=test'
const config = {...loadConfig({}), outputRoot: '/srv/out', tempRoot: '/srv/tmp'}
const PCT_DIR = '/out/100% b%(e)s'
// Managed roots go through path.resolve, which gives `C:\srv\...` on Windows.
const MANAGED_ROOT = path.resolve('/srv')

function portable(arg: string): string {
	const at = arg.indexOf(MANAGED_ROOT)
	return at === -1 ? arg : `${arg.slice(0, at)}/srv${arg.slice(at + MANAGED_ROOT.length).replaceAll(path.sep, '/')}`
}

const CASES: [string, WorkflowInput, WorkflowPlanOptions?][] = [
	['media with a temp folder writes the info-json there', {kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.arroxy-temp/job'}, selection: {formatId: '137+140'}}],
	['media replaying an info-json under its own base name', {kind: 'media', url: URL, output: {directory: '/out', template: '%(id)s.%(ext)s', tempDirectory: '/out/.arroxy-temp/job'}, selection: {formatId: '18'}, resume: {loadInfoJsonPath: '/out/.arroxy-temp/job/item.info.json', infoJsonBaseName: 'item'}}],
	['media without an info-json', {kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.arroxy-temp/job'}, resume: {writeInfoJson: false}}],
	['skip-download media writes no info-json', {kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.arroxy-temp/job'}, selection: {skipDownload: true}, embed: {thumbnailSidecar: true}}],
	['media without a temp folder', {kind: 'media', url: URL, output: {directory: '/out', template: '%(id)s.%(ext)s'}, selection: {formatId: '18'}}],
	['media in a folder with % and a field', {kind: 'media', url: URL, output: {directory: PCT_DIR, tempDirectory: `${PCT_DIR}/.arroxy-temp/job`}, selection: {formatId: '18'}, resume: {infoJsonBaseName: '50% done'}}],
	['media without a temp folder, in a folder with %', {kind: 'media', url: URL, output: {directory: PCT_DIR}}],
	['media embedding subtitles', {kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.arroxy-temp/job'}, subtitles: {embed: true, languages: ['en'], writeAuto: true}}, {configFiles: {mode: 'disabled'}}],
	['subtitles beside the media', {kind: 'subtitles', url: URL, output: {directory: '/out'}, subtitles: {languages: ['en', 'ja'], format: 'vtt'}}],
	[
		'subtitles with a temp folder, reporting what yt-dlp wrote',
		{kind: 'subtitles', url: URL, output: {directory: '/out', tempDirectory: '/out/.arroxy-temp/job', report: {subtitles: '/out/.arroxy-temp/job/_arroxy.subtitles.json'}}, subtitles: {tracks: [{key: 'en', auto: false}], format: 'srt'}, loadInfoJsonPath: '/out/.arroxy-temp/job/_arroxy.listing.json'}
	],
	['subtitles in a subfolder, in a folder with %', {kind: 'subtitles', url: URL, output: {directory: PCT_DIR, template: '%(id)s.%(ext)s', subtitleMode: 'subfolder'}, subtitles: {languages: ['en'], format: 'ass', autoOnly: true}}],
	['managed media', {kind: 'media', url: URL}, {config}],
	['managed media with its own output', {kind: 'media', url: URL, output: {outputRoot: '/srv/out/a', tempRoot: '/srv/tmp/b', outputTemplate: '%(id)s.%(ext)s', allowOverwrite: true}}, {config}],
	['managed subtitles', {kind: 'subtitles', url: URL, subtitles: {subLangs: 'en'}}, {config}],
	['managed playlist with a download archive', {kind: 'playlist', url: URL, selection: {downloadArchive: 'archive.txt'}}, {config}]
]

describe('output target golden argv', () => {
	it('plans every path flag as recorded', async () => {
		const planned = Object.fromEntries(
			CASES.map(([name, input, options]) => {
				const plan = planWorkflow(input, options)
				return [name, {cwd: plan.cwd === undefined ? null : portable(plan.cwd), args: plan.args.map(portable)}]
			})
		)
		await expect(`${JSON.stringify(planned, null, '\t')}\n`).toMatchFileSnapshot('./golden/output-target-argv.json')
	})
})
