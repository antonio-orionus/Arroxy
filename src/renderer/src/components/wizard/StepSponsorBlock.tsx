import {type ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {Separator} from '../ui/separator.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {SPONSORBLOCK_CATEGORIES, SPONSORBLOCK_MODES} from '@shared/schemas.js'
import type {SponsorBlockMode} from '@shared/types.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {CheckRow} from '../shared/CheckRow.js'
import {SPONSOR_BLOCK_MODE_LABEL_KEYS} from '@renderer/lib/outputLabels.js'

const SB_MODE_HINT_KEYS = {off: 'wizard.sponsorblock.modeHint.off', mark: 'wizard.sponsorblock.modeHint.mark', remove: 'wizard.sponsorblock.modeHint.remove'} as const satisfies Record<SponsorBlockMode, string>

function isSponsorBlockMode(value: string | undefined): value is SponsorBlockMode {
	return value !== undefined && (SPONSORBLOCK_MODES as readonly string[]).includes(value)
}

// The SponsorBlock controls: the batch wizard's step and a Review row.
export function SponsorBlockFields(): ReactNode {
	const {t} = useTranslation()
	const {wizardSponsorBlockMode, wizardSponsorBlockCategories, setSponsorBlockMode, toggleSponsorBlockCategory} = useAppStore(
		useShallow(state => ({wizardSponsorBlockMode: state.wizardSponsorBlockMode, wizardSponsorBlockCategories: state.wizardSponsorBlockCategories, setSponsorBlockMode: state.setSponsorBlockMode, toggleSponsorBlockCategory: state.toggleSponsorBlockCategory}))
	)

	const showCategories = wizardSponsorBlockMode !== 'off'

	return (
		<div className="flex flex-col gap-1.5">
			{/* ── Mode ───────────────────────────────────────── */}
			<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center -mx-1">
				<SectionLabel render={<span />} className="px-1 shrink-0">
					{t('wizard.sponsorblock.modeHeading')}
				</SectionLabel>
				<ToggleGroup
					size="sm"
					variant="outline"
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
						<ToggleGroupItem key={mode} value={mode}>
							{t(SPONSOR_BLOCK_MODE_LABEL_KEYS[mode])}
						</ToggleGroupItem>
					))}
				</ToggleGroup>

				<span />
				<p className="text-caption text-subtle-foreground leading-snug">{t(SB_MODE_HINT_KEYS[wizardSponsorBlockMode])}</p>
			</div>

			{/* ── Categories (visible when mode is not off) ── */}
			{showCategories && (
				<>
					<Separator className="bg-border/50 -mx-6 w-auto my-1.5" />
					<div data-testid="sb-categories">
						<SectionLabel className="px-2 pt-1 pb-1.5">{t('wizard.sponsorblock.categoriesHeading')}</SectionLabel>
						<div className="grid grid-cols-3 gap-1">
							{SPONSORBLOCK_CATEGORIES.map(cat => {
								const isChecked = wizardSponsorBlockCategories.includes(cat)
								return <CheckRow key={cat} id={`sb-cat-${cat}-check`} testId={`sb-cat-${cat}`} label={t(`wizard.sponsorblock.cat.${cat}`)} checked={isChecked} onCheckedChange={() => toggleSponsorBlockCategory(cat)} />
							})}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export function StepSponsorBlock(): ReactNode {
	const {advance, back} = useAppStore(useShallow(state => ({advance: state.advance, back: state.back})))
	return (
		<div className="wizard-step wizard-step-column flex flex-col gap-1.5" data-testid="step-sponsorblock">
			<SponsorBlockFields />
			<WizardStepFooterActions onBack={back} onContinue={advance} />
		</div>
	)
}
