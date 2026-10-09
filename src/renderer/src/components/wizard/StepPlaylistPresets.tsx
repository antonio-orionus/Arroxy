import {useEffect, useRef, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {type PlaylistAudioFormat, type PlaylistVideoTier, type PlaylistSelection, type PlaylistSubtitleSelection, AUDIO_BITRATES, DEFAULT_PLAYLIST_SELECTION, DEFAULT_PLAYLIST_SUBTITLE_SELECTION, PLAYLIST_VIDEO_TIERS} from '@shared/schemas.js'
import {SMART_TV_MP4_BLOCKED_TIERS, SMART_TV_MP4_MAX_TIER} from '../../store/wizard/downloadProfileDraft.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {ScrollArea} from '../ui/scroll-area.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {PlaylistSubtitlesPanel} from './PlaylistSubtitlesPanel.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'
import {normalizeSubtitleLanguageCode} from '@renderer/lib/subtitleLanguageCatalog.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {OptionCard} from '../shared/OptionCard.js'

type PlaylistSelectionKind = PlaylistSelection['kind']
const SELECTION_KINDS: readonly PlaylistSelectionKind[] = ['video', 'audio', 'subtitles']

// First visit to the Subtitles type: start from the UI language so the common
// case is one click, not a search.
function seededSubtitleSelection(uiLanguage: string): PlaylistSubtitleSelection {
	const code = normalizeSubtitleLanguageCode(uiLanguage)
	return {...DEFAULT_PLAYLIST_SUBTITLE_SELECTION, languages: code ? [code] : []}
}

const VIDEO_TIERS = PLAYLIST_VIDEO_TIERS
const AUDIO_FORMATS: PlaylistAudioFormat[] = ['best', 'mp3', 'm4a', 'opus']
const LOSSY_AUDIO = new Set<PlaylistAudioFormat>(['mp3', 'm4a', 'opus'])

export function StepPlaylistPresets(): ReactNode {
	const {t, i18n} = useTranslation()
	const {playlistSelection, setPlaylistSelection, advance, back, skipToConfirm, selectedPlaylistItemIds} = useAppStore()

	const sel: PlaylistSelection = playlistSelection ?? DEFAULT_PLAYLIST_SELECTION
	// Switching Subtitles → Audio → Subtitles should not throw away the
	// languages the user already picked on this visit.
	const lastSubtitleSelection = useRef<PlaylistSubtitleSelection | null>(null)
	useEffect(() => {
		if (sel.kind === 'subtitles') lastSubtitleSelection.current = sel
	}, [sel])

	useEffect(() => {
		if (playlistSelection === null) setPlaylistSelection(DEFAULT_PLAYLIST_SELECTION)
	}, [playlistSelection, setPlaylistSelection])

	function setKind(kind: PlaylistSelectionKind): void {
		if (sel.kind === kind) return
		if (kind === 'video') setPlaylistSelection({kind: 'video', tier: 'best', codec: 'best'})
		else if (kind === 'audio') setPlaylistSelection({kind: 'audio', format: 'best'})
		else setPlaylistSelection(lastSubtitleSelection.current ?? seededSubtitleSelection(i18n.language))
	}

	function setVideoCodec(codec: 'best' | 'mp4'): void {
		if (sel.kind !== 'video') return
		if (codec === 'mp4') {
			const tier = SMART_TV_MP4_BLOCKED_TIERS.has(sel.tier) ? SMART_TV_MP4_MAX_TIER : sel.tier
			setPlaylistSelection({kind: 'video', tier, codec: 'mp4'})
		} else {
			setPlaylistSelection({kind: 'video', tier: sel.tier, codec: 'best'})
		}
	}

	function setTier(tier: PlaylistVideoTier): void {
		if (sel.kind !== 'video') return
		const blocked = sel.codec === 'mp4' && SMART_TV_MP4_BLOCKED_TIERS.has(tier)
		if (blocked) return
		setPlaylistSelection({kind: 'video', tier, codec: sel.codec})
	}

	function setAudioFormat(format: PlaylistAudioFormat): void {
		if (sel.kind !== 'audio') return
		if (format === 'best') {
			setPlaylistSelection({kind: 'audio', format: 'best'})
		} else {
			const bitrate: (typeof AUDIO_BITRATES)[number] = sel.format !== 'best' ? (sel.bitrateKbps ?? 192) : 192
			setPlaylistSelection({kind: 'audio', format, bitrateKbps: bitrate})
		}
	}

	function setBitrate(kbps: (typeof AUDIO_BITRATES)[number]): void {
		if (sel.kind !== 'audio' || sel.format === 'best') return
		setPlaylistSelection({kind: 'audio', format: sel.format, bitrateKbps: kbps})
	}

	const currentKind = sel.kind
	const currentCodec = sel.kind === 'video' ? sel.codec : 'best'
	const currentTier = sel.kind === 'video' ? sel.tier : 'best'
	const currentAudioFormat = sel.kind === 'audio' ? sel.format : 'best'
	const currentBitrate = sel.kind === 'audio' && sel.format !== 'best' ? (sel.bitrateKbps ?? 192) : 192
	const showBitrate = sel.kind === 'audio' && LOSSY_AUDIO.has(sel.format)
	const showMp4Cap = sel.kind === 'video' && sel.codec === 'mp4'
	const subtitlesIncomplete = sel.kind === 'subtitles' && sel.languages.length === 0

	return (
		<div className="flex h-full flex-col gap-3 px-4 py-3" data-testid="step-playlist-presets">
			<div className="flex items-baseline justify-between gap-2">
				<h2 className="text-sm font-semibold">{t('wizard.playlistPresets.heading')}</h2>
				<span className="shrink-0 text-xs text-muted-foreground">{t('wizard.playlistPresets.itemCount_other', {count: selectedPlaylistItemIds.length})}</span>
			</div>

			<ScrollArea className="h-[calc(100vh-272px)] min-h-[280px]">
				<div className="flex flex-col gap-4 p-1">
					{/* Type toggle */}
					<div>
						<SectionLabel className="mb-1.5">{t('wizard.playlistPresets.subhead')}</SectionLabel>
						<ToggleGroup
							variant="outline"
							value={[currentKind]}
							onValueChange={arr => {
								const next = SELECTION_KINDS.find(kind => kind === arr[0])
								if (next) setKind(next)
							}}
							className="w-full"
						>
							{SELECTION_KINDS.map(kind => (
								<ToggleGroupItem key={kind} value={kind} className="flex-1" data-testid={`playlist-type-${kind}`}>
									{t(`playlistPresets.type.${kind}`)}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>

					{currentKind === 'video' && (
						<>
							{/* Compatibility toggle */}
							<div>
								<SectionLabel className="mb-1.5">{t('playlistPresets.type.video')}</SectionLabel>
								<ToggleGroup
									value={[currentCodec]}
									onValueChange={arr => {
										const next = (['best', 'mp4'] as const).find(codec => codec === arr[0])
										if (next) setVideoCodec(next)
									}}
									spacing={2}
									className="grid w-full grid-cols-2 gap-2"
								>
									{(['best', 'mp4'] as const).map(codec => (
										<OptionCard key={codec} value={codec} title={t(`playlistPresets.videoFormat.${codec}`)} description={t(`playlistPresets.videoFormatDesc.${codec}`)} />
									))}
								</ToggleGroup>
							</div>

							{/* Quality / tier grid */}
							<div>
								<SectionLabel className="mb-1.5">{t('playlistPresets.tier.best')}</SectionLabel>
								<ToggleGroup
									value={[currentTier]}
									onValueChange={arr => {
										const next = VIDEO_TIERS.find(tier => tier === arr[0])
										if (next) setTier(next)
									}}
									spacing={2}
									className="grid w-full grid-cols-2 gap-2 md:grid-cols-3"
									data-testid="tier-list"
								>
									{VIDEO_TIERS.map(tier => (
										<OptionCard key={tier} value={tier} disabled={currentCodec === 'mp4' && SMART_TV_MP4_BLOCKED_TIERS.has(tier)} title={t(`playlistPresets.tier.${tier}`)} description={t(`playlistPresets.tierDesc.${tier}`)} />
									))}
								</ToggleGroup>
								{showMp4Cap && <p className="mt-2 text-caption text-muted-foreground">{t('playlistPresets.mp4Cap')}</p>}
							</div>
						</>
					)}

					{currentKind === 'audio' && (
						<>
							{/* Audio format cards */}
							<div>
								<SectionLabel className="mb-1.5">{t('playlistPresets.type.audio')}</SectionLabel>
								<ToggleGroup
									value={[currentAudioFormat]}
									onValueChange={arr => {
										const next = AUDIO_FORMATS.find(fmt => fmt === arr[0])
										if (next) setAudioFormat(next)
									}}
									spacing={2}
									className="grid w-full grid-cols-2 gap-2"
								>
									{AUDIO_FORMATS.map(fmt => (
										<OptionCard key={fmt} value={fmt} title={t(`playlistPresets.audioFormat.${fmt}`)} description={t(`playlistPresets.audioFormatDesc.${fmt}`)} />
									))}
								</ToggleGroup>
							</div>

							{/* Bitrate chips — lossy formats only */}
							{showBitrate && (
								<div>
									<SectionLabel className="mb-1.5">{t('wizard.formats.convert.bitrate')}</SectionLabel>
									<ToggleGroup
										size="sm"
										variant="outline"
										spacing={1}
										value={[String(currentBitrate)]}
										onValueChange={arr => {
											const next = AUDIO_BITRATES.find(kbps => String(kbps) === arr[0])
											if (next) setBitrate(next)
										}}
										className="flex-wrap gap-1"
									>
										{AUDIO_BITRATES.map(kbps => (
											<ToggleGroupItem key={kbps} value={String(kbps)} shape="chip">
												{kbps}K
											</ToggleGroupItem>
										))}
									</ToggleGroup>
								</div>
							)}
						</>
					)}

					{sel.kind === 'subtitles' && <PlaylistSubtitlesPanel selection={sel} onChange={setPlaylistSelection} />}
				</div>
			</ScrollArea>

			<WizardStepFooterActions onBack={back} onContinue={advance} continueDisabled={subtitlesIncomplete}>
				<Button variant="outline" type="button" onClick={skipToConfirm} disabled={subtitlesIncomplete} title={t('wizard.formats.skipToConfirmTooltip')}>
					{t('wizard.formats.skipToConfirm')}
				</Button>
			</WizardStepFooterActions>
		</div>
	)
}
