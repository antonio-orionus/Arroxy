import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {LayoutList, X} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {Alert, AlertAction, AlertDescription, AlertTitle} from '../ui/alert.js'
import {Button} from '../ui/button.js'

// One-time callout atop Review for people who downloaded before: Subtitles,
// SponsorBlock, Output and Folder were separate steps, and are now rows on this
// one page. Opening a row counts as having found them.
export function ReviewPageCallout(): ReactNode {
	const {t} = useTranslation()
	const {pending, dismiss} = useAppStore(useShallow(state => ({pending: state.settings !== null && state.settings.common?.reviewCalloutDismissed !== true && (state.settings.common?.successfulDownloadCount ?? 0) > 0, dismiss: state.dismissReviewCallout})))
	if (!pending) return null
	return (
		<Alert variant="info" data-testid="review-page-callout">
			<LayoutList aria-hidden />
			<AlertTitle>{t('wizard.review.callout.title')}</AlertTitle>
			<AlertDescription>{t('wizard.review.callout.body')}</AlertDescription>
			<AlertAction>
				<Button type="button" variant="ghost" size="icon-sm" aria-label={t('titleBar.close')} onClick={() => void dismiss()} data-testid="review-page-callout-dismiss">
					<X />
				</Button>
			</AlertAction>
		</Alert>
	)
}
