import type {BrowserWindow} from 'electron'
import log from 'electron-log/main.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {exploreViewStateSchema} from '@shared/schemas.js'
import {exploreLinkActionSchema} from '@shared/exploreSchemas.js'
import type {ExploreLinkAction, ExploreViewState} from '@shared/types.js'

const logger = log.scope('explore-view')

// Main → renderer: the Explore view's state. The host pushes through emit(), so
// unlike the other bridges there is no listener to attach or detach — a
// re-registration just keeps using the same bridge. The state is re-parsed
// through its schema, which drops any key the renderer is not meant to see.
// emit() runs inside webContents callbacks, so a state that does not parse is
// dropped with a warning rather than thrown into Electron's event loop.
export class ExploreEventBridge {
	constructor(private readonly window: BrowserWindow) {}

	emit(state: ExploreViewState): void {
		if (this.window.isDestroyed()) return
		const parsed = exploreViewStateSchema.safeParse(state)
		if (!parsed.success) {
			logger.warn('explore view state dropped: it does not match the schema', {issues: parsed.error.issues.map(issue => issue.path.join('.'))})
			return
		}
		this.window.webContents.send(IPC_CHANNELS.exploreStateChanged, parsed.data)
	}

	// A pick in the page's link menu, for the renderer to run. Parsed like the
	// state: the link came from a web page, and a pick that does not parse is dropped.
	linkAction(action: ExploreLinkAction): void {
		if (this.window.isDestroyed()) return
		const parsed = exploreLinkActionSchema.safeParse(action)
		if (!parsed.success) {
			logger.warn('explore link action dropped: it does not match the schema', {issues: parsed.error.issues.map(issue => issue.path.join('.'))})
			return
		}
		this.window.webContents.send(IPC_CHANNELS.exploreLinkAction, parsed.data)
	}

	// No payload: a bare signal that the pointer entered the native view.
	pointerInView(): void {
		if (this.window.isDestroyed()) return
		this.window.webContents.send(IPC_CHANNELS.explorePointerInView)
	}
}
