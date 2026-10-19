// How a remux matrix case ended, and the report of a whole run. Pure.
import {z} from 'zod'
import type {Expectation} from './remuxMatrix.js'

export interface ProcessEnd {
	code: number | null
	signal: string | null
	timedOut: boolean
	spawnError?: string
}

export type ProcessFailure = {kind: 'exit'; code: number} | {kind: 'signal'; signal: string} | {kind: 'crash'; status: string} | {kind: 'timeout'} | {kind: 'spawn'; message: string}

// Windows reports a crash as the NTSTATUS exception code in the exit code.
const NTSTATUS_NAMES: ReadonlyMap<number, string> = new Map([
	[0xc0000005, 'STATUS_ACCESS_VIOLATION'],
	[0xc000001d, 'STATUS_ILLEGAL_INSTRUCTION'],
	[0xc0000094, 'STATUS_INTEGER_DIVIDE_BY_ZERO'],
	[0xc00000fd, 'STATUS_STACK_OVERFLOW'],
	[0xc0000135, 'STATUS_DLL_NOT_FOUND'],
	[0xc0000139, 'STATUS_ENTRYPOINT_NOT_FOUND'],
	[0xc0000374, 'STATUS_HEAP_CORRUPTION'],
	[0xc0000409, 'STATUS_STACK_BUFFER_OVERRUN']
])

// undefined when the process exited 0.
export function classifyProcessEnd(end: ProcessEnd): ProcessFailure | undefined {
	if (end.spawnError !== undefined) return {kind: 'spawn', message: end.spawnError}
	if (end.timedOut) return {kind: 'timeout'}
	if (end.signal) return {kind: 'signal', signal: end.signal}
	if (end.code === null) return {kind: 'spawn', message: 'no exit code or signal'}
	if (end.code === 0) return undefined
	// Node gives the code unsigned, other runtimes signed: normalize to unsigned.
	const unsigned = end.code >>> 0
	if (unsigned >= 0xc0000000) return {kind: 'crash', status: `0x${unsigned.toString(16).toUpperCase().padStart(8, '0')}${NTSTATUS_NAMES.has(unsigned) ? ` ${NTSTATUS_NAMES.get(unsigned)}` : ''}`}
	return {kind: 'exit', code: end.code}
}

export function describeFailure(failure: ProcessFailure): string {
	switch (failure.kind) {
		case 'exit':
			return `exit code ${failure.code}`
		case 'signal':
			return `signal ${failure.signal}`
		case 'crash':
			return `crash ${failure.status}`
		case 'timeout':
			return 'timed out'
		case 'spawn':
			return `could not run: ${failure.message}`
	}
}

const tagsSchema = z.record(z.string(), z.string()).optional()

const probeSchema = z.object({
	streams: z.array(z.object({codec_type: z.string().optional(), codec_name: z.string().optional(), disposition: z.object({attached_pic: z.number().optional()}).optional(), tags: tagsSchema})),
	format: z.object({duration: z.string().optional(), tags: tagsSchema}),
	chapters: z.array(z.unknown()).optional()
})

type ProbeTags = z.infer<typeof tagsSchema>

function tag(tags: ProbeTags, name: string): string | undefined {
	if (!tags) return undefined
	return Object.entries(tags).find(([key]) => key.toLowerCase() === name)?.[1]
}

