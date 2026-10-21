import {afterEach, describe, expect, it} from 'vite-plus/test'
import type {FormatOption} from '@shared/types.js'
import {resolveAudioLabel} from '@renderer/store/helpers.js'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import {i18next} from '@shared/i18n/index.js'

const label = (selection: Parameters<typeof resolveAudioLabel>[0], formats: FormatOption[]): string => resolveAudioLabel(selection, formats, selectionSourceFromOptions(formats))

function audio(formatId: string, audioCodec: string, abr: number): FormatOption {
	return {formatId, label: formatId, ext: audioCodec === 'opus' ? 'webm' : 'm4a', resolution: 'audio only', isAudioOnly: true, isVideoOnly: false, audioCodec, abr}
}

const YOUTUBE = [audio('251', 'opus', 129.6), audio('140', 'mp4a.40.2', 129.5)]

// yt-dlp copies a source already in the target codec and ignores the bitrate.
describe('resolveAudioLabel — conversions', () => {
	it('names the source bitrate of a copy, not the chosen one', () => {
		expect(label({kind: 'convert-lossy', target: 'm4a', bitrateKbps: 320}, YOUTUBE)).toBe('M4A 130 kbps, no re-encode')
		expect(label({kind: 'convert-lossy', target: 'opus', bitrateKbps: 128}, YOUTUBE)).toBe('OPUS 130 kbps, no re-encode')
	})

	it('names the chosen bitrate of a re-encode', () => {
		expect(label({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 320}, YOUTUBE)).toBe('MP3 320 kbps')
		expect(label({kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192, sourceFormatId: '251'}, YOUTUBE)).toBe('M4A 192 kbps')
	})

	// A profile's conversion names no stream: yt-dlp takes the default track.
	it("names the default track's bitrate, not a dub's", () => {
		const formats = [audio('251-de', 'opus', 156), {...audio('251-en', 'opus', 113), isDefaultAudio: true}]
		expect(label({kind: 'convert-lossy', target: 'opus', bitrateKbps: 192}, formats)).toBe('OPUS 113 kbps, no re-encode')
	})

	it('says no re-encode without a bitrate when the source names none', () => {
		expect(label({kind: 'convert-lossy', target: 'opus', bitrateKbps: 192}, [{...audio('251', 'opus', 0), abr: undefined}])).toBe('OPUS, no re-encode')
	})

	it('keeps the chosen bitrate when the probe lists no audio stream', () => {
		expect(label({kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192}, [])).toBe('M4A 192 kbps')
	})
})

// The review row and the queue's format column show the picked stream's label.
describe('resolveAudioLabel — native streams', () => {
	afterEach(async () => {
		await i18next.changeLanguage('en')
	})

	const track = (formatId: string, language: string, note: string): FormatOption => ({formatId, label: `${note} · webm · Opus · 130 kbps`, ext: 'webm', resolution: 'audio only', isAudioOnly: true, isVideoOnly: false, audioCodec: 'opus', abr: 130, audioLanguage: language, audioTrackLabel: note})
	const TRACKS = [track('251-0', 'en', 'English original (default)'), track('251-1', 'de', 'German')]

	it('names the track in the UI language, as the language picker does', async () => {
		await i18next.changeLanguage('ru')

		expect(label({kind: 'native', formatId: '251-0'}, TRACKS)).toBe('Английский · webm · Opus · 130 kbps')
	})

	it('says the track is the original, as the language picker does', async () => {
		await i18next.changeLanguage('ru')
		const original = {...TRACKS[0], isOriginalAudio: true}

		expect(label({kind: 'native', formatId: '251-0'}, [original, TRACKS[1]])).toBe(`Английский · ${i18next.t('wizard.formats.marker.original')} · webm · Opus · 130 kbps`)
	})

	it("doesn't repeat the original in a note kept as it is", () => {
		const unnamed = {...track('251-9', 'qaa', 'Commentary original (default)'), isOriginalAudio: true}

		expect(label({kind: 'native', formatId: '251-9'}, [unnamed, TRACKS[1]])).toBe('Commentary original (default) · webm · Opus · 130 kbps')
	})

	it('still says it of a kept note that does not', () => {
		// yt-dlp names the track by its code when the note leads with a grade ("high, original").
		const bare = {...track('251-8', 'qaa', 'qaa'), isOriginalAudio: true}

		expect(label({kind: 'native', formatId: '251-8'}, [bare, TRACKS[1]])).toBe('qaa · Original · webm · Opus · 130 kbps')
	})

	it('names the track among the listed streams, as the picker does, not their hidden copies', async () => {
		await i18next.changeLanguage('ru')
		// YouTube's HLS copy has no codec and its own note for the same language.
		const hlsCopy: FormatOption = {...track('233', 'en-US', 'American English - original (original)'), audioCodec: undefined}
		const formats = [track('251-2', 'en-US', 'English (US) original (default)'), hlsCopy, track('251-1', 'de', 'German')]

		expect(label({kind: 'native', formatId: '251-2'}, formats)).toBe('Американский английский · webm · Opus · 130 kbps')
	})

	it("keeps a label that doesn't start with the track as it is", async () => {
		await i18next.changeLanguage('ru')

		expect(label({kind: 'native', formatId: '251-0'}, [{...TRACKS[0], label: 'webm · Opus'}, TRACKS[1]])).toBe('webm · Opus')
	})
})
