import {describe, expect, it} from 'vitest'
import {sanitizeJobOptions} from '@shared/sanitizeJobOptions.js'
import type {SanitizeInput} from '@shared/sanitizeJobOptions.js'

function makeInput(overrides: Partial<SanitizeInput> = {}): SanitizeInput {
	return {isSubtitleOnly: false, hasVideoTrack: true, resolvedOutputContainer: 'mp4', subtitleMode: 'sidecar', subtitleLanguages: [], embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}, sponsorBlockMode: 'off', ...overrides}
}

describe('sanitizeJobOptions', () => {
	describe('happy path — no conflicts', () => {
		it('returns input unchanged when nothing conflicts', () => {
			const result = sanitizeJobOptions(makeInput())
			expect(result.conflicts).toHaveLength(0)
			expect(result.overrides.embed).toEqual({chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false})
			expect(result.overrides.subtitleMode).toBe('sidecar')
			expect(result.overrides.sponsorBlockMode).toBe('off')
		})

		it('thumbnail embed on mp4 → no conflict', () => {
			const result = sanitizeJobOptions(makeInput({embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toHaveLength(0)
			expect(result.overrides.embed.thumbnail).toBe(true)
		})

		it('thumbnail embed on mkv → no conflict', () => {
			const result = sanitizeJobOptions(makeInput({resolvedOutputContainer: 'mkv', embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toHaveLength(0)
		})

		it('thumbnail embed on mp3 → no conflict', () => {
			const result = sanitizeJobOptions(makeInput({resolvedOutputContainer: 'mp3', embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toHaveLength(0)
		})
	})

	describe('thumbnailEmbedNotSupported', () => {
		it('thumbnail=true on webm container → conflict, thumbnail cleared', () => {
			const result = sanitizeJobOptions(makeInput({resolvedOutputContainer: 'webm', embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toContainEqual({code: 'thumbnailEmbedNotSupported'})
			expect(result.overrides.embed.thumbnail).toBe(false)
		})

		it('thumbnail=true on opus container → conflict', () => {
			// opus IS in the supported set
			const result = sanitizeJobOptions(makeInput({resolvedOutputContainer: 'opus', embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toHaveLength(0)
		})

		it('thumbnail=false on unsupported container → no conflict', () => {
			const result = sanitizeJobOptions(makeInput({resolvedOutputContainer: 'webm'}))
			expect(result.conflicts).toHaveLength(0)
		})
	})

	describe('subtitleEmbedAudioOnly', () => {
		it('audio-only + subtitleMode embed + languages set → conflict, mode→sidecar', () => {
			const result = sanitizeJobOptions(makeInput({hasVideoTrack: false, subtitleMode: 'embed', subtitleLanguages: ['en']}))
			expect(result.conflicts).toContainEqual({code: 'subtitleEmbedAudioOnly'})
			expect(result.overrides.subtitleMode).toBe('sidecar')
		})

		it('audio-only + subtitleMode embed + no languages → no conflict', () => {
			const result = sanitizeJobOptions(makeInput({hasVideoTrack: false, subtitleMode: 'embed', subtitleLanguages: []}))
			expect(result.conflicts).toHaveLength(0)
		})

		it('video + subtitleMode embed + languages → no conflict', () => {
			const result = sanitizeJobOptions(makeInput({hasVideoTrack: true, subtitleMode: 'embed', subtitleLanguages: ['en']}))
			expect(result.conflicts).toHaveLength(0)
		})
	})

	describe('subtitle-only job conflicts', () => {
		it('subtitleEmbedNoMedia: isSubtitleOnly + subtitleMode embed → conflict, mode→sidecar', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, subtitleMode: 'embed'}))
			expect(result.conflicts).toContainEqual({code: 'subtitleEmbedNoMedia'})
			expect(result.overrides.subtitleMode).toBe('sidecar')
		})

		it('isSubtitleOnly + subtitleMode sidecar → no subtitleEmbed conflict', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, subtitleMode: 'sidecar'}))
			const codes = result.conflicts.map(c => c.code)
			expect(codes).not.toContain('subtitleEmbedNoMedia')
		})

		it('embedOptionsNoMedia: isSubtitleOnly + thumbnail=true → conflict, thumbnail cleared', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toContainEqual({code: 'embedOptionsNoMedia'})
			expect(result.overrides.embed.thumbnail).toBe(false)
		})

		it('embedOptionsNoMedia: isSubtitleOnly + chapters=true → conflict, chapters cleared', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, embed: {chapters: true, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toContainEqual({code: 'embedOptionsNoMedia'})
			expect(result.overrides.embed.chapters).toBe(false)
		})

		it('embedOptionsNoMedia: isSubtitleOnly + metadata=true → conflict, metadata cleared', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, embed: {chapters: false, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false}}))
			expect(result.conflicts).toContainEqual({code: 'embedOptionsNoMedia'})
			expect(result.overrides.embed.metadata).toBe(false)
		})

		it('embedOptionsNoMedia: isSubtitleOnly + all embeds false → no conflict', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true}))
			const codes = result.conflicts.map(c => c.code)
			expect(codes).not.toContain('embedOptionsNoMedia')
		})

		it('sponsorBlockNoMedia: isSubtitleOnly + sponsorBlockMode remove → conflict, mode→off', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, sponsorBlockMode: 'remove'}))
			expect(result.conflicts).toContainEqual({code: 'sponsorBlockNoMedia'})
			expect(result.overrides.sponsorBlockMode).toBe('off')
		})

		it('isSubtitleOnly + sponsorBlockMode mark → no conflict (mark not blocked)', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, sponsorBlockMode: 'mark'}))
			const codes = result.conflicts.map(c => c.code)
			expect(codes).not.toContain('sponsorBlockNoMedia')
		})
	})

	describe('multiple conflicts', () => {
		it('subtitle-only + all embed options on + embed mode → all 3 subtitle-only conflict codes', () => {
			const result = sanitizeJobOptions(makeInput({isSubtitleOnly: true, subtitleMode: 'embed', sponsorBlockMode: 'remove', embed: {chapters: true, metadata: true, thumbnail: true, description: false, thumbnailSidecar: false}}))
			const codes = result.conflicts.map(c => c.code)
			expect(codes).toContain('embedOptionsNoMedia')
			expect(codes).toContain('sponsorBlockNoMedia')
			expect(codes).toContain('subtitleEmbedNoMedia')
			expect(result.overrides.embed.thumbnail).toBe(false)
			expect(result.overrides.embed.chapters).toBe(false)
			expect(result.overrides.embed.metadata).toBe(false)
			expect(result.overrides.subtitleMode).toBe('sidecar')
			expect(result.overrides.sponsorBlockMode).toBe('off')
		})
	})
})
