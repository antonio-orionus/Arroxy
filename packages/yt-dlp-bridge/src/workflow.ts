import type {z} from 'zod'
import {CONFIG, type ServerConfig} from './config.js'
import {resolveManagedPath, resolveOutputPolicy, type OutputPolicyInput, type ResolvedOutputPolicy} from './filesystem.js'
import {redactArgs} from './redaction.js'
import {type InspectWorkflowKind, type ProbePlaylistMode, type SubtitleFormat, type SubtitleMode, type WorkflowDownloadInputSchema, type WorkflowExpertInputSchema, type WorkflowInspectInputSchema, type WorkflowPostprocessInputSchema} from './schemas.js'
import type {DetectedDependency} from './types.js'

export type {InspectWorkflowKind, ProbePlaylistMode, SubtitleFormat, SubtitleMode}

export interface NetworkPacing {
	sleepRequests?: number
	sleepInterval?: number
	maxSleepInterval?: number
	sleepSubtitles?: number
	concurrentFragments?: number
}

export interface DownloadRetryPolicy {
	retries: number
	fragmentRetries: number
	retrySleep: string
}

export interface AudioConvert {
	target: string
	lossy: boolean
	bitrateKbps?: number
}

export interface PlaylistScope {
	items: {kind: 'app-limit'} | {kind: 'first'; count: number} | {kind: 'range'; from: number; to: number}
}

export interface PlaylistScopePlan {
	requestedCount: number
	sentinel: boolean
	ytDlpFlag: '--playlist-end' | '--playlist-items'
	ytDlpValue: string
}

export interface SponsorBlockPlan {
	mode: 'mark' | 'remove'
	categories: string[]
}

export interface CallerOutput {
	directory: string
	template?: string
	tempDirectory?: string
	subtitleMode?: SubtitleMode
}

export interface ProbeWorkflowInput {
	kind: 'probe'
	url: string
	selection?: {playlistMode?: ProbePlaylistMode; playlistScope?: PlaylistScope}
	extractor?: {youtube?: {playerClient?: string[]}}
}

export interface CallerMediaWorkflowInput {
	kind: 'media'
	url: string
	output: CallerOutput
	selection?: {formatId?: string; formatSelector?: string; formatSort?: string; mergeOutputFormat?: string; skipDownload?: boolean}
	audio?: {convert?: AudioConvert}
	subtitles?: {embed?: boolean; languages: string[]; writeAuto?: boolean}
	sponsorBlock?: SponsorBlockPlan
	extractor?: {youtube?: {playerClient?: string[]}}
	embed?: {chapters?: boolean; metadata?: boolean; thumbnail?: boolean; description?: boolean; thumbnailSidecar?: boolean}
	resume?: {loadInfoJsonPath?: string; writeInfoJson?: boolean; infoJsonBaseName?: string}
}

export interface CallerSubtitlesWorkflowInput {
	kind: 'subtitles'
	url: string
	output: CallerOutput
	subtitles: {languages: string[]; format: SubtitleFormat; writeAuto?: boolean}
}

type ManagedDownloadWorkflowInput = z.input<typeof WorkflowDownloadInputSchema>
type ManagedInspectWorkflowInput = z.input<typeof WorkflowInspectInputSchema>
type NormalizedInspectInput = z.infer<typeof WorkflowInspectInputSchema>
type ManagedPostprocessWorkflowInput = z.input<typeof WorkflowPostprocessInputSchema>
type ExpertWorkflowInput = z.input<typeof WorkflowExpertInputSchema>

export type WorkflowInput = ProbeWorkflowInput | CallerMediaWorkflowInput | CallerSubtitlesWorkflowInput | ManagedDownloadWorkflowInput | ManagedInspectWorkflowInput | ManagedPostprocessWorkflowInput | ExpertWorkflowInput

export interface PluginPlanningOptions {
	mode: 'native' | 'disabled' | 'explicit'
	dirs?: string[]
}

export interface WorkflowPlanOptions {
	config?: ServerConfig
	detectedDependencies?: DetectedDependency[]
	pacing?: NetworkPacing
	playlistProbeLimit?: number
	downloadRetryPolicy?: DownloadRetryPolicy
	configFiles?: {mode: 'native' | 'disabled'}
	plugins?: PluginPlanningOptions
}

export interface WorkflowOutputFacts {
	directory?: string
	tempDirectory?: string
	outputRoot?: string
	tempRoot?: string
	template?: string
	allowOverwrite?: boolean
}

export interface WorkflowDependencyFacts {
	required: DetectedDependency[]
	optional: DetectedDependency[]
}

export interface WorkflowPlanFacts {
	isMediaDownload: boolean
	output?: WorkflowOutputFacts
	playlistScope?: PlaylistScopePlan
	effectiveSubtitleFormat?: SubtitleFormat
	dependencies: WorkflowDependencyFacts
	risks: string[]
	sideEffects: string[]
}

export interface WorkflowPlan {
	kind: NonNullable<WorkflowInput['kind']>
	args: string[]
	redactedArgs: string[]
	facts: WorkflowPlanFacts
}

export const DEFAULT_PLAYLIST_PROBE_LIMIT = 100
export const DEFAULT_DOWNLOAD_RETRY_POLICY: DownloadRetryPolicy = {retries: 20, fragmentRetries: 20, retrySleep: 'fragment:exp=1:20'}
export const DEFAULT_SLEEP_SUBTITLES_SECONDS = 3
export const EMBED_SUBTITLE_CONTAINER_EXT = 'mkv'

const DEFAULT_CALLER_OUTPUT_TEMPLATE = '%(title).200B.%(ext)s'

export function planWorkflow(input: WorkflowInput, options: WorkflowPlanOptions = {}): WorkflowPlan {
	const plan = planWorkflowWithoutRedaction(input, options)
	return {...plan, redactedArgs: redactArgs(plan.args)}
}

function planWorkflowWithoutRedaction(input: WorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const kind = input.kind ?? 'media'
	switch (kind) {
		case 'probe':
			return planProbeWorkflow(input as ProbeWorkflowInput, options)
		case 'inspect':
			return planInspectWorkflow(input as ManagedInspectWorkflowInput, options)
		case 'media':
			return hasCallerOutput(input) ? planCallerMediaWorkflow(input as CallerMediaWorkflowInput, options) : planManagedDownloadWorkflow(input as ManagedDownloadWorkflowInput, options)
		case 'subtitles':
			return hasCallerOutput(input) ? planCallerSubtitlesWorkflow(input as CallerSubtitlesWorkflowInput, options) : planManagedDownloadWorkflow(input as ManagedDownloadWorkflowInput, options)
		case 'audio':
		case 'thumbnail':
		case 'playlist':
			return planManagedDownloadWorkflow(input as ManagedDownloadWorkflowInput, options)
		case 'postprocess':
			return planPostprocessWorkflow(input as ManagedPostprocessWorkflowInput, options)
		case 'expert':
			return planExpertWorkflow(input as ExpertWorkflowInput, options)
		default:
			return unreachable(kind)
	}
}

