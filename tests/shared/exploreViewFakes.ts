import {EventEmitter} from 'node:events'
import {vi} from 'vite-plus/test'

// Stand-ins for Electron's WebContentsView and its webContents, for the
// ExploreViewHost unit tests. Used from a `vi.mock('electron')` factory, so
// this module must not import electron itself.

type OpenHandler = (details: {url: string}) => {action: 'allow' | 'deny'}

interface FakeImage {
	isEmpty(): boolean
	getSize(): {width: number; height: number}
	toJPEG(quality: number): Buffer
}

// A captured page `width` device px wide; its JPEG bytes name the width and quality it was encoded at.
export function fakeImage(width: number, height: number, empty = false): FakeImage {
	return {isEmpty: () => empty, getSize: () => ({width, height}), toJPEG: quality => Buffer.from(`w${width}q${quality}`)}
}

interface FakeEntry {
	url: string
	title: string
	pageState?: string
}

// How a close that waits for beforeunload ends: at once, vetoed by the page,
// or only when the test calls finishClose().
export type FakeCloseOutcome = 'close' | 'veto' | 'pending'

export class FakeWebContents extends EventEmitter {
	url = ''
	title = ''
	loading = false
	destroyed = false
	back = false
	forward = false
	openHandler: OpenHandler | null = null
	entries: string[] = []
	// The active entry; null means the last one.
	activeIndex: number | null = null
	beforeUnload: FakeCloseOutcome = 'close'
	readonly loadURL = vi.fn((url: string): Promise<void> => {
		this.url = url
		this.entries.push(url)
		this.activeIndex = null
		return Promise.resolve()
	})
	readonly reload = vi.fn()
	readonly stop = vi.fn()
	readonly executeJavaScript = vi.fn()
	readonly setAudioMuted = vi.fn()
	readonly capturePage = vi.fn((): Promise<FakeImage> => Promise.resolve(fakeImage(1600, 1000)))
	readonly close = vi.fn((opts?: {waitForBeforeUnload: boolean}) => {
		if (opts?.waitForBeforeUnload === true && this.beforeUnload === 'veto') {
			this.emit('will-prevent-unload', {preventDefault: vi.fn()})
			return
		}
		if (opts?.waitForBeforeUnload === true && this.beforeUnload === 'pending') return
		this.finishClose()
	})
	readonly navigationHistory = {
		canGoBack: vi.fn(() => this.back),
		canGoForward: vi.fn(() => this.forward),
		goBack: vi.fn(),
		goForward: vi.fn(),
		getActiveIndex: vi.fn(() => this.activeIndex ?? this.entries.length - 1),
		getEntryAtIndex: vi.fn((index: number) => ({url: this.entries[index] ?? '', title: ''})),
		getAllEntries: vi.fn((): FakeEntry[] => this.entries.map(url => ({url, title: '', pageState: `state:${url}`}))),
		removeEntryAtIndex: vi.fn((index: number) => {
			if (index < 0 || index >= this.entries.length - 1) return false
			this.entries.splice(index, 1)
			return true
		}),
		restore: vi.fn((options: {entries: FakeEntry[]; index?: number}): Promise<void> => {
			this.entries = options.entries.map(entry => entry.url)
			this.activeIndex = options.index ?? this.entries.length - 1
			this.url = this.entries[this.activeIndex] ?? ''
			return Promise.resolve()
		})
	}
	// The page let the close through (or a pending one completes).
	finishClose(): void {
		if (this.destroyed) return
		this.destroyed = true
		this.emit('destroyed')
	}
	readonly setWindowOpenHandler = vi.fn((handler: OpenHandler) => {
		this.openHandler = handler
	})
	getURL(): string {
		return this.url
	}
	getTitle(): string {
		return this.title
	}
	isLoading(): boolean {
		return this.loading
	}
	isDestroyed(): boolean {
		return this.destroyed
	}
}

export const views: FakeView[] = []

export class FakeView {
	readonly webContents = new FakeWebContents()
	readonly setBounds = vi.fn()
	readonly setVisible = vi.fn()
	constructor(readonly options: {webPreferences: Record<string, unknown>}) {
		views.push(this)
	}
}
