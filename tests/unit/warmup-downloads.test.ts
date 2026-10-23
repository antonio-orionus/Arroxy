import {describe, expect, it} from 'vite-plus/test'
import {addRateSample, downloadRate, EMPTY_WARMUP_DOWNLOADS, estimateSecondsLeft, summarizeSetup, trackWarmupDownloads, type WarmupDownloads} from '@renderer/store/warmupDownloads.js'
import type {DependencyId, WarmupProgressEvent} from '@shared/types.js'

const MB = 1024 * 1024
type Progress = Partial<Record<DependencyId, WarmupProgressEvent>>

function downloading(binary: DependencyId, bytesDownloaded: number, totalBytes: number): WarmupProgressEvent {
	return {binary, phase: 'downloading', bytesDownloaded, totalBytes}
}

// Feeds events one at a time, the way the store receives them.
function feed(events: Array<[number, WarmupProgressEvent]>): {downloads: WarmupDownloads; progress: Progress} {
	let downloads = EMPTY_WARMUP_DOWNLOADS
	let progress: Progress = {}
	for (const [at, event] of events) {
		progress = {...progress, [event.binary]: event}
		downloads = trackWarmupDownloads(downloads, progress, at)
	}
	return {downloads, progress}
}

describe('warmup download tracking', () => {
	// Found in review: yt-dlp done and the FFmpeg package started but not yet
	// sized read as 18 MB of 18 MB, a full bar, while FFmpeg was still connecting.
	it('keeps the bar indeterminate while a running download has no size yet', () => {
		const {downloads, progress} = feed([
			[0, downloading('yt-dlp', 18 * MB, 18 * MB)],
			[1, {binary: 'yt-dlp', phase: 'probing'}],
			[2, {binary: 'ffmpeg', phase: 'downloading'}]
		])
		expect(summarizeSetup(downloads.ledger, progress)).toMatchObject({percent: null, stage: 'connecting'})
	})

	it('shows no setup at all for a warm launch that only verifies', () => {
		const {downloads, progress} = feed([[0, {binary: 'yt-dlp', phase: 'probing'}]])
		expect(summarizeSetup(downloads.ledger, progress)).toBeNull()
	})

	// The store keeps only each binary's latest event. Without the ledger, yt-dlp's
	// bytes left the total the moment it moved on to probing, and the bar jumped
	// from 60 MB back to 42 MB.
	it('keeps a finished download in the total so the bar never jumps back', () => {
		const {downloads, progress} = feed([
			[0, downloading('yt-dlp', 9 * MB, 18 * MB)],
			[1, downloading('ffmpeg', 10 * MB, 42 * MB)],
			[2, downloading('yt-dlp', 18 * MB, 18 * MB)],
			[3, {binary: 'yt-dlp', phase: 'probing'}]
		])
		const setup = summarizeSetup(downloads.ledger, progress)
		expect(setup).toMatchObject({downloaded: 28 * MB, total: 60 * MB, stage: 'downloading', groups: ['engine', 'media'], downloading: ['media']})
	})

	// Found on the Windows VM: with the server unreachable a download sat at zero
	// bytes for a minute while the screen said "Downloading".
	it('says connecting until the first byte arrives', () => {
		const waiting = feed([[0, {binary: 'ffmpeg', phase: 'downloading'}]])
		expect(summarizeSetup(waiting.downloads.ledger, waiting.progress)?.stage).toBe('connecting')

		const started = feed([
			[0, {binary: 'ffmpeg', phase: 'downloading'}],
			[1, downloading('ffmpeg', MB, 42 * MB)]
		])
		expect(summarizeSetup(started.downloads.ledger, started.progress)?.stage).toBe('downloading')
	})

	it('reports unpacking, then checking, once every download is done', () => {
		const unpacking = feed([
			[0, downloading('ffmpeg', 42 * MB, 42 * MB)],
			[1, {binary: 'ffmpeg', phase: 'extracting'}]
		])
		expect(summarizeSetup(unpacking.downloads.ledger, unpacking.progress)?.stage).toBe('unpacking')

		const checking = feed([
			[0, downloading('ffmpeg', 42 * MB, 42 * MB)],
			[1, {binary: 'ffmpeg', phase: 'probing'}]
		])
		expect(summarizeSetup(checking.downloads.ledger, checking.progress)).toMatchObject({stage: 'checking', percent: 100})
	})

	// Retry setup starts a fresh download of the same binary. The finished
	// record from the failed attempt must not pin the new one at 100%.
	it('starts a retried download from its own bytes', () => {
		const {downloads, progress} = feed([
			[0, downloading('ffmpeg', 42 * MB, 42 * MB)],
			[1, {binary: 'ffmpeg', phase: 'failed'}],
			[2, {binary: 'ffmpeg', phase: 'starting'}],
			[3, downloading('ffmpeg', 4 * MB, 42 * MB)]
		])
		expect(summarizeSetup(downloads.ledger, progress)).toMatchObject({downloaded: 4 * MB, stage: 'downloading'})
	})

	it('samples the rate only while something downloads', () => {
		const {downloads} = feed([
			[0, downloading('ffmpeg', 0, 42 * MB)],
			[1000, downloading('ffmpeg', MB, 42 * MB)],
			[2000, {binary: 'ffmpeg', phase: 'extracting'}]
		])
		expect(downloads.samples.map(sample => sample.at)).toEqual([0, 1000])
	})
})