function planProbeWorkflow(input: ProbeWorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const playlistMode = input.selection?.playlistMode ?? 'auto'
	const visibleLimit = options.playlistProbeLimit ?? DEFAULT_PLAYLIST_PROBE_LIMIT
	const scopePlan = playlistMode === 'video' ? undefined : playlistScopeSentinelFields(input.selection?.playlistScope, visibleLimit)
	const modeFlag = playlistMode === 'video' ? ['--no-playlist'] : playlistMode === 'playlist' ? ['--yes-playlist'] : []
	const scopeArgs = scopePlan ? [scopePlan.ytDlpFlag, scopePlan.ytDlpValue] : []
	const extractorArgs: string[] = []
	pushJoined(extractorArgs, 'youtube', 'player_client', input.extractor?.youtube?.playerClient ?? [])
	const args = [...baseArgs(options), '--dump-single-json', '--no-quiet', '--flat-playlist', ...modeFlag, ...scopeArgs, ...requestPacingArgs(options.pacing), ...extractorArgs, input.url]
	const facts: WorkflowPlanFacts = {isMediaDownload: false, dependencies: dependencyFacts(new Map([['yt-dlp', ['execute probe workflow']]]), new Map(), options.detectedDependencies), risks: [], sideEffects: []}
	if (scopePlan) facts.playlistScope = scopePlan
	return withFacts({kind: 'probe', args, redactedArgs: [], facts})
}

function planInspectWorkflow(input: ManagedInspectWorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const normalized = normalizeInspect(input)
	const args = [...managedBaseArgs(normalized, options)]
	if (normalized.flatPlaylist) args.push('--flat-playlist')
	if (normalized.inspect === 'metadata') args.push('--dump-json')
	else if (normalized.inspect === 'single-json') args.push('--dump-single-json')
	else args.push(normalized.inspect === 'formats' ? '--list-formats' : normalized.inspect === 'subtitles' ? '--list-subs' : '--list-thumbnails')
	args.push(normalized.url)
	return withFacts({kind: 'inspect', args, redactedArgs: [], facts: {isMediaDownload: false, dependencies: dependencyFacts(new Map([['yt-dlp', ['inspect metadata and lists']]]), optionalInspectDependencies(normalized), options.detectedDependencies), risks: risksForAuth(normalized.auth), sideEffects: []}})
}

function planCallerSubtitlesWorkflow(input: CallerSubtitlesWorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const subOutputDir = input.output.subtitleMode === 'subfolder' ? `${input.output.directory}/subtitles` : input.output.directory
	const effectiveSubtitleFormat = resolveEffectiveSubtitleFormat(input.subtitles)
	const template = input.output.template ?? DEFAULT_CALLER_OUTPUT_TEMPLATE
	const args = [
		...baseArgs(options),
		'--skip-download',
		'--no-playlist',
		'--write-subs',
		'--sub-langs',
		input.subtitles.languages.join(','),
		...(input.subtitles.writeAuto ? ['--write-auto-subs'] : []),
		...sleepSubtitlesArgs(options.pacing),
		...requestPacingArgs(options.pacing),
		'--sub-format',
		`${effectiveSubtitleFormat}/best`,
		'--convert-subs',
		effectiveSubtitleFormat,
		'-o',
		`${subOutputDir}/${template}`,
		input.url
	]
	return withFacts({
		kind: 'subtitles',
		args,
		redactedArgs: [],
		facts: {
			isMediaDownload: false,
			output: {directory: input.output.directory, template, ...(input.output.tempDirectory ? {tempDirectory: input.output.tempDirectory} : {})},
			effectiveSubtitleFormat,
			dependencies: dependencyFacts(new Map([['yt-dlp', ['download subtitles']]]), new Map([['ffmpeg', ['subtitle conversion requested']]]), options.detectedDependencies),
			risks: [],
			sideEffects: ['create subtitle files']
		}
	})
}

function planCallerMediaWorkflow(input: CallerMediaWorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const retryPolicy = options.downloadRetryPolicy ?? DEFAULT_DOWNLOAD_RETRY_POLICY
	const skipDownload = input.selection?.skipDownload === true
	const args: string[] = [...baseArgs(options), '--progress', '--no-playlist']
	const loadInfoJsonPath = input.resume?.loadInfoJsonPath
	if (loadInfoJsonPath) args.push('--load-info-json', loadInfoJsonPath)
	if (!skipDownload) {
		args.push('--continue', '--http-chunk-size', '10M', '--retries', String(retryPolicy.retries), '--fragment-retries', String(retryPolicy.fragmentRetries), '--retry-sleep', retryPolicy.retrySleep, '--abort-on-unavailable-fragments')
	}

	const embedSubs = input.subtitles?.embed === true && input.subtitles.languages.length > 0
	const audioConvert = embedSubs ? undefined : input.audio?.convert

	if (embedSubs && input.subtitles) {
		args.push('--write-subs', '--embed-subs', '--sub-langs', input.subtitles.languages.join(','), '--merge-output-format', EMBED_SUBTITLE_CONTAINER_EXT, '--compat-options', 'no-keep-subs', ...sleepSubtitlesArgs(options.pacing))
		if (input.subtitles.writeAuto) args.push('--write-auto-subs')
	} else {
		args.push('--no-write-subs', '--no-write-auto-subs')
	}

	appendCallerSponsorBlockArgs(args, input.sponsorBlock)
	if (input.embed?.chapters) args.push('--embed-chapters')

	const embedPolicy = resolveEmbedPolicy({metadata: input.embed?.metadata, thumbnail: input.embed?.thumbnail, audioConvert})
	if (embedPolicy.metadata) args.push('--add-metadata')
	if (embedPolicy.thumbnail && !embedSubs) args.push('--embed-thumbnail', '--convert-thumbnails', 'jpg')
	if (input.embed?.description) args.push('--write-description')
	if (input.embed?.thumbnailSidecar) args.push('--write-thumbnail')

	appendCallerMediaSelectionArgs(args, input, audioConvert, embedSubs, skipDownload)
	appendCallerOutputArgs(args, input, skipDownload)
	appendCallerExtractorArgs(args, input)
	args.push(...downloadPacingArgs(options.pacing))
	if (!loadInfoJsonPath) args.push(input.url)

	return withFacts({
		kind: 'media',
		args,
		redactedArgs: [],
		facts: {
			isMediaDownload: !skipDownload,
			output: {directory: input.output.directory, template: input.output.template ?? DEFAULT_CALLER_OUTPUT_TEMPLATE, ...(input.output.tempDirectory ? {tempDirectory: input.output.tempDirectory} : {})},
			dependencies: dependencyFacts(callerMediaDependencyReasons(input, audioConvert, embedSubs), new Map(), options.detectedDependencies),
			risks: callerMediaRisks(input),
			sideEffects: callerMediaSideEffects(input, audioConvert, embedSubs, skipDownload)
		}
	})
}

