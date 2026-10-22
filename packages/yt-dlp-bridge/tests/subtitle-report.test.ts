import {mkdir, mkdtemp, readFile, rm, stat, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {settleReportedSubtitle} from '../src/index.js'

// yt-dlp (checked on 2026.08.19) reports each subtitle track where it wrote
// it, in the temp folder, then moves it to the same path under the folder
// without updating the report. A track converted from dfxp, ttml or tt to srt
// is never registered for the move and stays in the temp folder.
let directory: string
const TEMP = '.arroxy-temp/job'

async function write(file: string, text: string): Promise<void> {
	await mkdir(path.dirname(path.join(directory, file)), {recursive: true})
	await writeFile(path.join(directory, file), text)
}

async function exists(file: string): Promise<boolean> {
	return stat(path.join(directory, file)).then(
		() => true,
		() => false
	)
}

beforeEach(async () => {
	directory = await mkdtemp(path.join(os.tmpdir(), 'yt-dlp-bridge-subs-'))
})

afterEach(async () => {
	await rm(directory, {recursive: true, force: true})
})

describe('settleReportedSubtitle', () => {
	it('names the file yt-dlp moved out of the temp folder', async () => {
		await write('subtitles/Clip.en.srt', 'moved')

		const settled = await settleReportedSubtitle({directory, tempDirectory: path.join(directory, TEMP)}, `./${TEMP}/subtitles/Clip.en.srt`)

		expect(settled).toBe(path.join(directory, 'subtitles/Clip.en.srt'))
		expect(await readFile(settled, 'utf8')).toBe('moved')
	})

	it('moves a track yt-dlp left in the temp folder to where the move puts it', async () => {
		await write(`${TEMP}/subtitles/Clip.en.srt`, 'converted')

		const settled = await settleReportedSubtitle({directory, tempDirectory: TEMP}, `./${TEMP}/subtitles/Clip.en.srt`)

		expect(settled).toBe(path.join(directory, 'subtitles/Clip.en.srt'))
		expect(await readFile(settled, 'utf8')).toBe('converted')
		expect(await exists(`${TEMP}/subtitles/Clip.en.srt`)).toBe(false)
	})

	it('replaces an older file at that path, as the move does', async () => {
		await write('Clip.en.srt', 'old')
		await write(`${TEMP}/Clip.en.srt`, 'new')

		const settled = await settleReportedSubtitle({directory, tempDirectory: TEMP}, path.join(directory, TEMP, 'Clip.en.srt'))

		expect(await readFile(settled, 'utf8')).toBe('new')
	})

	it('leaves a track outside the temp folder, or a run without one, where the report says', async () => {
		await write('Clip.en.srt', 'present')

		expect(await settleReportedSubtitle({directory, tempDirectory: TEMP}, 'Clip.en.srt')).toBe(path.join(directory, 'Clip.en.srt'))
		expect(await settleReportedSubtitle({directory}, './Clip.en.srt')).toBe(path.join(directory, 'Clip.en.srt'))
		expect(await settleReportedSubtitle({directory}, '/elsewhere/Clip.en.srt')).toBe(path.resolve('/elsewhere/Clip.en.srt'))
		expect(await readFile(path.join(directory, 'Clip.en.srt'), 'utf8')).toBe('present')
	})
})
