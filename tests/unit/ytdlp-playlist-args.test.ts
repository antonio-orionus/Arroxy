// @vitest-environment node
// Smoke test matrix: every PlaylistSelection combination → expected yt-dlp args.
//
// Pipeline under test:
//   PlaylistSelection
//   → mediaIntentSpec → MediaIntentSpec
//   → WorkflowInput (as VideoPhase builds it)
//   → planWorkflow → string[]
//
// Assertions check the flags that matter for format correctness.
// Pacing is omitted (undefined) — covered by pacing-specific tests.

import {describe, expect, it} from 'vitest'
import {isAudioConvertTargetLossy} from '@shared/audioTargets.js'
import {mediaIntentSpec, playlistSelectionToMediaIntent} from '@shared/mediaIntent.js'
import {planWorkflow, type AudioConvert as BridgeAudioConvert, type WorkflowInput} from 'yt-dlp-bridge'
import type {AudioConvert, PlaylistSelection} from '@shared/schemas.js'
import {COMPATIBLE_AUDIO_ONLY_SELECTOR, COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR} from '../shared/nativeAudioSelectors.js'

const URL = 'https://www.youtube.com/watch?v=test'
const OUTPUT_DIR = '/tmp/out'
const TEMPLATE = '%(title).200B [%(id)s].%(ext)s'

// Build a minimal media WorkflowInput from a PlaylistSelection, mirroring VideoPhase logic.
function reqFor(sel: PlaylistSelection): WorkflowInput {
	const spec = mediaIntentSpec(playlistSelectionToMediaIntent(sel))
	return {kind: 'media', url: URL, output: {directory: OUTPUT_DIR, template: TEMPLATE}, selection: {formatSelector: spec.formatSelector, formatSort: spec.formatSort, mergeOutputFormat: spec.mergeOutputFormat}, ...(spec.audioConvert ? {audio: {convert: bridgeAudioConvert(spec.audioConvert)}} : {})}
}

function bridgeAudioConvert(input: AudioConvert): BridgeAudioConvert {
	return {...input, lossy: isAudioConvertTargetLossy(input.target)}
}

// Helper: extract yt-dlp args as a flat string for easy substring assertions.
function argsFor(sel: PlaylistSelection): string[] {
	return planWorkflow(reqFor(sel)).args
}

describe('Video · Best codec', () => {
	it('tier=best → bestvideo* selector, no -S, no --merge-output-format', () => {
		const args = argsFor({kind: 'video', tier: 'best', codec: 'best'})
		expect(args).toContain('-f')
		const fIdx = args.indexOf('-f')
		expect(args[fIdx + 1]).toBe(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR)
		expect(args).not.toContain('-S')
		expect(args).not.toContain('--merge-output-format')
	})

	it.each(['2160', '1440', '1080', '720', '480', '360'] as const)('tier=%s → stable -f selector + resolution sort', tier => {
		const args = argsFor({kind: 'video', tier, codec: 'best'})
		const fIdx = args.indexOf('-f')
		expect(args[fIdx + 1]).toBe(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR)
		expect(args[fIdx + 1]).not.toContain('height<=')
		const sIdx = args.indexOf('-S')
		expect(sIdx).toBeGreaterThan(-1)
		expect(args[sIdx + 1]).toBe(`res:${tier},fps`)
		expect(args).not.toContain('--merge-output-format')
	})
})