function planManagedDownloadWorkflow(input: ManagedDownloadWorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const config = options.config ?? CONFIG
	const normalized = normalizeManagedDownload(input)
	const outputPolicy = resolveOutputPolicy(config, normalized.output)
	const args = buildManagedDownloadArgs(normalized, outputPolicy, config, options)
	const required = requiredManagedDependencyReasons(normalized)
	const optional = optionalManagedDependencyReasons(normalized)
	return withFacts({
		kind: normalized.kind,
		args,
		redactedArgs: [],
		facts: {
			isMediaDownload: normalized.kind !== 'subtitles' && normalized.kind !== 'thumbnail',
			output: {outputRoot: outputPolicy.outputRoot, tempRoot: outputPolicy.tempRoot, template: outputPolicy.outputTemplate, allowOverwrite: outputPolicy.allowOverwrite},
			dependencies: dependencyFacts(required, optional, options.detectedDependencies),
			risks: managedRisksFor(normalized),
			sideEffects: managedSideEffectsFor(normalized, outputPolicy.allowOverwrite)
		}
	})
}

function planPostprocessWorkflow(input: ManagedPostprocessWorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const config = options.config ?? CONFIG
	const normalized = normalizePostprocess(input)
	const outputPolicy = resolveOutputPolicy(config, normalized.output)
	const required = requiredPostprocessDependencyReasons(normalized)
	return withFacts({
		kind: 'postprocess',
		args: [],
		redactedArgs: [],
		facts: {
			isMediaDownload: false,
			output: {outputRoot: outputPolicy.outputRoot, tempRoot: outputPolicy.tempRoot, template: outputPolicy.outputTemplate, allowOverwrite: outputPolicy.allowOverwrite},
			dependencies: dependencyFacts(required, new Map(), options.detectedDependencies),
			risks: postprocessRisks(normalized),
			sideEffects: postprocessSideEffects(normalized)
		}
	})
}

function planExpertWorkflow(input: ExpertWorkflowInput, options: WorkflowPlanOptions): WorkflowPlan {
	const rawArgs = input.args ?? []
	const dryRun = input.dryRun !== false
	const args = dryRun ? ['--simulate', ...rawArgs] : [...rawArgs]
	if (input.url) args.push(input.url)
	return withFacts({
		kind: 'expert',
		args,
		redactedArgs: [],
		facts: {isMediaDownload: !dryRun, dependencies: dependencyFacts(new Map([['yt-dlp', ['execute expert argv']]]), new Map(), options.detectedDependencies), risks: ['Expert args can change process behavior; review before execution.'], sideEffects: dryRun ? [] : ['execute caller-provided yt-dlp args']}
	})
}

function buildManagedDownloadArgs(input: NormalizedManagedDownloadInput, policy: ResolvedOutputPolicy, config: ServerConfig, options: WorkflowPlanOptions): string[] {
	const args = managedBaseArgs(input, options, config)

	args.push('--paths', `home:${policy.outputRoot}`)
	args.push('--paths', `temp:${policy.tempRoot}`)
	args.push('--output', policy.outputTemplate)
	args.push(policy.allowOverwrite ? '--force-overwrites' : '--no-overwrites')
	args.push('--newline', '--progress')
	args.push('--print', 'after_move:filepath')

	appendManagedSelectionArgs(args, input, policy, config)
	appendManagedDownloadArgs(args, input)
	appendManagedFormatArgs(args, input)
	appendManagedSubtitleArgs(args, input)
	appendManagedThumbnailArgs(args, input)
	appendManagedPostprocessArgs(args, input)
	appendManagedSponsorBlockArgs(args, input)
	appendManagedExtractorArgs(args, input)

	if (input.kind === 'audio' && !input.postprocess.extractAudio) args.push('--extract-audio')
	if (input.kind === 'subtitles') {
		args.push('--skip-download')
		if (!input.subtitles.writeSubs && !input.subtitles.writeAutoSubs) args.push('--write-subs')
	}
	if (input.kind === 'thumbnail') {
		args.push('--skip-download')
		if (!input.thumbnails.writeThumbnail && !input.thumbnails.writeAllThumbnails) args.push('--write-thumbnail')
	}
	if (input.kind === 'playlist' && !input.selection.noPlaylist) args.push('--yes-playlist')

	args.push(input.url)
	return args
}

function managedBaseArgs(input: Pick<NormalizedManagedDownloadInput | NormalizedInspectInput, 'auth' | 'network'>, options: WorkflowPlanOptions, config: ServerConfig = options.config ?? CONFIG): string[] {
	const args = baseArgs(options)
	args.push('--no-warnings')
	appendNetworkArgs(args, input.network)
	appendAuthArgs(args, input.auth, config)
	return args
}

function baseArgs(options: WorkflowPlanOptions): string[] {
	const args: string[] = []
	if (options.configFiles?.mode === 'disabled') args.push('--ignore-config')
	if (options.plugins?.mode === 'disabled') args.push('--no-plugin-dirs')
	if (options.plugins?.mode === 'explicit') {
		args.push('--no-plugin-dirs')
		for (const dir of options.plugins.dirs ?? []) args.push('--plugin-dirs', dir)
	}
	return args
}

function appendNetworkArgs(args: string[], network: NormalizedInspectInput['network']): void {
	push(args, '--proxy', network.proxy)
	if (network.socketTimeout !== undefined) push(args, '--socket-timeout', String(network.socketTimeout))
	push(args, '--source-address', network.sourceAddress)
	push(args, '--impersonate', network.impersonate)
	push(args, '--geo-verification-proxy', network.geoVerificationProxy)
	push(args, '--xff', network.xff)
	if (network.forceIpv4) args.push('--force-ipv4')
	if (network.forceIpv6) args.push('--force-ipv6')
}

