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
import {spawnFFmpeg} from '@main/utils/process.js'
import {detectSubtitleLang, EMBED_CONTAINER_EXT} from '@shared/subtitlePath.js'
import {siteForJob} from '@shared/sites/index.js'
import {SUBTITLE_FORMATS, type SubtitleFormat} from '@shared/schemas.js'

export const logger = log.scope('subs')

// Minimal ISO 639-1 → 639-2/B mapping for the languages YouTube most commonly
// exposes. mkv prefers 3-letter codes per the Matroska spec; players still
// auto-pickup with 2-letter codes but 3-letter is more correct. For codes we
// don't recognize (e.g. "en-orig", regional variants), pass through as-is.
const ISO_639_1_TO_2B: Record<string, string> = {
	en: 'eng',
	es: 'spa',
	fr: 'fre',
	de: 'ger',
	it: 'ita',
	pt: 'por',
	ru: 'rus',
	ja: 'jpn',
	ko: 'kor',
	zh: 'chi',
	ar: 'ara',
	hi: 'hin',
	uk: 'ukr',
	pl: 'pol',
	tr: 'tur',
	nl: 'dut',
	sv: 'swe',
	da: 'dan',
	no: 'nor',
	fi: 'fin',
	cs: 'cze',
	el: 'gre',
	he: 'heb',
	th: 'tha',
	vi: 'vie',
	id: 'ind',
	ro: 'rum',
	hu: 'hun',
	bg: 'bul'
}

function toIso639(lang: string): string {
	const base = lang.toLowerCase()
	if (/^[a-z]{2}$/.test(base) && ISO_639_1_TO_2B[base]) return ISO_639_1_TO_2B[base]
	return lang
}

// Matroska carries cover art as a file attachment, so it is re-added from a
// copy rather than mapped: a mapped cover would land as a one-frame video track.
const COVER_ART_ATTACHMENT_NAME = 'cover.jpg'

function buildSubtitleEmbedArgs(opts: {videoPath: string; subtitleTracks: {path: string; lang: string}[]; coverPath: string | undefined; outputPath: string}): string[] {
	const args: string[] = ['-y']
	args.push('-i', opts.videoPath)
	for (const track of opts.subtitleTracks) args.push('-i', track.path)
	// Explicit maps: without them ffmpeg keeps one stream per type, which drops
	// every subtitle track but one. `0:V` is every video stream except cover art.
	args.push('-map', '0:V', '-map', '0:a?')
	for (let i = 0; i < opts.subtitleTracks.length; i++) args.push('-map', String(i + 1))
	args.push('-c', 'copy', '-c:s', 'srt')
	for (let i = 0; i < opts.subtitleTracks.length; i++) {
		args.push(`-metadata:s:s:${i}`, `language=${toIso639(opts.subtitleTracks[i].lang)}`)
	}
	if (opts.coverPath) args.push('-attach', opts.coverPath, '-metadata:s:t', 'mimetype=image/jpeg', '-metadata:s:t', `filename=${COVER_ART_ATTACHMENT_NAME}`)
	args.push(opts.outputPath)
	return args
}

// Copies the embedded cover (always JPEG: thumbnails are converted before they
// are embedded) out of the video. ffmpeg exits non-zero when there is none.
function buildCoverExtractArgs(videoPath: string, coverPath: string): string[] {
	return ['-y', '-i', videoPath, '-map', '0:v', '-map', '-0:V', '-c', 'copy', '-frames:v', '1', '-f', 'image2', '-update', '1', coverPath]
}

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

// Enough of ffmpeg's stderr to name the failing stream without flooding the log.
const STDERR_TAIL_CHARS = 2000

function runFfmpeg(ffmpegPath: string, args: string[], onSpawn: (proc: ChildProcessWithoutNullStreams) => void): Promise<{ok: boolean; stderrTail: string}> {
	return new Promise(resolve => {
		let stderrTail = ''
		const proc = spawnFFmpeg(ffmpegPath, args)
		onSpawn(proc)
		proc.stderr.on('data', (chunk: Buffer | string) => {
			stderrTail = (stderrTail + chunk.toString()).slice(-STDERR_TAIL_CHARS)
		})
		proc.on('error', () => resolve({ok: false, stderrTail}))
		proc.on('close', code => resolve({ok: code === 0, stderrTail}))
	})
}

// Mux deduped sidecar subs into the merged video via ffmpeg -c copy (+ srt
// for sub streams). Returns the new media path on success.
// `keepCoverArt` carries the embedded thumbnail over as a Matroska attachment.
//
// Lang attribution is strict: each sub path must end in `.<lang>.<ext>` for
// one of the requested langs. Unknown → 'und' (no positional fallback —
// yt-dlp doesn't guarantee output order matches input order).
export async function muxSubtitlesIntoVideo(opts: {ffmpegPath: string; videoPath: string; subtitlePaths: readonly string[]; requestedLangs: readonly string[]; keepCoverArt: boolean; onSpawn: (proc: ChildProcessWithoutNullStreams) => void; jobId: string}): Promise<MuxResult> {
	if (opts.subtitlePaths.length === 0) return {ok: false}

	const tracks = opts.subtitlePaths.map(path => ({path, lang: detectSubtitleLang(path, opts.requestedLangs) ?? 'und'}))

	const stem = opts.videoPath.replace(/\.[^.\\/]+$/, '')
	const outputPath = `${stem}.${EMBED_CONTAINER_EXT}`
	const tempPath = `${stem}.muxing.${EMBED_CONTAINER_EXT}`
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
		opts.subtitlePaths.map(p =>
			unlink(p).catch(err => {
				logger.warn('subtitle mux: sidecar unlink failed', {jobId: opts.jobId, path: p, message: err instanceof Error ? err.message : String(err)})
			})
		)
	)
	return {ok: true, outputPath}
}
