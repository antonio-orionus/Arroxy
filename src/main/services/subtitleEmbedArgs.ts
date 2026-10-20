// The ffmpeg argv for muxing phase-2 subtitles into the video. Kept free of
// Electron and I/O so the FFmpeg remux matrix runs exactly these commands
// against every approved FFmpeg package.

import {iso6392BTo1} from 'iso-639-2/2b-to-1.js'
import {iso6392TTo2B} from 'iso-639-2/2t-to-2b.js'

// Matroska's Language element takes ISO 639-2/B ("ger", not "de" or "deu").
// Players still pick up other forms, but /B is what the spec asks for. A tag
// with a region or script ("pt-BR", "zh-Hant") passes through as-is:
// collapsing it onto one code would merge tracks the user picked apart.
const TO_ISO_639_2B: ReadonlyMap<string, string> = new Map([...Object.entries(iso6392TTo2B), ...Object.entries(iso6392BTo1).map(([b, one]): [string, string] => [one, b])])

function toIso639(lang: string): string {
	return TO_ISO_639_2B.get(lang.toLowerCase()) ?? lang
}

export interface SubtitleEmbedTrack {
	path: string
	// The track's language ("en", "pt-BR"), or "und".
	lang: string
	// The track's name in the info-json ("English (United Kingdom)").
	name?: string
	// A title other than the name, to tell a track from another of its language.
	title?: string
}

// As yt-dlp's EmbedSubtitle does, a track's name becomes its handler name and
// its title, which is what players list it by.
function subtitleTrackMetadata(track: SubtitleEmbedTrack, index: number): string[] {
	const language = toIso639(track.lang)
	const title = track.title ?? track.name
	const stream = `-metadata:s:s:${index}`
	return [stream, `language=${language}`, ...(track.name ? [stream, `handler_name=${track.name}`] : []), ...(title ? [stream, `title=${title}`] : [])]
}

// Matroska carries cover art as a file attachment, so it is re-added from a
// copy rather than mapped: a mapped cover would land as a one-frame video track.
const COVER_ART_ATTACHMENT_NAME = 'cover.jpg'

export function buildSubtitleEmbedArgs(opts: {videoPath: string; subtitleTracks: readonly SubtitleEmbedTrack[]; coverPath: string | undefined; outputPath: string}): string[] {
	const args: string[] = ['-y']
	args.push('-i', opts.videoPath)
	for (const track of opts.subtitleTracks) args.push('-i', track.path)
	// Explicit maps: without them ffmpeg keeps one stream per type, which drops
	// every subtitle track but one. `0:V` is every video stream except cover art.
	args.push('-map', '0:V', '-map', '0:a?')
	for (let i = 0; i < opts.subtitleTracks.length; i++) args.push('-map', String(i + 1))
	args.push('-c', 'copy', '-c:s', 'srt')
	opts.subtitleTracks.forEach((track, i) => args.push(...subtitleTrackMetadata(track, i)))
	if (opts.coverPath) args.push('-attach', opts.coverPath, '-metadata:s:t', 'mimetype=image/jpeg', '-metadata:s:t', `filename=${COVER_ART_ATTACHMENT_NAME}`)
	args.push(opts.outputPath)
	return args
}

// Copies the embedded cover (always JPEG: thumbnails are converted before they
// are embedded) out of the video. ffmpeg exits non-zero when there is none.
export function buildCoverExtractArgs(videoPath: string, coverPath: string): string[] {
	return ['-y', '-i', videoPath, '-map', '0:v', '-map', '-0:V', '-c', 'copy', '-frames:v', '1', '-f', 'image2', '-update', '1', coverPath]
}
