import type {DependencyId, WarmupProgressEvent} from '@shared/types.js'

// The setup splash's whole matrix: who is waiting, what downloads, and how far
// along it is. Each scenario plays a script, then leaves warmup running, so the
// splash holds that moment for review (the cancel link joins after a minute
// without progress, the slow-check hint after 35 s of checking).
const SETUP_AUDIENCES = ['new', 'returning'] as const
const SETUP_TOOLS = ['engine', 'media', 'both'] as const
const SETUP_MOMENTS = ['connecting', 'started', 'minutes', 'under-minute', 'unpacking', 'checking'] as const

type SetupAudience = (typeof SETUP_AUDIENCES)[number]
type SetupTools = (typeof SETUP_TOOLS)[number]
type SetupMoment = (typeof SETUP_MOMENTS)[number]
export type SetupScenarioId = `setup-${SetupAudience}-${SetupTools}-${SetupMoment}`

interface SetupScenario {
	id: SetupScenarioId
	audience: SetupAudience
	tools: SetupTools
	moment: SetupMoment
	title: string
	description: string
}

const AUDIENCE_TEXT: Record<SetupAudience, string> = {new: 'First launch', returning: 'Returning user'}
const TOOLS_TEXT: Record<SetupTools, string> = {engine: 'download engine', media: 'media tools', both: 'engine + media tools'}
const MOMENT_TEXT: Record<SetupMoment, string> = {connecting: 'connecting, no bytes yet', started: 'first bytes, no time estimate yet', minutes: 'minutes left', 'under-minute': 'under a minute left', unpacking: 'unpacking the media tools', checking: 'checking the tools'}

// Only the media tools come as an archive, so an engine-only run never unpacks.
export const SETUP_SCENARIOS: readonly SetupScenario[] = SETUP_AUDIENCES.flatMap(audience =>
	SETUP_TOOLS.flatMap(tools =>
		SETUP_MOMENTS.filter(moment => !(tools === 'engine' && moment === 'unpacking')).map((moment): SetupScenario => ({
			id: `setup-${audience}-${tools}-${moment}`,
			audience,
			tools,
			moment,
			title: `${AUDIENCE_TEXT[audience]}: ${TOOLS_TEXT[tools]}, ${MOMENT_TEXT[moment]}`,
			description: `${AUDIENCE_TEXT[audience]} downloading the ${TOOLS_TEXT[tools]}: ${MOMENT_TEXT[moment]}.`
		}))
	)
)

const SETUP_BY_ID = new Map<string, SetupScenario>(SETUP_SCENARIOS.map(scenario => [scenario.id, scenario]))

export function isSetupScenario(id: string): boolean {
	return SETUP_BY_ID.has(id)
}

export function isReturningSetupScenario(id: string): boolean {
	return SETUP_BY_ID.get(id)?.audience === 'returning'
}

export interface SetupScriptStep {
	delayMs: number
	event: WarmupProgressEvent
}

const LEAD_IN_MS = 1500
const MB = 1024 * 1024
const SIZE: Partial<Record<DependencyId, number>> = {'yt-dlp': 18 * MB, ffmpeg: 42 * MB}
// The FFmpeg package carries ffprobe, so only the ffmpeg row reports bytes.
const DOWNLOADS: Record<SetupTools, DependencyId[]> = {engine: ['yt-dlp'], media: ['ffmpeg'], both: ['yt-dlp', 'ffmpeg']}

// Every download moves from one share of its size to another, a step every
// 400 ms. The pace sets the time left the splash estimates from it.
function progress(binaries: DependencyId[], from: number, to: number, steps: number): SetupScriptStep[] {
	return Array.from({length: steps}, (_, index) =>
		binaries.map((binary, order): SetupScriptStep => {
			const size = SIZE[binary] ?? 0
			return {delayMs: order === 0 ? 400 : 0, event: {binary, phase: 'downloading', bytesDownloaded: Math.round(size * (from + ((to - from) * (index + 1)) / steps)), totalBytes: size}}
		})
	).flat()
}

function finished(binaries: DependencyId[]): SetupScriptStep[] {
	return [...progress(binaries, 0.9, 1, 2), ...binaries.filter(binary => binary !== 'ffmpeg').map((binary): SetupScriptStep => ({delayMs: 0, event: {binary, phase: 'done'}}))]
}

function momentSteps(moment: SetupMoment, binaries: DependencyId[]): SetupScriptStep[] {
	switch (moment) {
		case 'connecting':
			return binaries.map(binary => ({delayMs: 0, event: {binary, phase: 'downloading', bytesDownloaded: 0, totalBytes: SIZE[binary]}}))
		// Two steps span under the 3 s a time estimate needs.
		case 'started':
			return progress(binaries, 0.02, 0.06, 2)
		// The first step jumps from nothing to mid-way, one download at a time;
		// 24 steps (9.6 s) carry that jump out of the 8 s rate window, so the
		// estimate rests on the steady pace alone.
		case 'minutes':
			return progress(binaries, 0.25, 0.3, 24)
		case 'under-minute':
			return progress(binaries, 0.7, 0.85, 24)
		case 'unpacking':
			return [...finished(binaries), {delayMs: 0, event: {binary: 'ffmpeg', phase: 'extracting'}}]
		case 'checking': {
			const media = binaries.includes('ffmpeg')
			const unpacked: SetupScriptStep[] = media
				? [
						{delayMs: 0, event: {binary: 'ffmpeg', phase: 'done'}},
						{delayMs: 0, event: {binary: 'ffprobe', phase: 'done'}}
					]
				: []
			const probed: DependencyId = binaries.includes('yt-dlp') ? 'yt-dlp' : 'ffmpeg'
			return [...finished(binaries), ...unpacked, {delayMs: 0, event: {binary: probed, phase: 'probing', firstCheck: true}}]
		}
	}
}

export function buildSetupScript(scenario: {id: string}): SetupScriptStep[] | null {
	const setup = SETUP_BY_ID.get(scenario.id)
	if (!setup) return null
	const binaries = DOWNLOADS[setup.tools]
	const start: SetupScriptStep[] = binaries.includes('ffmpeg') ? [{delayMs: 0, event: {binary: 'ffprobe', phase: 'starting'}}] : []
	const [first, ...rest] = [...start, ...momentSteps(setup.moment, binaries)]
	// The plain splash shows first, as on a real launch, so the change into
	// the setup screen is there to review.
	return first ? [{...first, delayMs: first.delayMs + LEAD_IN_MS}, ...rest] : []
}
