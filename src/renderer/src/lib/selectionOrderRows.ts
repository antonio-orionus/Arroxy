// The selection order as readable rows: one line per rank, a short label and
// the reason it ranks there. Shared by the profile editor's "How this profile
// picks" list and the Format screen's "Why this one?" tooltip, so both say the
// same thing about the same order.

import type {TFunction} from 'i18next'
import type {AudioRank, SelectionOrder, VideoRank} from '@shared/selectionOrder.js'

export interface SelectionOrderRow {
	label: string
	reason: string
}

function videoRow(t: TFunction, rank: VideoRank, order: SelectionOrder): SelectionOrderRow {
	switch (rank.kind) {
		case 'site-preference':
			return {label: t('selectionOrder.rank.sitePreference.label'), reason: t('selectionOrder.rank.sitePreference.reason')}
		case 'original':
			return {label: t('selectionOrder.rank.original.label'), reason: t('selectionOrder.rank.original.reason')}
		case 'h264':
			return {label: t('selectionOrder.rank.h264.label'), reason: t('selectionOrder.rank.h264.reason')}
		case 'mp4-streams':
			return {label: t('selectionOrder.rank.mp4Streams.label'), reason: t('selectionOrder.rank.mp4Streams.reason')}
		case 'resolution':
			return rank.tier === 'best' ? {label: t('selectionOrder.rank.resolutionBest.label'), reason: t('selectionOrder.rank.resolutionBest.reason')} : {label: t('selectionOrder.rank.resolution.label', {tier: rank.tier}), reason: t('selectionOrder.rank.resolution.reason')}
		case 'fps':
			return {label: t('selectionOrder.rank.fps.label'), reason: t('selectionOrder.rank.fps.reason')}
		case 'hdr':
			return hdrRow(t, order)
		case 'source':
			return {label: t('selectionOrder.rank.source.label'), reason: t('selectionOrder.rank.source.reason')}
		case 'codec':
			return {label: t('selectionOrder.rank.codec.label'), reason: t('selectionOrder.rank.codec.reason')}
		case 'protocol':
			return {label: t('selectionOrder.rank.protocol.label'), reason: t('selectionOrder.rank.protocol.reason')}
		case 'size':
			return {label: t('selectionOrder.rank.size.label'), reason: t('selectionOrder.rank.size.reason')}
	}
}

// The reason says where the choice came from: this screen (Auto), or just why
// that order is better for the setting or profile that asked for it.
function hdrRow(t: TFunction, order: SelectionOrder): SelectionOrderRow {
	const fromScreen = order.hdr.source === 'display'
	if (order.hdr.preference === 'sdr') return {label: t('selectionOrder.rank.hdrSdrFirst.label'), reason: fromScreen ? t('selectionOrder.rank.hdrSdrFirst.reasonScreen') : t('selectionOrder.rank.hdrSdrFirst.reason')}
	return {label: t('selectionOrder.rank.hdrFirst.label'), reason: fromScreen ? t('selectionOrder.rank.hdrFirst.reasonScreen') : t('selectionOrder.rank.hdrFirst.reason')}
}

function audioRow(t: TFunction, rank: AudioRank, order: SelectionOrder): SelectionOrderRow {
	switch (rank.kind) {
		case 'aac':
			return rank.because === 'smart-tv' ? {label: t('selectionOrder.rank.aacSmartTv.label'), reason: t('selectionOrder.rank.aacSmartTv.reason')} : {label: t('selectionOrder.rank.aacFileType.label'), reason: t('selectionOrder.rank.aacFileType.reason')}
		case 'opus':
			return {label: t('selectionOrder.rank.opus.label'), reason: t('selectionOrder.rank.opus.reason')}
		case 'native': {
			const native = order.nativeAudio
			const label = native?.preference === 'surround' ? t('selectionOrder.rank.nativeSurround.label') : t('selectionOrder.rank.nativeCompatible.label')
			return {label, reason: native?.source === 'profile' ? t('selectionOrder.rank.nativeSource.profile') : t('selectionOrder.rank.nativeSource.settings')}
		}
	}
}

// Smart TV puts H.264 first, so the codec order only matters on a video with
// no H.264 at all; it is left out of the list rather than contradict the first row.
export function selectionOrderRows(t: TFunction, order: SelectionOrder): SelectionOrderRow[] {
	const video = order.video.filter(rank => !(order.goal === 'smart-tv' && rank.kind === 'codec'))
	return [...video.map(rank => videoRow(t, rank, order)), ...(order.audio ?? []).map(rank => audioRow(t, rank, order))]
}

export function selectionOrderSummary(t: TFunction, order: SelectionOrder): string {
	const tier = order.tier === 'best' ? t('playlistPresets.tier.best') : t(`playlistPresets.tier.${order.tier}` as const)
	const goal = order.goal === 'smart-tv' ? t('selectionOrder.summary.goal.smartTv') : t('selectionOrder.summary.goal.bestPicture')
	const fileType = order.fileType === 'auto' ? t('selectionOrder.summary.fileType.auto') : t('selectionOrder.summary.fileType.explicit', {ext: order.fileType})
	return [tier, goal, fileType].join(' · ')
}
