import {describe, expect, it} from 'vite-plus/test'
import {planWorkflow} from 'yt-dlp-bridge'
import {dumpedJsonLine, parseSelectedInfo, reqFor, smokeCases, validate, type SelectedInfo, type SmokeCase} from '../../scripts/playlistPresetSmoke.js'

function plannedArgs(caseDef: SmokeCase): string[] {
	return planWorkflow(reqFor(caseDef.selection, '/out', '/out/info.json', 'https://www.youtube.com/watch?v=x')).args
}

// What yt-dlp picks when it honours the request: an H.264 MP4 within the cap,
// or a lone audio stream.
function honouredPick(caseDef: SmokeCase): SelectedInfo {
	if (caseDef.selection.kind === 'audio') return {ext: 'webm', acodec: 'opus', vcodec: 'none'}
	return {
		ext: 'mp4',
		requested_formats: [
			{format_id: '136', ext: 'mp4', height: 144, vcodec: 'avc1.4d401e', acodec: 'none'},
			{format_id: '140', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2'}
		]
	}
}

function caseNamed(name: string): SmokeCase {
	const found = smokeCases().find(c => c.name === name)
	if (!found) throw new Error(`no smoke case named ${name}`)
	return found
}

function without(args: string[], flag: string, values = 0): string[] {
	const idx = args.indexOf(flag)
	return idx < 0 ? args : [...args.slice(0, idx), ...args.slice(idx + 1 + values)]
}

describe('playlist preset smoke validation', () => {
	it.each(smokeCases().map(c => [c.name, c] as const))('accepts the argv Arroxy plans today for %s', (_name, caseDef) => {
		expect(validate(caseDef, plannedArgs(caseDef), honouredPick(caseDef))).toEqual([])
	})

	it('still catches argv that drops what the plan promises', () => {
		const best = caseNamed('audio best')
		expect(validate(best, without(plannedArgs(best), '-x'), honouredPick(best))).toContain('missing -x')
		expect(validate(best, without(plannedArgs(best), '-f', 1), honouredPick(best))).toContain('missing -f')

		const mp3 = caseNamed('audio mp3 default bitrate')
		expect(validate(mp3, without(plannedArgs(mp3), '--audio-quality', 1), honouredPick(mp3))).toContain('missing --audio-quality')

		const mp4 = caseNamed('video mp4 720')
		expect(validate(mp4, without(plannedArgs(mp4), '-S', 1), honouredPick(mp4))).toContain('missing -S')
		expect(validate(mp4, without(plannedArgs(mp4), '--merge-output-format', 1), honouredPick(mp4))).toContain('missing --merge-output-format')
	})

	it("reads the dumped JSON past the log lines the plan's --no-quiet leaves on stdout", () => {
		const stdout = ['[info] abcdefghijk: Downloading 1 format(s): 251', JSON.stringify({title: 'Offline', format_id: '251', ext: 'webm', acodec: 'opus', vcodec: 'none'}), ''].join('\n')
		expect(parseSelectedInfo(stdout)).toMatchObject({title: 'Offline', format_id: '251', acodec: 'opus'})
	})

	it('keeps only the dumped JSON line, so a cached probe loads back with --load-info-json', () => {
		const json = JSON.stringify({id: 'abcdefghijk', title: 'Offline'})
		expect(dumpedJsonLine(['[youtube] abcdefghijk: Downloading webpage', json, ''].join('\n'))).toBe(json)
		expect(dumpedJsonLine('[youtube] abcdefghijk: Downloading webpage\n')).toBeUndefined()
	})
})
