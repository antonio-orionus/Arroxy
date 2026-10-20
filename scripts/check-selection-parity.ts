// The Format screen pre-selects streams with its own copy of yt-dlp's format
// sort (profileSelection.ts); Quick Download and the queue let yt-dlp itself
// pick from the same profile (mediaIntentSpec's -f and -S). This check runs
// both over every recorded probe (src/renderer/src/dev/probeSources) and a
// matrix of profiles, and fails on any pick they disagree on, so the copy
// cannot drift from yt-dlp unnoticed.
//
//   bun run check:selection-parity            # fail on any difference
//   bun run check:selection-parity --verbose  # also list the agreed cases
//
// yt-dlp is the pinned release below, its zipapp fetched once into
// node_modules/.cache and checked against the published SHA-256; it runs
// in-process under Python 3.10+ (scripts/selection-parity/oracle.py, found by
// scripts/selection-parity/python.ts; `bun run doctor` reports it).

import {execFile} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {mkdir, rename, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {promisify} from 'node:util'
import {BUILTIN_DOWNLOAD_PROFILES} from '../src/shared/downloadProfiles.js'
import {mediaIntentFromProfileMedia, mediaIntentSpec} from '../src/shared/mediaIntent.js'
import {resolveProfileSelection} from '../src/shared/profileSelection.js'
import {VIDEO_CODEC_PREFERENCES, type DownloadProfile, type DownloadProfileMedia, type HdrPreference, type NativeAudioPreference, type PlaylistVideoTier, type VideoCodecPreference, type VideoFileType, type VideoGoal} from '../src/shared/schemas.js'
import {videoCodecAllowed} from '../src/shared/selectionOrder.js'
import {findPython, PYTHON_REQUIREMENT} from './selection-parity/python.js'
import {probeSourceResult} from '../src/renderer/src/dev/probeSources/index.js'
import {resolveOutputContainer} from '../src/renderer/src/store/wizard/resolveContainer.js'
import {PROBE_SOURCES, type ProbeSourceId} from '../src/renderer/src/dev/probeSources/sources.js'

const YT_DLP = {version: '2026.08.19', sha256: '1fa6733c37ea6fb51c99ad8fe785e7b7e5f3246c9b980230329d4fb72ed8d4d6'}

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/arroxy-selection-parity')
const ORACLE = path.join(ROOT, 'scripts/selection-parity/oracle.py')
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

// The app's pick in yt-dlp's format_id shape ("video+audio"), or null when the
// app picks nothing yt-dlp would name (subtitles), with the container the
// Format screen says the file saves as.
function appPick(probeId: ProbeSourceId, profileCase: ProfileCase): {id: string; container: string} | null {
	const probe = probeSourceResult(probeId)
	const profile: DownloadProfile = {...BASE_PROFILE, media: profileCase.media}
	if (!probe.formatSelection) throw new Error(`${probeId}: the probe carries no yt-dlp formats`)
	const {media} = resolveProfileSelection({profile, formats: probe.formats, selection: probe.formatSelection, subtitles: {}, automaticCaptions: {}, isAudioOnlySource: probe.isAudioOnlySource, nativeAudioPreference: profileCase.nativeAudio})
	const audio = media.audioSelection.kind === 'native' ? media.audioSelection.formatId : null
	// A conversion is an answer too: a native-audio profile must never convert where yt-dlp takes a stream as it is.
	const container = resolveOutputContainer(media.videoFormatId, media.audioSelection, 'sidecar', probe.formats, media.kind, false, 'auto')
	if (media.kind === 'audio') return {id: audio ?? 'converted', container}
	if (media.kind !== 'video' || media.videoFormatId === '') return null
	return {id: audio === null ? media.videoFormatId : `${media.videoFormatId}+${audio}`, container}
}

// The fixture's info dict as yt-dlp would load it: every format needs a URL to
// be chosen, and the fixtures keep none.
function oracleInfo(probeId: ProbeSourceId): unknown {
	const fixture: unknown = JSON.parse(readFileSync(path.join(ROOT, 'src/renderer/src/dev/probeSources', `${probeId}.json`), 'utf8'))
	if (typeof fixture !== 'object' || fixture === null || !('info' in fixture) || typeof fixture.info !== 'object' || fixture.info === null) throw new Error(`${probeId}: fixture has no info dict`)
	const info: {formats?: unknown} = fixture.info
	const formats = Array.isArray(info.formats) ? info.formats : []
	return {...info, formats: formats.map((format: unknown, index) => (typeof format === 'object' && format !== null ? {...format, url: `https://parity.invalid/${index}`} : format))}
}

interface Case {
	probe: ProbeSourceId
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
const KNOWN_DIFFERENCES: readonly {probe: ProbeSourceId; label: string; reason: string}[] = (['twitch-clip', 'dailymotion', 'archive', 'streamable', 'bitchute'] as const).flatMap(probe =>
	(['audio-only compatible', 'audio-only surround'] as const).map(label => ({probe, label, reason: 'Audio only on a site with only combined files: yt-dlp downloads the whole file (`best`), the Format screen converts it to MP3'}))
)

const isKnown = (testCase: {probe: ProbeSourceId; label: string}): boolean => KNOWN_DIFFERENCES.some(known => known.probe === testCase.probe && known.label === testCase.label)

const verbose = process.argv.includes('--verbose')
const probeIds: readonly ProbeSourceId[] = PROBE_SOURCES.map(source => source.id)
const cases: Case[] = []
for (const probe of probeIds) {
	for (const profileCase of profileCases()) {
		const app = appPick(probe, profileCase)
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

const ytDlp = await pinnedYtDlp()
const request = JSON.stringify({probes: Object.fromEntries(probeIds.map(id => [id, oracleInfo(id)])), cases: cases.map(({probe, format, sort}) => ({probe, format, sort}))})
const python = await findPython()
if (python === null) throw new Error(`check:selection-parity needs ${PYTHON_REQUIREMENT}. Install it, then run the check again.`)
const child = run(python.command, [...python.args, ORACLE, ytDlp], {maxBuffer: 64 * 1024 * 1024})
child.child.stdin?.end(request)
const {stdout} = await child
const picks: unknown = JSON.parse(stdout)
if (!Array.isArray(picks) || picks.length !== cases.length) throw new Error('the oracle returned a different number of picks than cases')

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
if (verbose) for (const testCase of cases) console.log(`${testCase.probe} · ${testCase.label}: ${testCase.expected}`)
console.log(`selection parity: ${cases.length} cases over ${probeIds.length} probes, yt-dlp ${YT_DLP.version}; ${differences.length} differ`)
for (const difference of differences) console.log(`  ${difference}`)
const stale = KNOWN_DIFFERENCES.filter(entry => !known.has(`${entry.probe} · ${entry.label}`))
if (known.size > 0) console.log(`  ${known.size} known (${[...new Set(KNOWN_DIFFERENCES.map(entry => entry.reason))].join('; ')})`)
for (const entry of stale) console.log(`  no longer differs, remove it from KNOWN_DIFFERENCES: ${entry.probe} · ${entry.label}`)
if (differences.length > 0 || stale.length > 0) process.exitCode = 1
