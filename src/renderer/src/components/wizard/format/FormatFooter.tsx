import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {useAppStore} from '../../../store/useAppStore.js'
import {blockerHintKey, formatStepBlocker} from '../../../store/wizard/singleDownloadReadiness.js'
import {Button} from '../../ui/button.js'
import {Hint} from '../../shared/Hint.js'
import {WizardFooter} from '../WizardFooter.js'
import {SingleDownloadActions} from '../SingleDownloadActions.js'
import {SelectionInfo} from './SelectionInfo.js'
import {FormatFooterWarnings} from './FormatFooterWarnings.js'
import {ProfileEditLine} from '../ProfileEditLine.js'

interface FormatFooterProps {
	view: Pick<FormatSelectionView, 'mode' | 'selectedFilesize' | 'sizesScaledToPart'>
	onBack: () => void
	onContinue: () => void
}

// The highlighted action is Continue to Review, so a user who keeps pressing it
// sees the subtitles, extras, folder and file name before Download. The outline
// Download beside it is the shortcut for those who don't need Review.
export function FormatFooter({view, onBack, onContinue}: FormatFooterProps): ReactNode {
	const {t} = useTranslation()
	const continueBlocker = useAppStore(formatStepBlocker)
	const continueHintKey = blockerHintKey(continueBlocker)
	return (
		<WizardFooter
			extraAbove={
				<>
					<ProfileEditLine />
					<FormatFooterWarnings />
				</>
			}
			info={<SelectionInfo view={view} />}
		>
			<Button variant="outline" type="button" onClick={onBack} data-testid="btn-back">
				{t('common.back')}
			</Button>
			<SingleDownloadActions variant="outline" />
			<Hint label={continueHintKey ? t(continueHintKey) : undefined}>
				<Button variant="glow" type="button" onClick={onContinue} disabled={continueBlocker !== null} focusableWhenDisabled data-testid="btn-format-continue">
					{t('common.continue')}
				</Button>
			</Hint>
		</WizardFooter>
	)
}
