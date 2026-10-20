// Subtitle file post-processing extracted from DownloadService.
// Pure(-ish) orchestration: takes the disk paths produced by phase 2 and
// runs dedupe / ffmpeg-mux. Cancel awareness is provided by the caller via
// `shouldAbort` and the `onSpawn` hook (so DownloadService can still kill
// the ffmpeg child if a cancel lands mid-mux).

import {extname} from 'node:path'
import {access, readFile, rename, unlink, writeFile} from 'node:fs/promises'
import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import log from 'electron-log/main.js'
import {dedupeSrt} from './srtDedupe.js'
import {dedupeVtt} from './vttDedupe.js'
import {normalizeCueOverlaps} from './cueOverlap.js'
import {runFfmpeg} from './ffmpegRun.js'
import {EMBED_SUBTITLE_CONTAINER_EXT} from 'yt-dlp-bridge'
import {siteForJob} from '@shared/sites/index.js'
import {SUBTITLE_FORMATS, type SubtitleFormat} from '@shared/schemas.js'
import {buildCoverExtractArgs, buildSubtitleEmbedArgs, type SubtitleEmbedTrack} from './subtitleEmbedArgs.js'

export const logger = log.scope('subs')

// yt-dlp's `--convert-subs` writes `<stem>.<format>` and deletes the original
// without printing either path, so the paths scraped from its output still name
// the deleted pre-conversion file. Point each missing path at the sibling that
// exists, trying the requested format first.
export async function resolveConvertedSubtitlePaths(paths: readonly string[], requestedFormat: SubtitleFormat): Promise<string[]> {
	const formats = [requestedFormat, ...SUBTITLE_FORMATS.filter(format => format !== requestedFormat)]
	const resolved = await Promise.all(
		paths.map(async path => {
			if (await fileExists(path)) return path
			const stem = path.slice(0, path.length - extname(path).length)
			for (const format of formats) {
				const candidate = `${stem}.${format}`
				if (await fileExists(candidate)) return candidate
			}
			return path
		})
	)
	return [...new Set(resolved)]
}

function fileExists(path: string): Promise<boolean> {
	return access(path).then(
		() => true,
		() => false
	)
}

// Post-process the auto-caption files phase 2 wrote. Two passes, in order:
//
//   1. Rolling-cue dedupe — only YouTube emits captions where each cue
//      duplicates the previous + 1 word. Other extractors emit conventional
//      cues; running it on them would corrupt content with legitimate phrase
//      repeats, so the Site adapter gates it.
//   2. Overlap normalization — timing-only, no text touched, safe everywhere.
//      Auto-captions arrive with each cue still on screen as the next begins,
//      which players render as two stacked subtitles.
//
// Pass 2 is a no-op after pass 1 (the dedupe already emits strictly ordered
// cues), so YouTube pays for it once and every other site gets the fix it was
// missing.
//
// Failures are logged and swallowed: a post-process glitch must never lose a
// video. The per-file outcome is logged either way — a silent skip here used to
// be indistinguishable from a pass that ran and found nothing to do.
export async function postProcessSubtitleFiles(paths: readonly string[], opts: {extractor: string; url: string; jobId: string; shouldAbort: () => boolean}): Promise<void> {
	const site = siteForJob(opts.extractor, opts.url)
	const {jobId} = opts
	await Promise.all(
		paths.map(async path => {
			if (opts.shouldAbort()) return
			const ext = extname(path).toLowerCase()
			const dedupe = ext === '.srt' ? dedupeSrt : ext === '.vtt' ? dedupeVtt : null
			if (!dedupe) {
				logger.info('subtitle post-process skipped — unsupported format', {jobId, path})
				return
			}
			try {
				const original = await readFile(path, 'utf8')
				const deduped = site.needsAutoCaptionDedupe ? dedupe(original) : original
				const {content, clamped} = normalizeCueOverlaps(deduped)
				const changed = content !== original
				if (changed && !opts.shouldAbort()) {
					await writeFile(path, content, 'utf8')
				}
				logger.info('subtitle post-process', {jobId, path, site: site.id, rollingDedupe: site.needsAutoCaptionDedupe, overlapsClamped: clamped, changed})
			} catch (err) {
				logger.warn('subtitle post-process failed', {jobId, path, site: site.id, message: err instanceof Error ? err.message : String(err)})
			}
		})
	)
}

export interface MuxResult {
	ok: boolean
	outputPath?: string
}

// Mux deduped sidecar subs into the merged video via ffmpeg -c copy (+ srt
// for sub streams). Returns the new media path on success.
// `keepCoverArt` carries the embedded thumbnail over as a Matroska attachment.
// Each track's language and title come from the job's subtitle plan (see
// `subtitleEmbedTracks`).
export async function muxSubtitlesIntoVideo(opts: {ffmpegPath: string; videoPath: string; tracks: readonly SubtitleEmbedTrack[]; keepCoverArt: boolean; onSpawn: (proc: ChildProcessWithoutNullStreams) => void; jobId: string}): Promise<MuxResult> {
	const {tracks} = opts
	if (tracks.length === 0) return {ok: false}

	const stem = opts.videoPath.replace(/\.[^.\\/]+$/, '')
	const outputPath = `${stem}.${EMBED_SUBTITLE_CONTAINER_EXT}`
	const tempPath = `${stem}.muxing.${EMBED_SUBTITLE_CONTAINER_EXT}`
	const coverTempPath = `${stem}.muxing-cover.jpg`

	let args: string[] = []
	let muxed: {ok: boolean; stderrTail: string}
	try {
		let coverPath: string | undefined
		if (opts.keepCoverArt) {
			const extracted = await runFfmpeg(opts.ffmpegPath, buildCoverExtractArgs(opts.videoPath, coverTempPath), opts.onSpawn)
			if (extracted.ok) coverPath = coverTempPath
			else logger.warn('subtitle mux: no cover art to keep', {jobId: opts.jobId, stderrTail: extracted.stderrTail})
		}
		args = buildSubtitleEmbedArgs({videoPath: opts.videoPath, subtitleTracks: tracks, coverPath, outputPath: tempPath})
		muxed = await runFfmpeg(opts.ffmpegPath, args, opts.onSpawn)
	} finally {
		if (opts.keepCoverArt) await unlink(coverTempPath).catch(() => {})
	}

	if (!muxed.ok) {
		logger.error('subtitle mux: ffmpeg failed or cancelled', {jobId: opts.jobId, args, stderrTail: muxed.stderrTail})
		await unlink(tempPath).catch(() => {})
		return {ok: false}
	}

	try {
		await rename(tempPath, outputPath)
	} catch (err) {
		logger.error('subtitle mux: rename failed', {jobId: opts.jobId, message: err instanceof Error ? err.message : String(err)})
		await unlink(tempPath).catch(() => {})
		return {ok: false}
	}
	if (outputPath !== opts.videoPath) {
		await unlink(opts.videoPath).catch(err => {
			logger.warn('subtitle mux: original video unlink failed', {jobId: opts.jobId, path: opts.videoPath, message: err instanceof Error ? err.message : String(err)})
		})
	}
	await Promise.all(
		tracks.map(({path: p}) =>
			unlink(p).catch(err => {
				logger.warn('subtitle mux: sidecar unlink failed', {jobId: opts.jobId, path: p, message: err instanceof Error ? err.message : String(err)})
			})
		)
	)
	return {ok: true, outputPath}
}
