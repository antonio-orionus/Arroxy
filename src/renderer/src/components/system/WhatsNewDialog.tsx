import {ExternalLink, Sparkles} from 'lucide-react'
import {type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ReleaseNotes} from '@shared/releaseNotes.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'

interface Props {
	open: boolean
	notes: ReleaseNotes | null
	onClose: () => void
	onOpenFullNotes: () => void
}

export function WhatsNewDialog({open, notes, onClose, onOpenFullNotes}: Props): ReactNode {
	const {t} = useTranslation()
	if (!notes) return null

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				if (!next) onClose()
			}}
		>
			<DialogContent data-testid="whats-new-dialog" className="overflow-hidden sm:max-w-xl md:max-w-2xl">
				<DialogHeader>
					<div className="flex items-start gap-3 pe-8">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--brand-dim)] text-[var(--brand)] shadow-[0_0_24px_var(--brand-glow)]" aria-hidden>
							<Sparkles />
						</span>
						<div className="min-w-0 flex-1">
							<Badge variant="secondary" className="mb-2 w-fit font-mono text-[10px] tabular-nums">
								v{notes.version}
							</Badge>
							<DialogTitle>{t('releaseNotes.title', {version: notes.version})}</DialogTitle>
							<DialogDescription className="mt-2">{t('releaseNotes.description')}</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div data-testid="whats-new-scroll" className="max-h-[min(28rem,calc(100vh-15rem))] overflow-y-auto rounded-lg border border-border bg-background/40 p-3 sm:p-4">
					<div className="flex flex-col gap-4">
						{notes.intro.length > 0 && (
							<div className="flex flex-col gap-2 text-sm leading-6 text-foreground/85">
								{notes.intro.map(paragraph => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>
						)}

						{notes.sections.map(section => (
							<section key={section.title} className="rounded-lg border border-border bg-muted/30 p-3">
								<h3 className="cn-font-heading text-sm font-semibold text-foreground">{section.title}</h3>
								{section.body.length > 0 && (
									<div className="mt-2 flex flex-col gap-2 text-[13px] leading-5 text-muted-foreground">
										{section.body.map(paragraph => (
											<p key={paragraph}>{paragraph}</p>
										))}
									</div>
								)}
								{section.bullets.length > 0 && (
									<ul className="mt-2 flex flex-col gap-1.5 text-[13px] leading-5 text-muted-foreground">
										{section.bullets.map(bullet => (
											<li key={bullet} className="flex gap-2">
												<span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden />
												<span>{bullet}</span>
											</li>
										))}
									</ul>
								)}
							</section>
						))}
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onOpenFullNotes}>
						{t('releaseNotes.fullNotes')}
						<ExternalLink data-icon="inline-end" aria-hidden />
					</Button>
					<Button type="button" onClick={onClose} className="shadow-[0_4px_14px_var(--brand-glow)]">
						{t('releaseNotes.continue')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
