import {useState, type ReactNode} from 'react'
import {Copy, CopyCheck, X} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import type {UpdateAvailablePayload} from '@shared/types.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Spinner} from '../ui/spinner.js'
import {resolveAction} from './updateBannerAction.js'

interface Props {
	info: UpdateAvailablePayload
	installing: boolean
	installError: string | null
	onInstall: () => void
	onDownload: () => void
	onDismiss: () => void
}

export function UpdateBanner({info, installing, installError, onInstall, onDownload, onDismiss}: Props): ReactNode {
	const {t} = useTranslation()
	const action = resolveAction(info.installChannel, window.platform)
	const [copied, setCopied] = useState(false)

	async function handleCopy(cmd: string): Promise<void> {
		await navigator.clipboard.writeText(cmd)
		setCopied(true)
		setTimeout(() => setCopied(false), 2_000)
	}

	return (
		<div className="banner-slide-in flex h-9 shrink-0 items-center justify-between gap-3 border-b border-border bg-[var(--brand-dim)] px-4" data-testid="update-banner">
			<span className="text-[13px] text-foreground/80 truncate" data-testid="update-banner-message">
				{installError ? (
					<span className="text-destructive font-medium">
						{t('update.installFailed')}: {installError}
					</span>
				) : (
					<>
						<span className="font-semibold text-[var(--brand)]">{t('update.appVersion', {version: info.version})}</span> {t('update.isAvailable')} <span className="text-muted-foreground">{t('update.youHave', {currentVersion: info.currentVersion})}</span>
					</>
				)}
			</span>

			<ButtonGroup className="shrink-0">
				{action.kind === 'install' && (
					<Button type="button" onClick={onInstall} disabled={installing} size="sm" className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90">
						{installing ? <Spinner data-icon="inline-start" /> : null}
						{installing ? t('update.downloading') : installError ? t('update.retry') : t('update.install')}
					</Button>
				)}

				{action.kind === 'download' && (
					<Button type="button" onClick={onDownload} size="sm" className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90">
						{t('update.download')}
					</Button>
				)}

				{action.kind === 'command' && (
					<>
						<code className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-muted text-foreground" data-testid="update-command">
							{action.cmd}
						</code>
						<Button type="button" variant="ghost" size="icon-xs" onClick={() => void handleCopy(action.cmd)} aria-label={copied ? t('update.copied') : t('update.copy')}>
							{copied ? <CopyCheck aria-hidden /> : <Copy aria-hidden />}
						</Button>
					</>
				)}

				<Button type="button" variant="ghost" size="icon-xs" onClick={onDismiss} aria-label={t('update.dismiss')}>
					<X aria-hidden />
				</Button>
			</ButtonGroup>
		</div>
	)
}
