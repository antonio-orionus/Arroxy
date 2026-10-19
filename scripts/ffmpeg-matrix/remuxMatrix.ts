// The FFmpeg remux matrix: every ffmpeg command yt-dlp and Arroxy run on a
// download, crossed with the media shapes YouTube serves. Pure: the cases,
// their argv and what their output must contain. run.ts executes them.
//
// The argv is copied from yt-dlp's own code paths, not paraphrased, because a
// build that crashes on one flag order can pass on another:
// - merge:           FFmpegMergerPP (postprocessor/ffmpeg.py)
// - section(-hls):   FFmpegFD for --download-sections (downloader/external.py),
//                    which reads the DASH URLs, or the HLS playlist, directly
// - remove-chapters: ModifyChaptersPP via concat_files (SponsorBlock remove)
// - metadata:        FFmpegMetadataPP (--embed-metadata, --embed-chapters)
// - thumbnail(-convert): FFmpegThumbnailsConvertorPP (--convert-thumbnails
//                    jpg) and EmbedThumbnailPP's ffmpeg paths
// - subtitles:       FFmpegEmbedSubtitlePP (--embed-subs)
// - app-*:           Arroxy's own phase-2 subtitle mux, from its argv builders
import path from 'node:path'
import {buildCoverExtractArgs, buildSubtitleEmbedArgs} from '../../src/main/services/subtitleEmbedArgs.js'

export const FIXTURE_DURATION_SECONDS = 2

export const FIXTURE_FILES = {
	h264Dash: 'h264-dash.mp4',
	vp9Dash: 'vp9-dash.webm',
	vp9Hls: 'vp9-hls.mp4',
	av1Dash: 'av1-dash.mp4',
	aacDash: 'aac-dash.m4a',
	opusDash: 'opus-dash.webm',
	thumbnailWebp: 'thumbnail.webp',
	subtitleVtt: 'subtitles.en.vtt',
	subtitleSrt: 'subtitles.en.srt'
} as const

export const HLS_PLAYLIST = 'vp9-hls/index.m3u8'

type VideoCodec = 'h264' | 'vp9' | 'av1'
type AudioCodec = 'aac' | 'opus'
export type Container = 'mp4' | 'mkv' | 'webm'

interface VideoInput {
	id: string
	file: string
	codec: VideoCodec
	// Served as HLS, so --download-sections has ffmpeg read this playlist.
	hlsPlaylist?: string
}

interface AudioInput {
	id: string
	file: string
	codec: AudioCodec
}

export const VIDEO_INPUTS: readonly VideoInput[] = [
	{id: 'h264-dash', file: FIXTURE_FILES.h264Dash, codec: 'h264'},
	{id: 'vp9-dash', file: FIXTURE_FILES.vp9Dash, codec: 'vp9'},
	{id: 'vp9-hls', file: FIXTURE_FILES.vp9Hls, codec: 'vp9', hlsPlaylist: HLS_PLAYLIST},
	{id: 'av1-dash', file: FIXTURE_FILES.av1Dash, codec: 'av1'}
]

export const AUDIO_INPUTS: readonly AudioInput[] = [
	{id: 'aac', file: FIXTURE_FILES.aacDash, codec: 'aac'},
	{id: 'opus', file: FIXTURE_FILES.opusDash, codec: 'opus'}
]

const CONTAINERS: readonly Container[] = ['mp4', 'mkv', 'webm']

const CONTAINER_CODECS: Record<Container, {video: readonly VideoCodec[]; audio: readonly AudioCodec[]}> = {
	mp4: {video: ['h264', 'vp9', 'av1'], audio: ['aac', 'opus']},
	mkv: {video: ['h264', 'vp9', 'av1'], audio: ['aac', 'opus']},
	webm: {video: ['vp9', 'av1'], audio: ['opus']}
}

export function containerHolds(container: Container, video: VideoCodec, audio: AudioCodec): boolean {
	return CONTAINER_CODECS[container].video.includes(video) && CONTAINER_CODECS[container].audio.includes(audio)
}