function appendAuthArgs(args: string[], auth: NormalizedInspectInput['auth'], config: ServerConfig): void {
	push(args, '--username', auth.username)
	push(args, '--password', auth.password)
	push(args, '--twofactor', auth.twofactor)
	if (auth.netrc) {
		requireConfigFilePolicy('auth.netrc', config)
		args.push('--netrc')
	}
	if (auth.netrcLocation) requireConfigFilePolicy('auth.netrcLocation', config)
	if (auth.netrcCmd) requireConfigFilePolicy('auth.netrcCmd', config)
	push(args, '--netrc-location', auth.netrcLocation)
	push(args, '--netrc-cmd', auth.netrcCmd)
	push(args, '--video-password', auth.videoPassword)
	push(args, '--cookies', configuredOrAllowed(auth.cookiesFile, config.cookiesFile, 'auth.cookiesFile', config))
	push(args, '--cookies-from-browser', configuredOrAllowed(auth.cookiesFromBrowser, config.cookiesFromBrowser, 'auth.cookiesFromBrowser', config))
}

function configuredOrAllowed(inputValue: string | undefined, configuredValue: string | undefined, label: string, config: ServerConfig): string | undefined {
	if (inputValue !== undefined && inputValue !== configuredValue) requireConfigFilePolicy(label, config)
	return inputValue ?? configuredValue
}

function requireConfigFilePolicy(label: string, config: ServerConfig): void {
	if (!config.allowConfigFiles) throw new Error(`${label} requires YTDLP_MCP_ALLOW_CONFIG_FILES=true or a matching server-level environment setting`)
}

function appendManagedSelectionArgs(args: string[], input: NormalizedManagedDownloadInput, policy: ResolvedOutputPolicy, config: ServerConfig): void {
	const selection = input.selection
	push(args, '--playlist-items', selection.playlistItems)
	if (selection.noPlaylist) args.push('--no-playlist')
	if (selection.yesPlaylist) args.push('--yes-playlist')
	push(args, '--min-filesize', selection.minFilesize)
	push(args, '--max-filesize', selection.maxFilesize)
	push(args, '--date', selection.date)
	push(args, '--datebefore', selection.dateBefore)
	push(args, '--dateafter', selection.dateAfter)
	pushRepeated(args, '--match-filters', selection.matchFilters)
	pushRepeated(args, '--break-match-filters', selection.breakMatchFilters)
	if (selection.ageLimit !== undefined) push(args, '--age-limit', String(selection.ageLimit))
	push(args, '--download-archive', selection.downloadArchive ? resolveManagedPath(policy.outputRoot, selection.downloadArchive, 'downloadArchive', config.allowArbitraryOutputPaths) : undefined)
	if (selection.maxDownloads !== undefined) push(args, '--max-downloads', String(selection.maxDownloads))
	if (selection.breakOnExisting) args.push('--break-on-existing')
	if (selection.breakPerInput) args.push('--break-per-input')
	if (selection.skipPlaylistAfterErrors !== undefined) push(args, '--skip-playlist-after-errors', String(selection.skipPlaylistAfterErrors))
}

function appendManagedDownloadArgs(args: string[], input: NormalizedManagedDownloadInput): void {
	const download = input.download
	if (download.concurrentFragments !== undefined) push(args, '--concurrent-fragments', String(download.concurrentFragments))
	push(args, '--limit-rate', download.limitRate)
	push(args, '--throttled-rate', download.throttledRate)
	push(args, '--retries', download.retries)
	push(args, '--file-access-retries', download.fileAccessRetries)
	push(args, '--fragment-retries', download.fragmentRetries)
	pushRepeated(args, '--retry-sleep', download.retrySleep)
	if (download.keepFragments) args.push('--keep-fragments')
	push(args, '--buffer-size', download.bufferSize)
	push(args, '--http-chunk-size', download.httpChunkSize)
	if (download.playlistRandom) args.push('--playlist-random')
	if (download.lazyPlaylist) args.push('--lazy-playlist')
	if (download.hlsUseMpegts) args.push('--hls-use-mpegts')
	pushRepeated(args, '--download-sections', download.downloadSections)
	pushRepeated(args, '--downloader', download.downloader)
	pushRepeated(args, '--downloader-args', download.downloaderArgs)
}

function appendManagedFormatArgs(args: string[], input: NormalizedManagedDownloadInput): void {
	const format = input.format
	push(args, '--format', format.format)
	pushRepeated(args, '--format-sort', format.formatSort)
	if (format.formatSortReset) args.push('--format-sort-reset')
	if (format.formatSortForce) args.push('--format-sort-force')
	if (format.videoMultistreams) args.push('--video-multistreams')
	if (format.audioMultistreams) args.push('--audio-multistreams')
	if (format.preferFreeFormats) args.push('--prefer-free-formats')
	if (format.checkFormats) args.push('--check-formats')
	if (format.checkAllFormats) args.push('--check-all-formats')
	push(args, '--merge-output-format', format.mergeOutputFormat)
}

function appendManagedSubtitleArgs(args: string[], input: NormalizedManagedDownloadInput): void {
	const subtitles = input.subtitles
	if (subtitles.writeSubs) args.push('--write-subs')
	if (subtitles.writeAutoSubs) args.push('--write-auto-subs')
	push(args, '--sub-format', subtitles.subFormat)
	push(args, '--sub-langs', subtitles.subLangs)
	push(args, '--convert-subs', subtitles.convertSubs)
}

function appendManagedThumbnailArgs(args: string[], input: NormalizedManagedDownloadInput): void {
	const thumbnails = input.thumbnails
	if (thumbnails.writeThumbnail) args.push('--write-thumbnail')
	if (thumbnails.writeAllThumbnails) args.push('--write-all-thumbnails')
	push(args, '--convert-thumbnails', thumbnails.convertThumbnails)
}

