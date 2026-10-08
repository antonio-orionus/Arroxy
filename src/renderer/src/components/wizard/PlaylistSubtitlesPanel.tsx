import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Captions} from 'lucide-react'
import type {DownloadProfileSubtitleSource, PlaylistSubtitleMode, PlaylistSubtitleSelection, SubtitleFormat} from '@shared/schemas.js'
import {PLAYLIST_SUBTITLE_MODES, SUBTITLE_FORMATS} from '@shared/schemas.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Field, FieldDescription, FieldLabel} from '../ui/field.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {SubtitleLanguagePicker} from './SubtitleLanguagePicker.js'

const SECTION_LABEL = 'text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] mb-1.5'

// Same vocabulary as the profile editor, so a batch and a profile describe
// the same track choice with the same words.
const SOURCE_OPTIONS = [
	{value: 'manual-first', labelKey: 'wizard.profileEditor.subtitleSource.manualFirst'},
	{value: 'manual-only', labelKey: 'wizard.profileEditor.subtitleSource.manualOnly'},
	{value: 'auto-only', labelKey: 'wizard.profileEditor.subtitleSource.autoOnly'}
] as const satisfies readonly {value: DownloadProfileSubtitleSource; labelKey: string}[]

const DELIVERY_LABEL_KEYS = {sidecar: 'playlistPresets.subtitles.deliveryLoose', subfolder: 'wizard.subtitles.saveMode.subfolder'} as const satisfies Record<PlaylistSubtitleMode, string>

interface PlaylistSubtitlesPanelProps {
	selection: PlaylistSubtitleSelection
	onChange: (next: PlaylistSubtitleSelection) => void
}

export function PlaylistSubtitlesPanel({selection, onChange}: PlaylistSubtitlesPanelProps): ReactNode {
	const {t} = useTranslation()
	const languagesMissing = selection.languages.length === 0
	const showAutoSrtNote = selection.source !== 'manual-only' && selection.format === 'ass'

	return (
		<div className="flex flex-col gap-4" data-testid="playlist-subtitles-panel">
			<Alert variant="info" className="py-2">
				<Captions aria-hidden />
				<AlertDescription className="text-[12px]">{t('playlistPresets.subtitles.note')}</AlertDescription>
			</Alert>

			<Field className="gap-1.5" data-invalid={languagesMissing || undefined}>
				<FieldLabel htmlFor="playlist-subtitle-languages" className="text-[12px] font-medium text-[var(--text-subtle)]">
					{t('playlistPresets.subtitles.languages')}
				</FieldLabel>
				<SubtitleLanguagePicker
					id="playlist-subtitle-languages"
					value={selection.languages}
					onValueChange={languages => onChange({...selection, languages})}
					invalid={languagesMissing}
					describedBy={languagesMissing ? 'playlist-subtitle-languages-error' : undefined}
					testId="playlist-subtitle-languages"
					optionTestIdPrefix="playlist-subtitle-language-option"
				/>
				{languagesMissing ? (
					<FieldDescription id="playlist-subtitle-languages-error" className="text-[12px] text-destructive">
						{t('playlistPresets.subtitles.languagesRequired')}
					</FieldDescription>
				) : null}
			</Field>

			<div>
				<p className={SECTION_LABEL}>{t('playlistPresets.subtitles.source')}</p>
				<ToggleGroup
					variant="outline"
					value={[selection.source]}
					onValueChange={values => {
						const next = SOURCE_OPTIONS.find(option => option.value === values[0])
						if (next) onChange({...selection, source: next.value})
					}}
					aria-label={t('playlistPresets.subtitles.source')}
					spacing={1}
					className="flex-wrap"
				>
					{SOURCE_OPTIONS.map(option => (
						<ToggleGroupItem key={option.value} value={option.value} className="min-h-7 px-2 text-[12px]">
							{t(option.labelKey)}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>

			<div>
				<p className={SECTION_LABEL}>{t('playlistPresets.subtitles.deliveryHeading')}</p>
				<ToggleGroup
					variant="outline"
					value={[selection.mode]}
					onValueChange={values => {
						const next = PLAYLIST_SUBTITLE_MODES.find(mode => mode === values[0])
						if (next) onChange({...selection, mode: next})
					}}
					aria-label={t('playlistPresets.subtitles.deliveryHeading')}
					spacing={1}
					className="flex-wrap"
				>
					{PLAYLIST_SUBTITLE_MODES.map(mode => (
						<ToggleGroupItem key={mode} value={mode} className="min-h-7 px-2 text-[12px]">
							{t(DELIVERY_LABEL_KEYS[mode])}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>

			<div>
				<p className={SECTION_LABEL}>{t('wizard.subtitles.format.heading')}</p>
				<ToggleGroup
					variant="outline"
					value={[selection.format]}
					onValueChange={values => {
						const next = SUBTITLE_FORMATS.find(format => format === values[0])
						if (next) onChange({...selection, format: next})
					}}
					aria-label={t('wizard.subtitles.format.heading')}
					spacing={1}
					className="flex-wrap"
				>
					{SUBTITLE_FORMATS.map((format: SubtitleFormat) => (
						<ToggleGroupItem key={format} value={format} shape="chip" className="min-h-6 px-2 text-[11px] font-semibold uppercase">
							{format.toUpperCase()}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				{showAutoSrtNote ? <p className="mt-2 text-[11px] leading-snug text-[var(--text-subtle)]">{t('wizard.profileEditor.note.autoCaptionsSrt')}</p> : null}
			</div>
		</div>
	)
}