// yt-dlp's EXT_TO_OUT_FORMATS, for the containers here.
const MUXER: Record<Container, string> = {mp4: 'mp4', mkv: 'matroska', webm: 'webm'}

// yt-dlp writes subtitles as mov_text into MP4 (stream_copy_opts).
const MOV_TEXT_EXTS: readonly string[] = ['mp4', 'mov', 'm4a']

// --download-sections "*0.5-1.5"
export const SECTION = {start: 0.5, end: 1.5}
// A SponsorBlock segment removed from the merged file.
export const REMOVED_SEGMENT = {start: 0.5, end: 1}

const CHAPTERS = [
	{start: 0, end: 1, title: 'Intro'},
	// Exercises the FFMETADATA escaping of = ; # and \.
	{start: 1, end: FIXTURE_DURATION_SECONDS, title: 'Part = 2; #main \\ end'}
]

const METADATA = {
	title: 'Arroxy remux matrix',
	uploadDate: '20260101',
	description: 'First line\nSecond line',
	webpageUrl: 'https://www.youtube.com/watch?v=arroxyremux',
	uploader: 'Arroxy',
	// What YouTube reports for the audio format, mapped like yt-dlp does.
	audioLanguage: 'eng'
}

const SUBTITLE = {language: 'eng', name: 'English'}

export type Step = 'merge' | 'section' | 'section-hls' | 'remove-chapters' | 'metadata' | 'thumbnail-convert' | 'thumbnail' | 'subtitles' | 'app-subtitles' | 'app-cover-extract' | 'app-subtitles-cover'

interface MediaCase {
	id: string
	step: Exclude<Step, 'thumbnail-convert'>
	video: VideoInput
	audio: AudioInput
	container: Container
	// Cases whose output this case reads.
	needs: readonly string[]
}

interface ThumbnailConvertCase {
	id: string
	step: 'thumbnail-convert'
	needs: readonly string[]
}

export type MatrixCase = MediaCase | ThumbnailConvertCase

const THUMBNAIL_CONVERT_ID = 'thumbnail-convert/webp-to-jpg'

// Dependencies come before the cases that read them.
export function buildCases(): MatrixCase[] {
	const cases: MatrixCase[] = [{id: THUMBNAIL_CONVERT_ID, step: 'thumbnail-convert', needs: []}]
	for (const video of VIDEO_INPUTS) {
		for (const audio of AUDIO_INPUTS) {
			for (const container of CONTAINERS) {
				if (!containerHolds(container, video.codec, audio.codec)) continue
				const pair = `${video.id}+${audio.id}.${container}`
				const media = (step: MediaCase['step'], needs: string[] = []): MediaCase => ({id: `${step}/${pair}`, step, video, audio, container, needs})
				const merge = media('merge')
				cases.push(merge, media(video.hlsPlaylist ? 'section-hls' : 'section'))
				cases.push(media('remove-chapters', [merge.id]), media('metadata', [merge.id]), media('subtitles', [merge.id]), media('app-subtitles', [merge.id]))
				// yt-dlp embeds no thumbnail in WebM; it switches the output to MKV.
				if (container === 'webm') continue
				const thumbnail = media('thumbnail', [merge.id, THUMBNAIL_CONVERT_ID])
				const cover = media('app-cover-extract', [thumbnail.id])
				cases.push(thumbnail, cover, media('app-subtitles-cover', [thumbnail.id, cover.id]))
			}
		}
	}
	return cases
}

export interface Layout {
	fixtures: string
	work: string
}

export function outputPath(matrixCase: MatrixCase, layout: Layout): string {
	if (matrixCase.step === 'thumbnail-convert') return path.join(layout.work, 'thumbnail.jpg')
	const stem = path.join(layout.work, `${matrixCase.step}__${matrixCase.video.id}+${matrixCase.audio.id}`)
	switch (matrixCase.step) {
		case 'section':
		case 'section-hls':
			return `${stem}.${matrixCase.container}.part`
		case 'app-cover-extract':
			return `${stem}.muxing-cover.jpg`
		case 'app-subtitles':
		case 'app-subtitles-cover':
			return `${stem}.muxing.mkv`
		default:
			return `${stem}.temp.${matrixCase.container}`
	}
}

