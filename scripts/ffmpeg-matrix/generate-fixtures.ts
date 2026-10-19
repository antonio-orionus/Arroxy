// Generates the remux matrix fixtures in tests/fixtures/ffmpeg-remux/: two
// seconds of synthetic media in each shape YouTube serves, a few kilobytes
// each. The outputs are committed, so every FFmpeg package is tested against
// the same bytes; rerun this only to change a fixture, and commit the result.
//
//   bun scripts/ffmpeg-matrix/generate-fixtures.ts --ffmpeg build/embedded/darwin-arm64/ffmpeg
//
// The generating ffmpeg needs libx264, libvpx, libsvtav1, libopus and libwebp
// (any recent full build: Martin Riedl's macOS builds, BtbN's gpl builds).
//
// Shapes, checked against real downloads:
// - h264-dash.mp4, av1-dash.mp4, aac-dash.m4a: fragmented MP4 as YouTube's
//   DASH formats serve it (ftyp, moov with mvex, sidx, then moof+mdat pairs).
// - vp9-dash.webm, opus-dash.webm: WebM DASH (itags 242-248, 249-251).
// - vp9-hls/: VP9 in fragmented MP4 behind an HLS playlist with an
//   EXT-X-MAP init segment (itags 602-617, e.g. 616), timescale 1000.
// - vp9-hls.mp4: that init segment followed by every media segment in
//   playlist order, byte for byte, which is the file yt-dlp's native HLS
//   downloader writes.
import {spawnSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {isCliEntrypoint} from '../build/btbnResolver.js'
import {FIXTURE_FILES, FIXTURE_DURATION_SECONDS, HLS_PLAYLIST} from './remuxMatrix.js'

const ROOT = path.resolve(import.meta.dirname, '..', '..')
export const DEFAULT_FIXTURE_DIR = path.join(ROOT, 'tests', 'fixtures', 'ffmpeg-remux')

// 15 fps and a 0.5 s GOP, so a 2 s clip has several fragments and keyframes
// to cut at. BT.601 limited range is what YouTube tags its SD streams with.
const FPS = 15
const GOP = String(FPS / 2)
const VIDEO_SOURCE = ['-f', 'lavfi', '-i', `testsrc2=size=160x120:rate=${FPS}:duration=${FIXTURE_DURATION_SECONDS}`]
const VIDEO_COMMON = ['-an', '-pix_fmt', 'yuv420p', '-g', GOP, '-keyint_min', GOP, '-color_range', 'tv', '-colorspace', 'smpte170m', '-color_primaries', 'smpte170m', '-color_trc', 'smpte170m']
const DASH_MP4 = ['-movflags', '+dash+global_sidx', '-f', 'mp4']
const VP9 = ['-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '80k']

function audioSource(sampleRate: number): string[] {
	return ['-f', 'lavfi', '-i', `sine=frequency=440:sample_rate=${sampleRate}:duration=${FIXTURE_DURATION_SECONDS}`, '-ac', '2', '-vn']
}

function recipes(dir: string): {name: string; args: string[]}[] {
	const out = (name: string): string => path.join(dir, name)
	return [
		{name: FIXTURE_FILES.h264Dash, args: [...VIDEO_SOURCE, ...VIDEO_COMMON, '-c:v', 'libx264', '-profile:v', 'main', '-preset', 'veryfast', '-crf', '35', '-sc_threshold', '0', ...DASH_MP4, out(FIXTURE_FILES.h264Dash)]},
		{name: FIXTURE_FILES.vp9Dash, args: [...VIDEO_SOURCE, ...VIDEO_COMMON, ...VP9, '-f', 'webm', '-dash', '1', out(FIXTURE_FILES.vp9Dash)]},
		{name: FIXTURE_FILES.av1Dash, args: [...VIDEO_SOURCE, ...VIDEO_COMMON, '-c:v', 'libsvtav1', '-preset', '12', '-crf', '50', ...DASH_MP4, out(FIXTURE_FILES.av1Dash)]},
		{
			name: HLS_PLAYLIST,
			args: [
				...VIDEO_SOURCE,
				...VIDEO_COMMON,
				...VP9,
				'-f',
				'hls',
				'-hls_segment_type',
				'fmp4',
				'-hls_time',
				'0.5',
				'-hls_playlist_type',
				'vod',
				'-hls_flags',
				'independent_segments',
				'-hls_fmp4_init_filename',
				'init.mp4',
				'-hls_segment_filename',
				out(path.join(path.dirname(HLS_PLAYLIST), 'seg%d.m4s')),
				'-hls_segment_options',
				'video_track_timescale=1000',
				out(HLS_PLAYLIST)
			]
		},
		{name: FIXTURE_FILES.aacDash, args: [...audioSource(44100), '-c:a', 'aac', '-b:a', '48k', '-frag_duration', '500000', ...DASH_MP4, out(FIXTURE_FILES.aacDash)]},
		{name: FIXTURE_FILES.opusDash, args: [...audioSource(48000), '-c:a', 'libopus', '-b:a', '24k', '-f', 'webm', '-dash', '1', out(FIXTURE_FILES.opusDash)]},
		{name: FIXTURE_FILES.thumbnailWebp, args: ['-f', 'lavfi', '-i', 'testsrc2=size=160x90', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '60', out(FIXTURE_FILES.thumbnailWebp)]}
	]
}

// The init segment named by EXT-X-MAP, then the media segments in playlist
// order: what yt-dlp's native HLS downloader concatenates into one file.
export function hlsFragmentOrder(playlist: string): string[] {
	const lines = playlist.split(/\r?\n/).map(line => line.trim())
	const map = lines.map(line => /^#EXT-X-MAP:.*URI="([^"]+)"/.exec(line)?.[1]).find(uri => uri !== undefined)
	if (!map) throw new Error('HLS playlist has no EXT-X-MAP init segment')
	return [map, ...lines.filter(line => line !== '' && !line.startsWith('#'))]
}

const CONTAINER_BOXES: readonly string[] = ['moov', 'trak', 'mdia', 'minf', 'stbl', 'moof', 'traf', 'mvex', 'edts', 'dinf']

// Drops the boxes at these paths (e.g. 'moov/udta') from an ISO BMFF buffer,
// resizing their parents. Boxes with 64-bit sizes are left alone.
export function dropBoxes(data: Buffer, drop: readonly string[], parent = ''): Buffer {
	const kept: Buffer[] = []
	let offset = 0
	while (offset + 8 <= data.length) {
		const size = data.readUInt32BE(offset)
		const type = data.toString('latin1', offset + 4, offset + 8)
		const boxPath = parent ? `${parent}/${type}` : type
		if (size < 8 || offset + size > data.length) throw new Error(`malformed box ${boxPath} at ${offset}`)
		const box = data.subarray(offset, offset + size)
		offset += size
		if (drop.includes(boxPath)) continue
		if (!CONTAINER_BOXES.includes(type)) {
			kept.push(box)
			continue
		}
		const body = dropBoxes(box.subarray(8), drop, boxPath)
		const header = Buffer.from(box.subarray(0, 8))
		header.writeUInt32BE(body.length + 8, 0)
		kept.push(header, body)
	}
	if (offset !== data.length) throw new Error(`trailing bytes after ${parent || 'top level'}`)
	return Buffer.concat(kept)
}

// YouTube's HLS init segments carry no edit list or user data, and its media
// segments are bare moof+mdat pairs, without the styp and sidx ffmpeg writes.
function stripToYoutubeHlsLayout(hlsDir: string, fragments: readonly string[]): void {
	const [init, ...segments] = fragments
	const rewrite = (name: string, drop: readonly string[]): void => {
		const file = path.join(hlsDir, name)
		fs.writeFileSync(file, dropBoxes(fs.readFileSync(file), drop))
	}
	rewrite(init, ['moov/udta', 'moov/trak/edts'])
	for (const segment of segments) rewrite(segment, ['styp', 'sidx'])
}

// The subtitles yt-dlp would have written next to the video: WebVTT is what
// YouTube serves, SRT what Arroxy converts to before muxing it itself.
const SUBTITLE_VTT = `WEBVTT

00:00:00.200 --> 00:00:00.900
First cue

00:00:01.000 --> 00:00:01.800
Second cue
`

const SUBTITLE_SRT = `1
00:00:00,200 --> 00:00:00,900
First cue

2
00:00:01,000 --> 00:00:01,800
Second cue
`

function run(ffmpeg: string, args: string[]): void {
	// SVT_LOG=1: errors only, instead of SVT-AV1's configuration banner.
	const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {stdio: ['ignore', 'inherit', 'inherit'], env: {...process.env, SVT_LOG: '1'}})
	if (result.status !== 0) throw new Error(`ffmpeg failed (${result.signal ?? `exit ${result.status}`}): ${args.join(' ')}`)
}

function generate(ffmpeg: string, dir: string): void {
	fs.rmSync(dir, {recursive: true, force: true})
	fs.mkdirSync(path.join(dir, path.dirname(HLS_PLAYLIST)), {recursive: true})
	for (const recipe of recipes(dir)) {
		run(ffmpeg, recipe.args)
		console.log(`wrote ${recipe.name}`)
	}
	const hlsDir = path.join(dir, path.dirname(HLS_PLAYLIST))
	const fragments = hlsFragmentOrder(fs.readFileSync(path.join(dir, HLS_PLAYLIST), 'utf8'))
	stripToYoutubeHlsLayout(hlsDir, fragments)
	fs.writeFileSync(path.join(dir, FIXTURE_FILES.vp9Hls), Buffer.concat(fragments.map(name => fs.readFileSync(path.join(hlsDir, name)))))
	console.log(`wrote ${FIXTURE_FILES.vp9Hls} from ${fragments.length} HLS fragments`)
	fs.writeFileSync(path.join(dir, FIXTURE_FILES.subtitleVtt), SUBTITLE_VTT)
	fs.writeFileSync(path.join(dir, FIXTURE_FILES.subtitleSrt), SUBTITLE_SRT)
}

function main(args: string[]): void {
	const flag = (name: string): string | undefined => {
		const index = args.indexOf(name)
		return index >= 0 ? args[index + 1] : undefined
	}
	const ffmpeg = flag('--ffmpeg')
	if (!ffmpeg) throw new Error('usage: bun scripts/ffmpeg-matrix/generate-fixtures.ts --ffmpeg <path> [--out <dir>]')
	generate(ffmpeg, path.resolve(flag('--out') ?? DEFAULT_FIXTURE_DIR))
}

if (isCliEntrypoint(import.meta)) {
	try {
		main(process.argv.slice(2))
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	}
}
