import {describe, expect, it} from 'vitest'
import {bindFilenameTemplate, compileFilenameTemplate} from '@shared/filenameTemplate.js'
import {canMatchDownloadsById, canScanPlaylistFolder, canWriteM3u, playlistEntryTemplateMeta, singleTemplateMeta, templateOwnsDirs} from '@renderer/store/wizard/outputTemplates.js'
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

	it('leaves title undefined for a placeholder entry so {title} late-binds to yt-dlp', () => {
		const placeholder: PlaylistEntry = {...ENTRY, title: 'Untitled · #1', titleIsPlaceholder: true}
		const meta = playlistEntryTemplateMeta(placeholder, 'Nature Docs', 'PL1')
		expect(meta.title).toBeUndefined()
	})

	it('keeps a real title even when it looks untitled-adjacent', () => {
		const meta = playlistEntryTemplateMeta(ENTRY, 'Nature Docs', 'PL1')
		expect(meta.title).toBe('First')
	})

	it('late-binds {title} through bind + compile for a placeholder entry', () => {
		// Mirrors the real Bilibili flat entry: no id, so both {title} and {id}
		// stay late-bound for yt-dlp to resolve at download time.
		const placeholder: PlaylistEntry = {...ENTRY, title: 'Untitled · #1', titleIsPlaceholder: true, videoId: null}
		const meta = playlistEntryTemplateMeta(placeholder, 'Nature Docs', 'PL1')
		const bound = bindFilenameTemplate('{title} [{id}]', meta, {outputDir: '/tmp', platform: 'linux'})
		expect(bound.ok).toBe(true)
		if (!bound.ok) return
		expect(bound.template).toContain('{title}')
		const compiled = compileFilenameTemplate(bound.template)
		expect(compiled).toEqual({ok: true, template: '%(title).120B [%(id)s].%(ext)s'})
	})
})

describe('canScanPlaylistFolder', () => {
	it('allows the scan for a flat template with {id}', () => {
		expect(canScanPlaylistFolder(undefined, '{title} [{id}]')).toBe(true)
	})

	it('allows the scan when directories are playlist-level, since every entry shares them', () => {
		expect(canScanPlaylistFolder(undefined, '{playlist_title}/{title} [{id}]')).toBe(true)
	})

	it('blocks the scan when directories depend on per-entry fields', () => {
		// Scanning one folder here reports nothing downloaded and invites the user
		// to re-download an entire playlist they already have.
		expect(canScanPlaylistFolder(undefined, '{uploader}/{title} [{id}]')).toBe(false)
		expect(canScanPlaylistFolder(undefined, '{date}/{title} [{id}]')).toBe(false)
	})

	it('still blocks the scan when {id} is missing, as before', () => {
		expect(canScanPlaylistFolder(undefined, '{title}')).toBe(false)
	})
})
