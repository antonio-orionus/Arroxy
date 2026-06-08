import {useRef, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {IncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'

interface Props {
	issue: IncompleteCookiesConfigIssue | null
	onDismiss: () => void
	onOpenSettings: () => void
}

export function IncompleteCookiesConfigDialog({issue, onDismiss, onOpenSettings}: Props): ReactNode {
	const {t} = useTranslation()
	const openSettingsButtonRef = useRef<HTMLButtonElement>(null)
	const open = issue !== null

	function handleOpenChange(next: boolean): void {
		if (!next) onDismiss()
	}

	const bodyKey = issue === 'file-missing-path' ? 'wizard.url.cookies.enabledButNoFile' : 'wizard.url.cookies.enabledButNoBrowser'

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{issue ? (
				<DialogContent showCloseButton={false} data-testid="cookies-config-dialog" initialFocus={() => openSettingsButtonRef.current}>
					<DialogHeader>
						<DialogTitle>{t('wizard.url.cookies.sourceLabel')}</DialogTitle>
						<DialogDescription>{t(bodyKey)}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="ghost" onClick={onDismiss} data-testid="cookies-config-dialog-cancel">
							{t('wizard.url.clipboard.dialog.cancelButton')}
						</Button>
						<Button ref={openSettingsButtonRef} type="button" onClick={onOpenSettings} data-testid="cookies-config-dialog-open-settings">
							{t('wizard.formats.cookiesError.openSettingsCta')}
						</Button>
					</DialogFooter>
				</DialogContent>
			) : null}
		</Dialog>
	)
}
