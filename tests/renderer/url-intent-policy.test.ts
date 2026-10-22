import {describe, expect, it} from 'vite-plus/test'
import {policyForUrlIntent} from '@shared/intake/urlIntentPolicy.js'
import {classifyBulkUrlIntent, classifyUrlIntent} from '@shared/urlIntent.js'

const mixed = classifyUrlIntent('https://www.youtube.com/watch?v=one&list=PL1')
const single = classifyUrlIntent('https://www.youtube.com/watch?v=one')
const playlist = classifyUrlIntent('https://www.youtube.com/playlist?list=PL1')
const unknown = classifyUrlIntent('https://vimeo.com/123')

describe('policyForUrlIntent', () => {
	it('asks the user which half of a mixed URL they meant on the interactive path', () => {
		expect(policyForUrlIntent(mixed, 'interactive-submit')).toEqual({kind: 'show-mixed-prompt'})
	})

	// The hotkey fires against a hidden window: there is nobody to prompt, and
	// bouncing to needs-review makes the user open the app to answer a question
	// they almost never meant to be asked.
	it('resolves a mixed URL to the video it names on the hotkey path', () => {
		expect(policyForUrlIntent(mixed, 'hotkey')).toEqual({kind: 'probe-video', playlistMode: 'video'})
	})

	it.each([
		[single, {kind: 'probe-video', playlistMode: 'video'}],
		[playlist, {kind: 'probe-playlist', playlistMode: 'playlist'}],
		[unknown, {kind: 'probe-auto', playlistMode: 'auto'}]
	] as const)('agrees with the interactive path for every unambiguous intent', (intent, expected) => {
		expect(policyForUrlIntent(intent, 'hotkey')).toEqual(expected)
		expect(policyForUrlIntent(intent, 'interactive-submit')).toEqual(expected)
	})

	// A Mix is a video with a list now: every entry point that can ask, asks;
	// the hotkey takes the video; Bulk URLs reads it as one video, as before.
	describe.each(['https://www.youtube.com/watch?v=one&list=RDone', 'https://www.youtube.com/watch?v=one&list=PL1&start_radio=1', 'https://music.youtube.com/watch?v=one&list=RDCLAK5uy_one'])('a video in a Mix or Music playlist (%s)', url => {
		it('asks on the interactive and quick-download paths', () => {
			expect(policyForUrlIntent(classifyUrlIntent(url), 'interactive-submit')).toEqual({kind: 'show-mixed-prompt'})
			expect(policyForUrlIntent(classifyUrlIntent(url), 'quick-download')).toEqual({kind: 'show-mixed-prompt'})
		})

		it('takes the video on the hotkey path', () => {
			expect(policyForUrlIntent(classifyUrlIntent(url), 'hotkey')).toEqual({kind: 'probe-video', playlistMode: 'video'})
		})

		it('stays one video in Bulk URLs', () => {
			expect(policyForUrlIntent(classifyBulkUrlIntent(url), 'bulk-quick-download')).toEqual({kind: 'probe-video', playlistMode: 'video'})
		})
	})

	it('still sends a plain mixed link in Bulk URLs to the Bulk review', () => {
		expect(policyForUrlIntent(classifyBulkUrlIntent('https://www.youtube.com/watch?v=one&list=PL1'), 'bulk-quick-download')).toEqual({kind: 'open-bulk-review'})
	})
})
