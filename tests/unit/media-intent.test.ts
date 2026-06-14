import {describe, expect, it} from 'vitest'
import {mediaIntentSpec} from '@shared/mediaIntent.js'
import type {MediaIntent} from '@shared/schemas.js'

const BEST_VIDEO: MediaIntent = {kind: 'video-audio', codec: 'best', tiers: ['best'], audio: {format: 'best'}}
const BEST_AUDIO: MediaIntent = {kind: 'audio-only', audio: {format: 'best'}}

describe('mediaIntentSpec native audio preference', () => {
	it('compatible best-native selectors avoid Dolby and DRC before falling back', () => {
		const spec = mediaIntentSpec(BEST_VIDEO, 'compatible')

		expect(spec.formatSelector).toContain("bestaudio[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']")
		expect(spec.formatSelector).toContain("[format_note!~=?'(?i)\\bdrc\\b']")
		expect(spec.formatSelector?.endsWith('/bestvideo*+bestaudio/best')).toBe(true)
	})

	it('surround best-native selectors prefer ec-3 before ac-3', () => {
		const spec = mediaIntentSpec(BEST_AUDIO, 'surround')

		expect(spec.formatSelector?.split('/').slice(0, 2)).toEqual(["bestaudio[acodec~=?'^(?:e-?ac-?3|ec-3)$'][format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']", "bestaudio[acodec~=?'^(?:ac-?3)$'][format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"])
	})

	it('explicit m4a/aac selectors stay unchanged', () => {
		const spec = mediaIntentSpec({kind: 'video-audio', codec: 'best', tiers: ['best'], audio: {format: 'm4a'}}, 'surround')

		expect(spec.formatSelector).toBe('bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best')
		expect(spec.formatSort).toBe('acodec:m4a')
	})
})