export interface Invocation {
	argv: string[]
	output: string
	// Files yt-dlp writes for the command before running it.
	files: {path: string; content: string}[]
}

// --- yt-dlp's FFmpegPostProcessor plumbing --------------------------------

function fileArg(filePath: string): string {
	return `file:${filePath}`
}

// real_run_ffmpeg: inputs with their options, then the output's options,
// always followed by -movflags +faststart.
function postProcessorArgv(inputs: {path: string; opts?: readonly string[]}[], output: {path: string; opts: readonly string[]}): string[] {
	return ['-y', '-loglevel', 'repeat+info', ...inputs.flatMap(input => [...(input.opts ?? []), '-i', fileArg(input.path)]), ...output.opts, '-movflags', '+faststart', fileArg(output.path)]
}

function streamCopyOpts(copy = true, ext?: string): string[] {
	return ['-map', '0', '-dn', '-ignore_unknown', ...(copy ? ['-c', 'copy'] : []), ...(ext && MOV_TEXT_EXTS.includes(ext) ? ['-c:s', 'mov_text'] : [])]
}

// _quote_for_ffmpeg
export function quoteForFfmpeg(value: string): string {
	let quoted = value.replaceAll("'", "'\\''").replaceAll("'''", "'")
	quoted = quoted.startsWith("'") ? quoted.slice(1) : `'${quoted}`
	return quoted.endsWith("'") ? quoted.slice(0, -1) : `${quoted}'`
}

// str() of a Python float, as FFmpegFD formats -ss and -t.
export function pythonFloat(value: number): string {
	return Number.isInteger(value) ? `${value}.0` : String(value)
}

