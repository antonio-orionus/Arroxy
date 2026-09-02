import {describe, expect, it} from 'vitest'
import {policyForUrlIntent} from '@renderer/store/wizard/urlIntentPolicy.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'

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
})
