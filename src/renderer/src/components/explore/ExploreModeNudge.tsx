import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {TriangleAlert} from 'lucide-react'
import type {CookiesMode} from '@shared/types.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'

export type NudgeMode = Exclude<CookiesMode, 'explore'>

const NUDGE_TEXT_KEY = {off: 'explore.nudge.off', file: 'explore.nudge.file', browser: 'explore.nudge.browser'} as const satisfies Record<NudgeMode, string>

// Shown above the browser while downloads use another identity than the Explore
// sign-in, so it is a warning like the first-run risk alert, not a tip. Takes its own row so the view below never covers it.
export function ExploreModeNudge({mode, onUseExplore, onDismiss}: {mode: NudgeMode; onUseExplore: () => void; onDismiss: () => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<Alert role="status" variant="warning" size="sm" data-testid="explore-mode-nudge" data-mode={mode}>
			<TriangleAlert aria-hidden />
			<AlertDescription>{t(NUDGE_TEXT_KEY[mode])}</AlertDescription>
			<div className="col-start-2 mt-1.5 flex flex-wrap gap-2">
				<Button type="button" size="xs" onClick={onUseExplore}>
					{t('explore.nudge.useExplore')}
				</Button>
				<Button type="button" size="xs" variant="ghost" onClick={onDismiss}>
					{t('explore.nudge.notNow')}
				</Button>
			</div>
		</Alert>
	)
}
