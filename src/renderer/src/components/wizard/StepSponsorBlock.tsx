import {type JSX} from 'react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {Checkbox} from '../ui/checkbox.js'
import {Separator} from '../ui/separator.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {SPONSORBLOCK_CATEGORIES, SPONSORBLOCK_MODES} from '@shared/schemas.js'
import type {SponsorBlockMode} from '@shared/types.js'

const SB_MODE_LABEL_KEYS = {off: 'wizard.sponsorblock.mode.off', mark: 'wizard.sponsorblock.mode.mark', remove: 'wizard.sponsorblock.mode.remove'} as const satisfies Record<SponsorBlockMode, string>

const SB_MODE_HINT_KEYS = {off: 'wizard.sponsorblock.modeHint.off', mark: 'wizard.sponsorblock.modeHint.mark', remove: 'wizard.sponsorblock.modeHint.remove'} as const satisfies Record<SponsorBlockMode, string>

function isSponsorBlockMode(value: string | undefined): value is SponsorBlockMode {
	return value !== undefined && (SPONSORBLOCK_MODES as readonly string[]).includes(value)
}

export function StepSponsorBlock(): JSX.Element {
	const {t} = useTranslation()
	const {wizardSponsorBlockMode, wizardSponsorBlockCategories, setSponsorBlockMode, toggleSponsorBlockCategory, advance, back} = useAppStore()

	const showCategories = wizardSponsorBlockMode !== 'off'

	return (
		<div className="wizard-step flex flex-col gap-1.5" data-testid="step-sponsorblock">
			{/* ── Mode ───────────────────────────────────────── */}
			<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center -mx-1">
				<span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-1 shrink-0">{t('wizard.sponsorblock.modeHeading')}</span>
				<ToggleGroup
					value={[wizardSponsorBlockMode]}
					onValueChange={values => {
						const next = values[0]
						if (isSponsorBlockMode(next)) setSponsorBlockMode(next)
					}}
					aria-label={t('wizard.sponsorblock.modeHeading')}
					spacing={1}
					className="flex-wrap"
				>
					{SPONSORBLOCK_MODES.map(mode => (
						<ToggleGroupItem key={mode} value={mode} className="h-7 px-2 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]">
							{t(SB_MODE_LABEL_KEYS[mode])}
						</ToggleGroupItem>
					))}
				</ToggleGroup>

				<span />
				<p className="text-[11px] text-[var(--text-subtle)] leading-snug">{t(SB_MODE_HINT_KEYS[wizardSponsorBlockMode])}</p>
			</div>

			{/* ── Categories (visible when mode is not off) ── */}
			{showCategories && (
				<>
					<Separator className="bg-border/50 -mx-6 w-auto my-1.5" />
					<div data-testid="sb-categories">
						<p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-2 pt-1 pb-1.5">{t('wizard.sponsorblock.categoriesHeading')}</p>
						<div className="grid grid-cols-3 gap-x-1 gap-y-0.5">
							{SPONSORBLOCK_CATEGORIES.map(cat => {
								const isChecked = wizardSponsorBlockCategories.includes(cat)
								return (
									<label
										key={cat}
										data-testid={`sb-cat-${cat}`}
										className="flex w-full items-center gap-2 h-7 px-2 rounded-md text-sm font-medium transition-colors cursor-pointer hover:bg-accent/60 has-[[data-checked]]:bg-[var(--brand-dim)] has-[[data-checked]]:border-s-2 has-[[data-checked]]:border-[var(--brand)] has-[[data-checked]]:text-[var(--brand)]"
									>
										<Checkbox checked={isChecked} onCheckedChange={() => toggleSponsorBlockCategory(cat)} className="border-[var(--border-strong)] data-checked:border-[var(--brand)] data-checked:bg-[var(--brand)] data-checked:text-white" />
										<span className="flex-1 text-start truncate">{t(`wizard.sponsorblock.cat.${cat}`)}</span>
									</label>
								)
							})}
						</div>
					</div>
				</>
			)}

			<WizardStepFooterActions onBack={back} onContinue={advance} />
		</div>
	)
}
