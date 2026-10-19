import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {LogOut} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Field, FieldDescription, FieldGroup} from '../ui/field.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'
import {Panel} from '../shared/Panel.js'
import {SettingRow} from '../shared/SettingRow.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {isExploreIdleUnloadOn} from '@shared/exploreIdleUnload.js'
import {EXPLORE_SEARCH_ENGINES, type ExploreSearchEngine} from '@shared/schemas.js'
import {exploreSearchEngineName, exploreSearchEngineOf} from '@shared/sites/exploreSearch.js'

function isExploreSearchEngine(value: unknown): value is ExploreSearchEngine {
	return typeof value === 'string' && (EXPLORE_SEARCH_ENGINES as readonly string[]).includes(value)
}

// Settings → Explore: the kill switch, idle unload (off unless turned on), the
// address bar's search engine (DuckDuckGo unless picked), and sign-out. Sign-out is offered once
// Explore has been used (P2-R31): the partition can hold data without a
// sign-in, e.g. after a verified sign-out, and clearing it again is harmless.
// It always asks for a confirmation first.
export function ExploreSettingsPanel(): ReactNode {
	const {t} = useTranslation()
	const {exploreEnabled, idleUnload, searchEngine, canSignOut, setExploreEnabled, setExploreIdleUnload, setExploreSearchEngine, signOutOfExplore} = useAppStore(
		useShallow(s => ({
			exploreEnabled: s.settings?.common?.exploreEnabled !== false,
			idleUnload: s.settings?.common !== undefined && isExploreIdleUnloadOn(s.settings.common),
			searchEngine: exploreSearchEngineOf(s.settings?.common ?? {}),
			canSignOut: s.settings?.common?.exploreNoticeSeen === true || s.exploreView?.signedIn === true,
			setExploreEnabled: s.setExploreEnabled,
			setExploreIdleUnload: s.setExploreIdleUnload,
			setExploreSearchEngine: s.setExploreSearchEngine,
			signOutOfExplore: s.signOutOfExplore
		}))
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
				<SettingSwitch id="profiles-settings-explore-idle-unload" label={t('explore.settings.idleUnload')} description={t('explore.settings.idleUnloadDescription')} checked={idleUnload} disabled={!exploreEnabled} onCheckedChange={checked => void setExploreIdleUnload(checked)} testId="explore-settings-idle-unload" />
				<SettingRow id="profiles-settings-explore-search-engine" label={t('explore.settings.searchEngine')} description={t('explore.settings.searchEngineDescription')} testId="explore-settings-search-engine">
					<Select
						value={searchEngine}
						disabled={!exploreEnabled}
						onValueChange={value => {
							if (isExploreSearchEngine(value)) void setExploreSearchEngine(value)
						}}
					>
						<SelectTrigger size="sm" className="min-w-32" aria-labelledby="profiles-settings-explore-search-engine" data-testid="explore-settings-search-engine-trigger">
							<SelectValue>{(value: unknown) => (isExploreSearchEngine(value) ? exploreSearchEngineName(value) : null)}</SelectValue>
						</SelectTrigger>
						<SelectContent align="end">
							<SelectGroup>
								{EXPLORE_SEARCH_ENGINES.map(engine => (
									<SelectItem key={engine} value={engine} data-testid={`explore-settings-search-engine-${engine}`}>
										{exploreSearchEngineName(engine)}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</SettingRow>
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