function appendManagedPostprocessArgs(args: string[], input: NormalizedManagedDownloadInput): void {
	const postprocess = input.postprocess
	if (postprocess.extractAudio) args.push('--extract-audio')
	push(args, '--audio-format', postprocess.audioFormat)
	push(args, '--audio-quality', postprocess.audioQuality)
	push(args, '--remux-video', postprocess.remuxVideo)
	push(args, '--recode-video', postprocess.recodeVideo)
	pushRepeated(args, '--postprocessor-args', postprocess.postprocessorArgs)
	if (postprocess.keepVideo) args.push('--keep-video')
	if (postprocess.postOverwrites) args.push('--post-overwrites')
	if (postprocess.embedSubs) args.push('--embed-subs')
	if (postprocess.embedThumbnail) args.push('--embed-thumbnail')
	if (postprocess.embedMetadata) args.push('--embed-metadata')
	if (postprocess.embedChapters) args.push('--embed-chapters')
	if (postprocess.embedInfoJson) args.push('--embed-info-json')
	pushRepeated(args, '--parse-metadata', postprocess.parseMetadata)
	pushRepeated(args, '--replace-in-metadata', postprocess.replaceInMetadata)
	if (postprocess.xattrs) args.push('--xattrs')
	push(args, '--concat-playlist', postprocess.concatPlaylist)
	push(args, '--fixup', postprocess.fixup)
	if (postprocess.splitChapters) args.push('--split-chapters')
	pushRepeated(args, '--remove-chapters', postprocess.removeChapters)
	if (postprocess.forceKeyframesAtCuts) args.push('--force-keyframes-at-cuts')
	pushRepeated(args, '--use-postprocessor', postprocess.usePostprocessor)
}

function appendManagedSponsorBlockArgs(args: string[], input: NormalizedManagedDownloadInput): void {
	push(args, '--sponsorblock-mark', input.sponsorblock.mark)
	push(args, '--sponsorblock-remove', input.sponsorblock.remove)
	push(args, '--sponsorblock-chapter-title', input.sponsorblock.chapterTitle)
	push(args, '--sponsorblock-api', input.sponsorblock.api)
}

function appendManagedExtractorArgs(args: string[], input: NormalizedManagedDownloadInput): void {
	const extractor = input.extractor
	push(args, '--extractor-retries', extractor.extractorRetries)
	if (extractor.allowDynamicMpd) args.push('--allow-dynamic-mpd')
	if (extractor.hlsSplitDiscontinuity) args.push('--hls-split-discontinuity')
	pushRepeated(args, '--extractor-args', extractor.extractorArgs)

	const youtube = extractor.youtube
	if (!youtube) return

	push(args, '--extractor-args', keyed('youtube', 'lang', youtube.lang))
	push(args, '--extractor-args', keyed('youtube', 'comment_sort', youtube.commentSort))
	push(args, '--extractor-args', keyed('youtube', 'max_comments', youtube.maxComments))
	push(args, '--extractor-args', keyed('youtube', 'fetch_pot', youtube.fetchPot))
	pushJoined(args, 'youtube', 'skip', youtube.skip)
	pushJoined(args, 'youtube', 'player_client', youtube.playerClient)
	pushJoined(args, 'youtube', 'formats', youtube.formats)
	pushJoined(args, 'youtube', 'po_token', youtube.poToken)
}

function appendCallerMediaSelectionArgs(args: string[], input: CallerMediaWorkflowInput, audioConvert: AudioConvert | undefined, embedSubs: boolean, skipDownload: boolean): void {
	if (skipDownload) {
		args.push('--skip-download')
		return
	}
	if (audioConvert) {
		args.push('-f', 'bestaudio/best', '-x', '--audio-format', audioConvert.target)
		if (audioConvert.lossy && audioConvert.bitrateKbps !== undefined) args.push('--audio-quality', `${audioConvert.bitrateKbps}K`)
		return
	}
	const selection = input.selection
	if (selection?.formatSelector) {
		args.push('-f', selection.formatSelector)
		if (selection.formatSort) args.push('-S', selection.formatSort)
		if (selection.mergeOutputFormat && !embedSubs) args.push('--merge-output-format', selection.mergeOutputFormat)
		return
	}
	if (selection?.formatId) args.push('-f', selection.formatId)
}

function appendCallerOutputArgs(args: string[], input: CallerMediaWorkflowInput, skipDownload: boolean): void {
	const template = input.output.template ?? DEFAULT_CALLER_OUTPUT_TEMPLATE
	if (input.output.tempDirectory) {
		args.push('--paths', `home:${input.output.directory}`, '--paths', `temp:${input.output.tempDirectory}`, '-o', template)
	} else {
		args.push('-o', `${input.output.directory}/${template}`)
	}
	if (input.output.tempDirectory && !skipDownload && input.resume?.writeInfoJson !== false) {
		args.push('--write-info-json', '-o', `infojson:${input.output.tempDirectory}/${input.resume?.infoJsonBaseName ?? '_arroxy'}`)
	}
}

function appendCallerSponsorBlockArgs(args: string[], sponsorBlock: SponsorBlockPlan | undefined): void {
	if (!sponsorBlock || sponsorBlock.categories.length === 0) return
	const categories = sponsorBlock.categories.join(',')
	args.push(sponsorBlock.mode === 'mark' ? '--sponsorblock-mark' : '--sponsorblock-remove', categories)
}

function appendCallerExtractorArgs(args: string[], input: CallerMediaWorkflowInput): void {
	pushJoined(args, 'youtube', 'player_client', input.extractor?.youtube?.playerClient ?? [])
}

function resolveEffectiveSubtitleFormat(input: {format: SubtitleFormat; writeAuto?: boolean}): SubtitleFormat {
	return input.writeAuto === true && input.format === 'ass' ? 'srt' : input.format
}

function resolveEmbedPolicy(input: {metadata: boolean | undefined; thumbnail: boolean | undefined; audioConvert: AudioConvert | undefined}): {metadata: boolean; thumbnail: boolean} {
	if (!input.audioConvert) return {metadata: input.metadata === true, thumbnail: input.thumbnail === true}
	return {metadata: input.metadata !== false, thumbnail: input.audioConvert.lossy && input.thumbnail !== false}
}

function requestPacingArgs(pacing: NetworkPacing | undefined): string[] {
	return pacing?.sleepRequests !== undefined && pacing.sleepRequests > 0 ? ['--sleep-requests', String(pacing.sleepRequests)] : []
}

function downloadPacingArgs(pacing: NetworkPacing | undefined): string[] {
	const args = requestPacingArgs(pacing)
	if (pacing?.sleepInterval !== undefined && pacing.sleepInterval > 0) {
		args.push('--sleep-interval', String(pacing.sleepInterval))
		if (pacing.maxSleepInterval !== undefined && pacing.maxSleepInterval >= pacing.sleepInterval) args.push('--max-sleep-interval', String(pacing.maxSleepInterval))
	}
	if (pacing?.concurrentFragments !== undefined && pacing.concurrentFragments > 0) args.push('--concurrent-fragments', String(Math.trunc(pacing.concurrentFragments)))
	return args
}

