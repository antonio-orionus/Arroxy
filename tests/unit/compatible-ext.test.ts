import {describe, expect, it} from 'vite-plus/test'
import {compatibleExt} from '@shared/ytdlp/compatibleExt.js'

// yt-dlp's `get_compatible_ext` (utils/_utils.py), the container its merger writes.
describe('compatibleExt', () => {
	it('puts AV1 or VP9 with Opus in WebM, whatever the video file was', () => {
		expect(compatibleExt({vcodecs: ['av01.0.08M.08'], acodecs: ['opus'], vexts: ['mp4'], aexts: ['webm']})).toBe('webm')
		expect(compatibleExt({vcodecs: ['vp09.00.40.08'], acodecs: ['opus'], vexts: ['mp4'], aexts: ['webm']})).toBe('webm')
	})

	it('puts H.264 or AV1 with AAC in MP4', () => {
		expect(compatibleExt({vcodecs: ['avc1.640028'], acodecs: ['mp4a.40.2'], vexts: ['mp4'], aexts: ['m4a']})).toBe('mp4')
		expect(compatibleExt({vcodecs: ['av01.0.08M.08'], acodecs: ['mp4a.40.2'], vexts: ['mp4'], aexts: ['m4a']})).toBe('mp4')
	})

	it('falls back to MKV for codecs no one container takes', () => {
		expect(compatibleExt({vcodecs: ['avc1.640028'], acodecs: ['opus'], vexts: ['mp4'], aexts: ['webm']})).toBe('mkv')
		expect(compatibleExt({vcodecs: ['vp9'], acodecs: ['mp4a.40.2'], vexts: ['webm'], aexts: ['m4a']})).toBe('mkv')
	})

	it('decides by file extension when a codec is not named', () => {
		expect(compatibleExt({vcodecs: ['avc1'], acodecs: [undefined], vexts: ['mp4'], aexts: ['m4a']})).toBe('mp4')
		expect(compatibleExt({vcodecs: [undefined], acodecs: [undefined], vexts: ['webm'], aexts: ['webm']})).toBe('webm')
		expect(compatibleExt({vcodecs: [undefined], acodecs: [undefined], vexts: ['mp4'], aexts: ['webm']})).toBe('mkv')
	})

	it('takes MKV for more than one stream of a kind', () => {
		expect(compatibleExt({vcodecs: ['avc1'], acodecs: ['mp4a.40.2', 'mp4a.40.2'], vexts: ['mp4'], aexts: ['m4a', 'm4a']})).toBe('mkv')
	})

	it('follows --merge-output-format preferences in their order', () => {
		expect(compatibleExt({vcodecs: ['vp9'], acodecs: ['opus'], vexts: ['webm'], aexts: ['webm'], preferences: ['mp4']})).toBe('mp4')
		expect(compatibleExt({vcodecs: ['vp9'], acodecs: ['opus'], vexts: ['webm'], aexts: ['webm'], preferences: ['webm', 'mkv']})).toBe('webm')
	})
})
