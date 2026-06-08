const TALLY_WIDGET_SCRIPT = 'https://tally.so/widgets/embed.js'

export interface TallyPopupOptions {
	layout?: 'default' | 'modal'
	width?: number
	alignLeft?: boolean
	hideTitle?: boolean
	overlay?: boolean
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
	widgetPromise ??= appendTallyScript()
	return widgetPromise
}

function appendTallyScript(): Promise<TallyWidget> {
	return new Promise((resolve, reject) => {
		const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${TALLY_WIDGET_SCRIPT}"]`)
		const script = existingScript ?? document.createElement('script')

		script.addEventListener('load', () => {
			const widget = getTallyWidget()
			if (widget) {
				resolve(widget)
			} else {
				reject(new Error('Tally widget loaded without exposing window.Tally'))
			}
		})
		script.addEventListener('error', () => reject(new Error('Failed to load Tally widget')))

		if (!existingScript) {
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
