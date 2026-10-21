import {describe, expect, it} from 'vite-plus/test'
import {editedProfileName} from '@renderer/lib/profileName.js'
import {DOWNLOAD_PROFILE_NAME_MAX} from '@shared/schemas.js'

// The default name for saving a run's edits is "<profile> (edited)". A profile
// name near the limit must still give a name a profile can be saved with.
describe('editedProfileName', () => {
	it('adds the edited suffix to a short name', () => {
		expect(editedProfileName('Full HD 1080p')).toBe('Full HD 1080p (edited)')
	})

	it.each([72, DOWNLOAD_PROFILE_NAME_MAX])('shortens a %i-character name so the whole name fits', length => {
		const name = editedProfileName('a'.repeat(length))

		expect(name.length).toBeLessThanOrEqual(DOWNLOAD_PROFILE_NAME_MAX)
		expect(name).toMatch(/^a+… \(edited\)$/)
	})

	it('trims the shortened part before the ellipsis', () => {
		const name = editedProfileName(`${'a'.repeat(65)}${' '.repeat(5)}${'b'.repeat(10)}`)

		expect(name).toBe(`${'a'.repeat(65)}… (edited)`)
	})

	it('never cuts an emoji in half when the cut falls inside it', () => {
		const name = editedProfileName(`${'a'.repeat(69)}😀${'b'.repeat(20)}`)

		expect(name).toBe(`${'a'.repeat(69)}… (edited)`)
		expect(name).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/)
	})

	it('keeps a name that fits exactly as it is', () => {
		const profile = 'a'.repeat(DOWNLOAD_PROFILE_NAME_MAX - ' (edited)'.length)

		expect(editedProfileName(profile)).toBe(`${profile} (edited)`)
	})
})
