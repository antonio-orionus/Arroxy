const TALLY_WIDGET_SCRIPT = 'https://tally.so/widgets/embed.js'
const TALLY_SCRIPT_STATE_ATTRIBUTE = 'data-arroxy-tally-state'

export interface TallyPopupOptions {
	layout?: 'default' | 'modal'
	width?: number
	alignLeft?: boolean
	hideTitle?: boolean
	overlay?: boolean
	autoClose?: number
	hiddenFields?: Record<string, string | number | boolean | null | undefined>
	onSubmit?: (payload: unknown) => void
}

export interface TallyWidget {
	openPopup(formId: string, options?: TallyPopupOptions): void
}

let widgetPromise: Promise<TallyWidget> | null = null

export async function openTallyPopup(formId: string, options: TallyPopupOptions): Promise<void> {
	const tally = await loadTallyWidget()
	tally.openPopup(formId, options)
}

function loadTallyWidget(): Promise<TallyWidget> {
	const existing = getTallyWidget()
	if (existing) return Promise.resolve(existing)
	widgetPromise ??= appendTallyScript().catch(error => {
		widgetPromise = null
		throw error
	})
	return widgetPromise
}

function appendTallyScript(): Promise<TallyWidget> {
	return new Promise((resolve, reject) => {
		const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${TALLY_WIDGET_SCRIPT}"]`)
		if (existingScript && existingScript.getAttribute(TALLY_SCRIPT_STATE_ATTRIBUTE) !== 'loading') {
			existingScript.remove()
		}
		const script = existingScript?.isConnected && existingScript.getAttribute(TALLY_SCRIPT_STATE_ATTRIBUTE) === 'loading' ? existingScript : document.createElement('script')

		script.addEventListener(
			'load',
			() => {
				script.setAttribute(TALLY_SCRIPT_STATE_ATTRIBUTE, 'loaded')
				const widget = getTallyWidget()
				if (widget) {
					resolve(widget)
				} else {
					reject(new Error('Tally widget loaded without exposing window.Tally'))
				}
			},
			{once: true}
		)
		script.addEventListener(
			'error',
			() => {
				script.setAttribute(TALLY_SCRIPT_STATE_ATTRIBUTE, 'failed')
				script.remove()
				reject(new Error('Failed to load Tally widget'))
			},
			{once: true}
		)

		if (!script.isConnected) {
			script.setAttribute(TALLY_SCRIPT_STATE_ATTRIBUTE, 'loading')
			script.src = TALLY_WIDGET_SCRIPT
			script.async = true
			document.body.appendChild(script)
		}
	})
}

function getTallyWidget(): TallyWidget | null {
	const maybeWindow = window as unknown as {Tally?: Partial<TallyWidget>}
	return typeof maybeWindow.Tally?.openPopup === 'function' ? (maybeWindow.Tally as TallyWidget) : null
}
