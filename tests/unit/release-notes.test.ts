import {describe, expect, it} from 'vitest'
import {extractReleaseNotesMarkdown, listChangelogVersions, parseReleaseNotes, releaseNotesForVersion, releaseNotesSince, shouldShowWhatsNew} from '@shared/releaseNotes.js'

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

const MULTI_CHANGELOG = `# Changelog

## Unreleased

Pending work.

## 1.4.0

Newest stable.

### Alpha

- Alpha bullet.

## 1.4.0-beta.1

Beta that was folded into 1.4.0.

### Beta Only

- Beta bullet.

## 1.3.0

Third.

### Bravo

- Bravo bullet.

## 1.2.0

Second.

### Charlie

- Charlie bullet.

## 1.1.0

First.

### Delta

- Delta bullet.

## 1.0.0

Ancient.

### Echo

- Echo bullet.
`

describe('release notes digest', () => {
	it('lists only version headings, skipping Unreleased and nested headings', () => {
		expect(listChangelogVersions(MULTI_CHANGELOG)).toEqual(['1.4.0', '1.4.0-beta.1', '1.3.0', '1.2.0', '1.1.0', '1.0.0'])
	})

	it('collects every stable release the user skipped, newest first', () => {
		const digest = releaseNotesSince(MULTI_CHANGELOG, {appVersion: '1.4.0', lastShownVersion: '1.1.0'})

		expect(digest?.version).toBe('1.4.0')
		expect(digest?.releases.map(release => release.version)).toEqual(['1.4.0', '1.3.0', '1.2.0'])
	})

	it('goes all the way back to the last version the user saw, however far that is', () => {
		const digest = releaseNotesSince(MULTI_CHANGELOG, {appVersion: '1.4.0', lastShownVersion: '1.0.0'})

		expect(digest?.releases.map(release => release.version)).toEqual(['1.4.0', '1.3.0', '1.2.0', '1.1.0'])
	})

	it('excludes the version the user already saw and anything below it', () => {
		const digest = releaseNotesSince(MULTI_CHANGELOG, {appVersion: '1.4.0', lastShownVersion: '1.2.0'})

		expect(digest?.releases.map(release => release.version)).toEqual(['1.4.0', '1.3.0'])
	})

	it('skips intermediate pre-releases that were folded into a stable section', () => {
		const digest = releaseNotesSince(MULTI_CHANGELOG, {appVersion: '1.4.0', lastShownVersion: '1.0.0'})

		expect(digest?.releases.map(release => release.version)).not.toContain('1.4.0-beta.1')
	})

	it('still shows its own notes when the running build is a pre-release', () => {
		const digest = releaseNotesSince(MULTI_CHANGELOG, {appVersion: '1.4.0-beta.1', lastShownVersion: '1.3.0'})

		expect(digest?.releases.map(release => release.version)).toEqual(['1.4.0-beta.1'])
	})

	it('shows only the current release when nothing was ever shown before', () => {
		const digest = releaseNotesSince(MULTI_CHANGELOG, {appVersion: '1.4.0'})

		expect(digest?.releases.map(release => release.version)).toEqual(['1.4.0'])
	})

	it('returns null when the running version has no section of its own', () => {
		expect(releaseNotesSince(MULTI_CHANGELOG, {appVersion: '9.9.9', lastShownVersion: '1.0.0'})).toBeNull()
	})

	it('carries the parsed sections through for every listed release', () => {
		const digest = releaseNotesSince(MULTI_CHANGELOG, {appVersion: '1.4.0', lastShownVersion: '1.2.0'})

		expect(digest?.releases[0]?.sections.map(section => section.title)).toEqual(['Alpha'])
		expect(digest?.releases[1]?.intro).toEqual(['Third.'])
		expect(digest?.releases[1]?.sections[0]?.bullets).toEqual(['Bravo bullet.'])
	})
})
