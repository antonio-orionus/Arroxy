import type {AudioConvert as BridgeAudioConvert, CallerMediaWorkflowInput} from 'yt-dlp-bridge'
import {isAudioConvertTargetLossy} from '@shared/audioTargets.js'
import {siteForJob} from '@shared/sites/index.js'
import {downloadSection} from '@shared/videoPart.js'
import {ytDlpSubtitleLanguages} from '@shared/subtitleLanguages.js'
import type {AudioConvert, ResolvedStartDownloadInput} from '@shared/types.js'
import {YOUTUBE_SINGLE_VIDEO_PLAYER_CLIENTS} from '@shared/youtubePlayerClients.js'
import {compiledOutputTemplate} from './phaseHelpers.js'

export type MediaJob = Exclude<ResolvedStartDownloadInput['job'], {kind: 'subtitle-only'}>

export interface MediaRequestParams {
	url: string
	job: MediaJob
	outputDir: string
	tempDir?: string
	embed: boolean
	infoJsonPath?: string
	// Defaults to the production clients; an empty list passes no player_client,
	// leaving the choice to yt-dlp.
	youtubePlayerClients?: readonly string[]
}

function bridgeAudioConvert(input: AudioConvert): BridgeAudioConvert {
	return {...input, lossy: isAudioConvertTargetLossy(input.target)}
}

// The single source of the media request, shared by VideoPhase and the download
// smoke so a smoke run exercises exactly what a queued download sends.
export function buildMediaRequest(params: MediaRequestParams): CallerMediaWorkflowInput {
	const {url, job, outputDir, tempDir, embed, infoJsonPath} = params
	// SponsorBlock applicability is owned by the Site adapter — currently
	// YouTube-only. Passing the flag for non-YouTube extractors is harmless
	// but wasted; the wizard hides the SponsorBlock step on non-supporting
	// sites and this is the defense-in-depth gate.
	//
	// Resolved against the job URL as well as the extractor, because the
	// extractor is a per-batch value the renderer cannot always fill in — a
	// bulk list of mixed sources leaves it empty for every row, which would
	// strand the YouTube rows on the generic adapter. The URL belongs to
	// this one job, so it decides correctly per item.
	const site = siteForJob(job.extractor, url)
	const videoPart = job.kind === 'ranged-format' ? undefined : job.videoPart
	// A part never takes SponsorBlock (prepareJob drops it); this is the same
	// defense-in-depth gate as the site check.
	const sbConfig = site.supportsSponsorBlock && job.sponsorBlock.mode !== 'off' && !videoPart ? {mode: job.sponsorBlock.mode, categories: job.sponsorBlock.categories} : undefined

	const formatId = job.kind === 'single-format' ? job.formatId : undefined
	const formatSelector = job.kind === 'ranged-format' ? job.formatSelector : undefined
	const formatSort = job.kind === 'ranged-format' ? job.formatSort : undefined
	const {mergeOutputFormat, remuxVideo} = job.kind === 'ranged-format' || job.kind === 'single-format' ? job : {mergeOutputFormat: undefined, remuxVideo: undefined}
	const audioConvert = job.kind === 'audio-convert' ? job.audioConvert : job.kind === 'ranged-format' ? job.audioConvert : undefined
	const bridgeConvert = audioConvert ? bridgeAudioConvert(audioConvert) : undefined
	const outputTemplate = compiledOutputTemplate(job.filenameTemplate)
	const {embed: embedOpts} = job
	const playerClients = params.youtubePlayerClients ?? YOUTUBE_SINGLE_VIDEO_PLAYER_CLIENTS
	const extractor = site.id === 'youtube' ? {youtube: {playerClient: [...playerClients]}} : undefined

	return {
		kind: 'media',
		url,
		output: {directory: outputDir, ...(tempDir ? {tempDirectory: tempDir} : {}), ...(outputTemplate ? {template: outputTemplate} : {})},
		selection: {formatId, formatSelector, formatSort, mergeOutputFormat, remuxVideo},
		...(bridgeConvert ? {audio: {convert: bridgeConvert}} : {}),
		...(embed && (job.subtitles?.languages.length ?? 0) > 0 && job.subtitles ? {subtitles: {embed: true, languages: ytDlpSubtitleLanguages(job.subtitles), writeAuto: job.subtitles.writeAuto, ...(job.subtitles.autoOnly ? {autoOnly: true} : {})}} : {}),
		...(sbConfig ? {sponsorBlock: sbConfig} : {}),
		...(videoPart ? {downloadSections: [downloadSection(videoPart)], forceKeyframesAtCuts: videoPart.exactCut} : {}),
		...(extractor ? {extractor} : {}),
		// yt-dlp embeds the whole video's chapters into a part unshifted, so they
		// would point past its end: a part gets none.
		embed: {chapters: embedOpts.chapters && !videoPart, metadata: embedOpts.metadata, thumbnail: embedOpts.thumbnail, description: embedOpts.description, thumbnailSidecar: embedOpts.thumbnailSidecar},
		...(infoJsonPath ? {resume: {loadInfoJsonPath: infoJsonPath}} : {})
	}
}