function ffmetadataEscape(text: string): string {
	return text.replace(/([\\=;#\n])/g, '\\$1')
}

// FFmpegMetadataPP._get_chapter_opts
export function chapterMetadataFile(chapters: readonly {start: number; end: number; title: string}[]): string {
	let content = ';FFMETADATA1\n'
	for (const chapter of chapters) {
		content += `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.trunc(chapter.start * 1000)}\nEND=${Math.trunc(chapter.end * 1000)}\n`
		if (chapter.title) content += `title=${ffmetadataEscape(chapter.title)}\n`
	}
	return content
}

// concat_files with ModifyChaptersPP._make_concat_opts for one removed segment.
export function removeSegmentConcatSpec(input: string, segment: {start: number; end: number}, duration: number): string {
	const parts: {inpoint?: number; outpoint?: number}[] = segment.start === 0 ? [{inpoint: segment.end}] : [{outpoint: segment.start}, ...(segment.end < duration ? [{inpoint: segment.end}] : [])]
	let spec = 'ffconcat version 1.0\n'
	for (const part of parts) {
		spec += `file ${quoteForFfmpeg(fileArg(input))}\n`
		if (part.inpoint !== undefined) spec += `inpoint ${part.inpoint.toFixed(6)}\n`
		if (part.outpoint !== undefined) spec += `outpoint ${part.outpoint.toFixed(6)}\n`
	}
	return spec
}

// --- the cases' commands ---------------------------------------------------

function caseById(id: string): MatrixCase {
	const found = buildCases().find(matrixCase => matrixCase.id === id)
	if (!found) throw new Error(`unknown matrix case ${id}`)
	return found
}

function neededOutput(matrixCase: MatrixCase, step: Step, layout: Layout): string {
	const id = matrixCase.needs.find(need => need.startsWith(`${step}/`))
	if (!id) throw new Error(`${matrixCase.id} does not read a ${step} output`)
	return outputPath(caseById(id), layout)
}

function metadataOpts(container: Container, infoJsonPath: string): string[] {
	const opts = ['-map_metadata', '1', '-write_id3v1', '1']
	const common: [string, string][] = [
		['title', METADATA.title],
		['date', METADATA.uploadDate],
		['description', METADATA.description],
		['synopsis', METADATA.description],
		['purl', METADATA.webpageUrl],
		['comment', METADATA.webpageUrl],
		['artist', METADATA.uploader]
	]
	for (const [name, value] of common) opts.push('-metadata', `${name}=${value}`)
	// Stream 0 is the video, which YouTube gives no language; 1 is the audio.
	opts.push('-metadata:s:1', `language=${METADATA.audioLanguage}`)
	// The info.json rides along as an attachment in Matroska only.
	if (container === 'mkv') opts.push('-attach', fileArg(infoJsonPath), '-metadata:s:2', 'mimetype=application/json', '-metadata:s:2', 'filename=info.json')
	return opts
}

function sectionArgv(videoUrl: string, audioUrl: string, container: Container, output: string): string[] {
	const range = ['-ss', pythonFloat(SECTION.start), '-t', pythonFloat(SECTION.end - SECTION.start)]
	return ['-y', '-hide_banner', ...range, '-i', videoUrl, ...range, '-i', audioUrl, '-c', 'copy', '-map', '0:0', '-map', '1:0', '-f', MUXER[container], fileArg(output)]
}

export function planInvocation(matrixCase: MatrixCase, layout: Layout): Invocation {
	const output = outputPath(matrixCase, layout)
	const fixture = (name: string): string => path.join(layout.fixtures, name)
	if (matrixCase.step === 'thumbnail-convert') {
		return {output, files: [], argv: postProcessorArgv([{path: fixture(FIXTURE_FILES.thumbnailWebp), opts: ['-f', 'image2', '-pattern_type', 'none']}], {path: output, opts: ['-update', '1', '-bsf:v', 'mjpeg2jpeg']})}
	}
	const {container} = matrixCase
	const video = fixture(matrixCase.video.file)
	const audio = fixture(matrixCase.audio.file)
	switch (matrixCase.step) {
		case 'merge':
			return {output, files: [], argv: postProcessorArgv([{path: video}, {path: audio}], {path: output, opts: ['-c', 'copy', '-map', '0:v:0', '-map', '1:a:0']})}
		case 'section':
			return {output, files: [], argv: sectionArgv(video, audio, container, output)}
		case 'section-hls':
			return {output, files: [], argv: sectionArgv(fixture(matrixCase.video.hlsPlaylist ?? HLS_PLAYLIST), audio, container, output)}
		case 'remove-chapters': {
			const merged = neededOutput(matrixCase, 'merge', layout)
			const spec = `${output}.concat`
			return {
				output,
				files: [{path: spec, content: removeSegmentConcatSpec(merged, REMOVED_SEGMENT, FIXTURE_DURATION_SECONDS)}],
				argv: postProcessorArgv([{path: spec, opts: ['-hide_banner', '-nostdin', '-f', 'concat', '-safe', '0']}], {path: output, opts: streamCopyOpts(true, container)})
			}
		}
		case 'metadata': {
			const merged = neededOutput(matrixCase, 'merge', layout)
			const meta = output.replace(/\.temp\.[^.]+$/, '.meta')
			const infoJson = output.replace(/\.temp\.[^.]+$/, '.info.json')
			return {
				output,
				files: [
					{path: meta, content: chapterMetadataFile(CHAPTERS)},
					{path: infoJson, content: `${JSON.stringify({id: 'arroxyremux', title: METADATA.title})}\n`}
				],
				argv: postProcessorArgv([{path: merged}, {path: meta}], {path: output, opts: [...streamCopyOpts(), ...metadataOpts(container, infoJson)]})
			}
		}
		case 'thumbnail': {
			const merged = neededOutput(matrixCase, 'merge', layout)
			const jpg = neededOutput(matrixCase, 'thumbnail-convert', layout)
			// The merged file has two streams, so the cover becomes stream 2.
			if (container === 'mkv') {
				return {output, files: [], argv: postProcessorArgv([{path: merged}], {path: output, opts: [...streamCopyOpts(), '-attach', fileArg(jpg), '-metadata:s:2', 'mimetype=image/jpeg', '-metadata:s:2', 'filename=cover.jpg']})}
			}
			// Arroxy's yt-dlp embeds MP4 covers with mutagen; this is the path yt-dlp
			// falls back to without it, and the one that tests ffmpeg.
			return {output, files: [], argv: postProcessorArgv([{path: merged}, {path: jpg}], {path: output, opts: [...streamCopyOpts(), '-map', '1', '-disposition:2', 'attached_pic']})}
		}
		case 'subtitles': {
			const merged = neededOutput(matrixCase, 'merge', layout)
			const opts = [...streamCopyOpts(true, container), '-map', '-0:s', '-map', '1:0', '-metadata:s:s:0', `language=${SUBTITLE.language}`, '-metadata:s:s:0', `handler_name=${SUBTITLE.name}`, '-metadata:s:s:0', `title=${SUBTITLE.name}`]
			return {output, files: [], argv: postProcessorArgv([{path: merged}, {path: fixture(FIXTURE_FILES.subtitleVtt)}], {path: output, opts})}
		}
		case 'app-subtitles':
			return {output, files: [], argv: buildSubtitleEmbedArgs({videoPath: neededOutput(matrixCase, 'merge', layout), subtitleTracks: [{path: fixture(FIXTURE_FILES.subtitleSrt), lang: 'en'}], coverPath: undefined, outputPath: output})}
		case 'app-cover-extract':
			return {output, files: [], argv: buildCoverExtractArgs(neededOutput(matrixCase, 'thumbnail', layout), output)}
		case 'app-subtitles-cover':
			return {
				output,
				files: [],
				argv: buildSubtitleEmbedArgs({videoPath: neededOutput(matrixCase, 'thumbnail', layout), subtitleTracks: [{path: fixture(FIXTURE_FILES.subtitleSrt), lang: 'en'}], coverPath: neededOutput(matrixCase, 'app-cover-extract', layout), outputPath: output})
			}
	}
}

// --- what each output must contain ----------------------------------------

export type Expectation =
	| {kind: 'image'}
	| {
			kind: 'media'
			video: VideoCodec
			audio: AudioCodec
			// Seconds; stream copy cuts on keyframes, so ranges, not values.
			duration: readonly [number, number]
			title?: string
			chapters?: number
			subtitle?: {codec: string; language: string}
			coverArt?: boolean
	  }

const FULL_DURATION = [FIXTURE_DURATION_SECONDS - 0.2, FIXTURE_DURATION_SECONDS + 0.3] as const

export function expectationFor(matrixCase: MatrixCase): Expectation {
	if (matrixCase.step === 'thumbnail-convert' || matrixCase.step === 'app-cover-extract') return {kind: 'image'}
	const base = {kind: 'media' as const, video: matrixCase.video.codec, audio: matrixCase.audio.codec, duration: FULL_DURATION}
	switch (matrixCase.step) {
		case 'merge':
			return base
		case 'section':
		case 'section-hls': {
			const length = SECTION.end - SECTION.start
			return {...base, duration: [length - 0.3, length + 0.6]}
		}
		case 'remove-chapters': {
			const length = FIXTURE_DURATION_SECONDS - (REMOVED_SEGMENT.end - REMOVED_SEGMENT.start)
			return {...base, duration: [length - 0.3, length + 0.6]}
		}
		case 'metadata':
			return {...base, title: METADATA.title, chapters: CHAPTERS.length}
		case 'thumbnail':
			return {...base, coverArt: true}
		case 'subtitles':
			return {...base, subtitle: {codec: matrixCase.container === 'mp4' ? 'mov_text' : 'webvtt', language: SUBTITLE.language}}
		case 'app-subtitles':
			return {...base, subtitle: {codec: 'subrip', language: SUBTITLE.language}}
		case 'app-subtitles-cover':
			return {...base, subtitle: {codec: 'subrip', language: SUBTITLE.language}, coverArt: true}
	}
}

// ffprobe arguments for checking an output against its expectation.
export function probeArgv(file: string): string[] {
	return ['-v', 'error', '-show_streams', '-show_format', '-show_chapters', '-of', 'json', file]
}

// Decodes every audio and video stream of an output, cover art excluded.
export function decodeArgv(file: string): string[] {
	return ['-nostdin', '-v', 'error', '-i', file, '-map', '0:V?', '-map', '0:a?', '-f', 'null', '-']
}
