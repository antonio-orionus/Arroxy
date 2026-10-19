import {IPC_CHANNELS} from '@shared/ipc.js'
import {exploreViewStateSchema} from '@shared/schemas.js'
import {exploreNavigateCommandSchema, exploreSetActiveSchema, exploreSetVisibleSchema, exploreSnapshotSchema, exploreViewBoundsSchema} from '@shared/exploreSchemas.js'
import {fail, ok} from '@shared/result.js'
import {EXPLORE_ADDRESS_MAX, isExploreAddress, type ExploreAddressScope} from '@shared/sites/exploreAddress.js'
import log from 'electron-log/main.js'
import {z} from 'zod'
import type {ExploreViewHost} from '@main/services/explore/ExploreViewHost.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {handle} from './utils.js'

const logger = log.scope('explore-ipc')

export interface ExploreHandlerDeps {
	exploreView: Pick<ExploreViewHost, 'addressScope' | 'navigate' | 'setBounds' | 'setVisible' | 'setActive' | 'signOut' | 'getState' | 'capture'>
}

// A typed address the view may load: a web page, never a sign-in, account or
// consent page, no credentials, within the cap.
function addressSchema(scope: ExploreAddressScope): z.ZodType<string> {
	return z
		.string()
		.max(EXPLORE_ADDRESS_MAX)
		.refine(url => isExploreAddress(url, scope), {message: 'Explore does not load that address'})
}

// The host only: a typed URL's path and query can name what the user watches.
function hostOf(raw: string): string {
	try {
		return new URL(raw).hostname
	} catch {
		return ''
	}
}

export function registerExploreHandlers({exploreView}: ExploreHandlerDeps): void {
	const address = addressSchema(exploreView.addressScope)
	handle(IPC_CHANNELS.exploreNavigate, exploreNavigateCommandSchema, async command => {
		if (command.kind === 'address') {
			const checked = address.safeParse(command.url)
			if (!checked.success) {
				logger.info('explore view refused a typed address', {host: hostOf(command.url) || '(none)'})
				return fail(createAppError('validation', checked.error.issues[0]?.message ?? 'address refused'))
			}
		}
		await exploreView.navigate(command)
		return ok(undefined)
	})
	handle(IPC_CHANNELS.exploreSetBounds, exploreViewBoundsSchema, rect => {
		exploreView.setBounds(rect)
		return Promise.resolve(ok(undefined))
	})
	handle(IPC_CHANNELS.exploreSetVisible, exploreSetVisibleSchema, async ({visible}) => {
		await exploreView.setVisible(visible)
		return ok(undefined)
	})
	handle(IPC_CHANNELS.exploreSetActive, exploreSetActiveSchema, ({active}) => {
		exploreView.setActive(active)
		return Promise.resolve(ok(undefined))
	})
	handle(IPC_CHANNELS.exploreSignOut, z.unknown(), async () => {
		await exploreView.signOut()
		return ok(undefined)
	})
	handle(IPC_CHANNELS.exploreGetState, z.unknown(), () => Promise.resolve(ok(exploreViewStateSchema.parse(exploreView.getState()))))
	// Anything but a JPEG data URL within the cap answers null: the renderer
	// then hides the view without a picture. The image is never logged.
	handle(IPC_CHANNELS.exploreCapture, z.unknown(), async () => {
		const snapshot = exploreSnapshotSchema.safeParse(await exploreView.capture())
		return ok(snapshot.success ? snapshot.data : null)
	})
}
