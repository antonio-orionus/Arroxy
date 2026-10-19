import {useEffect, useRef, type ReactNode, type RefObject} from 'react'
import {useShallow} from 'zustand/react/shallow'
import type {ExploreNavigateCommand, ExploreViewState} from '@shared/types.js'
import {isExploreAdBlockOn} from '@shared/exploreAdBlock.js'
import {isExploreGrabbable} from '@shared/exploreGrab.js'
import {exploreSearchEngineOf} from '@shared/sites/exploreSearch.js'
import {replaceHash} from '@renderer/lib/navigation.js'
import {selectCompactChrome} from '../../store/uiSlice.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Card} from '../ui/card.js'
import {ExploreAddressHint, ExploreAddressHintLive} from './ExploreAddressHint.js'
import {openExploreInteractive, useExploreLinkActions} from './exploreLinkActions.js'
import {ExploreLinkCallout} from './ExploreLinkCallout.js'
import {ExploreModeNudge, type NudgeMode} from './ExploreModeNudge.js'
import {submitExploreAddress} from './exploreAddress.js'
import {ExploreNotice} from './ExploreNotice.js'
import {buildDownloadProfileActionModel} from '../wizard/downloadProfileActions.js'
import {ExploreToolbar, type ExploreProfileMenuActions} from './ExploreToolbar.js'
import {ExploreViewport} from './ExploreViewport.js'

const NO_PAGE: ExploreViewState = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}

const NO_PAGE_AD_BLOCK_ON: ExploreViewState = {...NO_PAGE, adBlock: 'starting'}

// Edit, New and Manage in the profile menu belong to the home (its editor and
// tabs). In compact layout the home's icon-only tab list rides in the toolbar.
type ExploreTabProps = Omit<ExploreProfileMenuActions, 'onPickProfile'> & {compactTabs: ReactNode}

export function ExploreTab(props: ExploreTabProps): ReactNode {
	const noticeSeen = useAppStore(state => state.settings?.common?.exploreNoticeSeen === true)
	const acknowledgeExploreNotice = useAppStore(state => state.acknowledgeExploreNotice)
	const profilesPrefs = useAppStore(state => state.settings?.profiles)
	if (!noticeSeen) {
		const {activeProfile, ActiveIcon} = buildDownloadProfileActionModel(profilesPrefs)
		return <ExploreNotice profileName={activeProfile.name} ProfileIcon={ActiveIcon} onContinue={() => void acknowledgeExploreNotice()} />
	}
	return <ExploreBrowser {...props} />
}

function navigate(command: ExploreNavigateCommand): void {
	void window.appApi.explore.navigate(command)
}