function sleepSubtitlesArgs(pacing: NetworkPacing | undefined): string[] {
	const value = pacing?.sleepSubtitles
	if (value === undefined) return ['--sleep-subtitles', String(DEFAULT_SLEEP_SUBTITLES_SECONDS)]
	if (value <= 0) return []
	return ['--sleep-subtitles', String(value)]
}

export function playlistScopeSentinelFields(scope: PlaylistScope | undefined, appLimit: number): PlaylistScopePlan {
	const items = scope?.items
	if (!items || items.kind === 'app-limit') return {requestedCount: appLimit, sentinel: true, ytDlpFlag: '--playlist-end', ytDlpValue: String(appLimit + 1)}
	if (items.kind === 'first') return {requestedCount: items.count, sentinel: true, ytDlpFlag: '--playlist-items', ytDlpValue: `1:${items.count + 1}`}
	if (items.kind === 'range') return {requestedCount: items.to - items.from + 1, sentinel: true, ytDlpFlag: '--playlist-items', ytDlpValue: `${items.from}:${items.to + 1}`}
	return unreachable(items)
}

type ManagedDownloadFormat = NonNullable<ManagedDownloadWorkflowInput['format']>
type ManagedDownloadSelection = NonNullable<ManagedDownloadWorkflowInput['selection']>
type ManagedDownloadDownload = NonNullable<ManagedDownloadWorkflowInput['download']>
type ManagedDownloadPostprocess = NonNullable<ManagedDownloadWorkflowInput['postprocess']>
type ManagedDownloadExtractor = NonNullable<ManagedDownloadWorkflowInput['extractor']>
type ManagedDownloadYoutubeExtractor = NonNullable<ManagedDownloadExtractor['youtube']>

type NormalizedManagedDownloadInput = Omit<ManagedDownloadWorkflowInput, 'kind' | 'format' | 'output' | 'network' | 'selection' | 'download' | 'subtitles' | 'thumbnails' | 'auth' | 'postprocess' | 'sponsorblock' | 'extractor'> & {
	kind: NonNullable<ManagedDownloadWorkflowInput['kind']>
	format: ManagedDownloadFormat & {formatSort: string[]}
	output: OutputPolicyInput
	network: NonNullable<ManagedDownloadWorkflowInput['network']>
	selection: ManagedDownloadSelection & {matchFilters: string[]; breakMatchFilters: string[]}
	download: ManagedDownloadDownload & {retrySleep: string[]; downloadSections: string[]; downloader: string[]; downloaderArgs: string[]}
	subtitles: NonNullable<ManagedDownloadWorkflowInput['subtitles']>
	thumbnails: NonNullable<ManagedDownloadWorkflowInput['thumbnails']>
	auth: NonNullable<ManagedDownloadWorkflowInput['auth']>
	postprocess: ManagedDownloadPostprocess & {postprocessorArgs: string[]; parseMetadata: string[]; replaceInMetadata: string[]; removeChapters: string[]; usePostprocessor: string[]}
	sponsorblock: NonNullable<ManagedDownloadWorkflowInput['sponsorblock']>
	extractor: Omit<ManagedDownloadExtractor, 'extractorArgs' | 'youtube'> & {extractorArgs: string[]; youtube?: Omit<ManagedDownloadYoutubeExtractor, 'skip' | 'playerClient' | 'formats' | 'poToken'> & {skip: string[]; playerClient: string[]; formats: string[]; poToken: string[]}}
}

function normalizeManagedDownload(input: ManagedDownloadWorkflowInput): NormalizedManagedDownloadInput {
	const inputExtractor = input.extractor ?? {extractorArgs: []}
	const {youtube: inputYoutube, extractorArgs: _extractorArgs, ...extractorRest} = inputExtractor
	const youtube = inputYoutube ? {...inputYoutube, skip: inputYoutube.skip ?? [], playerClient: inputYoutube.playerClient ?? [], formats: inputYoutube.formats ?? [], poToken: inputYoutube.poToken ?? []} : undefined
	const extractor = youtube ? {...extractorRest, extractorArgs: inputExtractor.extractorArgs ?? [], youtube} : {...extractorRest, extractorArgs: inputExtractor.extractorArgs ?? []}
	const format = input.format ?? {formatSort: []}
	const output = input.output ?? {allowOverwrite: false}
	const network = input.network ?? {}
	const selection = input.selection ?? {matchFilters: [], breakMatchFilters: []}
	const download = input.download ?? {retrySleep: [], downloadSections: [], downloader: [], downloaderArgs: []}
	const postprocess = input.postprocess ?? {postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: [], usePostprocessor: []}
	return {
		...input,
		kind: input.kind ?? 'media',
		format: {...format, formatSort: format.formatSort ?? []},
		output: {...output, allowOverwrite: output.allowOverwrite ?? false},
		network: {...network},
		selection: {...selection, matchFilters: selection.matchFilters ?? [], breakMatchFilters: selection.breakMatchFilters ?? []},
		download: {...download, retrySleep: download.retrySleep ?? [], downloadSections: download.downloadSections ?? [], downloader: download.downloader ?? [], downloaderArgs: download.downloaderArgs ?? []},
		subtitles: {...(input.subtitles ?? {})},
		thumbnails: {...(input.thumbnails ?? {})},
		auth: {...(input.auth ?? {})},
		postprocess: {...postprocess, postprocessorArgs: postprocess.postprocessorArgs ?? [], parseMetadata: postprocess.parseMetadata ?? [], replaceInMetadata: postprocess.replaceInMetadata ?? [], removeChapters: postprocess.removeChapters ?? [], usePostprocessor: postprocess.usePostprocessor ?? []},
		sponsorblock: {...(input.sponsorblock ?? {})},
		extractor
	}
}

function normalizeInspect(input: ManagedInspectWorkflowInput): NormalizedInspectInput {
	return {...input, kind: 'inspect', inspect: input.inspect ?? 'metadata', responseFormat: input.responseFormat ?? 'json', flatPlaylist: input.flatPlaylist ?? false, limit: input.limit ?? 50, offset: input.offset ?? 0, auth: {...(input.auth ?? {})}, network: {...(input.network ?? {})}}
}

type ManagedPostprocessOptions = NonNullable<ManagedPostprocessWorkflowInput['postprocess']>

type NormalizedPostprocessInput = Omit<ManagedPostprocessWorkflowInput, 'output' | 'postprocess' | 'sponsorblock' | 'format' | 'auth' | 'network'> & {
	output: OutputPolicyInput
	postprocess: ManagedPostprocessOptions & {postprocessorArgs: string[]; parseMetadata: string[]; replaceInMetadata: string[]; removeChapters: string[]; usePostprocessor: string[]}
	sponsorblock: NonNullable<ManagedPostprocessWorkflowInput['sponsorblock']>
	format: NonNullable<ManagedPostprocessWorkflowInput['format']> & {formatSort: string[]}
	auth: NonNullable<ManagedPostprocessWorkflowInput['auth']>
	network: NonNullable<ManagedPostprocessWorkflowInput['network']>
}

