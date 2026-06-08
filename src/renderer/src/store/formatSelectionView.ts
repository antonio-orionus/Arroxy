import {useMemo} from 'react'
import {i18next} from '@shared/i18n/index.js'
import type {AudioBitrate, FormatOption} from '@shared/types.js'
import type {Preset} from '@shared/schemas.js'
import type {AudioSelection} from './types.js'
import {useAppStore} from './useAppStore.js'
import {resolveVideoResolution} from './helpers.js'
import {presetProducesMedia} from '@shared/presetTraits.js'

export type ConvertTooltipKey = 'wizard.formats.convert.requiresAudioOnly' | 'wizard.formats.convert.requiresLossy'

export interface FormatSelectionView {
	mode: 'video+audio' | 'audio-only' | 'subtitle-only'
	canContinue: boolean
	currentResolutionLabel: string
	selectedFilesize: number | undefined
	video: {disabled: boolean}
	audio: {
		convertDisabled: boolean
		convertTooltipKey: ConvertTooltipKey | null
		noAudioDisabled: boolean
		// The "no audio" row's meaning depends on whether the selected video
		// format is muxed (audio + video in one stream) or video-only. For muxed
		// sources, picking it downloads the file as-is — the embedded audio is
		// kept. The renderer flips the row's label/meta accordingly so users
		// don't think they're throwing away audio.
		selectedVideoIsMuxed: boolean
		bitrateStrip: {blocked: boolean; value: AudioBitrate; tooltipKey: ConvertTooltipKey | null}
	}
}

// Exported for unit-testing the gating logic (muxed-only sources, audio-only
// modes, etc.) without spinning up the zustand store.
export function selectView(state: {selectedVideoFormatId: string; audioSelection: AudioSelection; lastConvertBitrate: AudioBitrate; activePreset: Preset | null; wizardFormats: FormatOption[]}): FormatSelectionView {
	const {selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats} = state

	const isAudioOnly = selectedVideoFormatId === ''
	const isSubtitleOnly = activePreset !== null && !presetProducesMedia(activePreset)
	// Some extractors (PornHub, Twitch VODs, smaller hosts) return only muxed
	// formats — no separable audio streams. With separable audio, picking
	// convert-* alongside a video stream is invalid because yt-dlp's `-x` is
	// mutually exclusive with video+audio merging. With muxed-only sources,
	// there's no merging step — yt-dlp downloads the muxed stream and `-x`
	// extracts the audio track. The `setAudioSelection` reducer clears video on
	// convert-* anyway, so the operation reduces to audio-convert kind cleanly.
	const hasSeparableAudio = wizardFormats.some(f => f.isAudioOnly)

	const mode: FormatSelectionView['mode'] = isSubtitleOnly ? 'subtitle-only' : isAudioOnly ? 'audio-only' : 'video+audio'

	const canContinue = isSubtitleOnly || !(isAudioOnly && audioSelection.kind === 'none')

	const currentResolutionLabel = isSubtitleOnly ? i18next.t('presets.subtitle-only.label') : isAudioOnly ? i18next.t('wizard.formats.audioOnly') : resolveVideoResolution(selectedVideoFormatId, wizardFormats, i18next.t('wizard.formats.audioOnly'))

	const selectedFilesize = wizardFormats.find(f => f.formatId === selectedVideoFormatId)?.filesize

	// Only gate convert when a separate audio track exists alongside a video pick.
	const convertDisabled = !isAudioOnly && hasSeparableAudio
	const lossyConvert = audioSelection.kind === 'convert-lossy' ? audioSelection : null
	const bitrateBlocked = lossyConvert === null
	const bitrateValue = lossyConvert?.bitrateKbps ?? lastConvertBitrate
	// "No audio" row makes no sense in audio-only mode when separable audio
	// exists — the user has affirmatively asked for audio. With muxed-only
	// sources, audio-only mode is reached via convert-*; "No audio" still
	// doesn't apply, so the existing behavior holds.
	const noAudioDisabled = isAudioOnly
	const selectedFormat = wizardFormats.find(f => f.formatId === selectedVideoFormatId)
	const selectedVideoIsMuxed = !!selectedFormat && !selectedFormat.isVideoOnly && !selectedFormat.isAudioOnly

	return {
		mode,
		canContinue,
		currentResolutionLabel,
		selectedFilesize,
		video: {disabled: isSubtitleOnly},
		audio: {
			convertDisabled,
			convertTooltipKey: convertDisabled ? 'wizard.formats.convert.requiresAudioOnly' : null,
			noAudioDisabled,
			selectedVideoIsMuxed,
			bitrateStrip: {blocked: bitrateBlocked, value: bitrateValue, tooltipKey: convertDisabled ? 'wizard.formats.convert.requiresAudioOnly' : bitrateBlocked ? 'wizard.formats.convert.requiresLossy' : null}
		}
	}
}

export function useFormatSelectionView(): FormatSelectionView {
	const selectedVideoFormatId = useAppStore(s => s.selectedVideoFormatId)
	const audioSelection = useAppStore(s => s.audioSelection)
	const lastConvertBitrate = useAppStore(s => s.lastConvertBitrate)
	const activePreset = useAppStore(s => s.activePreset)
	const wizardFormats = useAppStore(s => s.wizardFormats)

	return useMemo(() => selectView({selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats}), [selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats])
}
