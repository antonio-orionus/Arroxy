import type {ReactNode} from 'react'
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

export function VideoSummaryCard({thumbnail, title, duration, resolution, webpageUrl}: Props): ReactNode {
	const {t} = useTranslation()
	const host = safeHost(webpageUrl)
	const meta = [host, duration !== undefined ? formatDuration(duration) : null, resolution ?? null].filter(Boolean).join(' · ')

	return (
		<div data-slot="video-summary-card" className="wizard-summary-surface flex shrink-0 items-center gap-[10px] rounded-lg px-[12px] py-[9px]">
			<div className="aspect-video w-[68px] flex-shrink-0 overflow-hidden rounded-[5px] border border-[var(--border-strong)] bg-[var(--field-bg)] shadow-[inset_0_1px_0_var(--field-highlight)]">
				{thumbnail ? <img src={thumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="block h-full w-full object-cover" /> : <div className="thumb-shimmer h-full w-full" aria-hidden />}
			</div>
			<div className="flex flex-col gap-[2px] flex-1 min-w-0">
				<p className="text-[14px] font-bold text-foreground leading-snug truncate">{title || t('videoCard.titlePlaceholder')}</p>
				<p className="text-[12px] text-[var(--text-subtle)]">{meta}</p>
			</div>
		</div>
	)
}
