import {describe, expect, it} from 'vitest'
import {assessQualityLimit, availableMaxHeight, isInfoJsonWriteLine, parseSelectedFormats, requiresSignIn, sabrSkippedClient, selectedMaxHeight} from '@main/services/download/formatLimitSignals.js'
import type {MediaIntent, PlaylistVideoTier} from '@shared/schemas.js'

const SABR_WARNING = 'WARNING: [youtube] z1NNgSu8hTI: Some web_embedded client https formats have been skipped as they are missing a URL. YouTube may have enabled the SABR-only streaming experiment for your account. See  https://github.com/yt-dlp/yt-dlp/issues/12482  for more details'

const video = (tiers: PlaylistVideoTier[]): MediaIntent => ({kind: 'video-audio', codec: 'best', tiers, audio: {format: 'best'}})

const AUDIO_ONLY: MediaIntent = {kind: 'audio-only', audio: {format: 'best'}}

describe('sabrSkippedClient', () => {
	it('names the client from the yt-dlp warning and ignores other lines', () => {
		expect(sabrSkippedClient(SABR_WARNING)).toBe('web_embedded')
		expect(sabrSkippedClient('[info] z1NNgSu8hTI: Downloading 1 format(s): 18')).toBeNull()
	})
})

describe('parseSelectedFormats / selectedMaxHeight', () => {
	it('reads merged and single-file selections', () => {
		const merged = parseSelectedFormats(
			JSON.stringify({
				format_id: '398+251',
				requested_formats: [
					{format_id: '398', height: 720},
					{format_id: '251', height: null}
				]
			})
		)
		expect(selectedMaxHeight(merged)).toBe(720)
		expect(selectedMaxHeight(parseSelectedFormats(JSON.stringify({format_id: '18', height: 360})))).toBe(360)
	})

	it('returns null for unreadable info-json or selections without a height', () => {
		expect(parseSelectedFormats('{"format_id": "1')).toBeNull()
		expect(selectedMaxHeight(null)).toBeNull()
		expect(selectedMaxHeight(parseSelectedFormats(JSON.stringify({format_id: '251', height: null})))).toBeNull()
	})
})

describe('assessQualityLimit', () => {
	it('flags a SABR-limited download that landed below the profile cap', () => {
		expect(assessQualityLimit({sabrSkipped: true, selectedHeight: 360, intent: video(['720'])})).toEqual({height: 360})
	})

	it('does not flag without the SABR warning — the video may simply be low resolution', () => {
		expect(assessQualityLimit({sabrSkipped: false, selectedHeight: 360, intent: video(['720'])})).toBeNull()
	})

	it('does not flag a download that reached the cap', () => {
		expect(assessQualityLimit({sabrSkipped: true, selectedHeight: 480, intent: video(['480'])})).toBeNull()
	})

	it('treats "best" and caps above 720p as expecting at least 720p', () => {
		expect(assessQualityLimit({sabrSkipped: true, selectedHeight: 1080, intent: video(['best'])})).toBeNull()
		expect(assessQualityLimit({sabrSkipped: true, selectedHeight: 360, intent: video(['best'])})).toEqual({height: 360})
		expect(assessQualityLimit({sabrSkipped: true, selectedHeight: 720, intent: video(['2160'])})).toBeNull()
	})

	it('never flags audio-only intents or unknown heights', () => {
		expect(assessQualityLimit({sabrSkipped: true, selectedHeight: null, intent: video(['720'])})).toBeNull()
		expect(assessQualityLimit({sabrSkipped: true, selectedHeight: 360, intent: AUDIO_ONLY})).toBeNull()
	})
})

describe('isInfoJsonWriteLine', () => {
	it('matches only the metadata write line', () => {
		expect(isInfoJsonWriteLine('[info] Writing video metadata as JSON to: /tmp/x/_arroxy.info.json')).toBe(true)
		expect(isInfoJsonWriteLine('[download] Destination: /tmp/x/video.mp4')).toBe(false)
	})
})

describe('requiresSignIn', () => {
	it('flags age-restricted and account-only videos', () => {
		expect(requiresSignIn(JSON.stringify({age_limit: 18}))).toBe(true)
		expect(requiresSignIn(JSON.stringify({availability: 'subscriber_only'}))).toBe(true)
		expect(requiresSignIn(JSON.stringify({availability: 'needs_auth', age_limit: 0}))).toBe(true)
	})

	it('treats public, unlisted, unknown, and unreadable info-json as not requiring sign-in', () => {
		expect(requiresSignIn(JSON.stringify({age_limit: 0, availability: 'public'}))).toBe(false)
		expect(requiresSignIn(JSON.stringify({availability: 'unlisted'}))).toBe(false)
		expect(requiresSignIn(JSON.stringify({}))).toBe(false)
		expect(requiresSignIn('not json')).toBe(false)
	})
})

describe('availableMaxHeight', () => {
	it('returns the tallest video format, ignoring audio-only entries', () => {
		const info = JSON.stringify({
			formats: [
				{format_id: '18', height: 360, vcodec: 'avc1'},
				{format_id: '140', height: null, vcodec: 'none'},
				{format_id: '135', height: 480, vcodec: 'avc1'}
			]
		})
		expect(availableMaxHeight(info)).toBe(480)
	})

	it('returns null without usable formats', () => {
		expect(availableMaxHeight(JSON.stringify({formats: [{height: null, vcodec: 'none'}]}))).toBeNull()
		expect(availableMaxHeight(JSON.stringify({}))).toBeNull()
		expect(availableMaxHeight('nope')).toBeNull()
	})
})