describe('download rate', () => {
	it('has no rate until it has been measured for a few seconds', () => {
		const samples = addRateSample(addRateSample([], {at: 0, bytes: 0}), {at: 2000, bytes: 2 * MB})
		expect(downloadRate(samples)).toBeNull()
	})

	it('measures bytes per second over the recent window', () => {
		const samples = addRateSample(addRateSample([], {at: 0, bytes: 0}), {at: 4000, bytes: 4 * MB})
		expect(downloadRate(samples)).toBe(MB)
	})
})

describe('time left', () => {
	it('promises nothing until the rate has been measured for a few seconds', () => {
		const samples = addRateSample(addRateSample([], {at: 0, bytes: 0}), {at: 2000, bytes: 2 * MB})
		expect(estimateSecondsLeft(samples, 40 * MB)).toBeNull()
	})

	it('estimates from the recent rate', () => {
		let samples = addRateSample([], {at: 0, bytes: 0})
		samples = addRateSample(samples, {at: 4000, bytes: 4 * MB})
		expect(estimateSecondsLeft(samples, 40 * MB)).toBe(40)
	})

	it('forgets samples older than its window', () => {
		let samples = addRateSample([], {at: 0, bytes: 0})
		samples = addRateSample(samples, {at: 5000, bytes: MB})
		samples = addRateSample(samples, {at: 12_000, bytes: 2 * MB})
		expect(samples.map(sample => sample.at)).toEqual([5000, 12_000])
	})

	// Progress arrives once per network chunk; a trickle can be 9 s apart, which
	// left one sample in the window and no rate at all.
	it('keeps measuring when progress arrives less often than its window', () => {
		let samples = addRateSample([], {at: 0, bytes: 0})
		samples = addRateSample(samples, {at: 9000, bytes: 64 * 1024})
		samples = addRateSample(samples, {at: 18_000, bytes: 128 * 1024})
		expect(downloadRate(samples)).toBeCloseTo((64 * 1024) / 9, 0)
	})

	it('measures across a burst that follows a long gap', () => {
		let samples = addRateSample([], {at: 0, bytes: 0})
		samples = addRateSample(samples, {at: 9000, bytes: MB})
		samples = addRateSample(samples, {at: 10_000, bytes: 2 * MB})
		expect(downloadRate(samples)).toBe((2 * MB) / 10)
	})

	it('gives no estimate when nothing is left or bytes stopped moving', () => {
		const samples = addRateSample(addRateSample([], {at: 0, bytes: 0}), {at: 4000, bytes: 4 * MB})
		expect(estimateSecondsLeft(samples, 0)).toBeNull()
		expect(
			estimateSecondsLeft(
				[
					{at: 0, bytes: MB},
					{at: 4000, bytes: MB}
				],
				10 * MB
			)
		).toBeNull()
	})
})
