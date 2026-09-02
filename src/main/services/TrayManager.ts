import path from 'node:path'
import {Tray, Menu, nativeImage, type BrowserWindow} from 'electron'
import {mainT, pluralKey} from '@main/i18n.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import type {QueueItem} from '@shared/types.js'
import type {QueueService} from './QueueService.js'
import type {SupportedLang} from '@shared/i18n/types.js'

function resolveTrayIconPath(): string {
	if (process.env.ELECTRON_RENDERER_URL || !process.resourcesPath) {
		return path.join(import.meta.dirname, '../../build/icon-tray.png')
	}
	return path.join(process.resourcesPath, 'icon-tray.png')
}

export class TrayManager {
	private tray: Tray | null = null
	private throttleTimer: ReturnType<typeof setTimeout> | null = null
	private hotkeyUsable = false

	private readonly onQueueUpdated: (event: {item: QueueItem}) => void
	private readonly onQueueAdded: () => void
	private readonly onQueueRemoved: () => void

	constructor(
		private readonly mainWindow: BrowserWindow,
		private readonly queueService: QueueService,
		private readonly languageRef: {current: SupportedLang},
		private readonly onQuit: () => void = () => {},
		private readonly hotkeyTrigger: {handleTrigger(): void} | null = null
	) {
		this.onQueueUpdated = ({item}) => {
			if (item.status === QUEUE_STATUS.running) {
				this.scheduleMenuRebuild()
			} else {
				this.rebuildMenu()
			}
		}
		this.onQueueAdded = () => {
			this.scheduleMenuRebuild()
		}
		this.onQueueRemoved = () => {
			this.rebuildMenu()
		}
	}

	start(): void {
		const icon = nativeImage.createFromPath(resolveTrayIconPath())
		this.tray = new Tray(icon)
		this.tray.setToolTip(mainT(this.languageRef.current, 'tray.tooltip'))
		this.tray.on('click', () => this.toggleWindow())

		this.queueService.on('updated', this.onQueueUpdated)
		this.queueService.on('added', this.onQueueAdded)
		this.queueService.on('removed', this.onQueueRemoved)

		this.rebuildMenu()
	}

	toggleWindow(): void {
		if (this.mainWindow.isDestroyed()) return
		if (this.mainWindow.isVisible()) {
			this.mainWindow.hide()
		} else {
			this.mainWindow.show()
			this.mainWindow.focus()
		}
	}

	// The "Download from clipboard" tray item only appears while the global
	// hotkey chord is actually registered — a menu item that no-ops would
	// break the no-silent-paths feedback contract.
	setHotkeyUsable(usable: boolean): void {
		if (this.hotkeyUsable === usable) return
		this.hotkeyUsable = usable
		this.rebuildMenu()
	}

	destroy(): void {
		if (this.throttleTimer !== null) {
			clearTimeout(this.throttleTimer)
			this.throttleTimer = null
		}
		this.queueService.removeListener('updated', this.onQueueUpdated)
		this.queueService.removeListener('added', this.onQueueAdded)
		this.queueService.removeListener('removed', this.onQueueRemoved)
		if (this.tray && !this.tray.isDestroyed()) {
			this.tray.destroy()
		}
		this.tray = null
	}

	// Tray balloons are the only OS notification surface the Windows portable
	// build can reach — it registers no AppUserModelID, so Windows drops its
	// toasts (see hotkeyOsNotifier). Returns false when there is no tray, so the
	// caller can fall back to a normal Notification.
	displayBalloon(body: string): boolean {
		if (!this.tray || this.tray.isDestroyed()) return false
		this.tray.displayBalloon({title: 'Arroxy', content: body})
		return true
	}

	private scheduleMenuRebuild(): void {
		if (this.throttleTimer !== null) return
		this.throttleTimer = setTimeout(() => {
			this.throttleTimer = null
			this.rebuildMenu()
		}, 1000)
	}

	private rebuildMenu(): void {
		if (!this.tray || this.tray.isDestroyed()) return
		const lang = this.languageRef.current

		const running = this.queueService.snapshot().filter(i => i.status === QUEUE_STATUS.running)
		const activeCount = running.length
		let statusLabel: string
		if (activeCount === 0) {
			statusLabel = mainT(lang, 'tray.menu.statusIdle')
		} else {
			const avg = Math.round(running.reduce((s, i) => s + i.progressPercent, 0) / activeCount)
			statusLabel = mainT(lang, `tray.menu.${pluralKey('statusActive', activeCount)}`, {count: activeCount, percent: avg})
		}

		const {hotkeyTrigger} = this
		const hotkeyItem = hotkeyTrigger && this.hotkeyUsable ? {label: mainT(lang, 'tray.menu.downloadFromClipboard'), click: () => hotkeyTrigger.handleTrigger()} : null
		const menu = Menu.buildFromTemplate([{label: statusLabel, enabled: false}, {type: 'separator'}, ...(hotkeyItem ? [hotkeyItem] : []), {label: mainT(lang, 'tray.menu.open'), click: () => this.toggleWindow()}, {type: 'separator'}, {label: mainT(lang, 'tray.menu.quit'), click: () => this.onQuit()}])
		this.tray.setContextMenu(menu)
	}
}
