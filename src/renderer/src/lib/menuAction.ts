import {menuActionSchema, type MenuAction} from '@shared/schemas.js'

// The preload bridge cannot bundle zod, so the menu action crosses it as
// `unknown` and is parsed here, where the renderer first consumes it.
export function subscribeMenuActions(onAction: (action: MenuAction) => void): () => void {
	return window.appApi.events.onMenuAction(payload => {
		const action = menuActionSchema.safeParse(payload)
		if (action.success) onAction(action.data)
	})
}
