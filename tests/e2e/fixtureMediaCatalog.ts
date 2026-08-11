import path from 'node:path'
import catalog from './fixture-media-catalog.json' with {type: 'json'}

export type FixtureMediaKind = 'generated-muxed' | 'generated-split-video' | 'generated-split-audio'

export interface FixtureFormatDescriptor {
	id: string
	note: string
	ext: string
	contentType: string
	mediaKind: FixtureMediaKind
	width?: number
	height?: number
	fps?: number
	tbr?: number
	abr?: number
	filesize: number
	vcodec: string
	acodec: string
}

function requireFormat(formatId: string): FixtureFormatDescriptor {
	for (const formats of Object.values(catalog.formatSets)) {
		const format = formats.find(candidate => candidate.id === formatId)
		if (format) return format as FixtureFormatDescriptor
	}
	throw new Error(`Unknown fixture format id: ${formatId}`)
}

/** A catalog entry that overrides its generated title. */
function titleOverride(video: (typeof catalog.videos)[number]): string | undefined {
	return (video as {title?: string}).title
}

export const FIXTURE_MEDIA_CATALOG_PATH = path.join(process.cwd(), 'tests', 'e2e', 'fixture-media-catalog.json')
// Ordinary fixture videos only. A video carrying an awkward title is addressed
// through its own export, so tests that just need "some video" never draw one.
export const FIXTURE_VIDEO_IDS = catalog.videos.filter(video => video.formatSet === 'muxed' && titleOverride(video) === undefined).map(video => video.id)
const splitMediaVideo = catalog.videos.find(video => video.formatSet === 'split')
if (!splitMediaVideo) throw new Error('fixture-media-catalog.json must define a split fixture video')
export const SPLIT_MEDIA_VIDEO_ID = splitMediaVideo.id

const awkwardTitleVideo = catalog.videos.find(video => titleOverride(video) !== undefined)
if (!awkwardTitleVideo) throw new Error('fixture-media-catalog.json must define a video with an awkward title')
export const AWKWARD_TITLE_VIDEO_ID = awkwardTitleVideo.id
/** The raw title, before any sanitizing or shortening Arroxy applies. */
export const AWKWARD_TITLE = titleOverride(awkwardTitleVideo) ?? ''
export const FIXTURE_PLAYLIST_ID = catalog.playlist.id
export const FIXTURE_PLAYLIST_VIDEO_IDS = catalog.playlist.videoIds
export const FIXTURE_MEDIA_FORMAT_IDS = Object.values(catalog.formatSets).flatMap(formatSet => formatSet.map(format => format.id))

export function fixtureMediaPathExtension(formatId: string): string {
	return requireFormat(formatId).ext
}

export function fixtureMediaContentType(formatId: string): string {
	return requireFormat(formatId).contentType
}

export function fixtureMediaFileSize(formatId: string): number {
	return requireFormat(formatId).filesize
}

export function fixtureMediaKind(formatId: string): FixtureMediaKind {
	return requireFormat(formatId).mediaKind
}
