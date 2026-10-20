import {describe, expect, it} from 'vite-plus/test'
import {resolveOutputContainer} from '@renderer/store/wizard/resolveContainer.js'
import type {AudioSelection, SubtitleMode, WizardMediaKind} from '@shared/schemas.js'
import type {FormatOption} from '@shared/types.js'
import {probeSourceResult} from '@renderer/dev/probeSources/index.js'

function fmt(formatId: string, ext: string, isVideoOnly = false, isAudioOnly = false): FormatOption {
	return {formatId, ext, label: formatId, resolution: '1080p', isVideoOnly, isAudioOnly}
}

const WEBM_VIDEO = fmt('137', 'webm', true, false)
const WEBM_AUDIO = fmt('251', 'webm', false, true)
const MP4_VIDEO = fmt('298', 'mp4', true, false)
const M4A_AUDIO = fmt('140', 'm4a', false, true)
const OGG_AUDIO = fmt('172', 'ogg', false, true)
const FORMATS = [WEBM_VIDEO, WEBM_AUDIO, MP4_VIDEO, M4A_AUDIO, OGG_AUDIO]

const NONE: AudioSelection = {kind: 'none'}
const sidecar: SubtitleMode = 'sidecar'
const embed: SubtitleMode = 'embed'

describe('resolveOutputContainer', () => {
	describe('subtitle-only preset', () => {
		it('returns "subtitle-only" regardless of audio/video selection', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('137', audio, sidecar, FORMATS, 'subtitles')).toBe('subtitle-only')
		})
	})

	describe('audio convert', () => {
		it('convert-lossless → wav', () => {
			const audio: AudioSelection = {kind: 'convert-lossless', target: 'wav'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, 'video')).toBe('wav')
		})

		it('convert-lossy mp3 → mp3', () => {
			const audio: AudioSelection = {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, 'video')).toBe('mp3')
		})

		it('convert-lossy m4a → m4a', () => {
			const audio: AudioSelection = {kind: 'convert-lossy', target: 'm4a', bitrateKbps: 256}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, 'video')).toBe('m4a')
		})

		it('convert-lossy opus → opus', () => {
			const audio: AudioSelection = {kind: 'convert-lossy', target: 'opus', bitrateKbps: 128}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, 'video')).toBe('opus')
		})
	})

	// Audio mode extracts (`-x --audio-format best`): a WebM's Opus lands as .opus.
	describe('audio mode', () => {
		const opus = {...WEBM_AUDIO, audioCodec: 'opus'}
		const aac = {...M4A_AUDIO, audioCodec: 'mp4a.40.2'}
		const combined = {...fmt('18', 'mp4'), audioCodec: 'mp4a.40.2'}

		it("a native pick lands in its codec's own container", () => {
			expect(resolveOutputContainer('', {kind: 'native', formatId: '251'}, sidecar, [opus, aac], 'audio')).toBe('opus')
			expect(resolveOutputContainer('', {kind: 'native', formatId: '140'}, sidecar, [opus, aac], 'audio')).toBe('m4a')
		})

		// A real site with only combined files, through the app's own mapping.
		it('keep as-is names the container from a real probe', () => {
			const {formats} = probeSourceResult('dailymotion')
			const combined = formats.find(f => !f.isAudioOnly && !f.isVideoOnly)
			expect(combined?.audioCodec).toMatch(/^mp4a/)
			expect(resolveOutputContainer('', {kind: 'extract', formatId: combined?.formatId}, sidecar, formats, 'audio')).toBe('m4a')
		})

		it("keep as-is lands in the best combined file's audio container", () => {
			expect(resolveOutputContainer('', {kind: 'extract'}, sidecar, [combined], 'audio')).toBe('m4a')
			expect(resolveOutputContainer('', {kind: 'extract'}, sidecar, [fmt('18', 'mp4')], 'audio')).toBe('unknown')
			expect(resolveOutputContainer('', {kind: 'extract', formatId: '43'}, sidecar, [combined, {...fmt('43', 'webm'), audioCodec: 'vorbis'}], 'audio')).toBe('ogg')
		})
	})

	describe('audio-only (no video track)', () => {
		it('native audio → format ext', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, 'video')).toBe('webm')
		})

		it('native audio m4a → m4a', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '140'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, 'video')).toBe('m4a')
		})

		it('unknown audio formatId → "unknown"', () => {
			const audio: AudioSelection = {kind: 'native', formatId: 'nonexistent'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, 'video')).toBe('unknown')
		})

		it('no video no audio → "unknown"', () => {
			expect(resolveOutputContainer('', NONE, sidecar, FORMATS, 'video')).toBe('unknown')
		})
	})

	describe('video present', () => {
		it('subtitle embed forces mkv', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('137', audio, embed, FORMATS, 'video')).toBe('mkv')
		})

		it('video + matching webm audio → webm', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('137', audio, sidecar, FORMATS, 'video')).toBe('webm')
		})

		it('webm video + no audio → webm', () => {
			expect(resolveOutputContainer('137', NONE, sidecar, FORMATS, 'video')).toBe('webm')
		})

		// yt-dlp swaps a WebM merge to MKV when it has to embed a thumbnail; a
		// single WebM stream is never merged, so it stays WebM and cannot hold one.
		it('webm merge that embeds a thumbnail → mkv', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('137', audio, sidecar, FORMATS, 'video', true)).toBe('mkv')
		})

		it('single webm stream that embeds a thumbnail stays webm', () => {
			expect(resolveOutputContainer('137', NONE, sidecar, FORMATS, 'video', true)).toBe('webm')
			expect(resolveOutputContainer('', {kind: 'native', formatId: '251'}, sidecar, FORMATS, 'video', true)).toBe('webm')
		})

		it('mp4 video + m4a audio → mp4', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '140'}
			expect(resolveOutputContainer('298', audio, sidecar, FORMATS, 'video')).toBe('mp4')
		})

		it('mp4 video + no audio → mp4', () => {
			expect(resolveOutputContainer('298', NONE, sidecar, FORMATS, 'video')).toBe('mp4')
		})

		it('mp4 video + mp4 audio → mp4', () => {
			const mp4Audio = fmt('399', 'mp4', false, true)
			const audio: AudioSelection = {kind: 'native', formatId: '399'}
			expect(resolveOutputContainer('298', audio, sidecar, [MP4_VIDEO, mp4Audio], 'video')).toBe('mp4')
		})

		it('mp4 video + ogg audio (mixed containers) → mkv', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '172'}
			expect(resolveOutputContainer('298', audio, sidecar, FORMATS, 'video')).toBe('mkv')
		})

		it('webm video + m4a audio (mixed containers) → mkv', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '140'}
			expect(resolveOutputContainer('137', audio, sidecar, FORMATS, 'video')).toBe('mkv')
		})

		it('unknown video formatId → "unknown"', () => {
			expect(resolveOutputContainer('nonexistent', NONE, sidecar, FORMATS, 'video')).toBe('unknown')
		})
	})

	describe('preset does not override non-subtitle-only', () => {
		it('Video follows normal rules', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			const result = resolveOutputContainer('137', audio, sidecar, FORMATS, 'video')
			expect(result).toBe('webm')
		})

		it('every media kind except Subtitles follows normal rules', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			const kinds: WizardMediaKind[] = ['video', 'audio']
			for (const kind of kinds) {
				expect(resolveOutputContainer('137', audio, sidecar, FORMATS, kind)).toBe('webm')
			}
		})
	})

	describe('chosen file type', () => {
		const VP9_WEBM: FormatOption = {...fmt('248', 'webm', true, false), videoCodec: 'vp9'}
		const OPUS: FormatOption = {...fmt('251', 'webm', false, true), audioCodec: 'opus'}
		const H264_MP4: FormatOption = {...fmt('137', 'mp4', true, false), videoCodec: 'avc1.640028'}
		const OPUS_PICK: AudioSelection = {kind: 'native', formatId: '251'}
		const formats = [VP9_WEBM, OPUS, H264_MP4]

		it('a chosen MP4 or MKV is the container whatever the streams are', () => {
			expect(resolveOutputContainer('248', OPUS_PICK, sidecar, formats, 'video', false, 'mp4')).toBe('mp4')
			expect(resolveOutputContainer('137', OPUS_PICK, sidecar, formats, 'video', false, 'mkv')).toBe('mkv')
		})

		it('a chosen WebM is kept only when the streams fit it, else MKV', () => {
			expect(resolveOutputContainer('248', OPUS_PICK, sidecar, formats, 'video', false, 'webm')).toBe('webm')
			expect(resolveOutputContainer('137', OPUS_PICK, sidecar, formats, 'video', false, 'webm')).toBe('mkv')
		})

		it('Auto still lets the streams decide', () => {
			expect(resolveOutputContainer('248', OPUS_PICK, sidecar, formats, 'video', false, 'auto')).toBe('webm')
		})

		it('embedded subtitles still force MKV over a chosen file type', () => {
			expect(resolveOutputContainer('248', OPUS_PICK, embed, formats, 'video', false, 'mp4')).toBe('mkv')
		})

		it('a file type is ignored for audio and subtitles downloads', () => {
			expect(resolveOutputContainer('', {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, sidecar, formats, 'audio', false, 'mkv')).toBe('mp3')
			expect(resolveOutputContainer('', NONE, sidecar, formats, 'subtitles', false, 'mkv')).toBe('subtitle-only')
		})
	})
})
