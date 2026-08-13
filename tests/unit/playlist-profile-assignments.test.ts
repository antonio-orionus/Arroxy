import {describe, expect, it} from 'vitest'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {assignProfileToItems, clearAssignmentsForItems, profileAssignmentCounts, resolveAssignedProfile, sameProfileRef} from '@renderer/components/wizard/playlistProfileAssignments.js'

function profile(id: string, name: string): DownloadProfile {
	return {
		id,
		name,
		icon: 'video',
		media: {kind: 'video-audio', codec: 'best', tiers: ['1080'], audio: {format: 'best'}},
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'},
		output: {kind: 'default'},
		filename: {kind: 'default'},
		subfolder: {enabled: false, name: ''},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false},
		createdAt: '2026-08-12T00:00:00.000Z',
		updatedAt: '2026-08-12T00:00:00.000Z'
	} as DownloadProfile
}

const ARCHIVE = profile('archive', 'Archive 4K')
const PODCAST = profile('podcast', 'Podcast MP3')
const PROFILES = [ARCHIVE, PODCAST]
const ARCHIVE_REF: DownloadProfileRef = {kind: 'custom', id: 'archive'}
const PODCAST_REF: DownloadProfileRef = {kind: 'custom', id: 'podcast'}

describe('playlistProfileAssignments', () => {
	it('compares refs by kind and id', () => {
		expect(sameProfileRef(ARCHIVE_REF, {kind: 'custom', id: 'archive'})).toBe(true)
		expect(sameProfileRef(ARCHIVE_REF, {kind: 'builtin', id: 'archive'})).toBe(false)
		expect(sameProfileRef(ARCHIVE_REF, PODCAST_REF)).toBe(false)
	})

	it('falls back to the baseline for unassigned items', () => {
		expect(resolveAssignedProfile('x', {}, PROFILES, ARCHIVE).id).toBe('archive')
	})

	it('falls back to the baseline when the assigned profile was deleted', () => {
		expect(resolveAssignedProfile('x', {x: {kind: 'custom', id: 'gone'}}, PROFILES, ARCHIVE).id).toBe('archive')
	})

	it('stores deviations only, dropping entries that match the baseline', () => {
		const assigned = assignProfileToItems({}, ['a', 'b'], PODCAST_REF, ARCHIVE_REF)
		expect(assigned).toEqual({a: PODCAST_REF, b: PODCAST_REF})

		const backToBaseline = assignProfileToItems(assigned, ['a'], ARCHIVE_REF, ARCHIVE_REF)
		expect(backToBaseline).toEqual({b: PODCAST_REF})
	})

	it('clears assignments for the given ids only', () => {
		expect(clearAssignmentsForItems({a: PODCAST_REF, b: PODCAST_REF}, ['a'])).toEqual({b: PODCAST_REF})
	})

	it('drops assignments for removed items', () => {
		expect(clearAssignmentsForItems({a: PODCAST_REF, b: PODCAST_REF}, ['b'])).toEqual({a: PODCAST_REF})
	})

	it('counts every item against its effective profile', () => {
		const counts = profileAssignmentCounts(['a', 'b', 'c'], {c: PODCAST_REF}, PROFILES, ARCHIVE_REF)
		expect(counts.get('archive')).toBe(2)
		expect(counts.get('podcast')).toBe(1)
	})
})
