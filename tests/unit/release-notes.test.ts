import {describe, expect, it} from 'vitest'
import {extractReleaseNotesMarkdown, parseReleaseNotes, releaseNotesForVersion, shouldShowWhatsNew} from '@shared/releaseNotes.js'

const CHANGELOG = `# Changelog

## Unreleased

Pending work.

---

## 1.2.0

This release makes updates easier to understand.

## Highlights

### Update Notes

- Shows a What's New popup after updating.
- Keeps the changelog as the source of truth.

### Reliability

- Avoids network fetches while opening the popup.

---

## 1.1.0

Older notes.
`

const V_PREFIX_CHANGELOG = `# Changelog

## 1.2.0

Current notes.

## Highlights

### Update Notes

- Still part of 1.2.0.

## v1.1.0

Older notes.
`

describe('release notes', () => {
	it('extracts the current version section without dropping nested headings', () => {
		const markdown = extractReleaseNotesMarkdown(CHANGELOG, '1.2.0')

		expect(markdown).toContain('This release makes updates easier to understand.')
		expect(markdown).toContain('## Highlights')
		expect(markdown).toContain('### Update Notes')
		expect(markdown).not.toContain('## 1.1.0')
	})

	it('stops extraction at v-prefixed version headings without dropping nested level-2 headings', () => {
		const markdown = extractReleaseNotesMarkdown(V_PREFIX_CHANGELOG, '1.2.0')

		expect(markdown).toContain('## Highlights')
		expect(markdown).toContain('Still part of 1.2.0.')
		expect(markdown).not.toContain('## v1.1.0')
	})

	it('returns null when the changelog has no section for the version', () => {
		expect(extractReleaseNotesMarkdown(CHANGELOG, '9.9.9')).toBeNull()
	})

	it('parses intro paragraphs and highlighted bullet sections', () => {
		const markdown = extractReleaseNotesMarkdown(CHANGELOG, '1.2.0')
		expect(markdown).not.toBeNull()

		const notes = parseReleaseNotes('1.2.0', markdown!)

		expect(notes).toEqual({
			version: '1.2.0',
			intro: ['This release makes updates easier to understand.'],
			sections: [
				{title: 'Update Notes', body: [], bullets: ["Shows a What's New popup after updating.", 'Keeps the changelog as the source of truth.']},
				{title: 'Reliability', body: [], bullets: ['Avoids network fetches while opening the popup.']}
			]
		})
	})

	it('combines extraction and parsing for an app version', () => {
		expect(releaseNotesForVersion(CHANGELOG, '1.2.0')?.sections).toHaveLength(2)
		expect(releaseNotesForVersion(CHANGELOG, '1.2.0-beta.1')).toBeNull()
	})

	it('shows only after a real post-install version bump with notes', () => {
		const notes = releaseNotesForVersion(CHANGELOG, '1.2.0')

		expect(shouldShowWhatsNew({appVersion: '1.2.0', lastShownVersion: '1.1.0', launchCount: 3, notes})).toBe(true)
		expect(shouldShowWhatsNew({appVersion: '1.2.0', lastShownVersion: '1.2.0', launchCount: 3, notes})).toBe(false)
		expect(shouldShowWhatsNew({appVersion: '1.2.0+45', lastShownVersion: '1.2.0', launchCount: 3, notes})).toBe(false)
		expect(shouldShowWhatsNew({appVersion: 'not-semver', lastShownVersion: '1.1.0', launchCount: 3, notes})).toBe(false)
		expect(shouldShowWhatsNew({appVersion: '1.2.0', lastShownVersion: undefined, launchCount: 1, notes})).toBe(false)
		expect(shouldShowWhatsNew({appVersion: '1.2.0', lastShownVersion: '1.1.0', launchCount: 3, notes: null})).toBe(false)
	})
})
