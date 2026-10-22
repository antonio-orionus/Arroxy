import {Fragment, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {videoCodecFilterSchema, type VideoCodecFilter} from '@shared/schemas.js'
import type {FormatSelectionView, VideoFormatRow, VideoLine} from '../../../store/formatSelectionView.js'
import {RadioGroup} from '../../ui/radio-group.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {SectionLabel} from '../../shared/SectionLabel.js'
import {FormatChip, FormatLineName} from './FormatLine.js'

interface VideoColumnProps {
	view: FormatSelectionView['video']
	selectedVideoFormatId: string
	onSelect: (formatId: string) => void
	onFilter: (filter: VideoCodecFilter) => void
}

// Every fact about the stream, for its spoken name.
function streamName(line: VideoLine, row: VideoFormatRow, profileLabel: string | null): string {
	const resolution = line.alias ? `${line.name} ${line.alias}` : line.name
	return [resolution, row.codec, row.ext, row.fps ? `${row.fps} fps` : null, row.range, ...row.markers.map(view => view.label), row.bitrate, row.size, profileLabel].flatMap(part => (part ? [part] : [])).join(' · ')
}

// One row per resolution; columns per dynamic range (HDR formats, then SDR) and,
// inside each, per codec: HDR or SDR reads across the header instead of as a tag
// on every chip, and a codec sits in the same column on every line. Columns are
// as wide as their widest chip and pack to the start, so an SDR-only video with
// one codec is one compact column rather than chips stretched across the screen.
export function VideoColumn({view, selectedVideoFormatId, onSelect, onFilter}: VideoColumnProps): ReactNode {
	const {t} = useTranslation()
	const profileLabel = t(view.profilePickIsFallback ? 'wizard.formats.profile.closestTag' : 'wizard.formats.profile.tag')
	const columns = {gridTemplateColumns: `max-content repeat(${view.columns.length}, auto)`}

	return (
		<div className="flex min-w-0 flex-col" data-testid="video-column">
			{/* Same height as the Audio header, which may hold the language picker, so both lists start level. */}
			<div className="mb-1.5 flex min-h-8 flex-wrap items-center gap-x-4 gap-y-1.5">
				<SectionLabel>{t('wizard.formats.video')}</SectionLabel>
				{/* A remembered codec this video lacks shows every codec; the setting keeps it for the next video. */}
				{view.codecs.length >= 2 ? (
					<ToggleGroup
						size="sm"
						variant="outline"
						aria-label={t('wizard.formats.codecFilter.label')}
						value={[view.codecFilter ?? 'all']}
						onValueChange={value => {
							const filter = videoCodecFilterSchema.safeParse(value[0])
							if (filter.success) onFilter(filter.data)
						}}
						disabled={view.disabled}
					>
						<ToggleGroupItem value="all">{t('wizard.formats.codecFilter.all')}</ToggleGroupItem>
						{view.codecs.map(codec => (
							<ToggleGroupItem key={codec} value={codec}>
								{codec}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				) : null}
			</div>

			{/* The step scrolls down; the list scrolls sideways only when the step is narrower than its chips (many
			    codec columns in a zoomed minimum window), rather than run past the step's edge. Its padding keeps the
			    profile dot and focus ring inside the scroller's clip. A scroller still reports its chips' full width,
			    so Audio moves under Video rather than squeeze it.
			    A disabled column shows nothing as chosen, even though the store keeps a selection.
			    The range header shares the chips' grid, so each header sits over its own column. It shows
			    even for SDR alone, so the first chips sit level with Audio's under its codec header. */}
			<RadioGroup value={view.disabled ? null : selectedVideoFormatId} onValueChange={value => onSelect(String(value))} disabled={view.disabled} aria-label={t('wizard.formats.video')} className="items-center justify-start gap-x-2 gap-y-1.5 overflow-x-auto pt-1 pe-1.5 pb-1" style={columns}>
				<span aria-hidden />
				{view.ranges.map(range => (
					<span key={range} aria-hidden className="px-3 text-caption text-subtle-foreground" style={{gridColumn: `span ${view.columns.filter(column => column.range === range).length}`}}>
						{range}
					</span>
				))}
				{view.lines.map(line => (
					<Fragment key={line.id}>
						<FormatLineName name={line.name} alias={line.alias} />
						{view.columns.map(({range, codec}) => {
							const row = line.variants.find(variant => variant.range === range && variant.codec === codec)
							return row ? (
								<FormatChip
									key={`${range}|${codec}`}
									value={row.formatId}
									name={streamName(line, row, row.isProfilePick ? profileLabel : null)}
									hint={row.hint}
									label={row.chipLabel}
									markers={row.markers}
									tags={row.hasAudio && view.mixedAudio ? [...row.chipTags, t('wizard.formats.withAudio')] : row.chipTags}
									size={row.size}
									profilePick={row.isProfilePick}
									disabled={view.disabled}
									stacked
								/>
							) : (
								<span key={`${range}|${codec}`} />
							)
						})}
					</Fragment>
				))}
			</RadioGroup>
		</div>
	)
}