function ExploreBrowser({compactTabs, onEditProfile, onNewProfile, onManageProfiles}: ExploreTabProps): ReactNode {
	const view = useAppStore(s => s.exploreView)
	const adBlockOn = useAppStore(s => isExploreAdBlockOn(s.settings?.common ?? {}))
	const searchEngine = useAppStore(s => exploreSearchEngineOf(s.settings?.common ?? {}))
	// Until main reports the view, the shield follows the setting (on unless turned off).
	const state = view ?? (adBlockOn ? NO_PAGE_AD_BLOCK_ON : NO_PAGE)
	const pointerEntries = useAppStore(s => s.explorePointerEntries)
	const profilesPrefs = useAppStore(s => s.settings?.profiles)
	const setActiveDownloadProfile = useAppStore(s => s.setActiveDownloadProfile)
	const setExploreAdBlock = useAppStore(s => s.setExploreAdBlock)
	const compact = useAppStore(selectCompactChrome)
	const setExploreCompactChrome = useAppStore(s => s.setExploreCompactChrome)
	const {addressHint, setAddressHint} = useAppStore(useShallow(s => ({addressHint: s.exploreAddressHint, setAddressHint: s.setExploreAddressHint})))
	const profiles = buildDownloadProfileActionModel(profilesPrefs)
	const mountedRef = useExploreTabActive()
	const nudgeMode = useExploreModeNudge()
	useExploreLinkActions()
	const {setCookiesMode, dismissExploreModeNudge} = useAppStore(useShallow(s => ({setCookiesMode: s.setCookiesMode, dismissExploreModeNudge: s.dismissExploreModeNudge})))
	// The cookies warning comes first; the callout waits until it is gone.
	const linkCalloutPending = useAppStore(s => s.settings?.common !== undefined && s.settings.common.exploreLinkCalloutDismissed !== true)
	const dismissExploreLinkCallout = useAppStore(s => s.dismissExploreLinkCallout)

	// A Download prepares in the background as a row in Downloads; the page
	// title names the row until the probe knows the video's own.
	function grab(): void {
		void useAppStore.getState().quickDownload({url: state.url, entry: 'explore', title: state.title})
	}

	// A result that lands after the tab was left is dropped: the hint must not come back.
	async function submitAddress(text: string): Promise<boolean> {
		const outcome = await submitExploreAddress(text, searchEngine)
		if (!mountedRef.current) return false
		if (outcome.kind !== 'failed') setAddressHint(outcome.kind === 'hint' ? outcome.hint : null)
		return outcome.kind === 'navigated'
	}

	return (
		<Card variant="glass" size="sm" className="@container min-h-0 flex-1 px-3" data-testid="explore-tab">
			{nudgeMode ? <ExploreModeNudge mode={nudgeMode} onUseExplore={() => void setCookiesMode('explore')} onDismiss={() => void dismissExploreModeNudge(nudgeMode)} /> : null}
			{!nudgeMode && linkCalloutPending ? <ExploreLinkCallout onDismiss={() => void dismissExploreLinkCallout()} /> : null}
			<ExploreToolbar
				state={state}
				pointerEntries={pointerEntries}
				grabbable={isExploreGrabbable(state.url)}
				profiles={profiles}
				profileMenu={{onPickProfile: ref => void setActiveDownloadProfile(ref), onEditProfile, onNewProfile, onManageProfiles}}
				onNavigate={navigate}
				searchEngine={searchEngine}
				onSubmitAddress={submitAddress}
				onAddressEdit={() => setAddressHint(null)}
				onDownload={grab}
				onInteractive={() => openExploreInteractive(state.url)}
				onToggleAdBlock={enabled => void setExploreAdBlock(enabled)}
				compact={compact}
				leading={compactTabs}
				onToggleCompact={next => void setExploreCompactChrome(next)}
			/>
			{addressHint ? <ExploreAddressHint hint={addressHint} onDismiss={() => setAddressHint(null)} /> : null}
			<ExploreAddressHintLive hint={addressHint} />
			<ExploreViewport error={state.error} onRetry={() => navigate({kind: 'reload'})} onOpenSettings={() => replaceHash('settings')} />
		</Card>
	)
}

// The page plays sound only while the Explore tab is the active tab (P2-R32).
// This component is mounted exactly then: leaving the tab, or the wizard
// replacing the home, unmounts it. A dialog over the page only hides the view.
// Leaving also drops the address bar's off-site hint (P2-R45); an edit in
// progress lives in the bar itself and goes with it. While mounted, the app
// chrome may go compact (`selectCompactChrome`).
// Answers whether the tab is still mounted, for results that land late.
function useExploreTabActive(): RefObject<boolean> {
	const mountedRef = useRef(false)
	useEffect(() => {
		mountedRef.current = true
		void window.appApi.explore.setActive(true)
		useAppStore.getState().setExploreBrowsing(true)
		return () => {
			mountedRef.current = false
			void window.appApi.explore.setActive(false)
			useAppStore.getState().setExploreBrowsing(false)
			useAppStore.getState().setExploreAddressHint(null)
		}
	}, [])
	return mountedRef
}

// D6: the first Explore open is marked once (`exploreModeAutoSwitched`), and
// only an `off` found then is switched to `explore`. `file`/`browser`, and any
// `off` chosen after that first open, get a dismissible nudge instead.
function useExploreModeNudge(): NudgeMode | null {
	const {common, markExploreFirstOpen} = useAppStore(useShallow(s => ({common: s.settings?.common, markExploreFirstOpen: s.markExploreFirstOpen})))
	const mode = common?.cookiesMode ?? 'off'
	const firstOpen = common !== undefined && common.exploreModeAutoSwitched !== true
	const pendingAutoSwitch = firstOpen && mode === 'off'
	// A failed write rolls the settings back; retrying on every render would loop.
	const attemptedRef = useRef(false)

	useEffect(() => {
		if (!firstOpen || attemptedRef.current) return
		attemptedRef.current = true
		void markExploreFirstOpen()
	}, [firstOpen, markExploreFirstOpen])

	if (!common || mode === 'explore' || pendingAutoSwitch) return null
	if (common.exploreModeNudgeDismissedFor === mode) return null
	return mode
}
