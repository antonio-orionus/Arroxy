import {type ComponentType, type ReactNode, type SVGProps} from 'react'
import {useTranslation} from 'react-i18next'
import {Globe2, Info} from 'lucide-react'
import {cn} from '../../lib/utils.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import IconYoutube from '~icons/logos/youtube-icon'
import IconVimeo from '~icons/logos/vimeo-icon'
import IconTwitch from '~icons/logos/twitch'
import IconTiktok from '~icons/logos/tiktok-icon'
import IconSoundcloud from '~icons/logos/soundcloud'
import IconInstagram from '~icons/logos/instagram-icon'
import IconFacebook from '~icons/logos/facebook'
import IconReddit from '~icons/logos/reddit-icon'
import IconDailymotion from '~icons/simple-icons/dailymotion'
import IconBilibili from '~icons/simple-icons/bilibili'

type CapabilityId = 'youtube' | 'any-site'
type CapabilityIcon = ComponentType<SVGProps<SVGSVGElement>>

const POPULAR_SITE_LOGOS: {id: string; Icon: CapabilityIcon; color?: string}[] = [
	{id: 'vimeo', Icon: IconVimeo},
	{id: 'twitch', Icon: IconTwitch},
	{id: 'tiktok', Icon: IconTiktok},
	{id: 'soundcloud', Icon: IconSoundcloud},
	{id: 'instagram', Icon: IconInstagram},
	{id: 'facebook', Icon: IconFacebook},
	{id: 'reddit', Icon: IconReddit},
	{id: 'dailymotion', Icon: IconDailymotion, color: '#00ADEF'},
	{id: 'bilibili', Icon: IconBilibili, color: '#00A1D6'}
]

const FEATURE_GROUPS = [
	{
		id: 'youtube',
		heading: 'wizard.url.features.youtube.heading',
		icon: IconYoutube,
		items: ['wizard.url.features.youtube.video', 'wizard.url.features.youtube.channel', 'wizard.url.features.youtube.playlist', 'wizard.url.features.youtube.short', 'wizard.url.features.youtube.music', 'wizard.url.features.youtube.podcast']
	},
	{id: 'any-site', heading: 'wizard.url.features.anySite.heading', icon: Globe2, items: ['wizard.url.features.anySite.video', 'wizard.url.features.anySite.videoPlaylist', 'wizard.url.features.anySite.musicPlaylist', 'wizard.url.features.always.audioOnly', 'wizard.url.features.always.subtitles']}
] as const satisfies readonly {id: CapabilityId; heading: string; icon: CapabilityIcon; items: readonly string[]}[]

interface SourceCapabilityStripProps {
	className?: string
	testId?: string
	testIdPrefix?: string
}

export function SourceCapabilityStrip({className, testId = 'source-capabilities', testIdPrefix = 'source-capability'}: SourceCapabilityStripProps): ReactNode {
	const {t} = useTranslation()

	return (
		<div className={cn('rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 text-start', className)} data-testid={testId}>
			<p className="text-label uppercase text-[var(--text-subtle)]">{t('wizard.url.features.heading')}</p>
			<div className="mt-2 grid gap-2">
				{FEATURE_GROUPS.map(group => {
					const heading = t(group.heading)
					const items = group.items.map(item => t(item))
					const detailLabel = `${heading}: ${items.join(', ')}`
					return (
						<div key={group.id} className="flex min-w-0 items-center gap-2">
							<CapabilityMark group={group} testIdPrefix={testIdPrefix} />
							<p className="min-w-0 flex-1 truncate text-title text-foreground">{heading}</p>
							<Tooltip>
								<TooltipTrigger
									render={props => (
										<Button {...props} type="button" variant="ghost" size="icon-xs" aria-label={detailLabel} data-testid={`${testIdPrefix}-${group.id}-tip`} className="-my-1 shrink-0 rounded-full text-[var(--text-subtle)] hover:text-foreground">
											<Info aria-hidden />
										</Button>
									)}
								/>
								<TooltipContent data-testid={`${testIdPrefix}-${group.id}-content`} className="max-w-[15rem] flex-wrap items-start justify-start gap-1.5 border border-border bg-popover text-popover-foreground shadow-lg">
									{group.items.map(item => (
										<Badge key={item} variant="outline" className="bg-background/50 px-2 py-0 text-[11px]">
											{t(item)}
										</Badge>
									))}
								</TooltipContent>
							</Tooltip>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function CapabilityMark({group, testIdPrefix}: {group: (typeof FEATURE_GROUPS)[number]; testIdPrefix: string}): ReactNode {
	if (group.id === 'any-site') {
		return (
			<span className="flex shrink-0 items-center gap-1" aria-hidden data-testid={`${testIdPrefix}-any-site-logos`}>
				{POPULAR_SITE_LOGOS.map(({id, Icon, color}) => (
					<Icon key={id} className="size-3.5" style={color ? {color} : undefined} data-testid={`${testIdPrefix}-site-logo-${id}`} />
				))}
			</span>
		)
	}

	const Icon = group.icon
	return <Icon className="size-5 shrink-0" aria-hidden data-testid={`${testIdPrefix}-${group.id}-mark`} />
}
