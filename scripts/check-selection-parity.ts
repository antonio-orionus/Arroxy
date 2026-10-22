// The Format screen pre-selects streams with its own copy of yt-dlp's format
// sort (profileSelection.ts); Quick Download and the queue let yt-dlp itself
// pick from the same profile (mediaIntentSpec's -f and -S). This check runs
// both over every recorded probe (src/renderer/src/dev/probeSources) and a
// matrix of profiles, and fails on any pick they disagree on, so the copy
// cannot drift from yt-dlp unnoticed. It holds subtitle tracks to yt-dlp the
// same way: the tracks a job plans against the ones yt-dlp fetches for the
// run that job sends (scripts/selection-parity/subtitles.ts).
//
//   bun run check:selection-parity            # fail on any difference
//   bun run check:selection-parity --verbose  # also list the agreed cases
//
// yt-dlp is the pinned release below, its zipapp fetched once into
// node_modules/.cache and checked against the published SHA-256; it runs
// in-process under Python 3.10+ (scripts/selection-parity/oracle.py and
// subtitle_oracle.py, found by
// scripts/selection-parity/python.ts; `bun run doctor` reports it).

import {execFile} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {mkdir, rename, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {promisify} from 'node:util'
import {planWorkflow} from 'yt-dlp-bridge'
import {conversionSource} from '../src/shared/audioConversionSource.js'
import {AUDIO_CONVERT_TARGETS} from '../src/shared/audioTargets.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '../src/shared/downloadProfiles.js'
import {mediaIntentFromProfileMedia, mediaIntentSpec} from '../src/shared/mediaIntent.js'
import {resolveProfileSelection} from '../src/shared/profileSelection.js'
import {VIDEO_CODEC_PREFERENCES, type DownloadProfile, type DownloadProfileMedia, type HdrPreference, type NativeAudioPreference, type PlaylistVideoTier, type VideoCodecPreference, type VideoFileType, type VideoGoal} from '../src/shared/schemas.js'
import {videoCodecAllowed} from '../src/shared/selectionOrder.js'
import {findPython, PYTHON_REQUIREMENT} from './selection-parity/python.js'
import {CONSTRUCTED_PROBES} from './selection-parity/constructedProbes.js'
import {subtitleCases, subtitleDifference} from './selection-parity/subtitles.js'
import {mapFormats} from '../src/shared/ytdlp/formatMapping.js'
import {formatSelectionSource, type FormatSelectionSource, type YtDlpSelectableFormat} from '../src/shared/ytdlp/selectableFormat.js'
import type {FormatOption} from '../src/shared/types.js'
import {infoDictSchema} from 'yt-dlp-bridge/info'
import {probeSourceResult} from '../src/renderer/src/dev/probeSources/index.js'
import {resolveOutputContainer} from '../src/renderer/src/store/wizard/resolveContainer.js'
import {PROBE_SOURCES} from '../src/renderer/src/dev/probeSources/sources.js'

const YT_DLP = {version: '2026.08.19', sha256: '1fa6733c37ea6fb51c99ad8fe785e7b7e5f3246c9b980230329d4fb72ed8d4d6'}

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/arroxy-selection-parity')
const ORACLE = path.join(ROOT, 'scripts/selection-parity/oracle.py')
const SUBTITLE_ORACLE = path.join(ROOT, 'scripts/selection-parity/subtitle_oracle.py')
const run = promisify(execFile)

function sha256(bytes: Uint8Array): string {
	return createHash('sha256').update(bytes).digest('hex')
}

async function pinnedYtDlp(): Promise<string> {
	const file = path.join(CACHE_DIR, `yt-dlp-${YT_DLP.version}.zip`)
	if (existsSync(file) && sha256(readFileSync(file)) === YT_DLP.sha256) return file
	const response = await fetch(`https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP.version}/yt-dlp`)
	if (!response.ok) throw new Error(`could not fetch yt-dlp ${YT_DLP.version}: HTTP ${response.status}`)
	const bytes = new Uint8Array(await response.arrayBuffer())
	const actual = sha256(bytes)
	if (actual !== YT_DLP.sha256) throw new Error(`yt-dlp ${YT_DLP.version} has SHA-256 ${actual}, expected ${YT_DLP.sha256}`)
	await mkdir(CACHE_DIR, {recursive: true})
	await writeFile(`${file}.partial`, bytes)
	await rename(`${file}.partial`, file)
	return file
}

// The profiles every probe is checked against: each choice that changes which
// streams are picked, in every combination the profile editor allows.
interface ProfileCase {
	label: string
	media: DownloadProfileMedia
	nativeAudio: NativeAudioPreference
}

const GOALS: readonly VideoGoal[] = ['best-picture', 'smart-tv']
const TIERS: readonly PlaylistVideoTier[] = ['best', '1080', '720', '480']
const HDR: readonly HdrPreference[] = ['sdr', 'hdr']
const FILE_TYPES: readonly VideoFileType[] = ['auto', 'mp4', 'webm']
const NATIVE_AUDIO: readonly NativeAudioPreference[] = ['compatible', 'surround']
// No preference (yt-dlp's own codec order), then each one the editor offers.
const VIDEO_CODECS: readonly (VideoCodecPreference | undefined)[] = [undefined, ...VIDEO_CODEC_PREFERENCES]

function profileCases(): ProfileCase[] {
	const cases: ProfileCase[] = []
	for (const goal of GOALS)
		for (const tier of TIERS)
			for (const hdr of HDR)
				for (const fileType of FILE_TYPES) {
					if (goal === 'smart-tv' && (fileType === 'webm' || ['best', '2160', '1440'].includes(tier))) continue
					for (const aiUpscaled of ['skip', 'allow'] as const)
						for (const videoCodec of VIDEO_CODECS) {
							if (videoCodec !== undefined && !videoCodecAllowed(goal, fileType, videoCodec)) continue
							const video = {goal, tier, fileType, hdr: {kind: 'custom' as const, preference: hdr}, ...(aiUpscaled === 'allow' ? {aiUpscaled} : {}), ...(videoCodec ? {videoCodec} : {})}
							const label = `${goal} ${tier} ${fileType} ${hdr}${aiUpscaled === 'allow' ? ' +ai' : ''}${videoCodec ? ` ${videoCodec}-first` : ''}`
							cases.push({label: `${label} video-only`, media: {kind: 'video-only', ...video}, nativeAudio: 'compatible'})
							for (const nativeAudio of NATIVE_AUDIO) cases.push({label: `${label} ${nativeAudio}`, media: {kind: 'video-audio', ...video, audio: {native: {kind: 'default'}}}, nativeAudio})
						}
				}
	for (const nativeAudio of NATIVE_AUDIO) cases.push({label: `audio-only ${nativeAudio}`, media: {kind: 'audio-only', audio: {format: 'best'}}, nativeAudio})
	return cases
}

const BASE_PROFILE = BUILTIN_DOWNLOAD_PROFILES[0]
if (!BASE_PROFILE) throw new Error('no built-in profile to vary')

// A probe as the check reads it: what the app builds from it, and the info dict yt-dlp loads.
interface ParityProbe {
	id: string
	formats: FormatOption[]
	formatSelection: FormatSelectionSource
	isAudioOnlySource: boolean
	info: unknown
}

// The fixture's info dict as yt-dlp would load it: every format needs a URL to
// be chosen, and the fixtures keep none.
function withUrls(info: unknown, id: string): unknown {
	if (typeof info !== 'object' || info === null) throw new Error(`${id}: fixture has no info dict`)
	const {formats}: {formats?: unknown} = info
	return {...info, formats: (Array.isArray(formats) ? formats : []).map((format: unknown, index) => (typeof format === 'object' && format !== null ? {...format, url: `https://parity.invalid/${index}`} : format))}
}

const readFixture = (id: string): unknown => JSON.parse(readFileSync(path.join(ROOT, 'src/renderer/src/dev/probeSources', `${id}.json`), 'utf8'))

function recordedProbe(id: (typeof PROBE_SOURCES)[number]['id']): ParityProbe {
	const probe = probeSourceResult(id)
	if (!probe.formatSelection) throw new Error(`${id}: the probe carries no yt-dlp formats`)
	const fixture = readFixture(id)
	if (typeof fixture !== 'object' || fixture === null || !('info' in fixture)) throw new Error(`${id}: fixture has no info dict`)
	return {id, formats: probe.formats, formatSelection: probe.formatSelection, isAudioOnlySource: probe.isAudioOnlySource, info: withUrls(fixture.info, id)}
}

function constructedProbe(id: string, raw: unknown): ParityProbe {
	const info = infoDictSchema.parse(raw)
	if (info._type !== 'video') throw new Error(`${id}: a constructed probe must be a single video`)
	return {id, formats: mapFormats(info.formats ?? [], {durationSeconds: info.duration}), formatSelection: formatSelectionSource(info, undefined), isAudioOnlySource: false, info: withUrls(raw, id)}
}

// The app's pick in yt-dlp's format_id shape ("video+audio"), or null when the
// app picks nothing yt-dlp would name (subtitles), with the container the
// Format screen says the file saves as.
function appPick(probe: ParityProbe, profileCase: ProfileCase): {id: string; container: string} | null {
	const profile: DownloadProfile = {...BASE_PROFILE, media: profileCase.media}
	const {media} = resolveProfileSelection({profile, formats: probe.formats, selection: probe.formatSelection, subtitles: {}, automaticCaptions: {}, isAudioOnlySource: probe.isAudioOnlySource, nativeAudioPreference: profileCase.nativeAudio})
	// Keep as-is names the combined file whose audio it extracts, as yt-dlp's `-x` does.
	const audio = media.audioSelection.kind === 'native' || media.audioSelection.kind === 'extract' ? (media.audioSelection.formatId ?? null) : null
	// A conversion is an answer too: a native-audio profile must never convert where yt-dlp takes a stream as it is.
	const container = resolveOutputContainer(media.videoFormatId, media.audioSelection, 'sidecar', probe.formats, media.kind, false, 'auto')
	if (media.kind === 'audio') return {id: audio ?? 'converted', container}
	if (media.kind !== 'video' || media.videoFormatId === '') return null
	return {id: audio === null ? media.videoFormatId : `${media.videoFormatId}+${audio}`, container}
}

interface Case {
	probe: string
	label: string
	format: string
	sort?: string
	expected: string
	// The container yt-dlp's result should carry, where no --merge-output-format
	// or remux applies (a Best picture profile with no file type).
	expectedExt?: string
}

// Differences already known to be bugs, each with its fix under way. Listed so
// the check stays a gate for everything else; an entry that no longer occurs
// fails it too, so the list shrinks as the fixes land.
const KNOWN_DIFFERENCES: readonly {probe: string; label: string; reason: string}[] = []

const isKnown = (testCase: {probe: string; label: string}): boolean => KNOWN_DIFFERENCES.some(known => known.probe === testCase.probe && known.label === testCase.label)

const verbose = process.argv.includes('--verbose')
const probes: readonly ParityProbe[] = [...PROBE_SOURCES.map(source => recordedProbe(source.id)), ...Object.entries(CONSTRUCTED_PROBES).map(([id, constructed]) => constructedProbe(id, constructed.info))]
const probeById = new Map(probes.map(probe => [probe.id, probe]))
const cases: Case[] = []
for (const parityProbe of probes) {
	const probe = parityProbe.id
	for (const profileCase of profileCases()) {
		const app = appPick(parityProbe, profileCase)
		if (app === null) continue
		const media = profileCase.media
		const comparesContainer = (media.kind === 'video-audio' || media.kind === 'video-only') && media.goal === 'best-picture' && media.fileType === 'auto'
		// The profile carries its own HDR choice, so the app setting passed here never applies.
		const intent = mediaIntentFromProfileMedia(profileCase.media)
		if (intent === null) continue
		const spec = mediaIntentSpec(intent, profileCase.nativeAudio, 'sdr')
		if (!spec.formatSelector) continue
		cases.push({probe, label: profileCase.label, format: spec.formatSelector, ...(spec.formatSort ? {sort: spec.formatSort} : {}), expected: app.id, ...(comparesContainer ? {expectedExt: app.container} : {})})
	}
}

// The bridge's `-f` for a conversion that names no stream.
function conversionSelector(target: string): string {
	const {args} = planWorkflow({kind: 'media', url: 'https://parity.invalid/', output: {directory: '/out'}, audio: {convert: {target, lossy: target !== 'wav', bitrateKbps: 192}}})
	const selector = args[args.indexOf('-f') + 1]
	if (selector === undefined) throw new Error(`no -f planned for a ${target} conversion`)
	return selector
}

// Conversions: the stream the app says a conversion starts from (its copy
// labels and notes, a language's source) against the bridge's own selector,
// which yt-dlp runs. The app runs the same selector through its port.
for (const {id: probe, formatSelection: selection} of probes) {
	for (const {target} of AUDIO_CONVERT_TARGETS) {
		const predicted = conversionSource(selection, target)
		if (predicted) cases.push({probe, label: `convert ${target}`, format: conversionSelector(target), expected: predicted.formatId})
	}
}

const ytDlp = await pinnedYtDlp()
const request = JSON.stringify({probes: Object.fromEntries(probes.map(probe => [probe.id, probe.info])), cases: cases.map(({probe, format, sort}) => ({probe, format, sort}))})
const python = await findPython()
if (python === null) throw new Error(`check:selection-parity needs ${PYTHON_REQUIREMENT}. Install it, then run the check again.`)
const child = run(python.command, [...python.args, ORACLE, ytDlp], {maxBuffer: 64 * 1024 * 1024})
child.child.stdin?.end(request)
const subtitles = subtitleCases(PROBE_SOURCES.map(source => ({id: source.id, fixture: readFixture(source.id)})))
const subtitleChild = run(python.command, [...python.args, SUBTITLE_ORACLE, ytDlp], {maxBuffer: 64 * 1024 * 1024})
subtitleChild.child.stdin?.end(JSON.stringify({videos: subtitles.videos, cases: subtitles.cases.map(({video, argv}) => ({video, argv}))}))
const [{stdout}, {stdout: subtitleStdout}] = await Promise.all([child, subtitleChild])
const picks: unknown = JSON.parse(stdout)
if (!Array.isArray(picks) || picks.length !== cases.length) throw new Error('the oracle returned a different number of picks than cases')
const subtitleAnswers: unknown = JSON.parse(subtitleStdout)
if (!Array.isArray(subtitleAnswers) || subtitleAnswers.length !== subtitles.cases.length) throw new Error('the subtitle oracle returned a different number of answers than cases')
const subtitleDifferences = subtitles.cases.flatMap((testCase, index) => subtitleDifference(testCase, subtitleAnswers[index]) ?? [])

const known = new Set<string>()
// One oracle answer: yt-dlp's format_id and the extension of its result, or nothing picked.
function oracleAnswer(raw: unknown): {id: string; ext: string | null} | null {
	if (typeof raw !== 'object' || raw === null || !('id' in raw) || typeof raw.id !== 'string') return null
	return {id: raw.id, ext: 'ext' in raw && typeof raw.ext === 'string' ? raw.ext : null}
}

const differences = cases.flatMap((testCase, index) => {
	const answer = oracleAnswer(picks[index])
	const same = answer?.id === testCase.expected && (testCase.expectedExt === undefined || answer.ext === testCase.expectedExt)
	if (!same && isKnown(testCase)) {
		known.add(`${testCase.probe} · ${testCase.label}`)
		return []
	}
	const app = `${testCase.expected}${testCase.expectedExt ? ` (${testCase.expectedExt})` : ''}`
	const ytDlp = answer ? `${answer.id}${testCase.expectedExt ? ` (${answer.ext ?? '?'})` : ''}` : 'null'
	return same ? [] : [`${testCase.probe} · ${testCase.label}: app ${app}, yt-dlp ${ytDlp}  (-f ${testCase.format}${testCase.sort ? ` -S ${testCase.sort}` : ''})`]
})
// Smart TV's intent, held to yt-dlp's own pick: H.264 wherever the site offers
// a copy it doesn't mark down (DAMAGED, watermarked); otherwise yt-dlp's own order, where a constructed probe names the pick
// (a stream that names no codec once won there at any height).
const isH264 = (format: YtDlpSelectableFormat): boolean => /^(?:[hx]264|avc)/i.test(format.vcodec ?? '')
const isMarkedDown = (format: YtDlpSelectableFormat): boolean => /\b(?:damaged|watermarked)\b/i.test(format.format_note ?? '')
function smartTvMiss(testCase: Case, answerId: string): string | null {
	const tier = testCase.label.split(' ')[1]
	const wanted = Object.entries(CONSTRUCTED_PROBES[testCase.probe]?.smartTv ?? {}).find(([height]) => height === tier)?.[1]
	if (wanted !== undefined) return answerId === wanted ? null : `took ${answerId}, not ${wanted}`
	const videos = (probeById.get(testCase.probe)?.formatSelection.formats ?? []).filter(format => format.vcodec !== 'none')
	const picked = answerId
		.split('+')
		.map(id => videos.find(format => format.format_id === id))
		.find(format => format !== undefined)
	return picked && videos.some(format => isH264(format) && !isMarkedDown(format)) && !isH264(picked) ? `took ${picked.format_id} (${picked.vcodec ?? 'no codec'}) though the site offers H.264` : null
}
const smartTvMisses = cases.flatMap((testCase, index) => {
	const answer = oracleAnswer(picks[index])
	const miss = testCase.label.startsWith('smart-tv') && answer ? smartTvMiss(testCase, answer.id) : null
	return miss ? [`${testCase.probe} · ${testCase.label}: ${miss}`] : []
})
if (verbose) for (const testCase of cases) console.log(`${testCase.probe} · ${testCase.label}: ${testCase.expected}`)
if (verbose) for (const testCase of subtitles.cases) console.log(`${testCase.video} · ${testCase.label}: ${Object.keys(testCase.expected).join(', ')}`)
console.log(`selection parity: ${cases.length} cases over ${probes.length} probes, yt-dlp ${YT_DLP.version}; ${differences.length} differ`)
for (const difference of differences) console.log(`  ${difference}`)
const stale = KNOWN_DIFFERENCES.filter(entry => !known.has(`${entry.probe} · ${entry.label}`))
if (known.size > 0) console.log(`  ${known.size} known (${[...new Set(KNOWN_DIFFERENCES.map(entry => entry.reason))].join('; ')})`)
for (const entry of stale) console.log(`  no longer differs, remove it from KNOWN_DIFFERENCES: ${entry.probe} · ${entry.label}`)
console.log(`smart tv intent: ${smartTvMisses.length} misses`)
for (const miss of smartTvMisses) console.log(`  ${miss}`)
console.log(`subtitle tracks: ${subtitles.cases.length} cases over ${Object.keys(subtitles.videos).length} videos; ${subtitleDifferences.length} differ`)
for (const difference of subtitleDifferences) console.log(`  ${difference}`)
if (differences.length > 0 || stale.length > 0 || smartTvMisses.length > 0 || subtitleDifferences.length > 0) process.exitCode = 1
