import {useMemo, useRef, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle, Link2, WandSparkles} from 'lucide-react'
import type {BulkUrlRejectReason, DownloadProfileRef} from '@shared/types.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {cn} from '@renderer/lib/utils.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Empty, EmptyDescription, EmptyHeader, EmptyTitle} from '../ui/empty.js'
import {Field, FieldLabel} from '../ui/field.js'
import {Item, ItemActions, ItemContent, ItemGroup, ItemMedia, ItemTitle} from '../ui/item.js'
import {Textarea} from '../ui/textarea.js'
import {useAppStore} from '../../store/useAppStore.js'
import {buildBulkUrlPreview} from './bulkUrlPreview.js'
import {QuickProfileControl} from './QuickProfileControl.js'

export interface BulkUrlDialogActionState {
	acceptedUrls: string[]
	canConfirm: boolean
	raw: string
	close: () => void
}

interface BulkUrlDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	initialRaw?: string
	onEditProfile?: () => void
	onManageProfiles?: () => void
	onNewProfile?: () => void
	renderActions?: (state: BulkUrlDialogActionState) => ReactNode
}

const REJECT_I18N: Record<BulkUrlRejectReason, 'wizard.bulk.reject.duplicate'> = {duplicate: 'wizard.bulk.reject.duplicate'}

