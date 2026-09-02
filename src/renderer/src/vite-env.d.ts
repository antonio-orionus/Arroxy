/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/react" />

import type {TallyWidget} from '@renderer/lib/tallyWidget.js'

declare global {
	interface Window {
		__arroxyBrowserMockShowStartupSplash?: boolean
		__arroxyMockEmitClipboardUrl?: (url: string) => void
		__NUDGE_DELAY_MS?: number
		Tally?: Partial<TallyWidget>
	}
}
