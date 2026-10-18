import {useEffect, useRef, useState, useSyncExternalStore} from 'react'
import {selectCompactChrome} from '../../store/uiSlice.js'
import {useAppStore} from '../../store/useAppStore.js'
import {needsAttention} from '../queue/queueAttention.js'

export type ProfilesTab = 'download' | 'explore' | 'queue' | 'profiles' | 'settings'
const PROFILE_TABS = ['download', 'explore', 'queue', 'profiles', 'settings'] as const satisfies readonly ProfilesTab[]
const QUEUE_TAB_TIP_STORAGE_KEY = 'arroxy_seen_queue_tab_tip'

function tabFromHash(hash = window.location.hash): ProfilesTab {
	const value = hash.replace(/^#/, '').toLowerCase()
	if (value === 'profile' || value === 'profiles') return 'profiles'
	if (value === 'explore') return 'explore'
	if (value === 'queue') return 'queue'
	if (value === 'setting' || value === 'settings') return 'settings'
	return 'download'
}

function subscribeProfileTabHash(onStoreChange: () => void): () => void {
	window.addEventListener('hashchange', onStoreChange)
	return () => window.removeEventListener('hashchange', onStoreChange)
}

function profileTabSnapshot(): ProfilesTab {
	return tabFromHash()
}

export function isProfilesTab(value: unknown): value is ProfilesTab {
	return typeof value === 'string' && PROFILE_TABS.includes(value as ProfilesTab)
}

function tabHash(tab: ProfilesTab): string {
	if (tab === 'profiles') return '#profiles'
	if (tab === 'explore') return '#explore'
	if (tab === 'queue') return '#queue'
	if (tab === 'settings') return '#settings'
	return '#download'
}

export function selectProfilesTab(tab: ProfilesTab): void {
	window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${tabHash(tab)}`)
	window.dispatchEvent(new Event('hashchange'))
}

// The home's active tab, read from the location hash.
export function useProfilesTabRoute(): {activeTab: ProfilesTab; exploreEnabled: boolean; compact: boolean} {
	const hashTab = useSyncExternalStore(subscribeProfileTabHash, profileTabSnapshot, profileTabSnapshot)
	const exploreEnabled = useAppStore(state => state.settings?.common?.exploreEnabled !== false)
	// With the kill switch on, a stale #explore lands on the URL tab.
	const activeTab: ProfilesTab = hashTab === 'explore' && !exploreEnabled ? 'download' : hashTab
	// Icon-only tabs while browsing in compact layout; the tab check covers the
	// render between leaving Explore and its browser unmounting.
	const compact = useAppStore(selectCompactChrome) && activeTab === 'explore'
	return {activeTab, exploreEnabled, compact}
}

export function useQueueTabSummary(): {queueCount: number; attentionCount: number; queueIsActive: boolean} {
	const queueCount = useAppStore(state => state.queue.length)
	const attentionCount = useAppStore(state => state.queue.filter(needsAttention).length)
	const queueIsActive = useAppStore(state => state.queue.some(item => item.status === 'running' || item.lastStatus?.key === 'movingFiles'))
	return {queueCount, attentionCount, queueIsActive}
}

function hasSeenQueueTabTip(): boolean {
	try {
		return localStorage.getItem(QUEUE_TAB_TIP_STORAGE_KEY) === '1'
	} catch {
		return true
	}
}

function markQueueTabTipSeen(): void {
	try {
		localStorage.setItem(QUEUE_TAB_TIP_STORAGE_KEY, '1')
	} catch {
		// Storage may be unavailable in hardened browser contexts; the cue is non-critical.
	}
}

// The one-time cue pointing at the queue tab, shown once the queue first gains an item.
export function useQueueTabTip({activeTab, initialBrowserMockScenario}: {activeTab: ProfilesTab; initialBrowserMockScenario: string | null}): {queueTabTipVisible: boolean; dismissQueueTabTip: () => void} {
	const queueCount = useAppStore(state => state.queue.length)
	const previousQueueCountRef = useRef(queueCount)
	const [showQueueTabTip, setShowQueueTabTip] = useState(() => initialBrowserMockScenario === 'queue-tab-tip' || (queueCount > 0 && !hasSeenQueueTabTip()))

	// The cue floats below the tab bar, where Explore's native view would paint
	// over it: hold it (unseen) until another tab is active.
	const queueTabTipVisible = showQueueTabTip && activeTab !== 'explore'

	useEffect(() => {
		if (!queueTabTipVisible || initialBrowserMockScenario === 'queue-tab-tip') return
		markQueueTabTipSeen()
	}, [initialBrowserMockScenario, queueTabTipVisible])

	useEffect(() => {
		const previousQueueCount = previousQueueCountRef.current
		previousQueueCountRef.current = queueCount
		if (previousQueueCount !== 0 || queueCount === 0 || hasSeenQueueTabTip()) return
		setShowQueueTabTip(true)
	}, [queueCount])

	return {queueTabTipVisible, dismissQueueTabTip: () => setShowQueueTabTip(false)}
}
