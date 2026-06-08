import {type JSX, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Search, X} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Checkbox} from '../ui/checkbox.js'
import {Empty, EmptyDescription, EmptyHeader, EmptyTitle} from '../ui/empty.js'
import {InputGroup, InputGroupAddon, InputGroupInput} from '../ui/input-group.js'
import {Separator} from '../ui/separator.js'
import {WizardFooter} from './WizardFooter.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../ui/tooltip.js'
import {MascotBubble} from '../shared/MascotBubble.js'
import {buildSubtitleList, SUBTITLE_MODE_I18N_KEYS} from '../../lib/subtitleLabel.js'
import loveImg from '../../assets/Love.png'
import {SUBTITLE_FORMATS, SUBTITLE_MODES} from '@shared/schemas.js'

export function StepSubtitles(): JSX.Element {
	const {t, i18n} = useTranslation()
	const {wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleLanguages, wizardSubtitleMode, wizardSubtitleFormat, toggleSubtitleLanguage, setSubtitleMode, setSubtitleFormat, advance, back, skipSubtitles} = useAppStore()

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

	function clearAll(): void {
		for (const {code} of selectedItems) toggleSubtitleLanguage(code)
	}

	const saveModes = SUBTITLE_MODES.map(mode => ({mode, label: t(SUBTITLE_MODE_I18N_KEYS[mode])}))

	return (
		<div className="wizard-step flex flex-col gap-1.5" data-testid="step-subtitles">
			{/* ── Save as / Format — only relevant when subs exist ─ */}
			{hasLangs && (
				<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center -mx-1">
					<span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-1 shrink-0">{t('wizard.subtitles.saveMode.heading')}</span>
					<ToggleGroup
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
							<ToggleGroupItem key={mode} value={mode} className="h-7 px-2 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]">
								{label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>

					{wizardSubtitleMode === 'embed' ? (
						<>
							<span />
							<p data-testid="subtitle-embed-note" className="text-[11px] text-[var(--text-subtle)] leading-snug">
								{t('wizard.subtitles.embedNote')}
							</p>
						</>
					) : (
						<>
							<span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-1 shrink-0">{t('wizard.subtitles.format.heading')}</span>
							<ToggleGroup
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
									<ToggleGroupItem key={fmt} value={fmt} className="h-6 px-2 text-[11px] font-semibold uppercase aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]">
										{fmt.toUpperCase()}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</>
					)}

					{showAutoAssNote && (
						<>
							<span />
							<p data-testid="subtitle-auto-ass-note" className="text-[11px] text-[var(--text-subtle)] leading-snug">
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
								<span className="text-[11px] italic text-[var(--text-subtle)]">{t('wizard.subtitles.noSelected')}</span>
							) : (
								selectedItems.map(({code, displayName}) => (
									<Badge key={code} className="h-6 gap-1 bg-[var(--brand)] ps-2.5 pe-1.5 text-[11px] text-white">
										{displayName}
										<Button
											type="button"
											aria-label={`Remove ${displayName}`}
											onClick={() => {
												toggleSubtitleLanguage(code)
											}}
											variant="ghost"
											size="icon-xs"
											className="size-4 rounded-full p-0 text-white hover:bg-white/20 hover:text-white"
										>
											<X data-icon="inline-start" strokeWidth={3} />
										</Button>
									</Badge>
								))
							)}
						</div>
						<div className="flex items-center gap-2 shrink-0">
							{selectedCount > 0 && <span className="text-[11px] text-[var(--text-subtle)]">{selectedCount}</span>}
							{selectedCount > 0 && (
								<Button type="button" variant="link" size="xs" onClick={clearAll} className="h-auto px-0 text-[11px]">
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

			<WizardFooter
				extraAbove={
					hasLangs ? (
						<div className="flex pt-2">
							<MascotBubble image={loveImg} message={t('wizard.subtitles.mascot')} side="left" />
						</div>
					) : undefined
				}
			>
				<Button variant="ghost" type="button" onClick={back} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
					{t('common.back')}
				</Button>
				{selectedCount > 0 ? (
					<>
						<Button variant="ghost" type="button" onClick={skipSubtitles} className="border-[1.5px] border-[var(--border-strong)] text-foreground hover:bg-accent/60">
							{t('wizard.subtitles.skipSubs')}
						</Button>
						<Tooltip>
							<TooltipTrigger
								render={props => (
									<Button {...props} type="button" onClick={advance} className="shadow-[0_4px_14px_var(--brand-glow)]">
										{t('common.continue')}
									</Button>
								)}
							/>
							<TooltipContent data-testid="subtitle-selected-tooltip">{t('wizard.subtitles.selectedNote', {count: selectedCount})}</TooltipContent>
						</Tooltip>
					</>
				) : (
					<Button type="button" onClick={skipSubtitles} className="shadow-[0_4px_14px_var(--brand-glow)]">
						{hasLangs ? t('wizard.subtitles.skipSubs') : t('wizard.subtitles.skip')}
					</Button>
				)}
			</WizardFooter>
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

function LangSection({label, items, selected, onToggle, autoBadge}: LangSectionProps): JSX.Element | null {
	if (items.length === 0) return null
	return (
		<div>
			<p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-2 pt-1.5 pb-0.5">
				{label} ({items.length})
			</p>
			<div className="grid grid-cols-3 gap-x-1">
				{items.map(({code, displayName, isAuto}) => {
					const isChecked = selected.includes(code)
					return (
						<label
							key={code}
							className="flex h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent/60 has-[[data-checked]]:border-s-2 has-[[data-checked]]:border-[var(--brand)] has-[[data-checked]]:bg-[var(--brand-dim)] has-[[data-checked]]:text-[var(--brand)]"
						>
							<Checkbox checked={isChecked} onCheckedChange={() => onToggle(code)} className="border-[var(--border-strong)] data-checked:border-[var(--brand)] data-checked:bg-[var(--brand)] data-checked:text-white" />
							<span className="flex-1 text-start truncate">{displayName}</span>
							{isAuto && (
								<Badge variant="secondary" className="text-[10px] font-semibold text-[var(--brand)]">
									{autoBadge}
								</Badge>
							)}
						</label>
					)
				})}
			</div>
		</div>
	)
}