describe('Video · MP4 codec', () => {
	it.each(['1080', '720', '480', '360'] as const)('tier=%s → -f with no-fail tail, -S compatibility-first sort, --merge-output-format mp4', tier => {
		const args = argsFor({kind: 'video', tier, codec: 'mp4'})
		const fIdx = args.indexOf('-f')
		expect(fIdx).toBeGreaterThan(-1)
		const fVal = args[fIdx + 1]
		expect(fVal).not.toContain('height<=')
		// Avoid bv*: YouTube's combined 360p MP4 can otherwise beat 1080p
		// video-only H.264 when compatibility fields sort first.
		expect(fVal).not.toContain('bv*')
		expect(fVal).toBe('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best')
		// MP4 profiles prioritize compatibility first; the selected tier guides
		// resolution within the compatible candidates.
		const sIdx = args.indexOf('-S')
		expect(sIdx).toBeGreaterThan(-1)
		expect(args[sIdx + 1]).toBe(`vcodec:h264,ext:mp4,res:${tier},fps,acodec:m4a`)
		// container override
		const mIdx = args.indexOf('--merge-output-format')
		expect(mIdx).toBeGreaterThan(-1)
		expect(args[mIdx + 1]).toBe('mp4')
	})

	it('forcesMkv (video+embed with subs) → embed merge wins over playlist mp4 merge', () => {
		const spec = mediaIntentSpec(playlistSelectionToMediaIntent({kind: 'video', tier: '1080', codec: 'mp4'}))
		const req: WorkflowInput = {kind: 'media', url: URL, output: {directory: OUTPUT_DIR, template: TEMPLATE}, selection: {formatSelector: spec.formatSelector, formatSort: spec.formatSort, mergeOutputFormat: spec.mergeOutputFormat}, subtitles: {embed: true, languages: ['en']}}
		const args = planWorkflow(req).args
		// forcesMkv = true (video+embed with subtitles) — mkv wins
		const mIdx = args.indexOf('--merge-output-format')
		expect(mIdx).toBeGreaterThan(-1)
		// The embed merge-output-format (mkv) is emitted by the forcesMkv path, not the playlist mp4 path
		// Both --merge-output-format flags should not appear; mkv should be the only one
		expect(args[mIdx + 1]).toBe('mkv')
		// 'mp4' should NOT appear as a merge-output-format value right after any --merge-output-format
		const all = args.join(' ')
		expect(all).not.toMatch(/--merge-output-format mp4/)
	})
})

describe('Audio · Best (no convert)', () => {
	it('format=best → -f bestaudio/best, no -x, no --audio-format', () => {
		const args = argsFor({kind: 'audio', format: 'best'})
		const fIdx = args.indexOf('-f')
		expect(fIdx).toBeGreaterThan(-1)
		expect(args[fIdx + 1]).toBe(COMPATIBLE_AUDIO_ONLY_SELECTOR)
		expect(args).not.toContain('-x')
		expect(args).not.toContain('--audio-format')
	})
})

describe('Audio · Lossy convert', () => {
	it.each([
		['mp3', 128],
		['mp3', 192],
		['mp3', 256],
		['mp3', 320],
		['m4a', 128],
		['m4a', 192],
		['m4a', 256],
		['m4a', 320],
		['opus', 128],
		['opus', 192],
		['opus', 256],
		['opus', 320]
	] as const)('format=%s bitrate=%d → -x --audio-format <fmt> --audio-quality <kbps>K', (format, kbps) => {
		const args = argsFor({kind: 'audio', format, bitrateKbps: kbps})
		// Audio convert path: -f bestaudio/best -x --audio-format <fmt> --audio-quality <kbps>K
		expect(args).toContain('-f')
		const fIdx = args.indexOf('-f')
		expect(args[fIdx + 1]).toBe('bestaudio/best')
		expect(args).toContain('-x')
		expect(args).toContain('--audio-format')
		const afIdx = args.indexOf('--audio-format')
		expect(args[afIdx + 1]).toBe(format)
		expect(args).toContain('--audio-quality')
		const aqIdx = args.indexOf('--audio-quality')
		expect(args[aqIdx + 1]).toBe(`${kbps}K`)
		// No format selector or sort flags
		expect(args).not.toContain('-S')
		expect(args).not.toContain('--merge-output-format')
	})

	it('format=mp3 without bitrateKbps defaults to 192K', () => {
		// bitrateKbps omitted → mediaIntentSpec defaults to DEFAULT_AUDIO_BITRATE (192)
		const args = argsFor({kind: 'audio', format: 'mp3'})
		const aqIdx = args.indexOf('--audio-quality')
		expect(args[aqIdx + 1]).toBe('192K')
	})
})
