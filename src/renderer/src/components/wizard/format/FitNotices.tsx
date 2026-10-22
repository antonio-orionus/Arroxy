import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Info, TriangleAlert} from 'lucide-react'
import type {FitNotice} from '@shared/profileSelection.js'
import {formatLanguageList} from '../../../lib/subtitleLabel.js'
import {useAppStore} from '../../../store/useAppStore.js'
import {Alert, AlertDescription} from '../../ui/alert.js'

// What of the profile this video can't honour, said out loud: today's presets
// fell back silently, and this is the moment the user should look.
export function FitNotices(): ReactNode {
	const {t, i18n} = useTranslation()
	const notices = useAppStore(state => state.wizardFitNotices)
	const fileTypeReset = useAppStore(state => state.wizardFileTypeReset)
	if (notices.length === 0 && !fileTypeReset) return null

	function message(notice: FitNotice): string {
		switch (notice.kind) {
			case 'video-tier-fallback':
				return t(notice.picked < Number(notice.wanted) ? 'wizard.formats.fit.tierBelowClosest' : 'wizard.formats.fit.tierAbove', {wanted: notice.wanted, picked: notice.picked})
			case 'mp4-unavailable':
				return t('wizard.formats.fit.mp4Unavailable')
			case 'webm-unavailable':
				return t('wizard.formats.fit.webmUnavailable', {codec: notice.blocker})
			case 'no-video':
				return t('wizard.formats.fit.noVideo')
			case 'subtitle-languages-missing':
				return t('wizard.formats.fit.subtitlesMissing', {languages: formatLanguageList(notice.languages, i18n.language, 'conjunction')})
		}
	}

	// "No video, so audio" is a fact, not a problem: it alone gets the calm notice.
	const neutral = !fileTypeReset && notices.every(notice => notice.kind === 'no-video')
	return (
		<Alert variant={neutral ? 'info' : 'warning'} data-testid="fit-notices">
			{neutral ? <Info aria-hidden /> : <TriangleAlert aria-hidden />}
			<AlertDescription className="flex flex-col gap-1">
				{notices.map(notice => (
					<p key={notice.kind} data-testid={`fit-notice-${notice.kind}`}>
						{message(notice)}
					</p>
				))}
				{fileTypeReset ? <p data-testid="file-type-reset-notice">{t('wizard.formats.savesAs.reset', {codec: fileTypeReset.blocker})}</p> : null}
			</AlertDescription>
		</Alert>
	)
}
