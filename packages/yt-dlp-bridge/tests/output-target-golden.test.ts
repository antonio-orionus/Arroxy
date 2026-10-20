import {describe, expect, it} from 'vite-plus/test'
import {loadConfig} from '../src/config.js'
import {planWorkflow, type WorkflowInput, type WorkflowPlanOptions} from '../src/index.js'

// Every path flag a workflow plans, pinned argv for argv. The file was written
// from the planner before the output target took the flags over; a change to it
// is a change to what yt-dlp is told, and is reviewed as one.
const URL = 'https://www.youtube.com/watch?v=test'
const config = {...loadConfig({}), outputRoot: '/srv/out', tempRoot: '/srv/tmp'}
const PCT_DIR = '/out/100% b%(e)s'

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
	['subtitles in a subfolder, in a folder with %', {kind: 'subtitles', url: URL, output: {directory: PCT_DIR, template: '%(id)s.%(ext)s', subtitleMode: 'subfolder'}, subtitles: {languages: ['en'], format: 'ass', autoOnly: true}}],
	['managed media', {kind: 'media', url: URL}, {config}],
	['managed media with its own output', {kind: 'media', url: URL, output: {outputRoot: '/srv/out/a', tempRoot: '/srv/tmp/b', outputTemplate: '%(id)s.%(ext)s', allowOverwrite: true}}, {config}],
	['managed subtitles', {kind: 'subtitles', url: URL, subtitles: {subLangs: 'en'}}, {config}],
	['managed playlist with a download archive', {kind: 'playlist', url: URL, selection: {downloadArchive: 'archive.txt'}}, {config}]
]

describe('output target golden argv', () => {
	it('plans every path flag as recorded', async () => {
		const planned = Object.fromEntries(CASES.map(([name, input, options]) => [name, planWorkflow(input, options).args]))
		await expect(`${JSON.stringify(planned, null, '\t')}\n`).toMatchFileSnapshot('./golden/output-target-argv.json')
	})
})
