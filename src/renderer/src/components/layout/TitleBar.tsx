import {useEffect, useState, type ReactNode} from 'react'
import {Minus, Share2, Square, Minimize2, X} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import appIcon from '@renderer/assets/App-icon-HQ.png'

const drag: React.CSSProperties = {WebkitAppRegion: 'drag'} as React.CSSProperties
const noDrag: React.CSSProperties = {WebkitAppRegion: 'no-drag'} as React.CSSProperties

const isMac = window.platform === 'darwin'

function ShareButton(): ReactNode {
	const {t} = useTranslation()
	const openShareDialog = useAppStore(s => s.openShareDialog)
	return (
		<button
			type="button"
			aria-label={t('share.footerTooltip')}
			title={t('share.footerTooltip')}
			data-testid="btn-share-titlebar"
			onClick={() => openShareDialog('titlebar')}
			style={noDrag}
			className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded"
		>
			<Share2 size={12} strokeWidth={2} />
		</button>
	)
}

function MacControls({isMaximized}: {isMaximized: boolean}): ReactNode {
	const {t} = useTranslation()
	return (
		<div className="flex items-center gap-1.5" style={noDrag} data-testid="window-controls-mac">
			<button type="button" aria-label={t('titleBar.close')} data-testid="wc-close" onClick={() => void window.appApi.window.close()} className="group w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#e0443e] transition-colors flex items-center justify-center">
				<span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#820005] leading-none">✕</span>
			</button>
			<button type="button" aria-label={t('titleBar.minimize')} data-testid="wc-minimize" onClick={() => void window.appApi.window.minimize()} className="group w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#d4a000] transition-colors flex items-center justify-center">
				<span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#985700] leading-none">−</span>
			</button>
			<button type="button" aria-label={isMaximized ? t('titleBar.restore') : t('titleBar.maximize')} data-testid="wc-maximize" onClick={() => void window.appApi.window.maximize()} className="group w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1aaa2f] transition-colors flex items-center justify-center">
				<span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#006500] leading-none">{isMaximized ? '⊟' : '+'}</span>
			</button>
		</div>
	)
}

function WinLinuxControls({isMaximized}: {isMaximized: boolean}): ReactNode {
	const {t} = useTranslation()
	return (
		<div className="flex items-center" style={noDrag} data-testid="window-controls-win">
			<button type="button" aria-label={t('titleBar.minimize')} data-testid="wc-minimize" onClick={() => void window.appApi.window.minimize()} className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
				<Minus size={10} strokeWidth={2.5} />
			</button>
			<button type="button" aria-label={isMaximized ? t('titleBar.restore') : t('titleBar.maximize')} data-testid="wc-maximize" onClick={() => void window.appApi.window.maximize()} className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
				{isMaximized ? <Minimize2 size={11} strokeWidth={2.5} /> : <Square size={10} strokeWidth={2.5} />}
			</button>
			<button type="button" aria-label={t('titleBar.close')} data-testid="wc-close" onClick={() => void window.appApi.window.close()} className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[var(--color-status-error)] transition-colors">
				<X size={11} strokeWidth={2.5} />
			</button>
		</div>
	)
}

export function TitleBar(): ReactNode {
	const [isMaximized, setIsMaximized] = useState(false)

	useEffect(() => {
		void window.appApi.window.isMaximized().then(setIsMaximized)
		return window.appApi.window.onMaximizedChange(setIsMaximized)
	}, [])

	return (
		<div className={cn('chrome-glass flex h-9 shrink-0 select-none items-center border-b border-border', isMac ? 'pl-3 pr-2' : 'pl-4 pr-0')} style={drag} data-testid="title-bar">
			{isMac && <MacControls isMaximized={isMaximized} />}

			<span className={cn('flex-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground tracking-wide', isMac ? 'justify-center' : 'pl-1')}>
				<img src={appIcon} alt="" width={14} height={14} className="opacity-70" draggable={false} />
				Arroxy
			</span>

			<ShareButton />

			{!isMac && <WinLinuxControls isMaximized={isMaximized} />}
		</div>
	)
}
