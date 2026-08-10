import {describe, expect, it} from 'vitest'
import {canMatchDownloadsById, canWriteM3u, playlistEntryTemplateMeta, singleTemplateMeta, templateOwnsDirs} from '@renderer/store/wizard/outputTemplates.js'
import type {PlaylistEntry} from '@shared/types.js'

const ENTRY: PlaylistEntry = {id: '7::e1', url: 'https://example.com/e1', title: 'First', thumbnail: '', playlistIndex: 7, videoId: 'e1', uploader: 'Blender Foundation', uploadDate: '20260803'}

describe('templateOwnsDirs', () => {
	it('is true when the effective template nests, so the playlist auto-folder steps aside', () => {
		expect(templateOwnsDirs(undefined, '{playlist_title}/{title} [{id}]')).toBe(true)
	})

	it('is false for a flat template, leaving existing folder behavior alone', () => {
		expect(templateOwnsDirs(undefined, '{title} [{id}]')).toBe(false)
	})

	it('honors a profile override over the global template', () => {
		const profile = {filename: {kind: 'custom', template: '{uploader}/{title} [{id}]'}} as never
		expect(templateOwnsDirs(profile, '{title} [{id}]')).toBe(true)
	})
})

describe('canWriteM3u', () => {
	it('allows M3U for a flat template that carries {id}', () => {
		expect(canWriteM3u(undefined, '{title} [{id}]')).toBe(true)
	})

	it('disables M3U when {id} is absent, matching the existing dedupe degrade', () => {
		expect(canWriteM3u(undefined, '{uploader} - {title}')).toBe(false)
		expect(canMatchDownloadsById(undefined, '{uploader} - {title}')).toBe(false)
	})

	it('disables M3U when the template nests, because entries no longer share one folder', () => {
		// A playlist whose items land in per-uploader folders has no single
		// directory for a relative playlist file to point at.
		expect(canWriteM3u(undefined, '{uploader}/{title} [{id}]')).toBe(false)
		// …even though the {id} dedupe itself is still viable.
		expect(canMatchDownloadsById(undefined, '{uploader}/{title} [{id}]')).toBe(true)
	})
})

describe('singleTemplateMeta', () => {
	it('carries the fields a directory segment can be named after', () => {
		const meta = singleTemplateMeta({wizardTitle: 'Clip', wizardVideoId: 'v1', wizardUploader: 'Blender Foundation', wizardUploadDate: '20260803'})
		expect(meta).toEqual({title: 'Clip', id: 'v1', uploader: 'Blender Foundation', uploadDate: '20260803'})
	})

	it('omits blanks so an absent uploader collapses its folder instead of emptying it', () => {
		const meta = singleTemplateMeta({wizardTitle: 'Clip', wizardVideoId: '', wizardUploader: '', wizardUploadDate: ''})
		expect(meta.uploader).toBeUndefined()
		expect(meta.uploadDate).toBeUndefined()
	})
})

describe('playlistEntryTemplateMeta', () => {
	it('combines per-entry fields with the playlist the entry came from', () => {
		expect(playlistEntryTemplateMeta(ENTRY, 'Nature Docs', 'PL1')).toEqual({title: 'First', id: 'e1', uploader: 'Blender Foundation', uploadDate: '20260803', playlistTitle: 'Nature Docs', playlistId: 'PL1', playlistIndex: 7})
	})

	it('omits uploader when the flat probe did not supply one', () => {
		const sparse: PlaylistEntry = {...ENTRY, uploader: undefined, uploadDate: undefined}
		const meta = playlistEntryTemplateMeta(sparse, 'Nature Docs', 'PL1')
		expect(meta.uploader).toBeUndefined()
		expect(meta.uploadDate).toBeUndefined()
	})

	it('uses the entry playlist index so folders and filenames agree on numbering', () => {
		expect(playlistEntryTemplateMeta(ENTRY, 'Nature Docs', 'PL1').playlistIndex).toBe(7)
	})
})
