// ffprobe oracle for Fixture Product E2E: what streams actually landed in a
// saved file. Uses the build-time embedded ffprobe so the check matches the
// ffmpeg build Arroxy ships.
import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export interface ProbedStream {
	codecType: string
	codecName: string
	language: string | undefined
	title: string | undefined
	mimetype: string | undefined
	attachedPic: boolean
}

function bundledFfprobePath(): string {
	const ext = process.platform === 'win32' ? '.exe' : ''
	const arch = process.arch === 'arm64' ? 'arm64' : 'x64'
	const bundled = path.join(process.cwd(), 'build', 'embedded', `${process.platform}-${arch}`, `ffprobe${ext}`)
	return fs.existsSync(bundled) ? bundled : 'ffprobe'
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(record: Record<string, unknown> | undefined, key: string): string | undefined {
	const value = record?.[key]
	return typeof value === 'string' ? value : undefined
}

function parseStream(raw: unknown): ProbedStream {
	if (!isRecord(raw)) throw new Error(`unexpected ffprobe stream: ${JSON.stringify(raw)}`)
	const tags = isRecord(raw.tags) ? raw.tags : undefined
	const disposition = isRecord(raw.disposition) ? raw.disposition : undefined
	return {
		codecType: optionalString(raw, 'codec_type') ?? '',
		codecName: optionalString(raw, 'codec_name') ?? '',
		language: optionalString(tags, 'language'),
		title: optionalString(tags, 'title'),
		// Matroska attachments carry the MIME type as an upper- or lower-case tag.
		mimetype: optionalString(tags, 'mimetype') ?? optionalString(tags, 'MIMETYPE'),
		attachedPic: disposition?.attached_pic === 1
	}
}

export function probeStreams(file: string): ProbedStream[] {
	const ffprobe = bundledFfprobePath()
	const dir = path.dirname(ffprobe)
	// Same rule as the app's ffmpeg spawns: only Linux builds ship shared libs.
	const env: NodeJS.ProcessEnv = {...process.env}
	if (process.platform === 'linux') env.LD_LIBRARY_PATH = `${dir}${path.delimiter}${process.env.LD_LIBRARY_PATH ?? ''}`
	const out = execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name:stream_tags:stream_disposition=attached_pic', '-of', 'json', file], {env, encoding: 'utf8'})
	const parsed: unknown = JSON.parse(out)
	if (!isRecord(parsed) || !Array.isArray(parsed.streams)) throw new Error(`unexpected ffprobe output: ${out}`)
	return parsed.streams.map(parseStream)
}

export interface ProbedChapter {
	startSeconds: number
	endSeconds: number
	title: string | undefined
}

export interface ProbedContainer {
	durationSeconds: number
	chapters: ProbedChapter[]
}

function seconds(record: Record<string, unknown>, key: string): number {
	const value = Number(record[key])
	if (!Number.isFinite(value)) throw new Error(`unexpected ffprobe ${key}: ${JSON.stringify(record[key])}`)
	return value
}

function parseChapter(raw: unknown): ProbedChapter {
	if (!isRecord(raw)) throw new Error(`unexpected ffprobe chapter: ${JSON.stringify(raw)}`)
	return {startSeconds: seconds(raw, 'start_time'), endSeconds: seconds(raw, 'end_time'), title: optionalString(isRecord(raw.tags) ? raw.tags : undefined, 'title')}
}

/** The file's length and the chapters embedded in it. */
export function probeContainer(file: string): ProbedContainer {
	const ffprobe = bundledFfprobePath()
	const dir = path.dirname(ffprobe)
	const env: NodeJS.ProcessEnv = {...process.env}
	if (process.platform === 'linux') env.LD_LIBRARY_PATH = `${dir}${path.delimiter}${process.env.LD_LIBRARY_PATH ?? ''}`
	const out = execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-show_chapters', '-of', 'json', file], {env, encoding: 'utf8'})
	const parsed: unknown = JSON.parse(out)
	if (!isRecord(parsed) || !isRecord(parsed.format)) throw new Error(`unexpected ffprobe output: ${out}`)
	const chapters = Array.isArray(parsed.chapters) ? parsed.chapters.map(parseChapter) : []
	return {durationSeconds: seconds(parsed.format, 'duration'), chapters}
}
