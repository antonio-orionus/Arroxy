import {useMemo, useState, type ReactNode, useId} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {Search, X} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Empty, EmptyDescription, EmptyHeader, EmptyTitle} from '../ui/empty.js'
import {InputGroup, InputGroupAddon, InputGroupInput} from '../ui/input-group.js'
import {Separator} from '../ui/separator.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {buildSubtitleList, SUBTITLE_MODE_I18N_KEYS} from '../../lib/subtitleLabel.js'
import {SUBTITLE_FORMATS, SUBTITLE_MODES} from '@shared/schemas.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {CheckRow} from '../shared/CheckRow.js'

// The single-video subtitle picker: the Format screen in Subtitles mode and
// the Review's Subtitles row. `withMedia` false (subtitles only) drops "embed",
// since there is no media file to embed into.
export function SubtitleFields({withMedia}: {withMedia: boolean}): ReactNode {
	const {t, i18n} = useTranslation()
	const {wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleLanguages, wizardSubtitleMode, wizardSubtitleFormat, toggleSubtitleLanguage, clearSubtitleLanguages, setSubtitleMode, setSubtitleFormat} = useAppStore(
		useShallow(state => ({
			wizardSubtitles: state.wizardSubtitles,
			wizardAutomaticCaptions: state.wizardAutomaticCaptions,
			wizardSubtitleLanguages: state.wizardSubtitleLanguages,
			wizardSubtitleMode: state.wizardSubtitleMode,
			wizardSubtitleFormat: state.wizardSubtitleFormat,
			toggleSubtitleLanguage: state.toggleSubtitleLanguage,
			clearSubtitleLanguages: state.clearSubtitleLanguages,
			setSubtitleMode: state.setSubtitleMode,
			setSubtitleFormat: state.setSubtitleFormat
		}))
	)

	const [query, setQuery] = useState('')

	const allLangs = useMemo(() => buildSubtitleList(wizardSubtitles, wizardAutomaticCaptions, i18n.language), [wizardSubtitles, wizardAutomaticCaptions, i18n.language])

	const hasLangs = allLangs.length > 0
	const selectedCount = wizardSubtitleLanguages.length
	// Show a heads-up when ASS is paired with auto-captions: we force SRT in
	// that combo because our auto-cap dedupe doesn't have an ASS code path.
	const hasAutoSelected = wizardSubtitleLanguages.some(code => allLangs.find(l => l.code === code)?.isAuto)
	const showAutoAssNote = hasAutoSelected && wizardSubtitleFormat === 'ass' && wizardSubtitleMode !== 'embed'

	const q = query.trim().toLowerCase()
	const manualLangs = allLangs.filter(l => !l.isAuto && (!q || l.displayName.toLowerCase().includes(q)))
	const autoLangs = allLangs.filter(l => l.isAuto && (!q || l.displayName.toLowerCase().includes(q)))
	const noMatches = hasLangs && q !== '' && manualLangs.length === 0 && autoLangs.length === 0

	const selectedItems = allLangs.filter(l => wizardSubtitleLanguages.includes(l.code))

	const saveModes = SUBTITLE_MODES.filter(mode => withMedia || mode !== 'embed').map(mode => ({mode, label: t(SUBTITLE_MODE_I18N_KEYS[mode])}))

	return (
		<div className="flex flex-col gap-1.5" data-testid="subtitle-fields">
			{/* ── Save as / Format — only relevant when subs exist ─ */}
			{hasLangs && (
				<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center -mx-1">
					<SectionLabel render={<span />} className="px-1 shrink-0">
						{t('wizard.subtitles.saveMode.heading')}
					</SectionLabel>
					<ToggleGroup
						size="sm"
						variant="outline"
						value={[wizardSubtitleMode]}
						onValueChange={values => {
							const next = values[0] as (typeof SUBTITLE_MODES)[number] | undefined
							if (next) setSubtitleMode(next)
						}}
						aria-label={t('wizard.subtitles.saveMode.heading')}
						spacing={1}
						className="flex-wrap"
					>
						{saveModes.map(({mode, label}) => (
							<ToggleGroupItem key={mode} value={mode}>
								{label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>

					{wizardSubtitleMode === 'embed' ? (
						<>
							<span />
							<p data-testid="subtitle-embed-note" className="text-caption text-subtle-foreground leading-snug">
								{t('wizard.subtitles.embedNote')}
							</p>
						</>
					) : (
						<>
							<SectionLabel render={<span />} className="px-1 shrink-0">
								{t('wizard.subtitles.format.heading')}
							</SectionLabel>
							<ToggleGroup
								size="xs"
								variant="outline"
								value={[wizardSubtitleFormat]}
								onValueChange={values => {
									const next = values[0] as (typeof SUBTITLE_FORMATS)[number] | undefined
									if (next) setSubtitleFormat(next)
								}}
								aria-label={t('wizard.subtitles.format.heading')}
								spacing={1}
								className="flex-wrap"
							>
								{SUBTITLE_FORMATS.map(fmt => (
									<ToggleGroupItem key={fmt} value={fmt} shape="chip" className="uppercase">
										{fmt.toUpperCase()}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</>
					)}

					{showAutoAssNote && (
						<>
							<span />
							<p data-testid="subtitle-auto-ass-note" className="text-caption text-subtle-foreground leading-snug">
								{t('wizard.subtitles.autoAssNote')}
							</p>
						</>
					)}
				</div>
			)}

			{hasLangs && <Separator className="bg-border/50 -mx-6 w-auto my-1.5" />}

			{/* ── Languages ───────────────────────────────────── */}
			{!hasLangs ? (
				<Empty className="py-6">
					<EmptyHeader>
						<EmptyTitle>{t('wizard.subtitles.noLanguages')}</EmptyTitle>
					</EmptyHeader>
				</Empty>
			) : (
				<>
					{/* Selected chips row */}
					<div className="flex items-center gap-2 min-h-[28px]">
						<div className="flex flex-1 flex-wrap gap-1.5 overflow-hidden">
							{selectedItems.length === 0 ? (
								<span className="text-caption italic text-subtle-foreground">{t('wizard.subtitles.noSelected')}</span>
							) : (
								selectedItems.map(({code, displayName}) => (
									<Badge key={code} className="h-6 ps-2.5 pe-1">
										{displayName}
										<Button
											type="button"
											aria-label={t('wizard.subtitles.removeLanguage', {name: displayName})}
											onClick={() => {
												toggleSubtitleLanguage(code)
											}}
											variant="ghost"
											size="icon-xs"
											className="size-4 rounded-full p-0 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
										>
											<X data-icon="inline-start" strokeWidth={3} />
										</Button>
									</Badge>
								))
							)}
						</div>
						<div className="flex items-center gap-2 shrink-0">
							{selectedCount > 0 && <span className="text-caption text-subtle-foreground">{selectedCount}</span>}
							{selectedCount > 0 && (
								<Button type="button" variant="link" size="inline" onClick={clearSubtitleLanguages} className="text-caption">
									{t('wizard.subtitles.clearAll')}
								</Button>
							)}
						</div>
					</div>

					{/* Search input */}
					<InputGroup>
						<InputGroupAddon>
							<Search />
						</InputGroupAddon>
						<InputGroupInput
							type="text"
							value={query}
							onChange={e => {
								setQuery(e.target.value)
							}}
							placeholder={t('wizard.subtitles.searchPlaceholder')}
							className="text-sm"
						/>
					</InputGroup>

					{/* Language list */}
					<div className="flex flex-col -mx-1 px-1">
						{noMatches ? (
							<Empty className="py-4">
								<EmptyHeader>
									<EmptyTitle>{t('wizard.subtitles.noMatches')}</EmptyTitle>
									<EmptyDescription>{query}</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : (
							<>
								<LangSection label={t('wizard.subtitles.sectionManual')} items={manualLangs} selected={wizardSubtitleLanguages} onToggle={toggleSubtitleLanguage} autoBadge={t('wizard.subtitles.autoBadge')} />
								<LangSection label={t('wizard.subtitles.sectionAuto')} items={autoLangs} selected={wizardSubtitleLanguages} onToggle={toggleSubtitleLanguage} autoBadge={t('wizard.subtitles.autoBadge')} />
							</>
						)}
					</div>
				</>
			)}
		</div>
	)
}

interface LangSectionProps {
	label: string
	items: {code: string; displayName: string; isAuto: boolean}[]
	selected: string[]
	onToggle: (code: string) => void
	autoBadge: string
}

function LangSection({label, items, selected, onToggle, autoBadge}: LangSectionProps): ReactNode | null {
	const sectionId = useId()
	if (items.length === 0) return null
	return (
		<div>
			<SectionLabel className="px-2 pt-1.5 pb-0.5">
				{label} ({items.length})
			</SectionLabel>
			<div className="grid grid-cols-3 gap-1">
				{items.map(({code, displayName, isAuto}) => {
					const isChecked = selected.includes(code)
					return (
						<CheckRow
							key={code}
							id={`${sectionId}-${code}`}
							label={displayName}
							checked={isChecked}
							onCheckedChange={() => onToggle(code)}
							meta={
								isAuto ? (
									<Badge variant="info" size="sm">
										{autoBadge}
									</Badge>
								) : null
							}
						/>
					)
				})}
			</div>
		</div>
	)
}