export function BulkUrlDialog({open, onOpenChange, initialRaw = '', onEditProfile, onManageProfiles, onNewProfile, renderActions}: BulkUrlDialogProps): ReactNode {
	const {t} = useTranslation()
	const startBulkUrls = useAppStore(state => state.startBulkUrls)
	const quickDownloadUrls = useAppStore(state => state.quickDownloadUrls)
	const quickDownloadStatus = useAppStore(state => state.quickDownloadStatus)
	const setActiveDownloadProfile = useAppStore(state => state.setActiveDownloadProfile)
	const profilesPrefs = useAppStore(state => state.settings?.profiles)
	const [raw, setRaw] = useState(initialRaw)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const preview = useMemo(() => buildBulkUrlPreview(raw), [raw])
	const quickPreparing = quickDownloadStatus === 'preparing'

	function close(): void {
		onOpenChange(false)
	}

	function handleOpenChange(next: boolean): void {
		if (next) setRaw(initialRaw)
		onOpenChange(next)
	}

	function confirm(): void {
		const current = buildBulkUrlPreview(raw)
		if (!current.canConfirm) return
		bulkLogger.info('Bulk URL dialog confirmed', {accepted: current.accepted.length, rejected: current.rejected.length, ignored: current.ignoredCount})
		startBulkUrls(current.acceptedUrls)
		setRaw('')
		onOpenChange(false)
	}

	async function confirmQuick(): Promise<void> {
		const current = buildBulkUrlPreview(raw)
		if (!current.canConfirm || quickPreparing) return
		bulkLogger.info('Bulk URL dialog quick download requested', {accepted: current.accepted.length, rejected: current.rejected.length, ignored: current.ignoredCount})
		await quickDownloadUrls(current.acceptedUrls)
		const nextState = useAppStore.getState()
		if (nextState.quickDownloadStatus === 'queued' || nextState.wizardMode === 'bulk') {
			setRaw('')
			onOpenChange(false)
		}
	}

	function activateProfile(ref: DownloadProfileRef): void {
		void setActiveDownloadProfile(ref)
	}

	function closeAndRun(action: (() => void) | undefined): void {
		close()
		action?.()
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent data-testid="bulk-url-dialog" className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl md:max-w-3xl" initialFocus={() => textareaRef.current}>
				<DialogHeader>
					<DialogTitle>{t('wizard.bulk.title')}</DialogTitle>
					<DialogDescription>{t('wizard.bulk.description')}</DialogDescription>
				</DialogHeader>

				<Field className="gap-2">
					<FieldLabel htmlFor="bulk-url-textarea" className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
						{t('wizard.bulk.textareaLabel')}
					</FieldLabel>
					<Textarea ref={textareaRef} id="bulk-url-textarea" data-testid="bulk-url-textarea" value={raw} onChange={event => setRaw(event.target.value)} placeholder={t('wizard.bulk.textareaPlaceholder')} spellCheck={false} className="min-h-40 resize-y text-sm" />
				</Field>

				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span>
						{t('wizard.bulk.acceptedCount')}{' '}
						<strong className="text-foreground" data-testid="bulk-url-valid-count">
							{preview.accepted.length}
						</strong>
					</span>
					{preview.ignoredCount > 0 ? (
						<span data-testid="bulk-url-ignored-count">
							{t('wizard.bulk.ignoredCount')} <strong className="text-foreground">{preview.ignoredCount}</strong>
						</span>
					) : null}
				</div>

				<div className="max-h-60 overflow-y-auto rounded-md border border-border bg-secondary/50" data-testid="bulk-url-preview">
					{preview.accepted.length === 0 && preview.rejected.length === 0 ? (
						<Empty className="min-h-28 rounded-none border-0 p-4">
							<EmptyHeader>
								<EmptyTitle>{t('wizard.bulk.emptyPreview')}</EmptyTitle>
								<EmptyDescription>{t('wizard.bulk.needsAtLeastOne')}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<ItemGroup className="gap-0 divide-y divide-border" data-size="xs">
							{preview.previewAccepted.map((item, index) => (
								<Item key={item.url} size="xs" className="rounded-none border-0 px-3 py-2">
									<ItemMedia variant="icon" className="text-[var(--brand)]">
										<Link2 />
									</ItemMedia>
									<span className="shrink-0 font-mono text-xs text-muted-foreground">{index + 1}</span>
									<ItemContent className="min-w-0">
										<ItemTitle className="block w-full truncate font-mono text-xs font-normal text-foreground/80">{item.url}</ItemTitle>
									</ItemContent>
									<ItemActions>
										<Badge variant="outline" className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
											{item.kind}
										</Badge>
									</ItemActions>
								</Item>
							))}
							{preview.previewRejected.map(item => (
								<Item key={item.id} size="xs" className="rounded-none border-0 px-3 py-2 text-[var(--color-status-paused)]">
									<ItemMedia variant="icon">
										<AlertTriangle />
									</ItemMedia>
									<ItemContent className="min-w-0">
										<ItemTitle className="block w-full truncate font-mono text-xs font-normal">{item.url}</ItemTitle>
									</ItemContent>
									<ItemActions className="text-xs">{t(REJECT_I18N[item.reason])}</ItemActions>
								</Item>
							))}
							{preview.omittedCount > 0 ? (
								<div className="px-3 py-2 text-center text-xs font-semibold tabular-nums text-muted-foreground" data-testid="bulk-url-preview-omitted">
									+{preview.omittedCount}
								</div>
							) : null}
						</ItemGroup>
					)}
				</div>

				{!preview.canConfirm ? <p className="text-xs text-muted-foreground">{t('wizard.bulk.needsAtLeastOne')}</p> : null}

				{renderActions ? null : (
					<QuickProfileControl
						disabled={!preview.canConfirm || quickPreparing}
						onDownload={() => void confirmQuick()}
						onEditProfile={() => closeAndRun(onEditProfile)}
						onManageProfiles={() => closeAndRun(onManageProfiles)}
						onNewProfile={() => closeAndRun(onNewProfile)}
						onPickProfile={activateProfile}
						preparing={quickPreparing}
						profilesPrefs={profilesPrefs}
						size="compact"
						testIdPrefix="bulk"
					/>
				)}

				<DialogFooter className={cn(renderActions ? 'sm:justify-start' : undefined)}>
					{renderActions ? (
						renderActions({acceptedUrls: preview.acceptedUrls, canConfirm: preview.canConfirm, raw, close})
					) : (
						<>
							<Button type="button" variant="outline" onClick={close}>
								{t('common.cancel')}
							</Button>
							<Button type="button" variant="outline" onClick={confirm} disabled={!preview.canConfirm} data-testid="bulk-url-confirm">
								<WandSparkles data-icon="inline-start" />
								{t('wizard.url.interactiveDownload')}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