function normalizePostprocess(input: ManagedPostprocessWorkflowInput): NormalizedPostprocessInput {
	const postprocess = input.postprocess ?? {postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: [], usePostprocessor: []}
	return {
		...input,
		kind: 'postprocess',
		output: {...(input.output ?? {}), allowOverwrite: input.output?.allowOverwrite ?? false},
		postprocess: {...postprocess, postprocessorArgs: postprocess.postprocessorArgs ?? [], parseMetadata: postprocess.parseMetadata ?? [], replaceInMetadata: postprocess.replaceInMetadata ?? [], removeChapters: postprocess.removeChapters ?? [], usePostprocessor: postprocess.usePostprocessor ?? []},
		sponsorblock: {...(input.sponsorblock ?? {})},
		format: {...(input.format ?? {formatSort: []}), formatSort: input.format?.formatSort ?? []},
		auth: {...(input.auth ?? {})},
		network: {...(input.network ?? {})}
	}
}

function requiredManagedDependencyReasons(input: NormalizedManagedDownloadInput): Map<string, string[]> {
	const deps = new Map<string, string[]>()
	addReason(deps, 'yt-dlp', 'execute yt-dlp workflow')
	for (const reason of ffmpegReasons(input)) addReason(deps, 'ffmpeg', reason)
	if (needsFfprobe(input)) addReason(deps, 'ffprobe', 'inspect media streams for audio extraction or conversion')
	for (const downloader of input.download.downloader) {
		const binary = downloader.split(':').pop()?.trim()
		if (binary && !['default', 'native'].includes(binary)) addReason(deps, binary, 'requested external downloader')
	}
	if (input.network.impersonate) addReason(deps, 'curl_cffi', 'requested browser impersonation target')
	return deps
}

function optionalManagedDependencyReasons(input: NormalizedManagedDownloadInput): Map<string, string[]> {
	const deps = new Map<string, string[]>()
	if (input.extractor.youtube?.fetchPot === 'always' || input.extractor.youtube?.fetchPot === 'auto') addReason(deps, 'deno', 'optional JavaScript runtime for extractor challenges')
	if (input.extractor.youtube?.fetchPot === 'always' || input.extractor.youtube?.fetchPot === 'auto') addReason(deps, 'node', 'optional JavaScript runtime for extractor challenges')
	if (input.postprocess.embedThumbnail) addReason(deps, 'AtomicParsley', 'legacy thumbnail embedding fallback')
	return deps
}

function optionalInspectDependencies(input: NormalizedInspectInput): Map<string, string[]> {
	const deps = new Map<string, string[]>()
	if (input.network.impersonate) addReason(deps, 'curl_cffi', 'requested browser impersonation target')
	return deps
}

function requiredPostprocessDependencyReasons(input: Pick<NormalizedPostprocessInput, 'postprocess' | 'sponsorblock'>): Map<string, string[]> {
	const deps = new Map<string, string[]>()
	if (
		input.postprocess.extractAudio ||
		input.postprocess.audioFormat ||
		input.postprocess.remuxVideo ||
		input.postprocess.recodeVideo ||
		input.postprocess.embedSubs ||
		input.postprocess.embedThumbnail ||
		input.postprocess.embedMetadata ||
		input.postprocess.embedChapters ||
		input.postprocess.embedInfoJson ||
		input.postprocess.concatPlaylist ||
		input.postprocess.splitChapters ||
		input.postprocess.removeChapters.length > 0 ||
		input.sponsorblock.remove
	) {
		addReason(deps, 'ffmpeg', 'requested postprocessing requires muxing, conversion, embedding, section edits, or segment removal')
	}
	if (input.postprocess.extractAudio || input.postprocess.audioFormat) addReason(deps, 'ffprobe', 'audio extraction/conversion needs stream probing')
	return deps
}

function callerMediaDependencyReasons(input: CallerMediaWorkflowInput, audioConvert: AudioConvert | undefined, embedSubs: boolean): Map<string, string[]> {
	const deps = new Map<string, string[]>()
	addReason(deps, 'yt-dlp', 'execute media workflow')
	if (audioConvert) {
		addReason(deps, 'ffmpeg', 'audio extraction or conversion requires ffmpeg')
		addReason(deps, 'ffprobe', 'audio extraction/conversion needs stream probing')
	}
	if (input.selection?.formatSelector?.includes('+') || input.selection?.formatId?.includes('+')) addReason(deps, 'ffmpeg', 'selected formats may require audio/video merge')
	if (input.selection?.mergeOutputFormat) addReason(deps, 'ffmpeg', 'remux requested')
	if (embedSubs) addReason(deps, 'ffmpeg', 'asset or metadata embedding requested')
	if (input.embed?.thumbnail) addReason(deps, 'ffmpeg', 'thumbnail conversion or embedding requested')
	if (input.sponsorBlock?.mode === 'remove') addReason(deps, 'ffmpeg', 'SponsorBlock segment removal requested')
	return deps
}

function needsFfprobe(input: NormalizedManagedDownloadInput): boolean {
	return input.kind === 'audio' || input.postprocess.extractAudio === true || input.postprocess.audioFormat !== undefined
}

function ffmpegReasons(input: NormalizedManagedDownloadInput): string[] {
	const reasons: string[] = []
	if (input.kind === 'audio' || input.postprocess.extractAudio || input.postprocess.audioFormat) reasons.push('audio extraction or conversion requires ffmpeg')
	if ((input.kind === 'media' && (!input.format.format || input.format.format.includes('+'))) || (input.kind === 'audio' && Boolean(input.format.format?.includes('+')))) reasons.push('selected/default formats may require audio/video merge')
	if (input.format.mergeOutputFormat || input.postprocess.remuxVideo) reasons.push('remux requested')
	if (input.postprocess.recodeVideo) reasons.push('recode requested')
	if (input.subtitles.convertSubs) reasons.push('subtitle conversion requested')
	if (input.thumbnails.convertThumbnails) reasons.push('thumbnail conversion requested')
	if (input.download.downloadSections.length > 0) reasons.push('section download/cutting requested')
	if (input.postprocess.splitChapters || input.postprocess.removeChapters.length > 0 || input.sponsorblock.remove) reasons.push('chapter or SponsorBlock segment editing requested')
	if (input.postprocess.embedSubs || input.postprocess.embedThumbnail || input.postprocess.embedMetadata || input.postprocess.embedChapters || input.postprocess.embedInfoJson) reasons.push('asset or metadata embedding requested')
	return reasons
}

