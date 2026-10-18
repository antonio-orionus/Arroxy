import {useEffect, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Compass, Inbox, Link2, Settings, Users, type LucideIcon} from 'lucide-react'
import {cn} from '@renderer/lib/utils.js'
import {Badge} from '../ui/badge.js'
import {TabsList, TabsTrigger} from '../ui/tabs.js'
import downloadingImg from '../../assets/Downloading.png'
import {SpeechBubble} from '../shared/SpeechBubble.js'
import {Hint} from '../shared/Hint.js'
import type {ProfilesTab} from './homeTabRoute.js'

const QUEUE_TAB_TIP_VISIBLE_MS = 5_000
const TAB_TRIGGER_CLASS = 'h-12 rounded-full border-0 text-sm data-active:border-transparent'

// A compact tab bar shows icons only: the label stays for screen readers, and
// the trigger's title names it on hover.
function TabLabel({compact, children}: {compact: boolean; children: string}): ReactNode {
	return <span className={cn(compact && 'sr-only')}>{children}</span>
}

interface HomeTabsListProps {
	compact: boolean
	exploreEnabled: boolean
	exploreNoticeSeen: boolean
	queueCount: number
	attentionCount: number
	queueIsActive: boolean
}

// The home's tab triggers. Compact (while browsing in Explore) shows icons only,
// and the home hands the list to Explore's toolbar instead of the row above.
export function HomeTabsList({compact, exploreEnabled, exploreNoticeSeen, queueCount, attentionCount, queueIsActive}: HomeTabsListProps): ReactNode {
	const {t} = useTranslation()
	return (
		<TabsList variant="line" className="download-home-tabs flex justify-center" aria-label={t('wizard.tabsNavAria')} data-compact={compact ? 'true' : undefined} data-testid="profiles-tabs">
			<HomeTabTrigger value="download" icon={Link2} label={t('wizard.steps.url')} compact={compact} />
			{exploreEnabled ? <ExploreTabTrigger compact={compact} exploreNoticeSeen={exploreNoticeSeen} /> : null}
			<QueueTabTrigger compact={compact} queueCount={queueCount} attentionCount={attentionCount} queueIsActive={queueIsActive} />
			<HomeTabTrigger value="profiles" icon={Users} label={t('wizard.url.tabs.profiles')} compact={compact} />
			<HomeTabTrigger value="settings" icon={Settings} label={t('wizard.url.tabs.settings')} compact={compact} />
		</TabsList>
	)
}

function HomeTabTrigger({compact, icon: Icon, label, value}: {compact: boolean; icon: LucideIcon; label: string; value: ProfilesTab}): ReactNode {
	return (
		<Hint label={compact ? label : undefined}>
			<TabsTrigger value={value} className={TAB_TRIGGER_CLASS}>
				<Icon data-icon="inline-start" aria-hidden />
				<TabLabel compact={compact}>{label}</TabLabel>
			</TabsTrigger>
		</Hint>
	)
}

function ExploreTabTrigger({compact, exploreNoticeSeen}: {compact: boolean; exploreNoticeSeen: boolean}): ReactNode {
	const {t} = useTranslation()
	return (
		<Hint label={compact ? t('explore.tabLabel') : undefined}>
			<TabsTrigger value="explore" className={`explore-tab-trigger ${TAB_TRIGGER_CLASS}`}>
				<Compass data-icon="inline-start" aria-hidden />
				<TabLabel compact={compact}>{t('explore.tabLabel')}</TabLabel>
				{exploreNoticeSeen ? null : (
					<Badge variant="info" size="sm">
						{t('explore.newBadge')}
					</Badge>
				)}
			</TabsTrigger>
		</Hint>
	)
}

function QueueTabTrigger({compact, queueCount, attentionCount, queueIsActive}: {compact: boolean; queueCount: number; attentionCount: number; queueIsActive: boolean}): ReactNode {
	const {t} = useTranslation()
	return (
		// One hint for the tab and its attention badge: nested hints would open together.
		<Hint label={[compact ? t('queue.tabLabel') : null, attentionCount > 0 ? t('queue.attentionBadge', {count: attentionCount}) : null].filter(Boolean).join(' · ')}>
			<TabsTrigger value="queue" data-queue-active={queueIsActive ? 'true' : undefined} className={cn('downloads-tab-trigger', TAB_TRIGGER_CLASS, queueIsActive && 'queue-tab-working')}>
				<Inbox data-icon="inline-start" aria-hidden />
				<TabLabel compact={compact}>{t('queue.tabLabel')}</TabLabel>
				<QueueTabCountBadge queueCount={queueCount} attentionCount={attentionCount} />
			</TabsTrigger>
		</Hint>
	)
}

function QueueTabCountBadge({queueCount, attentionCount}: {queueCount: number; attentionCount: number}): ReactNode {
	const {t} = useTranslation()
	if (attentionCount > 0) {
		return (
			<Badge variant="warning" size="sm" className="download-count-badge ms-0.5 min-w-4 px-1 font-mono" aria-label={t('queue.attentionBadge', {count: attentionCount})} data-testid="downloads-attention-badge">
				{attentionCount}
			</Badge>
		)
	}
	if (queueCount > 0) {
		return (
			<Badge variant="secondary" size="sm" className="download-count-badge ms-0.5 min-w-4 px-1 font-mono">
				{queueCount}
			</Badge>
		)
	}
	return null
}

export function QueueTabFirstRunCue({onDismiss, persistent = false}: {onDismiss: () => void; persistent?: boolean}): ReactNode {
	const {t} = useTranslation()

	useEffect(() => {
		if (persistent) return undefined
		const timeout = window.setTimeout(onDismiss, QUEUE_TAB_TIP_VISIBLE_MS)
		return () => window.clearTimeout(timeout)
	}, [onDismiss, persistent])

	return (
		<div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 flex -translate-x-1/2 justify-center px-3" data-testid="queue-tab-first-run-cue">
			<div className="nudge-in pointer-events-auto flex max-w-[min(20rem,calc(100vw-2rem))] items-end gap-2">
				<img src={downloadingImg} alt="" aria-hidden draggable={false} className="size-10 shrink-0 object-contain" />
				<SpeechBubble tail="top">{t('queue.tabTip')}</SpeechBubble>
			</div>
		</div>
	)
}
