import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {LogOut} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Field, FieldDescription, FieldGroup} from '../ui/field.js'
import {Panel} from '../shared/Panel.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'

// Settings → Explore: the kill switch and sign-out. Sign-out is offered once
// Explore has been used (P2-R31): the partition can hold data without a
// sign-in, e.g. after a verified sign-out, and clearing it again is harmless.
// It always asks for a confirmation first.
export function ExploreSettingsPanel(): ReactNode {
	const {t} = useTranslation()
	const {exploreEnabled, canSignOut, setExploreEnabled, signOutOfExplore} = useAppStore(
		useShallow(s => ({exploreEnabled: s.settings?.common?.exploreEnabled !== false, canSignOut: s.settings?.common?.exploreNoticeSeen === true || s.exploreView?.signedIn === true, setExploreEnabled: s.setExploreEnabled, signOutOfExplore: s.signOutOfExplore}))
	)
	const [confirming, setConfirming] = useState(false)

	function signOut(): void {
		setConfirming(false)
		void signOutOfExplore()
	}

	return (
		<Panel testId="explore-settings" title={t('explore.settings.title')} description={t('explore.settings.description')}>
			<FieldGroup className="gap-4">
				<SettingSwitch id="profiles-settings-explore-enabled" label={t('explore.settings.showTab')} description={t('explore.settings.showTabDescription')} checked={exploreEnabled} onCheckedChange={checked => void setExploreEnabled(checked)} testId="explore-settings-enabled" />
				<Field className="gap-1.5">
					<Button type="button" variant="outline" size="sm" disabled={!canSignOut} onClick={() => setConfirming(true)} data-testid="explore-settings-sign-out">
						<LogOut data-icon="inline-start" aria-hidden />
						{t('explore.settings.signOut')}
					</Button>
					<FieldDescription>{t('explore.settings.signOutDescription')}</FieldDescription>
				</Field>
			</FieldGroup>
			<Dialog open={confirming} onOpenChange={setConfirming}>
				<DialogContent showCloseButton={false} data-testid="explore-sign-out-dialog">
					<DialogHeader>
						<DialogTitle>{t('explore.settings.signOutConfirmTitle')}</DialogTitle>
						<DialogDescription>{t('explore.settings.signOutConfirmBody')}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="ghost" onClick={() => setConfirming(false)} data-testid="explore-sign-out-cancel">
							{t('common.cancel')}
						</Button>
						<Button type="button" variant="destructive" onClick={signOut} data-testid="explore-sign-out-confirm">
							{t('explore.settings.signOutConfirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Panel>
	)
}