function managedRisksFor(input: NormalizedManagedDownloadInput): string[] {
	const risks: string[] = []
	if (input.kind === 'media' && (!input.format.format || input.format.format.includes('+'))) risks.push('Default or combined format selection may choose separate audio/video streams; merging requires ffmpeg.')
	if (input.kind === 'playlist') risks.push('Playlist downloads can create many files; use playlist ranges and download archives for repeatable runs.')
	risks.push(...risksForAuth(input.auth))
	if (input.download.downloaderArgs.length > 0 || input.postprocess.postprocessorArgs.length > 0) risks.push('Advanced downloader/postprocessor args can change process behavior; prefer reviewed presets.')
	if (input.sponsorblock.remove) risks.push('SponsorBlock removal changes media content and requires ffmpeg.')
	if (input.selection.downloadArchive) risks.push('Download archive will be written by yt-dlp using extractor IDs.')
	return risks
}

function risksForAuth(auth: NormalizedInspectInput['auth']): string[] {
	return [auth.password, auth.twofactor, auth.videoPassword].some(value => value !== undefined && value.length > 0) ? ['Authentication secrets are accepted and will be redacted from command previews and errors.'] : []
}

function postprocessRisks(input: NormalizedPostprocessInput): string[] {
	const risks: string[] = []
	if (input.postprocess.recodeVideo) risks.push('Recoding can be slow and lossy depending on codec/container choices.')
	if (input.postprocess.removeChapters.length > 0) risks.push('Chapter removal changes media content.')
	if (input.sponsorblock.remove) risks.push('SponsorBlock removal changes media content.')
	if (input.postprocess.postprocessorArgs.length > 0) risks.push('Postprocessor args are advanced and should be reviewed.')
	return risks
}

function callerMediaRisks(input: CallerMediaWorkflowInput): string[] {
	const risks: string[] = []
	if (input.sponsorBlock?.mode === 'remove') risks.push('SponsorBlock removal changes media content and requires ffmpeg.')
	if (input.audio?.convert) risks.push('Audio extraction/conversion can be lossy depending on target and bitrate.')
	return risks
}

function managedSideEffectsFor(input: NormalizedManagedDownloadInput, overwrite: boolean): string[] {
	const sideEffects = ['create output files', 'create temporary files']
	if (overwrite) sideEffects.push('overwrite existing files')
	if (input.selection.downloadArchive) sideEffects.push('update download archive')
	if (input.kind === 'audio' || input.postprocess.extractAudio) sideEffects.push('extract audio with ffmpeg')
	if (input.postprocess.remuxVideo) sideEffects.push('remux media container')
	if (input.postprocess.recodeVideo) sideEffects.push('recode media')
	if (input.postprocess.embedSubs || input.postprocess.embedThumbnail || input.postprocess.embedMetadata) sideEffects.push('embed assets/metadata')
	if (input.sponsorblock.remove) sideEffects.push('remove SponsorBlock segments')
	return sideEffects
}

function postprocessSideEffects(input: NormalizedPostprocessInput): string[] {
	const sideEffects: string[] = []
	if (input.postprocess.remuxVideo) sideEffects.push('remux media container')
	if (input.postprocess.recodeVideo) sideEffects.push('recode media')
	if (input.postprocess.extractAudio || input.postprocess.audioFormat) sideEffects.push('extract or convert audio')
	if (input.postprocess.embedSubs || input.postprocess.embedThumbnail || input.postprocess.embedMetadata) sideEffects.push('embed assets/metadata')
	if (input.postprocess.splitChapters) sideEffects.push('split media by chapters')
	if (input.postprocess.removeChapters.length > 0 || input.sponsorblock.remove) sideEffects.push('remove media segments')
	return sideEffects
}

function callerMediaSideEffects(input: CallerMediaWorkflowInput, audioConvert: AudioConvert | undefined, embedSubs: boolean, skipDownload: boolean): string[] {
	const sideEffects = skipDownload ? ['write requested sidecar data'] : ['create output files', 'create temporary files']
	if (audioConvert) sideEffects.push('extract audio with ffmpeg')
	if (input.selection?.mergeOutputFormat) sideEffects.push('remux media container')
	if (embedSubs || input.embed?.metadata || input.embed?.thumbnail) sideEffects.push('embed assets/metadata')
	if (input.sponsorBlock?.mode === 'remove') sideEffects.push('remove SponsorBlock segments')
	return sideEffects
}

function dependencyFacts(requiredReasons: Map<string, string[]>, optionalReasons: Map<string, string[]>, detected: DetectedDependency[] | undefined): WorkflowDependencyFacts {
	return {required: pickDependencies(requiredReasons, detected), optional: pickDependencies(optionalReasons, detected)}
}

function pickDependencies(requirements: Map<string, string[]>, detected: DetectedDependency[] | undefined): DetectedDependency[] {
	const byName = new Map((detected ?? []).map(dependency => [dependency.name, dependency]))
	return [...requirements].map(([name, requiredFor]) => {
		const dependency = byName.get(name)
		if (!dependency) return {name, status: 'unknown', requiredFor, notes: ['Dependency availability was not checked for this plan.']}
		return {...dependency, requiredFor}
	})
}

function addReason(map: Map<string, string[]>, dependency: string, reason: string): void {
	const current = map.get(dependency) ?? []
	if (!current.includes(reason)) current.push(reason)
	map.set(dependency, current)
}

function keyed(namespace: string, key: string, value: string | undefined): string | undefined {
	return value ? `${namespace}:${key}=${value}` : undefined
}

function pushJoined(args: string[], namespace: string, key: string, values: string[]): void {
	if (values.length > 0) push(args, '--extractor-args', `${namespace}:${key}=${values.join(',')}`)
}

function push(args: string[], flag: string, value: string | undefined): void {
	if (value !== undefined && value !== '') args.push(flag, value)
}

function pushRepeated(args: string[], flag: string, values: string[]): void {
	for (const value of values) push(args, flag, value)
}

function hasCallerOutput(input: WorkflowInput): boolean {
	return 'output' in input && typeof input.output === 'object' && input.output !== null && 'directory' in input.output
}

function withFacts<T extends WorkflowPlan>(plan: T): T {
	return plan
}

function unreachable(value: never): never {
	throw new Error(`Unsupported workflow input: ${JSON.stringify(value)}`)
}
