import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {selectionOrderRows} from '@renderer/lib/selectionOrderRows.js'
import {useAppStore} from '../../../store/useAppStore.js'
import {Badge} from '../../ui/badge.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../../ui/tooltip.js'

// Marks the stream the download profile picked for this video. Hover or focus
// it for the ranks that decided the pick ("Why this one?").
// `closest`: the video can't honour the profile, and this is the nearest stream.
export function ProfileTag({closest = false}: {closest?: boolean}): ReactNode {
	const {t} = useTranslation()
	const order = useAppStore(state => state.wizardSelectionOrder)
	const label = closest ? t('wizard.formats.profile.closestTag') : t('wizard.formats.profile.tag')
	if (!order) {
		return (
			<Badge variant="secondary" size="sm" className="shrink-0" data-testid="profile-pick-tag">
				{label}
			</Badge>
		)
	}
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => (
					<Badge {...props} variant="secondary" size="sm" className="shrink-0 cursor-help" tabIndex={0} aria-label={`${label}. ${t('selectionOrder.whyLabel')}`} data-testid="profile-pick-tag">
						{label}
					</Badge>
				)}
			/>
			<TooltipContent className="max-w-80 flex-col items-start gap-1 text-start leading-snug" data-testid="profile-pick-why">
				<span className="font-medium">{t('selectionOrder.whyTitle')}</span>
				<ol className="flex list-decimal flex-col gap-0.5 ps-4">
					{selectionOrderRows(t, order).map(row => (
						<li key={`${row.label}-${row.reason}`}>
							{row.label} <span className="opacity-70">· {row.reason}</span>
						</li>
					))}
				</ol>
			</TooltipContent>
		</Tooltip>
	)
}
