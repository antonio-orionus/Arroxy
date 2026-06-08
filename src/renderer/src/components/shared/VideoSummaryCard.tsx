import type {JSX} from 'react'
import {useTranslation} from 'react-i18next'
import {formatDuration} from '@renderer/lib/formatDuration.js'

interface Props {
	thumbnail: string
	title: string
	duration?: number
	resolution?: string
	// Webpage URL the extractor reported for this probe — host part rendered as
	// the meta line's first chunk. Empty pre-probe (e.g. queue items restored
	// before extractor identity was tracked) drops the chunk.
	webpageUrl?: string
}

function safeHost(url: string | undefined): string | null {
	if (!url) return null
	try {
		return new URL(url).hostname
	} catch {
		return null
	}
}

export function VideoSummaryCard({thumbnail, title, duration, resolution, webpageUrl}: Props): JSX.Element {
	const {t} = useTranslation()
	const host = safeHost(webpageUrl)
	const meta = [host, duration !== undefined ? formatDuration(duration) : null, resolution ?? null].filter(Boolean).join(' · ')

	return (
		<div className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-lg border border-border bg-secondary shrink-0">
			<div className="w-[68px] aspect-video rounded-[5px] overflow-hidden border border-border flex-shrink-0 bg-accent">{thumbnail ? <img src={thumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="w-full h-full object-cover block" /> : <div className="thumb-shimmer w-full h-full" aria-hidden />}</div>
			<div className="flex flex-col gap-[2px] flex-1 min-w-0">
				<p className="text-[14px] font-bold text-foreground leading-snug truncate">{title || t('videoCard.titlePlaceholder')}</p>
				<p className="text-[12px] text-[var(--text-subtle)]">{meta}</p>
			</div>
		</div>
	)
}