// Problems with an output, judged from its `ffprobe -of json` report; empty
// when it holds what the case should have written.
export function verifyProbe(expectation: Expectation, probeJson: string): string[] {
	let raw: unknown
	try {
		raw = JSON.parse(probeJson)
	} catch {
		return ['ffprobe printed no JSON']
	}
	const parsed = probeSchema.safeParse(raw)
	if (!parsed.success) return [`unexpected ffprobe JSON: ${parsed.error.issues[0]?.message ?? 'invalid'}`]
	const {streams, format, chapters} = parsed.data
	if (expectation.kind === 'image') return streams.length === 1 && streams[0].codec_name === 'mjpeg' ? [] : [`expected one mjpeg image, got ${streams.map(stream => stream.codec_name).join(', ') || 'nothing'}`]

	const problems: string[] = []
	const covers = streams.filter(stream => stream.disposition?.attached_pic === 1)
	const videos = streams.filter(stream => stream.codec_type === 'video' && stream.disposition?.attached_pic !== 1)
	const audios = streams.filter(stream => stream.codec_type === 'audio')
	const subtitles = streams.filter(stream => stream.codec_type === 'subtitle')
	if (videos.length !== 1 || videos[0].codec_name !== expectation.video) problems.push(`expected one ${expectation.video} video stream, got ${videos.map(stream => stream.codec_name).join(', ') || 'none'}`)
	if (audios.length !== 1 || audios[0].codec_name !== expectation.audio) problems.push(`expected one ${expectation.audio} audio stream, got ${audios.map(stream => stream.codec_name).join(', ') || 'none'}`)
	const duration = Number(format.duration)
	const [min, max] = expectation.duration
	if (!Number.isFinite(duration) || duration < min || duration > max) problems.push(`duration ${format.duration ?? 'missing'} s, expected ${min}-${max} s`)
	if (expectation.title !== undefined && tag(format.tags, 'title') !== expectation.title) problems.push(`title ${JSON.stringify(tag(format.tags, 'title') ?? null)}, expected ${JSON.stringify(expectation.title)}`)
	if (expectation.chapters !== undefined && (chapters?.length ?? 0) !== expectation.chapters) problems.push(`${chapters?.length ?? 0} chapters, expected ${expectation.chapters}`)
	if (expectation.subtitle) {
		const {codec, language} = expectation.subtitle
		if (subtitles.length !== 1 || subtitles[0].codec_name !== codec || tag(subtitles[0].tags, 'language') !== language) {
			problems.push(`expected one ${codec} subtitle in ${language}, got ${subtitles.map(stream => `${stream.codec_name ?? '?'} (${tag(stream.tags, 'language') ?? 'no language'})`).join(', ') || 'none'}`)
		}
	} else if (subtitles.length > 0) {
		problems.push(`unexpected subtitle streams: ${subtitles.map(stream => stream.codec_name).join(', ')}`)
	}
	if (expectation.coverArt && !covers.some(stream => stream.codec_name === 'mjpeg')) problems.push('no mjpeg cover art')
	if (!expectation.coverArt && covers.length > 0) problems.push('unexpected cover art')
	return problems
}

export type CaseResult = {id: string; status: 'pass'} | {id: string; status: 'fail'; stage: 'ffmpeg' | 'ffprobe' | 'output' | 'decode'; detail: string; log?: string} | {id: string; status: 'blocked'; by: string}

export function resultLabel(result: CaseResult): string {
	switch (result.status) {
		case 'pass':
			return 'pass'
		case 'fail':
			return `failed in ${result.stage}: ${result.detail}`
		case 'blocked':
			return `blocked by ${result.by}`
	}
}

export function summarize(results: readonly CaseResult[]): {pass: number; fail: number; blocked: number} {
	return {pass: results.filter(result => result.status === 'pass').length, fail: results.filter(result => result.status === 'fail').length, blocked: results.filter(result => result.status === 'blocked').length}
}

function tableCell(text: string): string {
	return text.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

// Markdown: failures first, then every case, for the job summary.
export function formatReport(title: string, results: readonly CaseResult[]): string {
	const {pass, fail, blocked} = summarize(results)
	const lines = [`## ${title}`, '', `${fail === 0 && blocked === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed, ${blocked} blocked`, '']
	const failed = results.filter(result => result.status === 'fail')
	if (failed.length > 0) {
		lines.push('### Failures', '')
		for (const result of failed) {
			lines.push(`- \`${result.id}\`: ${tableCell(resultLabel(result))}`)
			if (result.log) lines.push('', '  ```', ...result.log.split('\n').map(line => `  ${line}`), '  ```')
		}
		lines.push('')
	}
	lines.push('| Case | Result |', '| --- | --- |', ...results.map(result => `| \`${result.id}\` | ${tableCell(resultLabel(result))} |`), '')
	return lines.join('\n')
}
