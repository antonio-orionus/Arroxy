import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Compass, ShieldAlert, type LucideIcon} from 'lucide-react'
import {Alert, AlertDescription, AlertTitle} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {IconTile} from '../shared/IconTile.js'
import {ExplorePreview} from './ExplorePreview.js'

interface ExploreNoticeProps {
	// The active download profile, as the preview's Download split names it.
	ProfileIcon: LucideIcon
	onContinue: () => void
}

// First-run screen. Nothing loads in the Explore view until it is
// acknowledged; a picture of Explore above the text shows what is coming.
export function ExploreNotice({ProfileIcon, onContinue}: ExploreNoticeProps): ReactNode {
	const {t} = useTranslation()
	return (
		<Card variant="glass" className="mx-auto w-full max-w-2xl" data-testid="explore-notice">
			<div className="@container px-5 md:px-6">
				<ExplorePreview ProfileIcon={ProfileIcon} />
			</div>
			<CardHeader className="px-5 md:px-6">
				<div className="flex min-w-0 items-start gap-3">
					<IconTile>
						<Compass />
					</IconTile>
					<div className="min-w-0 flex-1">
						<CardTitle className="text-headline">{t('explore.notice.title')}</CardTitle>
						<CardDescription className="mt-1.5 text-body text-subtle-foreground">{t('explore.notice.body')}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 px-5 md:px-6">
				<Alert variant="warning">
					<ShieldAlert aria-hidden />
					<AlertTitle>{t('explore.notice.riskTitle')}</AlertTitle>
					<AlertDescription>{t('explore.notice.riskBody')}</AlertDescription>
				</Alert>
				<div className="flex justify-end">
					<Button type="button" variant="glow" onClick={onContinue} data-testid="explore-notice-continue">
						{t('explore.notice.continue')}
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
